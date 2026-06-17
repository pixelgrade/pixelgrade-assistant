/**
 * The free Help tab (#47).
 *
 * Reuses the KB panel source from the editor docs bundle (#46), with escalation hidden so this hub
 * tab stays a free browse/search/read surface. Data comes from `window.pixelgradeHelp`, localized on
 * the hub page with the same endpoint/copy/product payload as the editor docs panel.
 */
import { createElement } from '@wordpress/element';
import { KbPanel } from '../../docs/KbPanel';
import { getDocsData } from '../../docs/data';

export function HelpTab() {
	const data = getDocsData();
	const productSlug = data.product && data.product.sku ? data.product.sku : '';
	const context = {
		surface: 'hub',
		postType: '',
		templateId: '',
		productSlug,
		articleId: null,
	};

	return createElement(
		'div',
		{ className: 'pixelgrade-help' },
		createElement( KbPanel, { context, showEscalation: false } )
	);
}
