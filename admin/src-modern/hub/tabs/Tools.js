/**
 * The secondary Tools tab (#50).
 *
 * Reuses Assistant's existing cleanup endpoint with the same math-confirmation guard as the legacy
 * dashboard, plus the existing localStorage cache clear behavior.
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader, Flex, FlexItem, Spinner, TextControl } from '@wordpress/components';

const DEFAULT_TOOLS = {
	copy: {
		title: __( 'Tools', 'pixelgrade_assistant' ),
		description: __( 'Utilities for maintaining the Pixelgrade Assistant setup on this site.', 'pixelgrade_assistant' ),
		resetLabel: __( 'Reset Pixelgrade Assistant', 'pixelgrade_assistant' ),
		resetDescription: __( 'Reset Assistant options, cached state, and onboarding progress.', 'pixelgrade_assistant' ),
		confirmationMessage: __( 'Solve the confirmation challenge to reset Pixelgrade Assistant.', 'pixelgrade_assistant' ),
		challengeLabel: __( 'Confirmation answer', 'pixelgrade_assistant' ),
		challengePrefix: __( 'Type the result:', 'pixelgrade_assistant' ),
		confirmLabel: __( 'Confirm reset', 'pixelgrade_assistant' ),
		cancelLabel: __( 'Cancel', 'pixelgrade_assistant' ),
		wrongAnswer: __( 'The confirmation answer is incorrect.', 'pixelgrade_assistant' ),
		working: __( 'Resetting...', 'pixelgrade_assistant' ),
		success: __( 'Pixelgrade Assistant was reset. Refresh the page to load the clean state.', 'pixelgrade_assistant' ),
		failure: __( 'Reset failed. Please try again.', 'pixelgrade_assistant' ),
		localStorageLabel: __( 'Clear browser cache for this admin app', 'pixelgrade_assistant' ),
		localStorageSuccess: __( 'Browser cache cleared for this admin app.', 'pixelgrade_assistant' ),
	},
	endpoints: {},
};

function getToolsData() {
	if ( typeof window !== 'undefined' && window.pixelgradeTools ) {
		return window.pixelgradeTools;
	}

	return DEFAULT_TOOLS;
}

function mergeCopy( copy ) {
	return {
		...DEFAULT_TOOLS.copy,
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

function getEndpoint( data ) {
	if ( data.endpoints && data.endpoints.cleanup ) {
		return data.endpoints.cleanup;
	}

	const rest = getPixassistRest();
	return rest.endpoint && rest.endpoint.cleanup ? rest.endpoint.cleanup : {};
}

async function fetchJson( url, options = {} ) {
	const response = await window.fetch( url, options );

	if ( ! response.ok ) {
		throw new Error( 'status ' + response.status );
	}

	return response.json();
}

function makeChallenge() {
	return {
		test1: 2 + Math.floor( Math.random() * 8 ),
		test2: 2 + Math.floor( Math.random() * 8 ),
	};
}

function clearPixassistLocalStorage() {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return;
	}

	window.localStorage.removeItem( 'pixassist_state' );
	window.localStorage.removeItem( 'pixassist_last_updated' );
}

function renderMessage( message ) {
	if ( ! message ) {
		return null;
	}

	const colors = {
		error: { background: '#fcf0f1', border: '#d63638', color: '#8a2424' },
		success: { background: '#edfaef', border: '#00a32a', color: '#0a5f1d' },
	};
	const tone = colors[ message.type ] || colors.success;

	return createElement(
		'div',
		{
			style: {
				background: tone.background,
				borderLeft: '4px solid ' + tone.border,
				color: tone.color,
				margin: '12px 0',
				padding: '10px 12px',
			},
		},
		message.text
	);
}

export function Tools() {
	const data = getToolsData();
	const copy = mergeCopy( data.copy );
	const [ challenge, setChallenge ] = useState( makeChallenge );
	const [ answer, setAnswer ] = useState( '' );
	const [ confirming, setConfirming ] = useState( false );
	const [ busy, setBusy ] = useState( false );
	const [ message, setMessage ] = useState( null );

	const resetChallenge = ( clearMessage = true ) => {
		setChallenge( makeChallenge() );
		setAnswer( '' );
		if ( clearMessage ) {
			setMessage( null );
		}
	};

	const submitReset = async () => {
		const expected = challenge.test1 + challenge.test2;
		if ( expected !== parseInt( answer, 10 ) ) {
			setMessage( { type: 'error', text: copy.wrongAnswer } );
			return;
		}

		const endpoint = getEndpoint( data );
		const rest = getPixassistRest();
		if ( ! endpoint.url ) {
			setMessage( { type: 'error', text: copy.failure } );
			return;
		}

		setBusy( true );
		setMessage( null );
		try {
			const response = await fetchJson( endpoint.url, {
				method: endpoint.method || 'POST',
				credentials: 'same-origin',
				headers: getRestHeaders(),
				body: JSON.stringify( {
					test1: challenge.test1,
					test2: challenge.test2,
					confirm: answer,
					pixassist_nonce: rest.pixassist_nonce || '',
				} ),
			} );

			if ( response && response.code && 'success' !== response.code ) {
				throw new Error( response.message || response.code );
			}

			clearPixassistLocalStorage();
			setConfirming( false );
			setMessage( { type: 'success', text: copy.success } );
		} catch ( error ) {
			setMessage( { type: 'error', text: error.message || copy.failure } );
		} finally {
			setBusy( false );
			resetChallenge( false );
		}
	};

	return createElement(
		Fragment,
		null,
		createElement(
			Card,
			null,
			createElement( CardHeader, null, createElement( 'h2', { style: { margin: 0 } }, copy.title ) ),
			createElement(
				CardBody,
				null,
				copy.description ? createElement( 'p', { style: { marginTop: 0, color: '#50575e' } }, copy.description ) : null,
				renderMessage( message ),
				createElement(
					Card,
					{ style: { marginTop: '16px' } },
					createElement( CardHeader, null, createElement( 'h3', { style: { margin: 0 } }, copy.resetLabel ) ),
					createElement(
						CardBody,
						null,
						createElement( 'p', { style: { marginTop: 0 } }, copy.resetDescription ),
						confirming
							? createElement(
									'div',
									null,
									createElement( 'p', { style: { marginTop: 0, color: '#50575e' } }, copy.confirmationMessage ),
									createElement(
										'p',
										{ style: { fontWeight: 600 } },
										copy.challengePrefix + ' ' + challenge.test1 + ' + ' + challenge.test2
									),
									createElement( TextControl, {
										label: copy.challengeLabel,
										value: answer,
										onChange: setAnswer,
										type: 'number',
										disabled: busy,
										__next40pxDefaultSize: true,
									} ),
									createElement(
										Flex,
										{ gap: 2, justify: 'flex-start' },
										createElement(
											FlexItem,
											null,
											createElement(
												Button,
												{ variant: 'primary', isDestructive: true, disabled: busy, onClick: submitReset },
												busy ? createElement( Spinner, { style: { margin: '0 6px 0 0' } } ) : null,
												busy ? copy.working : copy.confirmLabel
											)
										),
										createElement(
											FlexItem,
											null,
											createElement( Button, { variant: 'tertiary', disabled: busy, onClick: () => {
												setConfirming( false );
												resetChallenge();
											} }, copy.cancelLabel )
										)
									)
							  )
							: createElement( Button, { variant: 'secondary', isDestructive: true, onClick: () => setConfirming( true ) }, copy.resetLabel )
					)
				),
				createElement(
					'div',
					{ style: { marginTop: '16px' } },
					createElement( Button, { variant: 'tertiary', onClick: () => {
						clearPixassistLocalStorage();
						setMessage( { type: 'success', text: copy.localStorageSuccess } );
					} }, copy.localStorageLabel )
				)
			)
		)
	);
}
