/**
 * The Appearance -> Pixelgrade hub shell.
 *
 * Renders the tab bar + the active tab's component. Tabs come from the server (visible, gated,
 * sorted); their React components come from the `pixelgrade.adminHub.tabs` JS filter. Routing is via
 * `?tab=`. A server-visible tab with no registered component renders a Placeholder.
 */
import { createElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getComponentMap } from './registry';
import { useTabRouting } from './useTabRouting';
import { TabBar } from './TabBar';
import { Placeholder } from './Placeholder';

export function App( { bootstrap } ) {
	const tabs = Array.isArray( bootstrap.tabs ) ? bootstrap.tabs : [];
	const ids = tabs.map( ( tab ) => tab.id );
	const fallback = bootstrap.defaultTab || ids[ 0 ] || '';
	const tabAliases = bootstrap.tabAliases && 'object' === typeof bootstrap.tabAliases ? bootstrap.tabAliases : {};

	const [ activeId, navigate ] = useTabRouting( ids, fallback, tabAliases );

	if ( ! tabs.length ) {
		return createElement( Placeholder, { tab: { id: 'pixelgrade', label: __( 'Pixelgrade Design', 'pixelgrade_assistant' ) } } );
	}

	const onSelect = ( id ) => {
		const tab = tabs.find( ( candidate ) => candidate.id === id );
		// Link tabs navigate the browser out rather than swapping content.
		if ( tab && tab.url ) {
			window.location.href = tab.url;
			return;
		}
		navigate( id );
	};

	const componentMap = getComponentMap();
	const activeTab = tabs.find( ( tab ) => tab.id === activeId ) || tabs[ 0 ];

	let content;
	if ( activeTab.url ) {
		// A link tab has no in-hub content; show a placeholder if somehow rendered.
		content = createElement( Placeholder, { tab: activeTab } );
	} else {
		const entry = componentMap[ activeTab.component ] || componentMap[ activeTab.id ];
		const Component = entry && entry.component ? entry.component : null;
		content = Component
			? createElement( Component, { tab: activeTab, bootstrap } )
			: createElement( Placeholder, { tab: activeTab } );
	}

	return createElement(
		Fragment,
		null,
		createElement(
			'header',
			{
				className: 'pixelgrade-admin-hub__chrome',
				style: {
					margin: '0 0 24px',
				},
			},
			createElement(
				'div',
				{
					className: 'pixelgrade-admin-hub__heading',
					style: {
						alignItems: 'center',
						display: 'flex',
						gap: '16px',
						justifyContent: 'space-between',
						margin: '0 0 14px',
					},
				},
				createElement(
					'h1',
					{
						className: 'pixelgrade-admin-hub__title',
						style: {
							fontSize: '26px',
							fontWeight: 600,
							lineHeight: 1.2,
							margin: 0,
						},
					},
					__( 'Pixelgrade Design', 'pixelgrade_assistant' )
				)
			),
			createElement( TabBar, { tabs, activeId: activeTab.id, onSelect } )
		),
		createElement( 'div', { className: 'pixelgrade-admin-hub__content' }, content )
	);
}
