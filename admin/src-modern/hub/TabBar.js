/**
 * The hub tab bar. Renders one button per visible tab; clicking selects (or, for a link tab with a
 * `url`, navigates out - handled by the parent's onSelect). Primary sections stay together, while
 * service tabs stay on the trailing side and utility tabs collapse under More.
 */
import { createElement } from '@wordpress/element';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const SERVICE_TAB_IDS = [ 'account', 'help' ];

export function TabBar( { tabs, activeId, onSelect } ) {
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
				icon: tab.icon || undefined,
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
					boxShadow: isActive ? 'inset 0 -2px 0 #3858e9' : 'inset 0 -2px 0 transparent',
					color: isActive ? '#1d2327' : ( isService ? '#50575e' : '#3858e9' ),
					fontSize: isService ? '13px' : undefined,
					fontWeight: isActive ? 600 : 500,
					minHeight: isService ? '36px' : '40px',
					padding: isService ? '6px 9px' : '6px 10px',
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
							boxShadow: isUtilityActive ? 'inset 0 -2px 0 #3858e9' : 'inset 0 -2px 0 transparent',
							color: isUtilityActive ? '#1d2327' : '#50575e',
							fontSize: '13px',
							fontWeight: isUtilityActive ? 600 : 500,
							minHeight: '36px',
							padding: '6px 9px',
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
			role: 'tablist',
			'aria-label': __( 'Pixelgrade Design sections', 'pixelgrade_assistant' ),
			style: {
				alignItems: 'center',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '12px 20px',
				justifyContent: 'space-between',
				margin: 0,
				padding: '0 0 1px',
				borderBottom: '1px solid #dcdcde',
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
					flex: '1 1 520px',
					flexWrap: 'wrap',
					gap: '2px',
				},
			},
			designTabs.map( ( tab ) => renderTab( tab ) )
		),
		serviceTabs.length || utilityTabs.length
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
						gap: '2px',
						marginLeft: 'auto',
						paddingLeft: '16px',
					},
				},
				serviceTabs.map( ( tab ) => renderTab( tab, true ) ),
				renderMoreMenu()
			)
			: null
	);
}
