import { createElement, createRoot, flushSync } from '@wordpress/element';

import { GetStartedCard, isAutomaticSetupPlugin } from './GetStartedCard';
import { importStarter } from './StarterSites';

// Partial mock: the card reuses the real Starter Sites helpers (data/copy/progress) but the import
// orchestrator itself is stubbed so tests can observe the explicit-confirm invariant.
jest.mock( './StarterSites', () => ( {
	...jest.requireActual( './StarterSites' ),
	importStarter: jest.fn(),
} ) );

describe( 'Get started — default theme setup', () => {
	let container;
	let root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		importStarter.mockReset();
		window.fetch = jest.fn().mockResolvedValue( { ok: true } );
		window.wp = {
			updates: {
				installTheme: jest.fn(),
				maybeRequestFilesystemCredentials: jest.fn(),
			},
		};
		window.pixelgradePlugins = { plugins: [] };
		window.pixelgradeOverview = {
			onboarding: {
				show: true,
				steps: [
					{
						id: 'theme',
						title: 'Install and activate Anima LT',
						description: 'Start with the free Pixelgrade theme.',
						url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=plugins',
						done: false,
						optional: false,
					},
					{
						id: 'plugins',
						title: 'Install recommended plugins',
						description: 'Add the plugins this theme is designed to use.',
						url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=plugins',
						done: false,
						optional: false,
					},
				],
				themeSetup: {
					slug: 'anima-lt',
					name: 'Anima LT',
					status: 'missing',
					isInstalled: false,
					isActive: false,
					activateUrl: 'https://example.test/wp-admin/themes.php?action=activate&stylesheet=anima-lt&_wpnonce=test',
				},
			},
		};
	} );

	afterEach( () => {
		flushSync( () => root.unmount() );
		container.remove();
		delete window.pixelgradeOverview;
		delete window.pixelgradeStarterSites;
		delete window.pixelgradePlugins;
		delete window.fetch;
		delete window.wp;
	} );

	test( 'explains exactly what the essentials action installs', () => {
		window.pixelgradeOverview.onboarding.steps.push( {
			id: 'starter',
			title: 'Choose a starter site',
			url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
			done: false,
			optional: false,
		} );

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const primary = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Set up my site' === button.textContent
		);

		expect( primary ).toBeDefined();
		expect( container.textContent ).toContain(
			'Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager. You’ll choose a starter site next.'
		);
	} );

	test( 'does not promise a starter choice when no starter catalog is available', () => {
		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		expect( container.textContent ).toContain(
			'Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager.'
		);
		expect( container.textContent ).not.toContain( 'You’ll choose a starter site next.' );
	} );

	test( 'installs Anima LT before continuing with the remaining setup tasks', () => {
		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const primary = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Set up my site' === button.textContent
		);

		flushSync( () => {
			primary.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		} );

		expect( window.wp.updates.installTheme ).toHaveBeenCalledWith(
			expect.objectContaining( { slug: 'anima-lt' } )
		);
	} );

	test( 'describes the fixed essential set without claiming every item is missing', () => {
		window.pixelgradeOverview.onboarding.steps[ 0 ].done = true;
		window.pixelgradeOverview.onboarding.steps.push( {
			id: 'starter',
			title: 'Choose a starter site',
			url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
			done: false,
			optional: false,
		} );

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		expect( container.textContent ).toContain(
			'Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager. You’ll choose a starter site next.'
		);
	} );

	test( 'links to the chooser when a starter remains after essentials are ready', () => {
		window.pixelgradeOverview.onboarding.steps = [
			{
				id: 'theme',
				title: 'Install and activate Anima LT',
				done: true,
				optional: false,
			},
			{
				id: 'plugins',
				title: 'Install recommended plugins',
				done: true,
				optional: false,
			},
			{
				id: 'starter',
				title: 'Choose a starter site',
				url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
				done: false,
				optional: false,
			},
		];

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const chooser = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => 'Choose a starter site' === link.textContent
		);

		expect( chooser ).toBeDefined();
		expect( chooser.href ).toBe(
			'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites'
		);
		expect( window.wp.updates.installTheme ).not.toHaveBeenCalled();
	} );

	test( 'excludes external companion hand-offs from automatic setup', () => {
		expect( isAutomaticSetupPlugin( {
			slug: 'pixelgrade-plus',
			status: 'missing',
			sourceType: 'external-action',
			actionType: 'external',
		} ) ).toBe( false );
		expect( isAutomaticSetupPlugin( {
			slug: 'nova-blocks',
			status: 'missing',
			sourceType: 'repo',
		} ) ).toBe( true );
	} );

	test( 'refreshes after a failed setup attempt so retry uses current server state', async () => {
		window.pixelgradeOverview.onboarding.steps[ 0 ].done = true;
		window.pixelgradePlugins.plugins = [ {
			slug: 'nova-blocks',
			name: 'Nova Blocks',
			status: 'missing',
			isActive: false,
			sourceType: 'repo',
		} ];
		window.wp.updates.installPlugin = jest.fn( ( args ) => args.error() );
		const timeout = window.setTimeout;
		window.setTimeout = jest.fn();

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const primary = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Set up my site' === button.textContent
		);
		primary.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		await Promise.resolve();
		await Promise.resolve();

		expect( window.setTimeout ).toHaveBeenCalledWith( expect.any( Function ), 700 );
		window.setTimeout = timeout;
	} );

	test( 'shows the locked starter step up front, with no per-step actions', () => {
		window.pixelgradeOverview.onboarding.steps.push( {
			id: 'starter',
			title: 'Choose a starter site',
			description: 'Unlocks after Anima LT is installed.',
			url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
			done: false,
			optional: false,
			locked: true,
		} );

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		expect( container.textContent ).toContain( '0 of 3 done' );
		expect( container.textContent ).toContain( 'Choose a starter site' );
		expect( container.textContent ).toContain( 'Unlocks after Anima LT is installed.' );
		expect( container.textContent ).toContain( 'You’ll choose a starter site next.' );

		// The funnel has ONE action: the primary CTA. No per-step "Open" buttons, no starter link.
		const openActions = Array.from( container.querySelectorAll( 'a, button' ) ).filter(
			( el ) => 'Open' === el.textContent
		);
		expect( openActions ).toHaveLength( 0 );
		const starterAction = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => link.href.indexOf( 'tab=starter-sites' ) !== -1
		);
		expect( starterAction ).toBeUndefined();
	} );

	function setUpChooseMode() {
		window.pixelgradeOverview.onboarding.steps[ 0 ].done = true;
		window.pixelgradeOverview.onboarding.steps[ 1 ].done = true;
		window.pixelgradeOverview.onboarding.steps.push( {
			id: 'starter',
			title: 'Choose a starter site',
			url: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
			done: false,
			optional: false,
			locked: false,
		} );
		window.pixelgradeOverview.onboarding.mode = 'choose';
		window.pixelgradeOverview.onboarding.starterPicker = {
			ids: [ 'felt-lt', 'julia-lt', 'pile-lt' ],
			browseUrl: 'https://example.test/wp-admin/admin.php?page=pixelgrade&tab=starter-sites',
			browseLabel: 'Browse all designs',
			startLabel: 'Start with this design',
			confirmBody: 'Import everything from %s? This adds its content, layouts, menus, and design to this site.',
			confirmLabel: 'Import full site',
			cancelLabel: 'Cancel',
		};
		window.pixelgradeStarterSites = {
			starters: [
				{ id: 'felt-lt', title: 'Felt LT', image: '' },
				{ id: 'julia-lt', title: 'Julia LT', image: '' },
				{ id: 'pile-lt', title: 'Pile LT', image: '' },
			],
		};
	}

	test( 'inlines the top starter designs once only the starter choice remains', () => {
		setUpChooseMode();

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const startButtons = Array.from( container.querySelectorAll( 'button' ) ).filter(
			( button ) => 'Start with this design' === button.textContent
		);
		expect( startButtons ).toHaveLength( 3 );
		const browse = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => 'Browse all designs' === link.textContent
		);
		expect( browse ).toBeDefined();
		// The picker replaces the primary CTA — no essentials button, no chooser link.
		expect(
			Array.from( container.querySelectorAll( 'a, button' ) ).find(
				( el ) => 'Choose a starter site' === el.textContent
			)
		).toBeUndefined();
		expect( importStarter ).not.toHaveBeenCalled();
	} );

	test( 'imports a picked starter only after the in-card confirm', async () => {
		setUpChooseMode();
		importStarter.mockResolvedValue();
		const originalTimeout = window.setTimeout;
		window.setTimeout = jest.fn();

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const firstStart = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Start with this design' === button.textContent
		);
		flushSync( () => {
			firstStart.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		} );

		// Picking is not importing: the confirm must come first (never-auto-import invariant).
		expect( importStarter ).not.toHaveBeenCalled();
		expect( container.textContent ).toContain( 'Import everything from Felt LT?' );

		const confirm = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Import full site' === button.textContent
		);
		confirm.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		for ( let i = 0; i < 6; i++ ) {
			// eslint-disable-next-line no-await-in-loop
			await Promise.resolve();
		}

		expect( importStarter ).toHaveBeenCalledTimes( 1 );
		expect( importStarter.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( { id: 'felt-lt' } )
		);
		expect( window.setTimeout ).toHaveBeenCalledWith( expect.any( Function ), 700 );

		window.setTimeout = originalTimeout;
	} );

	test( 'cancelling the confirm keeps the choice open and imports nothing', () => {
		setUpChooseMode();

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const firstStart = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Start with this design' === button.textContent
		);
		flushSync( () => {
			firstStart.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		} );
		const cancel = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => 'Cancel' === button.textContent
		);
		flushSync( () => {
			cancel.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		} );

		expect( container.textContent ).not.toContain( 'Import everything from Felt LT?' );
		expect( importStarter ).not.toHaveBeenCalled();
	} );

	test( 'hands a missing multisite theme to Network Admin', () => {
		window.pixelgradeOverview.onboarding.themeSetup = {
			...window.pixelgradeOverview.onboarding.themeSetup,
			isMultisite: true,
			canAutoInstall: false,
			manageUrl: 'https://network.example.test/wp-admin/network/theme-install.php?search=anima-lt',
		};

		flushSync( () => {
			root.render( createElement( GetStartedCard ) );
		} );

		const action = Array.from( container.querySelectorAll( 'a' ) ).find(
			( link ) => 'Open Network Themes' === link.textContent
		);
		expect( action ).toBeDefined();
		expect( action.href ).toBe(
			'https://network.example.test/wp-admin/network/theme-install.php?search=anima-lt'
		);
		expect( container.textContent ).toContain(
			'Install and enable Anima LT in Network Admin, then return here to continue setup.'
		);
	} );
} );
