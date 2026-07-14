import { createElement, createRoot, flushSync } from '@wordpress/element';

import { GetStartedCard, isAutomaticSetupPlugin } from './GetStartedCard';

describe( 'Get started — default theme setup', () => {
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
			( button ) => 'Install the essentials' === button.textContent
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
			( button ) => 'Install the essentials' === button.textContent
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
			( button ) => 'Install the essentials' === button.textContent
		);
		primary.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
		await Promise.resolve();
		await Promise.resolve();

		expect( window.setTimeout ).toHaveBeenCalledWith( expect.any( Function ), 700 );
		window.setTimeout = timeout;
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
