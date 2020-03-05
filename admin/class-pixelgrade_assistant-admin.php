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
		    'disconnectUser'     => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/disconnect_user' ),
		    ),

		    // Starter content needed endpoints
		    'import'             => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/import' ),
		    ),
		    'uploadMedia'        => array(
			    'method' => 'POST',
			    'url'    => esc_url_raw( rest_url() . 'pixassist/v1/upload_media' ),
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
			    'createTicket'      => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/create_ticket',
			    ),
			    'demoContent'       => array(
				    'method' => 'GET',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/get_demo_content',
			    ),
			    'getHTKBCategories' => array(
				    'method' => 'GET',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/get_htkb_categories',
			    ),
			    'htVoting'          => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/ht_voting',
			    ),
			    'htVotingFeedback'  => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/ht_voting_feedback',
			    ),
			    'htViews'           => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/pxm/v2/front/ht_views',
			    ),
		    ),
		    'wupl' => array(
			    'licenses' => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/wupl/v2/front/get_licenses',
			    ),
			    'licenseAction' => array(
				    'method' => 'POST',
				    'url' => PIXELGRADE_ASSISTANT__API_BASE . 'wp-json/wupl/v2/front/license_action',
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

		add_action( 'current_screen', array( $this, 'add_tabs' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

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
		add_filter( 'pre_set_site_transient_update_themes', array(
			$this,
			'transient_update_remote_config',
		), 12 );
		add_filter( 'pre_set_site_transient_update_themes', array(
			$this,
			'transient_maybe_cleanup_oauth_token',
		), 14 );
		add_filter( 'pre_set_site_transient_update_themes', array(
			$this,
			'transient_update_license_data',
		), 15 );

		// On theme switch try and get a license and activate it, if the user is connected
		add_action( 'after_switch_theme', array( 'PixelgradeAssistant_Admin', 'fetch_and_activate_theme_license' ), 10 );

		// On theme switch clear the cache for the remote config
		add_action( 'after_switch_theme', array( 'PixelgradeAssistant_Admin', 'clear_remote_config_cache' ), 11 );

		// If the remove config contains recommend plugins, register them with TGMPA
		add_action( 'tgmpa_register', array( $this, 'register_required_plugins' ), 1000 );

		// Prevent TGMPA admin notices since we manage plugins in the Pixelgrade Care dashboard.
		add_filter( 'tgmpa_show_admin_notices', array( $this, 'prevent_tgmpa_notices' ), 10, 1 );

		add_filter( 'plugins_api', array( $this, 'handle_external_required_plugins_ajax_install' ), 100, 3 );
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
        if ( self::is_pixelgrade_assistant_dashboard() ) {
        	$rtl_suffix = is_rtl() ? '-rtl' : '';
        	wp_enqueue_style( $this->parent->get_plugin_name(), plugin_dir_url( $this->parent->file ) . 'admin/css/pixelgrade_assistant-admin' . $rtl_suffix . '.css', array( 'dashicons' ), $this->parent->get_version(), 'all' );
        }
    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {
	    $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

        if ( self::is_pixelgrade_assistant_dashboard() ) {
	        wp_enqueue_script( 'plugin-install' );
            wp_enqueue_script( 'updates' );
            wp_enqueue_script( 'pixelgrade_assistant-dashboard', plugin_dir_url( $this->parent->file ) . 'admin/js/dashboard' . $suffix . '.js', array(
                'jquery',
                'wp-util',
	            'wp-a11y',
	            'updates',
	            'plugin-install'
            ), $this->parent->get_version(), true );

            self::localize_js_data( 'pixelgrade_assistant-dashboard', true, 'dashboard');
        }
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
	 * Adds the WP Admin menus
	 */
	public function add_pixelgrade_assistant_menu() {
        // First determine if we should show a "Heads Up" bubble next to the main  admin menu item.
        // We will show it when the license is expired, not connected or activated.
        $show_bubble = false;
        // If the theme directory has been changed, show bubble.
        $theme_checks = self::get_theme_checks();
        if ( ! $theme_checks['has_original_name'] || ! $theme_checks['has_original_directory'] ) {
            $show_bubble = true;
        }

        $current_user = self::get_theme_activation_user();
		if ( empty( $current_user ) || empty( $current_user->ID ) ) {
			$show_bubble = true;
		} else {
			// Check if we are not connected.
			$pixelgrade_user_login = get_user_meta( $current_user->ID, 'pixelgrade_user_login', true );
			if ( empty( $pixelgrade_user_login ) ) {
				$show_bubble = true;
			} else {
				// We are connected.
				// Show bubble if the license is expired.
				$license_status = self::get_license_mod_entry( 'license_status' );
				if ( empty( $license_status ) || in_array( $license_status, array( 'expired' ) ) ) {
					$show_bubble = true;
				}
			}
		}

        // Show bubble if we have an update notification.
        $new_theme_version = get_theme_mod( 'pixassist_new_theme_version' );
        $theme_support     = self::get_theme_support();
        if ( ! empty( $new_theme_version['new_version'] ) && ! empty( $theme_support['theme_version'] ) && version_compare( $theme_support['theme_version'], $new_theme_version['new_version'], '<' ) ) {
            $show_bubble = true;
        }

        // Show bubble if there are required plugins not activated.
		/** @var TGM_Plugin_Activation $tgmpa */
		global $tgmpa;
		// Bail if we have nothing to work with
		if ( ! empty( $tgmpa ) && ! empty( $tgmpa->plugins ) ) {
			foreach ( $tgmpa->plugins as $slug => $plugin ) {
				if ( $tgmpa->is_plugin_active( $slug ) && false === $tgmpa->does_plugin_have_update( $slug ) ) {
					continue;
				}

				if ( ! $tgmpa->is_plugin_installed( $slug ) ) {
					if ( true === $plugin['required'] ) {
						$show_bubble = true;
						break;
					}
				} else {
					if ( ! $tgmpa->is_plugin_active( $slug ) && $tgmpa->can_plugin_activate( $slug ) ) {
						if ( true === $plugin['required'] ) {
							$show_bubble = true;
							break;
						}
					}

					if ( $tgmpa->does_plugin_require_update( $slug ) || false !== $tgmpa->does_plugin_have_update( $slug ) ) {
						if ( true === $plugin['required'] ) {
							$show_bubble = true;
							break;
						}
					}
				}
			}
		}

        // Allow others to force or prevent the bubble from showing
		$show_bubble = apply_filters( 'pixassist_show_menu_notification_bubble', $show_bubble );

        $bubble_markup = '';
        if ( $show_bubble ) {
            $bubble_markup = ' <span class="awaiting-mod"><span class="pending-count">!!︎</span></span>';
        }
        add_menu_page( esc_html__( 'Pixelgrade Assistant Dashboard', '__plugin_txtd' ), esc_html__( 'Pixelgrade', '__plugin_txtd' ) . $bubble_markup, 'install_themes', 'pixelgrade_assistant', array(
            $this,
            'pixelgrade_assistant_options_page',
        ), plugin_dir_url( $this->parent->file ) . 'admin/images/pixelgrade-menu-image.svg', 2 );
        add_submenu_page( 'pixelgrade_assistant', esc_html__( 'Dashboard', '__plugin_txtd' ), esc_html__( 'Dashboard', '__plugin_txtd' ), 'manage_options', 'pixelgrade_assistant', array(
            $this,
            'pixelgrade_assistant_options_page',
        ) );
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
		    'knowledgeBase'  => PixelgradeAssistant_Support::get_knowledgeBase_data(),
		    'siteUrl'        => home_url( '/' ),
		    'dashboardUrl'   => admin_url( 'admin.php?page=pixelgrade_assistant' ),
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
         * User data
         */
        $oauth_token = get_user_meta( $current_user->ID, 'pixassist_oauth_token', true );
        if ( ! empty( $oauth_token ) ) {
            $localized_data['user']['oauth_token'] = $oauth_token;
        }
        $oauth_token_secret = get_user_meta( $current_user->ID, 'pixassist_oauth_token_secret', true );
        if ( ! empty( $oauth_token_secret ) ) {
            $localized_data['user']['oauth_token_secret'] = $oauth_token_secret;
        }
        $oauth_verifier = get_user_meta( $current_user->ID, 'pixassist_oauth_verifier', true );
        if ( ! empty( $oauth_verifier ) ) {
            $localized_data['user']['oauth_verifier'] = $oauth_verifier;
        }
        $pixassist_user_ID = get_user_meta( $current_user->ID, 'pixassist_user_ID', true );
        if ( ! empty( $pixassist_user_ID ) ) {
            $localized_data['user']['pixassist_user_ID'] = $pixassist_user_ID;
        }
        $pixelgrade_user_login = get_user_meta( $current_user->ID, 'pixelgrade_user_login', true );
        if ( ! empty( $pixelgrade_user_login ) ) {
            $localized_data['user']['pixelgrade_user_login'] = $pixelgrade_user_login;
        }
        $pixelgrade_user_email = get_user_meta( $current_user->ID, 'pixelgrade_user_email', true );
        if ( ! empty( $pixelgrade_user_email ) ) {
            $localized_data['user']['pixelgrade_user_email'] = $pixelgrade_user_email;
        }
        $pixelgrade_display_name = get_user_meta( $current_user->ID, 'pixelgrade_display_name', true );
        if ( ! empty( $pixelgrade_user_email ) ) {
            $localized_data['user']['pixelgrade_display_name'] = $pixelgrade_display_name;
        }
        $user_force_disconnected = get_user_meta( $current_user->ID, 'pixassist_force_disconnected', true );
        if ( ! empty( $user_force_disconnected ) ) {
            $localized_data['user']['force_disconnected'] = true;
            // Delete the user meta so we don't nag the user, forever.
            delete_user_meta( $current_user->ID, 'pixassist_force_disconnected' );
        } else {
            $localized_data['user']['force_disconnected'] = false;
        }

        /*
         * Theme data
         */

	    $localized_data['themeMod'] = array(
		    'licenseHash' => false,
		    'licenseStatus' => false,
		    'licenseType' => false,
		    'licenseExpiryDate' => false,
		    'themeNewVersion' => false,
	    );

        // We will only put the license details if the current active theme is one of ours
	    if ( self::is_pixelgrade_theme() ) {
		    $license_hash = self::get_license_mod_entry( 'license_hash' );
		    if ( ! empty( $license_hash ) ) {
			    $localized_data['themeMod']['licenseHash'] = $license_hash;
		    }
		    $license_status = self::get_license_mod_entry( 'license_status' );
		    if ( ! empty( $license_status ) ) {
			    $localized_data['themeMod']['licenseStatus'] = $license_status;
		    }
		    // localize the license type - can be either shop, envato or free
		    $license_type = self::get_license_mod_entry( 'license_type' );
		    if ( ! empty( $license_type ) ) {
			    $localized_data['themeMod']['licenseType'] = $license_type;
		    }
		    // localize the license expiry date
		    $license_exp = self::get_license_mod_entry( 'license_expiry_date' );
		    if ( ! empty( $license_exp ) ) {
			    $localized_data['themeMod']['licenseExpiryDate'] = $license_exp;
		    }
	    }
        $new_theme_version = get_theme_mod( 'pixassist_new_theme_version' );
        if ( ! empty( $new_theme_version ) ) {
            $localized_data['themeMod']['themeNewVersion'] = $new_theme_version;
        }

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
     * Add Contextual help tabs.
     */
    public function add_tabs() {
        $screen = get_current_screen();
        $screen->add_help_tab( array(
            'id'      => 'pixelgrade_assistant_setup_wizard_tab',
            'title'   => esc_html__( 'Pixelgrade Assistant', '__plugin_txtd' ),
            'content' =>
                '<h2>' . esc_html__( 'Pixelgrade Assistant Site Setup', '__plugin_txtd' ) . '</h2>' .
                '<p><a href="' . esc_url( admin_url( 'admin.php?page=pixelgrade_assistant-setup-wizard' ) ) . '" class="button button-primary">' . esc_html__( 'Setup Pixelgrade Assistant', '__plugin_txtd' ) . '</a></p>',
        ) );
    }

    public function pixelgrade_assistant_options_page() { ?>
        <div class="pixelgrade_assistant-wrapper">
            <div id="pixelgrade_assistant_dashboard"></div>
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
	 * Determine if we are looking at the Pixelgrade Assistant dashboard WP Admin page.
	 *
	 * @return bool
	 */
	public static function is_pixelgrade_assistant_dashboard() {
        if ( ! empty( $_GET['page'] ) && 'pixelgrade_assistant' === $_GET['page'] ) {
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
	 * Update the remote plugin config for the current theme.
	 * Hooked into pre_set_site_transient_update_themes.
	 *
	 * @param object $transient
	 *
	 * @return object
	 */
	public function transient_update_remote_config( $transient ) {
        // Nothing to do here if the checked transient entry is empty
        if ( empty( $transient->checked ) ) {
            return $transient;
        }
        $this->get_remote_config();

        return $transient;
    }

	/**
     * Update the license data on theme update check.
     * Hooked into pre_set_site_transient_update_themes.
     *
     * @param object $transient
     *
     * @return object
     */
    public function transient_update_license_data( $transient ) {
        // Nothing to do here if the checked transient entry is empty
        if ( empty( $transient->checked ) ) {
            return $transient;
        }
        // Check and update the user's license details
        self::update_theme_license_details();
        return $transient;
    }

	protected static function _get_user_product_licenses_cache_key( $user_id, $hash_id = '' ) {
		return 'pixassist_user_product_licenses_' . md5( $user_id . '_' . $hash_id );
	}

	/**
	 * A helper function that returns the licenses available for a user and maybe a certain product hash ID.
	 *
	 * @param int $user_id The connected user ID.
	 * @param string $hash_id Optional. The product hash ID.
	 * @param bool $skip_cache Optional. Whether to skip the cache and fetch new data.
	 *
	 * @return array|false
	 */
	public static function get_user_product_licenses( $user_id, $hash_id = '', $skip_cache = false ) {
		// First try and get the cached data
		$data = get_site_transient( self::_get_user_product_licenses_cache_key( $user_id, $hash_id ) );
		// The transient isn't set or is expired; we need to fetch fresh data
		if ( false === $data || true === $skip_cache ) {
			$request_args = array(
				'method' => PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenses']['method'],
				'timeout'   => 5,
				'blocking'  => true,
				'body'      => array(
					'user_id' => $user_id,
					'hash_id' => $hash_id,
					'type' => self::get_theme_type(),
					'theme_headers' => self::get_theme_headers(),
				),
				'sslverify' => false,
			);

			// Increase timeout if the target URL is a development one so we can account for slow local (development) installations.
			if ( self::is_development_url( PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenses']['url'] ) ) {
				$request_args['timeout'] = 10;
			}

			// Get the user's licenses from the server
			$response = wp_remote_request( PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenses']['url'], $request_args );
			if ( is_wp_error( $response ) ) {
				return false;
			}
			$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
			// Bail in case of decode error or failure to retrieve data
			if ( null === $response_data || empty( $response_data['data']['licenses'] ) || 'success' !== $response_data['code'] ) {
				return false;
			}

			$data = $response_data['data']['licenses'];

			// Cache the data in a transient for 1 hour
			set_site_transient( self::_get_user_product_licenses_cache_key( $user_id, $hash_id ) , $data, 1 * HOUR_IN_SECONDS );
		}

		return $data;
	}

	/**
     * Update the details of the current theme's license.
	 *
	 * @param bool $skip_cache Optional. Whether to skip the cache and fetch new data.
     *
     * @return bool
     */
    public static function update_theme_license_details( $skip_cache = false ) {
        $theme_hash_id = self::get_theme_hash_id();
        if ( empty( $theme_hash_id ) ) {
        	// Something is wrong with the theme or is not one of our themes
	        return false;
        }
        // Get the connected pixelgrade user id
        $connection_user = self::get_theme_activation_user();
	    if ( empty( $connection_user ) || empty( $connection_user->ID ) ) {
	    	return false;
	    }

        $user_id      = get_user_meta( $connection_user->ID, 'pixassist_user_ID', true );
        if ( empty( $user_id ) ) {
            // not authenticated
            return false;
        }

        // Get the current license hash used to uniquely identify a license
	    $current_license_hash = self::get_license_mod_entry( 'license_hash' );
        // If we have no license hash, we have nothing to update
        if ( empty( $current_license_hash ) ) {
        	return false;
        }

        $subscriptions = self::get_user_product_licenses( $user_id, $theme_hash_id, $skip_cache );
        if ( ! empty( $subscriptions ) ) {
            foreach ( $subscriptions as $key => $value ) {
                if ( ! isset( $value['licenses'] ) || empty( $value['licenses'] ) ) {
                    // No licenses found in this subscription or marketplace
                    continue;
                }
                foreach ( $value['licenses'] as $license ) {
                	if ( ! empty( $license['license_hash'] ) && $current_license_hash == $license['license_hash'] && ! empty( $license['license_type'] ) && ! empty( $license['license_status'] ) ) {
                		// Update the license details
                		self::set_license_mod( $license );

                		return true;
	                }
                }
            }
        }

        return false;
    }

	/**
	 * Get the user's licenses, select the best one and activate it.
	 *
	 * @return bool True when we have successfully fetched and activated a license, false otherwise.
	 */
	public static function fetch_and_activate_theme_license() {
		$current_user = self::get_theme_activation_user();
		if ( empty( $current_user ) || empty( $current_user->ID ) ) {
			return false;
		}

		// First we will delete ny previous license mods. Start fresh.
		self::delete_license_mod();

		// If they modified anything in the wupdates_gather_ids function - exit.  Cannot activate the theme.
		if ( ! self::is_wupdates_filter_unchanged() ) {
			return false;
		}

		// Determine whether the user is logged in or not. If not logged in - don't bother trying to activate the theme license
		$pixelgrade_user_id = get_user_meta( $current_user->ID, 'pixassist_user_ID', true );
		if ( empty( $pixelgrade_user_id ) ) {
			return false;
		}

		$wupdates_identification = self::get_wupdates_identification_data();
		if ( empty( $wupdates_identification ) ) {
			return false;
		}

		// Get the user's licenses from the server (grouped by subscription or marketplace - like 'free')
		$subscriptions = self::get_user_product_licenses( $pixelgrade_user_id, $wupdates_identification['id'], true );
		if ( empty( $subscriptions ) || is_wp_error( $subscriptions ) ) {
			return false;
		}

		$valid_licenses   = array();
		$active_licenses  = array();
		$expired_licenses = array();

		foreach ( $subscriptions as $key => $value ) {
			if ( ! isset( $value['licenses'] ) || empty( $value['licenses'] ) ) {
				// No licenses found in this subscription or marketplace
				continue;
			}
			foreach ( $value['licenses'] as $license ) {
				switch ( $license['license_status'] ) {
					case 'valid':
						$valid_licenses[] = $license;
						break;
					case 'active':
						$active_licenses[] = $license;
						break;
					case 'expired':
					case 'overused':
						$expired_licenses[] = $license;
						break;
					default:
						break;
				}
			}
		}

		// try to activate a license and save to theme mod
		$license_to_activate = array();
		if ( ! empty( $valid_licenses ) ) {
			$license_to_activate = reset( $valid_licenses );
		} elseif ( ! empty( $active_licenses ) ) {
			$license_to_activate = reset( $active_licenses );
		} elseif ( ! empty( $expired_licenses ) ) {
			$license_to_activate = reset( $expired_licenses );
		}
		// If we have at least one license - go ahead and activate it
		if ( ! empty( $license_to_activate ) ) {
			// Get all kind of details about the active theme
			$theme_details = self::get_theme_support();
			$data = array(
				'action'       => 'activate',
				'license_hash' => $license_to_activate['license_hash'],
				'site_url'     => home_url( '/' ),
				'is_ssl'       => is_ssl(),
				'hash_id'      => $wupdates_identification['id'],
			);

			if ( isset( $theme_details['theme_version'] ) ) {
				$data['current_version'] = $theme_details['theme_version'];
			}
			$request_args = array(
				'method' => PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenseAction']['method'],
				'timeout'   => 6,
				'blocking'  => true,
				'body'      => $data,
				'sslverify' => false,
			);

			// Increase timeout if the target URL is a development one so we can account for slow local (development) installations.
			if ( self::is_development_url( PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenseAction']['url'] ) ) {
				$request_args['timeout'] = 10;
			}

			// Activate the license
			$response = wp_remote_request( PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenseAction']['url'], $request_args );
			if ( is_wp_error( $response ) ) {
				return false;
			}

			$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
			// Bail in case of decode error or failure
			if ( null === $response_data || 'success' !== $response_data['code'] ) {
				return false;
			}

			// The license has been successfully activated
			// Save it's details in the theme mods
			self::set_license_mod( $license_to_activate );
		}

		// All went well
		return true;
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

				// By default all demos are applicable to our premium theme types.
				if ( empty( $demo_config['applicableTypes'] ) ) {
					$final_config['starterContent']['demos'][ $key ]['applicableTypes'] = $demo_config['applicableTypes'] = array('theme', 'theme_modular');
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

        // Get the theme hash ID
        $theme_id = self::get_theme_hash_id();
        // If we have no hash ID present, bail
        if ( empty( $theme_id ) ) {
            return false;
        }

	    $config = false;

        // We will cache this config for a little while, just enough to avoid getting hammered by a broken theme mod entry
	    if ( false === $skip_cache ) {
		    $config = get_transient( self::_get_remote_config_cache_key( $theme_id ) );
	    }

        if ( true === $skip_cache || false === $config ) {
            // Retrieve the config from the server
            $request_args = array(
                'method' => PixelgradeAssistant_Admin::$externalApiEndpoints['pxm']['getConfig']['method'],
                'timeout'   => 4,
                'blocking'  => true,
                'body' => array(
                    'hash_id' => $theme_id,
                    // This is the Pixelgrade Assistant Manager configuration version, not the API version
                    // @todo this parameter naming is quite confusing
                    'version' => self::$pixelgrade_assistant_manager_api_version,
                ),
                'sslverify' => false,
            );

            // Increase timeout when using the PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE constant so we can account for slow local (development) installations.
	        // Also do this if the target URL is a development one.
	        if ( ( defined( 'PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE' ) && PIXELGRADE_ASSISTANT__SKIP_CONFIG_CACHE === true ) || self::is_development_url( PixelgradeAssistant_Admin::$externalApiEndpoints['pxm']['getConfig']['url'] ) ) {
		        $request_args['timeout'] = 10;
	        }

            $response = wp_remote_request( PixelgradeAssistant_Admin::$externalApiEndpoints['pxm']['getConfig']['url'], $request_args  );
            if ( is_wp_error( $response ) ) {
                return false;
            }
            $response_data = json_decode( wp_remote_retrieve_body( $response ), true );
            if ( null === $response_data || empty( $response_data['data']['config'] ) || 'success' !== $response_data['code'] ) {
                // This means the json_decode has failed
                return false;
            }
            $config = $response_data['data']['config'];

            // For now, we don't need anything related to dashboard or setup wizard. We will just use the plugin defaults.
	        if ( isset( $config['dashboard'] ) ) {
		        unset( $config['dashboard'] );
	        }
	        if ( isset( $config['setupWizard'] ) ) {
		        unset( $config['setupWizard'] );
	        }

            // Sanitize it
	        $config = self::sanitize_theme_mods_holding_content( $config, array() );
            // Cache it
            set_transient( self::_get_remote_config_cache_key( $theme_id ), $config, 6 * HOUR_IN_SECONDS );
        }

        return $config;
    }

	protected static function _get_remote_config_cache_key( $theme_id ) {
        return 'pixassist_theme_config_' . $theme_id;
    }

	public static function clear_remote_config_cache() {

	    // Get the theme hash ID
	    $theme_id = self::get_theme_hash_id();
	    // If we have no hash ID present, bail
	    if ( empty( $theme_id ) ) {
		    return false;
	    }

	    return delete_transient( self::_get_remote_config_cache_key( $theme_id ) );
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
	 * Cleanup the OAuth saved details if the current user doesn't have the connection details.
	 *
	 * @param object $transient
	 *
	 * @return object
	 */
	public static function transient_maybe_cleanup_oauth_token( $transient ) {
        $current_user    = self::get_theme_activation_user();
		if ( ! empty( $current_user ) && ! empty( $current_user->ID ) ) {
			$user_token_meta = get_user_meta( $current_user->ID, 'pixassist_oauth_token' );
			$user_pixassist_id = get_user_meta( $current_user->ID, 'pixassist_user_ID' );

			// If the user ID is missing, clear everything.
			if ( $user_token_meta && empty( $user_pixassist_id ) ) {
				self::cleanup_oauth_token( $current_user->ID );
			}
		}

        return $transient;
    }

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
     * Checks if the wupdates_gather_ids filter has been tempered with
     * This should also be used to block the updates
	 *
	 * @param string $slug
     * @return bool
     */
    public static function is_wupdates_filter_unchanged( ) {
	    $wupdates_identification = self::get_wupdates_identification_data();

        // Check if the wupdates_ids array is missing either of this properties
        if (  empty( $wupdates_identification ) || ! isset( $wupdates_identification['name'] ) || ! isset( $wupdates_identification['slug'] ) || ! isset( $wupdates_identification['id'] ) || ! isset( $wupdates_identification['type'] ) || ! isset( $wupdates_identification['digest'] ) ) {
            return false;
        }
        // Create the md5 hash from the properties of wupdates_ids and compare it to the digest from that array
        $md5 = md5( 'name-' . $wupdates_identification['name'] . ';slug-' . $wupdates_identification['slug'] . ';id-' . $wupdates_identification['id'] . ';type-' . $wupdates_identification['type'] );
        // the md5 hash should be the same one as the digest hash
        if ( $md5 !== $wupdates_identification['digest'] ) {
            return false;
        }
        return true;
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

    	// Maybe tackle the current active theme.
		$theme_slug = basename( get_template_directory() );

		$theme_headers = self::get_theme_headers();
		// We only want to do this for themes that are ours and for themes that have a slug matching their textdomain.
		if ( ! empty( $theme_headers['Author'] ) && 'pixelgrade' === strtolower( $theme_headers['Author'] ) &&
			! empty( $theme_headers['TextDomain'] ) && $theme_slug === $theme_headers['TextDomain'] ) {
			// We need to know if we have made changes to the data.
			$theme_data_changed = false;

			if ( ! isset( $wupdates_data[ $theme_slug ] ) ) {
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
                    <p><?php printf( wp_kses_post( __( 'Great news! A new theme update is available for your <strong>%s</strong> theme, version <strong>%s</strong>. To update go to your <a href="%s">Themes Dashboard</a>.', '__plugin_txtd' ) ), esc_html( $theme_name ), esc_html( $new_theme_version ), esc_url( admin_url( 'themes.php' ) ) ); ?></p>
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
	 * Since the core AJAX function wp_ajax_install_plugin(), that handles the AJAX installing of plugins,
	 * only knows to install plugins from the WordPress.org repo, we need to handle the external plugins installation.
	 * Like from WUpdates.
	 *
	 * @param $res
	 * @param $action
	 * @param $args
	 *
	 * @return mixed
	 */
	public function handle_external_required_plugins_ajax_install( $res, $action, $args ) {
		// This is a key we only put from the Pixelgrade Assistant JS. So we know that the current request is one of ours.
		if ( empty( $_POST['pixassist_plugin_install'] ) ) {
			return $res;
		}

		// Do nothing if this is not an external plugin.
		if ( empty( $_POST['plugin_source_type'] ) || 'external' !== $_POST['plugin_source_type'] ) {
			return $res;
		}

		// Get the TGMPA instance
		$tgmpa = call_user_func( array( get_class( $GLOBALS['tgmpa'] ), 'get_instance' ) );
		// If the slug doesn't correspond to a TGMPA registered plugin or it has no source URL, bail.
		if ( empty( $tgmpa->plugins[ $_POST['slug'] ] ) || empty( $tgmpa->plugins[ $_POST['slug'] ]['source'] ) ) {
			return $res;
		}

		// Manufacture a minimal response.
		$res = array(
			'slug' => $_POST['slug'],
			'name' => ! empty( $tgmpa->plugins[ $_POST['slug'] ]['name'] ) ? $tgmpa->plugins[ $_POST['slug'] ]['name'] : $_POST['slug'],
			'version' => '0.0.1', // We don't really know the plugin version.
			'download_link' => $tgmpa->plugins[ $_POST['slug'] ]['source'],
		);

		// The response must be an object.
		return (object) $res;
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
