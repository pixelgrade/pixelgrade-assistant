<?php
/**
 * Pins the granular layout-unit import contract.
 *
 * Standalone: run with `php tests/layout-unit-import-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/fixtures/wp/' );
define( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN', 'pixelgrade.test' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_actions']               = array();
$GLOBALS['paf_filters']               = array();
$GLOBALS['paf_pixassist_options']     = array();
$GLOBALS['paf_pixassist_db_options']  = array();
$GLOBALS['paf_theme_mods']            = array();
$GLOBALS['paf_wp_options']            = array();
$GLOBALS['paf_transients']            = array();
$GLOBALS['paf_remote_requests']       = array();
$GLOBALS['paf_remote_multiple_requests'] = array();
$GLOBALS['paf_inserted_posts']        = array();
$GLOBALS['paf_updated_posts']         = array();
$GLOBALS['paf_deleted_posts']         = array();
$GLOBALS['paf_post_meta']             = array();
$GLOBALS['paf_post_meta_updates']     = array();
$GLOBALS['paf_object_terms']          = array();
$GLOBALS['paf_inserted_terms']        = array();
$GLOBALS['paf_deleted_terms']         = array();
$GLOBALS['paf_term_meta']             = array();
$GLOBALS['paf_attachment_metadata']   = array();
$GLOBALS['paf_deleted_attachments']   = array();
$GLOBALS['paf_uploaded_bits']         = array();
$GLOBALS['paf_inserted_attachments']  = array();
$GLOBALS['paf_remote_media_failures'] = array();
$GLOBALS['paf_bundle_endpoint_status'] = 0;
$GLOBALS['paf_layout_units_endpoint_status'] = 404;
$GLOBALS['paf_rest_routes']           = array();
$GLOBALS['paf_downloads']             = array();
$GLOBALS['paf_sideloads']             = array();
$GLOBALS['paf_next_post_id']          = 1000;
$GLOBALS['paf_next_attachment_id']    = 3000;
$GLOBALS['paf_terms_by_name']         = array();

if ( ! class_exists( 'WP_REST_Server' ) ) {
	class WP_REST_Server {
		const CREATABLE = 'POST';
	}
}

if ( ! class_exists( 'Requests' ) ) {
	class Requests {
		public static function request_multiple( $requests, $options = array() ) {
			$GLOBALS['paf_remote_multiple_requests'][] = $requests;

			$responses = array();
			foreach ( $requests as $key => $request ) {
				$url = isset( $request['url'] ) ? $request['url'] : '';
				if ( false !== strpos( $url, '/wp-json/sce/v2/layout-units' ) ) {
					if ( ! empty( $GLOBALS['paf_layout_units_endpoint_status'] ) ) {
						$responses[ $key ] = new PAF_Requests_Response( array( 'code' => 'not_found' ), (int) $GLOBALS['paf_layout_units_endpoint_status'] );
						continue;
					}

					$responses[ $key ] = new PAF_Requests_Response( paf_remote_layout_units( $url, array() ) );
					continue;
				}

				$responses[ $key ] = new PAF_Requests_Response( array(), 404 );
			}

			return $responses;
		}
	}
}

class PAF_Requests_Response {
	public $body;
	public $status_code;
	public $reason_phrase = 'OK';
	public $headers = array();

	public function __construct( $body, $status_code = 200 ) {
		$this->body        = wp_json_encode( $body );
		$this->status_code = (int) $status_code;
	}
}

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_actions'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function remove_filter( $hook, $callback, $priority = 10 ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return false;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $index => $entry ) {
		if ( $entry['callback'] === $callback ) {
			unset( $GLOBALS['paf_filters'][ $hook ][ $index ] );

			return true;
		}
	}

	return false;
}

function remove_action( $hook, $callback, $priority = 10 ) {
	if ( empty( $GLOBALS['paf_actions'][ $hook ] ) ) {
		return false;
	}

	foreach ( $GLOBALS['paf_actions'][ $hook ] as $index => $entry ) {
		if ( $entry['callback'] === $callback ) {
			unset( $GLOBALS['paf_actions'][ $hook ][ $index ] );

			return true;
		}
	}

	return false;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$args[0]   = $value;
		$accepted  = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$value     = call_user_func_array( $entry['callback'], array_slice( $args, 0, max( 1, $accepted ) ) );
		$args[0]   = $value;
	}

	return $value;
}

function do_action( $hook ) {
	if ( empty( $GLOBALS['paf_actions'][ $hook ] ) ) {
		return;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_actions'][ $hook ] as $entry ) {
		$accepted = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		call_user_func_array( $entry['callback'], array_slice( $args, 0, max( 0, $accepted ) ) );
	}
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_html( $text ) {
	return (string) $text;
}

function sanitize_text_field( $value ) {
	return trim( wp_strip_all_tags( (string) $value ) );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function trailingslashit( $value ) {
	return rtrim( (string) $value, '/' ) . '/';
}

function untrailingslashit( $value ) {
	return rtrim( (string) $value, '/' );
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}

function wp_basename( $path ) {
	return basename( (string) $path );
}

function absint( $value ) {
	return abs( (int) $value );
}

function is_wp_error( $value ) {
	return $value instanceof WP_Error;
}

function rest_ensure_response( $value ) {
	return $value;
}

function register_rest_route( $namespace, $route, $args = array() ) {
	$GLOBALS['paf_rest_routes'][ trailingslashit( $namespace ) . ltrim( $route, '/' ) ] = $args;

	return true;
}

function wp_unslash( $value ) {
	return $value;
}

function wp_slash( $value ) {
	return $value;
}

function wp_slash_strings_only( $value ) {
	return $value;
}

function maybe_unserialize( $value ) {
	if ( ! is_string( $value ) ) {
		return $value;
	}

	$unserialized = @unserialize( $value );

	return false === $unserialized && 'b:0;' !== $value ? $value : $unserialized;
}

function wp_json_encode( $value ) {
	return json_encode( $value );
}

function current_user_can( $capability ) {
	return true;
}

function wp_verify_nonce( $nonce, $action ) {
	return 'nonce' === $nonce && 'pixelgrade_assistant_rest' === $action;
}

function set_transient( $key, $value, $expiration = 0 ) {
	$GLOBALS['paf_transients'][ $key ] = $value;

	return true;
}

function get_transient( $key ) {
	return array_key_exists( $key, $GLOBALS['paf_transients'] ) ? $GLOBALS['paf_transients'][ $key ] : false;
}

function delete_transient( $key ) {
	unset( $GLOBALS['paf_transients'][ $key ] );

	return true;
}

	function wp_remote_request( $url, $args = array() ) {
		$preempt = apply_filters( 'pre_http_request', false, $args, $url );
		if ( false !== $preempt ) {
			return $preempt;
	}

	$GLOBALS['paf_remote_requests'][] = array( $url, $args );

	if ( false !== strpos( $url, '/layout-unit-bundles' ) ) {
		if ( ! empty( $GLOBALS['paf_bundle_endpoint_status'] ) ) {
			return paf_remote_response( array( 'code' => 'not_found' ), (int) $GLOBALS['paf_bundle_endpoint_status'] );
		}

		return paf_remote_response( paf_remote_layout_unit_bundles( $url, $args ) );
	}

	if ( false !== strpos( $url, '/posts' ) ) {
		$post_type = isset( $args['body']['post_type'] ) ? $args['body']['post_type'] : '';
		$include   = isset( $args['body']['include'] ) ? $args['body']['include'] : '';
		$posts     = paf_remote_posts( $post_type, $url );

		if ( ! empty( $include ) ) {
			$ids   = array_map( 'intval', (array) $include );
			$posts = array_values(
				array_filter(
					$posts,
					function ( $post ) use ( $ids ) {
						return in_array( (int) $post['ID'], $ids, true );
					}
				)
			);
		}

		return paf_remote_response(
			array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'posts' => $posts,
				),
			)
		);
	}

	if ( false !== strpos( $url, '/terms' ) ) {
		$taxonomy = isset( $args['body']['taxonomy'] ) ? $args['body']['taxonomy'] : 'nav_menu';
		$terms    = array(
			array(
				'term_id'     => 18,
				'name'        => 'Primary',
				'slug'        => 'primary',
				'taxonomy'    => 'nav_menu',
				'description' => '',
				'parent'      => 0,
				'meta'        => array(),
			),
		);

		if ( 'portfolio_type' === $taxonomy ) {
			$terms = array(
				array(
					'term_id'     => 31,
					'name'        => 'Architecture',
					'slug'        => 'architecture',
					'taxonomy'    => 'portfolio_type',
					'description' => '',
					'parent'      => 0,
					'meta'        => array(),
				),
				array(
					'term_id'     => 32,
					'name'        => 'Interiors',
					'slug'        => 'interiors',
					'taxonomy'    => 'portfolio_type',
					'description' => '',
					'parent'      => 0,
					'meta'        => array(),
				),
			);
		}

		return paf_remote_response(
			array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'terms' => $terms,
				),
			)
		);
	}

		return paf_remote_response( array( 'code' => 'not_found' ), 404 );
	}

	function wp_remote_post( $url, $args = array() ) {
		return wp_remote_request( $url, $args );
	}

	function rest_url( $path = '' ) {
		return 'https://local.test/wp-json/' . ltrim( (string) $path, '/' );
	}

	function wp_generate_password( $length = 12, $special_chars = true, $extra_special_chars = false ) {
		return substr( str_repeat( 'pafpass', 4 ), 0, (int) $length );
	}

function wp_remote_get( $url, $args = array() ) {
	$GLOBALS['paf_remote_requests'][] = array( $url, $args );

	if ( false !== strpos( $url, '/wp-json/sce/v2/layout-units' ) ) {
		if ( ! empty( $GLOBALS['paf_layout_units_endpoint_status'] ) ) {
			return paf_remote_response( array( 'code' => 'not_found' ), (int) $GLOBALS['paf_layout_units_endpoint_status'] );
		}

		return paf_remote_response( paf_remote_layout_units( $url, $args ) );
	}

	if ( false !== strpos( $url, '/wp-json/sce/v2/data' ) ) {
		if ( false !== strpos( $url, 'broken-data.test' ) ) {
			return paf_remote_response( array( 'code' => 'server_error' ), 500 );
		}

		return paf_remote_response( paf_remote_data( $url ) );
	}

	if ( false !== strpos( $url, '/wp-json/wp/v2/pages/50' ) ) {
		return paf_remote_response(
			array(
				'id'    => 50,
				'link'  => 'https://starter.test/menu/',
				'title' => array(
					'rendered' => 'Menu Page',
				),
			)
		);
	}

	if ( false !== strpos( $url, '/wp-json/wp/v2/media/38' ) ) {
		return paf_remote_response(
			array(
				'id'         => 38,
				'source_url' => 'https://starter.test/logo.svg',
			)
		);
	}

	if ( false !== strpos( $url, '/wp-json/wp/v2/media/39' ) ) {
		return paf_remote_response(
			array(
				'id'         => 39,
				'source_url' => 'https://starter.test/header-image.jpg',
			)
		);
	}

	if ( 'https://starter.test/logo.svg' === $url ) {
		return array(
			'body'     => '<svg>logo</svg>',
			'response' => array(
				'code' => 200,
			),
		);
	}

	if ( 'https://starter.test/header-image.jpg' === $url ) {
		return array(
			'body'     => 'header image bytes',
			'response' => array(
				'code' => 200,
			),
		);
	}

	if ( preg_match( '#/wp-json/wp/v2/media/(70[1-3])#', $url, $matches ) ) {
		return paf_remote_response(
			array(
				'id'         => (int) $matches[1],
				'source_url' => 'https://portfolio-source.test/project-' . $matches[1] . '.jpg',
			)
		);
	}

	if ( preg_match( '#/wp-json/sce/v2/media\?id=(\d+)#', $url, $matches ) ) {
		$remote_id = (int) $matches[1];
		if ( ! empty( $GLOBALS['paf_remote_media_failures'][ $remote_id ] ) ) {
			$GLOBALS['paf_remote_media_failures'][ $remote_id ]--;

			return new WP_Error( 'http_request_failed', 'cURL error 28: Operation timed out after 30001 milliseconds.' );
		}

		return paf_remote_response(
			array(
				'code' => 'success',
				'data' => array(
					'media' => array(
						'title' => 'Retried media',
						'ext'   => 'txt',
						'data'  => 'data:text/plain;base64,' . base64_encode( 'retried media' ),
					),
				),
			)
		);
	}

	return paf_remote_response( array(), 404 );
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

function wp_remote_retrieve_response_code( $response ) {
	return isset( $response['response']['code'] ) ? (int) $response['response']['code'] : 0;
}

function paf_remote_response( $body, $status = 200 ) {
	return array(
		'body'     => wp_json_encode( $body ),
		'response' => array(
			'code' => $status,
		),
	);
}

function paf_remote_data( $url = '' ) {
	if ( false !== strpos( $url, 'portfolio-source.test' ) ) {
		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'taxonomies' => array(
					'portfolio_type' => array(
						'name' => 'portfolio_type',
						'ids'  => array( 31, 32 ),
					),
				),
				'post_types' => array(
					'wp_template' => array(
						'name' => 'wp_template',
						'ids'  => array( 501, 502, 503 ),
					),
					'portfolio'   => array(
						'name' => 'portfolio',
						'ids'  => array( 601, 602, 603, 604 ),
					),
				),
			),
		);
	}

	return array(
		'code'    => 'success',
		'message' => '',
		'data'    => array(
			'taxonomies'    => array(
				'nav_menu' => array(
					'name' => 'nav_menu',
					'ids'  => array( 18 ),
				),
			),
			'post_types'    => array(
				'wp_template_part' => array(
					'name' => 'wp_template_part',
					'ids'  => array( 98, 86 ),
				),
				'page'             => array(
					'name' => 'page',
					'ids'  => array( 50 ),
				),
			),
			'post_settings' => array(
				'mods' => array(
					'nav_menu_locations'    => array(
						'primary' => 18,
					),
					'custom_logo'           => 38,
					'anima_transparent_logo' => 0,
				),
			),
		),
	);
}

function paf_find_remote_post( $post_type, $post_id, $url = 'https://starter.test/wp-json/sce/v2/posts' ) {
	foreach ( paf_remote_posts( $post_type, $url ) as $post ) {
		if ( ! empty( $post['ID'] ) && (int) $post['ID'] === (int) $post_id ) {
			return $post;
		}
	}

	return array();
}

function paf_remote_layout_unit_bundles( $url = '', $args = array() ) {
	$source_data = paf_remote_data( $url );
	$source_data = isset( $source_data['data'] ) ? $source_data['data'] : array();

	$nav_menu_term = array(
		'term_id'     => 18,
		'name'        => 'Primary',
		'slug'        => 'primary',
		'taxonomy'    => 'nav_menu',
		'description' => '',
		'parent'      => 0,
		'meta'        => array(),
	);

	return array(
		'code'    => 'success',
		'message' => '',
		'data'    => array(
			'version' => 'test-v1',
			'hash'    => 'starter-test-layout-bundles',
			'bundles' => array(
				array(
					'type'    => 'wp_template_part',
					'slug'    => 'header',
					'id'      => 98,
					'hash'    => 'header-bundle-hash',
					'data'    => $source_data,
					'posts'   => array(
						'wp_template_part' => array( paf_find_remote_post( 'wp_template_part', 98 ) ),
						'nav_menu_item'    => array( paf_find_remote_post( 'nav_menu_item', 60 ) ),
					),
					'terms'   => array(
						'nav_menu' => array( $nav_menu_term ),
					),
					'objects' => array(
						'page' => array(
							array(
								'id'    => 50,
								'link'  => 'https://starter.test/menu/',
								'title' => array(
									'rendered' => 'Menu Page',
								),
							),
						),
					),
					'media'   => array(
						array(
							'id'         => 38,
							'source_url' => 'https://starter.test/logo.svg',
						),
						array(
							'id'         => 39,
							'source_url' => 'https://starter.test/header-image.jpg',
						),
					),
				),
				array(
					'type'  => 'wp_template_part',
					'slug'  => 'footer',
					'id'    => 86,
					'hash'  => 'footer-bundle-hash',
					'data'  => $source_data,
					'posts' => array(
						'wp_template_part' => array( paf_find_remote_post( 'wp_template_part', 86 ) ),
					),
				),
			),
		),
	);
}

function paf_remote_layout_units( $url = '', $args = array() ) {
	return array(
		'code'    => 'success',
		'message' => '',
		'data'    => array(
			'units' => array(
				array(
					'id'    => 98,
					'type'  => 'wp_template_part',
					'slug'  => 'header',
					'title' => 'Header',
				),
				array(
					'id'    => 86,
					'type'  => 'wp_template_part',
					'slug'  => 'footer',
					'title' => 'Footer',
				),
				array(
					'id'    => 1185,
					'type'  => 'wp_template',
					'slug'  => 'home',
					'title' => 'Home',
				),
			),
		),
	);
}

function paf_remote_posts( $post_type, $url = '' ) {
	if ( 'wp_template' === $post_type && false !== strpos( $url, 'portfolio-source.test' ) ) {
		return array(
			array(
				'ID'                    => 501,
				'post_title'            => 'Portfolio Archive',
				'post_content'          => '<!-- wp:query /-->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'archive-portfolio',
				'post_type'             => 'wp_template',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://portfolio-source.test/?post_type=wp_template&p=501',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
			array(
				'ID'                    => 502,
				'post_title'            => 'Portfolio Single',
				'post_content'          => '<!-- wp:post-content /-->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'single-portfolio',
				'post_type'             => 'wp_template',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://portfolio-source.test/?post_type=wp_template&p=502',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
			array(
				'ID'                    => 503,
				'post_title'            => 'Project Type',
				'post_content'          => '<!-- wp:query /-->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'taxonomy-portfolio_type',
				'post_type'             => 'wp_template',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://portfolio-source.test/?post_type=wp_template&p=503',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
		);
	}

	if ( 'portfolio' === $post_type && false !== strpos( $url, 'portfolio-source.test' ) ) {
		$posts = array();

		foreach ( array( 601, 602, 603, 604 ) as $index => $post_id ) {
			$posts[] = array(
				'ID'                    => $post_id,
				'post_title'            => 'Project ' . ( $index + 1 ),
				'post_content'          => '<!-- wp:paragraph --><p>Sample project.</p><!-- /wp:paragraph -->',
				'post_content_filtered' => '',
				'post_excerpt'          => 'Sample project excerpt.',
				'post_status'           => 'publish',
				'post_name'             => 'project-' . ( $index + 1 ),
				'post_type'             => 'portfolio',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://portfolio-source.test/?post_type=portfolio&p=' . $post_id,
				'meta'                  => array(
					'_thumbnail_id' => array( 'Array' ),
				),
				'taxonomies'            => array(
					'portfolio_type' => array( 31 ),
				),
			);
			$posts[ $index ]['post_content'] = '<!-- wp:novablocks/supernova-item {"images":[{"id":' . ( 701 + $index ) . ',"url":"https://portfolio-source.test/project-' . ( 701 + $index ) . '.jpg"}]} --><!-- /wp:novablocks/supernova-item -->';
		}

		return $posts;
	}

	if ( 'wp_template' === $post_type && false !== strpos( $url, 'starter.test' ) ) {
		return array(
			array(
				'ID'                    => 1185,
				'post_title'            => 'Home',
				'post_content'          => '<!-- wp:template-part {"slug":"header","theme":"anima","tagName":"header"} /--><!-- wp:query /--><!-- wp:template-part {"slug":"footer","theme":"anima","tagName":"footer"} /-->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'home',
				'post_type'             => 'wp_template',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://starter.test/?post_type=wp_template&p=1185',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
		);
	}

	if ( 'wp_template' === $post_type && false !== strpos( $url, 'broken-data.test' ) ) {
		return array(
			array(
				'ID'                    => 1185,
				'post_title'            => 'Home',
				'post_content'          => '<!-- wp:template-part {"slug":"header","theme":"anima","tagName":"header"} /--><!-- wp:query /--><!-- wp:template-part {"slug":"footer","theme":"anima","tagName":"footer"} /-->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'home',
				'post_type'             => 'wp_template',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://broken-data.test/?post_type=wp_template&p=1185',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
		);
	}

	if ( 'wp_template_part' === $post_type ) {
		return array(
			array(
				'ID'                    => 98,
				'post_title'            => 'Header',
				'post_content'          => '<!-- wp:novablocks/header --><!-- wp:novablocks/header-row {"slug":"primary","isPrimary":true} --><!-- wp:novablocks/logo /--><!-- wp:image {"id":39,"sizeSlug":"large"} --><figure class="wp-block-image size-large"><img src="https://starter.test/header-image.jpg" class="wp-image-39"/></figure><!-- /wp:image --><!-- wp:novablocks/navigation {"slug":"primary"} /--><!-- /wp:novablocks/header-row --><!-- /wp:novablocks/header -->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'header',
				'post_type'             => 'wp_template_part',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://starter.test/?post_type=wp_template_part&p=98',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
			array(
				'ID'                    => 86,
				'post_title'            => 'Footer',
				'post_content'          => '<!-- wp:paragraph --><p>Footer</p><!-- /wp:paragraph -->',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => 'footer',
				'post_type'             => 'wp_template_part',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 0,
				'guid'                  => 'https://starter.test/?post_type=wp_template_part&p=86',
				'meta'                  => array(),
				'taxonomies'            => array(
					'wp_theme' => array( 'anima' ),
				),
			),
		);
	}

	if ( 'nav_menu_item' === $post_type ) {
		return array(
			array(
				'ID'                    => 60,
				'post_title'            => '',
				'post_content'          => '',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => '60',
				'post_type'             => 'nav_menu_item',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 1,
				'guid'                  => 'https://starter.test/?p=60',
				'taxonomies'            => array(
					'nav_menu' => array( 'Primary' ),
				),
				'meta'                  => array(
					'_menu_item_type'             => array( 'post_type' ),
					'_menu_item_menu_item_parent' => array( '0' ),
					'_menu_item_object_id'        => array( '50' ),
					'_menu_item_object'           => array( 'page' ),
					'_menu_item_target'           => array( '' ),
					'_menu_item_classes'          => array( 'a:1:{i:0;s:0:"";}' ),
					'_menu_item_xfn'              => array( '' ),
					'_menu_item_url'              => array( '' ),
				),
			),
			array(
				'ID'                    => 61,
				'post_title'            => '',
				'post_content'          => '',
				'post_content_filtered' => '',
				'post_excerpt'          => '',
				'post_status'           => 'publish',
				'post_name'             => '61',
				'post_type'             => 'nav_menu_item',
				'post_date'             => '2026-01-01 00:00:00',
				'post_date_gmt'         => '2026-01-01 00:00:00',
				'post_modified'         => '2026-01-01 00:00:00',
				'post_modified_gmt'     => '2026-01-01 00:00:00',
				'post_parent'           => 0,
				'menu_order'            => 2,
				'guid'                  => 'https://starter.test/?p=61',
				'taxonomies'            => array(
					'nav_menu' => array( 'Secondary' ),
				),
				'meta'                  => array(
					'_menu_item_type'             => array( 'custom' ),
					'_menu_item_menu_item_parent' => array( '0' ),
					'_menu_item_object_id'        => array( '61' ),
					'_menu_item_object'           => array( 'custom' ),
					'_menu_item_target'           => array( '' ),
					'_menu_item_classes'          => array( 'a:1:{i:0;s:0:"";}' ),
					'_menu_item_xfn'              => array( '' ),
					'_menu_item_url'              => array( '#' ),
				),
			),
		);
	}

	return array();
}

function taxonomy_exists( $taxonomy ) {
	return in_array( $taxonomy, array( 'nav_menu', 'wp_theme', 'portfolio_type', 'portfolio_tag' ), true );
}

function term_exists( $term_id, $taxonomy = '' ) {
	return ! empty( $GLOBALS['paf_terms_by_name'][ $taxonomy ] ) || in_array( $taxonomy, array( 'nav_menu', 'portfolio_type' ), true );
}

function wp_delete_term( $term_id, $taxonomy ) {
	$GLOBALS['paf_deleted_terms'][] = array( (int) $term_id, $taxonomy );

	return true;
}

function wp_insert_term( $name, $taxonomy, $args = array() ) {
	$term_id = 2000 + count( $GLOBALS['paf_inserted_terms'] ) + 1;

	$term = array(
		'term_id'  => $term_id,
		'name'     => $name,
		'slug'     => isset( $args['slug'] ) ? $args['slug'] : sanitize_key( $name ),
		'taxonomy' => $taxonomy,
	);

	$GLOBALS['paf_inserted_terms'][] = $term;
	$GLOBALS['paf_terms_by_name'][ $taxonomy ][ $name ] = (object) $term;
	$GLOBALS['paf_terms_by_name'][ $taxonomy ][ $term['slug'] ] = (object) $term;

	return array( 'term_id' => $term_id );
}

function update_term_meta( $term_id, $key, $value ) {
	$GLOBALS['paf_term_meta'][ $term_id ][ $key ] = $value;

	return true;
}

function clean_term_cache( $term_id, $taxonomy ) {
	return true;
}

function wp_update_term( $term_id, $taxonomy, $args = array() ) {
	return true;
}

function get_term_by( $field, $value, $taxonomy ) {
	return isset( $GLOBALS['paf_terms_by_name'][ $taxonomy ][ $value ] )
		? $GLOBALS['paf_terms_by_name'][ $taxonomy ][ $value ]
		: false;
}

function wp_insert_post( $args ) {
	if ( ! empty( $args['ID'] ) ) {
		$post_id = (int) $args['ID'];
	} else {
		$post_id = ++$GLOBALS['paf_next_post_id'];
	}

	$GLOBALS['paf_inserted_posts'][ $post_id ] = $args;
	if ( ! empty( $args['meta_input'] ) && is_array( $args['meta_input'] ) ) {
		foreach ( $args['meta_input'] as $key => $value ) {
			$GLOBALS['paf_post_meta'][ $post_id ][ $key ] = $value;
		}
	}

	return $post_id;
}

function wp_delete_post( $post_id, $force_delete = false ) {
	$GLOBALS['paf_deleted_posts'][] = array( (int) $post_id, (bool) $force_delete );

	return true;
}

function wp_update_post( $args ) {
	$GLOBALS['paf_updated_posts'][] = $args;

	return true;
}

function get_post_meta( $post_id, $key = '', $single = false ) {
	if ( '_menu_item_url' === $key ) {
		return '';
	}

	return $single ? '' : array();
}

function update_post_meta( $post_id, $key, $value ) {
	$GLOBALS['paf_post_meta_updates'][] = array(
		'post_id' => (int) $post_id,
		'key'     => $key,
		'value'   => $value,
	);
	$GLOBALS['paf_post_meta'][ $post_id ][ $key ] = $value;

	return true;
}

function wp_set_object_terms( $post_id, $terms, $taxonomy, $append = false ) {
	$GLOBALS['paf_object_terms'][] = array(
		'post_id'  => (int) $post_id,
		'terms'    => (array) $terms,
		'taxonomy' => $taxonomy,
		'append'   => (bool) $append,
	);

	return true;
}

function get_permalink( $post_id ) {
	return 'https://local.test/?p=' . absint( $post_id );
}

function get_stylesheet() {
	return 'anima-lt';
}

function get_theme_mod( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_theme_mods'] ) ? $GLOBALS['paf_theme_mods'][ $key ] : $default;
}

function set_theme_mod( $key, $value ) {
	$GLOBALS['paf_theme_mods'][ $key ] = $value;
}

function update_option( $key, $value ) {
	$GLOBALS['paf_wp_options'][ $key ] = $value;

	return true;
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_wp_options'] ) ? $GLOBALS['paf_wp_options'][ $key ] : $default;
}

function site_url( $path = '' ) {
	return 'https://local.test' . ( '' === $path ? '' : '/' . ltrim( $path, '/' ) );
}

function wp_get_attachment_metadata( $attachment_id ) {
	return isset( $GLOBALS['paf_attachment_metadata'][ $attachment_id ] )
		? $GLOBALS['paf_attachment_metadata'][ $attachment_id ]
		: array();
}

function wp_update_attachment_metadata( $attachment_id, $metadata ) {
	$GLOBALS['paf_attachment_metadata'][ $attachment_id ] = $metadata;

	return true;
}

function wp_delete_attachment( $attachment_id, $force_delete = false ) {
	$GLOBALS['paf_deleted_attachments'][] = array( (int) $attachment_id, (bool) $force_delete );

	return true;
}

function wp_upload_bits( $filename, $deprecated, $bits ) {
	$GLOBALS['paf_uploaded_bits'][] = array( $filename, $bits );

	return array(
		'file'  => '/tmp/' . $filename,
		'url'   => 'https://local.test/uploads/' . $filename,
		'error' => false,
	);
}

function wp_check_filetype( $filename, $mimes = null ) {
	return array( 'type' => 'text/plain' );
}

function wp_insert_attachment( $attachment, $file = false, $parent = 0 ) {
	$attachment_id = ++$GLOBALS['paf_next_attachment_id'];

	$GLOBALS['paf_inserted_attachments'][ $attachment_id ] = array(
		'attachment' => $attachment,
		'file'       => $file,
		'parent'     => $parent,
	);

	return $attachment_id;
}

function wp_generate_attachment_metadata( $attachment_id, $file ) {
	return array(
		'file' => basename( (string) $file ),
	);
}

function download_url( $url, $timeout = 300 ) {
	$GLOBALS['paf_downloads'][] = array( $url, $timeout );

	return '/tmp/paf-logo.svg';
}

function media_handle_sideload( $file_array, $post_id = 0 ) {
	$attachment_id = ++$GLOBALS['paf_next_attachment_id'];
	$GLOBALS['paf_sideloads'][ $attachment_id ] = array( $file_array, $post_id );

	return $attachment_id;
}

function wp_delete_file( $file ) {
	return true;
}

function wp_get_attachment_image_src( $image_id, $size = 'thumbnail' ) {
	if ( isset( $GLOBALS['paf_inserted_attachments'][ $image_id ]['attachment']['guid'] ) ) {
		return array( $GLOBALS['paf_inserted_attachments'][ $image_id ]['attachment']['guid'], 100, 100 );
	}

	if ( isset( $GLOBALS['paf_sideloads'][ $image_id ][0]['name'] ) ) {
		return array( 'https://local.test/uploads/' . $GLOBALS['paf_sideloads'][ $image_id ][0]['name'], 100, 100 );
	}

	return false;
}

function get_intermediate_image_sizes() {
	return array();
}

function wp_cache_flush() {
	return true;
}

function wp_defer_term_counting( $defer = null ) {
	return true;
}

function wp_defer_comment_counting( $defer = null ) {
	return true;
}

function wp_suspend_cache_invalidation( $suspend = true ) {
	return true;
}

function get_taxonomies() {
	return array( 'nav_menu', 'wp_theme' );
}

function delete_option( $key ) {
	unset( $GLOBALS['paf_wp_options'][ $key ] );

	return true;
}

function _get_term_hierarchy( $taxonomy ) {
	return array();
}

function get_bloginfo( $show = '' ) {
	return 'UTF-8';
}

class WP_Error {
	private $code;
	private $message;
	private $data;

	public function __construct( $code, $message = '', $data = array() ) {
		$this->code    = $code;
		$this->message = $message;
		$this->data    = $data;
	}

	public function get_error_message() {
		return $this->message;
	}
}

class PAF_WPDB {
	public $posts = 'wp_posts';
	public $postmeta = 'wp_postmeta';
	public $options = 'wp_options';
	public $queries = array();

	public function get_var( $sql ) {
		return 0;
	}

	public function prepare( $sql ) {
		$args = func_get_args();
		array_shift( $args );

		foreach ( $args as $arg ) {
			$sql = preg_replace( '/%s|%d/', "'" . $arg . "'", $sql, 1 );
		}

		return $sql;
	}

	public function query( $sql ) {
		$this->queries[] = $sql;

		return true;
	}
}

$GLOBALS['wpdb'] = new PAF_WPDB();

class PixelgradeAssistant_Admin {
	public static $saved = 0;

	public static function get_option( $key, $default = null, $force_refresh = false ) {
		if ( $force_refresh ) {
			$GLOBALS['paf_pixassist_options'] = $GLOBALS['paf_pixassist_db_options'];
		}

		return array_key_exists( $key, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}

	public static function set_option( $key, $value ) {
		$GLOBALS['paf_pixassist_options'][ $key ] = $value;
	}

	public static function save_options() {
		self::$saved++;
		$GLOBALS['paf_pixassist_db_options'] = $GLOBALS['paf_pixassist_options'];

		return true;
	}

	public static function get_config() {
		return array(
			'starterContent' => array(
				'demos' => array(
					array(
						'id'          => 'anima-restaurant',
						'url'         => 'https://starter.test/',
						'baseRestUrl' => 'https://starter.test/wp-json/sce/v2/',
					),
					array(
						'id'          => 'anima-blog',
						'url'         => 'https://broken-data.test/',
						'baseRestUrl' => 'https://broken-data.test/wp-json/sce/v2/',
					),
					array(
						'id'          => 'anima-portfolio',
						'url'         => 'https://portfolio-source.test/',
						'baseRestUrl' => 'https://portfolio-source.test/wp-json/sce/v2/',
					),
				),
			),
		);
	}

	public static function is_development_url( $url ) {
		return false;
	}
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

$GLOBALS['paf_theme_mods'] = array(
	'nav_menu_locations' => array(
		'primary' => 7,
	),
	'custom_logo' => 42,
);

	assert_true( method_exists( $starter_content, 'import_layout_unit' ), 'Starter Content must expose import_layout_unit().' );
	assert_true( method_exists( $starter_content, 'import_starter' ), 'Starter Content must expose import_starter() for server-side bulk imports.' );
	assert_true( method_exists( $starter_content, 'queue_layout_unit_job' ), 'Starter Content must expose queue_layout_unit_job() for fast-return layout Apply requests.' );
	assert_true( method_exists( $starter_content, 'process_layout_unit_job' ), 'Starter Content must expose process_layout_unit_job() for background Apply processing.' );
	assert_true( method_exists( $starter_content, 'get_layout_unit_job_status' ), 'Starter Content must expose get_layout_unit_job_status() for Apply polling.' );

$summary = $starter_content->import_layout_unit(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/',
	'wp_template_part',
	'header'
);

assert_same( 'success', $summary['code'], 'Layout-unit import must return a success code.' );
assert_same( 'wp_template_part', $summary['data']['unit']['type'], 'The imported unit summary must report its type.' );
assert_same( 'header', $summary['data']['unit']['slug'], 'The imported unit summary must report its slug.' );
assert_same( 1, $summary['data']['dependencies']['media'], 'The imported unit summary must report directly referenced media.' );
assert_same( 1, $summary['data']['dependencies']['logos'], 'The imported unit summary must report imported logo settings.' );

$journal = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-restaurant'];

$local_header_id = $summary['data']['unit']['localId'];
assert_same( array( 98 => $local_header_id ), $journal['post_types']['wp_template_part'], 'The selected template part must be journaled as a post_type import.' );
assert_true( empty( $journal['post_types']['page'] ), 'Layout-unit imports must not import pages.' );
assert_true( empty( $journal['post_types']['post'] ), 'Layout-unit imports must not import posts.' );
assert_true( empty( $journal['post_types']['portfolio'] ), 'Layout-unit imports must not import portfolio projects.' );
assert_same( array( 18 => 2001 ), $journal['taxonomies']['nav_menu'], 'The referenced nav menu term must be journaled.' );
$local_menu_item_id = $journal['post_types']['nav_menu_item'][60];
assert_same( array( 60 => $local_menu_item_id ), $journal['post_types']['nav_menu_item'], 'Only menu items from the referenced menu must be journaled.' );
assert_same( 3001, $journal['media']['ignored'][39], 'The directly referenced image must be sideloaded and journaled as imported media.' );
assert_same( 3002, $journal['media']['ignored'][38], 'The source logo must be sideloaded and journaled as imported media.' );
assert_same( 7, $journal['post_settings']['mods']['nav_menu_locations']['primary'], 'The previous nav menu location must be stored for reset.' );
assert_same( 42, $journal['post_settings']['mods']['custom_logo'], 'The previous custom logo must be stored for reset.' );
assert_same( array( 'primary' => 2001 ), $GLOBALS['paf_theme_mods']['nav_menu_locations'], 'The imported menu must be assigned to the matching local menu location.' );
assert_same( 3002, $GLOBALS['paf_theme_mods']['custom_logo'], 'The imported logo must become the local custom logo.' );

$active_theme_binding = array_values(
	array_filter(
		$GLOBALS['paf_object_terms'],
		function ( $entry ) {
			global $local_header_id;

			return $local_header_id === $entry['post_id']
				&& 'wp_theme' === $entry['taxonomy']
				&& array( 'anima-lt' ) === $entry['terms'];
		}
	)
);
assert_true( ! empty( $active_theme_binding ), 'Imported template parts must be rebound to the active theme.' );

$template_summary = $starter_content->import_layout_unit(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/',
	'wp_template',
	'home'
);
$local_template_id = $template_summary['data']['unit']['localId'];
$template_update   = null;
foreach ( $GLOBALS['paf_updated_posts'] as $updated_post ) {
	if ( isset( $updated_post['ID'] ) && $local_template_id === (int) $updated_post['ID'] && isset( $updated_post['post_content'] ) ) {
		$template_update = $updated_post;
	}
}
assert_same( 'success', $template_summary['code'], 'Template layout-unit import must return a success code.' );
assert_true( is_array( $template_update ), 'Imported templates must be updated after insert when their template-part references need rewriting.' );
assert_true( false !== strpos( $template_update['post_content'], '"theme":"anima-lt"' ), 'Imported templates must reference template parts from the active theme.' );
assert_true( false === strpos( $template_update['post_content'], '"theme":"anima"' ), 'Imported templates must not keep source-theme template-part references.' );

$menu_item = $GLOBALS['paf_inserted_posts'][ $local_menu_item_id ];
assert_same( 'Menu Page', $menu_item['post_title'], 'Layout-only menu imports must preserve the source item label without importing its page.' );
assert_same( 'custom', $menu_item['meta_input']['_menu_item_type'], 'Unimported post_type menu items must be converted to custom links.' );
assert_same( 'custom', $menu_item['meta_input']['_menu_item_object'], 'Converted menu items must no longer reference missing local post objects.' );
assert_same( 'https://local.test/menu/', $menu_item['meta_input']['_menu_item_url'], 'Converted menu URLs must be rebased to the local site.' );

$final_menu_meta = isset( $GLOBALS['paf_post_meta'][ $local_menu_item_id ] ) ? $GLOBALS['paf_post_meta'][ $local_menu_item_id ] : array();
assert_same( 'custom', $final_menu_meta['_menu_item_type'], 'Final menu item meta must stay converted after menu remapping runs.' );
assert_same( 'custom', $final_menu_meta['_menu_item_object'], 'Final menu item object meta must stay converted after menu remapping runs.' );
assert_same( '60', $final_menu_meta['_menu_item_object_id'], 'Final menu item object ID must not reference an unimported source page.' );
assert_same( 'https://local.test/menu/', $final_menu_meta['_menu_item_url'], 'Final menu item URL must stay rebased after menu remapping runs.' );

assert_same( true, $GLOBALS['paf_attachment_metadata'][3001]['imported_with_pixassist'], 'Sideloaded layout media must carry the reset safety tag.' );
assert_same( true, $GLOBALS['paf_attachment_metadata'][3002]['imported_with_pixassist'], 'Sideloaded logo media must carry the reset safety tag.' );

assert_true( method_exists( $starter_content, 'list_layout_units' ), 'Starter Content must expose list_layout_units().' );

$starter_content->add_rest_routes_api();
$layout_units_route = isset( $GLOBALS['paf_rest_routes']['pixassist/v1/layout_units'] ) ? $GLOBALS['paf_rest_routes']['pixassist/v1/layout_units'] : array();
assert_true( ! empty( $layout_units_route ), 'The layout_units REST route must be registered.' );
assert_same( false, $layout_units_route['args']['demo_key']['required'], 'Batched layout-unit listing must not be blocked by a required demo_key argument.' );
assert_same( false, $layout_units_route['args']['url']['required'], 'Batched layout-unit listing must not be blocked by a required url argument.' );
assert_same( false, $layout_units_route['args']['sources']['required'], 'The batched sources payload must be accepted by the layout_units route.' );

$units_response = $starter_content->list_layout_units(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/'
);

$data_discovery_requests = array_values(
	array_filter(
		$GLOBALS['paf_remote_requests'],
		function ( $request ) {
			$request_url = isset( $request[0] ) ? $request[0] : '';
			return false !== strpos( $request_url, '/wp-json/sce/v2/data' );
		}
	)
);
assert_true( ! empty( $data_discovery_requests ), 'Legacy layout-unit discovery must fetch the source data manifest.' );
assert_true( false !== strpos( $data_discovery_requests[0][0], 'media_urls=1' ), 'Source data discovery must opt in to direct media URLs.' );

assert_same( 'success', $units_response['code'], 'Layout-unit listing must return a success code.' );
assert_same(
	array(
		array(
			'id'    => 98,
			'type'  => 'wp_template_part',
			'slug'  => 'header',
			'title' => 'Header',
		),
		array(
			'id'    => 86,
			'type'  => 'wp_template_part',
			'slug'  => 'footer',
			'title' => 'Footer',
		),
		array(
			'id'            => 1185,
			'type'          => 'wp_template',
			'slug'          => 'home',
			'title'         => 'Home',
			'type_group'    => 'home',
			'variant_label' => 'Home',
		),
	),
	$units_response['data']['units'],
	'Layout-unit listing must expose only importable layout units in source order.'
);

$GLOBALS['paf_remote_requests'] = array();
$cached_footer_summary          = $starter_content->import_layout_unit(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/',
	'wp_template_part',
	'footer'
);
$template_part_fetches          = 0;
foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
	$request_url  = isset( $request[0] ) ? $request[0] : '';
	$request_args = isset( $request[1] ) ? $request[1] : array();
	$post_type    = isset( $request_args['body']['post_type'] ) ? $request_args['body']['post_type'] : '';
	if ( false !== strpos( $request_url, '/posts' ) && 'wp_template_part' === $post_type ) {
		$template_part_fetches++;
	}
}
	assert_same( 'success', $cached_footer_summary['code'], 'A listed layout unit must still import successfully after source cache warming.' );
	assert_same( 0, $template_part_fetches, 'A warmed media-free layout source must reuse the listed template-part post without re-fetching it for insertion.' );

	$GLOBALS['paf_layout_units_endpoint_status'] = 0;
	$GLOBALS['paf_transients']                  = array();
	$GLOBALS['paf_remote_requests']             = array();
	$fast_list_starter_content                  = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
	$fast_units_response                        = $fast_list_starter_content->list_layout_units(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/'
	);
	$GLOBALS['paf_layout_units_endpoint_status'] = 404;

	assert_same( 'success', $fast_units_response['code'], 'A source layout-units endpoint must be accepted as the fast list path.' );
	assert_same( $units_response['data']['units'], $fast_units_response['data']['units'], 'The fast list path must preserve the existing layout unit payload shape.' );

	$fast_list_requests = array(
		'layoutUnits' => 0,
		'posts'       => 0,
		'data'        => 0,
	);
	foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
		$request_url = isset( $request[0] ) ? $request[0] : '';
		if ( false !== strpos( $request_url, '/wp-json/sce/v2/layout-units' ) ) {
			$fast_list_requests['layoutUnits']++;
		}
		if ( false !== strpos( $request_url, '/wp-json/sce/v2/posts' ) ) {
			$fast_list_requests['posts']++;
		}
		if ( false !== strpos( $request_url, '/wp-json/sce/v2/data' ) ) {
			$fast_list_requests['data']++;
		}
	}
	assert_same( array( 'layoutUnits' => 1, 'posts' => 0, 'data' => 0 ), $fast_list_requests, 'The fast list path must use one source list request and skip legacy posts/data discovery.' );

	$GLOBALS['paf_layout_units_endpoint_status'] = 0;
	$GLOBALS['paf_transients']                  = array();
	$GLOBALS['paf_remote_requests']             = array();
	$GLOBALS['paf_remote_multiple_requests']    = array();
	$batched_list_starter_content               = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
	$batched_units_response                     = $batched_list_starter_content->list_layout_units_for_sources(
		array(
			array(
				'id'          => 'anima-restaurant',
				'baseRestUrl' => 'https://starter.test/wp-json/sce/v2/',
			),
			array(
				'id'          => 'anima-blog',
				'baseRestUrl' => 'https://broken-data.test/wp-json/sce/v2/',
			),
			array(
				'id'          => 'anima-portfolio',
				'baseRestUrl' => 'https://portfolio-source.test/wp-json/sce/v2/',
			),
		)
	);
	$GLOBALS['paf_layout_units_endpoint_status'] = 404;

	assert_same( 'success', $batched_units_response['code'], 'Batched layout-unit listing must return a success code.' );
	assert_same( array( 'success', 'success', 'success' ), array_column( $batched_units_response['data']['sources'], 'code' ), 'Batched layout-unit listing must preserve per-source success states.' );
	assert_same( 1, count( $GLOBALS['paf_remote_multiple_requests'] ), 'Batched layout-unit listing must prefetch compact source lists in one concurrent request batch.' );
	assert_same( 3, count( $GLOBALS['paf_remote_multiple_requests'][0] ), 'Batched layout-unit listing must include each uncached source in the concurrent request batch.' );

	$batched_sequential_layout_unit_fetches = 0;
	foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
		$request_url = isset( $request[0] ) ? $request[0] : '';
		if ( false !== strpos( $request_url, '/wp-json/sce/v2/layout-units' ) ) {
			$batched_sequential_layout_unit_fetches++;
		}
	}
	assert_same( 0, $batched_sequential_layout_unit_fetches, 'Batched layout-unit listing must not fetch compact source lists sequentially after concurrent prefetch.' );

	assert_true( method_exists( $starter_content, 'prewarm_layout_unit_bundles' ), 'Starter Content must expose prewarm_layout_unit_bundles() for background layout bundle caching.' );

	$bundle_starter_content                = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
	$GLOBALS['paf_transients']            = array();
	$GLOBALS['paf_remote_requests']       = array();
	$GLOBALS['paf_pixassist_options']     = array();
	$GLOBALS['paf_pixassist_db_options']  = array();
	$GLOBALS['paf_inserted_posts']        = array();
	$GLOBALS['paf_updated_posts']         = array();
	$GLOBALS['paf_object_terms']          = array();
	$GLOBALS['paf_inserted_terms']        = array();
	$GLOBALS['paf_attachment_metadata']   = array();
	$GLOBALS['paf_sideloads']             = array();
	$GLOBALS['paf_downloads']             = array();
	$GLOBALS['paf_next_post_id']          = 1000;
	$GLOBALS['paf_next_attachment_id']    = 3000;
	$GLOBALS['paf_theme_mods']            = array(
		'nav_menu_locations' => array(
			'primary' => 7,
		),
		'custom_logo'        => 42,
	);

	$prewarm_result = $bundle_starter_content->prewarm_layout_unit_bundles(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/',
		array(
			array(
				'type' => 'wp_template_part',
				'slug' => 'header',
			),
			array(
				'type' => 'wp_template_part',
				'slug' => 'footer',
			),
		)
	);

	assert_same( 'success', $prewarm_result['code'], 'Prewarming layout bundles from the source endpoint must succeed on a warmable source.' );
	assert_same( 2, $prewarm_result['data']['bundles'], 'Prewarming the Header/Footer list must cache both returned bundles.' );
	assert_true( ! empty( $prewarm_result['data']['jobs']['wp_template_part:header']['jobId'] ), 'Prewarming Header/Footer bundles must also prequeue a reusable header Apply job.' );
	assert_true( ! empty( $prewarm_result['data']['jobs']['wp_template_part:footer']['jobId'] ), 'Prewarming Header/Footer bundles must also prequeue a reusable footer Apply job.' );
	assert_true( empty( $prewarm_result['data']['jobs']['wp_template_part:header']['token'] ), 'Prewarmed Apply jobs returned to the browser must not expose worker tokens.' );

	$bundle_requests = 0;
	foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
		if ( false !== strpos( $request[0], '/layout-unit-bundles' ) ) {
			$bundle_requests++;
		}
	}
	assert_same( 1, $bundle_requests, 'Prewarming Header/Footer bundles must use one source bundle request.' );

	$cached_logo_media = array();
	foreach ( $GLOBALS['paf_transients'] as $transient_value ) {
		if ( is_array( $transient_value ) && ! empty( $transient_value['source_url'] ) && 'https://starter.test/logo.svg' === $transient_value['source_url'] ) {
			$cached_logo_media = $transient_value;
			break;
		}
	}
	assert_true( ! empty( $cached_logo_media['title'] ) && ! empty( $cached_logo_media['ext'] ) && ! empty( $cached_logo_media['data'] ), 'Prewarming Header/Footer bundles must cache import-ready media bytes for referenced logo files.' );

	$GLOBALS['paf_remote_requests']   = array();
	$GLOBALS['paf_post_meta_updates'] = array();
	$GLOBALS['paf_updated_posts']     = array();
	$GLOBALS['wpdb']->queries         = array();
	$queued_header                    = $bundle_starter_content->queue_layout_unit_job(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/',
		'wp_template_part',
		'header',
		array(),
		false
	);

	assert_same( 'success', $queued_header['code'], 'Queueing a prewarmed header Apply job must return success immediately.' );
	assert_same( array(), $GLOBALS['paf_remote_requests'], 'Queueing a prewarmed header Apply job must not call the remote source.' );

	$processed_header = $bundle_starter_content->process_layout_unit_job( $queued_header['data']['jobId'], $queued_header['data']['token'] );
	assert_same( 'success', $processed_header['code'], 'Processing a prewarmed header Apply job must succeed.' );
	assert_same( 'success', $processed_header['data']['status'], 'A prewarmed header Apply job must complete successfully.' );
	assert_same( array(), $GLOBALS['paf_downloads'], 'A prewarmed header Apply must use cached media bytes instead of download_url() at click time.' );

	$style_manager_regeneration_queries = array_values(
		array_filter(
			$GLOBALS['wpdb']->queries,
			function ( $sql ) {
				return false !== strpos( $sql, 'style_manager' )
					|| false !== strpos( $sql, 'customify_style' )
					|| false !== strpos( $sql, 'sm_dynamic' );
			}
		)
	);
	assert_same( array(), $style_manager_regeneration_queries, 'Replacing an applied layout unit must not regenerate Style Manager during the undo half of the import.' );

	$redundant_menu_meta_repairs = array_values(
		array_filter(
			$GLOBALS['paf_post_meta_updates'],
			function ( $update ) {
				return in_array(
					$update['key'],
					array( '_menu_item_type', '_menu_item_object', '_menu_item_object_id', '_menu_item_url' ),
					true
				);
			}
		)
	);
	assert_same( array(), $redundant_menu_meta_repairs, 'A prewarmed header Apply must not repair layout menu custom-link meta after wp_insert_post() already saved it.' );
	$redundant_menu_title_repairs = array_values(
		array_filter(
			$GLOBALS['paf_updated_posts'],
			function ( $update ) {
				return isset( $update['post_title'] );
			}
		)
	);
	assert_same( array(), $redundant_menu_title_repairs, 'A prewarmed header Apply must not run post-title repair updates for converted layout menu items.' );

	$unexpected_discovery_requests = array();
	foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
		$request_url = isset( $request[0] ) ? $request[0] : '';
		if (
			false !== strpos( $request_url, '/wp-json/sce/v2/data' )
			|| false !== strpos( $request_url, '/wp-json/sce/v2/posts' )
			|| false !== strpos( $request_url, '/wp-json/sce/v2/terms' )
			|| false !== strpos( $request_url, '/wp-json/wp/v2/pages' )
			|| false !== strpos( $request_url, '/wp-json/wp/v2/media/38' )
			|| false !== strpos( $request_url, '/wp-json/wp/v2/media/39' )
		) {
			$unexpected_discovery_requests[] = $request_url;
		}
	}
	assert_same( array(), $unexpected_discovery_requests, 'A prewarmed header Apply must not rediscover posts, terms, menu targets, source data, or media URLs at click time.' );

	$GLOBALS['paf_bundle_endpoint_status'] = 404;
	$fallback_starter_content             = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
	$GLOBALS['paf_transients']            = array();
	$GLOBALS['paf_remote_requests']       = array();
	$GLOBALS['paf_pixassist_options']     = array();
	$GLOBALS['paf_pixassist_db_options']  = array();

	$fallback_prewarm = $fallback_starter_content->prewarm_layout_unit_bundles(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/',
		array(
			array(
				'type' => 'wp_template_part',
				'slug' => 'footer',
			),
		)
	);
	assert_same( 'bundle_unavailable', $fallback_prewarm['code'], 'A missing source bundle endpoint must be reported as unavailable, not as a hard Apply failure.' );

	$GLOBALS['paf_remote_requests'] = array();
	$fallback_summary              = $fallback_starter_content->import_layout_unit(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/',
		'wp_template_part',
		'footer'
	);
	$GLOBALS['paf_bundle_endpoint_status'] = 0;

	assert_same( 'success', $fallback_summary['code'], 'Layout-unit Apply must still use the existing dynamic fallback when the source bundle endpoint is unavailable.' );

	$fallback_post_fetches = 0;
	foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
		$request_url = isset( $request[0] ) ? $request[0] : '';
		if ( false !== strpos( $request_url, '/wp-json/sce/v2/posts' ) ) {
			$fallback_post_fetches++;
		}
	}
	assert_true( 0 < $fallback_post_fetches, 'The unavailable-bundle fallback must use the existing post discovery path.' );

	$queued_footer = $starter_content->queue_layout_unit_job(
		'anima-restaurant',
		'https://starter.test/wp-json/sce/v2/',
		'wp_template_part',
		'footer',
		array(),
		false
	);

	assert_same( 'success', $queued_footer['code'], 'Queueing a layout Apply job must return success immediately.' );
	assert_same( 'queued', $queued_footer['data']['status'], 'A newly queued layout Apply job must start in queued status.' );
	assert_true( ! empty( $queued_footer['data']['jobId'] ), 'A queued layout Apply job must expose a pollable job ID.' );
	assert_true( ! empty( $queued_footer['data']['token'] ), 'The direct queue helper must retain the worker token for internal processing.' );

	$queued_status = $starter_content->get_layout_unit_job_status( $queued_footer['data']['jobId'] );
	assert_same( 'success', $queued_status['code'], 'Reading a queued layout Apply job status must succeed.' );
	assert_same( 'queued', $queued_status['data']['status'], 'Stored layout Apply job status must remain queued before processing.' );

	$processed_footer = $starter_content->process_layout_unit_job( $queued_footer['data']['jobId'], $queued_footer['data']['token'] );
	assert_same( 'success', $processed_footer['code'], 'Processing a queued layout Apply job must run the existing import path successfully.' );
	assert_same( 'success', $processed_footer['data']['status'], 'A successfully processed layout Apply job must store success status.' );
	assert_true( isset( $processed_footer['data']['result']['data']['appliedUnits']['wp_template_part:footer'] ), 'The queued layout Apply job must preserve applied-unit journal state.' );

	$processed_status = $starter_content->get_layout_unit_job_status( $queued_footer['data']['jobId'] );
	assert_same( 'success', $processed_status['code'], 'Reading a processed layout Apply job status must succeed.' );
	assert_same( 'success', $processed_status['data']['status'], 'Stored layout Apply job status must reflect completion.' );
	assert_true( isset( $processed_status['data']['result']['data']['appliedUnits']['wp_template_part:footer'] ), 'Stored completed job result must expose applied units for UI polling.' );

$feature_units_response = $starter_content->list_layout_units(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/'
);

$portfolio_feature = null;
foreach ( $feature_units_response['data']['units'] as $unit ) {
	if ( 'feature' === $unit['type'] && 'portfolio' === $unit['slug'] ) {
		$portfolio_feature = $unit;
		break;
	}
}

assert_same( 'success', $feature_units_response['code'], 'Feature-unit listing must return a success code.' );
assert_true( is_array( $portfolio_feature ), 'A source with portfolio posts and archive-portfolio must expose the Portfolio feature unit.' );
assert_same( 'Portfolio', $portfolio_feature['title'], 'The Portfolio feature unit must have a readable title.' );
assert_same( true, $portfolio_feature['sampleDefault'], 'Portfolio sample content must be offered on by default.' );

$feature_summary = $starter_content->import_layout_unit(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/',
	'feature',
	'portfolio'
);

assert_same( 'success', $feature_summary['code'], 'Portfolio feature import must return a success code.' );
assert_same( 'feature', $feature_summary['data']['unit']['type'], 'The imported feature summary must report type `feature`.' );
assert_same( 'portfolio', $feature_summary['data']['unit']['slug'], 'The imported feature summary must report slug `portfolio`.' );
assert_same( 3, $feature_summary['data']['dependencies']['templates'], 'Portfolio feature import must import the feature templates.' );
assert_same( 2, $feature_summary['data']['dependencies']['terms'], 'Portfolio feature import must import portfolio_type terms.' );
assert_same( 3, $feature_summary['data']['dependencies']['samples'], 'Portfolio feature import must import the minimal sample by default.' );
assert_same( 3, $feature_summary['data']['dependencies']['media'], 'Portfolio feature import must sideload featured images for the sample.' );
assert_same( array( 'portfolio' ), $GLOBALS['paf_pixassist_options']['enabled_features'], 'Portfolio feature import must persist the enabled feature flag.' );

$feature_journal = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-portfolio'];
assert_same( array( 501, 502, 503 ), array_map( 'intval', array_keys( $feature_journal['post_types']['wp_template'] ) ), 'Portfolio feature import must journal its templates.' );
assert_same( array( 601, 602, 603 ), array_map( 'intval', array_keys( $feature_journal['post_types']['portfolio'] ) ), 'Portfolio feature import must journal only the minimal sample projects.' );
assert_same( array( 31, 32 ), array_map( 'intval', array_keys( $feature_journal['taxonomies']['portfolio_type'] ) ), 'Portfolio feature import must journal portfolio_type terms.' );
assert_true( empty( $feature_journal['post_types']['page'] ), 'Portfolio feature import must not import pages.' );
assert_true( empty( $feature_journal['post_types']['post'] ), 'Portfolio feature import must not import blog posts.' );
assert_same( true, $feature_journal['enabled_features']['portfolio'], 'Portfolio feature import must journal the enabled feature flag for undo/reset.' );
assert_true( isset( $feature_journal['layout_units']['feature:portfolio'] ), 'Portfolio feature import must record one applied feature unit.' );
assert_same( 'Portfolio', $feature_journal['layout_units']['feature:portfolio']['title'], 'Applied feature state must carry a readable title.' );
assert_same( array( 701, 702, 703 ), array_map( 'intval', array_keys( $feature_journal['media']['ignored'] ) ), 'Portfolio feature import must journal media referenced by sample project block content.' );

$first_sample_id = $feature_journal['post_types']['portfolio'][601];
$first_sample_thumbnail_id = isset( $GLOBALS['paf_inserted_posts'][ $first_sample_id ]['meta_input']['_thumbnail_id'] ) ? $GLOBALS['paf_inserted_posts'][ $first_sample_id ]['meta_input']['_thumbnail_id'] : 0;
assert_same( $feature_journal['media']['ignored'][701], $first_sample_thumbnail_id, 'Sample portfolio items must replace malformed source thumbnail meta with a local featured image.' );

$portfolio_import_request = null;
foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
	$request_url  = isset( $request[0] ) ? $request[0] : '';
	$request_args = isset( $request[1] ) ? $request[1] : array();
	$post_type    = isset( $request_args['body']['post_type'] ) ? $request_args['body']['post_type'] : '';
	$include      = isset( $request_args['body']['include'] ) ? array_map( 'intval', (array) $request_args['body']['include'] ) : array();
	if ( false !== strpos( $request_url, '/posts' ) && 'portfolio' === $post_type && array( 601, 602, 603 ) === $include ) {
		$portfolio_import_request = $request_args;
	}
}
assert_true( ! empty( $portfolio_import_request['body']['ignored_images'][701]['sizes']['full'] ), 'Sample post import must send local image mappings so SCE rewrites project content URLs to real attachments.' );

$undo_feature = $starter_content->undo_layout_unit( 'feature', 'portfolio' );
assert_same( 'success', $undo_feature['code'], 'Undoing the Portfolio feature unit must succeed.' );
assert_same( array(), $GLOBALS['paf_pixassist_options']['enabled_features'], 'Undoing the Portfolio feature must remove the enabled feature flag.' );
assert_true( empty( $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-portfolio'] ), 'Undoing the Portfolio feature must remove its empty source journal.' );

$feature_only_summary = $starter_content->import_layout_unit(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/',
	'feature',
	'portfolio',
	array( 'include_sample' => false )
);

assert_same( 'success', $feature_only_summary['code'], 'Portfolio feature-only import must return a success code.' );
assert_same( 3, $feature_only_summary['data']['dependencies']['templates'], 'Feature-only import must still import the feature templates.' );
assert_same( 0, $feature_only_summary['data']['dependencies']['samples'], 'Feature-only import must skip sample projects.' );
assert_same( 0, $feature_only_summary['data']['dependencies']['terms'], 'Feature-only import must skip sample terms.' );
assert_same( 0, $feature_only_summary['data']['dependencies']['media'], 'Feature-only import must skip sample media.' );
$feature_only_journal = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-portfolio'];
assert_true( empty( $feature_only_journal['post_types']['portfolio'] ), 'Feature-only import must not journal portfolio sample posts.' );
assert_true( empty( $feature_only_journal['taxonomies']['portfolio_type'] ), 'Feature-only import must not journal portfolio sample terms.' );

$undo_feature_only = $starter_content->undo_layout_unit( 'feature', 'portfolio' );
assert_same( 'success', $undo_feature_only['code'], 'Undoing the feature-only Portfolio import must succeed.' );

$feature_summary = $starter_content->import_layout_unit(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/',
	'feature',
	'portfolio'
);
assert_same( 'success', $feature_summary['code'], 'Portfolio feature import must be repeatable after undo.' );

$reset_summary = $starter_content->reset_starter_content();
assert_same( array(), $GLOBALS['paf_pixassist_options']['enabled_features'], 'Full Reset must remove enabled feature flags.' );
assert_same( array(), $GLOBALS['paf_pixassist_options']['imported_starter_content'], 'Full Reset must clear the feature journal.' );
assert_true( 0 < $reset_summary['posts_deleted'], 'Full Reset must delete feature templates and sample posts.' );
assert_true( 0 < $reset_summary['terms_deleted'], 'Full Reset must delete feature sample terms.' );
assert_true( 0 < $reset_summary['media_deleted'], 'Full Reset must delete feature sample media.' );

$template_summary = $starter_content->import_layout_unit(
	'anima-blog',
	'https://broken-data.test/wp-json/sce/v2/',
	'wp_template',
	'home'
);

assert_same( 'success', $template_summary['code'], 'A template without direct menu/logo dependencies must import even if source metadata is unavailable.' );
assert_same( 'wp_template', $template_summary['data']['unit']['type'], 'The fallback template import summary must report its type.' );
assert_same( 'home', $template_summary['data']['unit']['slug'], 'The fallback template import summary must report its slug.' );

$blog_journal = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-blog'];
$local_home_id = $template_summary['data']['unit']['localId'];
assert_same( array( 1185 => $local_home_id ), $blog_journal['post_types']['wp_template'], 'The selected template must be journaled.' );
assert_true( empty( $blog_journal['post_types']['page'] ), 'Fallback template imports must not import pages.' );
assert_true( empty( $blog_journal['post_types']['post'] ), 'Fallback template imports must not import posts.' );
assert_true( empty( $blog_journal['post_types']['portfolio'] ), 'Fallback template imports must not import portfolio projects.' );

$GLOBALS['paf_remote_requests']                 = array();
$GLOBALS['paf_remote_media_failures']           = array( 9101 => 1 );
$GLOBALS['paf_pixassist_options']               = array();
$GLOBALS['paf_pixassist_db_options']            = array();
$GLOBALS['paf_uploaded_bits']                   = array();
$GLOBALS['paf_inserted_attachments']            = array();
$GLOBALS['paf_attachment_metadata']             = array();
$GLOBALS['paf_next_attachment_id']              = 3000;

$starter_summary = $starter_content->import_starter(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/',
	array(
		'media' => array(
			'placeholders' => array( 1 ),
			'ignored'      => array( 9101 ),
		),
	)
);

assert_same( 'success', $starter_summary['code'], 'Full starter media import must retry a transient media fetch timeout and still succeed.' );
assert_same( 1, $starter_summary['data']['summary']['media'], 'Retried full-starter media import must count the imported media item.' );
assert_same( 'retried media', $GLOBALS['paf_uploaded_bits'][0][1], 'Retried media payload must be uploaded after the successful retry.' );
assert_same( true, $GLOBALS['paf_attachment_metadata'][3001]['imported_with_pixassist'], 'Retried media import must still tag attachment metadata for safe reset.' );

$media_request_timeouts = array();
foreach ( $GLOBALS['paf_remote_requests'] as $request ) {
	if ( false !== strpos( $request[0], '/wp-json/sce/v2/media?id=9101' ) ) {
		$media_request_timeouts[] = isset( $request[1]['timeout'] ) ? (int) $request[1]['timeout'] : 0;
	}
}
assert_same( array( 30, 90 ), $media_request_timeouts, 'A transient full-starter media timeout must be retried with a longer timeout.' );

echo "Layout unit import contract OK\n";
