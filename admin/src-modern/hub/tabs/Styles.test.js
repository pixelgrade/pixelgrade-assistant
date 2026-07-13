import { createElement, createRoot, flushSync } from '@wordpress/element';
import { addFilter, removeAllFilters } from '@wordpress/hooks';

import { Styles } from './Styles';

const FILTER = 'pixelgrade.adminHub.stylesSections';
const NAMESPACE = 'pixelgrade-assistant/test-styles-sections';

function FirstSection( props ) {
	return createElement( 'p', { className: 'first-section' }, 'first:' + props.sectionId );
}

function SecondSection() {
	return createElement( 'p', { className: 'second-section' }, 'second' );
}

describe( 'Styles tab — contributed sections', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		window.pixelgradeStyles = { copy: {}, primaryAction: {}, destinations: [] };
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
		removeAllFilters( FILTER );
		delete window.pixelgradeStyles;
	} );

	function renderStyles() {
		flushSync( () => {
			root.render( createElement( Styles ) );
		} );

		return container;
	}

	test( 'renders no extra sections when nothing is contributed', () => {
		const result = renderStyles();

		expect( result.querySelectorAll( '[data-styles-section]' ) ).toHaveLength( 0 );
	} );

	test( 'renders contributed sections in order with the expected container ids and props', () => {
		addFilter( FILTER, NAMESPACE, ( sections ) => [
			...sections,
			{ id: 'fonts', order: 20, component: FirstSection },
			{ id: 'alpha', order: 5, component: SecondSection },
		] );

		const result = renderStyles();
		const rendered = result.querySelectorAll( '[data-styles-section]' );

		expect( rendered ).toHaveLength( 2 );
		// Sorted by numeric order (5 before 20), regardless of registration order.
		expect( rendered[ 0 ].getAttribute( 'data-styles-section' ) ).toBe( 'alpha' );
		expect( rendered[ 1 ].getAttribute( 'data-styles-section' ) ).toBe( 'fonts' );
		expect( rendered[ 1 ].id ).toBe( 'pixelgrade-styles-section-fonts' );
		expect( rendered[ 0 ].id ).toBe( 'pixelgrade-styles-section-alpha' );
		// The component receives { stylesData, sectionId }.
		expect( rendered[ 1 ].querySelector( '.first-section' ).textContent ).toBe( 'first:fonts' );
	} );

	test( 'sorts by order with stable ties, defaulting missing order to 10', () => {
		addFilter( FILTER, NAMESPACE, () => [
			{ id: 'b', component: SecondSection },
			{ id: 'a', component: FirstSection },
			{ id: 'c', order: 1, component: SecondSection },
		] );

		const result = renderStyles();
		const ids = Array.from( result.querySelectorAll( '[data-styles-section]' ) ).map( ( el ) =>
			el.getAttribute( 'data-styles-section' )
		);

		// 'c' (order 1) first, then 'b' and 'a' (both default order 10) keep registration order.
		expect( ids ).toEqual( [ 'c', 'b', 'a' ] );
	} );

	test( 'drops descriptors missing an id, missing a component function, or duplicating an id', () => {
		addFilter( FILTER, NAMESPACE, () => [
			{ id: '', component: FirstSection },
			{ id: 'no-component' },
			{ id: 'bad-component', component: 'not-a-function' },
			{ id: 'fonts', order: 1, component: FirstSection },
			{ id: 'fonts', order: 2, component: SecondSection },
			null,
			'not-an-object',
		] );

		const result = renderStyles();
		const rendered = result.querySelectorAll( '[data-styles-section]' );

		expect( rendered ).toHaveLength( 1 );
		expect( rendered[ 0 ].getAttribute( 'data-styles-section' ) ).toBe( 'fonts' );
		// First registration for the duplicate id wins.
		expect( rendered[ 0 ].querySelector( '.first-section' ) ).not.toBeNull();
		expect( rendered[ 0 ].querySelector( '.second-section' ) ).toBeNull();
	} );

	test( 'sanitizes ids the same way Account panel ids are sanitized', () => {
		addFilter( FILTER, NAMESPACE, () => [
			{ id: ' Fonts 2.0! ', component: FirstSection },
		] );

		const result = renderStyles();
		const rendered = result.querySelector( '[data-styles-section]' );

		expect( rendered.getAttribute( 'data-styles-section' ) ).toBe( 'fonts20' );
		expect( rendered.id ).toBe( 'pixelgrade-styles-section-fonts20' );
	} );
} );
