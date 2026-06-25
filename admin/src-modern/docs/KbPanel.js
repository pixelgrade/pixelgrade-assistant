/**
 * Reusable Pixelgrade KB panel.
 *
 * No JSX; shared by the editor PluginSidebar and the Help hub tab through the `layout` prop:
 *   - layout="compact"        -> narrow editor sidebar; single-column drill-down.
 *   - layout="master-detail"  -> wide Help tab; left category tree + right reading pane.
 *
 * Both layouts share the data, search, per-article feedback and escalation logic. The escalation
 * is never gated: it surfaces inline article suggestions as the user types (soft deflection), and a
 * "No, this didn't help" vote turns into a pre-filled support request.
 */
import { createElement, Fragment, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Notice,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import {
	categoryArticles,
	fetchCategories,
	flattenArticles,
	getDocsData,
	searchArticles,
	submitTicket,
	voteArticle,
} from './data';

function getCopy( key, fallback ) {
	const data = getDocsData();

	return data.copy && data.copy[ key ] ? data.copy[ key ] : fallback;
}

function renderArticleList( articles, onOpen ) {
	if ( ! articles.length ) {
		return createElement(
			'p',
			{ className: 'pixelgrade-docs__empty' },
			getCopy( 'empty', __( 'No matching articles.', 'pixelgrade_assistant' ) )
		);
	}

	return createElement(
		'ul',
		{ className: 'pixelgrade-docs__article-list' },
		articles.map( ( article ) =>
			createElement(
				'li',
				{ key: article.id },
				createElement(
					Button,
					{
						variant: 'link',
						onClick: () => onOpen( article ),
					},
					article.title
				)
			)
		)
	);
}

function DocsFallback( { message } ) {
	const data = getDocsData();

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__fallback' },
		createElement(
			'p',
			null,
			message || getCopy( 'fallback', __( 'Browse the full documentation for step-by-step guides and answers.', 'pixelgrade_assistant' ) )
		),
		createElement(
			Button,
			{
				href: data.product && data.product.docsUrl ? data.product.docsUrl : 'https://pixelgrade.com/docs',
				target: '_blank',
				rel: 'noreferrer noopener',
				variant: 'secondary',
			},
			getCopy( 'browseDocs', __( 'Browse docs', 'pixelgrade_assistant' ) )
		)
	);
}

function CategoryList( { categories, onOpen } ) {
	if ( ! categories.length ) {
		return createElement( DocsFallback, null );
	}

	return createElement(
		'ul',
		{ className: 'pixelgrade-docs__categories' },
		categories.map( ( category ) =>
			createElement(
				'li',
				{ key: category.id },
				createElement(
					Button,
					{
						variant: 'secondary',
						onClick: () => onOpen( category ),
						style: {
							justifyContent: 'space-between',
							width: '100%',
							marginBottom: '8px',
						},
					},
					category.name + ' (' + category.articleCount + ')'
				)
			)
		)
	);
}

function Breadcrumbs( { path } ) {
	if ( ! path || ! path.length ) {
		return null;
	}

	return createElement(
		'nav',
		{ className: 'pixelgrade-docs__breadcrumbs' },
		path.map( ( name, index ) =>
			createElement(
				'span',
				{ key: index, className: 'pixelgrade-docs__crumb' },
				( index > 0 ? ' › ' : '' ) + name
			)
		)
	);
}

function CategoryTree( { nodes, expanded, activeArticleId, onToggle, onOpenArticle, depth } ) {
	const level = depth || 0;

	return createElement(
		'ul',
		{ className: 'pixelgrade-docs__tree' + ( level ? ' is-nested' : '' ) },
		nodes.map( ( node ) => {
			const isOpen = expanded[ node.id ];
			const hasChildren = node.children && node.children.length;

			return createElement(
				'li',
				{ key: node.id, className: 'pixelgrade-docs__tree-category' },
				createElement(
					Button,
					{
						variant: 'tertiary',
						className: 'pixelgrade-docs__tree-toggle' + ( isOpen ? ' is-open' : '' ),
						onClick: () => onToggle( node.id ),
					},
					( isOpen ? '▾ ' : '▸ ' ) + node.name + ' (' + node.articleCount + ')'
				),
				isOpen
					? createElement(
							Fragment,
							null,
							node.articles.length
								? createElement(
										'ul',
										{ className: 'pixelgrade-docs__tree-articles' },
										node.articles.map( ( article ) =>
											createElement(
												'li',
												{ key: article.id },
												createElement(
													Button,
													{
														variant: 'link',
														className: 'pixelgrade-docs__tree-article' + ( article.id === activeArticleId ? ' is-active' : '' ),
														onClick: () => onOpenArticle( article ),
													},
													article.title
												)
											)
										)
								  )
								: null,
							hasChildren
								? createElement( CategoryTree, {
										nodes: node.children,
										expanded,
										activeArticleId,
										onToggle,
										onOpenArticle,
										depth: level + 1,
								  } )
								: null
					  )
					: null
			);
		} )
	);
}

function RelatedArticles( { current, allArticles, onOpenArticle } ) {
	const related = allArticles
		.filter( ( article ) => article.id !== current.id && article.categoryId && article.categoryId === current.categoryId )
		.slice( 0, 5 );

	if ( ! related.length ) {
		return null;
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__related' },
		createElement( 'h3', null, getCopy( 'relatedTitle', __( 'Related articles', 'pixelgrade_assistant' ) ) ),
		createElement(
			'ul',
			null,
			related.map( ( article ) =>
				createElement(
					'li',
					{ key: article.id },
					createElement(
						Button,
						{ variant: 'link', onClick: () => onOpenArticle( article ) },
						article.title
					)
				)
			)
		)
	);
}

function Landing( { categories, onOpenArticle, onExpand } ) {
	if ( ! categories.length ) {
		return createElement( DocsFallback, null );
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__landing' },
		createElement( 'h2', null, getCopy( 'welcomeTitle', __( 'How can we help?', 'pixelgrade_assistant' ) ) ),
		createElement( 'p', null, getCopy( 'welcomeText', __( 'Search the documentation, or browse a topic to get started.', 'pixelgrade_assistant' ) ) ),
		createElement(
			'div',
			{ className: 'pixelgrade-docs__landing-grid' },
			categories.map( ( category ) =>
				createElement(
					'div',
					{ key: category.id, className: 'pixelgrade-docs__landing-card' },
					createElement(
						'h3',
						null,
						createElement(
							Button,
							{ variant: 'link', onClick: () => onExpand( category.id ) },
							category.name + ' (' + category.articleCount + ')'
						)
					),
					createElement(
						'ul',
						null,
						categoryArticles( category )
							.slice( 0, 4 )
							.map( ( article ) =>
								createElement(
									'li',
									{ key: article.id },
									createElement(
										Button,
										{ variant: 'link', onClick: () => onOpenArticle( article ) },
										article.title
									)
								)
							)
					)
				)
			)
		)
	);
}

function ArticleFeedback( { article, vote, context, onVote, onEscalate } ) {
	const [ note, setNote ] = useState( '' );

	if ( 'up' === vote ) {
		return createElement(
			'div',
			{ className: 'pixelgrade-docs__feedback is-positive' },
			createElement( 'p', null, '😊 ' + getCopy( 'feedbackThanks', __( 'Thanks for your feedback.', 'pixelgrade_assistant' ) ) )
		);
	}

	if ( 'down' === vote ) {
		return createElement(
			'div',
			{ className: 'pixelgrade-docs__feedback is-negative' },
			createElement( 'p', null, '😕 ' + getCopy( 'feedbackNoPrompt', __( 'Sorry about that — what were you looking for?', 'pixelgrade_assistant' ) ) ),
			createElement( TextareaControl, {
				value: note,
				onChange: setNote,
				rows: 3,
				placeholder: getCopy( 'feedbackNoPlaceholder', __( 'Tell us what you needed (optional). We will help.', 'pixelgrade_assistant' ) ),
			} ),
			createElement(
				Button,
				{ variant: 'primary', onClick: () => onEscalate( article, note ) },
				getCopy( 'feedbackSendToSupport', __( 'Send to support', 'pixelgrade_assistant' ) )
			)
		);
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__feedback' },
		createElement( 'p', null, getCopy( 'feedbackPrompt', __( 'Was this helpful?', 'pixelgrade_assistant' ) ) ),
		createElement(
			'div',
			{ className: 'pixelgrade-docs__feedback-actions' },
			createElement(
				Button,
				{ variant: 'secondary', onClick: () => onVote( article, 'up', context ) },
				getCopy( 'feedbackYes', __( 'Yes', 'pixelgrade_assistant' ) )
			),
			createElement(
				Button,
				{ variant: 'secondary', onClick: () => onVote( article, 'down', context ) },
				getCopy( 'feedbackNo', __( 'No', 'pixelgrade_assistant' ) )
			)
		)
	);
}

function ArticleView( { article, allArticles, context, feedback, layout, onBack, onVote, onOpenArticle, onEscalate } ) {
	return createElement(
		'div',
		{ className: 'pixelgrade-docs__article' },
		'master-detail' !== layout
			? createElement( Button, { variant: 'link', onClick: onBack }, getCopy( 'back', __( 'Back', 'pixelgrade_assistant' ) ) )
			: null,
		createElement( Breadcrumbs, { path: article.categoryPath } ),
		createElement( 'h2', { className: 'pixelgrade-docs__article-title' }, article.title ),
		createElement( 'div', {
			className: 'pixelgrade-docs__article-content entry-content',
			dangerouslySetInnerHTML: { __html: article.content },
		} ),
		article.url
			? createElement(
					'p',
					{ className: 'pixelgrade-docs__read-online' },
					createElement(
						Button,
						{ href: article.url, target: '_blank', rel: 'noreferrer noopener', variant: 'link' },
						getCopy( 'readOnline', __( 'Read online', 'pixelgrade_assistant' ) )
					)
			  )
			: null,
		createElement( ArticleFeedback, {
			article,
			vote: feedback[ article.id ],
			context,
			onVote,
			onEscalate,
		} ),
		createElement( RelatedArticles, { current: article, allArticles, onOpenArticle } )
	);
}

function EscalationSuggestions( { articles, onOpenArticle } ) {
	if ( ! articles.length ) {
		return null;
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__suggestions' },
		createElement( 'p', { className: 'pixelgrade-docs__suggestions-title' }, getCopy( 'suggestionsTitle', __( 'These articles might already answer it:', 'pixelgrade_assistant' ) ) ),
		createElement(
			'ul',
			null,
			articles.map( ( article ) =>
				createElement(
					'li',
					{ key: article.id },
					createElement(
						Button,
						{ variant: 'link', onClick: () => onOpenArticle( article ) },
						article.title
					)
				)
			)
		)
	);
}

function BaseEscalation( { context, allArticles, onOpenArticle, prefill } ) {
	const data = getDocsData();
	const account = data.account || {};
	const [ subject, setSubject ] = useState( '' );
	const [ details, setDetails ] = useState( '' );
	const [ topic, setTopic ] = useState( 'help' );
	const [ status, setStatus ] = useState( null );
	const [ submitting, setSubmitting ] = useState( false );
	const [ unhelpfulArticleId, setUnhelpfulArticleId ] = useState( '' );
	const subjectMaxLength = data.ticket && data.ticket.subjectMaxLength ? Number( data.ticket.subjectMaxLength ) : 120;
	const subjectTooLong = subjectMaxLength > 0 && subject.length > subjectMaxLength;
	const subjectHelp = getCopy( 'ticketSubjectHelp', __( 'Keep the subject under %d characters. Add extra context in Details.', 'pixelgrade_assistant' ) ).replace( '%d', subjectMaxLength );

	// A "No, this didn't help" vote pre-fills the request with the article + the reader's note.
	useEffect( () => {
		if ( prefill ) {
			setSubject( prefill.subject || '' );
			setDetails( prefill.details || '' );
			setUnhelpfulArticleId( prefill.unhelpfulArticleId || '' );
			setStatus( null );
		}
	}, [ prefill ] );

	// Soft deflection: surface matching articles as the subject is typed. Never blocks submitting.
	const suggestions = useMemo( () => {
		if ( subject.trim().length < 3 ) {
			return [];
		}

		return searchArticles( allArticles, subject ).slice( 0, 4 );
	}, [ allArticles, subject ] );

	if ( ! account.is_connected ) {
		return createElement(
			'div',
			{ className: 'pixelgrade-docs__escalation' },
			createElement( Notice, { status: 'info', isDismissible: false }, getCopy( 'connectDescription', __( 'Connect a free pixelgrade.com account to send a support request — free for everyone. Browsing the docs stays open without it.', 'pixelgrade_assistant' ) ) ),
			createElement(
				Button,
				{
					href: data.product && data.product.accountUrl ? data.product.accountUrl : '',
					variant: 'secondary',
				},
				getCopy( 'connectLabel', __( 'Connect account', 'pixelgrade_assistant' ) )
			)
		);
	}

	const onSubmit = () => {
		setSubmitting( true );
		setStatus( null );

		// Carry what the reader already saw so AI/agent triage starts from "they saw X and are still stuck".
		const ticketContext = {
			...context,
			suggested_ids: suggestions.map( ( article ) => article.id ).join( ',' ),
			unhelpful_article_id: unhelpfulArticleId,
		};

		submitTicket(
			{
				subject,
				details,
				topic,
				tag: 'bug' === topic ? 'bug' : 'support',
			},
			ticketContext
		)
			.then( ( response ) => {
				setSubmitting( false );
				if ( response && 'success' === response.code ) {
					setSubject( '' );
					setDetails( '' );
					setUnhelpfulArticleId( '' );
					setStatus( { type: 'success', message: response.message || getCopy( 'ticketSuccess', __( 'Your request has been sent.', 'pixelgrade_assistant' ) ) } );
				} else {
					setStatus( { type: 'error', message: response && response.message ? response.message : getCopy( 'ticketFailure', __( 'The request could not be sent. Please try again.', 'pixelgrade_assistant' ) ) } );
				}
			} )
			.catch( ( error ) => {
				setSubmitting( false );
				setStatus( { type: 'error', message: error && error.message ? error.message : getCopy( 'ticketFailure', __( 'The request could not be sent. Please try again.', 'pixelgrade_assistant' ) ) } );
			} );
	};

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__escalation' },
		createElement( 'h2', null, getCopy( 'escalationTitle', __( 'Still need help?', 'pixelgrade_assistant' ) ) ),
		createElement( 'p', null, getCopy( 'escalationDescription', __( 'Send the current context to Pixelgrade support.', 'pixelgrade_assistant' ) ) ),
		status ? createElement( Notice, { status: status.type, isDismissible: false }, status.message ) : null,
		subjectTooLong ? createElement( Notice, { status: 'warning', isDismissible: false }, getCopy( 'ticketSubjectTooLong', __( 'The subject is too long. Shorten it and move the extra context to Details.', 'pixelgrade_assistant' ) ) ) : null,
		createElement( SelectControl, {
			label: getCopy( 'ticketTopicLabel', __( 'Type', 'pixelgrade_assistant' ) ),
			value: topic,
			options: [
				{ label: getCopy( 'ticketTopicHelp', __( 'Help request', 'pixelgrade_assistant' ) ), value: 'help' },
				{ label: getCopy( 'ticketTopicBug', __( 'Bug report', 'pixelgrade_assistant' ) ), value: 'bug' },
			],
			onChange: setTopic,
		} ),
		createElement( TextControl, {
			label: getCopy( 'ticketSubjectLabel', __( 'Subject', 'pixelgrade_assistant' ) ),
			__next40pxDefaultSize: true,
			value: subject,
			onChange: setSubject,
			maxLength: subjectMaxLength,
			help: subjectHelp,
		} ),
		createElement( EscalationSuggestions, { articles: suggestions, onOpenArticle } ),
		createElement( TextareaControl, {
			label: getCopy( 'ticketDetailsLabel', __( 'Details', 'pixelgrade_assistant' ) ),
			value: details,
			onChange: setDetails,
		} ),
		createElement(
			Button,
			{
				variant: 'primary',
				isBusy: submitting,
				disabled: submitting || ! subject.trim() || ! details.trim() || subjectTooLong,
				onClick: onSubmit,
			},
			submitting
				? getCopy( 'ticketSubmittingLabel', __( 'Sending...', 'pixelgrade_assistant' ) )
				: getCopy( 'ticketSubmitLabel', __( 'Send request', 'pixelgrade_assistant' ) )
		)
	);
}

export function KbPanel( { context, layout, EscalationSlot, showEscalation = true } ) {
	const mode = 'master-detail' === layout ? 'master-detail' : 'compact';
	const [ categories, setCategories ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( false );
	const [ search, setSearch ] = useState( '' );
	const [ activeCategory, setActiveCategory ] = useState( null );
	const [ activeArticle, setActiveArticle ] = useState( null );
	const [ feedback, setFeedback ] = useState( {} );
	const [ expanded, setExpanded ] = useState( {} );
	const [ escalationPrefill, setEscalationPrefill ] = useState( null );
	const escalationRef = useRef( null );

	useEffect( () => {
		let mounted = true;

		fetchCategories()
			.then( ( nextCategories ) => {
				if ( mounted ) {
					setCategories( nextCategories );
					setLoading( false );
					setError( false );
				}
			} )
			.catch( () => {
				if ( mounted ) {
					setLoading( false );
					setError( true );
				}
			} );

		return () => {
			mounted = false;
		};
	}, [] );

	// When a "No" vote escalates, bring the (always-present) request form into view.
	useEffect( () => {
		if ( escalationPrefill && escalationRef.current && escalationRef.current.scrollIntoView ) {
			escalationRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		}
	}, [ escalationPrefill ] );

	const allArticles = useMemo( () => flattenArticles( categories ), [ categories ] );
	const searchResults = useMemo( () => searchArticles( allArticles, search ), [ allArticles, search ] );
	const activeContext = {
		...context,
		articleId: activeArticle ? activeArticle.id : null,
	};

	const onOpenArticle = ( article ) => {
		// Leave the search term intact: the compact drill-down relies on "Back" returning the user to
		// their results, and master-detail keeps the matches in the left rail while they read.
		setActiveArticle( article );
	};

	const onVote = ( article, direction, voteContext ) => {
		setFeedback( ( current ) => ( { ...current, [ article.id ]: direction } ) );
		voteArticle( article, direction, voteContext ).catch( () => {} );
	};

	const onEscalate = ( article, note ) => {
		setEscalationPrefill( {
			subject: article.title,
			details: note || '',
			unhelpfulArticleId: article.id,
		} );
	};

	const onToggleNode = ( id ) => {
		setExpanded( ( current ) => ( { ...current, [ id ]: ! current[ id ] } ) );
	};

	const onExpandNode = ( id ) => {
		setExpanded( ( current ) => ( { ...current, [ id ]: true } ) );
	};

	const articleView = ( withBack ) =>
		createElement( ArticleView, {
			article: activeArticle,
			allArticles,
			context: activeContext,
			feedback,
			layout: withBack ? 'compact' : 'master-detail',
			onBack: () => setActiveArticle( null ),
			onVote,
			onOpenArticle,
			onEscalate,
		} );

	const searchField = ( extraClass ) =>
		createElement( TextControl, {
			className: extraClass,
			label: getCopy( 'searchPlaceholder', __( 'Search the documentation...', 'pixelgrade_assistant' ) ),
			__next40pxDefaultSize: true,
			hideLabelFromVision: true,
			type: 'search',
			value: search,
			onChange: ( value ) => {
				setSearch( value );
				setActiveCategory( null );
			},
			placeholder: getCopy( 'searchPlaceholder', __( 'Search the documentation...', 'pixelgrade_assistant' ) ),
		} );

	const escalation = showEscalation
		? createElement(
				'div',
				{ className: 'pixelgrade-docs__escalation-wrap', ref: escalationRef },
				createElement( BaseEscalation, {
					context: activeContext,
					allArticles,
					onOpenArticle,
					prefill: escalationPrefill,
				} ),
				EscalationSlot ? createElement( EscalationSlot, { fillProps: { context: activeContext } } ) : null
		  )
		: null;

	if ( loading ) {
		return createElement(
			'div',
			{ className: 'pixelgrade-docs pixelgrade-docs--' + mode },
			createElement(
				'div',
				{ className: 'pixelgrade-docs__loading' },
				createElement( Spinner, null ),
				createElement( 'span', null, getCopy( 'loading', __( 'Loading documentation...', 'pixelgrade_assistant' ) ) )
			)
		);
	}

	// Master-detail: persistent left tree + right reading pane.
	if ( 'master-detail' === mode ) {
		const leftBody = search.trim()
			? renderArticleList( searchResults, onOpenArticle )
			: createElement( CategoryTree, {
					nodes: categories,
					expanded,
					activeArticleId: activeArticle ? activeArticle.id : null,
					onToggle: onToggleNode,
					onOpenArticle,
			  } );

		const rightBody = activeArticle
			? articleView( false )
			: createElement( Landing, { categories, onOpenArticle, onExpand: onExpandNode } );

		return createElement(
			'div',
			{ className: 'pixelgrade-docs pixelgrade-docs--master-detail' },
			createElement(
				'div',
				{ className: 'pixelgrade-docs__layout' },
				createElement(
					'aside',
					{ className: 'pixelgrade-docs__sidebar' },
					searchField( 'pixelgrade-docs__search' ),
					error ? createElement( DocsFallback, null ) : leftBody
				),
				createElement(
					'section',
					{ className: 'pixelgrade-docs__main' },
					rightBody,
					escalation
				)
			)
		);
	}

	// Compact: single-column drill-down (editor sidebar).
	let body;

	if ( error ) {
		body = createElement( CategoryList, { categories: [], onOpen: setActiveCategory } );
	} else if ( activeArticle ) {
		body = articleView( true );
	} else if ( search.trim() ) {
		body = searchResults.length
			? renderArticleList( searchResults, onOpenArticle )
			: createElement( Fragment, null, renderArticleList( searchResults, onOpenArticle ), createElement( DocsFallback, null ) );
	} else if ( activeCategory ) {
		body = createElement(
			'div',
			null,
			createElement(
				Button,
				{ variant: 'link', onClick: () => setActiveCategory( null ) },
				getCopy( 'allTopics', __( 'All topics', 'pixelgrade_assistant' ) )
			),
			createElement( 'h2', null, activeCategory.name ),
			renderArticleList( categoryArticles( activeCategory ), onOpenArticle )
		);
	} else {
		body = createElement( CategoryList, { categories, onOpen: setActiveCategory } );
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs pixelgrade-docs--compact' },
		! activeArticle ? searchField( 'pixelgrade-docs__search' ) : null,
		body,
		escalation
	);
}
