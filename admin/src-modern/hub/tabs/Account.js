/**
 * The free Account tab — host-owned pixelgrade.com connection (#45).
 *
 * Presentational only: account identity, action URLs, nonce, notices, and copy come from the
 * server-assembled `window.pixelgradeAccount` payload. OAuth tokens/secrets are never localized.
 *
 * No JSX; keep externals compatible with WordPress 5.9.
 */
import { createElement, Fragment, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button, Notice, Flex, FlexItem } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { renderAvatar } from '../avatar';

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

function sanitizeSectionId( value ) {
	return String( value || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' );
}

function getLinkedSection() {
	if ( 'undefined' === typeof window ) {
		return '';
	}

	const params = new URLSearchParams( window.location.search );
	const section = sanitizeSectionId( params.get( 'section' ) || '' );
	if ( section ) {
		return section;
	}

	return 'account-license' === params.get( 'tab' ) ? 'plus' : '';
}

function getAccountPanels( data ) {
	const panels = applyFilters( 'pixelgrade.adminHub.accountPanels', [], data );

	if ( ! Array.isArray( panels ) ) {
		return [];
	}

	return panels
		.map( ( panel, index ) => {
			if ( ! panel || 'object' !== typeof panel ) {
				return null;
			}

			const id = sanitizeSectionId( panel.id || '' );
			if ( ! id || ! panel.component ) {
				return null;
			}

			return {
				id,
				order: Number.isFinite( Number( panel.order ) ) ? Number( panel.order ) : 10 + index,
				component: panel.component,
			};
		} )
		.filter( Boolean )
		.sort( ( a, b ) => {
			if ( a.order === b.order ) {
				return a.id.localeCompare( b.id );
			}

			return a.order < b.order ? -1 : 1;
		} );
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

function renderAccountMeta( account ) {
	const name = account.display_name || account.user_login || account.email || __( 'Connected account', 'pixelgrade_assistant' );
	const textStyle = { overflowWrap: 'anywhere', wordBreak: 'break-word' };
	const rows = [ account.email || '' ].filter( Boolean );

	return createElement(
		'div',
		null,
		createElement( 'h2', { style: { margin: 0, ...textStyle } }, name ),
		rows.map( ( row, index ) =>
			createElement( 'p', { key: index, style: { margin: '4px 0 0', color: '#757575', ...textStyle } }, row )
		)
	);
}

function renderDisconnectForm( actions, label, variant = 'secondary' ) {
	if ( ! actions.disconnectUrl || ! actions.disconnectAction || ! actions.disconnectNonce ) {
		return null;
	}

	return createElement(
		'form',
		{ method: 'post', action: actions.disconnectUrl, style: { margin: 0 } },
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
				variant,
				isDestructive: true,
			},
			label || __( 'Disconnect account', 'pixelgrade_assistant' )
		)
	);
}

function renderConnected( data ) {
	const account = data.account || {};
	const copy = data.copy || {};
	const avatar = renderAvatar( account, 48 );

	return createElement(
		Card,
		{ className: 'pixelgrade-account pixelgrade-account--connected pixelgrade-account--operations' },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, copy.title || __( 'Pixelgrade account', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			createElement(
				'div',
				{
					style: {
						alignItems: 'flex-start',
						display: 'flex',
						flexWrap: 'wrap',
						gap: '16px',
						justifyContent: 'space-between',
					},
				},
				createElement(
					'div',
					{ style: { flex: '1 1 420px', minWidth: 0 } },
					createElement(
						Flex,
						{ align: 'flex-start', gap: 3, expanded: false },
						avatar ? createElement( FlexItem, null, avatar ) : null,
						createElement( FlexItem, null, renderAccountMeta( account ) )
					)
				)
			),
			copy.connectedStatusLabel
				? createElement(
						'div',
						{ style: { borderTop: '1px solid #f0f0f1', marginTop: '12px', paddingTop: '10px' } },
						renderStatusText( 'available', copy.connectedStatusLabel )
				  )
				: null,
			copy.connectedDescription
				? createElement( 'p', { style: { margin: copy.connectedStatusLabel ? '6px 0 0' : '12px 0 0', color: '#50575e' } }, copy.connectedDescription )
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
		{ className: 'pixelgrade-account pixelgrade-account--disconnected pixelgrade-account--operations' },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, copy.title || __( 'Pixelgrade account', 'pixelgrade_assistant' ) ) ),
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

function getStatusTone( state ) {
	if ( 'available' === state || 'active' === state || 'licensed' === state ) {
		return '#0a7a28';
	}
	if (
		'connect_required' === state ||
		'needs_account' === state ||
		'needs_license' === state ||
		'plus_plugin_missing' === state ||
		'plus_plugin_inactive' === state ||
		'locked' === state
	) {
		return '#996800';
	}

	return '#646970';
}

function renderStatusText( state, label ) {
	const labelMap = {
		available: __( 'Available', 'pixelgrade_assistant' ),
		licensed: __( 'Licensed', 'pixelgrade_assistant' ),
		active: __( 'Active', 'pixelgrade_assistant' ),
		needs_license: __( 'Needs license', 'pixelgrade_assistant' ),
		plus_plugin_missing: __( 'Plus available', 'pixelgrade_assistant' ),
		plus_plugin_inactive: __( 'Installed', 'pixelgrade_assistant' ),
		connect_required: __( 'Connect account', 'pixelgrade_assistant' ),
		optional: __( 'Optional', 'pixelgrade_assistant' ),
	};
	const color = getStatusTone( state );

	return createElement(
		'span',
		{
			className: 'pixelgrade-account-status-text pixelgrade-account-status-text--' + ( state || 'ready' ),
			style: {
				alignItems: 'center',
				color: '#50575e',
				display: 'inline-flex',
				fontSize: '12px',
				fontWeight: 600,
				gap: '6px',
				lineHeight: '18px',
				whiteSpace: 'nowrap',
			},
		},
		createElement( 'span', {
			'aria-hidden': true,
			style: {
				background: color,
				borderRadius: '50%',
				display: 'inline-block',
				height: '7px',
				width: '7px',
			},
		} ),
		label || labelMap[ state ] || state || __( 'Ready', 'pixelgrade_assistant' )
	);
}

function renderValueRow( { id, label, value, description, status, statusLabel, action, url } ) {
	if ( ! label || ( ! value && ! description && ! status && ! action ) ) {
		return null;
	}

	return createElement(
		'div',
		{
			key: id || label,
			className: 'pixelgrade-account-value__row',
			style: {
				borderTop: '1px solid #f0f0f1',
				display: 'grid',
				gap: '8px 12px',
				gridTemplateColumns: 'minmax(84px, 120px) minmax(0, 1fr)',
				padding: '10px 0',
			},
		},
		createElement( 'strong', { style: { color: '#1d2327', fontSize: '13px' } }, label ),
		createElement(
			'div',
			{
				style: {
					alignItems: 'flex-start',
					display: 'flex',
					flexWrap: 'wrap',
					gap: '8px 12px',
					justifyContent: 'space-between',
					minWidth: 0,
				},
			},
			createElement(
				'div',
				{ style: { color: '#50575e', flex: '1 1 14rem', minWidth: 0 } },
				value
					? createElement(
							'p',
							{ style: { margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' } },
							url ? createElement( 'a', { href: url, target: '_blank', rel: 'noreferrer' }, value ) : value
					  )
					: null,
				description ? createElement( 'p', { style: { margin: value ? '3px 0 0' : 0 } }, description ) : null
			),
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', flex: '1 1 12rem', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start', maxWidth: '100%', minWidth: 0 } },
				status ? renderStatusText( status, statusLabel ) : null,
				action
			)
		)
	);
}

function renderAccountDetailsRow( accountDetails, data ) {
	const details = accountDetails || {};
	if ( ! details.label && ! details.description ) {
		return null;
	}

	const actions = data.actions || {};
	const copy = data.copy || {};

	return renderValueRow( {
		id: 'account-details',
		label: __( 'Account details', 'pixelgrade_assistant' ),
		value: details.label,
		description: details.description,
		status: details.state,
		statusLabel: details.statusLabel,
		action: renderDisconnectForm( actions, copy.disconnectLabel, 'link' ),
	} );
}

function renderAccountValuePanel( data ) {
	const value = data.accountValue || {};
	const support = value.support || {};
	const site = value.site || {};
	const products = value.products || {};
	const accountDetails = value.accountDetails || {};
	const enablements = Array.isArray( value.enablements ) ? value.enablements : [];

	if ( ! support.label && ! site.themeName && ! products.label && ! accountDetails.label && ! enablements.length ) {
		return null;
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-account-value pixelgrade-account-value--operations', style: { marginTop: '12px' } },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, __( 'Account value', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			renderValueRow( {
				id: 'support',
				label: __( 'Support', 'pixelgrade_assistant' ),
				value: support.label || __( 'Support access', 'pixelgrade_assistant' ),
				description: support.description,
				status: support.state,
			} ),
			renderValueRow( {
				id: 'products',
				label: __( 'Products & licenses', 'pixelgrade_assistant' ),
				value: products.label,
				description: products.description,
				status: products.state,
				statusLabel: products.statusLabel,
				action: products.url
					? createElement(
							Button,
							{
								href: products.url,
								variant:
									'needs_license' === products.state ||
									'plus_plugin_missing' === products.state ||
									'plus_plugin_inactive' === products.state
										? 'primary'
										: 'secondary',
							},
							products.actionLabel || __( 'Review Plus', 'pixelgrade_assistant' )
					  )
					: null,
			} ),
			renderValueRow( {
				id: 'theme',
				label: __( 'Theme', 'pixelgrade_assistant' ),
				value: site.themeName,
			} ),
			renderValueRow( {
				id: 'site',
				label: __( 'Site', 'pixelgrade_assistant' ),
				value: site.siteUrl,
				url: site.siteUrl,
				action: site.helpUrl ? createElement( Button, { href: site.helpUrl, variant: 'secondary' }, __( 'Open Help', 'pixelgrade_assistant' ) ) : null,
			} ),
			renderAccountDetailsRow( accountDetails, data ),
			enablements.length
				? createElement(
						'div',
						{ className: 'pixelgrade-account-value__enablements', style: { marginTop: '2px' } },
						enablements.map( ( item ) =>
							renderValueRow( {
								id: item.id || item.label,
								label: item.label,
								description: item.description,
								status: item.state,
							} )
						)
				  )
				: null
		)
	);
}

function renderAccountPanels( data ) {
	const panels = getAccountPanels( data );

	return panels.map( ( panel ) => {
		const Panel = panel.component;

		return createElement(
			'section',
			{
				key: panel.id,
				id: 'pixelgrade-account-panel-' + panel.id,
				className: 'pixelgrade-account-panel pixelgrade-account-panel--' + panel.id,
				'data-account-section': panel.id,
				tabIndex: '-1',
				style: { marginTop: '24px' },
			},
			createElement( Panel, { accountData: data, sectionId: panel.id } )
		);
	} );
}

export function Account() {
	const data = getAccountData();
	const account = data.account || {};
	const section = getLinkedSection();

	useEffect( () => {
		if ( ! section ) {
			return;
		}

		const element = document.getElementById( 'pixelgrade-account-panel-' + section );
		if ( ! element || 'function' !== typeof element.scrollIntoView ) {
			return;
		}

		element.scrollIntoView( { block: 'start', behavior: 'smooth' } );
		if ( 'function' === typeof element.focus ) {
			element.focus( { preventScroll: true } );
		}
	}, [ section ] );

	return createElement(
		Fragment,
		null,
		renderNotice( data.notice ),
		account.is_connected ? renderConnected( data ) : renderDisconnected( data ),
		renderAccountValuePanel( data ),
		renderAccountPanels( data )
	);
}
