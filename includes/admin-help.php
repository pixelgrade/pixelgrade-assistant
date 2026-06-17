<?php
/**
 * The free Help tab — KB browse/search/read inside the Appearance -> Pixelgrade hub (#47).
 *
 * The React tab reuses the editor docs panel's KB component/data layer. This PHP module only
 * registers the tab descriptor on the host registry; endpoint paths, copy, and product scope come
 * from includes/admin-docs.php and are localized on the hub page as `window.pixelgradeHelp`.
 *
 * Function-style, mirroring includes/admin-overview.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_help_tab' ) ) {
	/**
	 * Register the free Help tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * Hooked onto `pixelgrade/admin_hub/tabs` (the #42 registry). The Help tab is free (no upsell
	 * gate), access-controlled by the theme-options capability, and binds the `help` JS component.
	 * It sorts late (order 90), after Plus's premium tabs.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Help tab appended.
	 */
	function pixassist_register_help_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'help',
			'label'      => esc_html__( 'Help', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'help',
			'gate'       => '',
			'order'      => 90,
		);

		return $tabs;
	}
}

// Register the free Help tab on the hub registry.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_help_tab' );
}
