/**
 * Shared "contributed sections" extension pattern for Design hub tabs.
 *
 * Mirrors the Account tab's accountPanels pattern (see Account.js): the host tab renders its own
 * content first, then applies a JS filter (`@wordpress/hooks`) that companion plugins use to append
 * descriptors ({ id, component, order }) for sections rendered below it, without the host tab knowing
 * anything about their contents. First introduced for the Styles tab
 * (`pixelgrade.adminHub.stylesSections`, pixelgrade-assistant#66) and generalized here so the Setup
 * tab (`pixelgrade.adminHub.setupSections`) can reuse the exact same behavior: normalization, sort
 * order, container markup, and the `?tab=<tab>&section=<id>` deep-link scroll/focus/highlight.
 */
import { createElement, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

function sanitizeSectionId( value ) {
	return String( value || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' );
}

function getLinkedSection() {
	if ( 'undefined' === typeof window ) {
		return '';
	}

	const params = new URLSearchParams( window.location.search );

	return sanitizeSectionId( params.get( 'section' ) || '' );
}

/**
 * Derives the CSS class base and `data-*` attribute name from an id prefix, e.g.
 * `pixelgrade-styles-section-` -> class base `pixelgrade-styles-section`, attribute
 * `data-styles-section`.
 *
 * @param {string} idPrefix Container id prefix, e.g. `pixelgrade-styles-section-`.
 * @return {{classBase: string, dataAttr: string}}
 */
function idPrefixParts( idPrefix ) {
	const classBase = String( idPrefix || '' ).replace( /-+$/, '' );
	const dataAttr = classBase.replace( /^pixelgrade-/, '' ) || 'section';

	return { classBase, dataAttr };
}

/**
 * Resolve + normalize the contributed sections for a given filter.
 *
 * Drops any descriptor that is not an object, has no sanitizable `id`, has a non-function
 * `component`, or duplicates an already-seen id (first registration wins). Missing/non-numeric
 * `order` defaults to `10 + registrationIndex` so undeclared orders keep registration order among
 * themselves while still sorting after any explicit low order. Ties in `order` keep registration
 * order.
 *
 * @param {string} filterName `@wordpress/hooks` filter name, e.g. `pixelgrade.adminHub.stylesSections`.
 * @param {Object} data       Value passed as the filter's second argument (the host tab's data payload).
 * @return {Array} Normalized, sorted section descriptors: { id, order, component, index }.
 */
export function getContributedSections( filterName, data ) {
	const sections = applyFilters( filterName, [], data );

	if ( ! Array.isArray( sections ) ) {
		return [];
	}

	const seen = new Set();

	return sections
		.map( ( section, index ) => {
			if ( ! section || 'object' !== typeof section ) {
				return null;
			}

			const id = sanitizeSectionId( section.id || '' );
			if ( ! id || 'function' !== typeof section.component || seen.has( id ) ) {
				return null;
			}

			seen.add( id );

			return {
				id,
				order: Number.isFinite( Number( section.order ) ) ? Number( section.order ) : 10 + index,
				component: section.component,
				index,
			};
		} )
		.filter( Boolean )
		.sort( ( a, b ) => {
			if ( a.order === b.order ) {
				return a.index - b.index;
			}

			return a.order < b.order ? -1 : 1;
		} );
}

/**
 * Render normalized section descriptors as focusable, deep-linkable `<section>` wrappers.
 *
 * @param {Array}  sections             Descriptors from getContributedSections().
 * @param {Object} options
 * @param {string} options.idPrefix     Container id prefix, e.g. `pixelgrade-styles-section-`. Also
 *                                      derives the CSS class base and `data-*` attribute name (see
 *                                      idPrefixParts()).
 * @param {Object} [options.extraProps] Extra props merged into each component's props alongside
 *                                      `sectionId` (e.g. `{ stylesData }` or `{ setupData }`).
 * @return {Array} React elements.
 */
export function renderContributedSections( sections, { idPrefix, extraProps } = {} ) {
	const { classBase, dataAttr } = idPrefixParts( idPrefix );
	const baseProps = extraProps || {};

	return ( sections || [] ).map( ( section ) => {
		const SectionComponent = section.component;

		return createElement(
			'section',
			{
				key: section.id,
				id: idPrefix + section.id,
				className: classBase + ' ' + classBase + '--' + section.id,
				[ 'data-' + dataAttr ]: section.id,
				tabIndex: '-1',
				style: { marginTop: '24px' },
			},
			createElement( SectionComponent, { ...baseProps, sectionId: section.id } )
		);
	} );
}

/**
 * Scrolls to, focuses, and briefly highlights the section named by the `?section=<id>` query param
 * on mount — supports hand-offs like an admin notice's "Manage in Pixelgrade Design" link.
 *
 * @param {string} idPrefix Same prefix used with renderContributedSections().
 */
export function useSectionDeepLink( idPrefix ) {
	const section = getLinkedSection();

	useEffect( () => {
		if ( ! section ) {
			return;
		}

		const element = document.getElementById( idPrefix + section );
		if ( ! element || 'function' !== typeof element.scrollIntoView ) {
			return;
		}

		element.scrollIntoView( { block: 'start', behavior: 'smooth' } );
		if ( 'function' === typeof element.focus ) {
			element.focus( { preventScroll: true } );
		}

		// Briefly highlight the linked section so hand-offs visibly land.
		element.style.transition = 'box-shadow .3s ease';
		element.style.boxShadow = '0 0 0 2px var(--wp-admin-theme-color, #3858e9)';
		element.style.borderRadius = '4px';
		const timer = setTimeout( () => {
			element.style.boxShadow = 'none';
		}, 2000 );

		return () => clearTimeout( timer );
	}, [ idPrefix, section ] );
}
