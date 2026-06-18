/**
 * The secondary System Status tab (#50).
 *
 * Renders Assistant's existing data-collector payload and uses the existing data_collect REST
 * endpoint to toggle/refresh diagnostics. No new diagnostics source is introduced here.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Spinner, ToggleControl } from '@wordpress/components';

const DEFAULT_SYSTEM_STATUS = {
	status: { allowDataCollect: false },
	copy: {
		title: __( 'System Status', 'pixelgrade_assistant' ),
		description: '',
		collectLabel: __( 'Allow diagnostic data collection', 'pixelgrade_assistant' ),
		collectEnabled: __( 'Diagnostic data collection is enabled.', 'pixelgrade_assistant' ),
		collectDisabled: __( 'Diagnostic data collection is disabled.', 'pixelgrade_assistant' ),
		enable: __( 'Enable', 'pixelgrade_assistant' ),
		disable: __( 'Disable', 'pixelgrade_assistant' ),
		refresh: __( 'Refresh data', 'pixelgrade_assistant' ),
		siteHealth: __( 'Open Site Health', 'pixelgrade_assistant' ),
		copyReport: __( 'Copy report', 'pixelgrade_assistant' ),
		copied: __( 'System report copied to clipboard.', 'pixelgrade_assistant' ),
		copyFailed: __( 'Could not copy automatically. Select the details and copy manually.', 'pixelgrade_assistant' ),
		empty: __( 'No diagnostic rows are available yet.', 'pixelgrade_assistant' ),
		unavailable: __( 'Enable diagnostic data collection to show installation and system details.', 'pixelgrade_assistant' ),
		sections: {
			installation: __( 'WordPress Installation', 'pixelgrade_assistant' ),
			system: __( 'System', 'pixelgrade_assistant' ),
			activePlugins: __( 'Active Plugins', 'pixelgrade_assistant' ),
		},
	},
	endpoints: {},
	siteHealthUrl: '',
};

function getSystemStatusData() {
	if ( typeof window !== 'undefined' && window.pixelgradeSystemStatus ) {
		return window.pixelgradeSystemStatus;
	}

	return DEFAULT_SYSTEM_STATUS;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_SYSTEM_STATUS.copy,
		...( copy || {} ),
		sections: {
			...DEFAULT_SYSTEM_STATUS.copy.sections,
			...( copy && copy.sections ? copy.sections : {} ),
		},
	};
}

function getPixassistRest() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest ) {
		return window.pixassist.wpRest;
	}

	return {};
}

function getEndpoint( data, action ) {
	if ( data.endpoints && data.endpoints.dataCollect && data.endpoints.dataCollect[ action ] ) {
		return data.endpoints.dataCollect[ action ];
	}

	const rest = getPixassistRest();
	return rest.endpoint && rest.endpoint.dataCollect && rest.endpoint.dataCollect[ action ]
		? rest.endpoint.dataCollect[ action ]
		: {};
}

function getRestNonce() {
	const rest = getPixassistRest();

	return rest.pixassist_nonce || '';
}

function getRestHeaders() {
	const rest = getPixassistRest();
	const headers = {};

	if ( rest.nonce ) {
		headers[ 'X-WP-Nonce' ] = rest.nonce;
	}

	return headers;
}

async function fetchJson( url, options = {} ) {
	const response = await window.fetch( url, options );

	if ( ! response.ok ) {
		throw new Error( 'status ' + response.status );
	}

	return response.json();
}

function addNonceToUrl( url ) {
	const nonce = getRestNonce();
	const separator = -1 === url.indexOf( '?' ) ? '?' : '&';

	return url + separator + 'pixassist_nonce=' + encodeURIComponent( nonce );
}

async function requestDataCollect( data, action, payload = null ) {
	const endpoint = getEndpoint( data, action );

	if ( ! endpoint.url ) {
		throw new Error( 'missing_data_collect_endpoint' );
	}

	const options = {
		method: endpoint.method || ( payload ? 'POST' : 'GET' ),
		credentials: 'same-origin',
		headers: getRestHeaders(),
	};

	let url = endpoint.url;

	if ( payload ) {
		options.headers = {
			...options.headers,
			'Content-Type': 'application/json',
		};
		options.body = JSON.stringify( {
			...payload,
			pixassist_nonce: getRestNonce(),
		} );
	} else {
		url = addNonceToUrl( url );
	}

	const response = await fetchJson( url, options );
	if ( response && response.code && 'success' !== response.code ) {
		throw new Error( response.message || response.code );
	}

	return response && response.data ? response.data : response;
}

function formatValue( value ) {
	if ( null === value || typeof value === 'undefined' ) {
		return '';
	}

	if ( 'boolean' === typeof value ) {
		return value ? 'true' : 'false';
	}

	if ( 'object' === typeof value ) {
		return JSON.stringify( value );
	}

	return String( value );
}

function humanBytes( bytes ) {
	const units = [ 'bytes', 'KB', 'MB', 'GB', 'TB' ];
	let value = Number( bytes );
	let unit = 0;

	while ( value >= 1024 && unit < units.length - 1 ) {
		value /= 1024;
		unit++;
	}

	// Drop the decimal for whole numbers (1 GB, not 1.00 GB); keep one for the rest.
	const rounded = value % 1 === 0 ? value : Math.round( value * 10 ) / 10;

	return rounded + ' ' + units[ unit ];
}

/**
 * Format a diagnostic row's value for display, making raw machine values human-readable.
 *
 * Byte counts (memory limit, post max size) arrive as raw integers; show them as KB/MB/GB while
 * keeping the exact number alongside. A `0` execution-time limit means "unlimited", not "0 seconds".
 */
function formatRowValue( row ) {
	const raw = row.value || row.version || row.plugin || '';
	const label = String( row.label || row.name || row.key || '' );
	const text = formatValue( raw );

	if ( /memory|max.?size|max.?upload|size limit/i.test( label ) && /^\d{4,}$/.test( String( raw ).trim() ) ) {
		return humanBytes( raw ) + ' (' + text + ')';
	}

	if ( /execution time/i.test( label ) && /^0(\s*s)?$/i.test( text.trim() ) ) {
		return __( 'Unlimited', 'pixelgrade_assistant' );
	}

	return text;
}

function buildReportText( copy, status ) {
	const sectionFor = ( title, rows, onlyViewable ) => {
		const normalized = getRows( rows, onlyViewable );
		if ( ! normalized.length ) {
			return '';
		}

		const lines = normalized.map(
			( row ) => '  ' + ( row.label || row.name || row.key ) + ': ' + formatRowValue( row )
		);

		return '## ' + title + '\n' + lines.join( '\n' ) + '\n';
	};

	return [
		sectionFor( copy.sections.installation, status.installation, true ),
		sectionFor( copy.sections.system, status.system, false ),
		sectionFor( copy.sections.activePlugins, status.activePlugins, false ),
	]
		.filter( Boolean )
		.join( '\n' )
		.trim();
}

function getRows( rows, onlyViewable = false ) {
	if ( ! rows || 'object' !== typeof rows ) {
		return [];
	}

	return Object.keys( rows )
		.map( ( key ) => ( { key, ...( rows[ key ] || {} ) } ) )
		.filter( ( row ) => ! onlyViewable || true === row.is_viewable );
}

function renderTable( title, rows, emptyCopy, onlyViewable = false ) {
	const normalized = getRows( rows, onlyViewable );

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement( CardHeader, null, createElement( 'h3', { style: { margin: 0 } }, title ) ),
		createElement(
			CardBody,
			null,
			normalized.length
				? createElement(
						'table',
						{ className: 'widefat striped', style: { margin: 0 } },
						createElement(
							'tbody',
							null,
							normalized.map( ( row ) =>
								createElement(
									'tr',
									{ key: row.key },
									createElement( 'th', { scope: 'row', style: { width: '35%' } }, row.label || row.name || row.key ),
									createElement( 'td', null, formatRowValue( row ) )
								)
							)
						)
				  )
				: createElement( 'p', { style: { margin: 0, color: '#646970' } }, emptyCopy )
		)
	);
}

function renderMessage( message ) {
	if ( ! message ) {
		return null;
	}

	const colors = {
		error: { background: '#fcf0f1', border: '#d63638', color: '#8a2424' },
		success: { background: '#edfaef', border: '#00a32a', color: '#0a5f1d' },
		info: { background: '#eef5ff', border: '#72aee6', color: '#1e5aa8' },
	};
	const tone = colors[ message.type ] || colors.info;

	return createElement(
		'div',
		{
			style: {
				background: tone.background,
				borderLeft: '4px solid ' + tone.border,
				color: tone.color,
				margin: '12px 0',
				padding: '10px 12px',
			},
		},
		message.text
	);
}

export function SystemStatus() {
	const data = getSystemStatusData();
	const copy = mergeCopy( data.copy );
	const [ status, setStatus ] = useState( data.status || DEFAULT_SYSTEM_STATUS.status );
	const [ busy, setBusy ] = useState( false );
	const [ message, setMessage ] = useState( null );
	const allowed = Boolean( status && status.allowDataCollect );

	const refresh = async () => {
		setBusy( true );
		setMessage( null );
		try {
			const nextStatus = await requestDataCollect( data, 'get' );
			setStatus( nextStatus || { allowDataCollect: false } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error.message || __( 'Could not refresh diagnostics.', 'pixelgrade_assistant' ) } );
		} finally {
			setBusy( false );
		}
	};

	const copyReport = async () => {
		const report = buildReportText( copy, status );

		try {
			if ( typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText ) {
				await navigator.clipboard.writeText( report );
			} else {
				throw new Error( 'clipboard_unavailable' );
			}
			setMessage( { type: 'success', text: copy.copied } );
		} catch ( error ) {
			setMessage( { type: 'error', text: copy.copyFailed } );
		}
	};

	const toggleCollect = async ( nextValue ) => {
		setBusy( true );
		setMessage( null );
		try {
			await requestDataCollect( data, 'set', { allow_data_collect: nextValue } );
			const nextStatus = await requestDataCollect( data, 'get' );
			setStatus( nextStatus || { allowDataCollect: nextValue } );
			setMessage( {
				type: 'success',
				text: nextValue ? copy.collectEnabled : copy.collectDisabled,
			} );
		} catch ( error ) {
			setMessage( { type: 'error', text: error.message || __( 'Could not update diagnostics.', 'pixelgrade_assistant' ) } );
		} finally {
			setBusy( false );
		}
	};

	return createElement(
		Fragment,
		null,
		createElement(
			Card,
			null,
			createElement(
				CardBody,
				null,
				createElement(
					Flex,
					{ align: 'flex-start', justify: 'space-between', gap: 4 },
					createElement(
						FlexItem,
						{ style: { flex: '1 1 auto' } },
						createElement( 'h2', { style: { margin: 0 } }, copy.title ),
						copy.description ? createElement( 'p', { style: { color: '#50575e', margin: '8px 0 0' } }, copy.description ) : null
					),
					createElement(
						FlexItem,
						null,
						createElement( ToggleControl, {
							checked: allowed,
							disabled: busy,
							label: copy.collectLabel,
							onChange: toggleCollect,
						} )
					)
				),
				renderMessage( message ),
				createElement(
					Flex,
					{ align: 'center', gap: 2, justify: 'flex-start' },
					createElement(
						FlexItem,
						null,
						createElement(
							Button,
							{ variant: 'secondary', onClick: refresh, disabled: busy },
							busy ? createElement( Spinner, { style: { margin: '0 6px 0 0' } } ) : null,
							copy.refresh
						)
					),
					allowed
						? createElement(
								FlexItem,
								null,
								createElement(
									Button,
									{ variant: 'secondary', onClick: copyReport, disabled: busy },
									copy.copyReport
								)
						  )
						: null,
					data.siteHealthUrl
						? createElement(
								FlexItem,
								null,
								createElement( Button, { variant: 'tertiary', href: data.siteHealthUrl }, copy.siteHealth )
						  )
						: null
				)
			)
		),
		allowed
			? createElement(
					Fragment,
					null,
					renderTable( copy.sections.installation, status.installation, copy.empty, true ),
					renderTable( copy.sections.system, status.system, copy.empty ),
					renderTable( copy.sections.activePlugins, status.activePlugins, copy.empty )
			  )
			: createElement(
					'div',
					{
						style: {
							background: '#f6f7f7',
							border: '1px solid #dcdcde',
							marginTop: '16px',
							padding: '16px',
						},
					},
					copy.unavailable
			  )
	);
}
