<?php
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! function_exists( 'pixelgrade_get_template_part' ) ) {
	/**
	 * Get templates passing attributes and including the file.
	 *
	 * @access public
	 *
	 * @param string $template_slug
	 * @param string $template_path Optional.
	 * @param array $args Optional. (default: array())
	 * @param string $template_name Optional. (default: '')
	 * @param string $default_path Optional. (default: '')
	 */
	function pixelgrade_get_template_part( $template_slug, $template_path = '', $args = array(), $template_name = '', $default_path = '' ) {
		if ( ! empty( $args ) && is_array( $args ) ) {
			extract( $args );
		}

		$located = pixelgrade_locate_template_part( $template_slug, $template_path, $template_name, $default_path );

		if ( ! file_exists( $located ) ) {
			/* translators: %s: the template part located path */
			_doing_it_wrong( __FUNCTION__, sprintf( esc_html__( '%s does not exist.', '__plugin_txtd' ), '<code>' . esc_html( $located ) . '</code>' ), null );

			return;
		}

		// Allow 3rd party plugins or themes to filter template file.
		$located = apply_filters( 'pixelgrade_get_template_part', $located, $template_slug, $template_path, $args, $template_name, $default_path );

		$located = wp_normalize_path( $located );

		include( $located ); // phpcs:ignore
	}
}

if ( ! function_exists( 'pixelgrade_get_template_part_html' ) ) {
	/**
	 * Like pixelgrade_get_template_part, but returns the HTML instead of outputting.
	 * @see pixelgrade_get_template_part
	 *
	 * @param string $template_slug
	 * @param string $template_path Optional.
	 * @param array $args Optional. (default: array())
	 * @param string $template_name Optional. (default: '')
	 * @param string $default_path Optional. (default: '')
	 *
	 * @return string
	 */
	function pixelgrade_get_template_part_html( $template_slug, $template_path = '', $args = array(), $template_name = '', $default_path = '' ) {
		ob_start();
		pixelgrade_get_template_part( $template_slug, $template_path, $args, $template_name, $default_path );

		return ob_get_clean();
	}
}

if ( ! function_exists( 'pixelgrade_locate_template_part' ) ) {
	/**
	 * Locate a template part and return the path for inclusion.
	 *
	 * This is the load order:
	 *
	 *      yourtheme       /   $template_path  /   $slug-$name.php
	 *      yourtheme       /   template-parts  /   $template_path  /   $slug-$name.php
	 *      yourtheme       /   template-parts  /   $slug-$name.php
	 *      yourtheme       /   $slug-$name.php
	 *
	 * We will also consider the $template_path as being a component name
	 *      yourtheme       /   components      /   $template_path  /   template-parts   /   $slug-$name.php
	 *
	 *      yourtheme       /   $template_path  /   $slug.php
	 *      yourtheme       /   template-parts  /   $template_path  /   $slug.php
	 *      yourtheme       /   template-parts  /   $slug.php
	 *      yourtheme       /   $slug.php
	 *
	 * We will also consider the $template_path as being a component name
	 *      yourtheme       /   components      /   $template_path  /   template-parts   /   $slug.php
	 *
	 *      $default_path   /   $slug-$name.php
	 *      $default_path   /   $slug.php
	 *
	 * @access public
	 *
	 * @param string $slug
	 * @param string $template_path Optional. Default: ''
	 * @param string $name Optional. Default: ''
	 * @param string $default_path (default: '')
	 *
	 * @return string
	 */
	function pixelgrade_locate_template_part( $slug, $template_path = '', $name = '', $default_path = '' ) {
		$template = '';

		// Setup our partial path (mainly trailingslashit)
		// Make sure we only trailingslashit non-empty strings
		$components_path = 'components/';
		if ( defined( 'PIXELGRADE_COMPONENTS_PATH' ) && '' != PIXELGRADE_COMPONENTS_PATH ) {
			$components_path = trailingslashit( PIXELGRADE_COMPONENTS_PATH );
		}

		$template_parts_path = 'template-parts/';
		if ( defined( 'PIXELGRADE_COMPONENTS_TEMPLATE_PARTS_PATH' ) && '' != PIXELGRADE_COMPONENTS_TEMPLATE_PARTS_PATH ) {
			$template_parts_path = trailingslashit( PIXELGRADE_COMPONENTS_TEMPLATE_PARTS_PATH );
		}

		$template_path_temp = '';
		if ( ! empty( $template_path ) ) {
			$template_path_temp = trailingslashit( $template_path );
		}

		// Make sure that the slug doesn't have slashes at the beginning or end
		$slug = trim( $slug, '/\\' );

		// First try it with the name also, if it's not empty.
		if ( ! empty( $name ) ) {
			// If the name includes the .php extension by any chance, remove it
			if ( false !== $pos = stripos( $name, '.php' ) ) {
				$name = substr( $name, 0, $pos );
			}

			$template_names   = array();
			$template_names[] = $template_path_temp . "{$slug}-{$name}.php";
			if ( ! empty( $template_path_temp ) ) {
				$template_names[] = $template_parts_path . $template_path_temp . "{$slug}-{$name}.php";
			}
			$template_names[] = $template_parts_path . "{$slug}-{$name}.php";
			$template_names[] = "{$slug}-{$name}.php";
			if ( ! empty( $template_path_temp ) ) {
				$template_names[] = $components_path . $template_path_temp . $template_parts_path . "{$slug}-{$name}.php";
			}

			// Look within passed path within the theme
			$template = locate_template( $template_names, false );
		}

		// If we haven't found a template part with the name, use just the slug.
		if ( empty( $template ) ) {
			// If the slug includes the .php extension by any chance, remove it
			if ( false !== $pos = stripos( $slug, '.php' ) ) {
				$slug = substr( $slug, 0, $pos );
			}

			$template_names   = array();
			$template_names[] = $template_path_temp . "{$slug}.php";
			if ( ! empty( $template_path_temp ) ) {
				$template_names[] = $template_parts_path . $template_path_temp . "{$slug}.php";
			}
			$template_names[] = $template_parts_path . "{$slug}.php";
			$template_names[] = "{$slug}.php";
			if ( ! empty( $template_path_temp ) ) {
				$template_names[] = $components_path . $template_path_temp . $template_parts_path . "{$slug}.php";
			}

			// Look within passed path within the theme
			$template = locate_template( $template_names, false );
		}

		// Get default template
		if ( empty( $template ) && ! empty( $default_path ) ) {
			if ( ! empty( $name ) && file_exists( trailingslashit( $default_path ) . "{$slug}-{$name}.php" ) ) {
				$template = trailingslashit( $default_path ) . "{$slug}-{$name}.php";
			} elseif ( file_exists( trailingslashit( $default_path ) . "{$slug}.php" ) ) {
				$template = trailingslashit( $default_path ) . "{$slug}.php";
			} elseif ( file_exists( $default_path ) ) {
				// We might have been given a direct file path through the default - we are fine with that
				$template = $default_path;
			}
		}

		// Make sure we have no double slashing.
		if ( ! empty( $template ) ) {
			$template = wp_normalize_path( $template );
			$template = str_replace( '//', '/', $template );
		}

		// Return what we found.
		return apply_filters( 'pixelgrade_locate_template_part', $template, $slug, $template_path, $name );
	}
}

if ( ! function_exists( 'pixassist_subpages_admin_bar_edit_links_backend' ) ) {
	/**
	 * Subpages edit links in the admin bar
	 *
	 * @param WP_Admin_Bar $wp_admin_bar
	 */
	function pixassist_subpages_admin_bar_edit_links_backend( $wp_admin_bar ) {
		global $post, $pagenow;

		$is_edit_page = false;

		// First let's test if we are on the front end (only there will we get a valid queried object)
		$current_object = get_queried_object();
		if ( ! empty( $current_object ) && ! empty( $current_object->post_type ) && 'page' == $current_object->post_type ) {
			$is_edit_page = true;
		}

		// Now lets test for backend relevant pages
		if ( ! $is_edit_page ) {
			$is_edit_page = in_array( $pagenow, array( 'post.php', ) );
		} elseif ( ! $is_edit_page ) {//check for new post page
			$is_edit_page = in_array( $pagenow, array( 'post-new.php' ) );
		} elseif ( ! $is_edit_page ) { //check for either new or edit
			$is_edit_page = in_array( $pagenow, array( 'post.php', 'post-new.php' ) );
		}

		if ( $is_edit_page && isset( $post->post_parent ) && ! empty( $post->post_parent ) ) {

			$wp_admin_bar->add_node( array(
				'id'    => 'edit_parent',
				'title' => esc_html__( 'Edit Parent', '__plugin_txtd' ),
				'href'  => get_edit_post_link( $post->post_parent ),
				'meta'  => array( 'class' => 'edit_parent_button' )
			) );

			$siblings = get_children(
				array(
					'post_parent' => $post->post_parent,
					'orderby'     => 'menu_order title',
					//this is the exact ordering used on the All Pages page - order included
					'order'       => 'ASC',
					'post_type'   => 'page',
				)
			);

			$siblings    = array_values( $siblings );
			$current_pos = 0;
			foreach ( $siblings as $key => $sibling ) {

				if ( $sibling->ID == $post->ID ) {
					$current_pos = $key;
				}
			}

			if ( isset( $siblings[ $current_pos - 1 ] ) ) {

				$prev_post = $siblings[ $current_pos - 1 ];

				$wp_admin_bar->add_node( array(
					'id'    => 'edit_prev_child',
					'title' => esc_html__( 'Edit Prev Child', '__plugin_txtd' ),
					'href'  => get_edit_post_link( $prev_post->ID ),
					'meta'  => array( 'class' => 'edit_prev_child_button' )
				) );
			}

			if ( isset( $siblings[ $current_pos + 1 ] ) ) {

				$next_post = $siblings[ $current_pos + 1 ];

				$wp_admin_bar->add_node( array(
					'id'    => 'edit_next_child',
					'title' => esc_html__( 'Edit Next Child', '__plugin_txtd' ),
					'href'  => get_edit_post_link( $next_post->ID ),
					'meta'  => array( 'class' => 'edit_next_child_button' )
				) );
			}
		}

		//this way we allow for pages that have both a parent and children
		if ( $is_edit_page ) {

			$kids = get_children(
				array(
					'post_parent' => $post->ID,
					'orderby'     => 'menu_order title',
					//this is the exact ordering used on the All Pages page - order included
					'order'       => 'ASC',
					'post_type'   => 'page',
				)
			);

			if ( ! empty( $kids ) ) {

				$args = array(
					'id'    => 'edit_children',
					'title' => esc_html__( 'Edit Children', '__plugin_txtd' ),
					'href'  => '#',
					'meta'  => array( 'class' => 'edit_children_button' )
				);

				$wp_admin_bar->add_node( $args );

				foreach ( $kids as $kid ) {
					$kid_args = array(
						'parent' => 'edit_children',
						'id'     => 'edit_child_' . $kid->post_name,
						'title'  => esc_html__( 'Edit', '__plugin_txtd' ) . ': ' . $kid->post_title,
						'href'   => get_edit_post_link( $kid->ID ),
						'meta'   => array( 'class' => 'edit_child_button' )
					);
					$wp_admin_bar->add_node( $kid_args );
				}
			}
		}
	}
}

if ( ! function_exists( 'pixassist_more_jetpack_development_mode_detection' ) ) {
	/**
	 * Make sure that not only domains with no dot in them trigger the Jetpack auto-dev mode
	 * We will also account for these "TLDs" ( @link https://iyware.com/dont-use-dev-for-development/ ):
	 * .test
	 * .example
	 * .invalid
	 * .localhost
	 *
	 * @param $development_mode
	 *
	 * @return mixed
	 */
	function pixassist_more_jetpack_development_mode_detection( $development_mode ) {
		$site_url  = site_url();
		$url_parts = wp_parse_url( $site_url );

		if ( ! empty( $url_parts['host'] ) ) {

			$dev_tlds = array(
				'.test',
				'.example',
				'.invalid',
				'.localhost',
			);

			foreach ( $dev_tlds as $dev_tld ) {
				if ( false !== strpos( $url_parts['host'], $dev_tld ) ) {
					$development_mode = true;
					break;
				}
			}
		}

		return $development_mode;
	}
}

if ( ! function_exists( 'pixelgrade_get_current_action' ) ) {
	/**
	 * Get the current request action (it is used in the WP admin)
	 *
	 * @return bool|string
	 */
	function pixelgrade_get_current_action() {
		if ( isset( $_REQUEST['filter_action'] ) && ! empty( $_REQUEST['filter_action'] ) ) {
			return false;
		}

		if ( isset( $_REQUEST['action'] ) && - 1 != $_REQUEST['action'] ) {
			return wp_unslash( sanitize_text_field( $_REQUEST['action'] ) );
		}

		if ( isset( $_REQUEST['action2'] ) && - 1 != $_REQUEST['action2'] ) {
			return wp_unslash( sanitize_text_field( $_REQUEST['action2'] ) );
		}

		if ( isset( $_REQUEST['tgmpa-activate'] ) && - 1 != $_REQUEST['tgmpa-activate'] ) {
			return wp_unslash( sanitize_text_field( $_REQUEST['tgmpa-activate'] ) );
		}

		return false;
	}
}

if ( ! function_exists( 'pixassist_modify_theme_supports_by_features' ) ) {
	/**
	 * Adjust the theme supports data passed around depending on the available theme features.
	 *
	 * @param array $config
	 *
	 * @return array
	 */
	function pixassist_modify_theme_supports_by_features( $config ) {
		if ( ! empty( $config['is_pixelgrade_theme'] ) ) {

			// Remove any "Lite" from the theme name.
			if ( false !== strpos( strtolower( $config['theme_name'] ), 'lite' ) ) {
				$config['theme_name'] = preg_replace( '#[\s\-_]*lite#i', '', $config['theme_name'] );
			}

			// Remove any "Lite" from the theme title.
			if ( false !== strpos( strtolower( $config['theme_title'] ), 'lite' ) ) {
				$config['theme_title'] = preg_replace( '#[\s\-_]*lite#i', '', $config['theme_title'] );
			}

			if ( PixelgradeAssistant_Admin::is_wporg_theme() || PixelgradeAssistant_Admin::get_theme_type() === 'theme_modular' ) {
				// By default we will add '(Free)';
				$theme_title_suffix = 'Free';
				$classes            = array( 'features' );
				if ( pixelgrade_user_has_access( 'pro-features' ) ) {
					$theme_title_suffix = 'Pro';
					$classes[]          = 'pro';

					if ( pixelgrade_user_has_access( 'woocommerce' ) ) {
						$theme_title_suffix .= ' + Woo';
						$classes[]          = 'woo';
					}
				} else {
					$classes[] = 'free';
				}

				$config['theme_title'] .= ' <span class="' . esc_attr( join( ' ', $classes ) ) . '">' . $theme_title_suffix . '</span>';
			}
		}

		return $config;
	}
}
add_filter( 'pixassist_validate_theme_supports', 'pixassist_modify_theme_supports_by_features', 10, 1 );

if ( ! function_exists( 'pixelgrade_user_has_access' ) ) {
	/**
	 * Helper function used to check that the user has access to various features.
	 *
	 * @param string $feature
	 *
	 * @return bool
	 */
	function pixelgrade_user_has_access( $feature ) {
		switch ( $feature ) {
			case 'pro-features':
				return apply_filters( 'pixelgrade_enable_pro_features', false );
				break;
			case 'woocommerce':
				return apply_filters( 'pixelgrade_enable_woocommerce', false );
				break;
			default:
				break;
		}

		return false;
	}
}
