<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * A class to handle data collection both in terms of stopping it and deciding what we are allowed to collect or not.
 *
 * @link       https://pixelgrade.com
 * @since      1.0.0
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */
class PixelgradeAssistant_DataCollector {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 * @since     1.3.0
	 */
	public $parent = null;

	private $config = null;

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_Admin
	 * @access  protected
	 * @since   1.3.0
	 */
	protected static $_instance = null;

	public function __construct( $parent ) {
		$this->parent = $parent;

		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Initialize this module.
	 */
	public function init() {
		// Only initialize if we are allowed to collect usage data.
		if ( ! self::allow_data_collector() ) {
			return;
		}

		$this->config = PixelgradeAssistant_Admin::get_theme_support();

		$this->register_hooks();
	}

	/**
	 * Determine if we are allowed to data collect.
	 *
	 * @return bool
	 */
	public static function allow_data_collector() {
		$allow_data_collector = PixelgradeAssistant_Admin::get_option( 'allow_data_collect', false );
		// Allow others to disable this module.
		if ( false === apply_filters( 'pixcare_allow_data_collector_module', $allow_data_collector ) ) {
			return false;
		}

		return  true;
	}

	/**
	 * Register the hooks related to this module.
	 */
	public function register_hooks() {
		// Add filter to update wordpress minimum versions.
		add_filter( 'pre_set_site_transient_update_themes', array( $this, 'set_core_supported_versions' ) );
		// Filter the data that is being sent to WUpdates so we can store it in DataVault.
		add_filter( 'wupdates_call_data_request', array( $this, 'filter_wupdates_request_data' ), 11, 2 );

		// Remember the previous theme on theme switch.
		add_action( 'after_switch_theme', array( $this, 'remember_previous_theme' ), 10, 2 );
	}

	/**
	 * Gather the System Status Data for our Dashboard.
	 *
	 * @return array
	 */
	public static function get_system_status_data() {
		// The setting might need to be saved at least once
		if ( null === PixelgradeAssistant_Admin::get_option( 'allow_data_collect' ) ) {
			PixelgradeAssistant_Admin::set_option( 'allow_data_collect', apply_filters( 'pixcare_allow_data_collector_module', true ) );
			PixelgradeAssistant_Admin::save_options();
		}

		if ( ! self::allow_data_collector() ) {
			return array();
		}

		// Fetch the data via the same way we use for collecting
		$data = self::instance( PixelgradeAssistant() );

		return array(
			'allowCollectData' => PixelgradeAssistant_Admin::get_option( 'allow_data_collect', true ),
			'installation'     => $data->get_install_data(),
			'activePlugins'    => $data->get_active_plugins(),
			'coreOptions'      => $data->get_core_options(),
			'themeOptions'     => $data->get_theme_options(),
			'system'           => $data->get_system_data(),
		);
	}

	/**
	 * Pass data to WUpdates which should store it in DataVault.
	 *
	 * @param array $data The optional data that is being passed to WUpdates
	 * @param string $slug The product's slug
	 *
	 * @return array
	 */
	public function filter_wupdates_request_data( $data, $slug ) {
		// We need to make sure that we are adding the data to the proper update check
		// Each product fires this filter when it checks for updates; including this very own Pixelgrade Assistant plugin
		// For now we will only allow it to work for the current theme (we assume only themes require licenses)
		// This may actually suffice since we are interested in the environment data and it's the same for all
		// @todo This may need second thinking if we have plugins with licenses
		if ( $slug == basename( get_template_directory() ) ) {
			$data = array_merge( $data, $this->get_post_data() );
		}

		return $data;
	}

	/**
	 * Remember the previous theme on theme switch.
	 *
	 * @param $stylesheet
	 * @param WP_Theme $theme
	 */
	public function remember_previous_theme( $stylesheet, $theme ) {
		$previous_themes = get_option( 'pixcare_previous_themes', array() );

		$template = time();
		if ( ! empty( $theme ) ) {
			$template = $theme->get_template();
		}

		$previous_themes = array(
           $template => array(
				'name' => $theme->get( 'Name' ),
				'author' => $theme->get( 'Author' ),
				'themeuri' => $theme->get( 'ThemeURI' ),
				'authoruri' => $theme->get( 'AuthorURI' ),
				'version' => $theme->get( 'Version' ),
				'switch_timestamp' => time(),
			),
		) + $previous_themes;

		update_option( 'pixcare_previous_themes', $previous_themes );
	}

	/**
	 * Data to be sent.
	 */
	public function get_post_data() {
		$response                   = array();
		$response['install_data']   = $this->get_install_data( true );
		$response['theme_options']  = $this->get_theme_options();
		$response['core_options']   = $this->get_core_options();
		$response['active_plugins'] = $this->get_active_plugins();
		$response['system_data']    = $this->get_system_data();
		$response['site_content_data'] = $this->get_site_content_data();

		return $response;
	}

	/**
	 *
	 * @param bool $stats Optional. If the data is used for stats or display.
	 *
	 * @return array
	 */
	public function get_install_data( $stats = false ) {

		$install_data = array();

		// install url
		$install_data['url'] = array(
			'label'       => 'Home URL',
			'value'       => home_url( '/' ),
			'is_viewable' => true
		);

		// Theme Name
		$install_data['theme_name'] = array(
			'label'       => 'Theme Name',
			'value'       => ( empty( $this->config['theme_name'] ) ? '' : $this->config['theme_name'] ),
			'is_viewable' => true
		);

		// Theme Version
		$install_data['theme_version'] = array(
			'label'         => 'Theme Version',
			'value'         => ( empty( $this->config['theme_version'] ) ? '' : $this->config['theme_version'] ),
			'is_viewable'   => true,
			'is_updateable' => $this->is_theme_updateable(),
		);

		// Is Child THeme
		$install_data['is_child_theme'] = array(
			'label'       => 'Child Theme',
			'value'       => ( ! empty( $this->config['is_child'] ) && $this->config['is_child'] ? 'In use' : 'Not in use' ),
			'is_viewable' => true
		);

		// Template
		$install_data['template'] = array(
			'label'       => 'Template',
			'value'       => ( empty( $this->config['template'] ) ? '' : $this->config['template'] ),
			'is_viewable' => false
		);

		$install_data['product'] = array(
			'label'       => 'product',
			'value'       => PixelgradeAssistant_Admin::get_theme_hash_id(''),
			'is_viewable' => false
		);

		if ( $stats ) {
			$install_data['site_title'] = get_bloginfo( 'name');
			$install_data['site_description'] = get_bloginfo( 'description');
			$install_data['stylesheet_url'] = get_bloginfo( 'stylesheet_url');
			$install_data['language'] = get_bloginfo( 'language');
			$install_data['rtl'] = is_rtl();

			$first_registered_user = get_users( array(
				'order' => 'ASC',
				'orderby' => 'user_registered',
				'number' => 1,
				'fields' => array( 'user_registered' ),
			) );
			if ( ! empty( $first_registered_user[0] ) ) {
				$install_data['creation_date'] = $first_registered_user[0]->user_registered;
			}
			$install_data['previous_themes'] = get_option( 'pixcare_previous_themes', array() );
		}

		return $install_data;
	}

	public function get_theme_options() {
		$response = array();

		if ( ! empty( $this->config['theme_name'] ) ) {
			if ( function_exists( 'PixCustomifyPlugin' ) ) {
				$customify = PixCustomifyPlugin();

				$all_options = $customify->get_options_configs();
				foreach ( $all_options as $key => $config ) {
					// We will skip fonts for now since we don't have a proper way of detecting if their value has been changed
					// Right now they are saved regardless.
					if ( empty( $config['type'] ) || $config['type'] === 'font' ) {
						continue;
					}

					if ( ! isset( $config['value'] ) ) {
						$config['value'] = $customify->get_option( $key );
					}

					$default = null;
					if ( isset( $config['default'] ) ) {
						$default = $config['default'];
					}
					if ( $config['value'] !== null && $config['value'] !==  $default ) {
						$response[ $key ] = $config['value'];
					}
				}
			}

		}

		return $response;
	}

	/**
	 * Return core options
	 */
	public function get_core_options() {
		$response['core_options'] = array(
			'users_can_register'    => get_option( 'users_can_register' ),
			'start_of_week'         => get_option( 'start_of_week' ),
			'use_balanceTags'       => get_option( 'use_balanceTags' ),
			'use_smilies'           => get_option( 'use_smilies' ),
			'require_name_email'    => get_option( 'require_name_email' ),
			'comments_notify'       => get_option( 'comments_notify' ),
			'posts_per_rss'         => get_option( 'posts_per_rss' ),
			'rss_use_excerpt'       => get_option( 'rss_use_excerpt' ),
			'posts_per_page'        => get_option( 'posts_per_page' ),
			'date_format'           => get_option( 'date_format' ),
			'time_format'           => get_option( 'time_format' ),
			'comment_moderation'    => get_option( 'comment_moderation' ),
			'moderation_notify'     => get_option( 'moderation_notify' ),
			'permalink_structure'   => get_option( 'permalink_structure' ),
			'blog_charset'          => get_option( 'blog_charset' ),
			'template'              => get_option( 'template' ),
			'stylesheet'            => get_option( 'stylesheet' ),
			'comment_whitelist'     => get_option( 'comment_whitelist' ),
			'comment_registration'  => get_option( 'comment_registration' ),
			'html_type'             => get_option( 'html_type' ),
			'default_role'          => get_option( 'default_role' ),
			'db_version'            => get_option( 'db_version' ),
			'blog_public'           => get_option( 'blog_public' ),
			'default_link_category' => get_option( 'default_link_category' ),
			'show_on_front'         => get_option( 'show_on_front' ),
			'thread_comments'       => get_option( 'thread_comments' ),
			'page_comments'         => get_option( 'page_comments' ),
			'theme_switched'        => get_option( 'theme_switched' )
		);

		return $response['core_options'];
	}

	/**
	 * Return active plugins
	 */
	public function get_active_plugins() {
		$active_plugins = get_option( 'active_plugins' );
		$response       = array();
		$plugin_check   = get_site_transient( 'update_plugins' );

		foreach ( $active_plugins as $active_plugin_file ) {

			// if the plugin was deleted via FTP, it is still marked as active,
			// but we can avoid a PHP warning in dashboard with this
			if ( ! file_exists( WP_PLUGIN_DIR . '/' . $active_plugin_file ) ) {
				continue;
			}

			if ( ! function_exists( 'get_plugin_data' ) ) {
				require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
			}

			$plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/' . $active_plugin_file );
			// Attempt to generate some sort of slug, although collisions are possible since this is not the real WordPress.org slug
			// @todo we could extract that from the plugin URI entry
			$plugin_slug = sanitize_title( $plugin_data['Name'] );

			$response[ $active_plugin_file ] = array(
				'name'       => $plugin_data['Name'],
				'version'    => $plugin_data['Version'],
				'pluginUri'  => $plugin_data['PluginURI'],
				'authorName' => $plugin_data['AuthorName'],
				'plugin'     => $active_plugin_file,
				'slug'       => $plugin_slug,
			);

			// Check if there's an update available for this plugin
			if ( $plugin_check && property_exists( $plugin_check, 'response' ) && isset( $plugin_check->response[ $active_plugin_file ] ) ) {
				$response[ $active_plugin_file ]['is_updateable'] = true;
				$response[ $active_plugin_file ]['new_version']   = $plugin_check->response[ $active_plugin_file ]->new_version;
				$response[ $active_plugin_file ]['download_url']  = $plugin_check->response[ $active_plugin_file ]->package;
			}
		}

		return $response;
	}

	/**
	 * Return system data
	 */
	public function get_system_data() {
		global $wpdb;

		// WP memory limit
		$wp_memory_limit = wp_convert_hr_to_bytes( WP_MEMORY_LIMIT );
		if ( function_exists( 'memory_get_usage' ) ) {
			$wp_memory_limit = max( $wp_memory_limit, wp_convert_hr_to_bytes( @ini_get( 'memory_limit' ) ) );
		}

		$web_server = $_SERVER['SERVER_SOFTWARE'] ? $_SERVER['SERVER_SOFTWARE'] : '';

		$php_version = 'undefined';
		if ( function_exists( 'phpversion' ) ) {
			$php_version = phpversion();
		}

		$wp_min = $this->get_core_supported_versions();

		$db_charset = $wpdb->charset ? $wpdb->charset : 'undefined';

		$response = array(
			'wp_debug_mode'          => array(
				'label' => 'WP Debug Mode Active',
				'value' => ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? "true" : "false",
			),
			'wp_cron'                => array(
				'label' => 'WP Cron Active',
				'value' => ! ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ) ? "true" : "false",
			),
			'wp_version'             => array(
				'label'         => 'WP Version',
				'value'         => get_bloginfo( 'version' ),
				'is_viewable'   => true,
				'is_updateable' => $this->is_wp_updateable(),
				'download_url'  => $wp_min['latest_wp_download'],
			)
		,
			'web_server'             => array(
				'label' => 'Web Server',
				'value' => $web_server,
			),
			'wp_memory_limit'        => array(
				'label' => 'WP Memory Limit',
				'value' => $wp_memory_limit,
			), // in bytes
			'php_post_max_size'      => array(
				'label' => 'PHP Post Max Size',
				'value' => wp_convert_hr_to_bytes( ini_get( 'post_max_size' ) ), // in bytes
			),
			'php_max_execution_time' => array(
				'label' => 'PHP Max Execution Time',
				'value' => ini_get( 'max_execution_time' ) . ' s',
			),
			'php_version'            => array(
				'label'         => 'PHP Version',
				'value'         => $php_version,
				'is_viewable'   => true,
				'is_updateable' => $this->is_php_updateable(),
				'download_url'  => esc_url( 'https://php.net' ),
			),
			'mysql_version'          => array(
				'label'         => 'MySQL Version',
				'value'         => $wpdb->db_version(),
				'is_viewable'   => true,
				'is_updateable' => $this->is_mysql_updateable( $wpdb->db_version() ),
				'download_url'  => esc_url( 'https://mysql.com' ),

			),
			'wp_locale'              => array(
				'label'       => 'WP Locale',
				'value'       => get_locale(),
				'is_viewable' => true,
			),
			'db_charset'             => array(
				'label'         => 'DB Charset',
				'value'         => $db_charset, //maybe get it from a mysql connection
				'is_viewable'   => true,
				'is_updateable' => $this->is_db_charset_updateable( $db_charset ),
			)
		);

		return $response;
	}

	/**
	 * Return anonymous site content data.
	 */
	public function get_site_content_data() {

		$response = array(
			'post_types' => array(
				'label' => 'Post Types',
				'value' => array(),
			),
			'comments' => array (
				'label' => 'Comments',
				'count' => wp_count_comments(),
			),
		);

		$args = array(
			'public'   => true,
		);
		/** @var WP_Post_Type $post_type */
		foreach ( get_post_types( $args, 'objects', 'and' ) as $post_type ) {
			$post_type_details = array(
				'count' => wp_count_posts( $post_type->name ),
			);

			$response['post_types']['value'][ $post_type->name ] = $post_type_details;
		}

		return $response;
	}

	/**
	 * Check if the current theme has an update available.
	 *
	 * @return bool
	 */
	public function is_theme_updateable() {
		// check if we have a new theme version on record
		$new_theme_version     = get_theme_mod( 'pixcare_new_theme_version' );

		if ( empty( $new_theme_version ) ) {
			return false;
		}

		$current_theme         = wp_get_theme();
		$current_theme_version = $current_theme->get( 'Version' );
		$parent                = $current_theme->parent();

		// If current theme version is empty (in case of a child) - get the version from the parent
		if ( $parent && empty( $current_theme_version ) ) {
			$current_theme_version = $parent->get( 'Version' );
		}

		// if current theme version is different than the new theme version
		if ( $new_theme_version != $current_theme_version && version_compare( $new_theme_version, $current_theme_version, '>' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the current WordPress version has an update available.
	 *
	 * @return bool
	 */
	public function is_wp_updateable() {
		$blog_version = get_bloginfo( 'version' );
		$wp_supported = self::get_core_supported_versions();

		if ( isset( $wp_supported['latest_wp_version'] ) && $blog_version != $wp_supported['latest_wp_version'] ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the PHP version being used is behind what the WordPress core recommends.
	 *
	 * @return bool
	 */
	public function is_php_updateable() {
		$php_version = 'undefined';
		if ( function_exists( 'phpversion' ) ) {
			$php_version = phpversion();
		}

		$wp_min = self::get_core_supported_versions();

		if ( floatval( $php_version ) < floatval( $wp_min['min_php_version'] ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the MySQL version being used is behind what the WordPress core recommends.
	 *
	 * @param string $current_version
	 * @return bool
	 */
	public function is_mysql_updateable( $current_version ) {
		$wp_min = self::get_core_supported_versions();

		if ( floatval( $current_version ) < floatval( $wp_min['min_mysql_version'] ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the database charset is not 'utf8mb4' and it should be updated.
	 *
	 * @return bool
	 */
	public function is_db_charset_updateable( $db_charset ) {

		if ( 'utf8mb4' !== $db_charset ) {
			return true;
		}

		return false;
	}

	public function set_core_supported_versions( $transient ) {
		// Nothing to do here if the checked transient entry is empty or if we have already checked
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$url      = 'https://api.wordpress.org/core/version-check/1.7/';
		$response = wp_remote_get( $url );

		$body = wp_remote_retrieve_body( $response );
		$body = json_decode( $body );

		if ( property_exists( $body, 'offers' ) && ! empty( $body->offers ) ) {

			foreach ( $body->offers as $version ) {
				if ( property_exists( $version, 'partial_version' ) && ! $version->partial_version ) {
					$latest_version = $version;
					break;
				}
			}

			$wp_minimum_supported = array(
				'latest_wp_version'  => $latest_version->current,
				'min_php_version'    => $latest_version->php_version,
				'min_mysql_version'  => $latest_version->mysql_version,
				'latest_wp_download' => $latest_version->download
			);
			update_option( 'pixcare_wordpress_minimum_supported', $wp_minimum_supported );
		}

		return $transient;
	}

	/**
	 * Gets the minimum required versions of PHP, MySQL, WordPress.
	 *
	 * @return array
	 */
	private function get_core_supported_versions() {
		$min_supportedversions = get_option( 'pixcare_wordpress_minimum_supported' );

		if ( ! $min_supportedversions ) {
			// delete the transient and get the values again
			delete_site_transient( 'update_themes' );
			$min_supportedversions = get_option( 'pixcare_wordpress_minimum_supported' );
		}

		return $min_supportedversions;
	}

	/**
	 * Main PixelgradeAssistant_DataCollector Instance
	 *
	 * Ensures only one instance of PixelgradeAssistant_DataCollector is loaded or can be loaded.
	 *
	 * @since  1.3.0
	 * @static
	 *
	 * @param  object $parent Main PixelgradeAssistant instance.
	 *
	 * @return PixelgradeAssistant_DataCollector Main PixelgradeAssistant_DataCollector instance
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
