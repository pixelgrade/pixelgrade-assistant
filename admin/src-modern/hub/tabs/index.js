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
import { Styles } from './Styles';
import { Account } from './Account';
import { Plugins } from './Plugins';
import { DesignLibrary } from './DesignLibrary';
import { StarterSites } from './StarterSites';
import { Recipes } from './Recipes';
import { LayoutUnits } from './LayoutUnits';
import { ContentPatterns } from './ContentPatterns';
import { SystemStatus } from './SystemStatus';
import { Tools } from './Tools';
import { HelpTab } from './Help';

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/overview', ( map ) => {
	map.overview = { component: Overview };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/styles', ( map ) => {
	map.styles = { component: Styles };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/account', ( map ) => {
	map.account = { component: Account };

	return map;
} );

// Priority 100 so Assistant's recommended-plugins tab (Style Manager, Nova Blocks, …) wins the
// shared `plugins` component slot over a companion that loads later and also binds `map.plugins`
// (Pixelgrade Plus). Same pattern as starterSites below — the free tab owns the slot; companions
// contribute entries through the `pixassist_recommended_plugins` PHP filter, not a rival component.
addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/plugins', ( map ) => {
	map.plugins = { component: Plugins };

	return map;
}, 100 );

// The merged Design Library tab hosts the former Starter Sites / Site Parts (layouts) /
// Page Patterns tabs as sections routed via ?tab=design-library&section=….
addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/design-library', ( map ) => {
	map.designLibrary = { component: DesignLibrary };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/starter-sites', ( map ) => {
	map.starterSites = { component: StarterSites };

	return map;
}, 100 );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/recipes', ( map ) => {
	map.starterRecipes = { component: Recipes };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/layout-units', ( map ) => {
	map.layoutUnits = { component: LayoutUnits };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/content-patterns', ( map ) => {
	map.contentPatterns = { component: ContentPatterns };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/system-status', ( map ) => {
	map.systemStatus = { component: SystemStatus };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/tools', ( map ) => {
	map.tools = { component: Tools };

	return map;
} );

addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-assistant/help', ( map ) => {
	map.help = { component: HelpTab };

	return map;
} );
