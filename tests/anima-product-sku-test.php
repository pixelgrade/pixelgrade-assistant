<?php
/**
 * Pins the product SKU used by the released Anima distribution.
 *
 * Anima 2.0.46 registers its WUpdates slug as `anima` even when installed in the
 * WordPress.org `anima-lt` directory. The Assistant cloud product (starter
 * catalog, docs, and account context) is registered as `anima-lt`, so service
 * requests must use that canonical product SKU without changing the raw
 * WUpdates identity.
 *
 * Standalone: run with `php tests/anima-product-sku-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'DAY_IN_SECONDS', 86400 );
define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.com/' );

$GLOBALS['paf_anima_transients'] = array();
$GLOBALS['paf_anima_options']    = array();
$GLOBALS['paf_anima_requests']   = array();

function add_action() {
	return true;
}

function add_filter() {
	return true;
}

function apply_filters( $hook, $value ) {
	if ( 'wupdates_gather_ids' === $hook ) {
		return array(
			'anima-lt' => array(
				'id'   => 'QBAXY',
				'type' => 'theme_lt_wporg',
				'slug' => 'anima',
				'name' => 'Anima',
			),
		);
	}

	return $value;
}

function get_template() {
	return 'anima-lt';
}

function get_template_directory() {
	return '/themes/anima-lt';
}

function get_theme_support() {
	return false;
}

if ( ! class_exists( 'WP_Theme' ) ) {
	class WP_Theme {
		public function get( $key ) {
			return 'Name' === $key ? 'Anima' : '';
		}
	}
}

function wp_get_theme() {
	return new WP_Theme();
}

function sanitize_title( $title ) {
	return strtolower( (string) $title );
}

function absint( $value ) {
	return abs( (int) $value );
}

function wp_encode_emoji( $content ) {
	return $content;
}

function get_transient( $key ) {
	return isset( $GLOBALS['paf_anima_transients'][ $key ] ) ? $GLOBALS['paf_anima_transients'][ $key ] : false;
}

function set_transient( $key, $value ) {
	$GLOBALS['paf_anima_transients'][ $key ] = $value;

	return true;
}

function delete_transient( $key ) {
	unset( $GLOBALS['paf_anima_transients'][ $key ] );

	return true;
}

function get_option( $key, $default = false ) {
	return isset( $GLOBALS['paf_anima_options'][ $key ] ) ? $GLOBALS['paf_anima_options'][ $key ] : $default;
}

function add_option( $key, $value ) {
	if ( isset( $GLOBALS['paf_anima_options'][ $key ] ) ) {
		return false;
	}

	$GLOBALS['paf_anima_options'][ $key ] = $value;

	return true;
}

function update_option( $key, $value ) {
	$GLOBALS['paf_anima_options'][ $key ] = $value;

	return true;
}

function delete_option( $key ) {
	unset( $GLOBALS['paf_anima_options'][ $key ] );

	return true;
}

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
	}
}

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
}

function wp_remote_request( $url, $args ) {
	$GLOBALS['paf_anima_requests'][] = array(
		'url'  => $url,
		'args' => $args,
	);

	return array(
		'body' => json_encode(
			array(
				'code' => 'success',
				'data' => array(
					'config' => array(
						'starterContent' => array(
							'demos' => array( 'pile-lt' => array() ),
						),
					),
				),
			)
		),
	);
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php';

assert_same( 'anima', PixelgradeAssistant_Admin::get_original_theme_slug(), 'The raw WUpdates slug must remain available.' );

if ( ! method_exists( 'PixelgradeAssistant_Admin', 'get_product_sku' ) ) {
	fwrite( STDERR, "Assistant must expose the canonical service product SKU.\n" );
	exit( 1 );
}

assert_same( 'anima-lt', PixelgradeAssistant_Admin::get_product_sku(), 'Released Anima builds must resolve to the registered anima-lt product.' );
assert_same(
	true,
	PixelgradeAssistant_Admin::isApplicableToCurrentThemeType( array( 'applicableTypes' => array( 'theme_wporg' ) ) ),
	'Anima\'s theme_lt_wporg distribution must remain compatible with the LT catalog published for theme_wporg.'
);

PixelgradeAssistant_Admin::get_remote_config( true );

assert_same( 1, count( $GLOBALS['paf_anima_requests'] ), 'The catalog lookup must make one service request.' );
assert_same( 'anima-lt', $GLOBALS['paf_anima_requests'][0]['args']['body']['sku'], 'The catalog lookup must send the registered anima-lt SKU.' );

echo "Anima service product SKU OK\n";
