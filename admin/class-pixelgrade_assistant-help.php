<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme Help: in-dashboard documentation (knowledge base) for the active theme.
 *
 * Free and account-free by design: it reads the PUBLIC Pixelgrade docs categories endpoint
 * (`get_htkb_categories`) — no AWS/ElasticSearch, no OAuth, no license, no support tickets
 * (premium support belongs to Pixelgrade Plus). Article bodies ride along in the same payload,
 * so search is done client-side; nothing heavy ships in the bundle.
 *
 * LT/Lite themes inherit their premium parent's knowledge base (e.g. `hive-lite` -> `hive`).
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/admin
 */
class PixelgradeAssistant_Help {

	/**
	 * The main plugin object (the parent).
	 * @var PixelgradeAssistant
	 */
	public $parent = null;

	/**
	 * The only instance.
	 * @var PixelgradeAssistant_Help
	 */
	protected static $_instance = null;

	/**
	 * How long to cache the fetched docs categories.
	 */
	const CACHE_TTL = 12 * HOUR_IN_SECONDS;

	public function __construct( $parent ) {
		$this->parent = $parent;

		add_filter( 'pixassist_localized_data', array( $this, 'add_help_localized_data' ), 10, 1 );
		// Refresh the cached docs when the active theme changes (the KB SKU may change too).
		add_action( 'after_switch_theme', array( __CLASS__, 'clear_kb_cache' ), 12 );
	}

	/**
	 * The knowledge-base product SKU for the active theme.
	 *
	 * LT/Lite themes inherit their premium parent's KB, so we strip a trailing `-lt`/`-lite`
	 * from the theme slug by default. Filterable so the mapping can be corrected per theme.
	 *
	 * @return string
	 */
	public static function get_kb_product_sku() {
		$slug = (string) PixelgradeAssistant_Admin::get_original_theme_slug();
		$sku  = preg_replace( '/-(lt|lite)$/', '', strtolower( $slug ) );

		/**
		 * Filter the knowledge-base product SKU used to fetch in-dashboard documentation.
		 *
		 * @param string $sku  The resolved SKU (premium parent for LT/Lite themes).
		 * @param string $slug The original theme slug.
		 */
		return apply_filters( 'pixassist_kb_product_sku', $sku, $slug );
	}

	/**
	 * The public endpoint that serves the docs categories tree.
	 *
	 * @return string
	 */
	public static function get_categories_endpoint() {
		return PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/get_htkb_categories';
	}

	/**
	 * The public endpoint that records "was this helpful?" votes.
	 *
	 * @return string
	 */
	public static function get_voting_endpoint() {
		return PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/ht_voting';
	}

	private static function cache_key() {
		return 'pixassist_kb_categories_' . md5( self::get_kb_product_sku() );
	}

	/**
	 * Clear the cached docs categories.
	 *
	 * @return bool
	 */
	public static function clear_kb_cache() {
		return delete_transient( self::cache_key() );
	}

	/**
	 * Fetch (cached) the public docs categories for the active theme's KB SKU.
	 *
	 * Returns an empty array when the SKU has no knowledge base (e.g. a theme whose premium
	 * parent doesn't have a KB yet); the UI falls back to linking to the online docs.
	 *
	 * @param bool $skip_cache
	 *
	 * @return array
	 */
	public static function get_kb_categories( $skip_cache = false ) {
		$key = self::cache_key();

		if ( ! $skip_cache ) {
			$cached = get_transient( $key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$endpoint = self::get_categories_endpoint();

		$response = wp_remote_get(
			add_query_arg(
				array(
					'kb_current_product_sku' => self::get_kb_product_sku(),
					'hash_id'                => PixelgradeAssistant_Admin::get_theme_hash_id(),
					'type'                   => PixelgradeAssistant_Admin::get_theme_type(),
				),
				$endpoint
			),
			array(
				'timeout'   => PixelgradeAssistant_Admin::is_development_url( $endpoint ) ? 10 : 6,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return array();
		}

		$body       = json_decode( wp_remote_retrieve_body( $response ), true );
		$categories = array();
		if ( isset( $body['code'] ) && 'success' === $body['code'] && ! empty( $body['data']['htkb_categories'] ) ) {
			$categories = $body['data']['htkb_categories'];
		}

		set_transient( $key, $categories, self::CACHE_TTL );

		return $categories;
	}

	/**
	 * Expose lightweight help metadata to JS. The full docs payload is NOT shipped on every page
	 * load — it is fetched lazily over REST when the user opens the Theme Help panel.
	 *
	 * @param array $localized_data
	 *
	 * @return array
	 */
	public function add_help_localized_data( $localized_data ) {
		$localized_data['help'] = array(
			'productSku' => self::get_kb_product_sku(),
			'docsUrl'    => esc_url_raw( trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs' ),
			'votingUrl'  => esc_url_raw( self::get_voting_endpoint() ),
		);

		return $localized_data;
	}

	/**
	 * Main PixelgradeAssistant_Help Instance.
	 *
	 * @param object $parent Main PixelgradeAssistant instance.
	 *
	 * @return PixelgradeAssistant_Help
	 */
	public static function instance( $parent ) {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $parent );
		}

		return self::$_instance;
	}
}
