import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import Switch from '@material-ui/core/Switch';
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
		onSupportActive: () => {
			dispatch({ type: 'SUPPORT_ON' });
		},
		onSupportClosed: () => {
			dispatch({ type: 'SUPPORT_OFF' });
		},
		onAvailableSkipButton: () => {
			dispatch({ type: 'SKIP_BUTTON_AVAILABLE' })
		},
		onUnAvailableSkipButton: () => {
			dispatch({ type: 'SKIP_BUTTON_UNAVAILABLE' })
		},
		onStarterContentInstalling: () => {
			dispatch({ type: 'STARTER_CONTENT_INSTALLING' })
		},
		onStarterContentFinished: () => {
			dispatch({ type: 'STARTER_CONTENT_DONE' })
		},
		onThemeSelected: ( theme_name ) => {
			dispatch({ type: 'ON_SELECTED_THEME', theme_name: theme_name});
		},
		onThemeActivated: ( theme_name ) => {
			dispatch({ type: 'ON_ACTIVATED_THEME', theme_name: theme_name});
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
		this.onChange = this.onChange.bind(this);
		this.handlePluginTrigger = this.handlePluginTrigger.bind(this);
		this.activatePlugin = this.activatePlugin.bind(this);
		this.eventInstallPlugin = this.eventInstallPlugin.bind(this);
		this.eventUpdatePlugin = this.eventUpdatePlugin.bind(this);
		this.createPseudoUpdateElement = this.createPseudoUpdateElement.bind(this);
		this.markPluginAsActive = this.markPluginAsActive.bind(this);
	}

	render() {
		var component = this;

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
						checked = false,
						boxClasses = "plugin  box";

					if ( status === 'active' ) {
						checked = true;
					}

					let action = <Switch checked={checked} onChange={component.onChange}/>;

					if ( status === 'missing' ) {
						action =
							<button onClick={component.eventInstallPlugin} className="btn  btn--action  btn--small">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.pluginInstallLabel', ''))}</button>;
					} else if ( status === 'outdated' ) {
						/** For each plugin we need a <tr> element to trick shiny the updates system **/
						let action_available = component.createPseudoUpdateElement(plugin.slug);

						action =
							<button onClick={component.eventUpdatePlugin} className="btn  btn--action  btn--small sss"
									data-available={action_available}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.updateButton', ''))}</button>;
					}

					switch ( status ) {
						case 'active' :
							boxClasses += "  box--plugin-validated";
							break;
						case 'outdated' :
						case 'inactive' :
							boxClasses += "  box--warning  box--plugin-invalidated";
							break;
						case 'missing' :
							boxClasses += "  box--neutral  box--plugin-missing  box--plugin-invalidated";
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
							<div className="box__cta">{ (component.state.enable_actions ) ? action : null }</div>
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

	componentWillMount(){

		if ( this.props.onRender ) {
			this.props.onRender(_.get(this.state, 'plugins', {}));
		}
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
		let plugins_ready = true,
			component = this;

		if ( !_.size(this.state.plugins) ) {
			plugins_ready = false;
		}


		if  ( !_.isUndefined(this.state.plugins) ) {
			Object.keys(this.state.plugins).map(function ( i, j ) {
				var plugin = component.state.plugins[i];

				if (!_.get(plugin,'is_installed', false) || !_.get(plugin,'is_active', false) || !_.get(plugin,'is_up_to_date', false)) {
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

		if ( plugins_ready === true && !this.state.ready ) {
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
			$text.text('Installing ...');
			$plugin.addClass('box--plugin-installing');
		}, 200);

		let cb = function () {
			var self = this;
			wp.ajax.settings.url = install_url;
			wp.ajax.send({type: 'GET'}).always(function ( res ) {
				$plugin.removeClass('box--plugin-installing');
				// If the plugin was installed we can activate it now
				// We determine this by searching for certain strings that TGMPA outputs.
				if ( res.indexOf('Plugin installed successfully.') !== false || res.indexOf('Successfully installed the plugin') !== false || res.indexOf('Sorry, you are not allowed to access this page.') ) {
					$plugin.addClass('box--plugin-installed');
					component.markPluginAsInstalled($plugin.data('slug'));

					component.activatePlugin(plugin_el, activate_url);
				} else {
					$plugin.addClass('box--error');
					$plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.installFailedMessage', '')));
					component.markPluginAsFailed($plugin.data('slug'));
				}

				self.next();
			});
			wp.ajax.settings.url = temp;
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
			$text.text( 'Activating...');
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
				if ( res.indexOf('The following plugin was activated successfully') || res.indexOf('Sorry, you are not allowed to access this page.') ) {
					$plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
					$text.text(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
					component.markPluginAsActive($plugin.data('slug'));
				} else {
					$plugin.addClass('box--error');
					$plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
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

	onChange( e ) {
		// var box = jQuery(e.target).parents('.box');
	}

	/**
	 * @param e
	 * @private
	 */
	eventInstallPlugin(e ) {
		let plugin = jQuery(e.target).parents('.box'),
			event;

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
	eventUpdatePlugin(e) {
		let plugin = jQuery(e.target).parents('.box'),
			event;

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
		if ( !plugin.is_installed ) {
			return 'missing';
		}

		if ( !plugin.is_active ) {
			return 'inactive';
		}

		if ( !plugin.is_up_to_date ) {
			return 'outdated';
		}

		return 'active';
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
