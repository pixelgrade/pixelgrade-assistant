<?php
/**
 * Pins the one-time onboarding activation-redirect guard logic (onboarding migration, Phase 3).
 *
 * The redirect is modeled on WooCommerce's `WC_Admin::admin_redirects()`: activation sets a short
 * transient and the next interactive `admin_init` redirects ONCE to the Appearance -> Pixelgrade hub,
 * behind a stack of guards. The decision + the once-only transient consumption are PURE functions
 * driven by injected facts (includes/onboarding-redirect.php), so the whole guard stack is testable
 * here with no WordPress runtime.
 *
 * Covered:
 *   - redirect ONLY when: pending + enabled + master-allowed + interactive (not cron/ajax/network/
 *     bulk) + capable + not-already-on-hub + not-dismissed + not-complete + not-prevented;
 *   - each guard independently blocks the redirect;
 *   - the transient is consumed exactly once on an interactive load, but NOT in async/bulk contexts
 *     (the WC race-condition lesson).
 *
 * Standalone: run with `php tests/onboarding-redirect-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

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

// Stub only what the pure functions need (they take all facts as arguments, so nothing else is
// touched at require time — the WP wiring at the bottom of the file is guarded by function_exists()).
require __DIR__ . '/../includes/onboarding-redirect.php';

/**
 * A fully-passing fact set (every guard satisfied → redirect). Tests override one key at a time.
 *
 * @param array $overrides Keys to override.
 *
 * @return array
 */
function pard_facts( $overrides = array() ) {
	$base = array(
		'pending'          => true,
		'enabled'          => true,
		'master_allowed'   => true,
		'prevented'        => false,
		'doing_cron'       => false,
		'doing_ajax'       => false,
		'is_network_admin' => false,
		'is_bulk_activate' => false,
		'user_can'         => true,
		'on_hub'           => false,
		'dismissed'        => false,
		'complete'         => false,
	);

	return array_merge( $base, $overrides );
}

/*
 * 1. The happy path: every guard satisfied → redirect.
 */
assert_same( true, pixassist_should_onboarding_redirect( pard_facts() ), 'All guards satisfied => redirect.' );

/*
 * 2. Each guard independently blocks the redirect.
 */
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'pending' => false ) ) ), 'No pending transient => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'enabled' => false ) ) ), 'Onboarding disabled (off-switch) => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'master_allowed' => false ) ) ), 'Master filter off => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'prevented' => true ) ) ), 'Prevent escape-hatch => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'doing_cron' => true ) ) ), 'Cron context => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'doing_ajax' => true ) ) ), 'Ajax context => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'is_network_admin' => true ) ) ), 'Network admin (multisite) => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'is_bulk_activate' => true ) ) ), 'Bulk activation (activate-multi) => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'user_can' => false ) ) ), 'Incapable user => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'on_hub' => true ) ) ), 'Already on the hub => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'dismissed' => true ) ) ), 'Onboarding dismissed => no redirect.' );
assert_same( false, pixassist_should_onboarding_redirect( pard_facts( array( 'complete' => true ) ) ), 'Onboarding complete => no redirect.' );

/*
 * 3. The once-only transient consumption.
 *
 * The flag is spent on any interactive (non-async, non-bulk) admin page load where it was pending —
 * whether or not we end up redirecting (so a declined attempt does not nag the user forever). It is
 * deliberately NOT spent in cron/ajax/bulk contexts (the WC race-condition lesson — let it survive to
 * the user's next real admin page).
 */
assert_same( true, pixassist_onboarding_redirect_should_consume_transient( pard_facts() ), 'Interactive + pending => consume the transient.' );
assert_same( false, pixassist_onboarding_redirect_should_consume_transient( pard_facts( array( 'pending' => false ) ) ), 'Nothing pending => nothing to consume.' );
assert_same( false, pixassist_onboarding_redirect_should_consume_transient( pard_facts( array( 'doing_cron' => true ) ) ), 'Cron => do not consume (survive to next real load).' );
assert_same( false, pixassist_onboarding_redirect_should_consume_transient( pard_facts( array( 'doing_ajax' => true ) ) ), 'Ajax => do not consume (survive to next real load).' );
assert_same( false, pixassist_onboarding_redirect_should_consume_transient( pard_facts( array( 'is_bulk_activate' => true ) ) ), 'Bulk activation => do not consume.' );

// A declined-but-interactive attempt (e.g. already on the hub) still SPENDS the flag — so the
// transient is consumed even though the redirect itself does not happen.
$on_hub_facts = pard_facts( array( 'on_hub' => true ) );
assert_same( false, pixassist_should_onboarding_redirect( $on_hub_facts ), 'Already on hub => no redirect.' );
assert_same( true, pixassist_onboarding_redirect_should_consume_transient( $on_hub_facts ), 'But the flag is still spent (declined attempts do not nag).' );

echo "Onboarding redirect guards OK\n";
