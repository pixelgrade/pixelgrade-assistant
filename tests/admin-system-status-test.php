<?php
/**
 * Pins the secondary System Status tab (#50) on the Appearance -> Pixelgrade hub.
 *
 * Standalone: run with `php tests/admin-system-status-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']       = array();
$GLOBALS['paf_denied_caps']   = array();
$GLOBALS['paf_plugin_config'] = array();
$GLOBALS['paf_system_status'] = array(
	'allowDataCollect' => true,
	'installation'     => array(
		'url' => array(
			'label'       => 'Home URL',
			'value'       => 'https://example.test/',
			'is_viewable' => true,
		),
	),
	'activePlugins'    => array(
		'pixelgrade-assistant/pixelgrade-assistant.php' => array(
			'name'    => 'Pixelgrade Assistant',
			'version' => '2.1.0',
		),
	),
	'system'           => array(
		'php_version' => array(
			'label' => 'PHP Version',
			'value' => '8.3.0',
		),
	),
);

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

function esc_url_raw( $url ) {
	return (string) $url;
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

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

class PixelgradeAssistant_Admin {
	public static $internalApiEndpoints = array(
		'dataCollect' => array(
			'get' => array(
				'method' => 'GET',
				'url'    => 'https://example.test/wp-json/pixassist/v1/data_collect',
			),
			'set' => array(
				'method' => 'POST',
				'url'    => 'https://example.test/wp-json/pixassist/v1/data_collect',
			),
		),
	);

	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}
}

class PixelgradeAssistant_DataCollector {
	public static function get_system_status_data() {
		return $GLOBALS['paf_system_status'];
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-system-status.php';
assert_true( file_exists( $module ), 'The System Status tab module must exist at includes/admin-system-status.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_system_status_tab' ), 'The System Status tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_system_status_data' ), 'The System Status payload function must be defined.' );

$registered = pixassist_register_system_status_tab( array() );
assert_same( 1, count( $registered ), 'System Status registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'system-status', $tab['id'], 'System Status tab id must be `system-status`.' );
assert_same( 'System Status', $tab['label'], 'System Status tab label must be `System Status`.' );
assert_same( 'manage_options', $tab['capability'], 'System Status tab must require manage_options because its REST controls are admin-only.' );
assert_same( 'systemStatus', $tab['component'], 'System Status tab must bind the `systemStatus` JS component.' );
assert_same( '', $tab['gate'], 'System Status tab is free - no upsell gate.' );
assert_same( 'secondary', $tab['group'], 'System Status tab must be in the secondary tab group.' );
assert_same( 10, $tab['order'], 'System Status tab must sort first inside the secondary group.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_system_status_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the System Status tab.' );
assert_same( 'secondary', $tabs[0]['group'], 'The normalized System Status tab must retain its secondary group.' );

$GLOBALS['paf_plugin_config'] = array(
	'systemStatus' => array(
		'l10n' => array(
			'title'                   => 'Diagnostics',
			'description'             => 'Share diagnostics with support.',
			'allowDataCollectText'    => 'Allow diagnostic collection',
			'tableWPDataTitle'        => 'Install data',
			'tableSystemDataTitle'    => 'System data',
			'tableActivePluginsTitle' => 'Active plugin data',
		),
	),
);

$payload = pixassist_get_system_status_data();
$keys    = array_keys( $payload );
sort( $keys );
assert_same( array( 'copy', 'endpoints', 'siteHealthUrl', 'status' ), $keys, 'System Status payload must expose exactly copy/endpoints/siteHealthUrl/status.' );

assert_same( 'Diagnostics', $payload['copy']['title'], 'System Status title comes from the existing systemStatus l10n config.' );
assert_same( 'Share diagnostics with support.', $payload['copy']['description'], 'System Status description comes from the existing systemStatus l10n config.' );
assert_same( 'Allow diagnostic collection', $payload['copy']['collectLabel'], 'Data collection toggle copy comes from the existing systemStatus l10n config.' );
assert_same( 'Install data', $payload['copy']['sections']['installation'], 'Installation section label comes from the existing systemStatus l10n config.' );
assert_same( 'System data', $payload['copy']['sections']['system'], 'System section label comes from the existing systemStatus l10n config.' );
assert_same( 'Active plugin data', $payload['copy']['sections']['activePlugins'], 'Active plugins section label comes from the existing systemStatus l10n config.' );

assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['dataCollect'], $payload['endpoints']['dataCollect'], 'System Status must reuse the existing data_collect endpoints.' );
assert_same( 'https://example.test/wp-admin/site-health.php', $payload['siteHealthUrl'], 'System Status payload must include the core Site Health URL.' );
assert_same( $GLOBALS['paf_system_status'], $payload['status'], 'System Status payload must reuse PixelgradeAssistant_DataCollector data.' );

echo "Admin System Status tab OK\n";
