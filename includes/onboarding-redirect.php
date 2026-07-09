<?php
/**
 * First-run discoverability: the one-time activation redirect to the hub onboarding (Phase 3).
 *
 * Modeled exactly on WooCommerce's `WC_Admin::admin_redirects()`: plugin activation sets a short
 * transient; the next `admin_init` redirects ONCE to the Appearance -> Pixelgrade hub, behind a stack
 * of guards (cron/ajax/network-admin/bulk-activation/capability/already-on-hub/dismissed-or-complete/
 * off-switch + two escape-hatch filters). The transient is deleted exactly once — the WC race-condition
 * lesson — and kept short-lived (30s) so a stray tab never hijacks an unrelated admin page later.
 *
 * Placement note: this is a CLEAN, self-contained include wired from the loader so the main plugin
 * file is never touched. The activation hook is registered here against
 * `PIXELGRADE_ASSISTANT__PLUGIN_FILE`.
 *
 * The decision is split into a PURE function (pixassist_should_onboarding_redirect) driven by injected
 * facts so the guard stack is WP-free and unit-testable (tests/onboarding-redirect-test.php); the thin
 * WP wiring gathers those facts and performs the side effects.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'PIXASSIST_ACTIVATION_REDIRECT_TRANSIENT' ) ) {
	define( 'PIXASSIST_ACTIVATION_REDIRECT_TRANSIENT', 'pixassist_activation_redirect' );
}

if ( ! function_exists( 'pixassist_set_activation_redirect' ) ) {
	/**
	 * Flag a pending one-time onboarding redirect on plugin activation.
	 *
	 * Short TTL (30s) so the redirect only ever fires on the immediate next admin page load — never
	 * later. Registered as the activation hook from this include so the main plugin file stays clean.
	 */
	function pixassist_set_activation_redirect() {
		// During bulk plugin activation WordPress sets this flag; never schedule a hijacking redirect
		// in that case (mirrors WC skipping `activate-multi`).
		if ( isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		set_transient( PIXASSIST_ACTIVATION_REDIRECT_TRANSIENT, 1, 30 );
	}
}

if ( ! function_exists( 'pixassist_should_onboarding_redirect' ) ) {
	/**
	 * The pure guard decision: should we perform the one-time onboarding redirect? No WP calls, no
	 * side effects — driven entirely by injected facts so the full guard stack is unit-testable.
	 *
	 * Returns true ONLY when: a redirect is pending, onboarding is enabled + master-filter-allowed,
	 * the context is a real interactive admin page load (not cron/ajax/network-admin/bulk-activation),
	 * the user is capable, we are not already on the hub, onboarding is neither dismissed nor complete,
	 * and the prevent escape-hatch is not set.
	 *
	 * @param array $facts {
	 *     @type bool   $pending           A redirect transient is present.
	 *     @type bool   $enabled           Onboarding is enabled (off-switch / pixassist_show_onboarding).
	 *     @type bool   $master_allowed    The `pixassist_enable_onboarding_redirect` master filter.
	 *     @type bool   $prevented         The `pixassist_prevent_onboarding_redirect` escape hatch.
	 *     @type bool   $doing_cron        wp_doing_cron().
	 *     @type bool   $doing_ajax        wp_doing_ajax().
	 *     @type bool   $is_network_admin  is_network_admin().
	 *     @type bool   $is_bulk_activate  isset( $_GET['activate-multi'] ).
	 *     @type bool   $user_can          current_user_can( 'edit_theme_options' ).
	 *     @type bool   $on_hub            Already on `?page=pixelgrade`.
	 *     @type bool   $dismissed         Onboarding dismissed (persisted marker).
	 *     @type bool   $complete          Onboarding complete (all required steps done).
	 * }
	 *
	 * @return bool
	 */
	function pixassist_should_onboarding_redirect( $facts ) {
		// Nothing pending => never redirect (the common case on every admin page load).
		if ( empty( $facts['pending'] ) ) {
			return false;
		}

		// Master gate + off-switch: a theme that disabled onboarding (or the redirect) never gets it.
		if ( empty( $facts['enabled'] ) || empty( $facts['master_allowed'] ) ) {
			return false;
		}

		// Never hijack background/automated/network/bulk contexts.
		if ( ! empty( $facts['doing_cron'] )
			|| ! empty( $facts['doing_ajax'] )
			|| ! empty( $facts['is_network_admin'] )
			|| ! empty( $facts['is_bulk_activate'] ) ) {
			return false;
		}

		// Capability gate (the hub page's own capability).
		if ( empty( $facts['user_can'] ) ) {
			return false;
		}

		// Don't redirect onto the page we are already on.
		if ( ! empty( $facts['on_hub'] ) ) {
			return false;
		}

		// Don't re-onboard someone who already finished or opted out.
		if ( ! empty( $facts['dismissed'] ) || ! empty( $facts['complete'] ) ) {
			return false;
		}

		// Final explicit escape hatch.
		if ( ! empty( $facts['prevented'] ) ) {
			return false;
		}

		return true;
	}
}

if ( ! function_exists( 'pixassist_onboarding_redirect_should_consume_transient' ) ) {
	/**
	 * Whether the pending transient should be consumed (deleted) on this admin_init, regardless of
	 * whether we actually redirect.
	 *
	 * The transient is a ONE-SHOT: once a pending redirect is seen on an interactive (non-async)
	 * admin page load, it is spent — whether we redirect or decide not to (already on hub, not capable,
	 * dismissed/complete, etc.). It is deliberately NOT consumed in async contexts (cron/ajax) or bulk
	 * activation so the redirect still has a chance to fire on the user's next real admin page (this is
	 * the WC race-condition lesson — don't let an ajax/heartbeat call eat the flag).
	 *
	 * @param array $facts Same facts as pixassist_should_onboarding_redirect().
	 *
	 * @return bool
	 */
	function pixassist_onboarding_redirect_should_consume_transient( $facts ) {
		if ( empty( $facts['pending'] ) ) {
			return false;
		}

		// Don't spend the flag in async/bulk contexts — let it survive to the next real page load.
		if ( ! empty( $facts['doing_cron'] )
			|| ! empty( $facts['doing_ajax'] )
			|| ! empty( $facts['is_bulk_activate'] ) ) {
			return false;
		}

		return true;
	}
}

if ( ! function_exists( 'pixassist_get_onboarding_redirect_facts' ) ) {
	/**
	 * Gather the guard facts from WordPress for the live redirect decision.
	 *
	 * @return array Facts consumed by pixassist_should_onboarding_redirect().
	 */
	function pixassist_get_onboarding_redirect_facts() {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$enabled  = function_exists( 'pixassist_onboarding_enabled' ) ? (bool) pixassist_onboarding_enabled() : true;
		$complete = false;
		if ( function_exists( 'pixassist_get_onboarding_steps' ) && function_exists( 'pixassist_get_onboarding_facts' ) && function_exists( 'pixassist_onboarding_is_complete' ) ) {
			$steps    = pixassist_get_onboarding_steps( pixassist_get_onboarding_facts( '' ) );
			$complete = (bool) pixassist_onboarding_is_complete( $steps );
		}

		$dismissed = false;
		if ( function_exists( 'pixassist_get_onboarding_state' ) ) {
			$state     = pixassist_get_onboarding_state();
			$dismissed = ! empty( $state['dismissed'] );
		}

		return array(
			'pending'          => (bool) get_transient( PIXASSIST_ACTIVATION_REDIRECT_TRANSIENT ),
			'enabled'          => $enabled,
			'master_allowed'   => (bool) apply_filters( 'pixassist_enable_onboarding_redirect', true ),
			'prevented'        => (bool) apply_filters( 'pixassist_prevent_onboarding_redirect', false ),
			'doing_cron'       => function_exists( 'wp_doing_cron' ) ? (bool) wp_doing_cron() : false,
			'doing_ajax'       => function_exists( 'wp_doing_ajax' ) ? (bool) wp_doing_ajax() : false,
			'is_network_admin' => function_exists( 'is_network_admin' ) ? (bool) is_network_admin() : false,
			'is_bulk_activate' => isset( $_GET['activate-multi'] ), // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			'user_can'         => function_exists( 'current_user_can' ) ? (bool) current_user_can( 'edit_theme_options' ) : false,
			'on_hub'           => 'pixelgrade' === $page,
			'dismissed'        => $dismissed,
			'complete'         => $complete,
		);
	}
}

if ( ! function_exists( 'pixassist_maybe_onboarding_redirect' ) ) {
	/**
	 * On `admin_init`, perform the one-time onboarding redirect when all guards pass.
	 *
	 * The transient is consumed (once) on any interactive admin page load where it was pending — so a
	 * single activation can only ever produce a single redirect attempt, and a declined attempt (e.g.
	 * already on the hub) still spends the flag rather than nagging the user repeatedly.
	 */
	function pixassist_maybe_onboarding_redirect() {
		$facts = pixassist_get_onboarding_redirect_facts();

		if ( pixassist_onboarding_redirect_should_consume_transient( $facts ) ) {
			delete_transient( PIXASSIST_ACTIVATION_REDIRECT_TRANSIENT );
		}

		if ( ! pixassist_should_onboarding_redirect( $facts ) ) {
			return;
		}

		wp_safe_redirect( pixassist_get_hub_url() );
		exit;
	}
}

// Wire the activation hook + the admin_init guard from this clean include (keeps the main plugin file
// untouched). register_activation_hook against the plugin-file constant; admin_init for the redirect.
if ( function_exists( 'register_activation_hook' ) && defined( 'PIXELGRADE_ASSISTANT__PLUGIN_FILE' ) ) {
	register_activation_hook( PIXELGRADE_ASSISTANT__PLUGIN_FILE, 'pixassist_set_activation_redirect' );
}

if ( function_exists( 'add_action' ) ) {
	add_action( 'admin_init', 'pixassist_maybe_onboarding_redirect' );
}
