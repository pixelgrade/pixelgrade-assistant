<?php
/**
 * Appearance -> Pixelgrade hub: server-side bootstrap data for the React shell.
 *
 * The hub is a React app (admin/src-modern/hub) Assistant mounts on the Appearance submenu. The
 * server decides which tabs exist and are visible (collected + capability-gated + sorted by the #42
 * registry, `pixassist_get_admin_hub_tabs()`); the client binds each tab's `component` key to a
 * React component via the JS filter `pixelgrade.adminHub.tabs`. This helper assembles the payload
 * the shell is bootstrapped with.
 *
 * Function-style, mirroring includes/host-extension-surface.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_admin_hub_data' ) ) {
	/**
	 * Build the bootstrap payload for the Appearance -> Pixelgrade hub shell.
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
			'baseUrl'    => admin_url( 'themes.php?page=pixelgrade' ),
			'tabAliases' => array(
				'account-license' => array( 'tab' => 'account', 'section' => 'plus' ),
				// The three content granularities merged into the Design Library tab; their old
				// tab ids live on as its section ids so external deep links keep working.
				'starter-sites'   => array( 'tab' => 'design-library', 'section' => 'starter-sites' ),
				'layouts'         => array( 'tab' => 'design-library', 'section' => 'layouts' ),
				'content'         => array( 'tab' => 'design-library', 'section' => 'content' ),
				'recipes'         => array( 'tab' => 'design-library', 'section' => 'starter-sites' ),
			),
		);
	}
}
