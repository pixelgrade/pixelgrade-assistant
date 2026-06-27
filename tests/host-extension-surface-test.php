<?php
/**
 * Pins the host extension surface Assistant exposes for companion plugins (Pixelgrade Plus).
 *
 * This is the PROVIDER side of the now-bidirectional Plus <-> Assistant contract (0.9.0):
 *   - pixassist_get_admin_hub_tabs(): collects + normalizes hub tab descriptors registered
 *     through the `pixelgrade/admin_hub/tabs` PHP filter (dedupe by id, capability-gate, group/sort,
 *     link-vs-component), tolerant of malformed input.
 *   - pixassist_get_account() / pixassist_is_account_connected(): host-owned account READ
 *     accessors returning EXACTLY the documented identity keys — never tokens/secrets, even if a
 *     filter tries to inject them.
 *
 * Canonical contract + change protocol (edit BOTH repos in lockstep):
 *   ../pixelgrade-plus/docs/architecture/plus-assistant-contract.md
 * Consumer (Plus) side + its pin test land in pixelgrade-plus#56.
 *
 * Standalone: run with `php tests/host-extension-surface-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']     = array();
$GLOBALS['paf_denied_caps'] = array();

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

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function sanitize_text_field( $value ) {
	if ( ! is_scalar( $value ) ) {
		return '';
	}

	return trim( preg_replace( '/[\r\n\t ]+/', ' ', strip_tags( (string) $value ) ) );
}

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function paf_reset() {
	$GLOBALS['paf_filters']     = array();
	$GLOBALS['paf_denied_caps'] = array();
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

require __DIR__ . '/../includes/host-extension-surface.php';

/* ============================ Hub tab registry ============================ */

/*
 * Default: no tab is registered -> empty list (the seam exists before any consumer wires in).
 */
paf_reset();
assert_same( array(), pixassist_get_admin_hub_tabs(), 'With no filter, the hub tab registry must be empty.' );

/*
 * A malformed (non-array) filter return must not break the host.
 */
paf_reset();
add_filter(
	'pixelgrade/admin_hub/tabs',
	function () {
		return 'not-an-array';
	}
);
assert_same( array(), pixassist_get_admin_hub_tabs(), 'A non-array filter return must yield an empty list.' );

/*
 * Normalization: dedupe by id, drop malformed/id-less entries, capability-gate, normalize group,
 * sort by group then order then label, and treat a non-empty url as a link tab (component cleared).
 */
paf_reset();
$GLOBALS['paf_denied_caps']['manage_network'] = true;
add_filter(
	'pixelgrade/admin_hub/tabs',
	function () {
		return array(
			array( 'id' => 'starter', 'label' => 'Starter Sites', 'component' => 'starterSites', 'gate' => 'plus_licensed', 'order' => 30 ),
			array( 'id' => 'overview', 'label' => 'Overview', 'component' => 'overview', 'badge' => '<strong>PLUS</strong>', 'badgeTone' => 'plus-active', 'order' => 10 ),
			array( 'id' => 'help', 'label' => 'Help', 'component' => 'ignored', 'url' => 'https://example.test/help', 'order' => 20 ),
			array( 'id' => 'tools', 'label' => 'Tools', 'component' => 'tools', 'group' => 'secondary', 'order' => 1 ),
			array( 'id' => 'bad-group', 'label' => 'Bad Group', 'component' => 'badGroup', 'group' => 'tertiary', 'badgeTone' => 'neon', 'order' => 25 ),
			array( 'id' => 'overview', 'label' => 'Duplicate', 'component' => 'dupe', 'order' => 99 ), // dup id -> dropped
			array( 'label' => 'No id here', 'component' => 'x' ), // no id -> dropped
			'not-an-array', // -> dropped
			array( 'id' => 'admin-only', 'label' => 'Admin Only', 'component' => 'secret', 'capability' => 'manage_network' ), // denied -> dropped
		);
	}
);

$tabs = pixassist_get_admin_hub_tabs();
$ids  = array_map(
	function ( $tab ) {
		return $tab['id'];
	},
	$tabs
);

assert_same( array( 'overview', 'help', 'bad-group', 'starter', 'tools' ), $ids, 'Tabs must be deduped, capability-gated, and sorted by group then order.' );

$expected_keys = array( 'badge', 'badgeTone', 'capability', 'component', 'gate', 'group', 'icon', 'id', 'label', 'order', 'url' );
foreach ( $tabs as $tab ) {
	$keys = array_keys( $tab );
	sort( $keys );
	assert_same( $expected_keys, $keys, 'Each normalized tab must expose exactly the documented descriptor keys.' );
}

$by_id = array();
foreach ( $tabs as $tab ) {
	$by_id[ $tab['id'] ] = $tab;
}

assert_same( 'manage_options', $by_id['overview']['capability'], 'Missing capability must default to manage_options.' );
assert_same( 'PLUS', $by_id['overview']['badge'], 'Tab badges must be sanitized display text.' );
assert_same( 'plus-active', $by_id['overview']['badgeTone'], 'Recognized tab badge tones must pass through.' );
assert_same( 'primary', $by_id['overview']['group'], 'Missing group must default to primary.' );
assert_same( '', $by_id['overview']['url'], 'A component tab must have an empty url.' );
assert_same( 'overview', $by_id['overview']['component'], 'A component tab must keep its component key.' );
assert_same( 'https://example.test/help', $by_id['help']['url'], 'A link tab must keep its url.' );
assert_same( '', $by_id['help']['component'], 'A link tab (non-empty url) must clear its component.' );
assert_same( 'plus_licensed', $by_id['starter']['gate'], 'A tab gate must pass through (sanitized).' );
assert_same( 'primary', $by_id['bad-group']['group'], 'An unsupported group must fall back to primary.' );
assert_same( '', $by_id['bad-group']['badgeTone'], 'Unsupported badge tones must be dropped.' );
assert_same( 'secondary', $by_id['tools']['group'], 'A secondary tab group must pass through.' );

$tab_bar_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/TabBar.js' );
assert_true( false !== strpos( $tab_bar_js, 'pixelgrade-admin-hub__tab-badge--' ), 'TabBar must expose badge tone classes for visual styling.' );
assert_true( false !== strpos( $tab_bar_js, 'plus-active' ), 'TabBar must render an active Plus badge tone.' );
assert_true( false !== strpos( $tab_bar_js, 'Pixelgrade purple' ), 'TabBar must reserve Pixelgrade purple for active Plus badges.' );

/* ============================ Host account accessors ============================ */

/*
 * Default: no connection (no filter, no legacy Admin class present) -> disconnected, EXACTLY the
 * eight documented identity keys.
 */
paf_reset();
$account            = pixassist_get_account();
$account_keys       = array_keys( $account );
sort( $account_keys );
$expected_acct_keys = array( 'avatar_url', 'connected_at', 'display_name', 'email', 'is_connected', 'pixelgrade_user_id', 'user_login', 'wp_user_id' );

assert_same( $expected_acct_keys, $account_keys, 'pixassist_get_account() must return EXACTLY the eight identity keys.' );
assert_same( false, $account['is_connected'], 'With no connection, is_connected must be false.' );
assert_same( 0, $account['pixelgrade_user_id'], 'Disconnected pixelgrade_user_id must be int 0.' );
assert_same( 0, $account['wp_user_id'], 'Disconnected wp_user_id must be int 0.' );
assert_same( '', $account['email'], 'Disconnected email must be an empty string.' );
assert_same( false, pixassist_is_account_connected(), 'pixassist_is_account_connected() must be false when disconnected.' );

/*
 * A connected account surfaces through the `pixassist_account` filter — and a filter that tries to
 * leak token-like keys must NOT widen the contract (security pin).
 */
paf_reset();
add_filter(
	'pixassist_account',
	function ( $account ) {
		return array_merge(
			$account,
			array(
				'is_connected'        => true,
				'email'               => 'jane@example.test',
				'display_name'        => 'Jane Designer',
				'user_login'          => 'jane',
				'pixelgrade_user_id'  => '4242', // string on purpose -> must coerce to int
				'avatar_url'          => 'https://example.test/avatar.png',
				'wp_user_id'          => 7,
				'connected_at'        => '2026-06-16T00:00:00Z',
				'oauth_token'         => 'SECRET-TOKEN',  // must be stripped
				'oauth_token_secret'  => 'SECRET-SECRET', // must be stripped
			)
		);
	}
);

$account      = pixassist_get_account();
$account_keys = array_keys( $account );
sort( $account_keys );

assert_same( $expected_acct_keys, $account_keys, 'A filter must not add keys beyond the eight identity keys (no token leak).' );
assert_true( ! array_key_exists( 'oauth_token', $account ), 'oauth_token must never surface in the account payload.' );
assert_true( ! array_key_exists( 'oauth_token_secret', $account ), 'oauth_token_secret must never surface in the account payload.' );
assert_same( true, $account['is_connected'], 'A connected account must report is_connected true.' );
assert_same( 'jane@example.test', $account['email'], 'The connected email must surface.' );
assert_same( 4242, $account['pixelgrade_user_id'], 'pixelgrade_user_id must be coerced to int.' );
assert_same( 7, $account['wp_user_id'], 'wp_user_id must surface as int.' );
assert_same( true, pixassist_is_account_connected(), 'pixassist_is_account_connected() must be true when connected.' );

/*
 * A malformed (non-array) `pixassist_account` filter return falls back to disconnected defaults.
 */
paf_reset();
add_filter(
	'pixassist_account',
	function () {
		return 'not-an-array';
	}
);

$account = pixassist_get_account();
assert_same( false, $account['is_connected'], 'A malformed account filter return must fall back to disconnected.' );
$account_keys = array_keys( $account );
sort( $account_keys );
assert_same( $expected_acct_keys, $account_keys, 'A malformed account filter return must still yield exactly the eight keys.' );

echo "Host extension surface OK\n";
