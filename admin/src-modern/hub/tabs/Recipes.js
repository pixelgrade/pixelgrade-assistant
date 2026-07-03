/**
 * Starter Recipes tab.
 *
 * Recipes apply a full source's layout units as one bundle while keeping the lower-level Layouts tab
 * available for follow-up deviations.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, CheckboxControl, Flex, FlexItem, Notice, Spinner } from '@wordpress/components';

const DEFAULT_RECIPES = {
	copy: {
		title: __( 'Recipes', 'pixelgrade_assistant' ),
		description: __( 'Apply a complete starter recipe as one bundle, then fine-tune individual layouts afterward.', 'pixelgrade_assistant' ),
		loadLabel: __( 'Load recipes', 'pixelgrade_assistant' ),
		loading: __( 'Loading recipes...', 'pixelgrade_assistant' ),
		empty: __( 'No recipes are available yet.', 'pixelgrade_assistant' ),
		failure: __( 'Recipes could not be loaded. Please try again.', 'pixelgrade_assistant' ),
		partialFailure: __( 'Some recipe sources could not be loaded.', 'pixelgrade_assistant' ),
		applyLabel: __( 'Apply', 'pixelgrade_assistant' ),
		applying: __( 'Applying recipe...', 'pixelgrade_assistant' ),
		applySuccess: __( 'Recipe applied.', 'pixelgrade_assistant' ),
		applyFailure: __( 'Recipe could not be applied. Please try again.', 'pixelgrade_assistant' ),
		appliedLabel: __( 'Applied', 'pixelgrade_assistant' ),
		removeLabel: __( 'Remove', 'pixelgrade_assistant' ),
		removing: __( 'Removing recipe...', 'pixelgrade_assistant' ),
		removeSuccess: __( 'Recipe removed.', 'pixelgrade_assistant' ),
		removeFailure: __( 'Recipe could not be removed. Please try again.', 'pixelgrade_assistant' ),
		lookLabel: __( 'Include look', 'pixelgrade_assistant' ),
		sampleLabel: __( 'Include sample content', 'pixelgrade_assistant' ),
		layoutOnly: __( 'Layout only by default', 'pixelgrade_assistant' ),
		partsLabel: __( 'Parts', 'pixelgrade_assistant' ),
		templatesLabel: __( 'Templates', 'pixelgrade_assistant' ),
		featuresLabel: __( 'Features', 'pixelgrade_assistant' ),
		sourceHeading: __( 'Source', 'pixelgrade_assistant' ),
		premiumLabel: __( 'Plus', 'pixelgrade_assistant' ),
		deviatedLabel: __( 'Customized after apply', 'pixelgrade_assistant' ),
	},
	sources: [],
	endpoints: {},
	applied: {},
};

function getRecipesData() {
	if ( typeof window !== 'undefined' && window.pixelgradeRecipes ) {
		return window.pixelgradeRecipes;
	}

	return DEFAULT_RECIPES;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_RECIPES.copy,
		...( copy || {} ),
	};
}

function getPixassistRest() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest ) {
		return window.pixassist.wpRest;
	}

	return {};
}

function getRestHeaders() {
	const rest = getPixassistRest();
	const headers = {
		'Content-Type': 'application/json',
	};

	if ( rest.nonce ) {
		headers[ 'X-WP-Nonce' ] = rest.nonce;
	}

	return headers;
}

function getEndpoint( data, key ) {
	if ( data.endpoints && data.endpoints[ key ] ) {
		return data.endpoints[ key ];
	}

	const rest = getPixassistRest();
	return rest.endpoint && rest.endpoint[ key ] ? rest.endpoint[ key ] : {};
}

async function fetchJson( url, options = {} ) {
	const response = await window.fetch( url, options );

	if ( ! response.ok ) {
		throw new Error( 'status ' + response.status );
	}

	return response.json();
}

async function restRequest( data, key, payload = {} ) {
	const endpoint = getEndpoint( data, key );
	const rest = getPixassistRest();

	if ( ! endpoint.url ) {
		throw new Error( 'missing_endpoint_' + key );
	}

	const response = await fetchJson( endpoint.url, {
		method: endpoint.method || 'POST',
		credentials: 'same-origin',
		headers: getRestHeaders(),
		body: JSON.stringify( {
			...payload,
			pixassist_nonce: rest.pixassist_nonce || '',
		} ),
	} );

	if ( response && response.code && 'success' !== response.code ) {
		throw new Error( response.message || response.code );
	}

	return response;
}

function normalizeObject( value ) {
	if ( ! value || 'object' !== typeof value || Array.isArray( value ) ) {
		return {};
	}

	return value;
}

function renderMessage( message ) {
	if ( ! message ) {
		return null;
	}

	return createElement(
		Notice,
		{
			status: message.type,
			isDismissible: false,
		},
		message.text
	);
}

function getBundleId( recipe ) {
	return recipe && recipe.id ? 'recipe:' + recipe.id : '';
}

function getRecipeImage( recipe ) {
	return recipe.image || recipe.previewImage || '';
}

function renderSourceBadge( recipe, copy ) {
	// Free is the default — only the gated exception earns a badge (master-strategy rule: state
	// free where the cost question lives, never chant it where the taste question lives).
	if ( ! recipe.gate ) {
		return null;
	}

	return createElement(
		'span',
		{
			style: {
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				color: '#50575e',
				display: 'inline-block',
				fontSize: '11px',
				lineHeight: '16px',
				padding: '0 6px',
			},
		},
		copy.premiumLabel
	);
}

function RecipeStats( { recipe, copy } ) {
	const groups = recipe.groups || {};
	const parts = Number( groups.parts || 0 );
	const templates = Number( groups.templates || 0 );
	const features = Number( groups.features || 0 );
	const stats = [
		parts ? sprintf( '%1$d %2$s', parts, copy.partsLabel ) : '',
		templates ? sprintf( '%1$d %2$s', templates, copy.templatesLabel ) : '',
		features ? sprintf( '%1$d %2$s', features, copy.featuresLabel ) : '',
	].filter( Boolean );

	return stats.length
		? createElement(
				'div',
				{ style: { color: '#646970', marginTop: '4px' } },
				stats.join( ' · ' )
		  )
		: null;
}

function RecipeCard( { recipe, applied, busyKey, copy, includeLook, includeSample, onApply, onUndo } ) {
	const bundleId = getBundleId( recipe );
	const appliedRecipe = applied[ bundleId ];
	const isApplied = Boolean( appliedRecipe && appliedRecipe.isApplied );
	const isDeviated = Boolean( appliedRecipe && ! appliedRecipe.isApplied );
	const isApplying = busyKey === 'apply:' + recipe.id;
	const isRemoving = busyKey === 'undo:' + recipe.id;
	const image = getRecipeImage( recipe );

	return createElement(
		Card,
		{ style: { marginTop: '16px' } },
		createElement(
			CardBody,
			null,
			createElement(
				'div',
				{
					style: {
						display: 'grid',
						gap: '16px',
						gridTemplateColumns: image ? '144px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto',
						alignItems: 'center',
					},
				},
				image
					? createElement( 'img', {
							alt: '',
							src: image,
							style: {
								aspectRatio: '4 / 3',
								background: '#f0f0f1',
								objectFit: 'cover',
								width: '144px',
							},
					  } )
					: null,
				createElement(
					'div',
					{ style: { minWidth: 0 } },
					createElement(
						'div',
						{ style: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
						createElement( 'h2', { style: { fontSize: '18px', margin: 0 } }, recipe.title || recipe.id ),
						renderSourceBadge( recipe, copy ),
						isApplied ? createElement( 'span', { style: { color: '#008a20', fontSize: '12px', fontWeight: 600 } }, copy.appliedLabel ) : null,
						isDeviated ? createElement( 'span', { style: { color: '#8a6d1d', fontSize: '12px', fontWeight: 600 } }, copy.deviatedLabel ) : null
					),
					recipe.description ? createElement( 'p', { style: { margin: '8px 0 0' } }, recipe.description ) : null,
					createElement( RecipeStats, { recipe, copy } ),
					createElement(
						'div',
						{ style: { color: '#646970', marginTop: '6px' } },
						copy.sourceHeading + ': ' + ( recipe.title || recipe.id )
					)
				),
				createElement(
					'div',
					{ style: { alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: '8px' } },
					createElement(
						Button,
						{
							variant: isApplied ? 'secondary' : 'primary',
							isBusy: isApplying,
							disabled: Boolean( busyKey ) || isApplied,
							onClick: () => onApply( recipe, { includeLook, includeSample } ),
						},
						isApplying ? copy.applying : isApplied ? copy.appliedLabel : copy.applyLabel
					),
					appliedRecipe
						? createElement(
								Button,
								{
									variant: 'secondary',
									isDestructive: true,
									isBusy: isRemoving,
									disabled: Boolean( busyKey ),
									onClick: () => onUndo( recipe ),
								},
								isRemoving ? copy.removing : copy.removeLabel
						  )
						: null
				)
			)
		)
	);
}

export function Recipes() {
	const data = getRecipesData();
	const copy = mergeCopy( data.copy );
	const [ recipes, setRecipes ] = useState( [] );
	const [ loaded, setLoaded ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ busyKey, setBusyKey ] = useState( '' );
	const [ message, setMessage ] = useState( null );
	const [ applied, setApplied ] = useState( normalizeObject( data.applied ) );
	const [ includeLook, setIncludeLook ] = useState( false );
	const [ includeSample, setIncludeSample ] = useState( false );

	const loadRecipes = async () => {
		setLoading( true );
		setLoaded( false );
		setMessage( null );
		setRecipes( [] );

		try {
			const response = await restRequest( data, 'recipes' );
			const responseData = response && response.data ? response.data : {};
			setRecipes( Array.isArray( responseData.recipes ) ? responseData.recipes : [] );
			setApplied( normalizeObject( responseData.applied || applied ) );
			setLoaded( true );

			if ( responseData.failures && responseData.failures.length ) {
				setMessage( {
					type: responseData.recipes && responseData.recipes.length ? 'warning' : 'error',
					text: responseData.recipes && responseData.recipes.length ? copy.partialFailure : copy.failure,
				} );
			}
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.failure } );
		} finally {
			setLoading( false );
		}
	};

	const applyRecipe = async ( recipe, options = {} ) => {
		if ( ! recipe || ! recipe.id || ! recipe.baseRestUrl ) {
			return;
		}

		setBusyKey( 'apply:' + recipe.id );
		setMessage( null );

		try {
			const response = await restRequest( data, 'applyRecipe', {
				recipe_id: recipe.id,
				url: recipe.baseRestUrl,
				include_look: Boolean( options.includeLook ),
				include_sample: Boolean( options.includeSample ),
			} );

			if ( response && response.data && response.data.appliedRecipes ) {
				setApplied( normalizeObject( response.data.appliedRecipes ) );
			}

			setMessage( { type: 'success', text: copy.applySuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.applyFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	const undoRecipe = async ( recipe ) => {
		if ( ! recipe || ! recipe.id ) {
			return;
		}

		setBusyKey( 'undo:' + recipe.id );
		setMessage( null );

		try {
			const response = await restRequest( data, 'undoRecipe', {
				recipe_id: recipe.id,
			} );

			if ( response && response.data && response.data.appliedRecipes ) {
				setApplied( normalizeObject( response.data.appliedRecipes ) );
			}

			setMessage( { type: 'success', text: copy.removeSuccess } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error && error.message ? error.message : copy.removeFailure } );
		} finally {
			setBusyKey( '' );
		}
	};

	return createElement(
		'section',
		{ className: 'pixelgrade-recipes' },
		createElement( 'h1', null, copy.title ),
		createElement( 'p', null, copy.description ),
		renderMessage( message ),
		createElement(
			Card,
			{ style: { marginTop: '16px' } },
			createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.layoutOnly ) ),
			createElement(
				CardBody,
				null,
				createElement(
					Flex,
					{ align: 'center', gap: 4, justify: 'space-between' },
					createElement(
						FlexItem,
						null,
						createElement(
							Flex,
							{ align: 'center', gap: 4, justify: 'flex-start' },
							createElement(
								FlexItem,
								null,
								createElement( CheckboxControl, {
									checked: includeLook,
									disabled: Boolean( busyKey ),
									label: copy.lookLabel,
									onChange: setIncludeLook,
								} )
							),
							createElement(
								FlexItem,
								null,
								createElement( CheckboxControl, {
									checked: includeSample,
									disabled: Boolean( busyKey ),
									label: copy.sampleLabel,
									onChange: setIncludeSample,
								} )
							)
						)
					),
					createElement(
						FlexItem,
						null,
						createElement(
							Button,
							{
								variant: 'secondary',
								isBusy: loading,
								disabled: loading || Boolean( busyKey ),
								onClick: loadRecipes,
							},
							loading ? copy.loading : copy.loadLabel
						)
					)
				)
			)
		),
		loading
			? createElement(
					'div',
					{ style: { alignItems: 'center', display: 'inline-flex', gap: '8px', marginTop: '16px' } },
					createElement( Spinner, null ),
					copy.loading
			  )
			: null,
		loaded && ! recipes.length ? createElement( 'p', null, copy.empty ) : null,
		createElement(
			Fragment,
			null,
			recipes.map( ( recipe ) =>
				createElement( RecipeCard, {
					key: recipe.id,
					recipe,
					applied,
					busyKey,
					copy,
					includeLook,
					includeSample,
					onApply: applyRecipe,
					onUndo: undoRecipe,
				} )
			)
		)
	);
}
