<?php
/**
 * Load various logic for specific integrations.
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load Customify compatibility file.
 */
require plugin_dir_path( __FILE__ ) . '/integrations/customify.php';
