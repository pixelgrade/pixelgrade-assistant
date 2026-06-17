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

	const [ activeId, navigate ] = useTabRouting( ids, fallback );

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
			'h1',
			{ className: 'screen-reader-text' },
			__( 'Pixelgrade Design', 'pixelgrade_assistant' )
		),
		createElement( TabBar, { tabs, activeId: activeTab.id, onSelect } ),
		createElement( 'div', { className: 'pixelgrade-admin-hub__content' }, content )
	);
}
