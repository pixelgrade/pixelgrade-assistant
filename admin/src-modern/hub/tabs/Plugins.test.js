import { createElement, createRoot, flushSync } from '@wordpress/element';
import { addFilter, removeAllFilters } from '@wordpress/hooks';

import { Plugins } from './Plugins';

const FILTER = 'pixelgrade.adminHub.setupSections';
const NAMESPACE = 'pixelgrade-assistant/test-setup-sections';

function FirstSection( props ) {
	return createElement( 'p', { className: 'first-section' }, 'first:' + props.sectionId );
}

function SecondSection() {
	return createElement( 'p', { className: 'second-section' }, 'second' );
}

describe( 'Setup tab — contributed sections', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		window.pixelgradePlugins = { plugins: [], copy: {}, readiness: {} };
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
		removeAllFilters( FILTER );
		delete window.pixelgradePlugins;
	} );

	function renderPlugins() {
		flushSync( () => {
			root.render( createElement( Plugins ) );
		} );

		return container;
	}

	test( 'renders no extra sections when nothing is contributed', () => {
		const result = renderPlugins();

		expect( result.querySelectorAll( '[data-setup-section]' ) ).toHaveLength( 0 );
	} );

	test( 'renders contributed sections at the bottom with the expected container ids and props', () => {
		addFilter( FILTER, NAMESPACE, ( sections ) => [
			...sections,
			{ id: 'fonts', order: 20, component: FirstSection },
			{ id: 'alpha', order: 5, component: SecondSection },
		] );

		const result = renderPlugins();
		const rendered = result.querySelectorAll( '[data-setup-section]' );

		expect( rendered ).toHaveLength( 2 );
		// Sorted by numeric order (5 before 20), regardless of registration order.
		expect( rendered[ 0 ].getAttribute( 'data-setup-section' ) ).toBe( 'alpha' );
		expect( rendered[ 1 ].getAttribute( 'data-setup-section' ) ).toBe( 'fonts' );
		expect( rendered[ 1 ].id ).toBe( 'pixelgrade-setup-section-fonts' );
		expect( rendered[ 0 ].id ).toBe( 'pixelgrade-setup-section-alpha' );
		// The component receives { setupData, sectionId }.
		expect( rendered[ 1 ].querySelector( '.first-section' ).textContent ).toBe( 'first:fonts' );

		// Contributed sections render after the host-owned content (plugins list / empty notice).
		const notice = result.querySelector( '.components-notice' );
		if ( notice ) {
			expect(
				notice.compareDocumentPosition( rendered[ 0 ] ) & Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
		}
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

		const result = renderPlugins();
		const rendered = result.querySelectorAll( '[data-setup-section]' );

		expect( rendered ).toHaveLength( 1 );
		expect( rendered[ 0 ].getAttribute( 'data-setup-section' ) ).toBe( 'fonts' );
		// First registration for the duplicate id wins.
		expect( rendered[ 0 ].querySelector( '.first-section' ) ).not.toBeNull();
		expect( rendered[ 0 ].querySelector( '.second-section' ) ).toBeNull();
	} );

	test( 'sanitizes ids the same way Styles/Account section ids are sanitized', () => {
		addFilter( FILTER, NAMESPACE, () => [
			{ id: ' Fonts 2.0! ', component: FirstSection },
		] );

		const result = renderPlugins();
		const rendered = result.querySelector( '[data-setup-section]' );

		expect( rendered.getAttribute( 'data-setup-section' ) ).toBe( 'fonts20' );
		expect( rendered.id ).toBe( 'pixelgrade-setup-section-fonts20' );
	} );
} );
