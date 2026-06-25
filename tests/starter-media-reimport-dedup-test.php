<?php
/**
 * Pins the re-import media dedup.
 *
 * The full-demo media import collects the importable source media into a flat fetch list. Without dedup,
 * re-importing a starter re-downloads every image and creates a SECOND attachment for each (WordPress
 * collision-renames the file), then the journal — which only records the latest remote->local mapping —
 * moves to the new attachment, orphaning the original. A site re-imported once ends up with ~2x the media.
 *
 * collect_starter_media_items() must skip any source media ID that was already imported for this demo AND
 * whose local attachment still exists, so re-imports reuse attachments instead of duplicating them. If the
 * mapped local attachment is gone (deleted by the user), the id is re-imported.
 *
 * Standalone: run with `php tests/starter-media-reimport-dedup-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_pixassist_options']   = array();
$GLOBALS['paf_existing_attachments'] = array(); // set of attachment IDs that "exist" as attachments

function add_action( $h, $c, $p = 10, $a = 1 ) { return true; }
function add_filter( $h, $c, $p = 10, $a = 1 ) { return true; }
function apply_filters( $h, $v ) { return $v; }
function do_action( $h ) {}
function absint( $v ) { return abs( (int) $v ); }
function sanitize_key( $k ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $k ) ); }
function sanitize_text_field( $s ) { return is_string( $s ) ? trim( $s ) : $s; }
function esc_url_raw( $u ) { return (string) $u; }
function maybe_unserialize( $v ) { return $v; }
function is_wp_error( $v ) { return false; }

function get_post_type( $id ) {
	return in_array( (int) $id, $GLOBALS['paf_existing_attachments'], true ) ? 'attachment' : false;
}

class PixelgradeAssistant_Admin {
	public static function get_option( $key, $default = null, $force = false ) {
		return isset( $GLOBALS['paf_pixassist_options'][ $key ] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}
	public static function set_option( $key, $value ) { $GLOBALS['paf_pixassist_options'][ $key ] = $value; }
	public static function save_options() {}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$sc     = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
$method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'collect_starter_media_items' );
$method->setAccessible( true );

$failures = 0;
function check( $cond, $msg ) {
	global $failures;
	if ( $cond ) {
		echo "ok - $msg\n";
	} else {
		echo "NOT OK - $msg\n";
		$failures++;
	}
}
function ids_of( $items ) {
	return array_map( function ( $i ) { return (int) $i['id']; }, $items );
}

$media = array(
	'placeholders' => array( 175 ),
	'ignored'      => array( 9, 10, 11 ),
	'source_urls'  => array(
		9  => 'https://starter.pixelgrade.com/anima-portfolio/wp-content/uploads/9.jpg',
		10 => 'https://starter.pixelgrade.com/anima-portfolio/wp-content/uploads/10.jpg',
	),
);

// --- Scenario 1: fresh import (empty journal) imports the whole ignored pool. ---
$GLOBALS['paf_pixassist_options'] = array();
$items = $method->invoke( $sc, 'anima-portfolio', $media, true );
check( ids_of( $items ) === array( 9, 10, 11 ), 'Fresh import collects every ignored id.' );
check( count( $items ) === 3, 'Fresh import yields 3 items.' );
$by_id = array();
foreach ( $items as $i ) { $by_id[ $i['id'] ] = $i; }
check( ! empty( $by_id[9]['source_url'] ) && ! empty( $by_id[10]['source_url'] ), 'Items carry their source_url when provided.' );
check( empty( $by_id[11]['source_url'] ), 'An id without a source_url has none attached.' );
check( $by_id[9]['group'] === 'ignored', 'Items keep their group.' );

// The placeholders group and the source_urls map are never imported as media themselves.
check( ! in_array( 175, ids_of( $items ), true ), 'The placeholders group is not imported as media.' );

// --- Scenario 2: re-import where every id already maps to an existing attachment -> nothing re-imported. ---
$GLOBALS['paf_pixassist_options'] = array(
	'imported_starter_content' => array(
		'anima-portfolio' => array(
			'media' => array(
				'ignored' => array( 9 => 5001, 10 => 5002, 11 => 5003 ),
			),
		),
	),
);
$GLOBALS['paf_existing_attachments'] = array( 5001, 5002, 5003 );
$items = $method->invoke( $sc, 'anima-portfolio', $media, true );
check( $items === array(), 'Re-import skips media already imported with existing attachments (no duplicates).' );

// --- Scenario 3: a mapped attachment was deleted -> that id is re-imported; the others stay skipped. ---
$GLOBALS['paf_pixassist_options'] = array(
	'imported_starter_content' => array(
		'anima-portfolio' => array(
			'media' => array(
				'ignored' => array( 9 => 5001, 10 => 9999 /* deleted */ ),
				// 11 was never imported.
			),
		),
	),
);
$GLOBALS['paf_existing_attachments'] = array( 5001 ); // 9999 no longer exists
$items = $method->invoke( $sc, 'anima-portfolio', $media, true );
check( ids_of( $items ) === array( 10, 11 ), 'Re-import re-fetches ids whose local attachment is gone, plus never-imported ids; keeps existing ones skipped.' );

// --- Scenario 4: dedup is per-demo, not global. A different demo key does not see this demo's journal. ---
$items = $method->invoke( $sc, 'anima-blog', $media, true );
check( ids_of( $items ) === array( 9, 10, 11 ), 'Dedup is scoped to the demo key.' );

// --- Scenario 5: the per-media upload path (used by the modern hub's client loop via /upload_media) is the
//     server-side backstop. A second upload of an already-imported id reuses the attachment, never inserting. ---
$GLOBALS['paf_pixassist_options'] = array(
	'imported_starter_content' => array(
		'anima-portfolio' => array(
			'media' => array( 'ignored' => array( 9 => 5001 ) ),
		),
	),
);
$GLOBALS['paf_existing_attachments'] = array( 5001 );
$upload = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'import_media_file' );
$upload->setAccessible( true );
// file_data is deliberately ignored: the reuse short-circuit returns before any decode/upload happens.
$res = $upload->invoke( $sc, 'anima-portfolio', 'ignored', 9, 'team4', 'jpeg', 'IRRELEVANT' );
check( is_array( $res ) && isset( $res['code'] ) && 'success' === $res['code'], 'Re-upload of an imported id returns success.' );
check( ! empty( $res['data']['reused'] ), 'Re-upload reuses the existing attachment (no insert).' );
check( isset( $res['data']['attachmentID'] ) && 5001 === (int) $res['data']['attachmentID'], 'Re-upload returns the existing attachment ID.' );

echo $failures ? "\nFAILED ($failures)\n" : "\nPASSED\n";
exit( $failures ? 1 : 0 );
