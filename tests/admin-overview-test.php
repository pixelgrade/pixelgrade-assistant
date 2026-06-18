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
 *         classic ones; sibling Starter Sites / Help links resolve to `?tab=` deep links),
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
 *    Help links to the hub Help tab, no Starter link, account reads disconnected.
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
assert_same( array( 'account', 'links', 'onboarding', 'plus', 'theme' ), $keys, 'Overview payload must expose theme/links/plus/account/onboarding.' );

assert_same( false, $overview['theme']['isBlockTheme'], 'Classic theme must read isBlockTheme=false.' );

$canvas = $overview['links'][0];
assert_same( 'customize', $canvas['id'], 'Classic theme canvas link must be the Customizer.' );
assert_same( 'https://example.test/wp-admin/customize.php', $canvas['url'], 'Customizer link URL must resolve.' );
assert_same( 'Edit Styles', $canvas['label'], 'The classic-theme canvas CTA must read "Edit Styles".' );
assert_true( ! empty( $canvas['primary'] ), 'The canvas link must be the primary quick link.' );

assert_same( null, paf_find_link( $overview['links'], 'starter-sites' ), 'No Starter Sites link without a Starter tab.' );

$help = paf_find_link( $overview['links'], 'help' );
assert_true( null !== $help, 'A Help link is always present.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=help', $help['url'], 'Help falls back to the hub Help tab when no Help tab descriptor exists.' );
assert_same( 'Get Help', $help['label'], 'The Help CTA must read "Get Help".' );

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
assert_same( 'https://example.test/wp-admin/site-editor.php?path=%2Fwp_global_styles', $canvas['url'], 'Site Editor canvas link must deep-link into the Styles view.' );
assert_same( 'Edit Styles', $canvas['label'], 'The block-theme canvas CTA must read "Edit Styles".' );

$starter = paf_find_link( $overview['links'], 'starter-sites' );
assert_true( null !== $starter, 'Starter Sites link appears when the tab is registered.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $starter['url'], 'Starter Sites resolves to its in-hub deep link.' );
assert_same( 'Browse Starter Sites', $starter['label'], 'The Starter Sites CTA must read "Browse Starter Sites".' );

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

/*
 * 6. Onboarding "Get started" state model.
 *
 * Pure logic is driven by injected "facts" so it stays WP-free and testable; the full payload
 * (pixassist_get_onboarding_data) gathers those facts behind function_exists guards and so degrades
 * to safe defaults in this harness.
 */

// 6a. Step builder: account is always present + optional; the starter step appears only when demos
//     exist; plugins is always present + required.
$steps_with_demos = pixassist_get_onboarding_steps( array(
	'base_url'          => 'https://example.test/wp-admin/themes.php?page=pixelgrade',
	'account_connected' => true,
	'demos_exist'       => true,
	'starter_imported'  => false,
	'plugins_ready'     => false,
) );
$step_ids = array_map( function ( $s ) { return $s['id']; }, $steps_with_demos );
assert_same( array( 'account', 'starter', 'plugins' ), $step_ids, 'With demos, the steps are account, starter, plugins (in order).' );

$account_step = $steps_with_demos[0];
assert_same( true, $account_step['done'], 'Connected account marks the account step done.' );
assert_same( true, $account_step['optional'], 'The account step is optional (never blocks completion).' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account', $account_step['url'], 'Account step links to the Account tab.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $steps_with_demos[1]['url'], 'Starter step links to the Starter Sites tab.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $steps_with_demos[2]['url'], 'Plugins step links to the Plugins tab.' );
assert_same( false, $steps_with_demos[2]['optional'], 'The plugins step is required.' );

// 6b. No demos → the starter step is omitted (mirrors the wizard hiding it).
$steps_no_demos = pixassist_get_onboarding_steps( array(
	'base_url'          => 'https://example.test/wp-admin/themes.php?page=pixelgrade',
	'account_connected' => false,
	'demos_exist'       => false,
	'starter_imported'  => false,
	'plugins_ready'     => true,
) );
$step_ids_nd = array_map( function ( $s ) { return $s['id']; }, $steps_no_demos );
assert_same( array( 'account', 'plugins' ), $step_ids_nd, 'Without demos, the starter step is omitted.' );

// 6c. Completion = all REQUIRED steps done; the optional account step never blocks completion.
assert_same( true, pixassist_onboarding_is_complete( $steps_no_demos ), 'Required (plugins) done + optional account undone => complete.' );
assert_same( false, pixassist_onboarding_is_complete( $steps_with_demos ), 'A required step undone => not complete.' );

// 6d. Off-switch: a dedicated filter, defaulting from the legacy wizard-allow filter for back-compat.
paf_reset();
assert_same( true, pixassist_onboarding_enabled(), 'Onboarding is enabled by default.' );

paf_reset();
add_filter( 'pixassist_show_onboarding', function () { return false; } );
assert_same( false, pixassist_onboarding_enabled(), 'pixassist_show_onboarding=false disables onboarding.' );

paf_reset();
add_filter( 'pixassist_allow_setup_wizard_module', function () { return false; } );
assert_same( false, pixassist_onboarding_enabled(), 'A theme that disabled the legacy wizard also disables onboarding (back-compat).' );

// 6e. should_show: visible only when enabled, not dismissed, and incomplete.
paf_reset();
assert_same( true, pixassist_onboarding_should_show( $steps_with_demos, true, array( 'dismissed' => false ) ), 'Shown when enabled + not dismissed + incomplete.' );
assert_same( false, pixassist_onboarding_should_show( $steps_with_demos, true, array( 'dismissed' => true ) ), 'Hidden when dismissed.' );
assert_same( false, pixassist_onboarding_should_show( $steps_no_demos, true, array( 'dismissed' => false ) ), 'Hidden when complete.' );
assert_same( false, pixassist_onboarding_should_show( $steps_with_demos, false, array( 'dismissed' => false ) ), 'Hidden when disabled.' );

// 6f. Full payload: safe defaults in this harness (no account/demos/plugins data available) — the
//     plugins step is incomplete, so the card shows.
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
$onboarding = pixassist_get_overview_data()['onboarding'];
$ob_keys = array_keys( $onboarding );
sort( $ob_keys );
assert_same( array( 'completed', 'demosCount', 'dismissEndpoint', 'dismissed', 'enabled', 'show', 'steps' ), $ob_keys, 'Onboarding payload exposes show/enabled/dismissed/completed/steps/demosCount/dismissEndpoint.' );
assert_same( true, $onboarding['enabled'], 'Onboarding enabled by default in the payload.' );
assert_same( false, $onboarding['dismissed'], 'Not dismissed without a persisted marker.' );
assert_same( false, $onboarding['completed'], 'Not complete when the plugins step is unmet.' );
assert_same( true, $onboarding['show'], 'Card shows for a fresh, enabled, incomplete onboarding.' );

// 6g. The dismiss endpoint descriptor is always present ({ method, url }); the url degrades to ''
//     outside WordPress (no rest_url() in this harness). The card POSTs here to persist dismissal.
assert_true( is_array( $onboarding['dismissEndpoint'] ), 'The dismiss endpoint descriptor is an array.' );
assert_same( 'POST', $onboarding['dismissEndpoint']['method'], 'The dismiss endpoint is a POST.' );
assert_same( '', $onboarding['dismissEndpoint']['url'], 'The dismiss endpoint url degrades to empty without rest_url().' );

// 6h. demosCount degrades to 0 when the Starter Sites module is absent (this harness). It drives the
//     "Set up my site" action: 1 ⇒ import inline, >1 ⇒ route to the Starter Sites tab to choose.
assert_same( 0, $onboarding['demosCount'], 'demosCount degrades to 0 without the Starter Sites module.' );

echo "Admin overview data OK\n";
