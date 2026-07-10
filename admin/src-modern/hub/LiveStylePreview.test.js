import { createElement, createRoot, flushSync } from '@wordpress/element';

import { LiveStylePreview } from './LiveStylePreview';

const colors = {
	palette: { id: '1', label: 'Brand Primary' },
	current: { variation: 1, surface: '#f7f8f3', text: '#0f261d', mutedText: '#173d2d', accent: '#00825a' },
	samples: [
		{ id: 'grade-1', label: 'Light', position: 0, isSource: false, surface: '#f7f8f3', text: '#0f261d', mutedText: '#173d2d', accent: '#00825a' },
		{ id: 'grade-2', label: 'Soft', position: 0.333, isSource: false, surface: '#b2eca1', text: '#0f261d', mutedText: '#173d2d', accent: '#00825a' },
		{ id: 'grade-3', label: 'Brand', position: 0.667, isSource: true, surface: '#00825a', text: '#ffffff', mutedText: '#ffffff', accent: '#f7f8f3' },
		{ id: 'grade-4', label: 'Deep', position: 1, isSource: false, surface: '#004e42', text: '#ffffff', mutedText: '#ffffff', accent: '#f7f8f3' },
	],
};

const typography = {
	roles: [
		{ id: 'primary', label: 'Primary', family: 'Space Grotesk', fallback: 'sans-serif', weight: 700, style: 'normal', letterSpacing: '-0.04em', textTransform: 'none', lineHeight: 1.01 },
		{ id: 'body', label: 'Body', family: 'Rubik', fallback: 'sans-serif', weight: 400, style: 'normal', letterSpacing: '0', textTransform: 'none', lineHeight: 1.68 },
		{ id: 'secondary', label: 'Secondary', family: 'Space Mono', fallback: 'monospace', weight: 400, style: 'normal', letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.49 },
	],
	stylesheetUrls: [],
};

const spacing = {
	metrics: [
		{ id: 'container', label: 'Container', value: 70, formatted: '70', normalized: 0.25 },
		{ id: 'inset', label: 'Inset', value: 180, formatted: '180', normalized: 0.4 },
		{ id: 'rhythm', label: 'Rhythm', value: 1, formatted: '1×', normalized: 0.5 },
	],
};

describe( 'LiveStylePreview', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
	} );

	function renderPreview( type, data ) {
		flushSync( () => {
			root.render( createElement( LiveStylePreview, { type, data } ) );
		} );

		return container;
	}

	test( 'renders contract colors and one accessible summary', () => {
		const root = renderPreview( 'colors', colors );
		const preview = root.querySelector( '[role="img"]' );
		const grades = root.querySelectorAll( '.pixelgrade-styles-preview__grade' );

		expect( preview.getAttribute( 'aria-label' ) ).toBe( 'Current color system: Brand Primary.' );
		expect( preview.querySelector( '[aria-hidden="true"]' ) ).not.toBeNull();
		expect( grades ).toHaveLength( 4 );
		expect( grades[ 0 ].style.getPropertyValue( '--pxg-preview-surface' ) ).toBe( '#f7f8f3' );
		expect( grades[ 2 ].style.getPropertyValue( '--pxg-preview-accent' ) ).toBe( '#f7f8f3' );
	} );

	test( 'sizes the color rail to the number of valid samples', () => {
		const root = renderPreview( 'colors', { ...colors, samples: colors.samples.slice( 0, 3 ) } );
		const rail = root.querySelector( '.pixelgrade-styles-preview__color-rail' );

		expect( rail.style.getPropertyValue( '--pxg-preview-grade-count' ) ).toBe( '3' );
		expect( rail.querySelectorAll( '.pixelgrade-styles-preview__grade' ) ).toHaveLength( 3 );
	} );

	test( 'renders the canonical Primary Body Secondary roles', () => {
		const root = renderPreview( 'typography', typography );
		const preview = root.querySelector( '[role="img"]' );

		expect( preview.getAttribute( 'aria-label' ) ).toBe( 'Current typography: Primary Space Grotesk, Body Rubik, Secondary Space Mono.' );
		expect( root.textContent ).toContain( 'Primary' );
		expect( root.textContent ).toContain( 'Body' );
		expect( root.textContent ).toContain( 'Secondary' );
		expect( root.textContent ).not.toContain( 'Action' );
		expect( root.querySelector( '.pixelgrade-styles-preview__type-display' ).style.fontFamily ).toContain( 'Space Grotesk' );
	} );

	test( 'renders spacing labels and normalized geometry', () => {
		const root = renderPreview( 'spacing', spacing );
		const preview = root.querySelector( '[role="img"]' );
		const stage = root.querySelector( '.pixelgrade-styles-preview__spacing-stage' );

		expect( preview.getAttribute( 'aria-label' ) ).toBe( 'Current spacing: Container 70, Inset 180, Rhythm 1×.' );
		expect( stage.style.getPropertyValue( '--pxg-preview-container' ) ).toBe( '0.25' );
		expect( stage.style.getPropertyValue( '--pxg-preview-inset' ) ).toBe( '0.4' );
		expect( stage.style.getPropertyValue( '--pxg-preview-rhythm' ) ).toBe( '0.5' );
		expect( stage.style.getPropertyValue( '--pxg-preview-container-width' ) ).toBe( '61.5%' );
		expect( stage.style.getPropertyValue( '--pxg-preview-content-width' ) ).toBe( '76.8%' );
		expect( stage.style.getPropertyValue( '--pxg-preview-rhythm-gap' ) ).toBe( '6px' );
	} );

	test( 'renders nothing for an unknown or incomplete section', () => {
		expect( renderPreview( 'motion', {} ).innerHTML ).toBe( '' );
		expect( renderPreview( 'typography', { roles: [] } ).innerHTML ).toBe( '' );
	} );
} );
