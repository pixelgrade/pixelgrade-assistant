<?php
/**
 * Plugin Name:       Pixelgrade Assistant
 * Plugin URI:        https://github.com/pixelgrade/pixelgrade-assistant
 * Description:       We care about giving you the best experience with your free Pixelgrade theme.
 * Version:           1.3.0
 * Author:            Pixelgrade
 * Author URI:        https://pixelgrade.com
 * License:           GPL-3.0
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.en.html
 * Text Domain:       pixelgrade_assistant
 * Domain Path:       /languages/
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

define( 'PIXELGRADE_ASSISTANT__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PIXELGRADE_ASSISTANT__PLUGIN_FILE', __FILE__ );

// Define our constants or make sure they have a value
defined( 'PIXELGRADE_ASSISTANT__API_BASE' )          || define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.com/' );
defined( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN' )   || define( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN', 'pixelgrade.com' );
defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE' )         || define( 'PIXELGRADE_ASSISTANT__SHOP_BASE', 'https://pixelgrade.com/' );
defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN' )  || define( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN', 'pixelgrade.com' );
defined( 'PIXELGRADE_ASSISTANT__DEV_MODE' )          || define( 'PIXELGRADE_ASSISTANT__DEV_MODE', false );
// Include functions that might assist when in dev mode.
require_once plugin_dir_path( __FILE__ ) . 'includes/integrations/devmode.php';

/**
 * Returns the main instance of PixelgradeAssistant to prevent the need to use globals.
 *
 * @return PixelgradeAssistant The PixelgradeAssistant instance
 */
function PixelgradeAssistant() {
	/**
	 * The core plugin class that is used to define internationalization,
	 * admin-specific hooks, and public-facing site hooks.
	 */
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-pixelgrade_assistant.php';

	$instance = PixelgradeAssistant::instance( __FILE__, '1.3.0' );

	return $instance;
}

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 */
PixelgradeAssistant();
