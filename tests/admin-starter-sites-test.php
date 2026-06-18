<?php
/**
 * Pins the free Starter Sites tab (#49) and the Plus starter-injection contract.
 *
 * Standalone: run with `php tests/admin-starter-sites-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']      = array();
$GLOBALS['paf_denied_caps']  = array();
$GLOBALS['paf_plugin_config'] = array();
$GLOBALS['paf_options']       = array();

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$value     = $args[0];
		$accepted  = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$arguments = array_slice( $args, 0, max( 1, $accepted ) );
		$args[0]   = call_user_func_array( $entry['callback'], $arguments );
	}

	return $args[0];
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

function esc_html_x( $text, $context, $domain = 'default' ) {
	return $text;
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function trailingslashit( $value ) {
	return rtrim( (string) $value, '/' ) . '/';
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

// Simulate the installed/active plugin set the dependency gate inspects. The test toggles entries in
// $GLOBALS['paf_installed_plugins'] (file_path => is_active) to drive the gate.
function get_plugins() {
	$plugins = array();
	foreach ( (array) ( $GLOBALS['paf_installed_plugins'] ?? array() ) as $file => $active ) {
		$plugins[ $file ] = array( 'Name' => $file );
	}

	return $plugins;
}

function is_plugin_active( $plugin_file ) {
	return ! empty( $GLOBALS['paf_installed_plugins'][ $plugin_file ] );
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

function pixassist_get_plus_status() {
	return array(
		'is_plus_active'     => true,
		'is_plus_licensed'   => false,
		'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account-license',
		'plus_product_label' => 'Pixelgrade Plus',
	);
}

class PixelgradeAssistant_Admin {
	public static $internalApiEndpoints = array(
		'import'      => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/import',
		),
		'uploadMedia' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/upload_media',
		),
	);

	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}

	public static function get_option( $key, $default = null ) {
		return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
	}

	public static function get_theme_support() {
		return array(
			'theme_name'  => 'anima-lt',
			'theme_title' => 'Anima LT',
		);
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-starter-sites.php';
assert_true( file_exists( $module ), 'The Starter Sites tab module must exist at includes/admin-starter-sites.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_starter_sites_tab' ), 'The Starter Sites tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_admin_hub_starters' ), 'The starter normalizer accessor must be defined.' );
assert_true( function_exists( 'pixassist_get_starter_sites_data' ), 'The Starter Sites payload function must be defined.' );

$registered = pixassist_register_starter_sites_tab( array() );
assert_same( 1, count( $registered ), 'Starter Sites registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'starter-sites', $tab['id'], 'Starter Sites tab id must be `starter-sites`.' );
assert_same( 'Starter Sites', $tab['label'], 'Starter Sites tab label must be `Starter Sites`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Starter Sites tab must require edit_theme_options.' );
assert_same( 'starterSites', $tab['component'], 'Starter Sites tab must bind the `starterSites` JS component.' );
assert_same( '', $tab['gate'], 'Starter Sites tab is mixed but host-visible/free - no tab-level gate.' );
assert_same( 30, $tab['order'], 'Starter Sites tab must sort after Plugins and before Help (order 30).' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_starter_sites_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Starter Sites tab.' );
assert_same( 'starter-sites', $tabs[0]['id'], 'The normalized Starter Sites tab must retain id `starter-sites`.' );
assert_same( '', $tabs[0]['gate'], 'The normalized Starter Sites tab must remain host-visible/free.' );

$GLOBALS['paf_plugin_config'] = array(
	'starterContent' => array(
		'l10n'               => array(
			'importTitle'              => '{{theme_name}} demo content',
			'importContentDescription' => 'Import the content from the theme demo.',
			'noSources'                => 'No starter sites are configured.',
			'alreadyImportedConfirm'   => 'Already imported?',
			'importingData'            => 'Getting data...',
			'somethingWrong'           => 'Something went wrong.',
			'errorMessage'             => 'Not available.',
			'importSuccessful'         => 'Successfully imported.',
			'imported'                 => 'Imported',
			'import'                   => 'Import',
			'importSelected'           => 'Import selected',
		),
		'defaultSceRestPath' => 'wp-json/sce/v2',
		'demos'              => array(
			'main'       => array(
				'title'       => 'Main demo',
				'description' => 'Main starter description.',
				'url'         => 'https://demos.pixelgrade.test/main',
				'order'       => 20,
				'image'       => 'https://demos.pixelgrade.test/main.jpg',
			),
			array(
				'id'    => 'secondary',
				'url'   => 'https://demos.pixelgrade.test/secondary/',
				'order' => 10,
			),
			'missing-url' => array(
				'title' => 'Missing URL',
			),
		),
	),
);

$GLOBALS['paf_options']['imported_starter_content'] = array(
	'main' => array(
		'pre_settings' => true,
	),
);

$GLOBALS['paf_filters'] = array();
add_filter(
	'pixelgrade/admin_hub/starters',
	function ( $starters, $context ) {
		assert_same( 'assistant', $context['provider'], 'Starter filter context must identify Assistant as the host/provider.' );
		assert_true( isset( $starters['main'] ), 'Starter filter must receive the configured free demos before Plus injects premium starters.' );

		$starters['premium-pack'] = array(
			'title'       => 'Premium pack',
			'description' => 'Premium starter description.',
			'url'         => 'https://premium.pixelgrade.test/pack/',
			'baseRestUrl' => 'https://premium.pixelgrade.test/pack/wp-json/sce/v2',
			'gate'        => 'plus_licensed',
			'order'       => 5,
			'previewUrl'  => 'https://premium.pixelgrade.test/pack/preview',
			'image'       => 'https://premium.pixelgrade.test/pack.jpg',
			'badge'       => 'Premium',
			'source'      => 'plus',
		);
		$starters[] = array(
			'id'    => 'main',
			'title' => 'Duplicate main',
			'url'   => 'https://duplicate.example.test/',
		);
		$starters[] = 'not-a-starter';

		return $starters;
	},
	10,
	2
);

$starters = pixassist_get_admin_hub_starters();
assert_same( array( 'premium-pack', 'secondary', 'main' ), array_column( $starters, 'id' ), 'Starters must include free + injected premium entries, drop malformed entries, dedupe ids, and sort by order.' );

$expected_starter_keys = array( 'badge', 'baseRestUrl', 'description', 'gate', 'id', 'image', 'order', 'previewUrl', 'requiredPlugins', 'source', 'title', 'url' );
foreach ( $starters as $starter ) {
	$keys = array_keys( $starter );
	sort( $keys );
	assert_same( $expected_starter_keys, $keys, 'Each normalized starter must expose exactly the documented item keys.' );
}

$premium = $starters[0];
assert_same( 'plus_licensed', $premium['gate'], 'Injected premium starters must preserve their gate.' );
assert_same( 'plus', $premium['source'], 'Injected premium starters may identify their source.' );
assert_same( 'https://premium.pixelgrade.test/pack/wp-json/sce/v2/', $premium['baseRestUrl'], 'baseRestUrl must be trailingslashed.' );

$secondary = $starters[1];
assert_same( 'Anima LT Demo Content', $secondary['title'], 'Missing starter title must fall back to the active Pixelgrade theme title.' );
assert_same( 'Import the content from the theme demo.', $secondary['description'], 'Missing starter description must fall back to starterContent l10n.' );
assert_same( 'https://demos.pixelgrade.test/secondary/wp-json/sce/v2/', $secondary['baseRestUrl'], 'Missing baseRestUrl must derive from url + defaultSceRestPath.' );
assert_same( '', $secondary['gate'], 'Configured free starters must default to no gate.' );

$main = $starters[2];
assert_same( 'main', $main['id'], 'Configured associative demo keys must become stable starter ids.' );
assert_same( 'Main demo', $main['title'], 'Configured starter title must be preserved.' );
assert_same( 'https://demos.pixelgrade.test/main/', $main['url'], 'Starter url must be trailingslashed.' );

$payload = pixassist_get_starter_sites_data();
$keys    = array_keys( $payload );
sort( $keys );
assert_same( array( 'copy', 'endpoints', 'imported', 'plus', 'starters' ), $keys, 'Starter Sites payload must expose exactly starters/copy/endpoints/imported/plus.' );
assert_same( 3, count( $payload['starters'] ), 'Payload starters must come from the same normalized free + injected list.' );
assert_same( 'Starter Sites', $payload['copy']['title'], 'Payload copy must include a tab title.' );
assert_same( 'Anima LT demo content', $payload['copy']['importTitle'], 'Payload copy must preserve the legacy importTitle token replacement.' );
assert_same( 'https://example.test/wp-json/pixassist/v1/import', $payload['endpoints']['import']['url'], 'Payload must expose the existing import REST endpoint.' );
assert_same( true, $payload['imported']['main']['pre_settings'], 'Payload must include existing starter import state.' );
assert_same( false, $payload['plus']['is_plus_licensed'], 'Payload must include the existing four-key Plus status for gated cards.' );

/*
 * Dependency gate (data-driven required plugins).
 */

// Free, non-gated starters default to Nova Blocks + Style Manager.
$free_required = $main['requiredPlugins'];
assert_same( array( 'nova-blocks', 'style-manager' ), array_column( $free_required, 'slug' ), 'Free starters must default to requiring Nova Blocks + Style Manager.' );
$required_keys = array_keys( $free_required[0] );
sort( $required_keys );
assert_same( array( 'isActive', 'isInstalled', 'name', 'slug' ), $required_keys, 'Each required-plugin entry must expose slug, name, isInstalled, isActive.' );
assert_same( 'Nova Blocks', $free_required[0]['name'], 'Required-plugin name must be preserved/humanized.' );

// With no plugins installed, both required plugins report inactive (the gate would block).
assert_same( false, $free_required[0]['isActive'], 'With no plugins installed, a required plugin must report inactive.' );
assert_same( false, $free_required[0]['isInstalled'], 'With no plugins installed, a required plugin must report not installed.' );

// Gated (premium) starters do NOT inherit the free default dependency set.
assert_same( array(), $premium['requiredPlugins'], 'Gated/premium starters must not inherit the free default required plugins.' );

// Status reflects the installed/active plugin set (slug -> folder match, regardless of main file name).
$GLOBALS['paf_installed_plugins'] = array(
	'nova-blocks/nova-blocks.php' => true,   // active
	'style-manager/style-manager.php' => false, // installed, inactive
);
$starters_after = pixassist_get_admin_hub_starters();
$main_after     = null;
foreach ( $starters_after as $s ) {
	if ( 'main' === $s['id'] ) {
		$main_after = $s;
	}
}
assert_true( null !== $main_after, 'The main starter must still resolve after toggling plugin status.' );
$by_slug = array();
foreach ( $main_after['requiredPlugins'] as $rp ) {
	$by_slug[ $rp['slug'] ] = $rp;
}
assert_same( true, $by_slug['nova-blocks']['isActive'], 'An active required plugin must report isActive=true (matched by folder slug).' );
assert_same( true, $by_slug['nova-blocks']['isInstalled'], 'An active required plugin must report isInstalled=true.' );
assert_same( false, $by_slug['style-manager']['isActive'], 'An installed-but-inactive required plugin must report isActive=false.' );
assert_same( true, $by_slug['style-manager']['isInstalled'], 'An installed-but-inactive required plugin must report isInstalled=true.' );

// A descriptor-declared requiredPlugins set overrides the default, and accepts bare slug strings.
$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_installed_plugins'] = array();
add_filter(
	'pixelgrade/admin_hub/starters',
	function ( $starters ) {
		$starters['declares-deps'] = array(
			'title'           => 'Declares deps',
			'url'             => 'https://demos.pixelgrade.test/declares/',
			'requiredPlugins' => array(
				array( 'slug' => 'woocommerce', 'name' => 'WooCommerce' ),
				'jetpack', // bare slug string
			),
		);

		return $starters;
	},
	10,
	2
);
$declared = null;
foreach ( pixassist_get_admin_hub_starters() as $s ) {
	if ( 'declares-deps' === $s['id'] ) {
		$declared = $s;
	}
}
assert_true( null !== $declared, 'A starter that declares requiredPlugins must resolve.' );
assert_same( array( 'woocommerce', 'jetpack' ), array_column( $declared['requiredPlugins'], 'slug' ), 'A starter-declared requiredPlugins set must override the default and accept bare slug strings.' );
assert_same( 'Jetpack', $declared['requiredPlugins'][1]['name'], 'A bare-slug required plugin must humanize its name.' );

// The Starter Sites copy exposes the dependency-gate strings and the Plugins-tab deep link.
$gate_copy = $payload['copy'];
assert_true( isset( $gate_copy['requirements']['message'] ), 'Starter Sites copy must include the requirements message.' );
assert_true( false !== strpos( $gate_copy['requirements']['message'], '%s' ), 'The requirements message must carry a %s placeholder for the plugin names.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $gate_copy['pluginsTabUrl'], 'Starter Sites copy must deep-link to the Plugins tab.' );
assert_true( isset( $gate_copy['actions']['managePlugins'] ), 'Starter Sites copy must include the managePlugins action label.' );

echo "Admin Starter Sites tab OK\n";
