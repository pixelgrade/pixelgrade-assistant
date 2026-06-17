/**
 * Reusable Pixelgrade KB panel.
 *
 * No JSX; shared by the editor PluginSidebar now and the Help hub tab later.
 */
import { createElement, Fragment, useEffect, useMemo, useState } from '@wordpress/element';
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

function CategoryList( { categories, onOpen } ) {
	if ( ! categories.length ) {
		const data = getDocsData();

		return createElement(
			'div',
			{ className: 'pixelgrade-docs__fallback' },
			createElement( 'p', null, getCopy( 'fallback', __( 'Browse the full documentation for step-by-step guides and answers.', 'pixelgrade_assistant' ) ) ),
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
					category.name + ' (' + category.articles.length + ')'
				)
			)
		)
	);
}

function ArticleView( { article, context, feedback, onBack, onVote } ) {
	const data = getDocsData();
	const vote = feedback[ article.id ];

	return createElement(
		'div',
		{ className: 'pixelgrade-docs__article' },
		createElement(
			Button,
			{
				variant: 'link',
				onClick: onBack,
			},
			getCopy( 'back', __( 'Back', 'pixelgrade_assistant' ) )
		),
		createElement( 'h2', null, article.title ),
		createElement( 'div', {
			className: 'pixelgrade-docs__article-content entry-content',
			dangerouslySetInnerHTML: { __html: article.content },
		} ),
		createElement(
			'div',
			{
				className: 'pixelgrade-docs__feedback',
				style: { marginTop: '16px' },
			},
			vote
				? createElement(
						'p',
						null,
						getCopy( 'feedbackThanks', __( 'Thanks for your feedback.', 'pixelgrade_assistant' ) )
				  )
				: createElement(
						Fragment,
						null,
						createElement(
							'p',
							null,
							getCopy( 'feedbackPrompt', __( 'Was this helpful?', 'pixelgrade_assistant' ) )
						),
						createElement(
							'div',
							{ style: { display: 'flex', gap: '8px' } },
							createElement(
								Button,
								{
									variant: 'secondary',
									onClick: () => onVote( article, 'up', context ),
								},
								getCopy( 'feedbackYes', __( 'Yes', 'pixelgrade_assistant' ) )
							),
							createElement(
								Button,
								{
									variant: 'secondary',
									onClick: () => onVote( article, 'down', context ),
								},
								getCopy( 'feedbackNo', __( 'No', 'pixelgrade_assistant' ) )
							)
						)
				  )
		),
		article.url
			? createElement(
					'p',
					null,
					createElement(
						Button,
						{
							href: article.url,
							target: '_blank',
							rel: 'noreferrer noopener',
							variant: 'link',
						},
						getCopy( 'readOnline', __( 'Read online', 'pixelgrade_assistant' ) )
					)
			  )
			: null,
		data.product && data.product.docsUrl
			? createElement( 'span', { className: 'screen-reader-text' }, data.product.docsUrl )
			: null
	);
}

function BaseEscalation( { context } ) {
	const data = getDocsData();
	const account = data.account || {};
	const [ subject, setSubject ] = useState( '' );
	const [ details, setDetails ] = useState( '' );
	const [ topic, setTopic ] = useState( 'help' );
	const [ status, setStatus ] = useState( null );
	const [ submitting, setSubmitting ] = useState( false );

	if ( ! account.is_connected ) {
		return createElement(
			'div',
			{
				className: 'pixelgrade-docs__escalation',
				style: { borderTop: '1px solid #ddd', marginTop: '20px', paddingTop: '16px' },
			},
			createElement( Notice, { status: 'info', isDismissible: false }, getCopy( 'connectDescription', __( 'Connect a free pixelgrade.com account before sending a support request.', 'pixelgrade_assistant' ) ) ),
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

		submitTicket(
			{
				subject,
				details,
				topic,
				tag: 'bug' === topic ? 'bug' : 'support',
			},
			context
		)
			.then( ( response ) => {
				setSubmitting( false );
				if ( response && 'success' === response.code ) {
					setSubject( '' );
					setDetails( '' );
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
		{
			className: 'pixelgrade-docs__escalation',
			style: { borderTop: '1px solid #ddd', marginTop: '20px', paddingTop: '16px' },
		},
		createElement( 'h2', null, getCopy( 'escalationTitle', __( 'Still need help?', 'pixelgrade_assistant' ) ) ),
		createElement( 'p', null, getCopy( 'escalationDescription', __( 'Send the current context to Pixelgrade support.', 'pixelgrade_assistant' ) ) ),
		status ? createElement( Notice, { status: status.type, isDismissible: false }, status.message ) : null,
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
		} ),
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
				disabled: submitting || ! subject.trim() || ! details.trim(),
				onClick: onSubmit,
			},
			submitting
				? getCopy( 'ticketSubmittingLabel', __( 'Sending...', 'pixelgrade_assistant' ) )
				: getCopy( 'ticketSubmitLabel', __( 'Send request', 'pixelgrade_assistant' ) )
		)
	);
}

export function KbPanel( { context, EscalationSlot, showEscalation = true } ) {
	const [ categories, setCategories ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( false );
	const [ search, setSearch ] = useState( '' );
	const [ activeCategory, setActiveCategory ] = useState( null );
	const [ activeArticle, setActiveArticle ] = useState( null );
	const [ feedback, setFeedback ] = useState( {} );

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

	const allArticles = useMemo( () => flattenArticles( categories ), [ categories ] );
	const searchResults = useMemo( () => searchArticles( allArticles, search ), [ allArticles, search ] );
	const activeContext = {
		...context,
		articleId: activeArticle ? activeArticle.id : null,
	};

	const onOpenArticle = ( article ) => {
		setActiveArticle( article );
	};

	const onVote = ( article, direction, voteContext ) => {
		setFeedback( ( current ) => ( { ...current, [ article.id ]: direction } ) );
		voteArticle( article, direction, voteContext ).catch( () => {} );
	};

	let body;

	if ( loading ) {
		body = createElement(
			'div',
			{ className: 'pixelgrade-docs__loading' },
			createElement( Spinner, null ),
			createElement( 'span', null, getCopy( 'loading', __( 'Loading documentation...', 'pixelgrade_assistant' ) ) )
		);
	} else if ( error ) {
		body = createElement( CategoryList, { categories: [], onOpen: setActiveCategory } );
	} else if ( activeArticle ) {
		body = createElement( ArticleView, {
			article: activeArticle,
			context: activeContext,
			feedback,
			onBack: () => setActiveArticle( null ),
			onVote,
		} );
	} else if ( search.trim() ) {
		body = renderArticleList( searchResults, onOpenArticle );
	} else if ( activeCategory ) {
		body = createElement(
			'div',
			null,
			createElement(
				Button,
				{
					variant: 'link',
					onClick: () => setActiveCategory( null ),
				},
				getCopy( 'allTopics', __( 'All topics', 'pixelgrade_assistant' ) )
			),
			createElement( 'h2', null, activeCategory.name ),
			renderArticleList( activeCategory.articles, onOpenArticle )
		);
	} else {
		body = createElement( CategoryList, { categories, onOpen: setActiveCategory } );
	}

	return createElement(
		'div',
		{ className: 'pixelgrade-docs' },
		! activeArticle
			? createElement( TextControl, {
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
			  } )
			: null,
		body,
		showEscalation ? createElement( BaseEscalation, { context: activeContext } ) : null,
		showEscalation && EscalationSlot ? createElement( EscalationSlot, { fillProps: { context: activeContext } } ) : null
	);
}
