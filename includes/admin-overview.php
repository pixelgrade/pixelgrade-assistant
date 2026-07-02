<?php
/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's landing tab (#44).
 *
 * Home is deliberately calm: one onboarding spotlight (the Get Started checklist, server-modeled
 * below), one "At a glance" status card (a few quiet label/value rows + quick actions into the
 * sibling tabs), and a small Pixelgrade Plus invitation only while Plus is not installed. The
 * Plus state is the 4-key `pixassist_get_plus_status()` read (Assistant only READS Plus's status —
 * it never owns license/commercial logic).
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
	 *                          Design Library / Help resolve to hub deep links.
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

		$onboarding = pixassist_get_onboarding_data( $base_url );
		$summary    = pixassist_get_overview_state_summary( $tabs, $base_url, $is_block );
		$site       = pixassist_get_overview_site();

		return array(
			'theme'      => pixassist_get_overview_theme( $is_block ),
			'links'      => pixassist_get_overview_links( $tabs, $base_url, $is_block ),
			'plus'       => pixassist_get_overview_plus_card(),
			'account'    => function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false ),
			'onboarding' => $onboarding,
			'stateSummary' => $summary,
			'site'         => $site,
			'greeting'     => pixassist_get_overview_greeting( $summary, $onboarding, $site['title'] ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_site' ) ) {
	/**
	 * The user's OWN site, for Home's live preview thumbnail and personalized copy.
	 *
	 * `previewUrl` is the homepage with `pixassist_site_preview=1`, which only strips the
	 * logged-in admin bar (see pixassist_overview_site_preview_setup()) so the thumbnail shows
	 * the page exactly as a visitor sees it. Guarded so it degrades to empties outside WP.
	 *
	 * @return array { url, previewUrl, title }
	 */
	function pixassist_get_overview_site() {
		$url = function_exists( 'home_url' ) ? (string) home_url( '/' ) : '';

		$preview = '';
		if ( '' !== $url ) {
			$preview = $url . ( false === strpos( $url, '?' ) ? '?' : '&' ) . 'pixassist_site_preview=1';
		}

		return array(
			'url'        => $url,
			'previewUrl' => $preview,
			'title'      => function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'name' ) : '',
		);
	}
}

if ( ! function_exists( 'pixassist_overview_site_preview_setup' ) ) {
	/**
	 * Render the homepage admin-bar-free for Home's thumbnail iframe.
	 *
	 * `?pixassist_site_preview=1` HIDES chrome only — the page is otherwise the public
	 * front page exactly as any visitor gets it, so no capability or nonce is required.
	 *
	 * @return void
	 */
	function pixassist_overview_site_preview_setup() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only presentation flag, value unused.
		if ( empty( $_GET['pixassist_site_preview'] ) ) {
			return;
		}

		if ( function_exists( 'show_admin_bar' ) ) {
			show_admin_bar( false );
		}
	}
}

if ( ! function_exists( 'pixassist_get_overview_greeting' ) ) {
	/**
	 * One calm, state-aware line above the At a glance rows — the page's voice.
	 *
	 * Three moods only, so the line stays trustworthy: something below carries the
	 * needs-attention tone; onboarding is still in progress (the checklist above owns the
	 * specifics); or everything is quiet — where the line greets the site by name.
	 *
	 * @param array  $items      State summary rows (tones are read from here).
	 * @param array  $onboarding Onboarding payload (completion is read from here).
	 * @param string $site_title Site title for the settled greeting; '' falls back to generic copy.
	 *
	 * @return string
	 */
	function pixassist_get_overview_greeting( $items, $onboarding, $site_title = '' ) {
		foreach ( (array) $items as $item ) {
			if ( isset( $item['tone'] ) && 'needs-attention' === $item['tone'] ) {
				return esc_html__( 'One thing below needs your attention.', '__plugin_txtd' );
			}
		}

		if ( empty( $onboarding['completed'] ) ) {
			return esc_html__( 'Here is where your site stands.', '__plugin_txtd' );
		}

		if ( '' !== (string) $site_title ) {
			return sprintf(
				/* translators: %s: the site title. */
				esc_html__( '%s is set up and ready to work on.', '__plugin_txtd' ),
				(string) $site_title
			);
		}

		return esc_html__( 'Your site is set up and ready to work on.', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_state_summary' ) ) {
	/**
	 * Build the quiet "At a glance" rows for Home.
	 *
	 * Deliberately few and calm: Theme, Site setup, Started from, Your style, Last change,
	 * Diagnostics, Account — plus a Pixelgrade Plus row only once Plus is installed (while absent,
	 * the single Plus presence on Home is the small invitation card, not a status row). The three
	 * promise rows (style / last change / diagnostics) are conditional: each renders only when it
	 * has a real fact to state, so the steady card never grows filler. `detail` is reserved for
	 * actionable situations; `tone` is `needs-attention` only when required setup is pending or a
	 * diagnostics check is blocked — everything else stays quiet.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 * @param bool   $is_block Whether the active theme is a block theme.
	 *
	 * @return array[] Summary items: id, label, value, detail, tone, url (+ swatches on the style row).
	 */
	function pixassist_get_overview_state_summary( $tabs, $base_url, $is_block ) {
		$theme         = pixassist_get_overview_theme( $is_block );
		$account       = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false );
		$plus          = pixassist_get_overview_plus_card();
		$plugin_state  = pixassist_get_overview_plugin_state();
		$starter_state = pixassist_get_overview_starter_state();

		$theme_value = ! empty( $theme['name'] ) ? (string) $theme['name'] : esc_html__( 'Active theme', '__plugin_txtd' );
		if ( ! empty( $theme['version'] ) ) {
			$theme_value .= ' ' . sprintf(
				/* translators: %s: theme version number. */
				esc_html__( 'v%s', '__plugin_txtd' ),
				(string) $theme['version']
			);
		}
		$theme_value .= ' · ' . ( ! empty( $theme['isBlockTheme'] ) ? esc_html__( 'Block theme', '__plugin_txtd' ) : esc_html__( 'Classic theme', '__plugin_txtd' ) );

		$items = array(
			array(
				'id'     => 'theme',
				'label'  => esc_html__( 'Theme', '__plugin_txtd' ),
				'value'  => $theme_value,
				'detail' => '',
				'tone'   => 'ok',
				'url'    => pixassist_get_styles_url( $is_block ),
			),
			array(
				'id'     => 'setup',
				'label'  => esc_html__( 'Site Setup', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_plugin_state_value( $plugin_state ),
				'detail' => $plugin_state['ready'] ? '' : pixassist_get_overview_plugin_state_detail( $plugin_state ),
				'tone'   => $plugin_state['ready'] ? 'ok' : 'needs-attention',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'plugins' ),
			),
			array(
				'id'     => 'starter',
				'label'  => esc_html__( 'Started from', '__plugin_txtd' ),
				'value'  => pixassist_get_overview_starter_state_value( $starter_state ),
				'detail' => '',
				'tone'   => $starter_state['has_imported'] ? 'ok' : 'neutral',
				'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'starter-sites' ),
			),
		);

		// The promise rows render only when they have a real fact to state (never filler).
		$style_row = pixassist_get_overview_style_row( $tabs, $base_url );
		if ( null !== $style_row ) {
			$items[] = $style_row;
		}

		$last_change_row = pixassist_get_overview_last_change_row( $tabs, $base_url );
		if ( null !== $last_change_row ) {
			$items[] = $last_change_row;
		}

		$diagnostics_row = pixassist_get_overview_diagnostics_row( $tabs, $base_url );
		if ( null !== $diagnostics_row ) {
			$items[] = $diagnostics_row;
		}

		$items[] = array(
			'id'     => 'account',
			'label'  => esc_html__( 'Account', '__plugin_txtd' ),
			'value'  => ! empty( $account['is_connected'] ) ? pixassist_get_overview_account_label( $account ) : esc_html__( 'Not connected', '__plugin_txtd' ),
			'detail' => '',
			'tone'   => ! empty( $account['is_connected'] ) ? 'ok' : 'neutral',
			'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'account' ),
		);

		// Plus earns a status row only once it is installed; discovery stays with the invitation card.
		if ( ! empty( $plus['isActive'] ) ) {
			$items[] = array(
				'id'     => 'plus',
				'label'  => ! empty( $plus['productLabel'] ) ? $plus['productLabel'] : 'Pixelgrade Plus',
				'value'  => pixassist_get_overview_plus_state_label( $plus ),
				'detail' => ! empty( $plus['isLicensed'] ) ? '' : pixassist_get_overview_plus_state_detail( $plus ),
				'tone'   => ! empty( $plus['isLicensed'] ) ? 'ok' : 'neutral',
				'url'    => ! empty( $plus['url'] ) ? $plus['url'] : '',
			);
		}

		return $items;
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
	 * block themes, the Customizer for classic ones). Then the sibling Design Library / Help hub
	 * tabs resolve to in-hub `?tab=` deep links.
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

		// 2. Design Library — the merged content destination (#60d4c0f IA); legacy Starter Sites
		// tab ids still resolve for companions that have not moved to the merged tab yet.
		$library = pixassist_find_overview_tab( $tabs, array( 'design-library', 'starter-sites', 'starter', 'starters' ) );
		if ( $library ) {
			$links[] = array(
				'id'      => 'design-library',
				'label'   => esc_html__( 'Browse the Design Library', '__plugin_txtd' ),
				'url'     => pixassist_overview_tab_url( $library, $base_url ),
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

if ( ! function_exists( 'pixassist_filter_overview_setup_plugins' ) ) {
	/**
	 * Keep only the plugins that count toward required free-path setup readiness.
	 *
	 * External-action hand-offs (the optional Pixelgrade Plus download row) can never be installed in
	 * wp-admin, so they must not gate setup completion — otherwise a free user with Nova Blocks + Style
	 * Manager active can never reach 100% and the Home "Setup" card nags forever. Guarded so the
	 * standalone Overview test (which does not load includes/admin-plugins.php) keeps its behavior.
	 *
	 * @param array[] $plugins Normalized plugin rows.
	 *
	 * @return array[]
	 */
	function pixassist_filter_overview_setup_plugins( $plugins ) {
		$plugins = is_array( $plugins ) ? $plugins : array();

		if ( ! function_exists( 'pixassist_plugin_counts_for_setup' ) ) {
			return $plugins;
		}

		$counted = array();
		foreach ( $plugins as $plugin ) {
			if ( pixassist_plugin_counts_for_setup( $plugin ) ) {
				$counted[] = $plugin;
			}
		}

		return $counted;
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
		// Only the required free-path plugins count toward readiness — the optional Pixelgrade Plus
		// hand-off row is excluded so the Home "Setup" card is not stuck in "needs attention".
		$plugins = pixassist_filter_overview_setup_plugins( $plugins );
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

		if ( 1 === (int) $state['pending'] ) {
			return esc_html__( '1 plugin needs setup.', '__plugin_txtd' );
		}

		return sprintf(
			/* translators: %d: number of plugins needing setup. */
			esc_html__( '%d plugins need setup.', '__plugin_txtd' ),
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
			'imported_at'    => pixassist_get_overview_starter_imported_at( $imported, $active_id ),
			'imported_count' => count( $imported ),
			'content_count'  => isset( $analysis['contentCount'] ) ? (int) $analysis['contentCount'] : 0,
			'classification' => isset( $analysis['classification'] ) ? sanitize_key( $analysis['classification'] ) : '',
			'applied'        => $applied,
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_starter_imported_at' ) ) {
	/**
	 * When the active starter's full-demo journal entry was written, if the entry is dated.
	 *
	 * Imports made before the `importedAt` field existed carry no date — the row then shows the
	 * starter name alone. Never fabricate a date.
	 *
	 * @param array  $imported  Imported starter journal.
	 * @param string $active_id Active starter id.
	 *
	 * @return int UNIX timestamp, or 0 when unknown.
	 */
	function pixassist_get_overview_starter_imported_at( $imported, $active_id ) {
		if ( '' === (string) $active_id || empty( $imported[ $active_id ] ) || ! is_array( $imported[ $active_id ] ) ) {
			return 0;
		}

		return ! empty( $imported[ $active_id ]['importedAt'] ) ? (int) $imported[ $active_id ]['importedAt'] : 0;
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
	 * Build the "Started from" row value.
	 *
	 * The row label carries the verb ("Started from"), so the value is the design's name alone —
	 * dated when the import journal knows when it happened ("Rosa LT · 3 weeks ago"), undated for
	 * imports that predate the `importedAt` journal field.
	 *
	 * @param array    $state Starter state.
	 * @param int|null $now   Current UNIX timestamp; null reads the clock (injectable for tests).
	 *
	 * @return string
	 */
	function pixassist_get_overview_starter_state_value( $state, $now = null ) {
		if ( ! empty( $state['has_imported'] ) ) {
			$title = ! empty( $state['active_title'] ) ? (string) $state['active_title'] : esc_html__( 'A starter design', '__plugin_txtd' );

			$imported_at = ! empty( $state['imported_at'] ) ? (int) $state['imported_at'] : 0;
			if ( $imported_at > 0 ) {
				return $title . ' · ' . pixassist_overview_relative_time( $imported_at, null === $now ? time() : (int) $now );
			}

			return $title;
		}

		if ( ! empty( $state['starters_count'] ) ) {
			return esc_html__( 'Ready to choose a design', '__plugin_txtd' );
		}

		return esc_html__( 'No designs available', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_get_overview_account_label' ) ) {
	/**
	 * Build the connected-account row value.
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
			return esc_html__( 'Connected', '__plugin_txtd' );
		}

		return sprintf(
			/* translators: %s: account display name, login, or email. */
			esc_html__( 'Connected as %s', '__plugin_txtd' ),
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
				'description' => esc_html__( 'Premium design tools and support that extend your free theme — there when you want them.', '__plugin_txtd' ),
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
 * Promise rows (#hub-home-promises) — quiet facts backed by existing product reads.
 *
 * Each of the three conditional rows below maps one settled pixelgrade.com homepage promise to
 * live data the plugin already has: "Your style" (set your style once — Style Manager / theme.json
 * read), "Last change" (everything is reversible — the import/parts journals), and "Diagnostics"
 * (catches problems — the Setup tab's readiness checks, minus the plugins check the Site Setup row
 * already owns). PURE builders take injected data (unit-testable); guarded gatherers degrade to
 * null — a row that has nothing real to say simply does not render.
 * ---------------------------------------------------------------------------
 */

if ( ! function_exists( 'pixassist_overview_relative_time' ) ) {
	/**
	 * A calm, coarse relative-time phrase for journal timestamps. Pure.
	 *
	 * Coarse on purpose: Home states facts, not a stopwatch. Buckets keep every string
	 * plural-safe without needing _n() ("2–13 days", "2–8 weeks", "2–12 months").
	 *
	 * @param int $timestamp Event UNIX timestamp.
	 * @param int $now       Current UNIX timestamp.
	 *
	 * @return string
	 */
	function pixassist_overview_relative_time( $timestamp, $now ) {
		$day  = 86400;
		$diff = max( 0, (int) $now - (int) $timestamp );

		if ( $diff < $day ) {
			return esc_html__( 'today', '__plugin_txtd' );
		}

		if ( $diff < 2 * $day ) {
			return esc_html__( 'yesterday', '__plugin_txtd' );
		}

		if ( $diff < 14 * $day ) {
			/* translators: %d: number of days (always 2 or more). */
			return sprintf( esc_html__( '%d days ago', '__plugin_txtd' ), (int) floor( $diff / $day ) );
		}

		if ( $diff < 61 * $day ) {
			/* translators: %d: number of weeks (always 2 or more). */
			return sprintf( esc_html__( '%d weeks ago', '__plugin_txtd' ), (int) floor( $diff / ( 7 * $day ) ) );
		}

		if ( $diff < 365 * $day ) {
			/* translators: %d: number of months (always 2 or more). */
			return sprintf( esc_html__( '%d months ago', '__plugin_txtd' ), (int) floor( $diff / ( 30 * $day ) ) );
		}

		if ( $diff < 730 * $day ) {
			return esc_html__( 'a year ago', '__plugin_txtd' );
		}

		/* translators: %d: number of years (always 2 or more). */
		return sprintf( esc_html__( '%d years ago', '__plugin_txtd' ), (int) floor( $diff / ( 365 * $day ) ) );
	}
}

if ( ! function_exists( 'pixassist_get_overview_last_change_entry' ) ) {
	/**
	 * Pick the most recent dated design change across the journals. Pure.
	 *
	 * Sources are the shapes the existing journals already expose: applied layout units, content
	 * units, and recipe bundles (all carry `appliedAt`), plus full-demo imports (dated only once
	 * the `importedAt` field exists — undated imports are silently skipped, never guessed).
	 *
	 * @param array $sources { layoutUnits, contentUnits, recipes, imports, starters }.
	 * @param int   $now     Current UNIX timestamp (for the relative phrase).
	 *
	 * @return array|null { value, timestamp }, or null when no dated change exists.
	 */
	function pixassist_get_overview_last_change_entry( $sources, $now ) {
		$sources = is_array( $sources ) ? $sources : array();
		$best    = null;

		$collections = array(
			/* translators: %s: layout part title (a header, footer, or template). */
			'layoutUnits'  => esc_html__( '%s applied', '__plugin_txtd' ),
			/* translators: %s: page/content pattern title. */
			'contentUnits' => esc_html__( '%s added', '__plugin_txtd' ),
			/* translators: %s: layout recipe title. */
			'recipes'      => esc_html__( '%s applied', '__plugin_txtd' ),
		);

		foreach ( $collections as $key => $template ) {
			$collection = isset( $sources[ $key ] ) && is_array( $sources[ $key ] ) ? $sources[ $key ] : array();
			foreach ( $collection as $slot => $entry ) {
				if ( ! is_array( $entry ) || empty( $entry['appliedAt'] ) ) {
					continue;
				}

				$timestamp = (int) $entry['appliedAt'];
				if ( null !== $best && $timestamp <= $best['timestamp'] ) {
					continue;
				}

				$title = '';
				foreach ( array( 'title', 'sourceTitle' ) as $title_key ) {
					if ( ! empty( $entry[ $title_key ] ) ) {
						$title = (string) $entry[ $title_key ];
						break;
					}
				}
				if ( '' === $title ) {
					$title = (string) $slot;
				}

				$best = array(
					'timestamp' => $timestamp,
					'text'      => sprintf( $template, $title ),
				);
			}
		}

		$imports  = isset( $sources['imports'] ) && is_array( $sources['imports'] ) ? $sources['imports'] : array();
		$starters = isset( $sources['starters'] ) && is_array( $sources['starters'] ) ? $sources['starters'] : array();
		foreach ( $imports as $demo_key => $entry ) {
			if ( ! is_array( $entry ) || empty( $entry['importedAt'] ) ) {
				continue;
			}

			$timestamp = (int) $entry['importedAt'];
			if ( null !== $best && $timestamp <= $best['timestamp'] ) {
				continue;
			}

			$title = pixassist_get_overview_starter_title( $starters, sanitize_key( (string) $demo_key ) );
			if ( '' === $title ) {
				$title = (string) $demo_key;
			}

			$best = array(
				'timestamp' => $timestamp,
				/* translators: %s: starter design title. */
				'text'      => sprintf( esc_html__( '%s imported', '__plugin_txtd' ), $title ),
			);
		}

		if ( null === $best ) {
			return null;
		}

		return array(
			'value'     => $best['text'] . ' · ' . pixassist_overview_relative_time( $best['timestamp'], $now ),
			'timestamp' => $best['timestamp'],
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_last_change_row' ) ) {
	/**
	 * The "Last change" row — quiet proof the design journal exists ("everything is reversible").
	 *
	 * Guarded gatherer over the existing journals; returns null (no row) until a dated change
	 * exists. Undo itself stays where each change was made (Design Library) — Home only states
	 * the fact.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 *
	 * @return array|null Summary row, or null.
	 */
	function pixassist_get_overview_last_change_row( $tabs, $base_url ) {
		if ( ! function_exists( 'pixassist_get_starter_sites_data' ) ) {
			return null;
		}

		$data    = pixassist_get_starter_sites_data();
		$applied = isset( $data['applied'] ) && is_array( $data['applied'] ) ? $data['applied'] : array();

		$entry = pixassist_get_overview_last_change_entry(
			array(
				'layoutUnits'  => isset( $applied['layoutUnits'] ) ? $applied['layoutUnits'] : array(),
				'recipes'      => isset( $applied['recipes'] ) ? $applied['recipes'] : array(),
				'contentUnits' => function_exists( 'pixassist_get_content_patterns_applied' ) ? pixassist_get_content_patterns_applied() : array(),
				'imports'      => isset( $data['imported'] ) ? $data['imported'] : array(),
				'starters'     => isset( $data['starters'] ) ? $data['starters'] : array(),
			),
			time()
		);

		if ( null === $entry ) {
			return null;
		}

		$library = pixassist_find_overview_tab( $tabs, array( 'design-library', 'starter-sites', 'starter', 'starters' ) );

		return array(
			'id'     => 'last-change',
			'label'  => esc_html__( 'Last change', '__plugin_txtd' ),
			'value'  => $entry['value'],
			'detail' => '',
			'tone'   => 'ok',
			'url'    => $library ? pixassist_overview_tab_url( $library, $base_url ) : $base_url . '&tab=design-library',
		);
	}
}

if ( ! function_exists( 'pixassist_overview_sample_swatches' ) ) {
	/**
	 * Keep valid hex colors and sample them evenly down to a display handful. Pure.
	 *
	 * @param array $colors Candidate color strings.
	 * @param int   $count  How many swatches to keep.
	 *
	 * @return string[] Up to $count hex colors, source order preserved.
	 */
	function pixassist_overview_sample_swatches( $colors, $count = 5 ) {
		$valid = array();
		foreach ( (array) $colors as $color ) {
			if ( is_string( $color ) && preg_match( '/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $color ) ) {
				$valid[] = $color;
			}
		}

		$count = max( 1, (int) $count );
		$total = count( $valid );
		if ( $total <= $count ) {
			return $valid;
		}

		$sampled = array();
		for ( $i = 0; $i < $count; $i ++ ) {
			$sampled[] = $valid[ (int) round( $i * ( $total - 1 ) / ( $count - 1 ) ) ];
		}

		return $sampled;
	}
}

if ( ! function_exists( 'pixassist_get_overview_style_facts' ) ) {
	/**
	 * Read the site's current style — Style Manager first, theme.json truth otherwise. Guarded.
	 *
	 * Style Manager's derived palette (`sm_get_saved_palettes()`, the Brand Primary group) is the
	 * live design system when SM is active; without SM, WordPress global settings surface the
	 * theme.json palette, which is honestly labeled "Theme defaults". Font names are deliberately
	 * absent for now: SM stores only a preset slug and resolving it to family names needs a small
	 * SM-side display-safe accessor (cross-repo follow-up).
	 *
	 * @return array|null { swatches (string[]), source ('sm'|'theme') }, or null when unreadable.
	 */
	function pixassist_get_overview_style_facts() {
		// Style Manager's live palette.
		if ( function_exists( 'sm_get_saved_palettes' ) ) {
			$palettes = sm_get_saved_palettes();
			if ( is_array( $palettes ) ) {
				foreach ( $palettes as $palette ) {
					// SM json-decodes its palettes without assoc, so entries arrive as stdClass.
					if ( is_object( $palette ) ) {
						$palette = (array) $palette;
					}

					// The user's palette group carries a numeric id; semantic groups use '_info' etc.
					if ( ! is_array( $palette ) || ! isset( $palette['id'] ) || ! is_numeric( $palette['id'] ) ) {
						continue;
					}

					$colors   = isset( $palette['colors'] ) && is_array( $palette['colors'] ) ? $palette['colors'] : array();
					$swatches = pixassist_overview_sample_swatches( $colors );
					if ( count( $swatches ) < 2 && isset( $palette['source'] ) && is_array( $palette['source'] ) ) {
						$swatches = pixassist_overview_sample_swatches( $palette['source'] );
					}

					if ( count( $swatches ) >= 2 ) {
						return array( 'swatches' => $swatches, 'source' => 'sm' );
					}
				}
			}
		}

		// Theme truth: the theme.json palette via core global settings.
		if ( function_exists( 'wp_get_global_settings' ) ) {
			$palette = wp_get_global_settings( array( 'color', 'palette' ) );
			$colors  = array();

			if ( is_array( $palette ) ) {
				// Origin-keyed shape: prefer user customizations, then the theme's own palette —
				// core defaults are not "your style", so they never power the row.
				$entries = array();
				foreach ( array( 'custom', 'theme' ) as $origin ) {
					if ( ! empty( $palette[ $origin ] ) && is_array( $palette[ $origin ] ) ) {
						$entries = $palette[ $origin ];
						break;
					}
				}
				// Flat shape (no origin keys): a plain list of palette entries.
				if ( empty( $entries ) && isset( $palette[0] ) ) {
					$entries = $palette;
				}

				foreach ( $entries as $entry ) {
					if ( is_array( $entry ) && ! empty( $entry['color'] ) ) {
						$colors[] = (string) $entry['color'];
					}
				}
			}

			$swatches = pixassist_overview_sample_swatches( $colors );
			if ( count( $swatches ) >= 2 ) {
				return array( 'swatches' => $swatches, 'source' => 'theme' );
			}
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_get_overview_style_row' ) ) {
	/**
	 * The "Your style" row — the user's own palette ("set your style once, everything follows").
	 *
	 * Returns null when no truthful palette is readable (row simply absent — never placeholder
	 * swatches). The row routes to the Design System tab where the style is actually edited.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 *
	 * @return array|null Summary row (with the extra `swatches` key), or null.
	 */
	function pixassist_get_overview_style_row( $tabs, $base_url ) {
		$facts = pixassist_get_overview_style_facts();
		if ( null === $facts ) {
			return null;
		}

		return array(
			'id'       => 'style',
			'label'    => esc_html__( 'Your style', '__plugin_txtd' ),
			'value'    => 'sm' === $facts['source'] ? esc_html__( 'Your palette', '__plugin_txtd' ) : esc_html__( 'Theme defaults', '__plugin_txtd' ),
			'detail'   => '',
			'tone'     => 'ok',
			'url'      => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'styles' ),
			'swatches' => $facts['swatches'],
		);
	}
}

if ( ! function_exists( 'pixassist_get_overview_diagnostics_parts' ) ) {
	/**
	 * Roll the readiness checks (minus the plugins check) into one quiet diagnostics fact. Pure.
	 *
	 * The plugins check is excluded because the Site Setup row already owns that fact — one fact
	 * never appears twice on Home. "No known conflicts" is precise, not a vague all-clear: it means
	 * no Care conflict, companions within their theme-tested ranges, and no environment blocker.
	 *
	 * @param array[] $checks Checks from pixassist_build_setup_checks() (id/status/label/value).
	 *
	 * @return array|null { value, detail, tone }, or null when there is nothing to report on.
	 */
	function pixassist_get_overview_diagnostics_parts( $checks ) {
		$relevant = array();
		foreach ( (array) $checks as $check ) {
			if ( ! is_array( $check ) || ( isset( $check['id'] ) && 'plugins' === $check['id'] ) ) {
				continue;
			}
			$relevant[] = $check;
		}

		if ( empty( $relevant ) ) {
			return null;
		}

		$blocked  = array();
		$warnings = array();
		foreach ( $relevant as $check ) {
			$status = isset( $check['status'] ) ? (string) $check['status'] : 'ok';
			if ( 'blocked' === $status ) {
				$blocked[] = $check;
			} elseif ( 'warning' === $status ) {
				$warnings[] = $check;
			}
		}

		if ( ! empty( $blocked ) ) {
			return array(
				'value'  => esc_html__( 'Needs your attention', '__plugin_txtd' ),
				'detail' => pixassist_overview_diagnostics_check_summary( $blocked[0] ),
				'tone'   => 'needs-attention',
			);
		}

		if ( ! empty( $warnings ) ) {
			$count = count( $warnings );

			return array(
				'value'  => 1 === $count
					? esc_html__( '1 check to review', '__plugin_txtd' )
					/* translators: %d: number of readiness checks with warnings (always 2 or more). */
					: sprintf( esc_html__( '%d checks to review', '__plugin_txtd' ), $count ),
				'detail' => pixassist_overview_diagnostics_check_summary( $warnings[0] ),
				'tone'   => 'neutral',
			);
		}

		return array(
			'value'  => esc_html__( 'No known conflicts', '__plugin_txtd' ),
			'detail' => '',
			'tone'   => 'ok',
		);
	}
}

if ( ! function_exists( 'pixassist_overview_diagnostics_check_summary' ) ) {
	/**
	 * One-line summary of a readiness check ("Companion plugin versions — 1 outside the tested
	 * range"). Pure.
	 *
	 * @param array $check Check descriptor.
	 *
	 * @return string
	 */
	function pixassist_overview_diagnostics_check_summary( $check ) {
		$label = isset( $check['label'] ) ? (string) $check['label'] : '';
		$value = isset( $check['value'] ) ? (string) $check['value'] : '';

		if ( '' !== $label && '' !== $value ) {
			return $label . ' — ' . $value;
		}

		return '' !== $value ? $value : $label;
	}
}

if ( ! function_exists( 'pixassist_get_overview_diagnostics_row' ) ) {
	/**
	 * The "Diagnostics" row — the free tier's promise ("catches problems") as a quiet fact.
	 *
	 * Reads the Setup tab's existing readiness engine (setup-readiness.php — real, local checks
	 * only; no new detection is built here). Absent when the engine is unavailable.
	 *
	 * @param array  $tabs     Normalized hub tabs.
	 * @param string $base_url Hub page URL.
	 *
	 * @return array|null Summary row, or null.
	 */
	function pixassist_get_overview_diagnostics_row( $tabs, $base_url ) {
		if ( ! function_exists( 'pixassist_get_setup_readiness_data' ) ) {
			return null;
		}

		$readiness = pixassist_get_setup_readiness_data();
		$checks    = isset( $readiness['checks'] ) && is_array( $readiness['checks'] ) ? $readiness['checks'] : array();

		$parts = pixassist_get_overview_diagnostics_parts( $checks );
		if ( null === $parts ) {
			return null;
		}

		return array(
			'id'     => 'diagnostics',
			'label'  => esc_html__( 'Diagnostics', '__plugin_txtd' ),
			'value'  => $parts['value'],
			'detail' => $parts['detail'],
			'tone'   => $parts['tone'],
			'url'    => pixassist_overview_tab_url_by_id( $tabs, $base_url, 'system-status' ),
		);
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
			array(
				'id'          => 'plugins',
				'title'       => esc_html__( 'Install recommended plugins', '__plugin_txtd' ),
				'description' => esc_html__( 'Add the plugins this theme is designed to use.', '__plugin_txtd' ),
				'url'         => $base_url . '&tab=plugins',
				'done'        => ! empty( $facts['plugins_ready'] ),
				'optional'    => false,
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
		// Exclude the optional Pixelgrade Plus hand-off row (an external-action download that cannot be
		// installed in wp-admin) so the free-path "Install recommended plugins" step is completable once
		// Nova Blocks + Style Manager are active.
		$plugins = pixassist_filter_overview_setup_plugins( $plugins );

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

// Front-end affordance for Home's live site thumbnail (this file loads on every request).
if ( function_exists( 'add_action' ) ) {
	add_action( 'init', 'pixassist_overview_site_preview_setup' );
}
