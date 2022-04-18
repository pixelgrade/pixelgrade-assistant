import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import CircularProgress from '@material-ui/core/CircularProgress';
import SystemTables from './system-tables';
import Helpers from '../helpers';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import _ from 'lodash';

class SystemStatus extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.state = {loading: true};

		this.setDataCollect = this.setDataCollect.bind(this);
		this.getDataCollect = this.getDataCollect.bind(this);
		this.bytesToSize = this.bytesToSize.bind(this);
		this.createInstallData = this.createInstallData.bind(this);
		this.createSystemData = this.createSystemData.bind(this);
		this.createActivePluginsData = this.createActivePluginsData.bind(this);
		this.createCoreOptionsData = this.createCoreOptionsData.bind(this);
		this.createThemeOptionsData = this.createThemeOptionsData.bind(this);
		this.onUpdatePlugin = this.onUpdatePlugin.bind(this);
	}

	// call get data collector
	componentDidMount() {
		this.getDataCollect();
	}

	render() {
		var style = {
			list: {display: "block"},
			loader: {
				display: "none",
				position: "relative",
				marginLeft: "340px"
			}
		};

		if (this.state.loading) {
			style = {
				list: {display: "none"},
				loader: {
					display: "block",
					position: "relative !important",
					marginLeft: "340px"
				}
			};
		}

		return (
			<div className="system-status-tables">
				<div className="allow-collect-data">
					<FormGroup row>
						<FormControlLabel
							control={
								<Switch
									checked={_.get(pixassist, 'systemStatus.allowDataCollect', false)}
									onChange={this.handleChange('allowDataCollect')}
									value="allowDataCollect"
									color="primary"
								/>
							}
							label={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.description', ''))}
						/>
					</FormGroup>
				</div>
				<CircularProgress
					id="systemLoader"
					size={40}
					left={-20}
					top={10}
					variant='indeterminate'
					color='primary'
					style={style.loader}
				/>
				<div id="systemDetails" style={style.list}></div>

				{ !!_.get(pixassist, 'systemStatus.allowDataCollect', false) === true ? (
						<SystemTables
							installDataRows={this.createInstallData}
							activePluginsRows={this.createActivePluginsData}
							coreOptionsRows={this.createCoreOptionsData}
							themeOptionsRows={this.createThemeOptionsData}
							systemDataRows={this.createSystemData}
						/>
					) : null }

			</div>
		);
	}

	handleChange = name => event => {
		this.setDataCollect(event.target.checked);
	};

	// returns the install_data Table Rows for the System Status table
	createInstallData = () => {
		let installDataRows = [];

		// Add Install Data
		_.map(_.get(pixassist, 'systemStatus.installation', []), function (entry, key) {
			let value = ( null !== entry.value ) ? entry.value.toString() : '',
				installDataClass = '',
				installIconClass = '',
				extraInfo = '';

			// on theme version display color if depending on version
			if ( key === 'theme_version' && !_.isUndefined( entry.is_updateable ) && entry.is_updateable ) {
				installDataClass = 'system-status-update-available';
				installIconClass = 'c-icon c-icon--warning';
				extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.updateAvailable', ''));
			} else if ( key === 'theme_version' && !_.isUndefined( entry.is_updateable ) && ! entry.is_updateable ) {
				installDataClass = 'system-status-up-to-date';
				installIconClass = 'c-icon c-icon--success';
				extraInfo = Helpers.parseL10n(_.get(pixassist, 'themeConfig.systemStatus.l10n.themeLatestVersion', ''));

			}

			if ( !_.isUndefined(entry.is_viewable) && entry.is_viewable ) {
				installDataRows.push(<TableRow key={key}>
					<TableCell>{entry.label}</TableCell>
					<TableCell><span className={installIconClass}></span><span className={installDataClass}>{value}</span></TableCell>
					<TableCell className="system-status-description"><p dangerouslySetInnerHTML={{__html: extraInfo}}></p></TableCell>
				</TableRow>);
			}
		});

		return installDataRows;
	};

	// Returns the system data Table Rows for the System Status table
	createSystemData = () => {
		let systemDataRows = [],
			component = this;

		// Add System rows
		_.map(_.get(pixassist, 'systemStatus.system', []), function (entry, key) {
			let value = ( null !== entry.value ) ? entry.value.toString() : '',
				installDataClass = '',
				installIconClass = '',
				extraInfo = '';

			// on theme version display color if depending on '
			if ( !_.isUndefined( entry.is_updateable ) && entry.is_updateable ) {
				installDataClass = 'system-status-update-available';
				installIconClass = 'c-icon  c-icon--warning';

				if ( 'wp_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.wpUpdateAvailable1', '')) + ' <a href="' + entry.download_url +  '">'+Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.wpUpdateAvailable2', ''))+'</a>';
				} else if ( 'php_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.phpUpdateNeeded1', ''))+' ' + ' <a href="' + entry.download_url +  '">'+Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.phpUpdateNeeded2', ''))+'</a>';
				} else if ('mysql_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.mysqlUpdateNeeded1', ''))+' ' + ' <a href="' + entry.download_url +  '">'+Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.mysqlUpdateNeeded2', ''))+'</a>';
				} else if ('db_charset' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.dbCharsetIssue', ''));
				}

			} else if ( !_.isUndefined( entry.is_updateable ) && ! entry.is_updateable ) {
				installDataClass = 'system-status-up-to-date';
				installIconClass = 'c-icon c-icon--success';

				if ( 'wp_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.wpVersionOk', ''));
				} else if ( 'php_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.phpVersionOk', ''));
				} else if ('mysql_version' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.mysqlVersionOk', ''));
				} else if ('db_charset' === key) {
					extraInfo = Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.dbCharsetOk', ''));
				}
			}

			systemDataRows.push(<TableRow key={key}>
				<TableCell>{entry.label}</TableCell>
				{ key === 'wp_memory_limit' || key === 'php_post_max_size' ? (
					<TableCell>{component.bytesToSize(value)}</TableCell>
				) : <TableCell><span className={installIconClass}></span><span className={installDataClass}>{value}</span></TableCell> }
				<TableCell className="system-status-description"><p dangerouslySetInnerHTML={{ __html: extraInfo }}></p></TableCell>
			</TableRow>);

		});

		return systemDataRows;
	};

	// Returns the active plugins data Table Rows for the System Status table
	createActivePluginsData = () => {
		let activePluginsRows = [],
			component = this;

		// Add Active Plugins rows
		_.map(_.get(pixassist, 'systemStatus.activePlugins', []), function (entry, key) {
			let installDataClass = '',
				installIconClass = '';

			// on theme version display color if depending on version
			if ( !_.isUndefined( entry.is_updateable ) && entry.is_updateable ) {
				installDataClass = 'system-status-update-available';
				installIconClass = 'c-icon  c-icon--warning';
			} else if ( !_.isUndefined( entry.is_updateable ) && ! entry.is_updateable ) {
				installDataClass = 'system-status-up-to-date';
				installIconClass = 'c-icon c-icon--success';
			}

			let id = 'pixassistUpdatePlugin-' + entry.slug;

			activePluginsRows.push(<TableRow key={key}>
				<TableCell>{entry.name}</TableCell>
				<TableCell>
					{ !_.isUndefined(component.state.updated_plugins) && component.state.updated_plugins.indexOf(entry.plugin) > - 1 ?
						// plugin has been updated through ajax
						<div>{component.state.updated_versions[entry.plugin]}</div>
						:
						<div><span className={installIconClass}></span><span className={installDataClass}>v{entry.version}</span></div>
					}
				</TableCell>
				{ !_.isUndefined( entry.is_updateable ) && entry.is_updateable ?
					<TableCell className="system-status-description"><p id={id}>
						{ !_.isUndefined( component.state.update_errors ) && !_.isUndefined( component.state.update_errors[entry.plugin] ) ?
							//error
							<span>An error has occurred while updating your plugin: {component.state.update_errors[entry.plugin]}</span>
							:
							! _.isUndefined( component.state.plugin_updating ) && component.state.plugin_updating && component.state.updating_plugins.indexOf(entry.plugin) > - 1 ?
								<span>Updating...</span> :
								!_.isUndefined(component.state.updated_plugins) && component.state.updated_plugins.indexOf(entry.plugin) > - 1 ?
									<span> Plugin successfully updated! </span>
									:
									<span> Version {entry.new_version} available. Please <a href="#" onClick={(event) => component.onUpdatePlugin(entry, event)}>update</a>!</span>
						}
					</p></TableCell> :
					<TableCell className="system-status-description"></TableCell>}
			</TableRow>);

		});

		return activePluginsRows;
	};

	// returns the core options data Table Rows for the System Status table
	createCoreOptionsData = () => {
		let coreOptionsRows = [];

		// Add Core Options rows
		_.map(_.get(pixassist, 'systemStatus.coreOptions', []), function (entry, key) {
			var label = key.replace(/_/g, ' ');
			label = label.replace(/\b\w/g, function (l) {
				return l.toUpperCase();
			});

			coreOptionsRows.push(<TableRow key={key}>
				<TableCell>{label}</TableCell>
				<TableCell>{entry}</TableCell>
			</TableRow>);
		});

		return coreOptionsRows;
	};

	// returns the theme options data Table Rows for the System Status table
	createThemeOptionsData = () => {
		let themeOptionsRows = [];

		// Add Core Options rows
		_.map(_.get(pixassist, 'systemStatus.themeOptions', []), function (entry, key) {
			var label = key.replace(/_/g, ' ');
			label = label.replace(/\b\w/g, function (l) {
				return l.toUpperCase();
			});

			if (typeof entry === 'string') {
				themeOptionsRows.push(<TableRow key={key}>
					<TableCell>{label}</TableCell>
					<TableCell>{unescape(entry)}</TableCell>
				</TableRow>);
			}
		});

		return themeOptionsRows;
	};

	onUpdatePlugin = (plugin, event) => {
		event.preventDefault();
		pagenow = 'plugins';

		if (_.isUndefined(this.state.updating_plugins)) {
			this.state.updating_plugins = [];
		}

		this.state.updating_plugins.push(plugin.plugin);

		this.setState({
			plugin_updating: true,
			updating_plugins: this.state.updating_plugins
		});

		let component = this;
		wp.updates.updatePlugin({
			slug: plugin.slug,
			plugin: plugin.plugin,
			abort_if_destination_exists: false,
			success: function ( response ) {
				if (_.isUndefined(component.state.updated_plugins)) {
					component.state.updated_plugins = [];
				}
				component.state.updated_plugins.push(response.plugin);

				if (_.isUndefined(component.state.updated_version)){
					component.state.updated_versions = {};
				}
				component.state.updated_versions[response.plugin] = response.newVersion;

				// remove this plugin from the updating plugins array
				let index = component.state.updating_plugins.indexOf(response.plugin);
				component.state.updating_plugins.splice(index, 1);

				component.setState({
					updated_plugins:  component.state.updated_plugins,
					updated_versions: component.state.updated_versions,
					updating_plugins: component.state.updating_plugins
				})
			},
			error: function ( error ) {
				if ( _.isUndefined(component.state.update_errors) ) {
					component.state.update_errors = {};
				}
				component.state.update_errors[error.plugin] = error.errorMessage;

				// remove this plugin from the updating plugins array
				let index = component.state.updating_plugins.indexOf(error.plugin);
				component.state.updating_plugins.splice(index, 1);

				component.setState({
					update_errors: component.state.update_errors,
					updating_plugins: component.state.updating_plugins
				})

			}
		});

	};

	getDataCollect() {
		let component = this,
			loader = document.getElementById('systemLoader');

		Helpers.$ajax(
			pixassist.wpRest.endpoint.dataCollect.get.url,
			pixassist.wpRest.endpoint.dataCollect.get.method,
			{},
			function (response) {
				// @todo Handle errors
				if ( response.code === 'success' ) {
					pixassist.systemStatus = response.data;

					// if we receive a response - hide the loader
					if ( !_.isUndefined(loader) ) {
						loader.style.display = 'none';
					}
				}

				// set loader state to false
				component.setState({loading: false});
			},
			null,
			// We set the loader before send
			// We also need to set the header since the $ajax function will not do it for us this time
			function (xhr) {
				xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
				// show the loader
				if ( !_.isUndefined(loader) ) {
					loader.style.display = 'block';
				}
			}
		)
	}

	setDataCollect = (is_active) => {
		let component = this;

		Helpers.$ajax(
			pixassist.wpRest.endpoint.dataCollect.set.url,
			pixassist.wpRest.endpoint.dataCollect.set.method,
			{
				'allow_data_collect': is_active
			},
			function (response) {
				// Refresh the client side data related to the system.
				component.getDataCollect();
			}
		)
	};

	bytesToSize = (bytes) => {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

		if (bytes == 0) return 'n/a';
		let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i];
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};
}

export default SystemStatus;
