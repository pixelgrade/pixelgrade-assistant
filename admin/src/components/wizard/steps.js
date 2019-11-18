import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import StepLabel from '@material-ui/core/StepLabel';

import DoneIcon from '@material-ui/icons/CheckCircle';

import Notice from '../notice';
import Authenticator from '../authenticator';
import PluginManager from '../plugin_manager';
import StarterContent from '../starter_content';

import Helpers from '../../helpers';
// wizard components
import WizardNextButton from './nextButton';
import WizardSkipButton from './skipButton';
import _ from 'lodash';

var $ = jQuery;

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
		onAvailableNextButton: () => {
			dispatch({ type: 'NEXT_BUTTON_AVAILABLE' })
		},
		onUnAvailableNextButton: () => {
			dispatch({ type: 'NEXT_BUTTON_UNAVAILABLE' })
		},
		onConnectURLReady: ( url ) => {
			dispatch({ type: 'CONNECT_URL_READY', url: url });
		},
		onAvailableSkipButton: () => {
			dispatch({ type: 'SKIP_BUTTON_AVAILABLE' })
		},
		onUnAvailableSkipButton: () => {
			dispatch({ type: 'SKIP_BUTTON_UNAVAILABLE' })
		},
		onPluginsInstalling: () => {
			dispatch({ type: 'ON_PLUGINS_INSTALLING' });
		},
		onPluginsInstalled: () => {
			dispatch({ type: 'ON_PLUGINS_INSTALLED' });
		},
	}
};

class StepsContainer extends Component {

	constructor(props) {
		// this makes the this
		super(props);

		// // This binding is necessary to make `this` work in the callback
		this.onState = this.onState.bind(this);
		this.defaultNextButtonCallback = this.defaultNextButtonCallback.bind(this);
		this.defaultSkipButtonCallback = this.defaultSkipButtonCallback.bind(this);
		this.startPluginsInstall = this.startPluginsInstall.bind(this);

		this.onPluginsReady = this.onPluginsReady.bind(this);
		this.onPluginsInstalling = this.onPluginsInstalling.bind(this);
		this.onPluginsRender = this.onPluginsRender.bind(this);

		this.onStarterImporting = this.onStarterImporting.bind(this);
		this.startContentImport = this.startContentImport.bind(this);
		this.onStarterContentReady = this.onStarterContentReady.bind(this);
		this.onStarterContentRender = this.onStarterContentRender.bind(this);

		this.state = this.initialState = {
			loading: false,
			is_active: false,
			is_expired: false,
			step_index: 0,
			plugins_status: 'waiting',
			steps_done: [],
			nextButtonLabel: null,
			nextButtonDisable: false,
			nextButtonCallback: null,
			skipButtonLabel: null,
			skipButtonDisable: null,
			skipButtonCallback: null
		};

		if ( ! _.isUndefined( pixassist.user.pixassist_user_ID ) ) {
			this.state.is_logged = true;
		}

		if ( ! _.isUndefined( pixassist.themeMod.licenseHash ) ) {
			this.state.has_license = true;
		}

		if ( ! _.isUndefined( pixassist.themeMod.licenseStatus ) && pixassist.themeMod.licenseStatus === "active") {
			this.state.is_active = true;
		}

	}

	render() {
		let component = this,
			{loading, step_index} = this.state;

		// Remove the Starter Content step if we have no sources.
		if ( !_.size(_.get(pixassist, 'themeConfig.starterContent.demos', [])) ) {
			pixassist.themeConfig.setupWizard = _.filter( pixassist.themeConfig.setupWizard, function (value, key ) {
				return key !== 'support'; // I know... this key is just what the doctor ordered :(
			} );
		}

		let step_key = Object.keys(pixassist.themeConfig.setupWizard)[step_index],
			step_config = pixassist.themeConfig.setupWizard[step_key],
			blocks = step_config.blocks,
			first_step = null,
			last_step = null;

		if (step_index === 0) {
			first_step = true;
		} else if (step_index === _.size(pixassist.themeConfig.setupWizard) - 1) {
			last_step = true;
		}

		return <div>
				{ _.get(pixassist, 'themeSupports.theme_name', false) &&
					_.get(pixassist, 'themeSupports.is_pixelgrade_theme', false) ?
					<h1 className="setup-wizard-theme-name  u-text-center">{Helpers.decodeHtml(pixassist.themeConfig.l10n.setupWizardTitle)}</h1>
						:
					<div className="crown"></div>
				}
				<div className="stepper">
					<Stepper activeStep={step_index} nonLinear={true} className="no-background stepper-container">
						{ Object.keys(pixassist.themeConfig.setupWizard).map(function (key, int_key) {
							// Bail if this is not applicable to the current theme type.
							if ( !component.isApplicableToCurrentThemeType(pixassist.themeConfig.setupWizard[key])){
								return;
							}

							// For some steps there are extra cases when we should bail
							// Do not display anything if there are no Starter Content sources.
							if (key === 'support' && !_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
								return;
							}

							let step_class = 'stepper__step';

							// this tab is the current one
							if (component.state.step_index === int_key) {
								step_class += ' current';
							}

							// mark the tabs passed by
							if (component.state.step_index >= int_key) {
								step_class += ' passed';
							}

							// mark the tabs completed
							if (component.state.steps_done.indexOf(int_key) !== -1) {
								step_class += ' done';
							}

							return <Step className={step_class} onClick={() => component.setStep(int_key)} key={'step_head' + int_key}>
								<StepLabel icon={<DoneIcon color="primary" />} className="stepper__label" classes={{iconContainer: "stepper__label-icon", labelContainer: "stepper__label-name"}}>
									{Helpers.decodeHtml(pixassist.themeConfig.setupWizard[key].stepName)}
								</StepLabel>
							</Step>
						})}
					</Stepper>
					<div className="stepper__content">
						<div className="section  section--informative entry-content block">
							<div className="section__content">
								{Object.keys(blocks).map(function (block_key) {
									var block = blocks[block_key],
										block_class = 'block ';

									// Bail if this is not applicable to the current theme type.
									if ( !component.isApplicableToCurrentThemeType(block)){
										return;
									}

									// For some steps there are extra cases when we should bail
									// Do not display anything if there are no Starter Content sources.
									if (block_key === 'support' && !_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
										return;
									}

									// Handle the the case when the block has a notconnected behaviour, meaning that Pixelgrade Care is not connected (not logged in).
									if ( !_.isUndefined( block.notconnected ) ) {
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
														content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>
													break;
											}
										}
									}

									// Handle the the case when the block has an inactive behaviour, meaning that the license is not active.
									if ( !_.isUndefined( block.inactive ) && ( !_.get(component.props, 'session.is_active', false) || !_.get(component.props, 'session.is_logged', false) ) ) {
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
													content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))} />
												break;
										}
									}

									if ( !_.isUndefined( block.class ) ) {
										block_class += block.class;
									}

									return <div key={'block-' + block_key } className={block_class}>

										{Object.keys(block.fields).map(function (field_key) {

											let field = block.fields[field_key],
												field_output = null,
												field_class = ' ';

											// Bail if this is not applicable to the current theme type.
											if ( !component.isApplicableToCurrentThemeType(field)){
												return;
											}

											// Handle the the case when the block has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
											if ( !_.isUndefined( field.notconnected )) {
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
																content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>
															break
													}
												}
											}

											// Handle the the case when the block field has an inactive behaviour, meaning that the license is not active.
											if ( ! _.isUndefined( field.inactive ) && ( !_.get(component.props, 'session.is_active', false) || !_.get(component.props, 'session.is_logged', false) ) ) {
												switch ( field.inactive ) {
													case 'hidden':
														return null;
														break;

													case 'disabled':
														field_class += ' disabled';
														break;

													case 'notice':
														return <Notice
															key={'block-notice-' + field_key }
															notice_id="component_unavailable"
															type="warning"
															title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
															content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))} />
														break
												}
											}

											if ( ! _.isUndefined( field.class ) ) {
												field_class += field.class;
											}

											switch (field.type) {

												case 'text': {
													// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
													let value = field.value;

													if ( step_config.stepName === 'Plugins' ) {

														if (component.props.session.are_plugins_installing) {
															value = field.value_installing;
														}

														if (component.props.session.are_plugins_installed && component.props.session.did_plugins_install) {
															value = field.value_installed;
														}
													}

													if ( step_config.stepName === 'Starter Content' ) {
														if (component.props.session.is_sc_installing) {
															value = field.value_installing;
														}

														if (component.props.session.is_sc_done) {
															value = field.value_installed;
														}
													}

													if (!value) {
														value = field.value;
													}

													field_output =
														<p className={field_class}
														   dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}
														   key={'field' + field_key}></p>
													break;


												}

												case 'h1': {
													field_output =
														<h1 className={field_class} key={'field' + field_key}
														    dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h1>
													break;
												}

												case 'h2': {
													// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
													let value = field.value;

													if ( step_config.stepName === 'Plugins' ) {

														if (component.props.session.are_plugins_installing) {
															value = field.value_installing;
														}

														if (component.props.session.are_plugins_installed && component.props.session.did_plugins_install) {
															value = field.value_installed;
														}
													}

													if ( step_config.stepName === 'Starter Content' ) {
														if (component.props.session.is_sc_installing) {
															value = field.value_installing;
														}

														if (component.props.session.is_sc_done) {
															value = field.value_installed;
														}
													}

													if (!value) {
														value = field.value;
													}

													field_output =
														<h2 className={field_class} key={'field' + field_key}
														    dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}></h2>
													break;
												}

												case 'h3': {
													field_output =
														<h3 className={field_class} key={'field' + field_key}
														    dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h3>
													break;
												}

												case 'h4': {
													field_output =
														<h4 className={field_class} key={'field' + field_key}
														    dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h4>
													break;
												}

												case 'button': {
													var CSSClass = 'btn  btn--action ';
													if ( ! _.isUndefined( field.class ) ) {
														CSSClass += field.class;
													}

													// replace some pre-defined urls
													field.url = Helpers.replaceUrls(field.url);

													field_output =
														<a className={CSSClass} key={'field' + field_key}
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
														{  Object.keys(field.value).map(function (link_key) {

															var link = links[link_key];

															if ( _.isUndefined( link.label ) || _.isUndefined( link.url ) ) {
																return;
															}

															return <li key={'link-' + link_key }>
																<a href={link.url} target="_blank">{link.label}</a>
															</li>
														})}
													</ul>
													break;
												}

												case 'component': {
													switch (field.value) {
														case 'authenticator': {
															field_output = <Authenticator key={'field' + field_key} />
															break
														}

														case 'plugin-manager': {
															field_output = <PluginManager
																key={'field' + field_key}
																onReady={component.onPluginsReady}
																onRender={component.onPluginsRender}
																onMove={component.onPluginsInstalling}
																defaultNextButtonCallback={component.defaultNextButtonCallback}
																enableIndividualActions={false}
																groupByRequired={true}
															/>
															break
														}

														case 'starter-content': {
															// Do not display anything if there are no Starter Content sources.
															if (!_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
																break;
															}

															field_output = <StarterContent
																key={'field-' + field_key}
																name={field_key}
																onReady={component.onStarterContentReady}
																onRender={component.onStarterContentRender}
																onMove={component.onStarterImporting}
																enable_actions={false}
															/>
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
										})}
									</div>;
								})}
							</div>

								<div className="stepper__navigator">
									{ last_step !== true // this button will not appear on the last step
										?
										this.props.session.is_wizard_skip ?
										<WizardSkipButton
											label={ first_step === true ? pixassist.themeConfig.l10n.notRightNow : component.state.skipButtonLabel || step_config.skipButton }
											href={ first_step === true ? pixassist.dashboardUrl : null }
											onclick={ null !== component.state.skipButtonCallback ? component.state.skipButtonCallback : component.defaultSkipButtonCallback }
											disabled={this.state.skipButtonDisable} /> : ''
										: null }
									{ last_step !== true && true !== component.state.onThemeSelector
										?
										this.props.session.is_wizard_next ?
										<WizardNextButton
											label={ component.state.nextButtonLabel || step_config.nextButton }
											onclick={ null !== component.state.nextButtonCallback ? component.state.nextButtonCallback : component.defaultNextButtonCallback}
											disabled={this.state.nextButtonDisable} /> : ''
										: null }
								</div>
						</div>
						{ ( last_step === true )
							? <a className="btn  btn--text  btn--return-to-dashboard" href={pixassist.dashboardUrl}  onClick={this.handleFinishWizard}>{Helpers.decodeHtml(pixassist.themeConfig.l10n.returnToDashboard)}</a>
							: <span className="logo-pixelgrade"></span> }
					</div>
				</div>
			</div>
	};

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

	dummyAsync = (cb) => {
		this.setState({loading: true}, () => {
			$('.stepper__content').addClass('is--hidden');
			this.asyncTimer = setTimeout(cb, 500);
		});
	};

	/**
	 * Handles the stepper index when the user presses the Next Button
	 *
	 * This is the default behaviour of the `next` button.
	 *
	 * Note that child components like the plugin-manager will overwrite this
	 * @param e event
	 */
	defaultNextButtonCallback = (e) => {
		let {step_index, steps_done} = this.state;

		if (!this.state.loading) {
			this.dummyAsync(() => {
				steps_done.push(step_index);

				this.setState({
					loading: false,
					step_index: step_index + 1,
					steps_done: steps_done
				});

				$('.stepper__content').removeClass('is--hidden');
			});
		}
	};

	/**
	 * Handles the stepper index when the user presses the Skip Button
	 *
	 * This is the default behaviour of the `skip` button.
	 *
	 * Note that child components like the plugin-manager can overwrite this
	 */
	defaultSkipButtonCallback = () => {
		let {step_index} = this.state;

		if (!this.state.loading) {
			this.dummyAsync(() => {
				this.setState({
					loading: false,
					step_index: step_index + 1,
				});

				$('.stepper__content').removeClass('is--hidden');
			});
		}
	};

	/**
	 * Stepper set action
	 * @param step The index of the step
	 */
	setStep = (step) => {
		if ( ! this.state.loading ) {
			this.dummyAsync(() => {
				this.setState({
					loading: false,
					step_index: parseInt(step),
				});

				$('.stepper__content').removeClass('is--hidden');
			});
		}
	};

	/**
	 * Trigger the plugins manager installing (or activating) events
	 *
	 * Note: this function takes place in the `next` button callback
	 */
	startPluginsInstall = () => {
		let component = ReactDOM.findDOMNode(this),
			plugins = component.getElementsByClassName('plugin'),
			event = null;

		if ( !!this.state.nextButtonDisable ) {
			return;
		}

		if (window.CustomEvent) {
			event = new CustomEvent( 'handle_plugin', { detail: {action: 'activate'} } );
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('handle_plugin', true, true, {action: 'activate'});
		}

		if (_.size(plugins)) {
			for (let i = 0; i < _.size(plugins); i++) {
				plugins[i].dispatchEvent(event);
			}
		}

		this.onPluginsInstalling();
	};

	/**
	 * Inform the wizard when the current step is the plugin manager component
	 *
	 * This way we can switch the `Next` button with `Install Plugins`
	 */
	onPluginsRender(plugins = {}) {
		// Dispatch an action to make the skip button available
		this.props.onAvailableSkipButton();

		// If the plugins step is the first one we need to let it's button show
		if ( 0 === this.state.step_index ) {
			this.props.onAvailableNextButton();
		}

		// Decide on the label and callback of "next" button.
		let nextButtonLabel,
			nextButtonCallback = this.startPluginsInstall,
			pluginsActionLabels = [],
			mustInstallPlugins = false,
			mustActivatePlugins = false,
			mustUpdatePlugins = false;

		Object.keys(plugins).map(function ( i, j ) {
			var plugin = plugins[i];

			if (!_.get(plugin,'is_installed', false) && plugin.selected) {
				mustInstallPlugins = true;
			} else if (!_.get(plugin,'is_active', false) && plugin.selected ) {
				mustActivatePlugins = true;
			}

			if (_.get(plugin,'is_update_required', false) && plugin.selected) {
				mustUpdatePlugins = true;
			}
		});

		if (true === mustInstallPlugins) {
			pluginsActionLabels.push(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginInstallLabel', '')));
		}

		if (true === mustActivatePlugins) {
			pluginsActionLabels.push(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginActivateLabel', '')));
		}

		if (true === mustUpdatePlugins) {
			pluginsActionLabels.push(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginUpdateLabel', '')));
		}

		nextButtonLabel = _.join(pluginsActionLabels,'&') + ' ' + Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginsPlural', ''));

		this.setState({nextButtonLabel: nextButtonLabel});
		this.setState({nextButtonCallback: nextButtonCallback});
	}

	/**
	 * This method is passed to the <PluginManager /> component which should use it while installing
	 */
	onPluginsInstalling() {
		// Dispatch an action to make the skip button unavailable
		this.props.onUnAvailableSkipButton();

		this.setState({
			nextButtonDisable: true,
			skipButtonDisable: true
		});

		// @TODO - replace the state above with this action
		// DISPATCH A PLUGINS INSTALLING ACTION
		this.props.onPluginsInstalling();
	}

	/**
	 * This method is passed to the <PluginManager /> component which should use it when all the plugins are active
	 */
	onPluginsReady() {
		this.setState({
			onThemeSelector: false,
			nextButtonDisable: false,
			skipButtonDisable: false,
			nextButtonLabel: pixassist.themeConfig.l10n.nextButton,
			nextButtonCallback: this.defaultNextButtonCallback
		});

		// @TODO - replace the state above with this action
		// DISPATCH A PLUGINS INSTALLED ACTION
		this.props.onPluginsInstalled();
	}

	/**
	 * Trigger the starter content import action
	 */
	startContentImport(){
		this.onStarterImporting();

		let component = ReactDOM.findDOMNode(this),
			import_button = component.getElementsByClassName('import--action');

		if ( ! _.isUndefined( import_button[0] ) ) {
			// force an import action by triggering the click
			import_button[0].click();
		} else {
			this.onStarterContentReady();
		}
	}

	/**
	 * While the starter content is visible, the `next` button should have a custom label and a custom callback
	 * See `startContentImport` method
	 */
	onStarterContentRender() {
		// Dispatch an action to make the skip button available
		this.props.onAvailableSkipButton();

		if (_.size(_.get(this.props.session, 'themeConfig.starterContent.demos', []))) {
			this.setState({nextButtonLabel: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.starterContentLoadLabel', ''))});
			this.setState({nextButtonCallback: this.startContentImport });
		}
	}

	/**
	 * While the Starter Content is importing data, we need to disable the navigation buttons
	 */
	onStarterImporting() {
		// Dispatch an action to make the skip button unavailable
		this.props.onUnAvailableSkipButton();

		this.setState({
			nextButtonDisable: true,
			skipButtonDisable: true
		});
	}

	/**
	 * This method is passed to the <StarterContent /> component and triggered when the import is done
	 */
	onStarterContentReady() {
		this.setState({
			nextButtonDisable: false,
			skipButtonDisable: false,
			nextButtonLabel: pixassist.themeConfig.l10n.nextButton,
			nextButtonCallback: this.defaultNextButtonCallback
		});
	}

	/**
	 * Function passed to child components to be able to update the state remotely
	 * @param state
	 */
	onState(state) {
		this.update_local_state(state);
	}

	/**
	 * Helper function which updates the component state but also sends these modifications to the local server
	 * @param $state
	 */
	update_local_state($state) {
		// ensure that the default actions ar bound
		var component = this;

		// force the step_index to 0 since the authenticator will follow ... always
		$state = { ...$state, ...{ loading: false, step_index: 0 } };

		this.setState( $state, function () {

			Helpers.$ajax(
				pixassist.wpRest.endpoint.globalState.set.url,
				pixassist.wpRest.endpoint.globalState.set.method,
				{
					state: this.state
				},
			)
		});
	}
}

// Reflect back and forth navigation in the stepper in the timeline
window.requestAnimationFrame(function () {
	$('.stepper__step').on('click', function () {
		var $this = $(this);

		$('.stepper__step').removeClass('current  passed');
		$this.addClass('current').prevAll('.stepper__step').addClass('passed');

		if ($this.is('.stepper__step:last-of-type')) {
			$this.addClass('passed');
		}
	});
});

const Steps = connect(mapStateToProps, mapDispatchToProps)(StepsContainer);

export default Steps;
