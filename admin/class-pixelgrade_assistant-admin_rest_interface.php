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

		register_rest_route( $namespace, '/disconnect_user', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'disconnect_user' ),
			'permission_callback' => array( $this, 'permission_nonce_callback' ),
			'show_in_index'       => false, // We don't need others to know about this (API discovery)
		) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return false|int
	 */
	public function permission_nonce_callback( $request ) {
		return wp_verify_nonce( $this->get_nonce( $request ), 'pixelgrade_assistant_rest' );
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
	 * Handle the request to save the main state of Pixelgrade Assistant. We'll save here:
	 * - details about the user's connection to the shop (username, oauth tokens, pixelgrade user_id)
	 * - their available themes
	 * - details about their theme licenses (hash, expiration, status)
	 * -
	 * @param  WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function set_state( $request ) {

		$user_data  = $this->get_request_user_meta( $request );
		$theme_data = $this->get_request_theme_mod( $request );

		$should_return_new_state = false;

		if ( ! empty( $user_data ) && is_array( $user_data ) ) {
			$current_user = PixelgradeAssistant_Admin::get_theme_activation_user();
			if ( ! empty( $current_user ) && ! empty( $current_user->ID ) ) {
				/*
				 * The OAuth1.0a details
				 */
				if ( isset( $user_data['oauth_token'] ) ) {
					update_user_meta( $current_user->ID, 'pixassist_oauth_token', $user_data['oauth_token'] );
				}

				if ( isset( $user_data['oauth_token_secret'] ) ) {
					update_user_meta( $current_user->ID, 'pixassist_oauth_token_secret', $user_data['oauth_token_secret'] );
				}

				if ( isset( $user_data['oauth_verifier'] ) ) {
					update_user_meta( $current_user->ID, 'pixassist_oauth_verifier', $user_data['oauth_verifier'] );
				}

				/*
				 * The shop user details
				 */
				if ( isset( $user_data['pixelgrade_user_ID'] ) ) {
					update_user_meta( $current_user->ID, 'pixassist_user_ID', $user_data['pixelgrade_user_ID'] );
					$should_return_new_state = true;
				}

				if ( isset( $user_data['pixelgrade_user_login'] ) ) {
					// Make sure that we have encoded characters in proper form
					$user_data['pixelgrade_user_login'] = str_replace( array( '+', '%7E' ), array(
						' ',
						'~',
					), $user_data['pixelgrade_user_login'] );
					update_user_meta( $current_user->ID, 'pixelgrade_user_login', $user_data['pixelgrade_user_login'] );
					$should_return_new_state = true;
				}

				if ( isset( $user_data['pixelgrade_user_email'] ) ) {
					update_user_meta( $current_user->ID, 'pixelgrade_user_email', $user_data['pixelgrade_user_email'] );
					$should_return_new_state = true;
				}

				if ( isset( $user_data['pixelgrade_display_name'] ) ) {
					// Make sure that we have encoded characters in proper form
					$user_data['pixelgrade_display_name'] = str_replace( array( '+', '%7E' ), array(
						' ',
						'~',
					), $user_data['pixelgrade_display_name'] );
					update_user_meta( $current_user->ID, 'pixelgrade_display_name', $user_data['pixelgrade_display_name'] );
					$should_return_new_state = true;
				}
			}
		}

		if ( ! empty( $theme_data ) && is_array( $theme_data ) ) {

			if ( ! empty( $theme_data['license'] ) ) {

				if ( ! empty( $theme_data['license']['license_hash'] ) ) {
					// We have received a license hash
					// Before we update the theme mod, we need to see if this is different than the one currently in use
					$current_theme_license_hash = PixelgradeAssistant_Admin::get_license_mod_entry( 'license_hash' );
					if ( $current_theme_license_hash != $theme_data['license']['license_hash'] ) {
						// We have received a new license(_hash)
						// We need to force a theme update check because with the new license we might have access to updates
						delete_site_transient( 'update_themes' );
						// Also delete our own saved data
						remove_theme_mod( 'pixassist_new_theme_version' );
					}
				}

				PixelgradeAssistant_Admin::set_license_mod( $theme_data['license'] );
				$should_return_new_state = true;
			}
		}

		// We were instructed to save an a plugin option entry in the DB
		if ( ! empty( $_POST['option'] ) && isset( $_POST['value'] ) ) {
			$option = wp_unslash( $_POST['option'] );
			$value  = wp_unslash( $_POST['value'] );

			PixelgradeAssistant_Admin::set_option( $option, $value );
			PixelgradeAssistant_Admin::save_options();

			$should_return_new_state = true;
		}

		$data = array();

		if ( true === $should_return_new_state ) {
			// We will return all the localized information for JS
			// First we need to empty it so it will be regenerated.
			PixelgradeAssistant_Admin::$theme_support = false;
			$data['localized'] = PixelgradeAssistant_Admin::localize_js_data( '', false );
		}

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__('State saved successfully!', '__plugin_txtd' ),
			'data'    => $data,
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

		// Delete KB cached data
		PixelgradeAssistant_Support::clear_knowledgeBase_data_cache();

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

	/**
	 * This endpoint disconnects the user from pixelgrade.com.
	 * It will delete, from their local db, everything that we got from the shop (licenses, user details) as well as
	 * call an enpdoint to deactivate this install from wupdates.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function disconnect_user( $request ) {

		$params = $request->get_params();

		if ( empty( $params['user_id'] ) ) {
			return rest_ensure_response( array(
				'code'    => 'missing_user_id',
				'message' => esc_html__( 'No user ID provided.', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		// We will remove the connection details for the user that has actually connected and activated
		$current_user = PixelgradeAssistant_Admin::get_theme_activation_user();
		if ( empty( $current_user ) || $current_user->ID != $params['user_id'] ) {
			return rest_ensure_response( array(
				'code'    => 'error',
				'message' => esc_html__( 'You cannot disconnect someone else!', '__plugin_txtd' ),
				'data'    => array(),
			) );
		}

		// We will ping pixelgrade.com to deactivate the activation
		$license_hash = PixelgradeAssistant_Admin::get_license_mod_entry( 'license_hash' );
		if ( ! empty( $license_hash ) ) {
			$data = array(
				'action'       => 'deactivate',
				'license_hash' => $license_hash,
				'site_url'     => home_url( '/' ),
				'is_ssl'       => is_ssl(),
			);

			// Get all kind of details about the active theme
			$theme_details = PixelgradeAssistant_Admin::get_theme_support();

			// Add the theme version
			if ( isset( $theme_details['theme_version'] ) ) {
				$data['current_version'] = $theme_details['theme_version'];
			}

			$request_args = array(
				'method' => PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenseAction']['method'],
				'timeout'   => 10,
				'blocking'  => false, // We don't care about the response so don't use blocking requests
				'body'      => $data,
				'sslverify' => false,
			);

			// We will do a non-blocking request
			wp_remote_request( PixelgradeAssistant_Admin::$externalApiEndpoints['wupl']['licenseAction']['url'], $request_args );
		}

		// Delete user OAuth connection details
		PixelgradeAssistant_Admin::cleanup_oauth_token( $current_user->ID );

		// Delete the state
		$this->delete_state();

		// Clear the cache theme config
		PixelgradeAssistant_Admin::clear_remote_config_cache();

		// Delete the license details
		PixelgradeAssistant_Admin::delete_license_mod();

		// Delete KB cached data
		PixelgradeAssistant_Support::clear_knowledgeBase_data_cache();

		// We will also clear the theme update transient because when one reconnects it might use a different license
		// and that license might allow for updates
		// Right now we prevent the update package URL to be saved in the transient (via the WUpdates code)
		delete_site_transient( 'update_themes' );

		if ( ! empty( $params['force_disconnected'] ) ) {
			// Add a marker so we can tell the user what we have done, in case of forced disconnect
			add_user_meta( $current_user->ID, 'pixassist_force_disconnected', '1' );
		}

		return rest_ensure_response( array(
			'code'    => 'success',
			'message' => esc_html__( 'User has been disconnected!', '__plugin_txtd' ),
			'data'    => array(),
		) );
	}

	// HELPERS

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return array|null|string
	 */
	private function get_request_user_meta( $request ) {
		$data = null;

		$params_data = $request->get_param( 'user' );

		if ( null !== $params_data ) {
			$data = wp_unslash( $params_data );
		}

		return $data;
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return array|null|string
	 */
	private function get_request_theme_mod( $request ) {
		$data = null;

		$params_data = $request->get_param( 'theme_mod' );

		if ( null !== $params_data ) {
			$data = wp_unslash( $params_data );
		}

		return $data;
	}
}
