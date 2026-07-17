<?php
/**
 * Pins the anti-stampede behavior of PixelgradeAssistant_Admin::get_remote_config().
 *
 * Production sites were observed hammering the PXM get_config endpoint (hundreds of requests per
 * second in bursts, thousands per day from otherwise idle installs). Two failure modes feed that:
 * concurrent requests all missing the 6h transient at once (stampede), and installs whose
 * transients never persist (broken object-cache drop-ins) re-fetching on every request.
 *
 * The guarded design pinned here:
 * - a fresh 6h transient short-circuits everything;
 * - a 7-day stale transient answers callers that are not allowed to fetch;
 * - a 5-minute failure transient throttles retries against a failing/invalid endpoint;
 * - a per-theme lock stored as a NON-AUTOLOADED OPTION gates the actual remote call. The lock is
 *   NOT released after a fetch attempt — it expires on its own (1 minute), so it doubles as a hard
 *   floor of at most one remote attempt per minute per theme even where transients never persist;
 * - clear_remote_config_cache() clears all four states (fresh, stale, failure, lock);
 * - $skip_cache (what PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE maps onto) bypasses cache and lock.
 *
 * Standalone: run with `php tests/remote-config-cache-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'DAY_IN_SECONDS', 86400 );
define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.com/' );

$GLOBALS['paf_transients']        = array();
$GLOBALS['paf_transients_broken'] = false;
$GLOBALS['paf_options']           = array();
$GLOBALS['paf_option_autoload']   = array();
$GLOBALS['paf_remote_calls']      = array();
$GLOBALS['paf_remote_response']   = null;

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
	if ( 'wupdates_gather_ids' === $hook ) {
		return array(
			'hive-lite' => array(
				'id'   => 'PMAGv',
				'type' => 'theme_wporg',
				'slug' => 'hive-lite',
				'name' => 'Hive Lite',
			),
		);
	}

	return $value;
}

function add_filter() {
	return true;
}

function add_action() {
	return true;
}

function get_template() {
	return 'hive-lite';
}

function get_template_directory() {
	return '/themes/hive-lite';
}

function get_theme_support( $feature ) {
	return false;
}

if ( ! class_exists( 'WP_Theme' ) ) {
	class WP_Theme {
		public function get( $key ) {
			return 'Name' === $key ? 'Hive Lite' : '';
		}
	}
}

function wp_get_theme( $stylesheet = '' ) {
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

// Transients honor the "broken persistence" flag so we can simulate installs where set_transient
// never sticks (broken object-cache drop-ins) — the serial-hammering sites from the incident.
function get_transient( $key ) {
	return isset( $GLOBALS['paf_transients'][ $key ] ) ? $GLOBALS['paf_transients'][ $key ] : false;
}

function set_transient( $key, $value, $ttl = 0 ) {
	if ( $GLOBALS['paf_transients_broken'] ) {
		return false;
	}
	$GLOBALS['paf_transients'][ $key ] = $value;

	return true;
}

function delete_transient( $key ) {
	$existed = isset( $GLOBALS['paf_transients'][ $key ] );
	unset( $GLOBALS['paf_transients'][ $key ] );

	return $existed;
}

// Options always persist (they live in wp_options, not the transient/object-cache layer).
// add_option mirrors WordPress first-wins semantics: it refuses to overwrite an existing option.
function get_option( $key, $default = false ) {
	return isset( $GLOBALS['paf_options'][ $key ] ) ? $GLOBALS['paf_options'][ $key ] : $default;
}

function add_option( $key, $value, $deprecated = '', $autoload = 'yes' ) {
	if ( isset( $GLOBALS['paf_options'][ $key ] ) ) {
		return false;
	}
	$GLOBALS['paf_options'][ $key ]         = $value;
	$GLOBALS['paf_option_autoload'][ $key ] = $autoload;

	return true;
}

function update_option( $key, $value, $autoload = null ) {
	if ( isset( $GLOBALS['paf_options'][ $key ] ) && $GLOBALS['paf_options'][ $key ] === $value ) {
		return false;
	}
	$GLOBALS['paf_options'][ $key ] = $value;

	return true;
}

function delete_option( $key ) {
	$existed = isset( $GLOBALS['paf_options'][ $key ] );
	unset( $GLOBALS['paf_options'][ $key ], $GLOBALS['paf_option_autoload'][ $key ] );

	return $existed;
}

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
	}
}

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
}

function wp_remote_request( $url, $args = array() ) {
	$GLOBALS['paf_remote_calls'][] = array( 'url' => $url, 'args' => $args );

	return $GLOBALS['paf_remote_response'];
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php';

// --- Fixtures --------------------------------------------------------------

$theme_hash = 'PMAGv';
$fresh_key  = 'pixassist_theme_config_' . $theme_hash;
$stale_key  = 'pixassist_theme_config_stale_' . $theme_hash;
$fail_key   = 'pixassist_theme_config_failure_' . $theme_hash;
$lock_key   = 'pixassist_theme_config_lock_' . $theme_hash;

function paf_reset_state() {
	$GLOBALS['paf_transients']        = array();
	$GLOBALS['paf_transients_broken'] = false;
	$GLOBALS['paf_options']           = array();
	$GLOBALS['paf_option_autoload']   = array();
	$GLOBALS['paf_remote_calls']      = array();
}

function paf_healthy_response() {
	return array(
		'body' => json_encode(
			array(
				'code' => 'success',
				'data' => array(
					'config' => array(
						'knowledgeBase' => array( 'selfHelp' => 'yes' ),
						'dashboard'     => array( 'ignored' => true ),
						'setupWizard'   => array( 'ignored' => true ),
					),
				),
			)
		),
	);
}

// --- 1) Cold cache, healthy endpoint: one round-trip populates everything. --

paf_reset_state();
$GLOBALS['paf_remote_response'] = paf_healthy_response();

$config = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'A cold cache must trigger exactly one remote get_config call.' );
assert_true(
	false !== strpos( $GLOBALS['paf_remote_calls'][0]['url'], 'wp-json/pxm/v2/front/get_config' ),
	'The remote call must target the PXM get_config endpoint.'
);
assert_same( 'PMAGv', $GLOBALS['paf_remote_calls'][0]['args']['body']['hash_id'], 'The request must carry the theme hash id.' );
assert_same( 'hive-lite', $GLOBALS['paf_remote_calls'][0]['args']['body']['sku'], 'The request must carry the theme SKU.' );
assert_same( 1, $GLOBALS['paf_remote_calls'][0]['args']['body']['edit'], 'The configuration request must bypass the origin FastCGI cache; Assistant owns the six-hour client cache.' );
assert_true( is_array( $config ) && isset( $config['knowledgeBase'] ), 'A successful fetch must return the config.' );
assert_true( ! isset( $config['dashboard'] ) && ! isset( $config['setupWizard'] ), 'Dashboard/setupWizard sections must be stripped.' );
assert_same( $config, get_transient( $fresh_key ), 'The fresh (6h) transient must hold the config.' );
assert_same( $config, get_transient( $stale_key ), 'The stale (7-day) fallback transient must hold the config.' );
assert_same( false, get_transient( $fail_key ), 'A successful fetch must leave no failure marker.' );
assert_true( isset( $GLOBALS['paf_options'][ $lock_key ] ), 'The fetch lock must remain in place after the fetch (it expires on its own — min-interval floor).' );
assert_same( 'no', $GLOBALS['paf_option_autoload'][ $lock_key ], 'The fetch lock must be a NON-autoloaded option.' );

// --- 2) Fresh cache short-circuits: no extra remote calls. ------------------

$again = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'A fresh cached config must short-circuit the remote call.' );
assert_same( $config, $again, 'The cached config must be returned as-is.' );

// --- 3) Stampede: cache expired while another request holds the lock. -------
// Concurrent requests must be answered from the stale fallback with NO remote call.

delete_transient( $fresh_key ); // Simulate the 6h transient expiring.
// The lock set in (1) is seconds old, i.e. another request is (or just was) fetching.

$stale_answer = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'While the lock is fresh, concurrent requests must NOT hit the remote endpoint.' );
assert_same( $config, $stale_answer, 'Lock-blocked requests must be answered from the stale fallback.' );

// --- 4) An expired lock can be re-acquired (fetching resumes). --------------

$GLOBALS['paf_options'][ $lock_key ] = time() - 2 * MINUTE_IN_SECONDS;

$refetched = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 2, count( $GLOBALS['paf_remote_calls'] ), 'Once the lock expires, the next request must be able to fetch again.' );
assert_true( is_array( $refetched ) && isset( $refetched['knowledgeBase'] ), 'The re-fetch must return the config.' );

// --- 5) Broken transient persistence: the lock option is the rate floor. ----
// Installs where set_transient never sticks used to hit PXM on EVERY request. The lock lives in
// wp_options, so even there at most one remote attempt per lock window is possible.

paf_reset_state();
$GLOBALS['paf_transients_broken'] = true;
$GLOBALS['paf_remote_response']   = paf_healthy_response();

$first  = PixelgradeAssistant_Admin::get_remote_config();
$second = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'With broken transients, the lock option must still cap remote calls to one per window.' );
assert_true( is_array( $first ), 'The single allowed fetch must still return the config.' );
assert_same( false, $second, 'Follow-up requests inside the lock window must get false (no stale available), not a remote call.' );

// --- 6) Endpoint failure: throttle marker + stale fallback. ------------------

paf_reset_state();
$GLOBALS['paf_remote_response'] = new WP_Error();

$failed = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'A cold cache with a failing endpoint must attempt exactly one remote call.' );
assert_same( false, $failed, 'With no stale fallback, a failed fetch must return false.' );
assert_true( false !== get_transient( $fail_key ), 'A failed fetch must set the failure throttle marker.' );

$throttled = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'While the failure marker is set, no further remote calls are allowed.' );
assert_same( false, $throttled, 'Throttled requests without stale config must return false.' );

set_transient( $stale_key, array( 'from' => 'stale' ) );
$stale_during_failure = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'Stale answers during the failure window must not hit the remote endpoint.' );
assert_same( array( 'from' => 'stale' ), $stale_during_failure, 'During the failure window, callers must get the stale config.' );

// --- 7) An invalid/garbage response body counts as a failure. ----------------

paf_reset_state();
$GLOBALS['paf_remote_response'] = array( 'body' => 'this is not JSON' );

$garbage = PixelgradeAssistant_Admin::get_remote_config();

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'An invalid response must count as the single allowed attempt.' );
assert_same( false, $garbage, 'An invalid response must resolve to false.' );
assert_true( false !== get_transient( $fail_key ), 'An invalid response must set the failure throttle marker.' );

// --- 8) skip_cache bypasses cache + lock and lifts the failure marker. -------
// PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE maps onto this same $skip_cache path.

paf_reset_state();
set_transient( $fresh_key, array( 'from' => 'cache' ) );
set_transient( $fail_key, time() );
$GLOBALS['paf_options'][ $lock_key ] = time(); // Fresh lock held.
$GLOBALS['paf_remote_response']      = paf_healthy_response();

$forced = PixelgradeAssistant_Admin::get_remote_config( true );

assert_same( 1, count( $GLOBALS['paf_remote_calls'] ), 'skip_cache must always perform the remote call, past cache, lock and failure marker.' );
assert_true( is_array( $forced ) && isset( $forced['knowledgeBase'] ), 'A forced refresh must return the fetched config.' );
assert_same( $forced, get_transient( $fresh_key ), 'A forced refresh must repopulate the fresh cache.' );
assert_same( false, get_transient( $fail_key ), 'A successful fetch must lift the failure throttle marker.' );

// --- 9) clear_remote_config_cache() clears all four states. ------------------

paf_reset_state();
set_transient( $fresh_key, array( 'x' ) );
set_transient( $stale_key, array( 'x' ) );
set_transient( $fail_key, time() );
$GLOBALS['paf_options'][ $lock_key ] = time();

PixelgradeAssistant_Admin::clear_remote_config_cache();

assert_same( false, get_transient( $fresh_key ), 'clear_remote_config_cache() must delete the fresh config transient.' );
assert_same( false, get_transient( $stale_key ), 'clear_remote_config_cache() must delete the stale fallback transient.' );
assert_same( false, get_transient( $fail_key ), 'clear_remote_config_cache() must delete the failure throttle marker.' );
assert_true( ! isset( $GLOBALS['paf_options'][ $lock_key ] ), 'clear_remote_config_cache() must release the fetch lock.' );

echo "Remote config cache/stampede guard OK\n";
