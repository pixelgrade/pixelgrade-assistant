/**
 * Shared visual preview for layout units (headers, footers, templates).
 *
 * Loads the PHP front-end preview route (see
 * PixelgradeAssistant_StarterContent::maybe_render_layout_unit_preview) in a NON-interactive,
 * lazily-mounted <iframe>, scaled to the container with BlockPreview-style
 * `transform: scale(containerWidth / viewportWidth)`. The route renders the unit's blocks
 * through the active theme + Style Manager + fonts, so the preview matches the real front end.
 *
 * Deliberately NO @wordpress/block-editor dependency — this is a plain iframe scaler.
 *
 * Used by the Layouts tab (LayoutUnits.js) and the Starter Sites composer (StarterSites.js).
 */

import { createElement, useEffect, useRef, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getPreviewMode, savePreviewMode } from './preferences';

const DEFAULT_VW = 1200;
// A My-site render is heavy on the FIRST hit (live Style Manager CSS generation + theme render); the
// result is then server-cached, so only the cold render is slow. Give that cold render generous
// headroom — paired with the concurrency gate below — so a slow first paint resolves instead of
// wrongly falling back to "No preview". Subsequent loads hit the cache and are near-instant.
const LOAD_TIMEOUT_MS = 16000;
// Hard ceiling on the reported frame height. The in-iframe runtime already tames full-viewport
// heroes, but a pathological page could still report a runaway height (a `vh`/`%` block feeding back
// off the iframe's own height, up to the browser's ~16.7M-px limit). Clamp so the iframe element can
// never balloon — far above any real template, so legit long pages are unaffected.
const MAX_FRAME_HEIGHT = 16000;

/*
 * Module-level load gate (concurrency cap).
 *
 * The Layouts tab can show ~28 preview cards at once. Each card's <iframe> renders a HEAVY
 * server-side route (~180-250KB). Letting them all load simultaneously stampedes the server and the
 * browser, so several previews miss the LOAD_TIMEOUT_MS height handshake and wrongly fall back to
 * "No preview".
 *
 * This semaphore lets at most MAX_CONCURRENT_PREVIEWS iframes LOAD at once; the rest wait in a FIFO
 * queue and start as slots free up. A slot is held only for the duration of the load — it is freed
 * the moment the preview resolves (ready / error / final timeout / src change / unmount), so a
 * loaded card never keeps a slot from a queued one.
 */
const MAX_CONCURRENT_PREVIEWS = 4;
let activePreviewSlots = 0;
const previewSlotQueue = []; // FIFO of pending grant callbacks.

function pumpPreviewSlots() {
	while ( activePreviewSlots < MAX_CONCURRENT_PREVIEWS && previewSlotQueue.length > 0 ) {
		const grant = previewSlotQueue.shift();
		activePreviewSlots += 1;
		grant();
	}
}

/**
 * Request a preview load slot.
 *
 * @param {Function} onGrant Invoked (asynchronously, in FIFO order) once a slot is free.
 * @return {Function} An idempotent release that frees the held slot (or drops the still-queued
 *                    request) exactly once, then pumps the next waiter.
 */
function acquirePreviewSlot( onGrant ) {
	let state = 'queued'; // queued | granted | released
	const grant = () => {
		if ( 'queued' !== state ) {
			return;
		}
		state = 'granted';
		onGrant();
	};
	previewSlotQueue.push( grant );
	pumpPreviewSlots();
	return function releasePreviewSlot() {
		if ( 'released' === state ) {
			return;
		}
		if ( 'granted' === state ) {
			state = 'released';
			activePreviewSlots -= 1;
			pumpPreviewSlots();
			return;
		}
		// Still queued — drop it so it is never granted.
		state = 'released';
		const idx = previewSlotQueue.indexOf( grant );
		if ( -1 !== idx ) {
			previewSlotQueue.splice( idx, 1 );
		}
	};
}

/*
 * Shared preview-source mode.
 *
 * 'site' = render the unit against the active site — the user's theme + Style Manager tokens.
 * 'demo' = proxy the starter's polished public demo page (the demo's own design + content).
 *
 * Module-level so a single <PreviewModeToggle> drives every mounted <LayoutPreview> across tabs.
 */
let currentPreviewMode = getPreviewMode();
const previewModeListeners = new Set();

export function setPreviewMode( mode ) {
	if ( 'demo' !== mode && 'site' !== mode ) {
		return;
	}
	currentPreviewMode = savePreviewMode( mode );
	previewModeListeners.forEach( ( fn ) => fn( mode ) );
}

export function usePreviewMode() {
	const [ mode, setMode ] = useState( currentPreviewMode );
	useEffect( () => {
		const listener = ( next ) => setMode( next );
		previewModeListeners.add( listener );
		return () => previewModeListeners.delete( listener );
	}, [] );
	return mode;
}

/**
 * Segmented "My site / Demo site" preview-source toggle.
 *
 * Styled to match the grid/list view toggle in the Layouts toolbar — a bordered segmented control
 * using `isPressed` (subtle), not the heavier primary/secondary fill.
 */
export function PreviewModeToggle() {
	const mode = usePreviewMode();
	return createElement(
		'div',
		{ style: { alignItems: 'center', display: 'inline-flex', gap: '8px' } },
		createElement( 'span', { style: { color: '#646970', fontSize: '13px' } }, __( 'Preview:', 'pixelgrade_assistant' ) ),
		createElement(
			'div',
			{ style: { display: 'inline-flex', border: '1px solid #dcdcde', borderRadius: '4px' } },
			createElement(
				Button,
				{
					isPressed: 'site' === mode,
					onClick: () => setPreviewMode( 'site' ),
					title: __( 'Preview on your site — your colors, fonts, and current content.', 'pixelgrade_assistant' ),
				},
				__( 'My site', 'pixelgrade_assistant' )
			),
			createElement(
				Button,
				{
					isPressed: 'demo' === mode,
					onClick: () => setPreviewMode( 'demo' ),
					title: __( 'Show the polished demo — its real images, menus, and design.', 'pixelgrade_assistant' ),
				},
				__( 'Demo site', 'pixelgrade_assistant' )
			)
		)
	);
}

/**
 * Neutral fallback shown when a unit has no preview (no source, 404, or renders empty).
 *
 * @return {Object} A React element.
 */
function renderDefaultFallback() {
	return createElement(
		'div',
		{
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				aspectRatio: '16 / 10',
				background: '#f6f7f7',
				border: '1px solid #f0f0f1',
				borderRadius: '3px',
				color: '#a7aaad',
				fontSize: '12px',
			},
		},
		__( 'No preview', 'pixelgrade_assistant' )
	);
}

let keyframesInjected = false;

function ensureKeyframes() {
	if ( keyframesInjected || typeof document === 'undefined' ) {
		return;
	}
	keyframesInjected = true;
	const style = document.createElement( 'style' );
	style.textContent =
		'@keyframes pixassist-preview-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}' +
		'@media (prefers-reduced-motion: reduce){.pixassist-layout-preview__skeleton{animation:none!important}}';
	document.head.appendChild( style );
}

/**
 * Resolve the localized preview config (base URL + nonce + viewport width).
 *
 * @return {Object|null} { base, param, nonce, vw } or null when unavailable.
 */
export function getLayoutPreviewConfig() {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const lu = window.pixelgradeLayoutUnits;
	if ( lu && lu.preview && lu.preview.base ) {
		return lu.preview;
	}
	const ss = window.pixelgradeStarterSites;
	if ( ss && ss.preview && ss.preview.base ) {
		return ss.preview;
	}
	return null;
}

/**
 * Build the front-end preview route URL for one unit.
 *
 * @param {Object} args               Descriptor.
 * @param {string} args.baseRestUrl   Source SCE REST base.
 * @param {string} [args.demoKey]     Starter/demo key.
 * @param {string} args.unitType      wp_template_part | wp_template | feature.
 * @param {string} args.unit          Unit slug (or id).
 * @param {Object} [args.config]      Override for the localized config.
 *
 * @return {string} The preview URL, or '' when it cannot be built.
 */
export function getLayoutPreviewUrl( { baseRestUrl, demoKey, unitType, unit, config, mode } ) {
	const cfg = config || getLayoutPreviewConfig();
	if ( ! cfg || ! cfg.base || ! baseRestUrl || ! unitType || ! unit ) {
		return '';
	}

	let url;
	try {
		url = new URL( cfg.base, typeof window !== 'undefined' ? window.location.origin : undefined );
	} catch ( e ) {
		return '';
	}

	url.searchParams.set( cfg.param || 'pixassist_layout_preview', '1' );
	url.searchParams.set( 'url', baseRestUrl );
	if ( demoKey ) {
		url.searchParams.set( 'demo_key', demoKey );
	}
	url.searchParams.set( 'unit_type', unitType );
	url.searchParams.set( 'unit', unit );
	if ( 'demo' === mode ) {
		url.searchParams.set( 'mode', 'demo' );
	}
	if ( cfg.nonce ) {
		url.searchParams.set( '_pixprev', cfg.nonce );
	}

	return url.toString();
}

/**
 * A scaled, non-interactive preview of one layout unit.
 *
 * @param {Object}        props
 * @param {string}        props.baseRestUrl   Source SCE REST base.
 * @param {string}        [props.demoKey]     Starter/demo key.
 * @param {string}        props.unitType      Unit type.
 * @param {string}        props.unit          Unit slug.
 * @param {number}        [props.viewportWidth] Desktop width to render at (default 1200).
 * @param {string}        [props.aspectRatio] CSS aspect-ratio while measuring (default '16 / 10').
 * @param {number}        [props.maxHeight]   Cap the rendered preview height (px); content clips.
 * @param {string}        [props.title]       Accessible title.
 * @param {*}             [props.fallback]    Rendered when there is no src or on error.
 * @param {Object}        [props.config]      Override for the localized config.
 */
export function LayoutPreview( props ) {
	const {
		baseRestUrl,
		demoKey,
		unitType,
		unit,
		viewportWidth,
		aspectRatio = '16 / 10',
		maxHeight = 0,
		title = '',
		fallback = null,
		config,
	} = props;

	ensureKeyframes();

	const mode = usePreviewMode();
	const cfg = config || getLayoutPreviewConfig();
	const vw = viewportWidth || ( cfg && cfg.vw ) || DEFAULT_VW;
	const baseSrc = getLayoutPreviewUrl( { baseRestUrl, demoKey, unitType, unit, config: cfg, mode } );

	const hostRef = useRef( null );
	const frameRef = useRef( null );
	const [ inView, setInView ] = useState( false );
	const [ scale, setScale ] = useState( 0.2 );
	const [ frameHeight, setFrameHeight ] = useState( 0 );
	const [ status, setStatus ] = useState( 'idle' ); // idle | loading | ready | error
	const [ reloadTick, setReloadTick ] = useState( 0 );
	const [ granted, setGranted ] = useState( false ); // a load slot has been granted for the current source
	const releaseSlotRef = useRef( null ); // idempotent release for the currently-held slot (null when none)

	// `_r` is ignored by the route but forces an iframe reload — used to retry demo-mode cold-cache 502s.
	const src = baseSrc && reloadTick ? baseSrc + '&_r=' + reloadTick : baseSrc;

	// Reset when the underlying source changes (e.g. the My-site/Demo toggle flips the URL).
	useEffect( () => {
		setFrameHeight( 0 );
		setStatus( 'idle' );
		setReloadTick( 0 );
	}, [ baseSrc ] );

	// Lazy mount: only load the iframe once the card scrolls near the viewport.
	useEffect( () => {
		const el = hostRef.current;
		if ( ! el || typeof IntersectionObserver === 'undefined' ) {
			setInView( true );
			return undefined;
		}
		const io = new IntersectionObserver(
			( entries ) => {
				if ( entries.some( ( entry ) => entry.isIntersecting ) ) {
					setInView( true );
					io.disconnect();
				}
			},
			{ rootMargin: '300px' }
		);
		io.observe( el );
		return () => io.disconnect();
	}, [] );

	// Concurrency gate: once in view, queue for a load slot. The iframe stays a skeleton until a slot
	// is GRANTED, so at most MAX_CONCURRENT_PREVIEWS heavy iframes load at once. Keyed on baseSrc (NOT
	// src) so a demo-retry reload (reloadTick → &_r=) reuses the SAME slot; only a real source change
	// (My-site/Demo toggle) or unmount releases it and queues for a fresh one.
	useEffect( () => {
		if ( ! inView || ! baseSrc ) {
			return undefined;
		}
		setGranted( false );
		const release = acquirePreviewSlot( () => setGranted( true ) );
		releaseSlotRef.current = release;
		return () => {
			release(); // idempotent: src change or unmount
			releaseSlotRef.current = null;
			setGranted( false );
		};
	}, [ inView, baseSrc ] );

	// Free the slot the moment the preview resolves (valid height → 'ready', or final failure →
	// 'error'), so a loaded/failed card never starves the queued ones. A demo-retry timeout keeps
	// status at 'loading' (same slot reused), so it does not release here.
	useEffect( () => {
		if ( ( 'ready' === status || 'error' === status ) && releaseSlotRef.current ) {
			releaseSlotRef.current();
		}
	}, [ status ] );

	// Track the container width → scale factor.
	useEffect( () => {
		const el = hostRef.current;
		if ( ! el || typeof ResizeObserver === 'undefined' ) {
			return undefined;
		}
		const ro = new ResizeObserver( () => {
			const width = el.clientWidth || 1;
			setScale( width / vw );
		} );
		ro.observe( el );
		return () => ro.disconnect();
	}, [ vw ] );

	// Receive the rendered height from the iframe document (same-origin postMessage).
	// Runs only once a load slot is GRANTED, so the LOAD_TIMEOUT_MS clock starts when the iframe
	// actually begins loading — time spent waiting in the queue never counts against the timeout.
	useEffect( () => {
		if ( ! granted || ! src ) {
			return undefined;
		}
		setStatus( ( current ) => ( 'idle' === current ? 'loading' : current ) );

		const onMessage = ( event ) => {
			const frame = frameRef.current;
			if ( ! frame || event.source !== frame.contentWindow ) {
				return;
			}
			const payload = event.data;
			if ( ! payload || ! payload.pixassistPreview ) {
				return;
			}
			if ( payload.empty ) {
				setStatus( 'error' ); // nothing renders standalone — show the fallback
				return;
			}
			if ( 'number' === typeof payload.height && payload.height >= 20 ) {
				setFrameHeight( Math.min( payload.height, MAX_FRAME_HEIGHT ) );
				setStatus( 'ready' );
			}
		};
		window.addEventListener( 'message', onMessage );

		const timer = window.setTimeout( () => {
			setStatus( ( current ) => {
				if ( 'ready' === current ) {
					return current;
				}
				// A cold render can miss the first handshake under load — the demo proxy's shared
				// page, or a heavy site-mode template (e.g. opened in the full-height overlay while
				// the grid is still loading). Retry up to twice before giving up. The `empty` signal
				// is separate (it errors immediately), so genuinely-empty units still fast-fall back.
				if ( reloadTick < 2 ) {
					setReloadTick( ( tick ) => tick + 1 );
					return 'loading';
				}
				return 'error';
			} );
		}, LOAD_TIMEOUT_MS );

		return () => {
			window.removeEventListener( 'message', onMessage );
			window.clearTimeout( timer );
		};
	}, [ granted, src ] );

	if ( ! src ) {
		return fallback || renderDefaultFallback();
	}

	if ( 'error' === status ) {
		return fallback || renderDefaultFallback();
	}

	const scaledHeight = frameHeight ? Math.round( frameHeight * scale ) : 0;
	const hostStyle = {
		position: 'relative',
		width: '100%',
		overflow: 'hidden',
		background: '#f0f0f1',
		borderRadius: '3px',
	};
	if ( scaledHeight ) {
		hostStyle.height = ( maxHeight ? Math.min( scaledHeight, maxHeight ) : scaledHeight ) + 'px';
	} else {
		hostStyle.aspectRatio = aspectRatio;
		if ( maxHeight ) {
			hostStyle.maxHeight = maxHeight + 'px';
		}
	}

	return createElement(
		'div',
		{ ref: hostRef, className: 'pixassist-layout-preview', style: hostStyle },
		granted
			? createElement( 'iframe', {
					ref: frameRef,
					src,
					title: title || 'Layout preview',
					scrolling: 'no',
					tabIndex: -1,
					'aria-hidden': 'true',
					loading: 'lazy',
					onError: () => setStatus( 'error' ),
					style: {
						position: 'absolute',
						top: 0,
						left: 0,
						width: vw + 'px',
						height: ( frameHeight || Math.round( vw * 0.62 ) ) + 'px',
						border: 0,
						background: '#ffffff',
						pointerEvents: 'none',
						transform: 'scale(' + scale + ')',
						transformOrigin: 'top left',
					},
			  } )
			: null,
		'ready' !== status
			? createElement( 'div', {
					className: 'pixassist-layout-preview__skeleton',
					style: {
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						background: 'linear-gradient(90deg,#f0f0f1 25%,#e7e7ea 37%,#f0f0f1 63%)',
						backgroundSize: '400% 100%',
						animation: 'pixassist-preview-shimmer 1.4s ease infinite',
					},
			  } )
			: null
	);
}

export default LayoutPreview;
