<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function pixassist_get_default_config( $original_theme_slug ){
	// General strings ready to be translated
	$config['l10n'] = array(
		'myAccountBtn'                  => esc_html__( 'My Account', '__plugin_txtd' ),
		'needHelpBtn'                   => esc_html__( 'Need Help?', '__plugin_txtd' ),
		'returnToDashboard'             => esc_html__( 'Continue to Your WordPress Dashboard', '__plugin_txtd' ),
		'nextButton'                    => esc_html__( 'Continue', '__plugin_txtd' ),
		'skipButton'                    => esc_html__( 'Skip this step', '__plugin_txtd' ),
		'notRightNow'                   => esc_html__( 'Not right now', '__plugin_txtd' ),
		'validationErrorTitle'          => esc_html__( 'Something went wrong', '__plugin_txtd' ),
		'themeValidationNoticeFail'     => esc_html__( 'Not Activated.', '__plugin_txtd' ),
		'themeValidationNoticeUpdateAvailable'     => esc_html__( 'A New Theme Update is Available!', '__plugin_txtd' ),
		'themeValidationNoticeOk'       => esc_html__( 'Connected & Up-to-date!', '__plugin_txtd' ),
		'themeValidationNoticeOutdatedWithUpdate' => esc_html__( 'Your theme is outdated, but an update is available!', '__plugin_txtd' ),
		'themeValidationNoticeNotConnected' => esc_html__( 'Not connected', '__plugin_txtd' ),
		'themeUpdateAvailableTitle'     => esc_html__( 'New Theme Update is Available!', '__plugin_txtd' ),
		'themeUpdateAvailableContent'   => esc_html__( 'Great news! A brand new theme update is waiting.', '__plugin_txtd' ),
		'hashidNotFoundNotice'          => esc_html__( 'Sorry but we could not recognize your theme. This might have happened because you have made changes to your theme files. If that is the case - please try to revert to the original theme files.', '__plugin_txtd' ),
		'themeUpdateButton'             => esc_html__( 'Update', '__plugin_txtd' ),
		'kbButton'                      => esc_html__( 'Theme Help', '__plugin_txtd' ),
		'Error500Text'                  => esc_html__( 'Oh, snap! Something went wrong and we are unable to make sense of the actual problem.', '__plugin_txtd' ),
		'Error500Link'                  => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/guides-and-resources/server-errors-handling',
		'Error400Text'                  => esc_html__( 'There is something wrong with the current setup of this WordPress installation.', '__plugin_txtd' ),
		'Error400Link'                  => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/guides-and-resources/server-errors-handling',
		'themeDirectoryChangedTitle'    => esc_html__( 'Your theme DIRECTORY is not as intended!', '__plugin_txtd' ),
		'themeDirectoryChanged'         => sprintf( esc_html__( 'This will give you all kinds of trouble when updating the theme. To be able to successfully install updates please change the theme directory name to "%s".', '__plugin_txtd' ), $original_theme_slug ),
		'themeNameChangedTitle'         => esc_html__( 'Your theme NAME is changed!', '__plugin_txtd' ),
		'themeNameChanged'              => sprintf( esc_html__( 'The next time you update your theme this name will be changed back to "%s"', '__plugin_txtd' ), $original_theme_slug ),
		'childThemeNameChanged'         => sprintf( esc_html__( 'On your next update, your parent theme name will be changed back to its original one: "%1$s". To avoid issues with your child theme, you will need to update the style.css file of both your parent and child theme with the original name: "%1$s".', '__plugin_txtd' ), $original_theme_slug ),
		'connectionLostTitle'         => esc_html__( 'Your connection is out of sight!', '__plugin_txtd' ),
		'connectionLost'             => esc_html__( 'Unfortunately, we\'ve lost your connection with {{shopdomain}}. Just reconnect and all will be back to normal.', '__plugin_txtd' ),
		'connectButtonLabel'         => esc_html__( 'Connect to {{shopdomain}}', '__plugin_txtd' ),
		'refreshConnectionButtonLabel'         => esc_html__( 'Refresh your site connection', '__plugin_txtd' ),
		'setupWizardTitle'              => esc_html__( 'Site setup wizard', '__plugin_txtd' ),
		'internalErrorTitle'              => esc_html__( 'An internal server error has occurred', '__plugin_txtd' ),
		'internalErrorContent'              => esc_html__( 'Something went wrong while trying to process your request. Please try again.', '__plugin_txtd' ),
		'disconnectLabel'              => esc_html__( 'Disconnect', '__plugin_txtd' ),
		'disconnectConfirm'              => esc_html__( "Are you sure you want to do this?\nYou will lose the connection with {{shopdomain}}.\nBut don't worry, you can always reconnect.", '__plugin_txtd' ),
		'componentUnavailableTitle'  => esc_html__( 'Unavailable', '__plugin_txtd' ),
		'componentUnavailableContent' => esc_html__( 'This feature is available only if your site is connected to {{shopdomain}}.', '__plugin_txtd' ),
		'pluginInstallLabel' => esc_html__( 'Install', '__plugin_txtd' ),
		'pluginActivateLabel' => esc_html__( 'Activate', '__plugin_txtd' ),
		'pluginUpdateLabel' => esc_html__( 'Update', '__plugin_txtd' ),
		'pluginsPlural' => esc_html__( 'Plugins', '__plugin_txtd' ),
		'starterContentLoadLabel' => esc_html__( 'Load Starter Content', '__plugin_txtd' ),
		'setupWizardWelcomeTitle' => esc_html__( 'Welcome to the setup wizard', '__plugin_txtd' ),
		'setupWizardWelcomeContent' => esc_html__( 'Go through this quick setup wizard to make sure you install all the recommended plugins and pre-load the site with helpful demo content. It\'s safe and fast.', '__plugin_txtd' ),
		'setupWizardStartButonLabel' => esc_html__( 'Let\'s Get Started!', '__plugin_txtd' ),
		'authenticatorDashboardConnectTitle' => esc_html__( 'Connect your site to Pixelgrade', '__plugin_txtd' ),
		'authenticatorDashboardConnectContent' => wp_kses_post( __( 'Securely connect to {{shopdomain}}, create <strong>a free account</strong>, and make sure you don\'t miss any of the following perks.
					<ul class="benefits">
						<li><i></i><span><strong>Hand-picked plugins</strong> to boost your website.</span></li>
						<li><i></i><span><strong>Starter Content</strong> to make your website look like the demo.</span></li>
						<li><i></i><span><strong>Premium Support</strong> to guide you through everything you need.</span></li>
                    </ul>', '__plugin_txtd' ) ),
		'authenticatorDashboardConnectLoadingContent' => esc_html__( 'Take a break while you securely authorize Pixelgrade Assistant to connect to {{shopdomain}}. It\'s going to happen in a newly open browser window or tab, just so you know.', '__plugin_txtd' ),
		'authenticatorDashboardConnectedSuccessTitle' => esc_html__( 'Yaaay, site connected! 👏', '__plugin_txtd' ),
		'authenticatorDashboardConnectedSuccessContent' => wp_kses_post( __( 'Well done, <strong>{{username}}</strong>! Your website is successfully connected with {{shopdomain}}. Carry on and install the recommended plugins or the starter content in the blink of an eye.', '__plugin_txtd' ) ),
		'authenticatorActivationErrorTitle' => esc_html__( 'Something Went Wrong!', '__plugin_txtd' ),
		'authenticatorActivationErrorContent' => esc_html__( 'We couldn\'t properly activate your theme. Please try again later.', '__plugin_txtd' ),
		'authenticatorErrorMessage1' => esc_html__( 'An error occurred. Please refresh the page to try again. Error: ', '__plugin_txtd' ),
		'authenticatorErrorMessage2' => wp_kses_post(__( 'If the error persists please contact our support team at <a href="mailto:help@pixelgrade.com?Subject=Help%20with%20connecting%20my%20site" target="_top">help@pixelgrade.com</a>.', '__plugin_txtd' )),
	);

	$config['setupWizard'] = array(

		'activation' => array(
			'stepName' => 'Connect',
			'blocks'   => array(
				'authenticator' => array(
					'class'  => 'full white',
					'fields' => array(
						'authenticator_component' => array(
							'title' => esc_html__( 'Connect to {{shopdomain}}!', '__plugin_txtd' ),
							'type'  => 'component',
							'value' => 'authenticator',
						),
					),
				),
			),
		),

		'plugins' => array(
			'stepName' => esc_html__( 'Plugins', '__plugin_txtd' ),
			'blocks'   => array(
				'plugins' => array(
					'class'  => 'full white',
					'fields' => array(
						'title'             => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Install the recommended plugins', '__plugin_txtd' ),
							'value_installing' => esc_html__( 'Installing Plugins..', '__plugin_txtd' ),
							'value_installed' => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'Plugins Installed!', '__plugin_txtd' ) . ' 🤩',
							'class' => 'section__title'
						),
						'head_content'   => array(
							'type'             => 'text',
							'value'            => esc_html__( 'Install and activate the plugins that provide recommended functionality for your site. You can add or remove plugins later on from within the WordPress dashboard.', '__plugin_txtd' ),
							'value_installing' => wp_kses_post( __( 'Why not take a peek at our <a href="https://twitter.com/pixelgrade" target="_blank">Twitter page</a> while you wait? (opens in a new tab and the plugins aren\'t going anywhere)', '__plugin_txtd' ) ),
							'value_installed'  => esc_html__( 'You made it! 🙌 You\'ve correctly installed and activated the plugins. You are good to jump to the next step.', '__plugin_txtd' ),
						),
						'plugins_component' => array(
							'title' => esc_html__( 'Install Plugins', '__plugin_txtd' ),
							'type'  => 'component',
							'value' => 'plugin-manager',
						),
					),
				),
			),
		),

		'support'   =>  array(
			'stepName'  =>  esc_html__( 'Starter Content', '__plugin_txtd' ),
			'nextText'  =>  esc_html__( 'Next Step', '__plugin_txtd' ),
			'blocks'    =>  array(
				'support'   =>  array(
					'class'  => 'full white',
					'fields' => array(
						'title'          => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Load Starter Content', '__plugin_txtd' ),
							'value_installing' => esc_html__( 'Loading Starter Content..', '__plugin_txtd' ),
							'value_installed' => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'Starter Content Loaded!', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'head_content'   => array(
							'type'             => 'text',
							'value'            => esc_html__( 'Use the starter content to make your site look as eye-candy as the theme\'s demo. The importer helps you have a strong starting point for your content and speed up the entire process.', '__plugin_txtd' ),
							'value_installing' => wp_kses_post( __( 'Why not join our <a href="https://www.facebook.com/groups/PixelGradeUsersGroup/" target="_blank">Facebook Group</a> while you wait? (opens in a new tab)', '__plugin_txtd' ) ),
							'value_installed'  => esc_html__( 'Mission accomplished! 👍 You\'ve successfully imported the starter content, so you\'re good to move forward. Have fun!', '__plugin_txtd' ),
						),
						'starterContent' => array(
							'type'     => 'component',
							'value'    => 'starter-content',
							'notconnected' => 'hidden',
						),
						'content'        => '',
						'links'          => '',
						'footer_content' => '',
					),
				),
			),
		),

		'ready' => array(
			'stepName' => esc_html__( 'Ready', '__plugin_txtd' ),
			'blocks'   => array(
				'ready' => array(
					'class'  => 'full white',
					'fields' => array(
						'title'   => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Your site is ready to make an impact!', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => wp_kses_post( __( '<strong>Big congrats, mate!</strong> 👏 Everything\'s right on track which means that you can start making tweaks of all kinds. Login to your WordPress dashboard to make changes, and feel free to change the default content to match your needs.', '__plugin_txtd' ) ),
						),
					),
				),

				'redirect_area' => array(
					'class'  => 'half',
					'fields' => array(
						'title' => array(
							'type'  => 'h4',
							'value' => esc_html__( 'Next steps', '__plugin_txtd' )
						),
						'cta'   => array(
							'type'  => 'button',
							'class' => 'btn--large',
							'label' => esc_html__( 'View and Customize', '__plugin_txtd' ),
							'url'   => '{{customizer_url}}?return=' . urlencode( admin_url( 'admin.php?page=pixelgrade_assistant' ) )
						),
					),
				),

				'help_links' => array(
					'class'  => 'half',
					'fields' => array(
						'title' => array(
							'type'  => 'h4',
							'value' => esc_html__( 'Learn more', '__plugin_txtd' )
						),
						'links' => array(
							'type'  => 'links',
							'value' => array(
								array(
									'label' => esc_html__( 'Browse the Theme Documentation', '__plugin_txtd' ),
									'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/'
								),
								array(
									'label' => esc_html__( 'Learn How to Use WordPress', '__plugin_txtd' ),
									'url'   => 'https://easywpguide.com'
								),
								array(
									'label' => esc_html__( 'Get Help and Support', '__plugin_txtd' ),
									'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'get-support/'
								),
								array(
									'label' => esc_html__( 'Join our Facebook group', '__plugin_txtd' ),
									'url'   => 'https://www.facebook.com/groups/PixelGradeUsersGroup/'
								),
							),
						),
					),
				),
			),
		),
	);

	$config['dashboard'] = array(
		'general' => array(
			'name'   => esc_html__( 'General', '__plugin_txtd' ),
			'blocks' => array(
				'authenticator' => array(
					'class'  => 'full white',
					'fields' => array(
						'authenticator' => array(
							'type'  => 'component',
							'value' => 'authenticator'
						),
					),
				),
                'starterContent' => array(
                    'notconnected' =>  'hidden',
                    'fields' => array(
	                    'title'          => array(
		                    'type'  => 'h2',
		                    'value' => esc_html__( 'Starter Content', '__plugin_txtd' ),
		                    'value_installing' => esc_html__( 'Starter Content Installing..', '__plugin_txtd' ),
		                    'value_installed' => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'Starter Content Installed!', '__plugin_txtd' ),
		                    'class' => 'section__title',
	                    ),
	                    'head_content'   => array(
		                    'type'             => 'text',
		                    'value'            => esc_html__( 'Use the starter content to make your site look as eye-candy as the theme\'s demo. The importer helps you have a strong starting point for your content and speed up the entire process.', '__plugin_txtd' ),
		                    'value_installing' => wp_kses_post( __( 'Why not join our <a href="https://www.facebook.com/groups/PixelGradeUsersGroup/" target="_blank">Facebook Group</a> while you wait? (opens in a new tab)', '__plugin_txtd' ) ),
		                    'value_installed'  => esc_html__( 'Mission accomplished! 👍 You\'ve successfully imported the starter content, so you\'re good to move forward. Have fun!', '__plugin_txtd' ),
	                    ),
	                    'starterContent' => array(
		                    'type'     => 'component',
		                    'value'    => 'starter-content',
	                    ),
                    ),
                ),
			),
		),

		'customizations' => array(
			'name'   => esc_html__( 'Customizations', '__plugin_txtd' ),
			'class'  => 'sections-grid__item',
			'blocks' => array(
				'featured'  => array(
					'class'  => 'u-text-center',
					'fields' => array(
						'title'   => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Customizations', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'We know that each website needs to have an unique voice in tune with your charisma. That\'s why we created a smart options system to easily make handy color changes, spacing adjustments and balancing fonts, each step bringing you closer to a striking result.', '__plugin_txtd' ),
							'class' => 'section__content'
						),
						'cta'     => array(
							'type'  => 'button',
							'class' => 'btn--action  btn--green',
							'label' => esc_html__( 'Access the Customizer', '__plugin_txtd' ),
							'url'   => '{{customizer_url}}',
							'target' => '', // we don't want the default _blank target
						),
					),
				),
				'subheader' => array(
					'class'  => 'section--airy  u-text-center',
					'fields' => array(
						'subtitle' => array(
							'type'  => 'h3',
							'value' => esc_html__( 'Learn more', '__plugin_txtd' ),
							'class' => 'section__subtitle'
						),
						'title'    => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Design & Style', '__plugin_txtd' ),
							'class' => 'section__title'
						),
					),
				),
				'colors'    => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Tweaking Colors Schemes', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'Choose colors that resonate with the statement you want to portray. For example, blue inspires safety and peace, while yellow is translated into energy and joyfulness.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Changing Colors', '__plugin_txtd' ),
							'class' => 'btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/style-changes/changing-colors/'
						),
					),
				),

				'fonts' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> '. esc_html__( 'Managing Fonts', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'We recommend you settle on only a few fonts: it\'s best to stick with two fonts but if you\'re feeling ambitious, three is tops.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Changing Fonts', '__plugin_txtd' ),
							'class' => 'btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/style-changes/changing-fonts/'
						),
					),
				),

				'custom_css' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Custom CSS', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'If you\'re looking for changes that are not possible through the current set of options, swing some Custom CSS code to override the default CSS of your theme.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Using the Custom CSS Editor', '__plugin_txtd' ),
							'class' => 'btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/custom-code/using-custom-css-editor'
						),
					),
				),

				'advanced' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Advanced Customizations', '__plugin_txtd' ),
							'class' => 'section__title'
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'If you want to change HTML or PHP code, and keep your changes from being overwritten on the next theme update, the best way is to make them in a child theme.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Using a Child Theme', '__plugin_txtd' ),
							'class' => 'btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/getting-started/using-child-theme'
						),
					),
				),
			),
		),

		'system-status' => array(
			'name'   => 'System Status',
			'blocks' => array(
				'system-status' => array(
					'class'  => 'u-text-center',
					'fields' => array(
						'title'        => array(
							'type'  => 'h2',
							'class' => 'section__title',
							'value' => esc_html__( 'System Status', '__plugin_txtd' ),
						),
						'systemStatus' => array(
							'type'  => 'component',
							'value' => 'system-status'
						),
						'tools'        => array(
							'type'  => 'component',
							'value' => 'pixassist-tools'
						),
					),
				),
			),
		),


	);

	$config['systemStatus'] = array(
		'phpRecommendedVersion'     => 5.6,
		'l10n' => array(
			'title'                     => esc_html__( 'System Status', '__plugin_txtd' ),
			'description'               => esc_html__( 'Allow Pixelgrade to collect non-sensitive diagnostic data and usage information. This will allow us to provide better assistance when you reach us through our support system. Thanks!', '__plugin_txtd' ),
			'phpOutdatedNotice'         => esc_html__( 'This version is a little old. We recommend you update to PHP ', '__plugin_txtd' ),
			'wordpressOutdatedNoticeContent' => esc_html__( 'We recommend you update to the latest and greatest WordPress version.', '__plugin_txtd' ),
			'updateAvailable' => esc_html__( 'There\'s an update available!', '__plugin_txtd' ),
			'themeLatestVersion' => esc_html__( 'You are running the latest version of {{theme_name}}', '__plugin_txtd' ),
			'wpUpdateAvailable1' => esc_html__( 'There\'s an update available!', '__plugin_txtd' ),
			'wpUpdateAvailable2' => esc_html__( 'Follow this link to update.', '__plugin_txtd' ),
			'wpVersionOk' => esc_html__( 'Great!', '__plugin_txtd' ),
			'phpUpdateNeeded1' => esc_html__( 'Your PHP version isn\'t supported anymore!', '__plugin_txtd' ),
			'phpUpdateNeeded2' => esc_html__( 'Please update to a newer PHP version', '__plugin_txtd' ),
			'phpVersionOk' => esc_html__( 'Your PHP version is OK.', '__plugin_txtd' ),
			'mysqlUpdateNeeded1' => esc_html__( 'Your MySQL version isn\'t supported anymore!', '__plugin_txtd' ),
			'mysqlUpdateNeeded2' => esc_html__( 'Please update to a newer MySQL version', '__plugin_txtd' ),
			'mysqlVersionOk' => esc_html__( 'Your MySQL version is OK.', '__plugin_txtd' ),
			'dbCharsetIssue' => esc_html__( 'You might have problems with emoji!', '__plugin_txtd' ),
			'dbCharsetOk' => esc_html__( 'Go all out emoji-style!', '__plugin_txtd' ),
			'tableWPDataTitle' => esc_html__( 'WordPress Install Data', '__plugin_txtd' ),
			'tableSystemDataTitle' => esc_html__( 'System Data', '__plugin_txtd' ),
			'tableActivePluginsTitle' => esc_html__( 'Active Plugins', '__plugin_txtd' ),
			'resetPluginButtonLabel' => esc_html__( 'Reset Pixelgrade Assistant Plugin Data', '__plugin_txtd' ),
			'resetPluginDescription' => esc_html__( 'In case you run into trouble, you can reset the plugin data and start over. No content will be lost.', '__plugin_txtd' ),
			'resetPluginConfirmationMessage' => esc_html__( "Are you sure you want to reset Pixelgrade Assistant?\n\n\nOK, just do this simple calculation: ", '__plugin_txtd' ),
		)
	);

	$config['pluginManager'] = array(
		'l10n' => array(
			'updateButton' => esc_html__( 'Update', '__plugin_txtd' ),
			'installFailedMessage' => esc_html__( 'I could not install the plugin! You will need to install it manually from the plugins page!', '__plugin_txtd' ),
			'activateFailedMessage' => esc_html__( 'I could not activate the plugin! You need to activate it manually from the plugins page!', '__plugin_txtd' ),
			'pluginReady' => esc_html__( 'Plugin ready!', '__plugin_txtd' ),
			'pluginUpdatingMessage' => esc_html__( 'Updating ...', '__plugin_txtd' ),
			'pluginUpToDate' => esc_html__( 'Plugin up to date!', '__plugin_txtd' ),
		),
	);

	$config['starterContent'] = array(
		'l10n' => array(
			'importTitle' => esc_html__( '{{theme_name}} Demo Content', '__plugin_txtd' ),
			'importContentDescription' => esc_html__( 'Import the content from the theme demo.', '__plugin_txtd' ),
			'noSources' => esc_html__( 'Unfortunately, we don\'t have any starter content sources right now.', '__plugin_txtd' ),
			'alreadyImportedConfirm' => esc_html__( 'The Starter Content was already imported! Are you sure you want to import it again?', '__plugin_txtd' ),
			'alreadyImportedDenied' => esc_html__( 'It\'s OK!', '__plugin_txtd' ),
			'importingData' => esc_html__( 'Getting data ...', '__plugin_txtd' ),
			'somethingWrong' => esc_html__( 'Something went wrong!', '__plugin_txtd' ),
			'errorMessage' => esc_html__( "Starter Content is not available right now!\nPlease try again later!", '__plugin_txtd' ),
			'mediaAlreadyExistsTitle' => esc_html__( 'Media already exists!', '__plugin_txtd' ),
			'mediaAlreadyExistsContent' => esc_html__( 'We won\'t import again as there is no need to!', '__plugin_txtd' ),
			'mediaImporting' => esc_html__( 'Importing media: ', '__plugin_txtd' ),
			'postsAlreadyExistTitle' => esc_html__( 'Posts already exist!', '__plugin_txtd' ),
			'postsAlreadyExistContent' => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'postImporting' => esc_html__( 'Importing ', '__plugin_txtd' ),
			'taxonomiesAlreadyExistTitle' => esc_html__( 'Taxonomies (like categories) already exist!', '__plugin_txtd' ),
			'taxonomiesAlreadyExistContent' => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'taxonomyImporting' => esc_html__( 'Importing taxonomy: ', '__plugin_txtd' ),
			'widgetsAlreadyExistTitle' => esc_html__( 'Widgets already exist!', '__plugin_txtd' ),
			'widgetsAlreadyExistContent' => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'widgetsImporting' => esc_html__( 'Importing widgets ...', '__plugin_txtd' ),
			'importingPreSettings' => esc_html__( 'Preparing the scene for awesomeness...', '__plugin_txtd' ),
			'importingPostSettings' => esc_html__( 'Wrapping it up... ', '__plugin_txtd' ),
			'importSuccessful' => esc_html__( 'Successfully Imported!', '__plugin_txtd' ),
			'imported' => esc_html__( 'Imported', '__plugin_txtd' ),
			'import' => esc_html__( 'Import', '__plugin_txtd' ),
		),
	);

	$config['knowledgeBase'] = array(
		'selfHelp'   => array(
			'name'   => esc_html__( 'Self Help', '__plugin_txtd' ),
			'blocks' => array(
				'search' => array(
					'class'  => 'support-autocomplete-search',
					'fields' => array(
						'placeholder' => esc_html__( 'Search through the Knowledge Base', '__plugin_txtd' )
					),
				),
				'info'   => array(
					'class'  => '',
					'fields' => array(
						'title'     => array(
							'type'  => 'h1',
							'value' => esc_html__( 'Theme Help & Support', '__plugin_txtd' ),
						),
						'content_free_theme'   => array(
							'type'  => 'text',
							'value' => wp_kses_post( __( 'Your site is <strong>connected to {{shopdomain}}.</strong> This means you\'re able to get <strong>premium support service.</strong><br>We strive to answer as fast as we can, but sometimes it can take a day or two. Be sure to check out the documentation in order to <strong>get quick answers</strong> in no time. Chances are it\'s <strong>already been answered!</strong>', '__plugin_txtd' ) ),
							'applicableTypes' => array(
								"theme_wporg",
								"theme_modular_wporg",
							)
						),
						'subheader' => array(
							'type'  => 'h2',
							'value' => esc_html__( 'How can we help?', '__plugin_txtd' )
						),
					),
				),
			),
		),
		'openTicket' => array(
			'name'   => esc_html__( 'Open Ticket', '__plugin_txtd' ),
			'blocks' => array(
				'topics'        => array(
					'class'  => '',
					'fields' => array(
						'title'  => array(
							'type'  => 'h1',
							'value' => esc_html__( 'What can we help with?', '__plugin_txtd' )
						),
						'topics' => array(
							'class'  => 'topics-list',
							'fields' => array(
								'start'          => array(
									'type'  => 'text',
									'value' => esc_html__( 'I have a question about how to start', '__plugin_txtd' )
								),
								'feature'        => array(
									'type'  => 'text',
									'value' => esc_html__( 'I have a question about how a distinct feature works', '__plugin_txtd' )
								),
								'plugins'        => array(
									'type'  => 'text',
									'value' => esc_html__( 'I have a question about plugins', '__plugin_txtd' )
								),
								'productUpdates' => array(
									'type'  => 'text',
									'value' => esc_html__( 'I have a question about theme updates', '__plugin_txtd' )
								),
							),
						),
					),
				),
				'ticket'        => array(
					'class'  => '',
					'fields' => array(
						'title'             => array(
							'type'  => 'h1',
							'value' => esc_html__( 'Give us more details', '__plugin_txtd' )
						),
						'changeTopic'       => array(
							'type'  => 'button',
							'label' => esc_html__( 'Change Topic', '__plugin_txtd' ),
							'class' => 'btn__dark',
							'url'   => '#'
						),
						'descriptionHeader' => array(
							'type'  => 'text',
							'value' => esc_html__( 'How can we help?', '__plugin_txtd' )
						),
						'descriptionInfo'   => array(
							'type'  => 'text',
							'class' => 'label__more-info',
							'value' => esc_html__( 'Briefly describe how we can help.', '__plugin_txtd' )
						),
						'detailsHeader'     => array(
							'type'  => 'text',
							'value' => esc_html__( 'Tell Us More', '__plugin_txtd' )
						),
						'detailsInfo'       => array(
							'type'  => 'text',
							'class' => 'label__more-info',
							'value' => wp_kses_post( __( 'Share all the details. Be specific and include some steps to recreate things and help us get to the bottom of things more quickly! Use a free service like <a href="http://imgur.com/" target="_blank">Imgur</a> or <a href="http://tinypic.com/" target="_blank">Tinypic</a> to upload files and include the link.', '__plugin_txtd' ) ),
						),
						'nextButton'        => array(
							'type'  => 'button',
							'label' => esc_html__( 'Next Step', '__plugin_txtd' ),
							'class' => 'form-row submit-wrapper',
						),
					),
				),
				'searchResults' => array(
					'class'  => '',
					'fields' => array(
						'title'       => array(
							'type'  => 'h1',
							'value' => esc_html__( 'Try these solutions first', '__plugin_txtd' )
						),
						'description' => array(
							'type'  => 'text',
							'value' => esc_html__( 'Based on the details you provided, we found a set of articles that could help you instantly. Before you submit a ticket, please check these resources first:', '__plugin_txtd' )
						),
						'noResults'   => array(
							'type'  => 'text',
							'value' => esc_html__( 'Sorry, we couldn\'t find any articles suitable for your question. Submit your ticket using the button below.', '__plugin_txtd' )
						),
					),
				),
				'sticky'        => array(
					'class'  => 'notification__blue clear sticky',
					'fields' => array(
						'notConnected'       => array(
							'type'  => 'text',
							'value' => esc_html__( 'Please connect to {{shopdomain}} in order to be able to submit tickets.', '__plugin_txtd' ),
						),
						'initialQuestion' => array(
							'type'  => 'text',
							'value' => esc_html__( 'Did any of the above resources answer your question?', '__plugin_txtd' ),
						),
						'success'         => array(
							'type'  => 'text',
							'value' => '😊 ' . esc_html__( 'Yaaay! You did it by yourself!', '__plugin_txtd' ),
						),
						'noSuccess'       => array(
							'type'  => 'text',
							'value' => '😕 ' . esc_html__( 'Sorry we couldn\'t find an helpful answer.', '__plugin_txtd' ),
						),
						'submitTicket'    => array(
							'type'  => 'button',
							'label' => esc_html__( 'Submit ticket', '__plugin_txtd' ),
							'class' => 'btn__dark'
						),
						'cancelSubmitTicket'    => array(
							'type'  => 'button',
							'label' => esc_html__( 'Cancel', '__plugin_txtd' ),
							'class' => 'btn__dark'
						),
					),
				),
			),
		),
		'l10n' => array(
			'selfHelp' => esc_html__( 'Self Help', '__plugin_txtd' ),
			'searchResults' => esc_html__( 'Search Results', '__plugin_txtd' ),
			'closeLabel' => esc_html__( 'Close', '__plugin_txtd' ),
			'backLabel' => esc_html__( 'Back to Self Help', '__plugin_txtd' ),
			'missingTicketDetails' => esc_html__( 'Customer service is a two-way street. Help us help you and everyone wins. Please fill the boxes with relevant details.', '__plugin_txtd' ),
			'missingTicketDescription' => esc_html__( 'You have not described how can we help out. Please enter a description in the box above.', '__plugin_txtd' ),
			'searchingMessage' => esc_html__( 'Hang tight! We\'re searching for the best results.', '__plugin_txtd' ),
			'emailMessage' => esc_html__( 'the email used to register on {{shopdomain}}.', '__plugin_txtd' ),
			'ticketSendSuccessTitle' => esc_html__( '👍 Thanks!', '__plugin_txtd' ),
			'ticketSendSuccessContent' => esc_html__( 'Your ticket was successfully delivered! As soon as a member of our crew has had a chance to review it they will be in touch with you at', '__plugin_txtd' ),
			'ticketSendSuccessGreeting' => esc_html__( 'Cheers!', '__plugin_txtd' ),
			'ticketSendingLabel' => esc_html__( 'Submitting the ticket...', '__plugin_txtd' ),
			'backTo' => esc_html__( 'Back to ', '__plugin_txtd' ),
			'articleHelpfulQuestion' => esc_html__( 'Was this article helpful?', '__plugin_txtd' ),
			'articleNotHelpful' => esc_html__( 'We\'re sorry to hear that. How can we improve this article?', '__plugin_txtd' ),
			'articleHelpful' => esc_html__( 'Great! We\'re happy to hear about that.', '__plugin_txtd' ),
			'articleHelpfulYesLabel' => esc_html__( 'Yes', '__plugin_txtd' ),
			'articleHelpfulNoLabel' => esc_html__( 'No', '__plugin_txtd' ),
			'sendFeedbackLabel' => esc_html__( 'Send Feedback', '__plugin_txtd' ),
			'sendFeedbackPlaceholder' => esc_html__( 'Send Feedback', '__plugin_txtd' ),
			'notConnectedTitle' => esc_html__( 'Not connected!', '__plugin_txtd' ),
			'notConnectedContent' => esc_html__( 'You haven\'t connected to {{shopdomain}} yet! Go to your Pixelgrade Dashboard to connect.', '__plugin_txtd' ),
			'dashboardButtonLabel' => esc_html__( 'Pixelgrade Dashboard', '__plugin_txtd' ),
			'backToSelfHelpLabel' => esc_html__( 'Back to Self Help', '__plugin_txtd' ),
			'searchFieldLabel' => esc_html__( 'Search the knowledge base', '__plugin_txtd' ),
			'searchNoResultsMessage' => esc_html__( 'Sorry - we couldn\'t find any results in our docs matching your search query.', '__plugin_txtd' ),
			'errorGetSelection' => esc_html__( 'An error has occurred while trying to get your selection.', '__plugin_txtd' ),
			'backToMainSection' => esc_html__( 'Back to your main section', '__plugin_txtd' ),
			'errorFetchCategories' => esc_html__( 'Could not fetch categories!', '__plugin_txtd' ),
			'errorFetchArticles' => esc_html__( 'Something went wrong while fetching the knowledge base articles for this theme. If the error persists, please create a ticket from the Open Ticket tab.', '__plugin_txtd' ),
		),
	);

	// the authenticator config is based on the component status which can be: not_validated, loading, validated
	$config['authentication'] = array(
		//general strings
		'title'               => esc_html__( 'You are almost finished!', '__plugin_txtd' ),
		// validated string
		'validatedTitle'      => '<span class="c-icon c-icon--success"></span> ' . esc_html__( 'Site connected! You\'re all set 👌', '__plugin_txtd' ),
		'validatedContent'    => wp_kses_post( __( '<strong>Well done, {{username}}!</strong> Your site is successfully connected to {{shopdomain}} and all the tools are available to make it shine.', '__plugin_txtd' ) ),
		//  not validated strings
		'notValidatedContent' => wp_kses_post( __( 'In order to get access to <strong>premium support, starter content, in-dashboard documentation,</strong> and many others, your site needs to have <strong>an active connection</strong> to {{shopdomain}}.<br/><br/>This <strong>does not mean</strong> we gain direct (admin) access to this site. You remain the only one who can log in and make changes. <strong>Connecting means</strong> that this site and {{shopdomain}} share a few details needed to communicate securely.', '__plugin_txtd' ) ),
		'notValidatedButton'  => esc_html__( 'Connect to {{shopdomain}}', '__plugin_txtd' ),
		// no themes from shop
		'noThemeContent'      => esc_html__( 'Ups! You are logged in, but it seems you don\'t have a license for this theme yet.', '__plugin_txtd' ),
		'noThemeRetryButton'  => esc_html__( 'Retry to activate', '__plugin_txtd' ),
		'noThemeLicense'      => esc_html__( 'You don\'t seem to have any licenses for this theme', '__plugin_txtd' ),
		// Not our theme or broken beyond recognition
		'brokenTitle'      => esc_html__( 'Huston, we have a problem.. Really!', '__plugin_txtd' ),
		'brokenContent'    => wp_kses_post( __( 'This doesn\'t seem to be <strong>a Pixelgrade theme.</strong> Are you sure you are <strong>using the original theme code</strong>?<br/><strong>We can\'t activate this theme</strong> in it\'s current state.<br/><br/>Reach us at <a href="mailto:help@pixelgrade.com?Subject=Help%20with%20broken%20theme" target="_top">help@pixelgrade.com</a> if you need further help.', '__plugin_txtd' ) ),
		// loading strings
		'loadingTitle' => esc_html__( 'Connection in progress', '__plugin_txtd' ),
		'loadingContent'      => esc_html__( 'Getting a couple of details to make sure everything is working and secure...', '__plugin_txtd' ),
		'loadingPrepare'      => esc_html__( 'Preparing...', '__plugin_txtd' ),
		'loadingError'        => esc_html__( 'Sorry... I can\'t do this right now!', '__plugin_txtd' ),
		// license urls
		'buyThemeUrl'         => esc_url( trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'pricing' ),
		'renewLicenseUrl'     => esc_url( trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'my-account' )
	);

	$update_core = get_site_transient( 'update_core' );

	if ( ! empty( $update_core->updates ) && ! empty( $update_core->updates[0] ) ) {
		$new_update                                     = $update_core->updates[0];
		$config['systemStatus']['wpRecommendedVersion'] = $new_update->current;
	}

	$config = apply_filters( 'pixassist_default_config', $config );

	return $config;
}
