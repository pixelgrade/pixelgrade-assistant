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
 * Normalize an alias target: either a plain tab-id string, or `{ tab, section }` when the legacy id
 * maps to a section inside a merged tab (e.g. `layouts` → the Design Library's layouts section).
 *
 * @param {string|Object} value Alias target as provided by the server.
 *
 * @return {{tab: string, section: string}} Normalized target.
 */
function normalizeAliasTarget( value ) {
	if ( value && 'object' === typeof value ) {
		return {
			tab: 'string' === typeof value.tab ? value.tab : '',
			section: 'string' === typeof value.section ? value.section : '',
		};
	}

	return { tab: 'string' === typeof value ? value : '', section: '' };
}

/**
 * @param {string[]} validIds   Ids of the currently visible tabs.
 * @param {string}   defaultTab Tab to fall back to when the URL tab is missing/unknown.
 * @param {Object}   aliases    Legacy tab ids mapped to current tab ids (string or {tab, section}).
 *
 * @return {[string, Function]} The active tab id and a navigate( id ) setter.
 */
export function useTabRouting( validIds, defaultTab, aliases = {} ) {
	const key = validIds.join( ',' );
	const aliasKey = JSON.stringify( aliases );

	const resolve = useCallback(
		( id ) => {
			const target = id && aliases[ id ] ? normalizeAliasTarget( aliases[ id ] ).tab : id;

			return target && validIds.indexOf( target ) !== -1 ? target : defaultTab;
		},
		[ key, defaultTab, aliasKey ]
	);

	const [ active, setActive ] = useState( () => resolve( readTabFromUrl() ) );

	const canonicalizeAlias = useCallback(
		( id ) => {
			if ( ! id || ! aliases[ id ] ) {
				return;
			}

			const target = normalizeAliasTarget( aliases[ id ] );
			if ( target.tab !== resolve( id ) ) {
				return;
			}

			const params = new URLSearchParams( window.location.search );
			params.set( 'tab', target.tab );

			if ( target.section && ! params.get( 'section' ) ) {
				params.set( 'section', target.section );
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
