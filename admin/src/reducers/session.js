import {createStore} from 'redux';
import _ from 'lodash';

// Initiate the default state
export const getDefaultState = () => {
	let state = {
		is_logged: false,
		has_license: false,
		is_active: false,
		is_expired: false,
		is_wizard_next: true,
		is_wizard_skip: false,
		is_support_active: false,
		is_pixelgrade_theme: false,
		is_next_button_disabled: false,
        hasOriginalDirName: false,
        hasOriginalStyleName: false,
		hasPxgTheme: pixassist.themeSupports.hasPxgTheme, // this means that there is a Pixelgrade theme installed, not necessarily active
		themeName: _.get(pixassist,'themeSupports.theme_name', 'pixelgrade'),
		themeTitle: _.get(pixassist,'themeSupports.theme_title', 'pixelgrade'),
		themeId: _.get(pixassist, 'themeSupports.theme_id', ''),
		themeType: _.get(pixassist,'themeSupports.theme_type', 'theme'),
	};

    if (pixassist.themeSupports.theme_integrity && pixassist.themeSupports.theme_integrity.has_original_directory) {
        state.hasOriginalDirName = pixassist.themeSupports.theme_integrity.has_original_directory;
    }

    if (pixassist.themeSupports.theme_integrity && pixassist.themeSupports.theme_integrity.has_original_name) {
        state.hasOriginalStyleName = pixassist.themeSupports.theme_integrity.has_original_name;
    }

    if (!_.isUndefined(pixassist.themeSupports.original_slug)) {
    	state.originalSlug = pixassist.themeSupports.original_slug;
	}

	state.is_logged = !_.isUndefined(pixassist.user.pixassist_user_ID);

	state.is_wizard_next = !_.isUndefined(pixassist.user.pixassist_user_ID);

	state.has_license = !!_.get(pixassist, 'themeMod.licenseHash', '' );

	if ( ! _.isUndefined( pixassist.themeMod.licenseType ) ) {
		state.license_type = pixassist.themeMod.licenseType;
	}

	if ( !!_.get( pixassist, 'themeMod.licenseExpiryDate', '' ) ) {
		let mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		let expiry_date = new Date( pixassist.themeMod.licenseExpiryDate );
		state.license_expiry = mlist[ expiry_date.getMonth() ] + ' ' + expiry_date.getDate() + ', ' + expiry_date.getFullYear();
	}

	state.is_active = !!_.get(pixassist, 'themeMod.licenseStatus') && (pixassist.themeMod.licenseStatus === 'active' || pixassist.themeMod.licenseStatus === 'valid');

	// if the user already has the oauth tokens, get them
	if ( !_.isUndefined( pixassist.user ) ) {
		state.user = pixassist.user;
	}

	// if the user already has the oauth tokens, get them
	if ( !_.isUndefined( pixassist.themeMod ) ) {
		state.themeMod = pixassist.themeMod;
	}

	if ( !_.isUndefined( pixassist.themeConfig ) ) {
		state.themeConfig = pixassist.themeConfig;
	}

	state.is_pixelgrade_theme = !!_.get(pixassist,'themeSupports.is_pixelgrade_theme', false);

	return state;
};

// Reducer that manages the state update
const session = ( state = getDefaultState(), action ) => {
	switch ( action.type ) {
		// WPOAUTH1 COMPONENT
		case 'CONNECT_URL_READY':
			return {...state, ...{
				connect_url: action.url,
				user: {...state.user, ...action.user},
			}};
		case 'CONNECT_URL_CLEAR':
			return {...state, ...{
					connect_url: false,
				}};
		case 'CONNECT_OAUTH_TOKEN_CLEAR':
			// Since restOauth1Request will look in pixassist also, we need to clean this too.
			if ( !_.isUndefined(pixassist.user.oauth_token) ) {
				pixassist.user.oauth_token = undefined;
			}
			if ( !_.isUndefined(pixassist.user.oauth_token_secret)) {
				pixassist.user.oauth_token_secret = undefined;
			}

			return {...state, ...{
					user: {...state.user, ...{
							oauth_token: false,
							oauth_token_secret: false
						}}
				}};
		case 'CONNECTED':
			return {...state, ...{
				is_logged: true,
				user: {...state.user, ...action.user},
			}};
		case 'OAUTH_CONNECT_ERROR':
			return {...state, ...{
				oauth_error: true,
			}};
		// AUTHENTICATOR
		case 'HAS_LICENSE':
			return {...state, ...{
				is_logged: true,
				has_license: true
			}};
		case 'NO_LICENSE':
			return {...state, ...{
				is_logged: true,
				has_license: false
			}};
		case 'VALIDATED_LICENSE':
			return {...state, ...{
				is_logged: true,
				has_license: true,
				is_active: true,
				themeMod: {
					licenseHash: action.license.license_hash,
					licenseStatus: action.license.license_status,
					licenseType: action.license.license_type,
					licenseExpiryDate: action.license.license_expiry_date,
				},
				license_type: action.license.license_type,
				license_status: action.license.license_status,
				license_expiry: action.license.license_expiry_date
			}};
		case 'EXPIRED_LICENSE':
			return {...state, ...{
				is_logged: true,
				has_license: true,
				is_active: false,
				is_expired: true,
				themeMod: {
					licenseHash: action.license.license_hash,
					licenseStatus: action.license.license_status,
					licenseType: action.license.license_type,
					licenseExpiryDate: action.license.license_expiry_date,
				},
				license_type: action.license.license_type,
				license_status: action.license.license_status,
				license_expiry: action.license.license_expiry_date
			}};
		case 'DISCONNECTED':
			return {...state, ...{
				is_logged: false,
				has_license: false,
				is_active: false,
				user: {},
			}};
		// LOADERS
		case 'LOADING':
			return {...state, ...{
				loading: true
			}};
		case 'LOADING_LICENSES':
			return {...state, ...{
				loading: true,
				loadingLicenses: true,
			}};
		case 'LOADING_DONE':
			return {...state, ...{
				loading: false
			}};
		// SETUP WIZARD
		case 'IS_SETUP_WIZARD':
			return {...state, ...{
				is_wizard: true
			}};
		case 'NEXT_BUTTON_AVAILABLE':
			return {...state, ...{
				is_wizard_next: true
			}};
		case 'NEXT_BUTTON_UNAVAILABLE':
			return {...state, ...{
				is_wizard_next: false
			}};
		case 'NEXT_BUTTON_DISABLED':
			return {...state, ...{
				is_next_button_disabled: action.value
			}};
		case 'SKIP_BUTTON_AVAILABLE':
			return {...state, ...{
				is_wizard_skip: true,
			}};
		case 'SKIP_BUTTON_UNAVAILABLE':
			return {...state, ...{
				is_wizard_skip: false,
			}};
		// WIZARD -> Theme Selector
		case 'ON_SELECTED_THEME':
			return {...state, ...{
				is_theme_selected: true,
				selected_theme: action.theme_name
			}};
		case 'ON_INSTALLED_THEME':
			return {...state, ...{
				is_theme_installed: true,
				selected_theme: action.theme_name
			}};
		case 'ON_ACTIVATED_THEME':
			return {...state, ...{
				is_theme_activated: true,
				selected_theme: action.newState.themeName,
				// now the general info that is likely to change on theme activation
				has_license: action.newState.has_license,
				is_active: action.newState.is_active,
				is_support_active: action.newState.is_support_active,
				is_pixelgrade_theme: action.newState.is_pixelgrade_theme,
				hasOriginalDirName: action.newState.hasOriginalDirName,
				hasOriginalStyleName: action.newState.hasOriginalStyleName,
				hasPxgTheme: action.newState.hasPxgTheme,
				themeName: action.newState.themeName,
				themeTitle: action.newState.themeTitle,
				themeId: action.newState.themeId,
				themeType: action.newState.themeType,
			}};
		case 'ON_UPDATED_THEME_MOD':
			return {...state, ...getDefaultState()};
		case 'ON_UPDATED_LOCALIZED':
			return {...state, ...getDefaultState()};
		// WIZARD -> Plugins
		case 'ON_PLUGINS_INSTALLING':
			return {...state, ...{
					are_plugins_installing: true,
					are_plugins_installed: false,
				}};
		case 'ON_PLUGINS_INSTALLED':
			return {...state, ...{
					are_plugins_installing: false,
					are_plugins_installed: true,
				}};
		// WIZARD -> STARTER CONTENT
		case 'STARTER_CONTENT_INSTALLING':
			return {...state, ...{
					is_sc_installing: true,
					is_sc_done: false,
				}};
		case 'STARTER_CONTENT_DONE':
			return {...state, ...{
					is_sc_installing: false,
					is_sc_done: true,
				}};
		default:
			return state;
	}
};

// Create the redux store for the app
const sessionStore = createStore(session);

sessionStore.subscribe(() => {
    let currentState = sessionStore.getState();

	// Change the license's state
	if (currentState.user) {

		// Trigger a custom event to force the support component update
		let licenseStateChangeEvent = new CustomEvent('licenseStateChange', {
			detail: currentState
		});

		// Dispatch the license change event
		window.dispatchEvent(licenseStateChangeEvent);
	}
});

export default sessionStore;
