<?php
/**
 * Handle the plugin's behavior when Customify is present.
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add customer data to Style Manager cloud request data.
 *
 * @param array $request_data
 *
 * @return array
 */
function pixassist_add_customer_data_to_customify_cloud_request_data( $request_data ) {
	// Get the connected pixelgrade user id
	$connection_user = PixelgradeAssistant_Admin::get_theme_activation_user();
	if ( empty( $connection_user ) || empty( $connection_user->ID ) ) {
		return $request_data;
	}

	$user_id = get_user_meta( $connection_user->ID, 'pixassist_user_ID', true );
	if ( empty( $user_id ) ) {
		// not authenticated
		return $request_data;
	}

	if ( empty( $request_data['customer_data'] ) ) {
		$request_data['customer_data'] = array();
	}
	$request_data['customer_data']['id'] = absint( $user_id );

	return $request_data;
}
add_filter( 'customify_pixelgrade_cloud_request_data', 'pixassist_add_customer_data_to_customify_cloud_request_data', 10, 1 );
add_filter( 'pixelgrade_cloud_request_data', 'pixassist_add_customer_data_to_customify_cloud_request_data', 10, 1 );

/**
 * Add site data to Style Manager cloud request data.
 *
 * @param array $site_data
 *
 * @return array
 */
function pixassist_add_site_data_to_customify_cloud_request_data( $site_data ) {
	if ( empty( $site_data['wp'] ) ) {
		$site_data['wp'] = array();
	}

	$site_data['wp']['language'] = get_bloginfo('language');
	$site_data['wp']['rtl'] = is_rtl();
	$site_data['environment_type'] = function_exists( 'wp_get_environment_type' ) ? wp_get_environment_type() : 'production';
	$site_data['pixelgrade_assistant'] = array(
		'version' => defined( 'PIXELGRADE_ASSISTANT__VERSION' ) ? PIXELGRADE_ASSISTANT__VERSION : '',
	);

	return $site_data;
}
add_filter( 'customify_style_manager_get_site_data', 'pixassist_add_site_data_to_customify_cloud_request_data', 10, 1 );
// Standalone Style Manager fires the modern `style_manager/get_site_data` with no legacy alias,
// so register on it too (mirroring the dual registration for customer data above). Without this,
// the `wp.language`/`wp.rtl` enrichment never reaches Style Manager's cloud requests.
add_filter( 'style_manager/get_site_data', 'pixassist_add_site_data_to_customify_cloud_request_data', 10, 1 );

function pixassist_add_cloud_stats_endpoint( $config ) {
	// Guard the constant: it is defined by Style Manager / Care, which may not be present.
	if ( defined( 'PIXELGRADE_CLOUD__API_BASE' ) && empty( $config['cloud']['stats'] ) ) {
		$config['cloud']['stats'] = array(
			'method' => 'POST',
			'url' => PIXELGRADE_CLOUD__API_BASE . 'wp-json/pixcloud/v1/front/stats',
		);
	}

	return  $config;
}
add_filter( 'customify_style_manager_external_api_endpoints', 'pixassist_add_cloud_stats_endpoint', 10, 1 );

/**
 * Palette-publish cloud stats relay — intentionally retired.
 *
 * Care relayed color-palette stats to the cloud on Customizer publish, hooking
 * `customify_style_manager_updated_custom_palette_in_use` and sending via
 * `Customify_Cloud_Api`. Standalone Style Manager fires
 * `style_manager/updated_custom_font_palette_in_use` instead and ships no
 * `Customify_Cloud_Api`, so this callback had been dead since the
 * Customify -> Style Manager migration. It is retired rather than re-homed:
 * it was opt-in-only telemetry, re-homing would require a new cloud transport
 * (Style Manager's cloud client is dependency-injected, not statically
 * accessible), and that runs against Assistant's community-first, opt-in data
 * stance. See .ai/gap-audit (finding A5).
 */
