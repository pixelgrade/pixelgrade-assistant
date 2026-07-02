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

/*
 * Site Parts (formerly Layouts) merged into the Design Library tab
 * (?tab=design-library&section=layouts); the legacy registration callback stays defined but
 * appends no visible tab, and the `layouts` id/route survives as a section id + alias (pinned in
 * tests/admin-hub-test.php).
 */
$registered = pixassist_register_layout_units_tab( array() );
assert_same( 0, count( $registered ), 'Layouts registration must no longer append a visible hub tab (merged into Design Library).' );

$registered = pixassist_register_layout_units_tab( array( array( 'id' => 'overview' ) ) );
assert_same( 1, count( $registered ), 'Layouts registration must keep existing tabs unchanged.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_layout_units_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 0, count( $tabs ), 'The normalized hub registry must not carry a standalone Layouts tab.' );

$data = pixassist_get_layout_units_data();
assert_same( 'Site Parts', $data['copy']['title'], 'The section payload must carry the Site Parts title.' );
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

$layout_units_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/LayoutUnits.js' );
assert_true( false !== strpos( $layout_units_js, 'prewarmedJobs' ), 'Layouts JS must keep prewarmed Apply jobs in component state.' );
assert_true( false !== strpos( $layout_units_js, 'prewarmedJobsRef' ), 'Layouts JS must read prewarmed Apply jobs from a ref so async prewarm results are available to the next click.' );
assert_true( false !== strpos( $layout_units_js, 'getPrewarmedJob' ), 'Layouts JS must look up a prewarmed Apply job before calling queueUnit.' );
assert_true( false !== strpos( $layout_units_js, 'consumePrewarmedJob' ), 'Layouts JS must consume each prewarmed Apply job only once.' );
assert_true( false !== strpos( $layout_units_js, 'operationSteps' ), 'Layouts JS must track visible operation steps for long Load/Apply actions.' );
assert_true( false !== strpos( $layout_units_js, 'getOperationButtonLabel' ), 'Layouts JS must surface operation steps inline through the active Load/Apply button label.' );
assert_true( false !== strpos( $layout_units_js, 'operation.key' ), 'Layouts JS must scope operation labels to the specific Load/Apply button that started the action.' );
assert_true( false === strpos( $layout_units_js, 'renderOperationSteps' ), 'Layouts JS must not render Load/Apply progress as a detached operation section.' );
assert_true( false !== strpos( $layout_units_js, 'Loading list' ), 'Load progress must show the layout-list request step with compact button copy.' );
assert_true( false !== strpos( $layout_units_js, 'Preparing parts' ), 'Load progress must show the background header/footer preparation step with compact button copy.' );
assert_true( false !== strpos( $layout_units_js, 'Prepared job' ), 'Apply progress must show when a prewarmed job is reused without widening row buttons too much.' );
assert_true( false !== strpos( $layout_units_js, 'Queueing job' ), 'Apply progress must show when a fresh apply job is queued with compact button copy.' );
assert_true( false !== strpos( $layout_units_js, 'Applying' ), 'Apply progress must show the layout application step with compact button copy.' );
assert_true( false !== strpos( $layout_units_js, 'Refreshing' ), 'Apply progress must show the final UI refresh step with compact button copy.' );
assert_true( false !== strpos( $layout_units_js, "minWidth: '104px'" ), 'Apply progress buttons must keep a stable row width across label changes.' );

echo "Admin Layouts tab OK\n";
