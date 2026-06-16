/**
 * Deep-linkable tab routing via the URL `?tab=` query arg + the History API.
 *
 * The active tab is reflected in the URL so tabs are deep-linkable and the browser back/forward
 * buttons work. An unknown/absent `?tab=` resolves to the provided default.
 */
import { useState, useEffect, useCallback } from '@wordpress/element';

function readTabFromUrl() {
	const params = new URLSearchParams( window.location.search );

	return params.get( 'tab' ) || '';
}

/**
 * @param {string[]} validIds   Ids of the currently visible tabs.
 * @param {string}   defaultTab Tab to fall back to when the URL tab is missing/unknown.
 *
 * @return {[string, Function]} The active tab id and a navigate( id ) setter.
 */
export function useTabRouting( validIds, defaultTab ) {
	const key = validIds.join( ',' );

	const resolve = useCallback(
		( id ) => ( id && validIds.indexOf( id ) !== -1 ? id : defaultTab ),
		[ key, defaultTab ]
	);

	const [ active, setActive ] = useState( () => resolve( readTabFromUrl() ) );

	useEffect( () => {
		// Keep state in sync with the URL the user arrived at / navigated to.
		setActive( resolve( readTabFromUrl() ) );

		const onPopState = () => setActive( resolve( readTabFromUrl() ) );
		window.addEventListener( 'popstate', onPopState );

		return () => window.removeEventListener( 'popstate', onPopState );
	}, [ resolve ] );

	const navigate = useCallback(
		( id ) => {
			const next = resolve( id );
			setActive( next );

			const params = new URLSearchParams( window.location.search );
			if ( next ) {
				params.set( 'tab', next );
			} else {
				params.delete( 'tab' );
			}
			window.history.pushState( {}, '', window.location.pathname + '?' + params.toString() );
		},
		[ resolve ]
	);

	return [ active, navigate ];
}
