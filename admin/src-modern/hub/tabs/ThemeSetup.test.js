import { ensureThemeActive } from './ThemeSetup';

describe( 'Anima LT setup orchestration', () => {
	beforeEach( () => {
		window.fetch = jest.fn().mockResolvedValue( { ok: true } );
		window.wp = {
			updates: {
				installTheme: jest.fn(),
				maybeRequestFilesystemCredentials: jest.fn(),
			},
		};
	} );

	afterEach( () => {
		delete window.fetch;
		delete window.wp;
	} );

	test( 'activates an installed theme through the nonce-protected site URL', async () => {
		const activateUrl = 'https://example.test/wp-admin/themes.php?action=activate&stylesheet=anima-lt&_wpnonce=site';

		await ensureThemeActive( {
			slug: 'anima-lt',
			status: 'inactive',
			isInstalled: true,
			isActive: false,
			canActivate: true,
			activateUrl,
		} );

		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.fetch ).toHaveBeenCalledWith( activateUrl, { credentials: 'same-origin' } );
	} );

	test( 'installs then activates Anima LT on a single site', async () => {
		const coreActivateUrl = 'https://example.test/wp-admin/plugins.php?action=activate-theme';
		window.wp.updates.installTheme.mockImplementation( ( args ) => args.success( { activateUrl: coreActivateUrl } ) );

		await ensureThemeActive( {
			slug: 'anima-lt',
			status: 'missing',
			isInstalled: false,
			isActive: false,
			canInstall: true,
			canActivate: true,
			activateUrl: 'https://example.test/wp-admin/themes.php?action=activate&stylesheet=anima-lt&_wpnonce=site',
		} );

		expect( window.wp.updates.installTheme ).toHaveBeenCalledWith(
			expect.objectContaining( { slug: 'anima-lt' } )
		);
		expect( window.fetch ).toHaveBeenCalledWith( coreActivateUrl, { credentials: 'same-origin' } );
	} );

	test( 'hands missing multisite themes to Network Admin instead of cross-origin automation', async () => {
		await expect( ensureThemeActive( {
			slug: 'anima-lt',
			status: 'missing',
			isInstalled: false,
			isActive: false,
			isMultisite: true,
			canInstall: true,
			canActivate: true,
			manageUrl: 'https://network.example.test/wp-admin/network/theme-install.php?search=anima-lt',
		} ) ).rejects.toThrow( 'install_unavailable' );

		expect( window.wp.updates.installTheme ).not.toHaveBeenCalled();
		expect( window.fetch ).not.toHaveBeenCalled();
	} );

	test( 'does not attempt setup when the current user lacks theme capabilities', async () => {
		await expect(
			ensureThemeActive( {
				slug: 'anima-lt',
				status: 'missing',
				isInstalled: false,
				isActive: false,
				canInstall: false,
				canActivate: false,
			} )
		).rejects.toThrow( 'install_unavailable' );

		expect( window.wp.updates.installTheme ).not.toHaveBeenCalled();
		expect( window.fetch ).not.toHaveBeenCalled();
	} );
} );
