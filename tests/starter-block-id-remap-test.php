<?php
/**
 * Pins the block-content ID remap on starter import: the core/query block's taxQuery term IDs and
 * navigation block references must be rewritten from the demo's IDs to the imported local IDs.
 *
 * Regression guard: a query-by-tag homepage (felt-lt) kept the demo's `post_tag` IDs, matched no
 * local posts and rendered blank. Pixelgrade Care remapped these; the Assistant rewrite dropped it.
 *
 * Uses the real WordPress block parser (parse_blocks/serialize_block) from the surrounding install,
 * since faithfully reimplementing it would not test real behavior. Skips cleanly if not found.
 *
 * Standalone-ish: run with `php tests/starter-block-id-remap-test.php`.
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$wp_includes = null;
foreach ( array(
	dirname( __DIR__ ) . '/../../../wp-includes',
	'/Users/georgeolaru/Local Sites/style-manager/app/public/wp-includes',
) as $candidate ) {
	if ( is_file( $candidate . '/blocks.php' ) && is_file( $candidate . '/class-wp-block-parser.php' ) ) {
		$wp_includes = $candidate;
		break;
	}
}

if ( null === $wp_includes ) {
	fwrite( STDOUT, "starter-block-id-remap-test: SKIP (WordPress block parser not found)\n" );
	exit( 0 );
}

$GLOBALS['paf_filters'] = array();

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function apply_filters( $hook, $value ) {
	$args = func_get_args();

	return $args[1];
}

function do_action() {}

function get_bloginfo( $show = '' ) {
	return 'version' === $show ? '7.0' : 'UTF-8';
}

function esc_attr( $text ) {
	return $text;
}

function wp_json_encode( $data, $options = 0, $depth = 512 ) {
	return json_encode( $data, $options, $depth );
}

function sanitize_key( $key ) {
	return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $key ) );
}

// Minimal equivalent of WP core's _flatten_blocks() (flatten the parsed tree by reference so the
// caller's in-place edits propagate). Avoids loading the heavy block-template-utils.php.
function _flatten_blocks( &$blocks ) {
	$all_blocks = array();
	$queue      = array();
	foreach ( $blocks as &$block ) {
		$queue[] = &$block;
	}
	unset( $block );

	while ( count( $queue ) > 0 ) {
		$block = &$queue[0];
		array_shift( $queue );
		$all_blocks[] = &$block;
		if ( ! empty( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as &$inner_block ) {
				$queue[] = &$inner_block;
			}
			unset( $inner_block );
		}
		unset( $block );
	}

	return $all_blocks;
}

require $wp_includes . '/class-wp-block-parser-block.php';
require $wp_includes . '/class-wp-block-parser-frame.php';
require $wp_includes . '/class-wp-block-parser.php';
require $wp_includes . '/blocks.php';

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

$tax_method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'maybe_replace_tax_ids_in_blocks' );
$tax_method->setAccessible( true );
$post_method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'maybe_replace_post_ids_in_blocks' );
$post_method->setAccessible( true );

// Taxonomy journal: demo term 92 -> local term 548 (the felt-lt "featured" tag).
$tax_map = array( 'post_tag' => array( 92 => 548, 110 => 600 ) );

// 1. The actual felt-lt homepage shape: a Nova Blocks include-wrapped query-by-tag must adopt the
//    imported local term id (this is the exact structure that rendered blank).
$home = '<!-- wp:query {"queryId":1,"query":{"perPage":4,"postType":"post","taxQuery":{"include":{"post_tag":[92]}}}} -->'
	. '<div class="wp-block-query"></div><!-- /wp:query -->';
$out = $tax_method->invoke( $starter_content, $home, $tax_map );
assert_true( false !== strpos( $out, '"post_tag":[548]' ), '1. Nova Blocks include-wrapped taxQuery term id must be remapped (92 -> 548).' );
assert_true( false === strpos( $out, '[92]' ), '1. The stale demo term id (92) must not survive in the query.' );

// 1b. The standard flat taxQuery shape must still be remapped (Care parity).
$flat = '<!-- wp:query {"query":{"taxQuery":{"post_tag":[92]}}} --><div></div><!-- /wp:query -->';
$out = $tax_method->invoke( $starter_content, $flat, $tax_map );
assert_true( false !== strpos( $out, '"post_tag":[548]' ), '1b. Flat taxQuery term id must be remapped (92 -> 548).' );

// 2. A term id that was NOT imported must be dropped (not left pointing at a stale demo term),
//    including inside the include/exclude wrapper.
$unmapped = '<!-- wp:query {"query":{"taxQuery":{"include":{"post_tag":[777]}}}} --><div></div><!-- /wp:query -->';
$out = $tax_method->invoke( $starter_content, $unmapped, $tax_map );
assert_true( false !== strpos( $out, '"post_tag":[]' ), '2. Unimported term ids must be dropped from the taxQuery.' );

// 3. Content without the relevant block (or no blocks) is returned unchanged.
$plain = 'Just some classic content, no blocks.';
assert_true( $plain === $tax_method->invoke( $starter_content, $plain, $tax_map ), '3. Non-block content must be returned unchanged.' );

// 4. A taxonomy navigation-link block must adopt the imported term id.
$nav_tax = '<!-- wp:navigation-link {"kind":"taxonomy","type":"post_tag","id":110,"label":"Featured"} /-->';
$out = $tax_method->invoke( $starter_content, $nav_tax, $tax_map );
assert_true( false !== strpos( $out, '"id":600' ), '4. Taxonomy navigation-link id must be remapped (110 -> 600).' );

// 5. Post-type references: navigation-link post id and navigation ref must be remapped.
$post_map = array( 'page' => array( 1733 => 49 ), 'wp_navigation' => array( 5 => 88 ) );
$nav_post = '<!-- wp:navigation-link {"kind":"post-type","type":"page","id":1733,"label":"Home"} /-->';
$out = $post_method->invoke( $starter_content, $nav_post, $post_map );
assert_true( false !== strpos( $out, '"id":49' ), '5a. Post-type navigation-link id must be remapped (1733 -> 49).' );

$nav_ref = '<!-- wp:navigation {"ref":5} /-->';
$out = $post_method->invoke( $starter_content, $nav_ref, $post_map );
assert_true( false !== strpos( $out, '"ref":88' ), '5b. Navigation block ref must be remapped (5 -> 88).' );

echo "starter-block-id-remap-test: OK\n";
