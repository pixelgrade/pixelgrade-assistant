/**
 * The client side of the hub tab contract.
 *
 * The server decides which tabs exist + are visible (the `pixelgrade/admin_hub/tabs` PHP filter,
 * normalized by pixassist_get_admin_hub_tabs()). The client supplies the React component for each
 * tab by binding it to the tab's `component` key (or its `id`) through this JS filter. Companions
 * (and the free Overview tab, #44) register like:
 *
 *   import { addFilter } from '@wordpress/hooks';
 *   addFilter( 'pixelgrade.adminHub.tabs', 'pixelgrade-plus', ( map ) => {
 *       map.starterSites = { component: StarterSitesTab };
 *       return map;
 *   } );
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Resolve the registered component map: { [componentKeyOrId]: { component: ReactComponent } }.
 *
 * @return {Object} Component map keyed by tab component key / id.
 */
export function getComponentMap() {
	const map = applyFilters( 'pixelgrade.adminHub.tabs', {} );

	return map && 'object' === typeof map ? map : {};
}
