<?php
/**
 * The host extension surface Assistant exposes for companion plugins (Pixelgrade Plus).
 *
 * Assistant is the host shell; Plus is a pure add-on that injects features through this small,
 * curated, PHP-first surface (the reverse direction of the Plus <-> Assistant contract). Assistant
 * OWNS the shell + the host pixelgrade.com account; it never owns commercial/license logic.
 *
 * Provided here:
 *   - pixassist_get_admin_hub_tabs(): normalized list of hub tabs registered via the
 *     `pixelgrade/admin_hub/tabs` PHP filter. The hub React app (#43) localizes this and re-applies
 *     the JS filter `pixelgrade.adminHub.tabs` (@wordpress/hooks) before rendering.
 *   - pixassist_get_account() / pixassist_is_account_connected(): host-owned account READ accessors.
 *     Identity only — never OAuth tokens/secrets.
 *   - pixassist_get_account_credentials() (defined by includes/account.php): PHP-only OAuth
 *     credentials for server-side signing; never localized and never merged into identity.
 *
 * Documented (wired with their UI, not here): the `pixelgrade.adminHub.tabs` JS filter (#43) and the
 * `pixelgrade-docs` docs-panel escalation SlotFill scope (#46).
 *
 * Canonical contract + change protocol (edit BOTH repos in lockstep):
 *   ../pixelgrade-plus/docs/architecture/plus-assistant-contract.md
 *
 * Function-style, mirroring includes/capabilities.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_admin_hub_tabs' ) ) {
	/**
	 * Collect + normalize the Appearance -> Pixelgrade hub tabs.
	 *
	 * Companion plugins register tabs by filtering `pixelgrade/admin_hub/tabs`, each tab a descriptor
	 * array. Assistant registers free tabs; Plus registers premium tabs (entitlement-gated). The
	 * normalizer is the access-control + hygiene boundary: it requires a unique id, enforces the
	 * declared capability (tabs the current user cannot access are dropped), and produces a stable
	 * descriptor shape.
	 *
	 * Descriptor keys (all optional except id):
	 *   - id (string, required): unique, sanitized; first registration of an id wins.
	 *   - label (string): human tab label.
	 *   - capability (string): WP capability required to see the tab. Default `manage_options`.
	 *   - gate (string): cosmetic entitlement hint for upsell rendering — recognized: '' (free),
	 *     'plus', 'plus_licensed'. NOT access control (capability is).
	 *   - component (string): JS component key the hub registry resolves to a React component.
	 *   - url (string): if non-empty, the tab is a plain link-out and `component` is cleared.
	 *   - icon (string): optional dashicon/url for the tab.
	 *   - group (string): `primary` or `secondary`. Default `primary`; secondary tabs sort after primary.
	 *   - order (int): sort weight (ascending). Default 10. Ties broken by label.
	 *
	 * @return array[] List of normalized tab descriptors, sorted by group, order, then label.
	 */
	function pixassist_get_admin_hub_tabs() {
		/**
		 * Filter the Appearance -> Pixelgrade hub tabs.
		 *
		 * @param array[] $tabs Tab descriptors. See pixassist_get_admin_hub_tabs() for the shape.
		 */
		$tabs = apply_filters( 'pixelgrade/admin_hub/tabs', array() );

		if ( ! is_array( $tabs ) ) {
			return array();
		}

		$normalized = array();

		foreach ( $tabs as $tab ) {
			if ( ! is_array( $tab ) || empty( $tab['id'] ) ) {
				continue;
			}

			$id = sanitize_key( $tab['id'] );
			if ( '' === $id || isset( $normalized[ $id ] ) ) {
				continue; // Drop blank + duplicate ids (first registration wins).
			}

			$capability = ! empty( $tab['capability'] ) ? (string) $tab['capability'] : 'manage_options';
			if ( function_exists( 'current_user_can' ) && ! current_user_can( $capability ) ) {
				continue; // Real access control: hide tabs the current user cannot use.
			}

			$url       = isset( $tab['url'] ) ? (string) $tab['url'] : '';
			$component = ( '' === $url && isset( $tab['component'] ) ) ? (string) $tab['component'] : '';
			$group     = isset( $tab['group'] ) ? sanitize_key( $tab['group'] ) : 'primary';
			if ( ! in_array( $group, array( 'primary', 'secondary' ), true ) ) {
				$group = 'primary';
			}

			$normalized[ $id ] = array(
				'id'         => $id,
				'label'      => isset( $tab['label'] ) ? (string) $tab['label'] : '',
				'capability' => $capability,
				'gate'       => isset( $tab['gate'] ) ? sanitize_key( $tab['gate'] ) : '',
				'component'  => $component,
				'url'        => $url,
				'icon'       => isset( $tab['icon'] ) ? (string) $tab['icon'] : '',
				'group'      => $group,
				'order'      => isset( $tab['order'] ) ? (int) $tab['order'] : 10,
			);
		}

		uasort(
			$normalized,
			function ( $a, $b ) {
				$group_rank = array(
					'primary'   => 0,
					'secondary' => 1,
				);
				$a_group    = isset( $group_rank[ $a['group'] ] ) ? $group_rank[ $a['group'] ] : 0;
				$b_group    = isset( $group_rank[ $b['group'] ] ) ? $group_rank[ $b['group'] ] : 0;

				if ( $a_group !== $b_group ) {
					return ( $a_group < $b_group ) ? -1 : 1;
				}

				if ( $a['order'] === $b['order'] ) {
					return strcmp( $a['label'], $b['label'] );
				}

				return ( $a['order'] < $b['order'] ) ? -1 : 1;
			}
		);

		return array_values( $normalized );
	}
}

if ( ! function_exists( 'pixassist_read_host_account_identity' ) ) {
	/**
	 * Best-effort read of the current host pixelgrade.com connection from legacy storage.
	 *
	 * A real connection is one where a WordPress user carries a non-empty `pixelgrade_user_login`
	 * meta (set by the historic activation flow). Otherwise this returns null and the account reads
	 * as disconnected. Guarded so the file loads/tests standalone without the admin class or WP.
	 *
	 * Modern storage is supplied through the `pixassist_account` filter by includes/account.php; this
	 * legacy reader remains as a compatibility fallback for installs that connected before #45.
	 *
	 * @return array|null Raw identity (subset of the account keys) or null when disconnected.
	 */
	function pixassist_read_host_account_identity() {
		if ( ! class_exists( 'PixelgradeAssistant_Admin' )
			|| ! method_exists( 'PixelgradeAssistant_Admin', 'get_theme_activation_user' )
			|| ! function_exists( 'get_user_meta' ) ) {
			return null;
		}

		$user = PixelgradeAssistant_Admin::get_theme_activation_user();
		if ( empty( $user ) || empty( $user->ID ) ) {
			return null;
		}

		$pixelgrade_login = (string) get_user_meta( $user->ID, 'pixelgrade_user_login', true );
		if ( '' === $pixelgrade_login ) {
			return null; // Just the current-user fallback, not a real pixelgrade.com connection.
		}

		return array(
			'is_connected'       => true,
			'email'              => isset( $user->user_email ) ? (string) $user->user_email : '',
			'display_name'       => ( ! empty( $user->display_name ) ) ? (string) $user->display_name : $pixelgrade_login,
			'user_login'         => $pixelgrade_login,
			'pixelgrade_user_id' => (int) get_user_meta( $user->ID, 'pixassist_user_ID', true ),
			'avatar_url'         => ( function_exists( 'get_avatar_url' ) && isset( $user->user_email ) ) ? (string) get_avatar_url( $user->user_email ) : '',
			'wp_user_id'         => (int) $user->ID,
			'connected_at'       => '', // Not tracked by the legacy storage; #45 may add it.
		);
	}
}

if ( ! function_exists( 'pixassist_get_account' ) ) {
	/**
	 * Read the host-owned pixelgrade.com account (identity only).
	 *
	 * Assistant owns THE account connection; Plus reads it (and layers license/entitlement on top).
	 * The return is whitelisted to exactly the identity keys below and type-coerced, so a filter can
	 * never widen the surface or leak OAuth tokens/secrets to consumers.
	 *
	 * @return array {
	 *     @type bool   $is_connected       Whether a pixelgrade.com account is connected.
	 *     @type string $email              Account email.
	 *     @type string $display_name       Human display name.
	 *     @type string $user_login         pixelgrade.com login.
	 *     @type int    $pixelgrade_user_id pixelgrade.com user id.
	 *     @type string $avatar_url         Avatar URL.
	 *     @type int    $wp_user_id         Local WordPress user holding the connection.
	 *     @type string $connected_at       Connection timestamp (ISO 8601) when known.
	 * }
	 */
	function pixassist_get_account() {
		$defaults = array(
			'is_connected'       => false,
			'email'              => '',
			'display_name'       => '',
			'user_login'         => '',
			'pixelgrade_user_id' => 0,
			'avatar_url'         => '',
			'wp_user_id'         => 0,
			'connected_at'       => '',
		);

		$identity = pixassist_read_host_account_identity();
		$account  = is_array( $identity ) ? wp_parse_args( $identity, $defaults ) : $defaults;

		/**
		 * Filter the host account payload. Used by #45 (account modernization) to supply the modern
		 * connection, and as the test seam. Token/secret keys added here are stripped below.
		 *
		 * @param array $account Identity payload (see pixassist_get_account()).
		 */
		$account = apply_filters( 'pixassist_account', $account );
		if ( ! is_array( $account ) ) {
			$account = $defaults;
		}

		// Whitelist to EXACTLY the identity keys (strip any leaked token-like keys) + coerce types.
		return array(
			'is_connected'       => ! empty( $account['is_connected'] ),
			'email'              => isset( $account['email'] ) ? (string) $account['email'] : '',
			'display_name'       => isset( $account['display_name'] ) ? (string) $account['display_name'] : '',
			'user_login'         => isset( $account['user_login'] ) ? (string) $account['user_login'] : '',
			'pixelgrade_user_id' => isset( $account['pixelgrade_user_id'] ) ? (int) $account['pixelgrade_user_id'] : 0,
			'avatar_url'         => isset( $account['avatar_url'] ) ? (string) $account['avatar_url'] : '',
			'wp_user_id'         => isset( $account['wp_user_id'] ) ? (int) $account['wp_user_id'] : 0,
			'connected_at'       => isset( $account['connected_at'] ) ? (string) $account['connected_at'] : '',
		);
	}
}

if ( ! function_exists( 'pixassist_is_account_connected' ) ) {
	/**
	 * Whether a host pixelgrade.com account is connected.
	 *
	 * @return bool
	 */
	function pixassist_is_account_connected() {
		$account = pixassist_get_account();

		return ! empty( $account['is_connected'] );
	}
}
