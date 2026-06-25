<?php
/**
 * Pins the legacy setup-wizard starter import progress surface.
 *
 * Standalone: run with `php tests/starter-progress-ui-test.php`.
 */

$starter_js = file_get_contents( __DIR__ . '/../admin/src/components/starter_content.js' );
$progress_js = file_get_contents( __DIR__ . '/../admin/src/components/ProgressBar/ProgressBar.js' );

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . "\n" );
		exit( 1 );
	}
}

assert_true( false !== strpos( $starter_js, 'startProgressHeartbeat' ), 'Starter import must keep progress alive with a heartbeat when real events are quiet.' );
assert_true( false !== strpos( $starter_js, 'updateProgress' ), 'Starter import must maintain structured progress state instead of a single description string.' );
assert_true( false !== strpos( $starter_js, 'estimateTotalWork' ), 'Starter import must estimate total work from the SCE manifest for determinate progress.' );
assert_true( false !== strpos( $starter_js, 'More than 3 seconds without progress should never feel idle.' ), 'Heartbeat behavior must be documented at the implementation point.' );
assert_true( false !== strpos( $starter_js, 'Uploading media' ), 'Media imports must expose upload-level feedback, not only the current filename.' );
assert_true( false !== strpos( $progress_js, 'progress__bar' ), 'ProgressBar must render a real progress track.' );
assert_true( false !== strpos( $progress_js, 'aria-live' ), 'ProgressBar must announce ongoing status changes accessibly.' );
assert_true( false !== strpos( $progress_js, 'progress.log' ), 'ProgressBar must render an inline live log instead of hiding the useful activity stream.' );

echo "Starter progress UI OK\n";
