<?php
/**
 * Pins the Page Patterns hub tab bootstrap contract.
 *
 * Standalone: run with `php tests/admin-content-patterns-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_denied_caps'] = array();

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
		$args[0]  = $value;
		$accepted = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$value    = call_user_func_array( $entry['callback'], array_slice( $args, 0, max( 1, $accepted ) ) );
		$args[0]  = $value;
	}

	return $value;
}

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function home_url( $path = '' ) {
	return 'https://example.test/' . ltrim( (string) $path, '/' );
}

function wp_create_nonce( $action = '' ) {
	return 'nonce-' . (string) $action;
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function pixassist_get_admin_hub_starters() {
	return array(
		array(
			'id'          => 'anima-restaurant',
			'title'       => 'Olive & Ash',
			'baseRestUrl' => 'https://starter.pixelgrade.com/anima-restaurant/wp-json/sce/v2/',
			'gate'        => '',
		),
	);
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
		'contentUnits' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/content_units',
		),
		'importContentUnit' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/import_content_unit',
		),
		'undoContentUnit' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/undo_content_unit',
		),
	);
}

class PAF_Starter_Content {
	public function get_applied_content_units() {
		return array(
			'page:about' => array(
				'type'        => 'page',
				'slug'        => 'about',
				'title'       => 'About',
				'sourceTitle' => 'Olive & Ash',
			),
		);
	}
}

function PixelgradeAssistant() {
	return (object) array(
		'starter_content' => new PAF_Starter_Content(),
	);
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-content-patterns.php';
assert_true( file_exists( $module ), 'The Page Patterns tab module must exist at includes/admin-content-patterns.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_content_patterns_tab' ), 'The Page Patterns tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_content_patterns_data' ), 'The Page Patterns payload function must be defined.' );

$registered = pixassist_register_content_patterns_tab( array() );
assert_same( 1, count( $registered ), 'Page Patterns registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'content', $tab['id'], 'Page Patterns tab id must be `content`.' );
assert_same( 'Page Patterns', $tab['label'], 'Page Patterns tab label must be `Page Patterns`.' );
assert_same( 'manage_options', $tab['capability'], 'Page Patterns tab must require manage_options because it imports content and media.' );
assert_same( 'contentPatterns', $tab['component'], 'Page Patterns tab must bind the `contentPatterns` JS component.' );
assert_same( 40, $tab['order'], 'Page Patterns tab must sit after Layouts and before Plugins.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_content_patterns_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Page Patterns tab.' );
assert_same( 'content', $tabs[0]['id'], 'The normalized Page Patterns tab must retain id `content`.' );

$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_denied_caps']['manage_options'] = true;
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_content_patterns_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 0, count( $tabs ), 'The normalized hub registry must hide Page Patterns when manage_options is unavailable.' );
$GLOBALS['paf_denied_caps'] = array();

$data = pixassist_get_content_patterns_data();
assert_same( 'Page Patterns', $data['copy']['title'], 'Page Patterns payload must carry tab copy.' );
assert_same( 1, count( $data['sources'] ), 'Page Patterns payload must expose starter sources.' );
assert_same( 'anima-restaurant', $data['sources'][0]['id'], 'Page Patterns sources must preserve starter IDs.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['contentUnits'], $data['endpoints']['contentUnits'], 'Page Patterns payload must expose the content-list endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['importContentUnit'], $data['endpoints']['importContentUnit'], 'Page Patterns payload must expose the content-import endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['undoContentUnit'], $data['endpoints']['undoContentUnit'], 'Page Patterns payload must expose the content-undo endpoint.' );
assert_same(
	array(
		'base'  => 'https://example.test/',
		'param' => 'pixassist_content_preview',
		'nonce' => 'nonce-pixassist_content_preview',
		'vw'    => 1200,
	),
	$data['preview'],
	'Page Patterns payload must expose the nonce-gated same-origin content preview config.'
);
assert_same( 'About', $data['applied']['page:about']['title'], 'Page Patterns payload must expose applied content units.' );

echo "Admin Page Patterns tab OK\n";
