<?php
/**
 * Pins the layout-unit slot key derivation: "one frame per type".
 *
 * Product statement under test: applying a template variant must occupy the SAME slot as its
 * siblings so that the apply-time existing-occupant lookup finds and replaces the prior one.
 * The `wp_template` slot is therefore keyed on the catalog `type_group` (e.g. `single` +
 * `single-magazine` -> the single `wp_template:single` slot), while CPT/taxonomy-bound
 * templates keep their own family (`single-portfolio` -> `wp_template:single-portfolio`, NOT
 * `wp_template:single`). Headers/footers (`wp_template_part`) and features keep their slug-keyed
 * slot unchanged.
 *
 * Standalone: run with `php tests/layout-unit-slot-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_actions'] = array();

// --- Minimal WordPress stubs (only what the class load + this pure method touch) ---------------

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_actions'][ $hook ][] = $callback;

	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	return $value;
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

// --- Assertion helpers ------------------------------------------------------------------------

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, 'FAIL: ' . $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

// --- Load the subject under test --------------------------------------------------------------

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$sc = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );

// `get_layout_unit_slot_key` is private; reach it via reflection.
$slot_key = new ReflectionMethod( $sc, 'get_layout_unit_slot_key' );
$slot_key->setAccessible( true );

$slot = static function ( $unit_type, $slug ) use ( $slot_key, $sc ) {
	return $slot_key->invoke( $sc, $unit_type, $slug );
};

// 1) "One frame per type": a core template and its variant share ONE template slot.
$single          = $slot( 'wp_template', 'single' );
$single_magazine = $slot( 'wp_template', 'single-magazine' );
assert_same( 'wp_template:single', $single, 'Core `single` keys the `wp_template:single` slot.' );
assert_same( 'wp_template:single', $single_magazine, '`single-magazine` keys the SAME slot as `single` (one frame per type).' );
assert_same( $single, $single_magazine, 'A core template and its variant must resolve to the identical slot key.' );

// 2) CPT-bound templates keep their own slot — a portfolio variant must NOT collapse into core single.
$single_portfolio      = $slot( 'wp_template', 'single-portfolio' );
$single_portfolio_wide = $slot( 'wp_template', 'single-portfolio-wide' );
assert_same( 'wp_template:single-portfolio', $single_portfolio, '`single-portfolio` keeps its CPT-family slot.' );
assert_same( 'wp_template:single-portfolio', $single_portfolio_wide, '`single-portfolio-wide` shares the portfolio CPT-family slot.' );
assert_same( $single_portfolio, $single_portfolio_wide, 'Portfolio template variants share one CPT-family slot.' );
if ( $single_portfolio === $single ) {
	fwrite( STDERR, 'FAIL: A CPT-bound template must NOT collapse into the core `wp_template:single` slot.' . PHP_EOL );
	exit( 1 );
}

// 3) Parts and features are UNCHANGED — they stay slug-keyed (no type_group concept).
assert_same( 'wp_template_part:header', $slot( 'wp_template_part', 'header' ), 'A header part keeps its slug-keyed slot.' );
assert_same( 'wp_template_part:footer', $slot( 'wp_template_part', 'footer' ), 'A footer part keeps its slug-keyed slot.' );
assert_same( 'feature:portfolio', $slot( 'feature', 'portfolio' ), 'A feature keeps its slug-keyed slot.' );

// 4) Invalid input yields an empty slot.
assert_same( '', $slot( 'wp_template', '' ), 'An empty slug yields an empty slot.' );
assert_same( '', $slot( 'nav_menu', 'primary' ), 'An unknown unit type yields an empty slot.' );

echo "layout_unit_slot_key OK\n";
