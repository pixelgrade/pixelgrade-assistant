<?php
/**
 * Starter capability-segments: the data model and server-side enforcement that make starter sites
 * free to browse/apply while letting Pixelgrade Plus unlock specific pro capabilities.
 *
 * A starter's import is decomposed into segments. The three baseline segments (base/editorial,
 * look/design, layouts/templates) are always free and included by default. Gated segments
 * (commerce/WooCommerce) are excluded from the free/default import and only become available when
 * their required plugins are active AND Plus grants the matching capability.
 *
 * Starter sites are NOT premium objects: the card stays free/visible. The gate lives on the
 * *segment*, never on the starter. Availability is computed server-authoritatively and reduced to a
 * boolean + reason, so OAuth tokens, license hashes, and entitlement lists never reach JS.
 *
 * Cross-plugin entitlement is read through Plus's existing, absence-safe bridge filter
 * `pixelgrade/has_entitlement` (EntitlementBridge): when Plus is missing, the locked default survives
 * and commerce stays blocked. Assistant only READS this; it never computes entitlement.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_starter_segment_text_domain' ) ) {
	/**
	 * Stub-safe wrapper so standalone segment helpers stay translatable.
	 *
	 * @param string $text Source string.
	 *
	 * @return string
	 */
	function pixassist_starter_segment_text_domain( $text ) {
		return function_exists( 'esc_html__' ) ? esc_html__( $text, '__plugin_txtd' ) : $text;
	}
}

if ( ! function_exists( 'pixassist_get_starter_segment_definitions' ) ) {
	/**
	 * Canonical segment definitions — the single source of truth for both the per-starter model and
	 * the server-side import guard, so they cannot drift.
	 *
	 * Each definition declares its display copy, default-inclusion, and the requirements that gate it:
	 * `requiredPlugins` (companion plugins that must be active), `requiredEntitlements` (Plus capability
	 * keys queried through the shared bridge), and `requiredCapabilities` (WP caps). The baseline
	 * segments have no requirements; commerce requires WooCommerce + the `woocommerce_integration`
	 * Plus capability and is excluded from the default/free import.
	 *
	 * @return array Segment definitions keyed by id.
	 */
	function pixassist_get_starter_segment_definitions() {
		$definitions = array(
			'base'     => array(
				'label'                => pixassist_starter_segment_text_domain( 'Editorial content' ),
				'description'          => pixassist_starter_segment_text_domain( 'Pages, posts, media, and menus from the starter.' ),
				'affectedAreas'        => array(
					pixassist_starter_segment_text_domain( 'Pages' ),
					pixassist_starter_segment_text_domain( 'Posts' ),
					pixassist_starter_segment_text_domain( 'Media' ),
					pixassist_starter_segment_text_domain( 'Menus' ),
				),
				'defaultIncluded'      => true,
				'requiredPlugins'      => array(),
				'requiredEntitlements' => array(),
				'requiredCapabilities' => array(),
				'gate'                 => '',
			),
			'look'     => array(
				'label'                => pixassist_starter_segment_text_domain( 'Design settings' ),
				'description'          => pixassist_starter_segment_text_domain( 'Colors, fonts, and logo from the starter look.' ),
				'affectedAreas'        => array(
					pixassist_starter_segment_text_domain( 'Colors' ),
					pixassist_starter_segment_text_domain( 'Fonts' ),
					pixassist_starter_segment_text_domain( 'Logo' ),
				),
				'defaultIncluded'      => true,
				'requiredPlugins'      => array(),
				'requiredEntitlements' => array(),
				'requiredCapabilities' => array(),
				'gate'                 => '',
			),
			'layouts'  => array(
				'label'                => pixassist_starter_segment_text_domain( 'Layouts' ),
				'description'          => pixassist_starter_segment_text_domain( 'Header, footer, and page templates from the starter.' ),
				'affectedAreas'        => array(
					pixassist_starter_segment_text_domain( 'Header' ),
					pixassist_starter_segment_text_domain( 'Footer' ),
					pixassist_starter_segment_text_domain( 'Templates' ),
				),
				'defaultIncluded'      => true,
				'requiredPlugins'      => array(),
				'requiredEntitlements' => array(),
				'requiredCapabilities' => array(),
				'gate'                 => '',
			),
			'commerce' => array(
				'label'                => pixassist_starter_segment_text_domain( 'Shop & products' ),
				'description'          => pixassist_starter_segment_text_domain( 'WooCommerce shop pages, products, store settings, and commerce layouts.' ),
				'affectedAreas'        => array(
					pixassist_starter_segment_text_domain( 'Shop' ),
					pixassist_starter_segment_text_domain( 'Products' ),
					pixassist_starter_segment_text_domain( 'Cart & checkout' ),
					pixassist_starter_segment_text_domain( 'WooCommerce settings' ),
				),
				'defaultIncluded'      => false,
				'requiredPlugins'      => array(
					array(
						'slug' => 'woocommerce',
						'name' => 'WooCommerce',
					),
				),
				'requiredEntitlements' => array( 'woocommerce_integration' ),
				'requiredCapabilities' => array(),
				'gate'                 => 'plus',
			),
		);

		/**
		 * Filter the canonical starter segment definitions.
		 *
		 * Lets the remote config / a companion declare additional gated segments. The result is
		 * re-normalized + whitelisted downstream, so a filter can never widen the JS-facing surface.
		 *
		 * @param array $definitions Segment definitions keyed by id.
		 */
		return apply_filters( 'pixassist_starter_segment_definitions', $definitions );
	}
}

if ( ! function_exists( 'pixassist_starter_segment_has_entitlement' ) ) {
	/**
	 * Read a Plus capability through the shared, absence-safe entitlement bridge.
	 *
	 * Assistant never computes entitlement — it asks Plus through `pixelgrade/has_entitlement` with a
	 * locked `false` default. When Plus is missing or unlicensed the default survives, keeping the
	 * capability locked. Returns a plain boolean only.
	 *
	 * @param string $entitlement Capability key (e.g. `woocommerce_integration`).
	 *
	 * @return bool True when Plus grants the capability.
	 */
	function pixassist_starter_segment_has_entitlement( $entitlement ) {
		$entitlement = is_string( $entitlement ) ? trim( $entitlement ) : '';
		if ( '' === $entitlement ) {
			return false;
		}

		if ( ! function_exists( 'apply_filters' ) ) {
			return false;
		}

		return (bool) apply_filters( 'pixelgrade/has_entitlement', false, $entitlement );
	}
}

if ( ! function_exists( 'pixassist_starter_segment_plugin_status' ) ) {
	/**
	 * Resolve a companion plugin's install/active status, reusing the starter helper when present.
	 *
	 * @param string $slug Plugin slug / folder.
	 *
	 * @return array { isInstalled: bool, isActive: bool }
	 */
	function pixassist_starter_segment_plugin_status( $slug ) {
		if ( function_exists( 'pixassist_get_starter_plugin_status' ) ) {
			return pixassist_get_starter_plugin_status( $slug );
		}

		$slug   = function_exists( 'sanitize_key' ) ? sanitize_key( $slug ) : strtolower( (string) $slug );
		$result = array(
			'isInstalled' => false,
			'isActive'    => false,
		);

		if ( '' === $slug || ! function_exists( 'get_plugins' ) ) {
			return $result;
		}

		foreach ( array_keys( (array) get_plugins() ) as $plugin_file ) {
			if ( strtok( (string) $plugin_file, '/' ) !== $slug ) {
				continue;
			}

			$result['isInstalled'] = true;
			if ( function_exists( 'is_plugin_active' ) && is_plugin_active( $plugin_file ) ) {
				$result['isActive'] = true;
			}
		}

		return $result;
	}
}

if ( ! function_exists( 'pixassist_normalize_starter_segment_required_plugins' ) ) {
	/**
	 * Normalize + status-stamp a segment's required plugins.
	 *
	 * @param array $required Raw required-plugin descriptors (each at least a slug).
	 *
	 * @return array[] Each: slug, name, isInstalled, isActive.
	 */
	function pixassist_normalize_starter_segment_required_plugins( $required ) {
		if ( function_exists( 'pixassist_normalize_starter_required_plugins' ) ) {
			return pixassist_normalize_starter_required_plugins( $required );
		}

		$normalized = array();
		foreach ( (array) $required as $entry ) {
			if ( is_string( $entry ) ) {
				$entry = array( 'slug' => $entry );
			}
			if ( ! is_array( $entry ) || empty( $entry['slug'] ) ) {
				continue;
			}

			$slug   = function_exists( 'sanitize_key' ) ? sanitize_key( $entry['slug'] ) : strtolower( (string) $entry['slug'] );
			$status = pixassist_starter_segment_plugin_status( $slug );

			$normalized[] = array(
				'slug'        => $slug,
				'name'        => ! empty( $entry['name'] ) ? (string) $entry['name'] : ucwords( str_replace( array( '-', '_' ), ' ', $slug ) ),
				'isInstalled' => ! empty( $status['isInstalled'] ),
				'isActive'    => ! empty( $status['isActive'] ),
			);
		}

		return $normalized;
	}
}

if ( ! function_exists( 'pixassist_get_starter_segment_availability' ) ) {
	/**
	 * Compute a segment's server-authoritative availability from its requirements.
	 *
	 * Order of precedence for the blocking reason: required WP capabilities, then required plugins,
	 * then required Plus entitlements. Returns only a status string + reason + boolean — never secrets.
	 *
	 * @param array $required_plugins      Normalized required plugins (slug/name/isInstalled/isActive).
	 * @param array $required_entitlements Plus capability keys.
	 * @param array $required_capabilities WP capability keys.
	 *
	 * @return array { availability: string, available: bool, availabilityReason: string }
	 */
	function pixassist_get_starter_segment_availability( $required_plugins, $required_entitlements, $required_capabilities ) {
		foreach ( (array) $required_capabilities as $capability ) {
			$capability = is_string( $capability ) ? trim( $capability ) : '';
			if ( '' === $capability ) {
				continue;
			}
			if ( function_exists( 'current_user_can' ) && ! current_user_can( $capability ) ) {
				return array(
					'availability'       => 'requires_capability',
					'available'          => false,
					'availabilityReason' => pixassist_starter_segment_text_domain( 'Your account does not have permission to apply this part.' ),
				);
			}
		}

		foreach ( (array) $required_plugins as $plugin ) {
			if ( empty( $plugin['isActive'] ) ) {
				return array(
					'availability'       => 'requires_plugins',
					'available'          => false,
					'availabilityReason' => count( array_filter( (array) $required_entitlements, function ( $entitlement ) { return ! pixassist_starter_segment_has_entitlement( $entitlement ); } ) ) ? pixassist_starter_segment_text_domain( 'Requires WooCommerce and Pixelgrade Plus.' ) : pixassist_starter_segment_text_domain( 'Install and activate the required plugin to apply this part.' ),
				);
			}
		}

		foreach ( (array) $required_entitlements as $entitlement ) {
			if ( ! pixassist_starter_segment_has_entitlement( $entitlement ) ) {
				return array(
					'availability'       => 'requires_entitlement',
					'available'          => false,
					'availabilityReason' => pixassist_starter_segment_text_domain( 'Unlock this part with Pixelgrade Plus.' ),
				);
			}
		}

		return array(
			'availability'       => 'available',
			'available'          => true,
			'availabilityReason' => '',
		);
	}
}

if ( ! function_exists( 'pixassist_normalize_starter_segment' ) ) {
	/**
	 * Normalize one segment into the stable, secret-free contract shape.
	 *
	 * The descriptor is rebuilt from a fixed whitelist (id, label, description, affectedAreas,
	 * defaultIncluded, requiredPlugins, requiredEntitlements, requiredCapabilities, gate, availability,
	 * availabilityReason, available), so a companion override can never inject OAuth tokens, license
	 * hashes, or other sensitive data into the JS-facing payload.
	 *
	 * @param string $id        Segment id.
	 * @param array  $overrides Per-starter overrides merged over the canonical definition.
	 *
	 * @return array Normalized segment, or empty array when the id is invalid.
	 */
	function pixassist_normalize_starter_segment( $id, $overrides = array() ) {
		$id = function_exists( 'sanitize_key' ) ? sanitize_key( $id ) : strtolower( (string) $id );
		if ( '' === $id ) {
			return array();
		}

		$definitions = pixassist_get_starter_segment_definitions();
		$definition  = isset( $definitions[ $id ] ) && is_array( $definitions[ $id ] ) ? $definitions[ $id ] : array();
		$overrides   = is_array( $overrides ) ? $overrides : array();
		$merged      = array_merge( $definition, $overrides );

		$required_entitlements = array();
		foreach ( (array) ( isset( $merged['requiredEntitlements'] ) ? $merged['requiredEntitlements'] : array() ) as $entitlement ) {
			$entitlement = is_string( $entitlement ) ? trim( $entitlement ) : '';
			if ( '' !== $entitlement ) {
				$required_entitlements[] = $entitlement;
			}
		}

		$required_capabilities = array();
		foreach ( (array) ( isset( $merged['requiredCapabilities'] ) ? $merged['requiredCapabilities'] : array() ) as $capability ) {
			$capability = is_string( $capability ) ? trim( $capability ) : '';
			if ( '' !== $capability ) {
				$required_capabilities[] = $capability;
			}
		}

		$required_plugins = pixassist_normalize_starter_segment_required_plugins(
			isset( $merged['requiredPlugins'] ) ? $merged['requiredPlugins'] : array()
		);

		$affected_areas = array();
		foreach ( (array) ( isset( $merged['affectedAreas'] ) ? $merged['affectedAreas'] : array() ) as $area ) {
			$area = is_string( $area ) ? trim( $area ) : '';
			if ( '' !== $area ) {
				$affected_areas[] = $area;
			}
		}

		$availability = pixassist_get_starter_segment_availability( $required_plugins, $required_entitlements, $required_capabilities );

		return array(
			'id'                   => $id,
			'label'                => isset( $merged['label'] ) ? (string) $merged['label'] : ucwords( str_replace( array( '-', '_' ), ' ', $id ) ),
			'description'          => isset( $merged['description'] ) ? (string) $merged['description'] : '',
			'affectedAreas'        => $affected_areas,
			'defaultIncluded'      => ! empty( $merged['defaultIncluded'] ),
			'requiredPlugins'      => $required_plugins,
			'requiredEntitlements' => array_values( array_unique( $required_entitlements ) ),
			'requiredCapabilities' => array_values( array_unique( $required_capabilities ) ),
			'gate'                 => isset( $merged['gate'] ) && function_exists( 'sanitize_key' ) ? sanitize_key( $merged['gate'] ) : ( isset( $merged['gate'] ) ? (string) $merged['gate'] : '' ),
			'availability'         => $availability['availability'],
			'availabilityReason'   => $availability['availabilityReason'],
			'available'            => $availability['available'],
		);
	}
}

if ( ! function_exists( 'pixassist_starter_declares_commerce' ) ) {
	/**
	 * Decide whether a starter carries the commerce segment.
	 *
	 * Precedence: an explicit `segments` declaration listing `commerce`, an explicit `commerce` flag
	 * (so the remote descriptor can opt in OR out), a curated allowlist of known free commerce
	 * starters (Felt LT — whose identity carries no commerce keyword), then a conservative inference
	 * from the starter identity. None of these change the free import or gate the card; they only
	 * surface the (locked, default-excluded) commerce segment as an upsell.
	 *
	 * @param array $raw_starter Raw starter descriptor.
	 * @param array $normalized  Partial normalized starter descriptor.
	 *
	 * @return bool
	 */
	function pixassist_starter_declares_commerce( $raw_starter, $normalized ) {
		if ( isset( $raw_starter['segments'] ) && is_array( $raw_starter['segments'] ) ) {
			foreach ( $raw_starter['segments'] as $key => $segment ) {
				$segment_id = is_array( $segment ) ? ( isset( $segment['id'] ) ? $segment['id'] : $key ) : $segment;
				if ( 'commerce' === ( function_exists( 'sanitize_key' ) ? sanitize_key( $segment_id ) : strtolower( (string) $segment_id ) ) ) {
					return true;
				}
			}
		}

		if ( isset( $raw_starter['commerce'] ) ) {
			return (bool) $raw_starter['commerce'];
		}

		// Curated free commerce starters. Felt LT is a commerce-flavored Anima LT starter whose id/title
		// carries no commerce keyword, so it would otherwise miss the copy inference below. The list is
		// keyed by demo id and filterable, so the team / a companion / the remote config can curate it
		// without forcing a copy-keyword hack into the starter title.
		$commerce_ids = function_exists( 'apply_filters' )
			? apply_filters( 'pixassist_starter_commerce_ids', array( 'felt-lt' => true ) )
			: array( 'felt-lt' => true );
		if ( is_array( $commerce_ids ) ) {
			foreach ( array(
				isset( $normalized['id'] ) ? $normalized['id'] : '',
				isset( $raw_starter['id'] ) ? $raw_starter['id'] : '',
				isset( $raw_starter['slug'] ) ? $raw_starter['slug'] : '',
			) as $candidate ) {
				$candidate = function_exists( 'sanitize_key' ) ? sanitize_key( $candidate ) : strtolower( trim( (string) $candidate ) );
				if ( '' !== $candidate && ! empty( $commerce_ids[ $candidate ] ) ) {
					return true;
				}
			}
		}

		$haystack = strtolower(
			implode(
				' ',
				array(
					isset( $normalized['id'] ) ? $normalized['id'] : ( isset( $raw_starter['id'] ) ? $raw_starter['id'] : '' ),
					isset( $normalized['title'] ) ? $normalized['title'] : ( isset( $raw_starter['title'] ) ? $raw_starter['title'] : '' ),
					isset( $normalized['description'] ) ? $normalized['description'] : '',
				)
			)
		);

		return (bool) preg_match( '/\b(woocommerce|commerce|shop|store|product)\b/', $haystack );
	}
}

if ( ! function_exists( 'pixassist_get_starter_segments' ) ) {
	/**
	 * Build the normalized segment list for a starter: the three free baseline segments plus any
	 * declared/implied gated segments (currently commerce).
	 *
	 * The result is re-whitelisted after the `pixassist_starter_segments` filter, so companion
	 * additions cannot leak secrets into the JS payload.
	 *
	 * @param array $raw_starter Raw starter descriptor.
	 * @param array $normalized  Partial normalized starter descriptor (id/title/description/...).
	 *
	 * @return array[] Normalized segments.
	 */
	function pixassist_get_starter_segments( $raw_starter, $normalized = array() ) {
		$raw_starter = is_array( $raw_starter ) ? $raw_starter : array();
		$normalized  = is_array( $normalized ) ? $normalized : array();

		$declared_overrides = array();
		if ( isset( $raw_starter['segments'] ) && is_array( $raw_starter['segments'] ) ) {
			foreach ( $raw_starter['segments'] as $key => $segment ) {
				$segment_id = is_array( $segment ) ? ( isset( $segment['id'] ) ? $segment['id'] : $key ) : $segment;
				$segment_id = function_exists( 'sanitize_key' ) ? sanitize_key( $segment_id ) : strtolower( (string) $segment_id );
				if ( '' === $segment_id ) {
					continue;
				}
				$declared_overrides[ $segment_id ] = is_array( $segment ) ? $segment : array();
			}
		}

		$ids = array( 'base', 'look', 'layouts' );
		if ( pixassist_starter_declares_commerce( $raw_starter, $normalized ) ) {
			$ids[] = 'commerce';
		}

		$segments = array();
		foreach ( $ids as $id ) {
			$overrides = isset( $declared_overrides[ $id ] ) ? $declared_overrides[ $id ] : array();
			$segment   = pixassist_normalize_starter_segment( $id, $overrides );
			if ( ! empty( $segment['id'] ) ) {
				$segments[] = $segment;
			}
		}

		/**
		 * Filter the resolved starter segments.
		 *
		 * @param array[] $segments    Normalized segments.
		 * @param array   $raw_starter Raw starter descriptor.
		 * @param array   $normalized  Partial normalized starter descriptor.
		 */
		$segments = apply_filters( 'pixassist_starter_segments', $segments, $raw_starter, $normalized );

		// Re-whitelist after the filter so a companion can never widen the JS-facing surface.
		$clean = array();
		foreach ( (array) $segments as $segment ) {
			if ( ! is_array( $segment ) || empty( $segment['id'] ) ) {
				continue;
			}
			$clean[] = pixassist_normalize_starter_segment( $segment['id'], $segment );
		}

		return $clean;
	}
}

if ( ! function_exists( 'pixassist_starter_is_commerce_post_type' ) ) {
	/**
	 * Whether a post type is WooCommerce/commerce-owned.
	 *
	 * @param string $post_type Post type slug.
	 *
	 * @return bool
	 */
	function pixassist_starter_is_commerce_post_type( $post_type ) {
		$post_type = strtolower( trim( (string) $post_type ) );
		if ( '' === $post_type ) {
			return false;
		}

		$known = array( 'product', 'product_variation', 'shop_order', 'shop_order_refund', 'shop_order_placehold', 'shop_coupon', 'shop_subscription' );

		return in_array( $post_type, $known, true ) || 0 === strpos( $post_type, 'product' ) || 0 === strpos( $post_type, 'shop_' );
	}
}

if ( ! function_exists( 'pixassist_starter_is_commerce_taxonomy' ) ) {
	/**
	 * Whether a taxonomy is WooCommerce/commerce-owned.
	 *
	 * @param string $taxonomy Taxonomy slug.
	 *
	 * @return bool
	 */
	function pixassist_starter_is_commerce_taxonomy( $taxonomy ) {
		$taxonomy = strtolower( trim( (string) $taxonomy ) );
		if ( '' === $taxonomy ) {
			return false;
		}

		$known = array( 'product_cat', 'product_tag', 'product_type', 'product_visibility', 'product_shipping_class', 'product_brand' );

		return in_array( $taxonomy, $known, true ) || 0 === strpos( $taxonomy, 'product_' ) || 0 === strpos( $taxonomy, 'pa_' );
	}
}

if ( ! function_exists( 'pixassist_starter_is_commerce_template_slug' ) ) {
	/**
	 * Whether a block-template (`wp_template`/`wp_template_part`) slug is a WooCommerce template.
	 *
	 * @param string $slug Template slug.
	 *
	 * @return bool
	 */
	function pixassist_starter_is_commerce_template_slug( $slug ) {
		$slug = strtolower( trim( (string) $slug ) );
		if ( '' === $slug ) {
			return false;
		}

		$known = array(
			'single-product', 'archive-product', 'product-search-results',
			'taxonomy-product_cat', 'taxonomy-product_tag', 'taxonomy-product_attribute',
			'page-cart', 'page-checkout', 'cart', 'checkout', 'order-confirmation',
			'mini-cart', 'checkout-header', 'product-filters', 'product-meta', 'product-details',
			'related-products', 'product-gallery', 'add-to-cart-with-options', 'product-reviews',
			'single-product-reviews',
		);

		if ( in_array( $slug, $known, true ) ) {
			return true;
		}

		foreach ( array( 'single-product', 'archive-product', 'taxonomy-product', 'product-' ) as $prefix ) {
			if ( 0 === strpos( $slug, $prefix ) ) {
				return true;
			}
		}

		return false !== strpos( $slug, 'woocommerce' );
	}
}

if ( ! function_exists( 'pixassist_starter_is_commerce_page' ) ) {
	/**
	 * Whether a `page`/`post` record is a WooCommerce page (shop/cart/checkout/my-account) by slug or
	 * exact title. WooCommerce ships these as ordinary pages, so a post-type check never catches them.
	 *
	 * @param string $slug  Post slug (`post_name`).
	 * @param string $title Post title.
	 *
	 * @return bool
	 */
	function pixassist_starter_is_commerce_page( $slug, $title = '' ) {
		$slug = strtolower( trim( (string) $slug ) );

		$slugs = array( 'shop', 'cart', 'checkout', 'my-account', 'my_account', 'account', 'order-received', 'order-pay', 'view-order', 'edit-account', 'lost-password' );
		if ( '' !== $slug && in_array( $slug, $slugs, true ) ) {
			return true;
		}

		// Exact (normalized) title match only, so generic copy like "Shopping tips" is not a false positive.
		$title = strtolower( trim( preg_replace( '/\s+/', ' ', (string) $title ) ) );
		$titles = array( 'shop', 'cart', 'checkout', 'my account', 'my-account', 'account' );

		return '' !== $title && in_array( $title, $titles, true );
	}
}

if ( ! function_exists( 'pixassist_starter_content_has_commerce' ) ) {
	/**
	 * Whether post content embeds WooCommerce blocks or shortcodes.
	 *
	 * @param string $content Post content.
	 *
	 * @return bool
	 */
	function pixassist_starter_content_has_commerce( $content ) {
		$content = (string) $content;
		if ( '' === $content ) {
			return false;
		}

		return (bool) preg_match( '#(wp:woocommerce/|\[(woocommerce_|product_page|products|add_to_cart|shop_messages|recent_products|sale_products|featured_products))#i', $content );
	}
}

if ( ! function_exists( 'pixassist_starter_classify_import' ) ) {
	/**
	 * Classify an import operation into a segment from the content itself (intrinsic classification).
	 *
	 * This is the defense-in-depth layer: it does not trust any client-supplied segment label, so a
	 * tampered request that mislabels commerce content as `base` is still classified as `commerce`.
	 * Note: this is OPERATION level (post_type=page is `base` here) — per-record content that ships
	 * inside a base operation (WooCommerce pages/templates within a `page`/`wp_template` step) is
	 * caught by {@see pixassist_starter_classify_post_record()} during insertion.
	 *
	 * @param string $type Import step type (post_type, taxonomy, pre_settings, post_settings, ...).
	 * @param array  $args Import step args.
	 *
	 * @return string Segment id (defaults to `base`).
	 */
	function pixassist_starter_classify_import( $type, $args = array() ) {
		$type = is_string( $type ) ? strtolower( trim( $type ) ) : '';
		$args = is_array( $args ) ? $args : array();

		if ( 'post_type' === $type && pixassist_starter_is_commerce_post_type( isset( $args['post_type'] ) ? $args['post_type'] : '' ) ) {
			return 'commerce';
		}

		if ( 'taxonomy' === $type && pixassist_starter_is_commerce_taxonomy( isset( $args['tax'] ) ? $args['tax'] : '' ) ) {
			return 'commerce';
		}

		if ( in_array( $type, array( 'pre_settings', 'post_settings' ), true ) ) {
			$data = isset( $args['data'] ) && is_array( $args['data'] ) ? $args['data'] : array();
			foreach ( array_keys( $data ) as $key ) {
				if ( 0 === strpos( strtolower( (string) $key ), 'woocommerce_' ) ) {
					return 'commerce';
				}
			}
		}

		return 'base';
	}
}

if ( ! function_exists( 'pixassist_starter_post_meta_value' ) ) {
	/**
	 * Read the first scalar value of a meta key from an SCE post record.
	 *
	 * SCE exports meta as `meta => [ key => [ value, ... ] ]`, so unwrap the first element.
	 *
	 * @param array  $post Source post record.
	 * @param string $key  Meta key.
	 *
	 * @return string
	 */
	function pixassist_starter_post_meta_value( $post, $key ) {
		if ( ! is_array( $post ) || ! isset( $post['meta'][ $key ] ) ) {
			return '';
		}

		$value = $post['meta'][ $key ];
		if ( is_array( $value ) ) {
			$value = array() === $value ? '' : ( isset( $value[0] ) ? $value[0] : reset( $value ) );
		}

		return is_scalar( $value ) ? (string) $value : '';
	}
}

if ( ! function_exists( 'pixassist_starter_commerce_object_key' ) ) {
	/**
	 * Build the lookup key for the skipped-commerce source-id registry.
	 *
	 * The registry is keyed by `"<object-type>:<source-id>"` (never a bare numeric id) so that a
	 * nav menu item targeting an editorial term cannot collide with a skipped product/page that
	 * merely shares the same numeric id: post ids and term ids live in separate tables and freely
	 * coincide (e.g. category term 18 vs product post id 18). This is the single key shape shared by
	 * the importer (which records skipped ids) and {@see pixassist_starter_classify_post_record()}
	 * (which matches nav-item targets against them), so the two can never drift.
	 *
	 * @param string     $object_type Object type (post type or taxonomy, e.g. `page`, `product`, `product_cat`).
	 * @param string|int $object_id   Source id of the object.
	 *
	 * @return string Typed key, or '' when either part is missing (archives/custom links carry id 0).
	 */
	function pixassist_starter_commerce_object_key( $object_type, $object_id ) {
		$object_type = strtolower( trim( (string) $object_type ) );
		$object_id   = trim( (string) $object_id );

		if ( '' === $object_type || '' === $object_id || '0' === $object_id ) {
			return '';
		}

		return $object_type . ':' . $object_id;
	}
}

if ( ! function_exists( 'pixassist_starter_classify_post_record' ) ) {
	/**
	 * Classify an individual imported post record (page/post/template/product/nav item/...) into a
	 * segment from the record itself. Used per-record during insertion so WooCommerce pages and
	 * templates that ship inside a `page`/`wp_template` import step are caught even though the
	 * step-level type is `base`.
	 *
	 * Never trusts a client-supplied label — classification is intrinsic to the record's post type,
	 * slug, title, owning theme taxonomy, content, and (for nav menu items) its exported target meta.
	 *
	 * @param array $post    Source post record (as returned by the SCE `/posts` endpoint).
	 * @param array $context Optional. `commerce_object_ids` => map of `"<object-type>:<source-id>"`
	 *                       keys (see pixassist_starter_commerce_object_key) for records already
	 *                       classified as commerce and skipped (e.g. shop/cart pages, products), so a
	 *                       menu item whose own slug/title is neutral but which targets one of them is
	 *                       caught — without ever colliding with an editorial term of the same id.
	 *
	 * @return string Segment id (defaults to `base`).
	 */
	function pixassist_starter_classify_post_record( $post, $context = array() ) {
		$post    = is_array( $post ) ? $post : array();
		$context = is_array( $context ) ? $context : array();

		$post_type = isset( $post['post_type'] ) ? strtolower( (string) $post['post_type'] ) : '';
		$slug      = isset( $post['post_name'] ) ? (string) $post['post_name'] : '';
		$title     = isset( $post['post_title'] ) ? (string) $post['post_title'] : '';
		$content   = isset( $post['post_content'] ) ? (string) $post['post_content'] : '';

		if ( pixassist_starter_is_commerce_post_type( $post_type ) ) {
			return 'commerce';
		}

		// Block templates owned by the WooCommerce block theme (carried via the wp_theme taxonomy).
		if ( ! empty( $post['taxonomies']['wp_theme'] ) ) {
			foreach ( (array) $post['taxonomies']['wp_theme'] as $term ) {
				if ( false !== strpos( strtolower( (string) $term ), 'woocommerce' ) ) {
					return 'commerce';
				}
			}
		}

		if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) && pixassist_starter_is_commerce_template_slug( $slug ) ) {
			return 'commerce';
		}

		// Nav menu items carry their target only in meta — their own slug/title may be neutral (e.g. an
		// empty title, or "products"). Classify by the linked object type and the linked object id.
		if ( 'nav_menu_item' === $post_type ) {
			$object    = pixassist_starter_post_meta_value( $post, '_menu_item_object' );
			$object_id = pixassist_starter_post_meta_value( $post, '_menu_item_object_id' );

			if ( pixassist_starter_is_commerce_post_type( $object ) || pixassist_starter_is_commerce_taxonomy( $object ) ) {
				return 'commerce';
			}

			// A nav item whose own slug/title is neutral (empty, or e.g. "products") but which targets a
			// skipped commerce record by id — typically the Shop page, exported as an ordinary `page`. The
			// registry is keyed by `"<object-type>:<id>"`, so a target is matched only against a skipped
			// record of the SAME object type: a base nav item pointing at category/post_tag term 18 can
			// never be dropped just because a product or product_tag term also has id 18.
			$commerce_ids = isset( $context['commerce_object_ids'] ) && is_array( $context['commerce_object_ids'] ) ? $context['commerce_object_ids'] : array();
			$object_key   = pixassist_starter_commerce_object_key( $object, $object_id );
			if ( '' !== $object_key && isset( $commerce_ids[ $object_key ] ) ) {
				return 'commerce';
			}
		}

		// Pages/posts (the WooCommerce pages themselves) and nav menu items whose own slug/title names a
		// WooCommerce page. Dropping a Shop/Cart/Checkout/My-account item keeps the free nav link-free.
		if ( in_array( $post_type, array( 'page', 'post', 'nav_menu_item' ), true ) && pixassist_starter_is_commerce_page( $slug, $title ) ) {
			return 'commerce';
		}

		if ( pixassist_starter_content_has_commerce( $content ) ) {
			return 'commerce';
		}

		return 'base';
	}
}

if ( ! function_exists( 'pixassist_starter_post_record_is_authorized' ) ) {
	/**
	 * Whether an individual post record may be imported in the current environment.
	 *
	 * @param array $post    Source post record.
	 * @param array $context Optional classification context (see pixassist_starter_classify_post_record).
	 *
	 * @return bool
	 */
	function pixassist_starter_post_record_is_authorized( $post, $context = array() ) {
		return pixassist_starter_segment_is_authorized( pixassist_starter_classify_post_record( $post, $context ) );
	}
}

if ( ! function_exists( 'pixassist_starter_segment_is_authorized' ) ) {
	/**
	 * Whether a segment is authorized to import in the current environment, using the canonical
	 * definition's requirements. Baseline/free and unknown-but-ungated segments are always authorized.
	 *
	 * @param string $segment_id Segment id.
	 *
	 * @return bool
	 */
	function pixassist_starter_segment_is_authorized( $segment_id ) {
		$segment_id  = function_exists( 'sanitize_key' ) ? sanitize_key( $segment_id ) : strtolower( (string) $segment_id );
		$definitions = pixassist_get_starter_segment_definitions();

		if ( '' === $segment_id || empty( $definitions[ $segment_id ] ) ) {
			return true;
		}

		$segment = pixassist_normalize_starter_segment( $segment_id, $definitions[ $segment_id ] );

		return ! empty( $segment['available'] );
	}
}

if ( ! function_exists( 'pixassist_starter_filter_unauthorized_settings' ) ) {
	/**
	 * Drop commerce settings keys from a settings payload when commerce isn't authorized, so a free
	 * full-demo import simply excludes WooCommerce settings while base/look settings still apply.
	 *
	 * @param array $data Settings key/value pairs.
	 *
	 * @return array Settings with unauthorized commerce keys removed.
	 */
	function pixassist_starter_filter_unauthorized_settings( $data ) {
		if ( ! is_array( $data ) || pixassist_starter_segment_is_authorized( 'commerce' ) ) {
			return is_array( $data ) ? $data : array();
		}

		foreach ( array_keys( $data ) as $key ) {
			if ( 0 === strpos( strtolower( (string) $key ), 'woocommerce_' ) ) {
				unset( $data[ $key ] );
			}
		}

		return $data;
	}
}

if ( ! function_exists( 'pixassist_starter_authorize_import' ) ) {
	/**
	 * Server-side guard for an import operation. Classifies the operation intrinsically and rejects it
	 * when it belongs to a gated segment the environment is not authorized for.
	 *
	 * @param string $type Import step type.
	 * @param array  $args Import step args.
	 *
	 * @return true|WP_Error True when authorized, WP_Error otherwise.
	 */
	function pixassist_starter_authorize_import( $type, $args = array() ) {
		$segment_id = pixassist_starter_classify_import( $type, $args );

		if ( pixassist_starter_segment_is_authorized( $segment_id ) ) {
			return true;
		}

		$message = pixassist_starter_segment_text_domain( 'This part of the starter requires a capability that is not available yet.' );

		if ( 'commerce' === $segment_id ) {
			$message = pixassist_starter_segment_text_domain( 'WooCommerce content requires WooCommerce to be active and the Pixelgrade Plus WooCommerce integration.' );
		}

		if ( class_exists( 'WP_Error' ) ) {
			return new WP_Error(
				'gated_segment_unavailable',
				$message,
				array( 'segment' => $segment_id )
			);
		}

		return new WP_Error();
	}
}
