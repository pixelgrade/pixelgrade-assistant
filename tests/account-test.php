<?php
/**
 * Pins the host-owned pixelgrade.com account connection (#45).
 *
 * Standalone: run with `php tests/account-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.test/' );
define( 'PIXELGRADE_ASSISTANT__SHOP_BASE', 'https://pixelgrade.test/' );

$GLOBALS['paf_filters']      = array();
$GLOBALS['paf_options']      = array();
$GLOBALS['paf_user_meta']    = array();
$GLOBALS['paf_transients']   = array();
$GLOBALS['paf_denied_caps']  = array();
$GLOBALS['paf_current_user'] = 7;
$GLOBALS['paf_theme_name']   = 'Anima LT';
$GLOBALS['paf_product_sku']  = 'anima-lt';

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	$args = func_get_args();
	array_shift( $args );

	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		$value   = call_user_func_array( $callback, $args );
		$args[0] = $value;
	}

	return $value;
}

function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, is_array( $args ) ? $args : array() );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
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

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function get_current_user_id() {
	return (int) $GLOBALS['paf_current_user'];
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
}

function get_site_option( $key, $default = false ) {
	return $default;
}

function is_multisite() {
	return false;
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

function set_site_transient( $key, $value, $expiration = 0 ) {
	$GLOBALS['paf_transients'][ $key ] = $value;

	return true;
}

function get_site_transient( $key ) {
	return array_key_exists( $key, $GLOBALS['paf_transients'] ) ? $GLOBALS['paf_transients'][ $key ] : false;
}

function delete_site_transient( $key ) {
	unset( $GLOBALS['paf_transients'][ $key ] );

	return true;
}

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function home_url( $path = '' ) {
	return 'https://example.test/' . ltrim( (string) $path, '/' );
}

function add_query_arg( $args, $url = '' ) {
	$separator = ( false === strpos( $url, '?' ) ) ? '?' : '&';
	$pairs     = array();

	foreach ( (array) $args as $key => $value ) {
		$pairs[] = rawurlencode( (string) $key ) . '=' . rawurlencode( (string) $value );
	}

	return $url . $separator . implode( '&', $pairs );
}

function wp_create_nonce( $action ) {
	return 'nonce-' . $action;
}

function wp_verify_nonce( $nonce, $action ) {
	return 'nonce-' . $action === $nonce;
}

function wp_nonce_url( $url, $action = '', $name = '_wpnonce' ) {
	return add_query_arg( array( $name => 'nonce-' . $action ), $url );
}

function wp_unslash( $value ) {
	return $value;
}

function current_time( $type, $gmt = false ) {
	return '2026-06-16 10:00:00';
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/' ) . '/';
}

function __( $text, $domain = 'default' ) {
	return $text;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function paf_reset_runtime() {
	$GLOBALS['paf_filters']      = array();
	$GLOBALS['paf_options']      = array();
	$GLOBALS['paf_user_meta']    = array();
	$GLOBALS['paf_transients']   = array();
	$GLOBALS['paf_denied_caps']  = array();
	$GLOBALS['paf_current_user'] = 7;

	if ( function_exists( 'pixassist_filter_modern_account_identity' ) ) {
		add_filter( 'pixassist_account', 'pixassist_filter_modern_account_identity' );
	}
	if ( function_exists( 'pixassist_register_account_tab' ) ) {
		add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_account_tab' );
	}
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
	public static function get_original_theme_name() {
		return $GLOBALS['paf_theme_name'];
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

class PixelgradeAssistant_Help {
	public static function get_kb_product_sku() {
		return $GLOBALS['paf_product_sku'];
	}
}

require __DIR__ . '/../includes/capabilities.php';
require __DIR__ . '/../includes/host-extension-surface.php';
require __DIR__ . '/../includes/account.php';

/*
 * Default state: no connection, no PHP credentials.
 */
paf_reset_runtime();
$account = pixassist_get_account();
assert_same( false, $account['is_connected'], 'Default account must be disconnected.' );
assert_same( null, pixassist_get_account_credentials(), 'Disconnected account must not expose credentials.' );

/*
 * Modern storage feeds the existing identity accessor, while credentials stay out of identity and
 * are available only through pixassist_get_account_credentials().
 */
paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => '42',
		'email'               => 'customer@example.com',
		'display_name'        => 'Customer',
		'user_login'          => 'customer-login',
		'avatar_url'          => 'https://example.test/avatar.png',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);

$account = pixassist_get_account();
assert_same( true, $account['is_connected'], 'A saved modern connection must report connected.' );
assert_same( 'customer@example.com', $account['email'], 'Modern storage must feed the identity email.' );
assert_same( 'customer-login', $account['user_login'], 'Modern storage must feed the identity login.' );
assert_same( 42, $account['pixelgrade_user_id'], 'Modern storage must coerce the Pixelgrade user id.' );
assert_same( 7, $account['wp_user_id'], 'Modern storage must remember the local WP user id.' );
assert_true( ! array_key_exists( 'oauth_token', $account ), 'Identity must never include oauth_token.' );
assert_true( ! array_key_exists( 'oauth_token_secret', $account ), 'Identity must never include oauth_token_secret.' );
assert_same(
	array( 'token' => 'acc-token', 'token_secret' => 'acc-secret' ),
	pixassist_get_account_credentials(),
	'Credentials accessor must expose only token/token_secret.'
);
assert_same( 'acc-token', get_user_meta( 7, 'pixassist_oauth_token', true ), 'Saving must keep legacy token meta in sync as a compatibility shim.' );
assert_same( 'customer-login', get_user_meta( 7, 'pixelgrade_user_login', true ), 'Saving must keep legacy login meta in sync as a compatibility shim.' );

pixassist_delete_account_connection();
$account = pixassist_get_account();
assert_same( false, $account['is_connected'], 'Deleting the account must disconnect identity.' );
assert_same( null, pixassist_get_account_credentials(), 'Deleting the account must clear PHP credentials.' );
assert_same( '', get_user_meta( 7, 'pixassist_oauth_token', true ), 'Deleting must remove legacy token meta.' );
assert_same( '', get_user_meta( 7, 'pixelgrade_user_login', true ), 'Deleting must remove legacy login meta.' );

/*
 * Legacy installs still read through the stable accessors until they reconnect through the modern
 * host flow.
 */
paf_reset_runtime();
update_user_meta( 11, 'pixassist_oauth_token', 'legacy-token' );
update_user_meta( 11, 'pixassist_oauth_token_secret', 'legacy-secret' );
update_user_meta( 11, 'pixassist_user_ID', '99' );
update_user_meta( 11, 'pixelgrade_user_login', 'legacy-login' );
update_user_meta( 11, 'pixelgrade_user_email', 'legacy@example.com' );
update_user_meta( 11, 'pixelgrade_display_name', 'Legacy User' );

$account = pixassist_get_account();
assert_same( true, $account['is_connected'], 'Legacy account meta must still read as connected.' );
assert_same( 'legacy-login', $account['user_login'], 'Legacy login must feed identity.' );
assert_same( 99, $account['pixelgrade_user_id'], 'Legacy pixelgrade id must feed identity.' );
assert_same(
	array( 'token' => 'legacy-token', 'token_secret' => 'legacy-secret' ),
	pixassist_get_account_credentials(),
	'Legacy token meta must feed the PHP-only credentials accessor.'
);

/*
 * Pixelgrade Care coexistence: when Care owns a user's pixelgrade.com identity (its own
 * `pixcare_oauth_token` is present), Assistant must NOT claim that shared global identity as its own
 * connection, expose its credentials, or overwrite/delete the shared identity meta. The meta is
 * global on multisite, so trampling it would corrupt Care's connection on the Care sites.
 */
paf_reset_runtime();
// Care owns both the theme-activation user (11) and the current admin (7) — a multisite-shared admin.
update_user_meta( 11, 'pixcare_oauth_token', 'care-token' );
update_user_meta( 11, 'pixelgrade_user_login', 'care-login' );
update_user_meta( 11, 'pixelgrade_user_email', 'care@example.com' );
update_user_meta( 7, 'pixcare_oauth_token', 'care-token' );
update_user_meta( 7, 'pixelgrade_user_login', 'care-login' );

$account = pixassist_get_account();
assert_same( false, $account['is_connected'], 'Care-owned shared identity must not read as an Assistant connection.' );
assert_same( null, pixassist_get_account_credentials(), 'Care-owned identity must not expose Assistant credentials.' );

// A modern Assistant connect (current user 7) succeeds via per-site storage, leaving Care's shared meta intact.
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id' => '77',
		'email'              => 'plus@example.com',
		'display_name'       => 'Plus Account',
		'user_login'         => 'plus-login',
		'oauth_token'        => 'plus-token',
		'oauth_token_secret' => 'plus-secret',
	)
);
$account = pixassist_get_account();
assert_same( true, $account['is_connected'], 'Modern per-site connection still reports connected over Care-owned legacy meta.' );
assert_same( 'plus-login', $account['user_login'], 'Modern per-site identity wins.' );
assert_same( 'plus-token', pixassist_get_account_credentials()['token'], 'Modern per-site credentials are available for Plus.' );
assert_same( 'plus-token', get_user_meta( 7, 'pixassist_oauth_token', true ), 'Assistant token meta is still mirrored to the connecting user.' );
assert_same( 'care-login', get_user_meta( 7, 'pixelgrade_user_login', true ), 'Care-owned shared login must be preserved, not overwritten by connect.' );

// Disconnect clears Assistant's own state but must never delete Care's shared identity.
pixassist_delete_account_connection();
assert_same( '', get_user_meta( 7, 'pixassist_oauth_token', true ), 'Disconnect clears Assistant token meta.' );
assert_same( 'care-login', get_user_meta( 7, 'pixelgrade_user_login', true ), 'Disconnect must NOT delete Care-owned shared login (current user).' );
assert_same( 'care-login', get_user_meta( 11, 'pixelgrade_user_login', true ), 'Disconnect must NOT delete Care-owned shared login (activation user).' );

/*
 * OAuth client: request-token, authorize URL, and access-token exchange remain independently
 * testable through the Assistant-specific pre-response seam.
 */
paf_reset_runtime();
$GLOBALS['paf_oauth_legs'] = array();
add_filter(
	'pixassist_account_oauth_config',
	function () {
		return array(
			'base_url'        => 'https://pixelgrade.test/',
			'consumer_key'    => 'consumer-key',
			'consumer_secret' => 'consumer-secret',
			'source'          => 'pixelgrade-assistant',
		);
	}
);
add_filter(
	'pre_pixassist_account_oauth1_response',
	function ( $response, $leg, $params ) {
		$GLOBALS['paf_oauth_legs'][ $leg ] = $params;

		if ( 'request' === $leg ) {
			return array(
				'oauth_token'        => 'req-token',
				'oauth_token_secret' => 'req-secret',
			);
		}

		if ( 'access' === $leg ) {
			return array(
				'oauth_token'        => 'acc-token',
				'oauth_token_secret' => 'acc-secret',
				'user_ID'            => '123',
				'user_email'         => 'oauth@example.com',
				'display_name'       => 'OAuth User',
				'user_login'         => 'oauth-login',
			);
		}

		return $response;
	},
	10,
	3
);

$request_token = pixassist_account_oauth_request_token( 'https://example.test/callback' );
assert_same( 'req-token', $request_token['oauth_token'], 'Request token must be returned.' );
assert_same( 'https://example.test/callback', $GLOBALS['paf_oauth_legs']['request']['oauth_callback'], 'Request leg must carry the callback.' );
assert_same( 'consumer-key', $GLOBALS['paf_oauth_legs']['request']['oauth_consumer_key'], 'Request leg must carry the consumer key.' );

$authorize_url = pixassist_account_oauth_authorize_url( 'req-token', 'req-secret', array( 'pixassist_state' => 'nonce-1' ) );
assert_true( false !== strpos( $authorize_url, 'oauth1/authorize' ), 'Authorize URL must target the authorize endpoint.' );
assert_true( false !== strpos( $authorize_url, 'oauth_token=req-token' ), 'Authorize URL must include the request token.' );
assert_true( false !== strpos( $authorize_url, 'source=pixelgrade-assistant' ), 'Authorize URL must identify the Assistant host source.' );
assert_true( false !== strpos( $authorize_url, 'pixassist_state=nonce-1' ), 'Authorize URL must preserve state.' );

$access = pixassist_account_oauth_access_token( 'req-token', 'req-secret', 'verifier' );
assert_same( 'acc-token', $access['oauth_token'], 'Access token must be returned.' );
assert_same( 'acc-secret', $access['oauth_token_secret'], 'Access secret must be returned.' );
assert_same( 123, $access['pixelgrade_user_id'], 'Access exchange must extract the Pixelgrade user id.' );
assert_same( 'oauth-login', $access['user_login'], 'Access exchange must extract the user login.' );
assert_same( 'verifier', $GLOBALS['paf_oauth_legs']['access']['oauth_verifier'], 'Access leg must carry the verifier.' );

/*
 * Controller-level helpers enforce capability + nonce, store request-token secrets, and save the
 * final modern connection.
 */
paf_reset_runtime();
$GLOBALS['paf_oauth_legs'] = array();
add_filter(
	'pixassist_account_oauth_config',
	function () {
		return array(
			'base_url'        => 'https://pixelgrade.test/',
			'consumer_key'    => 'consumer-key',
			'consumer_secret' => 'consumer-secret',
			'source'          => 'pixelgrade-assistant',
		);
	}
);
add_filter(
	'pre_pixassist_account_oauth1_response',
	function ( $response, $leg, $params ) {
		$GLOBALS['paf_oauth_legs'][ $leg ] = $params;

		if ( 'request' === $leg ) {
			return array(
				'oauth_token'        => 'req-token',
				'oauth_token_secret' => 'req-secret',
			);
		}

		return array(
			'oauth_token'        => 'acc-token',
			'oauth_token_secret' => 'acc-secret',
			'user_ID'            => '555',
			'user_email'         => 'roundtrip@example.com',
			'display_name'       => 'Round Trip',
			'user_login'         => 'roundtrip',
		);
	},
	10,
	3
);

$result = pixassist_account_initiate_connection( array( '_wpnonce' => 'nonce-pixassist_account_connect' ) );
assert_same( 'redirect', $result['status'], 'Valid initiation must return an OAuth redirect.' );
assert_true( false !== strpos( $result['redirect_url'], 'oauth1/authorize' ), 'Initiation redirect must point at authorize.' );
assert_same( 'req-secret', pixassist_account_get_request_token_secret( 'req-token' ), 'Initiation must store the request-token secret.' );

$result = pixassist_account_handle_callback(
	array(
		'pixassist_state' => 'nonce-pixassist_account_connect',
		'oauth_token'     => 'req-token',
		'oauth_verifier'  => 'verifier',
	)
);
assert_same( 'connected', $result['status'], 'Valid callback must connect the account.' );
assert_same( null, pixassist_account_get_request_token_secret( 'req-token' ), 'Callback must delete the request-token secret.' );
assert_same( true, pixassist_is_account_connected(), 'Callback must save a connected account.' );
assert_same( 'acc-token', pixassist_get_account_credentials()['token'], 'Callback must save access credentials.' );

$GLOBALS['paf_denied_caps']['manage_options'] = true;
$denied = pixassist_account_initiate_connection( array( '_wpnonce' => 'nonce-pixassist_account_connect' ) );
assert_same( 'denied', $denied['status'], 'Users without manage_options must be denied.' );

/*
 * Account tab registration and payload: logic, action URLs, notices, and copy stay in PHP.
 */
paf_reset_runtime();
$registered = pixassist_register_account_tab( array() );
assert_same( 1, count( $registered ), 'Account registration must append exactly one tab.' );
assert_same( 'account', $registered[0]['id'], 'Account tab id must be `account`.' );
assert_same( 'Account', $registered[0]['label'], 'Account tab label must be `Account`.' );
assert_same( 'manage_options', $registered[0]['capability'], 'Account tab must require manage_options.' );
assert_same( 'account', $registered[0]['component'], 'Account tab must bind the `account` JS component.' );
assert_same( '', $registered[0]['gate'], 'Account tab is free — no upsell gate.' );
assert_same( '', $registered[0]['badge'], 'Assistant must leave the Account badge empty unless Plus annotates it.' );
assert_same( 10, $registered[0]['order'], 'Account tab must sort after Overview.' );

$_GET['pixassist_account'] = 'connected';
$payload                   = pixassist_get_account_data();
$payload_keys              = array_keys( $payload );
sort( $payload_keys );
assert_same( array( 'account', 'accountValue', 'actions', 'copy', 'notice', 'oauth', 'plusJourney' ), $payload_keys, 'Account payload must expose exactly account/accountValue/actions/copy/notice/oauth/plusJourney.' );
assert_true( false !== strpos( $payload['actions']['connectUrl'], 'admin-post.php' ), 'Connect URL must target admin-post.php.' );
assert_true( false !== strpos( $payload['actions']['connectUrl'], 'action=pixassist_account_connect_init' ), 'Connect URL must carry the connect action.' );
assert_same( 'pixassist_account_disconnect', $payload['actions']['disconnectAction'], 'Disconnect action must be explicit.' );
assert_same( 'nonce-pixassist_account_connect', $payload['actions']['disconnectNonce'], 'Disconnect payload must carry a nonce.' );
assert_same( 'connected', $payload['notice']['status'], 'Notice status must come from the URL status.' );
assert_same( 'success', $payload['notice']['type'], 'Connected notice must be success.' );
assert_same( true, $payload['oauth']['isConfigured'], 'The shipped build reports OAuth configured out of the box.' );
assert_same( 'Pixelgrade account', $payload['copy']['title'], 'Account tab copy must live in PHP.' );
assert_same( 'Disconnect account', $payload['copy']['disconnectLabel'], 'Disconnect copy should describe the quiet account-detail action.' );
assert_same( 'available', $payload['accountValue']['support']['state'], 'The free support lane (guides + diagnostics) is available without an account — the row must not nag for a connection.' );
assert_same( false, false !== strpos( $payload['accountValue']['support']['description'], 'Credits' ), 'The support row stays short and price-free — Credits are mentioned at the point of use (opening a ticket), not here.' );
assert_same( false, false !== strpos( (string) json_encode( $payload['accountValue']['support'] ), 'send support requests' ), 'The Care-era "connect to send support requests" claim stays retired.' );
assert_true( false !== strpos( $payload['copy']['disconnectedDescription'], 'work without an account' ), 'The disconnected hero must lead with the everything-works-without-an-account fact.' );
assert_true( false !== strpos( $payload['copy']['disconnectedDescription'], 'validate a Pixelgrade Plus license' ), 'The disconnected hero must name the real reasons to connect (license, Credits).' );
assert_true( false !== strpos( $payload['accountValue']['diagnostics']['url'], 'tab=system-status' ), 'The free panel must hand the user something real: the System Status diagnostics.' );
assert_true( false !== strpos( $payload['accountValue']['docs']['label'], 'editor toolbar' ), 'The docs row must explain the in-editor Design Docs access, not just the Help tab.' );
assert_same( 'Anima LT', $payload['accountValue']['site']['themeName'], 'Account value site context should expose the active theme name.' );
assert_same( 'anima-lt', $payload['accountValue']['site']['productSku'], 'Account value site context should expose the docs/support product SKU.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=help', $payload['accountValue']['site']['helpUrl'], 'Account value site context should deep-link to the Help tab.' );
assert_same( 'available', $payload['accountValue']['products']['state'], 'Free installs should still show a products/licenses summary.' );
assert_same( 'Anima LT', $payload['accountValue']['products']['label'], 'The products/licenses summary should start with the active Pixelgrade product.' );
assert_same( 'connect_account', $payload['accountValue']['nextAction']['id'], 'Disconnected users should get account connection as the next best action.' );
assert_same( $payload['actions']['connectUrl'], $payload['accountValue']['nextAction']['url'], 'Disconnected next action should reuse the safe connect URL.' );
assert_true( ! isset( $payload['accountValue']['enablements'] ), 'The duplicate enablement rows are retired in favor of the deduped Support/Documentation rows.' );
assert_true( false !== strpos( $payload['accountValue']['docs']['url'], 'docs' ), 'The docs payload keeps the public docs URL as a secret-free reference.' );
assert_same( 'Open Pixelgrade Design Docs', $payload['accountValue']['docs']['actionLabel'], 'The single docs action opens the persistent floating window, matching the editor button.' );
assert_same( 'invite', $payload['plusJourney']['state'], 'With no Plus signal at all, the journey collapses to a gentle invite, not a step ladder.' );
assert_same( 'Explore Pixelgrade Plus', $payload['plusJourney']['action']['label'], 'The Plus invite should hand off to Pixelgrade.com.' );
assert_true( false !== strpos( $payload['plusJourney']['hint'], 'Already purchased' ), 'A disconnected invite should hint that connecting reveals owned licenses.' );
assert_true( false !== strpos( $payload['plusJourney']['description'], 'deeper end of the design system' ), 'The Plus invite must use the settled Free & Plus positioning language.' );
$journey_json = (string) json_encode( $payload['plusJourney'] );
assert_same( false, false !== stripos( $journey_json, 'starter' ), 'Journey copy must not use the kill-listed "starter" vocabulary.' );
assert_same( false, false !== stripos( $journey_json, 'priority support' ), 'Journey copy must not promise priority support — Plus support is Credits-based assisted support.' );
assert_same( false, false !== stripos( $journey_json, 'design pack' ), 'Journey copy must not lead with internal component names.' );
assert_same( false, false !== strpos( (string) json_encode( $payload ), 'acc-secret' ), 'Account payload must not leak OAuth token secrets.' );
unset( $_GET['pixassist_account'] );

paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => 42,
		'email'               => 'customer@example.com',
		'display_name'        => 'Customer',
		'user_login'          => 'customer-login',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);
add_filter(
	'pre_pixassist_account_licenses_response',
	function ( $response, $request_data ) {
		assert_same( '42', $request_data['user_id'], 'The account-license lookup must scope requests to the connected Pixelgrade user.' );

		return array(
			'code' => 'success',
			'data' => array(
				'licenses' => array(
					array(
						'licenses' => array(
							array(
								'license_hash'        => 'secret-plus-license',
								'license_status_code' => 1,
								'license_status'      => 'active',
								'main_product_sku'    => 'pixelgrade-plus-studio',
								'pixelgrade_plus'     => array(
									'tier'      => 'studio',
									'setup_url' => 'https://pixelgrade.test/account/downloads/pixelgrade-plus/',
								),
							),
						),
					),
				),
			),
		);
	},
	10,
	2
);
$account_license = pixassist_get_account_license_summary();
assert_same( 'plus', $account_license['state'], 'A connected account with a Plus-family license should expose the Plus account-license state.' );
assert_same( true, $account_license['hasPlusLicense'], 'The account-license summary should expose only a safe Plus ownership boolean.' );
assert_same( 'pixelgrade-plus-studio', $account_license['productSku'], 'The account-license summary should preserve the safe concrete Plus tier SKU.' );
assert_same( 'https://pixelgrade.test/account/downloads/pixelgrade-plus/', $account_license['setupUrl'], 'The account-license summary should accept a server-provided setup hand-off URL.' );

$owned_plus_payload = pixassist_get_account_data();
assert_same( 'plus_plugin_missing', $owned_plus_payload['accountValue']['products']['state'], 'Account-owned Plus should be visible even when the Plus plugin is absent.' );
assert_same( 'Pixelgrade Plus', $owned_plus_payload['accountValue']['products']['plusLabel'], 'Account-owned Plus should expose the safe Plus product label.' );
assert_true( false !== strpos( $owned_plus_payload['accountValue']['products']['label'], 'Pixelgrade Plus' ), 'Account-owned Plus should appear in the products/licenses label.' );
assert_same( false, false !== strpos( $owned_plus_payload['accountValue']['products']['description'], 'Setup' ), 'Account-owned Plus copy should not use ambiguous Setup wording before Plus is installed.' );
assert_same( 'Download Pixelgrade Plus', $owned_plus_payload['accountValue']['products']['actionLabel'] ?? '', 'Account-owned Plus should get a download CTA while the plugin is missing.' );
assert_same( 'https://pixelgrade.test/account/downloads/pixelgrade-plus/', $owned_plus_payload['accountValue']['products']['url'], 'Missing Plus should hand off directly to the safe Pixelgrade.com download/setup URL.' );
assert_same( 'get_help', $owned_plus_payload['accountValue']['nextAction']['id'], 'Account-owned Plus should not duplicate the Products CTA through the Support row next action.' );
assert_same( 'in_progress', $owned_plus_payload['plusJourney']['state'], 'Account-owned Plus with the plugin missing should show the guided setup journey.' );
assert_same( 'done', $owned_plus_payload['plusJourney']['steps'][0]['state'], 'The connect step must show done for a connected account.' );
assert_same( 'current', $owned_plus_payload['plusJourney']['steps'][1]['state'], 'Getting the plugin must be the single current step while Plus is missing.' );
assert_same( 'Download Pixelgrade Plus', $owned_plus_payload['plusJourney']['steps'][1]['action']['label'], 'The current get-plugin step should carry the download hand-off.' );
assert_same( 'https://pixelgrade.test/account/downloads/pixelgrade-plus/', $owned_plus_payload['plusJourney']['steps'][1]['action']['url'], 'The download hand-off must use the safe Pixelgrade.com URL.' );
assert_true( false !== strpos( $owned_plus_payload['plusJourney']['steps'][1]['hint']['url'], 'plugin-install.php?tab=upload' ), 'The get-plugin step should guide users to the wp-admin upload screen.' );
assert_same( null, $owned_plus_payload['plusJourney']['steps'][2]['action'], 'Only the current journey step may carry an action.' );
assert_same( 'upcoming', $owned_plus_payload['plusJourney']['steps'][3]['state'], 'License validation stays upcoming until the plugin is active.' );
assert_same( false, false !== strpos( (string) json_encode( $owned_plus_payload ), 'secret-plus-license' ), 'The account-license summary must not leak license hashes.' );
assert_same( false, false !== strpos( (string) json_encode( $owned_plus_payload ), 'acc-secret' ), 'The account-license summary must not leak OAuth secrets.' );

paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => 42,
		'email'               => 'customer@example.com',
		'user_login'          => 'customer-login',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);
add_filter(
	'pre_pixassist_account_licenses_response',
	function () {
		return array(
			'code' => 'success',
			'data' => array(
				'licenses' => array(
					array(
						'licenses' => array(
							array(
								'license_hash'        => 'secret-plus-license',
								'license_status_code' => 1,
								'main_product_sku'    => 'pixelgrade-plus-single',
								'pixelgrade_plus'     => array(
									'setup_url' => 'https://wupdates.com/dldcv/plugins/private-package',
								),
							),
						),
					),
				),
			),
		);
	}
);
$unsafe_setup_url_summary = pixassist_get_account_license_summary();
assert_same( 'https://pixelgrade.test/plus/', $unsafe_setup_url_summary['setupUrl'], 'Raw WUpdates/package URLs must be ignored in favor of the Pixelgrade.com hand-off.' );

paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => 42,
		'email'               => 'customer@example.com',
		'user_login'          => 'customer-login',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);
add_filter(
	'pixassist_is_plus_plugin_installed',
	function () {
		return true;
	}
);
add_filter(
	'pre_pixassist_account_licenses_response',
	function () {
		return array(
			'code' => 'success',
			'data' => array(
				'licenses' => array(
					array(
						'licenses' => array(
							array(
								'license_hash'        => 'secret-plus-license',
								'license_status_code' => 1,
								'main_product_sku'    => 'pixelgrade-plus-single',
								'pixelgrade_plus'     => array(
									'setup_url' => 'https://pixelgrade.test/account/downloads/pixelgrade-plus/',
								),
							),
						),
					),
				),
			),
		);
	}
);
$installed_plus_payload = pixassist_get_account_data();
assert_same( 'plus_plugin_inactive', $installed_plus_payload['accountValue']['products']['state'], 'Account-owned Plus should detect an installed but inactive Plus plugin.' );
assert_same( 'Installed', $installed_plus_payload['accountValue']['products']['statusLabel'], 'Installed inactive Plus should use a human-readable Installed status.' );
assert_same( 'Activate Pixelgrade Plus', $installed_plus_payload['accountValue']['products']['actionLabel'] ?? '', 'Installed inactive Plus should get a direct activation CTA.' );
assert_true( false !== strpos( $installed_plus_payload['accountValue']['products']['url'], 'action=activate' ), 'Installed inactive Plus should link to WordPress plugin activation.' );
assert_true( false !== strpos( $installed_plus_payload['accountValue']['products']['url'], 'plugin=pixelgrade-plus%2Fpixelgrade-plus.php' ), 'Installed inactive Plus activation URL should target the Plus plugin file.' );
assert_same( 'in_progress', $installed_plus_payload['plusJourney']['state'], 'Installed-but-inactive Plus should show the guided setup journey.' );
assert_same( 'done', $installed_plus_payload['plusJourney']['steps'][1]['state'], 'The get-plugin step must show done once the plugin is installed.' );
assert_same( 'current', $installed_plus_payload['plusJourney']['steps'][2]['state'], 'Plugin activation must be the single current step while Plus is installed but inactive.' );
assert_same( 'Activate Pixelgrade Plus', $installed_plus_payload['plusJourney']['steps'][2]['action']['label'], 'The activation step should carry the direct activate CTA.' );
assert_true( false !== strpos( $installed_plus_payload['plusJourney']['steps'][2]['action']['url'], 'action=activate' ), 'The activation step should link to WordPress plugin activation.' );

paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => 42,
		'email'               => 'customer@example.com',
		'user_login'          => 'customer-login',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);
add_filter(
	'pixelgrade_assistant_plus_status',
	function ( $status ) {
		return array_merge(
			$status,
			array(
				'is_plus_active'     => true,
				'is_plus_licensed'   => false,
				'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
				'plus_product_label' => 'Pixelgrade Plus',
			)
		);
	}
);
$plus_payload = pixassist_get_account_data();
assert_same( 'needs_license', $plus_payload['accountValue']['products']['state'], 'Installed but unlicensed Plus should be visible in the products/licenses summary.' );
assert_same( 'Pixelgrade Plus', $plus_payload['accountValue']['products']['plusLabel'], 'The products/licenses summary should expose the safe Plus product label.' );
assert_true( false !== strpos( $plus_payload['accountValue']['products']['label'], 'Pixelgrade Plus' ), 'The products/licenses summary should include Plus when it is active.' );
assert_true( false !== strpos( $plus_payload['accountValue']['products']['description'], 'automatically' ), 'Unlicensed Plus copy should explain that Plus checks the connected account automatically.' );
assert_true( false !== strpos( $plus_payload['accountValue']['products']['description'], 'check again' ), 'Unlicensed Plus copy should frame the panel action as a retry/check-again path.' );
assert_same( 'Check Plus license', $plus_payload['accountValue']['products']['actionLabel'] ?? '', 'Unlicensed Plus should get an explicit check-again CTA.' );
assert_same( false, false !== strpos( (string) json_encode( $plus_payload ), 'license_hash' ), 'The products/licenses summary must not expose license internals.' );
assert_same( 'in_progress', $plus_payload['plusJourney']['state'], 'Active-but-unlicensed Plus should show the guided setup journey.' );
assert_same( 'done', $plus_payload['plusJourney']['steps'][0]['state'], 'The connect step must show done for a connected account.' );
assert_same( 'done', $plus_payload['plusJourney']['steps'][2]['state'], 'The plugin-activation step must show done when Plus is active.' );
assert_same( 'current', $plus_payload['plusJourney']['steps'][3]['state'], 'The license check must be the single current step for active-but-unlicensed Plus.' );
assert_same( 'Open the Plus panel', $plus_payload['plusJourney']['steps'][3]['action']['label'], 'The license-check step must hand off to the on-page Plus panel as a retry path.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus', $plus_payload['plusJourney']['steps'][3]['action']['url'], 'The license-check hand-off must use the Plus-reported panel URL.' );
assert_same( '3 of 4 steps done', $plus_payload['plusJourney']['progressLabel'], 'The journey must report progress.' );

paf_reset_runtime();
add_filter(
	'pixelgrade_assistant_plus_status',
	function ( $status ) {
		return array_merge(
			$status,
			array(
				'is_plus_active'     => true,
				'is_plus_licensed'   => true,
				'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
				'plus_product_label' => 'Pixelgrade Plus',
			)
		);
	}
);
$licensed_plus_payload = pixassist_get_account_data();
assert_same( 'licensed', $licensed_plus_payload['accountValue']['products']['state'], 'Licensed Plus should be visible in the products/licenses summary.' );
assert_same( 'Licensed', $licensed_plus_payload['accountValue']['products']['statusLabel'], 'Licensed Plus should use a human-readable status label.' );
assert_true( false !== strpos( $licensed_plus_payload['accountValue']['products']['description'], 'benefits' ), 'Licensed Plus copy should point users at the benefits review in Plus.' );
assert_same( 'Review Plus benefits', $licensed_plus_payload['accountValue']['products']['actionLabel'] ?? '', 'Licensed Plus should get an explicit benefits-review CTA.' );
assert_same( 'complete', $licensed_plus_payload['plusJourney']['state'], 'Licensed Plus should collapse the journey to a quiet confirmation.' );
assert_same( array(), $licensed_plus_payload['plusJourney']['steps'], 'A complete journey carries no step ladder.' );
assert_same( null, $licensed_plus_payload['plusJourney']['action'], 'The complete journey carries no link — the Plus panel sits directly below, and no benefits list exists to review.' );

paf_reset_runtime();
pixassist_save_account_connection(
	array(
		'pixelgrade_user_id'  => 42,
		'email'               => 'customer@example.com',
		'display_name'        => 'Customer',
		'user_login'          => 'customer-login',
		'oauth_token'         => 'acc-token',
		'oauth_token_secret'  => 'acc-secret',
	)
);
$connected_payload = pixassist_get_account_data();
assert_same( 'available', $connected_payload['accountValue']['support']['state'], 'Connected users should see support access as available.' );
assert_same( 'Pixelgrade ID 42', $connected_payload['accountValue']['accountDetails']['label'], 'Connected users should keep support-facing account details out of the hero.' );
assert_true( false !== strpos( $connected_payload['accountValue']['accountDetails']['description'], '2026-06-16' ), 'Connected account details should use a date-only connected value.' );
assert_same( false, false !== strpos( $connected_payload['accountValue']['accountDetails']['description'], '10:00:00' ), 'Connected account details should not show the full timestamp.' );
assert_same( 'get_help', $connected_payload['accountValue']['nextAction']['id'], 'Connected users should get Help as the next best action.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=help', $connected_payload['accountValue']['nextAction']['url'], 'Connected next action should point to the Help tab.' );
assert_same( 'Site connected.', $connected_payload['copy']['connectedStatusLabel'], 'The connected hero must not claim everything is ready — the journey card owns progress.' );
assert_same( 'invite', $connected_payload['plusJourney']['state'], 'A connected free account gets the gentle Plus invite, not a step ladder.' );
assert_true( ! isset( $connected_payload['plusJourney']['hint'] ), 'A connected invite needs no already-purchased hint.' );
assert_same( false, false !== strpos( (string) json_encode( $connected_payload ), 'acc-token' ), 'Connected Account payload must not expose OAuth tokens.' );

$account_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Account.js' );
assert_true( false !== strpos( $account_js, 'pixelgrade.adminHub.accountPanels' ), 'The Account tab must expose a JS filter for contributed account panels.' );
assert_true( false !== strpos( $account_js, 'renderAccountPanels' ), 'The Account tab must render contributed panels after the host account card.' );
assert_true( false !== strpos( $account_js, 'pixelgrade-account-panel--' ), 'The Account tab must give contributed panels stable section anchors.' );
assert_true( false !== strpos( $account_js, 'scrollIntoView' ), 'The Account tab must scroll linked sections such as section=plus into view.' );
assert_true( false !== strpos( $account_js, "params.get( 'tab' )" ), 'The Account tab must inspect legacy tab routes before router canonicalization.' );
assert_true( false !== strpos( $account_js, 'account-license' ), 'The Account tab must treat legacy account-license routes as the Plus section.' );
assert_true( false !== strpos( $account_js, 'pixelgrade-account-value' ), 'The Account tab must render the value cockpit shell.' );
assert_true( false !== strpos( $account_js, 'renderAccountValuePanel' ), 'The Account tab must condense value into one operations panel.' );
assert_true( false !== strpos( $account_js, 'pixelgrade-account-value--operations' ), 'The Account value panel must use the dense operations layout class.' );
assert_true( false !== strpos( $account_js, 'renderStatusText' ), 'The Account tab must render minimal dot-and-label status text.' );
assert_true( false !== strpos( $account_js, 'renderPlusJourney' ), 'The Account tab must render the guided Plus setup journey.' );
assert_true( false !== strpos( $account_js, 'journeyLeads' ), 'When the journey is in progress, it must lead — the disconnected hero is suppressed so the page has ONE connect call.' );
assert_true( false !== strpos( $account_js, 'useColumns' ), 'The two-column grid must be conditional — a connected free account collapses to one calm column.' );
assert_true( false !== strpos( $account_js, 'renderIdentityBand' ), 'Single-column connected mode must render the compact identity band, not the sidebar card.' );
assert_true( false !== strpos( $account_js, 'openDocsBrowse' ), 'The docs action must open the persistent floating window in place when it is mounted.' );
assert_true( false !== strpos( $account_js, 'pixassist_open_docs' ), 'The docs action must fall back to the admin-bar opt-in param when no window is mounted.' );
assert_true( false !== strpos( $account_js, 'pixelgrade-plus-journey__step' ), 'The journey must render steps with stable class hooks.' );
assert_same( false, false !== strpos( $account_js, 'Products & licenses' ), 'The old products/licenses row is retired — the journey card owns the Plus story.' );
assert_true( false !== strpos( $account_js, 'renderAccountDetailsRow' ), 'The Account tab must render account details through a dedicated row.' );
assert_true( false !== strpos( $account_js, "copy.disconnectLabel, 'link'" ), 'The Account disconnect action should be visually demoted to a link-style control.' );
assert_same( false, false !== strpos( $account_js, 'action: renderNextAction( value.nextAction )' ), 'The Account Support row must not render a generic support/next-action button.' );

/*
 * OAuth consumer resolution: the consumer key + secret resolve together, as a pair. The shipped build
 * ships the `pkDQYLDpG7ji` default with a working secret, so a stock install is configured out of the
 * box — free connect + support without Pixelgrade Plus. The secret can be overridden for staging /
 * rotation via PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET; complete Plus constants act as an optional
 * back-compat override; explicit Assistant key+secret constants win over Plus.
 *
 * Constants are progressively defined (they cannot be undefined mid-process), so the cases run in
 * priority order: shipped default -> Assistant-secret override -> Plus pair override -> Assistant pair.
 */
paf_reset_runtime();

$cfg = pixassist_account_oauth_config();
assert_same( 'pkDQYLDpG7ji', $cfg['consumer_key'], 'The default consumer key must be the shipped Assistant key.' );
assert_true( '' !== $cfg['consumer_secret'], 'The shipped build ships a working consumer secret for the default key.' );
assert_same( true, pixassist_account_oauth_is_configured(), 'The shipped build is configured out of the box (free connect + support).' );

define( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET', 'assistant-secret' );
$cfg = pixassist_account_oauth_config();
assert_same( 'pkDQYLDpG7ji', $cfg['consumer_key'], 'The Assistant secret pairs with the shipped default key.' );
assert_same( 'assistant-secret', $cfg['consumer_secret'], 'The Assistant secret constant must supply the default pair secret.' );
assert_same( true, pixassist_account_oauth_is_configured(), 'A present secret must mark the connection configured.' );

define( 'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_KEY', 'plus-key' );
define( 'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_SECRET', 'plus-secret' );
$cfg = pixassist_account_oauth_config();
assert_same( 'plus-key', $cfg['consumer_key'], 'A complete Plus pair overrides the hardcoded default.' );
assert_same( 'plus-secret', $cfg['consumer_secret'], 'A complete Plus pair supplies its own secret.' );

define( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_KEY', 'assistant-key' );
$cfg = pixassist_account_oauth_config();
assert_same( 'assistant-key', $cfg['consumer_key'], 'Explicit Assistant constants outrank Plus constants.' );
assert_same( 'assistant-secret', $cfg['consumer_secret'], 'The Assistant secret pairs with the Assistant key.' );

echo "Account connection OK\n";
