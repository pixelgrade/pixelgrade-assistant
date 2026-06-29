<?php
/**
 * The Page Patterns tab: import reusable page-like content from starter sources.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_content_patterns_tab' ) ) {
	/**
	 * Register the Page Patterns tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Page Patterns tab appended.
	 */
	function pixassist_register_content_patterns_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'content',
			'label'      => esc_html__( 'Page Patterns', '__plugin_txtd' ),
			'capability' => 'manage_options',
			'component'  => 'contentPatterns',
			'gate'       => '',
			'order'      => 40,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_content_patterns_data' ) ) {
	/**
	 * Build the bootstrap payload the Page Patterns tab renders.
	 *
	 * @return array
	 */
	function pixassist_get_content_patterns_data() {
		return array(
			'copy'      => pixassist_get_content_patterns_copy(),
			'sources'   => pixassist_get_content_patterns_sources(),
			'endpoints' => pixassist_get_content_patterns_endpoints(),
			'applied'   => pixassist_get_content_patterns_applied(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_content_patterns_copy' ) ) {
	/**
	 * Build Page Patterns tab copy.
	 *
	 * @return array
	 */
	function pixassist_get_content_patterns_copy() {
		return array(
			'title'          => esc_html__( 'Page Patterns', '__plugin_txtd' ),
			'description'    => esc_html__( 'Import one reusable page, post, project, or service-style content example without importing a full starter site.', '__plugin_txtd' ),
			'sourceLabel'    => esc_html__( 'Source', '__plugin_txtd' ),
			'typeLabel'      => esc_html__( 'Type', '__plugin_txtd' ),
			'allSources'     => esc_html__( 'All sources', '__plugin_txtd' ),
			'allTypes'       => esc_html__( 'All types', '__plugin_txtd' ),
			'searchLabel'    => esc_html__( 'Search page patterns', '__plugin_txtd' ),
			'loadLabel'      => esc_html__( 'Load page patterns', '__plugin_txtd' ),
			'refreshLabel'   => esc_html__( 'Refresh', '__plugin_txtd' ),
			'loading'        => esc_html__( 'Loading page patterns...', '__plugin_txtd' ),
			'empty'          => esc_html__( 'No page patterns are available from these sources.', '__plugin_txtd' ),
			'emptyFiltered'  => esc_html__( 'No page patterns match these filters.', '__plugin_txtd' ),
			'failure'        => esc_html__( 'Page patterns could not be loaded. Please try again.', '__plugin_txtd' ),
			'partialFailure' => esc_html__( 'Some page-pattern sources could not be loaded.', '__plugin_txtd' ),
			'importLabel'    => esc_html__( 'Apply', '__plugin_txtd' ),
			'replaceLabel'   => esc_html__( 'Replace', '__plugin_txtd' ),
			'importing'      => esc_html__( 'Applying page pattern...', '__plugin_txtd' ),
			'importSuccess'  => esc_html__( 'Page pattern applied.', '__plugin_txtd' ),
			'importFailure'  => esc_html__( 'Page pattern could not be applied. Please try again.', '__plugin_txtd' ),
			'undoLabel'      => esc_html__( 'Remove', '__plugin_txtd' ),
			'undoing'        => esc_html__( 'Removing page pattern...', '__plugin_txtd' ),
			'undoSuccess'    => esc_html__( 'Page pattern removed.', '__plugin_txtd' ),
			'undoFailure'    => esc_html__( 'Page pattern could not be removed. Please try again.', '__plugin_txtd' ),
			'appliedTitle'   => esc_html__( 'Applied page patterns', '__plugin_txtd' ),
			'appliedEmpty'   => esc_html__( 'No page patterns are applied yet.', '__plugin_txtd' ),
			'appliedLabel'   => esc_html__( 'Applied', '__plugin_txtd' ),
			'lockedLabel'    => esc_html__( 'Unavailable', '__plugin_txtd' ),
			'mediaLabel'     => esc_html__( 'media', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_content_patterns_sources' ) ) {
	/**
	 * Collect starter sources that can provide content units.
	 *
	 * @return array[]
	 */
	function pixassist_get_content_patterns_sources() {
		$starters = function_exists( 'pixassist_get_admin_hub_starters' ) ? pixassist_get_admin_hub_starters() : array();
		if ( ! is_array( $starters ) ) {
			return array();
		}

		$sources = array();
		foreach ( $starters as $starter ) {
			if ( empty( $starter['id'] ) || empty( $starter['baseRestUrl'] ) ) {
				continue;
			}

			$role = ! empty( $starter['role'] ) ? sanitize_key( $starter['role'] ) : 'starter';
			if ( 'library' === $role ) {
				continue;
			}

			$sources[] = array(
				'id'          => sanitize_key( $starter['id'] ),
				'title'       => ! empty( $starter['title'] ) ? wp_strip_all_tags( $starter['title'] ) : sanitize_key( $starter['id'] ),
				'description' => ! empty( $starter['description'] ) ? wp_strip_all_tags( $starter['description'] ) : '',
				'baseRestUrl' => esc_url_raw( $starter['baseRestUrl'] ),
				'gate'        => isset( $starter['gate'] ) ? sanitize_key( $starter['gate'] ) : '',
			);
		}

		return $sources;
	}
}

if ( ! function_exists( 'pixassist_get_content_patterns_endpoints' ) ) {
	/**
	 * Expose the content-unit REST endpoints.
	 *
	 * @return array
	 */
	function pixassist_get_content_patterns_endpoints() {
		$endpoints = array(
			'contentUnits' => array(
				'method' => 'POST',
				'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/content_units' ) ) : '',
			),
			'importContentUnit' => array(
				'method' => 'POST',
				'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/import_content_unit' ) ) : '',
			),
			'undoContentUnit' => array(
				'method' => 'POST',
				'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/undo_content_unit' ) ) : '',
			),
		);

		if ( class_exists( 'PixelgradeAssistant_Admin' )
			&& isset( PixelgradeAssistant_Admin::$internalApiEndpoints )
			&& is_array( PixelgradeAssistant_Admin::$internalApiEndpoints ) ) {
			foreach ( array( 'contentUnits', 'importContentUnit', 'undoContentUnit' ) as $key ) {
				if ( ! empty( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) && is_array( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) ) {
					$endpoints[ $key ] = PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ];
				}
			}
		}

		return $endpoints;
	}
}

if ( ! function_exists( 'pixassist_get_content_patterns_applied' ) ) {
	/**
	 * Return the currently applied page patterns.
	 *
	 * @return array
	 */
	function pixassist_get_content_patterns_applied() {
		if ( function_exists( 'PixelgradeAssistant' ) ) {
			$plugin = PixelgradeAssistant();
			if ( ! empty( $plugin->starter_content ) && method_exists( $plugin->starter_content, 'get_applied_content_units' ) ) {
				return $plugin->starter_content->get_applied_content_units();
			}
		}

		return array();
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_content_patterns_tab' );
}
