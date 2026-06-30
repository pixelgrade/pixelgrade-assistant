<?php
/**
 * Pins the free Starter Sites tab (#49) and the Plus starter-injection contract.
 *
 * Standalone: run with `php tests/admin-starter-sites-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']      = array();
$GLOBALS['paf_denied_caps']  = array();
$GLOBALS['paf_plugin_config'] = array();
$GLOBALS['paf_options']       = array();
$GLOBALS['paf_post_counts']   = array();

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function apply_filters( $hook, $value ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	$args = func_get_args();
	array_shift( $args );

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $entry ) {
		$value     = $args[0];
		$accepted  = isset( $entry['args'] ) ? (int) $entry['args'] : 1;
		$arguments = array_slice( $args, 0, max( 1, $accepted ) );
		$args[0]   = call_user_func_array( $entry['callback'], $arguments );
	}

	return $args[0];
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

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_html_x( $text, $context, $domain = 'default' ) {
	return $text;
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function trailingslashit( $value ) {
	return rtrim( (string) $value, '/' ) . '/';
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function wp_count_posts( $post_type = 'post' ) {
	$counts = isset( $GLOBALS['paf_post_counts'][ $post_type ] ) ? $GLOBALS['paf_post_counts'][ $post_type ] : array();

	return (object) array_merge(
		array(
			'publish' => 0,
			'private' => 0,
			'draft'   => 0,
			'future'  => 0,
		),
		$counts
	);
}

function get_post_types( $args = array(), $output = 'names' ) {
	return array( 'post', 'page', 'portfolio' );
}

function post_type_exists( $post_type ) {
	return in_array( $post_type, array( 'post', 'page', 'portfolio' ), true );
}

// Simulate the installed/active plugin set the dependency gate inspects. The test toggles entries in
// $GLOBALS['paf_installed_plugins'] (file_path => is_active) to drive the gate.
function get_plugins() {
	$plugins = array();
	foreach ( (array) ( $GLOBALS['paf_installed_plugins'] ?? array() ) as $file => $active ) {
		$plugins[ $file ] = array( 'Name' => $file );
	}

	return $plugins;
}

function is_plugin_active( $plugin_file ) {
	return ! empty( $GLOBALS['paf_installed_plugins'][ $plugin_file ] );
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

function pixassist_get_plus_status() {
	return array(
		'is_plus_active'     => true,
		'is_plus_licensed'   => false,
		'plus_settings_url'  => 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=account&section=plus',
		'plus_product_label' => 'Pixelgrade Plus',
	);
}

class PixelgradeAssistant_Admin {
	public static $internalApiEndpoints = array(
		'import'      => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/import',
		),
		'importStarter' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/import_starter',
		),
		'applyRecipe' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/apply_recipe',
		),
		'importUnit'  => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/import_unit',
		),
		'uploadMedia' => array(
			'method' => 'POST',
			'url'    => 'https://example.test/wp-json/pixassist/v1/upload_media',
		),
	);

	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}

	public static function get_option( $key, $default = null ) {
		return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
	}

	public static function set_option( $key, $value ) {
		$GLOBALS['paf_options'][ $key ] = $value;
	}

	public static function get_theme_support() {
		return array(
			'theme_name'  => 'anima-lt',
			'theme_title' => 'Anima LT',
		);
	}
}

require __DIR__ . '/../includes/host-extension-surface.php';

$module = __DIR__ . '/../includes/admin-starter-sites.php';
assert_true( file_exists( $module ), 'The Starter Sites tab module must exist at includes/admin-starter-sites.php.' );
require $module;

assert_true( function_exists( 'pixassist_register_starter_sites_tab' ), 'The Starter Sites tab registration function must be defined.' );
assert_true( function_exists( 'pixassist_get_admin_hub_starters' ), 'The starter normalizer accessor must be defined.' );
assert_true( function_exists( 'pixassist_get_starter_sites_data' ), 'The Starter Sites payload function must be defined.' );

$registered = pixassist_register_starter_sites_tab( array() );
assert_same( 1, count( $registered ), 'Starter Sites registration must append exactly one tab.' );

$tab = $registered[0];
assert_same( 'starter-sites', $tab['id'], 'Starter Sites tab id must be `starter-sites`.' );
assert_same( 'Starter Sites', $tab['label'], 'Starter Sites tab label must be `Starter Sites`.' );
assert_same( 'edit_theme_options', $tab['capability'], 'Starter Sites tab must require edit_theme_options.' );
assert_same( 'starterSites', $tab['component'], 'Starter Sites tab must bind the `starterSites` JS component.' );
assert_same( '', $tab['gate'], 'Starter Sites tab is mixed but host-visible/free - no tab-level gate.' );
assert_same( 30, $tab['order'], 'Starter Sites tab must sort after Plugins and before Help (order 30).' );

$GLOBALS['paf_filters'] = array();
add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_starter_sites_tab' );
$tabs = pixassist_get_admin_hub_tabs();
assert_same( 1, count( $tabs ), 'The normalized hub registry must include the Starter Sites tab.' );
assert_same( 'starter-sites', $tabs[0]['id'], 'The normalized Starter Sites tab must retain id `starter-sites`.' );
assert_same( '', $tabs[0]['gate'], 'The normalized Starter Sites tab must remain host-visible/free.' );

$GLOBALS['paf_plugin_config'] = array(
	'starterContent' => array(
		'l10n'               => array(
			'importTitle'              => '{{theme_name}} demo content',
			'importContentDescription' => 'Import the content from the theme demo.',
			'noSources'                => 'No starter sites are configured.',
			'alreadyImportedConfirm'   => 'Already imported?',
			'importingData'            => 'Getting data...',
			'somethingWrong'           => 'Something went wrong.',
			'errorMessage'             => 'Not available.',
			'importSuccessful'         => 'Successfully imported.',
			'imported'                 => 'Imported',
			'import'                   => 'Import',
			'importSelected'           => 'Import selected',
		),
		'defaultSceRestPath' => 'wp-json/sce/v2',
		'demos'              => array(
			'main'       => array(
				'title'       => 'Main demo',
				'description' => 'Main starter description.',
				'url'         => 'https://demos.pixelgrade.test/main',
				'order'       => 20,
				'image'       => 'https://demos.pixelgrade.test/main.jpg',
			),
			'anima-portfolio' => array(
				'title'       => 'Meridian',
				'description' => 'Portfolio starter description.',
				'url'         => 'https://demos.pixelgrade.test/portfolio',
				'order'       => 15,
				'image'       => 'https://demos.pixelgrade.test/portfolio.jpg',
			),
			array(
				'id'    => 'secondary',
				'url'   => 'https://demos.pixelgrade.test/secondary/',
				'order' => 10,
			),
			'missing-url' => array(
				'title' => 'Missing URL',
			),
		),
	),
);

$GLOBALS['paf_options']['imported_starter_content'] = array();
$GLOBALS['paf_options']['enabled_features']         = array();

$GLOBALS['paf_filters'] = array();
add_filter(
	'pixelgrade/admin_hub/starters',
	function ( $starters, $context ) {
		assert_same( 'assistant', $context['provider'], 'Starter filter context must identify Assistant as the host/provider.' );
		assert_true( isset( $starters['main'] ), 'Starter filter must receive the configured free demos before Plus injects premium starters.' );

		$starters['premium-pack'] = array(
			'title'       => 'Premium pack',
			'description' => 'Premium starter description.',
			'url'         => 'https://premium.pixelgrade.test/pack/',
			'baseRestUrl' => 'https://premium.pixelgrade.test/pack/wp-json/sce/v2',
			'gate'        => 'plus_licensed',
			'order'       => 5,
			'previewUrl'  => 'https://premium.pixelgrade.test/pack/preview',
			'image'       => 'https://premium.pixelgrade.test/pack.jpg',
			'badge'       => 'Premium',
			'source'      => 'plus',
		);
		$starters[] = array(
			'id'    => 'main',
			'title' => 'Duplicate main',
			'url'   => 'https://duplicate.example.test/',
		);
		$starters[] = 'not-a-starter';

		return $starters;
	},
	10,
	2
);

$starters = pixassist_get_admin_hub_starters();
assert_same( array( 'premium-pack', 'secondary', 'anima-portfolio', 'main' ), array_column( $starters, 'id' ), 'Starters must include free + injected premium entries, drop malformed entries, dedupe ids, and sort by order.' );

$expected_starter_keys = array( 'applyPlan', 'badge', 'baseRestUrl', 'capabilities', 'description', 'gate', 'id', 'image', 'order', 'previewUrl', 'requiredPlugins', 'role', 'segments', 'source', 'title', 'url' );
foreach ( $starters as $starter ) {
	$keys = array_keys( $starter );
	sort( $keys );
	assert_same( $expected_starter_keys, $keys, 'Each normalized starter must expose exactly the documented item keys.' );
}

$premium = $starters[0];
assert_same( 'plus_licensed', $premium['gate'], 'Injected premium starters must preserve their gate.' );

// Capability-segments: free starters expose exactly the three baseline (free) segments and no commerce.
$main_for_segments = null;
foreach ( $starters as $candidate ) {
	if ( 'main' === $candidate['id'] ) {
		$main_for_segments = $candidate;
	}
}
assert_true( null !== $main_for_segments, 'The main free starter must resolve for the segment check.' );
assert_same( array( 'base', 'look', 'layouts' ), array_column( $main_for_segments['segments'], 'id' ), 'A free starter must expose only the three baseline free segments (no commerce).' );
foreach ( $main_for_segments['segments'] as $segment ) {
	assert_same( true, $segment['available'], 'Free baseline segments must be available.' );
	assert_same( true, $segment['defaultIncluded'], 'Free baseline segments must be included in the default apply plan.' );
}
assert_same( 'plus', $premium['source'], 'Injected premium starters may identify their source.' );
assert_same( 'https://premium.pixelgrade.test/pack/wp-json/sce/v2/', $premium['baseRestUrl'], 'baseRestUrl must be trailingslashed.' );

$secondary = $starters[1];
assert_same( 'Anima LT Demo Content', $secondary['title'], 'Missing starter title must fall back to the active Pixelgrade theme title.' );
assert_same( 'Import the content from the theme demo.', $secondary['description'], 'Missing starter description must fall back to starterContent l10n.' );
assert_same( 'https://demos.pixelgrade.test/secondary/wp-json/sce/v2/', $secondary['baseRestUrl'], 'Missing baseRestUrl must derive from url + defaultSceRestPath.' );
assert_same( '', $secondary['gate'], 'Configured free starters must default to no gate.' );
assert_same( true, $secondary['capabilities']['fullDemo'], 'A starter with a source URL must advertise full-demo availability.' );
assert_same( true, $secondary['capabilities']['recipe'], 'A starter with an SCE REST base must advertise recipe availability.' );
assert_same( array( 'Header', 'Footer', 'Home', 'Archive', 'Single' ), $secondary['capabilities']['layoutGroups'], 'Starter capabilities must expose the broad layout groups available to recipe apply.' );

$portfolio = $starters[2];
assert_same( 'anima-portfolio', $portfolio['id'], 'The portfolio starter must keep its configured id.' );
assert_same( array( 'portfolio' ), $portfolio['capabilities']['features'], 'Meridian/portfolio starters must expose the Portfolio feature opportunity from bootstrap data.' );

$main = $starters[3];
assert_same( 'main', $main['id'], 'Configured associative demo keys must become stable starter ids.' );
assert_same( 'Main demo', $main['title'], 'Configured starter title must be preserved.' );
assert_same( 'https://demos.pixelgrade.test/main/', $main['url'], 'Starter url must be trailingslashed.' );
assert_same( 'full_demo', $main['applyPlan']['primaryAction']['type'], 'Empty sites must default each starter to the full-demo import plan.' );
assert_same( 'Apply full site', $main['applyPlan']['primaryAction']['label'], 'Empty-site full-demo operations must use composer final-action copy.' );
assert_same( array( 'layout_only' ), array_column( $main['applyPlan']['secondaryActions'], 'type' ), 'Empty-site apply plans must expose layout-only as the alternate composer operation.' );

$empty_analysis = pixassist_get_starter_site_analysis();
assert_same( 'empty', $empty_analysis['classification'], 'A site without local content or starter journal must classify as empty.' );
assert_same( true, $empty_analysis['isEmpty'], 'Empty-site analysis must expose isEmpty=true.' );

$GLOBALS['paf_options']['imported_starter_content'] = array(
	'main' => array(
		'pre_settings' => true,
	),
);

$payload = pixassist_get_starter_sites_data();
$keys    = array_keys( $payload );
sort( $keys );
assert_same( array( 'applied', 'copy', 'endpoints', 'imported', 'plus', 'siteAnalysis', 'starters' ), $keys, 'Starter Sites payload must expose starters, site analysis, unified applied state, endpoints, imported, and Plus state.' );
assert_same( 4, count( $payload['starters'] ), 'Payload starters must come from the same normalized free + injected list.' );
assert_same( 'Starter Sites', $payload['copy']['title'], 'Payload copy must include a tab title.' );
assert_same( 'Pick a free starter design, then choose how much of it to apply. (“LT” is our Anima LT theme line — each starter is built on it.)', $payload['copy']['description'], 'Starter Sites description must frame the gallery as a chooser (not a legacy demo-content import) and explain the "LT" lineage naming. Quotes must be curly so esc_html does not emit &quot; into React text.' );

// S6: free starters present under their Pixelgrade LT lineage name (display title only; slug unchanged).
assert_same( 'Hive LT', pixassist_starter_lineage_title( 'anima-blog', 'Field Notes' ), 'anima-blog starter must display as its Hive LT lineage name.' );
assert_same( 'Rosa LT', pixassist_starter_lineage_title( 'anima-restaurant', 'Olive & Ash' ), 'anima-restaurant starter must display as its Rosa LT lineage name.' );
assert_same( 'Mies LT', pixassist_starter_lineage_title( 'anima-portfolio', 'Meridian' ), 'anima-portfolio starter must display as its Mies LT lineage name.' );
assert_same( 'Felt LT', pixassist_starter_lineage_title( 'felt-lt', 'Felt LT' ), 'A starter without a lineage mapping keeps its cloud title.' );
assert_same( 'Anima LT demo content', $payload['copy']['importTitle'], 'Payload copy must preserve the legacy importTitle token replacement.' );
assert_same( 'Successfully applied.', $payload['copy']['success'], 'Starter Sites success copy must use the composer apply language.' );
assert_same( 'Use %s', $payload['copy']['actions']['useStarter'], 'Payload copy must expose the gallery-card primary action template.' );
assert_same( 'Apply full site', $payload['copy']['actions']['applyFullSite'], 'Payload copy must include the empty-site composer final action.' );
assert_same( 'Apply layouts', $payload['copy']['actions']['applyLayouts'], 'Payload copy must include the existing-site composer final action.' );
assert_same( 'Add portfolio', $payload['copy']['actions']['addPortfolio'], 'Payload copy must include the portfolio composer final action.' );
assert_same( 'Cancel', $payload['copy']['actions']['cancel'], 'Payload copy must include a composer cancel action.' );
assert_same( 'Full site', $payload['copy']['composer']['presets']['fullSite'], 'Composer copy must include the Full site preset.' );
assert_same( 'Layouts only', $payload['copy']['composer']['presets']['layoutsOnly'], 'Composer copy must include the Layouts only preset.' );
assert_same( 'Portfolio only', $payload['copy']['composer']['presets']['portfolioOnly'], 'Composer copy must include the Portfolio only preset.' );
assert_same( 'Choose parts', $payload['copy']['composer']['presets']['chooseParts'], 'Composer copy must include the Choose parts preset.' );
assert_same( 'Everything from the starter: content, layouts, menus, and design.', $payload['copy']['composer']['presetDescriptions']['fullSite'], 'Full-site preset copy must explain the import scope.' );
assert_same( 'Keep your content and apply the starter structure.', $payload['copy']['composer']['presetDescriptions']['layoutsOnly'], 'Layouts-only preset copy must explain the safe redesign scope.' );
assert_same( 'Add the portfolio feature and its templates.', $payload['copy']['composer']['presetDescriptions']['portfolioOnly'], 'Portfolio preset copy must explain the feature scope.' );
assert_same( 'Select the exact pieces you want.', $payload['copy']['composer']['presetDescriptions']['chooseParts'], 'Choose-parts preset copy must explain manual selection.' );
assert_true( empty( $payload['copy']['actions']['importExactDemo'] ), 'Starter Sites copy must not expose old exact-demo action copy.' );
assert_same( 'https://example.test/wp-json/pixassist/v1/import', $payload['endpoints']['import']['url'], 'Payload must expose the existing import REST endpoint.' );
assert_same( 'https://example.test/wp-json/pixassist/v1/import_starter', $payload['endpoints']['importStarter']['url'], 'Payload must expose the bulk starter import REST endpoint.' );
assert_same( 'https://example.test/wp-json/pixassist/v1/apply_recipe', $payload['endpoints']['applyRecipe']['url'], 'Payload must expose the recipe apply endpoint for layout-only starter actions.' );
assert_same( 'https://example.test/wp-json/pixassist/v1/import_unit', $payload['endpoints']['importUnit']['url'], 'Payload must expose the layout-unit endpoint for feature starter actions.' );
assert_same( true, $payload['imported']['main']['pre_settings'], 'Payload must include existing starter import state.' );
assert_same( true, $payload['applied']['fullDemos']['main']['pre_settings'], 'Unified applied state must expose imported full demos.' );
assert_same( 'already-imported', $payload['siteAnalysis']['classification'], 'Starter Sites payload must expose already-imported state when the journal exists.' );
assert_same( true, $payload['siteAnalysis']['hasImportedStarterContent'], 'Payload site analysis must expose the starter journal flag.' );
assert_same( false, $payload['plus']['is_plus_licensed'], 'Payload must include the existing four-key Plus status for gated cards.' );

$GLOBALS['paf_post_counts'] = array(
	'post' => array( 'publish' => 4 ),
	'page' => array( 'publish' => 3 ),
);
$GLOBALS['paf_options']['imported_starter_content'] = array();
$GLOBALS['paf_options']['enabled_features']         = array();

$analysis = pixassist_get_starter_site_analysis();
assert_same( 'content-heavy', $analysis['classification'], 'Sites with real pages/posts must classify as content-heavy.' );
assert_same( 7, $analysis['contentCount'], 'Site analysis must count local pages/posts for plan selection.' );
assert_same( false, $analysis['features']['portfolio']['enabled'], 'Site analysis must expose whether the Portfolio feature is already enabled.' );

$content_starers = pixassist_get_admin_hub_starters();
$content_main    = null;
$content_portfolio = null;
foreach ( $content_starers as $starter ) {
	if ( 'main' === $starter['id'] ) {
		$content_main = $starter;
	}
	if ( 'anima-portfolio' === $starter['id'] ) {
		$content_portfolio = $starter;
	}
}
assert_same( 'layout_only', $content_main['applyPlan']['primaryAction']['type'], 'Existing-content sites must default non-feature starters to the layout-only recipe plan.' );
assert_same( 'Apply layouts', $content_main['applyPlan']['primaryAction']['label'], 'Existing-content layout-only plans must use the composer `Apply layouts` final-action label.' );
assert_same( false, $content_main['applyPlan']['primaryAction']['includeLookDefault'], 'Layout-only apply must not import the starter look by default.' );
assert_same( false, $content_main['applyPlan']['primaryAction']['includeSampleDefault'], 'Layout-only apply must not import sample content by default.' );
assert_same( 'feature', $content_portfolio['applyPlan']['primaryAction']['type'], 'Existing sites without Portfolio must surface the portfolio feature path for Meridian.' );
assert_same( 'Add portfolio', $content_portfolio['applyPlan']['primaryAction']['label'], 'Portfolio-capable starters must expose the `Add portfolio` primary action.' );
assert_same( 'portfolio', $content_portfolio['applyPlan']['primaryAction']['unit'], 'The portfolio feature plan must target the Portfolio feature unit.' );
assert_same( 'importUnit', $content_portfolio['applyPlan']['primaryAction']['endpoint'], 'Feature plans must map to the existing importUnit endpoint.' );
assert_true( in_array( 'Portfolio', $content_portfolio['applyPlan']['affectedAreas'], true ), 'Feature plans must show Portfolio in affected areas.' );
assert_same( 'plus_licensed', $premium['gate'], 'Premium gates must remain presentational metadata on the starter.' );
assert_same( 'plus_licensed', $premium['applyPlan']['gate'], 'Premium gates must remain presentational metadata on the apply plan, not server entitlement state.' );
assert_true( ! empty( $premium['applyPlan']['primaryAction'] ), 'A gated starter must still receive an apply plan; gate is not a server-side entitlement reset or blocker.' );

$GLOBALS['paf_options']['enabled_features'] = array( 'portfolio' );
$portfolio_enabled = pixassist_normalize_admin_hub_starter(
	array(
		'id'    => 'anima-portfolio',
		'title' => 'Meridian',
		'url'   => 'https://demos.pixelgrade.test/portfolio',
	),
	'anima-portfolio',
	$GLOBALS['paf_plugin_config']
);
assert_same( 'layout_only', $portfolio_enabled['applyPlan']['primaryAction']['type'], 'Once Portfolio is enabled, Meridian should fall back to the safe layout-only plan on content-heavy sites.' );

$GLOBALS['paf_options']['imported_starter_content'] = array(
	'anima-portfolio' => array(
		'recipe_bundles' => array(
			'recipe:anima-portfolio' => array( 'id' => 'anima-portfolio' ),
		),
	),
);
$imported_analysis = pixassist_get_starter_site_analysis();
assert_same( 'already-imported', $imported_analysis['classification'], 'A site with starter journal state must classify as already imported.' );
assert_same( true, $imported_analysis['hasImportedStarterContent'], 'Already-imported analysis must expose the starter journal flag.' );

/*
 * Dependency gate (data-driven required plugins).
 */

// Free, non-gated starters default to Nova Blocks + Style Manager.
$free_required = $main['requiredPlugins'];
assert_same( array( 'nova-blocks', 'style-manager' ), array_column( $free_required, 'slug' ), 'Free starters must default to requiring Nova Blocks + Style Manager.' );
$required_keys = array_keys( $free_required[0] );
sort( $required_keys );
assert_same( array( 'isActive', 'isInstalled', 'name', 'slug' ), $required_keys, 'Each required-plugin entry must expose slug, name, isInstalled, isActive.' );
assert_same( 'Nova Blocks', $free_required[0]['name'], 'Required-plugin name must be preserved/humanized.' );

// With no plugins installed, both required plugins report inactive (the gate would block).
assert_same( false, $free_required[0]['isActive'], 'With no plugins installed, a required plugin must report inactive.' );
assert_same( false, $free_required[0]['isInstalled'], 'With no plugins installed, a required plugin must report not installed.' );

// Gated (premium) starters do NOT inherit the free default dependency set.
assert_same( array(), $premium['requiredPlugins'], 'Gated/premium starters must not inherit the free default required plugins.' );

// Status reflects the installed/active plugin set (slug -> folder match, regardless of main file name).
$GLOBALS['paf_installed_plugins'] = array(
	'nova-blocks/nova-blocks.php' => true,   // active
	'style-manager/style-manager.php' => false, // installed, inactive
);
$starters_after = pixassist_get_admin_hub_starters();
$main_after     = null;
foreach ( $starters_after as $s ) {
	if ( 'main' === $s['id'] ) {
		$main_after = $s;
	}
}
assert_true( null !== $main_after, 'The main starter must still resolve after toggling plugin status.' );
$by_slug = array();
foreach ( $main_after['requiredPlugins'] as $rp ) {
	$by_slug[ $rp['slug'] ] = $rp;
}
assert_same( true, $by_slug['nova-blocks']['isActive'], 'An active required plugin must report isActive=true (matched by folder slug).' );
assert_same( true, $by_slug['nova-blocks']['isInstalled'], 'An active required plugin must report isInstalled=true.' );
assert_same( false, $by_slug['style-manager']['isActive'], 'An installed-but-inactive required plugin must report isActive=false.' );
assert_same( true, $by_slug['style-manager']['isInstalled'], 'An installed-but-inactive required plugin must report isInstalled=true.' );

// A descriptor-declared requiredPlugins set overrides the default, and accepts bare slug strings.
$GLOBALS['paf_filters'] = array();
$GLOBALS['paf_installed_plugins'] = array();
add_filter(
	'pixelgrade/admin_hub/starters',
	function ( $starters ) {
		$starters['declares-deps'] = array(
			'title'           => 'Declares deps',
			'url'             => 'https://demos.pixelgrade.test/declares/',
			'requiredPlugins' => array(
				array( 'slug' => 'woocommerce', 'name' => 'WooCommerce' ),
				'jetpack', // bare slug string
			),
		);

		return $starters;
	},
	10,
	2
);
$declared = null;
foreach ( pixassist_get_admin_hub_starters() as $s ) {
	if ( 'declares-deps' === $s['id'] ) {
		$declared = $s;
	}
}
assert_true( null !== $declared, 'A starter that declares requiredPlugins must resolve.' );
assert_same( array( 'woocommerce', 'jetpack' ), array_column( $declared['requiredPlugins'], 'slug' ), 'A starter-declared requiredPlugins set must override the default and accept bare slug strings.' );
assert_same( 'Jetpack', $declared['requiredPlugins'][1]['name'], 'A bare-slug required plugin must humanize its name.' );

// The Starter Sites copy exposes the dependency-gate strings and the Plugins-tab deep link.
$gate_copy = $payload['copy'];
assert_true( isset( $gate_copy['requirements']['message'] ), 'Starter Sites copy must include the requirements message.' );
assert_true( false !== strpos( $gate_copy['requirements']['message'], '%s' ), 'The requirements message must carry a %s placeholder for the plugin names.' );
assert_same( 'https://example.test/wp-admin/themes.php?page=pixelgrade&tab=plugins', $gate_copy['pluginsTabUrl'], 'Starter Sites copy must deep-link to the Plugins tab.' );
assert_true( isset( $gate_copy['actions']['managePlugins'] ), 'Starter Sites copy must include the managePlugins action label.' );

$starter_sites_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/StarterSites.js' );
assert_true( false !== strpos( $starter_sites_js, 'applyPlan' ), 'Starter Sites JS must render from the server-generated apply plan.' );
assert_true( false !== strpos( $starter_sites_js, 'applyRecipe' ), 'Starter Sites JS must keep the recipe endpoint available for server-generated actions.' );
assert_true( false !== strpos( $starter_sites_js, 'importUnit' ), 'Starter Sites JS must call the layout-unit endpoint for feature actions.' );
assert_true( false !== strpos( $starter_sites_js, 'include_look' ), 'Starter Sites JS must pass the include-look decision to recipe apply.' );
assert_true( false !== strpos( $starter_sites_js, 'include_sample' ), 'Starter Sites JS must pass the include-sample decision to recipe/feature apply.' );
assert_true( false !== strpos( $starter_sites_js, 'unit_type' ), 'Starter Sites JS must map feature actions to unit_type/unit REST params.' );
assert_true( false !== strpos( $starter_sites_js, 'activeStarterId' ), 'Starter Sites JS must keep a dedicated starter composer state.' );
assert_true( false !== strpos( $starter_sites_js, 'buildComposerPresets' ), 'Starter Sites JS must derive composer preset controls.' );
assert_true( false !== strpos( $starter_sites_js, 'getComposerParts' ), 'Starter Sites JS must derive grouped include checkboxes.' );
assert_true( false !== strpos( $starter_sites_js, 'applyComposerSelection' ), 'Starter Sites JS must translate composer selections into existing operations.' );
assert_true( false !== strpos( $starter_sites_js, 'startStarterProgressHeartbeat' ), 'Starter Sites JS must keep hub progress alive with a heartbeat while background work is quiet.' );
assert_true( false !== strpos( $starter_sites_js, 'More than 3 seconds without progress should never feel idle.' ), 'Starter Sites heartbeat behavior must be documented at the implementation point.' );
assert_true( false !== strpos( $starter_sites_js, 'progress__bar' ), 'Starter Sites JS must render a determinate progress track in the hub composer.' );
assert_true( false !== strpos( $starter_sites_js, 'Downloading media' ), 'Starter Sites full-demo imports must expose media download feedback.' );
assert_true( false !== strpos( $starter_sites_js, 'Uploading media' ), 'Starter Sites full-demo imports must expose media upload feedback.' );
assert_true( false === strpos( $starter_sites_js, "restRequest( data, 'importStarter'" ), 'Starter Sites full-demo imports must not use the opaque one-request endpoint because it hides granular progress.' );
assert_true( false !== strpos( $starter_sites_js, 'buildLayoutUnitOperations' ), 'Starter Sites JS must expand layout selections into per-layout operations for granular progress.' );
assert_true( false !== strpos( $starter_sites_js, "return buildLayoutUnitOperations( getAvailableLayoutIds( starter ), copy );" ), 'The Layouts only preset must apply each available layout as its own progress step.' );
assert_true( false === strpos( $starter_sites_js, "operations.push( { type: 'layout_only'" ), 'Choose parts must not collapse all selected layouts into one opaque layout-only operation.' );
assert_true( false !== strpos( $starter_sites_js, 'combineStarterProgressGroups' ), 'Choose parts must preserve per-layout phase totals when selected content expands into manifest-derived steps.' );
assert_true( false !== strpos( $starter_sites_js, 'progressTotalBase' ), 'Choose parts must preserve already-known layout steps in the overall progress total.' );
assert_true( false !== strpos( $starter_sites_js, 'starterHasAppliedLayoutUnits' ), 'Starter Sites JS must still show Layouts applied after per-unit layout applies.' );
assert_true( false !== strpos( $starter_sites_js, "allowCodes: [ 'unit_not_found' ]" ), 'Starter Sites JS must skip missing source layout units without aborting the whole layout apply.' );
assert_true( false !== strpos( $starter_sites_js, 'included in this starter' ), 'Starter Sites JS must log skipped layout-unit steps as visible progress (neutral "<part> isn\'t included in this starter — skipped." info log, not an alarm).' );
assert_true( false !== strpos( $starter_sites_js, 'heartbeatTick' ), 'Starter Sites progress must visibly tick while waiting for long network requests.' );
assert_true( false !== strpos( $starter_sites_js, '( message, options = {} ) => {' ), 'Starter Sites apply progress callback must receive advance/log options from granular import tasks.' );
assert_true( false !== strpos( $starter_sites_js, '}, options );' ), 'Starter Sites apply progress callback must pass advance/log options through to the progress state.' );
assert_true( false !== strpos( $starter_sites_js, 'STARTER_PROGRESS_PHASES' ), 'Starter Sites progress must render the redesigned five-phase timeline.' );
assert_true( false !== strpos( $starter_sites_js, 'Getting things ready' ), 'Starter Sites progress must use friendly phase wording for preparation.' );
assert_true( false !== strpos( $starter_sites_js, 'Bringing in your images' ), 'Starter Sites progress must use friendly phase wording for media.' );
assert_true( false !== strpos( $starter_sites_js, 'Adding your pages and posts' ), 'Starter Sites progress must use friendly phase wording for content.' );
assert_true( false !== strpos( $starter_sites_js, 'Styling your site' ), 'Starter Sites progress must use friendly phase wording for design.' );
assert_true( false !== strpos( $starter_sites_js, 'Wrapping up' ), 'Starter Sites progress must use friendly phase wording for finalization.' );
assert_true( false !== strpos( $starter_sites_js, 'progress__timeline' ), 'Starter Sites progress must render a vertical timeline, not only a bar.' );
assert_true( false !== strpos( $starter_sites_js, 'progress__stage-dot' ), 'Starter Sites progress timeline must render status dots for every phase.' );
assert_true( false !== strpos( $starter_sites_js, 'getStarterProgressPhaseState' ), 'Starter Sites progress must compute per-phase counts and statuses.' );
assert_true( false !== strpos( $starter_sites_js, "phase.total > 0 || 'active' === phase.status" ), 'Starter Sites progress timeline must hide phases that have no work in partial applies.' );
assert_true( false !== strpos( $starter_sites_js, 'All done — your site is ready.' ), 'Starter Sites progress completion copy must be friendly and plain-language.' );
assert_true( false !== strpos( $starter_sites_js, 'Last completed' ), 'Starter Sites progress must show the last completed items.' );
assert_true( false !== strpos( $starter_sites_js, 'progress__warning' ), 'Starter Sites progress must persist non-fatal warnings inline.' );
assert_same( 2, substr_count( $starter_sites_js, 'renderProgressWarnings( state.warnings )' ), 'Starter Sites progress warnings must stay visible while working and after completion.' );
assert_true( false !== strpos( $starter_sites_js, 'aria-valuetext' ), 'Starter Sites progressbar must expose accessible phase progress text.' );
assert_true( false !== strpos( $starter_sites_js, 'scrollStarterProgressIntoView' ), 'Starter Sites progress must auto-scroll into view when applying starts.' );
assert_true( false !== strpos( $starter_sites_js, 'data-starter-progress-id' ), 'Starter Sites progress must expose a scoped progress target for auto-scroll.' );
assert_true( false !== strpos( $starter_sites_js, 'prefers-reduced-motion: reduce' ), 'Starter Sites progress auto-scroll must respect reduced motion preferences.' );
assert_true( false !== strpos( $starter_sites_js, 'disabled: ! canApply' ), 'Starter Sites Cancel must remain available while an apply is running.' );
assert_true( false !== strpos( $starter_sites_js, 'Back to Starter Sites' ), 'Starter Sites JS must render a clear back control for the composer view.' );
assert_true( false !== strpos( $starter_sites_js, 'Choose parts' ), 'Starter Sites JS must render the manual parts preset.' );
assert_true( false !== strpos( $starter_sites_js, 'Portfolio only' ), 'Starter Sites JS must render the portfolio preset when supported.' );
assert_true( false === strpos( $starter_sites_js, 'selectedPanelStarterId' ), 'Starter Sites JS must remove the inline card customization panel state.' );
assert_true( false === strpos( $starter_sites_js, 'renderApplyPanel' ), 'Starter Sites JS must remove inline apply panels from starter cards.' );
assert_true( false === strpos( $starter_sites_js, 'Import exact demo' ), 'Starter Sites JS must replace exact-demo copy in this flow.' );
assert_true( false === strpos( $starter_sites_js, 'isDestructive' ), 'Starter Sites JS must not render import actions with destructive styling.' );

/*
 * Active full-site starter: "Full site applied" is singular — the starter currently applied as the
 * live full site — NOT every starter in the cumulative import journal (which backs the reset feature).
 */
assert_true( function_exists( 'pixassist_get_starter_sites_active_starter' ), 'The active-starter accessor must be defined.' );

// Nothing imported, no marker -> nothing is active.
$GLOBALS['paf_options'] = array();
assert_same( '', pixassist_get_starter_sites_active_starter(), 'With nothing imported, no starter is active.' );

// The persisted marker is authoritative even when several starters are in the journal.
$GLOBALS['paf_options']['imported_starter_content'] = array(
	'anima-blog' => array( 'post_types' => array() ),
	'felt-lt'    => array( 'post_types' => array() ),
);
$GLOBALS['paf_options']['active_starter'] = 'anima-blog';
assert_same( 'anima-blog', pixassist_get_starter_sites_active_starter(), 'The persisted active_starter marker is authoritative.' );

// Fallback (no marker): the most-recently-recorded full-demo journal entry.
$GLOBALS['paf_options']['active_starter'] = '';
assert_same( 'felt-lt', pixassist_get_starter_sites_active_starter(), 'Without a marker, the last full-demo journal entry is treated as active.' );

// Fallback must ignore layouts-only journals (never a false "Full site applied").
$GLOBALS['paf_options']['imported_starter_content'] = array(
	'anima-blog' => array( 'layout_units' => array( 'header' ), 'recipe_bundles' => array( 'recipe' ) ),
);
assert_same( '', pixassist_get_starter_sites_active_starter(), 'A layouts-only journal must NOT mark a starter as the live full site.' );

// Applied state exposes activeStarter for the JS chip.
$GLOBALS['paf_options'] = array(
	'active_starter'           => 'anima-portfolio',
	'imported_starter_content' => array( 'anima-portfolio' => array( 'post_types' => array() ) ),
);
$applied_state = pixassist_get_starter_sites_applied_state();
assert_true( array_key_exists( 'activeStarter', $applied_state ), 'Applied state must expose activeStarter to JS.' );
assert_same( 'anima-portfolio', $applied_state['activeStarter'], 'Applied state activeStarter must reflect the active full-site starter.' );

// The JS gates "Full site applied" on the server-tracked activeStarter, not the cumulative journal.
assert_true( false !== strpos( $starter_sites_js, 'applied.activeStarter' ), 'Starter Sites JS must gate the full-site status on the active starter.' );
// normalizeApplied() must preserve activeStarter, or the gated chip would never have its value.
assert_true( false !== strpos( $starter_sites_js, 'activeStarter: applied.activeStarter' ), 'Starter Sites JS must preserve activeStarter through normalizeApplied.' );

echo "Admin Starter Sites tab OK\n";
