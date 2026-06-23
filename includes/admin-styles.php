<?php
/**
 * The free Styles tab — the Pixelgrade Design hub's style control center.
 *
 * The tab stays inside Pixelgrade Design and routes users to the best available editing surfaces
 * through explicit destination actions. Assistant owns only the free routing/orientation layer; Plus
 * status is read through the public four-key contract and remains quiet/contextual.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_styles_url' ) ) {
	/**
	 * Resolve the best available style editing surface for this site.
	 *
	 * @param bool|null $is_block_theme Whether the active theme is a block theme. Null reads WP.
	 *
	 * @return string Admin URL for the style surface.
	 */
	function pixassist_get_styles_url( $is_block_theme = null ) {
		if ( null === $is_block_theme ) {
			$is_block_theme = function_exists( 'wp_is_block_theme' ) ? (bool) wp_is_block_theme() : false;
		}

		if ( $is_block_theme ) {
			return admin_url( 'site-editor.php?path=%2Fwp_global_styles' );
		}

		return admin_url( 'customize.php' );
	}
}

if ( ! function_exists( 'pixassist_register_styles_tab' ) ) {
	/**
	 * Register the Styles tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Styles tab appended.
	 */
	function pixassist_register_styles_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'styles',
			'label'      => esc_html__( 'Design System', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'styles',
			'gate'       => '',
			'order'      => 10,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_styles_data' ) ) {
	/**
	 * Build the bootstrap payload the Styles tab renders.
	 *
	 * @return array {
	 *     @type array   $copy          Tab title/intro copy.
	 *     @type array   $primaryAction Primary style editor action.
	 *     @type array[] $destinations  Style destinations.
	 * }
	 */
	function pixassist_get_styles_data() {
		$is_block_theme = function_exists( 'wp_is_block_theme' ) ? (bool) wp_is_block_theme() : false;
		$style_url      = pixassist_get_styles_url( $is_block_theme );
		$plus_status    = function_exists( 'pixassist_get_plus_status' ) ? pixassist_get_plus_status() : array();

		$data = array(
			'copy'          => array(
				'title'       => esc_html__( 'Your Site Design System', '__plugin_txtd' ),
				'intro'       => esc_html__( 'Style Manager controls the visual decisions that keep your theme and blocks working together.', '__plugin_txtd' ),
				'description' => esc_html__( 'Start with the free style controls, then use optional Plus capabilities only when your site needs them.', '__plugin_txtd' ),
			),
			'primaryAction' => array(
				'id'    => 'style-manager',
				'label' => esc_html__( 'Open Style Manager', '__plugin_txtd' ),
				'url'   => $style_url,
			),
			'destinations'  => pixassist_get_styles_destinations( $style_url, $plus_status ),
		);

		/**
		 * Filters the Styles tab bootstrap payload.
		 *
		 * Companion plugins may append destinations, but Assistant keeps the free controls first and
		 * reads Plus state only through the published status contract.
		 *
		 * @param array $data Styles tab payload.
		 */
		return apply_filters( 'pixassist_styles_data', $data );
	}
}

if ( ! function_exists( 'pixassist_get_styles_destinations' ) ) {
	/**
	 * Build the style destination list.
	 *
	 * @param string $style_url   URL to the active style editing surface.
	 * @param array  $plus_status Pixelgrade Plus status contract payload.
	 *
	 * @return array[]
	 */
	function pixassist_get_styles_destinations( $style_url, $plus_status ) {
		$destinations = array(
			array(
				'id'          => 'colors',
				'title'       => esc_html__( 'Colors', '__plugin_txtd' ),
				'description' => esc_html__( 'Adjust the palette and contrast choices that shape your site.', '__plugin_txtd' ),
				'actionLabel' => esc_html__( 'Open in Style Manager', '__plugin_txtd' ),
				'url'         => $style_url,
				'gate'        => '',
				'badge'       => '',
				'isLocked'    => false,
				'isProminent' => false,
				'image'       => pixassist_get_styles_preview_image_url( 'colors' ),
				'imageAlt'    => esc_attr__( 'Color System preview board with generated color roles.', '__plugin_txtd' ),
			),
			array(
				'id'          => 'typography',
				'title'       => esc_html__( 'Typography', '__plugin_txtd' ),
				'description' => esc_html__( 'Tune the font system for headings, body text, and interface details.', '__plugin_txtd' ),
				'actionLabel' => esc_html__( 'Open in Style Manager', '__plugin_txtd' ),
				'url'         => $style_url,
				'gate'        => '',
				'badge'       => '',
				'isLocked'    => false,
				'isProminent' => false,
				'image'       => pixassist_get_styles_preview_image_url( 'typography' ),
				'imageAlt'    => esc_attr__( 'Typography preview board with system font roles.', '__plugin_txtd' ),
			),
			array(
				'id'          => 'spacing',
				'title'       => esc_html__( 'Spacing', '__plugin_txtd' ),
				'description' => esc_html__( 'Refine the rhythm and layout spacing that make pages feel balanced.', '__plugin_txtd' ),
				'actionLabel' => esc_html__( 'Open in Style Manager', '__plugin_txtd' ),
				'url'         => $style_url,
				'gate'        => '',
				'badge'       => '',
				'isLocked'    => false,
				'isProminent' => false,
				'image'       => pixassist_get_styles_preview_image_url( 'spacing' ),
				'imageAlt'    => esc_attr__( 'Spacing and rhythm preview board with layout measurements.', '__plugin_txtd' ),
			),
			pixassist_get_styles_motion_destination( $style_url, $plus_status ),
		);

		/**
		 * Filters the Styles tab destinations.
		 *
		 * @param array[] $destinations Style destination descriptors.
		 * @param string  $style_url    URL to the active style editing surface.
		 * @param array   $plus_status  Pixelgrade Plus status contract payload.
		 */
		return apply_filters( 'pixassist_styles_destinations', $destinations, $style_url, $plus_status );
	}
}

if ( ! function_exists( 'pixassist_get_styles_preview_image_url' ) ) {
	/**
	 * Build a local preview-image URL for a Style Manager section card.
	 *
	 * @param string $section Section identifier.
	 *
	 * @return string
	 */
	function pixassist_get_styles_preview_image_url( $section ) {
		if ( ! defined( 'PIXELGRADE_ASSISTANT__PLUGIN_FILE' ) || ! function_exists( 'plugin_dir_url' ) ) {
			return '';
		}

		$section   = sanitize_key( $section );
		$extension = 'motion' === $section ? 'svg' : 'png';

		return plugin_dir_url( PIXELGRADE_ASSISTANT__PLUGIN_FILE ) . 'admin/images/style-manager-preview-' . $section . '.' . $extension;
	}
}

if ( ! function_exists( 'pixassist_get_styles_motion_destination' ) ) {
	/**
	 * Build the contextual, quiet Motion destination.
	 *
	 * @param string $style_url   URL to the active style editing surface.
	 * @param array  $plus_status Pixelgrade Plus status contract payload.
	 *
	 * @return array
	 */
	function pixassist_get_styles_motion_destination( $style_url, $plus_status ) {
		$is_plus_active   = ! empty( $plus_status['is_plus_active'] );
		$is_plus_licensed = ! empty( $plus_status['is_plus_licensed'] );
		$settings_url     = ! empty( $plus_status['plus_settings_url'] ) ? (string) $plus_status['plus_settings_url'] : admin_url( 'themes.php?page=pixelgrade&tab=account&section=plus' );

		$destination = array(
			'id'          => 'motion',
			'title'       => esc_html__( 'Motion', '__plugin_txtd' ),
			'description' => esc_html__( 'Add coordinated movement to supported blocks and theme elements when your site needs it.', '__plugin_txtd' ),
			'actionLabel' => esc_html__( 'Learn about Pixelgrade Plus', '__plugin_txtd' ),
			'url'         => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'plus/',
			'gate'        => 'plus',
			'badge'       => esc_html__( 'Available with Pixelgrade Plus', '__plugin_txtd' ),
			'isLocked'    => true,
			'isProminent' => false,
			'image'       => pixassist_get_styles_preview_image_url( 'motion' ),
			'imageAlt'    => esc_attr__( 'Motion symbol with movement trails and staggered frames.', '__plugin_txtd' ),
		);

		if ( $is_plus_active && ! $is_plus_licensed ) {
			$destination['actionLabel'] = esc_html__( 'Manage Pixelgrade Plus', '__plugin_txtd' );
			$destination['url']         = $settings_url;
		}

		if ( $is_plus_active && $is_plus_licensed ) {
			$destination['actionLabel'] = esc_html__( 'Open Motion', '__plugin_txtd' );
			$destination['url']         = $style_url;
			$destination['isLocked']    = false;
		}

		return $destination;
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
}
