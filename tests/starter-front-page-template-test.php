<?php
/**
 * Pins the starter front-page override safety net (#B).
 *
 * When a starter sets a static front page and the active block theme ships a self-contained
 * `front-page` template that would SHADOW it (no core/post-content — e.g. anima-lt's wp.org
 * design-system showcase), import must create a clean DB `front-page` template override so the
 * assigned page renders. It must NOT clobber a theme front-page that already renders post-content,
 * an existing custom (DB) front-page template, or act when there's no static front page / no block
 * theme.
 *
 * Standalone: run with `php tests/starter-front-page-template-test.php`.
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_filters']            = array();
$GLOBALS['paf_pixassist_options']  = array();
$GLOBALS['paf_wp_options']         = array();
$GLOBALS['paf_posts']              = array();
$GLOBALS['paf_inserted_posts']     = array();
$GLOBALS['paf_object_terms']       = array();
$GLOBALS['paf_is_block_theme']     = true;
$GLOBALS['paf_block_template']     = null; // stdClass {source, content} or null
$GLOBALS['paf_next_post_id']       = 5000;

function add_action() { return true; }
function add_filter() { return true; }
function apply_filters( $hook, $value ) { $a = func_get_args(); return $a[1]; }
function do_action() {}
function sanitize_key( $k ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $k ) ); }
function esc_url_raw( $u ) { return $u; }
function trailingslashit( $s ) { return rtrim( $s, '/' ) . '/'; }
function esc_html__( $t, $d = 'default' ) { return $t; }
function absint( $v ) { return abs( (int) $v ); }

function wp_is_block_theme() { return $GLOBALS['paf_is_block_theme']; }
function get_stylesheet() { return 'anima-lt'; }
function get_block_template( $id, $type = 'wp_template' ) { return $GLOBALS['paf_block_template']; }
function get_option( $k, $default = false ) { return array_key_exists( $k, $GLOBALS['paf_wp_options'] ) ? $GLOBALS['paf_wp_options'][ $k ] : $default; }
function get_post_status( $id ) { return ! empty( $GLOBALS['paf_posts'][ (int) $id ] ) ? 'publish' : false; }

class WP_Error {}
function is_wp_error( $t ) { return $t instanceof WP_Error; }

function wp_insert_post( $args, $wp_error = false ) {
	$id = $GLOBALS['paf_next_post_id']++;
	$args['ID'] = $id;
	$GLOBALS['paf_inserted_posts'][ $id ] = $args;
	return $id;
}
function wp_set_object_terms( $id, $terms, $tax, $append = false ) {
	$GLOBALS['paf_object_terms'][] = array( 'id' => $id, 'terms' => $terms, 'tax' => $tax );
	return array( 1 );
}

class PixelgradeAssistant_Admin {
	public static function get_option( $k, $default = null, $force = false ) {
		return array_key_exists( $k, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $k ] : $default;
	}
	public static function set_option( $k, $v ) { $GLOBALS['paf_pixassist_options'][ $k ] = $v; }
	public static function save_options() { return true; }
}

function assert_true( $c, $m ) { if ( ! $c ) { fwrite( STDERR, $m . PHP_EOL ); exit( 1 ); } }
function assert_same( $e, $a, $m ) { if ( $e !== $a ) { fwrite( STDERR, "$m\nExpected: " . var_export( $e, true ) . "\nActual:   " . var_export( $a, true ) . PHP_EOL ); exit( 1 ); } }

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$sc = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
$method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'ensure_starter_front_page_template' );
$method->setAccessible( true );

function paf_reset() {
	$GLOBALS['paf_pixassist_options'] = array();
	$GLOBALS['paf_inserted_posts']    = array();
	$GLOBALS['paf_object_terms']      = array();
	$GLOBALS['paf_is_block_theme']    = true;
	$GLOBALS['paf_block_template']    = null;
	$GLOBALS['paf_wp_options']        = array( 'show_on_front' => 'page', 'page_on_front' => 49 );
	$GLOBALS['paf_posts']             = array( 49 => true );
	$GLOBALS['paf_next_post_id']      = 5000;
}

function paf_template( $source, $content ) {
	$t = new stdClass();
	$t->source = $source;
	$t->content = $content;
	return $t;
}

// 1. SHADOW: theme front-page template has no post-content -> create a clean DB override.
paf_reset();
$GLOBALS['paf_block_template'] = paf_template( 'theme', '<!-- wp:pattern {"slug":"anima-lt/hero-design-cover"} /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 1, count( $GLOBALS['paf_inserted_posts'] ), '1. A shadowing theme front-page must trigger exactly one override insert.' );
$tpl = end( $GLOBALS['paf_inserted_posts'] );
assert_same( 'wp_template', $tpl['post_type'], '1. Override must be a wp_template.' );
assert_same( 'front-page', $tpl['post_name'], '1. Override slug must be front-page.' );
assert_true( false !== strpos( $tpl['post_content'], 'wp:post-content' ), '1. Override must render core/post-content.' );
assert_same( 'anima-lt', $GLOBALS['paf_object_terms'][0]['terms'], '1. Override must be assigned to the active theme via wp_theme.' );
assert_same( 'wp_theme', $GLOBALS['paf_object_terms'][0]['tax'], '1. Override must use the wp_theme taxonomy.' );
$journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
$tpl_map = $journal['felt-lt']['post_types']['wp_template'];
assert_true( in_array( $tpl['ID'], array_values( $tpl_map ), true ), '1. Override id must be journaled so reset removes it.' );

// 2. NOT A SHADOW: theme front-page already renders post-content -> no override.
paf_reset();
$GLOBALS['paf_block_template'] = paf_template( 'theme', '<!-- wp:template-part {"slug":"header"} /--><!-- wp:post-content /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '2. A theme front-page that already renders post-content must not be overridden.' );

// 3. EXISTING CUSTOM TEMPLATE: a DB front-page override already exists -> never clobber.
paf_reset();
$GLOBALS['paf_block_template'] = paf_template( 'custom', '<!-- wp:pattern {"slug":"x"} /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '3. An existing custom front-page template must be respected, not clobbered.' );

// 4. NO FRONT-PAGE TEMPLATE: theme has none -> the page template renders the page, do nothing.
paf_reset();
$GLOBALS['paf_block_template'] = null;
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '4. With no theme front-page template, no override is needed.' );

// 5. NO STATIC FRONT PAGE: show_on_front != page -> do nothing.
paf_reset();
$GLOBALS['paf_wp_options']['show_on_front'] = 'posts';
$GLOBALS['paf_block_template'] = paf_template( 'theme', '<!-- wp:pattern /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '5. Without a static front page, no override is created.' );

// 6. NOT A BLOCK THEME: do nothing.
paf_reset();
$GLOBALS['paf_is_block_theme'] = false;
$GLOBALS['paf_block_template'] = paf_template( 'theme', '<!-- wp:pattern /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '6. Classic (non-block) themes get no front-page override.' );

// 7. FRONT PAGE ASSIGNED BUT MISSING: page_on_front points at a non-existent page -> do nothing.
paf_reset();
$GLOBALS['paf_wp_options']['page_on_front'] = 999;
$GLOBALS['paf_block_template'] = paf_template( 'theme', '<!-- wp:pattern /-->' );
$method->invoke( $sc, 'felt-lt' );
assert_same( 0, count( $GLOBALS['paf_inserted_posts'] ), '7. A missing/unpublished front page must not trigger an override.' );

echo "starter-front-page-template-test: OK\n";
