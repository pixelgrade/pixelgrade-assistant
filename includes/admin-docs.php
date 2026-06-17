<?php
/**
 * Contextual editor docs panel data + server-side actions (#46).
 *
 * The editor bundle is presentational: product scope, endpoint paths, identity-only account data,
 * copy, KB voting, and support-ticket request assembly live here so they can be pinned by standalone
 * tests. OAuth credentials stay PHP-only and are used only for server-side ticket signing.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_docs_capability' ) ) {
	/**
	 * Retrieves the capability required to use the editor docs panel.
	 *
	 * @return string
	 */
	function pixassist_docs_capability() {
		return (string) apply_filters( 'pixassist_docs_capability', 'edit_theme_options' );
	}
}

if ( ! function_exists( 'pixassist_docs_can_access' ) ) {
	/**
	 * Determines whether the current user can use the editor docs panel.
	 *
	 * @return bool
	 */
	function pixassist_docs_can_access() {
		return function_exists( 'current_user_can' ) && current_user_can( pixassist_docs_capability() );
	}
}

if ( ! function_exists( 'pixassist_docs_rest_path' ) ) {
	/**
	 * Builds a Pixelgrade Assistant REST path for apiFetch.
	 *
	 * @param string $route Route path.
	 *
	 * @return string
	 */
	function pixassist_docs_rest_path( $route ) {
		return '/pixassist/v1/' . ltrim( (string) $route, '/' );
	}
}

if ( ! function_exists( 'pixassist_docs_rest_endpoint' ) ) {
	/**
	 * Builds an endpoint descriptor consumed by the editor docs bundle.
	 *
	 * @param string $route  Route path.
	 * @param string $method HTTP method.
	 *
	 * @return array
	 */
	function pixassist_docs_rest_endpoint( $route, $method ) {
		$path = pixassist_docs_rest_path( $route );

		return array(
			'method' => strtoupper( (string) $method ),
			'path'   => $path,
			'url'    => esc_url_raw( rest_url( ltrim( $path, '/' ) ) ),
		);
	}
}

if ( ! function_exists( 'pixassist_docs_product_sku' ) ) {
	/**
	 * Retrieves the product/theme SKU used to scope documentation.
	 *
	 * @return string
	 */
	function pixassist_docs_product_sku() {
		if ( class_exists( 'PixelgradeAssistant_Help' ) && method_exists( 'PixelgradeAssistant_Help', 'get_kb_product_sku' ) ) {
			return (string) PixelgradeAssistant_Help::get_kb_product_sku();
		}

		return '';
	}
}

if ( ! function_exists( 'pixassist_docs_online_url' ) ) {
	/**
	 * Retrieves the online docs fallback URL.
	 *
	 * @return string
	 */
	function pixassist_docs_online_url() {
		return esc_url_raw( trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs' );
	}
}

if ( ! function_exists( 'pixassist_get_docs_data' ) ) {
	/**
	 * Builds the editor docs bundle bootstrap payload.
	 *
	 * @return array
	 */
	function pixassist_get_docs_data() {
		return array(
			'product'   => array(
				'sku'        => pixassist_docs_product_sku(),
				'docsUrl'    => pixassist_docs_online_url(),
				'accountUrl' => admin_url( 'themes.php?page=pixelgrade&tab=account' ),
			),
			'endpoints' => array(
				'categories' => pixassist_docs_rest_endpoint( 'kb_categories', 'GET' ),
				'vote'       => pixassist_docs_rest_endpoint( 'kb_vote', 'POST' ),
				'ticket'     => pixassist_docs_rest_endpoint( 'docs_ticket', 'POST' ),
			),
			'account'   => function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false ),
			'slotFill'  => array(
				'global'              => 'pixelgradeAdminHub.docs',
				'scope'               => 'pixelgrade-docs',
				'ticketRequestFilter' => 'pixelgrade.docs.ticketRequest',
			),
			'ticket'    => array(
				'subjectMaxLength' => pixassist_docs_ticket_subject_max_length(),
			),
			'copy'      => array(
				'title'                  => esc_html__( 'Pixelgrade Docs', '__plugin_txtd' ),
				'menuLabel'              => esc_html__( 'Pixelgrade Docs', '__plugin_txtd' ),
				'searchPlaceholder'      => esc_html__( 'Search the documentation...', '__plugin_txtd' ),
				'allTopics'              => esc_html__( 'All topics', '__plugin_txtd' ),
				'back'                   => esc_html__( 'Back', '__plugin_txtd' ),
				'empty'                  => esc_html__( 'No matching articles.', '__plugin_txtd' ),
				'loading'                => esc_html__( 'Loading documentation...', '__plugin_txtd' ),
				'fallback'               => esc_html__( 'Browse the full documentation for step-by-step guides and answers.', '__plugin_txtd' ),
				'browseDocs'             => esc_html__( 'Browse docs', '__plugin_txtd' ),
				'readOnline'             => esc_html__( 'Read online', '__plugin_txtd' ),
				'feedbackPrompt'         => esc_html__( 'Was this helpful?', '__plugin_txtd' ),
				'feedbackYes'            => esc_html__( 'Yes', '__plugin_txtd' ),
				'feedbackNo'             => esc_html__( 'No', '__plugin_txtd' ),
				'feedbackThanks'         => esc_html__( 'Thanks for your feedback.', '__plugin_txtd' ),
				'escalationTitle'        => esc_html__( 'Still need help?', '__plugin_txtd' ),
				'escalationDescription'  => esc_html__( 'Send the current context to Pixelgrade support.', '__plugin_txtd' ),
				'connectDescription'     => esc_html__( 'Connect a free pixelgrade.com account before sending a support request.', '__plugin_txtd' ),
				'connectLabel'           => esc_html__( 'Connect account', '__plugin_txtd' ),
				'ticketSubjectLabel'     => esc_html__( 'Subject', '__plugin_txtd' ),
				'ticketDetailsLabel'     => esc_html__( 'Details', '__plugin_txtd' ),
				'ticketTopicLabel'       => esc_html__( 'Type', '__plugin_txtd' ),
				'ticketTopicHelp'        => esc_html__( 'Help request', '__plugin_txtd' ),
				'ticketTopicBug'         => esc_html__( 'Bug report', '__plugin_txtd' ),
				'ticketSubmitLabel'      => esc_html__( 'Send request', '__plugin_txtd' ),
				'ticketSubmittingLabel'  => esc_html__( 'Sending...', '__plugin_txtd' ),
				'ticketSuccess'          => esc_html__( 'Your request has been sent.', '__plugin_txtd' ),
				'ticketFailure'          => esc_html__( 'The request could not be sent. Please try again.', '__plugin_txtd' ),
				'ticketSubjectHelp'      => esc_html__( 'Keep the subject under %d characters. Add extra context in Details.', '__plugin_txtd' ),
				'ticketSubjectTooLong'   => esc_html__( 'The subject is too long. Shorten it and move the extra context to Details.', '__plugin_txtd' ),
			),
		);
	}
}

if ( ! function_exists( 'pixassist_docs_response' ) ) {
	/**
	 * Builds a REST-style response envelope.
	 *
	 * @param string $code    Response code.
	 * @param string $message Response message.
	 * @param array  $data    Response data.
	 *
	 * @return array
	 */
	function pixassist_docs_response( $code, $message = '', $data = array() ) {
		return array(
			'code'    => (string) $code,
			'message' => (string) $message,
			'data'    => is_array( $data ) ? $data : array(),
		);
	}
}

if ( ! function_exists( 'pixassist_docs_request_value' ) ) {
	/**
	 * Reads a request value from a REST request, array, or object.
	 *
	 * @param mixed  $request Request object/array.
	 * @param string $key     Value key.
	 *
	 * @return mixed|null
	 */
	function pixassist_docs_request_value( $request, $key ) {
		if ( is_object( $request ) && method_exists( $request, 'get_param' ) ) {
			return $request->get_param( $key );
		}

		if ( is_array( $request ) && array_key_exists( $key, $request ) ) {
			return $request[ $key ];
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_docs_sanitize_scalar' ) ) {
	/**
	 * Sanitizes a scalar text value.
	 *
	 * @param mixed $value Raw value.
	 *
	 * @return string
	 */
	function pixassist_docs_sanitize_scalar( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		return sanitize_text_field( (string) $value );
	}
}

if ( ! function_exists( 'pixassist_docs_sanitize_textarea' ) ) {
	/**
	 * Sanitizes a multiline scalar text value.
	 *
	 * @param mixed $value Raw value.
	 *
	 * @return string
	 */
	function pixassist_docs_sanitize_textarea( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		return sanitize_textarea_field( (string) $value );
	}
}

if ( ! function_exists( 'pixassist_docs_ticket_subject_max_length' ) ) {
	/**
	 * Retrieves the support-ticket subject length limit.
	 *
	 * @return int
	 */
	function pixassist_docs_ticket_subject_max_length() {
		$max_length = (int) apply_filters( 'pixassist_docs_ticket_subject_max_length', 120 );

		return max( 1, $max_length );
	}
}

if ( ! function_exists( 'pixassist_docs_strlen' ) ) {
	/**
	 * Counts characters in a text string.
	 *
	 * @param string $value Text value.
	 *
	 * @return int
	 */
	function pixassist_docs_strlen( $value ) {
		$value = (string) $value;

		if ( function_exists( 'mb_strlen' ) ) {
			return mb_strlen( $value );
		}

		return strlen( $value );
	}
}

if ( ! function_exists( 'pixassist_docs_ticket_subject_is_too_long' ) ) {
	/**
	 * Determines whether a support-ticket subject exceeds the configured limit.
	 *
	 * @param string $subject Ticket subject.
	 *
	 * @return bool
	 */
	function pixassist_docs_ticket_subject_is_too_long( $subject ) {
		return pixassist_docs_strlen( $subject ) > pixassist_docs_ticket_subject_max_length();
	}
}

if ( ! function_exists( 'pixassist_docs_stringify' ) ) {
	/**
	 * Coerces request parameters to strings for stable signing and form encoding.
	 *
	 * @param array $params Request parameters.
	 *
	 * @return array
	 */
	function pixassist_docs_stringify( $params ) {
		$stringified = array();

		foreach ( (array) $params as $key => $value ) {
			if ( is_bool( $value ) ) {
				$value = $value ? '1' : '0';
			} elseif ( is_array( $value ) || is_object( $value ) ) {
				$value = wp_json_encode( $value );
			}

			$stringified[ (string) $key ] = (string) $value;
		}

		return $stringified;
	}
}

if ( ! function_exists( 'pixassist_docs_remote_endpoint' ) ) {
	/**
	 * Builds a pixelgrade.com pxm/v2 endpoint URL.
	 *
	 * @param string $route Route name.
	 *
	 * @return string
	 */
	function pixassist_docs_remote_endpoint( $route ) {
		return trailingslashit( PIXELGRADE_ASSISTANT__API_BASE ) . 'wp-json/pxm/v2/front/' . ltrim( (string) $route, '/' );
	}
}

if ( ! function_exists( 'pixassist_docs_post_envelope' ) ) {
	/**
	 * Posts to a remote endpoint and returns a normalized envelope.
	 *
	 * @param string $endpoint Request URL.
	 * @param array  $body     Request body.
	 * @param array  $headers  Optional request headers.
	 *
	 * @return array
	 */
	function pixassist_docs_post_envelope( $endpoint, $body, $headers = array() ) {
		if ( ! function_exists( 'wp_remote_request' ) ) {
			return pixassist_docs_response( 'failed', esc_html__( 'The request could not be sent.', '__plugin_txtd' ) );
		}

		$args = array(
			'method'   => 'POST',
			'timeout'  => 10,
			'blocking' => true,
			'body'     => pixassist_docs_stringify( $body ),
		);

		if ( ! empty( $headers ) ) {
			$args['headers'] = $headers;
		}

		$response = wp_remote_request( $endpoint, $args );
		if ( function_exists( 'is_wp_error' ) && is_wp_error( $response ) ) {
			return pixassist_docs_response( 'failed', esc_html__( 'The request could not be sent.', '__plugin_txtd' ) );
		}

		$decoded = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $decoded ) ) {
			return pixassist_docs_response( 'failed', esc_html__( 'The request returned an invalid response.', '__plugin_txtd' ) );
		}

		return wp_parse_args(
			$decoded,
			array(
				'code'    => 'failed',
				'message' => '',
				'data'    => array(),
			)
		);
	}
}

if ( ! function_exists( 'pixassist_record_docs_vote' ) ) {
	/**
	 * Records a "was this helpful?" vote against the public KB feedback endpoint.
	 *
	 * @param mixed $request Request data.
	 *
	 * @return array
	 */
	function pixassist_record_docs_vote( $request ) {
		if ( ! pixassist_docs_can_access() ) {
			return pixassist_docs_response( 'denied', esc_html__( 'You are not allowed to record documentation feedback.', '__plugin_txtd' ) );
		}

		$article_id = absint( pixassist_docs_request_value( $request, 'article_id' ) );
		if ( 0 === $article_id ) {
			$article_id = absint( pixassist_docs_request_value( $request, 'key' ) );
		}

		$direction = pixassist_docs_sanitize_scalar( pixassist_docs_request_value( $request, 'direction' ) );
		if ( '' === $direction ) {
			$direction = pixassist_docs_sanitize_scalar( pixassist_docs_request_value( $request, 'vote' ) );
		}

		if ( 0 >= $article_id || ! in_array( $direction, array( 'up', 'down' ), true ) ) {
			return pixassist_docs_response( 'invalid', esc_html__( 'The documentation feedback request is invalid.', '__plugin_txtd' ) );
		}

		$body = array(
			'post_id'                => (string) $article_id,
			'key'                    => (string) $article_id,
			'direction'              => $direction,
			'vote'                   => $direction,
			'kb_current_product_sku' => pixassist_docs_product_sku(),
		);

		$endpoint = class_exists( 'PixelgradeAssistant_Help' ) && method_exists( 'PixelgradeAssistant_Help', 'get_voting_endpoint' )
			? PixelgradeAssistant_Help::get_voting_endpoint()
			: pixassist_docs_remote_endpoint( 'ht_voting' );

		/**
		 * Short-circuits a docs vote response for tests/integrations.
		 *
		 * @param array|null $response Response envelope.
		 * @param array      $body     Request body.
		 * @param string     $endpoint Endpoint URL.
		 */
		$pre_response = apply_filters( 'pre_pixassist_docs_vote_response', null, $body, $endpoint );
		if ( null !== $pre_response ) {
			return is_array( $pre_response ) ? $pre_response : pixassist_docs_response( 'failed' );
		}

		return pixassist_docs_post_envelope( $endpoint, $body );
	}
}

if ( ! function_exists( 'pixassist_docs_ticket_context' ) ) {
	/**
	 * Sanitizes editor context for a support request.
	 *
	 * @param mixed $request Request data.
	 *
	 * @return array
	 */
	function pixassist_docs_ticket_context( $request ) {
		$context = pixassist_docs_request_value( $request, 'context' );
		$context = is_array( $context ) ? $context : array();

		$article_id = isset( $context['articleId'] ) ? absint( $context['articleId'] ) : absint( pixassist_docs_request_value( $request, 'article_id' ) );

		return array(
			'surface'     => pixassist_docs_sanitize_scalar( isset( $context['surface'] ) ? $context['surface'] : pixassist_docs_request_value( $request, 'surface' ) ),
			'post_type'   => pixassist_docs_sanitize_scalar( isset( $context['postType'] ) ? $context['postType'] : pixassist_docs_request_value( $request, 'post_type' ) ),
			'template_id' => pixassist_docs_sanitize_scalar( isset( $context['templateId'] ) ? $context['templateId'] : pixassist_docs_request_value( $request, 'template_id' ) ),
			'article_id'  => 0 < $article_id ? (string) $article_id : '',
		);
	}
}

if ( ! function_exists( 'pixassist_docs_ticket_body' ) ) {
	/**
	 * Builds a sanitized support-ticket request body.
	 *
	 * @param mixed $request Request data.
	 *
	 * @return array
	 */
	function pixassist_docs_ticket_body( $request ) {
		$account = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array();
		$context = pixassist_docs_ticket_context( $request );

		$body = array(
			'subject'     => pixassist_docs_sanitize_scalar( pixassist_docs_request_value( $request, 'subject' ) ),
			'details'     => pixassist_docs_sanitize_textarea( pixassist_docs_request_value( $request, 'details' ) ),
			'topic'       => pixassist_docs_sanitize_scalar( pixassist_docs_request_value( $request, 'topic' ) ),
			'tag'         => pixassist_docs_sanitize_scalar( pixassist_docs_request_value( $request, 'tag' ) ),
			'source'      => 'pixelgrade-assistant-docs',
			'product_sku' => pixassist_docs_product_sku(),
			'site_url'    => home_url( '/' ),
			'admin_url'   => admin_url(),
			'user_id'     => isset( $account['pixelgrade_user_id'] ) ? (string) absint( $account['pixelgrade_user_id'] ) : '',
			'user_email'  => isset( $account['email'] ) ? sanitize_email( $account['email'] ) : '',
			'user_login'  => isset( $account['user_login'] ) ? pixassist_docs_sanitize_scalar( $account['user_login'] ) : '',
		);

		$body = array_merge( $body, $context );

		/**
		 * Filters the docs-panel support ticket request body before signing.
		 *
		 * @param array $body    Sanitized request body.
		 * @param mixed $request Original request data.
		 */
		$body = apply_filters( 'pixassist_docs_ticket_request_data', $body, $request );

		return pixassist_docs_stringify( is_array( $body ) ? $body : array() );
	}
}

if ( ! function_exists( 'pixassist_submit_docs_ticket' ) ) {
	/**
	 * Submits a docs-panel support request through the host account connection.
	 *
	 * @param mixed $request Request data.
	 *
	 * @return array
	 */
	function pixassist_submit_docs_ticket( $request ) {
		if ( ! pixassist_docs_can_access() ) {
			return pixassist_docs_response( 'denied', esc_html__( 'You are not allowed to submit a support request.', '__plugin_txtd' ) );
		}

		$account     = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array();
		$credentials = function_exists( 'pixassist_get_account_credentials' ) ? pixassist_get_account_credentials() : null;

		if ( empty( $account['is_connected'] ) || empty( $credentials['token'] ) ) {
			return pixassist_docs_response( 'not_connected', esc_html__( 'Connect your Pixelgrade account before submitting a support request.', '__plugin_txtd' ) );
		}

		$body = pixassist_docs_ticket_body( $request );
		if ( '' === $body['subject'] || '' === $body['details'] ) {
			return pixassist_docs_response( 'invalid', esc_html__( 'Please add a subject and details before sending your request.', '__plugin_txtd' ) );
		}

		if ( pixassist_docs_ticket_subject_is_too_long( $body['subject'] ) ) {
			return pixassist_docs_response(
				'invalid',
				sprintf(
					esc_html__( 'Keep the subject under %d characters and add extra context in Details.', '__plugin_txtd' ),
					pixassist_docs_ticket_subject_max_length()
				)
			);
		}

			if ( ! function_exists( 'pixassist_account_oauth_config' )
				|| ! function_exists( 'pixassist_account_oauth_base_params' )
				|| ! function_exists( 'pixassist_oauth1_authorization_header' ) ) {
				return pixassist_docs_response( 'not_configured', esc_html__( 'The Pixelgrade account connection is not configured for support requests.', '__plugin_txtd' ) );
			}

			$config = pixassist_account_oauth_config();
		if ( empty( $config['consumer_key'] ) || empty( $config['consumer_secret'] ) ) {
			return pixassist_docs_response( 'not_configured', esc_html__( 'The Pixelgrade account connection is not configured for support requests.', '__plugin_txtd' ) );
		}

		$endpoint = pixassist_docs_remote_endpoint( 'create_ticket' );
		$params   = pixassist_account_oauth_base_params( (string) $config['consumer_key'] );
		$params['oauth_token'] = (string) $credentials['token'];

		$auth_header = pixassist_oauth1_authorization_header(
			'POST',
			$endpoint,
			array_merge( $body, $params ),
			(string) $config['consumer_secret'],
			isset( $credentials['token_secret'] ) ? (string) $credentials['token_secret'] : ''
		);

		/**
		 * Short-circuits a docs ticket response for tests/integrations.
		 *
		 * @param array|null $response    Response envelope.
		 * @param array      $body        Request body.
		 * @param string     $auth_header OAuth Authorization header.
		 * @param string     $endpoint    Endpoint URL.
		 */
		$pre_response = apply_filters( 'pre_pixassist_docs_ticket_response', null, $body, $auth_header, $endpoint );
		if ( null !== $pre_response ) {
			return is_array( $pre_response ) ? $pre_response : pixassist_docs_response( 'failed' );
		}

		return pixassist_docs_post_envelope( $endpoint, $body, array( 'Authorization' => $auth_header ) );
	}
}
