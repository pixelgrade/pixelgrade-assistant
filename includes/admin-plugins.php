<?php
/**
 * The free Plugins tab: recommended plugin management inside the Appearance -> Pixelgrade hub.
 *
 * This tab is the modern hub counterpart of the legacy dashboard/setup-wizard plugin manager. It
 * does not invent a second source of truth: plugin definitions still flow through the existing
 * `pixassist_recommended_plugins` config seam, are registered with TGMPA, and are localized through
 * PixelgradeAssistant_Admin::localize_tgmpa_data(). Pixelgrade Plus can add its own entries through
 * the same recommended-plugins filter without a new contract.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// The Setup tab is a Pixelgrade Design preflight/readiness screen. The recommended-plugins list is
// one (actionable) part of it; the readiness classification + copy live in setup-readiness.php so the
// React tab stays presentational and the logic stays unit-testable.
require_once __DIR__ . '/setup-readiness.php';

if ( ! function_exists( 'pixassist_register_plugins_tab' ) ) {
	/**
	 * Register the free Plugins tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Plugins tab appended.
	 */
	function pixassist_register_plugins_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'plugins',
			'label'      => esc_html__( 'Setup', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'plugins',
			'gate'       => '',
			'order'      => 50,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_plugins_data' ) ) {
	/**
	 * Build the bootstrap payload the Setup tab renders.
	 *
	 * @return array {
	 *     @type array[] $plugins   Normalized recommended plugins (the actionable list).
	 *     @type array   $copy      Labels and helper copy derived from the existing config.
	 *     @type array   $readiness Pixelgrade Design preflight summary (see pixassist_get_setup_readiness_data()).
	 * }
	 */
	function pixassist_get_plugins_data() {
		return array(
			'plugins'   => pixassist_get_recommended_plugins_list(),
			'copy'      => pixassist_get_plugins_copy( pixassist_get_plugins_config() ),
			'readiness' => function_exists( 'pixassist_get_setup_readiness_data' ) ? pixassist_get_setup_readiness_data() : array(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_recommended_plugins_list' ) ) {
	/**
	 * Build just the normalized recommended-plugins list (the actionable part of the Setup tab).
	 *
	 * Split out from pixassist_get_plugins_data() so the readiness fact-gatherer can read plugin state
	 * without re-entering pixassist_get_plugins_data() (which now also assembles the readiness summary).
	 *
	 * @return array[] Normalized, sorted recommended plugins.
	 */
	function pixassist_get_recommended_plugins_list() {
		$config  = pixassist_get_plugins_config();
		$plugins = array();

		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'localize_tgmpa_data' ) ) {
			$plugins = PixelgradeAssistant_Admin::localize_tgmpa_data();
		}

		if ( empty( $plugins ) && ! empty( $config['requiredPlugins']['plugins'] ) && is_array( $config['requiredPlugins']['plugins'] ) ) {
			$plugins = $config['requiredPlugins']['plugins'];
		}

		$plugins = pixassist_normalize_plugins_payload( $plugins );

		return pixassist_maybe_append_plus_setup_plugin( $plugins );
	}
}

if ( ! function_exists( 'pixassist_plugin_counts_for_setup' ) ) {
	/**
	 * Whether a normalized recommended-plugin row counts toward required free-path setup readiness.
	 *
	 * External-action hand-offs (the WordPress.org-safe Pixelgrade Plus setup row, which can only be
	 * downloaded from Pixelgrade.com and never installed inside wp-admin) are OPTIONAL upsells, not
	 * required free-path setup. They must never keep the Get Started checklist or the Home "Setup"
	 * command-center card in a permanent "needs attention" state — a free user with the free plugins
	 * (Nova Blocks + Style Manager) active must be able to reach 100%. Everything else (the wp.org
	 * free plugins) counts.
	 *
	 * @param array $plugin Normalized plugin row (camelCase keys from pixassist_normalize_plugin_payload()).
	 *
	 * @return bool
	 */
	function pixassist_plugin_counts_for_setup( $plugin ) {
		if ( ! is_array( $plugin ) ) {
			return false;
		}

		$source_type = isset( $plugin['sourceType'] ) ? (string) $plugin['sourceType'] : '';
		$action_type = isset( $plugin['actionType'] ) ? (string) $plugin['actionType'] : '';

		// The Pixelgrade Plus setup row is always an external hand-off (source_type 'external-action'),
		// whether it is a missing Pixelgrade.com download or an installed-but-inactive local plugin.
		if ( 'external-action' === $source_type || 'external' === $action_type ) {
			return false;
		}

		return true;
	}
}

if ( ! function_exists( 'pixassist_get_plugins_config' ) ) {
	/**
	 * Read Assistant's existing merged config when the admin class is available.
	 *
	 * @return array
	 */
	function pixassist_get_plugins_config() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_config' ) ) {
			$config = PixelgradeAssistant_Admin::get_config();

			return is_array( $config ) ? $config : array();
		}

		return array();
	}
}

if ( ! function_exists( 'pixassist_get_plugins_copy' ) ) {
	/**
	 * Extract the tab copy from the legacy plugin-manager config, with safe defaults.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return array
	 */
	function pixassist_get_plugins_copy( $config ) {
		$recommended = isset( $config['recommendedPlugins'] ) && is_array( $config['recommendedPlugins'] )
			? $config['recommendedPlugins']
			: array();
		$manager_l10n = isset( $config['pluginManager']['l10n'] ) && is_array( $config['pluginManager']['l10n'] )
			? $config['pluginManager']['l10n']
			: array();
		return array(
			'title'            => esc_html__( 'Setup', '__plugin_txtd' ),
			'content'          => esc_html__( 'Check the recommended plugins and activate anything Pixelgrade Design needs before you start working.', '__plugin_txtd' ),
			'validatedTitle'   => pixassist_plugins_replace_tokens( isset( $recommended['validatedTitle'] ) ? (string) $recommended['validatedTitle'] : esc_html__( 'Setup ready', '__plugin_txtd' ) ),
			'validatedContent' => pixassist_plugins_replace_tokens( isset( $recommended['validatedContent'] ) ? (string) $recommended['validatedContent'] : esc_html__( 'The recommended plugins are active.', '__plugin_txtd' ) ),
			'empty'            => isset( $manager_l10n['noPlugins'] ) ? (string) $manager_l10n['noPlugins'] : esc_html__( 'You are all set. There are no recommended plugins for this theme right now.', '__plugin_txtd' ),
			'groups'           => array(
				'required'    => esc_html__( 'Required', '__plugin_txtd' ),
				'recommended' => esc_html__( 'Recommended', '__plugin_txtd' ),
			),
			'actions'          => array(
				'install'      => isset( $config['l10n']['pluginInstallLabel'] ) ? (string) $config['l10n']['pluginInstallLabel'] : esc_html__( 'Install', '__plugin_txtd' ),
				'activate'     => isset( $config['l10n']['pluginActivateLabel'] ) ? (string) $config['l10n']['pluginActivateLabel'] : esc_html__( 'Activate', '__plugin_txtd' ),
				'update'       => isset( $config['l10n']['pluginUpdateLabel'] ) ? (string) $config['l10n']['pluginUpdateLabel'] : esc_html__( 'Update', '__plugin_txtd' ),
				'active'       => esc_html__( 'Active', '__plugin_txtd' ),
				'inactive'     => esc_html__( 'Installed', '__plugin_txtd' ),
				'missing'      => esc_html__( 'Not installed', '__plugin_txtd' ),
				'outdated'     => esc_html__( 'Update available', '__plugin_txtd' ),
				'working'      => esc_html__( 'Working...', '__plugin_txtd' ),
				'failed'       => esc_html__( 'Action failed. Please try again from Plugins > Installed Plugins.', '__plugin_txtd' ),
				'refresh'      => esc_html__( 'Refresh the page to confirm the latest plugin status.', '__plugin_txtd' ),
			),
		);
	}
}

if ( ! function_exists( 'pixassist_plugins_replace_tokens' ) ) {
	/**
	 * Replace the legacy config's simple copy tokens for the hub tab.
	 *
	 * @param string $text Raw copy.
	 *
	 * @return string
	 */
	function pixassist_plugins_replace_tokens( $text ) {
		$theme_name = 'Pixelgrade';

		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_theme_support' ) ) {
			$support = PixelgradeAssistant_Admin::get_theme_support();
			if ( ! empty( $support['theme_title'] ) ) {
				$theme_name = (string) $support['theme_title'];
			} elseif ( ! empty( $support['theme_name'] ) ) {
				$theme_name = (string) $support['theme_name'];
			}
		}

		$shop_domain = defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN' ) ? PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN : 'pixelgrade.com';

		return str_replace(
			array( '{{theme_name}}', '{{shopdomain}}' ),
			array( $theme_name, $shop_domain ),
			(string) $text
		);
	}
}

if ( ! function_exists( 'pixassist_normalize_plugins_payload' ) ) {
	/**
	 * Normalize TGMPA/config plugin data into a stable, sorted list for the React tab.
	 *
	 * @param array $plugins TGMPA plugins keyed by slug, or config plugin rows.
	 *
	 * @return array[]
	 */
	function pixassist_normalize_plugins_payload( $plugins ) {
		if ( empty( $plugins ) || ! is_array( $plugins ) ) {
			return array();
		}

		$normalized = array();
		foreach ( $plugins as $key => $plugin ) {
			if ( ! is_array( $plugin ) ) {
				continue;
			}

			$item = pixassist_normalize_plugin_payload( $plugin, $key );
			if ( empty( $item['slug'] ) ) {
				continue;
			}

			$normalized[] = $item;
		}

		usort(
			$normalized,
			function ( $a, $b ) {
				if ( $a['required'] !== $b['required'] ) {
					return $a['required'] ? -1 : 1;
				}

				if ( $a['order'] === $b['order'] ) {
					return strcmp( $a['name'], $b['name'] );
				}

				return ( $a['order'] < $b['order'] ) ? -1 : 1;
			}
		);

		return $normalized;
	}
}

if ( ! function_exists( 'pixassist_normalize_plugin_payload' ) ) {
	/**
	 * Normalize one plugin row.
	 *
	 * @param array      $plugin Raw plugin data.
	 * @param int|string $key    Original array key; TGMPA uses the slug as the key.
	 *
	 * @return array
	 */
	function pixassist_normalize_plugin_payload( $plugin, $key ) {
		$slug = ! empty( $plugin['slug'] ) ? (string) $plugin['slug'] : ( is_string( $key ) ? (string) $key : '' );
		$name = ! empty( $plugin['name'] ) ? (string) $plugin['name'] : $slug;

		$is_installed = pixassist_plugins_bool( isset( $plugin['is_installed'] ) ? $plugin['is_installed'] : false );
		$is_active    = pixassist_plugins_bool( isset( $plugin['is_active'] ) ? $plugin['is_active'] : false );
		$is_up_to_date = ! array_key_exists( 'is_up_to_date', $plugin )
			? true
			: pixassist_plugins_bool( $plugin['is_up_to_date'] );

		return array(
			'slug'             => sanitize_key( $slug ),
			'name'             => pixassist_plugins_strip_tags( $name ),
			'description'      => isset( $plugin['description'] ) ? (string) $plugin['description'] : '',
			'author'           => isset( $plugin['author'] ) ? pixassist_plugins_strip_tags( $plugin['author'] ) : '',
			'filePath'         => isset( $plugin['file_path'] ) ? (string) $plugin['file_path'] : '',
			'required'         => pixassist_plugins_bool( isset( $plugin['required'] ) ? $plugin['required'] : false ),
			'selected'         => pixassist_plugins_bool( isset( $plugin['selected'] ) ? $plugin['selected'] : true ),
			'order'            => isset( $plugin['order'] ) ? (int) $plugin['order'] : 10,
			'isInstalled'      => $is_installed,
			'isActive'         => $is_active,
			'isUpToDate'       => $is_up_to_date,
			'isUpdateRequired' => pixassist_plugins_bool( isset( $plugin['is_update_required'] ) ? $plugin['is_update_required'] : false ),
			'status'           => pixassist_get_plugin_payload_status( $is_installed, $is_active, $is_up_to_date ),
			'installUrl'       => isset( $plugin['install_url'] ) ? (string) $plugin['install_url'] : '',
			'activateUrl'      => isset( $plugin['activate_url'] ) ? (string) $plugin['activate_url'] : '',
			'source'           => isset( $plugin['source'] ) ? (string) $plugin['source'] : '',
			'sourceType'       => isset( $plugin['source_type'] ) ? sanitize_key( $plugin['source_type'] ) : 'repo',
			'actionType'       => isset( $plugin['action_type'] ) ? sanitize_key( $plugin['action_type'] ) : '',
			'externalActionUrl' => isset( $plugin['external_action_url'] ) ? ( function_exists( 'esc_url_raw' ) ? esc_url_raw( (string) $plugin['external_action_url'] ) : (string) $plugin['external_action_url'] ) : '',
			'externalActionLabel' => isset( $plugin['external_action_label'] ) ? pixassist_plugins_strip_tags( $plugin['external_action_label'] ) : '',
		);
	}
}

if ( ! function_exists( 'pixassist_maybe_append_plus_setup_plugin' ) ) {
	/**
	 * Adds a WordPress.org-safe Pixelgrade Plus setup row when the connected account owns Plus.
	 *
	 * Missing Plus is an external Pixelgrade.com hand-off, not a TGMPA/WUpdates install. Already
	 * installed but inactive Plus can still use WordPress's normal local activation link.
	 *
	 * @param array[] $plugins Normalized plugin rows.
	 *
	 * @return array[]
	 */
	function pixassist_maybe_append_plus_setup_plugin( $plugins ) {
		$plugins = is_array( $plugins ) ? $plugins : array();

		foreach ( $plugins as $plugin ) {
			if ( isset( $plugin['slug'] ) && 'pixelgrade-plus' === $plugin['slug'] ) {
				return $plugins;
			}
		}

		$plus = pixassist_get_plus_setup_plugin_payload();
		if ( empty( $plus ) ) {
			return $plugins;
		}

		$plugins[] = pixassist_normalize_plugin_payload( $plus, 'pixelgrade-plus' );

		usort(
			$plugins,
			function ( $a, $b ) {
				if ( $a['required'] !== $b['required'] ) {
					return $a['required'] ? -1 : 1;
				}

				if ( $a['order'] === $b['order'] ) {
					return strcmp( $a['name'], $b['name'] );
				}

				return ( $a['order'] < $b['order'] ) ? -1 : 1;
			}
		);

		return $plugins;
	}
}

if ( ! function_exists( 'pixassist_get_plus_setup_plugin_payload' ) ) {
	/**
	 * Builds the raw Pixelgrade Plus setup row for the Setup tab.
	 *
	 * @return array
	 */
	function pixassist_get_plus_setup_plugin_payload() {
		$license = function_exists( 'pixassist_get_account_license_summary' ) ? pixassist_get_account_license_summary() : array();
		$status  = function_exists( 'pixassist_get_plus_status' ) ? pixassist_get_plus_status() : array();

		$has_plus_license = ! empty( $license['hasPlusLicense'] );
		$plus_active      = ! empty( $status['is_plus_active'] );
		$installed        = pixassist_is_plus_plugin_installed();

		if ( ! $has_plus_license && ! $plus_active && ! $installed ) {
			return array();
		}

		$label     = ! empty( $status['plus_product_label'] ) && is_scalar( $status['plus_product_label'] )
			? pixassist_plugins_strip_tags( $status['plus_product_label'] )
			: ( ! empty( $license['productLabel'] ) ? pixassist_plugins_strip_tags( $license['productLabel'] ) : 'Pixelgrade Plus' );
		$setup_url = ! empty( $license['setupUrl'] ) && is_scalar( $license['setupUrl'] )
			? (string) $license['setupUrl']
			: trailingslashit( defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE' ) ? PIXELGRADE_ASSISTANT__SHOP_BASE : 'https://pixelgrade.com/' ) . 'plus/';

		$payload = array(
			'name'          => $label,
			'slug'          => 'pixelgrade-plus',
			'file_path'     => 'pixelgrade-plus/pixelgrade-plus.php',
			'required'      => false,
			'selected'      => false,
			'order'         => 30,
			'description'   => $has_plus_license
				? esc_html__( 'Your connected Pixelgrade account includes Pixelgrade Plus. Download the companion plugin from Pixelgrade.com, install it, then activate it here.', '__plugin_txtd' )
				: esc_html__( 'Pixelgrade Plus adds advanced design tools for Pixelgrade LT sites.', '__plugin_txtd' ),
			'author'        => 'Pixelgrade',
			'is_installed'  => $installed || $plus_active,
			'is_active'     => $plus_active,
			'is_up_to_date' => true,
			'source'        => '',
			'source_type'   => 'external-action',
		);

		if ( ! $payload['is_installed'] ) {
			$payload['action_type']           = 'external';
			$payload['external_action_url']   = function_exists( 'esc_url_raw' ) ? esc_url_raw( $setup_url ) : $setup_url;
			$payload['external_action_label'] = esc_html__( 'Download Pixelgrade Plus', '__plugin_txtd' );
			$payload['install_url']           = '';
		} elseif ( ! $payload['is_active'] ) {
			$payload['activate_url'] = pixassist_get_plus_plugin_activate_url( $payload['file_path'] );
		}

		return $payload;
	}
}

if ( ! function_exists( 'pixassist_is_plus_plugin_installed' ) ) {
	/**
	 * Whether Pixelgrade Plus appears to be installed locally.
	 *
	 * @return bool
	 */
	function pixassist_is_plus_plugin_installed() {
		$installed = false;

		if ( defined( 'PIXELGRADE_PLUS_PLUGIN_FILE' ) ) {
			$installed = true;
		}

		if ( ! $installed && defined( 'WP_PLUGIN_DIR' ) && file_exists( WP_PLUGIN_DIR . '/pixelgrade-plus/pixelgrade-plus.php' ) ) {
			$installed = true;
		}

		/**
		 * Filters whether Pixelgrade Plus is installed locally.
		 *
		 * @param bool $installed Whether Plus appears installed.
		 */
		return (bool) apply_filters( 'pixassist_is_plus_plugin_installed', $installed );
	}
}

if ( ! function_exists( 'pixassist_get_plus_plugin_activate_url' ) ) {
	/**
	 * Builds a local activation URL for an installed Pixelgrade Plus plugin.
	 *
	 * @param string $plugin_file Plugin basename.
	 *
	 * @return string
	 */
	function pixassist_get_plus_plugin_activate_url( $plugin_file ) {
		if ( ! function_exists( 'admin_url' ) || ! function_exists( 'add_query_arg' ) || ! function_exists( 'wp_nonce_url' ) ) {
			return '';
		}

		return wp_nonce_url(
			add_query_arg(
				array(
					'action' => 'activate',
					'plugin' => $plugin_file,
				),
				admin_url( 'plugins.php' )
			),
			'activate-plugin_' . $plugin_file
		);
	}
}

if ( ! function_exists( 'pixassist_get_plugin_payload_status' ) ) {
	/**
	 * Derive the UI status from TGMPA's booleans.
	 *
	 * @param bool $is_installed Whether the plugin is installed.
	 * @param bool $is_active    Whether the plugin is active.
	 * @param bool $is_up_to_date Whether the plugin is up to date.
	 *
	 * @return string active|outdated|inactive|missing
	 */
	function pixassist_get_plugin_payload_status( $is_installed, $is_active, $is_up_to_date ) {
		if ( $is_active && ! $is_up_to_date ) {
			return 'outdated';
		}

		if ( $is_active ) {
			return 'active';
		}

		if ( $is_installed ) {
			return 'inactive';
		}

		return 'missing';
	}
}

if ( ! function_exists( 'pixassist_plugins_bool' ) ) {
	/**
	 * Coerce config/TGMPA booleans that may arrive as strings.
	 *
	 * @param mixed $value Value to coerce.
	 *
	 * @return bool
	 */
	function pixassist_plugins_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}

		if ( is_string( $value ) ) {
			$value = strtolower( trim( $value ) );

			if ( in_array( $value, array( '1', 'true', 'yes', 'on' ), true ) ) {
				return true;
			}

			if ( in_array( $value, array( '0', 'false', 'no', 'off', '' ), true ) ) {
				return false;
			}
		}

		return ! empty( $value );
	}
}

if ( ! function_exists( 'pixassist_plugins_strip_tags' ) ) {
	/**
	 * Strip markup from plain-text fields while loading standalone in tests.
	 *
	 * @param string $value Raw string.
	 *
	 * @return string
	 */
	function pixassist_plugins_strip_tags( $value ) {
		if ( function_exists( 'wp_strip_all_tags' ) ) {
			return wp_strip_all_tags( (string) $value );
		}

		return trim( strip_tags( (string) $value ) );
	}
}

// Register the free Plugins tab on the hub registry.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_plugins_tab' );
}
