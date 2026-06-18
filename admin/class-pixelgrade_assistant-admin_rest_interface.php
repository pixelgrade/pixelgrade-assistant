<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class PixelgradeAssistant_AdminRestInterface {

	public function register_routes() {
		$version   = '1';
		$namespace = 'pixassist/v' . $version;

		register_rest_route( $namespace, '/global_state', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_state' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_state' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_state' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
		) );

		register_rest_route( $namespace, '/localized', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_localized' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
		) );

		register_rest_route( $namespace, '/data_collect', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_data_collect' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_data_collect' ),
				'permission_callback' => array( $this, 'permission_nonce_callback' ),
				'show_in_index'       => false, // We don't need others to know about this (API discovery)
			),
		) );

		// Cleanup/reset
		register_rest_route( $namespace, '/cleanup', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'cleanup' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );

		// Pixelgrade Docs: lazily serve the (cached) public documentation categories for the active theme.
		register_rest_route( $namespace, '/kb_categories', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_kb_categories' ),
			'permission_callback' => array( $this, 'permission_docs_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );

		register_rest_route( $namespace, '/kb_vote', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'record_kb_vote' ),
			'permission_callback' => array( $this, 'permission_docs_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );

		register_rest_route( $namespace, '/docs_ticket', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'submit_docs_ticket' ),
			'permission_callback' => array( $this, 'permission_docs_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );

		// Hub-native onboarding: persist the "Get started" card dismissal so it stays hidden.
		register_rest_route( $namespace, '/onboarding_dismiss', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'dismiss_onboarding' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );
	}

	/**
	 * Persist the onboarding "Get started" card dismissal.
	 *
	 * Writes only into `pixassist_options['onboarding']` (the Phase 1 marker) — it never touches any
	 * other option or meta key. The card hides client-side optimistically; this makes it stick.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function dismiss_onboarding( $request ) {

		$onboarding = PixelgradeAssistant_Admin::get_option( 'onboarding' );
		if ( ! is_array( $onboarding ) ) {
			$onboarding = array();
		}

		$onboarding['dismissed']    = true;
		$onboarding['dismissed_at'] = time();

		PixelgradeAssistant_Admin::set_option( 'onboarding', $onboarding );

		if ( false === PixelgradeAssistant_Admin::save_options() ) {
			return rest_ensure_response( array(
				'code'    => 'error_saving',
				'message' => esc_html__( 'Something went wrong. Could not dismiss the guide.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__( 'Guide dismissed.', '__plugin_txtd' ),
			'data'    => array(
				'dismissed' => true,
			),
		) );
	}

	/**
	 * Return the (cached) public documentation categories for the active theme's knowledge base.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_kb_categories( $request ) {
		$skip_cache = ! empty( $request->get_param( 'skip_cache' ) );

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'categories' => PixelgradeAssistant_Help::get_kb_categories( $skip_cache ),
			),
		) );
	}

	/**
	 * Record a documentation helpful/not-helpful vote.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function record_kb_vote( $request ) {
		return rest_ensure_response( pixassist_record_docs_vote( $request ) );
	}

	/**
	 * Submit a docs-panel support request through the host account.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function submit_docs_ticket( $request ) {
		return rest_ensure_response( pixassist_submit_docs_ticket( $request ) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return false|int
	 */
	public function permission_nonce_callback( $request ) {
		// Defense in depth: these are admin dashboard endpoints, so require the dashboard
		// capability in addition to the custom nonce.
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		return (bool) wp_verify_nonce( $this->get_nonce( $request ), 'pixelgrade_assistant_rest' );
	}

	/**
	 * Check docs-panel REST permissions.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return bool
	 */
	public function permission_docs_callback( $request ) {
		if ( ! function_exists( 'pixassist_docs_can_access' ) || ! pixassist_docs_can_access() ) {
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

	// CALLBACKS

	/**
	 * Retrieve the current saved state.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_state( $request ) {

		$pixassist_state = PixelgradeAssistant_Admin::get_option( 'state' );

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'state' => $pixassist_state,
			),
		) );
	}

	/**
	 * Handle the request to save the main state of Pixelgrade Assistant.
	 *
	 * The dashboard keeps its UI session in the browser (localStorage), so there is no
	 * account/license state to persist here any more. The endpoint is kept so the
	 * dashboard's state-sync POST resolves cleanly.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function set_state( $request ) {

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__( 'State saved successfully!', '__plugin_txtd' ),
			'data'    => array(),
		) );
	}

	/**
	 * Handle the request to delete the main state of Pixelgrade Assistant. We'll delete:
	 * - details about the user's connection to the shop (username, oauth tokens, pixelgrade user_id)
	 * - their available themes
	 * - details about their theme licenses (hash, expiration, status)
	 * -
	 * @param  WP_REST_Request|null $request
	 *
	 * @return WP_REST_Response|true
	 */
	public function delete_state( $request = null ) {

		$current_user = PixelgradeAssistant_Admin::get_theme_activation_user();
		if ( ! empty( $current_user ) && ! empty( $current_user->ID ) ) {
			/*
			 * The OAuth1.0a details
			 */
			delete_user_meta( $current_user->ID, 'pixassist_oauth_token' );
			delete_user_meta( $current_user->ID, 'pixassist_oauth_token_secret' );
			delete_user_meta( $current_user->ID, 'pixassist_oauth_verifier' );

			/*
			 * The shop user details
			 */
			delete_user_meta( $current_user->ID, 'pixassist_user_ID' );
			delete_user_meta( $current_user->ID, 'pixelgrade_user_login' );
			delete_user_meta( $current_user->ID, 'pixelgrade_user_email' );
			delete_user_meta( $current_user->ID, 'pixelgrade_display_name' );
		}


		PixelgradeAssistant_Admin::delete_license_mod();

		remove_theme_mod( 'pixassist_new_theme_version' );

		if ( ! empty( $request ) ) {
			return rest_ensure_response( array(
				'code'    => 'success',
				'message' => esc_html__( 'State deleted successfully!', '__plugin_txtd' ),
				'data'    => array(),
			) );
		} else {
			return true;
		}
	}

	/**
	 * Handle the request to get the localized JS data.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_localized( $request ) {
		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'localized' => PixelgradeAssistant_Admin::localize_js_data( '', false ),
			),
		) );
	}

	/**
	 * Handle the request to get the value of allow_data_collect.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_data_collect( $request ) {

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => '',
			// We will return all the data we are allowed to have access to
			// Only the `allowDataCollect` entry as false when we are not allowed,
			// the full data plus the `allowDataCollect` entry as true when we are.
			'data'    => PixelgradeAssistant_DataCollector::get_system_status_data(),
		) );
	}

	/**
	 * Handle the request to set the value of allow_data_collect.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function set_data_collect( $request ) {

		$params = $request->get_params();
		if ( ! isset( $params['allow_data_collect'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_data',
				'message' => esc_html__( 'You haven\'t provided the necessary data.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		// Sanitize to make sure it is a boolean
		$params['allow_data_collect'] = PixelgradeAssistant_Admin::sanitize_bool( $params['allow_data_collect'] );
		// Set the value
		PixelgradeAssistant_Admin::set_option( 'allow_data_collect', $params['allow_data_collect'] );
		// and save it in the DB
		if ( false === PixelgradeAssistant_Admin::save_options() ) {
			return rest_ensure_response( array(
				'code'    => 'error_saving',
				'message' => esc_html__( 'Something went wrong. Could not save the option.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__( 'Data saved successfully!', '__plugin_txtd' ),
			'data'    => array(
				// We will retrieve the actual value in the DB, just to be sure
				'allow_data_collect' => PixelgradeAssistant_Admin::get_option( 'allow_data_collect' ),
			),
		) );
	}

	/**
	 * This method does a bunch of cleanup. It deletes everything associated with a user connection to pixelgrade.com.
	 * It will delete the theme licenses, user meta.
	 *
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function cleanup( $request ) {

		$params = $request->get_params();

		if ( empty( $params['test1'] ) || empty( $params['test2'] ) || empty( $params['confirm'] ) ||
		     (int) $params['test1'] + (int) $params['test2'] !== (int) $params['confirm'] ) {
			return rest_ensure_response( array(
				'code'    => 'test_failure',
				'message' => esc_html__( 'Your need to do better on your math.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		// Delete user OAuth connection details
		PixelgradeAssistant_Admin::cleanup_oauth_token();

		// Delete the state
		$this->delete_state();

		// Clear the cache theme config
		PixelgradeAssistant_Admin::clear_remote_config_cache();

		// Delete the license details
		PixelgradeAssistant_Admin::delete_license_mod();

		// Delete all the Pixelgrade Assistant plugin options
		PixelgradeAssistant_Admin::delete_options();

		// We will also clear the theme update transient because when one reconnects it might use a different license
		// and that license might allow for updates
		// Right now we prevent the update package URL to be saved in the transient (via the WUpdates code)
		delete_site_transient( 'update_themes' );

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__( 'All nice and clean!', '__plugin_txtd' ),
			'data'    => array(),
		) );
	}

}
