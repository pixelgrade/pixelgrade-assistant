import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

import SupportSelfHelp from './self-help';
import SupportTopics from './ticket/topics';
import SupportSearchResults from './search-results';
import Sticky from './sticky';
import Helpers from '../../helpers';
import NotPixelgradeTheme from '../not-pixelgrade-theme';

import ElasticsearchClient from 'elasticsearch/src/lib/client';
import bodybuilder from 'bodybuilder';

// We use our own since it uses SigVer4
import httpAmazonESConnector from '../../vendor/http-aws-es/connector';
import _ from 'lodash';

var AWS = require('aws-sdk/global');

function TabContainer(props) {
	return (
		<Typography component="div" style={{ padding: 0 }}>
			{props.children}
		</Typography>
	);
}

TabContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

// Map state to props
const mapStateToProps = (state) => {
	return { support: state };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSupportLoading: ( is_loading ) => {
			dispatch({ type: 'SUPPORT_LOADING', is_loading: is_loading })
		},
		onTabsChange: (value) => {
			dispatch({ type: 'TAB_CHANGE', value});
		},
		onSupportActive: () => {
			dispatch({ type: 'SUPPORT_ON' });
		},
		onSupportClosed: () => {
			dispatch({ type: 'SUPPORT_OFF' });
		},
        onElasticSearchResults: ( es_data ) => {
			dispatch({ type: 'ELASTICSEARCH_RESULTS', es_data: es_data });
		},
        onElasticSearchEmpty: () => {
			dispatch({ type: 'ELASTICSEARCH_EMPTY' });
		},
		onElasticSearchError: () => {
			dispatch({ type: 'ELASTICSEARCH_ERROR' });
		},
		onSupportError: ( error, error_text ) => {
			dispatch({ type: 'SUPPORT_ERROR', error: error, error_text: error_text});
		},
		onSticky: ( value ) => {
			dispatch({ type: 'STICKY', value: value });
		},
        onStickyValue: (value) => {
            dispatch({ type: 'STICKY_VALUE', value });
        },
        onTicketError: ( error ) => {
            dispatch({ type: 'TICKET_SUBMIT_ERROR', error });
        },
		onTopicSelect: ( topic ) => {
			dispatch({ type: 'TOPIC_SELECT', topic })
		},
		onTagSelect: ( tag ) => {
			dispatch({ type: 'TAG_SELECT', tag })
		},
        onSelectedItem: ( item ) => {
            dispatch({ type: 'SELECTED_SH_ITEM', item });
        },
        onSelectedSHArticle: ( article_id, article_content ) => {
            dispatch({ type: 'SELECTED_SELF_HELP_ARTICLE', article_id: article_id, article_content })
        },
        onTicketSuggestions: (suggestions) => {
            dispatch({ type: 'TICKET_SUGGESTIONS', suggestions })
        },
        onTicketTitle: (title) => {
            dispatch({ type: 'TICKET_TITLE', title })
        },
        onTicketDescription: (description) => {
            dispatch({ type: 'TICKET_DESCRIPTION', description })
        },
        onTicketDetails: (details) => {
            dispatch({ type: 'TICKET_DETAILS', details })
        },
	}
};

const styles = {
    inkBar: {
        height: 3,
        marginTop: -3
    },
    tabButton: {
        fontWeight: 600,
        fontSize: 14,
        paddingLeft: 0,
        paddingRight: 0,
        height: 53,
		width: 150,
		color: '#23282d'
    }
};
const style = {
	refresh: {
		float: 'left',
		transform: 'none',
		marginTop: 90,
		marginLeft: 90,
	},
};

var delayTimer;

class SupportModalContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		// init a default state
		this.state = {
			is_pixassist_dashboard: false
		};

		if ( ! _.isUndefined( window.location.search ) && window.location.search.indexOf('pixelgrade_assistant') !== -1 ) {//on pixassist dashboard
			this.state.is_pixassist_dashboard = true;
		}

		this.onAutocompleteUpdate = this.onAutocompleteUpdate.bind(this);
		this.onModalState = this.onModalState.bind(this);
		this.updateLocalState = this.updateLocalState.bind(this);
		this.handleBackNavigation = this.handleBackNavigation.bind(this);
	}

	componentDidMount() {
		let component = this;

		component.updateAWSConfig();

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', function(event){
			component.updateAWSConfig();
		});
	}

	render() {
		let disabledClass = _.get(this.props, 'support.session.has_license', false) && _.get(this.props, 'support.session.is_active', false) ? 'support-enabled' : 'support-disabled';
		let topicsClass = _.get(this.props, 'support.session.has_license', false) && _.get(this.props, 'support.session.is_active', false) ? 'support-enabled' : 'not-allowed';
		let searchClass = _.get(this.props, 'support.session.has_license', false) && _.get(this.props, 'support.session.is_active', false) ? _.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.search.class' , '') : _.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.search.class' , '') + ' not-allowed';

		const activeTab = _.get(this.props, 'support.activeTab', 'self-help');

		return <div id="pixassist-support-modal" className={disabledClass} >
				<Button
					className="tabs__close-btn"
					primary="true"
					onClick={this.props.onSupportClosed}
					aria-label={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.closeLabel', '' ))}
				>
					<CloseIcon />
				</Button>

				<div>
					<Tabs
						className="tabs-container"
						onChange={(event, value) => { this.props.onTabsChange(value); this.handleTabClick(event, value); }}
						value={activeTab}
						indicatorColor="primary"
					>
						<Tab
							label={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.name', ''))}
							value="self-help"
							className="tab__button"
							style={styles.tabButton}
							disableRipple
						/>
						<Tab
							label={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.name', ''))}
							value="open-ticket"
							className="tab__button"
							style={styles.tabButton}
							disableRipple
						/>
					</Tabs>
					{activeTab === "self-help" &&
					<TabContainer>
						{!_.get(this.props, 'support.es_error', false) ?
							<div className={searchClass} id="docsSearchBox" data-capture='true' data-capture-type="search">
								<input
									onChange={this.onAutocompleteUpdate}
									label={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.searchFieldLabel', '' ))}
									placeholder={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.search.fields.placeholder', ''))}
								/>
							</div>
							: ''}
						{_.get(this.props, 'support.is_loading', false) ?
							<CircularProgress
								size={120}
								left={0}
								top={10}
								variant='indeterminate'
								color='primary'
								style={style.refresh}
							/>
							:
							!_.get(this.props, 'support.session.is_pixelgrade_theme', false) ?
								<NotPixelgradeTheme/>
								:
								// Activated License - Show KnowledgeBase
								_.get(this.props, 'support.session.has_license', false) && _.get(this.props, 'support.session.is_active', false) ?

									!_.get(this.props, 'support.es_data', false) ?
										<SupportSelfHelp/>
										:
										<SupportSearchResults searchResults={_.get(this.props, 'support.es_data', false)}/>

								:
								// Not logged in
								!_.get(this.props, 'support.session.has_license', false) && !_.get(this.props, 'support.session.is_logged', false) ?
									<div className="entry-content">
										<div>
										{/* NOT LOGGED IN */}
										<h1 className="section__title"><span className="c-icon  c-icon--large  c-icon--warning" ></span>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.notConnectedTitle', '' ))}</h1>
										<p className="section__content">{Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.notConnectedContent', '' )))}</p>

										<p><a className="btn btn--action" onClick={this.state.is_pixassist_dashboard ? this.props.onSupportClosed : this.handleDashboardRedirect} >{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.dashboardButtonLabel', '' ))}</a></p>
										</div>
									</div>
									:
									''

						}
					</TabContainer>
					}
					{activeTab === "open-ticket" &&
						<TabContainer>
							{ // @todo This logic is very strange since it relies on undefined, false meaning a success message, and true a true error. Damn!
								_.isUndefined(this.props.support.error) ?
									<div className={topicsClass}>
										<SupportTopics/>
										{!!_.get(this.props, 'support.is_sticky', false) === true && _.get(this.props, 'support.activeTab', '') === 'open-ticket' ?
											<Sticky/> : ''}
									</div>
									:
									_.get(this.props, 'support.error', false) === false ?
										<div className="success entry-content">
											<div dangerouslySetInnerHTML={{__html: _.get(this.props, 'support.error_text', '')}}></div>
											<p><a href="#" onClick={this.handleBackNavigation}>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.backToSelfHelpLabel', '' ))}</a></p>
										</div>
										: ''}
						</TabContainer>
					}
				</div>
			</div>
	}

	handleDashboardRedirect = () => {
		window.location.href = pixassist.dashboardUrl;
	}

	updateAWSConfig() {
		let component = this;

		if ( !_.get(pixassist, 'themeConfig.eskb.aws.accessKeyId', false) || !_.get(pixassist, 'themeConfig.eskb.aws.secretAccessKey', false)) {
			// We don't have the credentials to connect.
			component.props.onElasticSearchError();
			return;
		}

		AWS.config.update({
			credentials: new AWS.Credentials(pixassist.themeConfig.eskb.aws.accessKeyId, pixassist.themeConfig.eskb.aws.secretAccessKey),
			region: pixassist.themeConfig.eskb.aws.region
		});
	}

	onModalState = (state) => {
		this.updateLocalState(state);
	};

	updateLocalState = (state) => {
		this.setState(state);
	};

	onAutocompleteUpdate = (event) => {
		let searchText = event.target.value,
			component = this;

		// Instantiate the Elasticsearch Client.
		let client = new ElasticsearchClient({
			hosts: pixassist.themeConfig.eskb.hosts,
			connectionClass: httpAmazonESConnector,
			apiVersion: '6.6'
		});

		// Return the search results
		clearTimeout(delayTimer);

		delayTimer = setTimeout(function () {
			component.props.onSupportLoading(true);

			// Set the selected to undefined
			component.props.onSelectedItem(undefined);
			component.props.onSelectedSHArticle(undefined);

			if (searchText.length > 3) {

				// Create a new Custom (Search) Event
				let searchEvent = new CustomEvent(
					'docsSearch',
					{
						detail: {
							type: 'search',
							details: {
								search_terms: searchText,
								timestamp: Date.now() / 1000 | 0
							}
						},
						bubbles: true,
						cancelable: true
					}
				);

				// Build the ES query
				let body = bodybuilder()
					.orQuery(
						'multi_match',
						{
							query: searchText,
							type: 'most_fields',
							fields: ['post_title', 'post_title.raw'],
							boost: 1.6,
							fuzziness: 'AUTO',
							prefix_length: 1,
							cutoff_frequency: 0.01,
						}
					)
					.orQuery(
						'multi_match',
						{
							query: searchText,
							type: 'most_fields',
							fields: ['post_excerpt_stripped', 'post_excerpt_stripped.raw'],
							fuzziness: 'AUTO',
							boost: 1.2
						}
					)
					.orQuery(
						'multi_match',
						{
							query: searchText,
							type: 'most_fields',
							fields: ['post_content_stripped', 'post_content_stripped.raw'],
							fuzziness: 'AUTO',
							prefix_length: 1,
							cutoff_frequency: 0.01,
						}
					)
					.orQuery(
						'multi_match',
						{
							query: searchText,
							type: 'best_fields',
							fields: ['post_tags', 'post_categories^1.5'],
							tie_breaker: 0.3,
							cutoff_frequency: 0.01,
							prefix_length: 1,
							boost: 1.3
						}
					)
					// We want articles from the current theme's group or from the general Themes group.
					.filter('terms', '@group', [pixassist.themeSupports.original_slug, 'themes', 'general'])
					.filter('term', 'post_status', 'publish')
					.build();

				client.search({
					index: Helpers.getESIndex(),
					body: body
				}).then(function(response){
					let sources = [];
					searchEvent.detail.details.results = [];

					let data = Helpers.esTrimHits(response.hits.hits, response.hits.max_score);

					if (data.length > 0) {
						Object.keys(data).map(function (k, i) {
							sources.push({
								title: data[k]._source.post_title,
								content: data[k]._source.post_content,
								external_url: data[k]._source.external_url,
								id: data[k]._id
							});

							// Track the results and add them to our search event
							searchEvent.detail.details.results.push(data[k]._id);
						});
					}

					document.getElementById('docsSearchBox').dispatchEvent(searchEvent);

                    component.props.onSupportLoading(undefined);
					// Update the Redux State with the search results
					component.props.onElasticSearchResults( sources );

				}, function(error){
					console.debug(error);
				});

			} else {
				component.setState({
					breadcrumbs: undefined,
					selected: undefined,
					article_content: undefined,
					// loading: false,
					// data_source: undefined
				});

				// Dispatch an action to set the loading state to false
				component.props.onSupportLoading(false);

				// The Search Box is Empty - Dispatch an action to delete the elasticsearch data source
				component.props.onElasticSearchEmpty();
			}
		}, 500);
	};

	handleTabClick = (event, value) => {
		// On switch to Self Help - hide the sticky
		if (value === 'self-help') {
			this.props.onSticky(false);
		} else {
			// Ensure that we have gone through the Topics component (and selected a topic) and through the Ticket component (added a ticket content) - and only then the Sticky should be visible.
			if (!!_.get(this.props, 'support.is_sticky', false) === false && event === 'open-ticket'
				&& _.get(this.props, 'support.selectedTopic', false)
				&& _.get(this.props, 'support.ticketDescription', false)){
				// Dispatch an action to set the Sticky's state to true
				this.props.onSticky(true);
			}
		}
	};

	handleBackNavigation = () => {
		this.props.onTopicSelect(undefined);
		this.props.onTagSelect(undefined);
		this.props.onSupportError( undefined, undefined );
		this.props.onSticky(false);
		this.props.onStickyValue(undefined);
        this.props.onTicketError(undefined);
		this.props.onTicketSuggestions(undefined);

		// Clear the ticket details
		this.props.onTicketDescription('');
		this.props.onTicketDetails('');
		this.props.onTicketTitle(undefined);

        // set active tab to self-help
		this.props.onTabsChange('self-help');
	};
}

SupportModalContainer.propTypes = {
	onSupportState: PropTypes.func
};

const SupportModal = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportModalContainer);

export default SupportModal;
