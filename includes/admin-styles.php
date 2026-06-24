<?php
/**
 * The free Styles tab — the Pixelgrade Design hub's style control center.
 *
 * The tab stays inside Pixelgrade Design and routes users to the best available editing surfaces
 * through explicit destination actions. Assistant owns only the free routing/orientation layer.
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
			return admin_url( 'site-editor.php?p=' . rawurlencode( pixassist_get_styles_canvas_path() ) . '&canvas=edit&sm-sidebar=1' );
		}

		return admin_url( 'customize.php' );
	}
}

if ( ! function_exists( 'pixassist_get_styles_canvas_path' ) ) {
	/**
	 * Resolve a concrete Site Editor canvas path for the active block theme.
	 *
	 * @return string Site Editor path for an existing template.
	 */
	function pixassist_get_styles_canvas_path() {
		$template_slugs = array( 'front-page', 'home', 'index' );

		if ( function_exists( 'get_block_templates' ) ) {
			$templates = get_block_templates(
				array(
					'slug__in' => $template_slugs,
				),
				'wp_template'
			);

			foreach ( $template_slugs as $slug ) {
				foreach ( (array) $templates as $template ) {
					if ( empty( $template->id ) || empty( $template->slug ) || $slug !== $template->slug ) {
						continue;
					}

					return '/wp_template/' . $template->id;
				}
			}
		}

		if ( function_exists( 'get_stylesheet' ) ) {
			$stylesheet = sanitize_key( get_stylesheet() );

			if ( '' !== $stylesheet ) {
				return '/wp_template/' . $stylesheet . '//index';
			}
		}

		return '/template';
	}
}

if ( ! function_exists( 'pixassist_get_styles_section_url' ) ) {
	/**
	 * Build a direct URL to a Style Manager section on the active editing surface.
	 *
	 * @param string $style_url    URL to the active style editing surface.
	 * @param string $section_id   Style Manager section ID.
	 * @param bool   $open_preview Whether the section preview should open with the section.
	 *
	 * @return string
	 */
	function pixassist_get_styles_section_url( $style_url, $section_id, $open_preview = false ) {
		$style_url     = (string) $style_url;
		$section_id    = sanitize_key( $section_id );
		$open_preview  = (bool) $open_preview;

		if ( '' === $style_url || '' === $section_id ) {
			return $style_url;
		}

		if ( false !== strpos( $style_url, 'site-editor.php' ) ) {
			$url = pixassist_add_styles_query_arg( $style_url, 'sm-section', $section_id );

			if ( $open_preview ) {
				$url = pixassist_add_styles_query_arg( $url, 'sm-preview', '1' );
			}

			return $url;
		}

		if ( false !== strpos( $style_url, 'customize.php' ) ) {
			return pixassist_add_styles_query_arg( $style_url, 'autofocus[section]', $section_id );
		}

		return $style_url;
	}
}

if ( ! function_exists( 'pixassist_add_styles_query_arg' ) ) {
	/**
	 * Append one query arg to a style URL.
	 *
	 * @param string $url   URL to update.
	 * @param string $key   Query argument key.
	 * @param string $value Query argument value.
	 *
	 * @return string
	 */
	function pixassist_add_styles_query_arg( $url, $key, $value ) {
		if ( function_exists( 'add_query_arg' ) ) {
			return add_query_arg( $key, $value, $url );
		}

		$separator = false === strpos( $url, '?' ) ? '?' : '&';

		return $url . $separator . rawurlencode( $key ) . '=' . rawurlencode( $value );
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

		$data = array(
			'copy'          => array(
				'title'       => esc_html__( 'Your Site Design System', '__plugin_txtd' ),
				'intro'       => esc_html__( 'Style Manager controls the visual decisions that keep your theme and blocks working together.', '__plugin_txtd' ),
				'description' => esc_html__( 'Use these Style Manager sections to refine the visual foundations your site exposes.', '__plugin_txtd' ),
			),
			'primaryAction' => array(
				'id'    => 'style-manager',
				'label' => esc_html__( 'Open Style Manager', '__plugin_txtd' ),
				'url'   => $style_url,
			),
			'destinations'  => pixassist_get_styles_destinations( $style_url ),
		);

		/**
		 * Filters the Styles tab bootstrap payload.
		 *
		 * Companion plugins may append destinations, but Assistant keeps the free controls first and
		 * avoids implying unavailable Style Manager sections.
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
	 * @param array  $plus_status Deprecated. Kept only as a third filter argument for compatibility.
	 *
	 * @return array[]
	 */
	function pixassist_get_styles_destinations( $style_url, $plus_status = array() ) {
		$destinations = array(
			array(
				'id'          => 'colors',
				'title'       => esc_html__( 'Colors', '__plugin_txtd' ),
				'description' => esc_html__( 'Adjust the palette and contrast choices that shape your site.', '__plugin_txtd' ),
				'actionLabel' => esc_html__( 'Edit the Color System', '__plugin_txtd' ),
				'url'         => pixassist_get_styles_section_url( $style_url, 'sm_color_palettes_section', true ),
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
				'actionLabel' => esc_html__( 'Manage Typography', '__plugin_txtd' ),
				'url'         => pixassist_get_styles_section_url( $style_url, 'sm_font_palettes_section', true ),
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
				'actionLabel' => esc_html__( 'Adjust Spacing', '__plugin_txtd' ),
				'url'         => pixassist_get_styles_section_url( $style_url, 'sm_spacing_section', true ),
				'gate'        => '',
				'badge'       => '',
				'isLocked'    => false,
				'isProminent' => false,
				'image'       => pixassist_get_styles_preview_image_url( 'spacing' ),
				'imageAlt'    => esc_attr__( 'Spacing and rhythm preview board with layout measurements.', '__plugin_txtd' ),
			),
		);

		/**
		 * Filters the Styles tab destinations.
		 *
		 * @param array[] $destinations Style destination descriptors.
		 * @param string  $style_url    URL to the active style editing surface.
		 * @param array   $plus_status  Deprecated. Empty by default.
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

		$section = sanitize_key( $section );

		return plugin_dir_url( PIXELGRADE_ASSISTANT__PLUGIN_FILE ) . 'admin/images/style-manager-preview-' . $section . '.png';
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_styles_tab' );
}
