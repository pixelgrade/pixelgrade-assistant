/**
 * The mixed Starter Sites tab (#49).
 *
 * Free starters come from Assistant's existing `starterContent.demos` config. Premium starters may
 * be injected by Pixelgrade Plus through the PHP `pixelgrade/admin_hub/starters` filter and carry a
 * `gate` so this presentational tab can show an upsell without owning commercial state.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Spinner } from '@wordpress/components';

const DEFAULT_STARTER_SITES = {
	starters: [],
	copy: {
		title: __( 'Starter Sites', 'pixelgrade_assistant' ),
		description: '',
		empty: __( 'No starter sites are currently configured.', 'pixelgrade_assistant' ),
		confirm: __( 'Starter content was already imported. Import it again?', 'pixelgrade_assistant' ),
		importing: __( 'Getting data about available content...', 'pixelgrade_assistant' ),
		error: __( 'This starter content is not available right now. Please try again later.', 'pixelgrade_assistant' ),
		failed: __( 'Something went wrong.', 'pixelgrade_assistant' ),
		success: __( 'Successfully imported.', 'pixelgrade_assistant' ),
		labels: {
			free: __( 'Free', 'pixelgrade_assistant' ),
			premium: __( 'Premium', 'pixelgrade_assistant' ),
			locked: __( 'Requires Pixelgrade Plus', 'pixelgrade_assistant' ),
		},
		actions: {
			import: __( 'Import', 'pixelgrade_assistant' ),
			imported: __( 'Imported', 'pixelgrade_assistant' ),
			reimport: __( 'Re-import', 'pixelgrade_assistant' ),
			preview: __( 'Preview', 'pixelgrade_assistant' ),
			setupPlus: __( 'Set up Pixelgrade Plus', 'pixelgrade_assistant' ),
			managePlus: __( 'Manage Pixelgrade Plus', 'pixelgrade_assistant' ),
			working: __( 'Importing...', 'pixelgrade_assistant' ),
			managePlugins: __( 'Install required plugins', 'pixelgrade_assistant' ),
		},
		requirements: {
			heading: __( 'This starter needs a couple of plugins first', 'pixelgrade_assistant' ),
			message: __(
				'To import this starter exactly as designed, install and activate %s. Without them the imported pages would render broken (missing blocks, colors and fonts).',
				'pixelgrade_assistant'
			),
			separator: __( ', ', 'pixelgrade_assistant' ),
			and: __( ' and ', 'pixelgrade_assistant' ),
		},
		pluginsTabUrl: '',
	},
	endpoints: {},
	imported: {},
	plus: {
		is_plus_active: false,
		is_plus_licensed: false,
		plus_settings_url: '',
		plus_product_label: 'Pixelgrade Plus',
	},
};

export function getStarterSitesData() {
	if ( typeof window !== 'undefined' && window.pixelgradeStarterSites ) {
		return window.pixelgradeStarterSites;
	}

	return DEFAULT_STARTER_SITES;
}

export function mergeCopy( copy ) {
	return {
		...DEFAULT_STARTER_SITES.copy,
		...( copy || {} ),
		labels: {
			...DEFAULT_STARTER_SITES.copy.labels,
			...( copy && copy.labels ? copy.labels : {} ),
		},
		actions: {
			...DEFAULT_STARTER_SITES.copy.actions,
			...( copy && copy.actions ? copy.actions : {} ),
		},
		requirements: {
			...DEFAULT_STARTER_SITES.copy.requirements,
			...( copy && copy.requirements ? copy.requirements : {} ),
		},
		pluginsTabUrl: ( copy && copy.pluginsTabUrl ) || DEFAULT_STARTER_SITES.copy.pluginsTabUrl,
	};
}

function trailingslash( value ) {
	return String( value || '' ).replace( /\/?$/, '/' );
}

function valuesSortedByPriority( data ) {
	const list = Array.isArray( data ) ? data.slice() : Object.keys( data || {} ).map( ( key ) => data[ key ] );

	return list
		.filter( Boolean )
		.sort( ( a, b ) => {
			const aPriority = Number( a.priority || 10 );
			const bPriority = Number( b.priority || 10 );

			if ( aPriority === bPriority ) {
				return String( a.name || '' ).localeCompare( String( b.name || '' ) );
			}

			return aPriority - bPriority;
		} );
}

function isEmptyObject( value ) {
	return ! value || ! Object.keys( value ).length;
}

function getPixassistRest() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest ) {
		return window.pixassist.wpRest;
	}

	return {};
}

function getEndpoint( data, key ) {
	if ( data.endpoints && data.endpoints[ key ] ) {
		return data.endpoints[ key ];
	}

	const rest = getPixassistRest();
	return rest.endpoint && rest.endpoint[ key ] ? rest.endpoint[ key ] : {};
}

function getAdminUrl() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.adminUrl ) {
		return window.pixassist.adminUrl;
	}

	return '';
}

function getPlusSetupUrl( plus ) {
	return ( plus && plus.plus_settings_url ) || 'https://pixelgrade.com/';
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

export function isStarterImported( imported, starterId ) {
	return Boolean( imported && imported[ starterId ] && Object.keys( imported[ starterId ] ).length );
}

/**
 * The starter's required companion plugins that are not active yet.
 *
 * Data-driven: each starter declares its `requiredPlugins` (default Nova Blocks + Style Manager for
 * the free Anima starters) with live install/active status stamped server-side. The gate only blocks
 * on plugins that are required AND not active.
 *
 * @param {Object} starter Normalized starter descriptor.
 * @return {Array} Missing required plugins (each: slug, name, isInstalled, isActive).
 */
export function getMissingRequiredPlugins( starter ) {
	const required = Array.isArray( starter.requiredPlugins ) ? starter.requiredPlugins : [];

	return required.filter( ( plugin ) => plugin && plugin.slug && ! plugin.isActive );
}

/**
 * Join plugin names into a friendly list: "A", "A and B", "A, B and C".
 *
 * @param {Array}  names Plugin display names.
 * @param {Object} copy  Requirements copy (separator + and).
 * @return {string}
 */
function formatPluginNames( names, copy ) {
	if ( ! names.length ) {
		return '';
	}

	if ( 1 === names.length ) {
		return names[ 0 ];
	}

	const separator = ( copy && copy.separator ) || ', ';
	const lastSeparator = ( copy && copy.and ) || ' and ';

	return names.slice( 0, -1 ).join( separator ) + lastSeparator + names[ names.length - 1 ];
}

function isStarterLocked( starter, plus ) {
	if ( 'plus_licensed' === starter.gate ) {
		return ! ( plus && plus.is_plus_licensed );
	}

	if ( 'plus' === starter.gate ) {
		return ! ( plus && plus.is_plus_active );
	}

	return false;
}

function buildImportTasks( starter, config, data, setProgress ) {
	const tasks = [];
	const demoKey = starter.id;
	const baseUrl = trailingslash( starter.baseRestUrl );

	const addImportTask = ( label, type, args ) => {
		tasks.push( async () => {
			setProgress( label );
			await restRequest( data, 'import', {
				demo_key: demoKey,
				type,
				url: baseUrl,
				args,
			} );
		} );
	};

	if ( config.pre_settings ) {
		addImportTask( __( 'Preparing settings...', 'pixelgrade_assistant' ), 'pre_settings', { data: config.pre_settings } );
	}

	if ( config.media && ! isEmptyObject( config.media.placeholders ) ) {
		const mediaUrl = trailingslash( starter.baseRestUrl ) + 'media';
		Object.keys( config.media ).forEach( ( groupKey ) => {
			if ( 'placeholders' === groupKey || ! config.media[ groupKey ] ) {
				return;
			}

			Object.keys( config.media[ groupKey ] ).forEach( ( itemKey ) => {
				const remoteId = config.media[ groupKey ][ itemKey ];
				tasks.push( async () => {
					setProgress( __( 'Importing media...', 'pixelgrade_assistant' ) );
					const attachment = await fetchJson( mediaUrl + '?id=' + encodeURIComponent( remoteId ), { method: 'GET' } );

					if ( ! attachment || 'success' !== attachment.code || ! attachment.data || ! attachment.data.media ) {
						return;
					}

					const media = attachment.data.media;
					if ( ! media.title || ! media.ext || ! media.data ) {
						return;
					}

					await restRequest( data, 'uploadMedia', {
						demo_key: demoKey,
						title: media.title,
						remote_id: remoteId,
						file_data: media.data,
						ext: media.ext,
						group: groupKey,
					} );
				} );
			} );
		} );
	}

	valuesSortedByPriority( config.taxonomies ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids ) {
			return;
		}

		addImportTask( __( 'Importing taxonomies...', 'pixelgrade_assistant' ), 'taxonomy', {
			tax: entry.name,
			ids: entry.ids,
		} );
	} );

	valuesSortedByPriority( config.post_types ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids ) {
			return;
		}

		addImportTask( __( 'Importing content...', 'pixelgrade_assistant' ), 'post_type', {
			post_type: entry.name,
			ids: entry.ids,
		} );
	} );

	if ( config.widgets ) {
		addImportTask( __( 'Importing widgets...', 'pixelgrade_assistant' ), 'parsed_widgets', { data: 'ok' } );
	}

	if ( config.post_settings ) {
		tasks.push( async () => {
			const adminUrl = getAdminUrl();
			if ( adminUrl ) {
				setProgress( __( 'Preparing the admin area...', 'pixelgrade_assistant' ) );
				await window.fetch( adminUrl, { credentials: 'same-origin' } ).catch( () => {} );
			}

			if ( config.widgets ) {
				await restRequest( data, 'import', {
					demo_key: demoKey,
					type: 'parsed_widgets',
					url: baseUrl,
					args: { data: 'ok' },
				} );
			}
		} );
		addImportTask( __( 'Wrapping it up...', 'pixelgrade_assistant' ), 'post_settings', { data: config.post_settings } );
	}

	return tasks;
}

export async function importStarter( starter, data, copy, setProgress ) {
	setProgress( copy.importing );
	const config = await fetchJson( trailingslash( starter.baseRestUrl ) + 'data', { method: 'GET' } );

	if ( ! config || 'success' !== config.code ) {
		throw new Error( config && config.message ? config.message : copy.failed );
	}

	const tasks = buildImportTasks( starter, config.data || {}, data, setProgress );

	for ( const task of tasks ) {
		await task();
	}
}

function renderStatusNotice( state, copy ) {
	if ( ! state || ! state.status || 'idle' === state.status ) {
		return null;
	}

	const tone =
		'error' === state.status
			? { background: '#fcf0f1', border: '#f0b8bd', color: '#8a2424' }
			: 'success' === state.status
			? { background: '#edfaef', border: '#b8e6c2', color: '#0a7a28' }
			: 'requirements' === state.status
			? { background: '#fff8e5', border: '#f0d58a', color: '#7a4d00' }
			: { background: '#eef5ff', border: '#b8d4fb', color: '#1e5aa8' };

	const isRequirements = 'requirements' === state.status;
	const requirementsCopy = ( copy && copy.requirements ) || {};
	const pluginsTabUrl = copy && copy.pluginsTabUrl;
	const manageLabel = ( copy && copy.actions && copy.actions.managePlugins ) || __( 'Install required plugins', 'pixelgrade_assistant' );

	return createElement(
		'div',
		{
			role: 'status',
			style: {
				alignItems: isRequirements ? 'flex-start' : 'center',
				background: tone.background,
				border: '1px solid ' + tone.border,
				color: tone.color,
				display: 'flex',
				flexDirection: isRequirements ? 'column' : 'row',
				fontSize: '13px',
				gap: '8px',
				lineHeight: 1.4,
				margin: '12px 0 0',
				padding: '8px 10px',
			},
		},
		'working' === state.status ? createElement( Spinner, { style: { margin: 0 } } ) : null,
		isRequirements && requirementsCopy.heading
			? createElement( 'strong', { style: { display: 'block' } }, requirementsCopy.heading )
			: null,
		createElement( 'span', null, state.message ),
		isRequirements && pluginsTabUrl
			? createElement(
					Button,
					{ href: pluginsTabUrl, variant: 'primary' },
					manageLabel
			  )
			: null
	);
}

function renderBadge( starter, locked, copy ) {
	const label = locked
		? copy.labels.locked
		: starter.badge || ( starter.gate ? copy.labels.premium : copy.labels.free );
	const style = locked
		? { background: '#fff8e5', border: '#f0d58a', color: '#7a4d00' }
		: starter.gate
		? { background: '#eef5ff', border: '#b8d4fb', color: '#1e5aa8' }
		: { background: '#edfaef', border: '#b8e6c2', color: '#0a7a28' };

	return createElement(
		'span',
		{
			style: {
				background: style.background,
				border: '1px solid ' + style.border,
				borderRadius: '999px',
				color: style.color,
				display: 'inline-flex',
				fontSize: '12px',
				fontWeight: 600,
				lineHeight: '20px',
				minHeight: '22px',
				padding: '0 8px',
				whiteSpace: 'nowrap',
			},
		},
		label
	);
}

function renderStarterCard( starter, context ) {
	const { copy, imported, plus, state, onImport } = context;
	const locked = isStarterLocked( starter, plus );
	const alreadyImported = isStarterImported( imported, starter.id );
	const isWorking = state && 'working' === state.status;
	const actions = copy.actions;
	const plusUrl = getPlusSetupUrl( plus );

	const primaryAction = locked
		? createElement(
				Button,
				{
					href: plusUrl,
					variant: 'primary',
					target: plusUrl.indexOf( 'http' ) === 0 && -1 === plusUrl.indexOf( '/wp-admin/' ) ? '_blank' : undefined,
					rel: 'noreferrer noopener',
				},
				plus && plus.is_plus_active ? actions.managePlus : actions.setupPlus
		  )
		: createElement(
				Button,
				{
					variant: alreadyImported ? 'secondary' : 'primary',
					isBusy: isWorking,
					disabled: isWorking,
					onClick: () => onImport( starter ),
				},
				isWorking ? actions.working : alreadyImported ? actions.reimport : actions.import
		  );

	// Keep a passive "Imported" status next to the action so the state is still legible once the
	// button reads "Re-import" (the button is an action, not a status).
	const importedStatus =
		! locked && alreadyImported && ! isWorking
			? createElement(
					'span',
					{
						style: {
							alignItems: 'center',
							color: '#0a7a28',
							display: 'inline-flex',
							fontSize: '12px',
							fontWeight: 600,
							gap: '4px',
							whiteSpace: 'nowrap',
						},
					},
					'✓ ' + actions.imported
			  )
			: null;

	return createElement(
		Card,
		{ key: starter.id, className: 'pixelgrade-starter-sites__card' },
		starter.image
			? createElement( 'img', {
					src: starter.image,
					alt: '',
					style: {
						aspectRatio: '16 / 9',
						display: 'block',
						height: 'auto',
						objectFit: 'cover',
						width: '100%',
					},
			  } )
			: null,
		createElement(
			CardHeader,
			null,
			createElement(
				Flex,
				{ align: 'center', justify: 'space-between', gap: 3 },
				createElement( FlexItem, null, createElement( 'h2', { style: { margin: 0 } }, starter.title ) ),
				createElement( FlexItem, null, renderBadge( starter, locked, copy ) )
			)
		),
		createElement(
			CardBody,
			null,
			starter.description
				? createElement( 'p', { style: { color: '#50575e', margin: '0 0 16px' } }, starter.description )
				: null,
			createElement(
				Flex,
				{ align: 'center', gap: 2, justify: 'flex-start', expanded: false },
				createElement( FlexItem, null, primaryAction ),
				starter.previewUrl || starter.url
					? createElement(
							FlexItem,
							null,
							createElement(
								Button,
								{
									href: starter.previewUrl || starter.url,
									variant: 'tertiary',
									target: '_blank',
									rel: 'noreferrer noopener',
								},
								actions.preview
							)
					  )
					: null,
				importedStatus ? createElement( FlexItem, null, importedStatus ) : null
			),
			renderStatusNotice( state, copy )
		)
	);
}

export function StarterSites() {
	const data = getStarterSitesData();
	const copy = mergeCopy( data.copy );
	const starters = Array.isArray( data.starters ) ? data.starters : [];
	const [ imported, setImported ] = useState( data.imported || {} );
	const [ states, setStates ] = useState( {} );

	const setStarterState = ( id, nextState ) => {
		setStates( ( current ) => ( {
			...current,
			[ id ]: {
				...( current[ id ] || {} ),
				...nextState,
			},
		} ) );
	};

	const startImport = async ( starter ) => {
		// Dependency gate: never import a starter the site cannot render. If the starter's required
		// companion plugins are not active, nudge the user to install + activate them first instead of
		// silently importing broken content. When all requirements are met this is a no-op.
		const missing = getMissingRequiredPlugins( starter );
		if ( missing.length ) {
			const names = missing.map( ( plugin ) => plugin.name || plugin.slug );
			const message = ( copy.requirements.message || '%s' ).replace(
				'%s',
				formatPluginNames( names, copy.requirements )
			);

			setStarterState( starter.id, {
				status: 'requirements',
				message,
				missing,
			} );
			return;
		}

		if ( isStarterImported( imported, starter.id ) && typeof window !== 'undefined' && window.confirm ) {
			const sure = window.confirm( copy.confirm );
			if ( ! sure ) {
				return;
			}
		}

		try {
			await importStarter( starter, data, copy, ( message ) => {
				setStarterState( starter.id, { status: 'working', message } );
			} );
			setImported( ( current ) => ( {
				...current,
				[ starter.id ]: {
					...( current[ starter.id ] || {} ),
					imported: true,
				},
			} ) );
			setStarterState( starter.id, { status: 'success', message: copy.success } );
		} catch ( error ) {
			setStarterState( starter.id, {
				status: 'error',
				message: error && error.message ? error.message : copy.error,
			} );
		}
	};

	return createElement(
		Fragment,
		null,
		createElement( 'h2', { style: { margin: '0 0 4px' } }, copy.title ),
		copy.description
			? createElement( 'p', { style: { color: '#50575e', margin: '0 0 16px', maxWidth: '760px' } }, copy.description )
			: null,
		starters.length
			? createElement(
					'div',
					{
						className: 'pixelgrade-starter-sites__grid',
						style: {
							display: 'grid',
							gap: '16px',
							gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
						},
					},
					starters.map( ( starter ) =>
						renderStarterCard( starter, {
							copy,
							imported,
							plus: data.plus || {},
							state: states[ starter.id ] || { status: 'idle', message: '' },
							onImport: startImport,
						} )
					)
			  )
			: createElement(
					'div',
					{
						role: 'status',
						style: {
							background: '#f6f7f7',
							border: '1px solid #dcdcde',
							color: '#50575e',
							padding: '10px 12px',
						},
					},
					copy.empty
			  )
	);
}
