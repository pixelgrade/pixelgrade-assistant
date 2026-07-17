<?php
/**
 * Pins the WUpdates fallback registration ahead of the first theme config lookup.
 *
 * Standalone: run with `php tests/admin-wupdates-bootstrap-order-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

$admin_file = __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php';
$source     = file_get_contents( $admin_file );

if ( false === $source ) {
	fwrite( STDERR, "Could not read the Assistant admin controller.\n" );
	exit( 1 );
}

$constructor_start = strpos( $source, 'public function __construct' );
$constructor_end   = strpos( $source, 'public function maybe_load_classic_editor()', $constructor_start );

if ( false === $constructor_start || false === $constructor_end ) {
	fwrite( STDERR, "Could not isolate the Assistant admin constructor.\n" );
	exit( 1 );
}

$constructor       = substr( $source, $constructor_start, $constructor_end - $constructor_start );
$fallback_position = strpos( $constructor, "add_filter( 'wupdates_gather_ids'" );
$deferred_position = strpos( $constructor, "array( \$this, 'maybe_load_classic_editor' )" );

if ( false === $fallback_position || false === $deferred_position ) {
	fwrite( STDERR, "The constructor must register the WUpdates fallback and defer the Classic Editor check.\n" );
	exit( 1 );
}

if ( false !== strpos( $constructor, 'PixelgradeAssistant::get_theme_config()' ) ) {
	fwrite( STDERR, "The constructor must not load remote theme config before WordPress pluggable functions exist.\n" );
	exit( 1 );
}

if ( $fallback_position > $deferred_position ) {
	fwrite( STDERR, "The WUpdates fallback must be registered before the deferred Classic Editor check.\n" );
	exit( 1 );
}

$classic_editor_method = strpos( $source, 'public function maybe_load_classic_editor()' );
if ( false === $classic_editor_method || false === strpos( $source, 'PixelgradeAssistant::get_theme_config()', $classic_editor_method ) ) {
	fwrite( STDERR, "The deferred Classic Editor callback must load the identified theme config.\n" );
	exit( 1 );
}

echo "WUpdates bootstrap order OK\n";
