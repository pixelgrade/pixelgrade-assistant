import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Support from './components/support/dashboard'
import { supportStore } from './reducers/support';

(function (window, $) {
	let pixassist_support = document.getElementById('pixelgrade_care_support_section');

	if ( _.isUndefined( pixassist ) || _.isUndefined( pixassist.themeSupports ) || pixassist.themeSupports === null ) {
		// nada
	} else if ( pixassist_support ) {
		ReactDOM.render(<Provider store={supportStore} ><Support /></Provider>, document.getElementById('pixelgrade_care_support_section'));
	}
})(window, jQuery);
