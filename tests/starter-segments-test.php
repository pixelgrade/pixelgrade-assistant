<?php
/**
 * Pins the starter capability-segment contract: free baseline segments, the gated commerce segment,
 * server-authoritative availability, intrinsic import enforcement, and the secret-free JS whitelist.
 *
 * Product statement under test: "Starter sites are free to browse and apply in their free form;
 * Plus unlocks specific pro capabilities such as WooCommerce integration."
 *
 * Standalone: run with `php tests/starter-segments-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']           = array();
$GLOBALS['paf_plugin_config']     = array();
$GLOBALS['paf_options']           = array();
$GLOBALS['paf_post_counts']       = array();
$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();

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

function admin_url( $path = '' ) {
	return 'https://example.test/wp-admin/' . ltrim( (string) $path, '/' );
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
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

function post_type_exists( $post_type ) {
	return in_array( $post_type, array( 'post', 'page', 'portfolio' ), true );
}

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

class WP_Error {
	public $code;
	public $message;
	public $data;

	public function __construct( $code = '', $message = '', $data = '' ) {
		$this->code    = $code;
		$this->message = $message;
		$this->data    = $data;
	}

	public function get_error_code() {
		return $this->code;
	}

	public function get_error_message() {
		return $this->message;
	}

	public function get_error_data() {
		return $this->data;
	}
}

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
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

class PixelgradeAssistant_Admin {
	public static function get_config() {
		return $GLOBALS['paf_plugin_config'];
	}

	public static function get_option( $key, $default = null ) {
		return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
	}

	public static function get_theme_support() {
		return array(
			'theme_name'  => 'anima-lt',
			'theme_title' => 'Anima LT',
		);
	}
}

// Loading admin-starter-sites.php transitively loads the segment module.
require __DIR__ . '/../includes/admin-starter-sites.php';

assert_true( function_exists( 'pixassist_get_starter_segment_definitions' ), 'The canonical segment-definition accessor must be defined.' );
assert_true( function_exists( 'pixassist_get_starter_segments' ), 'The per-starter segment accessor must be defined.' );
assert_true( function_exists( 'pixassist_starter_classify_import' ), 'The intrinsic import classifier must be defined.' );
assert_true( function_exists( 'pixassist_starter_authorize_import' ), 'The server-side import authorizer must be defined.' );

/*
 * 1. Canonical segment definitions.
 */
$defs = pixassist_get_starter_segment_definitions();
assert_true( isset( $defs['base'], $defs['look'], $defs['layouts'], $defs['commerce'] ), 'The canonical definitions must include base, look, layouts, and commerce segments.' );
assert_same( true, $defs['base']['defaultIncluded'], 'The base/editorial segment must be included in the default free import.' );
assert_same( true, $defs['look']['defaultIncluded'], 'The look/design segment must be included by default.' );
assert_same( true, $defs['layouts']['defaultIncluded'], 'The layouts segment must be included by default.' );
assert_same( false, $defs['commerce']['defaultIncluded'], 'Commerce must be excluded from the default/free import.' );
assert_same( array( 'woocommerce_integration' ), $defs['commerce']['requiredEntitlements'], 'Commerce must require the explicit woocommerce_integration capability (not PRO_STARTER_SITES).' );
assert_same( 'woocommerce', $defs['commerce']['requiredPlugins'][0]['slug'], 'Commerce must require the WooCommerce plugin.' );
assert_same( 'plus', $defs['commerce']['gate'], 'Commerce carries a presentational plus gate hint.' );

/*
 * 2. A free starter (no commerce) exposes exactly the three baseline segments, all available.
 */
$free_segments = pixassist_get_starter_segments(
	array(
		'id'    => 'anima-blog',
		'title' => 'Hive',
	),
	array( 'id' => 'anima-blog' )
);
assert_same( array( 'base', 'look', 'layouts' ), array_column( $free_segments, 'id' ), 'A free starter exposes exactly the three baseline segments.' );
foreach ( $free_segments as $segment ) {
	assert_same( true, $segment['available'], 'Baseline free segments must be available.' );
	assert_same( 'available', $segment['availability'], 'Baseline free segments must report available.' );
}

/*
 * 3. A commerce starter remains visible/free, but its commerce segment reports
 *    requires_plugins when WooCommerce is absent (unlicensed).
 */
$GLOBALS['paf_plugin_config'] = array(
	'starterContent' => array(
		'defaultSceRestPath' => 'wp-json/sce/v2',
		'demos'              => array(),
	),
);
$GLOBALS['paf_options']['imported_starter_content'] = array();
$GLOBALS['paf_options']['enabled_features']         = array();
$GLOBALS['paf_installed_plugins']                   = array();
$GLOBALS['paf_entitlements']                        = array();

// Plus answers the shared, absence-safe entitlement bridge filter (this stands in for Plus).
add_filter(
	'pixelgrade/has_entitlement',
	function ( $granted, $entitlement = '' ) {
		if ( is_string( $entitlement ) && '' !== $entitlement && ! empty( $GLOBALS['paf_entitlements'][ $entitlement ] ) ) {
			return true;
		}

		return (bool) $granted;
	},
	10,
	2
);

$felt_descriptor = array(
	'id'       => 'felt-lt',
	'title'    => 'Felt LT',
	'url'      => 'https://demos.pixelgrade.test/felt',
	'commerce' => true,
);

$felt = pixassist_normalize_admin_hub_starter( $felt_descriptor, 'felt-lt', $GLOBALS['paf_plugin_config'] );
assert_same( '', $felt['gate'], 'A starter with a gated commerce segment is NOT a premium object - its card stays free/visible.' );
assert_true( isset( $felt['segments'] ) && is_array( $felt['segments'] ), 'A normalized starter must expose its segments.' );

$felt_commerce = null;
foreach ( $felt['segments'] as $segment ) {
	if ( 'commerce' === $segment['id'] ) {
		$felt_commerce = $segment;
	}
}
assert_true( null !== $felt_commerce, 'A commerce starter must expose a commerce segment.' );
assert_same( false, $felt_commerce['defaultIncluded'], 'The commerce segment must be excluded from the default apply plan.' );
assert_same( 'requires_plugins', $felt_commerce['availability'], 'With WooCommerce absent, commerce must report requires_plugins.' );
assert_same( false, $felt_commerce['available'], 'With WooCommerce absent, commerce must not be available.' );

// The exact, secret-free key whitelist of a normalized segment.
$segment_keys = array_keys( $felt_commerce );
sort( $segment_keys );
assert_same(
	array( 'affectedAreas', 'availability', 'availabilityReason', 'available', 'defaultIncluded', 'description', 'gate', 'id', 'label', 'requiredCapabilities', 'requiredEntitlements', 'requiredPlugins' ),
	$segment_keys,
	'Each normalized segment must expose exactly the documented secret-free keys.'
);

/*
 * 4. WooCommerce active but Plus capability absent -> requires_entitlement.
 */
$GLOBALS['paf_installed_plugins'] = array( 'woocommerce/woocommerce.php' => true );
$GLOBALS['paf_entitlements']      = array();

$felt = pixassist_normalize_admin_hub_starter( $felt_descriptor, 'felt-lt', $GLOBALS['paf_plugin_config'] );
$felt_commerce = null;
foreach ( $felt['segments'] as $segment ) {
	if ( 'commerce' === $segment['id'] ) {
		$felt_commerce = $segment;
	}
}
assert_same( true, $felt_commerce['requiredPlugins'][0]['isActive'], 'With WooCommerce active, the required-plugin status must reflect it.' );
assert_same( 'requires_entitlement', $felt_commerce['availability'], 'WooCommerce active but no Plus capability must report requires_entitlement.' );
assert_same( false, $felt_commerce['available'], 'WooCommerce active but no Plus capability must keep commerce unavailable.' );

/*
 * 5. WooCommerce active + Plus capability present -> available.
 */
$GLOBALS['paf_entitlements'] = array( 'woocommerce_integration' => true );

$felt = pixassist_normalize_admin_hub_starter( $felt_descriptor, 'felt-lt', $GLOBALS['paf_plugin_config'] );
$felt_commerce = null;
foreach ( $felt['segments'] as $segment ) {
	if ( 'commerce' === $segment['id'] ) {
		$felt_commerce = $segment;
	}
}
assert_same( 'available', $felt_commerce['availability'], 'WooCommerce active + Plus capability present must report available.' );
assert_same( true, $felt_commerce['available'], 'WooCommerce active + Plus capability present must make commerce available.' );

/*
 * 6. Server-side enforcement: intrinsic content classification + authorization.
 *    UI disabling is not enough; the server must reject unauthorized gated content even if mislabeled.
 */
assert_same( 'commerce', pixassist_starter_classify_import( 'post_type', array( 'post_type' => 'product' ) ), 'Product posts classify as commerce.' );
assert_same( 'commerce', pixassist_starter_classify_import( 'post_type', array( 'post_type' => 'product_variation' ) ), 'Product variations classify as commerce.' );
assert_same( 'commerce', pixassist_starter_classify_import( 'taxonomy', array( 'tax' => 'product_cat' ) ), 'Product categories classify as commerce.' );
assert_same( 'commerce', pixassist_starter_classify_import( 'pre_settings', array( 'data' => array( 'woocommerce_store_address' => '1 Main St' ) ) ), 'WooCommerce settings classify as commerce.' );
assert_same( 'base', pixassist_starter_classify_import( 'post_type', array( 'post_type' => 'page' ) ), 'Pages classify as base/editorial.' );
assert_same( 'base', pixassist_starter_classify_import( 'pre_settings', array( 'data' => array( 'blogname' => 'Felt' ) ) ), 'Generic settings classify as base.' );

// Unauthorized (no WooCommerce, no entitlement) -> commerce import rejected.
$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();

$blocked = pixassist_starter_authorize_import( 'post_type', array( 'post_type' => 'product' ) );
assert_true( is_wp_error( $blocked ), 'Commerce import must be rejected server-side when unauthorized.' );
assert_same( 'gated_segment_unavailable', $blocked->get_error_code(), 'A rejected gated import must use the gated_segment_unavailable code.' );

// Base content is always allowed.
assert_same( true, pixassist_starter_authorize_import( 'post_type', array( 'post_type' => 'post' ) ), 'Base/editorial import must always be authorized.' );

// A tampered client that mislabels commerce content cannot bypass the intrinsic classifier.
$mislabeled = pixassist_starter_authorize_import( 'post_type', array( 'post_type' => 'product', 'segment' => 'base' ) );
assert_true( is_wp_error( $mislabeled ), 'Mislabeled commerce content must still be rejected (intrinsic classification).' );

// WooCommerce active but no entitlement -> still rejected.
$GLOBALS['paf_installed_plugins'] = array( 'woocommerce/woocommerce.php' => true );
$GLOBALS['paf_entitlements']      = array();
$still_blocked = pixassist_starter_authorize_import( 'post_type', array( 'post_type' => 'product' ) );
assert_true( is_wp_error( $still_blocked ), 'Commerce import must stay rejected when WooCommerce is active but the Plus capability is absent.' );

// WooCommerce active + entitlement present -> authorized.
$GLOBALS['paf_entitlements'] = array( 'woocommerce_integration' => true );
assert_same( true, pixassist_starter_authorize_import( 'post_type', array( 'post_type' => 'product' ) ), 'Commerce import must be authorized when WooCommerce is active and the Plus capability is present.' );

/*
 * 6b. Bulk full-demo settings: commerce settings are stripped from a free import, kept when authorized.
 */
$mixed_settings = array(
	'blogname'                   => 'Felt',
	'woocommerce_store_address'  => '1 Main St',
	'woocommerce_currency'       => 'USD',
);

$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();
$free_settings = pixassist_starter_filter_unauthorized_settings( $mixed_settings );
assert_same( array( 'blogname' => 'Felt' ), $free_settings, 'A free full import must strip WooCommerce settings while keeping base settings.' );

$GLOBALS['paf_installed_plugins'] = array( 'woocommerce/woocommerce.php' => true );
$GLOBALS['paf_entitlements']      = array( 'woocommerce_integration' => true );
$entitled_settings = pixassist_starter_filter_unauthorized_settings( $mixed_settings );
assert_same( $mixed_settings, $entitled_settings, 'An authorized commerce import must keep WooCommerce settings.' );

// WooCommerce page option references must also be stripped from a free import (finding #3).
$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();
$page_option_settings = pixassist_starter_filter_unauthorized_settings(
	array(
		'blogname'                 => 'Felt',
		'woocommerce_shop_page_id' => 42,
		'woocommerce_cart_page_id' => 43,
	)
);
assert_same( array( 'blogname' => 'Felt' ), $page_option_settings, 'A free import must strip WooCommerce page option references (woocommerce_shop_page_id, ...).' );

/*
 * 6c. Per-record (intrinsic) commerce classification.
 *     The bulk/full import operates on individual page/template records inside one `page` or
 *     `wp_template` step, so step-level classification (post_type=page -> base) is NOT enough: Felt's
 *     SCE source ships ordinary `page` posts with slugs shop/cart/checkout/my-account, and block
 *     templates that may be WooCommerce templates. Classification is intrinsic to the record.
 */
assert_true( function_exists( 'pixassist_starter_classify_post_record' ), 'The per-record commerce classifier must be defined.' );
assert_true( function_exists( 'pixassist_starter_post_record_is_authorized' ), 'The per-record authorizer must be defined.' );

// WooCommerce pages ship as ordinary `page` posts (verified live on starter.pixelgrade.com/felt-lt:
// slugs shop, cart, checkout, my-account). They must classify as commerce by slug and by title.
foreach ( array( 'shop', 'cart', 'checkout', 'my-account', 'my_account', 'account' ) as $slug ) {
	assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => $slug ) ), 'A WooCommerce page slug must classify as commerce: ' . $slug );
}
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => 'storefront', 'post_title' => 'Checkout' ) ), 'A WooCommerce page title must classify as commerce.' );

// Ordinary editorial pages/posts stay base (no false positives on generic content).
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => 'about', 'post_title' => 'About us' ) ), 'Editorial pages must classify as base.' );
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => 'contact', 'post_title' => 'Contact' ) ), 'Contact pages must classify as base.' );
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'post', 'post_name' => 'hello-world', 'post_title' => 'Hello world' ) ), 'Editorial posts must classify as base.' );

// WooCommerce block templates classify as commerce (finding #2): step-level only sees post_type=wp_template.
foreach ( array( 'single-product', 'archive-product', 'taxonomy-product_cat', 'product-search-results', 'page-cart', 'page-checkout', 'order-confirmation', 'cart', 'checkout' ) as $slug ) {
	assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template', 'post_name' => $slug ) ), 'A WooCommerce template slug must classify as commerce: ' . $slug );
}
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template_part', 'post_name' => 'mini-cart' ) ), 'WooCommerce template parts classify as commerce.' );

// Templates owned by the WooCommerce block theme classify as commerce regardless of slug.
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template', 'post_name' => 'custom', 'taxonomies' => array( 'wp_theme' => array( 'woocommerce' ) ) ) ), 'Templates owned by the WooCommerce theme classify as commerce.' );

// Ordinary templates/parts stay base.
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template', 'post_name' => 'front-page' ) ), 'Ordinary templates classify as base.' );
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template', 'post_name' => 'archive' ) ), 'Generic archive templates classify as base.' );
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'wp_template_part', 'post_name' => 'header' ) ), 'Header template parts classify as base.' );

// WooCommerce blocks/shortcodes in content classify as commerce even on a `page`/`post`.
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => 'landing', 'post_content' => '<!-- wp:woocommerce/cart /-->' ) ), 'WooCommerce blocks in content classify as commerce.' );
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'page', 'post_name' => 'legacy', 'post_content' => '[woocommerce_cart]' ) ), 'WooCommerce shortcodes in content classify as commerce.' );

// Product records still commerce by post type.
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'product', 'post_name' => 'hat' ) ), 'Product records classify as commerce.' );

// Navigation menu items pointing at WooCommerce pages classify as commerce, so the free menu does not
// retain dead Shop/Cart links once the target pages are excluded.
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'nav_menu_item', 'post_title' => 'Shop', 'post_name' => 'shop' ) ), 'A Shop menu item classifies as commerce.' );
assert_same( 'commerce', pixassist_starter_classify_post_record( array( 'post_type' => 'nav_menu_item', 'post_title' => 'Cart' ) ), 'A Cart menu item classifies as commerce.' );
assert_same( 'base', pixassist_starter_classify_post_record( array( 'post_type' => 'nav_menu_item', 'post_title' => 'About', 'post_name' => 'about' ) ), 'A regular menu item classifies as base.' );

/*
 * 6d. Meta-targeted nav menu items.
 *     Live Felt nav items carry their commerce target only in `_menu_item_object`/`_menu_item_object_id`
 *     (their own slug/title do not identify them, e.g. id 2563 has an empty title pointing at the shop
 *     page; id 2509 is titled "products"). Classify them by the exported menu-item meta shape.
 */
// _menu_item_object = product -> commerce (the menu item links directly to a product).
assert_same(
	'commerce',
	pixassist_starter_classify_post_record( array(
		'post_type' => 'nav_menu_item',
		'post_title' => 'Featured',
		'meta'      => array( '_menu_item_type' => array( 'post_type' ), '_menu_item_object' => array( 'product' ), '_menu_item_object_id' => array( 2603 ) ),
	) ),
	'A nav item targeting a product classifies as commerce.'
);
// _menu_item_object = product_cat -> commerce (the menu item links to a product category).
assert_same(
	'commerce',
	pixassist_starter_classify_post_record( array(
		'post_type' => 'nav_menu_item',
		'post_title' => 'Sale',
		'meta'      => array( '_menu_item_type' => array( 'taxonomy' ), '_menu_item_object' => array( 'product_cat' ), '_menu_item_object_id' => array( 2599 ) ),
	) ),
	'A nav item targeting a product category classifies as commerce.'
);
// _menu_item_object = page targeting a skipped commerce page id (with no own slug/title signal).
$skipped_pages = array( 'commerce_object_ids' => array( '4' => true ) );
assert_same(
	'commerce',
	pixassist_starter_classify_post_record( array(
		'post_type' => 'nav_menu_item',
		'post_title' => '',
		'post_name' => '2563',
		'meta'      => array( '_menu_item_type' => array( 'post_type' ), '_menu_item_object' => array( 'page' ), '_menu_item_object_id' => array( 4 ) ),
	), $skipped_pages ),
	'A nav item targeting a skipped commerce page id classifies as commerce.'
);
// id 2509: title "products" but targets the shop page by id (object=page) -> caught via the id context.
assert_same(
	'commerce',
	pixassist_starter_classify_post_record( array(
		'post_type' => 'nav_menu_item',
		'post_title' => 'products',
		'post_name' => 'products',
		'meta'      => array( '_menu_item_type' => array( 'post_type' ), '_menu_item_object' => array( 'page' ), '_menu_item_object_id' => array( 4 ) ),
	), $skipped_pages ),
	'A nav item titled "products" targeting the shop page id classifies as commerce.'
);
// A nav item targeting a NON-commerce page id (not in the skipped set) stays base.
assert_same(
	'base',
	pixassist_starter_classify_post_record( array(
		'post_type' => 'nav_menu_item',
		'post_title' => 'About',
		'meta'      => array( '_menu_item_type' => array( 'post_type' ), '_menu_item_object' => array( 'page' ), '_menu_item_object_id' => array( 7 ) ),
	), $skipped_pages ),
	'A nav item targeting a base page stays base.'
);

// Per-record authorization honors the context for meta-targeted nav items in a free import.
$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();
assert_same(
	false,
	pixassist_starter_post_record_is_authorized(
		array( 'post_type' => 'nav_menu_item', 'meta' => array( '_menu_item_object' => array( 'page' ), '_menu_item_object_id' => array( 4 ) ) ),
		$skipped_pages
	),
	'A nav item targeting a skipped commerce page must NOT be authorized in a free import.'
);
assert_same(
	false,
	pixassist_starter_post_record_is_authorized(
		array( 'post_type' => 'nav_menu_item', 'meta' => array( '_menu_item_object' => array( 'product' ), '_menu_item_object_id' => array( 2603 ) ) )
	),
	'A nav item targeting a product must NOT be authorized in a free import.'
);
assert_same(
	true,
	pixassist_starter_post_record_is_authorized(
		array( 'post_type' => 'nav_menu_item', 'meta' => array( '_menu_item_object' => array( 'page' ), '_menu_item_object_id' => array( 7 ) ) ),
		$skipped_pages
	),
	'A nav item targeting a base page must be authorized.'
);

// Per-record authorization mirrors segment availability (server-authoritative, no client labels).
$GLOBALS['paf_installed_plugins'] = array();
$GLOBALS['paf_entitlements']      = array();
assert_same( false, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'page', 'post_name' => 'shop' ) ), 'A shop page must NOT be authorized in a free import.' );
assert_same( false, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'wp_template', 'post_name' => 'single-product' ) ), 'A WooCommerce template must NOT be authorized in a free import.' );
assert_same( true, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'page', 'post_name' => 'about' ) ), 'A base page must always be authorized.' );
assert_same( true, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'wp_template', 'post_name' => 'front-page' ) ), 'A base template must always be authorized.' );

$GLOBALS['paf_installed_plugins'] = array( 'woocommerce/woocommerce.php' => true );
$GLOBALS['paf_entitlements']      = array( 'woocommerce_integration' => true );
assert_same( true, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'page', 'post_name' => 'shop' ) ), 'A shop page must be authorized when WooCommerce + the Plus capability are present.' );
assert_same( true, pixassist_starter_post_record_is_authorized( array( 'post_type' => 'wp_template', 'post_name' => 'single-product' ) ), 'A WooCommerce template must be authorized when WooCommerce + the Plus capability are present.' );

/*
 * 7. Gated segment data must never leak OAuth/license secrets to JS.
 *    Even a companion filter that injects sensitive keys is stripped to the whitelist.
 */
add_filter(
	'pixassist_starter_segments',
	function ( $segments ) {
		foreach ( $segments as $index => $segment ) {
			$segments[ $index ]['oauth_token']        = 'leaked-token';
			$segments[ $index ]['oauth_token_secret'] = 'leaked-secret';
			$segments[ $index ]['license_hash']       = 'leaked-hash';
			$segments[ $index ]['token_secret']       = 'leaked';
		}

		return $segments;
	}
);

$leaky = pixassist_get_starter_segments(
	array(
		'id'       => 'felt-lt',
		'commerce' => true,
	),
	array( 'id' => 'felt-lt' )
);
foreach ( $leaky as $segment ) {
	$keys = array_keys( $segment );
	foreach ( array( 'oauth_token', 'oauth_token_secret', 'license_hash', 'token_secret' ) as $secret ) {
		assert_true( ! in_array( $secret, $keys, true ), 'Segment descriptors must never carry the secret key: ' . $secret );
	}
}

echo "Starter capability-segments OK\n";
