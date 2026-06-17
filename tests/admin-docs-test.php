<?php
/**
 * Pins the contextual editor docs panel surface (#46).
 *
 * Standalone: run with `php tests/admin-docs-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.test/' );
define( 'PIXELGRADE_ASSISTANT__SHOP_BASE', 'https://pixelgrade.com/' );

$GLOBALS['paf_filters']        = array();
$GLOBALS['paf_options']        = array();
$GLOBALS['paf_user_meta']      = array();
$GLOBALS['paf_denied_caps']    = array();
$GLOBALS['paf_http_requests']  = array();
$GLOBALS['paf_current_user']   = 7;
$GLOBALS['paf_current_theme']  = 'anima-lt';

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function apply_filters( $hook, $value ) {
	$args = func_get_args();
	array_shift( $args );

	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$call_args = array_slice( $args, 0, (int) $entry['args'] );
		$value     = call_user_func_array( $entry['callback'], $call_args );
		$args[0]   = $value;
	}

	return $value;
}

function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, is_array( $args ) ? $args : array() );
}

function sanitize_text_field( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function sanitize_textarea_field( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function sanitize_email( $value ) {
	return trim( (string) $value );
}

function esc_url_raw( $value ) {
	return (string) $value;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function __( $text, $domain = 'default' ) {
	return $text;
}

function absint( $value ) {
	return abs( (int) $value );
}

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function get_current_user_id() {
	return (int) $GLOBALS['paf_current_user'];
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
}

function update_option( $key, $value ) {
	$GLOBALS['paf_options'][ $key ] = $value;

	return true;
}

function get_user_meta( $user_id, $key, $single = false ) {
	return isset( $GLOBALS['paf_user_meta'][ $user_id ][ $key ] ) ? $GLOBALS['paf_user_meta'][ $user_id ][ $key ] : '';
}

function update_user_meta( $user_id, $key, $value ) {
	$GLOBALS['paf_user_meta'][ $user_id ][ $key ] = $value;

	return true;
}

function delete_user_meta( $user_id, $key ) {
	unset( $GLOBALS['paf_user_meta'][ $user_id ][ $key ] );

	return true;
}

function get_avatar_url( $email ) {
	return 'https://example.test/avatar/' . md5( (string) $email );
}

function current_time( $type, $gmt = false ) {
	return '2026-06-16 12:00:00';
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function home_url( $path = '' ) {
	return 'https://example.test/' . ltrim( (string) $path, '/' );
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/' ) . '/';
}

function wp_json_encode( $data ) {
	return json_encode( $data );
}

function is_wp_error( $value ) {
	return false;
}

function wp_remote_request( $url, $args = array() ) {
	$GLOBALS['paf_http_requests'][] = array(
		'url'  => $url,
		'args' => $args,
	);

	return array(
		'response' => array( 'code' => 200 ),
		'body'     => '{"code":"success","message":"ok","data":{"ticket_id":"TKT-HTTP"}}',
	);
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

function wp_remote_retrieve_response_code( $response ) {
	return isset( $response['response']['code'] ) ? (int) $response['response']['code'] : 0;
}

function paf_reset_runtime() {
	$GLOBALS['paf_filters']       = array();
	$GLOBALS['paf_options']       = array();
	$GLOBALS['paf_user_meta']     = array();
	$GLOBALS['paf_denied_caps']   = array();
	$GLOBALS['paf_http_requests'] = array();
	$GLOBALS['paf_current_user']  = 7;
	$GLOBALS['paf_current_theme'] = 'anima-lt';

	if ( function_exists( 'pixassist_filter_modern_account_identity' ) ) {
		add_filter( 'pixassist_account', 'pixassist_filter_modern_account_identity' );
	}
	add_filter( 'pixassist_account_oauth_config', 'paf_oauth_config' );
}

function paf_oauth_config() {
	return array(
		'base_url'        => 'https://pixelgrade.test/',
		'consumer_key'    => 'consumer-key',
		'consumer_secret' => 'consumer-secret',
		'source'          => 'pixelgrade-assistant',
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
	public static function get_original_theme_slug() {
		return $GLOBALS['paf_current_theme'];
	}

	public static function get_theme_hash_id() {
		return 'theme-hash';
	}

	public static function get_theme_type() {
		return 'theme';
	}

	public static function is_development_url( $url ) {
		return false;
	}

	public static function get_theme_activation_user() {
		return (object) array(
			'ID'           => 11,
			'user_email'   => isset( $GLOBALS['paf_user_meta'][11]['pixelgrade_user_email'] ) ? $GLOBALS['paf_user_meta'][11]['pixelgrade_user_email'] : '',
			'display_name' => isset( $GLOBALS['paf_user_meta'][11]['pixelgrade_display_name'] ) ? $GLOBALS['paf_user_meta'][11]['pixelgrade_display_name'] : '',
			'user_login'   => 'wpadmin',
		);
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';
require __DIR__ . '/../includes/account.php';
require __DIR__ . '/../admin/class-pixelgrade_assistant-help.php';
require __DIR__ . '/../includes/admin-docs.php';

/*
 * 1. Editor bootstrap: safe docs data for JS, with the SlotFill contract and no credentials.
 */
paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id' => '42',
		'email'              => 'customer@example.com',
		'display_name'       => 'Customer',
		'user_login'         => 'customer-login',
		'oauth_token'        => 'acc-token',
		'oauth_token_secret' => 'acc-secret',
	)
);

$data = pixassist_get_docs_data();
$keys = array_keys( $data );
sort( $keys );
assert_same( array( 'account', 'copy', 'endpoints', 'product', 'slotFill', 'ticket' ), $keys, 'Docs payload must expose exactly account/copy/endpoints/product/slotFill/ticket.' );

assert_same( 'anima-lt', $data['product']['sku'], 'Docs payload must be product/theme scoped.' );
assert_same( 'https://pixelgrade.com/docs', $data['product']['docsUrl'], 'Docs payload must include the online docs fallback.' );
assert_same( 120, $data['ticket']['subjectMaxLength'], 'Docs payload must expose the support-ticket subject length limit.' );
assert_true( ! empty( $data['copy']['ticketSubjectHelp'] ), 'Docs payload must include subject guidance copy.' );
assert_true( ! empty( $data['copy']['ticketSubjectTooLong'] ), 'Docs payload must include a too-long subject error.' );
assert_same( 'pixelgradeAdminHub.docs', $data['slotFill']['global'], 'Docs SlotFill global must match the shared contract.' );
assert_same( 'pixelgrade-docs', $data['slotFill']['scope'], 'Docs SlotFill scope must match the shared contract.' );
assert_same( 'pixelgrade.docs.ticketRequest', $data['slotFill']['ticketRequestFilter'], 'Docs ticket filter must match the shared contract.' );
assert_same( '/pixassist/v1/kb_categories', $data['endpoints']['categories']['path'], 'Docs bundle must know the categories REST path.' );
assert_same( '/pixassist/v1/kb_vote', $data['endpoints']['vote']['path'], 'Docs bundle must know the vote REST path.' );
assert_same( '/pixassist/v1/docs_ticket', $data['endpoints']['ticket']['path'], 'Docs bundle must know the ticket REST path.' );
assert_same( true, $data['account']['is_connected'], 'Docs payload may expose identity connection state.' );
assert_true( ! array_key_exists( 'oauth_token', $data['account'] ), 'Docs payload must never expose oauth_token.' );
assert_true( ! array_key_exists( 'oauth_token_secret', $data['account'] ), 'Docs payload must never expose oauth_token_secret.' );
assert_true( false === strpos( wp_json_encode( $data ), 'acc-secret' ), 'Docs payload must never contain token secrets anywhere.' );

/*
 * 2. Voting: sanitize input, build the public ht_voting request body, and expose a test seam.
 */
paf_reset_runtime();
$captured_vote = array();
add_filter(
	'pre_pixassist_docs_vote_response',
	function ( $response, $body, $endpoint ) use ( &$captured_vote ) {
		$captured_vote = compact( 'body', 'endpoint' );

		return array(
			'code'    => 'success',
			'message' => 'recorded',
			'data'    => array( 'vote_key' => 'vote-1' ),
		);
	},
	10,
	3
);

$vote = pixassist_record_docs_vote(
	array(
		'article_id' => '55',
		'direction'  => 'up',
		'context'    => array( 'surface' => 'post' ),
	)
);
assert_same( 'success', $vote['code'], 'A valid vote must return the service envelope.' );
assert_same( 'https://pixelgrade.test/wp-json/pxm/v2/front/ht_voting', $captured_vote['endpoint'], 'Votes must target the public ht_voting endpoint.' );
assert_same( '55', $captured_vote['body']['post_id'], 'Vote body must include the article id as post_id.' );
assert_same( 'up', $captured_vote['body']['direction'], 'Vote body must include the direction.' );
assert_same( 'anima-lt', $captured_vote['body']['kb_current_product_sku'], 'Vote body must include the product scope.' );

$invalid_vote = pixassist_record_docs_vote( array( 'article_id' => '55', 'direction' => 'sideways' ) );
assert_same( 'invalid', $invalid_vote['code'], 'An invalid vote direction must be rejected before HTTP.' );

/*
 * 3. Tickets: account-gated, server-signed, sanitized, and short-circuitable for tests.
 */
paf_reset_runtime();
$not_connected = pixassist_submit_docs_ticket( array( 'subject' => 'Need help', 'details' => 'Details.' ) );
assert_same( 'not_connected', $not_connected['code'], 'Tickets require a connected account.' );

pixassist_save_account_connection(
	array(
		'pixelgrade_user_id' => '42',
		'email'              => 'customer@example.com',
		'display_name'       => 'Customer',
		'user_login'         => 'customer-login',
		'oauth_token'        => 'acc-token',
		'oauth_token_secret' => 'acc-secret',
	)
);

$captured_ticket = array();
add_filter(
	'pre_pixassist_docs_ticket_response',
	function ( $response, $body, $auth_header, $endpoint ) use ( &$captured_ticket ) {
		$captured_ticket = compact( 'body', 'auth_header', 'endpoint' );

		return array(
			'code'    => 'success',
			'message' => 'submitted',
			'data'    => array( 'ticket_id' => 'TKT-1' ),
		);
	},
	10,
	4
);

$ticket = pixassist_submit_docs_ticket(
	array(
		'subject' => 'Help with the editor',
		'details' => '<b>The layout changed.</b>',
		'topic'   => 'editor',
		'context' => array(
			'surface'    => 'post',
			'postType'   => 'page',
			'templateId' => 'anima//home',
			'articleId'  => '55',
		),
	)
);
assert_same( 'success', $ticket['code'], 'A connected ticket must return the service envelope.' );
assert_same( 'https://pixelgrade.test/wp-json/pxm/v2/front/create_ticket', $captured_ticket['endpoint'], 'Tickets must target the pxm/v2 create_ticket endpoint.' );
assert_true( 0 === strpos( $captured_ticket['auth_header'], 'OAuth ' ), 'Connected tickets must be OAuth signed server-side.' );
assert_same( 'Help with the editor', $captured_ticket['body']['subject'], 'Ticket subject must be preserved as text.' );
assert_same( 'The layout changed.', $captured_ticket['body']['details'], 'Ticket details must be sanitized as textarea text.' );
assert_same( '42', $captured_ticket['body']['user_id'], 'Ticket identity must come from the connected account.' );
assert_same( 'customer@example.com', $captured_ticket['body']['user_email'], 'Ticket email must come from the connected account.' );
assert_same( 'anima-lt', $captured_ticket['body']['product_sku'], 'Ticket must include the product scope.' );
assert_same( 'https://example.test/', $captured_ticket['body']['site_url'], 'Ticket must include the site URL.' );
assert_same( 'post', $captured_ticket['body']['surface'], 'Ticket must include sanitized editor surface context.' );
assert_same( 'page', $captured_ticket['body']['post_type'], 'Ticket must include sanitized post type context.' );
assert_same( 'anima//home', $captured_ticket['body']['template_id'], 'Ticket must include sanitized template context.' );
assert_same( '55', $captured_ticket['body']['article_id'], 'Ticket must include sanitized article context.' );
assert_true( ! array_key_exists( 'oauth_token', $captured_ticket['body'] ), 'Ticket body must never include oauth_token.' );
assert_true( ! array_key_exists( 'oauth_token_secret', $captured_ticket['body'] ), 'Ticket body must never include oauth_token_secret.' );

$captured_ticket = array();
$too_long        = pixassist_submit_docs_ticket(
	array(
		'subject' => str_repeat( 'A', pixassist_docs_ticket_subject_max_length() + 1 ),
		'details' => 'The useful details are here.',
	)
);
assert_same( 'invalid', $too_long['code'], 'Ticket subjects over the limit must be rejected before HTTP.' );
assert_same( array(), $captured_ticket, 'Too-long ticket subjects must not be signed or sent.' );

$GLOBALS['paf_denied_caps']['edit_theme_options'] = true;
$denied = pixassist_submit_docs_ticket( array( 'subject' => 'Need help', 'details' => 'Details.' ) );
assert_same( 'denied', $denied['code'], 'Users without the docs capability must be denied.' );

echo "Admin docs surface OK\n";
