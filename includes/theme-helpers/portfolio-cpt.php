<?php
/**
 * The clean `portfolio` custom post type for Pixelgrade block themes (Anima LT).
 *
 * This re-homes, inside Pixelgrade Assistant, the post type that Pixelgrade Care used to
 * provide. Anima LT's FSE templates (`single-portfolio`, `archive-portfolio`,
 * `taxonomy-portfolio_type`, `taxonomy-portfolio_tag`) and Nova Blocks' rendering
 * (`is_singular( 'portfolio' )`, `get_the_terms( $id, 'portfolio_type' )`) both reference the
 * `portfolio` post type and its `portfolio_type` / `portfolio_tag` taxonomies — but nothing in
 * the free stack registers them once Care is gone. We register them here.
 *
 * Registration is gated on the active theme declaring `add_theme_support( 'portfolio' )`, with a
 * `pixassist_register_portfolio_cpt` filter escape hatch.
 *
 * Deliberately leaner than the Care version it descends from: no pro-features license gate, no
 * theme-config coupling, no custom metafields, and no posts-per-page override (the FSE query
 * loop block owns archive pagination now).
 *
 * @link       https://pixelgrade.com
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/ThemeHelpers
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_portfolio_cpt_is_enabled' ) ) {
	/**
	 * Whether the `portfolio` custom post type should be registered for the current theme.
	 *
	 * Driven by the active theme declaring `add_theme_support( 'portfolio' )`. Companion plugins
	 * or site owners can override the decision through the filter below.
	 *
	 * @return bool
	 */
	function pixassist_portfolio_cpt_is_enabled() {
		$enabled = current_theme_supports( 'portfolio' );

		/**
		 * Filters whether Assistant registers the `portfolio` custom post type.
		 *
		 * Defaults to whether the active theme declared `add_theme_support( 'portfolio' )`.
		 *
		 * @param bool $enabled Whether to register the portfolio CPT.
		 */
		return (bool) apply_filters( 'pixassist_register_portfolio_cpt', $enabled );
	}
}

if ( ! function_exists( 'pixassist_register_portfolio_post_type' ) ) {
	/**
	 * Register the `portfolio` post type plus its `portfolio_type` and `portfolio_tag` taxonomies.
	 *
	 * Guarded by post_type_exists() so it is safe to call more than once (e.g. on `init` and again
	 * on `import_start`), and so it yields to Jetpack/another plugin should one already own the slug.
	 *
	 * @return void
	 */
	function pixassist_register_portfolio_post_type() {
		if ( post_type_exists( 'portfolio' ) ) {
			return;
		}

		register_post_type(
			'portfolio',
			array(
				'labels'          => array(
					'name'                  => esc_html__( 'Projects', '__plugin_txtd' ),
					'singular_name'         => esc_html__( 'Project', '__plugin_txtd' ),
					'menu_name'             => esc_html__( 'Portfolio', '__plugin_txtd' ),
					'all_items'             => esc_html__( 'All Projects', '__plugin_txtd' ),
					'add_new'               => esc_html__( 'Add New', '__plugin_txtd' ),
					'add_new_item'          => esc_html__( 'Add New Project', '__plugin_txtd' ),
					'edit_item'             => esc_html__( 'Edit Project', '__plugin_txtd' ),
					'new_item'              => esc_html__( 'New Project', '__plugin_txtd' ),
					'view_item'             => esc_html__( 'View Project', '__plugin_txtd' ),
					'search_items'          => esc_html__( 'Search Projects', '__plugin_txtd' ),
					'not_found'             => esc_html__( 'No Projects found', '__plugin_txtd' ),
					'not_found_in_trash'    => esc_html__( 'No Projects found in Trash', '__plugin_txtd' ),
					'filter_items_list'     => esc_html__( 'Filter projects list', '__plugin_txtd' ),
					'items_list_navigation' => esc_html__( 'Project list navigation', '__plugin_txtd' ),
					'items_list'            => esc_html__( 'Projects list', '__plugin_txtd' ),
				),
				'supports'        => array(
					'title',
					'editor',
					'thumbnail',
					'excerpt',
					'author',
					'custom-fields',
					'revisions',
				),
				'rewrite'         => array(
					'slug'       => 'portfolio',
					'with_front' => false,
					'feeds'      => true,
					'pages'      => true,
				),
				'public'          => true,
				'show_ui'         => true,
				'menu_position'   => 20,                    // Below Pages.
				'menu_icon'       => 'dashicons-portfolio', // 3.8+ dashicon option.
				'capability_type' => 'post',
				'map_meta_cap'    => true,
				'taxonomies'      => array( 'portfolio_type', 'portfolio_tag' ),
				'has_archive'     => true,
				'query_var'       => 'portfolio',
				'show_in_rest'    => true,
			)
		);

		register_taxonomy(
			'portfolio_type',
			'portfolio',
			array(
				'hierarchical'      => true,
				'labels'            => array(
					'name'                  => esc_html__( 'Project Types', '__plugin_txtd' ),
					'singular_name'         => esc_html__( 'Project Type', '__plugin_txtd' ),
					'menu_name'             => esc_html__( 'Project Types', '__plugin_txtd' ),
					'all_items'             => esc_html__( 'All Project Types', '__plugin_txtd' ),
					'edit_item'             => esc_html__( 'Edit Project Type', '__plugin_txtd' ),
					'view_item'             => esc_html__( 'View Project Type', '__plugin_txtd' ),
					'update_item'           => esc_html__( 'Update Project Type', '__plugin_txtd' ),
					'add_new_item'          => esc_html__( 'Add New Project Type', '__plugin_txtd' ),
					'new_item_name'         => esc_html__( 'New Project Type Name', '__plugin_txtd' ),
					'parent_item'           => esc_html__( 'Parent Project Type', '__plugin_txtd' ),
					'parent_item_colon'     => esc_html__( 'Parent Project Type:', '__plugin_txtd' ),
					'search_items'          => esc_html__( 'Search Project Types', '__plugin_txtd' ),
					'not_found'             => esc_html__( 'No project types found.', '__plugin_txtd' ),
					'items_list_navigation' => esc_html__( 'Project type list navigation', '__plugin_txtd' ),
					'items_list'            => esc_html__( 'Project type list', '__plugin_txtd' ),
				),
				'public'            => true,
				'show_ui'           => true,
				'show_in_nav_menus' => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'query_var'         => true,
				'rewrite'           => array( 'slug' => 'project-type' ),
			)
		);

		register_taxonomy(
			'portfolio_tag',
			'portfolio',
			array(
				'hierarchical'      => false,
				'labels'            => array(
					'name'                       => esc_html__( 'Project Tags', '__plugin_txtd' ),
					'singular_name'              => esc_html__( 'Project Tag', '__plugin_txtd' ),
					'menu_name'                  => esc_html__( 'Project Tags', '__plugin_txtd' ),
					'all_items'                  => esc_html__( 'All Project Tags', '__plugin_txtd' ),
					'edit_item'                  => esc_html__( 'Edit Project Tag', '__plugin_txtd' ),
					'view_item'                  => esc_html__( 'View Project Tag', '__plugin_txtd' ),
					'update_item'                => esc_html__( 'Update Project Tag', '__plugin_txtd' ),
					'add_new_item'               => esc_html__( 'Add New Project Tag', '__plugin_txtd' ),
					'new_item_name'              => esc_html__( 'New Project Tag Name', '__plugin_txtd' ),
					'search_items'               => esc_html__( 'Search Project Tags', '__plugin_txtd' ),
					'popular_items'              => esc_html__( 'Popular Project Tags', '__plugin_txtd' ),
					'separate_items_with_commas' => esc_html__( 'Separate tags with commas', '__plugin_txtd' ),
					'add_or_remove_items'        => esc_html__( 'Add or remove tags', '__plugin_txtd' ),
					'choose_from_most_used'      => esc_html__( 'Choose from the most used tags', '__plugin_txtd' ),
					'not_found'                  => esc_html__( 'No project tags found.', '__plugin_txtd' ),
					'items_list_navigation'      => esc_html__( 'Project tag list navigation', '__plugin_txtd' ),
					'items_list'                 => esc_html__( 'Project tag list', '__plugin_txtd' ),
				),
				'public'            => true,
				'show_ui'           => true,
				'show_in_nav_menus' => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'query_var'         => true,
				'rewrite'           => array( 'slug' => 'project-tag' ),
			)
		);
	}
}

if ( ! function_exists( 'pixassist_maybe_register_portfolio_cpt' ) ) {
	/**
	 * Register the portfolio CPT when enabled, flushing rewrite rules once so that single and
	 * archive permalinks resolve the first time the post type appears.
	 *
	 * @return void
	 */
	function pixassist_maybe_register_portfolio_cpt() {
		if ( ! pixassist_portfolio_cpt_is_enabled() ) {
			return;
		}

		pixassist_register_portfolio_post_type();

		// One-time permalink flush. Cleared on theme switch so it can re-run if support changes.
		if ( '1' !== (string) get_option( 'pixassist_portfolio_rewrite_flushed', '0' ) ) {
			flush_rewrite_rules( false );
			update_option( 'pixassist_portfolio_rewrite_flushed', '1' );
		}
	}
}

if ( ! function_exists( 'pixassist_portfolio_reset_rewrite_flag' ) ) {
	/**
	 * Reset the one-time rewrite-flush flag (on theme switch) so permalinks re-flush if needed.
	 *
	 * @return void
	 */
	function pixassist_portfolio_reset_rewrite_flag() {
		update_option( 'pixassist_portfolio_rewrite_flushed', '0' );
	}
}

if ( ! function_exists( 'pixassist_portfolio_allow_in_rest_api' ) ) {
	/**
	 * Add the portfolio post type to the REST API allowed list (legacy WP.com/Jetpack filter).
	 *
	 * @param array $post_types Allowed post types.
	 *
	 * @return array
	 */
	function pixassist_portfolio_allow_in_rest_api( $post_types ) {
		$post_types = (array) $post_types;
		if ( ! in_array( 'portfolio', $post_types, true ) ) {
			$post_types[] = 'portfolio';
		}

		return $post_types;
	}
}

if ( function_exists( 'add_action' ) ) {
	// Register on init for the front end / admin / block editor.
	add_action( 'init', 'pixassist_maybe_register_portfolio_cpt' );

	// Ensure the post type exists during starter-content / WXR imports, regardless of timing.
	add_action( 'import_start', 'pixassist_register_portfolio_post_type' );

	// A theme switch may add or drop `portfolio` support; allow a fresh permalink flush.
	add_action( 'after_switch_theme', 'pixassist_portfolio_reset_rewrite_flag' );

	add_filter( 'rest_api_allowed_post_types', 'pixassist_portfolio_allow_in_rest_api' );
}
