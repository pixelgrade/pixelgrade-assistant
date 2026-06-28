<?php
/**
 * Pins the layout-unit `type_group` + `variant_label` derivation helpers.
 *
 * Product statement under test: variant siblings of a core template (e.g. `single` +
 * `single-magazine`) collapse to ONE catalog slot ("one frame per type"), while CPT- and
 * taxonomy-bound templates (`single-portfolio`, `taxonomy-portfolio_type`) stay their own family
 * so they are never wrongly merged into the generic single/archive slot. Derivation is slug+CPT
 * only (native post_types is a later enhancement).
 *
 * Standalone: run with `php tests/layout-unit-type-group-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_actions'] = array();

// --- Minimal WordPress stubs (only what the class load + these pure methods touch) ------------

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

$cpts = array( 'portfolio', 'product' );
$tax  = array( 'portfolio_type' );

// 1) Core slugs are their own family.
assert_same( 'single', $sc->layout_unit_type_group( 'single', $cpts, $tax ), 'Core `single` is its own family.' );
assert_same( 'page', $sc->layout_unit_type_group( 'page', $cpts, $tax ), 'Core `page` is its own family.' );
assert_same( 'front-page', $sc->layout_unit_type_group( 'front-page', $cpts, $tax ), 'Core `front-page` is its own family.' );
assert_same( 'archive', $sc->layout_unit_type_group( 'archive', $cpts, $tax ), 'Core `archive` is its own family.' );

// 2) Variants of a core slug collapse to the core family.
assert_same( 'single', $sc->layout_unit_type_group( 'single-magazine', $cpts, $tax ), '`single-magazine` collapses to `single`.' );
assert_same( 'single', $sc->layout_unit_type_group( 'single-split-header', $cpts, $tax ), '`single-split-header` collapses to `single`.' );
assert_same( 'archive', $sc->layout_unit_type_group( 'archive-wide', $cpts, $tax ), '`archive-wide` collapses to `archive`.' );

// 3) CPT-bound templates stay their own family (NO merge into single/archive).
assert_same( 'single-portfolio', $sc->layout_unit_type_group( 'single-portfolio', $cpts, $tax ), '`single-portfolio` keeps its CPT family.' );
assert_same( 'single-portfolio', $sc->layout_unit_type_group( 'single-portfolio-vertical', $cpts, $tax ), '`single-portfolio-vertical` files under the portfolio CPT family.' );
assert_same( 'archive-portfolio', $sc->layout_unit_type_group( 'archive-portfolio', $cpts, $tax ), '`archive-portfolio` keeps its CPT family.' );
assert_same( 'taxonomy-portfolio_type', $sc->layout_unit_type_group( 'taxonomy-portfolio_type', $cpts, $tax ), '`taxonomy-portfolio_type` keeps its taxonomy family.' );

// 4) Unknown custom template -> its own family.
assert_same( 'landing', $sc->layout_unit_type_group( 'landing', $cpts, $tax ), 'An unknown custom template is its own family.' );

// 5) Empty slug derives to empty.
assert_same( '', $sc->layout_unit_type_group( '', $cpts, $tax ), 'An empty slug yields an empty type group.' );

// 6) variant_label: title wins when it adds info; else title-cased slug.
assert_same( 'Magazine', $sc->layout_unit_variant_label( 'single-magazine', 'Magazine' ), 'An informative title is used verbatim.' );
assert_same( 'Single Magazine', $sc->layout_unit_variant_label( 'single-magazine', '' ), 'A missing title falls back to the title-cased slug.' );
assert_same( 'Single Magazine', $sc->layout_unit_variant_label( 'single-magazine', 'single-magazine' ), 'A title that merely echoes the slug falls back to the title-cased slug.' );
assert_same( 'Single Magazine', $sc->layout_unit_variant_label( 'single-magazine', 'single magazine' ), 'A title that merely echoes the de-slugged slug falls back to the title-cased slug.' );

// 7) Longest known-token tie-break: a more specific CPT wins over its prefix sibling.
assert_same( 'single-portfolio-item', $sc->layout_unit_type_group( 'single-portfolio-item-vertical', array( 'portfolio', 'portfolio-item' ), $tax ), 'The longest matching CPT token wins (`portfolio-item` over `portfolio`).' );

// 8) CPT-prefix boundary guard: a slug token that merely starts with a CPT name is NOT captured.
assert_same( 'single', $sc->layout_unit_type_group( 'single-products-showcase', array( 'portfolio', 'product' ), $tax ), '`single-products-showcase` is a core single variant, not the `product` CPT family.' );

echo "layout_unit_type_group OK\n";

// --- decorate_layout_units_with_type_group() --------------------------------------------------
// wp_template units gain type_group + variant_label; parts (and features) pass through untouched.

$decorate_units = array(
	array( 'id' => 1, 'type' => 'wp_template', 'slug' => 'single', 'title' => 'Single' ),
	array( 'id' => 2, 'type' => 'wp_template', 'slug' => 'single-magazine', 'title' => 'Magazine' ),
	array( 'id' => 3, 'type' => 'wp_template_part', 'slug' => 'header', 'title' => 'Header' ),
);

$decorated = $sc->decorate_layout_units_with_type_group( $decorate_units, array( 'portfolio' ), array() );

assert_same( 'single', $decorated[0]['type_group'], 'A core `single` template carries its own type_group.' );
assert_same( 'single', $decorated[1]['type_group'], 'A `single-magazine` variant collapses to the `single` type_group.' );
assert_same( 'Magazine', $decorated[1]['variant_label'], 'The variant card label uses the authored title.' );
assert_same( false, isset( $decorated[2]['type_group'] ), 'A wp_template_part is left untouched (no type_group key).' );

// The compact list path feeds the catalog's static feature families (not empty lists) so CPT-bound
// templates keep their own family there too — matching the dynamic path (never a wrong merge).
$kc = new ReflectionMethod( $sc, 'known_source_content_types' );
$kc->setAccessible( true );
list( $compact_cpts, $compact_tax ) = $kc->invoke( $sc, array() );
$compact_out = $sc->decorate_layout_units_with_type_group(
	array( array( 'id' => 1, 'type' => 'wp_template', 'slug' => 'single-portfolio', 'title' => 'Project' ) ),
	$compact_cpts, $compact_tax
);
assert_same( 'single-portfolio', $compact_out[0]['type_group'], 'Compact path keeps the portfolio CPT family separate (never merges into core single).' );
// And variant collapse still works with the static families:
$variant_out = $sc->decorate_layout_units_with_type_group(
	array( array( 'id' => 2, 'type' => 'wp_template', 'slug' => 'single-magazine', 'title' => 'Magazine' ) ),
	$compact_cpts, $compact_tax
);
assert_same( 'single', $variant_out[0]['type_group'], 'A non-CPT variant still collapses to the core single slot.' );

echo "decorate OK\n";
