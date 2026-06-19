<?php
/**
 * Pins when Assistant should load its bundled Classic Editor integration.
 *
 * Standalone: run with `php tests/classic-editor-policy-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

$module = __DIR__ . '/../includes/classic-editor.php';
assert_same( true, file_exists( $module ), 'Classic Editor policy helper must exist at includes/classic-editor.php.' );
require $module;

assert_same( true, function_exists( 'pixassist_theme_requires_classic_editor' ), 'Classic Editor policy helper must be defined.' );

assert_same( false, pixassist_theme_requires_classic_editor( false ), 'A missing remote config must not force Classic Editor.' );
assert_same( false, pixassist_theme_requires_classic_editor( array() ), 'An empty theme config must not force Classic Editor.' );
assert_same( false, pixassist_theme_requires_classic_editor( array( 'starterContent' => array() ) ), 'Unrelated theme config must not force Classic Editor.' );
assert_same( false, pixassist_theme_requires_classic_editor( array( 'gutenbergReady' => true ) ), 'A Gutenberg-ready theme must not force Classic Editor.' );
assert_same( false, pixassist_theme_requires_classic_editor( array( 'gutenbergReady' => 'true' ) ), 'A string true Gutenberg-ready flag must not force Classic Editor.' );

assert_same( true, pixassist_theme_requires_classic_editor( array( 'classicEditorRequired' => true ) ), 'A theme can explicitly force Classic Editor through classicEditorRequired=true.' );
assert_same( true, pixassist_theme_requires_classic_editor( array( 'classicEditorRequired' => 'yes' ) ), 'A truthy string classicEditorRequired flag must force Classic Editor.' );
assert_same( true, pixassist_theme_requires_classic_editor( array( 'gutenbergReady' => false ) ), 'Legacy explicit gutenbergReady=false must still force Classic Editor.' );
assert_same( true, pixassist_theme_requires_classic_editor( array( 'gutenbergReady' => 'false' ) ), 'Legacy string gutenbergReady=false must still force Classic Editor.' );

assert_same(
	false,
	pixassist_theme_requires_classic_editor(
		array(
			'classicEditorRequired' => false,
			'gutenbergReady'        => false,
		)
	),
	'The explicit classicEditorRequired flag must override the legacy Gutenberg-ready flag.'
);
