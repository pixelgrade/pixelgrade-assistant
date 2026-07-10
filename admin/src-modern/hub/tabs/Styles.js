/**
 * The free Styles tab.
 *
 * The tab itself stays inside Pixelgrade Design. Its buttons route to the editor/customizer surfaces
 * where editing happens. Data comes from `window.pixelgradeStyles`, assembled server-side.
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody } from '@wordpress/components';

import { LiveStylePreview } from '../LiveStylePreview';

const DEFAULT_STYLES = {
	copy: {
		title: __( 'Your Site Design System', 'pixelgrade_assistant' ),
		intro: __( 'Style Manager controls the visual decisions that keep your theme and blocks working together.', 'pixelgrade_assistant' ),
		description: __( 'Start with the free style controls, then use optional Plus capabilities only when your site needs them.', 'pixelgrade_assistant' ),
	},
	primaryAction: {
		label: __( 'Open Style Manager', 'pixelgrade_assistant' ),
		url: '',
	},
	destinations: [],
};

function getStylesData() {
	if ( typeof window !== 'undefined' && window.pixelgradeStyles ) {
		return window.pixelgradeStyles;
	}

	return DEFAULT_STYLES;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_STYLES.copy,
		...( copy || {} ),
	};
}

function renderBadge( destination ) {
	if ( ! destination.badge ) {
		return null;
	}

	return createElement(
		'span',
		{
			style: {
				background: destination.isLocked ? '#f6f7f7' : '#edfaef',
				border: '1px solid ' + ( destination.isLocked ? '#dcdcde' : '#b8e6c2' ),
				borderRadius: '999px',
				color: destination.isLocked ? '#50575e' : '#0a7a28',
				display: 'inline-flex',
				fontSize: '11px',
				fontWeight: 600,
				lineHeight: 1,
				margin: '0 0 10px',
				padding: '4px 7px',
				whiteSpace: 'nowrap',
			},
			className: 'pixelgrade-styles__badge',
		},
		destination.badge
	);
}

function renderDestination( destination, previewPayload ) {
	const variant = destination.isProminent ? 'primary' : 'secondary';
	const buttonVariant = destination.isLocked && ! destination.isProminent ? 'tertiary' : variant;
	const liveData = previewPayload && previewPayload[ destination.id ] ? previewPayload[ destination.id ] : null;
	const image = destination.image
		? createElement(
			'img',
			{
				alt: liveData ? '' : ( destination.imageAlt || '' ),
				'aria-hidden': liveData ? true : undefined,
				className: 'pixelgrade-styles__preview-fallback',
				src: destination.image,
			}
		)
		: null;
	const livePreview = liveData
		? createElement( LiveStylePreview, { type: destination.id, data: liveData } )
		: null;
	const preview = image || livePreview
		? createElement(
			'div',
			{
				className: 'pixelgrade-styles__preview-frame' + ( livePreview ? ' has-live-preview' : '' ),
			},
			image,
			livePreview
		)
		: null;

	return createElement(
		Card,
		{
			key: destination.id,
			className: 'pixelgrade-styles__destination pixelgrade-styles__destination--' + destination.id,
			style: {
				borderColor: destination.isProminent ? '#c3c4c7' : undefined,
				overflow: preview ? 'hidden' : undefined,
			},
		},
		preview,
		createElement(
			CardBody,
			null,
			renderBadge( destination ),
			createElement( 'h3', { style: { margin: '0 0 8px' } }, destination.title || destination.id ),
			destination.description
				? createElement(
					'p',
					{
						style: {
							color: '#50575e',
							margin: '0 0 18px',
							maxWidth: '36em',
						},
					},
					destination.description
				)
				: null,
			destination.url
				? createElement(
					Button,
					{
						href: destination.url,
						variant: buttonVariant,
					},
					destination.actionLabel || __( 'Open', 'pixelgrade_assistant' )
				)
				: null
		)
	);
}

export function Styles() {
	const data = getStylesData();
	const copy = mergeCopy( data.copy );
	const destinations = Array.isArray( data.destinations ) ? data.destinations : [];
	const primary = data.primaryAction || {};
	const previewPayload = data.previewPayload || null;

	return createElement(
		'div',
		{ className: 'pixelgrade-styles' },
		createElement(
			'div',
			{
				className: 'pixelgrade-styles__intro',
				style: {
					margin: '8px 0 20px',
					maxWidth: '760px',
				},
			},
			createElement( 'h2', { style: { margin: '0 0 8px', fontSize: '1.5em' } }, copy.title ),
			createElement( 'p', { style: { margin: '0 0 8px', fontSize: '1.05em', color: '#50575e' } }, copy.intro ),
			createElement( 'p', { style: { margin: 0, color: '#646970' } }, copy.description ),
			primary.url
				? createElement(
					'p',
					{ style: { margin: '18px 0 0' } },
					createElement(
						Button,
						{ href: primary.url, variant: 'primary' },
						primary.label || __( 'Open Style Manager', 'pixelgrade_assistant' )
					)
				)
				: null
		),
		createElement(
			'div',
			{
				className: 'pixelgrade-styles__destinations',
				style: {
					display: 'grid',
					gap: '16px',
					gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
				},
			},
			destinations.map( ( destination ) => renderDestination( destination, previewPayload ) )
		)
	);
}
