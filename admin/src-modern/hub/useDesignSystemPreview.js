/**
 * Lifecycle for Style Manager's saved design-system preview payload.
 */
import { useEffect, useState } from '@wordpress/element';

import {
	ensurePreviewFontStylesheets,
	normalizePreviewDescriptor,
	requestDesignSystemPreview,
} from './stylesPreviewData';

const REFRESH_DEDUPE_MS = 2000;

export function createDesignSystemPreviewSession( descriptor, options = {} ) {
	const normalizedDescriptor = normalizePreviewDescriptor( descriptor );
	const request = options.request || requestDesignSystemPreview;
	const ensureFonts = options.ensureFonts || ensurePreviewFontStylesheets;
	const onPayload = options.onPayload || ( () => {} );
	const now = options.now || Date.now;
	const win = undefined !== options.win
		? options.win
		: ( 'undefined' !== typeof window ? window : null );
	const doc = undefined !== options.doc
		? options.doc
		: ( 'undefined' !== typeof document ? document : null );

	let running = false;
	let payload = null;
	let activePromise = null;
	let activeController = null;
	let lastRequestedAt = Number.NEGATIVE_INFINITY;

	function refresh( force = false ) {
		if ( ! running || ! normalizedDescriptor ) {
			return Promise.resolve( payload );
		}

		if ( activePromise ) {
			return activePromise;
		}

		const requestedAt = now();
		if ( ! force && REFRESH_DEDUPE_MS > requestedAt - lastRequestedAt ) {
			return Promise.resolve( payload );
		}

		lastRequestedAt = requestedAt;
		const AbortControllerClass = win?.AbortController || globalThis.AbortController;
		activeController = AbortControllerClass ? new AbortControllerClass() : null;

		let requestPromise;
		try {
			requestPromise = request( normalizedDescriptor, {
				signal: activeController ? activeController.signal : undefined,
			} );
		} catch ( error ) {
			requestPromise = Promise.reject( error );
		}

		const trackedPromise = Promise.resolve( requestPromise )
			.then( ( nextPayload ) => {
				if ( ! running || ! nextPayload ) {
					return payload;
				}

				payload = nextPayload;
				if ( payload.typography ) {
					ensureFonts( payload.typography.stylesheetUrls, doc );
				}
				onPayload( payload );

				return payload;
			} )
			.catch( () => payload )
			.finally( () => {
				if ( activePromise === trackedPromise ) {
					activePromise = null;
					activeController = null;
				}
			} );

		activePromise = trackedPromise;

		return trackedPromise;
	}

	function handlePageShow() {
		refresh();
	}

	function handleVisibilityChange() {
		if ( ! doc || 'visible' === doc.visibilityState ) {
			refresh();
		}
	}

	function start() {
		if ( running ) {
			return activePromise || Promise.resolve( payload );
		}

		running = true;
		if ( ! normalizedDescriptor ) {
			return Promise.resolve( payload );
		}

		win?.addEventListener( 'pageshow', handlePageShow );
		doc?.addEventListener( 'visibilitychange', handleVisibilityChange );

		return refresh( true );
	}

	function stop() {
		if ( ! running ) {
			return;
		}

		running = false;
		win?.removeEventListener( 'pageshow', handlePageShow );
		doc?.removeEventListener( 'visibilitychange', handleVisibilityChange );
		activeController?.abort();
	}

	return {
		getPayload: () => payload,
		refresh,
		start,
		stop,
	};
}

export function useDesignSystemPreview( descriptor ) {
	const [ payload, setPayload ] = useState( null );
	const schemaVersion = descriptor?.schemaVersion;
	const path = descriptor?.path;

	useEffect( () => {
		setPayload( null );
		const session = createDesignSystemPreviewSession(
			{ schemaVersion, path },
			{ onPayload: setPayload }
		);

		session.start();

		return () => session.stop();
	}, [ schemaVersion, path ] );

	return payload;
}
