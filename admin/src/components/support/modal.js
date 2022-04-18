import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import BackspaceOutlinedIcon from '@material-ui/icons/BackspaceOutlined';
import TextField from '@material-ui/core/TextField';

import SupportSelfHelp from './self-help';
import SupportTopics from './ticket/topics';
import SupportSearchResults from './search-results';
import Sticky from './sticky';
import Helpers from '../../helpers';
import NotPixelgradeTheme from '../not-pixelgrade-theme';

import bodybuilder from 'bodybuilder';

/* global AWS */
import AwsConnector from './aws-es/aws_es_connector'
import _ from 'lodash';

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
		onElasticSearchText: (searchText) => {
			dispatch({type: 'ELASTICSEARCH_SEARCH_TEXT', searchText: searchText})
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
		onElasticSearchOk: () => {
			dispatch({type: 'ELASTICSEARCH_OK'})
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
		onBreadcrumbs: ( breadcrumbs ) => {
			dispatch({ type: 'BREADCRUMBS', breadcrumbs })
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

		this.handleEsSearchTextChange = this.handleEsSearchTextChange.bind(this);
		this.handleBackNavigation = this.handleBackNavigation.bind(this);
		this.handleTicketErrorNavigation = this.handleTicketErrorNavigation.bind(this)
		this.handleSearchFieldReset = this.handleSearchFieldReset.bind(this)
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
						{!_.get(this.props, 'support.es_error', false) &&
							<div className={searchClass} id="docsSearchBox" data-capture="true"
								 data-capture-type="search">
								<TextField
									id="docs-search-field"
									className="search-field"
									fullWidth
									variant="outlined"
									value={_.get(this.props, 'support.esSearchText', '')}
									label={Helpers.parseL10n(_.get(pixassist, 'themeConfig.knowledgeBase.l10n.searchFieldLabel', ''))}
									helperText={Helpers.parseL10n(_.get(pixassist, 'themeConfig.knowledgeBase.l10n.searchFieldHelper', ''))}
									onChange={this.handleEsSearchTextChange}
								/>
								{!!_.get(this.props, 'support.esSearchText', '').length &&
									<IconButton
										className="reset-search-field"
										onClick={this.handleSearchFieldReset}
										aria-label={Helpers.parseL10n(_.get(pixassist, 'themeConfig.knowledgeBase.l10n.searchFieldResetLabel', ''))}>
										<BackspaceOutlinedIcon fontSize="small" color="action"/>
									</IconButton>}
							</div>}
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
										<p className="section__content">{Helpers.parseL10n(_.get(pixassist,'themeConfig.knowledgeBase.l10n.notConnectedContent', '' ))}</p>

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
			credentials: new AWS.Credentials(
				pixassist.themeConfig.eskb.aws.accessKeyId,
				pixassist.themeConfig.eskb.aws.secretAccessKey
			),
			region: pixassist.themeConfig.eskb.aws.region
		});

		// Make sure that there is no error state leftover.
		component.props.onElasticSearchOk()
	}

	handleEsSearchTextChange = (event) => {
		let searchText = event.target.value,
			component = this;

		// Update the value
		component.props.onElasticSearchText(searchText)

		if (searchText.length <= 3) {
			component.props.onBreadcrumbs([])
			// Set the selected to undefined
			component.props.onSelectedItem(undefined);
			component.props.onSelectedSHArticle(undefined);
			component.props.onSupportLoading(false)

			// The Search Box is empty - Dispatch an action to delete the elasticsearch data source.
			component.props.onElasticSearchEmpty()

			return
		}

		// Instantiate the Elasticsearch Client.
		/* global elasticsearch */
		const client = elasticsearch.Client({
			hosts: pixassist.themeConfig.eskb.hosts,
			Connection: AwsConnector,
			connectionClass: AwsConnector,
			apiVersion: '6.8'
		})

		component.props.onSupportLoading(true)

		// Empty the selected item.
		component.props.onSelectedItem(undefined);
		component.props.onSelectedSHArticle(undefined);

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

			// Update the Redux State with the search results
			component.props.onElasticSearchResults( sources );

			component.props.onSupportLoading(false);
		}, function(error){
			console.debug(error);

			component.props.onElasticSearchError()
		});
	};

	handleTabClick = (event, value) => {
		// On switch to Self Help - hide the sticky
		if (value === 'self-help') {
			this.props.onSticky(false);
		} else {
			// Ensure that we have gone through the Topics component (and selected a topic)
			// and through the Ticket component (added a ticket content) - and only then the Sticky should be visible.
			if (!!_.get(this.props, 'support.is_sticky', false) === false
				&& event === 'open-ticket'
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

	/**
	 * A function that clears the ticket error state, so we can navigate back and try to open a ticket again.
	 */
	handleTicketErrorNavigation = () => {
		this.props.onTicketError(undefined)
		// Reset the suggestions so the ticket form will be shown again.
		this.props.onTicketSuggestions(undefined)

		// Hide and reset the sticky question.
		this.props.onSticky(false)
		this.props.onStickyValue(undefined);
	}

	handleSearchFieldReset = () => {
		this.props.onBreadcrumbs(undefined)
		this.props.onSelectedItem(undefined)
		this.props.onSelectedSHArticle(undefined, undefined)
		this.props.onSupportLoading(false)
		this.props.onElasticSearchEmpty()

		this.props.onElasticSearchText('')
	}
}

SupportModalContainer.propTypes = {
	onSupportState: PropTypes.func
};

const SupportModal = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportModalContainer);

export default SupportModal;
