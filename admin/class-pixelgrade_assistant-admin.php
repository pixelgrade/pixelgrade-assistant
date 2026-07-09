<?php
if ( ! defined( 'ABSPATH' ) ) exit;
/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/admin
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant_Admin {
	/**
     * The main plugin object (the parent).
     * @var     PixelgradeAssistant
     * @access  public
     */
    public $parent = null;

	/**
	 * The config for the active theme.
	 * If this is false it means the current theme hasn't declared support for pixelgrade_assistant
	 *
	 * @var      array / boolean    $theme_support
	 * @access   private
	 */
	public static $theme_support;

	/**
	 * The plugin's options
	 *
	 * @var array
	 */
	protected static $options = null;

	/**
	 * The option key where we store the plugin's options.
	 *
	 * @var string
	 */
	protected static $options_key = 'pixassist_options';

	/**
	 * The WordPress API nonce.
	 *
	 * @var string
	 */
    protected $wp_nonce;

	/**
	 * Our extra API nonce.
	 * @var string
	 */
    protected $pixassist_nonce;

	/**
	 * Admin REST controller class object
	 *
	 * @var PixelgradeAssistant_AdminRestInterface
	 * @access  protected
	 */
	protected $rest_controller = null;

	/**
	 * The Pixelgrade Assistant Manager API version we currently use.
	 *
	 * @var string
	 */
    protected static $pixelgrade_assistant_manager_api_version = 'v2';

	/**
	 * Internal REST API endpoints used for housekeeping.
	 * @var array
	 * @access public
	 */
	public static $internalApiEndpoints;

	/**
	 * External REST API endpoints used for communicating with our site.
	 * @var array
	 * @access public
	 */
	public static $externalApiEndpoints;

	/**
	 * Cache for the wupdates identification data to avoid firing the filter multiple times.
	 * @var array
	 * @access protected
	 */
	protected static $wupdates_ids = array();

	/**
     * The only instance.
     * @var     PixelgradeAssistant_Admin
     * @access  protected
     */
    protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param $parent
	 */
    public function __construct( $parent ) {
        $this->parent = $parent;

        add_action( 'after_setup_theme', array( $this, 'init' ), 20 );

        // Initialize the REST API admin endpoints
        require_once plugin_dir_path( $this->parent->file ) . 'admin/class-pixelgrade_assistant-admin_rest_interface.php';
        $this->rest_controller = new PixelgradeAssistant_AdminRestInterface();

        // Register the admin REST API routes
        add_action( 'rest_api_init', array( $this->rest_controller, 'register_routes' ) );

        // Make sure that TGMPA gets loaded when it's needed, mainly in AJAX requests
	    // We need to hook this early because the action is fired in the TGMPA constructor.
        add_action( 'tgmpa_init', array( $this, 'force_load_tgmpa' ) );
	    // Make sure TGMPA is loaded.
	    require_once plugin_dir_path( $this->parent->file ) . 'admin/required-plugins/class-tgm-plugin-activation.php';

	    // Load the bundled Classic Editor only for themes that explicitly require it.
	    if ( pixassist_theme_requires_classic_editor( PixelgradeAssistant::get_theme_config() ) ) {
		    require_once plugin_dir_path( $this->parent->file ) . 'vendor/classic-editor/classic-editor.php';
	    }

	    // Fill up the WUpdates identification data for missing entities that we can deduce through other means.
	    // This mostly addresses WordPress.org themes that don't have the WUpdates identification data.
	    // This needs to be hooked up this early since we can't know for sure when the filter will be fired.
	    add_filter( 'wupdates_gather_ids', array( 'PixelgradeAssistant_Admin', 'maybe_fill_up_wupdates_identification_data' ), 1000, 1 );
    }

    /**
     * Initialize our class
     */
    public function init() {
        $this->wp_nonce        = wp_create_nonce( 'wp_rest' );
        $this->pixassist_nonce = wp_create_nonce( 'pixelgrade_assistant_rest' );

	    // Save the internal API endpoints in a easy to get property
	    self::$internalApiEndpoints = apply_filters( 'pixassist_internal_api_endpoints', array(
		    'globalState'        => array(
			    'get' => array(
				    'method' => 'GET',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/global_state' ),
			    ),
			    'set' => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/global_state' ),
			    ),
		    ),
		    'localized' => array(
			    'get' => array(
				    'method' => 'GET',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/localized' ),
			    ),
		    ),

		    'cleanup'            => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/cleanup' ),
		    ),
		    'resetStarterContent' => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/reset_starter_content' ),
		    ),

			    // Pixelgrade Docs documentation categories (fetched lazily when the editor sidebar opens).
		    'kbCategories'       => array(
			    'method' => 'GET',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/kb_categories' ),
		    ),

		    // Starter content needed endpoints
			    'import'             => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/import' ),
			    ),
			    'importStarter'      => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/import_starter' ),
			    ),
			    'uploadMedia'        => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/upload_media' ),
			    ),
		    'layoutUnits'        => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/layout_units' ),
		    ),
		    'contentUnits'       => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/content_units' ),
		    ),
			    'importUnit'         => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/import_unit' ),
			    ),
		    'importContentUnit'  => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/import_content_unit' ),
		    ),
			    'queueUnit'          => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/queue_unit' ),
			    ),
			    'unitJobStatus'      => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/unit_job_status' ),
			    ),
			    'undoUnit'           => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/undo_unit' ),
			    ),
		    'undoContentUnit'    => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/undo_content_unit' ),
		    ),
		    'recipes'            => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/recipes' ),
		    ),
		    'applyRecipe'        => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/apply_recipe' ),
		    ),
		    'undoRecipe'         => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/undo_recipe' ),
		    ),

		    'dataCollect'        => array(
			    'get' => array(
				    'method' => 'GET',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/data_collect' ),
			    ),
			    'set' => array(
				    'method' => 'POST',
				    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/data_collect' ),
			    ),
		    ),
	    ) );

	    // Save the external API endpoints in a easy to get property
	    self::$externalApiEndpoints = apply_filters( 'pixassist_external_api_endpoints', array(
		    'pxm' => array(
			    'getConfig'      => array(
				    'method' => 'GET',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/get_config',
			    ),
		    ),
	    ) );

	    $this->register_hooks();
    }

	/**
	 * Register the hooks related to this module.
	 */
	public function register_hooks() {
		add_action( 'admin_init', array( 'PixelgradeAssistant_Admin', 'set_theme_support' ), 11 );

		add_action( 'admin_notices', array( $this, 'admin_notices' ) );

		add_action( 'admin_menu', array( $this, 'add_pixelgrade_assistant_menu' ) );
		// Light up the submenu item matching the hub's `?tab=` deep link on server-rendered loads.
		add_filter( 'submenu_file', array( $this, 'highlight_hub_submenu' ) );
		// Canonicalize the hub's pre-top-level URLs (themes.php?page=pixelgrade): core still renders
		// a top-level plugin page under any parent file, so admin_init fires and can 302 old links
		// to the admin.php form. admin_page_access_denied is the safety net for flows where core
		// denies the orphaned parent instead (it runs before admin_init).
		add_action( 'admin_init', array( $this, 'redirect_legacy_hub_url' ) );
		add_action( 'admin_page_access_denied', array( $this, 'redirect_legacy_hub_url' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_docs_editor_assets' ) );
		// The docs window follows the user across all of wp-admin: enqueue it on any admin page while
		// it's open (cookie) or when explicitly opened (?pixassist_open_docs), plus always in the editor.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_docs_window' ) );
		add_action( 'admin_bar_menu', array( $this, 'add_docs_admin_bar_node' ), 100 );

		// We we will remember the theme version when the transient is updated
		add_filter( 'pre_set_site_transient_update_themes', array(
			$this,
			'transient_update_theme_version',
		), 11 );
		// We will remove the the info when the transient is deleted (maybe after a successful update?)
		add_action( 'delete_site_transient_update_themes', array(
			$this,
			'transient_remove_theme_version',
		), 10 );

		// On theme switch clear the cache for the remote config
		add_action( 'after_switch_theme', array( 'PixelgradeAssistant_Admin', 'clear_remote_config_cache' ), 11 );

		// If the remove config contains recommend plugins, register them with TGMPA
		add_action( 'tgmpa_register', array( $this, 'register_required_plugins' ), 1000 );

		// Prevent TGMPA admin notices since we manage plugins in the Pixelgrade Care dashboard.
		add_filter( 'tgmpa_show_admin_notices', array( $this, 'prevent_tgmpa_notices' ), 10, 1 );

		// The Pixelgrade hub's Setup tab is the single place to install recommended plugins. Remove
		// TGMPA's redundant standalone "Install Plugins" menu item so there aren't two surfaces doing
		// the same job. TGMPA's install machinery stays intact (the hub install path relies on it) —
		// only the duplicate menu link is hidden. Late priority so it runs after TGMPA::admin_menu().
		add_action( 'admin_menu', array( $this, 'hide_tgmpa_install_menu' ), 999 );

		// Auto-update Pixelgrade Assistant by default.
		add_filter( 'auto_update_plugin', array( $this, 'handle_plugin_autoupdate' ), 10, 2 );
	}

    /**
     * Determine if there are any Pixelgrade themes currently installed.
     *
     * @return bool
     */
    public static function has_pixelgrade_theme() {
        $themes = wp_get_themes();
        // Loop through the themes.
        // If we find a theme from Pixelgrade, return true.
        /** @var WP_Theme $theme */
        foreach ( $themes as $theme ) {
            $theme_author = $theme->get( 'Author' );

            if ( ! empty( $theme_author ) && strtolower( $theme_author ) == 'pixelgrade' ) {
                return true;
            }
        }

        // No themes from pixelgrade found.
        return false;
    }

    /**
     * Register the stylesheets for the admin area.
     */
    public function enqueue_styles() {
        if ( self::is_pixelgrade_admin_hub() ) {
            // The modern hub shell is built on @wordpress/components; load WP core's component styles.
            wp_enqueue_style( 'wp-components' );
            // Self-contained Help/KB panel styles (master-detail layout, feedback, escalation).
            self::enqueue_help_panel_style();
        }
    }

	/**
	 * Enqueue the self-contained Help/KB panel stylesheet.
	 *
	 * Scoped under .pixelgrade-docs and kept separate from the legacy admin CSS so neither the hub
	 * nor the editor sidebar inherits the old dashboard globals. Used by the Help hub tab and the
	 * contextual editor docs sidebar (both render src-modern/docs/KbPanel.js).
	 */
	public static function enqueue_help_panel_style() {
		$relative = 'admin/css/help.css';
		$path     = PIXELGRADE_ASSISTANT__PLUGIN_DIR . $relative;
		$version  = file_exists( $path ) ? filemtime( $path ) : false;

		wp_enqueue_style(
			'pixelgrade-help',
			plugin_dir_url( PIXELGRADE_ASSISTANT__PLUGIN_FILE ) . $relative,
			array( 'wp-components' ),
			$version
		);
	}

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {
        if ( self::is_pixelgrade_admin_hub() ) {
            // Modern host shell (admin/src-modern/hub) built via @wordpress/scripts (#41).
            // Dependencies + cache-busting version come from the build manifest; the visible tab list
            // is collected/capability-gated/sorted server-side from the #42 registry.
            wp_enqueue_script( 'plugin-install' );
            wp_enqueue_script( 'updates' );
            $handle = pixassist_enqueue_built_script( 'pixelgrade-admin-hub', 'index', array( 'plugin-install', 'updates' ) );
            wp_localize_script( $handle, 'pixelgradeAdminHub', pixassist_get_admin_hub_data() );
            // The free Overview tab (#44) reads its own bootstrap payload (theme status, quick links,
            // Plus discovery card). Tab-specific data channel, kept out of the generic hub bootstrap.
            wp_localize_script( $handle, 'pixelgradeOverview', pixassist_get_overview_data() );
            // The free Styles tab keeps the hub navigation stable and routes into the editor only from
            // explicit style actions.
            wp_localize_script( $handle, 'pixelgradeStyles', pixassist_get_styles_data() );
            // The free Plugins tab (#48) reuses the existing TGMPA/recommended-plugins source and
            // exposes only normalized UI data to the modern tab.
            wp_localize_script( $handle, 'pixelgradePlugins', pixassist_get_plugins_data() );
            // The mixed Starter Sites tab (#49) reuses the existing free starter-content config and
            // lets Plus inject premium starters through the documented PHP filter.
            wp_localize_script( $handle, 'pixelgradeStarterSites', pixassist_get_starter_sites_data() );
            // Recipes are source-as-recipe presets over the granular layout-unit importer.
            wp_localize_script( $handle, 'pixelgradeRecipes', pixassist_get_recipes_data() );
            wp_localize_script( $handle, 'pixelgradeLayoutUnits', pixassist_get_layout_units_data() );
            wp_localize_script( $handle, 'pixelgradeContentPatterns', pixassist_get_content_patterns_data() );
            // Secondary diagnostics/maintenance tabs (#50), sourced from existing Assistant REST
            // endpoints and data collectors.
            wp_localize_script( $handle, 'pixelgradeSystemStatus', pixassist_get_system_status_data() );
            wp_localize_script( $handle, 'pixelgradeTools', pixassist_get_tools_data() );
            // The free Account tab (#45) reads identity + action URLs only. OAuth credentials stay
            // PHP-only via pixassist_get_account_credentials() and are never localized.
            wp_localize_script( $handle, 'pixelgradeAccount', pixassist_get_account_data() );
            // The free Help tab (#47) reuses the editor docs KB data layer; keep its bootstrap on a
            // tab-specific global so the hub shell stays generic.
            wp_localize_script( $handle, 'pixelgradeHelp', pixassist_get_docs_data() );
            self::localize_js_data( $handle, true, 'hub' );
        }

	    // If we are in a block editor page, we need to localize our data since NovaBlocks might make use of it.
	    // We don't have our scripts in those pages, so we localize on the editor script.
	    if ( pixelgrade_is_block_editor() ) {
		    self::localize_js_data( 'wp-block-editor', true, 'editor' );
	    }
    }

	/**
	 * Register the contextual Pixelgrade Docs sidebar on block editor screens.
	 */
	public function enqueue_docs_editor_assets() {
		if ( ! function_exists( 'pixassist_docs_can_access' ) || ! pixassist_docs_can_access() ) {
			return;
		}

		$handle = pixassist_enqueue_built_script( 'pixelgrade-docs', 'docs' );
		self::enqueue_help_panel_style();
		wp_localize_script( $handle, 'pixelgradeDocs', pixassist_get_docs_data() );
		self::localize_js_data( $handle, true, 'editor' );
	}

	/**
	 * Enqueue the editor-agnostic docs WINDOW on any admin page so it can follow the user across
	 * wp-admin. Loaded only when needed — in the block editor (always), or on a plain admin page while
	 * the window is open (the `pixassist_docs_open` cookie) or explicitly opened (?pixassist_open_docs)
	 * — so closed-docs pages pay zero cost. The window bundle has no editor dependencies.
	 */
	public function enqueue_docs_window() {
		if ( ! function_exists( 'pixassist_docs_can_access' ) || ! pixassist_docs_can_access() ) {
			return;
		}

		$screen     = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		$is_editor  = $screen && method_exists( $screen, 'is_block_editor' ) && $screen->is_block_editor();
		$cookie_open = ! empty( $_COOKIE['pixassist_docs_open'] );
		$param_open  = ! empty( $_GET['pixassist_open_docs'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only UI hint, no state change.

		if ( ! $is_editor && ! $cookie_open && ! $param_open ) {
			return;
		}

		$handle = pixassist_enqueue_built_script( 'pixelgrade-docs-window', 'docs-window' );
		self::enqueue_help_panel_style();

		$data = pixassist_get_docs_data();
		if ( $param_open ) {
			// Opened from the admin-bar link on a plain page: tell the window to open the browser.
			$data['autoOpen'] = true;
		}
		wp_localize_script( $handle, 'pixelgradeDocs', $data );
		self::localize_js_data( $handle, true, 'editor' );
	}

	/**
	 * Admin-bar "Pixelgrade Docs" toggle — opens the floating docs window from any wp-admin page
	 * (where there's no editor toolbar). It links to the current page with ?pixassist_open_docs=1;
	 * once open, the cookie keeps it following the user. Closing it (the window's × ) clears the cookie.
	 */
	public function add_docs_admin_bar_node( $wp_admin_bar ) {
		if ( ! is_admin() || ! is_admin_bar_showing() ) {
			return;
		}

		if ( ! function_exists( 'pixassist_docs_can_access' ) || ! pixassist_docs_can_access() ) {
			return;
		}

		$wp_admin_bar->add_node( array(
			'id'    => 'pixassist-docs',
			'title' => '<span class="ab-icon dashicons dashicons-art" aria-hidden="true" style="top:2px;"></span>' . esc_html__( 'Design Docs', '__plugin_txtd' ),
			'href'  => esc_url( add_query_arg( 'pixassist_open_docs', '1' ) ),
			'meta'  => array( 'title' => esc_attr__( 'Open Pixelgrade design & site-building docs', '__plugin_txtd' ) ),
		) );
	}

    /**
     * Check if everything is in order with the theme's support for Pixelgrade Assistant.
     *
     * @return bool
     */
    public static function check_theme_support() {
        if ( ! current_theme_supports( 'pixelgrade_assistant' ) ) {
            return false;
        }

        $config = get_theme_support( 'pixelgrade_assistant' );
        if ( ! is_array( $config ) ) {
            return false;
        }

        $config = self::validate_theme_supports( reset( $config ) );
        if ( empty( $config ) ) {
            return false;
        }
        return true;
    }

    /**
     * Set the data regarding theme_support.
     *
     * @return array
     */
    public static function set_theme_support() {
	    $config = get_theme_support( 'pixelgrade_assistant' );
	    // This is not a theme that declares proper support for this plugin,
	    // we will still fill in some of the data about the current theme as it might be used in places.
        if ( ! self::check_theme_support() || ! is_array( $config ) ) {
            self::$theme_support = self::validate_theme_supports( array() );
            return self::$theme_support;
        }

        $config = self::validate_theme_supports( reset( $config ) );
	    if ( empty( $config ) ) {
		    self::$theme_support = array();
		    return self::$theme_support;
	    }

        // Update the current theme_support
        self::$theme_support = $config;
        return self::$theme_support;
    }

    public static function get_theme_support() {
        if ( empty( self::$theme_support ) ) {
            self::set_theme_support();
        }
        return self::$theme_support;
    }

	/**
	 * Adds the WP Admin menus.
	 *
	 * The hub is a top-level menu right above Appearance (position 60), at 59.1 so it sits BELOW
	 * core's group separator (position 59) — grouped with the site/design menus, not dangling off
	 * the content group —
	 * it holds the plugin's entire surface (Design System, Design Library, Site Setup, Account,
	 * Help, docs), which outgrew a single Appearance submenu entry. The submenus mirror the hub's
	 * visible tabs from the same registry the in-app tab bar reads, so labels, capabilities and
	 * order never drift.
	 */
	public function add_pixelgrade_assistant_menu() {
		// The sidebar label is the bare brand — one line at the sidebar's 160px (the full name
		// wraps), and the ecosystem convention for a suite's home (Jetpack, WooCommerce). The
		// page title (H1 / browser tab) keeps the functional "Pixelgrade Design".
		add_menu_page(
			esc_html__( 'Pixelgrade Design', '__plugin_txtd' ),
			esc_html__( 'Pixelgrade', '__plugin_txtd' ),
			'edit_theme_options',
			'pixelgrade',
			array( $this, 'render_admin_hub_page' ),
			self::get_menu_icon(),
			'59.1'
		);

		if ( ! function_exists( 'pixassist_get_admin_hub_submenu_items' ) ) {
			return;
		}

		foreach ( pixassist_get_admin_hub_submenu_items() as $item ) {
			// The default tab re-registers the parent slug, renaming the auto-added first entry
			// (e.g. to "Home"); the rest are plain deep links routed by the hub's tab router.
			add_submenu_page(
				'pixelgrade',
				$item['label'],
				$item['label'],
				$item['capability'],
				$item['slug'],
				'pixelgrade' === $item['slug'] ? array( $this, 'render_admin_hub_page' ) : ''
			);
		}
	}

	/**
	 * The sidebar menu icon: the Pixelgrade grid mark as a bold 3×3 square grid (Dashicon-weight
	 * evolution of the legacy 4×4 dot grid), inlined as a data URI so core's svg-painter recolors
	 * it with the menu state instead of it staying a fixed color.
	 *
	 * @return string
	 */
	public static function get_menu_icon() {
		$svg = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 2.01H6.22V6.22H2.01Z M7.9 2.01H12.11V6.22H7.9Z M13.79 2.01H18V6.22H13.79Z M2.01 7.9H6.22V12.11H2.01Z M7.9 7.9H12.11V12.11H7.9Z M13.79 7.9H18V12.11H13.79Z M2.01 13.79H6.22V18H2.01Z M7.9 13.79H12.11V18H7.9Z M13.79 13.79H18V18H13.79Z" fill="#a7aaad" fill-rule="evenodd"/></svg>';

		return 'data:image/svg+xml;base64,' . base64_encode( $svg );
	}

	/**
	 * Keep the sidebar submenu highlight in sync with the hub's `?tab=` deep links.
	 *
	 * WP highlights the submenu item whose slug matches `$submenu_file`; for the tab deep links
	 * that slug is the full `admin.php?page=pixelgrade&tab=…` URL, so resolve the requested tab
	 * (through the legacy-alias map) to the matching registered slug. Client-side tab switches
	 * are synced by the hub app itself (menuHighlight.js).
	 *
	 * @param string|null $submenu_file The submenu file WP resolved.
	 *
	 * @return string|null
	 */
	public function highlight_hub_submenu( $submenu_file ) {
		if ( ! self::is_pixelgrade_admin_hub() || empty( $_GET['tab'] ) || ! function_exists( 'pixassist_get_admin_hub_submenu_items' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only UI highlight.
			return $submenu_file;
		}

		$tab     = sanitize_key( wp_unslash( $_GET['tab'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$aliases = function_exists( 'pixassist_get_admin_hub_tab_aliases' ) ? pixassist_get_admin_hub_tab_aliases() : array();

		if ( isset( $aliases[ $tab ] ) ) {
			$tab = is_array( $aliases[ $tab ] ) ? $aliases[ $tab ]['tab'] : $aliases[ $tab ];
		}

		foreach ( pixassist_get_admin_hub_submenu_items() as $item ) {
			if ( $item['tab'] === $tab ) {
				return $item['slug'];
			}
		}

		return $submenu_file;
	}

	/**
	 * Redirect the legacy `themes.php?page=pixelgrade` URLs to their top-level home.
	 *
	 * The hub lived under Appearance before becoming a top-level menu; old bookmarks, remote
	 * config content and companion links still carry the themes.php form. Core happens to render
	 * a top-level plugin page under any parent file, so this mostly canonicalizes (302 on
	 * admin_init) rather than rescues — but it also hooks `admin_page_access_denied` (which runs
	 * before `admin_init`, in wp-admin/includes/menu.php) for flows where core denies the
	 * orphaned parent instead.
	 */
	public function redirect_legacy_hub_url() {
		global $pagenow;

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only redirect of a legacy URL.
		if ( 'themes.php' !== $pagenow || empty( $_GET['page'] ) || 'pixelgrade' !== $_GET['page'] ) {
			return;
		}

		$tab     = ! empty( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : '';
		$section = ! empty( $_GET['section'] ) ? sanitize_key( wp_unslash( $_GET['section'] ) ) : '';
		$url     = pixassist_get_hub_url( $tab, $section );

		if ( ! empty( $_GET['pixassist_open_docs'] ) ) {
			$url = add_query_arg( 'pixassist_open_docs', '1', $url );
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		wp_safe_redirect( $url );
		exit;
	}

    /**
     * Localize a script with or just return the `pixassist` data.
     *
     * @param string $script_id
     * @param bool $localize
     * @param string $context The context that we are asked to provide the information. We can use this to limit the information.
     *
     * @return array
     */
    public static function localize_js_data( $script_id = 'pixelgrade_assistant-dashboard', $localize = true, $context = 'dashboard' ) {
	    $local_plugin = PixelgradeAssistant();

        if ( empty( self::$theme_support ) ) {
            self::set_theme_support();
        }

        $current_user = self::get_theme_activation_user();
        $theme_config = self::get_config();

        if ( class_exists( 'TGM_Plugin_Activation' ) ) {
            $theme_config['pluginManager']['tgmpaPlugins'] = self::localize_tgmpa_data();
        }

        // This tells us if there is a Pixelgrade theme installed, not necessarily activated.
        self::$theme_support['hasPxgTheme'] = self::has_pixelgrade_theme();

        // Use camelCase since this is going to JS!!!
	    $localized_data = array(
		    'apiBase'        => PIXELGRADE_ASSISTANT__API_BASE,
		    'apiBaseDomain'  => PIXELGRADE_ASSISTANT__API_BASE_DOMAIN,
		    'apiEndpoints'   => self::$externalApiEndpoints,
		    'shopBase'       => PIXELGRADE_ASSISTANT__SHOP_BASE,
		    'shopBaseDomain' => PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN,
		    'devMode'        => pixassist_is_devmode(),
		    'themeSupports'  => self::$theme_support,
		    'themeConfig'    => $theme_config,
		    'themeHeaders'   => self::get_theme_headers(),
		    'wpRest'         => array(
			    'root'          => esc_url_raw( rest_url() ),
			    'base'          => esc_url_raw( rest_url() . 'pixassist/v1/' ),
			    'endpoint'      => self::$internalApiEndpoints,
			    'nonce'         => $local_plugin->plugin_admin->wp_nonce,
			    'pixassist_nonce' => $local_plugin->plugin_admin->pixassist_nonce,
		    ),
		    'systemStatus'   => PixelgradeAssistant_DataCollector::get_system_status_data(),
		    'siteUrl'        => home_url( '/' ),
		    'dashboardUrl'   => pixassist_get_hub_url(),
		    'adminUrl'       => admin_url(),
		    'themesUrl'      => admin_url( 'themes.php' ),
		    'customizerUrl'  => admin_url( 'customize.php' ),
		    'user'           => array(
			    'name'   => ( empty( $current_user->display_name ) ? $current_user->user_login : $current_user->display_name ),
			    'id'     => $current_user->ID,
			    'email'  => $current_user->user_email,
			    'themes' => array(),
		    ),
		    'themeMod'       => array(),
		    'version'        => $local_plugin->get_version(),
	    );

        /*
         * Theme data
         *
         * Only a genuine theme-update marker (theme health) is surfaced here; account/license
         * state is no longer part of the free plugin.
         */
	    $localized_data['themeMod'] = array(
		    'themeNewVersion' => false,
	    );

        $new_theme_version = get_theme_mod( 'pixassist_new_theme_version' );
        if ( ! empty( $new_theme_version ) ) {
            $localized_data['themeMod']['themeNewVersion'] = $new_theme_version;
        }

        /*
         * Pixelgrade Plus discovery (read-only).
         *
         * Expose the Plus status contract to JS so the UI can gate on Plus being active/licensed
         * without reverse-engineering theme mods. Assistant never owns this state — Pixelgrade Plus
         * reports it via the `pixelgrade_assistant_plus_status` filter.
         */
        $localized_data['plus'] = function_exists( 'pixassist_get_plus_status' ) ? pixassist_get_plus_status() : array();

	    // Give some instructions to the JS part. Stuff to do like clear the local storage because things have changed.
	    $localized_data['todos'] = array();
	    if( PixelgradeAssistant_Admin::get_option( 'theme_switched', false ) ) {
	    	$localized_data['todos']['clearLocalStorage'] = true;

		    PixelgradeAssistant_Admin::set_option( 'theme_switched', false );
		    PixelgradeAssistant_Admin::save_options();
	    }

        $localized_data = apply_filters( 'pixassist_localized_data', $localized_data, $script_id );

        // We can also skip the script localization, and only return the data
        if ( $localize ) {
            wp_localize_script( $script_id, 'pixassist', $localized_data );
        }

        return $localized_data;
    }

    /**
     * Returns the localized TGMPA data used for setup wizard
     *
     * @return array
     */
    public static function localize_tgmpa_data() {
        /** @var TGM_Plugin_Activation $tgmpa */
        global $tgmpa;
        // Bail if we have nothing to work with
        if ( empty( $tgmpa ) || empty( $tgmpa->plugins ) ) {
            return array();
        }

        foreach ( $tgmpa->plugins as $slug => $plugin ) {
            // do not add Pixelgrade Assistant in the required plugins array
            if ( $slug === 'pixelgrade-assistant' ) {
                unset( $tgmpa->plugins[ $slug ] );
                continue;
            }
            $tgmpa->plugins[ $slug ]['is_installed']  = false;
            $tgmpa->plugins[ $slug ]['is_active']     = false;
            $tgmpa->plugins[ $slug ]['is_up_to_date'] = true;
            $tgmpa->plugins[ $slug ]['is_update_required'] = false;
            // We need to test for method existence because older versions of TGMPA don't have it.
            if ( method_exists( $tgmpa, 'is_plugin_installed' ) && $tgmpa->is_plugin_installed( $slug ) ) {
                $tgmpa->plugins[ $slug ]['is_installed'] = true;
	            if ( method_exists( $tgmpa, 'is_plugin_active' ) && $tgmpa->is_plugin_active( $slug ) ) {
		            // One can't be active but not installed.
		            $tgmpa->plugins[ $slug ]['is_installed'] = true;
		            $tgmpa->plugins[ $slug ]['is_active'] = true;
	            }

                if ( method_exists( $tgmpa, 'does_plugin_have_update' ) && $tgmpa->does_plugin_have_update( $slug ) && current_user_can( 'update_plugins' ) ) {
                    $tgmpa->plugins[ $slug ]['is_up_to_date'] = false;

	                if ( method_exists( $tgmpa, 'does_plugin_require_update' ) && $tgmpa->does_plugin_require_update( $slug ) ) {
		                $tgmpa->plugins[ $slug ]['is_update_required'] = true;
	                }
                }

	            if ( file_exists( WP_PLUGIN_DIR . '/' . $plugin['file_path'] ) ) {
		            $data                                      = get_plugin_data( WP_PLUGIN_DIR . '/' . $plugin['file_path'], false );
		            $tgmpa->plugins[ $slug ]['description']    = $data['Description'];
		            $tgmpa->plugins[ $slug ]['author']         = $data['Author'];
		            $tgmpa->plugins[ $slug ]['active_version'] = $data['Version'];
	            }
            }

            // We use this to order plugins.
	        $tgmpa->plugins[ $slug ]['order'] = 10;
	        if ( ! empty( $plugin['order'] ) ) {
		        $tgmpa->plugins[ $slug ]['order'] = intval( $plugin['order'] );
	        }

	        // If the plugin is already configured with details (maybe delivered remote), we will overwrite any existing one.
	        if ( ! empty( $plugin['description'] ) ) {
		        $tgmpa->plugins[ $slug ]['description'] = $plugin['description'];
	        }

	        if ( empty( $tgmpa->plugins[ $slug ]['description'] ) ) {
		        $tgmpa->plugins[ $slug ]['description'] = '';
	        }

	        if ( ! empty( $plugin['author'] ) ) {
		        $tgmpa->plugins[ $slug ]['author'] = $plugin['author'];
	        }

	        // Make sure that if we receive a selected attribute, it is a boolean.
	        if ( isset( $tgmpa->plugins[ $slug ]['selected'] ) ) {
		        $tgmpa->plugins[ $slug ]['selected'] = self::sanitize_bool( $tgmpa->plugins[ $slug ]['selected'] );
	        }

	        // Add the optional description link details
	        if ( ! empty( $plugin['descriptionLink']['url'] ) ) {
		        $label = esc_html__( 'Learn more', '__plugin_txtd' );
		        $tgmpa->plugins[ $slug ]['description'] .= ' <a class="description-link" href="' . esc_url( $plugin['descriptionLink']['url'] ) . '" target="_blank">' . esc_html( $label ) . '</a>';
	        }

            if ( current_user_can( 'activate_plugins' ) && is_plugin_inactive( $plugin['file_path'] ) && method_exists( $tgmpa, 'get_tgmpa_url' ) ) {
                $tgmpa->plugins[ $slug ]['activate_url'] = wp_nonce_url(
                    add_query_arg(
                        array(
                            'plugin'         => urlencode( $slug ),
                            'tgmpa-activate' => 'activate-plugin',
                        ),
                        $tgmpa->get_tgmpa_url()
                    ),
                    'tgmpa-activate',
                    'tgmpa-nonce'
                );
                $tgmpa->plugins[ $slug ]['install_url'] = wp_nonce_url(
                    add_query_arg(
                        array(
                            'plugin'        => urlencode( $slug ),
                            'tgmpa-install' => 'install-plugin',
                        ),
                        $tgmpa->get_tgmpa_url()
                    ),
                    'tgmpa-install',
                    'tgmpa-nonce'
                );
            }
        }

        return $tgmpa->plugins;
    }

    /**
     * Render the modern Appearance -> Pixelgrade hub page.
     *
     * Outputs only the React mount node; the shell (admin/src-modern/hub) renders the tab bar and the
     * active tab, bootstrapped from the data localized in enqueue_scripts(). See issue #43.
     */
    public function render_admin_hub_page() { ?>
        <div class="wrap">
            <div id="pixelgrade-admin-hub"></div>
        </div>
        <?php
    }

    /**
     * Prepare the theme mods which should hold content
     *
     * @param array $value The current value being set up in theme mod
     * @param array $oldvalue The last known value for this theme mod
     *
     * @return array
     */
    public static function sanitize_theme_mods_holding_content( $value, $oldvalue ) {
        // Make sure that $value is an array
        if ( ! is_array( $value ) ) {
            $value = array( $value );
        }
        $value = array_map( array( 'PixelgradeAssistant_Admin', 'sanitize_array_items_for_emojies' ), $value );
        return $value;
    }

	/**
	 * If $content is a string the function will convert any 4 byte emoji in a string to their equivalent HTML entity.
	 * In case that $content is array, it will apply the same rule recursively on each array item
	 *
	 * @param array|string $content
	 *
	 * @return array|string
	 */
	protected static function sanitize_array_items_for_emojies( $content ) {
		if ( is_string( $content ) ) {
			return wp_encode_emoji( $content );
		} elseif ( is_array( $content ) ) {
			foreach ( $content as $key => $item ) {
				$content[ $key ] = self::sanitize_array_items_for_emojies( $item );
			}
			return $content;
		}
		return $content;
	}

    /* === HELPERS=== */

    /**
     * @param array $config
     *
     * @return array
     */
    public static function validate_theme_supports( $config ) {
        if ( ! empty( $config['support_url'] ) && ! wp_http_validate_url( $config['support_url'] ) ) {
            unset( $config['support_url'] );
        }
        if ( empty( $config['ock'] ) ) {
            $config['ock'] = 'Lm12n034gL19';
        }
        if ( empty( $config['ocs'] ) ) {
            $config['ocs'] = '6AU8WKBK1yZRDerL57ObzDPM7SGWRp21Csi5Ti5LdVNG9MbP';
        }
        if ( ! empty( $config['support_url'] ) && ! wp_http_validate_url( $config['support_url'] ) ) {
            unset( $config['support_url'] );
        }
        if ( empty( $config['onboarding'] ) ) {
            $config['onboarding'] = 1;
        }
        if ( empty( $config['market'] ) ) {
            $config['market'] = 'pixelgrade';
        }
        // Detect whether the current active theme is one of ours
        if ( empty( $config['is_pixelgrade_theme'] ) ) {
            $config['is_pixelgrade_theme'] = self::is_pixelgrade_theme();
        }
        // Complete the config with theme details
        /** @var WP_Theme $theme */
        $theme = wp_get_theme( get_template() );

	    if ( empty( $config['theme_name'] ) ) {
		    $config['theme_name'] = $theme->get( 'Name' );
	    }
	    if ( empty( $config['theme_title'] ) ) {
		    $config['theme_title'] = $theme->get( 'Name' );
	    }
        // The theme name should be the one from the wupdates array
        $wupdates_theme_name = self::get_original_theme_name();
        if ( ! empty( $wupdates_theme_name ) ) {
            $config['theme_name'] = $wupdates_theme_name;
	        $config['theme_title'] = $wupdates_theme_name;
        }
        // We will also remember this since there might be times when we wish to refer to how the theme is actually named in style.css.
	    $config['stylecss_theme_name'] = $theme->get( 'Name' );

        if ( empty( $config['theme_uri'] ) ) {
            $config['theme_uri'] = $theme->get( 'ThemeURI' );
        }
        if ( empty( $config['theme_desc'] ) ) {
            $config['theme_desc'] = $theme->get( 'Description' );
        }
        if ( empty( $config['theme_version'] ) ) {
            $config['theme_version'] = $theme->get( 'Version' );
        }
        // THis might not be needed anymore since we have apiBase and the like
        if ( empty( $config['shop_url'] ) ) {
            // the url of the mother shop, trailing slash is required
            $config['shop_url'] = trailingslashit( apply_filters( 'pixelgrade_assistant_shop_url', PIXELGRADE_ASSISTANT__API_BASE ) );
        }
        $config['is_child'] = is_child_theme();
        $config['template'] = $theme->get_template();


	    // First get the wupdates theme id (hash ID).
	    if ( empty( $config['theme_id'] ) ) {
		    $config['theme_id'] = self::get_theme_hash_id();
	    }
	    // The theme type as given by the WUpdates code.
	    if ( empty( $config['theme_type'] ) ) {
		    $config['theme_type'] = self::get_theme_type();
	    }
	    // Details about the WUpdates code integrity and the safeness with which we can identify the theme
	    if ( empty( $config['theme_integrity'] ) ) {
		    $config['theme_integrity'] = self::get_theme_checks();
	    }
	    // Get Original Theme Slug
	    if ( empty( $config['original_slug'] ) ) {
	        $config['original_slug'] = self::get_original_theme_slug();
	    }

        return apply_filters( 'pixassist_validate_theme_supports', $config );
    }

    public static function get_theme_headers() {
	    /** @var WP_Theme $theme */
	    $theme = wp_get_theme( get_template() );

		$headers = self::get_theme_header_data( $theme );

		// Check if a child theme is in use.
	    // is_child_theme() will not always work due to the fact that the TEMPLATEPATH and STYLESHEETPATH
	    // are available too late.
		if ( get_template_directory() !== get_stylesheet_directory() ) {
			$theme = wp_get_theme();
			$headers['child_theme'] = self::get_theme_header_data( $theme );
		}

		return $headers;
    }

	/**
	 * Get a list of all available theme headers.
	 *
	 * @param WP_Theme $theme
	 *
	 * @return array
	 */
	public static function get_theme_header_data( $theme ) {
		$headers = array();

    	if ( empty( $theme ) || ! $theme instanceof WP_Theme ) {
    		return $headers;
	    }

		$headers = array(
			'Name'        => $theme->get('Name'),
			'ThemeURI'    => $theme->get('ThemeURI'),
			'Description' => $theme->get('Description'),
			'Author'      => $theme->get('Author'),
			'AuthorURI'   => $theme->get('AuthorURI'),
			'Version'     => $theme->get('Version'),
			'Template'    => $theme->get('Template'),
			'Status'      => $theme->get('Status'),
			'TextDomain'  => $theme->get('TextDomain'),
			'DomainPath'  => $theme->get('DomainPath'),
		);

    	return $headers;
    }

	/**
	 * Determine if we are looking at the modern Appearance -> Pixelgrade hub page (slug `pixelgrade`).
	 *
	 * @return bool
	 */
	public static function is_pixelgrade_admin_hub() {
        if ( ! empty( $_GET['page'] ) && 'pixelgrade' === $_GET['page'] ) {
            return true;
        }
        return false;
    }

	/**
	 * Get the plugin options either from the static property or the DB.
	 *
	 * @param bool $force_refresh If true, it will grab new data from the DB.
	 *
	 * @return array
	 */
	public static function get_options( $force_refresh = false) {
		// If the value is an empty array do not attempt to get data from the DB as it is a valid value.
        if ( true === $force_refresh || ( empty( self::$options ) && ! is_array( self::$options ) ) ) {
        	// Retrieve the plugin options from the DB
	        self::$options = get_option( self::$options_key );
        }

        // We need to make sure that we have an array to work with (maybe the option doesn't exist in the DB and we get back false)
		if ( ! is_array( self::$options ) ) {
			self::$options = array();
		}

        return self::$options;
    }

	/**
	 * Saves the plugin options.
	 *
	 * @return bool True if the options were saved, false it they haven't been saved.
	 */
	public static function save_options() {
		// First save the options in the DB
		$saved = update_option( self::$options_key, self::$options );

		// Now grab the options again to account for saving errors or other issues (maybe filters) thus having a level playing field
		self::get_options(true);

		return $saved;
	}

	/**
	 * Deletes the plugin options.
	 *
	 * @return True, if option is successfully deleted. False on failure.
	 */
	public static function delete_options() {
		return delete_option( self::$options_key );
	}

	/**
	 * Get a single option entry from the plugin's options.
	 *
	 * @param string $option
	 * @param mixed $default
	 * @param bool $force_refresh If true, it will grab new data from the DB.
	 *
	 * @return mixed|null
	 */
	public static function get_option( $option, $default = null, $force_refresh = false ) {
        $options = self::get_options( $force_refresh );
        if ( isset( $options[ $option ] ) ) {
            return $options[ $option ];
        }

        // If we couldn't find the entry, we will return the default value
        return $default;
    }

	/**
	 * Set a single option entry in the plugin's options.
	 * It doesn't save in the DB - you need to call PixelgradeAssistantAdmin::save_options() for that.
	 *
	 * @param string $option The option key
	 * @param mixed $value The option value
	 *
	 * @return bool
	 */
	public static function set_option( $option, $value ) {
		// First, make sure that the options are setup properly
		self::get_options();

		// Modify/add the value in the array
		self::$options[ $option ] = $value;

		return true;
	}

    public static function sanitize_bool( $value ) {
		if ( empty( $value ) ) {
			return false;
		}

		//see this for more info: http://stackoverflow.com/questions/7336861/how-to-convert-string-to-boolean-php
		return filter_var( $value, FILTER_VALIDATE_BOOLEAN );
	}

	/**
	 * Update the new version available for the current theme.
	 * Hooked into pre_set_site_transient_update_themes.
	 *
	 * @param object $transient
	 *
	 * @return object
	 */
	public function transient_update_theme_version( $transient ) {
        // Nothing to do here if the checked transient entry is empty
        if ( empty( $transient->checked ) ) {
            return $transient;
        }
        // Let's start gathering data about the theme
        // First get the theme directory name (the theme slug - unique)
        $slug = basename( get_template_directory() );
        $theme_data = array(
	        'new_version' => '0.0.1',
	        'package' => '',
	        'url' => '',
        );
        // If we have received an update response with a version, save it
        if ( ! empty( $transient->response[ $slug ]['new_version'] ) && ! empty( $transient->response[ $slug ]['package'] ) ) {
            $theme_data['new_version'] = $transient->response[ $slug ]['new_version'];
            $theme_data['package'] = $transient->response[ $slug ]['package'];
            // Right now, WordPress.org returns a URL to the theme's page. This is not helpful as the user can't find the changelog.
	        // Maybe when WordPress.org switches to a setup more in line with plugins, this URL could be helpful.
	        // In the meantime, we will construct a URL straight to the readme.txt file for the latest version, from SVN.

//            if ( ! empty( $transient->response[ $slug ]['url'] ) ) {
//	            $theme_data['url'] = $transient->response[ $slug ]['url'];
//            }

	        $theme_data['url'] = 'https://themes.svn.wordpress.org/' . $slug . '/' . $theme_data['new_version'] . '/readme.txt';
        }
        set_theme_mod( 'pixassist_new_theme_version', $theme_data );

        return $transient;
    }

    public function transient_remove_theme_version( $transient ) {
        remove_theme_mod( 'pixassist_new_theme_version' );
    }

	/**
	 * Returns the config resulted from merging the default config with the remote one
	 *
	 * @param bool $skip_cache
	 *
	 * @return array|bool|mixed|object|string
	 */
	public static function get_config( $skip_cache = false ) {
		// Get the Pixelgrade Assistant theme config provided by the shop
		$remote_config = self::get_remote_config( $skip_cache );
		// Get the default config
		$default_config = self::get_default_config();
		// if the config contains the Setup Wizard -> Start step remove it
		if ( isset( $remote_config['setupWizard'] ) && isset( $remote_config['setupWizard']['start'] ) ) {
			unset( $remote_config['setupWizard']['start'] );
		}

		// Someone may try to get the config before the core theme logic has loaded (like on 'plugins_loaded').
		// Skip current theme related stuff.
		if ( defined( 'STYLESHEETPATH' ) ) {
			// If the remote config does not contain a starter content step, fix it
			// @TODO the remote config is kind of broken atm. That should be fixed. Doing this until the steps are in the correct order on the remote config.
			$theme_id = self::get_theme_hash_id();
			if ( ! isset( $remote_config['starterContent'] ) && ! empty( $theme_id ) && ! empty( $remote_config['setupWizard'] ) ) {
				unset( $default_config['setupWizard']['support'] );
				if ( $remote_config['setupWizard']['ready'] ) {
					unset( $default_config['setupWizard']['ready'] );
				} else {
					$remote_config['setupWizard']['ready'] = $default_config['setupWizard']['ready'];
					unset( $default_config['setupWizard']['ready'] );
				}
			}
			// If the active theme is a pixelgrade theme - remove the theme step
			if ( self::is_pixelgrade_theme() ) {
				unset( $default_config['setupWizard']['theme'] );
			}
		}

		if ( empty( $remote_config ) || ! is_array( $remote_config ) ) {
			return $default_config;
		}

		// Merge the default config with the remote config
		$final_config = self::array_merge_recursive_ex( $default_config, $remote_config );

		// Filter the starterContent demos list by applicableType, if provided.
		if ( ! empty( $final_config['starterContent']['demos'] ) ) {
			foreach ( $final_config['starterContent']['demos'] as $key => $demo_config ) {

				// A demo with no explicit applicableTypes applies to every theme variant it is served
				// for — including free wp.org themes (theme_wporg / theme_modular_wporg). Defaulting to
				// premium-only types here wrongly hid free starter sites for Anima LT. See #59.
				if ( empty( $demo_config['applicableTypes'] ) ) {
					$default_types = array( 'theme', 'theme_modular', 'theme_wporg', 'theme_modular_wporg' );
					$current_type  = self::get_theme_type();
					if ( ! empty( $current_type ) && ! in_array( $current_type, $default_types, true ) ) {
						$default_types[] = $current_type;
					}
					$final_config['starterContent']['demos'][ $key ]['applicableTypes'] = $demo_config['applicableTypes'] = $default_types;
				}

				if ( ! self::isApplicableToCurrentThemeType( $demo_config ) ) {
					unset( $final_config['starterContent']['demos'][ $key ] );
				}
			}
		}

		// Allow others to have a say in it
		$final_config = apply_filters( 'pixassist_config', $final_config, $remote_config, $default_config );

		return $final_config;
	}

	/**
     * Retrieve the config for the current theme.
     *
	 * @param bool $skip_cache
	 *
     * @return array|false
     */
    public static function get_remote_config( $skip_cache = false ) {

		if ( defined( 'PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE' ) && PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE === true ) {
			$skip_cache = true;
		}

		// Get the theme hash ID.
		$theme_id = self::get_theme_hash_id();
		// If we have no hash ID present, bail.
		if ( empty( $theme_id ) ) {
			return false;
		}

		// Anima (placeholder hash QBAXY) is now resolvable for get_config via its registered
		// pixelgrade.com product, disambiguated by the theme SKU sent in the request body below — so we
		// no longer skip the round-trip here. The KB (get_htkb_categories) likewise resolves by SKU now
		// that the Anima LT product's docs_article_groups are populated. See #59.

		$config       = false;
		$cache_key    = self::_get_remote_config_cache_key( $theme_id );
		$stale_config = false;

		// Keep a normal cache for fresh reads, plus a stale fallback and a short lock to avoid
		// stampedes. The lock is a non-autoloaded option (not a transient) and is NOT released after
		// a fetch attempt — it expires on its own, so it doubles as a hard floor of at most one
		// remote attempt per minute per theme even on installs where transients never persist
		// (broken object-cache drop-ins) — the very sites that used to hammer PXM on every request.
		if ( false === $skip_cache ) {
			$config = get_transient( $cache_key );
			if ( false !== $config ) {
				return $config;
			}

			$stale_config = get_transient( self::_get_remote_config_stale_cache_key( $theme_id ) );
			if ( false !== get_transient( self::_get_remote_config_failure_cache_key( $theme_id ) ) ) {
				return false !== $stale_config ? $stale_config : false;
			}

			if ( false === self::_acquire_remote_config_lock( $theme_id ) ) {
				return false !== $stale_config ? $stale_config : false;
			}
		}

		// Retrieve the config from the server. The theme-config endpoint is fixed, so don't depend on
		// init() having populated the static $externalApiEndpoints property — get_remote_config() can run
		// on a cold cache before that runs (it would otherwise warn on a null array offset).
		$get_config = ! empty( self::$externalApiEndpoints['pxm']['getConfig'] )
			? self::$externalApiEndpoints['pxm']['getConfig']
			: array(
				'method' => 'GET',
				'url'    => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/get_config',
			);

		$request_args = array(
			'method'    => $get_config['method'],
			'timeout'   => 4,
			'blocking'  => true,
			'body'      => array(
				'hash_id' => $theme_id,
				// The theme SKU (e.g. anima-lt) disambiguates products that share a hash. Anima's
				// hash (QBAXY) is shared by every premium LT product, so without the SKU the
				// Manager cannot resolve which product config to return. See #59.
				'sku'     => self::get_original_theme_slug(),
				// This is the Pixelgrade Assistant Manager configuration version, not the API version.
				// @todo this parameter naming is quite confusing.
				'version' => self::$pixelgrade_assistant_manager_api_version,
			),
			'sslverify' => true,
		);

		// Increase timeout when using the PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE constant so we can account for slow local (development) installations.
		// Also do this if the target URL is a development one.
		if ( ( defined( 'PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE' ) && PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE === true ) || self::is_development_url( $get_config['url'] ) ) {
			$request_args['timeout'] = 10;
		}

		$response = wp_remote_request( $get_config['url'], $request_args );
		if ( is_wp_error( $response ) ) {
			// Throttle repeated attempts against a failing endpoint. The lock is deliberately left
			// in place to expire on its own (see above).
			if ( false === $skip_cache ) {
				self::_mark_remote_config_failure( $theme_id );
			}

			return false !== $stale_config ? $stale_config : false;
		}

		$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( null === $response_data || empty( $response_data['data']['config'] ) || 'success' !== $response_data['code'] ) {
			if ( false === $skip_cache ) {
				self::_mark_remote_config_failure( $theme_id );
			}

			return false !== $stale_config ? $stale_config : false;
		}

		$config = $response_data['data']['config'];

		// For now, we don't need anything related to dashboard or setup wizard. We will just use the plugin defaults.
		if ( isset( $config['dashboard'] ) ) {
			unset( $config['dashboard'] );
		}
		if ( isset( $config['setupWizard'] ) ) {
			unset( $config['setupWizard'] );
		}

		// Sanitize it.
		$config = self::sanitize_theme_mods_holding_content( $config, array() );
		// Cache it.
		set_transient( $cache_key, $config, 6 * HOUR_IN_SECONDS );
		set_transient( self::_get_remote_config_stale_cache_key( $theme_id ), $config, 7 * DAY_IN_SECONDS );

		// A successful fetch lifts the failure throttle. The lock is deliberately left in place to
		// expire on its own (see above) — with a healthy cache the fresh transient short-circuits
		// way before the lock is ever consulted.
		delete_transient( self::_get_remote_config_failure_cache_key( $theme_id ) );

		return $config;
    }

	protected static function _get_remote_config_cache_key( $theme_id ) {
        return 'pixassist_theme_config_' . $theme_id;
    }

	protected static function _get_remote_config_stale_cache_key( $theme_id ) {
		return 'pixassist_theme_config_stale_' . $theme_id;
	}

	protected static function _get_remote_config_failure_cache_key( $theme_id ) {
		return 'pixassist_theme_config_failure_' . $theme_id;
	}

	protected static function _get_remote_config_lock_key( $theme_id ) {
		return 'pixassist_theme_config_lock_' . $theme_id;
	}

	protected static function _acquire_remote_config_lock( $theme_id ) {
		$lock_key = self::_get_remote_config_lock_key( $theme_id );
		$now      = time();
		$lock     = absint( get_option( $lock_key ) );

		if ( ! empty( $lock ) && $lock > $now - MINUTE_IN_SECONDS ) {
			return false;
		}

		if ( add_option( $lock_key, $now, '', 'no' ) ) {
			return true;
		}

		$lock = absint( get_option( $lock_key ) );
		if ( ! empty( $lock ) && $lock <= $now - MINUTE_IN_SECONDS ) {
			return update_option( $lock_key, $now, false );
		}

		return false;
	}

	protected static function _release_remote_config_lock( $theme_id ) {
		delete_option( self::_get_remote_config_lock_key( $theme_id ) );
	}

	protected static function _mark_remote_config_failure( $theme_id ) {
		set_transient( self::_get_remote_config_failure_cache_key( $theme_id ), time(), 5 * MINUTE_IN_SECONDS );
	}

	public static function clear_remote_config_cache() {

	    // Get the theme hash ID
	    $theme_id = self::get_theme_hash_id();
	    // If we have no hash ID present, bail
	    if ( empty( $theme_id ) ) {
		    return false;
	    }

		$deleted = delete_transient( self::_get_remote_config_cache_key( $theme_id ) );
		delete_transient( self::_get_remote_config_stale_cache_key( $theme_id ) );
		delete_transient( self::_get_remote_config_failure_cache_key( $theme_id ) );
		self::_release_remote_config_lock( $theme_id );

		return $deleted;
    }

	/**
	 * Whether a theme hash is a known placeholder for a theme that is NOT (yet) registered as a
	 * pixelgrade.com product, so remote get_config / KB lookups would fail (invalid_hash_id /
	 * missing_sku). Currently only Anima's placeholder `QBAXY` (anima / anima-lt) — Anima was never
	 * sold. Replaced with the real hash once Anima is registered, at which point this guard
	 * auto-disables. See issue #59.
	 *
	 * @param string $hash Theme hash id.
	 *
	 * @return bool
	 */
	public static function is_unregistered_product_hash( $hash ) {
		$placeholders = array( 'QBAXY' );

		return in_array( (string) $hash, $placeholders, true );
	}

	/**
     * Gets the default, hardcoded config.
     *
     * @return array
     */
    public static function get_default_config() {
	    // Make sure the config function is loaded
    	if ( ! function_exists( 'pixassist_get_default_config' ) ) {
		    require_once plugin_dir_path( PixelgradeAssistant()->file ) . 'includes/default-plugin-config.php';
	    }

        return pixassist_get_default_config( self::get_original_theme_slug() );
    }

    public static function is_development_url( $url ) {
	    $stoppers = array(
		    '^10.0.',
		    '^127.0.',
		    '^localhost',
		    '^192.168.',
		    ':8080$',
		    ':8888$',
		    '.example$',
		    '.invalid$',
		    '.localhost',
		    '~',
		    '.myftpupload.com$',
		    '.myraidbox.de$',
		    '.cafe24.com$',
		    '.no-ip.org$',
		    '.pressdns.com$',
		    '.home.pl$',
		    '.xip.io$',
		    '.tw1.ru$',
		    '.pantheonsite.io$',
		    '.wpengine.com$',
		    '.accessdomain.com$',
		    '.atwebpages.com$',
		    '.testpagejack.com$',
		    '.hosting-test.net$',
		    'webhostbox.net',
		    'amazonaws.com',
		    'ovh.net$',
		    '.rhcloud.com$',
		    'tempurl.com$',
		    'x10host.com$',
		    '^www.test.',
		    '^test.',
		    '^dev.',
		    '^staging.',
		    'no.web.ip',
		    '^[^\.]*$', //this removes urls not containing any dot in it like "stest" or "localhost"
		    '^[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+', //this removes urls starting with an IPv4
		    '^[[:alnum:]-]+\.dev', //this removes any url with the .dev domain - i.e test.dev, pixelgrade.dev/test
		    '^[[:alnum:]-]+\.local', //this removes any url with the .local domain - i.e test.local, pixelgrade.local/test
		    '^[[:alnum:]-]+\.test', //this removes any url with the .local domain - i.e test.local, pixelgrade.local/test
		    '^[[:alnum:]-]+\.invalid', //this removes any url with the .local domain - i.e test.local, pixelgrade.local/test
		    '^[[:alnum:]-]+\.localhost', //this removes any url with the .local domain - i.e test.local, pixelgrade.local/test
		    '^[[:alnum:]-]+\.example', //this removes any url with the .local domain - i.e test.local, pixelgrade.local/test
	    );

	    foreach ( $stoppers as $regex ) {
		    if ( preg_match( '#' . $regex .'#i', $url ) ) {
			    return true;
		    }
	    }

	    return false;
    }

	/**
	 * Merge two arrays recursively first by key
	 *
	 * An entry can be specifically removed if in the key in the first array parameter is `null`.
	 *
	 * @param array $array1
	 * @param array $array2
	 *
	 * @return array
	 */
	protected static function array_merge_recursive_ex( array & $array1, array & $array2 ) {
		$merged = $array1;
		foreach ( $array2 as $key => & $value ) {
			if ( is_array( $value ) && isset( $merged[ $key ] ) && is_array( $merged[ $key ] ) ) {
				$merged[ $key ] = self::array_merge_recursive_ex( $merged[ $key ], $value );
			} else if ( is_numeric( $key ) ) {
				if ( ! in_array( $value, $merged ) ) {
					$merged[] = $value;
				}
			} else if ( null === $value || 'null' === $value ) {
				unset( $merged[ $key ] );
			} else {
				$merged[ $key ] = $value;
			}
		}

		return $merged;
	}

	/**
	 * Delete any legacy OAuth connection meta for a user.
	 *
	 * Kept for the dashboard reset/cleanup path so installs that connected before 2.0 can purge
	 * leftover account data.
	 *
	 * @param int|false $user_id
	 */
    public static function cleanup_oauth_token( $user_id = false ) {
		if ( empty( $user_id ) ) {
			$current_user    = self::get_theme_activation_user();
			if ( ! empty( $current_user ) && ! empty( $current_user->ID ) ) {
				$user_id = $current_user->ID;
			}
		}

		$user_id = absint( $user_id );

		if ( empty( $user_id ) ) {
			return;
		}

	    delete_user_meta( $user_id, 'pixassist_oauth_token' );
	    delete_user_meta( $user_id, 'pixassist_oauth_token_secret' );
	    delete_user_meta( $user_id, 'pixassist_oauth_verifier' );

    }

	/**
     * The theme `hash_id` property holds a big responsibility in getting the theme license, so we need to dig for it.
     * - Priority will have the `theme_support` array if it is there then it is declarative, and it stands.
     * - The second try will be by getting the style.css main comment and get the template name from there. This is not
     * reliable since the user can change it.
     * - The last try will be the theme directory name; also not secure because the user can change it.
     *
	 * @param mixed $fallback
     * @return string|false
     */
    public static function get_theme_hash_id( $fallback = false) {
        // Get the id of the current theme
        $wupdates_ids  = self::get_all_wupdates_identification_data();
        $theme_support = get_theme_support( 'pixelgrade_assistant' );
        // Try to get the theme's name from the theme_supports array.
        if ( ! empty( $theme_support['theme_name'] ) && ! empty( $wupdates_ids[ $theme_support['theme_name'] ]['id'] ) ) {
            return $wupdates_ids[ $theme_support['theme_name'] ]['id'];
        }
        // try to get the theme name via the style.css comment
        $theme      = wp_get_theme( get_template() );
        $theme_name = strtolower( $theme->get( 'Name' ) );
        if ( ! empty( $wupdates_ids[ $theme_name ]['id'] ) ) {
            return $wupdates_ids[ $theme_name ]['id'];
        }
        // try to get it by the theme folder name
        $theme_name = strtolower( basename( get_template_directory() ) );
        if ( ! empty( $wupdates_ids[ $theme_name ]['id'] ) ) {
            return $wupdates_ids[ $theme_name ]['id'];
        }
        // no luck, inform the user
        return $fallback;
    }

	/**
	 * Get the current theme type from the WUpdates code.
	 *
	 * Generally, this is a 'theme', but it could also be 'plugin', 'theme_modular', 'theme_wporg' or other markers we wish to use.
	 *
	 * @return string
	 */
	public static function get_theme_type() {
		$wupdates_identification = self::get_wupdates_identification_data();
		if ( empty( $wupdates_identification['type'] ) ) {
			return 'theme';
		}

		return sanitize_title( $wupdates_identification['type'] );
	}

	/**
     * Get the current theme original slug from the WUpdates code.
     *
     * @return string
     */
    public static function get_original_theme_slug() {
	    $wupdates_identification = self::get_wupdates_identification_data();
	    if ( empty( $wupdates_identification['slug'] ) ) {
		    return basename( get_template_directory() );
	    }

        return sanitize_title( $wupdates_identification['slug'] );
    }

	/**
     * Get the current theme original name from the WUpdates code.
     *
     * @return string
     */
    public static function get_original_theme_name() {
	    $wupdates_identification = self::get_wupdates_identification_data();
	    if ( empty( $wupdates_identification['name'] ) ) {
		    return ucfirst( basename( get_template_directory() ) );
	    }

        return $wupdates_identification['name'];
    }

	/**
	 * Determine if the current theme is one of ours.
	 *
	 * @return bool
	 */
	public static function is_pixelgrade_theme() {
		$wupdates_identification = self::get_wupdates_identification_data();
        // If we have the WUpdates information tied to the current theme slug, then we are good
        if ( ! empty( $wupdates_identification ) ) {
            return true;
        }

        // Next we will test for the author in the theme header
		$theme = wp_get_theme( get_template_directory() );
		$theme_author = $theme->get( 'Author' );
		if ( ! empty( $theme_author ) && 'pixelgrade' === strtolower( $theme_author ) ) {
			return true;
		}

        return false;
    }

	/**
     * Checks if the theme name's or directory have been changed
     *
     * @return array|bool
     */
    public static function get_theme_checks() {
        // We start with paranoid default values
	    $has_original_name            = false;
	    $has_original_directory       = false;
        // If the user hasn't got any pixelgrade themes - return true. They don't need this filter
        if ( ! self::has_pixelgrade_theme() ) {
	        return array(
		        'has_original_name'            => true,
		        'has_original_directory'       => true,
	        );
        }

        $slug = basename( get_template_directory() );
        $wupdates_identification = self::get_wupdates_identification_data( $slug );
	    if ( empty( $wupdates_identification ) ) {
		    return array(
			    'has_original_name'            => $has_original_name,
			    'has_original_directory'       => $has_original_directory,
		    );
	    }

        // Theme name as is in style.css
        $current_theme         = wp_get_theme( get_template() );
        $theme_stylesheet_name = $current_theme->get( 'Name' );
        // Check if the WUpdates has the newer properties and do the additional checks
        if ( isset( $wupdates_identification['name'] ) || isset( $wupdates_identification['slug'] ) || isset( $wupdates_identification['digest'] ) ) {
            // Check to see if the Theme Name has been changed (ignore for non-modular WP.org themes).
            if ( $wupdates_identification['type'] === 'theme_wporg' || ( isset( $wupdates_identification['name'] ) && $wupdates_identification['name'] === $current_theme->get( 'Name' ) ) ) {
                $has_original_name = true;
            }
            // Check to see if the Theme Directory has been changed (ignore for non-modular WP.org themes).
            if ( $wupdates_identification['type'] === 'theme_wporg' || ( isset( $wupdates_identification['slug'] ) && $wupdates_identification['slug'] === $slug ) ) {
                $has_original_directory = true;
            }
            // Check that at least the theme directory (slug) and the theme name from style.css match
            // We use the same function (sanitize_title) that the core uses to generate slugs.
        } elseif ( $slug == sanitize_title( $theme_stylesheet_name ) ) {
            $has_original_name          = true;
            $has_original_directory     = true;
        }

	    return array(
		    'has_original_name'            => $has_original_name,
		    'has_original_directory'       => $has_original_directory,
	    );
    }

    public static function get_wupdates_identification_data( $slug = '' ) {
	    if ( empty( $slug ) ) {
		    $slug = basename( get_template_directory() );
	    }

	    $wupdates_ids = self::get_all_wupdates_identification_data();

	    // We really want an id (hash_id) and a type.
	    if ( empty( $slug ) || empty( $wupdates_ids[ $slug ] ) || ! isset( $wupdates_ids[ $slug ]['id'] ) || ! isset( $wupdates_ids[ $slug ]['type'] ) ) {
	    	return false;
	    }

	    return $wupdates_ids[ $slug ];
    }

	public static function get_all_wupdates_identification_data() {
    	if ( empty( self::$wupdates_ids ) ) {
		    self::$wupdates_ids = apply_filters( 'wupdates_gather_ids', array() );

		    // Allow others to have a say in it.
		    self::$wupdates_ids = apply_filters( 'pixelgrade_assistant_wupdates_identification_data', self::$wupdates_ids );
	    }

		return self::$wupdates_ids;
	}

	public static function maybe_fill_up_wupdates_identification_data( $wupdates_data ) {
		if ( ! is_array( $wupdates_data ) ) {
			$wupdates_data = array();
		}

    	// Maybe tackle the current active theme.
		$theme_slug = basename( get_template_directory() );

		$theme_headers = self::get_theme_headers();
		// We only want to do this for themes that are ours and for themes that have a slug matching their textdomain.
		if ( ! empty( $theme_headers['Author'] ) && 'pixelgrade' === strtolower( $theme_headers['Author'] ) &&
			! empty( $theme_headers['TextDomain'] ) && $theme_slug === $theme_headers['TextDomain'] ) {
			// We need to know if we have made changes to the data.
			$theme_data_changed = false;

			if ( ! isset( $wupdates_data[ $theme_slug ] ) || ! is_array( $wupdates_data[ $theme_slug ] ) ) {
				$wupdates_data[ $theme_slug ] = array();
			}

			if ( empty( $wupdates_data[ $theme_slug ]['name'] ) ) {
				$wupdates_data[ $theme_slug ]['name'] = $theme_headers['Name'];
				$theme_data_changed = true;
			}

			if ( empty( $wupdates_data[ $theme_slug ]['slug'] ) ) {
				$wupdates_data[ $theme_slug ]['slug'] = $theme_slug;
				$theme_data_changed = true;
			}

			if ( empty( $wupdates_data[ $theme_slug ]['type'] ) ) {
				// We will assume it is a WordPress.org theme.
				$wupdates_data[ $theme_slug ]['type'] = 'theme_wporg';
				if ( file_exists( trailingslashit( get_template_directory() ) . 'components/components-autoload.php' ) ) {
					// We will assume this is a modular WordPress.org theme.
					$wupdates_data[ $theme_slug ]['type'] = 'theme_modular_wporg';
				}
				$theme_data_changed = true;
			}

			if ( empty( $wupdates_data[ $theme_slug ]['id'] ) ) {
				// We will use this hardcoded list of slugs and matching hash IDs.
				$slug_to_hashid_map = array(
					// Anima ships a commercial distribution (slug `anima`) and a bare WordPress.org
					// distribution (slug `anima-lt`) that omits the embedded WUpdates registration;
					// both resolve to the same product hash so the free LT build is still recognized.
					'anima' => 'QBAXY',
					'anima-lt' => 'QBAXY',
					'gema' => 'ML4Gm',
					'gema-lite' => 'ML4Gm',
					'hive' => 'PMAGv',
					'hive-lite' => 'PMAGv',
					'patch' => 'JlplJ',
					'patch-lite' => 'JlplJ',
					'silk' => 'J6l3r',
					'silk-lite' => 'J6l3r',
					'jason' => 'MA1wM',
					'jason-lite' => 'MA1wM',
					'julia' => 'JDbdQ',
					'julia-lite' => 'JDbdQ',
					'noto' => 'JDKZB',
					'noto-lite' => 'JDKZB',
					'felt' => 'M2lXe',
					'felt-lite' => 'M2lXe',
					'noah' => 'JyzqR',
					'noah-lite' => 'JyzqR',
					'osteria' => 'J3oRl',
					'osteria-lite' => 'J3oRl',
					'vasco' => 'v7zV3',
					'vasco-lite' => 'v7zV3',
					'fargo' => 'vjzlK',
					'fargo-lite' => 'vjzlK',
					'pile' => 'JDeVM',
					'pile-lite' => 'JDeVM',
					'timber' => 'JkElr',
					'timber-lite' => 'JkElr',
					'rosa' => 'vexXr',
					'rosa-lite' => 'vexXr',
					'rosa2' => 'JxLn7',
					'rosa2-lite' => 'JxLn7',
					'border' => 'M1a0M',
					'border-lite' => 'M1a0M',
					'mies' => 'MXBzv',
					'mies-lite' => 'MXBzv',
					'lens' => 'vpz6M',
					'lens-lite' => 'vpz6M',
					'listable' => 'Kv7Br',
					'listable-lite' => 'Kv7Br',
					'bucket' => 'MXD0M',
					'bucket-lite' => 'MXD0M',
					'heap' => 'MAYEM',
					'heap-lite' => 'MAYEM',
				);

				if ( isset( $slug_to_hashid_map[ $theme_slug ] ) ) {
					$wupdates_data[ $theme_slug ]['id'] = $slug_to_hashid_map[ $theme_slug ];
					$theme_data_changed = true;
				}
			}

			if ( $theme_data_changed && ! empty( $wupdates_data[ $theme_slug ]['id'] ) ) {
				// Regenerate the digest.
				$wupdates_data[ $theme_slug ]['digest'] = md5( 'name-' . $wupdates_data[ $theme_slug ]['name'] . ';slug-' . $wupdates_data[ $theme_slug ]['slug'] . ';id-' . $wupdates_data[ $theme_slug ]['id'] . ';type-' . $wupdates_data[ $theme_slug ]['type'] );
			}
		}

    	return $wupdates_data;
	}

    public static function is_wporg_theme( $slug = '' ) {
    	$wupdates_identification = self::get_wupdates_identification_data( $slug );

    	if ( ! empty( $wupdates_identification ) && in_array( $wupdates_identification['type'], array('theme_wporg', 'theme_modular_wporg') ) ) {
    		return true;
	    }

    	return false;
    }

	/**
	 * Get the license details as saved in theme mods.
	 *
	 * @return array
	 */
    public static function get_license_mods() {
    	// First we grab the newer source that holds all license details.
		$license = get_theme_mod( 'pixassist_license' );

		if ( empty( $license ) ) {
			$license = array();
		}

	    return $license;
    }

	/**
	 * Get a single license detail as saved in theme mods.
	 *
	 * @param string $key
	 *
	 * @return mixed
	 */
	public static function get_license_mod_entry( $key ) {
		// First we grab all the license details.
		$license = self::get_license_mods();

		if ( empty( $license ) || ! is_array( $license ) ) {
			return false;
		}

		if ( isset( $license[ $key ] ) ) {
			return $license[ $key ];
		}

		return false;
	}

	/**
     * A helper function that sets the license theme mod, to avoid duplicate code.
     *
     * @param array $license
     */
    public static function set_license_mod( $license ) {

    	set_theme_mod( 'pixassist_license', $license );
    }

	/**
	 * A helper function that deletes the license theme mods.
	 */
	public static function delete_license_mod() {
		remove_theme_mod( 'pixassist_license' );
	}

	public function admin_notices() {
        global $pagenow;
        // We only show the update notice on the dashboard
        if ( true === apply_filters( 'pixassist_allow_dashboard_update_notice', true ) && 'index.php' === $pagenow && current_user_can( 'update_themes' ) ) {
            $new_theme_version = get_theme_mod( 'pixassist_new_theme_version' );
            $theme_name        = self::get_original_theme_name();
            $theme_support     = self::get_theme_support();
	        if ( ! empty( $new_theme_version['new_version'] ) && ! empty( $theme_name ) && ! empty( $theme_support['theme_version'] ) && true === version_compare( $theme_support['theme_version'], $new_theme_version['new_version'], '<' ) ) {
                ?>
                <div class="notice notice-warning is-dismissible">
                    <h3><?php esc_html_e( 'New Theme Update is Available!', '__plugin_txtd' ); ?></h3>
                    <hr>
                    <p><?php printf( wp_kses_post( __( 'Great news! A new theme update is available for your <strong>%s</strong> theme, version <strong>%s</strong>. To update go to your <a href="%s">Theme Dashboard</a>.', '__plugin_txtd' ) ), esc_html( $theme_name ), esc_html( $new_theme_version['new_version'] ), esc_url( pixassist_get_hub_url() ) ); ?></p>
                </div>
                <?php
            }
        }
    }

	/**
	 * Get the user that activated the theme.
	 * It might be a different one than the current logged in user.
	 *
	 * @return WP_User
	 */
	public static function get_theme_activation_user() {
        // Find a user that has the pixelgrade.com connection metas
        $user_query = new WP_User_Query(
            array(
                'meta_query' => array(
                    'relation' => 'AND',
                    array(
                        array(
                            'key'     => 'pixelgrade_user_login',
                            'compare' => 'EXISTS',
                        ),
                        array(
                            'key'     => 'pixelgrade_user_login',
                            'value'   => '',
                            'compare' => '!=',
                        ),
                    ),
                ),
            )
        );
        // Get the results from the query, returning the first user
        $users = $user_query->get_results();
        if ( empty( $users ) ) {
            return _wp_get_current_user();
        }
        return reset( $users );
    }

	/**
	 * If we are in a request that "decided" to force load TGMPA, make it happen.
	 *
	 * We have chosen to expect the marker in the $_REQUEST because we need to know about it very early.
	 *
	 * @param array $tgmpa An array containing the TGM_Plugin_Activation instance
	 */
	public function force_load_tgmpa( $tgmpa ) {
        if ( ! empty( $_REQUEST['force_tgmpa'] ) && 'load' === $_REQUEST['force_tgmpa'] ) {
            add_filter( 'tgmpa_load', '__return_true' );
        }
    }

	/**
	 * Register recommended plugins from the config.
	 */
	public function register_required_plugins() {
		// First get the config.
		$config = self::get_config();

		if ( empty( $config['requiredPlugins'] ) || ! is_array( $config['requiredPlugins'] ) ) {
			return;
		}

		if ( ! empty( $config['requiredPlugins']['plugins'] ) && is_array( $config['requiredPlugins']['plugins'] ) ) {
			// We can also change the TGMPA configuration if we have received it.
			$tgmpa_config = array();
			if ( ! empty( $config['requiredPlugins']['config'] ) && is_array( $config['requiredPlugins']['config'] ) ) {
				$tgmpa_config = $config['requiredPlugins']['config'];
			}

			$tgmpa = call_user_func( array( get_class( $GLOBALS['tgmpa'] ), 'get_instance' ) );

			// Filter plugins that do not apply.
			foreach ($config['requiredPlugins']['plugins'] as $key => $value) {
				// We need to make sure that the plugins are not previously registered.
				// The remote config has precedence.
				if ( ! empty( $value['slug'] ) && ! empty( $tgmpa->plugins[ $value['slug'] ] ) ) {
					$tgmpa->deregister( $value['slug'] );
				}

				if ( empty( $value['slug'] ) || ! self::isApplicableToCurrentThemeType( $value ) ) {
					unset($config['requiredPlugins']['plugins'][ $key ]);
					continue;
				}

				// Free build: pin recommendations to WordPress.org. Strip any external (URL) source
				// so the plugin can only be installed from the wp.org repository by its slug — the
				// wp.org build must not install plugins from external servers.
				if ( ! pixassist_is_commercial()
				     && ! empty( $config['requiredPlugins']['plugins'][ $key ]['source'] )
				     && false !== filter_var( $config['requiredPlugins']['plugins'][ $key ]['source'], FILTER_VALIDATE_URL ) ) {
					unset( $config['requiredPlugins']['plugins'][ $key ]['source'] );
					unset( $config['requiredPlugins']['plugins'][ $key ]['source_type'] );
				}

				// Make sure that the plugin is not required, only recommended.
				$config['requiredPlugins']['plugins'][ $key ]['required'] = false;
			}

			tgmpa( $config['requiredPlugins']['plugins'], $tgmpa_config );
		}
	}

	public static function isApplicableToCurrentThemeType( $item ) {
		if ( empty( $item['applicableTypes'] ) ) {
			return true;
		}

		if ( is_string( $item['applicableTypes'] ) ) {
			$item['applicableTypes'] = array( $item['applicableTypes'] );
		}

		$current_theme_type = self::get_theme_type();

		if ( in_array( $current_theme_type, $item['applicableTypes'] ) ) {
			return true;
		}

		return false;
	}

	public function prevent_tgmpa_notices( $show ) {
		// Current screen is not always available, most notably on the customizer screen.
		if ( ! function_exists( 'get_current_screen' ) ) {
			return $show;
		}

		$screen = get_current_screen();

		// We will allow the notifications in the Plugins page.
		if ( 'plugins' === $screen->base ) { // WPCS: CSRF ok.
			// Plugins bulk update screen.
			return $show;
		}

		return false;
	}

	/**
	 * Hide TGMPA's standalone "Install Plugins" admin menu item.
	 *
	 * Recommended-plugin install now lives in one place — the Pixelgrade hub's Setup tab — so the
	 * duplicate TGMPA menu under Appearance is removed to avoid two surfaces doing the same job. This
	 * only removes the menu LINK; TGMPA's registered plugin sources + install handlers stay intact
	 * (the hub install path relies on them), and the page remains reachable by direct URL.
	 *
	 * @return void
	 */
	public function hide_tgmpa_install_menu() {
		if ( ! function_exists( 'remove_submenu_page' ) || ! class_exists( 'TGM_Plugin_Activation' ) || ! is_callable( array( 'TGM_Plugin_Activation', 'get_instance' ) ) ) {
			return;
		}

		$tgmpa = TGM_Plugin_Activation::get_instance();
		$menu  = ! empty( $tgmpa->menu ) ? $tgmpa->menu : 'tgmpa-install-plugins';
		// TGMPA registers its page with add_theme_page(), i.e. under the Appearance (themes.php) menu.
		remove_submenu_page( 'themes.php', $menu );
	}

	// handle_external_required_plugins_ajax_install() was removed (M2 R2): the wp.org build installs
	// only WordPress.org-hosted plugins through core APIs. External/premium installs belong to Pixelgrade Plus.

	public function handle_plugin_autoupdate( $update, $item ) {
		// We want to force enable the auto-update feature for Pixelgrade Assistant.
		if ( ! empty( $item->plugin ) && strrpos( $item->plugin, 'pixelgrade-assistant.php' ) === ( strlen( $item->plugin ) - strlen( 'pixelgrade-assistant.php' ) ) ) {
			$update = true;
		}

		return $update;
	}

    /**
     * Main PixelgradeAssistant_Admin Instance
     *
     * Ensures only one instance of PixelgradeAssistant_Admin is loaded or can be loaded.
     *
     * @static
     * @param  object $parent Main PixelgradeAssistant instance.
     *
     * @return PixelgradeAssistant_Admin Main PixelgradeAssistant_Admin instance
     */
    public static function instance( $parent ) {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self( $parent );
        }
        return self::$_instance;
    }

    /**
     * Cloning is forbidden.
     */
    public function __clone() {
        _doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
    }

    /**
     * Unserializing instances of this class is forbidden.
     */
    public function __wakeup() {
        _doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
    }
}
