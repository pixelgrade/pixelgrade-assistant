<?php
/**
 * Pins full-starter import parity details found during Anima LT smoke testing.
 *
 * Standalone: run with `php tests/starter-import-parity-test.php`.
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
if ( ! defined( 'OBJECT' ) ) {
	define( 'OBJECT', 'OBJECT' );
}

$GLOBALS['paf_filters']                 = array();
$GLOBALS['paf_pixassist_options']       = array();
$GLOBALS['paf_wp_options']              = array();
$GLOBALS['paf_theme_mods']              = array();
$GLOBALS['paf_posts']                   = array();
$GLOBALS['paf_inserted_posts']          = array();
$GLOBALS['paf_deleted_posts']           = array();
$GLOBALS['paf_post_formats']            = array();
$GLOBALS['paf_object_terms']            = array();
$GLOBALS['paf_term_meta']               = array();
$GLOBALS['paf_remote_terms']            = array();
$GLOBALS['paf_remote_posts']            = array();
$GLOBALS['paf_remote_wp_post_formats']  = array();
$GLOBALS['paf_next_post_id']            = 3001;

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	$args = func_get_args();
	array_shift( $args );

	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		$args[0] = call_user_func_array( $callback, $args );
	}

	return $args[0];
}

function do_action() {}
function wp_defer_term_counting( $defer ) { return true; }
function wp_defer_comment_counting( $defer ) { return true; }
function wp_suspend_cache_invalidation( $suspend ) { return true; }
function wp_cache_flush() { return true; }
function get_taxonomies() { return array( 'nav_menu', 'post_format' ); }
function delete_option( $key ) { unset( $GLOBALS['paf_wp_options'][ $key ] ); return true; }
function _get_term_hierarchy( $taxonomy ) { return array(); }

function sanitize_key( $key ) {
	return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $key ) );
}

function sanitize_text_field( $value ) {
	return is_string( $value ) ? trim( $value ) : $value;
}

function absint( $value ) {
	return abs( (int) $value );
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/' ) . '/';
}

function wp_strip_all_tags( $string ) {
	return trim( strip_tags( (string) $string ) );
}

function wp_slash( $value ) {
	return $value;
}

function wp_slash_strings_only( $value ) {
	return $value;
}

function wp_json_encode( $data, $options = 0, $depth = 512 ) {
	return json_encode( $data, $options, $depth );
}

function maybe_unserialize( $value ) {
	return $value;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
}

function rest_ensure_response( $value ) {
	return $value;
}

function taxonomy_exists( $taxonomy ) {
	return in_array( $taxonomy, array( 'nav_menu', 'post_format', 'category', 'post_tag' ), true );
}

function get_permalink( $id ) {
	return '';
}

function has_blocks( $content ) {
	return false;
}

function get_bloginfo( $show = '' ) {
	return '6.5';
}

function site_url( $path = '' ) {
	return 'https://local.test' . ( $path ? '/' . ltrim( $path, '/' ) : '' );
}

function set_transient( $key, $value, $ttl = 0 ) {
	$GLOBALS['paf_transients'][ $key ] = $value;

	return true;
}

function get_transient( $key ) {
	return isset( $GLOBALS['paf_transients'][ $key ] ) ? $GLOBALS['paf_transients'][ $key ] : false;
}

function delete_transient( $key ) {
	unset( $GLOBALS['paf_transients'][ $key ] );

	return true;
}

function wp_remote_request( $url, $args = array() ) {
	if ( false !== strpos( $url, '/wp-json/wp/v2/posts' ) ) {
		return array(
			'body' => json_encode( array_values( $GLOBALS['paf_remote_wp_post_formats'] ) ),
		);
	}

	if ( preg_match( '#/wp-json/?$#', $url ) ) {
		return array(
			'body' => json_encode( array(
				'name'        => 'NOTES',
				'description' => 'Journal',
			) ),
		);
	}

	if ( 'https://starter.test/anima-blog/' === $url ) {
		return array(
			'body' => '<body class="has-site-frame has-site-frame-menu has-site-frame-frame"><div class="c-site-frame sm-palette-2 sm-variation-12"></div></body>',
		);
	}

	if ( false !== strpos( $url, '/terms' ) ) {
		$taxonomy = isset( $args['body']['taxonomy'] ) ? $args['body']['taxonomy'] : '';
		$include  = isset( $args['body']['include'] ) ? (array) $args['body']['include'] : array();
		$terms    = array();
		foreach ( $include as $term_id ) {
			$term_id = absint( $term_id );
			if ( isset( $GLOBALS['paf_remote_terms'][ $taxonomy ][ $term_id ] ) ) {
				$terms[] = $GLOBALS['paf_remote_terms'][ $taxonomy ][ $term_id ];
			}
		}

		return array(
			'body' => json_encode( array(
				'code' => 'success',
				'data' => array( 'terms' => $terms ),
			) ),
		);
	}

	if ( false !== strpos( $url, '/posts' ) ) {
		$post_type = isset( $args['body']['post_type'] ) ? $args['body']['post_type'] : '';
		$include   = isset( $args['body']['include'] ) ? $args['body']['include'] : array();
		$posts     = array();
		if ( '' === $include || array() === $include ) {
			$posts = isset( $GLOBALS['paf_remote_posts'][ $post_type ] ) ? array_values( $GLOBALS['paf_remote_posts'][ $post_type ] ) : array();
		} else {
			foreach ( (array) $include as $post_id ) {
				$post_id = absint( $post_id );
				if ( isset( $GLOBALS['paf_remote_posts'][ $post_type ][ $post_id ] ) ) {
					$posts[] = $GLOBALS['paf_remote_posts'][ $post_type ][ $post_id ];
				}
			}
		}

		return array(
			'body' => json_encode( array(
				'code' => 'success',
				'data' => array( 'posts' => $posts ),
			) ),
		);
	}

	return array( 'body' => json_encode( array( 'code' => 'success', 'data' => array() ) ) );
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

function wp_remote_retrieve_response_code( $response ) {
	return isset( $response['response']['code'] ) ? (int) $response['response']['code'] : 200;
}

function wp_insert_term( $name, $taxonomy, $args = array() ) {
	$slug = isset( $args['slug'] ) ? $args['slug'] : sanitize_key( $name );
	$ids  = array(
		'chrome-menu'            => 2001,
		'header-primary-managed' => 2002,
	);

	return array(
		'term_id'          => isset( $ids[ $slug ] ) ? $ids[ $slug ] : count( $GLOBALS['paf_term_meta'] ) + 2100,
		'term_taxonomy_id' => 1,
	);
}

function wp_update_term( $term_id, $taxonomy, $args = array() ) {
	return array( 'term_id' => $term_id );
}

function update_term_meta( $term_id, $key, $value ) {
	$GLOBALS['paf_term_meta'][ $term_id ][ $key ] = $value;

	return true;
}

function clean_term_cache( $term_id, $taxonomy = '' ) {
	return true;
}

function wp_insert_post( $args ) {
	$id         = $GLOBALS['paf_next_post_id']++;
	$args['ID'] = $id;

	$GLOBALS['paf_inserted_posts'][ $id ] = $args;
	$GLOBALS['paf_posts'][ $id ]          = (object) array(
		'ID'           => $id,
		'post_type'    => isset( $args['post_type'] ) ? $args['post_type'] : 'post',
		'post_name'    => isset( $args['post_name'] ) ? $args['post_name'] : '',
		'post_title'   => isset( $args['post_title'] ) ? $args['post_title'] : '',
		'post_content' => isset( $args['post_content'] ) ? $args['post_content'] : '',
		'post_status'  => isset( $args['post_status'] ) ? $args['post_status'] : 'publish',
	);

	return $id;
}

function wp_update_post( $args ) {
	return isset( $args['ID'] ) ? $args['ID'] : 0;
}

function wp_set_object_terms( $post_id, $terms, $taxonomy, $append = false ) {
	$GLOBALS['paf_object_terms'][] = array(
		'post_id'  => $post_id,
		'terms'    => $terms,
		'taxonomy' => $taxonomy,
	);

	return array( 1 );
}

function set_post_format( $post_id, $format ) {
	$GLOBALS['paf_post_formats'][ $post_id ] = $format;

	return true;
}

function get_post_format_slugs() {
	return array( 'aside', 'gallery', 'link', 'image', 'quote', 'status', 'video', 'audio', 'chat' );
}

function get_theme_mod( $name, $default = false ) {
	return array_key_exists( $name, $GLOBALS['paf_theme_mods'] ) ? $GLOBALS['paf_theme_mods'][ $name ] : $default;
}

function set_theme_mod( $name, $value ) {
	$GLOBALS['paf_theme_mods'][ $name ] = $value;

	return true;
}

function get_option( $name, $default = false ) {
	return array_key_exists( $name, $GLOBALS['paf_wp_options'] ) ? $GLOBALS['paf_wp_options'][ $name ] : $default;
}

function update_option( $name, $value ) {
	$GLOBALS['paf_wp_options'][ $name ] = $value;

	return true;
}

function get_page_by_path( $path, $output = OBJECT, $post_type = 'page' ) {
	foreach ( $GLOBALS['paf_posts'] as $post ) {
		if ( empty( $post->deleted ) && $post->post_type === $post_type && $post->post_name === $path ) {
			return $post;
		}
	}

	return null;
}

function get_post_meta( $post_id, $key, $single = false ) {
	if ( isset( $GLOBALS['paf_posts'][ $post_id ]->meta[ $key ] ) ) {
		return $GLOBALS['paf_posts'][ $post_id ]->meta[ $key ];
	}

	return $single ? '' : array();
}

function wp_delete_post( $post_id, $force_delete = false ) {
	if ( isset( $GLOBALS['paf_posts'][ $post_id ] ) ) {
		$GLOBALS['paf_posts'][ $post_id ]->deleted = true;
		$GLOBALS['paf_deleted_posts'][]            = $post_id;

		return $GLOBALS['paf_posts'][ $post_id ];
	}

	return false;
}

function wp_is_block_theme() {
	return false;
}

class WP_Error {}
class WP_REST_Response {}

class PAF_WPDB {
	public $posts = 'wp_posts';
	public $postmeta = 'wp_postmeta';
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
	public static function get_option( $key, $default = null, $force_refresh = false ) {
		return array_key_exists( $key, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}

	public static function set_option( $key, $value ) {
		$GLOBALS['paf_pixassist_options'][ $key ] = $value;
	}

	public static function save_options() {
		return true;
	}

	public static function is_development_url( $url ) {
		return false;
	}

	public static function get_config() {
		return array(
			'starterContent' => array(
				'demos' => array(
					array(
						'id'          => 'anima-blog',
						'url'         => 'https://starter.test/anima-blog/',
						'baseRestUrl' => 'https://starter.test/anima-blog/wp-json/sce/v2/',
					),
				),
			),
		);
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

function paf_source_post_record( $id, $post_type, $title, $overrides = array() ) {
	return array_merge(
		array(
			'ID'                    => $id,
			'post_title'            => $title,
			'post_content'          => '',
			'post_content_filtered' => '',
			'post_excerpt'          => '',
			'post_status'           => 'publish',
			'post_name'             => sanitize_key( $title ),
			'post_type'             => $post_type,
			'post_date'             => '2026-01-01 00:00:00',
			'post_date_gmt'         => '2026-01-01 00:00:00',
			'post_modified'         => '2026-01-01 00:00:00',
			'post_modified_gmt'     => '2026-01-01 00:00:00',
			'menu_order'            => 0,
			'guid'                  => (string) $id,
			'post_parent'           => 0,
			'meta'                  => array(),
			'taxonomies'            => array(),
		),
		$overrides
	);
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$GLOBALS['paf_posts'][1] = (object) array(
	'ID'           => 1,
	'post_type'    => 'post',
	'post_name'    => 'hello-world',
	'post_title'   => 'Hello world!',
	'post_content' => 'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!',
	'post_status'  => 'publish',
);
$GLOBALS['paf_posts'][2] = (object) array(
	'ID'           => 2,
	'post_type'    => 'page',
	'post_name'    => 'sample-page',
	'post_title'   => 'Sample Page',
	'post_content' => 'This is an example page. It is different from a blog post because it will stay in one place.',
	'post_status'  => 'publish',
);

$GLOBALS['paf_remote_terms']['nav_menu'] = array(
	18 => array(
		'term_id'     => 18,
		'name'        => 'Chrome Menu',
		'slug'        => 'chrome-menu',
		'taxonomy'    => 'nav_menu',
		'description' => '',
		'parent'      => 0,
		'meta'        => array(),
	),
	50 => array(
		'term_id'     => 50,
		'name'        => 'Header: Primary (managed)',
		'slug'        => 'header-primary-managed',
		'taxonomy'    => 'nav_menu',
		'description' => '',
		'parent'      => 0,
		'meta'        => array(
			'_novablocks_generated_for' => array( 'primary' ),
		),
	),
);

$GLOBALS['paf_remote_posts']['post'][18] = array(
	'ID'                    => 18,
	'post_title'            => 'Quote: On Making Time',
	'post_content'          => 'Almost everything worth doing is won by patience.',
	'post_content_filtered' => '',
	'post_excerpt'          => '',
	'post_status'           => 'publish',
	'post_name'             => 'paul-graham-quote',
	'post_type'             => 'post',
	'post_date'             => '2026-01-01 00:00:00',
	'post_date_gmt'         => '2026-01-01 00:00:00',
	'post_modified'         => '2026-01-01 00:00:00',
	'post_modified_gmt'     => '2026-01-01 00:00:00',
	'menu_order'            => 0,
	'guid'                  => '18',
	'post_parent'           => 0,
	'format'                => null,
	'meta'                  => array(),
	'taxonomies'            => array(
		'post_format' => array( '' ),
	),
);

$GLOBALS['paf_remote_wp_post_formats'][18] = array(
	'id'     => 18,
	'format' => 'quote',
);

$GLOBALS['paf_remote_posts']['nav_menu_item'][1162] = paf_source_post_record(
	1162,
	'nav_menu_item',
	'Search',
	array(
		'post_name'  => 'search',
		'menu_order' => 1,
		'meta'       => array(
			'_menu_item_type'             => array( 'custom' ),
			'_menu_item_menu_item_parent' => array( '0' ),
			'_menu_item_object_id'        => array( '1162' ),
			'_menu_item_object'           => array( 'custom' ),
			'_menu_item_url'              => array( 'https://starter.test/anima-blog/?s=' ),
		),
		'taxonomies' => array(
			'nav_menu' => array( 18 ),
		),
	)
);
$GLOBALS['paf_remote_posts']['nav_menu_item'][1244] = paf_source_post_record(
	1244,
	'nav_menu_item',
	'Home',
	array(
		'post_name'  => 'home-2',
		'menu_order' => 1,
		'meta'       => array(
			'_menu_item_type'             => array( 'custom' ),
			'_menu_item_menu_item_parent' => array( '0' ),
			'_menu_item_object_id'        => array( '1244' ),
			'_menu_item_object'           => array( 'custom' ),
			'_menu_item_url'              => array( 'https://starter.test/anima-blog/' ),
		),
		'taxonomies' => array(
			'nav_menu' => array( 50 ),
		),
	)
);

$source_data = array(
	'taxonomies'    => array(
		array(
			'name'     => 'nav_menu',
			'ids'      => array( 18 ),
			'priority' => 10,
		),
	),
	'post_types'    => array(
		array(
			'name'     => 'post',
			'ids'      => array( 18 ),
			'priority' => 10,
			),
			array(
				'name'     => 'nav_menu_item',
				'ids'      => array( 1162 ),
				'priority' => 900,
			),
		),
		'post_settings' => array(
			'mods'    => array(
			'nav_menu_locations' => array(
				'primary'    => 50,
				'site-frame' => 18,
			),
		),
		'options' => array(),
	),
);

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
$result          = $starter_content->import_starter( 'anima-blog', 'https://starter.test/anima-blog/wp-json/sce/v2/', $source_data );

assert_same( 'success', $result['code'], 'The full starter import should succeed.' );
assert_same( array( 1, 2 ), $GLOBALS['paf_deleted_posts'], 'Untouched WordPress default post/page should be removed before starter content is imported.' );
assert_same(
	array(
		'primary'    => 2002,
		'site-frame' => 2001,
	),
	$GLOBALS['paf_theme_mods']['nav_menu_locations'],
	'Nav menu locations should be remapped to local term IDs, including location-only menus missing from the taxonomy manifest.'
);

$imported = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-blog'];
assert_same( array( 18 => 2001, 50 => 2002 ), $imported['taxonomies']['nav_menu'], 'The nav menu journal should include manifest menus and location-only menus.' );
assert_same( array( 1162, 1244 ), array_keys( $imported['post_types']['nav_menu_item'] ), 'The nav menu item queue should include items for menus referenced only by nav_menu_locations.' );

$local_primary_menu_item_id = $imported['post_types']['nav_menu_item'][1244];
assert_same( 'Home', $GLOBALS['paf_inserted_posts'][ $local_primary_menu_item_id ]['post_title'], 'The primary menu item should be imported.' );
assert_same( array( 2002 ), $GLOBALS['paf_inserted_posts'][ $local_primary_menu_item_id ]['tax_input']['nav_menu'], 'The primary menu item should be attached to the imported primary menu term.' );

$local_post_id = $imported['post_types']['post'][18];
assert_same( 'quote', $GLOBALS['paf_post_formats'][ $local_post_id ], 'Imported posts should keep their source post format even when SCE omits it and WP REST has it.' );
assert_same( 'editorial', $GLOBALS['paf_wp_options']['sm_site_frame_style'], 'Site Frame style should be inferred from source frontend classes when SCE omits it.' );
assert_same( 2, $GLOBALS['paf_wp_options']['sm_site_frame_palette'], 'Site Frame palette should be inferred from source frontend classes when SCE omits it.' );
assert_same( 12, $GLOBALS['paf_wp_options']['sm_site_frame_variation'], 'Site Frame variation should be inferred from source frontend classes when SCE omits it.' );
assert_same( 'NOTES', $GLOBALS['paf_wp_options']['blogname'], 'Source site title should be imported from the WP REST root when the SCE payload omits it.' );
assert_same( 'Journal', $GLOBALS['paf_wp_options']['blogdescription'], 'Source site tagline should be imported from the WP REST root when the SCE payload omits it.' );

$GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-blog']['media']['ignored'][299] = 6001;
assert_same(
	6001,
	apply_filters( 'pixassist_sce_import_post_option_site_logo', 299, 'anima-blog' ),
	'The core site_logo option should use the local attachment imported for the source logo.'
);

// The Composer/UI path imports taxonomies and post settings through separate REST steps. It must
// still import/remap menus referenced only by nav_menu_locations, not only the manifest menus.
$GLOBALS['paf_pixassist_options'] = array();
$GLOBALS['paf_theme_mods']        = array();
$GLOBALS['paf_inserted_posts']    = array();
$GLOBALS['paf_posts']             = array();
$GLOBALS['paf_deleted_posts']     = array();
$GLOBALS['paf_next_post_id']      = 4001;

$taxonomy_request = new class {
	public function get_params() {
		return array(
			'demo_key' => 'anima-blog',
			'url'      => 'https://starter.test/anima-blog/wp-json/sce/v2/',
			'type'     => 'taxonomy',
			'args'     => array(
				'tax' => 'nav_menu',
				'ids' => array( 18 ),
			),
		);
	}

	public function get_param( $key ) {
		$params = $this->get_params();
		return isset( $params[ $key ] ) ? $params[ $key ] : null;
	}
};
$settings_request = new class {
	public function get_params() {
		return array(
			'demo_key' => 'anima-blog',
			'url'      => 'https://starter.test/anima-blog/wp-json/sce/v2/',
			'type'     => 'post_settings',
			'args'     => array(
				'data' => array(
					'mods'    => array(
						'nav_menu_locations' => array(
							'primary'    => 50,
							'site-frame' => 18,
						),
					),
					'options' => array(),
				),
			),
		);
	}

	public function get_param( $key ) {
		$params = $this->get_params();
		return isset( $params[ $key ] ) ? $params[ $key ] : null;
	}
};

$starter_content->rest_import_step( $taxonomy_request );
$starter_content->rest_import_step( $settings_request );

assert_same(
	array(
		'primary'    => 2002,
		'site-frame' => 2001,
	),
	$GLOBALS['paf_theme_mods']['nav_menu_locations'],
	'The step-by-step UI import should remap nav_menu_locations, including location-only generated menus.'
);

$step_imported = $GLOBALS['paf_pixassist_options']['imported_starter_content']['anima-blog'];
assert_same( array( 18 => 2001, 50 => 2002 ), $step_imported['taxonomies']['nav_menu'], 'The step-by-step UI import should preserve manifest menu mappings and add location-only menu mappings.' );
assert_same( array( 1162, 1244 ), array_keys( $step_imported['post_types']['nav_menu_item'] ), 'The step-by-step UI import should import menu items for location-only menus before applying post settings.' );

$replace_demo_urls = new ReflectionMethod( $starter_content, 'replace_demo_urls_in_content' );
$replace_demo_urls->setAccessible( true );
$replace_demo_urls->invoke( $starter_content );
assert_same(
	true,
	in_array( "UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'https://starter.test/anima-blog/', 'https://local.test/') WHERE meta_key='_menu_item_url'", $GLOBALS['wpdb']->queries, true ),
	'End import should rebase custom menu-item URLs that point to the source site root, not only the SCE REST base.'
);

echo "starter-import-parity-test: OK\n";
