import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // Required for browser compatibility.
import Helpers from '../helpers';
import ProgressBar from "./ProgressBar/ProgressBar";
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

	imported = null;

	constructor(props) {
		// this makes the this
		super(props);

		// @todo We need an error state here
		if ( _.isUndefined( pixassist.themeConfig.starterContent ) ) {
			return;
		}

		// we need a callback queue system in order to execute the import in subsequent steps
		this.queue = new Helpers.Queue;

		// There may be some imported data, and if it is, this var will hold it
		this.imported = _.extend({media: {}}, pixassist.themeMod.starterContent);

		this.state = {
			importing: false,
			demoClass: 'box--neutral box--plugin-invalidated',
		}

		if (_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
			// @todo Currently we only support a single demo :(
			let firstFoundDemo = Helpers.getFirstItem(_.get(pixassist, 'themeConfig.starterContent.demos', [])); // the selected demo from where we will import
			this.state.value = firstFoundDemo.url;
			this.state.title = _.get(firstFoundDemo, 'title', pixassist.themeSupports.theme_name + ' Demo Content');
			this.state.description = _.get(firstFoundDemo, 'description', 'Import the content from the theme demo.');
		}

		this.onImportClick = this.onImportClick.bind(this);

		this.importMedia = this.importMedia.bind(this);
		this.importPosts = this.importPosts.bind(this);
		this.importTaxonomies = this.importTaxonomies.bind(this);
		this.importWidgets = this.importWidgets.bind(this);
		this.importPreSettings = this.importPreSettings.bind(this);
		this.importPostSettings = this.importPostSettings.bind(this);
		this.updateDemoContentUrl = this.updateDemoContentUrl.bind(this);
	}

	render() {
		let component = this;

		if (!_.size(_.get(component.props.session, 'themeConfig.starterContent.demos', []))) {
			return <div className="box box--neutral">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.noSources', ''))}</div>;
		}

		let installingClass = 'box  box--neutral  box--theme  box--plugin-invalidated plugin';

		let description = _.get(component, 'state.description', Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importContentDescription', '')) );

		if ( component.props.session.is_sc_installing ) {
			installingClass = 'box  box--neutral  box--theme  box--plugin-invalidated box--plugin-installing plugin';
		}

		if ( component.props.session.is_sc_done ) {
			installingClass = 'box  box--neutral  box--theme  box--plugin-invalidated box--plugin-validated plugin';
		}

		// Set the title for the progressBar
		let progressTitle = _.get(component, 'state.title', Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importContentDescription', ''))));
		const output = <div>
			<ProgressBar installingClass={installingClass} title={progressTitle} description={description} />
			{ component.props.enable_actions
				? <a className="btn btn--action import--action " href="#" disabled={ component.state.importing || component.props.session.is_sc_done } onClick={this.onImportClick}>
					{component.props.session.is_sc_done ? Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.imported', '')) : Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.import', '')) }
				</a>
				: <a className="btn btn--action import--action" style={{display: 'none'}} onClick={this.onImportClick}></a>
			}
		</div>;

		return (output);
	}

	// @todo This is a deprecated component function and we should find a way to not use it.
	componentWillMount () {
		// Others may pass this prop to the component and expect us to fire it.
		if ( this.props.onRender ) {
			this.props.onRender();
		}
	}

	componentDidMount() {
		let component = this;

		// add an event listener for the localized pixassist data change
		window.addEventListener('localizedChanged', component.updateDemoContentUrl);
	}

	componentWillUnmount() {
		let component = this;

		window.removeEventListener( 'localizedChanged', component.updateDemoContentUrl )
	}

	updateDemoContentUrl(event){
		let component = this;

		if (_.size(_.get(pixassist, 'themeConfig.starterContent.demos', []))) {
			component.setState({value: Helpers.getFirstItem(pixassist.themeConfig.starterContent.demos).url});
		}
	}

	onChange = (e) => {
		this.setState({value: e.target.value});
	};

	onImportClick(e) {
		var component = this;
		e.preventDefault();

		if ( component.state.importing ) {
			console.log(component.state.importing);
			return false;
		}

		component.props.onMove();

		if ( component.sceKeyExists('pre_settings') ) {
			var sure = confirm(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedConfirm', '')));
			if ( ! sure ) {
				component.props.onReady();
				component.setState({ importing: false, demoClass: 'box--plugin-validated', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedDenied', ''))});
				return false;
			}
		}

		// Trigger a starter_content_installing action
		component.props.onStarterContentInstalling();

		// Enable the import animation
		component.setState({ importing: true, demoClass: 'box--plugin-installing', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importingData', ''))});

		// First we need to get the available data from the remote server
		// @todo Should use a more standard helper for this one
		fetch(component.state.value + "/wp-json/sce/v2/data", { method: 'GET'})
			.then( component.checkStatus )
			.then((response) => {
				return response.json()
			})
			.then((config) => {
				if ( config.code !== 'success' ) {
					component.setState({ importing: false, demoClass: 'box--error', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.somethingWrong', ''))+"\n"+config.message });
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
				component.setState({ importing: false, demoClass: 'box--error', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.errorMessage', '')) });
			})
	}

	importMedia(data) {
		var component = this;

		// now placeholders, no fun
		if ( _.isEmpty(data.placeholders) ) {
			return;
		}

		// maybe they are cached?
		if ( component.hasPlaceholders() ) {
			console.log('Media exists');
			Helpers.pushNotification({
				notice_id: 'sce-media-exists',
				title: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.mediaAlreadyExistsTitle', '')),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.mediaAlreadyExistsContent', '')),
				type: 'info',
			});
			return;
		}

		{Object.keys(data).map(function (group_i) {
			var group = data[group_i];

			if (_.isEmpty(group)) {
				return;
			}

			if (_.isUndefined(component.imported.media[group_i])) {
				component.imported.media[group_i] = {}
			}

			{Object.keys(group).map(function (i) {
				component.queue.add(function () {
					var attach_id = group[i];

					fetch(component.state.value + "/wp-json/sce/v2/media?id=" + attach_id, {method: 'GET'})
						.then((response) => {
							return response.json()
						})
						.then((attachment) => {
							if ( attachment.code !== 'success' ) {
								// @todo We should so something here
							} else {

								Helpers.$ajax(
									pixassist.wpRest.endpoint.uploadMedia.url,
									pixassist.wpRest.endpoint.uploadMedia.method,
									{
										title: attachment.data.media.title,
										remote_id: attach_id,
										file_data: attachment.data.media.data,
										ext: attachment.data.media.ext,
										group: group_i
									},
									function (response) {
										if ('success' === response.code) {
											component.imported.media[group_i][attach_id] = response.data.attachmentID;
										} else {
											console.log(response.data.error);
										}

										component.queue.next();
									},
									function (err) {
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
			console.log('No data in posts');
			return;
		}

		if (component.sceKeyExists('posts')) {
			console.log('Posts exists');
			Helpers.pushNotification({
				notice_id: 'sce-posts-exists',
				title: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.postsAlreadyExistTitle', '')),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.postAlreadyExistsContent', '')),
				type: 'info',
			});
			return;
		}

		// We order the post types by priority ascending
		data = _.sortBy(data, 'priority');

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
						type: "post_type",
						url: component.state.value,
						args: args,
					},
					function (response) { // success callback
						console.log(response);
						// @todo we should properly handle the response code
						component.queue.next();
					},
					function (err) {// error callback
						console.log(err);
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
			console.log('No data in taxonomies');
			return;
		}

		if (component.sceKeyExists('terms')) {

			Helpers.pushNotification({
				notice_id: 'sce-terms-exists',
				title: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.taxonomiesAlreadyExistTitle', '')),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.taxonomiesAlreadyExistContent', '')),
				type: 'info',
			});
			console.log('Terms exists');
			return;
		}

		// We order the taxonomies by priority ascending
		data = _.sortBy(data, 'priority');

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
						type: "taxonomy",
						url: component.state.value,
						args: args
					},
					function (response) {
						console.log(response);
						component.queue.next();
					},
					function (err) {
						console.log(err);
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

		if (component.sceKeyExists('widgets')) {
			console.log('Widgets exists');

			Helpers.pushNotification({
				notice_id: 'sce-widgets-exists',
				title: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.widgetsAlreadyExistTitle', '')),
				content: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.widgetsAlreadyExistContent', '')),
				type: 'info',
			});

			return;
		}

		component.queue.add(function () {
			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					type: 'parsed_widgets',
					url: component.state.value,
					args: {data: 'ok'}
				},
				function (response) {
					console.log(response);
					component.queue.next();
				},
				function (err) {
					console.log(err);
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
		var component = this;

		if (_.isEmpty(data)) {
			console.log('No data in pre_settings');
			return;
		}

		if (component.sceKeyExists('pre_settings')) {
			console.log('Pre options exists');
			return;
		}

		component.queue.add(function () {

			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					type: "pre_settings",
					url: component.state.value,
					args: {data: data},
				},
				function (response) {
					console.log(response);
					component.queue.next();
				},
				function (err) {
					console.log(err);
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
			console.log('No data in post_settings');
			return;
		}

		if (component.sceKeyExists('post_settings')) {
			console.log('post_settings exists')
			// component.props.onReady();
			// return;
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

		// @todo We need to do a better job in handling when exactly the import was successful and when it wasn't
		component.queue.add(function () {
			Helpers.$ajax(
				pixassist.wpRest.endpoint.import.url,
				pixassist.wpRest.endpoint.import.method,
				{
					type: "post_settings",
					url: component.state.value,
					args: {data: data},
				},
				function (response) {
					console.log(response);

					component.queue.next();
					component.props.onReady();
					component.setState({ importing: false, demoClass: 'box--plugin-validated', description: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', ''))});
					// Trigger a finished importing starter content action
					component.props.onStarterContentFinished();
				},
				function (err) {
					console.log(err);
					component.setState({ importing: false, demoClass: 'box--warning', description: 'error'});
					component.queue.next();
				}
			)
		});
	}

	hasPlaceholders() {
		return (this.sceKeyExists('media') && !_.isEmpty(pixassist.themeMod.starterContent.media.placeholders));
	}

	sceKeyExists($key) {
		return (!_.isUndefined(pixassist.themeMod.starterContent) && !_.isEmpty(pixassist.themeMod.starterContent[$key]));
	}

	checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response
		} else {
			console.log( response.text() );
			var error = new Error(response.statusText);
			error.response = response;
			throw error;
		}
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
