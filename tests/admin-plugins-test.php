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
assert_same( 'Setup', $tab['label'], 'Plugins tab visible label must be renamed to Setup while keeping id `plugins`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Plugins tab must require edit_theme_options.' );
assert_same( 'plugins', $tab['component'], 'Plugins tab must bind the `plugins` JS component.' );
assert_same( '', $tab['gate'], 'Plugins tab is free - no upsell gate.' );
assert_same( 50, $tab['order'], 'Setup must sort after Layouts in the design cluster.' );

$registered = pixassist_register_plugins_tab( array( array( 'id' => 'overview' ) ) );
assert_same( 2, count( $registered ), 'Plugins registration must keep existing tabs.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_plugins_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Plugins tab.' );
assert_same( 'plugins', $tabs[0]['id'], 'The normalized Plugins tab must retain id `plugins`.' );
assert_same( 'Setup', $tabs[0]['label'], 'The normalized Plugins tab must be visible as Setup.' );
assert_same( '', $tabs[0]['gate'], 'The normalized Plugins tab must remain free.' );
assert_same( 50, $tabs[0]['order'], 'The normalized Setup tab must retain order 50.' );

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
assert_same( array( 'copy', 'plugins', 'readiness' ), $keys, 'Setup payload must expose plugins (the actionable list), copy, and the readiness summary.' );

// The Setup tab is a Pixelgrade Design preflight: the readiness summary must be present and classified.
$readiness = $payload['readiness'];
assert_true( is_array( $readiness ) && ! empty( $readiness['overall'] ), 'Setup payload must carry an overall readiness verdict.' );
assert_true( in_array( $readiness['overall']['status'], array( 'ready', 'attention', 'blocked' ), true ), 'Overall readiness must be one of ready/attention/blocked.' );
assert_true( ! empty( $readiness['checks'] ) && is_array( $readiness['checks'] ), 'Readiness must expose individual checks.' );
$readiness_ids = array_column( $readiness['checks'], 'id' );
assert_true( in_array( 'plugins', $readiness_ids, true ), 'Readiness checks must include the recommended-plugins check.' );
assert_true( in_array( 'php', $readiness_ids, true ), 'Readiness checks must include the PHP environment check.' );
assert_true( in_array( 'theme', $readiness_ids, true ), 'Readiness checks must include the active-theme check.' );

assert_same( 'Setup', $payload['copy']['title'], 'Setup copy title must frame the screen as Pixelgrade Design readiness, not generic plugin management.' );
assert_same( 'Check the recommended plugins and activate anything Pixelgrade Design needs before you start working.', $payload['copy']['content'], 'Setup copy must describe readiness for Pixelgrade Design.' );
assert_true( false === strpos( $payload['copy']['title'], 'Plugins' ), 'Setup title must not use the old Plugins wording.' );
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

$GLOBALS['paf_plugin_config'] = array();
$payload                      = pixassist_get_plugins_data();
assert_same( 0, count( $payload['plugins'] ), 'Plugins payload must allow a deliberate empty recommended-plugin state.' );
assert_same( 'You are all set. There are no recommended plugins for this theme right now.', $payload['copy']['empty'], 'Empty plugin copy must read like a deliberate state, not a broken list.' );

$wizard_source = file_get_contents( __DIR__ . '/../admin/src/components/plugin_manager.js' );
assert_true( false !== strpos( $wizard_source, 'plugin-manager__empty' ), 'Setup wizard plugin manager must render a styled empty state.' );
assert_true( false !== strpos( $wizard_source, 'noPluginsTitle' ), 'Setup wizard plugin manager must support a title for the empty state.' );

$plugins_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Plugins.js' );
assert_true( false !== strpos( $plugins_js, "title: __( 'Setup'" ), 'Setup JS fallback copy must use the new Setup title.' );
assert_true( false === strpos( $plugins_js, "title: __( 'Manage plugins'" ), 'Setup JS fallback copy must not use the old Manage plugins title.' );

echo "Admin Plugins tab OK\n";
