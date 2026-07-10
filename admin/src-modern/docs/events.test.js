import {
	DOCS_EVENT_GUIDE_ACTION,
	DOCS_EVENT_OPEN_GUIDE,
	emitDocsGuideAction,
	openDocsGuide,
	registerDocsWindowListener,
	unregisterDocsWindowListener,
} from './events';

describe( 'companion guide events', () => {
	beforeEach( () => {
		window.__pixassistDocsListeners = 0;
	} );

	afterEach( () => {
		window.__pixassistDocsListeners = 0;
	} );

	test( 'attests delivery and rejects malformed guide payloads', () => {
		const listener = jest.fn();
		window.addEventListener( DOCS_EVENT_OPEN_GUIDE, listener );

		expect( openDocsGuide( { id: 'guide', content: '<p>Practice</p>' } ) ).toBe( false );

		registerDocsWindowListener();
		expect( openDocsGuide( { id: 7, content: '<p>Practice</p>' } ) ).toBe( false );
		expect( openDocsGuide( { id: 'guide', content: { html: '<p>Practice</p>' } } ) ).toBe( false );
		expect( listener ).not.toHaveBeenCalled();

		window.removeEventListener( DOCS_EVENT_OPEN_GUIDE, listener );
		unregisterDocsWindowListener();
	} );

	test( 'dispatches only normalized serializable descriptors', () => {
		const listener = jest.fn();
		window.addEventListener( DOCS_EVENT_OPEN_GUIDE, listener );
		registerDocsWindowListener();

		expect( openDocsGuide( {
			id: ' guide ',
			title: 'Practice',
			content: '<p>Trusted companion content</p>',
			actions: [
				{ id: 'remove', label: 'Remove', isDestructive: true, onClick: () => {} },
				{ id: 8, label: 'Invalid' },
			],
			extra: () => {},
		} ) ).toBe( true );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( listener.mock.calls[ 0 ][ 0 ].detail ).toEqual( {
			id: 'guide',
			title: 'Practice',
			content: '<p>Trusted companion content</p>',
			actions: [ { id: 'remove', label: 'Remove', isDestructive: true } ],
		} );

		window.removeEventListener( DOCS_EVENT_OPEN_GUIDE, listener );
		unregisterDocsWindowListener();
	} );

	test( 'dispatches guide actions with the owning guide id', () => {
		const listener = jest.fn();
		window.addEventListener( DOCS_EVENT_GUIDE_ACTION, listener );

		emitDocsGuideAction( 'guide', 'remove' );

		expect( listener.mock.calls[ 0 ][ 0 ].detail ).toEqual( {
			guideId: 'guide',
			actionId: 'remove',
		} );
		window.removeEventListener( DOCS_EVENT_GUIDE_ACTION, listener );
	} );
} );
