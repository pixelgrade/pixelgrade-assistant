/**
 * Binds Assistant's own (free) hub-tab components to the `pixelgrade.adminHub.tabs` JS filter — the
 * client side of the #42 registry. The server decides which tabs exist + are visible; this binds the
 * React component for each free tab to its `component` key. Companions (Pixelgrade Plus) bind their
 * premium tabs through the same filter from their own bundle.
 *
 * Imported by the hub entry (admin/src-modern/index.js) so the bindings register before the shell
 * renders (getComponentMap() re-applies the filter at render time).
 */
import { addFilter } from '@wordpress/hooks';
import { Overview } from './Overview';
import { Account } from './Account';
import { Plugins } from './Plugins';
import { StarterSites } from './StarterSites';
import { HelpTab } from './Help';

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/overview', ( map ) => {
	map.overview = { component: Overview };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/account', ( map ) => {
	map.account = { component: Account };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/plugins', ( map ) => {
	map.plugins = { component: Plugins };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/starter-sites', ( map ) => {
	map.starterSites = { component: StarterSites };

	return map;
}, 100 );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/help', ( map ) => {
	map.help = { component: HelpTab };

	return map;
} );
