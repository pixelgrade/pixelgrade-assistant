<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/admin
 * @author     Pixelgrade <help@pixelgrade.com>
 */
class PixelgradeAssistant_SetupWizard {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 */
	public $parent = null;

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_SetupWizard
	 * @access  protected
	 */
	protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct( $parent ) {
		$this->parent = $parent;

		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Initialize this module.
	 */
	public function init() {
		// Allow others to disable this module
		if ( false === apply_filters( 'pixassist_allow_setup_wizard_module', true ) ) {
			return;
		}

		$this->register_hooks();
	}

	/**
	 * Register the hooks related to this module.
	 */
	public function register_hooks() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'setup_wizard' ) );

		// Handle the previous URL for the setup wizard:
		// index.php?page=pixelgrade_assistant-setup-wizard
		// instead of the new
		// admin.php?page=pixelgrade_assistant-setup-wizard
		add_action( 'admin_page_access_denied', array( $this, 'redirect_to_correct_url' ), 0 );
	}

	public function add_admin_menu() {
		add_submenu_page( 'pixelgrade_assistant', '', '', 'manage_options', 'pixelgrade_assistant-setup-wizard', null );
	}

	public function setup_wizard() {
		$allow_setup_wizard = $this->is_pixelgrade_assistant_setup_wizard() && current_user_can( 'manage_options' );
		if ( false === apply_filters( 'pixassist_allow_setup_wizard_module', $allow_setup_wizard ) ) {
			return;
		}

		$rtl_suffix = is_rtl() ? '-rtl' : '';
		wp_enqueue_style( $this->parent->get_plugin_name(), plugin_dir_url( $this->parent->file ) . 'admin/css/pixelgrade_assistant-admin' . $rtl_suffix . '.css', array( 'dashicons' ), $this->parent->get_version(), 'all' );

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
		wp_enqueue_script( 'plugin-install' );
		wp_enqueue_script( 'updates' );
		wp_enqueue_script( 'pixelgrade_assistant-setup-wizard', plugin_dir_url( $this->parent->file ) . 'admin/js/setup_wizard' . $suffix . '.js', array(
			'jquery',
			'wp-util',
			'wp-a11y',
			'plugin-install',
			'updates',
		), $this->parent->get_version(), true );

		PixelgradeAssistant_Admin::localize_js_data( 'pixelgrade_assistant-setup-wizard' );

		update_option( 'pixelgrade_assistant_version', $this->parent->get_version() );
		// Delete redirect transient
		$this->delete_redirect_transient();

		ob_start();
		$this->setup_wizard_header();
		$this->setup_wizard_content();
		$this->setup_wizard_footer();
		exit;
	}

	public function redirect_to_correct_url() {
		if ( ! empty( $_GET['page'] ) && 'pixelgrade_assistant-setup-wizard' === $_GET['page'] && 0 === strpos( wp_unslash( $_SERVER['REQUEST_URI'] ), '/wp-admin/index.php' ) ) {
			wp_safe_redirect( admin_url( 'admin.php?page=pixelgrade_assistant-setup-wizard' ) );
			return;
		}
	}

	/**
	 * Setup Wizard Header.
	 */
	public function setup_wizard_header() {
		global $hook_suffix, $current_screen;

		if ( empty( $current_screen ) ) {
			set_current_screen();
		} ?><!DOCTYPE html>
		<html <?php language_attributes(); ?>>
		<head>
			<meta name="viewport" content="width=device-width"/>
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
			<title><?php esc_html_e( 'Pixelgrade Assistant &rsaquo; Setup Wizard', '__plugin_txtd' ); ?></title>
			<script type="text/javascript">
				var ajaxurl = '<?php echo admin_url( 'admin-ajax.php', 'relative' ); ?>',
					pagenow = 'plugins';
			</script>
			<?php
			wp_enqueue_style( 'colors' );
			wp_enqueue_style( 'ie' );
			wp_enqueue_script( 'utils' );
			wp_enqueue_script( 'svg-painter' );

			/**
			 * Fires when styles are printed for a specific admin page based on $hook_suffix.
			 *
			 * @since 2.6.0
			 */
			do_action( "admin_print_styles-{$hook_suffix}" );

			/**
			 * Fires when styles are printed for all admin pages.
			 *
			 * @since 2.6.0
			 */
			do_action( 'admin_print_styles' );
			?>
		</head>
		<body class="pixelgrade_assistant-setup wp-core-ui">

		<?php
	}

	/**
	 * Output the content for the current step.
	 */
	public function setup_wizard_content() { ?>
		<div class="pixelgrade_assistant-wrapper">
			<div id="pixelgrade_assistant_setup_wizard"></div>
			<div id="valdationError"></div>
		</div>
	<?php }

	public function setup_wizard_footer() { ?>
		<?php
		wp_print_scripts( 'pixelgrade_assistant_wizard' );
		wp_print_footer_scripts();
		wp_print_update_row_templates();
		wp_print_admin_notice_templates(); ?>
		</body>
		</html>
		<?php
	}

	/** === HELPERS=== */

	public function is_pixelgrade_assistant_setup_wizard() {
		if ( ! empty( $_GET['page'] ) && 'pixelgrade_assistant-setup-wizard' === $_GET['page'] ) {
			return true;
		}

		return false;
	}

	public function delete_redirect_transient() {
		$delete_transient = delete_site_transient( '_pixassist_activation_redirect' );

		return $delete_transient;
	}

	/**
	 * Main PixelgradeAssistantSetupWizard Instance
	 *
	 * Ensures only one instance of PixelgradeAssistantSetupWizard is loaded or can be loaded.
	 *
	 * @static
	 * @param  object $parent Main PixelgradeAssistant instance.
	 * @return object Main PixelgradeAssistantSetupWizard instance
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
