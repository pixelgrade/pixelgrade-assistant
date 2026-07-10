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
$GLOBALS['paf_is_block_theme']  = false;
$GLOBALS['paf_stylesheet']      = 'anima-lt';
$GLOBALS['paf_block_templates'] = array(
	array(
		'id'   => 'anima-lt//index',
		'slug' => 'index',
	),
	array(
		'id'   => 'anima-lt//front-page',
		'slug' => 'front-page',
	),
);

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

function get_stylesheet() {
	return $GLOBALS['paf_stylesheet'];
}

function get_block_templates( $query = array(), $template_type = 'wp_template' ) {
	return array_map(
		function ( $template ) {
			return (object) $template;
		},
		$GLOBALS['paf_block_templates']
	);
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
	$GLOBALS['paf_stylesheet']     = 'anima-lt';
	$GLOBALS['paf_block_templates'] = array(
		array(
			'id'   => 'anima-lt//index',
			'slug' => 'index',
		),
		array(
			'id'   => 'anima-lt//front-page',
			'slug' => 'front-page',
		),
	);
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
assert_same( array( 'colors', 'typography', 'spacing' ), $ids, 'Styles destinations must focus the card grid on currently available Design System sections.' );

foreach ( array( 'colors', 'typography', 'spacing' ) as $free_id ) {
	$destination = paf_find_destination( $styles['destinations'], $free_id );
	assert_true( null !== $destination, 'Expected free destination missing: ' . $free_id );
	assert_same( '', $destination['gate'], 'Free destination must not be gated: ' . $free_id );
	assert_same( false, $destination['isLocked'], 'Free destination must not be locked: ' . $free_id );
	assert_true( ! empty( $destination['url'] ), 'Free destination must expose a direct editor/customizer link: ' . $free_id );
}

$section_action_labels = array(
	'colors'     => 'Edit the Color System',
	'typography' => 'Manage Typography',
	'spacing'    => 'Adjust Spacing',
);
foreach ( $section_action_labels as $section_id => $action_label ) {
	$destination = paf_find_destination( $styles['destinations'], $section_id );
	assert_same( $action_label, $destination['actionLabel'], 'Section action label must match the intended Style Manager task: ' . $section_id );
}

$classic_section_urls = array(
	'colors'     => 'https://example.test/wp-admin/customize.php?autofocus%5Bsection%5D=sm_color_palettes_section',
	'typography' => 'https://example.test/wp-admin/customize.php?autofocus%5Bsection%5D=sm_font_palettes_section',
	'spacing'    => 'https://example.test/wp-admin/customize.php?autofocus%5Bsection%5D=sm_spacing_section',
);
foreach ( $classic_section_urls as $section_id => $section_url ) {
	$destination = paf_find_destination( $styles['destinations'], $section_id );
	assert_same( $section_url, $destination['url'], 'Classic-theme section links must autofocus the intended Style Manager section: ' . $section_id );
}

$preview_extensions = array(
	'colors'     => 'png',
	'typography' => 'png',
	'spacing'    => 'png',
);

foreach ( $preview_extensions as $preview_id => $extension ) {
	$destination = paf_find_destination( $styles['destinations'], $preview_id );
	assert_true( ! empty( $destination['image'] ), 'Design System section card must expose a preview image: ' . $preview_id );
	assert_true( false !== strpos( $destination['image'], '/admin/images/style-manager-preview-' . $preview_id . '.' . $extension ), 'Preview image URL must point to the local admin image asset: ' . $preview_id );
	assert_true( ! empty( $destination['imageAlt'] ), 'Preview image must expose alt text: ' . $preview_id );
}

assert_same( null, paf_find_destination( $styles['destinations'], 'motion' ), 'Motion must not appear on the Design System page until it has a real Style Manager surface.' );

paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$styles = pixassist_get_styles_data();
$block_theme_styles_url = 'https://example.test/wp-admin/site-editor.php?p=%2Fwp_template%2Fanima-lt%2F%2Ffront-page&canvas=edit&sm-sidebar=1';
assert_same( $block_theme_styles_url, $styles['primaryAction']['url'], 'Block-theme primary action must open an existing Site Editor template canvas with Style Manager visible.' );
$block_theme_section_urls = array(
	'colors'     => $block_theme_styles_url . '&sm-section=sm_color_palettes_section&sm-preview=1',
	'typography' => $block_theme_styles_url . '&sm-section=sm_font_palettes_section&sm-preview=1',
	'spacing'    => $block_theme_styles_url . '&sm-section=sm_spacing_section&sm-preview=1',
);
foreach ( $block_theme_section_urls as $section_id => $section_url ) {
	$destination = paf_find_destination( $styles['destinations'], $section_id );
	assert_same( $section_url, $destination['url'], 'Block-theme section links must open the intended Style Manager section: ' . $section_id );
}
assert_same( null, paf_find_destination( $styles['destinations'], 'motion' ), 'Motion must stay hidden even when Plus is active but unlicensed.' );

paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => true,
	'plus_settings_url'  => 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$styles = pixassist_get_styles_data();
assert_same( null, paf_find_destination( $styles['destinations'], 'motion' ), 'Motion must stay hidden even when Plus is active and licensed.' );

$tabs_js  = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/index.js' );
$styles_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Styles.js' );
$admin_php = file_get_contents( __DIR__ . '/../admin/class-pixelgrade_assistant-admin.php' );
$preview_css_path = __DIR__ . '/../admin/css/styles-preview.css';

assert_true( false !== strpos( $tabs_js, 'pixelgrade-assistant/styles' ), 'The Styles component must be registered on the JS tab registry.' );
assert_true( false !== strpos( $styles_js, 'pixelgradeStyles' ), 'The Styles component must read the tab-specific localized payload.' );
assert_true( false !== strpos( $styles_js, 'destination.image' ), 'The Styles component must render section preview images when available.' );
assert_true( false !== strpos( $styles_js, 'LiveStylePreview' ), 'The Styles component must render normalized live preview boards when available.' );
assert_true( false !== strpos( $styles_js, 'useDesignSystemPreview' ), 'The Styles component must request and refresh the advertised Style Manager preview contract.' );
assert_true( false === strpos( $styles_js, 'data.previewPayload' ), 'The Styles component must not depend on a stale localized preview snapshot.' );
assert_true( false !== strpos( $admin_php, 'pixelgradeStyles' ), 'The admin enqueue must localize the Styles payload.' );
assert_true( false !== strpos( $admin_php, 'admin/css/styles-preview.css' ), 'The Pixelgrade hub must enqueue the scoped live preview stylesheet.' );
assert_true( file_exists( $preview_css_path ), 'The scoped live preview stylesheet must exist.' );
assert_true( false !== strpos( file_get_contents( $preview_css_path ), '@container (max-width: 260px)' ), 'The live boards must include the validated compact card layout.' );

echo "Admin Styles tab OK\n";
