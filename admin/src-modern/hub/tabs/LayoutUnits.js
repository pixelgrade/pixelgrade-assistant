/**
 * The granular Layouts tab.
 *
 * Lets an admin mix headers, footers, and templates from multiple starter sources without running the
 * full starter-content import.
 */
import { createElement, Fragment, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, Icon, Modal, Notice } from '@wordpress/components';
import { check, fullscreen } from '@wordpress/icons';
import { DemoLiveLink, LayoutPreview, PreviewModeToggle } from '../LayoutPreview';
import { LibraryToolbar } from '../LibraryToolbar';
import { getLayoutUnitPreferences, saveLayoutUnitPreferences } from '../preferences';

const DEFAULT_LAYOUT_UNITS = {
	copy: {
		title: __( 'Layouts', 'pixelgrade_assistant' ),
		description: __( 'Apply a single reusable part — a header, footer, or full page template — without importing a whole site. For complete ready-made pages, use Page Patterns; for an entire site, use Starter Sites.', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load layouts', 'pixelgrade_assistant' ),
		loading: __( 'Loading layouts...', 'pixelgrade_assistant' ),
		empty: __( 'No layouts are available from these sources.', 'pixelgrade_assistant' ),
		failure: __( 'Layouts could not be loaded. Please try again.', 'pixelgrade_assistant' ),
		partialFailure: __( 'Some layout sources could not be loaded.', 'pixelgrade_assistant' ),
		loadStepPrepare: __( 'Preparing', 'pixelgrade_assistant' ),
		loadStepList: __( 'Loading list', 'pixelgrade_assistant' ),
		loadStepPrewarm: __( 'Preparing parts', 'pixelgrade_assistant' ),
		loadStepReady: __( 'Ready', 'pixelgrade_assistant' ),
		importLabel: __( 'Apply', 'pixelgrade_assistant' ),
		replaceLabel: __( 'Replace', 'pixelgrade_assistant' ),
		importing: __( 'Applying layout...', 'pixelgrade_assistant' ),
		importSuccess: __( 'Layout applied.', 'pixelgrade_assistant' ),
		importFailure: __( 'Layout could not be applied. Please try again.', 'pixelgrade_assistant' ),
		applyStepPrepare: __( 'Preparing', 'pixelgrade_assistant' ),
		applyStepPreparedJob: __( 'Prepared job', 'pixelgrade_assistant' ),
		applyStepQueue: __( 'Queueing job', 'pixelgrade_assistant' ),
		applyStepApply: __( 'Applying', 'pixelgrade_assistant' ),
		applyStepRefresh: __( 'Refreshing', 'pixelgrade_assistant' ),
		applyStepReady: __( 'Ready', 'pixelgrade_assistant' ),
		undoLabel: __( 'Remove', 'pixelgrade_assistant' ),
		undoing: __( 'Removing layout...', 'pixelgrade_assistant' ),
		undoSuccess: __( 'Layout removed.', 'pixelgrade_assistant' ),
		undoFailure: __( 'Layout could not be removed. Please try again.', 'pixelgrade_assistant' ),
		appliedTitle: __( 'Applied layouts', 'pixelgrade_assistant' ),
		appliedEmpty: __( 'No layouts are applied yet.', 'pixelgrade_assistant' ),
		appliedLabel: __( 'Applied', 'pixelgrade_assistant' ),
		appliedButton: __( 'Applied', 'pixelgrade_assistant' ),
		headers: __( 'Headers', 'pixelgrade_assistant' ),
		footers: __( 'Footers', 'pixelgrade_assistant' ),
		templatesType: __( 'Templates', 'pixelgrade_assistant' ),
		features: __( 'Features', 'pixelgrade_assistant' ),
		featureLabel: __( 'Feature', 'pixelgrade_assistant' ),
		sampleLabel: __( 'Include sample projects', 'pixelgrade_assistant' ),
		sourceHeading: __( 'Source', 'pixelgrade_assistant' ),
		premiumLabel: __( 'Premium', 'pixelgrade_assistant' ),
		freeLabel: __( 'Free', 'pixelgrade_assistant' ),
		previewLabel: __( 'Expand', 'pixelgrade_assistant' ),
		previewFull: __( 'Open the full layout at full height', 'pixelgrade_assistant' ),
		templateParts: __( 'Template parts', 'pixelgrade_assistant' ),
		refreshLabel: __( 'Refresh', 'pixelgrade_assistant' ),
		refreshTitle: __( 'Reload layouts from your starters', 'pixelgrade_assistant' ),
		activeBadge: __( 'Active', 'pixelgrade_assistant' ),
		sectionNoneApplied: __( 'None applied yet', 'pixelgrade_assistant' ),
	},
	sources: [],
	endpoints: {},
	applied: {},
};

const LAYOUT_UNIT_JOB_POLL_INTERVAL = 300;
const LAYOUT_UNIT_JOB_TIMEOUT = 120000;

/**
 * Session cache for the (remote) layout list plus the current `applied` snapshot, keyed by the
 * source-set. The Layouts tab unmounts/remounts as the admin navigates the hub; a module-level
 * variable survives those remounts so re-entering the tab rehydrates the grid instantly — no
 * re-fetch of the remote sources and no re-prewarm. It lives for the page session only (cleared on
 * a full reload). Refresh bypasses it by calling loadUnits() directly.
 */
let layoutUnitsCache = null;

function getSourcesKey( sources ) {
	return sources
		.map( ( source ) => source.id )
		.sort()
		.join( '|' );
}

function getLayoutUnitsData() {
	if ( typeof window !== 'undefined' && window.pixelgradeLayoutUnits ) {
		return window.pixelgradeLayoutUnits;
	}

	return DEFAULT_LAYOUT_UNITS;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_LAYOUT_UNITS.copy,
		...( copy || {} ),
	};
}

function getPixassistRest() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest ) {
		return window.pixassist.wpRest;
	}

	return {};
}

function getRestHeaders() {
	const rest = getPixassistRest();
	const headers = {
		'Content-Type': 'application/json',
	};

	if ( rest.nonce ) {
		headers[ 'X-WP-Nonce' ] = rest.nonce;
	}

	return headers;
}

function getEndpoint( data, key ) {
	if ( data.endpoints && data.endpoints[ key ] ) {
		return data.endpoints[ key ];
	}

	const rest = getPixassistRest();
	return rest.endpoint && rest.endpoint[ key ] ? rest.endpoint[ key ] : {};
}

async function fetchJson( url, options = {} ) {
	const response = await window.fetch( url, options );

	if ( ! response.ok ) {
		throw new Error( 'status ' + response.status );
	}

	return response.json();
}

async function restRequest( data, key, payload ) {
	const endpoint = getEndpoint( data, key );
	const rest = getPixassistRest();

	if ( ! endpoint.url ) {
		throw new Error( 'missing_endpoint_' + key );
	}

	const response = await fetchJson( endpoint.url, {
		method: endpoint.method || 'POST',
		credentials: 'same-origin',
		headers: getRestHeaders(),
		body: JSON.stringify( {
			...payload,
			pixassist_nonce: rest.pixassist_nonce || '',
		} ),
	} );

	if ( response && response.code && 'success' !== response.code ) {
		throw new Error( response.message || response.code );
	}

	return response;
}

function delay( milliseconds ) {
	return new Promise( ( resolve ) => {
		window.setTimeout( resolve, milliseconds );
	} );
}

function normalizeApplied( applied ) {
	if ( ! applied || 'object' !== typeof applied || Array.isArray( applied ) ) {
		return {};
	}

	return applied;
}

/**
 * The catalog "type group" (slot key) for a wp_template unit — the server sends `unit.type_group`.
 * Variant siblings (`single`, `single-magazine`) share a type_group; CPT families (`single-portfolio`)
 * stay their own. Falls back to the raw slug so the grid still works against an un-upgraded source.
 * Non-template units (parts/features) have no type_group.
 *
 * @param {Object} unit Unit descriptor.
 * @return {string} The type_group for templates, otherwise ''.
 */
function getTypeGroup( unit ) {
	if ( unit && 'wp_template' === unit.type ) {
		return unit.type_group || unit.slug || '';
	}

	return '';
}

// The slot a unit occupies. Mirrors PHP get_layout_unit_slot_key(): templates key on their
// type_group (so applying one variant replaces its siblings — "one frame per type"); parts/features
// key on their slug. ALL slot-key reconstruction must route through here so JS and PHP cannot drift.
function getSlotKey( unit ) {
	const type = unit && unit.type ? unit.type : '';
	const slug = unit && unit.slug ? unit.slug : '';

	if ( 'wp_template' === type ) {
		const group = getTypeGroup( unit );

		return group ? 'wp_template:' + group : '';
	}

	return type && slug ? type + ':' + slug : '';
}

// Per-CARD identity: unique per variant (slug), unlike getSlotKey which is group-level (type_group)
// so siblings share one applied slot. Used for React keys + the busy/operation indicator so two
// variant cards from the same source don't alias each other.
function getCardKey( unit, sourceId ) {
	const slug = unit && ( unit.slug || unit.id ) ? unit.slug || unit.id : '';
	const src = sourceId || ( unit && unit.source && unit.source.id ? unit.source.id : '' );
	return ( unit && unit.type ? unit.type : '' ) + ':' + slug + ':' + src;
}

/**
 * Is THIS specific card (its source + slug) the unit currently applied to its slot? A slot can be
 * filled by another source — that is "applied but not current".
 *
 * @param {Object} unit    Unit descriptor (carries `.source`).
 * @param {Object} applied Map of slot key -> applied unit.
 * @return {boolean} True when this exact unit is the live one.
 */
function isUnitCurrent( unit, applied ) {
	const appliedUnit = applied[ getSlotKey( unit ) ];
	const source = unit.source || {};

	return Boolean( appliedUnit && appliedUnit.demoKey === source.id && appliedUnit.slug === unit.slug );
}

function getSlotTypeLabel( unit, copy ) {
	const slug = unit && unit.slug ? unit.slug : '';

	if ( 'wp_template_part' === unit.type && 'header' === slug ) {
		return __( 'Header', 'pixelgrade_assistant' );
	}

	if ( 'wp_template_part' === unit.type && 'footer' === slug ) {
		return __( 'Footer', 'pixelgrade_assistant' );
	}

	if ( 'wp_template' === unit.type ) {
		return copy.templatesType;
	}

	if ( 'feature' === unit.type ) {
		return copy.featureLabel;
	}

	return __( 'Template part', 'pixelgrade_assistant' );
}

function getGroupKey( unit ) {
	if ( 'feature' === unit.type ) {
		return 'features';
	}

	if ( 'wp_template_part' === unit.type && 'header' === unit.slug ) {
		return 'headers';
	}

	if ( 'wp_template_part' === unit.type && 'footer' === unit.slug ) {
		return 'footers';
	}

	if ( 'wp_template' === unit.type ) {
		return 'templates';
	}

	return 'templateParts';
}

// Display order for the unified browse grid (and for the Type filter dropdown).
const GROUP_ORDER = [ 'headers', 'footers', 'templates', 'features', 'templateParts' ];

/**
 * Flatten the units into a single list ordered headers -> footers -> templates -> features ->
 * template parts, then alphabetically by source within each group.
 *
 * @param {Array} units Raw unit descriptors (each carries a `.source`).
 * @return {Array} A new, ordered array.
 */
function orderedUnits( units ) {
	return units.slice().sort( ( a, b ) => {
		const ga = GROUP_ORDER.indexOf( getGroupKey( a ) );
		const gb = GROUP_ORDER.indexOf( getGroupKey( b ) );
		if ( ga !== gb ) {
			return ga - gb;
		}
		const sa = ( a.source && a.source.title ) || '';
		const sb = ( b.source && b.source.title ) || '';
		return sa.localeCompare( sb );
	} );
}

/**
 * Apply the toolbar filters (free-text search + type + source) to the unit list.
 *
 * @param {Array}  units   Ordered unit descriptors.
 * @param {Object} filters { search, typeFilter, sourceFilter }.
 * @return {Array} The matching subset, in the same order.
 */
function filterUnits( units, { search, typeFilter, sourceFilter } ) {
	const query = ( search || '' ).trim().toLowerCase();

	return units.filter( ( unit ) => {
		if ( typeFilter && 'all' !== typeFilter ) {
			// A `template:<slug>` filter narrows to one template section; any other value is a coarse
			// group key (headers/footers/templates/features/templateParts).
			const matchesType =
				0 === typeFilter.indexOf( TEMPLATE_SECTION_PREFIX )
					? getSectionKey( unit ) === typeFilter
					: getGroupKey( unit ) === typeFilter;

			if ( ! matchesType ) {
				return false;
			}
		}

		const sourceId = unit.source && unit.source.id ? unit.source.id : '';
		if ( sourceFilter && 'all' !== sourceFilter && sourceId !== sourceFilter ) {
			return false;
		}

		if ( query ) {
			const haystack = (
				( unit.title || '' ) +
				' ' +
				( unit.slug || '' ) +
				' ' +
				( unit.source && unit.source.title ? unit.source.title : '' )
			).toLowerCase();
			if ( ! haystack.includes( query ) ) {
				return false;
			}
		}

		return true;
	} );
}

// Headers and footers each share ONE slot across every candidate, and each wp_template SLUG is its
// own slot too — so all of these sections carry a single "Active: <source>" caption. Features and
// other template parts span many distinct slots, so several can be active within them at once.
const SINGLE_SLOT_GROUPS = [ 'headers', 'footers' ];
const TEMPLATE_SECTION_PREFIX = 'template:';

// Friendly names for the common WordPress template type_groups; unknown groups fall back to the
// starter's authored title and then a title-cased slug (e.g. `landing` -> "Landing").
const TEMPLATE_SLUG_LABELS = {
	'front-page': __( 'Front Page', 'pixelgrade_assistant' ),
	home: __( 'Blog Home', 'pixelgrade_assistant' ),
	index: __( 'Index', 'pixelgrade_assistant' ),
	archive: __( 'Archive', 'pixelgrade_assistant' ),
	single: __( 'Single Post', 'pixelgrade_assistant' ),
	singular: __( 'Singular', 'pixelgrade_assistant' ),
	page: __( 'Page', 'pixelgrade_assistant' ),
	search: __( 'Search', 'pixelgrade_assistant' ),
	'404': __( '404', 'pixelgrade_assistant' ),
	'privacy-policy': __( 'Privacy Policy', 'pixelgrade_assistant' ),
	// CPT-bound template families (kept separate from the core single/archive slots).
	'single-portfolio': __( 'Single Project', 'pixelgrade_assistant' ),
	'archive-portfolio': __( 'Projects Archive', 'pixelgrade_assistant' ),
	'taxonomy-portfolio_type': __( 'Project Types', 'pixelgrade_assistant' ),
};

// The order template sub-sections appear in (most-used first); type_groups outside this list sort
// after, alphabetically. CPT families sit beside their core counterpart.
const TEMPLATE_SLUG_ORDER = [ 'front-page', 'home', 'index', 'archive', 'archive-portfolio', 'taxonomy-portfolio_type', 'single', 'single-portfolio', 'singular', 'page', 'search', '404', 'privacy-policy' ];

function titleCaseSlug( slug ) {
	return ( slug || '' )
		.split( /[-_]/ )
		.filter( Boolean )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );
}

// The browse-section key. Templates split one section per type_group (variant siblings share a
// section; CPT families stay their own); every other type keeps its coarse getGroupKey() bucket.
function getSectionKey( unit ) {
	if ( 'wp_template' === unit.type ) {
		return TEMPLATE_SECTION_PREFIX + getTypeGroup( unit );
	}

	return getGroupKey( unit );
}

function getTemplateSectionSlug( sectionKey ) {
	return 0 === sectionKey.indexOf( TEMPLATE_SECTION_PREFIX ) ? sectionKey.slice( TEMPLATE_SECTION_PREFIX.length ) : '';
}

function isSingleSlotSection( sectionKey ) {
	return SINGLE_SLOT_GROUPS.includes( sectionKey ) || 0 === sectionKey.indexOf( TEMPLATE_SECTION_PREFIX );
}

function getGroupLabel( groupKey, copy ) {
	switch ( groupKey ) {
		case 'headers':
			return copy.headers;
		case 'footers':
			return copy.footers;
		case 'templates':
			return copy.templatesType;
		case 'features':
			return copy.features;
		default:
			return copy.templateParts;
	}
}

/**
 * Map of template type_group -> the starter's human-authored title, used to name custom (non-core)
 * template sections — e.g. an unknown `landing` family takes its first informative card title as the
 * section heading. Keyed by type_group (not raw slug) so a custom family with several variant slugs
 * still resolves to one section name. Only titles that add information beyond the group key are kept;
 * the first such title per type_group wins.
 *
 * @param {Array} units Loaded unit descriptors.
 * @return {Object} type_group -> title.
 */
function buildTemplateTitles( units ) {
	const map = {};

	units.forEach( ( unit ) => {
		if ( 'wp_template' !== unit.type ) {
			return;
		}

		const group = getTypeGroup( unit );

		if ( ! group || map[ group ] ) {
			return;
		}

		const title = unit.title || '';

		if ( title && title.toLowerCase() !== group.toLowerCase() ) {
			map[ group ] = title;
		}
	} );

	return map;
}

// Section heading text — a per-slug template name (friendly map for core slugs, the starter's own
// title for custom ones, title-cased slug as a last resort), or the coarse group label otherwise.
function getSectionLabel( sectionKey, copy, templateTitles ) {
	const templateSlug = getTemplateSectionSlug( sectionKey );

	if ( templateSlug ) {
		if ( TEMPLATE_SLUG_LABELS[ templateSlug ] ) {
			return TEMPLATE_SLUG_LABELS[ templateSlug ];
		}

		const title = templateTitles ? templateTitles[ templateSlug ] : '';

		if ( title && title.toLowerCase() !== templateSlug.toLowerCase() ) {
			return title;
		}

		return titleCaseSlug( templateSlug ) || copy.templatesType;
	}

	return getGroupLabel( sectionKey, copy );
}

// The shared slot key behind a single-slot section (used for the filter-independent active caption).
function getSingleSlotKey( sectionKey ) {
	if ( 'headers' === sectionKey ) {
		return 'wp_template_part:header';
	}

	if ( 'footers' === sectionKey ) {
		return 'wp_template_part:footer';
	}

	const templateSlug = getTemplateSectionSlug( sectionKey );

	return templateSlug ? 'wp_template:' + templateSlug : '';
}

/**
 * The source label of the unit currently applied to a single-slot section, read straight from
 * `applied` so it stays correct even when search/source filters hide the matching card.
 *
 * @param {string} sectionKey Section key.
 * @param {Object} applied    Map of slot key -> applied unit.
 * @return {string} Source title (or empty string when nothing is applied / not single-slot).
 */
function getGroupActiveSummary( sectionKey, applied ) {
	const slot = getSingleSlotKey( sectionKey );
	const unit = slot ? applied[ slot ] : null;

	return unit ? unit.sourceTitle || unit.demoKey || '' : '';
}

// Float the active card(s) to the front of a section, otherwise keep the incoming (source-alpha) order.
function pinCurrentFirst( units, applied ) {
	const current = [];
	const rest = [];

	units.forEach( ( unit ) => ( isUnitCurrent( unit, applied ) ? current : rest ).push( unit ) );

	return current.concat( rest );
}

function templateSlugRank( slug ) {
	const index = TEMPLATE_SLUG_ORDER.indexOf( slug );

	return -1 === index ? TEMPLATE_SLUG_ORDER.length : index;
}

// Order template sub-sections: known slugs first (TEMPLATE_SLUG_ORDER), the rest alphabetically.
function compareTemplateSectionKeys( a, b ) {
	const sa = getTemplateSectionSlug( a );
	const sb = getTemplateSectionSlug( b );
	const ra = templateSlugRank( sa );
	const rb = templateSlugRank( sb );

	return ra !== rb ? ra - rb : sa.localeCompare( sb );
}

/**
 * Bucket the (already ordered + filtered) units into browse sections, dropping empties and pinning
 * the active card first within each. Headers, then Footers, then one section per template slug
 * (Front Page, Single Post, …), then Features, then other Template parts.
 *
 * @param {Array}  units   Ordered + filtered unit descriptors.
 * @param {Object} applied Map of slot key -> applied unit.
 * @return {Array} [ { key, units } ] in display order.
 */
function groupUnits( units, applied ) {
	const buckets = {};

	units.forEach( ( unit ) => {
		const key = getSectionKey( unit );
		buckets[ key ] = buckets[ key ] || [];
		buckets[ key ].push( unit );
	} );

	const templateKeys = Object.keys( buckets )
		.filter( ( key ) => 0 === key.indexOf( TEMPLATE_SECTION_PREFIX ) )
		.sort( compareTemplateSectionKeys );
	const orderedKeys = [ 'headers', 'footers' ].concat( templateKeys, [ 'features', 'templateParts' ] );

	return orderedKeys
		.filter( ( key ) => buckets[ key ] && buckets[ key ].length )
		.map( ( key ) => ( {
			key,
			units: pinCurrentFirst( buckets[ key ], applied ),
		} ) );
}

function getPrewarmableUnits( units ) {
	return units
		.filter( ( unit ) => 'wp_template_part' === unit.type && [ 'header', 'footer' ].includes( unit.slug ) )
		.map( ( unit ) => ( {
			type: unit.type,
			slug: unit.slug,
			id: unit.id,
		} ) );
}

function prewarmSourceUnits( data, source, units ) {
	const prewarmUnits = getPrewarmableUnits( units );

	if ( ! prewarmUnits.length || ! getEndpoint( data, 'prewarmUnitBundles' ).url ) {
		return Promise.resolve( null );
	}

	return restRequest( data, 'prewarmUnitBundles', {
		demo_key: source.id,
		url: source.baseRestUrl,
		units: prewarmUnits,
	} ).catch( () => null );
}

// Bundle prewarm accelerates a LATER Apply — it is pure background work, best-effort by design
// (Apply falls back to dynamic discovery when a bundle is not primed). Delay it past the first
// preview wave and run ONE source at a time: firing all sources at once was measured occupying
// every PHP worker for ~5s exactly while the first preview iframes want them.
const PREWARM_DELAY_MS = 4000;

function schedulePrewarm( thunks ) {
	if ( ! thunks.length ) {
		return;
	}

	window.setTimeout( async () => {
		for ( const run of thunks ) {
			try {
				await run();
			} catch ( e ) {} // eslint-disable-line no-empty
		}
	}, PREWARM_DELAY_MS );
}

function getPreviewUrl( unit ) {
	return unit.thumbnail || unit.image || unit.previewImage || unit.previewUrl || '';
}

function renderMessage( message ) {
	if ( ! message ) {
		return null;
	}

	return createElement(
		Notice,
		{
			status: message.type,
			isDismissible: false,
		},
		message.text
	);
}

function renderSourceBadge( source, copy ) {
	return createElement(
		'span',
		{
			style: {
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				color: '#50575e',
				display: 'inline-block',
				fontSize: '11px',
				lineHeight: '16px',
				padding: '0 6px',
			},
		},
		source.gate ? copy.premiumLabel : copy.freeLabel
	);
}

function renderTypeBadge( unit, copy ) {
	return createElement(
		'span',
		{
			style: {
				background: '#f0f0f1',
				borderRadius: '2px',
				color: '#1e1e1e',
				display: 'inline-block',
				fontSize: '11px',
				fontWeight: 500,
				lineHeight: '16px',
				padding: '0 6px',
			},
		},
		getSlotTypeLabel( unit, copy )
	);
}

function getActiveOperationStep( operation ) {
	const operationSteps = operation && Array.isArray( operation.operationSteps ) ? operation.operationSteps : [];

	return operationSteps.find( ( step ) => 'active' === step.status ) || null;
}

function getOperationButtonLabel( operation, key, fallback ) {
	const activeStep = operation && operation.key === key ? getActiveOperationStep( operation ) : null;

	return activeStep && activeStep.label ? activeStep.label : fallback;
}

function UnitCard( { unit, viewMode, applied, busyKey, copy, featureSamples, operation, previewConfig, onFeatureSampleChange, onImport, onPreview, onUndo } ) {
	const slot = getSlotKey( unit );
	const source = unit.source || {};
	const appliedUnit = applied[ slot ];
	const isCurrent = isUnitCurrent( unit, applied );
	const cardKey = getCardKey( unit, source.id );
	const isBusy = busyKey === 'import:' + cardKey;
	const undoBusy = busyKey === 'undo:' + slot;
	const operationKey = 'import:' + cardKey;
	const preview = getPreviewUrl( unit );
	const sampleKey = slot + ':' + source.id;
	const isFeature = 'feature' === unit.type;
	const isPreviewable = 'wp_template_part' === unit.type || 'wp_template' === unit.type;
	const isList = 'list' === viewMode;
	const typeLabel = getSlotTypeLabel( unit, copy );
	// For templates, name the card by its variant (e.g. "Magazine", "Split Header") so siblings in one
	// section are distinguishable; the server sends `variant_label`, with title/slug as fallbacks.
	const titleText = 'wp_template' === unit.type
		? unit.variant_label || unit.title || titleCaseSlug( unit.slug )
		: unit.title || unit.slug || '';
	// Headers/footers carry a generic "Header"/"Footer" title that just repeats the type badge;
	// for those, surface the source as the card title and drop the now-redundant source line.
	const isGenericTitle = titleText.toLowerCase() === typeLabel.toLowerCase();
	const primaryText = isGenericTitle ? source.title : titleText;
	const includeSample = isFeature
		? Object.prototype.hasOwnProperty.call( featureSamples, sampleKey )
			? Boolean( featureSamples[ sampleKey ] )
			: Boolean( unit.sampleDefault )
		: false;

	const applyButton = createElement(
		Button,
		{
			variant: 'primary',
			isBusy,
			disabled: Boolean( busyKey ),
			onClick: () => onImport( unit, { includeSample } ),
			style: { flexShrink: 0, minWidth: '104px' },
		},
		isBusy
			? getOperationButtonLabel( operation, operationKey, copy.importing )
			: appliedUnit
			? copy.replaceLabel
			: copy.importLabel
	);

	// On the active card the useful action is to undo (revert the slot) — this folds in what used to
	// live in the separate "Applied layouts" list.
	const removeButton = createElement(
		Button,
		{
			variant: 'secondary',
			isDestructive: true,
			isBusy: undoBusy,
			disabled: Boolean( busyKey ),
			onClick: () => onUndo( unit, slot ),
			style: { flexShrink: 0, minWidth: '104px' },
		},
		undoBusy ? copy.undoing : copy.undoLabel
	);
	const actionButton = isCurrent ? removeButton : applyButton;

	// "Active" pill in the theme accent — the Site-Editor cue for the part that is currently live.
	const activeBadge = createElement(
		'span',
		{
			style: {
				alignItems: 'center',
				background: 'var(--wp-admin-theme-color, #3858e9)',
				borderRadius: '2px',
				color: '#fff',
				display: 'inline-flex',
				fontSize: '11px',
				fontWeight: 600,
				gap: '2px',
				lineHeight: 1.5,
				padding: '2px 8px 2px 4px',
			},
		},
		createElement( Icon, { icon: check, size: 16 } ),
		copy.activeBadge
	);
	const cardBorderColor = isCurrent ? 'var(--wp-admin-theme-color, #3858e9)' : '#dcdcde';
	const cardRing = isCurrent ? '0 0 0 1px var(--wp-admin-theme-color, #3858e9)' : undefined;

	// "Preview" opens the full-height overlay — most useful for tall templates the card crops.
	const previewButton = isPreviewable && onPreview
		? createElement(
				Button,
				{
					variant: 'tertiary',
					icon: fullscreen,
					onClick: () => onPreview( unit ),
					label: copy.previewFull,
					showTooltip: true,
					style: { flexShrink: 0 },
				},
				copy.previewLabel
		  )
		: null;

	// On a non-active card whose slot is already filled by another source, hint what it would replace.
	const appliedNote = appliedUnit && ! isCurrent
		? createElement(
				'span',
				{ style: { color: '#646970', fontSize: '12px' } },
				copy.appliedLabel + ': ' + ( appliedUnit.sourceTitle || appliedUnit.demoKey || '' )
		  )
		: null;

	const featureToggle = isFeature
		? createElement( CheckboxControl, {
				__nextHasNoMarginBottom: true,
				checked: includeSample,
				disabled: Boolean( busyKey ) || isCurrent,
				label: copy.sampleLabel,
				onChange: ( nextValue ) => onFeatureSampleChange( sampleKey, nextValue ),
		  } )
		: null;

	// Compact list row: no live preview, just the essentials on one line.
	if ( isList ) {
		return createElement(
			'div',
			{
				style: {
					alignItems: 'center',
					background: '#fff',
					border: '1px solid ' + cardBorderColor,
					borderRadius: '4px',
					boxShadow: cardRing,
					display: 'flex',
					flexWrap: 'wrap',
					gap: '12px',
					padding: '10px 14px',
				},
			},
			createElement(
				'div',
				{ style: { display: 'flex', flex: '1 1 240px', flexDirection: 'column', gap: '2px', minWidth: 0 } },
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
					renderTypeBadge( unit, copy ),
					createElement( 'strong', { style: { fontSize: '13px' } }, primaryText ),
					isCurrent ? activeBadge : null
				),
				isGenericTitle
					? null
					: createElement(
							'div',
							{ style: { color: '#646970', fontSize: '12px' } },
							copy.sourceHeading + ': ' + source.title
					  )
			),
			featureToggle,
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', gap: '8px', marginLeft: 'auto' } },
				renderSourceBadge( source, copy ),
				appliedNote,
				previewButton,
				actionButton
			)
		);
	}

	// Grid card: live preview on top, meta below.
	const previewEl = isPreviewable
		? createElement( LayoutPreview, {
				baseRestUrl: source.baseRestUrl,
				demoKey: source.id,
				unitType: unit.type,
				unit: unit.slug || String( unit.id ),
				viewportWidth: previewConfig && previewConfig.vw ? previewConfig.vw : 1200,
				maxHeight: 360,
				title: unit.title || unit.slug,
				config: previewConfig,
				fallback: preview
					? createElement( 'img', {
							alt: '',
							src: preview,
							style: { aspectRatio: '16 / 10', background: '#f0f0f1', objectFit: 'cover', width: '100%', display: 'block' },
					  } )
					: undefined,
		  } )
		: preview
		? createElement( 'img', {
				alt: '',
				src: preview,
				style: { aspectRatio: '16 / 10', background: '#f0f0f1', objectFit: 'cover', width: '100%', display: 'block' },
		  } )
		: createElement( 'div', { style: { aspectRatio: '16 / 10', background: '#f0f0f1' } } );

	// Overlay the "Active" pill on the preview (top-left), mirroring the Site Editor's active cue.
	const previewWrap = createElement(
		'div',
		{ style: { position: 'relative' } },
		previewEl,
		isCurrent
			? createElement( 'div', { style: { left: '8px', position: 'absolute', top: '8px', zIndex: 1 } }, activeBadge )
			: null
	);

	return createElement(
		'div',
		{
			style: {
				background: '#fff',
				border: '1px solid ' + cardBorderColor,
				borderRadius: '4px',
				boxShadow: cardRing,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			},
		},
		previewWrap,
		createElement(
			'div',
			{ style: { display: 'flex', flex: 1, flexDirection: 'column', gap: '6px', padding: '12px 14px' } },
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
				renderTypeBadge( unit, copy ),
				createElement( 'strong', { style: { fontSize: '14px' } }, primaryText )
			),
			isGenericTitle
				? null
				: createElement(
						'div',
						{ style: { color: '#646970', fontSize: '13px' } },
						copy.sourceHeading + ': ' + source.title
				  ),
			featureToggle,
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' } },
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
					renderSourceBadge( source, copy ),
					appliedNote
				),
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexShrink: 0, gap: '6px' } },
					previewButton,
					actionButton
				)
			)
		)
	);
}

/**
 * Full-height preview overlay for one unit.
 *
 * The card previews are capped (so tall templates crop); this Modal shows the WHOLE template,
 * scaled to the modal width and scrolled vertically. Reuses the same front-end preview route via
 * <LayoutPreview> with NO maxHeight, and carries the My-site/Demo toggle so the source can be
 * switched while viewing.
 */
function UnitPreviewModal( { unit, previewConfig, copy, onClose } ) {
	const source = unit.source || {};
	const typeLabel = getSlotTypeLabel( unit, copy );
	const titleText = unit.title || unit.slug || '';
	const displayName = titleText && titleText.toLowerCase() !== typeLabel.toLowerCase() ? titleText : typeLabel;
	const heading = source.title ? displayName + ' — ' + source.title : displayName;

	return createElement(
		Modal,
		{
			title: heading,
			onRequestClose: onClose,
			size: 'large',
			className: 'pixassist-unit-preview-modal',
		},
		createElement(
			'div',
			{ style: { alignItems: 'center', display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '10px' } },
			createElement( DemoLiveLink, {
				baseRestUrl: source.baseRestUrl,
				demoKey: source.id,
				unitType: unit.type,
				unit: unit.slug || String( unit.id ),
				config: previewConfig,
			} ),
			createElement( PreviewModeToggle, null )
		),
		createElement(
			'div',
			{ style: { maxHeight: '74vh', overflow: 'auto', background: '#f0f0f1', borderRadius: '4px' } },
			createElement( LayoutPreview, {
				baseRestUrl: source.baseRestUrl,
				demoKey: source.id,
				unitType: unit.type,
				unit: unit.slug || String( unit.id ),
				viewportWidth: previewConfig && previewConfig.vw ? previewConfig.vw : 1200,
				title: titleText,
				config: previewConfig,
			} )
		)
	);
}

// One Site-Editor-style section: a labelled header with a divider, then the section's cards. The
// active-source caption (single-slot sections only) reads from `applied`, so it survives filtering.
function LayoutSection( { groupKey, units, applied, viewMode, columns, busyKey, copy, featureSamples, operation, previewConfig, templateTitles, onFeatureSampleChange, onImport, onPreview, onUndo } ) {
	const activeSummary = getGroupActiveSummary( groupKey, applied );
	const isSingleSlot = isSingleSlotSection( groupKey );
	const caption = activeSummary
		? copy.activeBadge + ': ' + activeSummary
		: isSingleSlot
		? copy.sectionNoneApplied
		: '';

	return createElement(
		'section',
		{ style: { marginTop: '28px' } },
		createElement(
			'div',
			{
				style: {
					alignItems: 'baseline',
					borderBottom: '1px solid #e0e0e0',
					display: 'flex',
					flexWrap: 'wrap',
					gap: '12px',
					justifyContent: 'space-between',
					marginBottom: '14px',
					paddingBottom: '8px',
				},
			},
			createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, getSectionLabel( groupKey, copy, templateTitles ) ),
			caption ? createElement( 'span', { style: { color: '#646970', fontSize: '13px' } }, caption ) : null
		),
		createElement(
			'div',
			{
				style:
					'list' === viewMode
						? { display: 'flex', flexDirection: 'column', gap: '8px' }
						: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' },
			},
			units.map( ( unit ) =>
				createElement( UnitCard, {
					key: getCardKey( unit ),
					unit,
					viewMode,
					applied,
					busyKey,
					copy,
					featureSamples,
					operation,
					previewConfig,
					onFeatureSampleChange,
					onImport,
					onPreview,
					onUndo,
				} )
			)
		)
	);
}

// Loading placeholder shown on the very first auto-load (no cache yet): a couple of section headers
// with greyed-out card rectangles, so the tab reads as "loading my layouts", not "nothing here".
function LayoutsSkeleton( { columns, copy } ) {
	const sectionLabels = [ copy.headers, copy.footers, copy.templatesType ];
	const block = {
		animation: 'pixassist-skeleton-pulse 1.4s ease-in-out infinite',
		background: '#e6e7e9',
		borderRadius: '4px',
	};

	return createElement(
		Fragment,
		null,
		createElement( 'style', null, '@keyframes pixassist-skeleton-pulse{0%,100%{opacity:1}50%{opacity:.5}}' ),
		sectionLabels.map( ( label, index ) =>
			createElement(
				'section',
				{ key: index, style: { marginTop: '28px' } },
				createElement( 'div', {
					'aria-label': label,
					style: { ...block, height: '18px', marginBottom: '20px', width: '120px' },
				} ),
				createElement(
					'div',
					{ style: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' } },
					Array.from( { length: columns }, ( ignored, cardIndex ) =>
						createElement(
							'div',
							{
								key: cardIndex,
								style: { border: '1px solid #ededed', borderRadius: '4px', overflow: 'hidden' },
							},
							createElement( 'div', { style: { ...block, aspectRatio: '16 / 10', borderRadius: 0 } } ),
							createElement(
								'div',
								{ style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px' } },
								createElement( 'div', { style: { ...block, height: '14px', width: '60%' } } ),
								createElement( 'div', { style: { ...block, height: '12px', width: '40%' } } )
							)
						)
					)
				)
			)
		)
	);
}

export function LayoutUnits() {
	const data = getLayoutUnitsData();
	const copy = mergeCopy( data.copy );
	const sources = Array.isArray( data.sources ) ? data.sources : [];
	const previewConfig = data.preview || null;
	const [ units, setUnits ] = useState( [] );
	const [ loaded, setLoaded ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );
	const [ applied, setApplied ] = useState( normalizeApplied( data.applied ) );
	const [ featureSamples, setFeatureSamples ] = useState( {} );
	const [ prewarmedJobs, setPrewarmedJobs ] = useState( {} );
	const [ operation, setOperation ] = useState( { key: '', operationSteps: [] } );
	const [ search, setSearch ] = useState( '' );
	const [ layoutPreferences, setLayoutPreferences ] = useState( () => getLayoutUnitPreferences() );
	const [ previewUnit, setPreviewUnit ] = useState( null );
	const prewarmedJobsRef = useRef( prewarmedJobs );
	const operationIdRef = useRef( 0 );
	const typeFilter = layoutPreferences.typeFilter;
	const sourceFilter = layoutPreferences.sourceFilter;
	const viewMode = layoutPreferences.viewMode;
	const columns = layoutPreferences.columns;

	function setLayoutPreference( key, value ) {
		setLayoutPreferences( ( current ) =>
			saveLayoutUnitPreferences( {
				...current,
				[ key ]: value,
			} )
		);
	}

	const ordered = useMemo( () => orderedUnits( units ), [ units ] );
	const filtered = useMemo(
		() => filterUnits( ordered, { search, typeFilter, sourceFilter } ),
		[ ordered, search, typeFilter, sourceFilter ]
	);
	const templateTitles = useMemo( () => buildTemplateTitles( units ), [ units ] );
	// The distinct template sections present (in display order), for the Type-filter sub-items.
	// Derived from the full unit list so the options stay stable regardless of the active filters.
	const templateSectionKeys = useMemo( () => {
		const seen = {};
		const keys = [];

		ordered.forEach( ( unit ) => {
			if ( 'wp_template' !== unit.type ) {
				return;
			}

			const key = getSectionKey( unit );

			if ( ! seen[ key ] ) {
				seen[ key ] = true;
				keys.push( key );
			}
		} );

		return keys.sort( compareTemplateSectionKeys );
	}, [ ordered ] );
	// Each available template type is an indented sub-item under "Templates" (e.g. "— Single Post"),
	// so the filter mirrors the per-slug sections.
	const typeOptions = useMemo(
		() => [
			{ label: __( 'All types', 'pixelgrade_assistant' ), value: 'all' },
			{ label: copy.headers, value: 'headers' },
			{ label: copy.footers, value: 'footers' },
			{ label: copy.templatesType, value: 'templates' },
			...templateSectionKeys.map( ( key ) => ( {
				label: '— ' + getSectionLabel( key, copy, templateTitles ),
				value: key,
			} ) ),
			{ label: copy.features, value: 'features' },
			{ label: copy.templateParts, value: 'templateParts' },
		],
		[ templateSectionKeys, templateTitles, copy ]
	);
	const sourceOptions = useMemo(
		() =>
			[ { label: __( 'All starters', 'pixelgrade_assistant' ), value: 'all' } ].concat(
				sources.map( ( source ) => ( { label: source.title, value: source.id } ) )
			),
		[ sources ]
	);

	const startOperationSteps = ( key, steps ) => {
		const operationId = operationIdRef.current + 1;
		operationIdRef.current = operationId;

		setOperation( {
			key,
			operationSteps: steps.map( ( step, index ) => ( {
				...step,
				status: 0 === index ? 'active' : 'pending',
			} ) ),
		} );

		return operationId;
	};

	const advanceOperationStep = ( operationId, completedId, activeId ) => {
		if ( operationIdRef.current !== operationId ) {
			return;
		}

		setOperation( ( current ) => ( {
			...current,
			operationSteps: current.operationSteps.map( ( step ) => {
					if ( step.id === completedId ) {
						return { ...step, status: 'complete' };
					}

					if ( step.id === activeId ) {
						return { ...step, status: 'active' };
					}

					return step;
				} ),
		} ) );
	};

	const finishOperationSteps = ( operationId ) => {
		if ( operationIdRef.current !== operationId ) {
			return;
		}

		setOperation( ( current ) => ( {
			...current,
			operationSteps: current.operationSteps.map( ( step ) => ( {
					...step,
					status: 'complete',
				} ) ),
		} ) );
	};

	const failOperationSteps = ( operationId ) => {
		if ( operationIdRef.current !== operationId ) {
			return;
		}

		setOperation( ( current ) => ( {
			...current,
			operationSteps: current.operationSteps.map( ( step ) => ( 'active' === step.status ? { ...step, status: 'error' } : step ) ),
		} ) );
	};

	const getPrewarmedJobKey = ( unit ) => {
		return unit && unit.source ? unit.source.id + ':' + getSlotKey( unit ) : '';
	};

	const storePrewarmedJobs = ( source, response ) => {
		const jobs = response && response.data && response.data.jobs ? response.data.jobs : {};
		const entries = Object.keys( jobs )
			.filter( ( slot ) => jobs[ slot ] && jobs[ slot ].jobId )
			.reduce( ( next, slot ) => {
				next[ source.id + ':' + slot ] = jobs[ slot ];

				return next;
			}, {} );

		if ( Object.keys( entries ).length ) {
			prewarmedJobsRef.current = {
				...prewarmedJobsRef.current,
				...entries,
			};
			setPrewarmedJobs( ( current ) => ( {
				...current,
				...entries,
			} ) );
		}
	};

	const getPrewarmedJob = ( unit ) => {
		const key = getPrewarmedJobKey( unit );

		return key && prewarmedJobsRef.current[ key ] && prewarmedJobsRef.current[ key ].jobId ? prewarmedJobsRef.current[ key ] : null;
	};

	const consumePrewarmedJob = ( unit ) => {
		const key = getPrewarmedJobKey( unit );
		const job = key && prewarmedJobsRef.current[ key ] && prewarmedJobsRef.current[ key ].jobId ? prewarmedJobsRef.current[ key ] : null;

		if ( job ) {
			const next = { ...prewarmedJobsRef.current };
			delete next[ key ];
			prewarmedJobsRef.current = next;

			setPrewarmedJobs( next );
		}

		return job;
	};

	const loadUnits = async () => {
		if ( ! sources.length ) {
			return;
		}

		// Keep any already-loaded grid on screen while a Refresh runs (the inline status conveys the
		// reload); only the very first load starts from an empty state.
		setLoading( true );
		setMessage( null );

		// Bundle prewarm is NOT a visible load step anymore: it only accelerates a LATER Apply, and
		// firing every source's prewarm at list time was measured occupying all PHP workers for ~5s
		// exactly while the first preview iframes render. It now runs delayed, one source at a time,
		// in the background — see schedulePrewarm().
		const operationId = startOperationSteps( 'load', [
			{ id: 'prepare', label: copy.loadStepPrepare },
			{ id: 'list', label: copy.loadStepList },
			{ id: 'ready', label: copy.loadStepReady },
		] );
		const prewarmThunks = [];

		try {
			advanceOperationStep( operationId, 'prepare', 'list' );

			let results = null;
			try {
				const response = await restRequest( data, 'layoutUnits', {
					sources: sources.map( ( source ) => ( {
						id: source.id,
						baseRestUrl: source.baseRestUrl,
					} ) ),
				} );
				const sourceResults = response && response.data && Array.isArray( response.data.sources ) ? response.data.sources : [];

				if ( sourceResults.length ) {
					results = sourceResults.map( ( result ) => {
						const source = sources.find( ( candidate ) => candidate.id === result.id ) || {};
						const sourceUnits = result && 'success' === result.code && Array.isArray( result.units ) ? result.units : [];

						if ( sourceUnits.length ) {
							prewarmThunks.push(
								() => prewarmSourceUnits( data, source, sourceUnits ).then( ( response ) => storePrewarmedJobs( source, response ) )
							);
						}

						return 'success' === result.code
							? {
									source,
									units: sourceUnits.map( ( unit ) => ( {
										...unit,
										source,
									} ) ),
							  }
							: {
									source,
									error: new Error( result.message || result.code || copy.failure ),
							  };
					} );
				}
			} catch ( error ) {
				results = null;
			}

			if ( ! results ) {
				results = await Promise.all(
					sources.map( async ( source ) => {
						try {
							const response = await restRequest( data, 'layoutUnits', {
								demo_key: source.id,
								url: source.baseRestUrl,
							} );
							const sourceUnits = response && response.data && Array.isArray( response.data.units ) ? response.data.units : [];
							prewarmThunks.push(
								() => prewarmSourceUnits( data, source, sourceUnits ).then( ( response ) => storePrewarmedJobs( source, response ) )
							);

							return {
								source,
								units: sourceUnits.map( ( unit ) => ( {
									...unit,
									source,
								} ) ),
							};
						} catch ( error ) {
							return { source, error };
						}
					} )
				);
			}

			const successful = results.filter( ( result ) => ! result.error );
			const failed = results.filter( ( result ) => result.error );

			const loadedUnits = successful.reduce( ( list, result ) => list.concat( result.units ), [] );

			setUnits( loadedUnits );
			setLoaded( true );

			// Seed the session cache so re-entering the tab rehydrates instantly. `applied` here is the
			// snapshot at load time; the sync effect keeps it current as units are applied/removed.
			layoutUnitsCache = { sourcesKey: getSourcesKey( sources ), units: loadedUnits, applied };

			if ( failed.length && successful.length ) {
				setMessage( { type: 'warning', text: copy.partialFailure } );
			} else if ( failed.length ) {
				setMessage( { type: 'error', text: copy.failure } );
			}

			if ( failed.length && ! successful.length ) {
				failOperationSteps( operationId );
			} else {
				advanceOperationStep( operationId, 'list', 'ready' );
				finishOperationSteps( operationId );
			}

			schedulePrewarm( prewarmThunks );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.failure } );
			failOperationSteps( operationId );
		} finally {
			setLoading( false );
		}
	};

	const importUnit = async ( unit, options = {} ) => {
		if ( ! unit || ! unit.source ) {
			return;
		}

		const payload = {
			demo_key: unit.source.id,
			url: unit.source.baseRestUrl,
			unit_type: unit.type,
			unit: unit.slug || unit.id,
			...( 'feature' === unit.type ? { include_sample: Boolean( options.includeSample ) } : {} ),
		};
		const supportsQueuedImport = Boolean( getEndpoint( data, 'queueUnit' ).url && getEndpoint( data, 'unitJobStatus' ).url );
		const prewarmedJob = supportsQueuedImport ? getPrewarmedJob( unit ) : null;
		const operationKey = 'import:' + getCardKey( unit, unit.source.id );
		const queueStep = supportsQueuedImport
			? {
					id: 'queue',
					label: prewarmedJob ? copy.applyStepPreparedJob : copy.applyStepQueue,
			  }
			: null;
		const operationId = startOperationSteps(
			operationKey,
			[
				{ id: 'prepare', label: copy.applyStepPrepare },
				queueStep,
				{ id: 'apply', label: copy.applyStepApply },
				{ id: 'refresh', label: copy.applyStepRefresh },
				{ id: 'ready', label: copy.applyStepReady },
			].filter( Boolean )
		);

		setBusyKey( operationKey );
		setMessage( null );

		try {
			let response;

			advanceOperationStep( operationId, 'prepare', queueStep ? 'queue' : 'apply' );

			if ( supportsQueuedImport ) {
				const queued = prewarmedJob || ( await restRequest( data, 'queueUnit', payload ) );
				const jobId = prewarmedJob && prewarmedJob.jobId ? prewarmedJob.jobId : queued && queued.data ? queued.data.jobId : '';
				const started = Date.now();

				if ( ! jobId ) {
					throw new Error( copy.importFailure );
				}

				if ( prewarmedJob ) {
					consumePrewarmedJob( unit );
				}

				advanceOperationStep( operationId, 'queue', 'apply' );

				while ( Date.now() - started < LAYOUT_UNIT_JOB_TIMEOUT ) {
					await delay( LAYOUT_UNIT_JOB_POLL_INTERVAL );

					const statusResponse = await restRequest( data, 'unitJobStatus', {
						job_id: jobId,
					} );
					const job = statusResponse && statusResponse.data ? statusResponse.data : {};

					if ( 'success' === job.status ) {
						response = job.result || {};
						advanceOperationStep( operationId, 'apply', 'refresh' );
						break;
					}

					if ( 'error' === job.status ) {
						const result = job.result || {};
						const error = job.error || {};
						throw new Error( result.message || error.message || copy.importFailure );
					}
				}

				if ( ! response ) {
					throw new Error( copy.importFailure );
				}
			} else {
				response = await restRequest( data, 'importUnit', payload );
				advanceOperationStep( operationId, 'apply', 'refresh' );
			}

			if ( response && response.data && response.data.appliedUnits ) {
				setApplied( normalizeApplied( response.data.appliedUnits ) );
			}

			setMessage( { type: 'success', text: copy.importSuccess } );
			advanceOperationStep( operationId, 'refresh', 'ready' );
			finishOperationSteps( operationId );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.importFailure } );
			failOperationSteps( operationId );
		} finally {
			setBusyKey( '' );
		}
	};

	const setFeatureSample = ( sampleKey, nextValue ) => {
		setFeatureSamples( ( current ) => ( {
			...current,
			[ sampleKey ]: Boolean( nextValue ),
		} ) );
	};

	const undoUnit = async ( unit, slot ) => {
		if ( ! unit || ! unit.type || ! unit.slug ) {
			return;
		}

		setBusyKey( 'undo:' + slot );
		setMessage( null );

		try {
			const response = await restRequest( data, 'undoUnit', {
				unit_type: unit.type,
				unit: unit.slug,
			} );

			if ( response && response.data && response.data.appliedUnits ) {
				setApplied( normalizeApplied( response.data.appliedUnits ) );
			}

			setMessage( { type: 'success', text: copy.undoSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.undoFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	// Auto-load on first open; on re-entry rehydrate from the session cache (no re-fetch, no
	// re-prewarm). Refresh is the explicit way to reload. Runs once per mount.
	useEffect( () => {
		if ( ! sources.length ) {
			return;
		}

		const sourcesKey = getSourcesKey( sources );

		if ( layoutUnitsCache && layoutUnitsCache.sourcesKey === sourcesKey ) {
			setUnits( layoutUnitsCache.units );
			setApplied( normalizeApplied( layoutUnitsCache.applied ) );
			setLoaded( true );
			return;
		}

		loadUnits();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Keep the cached `applied` snapshot current so a later re-entry shows the right active state.
	useEffect( () => {
		if ( layoutUnitsCache && layoutUnitsCache.sourcesKey === getSourcesKey( sources ) ) {
			layoutUnitsCache.applied = applied;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ applied ] );

	if ( ! sources.length ) {
		return createElement(
			'section',
			{ className: 'pixelgrade-layout-units' },
			createElement( 'h1', null, copy.title ),
			createElement( 'p', null, copy.empty )
		);
	}

	// First load (no cache) shows the skeleton; a Refresh on an already-loaded grid keeps the cards on
	// screen and just surfaces the inline status.
	const showSkeleton = loading && ! loaded;
	const loadStatusText = getOperationButtonLabel( operation, 'load', copy.loading );
	const sections = groupUnits( filtered, applied );

	return createElement(
		'section',
		{ className: 'pixelgrade-layout-units' },
		createElement( 'h1', null, copy.title ),
		createElement( 'p', null, copy.description ),
		renderMessage( message ),
		createElement( LibraryToolbar, {
			search,
			onSearch: setSearch,
			searchLabel: __( 'Search layouts', 'pixelgrade_assistant' ),
			typeFilter,
			onTypeFilter: ( value ) => setLayoutPreference( 'typeFilter', value ),
			typeOptions,
			typeFilterLabel: __( 'Filter by type', 'pixelgrade_assistant' ),
			sourceFilter,
			onSourceFilter: ( value ) => setLayoutPreference( 'sourceFilter', value ),
			sourceOptions,
			sourceFilterLabel: __( 'Filter by starter', 'pixelgrade_assistant' ),
			viewMode,
			onViewMode: ( value ) => setLayoutPreference( 'viewMode', value ),
			columns,
			onColumns: ( value ) => setLayoutPreference( 'columns', value ),
			onRefresh: () => loadUnits(),
			refreshLabel: copy.refreshLabel,
			refreshTitle: copy.refreshTitle,
			refreshDisabled: Boolean( busyKey ),
			loading,
			loadingStatus: loadStatusText,
		} ),
		showSkeleton ? createElement( LayoutsSkeleton, { columns, copy } ) : null,
		loaded && ! units.length ? createElement( 'p', null, copy.empty ) : null,
		loaded && units.length
			? createElement(
					Fragment,
					null,
					sections.length
						? sections.map( ( section ) =>
								createElement( LayoutSection, {
									key: section.key,
									groupKey: section.key,
									units: section.units,
									applied,
									viewMode,
									columns,
									busyKey,
									copy,
									featureSamples,
									operation,
									previewConfig,
									templateTitles,
									onFeatureSampleChange: setFeatureSample,
									onImport: importUnit,
									onPreview: setPreviewUnit,
									onUndo: undoUnit,
								} )
						  )
						: createElement(
								'p',
								{ style: { color: '#646970' } },
								__( 'No layouts match your filters.', 'pixelgrade_assistant' )
						  )
			  )
			: null,
		previewUnit
			? createElement( UnitPreviewModal, {
					unit: previewUnit,
					previewConfig,
					copy,
					onClose: () => setPreviewUnit( null ),
			  } )
			: null
	);
}
