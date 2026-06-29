<?php
/**
 * Pins the Appearance -> Pixelgrade hub bootstrap data assembler.
 *
 * `pixassist_get_admin_hub_data()` builds the payload the React hub shell is bootstrapped with:
 * the normalized visible tabs (from the #42 `pixelgrade/admin_hub/tabs` registry), the default tab
 * (first visible tab by order), and the hub URL.
 *
 * Standalone: run with `php tests/admin-hub-test.php` (no WordPress needed).
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

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
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
require __DIR__ . '/../includes/admin-hub.php';

/*
 * No tabs registered yet (the shell ships before #44/#56): empty tab list, empty default, but the
 * hub URL is always present so the shell can still render an empty-state.
 */
$GLOBALS['paf_filters'] = array();
$data = pixassist_get_admin_hub_data();

$keys = array_keys( $data );
sort( $keys );
assert_same( array( 'baseUrl', 'defaultTab', 'tabAliases', 'tabs' ), $keys, 'Hub data must expose exactly tabs/defaultTab/baseUrl/tabAliases.' );
assert_same( array(), $data['tabs'], 'With no registered tabs, tabs must be an empty array.' );
assert_same( '', $data['defaultTab'], 'With no registered tabs, defaultTab must be empty.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade', $data['baseUrl'], 'baseUrl must point at the Appearance hub page.' );
assert_same( 'account', $data['tabAliases']['account-license'], 'Legacy Account & License links must route to Account.' );
assert_same( 'starter-sites', $data['tabAliases']['recipes'], 'Legacy Recipes links must route to Starter Sites because recipes now live in that flow.' );

/*
 * With registered tabs, the hub data carries the normalized + sorted registry and defaults to the
 * first visible tab (lowest order).
 */
$GLOBALS['paf_filters'] = array();
add_filter(
	'pixelgrade/admin_hub/tabs',
	function () {
		return array(
			array( 'id' => 'starter', 'label' => 'Starter Sites', 'component' => 'starterSites', 'order' => 30 ),
			array( 'id' => 'overview', 'label' => 'Overview', 'component' => 'overview', 'order' => 10 ),
		);
	}
);

$data = pixassist_get_admin_hub_data();
$ids  = array_map(
	function ( $tab ) {
		return $tab['id'];
	},
	$data['tabs']
);

assert_same( array( 'overview', 'starter' ), $ids, 'Hub data tabs must be the normalized registry, sorted by order.' );
assert_same( 'overview', $data['defaultTab'], 'defaultTab must be the first visible tab (lowest order).' );

$app_js    = file_get_contents( __DIR__ . '/../admin/src-modern/hub/App.js' );
$tabbar_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/TabBar.js' );
$routing_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/useTabRouting.js' );

assert_true( false !== strpos( $app_js, 'pixelgrade-admin-hub__chrome' ), 'The hub shell must render a visible chrome/header wrapper.' );
assert_true( false !== strpos( $app_js, 'pixelgrade-admin-hub__title' ), 'The hub shell must render a visible Pixelgrade Design title.' );
assert_true( false !== strpos( $app_js, 'tabAliases' ), 'The hub shell must pass tab aliases into routing.' );
assert_true( false !== strpos( $tabbar_js, 'designTabs' ), 'The tab bar must render the left design cluster separately.' );
assert_true( false !== strpos( $tabbar_js, 'serviceTabs' ), 'The tab bar must render Account and Help as a right-side service cluster.' );
assert_true( false !== strpos( $tabbar_js, 'utilityTabs' ), 'The tab bar must collect utility tabs separately for More.' );
assert_true( false !== strpos( $tabbar_js, "role: 'navigation'" ), 'The tab bar wrapper must be navigation, not the tablist itself.' );
assert_true( false !== strpos( $tabbar_js, 'pixelgrade-admin-hub__tabbar-tabs' ), 'The tablist must be isolated from the utility More dropdown.' );
assert_true( false !== strpos( $tabbar_js, 'Dropdown' ), 'The tab bar must use an accessible dropdown for More utilities.' );
assert_true( false !== strpos( $tabbar_js, 'MenuItem' ), 'The More dropdown must render utility entries as menu items.' );
assert_true( false !== strpos( $tabbar_js, "'More'" ), 'The utility dropdown button must be labeled More.' );
assert_true( false === strpos( $tabbar_js, 'secondaryTabs.map( ( tab ) => renderTab' ), 'Utility tabs must not be rendered as peer top-level tabs.' );
assert_true( false !== strpos( $tabbar_js, 'renderTabBadge' ), 'The tab bar must render quiet descriptor badges beside labels.' );
assert_true( false !== strpos( $tabbar_js, 'tab.badge' ), 'The tab bar must read the badge descriptor field.' );
assert_true( false !== strpos( $tabbar_js, 'aria-current' ), 'The active tab must expose aria-current for navigation clarity.' );
assert_true( false === strpos( $tabbar_js, "variant: isActive ? 'primary' : 'tertiary'" ), 'The active tab must not use the primary action button variant.' );
assert_true( false !== strpos( $routing_js, 'aliases' ), 'Tab routing must resolve legacy aliases.' );
assert_true( false !== strpos( $routing_js, "params.set( 'section', 'plus' )" ), 'Legacy Account & License routes must canonicalize to the Plus Account section.' );
assert_true( false !== strpos( $routing_js, "params.get( 'section' )" ), 'Direct section=plus links must select Account rather than falling back to Home.' );

echo "Admin hub data OK\n";
