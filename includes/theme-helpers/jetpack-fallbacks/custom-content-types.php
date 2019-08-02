<?php
/**
 * Code borrowed from Jetpack just in case Jetpack is missing
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Add Settings Section for CPT
function pixcare_jetpack_cpt_settings_api_init() {
	add_settings_section(
		'jetpack_cpt_section',
		'<span id="cpt-options">' . esc_html__( 'Your Custom Content Types', '__plugin_txtd' ) . '</span>',
		'pixcare_jetpack_cpt_section_callback',
		'writing'
	);
}
add_action( 'admin_init', 'pixcare_jetpack_cpt_settings_api_init' );

/*
 * Settings Description
 */
function pixcare_jetpack_cpt_section_callback() {
	?>
	<p>
		<?php esc_html_e( 'Use these settings to display different types of content on your site.', '__plugin_txtd' ); ?>
		<a target="_blank" href="http://jetpack.com/support/custom-content-types/"><?php esc_html_e( 'Learn More', '__plugin_txtd' ); ?></a>
	</p>
	<?php
}
