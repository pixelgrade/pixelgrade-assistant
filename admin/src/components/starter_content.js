import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // Required for browser compatibility.
import Helpers from '../helpers';
import ProgressBar from "./ProgressBar/ProgressBar";
import Radio from '@material-ui/core/Radio';
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
			progress: this.getInitialProgressState(),
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
		this.updateProgress = this.updateProgress.bind(this);
		this.advanceProgress = this.advanceProgress.bind(this);
		this.startProgressHeartbeat = this.startProgressHeartbeat.bind(this);
		this.stopProgressHeartbeat = this.stopProgressHeartbeat.bind(this);
		this.estimateTotalWork = this.estimateTotalWork.bind(this);

		this.importMedia = this.importMedia.bind(this);
		this.importPosts = this.importPosts.bind(this);
		this.importTaxonomies = this.importTaxonomies.bind(this);
		this.importWidgets = this.importWidgets.bind(this);
		this.importPreSettings = this.importPreSettings.bind(this);
		this.importPostSettings = this.importPostSettings.bind(this);
		this.setupDemosFromLocalized = this.setupDemosFromLocalized.bind(this);

		// A reference to the DOM element of the log.
		this.logInput = React.createRef();
		this.progressHeartbeat = null;
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

			return (
				<div className="demos starter_content single-item">
					<ProgressBar
						installingClass={installingClass}
						title={progressTitle}
						description={description}
						progress={component.state.progress}
					/>
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

		component.stopProgressHeartbeat();
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

	getInitialProgressState() {
		return {
			status: 'idle',
			phase: '',
			message: '',
			details: '',
			current: 0,
			total: 0,
			log: [],
			startedAt: null,
			lastEventAt: null,
			heartbeat: '',
		};
	}

	updateProgress( update, options = {} ) {
		let component = this,
			now = Date.now();

		component.setState(function (prevState) {
			let progress = Object.assign({}, prevState.progress || component.getInitialProgressState(), update || {});

			if ( 'working' === progress.status && ! progress.startedAt ) {
				progress.startedAt = now;
			}

			if ( ! options.keepLastEventAt ) {
				progress.lastEventAt = now;
				progress.heartbeat = '';
			}

			return { progress: progress };
		});
	}

	advanceProgress( message, details = '' ) {
		let component = this;

		component.setState(function (prevState) {
			let progress = Object.assign({}, prevState.progress || component.getInitialProgressState()),
				total = _.toNumber(progress.total) || 0,
				current = (_.toNumber(progress.current) || 0) + 1;

			if ( total > 0 ) {
				current = Math.min(current, total);
			}

			progress.status = 'working';
			progress.current = current;
			progress.message = message || progress.message;
			progress.details = details;
			progress.lastEventAt = Date.now();
			progress.heartbeat = '';

			return {
				description: progress.message,
				progress: progress,
			};
		});
	}

	startProgressHeartbeat() {
		let component = this;

		component.stopProgressHeartbeat();

		component.progressHeartbeat = setInterval(function () {
			let progress = component.state.progress || {};

			if ( 'working' !== progress.status || component.props.session.is_sc_stopped ) {
				return;
			}

			// More than 3 seconds without progress should never feel idle.
			if ( progress.lastEventAt && Date.now() - progress.lastEventAt < 2500 ) {
				return;
			}

			component.updateProgress(
				{
					heartbeat: component.getProgressHeartbeatMessage(progress),
				},
				{ keepLastEventAt: true }
			);
		}, 2500);
	}

	stopProgressHeartbeat() {
		if ( this.progressHeartbeat ) {
			clearInterval(this.progressHeartbeat);
			this.progressHeartbeat = null;
		}
	}

	getProgressHeartbeatMessage(progress) {
		let messages = {
			data: 'Still reading the starter manifest.',
			media: 'Still processing images and local attachment metadata.',
			taxonomies: 'Still creating categories, tags, and menu groups.',
			posts: 'Still importing content. Larger post batches can take a little longer.',
			widgets: 'Still arranging widgets and sidebars.',
			settings: 'Still applying site settings and theme options.',
			finish: 'Still wrapping up the import.',
		};

		return messages[progress.phase] || 'Still working. No action needed.';
	}

	estimateTotalWork(data) {
		let total = 1;

		if ( !_.isUndefined(data.pre_settings) && !_.isEmpty(data.pre_settings) ) {
			total += 1;
		}

		if ( !_.isUndefined(data.media) && !_.isEmpty(data.media.placeholders) ) {
			Object.keys(data.media).map(function (group_i) {
				if ( 'source_urls' === group_i || _.isEmpty(data.media[group_i]) ) {
					return;
				}

				total += _.size(data.media[group_i]) * 2;
			});
		}

		if ( !_.isUndefined(data.taxonomies) && !_.isEmpty(data.taxonomies) ) {
			total += _.size(data.taxonomies);
		}

		if ( !_.isUndefined(data.post_types) && !_.isEmpty(data.post_types) ) {
			total += _.size(data.post_types);
		}

		if ( !_.isUndefined(data.widgets) && !_.isEmpty(data.widgets) ) {
			total += 1;
		}

		if ( !_.isUndefined(data.post_settings) && !_.isEmpty(data.post_settings) ) {
			total += 2;
		}

		return Math.max(total, 1);
	}

	addLogEntry( message, type = 'info' ) {
		let component = this;

		if ( !message ) {
			return;
		}

		component.setState(function (prevState) {
			let progress = Object.assign({}, prevState.progress || component.getInitialProgressState()),
				progressLog = progress.log || [];

			progressLog = progressLog.concat({
				message: message,
				type: type,
			}).slice(-8);

			progress.log = progressLog;
			progress.lastEventAt = Date.now();
			progress.heartbeat = '';

			return {
				log: prevState.log.concat(message),
				progress: progress,
			};
		});
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
		component.updateProgress({
			status: 'working',
			phase: 'data',
			message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingData', '')),
			details: 'Contacting the starter source.',
			current: 0,
			total: 1,
			log: [],
			startedAt: Date.now(),
		});
		component.startProgressHeartbeat();

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
					component.updateProgress({
						status: 'error',
						message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.somethingWrong', '')),
						details: config.message,
					});
					component.stopProgressHeartbeat();
					component.props.onStarterContentErrored();
					component.props.onReady();
				} else {
					component.updateProgress({
						phase: 'data',
						total: component.estimateTotalWork(config.data),
					});
					component.advanceProgress('Content manifest received.', 'Preparing the import queue.');
					component.addLogEntry('Found available starter content. Preparing import steps.');
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
				component.addLogEntry( 'Error: ' + ex.message, 'error' );
				component.setState({demoClass: 'box--error', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.errorMessage', '')) });
				component.updateProgress({
					status: 'error',
					message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.errorMessage', '')),
					details: ex.message,
				});
				component.stopProgressHeartbeat();
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
			component.updateProgress({
				status: 'working',
				message: 'Import resumed.',
				details: 'Continuing with the next queued step.',
			});
			component.startProgressHeartbeat();

			// Trigger a starter_content_resume action
			component.props.onStarterContentResume();
		} else {
			component.queue.stop = true;

			component.setState({description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.stoppedMessage', '')) });
			component.addLogEntry('Import stopped.');
			component.updateProgress({
				status: 'paused',
				message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.stoppedMessage', '')),
				details: 'The import queue is paused.',
			});
			component.stopProgressHeartbeat();

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

		let mediaUrl = Helpers.trailingslashit( component.state.demos[component.state.selectedDemoKey].baseRestUrl ) + 'media',
			mediaTotal = 0,
			mediaIndex = 0;

		Object.keys(data).map(function (group_i) {
			if ( 'source_urls' === group_i || _.isEmpty(data[group_i]) ) {
				return;
			}

			mediaTotal += _.size(data[group_i]);
		});

		{Object.keys(data).map(function (group_i) {
			var group = data[group_i];

			if ('source_urls' === group_i || _.isEmpty(group)) {
				return;
			}

			{Object.keys(group).map(function (i) {
				component.queue.add(function () {
					var attach_id = group[i],
						currentMediaIndex = ++mediaIndex;

					component.updateProgress({
						phase: 'media',
						message: 'Downloading media ' + currentMediaIndex + ' of ' + mediaTotal + '.',
						details: 'Remote attachment #' + attach_id,
					});

					fetch(mediaUrl + "?id=" + attach_id, {method: 'GET'})
						.then( component.handleFetchErrors )
						.then((response) => {
							return response.json()
						})
						.then((attachment) => {
							if ( attachment.code !== 'success' ) {
								component.addLogEntry('Failed to get media with id '+ attach_id + ' (error message: '+attachment.message+'). Continuing...', 'error');
								component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.message);
								component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'No file was returned by the starter source.');
								component.queue.next();
							} else {

								if ( !attachment.data.media.title || !attachment.data.media.ext || !attachment.data.media.mime_type ) {
									component.addLogEntry('Got back malformed data for media with id '+ attach_id + '. Continuing...', 'error');
									component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'Malformed media response.');
									component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'No valid file metadata was returned.');
									component.queue.next();
									return;
								}

								component.advanceProgress('Downloaded media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);

								Helpers.$ajax(
									pixassist.wpRest.endpoint.uploadMedia.url,
									pixassist.wpRest.endpoint.uploadMedia.method,
									{
										demo_key: component.state.selectedDemoKey,
										title: attachment.data.media.title,
										remote_id: attach_id,
										file_data: attachment.data.media.data,
										ext: attachment.data.media.ext,
										group: group_i,
										source_urls: attachment.data.media.urls || {}
									},
									function (response) {
										if ( !_.isUndefined( response.code ) && 'success' === response.code) {
											component.addLogEntry('Imported media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '" (#' + response.data.attachmentID + ').');
											component.advanceProgress('Uploaded media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
										} else {
											component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + response.responseText, 'error' );
											component.advanceProgress('Media upload failed ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
											console.log(response);
										}

										component.queue.next();
									},
									function (err) {
										component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + err.responseText, 'error' );
										component.advanceProgress('Media upload failed ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
										console.log(err);
										component.queue.next();
									},
									function (xhr) {
										let uploadMessage = 'Uploading media ' + currentMediaIndex + ' of ' + mediaTotal + '.';

										component.setState({
											description: uploadMessage
										});
										component.updateProgress({
											phase: 'media',
											message: uploadMessage,
											details: attachment.data.media.title + '.' + attachment.data.media.ext,
										});

										xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
									}
								)
							}
						})
						.catch(function(ex) {
							component.addLogEntry('Failed to download media with id '+ attach_id + '. Response: ' + ex.message, 'error');
							component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', ex.message);
							component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'Download failed.');
							component.queue.next();
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
						component.advanceProgress('Imported ' + post_type + '.', _.size(entry.ids) + ' posts processed.');
						// @todo we should properly handle the response code
						component.queue.next();
					},
					function (err) {// error callback
						console.log(err);
						component.addLogEntry('Failed to import post type "' + entry.name + '". Response: ' + err.responseText, 'error' );
						component.advanceProgress('Post type import failed: ' + post_type + '.', err.responseText);
						component.queue.next();
					},
					function (xhr) { // beforeSendCallback
						let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.postImporting', '')) + post_type + '...';

						component.setState({description: message});
						component.updateProgress({
							phase: 'posts',
							message: message,
							details: _.size(entry.ids) + ' posts in this batch.',
						});

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
						component.advanceProgress('Imported taxonomy: ' + tax + '.', _.size(entry.ids) + ' terms processed.');
						component.queue.next();
					},
					function (err) {
						console.log(err);
						component.addLogEntry('Failed to import taxonomy "' + tax + '". Response: ' + err.responseText, 'error' );
						component.advanceProgress('Taxonomy import failed: ' + tax + '.', err.responseText);
						component.queue.next();
					},
					function (xhr) {
						xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);

						let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.taxonomyImporting', '')) + tax + '...';

						component.setState({description: message});
						component.updateProgress({
							phase: 'taxonomies',
							message: message,
							details: _.size(entry.ids) + ' terms in this batch.',
						});
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
					component.addLogEntry('Imported widgets.');
					component.advanceProgress('Imported widgets.', 'Sidebars and widget areas were updated.');
					component.queue.next();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to import widgets. Response: ' + err.responseText, 'error' );
					component.advanceProgress('Widget import failed.', err.responseText);
					component.queue.next();
				},
				function (xhr) {
					if ( show_label ) {
						let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.widgetsImporting', ''));

						component.setState({description: message});
						component.updateProgress({
							phase: 'widgets',
							message: message,
							details: 'Arranging widget areas.',
						});
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
					component.advanceProgress('Prepared theme settings.', 'Initial theme settings were applied.');
					component.queue.next();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to import pre_settings. Response: ' + err.responseText, 'error' );
					component.advanceProgress('Preparing theme settings failed.', err.responseText);
					component.queue.next();
				},
				function (xhr) {
					let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingPreSettings', ''));

					component.setState({description: message});
					component.updateProgress({
						phase: 'settings',
						message: message,
						details: 'Applying initial theme settings.',
					});

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
					component.advanceProgress('Refreshed the WordPress admin context.', 'Preparing the final settings pass.');
					component.queue.next();
				},
				null,
				function (xhr) {
					let message = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingPostSettings', ''));

					component.setState({description: message});
					component.updateProgress({
						phase: 'finish',
						message: message,
						details: 'Refreshing WordPress before the final settings pass.',
					});

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
					component.advanceProgress('Applied final settings.', 'Menus, homepage, and theme options are in place.');

					component.queue.next();
					component.props.onReady();
					component.setState({demoClass: 'box--plugin-validated', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', ''))});
					component.updateProgress({
						status: 'done',
						phase: 'done',
						message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', '')),
						details: 'The starter content import is complete.',
						current: component.state.progress.total || component.state.progress.current,
						heartbeat: '',
					});
					component.stopProgressHeartbeat();
					component.addLogEntry('Finished!');
					// Trigger a finished importing starter content action
					component.props.onStarterContentFinished();
				},
				function (err) {
					console.log(err);
					component.addLogEntry('Failed to post_settings. Response: ' + err.responseText, 'error' );
					component.setState({demoClass: 'box--warning', description: 'error'});
					component.updateProgress({
						status: 'error',
						phase: 'finish',
						message: 'The final settings step failed.',
						details: err.responseText,
					});
					component.stopProgressHeartbeat();
					component.props.onStarterContentErrored();
					component.props.onReady();
					component.queue.next();
				},
				function (xhr) {
					component.updateProgress({
						phase: 'finish',
						message: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingPostSettings', '')),
						details: 'Saving final starter settings.',
					});

					xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
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
