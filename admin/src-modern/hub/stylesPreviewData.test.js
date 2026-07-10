import apiFetch from '@wordpress/api-fetch';

import {
	ensurePreviewFontStylesheets,
	normalizePreviewDescriptor,
	normalizePreviewPayload,
	requestDesignSystemPreview,
} from './stylesPreviewData';

jest.mock( '@wordpress/api-fetch', () => jest.fn(), { virtual: true } );

const completePayload = {
	schemaVersion: 1,
	revision: 'd966cb0b71c64cb0',
	colors: {
		palette: { id: '1', label: 'Brand Primary' },
		current: {
			variation: 1,
			surface: '#f7f8f3',
			text: '#0f261d',
			mutedText: '#173d2d',
			accent: '#00825a',
		},
		samples: [
			{ id: 'grade-1', label: 'Light', position: 0, isSource: false, surface: '#f7f8f3', text: '#0f261d', mutedText: '#173d2d', accent: '#00825a' },
			{ id: 'grade-2', label: 'Soft', position: 0.333, isSource: false, surface: '#b2eca1', text: '#0f261d', mutedText: '#173d2d', accent: '#00825a' },
			{ id: 'grade-3', label: 'Brand', position: 0.667, isSource: true, surface: '#00825a', text: '#ffffff', mutedText: '#ffffff', accent: '#f7f8f3' },
			{ id: 'grade-4', label: 'Deep', position: 1, isSource: false, surface: '#004e42', text: '#ffffff', mutedText: '#ffffff', accent: '#f7f8f3' },
		],
	},
	typography: {
		roles: [
			{ id: 'primary', label: 'Primary', family: 'Space Grotesk', fallback: 'sans-serif', weight: 700, style: 'normal', letterSpacing: '-0.04em', textTransform: 'none', lineHeight: 1.01 },
			{ id: 'body', label: 'Body', family: 'Rubik', fallback: 'sans-serif', weight: 400, style: 'normal', letterSpacing: '0', textTransform: 'none', lineHeight: 1.68 },
			{ id: 'secondary', label: 'Secondary', family: 'Space Mono', fallback: 'monospace', weight: 400, style: 'normal', letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.49 },
		],
		stylesheetUrls: [
			'//pxgcdn.com/fonts/quentin/stylesheet.css',
			'https://fonts.googleapis.com/css2?family=Rubik&display=swap',
		],
	},
	spacing: {
		metrics: [
			{ id: 'container', label: 'Container', value: 70, formatted: '70', normalized: 0.25 },
			{ id: 'inset', label: 'Inset', value: 180, formatted: '180', normalized: 0.4 },
			{ id: 'rhythm', label: 'Rhythm', value: 1, formatted: '1×', normalized: 0.5 },
		],
	},
};

describe( 'Style Manager preview data boundary', () => {
	afterEach( () => {
		apiFetch.mockReset();
		document.querySelectorAll( 'link[data-pixassist-style-preview-font]' ).forEach( ( node ) => node.remove() );
	} );

	test( 'normalizes only the supported descriptor contract', () => {
		expect( normalizePreviewDescriptor( {
			schemaVersion: 1,
			path: '/style_manager/v1/design-system-preview',
			extra: 'ignored',
		} ) ).toEqual( {
			schemaVersion: 1,
			path: '/style_manager/v1/design-system-preview',
		} );

		expect( normalizePreviewDescriptor( { schemaVersion: 2, path: '/style_manager/v2/design-system-preview' } ) ).toBeNull();
		expect( normalizePreviewDescriptor( { schemaVersion: 1, path: 'https://evil.test/payload' } ) ).toBeNull();
	} );

	test( 'normalizes the complete payload and preserves canonical role order', () => {
		const normalized = normalizePreviewPayload( completePayload );

		expect( normalized.revision ).toBe( 'd966cb0b71c64cb0' );
		expect( normalized.typography.roles.map( ( role ) => role.id ) ).toEqual( [ 'primary', 'body', 'secondary' ] );
		expect( normalized.typography.roles.map( ( role ) => role.label ) ).toEqual( [ 'Primary', 'Body', 'Secondary' ] );
		expect( normalized.spacing.metrics.map( ( metric ) => metric.normalized ) ).toEqual( [ 0.25, 0.4, 0.5 ] );
		expect( normalized.colors.samples ).toHaveLength( 4 );
	} );

	test( 'drops malformed sections without discarding valid siblings', () => {
		const payload = JSON.parse( JSON.stringify( completePayload ) );
		payload.spacing.metrics[ 1 ].normalized = 4;
		payload.typography.roles[ 2 ].id = 'action';

		const normalized = normalizePreviewPayload( payload );

		expect( normalized.colors ).not.toBeNull();
		expect( normalized.typography ).toBeNull();
		expect( normalized.spacing ).toBeNull();
	} );

	test( 'rejects invalid top-level responses and unsafe CSS primitives', () => {
		const payload = JSON.parse( JSON.stringify( completePayload ) );
		payload.typography.roles[ 0 ].fallback = 'url(javascript:alert(1))';
		payload.colors.samples[ 0 ].surface = 'red;display:none';

		expect( normalizePreviewPayload( { ...completePayload, schemaVersion: 2 } ) ).toBeNull();
		expect( normalizePreviewPayload( payload ).typography ).toBeNull();
		expect( normalizePreviewPayload( payload ).colors ).toBeNull();
	} );

	test( 'loads each safe HTTP stylesheet once and rejects unsafe protocols', () => {
		const links = ensurePreviewFontStylesheets( [
			'javascript:alert(1)',
			'data:text/css,body{}',
			'https://fonts.example.test/design-system.css',
			'https://fonts.example.test/design-system.css',
		] );

		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ].href ).toBe( 'https://fonts.example.test/design-system.css' );
		expect( document.querySelectorAll( 'link[data-pixassist-style-preview-font]' ) ).toHaveLength( 1 );
		expect( ensurePreviewFontStylesheets( [ 'https://fonts.example.test/design-system.css' ] ) ).toHaveLength( 1 );
		expect( document.querySelectorAll( 'link[data-pixassist-style-preview-font]' ) ).toHaveLength( 1 );
	} );

	test( 'requests the advertised path and rejects malformed responses', async () => {
		apiFetch.mockResolvedValueOnce( completePayload );

		await expect( requestDesignSystemPreview( {
			schemaVersion: 1,
			path: '/style_manager/v1/design-system-preview',
		} ) ).resolves.toEqual( normalizePreviewPayload( completePayload ) );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/style_manager/v1/design-system-preview',
			signal: undefined,
		} );

		apiFetch.mockResolvedValueOnce( { schemaVersion: 2 } );
		await expect( requestDesignSystemPreview( {
			schemaVersion: 1,
			path: '/style_manager/v1/design-system-preview',
		} ) ).rejects.toThrow( 'Invalid Style Manager preview response.' );
	} );
} );
