<?php
/**
 * Pins the Pixelgrade Design preflight / readiness model behind the Setup tab.
 *
 * The Setup tab (route/component id `plugins`) is a readiness screen: includes/setup-readiness.php
 * classifies a compact set of checks (active theme, plugin coexistence, recommended plugins,
 * companion version ranges, PHP / WordPress / memory) into an overall Ready / Needs attention /
 * Blocked state. The React tab is presentational; this test pins the PURE classification + builder
 * logic so the copy and severity rules have a single, testable source of truth.
 *
 * Standalone: run with `php tests/setup-readiness-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();

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

function esc_html__( $text, $domain = 'default' ) {
	return $text;
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

$module = __DIR__ . '/../includes/setup-readiness.php';
assert_true( file_exists( $module ), 'The readiness module must exist at includes/setup-readiness.php.' );
require $module;

/*
 * ---------------------------------------------------------------------------
 * Threshold helpers — version + bytes classification.
 * ---------------------------------------------------------------------------
 */

assert_same( 'blocked', pixassist_setup_version_status( '5.6', '7.0', '7.4' ), 'Below the minimum version must block.' );
assert_same( 'warning', pixassist_setup_version_status( '7.2', '7.0', '7.4' ), 'At/above minimum but below recommended must warn.' );
assert_same( 'ok', pixassist_setup_version_status( '8.2', '7.0', '7.4' ), 'At/above recommended must be ok.' );
assert_same( 'ok', pixassist_setup_version_status( '', '7.0', '7.4' ), 'An unknown current version must never invent a blocker.' );

$mb = 1024 * 1024;
assert_same( 'blocked', pixassist_setup_bytes_status( 32 * $mb, 64 * $mb, 128 * $mb ), 'Memory below the minimum must block.' );
assert_same( 'warning', pixassist_setup_bytes_status( 96 * $mb, 64 * $mb, 128 * $mb ), 'Memory below recommended must warn.' );
assert_same( 'ok', pixassist_setup_bytes_status( 256 * $mb, 64 * $mb, 128 * $mb ), 'Ample memory must be ok.' );
assert_same( 'ok', pixassist_setup_bytes_status( -1, 64 * $mb, 128 * $mb ), 'Unlimited/unknown memory must not be a false alarm.' );

assert_same( '256 MB', pixassist_setup_format_bytes( 256 * $mb ), 'Whole MB values must format cleanly.' );
assert_same( '', pixassist_setup_format_bytes( 0 ), 'Non-positive byte values format to empty.' );

/*
 * ---------------------------------------------------------------------------
 * Recommended-plugins check.
 * ---------------------------------------------------------------------------
 */

$required_missing = pixassist_build_setup_plugins_check( array(
	array( 'name' => 'Style Manager', 'status' => 'missing', 'required' => true ),
	array( 'name' => 'Nova Blocks', 'status' => 'active', 'required' => false ),
) );
assert_same( 'blocked', $required_missing['status'], 'A missing REQUIRED plugin must block readiness.' );
assert_same( 'plugins', $required_missing['id'], 'The plugins check id must be `plugins`.' );
assert_same( null, $required_missing['action'], 'The plugins check has no action URL (the actionable list renders below).' );
assert_same( 1, count( $required_missing['items'] ), 'Only the plugin needing attention is listed.' );
assert_same( 'Style Manager', $required_missing['items'][0]['name'], 'The blocking plugin must be named in items.' );

$optional_missing = pixassist_build_setup_plugins_check( array(
	array( 'name' => 'Style Manager', 'status' => 'active', 'required' => true ),
	array( 'name' => 'Nova Blocks', 'status' => 'inactive', 'required' => false ),
) );
assert_same( 'warning', $optional_missing['status'], 'A missing RECOMMENDED plugin warns but does not block.' );

$outdated = pixassist_build_setup_plugins_check( array(
	array( 'name' => 'Style Manager', 'status' => 'outdated', 'required' => true ),
) );
assert_same( 'warning', $outdated['status'], 'An outdated plugin warns.' );

$all_good = pixassist_build_setup_plugins_check( array(
	array( 'name' => 'Style Manager', 'status' => 'active', 'required' => true ),
	array( 'name' => 'Nova Blocks', 'status' => 'active', 'required' => false ),
) );
assert_same( 'ok', $all_good['status'], 'All active + up to date is ready.' );
assert_same( 0, count( $all_good['items'] ), 'A ready plugins check lists nothing needing attention.' );

$empty = pixassist_build_setup_plugins_check( array() );
assert_same( 'ok', $empty['status'], 'No recommended plugins is a deliberate ready state, not a failure.' );

/*
 * ---------------------------------------------------------------------------
 * Companion version-range check.
 * ---------------------------------------------------------------------------
 */

assert_same( null, pixassist_build_setup_companions_check( array() ), 'No declared ranges => the companions check is omitted.' );
assert_same(
	null,
	pixassist_build_setup_companions_check( array(
		array( 'label' => 'Nova Blocks', 'range' => '^2.0', 'installed' => false, 'satisfies' => null ),
	) ),
	'A not-installed companion is omitted (covered by the plugins check).'
);

$in_range = pixassist_build_setup_companions_check( array(
	array( 'label' => 'Style Manager', 'range' => '^2.0', 'version' => '2.1.0', 'installed' => true, 'satisfies' => true ),
) );
assert_same( 'ok', $in_range['status'], 'An in-range companion is ready.' );

$out_of_range = pixassist_build_setup_companions_check( array(
	array( 'label' => 'Nova Blocks', 'range' => '>2.0 <3.0', 'version' => '3.4.0', 'installed' => true, 'satisfies' => false ),
	array( 'label' => 'Style Manager', 'range' => '^2.0', 'version' => '2.1.0', 'installed' => true, 'satisfies' => true ),
) );
assert_same( 'warning', $out_of_range['status'], 'An out-of-range companion warns.' );
assert_same( 2, count( $out_of_range['items'] ), 'Both installed companions are listed for context.' );

$undetermined = pixassist_build_setup_companions_check( array(
	array( 'label' => 'Nova Blocks', 'range' => '^2.0', 'version' => '2.1.0', 'installed' => true, 'satisfies' => null ),
) );
assert_same( 'ok', $undetermined['status'], 'An undetermined (null) satisfies is informational, not a warning.' );

/*
 * ---------------------------------------------------------------------------
 * Full check builder + overall classification.
 * ---------------------------------------------------------------------------
 */

$thresholds = array(
	'php'    => array( 'minimum' => '7.0', 'recommended' => '7.4' ),
	'wp'     => array( 'minimum' => '5.9', 'recommended' => '6.0' ),
	'memory' => array( 'minimum' => 64 * $mb, 'recommended' => 128 * $mb ),
);

$ready_facts = array(
	'php_version'        => '8.2.0',
	'wp_version'         => '6.5',
	'memory_limit_bytes' => 256 * $mb,
	'is_care_active'     => false,
	'theme'              => array( 'name' => 'Anima', 'version' => '2.0.18', 'is_pixelgrade' => true, 'is_block' => true ),
	'plugins'            => array(
		array( 'name' => 'Style Manager', 'status' => 'active', 'required' => true ),
	),
	'companions'         => array(),
	'thresholds'         => $thresholds,
	'actions'            => array(
		'php' => array( 'label' => 'How to update PHP', 'url' => 'https://example.test/php' ),
		'wp'  => array( 'label' => 'Update WordPress', 'url' => 'https://example.test/wp' ),
	),
);

$ready_checks = pixassist_build_setup_checks( $ready_facts );
$ids          = array_column( $ready_checks, 'id' );
assert_same( array( 'theme', 'care', 'plugins', 'php', 'wp', 'memory' ), $ids, 'A no-companion build yields the core six checks in order.' );

$ready_overall = pixassist_classify_setup_overall( $ready_checks );
assert_same( 'ready', $ready_overall['status'], 'All-good facts classify as ready.' );
assert_same( 'Pixelgrade Design is ready on this site', $ready_overall['title'], 'The ready headline must affirm the site is ready for Pixelgrade Design.' );
assert_same( 0, $ready_overall['counts']['warning'], 'A ready site has no warnings.' );
assert_same( 0, $ready_overall['counts']['blocked'], 'A ready site has no blockers.' );

// Theme/PHP checks must not carry an action when ok.
$theme_check = $ready_checks[0];
assert_same( 'theme', $theme_check['id'], 'First check is the active theme.' );
assert_same( 'ok', $theme_check['status'], 'A Pixelgrade theme is ok.' );
assert_same( null, $theme_check['action'], 'A passing theme check carries no action.' );
assert_same( 'Anima 2.0.18', $theme_check['value'], 'The theme value shows name + version.' );

// Now a mix that warns (old PHP) and one that blocks (not a Pixelgrade theme + Care active).
$attention_facts                = $ready_facts;
$attention_facts['php_version'] = '7.2.0';
$attention_checks               = pixassist_build_setup_checks( $attention_facts );
$attention_overall              = pixassist_classify_setup_overall( $attention_checks );
assert_same( 'attention', $attention_overall['status'], 'A warning with no blocker classifies as attention.' );
$php_check = $attention_checks[ array_search( 'php', array_column( $attention_checks, 'id' ), true ) ];
assert_same( 'warning', $php_check['status'], 'PHP 7.2 against a 7.4 recommendation warns.' );
assert_true( is_array( $php_check['action'] ) && ! empty( $php_check['action']['url'] ), 'A warning PHP check must surface its next action.' );

$blocked_facts                   = $ready_facts;
$blocked_facts['is_care_active'] = true;
$blocked_facts['theme']          = array( 'name' => 'Twenty Twenty-Four', 'version' => '1.0', 'is_pixelgrade' => false, 'is_block' => true );
$blocked_checks                  = pixassist_build_setup_checks( $blocked_facts );
$blocked_overall                 = pixassist_classify_setup_overall( $blocked_checks );
assert_same( 'blocked', $blocked_overall['status'], 'Any blocker dominates the overall state.' );
assert_same( 'Setup needs attention before you start', $blocked_overall['title'], 'The blocked headline must read as a pre-start gate.' );
assert_true( $blocked_overall['counts']['blocked'] >= 2, 'Care-active + non-Pixelgrade theme are two blockers.' );

$care_check = $blocked_checks[ array_search( 'care', array_column( $blocked_checks, 'id' ), true ) ];
assert_same( 'blocked', $care_check['status'], 'Pixelgrade Care active blocks readiness.' );

// Companions appear only when present in facts.
$with_companions = $ready_facts;
$with_companions['companions'] = array(
	array( 'label' => 'Nova Blocks', 'range' => '^2.0', 'version' => '2.1.0', 'installed' => true, 'satisfies' => true ),
);
$companion_checks = pixassist_build_setup_checks( $with_companions );
assert_true( in_array( 'companions', array_column( $companion_checks, 'id' ), true ), 'A declared companion range adds the companions check.' );

/*
 * ---------------------------------------------------------------------------
 * Environment summary (the at-a-glance facts panel).
 * ---------------------------------------------------------------------------
 */

$summary = pixassist_get_setup_environment_summary( array(
	'php_version'        => '8.2.0',
	'wp_version'         => '6.5',
	'db_version'         => '8.0.32',
	'memory_limit_bytes' => 256 * $mb,
	'max_execution_time' => '30',
	'upload_max_bytes'   => 64 * $mb,
) );
$summary_labels = array_column( $summary, 'label' );
assert_true( in_array( 'PHP', $summary_labels, true ), 'The environment summary lists PHP.' );
assert_true( in_array( 'WordPress', $summary_labels, true ), 'The environment summary lists WordPress.' );
assert_true( in_array( 'Database', $summary_labels, true ), 'The environment summary lists the database version.' );
assert_true( in_array( 'Memory limit', $summary_labels, true ), 'The environment summary lists the memory limit.' );

/*
 * ---------------------------------------------------------------------------
 * Supports-header parser (companion ranges come from the theme header).
 * ---------------------------------------------------------------------------
 */

$parsed = pixassist_parse_setup_supports_header( 'Nova Blocks (>2.0 <3.0), Style Manager (^2.0)' );
assert_same( '>2.0 <3.0', $parsed['Nova Blocks'], 'The supports header parser extracts the Nova Blocks range.' );
assert_same( '^2.0', $parsed['Style Manager'], 'The supports header parser extracts the Style Manager range.' );
assert_same( array(), pixassist_parse_setup_supports_header( '' ), 'An empty header parses to nothing.' );

/*
 * ---------------------------------------------------------------------------
 * React tab consumes the readiness payload.
 * ---------------------------------------------------------------------------
 */

$plugins_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/Plugins.js' );
assert_true( false !== strpos( $plugins_js, 'data.readiness' ), 'The Setup React tab must read the readiness payload.' );
assert_true( false !== strpos( $plugins_js, 'renderOverallCard' ), 'The Setup React tab must render the overall readiness card.' );
assert_true( false !== strpos( $plugins_js, 'renderEnvironmentSummary' ), 'The Setup React tab must render the environment summary linking to System Status.' );

echo "Setup readiness OK\n";
