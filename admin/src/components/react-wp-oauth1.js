import React from 'react';
import qs from 'qs';
import Helpers from '../helpers';
import CircularProgress from '@material-ui/core/CircularProgress';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		session: state
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onLoading: () => {
			dispatch({ type: 'LOADING' });
		},
		onLoadingFinished: () => {
			dispatch({ type: 'LOADING_DONE' });
		},
		onDisconnect: () => {
			dispatch({ type: 'DISCONNECTED' });
		},
		onConnected: () => {
			dispatch({ type: 'CONNECTED' });
		},
		onConnectError: () => {
			dispatch({ type: 'OAUTH_CONNECT_ERROR' });
		},
		onLicenseFound: () => {
			dispatch({ type: 'HAS_LICENSE' });
		},
		onNoLicenseFound: () => {
			dispatch({ type: 'NO_LICENSE' });
		},
		onExpiredLicense: () => {
			dispatch({ type: 'EXPIRED_LICENSE' });
		},
		onValidatedLicense: () => {
			dispatch({ type: 'VALIDATED_LICENSE'});
		},
		onWizard: () => {
			dispatch({ type: 'IS_SETUP_WIZARD' });
		},
		onAvailableNextButton: () => {
			dispatch({ type: 'NEXT_BUTTON_AVAILABLE' })
		},
		onUnAvailableNextButton: () => {
			dispatch({ type: 'NEXT_BUTTON_UNAVAILABLE' })
		},
		onConnectURLReady: ( url, user ) => {
			dispatch({ type: 'CONNECT_URL_READY', url: url, user: user });
		},
		onConnectURLClear: () => {
			dispatch({ type: 'CONNECT_URL_CLEAR', });
		},
		onConnectOauthTokenClear: () => {
			dispatch({ type: 'CONNECT_OAUTH_TOKEN_CLEAR', });
		},
	}
}

/**
 * This component takes care about connecting into our Pixelgrade Shop and read data like license or daily messages
 */
class WPOauth1ButtonContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.state = {};

		// if the user already has the oauth tokens, get them
		if ( ! _.isUndefined( pixassist.user ) ) {
			this.state = { ...pixassist.user, ...this.state };
		}

		this.config = pixassist.themeConfig.authentication;

		// This binding is necessary to make `this` work in the callback
		this.setOauthPopupUrl = this.setOauthPopupUrl.bind(this);
		this.loginClickCallback = this.loginClickCallback.bind(this);
	}

	render() {
		const style = {
			container: {
				position: 'relative',
			},
			refresh: {
				display: 'inline-block',
				position: 'relative',
			},
		};

		if ( this.props.session.loading ) {
			return <div style={style.container}>
					<CircularProgress
						size={180}
						left={0}
						top={10}
						variant='indeterminate'
						color="primary"
						style={style.refresh}
					/>
				</div>
		} else if ( this.props.session.oauth_error === true ) {
			return <span className="btn  btn--action btn--disabled box--error">{_.get(pixassist, 'themeConfig.authentication.loadingError', '')}</span>
		} else if (!_.get( this.props.session, 'connect_url', false)) {
			return <a className="btn  btn--action btn--disabled">{ this.config.loadingPrepare }</a>
		} else {
			return <a className="btn btn--action" onClick={this.loginClickCallback} data-href={this.props.session.connect_url} rel="noreferrer">{this.props.label}</a>
		}
	}

	componentDidMount() {
		let component = this;

		if (!_.get( this.props.session, 'connect_url', false)) {
			component.setOauthPopupUrl();
		}

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', function(event){
			component.setOauthPopupUrl();
		});
	}

	/**
	 * This method sets up the popup url
	 * The first time we get the oauth_tokens we save them as user meta data
	 * After that get these props from db
	 */
	setOauthPopupUrl() {
		let component = this,
			popup_url = false;

		// set the popup url from the cached user meta data
		if ( !!_.get( component.props.session, 'user.oauth_token', false ) && !!_.get( component.props.session, 'user.oauth_token_secret', false ) ) {

			let authorizeData = {
				'oauth_token': component.props.session.user.oauth_token,
				'oauth_token_secret': component.props.session.user.oauth_token_secret,
				'oauth_callback': window.location.href,
				'theme_type': _.get( component.props.session, 'themeType', 'theme'),
				'theme_id': _.get( component.props.session, 'themeId', ''),
				'theme_slug': _.get( component.props.session, 'originalSlug', ''),
				'register_first': '1', // show the registration form first
				'source': 'pixassist',
			}

			popup_url = pixassist.apiBase + 'oauth1/authorize?' + qs.stringify(authorizeData);


			// Dispatch an action that a pop-up url is ready and send over the URL
			component.props.onConnectURLReady( popup_url );

		} else {
			component.props.onConnectURLClear();

			Helpers.restOauth1Request('GET', pixassist.apiBase + 'oauth1/request', {}, function (data) {
				// if our request is correct we will receive a oauth_token and a oauth_token_secret
				if ( typeof data !== 'object' || !_.has(data, 'oauth_token') || !_.has(data, 'oauth_token_secret')) {
					component.props.onConnectError();
					return false;
				}

				let authorizeData = {
					'oauth_token': data.oauth_token,
					'oauth_token_secret': data.oauth_token_secret,
					'oauth_callback': window.location.href,
					'theme_type': _.get( component.props.session, 'themeType', 'theme'),
					'theme_id': _.get( component.props.session, 'themeId', ''),
					'theme_slug': _.get( component.props.session, 'originalSlug', ''),
					'register_first': '1', // show the registration form first
					'source': 'pixassist',
				};

				popup_url = pixassist.apiBase + 'oauth1/authorize?' + qs.stringify(authorizeData);

				// Dispatch an action that a pop-up url is ready and send over the URL
				component.props.onConnectURLReady(
					popup_url,
					{
						oauth_token: data.oauth_token,
						oauth_token_secret: data.oauth_token_secret
					}
				);

				// save the tokens as user metadata
				component.updateUserMeta({
					oauth_token: data.oauth_token,
					oauth_token_secret: data.oauth_token_secret
				});

			}, function (err) {
				component.props.onConnectError();
			}, function(response){ // HTTP Error Callback function
                    // Get the first digit of the status
                    let status = parseInt(response.status.toString()[0]);
                    // If the status is not in the 2xx form - throw exception
                    if (status !== 'undefined' && status !== 2){
						// Create an error notice on the Dashboard
						component.props.createErrorNotice(component, response);

						// Check the status is either 4xx or 5xx and throw an exception
						Helpers.checkHttpStatus(status);
                    }

                    // If it's not an error return the response object
                    return response;
			});
		}
	}

	updateUserMeta($oauth_args ) {
		var data = {
			id: pixassist.user.id,
			oauth_token: $oauth_args.oauth_token,
			oauth_token_secret: $oauth_args.oauth_token_secret
		};

		if ( ! _.isUndefined( $oauth_args.pixelgrade_user_ID ) ) {
			data.pixelgrade_user_ID = $oauth_args.pixelgrade_user_ID;

			let supportButton = document.getElementById('pixassist-support-button');
			if (null !== supportButton) {
				// Create a new Custom (loggedIn) Event
				let logInEvent = new CustomEvent(
					'logIn',
					{
						detail: {
							pixelgrade_user_ID: $oauth_args.pixelgrade_user_ID
						},
						bubbles: true,
						cancelable: true
					}
				);
				// Dispatch a new ticket event
				supportButton.dispatchEvent(logInEvent);
			}
		}

		if ( ! _.isUndefined( $oauth_args.pixelgrade_user_login ) ) {
			data.pixelgrade_user_login = $oauth_args.pixelgrade_user_login;
		}

		if ( ! _.isUndefined( $oauth_args.pixelgrade_user_email ) ) {
			data.pixelgrade_user_email = $oauth_args.pixelgrade_user_email;
		}

		if ( ! _.isUndefined( $oauth_args.pixelgrade_display_name ) ) {
			data.pixelgrade_display_name = $oauth_args.pixelgrade_display_name;
			pixassist.user.pixelgrade_display_name = data.pixelgrade_display_name;
		}

		Helpers.$ajax(
			pixassist.wpRest.endpoint.globalState.set.url,
			pixassist.wpRest.endpoint.globalState.set.method,
			{
				user:data
			},
			null,
			null,
			null,
			false // make it synchronous
		)
	}

	/**
	 * When the user will click on the login link  we need to open a tab, and get the OAuth Verifier key
	 * after the user approves
	 *
	 * @param e
	 * @returns {boolean}
	 */
	loginClickCallback(e) {
		e.preventDefault();

		/** === Helpers === **/

		function gup(name, url) {
			if (!url) {
				url = location.href;
			}
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(url);
			return results == null ? null : results[1];
		}

		var component = this,
			new_window = window.open(this.props.session.connect_url, 'Pixelgrade Assistant'),
			overifier = null,
			errors = null;

		// Fire up the loader.
		component.props.onLoading();

		var pollTimer = window.setInterval(function () {
			try {
				if ( _.isUndefined( new_window ) || _.isUndefined( new_window.document ) ) {
					window.clearInterval(pollTimer);
					component.props.onLoadingFinished();
					return true;
				}

				let new_url = new_window.document.URL;

				if (new_window.closed) {
					window.clearInterval(pollTimer);
				}

				if (new_url.indexOf(window.location.href) === 0) {
					overifier = gup('oauth_verifier', new_window.document.URL);
					errors = gup('errors', new_window.document.URL);

					if ( _.isEmpty(overifier) && !_.isEmpty(errors) ) {
						errors = JSON.parse(window.atob(errors));

						if ( !_.isEmpty(errors) && _.size(errors) && _.includes(errors, 'json_oauth1_invalid_token') ) {
							component.props.onConnectOauthTokenClear();
							component.props.onConnectURLClear();
							component.props.onLoadingFinished();
						}
					} else {
						component.firstTokenExchange(overifier);
					}

					new_window.close();
					window.clearInterval(pollTimer);
				}

			} catch (e) {
				console.log(e);
			}
		}, 2000);

		if (new_window) {
			// Browser has allowed it to be opened
			new_window.focus();

			// // We will also invalidate/delete the temporary token so we don't end up in a dead end with an invalid token
			// // and the user having no way of connecting (he would need to reset the Pixelgrade Assistant data - baaaad!!!).
			// component.updateUserMeta({
			// 	oauth_token: '',
			// 	oauth_token_secret: ''
			// });
		}
	}

	firstTokenExchange(verifier) {
		var component = this;

		Helpers.restOauth1Request('GET', pixassist.apiBase + 'oauth1/access',{
			oauth_verifier: verifier,
			oauth_token: component.props.session.user.oauth_token,
			oauth_token_secret: component.props.session.user.oauth_token_secret,
		}, function (response) {
			let user_meta = {
					oauth_token: response.oauth_token,
					oauth_token_secret: response.oauth_token_secret,
					oauth_verifier: verifier,
				},
				login_state = {
					is_logged: true,
					oauth_token: response.oauth_token,
					oauth_token_secret: response.oauth_token_secret,
				};

			// Update the pixassist variable to hold the oauth details
			pixassist.user.oauth_token = login_state.oauth_token;
			pixassist.user.oauth_token_secret = login_state.oauth_token_secret;

			if ( ! _.isUndefined( response.user_ID ) ) {
				login_state['user_ID'] = response.user_ID;
				user_meta['pixelgrade_user_ID'] = response.user_ID;
				pixassist.user.pixassist_user_ID = response.user_ID;
			}

			if ( ! _.isUndefined( response.user_login ) ) {
				login_state['user_login'] = response.user_login;
				user_meta['pixelgrade_user_login'] = response.user_login;
				pixassist.user.pixelgrade_user_login = response.user_login;
			}

			if ( ! _.isUndefined( response.user_email ) ) {
				login_state['email'] = response.user_email;
				user_meta['pixelgrade_user_email'] = response.user_email;
				pixassist.user.pixelgrade_user_email = response.user_email;
			}

			if ( ! _.isUndefined( response.display_name ) ) {
				login_state['display_name'] = response.display_name;
				user_meta['pixelgrade_display_name'] = response.display_name;
				pixassist.user.pixelgrade_display_name = response.display_name;
			}

			component.props.onLogin(login_state);
			component.updateUserMeta(user_meta);

			// Remove the notification regarding connection lost, if it is visible
			Helpers.removeNotification({notice_id: 'connection_lost'});

		}, function(response){ // HTTP Error Callback function
			// Get the first digit of the status
			let status = (!_.isUndefined(response.status)) ? parseInt(response.status.toString()[0]) : parseInt(response.code.toString()[0]);
			// If the status is not in the 2xx form - throw exception
			if (status !== 'undefined' && status !== 2){
				// Create an error notice on the Dashboard
				component.props.createErrorNotice(component, response);

				// Check the status is either 4xx or 5xx and throw an exception
				Helpers.checkHttpStatus(status);
				component.props.onLoadingFinished();
			}

			// If it's not an error return the response object
			return response;
		}, function (error) {

            component.props.onLoadingFinished();
        });
	}
}

WPOauth1ButtonContainer.propTypes = {
	onLogin: PropTypes.func,
	createErrorNotice: PropTypes.func,
}

const WPOauth1Button = connect(
	mapStateToProps,
	mapDispatchToProps
)(WPOauth1ButtonContainer)

export default WPOauth1Button;
