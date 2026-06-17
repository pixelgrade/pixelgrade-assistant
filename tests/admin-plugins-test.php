<?php
/**
 * Pins the free Plugins tab (#48) on the Appearance -> Pixelgrade hub.
 *
 * Standalone: run with `php tests/admin-plugins-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']      = array();
$GLOBALS['paf_denied_caps']  = array();
$GLOBALS['paf_plugin_config'] = array();
$GLOBALS['paf_tgmpa_plugins'] = array();

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

function wp_strip_all_tags( $text ) {
	return trim( preg_replace( '/<[^>]*>/', '', (string) $text ) );
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
	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}

	public static function localize_tgmpa_data() {
		return $GLOBALS['paf_tgmpa_plugins'];
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-plugins.php';
assert_true( file_exists( $module ), 'The Plugins tab module must exist at includes/admin-plugins.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_plugins_tab' ), 'The Plugins tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_plugins_data' ), 'The Plugins tab payload function must be defined.' );

$registered = pixassist_register_plugins_tab( array() );
assert_same( 1, count( $registered ), 'Plugins registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'plugins', $tab['id'], 'Plugins tab id must be `plugins`.' );
assert_same( 'Plugins', $tab['label'], 'Plugins tab label must be `Plugins`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Plugins tab must require edit_theme_options.' );
assert_same( 'plugins', $tab['component'], 'Plugins tab must bind the `plugins` JS component.' );
assert_same( '', $tab['gate'], 'Plugins tab is free - no upsell gate.' );
assert_same( 20, $tab['order'], 'Plugins tab must sort after Overview and before Plus tabs (order 20).' );

$registered = pixassist_register_plugins_tab( array( array( 'id' => 'overview' ) ) );
assert_same( 2, count( $registered ), 'Plugins registration must keep existing tabs.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_plugins_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Plugins tab.' );
assert_same( 'plugins', $tabs[0]['id'], 'The normalized Plugins tab must retain id `plugins`.' );
assert_same( '', $tabs[0]['gate'], 'The normalized Plugins tab must remain free.' );
assert_same( 20, $tabs[0]['order'], 'The normalized Plugins tab must retain order 20.' );

$GLOBALS['paf_plugin_config'] = array(
	'recommendedPlugins' => array(
		'title'            => 'Manage plugins',
		'content'          => '{{theme_name}} recommends these plugins.',
		'validatedTitle'   => 'Plugins ready',
		'validatedContent' => 'Everything is ready.',
	),
	'pluginManager'      => array(
		'l10n' => array(
			'noPlugins'            => 'No recommended plugins.',
			'groupByRequiredLabels' => array(
				'required'    => 'Required',
				'recommended' => 'Recommended',
			),
		),
	),
	'requiredPlugins'    => array(
		'plugins' => array(
			array(
				'name'        => 'Fallback Blocks',
				'slug'        => 'fallback-blocks',
				'required'    => false,
				'order'       => 80,
				'description' => 'Fallback description.',
			),
		),
	),
);

$GLOBALS['paf_tgmpa_plugins'] = array(
	'premium-pack' => array(
		'name'          => 'Premium Pack',
		'slug'          => 'premium-pack',
		'file_path'     => 'premium-pack/premium-pack.php',
		'required'      => true,
		'order'         => 5,
		'description'   => '<strong>Premium</strong> description.',
		'author'        => 'Pixelgrade',
		'is_installed'  => true,
		'is_active'     => false,
		'is_up_to_date' => true,
		'activate_url'  => 'https://example.test/wp-admin/themes.php?page=tgmpa&plugin=premium-pack',
	),
	'nova-blocks'  => array(
		'name'               => 'Nova Blocks',
		'slug'               => 'nova-blocks',
		'file_path'          => 'nova-blocks/nova-blocks.php',
		'required'           => false,
		'order'              => 10,
		'description'        => 'Blocks description.',
		'author'             => '',
		'is_installed'       => false,
		'is_active'          => false,
		'is_up_to_date'      => true,
		'is_update_required' => false,
		'install_url'        => 'https://example.test/wp-admin/themes.php?page=tgmpa&plugin=nova-blocks',
	),
	'active-help'  => array(
		'name'          => 'Active Helper',
		'slug'          => 'active-help',
		'file_path'     => 'active-help/active-help.php',
		'required'      => false,
		'order'         => 30,
		'description'   => 'Already active.',
		'is_installed'  => true,
		'is_active'     => true,
		'is_up_to_date' => false,
	),
);

$payload = pixassist_get_plugins_data();
$keys    = array_keys( $payload );
sort( $keys );
assert_same( array( 'copy', 'plugins' ), $keys, 'Plugins payload must expose exactly plugins/copy.' );

assert_same( 'Manage plugins', $payload['copy']['title'], 'Plugins copy title comes from the existing recommendedPlugins config.' );
assert_same( 'No recommended plugins.', $payload['copy']['empty'], 'Plugins empty copy comes from pluginManager l10n.' );
assert_same( 'Required', $payload['copy']['groups']['required'], 'Required group label comes from pluginManager l10n.' );
assert_same( 'Recommended', $payload['copy']['groups']['recommended'], 'Recommended group label comes from pluginManager l10n.' );

$plugins = $payload['plugins'];
assert_same( 3, count( $plugins ), 'Plugins payload must use TGMPA-localized plugins when available.' );
assert_same( array( 'premium-pack', 'nova-blocks', 'active-help' ), array_column( $plugins, 'slug' ), 'Plugins must sort by required first, then order.' );

$premium = $plugins[0];
assert_same( 'inactive', $premium['status'], 'Installed-but-inactive plugins must expose inactive status.' );
assert_same( true, $premium['required'], 'Required flag must be preserved.' );
assert_same( 'Pixelgrade', $premium['author'], 'Author must be preserved.' );
assert_same( '<strong>Premium</strong> description.', $premium['description'], 'Description HTML must be preserved for rendering.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=tgmpa&plugin=premium-pack', $premium['activateUrl'], 'Activate URL must be preserved.' );

$missing = $plugins[1];
assert_same( 'missing', $missing['status'], 'Missing plugins must expose missing status.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=tgmpa&plugin=nova-blocks', $missing['installUrl'], 'Install URL must be preserved.' );

$outdated = $plugins[2];
assert_same( 'outdated', $outdated['status'], 'Active plugins with an available update must expose outdated status.' );

$GLOBALS['paf_tgmpa_plugins'] = array();
$payload = pixassist_get_plugins_data();
assert_same( 1, count( $payload['plugins'] ), 'When TGMPA has not localized data yet, payload falls back to the configured recommendations.' );
assert_same( 'fallback-blocks', $payload['plugins'][0]['slug'], 'Fallback plugin data must come from requiredPlugins.plugins.' );
assert_same( 'missing', $payload['plugins'][0]['status'], 'Fallback plugin data defaults to missing status.' );

echo "Admin Plugins tab OK\n";
