<?php
/**
 * Pins source-URL remapping for media embedded outside dedicated image blocks.
 *
 * A starter post can contain blocks while an image itself lives inside a paragraph. The exporter then
 * follows its block-aware path, but only dedicated image blocks are rewritten. If that inline image also
 * carries a stale `wp-image-*` class, its source URL survives the response even though the ignored media
 * attachment was imported successfully. The Assistant must use the source URLs recorded during the media
 * phase to replace that URL and bind the image class to the local attachment.
 *
 * Standalone: run with `php tests/starter-media-source-remap-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_pixassist_options'] = array(
	'imported_starter_content' => array(
		'pile-lt' => array(
			'media' => array(
				'ignored' => array( 257 => 2864 ),
			),
			'media_source_urls' => array(
				257 => array(
					'full'      => 'https://starter.pixelgrade.com/pile-lt/wp-content/uploads/sites/11/2026/03/anchor.png',
					'thumbnail' => 'https://starter.pixelgrade.com/pile-lt/wp-content/uploads/sites/11/2026/03/anchor-12x13.png',
				),
			),
		),
	),
);

function add_action( $hook, $callback, $priority = 10, $args = 1 ) { return true; }
function add_filter( $hook, $callback, $priority = 10, $args = 1 ) { return true; }
function apply_filters( $hook, $value ) { return $value; }
function do_action() {}
function absint( $value ) { return abs( (int) $value ); }
function sanitize_key( $key ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) ); }
function esc_url_raw( $url ) { return (string) $url; }

function wp_get_attachment_image_src( $attachment_id, $size = 'thumbnail' ) {
	if ( 2864 !== (int) $attachment_id ) {
		return false;
	}

	$urls = array(
		'full'      => 'http://localhost:8903/wp-content/uploads/2026/07/anchor.png',
		'thumbnail' => 'http://localhost:8903/wp-content/uploads/2026/07/anchor-12x13.png',
	);

	return isset( $urls[ $size ] ) ? array( $urls[ $size ], 12, 13 ) : false;
}

function get_intermediate_image_sizes() { return array( 'thumbnail' ); }

class PixelgradeAssistant_Admin {
	public static function get_option( $key, $default = null, $force_refresh = false ) {
		return array_key_exists( $key, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
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
$method          = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'remap_imported_media_urls_in_content' );
$method->setAccessible( true );

$source_full      = 'https://starter.pixelgrade.com/pile-lt/wp-content/uploads/sites/11/2026/03/anchor.png';
$source_thumbnail = 'https://starter.pixelgrade.com/pile-lt/wp-content/uploads/sites/11/2026/03/anchor-12x13.png';
$local_full       = 'http://localhost:8903/wp-content/uploads/2026/07/anchor.png';
$local_thumbnail  = 'http://localhost:8903/wp-content/uploads/2026/07/anchor-12x13.png';
$content          = '<!-- wp:paragraph --><p><a href="' . $source_full . '"><img src="' . $source_full . '" srcset="' . $source_thumbnail . ' 12w, ' . $source_full . ' 24w" alt="anchor" class="aligncenter wp-image-1199 size-full"></a></p><!-- /wp:paragraph -->';
$expected         = '<!-- wp:paragraph --><p><a href="' . $local_full . '"><img src="' . $local_full . '" srcset="' . $local_thumbnail . ' 12w, ' . $local_full . ' 24w" alt="anchor" class="aligncenter wp-image-2864 size-full"></a></p><!-- /wp:paragraph -->';

assert_same(
	$expected,
	$method->invoke( $starter_content, $content, 'pile-lt' ),
	'Imported media source URLs and stale wp-image classes must point at the local attachment.'
);

$unrelated = '<!-- wp:paragraph --><p><img src="https://images.example.test/editorial.jpg" class="wp-image-44"></p><!-- /wp:paragraph -->';
assert_same(
	$unrelated,
	$method->invoke( $starter_content, $unrelated, 'pile-lt' ),
	'Unrelated image URLs and classes must remain untouched.'
);

echo "PASSED\n";
