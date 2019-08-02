import React from 'react';
import ReactDOM from 'react-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';
import muiTheme from './components/mui-theme';

import WizardWelcome from "./components/wizard/welcome";

const SetupWizard = () => {
	return <MuiThemeProvider theme={muiTheme}>
			<WizardWelcome />
		</MuiThemeProvider>
}

ReactDOM.render( <SetupWizard /> , document.getElementById('pixelgrade_care_setup_wizard'));
