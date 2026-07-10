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
import { createElement, createPortal, Fragment, useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Icon,
	Notice,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { close as closeIcon, dragHandle, external as externalIcon, help as helpIcon, lineSolid } from '@wordpress/icons';
import {
	categoryArticles,
	fetchArticle,
	fetchCategories,
	flattenArticles,
	getDocsData,
	searchArticles,
	submitTicket,
	voteArticle,
} from './data';
import {
	DOCS_EVENT_CLOSE,
	DOCS_EVENT_OPEN_ARTICLE,
	DOCS_EVENT_OPEN_BROWSE,
	DOCS_EVENT_OPEN_GUIDE,
	DOCS_EVENT_OPENSTATE,
	emitDocsGuideAction,
	normalizeDocsGuidePayload,
	registerDocsWindowListener,
	setDocsOpenCookie,
	unregisterDocsWindowListener,
} from './events';

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

function Breadcrumbs( { path, onBack } ) {
	if ( ! path || ! path.length ) {
		return null;
	}

	const crumbs = path.map( ( name, index ) =>
		createElement(
			'span',
			{ key: index, className: 'pixelgrade-docs__crumb' },
			( onBack || index > 0 ? ' › ' : '' ) + name
		)
	);

	// In master-detail (the Help tab) there is no standalone Back button, and the static crumbs read
	// as clickable but aren't — give a real way back to the category overview.
	if ( onBack ) {
		crumbs.unshift(
			createElement(
				Button,
				{
					key: 'all-topics',
					variant: 'link',
					className: 'pixelgrade-docs__crumb pixelgrade-docs__crumb--back',
					onClick: onBack,
				},
				getCopy( 'allTopics', __( 'All topics', 'pixelgrade_assistant' ) )
			)
		);
	}

	return createElement( 'nav', { className: 'pixelgrade-docs__breadcrumbs' }, crumbs );
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
		// onEscalate is absent in the lightweight article pop-up; there we just record the down-vote
		// and show the empathetic note without the (panel-only) "Send to support" hand-off.
		return createElement(
			'div',
			{ className: 'pixelgrade-docs__feedback is-negative' },
			createElement( 'p', null, '😕 ' + getCopy( 'feedbackNoPrompt', __( 'Sorry about that — what were you looking for?', 'pixelgrade_assistant' ) ) ),
			onEscalate
				? createElement( TextareaControl, {
						value: note,
						onChange: setNote,
						rows: 3,
						placeholder: getCopy( 'feedbackNoPlaceholder', __( 'Tell us what you needed (optional). We will help.', 'pixelgrade_assistant' ) ),
				  } )
				: null,
			onEscalate
				? createElement(
						Button,
						{ variant: 'primary', onClick: () => onEscalate( article, note ) },
						getCopy( 'feedbackSendToSupport', __( 'Send to support', 'pixelgrade_assistant' ) )
				  )
				: null
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

export function ArticleView( { article, allArticles, context, feedback, layout, onBack, onVote, onOpenArticle, onEscalate, showTitle = true, showReadOnline = true } ) {
	return createElement(
		'div',
		{ className: 'pixelgrade-docs__article' },
		'master-detail' !== layout
			? createElement( Button, { variant: 'link', onClick: onBack }, getCopy( 'back', __( 'Back', 'pixelgrade_assistant' ) ) )
			: null,
		createElement( Breadcrumbs, { path: article.categoryPath, onBack: 'master-detail' === layout ? onBack : null } ),
		false === showTitle
			? null
			: createElement( 'h2', { className: 'pixelgrade-docs__article-title' }, article.title ),
		createElement( 'div', {
			className: 'pixelgrade-docs__article-content entry-content',
			dangerouslySetInnerHTML: { __html: article.content },
		} ),
		false !== showReadOnline && article.url
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

export function KbPanel( { context, layout, EscalationSlot, showEscalation = true, initialArticleId = null, onActiveArticleChange } ) {
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
	const onActiveArticleChangeRef = useRef( onActiveArticleChange );
	const restoredArticleRef = useRef( false );
	// Freeze the to-restore id at first render so the report round-trip (which momentarily sets it null)
	// can't clobber what we're about to restore.
	const initialArticleIdRef = useRef( initialArticleId );

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

	// Keep the reporting callback fresh without re-subscribing.
	useEffect( () => {
		onActiveArticleChangeRef.current = onActiveArticleChange;
	} );

	// Restore a persisted drill-down article once categories are in, so the floating window can follow
	// the user back to the exact article they were reading (not just the browse root) across reloads.
	// Uses the frozen ref + settles after the first category load so later drill-downs don't re-trigger.
	useEffect( () => {
		if ( restoredArticleRef.current || ! allArticles.length ) {
			return;
		}
		const target = initialArticleIdRef.current;
		if ( target ) {
			const found = allArticles.find( ( item ) => String( item.id ) === String( target ) );
			if ( found ) {
				setActiveArticle( found );
			}
		}
		restoredArticleRef.current = true;
	}, [ allArticles ] );

	// Report the current article up so the window persists it for the next page — but only AFTER the
	// initial restore has settled, so the mount-time null (and the restore itself) don't wipe it.
	useEffect( () => {
		if ( ! restoredArticleRef.current || ! onActiveArticleChangeRef.current ) {
			return;
		}
		onActiveArticleChangeRef.current( activeArticle );
	}, [ activeArticle ] );

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

// openDocsArticle / openDocsBrowse / closeDocsWindow + the cross-bundle listener counter live in
// ./events (React-free) so the editor-launcher bundle and the editor-agnostic window bundle share them.

const DOCS_WINDOW_STORAGE_KEY = 'pixassistDocsWindow';
const DOCS_WINDOW_WIDTH = 360;
const DOCS_WINDOW_MARGIN = 16;
const DOCS_WINDOW_NARROW = 783; // below this, render as a full-width bottom sheet (no drag).

function loadDocsWindowState() {
	try {
		const parsed = JSON.parse( window.localStorage.getItem( DOCS_WINDOW_STORAGE_KEY ) );

		return parsed && 'object' === typeof parsed ? parsed : {};
	} catch ( error ) {
		return {};
	}
}

function saveDocsWindowState( state ) {
	try {
		window.localStorage.setItem( DOCS_WINDOW_STORAGE_KEY, JSON.stringify( state ) );
	} catch ( error ) {}
}

function clampDocsWindowPosition( left, top ) {
	if ( 'undefined' === typeof window ) {
		return { left, top };
	}

	const maxLeft = Math.max( DOCS_WINDOW_MARGIN, window.innerWidth - DOCS_WINDOW_WIDTH - DOCS_WINDOW_MARGIN );
	const maxTop = Math.max( DOCS_WINDOW_MARGIN, window.innerHeight - 120 );

	return {
		left: Math.min( Math.max( DOCS_WINDOW_MARGIN, Math.round( left ) ), maxLeft ),
		top: Math.min( Math.max( DOCS_WINDOW_MARGIN, Math.round( top ) ), maxTop ),
	};
}

function defaultDocsWindowPosition() {
	if ( 'undefined' === typeof window ) {
		return { left: DOCS_WINDOW_MARGIN, top: 80 };
	}

	// Out of the way by default: lower-left of the viewport.
	return clampDocsWindowPosition( DOCS_WINDOW_MARGIN, window.innerHeight - 560 );
}

/**
 * Companion-authored guide body (openDocsGuide()): pre-rendered HTML styled like an article, plus
 * action buttons that dispatch DOCS_EVENT_GUIDE_ACTION back to the companion that owns the guide.
 * The payload is fully serializable — no companion React crosses into this root. Inline elements
 * carrying a `data-guide-action` attribute inside the content dispatch the same way, so guides can
 * embed contextual links (e.g. "Show me the block") without shipping any script.
 */
function GuideView( { guide } ) {
	const actions = Array.isArray( guide.actions ) ? guide.actions : [];

	const onContentClick = ( event ) => {
		const trigger = event.target && event.target.closest ? event.target.closest( '[data-guide-action]' ) : null;

		if ( ! trigger ) {
			return;
		}

		event.preventDefault();
		emitDocsGuideAction( guide.id, trigger.getAttribute( 'data-guide-action' ) );
	};

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__guide' },
		createElement( 'div', {
			className: 'pixelgrade-docs__article-content entry-content',
			onClick: onContentClick,
			dangerouslySetInnerHTML: { __html: guide.content },
		} ),
		actions.length
			? createElement(
					'div',
					{ className: 'pixelgrade-docs__guide-actions' },
					actions.map( ( action ) =>
						createElement(
							Button,
							{
								key: action.id,
								variant: 'secondary',
								isDestructive: !! action.isDestructive,
								onClick: () => emitDocsGuideAction( guide.id, action.id ),
							},
							action.label
						)
					)
			  )
			: null
	);
}

/**
 * In-editor article pop-up — a MODELESS, draggable, minimizable floating window (not a blocking
 * modal). Listens for openDocsArticle(), fetches a single (fresh) article, and shows it over the
 * editor while the editor stays fully interactive, so the user can read a doc and act on it at the
 * same time. Drag it out of the way, minimize it to a corner chip, and it reopens where it was left.
 * Falls back to opening the online docs when the article can't be resolved in this product's KB.
 */
export function DocsArticleWindow( props ) {
	// Optional editor context + escalation Slot, supplied by the docs plugin so the in-window browse
	// (KbPanel) can prefill support requests just like the old docked sidebar did.
	const windowContext = ( props && props.context ) || {};
	const EscalationSlot = props && props.EscalationSlot ? props.EscalationSlot : null;

	// Hydrate the open request so the window FOLLOWS the user across full admin page reloads: if it was
	// left open (persisted) we reopen to the same article/browse; ?pixassist_open_docs=1 (localized as
	// autoOpen) opens the browser fresh from a plain admin page.
	const [ request, setRequest ] = useState( () => {
		const saved = loadDocsWindowState();
		if ( saved && saved.request && 'object' === typeof saved.request ) {
			return saved.request;
		}
		const data = getDocsData();
		return data && data.autoOpen ? { browse: true } : null;
	} );
	const [ article, setArticle ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ notFound, setNotFound ] = useState( false );
	const [ feedback, setFeedback ] = useState( {} );

	const [ position, setPosition ] = useState( () => {
		const saved = loadDocsWindowState();

		return null != saved.left && null != saved.top ? clampDocsWindowPosition( saved.left, saved.top ) : defaultDocsWindowPosition();
	} );
	const [ minimized, setMinimized ] = useState( () => !! loadDocsWindowState().minimized );
	// The article the user drilled into while BROWSING (KbPanel-internal state we lift up so it persists
	// across page reloads — otherwise navigating reopens the browse root, losing the article).
	const [ browseArticleId, setBrowseArticleId ] = useState( () => loadDocsWindowState().browseArticleId || null );
	const [ dragging, setDragging ] = useState( false );
	const [ narrow, setNarrow ] = useState( () => 'undefined' !== typeof window && window.innerWidth < DOCS_WINDOW_NARROW );

	const panelRef = useRef( null );
	const dragRef = useRef( null );
	const previousFocusRef = useRef( null );
	const closeRef = useRef( null );
	const justOpenedRef = useRef( false );
	// Mirror of `request` for the mount-only event listeners (guide re-pushes must know the current
	// request without re-registering listeners).
	const requestRef = useRef( null );

	useEffect( () => {
		requestRef.current = request;
	}, [ request ] );

	// Return focus to whatever was focused when the window opened (a11y: a surface that programmatically
	// takes focus must hand it back on dismiss). Best-effort; guard against the trigger leaving the DOM.
	const restoreFocus = useCallback( () => {
		const target = previousFocusRef.current;
		if ( target && target.focus && 'undefined' !== typeof document && document.contains( target ) ) {
			try {
				target.focus();
			} catch ( error ) {}
		}
	}, [] );

	const close = useCallback( () => {
		setRequest( null );
		setArticle( null );
		setNotFound( false );
		setFeedback( {} );
		setBrowseArticleId( null );
		restoreFocus();
	}, [ restoreFocus ] );

	// Keep a stable ref so the mount-only event listeners always call the latest close().
	useEffect( () => {
		closeRef.current = close;
	}, [ close ] );

	// Register the open/close listeners; openDocsArticle() returns truthy only while one is mounted.
	// Three entry points share this single window: open-article (a specific article, e.g. from a
	// companion's openArticle()), open-browse (the editor toolbar opens/​restores the KB browser),
	// and close (the toolbar toggles it shut).
	useEffect( () => {
		const rememberTrigger = () => {
			// Remember the trigger so focus can return there on close/minimize.
			previousFocusRef.current = 'undefined' !== typeof document ? document.activeElement : null;
		};
		const onOpenArticle = ( event ) => {
			rememberTrigger();
			justOpenedRef.current = true;
			setRequest( ( event && event.detail ) || {} );
			setMinimized( false ); // a freshly-requested article always shows.
		};
		const onOpenBrowse = () => {
			rememberTrigger();
			justOpenedRef.current = true;
			// Restore an existing reading session if there is one; otherwise open at the browse root.
			setRequest( ( prev ) => ( prev ? prev : { browse: true } ) );
			setMinimized( false );
		};
		const onOpenGuide = ( event ) => {
			// Normalize again at the receiving boundary so direct CustomEvent dispatches cannot bypass
			// the public openGuide() contract.
			const payload = normalizeDocsGuidePayload( event && event.detail );
			if ( ! payload ) {
				return;
			}
			// A re-push of the SAME guide is a live content update (e.g. a checklist step completing):
			// swap the payload in place without stealing focus or un-minimizing the window.
			const prev = requestRef.current;
			const sameGuide = !! ( prev && prev.guide && prev.guide.id === payload.id );
			if ( ! sameGuide ) {
				rememberTrigger();
				justOpenedRef.current = true;
				setMinimized( false );
			}
			setRequest( { guide: payload } );
		};
		const onCloseEvent = () => {
			if ( closeRef.current ) {
				closeRef.current();
			}
		};

		registerDocsWindowListener();
		window.addEventListener( DOCS_EVENT_OPEN_ARTICLE, onOpenArticle );
		window.addEventListener( DOCS_EVENT_OPEN_BROWSE, onOpenBrowse );
		window.addEventListener( DOCS_EVENT_OPEN_GUIDE, onOpenGuide );
		window.addEventListener( DOCS_EVENT_CLOSE, onCloseEvent );

		return () => {
			unregisterDocsWindowListener();
			window.removeEventListener( DOCS_EVENT_OPEN_ARTICLE, onOpenArticle );
			window.removeEventListener( DOCS_EVENT_OPEN_BROWSE, onOpenBrowse );
			window.removeEventListener( DOCS_EVENT_OPEN_GUIDE, onOpenGuide );
			window.removeEventListener( DOCS_EVENT_CLOSE, onCloseEvent );
		};
	}, [] );

	// Fetch the requested article (cache-first, fresh retry on a miss, online fallback otherwise).
	useEffect( () => {
		if ( ! request ) {
			return undefined;
		}

		// Guide mode carries its own pre-rendered content — nothing to fetch.
		if ( request.guide ) {
			setLoading( false );
			setNotFound( false );
			setArticle( null );
			setFeedback( {} );

			return undefined;
		}

		// Browse mode has no single-article target — KbPanel fetches its own categories.
		if ( request.browse && ! request.id && ! request.url && ! request.slug ) {
			setLoading( false );
			setNotFound( false );
			setArticle( null );
			setFeedback( {} );

			return undefined;
		}

		let mounted = true;
		setLoading( true );
		setNotFound( false );
		setArticle( null );
		setFeedback( {} );

		const openOnlineOrNotice = () => {
			if ( ! mounted ) {
				return;
			}
			if ( request.url && 'undefined' !== typeof window ) {
				window.open( request.url, '_blank', 'noopener,noreferrer' );
				setRequest( null );
			} else {
				setNotFound( true );
			}
			setLoading( false );
		};

		const show = ( found ) => {
			if ( ! mounted ) {
				return;
			}
			setArticle( found );
			setLoading( false );
		};

		fetchArticle( { id: request.id, url: request.url, slug: request.slug } )
			.then( ( found ) => {
				if ( found ) {
					show( found );

					return null;
				}

				return fetchArticle( { id: request.id, url: request.url, slug: request.slug, skipCache: true } ).then( ( fresh ) => {
					if ( fresh ) {
						show( fresh );
					} else {
						openOnlineOrNotice();
					}
				} );
			} )
			.catch( () => {
				openOnlineOrNotice();
			} );

		return () => {
			mounted = false;
		};
	}, [ request ] );

	// Track viewport width (drag is desktop-only; narrow viewports get a bottom sheet) + re-clamp.
	useEffect( () => {
		if ( 'undefined' === typeof window ) {
			return undefined;
		}

		const onResize = () => {
			setNarrow( window.innerWidth < DOCS_WINDOW_NARROW );
			setPosition( ( prev ) => clampDocsWindowPosition( prev.left, prev.top ) );
		};

		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [] );

	// Persist position + minimized + the open request so the window reopens where the user left it
	// (and on the next admin page). The cookie must track `request` too, so it's a dependency.
	useEffect( () => {
		// Guides are page-scoped (their owner re-opens them when its context is back), so they neither
		// persist across reloads nor keep the follow-everywhere cookie alive.
		const persistableRequest = request && request.guide ? null : request;
		saveDocsWindowState( { left: position.left, top: position.top, minimized, request: persistableRequest, browseArticleId } );
		// Mirror open/closed to a cookie so PHP enqueues the window bundle on the next admin page only
		// while it's open — this is what makes it follow the user without loading anything when closed.
		setDocsOpenCookie( !! persistableRequest );
	}, [ position.left, position.top, minimized, request, browseArticleId ] );

	// Broadcast open/minimized state so the editor toolbar toggle can reflect it (pressed/active).
	useEffect( () => {
		if ( 'undefined' === typeof window || ! window.CustomEvent ) {
			return;
		}

		window.dispatchEvent( new window.CustomEvent( DOCS_EVENT_OPENSTATE, { detail: { open: !! request, minimized: !! minimized } } ) );
	}, [ request, minimized ] );

	// Modeless focus: move focus into the panel ONCE when it opens (NOT trapped — the user can tab
	// back out, and we don't steal focus on every drill-down while browsing).
	useEffect( () => {
		const ready = !! request && ! minimized && ( !! request.browse || !! request.guide || !! article );
		if ( ready && justOpenedRef.current && panelRef.current && panelRef.current.focus ) {
			panelRef.current.focus();
			justOpenedRef.current = false;
		}
	}, [ request, article, minimized ] );

	// ESC closes (modeless, so we listen on the window rather than relying on a modal).
	useEffect( () => {
		if ( ! request ) {
			return undefined;
		}

		const onKey = ( event ) => {
			// Modeless: only self-close on an ESC that's "ours" — not one the editor already handled,
			// and only when focus is inside the (non-minimized) window. Don't hijack the editor's
			// global ESC (dismiss popover / exit block / clear selection).
			if ( 'Escape' === event.key && ! event.defaultPrevented && ! minimized && panelRef.current && panelRef.current.contains( document.activeElement ) ) {
				close();
			}
		};

		window.addEventListener( 'keydown', onKey );

		return () => window.removeEventListener( 'keydown', onKey );
	}, [ request, minimized, close ] );

	const onHeaderPointerDown = useCallback(
		( event ) => {
			// No drag on the bottom sheet, on non-primary buttons, or from the action buttons.
			if ( narrow || ( event.button && 0 !== event.button ) || ( event.target && event.target.closest && event.target.closest( 'button, a' ) ) ) {
				return;
			}

			const start = panelRef.current ? panelRef.current.getBoundingClientRect() : position;
			dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, left: start.left, top: start.top };
			setDragging( true );
			event.preventDefault();
		},
		[ narrow, position ]
	);

	// While dragging, a transparent full-window shield keeps pointer events flowing over the Site
	// Editor canvas iframe (which would otherwise swallow them and stall the drag).
	useEffect( () => {
		if ( ! dragging ) {
			return undefined;
		}

		const onMove = ( event ) => {
			const drag = dragRef.current;
			if ( ! drag ) {
				return;
			}
			setPosition( clampDocsWindowPosition( drag.left + ( event.clientX - drag.pointerX ), drag.top + ( event.clientY - drag.pointerY ) ) );
		};

		const onUp = () => {
			setDragging( false );
			dragRef.current = null;
		};

		window.addEventListener( 'pointermove', onMove );
		window.addEventListener( 'pointerup', onUp );

		return () => {
			window.removeEventListener( 'pointermove', onMove );
			window.removeEventListener( 'pointerup', onUp );
		};
	}, [ dragging ] );

	if ( ! request || 'undefined' === typeof document ) {
		return null;
	}

	const onVote = ( current, direction ) => {
		setFeedback( ( prev ) => ( { ...prev, [ current.id ]: direction } ) );
		voteArticle( current, direction, { surface: 'docs-window', articleId: current.id } ).catch( () => {} );
	};

	const title = request.guide && request.guide.title
		? request.guide.title
		: ( article
			? article.title
			: ( loading ? getCopy( 'articleLoading', __( 'Loading article…', 'pixelgrade_assistant' ) ) : getCopy( 'title', __( 'Pixelgrade Design Docs', 'pixelgrade_assistant' ) ) ) );

	// Minimized: a small chip docked bottom-left; click to restore, with its own close.
	if ( minimized ) {
		return createPortal(
			createElement(
				'div',
				{ className: 'pixelgrade-docs-window__chip' },
				createElement(
					Button,
					{ className: 'pixelgrade-docs-window__chip-open', icon: helpIcon, iconSize: 20, onClick: () => setMinimized( false ) },
					createElement( 'span', { className: 'pixelgrade-docs-window__chip-label' }, title )
				),
				createElement( Button, {
					className: 'pixelgrade-docs-window__chip-close',
					icon: closeIcon,
					iconSize: 18,
					label: getCopy( 'close', __( 'Close', 'pixelgrade_assistant' ) ),
					showTooltip: true,
					onClick: close,
				} )
			),
			document.body
		);
	}

	// Browse mode: the window IS the docs browser — KbPanel handles categories, search, drill-down,
	// in-window article reading and escalation, all inside the same native chrome.
	const browseMode = !! request.browse;

	let body;

	if ( request.guide ) {
		// Companion guide: pre-rendered content + action buttons wired back over the event bus.
		body = createElement( GuideView, { guide: request.guide } );
	} else if ( browseMode ) {
		body = createElement( KbPanel, {
			context: windowContext,
			layout: 'compact',
			EscalationSlot,
			showEscalation: true,
			// Persist + restore the drilled-in article so the window follows the user to it across reloads.
			initialArticleId: browseArticleId,
			onActiveArticleChange: ( article ) => setBrowseArticleId( article ? article.id : null ),
		} );
	} else if ( loading ) {
		body = createElement(
			'div',
			{ className: 'pixelgrade-docs__loading' },
			createElement( Spinner, null ),
			createElement( 'span', null, getCopy( 'articleLoading', __( 'Loading article…', 'pixelgrade_assistant' ) ) )
		);
	} else if ( notFound ) {
		body = createElement( DocsFallback, { message: getCopy( 'articleNotFound', __( 'We could not open that article here — try the online docs.', 'pixelgrade_assistant' ) ) } );
	} else if ( article ) {
		body = createElement( ArticleView, {
			article,
			allArticles: [],
			context: { surface: 'docs-window', articleId: article.id },
			feedback,
			layout: 'master-detail', // suppress the inline "Back" link; the window header has its own close
			onBack: close,
			onVote,
			onOpenArticle: () => {},
			onEscalate: null,
			showTitle: false, // the article title lives in the window header
			showReadOnline: false, // replaced by the "Open in new tab" header action
		} );
	} else {
		body = null;
	}

	const openExternal = article && article.url
		? createElement( Button, {
				className: 'pixelgrade-docs-window__btn',
				icon: externalIcon,
				iconSize: 20,
				href: article.url,
				target: '_blank',
				rel: 'noreferrer noopener',
				label: getCopy( 'openInNewTab', __( 'Open in new tab', 'pixelgrade_assistant' ) ),
				showTooltip: true,
		  } )
		: null;

	const windowStyle = narrow
		? undefined
		: {
				left: position.left + 'px',
				top: position.top + 'px',
				width: DOCS_WINDOW_WIDTH + 'px',
				// Cap the height to the space below `top` so a tall article's body always fits + scrolls
				// in view, even when the window is parked low.
				maxHeight: 'calc(100vh - ' + ( position.top + DOCS_WINDOW_MARGIN ) + 'px)',
		  };

	return createPortal(
		createElement(
			Fragment,
			null,
			dragging ? createElement( 'div', { className: 'pixelgrade-docs-window__shield' } ) : null,
			createElement(
				'section',
				{
					className: 'pixelgrade-docs-window' + ( narrow ? ' is-bottom-sheet' : '' ) + ( dragging ? ' is-dragging' : '' ),
					role: 'dialog',
					'aria-modal': 'false',
					'aria-label': title,
					tabIndex: -1,
					ref: panelRef,
					style: windowStyle,
				},
				createElement(
					'header',
					{ className: 'pixelgrade-docs-window__header', onPointerDown: onHeaderPointerDown },
					narrow ? null : createElement( Icon, { className: 'pixelgrade-docs-window__grip', icon: dragHandle, size: 18 } ),
					createElement( 'span', { className: 'pixelgrade-docs-window__title' }, title ),
					createElement(
						'div',
						{ className: 'pixelgrade-docs-window__actions' },
						openExternal,
						narrow ? null : createElement( Button, {
							className: 'pixelgrade-docs-window__btn',
							icon: lineSolid,
							iconSize: 20,
							label: getCopy( 'minimize', __( 'Minimize', 'pixelgrade_assistant' ) ),
							showTooltip: true,
							onClick: () => {
								setMinimized( true );
								restoreFocus();
							},
						} ),
						createElement( Button, {
							className: 'pixelgrade-docs-window__btn',
							icon: closeIcon,
							iconSize: 20,
							label: getCopy( 'close', __( 'Close', 'pixelgrade_assistant' ) ),
							showTooltip: true,
							onClick: close,
						} )
					)
				),
				createElement( 'div', { className: 'pixelgrade-docs pixelgrade-docs--window' }, body )
			)
		),
		document.body
	);
}
