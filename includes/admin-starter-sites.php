<?php
/**
 * The free Starter Sites tab: free demos hosted by Assistant, premium demos injected by Plus.
 *
 * This tab is the modern hub counterpart of the legacy starter-content card. It reuses the existing
 * remote `starterContent.demos` config and the existing SCE import REST endpoints. Pixelgrade Plus
 * may append premium starters through `pixelgrade/admin_hub/starters`; the item-level `gate` lets the
 * tab render upsells without moving commercial entitlement logic into Assistant.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_register_starter_sites_tab' ) ) {
	/**
	 * Register the mixed Starter Sites tab on the Appearance -> Pixelgrade hub registry.
	 *
	 * @param array $tabs Tab descriptors collected so far.
	 *
	 * @return array Tab descriptors with the Starter Sites tab appended.
	 */
	function pixassist_register_starter_sites_tab( $tabs ) {
		if ( ! is_array( $tabs ) ) {
			$tabs = array();
		}

		$tabs[] = array(
			'id'         => 'starter-sites',
			'label'      => esc_html__( 'Starter Sites', '__plugin_txtd' ),
			'capability' => 'edit_theme_options',
			'component'  => 'starterSites',
			'gate'       => '',
			'order'      => 30,
		);

		return $tabs;
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_data' ) ) {
	/**
	 * Build the bootstrap payload the Starter Sites tab renders.
	 *
	 * @return array {
	 *     @type array[] $starters  Normalized starter descriptors.
	 *     @type array   $copy      Labels and helper copy derived from starterContent l10n.
	 *     @type array   $endpoints Existing Assistant import/uploadMedia REST endpoints.
	 *     @type array   $imported  Existing starter-content import state.
	 *     @type array   $plus      Four-key Plus status, read-only, for gated card rendering.
	 * }
	 */
	function pixassist_get_starter_sites_data() {
		return array(
			'starters'  => pixassist_get_admin_hub_starters(),
			'copy'      => pixassist_get_starter_sites_copy( pixassist_get_starter_sites_config() ),
			'endpoints' => pixassist_get_starter_sites_endpoints(),
			'imported'  => pixassist_get_starter_sites_imported_state(),
			'plus'      => function_exists( 'pixassist_get_plus_status' ) ? pixassist_get_plus_status() : array(
				'is_plus_active'     => false,
				'is_plus_licensed'   => false,
				'plus_settings_url'  => '',
				'plus_product_label' => 'Pixelgrade Plus',
			),
		);
	}
}

if ( ! function_exists( 'pixassist_get_admin_hub_starters' ) ) {
	/**
	 * Collect and normalize free + injected hub starters.
	 *
	 * Assistant seeds the list from the existing free `starterContent.demos` config, then exposes the
	 * list to companions through `pixelgrade/admin_hub/starters`. Consumers can append raw descriptors;
	 * this normalizer keeps the final payload stable and tolerant of malformed entries.
	 *
	 * @return array[] Normalized starter descriptors.
	 */
	function pixassist_get_admin_hub_starters() {
		$config   = pixassist_get_starter_sites_config();
		$starters = array();

		if ( ! empty( $config['starterContent']['demos'] ) && is_array( $config['starterContent']['demos'] ) ) {
			$starters = $config['starterContent']['demos'];
		}

		/**
		 * Filter the Starter Sites shown in the Appearance -> Pixelgrade hub.
		 *
		 * Assistant provides free starter descriptors from `starterContent.demos`. Pixelgrade Plus may
		 * append premium descriptors. Each descriptor uses the normalized item shape documented in
		 * pixassist_normalize_admin_hub_starter().
		 *
		 * @param array[] $starters Raw starter descriptors.
		 * @param array   $context  Host context: provider, config.
		 */
		$starters = apply_filters(
			'pixelgrade/admin_hub/starters',
			$starters,
			array(
				'provider' => 'assistant',
				'config'   => $config,
			)
		);

		return pixassist_normalize_admin_hub_starters( $starters, $config );
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_config' ) ) {
	/**
	 * Read Assistant's existing merged config when the admin class is available.
	 *
	 * @return array
	 */
	function pixassist_get_starter_sites_config() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_config' ) ) {
			$config = PixelgradeAssistant_Admin::get_config();

			return is_array( $config ) ? $config : array();
		}

		return array();
	}
}

if ( ! function_exists( 'pixassist_normalize_admin_hub_starters' ) ) {
	/**
	 * Normalize a starter list into the stable contract shape.
	 *
	 * @param array $starters Raw starter descriptors.
	 * @param array $config   Existing Assistant config.
	 *
	 * @return array[]
	 */
	function pixassist_normalize_admin_hub_starters( $starters, $config = array() ) {
		if ( ! is_array( $starters ) ) {
			return array();
		}

		$normalized = array();

		foreach ( $starters as $key => $starter ) {
			if ( ! is_array( $starter ) ) {
				continue;
			}

			$item = pixassist_normalize_admin_hub_starter( $starter, $key, $config );
			if ( empty( $item['id'] ) || isset( $normalized[ $item['id'] ] ) ) {
				continue;
			}

			$normalized[ $item['id'] ] = $item;
		}

		uasort(
			$normalized,
			function ( $a, $b ) {
				if ( $a['order'] === $b['order'] ) {
					return strcmp( $a['title'], $b['title'] );
				}

				return ( $a['order'] < $b['order'] ) ? -1 : 1;
			}
		);

		return array_values( $normalized );
	}
}

if ( ! function_exists( 'pixassist_normalize_admin_hub_starter' ) ) {
	/**
	 * Normalize one starter descriptor.
	 *
	 * Descriptor keys:
	 * - id (string): stable demo key. Defaults to the associative config key, then slug/title.
	 * - title, description (string): display copy.
	 * - url (string): demo frontend URL; required because the import flow needs a source.
	 * - baseRestUrl (string): SCE REST base. Defaults to url + defaultSceRestPath.
	 * - gate (string): '' for free, plus|plus_licensed for premium upsells.
	 * - image, previewUrl, badge, source (string): optional display metadata.
	 * - order (int): sort weight.
	 * - requiredPlugins (array[]): companion plugins that must be installed AND active before this
	 *   starter can be imported (e.g. Nova Blocks + Style Manager for the free Anima starters). Each
	 *   entry: slug, name, isInstalled, isActive. Data-driven (see
	 *   pixassist_get_starter_required_plugins()), so the dependency gate is not hardcoded in the
	 *   import loop.
	 *
	 * @param array      $starter Raw starter descriptor.
	 * @param int|string $key     Original array key.
	 * @param array      $config  Existing Assistant config.
	 *
	 * @return array
	 */
	function pixassist_normalize_admin_hub_starter( $starter, $key, $config = array() ) {
		$id = '';
		foreach ( array( 'id', 'slug' ) as $candidate_key ) {
			if ( ! empty( $starter[ $candidate_key ] ) ) {
				$id = sanitize_key( $starter[ $candidate_key ] );
				break;
			}
		}

		if ( '' === $id && is_string( $key ) && '' !== $key ) {
			$id = sanitize_key( $key );
		}

		if ( '' === $id && ! empty( $starter['title'] ) ) {
			$id = sanitize_key( $starter['title'] );
		}

		if ( '' === $id ) {
			return array();
		}

		$url = ! empty( $starter['url'] ) ? pixassist_starter_sites_trailingslash( pixassist_starter_sites_esc_url_raw( $starter['url'] ) ) : '';
		if ( '' === $url ) {
			return array();
		}

		$base_rest_url = ! empty( $starter['baseRestUrl'] )
			? pixassist_starter_sites_trailingslash( pixassist_starter_sites_esc_url_raw( $starter['baseRestUrl'] ) )
			: pixassist_starter_sites_trailingslash( $url . pixassist_get_starter_sites_default_rest_path( $config ) );

		$gate   = isset( $starter['gate'] ) ? sanitize_key( $starter['gate'] ) : '';
		$source = isset( $starter['source'] ) ? sanitize_key( $starter['source'] ) : 'assistant';

		return array(
			'id'              => $id,
			'title'           => ! empty( $starter['title'] ) ? (string) $starter['title'] : pixassist_get_starter_sites_default_title(),
			'description'     => isset( $starter['description'] ) && '' !== (string) $starter['description']
				? (string) $starter['description']
				: pixassist_get_starter_sites_default_description( $config ),
			'url'             => $url,
			'baseRestUrl'     => $base_rest_url,
			'gate'            => $gate,
			'image'           => isset( $starter['image'] ) ? pixassist_starter_sites_esc_url_raw( $starter['image'] ) : '',
			'previewUrl'      => isset( $starter['previewUrl'] ) ? pixassist_starter_sites_esc_url_raw( $starter['previewUrl'] ) : '',
			'badge'           => isset( $starter['badge'] ) ? (string) $starter['badge'] : '',
			'source'          => $source,
			'order'           => isset( $starter['order'] ) ? (int) $starter['order'] : 10,
			'requiredPlugins' => pixassist_get_starter_required_plugins(
				array(
					'id'     => $id,
					'gate'   => $gate,
					'source' => $source,
				),
				$starter,
				$config
			),
		);
	}
}

if ( ! function_exists( 'pixassist_get_starter_required_plugins' ) ) {
	/**
	 * Resolve the companion plugins a starter needs before it can be imported.
	 *
	 * Data-driven, so the dependency gate is declared per starter rather than hardcoded in the import
	 * loop. Order of precedence:
	 *   1. A `requiredPlugins` array on the starter descriptor (remote config or an injected starter).
	 *   2. A `starterContent.requiredPlugins` default in the merged config.
	 *   3. Built-in default for the free Anima starters (Nova Blocks + Style Manager) — the free
	 *      starters' pages use Nova Blocks blocks and write Style Manager (`sm_*`) design options, so
	 *      without both active the imported content renders broken.
	 *
	 * Each entry is normalized to { slug, name, isInstalled, isActive } so both the UI nudge and the
	 * server-side gate can reason about it.
	 *
	 * @param array $normalized Partial normalized starter context: id, gate, source.
	 * @param array $raw        Raw starter descriptor.
	 * @param array $config     Existing Assistant config.
	 *
	 * @return array[] Normalized required-plugin descriptors.
	 */
	function pixassist_get_starter_required_plugins( $normalized, $raw = array(), $config = array() ) {
		$required = array();

		if ( ! empty( $raw['requiredPlugins'] ) && is_array( $raw['requiredPlugins'] ) ) {
			$required = $raw['requiredPlugins'];
		} elseif ( ! empty( $config['starterContent']['requiredPlugins'] ) && is_array( $config['starterContent']['requiredPlugins'] ) ) {
			$required = $config['starterContent']['requiredPlugins'];
		} elseif ( empty( $normalized['gate'] ) ) {
			// Free, non-gated starters (the free Anima starters) are built on the free LT stack.
			$required = array(
				array(
					'slug' => 'nova-blocks',
					'name' => 'Nova Blocks',
				),
				array(
					'slug' => 'style-manager',
					'name' => 'Style Manager',
				),
			);
		}

		/**
		 * Filter the companion plugins a starter requires before import.
		 *
		 * Lets the remote config / a companion plugin adjust the dependency set per starter (e.g. a
		 * premium starter that needs additional companions). Each entry should provide at least a
		 * `slug`; `name` is optional (defaults to a humanized slug).
		 *
		 * @param array[] $required   Raw required-plugin descriptors.
		 * @param array   $normalized Partial normalized starter context: id, gate, source.
		 * @param array   $config     Existing Assistant config.
		 */
		$required = apply_filters( 'pixassist_starter_required_plugins', $required, $normalized, $config );

		return pixassist_normalize_starter_required_plugins( $required );
	}
}

if ( ! function_exists( 'pixassist_normalize_starter_required_plugins' ) ) {
	/**
	 * Normalize and status-stamp a list of required-plugin descriptors.
	 *
	 * @param array $required Raw required-plugin descriptors (each at least a slug).
	 *
	 * @return array[] Each: slug, name, isInstalled, isActive.
	 */
	function pixassist_normalize_starter_required_plugins( $required ) {
		if ( ! is_array( $required ) ) {
			return array();
		}

		$normalized = array();
		$seen       = array();

		foreach ( $required as $key => $entry ) {
			// Allow a bare slug string, or a descriptor array.
			if ( is_string( $entry ) ) {
				$entry = array( 'slug' => $entry );
			}

			if ( ! is_array( $entry ) ) {
				continue;
			}

			$slug = '';
			if ( ! empty( $entry['slug'] ) ) {
				$slug = sanitize_key( $entry['slug'] );
			} elseif ( is_string( $key ) && '' !== $key ) {
				$slug = sanitize_key( $key );
			}

			if ( '' === $slug || isset( $seen[ $slug ] ) ) {
				continue;
			}
			$seen[ $slug ] = true;

			$name = ! empty( $entry['name'] )
				? pixassist_plugins_strip_tags_safe( $entry['name'] )
				: ucwords( str_replace( array( '-', '_' ), ' ', $slug ) );

			$status = pixassist_get_starter_plugin_status( $slug );

			$normalized[] = array(
				'slug'        => $slug,
				'name'        => $name,
				'isInstalled' => $status['isInstalled'],
				'isActive'    => $status['isActive'],
			);
		}

		return $normalized;
	}
}

if ( ! function_exists( 'pixassist_plugins_strip_tags_safe' ) ) {
	/**
	 * Strip markup from a plain-text value, tolerant of a missing WordPress.
	 *
	 * @param string $value Raw string.
	 *
	 * @return string
	 */
	function pixassist_plugins_strip_tags_safe( $value ) {
		if ( function_exists( 'wp_strip_all_tags' ) ) {
			return wp_strip_all_tags( (string) $value );
		}

		return trim( strip_tags( (string) $value ) );
	}
}

if ( ! function_exists( 'pixassist_get_starter_plugin_status' ) ) {
	/**
	 * Resolve whether a plugin (identified by its wp.org slug / folder) is installed and active.
	 *
	 * Slug-based on purpose: the descriptor only knows the wp.org slug (folder), not the exact main
	 * file. We match the slug against the folder of every installed/active plugin entry, so a slug
	 * like `nova-blocks` resolves `nova-blocks/nova-blocks.php` without hardcoding the file name.
	 *
	 * @param string $slug Plugin slug / folder (e.g. `nova-blocks`).
	 *
	 * @return array { isInstalled: bool, isActive: bool }
	 */
	function pixassist_get_starter_plugin_status( $slug ) {
		$slug = function_exists( 'sanitize_key' ) ? sanitize_key( $slug ) : strtolower( (string) $slug );

		$result = array(
			'isInstalled' => false,
			'isActive'    => false,
		);

		if ( '' === $slug || ! function_exists( 'get_plugins' ) ) {
			// Without the plugins API (e.g. standalone tests) we cannot inspect status; treat as unmet.
			return $result;
		}

		if ( ! function_exists( 'is_plugin_active' ) && defined( 'ABSPATH' ) && @file_exists( ABSPATH . 'wp-admin/includes/plugin.php' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$all_plugins = get_plugins();
		foreach ( array_keys( $all_plugins ) as $plugin_file ) {
			// $plugin_file looks like `nova-blocks/nova-blocks.php`; match on its folder.
			$folder = strtok( $plugin_file, '/' );
			if ( $folder !== $slug ) {
				continue;
			}

			$result['isInstalled'] = true;

			if ( function_exists( 'is_plugin_active' ) && is_plugin_active( $plugin_file ) ) {
				$result['isActive'] = true;
			}
		}

		return $result;
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_copy' ) ) {
	/**
	 * Extract Starter Sites tab copy from legacy starterContent l10n, with safe defaults.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return array
	 */
	function pixassist_get_starter_sites_copy( $config ) {
		$l10n = isset( $config['starterContent']['l10n'] ) && is_array( $config['starterContent']['l10n'] )
			? $config['starterContent']['l10n']
			: array();

		return array(
			'title'       => esc_html__( 'Starter Sites', '__plugin_txtd' ),
			'description' => pixassist_starter_sites_replace_tokens( isset( $l10n['importContentDescription'] ) ? (string) $l10n['importContentDescription'] : esc_html__( 'Import the content from a Pixelgrade starter site.', '__plugin_txtd' ) ),
			'importTitle' => pixassist_starter_sites_replace_tokens( isset( $l10n['importTitle'] ) ? (string) $l10n['importTitle'] : esc_html__( '{{theme_name}} demo content', '__plugin_txtd' ) ),
			'empty'       => isset( $l10n['noSources'] ) ? (string) $l10n['noSources'] : esc_html__( 'No starter sites are currently configured.', '__plugin_txtd' ),
			'confirm'     => isset( $l10n['alreadyImportedConfirm'] ) ? (string) $l10n['alreadyImportedConfirm'] : esc_html__( 'Starter content was already imported. Import it again?', '__plugin_txtd' ),
			'importing'   => isset( $l10n['importingData'] ) ? (string) $l10n['importingData'] : esc_html__( 'Getting data about available content...', '__plugin_txtd' ),
			'error'       => isset( $l10n['errorMessage'] ) ? (string) $l10n['errorMessage'] : esc_html__( 'This starter content is not available right now. Please try again later.', '__plugin_txtd' ),
			'failed'      => isset( $l10n['somethingWrong'] ) ? (string) $l10n['somethingWrong'] : esc_html__( 'Something went wrong.', '__plugin_txtd' ),
			'success'     => isset( $l10n['importSuccessful'] ) ? (string) $l10n['importSuccessful'] : esc_html__( 'Successfully imported.', '__plugin_txtd' ),
			'labels'      => array(
				'free'    => esc_html__( 'Free', '__plugin_txtd' ),
				'premium' => esc_html__( 'Premium', '__plugin_txtd' ),
				'locked'  => esc_html__( 'Requires Pixelgrade Plus', '__plugin_txtd' ),
			),
			'actions'     => array(
				'import'         => isset( $l10n['import'] ) ? (string) $l10n['import'] : esc_html__( 'Import', '__plugin_txtd' ),
				'imported'       => isset( $l10n['imported'] ) ? (string) $l10n['imported'] : esc_html__( 'Imported', '__plugin_txtd' ),
				'preview'        => esc_html__( 'Preview', '__plugin_txtd' ),
				'setupPlus'      => esc_html__( 'Set up Pixelgrade Plus', '__plugin_txtd' ),
				'managePlus'     => esc_html__( 'Manage Pixelgrade Plus', '__plugin_txtd' ),
				'working'        => esc_html__( 'Importing...', '__plugin_txtd' ),
				'managePlugins'  => esc_html__( 'Install required plugins', '__plugin_txtd' ),
			),
			// Dependency-gate copy: shown when a starter needs companion plugins that are not active yet.
			'requirements' => array(
				/* translators: %s: comma-separated list of plugin names. */
				'heading'   => esc_html__( 'This starter needs a couple of plugins first', '__plugin_txtd' ),
				/* translators: %s: comma-separated list of plugin names. */
				'message'   => esc_html__( 'To import this starter exactly as designed, install and activate %s. Without them the imported pages would render broken (missing blocks, colors and fonts).', '__plugin_txtd' ),
				'separator' => esc_html_x( ', ', 'separator between required plugin names', '__plugin_txtd' ),
				'and'       => esc_html_x( ' and ', 'last separator between required plugin names', '__plugin_txtd' ),
			),
			// Deep link to the Plugins tab so the user can install + activate the missing companions.
			'pluginsTabUrl' => pixassist_get_starter_sites_plugins_tab_url(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_plugins_tab_url' ) ) {
	/**
	 * Build the Appearance -> Pixelgrade hub URL deep-linked to the Plugins tab.
	 *
	 * @return string
	 */
	function pixassist_get_starter_sites_plugins_tab_url() {
		if ( function_exists( 'admin_url' ) ) {
			return admin_url( 'themes.php?page=pixelgrade&tab=plugins' );
		}

		return 'themes.php?page=pixelgrade&tab=plugins';
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_endpoints' ) ) {
	/**
	 * Expose the existing starter-content import endpoints.
	 *
	 * @return array
	 */
	function pixassist_get_starter_sites_endpoints() {
		$endpoints = array(
				'import'      => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? pixassist_starter_sites_esc_url_raw( rest_url( 'pixassist/v1/import' ) ) : '',
				),
				'importStarter' => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? pixassist_starter_sites_esc_url_raw( rest_url( 'pixassist/v1/import_starter' ) ) : '',
				),
				'uploadMedia' => array(
					'method' => 'POST',
					'url'    => function_exists( 'rest_url' ) ? pixassist_starter_sites_esc_url_raw( rest_url( 'pixassist/v1/upload_media' ) ) : '',
				),
		);

		if ( class_exists( 'PixelgradeAssistant_Admin' )
			&& isset( PixelgradeAssistant_Admin::$internalApiEndpoints )
			&& is_array( PixelgradeAssistant_Admin::$internalApiEndpoints ) ) {
				foreach ( array( 'import', 'importStarter', 'uploadMedia' ) as $key ) {
					if ( ! empty( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) && is_array( PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ] ) ) {
						$endpoints[ $key ] = PixelgradeAssistant_Admin::$internalApiEndpoints[ $key ];
					}
			}
		}

		return $endpoints;
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_imported_state' ) ) {
	/**
	 * Read existing starter-content import state.
	 *
	 * @return array
	 */
	function pixassist_get_starter_sites_imported_state() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_option' ) ) {
			$imported = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );

			return is_array( $imported ) ? $imported : array();
		}

		return array();
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_default_rest_path' ) ) {
	/**
	 * Read the default SCE REST path.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return string
	 */
	function pixassist_get_starter_sites_default_rest_path( $config ) {
		$path = isset( $config['starterContent']['defaultSceRestPath'] )
			? (string) $config['starterContent']['defaultSceRestPath']
			: 'wp-json/sce/v2';

		return ltrim( $path, '/' );
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_default_title' ) ) {
	/**
	 * Build the legacy fallback starter title.
	 *
	 * @return string
	 */
	function pixassist_get_starter_sites_default_title() {
		return pixassist_get_starter_sites_theme_title() . ' Demo Content';
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_default_description' ) ) {
	/**
	 * Build the legacy fallback starter description.
	 *
	 * @param array $config Existing Assistant config.
	 *
	 * @return string
	 */
	function pixassist_get_starter_sites_default_description( $config ) {
		if ( ! empty( $config['starterContent']['l10n']['importContentDescription'] ) ) {
			return pixassist_starter_sites_replace_tokens( (string) $config['starterContent']['l10n']['importContentDescription'] );
		}

		return esc_html__( 'Import the content from the theme demo.', '__plugin_txtd' );
	}
}

if ( ! function_exists( 'pixassist_starter_sites_replace_tokens' ) ) {
	/**
	 * Replace legacy starter-content copy tokens.
	 *
	 * @param string $text Raw copy.
	 *
	 * @return string
	 */
	function pixassist_starter_sites_replace_tokens( $text ) {
		return str_replace(
			array( '{{theme_name}}', '{{shopdomain}}' ),
			array(
				pixassist_get_starter_sites_theme_title(),
				defined( 'PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN' ) ? PIXELGRADE_ASSISTANT__SHOP_BASE_DOMAIN : 'pixelgrade.com',
			),
			(string) $text
		);
	}
}

if ( ! function_exists( 'pixassist_get_starter_sites_theme_title' ) ) {
	/**
	 * Read the active Pixelgrade theme's human title.
	 *
	 * @return string
	 */
	function pixassist_get_starter_sites_theme_title() {
		if ( class_exists( 'PixelgradeAssistant_Admin' ) && method_exists( 'PixelgradeAssistant_Admin', 'get_theme_support' ) ) {
			$support = PixelgradeAssistant_Admin::get_theme_support();
			if ( ! empty( $support['theme_title'] ) ) {
				return (string) $support['theme_title'];
			}
			if ( ! empty( $support['theme_name'] ) ) {
				return (string) $support['theme_name'];
			}
		}

		return 'Pixelgrade';
	}
}

if ( ! function_exists( 'pixassist_starter_sites_esc_url_raw' ) ) {
	/**
	 * Guarded esc_url_raw() wrapper for standalone tests.
	 *
	 * @param string $url Raw URL.
	 *
	 * @return string
	 */
	function pixassist_starter_sites_esc_url_raw( $url ) {
		return function_exists( 'esc_url_raw' ) ? esc_url_raw( (string) $url ) : (string) $url;
	}
}

if ( ! function_exists( 'pixassist_starter_sites_trailingslash' ) ) {
	/**
	 * Guarded trailingslashit() wrapper for standalone tests.
	 *
	 * @param string $value Raw path or URL.
	 *
	 * @return string
	 */
	function pixassist_starter_sites_trailingslash( $value ) {
		return function_exists( 'trailingslashit' ) ? trailingslashit( (string) $value ) : rtrim( (string) $value, '/' ) . '/';
	}
}

// Register the free Starter Sites tab on the hub registry.
if ( function_exists( 'add_filter' ) ) {
	add_filter( 'pixelgrade/admin_hub/tabs', 'pixassist_register_starter_sites_tab' );
}
