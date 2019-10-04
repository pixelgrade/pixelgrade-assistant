import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Support from './components/support/dashboard'
import { supportStore } from './reducers/support'
import Helpers from './helpers'

(function (window, $) {
	// Expose this globally so we can use the helpers from other places (like from notifications).
	window.pixassistHelpers = Helpers;

	let pixassist_support = document.getElementById('pixelgrade_assistant_support_section');

	if ( _.isUndefined( pixassist ) || _.isUndefined( pixassist.themeSupports ) || pixassist.themeSupports === null ) {
		// do nothing
	} else if ( pixassist_support ) {
		ReactDOM.render(<Provider store={supportStore} ><Support /></Provider>, document.getElementById('pixelgrade_assistant_support_section'));
	}
})(window, jQuery);
