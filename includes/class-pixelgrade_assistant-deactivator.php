<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Fired during plugin deactivation
 *
 * @link       https://pixelgrade.com
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistantDeactivator {

	/**
	 * Run on plugin deactivation.
	 */
	public static function deactivate() {
		// Nothing to clean up on deactivation. (Removed a dead 'pixassist_install_notice_dismissed'
		// theme-mod reset that nothing else in the plugin read or set.)
	}
}
