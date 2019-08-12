import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import muiTheme from '../mui-theme';

import SupportButton from './button';
import SupportPage from './modal';
import {connect} from 'react-redux';
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		support: state
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSessionChange: (session) => { dispatch({type: 'SESSION_CHANGE', session})},
		onUpdatedLocalized: () => {
			dispatch({ type: 'ON_UPDATED_LOCALIZED' });
		},
		onLoading: () => {
			dispatch({type: 'LOADING'})
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
		}
	}
};

class SupportDashboardContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.onSupportState = this.onSupportState.bind(this);
		this.updateLocalState = this.updateLocalState.bind(this);
	};

	UNSAFE_componentWillMount() {
		let component = this;

		// Update the state of the licenses
		let hasLicense = false;
		let isLicenseValid = false;
		let isLicenseActive = false;
		let isLoggedIn = false;
		let licenseType = false;
		let licenseExpiry = false;

		if ( ! _.isUndefined( pixassist.themeMod.licenseHash ) && ! _.isUndefined( pixassist.themeMod.licenseStatus ) ) {
			hasLicense = true;

			// Check if license is active or valid
			if ( pixassist.themeMod.licenseStatus !== 'expired' && pixassist.themeMod.licenseStatus !== 'overused' ){
				isLicenseValid = true;
				isLicenseActive = true;
			}

			licenseType = pixassist.themeMod.licenseType;
			licenseExpiry = pixassist.themeMod.licenseExpiryDate;
		}

		if ( ! _.isUndefined( pixassist.user.pixassist_user_ID ) ){
			isLoggedIn = true;
		}

		//Set the state with the license data
		component.setState({
			hasLicense: hasLicense,
			isLicenseValid: isLicenseValid,
			isLicenseActive: isLicenseActive,
			isLoggedIn: isLoggedIn,
			licenseType: licenseType,
			licenseExpiry: licenseExpiry
		});
	};

	componentDidMount() {
		let component = this;

		// Detect if the user press escape. If the support modal is open when pressing ESC - close it.
		jQuery(document).keyup(function(e) {
			if (e.keyCode == 27) { // escape key maps to keycode `27`
				component.setState({
					is_active: undefined // is_active is undefined - modal is closed
				})
			}
		});

		// Listen for custom search events
		let searchElement = document.getElementById('docsSearchBox');

		// Listen for custom search events
		let ticketButton = document.getElementById('pixassist-support-button');

		// Listen for the LOG IN event
		ticketButton.addEventListener('logIn', function(e) {
			component.setState({
				isLoggedIn: true
			});
		});

        // add an event listener for the session state change
        window.addEventListener('licenseStateChange', function(event){
			component.props.onSessionChange(event.detail);
        });

		// add an event listener for the localized JS pixassist change.
		window.addEventListener('localizedChanged', function(event){
			component.props.onUpdatedLocalized();
		});

		// Listen for the VALIDATE event
		window.addEventListener('validateLicense', function(e) {
			let isLicenseValid = (e.detail.licenseStatus !== 'expired' && e.detail.licenseStatus !== 'overused');

			component.setState({
				hasLicense: e.detail.hasLicense,
				isLicenseValid: isLicenseValid,
				isLicenseActive: e.detail.isLicenseActive,
				licenseType: e.detail.licenseType,
				licenseExpiry: e.detail.licenseExpiry,
			});
		});
	};

	render() {
		return <div>
				<div id="pixelgrade_assistant-support-button" >
					<SupportButton onSupportState={this.onSupportState} />
				</div>
				<div className={`pixassist-support-modal-wrapper ${ ! this.props.support.is_support_active ? 'hidden' : ''}`}>
					<SupportPage />
				</div>
			}

		</div>
	};

	onSupportState(state) {
		this.updateLocalState(state);
	};

	updateLocalState($state) {
		this.setState($state);
	};
}

const SupportDashboard = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportDashboardContainer);

const SupportContainer = () => {
	return (
		<ThemeProvider theme={muiTheme} injectFirst>
			<SupportDashboard />
		</ThemeProvider>
	);
};

const Support = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportContainer);


export default Support;
