/**
 * The mixed Starter Sites tab (#49).
 *
 * Free starters come from Assistant's existing `starterContent.demos` config. Premium starters may
 * be injected by Pixelgrade Plus through the PHP `pixelgrade/admin_hub/starters` filter and carry a
 * `gate` so this presentational tab can show an upsell without owning commercial state.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, CheckboxControl, Flex, FlexItem, Spinner } from '@wordpress/components';

const DEFAULT_STARTER_SITES = {
	starters: [],
	siteAnalysis: {
		classification: 'empty',
		isEmpty: true,
		hasContent: false,
		hasImportedStarterContent: false,
		features: {},
	},
	copy: {
		title: __( 'Starter Sites', 'pixelgrade_assistant' ),
		description: __( 'Pick a starter, then choose how much of it to apply.', 'pixelgrade_assistant' ),
		empty: __( 'No starter sites are currently configured.', 'pixelgrade_assistant' ),
		confirm: __( 'Starter content was already imported. Import it again?', 'pixelgrade_assistant' ),
		importing: __( 'Getting data about available content...', 'pixelgrade_assistant' ),
		error: __( 'This starter content is not available right now. Please try again later.', 'pixelgrade_assistant' ),
		failed: __( 'Something went wrong.', 'pixelgrade_assistant' ),
		success: __( 'Successfully applied.', 'pixelgrade_assistant' ),
		labels: {
			free: __( 'Free', 'pixelgrade_assistant' ),
			premium: __( 'Premium', 'pixelgrade_assistant' ),
			locked: __( 'Requires Pixelgrade Plus', 'pixelgrade_assistant' ),
		},
		actions: {
			import: __( 'Import', 'pixelgrade_assistant' ),
			imported: __( 'Imported', 'pixelgrade_assistant' ),
			reimport: __( 'Re-import', 'pixelgrade_assistant' ),
			useStarter: __( 'Use %s', 'pixelgrade_assistant' ),
			applyFullSite: __( 'Apply full site', 'pixelgrade_assistant' ),
			applyLayouts: __( 'Apply layouts', 'pixelgrade_assistant' ),
			applySelectedParts: __( 'Apply selected parts', 'pixelgrade_assistant' ),
			addPortfolio: __( 'Add portfolio', 'pixelgrade_assistant' ),
			cancel: __( 'Cancel', 'pixelgrade_assistant' ),
			backToStarterSites: __( 'Back to Starter Sites', 'pixelgrade_assistant' ),
			preview: __( 'Preview', 'pixelgrade_assistant' ),
			setupPlus: __( 'Set up Pixelgrade Plus', 'pixelgrade_assistant' ),
			managePlus: __( 'Manage Pixelgrade Plus', 'pixelgrade_assistant' ),
			working: __( 'Applying...', 'pixelgrade_assistant' ),
			managePlugins: __( 'Install required plugins', 'pixelgrade_assistant' ),
		},
		composer: {
			preset: __( 'Preset', 'pixelgrade_assistant' ),
			include: __( 'What to include', 'pixelgrade_assistant' ),
			summary: __( 'Summary', 'pixelgrade_assistant' ),
			selected: __( 'Selected', 'pixelgrade_assistant' ),
			summaryPrefix: __( 'This will add/update: %s.', 'pixelgrade_assistant' ),
			emptySummary: __( 'Choose at least one part to continue.', 'pixelgrade_assistant' ),
			presets: {
				fullSite: __( 'Full site', 'pixelgrade_assistant' ),
				layoutsOnly: __( 'Layouts only', 'pixelgrade_assistant' ),
				portfolioOnly: __( 'Portfolio only', 'pixelgrade_assistant' ),
				chooseParts: __( 'Choose parts', 'pixelgrade_assistant' ),
			},
			presetDescriptions: {
				fullSite: __( 'Everything from the starter: content, layouts, menus, and design.', 'pixelgrade_assistant' ),
				layoutsOnly: __( 'Keep your content and apply the starter structure.', 'pixelgrade_assistant' ),
				portfolioOnly: __( 'Add the portfolio feature and its templates.', 'pixelgrade_assistant' ),
				chooseParts: __( 'Select the exact pieces you want.', 'pixelgrade_assistant' ),
			},
			groups: {
				content: __( 'Content', 'pixelgrade_assistant' ),
				layouts: __( 'Layouts', 'pixelgrade_assistant' ),
				design: __( 'Design', 'pixelgrade_assistant' ),
				features: __( 'Features', 'pixelgrade_assistant' ),
			},
			parts: {
				pages: __( 'Pages', 'pixelgrade_assistant' ),
				posts: __( 'Posts', 'pixelgrade_assistant' ),
				projects: __( 'Projects', 'pixelgrade_assistant' ),
				products: __( 'Products', 'pixelgrade_assistant' ),
				header: __( 'Header', 'pixelgrade_assistant' ),
				footer: __( 'Footer', 'pixelgrade_assistant' ),
				home: __( 'Home', 'pixelgrade_assistant' ),
				archive: __( 'Archive', 'pixelgrade_assistant' ),
				single: __( 'Single', 'pixelgrade_assistant' ),
				portfolioArchive: __( 'Portfolio archive', 'pixelgrade_assistant' ),
				portfolioSingle: __( 'Portfolio single', 'pixelgrade_assistant' ),
				colorsFonts: __( 'Colors and fonts', 'pixelgrade_assistant' ),
				menus: __( 'Menus', 'pixelgrade_assistant' ),
				logo: __( 'Logo', 'pixelgrade_assistant' ),
				portfolio: __( 'Portfolio', 'pixelgrade_assistant' ),
			},
		},
		requirements: {
			heading: __( 'This starter needs a couple of plugins first', 'pixelgrade_assistant' ),
			message: __(
				'To use this starter as intended, install and activate %s. Without them the imported pages would render broken (missing blocks, colors and fonts).',
				'pixelgrade_assistant'
			),
			separator: __( ', ', 'pixelgrade_assistant' ),
			and: __( ' and ', 'pixelgrade_assistant' ),
		},
		pluginsTabUrl: '',
	},
	endpoints: {},
	imported: {},
	applied: {},
	plus: {
		is_plus_active: false,
		is_plus_licensed: false,
		plus_settings_url: '',
		plus_product_label: 'Pixelgrade Plus',
	},
};

const CONTENT_POST_TYPES = {
	pages: 'page',
	posts: 'post',
	projects: 'portfolio',
	products: 'product',
	menus: 'nav_menu_item',
};

const LAYOUT_UNITS = {
	header: { unit_type: 'wp_template_part', unit: 'header' },
	footer: { unit_type: 'wp_template_part', unit: 'footer' },
	home: { unit_type: 'wp_template', unit: 'front-page' },
	archive: { unit_type: 'wp_template', unit: 'archive' },
	single: { unit_type: 'wp_template', unit: 'single' },
	portfolioArchive: { unit_type: 'wp_template', unit: 'archive-portfolio' },
	portfolioSingle: { unit_type: 'wp_template', unit: 'single-portfolio' },
};

export function getStarterSitesData() {
	if ( typeof window !== 'undefined' && window.pixelgradeStarterSites ) {
		return window.pixelgradeStarterSites;
	}

	return DEFAULT_STARTER_SITES;
}

export function mergeCopy( copy ) {
	const incomingComposer = copy && copy.composer ? copy.composer : {};

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
		composer: {
			...DEFAULT_STARTER_SITES.copy.composer,
			...incomingComposer,
			presets: {
				...DEFAULT_STARTER_SITES.copy.composer.presets,
				...( incomingComposer.presets || {} ),
			},
			presetDescriptions: {
				...DEFAULT_STARTER_SITES.copy.composer.presetDescriptions,
				...( incomingComposer.presetDescriptions || {} ),
			},
			groups: {
				...DEFAULT_STARTER_SITES.copy.composer.groups,
				...( incomingComposer.groups || {} ),
			},
			parts: {
				...DEFAULT_STARTER_SITES.copy.composer.parts,
				...( incomingComposer.parts || {} ),
			},
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

function normalizeApplied( applied ) {
	if ( ! applied || 'object' !== typeof applied || Array.isArray( applied ) ) {
		return {
			fullDemos: {},
			recipes: {},
			layoutUnits: {},
		};
	}

	return {
		fullDemos: applied.fullDemos || {},
		recipes: applied.recipes || {},
		layoutUnits: applied.layoutUnits || {},
	};
}

function getPrimaryAction( starter, copy ) {
	const plan = starter && starter.applyPlan ? starter.applyPlan : {};
	const action = plan.primaryAction || {};

	if ( action.type ) {
		return action;
	}

	return {
		type: 'full_demo',
		label: copy.actions.applyFullSite || copy.actions.import,
		endpoint: 'importStarter',
		affectedAreas: [ 'Content', 'Media', 'Menus', 'Templates', 'Look' ],
	};
}

function getActionOptionDefaults( action ) {
	return {
		includeLook: Boolean( action && action.includeLookDefault ),
		includeSample: Boolean( action && action.includeSampleDefault ),
	};
}

function getAppliedStatusLabels( starter, imported, applied ) {
	const labels = [];
	const normalizedApplied = normalizeApplied( applied );
	const recipe = normalizedApplied.recipes[ 'recipe:' + starter.id ];

	if ( isStarterImported( imported, starter.id ) ) {
		labels.push( __( 'Full site applied', 'pixelgrade_assistant' ) );
	}

	if ( recipe ) {
		labels.push( recipe.isApplied ? __( 'Layouts applied', 'pixelgrade_assistant' ) : __( 'Layouts customized', 'pixelgrade_assistant' ) );
	}

	if (
		normalizedApplied.layoutUnits[ 'feature:portfolio' ] &&
		normalizedApplied.layoutUnits[ 'feature:portfolio' ].demoKey === starter.id
	) {
		labels.push( __( 'Portfolio added', 'pixelgrade_assistant' ) );
	}

	return labels;
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

function buildImportTasks( starter, config, data, setProgress, filters = {} ) {
	const tasks = [];
	const demoKey = starter.id;
	const baseUrl = trailingslash( starter.baseRestUrl );
	const postTypes = Array.isArray( filters.postTypes ) ? filters.postTypes.filter( Boolean ) : null;
	const includeSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includeSettings' ) || Boolean( filters.includeSettings );
	const includeMedia = ! Object.prototype.hasOwnProperty.call( filters, 'includeMedia' ) || Boolean( filters.includeMedia );
	const includeTaxonomies = ! Object.prototype.hasOwnProperty.call( filters, 'includeTaxonomies' ) || Boolean( filters.includeTaxonomies );
	const includeWidgets = ! Object.prototype.hasOwnProperty.call( filters, 'includeWidgets' ) || Boolean( filters.includeWidgets );
	const includePostSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includePostSettings' ) || Boolean( filters.includePostSettings );

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

	if ( includeSettings && config.pre_settings ) {
		addImportTask( __( 'Preparing settings...', 'pixelgrade_assistant' ), 'pre_settings', { data: config.pre_settings } );
	}

	if ( includeMedia && config.media && ! isEmptyObject( config.media.placeholders ) ) {
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

	if ( includeTaxonomies ) {
		valuesSortedByPriority( config.taxonomies ).forEach( ( entry ) => {
			if ( ! entry.name || ! entry.ids ) {
				return;
			}

			addImportTask( __( 'Importing taxonomies...', 'pixelgrade_assistant' ), 'taxonomy', {
				tax: entry.name,
				ids: entry.ids,
			} );
		} );
	}

	valuesSortedByPriority( config.post_types ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids ) {
			return;
		}

		if ( postTypes && ! postTypes.includes( entry.name ) ) {
			return;
		}

		addImportTask( __( 'Importing content...', 'pixelgrade_assistant' ), 'post_type', {
			post_type: entry.name,
			ids: entry.ids,
		} );
	} );

	if ( includeWidgets && config.widgets ) {
		addImportTask( __( 'Importing widgets...', 'pixelgrade_assistant' ), 'parsed_widgets', { data: 'ok' } );
	}

	if ( includePostSettings && config.post_settings ) {
		tasks.push( async () => {
			const adminUrl = getAdminUrl();
			if ( adminUrl ) {
				setProgress( __( 'Preparing the admin area...', 'pixelgrade_assistant' ) );
				await window.fetch( adminUrl, { credentials: 'same-origin' } ).catch( () => {} );
			}

			if ( includeWidgets && config.widgets ) {
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

	if ( getEndpoint( data, 'importStarter' ).url ) {
		await restRequest( data, 'importStarter', {
			demo_key: starter.id,
			url: trailingslash( starter.baseRestUrl ),
		} );
		return;
	}

	const config = await fetchJson( trailingslash( starter.baseRestUrl ) + 'data', { method: 'GET' } );

	if ( ! config || 'success' !== config.code ) {
		throw new Error( config && config.message ? config.message : copy.failed );
	}

	const tasks = buildImportTasks( starter, config.data || {}, data, setProgress );

	for ( const task of tasks ) {
		await task();
	}
}

async function importStarterParts( starter, parts, data, copy, setProgress ) {
	setProgress( copy.actions.applySelectedParts );

	const config = await fetchJson( trailingslash( starter.baseRestUrl ) + 'data', { method: 'GET' } );

	if ( ! config || 'success' !== config.code ) {
		throw new Error( config && config.message ? config.message : copy.failed );
	}

	const tasks = buildImportTasks( starter, config.data || {}, data, setProgress, parts );

	for ( const task of tasks ) {
		await task();
	}

	return { code: 'success', data: {} };
}

async function applyStarterAction( starter, action, options, data, copy, setProgress ) {
	const selectedAction = action || getPrimaryAction( starter, copy );
	const selectedOptions = {
		...getActionOptionDefaults( selectedAction ),
		...( options || {} ),
	};

	if ( 'layout_only' === selectedAction.type ) {
		setProgress( copy.actions.applyLayouts );
		return restRequest( data, 'applyRecipe', {
			recipe_id: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			include_look: Boolean( selectedOptions.includeLook ),
			include_sample: Boolean( selectedOptions.includeSample ),
		} );
	}

	if ( 'feature' === selectedAction.type ) {
		setProgress( copy.actions.addPortfolio );
		return restRequest( data, 'importUnit', {
			demo_key: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			unit_type: selectedAction.unitType || 'feature',
			unit: selectedAction.unit || 'portfolio',
			include_sample: Boolean( selectedOptions.includeSample ),
		} );
	}

	if ( 'layout_unit' === selectedAction.type ) {
		setProgress( copy.actions.applySelectedParts );
		return restRequest( data, 'importUnit', {
			demo_key: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			unit_type: selectedAction.unitType,
			unit: selectedAction.unit,
		} );
	}

	if ( 'starter_parts' === selectedAction.type ) {
		return importStarterParts( starter, selectedAction.parts || {}, data, copy, setProgress );
	}

	return importStarter( starter, data, copy, setProgress );
}

function getStarterFeatures( starter ) {
	const capabilities = starter && starter.capabilities && 'object' === typeof starter.capabilities ? starter.capabilities : {};
	return Array.isArray( capabilities.features ) ? capabilities.features : [];
}

/**
 * The starter's capability-segments (server-computed). Each segment carries its own availability:
 * the three baseline segments (base/look/layouts) are free; gated segments (commerce) only become
 * available when their required plugins are active AND Plus grants the matching capability. The
 * descriptors are secret-free — availability is a boolean + reason, never tokens/license data.
 *
 * @param {Object} starter Normalized starter descriptor.
 * @return {Array} Segment descriptors.
 */
export function getStarterSegments( starter ) {
	return Array.isArray( starter && starter.segments ) ? starter.segments : [];
}

export function getStarterSegment( starter, id ) {
	return getStarterSegments( starter ).find( ( segment ) => segment && segment.id === id ) || null;
}

/**
 * Whether the starter's commerce segment can be applied right now. No commerce segment → fall back to
 * legacy product detection so older payloads keep working; a present-but-locked commerce segment
 * means the user is not entitled / WooCommerce is inactive (the server enforces this regardless).
 *
 * @param {Object} starter Normalized starter descriptor.
 * @return {boolean}
 */
export function starterCommerceAvailable( starter ) {
	const commerce = getStarterSegment( starter, 'commerce' );

	if ( ! commerce ) {
		return true;
	}

	return Boolean( commerce.available );
}

function starterHasFeature( starter, feature ) {
	return getStarterFeatures( starter ).includes( feature );
}

function starterHasPortfolio( starter ) {
	return starterHasFeature( starter, 'portfolio' );
}

function starterHasProducts( starter ) {
	const features = getStarterFeatures( starter );
	const haystack = [
		...( features || [] ),
		starter && starter.id,
		starter && starter.title,
		starter && starter.description,
	]
		.filter( Boolean )
		.join( ' ' )
		.toLowerCase();

	return /shop|store|product|commerce|woocommerce/.test( haystack );
}

function getAvailableLayoutIds( starter ) {
	const capabilities = starter && starter.capabilities && 'object' === typeof starter.capabilities ? starter.capabilities : {};
	const groups = Array.isArray( capabilities.layoutGroups ) && capabilities.layoutGroups.length
		? capabilities.layoutGroups
		: [ 'Header', 'Footer', 'Home', 'Archive', 'Single' ];
	const available = [];
	const byLabel = {
		header: 'header',
		footer: 'footer',
		home: 'home',
		front: 'home',
		archive: 'archive',
		single: 'single',
		'portfolio archive': 'portfolioArchive',
		'portfolio single': 'portfolioSingle',
	};

	groups.forEach( ( group ) => {
		const key = byLabel[ String( group || '' ).trim().toLowerCase() ];
		if ( key && ! available.includes( key ) ) {
			available.push( key );
		}
	} );

	if ( starterHasPortfolio( starter ) ) {
		[ 'portfolioArchive', 'portfolioSingle' ].forEach( ( key ) => {
			if ( ! available.includes( key ) ) {
				available.push( key );
			}
		} );
	}

	return available.filter( ( key ) => LAYOUT_UNITS[ key ] );
}

export function getComposerParts( starter, copy ) {
	const labels = copy.composer.parts;
	const groups = copy.composer.groups;
	const hasPortfolio = starterHasPortfolio( starter );
	const contentParts = [
		{ id: 'pages', label: labels.pages },
		{ id: 'posts', label: labels.posts },
	];
	const layoutParts = getAvailableLayoutIds( starter ).map( ( id ) => ( { id, label: labels[ id ] } ) );
	const designParts = [
		{ id: 'colorsFonts', label: labels.colorsFonts },
		{ id: 'menus', label: labels.menus },
		{ id: 'logo', label: labels.logo },
	];
	const featureParts = [];

	if ( hasPortfolio ) {
		contentParts.push( { id: 'projects', label: labels.projects } );
		featureParts.push( { id: 'portfolio', label: labels.portfolio } );
	}

	// Commerce/products is a gated segment: only offer it when the commerce segment is available
	// (WooCommerce active AND the Plus WooCommerce integration). The free/default import excludes it,
	// and the server rejects unauthorized commerce content even if this UI gate is bypassed.
	if ( starterHasProducts( starter ) && starterCommerceAvailable( starter ) ) {
		contentParts.push( { id: 'products', label: labels.products } );
	}

	return [
		{ id: 'content', label: groups.content, parts: contentParts },
		{ id: 'layouts', label: groups.layouts, parts: layoutParts },
		{ id: 'design', label: groups.design, parts: designParts },
		{ id: 'features', label: groups.features, parts: featureParts },
	].filter( ( group ) => group.parts.length );
}

function getAllPartIds( starter, copy ) {
	return getComposerParts( starter, copy ).reduce( ( ids, group ) => ids.concat( group.parts.map( ( part ) => part.id ) ), [] );
}

function getDefaultPresetId( starter, siteAnalysis ) {
	const portfolioEnabled = Boolean(
		siteAnalysis &&
			siteAnalysis.features &&
			siteAnalysis.features.portfolio &&
			siteAnalysis.features.portfolio.enabled
	);

	if ( starterHasPortfolio( starter ) && siteAnalysis && siteAnalysis.hasContent && ! portfolioEnabled ) {
		return 'portfolioOnly';
	}

	if ( siteAnalysis && siteAnalysis.isEmpty ) {
		return 'fullSite';
	}

	return 'layoutsOnly';
}

function getPresetSelectedPartIds( presetId, starter, copy ) {
	const allIds = getAllPartIds( starter, copy );
	const layouts = getAvailableLayoutIds( starter );

	if ( 'fullSite' === presetId ) {
		return allIds;
	}

	if ( 'layoutsOnly' === presetId ) {
		return layouts;
	}

	if ( 'portfolioOnly' === presetId ) {
		return [ 'portfolio', 'portfolioArchive', 'portfolioSingle' ].filter( ( id ) => allIds.includes( id ) );
	}

	return [];
}

function normalizeSelectedPartIds( ids, starter, copy ) {
	const allowed = getAllPartIds( starter, copy );
	return allowed.filter( ( id ) => Array.isArray( ids ) && ids.includes( id ) );
}

function getComposerState( starter, storedStates, data, copy ) {
	const stored = storedStates[ starter.id ];

	if ( stored ) {
		return {
			presetId: stored.presetId || 'chooseParts',
			selectedPartIds: normalizeSelectedPartIds( stored.selectedPartIds, starter, copy ),
		};
	}

	const presetId = getDefaultPresetId( starter, data.siteAnalysis || DEFAULT_STARTER_SITES.siteAnalysis );

	return {
		presetId,
		selectedPartIds: getPresetSelectedPartIds( presetId, starter, copy ),
	};
}

export function buildComposerPresets( starter, copy ) {
	const presets = [
		{ id: 'fullSite', label: copy.composer.presets.fullSite, description: copy.composer.presetDescriptions.fullSite },
		{ id: 'layoutsOnly', label: copy.composer.presets.layoutsOnly, description: copy.composer.presetDescriptions.layoutsOnly },
	];

	if ( starterHasPortfolio( starter ) ) {
		presets.push( { id: 'portfolioOnly', label: copy.composer.presets.portfolioOnly, description: copy.composer.presetDescriptions.portfolioOnly } );
	}

	presets.push( { id: 'chooseParts', label: copy.composer.presets.chooseParts, description: copy.composer.presetDescriptions.chooseParts } );

	return presets;
}

function selectedPartSet( composerState ) {
	return new Set( Array.isArray( composerState.selectedPartIds ) ? composerState.selectedPartIds : [] );
}

function selectedIncludesAll( selected, ids ) {
	return ids.length > 0 && ids.every( ( id ) => selected.has( id ) );
}

function selectedOnlyIncludes( selected, ids ) {
	return selected.size === ids.length && ids.every( ( id ) => selected.has( id ) );
}

function getSelectedLabels( starter, copy, composerState ) {
	const selected = selectedPartSet( composerState );
	const labels = [];

	getComposerParts( starter, copy ).forEach( ( group ) => {
		group.parts.forEach( ( part ) => {
			if ( selected.has( part.id ) ) {
				labels.push( part.label );
			}
		} );
	} );

	return labels;
}

function getComposerSummary( starter, copy, composerState ) {
	const labels = getSelectedLabels( starter, copy, composerState );

	if ( ! labels.length ) {
		return copy.composer.emptySummary;
	}

	return sprintf( copy.composer.summaryPrefix, labels.join( ', ' ) );
}

function getComposerActionLabel( starter, copy, composerState ) {
	if ( 'fullSite' === composerState.presetId ) {
		return copy.actions.applyFullSite;
	}

	if ( 'layoutsOnly' === composerState.presetId ) {
		return copy.actions.applyLayouts;
	}

	if ( 'portfolioOnly' === composerState.presetId ) {
		return copy.actions.addPortfolio;
	}

	const selected = selectedPartSet( composerState );
	if ( selected.has( 'portfolio' ) && selectedOnlyIncludes( selected, [ 'portfolio', 'portfolioArchive', 'portfolioSingle' ].filter( ( id ) => getAllPartIds( starter, copy ).includes( id ) ) ) ) {
		return copy.actions.addPortfolio;
	}

	if ( selectedIncludesAll( selected, getAvailableLayoutIds( starter ) ) && selected.size === getAvailableLayoutIds( starter ).length ) {
		return copy.actions.applyLayouts;
	}

	return copy.actions.applySelectedParts;
}

function buildComposerOperations( starter, copy, composerState ) {
	const selected = selectedPartSet( composerState );
	const allIds = getAllPartIds( starter, copy );
	const allSelected = allIds.length > 0 && selectedOnlyIncludes( selected, allIds );

	if ( ! selected.size ) {
		return [];
	}

	if ( 'fullSite' === composerState.presetId || allSelected ) {
		return [ { type: 'full_demo' } ];
	}

	if ( 'layoutsOnly' === composerState.presetId ) {
		return [ { type: 'layout_only', includeLookDefault: false, includeSampleDefault: false } ];
	}

	if ( 'portfolioOnly' === composerState.presetId ) {
		return [ { type: 'feature', unitType: 'feature', unit: 'portfolio', includeSampleDefault: selected.has( 'projects' ) } ];
	}

	const operations = [];
	const layoutIds = getAvailableLayoutIds( starter ).filter( ( id ) => selected.has( id ) );
	const selectedRegularLayouts = layoutIds.filter( ( id ) => ! [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );
	const selectedPortfolioLayouts = layoutIds.filter( ( id ) => [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );
	const allRegularLayoutIds = getAvailableLayoutIds( starter ).filter( ( id ) => ! [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );
	const hasPortfolioFeature = selected.has( 'portfolio' );
	const postTypes = Object.keys( CONTENT_POST_TYPES )
		.filter( ( id ) => selected.has( id ) )
		.filter( ( id ) => ! ( 'projects' === id && hasPortfolioFeature ) )
		.map( ( id ) => CONTENT_POST_TYPES[ id ] );
	const includeSettings = selected.has( 'colorsFonts' ) || selected.has( 'logo' );
	const includeMenus = selected.has( 'menus' );

	if ( hasPortfolioFeature ) {
		operations.push( { type: 'feature', unitType: 'feature', unit: 'portfolio', includeSampleDefault: selected.has( 'projects' ) } );
	} else {
		selectedPortfolioLayouts.forEach( ( id ) => {
			operations.push( {
				type: 'layout_unit',
				unitType: LAYOUT_UNITS[ id ].unit_type,
				unit: LAYOUT_UNITS[ id ].unit,
			} );
		} );
	}

	if ( selectedRegularLayouts.length ) {
		if ( selectedOnlyIncludes( new Set( selectedRegularLayouts ), allRegularLayoutIds ) ) {
			operations.push( { type: 'layout_only', includeLookDefault: false, includeSampleDefault: false } );
		} else {
			selectedRegularLayouts.forEach( ( id ) => {
				operations.push( {
					type: 'layout_unit',
					unitType: LAYOUT_UNITS[ id ].unit_type,
					unit: LAYOUT_UNITS[ id ].unit,
				} );
			} );
		}
	}

	if ( postTypes.length || includeSettings || includeMenus ) {
		const selectedPostTypes = Array.from( new Set( includeMenus ? postTypes.concat( CONTENT_POST_TYPES.menus ) : postTypes ) );

		operations.push( {
			type: 'starter_parts',
			parts: {
				postTypes: selectedPostTypes,
				includeSettings,
				includeMedia: Boolean( postTypes.length || selected.has( 'logo' ) ),
				includeTaxonomies: Boolean( postTypes.length || includeMenus ),
				includeWidgets: false,
				includePostSettings: includeSettings,
			},
		} );
	}

	return operations;
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
	// Every starter site is a free object — gating lives on the segments, not the card — so a "Free"
	// badge on every card is just noise. Only badge what's actually noteworthy: a locked starter, a
	// premium (gated) starter, or an explicit custom badge.
	if ( ! locked && ! starter.gate && ! starter.badge ) {
		return null;
	}

	const label = locked
		? copy.labels.locked
		: starter.badge || ( starter.gate ? copy.labels.premium : copy.labels.free );
	const style = locked
		? { background: '#fff8e5', border: '#f0d58a', color: '#7a4d00' }
		: starter.gate
		? { background: '#eef5ff', border: '#b8d4fb', color: '#1e5aa8' }
		: { background: '#edfaef', border: '#b8e6c2', color: '#0a7a28' };

	return createElement(
		FlexItem,
		null,
		createElement(
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
		)
	);
}

function getUseStarterLabel( starter, copy ) {
	return sprintf( copy.actions.useStarter || __( 'Use %s', 'pixelgrade_assistant' ), starter.title || starter.id );
}

function renderStarterCard( starter, context ) {
	const { copy, imported, applied, plus, state, onOpenComposer } = context;
	const locked = isStarterLocked( starter, plus );
	const isWorking = state && 'working' === state.status;
	const actions = copy.actions;
	const plusUrl = getPlusSetupUrl( plus );
	const appliedLabels = getAppliedStatusLabels( starter, imported, applied );

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
					variant: 'primary',
					isBusy: isWorking,
					disabled: isWorking,
					onClick: () => onOpenComposer( starter ),
				},
				isWorking ? actions.working : getUseStarterLabel( starter, copy )
		  );

	const importedStatus =
		! locked && appliedLabels.length && ! isWorking
			? createElement(
					'div',
					{
						style: {
							alignItems: 'center',
							borderTop: '1px solid #f0f0f1',
							color: '#50575e',
							display: 'flex',
							flexWrap: 'wrap',
							fontSize: '11px',
							gap: '6px',
							marginTop: '18px',
							paddingTop: '12px',
						},
					},
					appliedLabels.map( ( label ) =>
						createElement(
							'span',
							{
								key: label,
								style: {
									alignItems: 'center',
									background: '#f6f7f7',
									border: '1px solid #dcdcde',
									borderRadius: '999px',
									display: 'inline-flex',
									fontWeight: 500,
									lineHeight: '20px',
									padding: '0 8px',
									whiteSpace: 'nowrap',
								},
							},
							'✓ ' + label
						)
					)
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
				renderBadge( starter, locked, copy )
			)
		),
		createElement(
			CardBody,
			null,
			starter.description
				? createElement( 'p', { style: { color: '#50575e', margin: '0 0 18px' } }, starter.description )
				: null,
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '10px' } },
				primaryAction,
				starter.previewUrl || starter.url
					? createElement(
							Button,
							{
								href: starter.previewUrl || starter.url,
								variant: 'tertiary',
								target: '_blank',
								rel: 'noreferrer noopener',
							},
							actions.preview
					  )
					: null,
			),
			importedStatus,
			renderStatusNotice( state, copy )
		)
	);
}

function renderComposerPartGroups( starter, copy, composerState, isWorking, onTogglePart ) {
	const selected = selectedPartSet( composerState );

	return createElement(
		'div',
		{ style: { display: 'grid', gap: '18px' } },
		getComposerParts( starter, copy ).map( ( group ) =>
			createElement(
				'section',
				{ key: group.id },
				createElement(
					'h3',
					{
						style: {
							color: '#1d2327',
							fontSize: '13px',
							fontWeight: 600,
							margin: '0 0 8px',
							textTransform: 'none',
						},
					},
					group.label
				),
				createElement(
					'div',
					{
						style: {
							display: 'grid',
							gap: '8px',
							gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
						},
					},
					group.parts.map( ( part ) => {
						const isSelected = selected.has( part.id );

						return createElement(
							'div',
							{
								key: part.id,
								style: {
									background: isSelected ? '#f6f7ff' : '#fff',
									border: '1px solid ' + ( isSelected ? '#3858e9' : '#dcdcde' ),
									borderRadius: '4px',
									boxShadow: isSelected ? 'inset 3px 0 0 #3858e9' : 'none',
									padding: '9px 10px',
								},
							},
							createElement( CheckboxControl, {
								checked: isSelected,
								disabled: isWorking,
								label: part.label,
								onChange: ( nextValue ) => onTogglePart( part.id, nextValue ),
							} )
						);
					} )
				)
			)
		)
	);
}

function renderPresetChoices( presets, copy, composerState, isWorking, onPresetChange ) {
	return createElement(
		'div',
		{
			style: {
				display: 'grid',
				gap: '10px',
				gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
			},
		},
		presets.map( ( preset ) => {
			const selected = composerState.presetId === preset.id;

			return createElement(
				'button',
				{
					key: preset.id,
					type: 'button',
					'aria-pressed': selected,
					disabled: isWorking,
					onClick: () => onPresetChange( preset.id ),
					style: {
						background: selected ? '#fff' : '#f6f7f7',
						border: '1px solid ' + ( selected ? '#3858e9' : '#dcdcde' ),
						borderRadius: '4px',
						boxShadow: selected ? 'inset 3px 0 0 #3858e9' : 'none',
						color: '#1d2327',
						cursor: isWorking ? 'default' : 'pointer',
						display: 'grid',
						gap: '5px',
						padding: '12px 13px',
						textAlign: 'left',
					},
				},
				createElement( 'span', { style: { color: selected ? '#3858e9' : '#1d2327', fontSize: '14px', fontWeight: 600 } }, preset.label ),
				preset.description
					? createElement( 'span', { style: { color: '#646970', fontSize: '12px', lineHeight: 1.35 } }, preset.description )
					: null,
				selected ? createElement( 'span', { style: { color: '#3858e9', fontSize: '11px', fontWeight: 600 } }, copy.composer.selected ) : null
			);
		} )
	);
}

function renderComposerView( starter, context ) {
	const {
		copy,
		composerState,
		state,
		isWorking,
		onBack,
		onPresetChange,
		onTogglePart,
		onApply,
	} = context;
	const presets = buildComposerPresets( starter, copy );
	const summary = getComposerSummary( starter, copy, composerState );
	const actionLabel = getComposerActionLabel( starter, copy, composerState );
	const preview = starter.image || '';
	const canApply = selectedPartSet( composerState ).size > 0 && ! isWorking;

	return createElement(
		'section',
		{ className: 'pixelgrade-starter-sites__composer' },
		createElement(
			Button,
			{
				variant: 'tertiary',
				onClick: onBack,
				style: { marginBottom: '18px' },
			},
			copy.actions.backToStarterSites
		),
		createElement(
			'div',
			{
				style: {
					alignItems: 'start',
					display: 'grid',
					gap: '40px',
					gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
					maxWidth: '1180px',
				},
			},
			createElement(
				'div',
				{ style: { display: 'grid', gap: '12px', maxWidth: '420px' } },
				preview
					? createElement( 'img', {
							src: preview,
							alt: '',
							style: {
								aspectRatio: '4 / 3',
								background: '#f0f0f1',
								border: '1px solid #dcdcde',
								borderRadius: '2px',
								display: 'block',
								height: 'auto',
								objectFit: 'cover',
								width: '100%',
							},
					  } )
					: null,
				starter.previewUrl || starter.url
					? createElement(
							Button,
							{
								href: starter.previewUrl || starter.url,
								variant: 'tertiary',
								target: '_blank',
								rel: 'noreferrer noopener',
								style: { justifySelf: 'start' },
							},
							copy.actions.preview
					  )
					: null
			),
			createElement(
				'div',
				{ style: { display: 'grid', gap: '26px', maxWidth: '760px' } },
				createElement(
					'header',
					null,
					createElement( 'h2', { style: { fontSize: '28px', lineHeight: 1.2, margin: 0 } }, starter.title ),
					starter.description
						? createElement( 'p', { style: { color: '#50575e', fontSize: '15px', margin: '8px 0 0', maxWidth: '560px' } }, starter.description )
						: null
				),
				createElement(
					'section',
					null,
					createElement( 'h3', { style: { fontSize: '13px', margin: '0 0 10px' } }, copy.composer.preset ),
					renderPresetChoices( presets, copy, composerState, isWorking, onPresetChange )
				),
				createElement(
					'section',
					null,
					createElement( 'h3', { style: { fontSize: '15px', margin: '0 0 16px' } }, copy.composer.include ),
					renderComposerPartGroups( starter, copy, composerState, isWorking, onTogglePart )
				),
				createElement(
					'section',
					{
						style: {
							background: '#fff',
							border: '1px solid #dcdcde',
							borderRadius: '4px',
							display: 'grid',
							gap: '14px',
							padding: '16px',
						},
					},
					createElement( 'h3', { style: { fontSize: '15px', margin: 0 } }, copy.composer.summary ),
					createElement( 'p', { style: { color: '#50575e', margin: 0 } }, summary ),
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '10px' } },
						createElement(
							Button,
							{
								variant: 'primary',
								isBusy: isWorking,
								disabled: ! canApply,
								onClick: onApply,
							},
							isWorking ? copy.actions.working : actionLabel
						),
						createElement(
							Button,
							{
								variant: 'secondary',
								disabled: isWorking,
								onClick: onBack,
							},
							copy.actions.cancel
						)
					),
					renderStatusNotice( state, copy )
				)
			)
		)
	);
}

export function StarterSites() {
	const data = getStarterSitesData();
	const copy = mergeCopy( data.copy );
	const starters = Array.isArray( data.starters ) ? data.starters : [];
	const [ imported, setImported ] = useState( data.imported || {} );
	const [ applied, setApplied ] = useState( normalizeApplied( data.applied ) );
	const [ states, setStates ] = useState( {} );
	const [ activeStarterId, setActiveStarterId ] = useState( '' );
	const [ composerStates, setComposerStates ] = useState( {} );

	const activeStarter = activeStarterId ? starters.find( ( starter ) => starter.id === activeStarterId ) : null;

	const setStarterState = ( id, nextState ) => {
		setStates( ( current ) => ( {
			...current,
			[ id ]: {
				...( current[ id ] || {} ),
				...nextState,
			},
		} ) );
	};

	const storeComposerState = ( starter, nextState ) => {
		setComposerStates( ( current ) => ( {
			...current,
			[ starter.id ]: {
				...getComposerState( starter, current, data, copy ),
				...nextState,
			},
		} ) );
	};

	const openComposer = ( starter ) => {
		setActiveStarterId( starter.id );
		setComposerStates( ( current ) => {
			if ( current[ starter.id ] ) {
				return current;
			}

			return {
				...current,
				[ starter.id ]: getComposerState( starter, current, data, copy ),
			};
		} );
	};

	const changePreset = ( starter, presetId ) => {
		const current = getComposerState( starter, composerStates, data, copy );

		storeComposerState( starter, {
			presetId,
			selectedPartIds:
				'chooseParts' === presetId
					? current.selectedPartIds
					: getPresetSelectedPartIds( presetId, starter, copy ),
		} );
	};

	const togglePart = ( starter, partId, enabled ) => {
		const current = getComposerState( starter, composerStates, data, copy );
		const selected = new Set( current.selectedPartIds );

		if ( enabled ) {
			selected.add( partId );
		} else {
			selected.delete( partId );
		}

		storeComposerState( starter, {
			presetId: 'chooseParts',
			selectedPartIds: normalizeSelectedPartIds( Array.from( selected ), starter, copy ),
		} );
	};

	const updateAppliedFromResponse = ( response ) => {
		if ( response && response.data && response.data.appliedRecipes ) {
			setApplied( ( current ) => ( {
				...current,
				recipes: response.data.appliedRecipes,
			} ) );
		}

		if ( response && response.data && response.data.appliedUnits ) {
			setApplied( ( current ) => ( {
				...current,
				layoutUnits: response.data.appliedUnits,
			} ) );
		}
	};

	const applyComposerSelection = async ( starter ) => {
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

		const composerState = getComposerState( starter, composerStates, data, copy );
		const operations = buildComposerOperations( starter, copy, composerState );
		const hasFullDemoOperation = operations.some( ( operation ) => 'full_demo' === operation.type );

		if ( ! operations.length ) {
			setStarterState( starter.id, { status: 'error', message: copy.composer.emptySummary } );
			return;
		}

		if ( hasFullDemoOperation && isStarterImported( imported, starter.id ) && typeof window !== 'undefined' && window.confirm ) {
			const sure = window.confirm( copy.confirm );
			if ( ! sure ) {
				return;
			}
		}

		try {
			setStarterState( starter.id, { status: 'working', message: copy.actions.working } );

			for ( const operation of operations ) {
				const response = await applyStarterAction( starter, operation, {}, data, copy, ( message ) => {
					setStarterState( starter.id, { status: 'working', message } );
				} );

				if ( 'full_demo' === operation.type ) {
					setImported( ( current ) => ( {
						...current,
						[ starter.id ]: {
							...( current[ starter.id ] || {} ),
							imported: true,
						},
					} ) );
					setApplied( ( current ) => ( {
						...current,
						fullDemos: {
							...( current.fullDemos || {} ),
							[ starter.id ]: {
								...( current.fullDemos && current.fullDemos[ starter.id ] ? current.fullDemos[ starter.id ] : {} ),
								imported: true,
							},
						},
					} ) );
				}

				updateAppliedFromResponse( response );
			}

			setStarterState( starter.id, { status: 'success', message: copy.success } );
		} catch ( error ) {
			setStarterState( starter.id, {
				status: 'error',
				message: error && error.message ? error.message : copy.error,
			} );
		}
	};

	if ( activeStarter ) {
		const composerState = getComposerState( activeStarter, composerStates, data, copy );
		const state = states[ activeStarter.id ] || { status: 'idle', message: '' };
		const isWorking = 'working' === state.status;

		return renderComposerView( activeStarter, {
			copy,
			composerState,
			state,
			isWorking,
			onBack: () => setActiveStarterId( '' ),
			onPresetChange: ( presetId ) => changePreset( activeStarter, presetId ),
			onTogglePart: ( partId, enabled ) => togglePart( activeStarter, partId, enabled ),
			onApply: () => applyComposerSelection( activeStarter ),
		} );
	}

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
							applied,
							plus: data.plus || {},
							state: states[ starter.id ] || { status: 'idle', message: '' },
							onOpenComposer: openComposer,
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
