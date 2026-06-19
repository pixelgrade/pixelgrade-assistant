/**
 * The granular Layouts tab.
 *
 * Lets an admin mix headers, footers, and templates from multiple starter sources without running the
 * full starter-content import.
 */
import { createElement, Fragment, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, CheckboxControl, Flex, FlexItem, Notice, Spinner } from '@wordpress/components';

const DEFAULT_LAYOUT_UNITS = {
	copy: {
		title: __( 'Layouts', 'pixelgrade_assistant' ),
		description: __( 'Apply headers, footers, and templates from different starters without importing their pages, posts, or projects.', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load layouts', 'pixelgrade_assistant' ),
		loading: __( 'Loading layouts...', 'pixelgrade_assistant' ),
		empty: __( 'No layouts are available from these sources.', 'pixelgrade_assistant' ),
		failure: __( 'Layouts could not be loaded. Please try again.', 'pixelgrade_assistant' ),
		partialFailure: __( 'Some layout sources could not be loaded.', 'pixelgrade_assistant' ),
		importLabel: __( 'Apply', 'pixelgrade_assistant' ),
		replaceLabel: __( 'Replace', 'pixelgrade_assistant' ),
		importing: __( 'Applying layout...', 'pixelgrade_assistant' ),
		importSuccess: __( 'Layout applied.', 'pixelgrade_assistant' ),
		importFailure: __( 'Layout could not be applied. Please try again.', 'pixelgrade_assistant' ),
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
	},
	sources: [],
	endpoints: {},
	applied: {},
};

const LAYOUT_UNIT_JOB_POLL_INTERVAL = 300;
const LAYOUT_UNIT_JOB_TIMEOUT = 120000;

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

function getSlotKey( unit ) {
	const type = unit && unit.type ? unit.type : '';
	const slug = unit && unit.slug ? unit.slug : '';

	return type && slug ? type + ':' + slug : '';
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

function groupUnits( units ) {
	return units.reduce(
		( groups, unit ) => {
			const key = getGroupKey( unit );

			if ( ! groups[ key ] ) {
				groups[ key ] = [];
			}

			groups[ key ].push( unit );

			return groups;
		},
		{
			headers: [],
			footers: [],
			templates: [],
			templateParts: [],
			features: [],
		}
	);
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
		return;
	}

	restRequest( data, 'prewarmUnitBundles', {
		demo_key: source.id,
		url: source.baseRestUrl,
		units: prewarmUnits,
	} ).catch( () => {} );
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

function AppliedLayouts( { applied, busyKey, copy, onUndo } ) {
	const slots = Object.keys( applied );

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.appliedTitle ) ),
		createElement(
			CardBody,
			null,
			slots.length
				? createElement(
						'ul',
						{ style: { margin: 0 } },
						slots.map( ( slot ) => {
							const unit = applied[ slot ] || {};
							const isBusy = busyKey === 'undo:' + slot;
							const label = getSlotTypeLabel( unit, copy );
							const source = unit.sourceTitle || unit.demoKey || '';

							return createElement(
								'li',
								{
									key: slot,
									style: {
										alignItems: 'center',
										borderTop: '1px solid #ddd',
										display: 'flex',
										gap: '12px',
										justifyContent: 'space-between',
										margin: 0,
										padding: '10px 0',
									},
								},
								createElement(
									'div',
									null,
									createElement( 'strong', null, label + ': ' + ( unit.title || unit.slug || slot ) ),
									source ? createElement( 'div', { style: { color: '#646970' } }, copy.sourceHeading + ': ' + source ) : null
								),
								createElement(
									Button,
									{
										variant: 'secondary',
										isDestructive: true,
										isBusy,
										disabled: Boolean( busyKey ),
										onClick: () => onUndo( unit, slot ),
									},
									isBusy ? copy.undoing : copy.undoLabel
								)
							);
						} )
				  )
				: createElement( 'p', { style: { margin: 0 } }, copy.appliedEmpty )
		)
	);
}

function UnitList( { title, units, applied, busyKey, copy, featureSamples, onFeatureSampleChange, onImport } ) {
	if ( ! units.length ) {
		return null;
	}

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, title ) ),
		createElement(
			CardBody,
			null,
			createElement(
				'ul',
				{ style: { margin: 0 } },
				units.map( ( unit ) => {
					const slot = getSlotKey( unit );
					const appliedUnit = applied[ slot ];
					const isCurrent = Boolean( appliedUnit && appliedUnit.demoKey === unit.source.id && appliedUnit.slug === unit.slug );
					const isBusy = busyKey === 'import:' + slot + ':' + unit.source.id;
					const preview = getPreviewUrl( unit );
					const source = unit.source || {};
					const sampleKey = slot + ':' + source.id;
					const isFeature = 'feature' === unit.type;
					const includeSample = isFeature
						? Object.prototype.hasOwnProperty.call( featureSamples, sampleKey )
							? Boolean( featureSamples[ sampleKey ] )
							: Boolean( unit.sampleDefault )
						: false;

					return createElement(
						'li',
						{
							key: slot + ':' + source.id,
							style: {
								alignItems: 'center',
								borderTop: '1px solid #ddd',
								display: 'flex',
								gap: '12px',
								justifyContent: 'space-between',
								margin: 0,
								padding: '12px 0',
							},
						},
						createElement(
							'div',
							{
								style: {
									alignItems: 'center',
									display: 'flex',
									gap: '12px',
									minWidth: 0,
								},
							},
							preview
								? createElement( 'img', {
										alt: '',
										src: preview,
										style: {
											aspectRatio: '4 / 3',
											background: '#f0f0f1',
											objectFit: 'cover',
											width: '96px',
										},
								  } )
								: null,
							createElement(
								'div',
								null,
								createElement( 'strong', null, unit.title || unit.slug ),
								createElement(
									'div',
									{ style: { color: '#646970', marginTop: '2px' } },
									copy.sourceHeading + ': ' + source.title
								),
								isFeature
									? createElement( CheckboxControl, {
											checked: includeSample,
											disabled: Boolean( busyKey ) || isCurrent,
											label: copy.sampleLabel,
											onChange: ( nextValue ) => onFeatureSampleChange( sampleKey, nextValue ),
											style: { marginTop: '8px' },
									  } )
									: null,
								createElement(
									'div',
									{ style: { alignItems: 'center', display: 'flex', gap: '8px', marginTop: '6px' } },
									renderSourceBadge( source, copy ),
									appliedUnit
										? createElement(
												'span',
												{ style: { color: '#646970', fontSize: '12px' } },
												copy.appliedLabel + ': ' + ( appliedUnit.sourceTitle || appliedUnit.demoKey || '' )
										  )
										: null
								)
							)
						),
						createElement(
							Button,
							{
								variant: isCurrent ? 'secondary' : 'primary',
								isBusy,
								disabled: Boolean( busyKey ) || isCurrent,
								onClick: () => onImport( unit, { includeSample } ),
							},
							isBusy ? copy.importing : isCurrent ? copy.appliedButton : appliedUnit ? copy.replaceLabel : copy.importLabel
						)
					);
				} )
			)
		)
	);
}

export function LayoutUnits() {
	const data = getLayoutUnitsData();
	const copy = mergeCopy( data.copy );
	const sources = Array.isArray( data.sources ) ? data.sources : [];
	const [ units, setUnits ] = useState( [] );
	const [ loaded, setLoaded ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );
	const [ applied, setApplied ] = useState( normalizeApplied( data.applied ) );
	const [ featureSamples, setFeatureSamples ] = useState( {} );

	const grouped = useMemo( () => groupUnits( units ), [ units ] );

	const loadUnits = async () => {
		if ( ! sources.length ) {
			return;
		}

		setLoading( true );
		setLoaded( false );
		setMessage( null );
		setUnits( [] );

		try {
			const results = await Promise.all(
				sources.map( async ( source ) => {
					try {
						const response = await restRequest( data, 'layoutUnits', {
							demo_key: source.id,
							url: source.baseRestUrl,
						} );
						const sourceUnits = response && response.data && Array.isArray( response.data.units ) ? response.data.units : [];
						prewarmSourceUnits( data, source, sourceUnits );

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

			const successful = results.filter( ( result ) => ! result.error );
			const failed = results.filter( ( result ) => result.error );

			setUnits( successful.reduce( ( list, result ) => list.concat( result.units ), [] ) );
			setLoaded( true );

			if ( failed.length && successful.length ) {
				setMessage( { type: 'warning', text: copy.partialFailure } );
			} else if ( failed.length ) {
				setMessage( { type: 'error', text: copy.failure } );
			}
		} finally {
			setLoading( false );
		}
	};

	const importUnit = async ( unit, options = {} ) => {
		if ( ! unit || ! unit.source ) {
			return;
		}

		const slot = getSlotKey( unit );
		const payload = {
			demo_key: unit.source.id,
			url: unit.source.baseRestUrl,
			unit_type: unit.type,
			unit: unit.slug || unit.id,
			...( 'feature' === unit.type ? { include_sample: Boolean( options.includeSample ) } : {} ),
		};
		const supportsQueuedImport = Boolean( getEndpoint( data, 'queueUnit' ).url && getEndpoint( data, 'unitJobStatus' ).url );

		setBusyKey( 'import:' + slot + ':' + unit.source.id );
		setMessage( null );

		try {
			let response;

			if ( supportsQueuedImport ) {
				const queued = await restRequest( data, 'queueUnit', payload );
				const jobId = queued && queued.data ? queued.data.jobId : '';
				const started = Date.now();

				if ( ! jobId ) {
					throw new Error( copy.importFailure );
				}

				while ( Date.now() - started < LAYOUT_UNIT_JOB_TIMEOUT ) {
					await delay( LAYOUT_UNIT_JOB_POLL_INTERVAL );

					const statusResponse = await restRequest( data, 'unitJobStatus', {
						job_id: jobId,
					} );
					const job = statusResponse && statusResponse.data ? statusResponse.data : {};

					if ( 'success' === job.status ) {
						response = job.result || {};
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
			}

			if ( response && response.data && response.data.appliedUnits ) {
				setApplied( normalizeApplied( response.data.appliedUnits ) );
			}

			setMessage( { type: 'success', text: copy.importSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.importFailure } );
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

	if ( ! sources.length ) {
		return createElement(
			'section',
			{ className: 'pixelgrade-layout-units' },
			createElement( 'h1', null, copy.title ),
			createElement( 'p', null, copy.empty )
		);
	}

	return createElement(
		'section',
		{ className: 'pixelgrade-layout-units' },
		createElement( 'h1', null, copy.title ),
		createElement( 'p', null, copy.description ),
		renderMessage( message ),
		createElement(
			Flex,
			{ align: 'center', gap: 4, style: { marginTop: '16px' } },
			createElement(
				FlexItem,
				null,
				createElement(
					Button,
					{
						variant: 'secondary',
						isBusy: loading,
						disabled: loading || Boolean( busyKey ),
						onClick: loadUnits,
					},
					loading ? copy.loading : copy.loadLabel
				)
			),
			loading
				? createElement(
						FlexItem,
						null,
						createElement( 'span', { style: { alignItems: 'center', display: 'inline-flex', gap: '8px' } }, createElement( Spinner, null ), copy.loading )
				  )
				: null
		),
		createElement( AppliedLayouts, {
			applied,
			busyKey,
			copy,
			onUndo: undoUnit,
		} ),
		loaded && ! units.length ? createElement( 'p', null, copy.empty ) : null,
		createElement(
			Fragment,
			null,
			createElement( UnitList, {
				title: copy.headers,
				units: grouped.headers,
				applied,
				busyKey,
				copy,
				featureSamples,
				onFeatureSampleChange: setFeatureSample,
				onImport: importUnit,
			} ),
			createElement( UnitList, {
				title: copy.footers,
				units: grouped.footers,
				applied,
				busyKey,
				copy,
				featureSamples,
				onFeatureSampleChange: setFeatureSample,
				onImport: importUnit,
			} ),
			createElement( UnitList, {
				title: copy.templatesType,
				units: grouped.templates,
				applied,
				busyKey,
				copy,
				featureSamples,
				onFeatureSampleChange: setFeatureSample,
				onImport: importUnit,
			} ),
			createElement( UnitList, {
				title: copy.features,
				units: grouped.features,
				applied,
				busyKey,
				copy,
				featureSamples,
				onFeatureSampleChange: setFeatureSample,
				onImport: importUnit,
			} ),
			createElement( UnitList, {
				title: __( 'Template parts', 'pixelgrade_assistant' ),
				units: grouped.templateParts,
				applied,
				busyKey,
				copy,
				featureSamples,
				onFeatureSampleChange: setFeatureSample,
				onImport: importUnit,
			} )
		)
	);
}
