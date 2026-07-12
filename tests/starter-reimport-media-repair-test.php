<?php
/**
 * Pins the re-import media repair contract for slug-collided starter posts.
 *
 * Regression guard: a starter re-import re-downloads media whose local attachments were deleted
 * (collect_starter_media_items() documents this is done "so the content can be remapped to a live
 * attachment"), but the slug-collision branch in import_post_type() used to skip existing posts
 * wholesale — their content kept URLs/ids of the deleted attachments and their cleared
 * `_thumbnail_id` was never restored. The site rendered imageless with no way to recover:
 * retrying resumed past the posts, and reset only deletes journaled posts.
 *
 * The contract: on collision, a post the importer itself created (`imported_with_pixassist` meta)
 * whose media references are broken is repaired from the fresh source record (whose content the
 * SCE source already rewrote to the current local media map). User-authored posts and healthy
 * imported posts are never touched.
 *
 * Standalone: run with `php tests/starter-reimport-media-repair-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_filters']           = array();
$GLOBALS['paf_pixassist_options'] = array();
$GLOBALS['paf_slug_ids']          = array(); // post_name => existing local post ID (the_slug_exists()).
$GLOBALS['paf_posts']             = array(); // [id] = (object) post
$GLOBALS['paf_post_meta']         = array(); // [post_id][meta_key] = value
$GLOBALS['paf_thumbnails']        = array(); // [post_id] = attachment_id
$GLOBALS['paf_updated_posts']     = array(); // captured wp_update_post() args
$GLOBALS['paf_inserted_posts']    = array(); // captured wp_insert_post() args

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
	$GLOBALS['paf_inserted_posts'][] = $args;

	return 9999;
}

function wp_update_post( $args ) {
	$GLOBALS['paf_updated_posts'][] = $args;
	$id = isset( $args['ID'] ) ? (int) $args['ID'] : 0;
	if ( $id && isset( $GLOBALS['paf_posts'][ $id ] ) && isset( $args['post_content'] ) ) {
		$GLOBALS['paf_posts'][ $id ]->post_content = $args['post_content'];
	}

	return $id;
}

function wp_set_object_terms() {
	return true;
}

function wp_cache_delete( $key, $group = '' ) {
	$GLOBALS['paf_cache_deletes'][] = array( (int) $key, $group );

	return true;
}

function rest_ensure_response( $value ) {
	return $value;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function get_post( $id ) {
	$id = (int) $id;

	return isset( $GLOBALS['paf_posts'][ $id ] ) ? $GLOBALS['paf_posts'][ $id ] : null;
}

function get_post_type( $post ) {
	$id = is_object( $post ) ? (int) $post->ID : (int) $post;

	return isset( $GLOBALS['paf_posts'][ $id ] ) ? $GLOBALS['paf_posts'][ $id ]->post_type : false;
}

function get_post_meta( $id, $key, $single = false ) {
	return isset( $GLOBALS['paf_post_meta'][ (int) $id ][ $key ] ) ? $GLOBALS['paf_post_meta'][ (int) $id ][ $key ] : '';
}

function update_post_meta( $id, $key, $value ) {
	$GLOBALS['paf_post_meta'][ (int) $id ][ $key ] = $value;

	return true;
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

function wp_get_attachment_image_src( $attachment_id, $size = 'thumbnail' ) {
	$id = (int) $attachment_id;
	if ( ! isset( $GLOBALS['paf_posts'][ $id ] ) || 'attachment' !== $GLOBALS['paf_posts'][ $id ]->post_type ) {
		return false;
	}

	return array( 'http://local.test/wp-content/uploads/att-' . $id . '-' . $size . '.jpg', 100, 100 );
}

function get_intermediate_image_sizes() {
	return array( 'thumbnail', 'large' );
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
		fwrite( STDERR, 'FAIL: ' . $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

/**
 * Fixture, mirroring the real incident: the "anima-blog" starter was imported once; its media was
 * later deleted (WP cleared every `_thumbnail_id` pointing at it); a re-import then re-downloaded
 * the media as NEW attachments (6490, 6492) and journaled them. The posts step now runs and every
 * demo post collides with its previously imported local copy.
 */
$GLOBALS['paf_pixassist_options']['imported_starter_content'] = array(
	'anima-blog' => array(
		'media' => array(
			'ignored' => array(
				1104 => 6490,
				1113 => 6492,
			),
		),
	),
);

// The re-imported attachments exist locally.
foreach ( array( 6490, 6492 ) as $att ) {
	$GLOBALS['paf_posts'][ $att ] = (object) array( 'ID' => $att, 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' );
}

$dead_content    = '<!-- wp:image --><figure class="wp-block-image"><img src="http://local.test/wp-content/uploads/2026/06/paris-1024x436.jpg" alt="" class="wp-image-5864"/></figure><!-- /wp:image -->';
$fresh_content   = '<!-- wp:image --><figure class="wp-block-image"><img src="http://local.test/wp-content/uploads/2026/07/paris.jpg" alt="" class="wp-image-6490"/></figure><!-- /wp:image -->';
$healthy_content = '<!-- wp:image --><figure class="wp-block-image"><img src="http://local.test/wp-content/uploads/2026/07/tailor.jpg" alt="" class="wp-image-6492"/></figure><!-- /wp:image -->';
$user_content    = '<p>Hand-written by the site owner.</p>';

// Post 15: previously imported, media refs now dead, featured image cleared -> must be repaired.
$GLOBALS['paf_posts'][15] = (object) array( 'ID' => 15, 'post_type' => 'post', 'post_content' => $dead_content );
$GLOBALS['paf_post_meta'][15]['imported_with_pixassist'] = true;

// Post 21: same slug as a demo post but authored by the user (no importer meta) -> never touched.
$GLOBALS['paf_posts'][21] = (object) array( 'ID' => 21, 'post_type' => 'post', 'post_content' => $user_content );

// Post 30: previously imported and still healthy (live refs + valid thumbnail) -> left as-is even
// though the demo copy has drifted.
$GLOBALS['paf_posts'][30] = (object) array( 'ID' => 30, 'post_type' => 'post', 'post_content' => $healthy_content );
$GLOBALS['paf_post_meta'][30]['imported_with_pixassist'] = true;
$GLOBALS['paf_thumbnails'][30] = 6492;

$GLOBALS['paf_slug_ids'] = array(
	'in-review' => 15,
	'user-page' => 21,
	'healthy'   => 30,
);

function paf_demo_post( $id, $slug, $content, $thumbnail_id ) {
	return array(
		'ID'                    => $id,
		'post_title'            => 'Demo ' . $slug,
		'post_content'          => $content,
		'post_content_filtered' => '',
		'post_excerpt'          => '',
		'post_status'           => 'publish',
		'post_name'             => $slug,
		'post_type'             => 'post',
		'post_date'             => '2026-01-01 00:00:00',
		'post_date_gmt'         => '2026-01-01 00:00:00',
		'post_modified'         => '2026-01-01 00:00:00',
		'post_modified_gmt'     => '2026-01-01 00:00:00',
		'menu_order'            => 0,
		'guid'                  => 'http://demo.test/?p=' . $id,
		'post_parent'           => 0,
		'meta'                  => $thumbnail_id ? array( '_thumbnail_id' => array( (string) $thumbnail_id ) ) : array(),
		'taxonomies'            => array(),
	);
}

// The SCE source localizes `_thumbnail_id` along with content when the request carries the media
// maps, so the wire value for post 15 is the LOCAL attachment id (6490), not the remote 1104.
$GLOBALS['paf_remote_body'] = json_encode( array(
	'code' => 'success',
	'data' => array(
		'posts' => array(
			paf_demo_post( 15, 'in-review', $fresh_content, 6490 ),
			paf_demo_post( 21, 'user-page', $fresh_content, 6490 ),
			paf_demo_post( 30, 'healthy', $fresh_content, 6492 ),
		),
	),
) );

$method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'import_post_type' );
$imported_ids = $method->invoke( $starter_content, 'anima-blog', 'https://starter.test/wp-json/sce/v2/', array(
	'post_type' => 'post',
	'ids'       => array( 15, 21, 30 ),
) );

// 1. All three collided posts map to their existing local ids and nothing was inserted.
assert_same( array( 15 => 15, 21 => 21, 30 => 30 ), $imported_ids, 'Collided posts must map to their existing local ids.' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), 'Slug-collided posts must be skipped, not inserted as duplicates.' );

// 2. The broken imported post is repaired: content refreshed from the source record (which the SCE
//    source already rewrote to the live media map) and the featured image restored through the map.
assert_same( $fresh_content, $GLOBALS['paf_posts'][15]->post_content, 'A previously imported post with dead media refs must get its content refreshed from the fresh source record.' );
assert_same( 6490, get_post_thumbnail_id( 15 ), 'A previously imported post whose featured image was cleared must get it restored through the media map.' );

// 2b. The repaired post's object cache is dropped: the whole import runs with cache invalidation
//     suspended, and the guid-rebase pass later merges wp_update_post() from get_post()'s cached
//     copy — without the explicit delete it silently reverts the repair.
assert_same(
	array( array( 15, 'posts' ) ),
	isset( $GLOBALS['paf_cache_deletes'] ) ? $GLOBALS['paf_cache_deletes'] : array(),
	'A content repair must drop the stale cached post (invalidation is suspended during import).'
);

// 3. A user-authored post with a colliding slug is never touched.
assert_same( $user_content, $GLOBALS['paf_posts'][21]->post_content, 'A user-authored post must never be repaired/overwritten.' );
assert_same( 0, get_post_thumbnail_id( 21 ), 'A user-authored post must not receive a featured image.' );

// 4. A healthy imported post is left alone even when the demo copy drifted.
assert_same( $healthy_content, $GLOBALS['paf_posts'][30]->post_content, 'A healthy imported post must keep its local content.' );
assert_same( 6492, get_post_thumbnail_id( 30 ), 'A healthy imported post must keep its featured image.' );

// 5. The journal still records the collision mappings (reset/undo depends on this).
$journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
assert_same(
	array( 15 => 15, 21 => 21, 30 => 30 ),
	isset( $journal['anima-blog']['post_types']['post'] ) ? $journal['anima-blog']['post_types']['post'] : null,
	'The persisted journal must map collided demo ids to the existing local ids.'
);

// 6. A source that ships the REMOTE thumbnail id (no localization — older exporter / mapless run)
//    still resolves through the journal media map.
$GLOBALS['paf_posts'][17] = (object) array( 'ID' => 17, 'post_type' => 'post', 'post_content' => $dead_content );
$GLOBALS['paf_post_meta'][17]['imported_with_pixassist'] = true;
$GLOBALS['paf_slug_ids']['remote-thumb'] = 17;
$GLOBALS['paf_remote_body'] = json_encode( array(
	'code' => 'success',
	'data' => array(
		'posts' => array(
			paf_demo_post( 17, 'remote-thumb', $fresh_content, 1113 ), // remote id, mapped to 6492.
		),
	),
) );
$method->invoke( $starter_content, 'anima-blog', 'https://starter.test/wp-json/sce/v2/', array(
	'post_type' => 'post',
	'ids'       => array( 17 ),
) );
assert_same( 6492, get_post_thumbnail_id( 17 ), 'A remote thumbnail id must resolve through the journal media map.' );

// 7. When neither a local attachment nor the media map can resolve the thumbnail yet
//    (interrupted/out-of-order run), the raw source id is stashed for the end_import() backfill.
$GLOBALS['paf_posts'][16] = (object) array( 'ID' => 16, 'post_type' => 'post', 'post_content' => $dead_content );
$GLOBALS['paf_post_meta'][16]['imported_with_pixassist'] = true;
$GLOBALS['paf_slug_ids']['pending-thumb'] = 16;
$GLOBALS['paf_remote_body'] = json_encode( array(
	'code' => 'success',
	'data' => array(
		'posts' => array(
			paf_demo_post( 16, 'pending-thumb', $fresh_content, 2222 ), // 2222: no attachment, not in the map.
		),
	),
) );
$method->invoke( $starter_content, 'anima-blog', 'https://starter.test/wp-json/sce/v2/', array(
	'post_type' => 'post',
	'ids'       => array( 16 ),
) );
assert_same( 0, get_post_thumbnail_id( 16 ), 'An unresolvable thumbnail must not be set to a dangling id.' );
assert_same( 2222, (int) get_post_meta( 16, '_pixassist_pending_thumbnail', true ), 'An unresolvable thumbnail must be stashed for the end_import backfill.' );

echo "starter-reimport-media-repair-test: OK" . PHP_EOL;
