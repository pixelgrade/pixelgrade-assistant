/**
 * Shared Anima LT install + activation flow for Home onboarding and Site Setup.
 *
 * Installation uses WordPress core's `wp.updates.installTheme`; activation follows the
 * nonce-protected core URL localized by PHP. No package URL or custom privileged endpoint is
 * exposed by Assistant.
 */

function normalizeActionUrl( url ) {
	return ( url || '' ).replace( /&amp;/g, '&' );
}

function isNetworkEnableUrl( url ) {
	return /(?:\?|&)action=enable(?:&|$)/.test( normalizeActionUrl( url ) );
}

export function canManageThemeSetup( theme ) {
	if ( ! theme || ! theme.slug ) {
		return false;
	}

	if ( 'active' === theme.status || theme.isActive ) {
		return true;
	}

	if ( theme.isInstalled || 'inactive' === theme.status ) {
		return false !== theme.canActivate;
	}

	return Boolean(
		! theme.isMultisite &&
			false !== theme.canAutoInstall &&
			false !== theme.canInstall &&
			false !== theme.canActivate
	);
}

export function hasThemeUpdatesApi() {
	return Boolean(
		typeof window !== 'undefined' &&
			window.wp &&
			window.wp.updates &&
			typeof window.wp.updates.installTheme === 'function'
	);
}

/**
 * Ensure the default theme is installed and active.
 *
 * @param {Object} theme Default theme descriptor localized by PHP.
 * @param {Object} event Optional click event used by WordPress's filesystem-credentials helper.
 * @return {Promise<void>}
 */
export function ensureThemeActive( theme, event ) {
	return new Promise( ( resolve, reject ) => {
		if ( ! theme || ! theme.slug ) {
			reject( new Error( 'invalid_theme' ) );
			return;
		}

		if ( 'active' === theme.status || theme.isActive ) {
			resolve();
			return;
		}

		if ( ! canManageThemeSetup( theme ) ) {
			reject( new Error( theme.isInstalled ? 'activate_unavailable' : 'install_unavailable' ) );
			return;
		}

		const activate = ( url ) => {
			const activateUrl = normalizeActionUrl( url || theme.activateUrl );

			if ( ! activateUrl || typeof window === 'undefined' || typeof window.fetch !== 'function' ) {
				reject( new Error( 'activate_unavailable' ) );
				return;
			}

			// Core's multisite install response may point at Network Admin on another origin. Browser
			// automation cannot safely carry WordPress auth across that boundary, so PHP gates missing
			// multisite installs to an explicit Network Themes hand-off. Keep this defense for stale data.
			if ( isNetworkEnableUrl( activateUrl ) ) {
				reject( new Error( 'multisite_manual_setup' ) );
				return;
			}

			window
				.fetch( activateUrl, { credentials: 'same-origin' } )
				.then( ( response ) => {
					if ( ! response.ok ) {
						throw new Error( 'activate_failed' );
					}
				} )
				.then( () => resolve() )
				.catch( () => reject( new Error( 'activate_failed' ) ) );
		};

		if ( 'inactive' === theme.status || ( theme.isInstalled && ! theme.isActive ) ) {
			activate( theme.activateUrl );
			return;
		}

		if ( ! hasThemeUpdatesApi() ) {
			reject( new Error( 'install_unavailable' ) );
			return;
		}

		if ( window.wp.updates.maybeRequestFilesystemCredentials ) {
			window.wp.updates.maybeRequestFilesystemCredentials( event );
		}

		window.wp.updates.installTheme( {
			slug: theme.slug,
			success: ( response ) => activate( response && response.activateUrl ? response.activateUrl : theme.activateUrl ),
			error: () => reject( new Error( 'install_failed' ) ),
		} );
	} );
}
