/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's Home (#44, #55, Home calm-down).
 *
 * Home is deliberately calm and holds exactly three things, top to bottom:
 *   1. The Get Started checklist (GetStartedCard) — the single onboarding spotlight. It carries
 *      the product orientation copy and self-hides once onboarding is complete or dismissed.
 *   2. One "At a glance" card — a one-line state-aware greeting, a few quiet label/value status
 *      rows (server-decided; see pixassist_get_overview_state_summary()), a live scaled preview
 *      of the user's own homepage as the visual anchor, and a quick-actions row into the sibling
 *      tabs. No badges, no recommendations: a row only speaks up (amber dot + one detail line)
 *      when something actually needs attention.
 *   3. A small Pixelgrade Plus invitation — only while Plus is not installed. Once Plus is
 *      active its state lives in a quiet status row instead.
 *
 * Presentational only: all data (theme, account, plus state, status rows, and the link list)
 * comes from the server-assembled `window.pixelgradeOverview` payload
 * (pixassist_get_overview_data(), localized on the hub page).
 *
 * No JSX, matching the rest of the hub bundle (keeps externals to wp-element/components/i18n).
 */
import { createElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, Button } from '@wordpress/components';
import { GetStartedCard } from './GetStartedCard';

const DEFAULT_OVERVIEW = {
	theme: {},
	links: [],
	plus: {},
	account: { is_connected: false },
	stateSummary: [],
	site: {},
	greeting: '',
};

// Interactive affordances inline styles cannot express: row hover/focus, the chevron that marks
// rows as links, and hiding the theme screenshot on small screens (782px is the WP admin breakpoint).
const GLANCE_CSS = `
a.pixelgrade-overview__glance-row { transition: background-color .12s ease; }
a.pixelgrade-overview__glance-row:hover,
a.pixelgrade-overview__glance-row:focus { background-color: #f6f7f7; }
a.pixelgrade-overview__glance-row:focus-visible { box-shadow: 0 0 0 1.5px #2271b1; outline: none; }
a.pixelgrade-overview__glance-row::after { color: #a7aaad; content: '\\203A'; font-size: 16px; line-height: 1; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }
a.pixelgrade-overview__glance-row:hover::after { color: #2271b1; }
.pixelgrade-overview__glance-shot { display: block; transition: opacity .12s ease; }
.pixelgrade-overview__glance-shot:hover { opacity: .85; }
@media (max-width: 782px) { .pixelgrade-overview__glance-shot { display: none; } }
`;

function getOverview() {
	if ( typeof window !== 'undefined' && window.pixelgradeOverview ) {
		return window.pixelgradeOverview;
	}

	return DEFAULT_OVERVIEW;
}

function isOnboardingVisible( data ) {
	return Boolean( data && data.onboarding && data.onboarding.show );
}

function findLink( links, ids ) {
	for ( let i = 0; i < ids.length; i++ ) {
		const match = links.find( ( link ) => link && link.id === ids[ i ] );
		if ( match ) {
			return match;
		}
	}

	return null;
}

function renderGlanceRow( item, index ) {
	if ( ! item || ! item.id ) {
		return null;
	}

	const hasUrl = item.url && 'string' === typeof item.url;
	const needsAttention = 'needs-attention' === item.tone;

	const valueChildren = [];

	if ( needsAttention ) {
		// The one quiet signal Home allows itself: a small amber dot when required setup is pending.
		valueChildren.push(
			createElement( 'span', {
				key: 'dot',
				'aria-hidden': true,
				style: {
					background: '#dba617',
					borderRadius: '50%',
					display: 'inline-block',
					flex: '0 0 auto',
					height: '8px',
					marginRight: '8px',
					width: '8px',
				},
			} )
		);
	}

	// The "Your style" row carries the user's own palette as small swatches before its value.
	if ( Array.isArray( item.swatches ) && item.swatches.length ) {
		valueChildren.push(
			createElement(
				'span',
				{
					key: 'swatches',
					'aria-hidden': true,
					style: {
						alignItems: 'center',
						alignSelf: 'center',
						display: 'inline-flex',
						flex: '0 0 auto',
						gap: '4px',
						marginRight: '8px',
					},
				},
				item.swatches.map( ( color, index ) =>
					createElement( 'span', {
						key: index,
						style: {
							background: color,
							border: '1px solid rgba(0, 0, 0, .14)',
							borderRadius: '3px',
							display: 'block',
							height: '14px',
							width: '14px',
						},
					} )
				)
			)
		);
	}

	valueChildren.push(
		createElement( 'span', { key: 'value', style: { color: '#1d2327' } }, item.value || '—' )
	);

	return createElement(
		hasUrl ? 'a' : 'div',
		{
			key: item.id,
			className: 'pixelgrade-overview__glance-row pixelgrade-overview__glance-row--' + item.id,
			href: hasUrl ? item.url : undefined,
			style: {
				alignItems: 'baseline',
				borderRadius: '2px',
				borderTop: 0 === index ? 'none' : '1px solid #f0f0f1',
				color: 'inherit',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '4px 16px',
				// Horizontal breathing room for the hover background + the link chevron (both from
				// GLANCE_CSS); the negative margins keep the text aligned with the card body.
				margin: '0 -12px',
				padding: '10px 28px 10px 12px',
				position: 'relative',
				textDecoration: 'none',
			},
		},
		createElement(
			'span',
			{ style: { color: '#50575e', flex: '0 0 130px', fontSize: '13px' } },
			item.label || item.id
		),
		createElement(
			'span',
			{ style: { alignItems: 'baseline', display: 'inline-flex', flex: '1 1 auto', minWidth: 0 } },
			valueChildren
		),
		item.detail
			? createElement(
					'span',
					{
						style: {
							color: '#50575e',
							flexBasis: '100%',
							fontSize: '13px',
							paddingLeft: '146px',
						},
						className: 'pixelgrade-overview__glance-detail',
					},
					item.detail
			  )
			: null
	);
}

/**
 * The quick actions into the sibling tabs. The canvas (Design System) action is the page's
 * primary only when the onboarding spotlight is hidden — one primary per screen.
 */
function renderQuickActions( links, onboardingVisible ) {
	const actions = [
		{ link: findLink( links, [ 'styles', 'site-editor', 'customize' ] ), canBePrimary: true },
		{ link: findLink( links, [ 'design-library', 'starter-sites' ] ), canBePrimary: false },
		{ link: findLink( links, [ 'help' ] ), canBePrimary: false },
	].filter( ( action ) => action.link );

	if ( ! actions.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'pixelgrade-overview__actions',
			style: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '16px 0 0' },
		},
		actions.map( ( action ) =>
			createElement(
				Button,
				{
					key: action.link.id,
					variant: action.canBePrimary && ! onboardingVisible ? 'primary' : 'secondary',
					href: action.link.url,
				},
				action.link.label || action.link.id
			)
		)
	);
}

// The live thumbnail renders the homepage at desktop width, scaled down into the frame.
const PREVIEW_FRAME_WIDTH = 240;
const PREVIEW_PAGE_WIDTH = 1200;
const PREVIEW_PAGE_HEIGHT = 900;

/**
 * A live, scaled preview of the user's OWN homepage — the card's visual anchor. This is the
 * actual site (admin-bar-free via `pixassist_site_preview=1`), not a stock theme screenshot, so
 * it stays personal and current. Clicking it opens the site in a new tab; it hides below the WP
 * admin breakpoint (GLANCE_CSS) and skips silently when no site URL is available.
 */
function renderSitePreview( site ) {
	if ( ! site || ! site.previewUrl ) {
		return null;
	}

	const scale = PREVIEW_FRAME_WIDTH / PREVIEW_PAGE_WIDTH;

	const frame = createElement(
		'span',
		{
			style: {
				background: '#fff',
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				display: 'block',
				height: Math.round( PREVIEW_PAGE_HEIGHT * scale ) + 'px',
				overflow: 'hidden',
				position: 'relative',
			},
		},
		createElement( 'iframe', {
			src: site.previewUrl,
			title: __( 'Preview of your site', 'pixelgrade_assistant' ),
			'aria-hidden': true,
			tabIndex: -1,
			loading: 'lazy',
			scrolling: 'no',
			style: {
				border: 0,
				height: PREVIEW_PAGE_HEIGHT + 'px',
				left: 0,
				pointerEvents: 'none',
				position: 'absolute',
				top: 0,
				transform: 'scale(' + scale + ')',
				transformOrigin: '0 0',
				width: PREVIEW_PAGE_WIDTH + 'px',
			},
		} )
	);

	return createElement(
		'a',
		{
			className: 'pixelgrade-overview__glance-shot',
			href: site.url || site.previewUrl,
			target: '_blank',
			rel: 'noreferrer noopener',
			// display lives in GLANCE_CSS so the small-screen media query can hide the preview.
			style: {
				color: '#50575e',
				flex: '0 0 ' + PREVIEW_FRAME_WIDTH + 'px',
				fontSize: '12px',
				textDecoration: 'none',
			},
		},
		frame,
		createElement(
			'span',
			{ style: { display: 'block', marginTop: '6px' } },
			( site.title ? site.title + ' — ' : '' ) + __( 'view your site', 'pixelgrade_assistant' )
		)
	);
}

function renderGlance( data ) {
	const summary = Array.isArray( data.stateSummary ) ? data.stateSummary : [];
	const links = Array.isArray( data.links ) ? data.links : [];

	if ( ! summary.length && ! links.length ) {
		return null;
	}

	const content = createElement(
		'div',
		{ style: { flex: '1 1 320px', minWidth: 0 } },
		createElement(
			'h2',
			{ style: { fontSize: '14px', margin: 0 } },
			__( 'At a glance', 'pixelgrade_assistant' )
		),
		data.greeting
			? createElement(
					'p',
					{ style: { color: '#50575e', margin: '2px 0 10px' } },
					data.greeting
			  )
			: null,
		createElement(
			'div',
			{ className: 'pixelgrade-overview__glance-rows' },
			summary.map( renderGlanceRow ).filter( Boolean )
		),
		renderQuickActions( links, isOnboardingVisible( data ) )
	);

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__glance', style: { margin: '0 0 24px' } },
		createElement(
			CardBody,
			null,
			createElement( 'style', null, GLANCE_CSS ),
			createElement(
				'div',
				{ style: { alignItems: 'flex-start', display: 'flex', flexWrap: 'wrap', gap: '24px' } },
				content,
				renderSitePreview( data.site || {} )
			)
		)
	);
}

/**
 * The one gentle Pixelgrade Plus presence on Home while Plus is not installed. Once Plus is
 * active (licensed or not) this card disappears — its state lives in the At a glance row.
 */
function renderPlusInvite( plus ) {
	if ( ! plus || ! plus.label || plus.isActive ) {
		return null;
	}

	const ctaProps = { variant: 'secondary', href: plus.url };

	// The discover state links out to the shop; anything else stays in wp-admin.
	if ( 'discover' === plus.state ) {
		ctaProps.target = '_blank';
		ctaProps.rel = 'noreferrer noopener';
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__plus pixelgrade-overview__plus--' + ( plus.state || 'discover' ) },
		createElement(
			CardBody,
			null,
			createElement(
				'h2',
				{ style: { fontSize: '14px', margin: '0 0 4px' } },
				plus.productLabel || 'Pixelgrade Plus'
			),
			plus.description
				? createElement(
						'p',
						{ style: { color: '#50575e', margin: '0 0 12px', maxWidth: '46em' } },
						plus.description
				  )
				: null,
			createElement( Button, ctaProps, plus.label )
		)
	);
}

/**
 * The persistent one-line re-entry row after a "Set up later" dismissal: setup progress + Resume.
 * Server-decided (`onboarding.finishSetup.show`) so dismissing the guide never strands the user.
 */
function renderFinishSetupRow( onboarding ) {
	const finishSetup = onboarding && onboarding.finishSetup ? onboarding.finishSetup : null;

	if ( ! finishSetup || ! finishSetup.show ) {
		return null;
	}

	const resume = () => {
		const endpoint = onboarding.resumeEndpoint || {};
		const rest =
			typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest
				? window.pixassist.wpRest
				: {};

		if ( ! endpoint.url || typeof window === 'undefined' || typeof window.fetch !== 'function' ) {
			if ( typeof window !== 'undefined' && window.location ) {
				window.location.reload();
			}
			return;
		}

		window
			.fetch( endpoint.url, {
				method: endpoint.method || 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					...( rest.nonce ? { 'X-WP-Nonce': rest.nonce } : {} ),
				},
				body: JSON.stringify( { pixassist_nonce: rest.pixassist_nonce || '' } ),
			} )
			.catch( () => {} )
			.finally( () => window.location.reload() );
	};

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__finish-setup', style: { margin: '0 0 24px' } },
		createElement(
			CardBody,
			null,
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px 16px' } },
				createElement(
					'div',
					{ style: { flex: '1 1 320px', minWidth: 0 } },
					createElement( 'strong', { style: { fontSize: '13px' } }, finishSetup.label ),
					finishSetup.description
						? createElement(
								'span',
								{ style: { color: '#50575e', marginLeft: '8px' } },
								finishSetup.description
						  )
						: null
				),
				createElement(
					Button,
					{ variant: 'primary', onClick: resume, style: { flex: '0 0 auto' } },
					finishSetup.resumeLabel || __( 'Resume', 'pixelgrade_assistant' )
				)
			)
		)
	);
}

export function Overview() {
	const data = getOverview();
	const plus = data.plus || {};
	const onboarding = data.onboarding || {};

	// First-run funnel: while setup is unfinished and the guide is showing, the Get started card IS
	// the page — the dashboard (At a glance / quick actions / Plus invite) waits until it has real
	// value to show. Server-decided (`onboarding.takeover`); PHP owns the state model.
	if ( onboarding.takeover ) {
		return createElement( GetStartedCard, null );
	}

	return createElement(
		Fragment,
		null,
		// The onboarding checklist is the single Home spotlight. It self-hides when the server says
		// onboarding is complete / dismissed / disabled (window.pixelgradeOverview.onboarding.show).
		createElement( GetStartedCard, null ),
		renderFinishSetupRow( onboarding ),
		renderGlance( data ),
		renderPlusInvite( plus )
	);
}
