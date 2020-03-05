import React from 'react';
import PropTypes from 'prop-types';
import SystemStatus from '../system_status';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import { withStyles } from '@material-ui/styles';

import Tools from '../tools';
import Notice from '../notice';
import Notificator from '../notificator';

import Authenticator from '../authenticator';
import StarterContent from '../starter_content';
import PluginManager from '../plugin_manager';
import RecommendedPlugins from '../recommendedPlugins';
import {connect} from 'react-redux';
import Helpers from '../../helpers';
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

const styles = theme => ({
	root: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.paper,
	},
});


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
		}
	}
};

class DashboardTabsContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.state = {
			activeTab: 'general',
		}

		// // This binding is necessary to make `this` work in the callback
		this.onState = this.onState.bind(this);
		this.addNotices = this.addNotices.bind(this);
	}

	componentDidMount() {
		this.addNotices();
	}

	handleTabChange = (event, value) => {
		this.setState({ activeTab: value } );
	};

	render() {
		let component = this;
		let dashboard_tabs = _.get(pixassist, 'themeConfig.dashboard',[]);

		const { activeTab } = component.state;

		return <div>
				<AppBar position="static" className={"shadow--toaca rounded--small"} color="inherit">
					<Tabs
						variant="scrollable"
						value={activeTab}
						onChange={this.handleTabChange}
						className={"dashboard-tabs"}
						indicatorColor="primary"
					>
						{Object.keys(dashboard_tabs).map(function (tab_key, tab_index) {
							let tab = dashboard_tabs[tab_key],
								tab_class = ' ';

							if (!_.isUndefined(tab.class)) {
								tab_class += tab.class
							}

							return <Tab
								disableRipple
								style={{textTransform: 'none',}}
								className={"dashboard-tabs__tab-name"}
								label={tab.name}
								value={tab_key}
								key={'tab-' + tab_key} />
						})}
					</Tabs>
				</AppBar>
				{component.renderTabBlocks(activeTab)}
			</div>
	}

	renderTabBlocks = ( tab_key ) => {
		let component = this;

		let dashboard_tabs = _.get(pixassist, 'themeConfig.dashboard',[]),
			tab = dashboard_tabs[tab_key],
			blocks = tab.blocks,
			tab_class = ' ';

		if ( ! _.isUndefined( tab.class ) ) {
			tab_class += tab.class
		}

		return <TabContainer >
			{ tab_key === 'general' ? <Notificator /> : null }

			<div className="blocks">
				{Object.keys(blocks).map(function (block_key) {
					var block = blocks[block_key],
						block_class = 'block section section--informative entry-content ';

					// Bail if this is not applicable to the current theme type.
					if ( !component.isApplicableToCurrentThemeType(block)){
						return;
					}

					// For some steps there are extra cases when we should bail
					// Do not display anything if there are no Starter Content sources.
					if (block_key === 'starterContent' && !_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
						return;
					}

					// Handle the the case when the block has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
					if ( ! _.isUndefined( block.notconnected ) ) {

						if ( !_.get(component.props, 'session.is_logged', false) ) {

							switch (block.notconnected) {
								case 'hidden':
									return null;
									break;

								case 'disabled':
									block_class += ' disabled';
									break;

								case 'notice':
									return <Notice
										key={'block-notice-' + block_key}
										notice_id="component_unavailable"
										type="warning"
										title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
										content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
									break;
							}
						}
					}

					// Handle the the case when the block has an inactive behaviour, meaning that the license is not active.
					if ( ! _.isUndefined( block.inactive ) && ( !_.get(component.props, 'session.is_active', false) || !_.get(component.props, 'session.is_logged', false) ) ) {

						switch ( block.inactive ) {
							case 'hidden':
								return null;
								break;

							case 'disabled':
								block_class += ' disabled';
								break;

							case 'notice':
								return <Notice
									key={'block-notice-' + block_key }
									notice_id="component_unavailable"
									type="warning"
									title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
									content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
								break;
						}
					}

					if ( ! _.isUndefined( block.class ) ) {
						block_class += block.class;
					}


					let block_output = null;

					if ( ! _.isUndefined( block.fields ) && _.size(block.fields) ) {
						block_output =
							<div key={'block-' + block_key} className={block_class}>
								{Object.keys(block.fields).map(function (field_key) {
									let field = block.fields[field_key];

									return component.renderField(field, field_key, component);
								})}
							</div>
					}
					return block_output;
				})}
			</div>
		</TabContainer>
	}

	renderField = (field, field_key, component) => {
		let field_output = null,
			field_class = ' ';

		// Bail if this is not applicable to the current theme type.
		if ( !component.isApplicableToCurrentThemeType(field)){
			return;
		}

		// Handle the the case when the block field has has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
		if (!_.isUndefined(field.notconnected)) {
			if ( !_.get(component.props, 'session.is_logged', false) ) {
				switch (field.notconnected) {
					case 'hidden':
						return null;
						break;

					case 'disabled':
						field_class += ' disabled';
						break;

					case 'notice':
						return <Notice
							key={'block-notice-' + field_key}
							notice_id="component_unavailable"
							type="warning"
							title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
							content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
						break;
				}
			}
		}

		// Handle the the case when the block field has an inactive behaviour, meaning that the license is not active.
		if (!_.isUndefined(field.inactive) && ( !_.get(component.props, 'session.is_active', false) || !_.get(component.props, 'session.is_logged', false) ) ) {
			switch (field.inactive) {
				case 'hidden':
					return null;
					break;

				case 'disabled':
					field_class += ' disabled';
					break;

				case 'notice':
					return <Notice
						key={'block-notice-' + field_key}
						notice_id="component_unavailable"
						type="warning"
						title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
						content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
					break;
			}
		}

		if (!_.isUndefined(field.class)) {
			field_class += field.class
		}

		switch (field.type) {

			case 'text': {
				// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
				let value = field.value;

				if ( component.props.session.is_sc_installing ) {
					value = field.value_installing;
				}

				if ( component.props.session.is_sc_done ) {
					value = field.value_installed;
				}

				if ( component.props.session.is_sc_errored ) {
					value = field.value_errored;
				}

				if (_.isUndefined(value) || !value) {
					value = field.value;
				}

				field_output = <p
					className={field_class}
					dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}
					key={'field-' + field_key}></p>
				break;
			}

			case 'h1': {
				field_output =
					<h1 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h1>
				break;
			}

			case 'h2': {
				// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
				let value = field.value;

				if ( component.props.session.is_sc_installing ) {
					value = field.value_installing;
				}

				if ( component.props.session.is_sc_done ) {
					value = field.value_installed;
				}

				if ( component.props.session.is_sc_errored ) {
					value = field.value_errored;
				}

				if (_.isUndefined(value) || !value) {
					value = field.value;
				}

				field_output =
					<h2 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}></h2>
				break;
			}

			case 'h3': {
				field_output =
					<h3 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h3>
				break;
			}

			case 'h4': {
				field_output =
					<h4 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h4>
				break;
			}

			case 'button': {

				let CSSClass = 'btn ';
				if (!_.isUndefined(field.class)) {
					CSSClass += field.class;
				}

				let target = '_blank';
				if (!_.isUndefined(field.target)) {
					target = field.target;
				}

				// replace some pre-defined urls
				field.url = Helpers.replaceUrls(field.url);

				field_output = <a className={CSSClass} target={target}
								  key={'field-' + field_key}
								  href={field.url}>
					{field.label}
				</a>
				break;
			}

			case 'links': {
				if (typeof field.value !== "object") {
					break;
				}

				var links = field.value;

				field_output = <ul key={'field' + field_key}>
					{Object.keys(field.value).map(function (link_key) {
						var link = links[link_key];

						if (_.isUndefined(link.label) || _.isUndefined(link.url)) {
							return;
						}

						return <li key={'link-' + link_key}>
							<a href={link.url}>{link.label}</a>
						</li>
					})}
				</ul>
				break;
			}

			case 'component': {

				switch (field.value) {

					case 'authenticator': {
						field_output =
							<Authenticator
								key={'field-' + field_key}/>
						break
					}

					case 'system-status': {
						field_output = <SystemStatus
							key={'field-' + field_key}/>
						break
					}

					case 'pixassist-tools': {
						field_output =
							<Tools key={'field-' + field_key}/>
						break
					}

					case 'plugin-manager': {
						let control = false;
						if (!_.isUndefined(field.control)) {
							control = field.control;
						}

						field_output = <PluginManager
							key={'field-' + field_key}
							onPluginsReady={component.onPluginsReady}
							onPluginsInstalling={component.onPluginsInstalling}
							enable_actions={true}/>
						break
					}

					case 'recommended-plugins': {
						let control = false;
						if (!_.isUndefined(field.control)) {
							control = field.control;
						}

						field_output = <RecommendedPlugins
							key={'field-' + field_key}
							onPluginsReady={component.onPluginsReady}
							onPluginsInstalling={component.onPluginsInstalling}
							enable_actions={true}/>
						break
					}

					case 'starter-content': {
						// Do not display anything if there are no Starter Content sources.
						if (!_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
							break;
						}

						let control = false;

						if (!_.isUndefined(field.control)) {
							control = field.control;
						}

						field_output = <StarterContent
							key={'field-' + field_key} name={field_key}
							onReady={component.onStarterContentReady}
							onImporting={component.onStarterImporting}
							enable_actions={true}/>;
						break
					}

					default:
						break
				}
				break;
			}
			default:
				break
		}

		return field_output;
	}

	isApplicableToCurrentThemeType = (item) => {
		if ( !_.get(item, 'applicableTypes', false) ) {
			// By default it is applicable.
			return true;
		}

		let applicableTypesConfig = _.castArray(_.get(item, 'applicableTypes', false));

		// Get the current theme type
		let themeType = _.get(pixassist,'themeSupports.theme_type', 'theme');

		if (_.indexOf(applicableTypesConfig, themeType) !== -1) {
			return true;
		}

		return false;
	}

	onState(state) {
		this.updateLocalState(state);
	}

	updateLocalState(state) {
		this.setState(state, function () {
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
		let comp = this,
			state = this.props.session;

		// NEW UPDATE AVAILABLE NOTICE - if the current_version of the theme is different than the new version - render an update notice
		if (Helpers.compareVersion(_.get(pixassist, 'themeSupports.theme_version', '0.0.1'), _.get(pixassist, 'themeMod.themeNewVersion.new_version', '0.0.1') ) === -1) {
			// serve update if license is valid
			if (_.get(state, 'is_active', false) === true) {
				Helpers.pushNotification({
					notice_id: 'outdated_theme',
					title: Helpers.replaceParams(Helpers.decodeHtml(pixassist.themeConfig.l10n.themeUpdateAvailableTitle)),
					content: Helpers.replaceParams(Helpers.decodeHtml(pixassist.themeConfig.l10n.themeUpdateAvailableContent)),
					type: 'info',
					ctaLabel: Helpers.decodeHtml(pixassist.themeConfig.l10n.themeUpdateButton),
					ctaAction: Helpers.clickUpdateTheme,
					secondaryCtaLabel: pixassist.themeConfig.l10n.themeChangelogLink,
					secondaryCtaLink: _.get(pixassist, 'themeMod.themeNewVersion.url', '#')
				});
			}
		}

		if (_.get(pixassist, 'systemStatus.system', false) && Helpers.compareVersion(_.get(pixassist, 'systemStatus.system.php_version', '0.0.1'), _.get(pixassist, 'themeConfig.systemStatus.phpRecommendedVersion', '0.0.1')) === -1 ) {
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
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.wordpressOutdatedNoticeContent', '')),
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

const DashboardTabs = connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(DashboardTabsContainer));

export default DashboardTabs;
