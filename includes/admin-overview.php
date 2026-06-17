<?php
/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's landing tab (#44).
 *
 * Overview is the free landing surface: it shows the active theme / FSE status, a few quick links
 * into the design tools (the Site Editor for block themes, the Customizer for classic ones) and the
 * sibling hub tabs (Starter Sites, Help) when present, and a Pixelgrade Plus discovery/manage card
 * driven by the 4-key `pixassist_get_plus_status()` read (Assistant only READS Plus's status — it
 * never owns license/commercial logic).
 *
 * The React tab (admin/src-modern/hub/tabs/Overview.js) is presentational; the logic + copy live
 * here so they stay testable (tests/admin-overview-test.php) and so URLs/capabilities/strings have a
 * single source of truth. The payload is localized as `window.pixelgradeOverview` on the hub page.
 *
 * Function-style, mirroring includes/admin-hub.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_overview_tab' ) ) {
	/**
	 * Register the free Overview tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * Hooked onto `pixelgrade/admin_hub/tabs` (the #42 registry). The Overview tab sorts first
	 * (order 0), is free (no upsell gate), is access-controlled by the theme-options capability
	 * (matching the hub page itself), and binds the `overview` JS component.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Overview tab appended.
	 */
	function pixassist_register_overview_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'overview',
			'label'      => esc_html__( 'Overview', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'overview',
			'gate'       => '',
			'order'      => 0,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_overview_data' ) ) {
	/**
	 * Build the bootstrap payload the Overview tab renders.
	 *
	 * @return array {
	 *     @type array $theme   Active theme status: name, version, isBlockTheme (bool), screenshot.
	 *     @type array $links   Ordered quick links ({ id, label, url, primary }). The first is the
	 *                          canvas link (Site Editor for block themes, else the Customizer);
	 *                          Starter Sites / Help resolve to hub deep links.
	 *     @type array $plus    Pixelgrade Plus discovery card derived from the 4-key status read:
	 *                          state (discover|setup|manage), label, description, url, productLabel,
	 *                          isActive (bool), isLicensed (bool).
	 *     @type array $account Host pixelgrade.com account identity (read-only; see
	 *                          pixassist_get_account()). Rendered only when connected.
	 * }
	 */
	function pixassist_get_overview_data() {
		$hub        = pixassist_get_admin_hub_data();
		$tabs       = isset( $hub['tabs'] ) ? $hub['tabs'] : array();
		$base_url   = isset( $hub['baseUrl'] ) ? $hub['baseUrl'] : '';
		$is_block   = function_exists( 'wp_is_block_theme' ) ? (bool) wp_is_block_theme() : false;

		return array(
			'theme'   => pixassist_get_overview_theme( $is_block ),
			'links'   => pixassist_get_overview_links( $tabs, $base_url, $is_block ),
			'plus'    => pixassist_get_overview_plus_card(),
			'account' => function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_theme' ) ) {
	/**
	 * Read the active theme's display status. Best-effort + WP-guarded so it degrades gracefully.
	 *
	 * @param bool $is_block_theme Whether the active theme is a block (FSE) theme.
	 *
	 * @return array { name, version, isBlockTheme, screenshot }
	 */
	function pixassist_get_overview_theme( $is_block_theme ) {
		$name    = '';
		$version = '';
		$shot    = '';

		// Prefer the original (WUpdates) theme name Assistant already resolves for Pixelgrade themes.
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_original_theme_name' ) ) {
			$name = (string) PixelgradeAssistant_Admin::get_original_theme_name();
		}

		if ( function_exists( 'wp_get_theme' ) ) {
			$template   = function_exists( 'get_template' ) ? get_template() : '';
			$theme_obj  = $template ? wp_get_theme( $template ) : wp_get_theme();

			if ( is_object( $theme_obj ) && method_exists( $theme_obj, 'get' ) ) {
				if ( '' === $name ) {
					$name = (string) $theme_obj->get( 'Name' );
				}
				$version = (string) $theme_obj->get( 'Version' );

				if ( method_exists( $theme_obj, 'get_screenshot' ) ) {
					$screenshot = $theme_obj->get_screenshot();
					$shot       = $screenshot ? (string) $screenshot : '';
				}
			}
		}

		return array(
			'name'         => $name,
			'version'      => $version,
			'isBlockTheme' => (bool) $is_block_theme,
			'screenshot'   => $shot,
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_links' ) ) {
	/**
	 * Assemble the Overview quick links.
	 *
	 * The first link is the canvas entry point — where design actually happens (the Site Editor for
	 * block themes, the Customizer for classic ones). Then the sibling Starter Sites / Help hub tabs
	 * resolve to in-hub `?tab=` deep links.
	 *
	 * @param array  $tabs     Normalized hub tabs (from pixassist_get_admin_hub_data()).
	 * @param string $base_url Hub page URL (carries `?page=pixelgrade`), for `&tab=` deep links.
	 * @param bool   $is_block Whether the active theme is a block (FSE) theme.
	 *
	 * @return array[] Ordered quick links: { id, label, url, primary }.
	 */
	function pixassist_get_overview_links( $tabs, $base_url, $is_block ) {
		$links = array();

		// 1. Canvas link — the primary CTA, always present.
		if ( $is_block ) {
			$links[] = array(
				'id'      => 'site-editor',
				'label'   => esc_html__( 'Edit Styles', '__plugin_txtd' ),
				'url'     => admin_url( 'site-editor.php?path=%2Fwp_global_styles' ),
				'primary' => true,
			);
		} else {
			$links[] = array(
				'id'      => 'customize',
				'label'   => esc_html__( 'Edit Styles', '__plugin_txtd' ),
				'url'     => admin_url( 'customize.php' ),
				'primary' => true,
			);
		}

		// 2. Starter Sites — only when the sibling tab is registered.
		$starter = pixassist_find_overview_tab( $tabs, array( 'starter-sites', 'starter', 'starters' ) );
		if ( $starter ) {
			$links[] = array(
				'id'      => 'starter-sites',
				'label'   => esc_html__( 'Browse Starter Sites', '__plugin_txtd' ),
				'url'     => pixassist_overview_tab_url( $starter, $base_url ),
				'primary' => false,
			);
		}

		// 3. Help — the Help hub tab when present, else a stable hub deep link.
		$help = pixassist_find_overview_tab( $tabs, array( 'help' ) );
		if ( $help ) {
			$links[] = array(
				'id'      => 'help',
				'label'   => esc_html__( 'Get Help', '__plugin_txtd' ),
				'url'     => pixassist_overview_tab_url( $help, $base_url ),
				'primary' => false,
			);
		} else {
			$links[] = array(
				'id'      => 'help',
				'label'   => esc_html__( 'Get Help', '__plugin_txtd' ),
				'url'     => $base_url . '&tab=help',
				'primary' => false,
			);
		}

		return $links;
	}
}

if ( ! function_exists( 'pixassist_find_overview_tab' ) ) {
	/**
	 * Find the first hub tab whose id is in the given set (never the Overview tab itself).
	 *
	 * @param array    $tabs Normalized hub tabs.
	 * @param string[] $ids  Candidate ids to match (first match wins).
	 *
	 * @return array|null The matched tab descriptor, or null.
	 */
	function pixassist_find_overview_tab( $tabs, $ids ) {
		foreach ( (array) $tabs as $tab ) {
			if ( isset( $tab['id'] ) && 'overview' !== $tab['id'] && in_array( $tab['id'], $ids, true ) ) {
				return $tab;
			}
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_overview_tab_url' ) ) {
	/**
	 * Resolve a hub tab to a navigable URL: its own link-out `url`, or the in-hub `&tab=` deep link.
	 *
	 * @param array  $tab      Normalized hub tab descriptor.
	 * @param string $base_url Hub page URL (carries `?page=pixelgrade`).
	 *
	 * @return string
	 */
	function pixassist_overview_tab_url( $tab, $base_url ) {
		if ( ! empty( $tab['url'] ) ) {
			return (string) $tab['url'];
		}

		return $base_url . '&tab=' . $tab['id'];
	}
}

if ( ! function_exists( 'pixassist_get_overview_plus_card' ) ) {
	/**
	 * Derive the Pixelgrade Plus discovery/manage card from the 4-key status read.
	 *
	 * Three states (Plus is the source of truth via `pixelgrade_assistant_plus_status`; Assistant
	 * only reads): discover (Plus absent — link to the shop), setup (installed, unlicensed — link to
	 * its settings to activate), manage (active + licensed — link to its settings). Copy mirrors the
	 * classic dashboard's Plus card (includes/default-plugin-config.php) for consistency.
	 *
	 * @return array { state, label, description, url, productLabel, isActive, isLicensed }
	 */
	function pixassist_get_overview_plus_card() {
		$status = pixassist_get_plus_status();

		$product_label = ! empty( $status['plus_product_label'] ) ? (string) $status['plus_product_label'] : 'Pixelgrade Plus';
		$settings_url  = ! empty( $status['plus_settings_url'] ) ? (string) $status['plus_settings_url'] : '';
		$shop_base     = defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE' ) ? PIXELGRADE_ASSISTANT__SHOP_BASE : 'https://pixelgrade.com/';
		$discover_url  = trailingslashit( $shop_base ) . 'plus/';

		if ( empty( $status['is_plus_active'] ) ) {
			$card = array(
				'state'       => 'discover',
				'label'       => esc_html__( 'Explore Pixelgrade Plus', '__plugin_txtd' ),
				'description' => esc_html__( 'Unlock advanced design tools, starter sites, and premium support for your Pixelgrade site.', '__plugin_txtd' ),
				'url'         => $discover_url,
			);
		} elseif ( empty( $status['is_plus_licensed'] ) ) {
			$card = array(
				'state'       => 'setup',
				'label'       => esc_html__( 'Set up Pixelgrade Plus', '__plugin_txtd' ),
				'description' => esc_html__( 'Pixelgrade Plus is installed. Activate it to unlock its advanced design tools.', '__plugin_txtd' ),
				'url'         => '' !== $settings_url ? $settings_url : $discover_url,
			);
		} else {
			$card = array(
				'state'       => 'manage',
				'label'       => esc_html__( 'Manage Pixelgrade Plus', '__plugin_txtd' ),
				'description' => esc_html__( 'Pixelgrade Plus is active. Manage your advanced design tools and settings.', '__plugin_txtd' ),
				'url'         => '' !== $settings_url ? $settings_url : $discover_url,
			);
		}

		$card['productLabel'] = $product_label;
		$card['isActive']     = ! empty( $status['is_plus_active'] );
		$card['isLicensed']   = ! empty( $status['is_plus_licensed'] );

		return $card;
	}
}

// Register the free Overview tab on the hub registry (function-style modules wire filters at load,
// the equivalent of a class module hooking in its constructor). add_filter is always available by
// the time plugin files load.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
}
