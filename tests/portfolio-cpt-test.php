<?php
/**
 * Pins the clean `portfolio` custom post type that Assistant registers for Pixelgrade
 * block themes (Anima LT), re-homing what Pixelgrade Care used to provide.
 *
 * The slug and taxonomy names are a HARD contract: Anima LT's FSE templates
 * (`single-portfolio`, `archive-portfolio`, `taxonomy-portfolio_type`,
 * `taxonomy-portfolio_tag`) and Nova Blocks' rendering (`is_singular('portfolio')`,
 * `get_the_terms( $id, 'portfolio_type' )`) all reference these exact names. If a
 * refactor changes them, portfolio content silently stops resolving — this test guards that.
 *
 * Standalone: run with `php tests/portfolio-cpt-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['pcpt'] = array(
	'post_types'       => array(),
	'taxonomies'       => array(),
	'actions'          => array(),
	'filters'          => array(),
	'theme_supports'   => array(),
	'filter_overrides' => array(),
	'options'          => array(),
	'flushed'          => 0,
);

// --- Minimal WordPress stubs ---------------------------------------------------

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['pcpt']['actions'][ $hook ][] = $callback;

	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['pcpt']['filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	if ( array_key_exists( $hook, $GLOBALS['pcpt']['filter_overrides'] ) ) {
		return $GLOBALS['pcpt']['filter_overrides'][ $hook ];
	}

	return $value;
}

function current_theme_supports( $feature ) {
	return ! empty( $GLOBALS['pcpt']['theme_supports'][ $feature ] );
}

function post_type_exists( $post_type ) {
	return isset( $GLOBALS['pcpt']['post_types'][ $post_type ] );
}

function taxonomy_exists( $taxonomy ) {
	return isset( $GLOBALS['pcpt']['taxonomies'][ $taxonomy ] );
}

function register_post_type( $post_type, $args = array() ) {
	$GLOBALS['pcpt']['post_types'][ $post_type ] = $args;
}

function register_taxonomy( $taxonomy, $object_type, $args = array() ) {
	$GLOBALS['pcpt']['taxonomies'][ $taxonomy ] = array(
		'object' => $object_type,
		'args'   => $args,
	);
}

function get_option( $name, $default = false ) {
	return array_key_exists( $name, $GLOBALS['pcpt']['options'] ) ? $GLOBALS['pcpt']['options'][ $name ] : $default;
}

function update_option( $name, $value ) {
	$GLOBALS['pcpt']['options'][ $name ] = $value;

	return true;
}

function flush_rewrite_rules( $hard = true ) {
	$GLOBALS['pcpt']['flushed']++;
}

function add_image_size() {}

function __( $text, $domain = null ) {
	return $text;
}

function esc_html__( $text, $domain = null ) {
	return $text;
}

// --- Assertion helpers ---------------------------------------------------------

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, 'FAIL: ' . $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, 'FAIL: ' . $message . PHP_EOL );
		exit( 1 );
	}
}

function pcpt_reset_registry() {
	$GLOBALS['pcpt']['post_types']       = array();
	$GLOBALS['pcpt']['taxonomies']       = array();
	$GLOBALS['pcpt']['theme_supports']   = array();
	$GLOBALS['pcpt']['filter_overrides'] = array();
	$GLOBALS['pcpt']['options']          = array();
	$GLOBALS['pcpt']['flushed']          = 0;
}

// --- Load the subject under test -----------------------------------------------

require __DIR__ . '/../includes/theme-helpers/portfolio-cpt.php';

// === 1) Registration contract: exact slug + taxonomy names ====================
pcpt_reset_registry();
pixassist_register_portfolio_post_type();

assert_true( post_type_exists( 'portfolio' ), 'registers a CPT with the exact slug `portfolio` (not jetpack-portfolio)' );
assert_true( ! post_type_exists( 'jetpack-portfolio' ), 'does NOT register the Jetpack `jetpack-portfolio` slug' );

$cpt = $GLOBALS['pcpt']['post_types']['portfolio'];
assert_same( true, ! empty( $cpt['public'] ), 'portfolio CPT is public' );
assert_same( true, ! empty( $cpt['show_in_rest'] ), 'portfolio CPT is show_in_rest (required for block editor + FSE)' );
assert_same( true, ! empty( $cpt['has_archive'] ), 'portfolio CPT has an archive' );
assert_same( 'portfolio', $cpt['rewrite']['slug'], 'portfolio CPT rewrite slug is `portfolio`' );
assert_true( in_array( 'portfolio_type', (array) $cpt['taxonomies'], true ), 'portfolio CPT declares the portfolio_type taxonomy' );
assert_true( in_array( 'portfolio_tag', (array) $cpt['taxonomies'], true ), 'portfolio CPT declares the portfolio_tag taxonomy' );
assert_true( in_array( 'thumbnail', (array) $cpt['supports'], true ), 'portfolio supports a featured image' );
assert_true( in_array( 'editor', (array) $cpt['supports'], true ), 'portfolio supports the block editor' );

assert_true( taxonomy_exists( 'portfolio_type' ), 'registers the portfolio_type taxonomy' );
assert_true( taxonomy_exists( 'portfolio_tag' ), 'registers the portfolio_tag taxonomy' );
assert_same( 'portfolio', $GLOBALS['pcpt']['taxonomies']['portfolio_type']['object'], 'portfolio_type is attached to the portfolio CPT' );
assert_same( 'portfolio', $GLOBALS['pcpt']['taxonomies']['portfolio_tag']['object'], 'portfolio_tag is attached to the portfolio CPT' );
assert_same( true, ! empty( $GLOBALS['pcpt']['taxonomies']['portfolio_type']['args']['hierarchical'] ), 'portfolio_type is hierarchical (categories)' );
assert_same( false, ! empty( $GLOBALS['pcpt']['taxonomies']['portfolio_tag']['args']['hierarchical'] ), 'portfolio_tag is non-hierarchical (tags)' );

// Idempotent: a second call must not fatal or double-register.
pixassist_register_portfolio_post_type();
assert_true( post_type_exists( 'portfolio' ), 'second registration is a guarded no-op' );

// === 2) Gating: theme-support driven + filter escape hatch ====================
pcpt_reset_registry();
assert_same( false, pixassist_portfolio_cpt_is_enabled(), 'disabled when the theme does not declare portfolio support' );

$GLOBALS['pcpt']['theme_supports']['portfolio'] = true;
assert_same( true, pixassist_portfolio_cpt_is_enabled(), 'enabled when the theme declares add_theme_support(portfolio)' );

// Filter can force-disable even with theme support.
$GLOBALS['pcpt']['filter_overrides']['pixassist_register_portfolio_cpt'] = false;
assert_same( false, pixassist_portfolio_cpt_is_enabled(), 'pixassist_register_portfolio_cpt filter can force-disable' );

// Filter can force-enable without theme support.
pcpt_reset_registry();
$GLOBALS['pcpt']['filter_overrides']['pixassist_register_portfolio_cpt'] = true;
assert_same( true, pixassist_portfolio_cpt_is_enabled(), 'pixassist_register_portfolio_cpt filter can force-enable' );

// === 3) maybe_register honors the gate ========================================
pcpt_reset_registry();
pixassist_maybe_register_portfolio_cpt();
assert_true( ! post_type_exists( 'portfolio' ), 'maybe_register does nothing when disabled' );

$GLOBALS['pcpt']['theme_supports']['portfolio'] = true;
pixassist_maybe_register_portfolio_cpt();
assert_true( post_type_exists( 'portfolio' ), 'maybe_register registers the CPT when enabled' );
assert_same( 1, $GLOBALS['pcpt']['flushed'], 'rewrite rules are flushed once on first registration' );

// Second pass must not flush again (one-time flag).
pixassist_maybe_register_portfolio_cpt();
assert_same( 1, $GLOBALS['pcpt']['flushed'], 'rewrite rules are not re-flushed on subsequent loads' );

// === 4) REST allow-list ========================================================
$types = pixassist_portfolio_allow_in_rest_api( array( 'post', 'page' ) );
assert_true( in_array( 'portfolio', $types, true ), 'portfolio is added to the REST API allowed post types' );

echo 'portfolio-cpt-test: OK' . PHP_EOL;
