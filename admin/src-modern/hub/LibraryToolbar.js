/**
 * Shared browse toolbar for the Design Library catalog tabs (Site Parts + Page Patterns).
 *
 * ONE component behind both bars: free-text search, type + source filters, the My-site/Demo
 * preview-source toggle, the grid/list view switch, the preview-size dropdown (grid only), and the
 * Refresh action with its inline loading status. The tabs differ only in the option lists and copy
 * they pass in — improve the bar here and every catalog tab benefits.
 */
import { createElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Dropdown, RangeControl, SearchControl, SelectControl } from '@wordpress/components';
import { grid, listView, settings, update } from '@wordpress/icons';
import { PreviewModeToggle } from './LayoutPreview';
import { PREVIEW_SIZE_DEFAULT_COLUMNS, PREVIEW_SIZE_MAX_COLUMNS, PREVIEW_SIZE_MIN_COLUMNS } from './preferences';

// Below the WP admin small-screen breakpoint the bar stacks: search on its own full-width line,
// then the controls sharing the row.
function LibraryToolbarResponsiveStyles() {
	return createElement(
		'style',
		null,
		'@media (max-width: 782px) {' +
			'.pixassist-library-toolbar { align-items: stretch; }' +
			'.pixassist-library-toolbar__search { flex-basis: 100% !important; min-width: 0 !important; }' +
			'.pixassist-library-toolbar__controls { margin-left: 0 !important; width: 100%; }' +
			'.pixassist-library-toolbar__control { flex: 1 1 140px; min-width: 0 !important; }' +
		'}'
	);
}

export function LibraryToolbar( {
	search,
	onSearch,
	searchLabel,
	typeFilter,
	onTypeFilter,
	typeOptions,
	typeFilterLabel,
	sourceFilter,
	onSourceFilter,
	sourceOptions,
	sourceFilterLabel,
	viewMode,
	onViewMode,
	columns,
	onColumns,
	onRefresh,
	refreshLabel,
	refreshTitle,
	refreshDisabled,
	loading,
	loadingStatus,
} ) {
	return createElement(
		Fragment,
		null,
		createElement( LibraryToolbarResponsiveStyles, null ),
		createElement(
			'div',
			{
				className: 'pixassist-library-toolbar',
				style: {
					alignItems: 'center',
					display: 'flex',
					flexWrap: 'wrap',
					gap: '12px',
					margin: '16px 0',
				},
			},
			createElement(
				'div',
				{ className: 'pixassist-library-toolbar__search', style: { flex: '1 1 220px', minWidth: '180px' } },
				createElement( SearchControl, {
					__nextHasNoMarginBottom: true,
					value: search,
					onChange: onSearch,
					label: searchLabel,
					placeholder: searchLabel,
					hideLabelFromVision: true,
				} )
			),
			createElement(
				'div',
				{ className: 'pixassist-library-toolbar__controls', style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' } },
				createElement(
					'div',
					{ className: 'pixassist-library-toolbar__control', style: { minWidth: '150px' } },
					createElement( SelectControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						hideLabelFromVision: true,
						label: typeFilterLabel,
						value: typeFilter,
						options: typeOptions,
						onChange: onTypeFilter,
					} )
				),
				createElement(
					'div',
					{ className: 'pixassist-library-toolbar__control', style: { minWidth: '150px' } },
					createElement( SelectControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						hideLabelFromVision: true,
						label: sourceFilterLabel,
						value: sourceFilter,
						options: sourceOptions,
						onChange: onSourceFilter,
					} )
				),
				// The My-site/Demo source toggle stays visible in BOTH view modes: the Expand overlay
				// honors it even from list rows, so hiding it there just buries the switch.
				createElement( PreviewModeToggle, null ),
				createElement(
					'div',
					{ style: { display: 'inline-flex', border: '1px solid #dcdcde', borderRadius: '4px' } },
					createElement( Button, {
						icon: grid,
						isPressed: 'grid' === viewMode,
						label: __( 'Grid view', 'pixelgrade_assistant' ),
						showTooltip: true,
						onClick: () => onViewMode( 'grid' ),
					} ),
					createElement( Button, {
						icon: listView,
						isPressed: 'list' === viewMode,
						label: __( 'List view', 'pixelgrade_assistant' ),
						showTooltip: true,
						onClick: () => onViewMode( 'list' ),
					} )
				),
				// Preview-size slider (right = larger previews = fewer columns) — grid only.
				'grid' === viewMode
					? createElement( Dropdown, {
							popoverProps: { placement: 'bottom-end' },
							renderToggle: ( { isOpen, onToggle } ) =>
								createElement( Button, {
									icon: settings,
									isPressed: isOpen,
									'aria-expanded': isOpen,
									label: __( 'Preview size', 'pixelgrade_assistant' ),
									showTooltip: true,
									onClick: onToggle,
								} ),
							renderContent: () =>
								createElement(
									'div',
									{ style: { minWidth: '220px', padding: '4px 8px 0' } },
									createElement( RangeControl, {
										__nextHasNoMarginBottom: true,
										__next40pxDefaultSize: true,
										label: __( 'Preview size', 'pixelgrade_assistant' ),
										value: PREVIEW_SIZE_MAX_COLUMNS + 1 - columns,
										onChange: ( value ) =>
											onColumns( PREVIEW_SIZE_MAX_COLUMNS + 1 - ( value || PREVIEW_SIZE_MAX_COLUMNS + 1 - PREVIEW_SIZE_DEFAULT_COLUMNS ) ),
										min: PREVIEW_SIZE_MIN_COLUMNS,
										max: PREVIEW_SIZE_MAX_COLUMNS,
										step: 1,
										marks: true,
										withInputField: false,
										showTooltip: false,
									} )
								),
					  } )
					: null,
				onRefresh
					? createElement(
							Button,
							{
								variant: 'secondary',
								icon: update,
								isBusy: loading,
								disabled: Boolean( refreshDisabled ) || loading,
								onClick: () => onRefresh(),
								label: refreshTitle,
								showTooltip: true,
							},
							refreshLabel
					  )
					: null,
				loading && loadingStatus
					? createElement( 'span', { style: { color: '#646970', fontSize: '13px' } }, loadingStatus )
					: null
			)
		)
	);
}
