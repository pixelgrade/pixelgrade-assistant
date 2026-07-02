<?php
/**
 * Pins the merged Design Library hub tab.
 *
 * The Design Library merges the former Starter Sites / Layouts (Site Parts) / Page Patterns tabs
 * into one primary tab whose sections route via `?tab=design-library&section=…` (the Account tab's
 * pattern). This pins the tab registration, the registry composition (one design tab where three
 * used to be), and the client component's scope-guide contract: scope-glyph language, the question
 * heading, the visited-checklist progressive disclosure, and the compact icon pills + ⓘ reopen.
 *
 * Standalone: run with `php tests/admin-design-library-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']     = array();
$GLOBALS['paf_denied_caps'] = array();

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}
	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		$value = call_user_func( $callback, $value );
	}

	return $value;
}

function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, is_array( $args ) ? $args : array() );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function assert_true( $actual, $message ) {
	if ( ! $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-design-library.php';
assert_true( file_exists( $module ), 'The Design Library tab module must exist at includes/admin-design-library.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_design_library_tab' ), 'The Design Library tab registration function must be defined.' );

$registered = pixassist_register_design_library_tab( array() );
assert_same( 1, count( $registered ), 'Design Library registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'design-library', $tab['id'], 'Design Library tab id must be `design-library`.' );
assert_same( 'Design Library', $tab['label'], 'Design Library tab label must be `Design Library`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Design Library tab must require edit_theme_options (sections keep their own REST checks).' );
assert_same( 'designLibrary', $tab['component'], 'Design Library tab must bind the `designLibrary` JS component.' );
assert_same( '', $tab['gate'], 'Design Library tab is free - no upsell gate.' );
assert_same( 30, $tab['order'], 'Design Library must take the former Starter Sites slot (order 30, after Design System).' );

/*
 * Registry composition: with all four content modules registered, exactly ONE design-cluster tab
 * (Design Library) survives — the three legacy registrations are no-ops.
 */
require __DIR__ . '/../includes/admin-recipes.php';

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_design_library_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_recipes_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The registry must carry one merged Design Library tab, not the legacy trio.' );
assert_same( 'design-library', $tabs[0]['id'], 'The normalized Design Library tab must retain id `design-library`.' );

/*
 * Client contract: the DesignLibrary component implements the scope guide + compact pills.
 */
$component_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/DesignLibrary.js' );
$index_js     = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/index.js' );

assert_true( false !== strpos( $index_js, 'map.designLibrary = { component: DesignLibrary }' ), 'The hub component registry must bind designLibrary to the DesignLibrary component.' );

assert_true( false !== strpos( $component_js, "params.set( 'section', id )" ), 'Selecting a section must route ?tab=design-library&section=… like the Account tab.' );
assert_true( false !== strpos( $component_js, 'ScopeGlyph' ), 'The selector must render wireframe scope glyphs (highlight = what gets applied).' );
assert_true( false !== strpos( $component_js, 'What do you want to add to your site?' ), 'The guide must lead with the question heading.' );
assert_true( false !== strpos( $component_js, 'Pick a scale — you can mix and match anytime.' ), 'The question heading must carry the mix-and-match subline.' );
assert_true( false !== strpos( $component_js, 'pixassist_design_library_guide' ), 'The visited-section set must persist in localStorage alongside the other pixassist keys.' );
assert_true( false !== strpos( $component_js, 'Skip the guide — use compact tabs' ), 'The guide must offer a quiet skip link.' );
assert_true( false !== strpos( $component_js, "icon: 'info-outline'" ), 'The compact selector must carry an ⓘ affordance that reopens the guide.' );
assert_true( false !== strpos( $component_js, 'Site Parts' ), 'The layouts section must be presented as Site Parts.' );
assert_true( false !== strpos( $component_js, 'A whole site' ), 'Pills must carry the task-phrase description lines.' );

echo "Admin Design Library tab OK\n";
