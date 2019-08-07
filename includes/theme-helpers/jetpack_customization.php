<?php
/**
 * Various functionality that allows a theme to interact with Jetpack's default settings
 *
 * @link       https://pixelgrade.com
 * @since      1.2.2
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/ThemeHelpers
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class PixJetpackCustomization {

	/**
	 * Instance of this class.
	 * @var      object
	 */
	protected static $_instance = null;

	protected function __construct() {
		$this->init();
	}

	/**
	 * Initialize class
	 */
	private function init() {
		// Register all the needed hooks
		$this->register_hooks();
	}

	/**
	 * Register our actions and filters
	 *
	 * @return void
	 */
	function register_hooks() {
		add_filter( 'default_option_jetpack_active_modules', array( $this, 'default_jetpack_active_modules' ), 10, 1 );
		add_filter( 'jetpack_get_available_modules', array( $this, 'jetpack_hide_blocked_modules' ), 20, 1 );
		add_filter( 'default_option_sharing-options', array( $this, 'default_jetpack_sharing_options' ), 10, 1 );
	}

	/**
	 * Control the default modules that are activated in Jetpack.
	 * Set the 'pixelgrade_jetpack_default_active_modules' theme mod with the values you want
	 * Something like:
	 *
	 * array(
	 *      'carousel',
	 *      'contact-form',
	 *      'shortcodes',
	 *      'widget-visibility',
	 *      'widgets',
	 *      'tiled-gallery',
	 *      'custom-css'
	 * );
	 *
	 * @param array $default The default value to return if the option does not exist
	 *                        in the database.
	 *
	 * @return array
	 */
	function default_jetpack_active_modules( $default ) {
		if ( ! is_array( $default ) ) {
			$default = array();
		}
		$jetpack_default_modules = array();

		//Read the options saved in the DB by the theme
		$theme_default_modules = get_theme_mod( 'pixelgrade_jetpack_default_active_modules', array() );

		if ( ! is_array( $theme_default_modules ) ) {
			return array_merge( $default, $jetpack_default_modules );
		}

		foreach ( $theme_default_modules as $module ) {
			array_push( $jetpack_default_modules, $module );
		}

		return array_merge( $default, $jetpack_default_modules );
	}

	/**
	 * Control the default Jetpack Sharing options.
	 * Use the `pixelgrade_filter_jetpack_sharing_default_options` to set your's.
	 *
	 * @param array $default The default value to return if the option does not exist
	 *                        in the database.
	 *
	 * @return array
	 */
	function default_jetpack_sharing_options( $default ) {
		if ( ! is_array( $default ) ) {
			$default = array();
		}

		$jetpack_sharing_default_options = apply_filters ( 'pixelgrade_filter_jetpack_sharing_default_options', array() );

		// bail if we don't like what we've got
		if ( ! is_array( $jetpack_sharing_default_options ) || ! isset( $jetpack_sharing_default_options['global'] ) ) {
			return $default;
		}

		return array_merge( $default, $jetpack_sharing_default_options );
	}

	/**
	 * Control the modules that are available in Jetpack (hide some of them).
	 * Set the 'pixelgrade_jetpack_blocked_modules' theme mod with the values you want
	 * Something like:
	 *
	 * array(
	 *      'carousel',
	 *      'contact-form',
	 *      'shortcodes',
	 *      'widget-visibility',
	 *      'widgets',
	 *      'tiled-gallery',
	 *      'custom-css'
	 * );
	 *
	 * @param array $modules
	 *
	 * @return array
	 */
	function jetpack_hide_blocked_modules( $modules ) {
		if ( ! is_array( $modules ) ) {
			$modules = array();
		}

		$jetpack_blocked_modules = array();

		//Read the options saved in the DB by the theme
		$theme_blocked_modules = get_theme_mod( 'pixelgrade_jetpack_blocked_modules', array() );

		if ( ! is_array( $theme_blocked_modules ) ) {
			return $modules;
		}

		foreach ( $theme_blocked_modules as $module ) {
			array_push( $jetpack_blocked_modules, $module );
		}

		return array_diff_key( $modules, array_flip( $jetpack_blocked_modules ) );
	}

	/**
	 * Main PixJetpackCustomization Instance
	 *
	 * Ensures only one instance of PixJetpackCustomization is loaded or can be loaded.
	 *
	 * @static
	 *
	 * @return object Main PixJetpackCustomization instance
	 */
	public static function instance() {
		// If the single instance hasn't been set, set it now.
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}

	/**
	 * Cloning is forbidden.
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), '' );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), '' );
	}
}

PixJetpackCustomization::instance();
