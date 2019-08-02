<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://pixelgrade.com
 * @since      1.0.0
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant_i18n {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 * @since     1.3.0
	 */
	public $parent = null;

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_Admin
	 * @access  protected
	 * @since   1.3.0
	 */
	protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.3.0
	 */
	public function __construct( $parent ) {
		$this->parent = $parent;
	}

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'pixelgrade_care',
			false,
			plugin_dir_url( $this->parent->file ) . 'languages/'
		);

	}

	/**
	 * Main PixelgradeAssistant_i18n Instance
	 *
	 * Ensures only one instance of PixelgradeAssistant_i18n is loaded or can be loaded.
	 *
	 * @since  1.3.0
	 * @static
	 * @param  object $parent Main PixelgradeAssistant instance.
	 * @return object Main PixelgradeAssistant_i18n instance
	 */
	public static function instance( $parent ) {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $parent );
		}
		return self::$_instance;
	} // End instance().

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	} // End __clone().

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	} // End __wakeup().

}
