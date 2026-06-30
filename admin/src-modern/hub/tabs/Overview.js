/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's command center (#44, #55).
 *
 * This is the state-aware Home surface: it shows what is true about the site now, recommends one
 * next action, explains safe/reversible changes, then keeps the existing orientation routes, theme
 * card, and Pixelgrade Plus discovery/manage card.
 *
 * Presentational only: all *data* (theme, account, plus state, and the link list — labels, URLs, and
 * which links exist) comes from the server-assembled `window.pixelgradeOverview` payload
 * (pixassist_get_overview_data(), localized on the hub page). The orientation copy (lead + value-area
 * titles/descriptions) is product chrome, so it lives here as static `__()` strings. The three value
 * areas bind to the server links by id, so availability stays server-decided (canvas link first).
 *
 * No JSX, matching the rest of the hub bundle (keeps externals to wp-element/components/i18n/hooks).
 */
import { createElement, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button, Flex, FlexItem } from '@wordpress/components';
import { renderAvatar } from '../avatar';
import { GetStartedCard } from './GetStartedCard';

const DEFAULT_OVERVIEW = {
	theme: {},
	links: [],
	plus: {},
	account: { is_connected: false },
	stateSummary: [],
	nextAction: null,
	safety: {},
};

// The three value areas, in order. Each binds to the first server link whose id matches `ids`; if no
// such link exists (server-decided availability), the area is skipped. Titles + descriptions are
// orientation copy owned here; the CTA label + URL come from the bound server link. "motion" here
// describes the scope of the design system, not a free guarantee — the Plus card carries the upsell.
const VALUE_AREAS = [
	{
		ids: [ 'styles', 'site-editor', 'customize' ],
		title: __( 'A design system you control', 'pixelgrade_assistant' ),
		description: __(
			'Colors, fonts, spacing, and motion live in Style Manager — change them once and your theme and blocks update together.',
			'pixelgrade_assistant'
		),
	},
	{
		ids: [ 'starter-sites' ],
		title: __( 'A head start', 'pixelgrade_assistant' ),
		description: __(
			'Launch from a starter site and build pages from ready-made patterns instead of a blank canvas.',
			'pixelgrade_assistant'
		),
	},
	{
		ids: [ 'help' ],
		title: __( 'Help when you need it', 'pixelgrade_assistant' ),
		description: __( 'Documentation and guidance, built right into your dashboard.', 'pixelgrade_assistant' ),
	},
];

function getOverview() {
	if ( typeof window !== 'undefined' && window.pixelgradeOverview ) {
		return window.pixelgradeOverview;
	}

	return DEFAULT_OVERVIEW;
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

function renderOrientation() {
	return createElement(
		'div',
		{ className: 'pixelgrade-overview__intro', style: { margin: '8px 0 20px' } },
		createElement(
			'h2',
			{ style: { margin: '0 0 8px', fontSize: '1.5em' } },
			__( 'Pixelgrade turns your site into a complete design system.', 'pixelgrade_assistant' )
		),
		createElement(
			'p',
			{ style: { margin: 0, fontSize: '1.05em', color: '#50575e', maxWidth: '46em' } },
			__( 'Set your colors, fonts, spacing, and motion once — and your whole site follows.', 'pixelgrade_assistant' )
		)
	);
}

function getToneStyle( tone ) {
	const style = {
		background: '#f6f7f7',
		border: '1px solid #dcdcde',
		color: '#50575e',
	};

	if ( 'ok' === tone ) {
		style.background = '#edfaef';
		style.border = '1px solid #b8e6c2';
		style.color = '#0a7a28';
	}

	if ( 'needs-attention' === tone ) {
		style.background = '#fcf9e8';
		style.border = '1px solid #f0d98a';
		style.color = '#7a5600';
	}

	return style;
}

function getToneLabel( tone ) {
	if ( 'ok' === tone ) {
		return __( 'Ready', 'pixelgrade_assistant' );
	}

	if ( 'needs-attention' === tone ) {
		return __( 'Needs attention', 'pixelgrade_assistant' );
	}

	return __( 'Info', 'pixelgrade_assistant' );
}

function renderSummaryItem( item ) {
	if ( ! item || ! item.id ) {
		return null;
	}

	const toneStyle = getToneStyle( item.tone );
	const hasUrl = item.url && 'string' === typeof item.url;

	return createElement(
		hasUrl ? 'a' : 'div',
		{
			key: item.id,
			className: 'pixelgrade-overview__state-item pixelgrade-overview__state-item--' + item.id,
			href: hasUrl ? item.url : undefined,
			style: {
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				color: 'inherit',
				cursor: hasUrl ? 'pointer' : 'default',
				display: 'block',
				minWidth: 0,
				padding: '12px',
				textDecoration: 'none',
			},
		},
		createElement(
			'div',
			{
				style: {
					alignItems: 'center',
					display: 'flex',
					gap: '8px',
					justifyContent: 'space-between',
					marginBottom: '6px',
				},
			},
			createElement(
				'span',
				{ style: { color: '#50575e', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' } },
				item.label || item.id
			),
			createElement(
				'span',
				{
					style: {
						...toneStyle,
						borderRadius: '999px',
						display: 'inline-flex',
						fontSize: '11px',
						fontWeight: 600,
						lineHeight: 1,
						padding: '4px 7px',
						whiteSpace: 'nowrap',
					},
				},
				getToneLabel( item.tone )
			)
		),
		createElement( 'div', { style: { color: '#1d2327', fontWeight: 600, overflowWrap: 'anywhere' } }, item.value || '-' ),
		item.detail
			? createElement( 'p', { style: { color: '#50575e', margin: '4px 0 0' } }, item.detail )
			: null
	);
}

function renderNextAction( nextAction ) {
	if ( ! nextAction || ! nextAction.label ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'pixelgrade-overview__next-action',
			style: {
				background: '#f6f7f7',
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				padding: '16px',
			},
		},
		createElement(
			'span',
			{ style: { color: '#50575e', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' } },
			__( 'Best next action', 'pixelgrade_assistant' )
		),
		createElement( 'h3', { style: { margin: '0 0 6px' } }, nextAction.title || nextAction.label ),
		nextAction.description
			? createElement( 'p', { style: { color: '#50575e', margin: '0 0 14px', maxWidth: '48em' } }, nextAction.description )
			: null,
		createElement(
			Button,
			{ variant: 'primary', href: nextAction.url || undefined },
			nextAction.label
		),
		nextAction.safety
			? createElement(
					'p',
					{ style: { color: '#50575e', fontSize: '13px', margin: '12px 0 0' } },
					nextAction.safety
			  )
			: null
	);
}

function renderSafety( safety ) {
	if ( ! safety || ! Array.isArray( safety.items ) || ! safety.items.length ) {
		return null;
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-overview__safety', style: { marginTop: '14px' } },
		createElement(
			'strong',
			{ style: { display: 'block', marginBottom: '6px' } },
			safety.title || __( 'Safety notes', 'pixelgrade_assistant' )
		),
		createElement(
			'ul',
			{ style: { color: '#50575e', listStyle: 'disc', margin: '0 0 0 18px', padding: 0 } },
			safety.items.map( ( item, index ) => createElement( 'li', { key: index, style: { margin: '0 0 4px' } }, item ) )
		)
	);
}

function renderCommandCenter( data ) {
	const summary = Array.isArray( data.stateSummary ) ? data.stateSummary : [];
	const nextAction = data.nextAction || null;
	const safety = data.safety || {};

	if ( ! summary.length && ! nextAction ) {
		return null;
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__command-center', style: { margin: '0 0 24px' } },
		createElement(
			CardHeader,
			null,
			createElement(
				'div',
				null,
				createElement( 'h2', { style: { margin: 0 } }, __( 'Site command center', 'pixelgrade_assistant' ) ),
				createElement(
					'p',
					{ style: { color: '#757575', fontSize: '13px', margin: '2px 0 0' } },
					__( 'Where your site stands — and the best next step.', 'pixelgrade_assistant' )
				)
			)
		),
		createElement(
			CardBody,
			null,
			createElement(
				'div',
				{
					className: 'pixelgrade-overview__state-grid',
					style: {
						display: 'grid',
						gap: '10px',
						gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
						marginBottom: nextAction ? '16px' : 0,
					},
				},
				summary.map( renderSummaryItem ).filter( Boolean )
			),
			renderNextAction( nextAction ),
			renderSafety( safety )
		)
	);
}

function renderValueAreas( links ) {
	const cards = VALUE_AREAS.map( ( area ) => {
		const link = findLink( links, area.ids );
		if ( ! link ) {
			return null;
		}

		return createElement(
			Card,
			{
				key: link.id,
				className: 'pixelgrade-overview__value pixelgrade-overview__value--' + link.id,
			},
			createElement(
				CardBody,
				null,
				createElement( 'h3', { style: { margin: '0 0 4px' } }, area.title ),
				createElement( 'p', { style: { margin: '0 0 16px', color: '#50575e' } }, area.description ),
				createElement(
					Button,
					{ variant: link.primary ? 'primary' : 'secondary', href: link.url },
					link.label || link.id
				)
			)
		);
	} ).filter( Boolean );

	if ( ! cards.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'pixelgrade-overview__values',
			style: {
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
				gap: '16px',
				margin: '0 0 24px',
			},
		},
		cards
	);
}

function renderAccountChip( account ) {
	if ( ! account || ! account.is_connected ) {
		return null;
	}

	const name = account.display_name || account.user_login || account.email || '';
	const children = [];

	children.push( createElement( 'span', { key: 'avatar' }, renderAvatar( account, 24 ) ) );

	children.push(
		createElement(
			'span',
			{ key: 'name' },
			name
				? sprintf(
						/* translators: %s: pixelgrade.com account display name. */
						__( 'Connected as %s', 'pixelgrade_assistant' ),
						name
				  )
				: __( 'Connected', 'pixelgrade_assistant' )
		)
	);

	return createElement(
		Flex,
		{ align: 'center', gap: 2, justify: 'flex-end', expanded: false },
		children.map( ( child, index ) => createElement( FlexItem, { key: index }, child ) )
	);
}

function renderThemeCard( theme, account ) {
	const name = theme.name || __( 'Your theme', 'pixelgrade_assistant' );
	const badge = theme.isBlockTheme
		? __( 'Block theme', 'pixelgrade_assistant' )
		: __( 'Classic theme', 'pixelgrade_assistant' );
	const version = theme.version
		? sprintf(
				/* translators: %s: theme version number. */
				__( 'v%s', 'pixelgrade_assistant' ),
				theme.version
		  )
		: '';
	const meta = [ badge, version ].filter( Boolean ).join( ' · ' );

	const left = createElement(
		'div',
		null,
		createElement( 'h2', { style: { margin: 0 } }, name ),
		createElement( 'p', { style: { margin: '4px 0 0', color: '#757575' } }, meta )
	);

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__theme' },
		createElement(
			CardBody,
			null,
			createElement(
				Flex,
				{ align: 'center', justify: 'space-between' },
				createElement( FlexItem, null, left ),
				createElement( FlexItem, null, renderAccountChip( account ) )
			)
		)
	);
}

function renderPlusCard( plus ) {
	if ( ! plus || ! plus.label ) {
		return null;
	}

	if ( plus.isActive ) {
		return null;
	}

	const productLabel = plus.productLabel || 'Pixelgrade Plus';
	const ctaProps = { variant: 'primary', href: plus.url };

	// The discover state links out to the shop; activate/manage stay in wp-admin.
	if ( 'discover' === plus.state ) {
		ctaProps.target = '_blank';
		ctaProps.rel = 'noreferrer noopener';
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__plus pixelgrade-overview__plus--' + ( plus.state || 'discover' ) },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, productLabel ) ),
		createElement(
			CardBody,
			null,
			plus.description
				? createElement( 'p', { style: { marginTop: 0 } }, plus.description )
				: null,
			createElement( Button, ctaProps, plus.label )
		)
	);
}

export function Overview() {
	const data = getOverview();
	const theme = data.theme || {};
	const links = Array.isArray( data.links ) ? data.links : [];
	const plus = data.plus || {};
	const account = data.account || {};

	return createElement(
		Fragment,
		null,
		// The hub-native onboarding checklist sits above the hero. It self-hides when the server says
		// onboarding is complete / dismissed / disabled (window.pixelgradeOverview.onboarding.show).
		createElement( GetStartedCard, null ),
		renderCommandCenter( data ),
		renderOrientation(),
		renderValueAreas( links ),
		renderThemeCard( theme, account ),
		renderPlusCard( plus )
	);
}
