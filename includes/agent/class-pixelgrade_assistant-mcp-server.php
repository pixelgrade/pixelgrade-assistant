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
	 * THE REVIEWED PUBLIC WHITELIST.
	 *
	 * Contract §4: every ability registers private (`meta.mcp.public = false`), and opening one to
	 * the curated server is "an explicit, reviewed change, not a default". This constant IS that
	 * reviewed list — the P5 demo set signed off at Gate 2. Adding a name to it is a product
	 * decision that goes through the orchestrator, not a refactor.
	 *
	 * Fourteen abilities: the complete read set (every ability annotated `readonly: true` in §4's
	 * table) plus exactly three writes chosen for the demo — the two design applies and the starter
	 * import. Everything else — set-design-settings, the three license writes, reset-starter-content,
	 * apply-recipe, canonicalize-post — stays private and is reachable only over WP-CLI.
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
		'pixelgrade/list-starters',          // pixelgrade-assistant
		'pixelgrade/list-recipes',           // pixelgrade-assistant
		'pixelgrade/list-blocks',            // nova-blocks
		'pixelgrade/list-patterns',          // nova-blocks (warms the cloud pattern cache — §4 ‡)
		'pixelgrade/validate-post',          // nova-blocks

		// --- the three opened writes ---
		'pixelgrade/apply-font-palette',     // style-manager
		'pixelgrade/apply-color-palette',    // style-manager
		'pixelgrade/import-starter',         // pixelgrade-assistant
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
		// The whitelist is published as a filter so the abilities in style-manager,
		// pixelgrade-plus and nova-blocks can consult ONE list without depending on Assistant's
		// classes. With Assistant absent the filter has no callback, the list is empty, and every
		// ability in the stack is private — which is the correct default.
		add_filter( 'pixelgrade/mcp/public_abilities', array( __CLASS__, 'public_abilities' ) );

		if ( ! self::bootstrap_adapter() ) {
			return;
		}

		add_action( 'mcp_adapter_init', array( __CLASS__, 'create_server' ) );
	}

	/**
	 * The whitelist, filterable so a site can narrow it further. A filter that returns names
	 * outside {@see PUBLIC_ABILITIES} cannot widen the exposure: {@see create_server()} passes only
	 * the reviewed constant to the adapter, so the filter is a narrowing channel, not a back door.
	 *
	 * @param array $names
	 *
	 * @return array
	 */
	public static function public_abilities( $names = array() ) {
		return array_values( array_unique( array_merge( (array) $names, self::PUBLIC_ABILITIES ) ) );
	}

	/**
	 * Load the vendored adapter.
	 *
	 * Two things are deliberate here:
	 *
	 * 1. We skip entirely if something else already loaded the adapter (the standalone MCP Adapter
	 *    plugin, or another Pixelgrade plugin). Its `constants()` call would re-`define()`
	 *    WP_MCP_DIR, and its default server is then that installation's business, not ours.
	 * 2. We define WP_MCP_AUTOLOAD = false first. The adapter's own Autoloader looks for a
	 *    `vendor/autoload_packages.php` INSIDE the package, which does not exist when the package
	 *    is a dependency rather than a plugin; without this constant it would bail before
	 *    bootstrapping and show an admin notice. Assistant's Composer autoloader already maps the
	 *    `WP\MCP\` namespace, so there is nothing left for the adapter's autoloader to do. The
	 *    constant is the package's own documented bypass.
	 *
	 * @return bool
	 */
	private static function bootstrap_adapter() {
		if ( class_exists( '\WP\MCP\Core\McpAdapter' ) ) {
			return true;
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
	 * Create the curated `pixelgrade` server.
	 *
	 * Exposure is gated twice, on purpose. The adapter reads `meta.mcp.public` off each ability
	 * (private by default), and every Pixelgrade ability sets that from this class's whitelist. We
	 * ALSO hand `create_server()` only the whitelisted names. Either gate alone would do; both
	 * together mean a mistake in one place cannot silently publish a write verb.
	 *
	 * @param \WP\MCP\Core\McpAdapter $adapter
	 */
	public static function create_server( $adapter ) {
		$tools = array();

		foreach ( self::PUBLIC_ABILITIES as $name ) {
			// A name whose owning plugin is not active never registered; passing it would make the
			// adapter log a missing-ability error on every request.
			if ( function_exists( 'wp_has_ability' ) && wp_has_ability( $name ) ) {
				$tools[] = $name;
			}
		}

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
			$tools
		);
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
