/**
 * The hub tab bar. Renders one button per visible tab; clicking selects (or, for a link tab with a
 * `url`, navigates out - handled by the parent's onSelect). Primary sections stay together, while
 * service tabs stay on the trailing side and utility tabs collapse under More.
 *
 * Styling follows the Gutenberg Tabs grammar: labels stay editor-dark when idle, the admin accent
 * color is reserved for hover, the active label and a 2px underline that slides between tabs.
 * Primary tabs carry real @wordpress/icons; service tabs stay quieter and text-only.
 */
import { createElement, useLayoutEffect, useRef } from '@wordpress/element';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, cog, home, layout, styles } from '@wordpress/icons';

const SERVICE_TAB_IDS = [ 'account', 'help' ];

// Icons for the primary (design) tabs only - service tabs stay text-only. Mapped here so PHP tab
// descriptors keep carrying plain strings; a descriptor-provided `icon` (dashicon slug) wins.
const PRIMARY_TAB_ICONS = {
	overview: home,
	styles,
	'starter-sites': layout,
	'design-library': category,
	plugins: cog,
};

const ACCENT_COLOR = 'var(--wp-admin-theme-color, #3858e9)';

// Hover must live in a stylesheet (inline styles can't express it, and the inline label color
// would win otherwise - hence the !important); same for the reduced-motion media query.
const TABBAR_CSS = `
.pixelgrade-admin-hub__tab.components-button:hover:not(:disabled) { color: ${ ACCENT_COLOR } !important; }
.pixelgrade-admin-hub__tabbar-indicator { transition: transform 0.2s ease-out, width 0.2s ease-out; }
@media (prefers-reduced-motion: reduce) {
	.pixelgrade-admin-hub__tabbar-indicator { transition: none; }
}
`;

export function TabBar( { tabs, activeId, onSelect } ) {
	const barRef = useRef( null );
	const indicatorRef = useRef( null );

	// Keep the sliding underline beneath the active tab (the More toggle when a utility tab is
	// active); re-measure when the bar resizes or wraps.
	useLayoutEffect( () => {
		const bar = barRef.current;
		const indicator = indicatorRef.current;
		if ( ! bar || ! indicator ) {
			return undefined;
		}

		const position = () => {
			const active = bar.querySelector( '.pixelgrade-admin-hub__tab.is-active' );
			if ( ! active ) {
				indicator.style.width = '0px';
				return;
			}
			const barRect = bar.getBoundingClientRect();
			const activeRect = active.getBoundingClientRect();
			indicator.style.width = activeRect.width + 'px';
			indicator.style.transform = 'translateX(' + ( activeRect.left - barRect.left ) + 'px)';
		};

		position();

		if ( 'undefined' === typeof window.ResizeObserver ) {
			window.addEventListener( 'resize', position );
			return () => window.removeEventListener( 'resize', position );
		}
		const observer = new window.ResizeObserver( position );
		observer.observe( bar );
		return () => observer.disconnect();
	}, [ activeId, tabs ] );

	const isServiceTab = ( tab ) => SERVICE_TAB_IDS.indexOf( tab.id ) !== -1;
	const designTabs = tabs.filter( ( tab ) => 'secondary' !== tab.group && ! isServiceTab( tab ) );
	const serviceTabs = tabs.filter( isServiceTab );
	const utilityTabs = tabs.filter( ( tab ) => 'secondary' === tab.group );
	const isUtilityActive = utilityTabs.some( ( tab ) => tab.id === activeId );

	const renderTabBadge = ( tab ) => {
		if ( ! tab.badge ) {
			return null;
		}

		const tone = 'plus-active' === tab.badgeTone ? 'plus-active' : ( 'plus' === tab.badgeTone ? 'plus' : '' );
		const isActivePlus = 'plus-active' === tone;
		const badgeStyle = {
			background: '#f0f0f1',
			border: '1px solid #dcdcde',
			borderRadius: '999px',
			color: '#50575e',
			display: 'inline-flex',
			fontSize: '10px',
			fontWeight: 600,
			lineHeight: 1,
			padding: '3px 6px',
			textTransform: 'uppercase',
		};

		if ( isActivePlus ) {
			// Pixelgrade purple is reserved for an active Plus license, not mere plugin presence.
			badgeStyle.background = '#8b5fbf';
			badgeStyle.border = '1px solid #8b5fbf';
			badgeStyle.color = '#fff';
		}

		return createElement(
			'span',
			{
				className: 'pixelgrade-admin-hub__tab-badge' + ( tone ? ' pixelgrade-admin-hub__tab-badge--' + tone : '' ),
				style: badgeStyle,
			},
			tab.badge
		);
	};
	const renderTabLabel = ( tab ) => createElement(
		'span',
		{
			className: 'pixelgrade-admin-hub__tab-label',
			style: {
				alignItems: 'center',
				display: 'inline-flex',
				gap: '6px',
				whiteSpace: 'nowrap',
			},
		},
		createElement( 'span', null, tab.label || tab.id ),
		renderTabBadge( tab )
	);
	const renderTab = ( tab, isService = false ) => {
		const isActive = tab.id === activeId;

		return createElement(
			Button,
			{
				key: tab.id,
				role: 'tab',
				'aria-current': isActive ? 'page' : undefined,
				'aria-selected': isActive,
				icon: tab.icon || ( ! isService && PRIMARY_TAB_ICONS[ tab.id ] ) || undefined,
				iconSize: 20,
				variant: 'tertiary',
				// NB: do not name this modifier `is-secondary` — that collides with
				// @wordpress/components' Button `.is-secondary` variant class and paints an
				// inset 1px border, making these tertiary tabs look like outlined buttons.
				className:
					'pixelgrade-admin-hub__tab' +
					( isActive ? ' is-active' : '' ) +
					( isService ? ' is-service-group' : '' ),
				style: {
					background: 'transparent',
					borderRadius: 0,
					color: isActive ? ACCENT_COLOR : ( isService ? '#50575e' : '#1e1e1e' ),
					fontSize: isService ? '12.5px' : '13.5px',
					fontWeight: 500,
					gap: '6px',
					minHeight: isService ? '40px' : '44px',
					padding: '6px 8px',
				},
				onClick: () => onSelect( tab.id ),
			},
			renderTabLabel( tab )
		);
	};
	const renderMoreMenu = () => {
		if ( ! utilityTabs.length ) {
			return null;
		}

		return createElement( Dropdown, {
			className: 'pixelgrade-admin-hub__more',
			contentClassName: 'pixelgrade-admin-hub__more-menu',
			popoverProps: {
				placement: 'bottom-end',
			},
			renderToggle: ( { isOpen, onToggle } ) =>
				createElement(
					Button,
					{
						'aria-current': isUtilityActive ? 'page' : undefined,
						'aria-expanded': isOpen,
						'aria-haspopup': 'menu',
						className:
							'pixelgrade-admin-hub__tab pixelgrade-admin-hub__tab--more' +
							( isUtilityActive ? ' is-active' : '' ),
						variant: 'tertiary',
						style: {
							background: 'transparent',
							borderRadius: 0,
							color: isUtilityActive ? ACCENT_COLOR : '#50575e',
							fontSize: '12.5px',
							fontWeight: 500,
							minHeight: '40px',
							padding: '6px 8px',
						},
						onClick: onToggle,
					},
					__( 'More', 'pixelgrade_assistant' )
				),
			renderContent: ( { onClose } = {} ) =>
				createElement(
					MenuGroup,
					{ label: __( 'More', 'pixelgrade_assistant' ) },
					utilityTabs.map( ( tab ) =>
						createElement(
							MenuItem,
							{
								key: tab.id,
								isSelected: tab.id === activeId,
								onClick: () => {
									onSelect( tab.id );
									if ( onClose ) {
										onClose();
									}
								},
							},
							renderTabLabel( tab )
						)
					)
				),
		} );
	};

	return createElement(
		'div',
		{
			className: 'pixelgrade-admin-hub__tabbar',
			role: 'navigation',
			'aria-label': __( 'Pixelgrade Design sections', 'pixelgrade_assistant' ),
			ref: barRef,
			style: {
				alignItems: 'center',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '12px 20px',
				justifyContent: 'space-between',
				margin: 0,
				padding: '0 0 1px',
				borderBottom: '1px solid #dcdcde',
				position: 'relative',
			},
		},
		createElement( 'style', null, TABBAR_CSS ),
		createElement(
			'div',
			{
				className: 'pixelgrade-admin-hub__tabbar-tabs',
				role: 'tablist',
				'aria-label': __( 'Pixelgrade Design sections', 'pixelgrade_assistant' ),
				style: {
					alignItems: 'center',
					display: 'flex',
					flex: '1 1 520px',
					flexWrap: 'wrap',
					gap: '12px 20px',
				},
			},
			createElement(
				'div',
				{
					className: 'pixelgrade-admin-hub__tabbar-primary',
					role: 'presentation',
					style: {
						alignItems: 'center',
						display: 'flex',
						flex: '1 1 auto',
						flexWrap: 'wrap',
						gap: '16px',
					},
				},
				designTabs.map( ( tab ) => renderTab( tab ) )
			),
			serviceTabs.length
				? createElement(
					'div',
					{
						className: 'pixelgrade-admin-hub__tabbar-service',
						role: 'presentation',
						style: {
							alignItems: 'center',
							borderLeft: '1px solid #dcdcde',
							display: 'flex',
							flex: '0 1 auto',
							flexWrap: 'wrap',
							gap: '8px',
							marginLeft: 'auto',
							paddingLeft: '16px',
						},
					},
					serviceTabs.map( ( tab ) => renderTab( tab, true ) )
				)
				: null
		),
		utilityTabs.length
			? createElement(
					'div',
					{
						className: 'pixelgrade-admin-hub__tabbar-utilities',
						style: {
							alignItems: 'center',
							display: 'flex',
							flex: '0 1 auto',
							marginLeft: serviceTabs.length ? 0 : 'auto',
						},
					},
					renderMoreMenu()
			  )
			: null,
		createElement( 'span', {
			className: 'pixelgrade-admin-hub__tabbar-indicator',
			'aria-hidden': 'true',
			ref: indicatorRef,
			style: {
				background: ACCENT_COLOR,
				bottom: 0,
				height: '2px',
				left: 0,
				pointerEvents: 'none',
				position: 'absolute',
				width: 0,
			},
		} )
	);
}
