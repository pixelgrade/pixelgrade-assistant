import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import PropTypes from 'prop-types';

import _ from 'lodash';
import Helpers from '../helpers'

class SystemTables extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
	}

	render() {
		return <div>
			{ _.size(_.get(pixassist, 'systemStatus.installation', [])) ?
				<Table className="system-status-table" border={1}>
					<TableHead className="table-head">
						<TableRow>
							<TableCell colSpan={4}>
								{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.tableWPDataTitle', ''))}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.installDataRows()}
					</TableBody>
				</Table> : null }

			{ _.size(_.get(pixassist, 'systemStatus.system', [])) ?
				<Table className="system-status-table" border={1}>
					<TableHead>
						<TableRow>
							<TableCell colSpan={6} style={{textAlign: 'center'}}>
								{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.tableSystemDataTitle', ''))}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.systemDataRows()}
					</TableBody>
				</Table> : null }

			{ _.size(_.get(pixassist, 'systemStatus.activePlugins', [])) ?
				<Table className="system-status-table" border={1}>
					<TableHead>
						<TableRow>
							<TableCell colSpan={6} style={{textAlign: 'center'}}>
								{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.tableActivePluginsTitle', ''))}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.activePluginsRows()}
					</TableBody>
				</Table> : null }
			</div>
	}
}

SystemTables.propTypes = {
	installDataRows: PropTypes.func,
	systemDataRows: PropTypes.func,
	activePluginsRows: PropTypes.func,
	createThemeOptionsData: PropTypes.func,
}

export default SystemTables;
