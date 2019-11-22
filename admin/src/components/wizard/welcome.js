import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@material-ui/styles';
import muiTheme from '../mui-theme';
import sessionStore from '../../reducers/session';
import { Provider } from 'react-redux'
import _ from 'lodash';
import SetupWizardSteps from "./steps";
import Helpers from '../../helpers'

const SetupWizard = () => ( <ThemeProvider theme={muiTheme}><SetupWizardSteps /></ThemeProvider> );

class SetupWizardWelcome extends React.Component {
	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.beginSetupWizard = this.beginSetupWizard.bind(this);
	}

	render() {
		return <div className="pixlgrade-care-welcome">
			<div className="crown"></div>
			<div className="section section--informative entry-content block">
				<div>
					<h1 className="section__title">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.setupWizardWelcomeTitle', ''))}</h1>
					<p className="section__content">{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.setupWizardWelcomeContent', ''))}</p>
					<button className="btn  btn--action  btn--large  btn--full" onClick={this.beginSetupWizard} >{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.setupWizardStartButtonLabel', ''))}</button>
				</div>
			</div>
			<div className="logo-pixelgrade"></div>
		</div>
	}

	beginSetupWizard = () => {
		ReactDOM.render(<Provider store={sessionStore} ><SetupWizard /></Provider>, document.getElementById('pixelgrade_assistant_setup_wizard'));
	}
}

export default SetupWizardWelcome;
