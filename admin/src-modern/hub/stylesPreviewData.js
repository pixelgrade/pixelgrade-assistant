/**
 * Strict client boundary for Style Manager's saved design-system preview contract.
 */
import apiFetch from '@wordpress/api-fetch';

export const PREVIEW_SCHEMA_VERSION = 1;

const CANONICAL_ROLE_IDS = [ 'primary', 'body', 'secondary' ];
const CANONICAL_SPACING_IDS = [ 'container', 'inset', 'rhythm' ];
const FONT_FALLBACKS = [ 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui' ];
const FONT_STYLES = [ 'normal', 'italic', 'oblique' ];
const TEXT_TRANSFORMS = [ 'none', 'uppercase', 'lowercase', 'capitalize' ];

function isRecord( value ) {
	return !! value && 'object' === typeof value && ! Array.isArray( value );
}

function normalizeText( value, maxLength = 160 ) {
	if ( 'string' !== typeof value ) {
		return '';
	}

	const text = value.trim();
	if ( ! text || maxLength < text.length || /[<>\u0000-\u001f]/.test( text ) ) {
		return '';
	}

	return text;
}

function normalizeColor( value ) {
	const color = 'string' === typeof value ? value.trim().toLowerCase() : '';

	return /^#[0-9a-f]{6}$/.test( color ) ? color : '';
}

function normalizeFiniteNumber( value ) {
	const number = 'number' === typeof value ? value : Number.NaN;

	return Number.isFinite( number ) ? number : null;
}

function normalizeVariation( value ) {
	if ( ! isRecord( value ) ) {
		return null;
	}

	const variation = {
		surface: normalizeColor( value.surface ),
		text: normalizeColor( value.text ),
		mutedText: normalizeColor( value.mutedText ),
		accent: normalizeColor( value.accent ),
	};

	return Object.values( variation ).every( Boolean ) ? variation : null;
}

function normalizeColors( value ) {
	if ( ! isRecord( value ) || ! isRecord( value.palette ) || ! isRecord( value.current ) ) {
		return null;
	}

	const palette = {
		id: normalizeText( String( value.palette.id || '' ), 80 ),
		label: normalizeText( value.palette.label ),
	};
	const currentVariation = Number.isInteger( value.current.variation ) && 0 < value.current.variation
		? value.current.variation
		: null;
	const current = normalizeVariation( value.current );
	const rawSamples = Array.isArray( value.samples ) ? value.samples : [];
	const samples = rawSamples.length
		? value.samples.map( ( sample ) => {
			if ( ! isRecord( sample ) ) {
				return null;
			}

			const variation = normalizeVariation( sample );
			const position = normalizeFiniteNumber( sample.position );
			const id = normalizeText( sample.id, 40 );
			const label = normalizeText( sample.label, 80 );

			if (
				! variation ||
				! /^grade-[1-9]\d*$/.test( id ) ||
				! label ||
				null === position ||
				0 > position ||
				1 < position ||
				'boolean' !== typeof sample.isSource
			) {
				return null;
			}

			return {
				id,
				label,
				position,
				isSource: sample.isSource,
				...variation,
			};
		} )
		: [];

	if (
		! palette.id ||
		! palette.label ||
		! currentVariation ||
		! current ||
		2 > samples.length ||
		4 < samples.length ||
		samples.some( ( sample ) => ! sample )
	) {
		return null;
	}

	return {
		palette,
		current: { variation: currentVariation, ...current },
		samples,
	};
}

function normalizeFontRole( value, expectedId ) {
	if ( ! isRecord( value ) || expectedId !== value.id ) {
		return null;
	}

	const family = normalizeText( value.family );
	const label = normalizeText( value.label, 80 );
	const weight = normalizeFiniteNumber( value.weight );
	const style = FONT_STYLES.includes( value.style ) ? value.style : '';
	const fallback = FONT_FALLBACKS.includes( value.fallback ) ? value.fallback : '';
	const textTransform = TEXT_TRANSFORMS.includes( value.textTransform ) ? value.textTransform : '';
	const letterSpacing = null === value.letterSpacing
		? null
		: normalizeText( value.letterSpacing, 24 );
	const lineHeight = null === value.lineHeight ? null : normalizeFiniteNumber( value.lineHeight );

	if (
		! family ||
		! label ||
		null === weight ||
		! Number.isInteger( weight ) ||
		100 > weight ||
		900 < weight ||
		! style ||
		! fallback ||
		! textTransform ||
		( null !== letterSpacing && ! /^-?\d+(?:\.\d+)?(?:em|rem|px|%)?$/.test( letterSpacing ) ) ||
		( null !== lineHeight && ( 0 >= lineHeight || 10 < lineHeight ) )
	) {
		return null;
	}

	return {
		id: expectedId,
		label,
		family,
		fallback,
		weight,
		style,
		letterSpacing,
		textTransform,
		lineHeight,
	};
}

function isPotentialStylesheetUrl( value ) {
	if ( 'string' !== typeof value ) {
		return false;
	}

	const url = value.trim();

	return /^https?:\/\//i.test( url ) || /^\/\/[^/]/.test( url );
}

function normalizeTypography( value ) {
	if ( ! isRecord( value ) || ! Array.isArray( value.roles ) ) {
		return null;
	}

	const byId = value.roles.reduce( ( roles, role ) => {
		if ( isRecord( role ) && 'string' === typeof role.id && ! roles[ role.id ] ) {
			roles[ role.id ] = role;
		}

		return roles;
	}, {} );
	const roles = CANONICAL_ROLE_IDS.map( ( id ) => normalizeFontRole( byId[ id ], id ) );

	if ( roles.some( ( role ) => ! role ) ) {
		return null;
	}

	return {
		roles,
		stylesheetUrls: Array.isArray( value.stylesheetUrls )
			? Array.from( new Set( value.stylesheetUrls.filter( isPotentialStylesheetUrl ).map( ( url ) => url.trim() ) ) )
			: [],
	};
}

function normalizeSpacing( value ) {
	if ( ! isRecord( value ) || ! Array.isArray( value.metrics ) ) {
		return null;
	}

	const byId = value.metrics.reduce( ( metrics, metric ) => {
		if ( isRecord( metric ) && 'string' === typeof metric.id && ! metrics[ metric.id ] ) {
			metrics[ metric.id ] = metric;
		}

		return metrics;
	}, {} );
	const metrics = CANONICAL_SPACING_IDS.map( ( id ) => {
		const metric = byId[ id ];
		if ( ! isRecord( metric ) ) {
			return null;
		}

		const label = normalizeText( metric.label, 80 );
		const formatted = normalizeText( metric.formatted, 40 );
		const rawValue = normalizeFiniteNumber( metric.value );
		const normalized = normalizeFiniteNumber( metric.normalized );

		if ( ! label || ! formatted || null === rawValue || null === normalized || 0 > normalized || 1 < normalized ) {
			return null;
		}

		return { id, label, value: rawValue, formatted, normalized };
	} );

	return metrics.some( ( metric ) => ! metric ) ? null : { metrics };
}

export function normalizePreviewDescriptor( value ) {
	if ( ! isRecord( value ) || PREVIEW_SCHEMA_VERSION !== value.schemaVersion ) {
		return null;
	}

	const path = normalizeText( value.path, 180 );
	if ( ! /^\/style_manager\/v\d+\/[a-z0-9-]+$/.test( path ) ) {
		return null;
	}

	return { schemaVersion: PREVIEW_SCHEMA_VERSION, path };
}

export function normalizePreviewPayload( value ) {
	if ( ! isRecord( value ) || PREVIEW_SCHEMA_VERSION !== value.schemaVersion ) {
		return null;
	}

	const revision = 'string' === typeof value.revision ? value.revision.trim().toLowerCase() : '';
	if ( ! /^[a-f0-9]{16}$/.test( revision ) ) {
		return null;
	}

	return {
		schemaVersion: PREVIEW_SCHEMA_VERSION,
		revision,
		colors: normalizeColors( value.colors ),
		typography: normalizeTypography( value.typography ),
		spacing: normalizeSpacing( value.spacing ),
	};
}

function safeAbsoluteStylesheetUrl( value, doc ) {
	if ( ! isPotentialStylesheetUrl( value ) || ! doc ) {
		return '';
	}

	try {
		const url = new URL( value, doc.baseURI || doc.location?.href );

		return [ 'http:', 'https:' ].includes( url.protocol ) ? url.href : '';
	} catch ( error ) {
		return '';
	}
}

export function ensurePreviewFontStylesheets( urls, doc = 'undefined' !== typeof document ? document : null ) {
	if ( ! doc || ! Array.isArray( urls ) ) {
		return [];
	}

	const links = [];
	Array.from( new Set( urls.map( ( url ) => safeAbsoluteStylesheetUrl( url, doc ) ).filter( Boolean ) ) )
		.forEach( ( href ) => {
			let link = Array.from( doc.querySelectorAll( 'link[data-pixassist-style-preview-font]' ) )
				.find( ( candidate ) => candidate.href === href );

			if ( ! link ) {
				link = doc.createElement( 'link' );
				link.rel = 'stylesheet';
				link.href = href;
				link.dataset.pixassistStylePreviewFont = '';
				doc.head.appendChild( link );
			}

			links.push( link );
		} );

	return links;
}

export async function requestDesignSystemPreview( descriptor, options = {} ) {
	const normalizedDescriptor = normalizePreviewDescriptor( descriptor );
	if ( ! normalizedDescriptor ) {
		throw new Error( 'Invalid Style Manager preview descriptor.' );
	}

	const response = await apiFetch( {
		path: normalizedDescriptor.path,
		signal: options.signal,
	} );
	const payload = normalizePreviewPayload( response );

	if ( ! payload ) {
		throw new Error( 'Invalid Style Manager preview response.' );
	}

	return payload;
}
