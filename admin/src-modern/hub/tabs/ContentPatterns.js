/**
 * Page Patterns tab.
 *
 * Imports one page-like content example from a starter source without running the full starter import.
 */
import { createElement, Fragment, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Dropdown, Icon, Modal, Notice, RangeControl, SearchControl, SelectControl } from '@wordpress/components';
import { check, fullscreen, grid, listView, settings, update } from '@wordpress/icons';
import { LayoutPreview, PreviewModeToggle } from '../LayoutPreview';
import { getContentPatternPreferences, saveContentPatternPreferences } from '../preferences';

const DEFAULT_CONTENT_PATTERNS = {
	copy: {
		title: __( 'Page Patterns', 'pixelgrade_assistant' ),
		description: __( 'Add ready-made content — a single page or post from a starter — instead of importing a whole starter site. For reusable parts like headers, footers, and templates, use the Layouts tab.', 'pixelgrade_assistant' ),
		sourceLabel: __( 'Source', 'pixelgrade_assistant' ),
		typeLabel: __( 'Type', 'pixelgrade_assistant' ),
		allSources: __( 'All sources', 'pixelgrade_assistant' ),
		allTypes: __( 'All types', 'pixelgrade_assistant' ),
		searchLabel: __( 'Search page patterns', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load page patterns', 'pixelgrade_assistant' ),
		refreshLabel: __( 'Refresh', 'pixelgrade_assistant' ),
		refreshTitle: __( 'Reload page patterns from your starters', 'pixelgrade_assistant' ),
		loading: __( 'Loading page patterns...', 'pixelgrade_assistant' ),
		empty: __( 'No page patterns are available from these sources.', 'pixelgrade_assistant' ),
		emptyFiltered: __( 'No page patterns match these filters.', 'pixelgrade_assistant' ),
		failure: __( 'Page patterns could not be loaded. Please try again.', 'pixelgrade_assistant' ),
		partialFailure: __( 'Some page-pattern sources could not be loaded.', 'pixelgrade_assistant' ),
		importLabel: __( 'Apply', 'pixelgrade_assistant' ),
		replaceLabel: __( 'Replace', 'pixelgrade_assistant' ),
		importing: __( 'Applying page pattern...', 'pixelgrade_assistant' ),
		importSuccess: __( 'Page pattern applied.', 'pixelgrade_assistant' ),
		importFailure: __( 'Page pattern could not be applied. Please try again.', 'pixelgrade_assistant' ),
		undoLabel: __( 'Remove', 'pixelgrade_assistant' ),
		undoing: __( 'Removing page pattern...', 'pixelgrade_assistant' ),
		undoSuccess: __( 'Page pattern removed.', 'pixelgrade_assistant' ),
		undoFailure: __( 'Page pattern could not be removed. Please try again.', 'pixelgrade_assistant' ),
		appliedLabel: __( 'Applied', 'pixelgrade_assistant' ),
		activeBadge: __( 'Active', 'pixelgrade_assistant' ),
		sectionNoneApplied: __( 'None applied yet', 'pixelgrade_assistant' ),
		lockedLabel: __( 'Unavailable', 'pixelgrade_assistant' ),
		mediaLabel: __( 'media', 'pixelgrade_assistant' ),
		sourceHeading: __( 'Source', 'pixelgrade_assistant' ),
		premiumLabel: __( 'Premium', 'pixelgrade_assistant' ),
		freeLabel: __( 'Free', 'pixelgrade_assistant' ),
		previewLabel: __( 'Expand', 'pixelgrade_assistant' ),
		previewFull: __( 'Open the full page pattern preview', 'pixelgrade_assistant' ),
		noPreview: __( 'No preview', 'pixelgrade_assistant' ),
		pages: __( 'Pages', 'pixelgrade_assistant' ),
		posts: __( 'Posts', 'pixelgrade_assistant' ),
		projects: __( 'Projects', 'pixelgrade_assistant' ),
		products: __( 'Products', 'pixelgrade_assistant' ),
		other: __( 'Other content', 'pixelgrade_assistant' ),
	},
	sources: [],
	endpoints: {},
	applied: {},
	preview: null,
};

const PREVIEW_SIZE_MAX = 4;
const PREVIEW_SIZE_DEFAULT_COLUMNS = 2;
const TYPE_ORDER = [ 'page', 'post', 'portfolio', 'product', 'other' ];

let contentPatternsCache = null;

function getContentPatternsData() {
	if ( typeof window !== 'undefined' && window.pixelgradeContentPatterns ) {
		return window.pixelgradeContentPatterns;
	}

	return DEFAULT_CONTENT_PATTERNS;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_CONTENT_PATTERNS.copy,
		...( copy || {} ),
	};
}

function normalizeObject( value ) {
	if ( ! value || 'object' !== typeof value || Array.isArray( value ) ) {
		return {};
	}

	return value;
}

function getSourcesKey( sources ) {
	return sources
		.map( ( source ) => source.id )
		.sort()
		.join( '|' );
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

function getSlotKey( unit ) {
	const type = unit && unit.type ? unit.type : '';
	const slug = unit && unit.slug ? unit.slug : '';

	return type && slug ? type + ':' + slug : '';
}

function getCardKey( unit ) {
	const source = unit && unit.source ? unit.source.id || '' : '';
	const slug = unit && ( unit.slug || unit.id ) ? unit.slug || unit.id : '';

	return ( unit && unit.type ? unit.type : '' ) + ':' + slug + ':' + source;
}

function isUnitCurrent( unit, applied ) {
	const appliedUnit = applied[ getSlotKey( unit ) ];
	const source = unit.source || {};

	return Boolean( appliedUnit && appliedUnit.demoKey === source.id && appliedUnit.slug === unit.slug );
}

function findSource( sources, id ) {
	return sources.find( ( source ) => source.id === id ) || null;
}

function flattenSourceResults( sourceResults, sources ) {
	const units = [];
	const failures = [];

	( Array.isArray( sourceResults ) ? sourceResults : [] ).forEach( ( result ) => {
		const source = findSource( sources, result.id ) || {
			id: result.id || '',
			title: result.id || '',
			baseRestUrl: '',
			gate: '',
		};

		if ( result.code && 'success' !== result.code ) {
			failures.push( {
				id: source.id,
				title: source.title || source.id,
				message: result.message || '',
			} );
		}

		( Array.isArray( result.units ) ? result.units : [] ).forEach( ( unit ) => {
			units.push( {
				...unit,
				source: {
					id: source.id,
					title: source.title || source.id,
					baseRestUrl: source.baseRestUrl || unit.baseRestUrl || '',
					gate: source.gate || '',
				},
			} );
		} );
	} );

	return { units, failures };
}

function getTypeGroupKey( unit ) {
	if ( ! unit || ! unit.type ) {
		return 'other';
	}

	return TYPE_ORDER.includes( unit.type ) ? unit.type : 'other';
}

function getTypeGroupLabel( type, copy ) {
	switch ( type ) {
		case 'page':
			return copy.pages;
		case 'post':
			return copy.posts;
		case 'portfolio':
			return copy.projects;
		case 'product':
			return copy.products;
		default:
			return copy.other;
	}
}

function buildTypeOptions( units, copy ) {
	const seen = {};

	units.forEach( ( unit ) => {
		seen[ getTypeGroupKey( unit ) ] = true;
	} );

	return [
		{ label: copy.allTypes, value: 'all' },
		...TYPE_ORDER.filter( ( type ) => seen[ type ] ).map( ( type ) => ( {
			label: getTypeGroupLabel( type, copy ),
			value: type,
		} ) ),
	];
}

function buildSourceOptions( sources, copy ) {
	return [
		{ label: copy.allSources, value: 'all' },
		...sources.map( ( source ) => ( {
			label: source.title || source.id,
			value: source.id,
		} ) ),
	];
}

function getLoadedSourceIds( cache ) {
	return normalizeObject( cache ? cache.loadedSourceIds : {} );
}

function areAllSourcesLoaded( sources, loadedSourceIds ) {
	return Boolean( sources.length ) && sources.every( ( source ) => source.id && loadedSourceIds[ source.id ] );
}

function getSourcesToLoad( sources, sourceFilter, loadedSourceIds, force = false ) {
	if ( ! sources.length ) {
		return [];
	}

	if ( sourceFilter && 'all' !== sourceFilter ) {
		const source = findSource( sources, sourceFilter );
		if ( ! source ) {
			return [];
		}

		return force || ! loadedSourceIds[ source.id ] ? [ source ] : [];
	}

	return force ? sources : sources.filter( ( source ) => source.id && ! loadedSourceIds[ source.id ] );
}

function mergeUnitsForSources( existingUnits, incomingUnits, sourceIds ) {
	const replacing = {};
	sourceIds.forEach( ( id ) => {
		if ( id ) {
			replacing[ id ] = true;
		}
	} );

	return [
		...( Array.isArray( existingUnits ) ? existingUnits : [] ).filter( ( unit ) => {
			const sourceId = unit.source && unit.source.id ? unit.source.id : '';
			return ! replacing[ sourceId ];
		} ),
		...( Array.isArray( incomingUnits ) ? incomingUnits : [] ),
	];
}

function getCatalogOrder( unit ) {
	const order = Number( unit && unit.order ? unit.order : 0 );

	return Number.isFinite( order ) && order > 0 ? order : 0;
}

function orderedUnits( units ) {
	return units.slice().sort( ( a, b ) => {
		const oa = getCatalogOrder( a );
		const ob = getCatalogOrder( b );
		if ( oa !== ob ) {
			if ( ! oa ) {
				return 1;
			}
			if ( ! ob ) {
				return -1;
			}

			return oa - ob;
		}

		const ga = TYPE_ORDER.indexOf( getTypeGroupKey( a ) );
		const gb = TYPE_ORDER.indexOf( getTypeGroupKey( b ) );
		if ( ga !== gb ) {
			return ga - gb;
		}

		const ta = a.title || a.slug || '';
		const tb = b.title || b.slug || '';
		if ( ta !== tb ) {
			return ta.localeCompare( tb );
		}

		const sa = ( a.source && a.source.title ) || '';
		const sb = ( b.source && b.source.title ) || '';
		return sa.localeCompare( sb );
	} );
}

function filterUnits( units, filters ) {
	const query = ( filters.search || '' ).trim().toLowerCase();

	return units.filter( ( unit ) => {
		if ( filters.type && 'all' !== filters.type && getTypeGroupKey( unit ) !== filters.type ) {
			return false;
		}

		const sourceId = unit.source && unit.source.id ? unit.source.id : '';
		if ( filters.source && 'all' !== filters.source && sourceId !== filters.source ) {
			return false;
		}

		if ( query ) {
			const haystack = (
				( unit.title || '' ) +
				' ' +
				( unit.description || '' ) +
				' ' +
				( unit.slug || '' ) +
				' ' +
				( unit.kindLabel || '' ) +
				' ' +
				( unit.group || '' ) +
				' ' +
				( Array.isArray( unit.tags ) ? unit.tags.join( ' ' ) : unit.tags || '' ) +
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

function groupUnits( units, applied ) {
	const buckets = {};

	units.forEach( ( unit ) => {
		const key = getTypeGroupKey( unit );
		buckets[ key ] = buckets[ key ] || [];
		buckets[ key ].push( unit );
	} );

	return TYPE_ORDER.filter( ( key ) => buckets[ key ] && buckets[ key ].length ).map( ( key ) => {
		const current = [];
		const rest = [];
		buckets[ key ].forEach( ( unit ) => ( isUnitCurrent( unit, applied ) ? current : rest ).push( unit ) );

		return {
			key,
			units: current.concat( rest ),
		};
	} );
}

function renderMessage( message ) {
	if ( ! message ) {
		return null;
	}

	return createElement(
		Notice,
		{
			status: message.type || 'info',
			isDismissible: true,
			onRemove: message.onRemove || undefined,
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
		source && source.gate ? copy.premiumLabel : copy.freeLabel
	);
}

function renderCatalogBadges( unit ) {
	const tags = Array.isArray( unit.tags ) ? unit.tags : [];
	const labels = [ unit.group || '', ...tags ].filter( Boolean ).slice( 0, 4 );

	if ( ! labels.length ) {
		return null;
	}

	return createElement(
		'div',
		{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '5px' } },
		labels.map( ( label ) =>
			createElement(
				'span',
				{
					key: label,
					style: {
						background: '#f6f7f7',
						border: '1px solid #dcdcde',
						borderRadius: '2px',
						color: '#50575e',
						display: 'inline-block',
						fontSize: '11px',
						lineHeight: '16px',
						padding: '0 6px',
					},
				},
				label
			)
		)
	);
}

function renderTypeBadge( unit ) {
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
		unit.kindLabel || unit.type
	);
}

function renderNoPreview( copy ) {
	return createElement(
		'div',
		{
			style: {
				alignItems: 'center',
				aspectRatio: '16 / 10',
				background: '#f6f7f7',
				border: '1px solid #f0f0f1',
				borderRadius: '3px',
				color: '#a7aaad',
				display: 'flex',
				fontSize: '12px',
				justifyContent: 'center',
				width: '100%',
			},
		},
		copy.noPreview
	);
}

function renderStaticPreview( unit, copy ) {
	const image = unit.previewImage || unit.thumbnail || unit.image || '';

	return image
		? createElement( 'img', {
				alt: '',
				src: image,
				style: { aspectRatio: '16 / 10', background: '#f0f0f1', display: 'block', objectFit: 'cover', width: '100%' },
		  } )
		: renderNoPreview( copy );
}

function renderContentPreview( unit, source, previewConfig, copy, maxHeight = 360 ) {
	const fallback = renderStaticPreview( unit, copy );

	if ( ! unit.previewAvailable || ! previewConfig || ! previewConfig.base ) {
		return fallback;
	}

	return createElement( LayoutPreview, {
		baseRestUrl: source.baseRestUrl,
		demoKey: source.id,
		unitType: unit.type,
		unit: unit.slug || String( unit.id ),
		viewportWidth: previewConfig && previewConfig.vw ? previewConfig.vw : 1200,
		maxHeight,
		title: unit.title || unit.slug,
		config: previewConfig,
		fallback,
	} );
}

function getAppliedNote( appliedUnit, unit, copy ) {
	if ( ! appliedUnit || isUnitCurrent( unit, normalizeObject( { [ getSlotKey( unit ) ]: appliedUnit } ) ) ) {
		return null;
	}

	const label = [ appliedUnit.sourceTitle || appliedUnit.demoKey || '', appliedUnit.title || '' ].filter( Boolean ).join( ' / ' );

	return label
		? createElement( 'span', { style: { color: '#646970', fontSize: '12px' } }, copy.appliedLabel + ': ' + label )
		: null;
}

function UnitCard( { unit, viewMode, applied, busyKey, copy, previewConfig, onApply, onPreview, onUndo } ) {
	const slot = getSlotKey( unit );
	const source = unit.source || {};
	const appliedUnit = applied[ slot ];
	const current = isUnitCurrent( unit, applied );
	const cardKey = getCardKey( unit );
	const busyApply = busyKey === 'apply:' + cardKey;
	const busyUndo = busyKey === 'undo:' + slot;
	const disabled = Boolean( busyKey ) || false === unit.available;
	const reason = false === unit.available ? unit.availabilityReason || copy.lockedLabel : '';
	const title = unit.title || unit.slug || '';
	const isList = 'list' === viewMode;
	const previewable = Boolean( unit.previewAvailable || unit.previewImage || unit.thumbnail || unit.image );
	const cardBorderColor = current ? 'var(--wp-admin-theme-color, #3858e9)' : '#dcdcde';
	const cardRing = current ? '0 0 0 1px var(--wp-admin-theme-color, #3858e9)' : undefined;
	const appliedNote = appliedUnit && ! current ? getAppliedNote( appliedUnit, unit, copy ) : null;
	const mediaText = unit.mediaCount ? sprintf( '%d %s', unit.mediaCount, copy.mediaLabel ) : '';

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

	const actionButton = current
		? createElement(
				Button,
				{
					variant: 'secondary',
					isDestructive: true,
					isBusy: busyUndo,
					disabled: Boolean( busyKey ),
					onClick: () => onUndo( unit, slot ),
					style: { flexShrink: 0, minWidth: '104px' },
				},
				busyUndo ? copy.undoing : copy.undoLabel
		  )
		: createElement(
				Button,
				{
					variant: 'primary',
					isBusy: busyApply,
					disabled,
					onClick: () => onApply( unit ),
					style: { flexShrink: 0, minWidth: '104px' },
				},
				busyApply ? copy.importing : appliedUnit ? copy.replaceLabel : copy.importLabel
		  );

	const previewButton = previewable
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
				{ style: { display: 'flex', flex: '1 1 280px', flexDirection: 'column', gap: '3px', minWidth: 0 } },
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
					renderTypeBadge( unit ),
					createElement( 'strong', { style: { fontSize: '13px' } }, title ),
					current ? activeBadge : null,
					false === unit.available
						? createElement( 'span', { style: { color: '#8a2424', fontSize: '12px', fontWeight: 600 } }, copy.lockedLabel )
						: null
				),
				unit.description ? createElement( 'span', { style: { color: '#646970', fontSize: '12px' } }, unit.description ) : null,
				renderCatalogBadges( unit ),
				reason ? createElement( 'span', { style: { color: '#8a2424', fontSize: '12px' } }, reason ) : null
			),
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' } },
				renderSourceBadge( source, copy ),
				mediaText ? createElement( 'span', { style: { color: '#646970', fontSize: '12px' } }, mediaText ) : null,
				appliedNote,
				previewButton,
				actionButton
			)
		);
	}

	const preview = createElement(
		'div',
		{ style: { position: 'relative' } },
		renderContentPreview( unit, source, previewConfig, copy, 360 ),
		current ? createElement( 'div', { style: { left: '8px', position: 'absolute', top: '8px', zIndex: 1 } }, activeBadge ) : null
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
		preview,
		createElement(
			'div',
			{ style: { display: 'flex', flex: 1, flexDirection: 'column', gap: '8px', padding: '12px 14px' } },
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
				renderTypeBadge( unit ),
				createElement( 'strong', { style: { fontSize: '14px' } }, title ),
				false === unit.available
					? createElement( 'span', { style: { color: '#8a2424', fontSize: '12px', fontWeight: 600 } }, copy.lockedLabel )
					: null
			),
			unit.description ? createElement( 'div', { style: { color: '#50575e', fontSize: '13px', lineHeight: 1.45 } }, unit.description ) : null,
			renderCatalogBadges( unit ),
			createElement(
				'div',
				{ style: { color: '#646970', fontSize: '12px' } },
				[ copy.sourceHeading + ': ' + ( source.title || source.id || '' ), mediaText ].filter( Boolean ).join( ' / ' )
			),
			reason ? createElement( 'div', { style: { color: '#8a2424', fontSize: '12px' } }, reason ) : null,
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

function UnitPreviewModal( { unit, previewConfig, copy, onClose } ) {
	const source = unit.source || {};
	const title = [ unit.title || unit.slug || '', source.title || '' ].filter( Boolean ).join( ' - ' );

	return createElement(
		Modal,
		{
			title,
			onRequestClose: onClose,
			size: 'large',
			className: 'pixassist-content-preview-modal',
		},
		createElement(
			'div',
			{ style: { maxHeight: '74vh', overflow: 'auto', background: '#f0f0f1', borderRadius: '4px' } },
			unit.previewAvailable && previewConfig && previewConfig.base
				? createElement( LayoutPreview, {
						baseRestUrl: source.baseRestUrl,
						demoKey: source.id,
						unitType: unit.type,
						unit: unit.slug || String( unit.id ),
						viewportWidth: previewConfig && previewConfig.vw ? previewConfig.vw : 1200,
						title: unit.title || unit.slug,
						config: previewConfig,
						fallback: renderStaticPreview( unit, copy ),
				  } )
				: renderStaticPreview( unit, copy )
		)
	);
}

function ContentToolbar( { search, onSearch, typeFilter, onTypeFilter, sourceFilter, onSourceFilter, viewMode, onViewMode, columns, onColumns, sources, typeOptions, sourceOptions, loading, loadingStatus, busyKey, copy, onRefresh } ) {
	return createElement(
		'div',
		{
			className: 'pixassist-content-patterns__toolbar',
			style: {
				alignItems: 'center',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '12px',
				margin: '16px 0',
			},
		},
		createElement(
			'div',
			{ className: 'pixassist-content-patterns__toolbar-search', style: { flex: '1 1 220px', minWidth: '180px' } },
			createElement( SearchControl, {
				__nextHasNoMarginBottom: true,
				value: search,
				onChange: onSearch,
				label: copy.searchLabel,
				placeholder: copy.searchLabel,
				hideLabelFromVision: true,
			} )
		),
		createElement(
			'div',
			{ className: 'pixassist-content-patterns__toolbar-controls', style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' } },
			createElement(
				'div',
				{ className: 'pixassist-content-patterns__toolbar-control', style: { minWidth: '150px' } },
				createElement( SelectControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					hideLabelFromVision: true,
					label: copy.typeLabel,
					value: typeFilter,
					options: typeOptions,
					onChange: onTypeFilter,
				} )
			),
			createElement(
				'div',
				{ className: 'pixassist-content-patterns__toolbar-control', style: { minWidth: '150px' } },
				createElement( SelectControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					hideLabelFromVision: true,
					label: copy.sourceLabel,
					value: sourceFilter,
					options: sourceOptions,
					onChange: onSourceFilter,
				} )
			),
			createElement( PreviewModeToggle, null ),
			createElement(
				'div',
				{ style: { display: 'inline-flex', border: '1px solid #dcdcde', borderRadius: '4px' } },
				createElement( Button, {
					icon: grid,
					isPressed: 'grid' === viewMode,
					label: __( 'Grid view', 'pixelgrade_assistant' ),
					showTooltip: true,
					onClick: () => onViewMode( 'grid' ),
				} ),
				createElement( Button, {
					icon: listView,
					isPressed: 'list' === viewMode,
					label: __( 'List view', 'pixelgrade_assistant' ),
					showTooltip: true,
					onClick: () => onViewMode( 'list' ),
				} )
			),
			'grid' === viewMode
				? createElement( Dropdown, {
						popoverProps: { placement: 'bottom-end' },
						renderToggle: ( { isOpen, onToggle } ) =>
							createElement( Button, {
								icon: settings,
								isPressed: isOpen,
								'aria-expanded': isOpen,
								label: __( 'Preview size', 'pixelgrade_assistant' ),
								showTooltip: true,
								onClick: onToggle,
							} ),
						renderContent: () =>
							createElement(
								'div',
								{ style: { minWidth: '220px', padding: '4px 8px 0' } },
								createElement( RangeControl, {
									__nextHasNoMarginBottom: true,
									__next40pxDefaultSize: true,
									label: __( 'Preview size', 'pixelgrade_assistant' ),
									value: PREVIEW_SIZE_MAX + 1 - columns,
									onChange: ( value ) =>
										onColumns( PREVIEW_SIZE_MAX + 1 - ( value || PREVIEW_SIZE_MAX + 1 - PREVIEW_SIZE_DEFAULT_COLUMNS ) ),
									min: 1,
									max: PREVIEW_SIZE_MAX,
									step: 1,
									marks: true,
									withInputField: false,
									showTooltip: false,
								} )
							),
				  } )
				: null,
			createElement(
				Button,
				{
					variant: 'secondary',
					icon: update,
					isBusy: loading,
					disabled: loading || Boolean( busyKey ) || ! sources.length,
					onClick: onRefresh,
					label: copy.refreshTitle,
					showTooltip: true,
				},
				copy.refreshLabel
			),
			loading ? createElement( 'span', { style: { color: '#646970', fontSize: '13px' } }, loadingStatus || copy.loading ) : null
		)
	);
}

function ContentSection( { groupKey, units, applied, viewMode, columns, busyKey, copy, previewConfig, onApply, onPreview, onUndo } ) {
	const activeCount = units.filter( ( unit ) => isUnitCurrent( unit, applied ) ).length;
	const caption = activeCount
		? sprintf( '%d %s', activeCount, copy.activeBadge.toLowerCase() )
		: copy.sectionNoneApplied;

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
			createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, getTypeGroupLabel( groupKey, copy ) ),
			createElement( 'span', { style: { color: '#646970', fontSize: '13px' } }, caption )
		),
		createElement(
			'div',
			{
				className: 'list' === viewMode ? 'pixassist-content-patterns__list' : 'pixassist-content-patterns__grid',
				style:
					'list' === viewMode
						? { display: 'flex', flexDirection: 'column', gap: '8px' }
						: {
								'--pixassist-content-columns': columns,
								display: 'grid',
								gap: '16px',
								gridTemplateColumns: 'repeat(var(--pixassist-content-columns), minmax(0, 1fr))',
						  },
			},
			units.map( ( unit ) =>
				createElement( UnitCard, {
					key: getCardKey( unit ),
					unit,
					viewMode,
					applied,
					busyKey,
					copy,
					previewConfig,
					onApply,
					onPreview,
					onUndo,
				} )
			)
		)
	);
}

function ContentPatternsResponsiveStyles() {
	return createElement(
		'style',
		null,
		'@media (max-width: 782px) {' +
			'.pixelgrade-content-patterns .pixassist-content-patterns__toolbar { align-items: stretch; }' +
			'.pixelgrade-content-patterns .pixassist-content-patterns__toolbar-search { flex-basis: 100% !important; min-width: 0 !important; }' +
			'.pixelgrade-content-patterns .pixassist-content-patterns__toolbar-controls { margin-left: 0 !important; width: 100%; }' +
			'.pixelgrade-content-patterns .pixassist-content-patterns__toolbar-control { flex: 1 1 140px; min-width: 0 !important; }' +
			'.pixelgrade-content-patterns .pixassist-content-patterns__grid { grid-template-columns: 1fr !important; }' +
		'}'
	);
}

function ContentSkeleton( { columns, copy } ) {
	const sectionLabels = [ copy.pages, copy.posts, copy.projects ];
	const block = {
		animation: 'pixassist-content-skeleton-pulse 1.4s ease-in-out infinite',
		background: '#e6e7e9',
		borderRadius: '4px',
	};

	return createElement(
		Fragment,
		null,
		createElement( 'style', null, '@keyframes pixassist-content-skeleton-pulse{0%,100%{opacity:1}50%{opacity:.5}}' ),
		sectionLabels.map( ( label, index ) =>
			createElement(
				'section',
				{ key: index, style: { marginTop: '28px' } },
				createElement( 'div', {
					'aria-label': label,
					style: { ...block, height: '18px', marginBottom: '20px', width: '140px' },
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

export function ContentPatterns() {
	const data = getContentPatternsData();
	const copy = mergeCopy( data.copy );
	const sources = Array.isArray( data.sources ) ? data.sources : [];
	const previewConfig = data.preview || null;
	const sourcesKey = getSourcesKey( sources );
	const cacheMatches = contentPatternsCache && contentPatternsCache.sourcesKey === sourcesKey;
	const [ units, setUnits ] = useState( cacheMatches ? contentPatternsCache.units : [] );
	const [ applied, setApplied ] = useState( normalizeObject( cacheMatches ? contentPatternsCache.applied : data.applied ) );
	const [ loadedSourceIds, setLoadedSourceIds ] = useState( cacheMatches ? getLoadedSourceIds( contentPatternsCache ) : {} );
	const [ loaded, setLoaded ] = useState( Boolean( cacheMatches ) );
	const [ loading, setLoading ] = useState( false );
	const [ loadingStatus, setLoadingStatus ] = useState( '' );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );
	const [ search, setSearch ] = useState( '' );
	const [ preferences, setPreferences ] = useState( () => getContentPatternPreferences() );
	const [ previewUnit, setPreviewUnit ] = useState( null );
	const loadingRef = useRef( false );

	const typeFilter = preferences.typeFilter;
	const sourceFilter = sources.some( ( source ) => source.id === preferences.sourceFilter ) ? preferences.sourceFilter : 'all';
	const viewMode = preferences.viewMode;
	const columns = preferences.columns;

	function setContentPreference( key, value ) {
		setPreferences( ( current ) =>
			saveContentPatternPreferences( {
				...current,
				[ key ]: value,
			} )
		);
	}

	function writeCache( nextUnits, nextApplied, nextLoadedSourceIds ) {
		contentPatternsCache = {
			sourcesKey,
			units: nextUnits,
			applied: nextApplied,
			loadedSourceIds: nextLoadedSourceIds,
		};
	}

	const ordered = useMemo( () => orderedUnits( units ), [ units ] );
	const typeOptions = useMemo( () => buildTypeOptions( units, copy ), [ units, copy ] );
	const sourceOptions = useMemo( () => buildSourceOptions( sources, copy ), [ sources, copy ] );
	const filteredUnits = useMemo(
		() => filterUnits( ordered, { search, type: typeFilter, source: sourceFilter } ),
		[ ordered, search, typeFilter, sourceFilter ]
	);
	const sections = useMemo( () => groupUnits( filteredUnits, applied ), [ filteredUnits, applied ] );

	const loadUnits = async ( options = {} ) => {
		if ( loadingRef.current ) {
			return;
		}

		if ( ! sources.length ) {
			setLoaded( true );
			setUnits( [] );
			setMessage( null );
			return;
		}

		const filter = options.sourceFilter || sourceFilter;
		const force = Boolean( options.force );
		const sourcesToLoad = getSourcesToLoad( sources, filter, loadedSourceIds, force );
		if ( ! sourcesToLoad.length ) {
			setLoaded( true );
			setMessage( null );
			return;
		}

		loadingRef.current = true;
		setLoading( true );
		setMessage( null );

		let nextUnits = units;
		let nextApplied = applied;
		let nextLoadedSourceIds = { ...loadedSourceIds };
		const failures = [];

		for ( let index = 0; index < sourcesToLoad.length; index++ ) {
			const source = sourcesToLoad[ index ];
			const sourceTitle = source.title || source.id || '';
			setLoadingStatus( sprintf( '%s (%d/%d)', sourceTitle || copy.loading, index + 1, sourcesToLoad.length ) );

			try {
				const response = await restRequest( data, 'contentUnits', {
					sources: [ source ],
				} );
				const responseData = response && response.data ? response.data : {};
				const result = flattenSourceResults( responseData.sources || [], sources );

				if ( result.failures.length ) {
					failures.push( ...result.failures );
				} else {
					nextLoadedSourceIds = {
						...nextLoadedSourceIds,
						[ source.id ]: true,
					};
				}

				nextUnits = mergeUnitsForSources( nextUnits, result.units, [ source.id ] );
				nextApplied = normalizeObject( responseData.applied || nextApplied );

				setUnits( nextUnits );
				setApplied( nextApplied );
				setLoadedSourceIds( nextLoadedSourceIds );
				setLoaded( true );
				writeCache( nextUnits, nextApplied, nextLoadedSourceIds );
			} catch ( error ) {
				failures.push( {
					id: source.id,
					title: sourceTitle,
					message: error && error.message ? error.message : '',
				} );
			}
		}

		if ( failures.length ) {
			setMessage( {
				type: nextUnits.length ? 'warning' : 'error',
				text: nextUnits.length ? copy.partialFailure : copy.failure,
			} );
		}

		setLoaded( true );
		setLoading( false );
		setLoadingStatus( '' );
		loadingRef.current = false;
	};

	const applyUnit = async ( unit ) => {
		const source = unit.source || {};
		const cardKey = getCardKey( unit );

		setBusyKey( 'apply:' + cardKey );
		setMessage( null );

		try {
			const response = await restRequest( data, 'importContentUnit', {
				demo_key: source.id || unit.demoKey,
				url: source.baseRestUrl || unit.baseRestUrl,
				unit_type: unit.type,
				unit: unit.slug,
			} );
			const nextApplied = normalizeObject( response && response.data ? response.data.appliedContent : applied );

			setApplied( nextApplied );
			writeCache( units, nextApplied, loadedSourceIds );
			setMessage( { type: 'success', text: copy.importSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.importFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	const undoUnit = async ( unit, slot ) => {
		if ( ! unit || ! unit.type || ! unit.slug ) {
			return;
		}

		setBusyKey( 'undo:' + slot );
		setMessage( null );

		try {
			const response = await restRequest( data, 'undoContentUnit', {
				unit_type: unit.type,
				unit: unit.slug,
			} );
			const nextApplied = normalizeObject( response && response.data ? response.data.appliedContent : {} );

			setApplied( nextApplied );
			writeCache( units, nextApplied, loadedSourceIds );
			setMessage( { type: 'success', text: copy.undoSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.undoFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	useEffect( () => {
		if ( ! sources.length ) {
			setLoaded( true );
			return;
		}

		if ( cacheMatches ) {
			setUnits( contentPatternsCache.units );
			setApplied( normalizeObject( contentPatternsCache.applied ) );
			setLoadedSourceIds( getLoadedSourceIds( contentPatternsCache ) );
			setLoaded( true );
			return;
		}

		loadUnits( { sourceFilter } );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		if ( ! sources.length || loadingRef.current ) {
			return;
		}

		if ( 'all' === sourceFilter ) {
			if ( ! areAllSourcesLoaded( sources, loadedSourceIds ) ) {
				loadUnits( { sourceFilter: 'all' } );
			}
			return;
		}

		if ( ! loadedSourceIds[ sourceFilter ] ) {
			loadUnits( { sourceFilter } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sourceFilter ] );

	useEffect( () => {
		if ( contentPatternsCache && contentPatternsCache.sourcesKey === sourcesKey ) {
			contentPatternsCache.applied = applied;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ applied ] );

	if ( ! sources.length ) {
		return createElement(
			'section',
			{ className: 'pixelgrade-content-patterns' },
			createElement( 'h1', null, copy.title ),
			createElement( 'p', null, copy.empty )
		);
	}

	const showSkeleton = loading && ! loaded && ! units.length;

	return createElement(
		'section',
		{ className: 'pixelgrade-content-patterns' },
		createElement( ContentPatternsResponsiveStyles, null ),
		createElement( 'h1', null, copy.title ),
		createElement( 'p', null, copy.description ),
		renderMessage( message ),
		createElement( ContentToolbar, {
			search,
			onSearch: setSearch,
			typeFilter,
			onTypeFilter: ( value ) => setContentPreference( 'typeFilter', value ),
			sourceFilter,
			onSourceFilter: ( value ) => setContentPreference( 'sourceFilter', value ),
			viewMode,
			onViewMode: ( value ) => setContentPreference( 'viewMode', value ),
			columns,
			onColumns: ( value ) => setContentPreference( 'columns', value ),
			sources,
			typeOptions,
			sourceOptions,
			loading,
			loadingStatus,
			busyKey,
			copy,
			onRefresh: () => loadUnits( { sourceFilter, force: true } ),
		} ),
		showSkeleton ? createElement( ContentSkeleton, { columns, copy } ) : null,
		loaded && ! loading && ! units.length ? createElement( 'p', null, copy.empty ) : null,
		loaded && units.length && ! filteredUnits.length ? createElement( 'p', { style: { color: '#646970' } }, copy.emptyFiltered ) : null,
		loaded && filteredUnits.length
			? createElement(
					Fragment,
					null,
					sections.map( ( section ) =>
						createElement( ContentSection, {
							key: section.key,
							groupKey: section.key,
							units: section.units,
							applied,
							viewMode,
							columns,
							busyKey,
							copy,
							previewConfig,
							onApply: applyUnit,
							onPreview: setPreviewUnit,
							onUndo: undoUnit,
						} )
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
