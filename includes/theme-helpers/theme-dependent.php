<?php
/**
 * Various functionality that should be loaded only if a theme declared support for it
 *
 * @link       https://pixelgrade.com
 * @since      1.2.2
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/ThemeHelpers
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load the OpenTable custom widget and shortcode code
require_once( plugin_dir_path( __FILE__ ) . 'wp-open-table/wp-open-table.php' );

// Make sure the Genericons is registered
require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/genericons.php' );

function pixassist_load_theme_dependent_functionality() {
	// Handle the Open Table widget and shortcode theme support
	if ( current_theme_supports( 'pixelgrade_opentable_widget' ) ) {
		// Add the Open Table  field to the General section in the Customizer
		add_filter( 'pixelgrade_customify_general_section_options', 'pixelgrade_open_table_customify_option', 10, 1 );

		// Register the [ot_reservation_widget] shortcode
		add_shortcode( 'ot_reservation_widget', 'pixelgrade_ot_reservation_widget_shortcode' );

		// Register the widget
		add_action( 'widgets_init', 'pixassist_register_open_table_widget' );
	}

	// During requests to activate plugins we don't want to load the fallbacks since it would result in fatal errors.
	$should_load_jetpack_fallbacks = true;
	if ( ! empty( $_REQUEST['tgmpa-activate'] ) ) {
		$should_load_jetpack_fallbacks = false;
	} else {
		global $pagenow;
		if ( 'plugins.php' === $pagenow && ( isset( $_REQUEST['action'] ) || isset( $_POST['action'] ) ) ) {
			$should_load_jetpack_fallbacks = false;
		}
	}

	if ( $should_load_jetpack_fallbacks ) {

		// Handle the case when the current theme asks for the Jetpack Portfolio but Jetpack is not active
		// If the plugin is active we will leave it up to the user to deactivate the CPT via the Jetpack settings
		if ( current_theme_supports( 'jetpack-portfolio' ) && ! class_exists( 'Jetpack' ) && ! defined( 'JETPACK__VERSION' ) ) {
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/custom-content-types.php' );
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/portfolios.php' );
		}

		// Handle the case when the current theme asks for the Jetpack Nova Restaurant but Jetpack is not active
		// If the plugin is active we will leave it up to the user to deactivate the CPT via the Jetpack settings
		if ( current_theme_supports( 'nova_menu_item' ) && ! class_exists( 'Nova_Restaurant' ) ) {
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/custom-content-types.php' );
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/nova-restaurant/nova.php' );
		}

		// Load Social Menu functionality, even if Jetpack is not active/configured
		if ( ! function_exists( 'jetpack_social_menu_init' ) || ! function_exists( 'jetpack_social_menu' ) ) {
			// Start the process
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/social-menu.php' );
		}

		if ( current_theme_supports( 'pixelgrade_jetpack_portfolio_shortcode' ) ) {
			// Fire up things
			require_once( plugin_dir_path( __FILE__ ) . 'jetpack-fallbacks/portfolio-shortcode/class-jetpack-portfolio-shortcode.php' );
			add_action( 'init', array( 'Pixelgrade_Jetpack_Portfolio_Shortcode', 'instance' ), 12 );
		}
	}

	// For now we will only add the admin bar helper link for subpages if the multipage component is present and active
	if ( class_exists( 'Pixelgrade_Multipage' ) && method_exists( 'Pixelgrade_Multipage', 'isActive' ) && Pixelgrade_Multipage::isActive() ) {
		//Add our edit links to the admin bar, in the WP Admin dashboard
		add_action( 'admin_bar_menu', 'pixassist_subpages_admin_bar_edit_links_backend', 999 );
	}

	add_filter( 'jetpack_development_mode', 'pixassist_more_jetpack_development_mode_detection' );
}
add_action( 'after_setup_theme', 'pixassist_load_theme_dependent_functionality', 20 );

function pixassist_register_open_table_widget() {
	register_widget( 'Pixassist_Open_Table_Widget' );
}
