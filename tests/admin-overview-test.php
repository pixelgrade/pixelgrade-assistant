<?php
/**
 * Pins the free Overview tab (#44) — the Appearance -> Pixelgrade hub's landing tab.
 *
 * The React tab is presentational; the logic + copy live in PHP so they can be pinned here:
 *   - pixassist_register_overview_tab(): registers the free Overview tab on the #42
 *     `pixelgrade/admin_hub/tabs` registry (id `overview`, component `overview`, order 0, free).
 *   - pixassist_get_overview_data(): assembles the bootstrap payload the tab renders —
 *       * theme status (name / version / block-theme),
 *       * quick links (the canvas link is the Site Editor for block themes, the Customizer for
 *         classic ones; sibling Starter Sites / Help tabs resolve to `?tab=` deep links when
 *         registered, with Help falling back to the classic dashboard),
 *       * the Pixelgrade Plus discovery card across the three 4-key states
 *         (discover / set up / manage), and
 *       * the host account identity (read-only, graceful when disconnected).
 *
 * Standalone: run with `php tests/admin-overview-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

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

function paf_reset() {
	$GLOBALS['paf_filters']        = array();
	$GLOBALS['paf_denied_caps']    = array();
	$GLOBALS['paf_is_block_theme'] = false;
}

/**
 * Drive pixassist_get_plus_status() to a fixed 4-key payload for a test case.
 */
function paf_set_plus_status( $status ) {
	add_filter(
		'pixelgrade_assistant_plus_status',
		function () use ( $status ) {
			return $status;
		}
	);
}

function paf_find_link( $links, $id ) {
	foreach ( (array) $links as $link ) {
		if ( isset( $link['id'] ) && $id === $link['id'] ) {
			return $link;
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
require __DIR__ . '/../includes/admin-overview.php';

/*
 * 1. Registration: the free Overview tab descriptor — first (order 0), free (no gate), gated only
 *    by the theme-options capability, bound to the `overview` JS component.
 */
$registered = pixassist_register_overview_tab( array() );
assert_same( 1, count( $registered ), 'Overview registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'overview', $tab['id'], 'Overview tab id must be `overview`.' );
assert_same( 'Overview', $tab['label'], 'Overview tab label must be `Overview`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Overview tab must require edit_theme_options.' );
assert_same( 'overview', $tab['component'], 'Overview tab must bind the `overview` JS component.' );
assert_same( '', $tab['gate'], 'Overview tab is free — no upsell gate.' );
assert_same( 0, $tab['order'], 'Overview tab must sort first (order 0).' );

// Registration preserves any tabs already in the list.
$registered = pixassist_register_overview_tab( array( array( 'id' => 'starter-sites' ) ) );
assert_same( 2, count( $registered ), 'Overview registration must keep existing tabs.' );

/*
 * 2. Through the live registry the Overview tab is present and sorts first.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
$data = pixassist_get_admin_hub_data();
assert_same( 'overview', $data['defaultTab'], 'Overview must be the default (first) hub tab.' );

/*
 * 3. Classic theme + Plus inactive: canvas link is the Customizer, Plus card is in `discover`,
 *    Help falls back to the classic dashboard, no Starter link, account reads disconnected.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => false,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => '',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();

$keys = array_keys( $overview );
sort( $keys );
assert_same( array( 'account', 'links', 'plus', 'theme' ), $keys, 'Overview payload must expose exactly theme/links/plus/account.' );

assert_same( false, $overview['theme']['isBlockTheme'], 'Classic theme must read isBlockTheme=false.' );

$canvas = $overview['links'][0];
assert_same( 'customize', $canvas['id'], 'Classic theme canvas link must be the Customizer.' );
assert_same( 'https://example.test/wp-admin/customize.php', $canvas['url'], 'Customizer link URL must resolve.' );
assert_true( ! empty( $canvas['primary'] ), 'The canvas link must be the primary quick link.' );

assert_same( null, paf_find_link( $overview['links'], 'starter-sites' ), 'No Starter Sites link without a Starter tab.' );

$help = paf_find_link( $overview['links'], 'help' );
assert_true( null !== $help, 'A Help link is always present.' );
assert_same( 'https://example.test/wp-admin/admin.php?page=pixelgrade_assistant', $help['url'], 'Help falls back to the classic dashboard when no Help tab exists.' );

assert_same( 'discover', $overview['plus']['state'], 'Inactive Plus must be in the discover state.' );
assert_same( false, $overview['plus']['isActive'], 'Inactive Plus must report isActive=false.' );
assert_same( 'https://pixelgrade.com/plus/', $overview['plus']['url'], 'Discover state links to the shop plus page.' );
assert_true( '' !== $overview['plus']['label'], 'Plus card must carry a CTA label.' );

assert_true( is_array( $overview['account'] ), 'Overview must carry the account identity.' );
assert_same( false, $overview['account']['is_connected'], 'Account reads disconnected without a connection.' );

/*
 * 4. Block theme + Plus active-but-unlicensed, with sibling Starter Sites + Help tabs registered:
 *    canvas link is the Site Editor, Starter + Help resolve to in-hub `?tab=` deep links, and the
 *    Plus card is in the `set up` state pointing at the Plus Account & License URL.
 */
paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter(
	'pixelgrade/admin_hub/tabs',
	function ( $tabs ) {
		$tabs[] = array( 'id' => 'starter-sites', 'label' => 'Starter Sites', 'component' => 'starterSites', 'order' => 30 );
		$tabs[] = array( 'id' => 'help', 'label' => 'Help', 'component' => 'help', 'order' => 90 );

		return $tabs;
	}
);
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account-license',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();

$canvas = $overview['links'][0];
assert_same( 'site-editor', $canvas['id'], 'Block theme canvas link must be the Site Editor.' );
assert_same( 'https://example.test/wp-admin/site-editor.php', $canvas['url'], 'Site Editor link URL must resolve.' );

$starter = paf_find_link( $overview['links'], 'starter-sites' );
assert_true( null !== $starter, 'Starter Sites link appears when the tab is registered.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $starter['url'], 'Starter Sites resolves to its in-hub deep link.' );

$help = paf_find_link( $overview['links'], 'help' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=help', $help['url'], 'Help resolves to the Help hub tab when registered.' );

assert_same( 'setup', $overview['plus']['state'], 'Active-but-unlicensed Plus must be in the set-up state.' );
assert_same( true, $overview['plus']['isActive'], 'Active Plus must report isActive=true.' );
assert_same( false, $overview['plus']['isLicensed'], 'Unlicensed Plus must report isLicensed=false.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account-license', $overview['plus']['url'], 'Set-up state links to the Plus Account & License URL.' );

/*
 * 5. Plus active + licensed: the card flips to the manage state.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => true,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account-license',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();
assert_same( 'manage', $overview['plus']['state'], 'Licensed Plus must be in the manage state.' );
assert_same( true, $overview['plus']['isLicensed'], 'Licensed Plus must report isLicensed=true.' );

echo "Admin overview data OK\n";
