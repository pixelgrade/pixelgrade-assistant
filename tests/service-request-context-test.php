<?php
/**
 * Pins the minimal first-party service request context.
 *
 * Standalone: run with `php tests/service-request-context-test.php`.
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'PIXELGRADE_ASSISTANT__VERSION', '2.0.0-test' );

function pixassist_service_context_assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function home_url( $path = '' ) {
	return 'https://example.test/subsite' . $path;
}

function is_ssl() {
	return true;
}

function wp_get_environment_type() {
	return 'staging';
}

function get_bloginfo( $key ) {
	$values = array(
		'version'  => '6.9.1',
		'language' => 'ro-RO',
	);

	return isset( $values[ $key ] ) ? $values[ $key ] : '';
}

function is_rtl() {
	return false;
}

function get_template() {
	return 'anima';
}

function wp_get_theme() {
	return new class() {
		public function get( $key ) {
			$values = array(
				'Name'       => 'Anima',
				'Version'    => '1.4.2',
				'ThemeURI'   => 'https://pixelgrade.com/themes/anima/',
				'TextDomain' => 'anima',
			);

			return isset( $values[ $key ] ) ? $values[ $key ] : '';
		}
	};
}

function is_wp_error() {
	return false;
}

function sanitize_key( $value ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $value ) );
}

function esc_url_raw( $value ) {
	return filter_var( $value, FILTER_SANITIZE_URL );
}

function wp_parse_url( $value ) {
	return parse_url( $value );
}

function apply_filters( $hook, $value ) {
	if ( 'wupdates_gather_ids' === $hook ) {
		return array(
			'anima' => array(
				'id'   => 'QBAXY',
				'type' => 'theme_wporg',
				'slug' => 'anima',
				'name' => 'Anima',
			),
		);
	}

	return $value;
}

function pixassist_get_account() {
	return array(
		'is_connected'       => true,
		'pixelgrade_user_id' => 77,
	);
}

require_once __DIR__ . '/../includes/service-request-context.php';

$bootstrap = file_get_contents( __DIR__ . '/../pixelgrade-assistant.php' );
pixassist_service_context_assert_same( true, false !== strpos( $bootstrap, "define( 'PIXELGRADE_ASSISTANT__VERSION'" ), 'The plugin bootstrap must define the version constant used by service context.' );
pixassist_service_context_assert_same( true, false !== strpos( $bootstrap, 'PixelgradeAssistant::instance( __FILE__, PIXELGRADE_ASSISTANT__VERSION )' ), 'The plugin singleton must share the service-context version source.' );

$context = pixassist_get_service_request_context( 'Remote Config Requested!' );

pixassist_service_context_assert_same( 'https://example.test/subsite/', $context['site_url'], 'Context must use the canonical WordPress home URL.' );
pixassist_service_context_assert_same( 'remote_config_requested', $context['service'], 'Service names must be sanitized as stable keys.' );
pixassist_service_context_assert_same( 'anima', $context['theme_data']['slug'], 'Context must identify the active parent theme.' );
pixassist_service_context_assert_same( '1.4.2', $context['theme_data']['version'], 'Context must identify the active theme version.' );
pixassist_service_context_assert_same( 'QBAXY', $context['theme_data']['wupdates']['id'], 'Context must preserve the existing WUpdates product identity.' );
pixassist_service_context_assert_same( '6.9.1', $context['site_data']['wp']['version'], 'Context must identify the WordPress version.' );
pixassist_service_context_assert_same( 'ro-RO', $context['site_data']['wp']['language'], 'Context must identify the site locale.' );
pixassist_service_context_assert_same( false, $context['site_data']['wp']['rtl'], 'Context must identify RTL state.' );
pixassist_service_context_assert_same( 'staging', $context['site_data']['environment_type'], 'Context must identify the WordPress environment type.' );
pixassist_service_context_assert_same( '2.0.0-test', $context['site_data']['pixelgrade_assistant']['version'], 'Context must identify the Assistant version.' );
pixassist_service_context_assert_same( 77, $context['customer_data']['id'], 'Context may include the already-connected Pixelgrade customer ID.' );

$payload = pixassist_add_service_request_context(
	array(
		'hash_id'    => 'existing-hash',
		'theme_data' => array( 'name' => 'Caller-provided name' ),
	),
	'docs_categories_requested'
);

pixassist_service_context_assert_same( 'existing-hash', $payload['hash_id'], 'Merging context must preserve request-specific payload fields.' );
pixassist_service_context_assert_same( 'Caller-provided name', $payload['theme_data']['name'], 'Caller-provided nested fields must win over context defaults.' );
pixassist_service_context_assert_same( 'docs_categories_requested', $payload['service'], 'Merging context must name the observed service request.' );

$sensitive_keys = array( 'email', 'user_email', 'user_login', 'token', 'token_secret', 'license_hash', 'admin_url', 'ip' );
$encoded        = strtolower( json_encode( $context ) );
foreach ( $sensitive_keys as $sensitive_key ) {
	pixassist_service_context_assert_same( false, false !== strpos( $encoded, '"' . $sensitive_key . '"' ), 'Context must not include sensitive identity, credential, support, or IP fields.' );
}

$sce_args = pixassist_add_service_context_to_http_request(
	array( 'body' => array( 'include' => '10,11' ) ),
	'https://starter.pixelgrade.com/anima/wp-json/sce/v2/posts'
);
pixassist_service_context_assert_same( '10,11', $sce_args['body']['include'], 'SCE context merging must preserve functional request fields.' );
pixassist_service_context_assert_same( 'starter_posts_requested', $sce_args['body']['service'], 'SCE requests must name the observed source endpoint.' );
pixassist_service_context_assert_same( 'https://example.test/subsite/', $sce_args['body']['site_url'], 'SCE requests must explicitly carry the canonical site URL.' );

$unrelated_args = array( 'body' => array( 'query' => 'keep' ) );
pixassist_service_context_assert_same(
	$unrelated_args,
	pixassist_add_service_context_to_http_request( $unrelated_args, 'https://api.wordpress.org/plugins/info/1.2/' ),
	'Context must not be attached to unrelated third-party requests.'
);

$readme = file_get_contents( __DIR__ . '/../readme.txt' );
pixassist_service_context_assert_same( true, false !== strpos( $readme, '**First-party site registry (automatic).' ), 'The public External Services disclosure must describe automatic site registry collection.' );
pixassist_service_context_assert_same( true, false !== strpos( $readme, 'canonical site URL' ), 'The public disclosure must name the canonical site URL explicitly.' );
pixassist_service_context_assert_same( false, false !== strpos( $readme, 'It sends only your theme identifier' ), 'The readme must not retain the obsolete theme-identifier-only claim.' );

echo "Service request context contract OK\n";
