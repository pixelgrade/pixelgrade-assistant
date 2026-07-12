<?php
/**
 * Pins the slug-collision remap contract for full-site starter imports.
 *
 * Regression guard: when a demo page's slug already exists locally and is not overwritten,
 * `import_post_type()` must journal the demo id as the EXISTING LOCAL post id, not the remote
 * demo id. Otherwise `page_on_front` / `page_for_posts` / nav-menu remaps resolve to a
 * non-existent id, leaving a blank front page and an unset "Front page displays" setting
 * (the felt-lt full-site import symptom). Pixelgrade Care mapped to the existing id; the
 * Assistant rewrite regressed this to the remote id.
 *
 * Standalone: run with `php tests/starter-slug-collision-remap-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_filters']           = array();
$GLOBALS['paf_pixassist_options'] = array();
// Map of post_name => existing local post ID, consulted by the_slug_exists() via $wpdb.
$GLOBALS['paf_slug_ids']          = array();

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

function sanitize_key( $key ) {
	return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $key ) );
}

function absint( $value ) {
	return abs( (int) $value );
}

function esc_url_raw( $url ) {
	return $url;
}

function trailingslashit( $string ) {
	return rtrim( $string, '/' ) . '/';
}

function wp_strip_all_tags( $string ) {
	return trim( strip_tags( (string) $string ) );
}

function maybe_unserialize( $value ) {
	return $value;
}

function taxonomy_exists( $tax ) {
	return false;
}

function get_permalink( $id ) {
	return '';
}

// The collision branch's media-repair pass looks the existing post up; returning null makes it
// bail, which is right for this test — it pins the id mapping, not the repair.
function get_post( $id ) {
	return null;
}

function get_transient( $key ) {
	return false;
}

function set_transient( $key, $value, $ttl = 0 ) {
	return true;
}

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
}

function wp_remote_request( $url, $args = array() ) {
	return array( 'body' => $GLOBALS['paf_remote_body'] );
}

function wp_remote_retrieve_body( $response ) {
	return isset( $response['body'] ) ? $response['body'] : '';
}

function wp_slash_strings_only( $value ) {
	return $value;
}

function wp_insert_post( $args ) {
	// Not expected to run in the collision path (the record is skipped before insertion).
	$GLOBALS['paf_inserted_posts'][] = $args;

	return 9999;
}

function wp_update_post( $args ) {
	return true;
}

function wp_set_object_terms() {
	return true;
}

function rest_ensure_response( $value ) {
	return $value;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

class WP_Error {}

class PAF_WPDB {
	public $posts = 'wp_posts';

	public function get_var( $sql ) {
		if ( preg_match( "/post_name = '([^']+)'/", $sql, $m ) ) {
			$slug = $m[1];
			if ( isset( $GLOBALS['paf_slug_ids'][ $slug ] ) ) {
				return $GLOBALS['paf_slug_ids'][ $slug ];
			}
		}

		return 0;
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
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

/**
 * Scenario: the site already has a page with slug "home" at local ID 49 (e.g. a previously
 * imported demo). The felt-lt full-site import then ships its own front page as demo ID 1733,
 * also slug "home". With overwrite disabled (the default), the importer skips inserting the
 * demo page and must record 1733 => 49 so the front-page remap resolves to the real page.
 */
$GLOBALS['paf_slug_ids'] = array( 'home' => 49 );

$demo_page = array(
	'ID'                    => 1733,
	'post_title'            => 'Home',
	'post_content'          => '',
	'post_content_filtered' => '',
	'post_excerpt'          => '',
	'post_status'           => 'publish',
	'post_name'             => 'home',
	'post_type'             => 'page',
	'post_date'             => '2026-01-01 00:00:00',
	'post_date_gmt'         => '2026-01-01 00:00:00',
	'post_modified'         => '2026-01-01 00:00:00',
	'post_modified_gmt'     => '2026-01-01 00:00:00',
	'menu_order'            => 0,
	'guid'                  => '5',
	'post_parent'           => 0,
	'meta'                  => array(),
	'taxonomies'            => array(),
);

$GLOBALS['paf_remote_body'] = json_encode( array(
	'code' => 'success',
	'data' => array( 'posts' => array( $demo_page ) ),
) );

$method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'import_post_type' );
$method->setAccessible( true );
$imported_ids = $method->invoke( $starter_content, 'felt-lt', 'https://starter.test/wp-json/sce/v2/', array(
	'post_type' => 'page',
	'ids'       => array( 1733 ),
) );

// 1. The journal must map the demo page id to the EXISTING local page id, not the remote id.
assert_same(
	49,
	isset( $imported_ids[1733] ) ? (int) $imported_ids[1733] : null,
	'Slug-collided demo page must be journaled as the existing local id (49), not the remote demo id (1733).'
);

$journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
assert_same(
	49,
	isset( $journal['felt-lt']['post_types']['page'][1733] ) ? (int) $journal['felt-lt']['post_types']['page'][1733] : null,
	'The persisted journal mapping for the collided page must point at the existing local id.'
);

// 2. The colliding demo page must NOT have been inserted as a duplicate.
assert_same(
	0,
	isset( $GLOBALS['paf_inserted_posts'] ) ? count( $GLOBALS['paf_inserted_posts'] ) : 0,
	'A slug-collided page must be skipped, not inserted as a duplicate.'
);

// 3. The consequence: page_on_front / page_for_posts remaps resolve to the real local page,
//    so the front page renders and Settings -> Reading keeps a valid selection.
assert_same(
	49,
	(int) $starter_content->filter_post_option_page_on_front( 1733, 'felt-lt' ),
	'page_on_front must remap the demo front-page id to the existing local page (no dangling reference).'
);
assert_same(
	49,
	(int) $starter_content->filter_post_option_page_for_posts( 1733, 'felt-lt' ),
	'page_for_posts must remap the demo posts-page id to the existing local page.'
);

echo "starter-slug-collision-remap-test: OK" . PHP_EOL;
