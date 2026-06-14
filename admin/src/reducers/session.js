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
		is_wizard_skip: true,
		is_support_active: false,
		is_pixelgrade_theme: false,
		is_next_button_disabled: false,
        hasOriginalDirName: false,
        hasOriginalStyleName: false,
		hasPxgTheme: _.get(pixassist, 'themeSupports.hasPxgTheme', false), // this means that there is a Pixelgrade theme installed, not necessarily active
		themeName: _.get(pixassist,'themeSupports.theme_name', 'pixelgrade'),
		themeTitle: _.get(pixassist,'themeSupports.theme_title', 'pixelgrade'),
		themeId: _.get(pixassist, 'themeSupports.theme_id', ''),
		themeType: _.get(pixassist,'themeSupports.theme_type', 'theme'),
	};

	state.hasOriginalDirName = _.get(pixassist, 'themeSupports.theme_integrity.has_original_directory', false);
	state.hasOriginalStyleName = _.get(pixassist, 'themeSupports.theme_integrity.has_original_name', false);

    if (!_.isUndefined(pixassist.themeSupports.original_slug)) {
    	state.originalSlug = pixassist.themeSupports.original_slug;
	}

	// Account connection is owned by Pixelgrade Plus (M2 R4); Assistant never reports a connected account.
	state.is_logged = false;

	// The setup wizard must never require a Pixelgrade account to proceed; the Connect step is optional.
	state.is_wizard_next = true;

	// License & entitlement are owned by Pixelgrade Plus (M2 R3); Assistant never reports a license.
	state.has_license = false;

	if ( ! _.isUndefined( pixassist.themeMod.licenseType ) ) {
		state.license_type = pixassist.themeMod.licenseType;
	}

	if ( !!_.get( pixassist, 'themeMod.licenseExpiryDate', '' ) ) {
		let mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		let expiry_date = new Date( pixassist.themeMod.licenseExpiryDate );
		state.license_expiry = mlist[ expiry_date.getMonth() ] + ' ' + expiry_date.getDate() + ', ' + expiry_date.getFullYear();
	}

	state.is_active = false; // Active-license/entitlement state is owned by Pixelgrade Plus (M2 R3).

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
					did_plugins_install: true,
					are_plugins_installing: true,
					are_plugins_installed: false,
				}};
		case 'ON_PLUGINS_INSTALLED':
			return {...state, ...{
					are_plugins_installing: false,
					are_plugins_installed: true,
				}};
		case 'ON_PLUGINS_READY':
			return {...state, ...{
					are_plugins_installing: false,
					are_plugins_installed: true,
					are_plugins_ready: true,
				}};
		// WIZARD -> STARTER CONTENT
		case 'STARTER_CONTENT_INSTALLING':
			return {...state, ...{
					is_sc_installing: true,
					is_sc_done: false,
					is_sc_errored: false,
					is_sc_stopped: false,
				}};
		case 'STARTER_CONTENT_DONE':
			return {...state, ...{
					is_sc_installing: false,
					is_sc_done: true,
					is_sc_errored: false,
				}};
		case 'STARTER_CONTENT_ERRORED':
			return {...state, ...{
					is_sc_installing: false,
					is_sc_done: true,
					is_sc_errored: true,
				}};
		case 'STARTER_CONTENT_STOP':
			return {...state, ...{
					is_sc_stopped: true,
				}};
		case 'STARTER_CONTENT_RESUME':
			return {...state, ...{
					is_sc_stopped: false,
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
