<?php
/**
 * Handle the plugin's behavior when in dev mode.
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Determine if we are in dev mode.
 *
 * @return bool
 */
function pixcare_is_devmode() {
	if ( defined( 'PIXELGRADE_ASSISTANT__DEV_MODE' ) && PIXELGRADE_ASSISTANT__DEV_MODE === true ) {
		return true;
	}

	return false;
}

/**
 * For initializing the data collector when in dev mode.
 *
 * @param bool $allow
 *
 * @return bool
 */
function pixcare_devmode_enable_data_collector_module( $allow ) {
	if ( pixcare_is_devmode() ) {
		$allow = true;
	}

	return $allow;
}
add_filter( 'pixcare_allow_data_collector_module', 'pixcare_devmode_enable_data_collector_module', 100, 1 );
