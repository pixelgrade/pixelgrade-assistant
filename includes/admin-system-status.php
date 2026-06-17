<?php
/**
 * The secondary System Status tab: diagnostics inside the Appearance -> Pixelgrade hub.
 *
 * This tab is the modern hub counterpart of the legacy system-status dashboard card. It reuses the
 * existing PixelgradeAssistant_DataCollector payload and the existing data_collect REST endpoints;
 * the React tab only renders and toggles the already-owned diagnostics setting.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_system_status_tab' ) ) {
	/**
	 * Register the secondary System Status tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the System Status tab appended.
	 */
	function pixassist_register_system_status_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'system-status',
			'label'      => esc_html__( 'System Status', '__plugin_txtd' ),
			'capability' => 'manage_options',
			'component'  => 'systemStatus',
			'gate'       => '',
			'group'      => 'secondary',
			'order'      => 10,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_system_status_data' ) ) {
	/**
	 * Build the bootstrap payload the System Status tab renders.
	 *
	 * @return array {
	 *     @type array $status        Existing PixelgradeAssistant_DataCollector diagnostics payload.
	 *     @type array $copy          Labels and helper copy derived from systemStatus l10n.
	 *     @type array $endpoints     Existing data_collect REST endpoints.
	 *     @type string $siteHealthUrl Core Site Health URL.
	 * }
	 */
	function pixassist_get_system_status_data() {
		return array(
			'status'        => pixassist_get_system_status_snapshot(),
			'copy'          => pixassist_get_system_status_copy( pixassist_get_system_status_config() ),
			'endpoints'     => pixassist_get_system_status_endpoints(),
			'siteHealthUrl' => function_exists( 'admin_url' ) ? admin_url( 'site-health.php' ) : '',
		);
	}
}

if ( ! function_exists( 'pixassist_get_system_status_snapshot' ) ) {
	/**
	 * Read the existing diagnostics payload when the data collector is available.
	 *
	 * @return array
	 */
	function pixassist_get_system_status_snapshot() {
		if ( class_exists( 'PixelgradeAssistant_DataCollector' )
			&& method_exists( 'PixelgradeAssistant_DataCollector', 'get_system_status_data' ) ) {
			$status = PixelgradeAssistant_DataCollector::get_system_status_data();

			return is_array( $status ) ? $status : array( 'allowDataCollect' => false );
		}

		return array( 'allowDataCollect' => false );
	}
}

if ( ! function_exists( 'pixassist_get_system_status_config' ) ) {
	/**
	 * Read Assistant's existing merged config when the admin class is available.
	 *
	 * @return array
	 */
	function pixassist_get_system_status_config() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_config' ) ) {
			$config = PixelgradeAssistant_Admin::get_config();

			return is_array( $config ) ? $config : array();
		}

		return array();
	}
}

if ( ! function_exists( 'pixassist_get_system_status_copy' ) ) {
	/**
	 * Extract System Status copy from the legacy config, with safe defaults.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return array
	 */
	function pixassist_get_system_status_copy( $config ) {
		$l10n = isset( $config['systemStatus']['l10n'] ) && is_array( $config['systemStatus']['l10n'] )
			? $config['systemStatus']['l10n']
			: array();

		return array(
			'title'           => isset( $l10n['title'] ) ? (string) $l10n['title'] : esc_html__( 'System Status', '__plugin_txtd' ),
			'description'     => isset( $l10n['description'] ) ? (string) $l10n['description'] : esc_html__( 'Review your WordPress installation, server details, and active plugins.', '__plugin_txtd' ),
			'collectLabel'    => isset( $l10n['allowDataCollectText'] ) ? (string) $l10n['allowDataCollectText'] : esc_html__( 'Allow diagnostic data collection', '__plugin_txtd' ),
			'collectEnabled'  => isset( $l10n['allowDataCollectStatusText'] ) ? (string) $l10n['allowDataCollectStatusText'] : esc_html__( 'Diagnostic data collection is enabled.', '__plugin_txtd' ),
			'collectDisabled' => isset( $l10n['disallowDataCollectText'] ) ? (string) $l10n['disallowDataCollectText'] : esc_html__( 'Diagnostic data collection is disabled.', '__plugin_txtd' ),
			'enable'          => esc_html__( 'Enable', '__plugin_txtd' ),
			'disable'         => esc_html__( 'Disable', '__plugin_txtd' ),
			'refresh'         => esc_html__( 'Refresh data', '__plugin_txtd' ),
			'siteHealth'      => esc_html__( 'Open Site Health', '__plugin_txtd' ),
			'empty'           => esc_html__( 'No diagnostic rows are available yet.', '__plugin_txtd' ),
			'unavailable'     => esc_html__( 'Enable diagnostic data collection to show installation and system details.', '__plugin_txtd' ),
			'sections'        => array(
				'installation'  => isset( $l10n['tableWPDataTitle'] ) ? (string) $l10n['tableWPDataTitle'] : esc_html__( 'WordPress Installation', '__plugin_txtd' ),
				'system'        => isset( $l10n['tableSystemDataTitle'] ) ? (string) $l10n['tableSystemDataTitle'] : esc_html__( 'System', '__plugin_txtd' ),
				'activePlugins' => isset( $l10n['tableActivePluginsTitle'] ) ? (string) $l10n['tableActivePluginsTitle'] : esc_html__( 'Active Plugins', '__plugin_txtd' ),
			),
		);
	}
}

if ( ! function_exists( 'pixassist_get_system_status_endpoints' ) ) {
	/**
	 * Reuse the existing data_collect REST endpoints.
	 *
	 * @return array
	 */
	function pixassist_get_system_status_endpoints() {
		$endpoints = class_exists( 'PixelgradeAssistant_Admin' ) && isset( PixelgradeAssistant_Admin::$internalApiEndpoints )
			? PixelgradeAssistant_Admin::$internalApiEndpoints
			: array();

		return array(
			'dataCollect' => isset( $endpoints['dataCollect'] ) && is_array( $endpoints['dataCollect'] )
				? $endpoints['dataCollect']
				: array(),
		);
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_system_status_tab' );
}
