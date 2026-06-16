/**
 * The free Account tab — host-owned pixelgrade.com connection (#45).
 *
 * Presentational only: account identity, action URLs, nonce, notices, and copy come from the
 * server-assembled `window.pixelgradeAccount` payload. OAuth tokens/secrets are never localized.
 *
 * No JSX; keep externals compatible with WordPress 5.9.
 */
import { createElement, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button, Notice, Flex, FlexItem } from '@wordpress/components';

const DEFAULT_ACCOUNT = {
	account: { is_connected: false },
	actions: {},
	notice: null,
	oauth: { isConfigured: false },
	copy: {},
};

function getAccountData() {
	if ( typeof window !== 'undefined' && window.pixelgradeAccount ) {
		return window.pixelgradeAccount;
	}

	return DEFAULT_ACCOUNT;
}

function renderNotice( notice ) {
	if ( ! notice || ! notice.message ) {
		return null;
	}

	return createElement(
		Notice,
		{
			status: notice.type || 'info',
			isDismissible: false,
		},
		notice.message
	);
}

function renderAvatar( account ) {
	if ( ! account.avatar_url ) {
		return null;
	}

	return createElement( 'img', {
		src: account.avatar_url,
		alt: '',
		width: 48,
		height: 48,
		style: { borderRadius: '50%', display: 'block' },
	} );
}

function renderAccountMeta( account ) {
	const name = account.display_name || account.user_login || account.email || __( 'Connected account', 'pixelgrade_assistant' );
	const rows = [
		account.email || '',
		account.user_login
			? sprintf(
					/* translators: %s: pixelgrade.com user login. */
					__( '@%s', 'pixelgrade_assistant' ),
					account.user_login
			  )
			: '',
		account.pixelgrade_user_id
			? sprintf(
					/* translators: %d: pixelgrade.com user id. */
					__( 'Pixelgrade ID %d', 'pixelgrade_assistant' ),
					account.pixelgrade_user_id
			  )
			: '',
		account.connected_at
			? sprintf(
					/* translators: %s: account connection date. */
					__( 'Connected %s', 'pixelgrade_assistant' ),
					account.connected_at
			  )
			: '',
	].filter( Boolean );

	return createElement(
		'div',
		null,
		createElement( 'h2', { style: { margin: 0 } }, name ),
		rows.map( ( row, index ) =>
			createElement( 'p', { key: index, style: { margin: '4px 0 0', color: '#757575' } }, row )
		)
	);
}

function renderDisconnectForm( actions, label ) {
	if ( ! actions.disconnectUrl || ! actions.disconnectAction || ! actions.disconnectNonce ) {
		return null;
	}

	return createElement(
		'form',
		{ method: 'post', action: actions.disconnectUrl, style: { marginTop: '16px' } },
		createElement( 'input', {
			type: 'hidden',
			name: 'action',
			value: actions.disconnectAction,
		} ),
		createElement( 'input', {
			type: 'hidden',
			name: '_wpnonce',
			value: actions.disconnectNonce,
		} ),
		createElement(
			Button,
			{
				type: 'submit',
				variant: 'secondary',
				isDestructive: true,
			},
			label || __( 'Disconnect', 'pixelgrade_assistant' )
		)
	);
}

function renderConnected( data ) {
	const account = data.account || {};
	const copy = data.copy || {};
	const actions = data.actions || {};
	const avatar = renderAvatar( account );

	return createElement(
		Card,
		{ className: 'pixelgrade-account pixelgrade-account--connected' },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.title || __( 'Pixelgrade account', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			createElement(
				Flex,
				{ align: 'flex-start', gap: 4, justify: 'space-between' },
				createElement(
					FlexItem,
					null,
					createElement(
						Flex,
						{ align: 'flex-start', gap: 3, expanded: false },
						avatar ? createElement( FlexItem, null, avatar ) : null,
						createElement( FlexItem, null, renderAccountMeta( account ) )
					)
				),
				createElement( FlexItem, null, renderDisconnectForm( actions, copy.disconnectLabel ) )
			),
			copy.connectedDescription
				? createElement( 'p', { style: { margin: '16px 0 0', color: '#555' } }, copy.connectedDescription )
				: null
		)
	);
}

function renderDisconnected( data ) {
	const copy = data.copy || {};
	const actions = data.actions || {};
	const oauth = data.oauth || {};
	const canConnect = Boolean( oauth.isConfigured && actions.connectUrl );

	return createElement(
		Card,
		{ className: 'pixelgrade-account pixelgrade-account--disconnected' },
		createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.title || __( 'Pixelgrade account', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			copy.disconnectedDescription
				? createElement( 'p', { style: { marginTop: 0 } }, copy.disconnectedDescription )
				: null,
			canConnect
				? createElement(
						Button,
						{
							href: actions.connectUrl,
							variant: 'primary',
						},
						copy.connectLabel || __( 'Connect account', 'pixelgrade_assistant' )
				  )
				: createElement(
						Fragment,
						null,
						createElement(
							Notice,
							{
								status: 'warning',
								isDismissible: false,
							},
							copy.notConfiguredLabel || __( 'Account connection is not configured.', 'pixelgrade_assistant' )
						),
						createElement(
							Button,
							{
								variant: 'primary',
								disabled: true,
							},
							copy.connectLabel || __( 'Connect account', 'pixelgrade_assistant' )
						)
				  )
		)
	);
}

export function Account() {
	const data = getAccountData();
	const account = data.account || {};

	return createElement(
		Fragment,
		null,
		renderNotice( data.notice ),
		account.is_connected ? renderConnected( data ) : renderDisconnected( data )
	);
}
