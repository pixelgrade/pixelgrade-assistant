/**
 * Compact, noninteractive renderers for Style Manager's normalized preview contract.
 */
import { createElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

function previewColors( colors ) {
	return {
		'--pxg-preview-surface': colors.surface,
		'--pxg-preview-text': colors.text,
		'--pxg-preview-muted': colors.mutedText,
		'--pxg-preview-accent': colors.accent,
	};
}

function fontStyle( role ) {
	return {
		fontFamily: '"' + role.family.replace( /"/g, '' ) + '", ' + role.fallback,
		fontWeight: role.weight,
		fontStyle: role.style,
		letterSpacing: role.letterSpacing || undefined,
		lineHeight: role.lineHeight || undefined,
		textTransform: role.textTransform,
	};
}

function board( type, label, style, content ) {
	return createElement(
		'div',
		{
			className: 'pixelgrade-styles-preview pixelgrade-styles-preview--' + type,
			role: 'img',
			'aria-label': label,
			style,
		},
		createElement(
			'div',
			{
				className: 'pixelgrade-styles-preview__board',
				'aria-hidden': true,
			},
			content
		)
	);
}

function kicker( text, meta ) {
	return [
		createElement( 'p', { className: 'pixelgrade-styles-preview__kicker', key: 'kicker' }, text ),
		meta
			? createElement( 'span', { className: 'pixelgrade-styles-preview__meta', key: 'meta' }, meta )
			: null,
	];
}

function ColorsPreview( { data } ) {
	if ( ! data || ! data.palette || ! data.current || ! Array.isArray( data.samples ) || 2 > data.samples.length ) {
		return null;
	}

	const label = sprintf(
		/* translators: %s: Current Style Manager palette label. */
		__( 'Current color system: %s.', 'pixelgrade_assistant' ),
		data.palette.label
	);

	return board(
		'colors',
		label,
		previewColors( data.current ),
		[
			...kicker( __( 'Current color system', 'pixelgrade_assistant' ), data.palette.label ),
			createElement(
				'div',
				{ className: 'pixelgrade-styles-preview__color-rail', key: 'rail' },
				data.samples.map( ( sample ) => createElement(
					'div',
					{
						className: 'pixelgrade-styles-preview__grade' + ( sample.isSource ? ' is-source' : '' ),
						key: sample.id,
						style: previewColors( sample ),
					},
					createElement( 'strong', null, sample.label ),
					createElement(
						'span',
						null,
						createElement( 'i', null ),
						__( 'Accent', 'pixelgrade_assistant' )
					)
				) )
			),
		]
	);
}

function TypographyPreview( { data } ) {
	if ( ! data || ! Array.isArray( data.roles ) ) {
		return null;
	}

	const roles = data.roles.reduce( ( byId, role ) => {
		if ( role && role.id ) {
			byId[ role.id ] = role;
		}

		return byId;
	}, {} );
	const primary = roles.primary;
	const bodyRole = roles.body;
	const secondary = roles.secondary;

	if ( ! primary || ! bodyRole || ! secondary ) {
		return null;
	}

	const label = sprintf(
		/* translators: 1: Primary font family, 2: Body font family, 3: Secondary font family. */
		__( 'Current typography: Primary %1$s, Body %2$s, Secondary %3$s.', 'pixelgrade_assistant' ),
		primary.family,
		bodyRole.family,
		secondary.family
	);

	return board(
		'typography',
		label,
		null,
		[
			...kicker( __( 'Current type system', 'pixelgrade_assistant' ) ),
			createElement(
				'div',
				{ className: 'pixelgrade-styles-preview__type-sample', key: 'sample' },
				createElement( 'h4', { className: 'pixelgrade-styles-preview__type-display', style: fontStyle( primary ) }, 'Aa' ),
				createElement(
					'p',
					{ style: fontStyle( bodyRole ) },
					__( 'Hierarchy, voice, and reading rhythm.', 'pixelgrade_assistant' )
				)
			),
			createElement(
				'div',
				{ className: 'pixelgrade-styles-preview__type-roles', key: 'roles' },
				[ primary, bodyRole, secondary ].map( ( role ) => createElement(
					'div',
					{ className: 'pixelgrade-styles-preview__type-role', key: role.id },
					createElement( 'span', null, role.label ),
					createElement( 'strong', { style: fontStyle( role ) }, role.family )
				) )
			),
		]
	);
}

function SpacingPreview( { data } ) {
	if ( ! data || ! Array.isArray( data.metrics ) ) {
		return null;
	}

	const metrics = data.metrics.reduce( ( byId, metric ) => {
		if ( metric && metric.id ) {
			byId[ metric.id ] = metric;
		}

		return byId;
	}, {} );
	const container = metrics.container;
	const inset = metrics.inset;
	const rhythm = metrics.rhythm;

	if ( ! container || ! inset || ! rhythm ) {
		return null;
	}

	const label = sprintf(
		/* translators: 1: Container value, 2: Inset value, 3: Rhythm value. */
		__( 'Current spacing: Container %1$s, Inset %2$s, Rhythm %3$s.', 'pixelgrade_assistant' ),
		container.formatted,
		inset.formatted,
		rhythm.formatted
	);

	return board(
		'spacing',
		label,
		null,
		[
			...kicker( __( 'Current spacing system', 'pixelgrade_assistant' ) ),
			createElement(
				'div',
				{
					className: 'pixelgrade-styles-preview__spacing-stage',
					key: 'stage',
					style: {
						'--pxg-preview-container': String( container.normalized ),
						'--pxg-preview-inset': String( inset.normalized ),
						'--pxg-preview-rhythm': String( rhythm.normalized ),
						'--pxg-preview-container-width': ( 52 + container.normalized * 38 ) + '%',
						'--pxg-preview-content-width': ( 92 - inset.normalized * 38 ) + '%',
						'--pxg-preview-rhythm-gap': ( 2 + rhythm.normalized * 8 ) + 'px',
					},
				},
				createElement(
					'div',
					{ className: 'pixelgrade-styles-preview__spacing-container' },
					createElement(
						'div',
						{ className: 'pixelgrade-styles-preview__spacing-content' },
						createElement( 'i', null ),
						createElement( 'i', null ),
						createElement( 'i', null )
					)
				)
			),
			createElement(
				'div',
				{ className: 'pixelgrade-styles-preview__spacing-metrics', key: 'metrics' },
				[ container, inset, rhythm ].map( ( metric ) => createElement(
					'div',
					{ className: 'pixelgrade-styles-preview__spacing-metric', key: metric.id },
					createElement( 'span', null, metric.label ),
					createElement( 'strong', null, metric.formatted )
				) )
			),
		]
	);
}

const PREVIEWS = {
	colors: ColorsPreview,
	typography: TypographyPreview,
	spacing: SpacingPreview,
};

export function LiveStylePreview( { type, data } ) {
	const Preview = PREVIEWS[ type ];

	return Preview && data ? createElement( Preview, { data } ) : null;
}
