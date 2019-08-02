<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Fired during plugin activation
 *
 * @link       https://pixelgrade.com
 * @since      1.0.0
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistantActivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
		/** @var PixelgradeAssistant $local_plugin */
		$local_plugin = PixelgradeAssistant();

		if ( $local_plugin->is_wp_compatible() ) {
			$local_plugin->get_theme_config();

			// Also reset theme updates transients to be sure that any logic introduced by the plugin can kick in.
			delete_site_transient( 'update_themes' );
		}
	}
}
