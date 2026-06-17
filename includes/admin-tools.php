<?php
/**
 * The secondary Tools tab: maintenance utilities inside the Appearance -> Pixelgrade hub.
 *
 * This tab is the modern hub counterpart of the legacy reset helper. It reuses Assistant's existing
 * cleanup REST endpoint and copy from the systemStatus l10n block; no new reset storage or action
 * surface is introduced.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_tools_tab' ) ) {
	/**
	 * Register the secondary Tools tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Tools tab appended.
	 */
	function pixassist_register_tools_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'tools',
			'label'      => esc_html__( 'Tools', '__plugin_txtd' ),
			'capability' => 'manage_options',
			'component'  => 'tools',
			'gate'       => '',
			'group'      => 'secondary',
			'order'      => 20,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_tools_data' ) ) {
	/**
	 * Build the bootstrap payload the Tools tab renders.
	 *
	 * @return array {
	 *     @type array $copy      Labels and helper copy derived from existing config.
	 *     @type array $endpoints Existing cleanup REST endpoint.
	 * }
	 */
	function pixassist_get_tools_data() {
		return array(
			'copy'      => pixassist_get_tools_copy( pixassist_get_tools_config() ),
			'endpoints' => pixassist_get_tools_endpoints(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_tools_config' ) ) {
	/**
	 * Read Assistant's existing merged config when the admin class is available.
	 *
	 * @return array
	 */
	function pixassist_get_tools_config() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_config' ) ) {
			$config = PixelgradeAssistant_Admin::get_config();

			return is_array( $config ) ? $config : array();
		}

		return array();
	}
}

if ( ! function_exists( 'pixassist_get_tools_copy' ) ) {
	/**
	 * Extract Tools copy from the legacy systemStatus config, with safe defaults.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return array
	 */
	function pixassist_get_tools_copy( $config ) {
		$l10n = isset( $config['systemStatus']['l10n'] ) && is_array( $config['systemStatus']['l10n'] )
			? $config['systemStatus']['l10n']
			: array();

		return array(
			'title'               => esc_html__( 'Tools', '__plugin_txtd' ),
			'description'         => esc_html__( 'Utilities for maintaining the Pixelgrade Assistant setup on this site.', '__plugin_txtd' ),
			'resetLabel'          => isset( $l10n['resetPluginButtonLabel'] ) ? (string) $l10n['resetPluginButtonLabel'] : esc_html__( 'Reset Pixelgrade Assistant', '__plugin_txtd' ),
			'resetDescription'    => isset( $l10n['resetPluginDescription'] ) ? (string) $l10n['resetPluginDescription'] : esc_html__( 'Reset Assistant options, cached state, and onboarding progress.', '__plugin_txtd' ),
			'confirmationMessage' => isset( $l10n['resetPluginConfirmationMessage'] ) ? (string) $l10n['resetPluginConfirmationMessage'] : esc_html__( 'Solve the confirmation challenge to reset Pixelgrade Assistant.', '__plugin_txtd' ),
			'challengeLabel'      => esc_html__( 'Confirmation answer', '__plugin_txtd' ),
			'challengePrefix'     => esc_html__( 'Type the result:', '__plugin_txtd' ),
			'confirmLabel'        => esc_html__( 'Confirm reset', '__plugin_txtd' ),
			'cancelLabel'         => esc_html__( 'Cancel', '__plugin_txtd' ),
			'wrongAnswer'         => esc_html__( 'The confirmation answer is incorrect.', '__plugin_txtd' ),
			'working'             => esc_html__( 'Resetting...', '__plugin_txtd' ),
			'success'             => esc_html__( 'Pixelgrade Assistant was reset. Refresh the page to load the clean state.', '__plugin_txtd' ),
			'failure'             => esc_html__( 'Reset failed. Please try again.', '__plugin_txtd' ),
			'localStorageLabel'   => esc_html__( 'Clear browser cache for this admin app', '__plugin_txtd' ),
			'localStorageSuccess' => esc_html__( 'Browser cache cleared for this admin app.', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_tools_endpoints' ) ) {
	/**
	 * Reuse the existing cleanup REST endpoint.
	 *
	 * @return array
	 */
	function pixassist_get_tools_endpoints() {
		$endpoints = class_exists( 'PixelgradeAssistant_Admin' ) && isset( PixelgradeAssistant_Admin::$internalApiEndpoints )
			? PixelgradeAssistant_Admin::$internalApiEndpoints
			: array();

		return array(
			'cleanup' => isset( $endpoints['cleanup'] ) && is_array( $endpoints['cleanup'] )
				? $endpoints['cleanup']
				: array(),
		);
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_tools_tab' );
}
