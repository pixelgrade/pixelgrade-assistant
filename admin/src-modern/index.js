/**
 * Modern host shell entry point (@wordpress/scripts build).
 *
 * Mounts the Appearance -> Pixelgrade hub React app onto the page's mount node. The visible tab list
 * + URLs are bootstrapped from `window.pixelgradeAdminHub` (localized server-side in
 * PixelgradeAssistant_Admin::enqueue_scripts via pixassist_get_admin_hub_data()).
 *
 * No JSX on purpose: the plugin supports WordPress 5.9+, and the automatic JSX runtime depends on the
 * `react-jsx-runtime` script handle that only ships in WP 6.6+. Using @wordpress/element's
 * createElement keeps the bundle's externals to wp-element/wp-components/wp-i18n/wp-hooks.
 */
import { createElement, createRoot, render } from '@wordpress/element';
import { App } from './hub/App';
// Registers Assistant's free tab components (Overview, #44) on the `pixelgrade.adminHub.tabs`
// filter at load, before the shell renders.
import './hub/tabs';

const MOUNT_ID = 'pixelgrade-admin-hub';

const DEFAULT_BOOTSTRAP = { tabs: [], defaultTab: '', baseUrl: '' };

function mount() {
	const node = document.getElementById( MOUNT_ID );
	if ( ! node ) {
		return;
	}

	const bootstrap = window.pixelgradeAdminHub || DEFAULT_BOOTSTRAP;
	const element = createElement( App, { bootstrap } );

	// createRoot lands in WP 6.2's @wordpress/element; fall back to legacy render on older cores.
	if ( typeof createRoot === 'function' ) {
		createRoot( node ).render( element );
	} else {
		render( element, node );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', mount );
} else {
	mount();
}
