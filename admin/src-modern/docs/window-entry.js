/**
 * Editor-agnostic docs-window mount (#46, follow-everywhere).
 *
 * This bundle (`docs-window`) carries ONLY the floating window and its data — no @wordpress/editor,
 * @wordpress/plugins, @wordpress/interface or @wordpress/commands — so PHP can enqueue it on ANY
 * wp-admin page (the editor always; plain admin pages only while the window is open, via cookie). It
 * owns the host API (`window.pixelgradeAdminHub.docs`) and the escalation SlotFill; the editor
 * launchers (toolbar/menu/command, in ./index) drive it through the ./events bus. No JSX (WP 5.9).
 */
import { createElement, createRoot, render } from '@wordpress/element';
import { createSlotFill } from '@wordpress/components';
import { getDocsData } from './data';
import { openDocsArticle } from './events';
import { DocsArticleWindow } from './KbPanel';

const SLOT_FILL = createSlotFill( 'pixelgrade-docs' );

// Host API — present wherever the window is mounted. Merge so a launcher bundle that loaded first
// (or a future companion) isn't clobbered.
if ( 'undefined' !== typeof window ) {
	window.pixelgradeAdminHub = window.pixelgradeAdminHub || {};
	window.pixelgradeAdminHub.docs = Object.assign( {}, window.pixelgradeAdminHub.docs, {
		EscalationSlot: SLOT_FILL.Slot,
		EscalationFill: SLOT_FILL.Fill,
		// Companions (Style Manager, Nova Blocks, …) open a contextual article in-place.
		openArticle: openDocsArticle,
	} );
}

function detectSurface() {
	if ( 'undefined' !== typeof document && document.body && document.body.classList.contains( 'site-editor-php' ) ) {
		return 'site';
	}

	if ( 'undefined' !== typeof window && window.location && -1 !== window.location.pathname.indexOf( 'site-editor.php' ) ) {
		return 'site';
	}

	if ( 'undefined' !== typeof document && document.body && document.body.classList.contains( 'block-editor-page' ) ) {
		return 'post';
	}

	return 'admin';
}

function DocsWindowApp() {
	// Static context (no editor-store coupling) so this renders identically on any admin page.
	const data = getDocsData();
	const context = {
		surface: detectSurface(),
		productSlug: data.product && data.product.sku ? data.product.sku : '',
		articleId: null,
	};

	return createElement( DocsArticleWindow, { context, EscalationSlot: SLOT_FILL.Slot } );
}

function mountDocsWindow() {
	if ( 'undefined' === typeof document || ! document.body ) {
		return;
	}

	// One mount per page, even if this bundle is enqueued twice (editor hook + admin hook dedupe to one
	// handle, but guard anyway).
	if ( document.getElementById( 'pixelgrade-docs-window-root' ) ) {
		return;
	}

	const container = document.createElement( 'div' );
	container.id = 'pixelgrade-docs-window-root';
	document.body.appendChild( container );

	const element = createElement( DocsWindowApp );

	if ( 'function' === typeof createRoot ) {
		createRoot( container ).render( element );
	} else if ( 'function' === typeof render ) {
		render( element, container );
	}
}

mountDocsWindow();
