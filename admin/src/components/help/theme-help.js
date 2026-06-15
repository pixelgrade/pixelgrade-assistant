import React from 'react';
import _ from 'lodash';
import Helpers from '../../helpers';

/**
 * Theme Help — a self-contained, account-free documentation side panel.
 *
 * It lazily loads the active theme's public docs (knowledge base) when first opened, lets the
 * user browse categories → articles, read an article inline, search client-side across all
 * articles, and leave a "was this helpful?" vote. No AWS/ElasticSearch, no account, no tickets.
 *
 * Data comes from the `kbCategories` REST endpoint (a server-cached, public docs fetch). If the
 * theme has no knowledge base, the panel falls back to a link to the online documentation.
 */
class ThemeHelp extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			open: false,
			loading: false,
			loaded: false,
			error: false,
			categories: [],     // [{ id, name, articles: [article] }]
			allArticles: [],    // flat list for search
			search: '',
			activeCategory: null,
			activeArticle: null,
			feedback: {},       // { [articleId]: 'up' | 'down' }
		};

		this.open = this.open.bind( this );
		this.close = this.close.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onSearch = this.onSearch.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.onKeyDown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.onKeyDown );
	}

	onKeyDown( e ) {
		if ( e.key === 'Escape' && this.state.open ) {
			this.close();
		}
	}

	open() {
		this.setState( { open: true } );
		if ( ! this.state.loaded && ! this.state.loading ) {
			this.fetchDocs();
		}
	}

	close() {
		this.setState( { open: false } );
	}

	fetchDocs() {
		const endpoint = _.get( pixassist, 'wpRest.endpoint.kbCategories' );
		if ( ! endpoint || ! endpoint.url ) {
			this.setState( { error: true } );
			return;
		}

		this.setState( { loading: true, error: false } );

		Helpers.$ajax(
			endpoint.url,
			endpoint.method || 'GET',
			{},
			( response ) => {
				if ( response && response.code === 'success' ) {
					const categories = this.normalize( _.get( response, 'data.categories', [] ) );
					const allArticles = _.flatten( categories.map( ( c ) => c.articles ) );
					this.setState( { categories, allArticles, loaded: true, loading: false } );
				} else {
					this.setState( { error: true, loading: false } );
				}
			},
			() => this.setState( { error: true, loading: false } )
		);
	}

	/**
	 * Flatten the (possibly nested) categories tree into a simple
	 * [{ id, name, articles: [{ id, title, content, excerpt, url }] }] shape.
	 */
	normalize( raw ) {
		const list = Array.isArray( raw ) ? raw : Object.values( raw || {} );

		const mapArticles = ( articles ) => {
			const arr = Array.isArray( articles ) ? articles : Object.values( articles || {} );
			return arr.map( ( a ) => ( {
				id: a.ID || a.id,
				title: Helpers.decodeHtml( a.post_title || a.title || '' ),
				content: a.post_content || '',
				excerpt: a.post_excerpt || '',
				url: a.external_url || a.url || a.guid || '',
			} ) );
		};

		// Gather a category's own articles plus any nested children's articles.
		const gather = ( cat ) => {
			let articles = mapArticles( cat.articles );
			const children = cat.children || cat.subcategories || cat.sub_categories;
			if ( ! _.isEmpty( children ) ) {
				const childList = Array.isArray( children ) ? children : Object.values( children );
				childList.forEach( ( child ) => {
					articles = articles.concat( gather( child ) );
				} );
			}
			return articles;
		};

		return list
			.map( ( cat ) => ( {
				id: cat.term_id || cat.cat_ID || cat.id,
				name: Helpers.decodeHtml( cat.name || cat.cat_name || '' ),
				articles: gather( cat ),
			} ) )
			.filter( ( cat ) => cat.articles.length > 0 );
	}

	onSearch( e ) {
		this.setState( { search: e.target.value, activeArticle: null } );
	}

	openCategory( category ) {
		this.setState( { activeCategory: category, activeArticle: null, search: '' } );
	}

	openArticle( article ) {
		this.setState( { activeArticle: article } );
		const panel = document.querySelector( '.pixassist-help__body' );
		if ( panel ) {
			panel.scrollTop = 0;
		}
	}

	back() {
		this.setState( { activeArticle: null } );
	}

	vote( article, value ) {
		// Reflect the vote immediately; record it best-effort (never block the UI on it).
		this.setState( ( prev ) => ( { feedback: { ...prev.feedback, [ article.id ]: value } } ) );

		const endpoint = _.get( pixassist, 'wpRest.endpoint.kbVote' );
		if ( endpoint && endpoint.url && article.id ) {
			Helpers.$ajax( endpoint.url, endpoint.method || 'POST', { key: article.id, vote: value }, () => {}, () => {} );
		}
	}

	getSearchResults() {
		const q = this.state.search.trim().toLowerCase();
		if ( ! q ) {
			return [];
		}
		const plain = ( html ) => ( html || '' ).replace( /<[^>]*>/g, ' ' ).toLowerCase();
		return this.state.allArticles.filter( ( a ) =>
			a.title.toLowerCase().indexOf( q ) !== -1 || plain( a.content ).indexOf( q ) !== -1
		).slice( 0, 30 );
	}

	l10n( key, fallback ) {
		return Helpers.decodeHtml( _.get( pixassist, 'themeConfig.l10n.' + key, fallback ) );
	}

	renderArticle( article ) {
		const vote = this.state.feedback[ article.id ];
		return (
			<div className="pixassist-help__article">
				<button type="button" className="pixassist-help__back" onClick={() => this.back()}>
					&larr; {this.l10n( 'themeHelpBack', 'Back' )}
				</button>
				<h3 className="pixassist-help__article-title">{article.title}</h3>
				<div className="pixassist-help__article-content entry-content"
					dangerouslySetInnerHTML={{ __html: article.content }} />
				<div className="pixassist-help__feedback">
					{vote
						? <span className="pixassist-help__feedback-thanks">{this.l10n( 'themeHelpFeedbackThanks', 'Thanks for your feedback!' )}</span>
						: <React.Fragment>
							<span>{this.l10n( 'themeHelpFeedbackPrompt', 'Was this helpful?' )}</span>
							<button type="button" className="pixassist-help__feedback-btn" onClick={() => this.vote( article, 'up' )}>{this.l10n( 'themeHelpFeedbackYes', 'Yes' )}</button>
							<button type="button" className="pixassist-help__feedback-btn" onClick={() => this.vote( article, 'down' )}>{this.l10n( 'themeHelpFeedbackNo', 'No' )}</button>
						</React.Fragment>}
				</div>
				{article.url
					? <p className="pixassist-help__article-link"><a href={article.url} target="_blank" rel="noopener noreferrer">{this.l10n( 'themeHelpReadOnline', 'Read this article online' )} &rarr;</a></p>
					: null}
			</div>
		);
	}

	renderArticleList( articles ) {
		if ( ! articles.length ) {
			return <p className="pixassist-help__empty">{this.l10n( 'themeHelpNoResults', 'No matching articles.' )}</p>;
		}
		return (
			<ul className="pixassist-help__articles">
				{articles.map( ( a ) => (
					<li key={a.id}>
						<button type="button" onClick={() => this.openArticle( a )}>{a.title}</button>
					</li>
				) )}
			</ul>
		);
	}

	renderBrowse() {
		const { activeCategory, categories } = this.state;
		if ( activeCategory ) {
			return (
				<div className="pixassist-help__category">
					<button type="button" className="pixassist-help__back" onClick={() => this.openCategory( null )}>
						&larr; {this.l10n( 'themeHelpAllTopics', 'All topics' )}
					</button>
					<h3 className="pixassist-help__category-title">{activeCategory.name}</h3>
					{this.renderArticleList( activeCategory.articles )}
				</div>
			);
		}
		return (
			<ul className="pixassist-help__categories">
				{categories.map( ( c ) => (
					<li key={c.id}>
						<button type="button" onClick={() => this.openCategory( c )}>
							<span className="pixassist-help__category-name">{c.name}</span>
							<span className="pixassist-help__category-count">{c.articles.length}</span>
						</button>
					</li>
				) )}
			</ul>
		);
	}

	renderFallback() {
		const docsUrl = _.get( pixassist, 'help.docsUrl', 'https://pixelgrade.com/docs' );
		return (
			<div className="pixassist-help__fallback">
				<p>{this.l10n( 'themeHelpFallback', 'Browse the full documentation for step-by-step guides and answers.' )}</p>
				<a className="btn btn--action" href={docsUrl} target="_blank" rel="noopener noreferrer">
					{this.l10n( 'themeHelpBrowseDocs', 'Browse the documentation' )} &rarr;
				</a>
			</div>
		);
	}

	renderBody() {
		const { loading, error, loaded, categories, activeArticle, search } = this.state;

		if ( loading ) {
			return <div className="pixassist-help__loading"><span className="pixassist-help__spinner" />{this.l10n( 'themeHelpLoading', 'Loading documentation…' )}</div>;
		}
		if ( error ) {
			return this.renderFallback();
		}
		if ( activeArticle ) {
			return this.renderArticle( activeArticle );
		}
		if ( search.trim() ) {
			return this.renderArticleList( this.getSearchResults() );
		}
		if ( loaded && ! categories.length ) {
			return this.renderFallback();
		}
		return this.renderBrowse();
	}

	render() {
		const { open } = this.state;
		const showSearch = ! this.state.activeArticle && ! this.state.error && ( this.state.loaded || this.state.loading );

		return (
			<div className={'pixassist-help' + ( open ? ' is-open' : '' )}>
				<button type="button" className="pixassist-help__trigger" onClick={this.open}>
					{this.l10n( 'kbButton', 'Theme Help' )}
				</button>

				{open
					? <React.Fragment>
						<div className="pixassist-help__overlay" onClick={this.close} />
						<aside className="pixassist-help__panel" role="dialog" aria-label={this.l10n( 'kbButton', 'Theme Help' )}>
							<div className="pixassist-help__header">
								<h2>{this.l10n( 'kbButton', 'Theme Help' )}</h2>
								<button type="button" className="pixassist-help__close" aria-label="Close" onClick={this.close}>&times;</button>
							</div>
							{showSearch
								? <div className="pixassist-help__search">
									<input type="search" value={this.state.search} onChange={this.onSearch}
										placeholder={this.l10n( 'themeHelpSearchPlaceholder', 'Search the documentation…' )} />
								</div>
								: null}
							<div className="pixassist-help__body">
								{this.renderBody()}
							</div>
						</aside>
					</React.Fragment>
					: null}
			</div>
		);
	}
}

export default ThemeHelp;
