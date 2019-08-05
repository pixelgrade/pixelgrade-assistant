<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Fired during plugin activation
 *
 * @link       https://pixelgrade.com
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistantActivator {

	/**
	 * Run on plugin activation.
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
