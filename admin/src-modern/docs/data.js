/**
 * Shared KB data layer for the editor docs panel (#46) and the future Help hub tab (#47).
 */
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';

const DEFAULT_DATA = {
	product: { sku: '', docsUrl: 'https://pixelgrade.com/docs', accountUrl: '' },
	endpoints: {},
	account: { is_connected: false },
	slotFill: { ticketRequestFilter: 'pixelgrade.docs.ticketRequest' },
	copy: {},
};

export function getDocsData() {
	if ( 'undefined' !== typeof window && window.pixelgradeDocs ) {
		return window.pixelgradeDocs;
	}

	return DEFAULT_DATA;
}

export function getPixassistNonce() {
	if (
		'undefined' !== typeof window &&
		window.pixassist &&
		window.pixassist.wpRest &&
		window.pixassist.wpRest.pixassist_nonce
	) {
		return window.pixassist.wpRest.pixassist_nonce;
	}

	return '';
}

function addQueryArgs( path, args ) {
	const pairs = Object.keys( args || {} )
		.filter( ( key ) => '' !== args[ key ] && null !== args[ key ] && undefined !== args[ key ] )
		.map( ( key ) => encodeURIComponent( key ) + '=' + encodeURIComponent( args[ key ] ) );

	if ( ! pairs.length ) {
		return path;
	}

	return path + ( -1 === path.indexOf( '?' ) ? '?' : '&' ) + pairs.join( '&' );
}

function decodeHtml( value ) {
	if ( 'undefined' === typeof document ) {
		return String( value || '' );
	}

	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = String( value || '' );

	return textarea.value;
}

function stripHtml( value ) {
	return String( value || '' ).replace( /<[^>]*>/g, ' ' );
}

function asList( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}

	if ( value && 'object' === typeof value ) {
		return Object.keys( value ).map( ( key ) => value[ key ] );
	}

	return [];
}

function mapArticle( article, categoryName ) {
	return {
		id: String( article.ID || article.id || '' ),
		title: decodeHtml( article.post_title || article.title || '' ),
		content: article.post_content || article.content || '',
		excerpt: decodeHtml( article.post_excerpt || article.excerpt || '' ),
		url: article.external_url || article.url || article.guid || '',
		category: categoryName || '',
	};
}

function gatherArticles( category, categoryName ) {
	let articles = asList( category.articles ).map( ( article ) => mapArticle( article, categoryName ) );
	const children = category.children || category.subcategories || category.sub_categories;

	asList( children ).forEach( ( child ) => {
		articles = articles.concat( gatherArticles( child, categoryName ) );
	} );

	return articles.filter( ( article ) => article.id && article.title );
}

export function normalizeCategories( rawCategories ) {
	return asList( rawCategories )
		.map( ( category ) => {
			const name = decodeHtml( category.name || category.cat_name || '' );
			const articles = gatherArticles( category, name );

			return {
				id: String( category.term_id || category.cat_ID || category.id || name ),
				name,
				articles,
			};
		} )
		.filter( ( category ) => category.name && category.articles.length );
}

export function flattenArticles( categories ) {
	return ( categories || [] ).reduce( ( result, category ) => result.concat( category.articles || [] ), [] );
}

export function searchArticles( articles, term ) {
	const query = String( term || '' ).trim().toLowerCase();

	if ( ! query ) {
		return [];
	}

	return ( articles || [] )
		.filter( ( article ) => {
			const haystack = [
				article.title,
				article.excerpt,
				article.category,
				stripHtml( article.content ),
			]
				.join( ' ' )
				.toLowerCase();

			return -1 !== haystack.indexOf( query );
		} )
		.slice( 0, 30 );
}

export function fetchCategories( options = {} ) {
	const data = getDocsData();
	const endpoint = data.endpoints && data.endpoints.categories ? data.endpoints.categories : {};
	const path = addQueryArgs( endpoint.path || '/pixassist/v1/kb_categories', {
		pixassist_nonce: getPixassistNonce(),
		skip_cache: options.skipCache ? '1' : '',
	} );

	return apiFetch( {
		path,
		method: endpoint.method || 'GET',
	} ).then( ( response ) => normalizeCategories( response && response.data ? response.data.categories : [] ) );
}

export function voteArticle( article, direction, context ) {
	const data = getDocsData();
	const endpoint = data.endpoints && data.endpoints.vote ? data.endpoints.vote : {};

	return apiFetch( {
		path: endpoint.path || '/pixassist/v1/kb_vote',
		method: endpoint.method || 'POST',
		data: {
			pixassist_nonce: getPixassistNonce(),
			article_id: article && article.id ? article.id : '',
			direction,
			context,
		},
	} );
}

export function submitTicket( request, context ) {
	const data = getDocsData();
	const endpoint = data.endpoints && data.endpoints.ticket ? data.endpoints.ticket : {};
	const filterName = data.slotFill && data.slotFill.ticketRequestFilter
		? data.slotFill.ticketRequestFilter
		: 'pixelgrade.docs.ticketRequest';

	const filtered = applyFilters(
		filterName,
		{
			...request,
			context,
		},
		context
	);

	return apiFetch( {
		path: endpoint.path || '/pixassist/v1/docs_ticket',
		method: endpoint.method || 'POST',
		data: {
			...filtered,
			pixassist_nonce: getPixassistNonce(),
		},
	} );
}
