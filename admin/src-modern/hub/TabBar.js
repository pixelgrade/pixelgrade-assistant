/**
 * The hub tab bar. Renders one button per visible tab; clicking selects (or, for a link tab with a
 * `url`, navigates out - handled by the parent's onSelect). Secondary tabs are de-emphasized and
 * pushed to the trailing side of the same tablist.
 */
import { createElement } from '@wordpress/element';
import { Button } from '@wordpress/components';

export function TabBar( { tabs, activeId, onSelect } ) {
	let sawSecondary = false;

	return createElement(
		'div',
		{
			className: 'pixelgrade-admin-hub__tabbar',
			role: 'tablist',
			style: {
				alignItems: 'center',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '8px',
				margin: '0 0 20px',
			},
		},
		tabs.map( ( tab ) => {
			const isActive = tab.id === activeId;
			const isSecondary = 'secondary' === tab.group;
			const isFirstSecondary = isSecondary && ! sawSecondary;

			if ( isSecondary ) {
				sawSecondary = true;
			}

			return createElement(
				Button,
				{
					key: tab.id,
					role: 'tab',
					'aria-selected': isActive,
					icon: tab.icon || undefined,
					variant: isActive ? 'primary' : 'tertiary',
					className:
						'pixelgrade-admin-hub__tab' +
						( isActive ? ' is-active' : '' ) +
						( isSecondary ? ' is-secondary' : '' ),
					style: {
						borderLeft: isFirstSecondary ? '1px solid #dcdcde' : undefined,
						marginLeft: isFirstSecondary ? 'auto' : undefined,
						opacity: isSecondary && ! isActive ? 0.82 : 1,
						paddingLeft: isFirstSecondary ? '16px' : undefined,
					},
					onClick: () => onSelect( tab.id ),
				},
				tab.label || tab.id
			);
		} )
	);
}
