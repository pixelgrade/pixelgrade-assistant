/**
 * The free Setup tab (#48) — a Pixelgrade Design preflight / readiness screen.
 *
 * Presentational shell around the readiness summary + the existing TGMPA/recommended-plugins data.
 * The readiness classification, copy, environment facts, and the plugin status/activation URLs all
 * come from `window.pixelgradePlugins`, assembled by includes/admin-plugins.php +
 * includes/setup-readiness.php. This component only renders and runs the install/activate actions.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, CardBody, Flex, FlexItem, Notice, Spinner } from '@wordpress/components';

import { getContributedSections, renderContributedSections, useSectionDeepLink } from '../contributedSections';

const SETUP_SECTIONS_FILTER = 'pixelgrade.adminHub.setupSections';
const SETUP_SECTION_ID_PREFIX = 'pixelgrade-setup-section-';

const DEFAULT_PLUGINS = {
	plugins: [],
	copy: {
		title: __( 'Site Setup', 'pixelgrade_assistant' ),
		content: __(
			'Check the recommended plugins and activate anything Pixelgrade Design needs before you start working.',
			'pixelgrade_assistant'
		),
		empty: __( 'You are all set. There are no recommended plugins for this theme right now.', 'pixelgrade_assistant' ),
		groups: {
			required: __( 'Required', 'pixelgrade_assistant' ),
			recommended: __( 'Recommended', 'pixelgrade_assistant' ),
		},
		actions: {
			install: __( 'Install', 'pixelgrade_assistant' ),
			activate: __( 'Activate', 'pixelgrade_assistant' ),
			update: __( 'Update', 'pixelgrade_assistant' ),
			active: __( 'Active', 'pixelgrade_assistant' ),
			inactive: __( 'Installed', 'pixelgrade_assistant' ),
			missing: __( 'Not installed', 'pixelgrade_assistant' ),
			outdated: __( 'Update available', 'pixelgrade_assistant' ),
			working: __( 'Working...', 'pixelgrade_assistant' ),
			failed: __( 'Action failed.', 'pixelgrade_assistant' ),
			refresh: __( 'Refresh the page to confirm the latest plugin status.', 'pixelgrade_assistant' ),
		},
	},
};

export function getPluginsData() {
	if ( typeof window !== 'undefined' && window.pixelgradePlugins ) {
		return window.pixelgradePlugins;
	}

	return DEFAULT_PLUGINS;
}

function getAdminUrl( path ) {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.adminUrl ) {
		return window.pixassist.adminUrl + path.replace( /^\//, '' );
	}

	return path;
}

function normalizeActionUrl( url ) {
	return ( url || '' ).replace( /&amp;/g, '&' );
}

function scheduleStatusRefresh() {
	if ( typeof window === 'undefined' || ! window.location || typeof window.setTimeout !== 'function' ) {
		return;
	}

	window.setTimeout( () => window.location.reload(), 700 );
}

function getActions( copy ) {
	return {
		...DEFAULT_PLUGINS.copy.actions,
		...( copy && copy.actions ? copy.actions : {} ),
	};
}

function statusTone( status ) {
	if ( 'active' === status ) {
		return { background: '#edfaef', color: '#0a7a28', border: '#b8e6c2' };
	}

	if ( 'outdated' === status ) {
		return { background: '#fff8e5', color: '#7a4d00', border: '#f0d58a' };
	}

	if ( 'working' === status ) {
		return { background: '#eef5ff', color: '#1e5aa8', border: '#b8d4fb' };
	}

	if ( 'failed' === status ) {
		return { background: '#fcf0f1', color: '#b32d2e', border: '#f0b8bd' };
	}

	return { background: '#f6f7f7', color: '#50575e', border: '#dcdcde' };
}

function renderStatus( plugin, copy ) {
	const actions = getActions( copy );
	const status = plugin.status || 'missing';
	const label = actions[ status ] || status;
	const tone = statusTone( status );

	return createElement(
		'span',
		{
			style: {
				alignItems: 'center',
				background: tone.background,
				border: '1px solid ' + tone.border,
				borderRadius: '999px',
				color: tone.color,
				display: 'inline-flex',
				fontSize: '12px',
				fontWeight: 600,
				lineHeight: '20px',
				minHeight: '22px',
				padding: '0 8px',
				whiteSpace: 'nowrap',
			},
		},
		'working' === status ? createElement( Spinner, { style: { margin: '0 6px 0 0' } } ) : null,
		label
	);
}

function renderDescription( plugin ) {
	if ( ! plugin.description ) {
		return null;
	}

	return createElement( 'p', {
		style: { color: '#50575e', margin: '8px 0 0', maxWidth: '680px' },
		dangerouslySetInnerHTML: { __html: plugin.description },
	} );
}

function renderPluginMeta( plugin, copy ) {
	const bits = [];

	if ( plugin.required ) {
		bits.push( copy.groups && copy.groups.required ? copy.groups.required : __( 'Required', 'pixelgrade_assistant' ) );
	} else {
		bits.push( copy.groups && copy.groups.recommended ? copy.groups.recommended : __( 'Recommended', 'pixelgrade_assistant' ) );
	}

	if ( plugin.author ) {
		bits.push( plugin.author );
	}

	return createElement(
		'p',
		{ style: { color: '#757575', margin: '4px 0 0' } },
		bits.join( ' - ' )
	);
}

export function hasUpdatesApi() {
	return Boolean(
		typeof window !== 'undefined' &&
			window.wp &&
			window.wp.updates &&
			typeof window.wp.updates.installPlugin === 'function'
	);
}

function installPlugin( plugin, event, updatePlugin, copy, setNotice ) {
	const actions = getActions( copy );

	if ( typeof window !== 'undefined' && window.wp && window.wp.updates && window.wp.updates.maybeRequestFilesystemCredentials ) {
		window.wp.updates.maybeRequestFilesystemCredentials( event );
	}

	if ( ! hasUpdatesApi() ) {
		if ( plugin.installUrl ) {
			window.location.href = normalizeActionUrl( plugin.installUrl );
			return;
		}

		setNotice( { type: 'warning', message: actions.failed } );
		return;
	}

	updatePlugin( plugin.slug, { status: 'working' } );

	window.wp.updates.installPlugin( {
		slug: plugin.slug,
		pixassist_plugin_install: true,
		plugin_source_type: plugin.sourceType || 'repo',
		force_tgmpa: 'load',
		success: ( response ) => {
			const activateUrl = response && response.activateUrl ? response.activateUrl : plugin.activateUrl;

			if ( activateUrl ) {
				activatePlugin( plugin, activateUrl, updatePlugin, copy, setNotice );
				return;
			}

			updatePlugin( plugin.slug, {
				status: 'inactive',
				isInstalled: true,
			} );
			setNotice( { type: 'info', message: actions.refresh } );
			scheduleStatusRefresh();
		},
		error: () => {
			updatePlugin( plugin.slug, { status: 'failed' } );
			setNotice( { type: 'error', message: actions.failed } );
		},
	} );
}

function activatePlugin( plugin, url, updatePlugin, copy, setNotice ) {
	const activateUrl = normalizeActionUrl( url || plugin.activateUrl );
	const actions = getActions( copy );

	if ( ! activateUrl || typeof window === 'undefined' || typeof window.fetch !== 'function' ) {
		if ( activateUrl ) {
			window.location.href = activateUrl;
			return;
		}

		setNotice( { type: 'warning', message: actions.failed } );
		return;
	}

	updatePlugin( plugin.slug, { status: 'working' } );

	window
		.fetch( activateUrl, { credentials: 'same-origin' } )
		.then( ( response ) => {
			if ( ! response.ok ) {
				throw new Error( 'activate_failed' );
			}

			updatePlugin( plugin.slug, {
				status: 'active',
				isInstalled: true,
				isActive: true,
			} );
			setNotice( { type: 'success', message: actions.refresh } );
			scheduleStatusRefresh();
		} )
		.catch( () => {
			updatePlugin( plugin.slug, { status: 'failed' } );
			setNotice( { type: 'error', message: actions.failed } );
		} );
}

/**
 * Promise wrapper around the same install + activate flow the tab buttons use, for the Overview
 * "Set up my site" orchestration (the Get-started card). Reuses `wp.updates.installPlugin` and the
 * activation fetch so the card and the tab share one install path; resolves when the plugin is
 * active (or already was), rejects on failure.
 *
 * @param {Object} plugin Plugin descriptor (slug, status, activateUrl, installUrl, sourceType).
 * @return {Promise<void>}
 */
export function ensurePluginActive( plugin ) {
	return new Promise( ( resolve, reject ) => {
		if ( ! plugin || ! plugin.slug ) {
			resolve();
			return;
		}

		if ( 'active' === plugin.status || plugin.isActive ) {
			resolve();
			return;
		}

		const activate = ( url ) => {
			const activateUrl = normalizeActionUrl( url || plugin.activateUrl );

			if ( ! activateUrl || typeof window === 'undefined' || typeof window.fetch !== 'function' ) {
				reject( new Error( 'activate_failed' ) );
				return;
			}

			window
				.fetch( activateUrl, { credentials: 'same-origin' } )
				.then( ( response ) => {
					if ( ! response.ok ) {
						throw new Error( 'activate_failed' );
					}
					resolve();
				} )
				.catch( () => reject( new Error( 'activate_failed' ) ) );
		};

		// Installed but inactive — just activate.
		if ( 'inactive' === plugin.status || ( plugin.isInstalled && ! plugin.isActive ) ) {
			activate( plugin.activateUrl );
			return;
		}

		if ( plugin.actionType === 'external' ) {
			reject( new Error( 'external_action_required' ) );
			return;
		}

		// Needs installing first. Without the wp.updates API we cannot do this silently.
		if ( ! hasUpdatesApi() ) {
			reject( new Error( 'install_unavailable' ) );
			return;
		}

		window.wp.updates.installPlugin( {
			slug: plugin.slug,
			pixassist_plugin_install: true,
			plugin_source_type: plugin.sourceType || 'repo',
			force_tgmpa: 'load',
			success: ( response ) => {
				const activateUrl = response && response.activateUrl ? response.activateUrl : plugin.activateUrl;
				if ( activateUrl ) {
					activate( activateUrl );
					return;
				}
				// Installed but no activate URL handed back — treat as success; a reload reflects it.
				resolve();
			},
			error: () => reject( new Error( 'install_failed' ) ),
		} );
	} );
}

function renderAction( plugin, updatePlugin, copy, setNotice ) {
	const actions = getActions( copy );

	if ( 'working' === plugin.status ) {
		return createElement(
			Button,
			{ variant: 'secondary', disabled: true },
			actions.working || __( 'Working...', 'pixelgrade_assistant' )
		);
	}

	if ( 'active' === plugin.status ) {
		// Terminal state with no action — the status badge already says "Active", so a disabled
		// "Active" button would just duplicate it.
		return null;
	}

	if ( 'outdated' === plugin.status ) {
		return createElement(
			Button,
			{ variant: 'secondary', href: getAdminUrl( 'plugins.php' ) },
			actions.update || __( 'Update', 'pixelgrade_assistant' )
		);
	}

	if ( plugin.actionType === 'external' && plugin.externalActionUrl && ! plugin.isInstalled ) {
		return createElement(
			Button,
			{
				variant: 'primary',
				href: normalizeActionUrl( plugin.externalActionUrl ),
				target: '_blank',
				rel: 'noreferrer',
			},
			plugin.externalActionLabel || __( 'Open', 'pixelgrade_assistant' )
		);
	}

	if ( 'inactive' === plugin.status ) {
		return createElement(
			Button,
			{
				variant: 'primary',
				onClick: () => activatePlugin( plugin, plugin.activateUrl, updatePlugin, copy, setNotice ),
			},
			actions.activate || __( 'Activate', 'pixelgrade_assistant' )
		);
	}

	return createElement(
		Button,
		{
			variant: 'primary',
			onClick: ( event ) => installPlugin( plugin, event, updatePlugin, copy, setNotice ),
		},
		actions.install || __( 'Install', 'pixelgrade_assistant' )
	);
}

function renderPlugin( plugin, updatePlugin, copy, setNotice ) {
	return createElement(
		Card,
		{
			key: plugin.slug,
			className: 'pixelgrade-plugins__item pixelgrade-plugins__item--' + ( plugin.status || 'missing' ),
			style: { marginBottom: '12px' },
		},
		createElement(
			CardBody,
			null,
			createElement(
				Flex,
				{ align: 'flex-start', gap: 4, justify: 'space-between' },
				createElement(
					FlexItem,
					{ isBlock: true },
					createElement( 'h3', { style: { margin: 0 } }, plugin.name || plugin.slug ),
					renderPluginMeta( plugin, copy ),
					renderDescription( plugin )
				),
				createElement(
					FlexItem,
					null,
					createElement(
						'div',
						{ style: { alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: '8px' } },
						renderStatus( plugin, copy ),
						renderAction( plugin, updatePlugin, copy, setNotice )
					)
				)
			)
		)
	);
}

/**
 * Color tones for the overall readiness state and the per-check severity badges. Mirrors the
 * statusTone() palette so the Setup screen reads consistently with the plugin status pills.
 */
function readinessTone( status ) {
	if ( 'ready' === status || 'ok' === status ) {
		return { background: '#edfaef', color: '#0a7a28', border: '#b8e6c2' };
	}

	if ( 'attention' === status || 'warning' === status ) {
		return { background: '#fff8e5', color: '#7a4d00', border: '#f0d58a' };
	}

	if ( 'blocked' === status ) {
		return { background: '#fcf0f1', color: '#b32d2e', border: '#f0b8bd' };
	}

	return { background: '#f6f7f7', color: '#50575e', border: '#dcdcde' };
}

function readinessCountsLabel( overall ) {
	const counts = ( overall && overall.counts ) || {};
	const blocked = counts.blocked || 0;
	const warning = counts.warning || 0;

	if ( ! blocked && ! warning ) {
		return __( 'All checks passed.', 'pixelgrade_assistant' );
	}

	const bits = [];
	if ( blocked ) {
		bits.push(
			blocked === 1
				? __( '1 blocker', 'pixelgrade_assistant' )
				// translators: %d: number of blocking issues.
				: sprintf( __( '%d blockers', 'pixelgrade_assistant' ), blocked )
		);
	}
	if ( warning ) {
		bits.push(
			warning === 1
				? __( '1 to review', 'pixelgrade_assistant' )
				// translators: %d: number of non-blocking issues to review.
				: sprintf( __( '%d to review', 'pixelgrade_assistant' ), warning )
		);
	}

	return bits.join( ' · ' );
}

function renderOverallCard( overall ) {
	if ( ! overall || ! overall.status ) {
		return null;
	}

	const tone = readinessTone( overall.status );

	return createElement(
		Card,
		{
			className: 'pixelgrade-setup__overall pixelgrade-setup__overall--' + overall.status,
			style: { marginBottom: '16px', borderLeft: '4px solid ' + tone.color },
		},
		createElement(
			CardBody,
			null,
			createElement(
				'span',
				{
					style: {
						background: tone.background,
						border: '1px solid ' + tone.border,
						borderRadius: '999px',
						color: tone.color,
						display: 'inline-block',
						fontSize: '12px',
						fontWeight: 600,
						lineHeight: '20px',
						marginBottom: '8px',
						padding: '0 10px',
					},
				},
				readinessCountsLabel( overall )
			),
			createElement( 'h2', { style: { margin: '0 0 4px' } }, overall.title ),
			overall.description
				? createElement( 'p', { style: { color: '#50575e', margin: 0, maxWidth: '760px' } }, overall.description )
				: null
		)
	);
}

function renderCheckItems( check ) {
	const items = Array.isArray( check.items ) ? check.items : [];
	if ( ! items.length ) {
		return null;
	}

	return createElement(
		'ul',
		{ style: { margin: '8px 0 0', paddingLeft: '18px', color: '#50575e' } },
		items.map( ( item, index ) => {
			// Plugin items carry { name, status }; companion items carry { label, version, range }.
			let text = item.name || item.label || '';
			if ( item.range ) {
				text = ( item.label || '' ) + ' ' + ( item.version || '' ) + ' (' + item.range + ')';
			}

			return createElement( 'li', { key: index, style: { margin: '2px 0' } }, text );
		} )
	);
}

function renderIssueCard( check, copy ) {
	const tone = readinessTone( check.status );
	const badge = 'blocked' === check.status ? copy.blockedBadge : copy.warningBadge;

	const rows = [];
	if ( check.value ) {
		rows.push( [ copy.currentLabel, check.value ] );
	}
	if ( check.expected ) {
		rows.push( [ copy.expectedLabel, check.expected ] );
	}

	return createElement(
		Card,
		{
			key: check.id,
			className: 'pixelgrade-setup__issue pixelgrade-setup__issue--' + check.id,
			style: { marginBottom: '12px', borderLeft: '4px solid ' + tone.color },
		},
		createElement(
			CardBody,
			null,
			createElement(
				Flex,
				{ align: 'flex-start', gap: 4, justify: 'space-between' },
				createElement(
					FlexItem,
					{ isBlock: true },
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
						createElement(
							'span',
							{
								style: {
									background: tone.background,
									border: '1px solid ' + tone.border,
									borderRadius: '999px',
									color: tone.color,
									fontSize: '11px',
									fontWeight: 600,
									lineHeight: '18px',
									padding: '0 8px',
									textTransform: 'uppercase',
								},
							},
							badge
						),
						createElement( 'h3', { style: { margin: 0 } }, check.label )
					),
					rows.map( ( row, index ) =>
						createElement(
							'p',
							{ key: index, style: { color: '#50575e', margin: '6px 0 0' } },
							createElement( 'strong', null, row[ 0 ] + ': ' ),
							row[ 1 ]
						)
					),
					check.why
						? createElement(
								'p',
								{ style: { color: '#50575e', margin: '6px 0 0' } },
								createElement( 'strong', null, copy.whyLabel + ': ' ),
								check.why
						  )
						: null,
					renderCheckItems( check )
				),
				check.action && check.action.url
					? createElement(
							FlexItem,
							null,
							createElement(
								Button,
								{ variant: 'secondary', href: check.action.url, target: '_blank', rel: 'noreferrer' },
								check.action.label
							)
					  )
					: null
			)
		)
	);
}

function renderIssues( readiness, copy ) {
	const checks = Array.isArray( readiness.checks ) ? readiness.checks : [];
	// The `plugins` check has its own actionable list rendered below, so surfacing it as an issue card
	// here would just duplicate it. Every other check has no list, so it keeps its actionable card.
	const issues = checks.filter(
		( check ) => ( 'warning' === check.status || 'blocked' === check.status ) && 'plugins' !== check.id
	);

	if ( ! issues.length ) {
		return null;
	}

	return createElement(
		Fragment,
		null,
		createElement( 'h2', { style: { fontSize: '15px', margin: '0 0 8px' } }, copy.issuesTitle ),
		issues.map( ( check ) => renderIssueCard( check, copy ) )
	);
}

// Informational, not actionable — rendered as a plain, de-emphasized section (no bordered card, which
// is reserved for the actionable issue cards above) separated from the list by a hairline rule.
function renderEnvironmentSummary( readiness, copy ) {
	const rows = Array.isArray( readiness.environment ) ? readiness.environment : [];
	const links = readiness.links || {};

	if ( ! rows.length && ! links.systemStatus ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'pixelgrade-setup__environment',
			style: { borderTop: '1px solid #e0e0e0', marginTop: '24px', paddingTop: '16px' },
		},
		createElement( 'h2', { style: { fontSize: '15px', margin: '0 0 12px' } }, copy.environmentTitle ),
		createElement(
			'div',
			{ style: { display: 'flex', flexWrap: 'wrap', gap: '8px 32px' } },
			rows.map( ( row, index ) =>
				createElement(
					'div',
					{ key: index, style: { minWidth: '120px' } },
					createElement( 'div', { style: { color: '#757575', fontSize: '12px' } }, row.label ),
					createElement( 'div', { style: { fontWeight: 600 } }, row.value )
				)
			)
		),
		links.systemStatus
			? createElement(
					'div',
					{ style: { marginTop: '12px' } },
					createElement(
						Button,
						{ variant: 'link', href: links.systemStatus, style: { paddingLeft: 0 } },
						copy.diagnosticsLabel
					),
					copy.diagnosticsHint
						? createElement( 'p', { style: { color: '#757575', fontSize: '12px', margin: '4px 0 0' } }, copy.diagnosticsHint )
						: null
			  )
			: null
	);
}

/**
 * Contributed Setup sections — the same extension pattern as Styles' `stylesSections`
 * (`pixelgrade.adminHub.accountPanels` for Account, `pixelgrade.adminHub.stylesSections` for
 * Styles), applied to the Setup tab so companions (e.g. a readiness-adjacent control that needs
 * more than a single check row) can render below the host-owned content without Assistant knowing
 * anything about their contents. Logic lives in the shared ../contributedSections module.
 */
function renderSetupSections( data ) {
	const sections = getContributedSections( SETUP_SECTIONS_FILTER, data );

	return renderContributedSections( sections, {
		idPrefix: SETUP_SECTION_ID_PREFIX,
		extraProps: { setupData: data },
	} );
}

export function Plugins() {
	const data = getPluginsData();
	const copy = data.copy || DEFAULT_PLUGINS.copy;
	const readiness = data.readiness || {};
	const readinessCopy = readiness.copy || {};
	const [ plugins, setPlugins ] = useState( Array.isArray( data.plugins ) ? data.plugins : [] );
	const [ notice, setNotice ] = useState( null );

	useSectionDeepLink( SETUP_SECTION_ID_PREFIX );

	const updatePlugin = ( slug, patch ) => {
		setPlugins( ( current ) =>
			current.map( ( plugin ) => ( plugin.slug === slug ? { ...plugin, ...patch } : plugin ) )
		);
	};

	const pluginsTitle = readinessCopy.pluginsTitle || copy.title || DEFAULT_PLUGINS.copy.title;

	return createElement(
		Fragment,
		null,
		renderOverallCard( readiness.overall ),
		renderIssues( readiness, readinessCopy ),
		notice
			? createElement(
					Notice,
					{
						status: notice.type || 'info',
						onRemove: () => setNotice( null ),
					},
					notice.message
			  )
			: null,
		// Plain section header (not a bordered card) — the bordered-card treatment is reserved for the
		// actionable issue cards above. The actionable plugin rows below stay as cards.
		createElement(
			'div',
			{ className: 'pixelgrade-plugins__intro', style: { margin: '24px 0 12px' } },
			createElement( 'h2', { style: { fontSize: '15px', margin: '0 0 4px' } }, pluginsTitle ),
			copy.content
				? // Plain, static readiness copy (PHP-escaped, no embedded markup) — render as text.
				  createElement(
						'p',
						{ style: { color: '#50575e', margin: 0, maxWidth: '760px' } },
						copy.content
				  )
				: null
		),
		plugins.length
			? plugins.map( ( plugin ) => renderPlugin( plugin, updatePlugin, copy, setNotice ) )
			: createElement(
					Notice,
					{ status: 'info', isDismissible: false },
					copy.empty || DEFAULT_PLUGINS.copy.empty
			  ),
		renderEnvironmentSummary( readiness, readinessCopy ),
		renderSetupSections( data )
	);
}
