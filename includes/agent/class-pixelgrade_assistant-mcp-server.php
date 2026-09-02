<?php
/**
 * The curated Pixelgrade MCP server — contract §4, decision D2 (Gate 2, George, 2026-08-31).
 *
 * The server lives HERE, in Pixelgrade Assistant, and not in Style Manager: Assistant is the
 * stack's coordinator and management plane, and it is present on every onboarded site, whereas
 * Style Manager is not. A server that aggregates verbs owned by four plugins belongs with the
 * component whose job is already knowing about all of them. Abilities keep registering in the
 * plugins that own their verbs; this class only aggregates and exposes them.
 *
 * THIS IS THE ONLY FILE THAT TOUCHES `wordpress/mcp-adapter`.
 *
 * The adapter is a 0.x package (pinned to 0.6.1 in composer.json). The swarm plan's §8 risk note
 * requires its API to sit behind one thin Pixelgrade class so a breaking 0.x bump is a single-file
 * change. Every adapter symbol — McpAdapter, HttpTransport, the error handler, create_server()'s
 * thirteen-parameter signature — is referenced from inside this class and nowhere else in the
 * plugin. If you need an adapter symbol somewhere else, add a method here instead.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/agent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_MCP_Server {

	/**
	 * The adapter version this wrapper is written against, pinned in composer.json.
	 */
	const ADAPTER_VERSION = '0.6.1';

	const SERVER_ID          = 'pixelgrade';
	const SERVER_NAMESPACE   = 'pixelgrade/v1';
	const SERVER_ROUTE       = 'mcp';
	const SERVER_VERSION     = '0.1.0';

	/**
	 * Request bounds for the curated server (both filterable — see within_request_limits()).
	 */
	const MAX_REQUEST_BYTES  = 1048576; // 1 MiB.
	const MAX_BATCH_MESSAGES = 20;

	/**
	 * THE REVIEWED PUBLIC WHITELIST.
	 *
	 * Contract §4: every ability registers private (`meta.mcp.public = false`), and opening one to
	 * the curated server is "an explicit, reviewed change, not a default". This constant IS that
	 * reviewed list — the P5 demo set signed off at Gate 2. Adding a name to it is a product
	 * decision that goes through the orchestrator, not a refactor.
	 *
	 * Sixteen abilities: the read set — every ability annotated `readonly: true` in §4's table
	 * EXCEPT `describe-block`, which is readonly but deliberately CLI-only (v0.4.3) — plus exactly
	 * four writes: the two design applies, the starter import, and `set-devmode`. That is twelve
	 * published reads out of a thirteen-strong readonly set. Everything else —
	 * set-design-settings, the three license writes, reset-starter-content, apply-recipe,
	 * canonicalize-post and `describe-block` — stays private and is reachable only over WP-CLI.
	 *
	 * `set-devmode` (contract v0.4.7, W12) is the one write on this list that is NOT gated only by
	 * a capability. It carries its own two-factor gate inside the command core: it refuses unless
	 * the site reports a non-`production` environment type AND an operator has already defined
	 * `PIXELGRADE_PLUS_DEV_MODE` in `wp-config.php`. It never writes `wp-config.php`, so publishing
	 * it cannot grant itself its own master gate. On a customer site the tool is therefore visible
	 * and inert — it exists and always says no, naming the failing factor; on a lab site
	 * provisioned with that constant it is the demo switch that puts the site into full Plus
	 * entitlements headlessly. `get-devmode` is the readonly companion that answers *why* it would
	 * refuse, which is why publishing the pair together is what makes the refusal actionable.
	 *
	 * Names are listed here whether or not their owning plugin is active: a name for an ability
	 * that never registered is simply never exposed, so the list stays readable as policy rather
	 * than as a function of what happens to be installed.
	 */
	const PUBLIC_ABILITIES = array(
		// --- the read set (contract §4: readonly = true) ---
		'pixelgrade/get-design-system',      // style-manager
		'pixelgrade/get-design-settings',    // style-manager
		'pixelgrade/get-design-structure',   // style-manager
		'pixelgrade/export-design-system',   // style-manager
		'pixelgrade/flush-design-cache',     // style-manager (cache-only write, §4 carve-out)
		'pixelgrade/get-license-status',     // pixelgrade-plus
		'pixelgrade/get-devmode',            // pixelgrade-plus (lab entitlement switch — status only)
		'pixelgrade/list-starters',          // pixelgrade-assistant
		'pixelgrade/list-recipes',           // pixelgrade-assistant
		'pixelgrade/list-blocks',            // nova-blocks
		'pixelgrade/list-patterns',          // nova-blocks (warms the cloud pattern cache — §4 ‡)
		'pixelgrade/validate-post',          // nova-blocks

		// --- the four opened writes ---
		'pixelgrade/apply-font-palette',     // style-manager
		'pixelgrade/apply-color-palette',    // style-manager
		'pixelgrade/import-starter',         // pixelgrade-assistant
		'pixelgrade/set-devmode',            // pixelgrade-plus (two-factor gated; refuses on production)
	);

	/**
	 * Whether this plugin bootstrapped the vendored adapter (as opposed to finding one already
	 * loaded by a separately-installed MCP Adapter plugin).
	 *
	 * @var bool
	 */
	private static $bootstrapped = false;

	/**
	 * Wire everything up. Called from the main plugin file, at load time — before `init`, because
	 * the adapter hooks `init` @20 / `rest_api_init` @15 the moment it is instantiated.
	 */
	public static function register() {
		// Bootstrap BEFORE publishing the whitelist: whether we may grant `meta.mcp.public` at all
		// depends on whether this plugin is the thing that booted the adapter (see
		// public_abilities()).
		$booted = self::bootstrap_adapter();

		// The whitelist is published as a filter so the abilities in style-manager,
		// pixelgrade-plus and nova-blocks can consult ONE list without depending on Assistant's
		// classes. With Assistant absent the filter has no callback, the list is empty, and every
		// ability in the stack is private — which is the correct default.
		add_filter( 'pixelgrade/mcp/public_abilities', array( __CLASS__, 'public_abilities' ), 10, 1 );

		if ( ! $booted ) {
			return;
		}

		if ( ! self::adapter_version_supported() ) {
			self::log_adapter_skew();

			return;
		}

		add_filter( 'mcp_adapter_tool_call_result', array( __CLASS__, 'redact_tool_error' ), 10, 5 );
		add_action( 'mcp_adapter_init', array( __CLASS__, 'create_server' ) );
	}

	/**
	 * Keep environment detail out of tool errors sent to a client.
	 *
	 * `McpTool::execute()` wraps any UNCAUGHT `Throwable` as
	 * `WP_Error( 'mcp_execution_failed', $throwable->getMessage(), [ 'error_type' => get_class( $t ) ] )`
	 * and the handler renders that message to the caller. Our cores return envelopes rather than
	 * throw, so this is only a backstop — but a fatal deep inside a wrapped WordPress call (a DB
	 * exception, say) would otherwise ship its message and class name to whoever is holding an
	 * application password. Callers are already `edit_posts`+, which is why this is hardening rather
	 * than a hole, but exception text is not something a curated server should narrate.
	 *
	 * This is the adapter's own sanctioned seam for exactly this ("Use this filter for result
	 * transformation, PII redaction, audit logging"), which is why the redaction lives here in the
	 * one adapter-facing file and covers all 14 tools at once — rather than being re-implemented as
	 * a try/catch in each of the four plugins that own abilities.
	 *
	 * The detail is logged before it is dropped: the adapter's own `WP_Error` logging runs AFTER
	 * this filter, so redacting without logging first would lose the diagnostic entirely.
	 *
	 * Deliberately narrow: only `mcp_execution_failed` (the uncaught-Throwable code) is rewritten.
	 * Every deliberate refusal our abilities produce — `invalid_params`, `ordering_conflict`,
	 * `confirmation_required`, `harness_unavailable`, `plus_stripped` — carries a closed machine
	 * token and a message written for the caller, and must reach them untouched.
	 *
	 * @param mixed                        $result
	 * @param array                        $args
	 * @param string                       $tool_name
	 * @param object                       $mcp_tool
	 * @param object                       $server
	 *
	 * @return mixed
	 */
	public static function redact_tool_error( $result, $args = array(), $tool_name = '', $mcp_tool = null, $server = null ) {
		if ( ! is_wp_error( $result ) || 'mcp_execution_failed' !== $result->get_error_code() ) {
			return $result;
		}

		// Only our own server: another server's error handling is that installation's business.
		if ( is_object( $server ) && method_exists( $server, 'get_server_id' ) && self::SERVER_ID !== $server->get_server_id() ) {
			return $result;
		}

		$data = $result->get_error_data();

		if ( function_exists( 'error_log' ) ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf(
					'Pixelgrade MCP: uncaught %s while executing "%s": %s',
					is_array( $data ) && isset( $data['error_type'] ) ? $data['error_type'] : 'Throwable',
					(string) $tool_name,
					$result->get_error_message()
				)
			);
		}

		return new WP_Error(
			'mcp_execution_failed',
			__( 'The ability failed unexpectedly. The details were written to the site error log.', '__plugin_txtd' )
		);
	}

	/**
	 * The whitelist, as `meta.mcp.public` grants.
	 *
	 * Two rules, both learned from the W7 architecture review (H1), and both about what
	 * `meta.mcp.public` actually does in adapter 0.6.1:
	 *
	 * **It is not the curated server's gate.** Read the source: `McpAbilityExposure::is_public()` is
	 * consulted by `DefaultServerFactory` and by the adapter's three built-in meta-abilities
	 * (`discover-abilities`, `get-ability-info`, `execute-ability`) — all of which live on the
	 * DEFAULT server. `McpComponentRegistry::register_ability_tool()` registers an explicitly-passed
	 * tool by name and never checks exposure. So the curated server's ONLY gate is the `$tools` list
	 * {@see create_server()} hands it, and this flag is purely a declaration of curated intent.
	 *
	 * **Therefore it is granted only on an adapter we booted.** If a standalone MCP Adapter plugin
	 * booted first we do not suppress its default server (that installation's default server is its
	 * business, not ours) — and a `true` here would publish all 14 abilities onto it, behind ITS
	 * transport gate, which is `read`. Any logged-in subscriber could then enumerate every tool name,
	 * description and schema, and reach a second, uncurated execution route for the three opened
	 * writes. That is exactly the disclosure the `edit_posts` transport floor exists to close, walked
	 * around by another plugin's presence. When we booted the adapter we suppressed its default
	 * server, so nothing reads the flag and granting it is inert-but-honest; when we did not, the
	 * grant is a hole. Hence `self::$bootstrapped`.
	 *
	 * **And the incoming names are discarded, not merged.** This callback sits at the head of the
	 * chain and returns the reviewed constant verbatim. Merging let a third-party `add_filter` flip
	 * `meta.mcp.public = true` on a NON-reviewed write — invisible on the curated server, live on a
	 * coexisting default server. Later-priority callbacks still run after this one and can drop
	 * names, so the filter stays a narrowing channel and stops being a back door.
	 *
	 * @param array $names Incoming names — deliberately ignored; see above.
	 *
	 * @return array
	 */
	public static function public_abilities( $names = array() ) {
		if ( ! self::$bootstrapped ) {
			return array();
		}

		return array_values( self::PUBLIC_ABILITIES );
	}

	/**
	 * Is the booted adapter one this wrapper was written against?
	 *
	 * `create_server()` is called with a thirteen-parameter 0.6.1 signature. The adapter is
	 * explicitly 0.x, where breaking changes are the stated norm — that is the whole reason this
	 * wrapper exists. When another plugin booted the adapter it may be any 0.x, and calling a
	 * changed signature would fatal inside `mcp_adapter_init`, which fires from `init`, taking down
	 * every request on the site. A booted adapter is not evidence it is the version this file
	 * targets, exactly as a loadable class was not evidence the adapter had booted.
	 *
	 * Same-minor is the compatibility unit: 0.x patch releases do not break signatures, minors may.
	 *
	 * @return bool
	 */
	public static function adapter_version_supported() {
		// We booted it ourselves from the pinned vendor copy — it is by definition the pinned one.
		if ( self::$bootstrapped ) {
			return true;
		}

		if ( ! defined( 'WP_MCP_VERSION' ) ) {
			return false;
		}

		return self::same_minor( (string) WP_MCP_VERSION, self::ADAPTER_VERSION );
	}

	/**
	 * Do two version strings share a major.minor?
	 *
	 * @param string $a
	 * @param string $b
	 *
	 * @return bool
	 */
	private static function same_minor( $a, $b ) {
		$a_parts = explode( '.', ltrim( $a, 'v' ) );
		$b_parts = explode( '.', ltrim( $b, 'v' ) );

		if ( count( $a_parts ) < 2 || count( $b_parts ) < 2 ) {
			return false;
		}

		return $a_parts[0] === $b_parts[0] && $a_parts[1] === $b_parts[1];
	}

	/**
	 * Degrade loudly but harmlessly on version skew: no curated server, one notice-level log, and
	 * an admin notice. Never a fatal inside `init`.
	 */
	private static function log_adapter_skew() {
		$message = sprintf(
			'Pixelgrade Assistant: the curated MCP server was not created. Another plugin loaded MCP Adapter %s, but this build targets %s. The `wp pixelgrade …` commands and the abilities are unaffected.',
			defined( 'WP_MCP_VERSION' ) ? (string) WP_MCP_VERSION : 'an unknown version',
			self::ADAPTER_VERSION
		);

		if ( function_exists( 'error_log' ) ) {
			error_log( $message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		add_action(
			'admin_notices',
			static function () use ( $message ) {
				if ( ! current_user_can( 'activate_plugins' ) ) {
					return;
				}

				printf(
					'<div class="notice notice-warning"><p>%s</p></div>',
					esc_html( $message )
				);
			}
		);
	}

	/**
	 * Load the vendored adapter.
	 *
	 * Three things are deliberate here:
	 *
	 * 1. The "is it already loaded?" test is `defined( 'WP_MCP_VERSION' )`, NOT
	 *    `class_exists( '\WP\MCP\Core\McpAdapter' )`. The class is always autoloadable — it is a
	 *    Composer dependency of this plugin — so a class_exists() check answers "can I load it?"
	 *    when the question is "has someone already booted it?". It reports true before anything is
	 *    wired, we skip the bootstrap, no McpAdapter instance is ever created at load time, and no
	 *    server is registered. Only the constant distinguishes an autoloadable class from a booted
	 *    adapter.
	 * 2. We skip entirely if something else already booted it (the standalone MCP Adapter plugin,
	 *    or another Pixelgrade plugin): its `constants()` would re-`define()` WP_MCP_DIR, and its
	 *    default server is then that installation's business, not ours.
	 * 3. We define WP_MCP_AUTOLOAD = false first. The adapter's own Autoloader looks for a
	 *    `vendor/autoload_packages.php` INSIDE the package, which does not exist when the package
	 *    is a dependency rather than a plugin; without this constant it would bail before
	 *    bootstrapping and show an admin notice. Assistant's Composer autoloader already maps the
	 *    `WP\MCP\` namespace, so there is nothing left for the adapter's autoloader to do. The
	 *    constant is the package's own documented bypass.
	 *
	 * Timing matters too: this runs at plugin-load time, because McpAdapter::instance() registers
	 * its `init` @20 / `rest_api_init` @15 hook the first time it is called. Called any later, the
	 * hook it registers has already passed and no server is ever created.
	 *
	 * And nothing above happens at all below WordPress 6.9 — see the Abilities API gate first.
	 *
	 * @return bool
	 */
	private static function bootstrap_adapter() {
		// THE ABILITIES API GATE. `mcp-adapter` declares `Requires at least: 6.9` and hard-depends on
		// the Abilities API: with `wp_register_ability()` absent, its own `Plugin::setup()` bails and
		// registers an `admin_notices` closure that renders "MCP Adapter requires WordPress 6.9 or
		// newer" — non-dismissible, on every admin screen, naming a plugin this site's owner never
		// installed. Worse, that closure calls `wp_admin_notice()`, which is only `@since` 6.4, so on
		// the 5.9–6.3 span this plugin still supports it is an undefined function inside the
		// `admin_notices` action: a fatal in wp-admin.
		//
		// The check belongs HERE, not in the adapter. The adapter is a general-purpose package that
		// may legitimately be installed as a plugin in its own right, where announcing an unmet
		// dependency to the person who installed it is the correct behaviour. We are a consumer that
		// vendored it: our user did not choose it, cannot act on the notice, and — because every
		// `pixelgrade/*` ability registers on `wp_abilities_api_init` behind the same predicate
		// {@see PixelgradeAssistant_Abilities::register()} — would get a curated server with nothing
		// on it even if the adapter did boot. So the honest posture below 6.9 is that the MCP surface
		// simply does not exist, and this predicate is deliberately the exact one the abilities
		// registrar already uses, so the two can never disagree about which WordPress versions have
		// an agent surface.
		//
		// This is a load-time refusal, before `require`, so no adapter code runs and no constant of
		// its is defined. The CLI subtree and everything else in the plugin are unaffected.
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return false;
		}

		if ( defined( 'WP_MCP_VERSION' ) ) {
			return class_exists( '\WP\MCP\Core\McpAdapter' );
		}

		$entry = self::plugin_dir() . 'vendor/wordpress/mcp-adapter/mcp-adapter.php';

		if ( ! is_readable( $entry ) ) {
			return false;
		}

		if ( ! defined( 'WP_MCP_AUTOLOAD' ) ) {
			define( 'WP_MCP_AUTOLOAD', false );
		}

		require_once $entry;

		self::$bootstrapped = class_exists( '\WP\MCP\Core\McpAdapter' );

		if ( self::$bootstrapped ) {
			// We vendored the adapter to host ONE curated server. The adapter's own default server
			// (`/wp-json/mcp/mcp-adapter-default-server`) and its bundled demo abilities are not
			// part of that offer and would be a second, unreviewed surface on every onboarded site.
			// This only fires when WE loaded the adapter — a site that installs the real MCP
			// Adapter plugin keeps its default server untouched.
			add_filter( 'mcp_adapter_create_default_server', '__return_false' );
		}

		return self::$bootstrapped;
	}

	/**
	 * The exact tool list handed to the adapter.
	 *
	 * THIS is the curated server's gate — the only one. `meta.mcp.public` is not consulted for an
	 * explicitly-registered tool (see {@see public_abilities()}), so nothing but this method decides
	 * what the server exposes. It reads the reviewed constant directly and never a filter, which is
	 * what makes "a site filter can only narrow" true rather than aspirational.
	 *
	 * Names whose owning plugin is inactive are dropped: passing one would make the adapter log a
	 * missing-ability error on every request.
	 *
	 * Public so a test can assert the property directly instead of asserting that PHP constants are
	 * immutable.
	 *
	 * @return array
	 */
	public static function tools_for_server() {
		$tools = array();

		foreach ( self::PUBLIC_ABILITIES as $name ) {
			if ( function_exists( 'wp_has_ability' ) && wp_has_ability( $name ) ) {
				$tools[] = $name;
			}
		}

		return $tools;
	}

	/**
	 * Create the curated `pixelgrade` server.
	 *
	 * Wrapped in a Throwable guard because this runs on `mcp_adapter_init`, fired from `init`: a
	 * signature change in a 0.x adapter we did not boot would otherwise fatal every request on the
	 * site. {@see adapter_version_supported()} already refuses the obvious skew; this catches the
	 * case where the version string lies or the break lands within a minor.
	 *
	 * @param \WP\MCP\Core\McpAdapter $adapter
	 */
	public static function create_server( $adapter ) {
		try {
			$adapter->create_server(
				self::SERVER_ID,
				self::SERVER_NAMESPACE,
				self::SERVER_ROUTE,
				__( 'Pixelgrade', '__plugin_txtd' ),
				__( 'Read and shape a Pixelgrade site: its design system, block inventory, license status and starter content.', '__plugin_txtd' ),
				self::SERVER_VERSION,
				array( \WP\MCP\Transport\HttpTransport::class ),
				\WP\MCP\Infrastructure\ErrorHandling\ErrorLogMcpErrorHandler::class,
				null,
				self::tools_for_server(),
				array(),
				array(),
				array( __CLASS__, 'can_reach_server' )
			);
		} catch ( \Throwable $e ) {
			// No curated server is a degraded site; a fatal in `init` is a broken one.
			if ( function_exists( 'error_log' ) ) {
				error_log( 'Pixelgrade Assistant: could not create the curated MCP server (' . get_class( $e ) . '). The CLI and the abilities are unaffected.' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}
	}

	/**
	 * Who may reach the server at all.
	 *
	 * Without this the adapter's default transport gate is `read`, so any logged-in subscriber
	 * could connect and enumerate the catalog — every tool name, description and input schema —
	 * even though each ability's own permission callback would then refuse to execute. Denying the
	 * call but publishing the map is a needless disclosure, so the transport asks for the LOWEST
	 * capability any exposed ability requires: `edit_posts` (Nova Blocks' floor; the Style Manager
	 * set needs `edit_theme_options` and the Plus/Assistant set `manage_options`, the two devmode
	 * abilities included — a higher floor never lowers this one).
	 *
	 * This can only narrow, never widen. Every ability still enforces its own, stricter capability
	 * in its own permission callback — passing this gate buys visibility, not execution.
	 *
	 * It is also where the request's SIZE is bounded. The adapter accepts JSON-RPC batch arrays and
	 * iterates every message with no cap on batch length or body length beyond PHP's own limits, and
	 * several exposed tools are expensive per call — `import-starter` fetches over the network,
	 * `apply-color-palette` spawns a Node subprocess. A caller past this floor is an authenticated
	 * contributor, so this is amplification rather than an unauthenticated vector, but a curated
	 * server should not hand one a free multiplier. Both caps are filterable for a site that
	 * genuinely batches.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return bool|\WP_Error
	 */
	public static function can_reach_server( $request = null ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		return self::within_request_limits( $request );
	}

	/**
	 * Bound the request body and the JSON-RPC batch length.
	 *
	 * Note on what the caller actually sees: `HttpTransport::check_permission()` fails closed — it
	 * LOGS a returned `WP_Error` and then returns `false` — so WordPress answers with its generic
	 * `rest_forbidden` 403 and the 413 status carried here never reaches the wire. The `WP_Error` is
	 * still the right return: its message is what lands in the site's error log, which is where an
	 * operator debugging a refused batch will look. Verified live: 21 messages → 403, 2 → 200.
	 *
	 * @param \WP_REST_Request|null $request
	 *
	 * @return bool|\WP_Error
	 */
	public static function within_request_limits( $request = null ) {
		if ( ! $request || ! is_object( $request ) || ! method_exists( $request, 'get_body' ) ) {
			return true;
		}

		/**
		 * Maximum accepted request body, in bytes, for the curated MCP server.
		 *
		 * @param int $bytes Default 1 MiB.
		 */
		$max_bytes = (int) apply_filters( 'pixelgrade/mcp/max_request_bytes', self::MAX_REQUEST_BYTES );

		$body = (string) $request->get_body();

		if ( $max_bytes > 0 && strlen( $body ) > $max_bytes ) {
			return new WP_Error(
				'rest_request_too_large',
				__( 'The request body is larger than this server accepts.', '__plugin_txtd' ),
				array( 'status' => 413 )
			);
		}

		/**
		 * Maximum accepted JSON-RPC batch length for the curated MCP server.
		 *
		 * @param int $count Default 20 messages.
		 */
		$max_batch = (int) apply_filters( 'pixelgrade/mcp/max_batch_messages', self::MAX_BATCH_MESSAGES );

		if ( $max_batch > 0 && '' !== $body ) {
			$decoded = json_decode( $body, true );

			// Only an array with a 0 key is a JSON-RPC batch; a single message decodes to a map.
			if ( is_array( $decoded ) && array_key_exists( 0, $decoded ) && count( $decoded ) > $max_batch ) {
				return new WP_Error(
					'rest_batch_too_large',
					sprintf(
						/* translators: %d: the maximum number of batched JSON-RPC messages. */
						__( 'This server accepts at most %d batched messages per request.', '__plugin_txtd' ),
						$max_batch
					),
					array( 'status' => 413 )
				);
			}
		}

		return true;
	}

	/**
	 * The REST path this server answers on, for documentation and smoke transcripts.
	 *
	 * @return string
	 */
	public static function rest_path() {
		return '/' . self::SERVER_NAMESPACE . '/' . self::SERVER_ROUTE;
	}

	/**
	 * Absolute path to the plugin root, with a trailing slash.
	 *
	 * @return string
	 */
	private static function plugin_dir() {
		return trailingslashit( dirname( dirname( __DIR__ ) ) );
	}
}
