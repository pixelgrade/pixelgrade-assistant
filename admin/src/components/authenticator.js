import React from 'react';
import cookie from 'react-cookies';
import CircularProgress from '@material-ui/core/CircularProgress';
import WPOauth1Button from './react-wp-oauth1';
import Helpers from '../helpers';
import {connect} from 'react-redux';
import { clearState } from '../localStorage';
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		session: state
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		onLoading: () => {
			dispatch({ type: 'LOADING' });
		},
		onLoadingLicenses: () => {
			dispatch({ type: 'LOADING_LICENSES' });
		},
		onLoadingFinished: () => {
			dispatch({ type: 'LOADING_DONE' });
		},
		onDisconnect: () => {
			dispatch({ type: 'DISCONNECTED' });
		},
		onConnected: ( user ) => {
			dispatch({ type: 'CONNECTED', user: user });
		},
		onLicenseFound: () => {
			dispatch({ type: 'HAS_LICENSE' });
		},
		onNoLicenseFound: () => {
			dispatch({ type: 'NO_LICENSE' });
		},
		onExpiredLicense: ( license ) => {
			dispatch({ type: 'EXPIRED_LICENSE', license: license});
		},
		onValidatedLicense: ( license ) => {
			dispatch({ type: 'VALIDATED_LICENSE', license: license});
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
		onConnectError: () => {
			dispatch({ type: 'OAUTH_CONNECT_ERROR' });
		},
		onUpdatedThemeMod: () => {
			dispatch({ type: 'ON_UPDATED_THEME_MOD' });
		},
		onUpdatedLocalized: () => {
			dispatch({ type: 'ON_UPDATED_LOCALIZED' });
		}
	}
};

/**
 * This component takes care about connecting into our Pixelgrade Shop and read data like license or daily messages
 */
class AuthenticatorContainer extends React.Component {
	constructor(props) {
		// this makes the this
		super(props);

		this.state = {};
		this.config = pixassist.themeConfig.authentication;

		if ( ! _.isUndefined( this.props.title ) ) {
			this.state.title = Helpers.replaceParams(this.props.title);
		} else {
			this.state.title = Helpers.replaceParams(this.config.title);
		}

		if ( ! _.isUndefined( this.props.validatedContent ) ) {
			this.state.validatedContent = Helpers.replaceParams(this.props.validatedContent);
		} else {
			this.state.validatedContent = Helpers.replaceParams(this.config.validatedContent);
		}

		if ( ! _.isUndefined( this.props.notValidatedContent ) ) {
			this.state.notValidatedContent = Helpers.replaceParams(this.props.notValidatedContent);
		} else {
			this.state.notValidatedContent = Helpers.replaceParams(this.config.notValidatedContent);
		}

		if ( ! _.isUndefined( this.props.loadingContent ) ) {
			this.state.loadingContent = Helpers.replaceParams(this.props.loadingContent);
		} else {
			this.state.loadingContent = Helpers.replaceParams(this.config.loadingContent);
		}

		if ( ! _.isUndefined( this.props.loadingTitle ) ) {
			this.state.loadingTitle = Helpers.replaceParams(this.props.loadingTitle);
		} else {
			this.state.loadingTitle = Helpers.replaceParams(this.config.loadingTitle);
		}

		// Mark the fact that we have not auto retried to validate the license
		// This way we avoid infinite loops
		this.state.auto_retried_validation = false;

		// This binding is necessary to make `this` work in the callback
		this.onLogin = this.onLogin.bind(this);
		this.restGetThemeLicense = this.restGetThemeLicense.bind(this);

		this.retryValidation = this.retryValidation.bind(this);
		this.licenseActivation = this.licenseActivation.bind(this);

		this.createErrorNotice = this.createErrorNotice.bind(this);

		this.getComponentDetails = this.getComponentDetails.bind(this);
	}

	componentDidMount = () => {
		if (_.get(this.props, 'session.is_pixelgrade_theme', false)) {
			// If the theme's directory have been changed throw a notice
			if (!this.props.session.hasOriginalDirName) {
				Helpers.pushNotification({
					notice_id: 'theme_directory_changed',
					title: '😭 ' + Helpers.decodeHtml(pixassist.themeConfig.l10n.themeDirectoryChangedTitle),
					content: Helpers.decodeHtml(pixassist.themeConfig.l10n.themeDirectoryChanged),
					type: 'error',
				});
			}

			// If the theme's name has been changed throw a notice
			if (!this.props.session.hasOriginalStyleName) {
				let content = pixassist.themeSupports.is_child ? pixassist.themeConfig.l10n.childThemeNameChanged : pixassist.themeConfig.l10n.themeNameChanged;

				Helpers.pushNotification({
					notice_id: 'theme_name_changed',
					title: '😱 ' + Helpers.decodeHtml(pixassist.themeConfig.l10n.themeNameChangedTitle),
					content: Helpers.decodeHtml(content),
					type: 'error'
				});
			}
		}

		// If the user has been forced disconnected we should let him know
		if ( this.props.session.user.force_disconnected ) {
			Helpers.pushNotification({
				notice_id: 'connection_lost',
				title: '🤷 👀 ' + Helpers.replaceParams(Helpers.decodeHtml(pixassist.themeConfig.l10n.connectionLostTitle)),
				content: Helpers.replaceParams(Helpers.decodeHtml(pixassist.themeConfig.l10n.connectionLost)),
				type: 'warning',
			});
		}

		// If we're in the setup wizard - render a slightly different page
		if ( window.location.search.indexOf('setup-wizard') > -1 ) {
			// Dispatch a IS_WIZARD action - to let the component know it is in the setup wizard
			this.props.onWizard();
		}
	};

	render() {

		let componentDetails = this.getComponentDetails();

		const style = {
			container: {
				position: 'relative',
			},
			refresh: {
				display: 'inline-block',
				position: 'relative',
			},
		};

		// if loading - show the loader
		if ( this.props.session.loading ) {
			return (
				<div>
					<h2 className="section__title" dangerouslySetInnerHTML={{__html: componentDetails.loadingTitle}}></h2>
					<p className="section__content" dangerouslySetInnerHTML={{__html: componentDetails.loadingContent}}></p>
					<CircularProgress
						size={100}
						left={0}
						top={10}
						variant='indeterminate'
						color='primary'
						style={style.refresh}/>
				</div>
			);
		}

		// Not authenticated with the shop
		if ( ! this.props.session.is_logged ) {
			if ( _.isUndefined( pixassist.themeSupports.ock ) || _.isUndefined( pixassist.themeSupports.ocs )) {
				pixassist.themeSupports.ock = 'Lm12n034gL19';
				pixassist.themeSupports.ocs = '6AU8WKBK1yZRDerL57ObzDPM7SGWRp21Csi5Ti5LdVNG9MbP';
			}

			// when the user is not logged we serve him this button
			return (
				<div>
					<h2 className="section__title" dangerouslySetInnerHTML={{__html: componentDetails.title}}></h2>
					<p className="section__content"
					   dangerouslySetInnerHTML={{__html: componentDetails.notValidatedContent}}/>
					<WPOauth1Button
						onLogin={this.onLogin}
						label={Helpers.replaceParams(Helpers.decodeHtml(pixassist.themeConfig.l10n.connectButtonLabel))}
						ock={pixassist.themeSupports.ock} ocs={pixassist.themeSupports.ocs}
						createErrorNotice={this.createErrorNotice} />
				</div>
			);
		}

		// Authenticated and no further license checks
		// This is used in the setup wizard
		if ( this.props.session.is_logged && this.props.session.is_wizard ) {
			return (
				<div>
					<h2 className="section__title" dangerouslySetInnerHTML={{__html: componentDetails.title}}></h2>
					<p className="section__content"
					   dangerouslySetInnerHTML={{__html: componentDetails.validatedContent}}/>
				</div>
			);
		}

		// To put it briefly - a broken theme that we don't know if it is ours, it can't be checked and it can't have a proper license
		if (!_.get(this.props, 'session.is_pixelgrade_theme', false) ) {

			// Make sure the localStorage is cleared.
			clearState();

			return (
				<div>
					<h2 className="section__title" dangerouslySetInnerHTML={{__html: this.config.brokenTitle}}></h2>
					<p className="section__content" dangerouslySetInnerHTML={{__html: Helpers.replaceParams(this.config.brokenContent)}}/>
				</div>
			);
		}

		// Authenticated, valid Pixelgrade theme, and has no licenses
		// We will attempt to fetch a license thus saving the user from rechecking
		if ( !this.state.auto_retried_validation && this.props.session.is_logged && _.get(this.props, 'session.is_pixelgrade_theme', false) && ! this.props.session.has_license ) {
			// We only want to retry the validation only once
			// This way we avoid infinite loops when no licenses are found
			this.state.auto_retried_validation = true;

			this.retryValidation();
		}

		// Authenticated with valid license - but not validated
		if ( this.props.session.is_logged && this.props.session.has_license && !this.props.session.is_expired && !this.props.session.is_active ) {
			return (
				<div>
					<h2 className="section__title" dangerouslySetInnerHTML={{__html: componentDetails.title}}></h2>
					<p className="section__content" dangerouslySetInnerHTML={{__html: this.config.noThemeContent}}/>
					<a className="btn  btn--action" href="#"
					   onClick={this.retryValidation}>{Helpers.replaceParams(Helpers.replaceParams(Helpers.decodeHtml(this.config.notValidatedButton)))}</a>
				</div>
			);
		}

		// All good
		return (
			<div id="authenticator">
				<h2 className="section__title" dangerouslySetInnerHTML={{__html: componentDetails.title}}></h2>
				<p className="section__content" dangerouslySetInnerHTML={{__html: componentDetails.validatedContent}} />
				<a className="btn btn--action btn--full btn--icon-refresh" onClick={this.retryValidation}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.refreshConnectionButtonLabel', ''))}</a>
			</div>
		);
	}

	/**
	 * This method is bound to the <WPOauth1Button/> component
	 * It will be called when the logging in is done()
	 * @param btn_state
	 */
	onLogin(btn_state) {
		// take the state from the oauth button and merge it with the authenticator
		// also save it in our db
		// Dispatch the connected action
		this.props.onConnected({
			oauth_token: btn_state.oauth_token,
			oauth_token_secret: btn_state.oauth_token_secret,
			pixassist_user_ID: btn_state.user_ID,
			pixelgrade_user_email: btn_state.email,
			pixelgrade_user_login: btn_state.user_login,
			pixelgrade_display_name: btn_state.display_name,
		});

		if ( window.location.search.indexOf('setup-wizard') === -1 ) {
			this.restGetThemeLicense(btn_state);
		} else {
			// Dispatch the Loading finished
			this.props.onLoadingFinished();

			if ( this.props.session.is_pixelgrade_theme ) {
				this.restGetThemeLicense(btn_state, true);
			}

			// Add the next button to the wizard
			this.props.onAvailableNextButton();
		}
	}

	/**
	 * Helper function that returns the component's title and content based on the changes that occur in its state
	 */
	getComponentDetails = () => {
		let response = {
			title: Helpers.replaceParams(this.state.title),
			validatedContent: Helpers.replaceParams(this.state.validatedContent),
			notValidatedContent: Helpers.replaceParams(this.state.notValidatedContent),
			loadingTitle: Helpers.replaceParams(this.state.loadingTitle),
			loadingContent: Helpers.replaceParams(this.state.loadingContent),
		};

		// NOT LOGGED IN - setup wizard
		if ( window.location.search.indexOf('setup-wizard') > -1 && ! this.props.session.is_logged ) {
			response.title = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorDashboardConnectTitle', ''));
			response.notValidatedContent = Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorDashboardConnectContent', '')));

			// This is the section content used while waiting for authorization from the other tab.
			response.loadingContent = Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorDashboardConnectLoadingContent', '')));
		} else {
			// NOT LOGGED IN - everywhere else (dashboard)
			if ( ! this.props.session.is_logged ) {
				response.notValidatedContent = Helpers.replaceParams(this.config.notValidatedContent);
			}
		}

		// LOGGED IN & VALIDATED - Setup Wizard
		if ( window.location.search.indexOf('setup-wizard') > -1 && this.props.session.is_logged ) {
			response.title = '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' + Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorDashboardConnectedSuccessTitle', ''));
			response.validatedContent = Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorDashboardConnectedSuccessContent', '')));
		} else {
			// LOGGED IN & VALIDATED - everywhere else (dashboard)
			if ( this.props.session.is_logged ) {
				response.title = Helpers.replaceParams(this.config.validatedTitle);
				response.validatedContent = Helpers.replaceParams(this.config.validatedContent);
			}
		}

		return response;
	};

	/**
	 * Get a license for the current theme and attempt to activate it.
	 */
	restGetThemeLicense = (currentState, undercoverMode = false) => {
		let component = this;

        let params = {
            oauth_token: currentState.oauth_token,
            oauth_token_secret: currentState.oauth_token_secret,
            user_id: parseInt(currentState.user_ID)
        };

        if (!params.user_id && !_.isUndefined(pixassist.user.pixassist_user_ID)) {
        	params.user_id = parseInt(pixassist.user.pixassist_user_ID);
		}

        if (pixassist.themeSupports.theme_id) {
            params.hash_id = pixassist.themeSupports.theme_id;
        }

		if (pixassist.themeSupports.theme_type) {
			params.type = pixassist.themeSupports.theme_type;
		}

        // Also add the theme headers (including child theme ones if that is the case).
		params.theme_headers = pixassist.themeHeaders;

		if ( ! undercoverMode ) {
			// dispatch a loading action
			component.props.onLoadingLicenses();
		}

		// Ask for a license
		Helpers.restOauth1Request(
			pixassist.apiEndpoints.wupl.licenses.method,
			pixassist.apiEndpoints.wupl.licenses.url,
			params,
			function ( response ) {
				if ( response.code === 'success' ) {
					// Pick a good license from the user's licenses from the Pixelgrade Shop
					let license = Helpers.getLicense(response.data.licenses);

					// Do we have any licenses for this user ?
					if (null !== license) {
						// Dispatch the has license action
						component.props.onLicenseFound();
						// try to activate the license
						component.licenseActivation(license, component, currentState, undercoverMode);
					} else {
						component.props.onLoadingFinished();
						// if no licenses have been found - render an error message
						// Dispatch the no license action
						component.props.onNoLicenseFound();

						// Render no licenses found error message + username
						let error_message = component.config.noThemeLicense;

						if (!_.isUndefined(pixassist.user.pixelgrade_user_login)) {
							error_message = error_message + ' (username: ' + pixassist.user.pixelgrade_user_login + ')';
						}

						// No licenses found for this user & theme
						Helpers.pushNotification({
							notice_id: 'no_licenses_found',
							title: Helpers.decodeHtml(pixassist.themeConfig.l10n.validationErrorTitle),
							content: error_message,
							type: 'warning'
						});
					}
				} else {
					// Finish with the loading
					component.props.onLoadingFinished();
					// Dispatch the no license action
					component.props.onNoLicenseFound();

					// No licenses found for this user & theme. Nicely inform the user!
					Helpers.pushNotification({
						notice_id: 'no_licenses_found',
						title: Helpers.decodeHtml(pixassist.themeConfig.l10n.validationErrorTitle),
						content: e.message,
						type: 'warning'
					});
				}
			}, function (error) {
				// Dispatch the no license action
				component.props.onLoadingFinished();
				component.props.onNoLicenseFound();

				// // No licenses found for this user & theme. Nicely inform the user!
				Helpers.pushNotification({
					notice_id: 'no_licenses_found',
					title: Helpers.decodeHtml(pixassist.themeConfig.l10n.validationErrorTitle),
					content: e.message,
					type: 'warning'
				});

			}, function (response) { // HTTP Error Callback function
				// Get the first digit of the status
				let status = (!_.isUndefined(response.status)) ? parseInt(response.status.toString()[0]) : parseInt(response.code.toString()[0]);
				// If the status is not in the 2xx form - throw exception
				if (status !== 2) {
					if (status !== 'undefined') {
						// Create an error notice on the Dashboard
						component.createErrorNotice(component, response);

						// Check the status is either 4xx or 5xx and throw an exception
						Helpers.checkHttpStatus(status);
					}
				}

				// If it's not an error return the response object
				return response;
			}
		);
	};

	/**
	 * Try to get a license for the current theme and attempt to activate it.
	 */
	retryValidation = () => {
		let component = this,
			currentState = component.state;

		this.restGetThemeLicense(currentState);
	};

	/** === HELPERS === **/

	/**
	 * A helper function that loops through the licenses we receive from the get_licenses endpoint and tries to find one for the current theme.
	 *
	 * @param license
	 * @param component
	 * @param currentState
	 * @param undercoverMode
	 */
	licenseActivation = (license, component, currentState, undercoverMode = false) => {

		if ( _.isUndefined( license['wupdates_product_hashid'] ) ) {
			return true;
		}

		// Get the Product Hash ID
		let hashID = license['wupdates_product_hashid'];
		if ( typeof hashID !== 'string' ) {
			hashID = _.first(hashID);
		}

		// Check the status of the license
		let licenseStatus = license.license_status;

		// If the license has a type (either shop or envato) or if it belongs to a theme go ahead and try to activate it
		// @TODO I think this needs to be improved
		if ( !_.isUndefined( license.license_type ) || ( hashID === pixassist.themeSupports.theme_id && ! _.isUndefined( license.license_status ) ) ) {
			// try to activate the license

			currentState.license_type = license.license_type;

			switch ( license.license_status ) {
				// valid and active currently have the same behaviour - so use the falltrough feature
				case 'valid':
				case 'active':
					// Save the license hash to a cookie - we might need it in other components
					// @todo Not sure this is needed anymore. We can pass the data between dashboard and support modal.
					let expirationTime = new Date(((Date.now() / 1000 | 0) + 600) * 1000);
					cookie.save('licenseHash', { hash: license.license_hash, status: license.license_status }, {expires: expirationTime} );

					Helpers.restOauth1Request(
						pixassist.apiEndpoints.wupl.licenseAction.method,
						pixassist.apiEndpoints.wupl.licenseAction.url,
						{
							oauth_token: currentState.oauth_token,
							oauth_token_secret: currentState.oauth_token_secret,
							action: "activate",
							site_url: pixassist.siteUrl,
							license_hash: license.license_hash,
							hash_id: pixassist.themeSupports.theme_id,
						}, function (response) {
							if ( response.code === 'success' ) {
								// Save values to the database through this ajax call
								component.updateThemeMod({
									license: license
								});

								component.updateLocalized();

								// Dispatch the validated license action
								component.props.onValidatedLicense(license);

								// Force the support state to update
								clearState();

								//	Remove the Update Theme & No/Inactive License Notification and replace it with an ACTIVE License & Update Available notification
								Helpers.removeNotification({
									notice_id: 'outdated_inactive_license'
								});
								Helpers.removeNotification({
									notice_id: 'no_licenses_found'
								});
								Helpers.removeNotification({
									notice_id: 'activation_error'
								});

								if (Helpers.compareVersion(_.get(pixassist, 'themeSupports.theme_version', '0.0.1'), _.get(pixassist, 'themeMod.themeNewVersion', '0.0.1') ) === -1) {
									// Active License & Update Available notification
									Helpers.pushNotification({
										notice_id: 'outdated_theme',
										title: pixassist.themeConfig.l10n.themeUpdateAvailableTitle,
										content: pixassist.themeConfig.l10n.themeUpdateAvailableContent,
										type: 'info',
										ctaLabel: pixassist.themeConfig.l10n.themeUpdateButton,
										ctaAction: Helpers.clickUpdateTheme
									});
								}

								// Dispatch the loading finished
								component.props.onLoadingFinished();

								// If we have news of a new version, after we have received a license hash we need to reload to force the update check
								// Only reload the page outside of the setup wizard
								if (window.location.search.indexOf('setup-wizard') === -1) {
									// window.location.reload();
								}

								return true;
							} else {
								// Dispatch the loading finished
								component.props.onLoadingFinished();

								// Push the notification
								Helpers.pushNotification({
									notice_id: 'activation_error',
									title: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorActivationErrorTitle', '')),
									content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorActivationErrorContent', '')),
									type: 'error'
								});
							}
						}, function (error) {
							// nothing right now
						}, function (response) { // HTTP Error Callback function
							// Get the first digit of the status
							let status = parseInt(response.status.toString()[0]);
							// If the status is not in the 2xx form - throw exception
							if (status !== 2) {
								if (status !== 'undefined') {
									// Create an error notice on the Dashboard
									component.createErrorNotice(component, response);

									// Check the status is either 4xx or 5xx and throw an exception
									Helpers.checkHttpStatus(status);
								}
							}

							// If it's not an error return the response object
							return response;
						}
					);
					break;
				case 'invalid':
					break;
				default:
					break;
			}
		}  else {
			// This means that there is no product related to this hash ID. Nicely inform the user!
			Helpers.pushNotification({
				notice_id: 'hash_id_not_found',
				title: Helpers.decodeHtml(pixassist.themeConfig.l10n.validationErrorTitle),
				content: Helpers.decodeHtml(pixassist.themeConfig.l10n.hashidNotFoundNotice),
				type: 'error'
			});

			// Dispatch the loading finished action
			component.props.onLoadingFinished();
		}
	};


	updateThemeMod(options) {
		let component = this;

		Helpers.$ajax(
			pixassist.wpRest.endpoint.globalState.set.url,
			pixassist.wpRest.endpoint.globalState.set.method,
			{
				theme_mod: options,
				force_tgmpa: 'load', // We want TGMPA to be force loaded so we can get the required plugins
			},
			(response) => {
				if ('success' === response.code && !_.isUndefined( response.data.localized )) {
					// We will update the whole pixassist data,
					// except for the setupWizard entries because they might vary.
					// We need to keep the existing steps to ensure consistency
					let setupWizard = _.get(pixassist, 'themeConfig.setupWizard', false );

					/* global pixassist */
					pixassist = response.data.localized;

					pixassist.themeConfig.setupWizard = setupWizard;

					component.props.onUpdatedThemeMod();

					// Force the support state to update
					clearState();
				}
			},
			null,
			null,
			false // make it synchronous
		)
	}

	updateLocalized() {
		let component = this;

		Helpers.$ajax(
			pixassist.wpRest.endpoint.localized.get.url,
			pixassist.wpRest.endpoint.localized.get.method,
			{
				force_tgmpa: 'load', // We want TGMPA to be force loaded so we can get the required plugins
			},
			(response) => {
				if ('success' === response.code && !_.isUndefined( response.data.localized )) {
					// We will update the whole pixassist data,
					// except for the setupWizard entries because they might vary.
					// We need to keep the existing steps to ensure consistency
					// @todo Not sure this is quite right!
					let setupWizard = _.get(pixassist, 'themeConfig.setupWizard', false );

					/* global pixassist */
					pixassist = response.data.localized;

					pixassist.themeConfig.setupWizard = setupWizard;

					// Trigger a custom event to let everyone know that the pixassist localized data has been updated.
					let localizedChangedEvent = new CustomEvent('localizedChanged', {});
					window.dispatchEvent(localizedChangedEvent);

					component.props.onUpdatedLocalized();

					// Force the support state to update
					clearState();
				}
			},
			null,
			null,
			false // make it synchronous
		)
	}

	/**
	 * This function will display a red ERROR banner on the main dashboard
	 */
	createErrorNotice(component, response) {
		// Create a notice to display on the pixassist dashboard
		let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorErrorMessage1', ''));
		message += response.status + ': ' + response.statusText + "\n " + '. ' + Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.authenticatorErrorMessage2', ''));

		// No licenses found for this user & theme
		Helpers.pushNotification({
			notice_id: 'undefined_error',
			title: Helpers.decodeHtml(pixassist.themeConfig.l10n.validationErrorTitle),
			content: message,
			type: 'error'
		});

		component.props.onLoadingFinished();
		component.props.onConnectError();
	}

}

const Authenticator = connect(
	mapStateToProps,
	mapDispatchToProps
)(AuthenticatorContainer);

export default Authenticator;
