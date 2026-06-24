<?php
/**
 * Performance contract for the full-site starter import hot paths. Counts the expensive operations
 * with stubs (no network) so the wins from the import perf work are measurable and guarded against
 * regression:
 *
 *   #1  save_options() invocations during the media phase  (was O(n) per media item; now 1 per batch)
 *   #2  parse_blocks() invocations during the post phase    (was 2x every post; now only query/nav posts)
 *   #3  wp_get_attachment_image_src() during the post phase (was 2x per id, rebuilt per type; now 1x + memoized)
 *
 * parse_blocks() is counted via the `block_parser_class` filter it fires exactly once per call.
 *
 * Uses the real WordPress block parser; skips cleanly if not found. Run:
 *   php tests/starter-import-perf-test.php
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );

$wp_includes = null;
foreach ( array( dirname( __DIR__ ) . '/../../../wp-includes', '/Users/georgeolaru/Local Sites/style-manager/app/public/wp-includes' ) as $cand ) {
	if ( is_file( $cand . '/blocks.php' ) && is_file( $cand . '/class-wp-block-parser.php' ) ) { $wp_includes = $cand; break; }
}
if ( null === $wp_includes ) { fwrite( STDOUT, "starter-import-perf-test: SKIP (WP block parser not found)\n" ); exit( 0 ); }

$GLOBALS['cnt'] = array( 'save_options' => 0, 'parse_blocks' => 0, 'img_src' => 0, 'request_multiple' => 0, 'remote_get' => 0 );
$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_pixassist_options'] = array();
$GLOBALS['paf_next_post_id'] = 5000;
$GLOBALS['paf_next_attach_id'] = 9000;
$GLOBALS['paf_remote_request_body'] = '';
$GLOBALS['paf_remote_get_body'] = '';

function add_action() { return true; }
function add_filter( $h, $cb, $p = 10, $a = 1 ) { $GLOBALS['paf_filters'][ $h ][] = $cb; return true; }
function remove_filter() { return true; }
function apply_filters( $hook, $value ) {
	if ( 'block_parser_class' === $hook ) { $GLOBALS['cnt']['parse_blocks']++; }
	$args = func_get_args(); array_shift( $args );
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) { return $args[0]; }
	foreach ( $GLOBALS['paf_filters'][ $hook ] as $cb ) { $args[0] = call_user_func_array( $cb, $args ); }
	return $args[0];
}
function do_action() {}
function sanitize_key( $k ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $k ) ); }
function sanitize_text_field( $s ) { return is_string( $s ) ? trim( $s ) : $s; }
function esc_url_raw( $u ) { return $u; }
function esc_attr( $s ) { return $s; }
function esc_html__( $t, $d = 'd' ) { return $t; }
function trailingslashit( $s ) { return rtrim( $s, '/' ) . '/'; }
function wp_strip_all_tags( $s ) { return trim( strip_tags( (string) $s ) ); }
function maybe_unserialize( $v ) { return $v; }
function taxonomy_exists( $t ) { return false; }
function get_permalink( $id ) { return ''; }
function get_transient( $k ) { return false; }
function set_transient( $k, $v, $t = 0 ) { return true; }
function delete_transient( $k ) { return true; }
function absint( $v ) { return abs( (int) $v ); }
function get_bloginfo( $s = '' ) { return 'version' === $s ? '7.0' : 'UTF-8'; }
function wp_json_encode( $d, $o = 0, $depth = 512 ) { return json_encode( $d, $o, $depth ); }
function get_intermediate_image_sizes() { return array( 'thumbnail', 'medium' ); }
function wp_get_attachment_image_src( $id, $size = 'thumbnail' ) { $GLOBALS['cnt']['img_src']++; return array( 'http://x/' . $id . '-' . $size . '.jpg', 100, 100 ); }

class WP_Error {}
function is_wp_error( $t ) { return $t instanceof WP_Error; }
function wp_remote_request( $url, $args = array() ) { return array( 'body' => $GLOBALS['paf_remote_request_body'] ); }
function wp_remote_get( $url, $args = array() ) { $GLOBALS['cnt']['remote_get']++; return array( 'body' => $GLOBALS['paf_remote_get_body'], 'response' => array( 'code' => 200 ) ); }
class Requests {
	public static function request_multiple( $requests, $opts = array() ) {
		$GLOBALS['cnt']['request_multiple']++;
		$out = array();
		foreach ( $requests as $key => $req ) { $r = new stdClass(); $r->status_code = 200; $r->body = $GLOBALS['paf_remote_get_body']; $out[ $key ] = $r; }
		return $out;
	}
}
function wp_remote_retrieve_body( $r ) { return isset( $r['body'] ) ? $r['body'] : ''; }
function wp_remote_retrieve_response_code( $r ) { return 200; }
function wp_slash_strings_only( $v ) { return $v; }
function wp_insert_post( $args, $e = false ) { return $GLOBALS['paf_next_post_id']++; }
function wp_update_post( $a ) { return true; }
function wp_set_object_terms() { return array( 1 ); }
function wp_upload_bits( $name, $x, $bits ) { return array( 'error' => false, 'url' => 'http://x/' . $name, 'file' => '/tmp/' . $name ); }
function wp_check_filetype( $name, $m = null ) { return array( 'ext' => 'jpg', 'type' => 'image/jpeg' ); }
function wp_insert_attachment( $a, $f ) { return $GLOBALS['paf_next_attach_id']++; }
function wp_get_attachment_metadata( $id ) { return false; }
function wp_delete_attachment( $id, $f = false ) { return true; }
function wp_generate_attachment_metadata( $id, $f ) { return array(); }
function wp_update_attachment_metadata( $id, $d ) { return true; }
function update_post_meta( $id, $k, $v ) { return true; }
function add_post_meta( $id, $k, $v ) { return true; }

function _flatten_blocks( &$blocks ) {
	$all = array(); $q = array();
	foreach ( $blocks as &$b ) { $q[] = &$b; } unset( $b );
	while ( count( $q ) > 0 ) { $b = &$q[0]; array_shift( $q ); $all[] = &$b;
		if ( ! empty( $b['innerBlocks'] ) ) { foreach ( $b['innerBlocks'] as &$ib ) { $q[] = &$ib; } unset( $ib ); } unset( $b ); }
	return $all;
}
require $wp_includes . '/class-wp-block-parser-block.php';
require $wp_includes . '/class-wp-block-parser-frame.php';
require $wp_includes . '/class-wp-block-parser.php';
require $wp_includes . '/blocks.php';

class PAF_WPDB { public $posts = 'wp_posts'; public function get_var( $sql ) { return 0; } }
$GLOBALS['wpdb'] = new PAF_WPDB();

class PixelgradeAssistant_Admin {
	public static function get_option( $k, $d = null, $f = false ) { return array_key_exists( $k, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $k ] : $d; }
	public static function set_option( $k, $v ) { $GLOBALS['paf_pixassist_options'][ $k ] = $v; }
	public static function save_options() { $GLOBALS['cnt']['save_options']++; return true; }
	public static function is_development_url( $u ) { return false; }
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';
$sc = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

function paf_post( $id, $content, $type ) {
	return array(
		'ID' => $id, 'post_title' => 'P' . $id, 'post_content' => $content, 'post_content_filtered' => '',
		'post_excerpt' => '', 'post_status' => 'publish', 'post_name' => 'p' . $id, 'post_type' => $type,
		'post_date' => '2026-01-01 00:00:00', 'post_date_gmt' => '2026-01-01 00:00:00', 'post_modified' => '2026-01-01 00:00:00',
		'post_modified_gmt' => '2026-01-01 00:00:00', 'menu_order' => 0, 'guid' => '5', 'post_parent' => 0,
		'meta' => array(), 'taxonomies' => array(),
	);
}

// 20-image media map + a taxonomy map so the post phase resolves thumbnails and runs the tax remap.
$placeholders = array(); $ignored = array();
for ( $i = 1; $i <= 10; $i++ ) { $placeholders[ $i ] = 100 + $i; }
for ( $i = 11; $i <= 20; $i++ ) { $ignored[ $i ] = 100 + $i; }
$GLOBALS['paf_pixassist_options']['imported_starter_content'] = array(
	'bench' => array( 'media' => array( 'placeholders' => $placeholders, 'ignored' => $ignored ), 'taxonomies' => array( 'post_tag' => array( 5 => 105 ) ) ),
);

// 10 posts: 3 with a wp:query block, 7 with a plain paragraph block.
$posts = array();
for ( $i = 1; $i <= 3; $i++ ) { $posts[] = paf_post( $i, '<!-- wp:query {"query":{"taxQuery":{"post_tag":[5]}}} --><div class="wp-block-query"></div><!-- /wp:query -->', 'page' ); }
for ( $i = 4; $i <= 10; $i++ ) { $posts[] = paf_post( $i, '<!-- wp:paragraph --><p>hello world</p><!-- /wp:paragraph -->', 'page' ); }
$GLOBALS['paf_remote_request_body'] = json_encode( array( 'code' => 'success', 'data' => array( 'posts' => $posts ) ) );

$m = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'import_post_type' );
$m->setAccessible( true );
// Two post-type imports in one run (page then post) — same media map, to expose the per-type memoize.
$m->invoke( $sc, 'bench', 'https://x/sce/v2/', array( 'post_type' => 'page', 'ids' => range( 1, 10 ) ) );
$m->invoke( $sc, 'bench', 'https://x/sce/v2/', array( 'post_type' => 'post', 'ids' => range( 1, 10 ) ) );
$post_phase_parse  = $GLOBALS['cnt']['parse_blocks'];
$post_phase_imgsrc = $GLOBALS['cnt']['img_src'];

// Media phase: import 20 media files; count save_options(), and the fetch strategy.
$GLOBALS['cnt']['save_options'] = 0;
$GLOBALS['cnt']['request_multiple'] = 0;
$GLOBALS['cnt']['remote_get'] = 0;
$GLOBALS['paf_pixassist_options']['imported_starter_content'] = array();
$GLOBALS['paf_remote_get_body'] = json_encode( array( 'code' => 'success', 'data' => array( 'media' => array( 'title' => 'pic', 'ext' => 'jpg', 'data' => 'data:image/jpeg;base64,' . base64_encode( 'imgbytes' ) ) ) ) );
$mm = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'import_starter_media' );
$mm->setAccessible( true );
$mm->invoke( $sc, 'bench', 'https://x/sce/v2/', array( 'placeholders' => array( 1 ), 'ignored' => range( 11, 30 ) ) );
$media_phase_saves    = $GLOBALS['cnt']['save_options'];
$media_phase_batches  = $GLOBALS['cnt']['request_multiple'];
$media_phase_seqfetch = $GLOBALS['cnt']['remote_get'];

echo "=== starter import perf counts ===\n";
echo "post phase: parse_blocks()=$post_phase_parse  wp_get_attachment_image_src()=$post_phase_imgsrc  (2 post types, 10 posts each, 20 media)\n";
echo "media phase: save_options()=$media_phase_saves  request_multiple()=$media_phase_batches  wp_remote_get()=$media_phase_seqfetch  (20 media items, concurrency 8)\n";

$fail = 0;
function check( &$fail, $cond, $msg ) { echo ( $cond ? '  OK   ' : '  FAIL ' ) . $msg . "\n"; if ( ! $cond ) { $fail++; } }
// #2: only the query posts are parsed (3 query x 2 types = 6), not all 20 posts.
check( $fail, $post_phase_parse <= 6, "#2 parse_blocks gated to query/nav posts (<=6, not ~40)" );
// #3: each id resolved once (3 src per id) + memoized on the 2nd type. 20 ids x 3 = 60 once.
check( $fail, $post_phase_imgsrc <= 60, "#3 thumbnail URLs resolved once + memoized (<=60, not ~240)" );
// #1: a single batch save, not one per media item.
check( $fail, 1 === $media_phase_saves, "#1 media journal saved once per batch (==1, not 20)" );
// #4: media fetched in concurrent batches (request_multiple), not 20 sequential GETs.
check( $fail, $media_phase_batches >= 1 && $media_phase_seqfetch <= 1, "#4 media fetched concurrently (request_multiple used, not ~20 sequential GETs)" );

echo ( $fail ? "starter-import-perf-test: FAIL\n" : "starter-import-perf-test: OK\n" );
exit( $fail ? 1 : 0 );
