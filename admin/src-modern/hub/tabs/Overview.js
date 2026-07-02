/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's Home (#44, #55, Home calm-down).
 *
 * Home is deliberately calm and holds exactly three things, top to bottom:
 *   1. The Get Started checklist (GetStartedCard) — the single onboarding spotlight. It carries
 *      the product orientation copy and self-hides once onboarding is complete or dismissed.
 *   2. One "At a glance" card — a few quiet label/value status rows (server-decided; see
 *      pixassist_get_overview_state_summary()) plus a quick-actions row into the sibling tabs.
 *      No badges, no recommendations: a row only speaks up (amber dot + one detail line) when
 *      something actually needs attention.
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
};

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
				borderTop: 0 === index ? 'none' : '1px solid #f0f0f1',
				color: 'inherit',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '4px 16px',
				padding: '10px 0',
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

function renderGlance( data ) {
	const summary = Array.isArray( data.stateSummary ) ? data.stateSummary : [];
	const links = Array.isArray( data.links ) ? data.links : [];

	if ( ! summary.length && ! links.length ) {
		return null;
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__glance', style: { margin: '0 0 24px' } },
		createElement(
			CardBody,
			null,
			createElement(
				'h2',
				{ style: { fontSize: '14px', margin: '0 0 8px' } },
				__( 'At a glance', 'pixelgrade_assistant' )
			),
			createElement(
				'div',
				{ className: 'pixelgrade-overview__glance-rows' },
				summary.map( renderGlanceRow ).filter( Boolean )
			),
			renderQuickActions( links, isOnboardingVisible( data ) )
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

export function Overview() {
	const data = getOverview();
	const plus = data.plus || {};

	return createElement(
		Fragment,
		null,
		// The onboarding checklist is the single Home spotlight. It self-hides when the server says
		// onboarding is complete / dismissed / disabled (window.pixelgradeOverview.onboarding.show).
		createElement( GetStartedCard, null ),
		renderGlance( data ),
		renderPlusInvite( plus )
	);
}
