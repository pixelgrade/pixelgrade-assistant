/**
 * The hub tab bar. Renders one button per visible tab; clicking selects (or, for a link tab with a
 * `url`, navigates out — handled by the parent's onSelect).
 */
import { createElement } from '@wordpress/element';
import { Button } from '@wordpress/components';

export function TabBar( { tabs, activeId, onSelect } ) {
	return createElement(
		'div',
		{ className: 'pixelgrade-admin-hub__tabbar', role: 'tablist' },
		tabs.map( ( tab ) => {
			const isActive = tab.id === activeId;

			return createElement(
				Button,
				{
					key: tab.id,
					role: 'tab',
					'aria-selected': isActive,
					icon: tab.icon || undefined,
					variant: isActive ? 'primary' : 'tertiary',
					className:
						'pixelgrade-admin-hub__tab' + ( isActive ? ' is-active' : '' ),
					onClick: () => onSelect( tab.id ),
				},
				tab.label || tab.id
			);
		} )
	);
}
