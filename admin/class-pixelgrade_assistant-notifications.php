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
class PixelgradeAssistant_Notifications {

	/**
	 * The main plugin object (the parent).
	 * @var     PixelgradeAssistant
	 * @access  public
	 */
	public $parent = null;

	/**
	 * All the notifications that should be displayed at a certain point.
	 *
	 * @var array
	 */
	public $notifications = array();

	/**
	 * The only instance.
	 * @var     PixelgradeAssistant_Admin
	 * @access  protected
	 */
	protected static $_instance = null;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct( $parent ) {
		$this->parent = $parent;

		add_action( 'admin_init', array( $this, 'init' ), 20 );
	}

	/**
	 * Initialize this module.
	 */
	public function init() {
		// Allow others to disable this module
		if ( false === apply_filters( 'pixassist_allow_notifications_module', true ) ) {
			return;
		}

		$this->notificationsSetup();

		$this->registerHooks();
	}

	/**
	 * Register the hooks related to this module.
	 */
	public function registerHooks() {
		// Handle special cases where we will not load the support module
		add_filter( 'pixassist_allow_notifications_module', array( $this, 'disableModuleInSpecialCases' ) );

		// Remember the theme on theme switch.
		add_action( 'after_switch_theme', array( $this, 'rememberActiveTheme' ), 10, 2 );

		// Handle AJAX dismissals
		add_action( 'wp_ajax_pixassist_rating_dismiss_admin_notice', array( $this, 'dismissRatingNotice' ) );

		// Cleanup on theme switch.
		add_action( 'switch_theme', array( $this, 'cleanup' ) );
	}

	public function notificationsSetup() {
		// We don't show notifications if the current user can't manage options or if we are in the network admin sections on a multisite installation.
		$allow_notifications = current_user_can( 'manage_options' ) && ! is_network_admin();
		if ( false === apply_filters( 'pixassist_allow_notifications_module', $allow_notifications ) ) {
			return;
		}

		// Make sure that the current active theme is remembered.
		$this->maybeRememberCurrentTheme();

		// Grab all the notifications markup.
		if ( $rating_notification_markup = $this->getRatingNotificationMarkup() ) {
			$this->notifications[] = $rating_notification_markup;
		}

		// Allow others to add their own notifications.
		$this->notifications = apply_filters( 'pixassit_notifications', $this->notifications );

		// If we have notifications to show, hook up.
		if ( ! empty( $this->notifications ) ) {
			add_action( 'admin_notices', array( $this, 'outputMarkup' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'outputCSS' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'outputJS' ) );
		}
	}

	public function outputMarkup() {
		if ( ! empty( $this->notifications ) ) {
			foreach ( $this->notifications as $notification ) {
				echo $notification;
			}
		}
	}

	protected function getRatingNotificationMarkup() {
		/*
		 * Determine if we should output this notification.
		 */

		// Get the last activated theme details (it should be the current theme).
		$last_activated_theme = $this->getLastActivatedTheme();
		if ( empty( $last_activated_theme ) ) {
			$this->maybeRememberCurrentTheme();
			return '';
		}

		// If the current theme is not one of ours, don't display.
		if ( ! $this->isOurTheme() ) {
			return '';
		}

		// Determine the admin pages we should show this notification
		global $pagenow;
		if ( ! in_array( $pagenow, array( 'index.php', 'themes.php', 'profile.php') ) ) {
			return '';
		}

		// If 7 days haven't passed since the theme activation, don't display
		if ( empty( $last_activated_theme['active_timestamp'] ) || ( time() - absint( $last_activated_theme['active_timestamp'] ) < DAY_IN_SECONDS * 7 ) ) {
			return '';
		}

		// Earlier than 14 days since the last dismissal, we will not show again.
		$dismissed = get_theme_mod( 'pixassist_rating_notice_dismissed', false );
		if ( ! empty( $dismissed ) && ( time() - absint( $dismissed ) < DAY_IN_SECONDS * 14 ) ) {
			return '';
		}

		/*
		 * Output the markup
		 */

		$ajax_action = 'pixassist_rating_dismiss_admin_notice';

		ob_start(); ?>
		<div class="notice notice-info pixassist-notice rating-notice">
			<form class="pixassist-notice-form"
			      action="<?php echo esc_url( admin_url( 'admin-ajax.php?action=' . $ajax_action ) ); ?>"
			      method="post">
				<noscript><input type="hidden" name="pixassist-notice-no-js" value="1"/></noscript>
				<input type="hidden" name="pixassist-notice-dismiss-action" value="<?php echo esc_attr( $ajax_action ); ?>"/>

				<?php
				// Get the current user name, first_name preferred with fallback to display name.
				$current_user = wp_get_current_user();
				$current_user_name = $current_user->get('first_name');
				if ( empty( $current_user_name ) ) {
					$current_user_name = $current_user->get('display_name');
				}

				$theme      = wp_get_theme( get_template() );

				// By default we will link to our themes.
				$review_link = 'https://wordpress.org/themes/author/pixelgrade/';
				// Attempt to link directly to the reviews of the theme.
				if ( ! empty( $theme->get( 'TextDomain') ) ) {
					$temp_link = 'https://wordpress.org/support/theme/' . strtolower( $theme->get( 'TextDomain') ) . '/reviews/';
					// Test the link
					$response = wp_remote_head( $temp_link, array(
						'timeout' => 2,
						'sslverify' => false,
					) );
					if ( ! empty( $response['response']['code'] ) && WP_Http::OK == $response['response']['code'] ) {
						$review_link = $temp_link;
					}
				}

				$screenshot = $theme->get_screenshot();
				if ( $screenshot ) { ?>
					<img class="pixassist-notice__screenshot" src="<?php echo esc_url( $screenshot ); ?>"
					     width="1200" height="900" alt="<?php esc_html_e( 'Theme screenshot', '__plugin_txtd' ); ?>">
				<?php } ?>
				<div class="pixassist-notice__body">
					<div class="step initial-step">
						<h2><?php
							/* translators: 1: User name, 2: Theme name */
							echo wp_kses( sprintf( __( 'Hi %1$s. Do you enjoy crafting your site with %2$s?', '__plugin_txtd' ), $current_user_name,  $theme->get( 'Name' ) ), wp_kses_allowed_html( 'post' ) ); ?></h2>
						<p><?php
							/* translators: %s: Theme name  */
							echo wp_kses( sprintf( __( 'You have put %s to good use and we, at Pixelgrade, would love to know <strong>what you think of it.</strong> Any feedback is very much appreciated.', '__plugin_txtd' ), $theme->get( 'Name' ) ), wp_kses_allowed_html( 'post' ) ); ?></p>

						<a class="pixassist-notice-button js-pixassist-enjoyed-handle button button-primary" href="#">
							<span class="pixassist-notice-button__text"><?php
								/* translators: %s: Theme name  */
								echo wp_kses( sprintf( __( 'Yes, %s is a really good fit for me', '__plugin_txtd' ), $theme->get( 'Name' ) ), wp_kses_allowed_html( 'post' ) ); ?></span>
						</a>
						<a class="pixassist-notice-button js-pixassist-notenjoyed-handle button" href="#">
							<span class="pixassist-notice-button__text"><?php esc_html_e( 'Not really', '__plugin_txtd' ); ?></span>
						</a>
					</div>
					<div class="step yes-step">
						<h2><?php
							/* translators: %s: Theme name */
							echo wp_kses( sprintf( __( 'That\'s awesome! 🤩<br>Could you do us a BIG favor and award %s a 5-star rating on WordPress.org?', '__plugin_txtd' ), $theme->get( 'Name' ) ), wp_kses_allowed_html( 'post' ) ); ?></h2>
						<p><?php
							/* translators: %s: Theme name  */
							echo wp_kses( sprintf( __( 'This will help us <strong>spread the word</strong> and boost our <strong>motivation to keep improving %s. 🚀</strong>', '__plugin_txtd' ), $theme->get( 'Name' ) ), wp_kses_allowed_html( 'post' ) ); ?></p>

						<a class="pixassist-notice-button js-pixassist-awardrating-handle button button-primary dashicons-before dashicons-external" href="<?php echo esc_url( $review_link ); ?>" target="_blank">
							<span class="pixassist-notice-button__text"><?php esc_html_e( 'OK, you people deserve it', '__plugin_txtd' ); ?></span>
						</a>
						<a class="pixassist-notice-button js-pixassist-maybelater-handle button" href="#">
							<span class="pixassist-notice-button__text"><?php esc_html_e( 'Maybe later / Already have', '__plugin_txtd' ); ?></span>
						</a>
					</div>
					<div class="step no-step">
						<h2><?php esc_html_e( 'Now you got us curious 🤔 Could you describe the areas that let you down?', '__plugin_txtd' ); ?></h2>
						<p class="feedback-message-wrapper">
							<textarea class="feedback-message js-pixassist-feedbackmsg-handle" required placeholder="<?php esc_html_e( 'Tell us about your experience with setting up the theme, customizating styles, creating posts and pages, playing with your pet, and anything in between.', '__plugin_txtd' ); ?>"></textarea>
						</p>
						<a class="pixassist-notice-button js-pixassist-submitfeedback-handle button button-primary" href="#">
							<span class="pixassist-notice-button__text"><?php esc_html_e( 'Send my feedback', '__plugin_txtd' ); ?></span>
						</a>
						<a class="pixassist-notice-button js-pixassist-notnow-handle button" href="#">
							<span class="pixassist-notice-button__text"><?php esc_html_e( 'Not now', '__plugin_txtd' ); ?></span>
						</a>
					</div>
					<div class="step rating-thankyou-step">
						<h2><?php esc_html_e( 'Thank you so much! 🤗', '__plugin_txtd' ); ?></h2>
						<p><?php echo wp_kses_post( __( 'We at Pixelgrade believe in the power of <strong>"give before you get"</strong> and it\'s nice when this is matched by reality. <strong>You just made it so. 💪</strong>', '__plugin_txtd' ) ); ?></p>

						<p><?php echo wp_kses_post( __( 'We will now quietly get out of your way and let you get back to your thing.', '__plugin_txtd' ) ); ?></p>

						<button type="submit" class="pixassist-notice-button button dismiss">
							<span class="screen-reader-text"><?php esc_html_e( 'Dismiss this notice.', '__plugin_txtd' ); ?></span><?php esc_html_e( 'You\'re welcome. Bye, bye for now', '__plugin_txtd' ); ?>
						</button>
					</div>
					<div class="step feedback-thankyou-step">
						<h2><?php esc_html_e( 'Your feedback is valuable. Thank you 🤗', '__plugin_txtd' ); ?></h2>
						<p><?php echo wp_kses_post( __( 'We know things can always be better. At Pixelgrade, we are firm believers in the power of <strong>combining experimentation with continuous improvements.</strong>', '__plugin_txtd' ) ); ?></p>
						<p><?php echo wp_kses_post( __( 'Your unique perspective helps us understand <strong>the ways our products are actually used.</strong>', '__plugin_txtd' ) ); ?></p>

						<p><?php echo wp_kses_post( __( 'We will now quietly get out of your way and let you get back to your thing.', '__plugin_txtd' ) ); ?></p>

						<button type="submit" class="pixassist-notice-button button dismiss">
							<span class="screen-reader-text"><?php esc_html_e( 'Dismiss this notice.', '__plugin_txtd' ); ?></span><?php esc_html_e( 'Awesome. Bye, bye for now', '__plugin_txtd' ); ?>
						</button>
					</div>
					<div class="step maybelater-thankyou-step">
						<h2><?php esc_html_e( 'No worries. There\'s no pressure 😌', '__plugin_txtd' ); ?></h2>
						<p><?php echo wp_kses_post( __( 'We don\'t enjoy pushy notifications and we think neither do you.', '__plugin_txtd' ) ); ?></p>
						<p><?php echo wp_kses_post( __( 'We will now quietly get out of your way and let you get back to your thing.', '__plugin_txtd' ) ); ?></p>

						<button type="submit" class="pixassist-notice-button button dismiss">
							<span class="screen-reader-text"><?php esc_html_e( 'Dismiss this notice.', '__plugin_txtd' ); ?></span><?php esc_html_e( 'OK. Bye, bye for now', '__plugin_txtd' ); ?>
						</button>
					</div>
				</div>
				<?php wp_nonce_field( $ajax_action, 'nonce_dismiss', true ); ?>
			</form>
		</div>
		<?php

		return ob_get_clean();
	}

	public function outputCSS() {
		$rtl_suffix = is_rtl() ? '-rtl' : '';
		wp_register_style( 'pixassist_notices_css', plugin_dir_url( $this->parent->file ) . 'admin/css/notices' . $rtl_suffix . '.css', array( 'dashicons' ), $this->parent->get_version() );
		wp_enqueue_style( 'pixassist_notices_css' );
	}

	public function outputJS() {
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
		wp_register_script( 'pixassist_notices_js', plugin_dir_url( $this->parent->file ) . 'admin/js/admin-notices' . $suffix . '.js', array(
			'jquery',
		) );
		wp_enqueue_script( 'pixassist_notices_js' );

		$theme = wp_get_theme( get_template() );
		wp_localize_script( 'pixassist_notices_js', 'pixassistNotices', array(
			'ajaxurl' => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
			'installurl' => home_url( '/' ),
			'feedbackTicketSubject' => sprintf( esc_html__( 'User Feedback for %s (via Pixelgrade Assistant)', '__plugin_txtd' ), $theme->get('Name') ),
		) );
	}

	/**
	 * Process ajax call to dismiss rating notice.
	 */
	public function dismissRatingNotice() {
		// Check nonce.
		check_ajax_referer( 'pixassist_rating_dismiss_admin_notice', 'nonce_dismiss' );

		// Remember the dismissal (time).
		set_theme_mod( 'pixassist_rating_notice_dismissed', time() );

		// Redirect if this is not an ajax request.
		if ( isset( $_POST['pixassist-notice-no-js'] ) ) {

			// Go back to where we came from.
			wp_safe_redirect( wp_get_referer() );
			exit();
		}

		wp_die();
	}

	public function cleanup() {
		// If the theme is switched, we want to clear the dismissals.
		set_theme_mod( 'pixassist_rating_notice_dismissed', false );
	}

	public function isOurTheme() {
		// Determine if the current active theme is one of our themes.
		$current_theme  = wp_get_theme( get_template() );

		if ( strtolower( $current_theme->get('Author') ) === 'pixelgrade' ||
		     false !== strpos( strtolower( $current_theme->get('ThemeURI') ), 'pixelgrade' ) ||
		     false !== strpos( strtolower( $current_theme->get('AuthorURI') ), 'pixelgrade' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Handle special cases where for better user experience we will no allow the support module.
	 *
	 * @param bool $allow_support
	 *
	 * @return bool
	 */
	public function disableModuleInSpecialCases( $allow_support ) {
		// Nothing for now.

		return $allow_support;
	}

	public function maybeRememberCurrentTheme() {
		$should_remember = false;

		$activated_themes = get_option( 'pixassist_activated_themes', array() );

		$current_theme  = wp_get_theme( get_template() );
		if ( ! empty( $activated_themes ) ) {
			$last_active_theme = reset( $activated_themes );
			if ( ! empty( $last_active_theme ) && $last_active_theme['template'] !== $current_theme->get_template() ) {
				$should_remember = true;
			}
		} else {
			$should_remember = true;
		}

		if ( $should_remember ) {
			$activated_themes = array(
				                    $current_theme->get_template() => array(
					                    'template'         => $current_theme->get_template(),
					                    'name'             => $current_theme->get( 'Name' ),
					                    'author'           => $current_theme->get( 'Author' ),
					                    'version'          => $current_theme->get( 'Version' ),
					                    'active_timestamp' => time(),
				                    ),
			                    ) + $activated_themes;

			update_option( 'pixassist_activated_themes', $activated_themes, false );
		}
	}

	public function getLastActivatedTheme() {
		$activated_themes = get_option( 'pixassist_activated_themes', array() );

		if ( empty( $activated_themes ) ) {
			return false;
		}

		return reset( $activated_themes );
	}

	/**
	 * Remember the active theme on theme switch.
	 *
	 * @param $stylesheet
	 * @param WP_Theme $theme
	 */
	public function rememberActiveTheme( $stylesheet, $theme ) {
		$activated_themes = get_option( 'pixassist_activated_themes', array() );

		$template = time();
		$current_theme  = wp_get_theme( get_template() );
		if ( ! empty( $current_theme ) ) {
			$template = $current_theme->get_template();
		}

		$activated_themes = array(
			                    $template => array(
				                    'template'         => $template,
				                    'name'             => $current_theme->get( 'Name' ),
				                    'author'           => $current_theme->get( 'Author' ),
				                    'version'          => $current_theme->get( 'Version' ),
				                    'active_timestamp' => time(),
			                    ),
		                    ) + $activated_themes;

		update_option( 'pixassist_activated_themes', $activated_themes, false );
	}

	/**
	 * Main PixelgradeAssistant_Notifications Instance
	 *
	 * Ensures only one instance of PixelgradeAssistant_Notifications is loaded or can be loaded.
	 *
	 * @static
	 * @param  object $parent Main PixelgradeAssistant instance.
	 * @return object Main PixelgradeAssistant_Notifications instance
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
