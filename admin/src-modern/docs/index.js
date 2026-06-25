/**
 * Pixelgrade Docs editor launchers (#46).
 *
 * The docs window itself lives in the editor-agnostic `docs-window` bundle (./window-entry) so it can
 * follow the user across all of wp-admin. THIS bundle adds only the editor-only ways to open it — a
 * pinned toolbar button, a ⋮ Options-menu item, and a command-palette command — and drives the window
 * through the ./events bus. No JSX: WordPress 5.9 is still supported.
 */
import { createElement, Fragment, useEffect, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { PinnedItems } from '@wordpress/interface';
import { useCommand } from '@wordpress/commands';
import { help as helpIcon } from '@wordpress/icons';
import { getDocsData } from './data';
import { DOCS_EVENT_OPENSTATE, closeDocsWindow, openDocsBrowse } from './events';

// Track the window's open/minimized state (broadcast by the window bundle) so the toolbar toggle can
// reflect it and toggle correctly: open (and not minimized) → close; otherwise open/restore.
function useDocsWindowState() {
	const [ state, setState ] = useState( { open: false, minimized: false } );

	useEffect( () => {
		if ( 'undefined' === typeof window ) {
			return undefined;
		}

		const onState = ( event ) => {
			setState( ( event && event.detail ) || { open: false, minimized: false } );
		};

		window.addEventListener( DOCS_EVENT_OPENSTATE, onState );

		return () => window.removeEventListener( DOCS_EVENT_OPENSTATE, onState );
	}, [] );

	return state;
}

function toggleDocs( state ) {
	if ( state.open && ! state.minimized ) {
		closeDocsWindow();
	} else {
		openDocsBrowse();
	}
}

// Pinned toolbar button — the primary, most-discoverable launcher, matching the editor's other pinned
// plugin icons. PinnedItems IS the Fill; its slot name is `PinnedItems/<scope>` in the shared
// wp-components registry. The editor mounts a single PinnedItems slot, but the scope differs by
// editor/version (post vs site vs unified `core`), so we fill each candidate — only the active
// editor's mounted slot renders, giving exactly one button.
function DocsToolbarButton( { label } ) {
	const state = useDocsWindowState();

	if ( ! PinnedItems ) {
		return null;
	}

	const button = () =>
		createElement( Button, {
			icon: helpIcon,
			label,
			isPressed: state.open,
			'aria-expanded': state.open && ! state.minimized,
			onClick: () => toggleDocs( state ),
		} );

	return createElement(
		Fragment,
		null,
		createElement( PinnedItems, { scope: 'core' }, button() ),
		createElement( PinnedItems, { scope: 'core/edit-site' }, button() ),
		createElement( PinnedItems, { scope: 'core/edit-post' }, button() )
	);
}

// Command-palette entry (Cmd/Ctrl+K → "Pixelgrade Docs"). wp-commands is a hard bundle dependency,
// so useCommand is always available here.
function DocsCommand( { label } ) {
	useCommand( {
		name: 'pixelgrade-assistant/open-docs',
		label,
		icon: helpIcon,
		callback: ( { close } ) => {
			openDocsBrowse();
			if ( close ) {
				close();
			}
		},
	} );

	return null;
}

function DocsLaunchers() {
	const data = getDocsData();
	const title = data.copy && data.copy.title ? data.copy.title : __( 'Pixelgrade Design Docs', 'pixelgrade_assistant' );
	const menuLabel = data.copy && data.copy.menuLabel ? data.copy.menuLabel : title;

	return createElement(
		Fragment,
		null,
		createElement( DocsToolbarButton, { label: title } ),
		createElement( DocsCommand, { label: title } ),
		PluginMoreMenuItem
			? createElement(
					PluginMoreMenuItem,
					{ icon: helpIcon, onClick: () => openDocsBrowse() },
					menuLabel
			  )
			: null
	);
}

registerPlugin( 'pixelgrade-docs', {
	render: DocsLaunchers,
	icon: helpIcon,
} );
