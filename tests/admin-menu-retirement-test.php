<?php
/**
 * Pins the hub's admin menu registration and the #43 retirement of the legacy dashboard bundle.
 *
 * The legacy Care-era top-level "Pixelgrade" dashboard menu was retired in #43; the hub then
 * lived as an Appearance submenu until it outgrew it and became the top-level "Pixelgrade
 * Design" menu (right above Appearance). This pins that registration — slug, capability,
 * label, position, recolorable icon — plus the setup wizard staying a hidden Appearance
 * submenu and the legacy dashboard bundle staying gone. The registry-derived submenus are
 * pinned separately in tests/admin-hub-test.php.
 *
 * Standalone: run with `php tests/admin-menu-retirement-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_menu_pages']    = array();
$GLOBALS['paf_submenu_pages'] = array();
$GLOBALS['paf_filters']       = array();

function esc_html__( $text, $domain = 'default' ) {
	return $text;
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

function add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $callback = '', $icon_url = '', $position = null ) {
	$GLOBALS['paf_menu_pages'][] = compact( 'page_title', 'menu_title', 'capability', 'menu_slug', 'callback', 'icon_url', 'position' );
}

function add_submenu_page( $parent_slug, $page_title, $menu_title, $capability, $menu_slug, $callback = '' ) {
	$GLOBALS['paf_submenu_pages'][] = compact( 'parent_slug', 'page_title', 'menu_title', 'capability', 'menu_slug', 'callback' );
}

function pixassist_is_commercial() {
	return false;
}

function wp_get_themes() {
	return array();
}

function get_theme_mod( $name, $default = false ) {
	return $default;
}

function plugin_dir_url( $file ) {
	return 'https://example.test/wp-content/plugins/pixelgrade-assistant/';
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

function assert_file_absent( $path, $message ) {
	assert_true( ! file_exists( $path ), $message . ' Found: ' . $path );
}

function assert_not_contains( $needle, $haystack, $message ) {
	assert_true( false === strpos( $haystack, $needle ), $message );
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php';
require __DIR__ . '/../admin/class-pixelgrade_assistant-setup_wizard.php';

$admin_reflection = new ReflectionClass( 'PixelgradeAssistant_Admin' );
$admin            = $admin_reflection->newInstanceWithoutConstructor();
$admin->parent    = (object) array(
	'file' => __DIR__ . '/../pixelgrade-assistant.php',
);

PixelgradeAssistant_Admin::$theme_support = array(
	'theme_version' => '1.0.0',
);

$admin->add_pixelgrade_assistant_menu();

assert_same( 1, count( $GLOBALS['paf_menu_pages'] ), 'The hub must register exactly one top-level admin menu.' );
$hub_menu = $GLOBALS['paf_menu_pages'][0];
assert_same( 'pixelgrade', $hub_menu['menu_slug'], 'The hub slug must remain pixelgrade.' );
assert_same( 'edit_theme_options', $hub_menu['capability'], 'The hub capability must match Appearance access.' );
assert_same( 'Pixelgrade', $hub_menu['menu_title'], 'The sidebar label is the bare brand — one line at 160px, suite-home convention; the full name wraps.' );
assert_same( 'Pixelgrade Design', $hub_menu['page_title'], 'Hub page title (H1/browser tab) must keep the functional "Pixelgrade Design".' );
assert_same( '58.9', $hub_menu['position'], 'The hub menu sits right above Appearance (position 60; 59 is a core separator).' );
assert_same( 0, strpos( $hub_menu['icon_url'], 'data:image/svg+xml;base64,' ), 'The menu icon must be an inline SVG data URI so core svg-painter recolors it with the menu state.' );
assert_same( array(), $GLOBALS['paf_submenu_pages'], 'Without the hub registry helper loaded, no submenus are registered (graceful).' );

$GLOBALS['paf_menu_pages']    = array();
$GLOBALS['paf_submenu_pages'] = array();

$wizard_reflection = new ReflectionClass( 'PixelgradeAssistant_SetupWizard' );
$wizard            = $wizard_reflection->newInstanceWithoutConstructor();
$wizard->add_admin_menu();

assert_same( array(), $GLOBALS['paf_menu_pages'], 'Setup wizard must not add a top-level admin menu.' );
assert_same( 1, count( $GLOBALS['paf_submenu_pages'] ), 'Setup wizard must register exactly one hidden submenu.' );
assert_same( 'themes.php', $GLOBALS['paf_submenu_pages'][0]['parent_slug'], 'Setup wizard must be reparented under Appearance.' );
assert_same( 'pixelgrade_assistant-setup-wizard', $GLOBALS['paf_submenu_pages'][0]['menu_slug'], 'Setup wizard slug must remain stable for compatibility.' );

$root = dirname( __DIR__ );

assert_file_absent( $root . '/admin/src/dashboard.js', 'Legacy dashboard SPA source must be retired.' );
assert_file_absent( $root . '/admin/js/dashboard.js', 'Legacy dashboard bundle must be retired.' );
assert_file_absent( $root . '/admin/js/dashboard.min.js', 'Legacy dashboard minified bundle must be retired.' );
assert_file_absent( $root . '/admin/js/dashboard.js.map', 'Legacy dashboard source map must be retired.' );

$gulpfile = file_get_contents( $root . '/gulpfile.js' );
assert_not_contains( 'compile_scripts_rollup_dashboard', $gulpfile, 'Legacy dashboard Rollup task must be removed.' );
assert_not_contains( './admin/src/dashboard.js', $gulpfile, 'Legacy dashboard entry must not be compiled.' );

$package_json = file_get_contents( $root . '/package.json' );
assert_not_contains( 'admin/js/dashboard.js', $package_json, 'package.json must not expose the retired dashboard bundle as main.' );

$admin_source = file_get_contents( $root . '/admin/class-pixelgrade_assistant-admin.php' );
assert_not_contains( 'pixelgrade_assistant_dashboard', $admin_source, 'Classic dashboard mount must be removed from the admin class.' );
assert_not_contains( "admin.php?page=pixelgrade_assistant'", $admin_source, 'Admin class must not link to the retired classic dashboard route.' );

echo "Admin menu retirement OK\n";
