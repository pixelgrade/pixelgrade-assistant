<?php
/**
 * Pixelgrade Design hub: server-side bootstrap data for the React shell.
 *
 * The hub is a React app (admin/src-modern/hub) Assistant mounts on the top-level "Pixelgrade
 * Design" admin menu (slug `pixelgrade`). The server decides which tabs exist and are visible
 * (collected + capability-gated + sorted by the #42 registry, `pixassist_get_admin_hub_tabs()`);
 * the client binds each tab's `component` key to a React component via the JS filter
 * `pixelgrade.adminHub.tabs`. This helper assembles the payload the shell is bootstrapped with.
 *
 * Function-style, mirroring includes/host-extension-surface.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_hub_url' ) ) {
	/**
	 * Canonical admin URL of the Pixelgrade Design hub page, optionally deep-linked.
	 *
	 * The single source of truth for hub links — the hub lives on a top-level menu, so the page
	 * is served from `admin.php` (the old `themes.php?page=pixelgrade` form 404s and is only kept
	 * alive by the legacy redirect in PixelgradeAssistant_Admin).
	 *
	 * @param string $tab     Optional tab id (e.g. `design-library`). Empty for the hub root.
	 * @param string $section Optional section id inside the tab (ignored without a tab).
	 *
	 * @return string
	 */
	function pixassist_get_hub_url( $tab = '', $section = '' ) {
		$path = 'admin.php?page=pixelgrade';

		if ( is_string( $tab ) && '' !== $tab ) {
			$path .= '&tab=' . rawurlencode( $tab );

			if ( is_string( $section ) && '' !== $section ) {
				$path .= '&section=' . rawurlencode( $section );
			}
		}

		return function_exists( 'admin_url' ) ? admin_url( $path ) : $path;
	}
}

if ( ! function_exists( 'pixassist_get_admin_hub_tab_aliases' ) ) {
	/**
	 * Legacy tab ids mapped to current ids.
	 *
	 * Shared by the JS bootstrap payload (URL canonicalization) and the sidebar submenu
	 * highlighting, so an old deep link lights up the tab it actually lands on.
	 *
	 * @return array Either a plain target id string, or `array( 'tab' => …, 'section' => … )`
	 *               when the legacy id maps to a section inside a merged tab.
	 */
	function pixassist_get_admin_hub_tab_aliases() {
		return array(
			'account-license' => array( 'tab' => 'account', 'section' => 'plus' ),
			// The three content granularities merged into the Design Library tab; their old
			// tab ids live on as its section ids so external deep links keep working.
			'starter-sites'   => array( 'tab' => 'design-library', 'section' => 'starter-sites' ),
			'layouts'         => array( 'tab' => 'design-library', 'section' => 'layouts' ),
			'content'         => array( 'tab' => 'design-library', 'section' => 'content' ),
			'recipes'         => array( 'tab' => 'design-library', 'section' => 'starter-sites' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_admin_hub_submenu_items' ) ) {
	/**
	 * Sidebar submenu items for the top-level Pixelgrade Design menu.
	 *
	 * Derived from the same registry that drives the in-app tab bar so labels, capabilities and
	 * visibility never drift: design tabs first (registry order), then the Account/Help service
	 * pair — mirroring TabBar.js's SERVICE_TAB_IDS split. Secondary-group tabs (System Status,
	 * Tools) stay under the in-app More menu to keep the sidebar quiet.
	 *
	 * @return array[] {
	 *     @type string $slug       Submenu slug: `pixelgrade` for the default tab (the hub root),
	 *                              else a full `admin.php?page=pixelgrade&tab=…` deep link.
	 *     @type string $label      Menu label (the tab label).
	 *     @type string $capability Capability required to see the item.
	 *     @type string $tab        The tab id the item routes to.
	 * }
	 */
	function pixassist_get_admin_hub_submenu_items() {
		if ( ! function_exists( 'pixassist_get_admin_hub_tabs' ) ) {
			return array();
		}

		$tabs        = pixassist_get_admin_hub_tabs();
		$default_tab = ! empty( $tabs ) ? $tabs[0]['id'] : '';
		// Mirrors SERVICE_TAB_IDS in admin/src-modern/hub/TabBar.js.
		$service_ids = array( 'account', 'help' );

		$design  = array();
		$service = array();

		foreach ( $tabs as $tab ) {
			if ( ! empty( $tab['group'] ) && 'secondary' === $tab['group'] ) {
				continue;
			}
			// Link tabs point outside the hub page; they don't belong in the page's submenu.
			if ( ! empty( $tab['url'] ) ) {
				continue;
			}

			$item = array(
				'slug'       => $tab['id'] === $default_tab ? 'pixelgrade' : 'admin.php?page=pixelgrade&tab=' . $tab['id'],
				'label'      => $tab['label'],
				'capability' => $tab['capability'],
				'tab'        => $tab['id'],
			);

			if ( in_array( $tab['id'], $service_ids, true ) ) {
				$service[] = $item;
			} else {
				$design[] = $item;
			}
		}

		return array_merge( $design, $service );
	}
}

if ( ! function_exists( 'pixassist_get_admin_hub_data' ) ) {
	/**
	 * Build the bootstrap payload for the Pixelgrade Design hub shell.
	 *
	 * @return array {
	 *     @type array[] $tabs       Normalized visible tabs (see pixassist_get_admin_hub_tabs()).
	 *     @type string  $defaultTab Id of the first visible tab (lowest order), or '' when none.
	 *     @type string  $baseUrl    Admin URL of the hub page (for `?tab=` deep links).
	 *     @type array   $tabAliases Legacy tab ids mapped to current ids — either a plain target id
	 *                               string, or `array( 'tab' => …, 'section' => … )` when the legacy
	 *                               id maps to a section inside a merged tab.
	 * }
	 */
	function pixassist_get_admin_hub_data() {
		$tabs        = pixassist_get_admin_hub_tabs();
		$default_tab = ! empty( $tabs ) ? $tabs[0]['id'] : '';

		return array(
			'tabs'       => $tabs,
			'defaultTab' => $default_tab,
			'baseUrl'    => pixassist_get_hub_url(),
			'tabAliases' => pixassist_get_admin_hub_tab_aliases(),
		);
	}
}
