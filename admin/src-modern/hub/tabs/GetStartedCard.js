/**
 * The hub-native onboarding "Get started" card (onboarding migration, Phase 2).
 *
 * Replaces the legacy full-screen setup wizard with a guided, stateful checklist at the top of the
 * Overview tab. It preserves the wizard's use-cases without rebuilding them:
 *   - Linear guidance: the ordered checklist with live per-step done state (server-computed).
 *   - Aggregated orchestration (locked decision D): a primary "Set up my site" action runs the
 *     incomplete REQUIRED steps in sequence — install + activate recommended plugins, then import
 *     the single starter when exactly one exists — with a COMBINED progress bar + inline log,
 *     reusing the existing Plugins (`ensurePluginActive`) and Starter Sites (`importStarter`) flows.
 *   - Multi-demo safety: with more than one starter the action routes to the Starter Sites tab to
 *     choose instead of silently auto-picking (a wizard use-case we must not drop).
 *   - Dismiss (Phase 2 WRITE path): optimistic hide + a POST to the onboarding_dismiss REST route so
 *     it stays hidden across reloads.
 *
 * Visibility is server-decided (`onboarding.show`): the card is auto-hidden when complete, dismissed,
 * or the onboarding off-switch is set, and the starter step is omitted when the theme has no demos.
 *
 * No JSX, matching the rest of the hub bundle (externals stay wp-element/components/i18n).
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Button, Spinner } from '@wordpress/components';
import { getStarterSitesData, mergeCopy, importStarter, isStarterImported } from './StarterSites';
import { getPluginsData, ensurePluginActive } from './Plugins';

function getOnboarding() {
	if ( typeof window !== 'undefined' && window.pixelgradeOverview && window.pixelgradeOverview.onboarding ) {
		return window.pixelgradeOverview.onboarding;
	}

	return { show: false, steps: [] };
}

function getPixassistRest() {
	if ( typeof window !== 'undefined' && window.pixassist && window.pixassist.wpRest ) {
		return window.pixassist.wpRest;
	}

	return {};
}

/**
 * The Starter Sites tab deep link, used to route the user to choose when several starters exist.
 *
 * @param {Array} steps Onboarding steps (the starter step carries the in-hub `&tab=` url).
 * @return {string}
 */
function getStarterTabUrl( steps ) {
	const starterStep = ( steps || [] ).find( ( step ) => step && 'starter' === step.id );

	return starterStep && starterStep.url ? starterStep.url : '';
}

function hasIncompleteStep( steps, id ) {
	return Boolean( ( steps || [] ).find( ( step ) => step && id === step.id && ! step.done ) );
}

function shouldRouteToStarterChooser( onboarding, steps ) {
	return Number( onboarding.demosCount || 0 ) > 1 &&
		hasIncompleteStep( steps, 'starter' ) &&
		! hasIncompleteStep( steps, 'plugins' );
}

function renderCheck( done ) {
	return createElement(
		'span',
		{
			'aria-hidden': true,
			style: {
				alignItems: 'center',
				background: done ? '#0a7a28' : '#fff',
				border: '1px solid ' + ( done ? '#0a7a28' : '#c3c4c7' ),
				borderRadius: '50%',
				color: '#fff',
				display: 'inline-flex',
				flex: '0 0 auto',
				fontSize: '13px',
				fontWeight: 700,
				height: '22px',
				justifyContent: 'center',
				lineHeight: '22px',
				width: '22px',
			},
		},
		done ? '✓' : ''
	);
}

function renderStep( step ) {
	const done = Boolean( step.done );

	const titleChildren = [ createElement( 'strong', { key: 'title' }, step.title ) ];
	if ( step.optional ) {
		titleChildren.push(
			createElement(
				'span',
				{
					key: 'optional',
					style: {
						color: '#757575',
						fontSize: '12px',
						fontWeight: 400,
						marginLeft: '8px',
					},
				},
				__( 'Optional', 'pixelgrade_assistant' )
			)
		);
	}

	const action = done
		? null
		: createElement(
				Button,
				{ variant: 'secondary', href: step.url },
				step.optional
					? __( 'Set up', 'pixelgrade_assistant' )
					: __( 'Open', 'pixelgrade_assistant' )
		  );

	return createElement(
		'li',
		{
			key: step.id,
			style: {
				alignItems: 'flex-start',
				borderTop: '1px solid #f0f0f1',
				display: 'flex',
				gap: '12px',
				margin: 0,
				padding: '12px 0',
			},
		},
		renderCheck( done ),
		createElement(
			'div',
			{ style: { flex: '1 1 auto', minWidth: 0 } },
			createElement( 'div', { style: { margin: 0 } }, titleChildren ),
			step.description
				? createElement( 'p', { style: { color: '#50575e', margin: '2px 0 0' } }, step.description )
				: null
		),
		action ? createElement( 'div', { style: { flex: '0 0 auto' } }, action ) : null
	);
}

function renderProgressBar( ratio ) {
	return createElement(
		'div',
		{
			style: {
				background: '#f0f0f1',
				borderRadius: '999px',
				height: '8px',
				margin: '0 0 8px',
				overflow: 'hidden',
				width: '100%',
			},
		},
		createElement( 'div', {
			style: {
				background: '#2271b1',
				height: '100%',
				transition: 'width 200ms ease',
				width: Math.round( Math.max( 0, Math.min( 1, ratio ) ) * 100 ) + '%',
			},
		} )
	);
}

function renderLog( run ) {
	if ( ! run || ! run.log || ! run.log.length ) {
		return null;
	}

	return createElement(
		'div',
		{
			role: 'status',
			style: {
				background: '#f6f7f7',
				border: '1px solid #dcdcde',
				borderRadius: '2px',
				color: '#50575e',
				fontSize: '12px',
				lineHeight: 1.6,
				margin: '8px 0 0',
				maxHeight: '160px',
				overflowY: 'auto',
				padding: '8px 10px',
			},
		},
		run.log.map( ( entry, index ) =>
			createElement(
				'div',
				{
					key: index,
					style: { color: 'error' === entry.type ? '#b32d2e' : '#50575e' },
				},
				( 'error' === entry.type ? '✕ ' : 'done' === entry.type ? '✓ ' : '• ' ) + entry.message
			)
		)
	);
}

/**
 * Render the run feedback area: combined progress bar + live status line + inline log.
 *
 * @param {Object} run Run state ({ status, message, current, total, log }).
 * @return {Object|null}
 */
function renderRun( run ) {
	if ( ! run || 'idle' === run.status ) {
		return null;
	}

	const total = run.total || 0;
	const ratio = total > 0 ? run.current / total : 'done' === run.status ? 1 : 0;

	return createElement(
		'div',
		{ style: { margin: '12px 0 0' } },
		renderProgressBar( ratio ),
		createElement(
			'div',
			{ style: { alignItems: 'center', color: '#1e1e1e', display: 'flex', fontSize: '13px', gap: '8px' } },
			'working' === run.status ? createElement( Spinner, { style: { margin: 0 } } ) : null,
			createElement( 'span', null, run.message )
		),
		renderLog( run )
	);
}

/**
 * Build the ordered list of run tasks from the incomplete REQUIRED steps.
 *
 * - Plugins: install + activate every recommended plugin that is not active yet (reusing the Plugins
 *   tab install/activate flow via ensurePluginActive).
 * - Starter: import the single starter inline (only when exactly one exists; the multi-demo case is
 *   handled by routing out, not here).
 *
 * @param {Object}   onboarding   Onboarding payload.
 * @param {Function} pushLog      Append a log entry ({ type, message }).
 * @param {Function} setStatus    Set the live status message.
 * @return {Array<{ label: string, run: Function }>}
 */
function buildRunTasks( onboarding, pushLog, setStatus ) {
	const tasks = [];
	const steps = onboarding.steps || [];

	const pluginsStep = steps.find( ( step ) => step && 'plugins' === step.id );
	const starterStep = steps.find( ( step ) => step && 'starter' === step.id );

	// 1. Plugins — install + activate the not-yet-active recommended plugins.
	if ( pluginsStep && ! pluginsStep.done ) {
		const pluginsData = getPluginsData();
		const plugins = Array.isArray( pluginsData.plugins ) ? pluginsData.plugins : [];
		const pending = plugins.filter( ( plugin ) => plugin && 'active' !== plugin.status && ! plugin.isActive );

		pending.forEach( ( plugin ) => {
			const name = plugin.name || plugin.slug;
			tasks.push( {
				run: async () => {
					setStatus(
						// translators: %s: plugin name being installed/activated.
						( __( 'Setting up %s…', 'pixelgrade_assistant' ) ).replace( '%s', name )
					);
					await ensurePluginActive( plugin );
					pushLog( {
						type: 'done',
						// translators: %s: plugin name that was installed/activated.
						message: ( __( '%s is ready.', 'pixelgrade_assistant' ) ).replace( '%s', name ),
					} );
				},
			} );
		} );
	}

	// 2. Starter — import the single starter inline (1 demo only; >1 routes out, 0 has no step).
	if ( starterStep && ! starterStep.done && 1 === Number( onboarding.demosCount ) ) {
		const data = getStarterSitesData();
		const copy = mergeCopy( data.copy );
		const starters = Array.isArray( data.starters ) ? data.starters : [];
		const starter = starters[ 0 ];

		if ( starter && ! isStarterImported( data.imported || {}, starter.id ) ) {
			tasks.push( {
				run: async () => {
					await importStarter( starter, data, copy, ( message ) => setStatus( message ) );
					pushLog( {
						type: 'done',
						message: __( 'Starter content imported.', 'pixelgrade_assistant' ),
					} );
				},
			} );
		}
	}

	return tasks;
}

export function GetStartedCard() {
	const onboarding = getOnboarding();
	const [ visible, setVisible ] = useState( true );
	const [ run, setRun ] = useState( { status: 'idle', message: '', current: 0, total: 0, log: [] } );

	// Server is the source of truth for visibility; the card also hides optimistically on dismiss.
	if ( ! onboarding || ! onboarding.show || ! visible ) {
		return null;
	}

	const steps = Array.isArray( onboarding.steps ) ? onboarding.steps : [];
	const isWorking = 'working' === run.status;

	const pushLog = ( entry ) =>
		setRun( ( current ) => ( { ...current, log: [ ...current.log, entry ] } ) );

	const setStatus = ( message ) =>
		setRun( ( current ) => ( { ...current, message } ) );

	const dismiss = () => {
		// Optimistic hide first — persistence is best-effort and must not block the UI.
		setVisible( false );

		const endpoint = onboarding.dismissEndpoint || {};
		const rest = getPixassistRest();

		if ( ! endpoint.url || typeof window === 'undefined' || typeof window.fetch !== 'function' ) {
			return;
		}

		window
			.fetch( endpoint.url, {
				method: endpoint.method || 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					...( rest.nonce ? { 'X-WP-Nonce': rest.nonce } : {} ),
				},
				body: JSON.stringify( { pixassist_nonce: rest.pixassist_nonce || '' } ),
			} )
			.catch( () => {} );
	};

	const runSetup = async () => {
		// Multi-demo: never auto-pick, but finish plugin setup before routing to the chooser.
		if ( shouldRouteToStarterChooser( onboarding, steps ) ) {
			const url = getStarterTabUrl( steps );
			if ( url && typeof window !== 'undefined' ) {
				window.location.href = url;
			}
			return;
		}

		const tasks = buildRunTasks( onboarding, pushLog, setStatus );

		if ( ! tasks.length ) {
			setRun( {
				status: 'done',
				message: __( 'Everything is already set up. Reload to see the latest status.', 'pixelgrade_assistant' ),
				current: 0,
				total: 0,
				log: [],
			} );
			return;
		}

		setRun( {
			status: 'working',
			message: __( 'Starting…', 'pixelgrade_assistant' ),
			current: 0,
			total: tasks.length,
			log: [],
		} );

		let completed = 0;
		for ( const task of tasks ) {
			try {
				// eslint-disable-next-line no-await-in-loop
				await task.run();
				completed += 1;
				setRun( ( current ) => ( { ...current, current: completed } ) );
			} catch ( error ) {
				pushLog( {
					type: 'error',
					message: error && error.message ? error.message : __( 'Something went wrong.', 'pixelgrade_assistant' ),
				} );
				setRun( ( current ) => ( {
					...current,
					status: 'error',
					message: __( 'We hit a snag. Review the steps below and try again.', 'pixelgrade_assistant' ),
				} ) );
				return;
			}
		}

		setRun( ( current ) => ( {
			...current,
			status: 'done',
			current: tasks.length,
			message: __( 'All set! Refreshing the page to show the latest status.', 'pixelgrade_assistant' ),
		} ) );

		if ( typeof window !== 'undefined' && window.location && typeof window.setTimeout === 'function' ) {
			window.setTimeout( () => window.location.reload(), 700 );
		}
	};

	// Progress counts the REQUIRED steps only: optional steps (e.g. "Connect your account") never
	// block completion, so they must not drag the tally below 100% on the free path. This mirrors the
	// server-side completion rule (pixassist_onboarding_is_complete), which also ignores optional steps.
	const requiredSteps = steps.filter( ( step ) => step && ! step.optional );
	const countedSteps = requiredSteps.length ? requiredSteps : steps;
	const doneCount = countedSteps.filter( ( step ) => step && step.done ).length;
	const progressLabel = ( __( '%1$d of %2$d done', 'pixelgrade_assistant' ) )
		.replace( '%1$d', String( doneCount ) )
		.replace( '%2$d', String( countedSteps.length ) );

	// Honest labeling: the primary either RUNS the remaining setup inline ("Set up my site") or —
	// when only the multi-demo starter choice remains — routes to the chooser ("Choose a starter
	// site"). It must never promise a review while performing installs.
	const primaryLabel = shouldRouteToStarterChooser( onboarding, steps )
		? __( 'Choose a starter site', 'pixelgrade_assistant' )
		: __( 'Set up my site', 'pixelgrade_assistant' );

	return createElement(
		Card,
		{ className: 'pixelgrade-overview__get-started', style: { marginBottom: '24px' } },
		createElement(
			CardHeader,
			null,
			createElement(
				'div',
				{ style: { alignItems: 'center', display: 'flex', justifyContent: 'space-between', width: '100%' } },
				createElement(
					'div',
					null,
					createElement( 'h2', { style: { margin: 0 } }, __( 'Get started', 'pixelgrade_assistant' ) ),
					createElement(
						'p',
						{ style: { color: '#757575', fontSize: '13px', margin: '2px 0 0' } },
						progressLabel
					)
				),
				createElement(
					Button,
					{ variant: 'tertiary', onClick: dismiss, disabled: isWorking },
					__( 'Dismiss', 'pixelgrade_assistant' )
				)
			)
		),
		createElement(
			CardBody,
			null,
			createElement(
				'p',
				{ style: { color: '#50575e', margin: '0 0 8px', maxWidth: '46em' } },
				// Home's only orientation copy lives here, where a new user actually is — it leaves
				// with the checklist once the site is set up.
				__( 'Pixelgrade turns your theme into a design system — set colors, fonts, and spacing once, and your whole site follows. These quick steps get your site ready.', 'pixelgrade_assistant' )
			),
			createElement(
				'ul',
				{ style: { listStyle: 'none', margin: '8px 0 0', padding: 0 } },
				steps.map( ( step ) => renderStep( step ) )
			),
			createElement(
				'div',
				{ style: { display: 'flex', gap: '8px', margin: '16px 0 0' } },
				createElement(
					Button,
					{ variant: 'primary', onClick: runSetup, isBusy: isWorking, disabled: isWorking },
					isWorking ? __( 'Setting up…', 'pixelgrade_assistant' ) : primaryLabel
				)
			),
			renderRun( run )
		)
	);
}
