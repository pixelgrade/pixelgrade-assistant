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

const LAYOUT_CSS = `
.pixelgrade-account-layout { align-items: start; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(240px, 300px); }
.pixelgrade-account-layout__main, .pixelgrade-account-layout__side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.pixelgrade-account-layout__main > *, .pixelgrade-account-layout__side > * { margin-top: 0 !important; }
@media ( max-width: 1100px ) { .pixelgrade-account-layout { grid-template-columns: minmax(0, 1fr); } }
`;

function renderSidebarSection( children, isFirst = false ) {
	const items = ( Array.isArray( children ) ? children : [ children ] ).filter( Boolean );
	if ( ! items.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			style: {
				borderTop: isFirst ? 'none' : '1px solid #f0f0f1',
				marginTop: isFirst ? 0 : '12px',
				paddingTop: isFirst ? 0 : '12px',
			},
		},
		items
	);
}

function renderIdentityCard( data ) {
	const account = data.account || {};
	const copy = data.copy || {};
	const actions = data.actions || {};
	const details = ( data.accountValue || {} ).accountDetails || {};
	const avatar = renderAvatar( account, 40 );
	const metaStyle = { color: '#646970', fontSize: '12px', margin: '2px 0 0' };

	return createElement(
		Card,
		{ className: 'pixelgrade-account pixelgrade-account--connected pixelgrade-account--sidebar' },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '14px', margin: 0 } }, copy.title || __( 'Pixelgrade account', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			renderSidebarSection(
				createElement(
					Flex,
					{ align: 'center', gap: 3, expanded: false, justify: 'flex-start' },
					avatar ? createElement( FlexItem, null, avatar ) : null,
					createElement( FlexItem, { style: { minWidth: 0 } }, renderAccountMeta( account ) )
				),
				true
			),
			renderSidebarSection( [
				copy.connectedStatusLabel ? renderStatusText( 'available', copy.connectedStatusLabel ) : null,
				copy.connectedDescription
					? createElement( 'p', { key: 'desc', style: { color: '#50575e', fontSize: '12px', margin: '6px 0 0' } }, copy.connectedDescription )
					: null,
			] ),
			renderSidebarSection( [
				details.label ? createElement( 'p', { key: 'id', style: { color: '#50575e', fontSize: '12px', margin: 0 } }, details.label ) : null,
				details.description ? createElement( 'p', { key: 'date', style: metaStyle }, details.description ) : null,
				createElement( 'div', { key: 'disconnect', style: { marginTop: '10px' } }, renderDisconnectForm( actions, copy.disconnectLabel, 'link' ) ),
			] )
		)
	);
}

function renderSupportCard( data ) {
	const value = data.accountValue || {};
	const support = value.support || {};
	const docs = value.docs || {};
	const site = value.site || {};

	if ( ! support.label && ! docs.label && ! site.themeName ) {
		return null;
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-account-value pixelgrade-account-value--operations pixelgrade-account-value--sidebar' },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '14px', margin: 0 } }, __( 'Support & docs', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			renderSidebarSection( [
				support.state ? renderStatusText( support.state, support.label ) : null,
				support.description
					? createElement( 'p', { key: 'support-desc', style: { color: '#50575e', fontSize: '12px', margin: '6px 0 0' } }, support.description )
					: null,
			], true ),
			renderSidebarSection( [
				docs.url
					? createElement( 'p', { key: 'docs-link', style: { fontSize: '13px', margin: 0 } }, createElement( 'a', { href: docs.url, target: '_blank', rel: 'noreferrer' }, __( 'Theme documentation', 'pixelgrade_assistant' ) ) )
					: null,
				docs.label
					? createElement( 'p', { key: 'docs-desc', style: { color: '#646970', fontSize: '12px', margin: '4px 0 0' } }, docs.label )
					: null,
				docs.helpUrl
					? createElement( 'div', { key: 'docs-action', style: { marginTop: '10px' } }, createElement( Button, { href: docs.helpUrl, variant: 'secondary', size: 'small' }, docs.actionLabel || __( 'Open Help', 'pixelgrade_assistant' ) ) )
					: null,
			] ),
			renderSidebarSection( [
				site.themeName ? createElement( 'p', { key: 'theme', style: { color: '#50575e', fontSize: '12px', margin: 0 } }, site.themeName ) : null,
				site.siteUrl ? createElement( 'p', { key: 'url', style: { color: '#646970', fontSize: '12px', margin: '2px 0 0', overflowWrap: 'anywhere' } }, site.siteUrl ) : null,
			] )
		)
	);
}

function renderJourneyStepMarker( state, index ) {
	const isDone = 'done' === state;
	const isCurrent = 'current' === state;
	const accent = 'var(--wp-admin-theme-color, #3858e9)';

	return createElement(
		'span',
		{
			'aria-hidden': true,
			style: {
				alignItems: 'center',
				background: isDone ? '#0a7a28' : '#fff',
				border: '1.5px solid ' + ( isDone ? '#0a7a28' : isCurrent ? accent : '#c3c4c7' ),
				borderRadius: '50%',
				color: isDone ? '#fff' : isCurrent ? accent : '#8c8f94',
				display: 'inline-flex',
				flex: '0 0 auto',
				fontSize: '12px',
				fontWeight: 600,
				height: '22px',
				justifyContent: 'center',
				lineHeight: 1,
				width: '22px',
			},
		},
		isDone ? '✓' : String( index + 1 )
	);
}

function renderJourneyStep( step, index ) {
	if ( ! step || ! step.label ) {
		return null;
	}

	const isCurrent = 'current' === step.state;
	const isDone = 'done' === step.state;
	const labelColor = isDone ? '#50575e' : isCurrent ? '#1d2327' : '#8c8f94';

	return createElement(
		'div',
		{
			key: step.id || index,
			className: 'pixelgrade-plus-journey__step pixelgrade-plus-journey__step--' + ( step.state || 'upcoming' ),
			style: {
				alignItems: 'flex-start',
				borderTop: 0 === index ? 'none' : '1px solid #f0f0f1',
				display: 'flex',
				gap: '12px',
				padding: 0 === index ? '2px 0 10px' : '10px 0',
			},
		},
		renderJourneyStepMarker( step.state, index ),
		createElement(
			'div',
			{ style: { flex: '1 1 auto', minWidth: 0 } },
			createElement(
				'div',
				{ style: { alignItems: 'baseline', display: 'flex', flexWrap: 'wrap', gap: '4px 10px', justifyContent: 'space-between' } },
				createElement( 'strong', { style: { color: labelColor, fontSize: '13px' } }, step.label ),
				isDone ? renderStatusText( 'available', __( 'Done', 'pixelgrade_assistant' ) ) : null
			),
			isCurrent && step.description
				? createElement( 'p', { style: { color: '#50575e', margin: '4px 0 0' } }, step.description )
				: null,
			isCurrent && step.action && step.action.url
				? createElement(
						'div',
						{ style: { marginTop: '10px' } },
						createElement( Button, { href: step.action.url, variant: 'primary' }, step.action.label )
				  )
				: null,
			isCurrent && step.hint && step.hint.label
				? createElement(
						'p',
						{ style: { color: '#646970', fontSize: '12px', margin: '8px 0 0' } },
						step.hint.url
							? createElement( 'a', { href: step.hint.url }, step.hint.label )
							: step.hint.label
				  )
				: null
		)
	);
}

function renderPlusJourney( data ) {
	const journey = data.plusJourney || {};

	if ( ! journey.state ) {
		return null;
	}

	if ( 'invite' === journey.state ) {
		return createElement(
			Card,
			{ className: 'pixelgrade-plus-journey pixelgrade-plus-journey--invite', style: { marginTop: '12px' } },
			createElement(
				CardBody,
				null,
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '12px 16px', justifyContent: 'space-between' } },
					createElement(
						'div',
						{ style: { flex: '1 1 24rem', minWidth: 0 } },
						createElement( 'strong', { style: { color: '#1d2327', fontSize: '13px' } }, journey.title || 'Pixelgrade Plus' ),
						journey.description ? createElement( 'p', { style: { color: '#50575e', margin: '4px 0 0' } }, journey.description ) : null,
						journey.hint ? createElement( 'p', { style: { color: '#646970', fontSize: '12px', margin: '6px 0 0' } }, journey.hint ) : null
					),
					journey.action && journey.action.url
						? createElement( Button, { href: journey.action.url, variant: 'secondary' }, journey.action.label )
						: null
				)
			)
		);
	}

	if ( 'complete' === journey.state ) {
		return createElement(
			Card,
			{ className: 'pixelgrade-plus-journey pixelgrade-plus-journey--complete', style: { marginTop: '12px' } },
			createElement(
				CardBody,
				null,
				createElement(
					'div',
					{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '12px 16px', justifyContent: 'space-between' } },
					createElement(
						'div',
						{ style: { flex: '1 1 24rem', minWidth: 0 } },
						createElement(
							'div',
							{ style: { alignItems: 'center', display: 'flex', gap: '10px' } },
							createElement( 'strong', { style: { color: '#1d2327', fontSize: '13px' } }, journey.title || __( 'Pixelgrade Plus is set up', 'pixelgrade_assistant' ) ),
							renderStatusText( 'licensed' )
						),
						journey.description ? createElement( 'p', { style: { color: '#50575e', margin: '4px 0 0' } }, journey.description ) : null
					),
					journey.action && journey.action.url
						? createElement( Button, { href: journey.action.url, variant: 'link' }, journey.action.label )
						: null
				)
			)
		);
	}

	const steps = Array.isArray( journey.steps ) ? journey.steps : [];
	if ( ! steps.length ) {
		return null;
	}

	return createElement(
		Card,
		{ className: 'pixelgrade-plus-journey pixelgrade-plus-journey--in-progress', style: { marginTop: '12px' } },
		createElement(
			CardHeader,
			null,
			createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, journey.title || __( 'Set up Pixelgrade Plus', 'pixelgrade_assistant' ) ),
			journey.progressLabel
				? createElement( 'span', { style: { color: '#646970', fontSize: '12px', fontWeight: 600 } }, journey.progressLabel )
				: null
		),
		createElement(
			CardBody,
			null,
			journey.description ? createElement( 'p', { style: { color: '#50575e', margin: '0 0 12px' } }, journey.description ) : null,
			steps.map( renderJourneyStep )
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
						// Secondary on purpose: a free user has no urgent reason to connect — the
						// Plus journey promotes this same action to primary when it is a real step.
						Button,
						{
							href: actions.connectUrl,
							variant: 'secondary',
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

function renderAccountDetailsRow( accountDetails ) {
	const details = accountDetails || {};
	if ( ! details.label && ! details.description ) {
		return null;
	}

	return renderValueRow( {
		id: 'account-details',
		label: __( 'Account details', 'pixelgrade_assistant' ),
		value: details.label,
		description: details.description,
		status: details.state,
		statusLabel: details.statusLabel,
	} );
}

function renderAccountValuePanel( data ) {
	const value = data.accountValue || {};
	const site = value.site || {};
	const docs = value.docs || {};
	const diagnostics = value.diagnostics || {};
	const accountDetails = value.accountDetails || {};

	if ( ! site.themeName && ! docs.label && ! diagnostics.label && ! accountDetails.label ) {
		return null;
	}

	// Disconnected panel: give the free user what they already have (docs everywhere, diagnostics)
	// instead of pitching Credits — the hero names the reasons to connect exactly once.
	return createElement(
		Card,
		{ className: 'pixelgrade-account-value pixelgrade-account-value--operations', style: { marginTop: '12px' } },
		createElement( CardHeader, null, createElement( 'h2', { style: { fontSize: '15px', margin: 0 } }, __( 'Help & docs', 'pixelgrade_assistant' ) ) ),
		createElement(
			CardBody,
			null,
			renderValueRow( {
				id: 'docs',
				label: __( 'Documentation', 'pixelgrade_assistant' ),
				value: __( 'Theme documentation', 'pixelgrade_assistant' ),
				url: docs.url,
				description: docs.label,
				status: docs.state || 'available',
				action: docs.helpUrl
					? createElement( Button, { href: docs.helpUrl, variant: 'secondary' }, docs.actionLabel || __( 'Open Help', 'pixelgrade_assistant' ) )
					: null,
			} ),
			diagnostics.label
				? renderValueRow( {
						id: 'diagnostics',
						label: __( 'Diagnostics', 'pixelgrade_assistant' ),
						value: diagnostics.label,
						description: diagnostics.description,
						status: diagnostics.state || 'available',
						action: diagnostics.url
							? createElement( Button, { href: diagnostics.url, variant: 'secondary' }, diagnostics.actionLabel || __( 'View System Status', 'pixelgrade_assistant' ) )
							: null,
				  } )
				: null,
			renderValueRow( {
				id: 'site',
				label: __( 'Site', 'pixelgrade_assistant' ),
				value: site.themeName,
				description: site.siteUrl,
			} ),
			renderAccountDetailsRow( accountDetails )
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

		// Briefly highlight the linked panel so hand-offs from the setup journey visibly land.
		element.style.transition = 'box-shadow .3s ease';
		element.style.boxShadow = '0 0 0 2px var(--wp-admin-theme-color, #3858e9)';
		element.style.borderRadius = '4px';
		const timer = setTimeout( () => {
			element.style.boxShadow = 'none';
		}, 2000 );

		return () => clearTimeout( timer );
	}, [ section ] );

	if ( ! account.is_connected ) {
		// When Plus signals exist (journey in progress), connecting is step 1 of the user's goal —
		// the journey card carries the ONE connect call, and the "everything works without an
		// account" hero would contradict it. Keep the hero for fresh sites (invite) and when OAuth
		// is not configured (the hero carries that warning).
		const journey = data.plusJourney || {};
		const oauth = data.oauth || {};
		const journeyLeads = 'in_progress' === journey.state && !! oauth.isConfigured;

		return createElement(
			Fragment,
			null,
			renderNotice( data.notice ),
			journeyLeads ? null : renderDisconnected( data ),
			renderPlusJourney( data ),
			renderAccountValuePanel( data ),
			renderAccountPanels( data )
		);
	}

	return createElement(
		Fragment,
		null,
		createElement( 'style', null, LAYOUT_CSS ),
		renderNotice( data.notice ),
		createElement(
			'div',
			{ className: 'pixelgrade-account-layout' },
			createElement(
				'div',
				{ className: 'pixelgrade-account-layout__main' },
				renderPlusJourney( data ),
				renderAccountPanels( data )
			),
			createElement(
				'aside',
				{ className: 'pixelgrade-account-layout__side' },
				renderIdentityCard( data ),
				renderSupportCard( data )
			)
		)
	);
}
