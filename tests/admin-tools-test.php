<?php
/**
 * Pins the secondary Tools tab (#50) on the Appearance -> Pixelgrade hub.
 *
 * Standalone: run with `php tests/admin-tools-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']       = array();
$GLOBALS['paf_denied_caps']   = array();
$GLOBALS['paf_plugin_config'] = array();

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

class PixelgradeAssistant_Admin {
	public static $internalApiEndpoints = array(
		'cleanup' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/cleanup',
		),
	);

	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-tools.php';
assert_true( file_exists( $module ), 'The Tools tab module must exist at includes/admin-tools.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_tools_tab' ), 'The Tools tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_tools_data' ), 'The Tools payload function must be defined.' );

$registered = pixassist_register_tools_tab( array() );
assert_same( 1, count( $registered ), 'Tools registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'tools', $tab['id'], 'Tools tab id must be `tools`.' );
assert_same( 'Tools', $tab['label'], 'Tools tab label must be `Tools`.' );
assert_same( 'manage_options', $tab['capability'], 'Tools tab must require manage_options because reset is admin-only.' );
assert_same( 'tools', $tab['component'], 'Tools tab must bind the `tools` JS component.' );
assert_same( '', $tab['gate'], 'Tools tab is free - no upsell gate.' );
assert_same( 'secondary', $tab['group'], 'Tools tab must be in the secondary tab group.' );
assert_same( 20, $tab['order'], 'Tools tab must sort after System Status inside the secondary group.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_tools_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Tools tab.' );
assert_same( 'secondary', $tabs[0]['group'], 'The normalized Tools tab must retain its secondary group.' );

$GLOBALS['paf_plugin_config'] = array(
	'systemStatus' => array(
		'l10n' => array(
			'resetPluginButtonLabel'         => 'Reset Assistant',
			'resetPluginDescription'         => 'Reset stored plugin state.',
			'resetPluginConfirmationMessage' => 'Confirm the reset answer.',
		),
	),
);

$payload = pixassist_get_tools_data();
$keys    = array_keys( $payload );
sort( $keys );
assert_same( array( 'copy', 'endpoints' ), $keys, 'Tools payload must expose exactly copy/endpoints.' );

assert_same( 'Tools', $payload['copy']['title'], 'Tools title must default to Tools.' );
assert_same( 'Reset Assistant', $payload['copy']['resetLabel'], 'Tools reset label comes from the existing systemStatus l10n config.' );
assert_same( 'Reset stored plugin state.', $payload['copy']['resetDescription'], 'Tools reset description comes from the existing systemStatus l10n config.' );
assert_same( 'Confirm the reset answer.', $payload['copy']['confirmationMessage'], 'Tools reset confirmation copy comes from the existing systemStatus l10n config.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['cleanup'], $payload['endpoints']['cleanup'], 'Tools must reuse the existing cleanup endpoint.' );

echo "Admin Tools tab OK\n";
