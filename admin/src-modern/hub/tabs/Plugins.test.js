import { createElement, createRoot, flushSync } from '@wordpress/element';
import { addFilter, removeAllFilters } from '@wordpress/hooks';

import { Plugins } from './Plugins';

const FILTER = 'pixelgrade.adminHub.setupSections';
const PLUGIN_ROWS_FILTER = 'pixelgrade.adminHub.setupPluginRows';
const NAMESPACE = 'pixelgrade-assistant/test-setup-sections';

function FirstSection( props ) {
	return createElement( 'p', { className: 'first-section' }, 'first:' + props.sectionId );
}

function SecondSection() {
	return createElement( 'p', { className: 'second-section' }, 'second' );
}

function AdvancedFilteringRow( props ) {
	return createElement(
		'p',
		{ className: 'advanced-filtering-row' },
		'row:' + props.sectionId + ':' + props.setupData.marker
	);
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

describe( 'Setup tab — contributed Recommended plugin rows', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		window.pixelgradePlugins = {
			plugins: [],
			copy: { empty: 'No recommended plugins.' },
			readiness: {},
			marker: 'host-data',
		};
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
		removeAllFilters( PLUGIN_ROWS_FILTER );
		delete window.pixelgradePlugins;
	} );

	function renderPlugins() {
		flushSync( () => {
			root.render( createElement( Plugins ) );
		} );

		return container;
	}

	test( 'renders a companion-owned row inside the Recommended plugins list and suppresses the empty notice', () => {
		addFilter( PLUGIN_ROWS_FILTER, NAMESPACE, ( rows ) => [
			...rows,
			{ id: 'advanced-filtering', order: 30, component: AdvancedFilteringRow },
		] );

		const result = renderPlugins();
		const row = result.querySelector( '[data-setup-plugin-row="advanced-filtering"]' );

		expect( row ).not.toBeNull();
		expect( row.id ).toBe( 'pixelgrade-setup-plugin-row-advanced-filtering' );
		expect( row.style.marginTop ).toBe( '0px' );
		expect( row.style.marginBottom ).toBe( '12px' );
		expect( row.querySelector( '.advanced-filtering-row' ).textContent ).toBe(
			'row:advanced-filtering:host-data'
		);
		expect( result.textContent ).not.toContain( 'No recommended plugins.' );
		expect(
			result.querySelector( '.pixelgrade-plugins__intro' ).compareDocumentPosition( row ) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	test( 'normalizes order and drops malformed or duplicate plugin-row descriptors', () => {
		addFilter( PLUGIN_ROWS_FILTER, NAMESPACE, () => [
			{ id: '', component: AdvancedFilteringRow },
			{ id: 'bad-component', component: 'not-a-function' },
			{ id: ' Second Row! ', order: 20, component: SecondSection },
			{ id: 'advanced-filtering', order: 30, component: AdvancedFilteringRow },
			{ id: 'advanced-filtering', order: 1, component: SecondSection },
			null,
		] );

		const result = renderPlugins();
		const rows = result.querySelectorAll( '[data-setup-plugin-row]' );

		expect( rows ).toHaveLength( 2 );
		expect( rows[ 0 ].getAttribute( 'data-setup-plugin-row' ) ).toBe( 'secondrow' );
		expect( rows[ 1 ].getAttribute( 'data-setup-plugin-row' ) ).toBe( 'advanced-filtering' );
		expect( rows[ 1 ].querySelector( '.advanced-filtering-row' ) ).not.toBeNull();
		expect( rows[ 1 ].querySelector( '.second-section' ) ).toBeNull();
	} );
} );

describe( 'Setup tab — default theme setup', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		window.fetch = jest.fn().mockResolvedValue( { ok: true } );
		window.wp = {
			updates: {
				installTheme: jest.fn(),
				maybeRequestFilesystemCredentials: jest.fn(),
			},
		};
		window.pixelgradePlugins = {
			plugins: [],
			copy: {},
			themeSetup: {
				slug: 'anima-lt',
				name: 'Anima LT',
				status: 'missing',
				isInstalled: false,
				isActive: false,
				activateUrl: 'https://example.test/wp-admin/themes.php?action=activate&stylesheet=anima-lt&_wpnonce=test',
				installUrl: 'https://example.test/wp-admin/theme-install.php?search=anima-lt',
			},
			readiness: {
				copy: {
					issuesTitle: 'Needs attention',
					currentLabel: 'Current',
					expectedLabel: 'Recommended',
					whyLabel: 'Why it matters',
					blockedBadge: 'Blocker',
					pluginsTitle: 'Recommended plugins',
				},
				checks: [
					{
						id: 'theme',
						label: 'Active theme',
						status: 'blocked',
						value: 'Twenty Twenty-Five',
						expected: 'An active Pixelgrade theme',
						action: { label: 'Choose a theme', url: 'https://example.test/wp-admin/themes.php' },
					},
				],
			},
		};
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
		delete window.pixelgradePlugins;
		delete window.fetch;
		delete window.wp;
	} );

	test( 'starts the Anima LT install from the active-theme blocker', () => {
		flushSync( () => {
			root.render( createElement( Plugins ) );
		} );

		const action = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Install Anima LT' === button.textContent
		);

		expect( action ).toBeDefined();

		flushSync( () => {
			action.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		} );

		expect( window.wp.updates.installTheme ).toHaveBeenCalledWith(
			expect.objectContaining( { slug: 'anima-lt' } )
		);
	} );

	test( 'falls back to the theme-management link without theme capabilities', () => {
		window.pixelgradePlugins.themeSetup.canInstall = false;
		window.pixelgradePlugins.themeSetup.canActivate = false;

		flushSync( () => {
			root.render( createElement( Plugins ) );
		} );

		expect( Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Install Anima LT' === button.textContent
		) ).toBeUndefined();
		const fallback = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => 'Choose a theme' === link.textContent
		);
		expect( fallback ).toBeDefined();
		expect( fallback.href ).toBe( 'https://example.test/wp-admin/themes.php' );
	} );

	test( 'hands a missing multisite theme to Network Admin', () => {
		window.pixelgradePlugins.themeSetup.isMultisite = true;
		window.pixelgradePlugins.themeSetup.canAutoInstall = false;
		window.pixelgradePlugins.themeSetup.manageUrl =
			'https://network.example.test/wp-admin/network/theme-install.php?search=anima-lt';

		flushSync( () => {
			root.render( createElement( Plugins ) );
		} );

		const handoff = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => 'Open Network Themes' === link.textContent
		);
		expect( handoff ).toBeDefined();
		expect( handoff.href ).toBe(
			'https://network.example.test/wp-admin/network/theme-install.php?search=anima-lt'
		);
	} );
} );
