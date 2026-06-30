<?php
/**
 * The granular Layouts tab: import one template or template part from a starter.
 *
 * This is the MVP hub surface for composable starter layouts. It lists starter sources and delegates
 * unit discovery/import to the Starter Content REST endpoints.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_layout_units_tab' ) ) {
	/**
	 * Register the Layouts tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Layouts tab appended.
	 */
	function pixassist_register_layout_units_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'layouts',
			'label'      => esc_html__( 'Layouts', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'layoutUnits',
			'gate'       => '',
			'order'      => 35,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_data' ) ) {
	/**
	 * Build the bootstrap payload the Layouts tab renders.
	 *
	 * @return array {
	 *     @type array   $copy      Labels and helper copy.
	 *     @type array[] $sources   Starter sources available for unit import.
	 *     @type array   $endpoints Unit-list and unit-import REST endpoints.
	 * }
	 */
	function pixassist_get_layout_units_data() {
		return array(
			'copy'      => pixassist_get_layout_units_copy(),
			'sources'   => pixassist_get_layout_units_sources(),
			'endpoints' => pixassist_get_layout_units_endpoints(),
			'applied'   => pixassist_get_layout_units_applied(),
			'preview'   => pixassist_get_layout_units_preview(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_preview' ) ) {
	/**
	 * Config the shared <LayoutPreview> iframe + the front-end preview route consume.
	 *
	 * `base` is the site front-end URL; the JS appends the unit descriptor + nonce and loads the
	 * result in a scaled, non-interactive iframe. See
	 * PixelgradeAssistant_StarterContent::maybe_render_layout_unit_preview().
	 *
	 * @return array
	 */
	function pixassist_get_layout_units_preview() {
		return array(
			'base'  => function_exists( 'home_url' ) ? esc_url_raw( home_url( '/' ) ) : '/',
			'param' => 'pixassist_layout_preview',
			'nonce' => function_exists( 'wp_create_nonce' ) ? wp_create_nonce( 'pixassist_layout_preview' ) : '',
			'vw'    => 1200,
		);
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_copy' ) ) {
	/**
	 * Build Layouts tab copy.
	 *
	 * @return array
	 */
	function pixassist_get_layout_units_copy() {
		return array(
			'title'         => esc_html__( 'Layouts', '__plugin_txtd' ),
			'description'   => esc_html__( 'Apply a single reusable part — a header, footer, or full page template — without importing a whole site. For complete ready-made pages, use Page Patterns; for an entire site, use Starter Sites.', '__plugin_txtd' ),
			'sourceLabel'   => esc_html__( 'Source', '__plugin_txtd' ),
			'loadLabel'     => esc_html__( 'Load layouts', '__plugin_txtd' ),
			'loading'       => esc_html__( 'Loading layouts...', '__plugin_txtd' ),
			'empty'         => esc_html__( 'No layouts are available from this source.', '__plugin_txtd' ),
			'failure'       => esc_html__( 'Layouts could not be loaded. Please try again.', '__plugin_txtd' ),
			'importLabel'   => esc_html__( 'Apply', '__plugin_txtd' ),
			'importing'     => esc_html__( 'Applying layout...', '__plugin_txtd' ),
			'importSuccess' => esc_html__( 'Layout applied.', '__plugin_txtd' ),
			'importFailure' => esc_html__( 'Layout could not be applied. Please try again.', '__plugin_txtd' ),
			'undoLabel'     => esc_html__( 'Remove', '__plugin_txtd' ),
			'undoing'       => esc_html__( 'Removing layout...', '__plugin_txtd' ),
			'undoSuccess'   => esc_html__( 'Layout removed.', '__plugin_txtd' ),
			'undoFailure'   => esc_html__( 'Layout could not be removed. Please try again.', '__plugin_txtd' ),
			'appliedTitle'  => esc_html__( 'Applied layouts', '__plugin_txtd' ),
			'appliedEmpty'  => esc_html__( 'No layouts are applied yet.', '__plugin_txtd' ),
			'templateParts' => esc_html__( 'Template parts', '__plugin_txtd' ),
			'templates'     => esc_html__( 'Templates', '__plugin_txtd' ),
			'headers'       => esc_html__( 'Headers', '__plugin_txtd' ),
			'footers'       => esc_html__( 'Footers', '__plugin_txtd' ),
			'templatesType' => esc_html__( 'Templates', '__plugin_txtd' ),
			'features'      => esc_html__( 'Features', '__plugin_txtd' ),
			'featureLabel'  => esc_html__( 'Feature', '__plugin_txtd' ),
			'sampleLabel'   => esc_html__( 'Include sample projects', '__plugin_txtd' ),
			'sourceHeading' => esc_html__( 'Source', '__plugin_txtd' ),
			'premiumLabel'  => esc_html__( 'Premium', '__plugin_txtd' ),
			'freeLabel'     => esc_html__( 'Free', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_sources' ) ) {
	/**
	 * Collect starter sources that can provide layout units.
	 *
	 * @return array[]
	 */
	function pixassist_get_layout_units_sources() {
		$starters = function_exists( 'pixassist_get_admin_hub_starters' ) ? pixassist_get_admin_hub_starters() : array();
		if ( ! is_array( $starters ) ) {
			return array();
		}

		$sources = array();
		foreach ( $starters as $starter ) {
			if ( empty( $starter['id'] ) || empty( $starter['baseRestUrl'] ) ) {
				continue;
			}

			$sources[] = array(
				'id'          => sanitize_key( $starter['id'] ),
				'title'       => ! empty( $starter['title'] ) ? wp_strip_all_tags( $starter['title'] ) : sanitize_key( $starter['id'] ),
				'baseRestUrl' => esc_url_raw( $starter['baseRestUrl'] ),
				'gate'        => isset( $starter['gate'] ) ? sanitize_key( $starter['gate'] ) : '',
			);
		}

		return $sources;
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_endpoints' ) ) {
	/**
	 * Expose the granular layout REST endpoints.
	 *
	 * @return array
	 */
	function pixassist_get_layout_units_endpoints() {
		$endpoints = array(
			'layoutUnits' => array(
				'method' => 'POST',
				'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/layout_units' ) ) : '',
			),
				'prewarmUnitBundles' => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/prewarm_unit_bundles' ) ) : '',
				),
				'importUnit'  => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/import_unit' ) ) : '',
				),
				'queueUnit'   => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/queue_unit' ) ) : '',
				),
				'unitJobStatus' => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/unit_job_status' ) ) : '',
				),
				'undoUnit'    => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/undo_unit' ) ) : '',
				),
			);

		if ( class_exists( 'PixelgradeAssistant_Admin' )
			&& isset( PixelgradeAssistant_Admin::$internalApiEndpoints )
			&& is_array( PixelgradeAssistant_Admin::$internalApiEndpoints ) ) {
				foreach ( array( 'layoutUnits', 'prewarmUnitBundles', 'importUnit', 'queueUnit', 'unitJobStatus', 'undoUnit' ) as $key ) {
					if ( ! empty( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) && is_array( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) ) {
						$endpoints[ $key ] = PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ];
					}
			}
		}

		return $endpoints;
	}
}

if ( ! function_exists( 'pixassist_get_layout_units_applied' ) ) {
	/**
	 * Return the currently applied granular layouts.
	 *
	 * @return array
	 */
	function pixassist_get_layout_units_applied() {
		if ( function_exists( 'PixelgradeAssistant' ) ) {
			$plugin = PixelgradeAssistant();
			if ( ! empty( $plugin->starter_content ) && method_exists( $plugin->starter_content, 'get_applied_layout_units' ) ) {
				return $plugin->starter_content->get_applied_layout_units();
			}
		}

		return array();
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_layout_units_tab' );
}
