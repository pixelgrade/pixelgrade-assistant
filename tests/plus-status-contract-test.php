<?php
/**
 * Pins the consumer side of the Pixelgrade Plus <-> Assistant status contract.
 *
 * Assistant reads Pixelgrade Plus's status through the `pixelgrade_assistant_plus_status`
 * filter via `pixassist_get_plus_status()`. This test asserts that helper always returns
 * EXACTLY the four contract keys with the right types — resilient to the filter being
 * unregistered (Plus loads after Assistant) or returning a non-array — and that a
 * registered Plus-style callback surfaces through.
 *
 * Canonical contract + change protocol (edit BOTH repos in lockstep):
 *   ../pixelgrade-plus/docs/architecture/plus-assistant-contract.md
 * Producer drift guard: ../pixelgrade-plus/tests/assistant-status-test.php
 *
 * Standalone: run with `php tests/plus-status-contract-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

// Minimal WordPress stubs so includes/capabilities.php can load in isolation.
define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();

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

require __DIR__ . '/../includes/capabilities.php';

$contract_keys = array( 'is_plus_active', 'is_plus_licensed', 'plus_settings_url', 'plus_product_label' );

/**
 * Resets the filter registry between cases.
 */
function paf_reset() {
	$GLOBALS['paf_filters'] = array();
}

/*
 * Default: Plus not registered, PIXELGRADE_PLUS_PLUGIN_FILE undefined. The consumer
 * must still return exactly the four contract keys with safe defaults.
 */
paf_reset();
$status = pixassist_get_plus_status();

$keys = array_keys( $status );
sort( $keys );
$expected = $contract_keys;
sort( $expected );

assert_same( $expected, $keys, 'pixassist_get_plus_status() must return EXACTLY the four contract keys.' );
assert_true( is_bool( $status['is_plus_active'] ), 'is_plus_active must be a bool.' );
assert_true( is_bool( $status['is_plus_licensed'] ), 'is_plus_licensed must be a bool.' );
assert_true( is_string( $status['plus_settings_url'] ), 'plus_settings_url must be a string.' );
assert_true( is_string( $status['plus_product_label'] ), 'plus_product_label must be a string.' );
assert_same( false, $status['is_plus_active'], 'Without Plus present, is_plus_active should be false.' );
assert_same( false, $status['is_plus_licensed'], 'Without Plus present, is_plus_licensed should be false.' );
assert_same( false, pixassist_is_plus_active(), 'pixassist_is_plus_active() should be false without Plus.' );

/*
 * Plus registered: a Plus-style callback reports active + licensed. The consumer
 * surfaces those values and still exposes exactly the four keys.
 */
paf_reset();
add_filter(
	'pixelgrade_assistant_plus_status',
	function ( $status ) {
		return array_merge(
			is_array( $status ) ? $status : array(),
			array(
				'is_plus_active'     => true,
				'is_plus_licensed'   => true,
				'plus_settings_url'  => 'https://example.test/wp-admin/options-general.php?page=pixelgrade-plus',
				'plus_product_label' => 'Pixelgrade Plus',
			)
		);
	}
);

$status = pixassist_get_plus_status();
$keys   = array_keys( $status );
sort( $keys );

assert_same( $expected, $keys, 'A registered Plus callback must not change the contract key set.' );
assert_same( true, $status['is_plus_active'], 'A registered Plus callback should surface is_plus_active.' );
assert_same( true, $status['is_plus_licensed'], 'A registered Plus callback should surface is_plus_licensed.' );
assert_same( 'https://example.test/wp-admin/options-general.php?page=pixelgrade-plus', $status['plus_settings_url'], 'The settings URL should pass through unchanged.' );
assert_same( true, pixassist_is_plus_active(), 'pixassist_is_plus_active() should be true when Plus reports active.' );

/*
 * Resilience: a malformed (non-array) filter return must not break the consumer;
 * it falls back to the four-key defaults.
 */
paf_reset();
add_filter(
	'pixelgrade_assistant_plus_status',
	function () {
		return 'not-an-array';
	}
);

$status = pixassist_get_plus_status();
$keys   = array_keys( $status );
sort( $keys );

assert_same( $expected, $keys, 'A malformed filter return must still yield exactly the four contract keys.' );
assert_same( false, $status['is_plus_active'], 'A malformed filter return should fall back to inactive.' );

echo "Plus status contract OK\n";
