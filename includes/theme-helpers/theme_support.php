<?php
/**
 * Various functionality that alters the 'theme_support'
 *
 * @link       https://pixelgrade.com
 * @since      1.3.3
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/ThemeHelpers
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class Pixassist_ThemeSupport {

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
	protected function register_hooks() {
		add_action( 'after_setup_theme', array( $this, 'maybe_remove_widgets_block_editor_support' ), 99, 1 );
	}

	/**
	 * For certain themes, remove the 'widgets-block-editor' theme-support that is on by default starting with WordPress 5.8+.
	 */
	public function maybe_remove_widgets_block_editor_support() {
		// Bail if the current theme (or parent theme) is not one of ours.
		if ( ! PixelgradeAssistant_Admin::is_pixelgrade_theme() ) {
			return;
		}

		$excluded_theme_slugs = [
			'rosa2',
		];

		$current_theme_slug = PixelgradeAssistant_Admin::get_original_theme_slug();
		$should_remove = true;
		foreach ( $excluded_theme_slugs as $excluded_theme_slug ) {
			// Allow for partial match.
			if ( false !== strpos( $current_theme_slug, $excluded_theme_slug ) ) {
				// Found a target. No need to remove.
				$should_remove = false;
				break;
			}
		}

		if ( $should_remove ) {
			remove_theme_support( 'widgets-block-editor' );
		}
	}

	/**
	 * Main Pixassist_ThemeSupport Instance
	 *
	 * Ensures only one instance of Pixassist_ThemeSupport is loaded or can be loaded.
	 *
	 * @static
	 *
	 * @return object Main Pixassist_ThemeSupport instance
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
	} // End __clone ()

	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), '' );
	} // End __wakeup ()
}

Pixassist_ThemeSupport::instance();
