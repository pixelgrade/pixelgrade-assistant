import React from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider } from '@material-ui/styles';
import muiTheme from './components/mui-theme';

import WizardWelcome from "./components/wizard/welcome";

const SetupWizard = () => {
	return <ThemeProvider theme={muiTheme}>
			<WizardWelcome />
		</ThemeProvider>
}

ReactDOM.render( <SetupWizard /> , document.getElementById('pixelgrade_assistant_setup_wizard'));
