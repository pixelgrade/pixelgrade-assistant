<?php
/**
 * Pins the free Help tab (#47) on the Appearance -> Pixelgrade hub.
 *
 * Standalone: run with `php tests/admin-help-test.php` (no WordPress needed).
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

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-help.php';
assert_true( file_exists( $module ), 'The Help tab module must exist at includes/admin-help.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_help_tab' ), 'The Help tab registration function must be defined.' );

$registered = pixassist_register_help_tab( array() );
assert_same( 1, count( $registered ), 'Help registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'help', $tab['id'], 'Help tab id must be `help`.' );
assert_same( 'Help', $tab['label'], 'Help tab label must be `Help`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Help tab must require edit_theme_options.' );
assert_same( 'help', $tab['component'], 'Help tab must bind the `help` JS component.' );
assert_same( '', $tab['gate'], 'Help tab is free — no upsell gate.' );
assert_same( 90, $tab['order'], 'Help tab must sort after Plus premium tabs (order 90).' );

$registered = pixassist_register_help_tab( array( array( 'id' => 'overview' ) ) );
assert_same( 2, count( $registered ), 'Help registration must keep existing tabs.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_help_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Help tab.' );
assert_same( 'help', $tabs[0]['id'], 'The normalized Help tab must retain id `help`.' );
assert_same( '', $tabs[0]['gate'], 'The normalized Help tab must remain free.' );
assert_same( 90, $tabs[0]['order'], 'The normalized Help tab must retain order 90.' );

echo "Admin Help tab OK\n";
