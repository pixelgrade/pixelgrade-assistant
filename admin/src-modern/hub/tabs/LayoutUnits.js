/**
 * The granular Layouts tab.
 *
 * Lets an admin apply one template part or template from a starter source without running the
 * full starter-content import.
 */
import { createElement, Fragment, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Notice, SelectControl, Spinner } from '@wordpress/components';

const DEFAULT_LAYOUT_UNITS = {
	copy: {
		title: __( 'Layouts', 'pixelgrade_assistant' ),
		description: __( 'Apply one header, footer, or template from a starter without importing its pages, posts, or projects.', 'pixelgrade_assistant' ),
		sourceLabel: __( 'Source', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load layouts', 'pixelgrade_assistant' ),
		loading: __( 'Loading layouts...', 'pixelgrade_assistant' ),
		empty: __( 'No layouts are available from this source.', 'pixelgrade_assistant' ),
		failure: __( 'Layouts could not be loaded. Please try again.', 'pixelgrade_assistant' ),
		importLabel: __( 'Apply', 'pixelgrade_assistant' ),
		importing: __( 'Applying layout...', 'pixelgrade_assistant' ),
		importSuccess: __( 'Layout applied. Reset starter content from Tools to undo it.', 'pixelgrade_assistant' ),
		importFailure: __( 'Layout could not be applied. Please try again.', 'pixelgrade_assistant' ),
		templateParts: __( 'Template parts', 'pixelgrade_assistant' ),
		templates: __( 'Templates', 'pixelgrade_assistant' ),
		premiumLabel: __( 'Premium', 'pixelgrade_assistant' ),
		freeLabel: __( 'Free', 'pixelgrade_assistant' ),
	},
	sources: [],
	endpoints: {},
};

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

function getSourceLabel( source, copy ) {
	const badge = source.gate ? copy.premiumLabel : copy.freeLabel;

	return source.title + ' - ' + badge;
}

function groupUnits( units ) {
	return {
		wp_template_part: units.filter( ( unit ) => 'wp_template_part' === unit.type ),
		wp_template: units.filter( ( unit ) => 'wp_template' === unit.type ),
	};
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

function UnitList( { title, units, busyKey, copy, onImport } ) {
	if ( ! units.length ) {
		return null;
	}

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement( CardHeader, null, createElement( 'h2', null, title ) ),
		createElement(
			CardBody,
			null,
			createElement(
				'ul',
				{ style: { margin: 0 } },
				units.map( ( unit ) => {
					const key = unit.type + ':' + unit.id;
					const isBusy = busyKey === key;

					return createElement(
						'li',
						{
							key,
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
							createElement( 'strong', null, unit.title || unit.slug ),
							createElement( 'div', { style: { color: '#646970' } }, unit.slug )
						),
						createElement(
							Button,
							{
								variant: 'primary',
								isBusy,
								disabled: Boolean( busyKey ),
								onClick: () => onImport( unit ),
							},
							isBusy ? copy.importing : copy.importLabel
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
	const [ sourceId, setSourceId ] = useState( sources[ 0 ] ? sources[ 0 ].id : '' );
	const [ units, setUnits ] = useState( [] );
	const [ loadedSourceId, setLoadedSourceId ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );

	const source = useMemo(
		() => sources.find( ( item ) => item.id === sourceId ) || sources[ 0 ] || null,
		[ sources, sourceId ]
	);
	const grouped = useMemo( () => groupUnits( units ), [ units ] );

	const loadUnits = async () => {
		if ( ! source ) {
			return;
		}

		setLoading( true );
		setMessage( null );
		setUnits( [] );

		try {
			const response = await restRequest( data, 'layoutUnits', {
				demo_key: source.id,
				url: source.baseRestUrl,
			} );
			setUnits( response && response.data && Array.isArray( response.data.units ) ? response.data.units : [] );
			setLoadedSourceId( source.id );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.failure } );
		} finally {
			setLoading( false );
		}
	};

	const importUnit = async ( unit ) => {
		if ( ! source || ! unit ) {
			return;
		}

		const key = unit.type + ':' + unit.id;
		setBusyKey( key );
		setMessage( null );

		try {
			await restRequest( data, 'importUnit', {
				demo_key: source.id,
				url: source.baseRestUrl,
				unit_type: unit.type,
				unit: unit.slug || unit.id,
			} );
			setMessage( { type: 'success', text: copy.importSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.importFailure } );
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
			Card,
			null,
			createElement(
				CardBody,
				null,
				createElement(
					Flex,
					{ align: 'end', gap: 4 },
					createElement(
						FlexItem,
						{ style: { flex: '1 1 320px' } },
						createElement( SelectControl, {
							label: copy.sourceLabel,
							value: source ? source.id : '',
							options: sources.map( ( item ) => ( {
								label: getSourceLabel( item, copy ),
								value: item.id,
							} ) ),
							onChange: ( next ) => {
								setSourceId( next );
								setUnits( [] );
								setLoadedSourceId( '' );
								setMessage( null );
							},
						} )
					),
					createElement(
						FlexItem,
						null,
						createElement(
							Button,
							{
								variant: 'secondary',
								isBusy: loading,
								disabled: loading || ! source,
								onClick: loadUnits,
							},
							loading ? copy.loading : copy.loadLabel
						)
					)
				)
			)
		),
		loading ? createElement( 'p', { style: { alignItems: 'center', display: 'flex', gap: '8px' } }, createElement( Spinner, null ), copy.loading ) : null,
		! loading && loadedSourceId && ! units.length ? createElement( 'p', null, copy.empty ) : null,
		createElement(
			Fragment,
			null,
			createElement( UnitList, {
				title: copy.templateParts,
				units: grouped.wp_template_part,
				busyKey,
				copy,
				onImport: importUnit,
			} ),
			createElement( UnitList, {
				title: copy.templates,
				units: grouped.wp_template,
				busyKey,
				copy,
				onImport: importUnit,
			} )
		)
	);
}
