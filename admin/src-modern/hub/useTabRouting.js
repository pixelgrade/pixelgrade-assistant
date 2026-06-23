/**
 * Deep-linkable tab routing via the URL `?tab=` query arg + the History API.
 *
 * The active tab is reflected in the URL so tabs are deep-linkable and the browser back/forward
 * buttons work. An unknown/absent `?tab=` resolves to the provided default. Legacy aliases can
 * resolve old tab ids to current tabs.
 */
import { useState, useEffect, useCallback } from '@wordpress/element';

function readTabFromUrl() {
	const params = new URLSearchParams( window.location.search );
	const tab = params.get( 'tab' ) || '';

	if ( tab ) {
		return tab;
	}

	return 'plus' === params.get( 'section' ) ? 'account' : '';
}

/**
 * @param {string[]} validIds   Ids of the currently visible tabs.
 * @param {string}   defaultTab Tab to fall back to when the URL tab is missing/unknown.
 * @param {Object}   aliases    Legacy tab ids mapped to current tab ids.
 *
 * @return {[string, Function]} The active tab id and a navigate( id ) setter.
 */
export function useTabRouting( validIds, defaultTab, aliases = {} ) {
	const key = validIds.join( ',' );
	const aliasKey = Object.keys( aliases )
		.sort()
		.map( ( alias ) => alias + ':' + aliases[ alias ] )
		.join( ',' );

	const resolve = useCallback(
		( id ) => {
			const target = id && aliases[ id ] ? aliases[ id ] : id;

			return target && validIds.indexOf( target ) !== -1 ? target : defaultTab;
		},
		[ key, defaultTab, aliasKey ]
	);

	const [ active, setActive ] = useState( () => resolve( readTabFromUrl() ) );

	const canonicalizeAlias = useCallback(
		( id ) => {
			if ( ! id || ! aliases[ id ] || aliases[ id ] !== resolve( id ) ) {
				return;
			}

			const params = new URLSearchParams( window.location.search );
			params.set( 'tab', aliases[ id ] );

			if ( 'account-license' === id && 'account' === aliases[ id ] && ! params.get( 'section' ) ) {
				params.set( 'section', 'plus' );
			}

			window.history.replaceState( {}, '', window.location.pathname + '?' + params.toString() );
		},
		[ resolve, aliasKey ]
	);

	useEffect( () => {
		// Keep state in sync with the URL the user arrived at / navigated to.
		const requested = readTabFromUrl();
		setActive( resolve( requested ) );
		canonicalizeAlias( requested );

		const onPopState = () => {
			const next = readTabFromUrl();
			setActive( resolve( next ) );
			canonicalizeAlias( next );
		};
		window.addEventListener( 'popstate', onPopState );

		return () => window.removeEventListener( 'popstate', onPopState );
	}, [ resolve, canonicalizeAlias ] );

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
			if ( 'account' !== next ) {
				params.delete( 'section' );
			}
			window.history.pushState( {}, '', window.location.pathname + '?' + params.toString() );
		},
		[ resolve ]
	);

	return [ active, navigate ];
}
