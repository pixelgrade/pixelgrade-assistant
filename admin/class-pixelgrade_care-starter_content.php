<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 *
 * Class responsable for the Starter Content Component
 * Basically this is an Import Demo Data system
 *
 * @since    1.1.6
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/admin
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant_StarterContent {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 * @since     1.3.0
	 */
	public $parent = null;

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_StarterContent
	 * @access  protected
	 * @since   1.3.0
	 */
	protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.1.6
	 * @param PixelgradeAssistant $parent The parent instance.
	 */
	public function __construct( $parent ) {
		$this->parent = $parent;

		add_action( 'rest_api_init', array( $this, 'add_rest_routes_api' ) );

		// Add some data to the localized data
		add_filter( 'pixassist_localized_data', array( $this, 'localize_js_data' ) );

		if ( apply_filters( 'pixcare_sce_allow_options_filtering', true ) ) {
			add_filter( 'pixcare_sce_import_post_option_page_on_front', array(
				$this,
				'filter_post_option_page_on_front'
			) );
			add_filter( 'pixcare_sce_import_post_option_page_for_posts', array(
				$this,
				'filter_post_option_page_for_posts'
			) );
			add_filter( 'pixcare_sce_import_post_theme_mod_nav_menu_locations', array(
				$this,
				'filter_post_theme_mod_nav_menu_locations'
			) );

			/*
			 * Replace the custom logo attachment ID with the new one.
			 */
			add_filter( 'pixcare_sce_import_post_theme_mod_custom_logo', array( $this, 'filter_post_theme_mod_custom_logo' ) );
			/**
			 * Some themes use custom keys for various attachment ID controls, so we need to treat them separately.
			 */
			add_filter( 'pixcare_sce_import_post_theme_mod_osteria_transparent_logo', array( $this, 'filter_post_theme_mod_custom_logo' ) );
			add_filter( 'pixcare_sce_import_post_theme_mod_pixelgrade_transparent_logo', array( $this, 'filter_post_theme_mod_custom_logo' ) );

			// prevent Jetpack from disabling the theme's style on import
			add_filter( 'pixcare_sce_import_post_theme_mod_jetpack_custom_css', array( $this, 'uncheck_jetpack_custom_css_style_replacement' ) );

			//widgets

			// content links
			add_action( 'pixcare_sce_after_insert_post', array( $this, 'prepare_menus_links' ), 10, 2 );
			add_action( 'pixcare_sce_import_end', array( $this, 'end_import' ) );
		}
	}

	/**
	 * Filter the pixcare localized data and add the starterContent data to the themeMod
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
		}

		return $localized_data;
	}

	/** RESTful methods */
	public function add_rest_routes_api() {
		register_rest_route( 'pixcare/v1', '/import', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_import_step' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
		) );

		register_rest_route( 'pixcare/v1', '/upload_media', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_upload_media' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'args'                => array(
				'file_data'     => array( 'required' => true ),
				'title'         => array( 'required' => true ),
				'group'         => array( 'required' => true ),
				'ext'           => array( 'required' => true ),
				'remote_id'     => array( 'required' => true ),
				'pixassist_nonce' => array( 'required' => true ),
			),
		) );
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

		$display_errors = @ini_set( 'display_errors', 0 );

		add_filter( 'upload_mimes', array( $this, 'allow_svg_upload' ) );

		if ( ob_get_length() ) {
			ob_get_clean();
		}

		$wp_upload_dir = wp_upload_dir();

		// @todo We should do some checking and validation here
		$group = $params['group'];

		$title = $params['title'];

		$remote_id = $params['remote_id'];

		$filename = $title . '.' . $params['ext']; //basename( $file_path );

		$file_path = trailingslashit( $wp_upload_dir['path'] ) . $filename;

		$file_data = $this->decode_chunk( $params['file_data'] );

		if ( false === $file_data ) {
			@ini_set( 'display_errors', $display_errors );
			wp_send_json_error( 'no data' );
		}

		$upload_file = wp_upload_bits( $filename, null, $file_data );

		if ( $upload_file['error'] ) {
			@ini_set( 'display_errors', $display_errors );

			return rest_ensure_response( 'File permission error' );
		}

		$wp_filetype = wp_check_filetype( $filename, null );

		$attachment = array(
			'guid'           => $upload_file['url'],
			'post_mime_type' => $wp_filetype['type'],
			'post_parent'    => 0,
			'post_title'     => $title,
			'post_content'   => '',
			'post_status'    => 'inherit'
		);

		$attachment_id = wp_insert_attachment( $attachment, $upload_file['file'] );

		if ( ! is_wp_error( $attachment_id ) ) {
			// cache posts already imported
			$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

			// Make sure that we have the necessary entries
			if ( null === $starter_content || ! is_array( $starter_content ) ) {
				$starter_content = array();
			}
			if ( ! isset( $starter_content['media'] ) ) {
				$starter_content['media'] = array();
			}
			if ( ! isset( $starter_content['media'][ $group ] ) ) {
				$starter_content['media'][ $group ] = array();
			}

			// Remember the attachment ID
			$starter_content['media'][ $group ][ $remote_id ] = $attachment_id;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			require_once( ABSPATH . 'wp-admin/includes/image.php' );

			$attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload_file['file'] );

			$attachment_data['imported_with_pixcare'] = true;

			wp_update_attachment_metadata( $attachment_id, $attachment_data );

			@ini_set( 'display_errors', $display_errors );

			return rest_ensure_response( array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'attachmentID' => $attachment_id,
				),
			) );
		}

		@ini_set( 'display_errors', $display_errors );

		return rest_ensure_response( array(
			'code'    => 'error',
			'message' => esc_html__( 'Something went wrong with uploading the media file.', '__plugin_txtd' ),
			'data'    => array(
				'error' => $attachment_id,
			),
		) );
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

		$display_errors = @ini_set( 'display_errors', 0 );

		// clear whatever was printed before, we only need a pure json
		if ( ob_get_length() ) {
			ob_get_clean();
		}

		// We need to import posts without the intervention of the cache system
		wp_defer_term_counting( true );
		wp_defer_comment_counting( true );
		wp_suspend_cache_invalidation( true );

		if ( empty( $params['args'] ) || empty( $params['type'] ) || empty( $params['url'] ) ) {
			@ini_set( 'display_errors', $display_errors );

			return rest_ensure_response( array(
				'code'    => 'missing_params',
				'message' => 'You need to provide all the needed parameters.',
				'data'    => array(),
			) );
		}

		$base_url = $params['url'];
		$type     = $params['type'];
		$args     = $params['args'];

		// The default response data
		$response   = array();

		switch ( $type ) {
			case 'post_type': {
				$result = $this->import_post_type( $base_url, $args );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['importedPostIds'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'taxonomy': {
				$result = $this->import_taxonomy( $base_url, $args );
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

				$result = $this->import_widgets( $args['data'] );
				if ( ! is_wp_error( $result ) && ! $result instanceof WP_REST_Response ) {
					$response['widgets'] = $result;
				} else {
					$response = $result;
				}
				break;
			}

			case 'parsed_widgets': {

				$result = $this->import_parsed_widgets( $base_url );
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

				$result = $this->import_settings( 'pre', $args['data'] );
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

				$result = $this->import_settings( 'post', $args['data'] );
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

		@ini_set( 'display_errors', $display_errors );

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
	 * Import posts of a certain post type.
	 *
	 * @param $base_url
	 * @param array $args
	 *
	 * @return bool|array|WP_REST_Response False on failure, the imported post IDs otherwise.
	 */
	private function import_post_type( $base_url, $args = array() ) {
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
		if ( ! isset( $starter_content['post_types'] ) ) {
			$starter_content['post_types'] = array();
		}

		$request_url = $base_url . '/wp-json/sce/v2/posts';

		$request_data = array(
			'post_type'      => $args['post_type'],
			'include'        => $args['ids'],
			'placeholders'   => $this->get_placeholders(),
			'ignored_images' => $this->get_ignored_images(),
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => false,
		);

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
				'message' => 'Something went wrong with decoding the data received.',
				'data'    => array(
					'response' => wp_remote_retrieve_body( $response ),
				),
			) );
		}

		if ( empty( $response_data['code'] ) || 'success' !== $response_data['code'] ) {
			return rest_ensure_response( $response_data );
		}

		foreach ( $response_data['data']['posts'] as $i => $post ) {
			if ( $this->the_slug_exists( $post['post_name'], $post['post_type'] ) ) {
				// If the we have already imported this post, keep the data
				if ( isset( $starter_content['post_types'][ $args['post_type'] ][ $post['ID'] ] ) ) {
					$imported_ids[ $post['ID'] ] = $starter_content['post_types'][ $args['post_type'] ][ $post['ID'] ];
				} else {
					// At least remember something about this post
					$imported_ids[ $post['ID'] ] = $post['ID'];
				}
				continue;
			}

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
					'imported_with_pixcare' => true
				)
			);

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
						$post_args['meta_input'][ $key ] = apply_filters( 'sce_pre_postmeta', $meta, $key );
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
						if ( is_numeric( $term ) && isset( $starter_content['taxonomies'][ $taxonomy ][ $term ] ) ) {
							$term = $starter_content['taxonomies'][ $taxonomy ][ $term ];
						}

						$post_args['tax_input'][ $taxonomy ][] = $term;
					}
				}
			}

			$post_id = wp_insert_post( $post_args );

			if ( is_wp_error( $post_id ) || empty( $post_id ) ) {
				// well ... error
				$imported_ids[ $post['ID'] ] = $post_id;
			} else {
				$imported_ids[ $post['ID'] ] = $post_id;
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

			do_action( 'pixcare_sce_after_insert_post', $post, $imported_ids );
		}

		// Remember the imported post IDs
		$starter_content['post_types'][ $args['post_type'] ] = $imported_ids;
		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		// Return the imported post IDs
		return $imported_ids;
	}

	/**
	 * Import the terms from a certain taxonomy.
	 *
	 * @param $base_url
	 * @param $args
	 *
	 * @return bool|array|WP_Error|WP_REST_Response
	 */
	private function import_taxonomy( $base_url, $args ) {
		$imported_ids = array();

		if ( empty( $args['ids'] ) ) {
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
		if ( ! isset( $starter_content['taxonomies'] ) ) {
			$starter_content['taxonomies'] = array();
		}

		$request_url = $base_url . '/wp-json/sce/v2/terms';

		$request_data = array(
			'taxonomy' => $args['tax'],
			'include'  => $args['ids'],
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => false,
		);

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
				'description' => $term['description'],
				'slug'        => $term['slug'],
			);

			$new_id = wp_insert_term(
				$term['name'], // the term
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

						if ( 'pix_term_icon' === $key && isset( $starter_content['media']['ignored'][ $value ] ) ) {
							$value = $starter_content['media']['ignored'][ $value ];
						}

						update_term_meta( $new_id['term_id'], $key, $value );
					}
					update_term_meta( $new_id['term_id'], 'imported_with_pixcare', true );
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
		$starter_content['taxonomies'][ $args['tax'] ] = $imported_ids;
		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		// Return the imported term IDs
		return $imported_ids;
	}

	private function import_settings( $type, $data ) {
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
		if ( ! isset( $starter_content[ $settings_key ] ) ) {
			$starter_content[ $settings_key ] = array();
		}

		if ( ! empty( $data['mods'] ) ) {

			if ( ! isset( $starter_content[ $settings_key ]['mods'] ) ) {
				$starter_content[ $settings_key ]['mods'] = array();
			}

			foreach ( $data['mods'] as $mod => $value ) {
				$starter_content[ $settings_key ]['mods'][ $mod ] = get_theme_mod( $mod );

				$value = apply_filters( "pixcare_sce_import_{$type}_theme_mod_{$mod}", $value );

				set_theme_mod( $mod, $value );
			}
		}

		if ( ! empty( $data['options'] ) ) {
			if ( ! isset( $starter_content[ $settings_key ]['options'] ) ) {
				$starter_content[ $settings_key ]['options'] = array();
			}

			foreach ( $data['options'] as $option => $value ) {
				$starter_content[ $settings_key ]['options'][ $option ] = get_option( $option );

				$value = apply_filters( "pixcare_sce_import_{$type}_option_{$option}", $value );

				update_option( $option, $value );
			}
		}

		if ( 'pre' === $type ) {
			do_action( 'pixcare_sce_import_start' );
		}


		if ( 'post' === $type ) {
			do_action( 'pixcare_sce_import_end' );
		}

		// Save the data in the DB
		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
		PixelgradeAssistant_Admin::save_options();

		return true;
	}

	/**
	 * Import the widgets (not used right now).
	 *
	 * @param $data
	 *
	 * @return bool
	 */
	private function import_widgets( $data ) {

		if ( empty( $data ) ) {
			return false;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
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

		$starter_content['widgets'] = false;

		if ( ! $this->parse_import_data( $sidebar_data ) ) {

			$starter_content['widgets'] = true;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			return false;
		}

		return $starter_content['widgets'];
	}

	/**
	 * Import widgets with the settings already parsed on the data origin server.
	 *
	 * @param $base_url
	 *
	 * @return bool|null
	 */
	private function import_parsed_widgets( $base_url ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		// Make sure that we have the necessary entries
		if ( null === $starter_content || ! is_array( $starter_content ) ) {
			$starter_content = array();
		}

		$request_url = $base_url . '/wp-json/sce/v2/widgets';

		$request_data = array(
			'post_types'     => $starter_content['post_types'],
			'taxonomies'     => $starter_content['taxonomies'],
			'placeholders'   => $this->get_placeholders(),
			'ignored_images' => $this->get_ignored_images(),
		);

		$request_args = array(
			'method' => 'POST',
			'timeout'   => 5,
			'blocking'  => true,
			'body'      => $request_data,
			'sslverify' => false,
		);

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

		$starter_content['widgets'] = false;

		if ( $this->parse_import_data( $sidebar_data ) ) {

			$starter_content['widgets'] = true;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			// ugly bug, ugly fix ... import widgets twice
			// @todo What Does This Mean? Ugly bug! What is the bug? Where the ... is it?!?
			$this->parse_import_data( $sidebar_data );
		}

		return $starter_content['widgets'];
	}

	/**
	 * Widgets helpers
	 */
	private function parse_import_data( $import_array ) {
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
				$content = apply_filters( "pixcare_sce_import_widget_{$type}", $content, $type );
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
	public function prepare_menus_links( $post, $imported_ids ) {

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

		// Try to remap custom objects in nav items
		switch ( $menu_item_type ) {
			case 'taxonomy':
				if ( isset( $starter_content['taxonomies'][ $menu_item_object ][ $menu_item_object_id ] ) ) {
					$menu_item_object_id = $starter_content['taxonomies'][ $menu_item_object ][ $menu_item_object_id ];
				}
				break;
			case 'post_type':
				if ( isset( $starter_content['post_types'][ $menu_item_object ][ $menu_item_object_id ] ) ) {
					$menu_item_object_id = $starter_content['post_types'][ $menu_item_object ][ $menu_item_object_id ];
				}
				break;
			case 'custom':
				/**
				 * Remap custom links
				 */
				$meta_url = get_post_meta( $post['ID'], '_menu_item_url', true );
				if ( isset( $_POST['url'] ) && ! empty( $meta_url ) ) {
					$meta_url = str_replace( $_POST['url'], site_url(), $meta_url );
					update_post_meta( $post['ID'], '_menu_item_url', $meta_url );
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
	}

	/**
	 * Here we need to re-map all the links inside the post content
	 * @TODO this is awful, we need to better handle this
	 */
	private function replace_demo_urls_in_content() {
		global $wpdb;

		$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s)", $_POST['url'], site_url() ) );

		// remap enclosure urls
		$result = $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->postmeta} SET meta_value = REPLACE(meta_value, %s, %s) WHERE meta_key='enclosure'", $_POST['url'], site_url() ) );
	}

	/**
	 * Replace the value of the `page_on_front` option with the id of the local front page
	 *
	 * @param $value
	 *
	 * @return mixed
	 */
	public function filter_post_option_page_on_front( $value ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( isset( $starter_content['post_types']['page'][ $value ] ) ) {
			return $starter_content['post_types']['page'][ $value ];
		}

		return $value;
	}

	/**
	 * Replace the value of the `page_for_posts` option with the id of the local blog page
	 *
	 * @param $value
	 *
	 * @return mixed
	 */
	public function filter_post_option_page_for_posts( $value ) {
		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );
		if ( isset( $starter_content['post_types']['page'][ $value ] ) ) {
			return $starter_content['post_types']['page'][ $value ];
		}

		return $value;
	}

	/**
	 * Replace each menu id from `nav_menu_locations` with the new menus ids
	 *
	 * @param $locations
	 *
	 * @return mixed
	 */
	public function filter_post_theme_mod_nav_menu_locations( $locations ) {
		if ( empty( $locations ) ) {
			return $locations;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		foreach ( $locations as $location => $menu ) {
			if ( ! empty( $starter_content['taxonomies']['nav_menu'][ $menu ] ) ) {
				$locations[ $location ] = $starter_content['taxonomies']['nav_menu'][ $menu ];
			}
		}

		return $locations;
	}

	/**
	 * If there is a custom logo set, it will surely come with another attachment_id
	 * Wee need to replace the old attachment id with the local one
	 *
	 * @param $attach_id
	 *
	 * @return mixed
	 */
	public function filter_post_theme_mod_custom_logo( $attach_id ) {
		if ( empty( $attach_id ) ) {
			return $attach_id;
		}

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content['media']['ignored'][ $attach_id ] ) ) {
			return $starter_content['media']['ignored'][ $attach_id ];
		}

		if ( ! empty( $starter_content['media']['placeholders'][ $attach_id ] ) ) {
			return $starter_content['media']['placeholders'][ $attach_id ];
		}

		return $attach_id;
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
	private function get_placeholders() {
		$imported_ids = array();

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content['media']['placeholders'] ) ) {
			foreach ( $starter_content['media']['placeholders'] as $old_id => $new_id ) {
				$imported_ids[ $old_id ] = array(
					'id'    => $new_id,
					'sizes' => array(
						'sizes' => $this->get_image_thumbnails_urls( $new_id ),
					)
				);
			}
		}

		return $imported_ids;
	}

	private function get_ignored_images() {
		$imported_ids = array();

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content' );

		if ( ! empty( $starter_content['media']['ignored'] ) ) {
			foreach ( $starter_content['media']['ignored'] as $old_id => $new_id ) {
				$imported_ids[ $old_id ] = array(
					'id'    => $new_id,
					'sizes' => $this->get_image_thumbnails_urls( $new_id ),
				);
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
		return wp_verify_nonce( $this->get_nonce( $request ), 'pixelgrade_care_rest' );
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
		if ( $wpdb->get_row( "SELECT post_name FROM $wpdb->posts WHERE post_name = '" . $post_name . "' AND post_type = '" . $post_type . "'", 'ARRAY_A' ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Main PixelgradeAssistantStarterContent Instance
	 *
	 * Ensures only one instance of PixelgradeAssistantStarterContent is loaded or can be loaded.
	 *
	 * @since  1.3.0
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
	} // End instance().

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	} // End __clone().

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), esc_html( $this->parent->get_version() ) );
	} // End __wakeup().
}
