<?php
/**
 * Pins the end_import featured-image backfill.
 *
 * import_post_type() remaps each post's `_thumbnail_id` at insert time against the media map as it stands
 * then; if the referenced media was imported out of order / after the post (e.g. an interrupted import), the
 * featured image is left unset. backfill_pending_thumbnails() resolves the stashed source id against the
 * completed map in end_import() and sets the featured image.
 *
 * Standalone: run with `php tests/thumbnail-backfill-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_pixassist_options'] = array();
$GLOBALS['paf_post_meta']         = array(); // [post_id][meta_key] = value
$GLOBALS['paf_thumbnails']        = array(); // [post_id] = attachment_id
$GLOBALS['paf_posts']             = array(); // [id] = (object) post

function add_action( $h, $c, $p = 10, $a = 1 ) { return true; }
function add_filter( $h, $c, $p = 10, $a = 1 ) { return true; }
function apply_filters( $h, $v ) { return $v; }
function do_action( $h ) {}
function get_option( $k, $d = false ) { return $d; }
function update_option( $k, $v ) { return true; }
function absint( $v ) { return abs( (int) $v ); }
function sanitize_key( $k ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $k ) ); }
function maybe_unserialize( $v ) { return is_string( $v ) && false !== @unserialize( $v ) ? unserialize( $v ) : $v; }
function is_wp_error( $v ) { return false; }

function get_post( $id ) {
	$id = (int) $id;
	return isset( $GLOBALS['paf_posts'][ $id ] ) ? $GLOBALS['paf_posts'][ $id ] : null;
}
function get_post_meta( $id, $key, $single = false ) {
	return isset( $GLOBALS['paf_post_meta'][ (int) $id ][ $key ] ) ? $GLOBALS['paf_post_meta'][ (int) $id ][ $key ] : '';
}
function delete_post_meta( $id, $key ) {
	unset( $GLOBALS['paf_post_meta'][ (int) $id ][ $key ] );
	return true;
}
function get_post_thumbnail_id( $id ) {
	return isset( $GLOBALS['paf_thumbnails'][ (int) $id ] ) ? $GLOBALS['paf_thumbnails'][ (int) $id ] : 0;
}
function set_post_thumbnail( $post, $thumb ) {
	$id = is_object( $post ) ? (int) $post->ID : (int) $post;
	$GLOBALS['paf_thumbnails'][ $id ] = (int) $thumb;
	return true;
}

class PixelgradeAssistant_Admin {
	public static function get_option( $key, $default = null, $force = false ) {
		return isset( $GLOBALS['paf_pixassist_options'][ $key ] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}
	public static function set_option( $key, $value ) { $GLOBALS['paf_pixassist_options'][ $key ] = $value; }
	public static function save_options() {}
}

function assert_same( $expected, $actual, $msg ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, "FAIL: $msg (expected " . var_export( $expected, true ) . ', got ' . var_export( $actual, true ) . ")\n" );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$sc = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

// Fixture: demo "meridian" imported 3 portfolio posts (local 143/144/145). The media map (now complete)
// maps each source thumbnail to a local image attachment. Every imported post stashed its raw source
// thumbnail in `_pixassist_pending_thumbnail`. Posts 143 and 145 were inserted before their media -> no
// `_thumbnail_id`; post 144's remap succeeded during import -> already has a valid featured image.
$GLOBALS['paf_pixassist_options']['imported_starter_content'] = array(
	'meridian' => array(
		'post_types' => array( 'portfolio' => array( 852 => 143, 889 => 144, 840 => 145 ) ),
		'media'      => array( 'ignored' => array( 60 => 3235, 73 => 3248, 39 => 3214 ) ),
	),
);
foreach ( array( 3235, 3248, 3214 ) as $att ) {
	$GLOBALS['paf_posts'][ $att ] = (object) array( 'ID' => $att, 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' );
}
foreach ( array( 143, 144, 145 ) as $pid ) {
	$GLOBALS['paf_posts'][ $pid ] = (object) array( 'ID' => $pid, 'post_type' => 'portfolio', 'post_mime_type' => '' );
}
$GLOBALS['paf_post_meta'][143]['_pixassist_pending_thumbnail'] = 60;
$GLOBALS['paf_post_meta'][144]['_pixassist_pending_thumbnail'] = 73;
$GLOBALS['paf_post_meta'][145]['_pixassist_pending_thumbnail'] = 39;
$GLOBALS['paf_thumbnails'][144] = 3248; // post 144 already correct

$method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'backfill_pending_thumbnails' );
$method->setAccessible( true );
$method->invoke( $sc );

assert_same( 3235, get_post_thumbnail_id( 143 ), 'A post missing its featured image must be backfilled from the source map.' );
assert_same( 3214, get_post_thumbnail_id( 145 ), 'The second missing post must be backfilled too.' );
assert_same( 3248, get_post_thumbnail_id( 144 ), 'A post that already had a valid featured image must be left unchanged.' );
assert_same( '', get_post_meta( 143, '_pixassist_pending_thumbnail', true ), 'The pending marker must be cleared after a backfill.' );
assert_same( '', get_post_meta( 144, '_pixassist_pending_thumbnail', true ), 'The pending marker must be cleared even when no backfill was needed.' );
assert_same( '', get_post_meta( 145, '_pixassist_pending_thumbnail', true ), 'The pending marker must be cleared after a backfill.' );

// Idempotent: a second pass changes nothing and does not error.
$method->invoke( $sc );
assert_same( 3235, get_post_thumbnail_id( 143 ), 'Backfill must be idempotent.' );

echo "Thumbnail backfill contract OK\n";
