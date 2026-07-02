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
$GLOBALS['paf_plugins_data']   = array( 'plugins' => array( array( 'slug' => 'fixture', 'status' => 'missing' ) ) );
$GLOBALS['paf_starter_data']   = array();
$GLOBALS['paf_layout_data']    = array();
$GLOBALS['paf_account']        = array( 'is_connected' => false );

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
	$GLOBALS['paf_plugins_data']   = array( 'plugins' => array( array( 'slug' => 'fixture', 'status' => 'missing' ) ) );
	$GLOBALS['paf_starter_data']   = array();
	$GLOBALS['paf_layout_data']    = array();
	$GLOBALS['paf_account']        = array( 'is_connected' => false );
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

function paf_find_summary_item( $items, $id ) {
	foreach ( (array) $items as $item ) {
		if ( isset( $item['id'] ) && $id === $item['id'] ) {
			return $item;
		}
	}

	return null;
}

function pixassist_get_plugins_data() {
	return $GLOBALS['paf_plugins_data'];
}

function pixassist_get_starter_sites_data() {
	return $GLOBALS['paf_starter_data'];
}

function pixassist_get_layout_units_data() {
	return $GLOBALS['paf_layout_data'];
}

function pixassist_get_account() {
	return $GLOBALS['paf_account'];
}

function pixassist_is_account_connected() {
	return ! empty( $GLOBALS['paf_account']['is_connected'] );
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
require __DIR__ . '/../includes/admin-overview.php';

assert_true( function_exists( 'pixassist_register_styles_tab' ), 'The Styles tab registration function must be defined.' );

/*
 * 1. Registration: the free Overview tab descriptor — first (order 0), free (no gate), gated only
 *    by the theme-options capability, bound to the `overview` JS component.
 */
$registered = pixassist_register_overview_tab( array() );
assert_same( 1, count( $registered ), 'Overview registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'overview', $tab['id'], 'Overview tab id must be `overview`.' );
assert_same( 'Home', $tab['label'], 'Overview tab visible label must be renamed to Home while keeping id `overview`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Overview tab must require edit_theme_options.' );
assert_same( 'overview', $tab['component'], 'Overview tab must bind the `overview` JS component.' );
assert_same( '', $tab['gate'], 'Overview tab is free — no upsell gate.' );
assert_same( 0, $tab['order'], 'Overview tab must sort first (order 0).' );

// Registration preserves any tabs already in the list.
$registered = pixassist_register_overview_tab( array( array( 'id' => 'starter-sites' ) ) );
assert_same( 2, count( $registered ), 'Overview registration must keep existing tabs.' );

$registered = pixassist_register_styles_tab( array() );
assert_same( 1, count( $registered ), 'Styles registration must append exactly one tab.' );

$styles_tab = $registered[0];
assert_same( 'styles', $styles_tab['id'], 'Styles tab id must be `styles`.' );
assert_same( 'Design System', $styles_tab['label'], 'Styles tab visible label must be `Design System`.' );
assert_same( 'edit_theme_options', $styles_tab['capability'], 'Styles tab must require edit_theme_options.' );
assert_same( 'styles', $styles_tab['component'], 'Styles must render an in-hub component.' );
assert_same( '', $styles_tab['gate'], 'Styles tab is free — no upsell gate.' );
assert_same( 10, $styles_tab['order'], 'Styles must sort after Home and before Starter Sites.' );
assert_true( empty( $styles_tab['url'] ), 'Styles must not be a link tab.' );

/*
 * 2. Through the live registry the Overview tab is present and sorts first.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
$data = pixassist_get_admin_hub_data();
assert_same( 'overview', $data['defaultTab'], 'Overview must be the default (first) hub tab.' );
assert_same( array( 'overview', 'styles' ), array_column( $data['tabs'], 'id' ), 'Home and Design System must be the first design-cluster tabs.' );
assert_same( 'Home', $data['tabs'][0]['label'], 'The normalized Overview tab must be visible as Home.' );
assert_same( 'Design System', $data['tabs'][1]['label'], 'The normalized Styles tab must be visible as Design System.' );

/*
 * 3. Classic theme + Plus inactive: canvas link is the Customizer, Plus card is in `discover`,
 *    Help links to the hub Help tab, no Starter link, account reads disconnected.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => false,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => '',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();

$keys = array_keys( $overview );
sort( $keys );
assert_same( array( 'account', 'links', 'nextAction', 'onboarding', 'plus', 'safety', 'stateSummary', 'theme' ), $keys, 'Overview payload must expose command-center state plus theme/links/plus/account/onboarding.' );

assert_same( false, $overview['theme']['isBlockTheme'], 'Classic theme must read isBlockTheme=false.' );

$canvas = $overview['links'][0];
assert_same( 'styles', $canvas['id'], 'Home must route the style CTA to the in-hub Design System section when it exists.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=styles', $canvas['url'], 'Home Design System CTA must resolve to the in-hub Styles route.' );
assert_same( 'Open Design System', $canvas['label'], 'The Home style CTA must read "Open Design System".' );
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
 * 4. Command-center state: setup gaps take priority before starter/content actions, and Home
 *    explains the immediate safety/reversibility of the recommended action.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
add_filter(
	'pixelgrade/admin_hub/tabs',
	function ( $tabs ) {
		$tabs[] = array( 'id' => 'plugins', 'label' => 'Setup', 'component' => 'plugins', 'order' => 50 );
		$tabs[] = array( 'id' => 'starter-sites', 'label' => 'Starter Sites', 'component' => 'starterSites', 'order' => 30 );

		return $tabs;
	}
);
paf_set_plus_status( array(
	'is_plus_active'     => false,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => '',
	'plus_product_label' => 'Pixelgrade Plus',
) );
$GLOBALS['paf_plugins_data'] = array(
	'plugins' => array(
		array( 'slug' => 'nova-blocks', 'name' => 'Nova Blocks', 'status' => 'active', 'isActive' => true ),
		array( 'slug' => 'style-manager', 'name' => 'Style Manager', 'status' => 'missing', 'isActive' => false ),
	),
);
$GLOBALS['paf_starter_data'] = array(
	'starters'     => array(
		array( 'id' => 'felt-lt', 'title' => 'Felt LT' ),
	),
	'imported'     => array(),
	'applied'      => array(
		'activeStarter' => '',
		'layoutUnits'   => array(),
		'recipes'       => array(),
	),
	'siteAnalysis' => array(
		'classification' => 'empty',
		'isEmpty'        => true,
		'contentCount'   => 0,
	),
);

$overview = pixassist_get_overview_data();

$setup_summary = paf_find_summary_item( $overview['stateSummary'], 'setup' );
assert_true( null !== $setup_summary, 'Command-center summary must include recommended plugin readiness.' );
assert_same( '1 of 2 ready', $setup_summary['value'], 'Plugin readiness summary must count ready plugins.' );
assert_same( 'needs-attention', $setup_summary['tone'], 'Plugin readiness should ask for attention when a plugin is missing.' );
assert_same( 'setup', $overview['nextAction']['id'], 'Recommended next action should prioritize setup gaps.' );
assert_same( 'Review setup', $overview['nextAction']['label'], 'Setup next action label should be concise.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $overview['nextAction']['url'], 'Setup next action should route to the Setup tab.' );
assert_true( ! empty( $overview['nextAction']['safety'] ), 'Next action must include safety/reversibility copy.' );
assert_true( ! empty( $overview['safety']['items'] ), 'Overview payload must include reusable safety notes.' );

/*
 * 5. Command-center state: once setup is ready and a starter is applied, the product direction
 *    points users toward Page Patterns without requiring this branch to implement the Content tab.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
add_filter(
	'pixelgrade/admin_hub/tabs',
	function ( $tabs ) {
		$tabs[] = array( 'id' => 'plugins', 'label' => 'Setup', 'component' => 'plugins', 'order' => 50 );
		$tabs[] = array( 'id' => 'starter-sites', 'label' => 'Starter Sites', 'component' => 'starterSites', 'order' => 30 );
		$tabs[] = array( 'id' => 'layouts', 'label' => 'Layouts', 'component' => 'layoutUnits', 'order' => 35 );
		$tabs[] = array( 'id' => 'content', 'label' => 'Page Patterns', 'component' => 'contentPatterns', 'capability' => 'manage_options', 'order' => 40 );

		return $tabs;
	}
);
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );
$GLOBALS['paf_plugins_data'] = array(
	'plugins' => array(
		array( 'slug' => 'nova-blocks', 'name' => 'Nova Blocks', 'status' => 'active', 'isActive' => true ),
		array( 'slug' => 'style-manager', 'name' => 'Style Manager', 'status' => 'outdated', 'isActive' => true ),
	),
);
$GLOBALS['paf_starter_data'] = array(
	'starters'     => array(
		array( 'id' => 'felt-lt', 'title' => 'Felt LT' ),
	),
	'imported'     => array(
		'felt-lt' => array( 'post_types' => array( 'page' => array( 12 ) ) ),
	),
	'applied'      => array(
		'activeStarter' => 'felt-lt',
		'layoutUnits'   => array(
			'wp_template_part:header' => array( 'title' => 'Felt Header' ),
		),
		'recipes'       => array(),
	),
	'siteAnalysis' => array(
		'classification' => 'already-imported',
		'isEmpty'        => false,
		'contentCount'   => 3,
	),
);
$GLOBALS['paf_layout_data'] = array(
	'applied' => array(
		'wp_template_part:header' => array( 'title' => 'Felt Header' ),
	),
);

$overview = pixassist_get_overview_data();

$starter_summary = paf_find_summary_item( $overview['stateSummary'], 'starter' );
assert_same( 'Felt LT applied', $starter_summary['value'], 'Starter summary should name the active starter when known.' );

$layouts_summary = paf_find_summary_item( $overview['stateSummary'], 'layouts' );
assert_same( '1 applied', $layouts_summary['value'], 'Layout summary should count currently applied layout units.' );

$plus_summary = paf_find_summary_item( $overview['stateSummary'], 'plus' );
assert_same( 'Installed, not licensed', $plus_summary['value'], 'Plus summary should distinguish active unlicensed installs.' );

assert_same( 'content', $overview['nextAction']['id'], 'After a starter is applied, Home should recommend adding page patterns.' );
assert_same( 'Add a page pattern', $overview['nextAction']['label'], 'Content next-action label must match the shared product decision.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=content', $overview['nextAction']['url'], 'Content next-action must target the visible Page Patterns tab route.' );
assert_true( false !== strpos( $overview['nextAction']['description'], 'starter' ), 'Content next-action should explain why this is the right next move.' );

$GLOBALS['paf_denied_caps']['manage_options'] = true;
$overview = pixassist_get_overview_data();
assert_same( 'account', $overview['nextAction']['id'], 'Home must not recommend Page Patterns when the tab is hidden by manage_options.' );
$content_summary = paf_find_summary_item( $overview['stateSummary'], 'content' );
assert_same( '', $content_summary['url'], 'Content summary must not route to a hidden Page Patterns tab.' );

/*
 * 6. Command-center state: installed-but-unlicensed Plus is actionable and should be clearer than a
 *    generic style-refinement nudge once setup/account/starter/layouts do not need attention.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => false,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );
$GLOBALS['paf_account']      = array( 'is_connected' => true, 'email' => 'test@example.test' );
$GLOBALS['paf_plugins_data'] = array( 'plugins' => array() );
$GLOBALS['paf_starter_data'] = array(
	'starters'     => array(),
	'imported'     => array(),
	'applied'      => array(),
	'siteAnalysis' => array( 'contentCount' => 0 ),
);
$GLOBALS['paf_layout_data']  = array( 'applied' => array() );

$overview = pixassist_get_overview_data();

assert_same( 'plus', $overview['nextAction']['id'], 'Installed-but-unlicensed Plus should be the next action when no setup/starter/layout/account work is pending.' );
assert_same( 'Set up Pixelgrade Plus', $overview['nextAction']['label'], 'The Plus next action should use the setup CTA from the fixed Plus status read.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus', $overview['nextAction']['url'], 'The Plus next action must route to Plus-owned setup inside Account.' );

/*
 * 7. Block theme + Plus active-but-unlicensed, with sibling Starter Sites + Help tabs registered:
 *    canvas link is the Site Editor, Starter + Help resolve to in-hub `?tab=` deep links, and the
 *    Plus card is in the `set up` state pointing at the Plus Account & License URL.
 */
paf_reset();
$GLOBALS['paf_is_block_theme'] = true;
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
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
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();

$canvas = $overview['links'][0];
assert_same( 'styles', $canvas['id'], 'Block-theme Home must route the style CTA to the in-hub Design System section.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=styles', $canvas['url'], 'Block-theme Home Design System CTA must resolve to the in-hub Styles route.' );
assert_same( 'Open Design System', $canvas['label'], 'The block-theme Home style CTA must read "Open Design System".' );

$starter = paf_find_link( $overview['links'], 'starter-sites' );
assert_true( null !== $starter, 'Starter Sites link appears when the tab is registered.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $starter['url'], 'Starter Sites resolves to its in-hub deep link.' );
assert_same( 'Browse Starter Sites', $starter['label'], 'The Starter Sites CTA must read "Browse Starter Sites".' );

$help = paf_find_link( $overview['links'], 'help' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=help', $help['url'], 'Help resolves to the Help hub tab when registered.' );

assert_same( 'setup', $overview['plus']['state'], 'Active-but-unlicensed Plus must be in the set-up state.' );
assert_same( true, $overview['plus']['isActive'], 'Active Plus must report isActive=true.' );
assert_same( false, $overview['plus']['isLicensed'], 'Unlicensed Plus must report isLicensed=false.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus', $overview['plus']['url'], 'Set-up state links to the Plus section inside Account.' );

/*
 * 8. Plus active + licensed: the card flips to the manage state.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => true,
	'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
	'plus_product_label' => 'Pixelgrade Plus',
) );

$overview = pixassist_get_overview_data();
assert_same( 'manage', $overview['plus']['state'], 'Licensed Plus must be in the manage state.' );
assert_same( true, $overview['plus']['isLicensed'], 'Licensed Plus must report isLicensed=true.' );

$overview_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Overview.js' );
assert_true( false !== strpos( $overview_js, 'renderCommandCenter' ), 'Home must render the state-aware command center.' );
assert_true( false !== strpos( $overview_js, 'stateSummary' ), 'Home must read the server state summary.' );
assert_true( false !== strpos( $overview_js, 'nextAction' ), 'Home must render the server-prioritized next action.' );
assert_true( false !== strpos( $overview_js, 'plus.isActive' ), 'Home must suppress the large Plus card once Plus is already active.' );
assert_true( false !== strpos( $overview_js, 'tab=account&section=plus' ) || false !== strpos( $overview_js, 'renderPlusCard( plus )' ), 'Plus setup/manage routing must stay tied to the Account Plus section, not a standalone Home card.' );

$get_started_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/GetStartedCard.js' );
assert_true( false !== strpos( $get_started_js, 'shouldRouteToStarterChooser' ), 'Get started must decide multi-starter routing through an explicit helper.' );
assert_true( false !== strpos( $get_started_js, "hasIncompleteStep( steps, 'plugins' )" ), 'Get started must prioritize incomplete plugin setup before routing to Starter Sites.' );
assert_true( false !== strpos( $get_started_js, 'window.location.reload()' ), 'Get started must refresh after successful setup so plugin state is current.' );

/*
 * 9. Onboarding "Get started" state model.
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
assert_same( array( 'account', 'plugins', 'starter' ), $step_ids, 'With demos, the steps are account, plugins, starter (in order).' );

$account_step = $steps_with_demos[0];
assert_same( true, $account_step['done'], 'Connected account marks the account step done.' );
assert_same( true, $account_step['optional'], 'The account step is optional (never blocks completion).' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account', $account_step['url'], 'Account step links to the Account tab.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $steps_with_demos[1]['url'], 'Plugins step links to the Plugins tab.' );
assert_same( false, $steps_with_demos[1]['optional'], 'The plugins step is required.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $steps_with_demos[2]['url'], 'Starter step links to the Starter Sites tab.' );

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
