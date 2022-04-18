<?php
/**
 * This is the class that handles the overall logic for conditional updates for other plugins in our ecosystem.
 *
 * It knows how to handle:
 * - the "Pixelgrade Plugin Supports" theme headers that specify semver ranges for acceptable plugin updates.
 *
 * @see         https://pixelgrade.com
 * @author      Pixelgrade
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if ( ! class_exists( 'PixelgradeAssistant_Conditional_Updates' ) ) :

	class PixelgradeAssistant_Conditional_Updates {

		/**
		 * The name of the plugin supports header.
		 *
		 * @since   1.12.0
		 */
		const PLUGIN_SUPPORTS_HEADER = 'Pixelgrade Plugin Supports';

		/**
		 * The regex to parse version strings into their constituent parts.
		 *
		 * @since   1.12.0
		 */
		const NORMALIZED_VERSION_REGEX = '#^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)\.(?P<build>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$#';

		/**
		 * Holds the only instance of this class.
		 * @since   1.12.0
		 * @var     null|PixelgradeAssistant_Conditional_Updates
		 * @access  protected
		 */
		protected static $_instance = null;

		/**
		 * The main plugin object (the parent).
		 * @since   1.12.0
		 * @var     PixelgradeAssistant
		 * @access  public
		 */
		public $parent = null;

		/**
		 * Plugins list to target.
		 *
		 * @access  protected
		 * @since   1.12.0
		 * @var     array|null
		 */
		protected $target_plugins = null;

		/**
		 * Constructor.
		 *
		 * @since 1.12.0
		 *
		 * @param PixelgradeAssistant $parent
		 * @param array          $args
		 */
		protected function __construct( $parent, $args = [] ) {
			$this->parent = $parent;

			$this->init( $args );
		}

		/**
		 * Initialize the conditional updates manager.
		 *
		 * @since  1.12.0
		 *
		 * @param array $args
		 */
		public function init( $args ) {
			if ( isset( $args['target_plugins'] ) && is_array( $args['target_plugins'] ) ) {
				$this->target_plugins = $args['target_plugins'];
			} else {
				// Set the default target plugins.
				$this->target_plugins = [
					[
						'name' => 'Nova Blocks',
						'slug' => 'nova-blocks',
						'txtd' => 'nova-blocks',
					],
					[
						'name' => 'Style Manager',
						'slug' => 'style-manager',
						'txtd' => 'style-manager',
					],
				];
			}

			// Add hooks, but only if we are not uninstalling the plugin.
			if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
				$this->add_hooks();
			}
		}

		/**
		 * Initiate our hooks.
		 *
		 * @since 1.12.0
		 * @return void
		 */
		public function add_hooks() {
			add_action( 'init', [ $this, 'setup' ], 20 );
			add_action( 'current_screen', [ $this, 'notices' ], 10 );

			add_filter( 'extra_plugin_headers', [ $this, 'extra_headers' ], 10, 1 );
			add_filter( 'extra_theme_headers', [ $this, 'extra_headers' ], 10, 1 );

			add_action( 'pre_set_site_transient_update_plugins', [ $this, 'handle_transient_update_plugins' ], 21, 1 );
		}

		/**
		 * Set up allowing others to intervene.
		 *
		 * @since 1.12.0
		 * @return void
		 */
		public function setup() {
			$this->target_plugins = apply_filters( 'pixelgrade_care/conditional_updates/target_plugins', $this->target_plugins );
		}

		/**
		 * Set up admin notices.
		 *
		 * @since 1.12.0
		 * @return void
		 */
		public function notices() {
			$screen = get_current_screen();
			// We will display notices only on certain screens and for certain users.
			if ( ! empty( $screen )
			     && in_array( $screen->base, array( 'themes', 'update-core', 'update', 'plugins', 'dashboard' ) )
			     && current_user_can( 'update_plugins' )
			) {

				// If certain currently active target plugins don't satisfy the version constraints
				// we will show a notice instructing the user the download and install the proper versions.
				if ( ! empty( $failed_plugins = $this->check_current_active_plugins() ) ) {

					add_action( 'admin_notices', function () use ( $failed_plugins ) {
						$failed_list = '<ul class="ul-disc">';
						foreach ( $failed_plugins as $message ) {
							$failed_list .= '<li>' . $message . '</li>';
						}
						$failed_list .= '</ul>';
						printf(
							'<div class="%1$s"><p><strong>%2$s</strong></p>%3$s<p>%4$s</p></div>',
							esc_attr( 'notice notice-error' ),
							esc_html__( 'Your Pixelgrade theme requires different plugin versions than the ones active:', '__plugin_txtd' ),
							$failed_list,
							wp_kses_post( __( 'Please <strong>replace the current active plugin versions</strong> with the ones recommended for a smooth experience.<br><strong>The steps are as follows:</strong> download, go to <code>Plugins → Add New</code>, use the <code>Upload Plugin</code> button to select the downloaded zip file, and choose <code>Replace current with uploaded</code> when asked.', '__plugin_txtd' ) )
						);
					} );
				}
			}
		}

		/**
		 * Add extra headers for plugins and themes so WordPress includes them in the data.
		 *
		 * @since 1.12.0
		 * @see   get_file_data()
		 *
		 * @param $extra_headers
		 *
		 * @return array|mixed
		 */
		public function extra_headers( $extra_headers ) {
			if ( empty( $extra_headers ) ) {
				$extra_headers = [];
			}

			$extra_headers[ self::PLUGIN_SUPPORTS_HEADER ] = self::PLUGIN_SUPPORTS_HEADER;

			return $extra_headers;
		}

		/**
		 * Checks if the current active theme has the "Pixelgrade Plugin Supports" header
		 * and ensures that plugin updates that don't respect those ranges are not available.
		 *
		 * The default for a missing "Pixelgrade Plugin Supports" theme header entry is the current major version of the plugin
		 * (e.g. ^1 if the plugin is at 1.12.3).
		 * @since 1.12.0
		 *
		 * @param $transient
		 *
		 * @return mixed
		 */
		public function handle_transient_update_plugins( $transient ) {
			// Get the target plugins' allowed version ranges, keyed by the plugin main file.
			$version_ranges = $this->get_target_plugins_version_ranges();

			// Go through each plugin in the `response` entry of the transient
			// and either adjust the version to a lower one or block the update.
			if ( empty( $transient->response ) || ! is_array( $transient->response ) ) {
				return $transient;
			}

			// Need this to access the plugins_api() function.
			include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

			foreach ( $transient->response as $filename => $plugin_details ) {
				if ( empty( $version_ranges[ $filename ] )
				     || empty( $plugin_details->slug )
				     || empty( $plugin_details->new_version )
				     || empty( $plugin_details->package ) ) {
					continue;
				}

				// If the new version respects the version range, we have nothing to do.
				if ( \Composer\Semver\Semver::satisfies( $plugin_details->new_version, $version_ranges[ $filename ] ) ) {
					continue;
				}

				// The version range/constraints are not satisfied.
				// Instead of banning the update outright, lets see if we can find a lower version that would satisfy them.
				// This only works right now for WordPress.org hosted plugins.
				$wporg_versions = $this->get_wporg_plugin_versions( $plugin_details->slug );

				$current_plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/' . $filename );
				if ( empty( $current_plugin_data['Version'] ) ) {
					continue;
				}

				// Go through all the versions and find to most recent one that satisfies the version range/constraints.
				$found_version = '0.0.1';
				foreach ( $wporg_versions as $version => $package_url ) {
					if ( \Composer\Semver\Comparator::greaterThan( $version, $current_plugin_data['Version'] )
					     && \Composer\Semver\Comparator::greaterThan( $version, $found_version )
					     && \Composer\Semver\Semver::satisfies( $version, $version_ranges[ $filename ] )
					) {
						$found_version = $version;
					}
				}

				if ( ! empty( $wporg_versions[ $found_version ] ) ) {
					// Change the transient details.
					$transient->response[ $filename ]->new_version = $found_version;
					$transient->response[ $filename ]->package     = $wporg_versions[ $found_version ];
				} else {
					// Block the update.
					if ( empty( $transient->no_update ) ) {
						$transient->no_update = [];
					}

					$transient->no_update[ $filename ] = clone( $transient->response[ $filename ] );
					unset( $transient->response[ $filename ] );
				}
			}

			return $transient;
		}

		/**
		 * Checks if the current active theme has the "Pixelgrade Plugin Supports" header
		 * and checks if the current active plugins satisfy those version constraints.
		 *
		 * The default for a missing "Pixelgrade Plugin Supports" theme header entry is the current major version of the plugin
		 * (e.g. ^1 if the plugin is at 1.12.3).
		 * @since 1.12.0
		 *
		 * @return array List of target plugins that fail to satisfy their version constraints. Empty array if all pass.
		 */
		public function check_current_active_plugins() {
			// Need this to access the get_plugins() function.
			include_once ABSPATH . 'wp-admin/includes/plugin.php';
			// Need this to access the plugins_api() function.
			include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

			// Get the target plugins' allowed version ranges, keyed by the plugin main file.
			$version_ranges = $this->get_target_plugins_version_ranges();

			$installed_plugins = get_plugins();

			$failed = [];
			foreach ( $installed_plugins as $filename => $plugin_details ) {
				if ( empty( $version_ranges[ $filename ] )
				     || is_plugin_inactive( $filename )
				) {
					continue;
				}

				// If the current version respects the version range, we have nothing to do.
				if ( \Composer\Semver\Semver::satisfies( $plugin_details['Version'], $version_ranges[ $filename ] ) ) {
					continue;
				}

				// The version range/constraints are not satisfied.
				// Find the latest version that would satisfy them.
				// This only works right now for WordPress.org hosted plugins.
				$target_plugin_details = $this->get_target_plugin_details( $plugin_details['Name'], $plugin_details['TextDomain'] );
				if ( empty( $target_plugin_details['slug'] ) ) {
					continue;
				}
				$wporg_versions = $this->get_wporg_plugin_versions( $target_plugin_details['slug'] );

				$current_plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/' . $filename );
				if ( empty( $current_plugin_data['Version'] ) ) {
					continue;
				}

				// Go through all the versions and find to most recent one that does satisfy the version range/constraints.
				$found_version = '0.0.1';
				foreach ( $wporg_versions as $version => $package_url ) {
					if ( \Composer\Semver\Comparator::greaterThan( $version, $found_version )
					     && \Composer\Semver\Semver::satisfies( $version, $version_ranges[ $filename ] )
					) {
						$found_version = $version;
					}
				}

				if ( ! empty( $wporg_versions[ $found_version ] ) ) {
					// Add the failed check details to be used in informing the user.
					$failed[ $filename ] = sprintf(
						__( '<a href="%1$s" target="_blank">%2$s</a> - <strong>recommended version is %3$s;</strong> download it <a href="%4$s" target="_blank">here</a>;', '__plugin_txtd' ),
						esc_url( $current_plugin_data['PluginURI'] ),
						esc_html( $current_plugin_data['Name'] ),
						esc_html( $found_version ),
						esc_url( $wporg_versions[ $found_version ] )
					);
				}
			}

			return $failed;
		}

		/**
		 * Fetch all the WP.org available versions for a certain plugin.
		 *
		 * @param string $wporg_slug The plugin's WP.org slug.
		 *
		 * @return array List of version=>package URL.
		 */
		protected function get_wporg_plugin_versions( $wporg_slug ) {
			$versions = [];
			if ( empty( $wporg_slug ) ) {
				return $versions;
			}

			$args = [
				'slug' => $wporg_slug,
			];

			$response = plugins_api( 'plugin_information', $args );
			if ( is_wp_error( $response )
			     || ! is_object( $response )
			     || empty( $response->versions )
			     || ! is_array( $response->versions )
			) {
				return $versions;
			}

			return $response->versions;
		}

		/**
		 * Search through the target plugins list to find a match.
		 *
		 * @param false|string $name
		 * @param false|string $txtd
		 *
		 * @return array|false The target plugin search details. False if none was found.
		 */
		protected function get_target_plugin_details( $name, $txtd = false ) {
			if ( empty( $this->target_plugins ) || ! is_array( $this->target_plugins ) ) {
				return false;
			}

			foreach ( $this->target_plugins as $target_plugin ) {
				// If either the name or the text domain match, we are OK.
				if ( ! empty( $name ) && $name === $target_plugin['name'] ) {
					return $target_plugin;
				}
				if ( ! empty( $txtd ) && $txtd === $target_plugin['txtd'] ) {
					return $target_plugin;
				}
			}

			return false;
		}

		/**
		 * Get the target plugins' allowed version ranges, keyed by the plugin main file.
		 *
		 * Only installed target plugins are included.
		 * @since 1.12.0
		 * @return array
		 */
		protected function get_target_plugins_version_ranges() {
			$plugins_ranges = [];

			if ( empty( $this->target_plugins ) || ! is_array( $this->target_plugins ) ) {
				return $plugins_ranges;
			}

			$installed_plugins     = get_plugins();
			$theme_plugin_supports = $this->get_current_theme_plugin_supports();
			$version_parser        = new \Composer\Semver\VersionParser();

			foreach ( $this->target_plugins as $target_plugin ) {
				if ( ! $this->is_plugin_installed( $target_plugin ) ) {
					continue;
				}

				$plugin_filenames = $this->get_plugin_filename( $target_plugin );
				if ( empty( $plugin_filenames ) ) {
					continue;
				}

				foreach ( $plugin_filenames as $plugin_filename ) {
					if ( ! empty( $theme_plugin_supports[ $plugin_filename ] ) ) {
						$plugins_ranges[ $plugin_filename ] = $theme_plugin_supports[ $plugin_filename ];
						continue;
					}

					// If the theme doesn't specify a semver range for the target plugin,
					// fallback to a range related to the current major plugin version.
					$target_plugin_current_version = $installed_plugins[ $plugin_filename ]['Version'];
					try {
						$target_plugin_current_version = $version_parser->normalize( $target_plugin_current_version );
					} catch ( \Exception $e ) {
						// Bail.
						continue;
					}

					preg_match( self::NORMALIZED_VERSION_REGEX, $target_plugin_current_version, $matches );
					if ( ! isset( $matches['major'] ) || ! isset( $matches['minor'] ) ) {
						continue;
					}
					$plugins_ranges[ $plugin_filename ] = '~' . $matches['major'];
					if ( '0' === $matches['major'] ) {
						$plugins_ranges[ $plugin_filename ] = '<1';
					}
				}
			}

			return $plugins_ranges;
		}

		/**
		 * Get the current theme's plugin supports list.
		 *
		 * @since 1.12.0
		 * @return array The list of theme plugin supports in the form of plugin_filename => semver_constraints.
		 */
		protected function get_current_theme_plugin_supports() {
			$plugin_supports = [];

			$current_theme = wp_get_theme();
			if ( empty( $current_theme->get( self::PLUGIN_SUPPORTS_HEADER ) ) ) {
				// Since others might have accessed the theme data before we could add our custom headers, we need to clear the cache first.
				$current_theme->cache_delete();
				// Now, get the theme again.
				$current_theme = wp_get_theme();
			}

			$plugin_supports_raw_header = $current_theme->get( self::PLUGIN_SUPPORTS_HEADER );
			if ( ! empty( $plugin_supports_raw_header ) ) {
				$header_raw_supports = $this->parse_supports_header( $plugin_supports_raw_header );
				if ( ! empty( $header_raw_supports ) ) {
					// We need to replace the identifier with the main plugin filename relative to the plugins directory.
					foreach ( $header_raw_supports as $header_raw_support_id => $header_raw_support_range ) {
						// First try it as a plugin name.
						// Second, try it as a slug.
						// Third, try it as a text domain.
						if ( ! empty( $plugin_filename = $this->get_plugin_by_name( $header_raw_support_id ) )
						     || ! empty( $plugin_filename = $this->get_plugin_by_slug( $header_raw_support_id ) )
						     || ! empty( $plugin_filename = $this->get_plugin_by_txtd( $header_raw_support_id ) )
						) {
							if ( is_string( $plugin_filename ) ) {
								$plugin_filename = [ $plugin_filename ];
							}

							foreach ( $plugin_filename as $filename ) {
								$plugin_supports[ $filename ] = $header_raw_support_range;
							}
						}
					}
				}
			}

			return apply_filters( 'pixelgrade_care/conditional_updates/get_theme_plugin_supports', $plugin_supports, $current_theme );
		}

		/**
		 * Given a supports header parse it into the list of name=>semver ranges list.
		 *
		 * We expect the supports header to be a comma separated list of Name (Semver-range).
		 *
		 * Example: `Pixelgrade Plugin Supports: Nova Blocks (>2.0 <3.0), Style Manager (^2.0)`
		 *
		 * @param string $supports_raw_header
		 *
		 * @return array List of semver ranges keyed by their identifier (e.g. plugin name).
		 */
		private function parse_supports_header( $supports_raw_header ) {
			$supports = [];

			// Split it by comma.
			$raw_supports_list = preg_split( '/,+/', $supports_raw_header, - 1, PREG_SPLIT_NO_EMPTY );
			// Remove any whitespace at the beginning or end of each.
			$raw_supports_list = array_map( 'trim', $raw_supports_list );
			// Remove any empty entries.
			$raw_supports_list = array_filter( $raw_supports_list, function ( $raw_supports ) {
				return ! empty( $raw_supports );
			} );

			foreach ( $raw_supports_list as $raw_supports ) {
				// Extract anything in parentheses. The rest is the identifier (e.g. plugin name).
				if ( false === strpos( $raw_supports, '(' ) ) {
					continue;
				}

				preg_match( '#([^\(]+)\(([^\)]+)\)#', $raw_supports, $matches );

				if ( empty( $matches[1] ) || empty( $matches[2] ) ) {
					continue;
				}

				list( , $identifier, $semver_range ) = $matches;
				$identifier   = trim( $identifier );
				$semver_range = trim( $semver_range );

				$supports[ $identifier ] = $semver_range;
			}

			return apply_filters( 'pixelgrade_care/conditional_updates/parse_supports_header', $supports, $supports_raw_header );
		}

		/**
		 * Given a list of plugin details to identify by,
		 * get the filename(s) of the installed plugin(s) that matches at least one of them.
		 *
		 * @since 1.12.0
		 *
		 * @param array $plugin_details A list of plugin details to search for.
		 * @param bool  $single         Optional. Whether to return the first found filename or all of them.
		 *                              If set to false, we will always return an array.
		 *                              Defaults to false.
		 *
		 * @return false|string|string[] The found plugin's main filename (relative to the plugins directory). False if not found.
		 */
		protected function get_plugin_filename( $plugin_details, $single = false ) {
			if ( empty( $plugin_details ) || ! is_array( $plugin_details ) ) {
				return $single ? false : [];
			}

			$plugins = get_plugins();

			/**
			 * We want to be greedy and catch all installed plugins that match at least one detail..
			 */
			$filenames = [];
			if ( ! empty( $plugin_details['filename'] ) && ! empty( $plugins[ $plugin_details['filename'] ] ) ) {
				$filenames[] = $plugin_details['filename'];
			}
			if ( ! empty( $plugin_details['txtd'] )
			     && ! empty( $found_filenames = $this->get_plugin_by_txtd( $plugin_details['txtd'], $plugins ) ) ) {
				$filenames += $found_filenames;
			}
			if ( ! empty( $plugin_details['name'] )
			     && ! empty( $found_filenames = $this->get_plugin_by_name( $plugin_details['name'], $plugins ) ) ) {
				$filenames += $found_filenames;
			}
			if ( ! empty( $plugin_details['slug'] )
			     && ! empty( $found_filenames = $this->get_plugin_by_slug( $plugin_details['slug'], $plugins ) ) ) {
				$filenames[] = $found_filenames;
			}

			$filenames = array_unique( $filenames );

			if ( $single ) {
				$filenames = reset( $filenames );
			}

			return apply_filters( 'pixelgrade_care/conditional_updates/get_plugin_file', $filenames, $plugin_details, $single );
		}

		/**
		 * Given a list of plugin details to identify by,
		 * get the data of the installed plugin that matches at least one of them.
		 *
		 * @since 1.12.0
		 *
		 * @param array $plugin_details A list of plugin details to search for.
		 *
		 * @return array List of found plugins' header data keyed by their filename relative to the plugins directory.
		 */
		protected function get_plugin_data( $plugin_details ) {
			$plugins_data    = [];
			$found_filenames = $this->get_plugin_filename( $plugin_details );
			if ( ! empty( $found_filenames ) ) {
				$plugins = get_plugins();
				foreach ( $found_filenames as $found_filename ) {
					if ( ! empty( $plugins[ $found_filename ] ) ) {
						$plugins_data[ $found_filename ] = $plugins[ $found_filename ];
					}
				}
			}

			return apply_filters( 'pixelgrade_care/conditional_updates/get_plugin_data', $plugins_data, $plugin_details );
		}

		/**
		 * Given a list of plugin details to identify by,
		 * check if there is at least one plugin installed that matches at least one of them.
		 *
		 * @since 1.12.0
		 *
		 * @param array $plugin_details A list of plugin details to search for.
		 *
		 * @return bool
		 */
		protected function is_plugin_installed( $plugin_details ) {
			$installed = false;
			if ( $this->get_plugin_filename( $plugin_details ) ) {
				$installed = true;
			}

			return apply_filters( 'pixelgrade_care/conditional_updates/is_plugin_installed', $installed, $plugin_details );
		}

		/**
		 * Search for an installed plugin by its slug (directory name)
		 * and return its main filename relative to the plugins directory.
		 *
		 * @since 1.12.0
		 *
		 * @param string $slug    Plugin directory name to search for.
		 * @param array  $plugins Optional. Defaults to get_plugins().
		 *
		 * @return false|string The found plugin's main filename relative to the plugins directory. False if not found.
		 */
		private function get_plugin_by_slug( $slug, $plugins = [] ) {
			if ( empty( $plugins ) ) {
				$plugins = get_plugins();
			}

			foreach ( $plugins as $filename => $details ) {
				if ( $slug === dirname( $filename ) ) {
					return $filename;
				}
			}

			return false;
		}

		/**
		 * Search for installed plugins by their text domain
		 * and return their main filename relative to the plugins directory.
		 *
		 * @since 1.12.0
		 *
		 * @param string $txtd      Text domain of the plugin to search for.
		 * @param array  $plugins   Optional. Defaults to get_plugins().
		 * @param bool   $single    Optional. Whether to return the first found filename or all of them.
		 *                          If set to false, we will always return an array.
		 *                          Defaults to false.
		 *
		 * @return false|string|string[] The found plugin's main filename(s) relative to the plugins directory. False if not found.
		 */
		private function get_plugin_by_txtd( $txtd, $plugins = [], $single = false ) {
			if ( empty( $plugins ) ) {
				$plugins = get_plugins();
			}

			$txtd = trim( $txtd );

			// We may find multiple plugins.
			$found = [];
			foreach ( $plugins as $filename => $details ) {
				if ( ! empty( $details['TextDomain'] ) && $txtd === $details['TextDomain'] ) {
					$found[] = $filename;
				}
			}

			if ( ! empty( $found ) ) {
				if ( $single ) {
					return reset( $found );
				}

				return $found;
			}

			if ( $single ) {
				return false;
			}

			return [];
		}

		/**
		 * Search for installed plugins by their name (Plugin Name header)
		 * and return their main filename relative to the plugins directory.
		 *
		 * @since 1.12.0
		 *
		 * @param string $name      Name of the plugin to search for.
		 * @param array  $plugins   Optional. Defaults to get_plugins().
		 * @param bool   $single    Optional. Whether to return the first found filename or all of them.
		 *                          If set to false, we will always return an array.
		 *                          Defaults to false.
		 *
		 * @return false|string|string[] The found plugin's main filename(s) relative to the plugins directory. False if not found.
		 */
		private function get_plugin_by_name( $name, $plugins = [], $single = false ) {
			if ( empty( $plugins ) ) {
				$plugins = get_plugins();
			}

			$name = trim( $name );

			// We may find multiple plugins.
			$found = [];
			foreach ( $plugins as $filename => $details ) {
				if ( ! empty( $details['Name'] ) && $name === $details['Name'] ) {
					$found[] = $filename;
				}
			}

			if ( ! empty( $found ) ) {
				if ( $single ) {
					return reset( $found );
				}

				return $found;
			}

			if ( $single ) {
				return false;
			}

			return [];
		}

		/**
		 * Main PixelgradeAssistant_Conditional_Updates Instance
		 *
		 * Ensures only one instance of PixelgradeAssistant_Conditional_Updates is loaded or can be loaded.
		 *
		 * @since  1.12.0
		 * @static
		 *
		 * @param PixelgradeAssistant $parent The main plugin object (the parent).
		 * @param array          $args   The arguments to initialize the block patterns manager.
		 *
		 * @return PixelgradeAssistant_Conditional_Updates Main PixelgradeAssistant_Conditional_Updates instance
		 */
		public static function instance( $parent, $args = [] ) {

			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self( $parent, $args );
			}

			return self::$_instance;
		}

		/**
		 * Cloning is forbidden.
		 *
		 * @since 1.12.0
		 */
		public function __clone() {

			_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), null );
		}

		/**
		 * Unserializing instances of this class is forbidden.
		 *
		 * @since 1.12.0
		 */
		public function __wakeup() {

			_doing_it_wrong( __FUNCTION__, esc_html__( 'You should not do that!', '__plugin_txtd' ), null );
		}

	}
endif;
