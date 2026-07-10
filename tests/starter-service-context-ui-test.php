<?php
/**
 * Pins explicit service context on browser-to-starter functional requests.
 *
 * Standalone: run with `php tests/starter-service-context-ui-test.php`.
 */

function starter_context_ui_assert_contains( $needle, $haystack, $message ) {
	if ( false === strpos( $haystack, $needle ) ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

$php = file_get_contents( __DIR__ . '/../includes/admin-starter-sites.php' );
$js  = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/StarterSites.js' );

starter_context_ui_assert_contains( "'serviceContext'", $php, 'Starter Sites bootstrap data must expose the allowlisted service context.' );
starter_context_ui_assert_contains( 'addServiceContextToUrl', $js, 'Starter-source browser requests must use a shared context URL helper.' );
starter_context_ui_assert_contains( "'starter_manifest_requested'", $js, 'Starter manifest requests must be named as observed service requests.' );

echo "Starter browser service context contract OK\n";
