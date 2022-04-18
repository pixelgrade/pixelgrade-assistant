import React from 'react';
import ReactDOM from 'react-dom';
import SupportList from '../list';
import Helpers from '../../../helpers';
import {connect} from 'react-redux';
import bodybuilder from 'bodybuilder'

/* global AWS */
import AwsConnector from './../aws-es/aws_es_connector'
import _ from 'lodash'

// Map state to props
const mapStateToProps = (state) => {
	return { support: state };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSupportLoadingText: ( text ) => {
			dispatch({ type: 'SUPPORT_LOADING_TEXT', loadingText: text })
		},
		onSupportActive: () => {
			dispatch({ type: 'SUPPORT_ON' });
		},
		onSupportClosed: () => {
			dispatch({ type: 'SUPPORT_OFF' });
		},
		onSupportError: ( error, error_text ) => {
			dispatch({ type: 'SUPPORT_ERROR', error: error, error_text: error_text});
		},
		onSticky: ( value ) => {
			dispatch({ type: 'STICKY', value: value });
		},
		onTopicSelect: ( topic ) => {
			dispatch({ type: 'TOPIC_SELECT', topic })
		},
		onTagSelect: ( tag ) => {
			dispatch({ type: 'TAG_SELECT', tag })
		},
		onTicketDescription: (description) => {
			dispatch({ type: 'TICKET_DESCRIPTION', description })
		},
		onTicketDetails: (details) => {
			dispatch({ type: 'TICKET_DETAILS', details })
		},
		onTicketSuggestions: (suggestions) => {
			dispatch({ type: 'TICKET_SUGGESTIONS', suggestions })
		},
		onTicketTitle: (title) => {
			dispatch({ type: 'TICKET_TITLE', title })
		},
		onTicketError: ( error ) => {
			dispatch({ type: 'TICKET_SUBMIT_ERROR', error });
		},
	}
};

class SupportTicketContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
		this.handleDetailsChange = this.handleDetailsChange.bind(this);
		this.renderLoading = this.renderLoading.bind(this);
		this.handleTopicChange = this.handleTopicChange.bind(this);
		this.onTicketState = this.onTicketState.bind(this);
		this.updateLocalState = this.updateLocalState.bind(this);
		this.handleErrorBackClick = this.handleErrorBackClick.bind(this);
		this.handleDisabledClick = this.handleDisabledClick.bind(this);
		this.handleBackNavigation = this.handleBackNavigation.bind(this);
	}

	componentDidMount() {
		if ( _.isUndefined( this.props.support.ticketTitle ) ) {
			this.setState({
				title: _.get(pixassist,'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.title.value', '' ),
			});
		}

		this.updateAWSConfig();
	}

	render() {
		return <div>
				{ ! this.props.support.loadingText ?
				<div>

					{ _.isUndefined( this.props.support.error ) ?
						<h2>{this.props.support.ticketTitle}</h2>
						:
						''
					}

					{ _.isUndefined( this.props.support.ticketSuggestions ) ?
						<div>
							<div className="selected-topic clear notification notification__blue">
								<div className="notification__message">
									<i className="dashicons dashicons-info"></i>{this.props.support.selectedTopic}
								</div>
								<div className="notification__actions">
									<a href="#" className={_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.changeTopic.class', '')} onClick={this.handleTopicChange}>{_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.changeTopic.label', '')}</a>
								</div>
							</div>

							<form className="ticket-form" onSubmit={this.handleSubmit} >
								<div className="form-row">
									<label>{_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.descriptionHeader.value', '')}</label>
									<p className={_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.descriptionInfo.class', '')} dangerouslySetInnerHTML={{__html: _.get(pixassist,'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.descriptionInfo.value', '') }} />
									<input
										type="text"
										ref={(input) => this.input = input}
										onChange = { this.handleDescriptionChange }
										required />
									{!_.isUndefined(this.props.support.ticketDescription) && this.props.support.ticketDescription.length === 0 ?
										<div id="error-description"></div> :''}
								</div>
								<div className="form-row">
									<label>{pixassist.themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.detailsHeader.value}</label>
									<p className={_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.detailsInfo.class', '')} dangerouslySetInnerHTML={{__html: _.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.detailsInfo.value', '') }} />
									<textarea value={this.props.support.ticketDetails} onChange={this.handleDetailsChange} rows="7"></textarea>
								</div>
								<div className={_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.nextButton.class', '')}>
									<div className="ticket-submit-wrapper" onClick={this.handleDisabledClick}>
										<button type="submit" className="btn btn--action" disabled={!_.isUndefined(this.props.support.ticketDescription) && this.props.support.ticketDescription.length === 0 ? 'disabled' : ''} >{_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.ticket.fields.nextButton.label', '')}</button>
									</div>
								</div>
							</form>
						</div>
						:
						<div>
							{ _.isUndefined( this.props.support.error ) && !_.isEmpty(this.props.support.ticketSuggestions) ?
								<p className="entry-content" dangerouslySetInnerHTML={{__html: _.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.searchResults.fields.description.value', '')}} />
								:
								''
							}
							{
								// @todo We treat things quite strangely. Undefined means no errors or success messages, true means error while false means success.
								_.isUndefined( this.props.support.error ) ?
								<SupportList listItems={this.props.support.ticketSuggestions}
								                    data={this.state.data}
								                    ticketTopic={this.props.selectedTopic}
								                    topicTag={this.props.topicTag}
								                    ticketDescription={this.props.support.ticketDescription}
								                    ticketDetails={this.props.support.ticketDetails}
								                    />
								:
								this.props.support.error === true ?
									<div>
										<div className="error">{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.missingTicketDetails', '' ))}</div>
										<a href="#" onClick={this.handleErrorBackClick}>Back to Ticket</a>
									</div>
									:
									this.props.support.error === false ?
										<div className="success">
											<div dangerouslySetInnerHTML={{__html: this.props.support.error_text}}></div>
											<a href="#" onClick={this.handleBackNavigation} >{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.backLabel', '' ))}</a>
										</div>
										:
										''
							}

						</div> }
				</div> :
				<div>
					{this.renderLoading()}
				</div>}
			</div>
	}

	updateAWSConfig() {
		if ( !_.get(pixassist, 'themeConfig.eskb.aws.accessKeyId', false)
			|| !_.get(pixassist, 'themeConfig.eskb.aws.secretAccessKey', false)) {

			return;
		}
		AWS.config.update({
			credentials: new AWS.Credentials(
				pixassist.themeConfig.eskb.aws.accessKeyId,
				pixassist.themeConfig.eskb.aws.secretAccessKey
			),
			region: pixassist.themeConfig.eskb.aws.region
		});
	}

	handleDisabledClick = (event) => {
		let descriptionError = document.getElementById('error-description');

		if (descriptionError && !this.props.support.ticketDetails.length) {
			ReactDOM.render(
				<p>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.missingTicketDescription', '' ))}</p>,
				descriptionError);
		}
 	};

	onTicketState = (state) => {
		this.updateLocalState(state);
	};

	updateLocalState = ($state) => {
		this.setState($state);
	};

	// Handle the click on the Back button from the Ticket Submission error message
	handleErrorBackClick = () => {
		this.props.onTicketSuggestions(undefined);
		this.props.onSupportError(undefined);
		this.props.onTicketError(false);
	};

	handleSubmit = (event) => {
		event.preventDefault();
		let component = this,
			params = {},
			data = {};

		this.props.onSupportLoadingText(true);

		let searchTitle = '';
		if ( ! _.isUndefined( component.props.support.ticketDescription ) && component.props.support.ticketDescription.length > 1 ) {
			// Strip any HTML, just to be sure.
			searchTitle = component.props.support.ticketDescription.replace(/(<([^>]+)>)/gi, '')
			// Strip any URLs, just to be sure.
			searchTitle = searchTitle.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
		}

		let searchDescription = '';
		if ( ! _.isUndefined( component.props.support.ticketDetails ) && component.props.support.ticketDetails > 3 ) {
			// Strip any HTML.
			searchDescription = component.props.support.ticketDetails.replace(/(<([^>]+)>)/gi, '')
			// Strip any URLs.
			searchDescription = searchDescription.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
		}

		if (!searchTitle.length && !searchDescription.length) {
			// If we have nothing to search for, open the sticky with the "Submit ticket" option enabled.
			component.props.onSticky(true)

			component.props.onTicketSuggestions({})
			component.props.onSupportSearching(false)

			return
		}

		// Create a new Custom (Search) Event
		let ticketEvent = new CustomEvent(
			'newTicket',
			{
				detail: {
					type: 'ticket',
					details: {
						ticket_description: component.props.support.ticketDescription,
						ticket_details: component.props.support.ticketDetails,
						timestamp: Date.now() / 1000 | 0
					}
				},
				bubbles: true,
				cancelable: true
			}
		);

		// We will just send the ticket without suggestions when we can't get to the elasticsearch instance.
		if ( !_.get(pixassist, 'themeConfig.eskb.aws.accessKeyId', false)
			|| !_.get(pixassist, 'themeConfig.eskb.aws.secretAccessKey', false)) {

			component.props.onSticky(true);
			let title = Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.searchResults.fields.noResults.value', ''));

			component.props.onTicketTitle(title);
			component.props.onTicketSuggestions(data);
			component.props.onSupportLoadingText(false);

			// Dispatch a new ticket event
			document.getElementById('pixassist-support-button').dispatchEvent(ticketEvent);

			return;
		}

		// Instantiate the Elasticsearch Client.
		/* global elasticsearch */
		const client = elasticsearch.Client({
			hosts: pixassist.themeConfig.eskb.hosts,
			Connection: AwsConnector,
			connectionClass: AwsConnector,
			apiVersion: '6.8'
		})

		// Build the ES query
		let body = bodybuilder()
			.orQuery(
				'multi_match',
				{
					query: searchTitle,
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
					query: searchTitle,
					type: 'most_fields',
					fields: ['post_excerpt_stripped', 'post_excerpt_stripped.raw'],
					boost: 1.2,
					fuzziness: 'AUTO',
					prefix_length: 1,
					cutoff_frequency: 0.01,
				}
			)
			.orQuery(
				'multi_match',
				{
					query: searchTitle + ' ' + searchDescription,
					type: 'most_fields',
					fields: ['post_content_stripped', 'post_content_stripped.raw'],
					cutoff_frequency: 0.01,
					fuzziness: 'AUTO',
				}
			)
			.orQuery(
				'multi_match',
				{
					query: searchTitle + ' ' + searchDescription,
					type: 'best_fields',
					fields: ['post_tags', 'post_categories^1.5'],
					tie_breaker: 0.3,
					cutoff_frequency: 0.01,
					fuzziness: 'AUTO',
					boost: 1.3
				}
			)
			// We want articles from the current theme's group or from the general Themes group.
			.filter('terms', '@group', [pixassist.themeSupports.original_slug, 'themes', 'general'])
			.filter('term', 'post_status', 'publish')
			.build();

		// Make the search via ElasticSearch
		client.search({
			index: Helpers.getESIndex(),
			// Using type is deprecated
			// type: pixassist.themeSupports.original_slug,
			body: body,
		}).then(function (response) {
			ticketEvent.detail.details.suggestions = [];
			data = Helpers.esTrimHits(response.hits.hits, response.hits.max_score);
			let title = '';

			if (data.length < 1) {
				// If we couldn't find any results open the sticky with the submit ticket option enabled
				component.props.onSticky(true);
				title = Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.searchResults.fields.noResults.value', ''));

			} else {
				// Add the suggestion ids to our ticket event
				Object.keys(data).map(function (key, index) {
					ticketEvent.detail.details.suggestions.push(data[key]._id);
				});
				title = Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.searchResults.fields.title.value', ''));
			}

			component.props.onTicketTitle(title);
			component.props.onTicketSuggestions(data);
			component.props.onSupportLoadingText(false);

			// Dispatch a new ticket event
			document.getElementById('pixassist-support-button').dispatchEvent(ticketEvent);
		}, function (error) {
			console.debug(error);
		});

	};

	// @todo Do we really need this as it is bound to each character in the description causing a rerender?
	handleDescriptionChange = (event) => {
		this.props.onTicketDescription(this.input.value);
	};

	// @todo Do we really need this as it is bound to each character in the description causing a rerender?
	handleDetailsChange = (event) => {
		this.props.onTicketDetails(event.target.value);
	};

	renderLoading = () => {
		return <div><h1>🤔 {Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.searchingMessage', '' ))}</h1></div>;
	};

	handleTopicChange = () => {
		// Dispatch an action to save the selected topic in the redux store
		this.props.onTopicSelect(undefined);
		this.props.onTagSelect(undefined);
	}

	handleBackNavigation = () => {
		this.props.onTopicSelect(undefined);
		this.props.onTagSelect(undefined);
		this.props.onTicketDescription(undefined);
		this.props.onTicketDetails(undefined);
	};
}

const SupportTicket = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportTicketContainer);

export default SupportTicket;
