<?php
/**
 * Minimal context attached to functional Pixelgrade service requests.
 *
 * @package PixelgradeAssistant
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_normalize_service_name' ) ) {
	/**
	 * Normalize an observed service name into a bounded storage key.
	 *
	 * @param string $service Service name.
	 *
	 * @return string
	 */
	function pixassist_normalize_service_name( $service ) {
		$service = strtolower( trim( (string) $service ) );
		$service = preg_replace( '/[^a-z0-9_-]+/', '_', $service );
		$service = trim( (string) $service, '_-' );

		return substr( $service, 0, 64 );
	}
}

if ( ! function_exists( 'pixassist_get_service_request_context' ) ) {
	/**
	 * Build the allowlisted context shared by first-party service requests.
	 *
	 * The site URL is intentionally identifying operational data. Do not add
	 * credentials, license hashes, emails, user names, content, support details,
	 * admin URLs, or IP addresses to this payload.
	 *
	 * @param string $service Observed service request name.
	 *
	 * @return array
	 */
	function pixassist_get_service_request_context( $service ) {
		$site_url = function_exists( 'home_url' ) ? rtrim( (string) home_url( '/' ), '/' ) . '/' : '';
		if ( function_exists( 'esc_url_raw' ) ) {
			$site_url = esc_url_raw( $site_url );
		}

		$theme_slug = function_exists( 'get_template' ) ? (string) get_template() : '';
		$theme_data = array(
			'slug' => $theme_slug,
		);

		if ( function_exists( 'wp_get_theme' ) ) {
			$theme = wp_get_theme( $theme_slug );
			if ( ! function_exists( 'is_wp_error' ) || ! is_wp_error( $theme ) ) {
				$theme_data['name']    = (string) $theme->get( 'Name' );
				$theme_data['version'] = (string) $theme->get( 'Version' );
			}
		}

		if ( function_exists( 'apply_filters' ) ) {
			$wupdates_ids = apply_filters( 'wupdates_gather_ids', array() );
			if ( is_array( $wupdates_ids ) && ! empty( $wupdates_ids[ $theme_slug ]['id'] ) ) {
				$theme_identity = $wupdates_ids[ $theme_slug ];
				$theme_data['wupdates'] = array(
					'id'   => (string) $theme_identity['id'],
					'type' => ! empty( $theme_identity['type'] ) ? (string) $theme_identity['type'] : 'theme',
					'slug' => ! empty( $theme_identity['slug'] ) ? (string) $theme_identity['slug'] : $theme_slug,
					'name' => ! empty( $theme_identity['name'] ) ? (string) $theme_identity['name'] : ( isset( $theme_data['name'] ) ? $theme_data['name'] : '' ),
				);
			}
		}

		$environment_type = function_exists( 'wp_get_environment_type' ) ? (string) wp_get_environment_type() : 'production';
		if ( ! in_array( $environment_type, array( 'local', 'development', 'staging', 'production' ), true ) ) {
			$environment_type = 'production';
		}

		$context = array(
			'site_url'   => $site_url,
			'service'    => pixassist_normalize_service_name( $service ),
			'theme_data' => $theme_data,
			'site_data'  => array(
				'url'              => $site_url,
				'is_ssl'           => function_exists( 'is_ssl' ) ? (bool) is_ssl() : 0 === strpos( strtolower( $site_url ), 'https://' ),
				'environment_type' => $environment_type,
				'wp'               => array(
					'version'  => function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'version' ) : '',
					'language' => function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'language' ) : '',
					'rtl'      => function_exists( 'is_rtl' ) ? (bool) is_rtl() : false,
				),
				'pixelgrade_assistant' => array(
					'version' => defined( 'PIXELGRADE_ASSISTANT__VERSION' ) ? (string) PIXELGRADE_ASSISTANT__VERSION : '',
				),
			),
		);

		if ( function_exists( 'pixassist_get_account' ) ) {
			$account = pixassist_get_account();
			if ( ! empty( $account['is_connected'] ) && ! empty( $account['pixelgrade_user_id'] ) ) {
				$context['customer_data'] = array(
					'id' => abs( (int) $account['pixelgrade_user_id'] ),
				);
			}
		}

		/**
		 * Filters the minimal context attached to a functional Pixelgrade request.
		 *
		 * Keep additions inside the documented operational-data boundary.
		 *
		 * @param array  $context Service context.
		 * @param string $service Normalized service name.
		 */
		if ( function_exists( 'apply_filters' ) ) {
			$context = apply_filters( 'pixassist_service_request_context', $context, $context['service'] );
		}

		return is_array( $context ) ? $context : array();
	}
}

if ( ! function_exists( 'pixassist_add_service_request_context' ) ) {
	/**
	 * Merge service context into an existing request while preserving caller data.
	 *
	 * @param array  $request_data Existing request data.
	 * @param string $service      Observed service request name.
	 *
	 * @return array
	 */
	function pixassist_add_service_request_context( $request_data, $service ) {
		if ( ! is_array( $request_data ) ) {
			$request_data = array();
		}

		return array_replace_recursive( pixassist_get_service_request_context( $service ), $request_data );
	}
}

if ( ! function_exists( 'pixassist_add_service_context_to_http_request' ) ) {
	/**
	 * Attach context to existing server-side requests for Pixelgrade starter data.
	 *
	 * @param array  $args HTTP request arguments.
	 * @param string $url  Request URL.
	 *
	 * @return array
	 */
	function pixassist_add_service_context_to_http_request( $args, $url ) {
		if ( ! is_array( $args ) || ! is_string( $url ) ) {
			return $args;
		}

		$url_parts = function_exists( 'wp_parse_url' ) ? wp_parse_url( $url ) : parse_url( $url );
		$host      = ! empty( $url_parts['host'] ) ? strtolower( (string) $url_parts['host'] ) : '';
		$path      = ! empty( $url_parts['path'] ) ? (string) $url_parts['path'] : '';
		$is_pixelgrade_host = 'pixelgrade.com' === $host || ( strlen( $host ) > 15 && '.pixelgrade.com' === substr( $host, -15 ) );
		if ( ! $is_pixelgrade_host || false === strpos( $path, '/wp-json/sce/v' ) ) {
			return $args;
		}

		$service_routes = array(
			'layout-unit-bundles' => 'layout_unit_bundles_requested',
			'layout-units'        => 'layout_units_requested',
			'mi-data'             => 'starter_required_manifest_requested',
			'data'                => 'starter_manifest_requested',
			'posts'               => 'starter_posts_requested',
		);
		$route = trim( basename( rtrim( $path, '/' ) ) );
		if ( empty( $service_routes[ $route ] ) ) {
			return $args;
		}

		$body        = isset( $args['body'] ) ? $args['body'] : array();
		$body_format = 'array';
		if ( is_string( $body ) && '' !== $body ) {
			$decoded = json_decode( $body, true );
			if ( is_array( $decoded ) ) {
				$body        = $decoded;
				$body_format = 'json';
			} else {
				$parsed = array();
				parse_str( $body, $parsed );
				if ( empty( $parsed ) ) {
					return $args;
				}
				$body = $parsed;
			}
		} elseif ( ! is_array( $body ) ) {
			return $args;
		}

		$body = pixassist_add_service_request_context( $body, $service_routes[ $route ] );
		$args['body'] = 'json' === $body_format
			? ( function_exists( 'wp_json_encode' ) ? wp_json_encode( $body ) : json_encode( $body ) )
			: $body;

		return $args;
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'http_request_args', 'pixassist_add_service_context_to_http_request', 10, 2 );
}
