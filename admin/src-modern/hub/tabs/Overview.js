/**
 * The free Overview tab — the Appearance -> Pixelgrade hub's landing surface (#44).
 *
 * Presentational only: all logic + copy come from the server-assembled `window.pixelgradeOverview`
 * payload (pixassist_get_overview_data(), localized on the hub page) — theme status, quick links
 * (the canvas link first, then sibling Starter Sites / Help tabs when present), and the Pixelgrade
 * Plus discovery/manage card across its three 4-key states. The host account, when connected, shows
 * as a small chip (identity only; #45 modernizes the source behind the same accessor).
 *
 * No JSX, matching the rest of the hub bundle (keeps externals to wp-element/components/i18n/hooks).
 */
import { createElement, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button, Flex, FlexItem } from '@wordpress/components';

const DEFAULT_OVERVIEW = { theme: {}, links: [], plus: {}, account: { is_connected: false } };

function getOverview() {
	if ( typeof window !== 'undefined' && window.pixelgradeOverview ) {
		return window.pixelgradeOverview;
	}

	return DEFAULT_OVERVIEW;
}

function renderAccountChip( account ) {
	if ( ! account || ! account.is_connected ) {
		return null;
	}

	const name = account.display_name || account.user_login || account.email || '';
	const children = [];

	if ( account.avatar_url ) {
		children.push(
			createElement( 'img', {
				key: 'avatar',
				src: account.avatar_url,
				alt: '',
				width: 24,
				height: 24,
				style: { borderRadius: '50%', display: 'block' },
			} )
		);
	}

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

function renderQuickLinks( links ) {
	if ( ! Array.isArray( links ) || ! links.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			className: 'pixelgrade-overview__links',
			style: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '16px 0' },
		},
		links.map( ( link ) =>
			createElement(
				Button,
				{
					key: link.id,
					href: link.url,
					variant: link.primary ? 'primary' : 'secondary',
				},
				link.label || link.id
			)
		)
	);
}

function renderPlusCard( plus ) {
	if ( ! plus || ! plus.label ) {
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
		renderThemeCard( theme, account ),
		renderQuickLinks( links ),
		renderPlusCard( plus )
	);
}
