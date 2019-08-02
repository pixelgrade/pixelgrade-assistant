import React from 'react';

import Helpers from '../helpers';
import { clearState } from '../localStorage';
import _ from 'lodash'

class Tools extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {loading: false};
		// this.setDataCollect = this.setDataCollect.bind(this);
	}

	render() {
		return <div className="tools">
			<div className="reset-wrapper">
				<p>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.resetPluginDescription', ''))}</p>
				<a className="btn btn--action btn--full" onClick={this.clean_the_house}>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.resetPluginButtonLabel', ''))}</a>
			</div>
		</div>
	}

	clean_the_house = () => {
		let test1 = Math.floor((Math.random() * 10) + 1),
			test2 = Math.floor((Math.random() * 10) + 1);

		const confirm = prompt( Helpers.decodeHtml(_.get(pixassist, 'themeConfig.systemStatus.l10n.resetPluginConfirmationMessage', '')) + test1 + ' + ' + test2 + ' = ', '' );

		if ( test1 + test2 == confirm ) {
			// Clear The local Storage
			clearState();

			// Delete the login details from the database
			Helpers.$ajax(
				pixassist.wpRest.endpoint.cleanup.url,
				pixassist.wpRest.endpoint.cleanup.method,
				{
					test1: test1,
					test2: test2,
					confirm: confirm
				},
				function (response) {
					if ( response.code === 'success' ) {
						window.location.reload();
					} else {
						alert('We\'ve hit a snag, it seems ('+response.code+').\nSomething about: '+response.message );
					}
				},
				function (e) {
					alert(Helpers.decodeHtml(pixassist.themeConfig.l10n.internalErrorContent));
				}
			)
		}
	}
}

export default Tools;
