<?php
/**
 * Pins cross-source layout-unit applied state, undo, and replacement.
 *
 * Standalone: run with `php tests/layout-unit-mix-and-match-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/fixtures/wp/' );
define( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN', 'pixelgrade.test' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_actions']             = array();
$GLOBALS['paf_filters']             = array();
$GLOBALS['paf_pixassist_options']   = array();
$GLOBALS['paf_theme_mods']          = array();
$GLOBALS['paf_removed_theme_mods']  = array();
$GLOBALS['paf_wp_options']          = array();
$GLOBALS['paf_transients']          = array();
$GLOBALS['paf_remote_requests']     = array();
$GLOBALS['paf_inserted_posts']      = array();
$GLOBALS['paf_deleted_posts']       = array();
$GLOBALS['paf_object_terms']        = array();
$GLOBALS['paf_posts']               = array();
$GLOBALS['paf_terms']               = array();
$GLOBALS['paf_deleted_terms']       = array();
$GLOBALS['paf_attachment_metadata'] = array();
$GLOBALS['paf_deleted_attachments'] = array();
$GLOBALS['paf_cache_flushes']       = 0;
$GLOBALS['paf_style_cache_actions'] = array();
$GLOBALS['paf_next_post_id']        = 600;

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
	return true;
}

function remove_action( $hook, $callback, $priority = 10 ) {
	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$args[0] = $value;
		$value   = call_user_func_array( $entry['callback'], array_slice( $args, 0, (int) $entry['args'] ) );
		$args[0] = $value;
	}

	return $value;
}

function do_action( $hook ) {
	if ( 'style_manager/invalidate_all_caches' === $hook || 'customify_invalidate_all_caches' === $hook ) {
		$GLOBALS['paf_style_cache_actions'][] = $hook;
	}

	if ( empty( $GLOBALS['paf_actions'][ $hook ] ) ) {
		return;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_actions'][ $hook ] as $entry ) {
		call_user_func_array( $entry['callback'], array_slice( $args, 0, (int) $entry['args'] ) );
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

function sanitize_title( $key ) {
	return sanitize_key( $key );
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
		return paf_remote_response(
			array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'posts' => paf_remote_posts( isset( $args['body']['post_type'] ) ? $args['body']['post_type'] : '' ),
				),
			)
		);
	}

	return paf_remote_response( array( 'code' => 'not_found' ), 404 );
}

function wp_remote_get( $url, $args = array() ) {
	$GLOBALS['paf_remote_requests'][] = array( $url, $args );

	if ( false !== strpos( $url, '/wp-json/sce/v2/data' ) ) {
		return paf_remote_response(
			array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'taxonomies'    => array(),
					'post_types'    => array(),
					'post_settings' => array( 'mods' => array() ),
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

function paf_remote_posts( $post_type ) {
	if ( 'wp_template_part' !== $post_type ) {
		return array();
	}

	return array(
		array(
			'ID'                    => 198,
			'post_title'            => 'Field Notes Header',
			'post_content'          => '<!-- wp:paragraph --><p>New header</p><!-- /wp:paragraph -->',
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
			'guid'                  => 'https://field.test/?post_type=wp_template_part&p=198',
			'meta'                  => array(),
			'taxonomies'            => array(
				'wp_theme' => array( 'anima' ),
			),
		),
	);
}

function taxonomy_exists( $taxonomy ) {
	return in_array( $taxonomy, array( 'nav_menu', 'wp_theme' ), true );
}

function term_exists( $term_id, $taxonomy = '' ) {
	return ! empty( $GLOBALS['paf_terms'][ $taxonomy ][ (int) $term_id ] );
}

function wp_delete_term( $term_id, $taxonomy ) {
	unset( $GLOBALS['paf_terms'][ $taxonomy ][ (int) $term_id ] );
	$GLOBALS['paf_deleted_terms'][] = array( (int) $term_id, $taxonomy );

	return true;
}

function wp_insert_post( $args ) {
	$post_id = ! empty( $args['ID'] ) ? (int) $args['ID'] : ++$GLOBALS['paf_next_post_id'];

	$GLOBALS['paf_posts'][ $post_id ]          = true;
	$GLOBALS['paf_inserted_posts'][ $post_id ] = $args;

	return $post_id;
}

function wp_update_post( $args ) {
	return true;
}

function wp_delete_post( $post_id, $force_delete = false ) {
	unset( $GLOBALS['paf_posts'][ (int) $post_id ] );
	$GLOBALS['paf_deleted_posts'][] = array( (int) $post_id, (bool) $force_delete );

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

function remove_theme_mod( $key ) {
	unset( $GLOBALS['paf_theme_mods'][ $key ] );
	$GLOBALS['paf_removed_theme_mods'][] = $key;
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

function wp_delete_attachment( $attachment_id, $force_delete = false ) {
	unset( $GLOBALS['paf_attachment_metadata'][ (int) $attachment_id ] );
	$GLOBALS['paf_deleted_attachments'][] = array( (int) $attachment_id, (bool) $force_delete );

	return true;
}

function wp_get_attachment_image_src( $image_id, $size = 'thumbnail' ) {
	return false;
}

function get_intermediate_image_sizes() {
	return array();
}

function wp_cache_flush() {
	$GLOBALS['paf_cache_flushes']++;

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

	public function get_error_code() {
		return $this->code;
	}

	public function get_error_message() {
		return $this->message;
	}

	public function get_error_data() {
		return $this->data;
	}
}

class WP_REST_Response {}

class PAF_WPDB {
	public $posts = 'wp_posts';
	public $postmeta = 'wp_postmeta';
	public $options = 'wp_options';
	public $queries = array();

	public function get_var( $sql ) {
		return 0;
	}

	public function prepare( $sql ) {
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
						'id'          => 'field-notes',
						'url'         => 'https://field.test/',
						'baseRestUrl' => 'https://field.test/wp-json/sce/v2/',
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

function paf_seed_mixed_journal() {
	$GLOBALS['paf_pixassist_options'] = array(
		'imported_starter_content' => array(
			'olive-ash'   => array(
				'post_types'    => array(
					'wp_template_part' => array( 98 => 501 ),
					'nav_menu_item'    => array( 60 => 502 ),
				),
				'taxonomies'    => array(
					'nav_menu' => array( 18 => 701 ),
				),
				'media'         => array(
					'ignored' => array( 38 => 801 ),
				),
				'post_settings' => array(
					'mods' => array(
						'custom_logo'        => 42,
						'nav_menu_locations' => array(
							'primary' => 7,
							'footer'  => 8,
						),
					),
				),
				'layout_units'  => array(
					'wp_template_part:header' => array(
						'type'          => 'wp_template_part',
						'slug'          => 'header',
						'title'         => 'Header',
						'sourceId'      => 98,
						'localId'       => 501,
						'demoKey'       => 'olive-ash',
						'sourceTitle'   => 'Olive & Ash',
						'locationSlugs' => array( 'primary' ),
						'journal'       => array(
							'post_types'    => array(
								'wp_template_part' => array( 98 => 501 ),
								'nav_menu_item'    => array( 60 => 502 ),
							),
							'taxonomies'    => array(
								'nav_menu' => array( 18 => 701 ),
							),
							'media'         => array(
								'ignored' => array( 38 => 801 ),
							),
							'post_settings' => array(
								'mods' => array(
									'custom_logo'        => 42,
									'nav_menu_locations' => array(
										'primary' => 7,
										'footer'  => 8,
									),
								),
							),
						),
					),
				),
			),
			'field-notes' => array(
				'post_types'   => array(
					'wp_template' => array( 120 => 601 ),
				),
				'layout_units' => array(
					'wp_template:home' => array(
						'type'        => 'wp_template',
						'slug'        => 'home',
						'title'       => 'Home',
						'sourceId'    => 120,
						'localId'     => 601,
						'demoKey'     => 'field-notes',
						'sourceTitle' => 'Field Notes',
						'journal'     => array(
							'post_types' => array(
								'wp_template' => array( 120 => 601 ),
							),
						),
					),
				),
			),
		),
	);

	$GLOBALS['paf_theme_mods'] = array(
		'custom_logo'        => 801,
		'nav_menu_locations' => array(
			'primary' => 701,
			'footer'  => 8,
		),
	);

	$GLOBALS['paf_wp_options']          = array( 'default_category' => 1 );
	$GLOBALS['paf_posts']               = array_fill_keys( array( 501, 502, 601 ), true );
	$GLOBALS['paf_terms']               = array( 'nav_menu' => array( 701 => true ) );
	$GLOBALS['paf_attachment_metadata'] = array( 801 => array( 'imported_with_pixassist' => true ) );
	$GLOBALS['paf_deleted_posts']       = array();
	$GLOBALS['paf_deleted_terms']       = array();
	$GLOBALS['paf_deleted_attachments'] = array();
	$GLOBALS['paf_inserted_posts']      = array();
	$GLOBALS['paf_removed_theme_mods']  = array();
	PixelgradeAssistant_Admin::$saved   = 0;
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

paf_seed_mixed_journal();

assert_true( method_exists( $starter_content, 'get_applied_layout_units' ), 'Starter Content must expose get_applied_layout_units().' );
assert_true( method_exists( $starter_content, 'undo_layout_unit' ), 'Starter Content must expose undo_layout_unit().' );

$applied = $starter_content->get_applied_layout_units();
assert_same( 2, count( $applied ), 'Applied-state reporting must include units from multiple sources.' );
assert_same( 'Olive & Ash', $applied['wp_template_part:header']['sourceTitle'], 'Applied header state must report its source title.' );
assert_same( 'Field Notes', $applied['wp_template:home']['sourceTitle'], 'Applied template state must report its source title.' );

$undo = $starter_content->undo_layout_unit( 'wp_template_part', 'header' );
assert_same( 'success', $undo['code'], 'Undoing one applied layout unit must succeed.' );
assert_same( array( array( 501, true ), array( 502, true ) ), $GLOBALS['paf_deleted_posts'], 'Undo must delete only the selected unit posts and menu items.' );
assert_same( array( array( 701, 'nav_menu' ) ), $GLOBALS['paf_deleted_terms'], 'Undo must delete only the selected unit menu term.' );
assert_same( array( array( 801, true ) ), $GLOBALS['paf_deleted_attachments'], 'Undo must delete only tagged media journaled to the selected unit.' );
assert_same( 42, $GLOBALS['paf_theme_mods']['custom_logo'], 'Undo must restore the selected unit logo setting.' );
assert_same(
	array(
		'primary' => 7,
		'footer'  => 8,
	),
	$GLOBALS['paf_theme_mods']['nav_menu_locations'],
	'Undo must restore only the selected unit menu location while preserving other locations.'
);

$remaining = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
assert_true( empty( $remaining['olive-ash'] ), 'Undo must remove an empty source journal after the selected unit is reverted.' );
assert_same( array( 120 => 601 ), $remaining['field-notes']['post_types']['wp_template'], 'Undo must keep the other source template journal intact.' );

$applied = $starter_content->get_applied_layout_units();
assert_same( array( 'wp_template:home' ), array_keys( $applied ), 'Applied-state reporting must keep only the remaining unit after undo.' );

paf_seed_mixed_journal();

$replace = $starter_content->import_layout_unit(
	'field-notes',
	'https://field.test/wp-json/sce/v2/',
	'wp_template_part',
	'header'
);

assert_same( 'success', $replace['code'], 'Applying a unit to an occupied slot must replace the previous slot.' );
assert_same( array( array( 501, true ), array( 502, true ) ), $GLOBALS['paf_deleted_posts'], 'Slot replacement must undo the old slot before importing the new one.' );

$after_replace = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
assert_true( empty( $after_replace['olive-ash'] ), 'Slot replacement must remove the replaced source journal.' );
assert_same( 2, count( $after_replace['field-notes']['layout_units'] ), 'Slot replacement must keep the existing template and add the new header slot.' );
assert_true( isset( $after_replace['field-notes']['layout_units']['wp_template_part:header'] ), 'Slot replacement must record the new source as applied for the header slot.' );
assert_same( array( 120 => 601 ), $after_replace['field-notes']['post_types']['wp_template'], 'Slot replacement must keep the existing template from the other source.' );

echo "Layout unit mix-and-match contract OK\n";
