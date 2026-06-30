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
			'label'      => esc_html__( 'Home', '__plugin_txtd' ),
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
			'theme'      => pixassist_get_overview_theme( $is_block ),
			'links'      => pixassist_get_overview_links( $tabs, $base_url, $is_block ),
			'plus'       => pixassist_get_overview_plus_card(),
			'account'    => function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false ),
			'onboarding' => pixassist_get_onboarding_data( $base_url ),
			'stateSummary' => pixassist_get_overview_state_summary( $tabs, $base_url, $is_block ),
			'nextAction'   => pixassist_get_overview_next_action( $tabs, $base_url, $is_block ),
			'safety'       => pixassist_get_overview_safety_notes(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_state_summary' ) ) {
	/**
	 * Build the compact command-center state summary for Home.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 * @param bool   $is_block Whether the active theme is a block theme.
	 *
	 * @return array[] Summary items: id, label, value, detail, tone, url.
	 */
	function pixassist_get_overview_state_summary( $tabs, $base_url, $is_block ) {
		$theme         = pixassist_get_overview_theme( $is_block );
		$account       = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false );
		$plus          = pixassist_get_overview_plus_card();
		$plugin_state  = pixassist_get_overview_plugin_state();
		$starter_state = pixassist_get_overview_starter_state();
		$layout_state  = pixassist_get_overview_layout_state( $starter_state );
		$content_state = pixassist_get_overview_content_state( $starter_state );
		$content_tab   = pixassist_find_overview_tab( $tabs, array( 'content' ) );

		$theme_value = ! empty( $theme['name'] ) ? (string) $theme['name'] : esc_html__( 'Active theme', '__plugin_txtd' );
		if ( ! empty( $theme['version'] ) ) {
			$theme_value .= ' ' . sprintf(
				/* translators: %s: theme version number. */
				esc_html__( 'v%s', '__plugin_txtd' ),
				(string) $theme['version']
			);
		}

		return array(
			array(
				'id'     => 'theme',
				'label'  => esc_html__( 'Theme', '__plugin_txtd' ),
				'value'  => $theme_value,
				'detail' => ! empty( $theme['isBlockTheme'] ) ? esc_html__( 'Block theme editing is available.', '__plugin_txtd' ) : esc_html__( 'Classic theme editing is available.', '__plugin_txtd' ),
				'tone'   => 'ok',
				'url'    => pixassist_get_styles_url( $is_block ),
			),
			array(
				'id'     => 'account',
				'label'  => esc_html__( 'Account', '__plugin_txtd' ),
				'value'  => ! empty( $account['is_connected'] ) ? esc_html__( 'Connected', '__plugin_txtd' ) : esc_html__( 'Not connected', '__plugin_txtd' ),
				'detail' => ! empty( $account['is_connected'] ) ? pixassist_get_overview_account_label( $account ) : esc_html__( 'Connect for support and account services.', '__plugin_txtd' ),
				'tone'   => ! empty( $account['is_connected'] ) ? 'ok' : 'neutral',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'account' ),
			),
			array(
				'id'     => 'plus',
				'label'  => ! empty( $plus['productLabel'] ) ? $plus['productLabel'] : 'Pixelgrade Plus',
				'value'  => pixassist_get_overview_plus_state_label( $plus ),
				'detail' => pixassist_get_overview_plus_state_detail( $plus ),
				'tone'   => ! empty( $plus['isLicensed'] ) ? 'ok' : 'neutral',
				'url'    => ! empty( $plus['url'] ) ? $plus['url'] : '',
			),
			array(
				'id'     => 'setup',
				'label'  => esc_html__( 'Setup', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_plugin_state_value( $plugin_state ),
				'detail' => pixassist_get_overview_plugin_state_detail( $plugin_state ),
				'tone'   => $plugin_state['ready'] ? 'ok' : 'needs-attention',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'plugins' ),
			),
			array(
				'id'     => 'starter',
				'label'  => esc_html__( 'Starter', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_starter_state_value( $starter_state ),
				'detail' => pixassist_get_overview_starter_state_detail( $starter_state ),
				'tone'   => $starter_state['has_imported'] ? 'ok' : 'neutral',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'starter-sites' ),
			),
			array(
				'id'     => 'layouts',
				'label'  => esc_html__( 'Layouts', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_count_label( $layout_state['count'], esc_html__( 'applied', '__plugin_txtd' ), esc_html__( 'applied', '__plugin_txtd' ) ),
				'detail' => $layout_state['count'] > 0 ? esc_html__( 'Applied frames can be replaced or removed.', '__plugin_txtd' ) : esc_html__( 'No individual layouts applied yet.', '__plugin_txtd' ),
				'tone'   => $layout_state['count'] > 0 ? 'ok' : 'neutral',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'layouts' ),
			),
			array(
				'id'     => 'content',
				'label'  => esc_html__( 'Content', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_content_state_value( $content_state ),
				'detail' => pixassist_get_overview_content_state_detail( $content_state ),
				'tone'   => $content_state['count'] > 0 ? 'ok' : 'neutral',
				'url'    => $content_tab ? pixassist_overview_tab_url( $content_tab, $base_url ) : '',
			),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_next_action' ) ) {
	/**
	 * Choose the single highest-priority Home recommendation from current state.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 * @param bool   $is_block Whether the active theme is a block theme.
	 *
	 * @return array { id, label, title, description, url, safety, kind }.
	 */
	function pixassist_get_overview_next_action( $tabs, $base_url, $is_block ) {
		$plugin_state  = pixassist_get_overview_plugin_state();
		$starter_state = pixassist_get_overview_starter_state();
		$layout_state  = pixassist_get_overview_layout_state( $starter_state );
		$account       = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false );
		$plus          = pixassist_get_overview_plus_card();
		$content_tab   = pixassist_find_overview_tab( $tabs, array( 'content' ) );

		if ( ! $plugin_state['ready'] ) {
			return array(
				'id'          => 'setup',
				'kind'        => 'setup',
				'label'       => esc_html__( 'Review setup', '__plugin_txtd' ),
				'title'       => esc_html__( 'Finish the required setup first', '__plugin_txtd' ),
				'description' => esc_html__( 'One or more recommended plugins still need attention before the design tools can work as intended.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'plugins' ),
				'safety'      => esc_html__( 'This only installs or activates plugins. It does not import content or change your pages.', '__plugin_txtd' ),
			);
		}

		if ( ! $starter_state['has_imported'] && $starter_state['starters_count'] > 0 ) {
			return array(
				'id'          => 'starter',
				'kind'        => 'starter',
				'label'       => esc_html__( 'Choose a starter site', '__plugin_txtd' ),
				'title'       => esc_html__( 'Start from a complete direction', '__plugin_txtd' ),
				'description' => esc_html__( 'Your site has starter options available. Pick one when you want a full content and design baseline.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'starter-sites' ),
				'safety'      => esc_html__( 'Starter content can be reset from Tools; account and license data stay untouched.', '__plugin_txtd' ),
			);
		}

		if ( $starter_state['has_imported'] && $content_tab ) {
			return array(
				'id'          => 'content',
				'kind'        => 'content',
				'label'       => esc_html__( 'Add a page pattern', '__plugin_txtd' ),
				'title'       => esc_html__( 'Build the next page from a pattern', '__plugin_txtd' ),
				'description' => esc_html__( 'A starter is already in place. Add a focused page pattern next instead of importing another full site.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url( $content_tab, $base_url ),
				'safety'      => esc_html__( 'Page patterns add focused content and can be removed like normal WordPress pages.', '__plugin_txtd' ),
			);
		}

		if ( 0 === $layout_state['count'] && pixassist_find_overview_tab( $tabs, array( 'layouts' ) ) ) {
			return array(
				'id'          => 'layouts',
				'kind'        => 'layouts',
				'label'       => esc_html__( 'Browse layouts', '__plugin_txtd' ),
				'title'       => esc_html__( 'Try one reusable layout', '__plugin_txtd' ),
				'description' => esc_html__( 'Apply a header, footer, or template without importing a whole starter site.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'layouts' ),
				'safety'      => esc_html__( 'Layouts are journaled and can be replaced or removed from the Layouts tab.', '__plugin_txtd' ),
			);
		}

		if ( empty( $account['is_connected'] ) ) {
			return array(
				'id'          => 'account',
				'kind'        => 'account',
				'label'       => esc_html__( 'Connect account', '__plugin_txtd' ),
				'title'       => esc_html__( 'Connect for support', '__plugin_txtd' ),
				'description' => esc_html__( 'Connect a pixelgrade.com account so support and account services know this site.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'account' ),
				'safety'      => esc_html__( 'Assistant stores account identity separately from Plus license state.', '__plugin_txtd' ),
			);
		}

		if ( ! empty( $plus['url'] ) && ! empty( $plus['isActive'] ) && empty( $plus['isLicensed'] ) ) {
			return array(
				'id'          => 'plus',
				'kind'        => 'plus',
				'label'       => ! empty( $plus['label'] ) ? $plus['label'] : esc_html__( 'Set up Pixelgrade Plus', '__plugin_txtd' ),
				'title'       => esc_html__( 'Unlock premium features', '__plugin_txtd' ),
				'description' => esc_html__( 'Pixelgrade Plus is installed but not licensed yet. Activate it when you are ready to use its premium features on top of your free Pixelgrade theme.', '__plugin_txtd' ),
				'url'         => $plus['url'],
				'safety'      => esc_html__( 'Pixelgrade Plus handles its own licensing — this just takes you there.', '__plugin_txtd' ),
			);
		}

		if ( pixassist_find_overview_tab( $tabs, array( 'styles' ) ) ) {
			return array(
				'id'          => 'styles',
				'kind'        => 'styles',
				'label'       => esc_html__( 'Refine styles', '__plugin_txtd' ),
				'title'       => esc_html__( 'Tune the design system', '__plugin_txtd' ),
				'description' => esc_html__( 'Adjust colors, typography, and spacing after the site structure is in place.', '__plugin_txtd' ),
				'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'styles' ),
				'safety'      => esc_html__( 'Style changes stay in WordPress design settings and can be adjusted again later.', '__plugin_txtd' ),
			);
		}

		if ( ! empty( $plus['url'] ) && ( empty( $plus['isActive'] ) || empty( $plus['isLicensed'] ) ) ) {
			return array(
				'id'          => 'plus',
				'kind'        => 'plus',
				'label'       => ! empty( $plus['label'] ) ? $plus['label'] : esc_html__( 'Explore Pixelgrade Plus', '__plugin_txtd' ),
				'title'       => esc_html__( 'See what Plus unlocks', '__plugin_txtd' ),
				'description' => esc_html__( 'Pixelgrade Plus adds premium features on top of your free Pixelgrade theme.', '__plugin_txtd' ),
				'url'         => $plus['url'],
				'safety'      => esc_html__( 'Exploring Plus does not change anything on your site.', '__plugin_txtd' ),
			);
		}

		return array(
			'id'          => 'help',
			'kind'        => 'help',
			'label'       => esc_html__( 'Get help', '__plugin_txtd' ),
			'title'       => esc_html__( 'Find the next answer', '__plugin_txtd' ),
			'description' => esc_html__( 'Open documentation and support when you need guidance for this site.', '__plugin_txtd' ),
			'url'         => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'help' ),
			'safety'      => esc_html__( 'Support requests include site context so the team can answer faster.', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_safety_notes' ) ) {
	/**
	 * Shared Home safety/reversibility notes.
	 *
	 * @return array
	 */
	function pixassist_get_overview_safety_notes() {
		return array(
			'title' => esc_html__( 'What is safe to change', '__plugin_txtd' ),
			'items' => array(
				esc_html__( 'Starter imports are tracked and can be reset from Tools without disconnecting your account.', '__plugin_txtd' ),
				esc_html__( 'Individual layouts are tracked, so they can be replaced or removed later.', '__plugin_txtd' ),
				esc_html__( 'Color, font, and spacing changes live in your WordPress design settings and can be adjusted again anytime.', '__plugin_txtd' ),
			),
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

		// 1. Design System — prefer the in-hub section; fall back to the native style surface.
		$styles = pixassist_find_overview_tab( $tabs, array( 'styles' ) );
		if ( $styles ) {
			$links[] = array(
				'id'      => 'styles',
				'label'   => esc_html__( 'Open Design System', '__plugin_txtd' ),
				'url'     => pixassist_overview_tab_url( $styles, $base_url ),
				'primary' => true,
			);
		} elseif ( $is_block ) {
			$links[] = array(
				'id'      => 'site-editor',
				'label'   => esc_html__( 'Open Style Manager', '__plugin_txtd' ),
				'url'     => pixassist_get_styles_url( true ),
				'primary' => true,
			);
		} else {
			$links[] = array(
				'id'      => 'customize',
				'label'   => esc_html__( 'Open Style Manager', '__plugin_txtd' ),
				'url'     => pixassist_get_styles_url( false ),
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

if ( ! function_exists( 'pixassist_overview_tab_url_by_id' ) ) {
	/**
	 * Resolve a hub tab id to a URL, with a stable deep-link fallback.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 * @param string $id       Tab id.
	 *
	 * @return string
	 */
	function pixassist_overview_tab_url_by_id( $tabs, $base_url, $id ) {
		$tab = pixassist_find_overview_tab( $tabs, array( $id ) );
		if ( $tab ) {
			return pixassist_overview_tab_url( $tab, $base_url );
		}

		return (string) $base_url . '&tab=' . sanitize_key( $id );
	}
}

if ( ! function_exists( 'pixassist_get_overview_content_url' ) ) {
	/**
	 * Return the shared Page Patterns route.
	 *
	 * @return string
	 */
	function pixassist_get_overview_content_url() {
		return function_exists( 'admin_url' )
			? admin_url( 'admin.php?page=pixelgrade&tab=content' )
			: 'admin.php?page=pixelgrade&tab=content';
	}
}

if ( ! function_exists( 'pixassist_get_overview_plugin_state' ) ) {
	/**
	 * Summarize recommended plugin readiness.
	 *
	 * @return array
	 */
	function pixassist_get_overview_plugin_state() {
		$data    = function_exists( 'pixassist_get_plugins_data' ) ? pixassist_get_plugins_data() : array();
		$plugins = isset( $data['plugins'] ) && is_array( $data['plugins'] ) ? $data['plugins'] : array();
		$total   = count( $plugins );
		$ready   = 0;

		foreach ( $plugins as $plugin ) {
			$status = isset( $plugin['status'] ) ? (string) $plugin['status'] : '';
			if ( 'active' === $status || 'outdated' === $status || ! empty( $plugin['isActive'] ) ) {
				$ready++;
			}
		}

		return array(
			'total'   => $total,
			'ready'   => 0 === $total || $ready === $total,
			'readyCount' => $ready,
			'pending' => max( 0, $total - $ready ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_plugin_state_value' ) ) {
	/**
	 * Build the plugin readiness value string.
	 *
	 * @param array $state Plugin state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_plugin_state_value( $state ) {
		if ( empty( $state['total'] ) ) {
			return esc_html__( 'No plugin requirements', '__plugin_txtd' );
		}

		if ( ! empty( $state['ready'] ) ) {
			return esc_html__( 'All ready', '__plugin_txtd' );
		}

		return sprintf(
			/* translators: 1: ready plugin count, 2: total plugin count. */
			esc_html__( '%1$d of %2$d ready', '__plugin_txtd' ),
			(int) $state['readyCount'],
			(int) $state['total']
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_plugin_state_detail' ) ) {
	/**
	 * Build plugin readiness detail.
	 *
	 * @param array $state Plugin state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_plugin_state_detail( $state ) {
		if ( empty( $state['total'] ) ) {
			return esc_html__( 'No recommended plugins are required for this theme.', '__plugin_txtd' );
		}

		if ( ! empty( $state['ready'] ) ) {
			return esc_html__( 'Recommended plugins are installed and active.', '__plugin_txtd' );
		}

		return sprintf(
			/* translators: %d: number of plugins needing setup. */
			esc_html__( '%d plugin needs setup.', '__plugin_txtd' ),
			(int) $state['pending']
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_starter_state' ) ) {
	/**
	 * Summarize starter/import state.
	 *
	 * @return array
	 */
	function pixassist_get_overview_starter_state() {
		$data       = function_exists( 'pixassist_get_starter_sites_data' ) ? pixassist_get_starter_sites_data() : array();
		$starters   = isset( $data['starters'] ) && is_array( $data['starters'] ) ? $data['starters'] : array();
		$imported   = isset( $data['imported'] ) && is_array( $data['imported'] ) ? $data['imported'] : array();
		$applied    = isset( $data['applied'] ) && is_array( $data['applied'] ) ? $data['applied'] : array();
		$analysis   = isset( $data['siteAnalysis'] ) && is_array( $data['siteAnalysis'] ) ? $data['siteAnalysis'] : array();
		$active_id  = ! empty( $applied['activeStarter'] ) ? sanitize_key( $applied['activeStarter'] ) : '';
		$active_id  = '' !== $active_id ? $active_id : pixassist_get_overview_last_imported_starter_id( $imported );

		return array(
			'starters_count' => count( $starters ),
			'has_imported'   => ! empty( $imported ) || '' !== $active_id,
			'active_id'      => $active_id,
			'active_title'   => pixassist_get_overview_starter_title( $starters, $active_id ),
			'imported_count' => count( $imported ),
			'content_count'  => isset( $analysis['contentCount'] ) ? (int) $analysis['contentCount'] : 0,
			'classification' => isset( $analysis['classification'] ) ? sanitize_key( $analysis['classification'] ) : '',
			'applied'        => $applied,
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_last_imported_starter_id' ) ) {
	/**
	 * Return the last imported starter id from the import journal.
	 *
	 * @param array $imported Imported starter journal.
	 *
	 * @return string
	 */
	function pixassist_get_overview_last_imported_starter_id( $imported ) {
		$last = '';
		foreach ( (array) $imported as $key => $entry ) {
			if ( is_array( $entry ) ) {
				$last = (string) $key;
			}
		}

		return sanitize_key( $last );
	}
}

if ( ! function_exists( 'pixassist_get_overview_starter_title' ) ) {
	/**
	 * Resolve a starter id to a display title.
	 *
	 * @param array  $starters  Starter descriptors.
	 * @param string $active_id Active starter id.
	 *
	 * @return string
	 */
	function pixassist_get_overview_starter_title( $starters, $active_id ) {
		foreach ( (array) $starters as $starter ) {
			if ( ! is_array( $starter ) || empty( $starter['id'] ) || sanitize_key( $starter['id'] ) !== $active_id ) {
				continue;
			}

			return ! empty( $starter['title'] ) ? (string) $starter['title'] : $active_id;
		}

		return $active_id;
	}
}

if ( ! function_exists( 'pixassist_get_overview_starter_state_value' ) ) {
	/**
	 * Build the starter state value.
	 *
	 * @param array $state Starter state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_starter_state_value( $state ) {
		if ( ! empty( $state['has_imported'] ) ) {
			$title = ! empty( $state['active_title'] ) ? (string) $state['active_title'] : esc_html__( 'Starter', '__plugin_txtd' );

			return sprintf(
				/* translators: %s: starter site title. */
				esc_html__( '%s applied', '__plugin_txtd' ),
				$title
			);
		}

		if ( ! empty( $state['starters_count'] ) ) {
			return esc_html__( 'Ready to choose', '__plugin_txtd' );
		}

		return esc_html__( 'No starters available', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_starter_state_detail' ) ) {
	/**
	 * Build the starter state detail.
	 *
	 * @param array $state Starter state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_starter_state_detail( $state ) {
		if ( ! empty( $state['has_imported'] ) ) {
			return esc_html__( 'Imported starter content is tracked for reset and cleanup.', '__plugin_txtd' );
		}

		if ( ! empty( $state['starters_count'] ) ) {
			return esc_html__( 'Starter sites can add content, media, layouts, and design settings.', '__plugin_txtd' );
		}

		return esc_html__( 'This theme does not expose starter sites.', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_layout_state' ) ) {
	/**
	 * Summarize applied layout-unit state.
	 *
	 * @param array $starter_state Starter state.
	 *
	 * @return array
	 */
	function pixassist_get_overview_layout_state( $starter_state ) {
		$layout_data = function_exists( 'pixassist_get_layout_units_data' ) ? pixassist_get_layout_units_data() : array();
		$applied     = isset( $layout_data['applied'] ) && is_array( $layout_data['applied'] ) ? $layout_data['applied'] : array();

		if ( empty( $applied ) && ! empty( $starter_state['applied']['layoutUnits'] ) && is_array( $starter_state['applied']['layoutUnits'] ) ) {
			$applied = $starter_state['applied']['layoutUnits'];
		}

		return array(
			'count'   => count( $applied ),
			'applied' => $applied,
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_content_state' ) ) {
	/**
	 * Summarize visible content state when known.
	 *
	 * @param array $starter_state Starter state.
	 *
	 * @return array
	 */
	function pixassist_get_overview_content_state( $starter_state ) {
		return array(
			'count'          => isset( $starter_state['content_count'] ) ? (int) $starter_state['content_count'] : 0,
			'has_imported'   => ! empty( $starter_state['has_imported'] ),
			'classification' => isset( $starter_state['classification'] ) ? (string) $starter_state['classification'] : '',
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_content_state_value' ) ) {
	/**
	 * Build the content state value.
	 *
	 * @param array $state Content state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_content_state_value( $state ) {
		if ( ! empty( $state['count'] ) ) {
			return pixassist_get_overview_count_label( (int) $state['count'], esc_html__( 'item present', '__plugin_txtd' ), esc_html__( 'items present', '__plugin_txtd' ) );
		}

		if ( ! empty( $state['has_imported'] ) ) {
			return esc_html__( 'Starter content present', '__plugin_txtd' );
		}

		return esc_html__( 'No imported content', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_content_state_detail' ) ) {
	/**
	 * Build the content state detail.
	 *
	 * @param array $state Content state.
	 *
	 * @return string
	 */
	function pixassist_get_overview_content_state_detail( $state ) {
		if ( ! empty( $state['has_imported'] ) ) {
			return esc_html__( 'Add focused page patterns without replacing the whole site.', '__plugin_txtd' );
		}

		return esc_html__( 'Page Patterns can add focused pages after your baseline is ready.', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_count_label' ) ) {
	/**
	 * Build a simple count label.
	 *
	 * @param int    $count    Count.
	 * @param string $singular Singular noun phrase.
	 * @param string $plural   Plural noun phrase.
	 *
	 * @return string
	 */
	function pixassist_get_overview_count_label( $count, $singular, $plural ) {
		if ( 1 === (int) $count ) {
			return sprintf(
				/* translators: 1: count, 2: singular item label. */
				esc_html__( '%1$d %2$s', '__plugin_txtd' ),
				(int) $count,
				$singular
			);
		}

		return sprintf(
			/* translators: 1: count, 2: plural item label. */
			esc_html__( '%1$d %2$s', '__plugin_txtd' ),
			(int) $count,
			$plural
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_account_label' ) ) {
	/**
	 * Build account detail label.
	 *
	 * @param array $account Account payload.
	 *
	 * @return string
	 */
	function pixassist_get_overview_account_label( $account ) {
		$name = '';
		foreach ( array( 'display_name', 'user_login', 'email' ) as $key ) {
			if ( ! empty( $account[ $key ] ) ) {
				$name = (string) $account[ $key ];
				break;
			}
		}

		if ( '' === $name ) {
			return esc_html__( 'Pixelgrade account is connected.', '__plugin_txtd' );
		}

		return sprintf(
			/* translators: %s: account display name, login, or email. */
			esc_html__( 'Connected as %s.', '__plugin_txtd' ),
			$name
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_plus_state_label' ) ) {
	/**
	 * Build Plus state label.
	 *
	 * @param array $plus Plus card data.
	 *
	 * @return string
	 */
	function pixassist_get_overview_plus_state_label( $plus ) {
		if ( ! empty( $plus['isLicensed'] ) ) {
			return esc_html__( 'Licensed', '__plugin_txtd' );
		}

		if ( ! empty( $plus['isActive'] ) ) {
			return esc_html__( 'Installed, not licensed', '__plugin_txtd' );
		}

		return esc_html__( 'Available', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_plus_state_detail' ) ) {
	/**
	 * Build Plus state detail.
	 *
	 * @param array $plus Plus card data.
	 *
	 * @return string
	 */
	function pixassist_get_overview_plus_state_detail( $plus ) {
		if ( ! empty( $plus['isLicensed'] ) ) {
			return esc_html__( 'Premium features are unlocked on this site.', '__plugin_txtd' );
		}

		if ( ! empty( $plus['isActive'] ) ) {
			return esc_html__( 'Activate a license to unlock premium features.', '__plugin_txtd' );
		}

		return esc_html__( 'Premium features can extend your free Pixelgrade theme.', '__plugin_txtd' );
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
		$account_url   = admin_url( 'themes.php?page=pixelgrade&tab=account&section=plus' );

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
				'url'         => '' !== $settings_url ? $settings_url : $account_url,
			);
		} else {
			$card = array(
				'state'       => 'manage',
				'label'       => esc_html__( 'Manage Pixelgrade Plus', '__plugin_txtd' ),
				'description' => esc_html__( 'Pixelgrade Plus is active. Manage your advanced design tools and settings.', '__plugin_txtd' ),
				'url'         => '' !== $settings_url ? $settings_url : $account_url,
			);
		}

		$card['productLabel'] = $product_label;
		$card['isActive']     = ! empty( $status['is_plus_active'] );
		$card['isLicensed']   = ! empty( $status['is_plus_licensed'] );

		return $card;
	}
}

/*
 * ---------------------------------------------------------------------------
 * Onboarding "Get started" state model (#onboarding migration, Phase 1)
 *
 * The hub-native onboarding replaces the legacy full-screen setup wizard with a guided checklist on
 * the Overview tab. This is the server-side state model only (the card UI + the activation redirect
 * land in later phases). The logic is split into PURE functions driven by injected "facts" (so it is
 * WP-free and unit-testable) plus thin, guarded fact-gathering that degrades safely when a subsystem
 * (account / starter sites / plugins) is unavailable.
 *
 * Carry-over guarantees from the wizard: the starter step is hidden when the theme exposes no demos,
 * and an off-switch (`pixassist_show_onboarding`, seeded from the legacy
 * `pixassist_allow_setup_wizard_module`) lets a theme disable onboarding entirely.
 * ---------------------------------------------------------------------------
 */

if ( ! function_exists( 'pixassist_get_onboarding_steps' ) ) {
	/**
	 * Build the ordered onboarding steps from facts. Pure: no WP calls, no side effects.
	 *
	 * @param array $facts { base_url, account_connected, demos_exist, starter_imported, plugins_ready }.
	 *
	 * @return array[] Each step: { id, title, description, url, done (bool), optional (bool) }.
	 */
	function pixassist_get_onboarding_steps( $facts ) {
		$base_url = isset( $facts['base_url'] ) ? (string) $facts['base_url'] : '';

		// Account is optional — it never blocks completion (mirrors the wizard's account gating).
		$steps = array(
			array(
				'id'          => 'account',
				'title'       => esc_html__( 'Connect your account', '__plugin_txtd' ),
				'description' => esc_html__( 'Connect a free pixelgrade.com account for support and updates. Optional.', '__plugin_txtd' ),
				'url'         => $base_url . '&tab=account',
				'done'        => ! empty( $facts['account_connected'] ),
				'optional'    => true,
			),
		);

		// Starter step only when the theme exposes demos (the wizard hides it otherwise).
		if ( ! empty( $facts['demos_exist'] ) ) {
			$steps[] = array(
				'id'          => 'starter',
				'title'       => esc_html__( 'Pick a starter site', '__plugin_txtd' ),
				'description' => esc_html__( 'Launch from a ready-made starter instead of a blank canvas.', '__plugin_txtd' ),
				'url'         => $base_url . '&tab=starter-sites',
				'done'        => ! empty( $facts['starter_imported'] ),
				'optional'    => false,
			);
		}

		$steps[] = array(
			'id'          => 'plugins',
			'title'       => esc_html__( 'Install recommended plugins', '__plugin_txtd' ),
			'description' => esc_html__( 'Add the plugins this theme is designed to use.', '__plugin_txtd' ),
			'url'         => $base_url . '&tab=plugins',
			'done'        => ! empty( $facts['plugins_ready'] ),
			'optional'    => false,
		);

		return $steps;
	}
}

if ( ! function_exists( 'pixassist_onboarding_is_complete' ) ) {
	/**
	 * Onboarding is complete when every REQUIRED (non-optional) step is done. Pure.
	 *
	 * @param array[] $steps Steps from pixassist_get_onboarding_steps().
	 *
	 * @return bool
	 */
	function pixassist_onboarding_is_complete( $steps ) {
		foreach ( (array) $steps as $step ) {
			if ( empty( $step['optional'] ) && empty( $step['done'] ) ) {
				return false;
			}
		}

		return true;
	}
}

if ( ! function_exists( 'pixassist_onboarding_enabled' ) ) {
	/**
	 * Whether onboarding is enabled. A dedicated `pixassist_show_onboarding` filter, defaulting from
	 * the legacy `pixassist_allow_setup_wizard_module` so themes that already opted out stay opted out.
	 *
	 * @return bool
	 */
	function pixassist_onboarding_enabled() {
		$legacy = (bool) apply_filters( 'pixassist_allow_setup_wizard_module', true );

		return (bool) apply_filters( 'pixassist_show_onboarding', $legacy );
	}
}

if ( ! function_exists( 'pixassist_get_onboarding_state' ) ) {
	/**
	 * Read the persisted onboarding marker from `pixassist_options['onboarding']`. Guarded so it
	 * returns safe defaults outside WordPress (tests) and before the option exists.
	 *
	 * @return array { dismissed (bool), dismissed_at (int), completed_at (int) }
	 */
	function pixassist_get_onboarding_state() {
		$defaults = array( 'dismissed' => false, 'dismissed_at' => 0, 'completed_at' => 0 );

		if ( ! function_exists( 'get_option' ) ) {
			return $defaults;
		}

		$options = get_option( 'pixassist_options' );
		$state   = ( is_array( $options ) && isset( $options['onboarding'] ) && is_array( $options['onboarding'] ) )
			? $options['onboarding']
			: array();

		return array_merge( $defaults, $state );
	}
}

if ( ! function_exists( 'pixassist_onboarding_should_show' ) ) {
	/**
	 * Whether to surface the onboarding card: enabled, not dismissed, and not yet complete. Pure.
	 *
	 * @param array[] $steps   Steps from pixassist_get_onboarding_steps().
	 * @param bool    $enabled From pixassist_onboarding_enabled().
	 * @param array   $state   From pixassist_get_onboarding_state().
	 *
	 * @return bool
	 */
	function pixassist_onboarding_should_show( $steps, $enabled, $state ) {
		if ( ! $enabled ) {
			return false;
		}

		if ( ! empty( $state['dismissed'] ) ) {
			return false;
		}

		return ! pixassist_onboarding_is_complete( $steps );
	}
}

if ( ! function_exists( 'pixassist_onboarding_demos_exist' ) ) {
	/**
	 * Whether the theme exposes any starter demos. Guarded (Starter Sites module may be absent).
	 *
	 * @return bool
	 */
	function pixassist_onboarding_demos_exist() {
		if ( ! function_exists( 'pixassist_get_starter_sites_data' ) ) {
			return false;
		}

		$data = pixassist_get_starter_sites_data();

		return ! empty( $data['starters'] ) && is_array( $data['starters'] );
	}
}

if ( ! function_exists( 'pixassist_onboarding_demos_count' ) ) {
	/**
	 * How many starter demos the theme exposes. Guarded (Starter Sites module may be absent).
	 *
	 * Drives the "Set up my site" action: 1 starter ⇒ import inline; >1 ⇒ route to the Starter Sites
	 * tab to choose (never auto-pick among multiple starters).
	 *
	 * @return int
	 */
	function pixassist_onboarding_demos_count() {
		if ( ! function_exists( 'pixassist_get_starter_sites_data' ) ) {
			return 0;
		}

		$data     = pixassist_get_starter_sites_data();
		$starters = isset( $data['starters'] ) && is_array( $data['starters'] ) ? $data['starters'] : array();

		return count( $starters );
	}
}

if ( ! function_exists( 'pixassist_onboarding_starter_imported' ) ) {
	/**
	 * Whether any starter content has been imported. Guarded.
	 *
	 * @return bool
	 */
	function pixassist_onboarding_starter_imported() {
		if ( ! function_exists( 'pixassist_get_starter_sites_data' ) ) {
			return false;
		}

		$data     = pixassist_get_starter_sites_data();
		$imported = isset( $data['imported'] ) && is_array( $data['imported'] ) ? $data['imported'] : array();

		return count( $imported ) > 0;
	}
}

if ( ! function_exists( 'pixassist_onboarding_plugins_ready' ) ) {
	/**
	 * Whether the recommended plugins are all in place — i.e. none is missing or merely installed
	 * (inactive). "outdated" still counts as active. Guarded. Empty list => nothing to install.
	 *
	 * @return bool
	 */
	function pixassist_onboarding_plugins_ready() {
		if ( ! function_exists( 'pixassist_get_plugins_data' ) ) {
			return false;
		}

		$data    = pixassist_get_plugins_data();
		$plugins = isset( $data['plugins'] ) && is_array( $data['plugins'] ) ? $data['plugins'] : array();

		if ( empty( $plugins ) ) {
			return true;
		}

		foreach ( $plugins as $plugin ) {
			$status = isset( $plugin['status'] ) ? $plugin['status'] : 'missing';
			if ( 'active' !== $status && 'outdated' !== $status ) {
				return false;
			}
		}

		return true;
	}
}

if ( ! function_exists( 'pixassist_get_onboarding_facts' ) ) {
	/**
	 * Gather the onboarding facts behind guards so the Overview payload degrades gracefully.
	 *
	 * @param string $base_url Hub page URL (carries `?page=pixelgrade`).
	 *
	 * @return array Facts consumed by pixassist_get_onboarding_steps().
	 */
	function pixassist_get_onboarding_facts( $base_url ) {
		return array(
			'base_url'          => (string) $base_url,
			'account_connected' => function_exists( 'pixassist_is_account_connected' ) ? (bool) pixassist_is_account_connected() : false,
			'demos_exist'       => pixassist_onboarding_demos_exist(),
			'starter_imported'  => pixassist_onboarding_starter_imported(),
			'plugins_ready'     => pixassist_onboarding_plugins_ready(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_onboarding_dismiss_endpoint' ) ) {
	/**
	 * The REST descriptor the card uses to persist its dismissal (the Phase 2 WRITE path).
	 *
	 * Mirrors the starter-sites endpoint shape ({ method, url }) so the JS card hits it the same way
	 * the Starter Sites tab hits its import endpoints — with the `pixassist_nonce` from
	 * `window.pixassist.wpRest`. Guarded so it degrades to an empty URL outside WordPress (tests).
	 *
	 * @return array { method, url }
	 */
	function pixassist_get_onboarding_dismiss_endpoint() {
		return array(
			'method' => 'POST',
			'url'    => function_exists( 'rest_url' ) ? esc_url_raw( rest_url( 'pixassist/v1/onboarding_dismiss' ) ) : '',
		);
	}
}

if ( ! function_exists( 'pixassist_get_onboarding_data' ) ) {
	/**
	 * Assemble the onboarding payload the Overview tab renders.
	 *
	 * @param string $base_url Hub page URL (carries `?page=pixelgrade`), for step `&tab=` links.
	 *
	 * @return array { show, enabled, dismissed, completed, steps, demosCount, dismissEndpoint }
	 */
	function pixassist_get_onboarding_data( $base_url ) {
		$facts   = pixassist_get_onboarding_facts( $base_url );
		$steps   = pixassist_get_onboarding_steps( $facts );
		$enabled = pixassist_onboarding_enabled();
		$state   = pixassist_get_onboarding_state();

		return array(
			'show'            => pixassist_onboarding_should_show( $steps, $enabled, $state ),
			'enabled'         => $enabled,
			'dismissed'       => ! empty( $state['dismissed'] ),
			'completed'       => pixassist_onboarding_is_complete( $steps ),
			'steps'           => $steps,
			// How many starter demos exist drives the "Set up my site" action: with exactly one the
			// card imports it inline; with several it routes to the Starter Sites tab to choose (the
			// card never silently auto-picks among multiple starters — a wizard use-case).
			'demosCount'      => pixassist_onboarding_demos_count(),
			'dismissEndpoint' => pixassist_get_onboarding_dismiss_endpoint(),
		);
	}
}

// Register the free Overview tab on the hub registry (function-style modules wire filters at load,
// the equivalent of a class module hooking in its constructor). add_filter is always available by
// the time plugin files load.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_overview_tab' );
}
