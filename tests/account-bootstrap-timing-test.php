<?php
/**
 * Pins account identity access before WordPress pluggable functions load.
 *
 * Standalone: run with `php tests/account-bootstrap-timing-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['pixassist_bootstrap_options'] = array(
	'pixassist_options' => array(
		'account' => array(
			'pixelgrade_user_id' => 42,
			'email'              => 'customer@example.com',
			'display_name'       => 'Customer',
			'user_login'         => 'customer-login',
			'avatar_url'         => '',
			'wp_user_id'         => 7,
			'connected_at'       => '2026-07-16 19:00:00',
		),
	),
);

function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, is_array( $args ) ? $args : array() );
}

function sanitize_text_field( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function sanitize_email( $value ) {
	return trim( (string) $value );
}

function esc_url_raw( $value ) {
	return (string) $value;
}

function absint( $value ) {
	return abs( (int) $value );
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['pixassist_bootstrap_options'] )
		? $GLOBALS['pixassist_bootstrap_options'][ $key ]
		: $default;
}

function get_avatar_url( $id_or_email ) {
	throw new RuntimeException( 'get_avatar_url() is unsafe before get_user_by() is available.' );
}

function pixassist_bootstrap_assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../includes/account.php';

pixassist_bootstrap_assert_same( false, function_exists( 'get_user_by' ), 'The regression must run before WordPress pluggable user functions exist.' );

$identity = pixassist_read_modern_account_identity();

pixassist_bootstrap_assert_same( true, $identity['is_connected'], 'The stored account must remain connected during early bootstrap.' );
pixassist_bootstrap_assert_same( 'customer@example.com', $identity['email'], 'Early bootstrap must preserve the stored account email.' );
pixassist_bootstrap_assert_same( '', $identity['avatar_url'], 'Early bootstrap must defer avatar enrichment until pluggable functions are available.' );

echo "Account bootstrap timing OK\n";
