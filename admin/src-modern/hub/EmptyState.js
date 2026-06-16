/**
 * Shown when no tabs are registered yet (the shell ships in #43 before the Overview tab #44 and Plus
 * tabs #56). During the transition the classic dashboard stays reachable, so we bridge to it.
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '@wordpress/components';

export function EmptyState( { classicUrl } ) {
	const children = [
		createElement( 'h2', { key: 'h' }, __( 'Pixelgrade', 'pixelgrade_assistant' ) ),
		createElement(
			'p',
			{ key: 'p' },
			__( 'Your Pixelgrade tools will appear here.', 'pixelgrade_assistant' )
		),
	];

	if ( classicUrl ) {
		children.push(
			createElement(
				'p',
				{ key: 'a' },
				createElement(
					'a',
					{ href: classicUrl, className: 'button' },
					__( 'Open the classic dashboard', 'pixelgrade_assistant' )
				)
			)
		);
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-admin-hub__empty' },
		createElement( CardBody, null, children )
	);
}
