/**
 * Contextual Pixelgrade Docs PluginSidebar entry point (#46).
 *
 * The panel runs on editor screens, not on the Appearance -> Pixelgrade hub, so it has its own
 * wp-scripts entry (`docs`). No JSX: WordPress 5.9 is still supported.
 */
import { createElement, Fragment } from '@wordpress/element';
import { createSlotFill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { getDocsData } from './data';
import { KbPanel } from './KbPanel';

const SLOT_FILL = createSlotFill( 'pixelgrade-docs' );

if ( 'undefined' !== typeof window ) {
	window.pixelgradeAdminHub = window.pixelgradeAdminHub || {};
	window.pixelgradeAdminHub.docs = {
		EscalationSlot: SLOT_FILL.Slot,
		EscalationFill: SLOT_FILL.Fill,
	};
}

function detectSurface() {
	if ( 'undefined' !== typeof document && document.body && document.body.classList.contains( 'site-editor-php' ) ) {
		return 'site';
	}

	if ( 'undefined' !== typeof window && window.location && -1 !== window.location.pathname.indexOf( 'site-editor.php' ) ) {
		return 'site';
	}

	return 'post';
}

function useEditorContext() {
	const data = getDocsData();
	const productSlug = data.product && data.product.sku ? data.product.sku : '';

	return useSelect(
		( select ) => {
			let surface = detectSurface();
			let postType = '';
			let templateId = '';

			try {
				const editor = select( 'core/editor' );
				if ( editor && typeof editor.getCurrentPostType === 'function' ) {
					postType = editor.getCurrentPostType() || '';
				}
				if ( editor && typeof editor.getEditedPostAttribute === 'function' ) {
					templateId = editor.getEditedPostAttribute( 'template' ) || '';
				}
			} catch ( error ) {}

			try {
				const editSite = select( 'core/edit-site' );
				if ( editSite ) {
					const editedType = typeof editSite.getEditedPostType === 'function' ? editSite.getEditedPostType() : '';
					const editedId = typeof editSite.getEditedPostId === 'function' ? editSite.getEditedPostId() : '';

					if ( editedType || editedId ) {
						surface = 'site';
						postType = editedType || postType;
						templateId = editedId || templateId;
					}
				}
			} catch ( error ) {}

			return {
				surface,
				postType,
				templateId,
				productSlug,
				articleId: null,
			};
		},
		[ productSlug ]
	);
}

function DocsPlugin() {
	if ( ! PluginSidebar || ! PluginSidebarMoreMenuItem ) {
		return null;
	}

	const data = getDocsData();
	const context = useEditorContext();
	const title = data.copy && data.copy.title ? data.copy.title : __( 'Pixelgrade Docs', 'pixelgrade_assistant' );
	const menuLabel = data.copy && data.copy.menuLabel ? data.copy.menuLabel : title;

	return createElement(
		Fragment,
		null,
		createElement(
			PluginSidebarMoreMenuItem,
			{ target: 'pixelgrade-docs' },
			menuLabel
		),
		createElement(
			PluginSidebar,
			{
				name: 'pixelgrade-docs',
				title,
				icon: 'book',
			},
			createElement( KbPanel, { context, EscalationSlot: SLOT_FILL.Slot } )
		)
	);
}

registerPlugin( 'pixelgrade-docs', {
	render: DocsPlugin,
	icon: 'book',
} );
