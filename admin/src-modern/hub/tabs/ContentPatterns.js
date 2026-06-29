/**
 * Page Patterns tab.
 *
 * Imports one page-like content example from a starter source without running the full starter import.
 */
import { createElement, Fragment, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Icon, Notice, SearchControl, SelectControl, Spinner } from '@wordpress/components';
import { check, update } from '@wordpress/icons';

const DEFAULT_CONTENT_PATTERNS = {
	copy: {
		title: __( 'Page Patterns', 'pixelgrade_assistant' ),
		description: __( 'Import one reusable page, post, project, or service-style content example without importing a full starter site.', 'pixelgrade_assistant' ),
		sourceLabel: __( 'Source', 'pixelgrade_assistant' ),
		typeLabel: __( 'Type', 'pixelgrade_assistant' ),
		allSources: __( 'All sources', 'pixelgrade_assistant' ),
		allTypes: __( 'All types', 'pixelgrade_assistant' ),
		searchLabel: __( 'Search page patterns', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load page patterns', 'pixelgrade_assistant' ),
		refreshLabel: __( 'Refresh', 'pixelgrade_assistant' ),
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
		appliedTitle: __( 'Applied page patterns', 'pixelgrade_assistant' ),
		appliedEmpty: __( 'No page patterns are applied yet.', 'pixelgrade_assistant' ),
		appliedLabel: __( 'Applied', 'pixelgrade_assistant' ),
		lockedLabel: __( 'Unavailable', 'pixelgrade_assistant' ),
		mediaLabel: __( 'media', 'pixelgrade_assistant' ),
	},
	sources: [],
	endpoints: {},
	applied: {},
};

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
				},
			} );
		} );
	} );

	return { units, failures };
}

function buildTypeOptions( units, copy ) {
	const labels = {};

	units.forEach( ( unit ) => {
		if ( unit.type ) {
			labels[ unit.type ] = unit.kindLabel || unit.type;
		}
	} );

	return [
		{ label: copy.allTypes, value: 'all' },
		...Object.keys( labels )
			.sort( ( a, b ) => labels[ a ].localeCompare( labels[ b ] ) )
			.map( ( type ) => ( { label: labels[ type ], value: type } ) ),
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

function getInitialSourceFilter( sources ) {
	return sources.length && sources[ 0 ].id ? sources[ 0 ].id : 'all';
}

function getLoadedSourceIds( cache ) {
	return normalizeObject( cache ? cache.loadedSourceIds : {} );
}

function areAllSourcesLoaded( sources, loadedSourceIds ) {
	return Boolean( sources.length ) && sources.every( ( source ) => source.id && loadedSourceIds[ source.id ] );
}

function getSourcesToLoad( sources, sourceFilter, loadedSourceIds ) {
	if ( ! sources.length ) {
		return [];
	}

	if ( sourceFilter && 'all' !== sourceFilter ) {
		const source = findSource( sources, sourceFilter );
		return source ? [ source ] : [];
	}

	const unloadedSource = sources.find( ( source ) => source.id && ! loadedSourceIds[ source.id ] );
	return unloadedSource ? [ unloadedSource ] : [ sources[ 0 ] ];
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

function filterUnits( units, filters ) {
	const query = ( filters.search || '' ).trim().toLowerCase();

	return units.filter( ( unit ) => {
		if ( filters.type && 'all' !== filters.type && unit.type !== filters.type ) {
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
				( unit.source && unit.source.title ? unit.source.title : '' )
			).toLowerCase();

			if ( ! haystack.includes( query ) ) {
				return false;
			}
		}

		return true;
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

function renderAppliedSummary( applied, copy, busyKey, onUndo ) {
	const appliedUnits = Object.keys( applied ).map( ( slot ) => ( { ...applied[ slot ], slot } ) );

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.appliedTitle ) ),
		createElement(
			CardBody,
			null,
			appliedUnits.length
				? createElement(
						'div',
						{ style: { display: 'grid', gap: '10px' } },
						appliedUnits.map( ( unit ) =>
							createElement(
								Flex,
								{ key: unit.slot, align: 'center', justify: 'space-between', gap: 3 },
								createElement(
									FlexItem,
									{ style: { minWidth: 0 } },
									createElement( 'strong', null, unit.title || unit.slug ),
									createElement(
										'div',
										{ style: { color: '#757575', fontSize: '12px', marginTop: '2px' } },
										[ unit.kindLabel || unit.type, unit.sourceTitle || unit.demoKey ].filter( Boolean ).join( ' / ' )
									)
								),
								createElement(
									FlexItem,
									null,
									createElement(
										Button,
										{
											variant: 'secondary',
											isDestructive: true,
											isBusy: busyKey === 'undo:' + unit.slot,
											disabled: Boolean( busyKey ),
											onClick: () => onUndo( unit ),
										},
										busyKey === 'undo:' + unit.slot ? copy.undoing : copy.undoLabel
									)
								)
							)
						)
				  )
				: createElement( 'p', { style: { margin: 0 } }, copy.appliedEmpty )
		)
	);
}

function renderUnitCard( unit, context ) {
	const { applied, busyKey, copy, onApply, onUndo } = context;
	const slot = getSlotKey( unit );
	const current = isUnitCurrent( unit, applied );
	const slotFilled = Boolean( applied[ slot ] );
	const busyApply = busyKey === 'apply:' + slot + ':' + ( unit.source ? unit.source.id : '' );
	const busyUndo = busyKey === 'undo:' + slot;
	const disabled = Boolean( busyKey ) || false === unit.available;
	const reason = false === unit.available ? unit.availabilityReason || copy.lockedLabel : '';

	return createElement(
		Card,
		{ key: slot + ':' + ( unit.source ? unit.source.id : '' ), style: { borderRadius: '6px' } },
		createElement(
			CardBody,
			null,
			createElement(
				Flex,
				{ align: 'flex-start', justify: 'space-between', gap: 4 },
				createElement(
					FlexItem,
					{ style: { minWidth: 0 } },
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' } },
						createElement( 'strong', { style: { fontSize: '14px' } }, unit.title || unit.slug ),
						current
							? createElement(
									'span',
									{ style: { alignItems: 'center', color: '#008a20', display: 'inline-flex', fontSize: '12px', gap: '3px' } },
									createElement( Icon, { icon: check, size: 16 } ),
									copy.appliedLabel
							  )
							: null,
						false === unit.available
							? createElement(
									'span',
									{ style: { color: '#8a2424', fontSize: '12px', fontWeight: 600 } },
									copy.lockedLabel
							  )
							: null
					),
					unit.description ? createElement( 'p', { style: { margin: '0 0 8px' } }, unit.description ) : null,
					createElement(
						'div',
						{ style: { color: '#757575', fontSize: '12px' } },
						[
							unit.kindLabel || unit.type,
							unit.source && unit.source.title ? unit.source.title : '',
							unit.mediaCount ? sprintf( '%d %s', unit.mediaCount, copy.mediaLabel ) : '',
						]
							.filter( Boolean )
							.join( ' / ' )
					),
					reason ? createElement( 'div', { style: { color: '#8a2424', fontSize: '12px', marginTop: '8px' } }, reason ) : null
				),
				createElement(
					FlexItem,
					null,
					current
						? createElement(
								Button,
								{
									variant: 'secondary',
									isDestructive: true,
									isBusy: busyUndo,
									disabled: Boolean( busyKey ),
									onClick: () => onUndo( unit ),
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
								},
								busyApply ? copy.importing : ( slotFilled ? copy.replaceLabel : copy.importLabel )
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
	const [ units, setUnits ] = useState( contentPatternsCache ? contentPatternsCache.units : [] );
	const [ applied, setApplied ] = useState( normalizeObject( contentPatternsCache ? contentPatternsCache.applied : data.applied ) );
	const [ loadedSourceIds, setLoadedSourceIds ] = useState( getLoadedSourceIds( contentPatternsCache ) );
	const [ loaded, setLoaded ] = useState( Boolean( contentPatternsCache ) );
	const [ loading, setLoading ] = useState( false );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );
	const [ search, setSearch ] = useState( '' );
	const [ typeFilter, setTypeFilter ] = useState( 'all' );
	const [ sourceFilter, setSourceFilter ] = useState( getInitialSourceFilter( sources ) );

	const typeOptions = useMemo( () => buildTypeOptions( units, copy ), [ units, copy ] );
	const sourceOptions = useMemo( () => buildSourceOptions( sources, copy ), [ sources, copy ] );
	const currentSourceLoaded = 'all' === sourceFilter ? areAllSourcesLoaded( sources, loadedSourceIds ) : Boolean( loadedSourceIds[ sourceFilter ] );
	const filteredUnits = useMemo(
		() => filterUnits( units, { search, type: typeFilter, source: sourceFilter } ),
		[ units, search, typeFilter, sourceFilter ]
	);

	const loadUnits = async () => {
		if ( ! sources.length ) {
			setLoaded( true );
			setUnits( [] );
			setMessage( null );
			return;
		}

		const sourcesToLoad = getSourcesToLoad( sources, sourceFilter, loadedSourceIds );
		if ( ! sourcesToLoad.length ) {
			setLoaded( true );
			setMessage( null );
			return;
		}

		setLoading( true );
		setMessage( null );

		try {
			const response = await restRequest( data, 'contentUnits', {
				sources: sourcesToLoad,
			} );
			const responseData = response && response.data ? response.data : {};
			const result = flattenSourceResults( responseData.sources || [], sources );
			const nextApplied = normalizeObject( responseData.applied || applied );
			const loadedIds = sourcesToLoad.map( ( source ) => source.id ).filter( Boolean );
			const nextUnits = mergeUnitsForSources( units, result.units, loadedIds );
			const nextLoadedSourceIds = { ...loadedSourceIds };
			loadedIds.forEach( ( id ) => {
				nextLoadedSourceIds[ id ] = true;
			} );

			setUnits( nextUnits );
			setApplied( nextApplied );
			setLoadedSourceIds( nextLoadedSourceIds );
			setLoaded( true );
			contentPatternsCache = {
				units: nextUnits,
				applied: nextApplied,
				loadedSourceIds: nextLoadedSourceIds,
			};

			if ( result.failures.length ) {
				setMessage( {
					type: nextUnits.length ? 'warning' : 'error',
					text: nextUnits.length ? copy.partialFailure : copy.failure,
				} );
			}
		} catch ( error ) {
			setLoaded( true );
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.failure } );
		} finally {
			setLoading( false );
		}
	};

	const applyUnit = async ( unit ) => {
		const source = unit.source || {};
		const slot = getSlotKey( unit );

		setBusyKey( 'apply:' + slot + ':' + source.id );
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
			contentPatternsCache = {
				units,
				applied: nextApplied,
				loadedSourceIds,
			};
			setMessage( { type: 'success', text: copy.importSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.importFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	const undoUnit = async ( unit ) => {
		const slot = unit.slot || getSlotKey( unit );

		setBusyKey( 'undo:' + slot );
		setMessage( null );

		try {
			const response = await restRequest( data, 'undoContentUnit', {
				unit_type: unit.type,
				unit: unit.slug,
			} );
			const nextApplied = normalizeObject( response && response.data ? response.data.appliedContent : {} );

			setApplied( nextApplied );
			contentPatternsCache = {
				units,
				applied: nextApplied,
				loadedSourceIds,
			};
			setMessage( { type: 'success', text: copy.undoSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.undoFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	return createElement(
		'section',
		{ className: 'pixelgrade-content-patterns' },
		createElement( 'h1', null, copy.title ),
		createElement( 'p', null, copy.description ),
		renderMessage( message ),
		createElement(
			Card,
			{ style: { marginTop: '16px' } },
			createElement(
				CardBody,
				null,
				createElement(
					Flex,
					{ align: 'flex-end', gap: 4, justify: 'space-between' },
					createElement(
						FlexItem,
						{ style: { flex: '1 1 220px', minWidth: '220px' } },
						createElement( SearchControl, {
							label: copy.searchLabel,
							value: search,
							onChange: setSearch,
							placeholder: copy.searchLabel,
						} )
					),
					createElement(
						FlexItem,
						{ style: { flex: '0 1 180px' } },
						createElement( SelectControl, {
							label: copy.typeLabel,
							value: typeFilter,
							options: typeOptions,
							onChange: setTypeFilter,
						} )
					),
					createElement(
						FlexItem,
						{ style: { flex: '0 1 220px' } },
						createElement( SelectControl, {
							label: copy.sourceLabel,
							value: sourceFilter,
							options: sourceOptions,
							onChange: setSourceFilter,
						} )
					),
					createElement(
						FlexItem,
						null,
						createElement(
							Button,
							{
								variant: currentSourceLoaded ? 'secondary' : 'primary',
								icon: currentSourceLoaded ? update : undefined,
								isBusy: loading,
								disabled: loading || Boolean( busyKey ),
								onClick: loadUnits,
							},
							loading ? copy.loading : ( currentSourceLoaded ? copy.refreshLabel : copy.loadLabel )
						)
					)
				)
			)
		),
		renderAppliedSummary( applied, copy, busyKey, undoUnit ),
		loading
			? createElement(
					'div',
					{ style: { alignItems: 'center', display: 'inline-flex', gap: '8px', marginTop: '16px' } },
					createElement( Spinner, null ),
					copy.loading
			  )
			: null,
		loaded && ! loading && ! units.length ? createElement( 'p', { style: { marginTop: '16px' } }, copy.empty ) : null,
		loaded && ! loading && units.length && ! filteredUnits.length ? createElement( 'p', { style: { marginTop: '16px' } }, copy.emptyFiltered ) : null,
		createElement(
			Fragment,
			null,
			filteredUnits.length
				? createElement(
						'div',
						{ style: { display: 'grid', gap: '12px', marginTop: '16px' } },
						filteredUnits.map( ( unit ) =>
							renderUnitCard( unit, {
								applied,
								busyKey,
								copy,
								onApply: applyUnit,
								onUndo: undoUnit,
							} )
						)
				  )
				: null
		)
	);
}
