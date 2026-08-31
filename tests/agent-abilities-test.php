<?php
/**
 * Pins the `pixelgrade/*` abilities Pixelgrade Assistant owns, and the curated MCP server's
 * reviewed whitelist, per docs/plans/agentic-stack/CONTRACT.md (v0.4.0) §4.
 *
 * What this asserts:
 *
 * 1. Registration presence and shape — the five `assist` abilities register with every required
 *    key, under the shared `pixelgrade` category.
 * 2. Annotations match §4's table exactly, as data.
 * 3. Private by default — with no `pixelgrade/mcp/public_abilities` filter every ability has
 *    `meta.mcp.public === false`; with the filter supplying a name, exactly that one flips.
 * 4. Permission callbacks deny without `manage_options` and never auto-elevate.
 * 5. Execute parity — an ability and its CLI command produce the same result for the same input,
 *    because both run the same PixelgradeAssistant_Agent_Core method.
 * 6. Destructive abilities refuse without `confirm: true` (§3.6, mirrored onto the machine path).
 * 7. The entitlement seam (§4 forward policy) keeps a gated ability out of the registry AND denies
 *    in the permission callback; the shipped set declares no entitlement.
 * 8. The whitelist is the reviewed 14 and the server only ever hands the adapter names from it.
 * 9. Exposure cannot escape the reviewed constant: `meta.mcp.public` is granted ONLY on an adapter
 *    this plugin booted (architecture review H1 — a foreign default server would otherwise publish
 *    all 14 behind its own `read` gate), the filter's incoming names are discarded rather than
 *    merged, and a filter-added name never reaches the tool list handed to `create_server()`.
 * 10. The adapter version handshake (H2): a foreign-booted adapter outside the pinned minor is
 *    skew, and skew degrades to "no curated server" rather than a fatal inside `init`.
 * 11. Request bounds (security LOW-1): body size and JSON-RPC batch length are capped, both
 *    filterable.
 * 12. Uncaught-Throwable redaction (security LOW-2): exception text and class never reach a client;
 *    deliberate refusals pass through untouched.
 *
 * Standalone: run with `php tests/agent-abilities-test.php < /dev/null`.
 *
 * @package PixelgradeAssistant
 */

namespace WP_CLI\Utils {
	function get_flag_value( $assoc_args, $flag, $default = null ) {
		return isset( $assoc_args[ $flag ] ) ? $assoc_args[ $flag ] : $default;
	}
}

namespace {

	define( 'ABSPATH', __DIR__ . '/' );

	// -------------------------------------------------------------------------------------------
	// WordPress surface stubs.
	// -------------------------------------------------------------------------------------------

	class WP_Error {
		public $code;
		public $message;
		public $data;

		public function __construct( $code = '', $message = '', $data = array() ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}

		public function get_error_code() {
			return $this->code;
		}

		public function get_error_message() {
			return $this->message;
		}

		public function get_error_data() {
			return $this->data;
		}
	}

	/**
	 * Minimal WP_REST_Request double: the transport bound check only ever reads the raw body.
	 */
	class Fake_Rest_Request {
		private $body;

		public function __construct( $body = '' ) {
			$this->body = (string) $body;
		}

		public function get_body() {
			return $this->body;
		}
	}

	class WP_REST_Response {
		private $data;

		public function __construct( $data = null, $status = 200 ) {
			$this->data = $data;
		}

		public function get_data() {
			return $this->data;
		}
	}

	class WP_CLI_Test_Halt_Exception extends \Exception {
		public $exit_code;

		public function __construct( $exit_code ) {
			parent::__construct( 'halt:' . $exit_code );
			$this->exit_code = $exit_code;
		}
	}

	class WP_CLI {
		public static $printed_value = null;

		public static function reset() {
			self::$printed_value = null;
		}

		public static function success( $message ) {}
		public static function warning( $message ) {}
		public static function log( $message ) {}
		public static function add_command( $name, $callable, $args = array() ) {}

		public static function print_value( $value, $args = array() ) {
			self::$printed_value = $value;
		}

		public static function halt( $exit_code ) {
			throw new WP_CLI_Test_Halt_Exception( $exit_code );
		}
	}

	$GLOBALS['paf_filters']     = array();
	$GLOBALS['paf_actions']     = array();
	$GLOBALS['paf_denied_caps'] = array();

	function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$GLOBALS['paf_filters'][ $hook ][] = $callback;
	}

	function apply_filters( $hook, $value ) {
		$args = array_slice( func_get_args(), 1 );

		foreach ( ( isset( $GLOBALS['paf_filters'][ $hook ] ) ? $GLOBALS['paf_filters'][ $hook ] : array() ) as $callback ) {
			$args[0] = call_user_func_array( $callback, $args );
		}

		return $args[0];
	}

	function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$GLOBALS['paf_actions'][ $hook ][] = $callback;
	}

	function __return_false() {
		return false;
	}

	function is_wp_error( $thing ) {
		return $thing instanceof WP_Error;
	}

	function esc_html( $text ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES );
	}

	function current_user_can( $capability ) {
		return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
	}

	function sanitize_key( $key ) {
		return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
	}

	function esc_url_raw( $url ) {
		return (string) $url;
	}

	function wp_parse_url( $url, $component = -1 ) {
		return parse_url( (string) $url, $component );
	}

	function __( $text, $domain = 'default' ) {
		return $text;
	}

	function _n( $single, $plural, $number, $domain = 'default' ) {
		return 1 === (int) $number ? $single : $plural;
	}

	function wp_json_encode( $data, $options = 0 ) {
		return json_encode( $data, $options );
	}

	function trailingslashit( $string ) {
		return rtrim( (string) $string, '/\\' ) . '/';
	}

	// -------------------------------------------------------------------------------------------
	// Abilities API stubs: capture registrations so their shape can be asserted.
	// -------------------------------------------------------------------------------------------

	$GLOBALS['paf_abilities']            = array();
	$GLOBALS['paf_ability_categories']   = array();

	function wp_register_ability( $name, $args ) {
		$GLOBALS['paf_abilities'][ $name ] = $args;

		return (object) array( 'name' => $name );
	}

	function wp_register_ability_category( $slug, $args ) {
		$GLOBALS['paf_ability_categories'][ $slug ] = $args;

		return (object) array( 'slug' => $slug );
	}

	function wp_has_ability_category( $slug ) {
		return isset( $GLOBALS['paf_ability_categories'][ $slug ] );
	}

	function wp_has_ability( $name ) {
		return isset( $GLOBALS['paf_abilities'][ $name ] );
	}

	// -------------------------------------------------------------------------------------------
	// Assistant surface stubs (mirroring tests/cli-assist-commands-test.php).
	// -------------------------------------------------------------------------------------------

	$GLOBALS['paf_options']              = array();
	$GLOBALS['paf_remote_config_result'] = array();

	class PixelgradeAssistant_Admin {
		public static function get_option( $key, $default = array() ) {
			return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
		}

		public static function get_remote_config( $skip_cache = false ) {
			return $GLOBALS['paf_remote_config_result'];
		}
	}

	$GLOBALS['paf_admin_hub_starters'] = array();

	function pixassist_get_admin_hub_starters() {
		return $GLOBALS['paf_admin_hub_starters'];
	}

	$GLOBALS['paf_active_starter'] = '';

	function pixassist_get_starter_sites_active_starter() {
		return $GLOBALS['paf_active_starter'];
	}

	$GLOBALS['paf_layout_units_sources'] = array();

	function pixassist_get_layout_units_sources() {
		return $GLOBALS['paf_layout_units_sources'];
	}

	class Fake_Starter_Content {
		public $import_starter_result  = array();
		public $import_starter_calls   = 0;
		public $reset_summary          = array();
		public $list_recipes_result    = array();
		public $apply_recipe_result    = array();
		public $applied_content_units  = array();

		public function import_starter( $demo_key, $base_url ) {
			++$this->import_starter_calls;

			return $this->import_starter_result;
		}

		public function reset_starter_content() {
			return $this->reset_summary;
		}

		public function list_recipes( $sources = array() ) {
			return $this->list_recipes_result;
		}

		public function apply_recipe( $recipe_id, $base_url, $options = array() ) {
			return $this->apply_recipe_result;
		}

		public function get_applied_layout_units() {
			return array();
		}

		public function get_applied_content_units() {
			return $this->applied_content_units;
		}
	}

	$GLOBALS['paf_starter_content'] = new Fake_Starter_Content();

	function PixelgradeAssistant() {
		return (object) array( 'starter_content' => $GLOBALS['paf_starter_content'] );
	}

	// -------------------------------------------------------------------------------------------
	// Load the code under test.
	// -------------------------------------------------------------------------------------------

	require_once __DIR__ . '/../includes/agent/class-pixelgrade_assistant-agent-core.php';
	require_once __DIR__ . '/../includes/agent/class-pixelgrade_assistant-abilities.php';
	require_once __DIR__ . '/../includes/agent/class-pixelgrade_assistant-mcp-server.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-envelope.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-starter-command.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-recipe-command.php';

	// -------------------------------------------------------------------------------------------
	// Assertions.
	// -------------------------------------------------------------------------------------------

	$failures = array();

	function paf_assert( $condition, $message ) {
		global $failures;

		if ( ! $condition ) {
			$failures[] = $message;
		}
	}

	function paf_assert_same( $expected, $actual, $message ) {
		global $failures;

		if ( $expected !== $actual ) {
			$failures[] = $message . ' — expected ' . var_export( $expected, true ) . ', got ' . var_export( $actual, true );
		}
	}

	/**
	 * Register the abilities fresh, optionally with a whitelist filter in place.
	 */
	function paf_register_abilities( $public_names = array() ) {
		$GLOBALS['paf_abilities']          = array();
		$GLOBALS['paf_ability_categories'] = array();
		$GLOBALS['paf_filters']            = array();

		if ( ! empty( $public_names ) ) {
			add_filter(
				'pixelgrade/mcp/public_abilities',
				static function ( $names ) use ( $public_names ) {
					return array_merge( (array) $names, $public_names );
				}
			);
		}

		PixelgradeAssistant_Abilities::register_category();
		PixelgradeAssistant_Abilities::register_abilities();

		return $GLOBALS['paf_abilities'];
	}

	/**
	 * Register abilities WITHOUT resetting the filter chain — for the exposure tests, which need
	 * Assistant's own `public_abilities` callback in place to exercise the real grant path.
	 */
	function paf_register_abilities_with_current_filters() {
		$GLOBALS['paf_abilities']          = array();
		$GLOBALS['paf_ability_categories'] = array();

		PixelgradeAssistant_Abilities::register_category();
		PixelgradeAssistant_Abilities::register_abilities();

		return $GLOBALS['paf_abilities'];
	}

	// --- 1. Registration presence and shape ----------------------------------------------------

	$abilities = paf_register_abilities();

	$expected_names = array(
		'pixelgrade/list-starters',
		'pixelgrade/import-starter',
		'pixelgrade/reset-starter-content',
		'pixelgrade/list-recipes',
		'pixelgrade/apply-recipe',
	);

	paf_assert_same( $expected_names, array_keys( $abilities ), 'the five assist abilities register, with the exact contract §4 names' );

	paf_assert( isset( $GLOBALS['paf_ability_categories']['pixelgrade'] ), 'the shared `pixelgrade` category is registered' );

	foreach ( $abilities as $name => $args ) {
		foreach ( array( 'label', 'description', 'category', 'input_schema', 'output_schema', 'execute_callback', 'permission_callback', 'meta' ) as $key ) {
			paf_assert( isset( $args[ $key ] ), $name . ' declares ' . $key );
		}

		paf_assert_same( 'pixelgrade', $args['category'], $name . ' registers into the pixelgrade category' );
		paf_assert( is_callable( $args['execute_callback'] ), $name . ' execute_callback is callable' );
		paf_assert( is_callable( $args['permission_callback'] ), $name . ' permission_callback is callable' );
		paf_assert_same( 'object', $args['input_schema']['type'], $name . ' declares an object input schema' );
		paf_assert( ! empty( $args['description'] ), $name . ' has an LLM-facing description' );
	}

	// The category must be registered idempotently — every Pixelgrade plugin does this defensively.
	$before = $GLOBALS['paf_ability_categories']['pixelgrade'];
	PixelgradeAssistant_Abilities::register_category();
	paf_assert_same( $before, $GLOBALS['paf_ability_categories']['pixelgrade'], 'registering the category twice is a no-op' );

	// --- 2. Annotations match §4's table -------------------------------------------------------

	$expected_annotations = array(
		'pixelgrade/list-starters'         => array( 'readonly' => true,  'destructive' => false, 'idempotent' => true ),
		'pixelgrade/import-starter'        => array( 'readonly' => false, 'destructive' => true,  'idempotent' => false ),
		'pixelgrade/reset-starter-content' => array( 'readonly' => false, 'destructive' => true,  'idempotent' => true ),
		'pixelgrade/list-recipes'          => array( 'readonly' => true,  'destructive' => false, 'idempotent' => true ),
		'pixelgrade/apply-recipe'          => array( 'readonly' => false, 'destructive' => true,  'idempotent' => false ),
	);

	foreach ( $expected_annotations as $name => $expected ) {
		paf_assert_same( $expected, $abilities[ $name ]['meta']['annotations'], $name . ' annotations match contract §4' );
	}

	// --- 3. Private by default -----------------------------------------------------------------

	foreach ( $abilities as $name => $args ) {
		paf_assert_same( false, $args['meta']['mcp']['public'], $name . ' is private with no whitelist filter in place' );
	}

	$abilities_public = paf_register_abilities( array( 'pixelgrade/list-starters' ) );

	paf_assert_same( true, $abilities_public['pixelgrade/list-starters']['meta']['mcp']['public'], 'a whitelisted ability is public' );
	paf_assert_same( false, $abilities_public['pixelgrade/import-starter']['meta']['mcp']['public'], 'a non-whitelisted ability stays private even when a sibling is opened' );

	// --- 4. Permission callbacks ---------------------------------------------------------------

	$abilities = paf_register_abilities();

	$GLOBALS['paf_denied_caps'] = array();
	foreach ( $abilities as $name => $args ) {
		paf_assert_same( true, call_user_func( $args['permission_callback'], array() ), $name . ' allows a user with manage_options' );
	}

	$GLOBALS['paf_denied_caps'] = array( 'manage_options' => true );
	foreach ( $abilities as $name => $args ) {
		$denied = call_user_func( $args['permission_callback'], array() );
		paf_assert( true !== $denied, $name . ' denies a user without manage_options' );
		paf_assert( $denied instanceof WP_Error && 'permission_denied' === $denied->get_error_code(), $name . ' names the reason it denied' );
	}
	$GLOBALS['paf_denied_caps'] = array();

	// --- 5. Execute parity with the CLI --------------------------------------------------------

	$GLOBALS['paf_remote_config_result'] = array( 'some' => 'config' );
	$GLOBALS['paf_admin_hub_starters']   = array(
		array( 'key' => 'anima-restaurant' ),
		array( 'key' => 'anima-portfolio' ),
	);

	$ability_result = call_user_func( $abilities['pixelgrade/list-starters']['execute_callback'], array() );

	WP_CLI::reset();
	$command  = new PixelgradeAssistant_CLI_Starter_Command();
	$cli_exit = null;
	try {
		$command->list_starters( array(), array( 'format' => 'json' ) );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		$cli_exit = $e->exit_code;
	}
	$cli_envelope = WP_CLI::$printed_value;

	paf_assert_same( 0, $cli_exit, 'the CLI list command exits 0' );
	paf_assert_same( $cli_envelope['ok'], $ability_result['ok'], 'list-starters: ability and command agree on ok' );
	paf_assert_same( $cli_envelope['code'], $ability_result['code'], 'list-starters: ability and command agree on code' );
	paf_assert_same( $cli_envelope['summary'], $ability_result['summary'], 'list-starters: ability and command agree on summary' );
	paf_assert_same( $cli_envelope['data'], $ability_result['data'], 'list-starters: ability and command agree on data' );
	paf_assert_same( $cli_envelope['warnings'], $ability_result['warnings'], 'list-starters: ability and command agree on warnings' );

	// A hub failure is exit 1 on the CLI, so the ability must surface it as an error, not as an
	// envelope claiming success — and it must carry the same closed machine token.
	$GLOBALS['paf_remote_config_result'] = false;
	$failed = call_user_func( $abilities['pixelgrade/list-starters']['execute_callback'], array() );
	paf_assert( $failed instanceof WP_Error, 'a CLI exit-1 outcome comes back as WP_Error, never as an ok envelope' );
	paf_assert_same( 'hub_fetch_failed', $failed->get_error_code(), 'the WP_Error carries the command\'s closed machine token verbatim' );
	$GLOBALS['paf_remote_config_result'] = array( 'some' => 'config' );

	// --- 6. Destructive abilities require confirm ----------------------------------------------

	$GLOBALS['paf_starter_content']->import_starter_calls  = 0;
	$GLOBALS['paf_starter_content']->import_starter_result = array( 'code' => 'success', 'message' => 'done', 'data' => array() );

	$unconfirmed = call_user_func(
		$abilities['pixelgrade/import-starter']['execute_callback'],
		array( 'demo_key' => 'anima-restaurant', 'source_url' => 'https://demo.example.com/wp-json/sce/v2/' )
	);

	paf_assert( $unconfirmed instanceof WP_Error, 'import-starter refuses without confirm' );
	paf_assert_same( 'confirmation_required', $unconfirmed->get_error_code(), 'the refusal is the contract §3.6 code' );
	paf_assert_same( 0, $GLOBALS['paf_starter_content']->import_starter_calls, 'an unconfirmed import never reaches the importer' );

	$confirmed = call_user_func(
		$abilities['pixelgrade/import-starter']['execute_callback'],
		array( 'demo_key' => 'anima-restaurant', 'source_url' => 'https://demo.example.com/wp-json/sce/v2/', 'confirm' => true )
	);

	paf_assert( is_array( $confirmed ) && ! empty( $confirmed['ok'] ), 'a confirmed import returns an ok envelope' );
	paf_assert_same( 1, $GLOBALS['paf_starter_content']->import_starter_calls, 'a confirmed import runs the importer exactly once' );

	// Validation runs BEFORE the confirmation gate, exactly as the CLI orders it — otherwise the
	// same malformed-and-unconfirmed call would report a different code on each surface.
	$bad_scheme = call_user_func(
		$abilities['pixelgrade/import-starter']['execute_callback'],
		array( 'demo_key' => 'anima-restaurant', 'source_url' => 'http://demo.example.com/' )
	);
	paf_assert_same( 'invalid_params', $bad_scheme->get_error_code(), 'a non-https source_url is invalid_params, not confirmation_required' );

	$reset_unconfirmed = call_user_func( $abilities['pixelgrade/reset-starter-content']['execute_callback'], array() );
	paf_assert_same( 'confirmation_required', $reset_unconfirmed->get_error_code(), 'reset-starter-content refuses without confirm' );

	$apply_unconfirmed = call_user_func(
		$abilities['pixelgrade/apply-recipe']['execute_callback'],
		array( 'recipe_id' => 'anima-restaurant', 'source_url' => 'https://demo.example.com/wp-json/sce/v2/' )
	);
	paf_assert_same( 'confirmation_required', $apply_unconfirmed->get_error_code(), 'apply-recipe refuses without confirm' );

	// --- 7. The entitlement seam ---------------------------------------------------------------

	foreach ( PixelgradeAssistant_Abilities::descriptors() as $name => $descriptor ) {
		paf_assert( empty( $descriptor['entitlement'] ), $name . ' declares no entitlement (contract §4: nothing is Plus-gated today)' );
	}

	$gated = array( 'entitlement' => 'studio' );

	$GLOBALS['paf_filters'] = array();
	paf_assert_same( false, PixelgradeAssistant_Abilities::entitled( $gated ), 'a gated descriptor is denied when nothing grants the entitlement' );

	add_filter(
		'pixelgrade/has_entitlement',
		static function ( $granted, $key ) {
			return 'studio' === $key ? true : $granted;
		}
	);
	paf_assert_same( true, PixelgradeAssistant_Abilities::entitled( $gated ), 'a gated descriptor is allowed once Plus grants the entitlement' );
	paf_assert_same( true, PixelgradeAssistant_Abilities::entitled( array() ), 'an ungated descriptor is always allowed' );
	$GLOBALS['paf_filters'] = array();

	// --- 8. The reviewed whitelist -------------------------------------------------------------

	$whitelist = PixelgradeAssistant_MCP_Server::PUBLIC_ABILITIES;

	paf_assert_same( 14, count( $whitelist ), 'the reviewed whitelist is exactly the 14 abilities signed off at Gate 2' );
	paf_assert_same( count( $whitelist ), count( array_unique( $whitelist ) ), 'the whitelist has no duplicates' );

	$expected_whitelist = array(
		'pixelgrade/get-design-system',
		'pixelgrade/get-design-settings',
		'pixelgrade/get-design-structure',
		'pixelgrade/export-design-system',
		'pixelgrade/flush-design-cache',
		'pixelgrade/get-license-status',
		'pixelgrade/list-starters',
		'pixelgrade/list-recipes',
		'pixelgrade/list-blocks',
		'pixelgrade/list-patterns',
		'pixelgrade/validate-post',
		'pixelgrade/apply-font-palette',
		'pixelgrade/apply-color-palette',
		'pixelgrade/import-starter',
	);

	paf_assert_same( $expected_whitelist, $whitelist, 'the whitelist is the read set plus the three opened writes, and nothing else' );

	// The writes that must NOT be public.
	foreach ( array(
		'pixelgrade/set-design-settings',
		'pixelgrade/activate-license',
		'pixelgrade/refresh-license',
		'pixelgrade/disconnect-license',
		'pixelgrade/reset-starter-content',
		'pixelgrade/apply-recipe',
		'pixelgrade/canonicalize-post',
	) as $must_stay_private ) {
		paf_assert( ! in_array( $must_stay_private, $whitelist, true ), $must_stay_private . ' stays private' );
	}

	// The transport gate: reaching the server at all needs the lowest capability any exposed
	// ability requires, so a subscriber cannot enumerate the catalog it could never execute.
	$GLOBALS['paf_denied_caps'] = array();
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::can_reach_server(), 'a user with edit_posts may reach the server' );

	$GLOBALS['paf_denied_caps'] = array( 'edit_posts' => true );
	paf_assert_same( false, PixelgradeAssistant_MCP_Server::can_reach_server(), 'a user without edit_posts is refused at the transport, before any ability is named' );
	$GLOBALS['paf_denied_caps'] = array();

	// --- 9. Exposure cannot escape the reviewed constant (architecture review H1 / L4) -----------

	// Helper: force the "did WE boot the adapter?" flag, which decides whether meta.mcp.public may
	// be granted at all.
	$set_bootstrapped = static function ( $value ) {
		$ref  = new \ReflectionClass( 'PixelgradeAssistant_MCP_Server' );
		$prop = $ref->getProperty( 'bootstrapped' );
		if ( PHP_VERSION_ID < 80100 ) {
			$prop->setAccessible( true );
		}
		$prop->setValue( null, $value );
	};

	// (a) A FOREIGN-BOOTED adapter: another plugin loaded MCP Adapter, so its default server is
	// still running and we did not suppress it. Granting meta.mcp.public would publish all 14 onto
	// that server, behind ITS transport gate (`read`) — the disclosure the edit_posts floor exists
	// to close, walked around by another plugin's presence. So nothing may be granted.
	$set_bootstrapped( false );
	$GLOBALS['paf_filters'] = array();
	add_filter( 'pixelgrade/mcp/public_abilities', array( 'PixelgradeAssistant_MCP_Server', 'public_abilities' ) );

	$foreign = paf_register_abilities_with_current_filters();

	foreach ( $foreign as $name => $args ) {
		paf_assert_same( false, $args['meta']['mcp']['public'], $name . ' is NOT public when a foreign plugin booted the adapter' );
	}
	paf_assert_same( array(), PixelgradeAssistant_MCP_Server::public_abilities(), 'no name is granted on a foreign-booted adapter' );

	// (b) An adapter WE booted: its default server is suppressed, so the grant is inert-but-honest
	// and the reviewed 14 are declared public.
	$set_bootstrapped( true );
	paf_assert_same(
		$expected_whitelist,
		PixelgradeAssistant_MCP_Server::public_abilities(),
		'the reviewed 14 are granted on an adapter we booted'
	);

	// (c) The callback DISCARDS incoming names rather than merging them. Merging let a third-party
	// add_filter flip meta.mcp.public on a non-reviewed write — invisible on the curated server,
	// live on a coexisting default server.
	paf_assert_same(
		$expected_whitelist,
		PixelgradeAssistant_MCP_Server::public_abilities( array( 'pixelgrade/canonicalize-post', 'pixelgrade/set-design-settings' ) ),
		'names arriving from another filter are discarded, not merged'
	);

	// (d) L4, made non-vacuous: the list actually handed to create_server() is the constant
	// intersected with what registered — never the filter's output. Asserting the constant is
	// immutable would be a tautology; this asserts the property that matters.
	$GLOBALS['paf_filters'] = array();
	add_filter(
		'pixelgrade/mcp/public_abilities',
		static function ( $names ) {
			$names[] = 'pixelgrade/reset-starter-content';

			return $names;
		}
	);

	$tools = PixelgradeAssistant_MCP_Server::tools_for_server();

	paf_assert(
		! in_array( 'pixelgrade/reset-starter-content', $tools, true ),
		'a filter-added name never reaches the tool list handed to the adapter'
	);
	paf_assert(
		in_array( 'pixelgrade/list-starters', $tools, true ),
		'a registered, reviewed name does reach the tool list'
	);
	paf_assert(
		! in_array( 'pixelgrade/get-design-settings', $tools, true ),
		'a reviewed name whose owning plugin is inactive is dropped from the tool list'
	);
	$GLOBALS['paf_filters'] = array();

	// --- 10. Adapter version handshake (architecture review H2) ---------------------------------

	// We booted it from the pinned vendor copy: by definition the version this file targets.
	$set_bootstrapped( true );
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::adapter_version_supported(), 'our own pinned boot is always supported' );

	// Foreign boot, matching minor — 0.x patch releases do not change signatures.
	$set_bootstrapped( false );
	define( 'WP_MCP_VERSION', '0.6.9' );
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::adapter_version_supported(), 'a foreign 0.6.x adapter is supported' );

	// The skew case cannot be re-tested in-process (WP_MCP_VERSION is a constant), so the
	// comparison itself is pinned directly.
	$ref  = new \ReflectionClass( 'PixelgradeAssistant_MCP_Server' );
	$same = $ref->getMethod( 'same_minor' );
	if ( PHP_VERSION_ID < 80100 ) {
		$same->setAccessible( true );
	}

	paf_assert_same( true, $same->invoke( null, '0.6.1', '0.6.1' ), 'identical versions match' );
	paf_assert_same( true, $same->invoke( null, 'v0.6.9', '0.6.1' ), 'a v-prefixed patch bump matches' );
	paf_assert_same( false, $same->invoke( null, '0.7.0', '0.6.1' ), 'a minor bump is skew — the create_server signature may have changed' );
	paf_assert_same( false, $same->invoke( null, '1.0.0', '0.6.1' ), 'a major bump is skew' );
	paf_assert_same( false, $same->invoke( null, 'garbage', '0.6.1' ), 'an unparseable version fails closed' );

	$set_bootstrapped( true );

	// --- 11. Request bounds (security review LOW-1) ---------------------------------------------

	paf_assert_same( true, PixelgradeAssistant_MCP_Server::within_request_limits( null ), 'no request object is not a rejection' );

	$small = new Fake_Rest_Request( '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' );
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::within_request_limits( $small ), 'an ordinary single message passes' );

    $oversized = new Fake_Rest_Request( str_repeat( 'x', PixelgradeAssistant_MCP_Server::MAX_REQUEST_BYTES + 1 ) );
	$rejected  = PixelgradeAssistant_MCP_Server::within_request_limits( $oversized );
	paf_assert( $rejected instanceof WP_Error && 'rest_request_too_large' === $rejected->get_error_code(), 'an oversized body is refused' );

	$batch      = array();
	$batch_size = PixelgradeAssistant_MCP_Server::MAX_BATCH_MESSAGES + 1;
	for ( $i = 0; $i < $batch_size; $i++ ) {
		$batch[] = array( 'jsonrpc' => '2.0', 'id' => $i, 'method' => 'tools/call' );
	}
	$big_batch = new Fake_Rest_Request( json_encode( $batch ) );
	$rejected  = PixelgradeAssistant_MCP_Server::within_request_limits( $big_batch );
	paf_assert( $rejected instanceof WP_Error && 'rest_batch_too_large' === $rejected->get_error_code(), 'an over-long JSON-RPC batch is refused' );

	$ok_batch = new Fake_Rest_Request( json_encode( array_slice( $batch, 0, 2 ) ) );
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::within_request_limits( $ok_batch ), 'a short batch passes' );

	// The caps are filterable for a site that genuinely batches.
	$GLOBALS['paf_filters'] = array();
	add_filter( 'pixelgrade/mcp/max_batch_messages', static function () use ( $batch_size ) { return $batch_size + 1; } );
	paf_assert_same( true, PixelgradeAssistant_MCP_Server::within_request_limits( $big_batch ), 'the batch cap is filterable' );
	$GLOBALS['paf_filters'] = array();

	// --- 12. Uncaught-Throwable redaction (security review LOW-2 item 1) ------------------------

	$leaky = new WP_Error(
		'mcp_execution_failed',
		'SQLSTATE[HY000] [2002] No such file or directory at /var/www/secret/wp-includes/wp-db.php:1234',
		array( 'error_type' => 'PDOException' )
	);

	$redacted = PixelgradeAssistant_MCP_Server::redact_tool_error( $leaky, array(), 'pixelgrade-list-starters' );

	paf_assert( $redacted instanceof WP_Error, 'an uncaught-Throwable error stays an error' );
	paf_assert_same( 'mcp_execution_failed', $redacted->get_error_code(), 'the machine token is preserved' );
	paf_assert(
		false === strpos( $redacted->get_error_message(), '/var/www' ),
		'the exception message — and any path in it — never reaches the client'
	);
	paf_assert(
		false === strpos( $redacted->get_error_message(), 'PDOException' ),
		'the exception class never reaches the client'
	);
	paf_assert_same( array(), (array) $redacted->get_error_data(), 'error_type is dropped from the payload' );

	// A deliberate refusal must pass through untouched — it is written for the caller.
	$deliberate = new WP_Error( 'confirmation_required', 'Importing starter content is destructive.' );
	$passed     = PixelgradeAssistant_MCP_Server::redact_tool_error( $deliberate, array(), 'pixelgrade-import-starter' );

	paf_assert_same( $deliberate, $passed, 'a deliberate refusal is not redacted' );

	$envelope = array( 'ok' => true, 'code' => 'ok' );
	paf_assert_same( $envelope, PixelgradeAssistant_MCP_Server::redact_tool_error( $envelope, array(), 'pixelgrade-list-starters' ), 'a successful result is untouched' );

	// -------------------------------------------------------------------------------------------

	if ( ! empty( $failures ) ) {
		fwrite( STDERR, "FAILURES:\n  - " . implode( "\n  - ", $failures ) . "\n" );
		exit( 1 );
	}

	echo "Assistant abilities + curated MCP whitelist contract OK\n";
}
