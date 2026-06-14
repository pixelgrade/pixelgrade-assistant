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

		// If Pixelgrade Care (the legacy commercial companion) is active, do NOT hard-fail
		// activation. Assistant stays inactive at runtime instead (see check()) and shows a calm
		// heads-up, so existing Care sites are never broken or interrupted by a fatal error.
		// TODO (M2): tie this into the Pixelgrade Plus migration path.

		// Reset theme update transients so any logic introduced by the plugin can kick in.
		delete_site_transient( 'update_themes' );
	}
}
