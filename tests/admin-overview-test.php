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
 *         classic ones; the Design Library / Help links resolve to `?tab=` deep links),
 *       * the quiet "At a glance" rows (theme / setup / starter / account, plus a Plus row only
 *         once Plus is installed; detail copy only when actionable; `needs-attention` tone only
 *         for pending required setup — Home renders no next-action box and no safety bullets),
 *       * the Pixelgrade Plus discovery card across the three 4-key states
 *         (discover / set up / manage; Home renders it only while Plus is not installed), and
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
assert_same( array( 'account', 'links', 'onboarding', 'plus', 'stateSummary', 'theme' ), $keys, 'Overview payload is calm: theme/links/plus/account/onboarding/stateSummary — no next-action box, no safety bullets.' );

assert_same( false, $overview['theme']['isBlockTheme'], 'Classic theme must read isBlockTheme=false.' );

// The quiet At a glance rows: theme, setup, starter, account — and NO Plus row while Plus is not
// installed (the small invitation card is Home's single Plus presence then).
assert_same( array( 'theme', 'setup', 'starter', 'account' ), array_column( $overview['stateSummary'], 'id' ), 'At a glance rows are theme/setup/starter/account, without a Plus row while Plus is absent.' );

$canvas = $overview['links'][0];
assert_same( 'styles', $canvas['id'], 'Home must route the style CTA to the in-hub Design System section when it exists.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=styles', $canvas['url'], 'Home Design System CTA must resolve to the in-hub Styles route.' );
assert_same( 'Open Design System', $canvas['label'], 'The Home style CTA must read "Open Design System".' );
assert_true( ! empty( $canvas['primary'] ), 'The canvas link must be the primary quick link.' );

assert_same( null, paf_find_link( $overview['links'], 'design-library' ), 'No Design Library link without a Design Library (or legacy Starter Sites) tab.' );

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
 * 4. At a glance: pending required setup is the ONLY state that raises the needs-attention tone,
 *    and the only row that carries a detail line for it. Home stays quiet otherwise — there is no
 *    next-action box and no safety-notes block in the payload at all.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
add_filter(
	'pixelgrade/admin_hub/tabs',
	function ( $tabs ) {
		$tabs[] = array( 'id' => 'plugins', 'label' => 'Site Setup', 'component' => 'plugins', 'order' => 50 );
		$tabs[] = array( 'id' => 'design-library', 'label' => 'Design Library', 'component' => 'designLibrary', 'order' => 30 );

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
assert_true( null !== $setup_summary, 'At a glance must include recommended plugin readiness.' );
assert_same( '1 of 2 ready', $setup_summary['value'], 'Plugin readiness summary must count ready plugins.' );
assert_same( 'needs-attention', $setup_summary['tone'], 'Plugin readiness should ask for attention when a plugin is missing.' );
assert_same( '1 plugin needs setup.', $setup_summary['detail'], 'Pending setup carries its one actionable detail line (singular).' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $setup_summary['url'], 'The setup row routes to the Site Setup tab.' );
assert_true( ! array_key_exists( 'nextAction', $overview ), 'Home no longer computes a next-action box — the Get Started card is the only spotlight.' );
assert_true( ! array_key_exists( 'safety', $overview ), 'Home no longer ships a safety-notes block.' );

$starter_summary = paf_find_summary_item( $overview['stateSummary'], 'starter' );
assert_same( 'Ready to choose', $starter_summary['value'], 'With starters available and none imported the starter row reads Ready to choose.' );
assert_same( '', $starter_summary['detail'], 'The steady starter row carries no teaching detail.' );

$library = paf_find_link( $overview['links'], 'design-library' );
assert_true( null !== $library, 'A Design Library quick link appears when the merged tab is registered.' );
assert_same( 'Browse the Design Library', $library['label'], 'The Design Library quick link label.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=design-library', $library['url'], 'The Design Library quick link resolves to the merged tab route.' );

/*
 * 5. At a glance with a starter applied: the row names the active starter, the retired Site Parts /
 *    Content rows stay retired (Design Library owns those inventories), and installed-but-unlicensed
 *    Plus earns a quiet row with its one actionable detail line — never a needs-attention tone.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
add_filter(
	'pixelgrade/admin_hub/tabs',
	function ( $tabs ) {
		$tabs[] = array( 'id' => 'plugins', 'label' => 'Site Setup', 'component' => 'plugins', 'order' => 50 );
		$tabs[] = array( 'id' => 'design-library', 'label' => 'Design Library', 'component' => 'designLibrary', 'order' => 30 );

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

assert_same( array( 'theme', 'setup', 'starter', 'account', 'plus' ), array_column( $overview['stateSummary'], 'id' ), 'With Plus installed the At a glance rows are theme/setup/starter/account/plus.' );

$starter_summary = paf_find_summary_item( $overview['stateSummary'], 'starter' );
assert_same( 'Felt LT applied', $starter_summary['value'], 'Starter row should name the active starter when known.' );

assert_same( null, paf_find_summary_item( $overview['stateSummary'], 'layouts' ), 'Home carries no Site Parts inventory row — the Design Library owns it.' );
assert_same( null, paf_find_summary_item( $overview['stateSummary'], 'content' ), 'Home carries no Content inventory row — the Design Library owns it.' );

$setup_summary = paf_find_summary_item( $overview['stateSummary'], 'setup' );
assert_same( 'All ready', $setup_summary['value'], 'Outdated-but-active plugins still count as ready.' );
assert_same( '', $setup_summary['detail'], 'A ready setup row carries no detail line.' );
assert_same( 'ok', $setup_summary['tone'], 'A ready setup row stays quiet.' );

$plus_summary = paf_find_summary_item( $overview['stateSummary'], 'plus' );
assert_same( 'Installed, not licensed', $plus_summary['value'], 'Plus row should distinguish active unlicensed installs.' );
assert_same( 'Activate a license to unlock premium features.', $plus_summary['detail'], 'Unlicensed Plus carries its one actionable detail line.' );
assert_same( 'neutral', $plus_summary['tone'], 'Unlicensed Plus never presses with a needs-attention tone.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus', $plus_summary['url'], 'The Plus row routes to Plus-owned setup inside Account.' );

/*
 * 6. At a glance in a bare steady state (no plugin requirements, no starters, connected account):
 *    every row is quiet, values read as facts, and the licensed Plus row drops its detail line.
 */
paf_reset();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
paf_set_plus_status( array(
	'is_plus_active'     => true,
	'is_plus_licensed'   => true,
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

$setup_summary = paf_find_summary_item( $overview['stateSummary'], 'setup' );
assert_same( 'No plugin requirements', $setup_summary['value'], 'No recommended plugins reads as a plain fact.' );
assert_same( 'ok', $setup_summary['tone'], 'No plugin requirements is a quiet state.' );

$starter_summary = paf_find_summary_item( $overview['stateSummary'], 'starter' );
assert_same( 'No starters available', $starter_summary['value'], 'A theme without starters reads as a plain fact.' );

$account_summary = paf_find_summary_item( $overview['stateSummary'], 'account' );
assert_same( 'Connected as test@example.test', $account_summary['value'], 'The connected account row carries the identity as its value.' );
assert_same( '', $account_summary['detail'], 'The connected account row needs no detail line.' );

$plus_summary = paf_find_summary_item( $overview['stateSummary'], 'plus' );
assert_same( 'Licensed', $plus_summary['value'], 'Licensed Plus reads as a plain fact.' );
assert_same( '', $plus_summary['detail'], 'Licensed Plus carries no detail line.' );
assert_same( 'ok', $plus_summary['tone'], 'Licensed Plus is a quiet state.' );

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

$library = paf_find_link( $overview['links'], 'design-library' );
assert_true( null !== $library, 'The Design Library quick link falls back to a legacy Starter Sites tab (a companion that has not moved to the merged tab yet).' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=starter-sites', $library['url'], 'The legacy fallback resolves to the registered Starter Sites route.' );
assert_same( 'Browse the Design Library', $library['label'], 'The quick link keeps the Design Library label.' );

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
assert_true( false !== strpos( $overview_js, 'renderGlance' ), 'Home must render the quiet At a glance card.' );
assert_true( false !== strpos( $overview_js, 'stateSummary' ), 'Home must read the server state summary rows.' );
assert_true( false !== strpos( $overview_js, 'renderQuickActions' ), 'Home must render the quick actions into the sibling tabs.' );
assert_true( false !== strpos( $overview_js, 'plus.isActive' ), 'Home must suppress the Plus invitation once Plus is already installed.' );
assert_same( false, strpos( $overview_js, 'nextAction' ), 'Home renders no next-action box — the Get Started card is the only spotlight.' );
assert_same( false, strpos( $overview_js, 'renderCommandCenter' ), 'The badge-tile command center stays retired.' );
assert_same( false, strpos( $overview_js, 'renderOrientation' ), 'The standalone marketing hero stays retired (orientation lives in the Get Started intro).' );

$get_started_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/GetStartedCard.js' );
assert_true( false !== strpos( $get_started_js, 'shouldRouteToStarterChooser' ), 'Get started must decide multi-starter routing through an explicit helper.' );
assert_true( false !== strpos( $get_started_js, "hasIncompleteStep( steps, 'plugins' )" ), 'Get started must prioritize incomplete plugin setup before routing to Starter Sites.' );
assert_true( false !== strpos( $get_started_js, 'window.location.reload()' ), 'Get started must refresh after successful setup so plugin state is current.' );
assert_true( false !== strpos( $get_started_js, 'Set up my site' ), 'The Get started primary must say what it does (runs setup inline).' );
assert_same( false, strpos( $get_started_js, 'Review setup' ), 'The Get started primary must not promise a review while performing installs.' );

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
