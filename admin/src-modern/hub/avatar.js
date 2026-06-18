/**
 * Shared account avatar renderer for the hub.
 *
 * Always renders something legible: the gravatar image when it loads, and a deterministic
 * initials placeholder underneath. If the image is missing or fails to load (e.g. no network to
 * gravatar.com), the image hides itself on error and the initials show through — no empty gray
 * circle. No React state, so it stays a plain createElement helper usable from any tab.
 */
import { createElement } from '@wordpress/element';

function getInitials( account ) {
	const source = ( account.display_name || account.user_login || account.email || '' ).trim();

	if ( ! source ) {
		return '?';
	}

	const parts = source.split( /[\s@._-]+/ ).filter( Boolean );

	if ( ! parts.length ) {
		return source.slice( 0, 2 ).toUpperCase();
	}

	if ( 1 === parts.length ) {
		return parts[ 0 ].slice( 0, 2 ).toUpperCase();
	}

	return ( parts[ 0 ][ 0 ] + parts[ parts.length - 1 ][ 0 ] ).toUpperCase();
}

export function renderAvatar( account, size = 48 ) {
	if ( ! account ) {
		return null;
	}

	const initials = getInitials( account );

	return createElement(
		'div',
		{
			'aria-hidden': true,
			style: {
				alignItems: 'center',
				background: '#dcdcde',
				borderRadius: '50%',
				color: '#50575e',
				display: 'flex',
				flex: '0 0 auto',
				fontSize: Math.round( size * 0.4 ) + 'px',
				fontWeight: 600,
				height: size + 'px',
				justifyContent: 'center',
				lineHeight: 1,
				overflow: 'hidden',
				position: 'relative',
				width: size + 'px',
			},
		},
		initials,
		account.avatar_url
			? createElement( 'img', {
					src: account.avatar_url,
					alt: '',
					width: size,
					height: size,
					// Reveal the initials underneath if the gravatar can't load.
					onError: ( event ) => {
						event.target.style.display = 'none';
					},
					style: {
						display: 'block',
						height: '100%',
						inset: 0,
						objectFit: 'cover',
						position: 'absolute',
						width: '100%',
					},
			  } )
			: null
	);
}
