/**
 * The hub-native onboarding "Get started" card (onboarding migration, Phase 2).
 *
 * Replaces the legacy full-screen setup wizard with a guided, stateful checklist at the top of the
 * Overview tab. It preserves the wizard's use-cases without rebuilding them:
 *   - Linear guidance: the ordered checklist with live per-step done state (server-computed). The
 *     full journey shows from the first paint — pre-theme, the starter step renders LOCKED so a
 *     fresh site reads "0 of 3", not two steps of plumbing (#first-run-funnel).
 *   - Essentials orchestration: a primary action installs + activates the missing default theme and
 *     recommended plugins in sequence, with a combined progress bar + inline log.
 *   - Explicit design choice: in `choose` mode (essentials ready, starter pending) the card inlines
 *     the top starters with an in-card confirm, reusing the Starter Sites import machinery; this
 *     card never imports a starter automatically.
 *   - "Set up later" (dismiss): optimistic hide + a POST to the onboarding_dismiss REST route; the
 *     Overview keeps a persistent "Finish setup" row as the way back (never a dead end).
 *
 * Visibility + state are server-decided (`onboarding.show` / `onboarding.mode`): the card hides when
 * complete, dismissed, or the onboarding off-switch is set. While it shows, the Overview yields the
 * page to it (`onboarding.takeover`).
 *
 * No JSX, matching the rest of the hub bundle (externals stay wp-element/components/i18n).
 */
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Button, Spinner } from '@wordpress/components';
import { getPluginsData, ensurePluginActive } from './Plugins';
import { canManageThemeSetup, ensureThemeActive } from './ThemeSetup';
import { getStarterSitesData, mergeCopy, importStarter, buildProgressState } from './StarterSites';

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
 * The Starter Sites tab deep link, used once the essentials are ready.
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

function shouldRouteToStarterChooser( steps ) {
	return hasIncompleteStep( steps, 'starter' ) &&
		! hasIncompleteStep( steps, 'theme' ) &&
		! hasIncompleteStep( steps, 'plugins' );
}

export function isAutomaticSetupPlugin( plugin ) {
	return Boolean(
		plugin &&
			plugin.slug &&
			'external' !== plugin.actionType &&
			'external-action' !== plugin.sourceType
	);
}

function scheduleOnboardingRefresh() {
	if ( typeof window === 'undefined' || ! window.location || typeof window.setTimeout !== 'function' ) {
		return;
	}

	window.setTimeout( () => window.location.reload(), 700 );
}

function renderCheck( done, locked ) {
	return createElement(
		'span',
		{
			'aria-hidden': true,
			style: {
				alignItems: 'center',
				background: done ? '#0a7a28' : '#fff',
				border: ( locked ? '1px dashed ' : '1px solid ' ) + ( done ? '#0a7a28' : '#c3c4c7' ),
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

// Steps carry no per-step actions — the card funnels through its single primary CTA; manual paths
// stay available in the Site Setup tab (#first-run-funnel decision).
function renderStep( step ) {
	const done = Boolean( step.done );
	const locked = Boolean( step.locked );

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
		renderCheck( done, locked ),
		createElement(
			'div',
			{ style: { flex: '1 1 auto', minWidth: 0 } },
			createElement( 'div', { style: { margin: 0 } }, titleChildren ),
			step.description
				? createElement(
						'p',
						{
							style: {
								color: locked ? '#757575' : '#50575e',
								fontStyle: locked ? 'italic' : 'normal',
								margin: '2px 0 0',
							},
						},
						step.description
				  )
				: null
		)
	);
}

/**
 * The `choose`-mode inline picker: the top starters as cards with an in-card confirm, plus the
 * Browse hand-off into the full Starter Sites section. Copy comes from the server payload.
 */
function renderStarterPicker( picker, starters, confirmId, handlers, isWorking ) {
	const cards = starters.map( ( starter ) => {
		const title = starter.title || starter.id;
		const confirming = confirmId === starter.id;

		const action = confirming
			? createElement(
					'div',
					{ style: { display: 'grid', gap: '8px' } },
					createElement(
						'p',
						{ style: { color: '#50575e', fontSize: '12px', margin: 0 } },
						( picker.confirmBody || '%s' ).replace( '%s', title )
					),
					createElement(
						'div',
						{ style: { display: 'flex', gap: '8px' } },
						createElement(
							Button,
							{ variant: 'primary', onClick: () => handlers.onConfirm( starter ), disabled: isWorking },
							picker.confirmLabel || __( 'Import full site', 'pixelgrade_assistant' )
						),
						createElement(
							Button,
							{ variant: 'tertiary', onClick: handlers.onCancel, disabled: isWorking },
							picker.cancelLabel || __( 'Cancel', 'pixelgrade_assistant' )
						)
					)
			  )
			: createElement(
					Button,
					{ variant: 'secondary', onClick: () => handlers.onStart( starter.id ), disabled: isWorking },
					picker.startLabel || __( 'Start with this design', 'pixelgrade_assistant' )
			  );

		return createElement(
			'div',
			{
				key: starter.id,
				className: 'pixelgrade-get-started__starter',
				style: {
					border: '1px solid #dcdcde',
					borderRadius: '4px',
					display: 'flex',
					flex: '1 1 200px',
					flexDirection: 'column',
					maxWidth: '260px',
					overflow: 'hidden',
				},
			},
			starter.image
				? createElement( 'img', {
						src: starter.image,
						alt: '',
						loading: 'lazy',
						style: { display: 'block', height: '140px', objectFit: 'cover', objectPosition: 'top', width: '100%' },
				  } )
				: createElement( 'div', {
						'aria-hidden': true,
						style: { background: '#f0f0f1', height: '140px', width: '100%' },
				  } ),
			createElement(
				'div',
				{ style: { display: 'grid', gap: '8px', justifyItems: 'start', padding: '10px 12px 12px' } },
				createElement( 'strong', { style: { fontSize: '13px' } }, title ),
				action
			)
		);
	} );

	return createElement(
		'div',
		{ className: 'pixelgrade-get-started__picker', style: { margin: '16px 0 0' } },
		createElement(
			'div',
			{ style: { display: 'flex', flexWrap: 'wrap', gap: '12px' } },
			cards
		),
		picker.browseUrl
			? createElement(
					'p',
					{ style: { margin: '12px 0 0' } },
					createElement(
						Button,
						{ variant: 'link', href: picker.browseUrl },
						picker.browseLabel || __( 'Browse all designs', 'pixelgrade_assistant' )
					)
			  )
			: null
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
 * - Theme: install + activate Anima LT when no Pixelgrade theme is active.
 * - Plugins: install + activate every recommended plugin that is not active yet (reusing the Plugins
 *   tab install/activate flow via ensurePluginActive).
 *
 * @param {Object}   onboarding   Onboarding payload.
 * @param {Function} pushLog      Append a log entry ({ type, message }).
 * @param {Function} setStatus    Set the live status message.
 * @return {Array<{ label: string, run: Function }>}
 */
function buildRunTasks( onboarding, pushLog, setStatus ) {
	const tasks = [];
	const steps = onboarding.steps || [];

	const themeStep = steps.find( ( step ) => step && 'theme' === step.id );
	const pluginsStep = steps.find( ( step ) => step && 'plugins' === step.id );

	// 1. Theme — install + activate Anima LT before the theme-dependent plugins and starter content.
	if ( themeStep && ! themeStep.done ) {
		const theme = onboarding.themeSetup || {};
		const name = theme.name || 'Anima LT';

		tasks.push( {
			run: async () => {
				setStatus(
					// translators: %s: theme name being installed and activated.
					( __( 'Setting up %s…', 'pixelgrade_assistant' ) ).replace( '%s', name )
				);
				await ensureThemeActive( theme );
				pushLog( {
					type: 'done',
					// translators: %s: theme name that was installed and activated.
					message: ( __( '%s is active.', 'pixelgrade_assistant' ) ).replace( '%s', name ),
				} );
			},
		} );
	}

	// 2. Plugins — install + activate the not-yet-active recommended plugins.
	if ( pluginsStep && ! pluginsStep.done ) {
		const pluginsData = getPluginsData();
		const plugins = Array.isArray( pluginsData.plugins ) ? pluginsData.plugins : [];
		const pending = plugins.filter(
			( plugin ) => isAutomaticSetupPlugin( plugin ) && 'active' !== plugin.status && ! plugin.isActive
		);

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

	return tasks;
}

/**
 * Resolve the picker's starter ids against the Starter Sites payload localized on the hub page.
 *
 * @param {Object} picker The server-built `onboarding.starterPicker` descriptor.
 * @return {Array} Normalized starter descriptors, in picker order.
 */
function resolvePickerStarters( picker ) {
	if ( ! picker || ! Array.isArray( picker.ids ) || ! picker.ids.length ) {
		return [];
	}

	const starters = getStarterSitesData().starters || [];

	return picker.ids
		.map( ( id ) => starters.find( ( starter ) => starter && starter.id === id ) )
		.filter( Boolean );
}

export function GetStartedCard() {
	const onboarding = getOnboarding();
	const [ visible, setVisible ] = useState( true );
	const [ confirmId, setConfirmId ] = useState( null );
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
					message: __( 'Automatic setup could not finish. The page will refresh so it is safe to try again.', 'pixelgrade_assistant' ),
				} );
				setRun( ( current ) => ( {
					...current,
					status: 'error',
					message: __( 'Setup stopped. Refreshing the latest status…', 'pixelgrade_assistant' ),
				} ) );
				scheduleOnboardingRefresh();
				return;
			}
		}

		setRun( ( current ) => ( {
			...current,
			status: 'done',
			current: tasks.length,
			message: hasIncompleteStep( steps, 'starter' )
				? __( 'All set! Refreshing — next, choose your starter site.', 'pixelgrade_assistant' )
				: __( 'All set! Refreshing the page to show the latest status.', 'pixelgrade_assistant' ),
		} ) );

		scheduleOnboardingRefresh();
	};

	/**
	 * Run the confirmed full-site import for one picked starter, reusing the Starter Sites import
	 * machinery and mapping its progress into this card's progress bar + log. Reached ONLY through
	 * the explicit in-card confirm — a starter is never imported automatically.
	 *
	 * @param {Object} starter Normalized starter descriptor.
	 */
	const runStarterImport = async ( starter ) => {
		const data = getStarterSitesData();
		const starterCopy = mergeCopy( data.copy );
		let progress = null;

		const setProgress = ( update, options = {} ) => {
			progress = buildProgressState( progress, update, options );
			const message = [ progress.message, progress.details ].filter( Boolean ).join( ' — ' );
			setRun( {
				status: 'working',
				message,
				current: progress.current || 0,
				total: progress.total || 0,
				log: progress.log || [],
			} );
		};

		setConfirmId( null );
		setRun( {
			status: 'working',
			// translators: %s: starter design name.
			message: ( __( 'Importing %s…', 'pixelgrade_assistant' ) ).replace( '%s', starter.title || starter.id ),
			current: 0,
			total: 0,
			log: [],
		} );

		try {
			await importStarter( starter, data, starterCopy, setProgress );
			setRun( ( current ) => ( {
				...current,
				status: 'done',
				current: current.total || current.current,
				message: __( 'All set! Refreshing to show your new site.', 'pixelgrade_assistant' ),
			} ) );
			scheduleOnboardingRefresh();
		} catch ( error ) {
			// No auto-refresh here: imports are long and already-imported pieces are journaled, so
			// the user can read the error and safely confirm again to retry.
			setRun( ( current ) => ( {
				...current,
				status: 'error',
				message: error && error.message
					? error.message
					: __( 'The import could not finish. It is safe to try again.', 'pixelgrade_assistant' ),
			} ) );
		}
	};

	// Mirror the server completion rule and defensively ignore any optional step contributed later.
	const requiredSteps = steps.filter( ( step ) => step && ! step.optional );
	const countedSteps = requiredSteps.length ? requiredSteps : steps;
	const doneCount = countedSteps.filter( ( step ) => step && step.done ).length;
	const progressLabel = ( __( '%1$d of %2$d done', 'pixelgrade_assistant' ) )
		.replace( '%1$d', String( doneCount ) )
		.replace( '%2$d', String( countedSteps.length ) );

	// The automatic phase installs only essentials. Choosing and applying a design remains explicit.
	const shouldChooseStarter = shouldRouteToStarterChooser( steps );
	const picker = onboarding.starterPicker || null;
	const pickerStarters = shouldChooseStarter ? resolvePickerStarters( picker ) : [];
	// The inline picker replaces the primary CTA in choose mode; when the picker cannot resolve
	// (payload absent or the starter data is unavailable) the link into Starter Sites remains.
	const showPicker = shouldChooseStarter && picker && pickerStarters.length > 0;
	const starterUrl = shouldChooseStarter ? getStarterTabUrl( steps ) : '';
	const primaryLabel = shouldChooseStarter
		? __( 'Choose a starter site', 'pixelgrade_assistant' )
		: __( 'Set up my site', 'pixelgrade_assistant' );
	const needsTheme = hasIncompleteStep( steps, 'theme' );
	const expectsStarter = hasIncompleteStep( steps, 'starter' );
	const themeStep = steps.find( ( step ) => step && 'theme' === step.id );
	const themeNeedsAdministrator = needsTheme && ! canManageThemeSetup( onboarding.themeSetup || {} );
	const themeSetup = onboarding.themeSetup || {};
	const primaryUrl = themeNeedsAdministrator
		? ( themeSetup.manageUrl || ( themeStep && themeStep.url ? themeStep.url : '' ) )
		: starterUrl;
	const finalPrimaryLabel = themeNeedsAdministrator
		? themeSetup.isMultisite
			? __( 'Open Network Themes', 'pixelgrade_assistant' )
			: __( 'Open Site Setup', 'pixelgrade_assistant' )
		: primaryLabel;
	let essentialsDescription = expectsStarter
		? __( 'Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager. You’ll choose a starter site next.', 'pixelgrade_assistant' )
		: __( 'Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager.', 'pixelgrade_assistant' );

	if ( themeNeedsAdministrator ) {
		essentialsDescription = themeSetup.isMultisite
			? __( 'Install and enable Anima LT in Network Admin, then return here to continue setup.', 'pixelgrade_assistant' )
			: __( 'A site administrator needs to install and activate Anima LT before setup can continue.', 'pixelgrade_assistant' );
	}

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
					// Not "Dismiss": dismissal is a deferral, and the Overview keeps a persistent
					// "Finish setup" row as the way back.
					__( 'Set up later', 'pixelgrade_assistant' )
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
				showPicker
					? __( 'Pixelgrade turns your theme into a design system — set colors, fonts, and spacing once, and your whole site follows. One step left: pick your starting design.', 'pixelgrade_assistant' )
					: __( 'Pixelgrade turns your theme into a design system — set colors, fonts, and spacing once, and your whole site follows. These quick steps get your site ready.', 'pixelgrade_assistant' )
			),
			createElement(
				'ul',
				{ style: { listStyle: 'none', margin: '8px 0 0', padding: 0 } },
				steps.map( ( step ) => renderStep( step ) )
			),
			showPicker
				? renderStarterPicker(
						picker,
						pickerStarters,
						confirmId,
						{
							onStart: ( id ) => setConfirmId( id ),
							onConfirm: runStarterImport,
							onCancel: () => setConfirmId( null ),
						},
						isWorking
				  )
				: createElement(
						'div',
						{ style: { display: 'grid', gap: '8px', justifyItems: 'start', margin: '16px 0 0' } },
						createElement(
							Button,
							{
								variant: 'primary',
								href: primaryUrl || undefined,
								onClick: primaryUrl ? undefined : runSetup,
								isBusy: isWorking,
								disabled: isWorking,
								// The one action on a takeover page earns a touch more presence.
								style: { fontSize: '14px', height: 'auto', padding: '10px 20px' },
							},
							isWorking ? __( 'Setting up…', 'pixelgrade_assistant' ) : finalPrimaryLabel
						),
						! shouldChooseStarter
							? createElement(
									'p',
									{ style: { color: '#50575e', fontSize: '12px', margin: 0 } },
									essentialsDescription
							  )
							: null
				  ),
			renderRun( run )
		)
	);
}
