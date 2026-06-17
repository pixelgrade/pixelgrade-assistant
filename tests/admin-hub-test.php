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
assert_same( array( 'baseUrl', 'defaultTab', 'tabs' ), $keys, 'Hub data must expose exactly tabs/defaultTab/baseUrl.' );
assert_same( array(), $data['tabs'], 'With no registered tabs, tabs must be an empty array.' );
assert_same( '', $data['defaultTab'], 'With no registered tabs, defaultTab must be empty.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade', $data['baseUrl'], 'baseUrl must point at the Appearance hub page.' );

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

echo "Admin hub data OK\n";
