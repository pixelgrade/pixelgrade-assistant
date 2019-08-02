<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/*
 * This class is a trimmed and modified version of the one in Jetpack: Jetpack_Portfolio
 * We have retained only the shortcode part and made it so that it can use the same template-part that we use in regular archives
 */
class Pixelgrade_Jetpack_Portfolio_Shortcode {

	const CUSTOM_POST_TYPE       = 'jetpack-portfolio';
	const CUSTOM_TAXONOMY_TYPE   = 'jetpack-portfolio-type';
	const CUSTOM_TAXONOMY_TAG    = 'jetpack-portfolio-tag';

	private static $_instance = null;

	/**
	 * Setup the shortcode by overwriting the Jetpack registered one
	 */
	function __construct() {
		// Overwrite the jetpack_portfolio shortcode and portfolio shortcode (legacy)
		remove_shortcode( 'portfolio' );
		add_shortcode( 'portfolio', array( $this, 'portfolio_shortcode' ) );
		remove_shortcode( 'jetpack_portfolio' );
		add_shortcode( 'jetpack_portfolio', array( $this, 'portfolio_shortcode' ) );
	}

	/**
	 * Our [portfolio] shortcode.
	 * Prints Portfolio data styled to look good on *any* theme.
	 *
	 * @return string
	 */
	static function portfolio_shortcode( $atts ) {
		// Default attributes
		$atts = shortcode_atts( array(
			'display_types'   => true,
			'display_tags'    => true,
			'display_content' => true,
			'display_author'  => false,
			'include_type'    => false,
			'include_tag'     => false,
			'exclude_ids'     => false,
			'columns'         => 3,
			'showposts'       => -1,
			'order'           => 'desc',
			'orderby'         => 'date',
		), $atts, 'portfolio' );

		// A little sanitization
		if ( $atts['display_types'] && 'true' != $atts['display_types'] ) {
			$atts['display_types'] = false;
		}

		if ( $atts['display_tags'] && 'true' != $atts['display_tags'] ) {
			$atts['display_tags'] = false;
		}

		if ( $atts['display_author'] && 'true' != $atts['display_author'] ) {
			$atts['display_author'] = false;
		}

		if ( $atts['display_content'] && 'true' != $atts['display_content'] && 'full' != $atts['display_content'] ) {
			$atts['display_content'] = false;
		}

		if ( $atts['include_type'] ) {
			$atts['include_type'] = explode( ',', str_replace( ' ', '', $atts['include_type'] ) );
		}

		if ( $atts['include_tag'] ) {
			$atts['include_tag'] = explode( ',', str_replace( ' ', '', $atts['include_tag'] ) );
		}

		if ( $atts['exclude_ids'] ) {
			$atts['exclude_ids'] = explode( ',', str_replace( ' ', '', $atts['exclude_ids'] ) );
		}

		$atts['columns'] = absint( $atts['columns'] );

		$atts['showposts'] = intval( $atts['showposts'] );


		if ( $atts['order'] ) {
			$atts['order'] = urldecode( $atts['order'] );
			$atts['order'] = strtoupper( $atts['order'] );
			if ( 'DESC' != $atts['order'] ) {
				$atts['order'] = 'ASC';
			}
		}

		if ( $atts['orderby'] ) {
			$atts['orderby'] = urldecode( $atts['orderby'] );
			$atts['orderby'] = strtolower( $atts['orderby'] );
			$allowed_keys = array( 'author', 'date', 'title', 'rand' );

			$parsed = array();
			foreach ( explode( ',', $atts['orderby'] ) as $portfolio_index_number => $orderby ) {
				if ( ! in_array( $orderby, $allowed_keys ) ) {
					continue;
				}
				$parsed[] = $orderby;
			}

			if ( empty( $parsed ) ) {
				unset( $atts['orderby'] );
			} else {
				$atts['orderby'] = implode( ' ', $parsed );
			}
		}

		return self::portfolio_shortcode_html( $atts );
	}

	/**
	 * Query to retrieve entries from the Portfolio post_type.
	 *
	 * @return object
	 */
	static function portfolio_query( $atts ) {
		// Default query arguments
		$default = array(
			'order'          => $atts['order'],
			'orderby'        => $atts['orderby'],
			'posts_per_page' => $atts['showposts'],
		);

		$args = wp_parse_args( $atts, $default );
		$args['post_type'] = self::CUSTOM_POST_TYPE; // Force this post type

		if ( false != $atts['include_type'] || false != $atts['include_tag'] ) {
			$args['tax_query'] = array();
		}

		// If 'include_type' has been set use it on the main query
		if ( false != $atts['include_type'] ) {
			array_push( $args['tax_query'], array(
				'taxonomy' => self::CUSTOM_TAXONOMY_TYPE,
				'field'    => 'slug',
				'terms'    => $atts['include_type'],
			) );
		}

		// If 'include_tag' has been set use it on the main query
		if ( false != $atts['include_tag'] ) {
			array_push( $args['tax_query'], array(
				'taxonomy' => self::CUSTOM_TAXONOMY_TAG,
				'field'    => 'slug',
				'terms'    => $atts['include_tag'],
			) );
		}

		if ( false != $atts['include_type'] && false != $atts['include_tag'] ) {
			$args['tax_query']['relation'] = 'AND';
		}

		// If 'exclude_ids' has been set use it on the main query
		if ( false != $atts['exclude_ids'] ) {
			$args['post__not_in'] = $atts['exclude_ids'];
		}

		// Run the query and return
		$query = new WP_Query( $args );
		return $query;
	}

	/**
	 * The Portfolio shortcode loop.
	 *
	 * @return string
	 */
	static function portfolio_shortcode_html( $atts ) {
		// Do the query please
		// This variable will be available to the the loop template part
		$portfolio_query = self::portfolio_query( $atts );

		ob_start();

		// Now we need to include the loop template (maybe a theme overrides the default one?)
		// If the Portfolio component is present and active, then we will look into it for a file called loop-shortcode.php
		if ( class_exists( 'Pixelgrade_Portfolio' ) && Pixelgrade_Portfolio::isActive() ) {
			$template = pixelgrade_locate_template_part( 'loop', Pixelgrade_Portfolio::COMPONENT_SLUG, 'shortcode', plugin_dir_path( __FILE__ ) . 'template-parts' );
		} else {
			// Otherwise we look first in the usual places (like template-parts) for a file called loop-shortcode.php
			$template = pixelgrade_locate_template_part( 'loop', '', 'shortcode', plugin_dir_path( __FILE__ ) . 'template-parts' );
		}

		if ( ! file_exists( $template ) ) {
			_doing_it_wrong( __FUNCTION__, sprintf( __( '%s does not exist.', '__plugin_txtd' ), '<code>' . $template . '</code>' ), '1.2.6' );
		} else {
			include( $template );
		}

		$html = ob_get_clean();

		// If there is a [portfolio] within a [portfolio], remove the shortcode
		if ( has_shortcode( $html, 'portfolio' ) ){
			remove_shortcode( 'portfolio' );
		}

		// If there is a [jetpack_portfolio] within a [jetpack_portfolio], remove the shortcode
		if ( has_shortcode( $html, 'jetpack_portfolio' ) ){
			remove_shortcode( 'jetpack_portfolio' );
		}

		// Return the HTML block
		return $html;
	}

	/**
	 * Individual project class
	 *
	 * @return string
	 */
	static function get_project_class( $portfolio_index_number, $columns ) {
		$project_types = wp_get_object_terms( get_the_ID(), self::CUSTOM_TAXONOMY_TYPE, array( 'fields' => 'slugs' ) );
		$class = array();

		$class[] = 'portfolio-entry-column-'.$columns;
		// add a type- class for each project type
		foreach ( $project_types as $project_type ) {
			$class[] = 'type-' . esc_html( $project_type );
		}
		if( $columns > 1) {
			if ( ( $portfolio_index_number % 2 ) == 0 ) {
				$class[] = 'portfolio-entry-mobile-first-item-row';
			} else {
				$class[] = 'portfolio-entry-mobile-last-item-row';
			}
		}

		// add first and last classes to first and last items in a row
		if ( ( $portfolio_index_number % $columns ) == 0 ) {
			$class[] = 'portfolio-entry-first-item-row';
		} elseif ( ( $portfolio_index_number % $columns ) == ( $columns - 1 ) ) {
			$class[] = 'portfolio-entry-last-item-row';
		}


		/**
		 * Filter the class applied to project div in the portfolio
		 *
		 * @module custom-content-types
		 *
		 * @since 3.1.0
		 *
		 * @param string $class class name of the div.
		 * @param int $portfolio_index_number iterator count the number of columns up starting from 0.
		 * @param int $columns number of columns to display the content in.
		 *
		 */
		return apply_filters( 'portfolio-project-post-class', implode( " ", $class ) , $portfolio_index_number, $columns );
	}

	/**
	 * Displays the project type that a project belongs to.
	 *
	 * @return string
	 */
	static function get_project_type( $post_id ) {
		$project_types = get_the_terms( $post_id, self::CUSTOM_TAXONOMY_TYPE );

		// If no types, return empty string
		if ( empty( $project_types ) || is_wp_error( $project_types ) ) {
			return;
		}

		$html = '<div class="project-types"><span>' . __( 'Types', '__plugin_txtd' ) . ':</span>';
		$types = array();
		// Loop thorugh all the types
		foreach ( $project_types as $project_type ) {
			$project_type_link = get_term_link( $project_type, self::CUSTOM_TAXONOMY_TYPE );

			if ( is_wp_error( $project_type_link ) ) {
				return $project_type_link;
			}

			$types[] = '<a href="' . esc_url( $project_type_link ) . '" rel="tag">' . esc_html( $project_type->name ) . '</a>';
		}
		$html .= ' '.implode( ', ', $types );
		$html .= '</div>';

		return $html;
	}

	/**
	 * Displays the project tags that a project belongs to.
	 *
	 * @return string
	 */
	static function get_project_tags( $post_id ) {
		$project_tags = get_the_terms( $post_id, self::CUSTOM_TAXONOMY_TAG );

		// If no tags, return empty string
		if ( empty( $project_tags ) || is_wp_error( $project_tags ) ) {
			return false;
		}

		$html = '<div class="project-tags"><span>' . __( 'Tags', '__plugin_txtd' ) . ':</span>';
		$tags = array();
		// Loop thorugh all the tags
		foreach ( $project_tags as $project_tag ) {
			$project_tag_link = get_term_link( $project_tag, self::CUSTOM_TAXONOMY_TYPE );

			if ( is_wp_error( $project_tag_link ) ) {
				return $project_tag_link;
			}

			$tags[] = '<a href="' . esc_url( $project_tag_link ) . '" rel="tag">' . esc_html( $project_tag->name ) . '</a>';
		}
		$html .= ' '. implode( ', ', $tags );
		$html .= '</div>';

		return $html;
	}

	/**
	 * Displays the author of the current portfolio project.
	 *
	 * @return string
	 */
	static function get_project_author() {
		$html = '<div class="project-author">';
		/* translators: %1$s is link to author posts, %2$s is author display name */
		$html .= sprintf( __( '<span>Author:</span> <a href="%1$s">%2$s</a>', '__plugin_txtd' ),
			esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
			esc_html( get_the_author() )
		);
		$html .= '</div>';

		return $html;
	}

	/**
	 * Display the featured image if it's available
	 *
	 * @return string
	 */
	static function get_portfolio_thumbnail_link( $post_id ) {
		if ( has_post_thumbnail( $post_id ) ) {
			/**
			 * Change the Portfolio thumbnail size.
			 *
			 * @module custom-content-types
			 *
			 * @since 3.4.0
			 *
			 * @param string|array $var Either a registered size keyword or size array.
			 */
			return '<a class="portfolio-featured-image" href="' . esc_url( get_permalink( $post_id ) ) . '">' . get_the_post_thumbnail( $post_id, apply_filters( 'jetpack_portfolio_thumbnail_size', 'large' ) ) . '</a>';
		}
	}

	/**
	 * Main Pixelgrade_Jetpack_Portfolio_Shortcode Instance
	 *
	 * Ensures only one instance of Pixelgrade_Jetpack_Portfolio_Shortcode is loaded or can be loaded.
	 *
	 * @since  1.0.0
	 * @static
	 *
	 * @return Pixelgrade_Jetpack_Portfolio_Shortcode
	 */
	public static function instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}

		return self::$_instance;
	} // End instance ()

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), '1.0.0' );
	} // End __clone ()

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ),  '1.0.0' );
	} // End __wakeup ()
}
