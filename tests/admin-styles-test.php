<?php
/**
 * Pins the free Styles tab in the Pixelgrade Design hub.
 *
 * Standalone: run with `php tests/admin-styles-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'PIXELGRADE_ASSISTANT__PLUGIN_FILE', __DIR__ . '/../pixelgrade-assistant.php' );
define( 'PIXELGRADE_ASSISTANT__SHOP_BASE', 'https://pixelgrade.com/' );

$GLOBALS['paf_filters']        = array();
$GLOBALS['paf_denied_caps']    = array();
$GLOBALS['paf_is_block_theme'] = false;

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}
	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		$value = call_user_func( $callback, $value );
	}

	return $value;
}

function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, is_array( $args ) ? $args : array() );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function current_user_can( $capability ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function plugin_dir_url( $file ) {
	return 'https://example.test/wp-content/plugins/pixelgrade-assistant/';
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/' ) . '/';
}

function wp_is_block_theme() {
	return ! empty( $GLOBALS['paf_is_block_theme'] );
}

function __( $text, $domain = 'default' ) {
	return $text;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_attr__( $text, $domain = 'default' ) {
	return $text;
}

function paf_reset() {
	$GLOBALS['paf_filters']        = array();
	$GLOBALS['paf_denied_caps']    = array();
	$GLOBALS['paf_is_block_theme'] = false;
}

function paf_set_plus_status( $status ) {
	add_filter(
		'pixelgrade_assistant_plus_status',
		function () use ( $status ) {
			return $status;
		}
	);
}

function paf_find_destination( $destinations, $id ) {
	foreach ( (array) $destinations as $destination ) {
		if ( isset( $destination['id'] ) && $id === $destination['id'] ) {
			return $destination;
		}
	}

	return null;
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

require __DIR__ . '/../includes/capabilities.php';
require __DIR__ . '/../includes/host-extension-surface.php';
require __DIR__ . '/../includes/admin-hub.php';
require __DIR__ . '/../includes/admin-styles.php';

assert_true( function_exists( 'pixassist_register_styles_tab' ), 'The Styles tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_styles_data' ), 'The Styles payload function must be defined.' );

$registered = pixassist_register_styles_tab( array() );
assert_same( 1, count( $registered ), 'Styles registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'styles', $tab['id'], 'Styles tab id must be `styles`.' );
assert_same( 'Design System', $tab['label'], 'Styles tab visible label must be `Design System` while keeping id `styles`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Styles tab must require edit_theme_options.' );
assert_same( 'styles', $tab['component'], 'Styles must render an in-hub `styles` component.' );
assert_same( '', $tab['gate'], 'Styles tab is free - no upsell gate.' );
assert_same( 10, $tab['order'], 'Styles must sort after Home and before Starter Sites.' );
assert_true( empty( $tab['url'] ), 'Styles must not be a link tab.' );

paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
$hub_data = pixassist_get_admin_hub_data();
assert_same( 'styles', $hub_data['tabs'][0]['id'], 'Styles must normalize through the hub registry.' );
assert_same( 'styles', $hub_data['tabs'][0]['component'], 'The normalized Styles tab must keep its component.' );
assert_same( '', $hub_data['tabs'][0]['url'], 'The normalized Styles tab must not navigate out.' );

paf_reset();
$styles = pixassist_get_styles_data();
$keys   = array_keys( $styles );
sort( $keys );
assert_same( array( 'copy', 'destinations', 'primaryAction' ), $keys, 'Styles payload must expose copy, primaryAction, and destinations.' );

assert_same( 'Your Site Design System', $styles['copy']['title'], 'The Styles page headline must explain the stronger Design System concept.' );
assert_same( 'Open Style Manager', $styles['primaryAction']['label'], 'Primary Styles action must open Style Manager.' );
assert_same( 'https://example.test/wp-admin/customize.php', $styles['primaryAction']['url'], 'Classic-theme primary action must use the Customizer fallback.' );

$ids = array_column( $styles['destinations'], 'id' );
assert_same( array( 'colors', 'typography', 'spacing', 'motion' ), $ids, 'Styles destinations must focus the card grid on Design System sections.' );

foreach ( array( 'colors', 'typography', 'spacing' ) as $free_id ) {
	$destination = paf_find_destination( $styles['destinations'], $free_id );
	assert_true( null !== $destination, 'Expected free destination missing: ' . $free_id );
	assert_same( '', $destination['gate'], 'Free destination must not be gated: ' . $free_id );
	assert_same( false, $destination['isLocked'], 'Free destination must not be locked: ' . $free_id );
	assert_true( ! empty( $destination['url'] ), 'Free destination must expose a direct editor/customizer link: ' . $free_id );
	assert_same( 'Open in Style Manager', $destination['actionLabel'], 'Specific style controls must not imply precise deep links when they all open Style Manager: ' . $free_id );
}

	$preview_extensions = array(
		'colors'     => 'png',
		'typography' => 'png',
		'spacing'    => 'png',
		'motion'     => 'svg',
	);

	foreach ( $preview_extensions as $preview_id => $extension ) {
		$destination = paf_find_destination( $styles['destinations'], $preview_id );
		assert_true( ! empty( $destination['image'] ), 'Design System section card must expose a preview image: ' . $preview_id );
		assert_true( false !== strpos( $destination['image'], '/admin/images/style-manager-preview-' . $preview_id . '.' . $extension ), 'Preview image URL must point to the local admin image asset: ' . $preview_id );
		assert_true( ! empty( $destination['imageAlt'] ), 'Preview image must expose alt text: ' . $preview_id );
	}

$motion = paf_find_destination( $styles['destinations'], 'motion' );
assert_same( 'plus', $motion['gate'], 'Motion must be marked as a Plus style capability.' );
assert_same( true, $motion['isLocked'], 'Motion must be locked when Plus is inactive.' );
assert_same( false, $motion['isProminent'], 'Motion must stay quiet rather than become the dominant CTA.' );
assert_same( 'Available with Pixelgrade Plus', $motion['badge'], 'Motion gating language must be factual and quiet.' );
assert_same( 'Learn about Pixelgrade Plus', $motion['actionLabel'], 'Inactive Plus motion action must be informational, not pushy.' );
assert_same( 'https://pixelgrade.com/plus/', $motion['url'], 'Inactive Plus motion action must link to the Plus product page.' );

paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$styles = pixassist_get_styles_data();
assert_same( 'https://example.test/wp-admin/site-editor.php?path=%2Fwp_global_styles', $styles['primaryAction']['url'], 'Block-theme primary action must use the Site Editor styles surface.' );

$motion = paf_find_destination( $styles['destinations'], 'motion' );
assert_same( true, $motion['isLocked'], 'Motion must remain locked when Plus is active but unlicensed.' );
assert_same( 'Manage Pixelgrade Plus', $motion['actionLabel'], 'Active unlicensed Plus motion action must route to Plus management.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus', $motion['url'], 'Active unlicensed Plus motion action must use the Account Plus section.' );

paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => true,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$styles = pixassist_get_styles_data();
$motion = paf_find_destination( $styles['destinations'], 'motion' );
assert_same( false, $motion['isLocked'], 'Motion must unlock when Plus is active and licensed.' );
assert_same( 'Open Motion', $motion['actionLabel'], 'Licensed Plus motion action must be task-oriented.' );
assert_same( 'https://example.test/wp-admin/site-editor.php?path=%2Fwp_global_styles', $motion['url'], 'Licensed Motion must link to the style editing surface.' );

$tabs_js  = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/index.js' );
$styles_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Styles.js' );
$admin_php = file_get_contents( __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php' );

assert_true( false !== strpos( $tabs_js, 'pixelgrade-assistant/styles' ), 'The Styles component must be registered on the JS tab registry.' );
assert_true( false !== strpos( $styles_js, 'pixelgradeStyles' ), 'The Styles component must read the tab-specific localized payload.' );
assert_true( false !== strpos( $styles_js, 'destination.image' ), 'The Styles component must render section preview images when available.' );
assert_true( false !== strpos( $styles_js, 'pixelgrade-styles__badge' ), 'The Styles component must render badges without crowding card titles.' );
assert_true( false !== strpos( $styles_js, 'destination.isProminent' ), 'The Styles component must render gated destinations quietly.' );
assert_true( false !== strpos( $admin_php, 'pixelgradeStyles' ), 'The admin enqueue must localize the Styles payload.' );

echo "Admin Styles tab OK\n";
