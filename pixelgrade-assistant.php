<?php
/**
 * Plugin Name:       Pixelgrade Assistant
 * Plugin URI:        https://github.com/pixelgrade/pixelgrade-assistant
 * Description:       We care about giving you the best experience with your free Pixelgrade theme.
 * Version:           2.3.0
 * Requires at least: 5.9
 * Requires PHP:      7.4
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
defined( 'PIXELGRADE_ASSISTANT__VERSION' )           || define( 'PIXELGRADE_ASSISTANT__VERSION', '2.3.0' );
defined( 'PIXELGRADE_ASSISTANT__API_BASE' )          || define( 'PIXELGRADE_ASSISTANT__API_BASE', 'https://pixelgrade.com/' );
defined( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN' )   || define( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN', 'pixelgrade.com' );
defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE' )         || define( 'PIXELGRADE_ASSISTANT__SHOP_BASE', 'https://pixelgrade.com/' );
defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN' )  || define( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN', 'pixelgrade.com' );
defined( 'PIXELGRADE_ASSISTANT__DEV_MODE' )          || define( 'PIXELGRADE_ASSISTANT__DEV_MODE', false );

// Fail-safe guard for commercial behavior. Default false: the WordPress.org build is free.
// Commercial features belong in the separate Pixelgrade Plus plugin, not behind this flag.
defined( 'PIXELGRADE_ASSISTANT__IS_COMMERCIAL' )     || define( 'PIXELGRADE_ASSISTANT__IS_COMMERCIAL', false );

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';

// Capability helpers: free vs commercial, and Pixelgrade Plus / Care detection.
require_once plugin_dir_path( __FILE__ ) . 'includes/capabilities.php';

// Classic Editor is opt-in for themes that explicitly require it.
require_once plugin_dir_path( __FILE__ ) . 'includes/classic-editor.php';

// Asset helpers for enqueuing @wordpress/scripts build artifacts (admin/build/*.asset.php).
require_once plugin_dir_path( __FILE__ ) . 'includes/assets.php';

// Host extension surface for companion plugins (hub tab registry + host-account read accessors).
require_once plugin_dir_path( __FILE__ ) . 'includes/host-extension-surface.php';

// Host-owned pixelgrade.com account connection + Account hub tab.
require_once plugin_dir_path( __FILE__ ) . 'includes/account.php';

// Minimal site context shared by functional requests to Pixelgrade services.
require_once plugin_dir_path( __FILE__ ) . 'includes/service-request-context.php';

// Appearance -> Pixelgrade hub: server-side bootstrap data for the React shell.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-hub.php';

// Shared Anima LT install/activation descriptor for fresh-site onboarding and Site Setup.
require_once plugin_dir_path( __FILE__ ) . 'includes/theme-setup.php';

// Free Styles tab: in-hub style control center + editor/customizer destinations.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-styles.php';

// Free Overview tab: registers itself on the hub registry + builds its bootstrap payload.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-overview.php';

// Free Plugins tab: recommended plugin management inside the hub.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-plugins.php';

// Free Design Library tab: one destination for the three content granularities (whole site /
// reusable part / single page); the section modules below keep their payloads + REST surfaces.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-design-library.php';

// Free Starter Sites section: existing free demos plus Plus-injected premium starters.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-starter-sites.php';

// Free Recipes tab: source-as-recipe bundles over granular starter layouts.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-recipes.php';

// Free Layouts tab: granular single-unit layout import.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-layout-units.php';

// Free Page Patterns tab: granular single-unit content import.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-content-patterns.php';

// Secondary System Status tab: diagnostics data and controls.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-system-status.php';

// Secondary Tools tab: reset/maintenance utilities.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-tools.php';

// Contextual editor docs panel: bootstrap data + safe server-side docs actions.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-docs.php';

// Free Help tab: registers itself on the hub registry and reuses the docs KB source.
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-help.php';

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

	$instance = PixelgradeAssistant::instance( __FILE__, PIXELGRADE_ASSISTANT__VERSION );

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
