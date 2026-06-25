/**
 * Pixelgrade Docs editor entry point (#46).
 *
 * Docs live in a single MODELESS floating window (DocsArticleWindow) that floats over the canvas
 * instead of a docked sidebar that eats the right rail — so it sits next to block settings / the
 * Style Manager sidebar rather than fighting them for the slot. The window hosts the full KB browser
 * (categories → search → article) AND the contextual single-article pop-up companions open via
 * openArticle(). Three entry points toggle it: a pinned toolbar button, the ⋮ Options menu, and the
 * command palette. No JSX: WordPress 5.9 is still supported.
 */
import { createElement, Fragment, useEffect, useState } from '@wordpress/element';
import { Button, createSlotFill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { PinnedItems } from '@wordpress/interface';
import { useCommand } from '@wordpress/commands';
import { help as helpIcon } from '@wordpress/icons';
import { getDocsData } from './data';
import { DocsArticleWindow, closeDocsWindow, openDocsArticle, openDocsBrowse } from './KbPanel';

const SLOT_FILL = createSlotFill( 'pixelgrade-docs' );

if ( 'undefined' !== typeof window ) {
	window.pixelgradeAdminHub = window.pixelgradeAdminHub || {};
	window.pixelgradeAdminHub.docs = {
		EscalationSlot: SLOT_FILL.Slot,
		EscalationFill: SLOT_FILL.Fill,
		// Curated host surface: companions (Style Manager, Nova Blocks, …) open a contextual article
		// pop-up in-place via window.pixelgradeAdminHub.docs.openArticle({ url | id | slug }).
		openArticle: openDocsArticle,
	};
}

function detectSurface() {
	if ( 'undefined' !== typeof document && document.body && document.body.classList.contains( 'site-editor-php' ) ) {
		return 'site';
	}

	if ( 'undefined' !== typeof window && window.location && -1 !== window.location.pathname.indexOf( 'site-editor.php' ) ) {
		return 'site';
	}

	return 'post';
}

function useEditorContext() {
	const data = getDocsData();
	const productSlug = data.product && data.product.sku ? data.product.sku : '';

	return useSelect(
		( select ) => {
			let surface = detectSurface();
			let postType = '';
			let templateId = '';

			try {
				const editor = select( 'core/editor' );
				if ( editor && typeof editor.getCurrentPostType === 'function' ) {
					postType = editor.getCurrentPostType() || '';
				}
				if ( editor && typeof editor.getEditedPostAttribute === 'function' ) {
					templateId = editor.getEditedPostAttribute( 'template' ) || '';
				}
			} catch ( error ) {}

			try {
				const editSite = select( 'core/edit-site' );
				if ( editSite ) {
					const editedType = typeof editSite.getEditedPostType === 'function' ? editSite.getEditedPostType() : '';
					const editedId = typeof editSite.getEditedPostId === 'function' ? editSite.getEditedPostId() : '';

					if ( editedType || editedId ) {
						surface = 'site';
						postType = editedType || postType;
						templateId = editedId || templateId;
					}
				}
			} catch ( error ) {}

			return {
				surface,
				postType,
				templateId,
				productSlug,
				articleId: null,
			};
		},
		[ productSlug ]
	);
}

// Track the window's open/minimized state (broadcast by DocsArticleWindow) so the toolbar toggle can
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

		window.addEventListener( 'pixelgrade-docs:openstate', onState );

		return () => window.removeEventListener( 'pixelgrade-docs:openstate', onState );
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

function DocsPlugin() {
	const data = getDocsData();
	const context = useEditorContext();
	const title = data.copy && data.copy.title ? data.copy.title : __( 'Pixelgrade Docs', 'pixelgrade_assistant' );
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
			: null,
		// The single docs surface: floating window hosting both the KB browser (default) and the
		// contextual single-article pop-up. The editor stays interactive while the user reads.
		createElement( DocsArticleWindow, { context, EscalationSlot: SLOT_FILL.Slot } )
	);
}

registerPlugin( 'pixelgrade-docs', {
	render: DocsPlugin,
	icon: helpIcon,
} );
