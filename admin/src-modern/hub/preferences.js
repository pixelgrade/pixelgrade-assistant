export const PREVIEW_SIZE_MIN_COLUMNS = 1;
export const PREVIEW_SIZE_MAX_COLUMNS = 4;
export const PREVIEW_SIZE_DEFAULT_COLUMNS = 2;

export const LAYOUT_UNIT_PREFERENCES_STORAGE_KEY = 'pixassist_layout_units_preferences';
export const CONTENT_PATTERN_PREFERENCES_STORAGE_KEY = 'pixassist_content_patterns_preferences';
export const PREVIEW_MODE_STORAGE_KEY = 'pixassist_preview_mode';

export const DEFAULT_LAYOUT_UNIT_PREFERENCES = Object.freeze( {
	typeFilter: 'all',
	sourceFilter: 'all',
	viewMode: 'grid',
	columns: 2,
} );

export const DEFAULT_CONTENT_PATTERN_PREFERENCES = Object.freeze( {
	typeFilter: 'all',
	sourceFilter: 'all',
	viewMode: 'grid',
	columns: 2,
} );

function getBrowserStorage() {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	try {
		return window.localStorage || null;
	} catch ( e ) {
		return null;
	}
}

function readStorage( storage, key ) {
	if ( ! storage || 'function' !== typeof storage.getItem ) {
		return null;
	}

	try {
		return storage.getItem( key );
	} catch ( e ) {
		return null;
	}
}

function writeStorage( storage, key, value ) {
	if ( ! storage || 'function' !== typeof storage.setItem ) {
		return;
	}

	try {
		storage.setItem( key, value );
	} catch ( e ) {} // eslint-disable-line no-empty
}

function parseObject( value ) {
	if ( ! value || 'string' !== typeof value ) {
		return {};
	}

	try {
		const parsed = JSON.parse( value );
		return parsed && 'object' === typeof parsed && ! Array.isArray( parsed ) ? parsed : {};
	} catch ( e ) {
		return {};
	}
}

function normalizeStringPreference( value, fallback ) {
	return 'string' === typeof value && value ? value : fallback;
}

function normalizeColumnsPreference( value, fallback ) {
	const parsed = parseInt( value, 10 );

	return parsed >= PREVIEW_SIZE_MIN_COLUMNS && parsed <= PREVIEW_SIZE_MAX_COLUMNS ? parsed : fallback;
}

export function normalizeLayoutUnitPreferences( preferences ) {
	const input = preferences && 'object' === typeof preferences && ! Array.isArray( preferences ) ? preferences : {};

	return {
		typeFilter: normalizeStringPreference( input.typeFilter, DEFAULT_LAYOUT_UNIT_PREFERENCES.typeFilter ),
		sourceFilter: normalizeStringPreference( input.sourceFilter, DEFAULT_LAYOUT_UNIT_PREFERENCES.sourceFilter ),
		viewMode: [ 'grid', 'list' ].includes( input.viewMode ) ? input.viewMode : DEFAULT_LAYOUT_UNIT_PREFERENCES.viewMode,
		columns: normalizeColumnsPreference( input.columns, DEFAULT_LAYOUT_UNIT_PREFERENCES.columns ),
	};
}

export function normalizeContentPatternPreferences( preferences ) {
	const input = preferences && 'object' === typeof preferences && ! Array.isArray( preferences ) ? preferences : {};

	return {
		typeFilter: normalizeStringPreference( input.typeFilter, DEFAULT_CONTENT_PATTERN_PREFERENCES.typeFilter ),
		sourceFilter: normalizeStringPreference( input.sourceFilter, DEFAULT_CONTENT_PATTERN_PREFERENCES.sourceFilter ),
		viewMode: [ 'grid', 'list' ].includes( input.viewMode ) ? input.viewMode : DEFAULT_CONTENT_PATTERN_PREFERENCES.viewMode,
		columns: normalizeColumnsPreference( input.columns, DEFAULT_CONTENT_PATTERN_PREFERENCES.columns ),
	};
}

export function getLayoutUnitPreferences( storage = getBrowserStorage() ) {
	return normalizeLayoutUnitPreferences( parseObject( readStorage( storage, LAYOUT_UNIT_PREFERENCES_STORAGE_KEY ) ) );
}

export function getContentPatternPreferences( storage = getBrowserStorage() ) {
	return normalizeContentPatternPreferences( parseObject( readStorage( storage, CONTENT_PATTERN_PREFERENCES_STORAGE_KEY ) ) );
}

export function saveLayoutUnitPreferences( preferences, storage = getBrowserStorage() ) {
	const normalized = normalizeLayoutUnitPreferences( preferences );

	writeStorage( storage, LAYOUT_UNIT_PREFERENCES_STORAGE_KEY, JSON.stringify( normalized ) );

	return normalized;
}

export function saveContentPatternPreferences( preferences, storage = getBrowserStorage() ) {
	const normalized = normalizeContentPatternPreferences( preferences );

	writeStorage( storage, CONTENT_PATTERN_PREFERENCES_STORAGE_KEY, JSON.stringify( normalized ) );

	return normalized;
}

export function setLayoutUnitPreference( key, value, storage = getBrowserStorage() ) {
	const current = getLayoutUnitPreferences( storage );

	if ( ! Object.prototype.hasOwnProperty.call( DEFAULT_LAYOUT_UNIT_PREFERENCES, key ) ) {
		return current;
	}

	return saveLayoutUnitPreferences( {
		...current,
		[ key ]: value,
	}, storage );
}

export function setContentPatternPreference( key, value, storage = getBrowserStorage() ) {
	const current = getContentPatternPreferences( storage );

	if ( ! Object.prototype.hasOwnProperty.call( DEFAULT_CONTENT_PATTERN_PREFERENCES, key ) ) {
		return current;
	}

	return saveContentPatternPreferences( {
		...current,
		[ key ]: value,
	}, storage );
}

export function normalizePreviewMode( mode, fallback = 'site' ) {
	return 'demo' === mode || 'site' === mode ? mode : fallback;
}

export function getPreviewMode( storage = getBrowserStorage() ) {
	// Default new users (no stored choice) to the starter's polished DEMO, not their own (often
	// near-empty) site — otherwise a first-time user sees every layout in its plainest form (bare
	// site title repeated, default fonts, no imagery) and the catalog undersells itself. Their own
	// choice persists once they switch.
	return normalizePreviewMode( readStorage( storage, PREVIEW_MODE_STORAGE_KEY ), 'demo' );
}

export function savePreviewMode( mode, storage = getBrowserStorage() ) {
	const normalized = normalizePreviewMode( mode, getPreviewMode( storage ) );

	writeStorage( storage, PREVIEW_MODE_STORAGE_KEY, normalized );

	return normalized;
}
