/**
 * The free Help tab (#47).
 *
 * Reuses the KB panel source from the editor docs bundle (#46) with escalation enabled, so a
 * connected free account can send a support request right from the dashboard (the promise the
 * Account tab makes). BaseEscalation degrades gracefully when no account is connected, showing a
 * "Connect a free account" prompt instead of the ticket form. Data comes from
 * `window.pixelgradeHelp`, localized on the hub page with the same endpoint/copy/product/account
 * payload as the editor docs panel.
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
		createElement( KbPanel, { context, showEscalation: true } )
	);
}
