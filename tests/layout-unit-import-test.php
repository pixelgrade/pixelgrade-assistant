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
$GLOBALS['paf_theme_mods']            = array();
$GLOBALS['paf_wp_options']            = array();
$GLOBALS['paf_transients']            = array();
$GLOBALS['paf_remote_requests']       = array();
$GLOBALS['paf_inserted_posts']        = array();
$GLOBALS['paf_updated_posts']         = array();
$GLOBALS['paf_object_terms']          = array();
$GLOBALS['paf_inserted_terms']        = array();
$GLOBALS['paf_term_meta']             = array();
$GLOBALS['paf_attachment_metadata']   = array();
$GLOBALS['paf_downloads']             = array();
$GLOBALS['paf_sideloads']             = array();
$GLOBALS['paf_next_post_id']          = 1000;
$GLOBALS['paf_next_attachment_id']    = 3000;
$GLOBALS['paf_terms_by_name']         = array();

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
	$GLOBALS['paf_remote_requests'][] = array( $url, $args );

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
		return paf_remote_response(
			array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'terms' => array(
						array(
							'term_id'     => 18,
							'name'        => 'Primary',
							'slug'        => 'primary',
							'taxonomy'    => 'nav_menu',
							'description' => '',
							'parent'      => 0,
							'meta'        => array(),
						),
					),
				),
			)
		);
	}

	return paf_remote_response( array( 'code' => 'not_found' ), 404 );
}

function wp_remote_get( $url, $args = array() ) {
	$GLOBALS['paf_remote_requests'][] = array( $url, $args );

	if ( false !== strpos( $url, '/wp-json/sce/v2/data' ) ) {
		if ( false !== strpos( $url, 'broken-data.test' ) ) {
			return paf_remote_response( array( 'code' => 'server_error' ), 500 );
		}

		return paf_remote_response( paf_remote_data() );
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

function paf_remote_data() {
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

function paf_remote_posts( $post_type, $url = '' ) {
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
	return in_array( $taxonomy, array( 'nav_menu', 'wp_theme' ), true );
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

	return $post_id;
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

	public static function get_option( $key, $default = null ) {
		return array_key_exists( $key, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}

	public static function set_option( $key, $value ) {
		$GLOBALS['paf_pixassist_options'][ $key ] = $value;
	}

	public static function save_options() {
		self::$saved++;

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

$units_response = $starter_content->list_layout_units(
	'anima-restaurant',
	'https://starter.test/wp-json/sce/v2/'
);

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
	),
	$units_response['data']['units'],
	'Layout-unit listing must expose only importable layout units in source order.'
);

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

echo "Layout unit import contract OK\n";
