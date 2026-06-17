/**
 * Shown when a server-visible tab has no React component registered yet (e.g. a tab declared by a
 * companion whose bundle didn't bind a component). Keeps the shell robust instead of blank.
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '@wordpress/components';

export function Placeholder( { tab } ) {
	return createElement(
		Card,
		{ className: 'pixelgrade-admin-hub__placeholder' },
		createElement(
			CardBody,
			null,
			createElement( 'h2', null, ( tab && ( tab.label || tab.id ) ) || __( 'Pixelgrade Design', 'pixelgrade_assistant' ) ),
			createElement( 'p', null, __( 'This section is not available yet.', 'pixelgrade_assistant' ) )
		)
	);
}
