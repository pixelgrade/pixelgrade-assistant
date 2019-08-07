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

	return $site_data;
}
add_filter( 'customify_style_manager_get_site_data', 'pixassist_add_site_data_to_customify_cloud_request_data', 10, 1 );

function pixassist_add_cloud_stats_endpoint( $config ) {
	if ( empty( $config['cloud']['stats'] ) ) {
		$config['cloud']['stats'] = array(
			'method' => 'POST',
			'url' => PIXELGRADE_CLOUD__API_BASE . 'wp-json/pixcloud/v1/front/stats',
		);
	}

	return  $config;
}
add_filter( 'customify_style_manager_external_api_endpoints', 'pixassist_add_cloud_stats_endpoint', 10, 1 );

/**
 * Send Color Palettes data when updating if a custom color palette is in use (on Customizer settings save - Publish).
 *
 * @param bool $custom_palette
 */
function pixassist_send_cloud_stats( $custom_palette ) {
	if ( class_exists( 'Customify_Cloud_Api' ) && ! empty( Customify_Cloud_Api::$externalApiEndpoints['cloud']['stats'] ) ) {
		$cloud_api = new Customify_Cloud_Api();
		$cloud_api->send_stats();
		return;
	}
}
add_action( 'customify_style_manager_updated_custom_palette_in_use', 'pixassist_send_cloud_stats', 10, 1 );
