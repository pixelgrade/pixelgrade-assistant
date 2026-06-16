<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pixassist_get_default_config( $original_theme_slug ) {
	// General strings ready to be translated
	$config['l10n'] = array(
		'returnToDashboard'                             => esc_html__( 'Continue to your WordPress dashboard', '__plugin_txtd' ),
		'nextButton'                                    => esc_html__( 'Continue', '__plugin_txtd' ),
		'skipButton'                                    => esc_html__( 'Skip this step', '__plugin_txtd' ),
		'notRightNow'                                   => esc_html__( 'Not right now', '__plugin_txtd' ),
		'validationErrorTitle'                          => esc_html__( 'Something went wrong', '__plugin_txtd' ),
		'themeValidationNoticeFail'                     => esc_html__( 'Not activated.', '__plugin_txtd' ),
		'themeValidationNoticeOk'                       => esc_html__( 'Connected & up-to-date!', '__plugin_txtd' ),
		'themeValidationNoticeOutdatedWithUpdate'       => esc_html__( 'Your theme is outdated, but an update is available!', '__plugin_txtd' ),
		'themeValidationNoticeNotConnected'             => esc_html__( 'Not connected', '__plugin_txtd' ),
		'themeUpdateAvailableTitle'                     => esc_html__( 'New theme update is available!', '__plugin_txtd' ),
		'themeUpdateAvailableContent'                   => esc_html__( 'Great news! There is a new version of {{theme_name}} available.', '__plugin_txtd' ),
		'hashidNotFoundNotice'                          => esc_html__( 'Sorry but we could not recognize your theme. This might have happened because you have made changes to the functions.php file. If that is the case - please try to revert to the original contents of that file and retry to validate your theme license.', '__plugin_txtd' ),
		'themeUpdateButton'                             => esc_html__( 'Update now', '__plugin_txtd' ),
		'themeChangelogLink'                            => esc_html__( 'View changelog', '__plugin_txtd' ),
		'Error500Text'                                  => esc_html__( 'Oh, snap! Something went wrong and we are unable to make sense of the actual problem.', '__plugin_txtd' ),
		'Error500Link'                                  => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/guides-and-resources/server-errors-handling',
		'Error400Text'                                  => esc_html__( 'There is something wrong with the current setup of this WordPress installation.', '__plugin_txtd' ),
		'Error400Link'                                  => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/guides-and-resources/server-errors-handling',
		'themeDirectoryChangedTitle'                    => esc_html__( 'Your theme DIRECTORY is changed!', '__plugin_txtd' ),
		'themeDirectoryChanged'                         => wp_kses_post( __( 'This will give you <strong>all kinds of trouble</strong> when installing updates for the theme. To be able to <strong>successfully install updates</strong> please <strong>change the theme\'s directory</strong> from "{{template}}" to "{{original_slug}}".', '__plugin_txtd' ) ),
		'themeNameChangedTitle'                         => esc_html__( 'Your theme NAME is changed!', '__plugin_txtd' ),
		'themeNameChanged'                              => wp_kses_post( __( 'The theme name specified in the "style.css" file in the theme\'s directory is <strong>"{{stylecss_theme_name}}".</strong> The next time you <strong>update your theme</strong> this name will be <strong>changed back to "{{theme_name}}".</strong>', '__plugin_txtd' ) ),
		'childThemeNameChanged'                         => wp_kses_post( __( 'On your next theme update, your parent theme name will be <strong>changed back to its original one: "{{stylecss_theme_name}}".</strong> To avoid issues with your child theme, you will need to <strong>update the style.css file of both your parent and child theme</strong> with <strong>the original theme name: "{{theme_name}}".</strong>', '__plugin_txtd' ) ),
		'setupWizardTitle'                              => esc_html__( 'Site setup wizard', '__plugin_txtd' ),
		'internalErrorTitle'                            => esc_html__( 'An internal server error has occurred', '__plugin_txtd' ),
		'internalErrorContent'                          => esc_html__( 'Something went wrong while trying to process your request. Please try again.', '__plugin_txtd' ),
		'componentUnavailableTitle'                     => esc_html__( 'Unavailable', '__plugin_txtd' ),
		'componentUnavailableContent'                   => esc_html__( 'This feature is available only if your site is connected to {{shopdomain}}.', '__plugin_txtd' ),
		'pluginInstallLabel'                            => esc_html__( 'Install', '__plugin_txtd' ),
		'pluginActivateLabel'                           => esc_html__( 'Activate', '__plugin_txtd' ),
		'pluginUpdateLabel'                             => esc_html__( 'Update', '__plugin_txtd' ),
		'pluginsPlural'                                 => esc_html__( 'selected plugins', '__plugin_txtd' ),
		'starterContentImportLabel'                     => esc_html__( 'Import starter content', '__plugin_txtd' ),
		'starterContentImportSelectedLabel'             => esc_html__( 'Import selected', '__plugin_txtd' ),
		'setupWizardWelcomeTitle'                       => esc_html__( 'Welcome to the site setup wizard', '__plugin_txtd' ),
		'setupWizardWelcomeContent'                     => esc_html__( 'This quick, optional setup helps you install recommended free plugins and load helpful demo content. It\'s safe and fast — and you can skip it anytime.', '__plugin_txtd' ),
		'setupWizardStartButtonLabel'                   => esc_html__( 'Let\'s get started!', '__plugin_txtd' ),
	);

	$config['setupWizard'] = array(

		'plugins' => array(
			'stepName' => esc_html__( 'Plugins', '__plugin_txtd' ),
			'blocks'   => array(
				'plugins' => array(
					'class'  => 'full white',
					'fields' => array(
						'title'             => array(
							'type'             => 'h2',
							'value'            => esc_html__( 'Set up the right plugins', '__plugin_txtd' ),
							'value_installing' => esc_html__( 'Setting up plugins..', '__plugin_txtd' ),
							'value_installed'  => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'All done with plugins!', '__plugin_txtd' ) . ' 🤩',
							'class'            => 'section__title',
						),
						'head_content'      => array(
							'type'             => 'text',
							'value'            => esc_html__( 'Install and activate the plugins that provide recommended functionality for your site. You can add or remove plugins later on from within the WordPress dashboard.', '__plugin_txtd' ),
							'value_installing' => wp_kses_post( __( 'Why not take a peek at our <a href="https://twitter.com/pixelgrade" target="_blank">Twitter page</a> while you wait? (opens in a new tab and the plugins aren\'t going anywhere)', '__plugin_txtd' ) ),
							'value_installed'  => esc_html__( 'You made it! 🙌 You\'ve installed and activated the plugins. You are good to jump to the next step.', '__plugin_txtd' ),
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

		'support' => array(
			'stepName' => esc_html__( 'Starter content', '__plugin_txtd' ),
			'nextText' => esc_html__( 'Next Step', '__plugin_txtd' ),
			'blocks'   => array(
				'support' => array(
					'class'  => 'full white',
					'fields' => array(
						'title'          => array(
							'type'             => 'h2',
							'value'            => esc_html__( 'Import starter content', '__plugin_txtd' ),
							'value_installing' => esc_html__( 'Importing starter content..', '__plugin_txtd' ),
							'value_installed'  => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'Starter content imported!', '__plugin_txtd' ),
							'value_errored'    => '<span class="c-icon  c-icon--large  c-icon--warning"></span> ' . esc_html__( 'Starter content could not be imported!', '__plugin_txtd' ),
							'class'            => 'section__title',
						),
						'head_content'   => array(
							'type'             => 'text',
							'value'            => esc_html__( 'Use the demo content to make your site look as eye-candy as the theme\'s demo. The importer helps you have a strong starting point for your content and speed up the entire process.', '__plugin_txtd' ),
							'value_installing' => wp_kses_post( __( 'Why not join our <a href="https://www.facebook.com/groups/PixelGradeUsersGroup/" target="_blank">Facebook Group</a> while you wait? (opens in a new tab)', '__plugin_txtd' ) ),
							'value_installed'  => esc_html__( 'Mission accomplished! 👍 You\'ve successfully imported the starter content, so you\'re good to move forward. Have fun!', '__plugin_txtd' ),
							'value_errored'    => esc_html__( 'Sadly, errors have happened and the started content could not be imported at this time. Please try again in a little while or reach out to our support crew.', '__plugin_txtd' ),
						),
						'starterContent' => array(
							'type'  => 'component',
							'value' => 'starter-content',
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
							'class' => 'section__title',
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
							'value' => esc_html__( 'Next steps', '__plugin_txtd' ),
						),
						'cta'   => array(
							'type'  => 'button',
							'class' => 'btn btn--large',
							'label' => esc_html__( 'View and Customize', '__plugin_txtd' ),
							'url'   => '{{customizer_url}}?return=' . urlencode( admin_url( 'admin.php?page=pixelgrade_assistant' ) ),
						),
					),
				),

				'help_links' => array(
					'class'  => 'half',
					'fields' => array(
						'title' => array(
							'type'  => 'h4',
							'value' => esc_html__( 'Learn more', '__plugin_txtd' ),
						),
						'links' => array(
							'type'  => 'links',
							'value' => array(
								array(
									'label' => esc_html__( 'Browse the Theme Documentation', '__plugin_txtd' ),
									'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/',
								),
								array(
									'label' => esc_html__( 'Learn How to Use WordPress', '__plugin_txtd' ),
									'url'   => 'https://easywpguide.com',
								),
								array(
									'label' => esc_html__( 'Get Help and Support', '__plugin_txtd' ),
									'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'get-support/',
								),
								array(
									'label' => esc_html__( 'Join our Facebook group', '__plugin_txtd' ),
									'url'   => 'https://www.facebook.com/groups/PixelGradeUsersGroup/',
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
				'plugins'        => array(
					'fields'       => array(
						'recommended_plugins' => array(
							'type'  => 'component',
							'value' => 'recommended-plugins',
						),
					),
				),
				'starterContent' => array(
					'fields'       => array(
						'title'          => array(
							'type'             => 'h2',
							'value'            => esc_html__( 'Starter content', '__plugin_txtd' ),
							'value_installing' => esc_html__( 'Starter content importing..', '__plugin_txtd' ),
							'value_installed'  => '<span class="c-icon  c-icon--large  c-icon--success-auth"></span> ' . esc_html__( 'Starter content imported!', '__plugin_txtd' ),
							'value_errored'    => '<span class="c-icon  c-icon--large  c-icon--warning"></span> ' . esc_html__( 'Starter content could not be imported!', '__plugin_txtd' ),
							'class'            => 'section__title',
						),
						'head_content'   => array(
							'type'             => 'text',
							'value'            => esc_html__( 'Use the demo content to make your site look as eye-candy as the theme\'s demo. The importer helps you have a strong starting point for your content and speed up the entire process.', '__plugin_txtd' ),
							'value_installing' => wp_kses_post( __( 'Why not join our <a href="https://www.facebook.com/groups/PixelGradeUsersGroup/" target="_blank">Facebook Group</a> while you wait? (opens in a new tab)', '__plugin_txtd' ) ),
							'value_installed'  => esc_html__( 'Mission accomplished! 👍 You\'ve successfully imported the starter content, so you\'re good to move forward. Have fun!', '__plugin_txtd' ),
							'value_errored'    => esc_html__( 'Sadly, errors have happened and the started content could not be imported at this time. Please try again in a little while or reach out to our support crew.', '__plugin_txtd' ),
						),
						'starterContent' => array(
							'type'  => 'component',
							'value' => 'starter-content',
						),
					),
				),
				'pixelgradePlus' => array(
					'class'  => 'full',
					'fields' => array(
						'title'   => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Pixelgrade Plus', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => wp_kses_post( __( 'Pixelgrade Plus is the optional premium companion for the Pixelgrade LT stack — advanced design tools that build on everything in the free stack. You can keep using the free stack for as long as you like; Plus is here when you want more.', '__plugin_txtd' ) ),
							'class' => 'section__content',
						),
						'cta'     => array(
							'type'   => 'button',
							'class'  => 'btn btn--action  btn--blue',
							'label'  => esc_html__( 'Explore Pixelgrade Plus', '__plugin_txtd' ),
							'url'    => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'plus/',
							'target' => '_blank',
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
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'We know that each website needs to have an unique voice in tune with your charisma. That\'s why we created a smart options system to easily make handy color changes, spacing adjustments and balancing fonts, each step bringing you closer to a striking result.', '__plugin_txtd' ),
							'class' => 'section__content',
						),
						'cta'     => array(
							'type'   => 'button',
							'class'  => 'btn btn--action  btn--green',
							'label'  => esc_html__( 'Access the Customizer', '__plugin_txtd' ),
							'url'    => '{{customizer_url}}',
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
							'class' => 'section__subtitle',
						),
						'title'    => array(
							'type'  => 'h2',
							'value' => esc_html__( 'Design & Style', '__plugin_txtd' ),
							'class' => 'section__title',
						),
					),
				),
				'colors'    => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Tweaking Colors Schemes', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'Choose colors that resonate with the statement you want to portray. For example, blue inspires safety and peace, while yellow is translated into energy and joyfulness.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Changing Colors', '__plugin_txtd' ),
							'class' => 'btn btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/style-changes/changing-colors/',
						),
					),
				),

				'fonts' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Managing Fonts', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'We recommend you settle on only a few fonts: it\'s best to stick with two fonts but if you\'re feeling ambitious, three is tops.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Changing Fonts', '__plugin_txtd' ),
							'class' => 'btn btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/style-changes/changing-fonts/',
						),
					),
				),

				'custom_css' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Custom CSS', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'If you\'re looking for changes that are not possible through the current set of options, swing some Custom CSS code to override the default CSS of your theme.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Using the Custom CSS Editor', '__plugin_txtd' ),
							'class' => 'btn btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/design-and-style/custom-code/using-custom-css-editor',
						),
					),
				),

				'advanced' => array(
					'class'  => 'half sections-grid__item',
					'fields' => array(
						'title'   => array(
							'type'  => 'h4',
							'value' => '<img class="emoji" alt="🎨" src="https://s.w.org/images/core/emoji/2.2.1/svg/1f3a8.svg"> ' . esc_html__( 'Advanced Customizations', '__plugin_txtd' ),
							'class' => 'section__title',
						),
						'content' => array(
							'type'  => 'text',
							'value' => esc_html__( 'If you want to change HTML or PHP code, and keep your changes from being overwritten on the next theme update, the best way is to make them in a child theme.', '__plugin_txtd' ),
						),
						'cta'     => array(
							'type'  => 'button',
							'label' => esc_html__( 'Using a Child Theme', '__plugin_txtd' ),
							'class' => 'btn btn--action btn--small  btn--blue',
							'url'   => trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'docs/getting-started/using-child-theme',
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
							'value' => 'system-status',
						),
						'tools'        => array(
							'type'  => 'component',
							'value' => 'pixassist-tools',
						),
					),
				),
			),
		),
	);

	$config['systemStatus'] = array(
		'phpRecommendedVersion' => 5.6,
		'l10n'                  => array(
			'title'                          => esc_html__( 'System Status', '__plugin_txtd' ),
			'description'                    => esc_html__( 'Allow Pixelgrade to collect non-sensitive diagnostic data and usage information about your WordPress install. This is entirely optional and helps us improve the free Pixelgrade stack. Thanks!', '__plugin_txtd' ),
			'phpOutdatedNotice'              => esc_html__( 'This version is a little old. We recommend you update to PHP ', '__plugin_txtd' ),
			'wordpressOutdatedNoticeContent' => esc_html__( 'We recommend you update to the latest and greatest WordPress version.', '__plugin_txtd' ),
			'updateAvailable'                => esc_html__( 'There\'s an update available!', '__plugin_txtd' ),
			'themeLatestVersion'             => esc_html__( 'You are running the latest version of {{theme_name}}', '__plugin_txtd' ),
			'wpUpdateAvailable1'             => esc_html__( 'There\'s an update available!', '__plugin_txtd' ),
			'wpUpdateAvailable2'             => esc_html__( 'Follow this link to update.', '__plugin_txtd' ),
			'wpVersionOk'                    => esc_html__( 'Great!', '__plugin_txtd' ),
			'phpUpdateNeeded1'               => esc_html__( 'Your PHP version isn\'t supported anymore!', '__plugin_txtd' ),
			'phpUpdateNeeded2'               => esc_html__( 'Please update to a newer PHP version', '__plugin_txtd' ),
			'phpVersionOk'                   => esc_html__( 'Your PHP version is OK.', '__plugin_txtd' ),
			'mysqlUpdateNeeded1'             => esc_html__( 'Your MySQL version isn\'t supported anymore!', '__plugin_txtd' ),
			'mysqlUpdateNeeded2'             => esc_html__( 'Please update to a newer MySQL version', '__plugin_txtd' ),
			'mysqlVersionOk'                 => esc_html__( 'Your MySQL version is OK.', '__plugin_txtd' ),
			'dbCharsetIssue'                 => esc_html__( 'You might have problems with emoji!', '__plugin_txtd' ),
			'dbCharsetOk'                    => esc_html__( 'Go all out emoji-style!', '__plugin_txtd' ),
			'tableWPDataTitle'               => esc_html__( 'WordPress Install Data', '__plugin_txtd' ),
			'tableSystemDataTitle'           => esc_html__( 'System Data', '__plugin_txtd' ),
			'tableActivePluginsTitle'        => esc_html__( 'Active Plugins', '__plugin_txtd' ),
			'resetPluginButtonLabel'         => esc_html__( 'Reset Pixelgrade Assistant Plugin Data', '__plugin_txtd' ),
			'resetPluginDescription'         => esc_html__( 'In case you run into trouble, you can reset the plugin data and start over. No content will be lost.', '__plugin_txtd' ),
			'resetPluginConfirmationMessage' => esc_html__( "Are you sure you want to reset Pixelgrade Assistant?\n\n\nOK, just do this simple calculation: ", '__plugin_txtd' ),
		),
	);

	$config['pluginManager'] = array(
		'l10n' => array(
			'updateButton'              => esc_html__( 'Update', '__plugin_txtd' ),
			'installFailedMessage'      => esc_html__( 'I could not install the plugin! You will need to install it manually from the plugins page!', '__plugin_txtd' ),
			'activateFailedMessage'     => esc_html__( 'I could not activate the plugin! You need to activate it manually from the plugins page!', '__plugin_txtd' ),
			'pluginReady'               => esc_html__( 'Plugin ready!', '__plugin_txtd' ),
			'pluginUpdatingMessage'     => esc_html__( 'Updating ...', '__plugin_txtd' ),
			'pluginInstallingMessage'   => esc_html__( 'Installing ...', '__plugin_txtd' ),
			'pluginActivatingMessage'   => esc_html__( 'Activating ...', '__plugin_txtd' ),
			'pluginUpToDate'            => esc_html__( 'Plugin up to date!', '__plugin_txtd' ),
			'tgmpActivatedSuccessfully' => esc_html__( 'The following plugin was activated successfully:', '__plugin_txtd' ),
			'tgmpPluginActivated'       => esc_html__( 'Plugin activated successfully.', '__plugin_txtd' ),
			'tgmpPluginAlreadyActive'   => esc_html__( 'No action taken. Plugin was already active.', '__plugin_txtd' ),
			'tgmpNotAllowed'            => esc_html__( 'Sorry, you are not allowed to access this page.', '__plugin_txtd' ),
			'groupByRequiredLabels'     => array(
				'required'    => esc_html__( 'Core plugins needed for your website (required).', '__plugin_txtd' ),
				'recommended' => esc_html__( 'Recommended plugins to enhance your website.', '__plugin_txtd' ),
			),
			'noPlugins'                 => esc_html__( 'No plugins needed at this time.', '__plugin_txtd' ),
		),
	);

	$config['starterContent'] = array(
		'l10n'               => array(
			'importTitle'                   => esc_html__( '{{theme_name}} demo content', '__plugin_txtd' ),
			'importContentDescription'      => esc_html__( 'Import the content from the theme demo.', '__plugin_txtd' ),
			'noSources'                     => esc_html__( 'Unfortunately, we don\'t have any starter content to go with your theme right now.', '__plugin_txtd' ),
			'alreadyImportedConfirm'        => esc_html__( 'Starter content was already imported! Are you sure you want to import it again?', '__plugin_txtd' ),
			'alreadyImportedDenied'         => esc_html__( 'It\'s OK!', '__plugin_txtd' ),
			'importingData'                 => esc_html__( 'Getting data about available content...', '__plugin_txtd' ),
			'somethingWrong'                => esc_html__( 'Something went wrong!', '__plugin_txtd' ),
			'errorMessage'                  => esc_html__( "This starter content is not available right now.\nPlease try again later!", '__plugin_txtd' ),
			'mediaAlreadyExistsTitle'       => esc_html__( 'Media already exists!', '__plugin_txtd' ),
			'mediaAlreadyExistsContent'     => esc_html__( 'We won\'t import again as there is no need to!', '__plugin_txtd' ),
			'mediaImporting'                => esc_html__( 'Importing media: ', '__plugin_txtd' ),
			'postsAlreadyExistTitle'        => esc_html__( 'Posts already exist!', '__plugin_txtd' ),
			'postsAlreadyExistContent'      => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'postImporting'                 => esc_html__( 'Importing ', '__plugin_txtd' ),
			'taxonomiesAlreadyExistTitle'   => esc_html__( 'Taxonomies (like categories) already exist!', '__plugin_txtd' ),
			'taxonomiesAlreadyExistContent' => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'taxonomyImporting'             => esc_html__( 'Importing taxonomy: ', '__plugin_txtd' ),
			'widgetsAlreadyExistTitle'      => esc_html__( 'Widgets already exist!', '__plugin_txtd' ),
			'widgetsAlreadyExistContent'    => esc_html__( 'We won\'t import them again!', '__plugin_txtd' ),
			'widgetsImporting'              => esc_html__( 'Importing widgets ...', '__plugin_txtd' ),
			'importingPreSettings'          => esc_html__( 'Preparing the scene for awesomeness...', '__plugin_txtd' ),
			'importingPostSettings'         => esc_html__( 'Wrapping it up... ', '__plugin_txtd' ),
			'importSuccessful'              => esc_html__( 'Successfully Imported!', '__plugin_txtd' ),
			'imported'                      => esc_html__( 'Imported', '__plugin_txtd' ),
			'import'                        => esc_html__( 'Import', '__plugin_txtd' ),
			'importSelected'                => esc_html__( 'Import selected', '__plugin_txtd' ),
			'stop'                          => esc_html__( 'Pause import', '__plugin_txtd' ),
			'resume'                        => esc_html__( 'Resume import', '__plugin_txtd' ),
			'stoppedMessage'                => esc_html__( 'Currently paused...', '__plugin_txtd' ),
		),
		'defaultSceRestPath' => 'wp-json/sce/v2',
		// this will be appended to the starter content source URL if we are not given a baseRestUrl
	);

	// the recommended plugins config is based on the component status which can be: not_validated, loading, validated
	$config['recommendedPlugins'] = array(
		// general strings
		'title'            => esc_html__( 'Manage plugins', '__plugin_txtd' ),
		'content'          => esc_html__( '{{theme_name}} recommends these plugins so you can take full advantage of everything that it offers.', '__plugin_txtd' ),
		// validated string
		'validatedTitle'   => '<span class="c-icon c-icon--success"></span> ' . esc_html__( 'Plugins ready 🧘️', '__plugin_txtd' ),
		'validatedContent' => wp_kses_post( __( 'You can rest assured that {{theme_name}} can do its best for you and your site.', '__plugin_txtd' ) ),
	);

	// Local recommended companions for the free LT stack — installed from WordPress.org by slug.
	// Filterable so the team / a commercial build can adjust the list (e.g. add Style Manager once
	// it is re-published on wp.org, or add account-gated companions via Pixelgrade Plus).
	$config['requiredPlugins'] = array(
		'plugins' => apply_filters( 'pixassist_recommended_plugins', array(
			array(
				'name'        => 'Nova Blocks',
				'slug'        => 'nova-blocks',
				'required'    => false,
				'order'       => 10,
				'selected'    => true,
				'description' => esc_html__( 'Beautiful, flexible content blocks that power the Pixelgrade LT design experience.', '__plugin_txtd' ),
			),
		) ),
	);

	$update_core = get_site_transient( 'update_core' );

	if ( ! empty( $update_core->updates ) && ! empty( $update_core->updates[0] ) ) {
		$new_update                                     = $update_core->updates[0];
		$config['systemStatus']['wpRecommendedVersion'] = $new_update->current;
	}

	// Adapt the Pixelgrade Plus discovery card to the live Plus status (discovery / set up / manage).
	// Plus is the source of truth via the `pixelgrade_assistant_plus_status` contract; Assistant only reads it.
	if ( function_exists( 'pixassist_get_plus_status' ) && ! empty( $config['dashboard']['general']['blocks']['pixelgradePlus']['fields'] ) ) {
		$plus_status = pixassist_get_plus_status();
		if ( ! empty( $plus_status['is_plus_active'] ) ) {
			$plus_url = ! empty( $plus_status['plus_settings_url'] ) ? esc_url_raw( $plus_status['plus_settings_url'] ) : trailingslashit( PIXELGRADE_ASSISTANT__SHOP_BASE ) . 'plus/';
			if ( ! empty( $plus_status['is_plus_licensed'] ) ) {
				$plus_label   = esc_html__( 'Manage Pixelgrade Plus', '__plugin_txtd' );
				$plus_content = wp_kses_post( __( 'Pixelgrade Plus is active. Manage your advanced design tools and settings.', '__plugin_txtd' ) );
			} else {
				$plus_label   = esc_html__( 'Set up Pixelgrade Plus', '__plugin_txtd' );
				$plus_content = wp_kses_post( __( 'Pixelgrade Plus is installed. Activate it to unlock its advanced design tools for your Pixelgrade LT site.', '__plugin_txtd' ) );
			}
			$plus_fields                     = &$config['dashboard']['general']['blocks']['pixelgradePlus']['fields'];
			$plus_fields['content']['value'] = $plus_content;
			$plus_fields['cta']['label']     = $plus_label;
			$plus_fields['cta']['url']        = $plus_url;
			$plus_fields['cta']['target']    = ''; // internal admin URL — not a new tab
			unset( $plus_fields );
		}
	}

	$config = apply_filters( 'pixassist_default_config', $config );

	return $config;
}
