<?php
/**
 * Host-owned pixelgrade.com account connection (#45).
 *
 * Assistant owns the single pixelgrade.com account connection for the modern host shell. This module
 * relocates the OAuth1 flow behind the existing identity accessors, exposes PHP-only credentials for
 * server-side signing, and registers the free Account hub tab.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_account_option_key' ) ) {
	/**
	 * Retrieves the plugin option key used by the existing options array.
	 *
	 * @return string
	 */
	function pixassist_account_option_key() {
		return 'pixassist_options';
	}
}

if ( ! function_exists( 'pixassist_account_nonce_action' ) ) {
	/**
	 * Retrieves the nonce/state action for account connect and disconnect actions.
	 *
	 * @return string
	 */
	function pixassist_account_nonce_action() {
		return 'pixassist_account_connect';
	}
}

if ( ! function_exists( 'pixassist_account_capability' ) ) {
	/**
	 * Retrieves the capability required to manage the host account connection.
	 *
	 * @return string
	 */
	function pixassist_account_capability() {
		return 'manage_options';
	}
}

if ( ! function_exists( 'pixassist_account_sanitize_string' ) ) {
	/**
	 * Sanitizes a scalar string for account storage.
	 *
	 * @param mixed $value Raw value.
	 *
	 * @return string
	 */
	function pixassist_account_sanitize_string( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$value = trim( (string) $value );

		return function_exists( 'sanitize_text_field' ) ? sanitize_text_field( $value ) : $value;
	}
}

if ( ! function_exists( 'pixassist_account_sanitize_email' ) ) {
	/**
	 * Sanitizes an email-like scalar for account storage.
	 *
	 * @param mixed $value Raw value.
	 *
	 * @return string
	 */
	function pixassist_account_sanitize_email( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$value = trim( (string) $value );

		return function_exists( 'sanitize_email' ) ? sanitize_email( $value ) : $value;
	}
}

if ( ! function_exists( 'pixassist_account_normalize_connection' ) ) {
	/**
	 * Normalizes account connection storage.
	 *
	 * @param array $data Raw connection data.
	 *
	 * @return array Normalized connection data.
	 */
	function pixassist_account_normalize_connection( $data ) {
		$defaults = array(
			'pixelgrade_user_id'  => 0,
			'email'               => '',
			'display_name'        => '',
			'user_login'          => '',
			'avatar_url'          => '',
			'wp_user_id'          => 0,
			'connected_at'        => '',
			'oauth_token'         => '',
			'oauth_token_secret'  => '',
		);

		$data = wp_parse_args( is_array( $data ) ? $data : array(), $defaults );

		return array(
			'pixelgrade_user_id'  => isset( $data['pixelgrade_user_id'] ) ? absint( $data['pixelgrade_user_id'] ) : 0,
			'email'               => pixassist_account_sanitize_email( $data['email'] ),
			'display_name'        => pixassist_account_sanitize_string( $data['display_name'] ),
			'user_login'          => pixassist_account_sanitize_string( $data['user_login'] ),
			'avatar_url'          => function_exists( 'esc_url_raw' ) ? esc_url_raw( (string) $data['avatar_url'] ) : (string) $data['avatar_url'],
			'wp_user_id'          => isset( $data['wp_user_id'] ) ? absint( $data['wp_user_id'] ) : 0,
			'connected_at'        => pixassist_account_sanitize_string( $data['connected_at'] ),
			'oauth_token'         => pixassist_account_sanitize_string( $data['oauth_token'] ),
			'oauth_token_secret'  => pixassist_account_sanitize_string( $data['oauth_token_secret'] ),
		);
	}
}

if ( ! function_exists( 'pixassist_account_get_options' ) ) {
	/**
	 * Retrieves the existing plugin options array.
	 *
	 * @return array
	 */
	function pixassist_account_get_options() {
		if ( ! function_exists( 'get_option' ) ) {
			return array();
		}

		$options = get_option( pixassist_account_option_key(), array() );

		return is_array( $options ) ? $options : array();
	}
}

if ( ! function_exists( 'pixassist_account_update_options' ) ) {
	/**
	 * Updates the existing plugin options array.
	 *
	 * @param array $options Options array.
	 *
	 * @return bool
	 */
	function pixassist_account_update_options( $options ) {
		if ( ! function_exists( 'update_option' ) ) {
			return false;
		}

		return (bool) update_option( pixassist_account_option_key(), is_array( $options ) ? $options : array() );
	}
}

if ( ! function_exists( 'pixassist_account_get_stored_connection' ) ) {
	/**
	 * Retrieves the modern host account connection from plugin options.
	 *
	 * @return array Normalized account connection data.
	 */
	function pixassist_account_get_stored_connection() {
		$options = pixassist_account_get_options();
		$account = isset( $options['account'] ) && is_array( $options['account'] ) ? $options['account'] : array();

		return pixassist_account_normalize_connection( $account );
	}
}

if ( ! function_exists( 'pixassist_account_current_wp_user_id' ) ) {
	/**
	 * Retrieves the current local WordPress user id.
	 *
	 * @return int
	 */
	function pixassist_account_current_wp_user_id() {
		return function_exists( 'get_current_user_id' ) ? absint( get_current_user_id() ) : 0;
	}
}

if ( ! function_exists( 'pixassist_account_care_owns_identity' ) ) {
	/**
	 * Whether Pixelgrade Care owns this user's pixelgrade.com identity.
	 *
	 * Care and Assistant share the global `pixelgrade_user_login` / `_email` / `_display_name` user
	 * meta, but Care stores its OWN OAuth token under `pixcare_oauth_token`. On a multisite where
	 * Care runs on some sites and Assistant on others, that shared identity belongs to Care: Assistant
	 * must neither claim it as its own connection nor overwrite/delete it (the meta is global, so a
	 * write from an Assistant site would corrupt Care's connection on the Care sites). The presence of
	 * a non-empty `pixcare_oauth_token` is the precise, network-wide ownership signal.
	 *
	 * @param int $user_id Local WordPress user id.
	 *
	 * @return bool True when Care owns the identity and Assistant must leave it untouched.
	 */
	function pixassist_account_care_owns_identity( $user_id ) {
		$user_id = (int) $user_id;
		if ( 0 >= $user_id || ! function_exists( 'get_user_meta' ) ) {
			return false;
		}

		return '' !== (string) get_user_meta( $user_id, 'pixcare_oauth_token', true );
	}
}

if ( ! function_exists( 'pixassist_save_account_connection' ) ) {
	/**
	 * Saves a modern host account connection and mirrors legacy user meta for compatibility.
	 *
	 * @param array $connection Raw account connection data.
	 * @param int   $wp_user_id Optional. Local WordPress user id that owns the connection.
	 *
	 * @return bool
	 */
	function pixassist_save_account_connection( $connection, $wp_user_id = 0 ) {
		$wp_user_id = absint( $wp_user_id );
		if ( 0 === $wp_user_id ) {
			$wp_user_id = pixassist_account_current_wp_user_id();
		}

		$connection = pixassist_account_normalize_connection( $connection );
		if ( 0 === (int) $connection['wp_user_id'] ) {
			$connection['wp_user_id'] = $wp_user_id;
		}
		if ( '' === $connection['connected_at'] ) {
			$connection['connected_at'] = function_exists( 'current_time' ) ? (string) current_time( 'mysql', true ) : gmdate( 'Y-m-d H:i:s' );
		}

		$options            = pixassist_account_get_options();
		$options['account'] = $connection;
		$saved              = pixassist_account_update_options( $options );

		if ( 0 < $wp_user_id && function_exists( 'update_user_meta' ) ) {
			// Assistant's OWN keys — always safe to mirror (Pixelgrade Care does not use these).
			update_user_meta( $wp_user_id, 'pixassist_oauth_token', $connection['oauth_token'] );
			update_user_meta( $wp_user_id, 'pixassist_oauth_token_secret', $connection['oauth_token_secret'] );
			update_user_meta( $wp_user_id, 'pixassist_user_ID', $connection['pixelgrade_user_id'] );

			// The legacy identity keys are SHARED with Pixelgrade Care. Mirror them only when Care does
			// not own this user's identity; otherwise the (global) write would corrupt Care's connection.
			if ( ! pixassist_account_care_owns_identity( $wp_user_id ) ) {
				update_user_meta( $wp_user_id, 'pixelgrade_user_login', $connection['user_login'] );
				update_user_meta( $wp_user_id, 'pixelgrade_user_email', $connection['email'] );
				update_user_meta( $wp_user_id, 'pixelgrade_display_name', $connection['display_name'] );
			}
		}

		return $saved;
	}
}

if ( ! function_exists( 'pixassist_account_legacy_user_id' ) ) {
	/**
	 * Finds the legacy connection user id when possible.
	 *
	 * @return int
	 */
	function pixassist_account_legacy_user_id() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_theme_activation_user' ) ) {
			$user = PixelgradeAssistant_Admin::get_theme_activation_user();
			if ( ! empty( $user ) && ! empty( $user->ID ) ) {
				return absint( $user->ID );
			}
		}

		return 0;
	}
}

if ( ! function_exists( 'pixassist_delete_account_connection' ) ) {
	/**
	 * Deletes the modern account connection and legacy compatibility meta.
	 *
	 * @param int $wp_user_id Optional. User id to clear. Falls back to stored/current/legacy user.
	 *
	 * @return bool
	 */
	function pixassist_delete_account_connection( $wp_user_id = 0 ) {
		$stored  = pixassist_account_get_stored_connection();
		$options = pixassist_account_get_options();

		if ( isset( $options['account'] ) ) {
			unset( $options['account'] );
		}

		$saved = pixassist_account_update_options( $options );

		$user_ids = array_filter(
			array_unique(
				array_map(
					'absint',
					array(
						$wp_user_id,
						$stored['wp_user_id'],
						pixassist_account_current_wp_user_id(),
						pixassist_account_legacy_user_id(),
					)
				)
			)
		);

		if ( function_exists( 'delete_user_meta' ) ) {
			foreach ( $user_ids as $user_id ) {
				// Assistant's OWN keys — always safe to clear.
				delete_user_meta( $user_id, 'pixassist_oauth_token' );
				delete_user_meta( $user_id, 'pixassist_oauth_token_secret' );
				delete_user_meta( $user_id, 'pixassist_oauth_verifier' );
				delete_user_meta( $user_id, 'pixassist_user_ID' );

				// Don't clear the SHARED legacy identity keys when Care owns this user's connection —
				// the meta is global, so deleting it would disconnect Care on the Care sites.
				if ( ! pixassist_account_care_owns_identity( $user_id ) ) {
					delete_user_meta( $user_id, 'pixelgrade_user_login' );
					delete_user_meta( $user_id, 'pixelgrade_user_email' );
					delete_user_meta( $user_id, 'pixelgrade_display_name' );
				}
			}
		}

		return $saved;
	}
}

if ( ! function_exists( 'pixassist_read_modern_account_identity' ) ) {
	/**
	 * Reads the modern account identity for the public identity accessor.
	 *
	 * @return array|null Identity payload or null when disconnected.
	 */
	function pixassist_read_modern_account_identity() {
		$connection = pixassist_account_get_stored_connection();

		if ( 0 >= (int) $connection['pixelgrade_user_id'] ) {
			return null;
		}

		$avatar_url = $connection['avatar_url'];
		if ( '' === $avatar_url && '' !== $connection['email'] && function_exists( 'get_avatar_url' ) ) {
			$avatar_url = (string) get_avatar_url( $connection['email'] );
		}

		return array(
			'is_connected'       => true,
			'email'              => $connection['email'],
			'display_name'       => $connection['display_name'],
			'user_login'         => $connection['user_login'],
			'pixelgrade_user_id' => (int) $connection['pixelgrade_user_id'],
			'avatar_url'         => $avatar_url,
			'wp_user_id'         => (int) $connection['wp_user_id'],
			'connected_at'       => $connection['connected_at'],
		);
	}
}

if ( ! function_exists( 'pixassist_filter_modern_account_identity' ) ) {
	/**
	 * Supplies modern account storage through the existing identity-only accessor seam.
	 *
	 * @param array $account Existing identity payload.
	 *
	 * @return array
	 */
	function pixassist_filter_modern_account_identity( $account ) {
		$identity = pixassist_read_modern_account_identity();

		if ( ! is_array( $identity ) ) {
			return $account;
		}

		return array_merge( is_array( $account ) ? $account : array(), $identity );
	}
}

if ( ! function_exists( 'pixassist_get_account_credentials' ) ) {
	/**
	 * Retrieves PHP-only OAuth credentials for server-side signing.
	 *
	 * Never localize this return value to JavaScript and never merge it into pixassist_get_account().
	 *
	 * @return array|null Credentials (`token`, `token_secret`) or null when disconnected.
	 */
	function pixassist_get_account_credentials() {
		$connection = pixassist_account_get_stored_connection();

		if ( '' !== $connection['oauth_token'] ) {
			return array(
				'token'        => $connection['oauth_token'],
				'token_secret' => $connection['oauth_token_secret'],
			);
		}

		if ( function_exists( 'get_user_meta' ) ) {
			$user_id = pixassist_account_legacy_user_id();
			// Skip the legacy fallback when Care owns this user's identity: the global `pixassist_oauth_token`
			// may have leaked from another site's connect, and surfacing it here would falsely credential a
			// site that was never explicitly connected (the reader reports it disconnected, so must this).
			if ( 0 < $user_id && ! pixassist_account_care_owns_identity( $user_id ) ) {
				$token = (string) get_user_meta( $user_id, 'pixassist_oauth_token', true );
				if ( '' !== $token ) {
					return array(
						'token'        => $token,
						'token_secret' => (string) get_user_meta( $user_id, 'pixassist_oauth_token_secret', true ),
					);
				}
			}
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_account_oauth_config' ) ) {
	/**
	 * Resolves OAuth1 account connection configuration.
	 *
	 * Assistant ships its own dedicated pixelgrade.com OAuth consumer so free users can connect and
	 * get support without Pixelgrade Plus. The consumer key + secret are resolved together, as a pair,
	 * from the first source that supplies BOTH non-empty values:
	 *
	 *   1. Assistant constants  (PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_KEY / ..._SECRET)
	 *   2. Plus constants       (PIXELGRADE_PLUS_ACCOUNT_CONSUMER_KEY / ..._SECRET) — optional, back-compat
	 *   3. Hardcoded Assistant default (`pkDQYLDpG7ji` + its shipped secret)
	 *
	 * Resolving key and secret independently would let a half-set override (e.g. only a Plus key,
	 * no matching secret) produce a mismatched pair and silently broken signing; pairing prevents that.
	 *
	 * @return array Config with base_url, consumer_key, consumer_secret, source.
	 */
	function pixassist_account_oauth_config() {
		$base_url = defined( 'PIXELGRADE_ASSISTANT_ACCOUNT_API_BASE' )
			? (string) constant( 'PIXELGRADE_ASSISTANT_ACCOUNT_API_BASE' )
			: ( defined( 'PIXELGRADE_PLUS_ACCOUNT_API_BASE' ) ? (string) constant( 'PIXELGRADE_PLUS_ACCOUNT_API_BASE' ) : PIXELGRADE_ASSISTANT__API_BASE );

		// Hardcoded Assistant default: `pkDQYLDpG7ji` is Assistant's own pixelgrade.com OAuth consumer,
		// shipped with its secret so free users can connect + get support without Pixelgrade Plus. This
		// is the same world-public posture Pixelgrade Care has run for years — the consumer secret is
		// intentionally public; the per-user OAuth token plus server-side validation are the real auth.
		// The secret can still be overridden for staging / rotation by defining
		// PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET in wp-config. See #58.
		$consumer_key    = 'pkDQYLDpG7ji';
		$consumer_secret = 'j5Od0lCf6dSVBxQ0DoVijRkMBzDHpKTQAtN67lDooe5jXiDb';
		if ( defined( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET' ) && '' !== (string) constant( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET' ) ) {
			$consumer_secret = (string) constant( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET' );
		}

		// Override the default pair only when a source supplies a complete, non-empty key + secret.
		$pair_sources = array(
			array( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_KEY', 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET' ),
			array( 'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_KEY', 'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_SECRET' ),
		);
		foreach ( $pair_sources as $pair ) {
			if ( defined( $pair[0] ) && defined( $pair[1] )
				&& '' !== (string) constant( $pair[0] )
				&& '' !== (string) constant( $pair[1] ) ) {
				$consumer_key    = (string) constant( $pair[0] );
				$consumer_secret = (string) constant( $pair[1] );
				break;
			}
		}

		$config = array(
			'base_url'        => $base_url,
			'consumer_key'    => $consumer_key,
			'consumer_secret' => $consumer_secret,
			'source'          => 'pixelgrade-assistant',
		);

		/**
		 * Filters the host account OAuth configuration.
		 *
		 * @param array $config Config with base_url, consumer_key, consumer_secret, source.
		 */
		$config = apply_filters( 'pixassist_account_oauth_config', $config );

		return is_array( $config ) ? wp_parse_args( $config, array() ) : array();
	}
}

if ( ! function_exists( 'pixassist_account_oauth_is_configured' ) ) {
	/**
	 * Whether the OAuth client has the credentials needed to start the flow.
	 *
	 * @return bool
	 */
	function pixassist_account_oauth_is_configured() {
		$config = pixassist_account_oauth_config();

		return ! empty( $config['base_url'] ) && ! empty( $config['consumer_key'] ) && ! empty( $config['consumer_secret'] );
	}
}

if ( ! function_exists( 'pixassist_oauth1_base_string' ) ) {
	/**
	 * Builds an OAuth1 signature base string.
	 *
	 * @param string $method HTTP method.
	 * @param string $url    Request URL.
	 * @param array  $params Request parameters.
	 *
	 * @return string
	 */
	function pixassist_oauth1_base_string( $method, $url, $params ) {
		$pairs = array();

		foreach ( (array) $params as $key => $value ) {
			$pairs[] = rawurlencode( (string) $key ) . '=' . rawurlencode( (string) $value );
		}

		sort( $pairs );

		return strtoupper( (string) $method ) . '&' . rawurlencode( (string) $url ) . '&' . rawurlencode( implode( '&', $pairs ) );
	}
}

if ( ! function_exists( 'pixassist_oauth1_signature' ) ) {
	/**
	 * Computes the OAuth1 HMAC-SHA1 signature.
	 *
	 * @param string $method          HTTP method.
	 * @param string $url             Request URL.
	 * @param array  $params          Request parameters.
	 * @param string $consumer_secret Consumer secret.
	 * @param string $token_secret    Token secret.
	 *
	 * @return string
	 */
	function pixassist_oauth1_signature( $method, $url, $params, $consumer_secret, $token_secret ) {
		unset( $params['oauth_signature'] );

		$key = rawurlencode( (string) $consumer_secret ) . '&' . rawurlencode( (string) $token_secret );

		return base64_encode( hash_hmac( 'sha1', pixassist_oauth1_base_string( $method, $url, $params ), $key, true ) );
	}
}

if ( ! function_exists( 'pixassist_oauth1_authorization_header' ) ) {
	/**
	 * Builds an OAuth Authorization header.
	 *
	 * @param string $method          HTTP method.
	 * @param string $url             Request URL.
	 * @param array  $params          OAuth parameters.
	 * @param string $consumer_secret Consumer secret.
	 * @param string $token_secret    Token secret.
	 *
	 * @return string
	 */
	function pixassist_oauth1_authorization_header( $method, $url, $params, $consumer_secret, $token_secret ) {
		$params['oauth_signature'] = pixassist_oauth1_signature( $method, $url, $params, $consumer_secret, $token_secret );

		$parts = array();
		foreach ( $params as $key => $value ) {
			if ( 0 !== strpos( (string) $key, 'oauth_' ) ) {
				continue;
			}
			$parts[] = rawurlencode( (string) $key ) . '="' . rawurlencode( (string) $value ) . '"';
		}

		sort( $parts );

		return 'OAuth ' . implode( ', ', $parts );
	}
}

if ( ! function_exists( 'pixassist_account_oauth_base_params' ) ) {
	/**
	 * Builds base OAuth params for a request.
	 *
	 * @param string $consumer_key OAuth consumer key.
	 *
	 * @return array
	 */
	function pixassist_account_oauth_base_params( $consumer_key ) {
		return array(
			'oauth_consumer_key'     => (string) $consumer_key,
			'oauth_nonce'            => function_exists( 'random_bytes' ) ? bin2hex( random_bytes( 16 ) ) : md5( uniqid( '', true ) ),
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp'        => (string) time(),
			'oauth_version'          => '1.0',
		);
	}
}

if ( ! function_exists( 'pixassist_account_oauth_endpoint' ) ) {
	/**
	 * Builds an OAuth endpoint URL.
	 *
	 * @param string $path Endpoint path.
	 *
	 * @return string
	 */
	function pixassist_account_oauth_endpoint( $path ) {
		$config   = pixassist_account_oauth_config();
		$base_url = ! empty( $config['base_url'] ) ? (string) $config['base_url'] : PIXELGRADE_ASSISTANT__API_BASE;

		return trailingslashit( $base_url ) . ltrim( (string) $path, '/' );
	}
}

if ( ! function_exists( 'pixassist_account_oauth_parse_body' ) ) {
	/**
	 * Parses an OAuth response body.
	 *
	 * @param string $body Response body.
	 *
	 * @return array
	 */
	function pixassist_account_oauth_parse_body( $body ) {
		$parsed = array();
		parse_str( (string) $body, $parsed );

		if ( isset( $parsed['oauth_token'] ) ) {
			return $parsed;
		}

		$json = json_decode( (string) $body, true );

		return is_array( $json ) ? $json : ( is_array( $parsed ) ? $parsed : array() );
	}
}

if ( ! function_exists( 'pixassist_account_log_oauth_failure' ) ) {
	/**
	 * Logs an account-connection (OAuth) failure so a `connect_failed` outcome is diagnosable.
	 *
	 * Fires only on genuine failures (rare, user-initiated connects). OAuth token material is
	 * redacted before logging.
	 *
	 * @param string $context Where/why it failed.
	 * @param string $detail  Optional extra detail (error message / response body).
	 *
	 * @return void
	 */
	function pixassist_account_log_oauth_failure( $context, $detail = '' ) {
		if ( ! function_exists( 'error_log' ) ) {
			return;
		}

		$detail = is_string( $detail ) ? $detail : '';
		// Never log token material, even though these tokens are short-lived.
		$detail = preg_replace( '/(oauth_token(?:_secret)?=)[^&\s]+/i', '$1<redacted>', $detail );
		$detail = '' !== $detail ? ' — ' . substr( $detail, 0, 300 ) : '';

		error_log( '[pixassist] account connection failed: ' . (string) $context . $detail );
	}
}

if ( ! function_exists( 'pixassist_account_oauth_request' ) ) {
	/**
	 * Performs a signed OAuth request.
	 *
	 * @param string $leg          OAuth leg (`request` or `access`).
	 * @param string $method       HTTP method.
	 * @param string $url          Request URL.
	 * @param array  $params       OAuth params.
	 * @param string $token_secret Token secret.
	 *
	 * @return array|null Parsed response or null on failure.
	 */
	function pixassist_account_oauth_request( $leg, $method, $url, $params, $token_secret ) {
		$config = pixassist_account_oauth_config();

		/**
		 * Short-circuits the host account OAuth response for tests/integrations.
		 *
		 * @param array|null $response Parsed response.
		 * @param string     $leg      OAuth leg.
		 * @param array      $params   OAuth parameters.
		 * @param array      $config   OAuth config.
		 */
		$pre_response = apply_filters( 'pre_pixassist_account_oauth1_response', null, $leg, $params, $config );
		if ( null !== $pre_response ) {
			return is_array( $pre_response ) ? $pre_response : null;
		}

		if ( ! function_exists( 'wp_remote_request' ) || empty( $config['consumer_secret'] ) ) {
			return null;
		}

		$header   = pixassist_oauth1_authorization_header( $method, $url, $params, (string) $config['consumer_secret'], $token_secret );
		$response = wp_remote_request(
			$url,
			array(
				'method'  => $method,
				'timeout' => 15,
				'headers' => array( 'Authorization' => $header ),
			)
		);

		if ( function_exists( 'is_wp_error' ) && is_wp_error( $response ) ) {
			pixassist_account_log_oauth_failure( $leg . ' leg request error', $response->get_error_message() );
			return null;
		}

		if ( function_exists( 'wp_remote_retrieve_response_code' ) && 400 <= wp_remote_retrieve_response_code( $response ) ) {
			pixassist_account_log_oauth_failure(
				$leg . ' leg HTTP ' . wp_remote_retrieve_response_code( $response ),
				function_exists( 'wp_remote_retrieve_body' ) ? (string) wp_remote_retrieve_body( $response ) : ''
			);
			return null;
		}

		if ( ! function_exists( 'wp_remote_retrieve_body' ) ) {
			return null;
		}

		return pixassist_account_oauth_parse_body( (string) wp_remote_retrieve_body( $response ) );
	}
}

if ( ! function_exists( 'pixassist_account_oauth_request_token' ) ) {
	/**
	 * Requests temporary OAuth credentials.
	 *
	 * @param string $callback_url Callback URL.
	 *
	 * @return array
	 */
	function pixassist_account_oauth_request_token( $callback_url ) {
		$config = pixassist_account_oauth_config();
		$params = pixassist_account_oauth_base_params( isset( $config['consumer_key'] ) ? (string) $config['consumer_key'] : '' );

		$params['oauth_callback'] = (string) $callback_url;

		$response = pixassist_account_oauth_request( 'request', 'GET', pixassist_account_oauth_endpoint( 'oauth1/request' ), $params, '' );

		if ( ! is_array( $response ) || empty( $response['oauth_token'] ) || ! isset( $response['oauth_token_secret'] ) ) {
			return array();
		}

		return array(
			'oauth_token'        => (string) $response['oauth_token'],
			'oauth_token_secret' => (string) $response['oauth_token_secret'],
		);
	}
}

if ( ! function_exists( 'pixassist_account_oauth_authorize_url' ) ) {
	/**
	 * Builds the Pixelgrade account authorize URL.
	 *
	 * @param string $request_token        Request token.
	 * @param string $request_token_secret Request token secret.
	 * @param array  $extra                Extra query args.
	 *
	 * @return string
	 */
	function pixassist_account_oauth_authorize_url( $request_token, $request_token_secret = '', $extra = array() ) {
		$config = pixassist_account_oauth_config();
		$args   = array_merge(
			array(
				'oauth_token'        => (string) $request_token,
				'oauth_token_secret' => (string) $request_token_secret,
				'source'             => ! empty( $config['source'] ) ? (string) $config['source'] : 'pixelgrade-assistant',
			),
			(array) $extra
		);

		$pairs = array();
		foreach ( $args as $key => $value ) {
			$pairs[] = rawurlencode( (string) $key ) . '=' . rawurlencode( (string) $value );
		}

		$url = pixassist_account_oauth_endpoint( 'oauth1/authorize' ) . '?' . implode( '&', $pairs );

		/**
		 * Filters the host account authorize URL.
		 *
		 * @param string $url  Authorize URL.
		 * @param array  $args Query args.
		 */
		return (string) apply_filters( 'pixassist_account_authorize_url', $url, $args );
	}
}

if ( ! function_exists( 'pixassist_account_extract_user_id' ) ) {
	/**
	 * Extracts a positive Pixelgrade user ID from an OAuth response.
	 *
	 * @param array $response Response data.
	 *
	 * @return int
	 */
	function pixassist_account_extract_user_id( $response ) {
		foreach ( array( 'user_ID', 'user_id', 'pixelgrade_user_id', 'ID' ) as $key ) {
			if ( isset( $response[ $key ] ) && is_scalar( $response[ $key ] ) ) {
				return absint( $response[ $key ] );
			}
		}

		return 0;
	}
}

if ( ! function_exists( 'pixassist_account_first_scalar' ) ) {
	/**
	 * Returns the first scalar value for the given keys.
	 *
	 * @param array $response Response data.
	 * @param array $keys     Candidate keys.
	 *
	 * @return string
	 */
	function pixassist_account_first_scalar( $response, $keys ) {
		foreach ( (array) $keys as $key ) {
			if ( isset( $response[ $key ] ) && is_scalar( $response[ $key ] ) ) {
				return (string) $response[ $key ];
			}
		}

		return '';
	}
}

if ( ! function_exists( 'pixassist_account_oauth_access_token' ) ) {
	/**
	 * Exchanges a verifier for token credentials and identity.
	 *
	 * @param string $request_token        Request token.
	 * @param string $request_token_secret Request token secret.
	 * @param string $verifier             OAuth verifier.
	 *
	 * @return array
	 */
	function pixassist_account_oauth_access_token( $request_token, $request_token_secret, $verifier ) {
		$config = pixassist_account_oauth_config();
		$params = pixassist_account_oauth_base_params( isset( $config['consumer_key'] ) ? (string) $config['consumer_key'] : '' );

		$params['oauth_token']    = (string) $request_token;
		$params['oauth_verifier'] = (string) $verifier;

		$response = pixassist_account_oauth_request( 'access', 'GET', pixassist_account_oauth_endpoint( 'oauth1/access' ), $params, (string) $request_token_secret );

		if ( ! is_array( $response ) || empty( $response['oauth_token'] ) ) {
			return array();
		}

		$user_id = pixassist_account_extract_user_id( $response );
		if ( 0 >= $user_id ) {
			return array();
		}

		return array(
			'oauth_token'        => (string) $response['oauth_token'],
			'oauth_token_secret' => (string) ( isset( $response['oauth_token_secret'] ) ? $response['oauth_token_secret'] : '' ),
			'pixelgrade_user_id' => $user_id,
			'email'              => pixassist_account_first_scalar( $response, array( 'user_email', 'email' ) ),
			'display_name'       => pixassist_account_first_scalar( $response, array( 'display_name', 'user_login' ) ),
			'user_login'         => pixassist_account_first_scalar( $response, array( 'user_login', 'login' ) ),
		);
	}
}

if ( ! function_exists( 'pixassist_account_request_token_key' ) ) {
	/**
	 * Builds the transient key for a request token.
	 *
	 * @param string $token Request token.
	 *
	 * @return string
	 */
	function pixassist_account_request_token_key( $token ) {
		return 'pixassist_oauth_rt_' . md5( (string) $token );
	}
}

if ( ! function_exists( 'pixassist_account_save_request_token_secret' ) ) {
	/**
	 * Stores a request-token secret between OAuth legs.
	 *
	 * @param string $token  Request token.
	 * @param string $secret Request token secret.
	 * @param int    $ttl    Optional TTL.
	 *
	 * @return bool
	 */
	function pixassist_account_save_request_token_secret( $token, $secret, $ttl = 0 ) {
		if ( ! function_exists( 'set_site_transient' ) ) {
			return false;
		}

		$expiration = 0 < (int) $ttl ? (int) $ttl : 15 * ( defined( 'MINUTE_IN_SECONDS' ) ? MINUTE_IN_SECONDS : 60 );

		return (bool) set_site_transient( pixassist_account_request_token_key( $token ), (string) $secret, $expiration );
	}
}

if ( ! function_exists( 'pixassist_account_get_request_token_secret' ) ) {
	/**
	 * Retrieves a stored request-token secret.
	 *
	 * @param string $token Request token.
	 *
	 * @return string|null
	 */
	function pixassist_account_get_request_token_secret( $token ) {
		if ( ! function_exists( 'get_site_transient' ) ) {
			return null;
		}

		$value = get_site_transient( pixassist_account_request_token_key( $token ) );

		return ( false === $value || ! is_scalar( $value ) ) ? null : (string) $value;
	}
}

if ( ! function_exists( 'pixassist_account_delete_request_token_secret' ) ) {
	/**
	 * Deletes a stored request-token secret.
	 *
	 * @param string $token Request token.
	 *
	 * @return bool
	 */
	function pixassist_account_delete_request_token_secret( $token ) {
		return function_exists( 'delete_site_transient' )
			? (bool) delete_site_transient( pixassist_account_request_token_key( $token ) )
			: false;
	}
}

if ( ! function_exists( 'pixassist_account_callback_url' ) ) {
	/**
	 * Builds the OAuth callback URL.
	 *
	 * @return string
	 */
	function pixassist_account_callback_url() {
		$state = function_exists( 'wp_create_nonce' ) ? (string) wp_create_nonce( pixassist_account_nonce_action() ) : '';

		return add_query_arg(
			array(
				'action'          => 'pixassist_account_connect',
				'pixassist_state' => $state,
			),
			admin_url( 'admin-post.php' )
		);
	}
}

if ( ! function_exists( 'pixassist_account_verify_nonce' ) ) {
	/**
	 * Verifies an account action nonce/state.
	 *
	 * @param mixed $value Nonce value.
	 *
	 * @return bool
	 */
	function pixassist_account_verify_nonce( $value ) {
		if ( is_string( $value ) && function_exists( 'wp_unslash' ) ) {
			$value = wp_unslash( $value );
		}

		return function_exists( 'wp_verify_nonce' ) && (bool) wp_verify_nonce( $value, pixassist_account_nonce_action() );
	}
}

if ( ! function_exists( 'pixassist_account_can_manage' ) ) {
	/**
	 * Whether the current user may manage the account connection.
	 *
	 * @return bool
	 */
	function pixassist_account_can_manage() {
		return function_exists( 'current_user_can' ) && current_user_can( pixassist_account_capability() );
	}
}

if ( ! function_exists( 'pixassist_account_result' ) ) {
	/**
	 * Builds a small account action result.
	 *
	 * @param string $status       Status code.
	 * @param string $message      Optional message.
	 * @param string $redirect_url Optional redirect URL.
	 *
	 * @return array
	 */
	function pixassist_account_result( $status, $message = '', $redirect_url = '' ) {
		return array(
			'status'       => (string) $status,
			'message'      => (string) $message,
			'redirect_url' => (string) $redirect_url,
		);
	}
}

if ( ! function_exists( 'pixassist_account_initiate_connection' ) ) {
	/**
	 * Starts the OAuth account connection.
	 *
	 * @param array $request Request data.
	 *
	 * @return array Account action result.
	 */
	function pixassist_account_initiate_connection( $request ) {
		if ( ( function_exists( 'pixassist_is_care_active' ) && pixassist_is_care_active() )
			|| ! pixassist_account_can_manage()
			|| ! pixassist_account_verify_nonce( isset( $request['_wpnonce'] ) ? $request['_wpnonce'] : '' ) ) {
			return pixassist_account_result( 'denied', esc_html__( 'You are not allowed to connect a Pixelgrade account.', '__plugin_txtd' ) );
		}

		if ( ! pixassist_account_oauth_is_configured() ) {
			return pixassist_account_result( 'not_configured', esc_html__( 'The Pixelgrade account connection is not configured for this build.', '__plugin_txtd' ) );
		}

		$request_token = pixassist_account_oauth_request_token( pixassist_account_callback_url() );
		if ( empty( $request_token['oauth_token'] ) ) {
			return pixassist_account_result( 'connect_failed', esc_html__( 'We could not reach the Pixelgrade account service. Please try again.', '__plugin_txtd' ) );
		}

		pixassist_account_save_request_token_secret( $request_token['oauth_token'], isset( $request_token['oauth_token_secret'] ) ? (string) $request_token['oauth_token_secret'] : '' );

		return pixassist_account_result(
			'redirect',
			'',
			pixassist_account_oauth_authorize_url( $request_token['oauth_token'], isset( $request_token['oauth_token_secret'] ) ? (string) $request_token['oauth_token_secret'] : '' )
		);
	}
}

if ( ! function_exists( 'pixassist_account_handle_callback' ) ) {
	/**
	 * Completes the OAuth account connection callback.
	 *
	 * @param array $request Callback request data.
	 *
	 * @return array Account action result.
	 */
	function pixassist_account_handle_callback( $request ) {
		if ( ( function_exists( 'pixassist_is_care_active' ) && pixassist_is_care_active() )
			|| ! pixassist_account_can_manage()
			|| ! pixassist_account_verify_nonce( isset( $request['pixassist_state'] ) ? $request['pixassist_state'] : '' ) ) {
			return pixassist_account_result( 'denied', esc_html__( 'You are not allowed to connect a Pixelgrade account.', '__plugin_txtd' ) );
		}

		$oauth_token = pixassist_account_sanitize_string( isset( $request['oauth_token'] ) ? $request['oauth_token'] : '' );
		$verifier    = pixassist_account_sanitize_string( isset( $request['oauth_verifier'] ) ? $request['oauth_verifier'] : '' );
		$secret      = '' !== $oauth_token ? pixassist_account_get_request_token_secret( $oauth_token ) : null;

		if ( null === $secret ) {
			pixassist_account_log_oauth_failure( 'request-token secret missing at callback (expired or lost between legs)', '' !== $oauth_token ? 'oauth_token present' : 'oauth_token missing' );
			return pixassist_account_result( 'connect_failed', esc_html__( 'We could not connect your Pixelgrade account. Please try again.', '__plugin_txtd' ) );
		}

		$access = pixassist_account_oauth_access_token( $oauth_token, $secret, $verifier );
		pixassist_account_delete_request_token_secret( $oauth_token );

		if ( empty( $access ) || 0 >= (int) ( isset( $access['pixelgrade_user_id'] ) ? $access['pixelgrade_user_id'] : 0 ) ) {
			pixassist_account_log_oauth_failure( 'access leg returned no usable identity', empty( $access ) ? 'empty access response' : 'no pixelgrade_user_id in response' );
			return pixassist_account_result( 'connect_failed', esc_html__( 'We could not connect your Pixelgrade account. Please try again.', '__plugin_txtd' ) );
		}

		pixassist_save_account_connection(
			array(
				'pixelgrade_user_id' => $access['pixelgrade_user_id'],
				'email'              => isset( $access['email'] ) ? $access['email'] : '',
				'display_name'       => isset( $access['display_name'] ) ? $access['display_name'] : '',
				'user_login'         => isset( $access['user_login'] ) ? $access['user_login'] : '',
				'oauth_token'        => isset( $access['oauth_token'] ) ? $access['oauth_token'] : '',
				'oauth_token_secret' => isset( $access['oauth_token_secret'] ) ? $access['oauth_token_secret'] : '',
			)
		);

		return pixassist_account_result( 'connected', esc_html__( 'Your Pixelgrade account is connected.', '__plugin_txtd' ) );
	}
}

if ( ! function_exists( 'pixassist_account_disconnect' ) ) {
	/**
	 * Disconnects the host account.
	 *
	 * @param array $request Request data.
	 *
	 * @return array Account action result.
	 */
	function pixassist_account_disconnect( $request ) {
		if ( ( function_exists( 'pixassist_is_care_active' ) && pixassist_is_care_active() )
			|| ! pixassist_account_can_manage()
			|| ! pixassist_account_verify_nonce( isset( $request['_wpnonce'] ) ? $request['_wpnonce'] : '' ) ) {
			return pixassist_account_result( 'denied', esc_html__( 'You are not allowed to disconnect this Pixelgrade account.', '__plugin_txtd' ) );
		}

		pixassist_delete_account_connection();

		return pixassist_account_result( 'disconnected', esc_html__( 'Your Pixelgrade account is disconnected.', '__plugin_txtd' ) );
	}
}

if ( ! function_exists( 'pixassist_account_hub_url' ) ) {
	/**
	 * Builds the Account tab URL, optionally with a notice status.
	 *
	 * @param string $status Optional status.
	 *
	 * @return string
	 */
	function pixassist_account_hub_url( $status = '' ) {
		$url = admin_url( 'themes.php?page=pixelgrade&tab=account' );

		if ( '' !== $status ) {
			$url = add_query_arg( array( 'pixassist_account' => sanitize_key( $status ) ), $url );
		}

		return $url;
	}
}

if ( ! function_exists( 'pixassist_handle_account_connect_init' ) ) {
	/**
	 * Admin-post edge that starts the OAuth connection.
	 */
	function pixassist_handle_account_connect_init() {
		$request = function_exists( 'wp_unslash' ) ? wp_unslash( $_GET ) : $_GET; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce validated below.
		$result  = pixassist_account_initiate_connection( is_array( $request ) ? $request : array() );

		if ( 'redirect' === $result['status'] && '' !== $result['redirect_url'] && function_exists( 'wp_redirect' ) ) {
			wp_redirect( $result['redirect_url'] ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- External OAuth provider redirect.
			if ( ! defined( 'PIXELGRADE_ASSISTANT_TESTING' ) ) {
				exit;
			}
			return;
		}

		if ( function_exists( 'wp_safe_redirect' ) ) {
			wp_safe_redirect( pixassist_account_hub_url( $result['status'] ) );
			if ( ! defined( 'PIXELGRADE_ASSISTANT_TESTING' ) ) {
				exit;
			}
		}
	}
}

if ( ! function_exists( 'pixassist_handle_account_connect_callback' ) ) {
	/**
	 * Admin-post edge that completes the OAuth callback.
	 */
	function pixassist_handle_account_connect_callback() {
		$request = function_exists( 'wp_unslash' ) ? wp_unslash( $_GET ) : $_GET; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- State is validated below.
		$result  = pixassist_account_handle_callback( is_array( $request ) ? $request : array() );

		if ( function_exists( 'wp_safe_redirect' ) ) {
			wp_safe_redirect( pixassist_account_hub_url( $result['status'] ) );
			if ( ! defined( 'PIXELGRADE_ASSISTANT_TESTING' ) ) {
				exit;
			}
		}
	}
}

if ( ! function_exists( 'pixassist_handle_account_disconnect' ) ) {
	/**
	 * Admin-post edge that disconnects the account.
	 */
	function pixassist_handle_account_disconnect() {
		$request = function_exists( 'wp_unslash' ) ? wp_unslash( $_POST ) : $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce validated below.
		$result  = pixassist_account_disconnect( is_array( $request ) ? $request : array() );

		if ( function_exists( 'wp_safe_redirect' ) ) {
			wp_safe_redirect( pixassist_account_hub_url( $result['status'] ) );
			if ( ! defined( 'PIXELGRADE_ASSISTANT_TESTING' ) ) {
				exit;
			}
		}
	}
}

if ( ! function_exists( 'pixassist_register_account_tab' ) ) {
	/**
	 * Registers the free Account tab in the modern hub.
	 *
	 * @param array $tabs Existing tab descriptors.
	 *
	 * @return array
	 */
	function pixassist_register_account_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'account',
			'label'      => esc_html__( 'Account', '__plugin_txtd' ),
			'capability' => pixassist_account_capability(),
			'component'  => 'account',
			'gate'       => '',
			'badge'      => '',
			'order'      => 10,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_account_connect_url' ) ) {
	/**
	 * Builds the connect action URL.
	 *
	 * @return string
	 */
	function pixassist_get_account_connect_url() {
		return add_query_arg(
			array(
				'action'   => 'pixassist_account_connect_init',
				'_wpnonce' => function_exists( 'wp_create_nonce' ) ? wp_create_nonce( pixassist_account_nonce_action() ) : '',
			),
			admin_url( 'admin-post.php' )
		);
	}
}

if ( ! function_exists( 'pixassist_get_account_notice' ) ) {
	/**
	 * Builds the current Account tab notice from the URL status.
	 *
	 * @return array|null Notice data.
	 */
	function pixassist_get_account_notice() {
		$status = '';
		if ( isset( $_GET['pixassist_account'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only notice status.
			$status = sanitize_key( wp_unslash( $_GET['pixassist_account'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}

		$notices = array(
			'connected'      => array(
				'status'  => 'connected',
				'type'    => 'success',
				'message' => esc_html__( 'Your Pixelgrade account is connected.', '__plugin_txtd' ),
			),
			'disconnected'   => array(
				'status'  => 'disconnected',
				'type'    => 'success',
				'message' => esc_html__( 'Your Pixelgrade account is disconnected.', '__plugin_txtd' ),
			),
			'connect_failed' => array(
				'status'  => 'connect_failed',
				'type'    => 'error',
				'message' => esc_html__( 'We could not connect your Pixelgrade account. Please try again.', '__plugin_txtd' ),
			),
			'not_configured' => array(
				'status'  => 'not_configured',
				'type'    => 'warning',
				'message' => esc_html__( 'The Pixelgrade account connection is not configured for this build.', '__plugin_txtd' ),
			),
			'denied'         => array(
				'status'  => 'denied',
				'type'    => 'error',
				'message' => esc_html__( 'You are not allowed to manage the Pixelgrade account connection.', '__plugin_txtd' ),
			),
		);

		return isset( $notices[ $status ] ) ? $notices[ $status ] : null;
	}
}

if ( ! function_exists( 'pixassist_get_account_help_url' ) ) {
	/**
	 * Builds the Help tab URL for Account-tab next actions.
	 *
	 * @return string
	 */
	function pixassist_get_account_help_url() {
		return admin_url( 'themes.php?page=pixelgrade&tab=help' );
	}
}

if ( ! function_exists( 'pixassist_get_account_docs_url' ) ) {
	/**
	 * Retrieves the public documentation URL for Account-tab value copy.
	 *
	 * @return string
	 */
	function pixassist_get_account_docs_url() {
		if ( function_exists( 'pixassist_docs_online_url' ) ) {
			return pixassist_docs_online_url();
		}

		return defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE' )
			? trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs'
			: '';
	}
}

if ( ! function_exists( 'pixassist_get_account_theme_name' ) ) {
	/**
	 * Retrieves the active theme name for Account-tab site context.
	 *
	 * @return string
	 */
	function pixassist_get_account_theme_name() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_original_theme_name' ) ) {
			$name = PixelgradeAssistant_Admin::get_original_theme_name();
			if ( is_scalar( $name ) && '' !== (string) $name ) {
				return (string) $name;
			}
		}

		if ( function_exists( 'wp_get_theme' ) ) {
			$theme = wp_get_theme();
			if ( is_object( $theme ) && method_exists( $theme, 'get' ) ) {
				return (string) $theme->get( 'Name' );
			}
		}

		return '';
	}
}

if ( ! function_exists( 'pixassist_get_account_product_sku' ) ) {
	/**
	 * Retrieves the product/docs SKU for Account-tab site context.
	 *
	 * @return string
	 */
	function pixassist_get_account_product_sku() {
		if ( function_exists( 'pixassist_docs_product_sku' ) ) {
			return (string) pixassist_docs_product_sku();
		}

		if ( class_exists( 'PixelgradeAssistant_Help' ) && method_exists( 'PixelgradeAssistant_Help', 'get_kb_product_sku' ) ) {
			return (string) PixelgradeAssistant_Help::get_kb_product_sku();
		}

		if ( function_exists( 'get_stylesheet' ) ) {
			return (string) get_stylesheet();
		}

		return '';
	}
}

if ( ! function_exists( 'pixassist_get_account_site_context' ) ) {
	/**
	 * Builds the secret-free site/product context displayed by the Account cockpit.
	 *
	 * @return array
	 */
	function pixassist_get_account_site_context() {
		return array(
			'themeName'  => pixassist_get_account_theme_name(),
			'productSku' => pixassist_get_account_product_sku(),
			'siteUrl'    => function_exists( 'home_url' ) ? home_url( '/' ) : '',
			'helpUrl'    => pixassist_get_account_help_url(),
			'docsUrl'    => pixassist_get_account_docs_url(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_account_products_summary' ) ) {
	/**
	 * Builds a secret-free products and licenses summary for the Account cockpit.
	 *
	 * Assistant only reads Plus's public status contract here. License hashes, entitlement internals,
	 * package URLs, and account credentials remain Plus-owned and server-side.
	 *
	 * @param array $site Secret-free site context.
	 *
	 * @return array
	 */
	function pixassist_get_account_products_summary( $site ) {
		$site       = is_array( $site ) ? $site : array();
		$theme_name = ! empty( $site['themeName'] ) ? (string) $site['themeName'] : '';
		$product    = ! empty( $site['productSku'] ) ? (string) $site['productSku'] : '';

		$plus_status = function_exists( 'pixassist_get_plus_status' ) ? pixassist_get_plus_status() : array();
		$plus_active = ! empty( $plus_status['is_plus_active'] );
		$plus_label  = ! empty( $plus_status['plus_product_label'] ) && is_scalar( $plus_status['plus_product_label'] )
			? pixassist_account_sanitize_string( $plus_status['plus_product_label'] )
			: 'Pixelgrade Plus';
		$plus_url    = ! empty( $plus_status['plus_settings_url'] ) && is_scalar( $plus_status['plus_settings_url'] )
			? ( function_exists( 'esc_url_raw' ) ? esc_url_raw( (string) $plus_status['plus_settings_url'] ) : (string) $plus_status['plus_settings_url'] )
			: '';

		$labels = array_filter( array( $theme_name ? $theme_name : $product ) );
		if ( $plus_active ) {
			$labels[] = $plus_label;
		}

		$summary = array(
			'state'       => 'available',
			'statusLabel' => esc_html__( 'Available', '__plugin_txtd' ),
			'label'       => implode( ' + ', array_filter( $labels ) ),
			'description' => esc_html__( 'This account can use the free Pixelgrade support and documentation available for the active theme.', '__plugin_txtd' ),
			'plusLabel'   => $plus_active ? $plus_label : '',
			'url'         => '',
		);

		if ( '' === $summary['label'] ) {
			$summary['label'] = esc_html__( 'Pixelgrade products', '__plugin_txtd' );
		}

		if ( $plus_active ) {
			$summary['url'] = $plus_url;

			if ( ! empty( $plus_status['is_plus_licensed'] ) ) {
				$summary['state']       = 'licensed';
				$summary['statusLabel'] = esc_html__( 'Licensed', '__plugin_txtd' );
				/* translators: %s: Pixelgrade Plus product label. */
				$summary['description'] = sprintf( esc_html__( '%s license is active. The Plus panel shows entitlement and add-on details.', '__plugin_txtd' ), $plus_label );
			} else {
				$summary['state']       = 'needs_license';
				$summary['statusLabel'] = esc_html__( 'Needs license', '__plugin_txtd' );
				/* translators: %s: Pixelgrade Plus product label. */
				$summary['description'] = sprintf( esc_html__( '%s is installed. Use the Plus panel to activate any eligible license found on this account.', '__plugin_txtd' ), $plus_label );
			}
		}

		return $summary;
	}
}

if ( ! function_exists( 'pixassist_format_account_connected_date' ) ) {
	/**
	 * Formats the stored connection timestamp as a date-only support detail.
	 *
	 * @param string $connected_at Stored connection timestamp.
	 *
	 * @return string
	 */
	function pixassist_format_account_connected_date( $connected_at ) {
		$connected_at = pixassist_account_sanitize_string( $connected_at );
		if ( '' === $connected_at ) {
			return '';
		}

		$timestamp = strtotime( $connected_at );
		if ( false === $timestamp ) {
			return '';
		}

		if ( function_exists( 'date_i18n' ) ) {
			$date_format = function_exists( 'get_option' ) ? (string) get_option( 'date_format', 'Y-m-d' ) : 'Y-m-d';

			return date_i18n( $date_format, $timestamp );
		}

		return gmdate( 'Y-m-d', $timestamp );
	}
}

if ( ! function_exists( 'pixassist_get_account_details_summary' ) ) {
	/**
	 * Builds support-facing account details kept out of the identity hero.
	 *
	 * @param array $account Identity-only account payload.
	 *
	 * @return array
	 */
	function pixassist_get_account_details_summary( $account ) {
		$account = is_array( $account ) ? $account : array();

		if ( empty( $account['is_connected'] ) ) {
			return array();
		}

		$pixelgrade_id = ! empty( $account['pixelgrade_user_id'] ) ? absint( $account['pixelgrade_user_id'] ) : 0;
		$connected_on = ! empty( $account['connected_at'] ) ? pixassist_format_account_connected_date( (string) $account['connected_at'] ) : '';

		if ( 0 >= $pixelgrade_id && '' === $connected_on ) {
			return array();
		}

		$description = '';
		if ( '' !== $connected_on ) {
			/* translators: %s: account connection date. */
			$description = sprintf( esc_html__( 'Connected %s.', '__plugin_txtd' ), $connected_on );
		}

		$label = esc_html__( 'Connected account', '__plugin_txtd' );
		if ( 0 < $pixelgrade_id ) {
			/* translators: %d: pixelgrade.com user id. */
			$label = sprintf( esc_html__( 'Pixelgrade ID %d', '__plugin_txtd' ), $pixelgrade_id );
		}

		return array(
			'label'       => $label,
			'description' => $description,
			'state'       => 'available',
			'statusLabel' => esc_html__( 'Ready', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_account_value_data' ) ) {
	/**
	 * Builds the value-cockpit payload for the host-owned Account tab.
	 *
	 * This is UI-only and secret-free. It does not change pixassist_get_account() and never exposes
	 * OAuth credentials or Plus-owned license/entitlement data.
	 *
	 * @param array $account Identity-only account payload.
	 *
	 * @return array
	 */
	function pixassist_get_account_value_data( $account ) {
		$connected  = ! empty( $account['is_connected'] );
		$help_url   = pixassist_get_account_help_url();
		$docs_url   = pixassist_get_account_docs_url();
		$site       = pixassist_get_account_site_context();
		$can_oauth  = pixassist_account_oauth_is_configured();
		$support    = array(
			'state'       => $connected ? 'available' : 'connect_required',
			'label'       => $connected ? esc_html__( 'Support access is ready', '__plugin_txtd' ) : esc_html__( 'Support access needs a connection', '__plugin_txtd' ),
			'description' => $connected
				? esc_html__( 'You can send support requests with your site context and Pixelgrade identity attached.', '__plugin_txtd' )
				: esc_html__( 'Connect a free pixelgrade.com account to send support requests from this dashboard. Documentation stays available without connecting.', '__plugin_txtd' ),
		);

		$next_action = $connected
			? array(
				'id'      => 'get_help',
				'type'    => 'link',
				'label'   => esc_html__( 'Get help', '__plugin_txtd' ),
				'url'     => $help_url,
				'variant' => 'primary',
			)
			: array(
				'id'      => $can_oauth ? 'connect_account' : 'browse_docs',
				'type'    => 'link',
				'label'   => $can_oauth ? esc_html__( 'Connect account', '__plugin_txtd' ) : esc_html__( 'Browse documentation', '__plugin_txtd' ),
				'url'     => $can_oauth ? pixassist_get_account_connect_url() : $docs_url,
				'variant' => 'primary',
			);

		return array(
			'support'        => $support,
			'site'           => $site,
			'products'       => pixassist_get_account_products_summary( $site ),
			'accountDetails' => pixassist_get_account_details_summary( $account ),
			'enablements'    => array(
				array(
					'id'          => 'support',
					'label'       => esc_html__( 'Dashboard support', '__plugin_txtd' ),
					'state'       => $connected ? 'available' : 'connect_required',
					'description' => $connected
						? esc_html__( 'Support requests can include the active theme and account identity.', '__plugin_txtd' )
						: esc_html__( 'Connect once to send support requests without leaving WordPress.', '__plugin_txtd' ),
				),
				array(
					'id'          => 'docs',
					'label'       => esc_html__( 'Product documentation', '__plugin_txtd' ),
					'state'       => 'available',
					'description' => esc_html__( 'Browse product guidance for the active Pixelgrade theme anytime.', '__plugin_txtd' ),
					'url'         => $docs_url,
				),
				array(
					'id'          => 'account',
					'label'       => esc_html__( 'Account identity', '__plugin_txtd' ),
					'state'       => $connected ? 'available' : 'optional',
					'description' => $connected
						? esc_html__( 'Your pixelgrade.com identity is available to trusted server-side actions.', '__plugin_txtd' )
						: esc_html__( 'The connection is optional and can be disconnected from this page.', '__plugin_txtd' ),
				),
			),
			'nextAction'  => $next_action,
		);
	}
}

if ( ! function_exists( 'pixassist_get_account_data' ) ) {
	/**
	 * Builds the Account tab bootstrap payload.
	 *
	 * @return array
	 */
	function pixassist_get_account_data() {
		$account = function_exists( 'pixassist_get_account' ) ? pixassist_get_account() : array( 'is_connected' => false );

		return array(
			'account'      => $account,
			'accountValue' => pixassist_get_account_value_data( $account ),
			'actions'      => array(
				'connectUrl'       => pixassist_get_account_connect_url(),
				'disconnectUrl'    => admin_url( 'admin-post.php' ),
				'disconnectAction' => 'pixassist_account_disconnect',
				'disconnectNonce'  => function_exists( 'wp_create_nonce' ) ? wp_create_nonce( pixassist_account_nonce_action() ) : '',
			),
			'notice'       => pixassist_get_account_notice(),
			'oauth'        => array(
				'isConfigured' => pixassist_account_oauth_is_configured(),
			),
			'copy'         => array(
				'title'                  => esc_html__( 'Pixelgrade account', '__plugin_txtd' ),
				'connectedStatusLabel'   => esc_html__( 'Site connected. Everything is ready.', '__plugin_txtd' ),
				'connectedDescription'   => esc_html__( 'Your site is securely connected to your pixelgrade.com account. Support requests and account-aware tools can use this identity.', '__plugin_txtd' ),
				'disconnectedDescription' => esc_html__( 'Connect a free pixelgrade.com account to send support requests and get help right from your dashboard. It is free for everyone and always optional.', '__plugin_txtd' ),
				'connectLabel'           => esc_html__( 'Connect account', '__plugin_txtd' ),
				'disconnectLabel'        => esc_html__( 'Disconnect account', '__plugin_txtd' ),
				'notConfiguredLabel'     => esc_html__( 'Account connection is not configured.', '__plugin_txtd' ),
			),
		);
	}
}

if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixassist_account', 'pixassist_filter_modern_account_identity' );
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_account_tab' );
}

if ( function_exists( 'add_action' ) ) {
	add_action( 'admin_post_pixassist_account_connect_init', 'pixassist_handle_account_connect_init' );
	add_action( 'admin_post_pixassist_account_connect', 'pixassist_handle_account_connect_callback' );
	add_action( 'admin_post_pixassist_account_disconnect', 'pixassist_handle_account_disconnect' );
}
