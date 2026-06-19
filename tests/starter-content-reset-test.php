<?php
/**
 * Pins the journal-driven starter-content reset contract.
 *
 * Standalone: run with `php tests/starter-content-reset-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_actions']              = array();
$GLOBALS['paf_filters']              = array();
$GLOBALS['paf_pixassist_options']    = array();
$GLOBALS['paf_wp_options']           = array();
$GLOBALS['paf_theme_mods']           = array();
$GLOBALS['paf_removed_theme_mods']   = array();
$GLOBALS['paf_posts']                = array();
$GLOBALS['paf_deleted_posts']        = array();
$GLOBALS['paf_terms']                = array();
$GLOBALS['paf_deleted_terms']        = array();
$GLOBALS['paf_attachment_metadata']  = array();
$GLOBALS['paf_deleted_attachments']  = array();
$GLOBALS['paf_cache_flushes']        = 0;
$GLOBALS['paf_style_cache_actions']  = array();

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

function apply_filters( $hook, $value ) {
	return $value;
}

function absint( $value ) {
	return abs( (int) $value );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function is_wp_error( $value ) {
	return false;
}

function do_action( $hook ) {
	$GLOBALS['paf_style_cache_actions'][] = $hook;
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_wp_options'] ) ? $GLOBALS['paf_wp_options'][ $key ] : $default;
}

function update_option( $key, $value ) {
	$GLOBALS['paf_wp_options'][ $key ] = $value;

	return true;
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

function wp_delete_post( $post_id, $force_delete = false ) {
	$post_id = (int) $post_id;
	if ( empty( $GLOBALS['paf_posts'][ $post_id ] ) ) {
		return false;
	}

	unset( $GLOBALS['paf_posts'][ $post_id ] );
	$GLOBALS['paf_deleted_posts'][] = array( $post_id, (bool) $force_delete );

	return true;
}

function taxonomy_exists( $taxonomy ) {
	return in_array( $taxonomy, array( 'portfolio_type', 'nav_menu', 'category' ), true );
}

function term_exists( $term_id, $taxonomy = '' ) {
	$term_id = (int) $term_id;

	return ! empty( $GLOBALS['paf_terms'][ $taxonomy ][ $term_id ] );
}

function wp_delete_term( $term_id, $taxonomy ) {
	$term_id = (int) $term_id;
	if ( empty( $GLOBALS['paf_terms'][ $taxonomy ][ $term_id ] ) ) {
		return false;
	}

	unset( $GLOBALS['paf_terms'][ $taxonomy ][ $term_id ] );
	$GLOBALS['paf_deleted_terms'][] = array( $term_id, $taxonomy );

	return true;
}

function wp_get_attachment_metadata( $attachment_id ) {
	return isset( $GLOBALS['paf_attachment_metadata'][ $attachment_id ] )
		? $GLOBALS['paf_attachment_metadata'][ $attachment_id ]
		: false;
}

function wp_delete_attachment( $attachment_id, $force_delete = false ) {
	$attachment_id = (int) $attachment_id;
	$GLOBALS['paf_deleted_attachments'][] = array( $attachment_id, (bool) $force_delete );

	return true;
}

function wp_cache_flush() {
	$GLOBALS['paf_cache_flushes']++;

	return true;
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

class PAF_WPDB {
	public $queries = array();
	public $options = 'wp_options';

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
}

function paf_reset_runtime() {
	$GLOBALS['paf_pixassist_options']   = array();
	$GLOBALS['paf_wp_options']          = array();
	$GLOBALS['paf_theme_mods']          = array();
	$GLOBALS['paf_removed_theme_mods']  = array();
	$GLOBALS['paf_posts']               = array();
	$GLOBALS['paf_deleted_posts']       = array();
	$GLOBALS['paf_terms']               = array();
	$GLOBALS['paf_deleted_terms']       = array();
	$GLOBALS['paf_attachment_metadata'] = array();
	$GLOBALS['paf_deleted_attachments'] = array();
	$GLOBALS['paf_cache_flushes']       = 0;
	$GLOBALS['paf_style_cache_actions'] = array();
	$GLOBALS['wpdb']->queries           = array();
	PixelgradeAssistant_Admin::$saved   = 0;
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

paf_reset_runtime();

$GLOBALS['paf_pixassist_options'] = array(
	'account'                  => array( 'is_connected' => true, 'email' => 'owner@example.test' ),
	'imported_starter_content' => array(
		'anima-portfolio' => array(
			'post_types'    => array(
				'page'             => array( 10 => 101 ),
				'post'             => array( 11 => 102 ),
				'portfolio'        => array( 12 => 103 ),
				'wp_template'      => array( 13 => 104 ),
				'wp_template_part' => array( 14 => 105 ),
				'nav_menu_item'    => array( 15 => 106 ),
			),
			'taxonomies'    => array(
				'portfolio_type' => array( 20 => 201 ),
				'nav_menu'       => array( 21 => 202 ),
				'category'       => array( 22 => 1 ),
				'missing_tax'    => array( 23 => 203 ),
			),
			'media'         => array(
				'ignored'      => array( 30 => 301 ),
				'placeholders' => array( 31 => 302 ),
			),
			'pre_settings'  => array(
				'options' => array(
					'show_on_front' => 'posts',
					'page_on_front' => 0,
					'sm_palette'    => 'baseline',
				),
				'mods'    => array(
					'custom_logo'             => false,
					'anima_transparent_logo'  => 700,
				),
			),
			'post_settings' => array(
				'options' => array(
					'show_on_front' => 'page',
					'page_on_front' => 88,
					'page_for_posts' => 9,
				),
				'mods'    => array(
					'anima_transparent_logo' => 701,
				),
			),
		),
	),
);

$GLOBALS['paf_wp_options'] = array(
	'default_category' => 1,
	'show_on_front'   => 'page',
	'page_on_front'   => 999,
	'page_for_posts'  => 998,
	'sm_palette'      => 'imported',
);

$GLOBALS['paf_theme_mods'] = array(
	'custom_logo'            => 301,
	'anima_transparent_logo' => 302,
);

$GLOBALS['paf_posts'] = array_fill_keys( array( 101, 102, 103, 104, 105, 106 ), true );
$GLOBALS['paf_terms'] = array(
	'portfolio_type' => array( 201 => true ),
	'nav_menu'       => array( 202 => true ),
	'category'       => array( 1 => true ),
);
$GLOBALS['paf_attachment_metadata'] = array(
	301 => array( 'imported_with_pixassist' => true ),
	302 => array( 'sizes' => array() ),
);

$summary = $starter_content->reset_starter_content();

assert_same( 1, $summary['journals'], 'Reset must report the processed starter journal count.' );
assert_same( 6, $summary['posts_deleted'], 'Reset must force-delete every journaled imported post.' );
assert_same(
	array(
		array( 101, true ),
		array( 102, true ),
		array( 103, true ),
		array( 104, true ),
		array( 105, true ),
		array( 106, true ),
	),
	$GLOBALS['paf_deleted_posts'],
	'Reset must delete only journaled imported posts with force delete enabled.'
);
assert_same( 2, $summary['terms_deleted'], 'Reset must delete journaled terms that are safe to delete.' );
assert_same( array( array( 201, 'portfolio_type' ), array( 202, 'nav_menu' ) ), $GLOBALS['paf_deleted_terms'], 'Reset must not delete the default category or unknown taxonomies.' );
assert_same( 1, $summary['media_deleted'], 'Reset must delete tagged imported media.' );
assert_same( 1, $summary['media_skipped'], 'Reset must skip journaled media missing the pixassist metadata tag.' );
assert_same( array( array( 301, true ) ), $GLOBALS['paf_deleted_attachments'], 'Reset must never delete untagged media.' );

assert_same( 'posts', $GLOBALS['paf_wp_options']['show_on_front'], 'Pre-import show_on_front must win over post-import intermediate settings.' );
assert_same( 0, $GLOBALS['paf_wp_options']['page_on_front'], 'Pre-import page_on_front must be restored.' );
assert_same( 9, $GLOBALS['paf_wp_options']['page_for_posts'], 'Post-import-only settings must be restored.' );
assert_same( 'baseline', $GLOBALS['paf_wp_options']['sm_palette'], 'Style Manager options must be restored.' );
assert_same( 4, $summary['options_restored'], 'Reset must summarize unique restored options.' );

assert_true( ! array_key_exists( 'custom_logo', $GLOBALS['paf_theme_mods'] ), 'False prior theme mods must be removed, not stored as imported values.' );
assert_same( array( 'custom_logo' ), $GLOBALS['paf_removed_theme_mods'], 'Reset must remove theme mods that were absent before import.' );
assert_same( 700, $GLOBALS['paf_theme_mods']['anima_transparent_logo'], 'Pre-import theme mod values must win over post-import intermediate settings.' );
assert_same( 2, $summary['theme_mods_restored'], 'Reset must summarize unique restored theme mods.' );

assert_same( array(), PixelgradeAssistant_Admin::get_option( 'imported_starter_content' ), 'Reset must clear the starter-content journal after a successful reset.' );
assert_same( array( 'is_connected' => true, 'email' => 'owner@example.test' ), PixelgradeAssistant_Admin::get_option( 'account' ), 'Reset must not touch account/license/OAuth state.' );
assert_same( 1, PixelgradeAssistant_Admin::$saved, 'Reset must persist the cleared journal once.' );
assert_same( 1, $GLOBALS['paf_cache_flushes'], 'Reset must flush caches after restoring Style Manager settings.' );
assert_same( array( 'style_manager/invalidate_all_caches', 'customify_invalidate_all_caches' ), $GLOBALS['paf_style_cache_actions'], 'Reset must reuse the Style Manager cache invalidation path.' );

paf_reset_runtime();
$GLOBALS['paf_pixassist_options'] = array(
	'imported_starter_content' => array(
		'first-starter'  => array(
			'pre_settings' => array(
				'options' => array(
					'show_on_front' => 'posts',
				),
			),
		),
		'second-starter' => array(
			'pre_settings' => array(
				'options' => array(
					'show_on_front' => 'page',
				),
			),
		),
	),
);
$GLOBALS['paf_wp_options'] = array(
	'show_on_front' => 'imported-second-starter',
);

$summary = $starter_content->reset_starter_content();

assert_same( 2, $summary['journals'], 'Reset must process every starter journal.' );
assert_same( 'posts', $GLOBALS['paf_wp_options']['show_on_front'], 'When multiple journals exist, the earliest pre-import option must win.' );

paf_reset_runtime();
$GLOBALS['paf_pixassist_options'] = array(
	'account'          => array( 'is_connected' => true ),
	'enabled_features' => array( 'portfolio' ),
);

$summary = $starter_content->reset_starter_content();

assert_same( 0, $summary['journals'], 'Reset with no journal must be a no-op success.' );
assert_same( 0, $summary['posts_deleted'], 'No journal means no post deletions.' );
assert_same( 0, $summary['media_deleted'], 'No journal means no media deletions.' );
assert_same( 1, $summary['features_disabled'], 'No-journal reset must still clear stale Assistant feature flags.' );
assert_same( array(), PixelgradeAssistant_Admin::get_option( 'enabled_features' ), 'No-journal reset must persist stale feature flag cleanup.' );
assert_same( array( 'is_connected' => true ), PixelgradeAssistant_Admin::get_option( 'account' ), 'No-op reset must not touch account state.' );

echo "Starter content reset contract OK\n";
