<?php
/**
 * Pins modern starter media imports to real exported media, independent of placeholders.
 *
 * Standalone: run with `php tests/starter-media-gate-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

$source = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/StarterSites.js' );

if ( false === $source ) {
	fwrite( STDERR, "Could not read the Starter Sites source.\n" );
	exit( 1 );
}

if ( false !== strpos( $source, 'isEmptyObject( media.placeholders )' ) ) {
	fwrite( STDERR, "Starter media work must not require a placeholder pool when ignored media is exportable.\n" );
	exit( 1 );
}

if ( false !== strpos( $source, 'isEmptyObject( config.media.placeholders )' ) ) {
	fwrite( STDERR, "Starter media imports must run from real ignored media even when placeholder rotation assets are omitted.\n" );
	exit( 1 );
}

echo "Starter media gate OK\n";
