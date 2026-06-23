<?php
/**
 * Pins the Recipes hub tab bootstrap payload.
 *
 * Standalone: run with `php tests/admin-recipes-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$args[0]  = $value;
		$accepted = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$value    = call_user_func_array( $entry['callback'], array_slice( $args, 0, max( 1, $accepted ) ) );
		$args[0]  = $value;
	}

	return $value;
}

function current_user_can( $capability ) {
	return true;
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
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

function pixassist_get_layout_units_sources() {
	return array(
		array(
			'id'          => 'anima-portfolio',
			'title'       => 'Meridian',
			'baseRestUrl' => 'https://starter.pixelgrade.com/anima-portfolio/wp-json/sce/v2/',
			'gate'        => '',
		),
	);
}

require __DIR__ . '/../includes/host-extension-surface.php';

class PixelgradeAssistant_Admin {
	public static $internalApiEndpoints = array(
		'recipes'     => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/recipes',
		),
		'applyRecipe' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/apply_recipe',
		),
		'undoRecipe'  => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/undo_recipe',
		),
	);
}

class PAF_Recipe_Starter_Content {
	public function get_applied_recipes() {
		return array(
			'recipe:anima-portfolio' => array(
				'id'        => 'anima-portfolio',
				'title'     => 'Meridian',
				'isApplied' => true,
			),
		);
	}
}

function PixelgradeAssistant() {
	return (object) array(
		'starter_content' => new PAF_Recipe_Starter_Content(),
	);
}

$module = __DIR__ . '/../includes/admin-recipes.php';
assert_true( file_exists( $module ), 'The Recipes tab module must exist at includes/admin-recipes.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_recipes_tab' ), 'The Recipes tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_recipes_data' ), 'The Recipes payload function must be defined.' );

$existing = array( array( 'id' => 'starter-sites' ) );
$registered = pixassist_register_recipes_tab( $existing );
assert_same( $existing, $registered, 'Recipes registration must be a no-op so Recipes is not exposed as a visible hub tab.' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_recipes_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( array(), $tabs, 'Even if the legacy Recipes registration callback is filtered in, Recipes must not become a visible tab.' );

$data = pixassist_get_recipes_data();
assert_same( 'Recipes', $data['copy']['title'], 'Recipes payload must carry tab copy.' );
assert_same( 'Include look', $data['copy']['lookLabel'], 'Recipes payload must carry the optional look toggle label.' );
assert_same( 'Include sample content', $data['copy']['sampleLabel'], 'Recipes payload must carry the optional sample-content toggle label.' );
assert_same( 1, count( $data['sources'] ), 'Recipes payload must expose recipe sources.' );
assert_same( 'anima-portfolio', $data['sources'][0]['id'], 'Recipes sources must preserve starter IDs.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['recipes'], $data['endpoints']['recipes'], 'Recipes payload must expose the recipe-list endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['applyRecipe'], $data['endpoints']['applyRecipe'], 'Recipes payload must expose the recipe-apply endpoint.' );
assert_same( PixelgradeAssistant_Admin::$internalApiEndpoints['undoRecipe'], $data['endpoints']['undoRecipe'], 'Recipes payload must expose the recipe-undo endpoint.' );
assert_same( true, $data['applied']['recipe:anima-portfolio']['isApplied'], 'Recipes payload must expose initially applied recipes.' );

echo "Admin Recipes tab OK\n";
