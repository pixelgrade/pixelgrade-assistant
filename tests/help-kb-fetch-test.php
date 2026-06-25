<?php
/**
 * Pins that the in-dashboard Help KB is fetched by SKU even for the Anima LT placeholder hash.
 *
 * Regression guard for #59: PixelgradeAssistant_Help::get_kb_categories() used to short-circuit to
 * an empty array whenever the active theme reported the unregistered placeholder hash `QBAXY`
 * (Anima / Anima LT). Now that Anima LT is a registered pixelgrade.com product whose KB resolves by
 * the theme SKU (kb_current_product_sku, e.g. `anima-lt`) — exactly like get_remote_config() — the
 * guard is gone, so this test makes sure the round-trip still happens and is scoped by SKU.
 *
 * Standalone: run with `php tests/help-kb-fetch-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.com/' );

$GLOBALS['paf_remote_get_calls'] = array();
$GLOBALS['paf_remote_get_body']  = '';
$GLOBALS['paf_transients']       = array();

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

// --- WordPress shims -------------------------------------------------------

function apply_filters( $hook, $value ) {
	return $value;
}

function add_filter() {
	return true;
}

function add_action() {
	return true;
}

function get_transient( $key ) {
	return isset( $GLOBALS['paf_transients'][ $key ] ) ? $GLOBALS['paf_transients'][ $key ] : false;
}

function set_transient( $key, $value, $ttl = 0 ) {
	$GLOBALS['paf_transients'][ $key ] = $value;

	return true;
}

function add_query_arg( $args, $url ) {
	return $url . '?' . http_build_query( $args );
}

function is_wp_error( $thing ) {
	return false;
}

function wp_remote_get( $url, $args = array() ) {
	$GLOBALS['paf_remote_get_calls'][] = array( 'url' => $url, 'args' => $args );

	return array( 'body' => $GLOBALS['paf_remote_get_body'] );
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

// Minimal Admin double exposing only what get_kb_categories() touches. Note the placeholder hash
// QBAXY is still reported as "unregistered" — the point is that the KB no longer cares.
class PixelgradeAssistant_Admin {
	public static function get_original_theme_slug() {
		return 'anima-lt';
	}

	public static function get_theme_hash_id( $fallback = false ) {
		return 'QBAXY';
	}

	public static function get_theme_type() {
		return 'theme_wporg';
	}

	public static function is_unregistered_product_hash( $hash ) {
		return 'QBAXY' === (string) $hash;
	}

	public static function is_development_url( $url ) {
		return false;
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-help.php';

assert_true(
	class_exists( 'PixelgradeAssistant_Help' ),
	'The Help class must load.'
);

// The product SKU is the theme slug — this is what scopes the KB on the server.
assert_same(
	'anima-lt',
	PixelgradeAssistant_Help::get_kb_product_sku(),
	'The KB product SKU must be the active theme slug (anima-lt).'
);

// 1) Happy path: the server returns the LT knowledge base for the anima-lt SKU.
$GLOBALS['paf_remote_get_body'] = wp_json_encode_compat(
	array(
		'code' => 'success',
		'data' => array(
			'htkb_categories' => array(
				'27' => array( 'term_id' => 27, 'name' => 'Getting Started', 'articles' => array( array( 'ID' => 1 ) ) ),
			),
		),
	)
);

$categories = PixelgradeAssistant_Help::get_kb_categories( true );

assert_same(
	1,
	count( $GLOBALS['paf_remote_get_calls'] ),
	'get_kb_categories() must perform the remote round-trip for the QBAXY placeholder hash (no short-circuit).'
);

$request_url = $GLOBALS['paf_remote_get_calls'][0]['url'];
assert_true(
	false !== strpos( $request_url, 'kb_current_product_sku=anima-lt' ),
	'The KB request must be scoped by the theme SKU (kb_current_product_sku=anima-lt). URL: ' . $request_url
);
assert_true(
	false !== strpos( $request_url, 'get_htkb_categories' ),
	'The KB request must hit the public get_htkb_categories endpoint. URL: ' . $request_url
);

assert_true(
	is_array( $categories ) && isset( $categories['27'] ),
	'A successful KB response must be returned verbatim to the caller (non-empty).'
);

// 2) Unregistered/empty path: a missing_sku response yields an empty list (clean online-docs
// fallback) WITHOUT pre-empting the request — same shape as get_remote_config().
$GLOBALS['paf_remote_get_calls'] = array();
$GLOBALS['paf_remote_get_body']  = wp_json_encode_compat( array( 'code' => 'missing_sku', 'data' => array() ) );

$empty = PixelgradeAssistant_Help::get_kb_categories( true );

assert_same(
	1,
	count( $GLOBALS['paf_remote_get_calls'] ),
	'Even an unregistered SKU must round-trip (the server decides), not be guarded out client-side.'
);
assert_same(
	array(),
	$empty,
	'A missing_sku response must resolve to an empty KB so the panel falls back to the online docs.'
);

echo "Help KB fetch (ungated by SKU) OK\n";

/**
 * json_encode shim name kept distinct so this file never collides with a real wp_json_encode.
 */
function wp_json_encode_compat( $data ) {
	return json_encode( $data );
}
