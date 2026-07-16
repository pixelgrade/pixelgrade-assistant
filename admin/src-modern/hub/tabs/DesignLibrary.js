/**
 * The Design Library hub tab: one destination for the three content granularities.
 *
 * Merges the former Starter Sites (whole site), Site Parts / layouts (reusable part), and Page
 * Patterns (single page) tabs into sections routed via `?tab=design-library&section=…` — the same
 * URL pattern the Account tab uses. The section components render unchanged below the selector.
 *
 * The granularity selector is progressively disclosed, checklist-flavored:
 * - Until the user has visited ALL three sections (or skips the guide), it renders a question
 *   heading + three "scope cards". Each card carries a wireframe scope glyph in one shared visual
 *   language — a browser frame where the blue highlight marks exactly what gets applied — plus a
 *   one-line task description. Visited sections earn a ✓ bead, so the guide doubles as an
 *   exploration checklist.
 * - Afterwards it compacts to icon pills reusing the same glyphs/labels, with a one-line
 *   description of the active choice below and an ⓘ affordance that reopens the card guide.
 *
 * The visited-section set persists in localStorage alongside the other pixassist_* keys.
 */
import { createElement, Fragment, useEffect, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { StarterSites } from './StarterSites';
import { LayoutUnits } from './LayoutUnits';
import { ContentPatterns } from './ContentPatterns';

const GUIDE_STORAGE_KEY = 'pixassist_design_library_guide';
const HIGHLIGHT = '#3858e9';
const HIGHLIGHT_WASH = '#dfe6fb';
const FRAME_STROKE = '#dcdcde';

/**
 * The three sections, ordered broadest → smallest change (site → part → page).
 *
 * @return {Array} Section descriptors.
 */
function getSections() {
	return [
		{
			id: 'starter-sites',
			glyph: 'site',
			component: StarterSites,
			title: __( 'Starter Sites', 'pixelgrade_assistant' ),
			task: __( 'A whole site', 'pixelgrade_assistant' ),
			description: __( 'Apply a full baseline — content, pages, menus, and design — from a starter.', 'pixelgrade_assistant' ),
		},
		{
			id: 'layouts',
			glyph: 'part',
			component: LayoutUnits,
			title: __( 'Site Parts', 'pixelgrade_assistant' ),
			task: __( 'A header, footer, or template', 'pixelgrade_assistant' ),
			description: __( 'Swap one reusable part without touching the rest of the site.', 'pixelgrade_assistant' ),
		},
		{
			id: 'content',
			glyph: 'page',
			component: ContentPatterns,
			title: __( 'Page Patterns', 'pixelgrade_assistant' ),
			task: __( 'A single page', 'pixelgrade_assistant' ),
			description: __( 'Add one ready-made page or post from a starter.', 'pixelgrade_assistant' ),
		},
	];
}

/**
 * A wireframe "scope glyph": a browser frame where the blue highlight marks exactly what gets
 * applied — the whole content area (site), only the header band (part), or a folded-corner page
 * sheet layered in front of a faint wireframe of the existing site (page).
 *
 * @param {Object} props       Component props.
 * @param {string} props.kind  One of 'site' | 'part' | 'page'.
 * @param {number} props.width Rendered width in px (height follows the 52:40 viewBox).
 */
function ScopeGlyph( { kind, width } ) {
	const bar = ( x, y, w, h, fill, opacity ) =>
		createElement( 'rect', { key: [ x, y, w ].join( '-' ), x, y, width: w, height: h, rx: h / 2, fill, fillOpacity: opacity } );

	const children = [
		createElement( 'rect', {
			key: 'frame',
			x: 0.5,
			y: 0.5,
			width: 51,
			height: 39,
			rx: 3,
			fill: '#fff',
			stroke: FRAME_STROKE,
		} ),
	];

	if ( 'site' === kind ) {
		children.push(
			createElement( 'rect', { key: 'scope', x: 5, y: 5, width: 42, height: 30, rx: 2, fill: HIGHLIGHT_WASH, stroke: HIGHLIGHT } ),
			bar( 9, 9, 34, 5, HIGHLIGHT, 0.5 ),
			bar( 9, 18, 22, 3.5, HIGHLIGHT, 0.35 ),
			bar( 9, 25, 28, 3.5, HIGHLIGHT, 0.35 )
		);
	} else if ( 'part' === kind ) {
		children.push(
			createElement( 'rect', { key: 'scope', x: 5, y: 5, width: 42, height: 9, rx: 2, fill: HIGHLIGHT_WASH, stroke: HIGHLIGHT } ),
			bar( 8.5, 8, 12, 3, HIGHLIGHT, 0.55 ),
			bar( 30, 8, 14, 3, HIGHLIGHT, 0.4 ),
			bar( 5, 19, 42, 3.5, '#e4e4e8', 1 ),
			bar( 5, 26, 30, 3.5, '#ececef', 1 ),
			bar( 5, 32, 36, 2.5, '#ececef', 1 )
		);
	} else {
		children.push(
			bar( 5, 6, 18, 4, '#e4e4e8', 1 ),
			bar( 5, 14, 14, 3, '#ececef', 1 ),
			bar( 5, 21, 16, 3, '#ececef', 1 ),
			bar( 5, 28, 12, 3, '#ececef', 1 ),
			createElement( 'path', {
				key: 'sheet',
				d: 'M27 9 a2 2 0 0 1 2 -2 H39 L46 14 V32 a2 2 0 0 1 -2 2 H29 a2 2 0 0 1 -2 -2 Z',
				fill: HIGHLIGHT_WASH,
				stroke: HIGHLIGHT,
				strokeLinejoin: 'round',
			} ),
			createElement( 'path', {
				key: 'fold',
				d: 'M39 7 V12 a2 2 0 0 0 2 2 H46 Z',
				fill: '#b9c8f6',
				stroke: HIGHLIGHT,
				strokeLinejoin: 'round',
			} ),
			bar( 30.5, 18, 10, 3, HIGHLIGHT, 0.5 ),
			bar( 30.5, 23.5, 7.5, 2.5, HIGHLIGHT, 0.35 ),
			bar( 30.5, 28, 9, 2.5, HIGHLIGHT, 0.35 )
		);
	}

	return createElement(
		'svg',
		{
			viewBox: '0 0 52 40',
			width,
			height: Math.round( ( width * 40 ) / 52 ),
			'aria-hidden': 'true',
			focusable: 'false',
			style: { display: 'block', flex: 'none' },
		},
		children
	);
}

/**
 * Read the active section id from the URL, constrained to known section ids.
 *
 * @param {string[]} ids Known section ids.
 *
 * @return {string} A valid section id, or '' when absent/unknown.
 */
function readSectionFromUrl( ids ) {
	const params = new URLSearchParams( window.location.search );
	const raw = params.get( 'section' ) || '';

	if ( ids.indexOf( raw ) !== -1 ) {
		return raw;
	}

	// Legacy deep links (?tab=layouts, ?tab=content, …) render this component before the router's
	// replaceState canonicalizes the URL — honor the legacy tab id as the requested section.
	const tab = params.get( 'tab' ) || '';
	if ( ids.indexOf( tab ) !== -1 ) {
		return tab;
	}
	if ( 'recipes' === tab ) {
		return 'starter-sites';
	}

	return '';
}

/**
 * Read the persisted guide state ({ visited: string[], skipped: bool }).
 *
 * @param {string[]} ids Known section ids (unknown visited entries are dropped).
 *
 * @return {Object} Guide state.
 */
function readGuideState( ids ) {
	try {
		const raw = window.localStorage.getItem( GUIDE_STORAGE_KEY );
		const parsed = raw ? JSON.parse( raw ) : null;

		if ( parsed && 'object' === typeof parsed ) {
			return {
				visited: Array.isArray( parsed.visited )
					? parsed.visited.filter( ( id ) => ids.indexOf( id ) !== -1 )
					: [],
				skipped: !! parsed.skipped,
			};
		}
	} catch ( error ) {
		// Storage unavailable — fall through to the in-memory default.
	}

	return { visited: [], skipped: false };
}

/**
 * Persist the guide state; storage failures degrade to session-only behavior.
 *
 * @param {Object} state Guide state to persist.
 */
function saveGuideState( state ) {
	try {
		window.localStorage.setItem( GUIDE_STORAGE_KEY, JSON.stringify( state ) );
	} catch ( error ) {
		// Ignore: the guide simply reappears next visit.
	}
}

export function DesignLibrary() {
	const sections = getSections();
	const ids = sections.map( ( section ) => section.id );
	const idsKey = ids.join( ',' );

	const [ sectionId, setSectionId ] = useState( () => readSectionFromUrl( ids ) );
	const [ guide, setGuide ] = useState( () => readGuideState( ids ) );
	const [ guideReopened, setGuideReopened ] = useState( false );
	// A starter detail (composer) view is a focused, single-task page — while one is open the
	// section selector would only compete with it, so the Starter Sites section broadcasts its state.
	const [ detailViewOpen, setDetailViewOpen ] = useState( false );

	const activeId = sectionId || ids[ 0 ];
	const activeSection = sections.find( ( section ) => section.id === activeId ) || sections[ 0 ];
	const completed = guide.skipped || ids.every( ( id ) => guide.visited.indexOf( id ) !== -1 );
	const showGuide = ! completed || guideReopened;

	// Keep the section in sync with browser back/forward.
	useEffect( () => {
		const onPopState = () => setSectionId( readSectionFromUrl( ids ) );
		window.addEventListener( 'popstate', onPopState );

		return () => window.removeEventListener( 'popstate', onPopState );
	}, [ idsKey ] );

	useEffect( () => {
		const onDetailToggle = ( event ) => setDetailViewOpen( Boolean( event && event.detail && event.detail.open ) );
		window.addEventListener( 'pixelgrade:starter-composer-toggle', onDetailToggle );

		return () => window.removeEventListener( 'pixelgrade:starter-composer-toggle', onDetailToggle );
	}, [] );

	// The rendered section counts as visited — including the default landing section and direct
	// deep links — so the guide's checklist reflects what the user has actually seen.
	useEffect( () => {
		setGuide( ( current ) => {
			if ( current.visited.indexOf( activeId ) !== -1 ) {
				return current;
			}

			const next = { ...current, visited: [ ...current.visited, activeId ] };
			saveGuideState( next );

			return next;
		} );
	}, [ activeId ] );

	const selectSection = ( id ) => {
		setSectionId( id );
		setGuideReopened( false );

		const params = new URLSearchParams( window.location.search );
		params.set( 'tab', 'design-library' );
		params.set( 'section', id );
		window.history.pushState( {}, '', window.location.pathname + '?' + params.toString() );
	};

	const dismissGuide = () => {
		if ( ! completed ) {
			setGuide( ( current ) => {
				const next = { ...current, skipped: true };
				saveGuideState( next );

				return next;
			} );
		}
		setGuideReopened( false );
	};

	const renderBead = () =>
		createElement(
			'span',
			{
				'aria-hidden': 'true',
				style: {
					background: HIGHLIGHT,
					borderRadius: '50%',
					color: '#fff',
					fontSize: '11px',
					height: '18px',
					lineHeight: '18px',
					position: 'absolute',
					right: '8px',
					top: '8px',
					textAlign: 'center',
					width: '18px',
				},
			},
			'✓'
		);

	const renderGuide = () =>
		createElement(
			'div',
			{ className: 'pixelgrade-design-library__guide', style: { margin: '0 0 20px' } },
			createElement(
				'div',
				{ style: { margin: '2px 0 12px' } },
				createElement(
					'h2',
					{ style: { fontSize: '16px', fontWeight: 600, margin: '0 0 2px' } },
					__( 'What do you want to add to your site?', 'pixelgrade_assistant' )
				),
				createElement(
					'p',
					{ style: { color: '#50575e', fontSize: '13px', margin: 0 } },
					__( 'Pick a scale — you can mix and match anytime.', 'pixelgrade_assistant' )
				)
			),
			createElement(
				'div',
				{
					role: 'group',
					'aria-label': __( 'Design Library sections', 'pixelgrade_assistant' ),
					style: {
						display: 'grid',
						gap: '12px',
						gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
						margin: '0 0 8px',
					},
				},
				sections.map( ( section ) => {
					const isActive = section.id === activeId;
					const isVisited = guide.visited.indexOf( section.id ) !== -1;

					return createElement(
						'button',
						{
							key: section.id,
							type: 'button',
							'aria-pressed': isActive,
							onClick: () => selectSection( section.id ),
							style: {
								background: isActive ? '#fbfcff' : '#fff',
								border: '1px solid ' + ( isActive ? HIGHLIGHT : FRAME_STROKE ),
								borderRadius: '4px',
								boxShadow: isActive ? 'inset 0 0 0 1px ' + HIGHLIGHT : 'none',
								cursor: 'pointer',
								font: 'inherit',
								padding: '18px 16px 16px',
								position: 'relative',
								textAlign: 'center',
							},
						},
						( isVisited || isActive ) && renderBead(),
						createElement(
							'span',
							{ style: { display: 'flex', justifyContent: 'center' } },
							createElement( ScopeGlyph, { kind: section.glyph, width: 112 } )
						),
						createElement(
							'span',
							{ style: { color: '#1d2327', display: 'block', fontSize: '13px', fontWeight: 600, margin: '10px 0 0' } },
							section.title
						),
						createElement(
							'span',
							{ style: { color: '#50575e', display: 'block', fontSize: '12px', lineHeight: 1.45, margin: '6px 0 0' } },
							section.description
						)
					);
				} )
			),
			createElement(
				'button',
				{
					type: 'button',
					onClick: dismissGuide,
					style: {
						background: 'none',
						border: 0,
						color: '#8c8f94',
						cursor: 'pointer',
						font: 'inherit',
						fontSize: '12px',
						margin: '2px 0 0',
						padding: 0,
						textDecoration: 'underline',
						textUnderlineOffset: '2px',
					},
				},
				completed
					? __( 'Hide the guide', 'pixelgrade_assistant' )
					: __( 'Skip the guide — use compact tabs', 'pixelgrade_assistant' )
			)
		);

	const renderPills = () =>
		createElement(
			'div',
			{ className: 'pixelgrade-design-library__selector', style: { margin: '0 0 16px' } },
			createElement(
				'div',
				{
					role: 'tablist',
					'aria-label': __( 'Design Library sections', 'pixelgrade_assistant' ),
					style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 8px' },
				},
				sections.map( ( section ) => {
					const isActive = section.id === activeId;

					return createElement(
						'button',
						{
							key: section.id,
							type: 'button',
							role: 'tab',
							'aria-selected': isActive,
							onClick: () => selectSection( section.id ),
							style: {
								alignItems: 'center',
								background: isActive ? '#f4f7ff' : '#fff',
								border: '1px solid ' + ( isActive ? HIGHLIGHT : FRAME_STROKE ),
								borderRadius: '6px',
								boxShadow: isActive ? 'inset 0 0 0 1px ' + HIGHLIGHT : 'none',
								cursor: 'pointer',
								display: 'inline-flex',
								font: 'inherit',
								gap: '9px',
								padding: '7px 12px 7px 8px',
								textAlign: 'left',
							},
						},
						createElement( ScopeGlyph, { kind: section.glyph, width: 40 } ),
						createElement(
							'span',
							null,
							createElement(
								'span',
								{ style: { color: '#1d2327', display: 'block', fontSize: '12.5px', fontWeight: 600, lineHeight: 1.25 } },
								section.title
							),
							createElement(
								'span',
								{ style: { color: '#767b81', display: 'block', fontSize: '11px', lineHeight: 1.25 } },
								section.task
							)
						)
					);
				} ),
				createElement( Button, {
					icon: 'info-outline',
					label: __( 'About these sections', 'pixelgrade_assistant' ),
					onClick: () => setGuideReopened( true ),
					style: { color: '#50575e' },
				} )
			),
			createElement(
				'p',
				{ style: { color: '#50575e', fontSize: '12.5px', margin: 0 } },
				activeSection.description
			)
		);

	return createElement(
		Fragment,
		null,
		detailViewOpen ? null : showGuide ? renderGuide() : renderPills(),
		createElement( activeSection.component )
	);
}
