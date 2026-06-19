<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 *
 * Class responsable for the Starter Content Component
 * Basically this is an Import Demo Data system
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/admin
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant_StarterContent {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 */
	public $parent = null;

	/**
	 * Request-local cache for source SCE responses used by layout Apply/import flows.
	 *
	 * @var array
	 */
	private $layout_source_cache = array();

	/**
	 * Request-local cache for remote WP REST objects referenced by source menu items.
	 *
	 * @var array
	 */
	private $layout_source_object_cache = array();

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_StarterContent
	 * @access  protected
	 */
	protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param PixelgradeAssistant $parent The parent instance.
	 */
	public function __construct( $parent ) {
		$this->parent = $parent;

		add_action( 'rest_api_init', array( $this, 'add_rest_routes_api' ) );

		// Add some data to the localized data
		add_filter( 'pixassist_localized_data', array( $this, 'localize_js_data' ) );

		if ( apply_filters( 'pixassist_sce_allow_options_filtering', true ) ) {
			add_filter( 'pixassist_sce_import_post_option_page_on_front', array(
				$this,
				'filter_post_option_page_on_front'
			), 10, 2 );
			add_filter( 'pixassist_sce_import_post_option_page_for_posts', array(
				$this,
				'filter_post_option_page_for_posts'
			), 10, 2 );
			add_filter( 'pixassist_sce_import_post_theme_mod_nav_menu_locations', array(
				$this,
				'filter_post_theme_mod_nav_menu_locations'
			), 10, 2 );

			/*
			 * Replace the custom logo attachment ID with the new one.
			 */
			add_filter( 'pixassist_sce_import_post_theme_mod_custom_logo', array( $this, 'filter_post_theme_mod_custom_logo' ), 10, 2 );
			/**
			 * Some themes use custom keys for various attachment ID controls, so we need to treat them separately.
			 */
			add_filter( 'pixassist_sce_import_post_theme_mod_osteria_transparent_logo', array( $this, 'filter_post_theme_mod_custom_logo' ), 10, 2 );
			add_filter( 'pixassist_sce_import_post_theme_mod_pixelgrade_transparent_logo', array( $this, 'filter_post_theme_mod_custom_logo' ), 10, 2 );
			// Anima exposes its transparent-header logo as `anima_transparent_logo` (the "Logo while on
			// Transparent Header" control), so its attachment ID needs remapping on import too.
			add_filter( 'pixassist_sce_import_post_theme_mod_anima_transparent_logo', array( $this, 'filter_post_theme_mod_custom_logo' ), 10, 2 );

			// prevent Jetpack from disabling the theme's style on import
			add_filter( 'pixassist_sce_import_post_theme_mod_jetpack_custom_css', array( $this, 'uncheck_jetpack_custom_css_style_replacement' ) );

			//widgets

			// content links
			add_action( 'pixassist_sce_after_insert_post', array( $this, 'prepare_menus_links' ), 10, 3 );

			// Re-bind imported block templates to the active theme (see the method for the why).
			add_action( 'pixassist_sce_after_insert_post', array( $this, 'reassign_imported_template_theme' ), 10, 3 );

			add_action( 'pixassist_sce_import_end', array( $this, 'end_import' ) );
		}
	}

	/**
	 * Filter the pixassist localized data and add the starterContent data to the themeMod
	 * @todo Is this filtering really needed?
	 *
	 * @param array $localized_data
	 *
	 * @return array
	 */
	public function localize_js_data( $localized_data ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content ) ) {
			$localized_data['themeMod']['starterContent'] = $starter_content;
		} elseif ( !isset( $localized_data['themeMod']['starterContent'] ) ) {
			$localized_data['themeMod']['starterContent'] = array();
		}

		return $localized_data;
	}

	/** RESTful methods */
	public function add_rest_routes_api() {
		register_rest_route( 'pixassist/v1', '/import', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_import_step' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'args' => array(
				'demo_key' => array( 'required' => true ),
				'type'     => array( 'required' => true ),
				'url'      => array( 'required' => true ),
				'args'     => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/import_starter', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_import_starter' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'demo_key'        => array( 'required' => false ),
				'url'             => array( 'required' => false ),
				'sources'         => array( 'required' => false ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/upload_media', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_upload_media' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'args'                => array(
				'demo_key'     => array( 'required' => true ),
				'file_data'     => array( 'required' => true ),
				'title'         => array( 'required' => true ),
				'group'         => array( 'required' => true ),
				'ext'           => array( 'required' => true ),
				'remote_id'     => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/reset_starter_content', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_reset_starter_content' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
		) );

			register_rest_route( 'pixassist/v1', '/import_unit', array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'rest_import_unit' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'demo_key'        => array( 'required' => true ),
				'url'             => array( 'required' => true ),
				'unit_type'       => array( 'required' => true ),
				'unit'            => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
				),
			) );

			register_rest_route( 'pixassist/v1', '/queue_unit', array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'rest_queue_unit' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false,
				'args'                => array(
					'demo_key'        => array( 'required' => true ),
					'url'             => array( 'required' => true ),
					'unit_type'       => array( 'required' => true ),
					'unit'            => array( 'required' => true ),
					'pixassist_nonce' => array( 'required' => true ),
				),
			) );

			register_rest_route( 'pixassist/v1', '/process_unit_job', array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'rest_process_unit_job' ),
				'permission_callback' => array( $this, 'permission_layout_unit_job_callback' ),
				'show_in_index'       => false,
				'args'                => array(
					'job_id' => array( 'required' => true ),
					'token'  => array( 'required' => true ),
				),
			) );

			register_rest_route( 'pixassist/v1', '/unit_job_status', array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'rest_unit_job_status' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false,
				'args'                => array(
					'job_id'          => array( 'required' => true ),
					'pixassist_nonce' => array( 'required' => true ),
				),
			) );

			register_rest_route( 'pixassist/v1', '/undo_unit', array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'rest_undo_unit' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'unit_type'       => array( 'required' => true ),
				'unit'            => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/layout_units', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_list_layout_units' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'demo_key'        => array( 'required' => true ),
				'url'             => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/prewarm_unit_bundles', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_prewarm_unit_bundles' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'demo_key'        => array( 'required' => true ),
				'url'             => array( 'required' => true ),
				'units'           => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/recipes', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_list_recipes' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/apply_recipe', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_apply_recipe' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'recipe_id'       => array( 'required' => true ),
				'url'             => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );

		register_rest_route( 'pixassist/v1', '/undo_recipe', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_undo_recipe' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false,
			'args'                => array(
				'recipe_id'       => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );
	}

	/**
	 * Return the layout units currently applied through the granular importer.
	 *
	 * @return array Applied layout units keyed by slot (`post_type:slug`).
	 */
	public function get_applied_layout_units() {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return array();
		}

		$applied = array();
		foreach ( $starter_content as $demo_key => $journal ) {
			if ( empty( $journal['layout_units'] ) || ! is_array( $journal['layout_units'] ) ) {
				continue;
			}

			foreach ( $journal['layout_units'] as $slot => $unit ) {
				if ( empty( $unit ) || ! is_array( $unit ) ) {
					continue;
				}

				$slot = $this->get_layout_unit_slot_key(
					isset( $unit['type'] ) ? $unit['type'] : '',
					isset( $unit['slug'] ) ? $unit['slug'] : ''
				);
				if ( empty( $slot ) ) {
					continue;
				}

				$unit['slot']    = $slot;
				$unit['demoKey'] = isset( $unit['demoKey'] ) ? sanitize_key( $unit['demoKey'] ) : sanitize_key( $demo_key );

				unset( $unit['journal'] );
				$applied[ $slot ] = $unit;
			}
		}

		return $applied;
	}

	/**
	 * Return recipe bundles currently tracked in the starter-content journal.
	 *
	 * A recipe can be partially deviated after apply: a user may replace its header through the
	 * Layouts tab, while the rest of the bundle still belongs to the recipe. Applied state is
	 * computed from the current per-unit state so undo can skip slots the user already replaced.
	 *
	 * @return array Applied recipe bundles keyed by bundle id.
	 */
	public function get_applied_recipes() {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return array();
		}

		$applied_units = $this->get_applied_layout_units();
		$recipes       = array();

		foreach ( $starter_content as $demo_key => $journal ) {
			if ( empty( $journal['recipe_bundles'] ) || ! is_array( $journal['recipe_bundles'] ) ) {
				continue;
			}

			foreach ( $journal['recipe_bundles'] as $bundle_id => $bundle ) {
				if ( empty( $bundle ) || ! is_array( $bundle ) ) {
					continue;
				}

				$units              = ! empty( $bundle['units'] ) && is_array( $bundle['units'] ) ? $bundle['units'] : array();
				$applied_unit_count = $this->count_current_recipe_units( $units, $applied_units );
				$total_unit_count   = count( $units );

				unset( $bundle['lookJournal'] );

				$bundle['bundleId']         = (string) $bundle_id;
				$bundle['demoKey']          = isset( $bundle['demoKey'] ) ? sanitize_key( $bundle['demoKey'] ) : sanitize_key( $demo_key );
				$bundle['unitCount']        = $total_unit_count;
				$bundle['appliedUnitCount'] = $applied_unit_count;
				$bundle['isApplied']        = 0 < $total_unit_count && $applied_unit_count === $total_unit_count;

				$recipes[ (string) $bundle_id ] = $bundle;
			}
		}

		return $recipes;
	}

	/**
	 * Handle the request to list source-as-recipe presets.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_list_recipes( $request ) {
		return rest_ensure_response( $this->list_recipes() );
	}

	/**
	 * List source-as-recipe presets backed by the available layout units.
	 *
	 * @param array $sources Optional source descriptors. Defaults to hub starter sources.
	 *
	 * @return array Response payload.
	 */
	public function list_recipes( $sources = array() ) {
		$sources = $this->get_recipe_sources( $sources );
		if ( empty( $sources ) ) {
			return array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'recipes' => array(),
					'failures' => array(),
					'applied' => $this->get_applied_recipes(),
				),
			);
		}

		$recipes  = array();
		$failures = array();

		foreach ( $sources as $source ) {
			$recipe = $this->build_recipe_from_source( $source );
			if ( is_wp_error( $recipe ) ) {
				$failures[] = array(
					'id'      => isset( $source['id'] ) ? sanitize_key( $source['id'] ) : '',
					'message' => $recipe->get_error_message(),
					'code'    => $recipe->get_error_code(),
				);
				continue;
			}

			if ( ! empty( $recipe['units'] ) ) {
				$recipes[] = $recipe;
			}
		}

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'recipes' => $recipes,
				'failures' => $failures,
				'applied' => $this->get_applied_recipes(),
			),
		);
	}

	/**
	 * Handle the request to apply a recipe bundle.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_apply_recipe( $request ) {
		$params = $request->get_params();

		if ( empty( $params['recipe_id'] ) || empty( $params['url'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->apply_recipe(
			sanitize_key( $params['recipe_id'] ),
			esc_url_raw( $params['url'] ),
			array(
				'include_look'   => isset( $params['include_look'] ) ? $this->sanitize_bool( $params['include_look'] ) : false,
				'include_sample' => isset( $params['include_sample'] ) ? $this->sanitize_bool( $params['include_sample'] ) : false,
			)
		) );
	}

	/**
	 * Apply a source recipe as one bundle over layout units.
	 *
	 * @param string $recipe_id Recipe/source id.
	 * @param string $base_url  Source SCE REST base URL.
	 * @param array  $options   Recipe options.
	 *
	 * @return array Response payload.
	 */
	public function apply_recipe( $recipe_id, $base_url, $options = array() ) {
		$recipe_id = sanitize_key( $recipe_id );
		$base_url  = trailingslashit( esc_url_raw( $base_url ) );
		$options   = is_array( $options ) ? $options : array();

		if ( empty( $recipe_id ) || empty( $base_url ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The recipe request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$recipe = $this->get_recipe_for_apply( $recipe_id, $base_url, $options );
		if ( is_wp_error( $recipe ) ) {
			return $this->layout_unit_error_response( $recipe );
		}

		if ( empty( $recipe['units'] ) || ! is_array( $recipe['units'] ) ) {
			return array(
				'code'    => 'recipe_empty',
				'message' => esc_html__( 'The recipe does not contain any layout units.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$include_sample = ! empty( $options['include_sample'] );
		$include_look   = ! empty( $options['include_look'] );
		$applied_slots  = array();

		foreach ( $recipe['units'] as $slot => $unit ) {
			if ( empty( $unit['type'] ) || empty( $unit['slug'] ) ) {
				continue;
			}

			$unit_options = array();
			if ( 'feature' === $unit['type'] ) {
				$unit_options['include_sample'] = $include_sample;
			}

			$import = $this->import_layout_unit(
				$recipe_id,
				$base_url,
				$unit['type'],
				$unit['slug'],
				$unit_options
			);

			if ( empty( $import['code'] ) || 'success' !== $import['code'] ) {
				$this->rollback_recipe_apply_units( $recipe_id, $applied_slots );

				if ( is_array( $import ) ) {
					$import['data']['appliedRecipes'] = $this->get_applied_recipes();
				}

				return $import;
			}

			$applied_slots[] = $slot;
		}

		$look_journal = array();
		if ( $include_look ) {
			$look = $this->import_recipe_look( $recipe_id, $base_url );
			if ( is_wp_error( $look ) ) {
				$this->rollback_recipe_apply_units( $recipe_id, $applied_slots );

				return $this->layout_unit_error_response( $look );
			}

			$look_journal = ! empty( $look['journal'] ) && is_array( $look['journal'] ) ? $look['journal'] : array();
		}

		$this->record_applied_recipe_bundle(
			$recipe,
			array(
				'include_sample' => $include_sample,
				'include_look'   => $include_look,
			),
			$look_journal
		);

		$applied_recipes = $this->get_applied_recipes();

		return array(
			'code'    => 'success',
			'message' => esc_html__( 'Recipe applied.', '__plugin_txtd' ),
			'data'    => array(
				'recipe'         => isset( $applied_recipes[ $this->get_recipe_bundle_id( $recipe_id ) ] ) ? $applied_recipes[ $this->get_recipe_bundle_id( $recipe_id ) ] : array(),
				'appliedUnits'   => $this->get_applied_layout_units(),
				'appliedRecipes' => $applied_recipes,
			),
		);
	}

	/**
	 * Handle the request to undo a recipe bundle.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_undo_recipe( $request ) {
		$params = $request->get_params();

		if ( empty( $params['recipe_id'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->undo_recipe( sanitize_key( $params['recipe_id'] ) ) );
	}

	/**
	 * Undo the current units that still belong to a recipe bundle.
	 *
	 * @param string $recipe_id Recipe/source id.
	 *
	 * @return array Response payload.
	 */
	public function undo_recipe( $recipe_id ) {
		$recipe_id = sanitize_key( $recipe_id );
		$entry     = $this->get_recipe_bundle_entry( $recipe_id );

		if ( empty( $entry ) ) {
			return array(
				'code'    => 'recipe_not_found',
				'message' => esc_html__( 'The requested recipe is not applied.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$bundle        = $entry['bundle'];
		$bundle_id     = $entry['bundle_id'];
		$current_units = $this->get_applied_layout_units();
		$summary       = array(
			'units'               => 0,
			'units_skipped'       => 0,
			'options_restored'    => 0,
			'theme_mods_restored' => 0,
		);

		$units = ! empty( $bundle['units'] ) && is_array( $bundle['units'] ) ? $bundle['units'] : array();
		foreach ( $units as $slot => $unit ) {
			if ( empty( $current_units[ $slot ] ) || ! $this->recipe_unit_matches_current( $unit, $current_units[ $slot ] ) ) {
				$summary['units_skipped']++;
				continue;
			}

			$undo = $this->undo_layout_unit( $unit['type'], $unit['slug'] );
			if ( empty( $undo['code'] ) || 'success' !== $undo['code'] ) {
				return $undo;
			}

			$summary['units']++;
			$current_units = $this->get_applied_layout_units();
		}

		if ( ! empty( $bundle['lookJournal'] ) && is_array( $bundle['lookJournal'] ) ) {
			$restored_options = array();
			$restored_mods    = array();

			$this->reset_layout_unit_settings( $bundle['lookJournal'], array(), $restored_options, $restored_mods );

			$summary['options_restored']    = count( $restored_options );
			$summary['theme_mods_restored'] = count( $restored_mods );
		}

		$this->remove_recipe_bundle_from_starter_content( $bundle_id, $bundle );
		$this->regenerate_style_manager_after_import();

		return array(
			'code'    => 'success',
			'message' => esc_html__( 'Recipe removed.', '__plugin_txtd' ),
			'data'    => array(
				'summary'        => $summary,
				'appliedUnits'   => $this->get_applied_layout_units(),
				'appliedRecipes' => $this->get_applied_recipes(),
			),
		);
	}

	/**
	 * Collect recipe sources from the hub starter surface.
	 *
	 * @param array $sources Optional source descriptors.
	 *
	 * @return array[]
	 */
	private function get_recipe_sources( $sources = array() ) {
		if ( empty( $sources ) ) {
			if ( function_exists( 'pixassist_get_layout_units_sources' ) ) {
				$sources = pixassist_get_layout_units_sources();
			} elseif ( function_exists( 'pixassist_get_admin_hub_starters' ) ) {
				$sources = pixassist_get_admin_hub_starters();
			}
		}

		$normalized = array();
		foreach ( (array) $sources as $source ) {
			$source = $this->normalize_recipe_source( $source );
			if ( empty( $source ) ) {
				continue;
			}

			$normalized[] = $source;
		}

		return $normalized;
	}

	/**
	 * Normalize a source descriptor for recipe use.
	 *
	 * @param array $source Source descriptor.
	 *
	 * @return array
	 */
	private function normalize_recipe_source( $source ) {
		if ( empty( $source ) || ! is_array( $source ) ) {
			return array();
		}

		$id       = ! empty( $source['id'] ) ? sanitize_key( $source['id'] ) : '';
		$base_url = '';
		foreach ( array( 'baseRestUrl', 'url' ) as $key ) {
			if ( ! empty( $source[ $key ] ) ) {
				$base_url = trailingslashit( esc_url_raw( $source[ $key ] ) );
				break;
			}
		}

		if ( empty( $id ) || empty( $base_url ) ) {
			return array();
		}

		return array(
			'id'          => $id,
			'title'       => ! empty( $source['title'] ) ? wp_strip_all_tags( $source['title'] ) : $id,
			'description' => ! empty( $source['description'] ) ? wp_strip_all_tags( $source['description'] ) : '',
			'baseRestUrl' => $base_url,
			'image'       => ! empty( $source['image'] ) ? esc_url_raw( $source['image'] ) : '',
			'previewUrl'  => ! empty( $source['previewUrl'] ) ? esc_url_raw( $source['previewUrl'] ) : '',
			'badge'       => ! empty( $source['badge'] ) ? wp_strip_all_tags( $source['badge'] ) : '',
			'gate'        => ! empty( $source['gate'] ) ? sanitize_key( $source['gate'] ) : '',
		);
	}

	/**
	 * Build one recipe descriptor from a source.
	 *
	 * @param array $source Source descriptor.
	 *
	 * @return array|WP_Error Recipe descriptor.
	 */
	private function build_recipe_from_source( $source ) {
		$source = $this->normalize_recipe_source( $source );
		if ( empty( $source ) ) {
			return new WP_Error( 'invalid_recipe_source', esc_html__( 'The recipe source is invalid.', '__plugin_txtd' ) );
		}

		$units_response = $this->list_layout_units( $source['id'], $source['baseRestUrl'] );
		if ( empty( $units_response['code'] ) || 'success' !== $units_response['code'] ) {
			return new WP_Error(
				! empty( $units_response['code'] ) ? $units_response['code'] : 'recipe_units_unavailable',
				! empty( $units_response['message'] ) ? $units_response['message'] : esc_html__( 'The recipe units could not be loaded.', '__plugin_txtd' ),
				! empty( $units_response['data'] ) && is_array( $units_response['data'] ) ? $units_response['data'] : array()
			);
		}

		$units = $this->normalize_recipe_units( isset( $units_response['data']['units'] ) ? $units_response['data']['units'] : array() );

		return array(
			'id'          => $source['id'],
			'title'       => $source['title'],
			'description' => $source['description'],
			'baseRestUrl' => $source['baseRestUrl'],
			'image'       => $source['image'],
			'previewUrl'  => $source['previewUrl'],
			'badge'       => $source['badge'],
			'gate'        => $source['gate'],
			'units'       => $units,
			'unitCount'   => count( $units ),
			'groups'      => $this->count_recipe_unit_groups( $units ),
			'supports'    => array(
				'look'   => true,
				'sample' => $this->recipe_units_have_sample( $units ),
			),
			'defaults'    => array(
				'includeLook'   => false,
				'includeSample' => false,
			),
		);
	}

	/**
	 * Normalize and sort recipe units.
	 *
	 * @param array $units Raw layout-unit descriptors.
	 *
	 * @return array Units keyed by slot.
	 */
	private function normalize_recipe_units( $units ) {
		$normalized = array();

		foreach ( (array) $units as $unit ) {
			if ( empty( $unit['type'] ) || empty( $unit['slug'] ) ) {
				continue;
			}

			$type = sanitize_key( $unit['type'] );
			$slug = sanitize_key( $unit['slug'] );
			$slot = $this->get_layout_unit_slot_key( $type, $slug );
			if ( empty( $slot ) ) {
				continue;
			}

			$normalized[ $slot ] = array(
				'id'            => isset( $unit['id'] ) ? $unit['id'] : $slug,
				'type'          => $type,
				'slug'          => $slug,
				'title'         => ! empty( $unit['title'] ) ? wp_strip_all_tags( $unit['title'] ) : $slug,
				'sampleDefault' => ! empty( $unit['sampleDefault'] ),
				'sampleCount'   => isset( $unit['sampleCount'] ) ? absint( $unit['sampleCount'] ) : 0,
			);
		}

		uasort( $normalized, array( $this, 'sort_recipe_units' ) );

		return $normalized;
	}

	/**
	 * Sort recipe units in apply order.
	 *
	 * @param array $a First unit.
	 * @param array $b Second unit.
	 *
	 * @return int
	 */
	private function sort_recipe_units( $a, $b ) {
		$order_a = $this->get_recipe_unit_order( $a );
		$order_b = $this->get_recipe_unit_order( $b );

		if ( $order_a === $order_b ) {
			return strcmp( isset( $a['slug'] ) ? $a['slug'] : '', isset( $b['slug'] ) ? $b['slug'] : '' );
		}

		return $order_a < $order_b ? -1 : 1;
	}

	/**
	 * Return an ordering weight for applying recipe units.
	 *
	 * @param array $unit Unit descriptor.
	 *
	 * @return int
	 */
	private function get_recipe_unit_order( $unit ) {
		$type = isset( $unit['type'] ) ? sanitize_key( $unit['type'] ) : '';
		$slug = isset( $unit['slug'] ) ? sanitize_key( $unit['slug'] ) : '';

		if ( 'wp_template_part' === $type ) {
			if ( 'header' === $slug ) {
				return 10;
			}
			if ( 'footer' === $slug ) {
				return 20;
			}

			return 30;
		}

		if ( 'wp_template' === $type ) {
			return 100;
		}

		if ( 'feature' === $type ) {
			return 200;
		}

		return 999;
	}

	/**
	 * Count unit groups for recipe display.
	 *
	 * @param array $units Recipe units.
	 *
	 * @return array
	 */
	private function count_recipe_unit_groups( $units ) {
		$groups = array(
			'parts'     => 0,
			'templates' => 0,
			'features'  => 0,
		);

		foreach ( (array) $units as $unit ) {
			if ( empty( $unit['type'] ) ) {
				continue;
			}

			if ( 'wp_template_part' === $unit['type'] ) {
				$groups['parts']++;
			} elseif ( 'wp_template' === $unit['type'] ) {
				$groups['templates']++;
			} elseif ( 'feature' === $unit['type'] ) {
				$groups['features']++;
			}
		}

		return $groups;
	}

	/**
	 * Whether recipe units can import sample content.
	 *
	 * @param array $units Recipe units.
	 *
	 * @return bool
	 */
	private function recipe_units_have_sample( $units ) {
		foreach ( (array) $units as $unit ) {
			if ( 'feature' === $unit['type'] && ( ! empty( $unit['sampleDefault'] ) || ! empty( $unit['sampleCount'] ) ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolve the recipe descriptor used by apply_recipe().
	 *
	 * @param string $recipe_id Recipe/source id.
	 * @param string $base_url  Source SCE REST base URL.
	 * @param array  $options   Apply options.
	 *
	 * @return array|WP_Error
	 */
	private function get_recipe_for_apply( $recipe_id, $base_url, $options ) {
		$sources = ! empty( $options['sources'] ) && is_array( $options['sources'] )
			? $this->get_recipe_sources( $options['sources'] )
			: $this->get_recipe_sources();

		$source = array();
		foreach ( $sources as $candidate ) {
			if ( ! empty( $candidate['id'] ) && $candidate['id'] === $recipe_id ) {
				$source = $candidate;
				break;
			}
		}

		if ( empty( $source ) ) {
			$source = array(
				'id'          => $recipe_id,
				'title'       => $this->get_layout_unit_source_title( $recipe_id ),
				'baseRestUrl' => $base_url,
			);
		}

		$source['baseRestUrl'] = $base_url;

		return $this->build_recipe_from_source( $source );
	}

	/**
	 * Roll back units applied before a recipe import failed.
	 *
	 * @param string $demo_key      Recipe/source id.
	 * @param array  $applied_slots Applied slots.
	 */
	private function rollback_recipe_apply_units( $demo_key, $applied_slots ) {
		$current_units = $this->get_applied_layout_units();

		for ( $i = count( $applied_slots ) - 1; $i >= 0; $i-- ) {
			$slot = $applied_slots[ $i ];
			if ( empty( $current_units[ $slot ] ) || empty( $current_units[ $slot ]['type'] ) || empty( $current_units[ $slot ]['slug'] ) ) {
				continue;
			}

			if ( empty( $current_units[ $slot ]['demoKey'] ) || sanitize_key( $current_units[ $slot ]['demoKey'] ) !== $demo_key ) {
				continue;
			}

			$this->undo_layout_unit( $current_units[ $slot ]['type'], $current_units[ $slot ]['slug'] );
			$current_units = $this->get_applied_layout_units();
		}
	}

	/**
	 * Import source look settings for a recipe.
	 *
	 * @param string $demo_key Recipe/source id.
	 * @param string $base_url Source SCE REST base URL.
	 *
	 * @return array|WP_Error
	 */
	private function import_recipe_look( $demo_key, $base_url ) {
		$source_data = $this->fetch_layout_source_data( $base_url );
		if ( is_wp_error( $source_data ) ) {
			return $source_data;
		}

		$look_settings = $this->extract_recipe_look_settings( $source_data );
		if ( empty( $look_settings ) ) {
			return array(
				'applied' => false,
				'journal' => array(),
			);
		}

		$starter_content_before = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content_before ) ) {
			$starter_content_before = array();
		}
		$before_journal = isset( $starter_content_before[ $demo_key ] ) && is_array( $starter_content_before[ $demo_key ] )
			? $starter_content_before[ $demo_key ]
			: array();

		foreach ( $look_settings as $type => $settings ) {
			$result = $this->import_settings( $demo_key, $type, $settings, false );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		$starter_content_after = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		$after_journal = isset( $starter_content_after[ $demo_key ] ) && is_array( $starter_content_after[ $demo_key ] )
			? $starter_content_after[ $demo_key ]
			: array();

		return array(
			'applied' => true,
			'journal' => $this->get_layout_unit_journal_delta( $before_journal, $after_journal ),
		);
	}

	/**
	 * Extract optional look settings from a source `/data` payload.
	 *
	 * @param array $source_data Source `/data` payload.
	 *
	 * @return array
	 */
	private function extract_recipe_look_settings( $source_data ) {
		$look = array();

		foreach ( array( 'pre' => 'pre_settings', 'post' => 'post_settings' ) as $type => $settings_key ) {
			if ( empty( $source_data[ $settings_key ] ) || ! is_array( $source_data[ $settings_key ] ) ) {
				continue;
			}

			foreach ( array( 'options', 'mods' ) as $group ) {
				if ( empty( $source_data[ $settings_key ][ $group ] ) || ! is_array( $source_data[ $settings_key ][ $group ] ) ) {
					continue;
				}

				foreach ( $source_data[ $settings_key ][ $group ] as $key => $value ) {
					if ( ! $this->is_recipe_look_setting_key( $key, $group ) ) {
						continue;
					}

					if ( empty( $look[ $type ] ) ) {
						$look[ $type ] = array();
					}
					if ( empty( $look[ $type ][ $group ] ) ) {
						$look[ $type ][ $group ] = array();
					}

					$look[ $type ][ $group ][ $key ] = $value;
				}
			}
		}

		return $look;
	}

	/**
	 * Whether a source setting belongs to the optional visual look.
	 *
	 * @param string $key   Setting key.
	 * @param string $group Setting group.
	 *
	 * @return bool
	 */
	private function is_recipe_look_setting_key( $key, $group ) {
		$key = (string) $key;

		if ( 'options' === $group ) {
			return 0 === strpos( $key, 'sm_' )
				|| 0 === strpos( $key, 'style_manager_' )
				|| 0 === strpos( $key, 'pixelgrade_style_manager' )
				|| false !== strpos( $key, 'customify_style' );
		}

		return false !== strpos( $key, 'font' )
			|| false !== strpos( $key, 'color' )
			|| false !== strpos( $key, 'palette' )
			|| false !== strpos( $key, 'typography' );
	}

	/**
	 * Persist the applied recipe bundle metadata.
	 *
	 * @param array $recipe       Recipe descriptor.
	 * @param array $options      Applied options.
	 * @param array $look_journal Optional look journal.
	 */
	private function record_applied_recipe_bundle( $recipe, $options, $look_journal = array() ) {
		if ( empty( $recipe['id'] ) || empty( $recipe['units'] ) || ! is_array( $recipe['units'] ) ) {
			return;
		}

		$demo_key       = sanitize_key( $recipe['id'] );
		$bundle_id      = $this->get_recipe_bundle_id( $demo_key );
		$current_units  = $this->get_applied_layout_units();
		$bundle_units   = array();

		foreach ( $recipe['units'] as $slot => $unit ) {
			if ( empty( $current_units[ $slot ] ) || ! $this->recipe_unit_matches_current( array_merge( $unit, array( 'demoKey' => $demo_key ) ), $current_units[ $slot ] ) ) {
				continue;
			}

			$current = $current_units[ $slot ];
			unset( $current['journal'] );

			$bundle_units[ $slot ] = array(
				'type'      => sanitize_key( $current['type'] ),
				'slug'      => sanitize_key( $current['slug'] ),
				'title'     => ! empty( $current['title'] ) ? wp_strip_all_tags( $current['title'] ) : sanitize_key( $current['slug'] ),
				'demoKey'   => $demo_key,
				'sourceId'  => isset( $current['sourceId'] ) ? absint( $current['sourceId'] ) : ( isset( $unit['id'] ) ? $unit['id'] : 0 ),
				'localId'   => isset( $current['localId'] ) ? absint( $current['localId'] ) : 0,
			);
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) || ! is_array( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( empty( $starter_content[ $demo_key ]['recipe_bundles'] ) || ! is_array( $starter_content[ $demo_key ]['recipe_bundles'] ) ) {
			$starter_content[ $demo_key ]['recipe_bundles'] = array();
		}

		$starter_content[ $demo_key ]['recipe_bundles'][ $bundle_id ] = array(
			'id'            => $demo_key,
			'bundleId'      => $bundle_id,
			'title'         => ! empty( $recipe['title'] ) ? wp_strip_all_tags( $recipe['title'] ) : $demo_key,
			'demoKey'       => $demo_key,
			'sourceTitle'   => ! empty( $recipe['title'] ) ? wp_strip_all_tags( $recipe['title'] ) : $demo_key,
			'baseRestUrl'   => ! empty( $recipe['baseRestUrl'] ) ? esc_url_raw( $recipe['baseRestUrl'] ) : '',
			'image'         => ! empty( $recipe['image'] ) ? esc_url_raw( $recipe['image'] ) : '',
			'includeSample' => ! empty( $options['include_sample'] ),
			'includeLook'   => ! empty( $options['include_look'] ),
			'units'         => $bundle_units,
			'lookJournal'   => is_array( $look_journal ) ? $look_journal : array(),
			'appliedAt'     => time(),
		);

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();
	}

	/**
	 * Return a stable bundle id for a recipe.
	 *
	 * @param string $recipe_id Recipe/source id.
	 *
	 * @return string
	 */
	private function get_recipe_bundle_id( $recipe_id ) {
		return 'recipe:' . sanitize_key( $recipe_id );
	}

	/**
	 * Find one recipe bundle by recipe id or bundle id.
	 *
	 * @param string $recipe_id Recipe/source id or bundle id.
	 *
	 * @return array|null
	 */
	private function get_recipe_bundle_entry( $recipe_id ) {
		$raw_recipe_id = (string) $recipe_id;
		$recipe_id     = sanitize_key( $recipe_id );
		$bundle_id     = 0 === strpos( $raw_recipe_id, 'recipe:' )
			? $this->get_recipe_bundle_id( substr( $raw_recipe_id, strlen( 'recipe:' ) ) )
			: $this->get_recipe_bundle_id( $recipe_id );

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return null;
		}

		foreach ( $starter_content as $demo_key => $journal ) {
			if ( empty( $journal['recipe_bundles'][ $bundle_id ] ) || ! is_array( $journal['recipe_bundles'][ $bundle_id ] ) ) {
				continue;
			}

			return array(
				'demo_key'  => sanitize_key( $demo_key ),
				'bundle_id' => $bundle_id,
				'bundle'    => $journal['recipe_bundles'][ $bundle_id ],
			);
		}

		return null;
	}

	/**
	 * Count current units that still match a recipe bundle.
	 *
	 * @param array $recipe_units  Recipe-bundle units.
	 * @param array $current_units Current applied layout units.
	 *
	 * @return int
	 */
	private function count_current_recipe_units( $recipe_units, $current_units ) {
		$count = 0;

		foreach ( (array) $recipe_units as $slot => $unit ) {
			if ( ! empty( $current_units[ $slot ] ) && $this->recipe_unit_matches_current( $unit, $current_units[ $slot ] ) ) {
				$count++;
			}
		}

		return $count;
	}

	/**
	 * Whether a current unit is still the unit recorded by a recipe bundle.
	 *
	 * @param array $bundle_unit Bundle unit.
	 * @param array $current     Current applied unit.
	 *
	 * @return bool
	 */
	private function recipe_unit_matches_current( $bundle_unit, $current ) {
		foreach ( array( 'type', 'slug', 'demoKey' ) as $key ) {
			if ( empty( $bundle_unit[ $key ] ) || empty( $current[ $key ] ) ) {
				return false;
			}

			if ( sanitize_key( $bundle_unit[ $key ] ) !== sanitize_key( $current[ $key ] ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Remove a recipe bundle from the aggregate starter-content journal.
	 *
	 * @param string $bundle_id Removed bundle id.
	 * @param array  $bundle    Removed bundle data.
	 */
	private function remove_recipe_bundle_from_starter_content( $bundle_id, $bundle ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return;
		}

		foreach ( $starter_content as $demo_key => &$journal ) {
			if ( empty( $journal['recipe_bundles'][ $bundle_id ] ) ) {
				continue;
			}

			unset( $journal['recipe_bundles'][ $bundle_id ] );

			if ( ! empty( $bundle['lookJournal'] ) && is_array( $bundle['lookJournal'] ) ) {
				$this->remove_recipe_look_journal_from_aggregate( $starter_content, $bundle_id, $journal, $bundle['lookJournal'] );
			}

			$this->prune_empty_layout_journal( $journal );
			if ( empty( $journal ) ) {
				unset( $starter_content[ $demo_key ] );
			}

			break;
		}
		unset( $journal );

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();
	}

	/**
	 * Remove look settings owned only by the removed recipe bundle.
	 *
	 * @param array  $starter_content Full starter-content journal.
	 * @param string $bundle_id       Removed bundle id.
	 * @param array  $journal         Source journal, by reference.
	 * @param array  $look_journal    Look journal.
	 */
	private function remove_recipe_look_journal_from_aggregate( $starter_content, $bundle_id, &$journal, $look_journal ) {
		foreach ( array( 'pre_settings', 'post_settings' ) as $settings_key ) {
			foreach ( array( 'options', 'mods' ) as $group ) {
				if ( empty( $look_journal[ $settings_key ][ $group ] ) || ! is_array( $look_journal[ $settings_key ][ $group ] ) ) {
					continue;
				}

				foreach ( $look_journal[ $settings_key ][ $group ] as $key => $value ) {
					if ( $this->recipe_look_setting_used_by_other( $starter_content, $bundle_id, $settings_key, $group, $key ) ) {
						continue;
					}

					if ( isset( $journal[ $settings_key ][ $group ][ $key ] ) ) {
						unset( $journal[ $settings_key ][ $group ][ $key ] );
					}
				}
			}
		}
	}

	/**
	 * Whether another unit or recipe still owns one look setting.
	 *
	 * @param array  $starter_content Full starter-content journal.
	 * @param string $bundle_id       Removed bundle id.
	 * @param string $settings_key    Settings key.
	 * @param string $group           Settings group.
	 * @param string $key             Setting key.
	 *
	 * @return bool
	 */
	private function recipe_look_setting_used_by_other( $starter_content, $bundle_id, $settings_key, $group, $key ) {
		if ( $this->layout_unit_setting_used_by_other( $starter_content, '', $settings_key, $group, $key ) ) {
			return true;
		}

		foreach ( (array) $starter_content as $journal ) {
			if ( empty( $journal['recipe_bundles'] ) || ! is_array( $journal['recipe_bundles'] ) ) {
				continue;
			}

			foreach ( $journal['recipe_bundles'] as $other_bundle_id => $bundle ) {
				if ( $other_bundle_id === $bundle_id ) {
					continue;
				}

				if ( isset( $bundle['lookJournal'][ $settings_key ][ $group ][ $key ] ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Handle the request to list importable layout units for a source.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_list_layout_units( $request ) {
		$params = $request->get_params();

		if ( ! empty( $params['sources'] ) && is_array( $params['sources'] ) ) {
			return rest_ensure_response( $this->list_layout_units_for_sources( $params['sources'] ) );
		}

		if ( empty( $params['demo_key'] ) || empty( $params['url'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->list_layout_units(
			sanitize_key( $params['demo_key'] ),
			esc_url_raw( $params['url'] )
		) );
	}

	/**
	 * List layout units for multiple sources in one local REST request.
	 *
	 * @param array $sources Source descriptors.
	 *
	 * @return array Response payload.
	 */
	public function list_layout_units_for_sources( $sources ) {
		$results = array();

		foreach ( (array) $sources as $source ) {
			if ( empty( $source ) || ! is_array( $source ) ) {
				continue;
			}

			$demo_key = ! empty( $source['demo_key'] ) ? sanitize_key( $source['demo_key'] ) : ( ! empty( $source['id'] ) ? sanitize_key( $source['id'] ) : '' );
			$base_url = ! empty( $source['url'] ) ? esc_url_raw( $source['url'] ) : ( ! empty( $source['baseRestUrl'] ) ? esc_url_raw( $source['baseRestUrl'] ) : '' );

			if ( empty( $demo_key ) || empty( $base_url ) ) {
				$results[] = array(
					'id'      => $demo_key,
					'code'    => 'invalid_params',
					'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
					'units'   => array(),
				);
				continue;
			}

			$response = $this->list_layout_units( $demo_key, $base_url );
			$results[] = array(
				'id'      => $demo_key,
				'code'    => isset( $response['code'] ) ? $response['code'] : 'error',
				'message' => isset( $response['message'] ) ? $response['message'] : '',
				'units'   => ! empty( $response['data']['units'] ) && is_array( $response['data']['units'] ) ? $response['data']['units'] : array(),
			);
		}

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'sources' => $results,
			),
		);
	}

	/**
	 * List source layout units supported by the granular importer.
	 *
	 * @param string $demo_key Starter/demo key.
	 * @param string $base_url Source SCE REST base URL.
	 *
	 * @return array Response payload.
	 */
	public function list_layout_units( $demo_key, $base_url ) {
		$demo_key = sanitize_key( $demo_key );
		$base_url = trailingslashit( esc_url_raw( $base_url ) );

		if ( empty( $demo_key ) || empty( $base_url ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		if ( ! $this->is_allowed_demo_url( $base_url ) ) {
			return array(
				'code'    => 'invalid_source',
				'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$source_units = $this->fetch_layout_source_unit_list( $base_url );
		if ( ! is_wp_error( $source_units ) ) {
			return array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'units' => $source_units,
				),
			);
		}

		$units = array();
		$posts_by_type = array();
		foreach ( array( 'wp_template_part', 'wp_template' ) as $post_type ) {
			$posts = $this->fetch_layout_source_posts( $base_url, $post_type );
			if ( is_wp_error( $posts ) ) {
				return $this->layout_unit_error_response( $posts );
			}

			$posts_by_type[ $post_type ] = $posts;

			foreach ( $posts as $post ) {
				if ( empty( $post['ID'] ) || empty( $post['post_name'] ) ) {
					continue;
				}

				$units[] = array(
					'id'    => absint( $post['ID'] ),
					'type'  => $post_type,
					'slug'  => sanitize_key( $post['post_name'] ),
					'title' => ! empty( $post['post_title'] ) ? wp_strip_all_tags( $post['post_title'] ) : sanitize_key( $post['post_name'] ),
				);
			}
		}

			$source_data = $this->fetch_layout_source_data( $base_url );
			if ( ! is_wp_error( $source_data ) ) {
				$units = array_merge( $units, $this->list_layout_feature_units( $source_data, $posts_by_type ) );
			}

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'units' => $units,
			),
		);
	}

	/**
	 * Handle the request to prewarm import-ready layout-unit bundles for a source.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_prewarm_unit_bundles( $request ) {
		$params = $request->get_params();

		if ( empty( $params['demo_key'] ) || empty( $params['url'] ) || empty( $params['units'] ) || ! is_array( $params['units'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->prewarm_layout_unit_bundles(
			sanitize_key( $params['demo_key'] ),
			esc_url_raw( $params['url'] ),
			$params['units']
		) );
	}

	/**
	 * Fetch source-side import-ready layout bundles and prime the local source cache.
	 *
	 * The endpoint is an optimization only. If the source does not expose it, Apply still falls back to
	 * the existing dynamic discovery path during import.
	 *
	 * @param string $demo_key Starter/demo key.
	 * @param string $base_url Source SCE REST base URL.
	 * @param array  $units    Layout units to prewarm.
	 *
	 * @return array Response payload.
	 */
	public function prewarm_layout_unit_bundles( $demo_key, $base_url, $units ) {
		$demo_key = sanitize_key( $demo_key );
		$base_url = trailingslashit( esc_url_raw( $base_url ) );
		$units    = $this->normalize_layout_bundle_units( $units );

		if ( empty( $demo_key ) || empty( $base_url ) || empty( $units ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The layout bundle request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		if ( ! $this->is_allowed_demo_url( $base_url ) ) {
			return array(
				'code'    => 'invalid_source',
				'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$bundle_data = $this->fetch_layout_unit_bundles( $base_url, $units );
		if ( is_wp_error( $bundle_data ) ) {
			return array(
				'code'    => 'bundle_unavailable',
				'message' => esc_html__( 'The layout bundle endpoint is not available.', '__plugin_txtd' ),
				'data'    => array(
					'error' => method_exists( $bundle_data, 'get_error_code' ) ? $bundle_data->get_error_code() : '',
				),
			);
		}

		$cached = 0;
		$bundles = isset( $bundle_data['bundles'] ) && is_array( $bundle_data['bundles'] ) ? $bundle_data['bundles'] : array();
		foreach ( $bundles as $bundle ) {
			if ( $this->prime_layout_unit_bundle_cache( $base_url, $bundle ) ) {
				$cached++;
			}
		}

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'bundles' => $cached,
				'hash'    => isset( $bundle_data['hash'] ) ? sanitize_text_field( $bundle_data['hash'] ) : '',
				'version' => isset( $bundle_data['version'] ) ? sanitize_text_field( $bundle_data['version'] ) : '',
			),
		);
	}

	/**
	 * List feature units a source can provide.
	 *
	 * @param array $source_data   Source `/data` payload.
	 * @param array $posts_by_type Source posts keyed by post type.
	 *
	 * @return array
	 */
	private function list_layout_feature_units( $source_data, $posts_by_type ) {
		$units = array();

		foreach ( $this->get_layout_feature_definitions() as $feature_slug => $feature ) {
			$post_type = isset( $feature['post_type'] ) ? sanitize_key( $feature['post_type'] ) : '';
			if ( empty( $post_type ) || empty( $source_data['post_types'][ $post_type ]['ids'] ) ) {
				continue;
			}

			$template_slugs = $this->get_source_post_slugs( isset( $posts_by_type['wp_template'] ) ? $posts_by_type['wp_template'] : array() );
			$required_template = isset( $feature['required_template'] ) ? sanitize_key( $feature['required_template'] ) : '';
			if ( empty( $required_template ) || ! in_array( $required_template, $template_slugs, true ) ) {
				continue;
			}

			$units[] = array(
				'id'            => $feature_slug,
				'type'          => 'feature',
				'slug'          => $feature_slug,
				'title'         => isset( $feature['title'] ) ? wp_strip_all_tags( $feature['title'] ) : $feature_slug,
				'sampleDefault' => ! empty( $feature['sample_default'] ),
				'sampleCount'   => min( absint( isset( $feature['sample_count'] ) ? $feature['sample_count'] : 0 ), count( (array) $source_data['post_types'][ $post_type ]['ids'] ) ),
			);
		}

		return $units;
	}

	/**
	 * Return configured feature units.
	 *
	 * @return array
	 */
	private function get_layout_feature_definitions() {
		$features = array(
			'portfolio' => array(
				'title'             => esc_html__( 'Portfolio', '__plugin_txtd' ),
				'post_type'         => 'portfolio',
				'required_template' => 'archive-portfolio',
				'template_slugs'    => array( 'archive-portfolio', 'single-portfolio', 'taxonomy-portfolio_type' ),
				'taxonomies'        => array( 'portfolio_type' ),
				'sample_default'    => true,
				'sample_count'      => 3,
			),
		);

		return apply_filters( 'pixassist_layout_feature_units', $features );
	}

	/**
	 * Extract sanitized source post slugs.
	 *
	 * @param array $posts Source posts.
	 *
	 * @return array
	 */
	private function get_source_post_slugs( $posts ) {
		$slugs = array();

		foreach ( (array) $posts as $post ) {
			if ( empty( $post['post_name'] ) ) {
				continue;
			}

			$slugs[] = sanitize_key( $post['post_name'] );
		}

		return array_values( array_unique( $slugs ) );
	}

	/**
	 * Sanitize a loose boolean request value.
	 *
	 * @param mixed $value Value to sanitize.
	 *
	 * @return bool
	 */
	private function sanitize_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}

		return in_array( strtolower( (string) $value ), array( '1', 'true', 'yes', 'on' ), true );
	}

	/**
	 * Resolve source template IDs required by a feature.
	 *
	 * @param array $feature         Feature definition.
	 * @param array $source_templates Source template posts.
	 *
	 * @return array
	 */
	private function get_feature_template_source_ids( $feature, $source_templates ) {
		$wanted = isset( $feature['template_slugs'] ) && is_array( $feature['template_slugs'] )
			? array_map( 'sanitize_key', $feature['template_slugs'] )
			: array();
		$required = isset( $feature['required_template'] ) ? sanitize_key( $feature['required_template'] ) : '';
		$ids      = array();
		$found    = array();

		foreach ( (array) $source_templates as $post ) {
			if ( empty( $post['ID'] ) || empty( $post['post_name'] ) ) {
				continue;
			}

			$slug = sanitize_key( $post['post_name'] );
			if ( ! in_array( $slug, $wanted, true ) ) {
				continue;
			}

			$ids[]   = absint( $post['ID'] );
			$found[] = $slug;
		}

		if ( empty( $required ) || ! in_array( $required, $found, true ) ) {
			return array();
		}

		return array_values( array_unique( array_filter( $ids ) ) );
	}

	/**
	 * Resolve source taxonomy IDs a feature sample needs.
	 *
	 * @param array $feature     Feature definition.
	 * @param array $source_data Source `/data` payload.
	 *
	 * @return array
	 */
	private function get_feature_source_taxonomy_ids( $feature, $source_data ) {
		$taxonomies = isset( $feature['taxonomies'] ) && is_array( $feature['taxonomies'] )
			? array_map( 'sanitize_key', $feature['taxonomies'] )
			: array();
		$ids = array();

		foreach ( $taxonomies as $taxonomy ) {
			if ( empty( $source_data['taxonomies'][ $taxonomy ]['ids'] ) || ! is_array( $source_data['taxonomies'][ $taxonomy ]['ids'] ) ) {
				continue;
			}

			$ids[ $taxonomy ] = array_values( array_filter( array_map( 'absint', $source_data['taxonomies'][ $taxonomy ]['ids'] ) ) );
		}

		return $ids;
	}

	/**
	 * Import featured images referenced by sample posts before post import remaps `_thumbnail_id`.
	 *
	 * @param string $demo_key     Starter/demo key.
	 * @param array  $sample_posts Source sample posts.
	 *
	 * @return int Imported media count.
	 */
	private function import_feature_sample_media_dependencies( $demo_key, $sample_posts ) {
		$media_ids = array();

		foreach ( (array) $sample_posts as $post ) {
			if ( empty( $post['meta']['_thumbnail_id'] ) ) {
				continue;
			}

			$thumbnail_id = $post['meta']['_thumbnail_id'];
			if ( is_array( $thumbnail_id ) ) {
				$thumbnail_id = reset( $thumbnail_id );
			}

			$thumbnail_id = absint( $thumbnail_id );
			if ( $thumbnail_id ) {
				$media_ids[] = $thumbnail_id;
			}
		}

		$imported = 0;
		foreach ( array_values( array_unique( $media_ids ) ) as $media_id ) {
			if ( $this->layout_media_id_is_imported( $demo_key, $media_id ) ) {
				continue;
			}

			if ( $this->sideload_demo_attachment( $media_id, $demo_key ) ) {
				$imported++;
			}
		}

		return $imported;
	}

	/**
	 * Resolve a remote media ID to its imported local ID.
	 *
	 * @param string $demo_key Starter/demo key.
	 * @param mixed  $media_id Remote media ID.
	 *
	 * @return int
	 */
	private function get_imported_media_id( $demo_key, $media_id ) {
		$media_id = absint( $media_id );
		if ( empty( $media_id ) ) {
			return 0;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		foreach ( array( 'ignored', 'placeholders' ) as $group ) {
			if ( ! empty( $starter_content[ $demo_key ]['media'][ $group ][ $media_id ] ) ) {
				return absint( $starter_content[ $demo_key ]['media'][ $group ][ $media_id ] );
			}
		}

		return 0;
	}

	/**
	 * Handle the request to import one layout unit.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
		public function rest_import_unit( $request ) {
			$params = $request->get_params();

			if ( empty( $params['demo_key'] ) || empty( $params['url'] ) || empty( $params['unit_type'] ) || empty( $params['unit'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->import_layout_unit(
			sanitize_key( $params['demo_key'] ),
			esc_url_raw( $params['url'] ),
			sanitize_key( $params['unit_type'] ),
			sanitize_text_field( $params['unit'] ),
			array(
				'include_sample' => isset( $params['include_sample'] ) ? $this->sanitize_bool( $params['include_sample'] ) : null,
				)
			) );
		}

		/**
		 * Handle the request to queue one layout-unit import for background processing.
		 *
		 * @param WP_REST_Request $request Request object.
		 *
		 * @return WP_REST_Response
		 */
		public function rest_queue_unit( $request ) {
			$params = $request->get_params();

			if ( empty( $params['demo_key'] ) || empty( $params['url'] ) || empty( $params['unit_type'] ) || empty( $params['unit'] ) ) {
				return rest_ensure_response( array(
					'code'    => 'missing_params',
					'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
					'data'    => array(),
				) );
			}

			$response = $this->queue_layout_unit_job(
				sanitize_key( $params['demo_key'] ),
				esc_url_raw( $params['url'] ),
				sanitize_key( $params['unit_type'] ),
				sanitize_text_field( $params['unit'] ),
				array(
					'include_sample' => isset( $params['include_sample'] ) ? $this->sanitize_bool( $params['include_sample'] ) : null,
				),
				false
			);

			if ( isset( $response['data']['token'] ) ) {
				unset( $response['data']['token'] );
			}

			return rest_ensure_response( $response );
		}

		/**
		 * Handle the token-protected worker request for a queued layout-unit import.
		 *
		 * @param WP_REST_Request $request Request object.
		 *
		 * @return WP_REST_Response
		 */
		public function rest_process_unit_job( $request ) {
			$params = $request->get_params();

			return rest_ensure_response( $this->process_layout_unit_job(
				isset( $params['job_id'] ) ? sanitize_key( $params['job_id'] ) : '',
				isset( $params['token'] ) ? sanitize_text_field( $params['token'] ) : ''
			) );
		}

		/**
		 * Handle polling for a queued layout-unit import.
		 *
		 * @param WP_REST_Request $request Request object.
		 *
		 * @return WP_REST_Response
		 */
		public function rest_unit_job_status( $request ) {
			$params = $request->get_params();

			if ( empty( $params['job_id'] ) ) {
				return rest_ensure_response( array(
					'code'    => 'missing_params',
					'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
					'data'    => array(),
				) );
			}

			$job_id = sanitize_key( $params['job_id'] );
			$status = $this->get_layout_unit_job_status( $job_id );

			if ( ! empty( $status['data']['status'] ) && 'queued' === $status['data']['status'] ) {
				$job = $this->get_layout_unit_job( $job_id );
				if ( ! empty( $job['token'] ) ) {
					return rest_ensure_response( $this->process_layout_unit_job( $job_id, $job['token'] ) );
				}
			}

			return rest_ensure_response( $status );
		}

		/**
		 * Queue a layout-unit import job and optionally dispatch the background worker.
		 *
		 * @param string     $demo_key  Starter/demo key.
		 * @param string     $base_url  Source SCE REST base URL.
		 * @param string     $unit_type Unit post type or feature.
		 * @param int|string $unit      Source post ID or slug.
		 * @param array      $options   Import options.
		 * @param bool       $dispatch  Whether to start the worker through a non-blocking loopback request.
		 *
		 * @return array Response payload.
		 */
		public function queue_layout_unit_job( $demo_key, $base_url, $unit_type, $unit, $options = array(), $dispatch = true ) {
			$demo_key  = sanitize_key( $demo_key );
			$base_url  = trailingslashit( esc_url_raw( $base_url ) );
			$unit_type = sanitize_key( $unit_type );
			$unit      = sanitize_text_field( $unit );
			$options   = is_array( $options ) ? $options : array();

			if ( empty( $demo_key ) || empty( $base_url ) || empty( $unit ) || ! in_array( $unit_type, array( 'wp_template_part', 'wp_template', 'feature' ), true ) ) {
				return array(
					'code'    => 'invalid_params',
					'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			if ( ! $this->is_allowed_demo_url( $base_url ) ) {
				return array(
					'code'    => 'invalid_source',
					'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			$missing_plugins = $this->get_missing_required_plugins( $demo_key );
			if ( ! empty( $missing_plugins ) ) {
				$names = wp_list_pluck( $missing_plugins, 'name' );

				return array(
					'code'    => 'missing_required_plugins',
					'message' => sprintf(
						/* translators: %s: comma-separated list of plugin names. */
						esc_html__( 'This starter needs these plugins installed and active first: %s. Please install and activate them, then import again.', '__plugin_txtd' ),
						implode( ', ', $names )
					),
					'data'    => array(
						'requiredPlugins' => array_values( $missing_plugins ),
					),
				);
			}

			if ( array_key_exists( 'include_sample', $options ) && null !== $options['include_sample'] ) {
				$options['include_sample'] = (bool) $options['include_sample'];
			}

			$job_id = $this->generate_layout_unit_job_id();
			$token  = $this->generate_layout_unit_job_token();
			$now    = time();
			$job    = array(
				'jobId'   => $job_id,
				'token'   => $token,
				'status'  => 'queued',
				'created' => $now,
				'updated' => $now,
				'request' => array(
					'demoKey'  => $demo_key,
					'baseUrl'  => $base_url,
					'unitType' => $unit_type,
					'unit'     => $unit,
					'options'  => $options,
				),
			);

			$this->store_layout_unit_job( $job_id, $job );

			if ( $dispatch ) {
				$dispatch_result = $this->dispatch_layout_unit_job( $job_id, $token );
					if ( is_wp_error( $dispatch_result ) ) {
						$job['status'] = 'error';
						$job['updated'] = time();
						$job['error']  = array(
							'code'    => method_exists( $dispatch_result, 'get_error_code' ) ? $dispatch_result->get_error_code() : 'layout_job_dispatch_failed',
							'message' => $dispatch_result->get_error_message(),
						);
						$this->store_layout_unit_job( $job_id, $job );
				}
			}

			return array(
				'code'    => 'success',
				'message' => esc_html__( 'Layout import queued.', '__plugin_txtd' ),
				'data'    => $this->format_layout_unit_job( $job, true ),
			);
		}

		/**
		 * Process a queued layout-unit import job.
		 *
		 * @param string $job_id Job ID.
		 * @param string $token  Worker token.
		 *
		 * @return array Response payload.
		 */
		public function process_layout_unit_job( $job_id, $token ) {
			$job_id = sanitize_key( $job_id );
			$token  = sanitize_text_field( $token );
			$job    = $this->get_layout_unit_job( $job_id );

			if ( empty( $job ) ) {
				return array(
					'code'    => 'job_not_found',
					'message' => esc_html__( 'The layout import job could not be found.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			if ( empty( $job['token'] ) || empty( $token ) || ! hash_equals( (string) $job['token'], (string) $token ) ) {
				return array(
					'code'    => 'invalid_job_token',
					'message' => esc_html__( 'The layout import job token is invalid.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			if ( in_array( $job['status'], array( 'running', 'success', 'error' ), true ) ) {
				return array(
					'code'    => 'success',
					'message' => '',
					'data'    => $this->format_layout_unit_job( $job ),
				);
			}

			$job['status'] = 'running';
			$job['updated'] = time();
			$this->store_layout_unit_job( $job_id, $job );

			try {
				$request = isset( $job['request'] ) && is_array( $job['request'] ) ? $job['request'] : array();
				$result  = $this->import_layout_unit(
					isset( $request['demoKey'] ) ? $request['demoKey'] : '',
					isset( $request['baseUrl'] ) ? $request['baseUrl'] : '',
					isset( $request['unitType'] ) ? $request['unitType'] : '',
					isset( $request['unit'] ) ? $request['unit'] : '',
					isset( $request['options'] ) && is_array( $request['options'] ) ? $request['options'] : array()
				);

				if ( class_exists( 'WP_REST_Response' ) && $result instanceof WP_REST_Response ) {
					$result = $result->get_data();
				}

				$job['result']  = $result;
				$job['status']  = is_array( $result ) && isset( $result['code'] ) && 'success' === $result['code'] ? 'success' : 'error';
				$job['updated'] = time();
			} catch ( Throwable $error ) {
				$job['status']  = 'error';
				$job['updated'] = time();
				$job['error']   = array(
					'code'    => 'layout_job_exception',
					'message' => $error->getMessage(),
				);
			}

			$this->store_layout_unit_job( $job_id, $job );

			return array(
				'code'    => 'success',
				'message' => '',
				'data'    => $this->format_layout_unit_job( $job ),
			);
		}

		/**
		 * Return the current status for a queued layout-unit import job.
		 *
		 * @param string $job_id Job ID.
		 *
		 * @return array Response payload.
		 */
		public function get_layout_unit_job_status( $job_id ) {
			$job = $this->get_layout_unit_job( sanitize_key( $job_id ) );
			if ( empty( $job ) ) {
				return array(
					'code'    => 'job_not_found',
					'message' => esc_html__( 'The layout import job could not be found.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			return array(
				'code'    => 'success',
				'message' => '',
				'data'    => $this->format_layout_unit_job( $job ),
			);
		}

		/**
		 * Handle the request to undo one applied layout unit.
		 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_undo_unit( $request ) {
		$params = $request->get_params();

		if ( empty( $params['unit_type'] ) || empty( $params['unit'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( $this->undo_layout_unit(
			sanitize_key( $params['unit_type'] ),
			sanitize_text_field( $params['unit'] )
		) );
	}

	/**
	 * Import one layout unit and its layout-only dependencies.
	 *
	 * @param string     $demo_key  Starter/demo key.
	 * @param string     $base_url  Source SCE REST base URL.
	 * @param string     $unit_type Unit post type: wp_template_part or wp_template.
	 * @param int|string $unit      Source post ID or slug.
	 * @param array      $options   Import options.
	 *
	 * @return array Response payload.
	 */
	public function import_layout_unit( $demo_key, $base_url, $unit_type, $unit, $options = array() ) {
		$demo_key  = sanitize_key( $demo_key );
		$base_url  = trailingslashit( esc_url_raw( $base_url ) );
		$unit_type = sanitize_key( $unit_type );
		$unit      = sanitize_text_field( $unit );

		if ( 'feature' === $unit_type ) {
			return $this->import_feature_unit( $demo_key, $base_url, $unit, is_array( $options ) ? $options : array() );
		}

		if ( empty( $demo_key ) || empty( $base_url ) || empty( $unit ) || ! in_array( $unit_type, array( 'wp_template_part', 'wp_template' ), true ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		if ( ! $this->is_allowed_demo_url( $base_url ) ) {
			return array(
				'code'    => 'invalid_source',
				'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$missing_plugins = $this->get_missing_required_plugins( $demo_key );
		if ( ! empty( $missing_plugins ) ) {
			$names = wp_list_pluck( $missing_plugins, 'name' );

			return array(
				'code'    => 'missing_required_plugins',
				'message' => sprintf(
					/* translators: %s: comma-separated list of plugin names. */
					esc_html__( 'This starter needs these plugins installed and active first: %s. Please install and activate them, then import again.', '__plugin_txtd' ),
					implode( ', ', $names )
				),
				'data'    => array(
					'requiredPlugins' => array_values( $missing_plugins ),
				),
			);
		}

		set_transient( 'pixassist_sce_demo_url', $base_url, HOUR_IN_SECONDS );

		wp_defer_term_counting( true );
		wp_defer_comment_counting( true );
		wp_suspend_cache_invalidation( true );

		$source_posts = $this->fetch_layout_source_posts( $base_url, $unit_type );
		if ( is_wp_error( $source_posts ) ) {
			$this->restore_import_counting();

			return $this->layout_unit_error_response( $source_posts );
		}

		$unit_post = $this->find_layout_unit_post( $source_posts, $unit );
		if ( empty( $unit_post ) ) {
			$this->restore_import_counting();

			return array(
				'code'    => 'unit_not_found',
				'message' => esc_html__( 'The requested layout unit could not be found.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$unit_slug = isset( $unit_post['post_name'] ) ? sanitize_key( $unit_post['post_name'] ) : '';
		if ( $this->get_applied_layout_unit_entry( $unit_type, $unit_slug ) ) {
			$undo = $this->undo_layout_unit( $unit_type, $unit_slug );
			if ( empty( $undo['code'] ) || 'success' !== $undo['code'] ) {
				$this->restore_import_counting();

				return $undo;
			}
		}

		$starter_content_before = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content_before ) ) {
			$starter_content_before = array();
		}

		$source_data = $this->fetch_layout_source_data( $base_url );
		if ( is_wp_error( $source_data ) ) {
			$needs_source_data = ! empty( $this->extract_layout_navigation_slugs( isset( $unit_post['post_content'] ) ? $unit_post['post_content'] : '' ) )
				|| $this->layout_unit_uses_logo( $unit_post );

			if ( $needs_source_data ) {
				$this->restore_import_counting();

				return $this->layout_unit_error_response( $source_data );
			}

			$source_data = array();
		}

		$dependencies = array(
			'navMenus'  => 0,
			'menuItems' => 0,
			'media'     => 0,
			'logos'     => 0,
		);

		$menu_import = $this->import_layout_unit_menu_dependencies( $demo_key, $base_url, $source_data, $unit_post );
		if ( is_wp_error( $menu_import ) ) {
			$this->restore_import_counting();

			return $this->layout_unit_error_response( $menu_import );
		}

		$dependencies['navMenus']  = isset( $menu_import['navMenus'] ) ? (int) $menu_import['navMenus'] : 0;
		$dependencies['menuItems'] = isset( $menu_import['menuItems'] ) ? (int) $menu_import['menuItems'] : 0;

		$media_import = $this->import_layout_unit_media_dependencies( $demo_key, $unit_post );
		if ( is_wp_error( $media_import ) ) {
			$this->restore_import_counting();

			return $this->layout_unit_error_response( $media_import );
		}

		$dependencies['media'] = isset( $media_import['media'] ) ? (int) $media_import['media'] : 0;

		$settings_import = $this->import_layout_unit_settings( $demo_key, $source_data, $unit_post, isset( $menu_import['locationSlugs'] ) ? $menu_import['locationSlugs'] : array() );
		if ( is_wp_error( $settings_import ) ) {
			$this->restore_import_counting();

			return $this->layout_unit_error_response( $settings_import );
		}

		$dependencies['logos'] = isset( $settings_import['logos'] ) ? (int) $settings_import['logos'] : 0;

		$overwrite_filter = function ( $should_overwrite, $existing_post_id, $post ) use ( $unit_post ) {
			if ( ! empty( $post['ID'] ) && (int) $post['ID'] === (int) $unit_post['ID'] ) {
				return true;
			}

			return $should_overwrite;
		};
		add_filter( 'pixassist_sce_should_overwrite_existing_post', $overwrite_filter, 10, 3 );

			$unit_http_handlers = array(
				array(
					'base_url'    => $base_url,
					'endpoint'    => 'posts',
					'match_key'   => 'post_type',
					'match_value' => $unit_type,
					'include'     => array( (int) $unit_post['ID'] ),
					'data_key'    => 'posts',
					'data'        => array( $unit_post ),
				),
			);

			try {
				$unit_import = $this->with_cached_layout_source_http(
					$unit_http_handlers,
					function () use ( $demo_key, $base_url, $unit_type, $unit_post ) {
						return $this->import_post_type( $demo_key, $base_url, array(
							'post_type' => $unit_type,
							'ids'       => array( (int) $unit_post['ID'] ),
						) );
					}
				);
			} finally {
				remove_filter( 'pixassist_sce_should_overwrite_existing_post', $overwrite_filter, 10 );
			}

		$this->restore_import_counting();

		if ( is_wp_error( $unit_import ) ) {
			return $this->layout_unit_error_response( $unit_import );
		}
		if ( $unit_import instanceof WP_REST_Response ) {
			return $unit_import;
		}
		if ( empty( $unit_import[ $unit_post['ID'] ] ) ) {
			return array(
				'code'    => 'unit_import_failed',
				'message' => esc_html__( 'The layout unit could not be imported.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

			$this->finish_layout_unit_import( $base_url, array( $unit_import[ $unit_post['ID'] ] ) );

			$this->record_applied_layout_unit(
				$demo_key,
			$base_url,
			$unit_type,
			$unit_post,
			(int) $unit_import[ $unit_post['ID'] ],
			$starter_content_before,
			isset( $settings_import['locationSlugs'] ) ? $settings_import['locationSlugs'] : array()
		);

		return array(
			'code'    => 'success',
			'message' => esc_html__( 'Layout imported.', '__plugin_txtd' ),
			'data'    => array(
				'unit'         => array(
					'type'     => $unit_type,
					'slug'     => isset( $unit_post['post_name'] ) ? (string) $unit_post['post_name'] : '',
					'sourceId' => (int) $unit_post['ID'],
					'localId'  => (int) $unit_import[ $unit_post['ID'] ],
				),
				'dependencies' => $dependencies,
				'appliedUnits' => $this->get_applied_layout_units(),
			),
		);
	}

	/**
	 * Import a CPT-backed feature unit.
	 *
	 * @param string $demo_key     Starter/demo key.
	 * @param string $base_url     Source SCE REST base URL.
	 * @param string $feature_slug Feature slug.
	 * @param array  $options      Import options.
	 *
	 * @return array Response payload.
	 */
	private function import_feature_unit( $demo_key, $base_url, $feature_slug, $options = array() ) {
		$demo_key     = sanitize_key( $demo_key );
		$base_url     = trailingslashit( esc_url_raw( $base_url ) );
		$feature_slug = sanitize_key( $feature_slug );
		$features     = $this->get_layout_feature_definitions();

		if ( empty( $demo_key ) || empty( $base_url ) || empty( $feature_slug ) || empty( $features[ $feature_slug ] ) || ! is_array( $features[ $feature_slug ] ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		if ( ! $this->is_allowed_demo_url( $base_url ) ) {
			return array(
				'code'    => 'invalid_source',
				'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$missing_plugins = $this->get_missing_required_plugins( $demo_key );
		if ( ! empty( $missing_plugins ) ) {
			$names = wp_list_pluck( $missing_plugins, 'name' );

			return array(
				'code'    => 'missing_required_plugins',
				'message' => sprintf(
					/* translators: %s: comma-separated list of plugin names. */
					esc_html__( 'This starter needs these plugins installed and active first: %s. Please install and activate them, then import again.', '__plugin_txtd' ),
					implode( ', ', $names )
				),
				'data'    => array(
					'requiredPlugins' => array_values( $missing_plugins ),
				),
			);
		}

		$feature      = $features[ $feature_slug ];
		$post_type    = isset( $feature['post_type'] ) ? sanitize_key( $feature['post_type'] ) : '';
		$include_sample = array_key_exists( 'include_sample', $options ) && null !== $options['include_sample']
			? (bool) $options['include_sample']
			: ! empty( $feature['sample_default'] );

		$source_data = $this->fetch_layout_source_data( $base_url );
		if ( is_wp_error( $source_data ) ) {
			return $this->layout_unit_error_response( $source_data );
		}

		$source_templates = $this->fetch_layout_source_posts( $base_url, 'wp_template' );
		if ( is_wp_error( $source_templates ) ) {
			return $this->layout_unit_error_response( $source_templates );
		}

		$template_ids = $this->get_feature_template_source_ids( $feature, $source_templates );
		if ( empty( $post_type ) || empty( $source_data['post_types'][ $post_type ]['ids'] ) || empty( $template_ids ) ) {
			return array(
				'code'    => 'feature_not_found',
				'message' => esc_html__( 'The requested feature unit could not be found.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		if ( $this->get_applied_layout_unit_entry( 'feature', $feature_slug ) ) {
			$undo = $this->undo_layout_unit( 'feature', $feature_slug );
			if ( empty( $undo['code'] ) || 'success' !== $undo['code'] ) {
				return $undo;
			}
		}

		$starter_content_before = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content_before ) ) {
			$starter_content_before = array();
		}
		$enabled_features_before = $this->get_enabled_layout_features();

		set_transient( 'pixassist_sce_demo_url', $base_url, HOUR_IN_SECONDS );

		wp_defer_term_counting( true );
		wp_defer_comment_counting( true );
		wp_suspend_cache_invalidation( true );

		$dependencies = array(
			'templates' => 0,
			'terms'     => 0,
			'samples'   => 0,
			'media'     => 0,
		);

		$this->enable_layout_feature( $feature_slug );
		$this->maybe_register_layout_feature( $feature_slug );

		$overwrite_filter = function ( $should_overwrite, $existing_post_id, $post ) use ( $template_ids ) {
			if ( ! empty( $post['ID'] ) && in_array( (int) $post['ID'], array_map( 'intval', $template_ids ), true ) ) {
				return true;
			}

			return $should_overwrite;
		};
		add_filter( 'pixassist_sce_should_overwrite_existing_post', $overwrite_filter, 10, 3 );

		try {
			$template_import = $this->import_post_type(
				$demo_key,
				$base_url,
				array(
					'post_type' => 'wp_template',
					'ids'       => array_values( array_map( 'absint', $template_ids ) ),
				)
			);
		} finally {
			remove_filter( 'pixassist_sce_should_overwrite_existing_post', $overwrite_filter, 10 );
		}

		if ( is_wp_error( $template_import ) ) {
			$this->restore_import_counting();

			return $this->layout_unit_error_response( $template_import );
		}
		if ( $template_import instanceof WP_REST_Response ) {
			$this->restore_import_counting();

			return $template_import;
		}
		if ( empty( $template_import ) || ! is_array( $template_import ) ) {
			$this->restore_import_counting();

			return array(
				'code'    => 'feature_import_failed',
				'message' => esc_html__( 'The feature templates could not be imported.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$dependencies['templates'] = count( $template_import );

		if ( $include_sample ) {
			$term_ids = $this->get_feature_source_taxonomy_ids( $feature, $source_data );
			foreach ( $term_ids as $taxonomy => $ids ) {
				$term_import = $this->import_taxonomy(
					$demo_key,
					$base_url,
					array(
						'tax' => $taxonomy,
						'ids' => $ids,
					)
				);
				if ( is_wp_error( $term_import ) ) {
					$this->restore_import_counting();

					return $this->layout_unit_error_response( $term_import );
				}
				if ( $term_import instanceof WP_REST_Response ) {
					$this->restore_import_counting();

					return $term_import;
				}
				if ( is_array( $term_import ) ) {
					$dependencies['terms'] += count( $term_import );
				}
			}

			$sample_ids = array_slice(
				array_values( array_map( 'absint', (array) $source_data['post_types'][ $post_type ]['ids'] ) ),
				0,
				absint( isset( $feature['sample_count'] ) ? $feature['sample_count'] : 3 )
			);

			$sample_posts = $this->fetch_layout_source_posts( $base_url, $post_type, $sample_ids );
			if ( is_wp_error( $sample_posts ) ) {
				$this->restore_import_counting();

				return $this->layout_unit_error_response( $sample_posts );
			}

			$dependencies['media'] = $this->import_feature_sample_media_dependencies( $demo_key, $sample_posts );

			$thumbnail_filter = function ( $meta, $key, $filter_demo_key ) use ( $demo_key ) {
				if ( '_thumbnail_id' !== $key || $filter_demo_key !== $demo_key ) {
					return $meta;
				}

				$local_id = $this->get_imported_media_id( $demo_key, $meta );
				return $local_id ? $local_id : $meta;
			};
			add_filter( 'sce_pre_postmeta', $thumbnail_filter, 10, 3 );

			try {
				$sample_import = $this->import_post_type(
					$demo_key,
					$base_url,
					array(
						'post_type' => $post_type,
						'ids'       => $sample_ids,
					)
				);
			} finally {
				remove_filter( 'sce_pre_postmeta', $thumbnail_filter, 10 );
			}

			if ( is_wp_error( $sample_import ) ) {
				$this->restore_import_counting();

				return $this->layout_unit_error_response( $sample_import );
			}
			if ( $sample_import instanceof WP_REST_Response ) {
				$this->restore_import_counting();

				return $sample_import;
			}
			if ( is_array( $sample_import ) ) {
				$dependencies['samples'] = count( $sample_import );
			}
		}

		$this->restore_import_counting();
		do_action( 'pixassist_sce_import_end' );

		$this->record_applied_feature_unit(
			$demo_key,
			$base_url,
			$feature_slug,
			$feature,
			$starter_content_before,
			$enabled_features_before,
			$dependencies,
			$include_sample
		);

		return array(
			'code'    => 'success',
			'message' => esc_html__( 'Feature imported.', '__plugin_txtd' ),
			'data'    => array(
				'unit'         => array(
					'type' => 'feature',
					'slug' => $feature_slug,
				),
				'dependencies' => $dependencies,
				'appliedUnits' => $this->get_applied_layout_units(),
			),
		);
	}

	/**
	 * Undo one applied layout unit while keeping other applied units intact.
	 *
	 * @param string $unit_type Unit post type.
	 * @param string $unit      Unit slug.
	 *
	 * @return array Response payload.
	 */
	public function undo_layout_unit( $unit_type, $unit ) {
		$unit_type = sanitize_key( $unit_type );
		$unit      = sanitize_key( $unit );
		$slot      = $this->get_layout_unit_slot_key( $unit_type, $unit );

		if ( empty( $slot ) ) {
			return array(
				'code'    => 'invalid_params',
				'message' => esc_html__( 'The layout unit request is invalid.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$entry = $this->get_applied_layout_unit_entry( $unit_type, $unit );
		if ( empty( $entry ) ) {
			return array(
				'code'    => 'unit_not_found',
				'message' => esc_html__( 'The requested layout unit is not applied.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return array(
				'code'    => 'unit_not_found',
				'message' => esc_html__( 'The requested layout unit is not applied.', '__plugin_txtd' ),
				'data'    => array(),
			);
		}

		$demo_key     = $entry['demo_key'];
		$unit_meta    = $entry['unit'];
		$unit_journal = ! empty( $unit_meta['journal'] ) && is_array( $unit_meta['journal'] ) ? $unit_meta['journal'] : array();
		$delete_journal = $this->get_layout_unit_exclusive_journal( $unit_journal, $slot, $starter_content );

		$summary = array(
			'units'                => 1,
			'posts_deleted'        => 0,
			'posts_missing'        => 0,
			'terms_deleted'        => 0,
			'terms_skipped'        => 0,
			'media_deleted'        => 0,
			'media_skipped'        => 0,
			'features_disabled'    => 0,
			'options_restored'     => 0,
			'theme_mods_restored'  => 0,
		);
		$restored_options = array();
		$restored_mods    = array();

		$this->reset_starter_content_posts( $delete_journal, $summary );
		$this->reset_starter_content_terms( $delete_journal, $summary );
		$this->reset_starter_content_media( $delete_journal, $summary );
		$this->reset_starter_content_features( $delete_journal, $summary );
		$this->reset_layout_unit_settings( $unit_journal, $unit_meta, $restored_options, $restored_mods );

		$summary['options_restored']    = count( $restored_options );
		$summary['theme_mods_restored'] = count( $restored_mods );
		$enabled_features               = $this->get_enabled_layout_features();

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array(), true );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}

		$this->remove_layout_unit_from_starter_content( $starter_content, $demo_key, $slot, $delete_journal, $unit_journal );
		$this->regenerate_style_manager_after_import();

		PixelgradeAssistant_Admin::set_option( 'enabled_features', $enabled_features );
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		return array(
			'code'    => 'success',
			'message' => esc_html__( 'Layout reverted.', '__plugin_txtd' ),
			'data'    => array(
				'summary'      => $summary,
				'appliedUnits' => $this->get_applied_layout_units(),
			),
		);
	}

	/**
	 * Handle the request to reset imported starter content.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
		public function rest_reset_starter_content( $request ) {
			return rest_ensure_response( array(
				'code'    => 'success',
				'message' => esc_html__( 'Starter content was reset.', '__plugin_txtd' ),
				'data'    => $this->reset_starter_content(),
			) );
		}

		/**
		 * Handle the request to import a complete starter in one server-side pass.
		 *
		 * @param WP_REST_Request $request Request object.
		 *
		 * @return WP_REST_Response
		 */
		public function rest_import_starter( $request ) {
			$params = $request->get_params();

			if ( empty( $params['demo_key'] ) || empty( $params['url'] ) ) {
				return rest_ensure_response( array(
					'code'    => 'missing_params',
					'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
					'data'    => array(),
				) );
			}

			return rest_ensure_response( $this->import_starter(
				sanitize_key( $params['demo_key'] ),
				esc_url_raw( $params['url'] )
			) );
		}

		/**
		 * Import a complete starter in one request.
		 *
		 * The legacy UI imports each phase through a separate browser request. Keeping orchestration in PHP
		 * lets us reuse the existing import helpers while deferring expensive cache/taxonomy restoration until
		 * the end of the full import.
		 *
		 * @param string     $demo_key    Starter/demo key.
		 * @param string     $base_url    Source SCE REST base URL.
		 * @param array|null $source_data Optional already-fetched source data, mainly for tests.
		 *
		 * @return array|WP_REST_Response Response payload.
		 */
		public function import_starter( $demo_key, $base_url, $source_data = null ) {
			$demo_key = sanitize_key( $demo_key );
			$base_url = trailingslashit( esc_url_raw( $base_url ) );

			if ( empty( $demo_key ) || empty( $base_url ) ) {
				return array(
					'code'    => 'invalid_params',
					'message' => esc_html__( 'The starter import request is invalid.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			if ( ! $this->is_allowed_demo_url( $base_url ) ) {
				return array(
					'code'    => 'invalid_source',
					'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			$missing_plugins = $this->get_missing_required_plugins( $demo_key );
			if ( ! empty( $missing_plugins ) ) {
				$names = wp_list_pluck( $missing_plugins, 'name' );

				return array(
					'code'    => 'missing_required_plugins',
					'message' => sprintf(
						/* translators: %s: comma-separated list of plugin names. */
						esc_html__( 'This starter needs these plugins installed and active first: %s. Please install and activate them, then import again.', '__plugin_txtd' ),
						implode( ', ', $names )
					),
					'data'    => array(
						'requiredPlugins' => array_values( $missing_plugins ),
					),
				);
			}

			if ( null === $source_data ) {
				$source_data = $this->fetch_layout_source_data( $base_url );
			}

			if ( is_wp_error( $source_data ) ) {
				return $this->layout_unit_error_response( $source_data );
			}

			if ( empty( $source_data ) || ! is_array( $source_data ) ) {
				return array(
					'code'    => 'starter_data_missing',
					'message' => esc_html__( 'The starter source did not provide import data.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			if ( function_exists( 'set_time_limit' ) ) {
				@set_time_limit( 0 );
			}

			set_transient( 'pixassist_sce_demo_url', $base_url, HOUR_IN_SECONDS );

			$summary = array(
				'media'      => 0,
				'taxonomies' => 0,
				'postTypes'  => 0,
				'widgets'    => false,
				'settings'   => array(
					'pre'  => false,
					'post' => false,
				),
			);

			wp_defer_term_counting( true );
			wp_defer_comment_counting( true );
			wp_suspend_cache_invalidation( true );

			try {
				if ( ! empty( $source_data['pre_settings'] ) ) {
					$result = $this->import_settings( $demo_key, 'pre', $this->maybeCastNumbersDeep( $source_data['pre_settings'] ) );
					if ( is_wp_error( $result ) ) {
						return $this->layout_unit_error_response( $result );
					}
					if ( $result instanceof WP_REST_Response ) {
						return $result;
					}
					$summary['settings']['pre'] = (bool) $result;
				}

				if ( ! empty( $source_data['media'] ) && is_array( $source_data['media'] ) ) {
					$media_result = $this->import_starter_media( $demo_key, $base_url, $source_data['media'] );
					if ( is_wp_error( $media_result ) ) {
						return $this->layout_unit_error_response( $media_result );
					}
					$summary['media'] = (int) $media_result;
				}

				foreach ( $this->sort_starter_import_entries_by_priority( isset( $source_data['taxonomies'] ) ? $source_data['taxonomies'] : array() ) as $entry ) {
					if ( empty( $entry['name'] ) || empty( $entry['ids'] ) ) {
						continue;
					}

					$result = $this->import_taxonomy( $demo_key, $base_url, array(
						'tax' => sanitize_key( $entry['name'] ),
						'ids' => $entry['ids'],
					) );
					if ( is_wp_error( $result ) ) {
						return $this->layout_unit_error_response( $result );
					}
					if ( $result instanceof WP_REST_Response ) {
						return $result;
					}
					if ( is_array( $result ) ) {
						$summary['taxonomies'] += count( $result );
					}
				}

				foreach ( $this->sort_starter_import_entries_by_priority( isset( $source_data['post_types'] ) ? $source_data['post_types'] : array() ) as $entry ) {
					if ( empty( $entry['name'] ) || empty( $entry['ids'] ) ) {
						continue;
					}

					$result = $this->import_post_type( $demo_key, $base_url, array(
						'post_type' => sanitize_key( $entry['name'] ),
						'ids'       => $entry['ids'],
					) );
					if ( is_wp_error( $result ) ) {
						return $this->layout_unit_error_response( $result );
					}
					if ( $result instanceof WP_REST_Response ) {
						return $result;
					}
					if ( is_array( $result ) ) {
						$summary['postTypes'] += count( $result );
					}
				}

				if ( ! empty( $source_data['widgets'] ) ) {
					$result = $this->import_parsed_widgets( $demo_key, $base_url );
					if ( is_wp_error( $result ) ) {
						return $this->layout_unit_error_response( $result );
					}
					if ( $result instanceof WP_REST_Response ) {
						return $result;
					}
					$summary['widgets'] = (bool) $result;
				}

				if ( ! empty( $source_data['post_settings'] ) ) {
					$result = $this->import_settings( $demo_key, 'post', $this->maybeCastNumbersDeep( $source_data['post_settings'] ) );
					if ( is_wp_error( $result ) ) {
						return $this->layout_unit_error_response( $result );
					}
					if ( $result instanceof WP_REST_Response ) {
						return $result;
					}
					$summary['settings']['post'] = (bool) $result;
				} else {
					do_action( 'pixassist_sce_import_end' );
				}
			} finally {
				$this->restore_import_counting();
			}

			return array(
				'code'    => 'success',
				'message' => esc_html__( 'Starter content imported.', '__plugin_txtd' ),
				'data'    => array(
					'summary'  => $summary,
					'imported' => PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() ),
				),
			);
		}

		/**
		 * Handle the request to upload a media file.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
		public function rest_upload_media( $request ) {
			$params = $request->get_params();

			return rest_ensure_response( $this->import_media_file(
				sanitize_text_field( $params['demo_key'] ),
				sanitize_text_field( $params['group'] ),
				absint( $params['remote_id'] ),
				sanitize_text_field( $params['title'] ),
				sanitize_text_field( $params['ext'] ),
				$params['file_data']
			) );
		}

		/**
		 * Import media configured by the source starter data.
		 *
		 * @param string $demo_key Starter/demo key.
		 * @param string $base_url Source SCE REST base URL.
		 * @param array  $media    Source media config.
		 *
		 * @return int|WP_Error Number of imported media records.
		 */
		private function import_starter_media( $demo_key, $base_url, $media ) {
			if ( empty( $media['placeholders'] ) || ! is_array( $media ) ) {
				return 0;
			}

			$imported = 0;
			foreach ( $media as $group => $items ) {
				$group = sanitize_key( $group );
				if ( 'placeholders' === $group || empty( $items ) || ! is_array( $items ) ) {
					continue;
				}

				foreach ( $items as $remote_id ) {
					$result = $this->import_starter_media_item( $demo_key, $base_url, $group, absint( $remote_id ) );
					if ( is_wp_error( $result ) ) {
						return $result;
					}

					$imported += (int) $result;
				}
			}

			return $imported;
		}

		/**
		 * Fetch one source media payload from SCE and insert it locally.
		 *
		 * @param string $demo_key  Starter/demo key.
		 * @param string $base_url  Source SCE REST base URL.
		 * @param string $group     Import media group.
		 * @param int    $remote_id Source media ID.
		 *
		 * @return int|WP_Error 1 when imported, 0 when the source item is intentionally skipped.
		 */
		private function import_starter_media_item( $demo_key, $base_url, $group, $remote_id ) {
			if ( empty( $remote_id ) ) {
				return 0;
			}

			$request_url = trailingslashit( $base_url ) . 'media?id=' . rawurlencode( (string) $remote_id );
			$attempts    = $this->get_starter_media_request_attempts( $demo_key, $base_url, $group, $remote_id );
			$response    = null;
			for ( $attempt = 1; $attempt <= $attempts; $attempt++ ) {
				$response = wp_remote_get(
					$request_url,
					$this->get_starter_media_request_args( $demo_key, $base_url, $group, $remote_id, $attempt )
				);

				if ( ! is_wp_error( $response ) ) {
					break;
				}
			}

			if ( is_wp_error( $response ) ) {
				return $response;
			}

			if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
				return new WP_Error( 'starter_media_missing', esc_html__( 'A starter media file could not be fetched.', '__plugin_txtd' ) );
			}

			$data = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( null === $data ) {
				return new WP_Error( 'starter_media_json_error', esc_html__( 'A starter media response could not be decoded.', '__plugin_txtd' ) );
			}

			if ( empty( $data['code'] ) || 'success' !== $data['code'] || empty( $data['data']['media'] ) || ! is_array( $data['data']['media'] ) ) {
				return 0;
			}

			$media = $data['data']['media'];
			if ( empty( $media['title'] ) || empty( $media['ext'] ) || empty( $media['data'] ) ) {
				return 0;
			}

			$result = $this->import_media_file(
				$demo_key,
				$group,
				$remote_id,
				sanitize_text_field( $media['title'] ),
				sanitize_text_field( $media['ext'] ),
				$media['data'],
				false
			);

			if ( empty( $result['code'] ) || 'success' !== $result['code'] ) {
				return new WP_Error(
					'starter_media_import_failed',
					! empty( $result['message'] ) ? $result['message'] : esc_html__( 'A starter media file could not be imported.', '__plugin_txtd' ),
					$result
				);
			}

			return 1;
		}

		/**
		 * Return how many times a starter media item should be fetched before failing.
		 *
		 * @param string $demo_key  Starter/demo key.
		 * @param string $base_url  Source SCE REST base URL.
		 * @param string $group     Import media group.
		 * @param int    $remote_id Source media ID.
		 *
		 * @return int
		 */
		private function get_starter_media_request_attempts( $demo_key, $base_url, $group, $remote_id ) {
			/**
			 * Filters the number of SCE media fetch attempts before failing an import.
			 *
			 * @param int    $attempts  Number of attempts.
			 * @param string $demo_key  Starter/demo key.
			 * @param string $base_url  Source SCE REST base URL.
			 * @param string $group     Import media group.
			 * @param int    $remote_id Source media ID.
			 */
			$attempts = apply_filters( 'pixassist_starter_media_request_attempts', 2, $demo_key, $base_url, $group, $remote_id );

			return max( 1, absint( $attempts ) );
		}

		/**
		 * Return HTTP args for one starter media fetch attempt.
		 *
		 * @param string $demo_key  Starter/demo key.
		 * @param string $base_url  Source SCE REST base URL.
		 * @param string $group     Import media group.
		 * @param int    $remote_id Source media ID.
		 * @param int    $attempt   One-based attempt number.
		 *
		 * @return array
		 */
		private function get_starter_media_request_args( $demo_key, $base_url, $group, $remote_id, $attempt ) {
			$attempt = max( 1, absint( $attempt ) );

			/**
			 * Filters progressive SCE media fetch timeouts.
			 *
			 * Each retry uses the timeout at the same zero-based index, falling back to the last timeout
			 * when there are more attempts than timeout entries.
			 *
			 * @param array  $timeouts  Timeout seconds by attempt. Defaults to 30s, then 90s.
			 * @param string $demo_key  Starter/demo key.
			 * @param string $base_url  Source SCE REST base URL.
			 * @param string $group     Import media group.
			 * @param int    $remote_id Source media ID.
			 */
			$timeouts = apply_filters( 'pixassist_starter_media_request_timeouts', array( 30, 90 ), $demo_key, $base_url, $group, $remote_id );
			if ( empty( $timeouts ) || ! is_array( $timeouts ) ) {
				$timeouts = array( 30 );
			}

			$timeout_index = min( $attempt - 1, count( $timeouts ) - 1 );
			$args          = array(
				'timeout'   => max( 1, absint( $timeouts[ $timeout_index ] ) ),
				'sslverify' => true,
			);

			/**
			 * Filters SCE media fetch request args.
			 *
			 * @param array  $args      HTTP API request args.
			 * @param string $demo_key  Starter/demo key.
			 * @param string $base_url  Source SCE REST base URL.
			 * @param string $group     Import media group.
			 * @param int    $remote_id Source media ID.
			 * @param int    $attempt   One-based attempt number.
			 */
			return apply_filters( 'pixassist_starter_media_request_args', $args, $demo_key, $base_url, $group, $remote_id, $attempt );
		}

		/**
		 * Insert one decoded media payload and journal it under imported starter content.
		 *
		 * @param string $demo_key  Starter/demo key.
		 * @param string $group     Import media group.
		 * @param int    $remote_id Source media ID.
		 * @param string $title     Attachment title.
		 * @param string $ext       File extension.
		 * @param string $file_data         Base64 data URL.
		 * @param bool   $generate_metadata Whether to generate image subsizes immediately.
		 *
		 * @return array Response payload.
		 */
		private function import_media_file( $demo_key, $group, $remote_id, $title, $ext, $file_data, $generate_metadata = true ) {
			add_filter( 'upload_mimes', array( $this, 'allow_svg_upload' ) );

			$demo_key  = sanitize_text_field( $demo_key );
			$group     = sanitize_text_field( $group );
			$title     = sanitize_text_field( $title );
			$remote_id = absint( $remote_id );
			$filename  = $title . '.' . sanitize_text_field( $ext );
			$file_data = $this->decode_chunk( $file_data );

			if ( false === $file_data ) {
				return array(
					'code'    => 'error',
					'message' => esc_html__( 'No file data.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			$upload_file = wp_upload_bits( $filename, null, $file_data );
			if ( $upload_file['error'] ) {
				return array(
					'code'    => 'error',
					'message' => esc_html__( 'File permission error.', '__plugin_txtd' ),
					'data'    => array(),
				);
			}

			$wp_filetype = wp_check_filetype( $filename, null );
			$attachment  = array(
				'guid'           => $upload_file['url'],
				'post_mime_type' => $wp_filetype['type'],
				'post_parent'    => 0,
				'post_title'     => $title,
				'post_content'   => '',
				'post_status'    => 'inherit'
			);

			$attachment_id = wp_insert_attachment( $attachment, $upload_file['file'] );
			if ( is_wp_error( $attachment_id ) ) {
				return array(
					'code'    => 'error',
					'message' => esc_html__( 'Something went wrong with uploading the media file.', '__plugin_txtd' ),
					'data'    => array(
						'error' => $attachment_id,
					),
				);
			}

			$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
			if ( null === $starter_content || ! is_array( $starter_content ) ) {
				$starter_content = array();
			}
			if ( empty( $starter_content[ $demo_key ] ) ) {
				$starter_content[ $demo_key ] = array();
			}
			if ( ! isset( $starter_content[ $demo_key ]['media'] ) ) {
				$starter_content[ $demo_key ]['media'] = array();
			}
			if ( ! isset( $starter_content[ $demo_key ]['media'][ $group ] ) ) {
				$starter_content[ $demo_key ]['media'][ $group ] = array();
			}

			if ( ! empty( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] ) ) {
				$previous_attachment_metadata = wp_get_attachment_metadata( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] );
				if ( ! empty( $previous_attachment_metadata['imported_with_pixassist'] ) ) {
					wp_delete_attachment( absint( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] ), true );
				}
			}

			$starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] = $attachment_id;

			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			$attachment_data = array();
			if ( $generate_metadata ) {
				require_once( ABSPATH . 'wp-admin/includes/image.php' );
				$attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload_file['file'] );
			} else {
				$attachment_data = wp_get_attachment_metadata( $attachment_id );
			}

			if ( ! is_array( $attachment_data ) ) {
				$attachment_data = array();
			}
			$attachment_data['imported_with_pixassist'] = true;

			wp_update_attachment_metadata( $attachment_id, $attachment_data );

			return array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'attachmentID' => $attachment_id,
				),
			);
		}

		/**
		 * Sort starter import descriptors by SCE priority, matching the browser importer.
		 *
		 * @param array $data Raw descriptors keyed or listed.
		 *
		 * @return array
		 */
		private function sort_starter_import_entries_by_priority( $data ) {
			$entries = array();
			foreach ( (array) $data as $entry ) {
				if ( ! empty( $entry ) && is_array( $entry ) ) {
					$entries[] = $entry;
				}
			}

			usort(
				$entries,
				function ( $a, $b ) {
					$a_priority = isset( $a['priority'] ) ? (int) $a['priority'] : 10;
					$b_priority = isset( $b['priority'] ) ? (int) $b['priority'] : 10;
					if ( $a_priority === $b_priority ) {
						return strcmp( isset( $a['name'] ) ? (string) $a['name'] : '', isset( $b['name'] ) ? (string) $b['name'] : '' );
					}

					return ( $a_priority < $b_priority ) ? -1 : 1;
				}
			);

			return $entries;
		}

		/**
		 * Handle the request to import something.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function rest_import_step( $request ) {

		$params = $request->get_params();

		// We need to import posts without the intervention of the cache system
		wp_defer_term_counting( true );
		wp_defer_comment_counting( true );
		wp_suspend_cache_invalidation( true );

		if ( empty( $params['demo_key'] ) || empty( $params['args'] ) || empty( $params['type'] ) || empty( $params['url'] ) ) {

			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => esc_html__( 'You need to provide all the needed parameters.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		$demo_key = sanitize_text_field( $params['demo_key'] );
		$base_url = sanitize_text_field( $params['url'] );
		$type     = sanitize_text_field( $params['type'] );
		$args     = $params['args'];

		// Only fetch starter content from a host we actually serve demos from, never an
		// arbitrary URL supplied by the request (SSRF guard, on top of the manage_options check).
		if ( ! $this->is_allowed_demo_url( $base_url ) ) {
			return rest_ensure_response( array(
				'code'    => 'invalid_source',
				'message' => esc_html__( 'The starter content source is not allowed.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		// Dependency gate: a starter declares the companion plugins it needs (data-driven, defaulting to
		// Nova Blocks + Style Manager for the free Anima starters). Refuse to import any step while a
		// required plugin is not active, so content the site cannot render is never written. Enforced on
		// every step server-side so the UI gate cannot be bypassed.
		$missing_plugins = $this->get_missing_required_plugins( $demo_key );
		if ( ! empty( $missing_plugins ) ) {
			$names = wp_list_pluck( $missing_plugins, 'name' );

			return rest_ensure_response( array(
				'code'    => 'missing_required_plugins',
				'message' => sprintf(
					/* translators: %s: comma-separated list of plugin names. */
					esc_html__( 'This starter needs these plugins installed and active first: %s. Please install and activate them, then import again.', '__plugin_txtd' ),
					implode( ', ', $names )
				),
				'data'    => array(
					'requiredPlugins' => array_values( $missing_plugins ),
				),
			) );
		}

		// Remember the demo base URL so end_import() can rewrite demo links reliably,
		// even if its own request body carries no `url` (e.g. a JSON request leaves $_POST empty).
		set_transient( 'pixassist_sce_demo_url', $base_url, HOUR_IN_SECONDS );

		// The default response data
		$response   = array();

		switch ( $type ) {
			case 'post_type': {
				$result = $this->import_post_type( $demo_key, $base_url, $args );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['importedPostIds'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'taxonomy': {
				$result = $this->import_taxonomy( $demo_key, $base_url, $args );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['importedTermIds'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'widgets': {
				if ( empty( $args['data'] ) ) {
					break;
				}

				$args['data'] = $this->maybeCastNumbersDeep( $args['data'] );

				$result = $this->import_widgets( $demo_key, $args['data'] );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['widgets'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'parsed_widgets': {

				$result = $this->import_parsed_widgets( $demo_key, $base_url );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['widgets'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'pre_settings': {
				if ( empty( $args['data'] ) ) {
					break;
				}

				$args['data'] = $this->maybeCastNumbersDeep( $args['data'] );

				$result = $this->import_settings( $demo_key, 'pre', $args['data'] );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['settings'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'post_settings': {
				if ( empty( $args['data'] ) ) {
					break;
				}

				$args['data'] = $this->maybeCastNumbersDeep( $args['data'] );

				$result = $this->import_settings( $demo_key, 'post', $args['data'] );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['settings'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			default :
				break;
		}

		// add cache invalidation as before
		wp_suspend_cache_invalidation( false );
		wp_cache_flush();

		$taxonomies = get_taxonomies();
		foreach ( $taxonomies as $tax ) {
			delete_option( "{$tax}_children" );
			_get_term_hierarchy( $tax );
		}

		wp_defer_term_counting( false );
		wp_defer_comment_counting( false );

		// If we have received an error or a REST response, just pass it along
		if ( is_wp_error( $response ) || $response instanceof WP_REST_Response ) {
			return rest_ensure_response( $response );
		}

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => '',
			'data'    => $response,
		) );
	}

	private function maybeCastNumbersDeep( $data ) {
		if ( ! is_array( $data ) ) {
			$data = json_decode( $data, true );
		}

		$data = $this->array_map_recursive( array( $this, 'castNumericValue'), $data );
		return $data;
	}

	private function array_map_recursive(callable $func, array $array) {
		return filter_var($array, \FILTER_CALLBACK, ['options' => $func]);
	}

		private function castNumericValue( $val ) {
			if ( is_numeric( $val ) ) {
				return $val + 0;
			}

			return $val;
		}

		/**
		 * Build a compact transient key for source API responses.
		 *
		 * @param array $parts Cache key parts.
		 *
		 * @return string
		 */
		private function get_layout_source_cache_key( $parts ) {
			return 'pixassist_layout_source_' . md5( wp_json_encode( $parts ) );
		}

		/**
		 * Read a cached source API response from memory/transients.
		 *
		 * @param array $parts     Cache key parts.
		 * @param bool  $is_object Whether to use the object-specific request-local cache.
		 *
		 * @return mixed False when missing.
		 */
		private function get_cached_layout_source( $parts, $is_object = false ) {
			$key   = $this->get_layout_source_cache_key( $parts );
			$store = $is_object ? 'layout_source_object_cache' : 'layout_source_cache';

			if ( array_key_exists( $key, $this->{$store} ) ) {
				return $this->{$store}[ $key ];
			}

			$cached = get_transient( $key );
			if ( false !== $cached ) {
				$this->{$store}[ $key ] = $cached;
			}

			return $cached;
		}

		/**
		 * Cache a source API response in memory/transients.
		 *
		 * @param array $parts     Cache key parts.
		 * @param mixed $value     Value to cache.
		 * @param bool  $is_object Whether to use the object-specific request-local cache.
		 *
		 * @return mixed Cached value.
		 */
		private function set_cached_layout_source( $parts, $value, $is_object = false ) {
			$key   = $this->get_layout_source_cache_key( $parts );
			$store = $is_object ? 'layout_source_object_cache' : 'layout_source_cache';

			$this->{$store}[ $key ] = $value;
			$expiration = defined( 'MINUTE_IN_SECONDS' ) ? 15 * MINUTE_IN_SECONDS : 15 * 60;
			set_transient( $key, $value, $expiration );

			return $value;
		}

		/**
		 * Normalize include IDs for source cache keys and request bodies.
		 *
		 * @param array|string $include Include IDs.
		 *
		 * @return array
		 */
		private function normalize_layout_source_include_ids( $include ) {
			if ( is_string( $include ) && false !== strpos( $include, ',' ) ) {
				$include = explode( ',', $include );
			}

			$ids = array_values( array_unique( array_filter( array_map( 'absint', (array) $include ) ) ) );
			sort( $ids );

			return $ids;
		}

		/**
		 * Normalize loose layout bundle unit descriptors.
		 *
		 * @param array $units Requested units.
		 *
		 * @return array
		 */
		private function normalize_layout_bundle_units( $units ) {
			$normalized = array();
			$seen       = array();

			foreach ( (array) $units as $unit ) {
				if ( ! is_array( $unit ) ) {
					continue;
				}

				$type = isset( $unit['type'] ) ? sanitize_key( $unit['type'] ) : '';
				$slug = isset( $unit['slug'] ) ? sanitize_key( $unit['slug'] ) : '';
				$id   = isset( $unit['id'] ) ? absint( $unit['id'] ) : 0;

				if ( ! in_array( $type, array( 'wp_template_part', 'wp_template' ), true ) || ( empty( $slug ) && empty( $id ) ) ) {
					continue;
				}

				$key = $type . ':' . ( $id ? (string) $id : $slug );
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}

				$entry = array( 'type' => $type );
				if ( ! empty( $slug ) ) {
					$entry['slug'] = $slug;
				}
				if ( ! empty( $id ) ) {
					$entry['id'] = $id;
				}

				$normalized[] = $entry;
				$seen[ $key ] = true;
			}

			return $normalized;
		}

		/**
		 * Fetch import-ready layout bundles from the source-side SCE endpoint.
		 *
		 * @param string $base_url Source SCE REST base URL.
		 * @param array  $units    Normalized units.
		 *
		 * @return array|WP_Error
		 */
		private function fetch_layout_unit_bundles( $base_url, $units ) {
			$base_url = trailingslashit( esc_url_raw( $base_url ) );

			$response = wp_remote_request(
				$base_url . 'layout-unit-bundles',
				array(
					'method'    => 'POST',
					'timeout'   => 10,
					'blocking'  => true,
					'body'      => array(
						'units' => wp_json_encode( $units ),
					),
					'sslverify' => true,
				)
			);

			$data = $this->parse_layout_source_response( $response, 'bundles' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}

			if ( empty( $data['bundles'] ) || ! is_array( $data['bundles'] ) ) {
				return new WP_Error( 'layout_bundle_empty', esc_html__( 'The layout source did not return bundles.', '__plugin_txtd' ) );
			}

			return $data;
		}

		/**
		 * Normalize a bundle collection that may be keyed or listed.
		 *
		 * @param mixed $items Bundle collection.
		 *
		 * @return array
		 */
		private function normalize_layout_bundle_items( $items ) {
			if ( empty( $items ) || ! is_array( $items ) ) {
				return array();
			}

			if ( isset( $items['ID'] ) || isset( $items['id'] ) || isset( $items['term_id'] ) || isset( $items['source_url'] ) ) {
				return array( $items );
			}

			$normalized = array();
			foreach ( $items as $item ) {
				if ( is_array( $item ) ) {
					$normalized[] = $item;
				}
			}

			return $normalized;
		}

		/**
		 * Prime local source caches from one import-ready layout bundle.
		 *
		 * @param string $base_url Source SCE REST base URL.
		 * @param array  $bundle   Source bundle payload.
		 *
		 * @return bool
		 */
		private function prime_layout_unit_bundle_cache( $base_url, $bundle ) {
			if ( empty( $bundle ) || ! is_array( $bundle ) ) {
				return false;
			}

			$base_url = trailingslashit( esc_url_raw( $base_url ) );
			$unit     = isset( $bundle['unit'] ) && is_array( $bundle['unit'] ) ? $bundle['unit'] : $bundle;
			$type     = isset( $unit['type'] ) ? sanitize_key( $unit['type'] ) : '';
			$slug     = isset( $unit['slug'] ) ? sanitize_key( $unit['slug'] ) : '';
			$id       = isset( $unit['id'] ) ? absint( $unit['id'] ) : ( isset( $unit['ID'] ) ? absint( $unit['ID'] ) : 0 );

			if ( empty( $type ) || ( empty( $slug ) && empty( $id ) ) ) {
				return false;
			}

			if ( ! empty( $bundle['data'] ) && is_array( $bundle['data'] ) ) {
				$this->set_cached_layout_source( array( 'data', $base_url ), $bundle['data'] );
			}

			if ( ! empty( $bundle['posts'] ) && is_array( $bundle['posts'] ) ) {
				$this->prime_layout_bundle_posts( $base_url, $bundle['posts'] );
			}

			if ( ! empty( $bundle['terms'] ) && is_array( $bundle['terms'] ) ) {
				$this->prime_layout_bundle_terms( $base_url, $bundle['terms'] );
			}

			if ( ! empty( $bundle['objects'] ) && is_array( $bundle['objects'] ) ) {
				$this->prime_layout_bundle_objects( $base_url, $bundle['objects'] );
			}

			if ( ! empty( $bundle['media'] ) && is_array( $bundle['media'] ) ) {
				$this->prime_layout_bundle_media( $base_url, $bundle['media'] );
			}

			return true;
		}

		/**
		 * Prime source post caches grouped by post type.
		 *
		 * @param string $base_url      Source SCE REST base URL.
		 * @param array  $posts_by_type Posts grouped by source post type.
		 *
		 * @return void
		 */
		private function prime_layout_bundle_posts( $base_url, $posts_by_type ) {
			foreach ( (array) $posts_by_type as $post_type => $posts ) {
				$post_type = sanitize_key( $post_type );
				$posts     = $this->normalize_layout_bundle_items( $posts );
				if ( empty( $post_type ) || empty( $posts ) ) {
					continue;
				}

				$cache_key = array( 'posts', $base_url, $post_type, array() );
				$cached    = $this->get_cached_layout_source( $cache_key );
				$merged    = array();

				foreach ( is_array( $cached ) ? $cached : array() as $post ) {
					if ( ! empty( $post['ID'] ) ) {
						$merged[ absint( $post['ID'] ) ] = $post;
					}
				}

				foreach ( $posts as $post ) {
					if ( empty( $post['ID'] ) ) {
						continue;
					}

					$post_id             = absint( $post['ID'] );
					$merged[ $post_id ]  = $post;
					$this->set_cached_layout_source( array( 'posts', $base_url, $post_type, array( $post_id ) ), array( $post ) );
				}

				if ( ! empty( $merged ) ) {
					ksort( $merged );
					$this->set_cached_layout_source( $cache_key, array_values( $merged ) );
				}
			}
		}

		/**
		 * Prime source term caches grouped by taxonomy.
		 *
		 * @param string $base_url          Source SCE REST base URL.
		 * @param array  $terms_by_taxonomy Terms grouped by taxonomy.
		 *
		 * @return void
		 */
		private function prime_layout_bundle_terms( $base_url, $terms_by_taxonomy ) {
			foreach ( (array) $terms_by_taxonomy as $taxonomy => $terms ) {
				$taxonomy = sanitize_key( $taxonomy );
				$terms    = $this->normalize_layout_bundle_items( $terms );
				if ( empty( $taxonomy ) || empty( $terms ) ) {
					continue;
				}

				$ids = array();
				foreach ( $terms as $term ) {
					if ( ! empty( $term['term_id'] ) ) {
						$ids[] = absint( $term['term_id'] );
					}
				}

				$ids = $this->normalize_layout_source_include_ids( $ids );
				if ( ! empty( $ids ) ) {
					$this->set_cached_layout_source( array( 'terms', $base_url, $taxonomy, $ids ), $terms );
				}
			}
		}

		/**
		 * Prime source object caches grouped by object type.
		 *
		 * @param string $base_url        Source SCE REST base URL.
		 * @param array  $objects_by_type Objects grouped by source object type.
		 *
		 * @return void
		 */
		private function prime_layout_bundle_objects( $base_url, $objects_by_type ) {
			$site_url = $this->get_layout_source_site_url( $base_url );
			if ( empty( $site_url ) ) {
				return;
			}

			foreach ( (array) $objects_by_type as $object_type => $objects ) {
				$object_type = sanitize_key( $object_type );
				$objects     = $this->normalize_layout_bundle_items( $objects );
				if ( empty( $object_type ) || empty( $objects ) ) {
					continue;
				}

				foreach ( $objects as $object ) {
					$object_id = isset( $object['id'] ) ? absint( $object['id'] ) : ( isset( $object['ID'] ) ? absint( $object['ID'] ) : 0 );
					$url       = ! empty( $object['link'] ) ? $object['link'] : ( ! empty( $object['url'] ) ? $object['url'] : '' );
					if ( empty( $object_id ) || empty( $url ) ) {
						continue;
					}

					$title = '';
					if ( ! empty( $object['title']['rendered'] ) ) {
						$title = html_entity_decode( wp_strip_all_tags( $object['title']['rendered'] ), ENT_QUOTES, get_bloginfo( 'charset' ) );
					} elseif ( ! empty( $object['title'] ) && is_string( $object['title'] ) ) {
						$title = html_entity_decode( wp_strip_all_tags( $object['title'] ), ENT_QUOTES, get_bloginfo( 'charset' ) );
					}

					$this->set_cached_layout_source(
						array( 'object', $base_url, $object_type, $object_id ),
						array(
							'title' => $title,
							'url'   => $this->rebase_layout_source_url( $url, $site_url ),
						),
						true
					);
				}
			}
		}

		/**
		 * Prime source media URL cache.
		 *
		 * @param string $base_url Source SCE REST base URL.
		 * @param array  $media    Media descriptors.
		 *
		 * @return void
		 */
		private function prime_layout_bundle_media( $base_url, $media ) {
			foreach ( $this->normalize_layout_bundle_items( $media ) as $item ) {
				$media_id   = isset( $item['id'] ) ? absint( $item['id'] ) : ( isset( $item['ID'] ) ? absint( $item['ID'] ) : 0 );
				$source_url = ! empty( $item['source_url'] ) ? esc_url_raw( $item['source_url'] ) : '';
				if ( empty( $media_id ) || empty( $source_url ) ) {
					continue;
				}

				$this->set_cached_layout_source(
					array( 'media', $base_url, $media_id ),
					array( 'source_url' => $source_url )
				);
			}
		}

		/**
		 * Temporarily serve selected SCE HTTP requests from already-fetched source data.
		 *
		 * @param array    $handlers Cached response descriptors.
		 * @param callable $callback Import callback to run while the cache shim is active.
		 *
		 * @return mixed
		 */
		private function with_cached_layout_source_http( $handlers, $callback ) {
			if ( empty( $handlers ) || ! is_callable( $callback ) ) {
				return is_callable( $callback ) ? call_user_func( $callback ) : null;
			}

			$filter = function ( $preempt, $args, $url ) use ( $handlers ) {
				if ( false !== $preempt ) {
					return $preempt;
				}

				foreach ( $handlers as $handler ) {
					$response = $this->get_cached_layout_source_http_response( $handler, $args, $url );
					if ( false !== $response ) {
						return $response;
					}
				}

				return false;
			};

			add_filter( 'pre_http_request', $filter, 10, 3 );
			try {
				return call_user_func( $callback );
			} finally {
				remove_filter( 'pre_http_request', $filter, 10 );
			}
		}

		/**
		 * Build a fake wp_remote_request() response when a cached handler matches.
		 *
		 * @param array  $handler Cached response descriptor.
		 * @param array  $args    HTTP request args.
		 * @param string $url     HTTP URL.
		 *
		 * @return array|false
		 */
		private function get_cached_layout_source_http_response( $handler, $args, $url ) {
			if ( empty( $handler['base_url'] ) || empty( $handler['endpoint'] ) || empty( $handler['match_key'] ) || empty( $handler['data_key'] ) ) {
				return false;
			}

			$expected_url = trailingslashit( esc_url_raw( $handler['base_url'] ) ) . sanitize_key( $handler['endpoint'] );
			if ( $url !== $expected_url ) {
				return false;
			}

			$body        = isset( $args['body'] ) && is_array( $args['body'] ) ? $args['body'] : array();
			$match_key   = (string) $handler['match_key'];
			$match_value = isset( $handler['match_value'] ) ? sanitize_key( $handler['match_value'] ) : '';
			if ( empty( $body[ $match_key ] ) || sanitize_key( $body[ $match_key ] ) !== $match_value ) {
				return false;
			}

			$expected_include = $this->normalize_layout_source_include_ids( isset( $handler['include'] ) ? $handler['include'] : array() );
			$actual_include   = $this->normalize_layout_source_include_ids( isset( $body['include'] ) ? $body['include'] : array() );
			if ( $expected_include !== $actual_include ) {
				return false;
			}

			return array(
				'headers'  => array(),
				'body'     => wp_json_encode( array(
					'code'    => 'success',
					'message' => '',
					'data'    => array(
						(string) $handler['data_key'] => array_values( isset( $handler['data'] ) && is_array( $handler['data'] ) ? $handler['data'] : array() ),
					),
				) ),
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
				'cookies'  => array(),
			);
		}

		/**
		 * Fetch source starter metadata from the existing v2 SCE data endpoint.
	 *
	 * @param string $base_url Source SCE REST base URL.
	 *
		 * @return array|WP_Error Source data on success.
		 */
		private function fetch_layout_source_data( $base_url ) {
			$base_url = trailingslashit( esc_url_raw( $base_url ) );
			$cache    = array( 'data', $base_url );
			$cached   = $this->get_cached_layout_source( $cache );
			if ( false !== $cached ) {
				return $cached;
			}

			$response = wp_remote_get(
				$base_url . 'data',
				array(
					'timeout'   => 15,
					'sslverify' => true,
				)
			);

			$data = $this->parse_layout_source_response( $response, 'data' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}

			return $this->set_cached_layout_source( $cache, $data );
		}

		/**
		 * Fetch a compact source-provided layout unit list when available.
		 *
		 * @param string $base_url Source SCE REST base URL.
		 *
		 * @return array|WP_Error Normalized layout unit descriptors on success.
		 */
		private function fetch_layout_source_unit_list( $base_url ) {
			$base_url = trailingslashit( esc_url_raw( $base_url ) );
			$cache    = array( 'layout_units', $base_url );
			$cached   = $this->get_cached_layout_source( $cache );
			if ( false !== $cached ) {
				return $cached;
			}

			$response = wp_remote_get(
				$base_url . 'layout-units',
				array(
					'timeout'   => 10,
					'sslverify' => true,
				)
			);

			$data = $this->parse_layout_source_response( $response, 'units' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}

			$units = $this->normalize_layout_source_units( isset( $data['units'] ) ? $data['units'] : array() );
			if ( empty( $units ) ) {
				return new WP_Error( 'layout_units_empty', esc_html__( 'The layout source did not return units.', '__plugin_txtd' ) );
			}

			return $this->set_cached_layout_source( $cache, $units );
		}

		/**
		 * Normalize source-provided layout unit descriptors.
		 *
		 * @param array $units Source units.
		 *
		 * @return array
		 */
		private function normalize_layout_source_units( $units ) {
			$normalized = array();
			$seen       = array();

			foreach ( (array) $units as $unit ) {
				if ( empty( $unit ) || ! is_array( $unit ) ) {
					continue;
				}

				$type = isset( $unit['type'] ) ? sanitize_key( $unit['type'] ) : '';
				$slug = isset( $unit['slug'] ) ? sanitize_key( $unit['slug'] ) : '';
				$id   = isset( $unit['id'] ) ? absint( $unit['id'] ) : 0;
				if ( empty( $type ) || empty( $slug ) ) {
					continue;
				}

				$key = $type . ':' . $slug;
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}

				$entry = array(
					'id'    => $id ? $id : $slug,
					'type'  => $type,
					'slug'  => $slug,
					'title' => ! empty( $unit['title'] ) ? wp_strip_all_tags( $unit['title'] ) : $slug,
				);

				if ( isset( $unit['sampleDefault'] ) ) {
					$entry['sampleDefault'] = (bool) $unit['sampleDefault'];
				}
				if ( isset( $unit['sampleCount'] ) ) {
					$entry['sampleCount'] = absint( $unit['sampleCount'] );
				}

				$normalized[] = $entry;
				$seen[ $key ] = true;
			}

			return $normalized;
		}

	/**
	 * Fetch source posts for a post type from the existing v2 SCE posts endpoint.
	 *
	 * Passing an empty include value asks the current exporter for all posts of that type.
	 *
	 * @param string       $base_url  Source SCE REST base URL.
	 * @param string       $post_type Source post type.
	 * @param array|string $include   Optional source post IDs.
	 *
		 * @return array|WP_Error Source posts on success.
		 */
		private function fetch_layout_source_posts( $base_url, $post_type, $include = '' ) {
			$base_url    = trailingslashit( esc_url_raw( $base_url ) );
			$post_type   = sanitize_key( $post_type );
			$include_ids = $this->normalize_layout_source_include_ids( $include );
			$include     = empty( $include_ids ) ? '' : $include_ids;
			$cache       = array( 'posts', $base_url, $post_type, $include_ids );
			$cached      = $this->get_cached_layout_source( $cache );
			if ( false !== $cached ) {
				return $cached;
			}

			$response = wp_remote_request(
				$base_url . 'posts',
				array(
					'method'    => 'POST',
					'timeout'   => 15,
					'blocking'  => true,
					'body'      => array(
						'post_type' => $post_type,
						'include'   => $include,
					),
					'sslverify' => true,
			)
		);

		$data = $this->parse_layout_source_response( $response, 'posts' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}

			$posts = isset( $data['posts'] ) && is_array( $data['posts'] ) ? $data['posts'] : array();

			return $this->set_cached_layout_source( $cache, $posts );
		}

	/**
	 * Fetch source terms from the existing v2 SCE terms endpoint.
	 *
	 * @param string $base_url Source SCE REST base URL.
	 * @param string $taxonomy Source taxonomy.
	 * @param array  $include  Source term IDs.
	 *
		 * @return array|WP_Error Source terms on success.
		 */
		private function fetch_layout_source_terms( $base_url, $taxonomy, $include ) {
			$base_url    = trailingslashit( esc_url_raw( $base_url ) );
			$taxonomy    = sanitize_key( $taxonomy );
			$include_ids = $this->normalize_layout_source_include_ids( $include );
			$cache       = array( 'terms', $base_url, $taxonomy, $include_ids );
			$cached      = $this->get_cached_layout_source( $cache );
			if ( false !== $cached ) {
				return $cached;
			}

			$response = wp_remote_request(
				$base_url . 'terms',
				array(
					'method'    => 'POST',
					'timeout'   => 15,
					'blocking'  => true,
					'body'      => array(
						'taxonomy' => $taxonomy,
						'include'  => $include_ids,
					),
					'sslverify' => true,
			)
		);

		$data = $this->parse_layout_source_response( $response, 'terms' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}

			$terms = isset( $data['terms'] ) && is_array( $data['terms'] ) ? $data['terms'] : array();

			return $this->set_cached_layout_source( $cache, $terms );
		}

	/**
	 * Parse a v2 SCE response.
	 *
	 * @param array|WP_Error $response HTTP response.
	 * @param string         $expected Expected data key.
	 *
	 * @return array|WP_Error Parsed data on success.
	 */
	private function parse_layout_source_response( $response, $expected ) {
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = (int) wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status ) {
			return new WP_Error(
				'layout_source_http_error',
				esc_html__( 'The layout source could not be reached.', '__plugin_txtd' ),
				array( 'status' => $status )
			);
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( null === $data || empty( $data['code'] ) || 'success' !== $data['code'] || ! isset( $data['data'] ) || ! is_array( $data['data'] ) ) {
			return new WP_Error(
				'layout_source_invalid_response',
				esc_html__( 'The layout source returned invalid data.', '__plugin_txtd' )
			);
		}

		if ( ! isset( $data['data'][ $expected ] ) && 'data' !== $expected ) {
			return new WP_Error(
				'layout_source_missing_data',
				esc_html__( 'The layout source response is missing required data.', '__plugin_txtd' )
			);
		}

		return 'data' === $expected ? $data['data'] : $data['data'];
	}

	/**
	 * Find one source layout unit by ID or slug.
	 *
	 * @param array      $posts Source posts.
	 * @param int|string $unit  Source ID or slug.
	 *
	 * @return array|null
	 */
	private function find_layout_unit_post( $posts, $unit ) {
		$unit_slug = sanitize_key( $unit );
		$unit_id   = absint( $unit );

		foreach ( (array) $posts as $post ) {
			if ( ! is_array( $post ) || empty( $post['ID'] ) ) {
				continue;
			}

			if ( $unit_id && (int) $post['ID'] === $unit_id ) {
				return $post;
			}

			if ( ! empty( $post['post_name'] ) && sanitize_key( $post['post_name'] ) === $unit_slug ) {
				return $post;
			}
		}

		return null;
	}

	/**
	 * Import nav-menu dependencies used by a layout unit.
	 *
	 * @param string $demo_key    Starter/demo key.
	 * @param string $base_url    Source SCE REST base URL.
	 * @param array  $source_data Source starter data.
	 * @param array  $unit_post   Source layout unit post.
	 *
	 * @return array|WP_Error Dependency summary.
	 */
		private function import_layout_unit_menu_dependencies( $demo_key, $base_url, $source_data, $unit_post ) {
		$slugs = $this->extract_layout_navigation_slugs( isset( $unit_post['post_content'] ) ? $unit_post['post_content'] : '' );
		if ( empty( $slugs ) ) {
			return array(
				'navMenus'      => 0,
				'menuItems'     => 0,
				'locationSlugs' => array(),
			);
		}

		$locations = isset( $source_data['post_settings']['mods']['nav_menu_locations'] ) && is_array( $source_data['post_settings']['mods']['nav_menu_locations'] )
			? $source_data['post_settings']['mods']['nav_menu_locations']
			: array();

		$menu_ids       = array();
		$location_slugs = array();
		foreach ( $slugs as $slug ) {
			if ( isset( $locations[ $slug ] ) ) {
				$menu_ids[]       = absint( $locations[ $slug ] );
				$location_slugs[] = $slug;
			}
		}

		$menu_ids       = array_values( array_unique( array_filter( $menu_ids ) ) );
		$location_slugs = array_values( array_unique( array_filter( $location_slugs ) ) );
		if ( empty( $menu_ids ) ) {
			return array(
				'navMenus'      => 0,
				'menuItems'     => 0,
				'locationSlugs' => array(),
			);
		}

		$source_terms = $this->fetch_layout_source_terms( $base_url, 'nav_menu', $menu_ids );
		if ( is_wp_error( $source_terms ) ) {
			return $source_terms;
		}

		$term_names = array();
		foreach ( $source_terms as $term ) {
			if ( ! empty( $term['name'] ) ) {
				$term_names[] = (string) $term['name'];
			}
			if ( ! empty( $term['slug'] ) ) {
				$term_names[] = (string) $term['slug'];
			}
		}
		$term_names = array_values( array_unique( array_filter( $term_names ) ) );

			$term_import = $this->with_cached_layout_source_http(
				array(
					array(
						'base_url'   => $base_url,
						'endpoint'   => 'terms',
						'match_key'  => 'taxonomy',
						'match_value' => 'nav_menu',
						'include'    => $menu_ids,
						'data_key'   => 'terms',
						'data'       => $source_terms,
					),
				),
				function () use ( $demo_key, $base_url, $menu_ids ) {
					return $this->import_taxonomy( $demo_key, $base_url, array(
						'tax' => 'nav_menu',
						'ids' => $menu_ids,
					) );
				}
			);
		if ( is_wp_error( $term_import ) ) {
			return $term_import;
		}
		if ( $term_import instanceof WP_REST_Response ) {
			return new WP_Error( 'layout_menu_import_failed', esc_html__( 'The layout menu could not be imported.', '__plugin_txtd' ) );
		}

		$source_items = $this->fetch_layout_source_posts( $base_url, 'nav_menu_item' );
		if ( is_wp_error( $source_items ) ) {
			return $source_items;
		}

		$menu_item_ids = array();
		foreach ( $source_items as $source_item ) {
			if ( $this->layout_post_belongs_to_nav_terms( $source_item, $menu_ids, $term_names ) ) {
				$menu_item_ids[] = absint( $source_item['ID'] );
			}
			}
			$menu_item_ids = array_values( array_unique( array_filter( $menu_item_ids ) ) );
			if ( empty( $menu_item_ids ) ) {
				return array(
					'navMenus'      => count( $term_import ),
					'menuItems'     => 0,
					'locationSlugs' => $location_slugs,
				);
			}

			$this->prime_layout_menu_item_targets( $base_url, $source_items, $menu_item_ids );
			$selected_source_items = array_values(
				array_filter(
					$source_items,
					function ( $source_item ) use ( $menu_item_ids ) {
						return ! empty( $source_item['ID'] ) && in_array( absint( $source_item['ID'] ), $menu_item_ids, true );
					}
				)
			);

			$menu_filter = function ( $post_args, $post ) use ( $base_url ) {
				return $this->normalize_layout_menu_item_args( $post_args, $post, $base_url );
			};
		$menu_finalizer = function ( $post, $imported_ids ) use ( $base_url ) {
			$this->finalize_layout_menu_item_custom_link( $post, $imported_ids, $base_url );
		};
		add_filter( 'pixassist_sce_insert_post_args', $menu_filter, 10, 2 );
			add_action( 'pixassist_sce_after_insert_post', $menu_finalizer, 20, 3 );

			try {
				$items_import = $this->with_cached_layout_source_http(
					array(
						array(
							'base_url'   => $base_url,
							'endpoint'   => 'posts',
							'match_key'  => 'post_type',
							'match_value' => 'nav_menu_item',
							'include'    => $menu_item_ids,
							'data_key'   => 'posts',
							'data'       => $selected_source_items,
						),
					),
					function () use ( $demo_key, $base_url, $menu_item_ids ) {
						return $this->import_post_type( $demo_key, $base_url, array(
							'post_type' => 'nav_menu_item',
							'ids'       => $menu_item_ids,
						) );
					}
				);
			} finally {
				remove_filter( 'pixassist_sce_insert_post_args', $menu_filter, 10 );
				remove_action( 'pixassist_sce_after_insert_post', $menu_finalizer, 20 );
		}

		if ( is_wp_error( $items_import ) ) {
			return $items_import;
		}
		if ( $items_import instanceof WP_REST_Response ) {
			return new WP_Error( 'layout_menu_item_import_failed', esc_html__( 'The layout menu items could not be imported.', '__plugin_txtd' ) );
		}

			return array(
				'navMenus'      => count( $term_import ),
				'menuItems'     => count( $items_import ),
				'locationSlugs' => $location_slugs,
			);
		}

		/**
		 * Import media IDs referenced directly by a layout unit.
	 *
	 * @param string $demo_key  Starter/demo key.
	 * @param array  $unit_post Source layout unit post.
	 *
	 * @return array|WP_Error Dependency summary.
	 */
	private function import_layout_unit_media_dependencies( $demo_key, $unit_post ) {
		$media_ids = $this->extract_layout_media_ids( isset( $unit_post['post_content'] ) ? $unit_post['post_content'] : '' );
		if ( empty( $media_ids ) ) {
			return array( 'media' => 0 );
		}

		$imported = 0;
		foreach ( $media_ids as $media_id ) {
			if ( $this->layout_media_id_is_imported( $demo_key, $media_id ) ) {
				continue;
			}

			$local_id = $this->sideload_demo_attachment( $media_id, $demo_key );
			if ( ! empty( $local_id ) ) {
				$imported++;
			}
		}

		return array( 'media' => $imported );
	}

	/**
	 * Import theme settings required by a layout unit.
	 *
	 * @param string $demo_key       Starter/demo key.
	 * @param array  $source_data    Source starter data.
	 * @param array  $unit_post      Source layout unit post.
	 * @param array  $location_slugs Navigation location slugs to import.
	 *
	 * @return array|WP_Error Dependency summary.
	 */
	private function import_layout_unit_settings( $demo_key, $source_data, $unit_post, $location_slugs ) {
		$source_mods = isset( $source_data['post_settings']['mods'] ) && is_array( $source_data['post_settings']['mods'] )
			? $source_data['post_settings']['mods']
			: array();

		$mods = array();

		if ( ! empty( $location_slugs ) && ! empty( $source_mods['nav_menu_locations'] ) && is_array( $source_mods['nav_menu_locations'] ) ) {
			$mods['nav_menu_locations'] = get_theme_mod( 'nav_menu_locations', array() );
			if ( ! is_array( $mods['nav_menu_locations'] ) ) {
				$mods['nav_menu_locations'] = array();
			}

			foreach ( $location_slugs as $slug ) {
				if ( isset( $source_mods['nav_menu_locations'][ $slug ] ) ) {
					$mods['nav_menu_locations'][ $slug ] = $source_mods['nav_menu_locations'][ $slug ];
				}
			}
			if ( empty( $mods['nav_menu_locations'] ) ) {
				unset( $mods['nav_menu_locations'] );
			}
		}

		$logo_keys = array( 'custom_logo', 'anima_transparent_logo', 'pixelgrade_transparent_logo', 'osteria_transparent_logo' );
		$logo_count = 0;
		if ( $this->layout_unit_uses_logo( $unit_post ) ) {
			foreach ( $logo_keys as $key ) {
				if ( ! empty( $source_mods[ $key ] ) ) {
					$mods[ $key ] = $source_mods[ $key ];
					$logo_count++;
				}
			}
		}

		if ( empty( $mods ) ) {
			return array( 'logos' => 0 );
		}

		$result = $this->import_settings(
			$demo_key,
			'post',
			array(
				'mods' => $mods,
			),
			false
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		if ( $result instanceof WP_REST_Response ) {
			return new WP_Error( 'layout_settings_import_failed', esc_html__( 'The layout settings could not be imported.', '__plugin_txtd' ) );
		}

		return array(
			'logos'         => $logo_count,
			'locationSlugs' => array_values( array_unique( array_map( 'sanitize_key', (array) $location_slugs ) ) ),
		);
	}

	/**
	 * Whether a source nav-menu item belongs to one of the selected menus.
	 *
	 * @param array $post       Source menu-item post.
	 * @param array $menu_ids   Source menu term IDs.
	 * @param array $term_names Source menu names/slugs.
	 *
	 * @return bool
	 */
		private function layout_post_belongs_to_nav_terms( $post, $menu_ids, $term_names ) {
		if ( empty( $post['taxonomies']['nav_menu'] ) || ! is_array( $post['taxonomies']['nav_menu'] ) ) {
			return false;
		}

		foreach ( $post['taxonomies']['nav_menu'] as $term ) {
			if ( is_numeric( $term ) && in_array( absint( $term ), $menu_ids, true ) ) {
				return true;
			}

			if ( in_array( (string) $term, $term_names, true ) ) {
				return true;
			}
		}

			return false;
		}

		/**
		 * Prime remote WP REST objects for post_type menu items in one request per object type.
		 *
		 * @param string $base_url      Source SCE REST base URL.
		 * @param array  $source_items  Source nav_menu_item posts.
		 * @param array  $menu_item_ids Selected source menu item IDs.
		 *
		 * @return void
		 */
		private function prime_layout_menu_item_targets( $base_url, $source_items, $menu_item_ids ) {
			$base_url = trailingslashit( esc_url_raw( $base_url ) );
			$selected = array_flip( array_map( 'absint', (array) $menu_item_ids ) );
			if ( empty( $selected ) ) {
				return;
			}

			$groups = array();
			foreach ( (array) $source_items as $source_item ) {
				if ( empty( $source_item['ID'] ) || ! isset( $selected[ absint( $source_item['ID'] ) ] ) ) {
					continue;
				}

				$type = $this->layout_post_meta_value( $source_item, '_menu_item_type' );
				if ( 'post_type' !== $type ) {
					continue;
				}

				$object    = sanitize_key( $this->layout_post_meta_value( $source_item, '_menu_item_object' ) );
				$object_id = absint( $this->layout_post_meta_value( $source_item, '_menu_item_object_id' ) );
				if ( empty( $object ) || empty( $object_id ) ) {
					continue;
				}

				if ( empty( $groups[ $object ] ) ) {
					$groups[ $object ] = array();
				}
				$groups[ $object ][] = $object_id;
			}

			if ( empty( $groups ) ) {
				return;
			}

			$site_url = $this->get_layout_source_site_url( $base_url );
			if ( empty( $site_url ) ) {
				return;
			}

			$rest_base = array(
				'page' => 'pages',
				'post' => 'posts',
			);

			foreach ( $groups as $object_type => $object_ids ) {
				$object_ids = array_values( array_unique( array_filter( array_map( 'absint', $object_ids ) ) ) );
				if ( empty( $object_ids ) ) {
					continue;
				}

				$missing_ids = array();
				foreach ( $object_ids as $object_id ) {
					$cached = $this->get_cached_layout_source( array( 'object', $base_url, sanitize_key( $object_type ), $object_id ), true );
					if ( false === $cached ) {
						$missing_ids[] = $object_id;
					}
				}

				$object_ids = $missing_ids;
				if ( empty( $object_ids ) ) {
					continue;
				}

				$endpoint = isset( $rest_base[ $object_type ] ) ? $rest_base[ $object_type ] : $object_type . 's';
				$url      = trailingslashit( $site_url ) . 'wp-json/wp/v2/' . sanitize_key( $endpoint )
					. '?include=' . rawurlencode( implode( ',', $object_ids ) )
					. '&per_page=100&_fields=id,link,title';

				$response = wp_remote_get(
					$url,
					array(
						'timeout'   => 15,
						'sslverify' => true,
					)
				);
				if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
					continue;
				}

				$data = json_decode( wp_remote_retrieve_body( $response ), true );
				if ( empty( $data ) || ! is_array( $data ) ) {
					continue;
				}

				foreach ( $data as $item ) {
					if ( empty( $item['id'] ) || empty( $item['link'] ) ) {
						continue;
					}

					$title = '';
					if ( ! empty( $item['title']['rendered'] ) ) {
						$title = html_entity_decode( wp_strip_all_tags( $item['title']['rendered'] ), ENT_QUOTES, get_bloginfo( 'charset' ) );
					}

					$this->set_cached_layout_source(
						array( 'object', trailingslashit( esc_url_raw( $base_url ) ), sanitize_key( $object_type ), absint( $item['id'] ) ),
						array(
							'title' => $title,
							'url'   => $this->rebase_layout_source_url( $item['link'], $site_url ),
						),
						true
					);
				}
			}
		}

		/**
		 * Convert unimported post-object menu items to custom links.
	 *
	 * Layout-only imports intentionally avoid importing pages/posts/projects. If a source menu item
	 * points at one of those objects, preserve its label and URL as a custom link instead of leaving a
	 * dangling object ID.
	 *
	 * @param array  $post_args Prepared wp_insert_post() args.
	 * @param array  $post      Source menu-item post.
	 * @param string $base_url  Source SCE REST base URL.
	 *
	 * @return array
	 */
	private function normalize_layout_menu_item_args( $post_args, $post, $base_url ) {
		$target = $this->get_layout_menu_item_custom_target( $post, $base_url );
		if ( is_wp_error( $target ) || empty( $target['title'] ) || empty( $target['url'] ) ) {
			return $post_args;
		}

		$post_args['post_title'] = $target['title'];

		if ( empty( $post_args['meta_input'] ) || ! is_array( $post_args['meta_input'] ) ) {
			$post_args['meta_input'] = array();
		}

		$post_args['meta_input']['_menu_item_type']      = 'custom';
		$post_args['meta_input']['_menu_item_object']    = 'custom';
		$post_args['meta_input']['_menu_item_object_id'] = isset( $post['ID'] ) ? (string) $post['ID'] : '0';
		$post_args['meta_input']['_menu_item_url']       = $target['url'];

		return $post_args;
	}

	/**
	 * Keep layout-only menu items as custom links after the default menu remapper runs.
	 *
	 * @param array  $post         Source menu-item post.
	 * @param array  $imported_ids Source-to-local imported IDs for this import pass.
	 * @param string $base_url     Source SCE REST base URL.
	 *
	 * @return void
	 */
	private function finalize_layout_menu_item_custom_link( $post, $imported_ids, $base_url ) {
		if ( empty( $post['ID'] ) || empty( $imported_ids[ $post['ID'] ] ) ) {
			return;
		}

		$target = $this->get_layout_menu_item_custom_target( $post, $base_url );
		if ( empty( $target ) || is_wp_error( $target ) ) {
			return;
		}

		$post_id = absint( $imported_ids[ $post['ID'] ] );
		update_post_meta( $post_id, '_menu_item_type', 'custom' );
		update_post_meta( $post_id, '_menu_item_object', 'custom' );
		update_post_meta( $post_id, '_menu_item_object_id', (string) absint( $post['ID'] ) );
		update_post_meta( $post_id, '_menu_item_url', esc_url_raw( $target['url'] ) );

		if ( ! empty( $target['title'] ) ) {
			wp_update_post( array(
				'ID'         => $post_id,
				'post_title' => $target['title'],
			) );
		}
	}

	/**
	 * Resolve an unimported source object referenced by a source menu item.
	 *
	 * @param array  $post     Source menu-item post.
	 * @param string $base_url Source SCE REST base URL.
	 *
	 * @return array|WP_Error|null { title, url } on success.
	 */
	private function get_layout_menu_item_custom_target( $post, $base_url ) {
		if ( empty( $post['post_type'] ) || 'nav_menu_item' !== $post['post_type'] ) {
			return null;
		}

		$type = $this->layout_post_meta_value( $post, '_menu_item_type' );
		if ( 'post_type' !== $type ) {
			return null;
		}

		$object    = sanitize_key( $this->layout_post_meta_value( $post, '_menu_item_object' ) );
		$object_id = absint( $this->layout_post_meta_value( $post, '_menu_item_object_id' ) );
		if ( empty( $object ) || empty( $object_id ) ) {
			return null;
		}

		return $this->fetch_layout_source_object( $base_url, $object, $object_id );
	}

	/**
	 * Fetch a source object referenced by a menu item.
	 *
	 * @param string $base_url    Source SCE REST base URL.
	 * @param string $object_type Source object type.
	 * @param int    $object_id   Source object ID.
	 *
	 * @return array|WP_Error { title, url } on success.
	 */
		private function fetch_layout_source_object( $base_url, $object_type, $object_id ) {
			$base_url    = trailingslashit( esc_url_raw( $base_url ) );
			$object_type = sanitize_key( $object_type );
			$object_id   = absint( $object_id );
			$cache       = array( 'object', $base_url, $object_type, $object_id );
			$cached      = $this->get_cached_layout_source( $cache, true );
			if ( false !== $cached ) {
				return $cached;
			}

			$rest_base = array(
				'page' => 'pages',
				'post' => 'posts',
			);

		$endpoint = isset( $rest_base[ $object_type ] ) ? $rest_base[ $object_type ] : $object_type . 's';
		$site_url = $this->get_layout_source_site_url( $base_url );
		if ( empty( $site_url ) ) {
			return new WP_Error( 'layout_source_site_missing', esc_html__( 'The layout source site could not be resolved.', '__plugin_txtd' ) );
		}

		$response = wp_remote_get(
			trailingslashit( $site_url ) . 'wp-json/wp/v2/' . sanitize_key( $endpoint ) . '/' . absint( $object_id ),
			array(
				'timeout'   => 15,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return new WP_Error( 'layout_source_object_missing', esc_html__( 'The menu item target could not be resolved.', '__plugin_txtd' ) );
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( empty( $data ) || ! is_array( $data ) ) {
			return new WP_Error( 'layout_source_object_invalid', esc_html__( 'The menu item target response is invalid.', '__plugin_txtd' ) );
		}

		$title = '';
		if ( ! empty( $data['title']['rendered'] ) ) {
			$title = html_entity_decode( wp_strip_all_tags( $data['title']['rendered'] ), ENT_QUOTES, get_bloginfo( 'charset' ) );
		}

			$target = array(
				'title' => $title,
				'url'   => ! empty( $data['link'] ) ? $this->rebase_layout_source_url( $data['link'], $site_url ) : '',
			);

			return $this->set_cached_layout_source( $cache, $target, true );
		}

	/**
	 * Extract Nova/Core navigation slugs from block comments.
	 *
	 * @param string $content Block content.
	 *
	 * @return string[] Navigation slugs.
	 */
	private function extract_layout_navigation_slugs( $content ) {
		$slugs = array();

		if ( ! is_string( $content ) || '' === $content ) {
			return $slugs;
		}

		if ( ! preg_match_all( '/<!--\s+wp:(?:novablocks\/navigation|navigation)\s+({.*?})?\s*(?:\/-->|-->)/', $content, $matches ) ) {
			return $slugs;
		}

		foreach ( $matches[1] as $attributes ) {
			if ( empty( $attributes ) ) {
				continue;
			}

			$decoded = json_decode( $attributes, true );
			if ( ! is_array( $decoded ) || empty( $decoded['slug'] ) ) {
				continue;
			}

			$slugs[] = sanitize_key( $decoded['slug'] );
		}

		return array_values( array_unique( array_filter( $slugs ) ) );
	}

	/**
	 * Whether a layout unit uses the site logo.
	 *
	 * @param array $unit_post Source layout unit post.
	 *
	 * @return bool
	 */
	private function layout_unit_uses_logo( $unit_post ) {
		$content = isset( $unit_post['post_content'] ) ? (string) $unit_post['post_content'] : '';

		return false !== strpos( $content, 'novablocks/logo' ) || false !== strpos( $content, 'site-logo' );
	}

	/**
	 * Extract attachment IDs directly referenced by layout block content.
	 *
	 * @param string $content Block content.
	 *
	 * @return int[] Media IDs.
	 */
	private function extract_layout_media_ids( $content ) {
		$ids = array();

		if ( ! is_string( $content ) || '' === $content ) {
			return $ids;
		}

		if ( preg_match_all( '/\bwp-image-(\d+)\b/', $content, $matches ) ) {
			$ids = array_merge( $ids, array_map( 'absint', $matches[1] ) );
		}

		if ( preg_match_all( '/<!--\s+wp:([^\s]+)\s+({.*?})\s*(?:\/-->|-->)/', $content, $matches ) ) {
			foreach ( $matches[2] as $index => $attributes ) {
				$decoded = json_decode( $attributes, true );
				if ( is_array( $decoded ) ) {
					$ids = array_merge( $ids, $this->extract_layout_media_ids_from_attributes( $decoded, isset( $matches[1][ $index ] ) ? $matches[1][ $index ] : '' ) );
				}
			}
		}

		$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
		sort( $ids );

		return $ids;
	}

	/**
	 * Recursively extract media-like IDs from block attributes.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $block_name Block name.
	 *
	 * @return int[] Media IDs.
	 */
	private function extract_layout_media_ids_from_attributes( $attributes, $block_name = '' ) {
		$ids                 = array();
		$specific_media_keys = array( 'mediaId', 'mediaID', 'imageId', 'imageID', 'attachmentId', 'attachmentID', 'backgroundImageId', 'backgroundMediaId', 'logoId', 'logoID' );
		$generic_id_blocks   = array( 'image', 'cover', 'gallery', 'media-text', 'video', 'audio', 'file' );
		$block_name          = sanitize_key( $block_name );
		$can_use_generic_id  = in_array( $block_name, $generic_id_blocks, true ) || false !== strpos( $block_name, 'gallery' ) || false !== strpos( $block_name, 'image' ) || false !== strpos( $block_name, 'media' );

		foreach ( $attributes as $key => $value ) {
			if ( is_array( $value ) ) {
				$ids = array_merge( $ids, $this->extract_layout_media_ids_from_attributes( $value, $block_name ) );
				continue;
			}

			$is_media_key = in_array( (string) $key, $specific_media_keys, true ) || ( $can_use_generic_id && 'id' === (string) $key );
			if ( is_scalar( $value ) && $is_media_key && is_numeric( $value ) ) {
				$ids[] = absint( $value );
			}
		}

		return $ids;
	}

	/**
	 * Whether a source media ID already has a local journal mapping.
	 *
	 * @param string $demo_key Starter/demo key.
	 * @param int    $media_id Source media ID.
	 *
	 * @return bool
	 */
	private function layout_media_id_is_imported( $demo_key, $media_id ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( empty( $starter_content[ $demo_key ]['media'] ) || ! is_array( $starter_content[ $demo_key ]['media'] ) ) {
			return false;
		}

		foreach ( array( 'ignored', 'placeholders' ) as $group ) {
			if ( ! empty( $starter_content[ $demo_key ]['media'][ $group ][ $media_id ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Read a source post meta value from the exporter shape.
	 *
	 * @param array  $post Source post.
	 * @param string $key  Meta key.
	 *
	 * @return mixed
	 */
	private function layout_post_meta_value( $post, $key ) {
		if ( empty( $post['meta'][ $key ] ) ) {
			return '';
		}

		$value = $post['meta'][ $key ];
		if ( is_array( $value ) && isset( $value[0] ) ) {
			$value = $value[0];
		}

		return maybe_unserialize( $value );
	}

	/**
	 * Rebase a source-site URL to the local site root.
	 *
	 * @param string $url             Source URL.
	 * @param string $source_site_url Source site root URL.
	 *
	 * @return string Local URL when source-root-relative, original otherwise.
	 */
	private function rebase_layout_source_url( $url, $source_site_url ) {
		$url    = esc_url_raw( $url );
		$source = trailingslashit( esc_url_raw( $source_site_url ) );
		if ( empty( $url ) || empty( $source ) ) {
			return $url;
		}

		if ( 0 === strpos( $url, $source ) ) {
			return trailingslashit( site_url() ) . ltrim( substr( $url, strlen( $source ) ), '/' );
		}

		return $url;
	}

	/**
	 * Derive the source site root from an SCE REST base URL.
	 *
	 * @param string $base_url Source SCE REST base URL.
	 *
	 * @return string
	 */
		private function get_layout_source_site_url( $base_url ) {
			$site = preg_replace( '#wp-json/.*$#', '', trailingslashit( $base_url ) );

			return trailingslashit( esc_url_raw( $site ) );
		}

		/**
		 * Generate a compact unique ID for a queued layout-unit import.
		 *
		 * @return string
		 */
		private function generate_layout_unit_job_id() {
			$seed = function_exists( 'wp_generate_password' ) ? wp_generate_password( 24, false, false ) : uniqid( '', true );

			return sanitize_key( 'lu_' . md5( microtime( true ) . '_' . $seed ) );
		}

		/**
		 * Generate the token used by the internal worker request.
		 *
		 * @return string
		 */
		private function generate_layout_unit_job_token() {
			if ( function_exists( 'wp_generate_password' ) ) {
				return wp_generate_password( 32, false, false );
			}

			return md5( uniqid( '', true ) );
		}

		/**
		 * Return the transient key for one layout-unit import job.
		 *
		 * @param string $job_id Job ID.
		 *
		 * @return string
		 */
		private function get_layout_unit_job_transient_key( $job_id ) {
			return 'pixassist_layout_unit_job_' . sanitize_key( $job_id );
		}

		/**
		 * Persist one layout-unit import job.
		 *
		 * @param string $job_id Job ID.
		 * @param array  $job    Job payload.
		 *
		 * @return bool
		 */
		private function store_layout_unit_job( $job_id, $job ) {
			return set_transient( $this->get_layout_unit_job_transient_key( $job_id ), $job, HOUR_IN_SECONDS );
		}

		/**
		 * Load one layout-unit import job.
		 *
		 * @param string $job_id Job ID.
		 *
		 * @return array
		 */
		private function get_layout_unit_job( $job_id ) {
			$job = get_transient( $this->get_layout_unit_job_transient_key( $job_id ) );

			return is_array( $job ) ? $job : array();
		}

		/**
		 * Start a queued layout-unit import through a non-blocking loopback REST request.
		 *
		 * @param string $job_id Job ID.
		 * @param string $token  Worker token.
		 *
		 * @return bool|WP_Error
		 */
		private function dispatch_layout_unit_job( $job_id, $token ) {
			if ( ! function_exists( 'wp_remote_post' ) || ! function_exists( 'rest_url' ) ) {
				return new WP_Error( 'layout_job_dispatch_unavailable', esc_html__( 'The layout import worker could not be started.', '__plugin_txtd' ) );
			}

			$response = wp_remote_post(
				rest_url( 'pixassist/v1/process_unit_job' ),
				array(
					'timeout'  => 0.1,
					'blocking' => false,
					'body'     => array(
						'job_id' => sanitize_key( $job_id ),
						'token'  => (string) $token,
					),
				)
			);

			if ( is_wp_error( $response ) ) {
				return $response;
			}

			return true;
		}

		/**
		 * Convert a stored layout-unit job to a response payload.
		 *
		 * @param array $job              Stored job.
		 * @param bool  $include_internal Whether to include the internal token/request fields.
		 *
		 * @return array
		 */
		private function format_layout_unit_job( $job, $include_internal = false ) {
			$data = array(
				'jobId'   => isset( $job['jobId'] ) ? sanitize_key( $job['jobId'] ) : '',
				'status'  => isset( $job['status'] ) ? sanitize_key( $job['status'] ) : '',
				'created' => isset( $job['created'] ) ? (int) $job['created'] : 0,
				'updated' => isset( $job['updated'] ) ? (int) $job['updated'] : 0,
			);

			if ( isset( $job['result'] ) ) {
				$data['result'] = $job['result'];
			}

			if ( isset( $job['error'] ) ) {
				$data['error'] = $job['error'];
			}

			if ( $include_internal ) {
				$data['token']   = isset( $job['token'] ) ? (string) $job['token'] : '';
				$data['request'] = isset( $job['request'] ) && is_array( $job['request'] ) ? $job['request'] : array();
			}

			return $data;
		}

		/**
		 * Convert a WP_Error into the import response shape.
		 *
	 * @param WP_Error $error Error object.
	 *
	 * @return array
	 */
	private function layout_unit_error_response( $error ) {
		return array(
			'code'    => method_exists( $error, 'get_error_code' ) ? $error->get_error_code() : 'layout_import_error',
			'message' => $error->get_error_message(),
			'data'    => method_exists( $error, 'get_error_data' ) ? (array) $error->get_error_data() : array(),
		);
	}

	/**
	 * Persist the applied-unit index for a successful granular import.
	 *
	 * @param string $demo_key               Starter/demo key.
	 * @param string $base_url               Source SCE REST base URL.
	 * @param string $unit_type              Unit post type.
	 * @param array  $unit_post              Source unit post.
	 * @param int    $local_id               Local imported post ID.
	 * @param array  $starter_content_before Journal snapshot before this unit import.
	 * @param array  $location_slugs         Nav location slugs touched by this unit.
	 */
	private function record_applied_layout_unit( $demo_key, $base_url, $unit_type, $unit_post, $local_id, $starter_content_before, $location_slugs ) {
		$demo_key  = sanitize_key( $demo_key );
		$unit_type = sanitize_key( $unit_type );
		$slug      = isset( $unit_post['post_name'] ) ? sanitize_key( $unit_post['post_name'] ) : '';
		$slot      = $this->get_layout_unit_slot_key( $unit_type, $slug );

		if ( empty( $slot ) || empty( $local_id ) ) {
			return;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) || ! is_array( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}

		$before_journal = isset( $starter_content_before[ $demo_key ] ) && is_array( $starter_content_before[ $demo_key ] )
			? $starter_content_before[ $demo_key ]
			: array();
		$unit_journal = $this->get_layout_unit_journal_delta( $before_journal, $starter_content[ $demo_key ] );

		if ( empty( $unit_journal['post_types'][ $unit_type ][ $unit_post['ID'] ] ) ) {
			if ( empty( $unit_journal['post_types'] ) ) {
				$unit_journal['post_types'] = array();
			}
			if ( empty( $unit_journal['post_types'][ $unit_type ] ) ) {
				$unit_journal['post_types'][ $unit_type ] = array();
			}
			$unit_journal['post_types'][ $unit_type ][ $unit_post['ID'] ] = $local_id;
		}

		if ( empty( $starter_content[ $demo_key ]['layout_units'] ) || ! is_array( $starter_content[ $demo_key ]['layout_units'] ) ) {
			$starter_content[ $demo_key ]['layout_units'] = array();
		}

		$starter_content[ $demo_key ]['layout_units'][ $slot ] = array(
			'type'          => $unit_type,
			'slug'          => $slug,
			'title'         => ! empty( $unit_post['post_title'] ) ? wp_strip_all_tags( $unit_post['post_title'] ) : $slug,
			'sourceId'      => isset( $unit_post['ID'] ) ? absint( $unit_post['ID'] ) : 0,
			'localId'       => absint( $local_id ),
			'demoKey'       => $demo_key,
			'sourceTitle'   => $this->get_layout_unit_source_title( $demo_key ),
			'baseRestUrl'   => esc_url_raw( $base_url ),
			'locationSlugs' => array_values( array_unique( array_filter( array_map( 'sanitize_key', (array) $location_slugs ) ) ) ),
			'appliedAt'     => time(),
			'journal'       => $unit_journal,
		);

		$this->preserve_layout_unit_aggregate_settings( $starter_content[ $demo_key ], $before_journal, $unit_journal );

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();
	}

	/**
	 * Record an applied feature unit.
	 *
	 * @param string $demo_key                Starter/demo key.
	 * @param string $base_url                Source SCE REST base URL.
	 * @param string $feature_slug            Feature slug.
	 * @param array  $feature                 Feature definition.
	 * @param array  $starter_content_before  Journal snapshot before import.
	 * @param array  $enabled_features_before Enabled feature list before import.
	 * @param array  $dependencies            Import dependency counts.
	 * @param bool   $include_sample          Whether sample content was imported.
	 */
	private function record_applied_feature_unit( $demo_key, $base_url, $feature_slug, $feature, $starter_content_before, $enabled_features_before, $dependencies, $include_sample ) {
		$demo_key     = sanitize_key( $demo_key );
		$feature_slug = sanitize_key( $feature_slug );
		$slot         = $this->get_layout_unit_slot_key( 'feature', $feature_slug );

		if ( empty( $slot ) ) {
			return;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) || ! is_array( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}

		$before_journal = isset( $starter_content_before[ $demo_key ] ) && is_array( $starter_content_before[ $demo_key ] )
			? $starter_content_before[ $demo_key ]
			: array();
		$unit_journal = $this->get_layout_unit_journal_delta( $before_journal, $starter_content[ $demo_key ] );

		if ( ! in_array( $feature_slug, $enabled_features_before, true ) && in_array( $feature_slug, $this->get_enabled_layout_features(), true ) ) {
			$unit_journal['enabled_features'][ $feature_slug ] = true;
			$starter_content[ $demo_key ]['enabled_features'][ $feature_slug ] = true;
		}

		if ( empty( $starter_content[ $demo_key ]['layout_units'] ) || ! is_array( $starter_content[ $demo_key ]['layout_units'] ) ) {
			$starter_content[ $demo_key ]['layout_units'] = array();
		}

		$starter_content[ $demo_key ]['layout_units'][ $slot ] = array(
			'type'          => 'feature',
			'slug'          => $feature_slug,
			'title'         => isset( $feature['title'] ) ? wp_strip_all_tags( $feature['title'] ) : $feature_slug,
			'demoKey'       => $demo_key,
			'sourceTitle'   => $this->get_layout_unit_source_title( $demo_key ),
			'baseRestUrl'   => esc_url_raw( $base_url ),
			'sampleEnabled' => (bool) $include_sample,
			'dependencies'  => $dependencies,
			'appliedAt'     => time(),
			'journal'       => $unit_journal,
		);

		$this->preserve_layout_unit_aggregate_settings( $starter_content[ $demo_key ], $before_journal, $unit_journal );

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();
	}

	/**
	 * Return enabled feature-unit slugs.
	 *
	 * @return array
	 */
	private function get_enabled_layout_features() {
		$features = PixelgradeAssistant_Admin::get_option( 'enabled_features', array() );
		if ( ! is_array( $features ) ) {
			return array();
		}

		return array_values( array_unique( array_filter( array_map( 'sanitize_key', $features ) ) ) );
	}

	/**
	 * Enable a feature-unit flag.
	 *
	 * @param string $feature_slug Feature slug.
	 */
	private function enable_layout_feature( $feature_slug ) {
		$feature_slug = sanitize_key( $feature_slug );
		if ( empty( $feature_slug ) ) {
			return;
		}

		$features = $this->get_enabled_layout_features();
		if ( ! in_array( $feature_slug, $features, true ) ) {
			$features[] = $feature_slug;
		}

		PixelgradeAssistant_Admin::set_option( 'enabled_features', array_values( array_unique( $features ) ) );
	}

	/**
	 * Disable a feature-unit flag.
	 *
	 * @param string $feature_slug Feature slug.
	 */
	private function disable_layout_feature( $feature_slug ) {
		$feature_slug = sanitize_key( $feature_slug );
		$features     = array_values(
			array_filter(
				$this->get_enabled_layout_features(),
				function ( $enabled_feature ) use ( $feature_slug ) {
					return $enabled_feature !== $feature_slug;
				}
			)
		);

		PixelgradeAssistant_Admin::set_option( 'enabled_features', $features );
	}

	/**
	 * Register the backing CPT when the feature exposes a sanctioned registrar.
	 *
	 * @param string $feature_slug Feature slug.
	 */
	private function maybe_register_layout_feature( $feature_slug ) {
		if ( 'portfolio' === sanitize_key( $feature_slug ) && function_exists( 'pixassist_maybe_register_portfolio_cpt' ) ) {
			pixassist_maybe_register_portfolio_cpt();
		}
	}

	/**
	 * Build a slot key for a layout unit.
	 *
	 * @param string $unit_type Unit post type.
	 * @param string $slug      Unit slug.
	 *
	 * @return string
	 */
	private function get_layout_unit_slot_key( $unit_type, $slug ) {
		$unit_type = sanitize_key( $unit_type );
		$slug      = sanitize_key( $slug );

		if ( empty( $slug ) || ! in_array( $unit_type, array( 'wp_template_part', 'wp_template', 'feature' ), true ) ) {
			return '';
		}

		return $unit_type . ':' . $slug;
	}

	/**
	 * Locate an applied layout unit.
	 *
	 * @param string $unit_type Unit post type.
	 * @param string $slug      Unit slug.
	 *
	 * @return array|null
	 */
	private function get_applied_layout_unit_entry( $unit_type, $slug ) {
		$slot = $this->get_layout_unit_slot_key( $unit_type, $slug );
		if ( empty( $slot ) ) {
			return null;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			return null;
		}

		foreach ( $starter_content as $demo_key => $journal ) {
			if ( empty( $journal['layout_units'][ $slot ] ) || ! is_array( $journal['layout_units'][ $slot ] ) ) {
				continue;
			}

			return array(
				'demo_key' => sanitize_key( $demo_key ),
				'unit'     => $journal['layout_units'][ $slot ],
			);
		}

		return null;
	}

	/**
	 * Determine which journal entries were introduced by one unit import.
	 *
	 * @param array $before Journal before import.
	 * @param array $after  Journal after import.
	 *
	 * @return array
	 */
	private function get_layout_unit_journal_delta( $before, $after ) {
		$delta = array();

		foreach ( array( 'post_types', 'taxonomies', 'media' ) as $group ) {
			if ( empty( $after[ $group ] ) || ! is_array( $after[ $group ] ) ) {
				continue;
			}

			foreach ( $after[ $group ] as $type => $map ) {
				if ( empty( $map ) || ! is_array( $map ) ) {
					continue;
				}

				foreach ( $map as $source_id => $local_id ) {
					$before_has = isset( $before[ $group ][ $type ] ) && is_array( $before[ $group ][ $type ] ) && array_key_exists( $source_id, $before[ $group ][ $type ] );
					if ( $before_has && $before[ $group ][ $type ][ $source_id ] === $local_id ) {
						continue;
					}

					if ( empty( $delta[ $group ] ) ) {
						$delta[ $group ] = array();
					}
					if ( empty( $delta[ $group ][ $type ] ) ) {
						$delta[ $group ][ $type ] = array();
					}
					$delta[ $group ][ $type ][ $source_id ] = $local_id;
				}
			}
		}

		foreach ( array( 'pre_settings', 'post_settings' ) as $settings_key ) {
			if ( empty( $after[ $settings_key ] ) || ! is_array( $after[ $settings_key ] ) ) {
				continue;
			}

			foreach ( array( 'options', 'mods' ) as $group ) {
				if ( empty( $after[ $settings_key ][ $group ] ) || ! is_array( $after[ $settings_key ][ $group ] ) ) {
					continue;
				}

				foreach ( $after[ $settings_key ][ $group ] as $key => $value ) {
					$before_has = isset( $before[ $settings_key ][ $group ] ) && is_array( $before[ $settings_key ][ $group ] ) && array_key_exists( $key, $before[ $settings_key ][ $group ] );
					if ( $before_has && $before[ $settings_key ][ $group ][ $key ] === $value ) {
						continue;
					}

					if ( empty( $delta[ $settings_key ] ) ) {
						$delta[ $settings_key ] = array();
					}
					if ( empty( $delta[ $settings_key ][ $group ] ) ) {
						$delta[ $settings_key ][ $group ] = array();
					}
					$delta[ $settings_key ][ $group ][ $key ] = $value;
				}
			}
		}

		return $delta;
	}

	/**
	 * Keep the full-reset journal's earliest setting values after a later unit touches the same setting.
	 *
	 * @param array $aggregate     Source aggregate journal, by reference.
	 * @param array $before        Source journal before this unit import.
	 * @param array $unit_journal  Unit-specific journal.
	 */
	private function preserve_layout_unit_aggregate_settings( &$aggregate, $before, $unit_journal ) {
		foreach ( array( 'pre_settings', 'post_settings' ) as $settings_key ) {
			foreach ( array( 'options', 'mods' ) as $group ) {
				if ( empty( $unit_journal[ $settings_key ][ $group ] ) || ! is_array( $unit_journal[ $settings_key ][ $group ] ) ) {
					continue;
				}

				foreach ( $unit_journal[ $settings_key ][ $group ] as $key => $value ) {
					if ( isset( $before[ $settings_key ][ $group ] ) && is_array( $before[ $settings_key ][ $group ] ) && array_key_exists( $key, $before[ $settings_key ][ $group ] ) ) {
						$aggregate[ $settings_key ][ $group ][ $key ] = $before[ $settings_key ][ $group ][ $key ];
					}
				}
			}
		}
	}

	/**
	 * Remove journal entries that another applied unit still references.
	 *
	 * @param array  $journal         Unit journal.
	 * @param string $slot            Slot being removed.
	 * @param array  $starter_content Full starter-content journal.
	 *
	 * @return array Journal entries safe to delete.
	 */
	private function get_layout_unit_exclusive_journal( $journal, $slot, $starter_content ) {
		$exclusive = $journal;

		foreach ( array( 'post_types', 'taxonomies', 'media' ) as $group ) {
			if ( empty( $exclusive[ $group ] ) || ! is_array( $exclusive[ $group ] ) ) {
				continue;
			}

			foreach ( $exclusive[ $group ] as $type => $map ) {
				if ( empty( $map ) || ! is_array( $map ) ) {
					continue;
				}

				foreach ( $map as $source_id => $local_id ) {
					if ( $this->layout_unit_map_entry_used_by_other( $slot, $group, $type, $source_id, $local_id, $starter_content ) ) {
						unset( $exclusive[ $group ][ $type ][ $source_id ] );
					}
				}
			}
		}

		$this->prune_empty_layout_journal( $exclusive );

		return $exclusive;
	}

	/**
	 * Whether another applied unit references one mapped journal entry.
	 *
	 * @param string $slot            Slot being removed.
	 * @param string $group           Journal group.
	 * @param string $type            Map type.
	 * @param mixed  $source_id       Source ID.
	 * @param mixed  $local_id        Local ID.
	 * @param array  $starter_content Full starter-content journal.
	 *
	 * @return bool
	 */
	private function layout_unit_map_entry_used_by_other( $slot, $group, $type, $source_id, $local_id, $starter_content ) {
		foreach ( (array) $starter_content as $journal ) {
			if ( empty( $journal['layout_units'] ) || ! is_array( $journal['layout_units'] ) ) {
				continue;
			}

			foreach ( $journal['layout_units'] as $other_slot => $unit ) {
				if ( $other_slot === $slot || empty( $unit['journal'][ $group ][ $type ] ) || ! is_array( $unit['journal'][ $group ][ $type ] ) ) {
					continue;
				}

				if ( array_key_exists( $source_id, $unit['journal'][ $group ][ $type ] ) && $unit['journal'][ $group ][ $type ][ $source_id ] === $local_id ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Restore settings for one layout unit.
	 *
	 * @param array $journal          Unit journal.
	 * @param array $unit_meta        Unit metadata.
	 * @param array $restored_options Unique restored option keys, by reference.
	 * @param array $restored_mods    Unique restored theme mod keys, by reference.
	 */
	private function reset_layout_unit_settings( $journal, $unit_meta, &$restored_options, &$restored_mods ) {
		foreach ( array( 'post_settings', 'pre_settings' ) as $settings_key ) {
			if ( empty( $journal[ $settings_key ] ) || ! is_array( $journal[ $settings_key ] ) ) {
				continue;
			}

			if ( ! empty( $journal[ $settings_key ]['options'] ) && is_array( $journal[ $settings_key ]['options'] ) ) {
				foreach ( $journal[ $settings_key ]['options'] as $option => $value ) {
					$option = (string) $option;
					update_option( $option, $value );
					$restored_options[ $option ] = true;
				}
			}

			if ( empty( $journal[ $settings_key ]['mods'] ) || ! is_array( $journal[ $settings_key ]['mods'] ) ) {
				continue;
			}

			foreach ( $journal[ $settings_key ]['mods'] as $mod => $value ) {
				$mod = (string) $mod;

				if ( 'nav_menu_locations' === $mod && is_array( $value ) ) {
					$current = get_theme_mod( 'nav_menu_locations', array() );
					if ( ! is_array( $current ) ) {
						$current = array();
					}

					$location_slugs = ! empty( $unit_meta['locationSlugs'] ) && is_array( $unit_meta['locationSlugs'] )
						? array_values( array_unique( array_map( 'sanitize_key', $unit_meta['locationSlugs'] ) ) )
						: array_keys( $value );

					foreach ( $location_slugs as $location_slug ) {
						if ( array_key_exists( $location_slug, $value ) && false !== $value[ $location_slug ] && null !== $value[ $location_slug ] ) {
							$current[ $location_slug ] = $value[ $location_slug ];
						} else {
							unset( $current[ $location_slug ] );
						}
					}

					set_theme_mod( 'nav_menu_locations', $current );
					$restored_mods['nav_menu_locations'] = true;
					continue;
				}

				if ( false === $value || null === $value ) {
					remove_theme_mod( $mod );
				} else {
					set_theme_mod( $mod, $value );
				}

				$restored_mods[ $mod ] = true;
			}
		}
	}

	/**
	 * Remove a unit's entries from the aggregate journal after undoing it.
	 *
	 * @param array  $starter_content Full starter-content journal, by reference.
	 * @param string $demo_key        Source demo key.
	 * @param string $slot            Slot being removed.
	 * @param array  $delete_journal  Journal entries that were deleted.
	 * @param array  $unit_journal    Complete unit journal.
	 */
	private function remove_layout_unit_from_starter_content( &$starter_content, $demo_key, $slot, $delete_journal, $unit_journal ) {
		if ( empty( $starter_content[ $demo_key ] ) || ! is_array( $starter_content[ $demo_key ] ) ) {
			return;
		}

		foreach ( array( 'post_types', 'taxonomies', 'media' ) as $group ) {
			if ( empty( $delete_journal[ $group ] ) || ! is_array( $delete_journal[ $group ] ) ) {
				continue;
			}

			foreach ( $delete_journal[ $group ] as $type => $map ) {
				if ( empty( $map ) || ! is_array( $map ) ) {
					continue;
				}

				foreach ( $map as $source_id => $local_id ) {
					if ( isset( $starter_content[ $demo_key ][ $group ][ $type ] ) && is_array( $starter_content[ $demo_key ][ $group ][ $type ] ) ) {
						unset( $starter_content[ $demo_key ][ $group ][ $type ][ $source_id ] );
					}
				}
			}
		}

		foreach ( array( 'pre_settings', 'post_settings' ) as $settings_key ) {
			foreach ( array( 'options', 'mods' ) as $group ) {
				if ( empty( $unit_journal[ $settings_key ][ $group ] ) || ! is_array( $unit_journal[ $settings_key ][ $group ] ) ) {
					continue;
				}

				foreach ( $unit_journal[ $settings_key ][ $group ] as $key => $value ) {
					if ( $this->layout_unit_setting_used_by_other( $starter_content, $slot, $settings_key, $group, $key ) ) {
						continue;
					}

					if ( isset( $starter_content[ $demo_key ][ $settings_key ][ $group ] ) && is_array( $starter_content[ $demo_key ][ $settings_key ][ $group ] ) ) {
						unset( $starter_content[ $demo_key ][ $settings_key ][ $group ][ $key ] );
					}
				}
			}
		}

		if ( ! empty( $unit_journal['enabled_features'] ) && is_array( $unit_journal['enabled_features'] ) ) {
			foreach ( $unit_journal['enabled_features'] as $feature_slug => $enabled ) {
				if ( ! $enabled || empty( $starter_content[ $demo_key ]['enabled_features'][ $feature_slug ] ) ) {
					continue;
				}

				unset( $starter_content[ $demo_key ]['enabled_features'][ $feature_slug ] );
			}
		}

		unset( $starter_content[ $demo_key ]['layout_units'][ $slot ] );
		$this->prune_empty_layout_journal( $starter_content[ $demo_key ] );

		if ( empty( $starter_content[ $demo_key ] ) ) {
			unset( $starter_content[ $demo_key ] );
		}
	}

	/**
	 * Whether another applied unit references a setting key.
	 *
	 * @param array  $starter_content Full starter-content journal.
	 * @param string $slot            Slot being removed.
	 * @param string $settings_key    Settings group.
	 * @param string $group           `options` or `mods`.
	 * @param string $key             Setting key.
	 *
	 * @return bool
	 */
	private function layout_unit_setting_used_by_other( $starter_content, $slot, $settings_key, $group, $key ) {
		foreach ( (array) $starter_content as $journal ) {
			if ( empty( $journal['layout_units'] ) || ! is_array( $journal['layout_units'] ) ) {
				continue;
			}

			foreach ( $journal['layout_units'] as $other_slot => $unit ) {
				if ( $other_slot === $slot ) {
					continue;
				}

				if ( isset( $unit['journal'][ $settings_key ][ $group ] ) && is_array( $unit['journal'][ $settings_key ][ $group ] ) && array_key_exists( $key, $unit['journal'][ $settings_key ][ $group ] ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Remove empty maps from a journal recursively.
	 *
	 * @param array $journal Journal to prune, by reference.
	 */
	private function prune_empty_layout_journal( &$journal ) {
		if ( ! is_array( $journal ) ) {
			return;
		}

		foreach ( $journal as $key => &$value ) {
			if ( is_array( $value ) ) {
				$this->prune_empty_layout_journal( $value );
				if ( empty( $value ) ) {
					unset( $journal[ $key ] );
				}
			}
		}
		unset( $value );
	}

	/**
	 * Resolve the display name for a source.
	 *
	 * @param string $demo_key Starter/demo key.
	 *
	 * @return string
	 */
	private function get_layout_unit_source_title( $demo_key ) {
		$demo_key = sanitize_key( $demo_key );

		if ( function_exists( 'pixassist_get_admin_hub_starters' ) ) {
			foreach ( pixassist_get_admin_hub_starters() as $starter ) {
				if ( ! empty( $starter['id'] ) && sanitize_key( $starter['id'] ) === $demo_key ) {
					return ! empty( $starter['title'] ) ? wp_strip_all_tags( $starter['title'] ) : $demo_key;
				}
			}
		}

		$config = PixelgradeAssistant_Admin::get_config();
		if ( ! empty( $config['starterContent']['demos'] ) && is_array( $config['starterContent']['demos'] ) ) {
			foreach ( $config['starterContent']['demos'] as $demo ) {
				if ( ! empty( $demo['id'] ) && sanitize_key( $demo['id'] ) === $demo_key ) {
					return ! empty( $demo['title'] ) ? wp_strip_all_tags( $demo['title'] ) : $demo_key;
				}
			}
		}

		return $demo_key;
	}

	/**
	 * Restore term/comment/cache flags after a granular import.
	 */
		private function restore_import_counting() {
			wp_suspend_cache_invalidation( false );
			wp_cache_flush();

		if ( function_exists( 'get_taxonomies' ) ) {
			$taxonomies = get_taxonomies();
			foreach ( $taxonomies as $tax ) {
				delete_option( "{$tax}_children" );
				_get_term_hierarchy( $tax );
			}
		}

			wp_defer_term_counting( false );
			wp_defer_comment_counting( false );
		}

		/**
		 * Finish a layout-only import without running the full starter end-import cleanup.
		 *
		 * Layout Apply does not import Style Manager design options, so rebuilding Style Manager caches on
		 * every header/footer/template swap is unnecessary. Keep the URL safety step scoped to the imported
		 * layout posts instead.
		 *
		 * @param string $base_url Source SCE REST base URL.
		 * @param array  $post_ids Imported local post IDs.
		 *
		 * @return void
		 */
		private function finish_layout_unit_import( $base_url, $post_ids ) {
			global $wpdb;

			$base_url = esc_url_raw( $base_url );
			if ( empty( $base_url ) || empty( $post_ids ) ) {
				return;
			}

			$searches = array( trailingslashit( $base_url ) );
			$demo_site = preg_replace( '#wp-json/.*$#', '', $base_url );
			if ( ! empty( $demo_site ) && $demo_site !== $base_url ) {
				$searches[] = trailingslashit( $demo_site );
			}

			$replace = trailingslashit( site_url() );
			foreach ( array_values( array_unique( array_filter( array_map( 'absint', (array) $post_ids ) ) ) ) as $post_id ) {
				foreach ( array_values( array_unique( $searches ) ) as $search ) {
					$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s) WHERE ID = %d", $search, $replace, $post_id ) );
				}

				if ( function_exists( 'clean_post_cache' ) ) {
					clean_post_cache( $post_id );
				}
			}
		}

		/**
		 * Whether a starter-content base URL points to a host we actually serve demos from.
	 *
	 * The legitimate demo sources are defined in the (server-provided) theme config; we never
	 * fetch from an arbitrary host supplied by the request. An exact host match or a subdomain
	 * of an allowed host passes.
	 *
	 * @param string $base_url
	 *
	 * @return bool
	 */
	private function is_allowed_demo_url( $base_url ) {
		$host = strtolower( (string) wp_parse_url( $base_url, PHP_URL_HOST ) );
		if ( empty( $host ) ) {
			return false;
		}

		foreach ( $this->get_allowed_demo_hosts() as $allowed ) {
			$allowed = strtolower( $allowed );
			if ( empty( $allowed ) ) {
				continue;
			}

			// Exact host match or a subdomain of an allowed host.
			if ( $host === $allowed || substr( $host, - strlen( '.' . $allowed ) ) === '.' . $allowed ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * The hosts starter-content imports are allowed to fetch from.
	 *
	 * Derived from the demo sources in the current theme config, plus the Pixelgrade API host,
	 * and filterable so a companion plugin can register additional sources.
	 *
	 * @return array
	 */
	private function get_allowed_demo_hosts() {
		$hosts = array();

		$config = PixelgradeAssistant_Admin::get_config();
		if ( ! empty( $config['starterContent']['demos'] ) && is_array( $config['starterContent']['demos'] ) ) {
			foreach ( $config['starterContent']['demos'] as $demo ) {
				foreach ( array( 'url', 'baseRestUrl' ) as $key ) {
					if ( empty( $demo[ $key ] ) ) {
						continue;
					}
					$demo_host = wp_parse_url( $demo[ $key ], PHP_URL_HOST );
					if ( ! empty( $demo_host ) ) {
						$hosts[] = strtolower( $demo_host );
					}
				}
			}
		}

		// Always allow the Pixelgrade host (and its subdomains, e.g. demos.pixelgrade.com)
		// that serves the configs and demo content.
		if ( defined( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN' ) ) {
			$hosts[] = strtolower( PIXELGRADE_ASSISTANT__API_BASE_DOMAIN );
		}

		$hosts = array_values( array_unique( array_filter( $hosts ) ) );

		/**
		 * Filter the hosts that starter-content imports are allowed to fetch from.
		 *
		 * @param array $hosts
		 */
		return apply_filters( 'pixassist_sce_allowed_demo_hosts', $hosts );
	}

	/**
	 * Resolve the companion plugins a starter requires that are NOT currently active.
	 *
	 * The required-plugins set is declared per starter (data-driven) and resolved through the same
	 * Starter Sites pipeline the UI uses, so the server and the UI agree on the dependency contract.
	 * A starter we cannot match (unknown demo_key, or the Starter Sites module unavailable) returns no
	 * missing plugins — the gate must never block a legitimate import for a starter without a declared
	 * dependency.
	 *
	 * @param string $demo_key The starter/demo key being imported.
	 *
	 * @return array[] Missing required plugins (each: slug, name, isInstalled, isActive). Empty when met.
	 */
	private function get_missing_required_plugins( $demo_key ) {
		$demo_key = sanitize_key( $demo_key );
		if ( '' === $demo_key || ! function_exists( 'pixassist_get_admin_hub_starters' ) ) {
			return array();
		}

		$required = array();

		// Find the starter descriptor (it carries the resolved, status-stamped requiredPlugins).
		foreach ( pixassist_get_admin_hub_starters() as $starter ) {
			if ( empty( $starter['id'] ) || $starter['id'] !== $demo_key ) {
				continue;
			}

			if ( ! empty( $starter['requiredPlugins'] ) && is_array( $starter['requiredPlugins'] ) ) {
				$required = $starter['requiredPlugins'];
			}
			break;
		}

		if ( empty( $required ) ) {
			return array();
		}

		// Re-check status server-side at request time (do not trust a stale localized snapshot).
		$missing = array();
		foreach ( $required as $plugin ) {
			if ( empty( $plugin['slug'] ) ) {
				continue;
			}

			$status = function_exists( 'pixassist_get_starter_plugin_status' )
				? pixassist_get_starter_plugin_status( $plugin['slug'] )
				: array( 'isInstalled' => false, 'isActive' => false );

			if ( empty( $status['isActive'] ) ) {
				$missing[] = array(
					'slug'        => sanitize_key( $plugin['slug'] ),
					'name'        => isset( $plugin['name'] ) ? wp_strip_all_tags( $plugin['name'] ) : sanitize_key( $plugin['slug'] ),
					'isInstalled' => ! empty( $status['isInstalled'] ),
					'isActive'    => ! empty( $status['isActive'] ),
				);
			}
		}

		return $missing;
	}

	/**
	 * Import posts of a certain post type.
	 *
	 * @param $demo_key
	 * @param $base_url
	 * @param array $args
	 *
	 * @return bool|array|WP_REST_Response False on failure, the imported post IDs otherwise.
	 */
	private function import_post_type( $demo_key, $base_url, $args = array() ) {
		$imported_ids = array();

		if ( empty( $args['ids'] ) ) {
			return false;
		}

		// Get the posts already imported
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( ! isset( $starter_content[ $demo_key ]['post_types'] ) ) {
			$starter_content[ $demo_key ]['post_types'] = array();
		}

		$request_url = trailingslashit( $base_url ) . 'posts';

		$request_data = array(
			'post_type'      => $args['post_type'],
			'include'        => $args['ids'],
			'placeholders'   => $this->get_placeholders( $demo_key ),
			'ignored_images' => $this->get_ignored_images( $demo_key ),
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => true,
		);

		// Increase timeout if the target URL is a development one so we can account for slow local (development) installations.
		if ( PixelgradeAssistant_Admin::is_development_url( $request_url ) ) {
			$request_args['timeout'] = 10;
		}

		// We will do a blocking request
		$response = wp_remote_request( $request_url, $request_args );
		if ( is_wp_error( $response ) ) {
			return rest_ensure_response( $response );
		}
		$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
		// Bail in case of decode error or failure to retrieve data
		if ( null === $response_data ) {
			return rest_ensure_response( array(
				'code'    => 'json_error',
				'message' => esc_html__( 'Something went wrong with decoding the data received.', '__plugin_txtd' ),
				'data'    => array(
					'response' => wp_remote_retrieve_body( $response ),
				),
			) );
		}

		if ( empty( $response_data['code'] ) || 'success' !== $response_data['code'] ) {
			return rest_ensure_response( $response_data );
		}

		foreach ( $response_data['data']['posts'] as $i => $post ) {
			$post_args = array(
				'import_id'             => $post['ID'],
				'post_title'            => wp_strip_all_tags( $post['post_title'] ),
				'post_content'          => $post['post_content'],
				'post_content_filtered' => $post['post_content_filtered'],
				'post_excerpt'          => $post['post_excerpt'],
				'post_status'           => $post['post_status'],
				'post_name'             => $post['post_name'],
				'post_type'             => $post['post_type'],
				'post_date'             => $post['post_date'],
				'post_date_gmt'         => $post['post_date_gmt'],
				'post_modified'         => $post['post_modified'],
				'post_modified_gmt'     => $post['post_modified_gmt'],
				'menu_order'            => $post['menu_order'],
				'meta_input'            => array(
					'imported_with_pixassist' => true
				)
			);

			// Now decide what to do if the post slug already exists
			if ( $existing_post_id = $this->the_slug_exists( $post['post_name'], $post['post_type'] ) ) {

				if ( apply_filters( 'pixassist_sce_should_overwrite_existing_post', false, $existing_post_id, $post, $demo_key ) ) {
					$post_args['ID'] = $existing_post_id;
				} else {
					if ( isset( $starter_content[ $demo_key ]['post_types'][ $args['post_type'] ][ $post['ID'] ] ) ) {
						// If the we have already imported this post, keep the data
						$imported_ids[ $post['ID'] ] = $starter_content[ $demo_key ]['post_types'][ $args['post_type'] ][ $post['ID'] ];
					} else {
						// At least remember something about this post
						$imported_ids[ $post['ID'] ] = $post['ID'];
					}
					continue;
				}
			}

			if ( ! empty( $post['meta'] ) ) {

				$must_break = false;

				foreach ( $post['meta'] as $key => $meta ) {

					if ( $meta === null || $meta === array(null) ) {
						continue;
					}

					if ( ! empty( $meta ) ) {
						// we only need  the first value
						if ( isset( $meta[0] ) ) {
							$meta = $meta[0];
						}

						$meta = maybe_unserialize( $meta );
					}

					if ( $key === '_menu_item_object' && $meta === 'post_format' ) {
						$must_break = true;
						break;
					}

					if ( ! empty( $meta ) ) {
						$post_args['meta_input'][ $key ] = apply_filters( 'sce_pre_postmeta', $meta, $key, $demo_key );
					}
				}

				if ( $must_break ) {
					continue;
				}
			}

			if ( ! empty( $post['taxonomies'] ) ) {
				$post_args['post_category'] = array();
				$post_args['tax_input']     = array();

				foreach ( $post['taxonomies'] as $taxonomy => $terms ) {

					if ( ! taxonomy_exists( $taxonomy ) ) {
						// @TODO inform the user that the taxonomy doesn't exist and maybe he should install a plugin
						continue;
					}

					$post_args['tax_input'][ $taxonomy ] = array();

					foreach ( $terms as $term ) {
						if ( is_numeric( $term ) && isset( $starter_content[ $demo_key ]['taxonomies'][ $taxonomy ][ $term ] ) ) {
							$term = $starter_content[ $demo_key ]['taxonomies'][ $taxonomy ][ $term ];
						}

						$post_args['tax_input'][ $taxonomy ][] = $term;
					}
				}
			}

			// Allow others to have a say in it.
			$post_args = apply_filters( 'pixassist_sce_insert_post_args', $post_args, $post, $demo_key );

			// Since wp_insert_post() at post.php@L3884 does a wp_unslash() on the whole post data, we need to do a wp_slash() to prevent things from breaking.
			$post_args = wp_slash_strings_only( $post_args );

			$post_id = wp_insert_post( $post_args );

			if ( is_wp_error( $post_id ) || empty( $post_id ) ) {
				// well ... error
				$imported_ids[ $post['ID'] ] = $post_id;
			} else {
				$imported_ids[ $post['ID'] ] = $post_id;

				// wp_insert_post()'s tax_input is silently dropped for any taxonomy the current user lacks
				// the `assign_terms` cap for (the case for custom taxonomies like `portfolio_type` when the
				// import runs without a privileged user). Re-apply the already-mapped terms directly with
				// wp_set_object_terms(), which bypasses that capability check, so CPT taxonomies attach
				// regardless of the caller's auth context.
				if ( ! empty( $post_args['tax_input'] ) && is_array( $post_args['tax_input'] ) ) {
					foreach ( $post_args['tax_input'] as $taxonomy => $term_ids ) {
						if ( empty( $term_ids ) || ! taxonomy_exists( $taxonomy ) ) {
							continue;
						}
						wp_set_object_terms( $post_id, $term_ids, $taxonomy, false );
					}
				}
			}
		}

		// Post processing to handle parents and guid changes
		foreach ( $response_data['data']['posts'] as $i => $post ) {
			$update_this = false;

			if ( ! isset( $imported_ids[ $post['ID'] ] ) ) {
				continue;
			}

			$update_args = array(
				'ID' => $imported_ids[ $post['ID'] ],
			);

			// bind parents after we have all the posts
			if ( ! empty( $post['post_parent'] ) && isset( $imported_ids[ $post['post_parent'] ] ) ) {
				$update_args['post_parent'] = $imported_ids[ $post['post_parent'] ];
				$update_this                = true;
			}

			// recheck the guid
			$new_perm = get_permalink( $post['ID'] );

			// if the guid takes the place of the permalink, rebase it
			if ( ! empty( $new_perm ) && ! is_numeric( $post['guid'] ) ) {
				$update_args['guid'] = $new_perm;
				$update_this         = true;
			}

			if ( $update_this ) {
				wp_update_post( $update_args );
			}

			do_action( 'pixassist_sce_after_insert_post', $post, $imported_ids, $demo_key );
		}

		// Remember the imported post IDs
		$starter_content[ $demo_key ]['post_types'][ $args['post_type'] ] = $imported_ids;
		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		// Return the imported post IDs
		return $imported_ids;
	}

	/**
	 * Import the terms from a certain taxonomy.
	 *
	 * @param $demo_key
	 * @param $base_url
	 * @param $args
	 *
	 * @return bool|array|WP_Error|WP_REST_Response
	 */
	private function import_taxonomy( $demo_key, $base_url, $args ) {
		$imported_ids = array();

		if ( empty( $args['ids'] ) || empty( $args['tax'] ) ) {
			return false;
		}

		if ( ! taxonomy_exists( $args['tax'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_tax',
				/* translators: %s: the taxonomy name */
				'message' => sprintf( esc_html__( '%s does not exists!', '__plugin_txtd' ), $args['tax'] ),
				'data'    => array(),
			) );
		}

		// Get the terms already imported
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( ! isset( $starter_content[ $demo_key ]['taxonomies'] ) ) {
			$starter_content[ $demo_key ]['taxonomies'] = array();
		}

		$request_url = trailingslashit( $base_url ) . 'terms';

		$request_data = array(
			'taxonomy' => $args['tax'],
			'include'  => $args['ids'],
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => true,
		);

		// Increase timeout if the target URL is a development one so we can account for slow local (development) installations.
		if ( PixelgradeAssistant_Admin::is_development_url( $request_url ) ) {
			$request_args['timeout'] = 10;
		}

		// We will do a blocking request
		$response = wp_remote_request( $request_url, $request_args );
		if ( is_wp_error( $response ) ) {
			return rest_ensure_response( $response );
		}

		$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
		// Bail in case of decode error or failure to retrieve data
		if ( null === $response_data ) {
			return rest_ensure_response( array(
				'code'    => 'json_error',
				'message' => esc_html__( 'Something went wrong with decoding the data received.', '__plugin_txtd' ),
				'data'    => array(
					'response' => wp_remote_retrieve_body( $response ),
				),
			) );
		}

		if ( empty( $response_data['code'] ) || 'success' !== $response_data['code'] ) {
			return rest_ensure_response( $response_data );
		}

		foreach ( $response_data['data']['terms'] as $i => $term ) {

			$term_args = array(
				'description' => wp_slash( $term['description'] ),
				'slug'        => $term['slug'],
			);

			$new_id = wp_insert_term(
				wp_slash( $term['name'] ), // the term
				$term['taxonomy'], // the taxonomy
				$term_args
			);

			if ( is_wp_error( $new_id ) ) {
				// If the term exists we will us the existing ID
				if ( ! empty( $new_id->error_data['term_exists'] ) ) {
					$imported_ids[ $term['term_id'] ] = $new_id->error_data['term_exists'];
				}
			} else {
				$imported_ids[ $term['term_id'] ] = $new_id['term_id'];

				if ( ! empty( $term['meta'] ) ) {

					foreach ( $term['meta'] as $key => $meta ) {
						$value = false;
						if ( ! $value && isset( $meta[0] ) ) {
							$value = maybe_unserialize( $meta[0] );
						}

						if ( 'pix_term_icon' === $key && isset( $starter_content[ $demo_key ]['media']['ignored'][ $value ] ) ) {
							$value = $starter_content[ $demo_key ]['media']['ignored'][ $value ];
						}

						update_term_meta( $new_id['term_id'], wp_slash( $key ), $value );
					}
					update_term_meta( $new_id['term_id'], wp_slash( 'imported_with_pixassist' ), true );
				}
			}

			// Clear the term cache
			if ( ! is_wp_error( $new_id ) && ! empty( $new_id['term_id'] ) ) {
				clean_term_cache( $new_id['term_id'], $args['tax'] );
			}
		}

		// bind the parents
		foreach ( $response_data['data']['terms'] as $i => $term ) {
			if ( isset( $imported_ids[ $term['parent'] ] ) ) {
				wp_update_term( $imported_ids[ $term['term_id'] ], $args['tax'], array(
					'parent' => $imported_ids[ $term['parent'] ]
				) );
			}
		}

		// Save the imported term IDs
		$starter_content[ $demo_key ]['taxonomies'][ $args['tax'] ] = $imported_ids;
		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		// Return the imported term IDs
		return $imported_ids;
	}

	private function import_settings( $demo_key, $type, $data, $trigger_import_hooks = true ) {
		if ( ! is_array( $data ) ) {
			$data = json_decode( $data, true );
		}

		$settings_key = $type . '_settings';

		if ( empty( $data ) ) {
			return false;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( ! isset( $starter_content[ $demo_key ][ $settings_key ] ) ) {
			$starter_content[ $demo_key ][ $settings_key ] = array();
		}

		if ( ! empty( $data['mods'] ) ) {

			if ( ! isset( $starter_content[ $demo_key ][ $settings_key ]['mods'] ) ) {
				$starter_content[ $demo_key ][ $settings_key ]['mods'] = array();
			}

			foreach ( $data['mods'] as $mod => $value ) {
				$starter_content[ $demo_key ][ $settings_key ]['mods'][ $mod ] = get_theme_mod( $mod );

				$value = apply_filters( "pixassist_sce_import_{$type}_theme_mod_{$mod}", $value, $demo_key );

				set_theme_mod( $mod, $value );
			}
		}

		if ( ! empty( $data['options'] ) ) {
			if ( ! isset( $starter_content[ $demo_key ][ $settings_key ]['options'] ) ) {
				$starter_content[ $demo_key ][ $settings_key ]['options'] = array();
			}

			foreach ( $data['options'] as $option => $value ) {
				$starter_content[ $demo_key ][ $settings_key ]['options'][ $option ] = get_option( $option );

				$value = apply_filters( "pixassist_sce_import_{$type}_option_{$option}", $value, $demo_key );

				update_option( $option, $value );
			}
		}

		if ( $trigger_import_hooks && 'pre' === $type ) {
			do_action( 'pixassist_sce_import_start' );
		}


		if ( $trigger_import_hooks && 'post' === $type ) {
			do_action( 'pixassist_sce_import_end' );
		}

		// Filters above may import additional dependencies and write them to the same journal
		// (for example a logo sideloaded while remapping `custom_logo`). Preserve those writes
		// instead of saving the pre-filter snapshot over them.
		$latest_starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( is_array( $latest_starter_content ) ) {
			if ( empty( $latest_starter_content[ $demo_key ] ) || ! is_array( $latest_starter_content[ $demo_key ] ) ) {
				$latest_starter_content[ $demo_key ] = array();
			}
			$latest_starter_content[ $demo_key ][ $settings_key ] = $starter_content[ $demo_key ][ $settings_key ];
			$starter_content = $latest_starter_content;
		}

		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		return true;
	}

	/**
	 * Import the widgets (not used right now).
	 *
	 * @param $demo_key
	 * @param $data
	 *
	 * @return bool
	 */
	private function import_widgets( $demo_key, $data ) {

		if ( empty( $data ) ) {
			return false;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}

		// First let's remove all the widgets in sidebars to avoid a big mess
		$sidebars_widgets = wp_get_sidebars_widgets();
		foreach ( $sidebars_widgets as $sidebarID => $widgets ) {
			if ( $sidebarID != 'wp_inactive_widgets' ) {
				$sidebars_widgets[ $sidebarID ] = array();
			}
		}
		wp_set_sidebars_widgets( $sidebars_widgets );

		// Let's get to work
		$json_data = json_decode( base64_decode( $data ), true );

		$sidebar_data = $json_data[0];
		$widget_data  = $json_data[1];

		foreach ( $sidebar_data as $type => $sidebar ) {
			$count = count( $sidebar );
			for ( $i = 0; $i < $count; $i ++ ) {
				$widget               = array();
				$widget['type']       = trim( substr( $sidebar[ $i ], 0, strrpos( $sidebar[ $i ], '-' ) ) );
				$widget['type-index'] = trim( substr( $sidebar[ $i ], strrpos( $sidebar[ $i ], '-' ) + 1 ) );
				if ( ! isset( $widget_data[ $widget['type'] ][ $widget['type-index'] ] ) ) {
					unset( $sidebar_data[ $type ][ $i ] );
				}
			}
			$sidebar_data[ $type ] = array_values( $sidebar_data[ $type ] );
		}

		$sidebar_data = array( array_filter( $sidebar_data ), $widget_data );

		$starter_content[ $demo_key ]['widgets'] = false;

		if ( ! $this->parse_import_data( $sidebar_data, $demo_key ) ) {

			$starter_content[ $demo_key ]['widgets'] = true;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			return false;
		}

		return $starter_content[ $demo_key ]['widgets'];
	}

	/**
	 * Import widgets with the settings already parsed on the data origin server.
	 *
	 * @param $demo_key
	 * @param $base_url
	 *
	 * @return bool|null
	 */
	private function import_parsed_widgets( $demo_key, $base_url ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}

		$request_url = trailingslashit( $base_url ) . 'widgets';

		$request_data = array(
			'post_types'     => empty( $starter_content[ $demo_key ]['post_types'] ) ? array() : $starter_content[ $demo_key ]['post_types'],
			'taxonomies'     => empty( $starter_content[ $demo_key ]['taxonomies'] )? array() : $starter_content[ $demo_key ]['taxonomies'],
			'placeholders'   => $this->get_placeholders( $demo_key ),
			'ignored_images' => $this->get_ignored_images( $demo_key ),
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => true,
		);

		// Increase timeout if the target URL is a development one so we can account for slow local (development) installations.
		if ( PixelgradeAssistant_Admin::is_development_url( $request_url ) ) {
			$request_args['timeout'] = 10;
		}

		// We will do a blocking request
		$response = wp_remote_request( $request_url, $request_args );
		if ( is_wp_error( $response ) ) {
			return false;
		}
		$response_data = json_decode( wp_remote_retrieve_body( $response ), true );
		// Bail in case of decode error or failure to retrieve data
		if ( null === $response_data || empty( $response_data['data']['widgets'][0] ) || empty( $response_data['data']['widgets'][1] ) ) {
			return false;
		}

		// First let's remove all the widgets in the sidebars to avoid a big mess
		$sidebars_widgets = wp_get_sidebars_widgets();
		foreach ( $sidebars_widgets as $sidebarID => $widgets ) {
			if ( $sidebarID != 'wp_inactive_widgets' ) {
				$sidebars_widgets[ $sidebarID ] = array();
			}
		}
		wp_set_sidebars_widgets( $sidebars_widgets );

		$sidebar_data = $response_data['data']['widgets'][0];
		$widget_data  = $response_data['data']['widgets'][1];

		if ( ! empty($sidebar_data ) ) {
			foreach ( $sidebar_data as $key => $sidebar ) {
				$count = count( $sidebar );
				for ( $i = 0; $i < $count; $i ++ ) {
					$widget               = array();
					$widget['type']       = trim( substr( $sidebar[ $i ], 0, strrpos( $sidebar[ $i ], '-' ) ) );
					$widget['type-index'] = trim( substr( $sidebar[ $i ], strrpos( $sidebar[ $i ], '-' ) + 1 ) );
					if ( ! isset( $widget_data[ $widget['type'] ][ $widget['type-index'] ] ) ) {
						unset( $sidebar_data[ $key ][ $i ] );
					}
				}
				$sidebar_data[ $key ] = array_values( $sidebar_data[ $key ] );
			}
		}

		if ( ! is_array( $sidebar_data ) || empty( $sidebar_data ) ) {
			return null;
		}

		$sidebar_data = array( array_filter( $sidebar_data ), $widget_data );

		$starter_content[ $demo_key ]['widgets'] = false;

		if ( $this->parse_import_data( $sidebar_data, $demo_key ) ) {

			$starter_content[ $demo_key ]['widgets'] = true;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			// ugly bug, ugly fix ... import widgets twice
			// @todo What Does This Mean? Ugly bug! What is the bug? Where the ... is it?!?
			$this->parse_import_data( $sidebar_data, $demo_key );
		}

		return $starter_content[ $demo_key ]['widgets'];
	}

	/**
	 * Widgets helpers
	 */
	private function parse_import_data( $import_array, $demo_key ) {
		// Bail if we have no data to work with
		if ( empty( $import_array[0] ) || empty( $import_array[1] ) ) {
			return false;
		}

		$sidebars_data = $import_array[0];
		$widget_data   = $import_array[1];

		$current_sidebars = wp_get_sidebars_widgets();
		$new_widgets      = array();

		foreach ( $sidebars_data as $import_sidebar => $import_widgets ) :
			$current_sidebars[ $import_sidebar ] = array();
			foreach ( $import_widgets as $import_widget ) :

				$import_widget = json_decode( json_encode( $import_widget ), true );

				$type                = trim( substr( $import_widget, 0, strrpos( $import_widget, '-' ) ) );
				$index               = trim( substr( $import_widget, strrpos( $import_widget, '-' ) + 1 ) );
				$current_widget_data = get_option( 'widget_' . $type );
				$new_widget_name     = $this->get_new_widget_name( $type, $index );
				$new_index           = trim( substr( $new_widget_name, strrpos( $new_widget_name, '-' ) + 1 ) );

				if ( ! empty( $new_widgets[ $type ] ) && is_array( $new_widgets[ $type ] ) ) {
					while ( array_key_exists( $new_index, $new_widgets[ $type ] ) ) {
						$new_index ++;
					}
				}
				$current_sidebars[ $import_sidebar ][] = $type . '-' . $new_index;
				if ( array_key_exists( $type, $new_widgets ) ) {
					$new_widgets[ $type ][ $new_index ] = $widget_data[ $type ][ $index ];
				} else {
					$current_widget_data[ $new_index ] = $widget_data[ $type ][ $index ];
					$new_widgets[ $type ] = $current_widget_data;
				}

				// All widgets should use the new format _multiwidget
				$new_widgets[ $type ]['_multiwidget'] = 1;
			endforeach;
		endforeach;

		if ( ! empty( $new_widgets ) && ! empty( $current_sidebars ) ) {
			foreach ( $new_widgets as $type => $content ) {
				// Save the data for each widget type
				$content = apply_filters( "pixassist_sce_import_widget_{$type}", $content, $type, $demo_key );
				update_option( 'widget_' . $type, $content );
			}

			// Save the sidebars data
			wp_set_sidebars_widgets( $current_sidebars );

			return true;
		}

		return false;
	}

	private function get_new_widget_name( $widget_name, $widget_index ) {
		$current_sidebars = get_option( 'sidebars_widgets' );
		$all_widget_array = array();
		foreach ( $current_sidebars as $sidebar => $widgets ) {
			if ( ! empty( $widgets ) && is_array( $widgets ) && $sidebar != 'wp_inactive_widgets' ) {
				foreach ( $widgets as $widget ) {
					$all_widget_array[] = $widget;
				}
			}
		}
		while ( in_array( $widget_name . '-' . $widget_index, $all_widget_array ) ) {
			$widget_index ++;
		}
		$new_widget_name = $widget_name . '-' . $widget_index;

		return $new_widget_name;
	}

	/** CUSTOM FILTERS */
	public function prepare_menus_links( $post, $imported_ids, $demo_key ) {

		if ( 'nav_menu_item' !== $post['post_type'] ) {
			return;
		}

		/**
		 * We need to remap the nav menu item parent
		 */
		if ( 'nav_menu_item' !== $post['post_type'] && isset( $post['meta']['_menu_item_menu_item_parent'] ) ) {
			if ( ! empty( $post['meta']['_menu_item_menu_item_parent'] ) && isset( $imported_ids[ $post['meta']['_menu_item_menu_item_parent'] ] ) ) {
				update_post_meta( $imported_ids[ $post['ID'] ], '_menu_item_menu_item_parent', $imported_ids[ $post['meta']['_menu_item_menu_item_parent'] ] );
			}
		}

		$starter_content     = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		$menu_item_type      = maybe_unserialize( $post['meta']['_menu_item_type'] );
		$menu_item_type      = wp_slash( $menu_item_type[0] );
		$menu_item_object    = maybe_unserialize( $post['meta']['_menu_item_object'] );
		$menu_item_object    = wp_slash( $menu_item_object[0] );
		$menu_item_object_id = maybe_unserialize( $post['meta']['_menu_item_object_id'] );
		$menu_item_object_id = wp_slash( $menu_item_object_id[0] );
		$imported_post_id    = isset( $imported_ids[ $post['ID'] ] ) ? absint( $imported_ids[ $post['ID'] ] ) : 0;

		if ( $imported_post_id && ! empty( $post['taxonomies']['nav_menu'] ) ) {
			$menu_term_ids = array();

			foreach ( (array) $post['taxonomies']['nav_menu'] as $menu_term ) {
				if ( is_numeric( $menu_term ) && isset( $starter_content[ $demo_key ]['taxonomies']['nav_menu'][ $menu_term ] ) ) {
					$menu_term_ids[] = absint( $starter_content[ $demo_key ]['taxonomies']['nav_menu'][ $menu_term ] );
					continue;
				}

				$term = get_term_by( 'name', $menu_term, 'nav_menu' );
				if ( ! $term ) {
					$term = get_term_by( 'slug', sanitize_title( $menu_term ), 'nav_menu' );
				}

				if ( $term && ! is_wp_error( $term ) ) {
					$menu_term_ids[] = absint( $term->term_id );
				}
			}

			if ( ! empty( $menu_term_ids ) ) {
				wp_set_object_terms( $imported_post_id, array_values( array_unique( $menu_term_ids ) ), 'nav_menu', false );
			}
		}

		// Try to remap custom objects in nav items
		switch ( $menu_item_type ) {
			case 'taxonomy':
				if ( isset( $starter_content[ $demo_key ]['taxonomies'][ $menu_item_object ][ $menu_item_object_id ] ) ) {
					$menu_item_object_id = $starter_content[ $demo_key ]['taxonomies'][ $menu_item_object ][ $menu_item_object_id ];
				}
				break;
			case 'post_type':
				if ( isset( $starter_content[ $demo_key ]['post_types'][ $menu_item_object ][ $menu_item_object_id ] ) ) {
					$menu_item_object_id = $starter_content[ $demo_key ]['post_types'][ $menu_item_object ][ $menu_item_object_id ];
				}
				break;
			case 'custom':
				/**
				 * Remap custom links
				 */
				$meta_url = get_post_meta( $post['ID'], '_menu_item_url', true );
				if ( isset( $_POST['url'] ) && ! empty( $meta_url ) ) {
					$meta_url = str_replace( $_POST['url'], site_url(), $meta_url );
					update_post_meta( $post['ID'], '_menu_item_url', esc_url_raw( $meta_url ) );
				}
				break;
			default:
				// no clue
				break;
		}

		update_post_meta( $imported_ids[ $post['ID'] ], '_menu_item_object_id', wp_slash( $menu_item_object_id ) );
	}

	public function end_import() {
		$this->replace_demo_urls_in_content();
		$this->regenerate_style_manager_after_import();
	}

	/**
	 * Reset all imported starter content using the stored importer journal.
	 *
	 * @return array Reset counts summary.
	 */
	public function reset_starter_content() {
		$summary = array(
			'journals'             => 0,
			'posts_deleted'        => 0,
			'posts_missing'        => 0,
			'terms_deleted'        => 0,
			'terms_skipped'        => 0,
			'media_deleted'        => 0,
			'media_skipped'        => 0,
			'features_disabled'    => 0,
			'options_restored'     => 0,
			'theme_mods_restored'  => 0,
		);

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( empty( $starter_content ) || ! is_array( $starter_content ) ) {
			$remaining_features = $this->get_enabled_layout_features();
			if ( ! empty( $remaining_features ) ) {
				$summary['features_disabled'] += count( $remaining_features );
				PixelgradeAssistant_Admin::set_option( 'enabled_features', array() );
				PixelgradeAssistant_Admin::save_options();
			}

			return $summary;
		}

		$journals          = array();
		$restored_options = array();
		$restored_mods    = array();

		foreach ( $starter_content as $journal ) {
			if ( empty( $journal ) || ! is_array( $journal ) ) {
				continue;
			}

			$summary['journals']++;
			$journals[] = $journal;
			$this->reset_starter_content_posts( $journal, $summary );
			$this->reset_starter_content_terms( $journal, $summary );
			$this->reset_starter_content_media( $journal, $summary );
			$this->reset_starter_content_features( $journal, $summary );
		}

		for ( $i = count( $journals ) - 1; $i >= 0; $i-- ) {
			$this->reset_starter_content_settings( $journals[ $i ], $restored_options, $restored_mods );
		}

		$summary['options_restored']    = count( $restored_options );
		$summary['theme_mods_restored'] = count( $restored_mods );

		$remaining_features = $this->get_enabled_layout_features();
		if ( ! empty( $remaining_features ) ) {
			$summary['features_disabled'] += count( $remaining_features );
			PixelgradeAssistant_Admin::set_option( 'enabled_features', array() );
		}

		if ( 0 < $summary['journals'] ) {
			$this->regenerate_style_manager_after_import();

			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', array() );
			PixelgradeAssistant_Admin::save_options();
		}

		return $summary;
	}

	/**
	 * Delete journaled posts.
	 *
	 * @param array $journal Starter-content journal.
	 * @param array $summary Reset summary, by reference.
	 */
	private function reset_starter_content_posts( $journal, &$summary ) {
		if ( empty( $journal['post_types'] ) || ! is_array( $journal['post_types'] ) ) {
			return;
		}

		foreach ( $journal['post_types'] as $post_type_map ) {
			if ( empty( $post_type_map ) || ! is_array( $post_type_map ) ) {
				continue;
			}

			foreach ( $post_type_map as $post_id ) {
				$post_id = absint( $post_id );
				if ( empty( $post_id ) ) {
					continue;
				}

				$deleted = wp_delete_post( $post_id, true );
				if ( false === $deleted || null === $deleted ) {
					$summary['posts_missing']++;
				} else {
					$summary['posts_deleted']++;
				}
			}
		}
	}

	/**
	 * Delete journaled terms, while preserving built-in defaults and unknown taxonomies.
	 *
	 * @param array $journal Starter-content journal.
	 * @param array $summary Reset summary, by reference.
	 */
	private function reset_starter_content_terms( $journal, &$summary ) {
		if ( empty( $journal['taxonomies'] ) || ! is_array( $journal['taxonomies'] ) ) {
			return;
		}

		foreach ( $journal['taxonomies'] as $taxonomy => $term_map ) {
			if ( empty( $term_map ) || ! is_array( $term_map ) ) {
				continue;
			}

			$taxonomy = sanitize_key( $taxonomy );

			foreach ( $term_map as $term_id ) {
				$term_id = absint( $term_id );
				if ( empty( $term_id ) || $this->should_skip_reset_term( $taxonomy, $term_id ) ) {
					$summary['terms_skipped']++;
					continue;
				}

				$deleted = wp_delete_term( $term_id, $taxonomy );
				if ( false === $deleted || null === $deleted || is_wp_error( $deleted ) ) {
					$summary['terms_skipped']++;
				} else {
					$summary['terms_deleted']++;
				}
			}
		}
	}

	/**
	 * Delete journaled media only when the importer safety tag is present.
	 *
	 * @param array $journal Starter-content journal.
	 * @param array $summary Reset summary, by reference.
	 */
	private function reset_starter_content_media( $journal, &$summary ) {
		if ( empty( $journal['media'] ) || ! is_array( $journal['media'] ) ) {
			return;
		}

		foreach ( $journal['media'] as $media_map ) {
			if ( empty( $media_map ) || ! is_array( $media_map ) ) {
				continue;
			}

			foreach ( $media_map as $attachment_id ) {
				$attachment_id = absint( $attachment_id );
				if ( empty( $attachment_id ) ) {
					continue;
				}

				$metadata = wp_get_attachment_metadata( $attachment_id );
				if ( empty( $metadata['imported_with_pixassist'] ) ) {
					$summary['media_skipped']++;
					continue;
				}

				$deleted = wp_delete_attachment( $attachment_id, true );
				if ( false === $deleted || null === $deleted ) {
					$summary['media_skipped']++;
				} else {
					$summary['media_deleted']++;
				}
			}
		}
	}

	/**
	 * Disable journaled feature-unit flags.
	 *
	 * @param array $journal Starter-content journal.
	 * @param array $summary Reset summary, by reference.
	 */
	private function reset_starter_content_features( $journal, &$summary ) {
		if ( empty( $journal['enabled_features'] ) || ! is_array( $journal['enabled_features'] ) ) {
			return;
		}

		foreach ( $journal['enabled_features'] as $feature_slug => $enabled ) {
			if ( ! $enabled ) {
				continue;
			}

			$this->disable_layout_feature( $feature_slug );
			$summary['features_disabled']++;
		}
	}

	/**
	 * Restore option and theme-mod values stashed before import overwrites.
	 *
	 * @param array $journal          Starter-content journal.
	 * @param array $restored_options Unique restored option keys, by reference.
	 * @param array $restored_mods    Unique restored theme mod keys, by reference.
	 */
	private function reset_starter_content_settings( $journal, &$restored_options, &$restored_mods ) {
		foreach ( array( 'post_settings', 'pre_settings' ) as $settings_key ) {
			if ( empty( $journal[ $settings_key ] ) || ! is_array( $journal[ $settings_key ] ) ) {
				continue;
			}

			if ( ! empty( $journal[ $settings_key ]['options'] ) && is_array( $journal[ $settings_key ]['options'] ) ) {
				foreach ( $journal[ $settings_key ]['options'] as $option => $value ) {
					$option = (string) $option;
					update_option( $option, $value );
					$restored_options[ $option ] = true;
				}
			}

			if ( ! empty( $journal[ $settings_key ]['mods'] ) && is_array( $journal[ $settings_key ]['mods'] ) ) {
				foreach ( $journal[ $settings_key ]['mods'] as $mod => $value ) {
					$mod = (string) $mod;
					if ( false === $value || null === $value ) {
						remove_theme_mod( $mod );
					} else {
						set_theme_mod( $mod, $value );
					}

					$restored_mods[ $mod ] = true;
				}
			}
		}
	}

	/**
	 * Whether a journaled term must be preserved during reset.
	 *
	 * @param string $taxonomy Taxonomy key.
	 * @param int    $term_id  Term ID.
	 *
	 * @return bool
	 */
	private function should_skip_reset_term( $taxonomy, $term_id ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return true;
		}

		if ( ! term_exists( $term_id, $taxonomy ) ) {
			return true;
		}

		if ( 'category' === $taxonomy && $term_id === absint( get_option( 'default_category' ) ) ) {
			return true;
		}

		if ( 'post_format' === $taxonomy ) {
			return true;
		}

		return false;
	}

	/**
	 * Re-associate imported block templates with the ACTIVE theme.
	 *
	 * Block templates (`wp_template` / `wp_template_part`) are exported tied to the demo
	 * site's theme (e.g. `anima`), but the importing site's active theme may differ
	 * (e.g. the wp.org `anima-lt`). A template's override only applies when its `wp_theme`
	 * term matches the active theme, so without re-association a starter's `front-page`
	 * template would never take effect and the theme's own `front-page.html` (which can be
	 * a static showcase that ignores the assigned page) would stay in charge.
	 *
	 * @param array  $post         The source post data.
	 * @param array  $imported_ids Map of source post ID => imported post ID.
	 * @param string $demo_key
	 */
	public function reassign_imported_template_theme( $post, $imported_ids, $demo_key ) {
		if ( empty( $post['post_type'] ) || ! in_array( $post['post_type'], array( 'wp_template', 'wp_template_part' ), true ) ) {
			return;
		}

		if ( empty( $imported_ids[ $post['ID'] ] ) ) {
			return;
		}

		$active_theme     = get_stylesheet();
		$imported_post_id = absint( $imported_ids[ $post['ID'] ] );

		wp_set_object_terms( $imported_post_id, $active_theme, 'wp_theme' );

		if ( empty( $post['post_content'] ) ) {
			return;
		}

		$updated_content = $this->rewrite_template_part_theme_references( (string) $post['post_content'], $active_theme );
		if ( (string) $post['post_content'] === $updated_content ) {
			return;
		}

		wp_update_post( array(
			'ID'           => $imported_post_id,
			'post_content' => wp_slash( $updated_content ),
		) );
	}

	/**
	 * Repoint nested template-part blocks to the active theme.
	 *
	 * @param string $content      Block template content.
	 * @param string $active_theme Active theme stylesheet.
	 *
	 * @return string
	 */
	private function rewrite_template_part_theme_references( $content, $active_theme ) {
		if ( false === strpos( $content, 'wp:template-part' ) ) {
			return $content;
		}

		if ( function_exists( 'parse_blocks' ) && function_exists( 'serialize_blocks' ) ) {
			$changed = false;
			$blocks  = $this->rewrite_template_part_theme_blocks( parse_blocks( $content ), $active_theme, $changed );

			return $changed ? serialize_blocks( $blocks ) : $content;
		}

		return preg_replace_callback(
			'/<!--\s+wp:template-part\s+(\{.*?\})\s+\/-->/s',
			function ( $matches ) use ( $active_theme ) {
				$attrs = json_decode( $matches[1], true );
				if ( ! is_array( $attrs ) || empty( $attrs['theme'] ) || $active_theme === $attrs['theme'] ) {
					return $matches[0];
				}

				$attrs['theme'] = $active_theme;

				return '<!-- wp:template-part ' . wp_json_encode( $attrs ) . ' /-->';
			},
			$content
		);
	}

	/**
	 * Recursively update parsed template-part blocks.
	 *
	 * @param array  $blocks       Parsed blocks.
	 * @param string $active_theme Active theme stylesheet.
	 * @param bool   $changed      Whether a block attribute changed.
	 *
	 * @return array
	 */
	private function rewrite_template_part_theme_blocks( $blocks, $active_theme, &$changed ) {
		foreach ( $blocks as $index => $block ) {
			if ( ! empty( $block['blockName'] ) && 'core/template-part' === $block['blockName'] && ! empty( $block['attrs']['theme'] ) && $active_theme !== $block['attrs']['theme'] ) {
				$blocks[ $index ]['attrs']['theme'] = $active_theme;
				$changed = true;
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$blocks[ $index ]['innerBlocks'] = $this->rewrite_template_part_theme_blocks( $block['innerBlocks'], $active_theme, $changed );
			}
		}

		return $blocks;
	}

	/**
	 * Force Style Manager to rebuild its generated CSS after an import.
	 *
	 * The importer writes the `sm_*` design options directly (via `update_option`), which
	 * bypasses Style Manager's own save hooks. As a result the freshly imported palette and
	 * fonts are not reflected on the front end until its cached output is invalidated. We
	 * clear the known SM caches (NOT the imported design options themselves) so the correct
	 * design is regenerated on the next request.
	 */
	private function regenerate_style_manager_after_import() {
		global $wpdb;

		// Only cache/output rows match these patterns; the design options (`sm_advanced_palette_*`,
		// `sm_font_*`, etc.) do not, so they are preserved.
		$wpdb->query(
			"DELETE FROM {$wpdb->options}
			 WHERE option_name LIKE 'pixelgrade_style_manager%'
			    OR option_name LIKE '_transient_%style_manager%'
			    OR option_name LIKE '_transient_timeout_%style_manager%'
			    OR option_name LIKE '%customify_style%'
			    OR option_name LIKE 'sm_dynamic%'"
		);

		// Let Style Manager / the theme flush their own caches if they expose hooks for it.
		do_action( 'style_manager/invalidate_all_caches' );
		do_action( 'customify_invalidate_all_caches' );

		// Apply the imported font palette to the theme's connected font fields. A headless option write
		// (as the importer does) doesn't trigger the Customizer's font-connection JS, so without this the
		// theme's font fields keep their System defaults and the design's fonts never render.
		$this->apply_style_manager_font_palette();

		wp_cache_flush();
	}

	/**
	 * Mirror the Customizer's "select font palette" propagation for a headless import.
	 *
	 * Selecting a Style Manager font palette in the Customizer copies the palette's fonts into the
	 * theme's connected font fields (e.g. `body_font` ← `sm_font_body`) via JS. Our import only writes
	 * the `sm_*` palette options, so we ask Style Manager to do that propagation server-side. Guarded so
	 * an absent or older Style Manager (without the server-side apply path) never breaks the import.
	 */
	private function apply_style_manager_font_palette() {
		if ( ! function_exists( '\Pixelgrade\StyleManager\plugin' ) ) {
			return;
		}

		try {
			$font_palettes = \Pixelgrade\StyleManager\plugin()->get_container()->get( 'customize.font_palettes' );
			if ( is_object( $font_palettes ) && method_exists( $font_palettes, 'apply_current_font_palette_to_connected_fields' ) ) {
				$font_palettes->apply_current_font_palette_to_connected_fields();
			}
		} catch ( \Throwable $e ) {
			// Style Manager is inactive or predates the server-side apply path; nothing to do.
		}
	}

	/**
	 * Here we need to re-map all the links inside the post content
	 * @TODO this is awful, we need to better handle this
	 */
	private function replace_demo_urls_in_content() {
		global $wpdb;

		// Use the demo base URL captured during the import steps; fall back to the request body.
		$demo_url = get_transient( 'pixassist_sce_demo_url' );
		if ( empty( $demo_url ) && ! empty( $_POST['url'] ) ) {
			$demo_url = wp_unslash( $_POST['url'] );
		}
		$demo_url = esc_url_raw( $demo_url );
		if ( empty( $demo_url ) ) {
			// Without the demo URL there is nothing safe to remap (an empty search would be a no-op).
			return;
		}
		// Match (and replace) with a trailing slash so a sub-path like `/feed` keeps its separator
		// (a bare site_url() would turn `…/hive-lite/feed` into `…localfeed`).
		$search  = trailingslashit( $demo_url );
		$replace = trailingslashit( site_url() );

		// remap absolute demo links inside post content
		$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s)", $search, $replace ) );

		// The captured demo URL is the SCE REST base (…/wp-json/sce/v2/). In-content links such as a
		// "View the Menu" button or an attachment permalink use the demo SITE root instead, so they
		// survive the replace above. Derive the site root and remap those too, keeping the import
		// self-contained (no links pointing back at the demo site).
		$demo_site = preg_replace( '#wp-json/.*$#', '', $demo_url );
		if ( ! empty( $demo_site ) && $demo_site !== $demo_url ) {
			$search_site  = trailingslashit( $demo_site );
			$replace_site = trailingslashit( site_url() );
			$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s)", $search_site, $replace_site ) );
		}

		// remap enclosure urls
		$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->postmeta} SET meta_value = REPLACE(meta_value, %s, %s) WHERE meta_key='enclosure'", $search, $replace ) );

		// remap custom-link menu item urls (e.g. a "Home" item that still points at the theme demo)
		$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->postmeta} SET meta_value = REPLACE(meta_value, %s, %s) WHERE meta_key='_menu_item_url'", $search, $replace ) );

		delete_transient( 'pixassist_sce_demo_url' );
	}

	/**
	 * Replace the value of the `page_on_front` option with the id of the local front page
	 *
	 * @param $value
	 * @param $demo_key
	 *
	 * @return mixed
	 */
	public function filter_post_option_page_on_front( $value, $demo_key ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( isset( $starter_content[ $demo_key ]['post_types']['page'][ $value ] ) ) {
			return $starter_content[ $demo_key ]['post_types']['page'][ $value ];
		}

		return $value;
	}

	/**
	 * Replace the value of the `page_for_posts` option with the id of the local blog page
	 *
	 * @param $value
	 * @param $demo_key
	 *
	 * @return mixed
	 */
	public function filter_post_option_page_for_posts( $value, $demo_key ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( isset( $starter_content[ $demo_key ]['post_types']['page'][ $value ] ) ) {
			return $starter_content[ $demo_key ]['post_types']['page'][ $value ];
		}

		return $value;
	}

	/**
	 * Replace each menu id from `nav_menu_locations` with the new menus ids
	 *
	 * @param $locations
	 * @param $demo_key
	 *
	 * @return mixed
	 */
	public function filter_post_theme_mod_nav_menu_locations( $locations, $demo_key ) {
		if ( empty( $locations ) ) {
			return $locations;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		foreach ( $locations as $location => $menu ) {
			if ( ! empty( $starter_content[ $demo_key ]['taxonomies']['nav_menu'][ $menu ] ) ) {
				$locations[ $location ] = $starter_content[ $demo_key ]['taxonomies']['nav_menu'][ $menu ];
			}
		}

		return $locations;
	}

	/**
	 * If there is a custom logo set, it will surely come with another attachment_id
	 * Wee need to replace the old attachment id with the local one
	 *
	 * @param $attach_id
	 * @param $demo_key
	 *
	 * @return mixed
	 */
	public function filter_post_theme_mod_custom_logo( $attach_id, $demo_key ) {
		if ( empty( $attach_id ) ) {
			return $attach_id;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content[ $demo_key ]['media']['ignored'][ $attach_id ] ) ) {
			return $starter_content[ $demo_key ]['media']['ignored'][ $attach_id ];
		}

		if ( ! empty( $starter_content[ $demo_key ]['media']['placeholders'][ $attach_id ] ) ) {
			return $starter_content[ $demo_key ]['media']['placeholders'][ $attach_id ];
		}

		// The image-import pass only covers media the exporter advertised (the `ignored` / `placeholders`
		// lists). A logo control can reference an attachment that was left out of that set — e.g. a
		// transparent-header logo that is not attached to any post — so its theme mod would otherwise keep
		// the stale demo ID and render nothing. As a fallback, sideload that one attachment directly from
		// the demo and remap to the local copy. Guarded + fail-safe: returns the original ID on any miss.
		$local_id = $this->sideload_demo_attachment( $attach_id, $demo_key );
		if ( ! empty( $local_id ) ) {
			return $local_id;
		}

		return $attach_id;
	}

	/**
	 * Sideload a single demo attachment by its (remote) ID and map it to a local copy.
	 *
	 * Fallback for logo theme mods whose image was not part of the exporter's media set. We resolve the
	 * attachment's public source URL from the demo's standard REST media endpoint, download it, and store
	 * the demo ID => local ID mapping in the same `media.ignored` table the regular image import uses (so
	 * a later import / reset cleans it up consistently). Fully guarded: any failure returns false and the
	 * caller keeps the original (stale) ID, exactly as before.
	 *
	 * @param int    $attach_id Remote (demo) attachment ID.
	 * @param string $demo_key
	 *
	 * @return int|false The local attachment ID, or false if it could not be sideloaded.
	 */
	private function sideload_demo_attachment( $attach_id, $demo_key ) {
		$attach_id = absint( $attach_id );
		if ( empty( $attach_id ) ) {
			return false;
		}

		// The demo base URL captured during the import steps (the SCE REST base).
		$demo_url = esc_url_raw( (string) get_transient( 'pixassist_sce_demo_url' ) );
		if ( empty( $demo_url ) ) {
			return false;
		}

		// Derive the demo site root from the SCE REST base (…/wp-json/sce/v2/ -> …/).
		$demo_site = preg_replace( '#wp-json/.*$#', '', $demo_url );
		if ( empty( $demo_site ) ) {
			return false;
		}

		// Never fetch from a host we do not serve demos from (SSRF guard).
		if ( ! $this->is_allowed_demo_url( $demo_site ) ) {
			return false;
		}

		$media = $this->get_cached_layout_source( array( 'media', trailingslashit( esc_url_raw( $demo_url ) ), $attach_id ) );
		if ( false === $media || empty( $media['source_url'] ) ) {
			// Resolve the attachment's public source URL from the demo's standard REST media endpoint.
			$endpoint = trailingslashit( $demo_site ) . 'wp-json/wp/v2/media/' . $attach_id;
			$response = wp_remote_get( $endpoint, array( 'timeout' => 15 ) );
			if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
				return false;
			}

			$media = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( ! empty( $media['source_url'] ) ) {
				$this->set_cached_layout_source(
					array( 'media', trailingslashit( esc_url_raw( $demo_url ) ), $attach_id ),
					array( 'source_url' => esc_url_raw( $media['source_url'] ) )
				);
			}
		}

		if ( empty( $media['source_url'] ) ) {
			return false;
		}

		// The image must also live on an allowed demo host (it normally shares the demo's host).
		$source_url = esc_url_raw( $media['source_url'] );
		if ( empty( $source_url ) || ! $this->is_allowed_demo_url( $source_url ) ) {
			return false;
		}

		// Sideload the file into the media library.
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = download_url( $source_url, 15 );
		if ( is_wp_error( $tmp ) ) {
			return false;
		}

		$file_array = array(
			'name'     => wp_basename( wp_parse_url( $source_url, PHP_URL_PATH ) ),
			'tmp_name' => $tmp,
		);

		$local_id = media_handle_sideload( $file_array, 0 );
		if ( is_wp_error( $local_id ) ) {
			wp_delete_file( $tmp );
			return false;
		}

		// Tag it like the rest of the imported media so a reset / re-import treats it the same way.
		$metadata = wp_get_attachment_metadata( $local_id );
		if ( ! is_array( $metadata ) ) {
			$metadata = array();
		}
		$metadata['imported_with_pixassist'] = true;
		wp_update_attachment_metadata( $local_id, $metadata );

		// Remember the demo => local mapping in the same table the image import uses.
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}
		if ( empty( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( empty( $starter_content[ $demo_key ]['media'] ) ) {
			$starter_content[ $demo_key ]['media'] = array();
		}
		if ( empty( $starter_content[ $demo_key ]['media']['ignored'] ) ) {
			$starter_content[ $demo_key ]['media']['ignored'] = array();
		}
		$starter_content[ $demo_key ]['media']['ignored'][ $attach_id ] = $local_id;
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		return $local_id;
	}

	/**
	 * We should allow svg uploads but only inside our REST route `sce/v2/upload_media`
	 * @param $mimes
	 *
	 * @return mixed
	 */
	public function allow_svg_upload( $mimes ) {
		$mimes['svg'] = 'image/svg+xml';

		return $mimes;
	}

	/**
	 * Whatever the Exporter tells us, we will not replace the theme's style with the Jetpack's custom CSS
	 * @param $value
	 *
	 * @return mixed
	 */
	public function uncheck_jetpack_custom_css_style_replacement( $value ) {
		if ( isset( $value['replace'] ) ) {
			$value['replace'] = false;
		}

		return $value;
	}

	/** END CUSTOM FILTERS */

	/**
	 * HELPERS
	 */
	private function get_placeholders( $demo_key ) {
		$imported_ids = array();

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content[ $demo_key ]['media']['placeholders'] ) ) {
			foreach ( $starter_content[ $demo_key ]['media']['placeholders'] as $old_id => $new_id ) {
				$sizes = $this->get_image_thumbnails_urls( $new_id );
				if ( ! empty( $sizes ) ) {
					$imported_ids[ $old_id ] = array(
						'id'    => $new_id,
						'sizes' => $this->get_image_thumbnails_urls( $new_id ),
					);
				}
			}
		}

		return $imported_ids;
	}

	private function get_ignored_images( $demo_key ) {
		$imported_ids = array();

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content[ $demo_key ]['media']['ignored'] ) ) {
			foreach ( $starter_content[ $demo_key ]['media']['ignored'] as $old_id => $new_id ) {
				$sizes = $this->get_image_thumbnails_urls( $new_id );
				if ( ! empty( $sizes ) ) {
					$imported_ids[ $old_id ] = array(
						'id'    => $new_id,
						'sizes' => $this->get_image_thumbnails_urls( $new_id ),
					);
				}
			}
		}

		return $imported_ids;
	}

	/**
	 * Get an array with image thumbnail URLs for a certain image ID.
	 *
	 * @param int $image_id
	 *
	 * @return array
	 */
	private function get_image_thumbnails_urls( $image_id ) {
		$sizes = array();

		// First make sure that we at least have the full size
		$src = wp_get_attachment_image_src( $image_id, 'full' );
		if ( ! empty( $src[0] ) ) {
			$sizes['full'] = $src[0];
		}

		foreach ( get_intermediate_image_sizes() as $size ) {
			$src            = wp_get_attachment_image_src( $image_id, $size );
			if ( ! empty( $src[0] ) ) {
				$sizes[ $size ] = $src[0];
			}
		}

		return $sizes;
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return false|int
	 */
		public function permission_nonce_callback( $request ) {
			// Defense in depth: starter-content import is an admin-only operation (it creates posts,
			// uploads media, and writes theme mods/options), so require the capability plus the nonce.
			if ( ! current_user_can( 'manage_options' ) ) {
				return false;
		}

			return (bool) wp_verify_nonce( $this->get_nonce( $request ), 'pixelgrade_assistant_rest' );
		}

		/**
		 * Validate the token used by the internal queued layout-unit worker route.
		 *
		 * @param WP_REST_Request $request Request object.
		 *
		 * @return bool
		 */
		public function permission_layout_unit_job_callback( $request ) {
			$params = $request->get_params();
			$job_id = isset( $params['job_id'] ) ? sanitize_key( $params['job_id'] ) : '';
			$token  = isset( $params['token'] ) ? sanitize_text_field( $params['token'] ) : '';

			if ( empty( $job_id ) || empty( $token ) ) {
				return false;
			}

			$job = $this->get_layout_unit_job( $job_id );
			if ( empty( $job['token'] ) ) {
				return false;
			}

			return hash_equals( (string) $job['token'], (string) $token );
		}

		/**
		 * @param WP_REST_Request $request
		 *
	 * @return null|string
	 */
	private function get_nonce( $request ) {
		$nonce = null;

		// Get the nonce we've been given
		$nonce = $request->get_param( 'pixassist_nonce' );
		if ( ! empty( $nonce ) ) {
			$nonce = wp_unslash( $nonce );
		}

		return $nonce;
	}

	/**
	 * Decodes a base64 encoded chunk.
	 *
	 * @param string $data
	 *
	 * @return array|bool|string
	 */
	private function decode_chunk( $data ) {
		$data = explode( ';base64,', $data );

		if ( ! is_array( $data ) || ! isset( $data[1] ) ) {
			return false;
		}

		return base64_decode( $data[1] );
	}

	private function the_slug_exists( $post_name, $post_type ) {
		global $wpdb;

		$post_id = $wpdb->get_var( "SELECT ID FROM $wpdb->posts WHERE post_name = '" . $post_name . "' AND post_type = '" . $post_type . "' LIMIT 1" );
		if ( ! empty( $post_id ) ) {
			return $post_id;
		} else {
			return false;
		}
	}

	/**
	 * Main PixelgradeAssistantStarterContent Instance
	 *
	 * Ensures only one instance of PixelgradeAssistantStarterContent is loaded or can be loaded.
	 *
	 * @static
	 *
	 * @param  PixelgradeAssistant $parent Main PixelgradeAssistant instance.
	 *
	 * @return PixelgradeAssistant_StarterContent Main PixelgradeAssistantStarterContent instance
	 */
	public static function instance( $parent ) {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $parent );
		}

		return self::$_instance;
	}

	/**
	 * Cloning is forbidden.
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	}
}
