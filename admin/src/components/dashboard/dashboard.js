import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import ourTheme from '../mui-theme';

import DashboardHeader from './header';
import DashboardTabs from './tabs';
import {connect} from 'react-redux';
import Helpers from '../../helpers';
import { clearState } from '../../localStorage';
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		session: state
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		onConnected: () => {
			dispatch({
				type: 'CONNECTED'
			});
		},
		onLoading: () => {
			dispatch({
				type: 'LOADING'
			})
		},
		onDisconnect: () => {
			dispatch({
				type: 'DISCONNECTED'
			})
		},
		onUpdatedLocalized: () => {
			dispatch({ type: 'ON_UPDATED_LOCALIZED' });
		}
	}
};

class DashboardContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.state = {
			headerData: this.getHeaderData(),
		};

		// // This binding is necessary to make `this` work in the callback
		this.onState = this.onState.bind(this);
		this.getHeaderData = this.getHeaderData.bind(this);
		this.addNotices = this.addNotices.bind(this);

		this.disconnectUser = this.disconnectUser.bind(this);
		this.updatedTheme = this.updatedTheme.bind(this);
		this.updateHeaderData = this.updateHeaderData.bind(this);
	}

	componentDidMount() {
		let component = this;

		// Add an event listener that will get triggered when the theme is updated.
		// When the theme is updated - change the header details (status & message).
		window.addEventListener('updatedTheme', component.updatedTheme);

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', component.updateHeaderData);

		component.addNotices();
	}

	componentWillUnmount() {
		let component = this;

		window.removeEventListener( 'updatedTheme', component.updatedTheme );
		window.removeEventListener( 'localizedChanged', component.updateHeaderData );
	}

	updatedTheme( event ) {
		let component = this;

		// On theme update we need to refresh the localized data since many things might be different.
		component.updateLocalized();
	}

	updateHeaderData(e) {
		let component = this;

		component.setState({
			headerData: component.getHeaderData(),
		});
	}

	render() {
		let component = this,
			headerData = component.state.headerData;

		return <div>
			{ component.props.session.is_logged // when the user is logged in we need to bound the disconnect action
				? <DashboardHeader status={headerData.status} msg={headerData.msg} ctaOnClick={component.disconnectUser} />
				: <DashboardHeader status={headerData.status} msg={headerData.msg} /> }

			<DashboardTabs />
		</div>
	}

	/**
	 * Retrieve an object with the display data required by DashboardHeader component
	 * Mainly will return a status and a display message
	 * @returns {{status: string, msg: *}}
	 */
	getHeaderData() {
		// assume by default that the user is logged in and up to date
		let headerData = {
			status: 'ok',
			msg: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.themeValidationNoticeOk', ''))
		};

		// but, if is not active, show the proper message
		if (! this.props.session.is_active) {
			headerData.status = 'not-ok';
			headerData.msg = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.themeValidationNoticeFail', ''));

			if ( Helpers.compareVersion(_.get(pixassist, 'themeSupports.theme_version', '0.0.1'), _.get(pixassist, 'themeMod.themeNewVersion.new_version', '0.0.1') ) === -1 ) {
				headerData.msg += ' ' + Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.themeValidationNoticeUpdateAvailable', ''));
			}

			// the user may have an active license, but the theme may be outdated
		} else if (Helpers.compareVersion(_.get(pixassist, 'themeSupports.theme_version', '0.0.1'), _.get(pixassist, 'themeMod.themeNewVersion.new_version', '0.0.1') ) === -1) {
			headerData.status = 'not-ok';
			headerData.msg = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.themeValidationNoticeOutdatedWithUpdate', ''));
		}

		if (!this.props.session.is_logged) {
			headerData.status = 'not-ok';
			headerData.msg = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.themeValidationNoticeNotConnected', ''));
		}

		return headerData;
	}

	disconnectUser() {
		let component = this,
			confirm = window.confirm(Helpers.parseL10n(_.get(pixassist, 'themeConfig.l10n.disconnectConfirm', '')));

		if ( confirm ) {
            // Add disabled class to the whole dashboard on disconnect
            jQuery('#pixelgrade_assistant_dashboard').addClass('disabled-element').append('<div class="disabled-loader"></div>');

            // Clear The local Storage as well
			clearState();

			Helpers.$ajax(
				pixassist.wpRest.endpoint.disconnectUser.url,
				pixassist.wpRest.endpoint.disconnectUser.method,
				{
					'user_id': pixassist.user.id
				},
				function (response) {
					if ( response.code === 'success' ) {

						// after disconnecting we need to rebuild the info from the localized JS pixassist variable.
						component.updateLocalized();

						jQuery('#pixelgrade_care_dashboard .disabled-loader').remove();
						jQuery('#pixelgrade_care_dashboard').removeClass('disabled-element');

						component.props.onDisconnect();

						// No need for now.
						// window.location.reload();
					} else {
						alert('We\'ve hit a snag, it seems ('+response.code+').\nSomething about: '+response.message );
					}
				}
			)
		}
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
					// We will update the whole pixassist data.
					/* global pixassist */
					pixassist = response.data.localized;

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

	onState(state) {
		this.updateLocalState(state);
	}

	updateLocalState($state) {
		let component = this;

		this.setState($state, function () {
			Helpers.$ajax(
				pixassist.wpRest.endpoint.globalState.set.url,
				pixassist.wpRest.endpoint.globalState.set.method,
				{
					state: this.props.session
				},
			)
		});
	}

	/**
	 * This method handles the notifications for the initial state
	 */
	addNotices() {
		let state = this.props.session;

		// NEW UPDATE AVAILABLE NOTICE - if the current_version of the theme is lower than the new version - render an update notice
		if (  Helpers.compareVersion(_.get(pixassist, 'themeSupports.theme_version', '0.0.1'), _.get(pixassist, 'themeMod.themeNewVersion.new_version', '0.0.1') ) === -1 ) {
			// serve update if license is valid
			if (_.get(state, 'is_active', false) === true) {
				Helpers.pushNotification({
					notice_id: 'outdated_theme',
					title: Helpers.parseL10n(pixassist.themeConfig.l10n.themeUpdateAvailableTitle),
					content: Helpers.parseL10n(pixassist.themeConfig.l10n.themeUpdateAvailableContent),
					type: 'info',
					ctaLabel: pixassist.themeConfig.l10n.themeUpdateButton,
					ctaAction: Helpers.clickUpdateTheme,
					secondaryCtaLabel: pixassist.themeConfig.l10n.themeChangelogLink,
					secondaryCtaLink: _.get(pixassist, 'themeMod.themeNewVersion.url', '#')
				});
			}
		}

		if (_.get(pixassist, 'systemStatus.system', false) && Helpers.compareVersion(_.get(pixassist, 'systemStatus.system.php_version', '0.0.1'), _.get(pixassist, 'themeConfig.systemStatus.phpRecommendedVersion', '0.0.1')) === -1) {
			Helpers.pushNotification({
				notice_id: 'php-warning',
				title: "PHP " + _.get(pixassist, 'systemStatus.system.php_version', ''),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.phpOutdatedNotice', '')) + _.get(pixassist, 'themeConfig.systemStatus.phpRecommendedVersion', ''),
				type: 'warning',
			})
		}

		if (_.get(pixassist, 'systemStatus.system', false) && Helpers.compareVersion(_.get(pixassist, 'systemStatus.system.wp_version', '0.0.1'), _.get(pixassist, 'themeConfig.systemStatus.wpRecommendedVersion', '0.0.1')) === -1) {
			Helpers.pushNotification({
				notice_id: 'wordpress-warning',
				title: "WordPress " + _.get(pixassist, 'systemStatus.system.wp_version', ''),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.wordpressOutdatedNoticeContent' ,'')),
				type: 'warning'
			});
		}

		// In case of internal server error
		if (state.internal_server_error) {
			Helpers.pushNotification({
				notice_id: 'wordpress-warning',
				title: Helpers.decodeHtml(pixassist.themeConfig.l10n.internalErrorTitle),
				content: Helpers.decodeHtml(pixassist.themeConfig.l10n.internalErrorContent),
				type: 'warning'
			});
		}
	}
}

const Dashboard = connect(
	mapStateToProps,
	mapDispatchToProps
)(DashboardContainer);

const generateClassName = createGenerateClassName({
	productionPrefix: 'pixdash',
})

const DashboardPageContainer = () => {
	return <StylesProvider generateClassName={generateClassName}><ThemeProvider theme={ourTheme}>
			{ ( _.isUndefined( pixassist ) || _.isUndefined( pixassist.themeSupports ) || pixassist.themeSupports === null )
				? null
				: <Dashboard /> }
	</ThemeProvider></StylesProvider>
};

const DashboardPage = connect(
	mapStateToProps,
	mapDispatchToProps
)(DashboardPageContainer);

export default DashboardPage;
