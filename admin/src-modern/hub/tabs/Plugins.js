/**
 * The free Plugins tab (#48).
 *
 * Presentational shell around the existing TGMPA/recommended-plugins data. Definitions, status, and
 * activation URLs come from `window.pixelgradePlugins`, assembled by includes/admin-plugins.php.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Notice, Spinner } from '@wordpress/components';

const DEFAULT_PLUGINS = {
	plugins: [],
	copy: {
		title: __( 'Manage plugins', 'pixelgrade_assistant' ),
		content: '',
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

export function Plugins() {
	const data = getPluginsData();
	const copy = data.copy || DEFAULT_PLUGINS.copy;
	const [ plugins, setPlugins ] = useState( Array.isArray( data.plugins ) ? data.plugins : [] );
	const [ notice, setNotice ] = useState( null );

	const updatePlugin = ( slug, patch ) => {
		setPlugins( ( current ) =>
			current.map( ( plugin ) => ( plugin.slug === slug ? { ...plugin, ...patch } : plugin ) )
		);
	};

	return createElement(
		Fragment,
		null,
		createElement(
			Card,
			{ className: 'pixelgrade-plugins__intro', style: { marginBottom: '16px' } },
			createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.title || DEFAULT_PLUGINS.copy.title ) ),
			copy.content
				? createElement(
						CardBody,
						null,
						// The copy embeds the active theme title, which legitimately carries a small
						// "Free"/"Pro" badge span (see pixassist_modify_theme_supports_by_features()).
						// Render it as HTML so the badge shows instead of leaking a literal `<span>`.
						createElement( 'p', {
							style: { margin: 0, maxWidth: '760px' },
							dangerouslySetInnerHTML: { __html: copy.content },
						} )
				  )
				: null
		),
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
		plugins.length
			? plugins.map( ( plugin ) => renderPlugin( plugin, updatePlugin, copy, setNotice ) )
			: createElement(
					Notice,
					{ status: 'info', isDismissible: false },
					copy.empty || DEFAULT_PLUGINS.copy.empty
			  )
	);
}
