<?php
/**
 * Pins defensive WUpdates identification fallback handling (#38).
 *
 * Standalone: run with `php tests/wupdates-identification-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_template_slug'] = 'hive-lite';

if ( ! class_exists( 'WP_Theme' ) ) {
	class WP_Theme {
		private $headers;

		public function __construct( $headers ) {
			$this->headers = $headers;
		}

		public function get( $key ) {
			return isset( $this->headers[ $key ] ) ? $this->headers[ $key ] : '';
		}
	}
}

function get_template() {
	return $GLOBALS['paf_template_slug'];
}

function get_template_directory() {
	return '/themes/' . $GLOBALS['paf_template_slug'];
}

function get_stylesheet_directory() {
	return get_template_directory();
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/' ) . '/';
}

function wp_get_theme( $stylesheet = '' ) {
	return new WP_Theme(
		array(
			'Name'        => 'Hive Lite',
			'ThemeURI'    => '',
			'Description' => '',
			'Author'      => 'Pixelgrade',
			'AuthorURI'   => '',
			'Version'     => '1.0.0',
			'Template'    => '',
			'Status'      => '',
			'TextDomain'  => $GLOBALS['paf_template_slug'],
			'DomainPath'  => '',
		)
	);
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

require __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php';

set_error_handler(
	function ( $severity, $message, $file, $line ) {
		throw new ErrorException( $message, 0, $severity, $file, $line );
	}
);

$from_null_payload = PixelgradeAssistant_Admin::maybe_fill_up_wupdates_identification_data( null );
assert_true( is_array( $from_null_payload ), 'Null WUpdates payloads must be normalized to arrays.' );
assert_same( 'Hive Lite', $from_null_payload['hive-lite']['name'], 'Theme name must be filled from headers.' );
assert_same( 'hive-lite', $from_null_payload['hive-lite']['slug'], 'Theme slug must be filled from headers.' );
assert_same( 'theme_wporg', $from_null_payload['hive-lite']['type'], 'Theme type must fall back to theme_wporg.' );
assert_same( 'PMAGv', $from_null_payload['hive-lite']['id'], 'Known Lite theme hash id must be filled.' );

$from_scalar_payload = PixelgradeAssistant_Admin::maybe_fill_up_wupdates_identification_data( 123 );
assert_true( is_array( $from_scalar_payload ), 'Scalar WUpdates payloads must be normalized to arrays.' );
assert_same( 'PMAGv', $from_scalar_payload['hive-lite']['id'], 'Known Lite theme hash id must be filled after scalar payload normalization.' );

$from_null_entry = PixelgradeAssistant_Admin::maybe_fill_up_wupdates_identification_data(
	array(
		'hive-lite' => null,
	)
);
assert_true( is_array( $from_null_entry['hive-lite'] ), 'Null WUpdates theme entries must be normalized to arrays.' );
assert_same( 'PMAGv', $from_null_entry['hive-lite']['id'], 'Known Lite theme hash id must survive null entry normalization.' );

$from_scalar_entry = PixelgradeAssistant_Admin::maybe_fill_up_wupdates_identification_data(
	array(
		'hive-lite' => 'unexpected',
	)
);
assert_true( is_array( $from_scalar_entry['hive-lite'] ), 'Scalar WUpdates theme entries must be normalized to arrays.' );
assert_same( 'PMAGv', $from_scalar_entry['hive-lite']['id'], 'Known Lite theme hash id must survive scalar entry normalization.' );

restore_error_handler();

echo "WUpdates identification fallback OK\n";
