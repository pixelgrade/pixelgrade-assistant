import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // Required for browser compatibility.
import Helpers from '../helpers';
import ProgressBar from "./ProgressBar/ProgressBar";
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
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
		onStarterContentErrored: () => {
			dispatch({ type: 'STARTER_CONTENT_ERRORED' })
		},
		onStarterContentStop: () => {
			dispatch({ type: 'STARTER_CONTENT_STOP' })
		},
		onStarterContentResume: () => {
			dispatch({ type: 'STARTER_CONTENT_RESUME' })
		},
	}
};

/**
 * This is a React Component which handles the Demo Data import from a specified server
 */
class StarterContentContainer extends React.Component {

	static get defaultProps() {
		return {
			onMove : function () {},
			onReady : function () {},
			onRender : function () {}
		}
	}

	constructor(props) {
		// this makes the this
		super(props);

		// @todo We need an error state here
		if ( _.isUndefined( pixassist.themeConfig.starterContent ) ) {
			return;
		}

		// we need a callback queue system in order to execute the import in subsequent steps
		this.queue = new Helpers.Queue;

		this.state = {
			demos: this.standardizeDemos(_.get(pixassist, 'themeConfig.starterContent.demos', [])),
			importing: false,
			demoClass: 'box--neutral',
			log: [],
		}

		if (_.size(this.state.demos)) {
			// First, we want to sort demos by their order, ascending.
			let sortedDemoKeys = this.sortDemoKeys(Object.keys(this.state.demos));

			// By default, the first demo is selected.
			this.state.selectedDemoKey = sortedDemoKeys[0];
		}

		this.handleDemoSelect = this.handleDemoSelect.bind(this);
		this.sortDemoKeys = this.sortDemoKeys.bind(this);
		this.onImportClick = this.onImportClick.bind(this);
		this.onImportStopClick = this.onImportStopClick.bind(this);
		this.addLogEntry = this.addLogEntry.bind(this);
		this.handleFetchErrors = this.handleFetchErrors.bind(this);

		this.importMedia = this.importMedia.bind(this);
		this.importPosts = this.importPosts.bind(this);
		this.importTaxonomies = this.importTaxonomies.bind(this);
		this.importWidgets = this.importWidgets.bind(this);
		this.importPreSettings = this.importPreSettings.bind(this);
		this.importPostSettings = this.importPostSettings.bind(this);
		this.setupDemosFromLocalized = this.setupDemosFromLocalized.bind(this);

		// A reference to the DOM element of the log.
		this.logInput = React.createRef();
	}

	render() {
		let component = this,
			demos = component.state.demos;

		if (!_.size(demos)) {
			return <div className="box demo box--neutral">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.noSources', ''))}</div>;
		}

		let sortedDemoKeys = component.sortDemoKeys(Object.keys(demos));

		// If we have only one demo, are importing, or have finished importing, we will only show the selected demo, not the whole list.
		if ( _.size(demos) === 1 || component.props.session.is_sc_installing || component.props.session.is_sc_done ) {
			let installingClass = 'box demo',
				progressTitle = demos[component.state.selectedDemoKey].title,
				description = component.state.description || demos[component.state.selectedDemoKey].description;

		installingClass += '  ' + component.state.demoClass;

			let logValue = _.join(component.state.log, "\n");

			return (
				<div className="demos starter_content single-item">
			<ProgressBar installingClass={installingClass} title={progressTitle} description={description} />
					{ logValue
						? <TextField
							id="outlined-textarea"
							label="Log"
							multiline
							rows="2"
							rowsMax="4"
							value={logValue}
							className="starter-content-log"
							margin="normal"
							variant="outlined"
							InputProps={{
								readOnly: true,
							}}
							inputRef={this.logInput}
						/> : ''
					}
					{ component.props.enable_actions && ! (component.props.session.is_sc_errored || component.props.session.is_sc_installing || component.props.session.is_sc_done)
						? <a className="btn btn--action import--action " href="#" disabled={ component.props.session.is_sc_installing || component.props.session.is_sc_done } onClick={this.onImportClick}>
							{component.props.session.is_sc_done ? Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.imported', '')) : Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.import', '')) }
				</a>
				: <a className="btn btn--action import--action" style={{display: 'none'}} onClick={this.onImportClick}></a>
			}
					{ component.props.enable_actions && component.props.session.is_sc_installing
						? <a className="btn btn--action btn--action-secondary import-stop--action" href="#" onClick={this.onImportStopClick}>
							{component.props.session.is_sc_stopped ? Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.resume', '')) : Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.stop', '')) }
						</a>
						: ''
					}
				</div>
			)
		}

		// By default, we show a list of radio button with all the available demos.
		return (
			<div className="demos starter_content">
				{sortedDemoKeys.map(function (demoKey) {
					let demo = demos[demoKey],
						is_selected = ( demoKey === component.state.selectedDemoKey ),
						boxClasses = "demo  box box--neutral";

					return (
						<div
							className={boxClasses}
							key={demoKey}
							onClick={component.handleDemoSelect(demoKey)}
						>
							<Radio
								checked={is_selected}
								onChange={component.handleDemoSelect}
								value={demoKey}
								name={component.props.name}
								disabled={!is_selected}
								color="primary"
							/>
							<div className="box__body">
								<h5 className="box__title">{demo.title}</h5>
								<div className="box__text">
									{ is_selected
										? component.state.description || demo.description
										: demo.description }
								</div>
							</div>
							<a href={demo.url} className="external-link" title="Go to source site" target="_blank"><span className="dashicons dashicons-external"></span></a>
						</div>
					)
				})}
				{ component.props.enable_actions
					? <a className="btn btn--action import--action " href="#" onClick={this.onImportClick}>
						{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importSelected', '')) }
					</a> : <a className="btn btn--action import--action" style={{display: 'none'}} onClick={this.onImportClick}></a>
				}
			</div>
		)
	}

	handleDemoSelect = demoKey => event => {
		let component = this;

		if ( !_.isNil(demoKey) ) {
			component.setState({selectedDemoKey: demoKey});
		} else {
			component.setState({selectedDemoKey: event.target.value});
		}

	};

	standardizeDemos( demos ) {
		Object.keys(demos).map(function(key){
			if ( _.isNil( demos[key].url ) ) {
				// We need to have a URL.
				demos.splice(key, 1);
			} else {
				// We want the URL to be trailingslashed
				demos[key].url = Helpers.trailingslashit( demos[key].url );
			}

			if ( _.isNil( demos[key].baseRestUrl ) ) {
				demos[key].baseRestUrl = demos[key].url + _.get(pixassist, 'themeConfig.starterContent.defaultSceRestPath', 'wp-json/sce/v2');
			}

			if ( _.isNil( demos[key].order ) ) {
				demos[key].order = 10;
			} else {
				demos[key].order = _.toNumber( demos[key].order );
			}

			if ( _.isNil( demos[key].title ) ) {
				demos[key].title = _.get(pixassist, 'themeSupports.theme_name', '') + ' Demo Content';
			}

			if ( _.isNil( demos[key].description ) ) {
				demos[key].description = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importContentDescription', ''));
			}
		})

		return demos;
	}

	sortDemoKeys( demoKeys ) {
		let component = this;

		demoKeys.sort( function( a, b ) {
			if ( component.state.demos[a].order < component.state.demos[b].order ) {
				return -1;
			}

			if ( component.state.demos[a].order > component.state.demos[b].order ) {
				return 1;
			}

			return 0;
		} )

		return demoKeys;
	}

	// @todo This is a deprecated component function and we should find a way to not use it.
	UNSAFE_componentWillMount () {
		// Others may pass this prop to the component and expect us to fire it.
		if ( this.props.onRender ) {
			this.props.onRender();
		}
	}

	componentDidMount() {
		let component = this;

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', component.setupDemosFromLocalized);
	}

	componentWillUnmount() {
		let component = this;

		window.removeEventListener( 'localizedChanged', component.setupDemosFromLocalized )
	}

	componentDidUpdate() {
		let component = this;

		if ( !_.isNil(component.logInput.current) ) {
			// Make sure that the log textarea field is always scrolled to the bottom.
			component.logInput.current.scrollTop = component.logInput.current.scrollHeight;
		}
	}

	setupDemosFromLocalized(event){
		let component = this,
			demos = component.standardizeDemos(_.get(pixassist, 'themeConfig.starterContent.demos', []));

		if (_.size(demos)) {
			// First, we want to sort demos by their order, ascending.
			let sortedDemoKeys = component.sortDemoKeys(Object.keys(demos));

			component.setState({
				demos: demos,
				selectedDemoKey: sortedDemoKeys[0],
				demoClass: 'box--neutral',
			});
		}
	}

	handleFetchErrors(response) {
		if (response.ok) {
			return response
		} else {
			let error = new Error(response.status);
			error.response = response;
			error.message = 'status ' + response.status + '; type ' + response.type;
			throw error;
		}
	}

	addLogEntry( message ) {
		let component = this;

		if ( !message ) {
			return;
		}

		component.setState({ log: component.state.log.concat(message)});
	}

	onImportClick(e) {
		let component = this;
		e.preventDefault();

		if (component.props.session.is_sc_installing || component.props.session.is_sc_done) {
			return false;
		}

		component.props.onMove();

		// Trigger a starter_content_installing action
		component.props.onStarterContentInstalling();

		if ( component.sceKeyExists(component.state.selectedDemoKey, 'pre_settings') ) {
			var sure = confirm(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedConfirm', '')));
			if ( ! sure ) {
				component.props.onReady();
				component.setState({ demoClass: 'box--plugin-validated', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedDenied', ''))});
				// Trigger a finished importing starter content action
				component.props.onStarterContentFinished();
				return false;
			}
		}

		// Enable the import animation
		component.setState({demoClass: 'box--plugin-invalidated box--plugin-installing', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingData', ''))});

		// Log
		component.addLogEntry('Starting the import of starter content from: ' + component.state.demos[component.state.selectedDemoKey].url );

		// First we need to get the available data from the remote server
		let dataUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl ) + 'data';
		// @todo Should use a more standard helper for this one
		fetch(dataUrl, { method: 'GET'})
			.then( component.handleFetchErrors )
			.then((response) => {
				return response.json()
			})
			.then((config) => {
				if ( config.code !== 'success' ) {
					component.setState({demoClass: 'box--error', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.somethingWrong', ''))+"\n"+config.message });
					component.props.onStarterContentErrored();
					component.props.onReady();
				} else {
					/**
					 * Now that we have the available data, let's import it in a few steps
					 * the Queue will be managed inside these methods
					 */

					if (!_.isUndefined(config.data.pre_settings)) {
						component.importPreSettings(config.data.pre_settings);
					}

					/**
					 * Images first since we will need their new ids to replace the original ones.
					 */
					if (!_.isUndefined(config.data.media)) {
						component.importMedia(config.data.media);
					}

					if (!_.isUndefined(config.data.taxonomies)) {
						component.importTaxonomies(config.data.taxonomies);
					}

					if (!_.isUndefined(config.data.post_types)) {
						component.importPosts(config.data.post_types);
					}

					if (!_.isUndefined(config.data.widgets)) {
						component.importWidgets(config.data.widgets);
					}

					/**
					 * We have all the data .. let's end
					 */
					if (!_.isUndefined(config.data.post_settings)) {
						component.importPostSettings(config.data.post_settings);
					}
				}
			})
			.catch(function(ex) {
				console.log( ex );
				component.addLogEntry( 'Error: ' + ex.message );
				component.setState({demoClass: 'box--error', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.errorMessage', '')) });
				component.props.onStarterContentErrored();
				component.props.onReady();
			})
	}

	onImportStopClick(e) {
		let component = this;
		e.preventDefault();

		if ( component.props.session.is_sc_stopped ) {
			component.queue.stop = false;
			component.queue.next();

			component.addLogEntry('Import resumed.');

			// Trigger a starter_content_resume action
			component.props.onStarterContentResume();
		} else {
			component.queue.stop = true;

			component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.stoppedMessage', '')) });
			component.addLogEntry('Import stopped.');

			// Trigger a starter_content_stop action
			component.props.onStarterContentStop();
		}
	}

	importMedia(data) {
		let component = this;

		// no placeholders, no fun
		if ( _.isEmpty(data.placeholders) ) {
			component.addLogEntry('Missing media placeholders data. Skipping media import...');
			return;
		}

		let mediaUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl ) + 'media';

		{Object.keys(data).map(function (group_i) {
			var group = data[group_i];

			if (_.isEmpty(group)) {
				return;
			}

			{Object.keys(group).map(function (i) {
				component.queue.add(function () {
					var attach_id = group[i];

					fetch(mediaUrl + "?id=" + attach_id, {method: 'GET'})
						.then( component.handleFetchErrors )
						.then((response) => {
							return response.json()
						})
						.then((attachment) => {
							if ( attachment.code !== 'success' ) {
								component.addLogEntry('Failed to get media with id '+ attach_id + ' (error message: '+attachment.message+'). Continuing...');
								component.queue.next();
							} else {

								if ( !attachment.data.media.title || !attachment.data.media.ext || !attachment.data.media.mime_type ) {
									component.addLogEntry('Got back malformed data for media with id '+ attach_id + '. Continuing...');
									component.queue.next();
									return;
								}

								Helpers.$ajax(
									pixassist.wpRest.endpoint.uploadMedia.url,
									pixassist.wpRest.endpoint.uploadMedia.method,
									{
										demo_key: component.state.selectedDemoKey,
										title: attachment.data.media.title,
										remote_id: attach_id,
										file_data: attachment.data.media.data,
										ext: attachment.data.media.ext,
										group: group_i
									},
									function (response) {
										if ( !_.isUndefined( response.code ) && 'success' === response.code) {
											component.addLogEntry('Imported media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '" (#' + response.data.attachmentID + ').');
										} else {
											component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + response.responseText );
											console.log(response);
										}

										component.queue.next();
									},
									function (err) {
										component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + err.responseText );
										console.log(err);
										component.queue.next();
									},
									function (xhr) {
										component.setState({
											description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.mediaImporting', '')) + attachment.data.media.title + '.' + attachment.data.media.ext
										});

										xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
									}
								)
							}
						});
				});
			})}
		})}
	}

	importPosts(data, debug_post_type = null) {
		var component = this;

		if (_.isEmpty(data)) {
			component.addLogEntry('No data for posts. Continuing...');
			return;
		}

		if (component.sceKeyExists(component.state.selectedDemoKey, 'posts')) {
			component.addLogEntry('Posts already imported. Continuing...');
			return;
		}

		// We order the post types by priority ascending
		data = _.sortBy(data, 'priority');

		let baseUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl );

		_.map(data, function (entry, key) {
			var post_type = entry.name,
				args = {
					post_type: entry.name,
					ids: entry.ids
				};

			if ( debug_post_type !== null && debug_post_type !== post_type ) {
				return;
			}

			component.queue.add(function () {

				Helpers.$ajax(
					pixassist.wpRest.endpoint.import.url,
					pixassist.wpRest.endpoint.import.method,
					{
						demo_key: component.state.selectedDemoKey,
						type: 'post_type',
						url: baseUrl,
						args: args,
					},
					function (response) { // success callback
						console.log(response);
						component.addLogEntry('Imported post type "' + entry.name + '" (' + _.size(entry.ids) + ' posts).');
						// @todo we should properly handle the response code
						component.queue.next();
					},
					function (err) {// error callback
						console.log(err);
						component.addLogEntry('Failed to import post type "' + entry.name + '". Response: ' + err.responseText );
						component.queue.next();
					},
					function (xhr) { // beforeSendCallback
						component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.postImporting', '')) + post_type + '...'});

						xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
					}
				)
			});
		});
	}

	importTaxonomies(data, debug_tax = null) {
		var component = this;

		if (_.isEmpty(data)) {
			component.addLogEntry('No data for taxonomies. Continuing...');
			return;
		}

		if (component.sceKeyExists(component.state.selectedDemoKey, 'terms')) {
			component.addLogEntry('Taxonomies terms already imported. Continuing...');
			return;
		}

		// We order the taxonomies by priority ascending
		data = _.sortBy(data, 'priority');

		let baseUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl );

		_.map(data, function (entry, key) {
			var tax = entry.name,
				args = {
					tax: tax,
					ids: entry.ids
				};

			if ( debug_tax !== null && debug_tax !== tax ) {
				return;
			}

			component.queue.add(function () {

				Helpers.$ajax(
					pixassist.wpRest.endpoint.import.url,
					pixassist.wpRest.endpoint.import.method,
					{
						demo_key: component.state.selectedDemoKey,
						type: 'taxonomy',
						url: baseUrl,
						args: args
					},
					function (response) {
						console.log(response);
						component.addLogEntry('Imported taxonomy "' + tax + '" (' + _.size(entry.ids) + ' terms).');
						component.queue.next();
					},
					function (err) {
						console.log(err);
						component.addLogEntry('Failed to import taxonomy "' + tax + '". Response: ' + err.responseText );
						component.queue.next();
					},
					function (xhr) {
						xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);

						component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.taxonomyImporting', '')) + tax + '...'});
					}
				)
			});
		});
	}

	importWidgets(show_label = true) {
		var component = this;

		/*
		 * We do not use the data provided from the server call in onImportClick().
		 * We use the "parsed_type" import that will request the widgets from the demo
		 */

		if (component.sceKeyExists(component.state.selectedDemoKey, 'widgets')) {
			component.addLogEntry('Widgets already imported. Continuing...');
			return;
		}

		let baseUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl );

		component.queue.add(function () {
			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					demo_key: component.state.selectedDemoKey,
					type: 'parsed_widgets',
					url: baseUrl,
					args: {data: 'ok'}
				},
				function (response) {
					console.log(response);
					component.queue.next();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to import widgets. Response: ' + err.responseText );
					component.queue.next();
				},
				function (xhr) {
					if ( show_label ) {
						component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.widgetsImporting', ''))});
					}

					xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
				}
			)
		});
	}

	importPreSettings(data) {
		let component = this;

		if (_.isEmpty(data)) {
			component.addLogEntry('No data in pre_settings. Continuing...')
			return;
		}

		if (component.sceKeyExists(component.state.selectedDemoKey, 'pre_settings')) {
			component.addLogEntry('pre_settings already imported, but we will overwrite them.');
		}

		let baseUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl );

		component.queue.add(function () {

			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					demo_key: component.state.selectedDemoKey,
					type: "pre_settings",
					url: baseUrl,
					args: {data: data},
				},
				function (response) {
					console.log(response);
					component.addLogEntry('Imported pre_settings.');
					component.queue.next();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to import pre_settings. Response: ' + err.responseText );
					component.queue.next();
				},
				function (xhr) {
					component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingPreSettings', ''))});

					xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
				}
			)
		});
	}

	importPostSettings(data) {
		var component = this;

		if (_.isEmpty(data)) {
			component.addLogEntry('No data in post_settings. Continuing...');
			return;
		}

		if (component.sceKeyExists(component.state.selectedDemoKey, 'post_settings')) {
			console.log('post_settings already imported, but we will overwrite them.')
		}

		component.queue.add(function () {
			// just a widget recall ... meh
			// @todo Some very weird logic in here: fetching the admin page and then reimporting the widgets?!
			Helpers.$ajax(
				pixassist.adminUrl,
				'GET',
				{},
				function (response) {
					// console.log(response);
					setTimeout(function () {
						component.importWidgets(false);
					}, 1000 );
					component.queue.next();
				},
				null,
				function (xhr) {
					component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingPostSettings', ''))});

					xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
				}
			)
		});

		let baseUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl );

		// This is the LAST STEP IN THE QUEUE!!!
		// @todo We need to do a better job in handling when exactly the import was successful and when it wasn't
		component.queue.add(function () {
			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					demo_key: component.state.selectedDemoKey,
					type: 'post_settings',
					url: baseUrl,
					args: {data: data},
				},
				function (response) {
					console.log(response);
					component.addLogEntry('Imported post_settings.');

					component.queue.next();
					component.props.onReady();
					component.setState({demoClass: 'box--plugin-validated', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', ''))});
					component.addLogEntry('Finished!');
					// Trigger a finished importing starter content action
					component.props.onStarterContentFinished();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to post_settings. Response: ' + err.responseText );
					component.setState({demoClass: 'box--warning', description: 'error'});
					component.props.onStarterContentErrored();
					component.props.onReady();
					component.queue.next();
				}
			)
		});
	}

	hasPlaceholders(demoKey) {
		return !_.isEmpty(_.get(pixassist, 'themeMod.starterContent['+demoKey+'].media.placeholders', [] ));
	}

	sceKeyExists(demoKey, key) {
		return !!_.get(pixassist, 'themeMod.starterContent['+demoKey+']['+key+']', null);
	}
}

StarterContentContainer.propTypes = {
	key: PropTypes.string,
	name: PropTypes.string,
	onReady: PropTypes.func,
	onMove: PropTypes.func
};

const StarterContent = connect(mapStateToProps, mapDispatchToProps)(StarterContentContainer);

export default StarterContent;
