<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant {
	/**
	 * The main plugin file.
	 * @var     string
	 * @access  public
	 * @since   1.3.0
	 */
	public $file;

	/**
	 * @var PixelgradeAssistant_Admin
	 */
	public $plugin_admin = null;

	/**
	 * @var PixelgradeAssistant_i18n
	 */
	public $plugin_i18n = null;

	/**
	 * @var PixelgradeAssistant_StarterContent
	 */
	public $starter_content = null;

	/**
	 * @var PixelgradeAssistant_Support
	 */
	public $plugin_support = null;

	/**
	 * @var PixelgradeAssistant_SetupWizard
	 */
	public $plugin_setup_wizard = null;

	/**
	 * @var PixelgradeAssistant_DataCollector
	 */
	public $plugin_data_collector = null;

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant
	 * @access  protected
	 * @since   1.3.0
	 */
	protected static $_instance = null;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string $plugin_name The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string $version The current version of the plugin.
	 */
	protected $version;

	/**
	 * The lowest supported WordPress version
	 * @var string
	 */
	protected $wp_support = '4.9';

	protected $theme_support = false;

	/**
	 * Minimal Required PHP Version
	 * @var string
	 * @access  private
	 * @since   1.3.0
	 */
	private $minimalRequiredPhpVersion  = '5.3.0';

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 *
	 * @param string $file The main plugin file
	 * @param string $version The current version of the plugin
	 */
	public function __construct( $file, $version = '1.0.0' ) {
		//the main plugin file (the one that loads all this)
		$this->file = $file;
		//the current plugin version
		$this->version = $version;

		$this->plugin_name = 'pixelgrade_assistant';

		if ( $this->php_version_check() ) {
			// Only load and run the init function if we know PHP version can parse it.
			$this->init();
		}
	}

	/**
	 * Initialize plugin
	 */
	private function init() {

		//Handle the install and uninstall logic
		register_activation_hook( $this->file, array( 'PixelgradeAssistant', 'install' ) );
		register_deactivation_hook( $this->file, array( 'PixelgradeAssistant', 'uninstall' ) );

		if ( $this->is_wp_compatible() ) {
			$this->load_modules();
			$this->set_locale();
			$this->register_hooks();
		} else {
			add_action( 'admin_notices', array( $this, 'add_incompatibility_notice' ) );
		}
	}

	function add_incompatibility_notice() {
		global $wp_version;

		printf(
			'<div class="%1$s"><p><strong>%2$s %3$s %4$s </strong></p><p>%5$s %6$s %7$s</p></div>',
			esc_attr( 'notice notice-error' ),
			esc_html__( 'Your Pixelgrade theme requires WordPress version', '__plugin_txtd' ),
			$this->wp_support,
			esc_html__( 'or later', '__plugin_txtd' ),
			esc_html__( 'You\'re using an old version of WordPress', '__plugin_txtd' ),
			$wp_version,
			esc_html__( 'which is not compatible with the current theme. Please update to the latest version to benefit from all its features.', '__plugin_txtd' )
		);
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - PixelgradeAssistant_i18n. Defines internationalization functionality.
	 * - PixelgradeAssistantAdmin. Defines all hooks for the admin area.
	 * - PixelgradeAssistant_Public. Defines all hooks for the public side of the site.
	 *
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_modules() {

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( $this->file ) . 'includes/class-pixelgrade_assistant-i18n.php';
		$this->plugin_i18n = PixelgradeAssistant_i18n::instance( $this );

		/**
		 * The class responsible for defining all logic that occurs in the admin area.
		 */
		require_once plugin_dir_path( $this->file ) . 'admin/class-pixelgrade_assistant-admin.php';
		$this->plugin_admin = PixelgradeAssistant_Admin::instance( $this );

		/**
		 * Import demo-data system
		 */
		require_once plugin_dir_path( $this->file ) . 'admin/class-pixelgrade_assistant-starter_content.php';
		$this->starter_content = PixelgradeAssistant_StarterContent::instance( $this );

		/**
		 * The class responsible for defining all actions that occur in the setup wizard.
		 */
		require_once plugin_dir_path( $this->file ) . 'admin/class-pixelgrade_assistant-setup_wizard.php';
		$this->plugin_setup_wizard = PixelgradeAssistant_SetupWizard::instance( $this );

		/**
		 * The class responsible for defining all actions that occur in the data collection section.
		 */
		require_once plugin_dir_path( $this->file ) . 'includes/class-pixelgrade_assistant-data-collector.php';
		$this->plugin_data_collector = PixelgradeAssistant_DataCollector::instance( $this );

		/**
		 * The class responsible for defining all actions that occur in support section.
		 */
		require_once plugin_dir_path( $this->file ) . 'admin/class-pixelgrade_assistant-support.php';
		$this->plugin_support = PixelgradeAssistant_Support::instance( $this );

		/**
		 * Various specific integrations that have custom logic.
		 */
		require_once plugin_dir_path( $this->file ) . 'includes/integrations.php';

		/**
		 * Various functionality that helps our themes play nice with other themes and the whole ecosystem in general
		 * Think of custom post types, shortcodes, and so on. Things that are not theme territory.
		 */
		require_once plugin_dir_path( $this->file ) . 'includes/theme-helpers.php';
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the PixelgradeAssistant_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {
		add_action( 'plugins_loaded', array( $this->plugin_i18n, 'load_plugin_textdomain' ) );
	}

	/**
	 * Register general plugin hooks.
	 * Other modules may add their own.
	 */
	public function register_hooks() {
		// Nothing right now
	}

	/*
	 * Install everything needed
	 */
	static public function install() {
		/** @var PixelgradeAssistant $local_plugin */
		$local_plugin = PixelgradeAssistant();

		require_once plugin_dir_path( $local_plugin->file ) . 'includes/class-pixelgrade_assistant-activator.php';
		PixelgradeAssistantActivator::activate();
	}

	/*
	 * Uninstall everything needed
	 */
	static public function uninstall() {
		/** @var PixelgradeAssistant $local_plugin */
		$local_plugin = PixelgradeAssistant();

		require_once plugin_dir_path( $local_plugin->file ) . 'includes/class-pixelgrade_assistant-deactivator.php';
		PixelgradeAssistantDeactivator::deactivate();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

	public function get_theme_config() {
		$this->plugin_admin->get_remote_config();
	}

	function is_wp_compatible() {
		global $wp_version;

		if ( version_compare( $wp_version, $this->wp_support, '>=' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * PHP version check
	 */
	protected function php_version_check() {

		if ( version_compare( phpversion(), $this->minimalRequiredPhpVersion ) < 0 ) {
			add_action( 'admin_notices', array( $this, 'notice_php_version_wrong' ) );
			return false;
		}

		return true;
	}

	/**
	 * Main PixelgradeAssistant Instance
	 *
	 * Ensures only one instance of PixelgradeAssistant is loaded or can be loaded.
	 *
	 * @since  1.3.0
	 * @static
	 * @param string $file    File.
	 * @param string $version Version.
	 *
	 * @see    PixelgradeAssistant()
	 * @return PixelgradeAssistant Main PixelgradeAssistant instance
	 */
	public static function instance( $file = '', $version = '1.0.0' ) {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $file, $version );
		}
		return self::$_instance;
	} // End instance ()

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.3.0
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__,esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->version ) );
	} // End __clone ()

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.3.0
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ),  esc_html( $this->version ) );
	} // End __wakeup ()
}
