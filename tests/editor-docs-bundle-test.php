<?php
/**
 * Pins the editor docs launcher bundle against bundling @wordpress/interface.
 *
 * WordPress core registers the `core/interface` data store in the block editors.
 * If the docs launcher embeds @wordpress/interface instead of depending on the
 * core `wp-interface` script handle, the Site Editor logs:
 *
 *     Store "core/interface" is already registered.
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
assert_true(
	in_array( 'wp-interface', $asset['dependencies'], true ),
	'The editor docs launcher must depend on core wp-interface instead of bundling @wordpress/interface.'
);

$bundle = file_get_contents( $bundle_path );

assert_false(
	false !== strpos( $bundle, 'createReduxStore)("core/interface"' ) ||
	false !== strpos( $bundle, 'createReduxStore)(\'core/interface\'' ) ||
	false !== strpos( $bundle, 'createReduxStore("core/interface"' ) ||
	false !== strpos( $bundle, 'createReduxStore(\'core/interface\'' ),
	'The editor docs launcher must not bundle the core/interface Redux store.'
);

echo "Editor docs bundle dependencies OK\n";
