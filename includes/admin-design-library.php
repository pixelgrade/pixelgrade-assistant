<?php
/**
 * Design Library hub tab: one primary destination for the three content granularities.
 *
 * Merges the former Starter Sites (whole site), Site Parts / layouts (reusable part), and Page
 * Patterns (single page) hub tabs into a single `design-library` tab. The client component
 * (admin/src-modern/hub/tabs/DesignLibrary.js) routes sections via `?tab=design-library&section=…`
 * — the same pattern the Account tab uses — and renders the existing section components unchanged.
 * The old `?tab=` ids keep working as deep-link aliases (see pixassist_get_admin_hub_data()).
 *
 * Function-style, mirroring the other hub tab modules — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_design_library_tab' ) ) {
	/**
	 * Register the Design Library tab on the hub registry.
	 *
	 * Hooked onto `pixelgrade/admin_hub/tabs` (the #42 registry). Sits where Starter Sites used to
	 * (order 30), after Design System. The section payloads keep their own localization channels
	 * (pixelgradeStarterSites / pixelgradeLayoutUnits / pixelgradeContentPatterns); the merged tab
	 * needs no payload of its own — the scope-guide copy lives in the JS component.
	 *
	 * The broadest section capability (edit_theme_options) gates visibility; the Page Patterns
	 * section's privileged REST endpoints still enforce their own manage_options checks server-side.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Design Library tab appended.
	 */
	function pixassist_register_design_library_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'design-library',
			'label'      => esc_html__( 'Design Library', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'designLibrary',
			'gate'       => '',
			'order'      => 30,
		);

		return $tabs;
	}
}

// Register the free Design Library tab on the hub registry.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_design_library_tab' );
}
