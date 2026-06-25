/**
 * Shared docs-window event bus + cross-bundle state — NO React, NO editor deps.
 *
 * The docs window now lives in its own editor-agnostic bundle (`docs-window`) so it can mount on ANY
 * wp-admin page, while the editor launchers (toolbar/menu/command) live in the `docs` bundle. The two
 * bundles never share module state, so they coordinate purely through `window` CustomEvents and a
 * window-global "is a window listening?" counter. This module is imported by both.
 */

export const DOCS_EVENT_OPEN_ARTICLE = 'pixelgrade-docs:open-article';
export const DOCS_EVENT_OPEN_BROWSE = 'pixelgrade-docs:open-browse';
export const DOCS_EVENT_CLOSE = 'pixelgrade-docs:close';
export const DOCS_EVENT_OPENSTATE = 'pixelgrade-docs:openstate';

const DOCS_OPEN_COOKIE = 'pixassist_docs_open';

// A window-global so BOTH bundles agree on whether a DocsArticleWindow is mounted and listening.
// (A module-level counter would be per-bundle and read 0 in the editor-launcher bundle.)
function listenerCount() {
	return ( 'undefined' !== typeof window && window.__pixassistDocsListeners ) || 0;
}

export function registerDocsWindowListener() {
	if ( 'undefined' !== typeof window ) {
		window.__pixassistDocsListeners = listenerCount() + 1;
	}
}

export function unregisterDocsWindowListener() {
	if ( 'undefined' !== typeof window ) {
		window.__pixassistDocsListeners = Math.max( 0, listenerCount() - 1 );
	}
}

/**
 * Fire-and-forget opener for the contextual article pop-up. Any Pixelgrade surface (Style Manager,
 * Nova Blocks, …) calls window.pixelgradeAdminHub.docs.openArticle({ url | id | slug }). Returns
 * truthy ONLY while a window is mounted, so callers keep their external-link fallback otherwise — the
 * return value attests delivery, not just dispatch.
 */
export function openDocsArticle( payload ) {
	if ( 'undefined' === typeof window || ! window.CustomEvent || listenerCount() < 1 ) {
		return false;
	}

	window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_OPEN_ARTICLE, { detail: payload || {} } ) );

	return true;
}

/**
 * Open (or restore) the docs browser in the floating window. Used by the editor toolbar/menu/command.
 * Returns truthy only while a window is mounted (same delivery attestation as openDocsArticle).
 */
export function openDocsBrowse() {
	if ( 'undefined' === typeof window || ! window.CustomEvent || listenerCount() < 1 ) {
		return false;
	}

	window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_OPEN_BROWSE, {} ) );

	return true;
}

/** Close the docs window from outside (the editor toolbar toggle). */
export function closeDocsWindow() {
	if ( 'undefined' === typeof window || ! window.CustomEvent ) {
		return;
	}

	window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_CLOSE, {} ) );
}

/**
 * Mirror the window's open state to a cookie so PHP can decide whether to enqueue the (editor-agnostic)
 * docs-window bundle on a plain admin page — the window follows the user across full page reloads
 * without loading anything on pages where docs are closed. Path '/' so it rides every admin request.
 */
export function setDocsOpenCookie( open ) {
	if ( 'undefined' === typeof document ) {
		return;
	}

	if ( open ) {
		document.cookie = DOCS_OPEN_COOKIE + '=1; path=/; max-age=2592000; SameSite=Lax';
	} else {
		document.cookie = DOCS_OPEN_COOKIE + '=; path=/; max-age=0; SameSite=Lax';
	}
}
