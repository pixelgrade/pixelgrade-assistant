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
export const DOCS_EVENT_OPEN_GUIDE = 'pixelgrade-docs:open-guide';
export const DOCS_EVENT_GUIDE_ACTION = 'pixelgrade-docs:guide-action';
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

function normalizeGuideAction( action ) {
	if ( ! action || 'object' !== typeof action ) {
		return null;
	}

	const id = 'string' === typeof action.id ? action.id.trim() : '';
	const label = 'string' === typeof action.label ? action.label.trim() : '';

	if ( ! id || ! label ) {
		return null;
	}

	return {
		id,
		label,
		...( true === action.isDestructive ? { isDestructive: true } : {} ),
	};
}

/**
 * Reduce the public guide API to plain, serializable descriptors. HTML is intentionally accepted
 * only as a string and remains a trusted-companion boundary; callers must never interpolate remote,
 * user-authored, or third-party markup without sanitizing it first.
 */
export function normalizeDocsGuidePayload( payload ) {
	if ( ! payload || 'object' !== typeof payload || Array.isArray( payload ) ) {
		return null;
	}

	const id = 'string' === typeof payload.id ? payload.id.trim() : '';
	const title = 'string' === typeof payload.title ? payload.title : '';
	const content = 'string' === typeof payload.content ? payload.content : '';

	if ( ! id || ! content.trim() ) {
		return null;
	}

	return {
		id,
		title,
		content,
		actions: Array.isArray( payload.actions )
			? payload.actions.map( normalizeGuideAction ).filter( Boolean )
			: [],
	};
}

/**
 * Fire-and-forget opener for a companion-authored guide in the floating window. Companions (Nova
 * Blocks, Style Manager, …) call window.pixelgradeAdminHub.docs.openGuide( { id, title, content,
 * actions } ) with a SERIALIZABLE payload: `content` is an HTML string rendered like an article body,
 * `actions` is an array of { id, label, isDestructive? } rendered as buttons that dispatch
 * DOCS_EVENT_GUIDE_ACTION back to the companion. Re-dispatching with the same `id` updates the guide
 * in place (live checklists). Guide requests are NOT persisted across page loads — the companion
 * re-opens when its context is back. Returns truthy only while a window is mounted, same delivery
 * attestation as openDocsArticle, so callers keep their own fallback UI otherwise.
 */
export function openDocsGuide( payload ) {
	if ( 'undefined' === typeof window || ! window.CustomEvent || listenerCount() < 1 ) {
		return false;
	}

	const guide = normalizeDocsGuidePayload( payload );

	if ( ! guide ) {
		return false;
	}

	window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_OPEN_GUIDE, { detail: guide } ) );

	return true;
}

/**
 * Dispatched by the window when a guide action button is clicked; the companion that opened the
 * guide listens for DOCS_EVENT_GUIDE_ACTION and matches on its own guideId.
 */
export function emitDocsGuideAction( guideId, actionId ) {
	if ( 'undefined' === typeof window || ! window.CustomEvent ) {
		return;
	}

	window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_GUIDE_ACTION, { detail: { guideId, actionId } } ) );
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
