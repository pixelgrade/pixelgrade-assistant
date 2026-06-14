<?php
/**
 * Capability helpers that distinguish the free (WordPress.org) Assistant build from
 * commercial behavior provided by the separate Pixelgrade Plus plugin.
 *
 * Product boundary = package boundary: commercial features live in Pixelgrade Plus, not as
 * dormant flag-gated code inside Assistant. PIXELGRADE_ASSISTANT__IS_COMMERCIAL is only a
 * fail-safe guard, never the primary mechanism for shipping commercial modules here.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_is_commercial' ) ) {
	/**
	 * Whether this build may expose commercial behavior.
	 *
	 * Defaults to false. This is a fail-safe guard only; commercial features belong in the
	 * separate Pixelgrade Plus plugin, hooked in via Assistant's extension points.
	 *
	 * @return bool
	 */
	function pixassist_is_commercial() {
		$is_commercial = defined( 'PIXELGRADE_ASSISTANT__IS_COMMERCIAL' ) && PIXELGRADE_ASSISTANT__IS_COMMERCIAL;

		return (bool) apply_filters( 'pixassist_is_commercial', $is_commercial );
	}
}

if ( ! function_exists( 'pixassist_is_plus_active' ) ) {
	/**
	 * Whether the premium companion (Pixelgrade Plus) is present.
	 *
	 * Detection only — Assistant must never auto-enable commercial behavior simply because
	 * Plus is detected.
	 *
	 * @return bool
	 */
	function pixassist_is_plus_active() {
		$is_active = defined( 'PIXELGRADE_PLUS__PLUGIN_FILE' );

		return (bool) apply_filters( 'pixassist_is_plus_active', $is_active );
	}
}

if ( ! function_exists( 'pixassist_is_care_active' ) ) {
	/**
	 * Whether the legacy companion (Pixelgrade Care) is present/active.
	 *
	 * Load-order-safe: Pixelgrade Care loads after Pixelgrade Assistant (alphabetical), so its
	 * PIXELGRADE_CARE__PLUGIN_FILE constant is not yet defined when Assistant boots and runs its
	 * coexistence check. We therefore also consult the active-plugins list, so Assistant reliably
	 * detects Care at load time and stays out of the way — preventing duplicate dashboards and
	 * fatal function redeclarations between the two plugins.
	 *
	 * @return bool
	 */
	function pixassist_is_care_active() {
		$is_active = defined( 'PIXELGRADE_CARE__PLUGIN_FILE' );

		if ( ! $is_active && function_exists( 'get_option' ) ) {
			$care_basename = 'pixelgrade-care/pixelgrade-care.php';
			$is_active      = in_array( $care_basename, (array) get_option( 'active_plugins', array() ), true );

			if ( ! $is_active && is_multisite() ) {
				$network_active = (array) get_site_option( 'active_sitewide_plugins', array() );
				$is_active       = isset( $network_active[ $care_basename ] );
			}
		}

		return (bool) apply_filters( 'pixassist_is_care_active', $is_active );
	}
}
