/**
 * The mixed Starter Sites tab (#49).
 *
 * Free starters come from Assistant's existing `starterContent.demos` config. Premium starters may
 * be injected by Pixelgrade Plus through the PHP `pixelgrade/admin_hub/starters` filter and carry a
 * `gate` so this presentational tab can show an upsell without owning commercial state.
 */
import { createElement, Fragment, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, CheckboxControl, Flex, FlexItem, Spinner } from '@wordpress/components';
import { LayoutPreview, PreviewModeToggle } from '../LayoutPreview';

const STARTER_PROGRESS_TICK_INTERVAL = 1000;
const STARTER_PROGRESS_HEARTBEAT_AFTER = 1500;

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
		description: __( 'Pick a free starter design, then choose how much of it to apply. (“LT” is our Anima LT theme line — each starter is built on it.)', 'pixelgrade_assistant' ),
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
				archive: __( 'Post list (archive)', 'pixelgrade_assistant' ),
				single: __( 'Single post', 'pixelgrade_assistant' ),
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

const STARTER_PROGRESS_PHASES = [
	{
		id: 'prepare',
		label: __( 'Getting things ready', 'pixelgrade_assistant' ),
		phases: [ 'manifest', 'prepare' ],
	},
	{
		id: 'media',
		label: __( 'Bringing in your images', 'pixelgrade_assistant' ),
		phases: [ 'media' ],
	},
	{
		id: 'content',
		label: __( 'Adding your pages and posts', 'pixelgrade_assistant' ),
		phases: [ 'taxonomies', 'content' ],
	},
	{
		id: 'design',
		label: __( 'Styling your site', 'pixelgrade_assistant' ),
		phases: [ 'layouts', 'features', 'settings' ],
	},
	{
		id: 'finish',
		label: __( 'Wrapping up', 'pixelgrade_assistant' ),
		phases: [ 'finish', 'done' ],
	},
];

function createStarterProgressGroups( values = {} ) {
	return STARTER_PROGRESS_PHASES.reduce( ( groups, phase ) => {
		groups[ phase.id ] = Number( values[ phase.id ] || 0 );
		return groups;
	}, {} );
}

function combineStarterProgressGroups( ...groupSets ) {
	return STARTER_PROGRESS_PHASES.reduce( ( totals, phase ) => {
		totals[ phase.id ] = groupSets.reduce( ( sum, groups ) => {
			return sum + Number( groups && groups[ phase.id ] ? groups[ phase.id ] : 0 );
		}, 0 );
		return totals;
	}, {} );
}

function getStarterProgressGroupId( phase ) {
	const normalized = phase || 'prepare';
	const match = STARTER_PROGRESS_PHASES.find( ( group ) => group.phases.includes( normalized ) );
	return match ? match.id : 'prepare';
}

function getStarterProgressGroupLabel( groupId ) {
	const match = STARTER_PROGRESS_PHASES.find( ( group ) => group.id === groupId );
	return match ? match.label : STARTER_PROGRESS_PHASES[0].label;
}

function getPostTypeProgressPhase( postType ) {
	if ( [ 'nav_menu_item', 'wp_template', 'wp_template_part', 'wp_navigation', 'custom_css' ].includes( postType ) ) {
		return 'layouts';
	}

	return 'content';
}

function getStarterProgressPhaseState( state ) {
	const phaseTotals = state && state.phaseTotals ? state.phaseTotals : {};
	const phaseCounts = state && state.phaseCounts ? state.phaseCounts : {};
	const activeGroupId = getStarterProgressGroupId( state && state.phase );

	const phases = STARTER_PROGRESS_PHASES.map( ( phase ) => {
		const total = Number( phaseTotals[ phase.id ] || 0 );
		const rawCount = Number( phaseCounts[ phase.id ] || 0 );
		const count = total > 0 ? Math.min( rawCount, total ) : rawCount;
		const status =
			'success' === ( state && state.status )
				? 'done'
				: 'working' === ( state && state.status ) && phase.id === activeGroupId
				? 'active'
				: total > 0 && count >= total
				? 'done'
				: 'pending';

		return {
			...phase,
			count,
			total,
			status,
			countText: total > 0 ? count + ' of ' + total : '',
		};
	} );

	if ( Number( ( state && state.total ) || 0 ) > 0 ) {
		const visiblePhases = phases.filter( ( phase ) => phase.total > 0 || 'active' === phase.status );
		return visiblePhases.length ? visiblePhases : phases.slice( 0, 1 );
	}

	return phases;
}

function estimateComposerOperationProgressGroups( operations ) {
	const totals = createStarterProgressGroups();

	operations.forEach( ( operation ) => {
		if ( ! operation || 'full_demo' === operation.type || 'starter_parts' === operation.type ) {
			totals.prepare += 1;
			return;
		}

		if ( [ 'layout_only', 'layout_unit', 'feature' ].includes( operation.type ) ) {
			totals.design += 1;
			return;
		}

		totals.prepare += 1;
	} );

	return totals;
}

function estimateStarterImportWorkByGroup( config, filters = {} ) {
	const totals = createStarterProgressGroups( { prepare: 1 } );
	const includeSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includeSettings' ) || Boolean( filters.includeSettings );
	const includeMedia = ! Object.prototype.hasOwnProperty.call( filters, 'includeMedia' ) || Boolean( filters.includeMedia );
	const includeTaxonomies = ! Object.prototype.hasOwnProperty.call( filters, 'includeTaxonomies' ) || Boolean( filters.includeTaxonomies );
	const includeWidgets = ! Object.prototype.hasOwnProperty.call( filters, 'includeWidgets' ) || Boolean( filters.includeWidgets );
	const includePostSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includePostSettings' ) || Boolean( filters.includePostSettings );
	const postTypes = Array.isArray( filters.postTypes ) ? filters.postTypes.filter( Boolean ) : null;

	if ( includeSettings && config.pre_settings ) {
		totals.design += 1;
	}

	if ( includeMedia ) {
		totals.media += countMediaItems( config.media ) * 2;
	}

	if ( includeTaxonomies && config.taxonomies ) {
		totals.content += valuesSortedByPriority( config.taxonomies ).length;
	}

	valuesSortedByPriority( config.post_types ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids || ( postTypes && ! postTypes.includes( entry.name ) ) ) {
			return;
		}

		totals[ getStarterProgressGroupId( getPostTypeProgressPhase( entry.name ) ) ] += 1;
	} );

	if ( includeWidgets && config.widgets ) {
		totals.design += 1;
	}

	if ( includePostSettings && config.post_settings ) {
		totals.finish += 2;
	}

	return totals;
}

function getLayoutUnitSlot( layoutId ) {
	const unit = LAYOUT_UNITS[ layoutId ];
	return unit ? unit.unit_type + ':' + unit.unit : '';
}

function getLayoutOperationLabel( operation, copy ) {
	if ( operation && operation.label ) {
		return operation.label;
	}

	if ( operation && operation.layoutId && copy.composer.parts[ operation.layoutId ] ) {
		return copy.composer.parts[ operation.layoutId ];
	}

	return __( 'layout part', 'pixelgrade_assistant' );
}

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

function formatElapsed( milliseconds ) {
	const seconds = Math.max( 0, Math.floor( milliseconds / 1000 ) );

	if ( seconds < 60 ) {
		return seconds + 's';
	}

	return Math.floor( seconds / 60 ) + 'm ' + ( seconds % 60 ) + 's';
}

function appendProgressLog( log, message, type = 'info', time = '' ) {
	if ( ! message ) {
		return Array.isArray( log ) ? log : [];
	}

	return ( Array.isArray( log ) ? log : [] )
		.concat( {
			message,
			type,
			time,
		} )
		.slice( -8 );
}

function buildProgressState( previous, update, options = {} ) {
	const now = Date.now();
	const incoming = 'string' === typeof update ? { message: update } : update || {};
	const base = options.reset
		? {
				status: 'idle',
				phase: '',
				message: '',
				details: '',
				current: 0,
				total: 0,
				log: [],
				warnings: [],
				phaseCounts: createStarterProgressGroups(),
				phaseTotals: createStarterProgressGroups(),
				startedAt: null,
				lastEventAt: null,
				heartbeat: '',
		  }
		: previous || {};
	const next = {
		...base,
		...incoming,
	};

	if ( 'working' === next.status && ! next.startedAt ) {
		next.startedAt = now;
	}

	next.phaseCounts = {
		...createStarterProgressGroups(),
		...( base.phaseCounts || {} ),
		...( incoming.phaseCounts || {} ),
	};
	next.phaseTotals = {
		...createStarterProgressGroups(),
		...( base.phaseTotals || {} ),
		...( incoming.phaseTotals || {} ),
	};
	next.warnings = Array.isArray( incoming.warnings )
		? incoming.warnings
		: Array.isArray( base.warnings )
		? base.warnings
		: [];

	if ( options.advance ) {
		const total = Number( next.total || base.total || 0 );
		const current = Number( base.current || 0 ) + 1;
		const groupId = getStarterProgressGroupId( next.phase || base.phase );
		const groupTotal = Number( next.phaseTotals[ groupId ] || 0 );
		const nextGroupCount = Number( next.phaseCounts[ groupId ] || 0 ) + 1;

		next.current = total > 0 ? Math.min( current, total ) : current;
		next.phaseCounts[ groupId ] = groupTotal > 0 ? Math.min( nextGroupCount, groupTotal ) : nextGroupCount;
	}

	if ( options.log ) {
		const time = next.startedAt ? formatElapsed( now - next.startedAt ) : '0s';
		next.log = appendProgressLog( base.log, options.log, options.logType || 'info', time );

		if ( 'warning' === options.logType ) {
			next.warnings = appendProgressLog( next.warnings, options.log, 'warning', time ).slice( -3 );
		}
	}

	if ( ! options.keepLastEventAt ) {
		next.lastEventAt = now;
		next.heartbeat = '';
	}

	return next;
}

function getStarterProgressHeartbeatMessage( state ) {
	const messages = {
		manifest: __( 'Still getting the starter details ready.', 'pixelgrade_assistant' ),
		prepare: __( 'Still preparing the import queue.', 'pixelgrade_assistant' ),
		media: __( 'Still importing — this file is larger than usual.', 'pixelgrade_assistant' ),
		taxonomies: __( 'Still adding your content structure.', 'pixelgrade_assistant' ),
		content: __( 'Still adding pages and posts. Larger batches can take a little longer.', 'pixelgrade_assistant' ),
		layouts: __( 'Still styling your site with templates and menus.', 'pixelgrade_assistant' ),
		features: __( 'Still adding the selected feature.', 'pixelgrade_assistant' ),
		settings: __( 'Still applying design settings.', 'pixelgrade_assistant' ),
		finish: __( 'Still wrapping up the final settings.', 'pixelgrade_assistant' ),
	};

	return messages[ state.phase ] || __( 'Still working. No action needed.', 'pixelgrade_assistant' );
}

function startStarterProgressHeartbeat( setStates ) {
	if ( 'undefined' === typeof window || ! window.setInterval ) {
		return null;
	}

	return window.setInterval( () => {
		const now = Date.now();

		setStates( ( current ) => {
			let changed = false;
			const nextStates = {};

			Object.keys( current || {} ).forEach( ( starterId ) => {
				const state = current[ starterId ];

				if ( ! state || 'working' !== state.status ) {
					nextStates[ starterId ] = state;
					return;
				}

				// More than 3 seconds without progress should never feel idle.
				const quietFor = state.lastEventAt ? now - state.lastEventAt : STARTER_PROGRESS_HEARTBEAT_AFTER;
				nextStates[ starterId ] = buildProgressState(
					state,
					{
						heartbeat: quietFor >= STARTER_PROGRESS_HEARTBEAT_AFTER ? getStarterProgressHeartbeatMessage( state ) : state.heartbeat,
						heartbeatTick: Number( state.heartbeatTick || 0 ) + 1,
					},
					{ keepLastEventAt: true }
				);
				changed = true;
			} );

			return changed ? nextStates : current;
		} );
	}, STARTER_PROGRESS_TICK_INTERVAL );
}

function scrollStarterProgressIntoView( starterId ) {
	if ( 'undefined' === typeof window || 'undefined' === typeof document || ! starterId ) {
		return;
	}

	window.setTimeout( () => {
		const progressNode = Array.from( document.querySelectorAll( '[data-starter-progress-id]' ) ).find(
			( node ) => node.getAttribute( 'data-starter-progress-id' ) === starterId
		);

		if ( ! progressNode || 'function' !== typeof progressNode.scrollIntoView ) {
			return;
		}

		const reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		progressNode.scrollIntoView( {
			behavior: reduceMotion ? 'auto' : 'smooth',
			block: 'start',
			inline: 'nearest',
		} );
	}, 80 );
}

function countMediaItems( media ) {
	if ( ! media || isEmptyObject( media.placeholders ) ) {
		return 0;
	}

	return Object.keys( media ).reduce( ( count, groupKey ) => {
		if ( 'placeholders' === groupKey || 'source_urls' === groupKey || ! media[ groupKey ] ) {
			return count;
		}

		return count + Object.keys( media[ groupKey ] ).length;
	}, 0 );
}

function estimateStarterImportWork( config, filters = {} ) {
	let total = 1;
	const includeSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includeSettings' ) || Boolean( filters.includeSettings );
	const includeMedia = ! Object.prototype.hasOwnProperty.call( filters, 'includeMedia' ) || Boolean( filters.includeMedia );
	const includeTaxonomies = ! Object.prototype.hasOwnProperty.call( filters, 'includeTaxonomies' ) || Boolean( filters.includeTaxonomies );
	const includeWidgets = ! Object.prototype.hasOwnProperty.call( filters, 'includeWidgets' ) || Boolean( filters.includeWidgets );
	const includePostSettings = ! Object.prototype.hasOwnProperty.call( filters, 'includePostSettings' ) || Boolean( filters.includePostSettings );
	const postTypes = Array.isArray( filters.postTypes ) ? filters.postTypes.filter( Boolean ) : null;

	if ( includeSettings && config.pre_settings ) {
		total += 1;
	}

	if ( includeMedia ) {
		total += countMediaItems( config.media ) * 2;
	}

	if ( includeTaxonomies && config.taxonomies ) {
		total += valuesSortedByPriority( config.taxonomies ).length;
	}

	valuesSortedByPriority( config.post_types ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids || ( postTypes && ! postTypes.includes( entry.name ) ) ) {
			return;
		}

		total += 1;
	} );

	if ( includeWidgets && config.widgets ) {
		total += 1;
	}

	if ( includePostSettings && config.post_settings ) {
		total += 2;
	}

	return Math.max( total, 1 );
}

async function restRequest( data, key, payload, options = {} ) {
	const endpoint = getEndpoint( data, key );
	const rest = getPixassistRest();
	const allowCodes = Array.isArray( options.allowCodes ) ? options.allowCodes : [];

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

	if ( response && response.code && 'success' !== response.code && ! allowCodes.includes( response.code ) ) {
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
			activeStarter: '',
		};
	}

	return {
		fullDemos: applied.fullDemos || {},
		recipes: applied.recipes || {},
		layoutUnits: applied.layoutUnits || {},
		// The starter currently applied as the live full site (server-tracked). Preserved through
		// normalization so the singular "Full site applied" status survives state updates.
		activeStarter: applied.activeStarter || '',
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

function starterHasAppliedLayoutUnits( starter, applied ) {
	const normalizedApplied = normalizeApplied( applied );
	const requiredLayouts = getAvailableLayoutIds( starter ).filter( ( id ) => ! [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );

	return requiredLayouts.length > 0 && requiredLayouts.every( ( id ) => {
		const entry = normalizedApplied.layoutUnits[ getLayoutUnitSlot( id ) ];
		return entry && entry.demoKey === starter.id;
	} );
}

function getAppliedStatusLabels( starter, imported, applied ) {
	const labels = [];
	const normalizedApplied = normalizeApplied( applied );
	const recipe = normalizedApplied.recipes[ 'recipe:' + starter.id ];

	// "Full site applied" is singular: only the starter currently applied as the live full site shows
	// it. That's the server-tracked `activeStarter`, NOT every starter ever imported — the import
	// journal is cumulative (it backs the reset feature), so applying several full demos over time
	// would otherwise badge them all. See pixassist_get_starter_sites_active_starter().
	if ( applied && applied.activeStarter && applied.activeStarter === starter.id ) {
		labels.push( __( 'Full site applied', 'pixelgrade_assistant' ) );
	}

	if ( recipe ) {
		labels.push( recipe.isApplied ? __( 'Layouts applied', 'pixelgrade_assistant' ) : __( 'Layouts customized', 'pixelgrade_assistant' ) );
	} else if ( starterHasAppliedLayoutUnits( starter, applied ) ) {
		labels.push( __( 'Layouts applied', 'pixelgrade_assistant' ) );
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

// Media imported during THIS page session, keyed by demo -> { remoteId: true }. Re-applying a starter would
// otherwise re-download every image: the server reuses the existing attachment (import_media_file dedups, so
// no duplicate is created), but the download is wasted and the progress UI looks like it is re-importing. We
// only skip media imported in this session — those attachments certainly still exist. Cross-reload re-imports
// still go through the server, which stays the correctness backstop and re-imports any attachment the user
// has since deleted, so skipping only what we just created keeps that recovery intact.
const sessionImportedMedia = {};

function markMediaImportedThisSession( demoKey, remoteId ) {
	if ( ! demoKey || ! remoteId ) {
		return;
	}
	if ( ! sessionImportedMedia[ demoKey ] ) {
		sessionImportedMedia[ demoKey ] = {};
	}
	sessionImportedMedia[ demoKey ][ String( remoteId ) ] = true;
}

function isMediaImportedThisSession( demoKey, remoteId ) {
	return Boolean( demoKey && sessionImportedMedia[ demoKey ] && sessionImportedMedia[ demoKey ][ String( remoteId ) ] );
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

	const addImportTask = ( label, type, args, progress = {} ) => {
		tasks.push( async () => {
			setProgress( {
				phase: progress.phase || 'content',
				message: label,
				details: progress.details || '',
			} );
			await restRequest( data, 'import', {
				demo_key: demoKey,
				type,
				url: baseUrl,
				args,
			} );
			setProgress(
				{
					message: progress.doneMessage || label,
					details: progress.doneDetails || '',
				},
				{
					advance: true,
					log: progress.logMessage || progress.doneMessage || label,
				}
			);
		} );
	};

	if ( includeSettings && config.pre_settings ) {
		addImportTask( __( 'Preparing settings...', 'pixelgrade_assistant' ), 'pre_settings', { data: config.pre_settings }, {
			phase: 'settings',
			details: __( 'Applying initial theme settings.', 'pixelgrade_assistant' ),
			doneMessage: __( 'Prepared theme settings.', 'pixelgrade_assistant' ),
			logMessage: __( 'Imported pre_settings.', 'pixelgrade_assistant' ),
		} );
	}

	if ( includeMedia && config.media && ! isEmptyObject( config.media.placeholders ) ) {
		const mediaUrl = trailingslash( starter.baseRestUrl ) + 'media';
		const mediaTotal = countMediaItems( config.media );
		let mediaIndex = 0;

		Object.keys( config.media ).forEach( ( groupKey ) => {
			if ( 'placeholders' === groupKey || 'source_urls' === groupKey || ! config.media[ groupKey ] ) {
				return;
			}

			Object.keys( config.media[ groupKey ] ).forEach( ( itemKey ) => {
				const remoteId = config.media[ groupKey ][ itemKey ];
				tasks.push( async () => {
					const currentMediaIndex = ++mediaIndex;

					// Already imported in this session: reuse it without re-downloading. Two progress
					// advances keep the bar aligned with the download+upload step accounting.
					if ( isMediaImportedThisSession( demoKey, remoteId ) ) {
						setProgress(
							{
								phase: 'media',
								message: sprintf(
									__( 'Already imported %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: sprintf( __( 'Remote attachment #%s', 'pixelgrade_assistant' ), remoteId ),
							},
							{ advance: true }
						);
						setProgress(
							{
								message: sprintf(
									__( 'Skipped media upload %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: __( 'Already in your media library.', 'pixelgrade_assistant' ),
							},
							{ advance: true }
						);
						return;
					}

					setProgress( {
						phase: 'media',
						message: sprintf(
							__( 'Downloading media %d of %d.', 'pixelgrade_assistant' ),
							currentMediaIndex,
							mediaTotal
						),
						details: sprintf( __( 'Remote attachment #%s', 'pixelgrade_assistant' ), remoteId ),
					} );
					const attachment = await fetchJson( mediaUrl + '?id=' + encodeURIComponent( remoteId ), { method: 'GET' } );

					if ( ! attachment || 'success' !== attachment.code || ! attachment.data || ! attachment.data.media ) {
						setProgress(
							{
								message: sprintf(
									__( 'Skipped media %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: __( 'The starter source did not return a usable file.', 'pixelgrade_assistant' ),
							},
							{ advance: true, log: __( 'Skipped a media download.', 'pixelgrade_assistant' ), logType: 'warning' }
						);
						setProgress(
							{
								message: sprintf(
									__( 'Skipped media upload %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: __( 'No upload was attempted.', 'pixelgrade_assistant' ),
							},
							{ advance: true }
						);
						return;
					}

					const media = attachment.data.media;
					if ( ! media.title || ! media.ext || ! media.data ) {
						setProgress(
							{
								message: sprintf(
									__( 'Skipped media %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: __( 'The media response was incomplete.', 'pixelgrade_assistant' ),
							},
							{ advance: true, log: __( 'Skipped malformed media data.', 'pixelgrade_assistant' ), logType: 'warning' }
						);
						setProgress(
							{
								message: sprintf(
									__( 'Skipped media upload %d of %d.', 'pixelgrade_assistant' ),
									currentMediaIndex,
									mediaTotal
								),
								details: __( 'No valid file metadata was returned.', 'pixelgrade_assistant' ),
							},
							{ advance: true }
						);
						return;
					}

					const filename = media.title + '.' + media.ext;

					setProgress(
						{
							message: sprintf(
								__( 'Downloaded media %d of %d.', 'pixelgrade_assistant' ),
								currentMediaIndex,
								mediaTotal
							),
							details: filename,
						},
						{ advance: true }
					);
					setProgress( {
						phase: 'media',
						message: sprintf(
							__( 'Uploading media %d of %d.', 'pixelgrade_assistant' ),
							currentMediaIndex,
							mediaTotal
						),
						details: filename,
					} );
					await restRequest( data, 'uploadMedia', {
						demo_key: demoKey,
						title: media.title,
						remote_id: remoteId,
						file_data: media.data,
						ext: media.ext,
						group: groupKey,
					} );
					markMediaImportedThisSession( demoKey, remoteId );
					setProgress(
						{
							message: sprintf(
								__( 'Uploaded media %d of %d.', 'pixelgrade_assistant' ),
								currentMediaIndex,
								mediaTotal
							),
							details: filename,
						},
						{ advance: true, log: sprintf( __( 'Imported media "%s".', 'pixelgrade_assistant' ), filename ) }
					);
				} );
			} );
		} );
	}

	if ( includeTaxonomies ) {
		valuesSortedByPriority( config.taxonomies ).forEach( ( entry ) => {
			if ( ! entry.name || ! entry.ids ) {
				return;
			}

			addImportTask(
				__( 'Importing taxonomies...', 'pixelgrade_assistant' ),
				'taxonomy',
				{
					tax: entry.name,
					ids: entry.ids,
				},
				{
					phase: 'taxonomies',
					details: sprintf( __( '%d terms in %s.', 'pixelgrade_assistant' ), Object.keys( entry.ids || {} ).length, entry.name ),
					doneMessage: sprintf( __( 'Imported taxonomy: %s.', 'pixelgrade_assistant' ), entry.name ),
					logMessage: sprintf( __( 'Imported taxonomy "%s".', 'pixelgrade_assistant' ), entry.name ),
				}
			);
		} );
	}

	valuesSortedByPriority( config.post_types ).forEach( ( entry ) => {
		if ( ! entry.name || ! entry.ids ) {
			return;
		}

		if ( postTypes && ! postTypes.includes( entry.name ) ) {
			return;
		}

		const progressPhase = getPostTypeProgressPhase( entry.name );

		addImportTask(
			__( 'Importing content...', 'pixelgrade_assistant' ),
			'post_type',
			{
				post_type: entry.name,
				ids: entry.ids,
			},
			{
				phase: progressPhase,
				details: sprintf( __( '%d records in %s.', 'pixelgrade_assistant' ), Object.keys( entry.ids || {} ).length, entry.name ),
				doneMessage: sprintf( __( 'Imported %s.', 'pixelgrade_assistant' ), entry.name ),
				logMessage: sprintf( __( 'Imported post type "%s".', 'pixelgrade_assistant' ), entry.name ),
			}
		);
	} );

	if ( includeWidgets && config.widgets ) {
		addImportTask( __( 'Importing widgets...', 'pixelgrade_assistant' ), 'parsed_widgets', { data: 'ok' }, {
			phase: 'layouts',
			details: __( 'Arranging widget areas.', 'pixelgrade_assistant' ),
			doneMessage: __( 'Imported widgets.', 'pixelgrade_assistant' ),
			logMessage: __( 'Imported widgets.', 'pixelgrade_assistant' ),
		} );
	}

	if ( includePostSettings && config.post_settings ) {
		tasks.push( async () => {
			const adminUrl = getAdminUrl();
			if ( adminUrl ) {
				setProgress( {
					phase: 'finish',
					message: __( 'Preparing the admin area...', 'pixelgrade_assistant' ),
					details: __( 'Refreshing WordPress before the final settings pass.', 'pixelgrade_assistant' ),
				} );
				await window.fetch( adminUrl, { credentials: 'same-origin' } ).catch( () => {} );
				setProgress(
					{
						message: __( 'Refreshed the WordPress admin context.', 'pixelgrade_assistant' ),
						details: __( 'Preparing the final settings pass.', 'pixelgrade_assistant' ),
					},
					{ advance: true }
				);
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
		addImportTask( __( 'Wrapping it up...', 'pixelgrade_assistant' ), 'post_settings', { data: config.post_settings }, {
			phase: 'finish',
			details: __( 'Saving menus, homepage, and theme options.', 'pixelgrade_assistant' ),
			doneMessage: __( 'Applied final settings.', 'pixelgrade_assistant' ),
			logMessage: __( 'Imported post_settings.', 'pixelgrade_assistant' ),
		} );
	}

	return tasks;
}

export async function importStarter( starter, data, copy, setProgress ) {
	setProgress( {
		phase: 'manifest',
		message: copy.importing,
		details: __( 'Contacting the starter source.', 'pixelgrade_assistant' ),
	} );

	const config = await fetchJson( trailingslash( starter.baseRestUrl ) + 'data', { method: 'GET' } );

	if ( ! config || 'success' !== config.code ) {
		throw new Error( config && config.message ? config.message : copy.failed );
	}

	setProgress(
		{
			phase: 'manifest',
			message: __( 'Content manifest received.', 'pixelgrade_assistant' ),
			details: __( 'Preparing the import queue.', 'pixelgrade_assistant' ),
			total: estimateStarterImportWork( config.data || {} ),
			phaseTotals: estimateStarterImportWorkByGroup( config.data || {} ),
		},
		{
			advance: true,
			log: __( 'Found available starter content. Preparing import steps.', 'pixelgrade_assistant' ),
		}
	);

	const tasks = buildImportTasks( starter, config.data || {}, data, setProgress );

	for ( const task of tasks ) {
		await task();
	}
}

async function importStarterParts( starter, parts, data, copy, setProgress, phaseTotalBase = null, progressTotalBase = 0 ) {
	setProgress( {
		phase: 'manifest',
		message: copy.actions.applySelectedParts,
		details: __( 'Reading the selected starter parts.', 'pixelgrade_assistant' ),
	} );

	const config = await fetchJson( trailingslash( starter.baseRestUrl ) + 'data', { method: 'GET' } );

	if ( ! config || 'success' !== config.code ) {
		throw new Error( config && config.message ? config.message : copy.failed );
	}

	setProgress(
		{
			phase: 'manifest',
			message: __( 'Content manifest received.', 'pixelgrade_assistant' ),
			details: __( 'Preparing the selected import steps.', 'pixelgrade_assistant' ),
			total: Number( progressTotalBase || 0 ) + estimateStarterImportWork( config.data || {}, parts ),
			phaseTotals: phaseTotalBase
				? combineStarterProgressGroups( phaseTotalBase, estimateStarterImportWorkByGroup( config.data || {}, parts ) )
				: estimateStarterImportWorkByGroup( config.data || {}, parts ),
		},
		{
			advance: true,
			log: __( 'Found available starter content. Preparing selected parts.', 'pixelgrade_assistant' ),
		}
	);

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
		setProgress( {
			phase: 'layouts',
			message: copy.actions.applyLayouts,
			details: __( 'Applying the starter layout recipe.', 'pixelgrade_assistant' ),
		} );
		return restRequest( data, 'applyRecipe', {
			recipe_id: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			include_look: Boolean( selectedOptions.includeLook ),
			include_sample: Boolean( selectedOptions.includeSample ),
		} );
	}

	if ( 'feature' === selectedAction.type ) {
		setProgress( {
			phase: 'features',
			message: copy.actions.addPortfolio,
			details: __( 'Adding the selected feature and templates.', 'pixelgrade_assistant' ),
		} );
		return restRequest( data, 'importUnit', {
			demo_key: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			unit_type: selectedAction.unitType || 'feature',
			unit: selectedAction.unit || 'portfolio',
			include_sample: Boolean( selectedOptions.includeSample ),
		} );
	}

	if ( 'layout_unit' === selectedAction.type ) {
		const label = getLayoutOperationLabel( selectedAction, copy );
		setProgress( {
			phase: 'layouts',
			message: sprintf( __( 'Applying %s.', 'pixelgrade_assistant' ), label ),
			details: __( 'Applying one selected layout part.', 'pixelgrade_assistant' ),
		} );
		return restRequest( data, 'importUnit', {
			demo_key: starter.id,
			url: trailingslash( starter.baseRestUrl ),
			unit_type: selectedAction.unitType,
			unit: selectedAction.unit,
		}, {
			allowCodes: [ 'unit_not_found' ],
		} );
	}

	if ( 'starter_parts' === selectedAction.type ) {
		return importStarterParts(
			starter,
			selectedAction.parts || {},
			data,
			copy,
			setProgress,
			selectedOptions.phaseTotalBase || null,
			selectedOptions.progressTotalBase || 0
		);
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
	if ( starterHasProducts( starter ) ) {
		if ( starterCommerceAvailable( starter ) ) {
			contentParts.push( { id: 'products', label: labels.products } );
		} else {
			// Present-but-locked commerce segment: surface it as a disabled row (with its reason) so a
			// shop-seeking user can see the shop exists and what it needs. getAllPartIds keeps locked
			// parts out of every selection/import path; the server also rejects unauthorized commerce.
			const commerceSegment = getStarterSegment( starter, 'commerce' );
			if ( commerceSegment ) {
				contentParts.push( {
					id: 'products',
					label: labels.products,
					available: false,
					gate: commerceSegment.gate || 'plus',
					reason: commerceSegment.availabilityReason || '',
				} );
			}
		}
	}

	return [
		{ id: 'content', label: groups.content, parts: contentParts },
		{ id: 'layouts', label: groups.layouts, parts: layoutParts },
		{ id: 'design', label: groups.design, parts: designParts },
		{ id: 'features', label: groups.features, parts: featureParts },
	].filter( ( group ) => group.parts.length );
}

function getAllPartIds( starter, copy ) {
	// Locked parts (e.g. a gated commerce segment shown disabled) must never enter any selection /
	// preset / import path — only the renderer (getComposerParts) sees them.
	return getComposerParts( starter, copy ).reduce( ( ids, group ) => ids.concat( group.parts.filter( ( part ) => false !== part.available ).map( ( part ) => part.id ) ), [] );
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

function buildLayoutUnitOperations( layoutIds, copy ) {
	return layoutIds
		.filter( ( id ) => LAYOUT_UNITS[ id ] )
		.map( ( id ) => ( {
			type: 'layout_unit',
			unitType: LAYOUT_UNITS[ id ].unit_type,
			unit: LAYOUT_UNITS[ id ].unit,
			layoutId: id,
			label: copy.composer.parts[ id ] || id,
		} ) );
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
		return buildLayoutUnitOperations( getAvailableLayoutIds( starter ), copy );
	}

	if ( 'portfolioOnly' === composerState.presetId ) {
		return [ { type: 'feature', unitType: 'feature', unit: 'portfolio', includeSampleDefault: selected.has( 'projects' ) } ];
	}

	const operations = [];
	const layoutIds = getAvailableLayoutIds( starter ).filter( ( id ) => selected.has( id ) );
	const selectedRegularLayouts = layoutIds.filter( ( id ) => ! [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );
	const selectedPortfolioLayouts = layoutIds.filter( ( id ) => [ 'portfolioArchive', 'portfolioSingle' ].includes( id ) );
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
		operations.push( ...buildLayoutUnitOperations( selectedPortfolioLayouts, copy ) );
	}

	if ( selectedRegularLayouts.length ) {
		operations.push( ...buildLayoutUnitOperations( selectedRegularLayouts, copy ) );
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

function renderProgressStageDot( phase ) {
	const baseStyle = {
		alignItems: 'center',
		borderRadius: '50%',
		boxSizing: 'border-box',
		display: 'inline-flex',
		flex: '0 0 16px',
		height: '16px',
		justifyContent: 'center',
		width: '16px',
	};

	if ( 'done' === phase.status ) {
		return createElement(
			'span',
			{
				'aria-hidden': true,
				className: 'progress__stage-dot progress__stage-dot--done',
				style: {
					...baseStyle,
					background: '#1e5aa8',
					border: '1px solid #1e5aa8',
					color: '#fff',
					fontSize: '11px',
					fontWeight: 700,
					lineHeight: 1,
				},
			},
			'✓'
		);
	}

	if ( 'active' === phase.status ) {
		return createElement(
			'span',
			{
				'aria-hidden': true,
				className: 'progress__stage-dot progress__stage-dot--active',
				style: {
					...baseStyle,
					background: '#fff',
					border: '1px solid #1e5aa8',
				},
			},
			createElement( Spinner, { style: { height: '16px', margin: 0, width: '16px' } } )
		);
	}

	return createElement( 'span', {
		'aria-hidden': true,
		className: 'progress__stage-dot progress__stage-dot--pending',
		style: {
			...baseStyle,
			background: '#fff',
			border: '1px solid #9bbcea',
		},
	} );
}

function renderProgressTimeline( phases ) {
	return createElement(
		'ul',
		{
			className: 'progress__timeline',
			style: {
				display: 'grid',
				gap: '5px',
				listStyle: 'none',
				margin: '12px 0 0',
				padding: 0,
			},
		},
		phases.map( ( phase ) =>
			createElement(
				'li',
				{
					className: 'progress__stage progress__stage--' + phase.status,
					key: phase.id,
					style: {
						alignItems: 'center',
						color: 'active' === phase.status ? '#1d2327' : '#4f637f',
						display: 'flex',
						fontSize: '12px',
						fontWeight: 'active' === phase.status ? 600 : 400,
						gap: '9px',
						minHeight: '22px',
					},
				},
				renderProgressStageDot( phase ),
				createElement( 'span', { style: { flex: '1 1 auto', minWidth: 0 } }, phase.label ),
				createElement(
					'span',
					{
						style: {
							color: '#647a99',
							flex: '0 0 auto',
							fontSize: '11px',
							fontVariantNumeric: 'tabular-nums',
						},
					},
					phase.countText
				)
			)
		)
	);
}

function renderProgressWarnings( warnings ) {
	if ( ! Array.isArray( warnings ) || ! warnings.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'progress__warning',
			style: {
				background: '#fff8e5',
				border: '1px solid #f0d58a',
				borderRadius: '4px',
				color: '#7a4d00',
				fontSize: '12px',
				lineHeight: 1.45,
				marginTop: '11px',
				padding: '7px 9px',
			},
		},
		warnings[ warnings.length - 1 ].message
	);
}

function renderProgressLog( log ) {
	const completed = ( Array.isArray( log ) ? log : [] ).slice( -5 ).reverse();

	if ( ! completed.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'progress__log',
			style: {
				borderTop: '1px solid rgba(30,90,168,0.16)',
				marginTop: '11px',
				paddingTop: '9px',
			},
		},
		createElement(
			'div',
			{
				style: {
					color: '#4f637f',
					fontSize: '11px',
					fontWeight: 600,
					marginBottom: '3px',
				},
			},
			__( 'Last completed', 'pixelgrade_assistant' )
		),
		completed.map( ( entry, index ) =>
			createElement(
				'div',
				{
					className: 'progress__log-entry progress__log-entry--' + ( entry.type || 'info' ),
					key: index,
					style: {
						alignItems: 'baseline',
						color: 'warning' === entry.type ? '#7a4d00' : '#506987',
						display: 'flex',
						fontSize: '11px',
						gap: '8px',
						lineHeight: 1.55,
						minWidth: 0,
					},
				},
				createElement(
					'span',
					{
						style: {
							color: '#7890ae',
							flex: '0 0 auto',
							fontVariantNumeric: 'tabular-nums',
						},
					},
					entry.time || '0s'
				),
				createElement( 'span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, entry.message )
			)
		)
	);
}

function getProgressHeadline( state, activePhase ) {
	if ( ! state || ! state.total || ! activePhase || ! activePhase.total ) {
		return __( 'Preparing…', 'pixelgrade_assistant' );
	}

	return sprintf( __( '%1$s — %2$d of %3$d', 'pixelgrade_assistant' ), activePhase.label, activePhase.count, activePhase.total );
}

function renderStatusNotice( state, copy, starterId = '' ) {
	if ( ! state || ! state.status || 'idle' === state.status ) {
		return null;
	}

	const isWorking = 'working' === state.status;
	const isSuccess = 'success' === state.status;
	const isError = 'error' === state.status;
	const isRequirements = 'requirements' === state.status;
	const tone =
		isError
			? { background: '#fcf0f1', border: '#f0b8bd', color: '#8a2424' }
			: isSuccess
			? { background: '#edfaef', border: '#b8e6c2', color: '#0a7a28' }
			: isRequirements
			? { background: '#fff8e5', border: '#f0d58a', color: '#7a4d00' }
			: { background: '#eef5ff', border: '#b8d4fb', color: '#1e5aa8' };
	const requirementsCopy = ( copy && copy.requirements ) || {};
	const pluginsTabUrl = copy && copy.pluginsTabUrl;
	const manageLabel = ( copy && copy.actions && copy.actions.managePlugins ) || __( 'Install required plugins', 'pixelgrade_assistant' );
	const total = Number( state.total || 0 );
	const current = Number( state.current || 0 );
	const ratio = total > 0 ? Math.max( 0, Math.min( 1, current / total ) ) : 0;
	const percent = Math.round( ratio * 100 );
	const elapsed = state.startedAt ? formatElapsed( Date.now() - state.startedAt ) : '';
	const phaseStates = getStarterProgressPhaseState( state );
	const activePhase = phaseStates.find( ( phase ) => 'active' === phase.status ) || phaseStates.find( ( phase ) => 'pending' === phase.status ) || phaseStates[0];
	const headline = getProgressHeadline( state, activePhase );
	const progressText = total
		? sprintf( __( '%1$d of %2$d steps', 'pixelgrade_assistant' ), current, total )
		: __( 'Preparing…', 'pixelgrade_assistant' );
	const percentText = total ? percent + '%' : '';
	const elapsedText = elapsed || '0s';
	const ariaValueText = total
		? sprintf( __( '%1$s, %2$d of %3$d steps, %4$d percent complete', 'pixelgrade_assistant' ), activePhase.label, current, total, percent )
		: __( 'Preparing import steps', 'pixelgrade_assistant' );

	return createElement(
		'div',
		{
			role: 'status',
			'data-starter-progress-id': starterId || undefined,
			'aria-live': isWorking ? 'polite' : undefined,
			'aria-atomic': isWorking ? false : undefined,
			style: {
				background: tone.background,
				border: '1px solid ' + tone.border,
				borderRadius: '4px',
				boxSizing: 'border-box',
				color: isWorking ? '#1d2327' : tone.color,
				fontSize: '13px',
				lineHeight: 1.4,
				margin: '12px 0 0',
				maxWidth: '100%',
				minWidth: 0,
				padding: '14px 16px',
				scrollMarginTop: '96px',
				width: '100%',
			},
		},
		isSuccess
			? createElement(
					Fragment,
					null,
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', gap: '10px' } },
						createElement(
							'span',
							{
								'aria-hidden': true,
								style: {
									alignItems: 'center',
									background: '#0a7a28',
									borderRadius: '50%',
									color: '#fff',
									display: 'inline-flex',
									flex: '0 0 18px',
									fontSize: '12px',
									fontWeight: 700,
									height: '18px',
									justifyContent: 'center',
									width: '18px',
								},
							},
							'✓'
						),
						createElement(
							'strong',
							{
								style: {
									color: '#0a7a28',
									fontSize: '13px',
								},
							},
							__( 'All done — your site is ready.', 'pixelgrade_assistant' )
						)
					),
					createElement(
						'p',
						{
							style: {
								color: '#2f6b3f',
								fontSize: '12px',
								margin: '7px 0 0',
							},
						},
						total
							? sprintf( __( 'Finished %1$d steps in %2$s.', 'pixelgrade_assistant' ), current || total, elapsedText )
							: __( 'The selected starter parts are in place.', 'pixelgrade_assistant' )
					),
					renderProgressWarnings( state.warnings ),
					createElement(
						'div',
						{ style: { marginTop: '12px' } },
						createElement(
							Button,
							{
								variant: 'primary',
								href: ( typeof window !== 'undefined' && window.pixassist && window.pixassist.siteUrl ) || '/',
								target: '_blank',
								rel: 'noreferrer',
							},
							__( 'View your site', 'pixelgrade_assistant' )
						)
					)
			  )
			: isWorking
			? createElement(
					Fragment,
					null,
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', gap: '9px' } },
						createElement( Spinner, { style: { flex: '0 0 auto', margin: 0 } } ),
						createElement(
							'strong',
							{ style: { color: '#1d3a73', flex: '1 1 auto', fontSize: '13px', minWidth: 0 } },
							headline
						),
						createElement(
							'span',
							{
								style: {
									color: '#3b5b97',
									flex: '0 0 auto',
									fontSize: '12px',
									fontVariantNumeric: 'tabular-nums',
									fontWeight: 600,
								},
							},
							percentText
						)
					),
					createElement(
						'div',
						{
							className: 'progress__bar',
							role: 'progressbar',
							'aria-valuemin': 0,
							'aria-valuemax': total || 100,
							'aria-valuenow': total ? current : percent,
							'aria-valuetext': ariaValueText,
							style: {
								background: 'rgba(30,90,168,0.18)',
								borderRadius: '999px',
								boxSizing: 'border-box',
								height: '6px',
								marginTop: '11px',
								overflow: 'hidden',
								width: '100%',
							},
						},
						createElement( 'div', {
							className: 'progress__bar-fill',
							style: {
								background: '#1e5aa8',
								height: '100%',
								transition: 'width 180ms ease',
								width: percent + '%',
							},
						} )
					),
					createElement(
						'div',
						{
							style: {
								alignItems: 'center',
								color: '#526b8c',
								display: 'flex',
								flexWrap: 'wrap',
								fontSize: '12px',
								gap: '8px 12px',
								justifyContent: 'space-between',
								marginTop: '8px',
							},
						},
						createElement( 'span', null, progressText ),
						createElement( 'span', { style: { fontVariantNumeric: 'tabular-nums' } }, elapsedText )
					),
					renderProgressTimeline( phaseStates ),
					state.heartbeat
						? createElement(
								'div',
								{
									className: 'progress__heartbeat',
									style: {
										alignItems: 'center',
										color: '#3b5b97',
										display: 'flex',
										fontSize: '12px',
										gap: '7px',
										lineHeight: 1.5,
										marginTop: '9px',
									},
								},
								createElement( Spinner, { style: { height: '14px', margin: 0, width: '14px' } } ),
								state.heartbeat
						  )
						: null,
					renderProgressWarnings( state.warnings ),
					renderProgressLog( state.log )
			  )
			: createElement(
					Fragment,
					null,
					isRequirements && requirementsCopy.heading
						? createElement( 'strong', { style: { display: 'block', marginBottom: '4px' } }, requirementsCopy.heading )
						: null,
					createElement( 'span', null, state.message ),
					isError && state.details
							? createElement(
									'p',
									{
										style: {
											fontSize: '12px',
											lineHeight: 1.5,
											margin: '6px 0 0',
										},
									},
									state.details
							  )
						: null
			  ),
		isRequirements && pluginsTabUrl
			? createElement(
					Button,
					{ href: pluginsTabUrl, style: { marginTop: '10px' }, variant: 'primary' },
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
			renderStatusNotice( state, copy, starter.id )
		)
	);
}

function renderComposerPartGroups( starter, copy, composerState, isWorking, onTogglePart ) {
	const selected = selectedPartSet( composerState );

	return createElement(
		'div',
		{ style: { display: 'grid', gap: '18px' } },
		createElement(
			'div',
			{ style: { display: 'flex', justifyContent: 'flex-end' } },
			createElement( PreviewModeToggle, null )
		),
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
						const isLocked = false === part.available;
						const isSelected = ! isLocked && selected.has( part.id );
						const mapping = ! isLocked && 'layouts' === group.id ? LAYOUT_UNITS[ part.id ] : null;
						const previewNode =
							mapping && starter.baseRestUrl
								? createElement(
										'div',
										{ style: { marginBottom: '8px' } },
										createElement( LayoutPreview, {
											baseRestUrl: starter.baseRestUrl,
											demoKey: starter.id,
											unitType: mapping.unit_type,
											unit: mapping.unit,
											maxHeight: 150,
											title: part.label,
										} )
								  )
								: null;

						return createElement(
							'div',
							{
								key: part.id,
								style: {
									background: isLocked ? '#f6f7f7' : isSelected ? '#f6f7ff' : '#fff',
									border: '1px solid ' + ( isSelected ? '#3858e9' : '#dcdcde' ),
									borderRadius: '4px',
									boxShadow: isSelected ? 'inset 3px 0 0 #3858e9' : 'none',
								opacity: isLocked ? 0.9 : 1,
									padding: '9px 10px',
								},
							},
							previewNode,
							createElement( CheckboxControl, {
								checked: isSelected,
								disabled: isWorking || isLocked,
								label: part.label,
								onChange: isLocked ? undefined : ( nextValue ) => onTogglePart( part.id, nextValue ),
							} ),
							isLocked && part.reason
								? createElement(
										'p',
										{ style: { color: '#646970', fontSize: '12px', margin: '6px 0 0' } },
										part.reason
								  )
								: null
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
								onClick: onBack,
							},
							copy.actions.cancel
						)
					),
					renderStatusNotice( state, copy, starter.id )
				)
			)
		)
	);
}

export function StarterSites() {
	const data = getStarterSitesData();
	const copy = mergeCopy( data.copy );
	// Layouts-only libraries (role === 'library', e.g. the Frame Library) are a Layouts SOURCE but not
	// a whole-site starter — drop them from the Starter Sites cards. They stay in the localized data
	// (the Layouts tab + its previews still read window.pixelgradeStarterSites for the source list).
	const starters = ( Array.isArray( data.starters ) ? data.starters : [] ).filter(
		( starter ) => 'library' !== ( starter && starter.role )
	);
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
				...( 'function' === typeof nextState ? nextState( current[ id ] || {} ) : nextState ),
			},
		} ) );
	};

	const setStarterProgress = ( id, update, options = {} ) => {
		setStarterState( id, ( previous ) => buildProgressState( previous, update, options ) );
	};

	useEffect( () => {
		const heartbeat = startStarterProgressHeartbeat( setStates );

		return () => {
			if ( heartbeat && window.clearInterval ) {
				window.clearInterval( heartbeat );
			}
		};
	}, [] );

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
			setStarterProgress(
				starter.id,
				{
					status: 'working',
					phase: 'prepare',
					message: copy.actions.working,
					details: __( 'Preparing the selected starter parts.', 'pixelgrade_assistant' ),
					current: 0,
					total: Math.max( operations.length, 1 ),
					log: [],
					warnings: [],
					phaseCounts: createStarterProgressGroups(),
					phaseTotals: estimateComposerOperationProgressGroups( operations ),
					startedAt: Date.now(),
				},
				{
					reset: true,
					log: sprintf( __( 'Started applying %s.', 'pixelgrade_assistant' ), starter.title || starter.id ),
				}
			);
			scrollStarterProgressIntoView( starter.id );

			for ( const [ index, operation ] of operations.entries() ) {
				const baseOperations = operations.filter( ( candidate, candidateIndex ) => candidateIndex !== index );
				const phaseTotalBase = 'starter_parts' === operation.type
					? estimateComposerOperationProgressGroups( baseOperations )
					: null;
				const progressTotalBase = 'starter_parts' === operation.type ? baseOperations.length : 0;
				const response = await applyStarterAction( starter, operation, { phaseTotalBase, progressTotalBase }, data, copy, ( message, options = {} ) => {
					setStarterProgress( starter.id, {
						status: 'working',
						...( 'string' === typeof message ? { message } : message ),
					}, options );
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
						// A full demo defines the live site — it becomes the (singular) active starter,
						// so "Full site applied" moves to this card without waiting for a reload.
						activeStarter: starter.id,
					} ) );
				}

				updateAppliedFromResponse( response );

				if ( ! [ 'full_demo', 'starter_parts' ].includes( operation.type ) ) {
					const skippedLayoutUnit = 'layout_unit' === operation.type && response && 'unit_not_found' === response.code;
					const appliedOperationMessage =
						skippedLayoutUnit
							? sprintf( __( "%s isn't included in this starter — skipped.", 'pixelgrade_assistant' ), getLayoutOperationLabel( operation, copy ) )
							: 'layout_unit' === operation.type
							? sprintf( __( 'Applied %s.', 'pixelgrade_assistant' ), getLayoutOperationLabel( operation, copy ) )
							: __( 'Applied selected operation.', 'pixelgrade_assistant' );

					setStarterProgress(
						starter.id,
						{
							message: appliedOperationMessage,
							details: '',
						},
						{
							advance: true,
							log: appliedOperationMessage,
							// A part the starter simply doesn't ship (unit_not_found) is expected, not a
							// problem — log it as neutral info, not an alarm-colored warning.
							logType: 'info',
						}
					);
				}
			}

			setStarterProgress( starter.id, {
				status: 'success',
				phase: 'done',
				message: copy.success,
				details: __( 'The selected starter parts are in place.', 'pixelgrade_assistant' ),
				heartbeat: '',
			} );
		} catch ( error ) {
			setStarterProgress( starter.id, {
				status: 'error',
				phase: 'error',
				message: error && error.message ? error.message : copy.error,
				details: __( 'The apply process stopped before all selected parts finished.', 'pixelgrade_assistant' ),
			}, { log: error && error.message ? error.message : copy.error, logType: 'error' } );
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
