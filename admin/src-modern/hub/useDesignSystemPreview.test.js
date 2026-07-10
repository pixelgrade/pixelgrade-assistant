import { createDesignSystemPreviewSession } from './useDesignSystemPreview';

const descriptor = {
	schemaVersion: 1,
	path: '/style_manager/v1/design-system-preview',
};

const payload = {
	schemaVersion: 1,
	revision: 'd966cb0b71c64cb0',
	colors: { palette: { id: '1', label: 'Brand Primary' } },
	typography: {
		roles: [],
		stylesheetUrls: [ 'https://fonts.example.test/design-system.css' ],
	},
	spacing: null,
};

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise( ( onResolve, onReject ) => {
		resolve = onResolve;
		reject = onReject;
	} );

	return { promise, resolve, reject };
}

describe( 'design system preview session', () => {
	let visibilityState;

	beforeEach( () => {
		visibilityState = 'visible';
		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			get: () => visibilityState,
		} );
	} );

	test( 'requests on start, coalesces in-flight work, and deduplicates refreshes for two seconds', async () => {
		let now = 0;
		const first = deferred();
		const second = deferred();
		const request = jest.fn()
			.mockReturnValueOnce( first.promise )
			.mockReturnValueOnce( second.promise );
		const ensureFonts = jest.fn();
		const onPayload = jest.fn();
		const session = createDesignSystemPreviewSession( descriptor, {
			request,
			ensureFonts,
			onPayload,
			now: () => now,
			win: window,
			doc: document,
		} );

		const started = session.start();
		expect( request ).toHaveBeenCalledTimes( 1 );
		expect( session.refresh() ).toBe( started );

		first.resolve( payload );
		await started;

		expect( session.getPayload() ).toBe( payload );
		expect( onPayload ).toHaveBeenCalledWith( payload );
		expect( ensureFonts ).toHaveBeenCalledWith( payload.typography.stylesheetUrls, document );

		now = 1999;
		await expect( session.refresh() ).resolves.toBe( payload );
		expect( request ).toHaveBeenCalledTimes( 1 );

		now = 2000;
		const refreshed = session.refresh();
		expect( request ).toHaveBeenCalledTimes( 2 );
		second.resolve( { ...payload, revision: 'aaaaaaaaaaaaaaaa' } );
		await refreshed;
	} );

	test( 'refreshes when the page returns, only while visible, and preserves valid data on errors', async () => {
		let now = 0;
		const responses = [ deferred(), deferred(), deferred() ];
		const request = jest.fn()
			.mockReturnValueOnce( responses[ 0 ].promise )
			.mockReturnValueOnce( responses[ 1 ].promise )
			.mockReturnValueOnce( responses[ 2 ].promise );
		const onPayload = jest.fn();
		const session = createDesignSystemPreviewSession( descriptor, {
			request,
			onPayload,
			now: () => now,
			win: window,
			doc: document,
		} );

		const started = session.start();
		responses[ 0 ].resolve( payload );
		await started;

		now = 2500;
		window.dispatchEvent( new Event( 'pageshow' ) );
		expect( request ).toHaveBeenCalledTimes( 2 );
		const failedRefresh = session.refresh();
		responses[ 1 ].reject( new Error( 'Network unavailable' ) );
		await failedRefresh;

		expect( session.getPayload() ).toBe( payload );
		expect( onPayload ).toHaveBeenCalledTimes( 1 );

		now = 5000;
		visibilityState = 'hidden';
		document.dispatchEvent( new Event( 'visibilitychange' ) );
		expect( request ).toHaveBeenCalledTimes( 2 );

		visibilityState = 'visible';
		document.dispatchEvent( new Event( 'visibilitychange' ) );
		expect( request ).toHaveBeenCalledTimes( 3 );
		responses[ 2 ].resolve( payload );
		await Promise.resolve();
	} );

	test( 'aborts pending work and removes refresh listeners when stopped', () => {
		let now = 0;
		const pending = deferred();
		const request = jest.fn().mockReturnValue( pending.promise );
		const session = createDesignSystemPreviewSession( descriptor, {
			request,
			now: () => now,
			win: window,
			doc: document,
		} );

		session.start();
		const signal = request.mock.calls[ 0 ][ 1 ].signal;
		session.stop();

		expect( signal.aborted ).toBe( true );
		now = 3000;
		window.dispatchEvent( new Event( 'pageshow' ) );
		expect( request ).toHaveBeenCalledTimes( 1 );
	} );
} );
