/**
 * Shared KB data layer for the editor docs panel (#46) and the Help hub tab (#47).
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

	if ( 'undefined' !== typeof window && window.pixelgradeHelp ) {
		return window.pixelgradeHelp;
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

function mapArticle( article, categoryName, categoryId, categoryPath ) {
	return {
		id: String( article.ID || article.id || '' ),
		title: decodeHtml( article.post_title || article.title || '' ),
		content: article.post_content || article.content || '',
		excerpt: decodeHtml( article.post_excerpt || article.excerpt || '' ),
		url: article.external_url || article.url || article.guid || '',
		category: categoryName || '',
		categoryId: categoryId ? String( categoryId ) : '',
		categoryPath: Array.isArray( categoryPath ) ? categoryPath : [],
	};
}

function childrenOf( category ) {
	return category.children || category.subcategories || category.sub_categories;
}

/**
 * Recursively normalize a category and its sub-categories, preserving the tree.
 *
 * Each node keeps its DIRECT articles plus normalized `children`; every article carries
 * the full `categoryPath` (root -> here) and its immediate `categoryId` so the panel can
 * render breadcrumbs and same-category "related" lists without re-walking the tree.
 */
function normalizeCategoryNode( rawCategory, parentPath ) {
	const name = decodeHtml( rawCategory.name || rawCategory.cat_name || '' );
	const id = String( rawCategory.term_id || rawCategory.cat_ID || rawCategory.id || name );
	const path = parentPath.concat( name );

	const articles = asList( rawCategory.articles )
		.map( ( article ) => mapArticle( article, name, id, path ) )
		.filter( ( article ) => article.id && article.title );

	const children = asList( childrenOf( rawCategory ) )
		.map( ( child ) => normalizeCategoryNode( child, path ) )
		.filter( ( child ) => child.articleCount > 0 );

	const articleCount = articles.length + children.reduce( ( total, child ) => total + child.articleCount, 0 );

	return { id, name, path, articles, children, articleCount };
}

export function normalizeCategories( rawCategories ) {
	return asList( rawCategories )
		.map( ( category ) => normalizeCategoryNode( category, [] ) )
		.filter( ( category ) => category.name && category.articleCount > 0 );
}

/**
 * Flatten every article in a category forest (direct + all descendants).
 *
 * Used for global search and the landing state.
 */
export function flattenArticles( categories ) {
	const result = [];

	const walk = ( nodes ) => {
		asList( nodes ).forEach( ( node ) => {
			( node.articles || [] ).forEach( ( article ) => result.push( article ) );
			walk( node.children );
		} );
	};

	walk( categories );

	return result;
}

/**
 * Flatten one category subtree into a single article list (direct + descendants),
 * preserving the legacy "a category view lists all of its articles" behavior.
 */
export function categoryArticles( category ) {
	return category ? flattenArticles( [ category ] ) : [];
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

export function fetchArticle( options = {} ) {
	const data = getDocsData();
	const endpoint = data.endpoints && data.endpoints.article ? data.endpoints.article : {};
	const path = addQueryArgs( endpoint.path || '/pixassist/v1/kb_article', {
		pixassist_nonce: getPixassistNonce(),
		id: options.id || '',
		url: options.url || '',
		slug: options.slug || '',
		skip_cache: options.skipCache ? '1' : '',
	} );

	return apiFetch( {
		path,
		method: endpoint.method || 'GET',
	} ).then( ( response ) => {
		const article = response && response.data ? response.data.article : null;

		if ( ! article ) {
			return null;
		}

		const breadcrumbs = Array.isArray( article.breadcrumbs ) ? article.breadcrumbs.map( decodeHtml ) : [];

		return {
			id: String( article.id || '' ),
			title: decodeHtml( article.title || '' ),
			content: article.content || '',
			url: article.url || '',
			// ArticleView reads `categoryPath` for breadcrumbs; alias the server's `breadcrumbs`.
			categoryPath: breadcrumbs,
			breadcrumbs,
		};
	} );
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
