import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import Helpers from '../helpers'
import {connect} from 'react-redux';
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
			plugins: pixassist.themeConfig.pluginManager.tgmpaPlugins,
			enable_actions: true,
			ready: false
		};

		// we need a callback queue system in order to execute the plugin actions in order.
		this.queue = new Helpers.Queue;

		if ( ! _.isUndefined( this.props.enable_actions ) ) {
			this.state.enable_actions = this.props.enable_actions;
		}

		this.getPluginStatus = this.getPluginStatus.bind(this);
		this.handlePluginTrigger = this.handlePluginTrigger.bind(this);
		this.activatePlugin = this.activatePlugin.bind(this);
		this.eventInstallPlugin = this.eventInstallPlugin.bind(this);
		this.eventActivatePlugin = this.eventActivatePlugin.bind(this);
		this.eventUpdatePlugin = this.eventUpdatePlugin.bind(this);
		this.createPseudoUpdateElement = this.createPseudoUpdateElement.bind(this);
		this.markPluginAsActive = this.markPluginAsActive.bind(this);
	}

	render() {
		let component = this;

		return <div className="plugins">
				{
				!_.isUndefined(this.state.plugins) && !_.isEmpty(this.state.plugins) ?
				Object.keys(this.state.plugins).map(function ( plugin_slug, j ) {
					if ( 'pixelgrade-assistant' === plugin_slug ) {
						// we should not reinstall or change the Pixelgrade Assistant plugin
						return true;
					}

					let plugin = component.state.plugins[plugin_slug],
						status = component.getPluginStatus(plugin),
						boxClasses = "plugin  box";

					let action = '';

					switch ( status ) {
						case 'active' :
							boxClasses += "  box--plugin-validated";
							break;
						case 'outdated' :
							boxClasses += "  box--warning  box--plugin-invalidated";

							/** For each plugin we need a <tr> element to trick shiny the updates system **/
							let action_available = component.createPseudoUpdateElement(plugin.slug);
							action = (
								<button onClick={component.eventUpdatePlugin} className="btn  btn--action  btn--small"
										data-available={action_available}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.updateButton', ''))}</button>
							);
							break;
						case 'inactive' :
							boxClasses += "  box--warning  box--plugin-invalidated";

							action = (
								<button onClick={component.eventActivatePlugin} className="btn  btn--action  btn--small">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginActivateLabel', ''))}</button>
							);
							break;
						case 'missing' :
							boxClasses += "  box--neutral  box--plugin-missing  box--plugin-invalidated";

							action = (
								<button onClick={component.eventInstallPlugin} className="btn  btn--action  btn--small">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginInstallLabel', ''))}</button>
							);
							break;
						default :
							break;
					}

					let data_activate_url = '',
						data_install_url = '';

					if ( ! _.isUndefined( plugin.install_url ) ) {
						data_install_url = plugin.install_url.replace(/&amp;/g, '&');
					}

					if ( ! _.isUndefined( plugin.activate_url ) ) {
						data_activate_url = plugin.activate_url.replace(/&amp;/g, '&');
					}

					return (
						<div key={plugin_slug} className={boxClasses} data-status={status} data-slug={plugin.slug} data-real_slug={plugin.file_path}
						     data-activate_url={data_activate_url} data-install_url={data_install_url} >
							<div className="box__body">
								<h5 className="box__title">{plugin.name}</h5>
								<p className="box__text" dangerouslySetInnerHTML={{__html: plugin.description }}></p>
							</div>
							<div className="box__cta">{ component.state.enable_actions ? action : null }</div>
						</div>
					)
				}) : 'No plugins' }
			</div>
	}

	componentDidMount() {
		let componentNode = ReactDOM.findDOMNode(this),
			plugins = componentNode.getElementsByClassName('plugin');

		if ( plugins.length > 0 ) {
			for ( var i = 0; i < plugins.length; i++ ) {
				plugins[i].addEventListener('handle_plugin', this.handlePluginTrigger);
			}
		}
	}

	UNSAFE_componentWillMount(){

		if ( this.props.onRender ) {
			this.props.onRender(_.get(this.state, 'plugins', {}));
		}

		this.checkPluginsReady();
	}

	componentWillUnmount() {
		// Make sure to remove the DOM listener when the component is unmounted
		let componentNode = ReactDOM.findDOMNode(this),
			plugins = componentNode.getElementsByClassName('plugin');

		if ( _.size(plugins) ) {
			for ( var i = 0; i < _.size(plugins); i++ ) {
				plugins[i].removeEventListener('handle_plugin', this.handlePluginTrigger);
			}
		}

	}

	componentWillUpdate( nextProps, nextState, nextContext ) {
		this.checkPluginsReady();
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

				if ( !_.get(plugin,'is_active', false) || !_.get(plugin,'is_up_to_date', false)) {
					plugins_ready = false;
				}

				// In case of failure we will mark the plugin as ready, but only in the setup wizard so the continue button becomes available.
				if ( window.location.search.indexOf('setup-wizard') > -1 ) {
					if (!!_.get(plugin, 'is_failed', false)) {
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
	}

	/**
	 * @param ev
	 * @returns {boolean}
	 */
	handlePluginTrigger(ev ) {
		let plugin_el = ev.target,
			$plugin = jQuery(ev.target),
			status = $plugin.data('status'),
			activate_url = $plugin.data('activate_url');

		if ( status === 'missing' ) {
			this.installPlugin(plugin_el);
			return false;
		}

		if ( status === 'outdated' ) {
			this.updatePlugin(plugin_el, activate_url);
			return false;
		}

		if ( status !== 'active' ) {
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
			activate_url = $plugin.data('activate_url'),
			install_url = $plugin.data('install_url'),
			temp = wp.ajax.settings.url,
			$text = $plugin.find('.box__text');

		$plugin.addClass('box--plugin-missing').removeClass('box--warning');

		setTimeout( function() {
			$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginInstallingMessage', '')));
			$plugin.addClass('box--plugin-installing');
		}, 200);

		let cb = function () {
			var self = this;

			wp.updates.installPlugin(
				{
					slug: $plugin.data('slug'),
					success: function ( response ) {
						$plugin.removeClass('box--plugin-installing');

						$plugin.addClass('box--plugin-installed');
						component.markPluginAsInstalled($plugin.data('slug'));

						if ( response.activateUrl ) {
							// The plugin needs to be activated
							component.activatePlugin(plugin_el, activate_url);
						} else {
							// The plugin is already active.
							$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
							$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
							component.markPluginAsActive($plugin.data('slug'));
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

		$plugin.addClass('box--plugin-installed').removeClass('box--warning');

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
			}).always(function (res) {
				$plugin.removeClass('box--plugin-activating');
				// If we get the `Sorry, you are not allowed to access this page.` message it means that the plugin is already OK.
				if ( res.indexOf('<div id="message" class="updated"><p>') > -1
					|| res.indexOf('<p>' . _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpActivatedSuccessfully', '')) > -1
					|| res.indexOf('<p>' . _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginActivated', '')) > -1
					|| res.indexOf('<p>' . _.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginAlreadyActive', '')) > -1
					|| res.indexOf(_.get(pixassist, 'themeConfig.pluginManager.l10n.tgmpNotAllowed', '')) > -1 ) {
					$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
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

		$plugin.addClass('box--plugin-installed').removeClass('box--warning');

		setTimeout( function() {
			$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginUpdatingMessage', '')));
			$plugin.addClass('box--plugin-updating');
		}, 200);

		let cb = function () {
			var self = this;
			wp.updates.updatePlugin({
				slug: slug,
				plugin: realPluginSlug,
				abort_if_destination_exists: false,
				success: function (res) {
					$plugin.removeClass('box--plugin-updating');
					if ( !_.isUndefined(res.activateUrl) && !_.isEmpty(res.activateUrl)) {
						component.activatePlugin(plugin_el, res.activateUrl);
					} else {
						$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
						$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginUpToDate', '')));
					}

					component.markPluginAsUpdated($plugin.data('slug'));

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
			});
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
		if ( !plugin.is_up_to_date ) {
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
