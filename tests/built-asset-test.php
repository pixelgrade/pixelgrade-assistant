<?php
/**
 * Pins the @wordpress/scripts asset-manifest enqueue seam.
 *
 * The modern host shell (#43/#44/#46) enqueues build artifacts through two helpers in
 * includes/assets.php:
 *   - pixassist_read_asset_manifest( $path ): a PURE reader of a wp-scripts `*.asset.php`
 *     manifest. Returns the declared script dependencies + version hash, or safe empty
 *     defaults when the file is missing or malformed (build not run yet).
 *   - pixassist_enqueue_built_script( $handle, $name, $extra_deps, $in_footer ): registers +
 *     enqueues `admin/build/{$name}.js` with the manifest's dependencies (merged with any
 *     extra deps) and version hash for cache-busting.
 *
 * Standalone: run with `php tests/built-asset-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

// Minimal WordPress stubs so includes/assets.php can load + the enqueue path can be asserted
// without a WordPress runtime.
define( 'ABSPATH', __DIR__ . '/' );

// Point the plugin-dir constants at the committed fixture tree (a fake plugin root).
define( 'PIXELGRADE_ASSISTANT__PLUGIN_DIR', __DIR__ . '/fixtures/plugin/' );
define( 'PIXELGRADE_ASSISTANT__PLUGIN_FILE', __DIR__ . '/fixtures/plugin/pixelgrade-assistant.php' );

$GLOBALS['paf_registered'] = array();
$GLOBALS['paf_enqueued']   = array();

function plugin_dir_url( $file ) {
	return 'https://example.test/wp-content/plugins/pixelgrade-assistant/';
}

function wp_register_script( $handle, $src, $deps = array(), $ver = false, $in_footer = false ) {
	$GLOBALS['paf_registered'][ $handle ] = compact( 'src', 'deps', 'ver', 'in_footer' );

	return true;
}

function wp_enqueue_script( $handle ) {
	$GLOBALS['paf_enqueued'][] = $handle;
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

require __DIR__ . '/../includes/assets.php';

/*
 * Reader: a real wp-scripts manifest yields its declared dependencies + version hash.
 */
$manifest = pixassist_read_asset_manifest( __DIR__ . '/fixtures/plugin/admin/build/index.asset.php' );

assert_same(
	array( 'react', 'react-dom', 'wp-element', 'wp-components' ),
	$manifest['dependencies'],
	'pixassist_read_asset_manifest() must return the manifest dependencies.'
);
assert_same( 'abc123def456', $manifest['version'], 'pixassist_read_asset_manifest() must return the manifest version hash.' );

/*
 * Reader: a missing manifest (build not run yet) falls back to safe empty defaults — never a
 * fatal, never a missing key.
 */
$missing = pixassist_read_asset_manifest( __DIR__ . '/fixtures/plugin/admin/build/does-not-exist.asset.php' );

assert_same( array(), $missing['dependencies'], 'A missing manifest must yield an empty dependencies array.' );
assert_same( '', $missing['version'], 'A missing manifest must yield an empty version string.' );

/*
 * Reader: a malformed manifest (does not return an array) must not break callers; it falls back
 * to the same safe empty defaults.
 */
$malformed = pixassist_read_asset_manifest( __DIR__ . '/fixtures/malformed.asset.php' );

assert_same( array(), $malformed['dependencies'], 'A malformed manifest must yield an empty dependencies array.' );
assert_same( '', $malformed['version'], 'A malformed manifest must yield an empty version string.' );

/*
 * Enqueue: registers + enqueues the built script using the manifest deps (merged with extra
 * deps, de-duplicated) and the manifest version hash, pointing at admin/build/{name}.js.
 */
pixassist_enqueue_built_script( 'pixassist-modern', 'index', array( 'jquery', 'react' ) );

assert_true( isset( $GLOBALS['paf_registered']['pixassist-modern'] ), 'The built script must be registered.' );

$registered = $GLOBALS['paf_registered']['pixassist-modern'];

assert_same(
	array( 'react', 'react-dom', 'wp-element', 'wp-components', 'jquery' ),
	$registered['deps'],
	'Registered deps must be manifest deps merged with extra deps, de-duplicated, manifest first.'
);
assert_same( 'abc123def456', $registered['ver'], 'Registered version must be the manifest version hash.' );
assert_same(
	'https://example.test/wp-content/plugins/pixelgrade-assistant/admin/build/index.js',
	$registered['src'],
	'Registered src must point at the admin/build artifact.'
);
assert_same( true, $registered['in_footer'], 'The built script must be enqueued in the footer by default.' );
assert_same( array( 'pixassist-modern' ), $GLOBALS['paf_enqueued'], 'The built script handle must be enqueued.' );

echo "Built asset enqueue seam OK\n";
