<?php
/**
 * Keeps the editor docs launcher independent from the removed wp-interface handle.
 *
 * WordPress 7.1 no longer registers or exposes `wp-interface`. The toolbar
 * launcher uses the public components SlotFill API directly instead.
 *
 * Standalone: run with `php tests/editor-docs-bundle-test.php`.
 *
 * @package PixelgradeAssistant
 */

$asset_path = __DIR__ . '/../admin/build/docs.asset.php';
$bundle_path = __DIR__ . '/../admin/build/docs.js';

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

function assert_false( $condition, $message ) {
	assert_true( ! $condition, $message );
}

assert_true( is_readable( $asset_path ), 'The editor docs asset manifest must exist. Run `npm run build:modern` or `npm run distribution`.' );
assert_true( is_readable( $bundle_path ), 'The editor docs bundle must exist. Run `npm run build:modern` or `npm run distribution`.' );

$asset = require $asset_path;

assert_true( is_array( $asset ), 'The editor docs asset manifest must return an array.' );
assert_true( isset( $asset['dependencies'] ) && is_array( $asset['dependencies'] ), 'The editor docs asset manifest must declare dependencies.' );
assert_false(
	in_array( 'wp-interface', $asset['dependencies'], true ),
	'The editor docs launcher must not depend on the removed wp-interface script handle.'
);

$bundle = file_get_contents( $bundle_path );

assert_false(
	false !== strpos( $bundle, 'window.wp.interface' ) ||
	false !== strpos( $bundle, 'createReduxStore)("core/interface"' ) ||
	false !== strpos( $bundle, 'createReduxStore)(\'core/interface\'' ) ||
	false !== strpos( $bundle, 'createReduxStore("core/interface"' ) ||
	false !== strpos( $bundle, 'createReduxStore(\'core/interface\'' ),
	'The editor docs launcher must not bundle the core/interface Redux store.'
);

assert_true(
	false !== strpos( $bundle, 'PinnedItems/' ),
	'The editor docs launcher must fill the editor PinnedItems slot directly.'
);

echo "Editor docs bundle dependencies OK\n";
