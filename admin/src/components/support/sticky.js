import React from 'react';
import Paper from '@material-ui/core/Paper';
import {connect} from 'react-redux';
import cookie from 'react-cookies';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Helpers from '../../helpers'

// Map state to props
const mapStateToProps = (state) => {
	return { support: state };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSupportLoading: ( is_loading ) => {
			dispatch({ type: 'SUPPORT_LOADING', is_loading: is_loading })
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
		onSupportError: ( error, error_text ) => {
			dispatch({ type: 'SUPPORT_ERROR', error: error, error_text: error_text});
		},
		onSticky: ( value ) => {
			dispatch({ type: 'STICKY', value });
		},
		onStickyValue: (value) => {
			dispatch({ type: 'STICKY_VALUE', value });
		},
		onTopicSelect: ( topic ) => {
			dispatch({ type: 'TOPIC_SELECT', topic })
		},
		onTicketError: ( error ) => {
			dispatch({ type: 'TICKET_SUBMIT_ERROR', error });
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
        }
	}
};

// This is used to show search results before sending a new ticket
class StickyContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.handleSuccessfulHelp = this.handleSuccessfulHelp.bind(this);
		this.handleUnsuccessfulHelp = this.handleUnsuccessfulHelp.bind(this);
		this.handleSubmitTicket = this.handleSubmitTicket.bind(this);
		this.handleCloseSticky = this.handleCloseSticky.bind(this);
	}

	componentDidMount() {
		// If the modal has a Sticky state - initiate that one. The sticky state is kept in the modal so we can store its state when navigating through tabs.
		if ( _.isUndefined( this.props.support.ticketSuggestions ) || !_.size(this.props.support.ticketSuggestions) ) {
			this.props.onStickyValue(false);
		}
	}

	render() {
		let licenseHash = cookie.load('licenseHash');

		return <div>
				<Paper zdepth={1}>
					{ _.isUndefined( this.props.support.sticky_answered ) ?
						<div className="notification__blue notification clear sticky">
							<div className="notification__message">
								{Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.initialQuestion.value', ''))}
							</div>
							<div className="notification__actions">
								<a className="btn btn__dark" data-capture='true' data-capture-type="self-help" data-capture-resolve="1" href="#"  onClick={this.handleSuccessfulHelp}>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpfulYesLabel', 'Y' ))}</a>
								<a className="btn btn__dark" data-capture='true' data-capture-type="self-help" data-capture-resolve="0" href="#"  onClick={this.handleUnsuccessfulHelp}>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpfulNoLabel', 'N' ))}</a>
							</div>
						</div> :
						!!this.props.support.sticky_answered ?
							<div className="notification__green notification clear sticky">
								<div className="notification__message">
									{Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.success.value', ''))}
								</div>
								<div className="notification__actions">
									<a className="btn btn__dark" onClick={this.handleCloseSticky}>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.closeLabel', '' ))}</a>
								</div>
							</div>
							:
							!_.isUndefined( pixassist.themeMod.licenseHash ) || !_.isUndefined( licenseHash ) ?
									<div className="notification__blue notification clear sticky">
										<div className="notification__message">
											{Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.noSuccess.value', ''))}
										</div>
										{ _.isUndefined(this.props.support.ticketError) ?
										<div className="notification__actions">
											<a className={!!this.state.disabled_submit ? "btn btn--disabled btn__dark" : "btn btn__dark"}
											   data-capture='true'
											   onClick={this.handleSubmitTicket}
											   disabled={!!this.state.disabled_submit ? 'disabled' : ''}>
												{!_.isUndefined( this.state.ticketSubmitText ) ? this.state.ticketSubmitText : Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.submitTicket.label', 'Submit ticket'))}
											</a>
											{ !_.isUndefined(this.state.hidden_cancel_submit) && !!this.state.hidden_cancel_submit ?
												''
												:
												<a className="btn btn__dark" onClick={this.handleCancelSubmitTicket}>{Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.cancelSubmitTicket.label', 'Cancel'))}</a>
											}
										</div> :
										<div>{this.props.support.ticketError}</div> }
									</div> :
									<div className="notification__blue notification clear sticky">{Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist.themeConfig, 'knowledgeBase.openTicket.blocks.sticky.fields.notConnected.value', '')))}</div>
					}
				</Paper>
			</div>
	};

	handleUnsuccessfulHelp = () => {
		this.props.onStickyValue(false);
	};

	handleSuccessfulHelp = () => {
		this.props.onStickyValue(true);
	};

	handleSubmitTicket = (event) => {
		event.preventDefault();
		let component = this,
			install_url = '';

		// Disable the submit button on click and hide the cancel button (so we can have enough space)
		this.setState({
			disabled_submit: true,
			hidden_cancel_submit: true,
			ticketSubmitText: Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.ticketSendingLabel', '' ))
		});

		// Check if the license is available in the localized variable. If not - get the one from the cookie
		let license = {};
		if ( ! _.isUndefined( pixassist.themeMod.licenseHash ) && pixassist.themeMod.licenseHash.length > 0) {
			license.hash = pixassist.themeMod.licenseHash;
		} else {
			license = cookie.load('licenseHash');
		}

		if ( !_.isUndefined( license.hash ) ) {
			// Get the current Install URL
			install_url = _.get(pixassist, 'systemStatus.installation.url.value', '');

			let params = {
				subject: component.props.support.ticketDescription,
				topic: component.props.support.selectedTopic,
				details: component.props.support.ticketDetails,
				license_hash: license.hash,
				tag: component.props.support.selectedTag,
				site_url: install_url,
				user_id: parseInt(pixassist.user.pixassist_user_ID),
				theme_slug: pixassist.themeSupports.original_slug,
				hash_id: pixassist.themeSupports.theme_id,
				theme_type: pixassist.themeSupports.theme_type
			};

			Helpers.restOauth1Request(
				pixassist.apiEndpoints.pxm.createTicket.method,
				pixassist.apiEndpoints.pxm.createTicket.url,
				params,
				function (response) {
					if ( response.code !== 'success') {
						// Set the state of the topics component to show error message
						component.props.onSupportError(true, response.message);
						component.props.onStickyValue(undefined);
						component.props.onTicketError(response.message);
					} else {
						// Create a new Custom (Search) Event
						let ticketEvent = new CustomEvent(
							'submitTicket',
							{
								detail: {
									type: 'submit-data',
									ticket_id: response.data.ticket_id
								},
								bubbles: true,
								cancelable: true
							}
						);

						document.getElementById('pixassist-support-button').dispatchEvent(ticketEvent);

						let email_message = Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.emailMessage', '' ));

						if ( ! _.isUndefined(pixassist.user.pixelgrade_user_email)) {
							email_message = '<strong>' + Helpers.decodeHtml(pixassist.user.pixelgrade_user_email) + '</strong> (' + email_message + ')';
						}

						component.handleCloseSticky(event);

						// Set the state of the topics component to show ticket submission, after the closeSticky since it clears everything.
						component.props.onSupportError(false, '<h1>'+Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.ticketSendSuccessTitle', '' ))+'</h1><p>' + Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.ticketSendSuccessContent', '' )) + ' ' + email_message + '</p><p>'+Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.ticketSendSuccessGreeting', '' ))+'</p>')
					}

					return response;
				},function(error) {
					console.log(error)
				}, function(response) {
					// HTTP error status check part of the restRequest promise chain
					// Get the first digit of the status
                    let status = (!_.isUndefined(response.status)) ? parseInt(response.status.toString()[0]) : parseInt(response.code.toString()[0]);
					// If the status is not in the 2xx form - throw exception
					if (status !== 2) {
						// Create an error notice on the Dashboard

						// Check the status is either 4xx or 5xx and throw an exception
						Helpers.checkHttpStatus(status);
					}

					return response;
				}
			);
		}

	};

	handleCancelSubmitTicket = (event) => {
		event.preventDefault();
		let component = this;

		component.handleCloseSticky(event);
	};

	handleCloseSticky = (event) => {
        this.props.onTopicSelect(undefined);
        this.props.onSupportError( undefined, undefined );
        this.props.onSticky(false);
        this.props.onStickyValue(undefined);
        this.props.onTicketError(undefined);
        this.props.onTicketSuggestions(undefined);

        // Clear the ticket details
        this.props.onTicketDescription('');
        this.props.onTicketDetails('');
        this.props.onTicketTitle(undefined);
	};
}

StickyContainer.propTypes = {
	onTicketState: PropTypes.func,
	onModalState: PropTypes.func
}

const Sticky = connect(mapStateToProps, mapDispatchToProps)(StickyContainer);
export default Sticky;
