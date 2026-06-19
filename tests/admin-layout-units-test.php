<?php
/**
 * Pins the granular Layouts hub tab.
 *
 * Standalone: run with `php tests/admin-layout-units-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();

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
		$args[0]   = $value;
		$accepted  = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$value     = call_user_func_array( $entry['callback'], array_slice( $args, 0, max( 1, $accepted ) ) );
		$args[0]   = $value;
	}

	return $value;
}

function current_user_can( $capability ) {
	return true;
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
		array(
			'id'          => 'premium-pack',
			'title'       => 'Premium Pack',
			'baseRestUrl' => 'https://starter.pixelgrade.com/premium/wp-json/sce/v2/',
			'gate'        => 'plus_licensed',
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
		'layoutUnits' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/layout_units',
		),
			'importUnit'  => array(
				'method' => 'POST',
				'url'    => 'https://example.test/wp-json/pixassist/v1/import_unit',
			),
			'queueUnit'   => array(
				'method' => 'POST',
				'url'    => 'https://example.test/wp-json/pixassist/v1/queue_unit',
			),
			'unitJobStatus' => array(
				'method' => 'POST',
				'url'    => 'https://example.test/wp-json/pixassist/v1/unit_job_status',
			),
			'undoUnit'    => array(
				'method' => 'POST',
				'url'    => 'https://example.test/wp-json/pixassist/v1/undo_unit',
			),
	);
}

class PAF_Starter_Content {
	public function get_applied_layout_units() {
		return array(
			'wp_template_part:header' => array(
				'type'        => 'wp_template_part',
				'slug'        => 'header',
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

$module = __DIR__ . '/../includes/admin-layout-units.php';
assert_true( file_exists( $module ), 'The Layouts tab module must exist at includes/admin-layout-units.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_layout_units_tab' ), 'The Layouts tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_layout_units_data' ), 'The Layouts payload function must be defined.' );

$registered = pixassist_register_layout_units_tab( array() );
assert_same( 1, count( $registered ), 'Layouts registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'layouts', $tab['id'], 'Layouts tab id must be `layouts`.' );
assert_same( 'Layouts', $tab['label'], 'Layouts tab label must be `Layouts`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Layouts tab must require edit_theme_options.' );
assert_same( 'layoutUnits', $tab['component'], 'Layouts tab must bind the `layoutUnits` JS component.' );
assert_same( 35, $tab['order'], 'Layouts tab must sort after Starter Sites.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_layout_units_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Layouts tab.' );
assert_same( 'layouts', $tabs[0]['id'], 'The normalized Layouts tab must retain id `layouts`.' );

$data = pixassist_get_layout_units_data();
assert_same( 'Layouts', $data['copy']['title'], 'Layouts payload must carry tab copy.' );
assert_same( 'Features', $data['copy']['features'], 'Layouts payload must carry the Features group label.' );
assert_same( 'Include sample projects', $data['copy']['sampleLabel'], 'Layouts payload must carry the feature sample-toggle label.' );
assert_same( 2, count( $data['sources'] ), 'Layouts payload must expose starter sources.' );
assert_same( 'anima-restaurant', $data['sources'][0]['id'], 'Layouts sources must preserve starter IDs.' );
assert_same( 'Olive & Ash', $data['sources'][0]['title'], 'Layouts sources must preserve starter titles.' );
assert_same( '', $data['sources'][0]['gate'], 'Free source gates must stay empty.' );
assert_same( 'plus_licensed', $data['sources'][1]['gate'], 'Premium source gates must be preserved for presentation.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['layoutUnits'], $data['endpoints']['layoutUnits'], 'Layouts payload must expose the unit-list endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['importUnit'], $data['endpoints']['importUnit'], 'Layouts payload must expose the unit-import endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['queueUnit'], $data['endpoints']['queueUnit'], 'Layouts payload must expose the async unit queue endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['unitJobStatus'], $data['endpoints']['unitJobStatus'], 'Layouts payload must expose the async unit job status endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['undoUnit'], $data['endpoints']['undoUnit'], 'Layouts payload must expose the unit-undo endpoint.' );
assert_same( 'Olive & Ash', $data['applied']['wp_template_part:header']['sourceTitle'], 'Layouts payload must expose initially applied units.' );

echo "Admin Layouts tab OK\n";
