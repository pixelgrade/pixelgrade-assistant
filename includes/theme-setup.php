<?php
/**
 * Default Pixelgrade theme setup data for fresh-site onboarding.
 *
 * Anima LT is the free WordPress.org theme advertised alongside Pixelgrade Assistant. This module
 * exposes a secret-free, capability-aware descriptor consumed by the hub's existing WordPress core
 * updates client; it never downloads or activates a theme on its own.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_default_theme_setup' ) ) {
	/**
	 * Builds the Anima LT install/activation descriptor used by onboarding and Site Setup.
	 *
	 * @return array {
	 *     @type string $slug         WordPress.org theme slug.
	 *     @type string $name         Theme display name.
	 *     @type string $status       active|inactive|missing.
	 *     @type bool   $isInstalled  Whether the theme exists locally.
	 *     @type bool   $isActive     Whether the theme is the active stylesheet.
	 *     @type bool   $isMultisite  Whether this request belongs to a multisite network.
	 *     @type bool   $isAllowed    Whether this site may activate the installed theme.
	 *     @type bool   $canInstall   Whether the current user can install themes.
	 *     @type bool   $canAutoInstall Whether browser automation may install the theme here.
	 *     @type bool   $canActivate  Whether the current user can switch themes.
	 *     @type string $installUrl   Core theme-browser fallback URL.
	 *     @type string $manageUrl    Safe theme-management hand-off for this environment.
	 *     @type string $activateUrl  Nonce-protected core theme activation URL.
	 * }
	 */
	function pixassist_get_default_theme_setup() {
		$slug          = 'anima-lt';
		$is_installed  = false;
		$is_active     = function_exists( 'get_stylesheet' ) && $slug === get_stylesheet();
		$is_multisite  = function_exists( 'is_multisite' ) && is_multisite();
		$is_allowed    = ! $is_multisite;
		$theme         = null;

		if ( function_exists( 'wp_get_theme' ) ) {
			$theme = wp_get_theme( $slug );
			if ( is_object( $theme ) && method_exists( $theme, 'exists' ) ) {
				$is_installed = (bool) $theme->exists();
			}

			if ( $is_multisite && $is_installed && is_object( $theme ) && method_exists( $theme, 'is_allowed' ) ) {
				$blog_id    = function_exists( 'get_current_blog_id' ) ? get_current_blog_id() : null;
				$is_allowed = null === $blog_id
					? (bool) $theme->is_allowed( 'both' )
					: (bool) $theme->is_allowed( 'both', $blog_id );
			}
		}

		$can_install      = function_exists( 'current_user_can' ) ? current_user_can( 'install_themes' ) : false;
		$can_auto_install = $can_install && ! $is_multisite;
		$can_activate     = ( function_exists( 'current_user_can' ) ? current_user_can( 'switch_themes' ) : false ) && $is_allowed;
		$install_path     = 'theme-install.php?search=' . rawurlencode( $slug );
		$install_url      = '';
		$manage_url       = '';

		if ( $is_multisite && function_exists( 'network_admin_url' ) ) {
			$install_url = network_admin_url( $install_path );
			$manage_url  = $is_installed ? network_admin_url( 'themes.php' ) : $install_url;
		} elseif ( function_exists( 'admin_url' ) ) {
			$install_url = admin_url( $install_path );
			$manage_url  = $is_installed ? admin_url( 'themes.php' ) : $install_url;
		}

		$activate_url = '';

		if ( $can_activate && function_exists( 'admin_url' ) && function_exists( 'add_query_arg' ) && function_exists( 'wp_nonce_url' ) ) {
			$activate_url = wp_nonce_url(
				add_query_arg(
					array(
						'action'     => 'activate',
						'stylesheet' => $slug,
					),
					admin_url( 'themes.php' )
				),
				'switch-theme_' . $slug
			);

			// wp_nonce_url() prepares links for HTML. This descriptor is JSON-localized, so restore
			// raw query separators before JavaScript passes the URL to fetch().
			$activate_url = html_entity_decode( $activate_url, ENT_QUOTES, 'UTF-8' );
		}

		$status = 'missing';
		if ( $is_active ) {
			$status = 'active';
		} elseif ( $is_installed ) {
			$status = 'inactive';
		}

		return array(
			'slug'           => $slug,
			'name'           => 'Anima LT',
			'status'         => $status,
			'isInstalled'    => $is_installed,
			'isActive'       => $is_active,
			'isMultisite'    => $is_multisite,
			'isAllowed'      => $is_allowed,
			'canInstall'     => $can_install,
			'canAutoInstall' => $can_auto_install,
			'canActivate'    => $can_activate,
			'installUrl'     => $install_url,
			'manageUrl'      => $manage_url,
			'activateUrl'    => $activate_url,
		);
	}
}
