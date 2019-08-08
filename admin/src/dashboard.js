import React from 'react';
import ReactDOM from 'react-dom';

import DashboardPage from './components/dashboard/dashboard';
import sessionStore from './reducers/session';
import { Provider } from 'react-redux'

(function (window) {
	ReactDOM.render(
		<Provider store={sessionStore} >
			<DashboardPage  />
		</Provider>,
		document.getElementById('pixelgrade_assistant_dashboard')
	);
})(window);
