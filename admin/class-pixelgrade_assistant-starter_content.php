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

		add_filter( 'upload_mimes', array( $this, 'allow_svg_upload' ) );

		$demo_key = sanitize_text_field( $params['demo_key'] );

		$group = sanitize_text_field( $params['group'] );

		$title = sanitize_text_field( $params['title'] );

		$remote_id = absint( $params['remote_id'] );

		$filename = $title . '.' . sanitize_text_field( $params['ext'] );

		$file_data = $this->decode_chunk( $params['file_data'] );

		if ( false === $file_data ) {
			return rest_ensure_response( array(
				'code'    => 'error',
				'message' => esc_html__( 'No file data.', '__plugin_txtd' ),
				'data'    => array(
				),
			) );
		}

		$upload_file = wp_upload_bits( $filename, null, $file_data );

		if ( $upload_file['error'] ) {
			return rest_ensure_response( array(
				'code'    => 'error',
				'message' => esc_html__( 'File permission error.', '__plugin_txtd' ),
				'data'    => array(
				),
			) );
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
			if ( empty( $starter_content[ $demo_key ] ) ) {
				$starter_content[ $demo_key ] = array();
			}
			if ( ! isset( $starter_content[ $demo_key ]['media'] ) ) {
				$starter_content[ $demo_key ]['media'] = array();
			}
			if ( ! isset( $starter_content[ $demo_key ]['media'][ $group ] ) ) {
				$starter_content[ $demo_key ]['media'][ $group ] = array();
			}

			// If we have previously imported this attachment, delete the previous attachment.
			if ( ! empty( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] ) ) {
				$previous_attachment_metadata = wp_get_attachment_metadata( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] );
				if ( ! empty( $previous_attachment_metadata['imported_with_pixassist'] ) ) {
					wp_delete_attachment( absint( $starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] ), true );
				}
			}

			// Remember the attachment ID
			$starter_content[ $demo_key ]['media'][ $group ][ $remote_id ] = $attachment_id;

			// Save the data in the DB
			PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );
			PixelgradeAssistant_Admin::save_options();

			require_once( ABSPATH . 'wp-admin/includes/image.php' );

			$attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload_file['file'] );

			$attachment_data['imported_with_pixassist'] = true;

			wp_update_attachment_metadata( $attachment_id, $attachment_data );

			return rest_ensure_response( array(
				'code'    => 'success',
				'message' => '',
				'data'    => array(
					'attachmentID' => $attachment_id,
				),
			) );
		}

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

	private function import_settings( $demo_key, $type, $data ) {
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

		if ( 'pre' === $type ) {
			do_action( 'pixassist_sce_import_start' );
		}


		if ( 'post' === $type ) {
			do_action( 'pixassist_sce_import_end' );
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

		wp_set_object_terms( $imported_ids[ $post['ID'] ], get_stylesheet(), 'wp_theme' );
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

		// Resolve the attachment's public source URL from the demo's standard REST media endpoint.
		$endpoint = trailingslashit( $demo_site ) . 'wp-json/wp/v2/media/' . $attach_id;
		$response = wp_remote_get( $endpoint, array( 'timeout' => 15 ) );
		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$media = json_decode( wp_remote_retrieve_body( $response ), true );
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
