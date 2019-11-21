import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import Helpers from '../helpers'
import {connect} from 'react-redux';
import Checkbox from '@material-ui/core/Checkbox';
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
		onLoadingFinished: () => {
			dispatch({ type: 'LOADING_DONE' });
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
		}
	}
};

class PluginManagerContainer extends React.Component {

	timer = null;
	interval = null;

	constructor( props ) {
		// this makes the this
		super(props);

		this.state = {
			plugins: this.standardizePlugins( pixassist.themeConfig.pluginManager.tgmpaPlugins ),
			enableIndividualActions: true,
			groupByRequired: false,
			ready: false
		};

		// we need a callback queue system in order to execute the plugin actions in order.
		this.queue = new Helpers.Queue;

		if ( ! _.isUndefined( this.props.enableIndividualActions ) ) {
			this.state.enableIndividualActions = this.props.enableIndividualActions;
		}

		if ( ! _.isUndefined( this.props.groupByRequired ) ) {
			this.state.groupByRequired = this.props.groupByRequired;
		}

		this.getPluginStatus = this.getPluginStatus.bind(this);
		this.handlePluginTrigger = this.handlePluginTrigger.bind(this);
		this.activatePlugin = this.activatePlugin.bind(this);
		this.eventInstallPlugin = this.eventInstallPlugin.bind(this);
		this.eventActivatePlugin = this.eventActivatePlugin.bind(this);
		this.eventUpdatePlugin = this.eventUpdatePlugin.bind(this);
		this.createPseudoUpdateElement = this.createPseudoUpdateElement.bind(this);
		this.markPluginAsActive = this.markPluginAsActive.bind(this);
		this.updatePluginsList = this.updatePluginsList.bind(this);
		this.handlePluginSelect = this.handlePluginSelect.bind(this);
	}

	render() {
		let component = this,
			sortedPluginSlugs = [];

		if ( !_.isUndefined(this.state.plugins) && !_.isEmpty(this.state.plugins) ) {
			sortedPluginSlugs = Object.keys(this.state.plugins);
			// First, we want to sort plugins by their order, ascending.
			sortedPluginSlugs.sort( function( a, b ) {
				if ( _.isNil( component.state.plugins[a].order ) ) {
					component.state.plugins[a].order = 10;
				} else {
					component.state.plugins[a].order = _.toNumber( component.state.plugins[a].order );
				}
				if ( _.isNil( component.state.plugins[b].order ) ) {
					component.state.plugins[b].order = 10;
				} else {
					component.state.plugins[b].order = _.toNumber( component.state.plugins[b].order );
				}

				if ( component.state.plugins[a].order < component.state.plugins[b].order ) {
					return -1;
				}

				if ( component.state.plugins[a].order > component.state.plugins[b].order ) {
					return 1;
				}

				return 0;
			} )

			// Second, we want to sort plugins by their required status. First the required ones, and then the recommended ones.
			sortedPluginSlugs.sort( function( a, b ) {
				if ( component.state.plugins[a].required && !component.state.plugins[b].required ) {
					return -1;
				}

				if ( !component.state.plugins[a].required && component.state.plugins[b].required ) {
					return 1;
				}

				return 0;
			} )
		}

		let containerClasses = "plugins";
		if ( !component.state.enableIndividualActions ) {
			containerClasses += "  no-individual-actions no-status-icons";
		}

		let currentRequiredGroup = false;

		return <div className={containerClasses}>
				{
				!_.isEmpty(sortedPluginSlugs) ?
					sortedPluginSlugs.map(function ( plugin_slug, j ) {
					if ( 'pixelgrade-care' === plugin_slug ) {
						// we should not reinstall or change the Pixelgrade Care plugin
						return true;
					}

					let plugin = component.state.plugins[plugin_slug],
						status = component.getPluginStatus(plugin),
						boxClasses = "plugin  box",
						action = '';

					switch ( status ) {
						case 'active' :
							boxClasses += "  box--plugin-validated";
							break;
						case 'outdated' :
							// We will not mark plugins as invalid when they have an update available and individual actions are not enabled.
							if ( !component.state.enableIndividualActions ) {
								boxClasses += "  box--plugin-validated";
								break;
							}

							if ( plugin.required ) {
								boxClasses += "  box--plugin-invalidated";

								if ( component.state.enableIndividualActions ) {
									boxClasses += "  box--warning";
								} else {
									boxClasses += "  box--neutral";
								}
							} else {
								boxClasses += "  box--neutral";
							}

							/** For each plugin we need a <tr> element to trick shiny the updates system **/
							let action_available = component.createPseudoUpdateElement(plugin.slug);
							action = (
								<button onClick={component.eventUpdatePlugin} className="btn  btn--action  btn--small"
										data-available={action_available}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.updateButton', ''))}</button>
							);
							break;
						case 'inactive' :
							if ( plugin.required ) {
								boxClasses += "  box--plugin-invalidated";

								if ( component.state.enableIndividualActions ) {
									boxClasses += "  box--warning";
								} else {
									boxClasses += "  box--neutral";
								}
							} else {
								boxClasses += "  box--neutral";
							}

							action = (
								<button onClick={component.eventActivatePlugin} className="btn  btn--action  btn--small">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginActivateLabel', ''))}</button>
							);
							break;
						case 'missing' :
							if ( plugin.required ) {
								if ( component.state.enableIndividualActions ) {
									boxClasses += "  box--warning";
								} else {
									boxClasses += "  box--neutral";
								}

								boxClasses += "  box--plugin-invalidated";
							} else {
								boxClasses += "  box--neutral";
							}

							action = (
								<button onClick={component.eventInstallPlugin} className="btn  btn--action  btn--small">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginInstallLabel', ''))}</button>
							);
							break;
						default :
							break;
					}

					let data_activate_url = '',
						data_install_url = '',
						data_source_type = 'repo', // By default we assume plugins are from the WordPress.org repo.
						plugin_author = '';

					if ( !_.isNil( plugin.install_url ) ) {
						data_install_url = plugin.install_url.replace(/&amp;/g, '&');
					}

					if ( !_.isNil( plugin.activate_url ) ) {
						data_activate_url = plugin.activate_url.replace(/&amp;/g, '&');
					}

					if ( 'external' === _.get(plugin, 'source_type', false) ) {
						data_source_type = 'external';
					}

					if ( !!plugin.author ) {
						plugin_author = (
							<span className="plugin-author"> by {plugin.author}</span>
						);
					}

					let checkbox = '',
						cta = '';
					// If the individual actions are not enabled, then it means we treat the plugins as a list, so we need to add checkboxes to each.
					if ( !component.state.enableIndividualActions ) {
						let checkboxDisabled = false;

						if ( plugin.required ) {
							// If this is a required plugin, disable the checkbox.
							checkboxDisabled = true;
						} else if ( 'active' === status || 'outdated' === status ) {
							// If this plugin is already active, or is outdated (still active), disable the checkbox as we will do nothing to it.
							checkboxDisabled = true;
						}

						checkbox = (
							<div className="box__checkbox">
								<Checkbox
									disabled={checkboxDisabled}
									checked={plugin.selected}
									onChange={component.handlePluginSelect(plugin_slug)}
									value={plugin_slug}
									color="primary"
								/>
							</div>
						)
					} else {
						cta = (
							<div className="box__cta">{action}</div>
						)
					}

					let groupLabel = '';
					if ( component.state.groupByRequired ) {
						const pluginGroup = plugin.required ? 'required' : 'recommended';

						// We start a new group and output the label.
						if ( currentRequiredGroup !== pluginGroup ) {
							currentRequiredGroup = pluginGroup;

							groupLabel = (
								<p className={"required-group__label  required-group--" + pluginGroup}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.groupByRequiredLabels.' + currentRequiredGroup, ''))}</p>
							)
						}
					}

					return (
						<React.Fragment key={plugin_slug}>
							{groupLabel}
							<div className={boxClasses}
								 data-status={status}
								 data-source_type={data_source_type}
								 data-slug={plugin.slug}
								 data-real_slug={plugin.file_path}
								 data-activate_url={data_activate_url}
								 data-install_url={data_install_url} >
								{checkbox}
							<div className="box__body">
									<h5 className="box__title">{plugin.name}{plugin_author}</h5>
								<p className="box__text" dangerouslySetInnerHTML={{__html: plugin.description }}></p>
							</div>
								{cta}
						</div>
						</React.Fragment>
					)
					})
					:
					<p>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.noPlugins', ''))}</p>
				}
			</div>
	}

	componentDidMount() {
		let component = this;

		let componentNode = ReactDOM.findDOMNode(this),
			plugins = componentNode.getElementsByClassName('plugin');

		if ( plugins.length > 0 ) {
			// Listen for the event to start the action for each plugin.
			for ( var i = 0; i < plugins.length; i++ ) {
				plugins[i].addEventListener('handle_plugin', component.handlePluginTrigger);
			}
		}

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', component.updatePluginsList);
	}

	UNSAFE_componentWillMount(){
		let component = this;

		if ( component.props.onRender ) {
			component.props.onRender(_.get(this.state, 'plugins', {}));
		}

		component.checkPluginsReady();
	}

	componentWillUnmount() {
		let component = this;

		// Make sure to remove the DOM listener when the component is unmounted
		let componentNode = ReactDOM.findDOMNode(this),
			plugins = componentNode.getElementsByClassName('plugin');

		if ( _.size(plugins) ) {
			for ( var i = 0; i < _.size(plugins); i++ ) {
				plugins[i].removeEventListener('handle_plugin', component.handlePluginTrigger);
			}
		}

		window.removeEventListener( 'localizedChanged', component.updatePluginsList )
	}

	componentDidUpdate( nextProps, nextState, nextContext ) {
		this.checkPluginsReady();
	}

	standardizePlugins( plugins ) {
		// Regardless if have individual actions, we treat plugins as a list to choose from (i.e. with checkboxes) and all need to be selected or not.
		let pluginSlugs = Object.keys(plugins);
		for( let idx=0; idx < pluginSlugs.length; idx++ ) {
			// If we are in the dashboard, all are selected because they have individual controls.
			if ( !(window.location.search.indexOf('setup-wizard') > -1) ) {
				plugins[pluginSlugs[idx]].selected = true;
				continue;
			}

			// Required plugins are always selected.
			if ( plugins[pluginSlugs[idx]].required ) {
				plugins[pluginSlugs[idx]].selected = true;
			} else if ( typeof plugins[ pluginSlugs[idx] ].selected === "undefined" ) {
				// Recommended plugins are not selected by default, unless they come with the selected state already.
				plugins[pluginSlugs[idx]].selected = false;
			}

			// Regardless of selected initial state, we have a few cases when a plugin is selected no matter what. Like when it is active.
			let status = this.getPluginStatus(plugins[pluginSlugs[idx]]);
			if ( 'active' === status || 'outdated' === status ) {
				plugins[pluginSlugs[idx]].selected = true;
			}
		}

		return plugins;
	}

	updatePluginsList(event) {
		let component = this;

		component.setState({plugins: component.standardizePlugins( pixassist.themeConfig.pluginManager.tgmpaPlugins )});

		component.checkPluginsReady();
	}

	handlePluginSelect = plugin_slug => event => {
		let component = this,
			plugins = component.state.plugins;

		plugins[plugin_slug].selected = event.target.checked;

		component.setState({plugins: plugins});

		// We need to rerender the entire plugins components, so the step button will update.
		if ( component.props.onRender && window.location.search.indexOf('setup-wizard') > -1 ) {
			component.props.onRender(plugins);
		}

	}

	checkPluginsReady() {
		let plugins_ready = true,
			component = this;

		if ( !_.size(this.state.plugins) ) {
			plugins_ready = false;
		}


		if  ( !_.isUndefined(this.state.plugins) ) {
			Object.keys(this.state.plugins).map(function ( i, j ) {
				var plugin = component.state.plugins[i];

				if ( !_.get(plugin,'is_active', false) && plugin.selected ) {
					plugins_ready = false;
				}

				// In case of failure we will mark the plugin as ready, but only in the setup wizard so the continue button becomes available.
				if ( window.location.search.indexOf('setup-wizard') > -1 ) {
					if (!!_.get(plugin, 'is_failed', false) && plugin.selected) {
						plugins_ready = true;
					}
				}
			});
		}

		if (_.isUndefined(this.state.plugins) || _.isEmpty(this.state.plugins)) {
			plugins_ready = true;
		}

		if ( plugins_ready === true && ! this.state.ready ) {
			this.setState({ready: true});

			this.props.onReady();
		}

		if ( plugins_ready === false && this.state.ready ) {
			this.setState({ready: false});
		}
	}

	/**
	 * @param ev
	 * @returns {boolean}
	 */
	handlePluginTrigger(ev ) {
		let component = this,
			plugin_el = ev.target,
			$plugin = jQuery(ev.target),
			slug = $plugin.data('slug'),
			status = component.getPluginStatus(component.state.plugins[slug]),
			activate_url = $plugin.data('activate_url');

		// Even if we don't show checkboxes (enableIndividualActions is true), plugins should still pe selected.
		if ( !component.state.plugins[slug].selected ) {
			return false;
		}

		if ( status === 'missing' ) {
			this.installPlugin(plugin_el);
			return false;
		}

		if ( status === 'outdated' && !(window.location.search.indexOf('setup-wizard') > -1) ) {
			this.updatePlugin(plugin_el, activate_url);
			return false;
		}

		if ( !(status === 'active' || status === 'outdated' ) ) {
			this.activatePlugin(plugin_el, activate_url);
		} else {
			this.markPluginAsActive($plugin.data('slug'));
		}

		return true;
	}

	/**
	 * @param plugin_el
	 */
	installPlugin(plugin_el ) {
		var component = this,
			$plugin = jQuery(plugin_el),
			$text = $plugin.find('.box__text');

		$plugin.addClass('box--plugin-invalidated box--plugin-missing').removeClass('box--warning box--neutral');

		setTimeout( function() {
			$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginInstallingMessage', '')));
			$plugin.addClass('box--plugin-installing');
		}, 200);

		let cb = function () {
			var self = this;

			wp.updates.installPlugin(
				{
					slug: $plugin.data('slug'),
					pixassist_plugin_install: true, // We need a bulletproof way of detecting the AJAX request, server-side.
					plugin_source_type: $plugin.data('source_type'),
					force_tgmpa: 'load', // We need to put this flag so the TGMPA will be loaded - see PixelgradeCare_Admin::force_load_tgmpa()

					success: function ( response ) {
						$plugin.removeClass('box--plugin-installing');

						$plugin.addClass('box--plugin-installed');
						component.markPluginAsInstalled($plugin.data('slug'));
						$plugin.data('status', 'inactive');

						if ( response.activateUrl ) {
							// The plugin needs to be activated
							component.activatePlugin(plugin_el, $plugin.data('activate_url'));
						} else {
							// The plugin is already active.
							$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
							$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
							component.markPluginAsActive($plugin.data('slug'));
							$plugin.data('status', 'active');
						}

						self.next();
					},
					error: function ( error ) {
						$plugin.removeClass('box--plugin-installing');

						$plugin.addClass('box--error');
						$plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
						$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.installFailedMessage', '')));
						component.markPluginAsFailed($plugin.data('slug'));

						self.next();
					}
				}
			);
		};

		component.queue.add(cb);
	}

	/**
	 * @param plugin_el
	 * @param url
	 */
	activatePlugin(plugin_el, url ) {
		var component = this,
			$plugin = jQuery(plugin_el),
			temp = wp.ajax.settings.url,
			$text = $plugin.find('.box__text');

		$plugin.addClass('box--plugin-invalidated box--plugin-installed').removeClass('box--warning box--neutral');

		setTimeout( function() {
			$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginActivatingMessage', '')));
			$plugin.addClass('box--plugin-activating');
		}, 200);

		let cb = function () {
			var self = this;
			wp.ajax.settings.url = url;
			wp.ajax.send({
				type: 'GET',
				cache: false,
			}).always(function (response) {
				$plugin.removeClass('box--plugin-activating');

				// Sometimes res can be an object.
				if ( !_.isNil( response.responseText ) ) {
					response = response.responseText;
				}

				// If we get the `Sorry, you are not allowed to access this page.` message it means that the plugin is already OK.
				if ( response.indexOf('<div id="message" class="updated"><p>') > -1
					|| response.indexOf('<p>' + _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpActivatedSuccessfully', '')) > -1
					|| response.indexOf('<p>' + _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginActivated', '')) > -1
					|| response.indexOf('<p>' + _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginAlreadyActive', '')) > -1
					|| response.indexOf(_.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpNotAllowed', '')) > -1 ) {
					$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
					$plugin.data('status', 'active');
					component.markPluginAsActive($plugin.data('slug'));
				} else {
					$plugin.addClass('box--error');
					$plugin.removeClass('box--plugin-validated').removeClass('box--plugin-installed').addClass('box--plugin-invalidated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.activateFailedMessage', '')));
					component.markPluginAsFailed($plugin.data('slug'));
				}
				self.next();
			})

			wp.ajax.settings.url = temp;
		};

		component.queue.add(cb);
	}

	updatePlugin(plugin_el, url) {
		var component = this,
			$plugin = jQuery(plugin_el),
			slug = $plugin.data('slug'),
			realPluginSlug = $plugin.data('real_slug'),
			$text = $plugin.find('.box__text');

		$plugin.addClass('box--plugin-invalidated box--plugin-installed').removeClass('box--warning box--neutral');

		setTimeout( function() {
			$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginUpdatingMessage', '')));
			$plugin.addClass('box--plugin-updating');
		}, 200);

		let cb = function () {
			var self = this;

			let args = {
				slug: slug,
				plugin: realPluginSlug,
				abort_if_destination_exists: false,
				pixassist_plugin_update: true, // We need a bulletproof way of detecting the AJAX request, server-side.
				plugin_source_type: $plugin.data('source_type'),
				force_tgmpa: 'load', // We need to put this flag so the TGMPA will be loaded - see PixelgradeCare_Admin::force_load_tgmpa()
				success: function (response) {
					$plugin.removeClass('box--plugin-updating');
						$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginUpToDate', '')));

					component.markPluginAsUpdated($plugin.data('slug'));

					// We will always attempt to activate since we don't know if it needs to, based on the response.
					component.activatePlugin(plugin_el, $plugin.data('activate_url'));

					self.next();
				},
				error: function (e) {
					$text.text(e.errorMessage);
					$plugin.addClass('box--error');
					$plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
					$plugin.removeClass('box--plugin-updating');

					component.markPluginAsFailed(slug);

					self.next();
				}
			};

			jQuery(document).trigger( 'wp-plugin-updating', args );

			wp.updates.ajax( 'update-plugin', args );
		}

		component.queue.add(cb);
	}

	markPluginAsInstalled(plugin ) {
		let currentPluginsState = this.state.plugins;

		if ( ! _.isUndefined( currentPluginsState[plugin] ) ) {
			currentPluginsState[plugin].is_installed = true;
			this.setState({plugins: currentPluginsState, ready: false});
		}
	}

	markPluginAsActive(plugin ) {
		let currentPluginsState = this.state.plugins;

		if ( ! _.isUndefined( currentPluginsState[plugin] ) ) {
			currentPluginsState[plugin].is_active = true;
			this.setState({plugins: currentPluginsState, ready: false});
		}
	}

	markPluginAsUpdated(plugin ) {
		let currentPluginsState = this.state.plugins;

		if ( ! _.isUndefined( currentPluginsState[plugin] ) ) {
			currentPluginsState[plugin].is_up_to_date = true;
			this.setState({plugins: currentPluginsState, ready: false});
		}
	}

	markPluginAsFailed(plugin ) {
		let currentPluginsState = this.state.plugins;

		if ( ! _.isUndefined( currentPluginsState[plugin] ) ) {
			currentPluginsState[plugin].is_failed = true;
			this.setState({plugins: currentPluginsState, ready: false});
		}
	}

	/**
	 * @param e
	 * @private
	 */
	eventInstallPlugin(e ) {
		let $target = jQuery(e.target),
			plugin = $target.parents('.box'),
			event;

		wp.updates.maybeRequestFilesystemCredentials( e );

		// Hide the button
		if ( $target.is('button') ) {
			$target.fadeOut();
		}

		if ( window.CustomEvent ) {
			event = new CustomEvent('handle_plugin', {detail: {action: 'install'}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('handle_plugin', true, true, {action: 'install'});
		}

		if ( _.size(plugin) ) {
			plugin = Helpers.getFirstItem(plugin);
			// debugger;
			plugin.dispatchEvent(event);
		}
	}

	/**
	 * @param e
	 * @private
	 */
	eventActivatePlugin(e ) {
		let $target = jQuery(e.target),
			plugin = $target.parents('.box'),
			event;

		// Hide the button
		if ( $target.is('button') ) {
			$target.fadeOut();
		}

		if ( window.CustomEvent ) {
			event = new CustomEvent('handle_plugin', {detail: {action: 'activate'}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('handle_plugin', true, true, {action: 'activate'});
		}

		if ( _.size(plugin) ) {
			plugin = Helpers.getFirstItem(plugin);
			// debugger;
			plugin.dispatchEvent(event);
		}
	}


	/**
	 * @param e
	 * @private
	 */
	eventUpdatePlugin(e) {
		let $target = jQuery(e.target),
			plugin = $target.parents('.box'),
			event;

		wp.updates.maybeRequestFilesystemCredentials( e );

		// Hide the button
		if ( $target.is('button') ) {
			$target.fadeOut();
		}

		if ( window.CustomEvent ) {
			event = new CustomEvent('handle_plugin', {detail: {action: 'update'}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('handle_plugin', true, true, {action: 'update'});
		}

		if ( _.size(plugin) ) {
			plugin = Helpers.getFirstItem(plugin);
			// debugger;
			plugin.dispatchEvent(event);
		}
	}

	/**
	 * Shiny updates v3 will need some data from the plugin row so we recreate the item-update-row template on our page also.
	 * @param slug
	 */
	createPseudoUpdateElement(slug ) {

		if ( jQuery('#tmpl-item-update-row').length === 0 ) {
			return false;
		}

		// create a pseudo tr which offers necessary data for the plugin update
		var tmpl_update_plugin = wp.template('item-update-row'),
			table = document.createElement('table'),
			html = tmpl_update_plugin({slug: slug, plugin: slug, colspan: '1', content: ''});

		if ( typeof html === 'undefined' ) {
			return false;
		}

		tmpl_update_plugin = jQuery.trim(html);

		table.innerHTML = tmpl_update_plugin;
		table.hidden = true;

		//this element can stay at the end of the body
		jQuery(document).find('body').append(table);

		return true;
	}

	getPluginStatus(plugin ) {
		if ( plugin.is_active && !plugin.is_up_to_date ) {
			return 'outdated';
		}

		if ( plugin.is_active ) {
			return 'active';
		}

		if ( plugin.is_installed ) {
			return 'inactive';
		}

		return 'missing';
	}
}

PluginManagerContainer.propTypes = {
	onRender: PropTypes.func,
	onReady: PropTypes.func,
	onMove: PropTypes.func,
	defaultNextButtonCallback: PropTypes.func,
}

const PluginManager = connect(mapStateToProps, mapDispatchToProps)(PluginManagerContainer);

export default PluginManager;
