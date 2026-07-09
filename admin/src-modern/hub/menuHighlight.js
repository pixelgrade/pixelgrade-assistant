/**
 * Keep the WP sidebar submenu highlight in sync with the hub's client-side tab switches.
 *
 * The top-level Pixelgrade Design menu registers one submenu item per primary tab (deep-link
 * slugs like `admin.php?page=pixelgrade&tab=…`; the default tab reuses the bare page slug). WP
 * computes the `.current` classes server-side on page load only, so pushState tab switches would
 * leave the old item lit without this. Tabs with no submenu item (the More utilities) simply
 * clear the highlight.
 */
import { useEffect } from '@wordpress/element';

const MENU_ID = 'toplevel_page_pixelgrade';
// Matches the hub page param without also matching e.g. page=pixelgrade_assistant-setup-wizard.
const HUB_PAGE_PATTERN = /[?&]page=pixelgrade(?:&|$)/;
const TAB_PATTERN = /[?&]tab=([a-z0-9_-]+)/;

export function useMenuHighlight( activeId, defaultTab ) {
	useEffect( () => {
		const menu = document.getElementById( MENU_ID );
		if ( ! menu ) {
			return;
		}

		menu.querySelectorAll( '.wp-submenu a' ).forEach( ( link ) => {
			const href = link.getAttribute( 'href' ) || '';
			if ( ! HUB_PAGE_PATTERN.test( href ) ) {
				return;
			}

			const match = TAB_PATTERN.exec( href );
			const isCurrent = ( match ? match[ 1 ] : defaultTab ) === activeId;

			link.classList.toggle( 'current', isCurrent );
			if ( link.parentElement && 'LI' === link.parentElement.tagName ) {
				link.parentElement.classList.toggle( 'current', isCurrent );
			}
			if ( isCurrent ) {
				link.setAttribute( 'aria-current', 'page' );
			} else {
				link.removeAttribute( 'aria-current' );
			}
		} );
	}, [ activeId, defaultTab ] );
}
