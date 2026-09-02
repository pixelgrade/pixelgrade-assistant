<?php
/**
 * Pins the `wp pixelgrade assist` CLI subtree: the §2 envelope shape, the §2 exit-code mapping,
 * the §3.0 permission-first rule, and the §3.6 --yes rule (format-bound, not TTY-bound, per
 * v0.3.2/v0.3.3), per docs/plans/agentic-stack/CONTRACT.md (v0.3.3) §1.3.
 *
 * Standalone: run with `php tests/cli-assist-commands-test.php < /dev/null` (no WordPress, no
 * real WP-CLI needed — WP_CLI and the WP function surface the CLI code touches are stubbed
 * below). The `< /dev/null` is a safety habit, not a requirement: this file never drives the
 * table-mode interactive-STDIN branch of `confirmed()` (see the note where that's skipped).
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

	// ---------------------------------------------------------------------------------------
	// WP_CLI stub: captures halt()/success()/warning()/log()/print_value() calls so the tests
	// can assert on the envelope and exit code without a real WP-CLI runtime.
	// ---------------------------------------------------------------------------------------

	// Minimal WP_REST_Response stub (H1): production code checks `$result instanceof
	// WP_REST_Response` and unwraps via get_data() — this lets the test drive that exact shape.
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
		public static $log             = array();
		public static $printed_value   = null;
		public static $printed_format  = null;
		public static $added_commands  = array();

		public static function reset() {
			self::$log            = array();
			self::$printed_value  = null;
			self::$printed_format = null;
			self::$added_commands = array();
		}

		public static function add_command( $name, $class ) {
			self::$added_commands[ $name ] = $class;
		}

		public static function success( $message ) {
			self::$log[] = array( 'success', $message );
		}

		public static function warning( $message ) {
			self::$log[] = array( 'warning', $message );
		}

		public static function log( $message ) {
			self::$log[] = array( 'log', $message );
		}

		public static function error( $message ) {
			self::$log[] = array( 'error', $message );
			throw new WP_CLI_Test_Halt_Exception( 1 );
		}

		public static function print_value( $value, $assoc_args = array() ) {
			self::$printed_value  = $value;
			self::$printed_format = isset( $assoc_args['format'] ) ? $assoc_args['format'] : null;
		}

		public static function halt( $exit_code ) {
			throw new WP_CLI_Test_Halt_Exception( $exit_code );
		}
	}

	// ---------------------------------------------------------------------------------------
	// Minimal WordPress function surface the CLI code calls.
	// ---------------------------------------------------------------------------------------

	$GLOBALS['paf_denied_caps'] = array();

	function current_user_can( $capability ) {
		return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
	}

	function sanitize_key( $key ) {
		return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
	}

	function apply_filters( $hook, $value ) {
		return $value;
	}

	function sanitize_text_field( $value ) {
		return trim( strip_tags( (string) $value ) );
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

	// ---------------------------------------------------------------------------------------
	// PixelgradeAssistant_Admin stub: a tiny in-memory option store, plus a scriptable
	// get_remote_config() so `starter list` hub-fetch-failure detection can be exercised.
	// ---------------------------------------------------------------------------------------

	$GLOBALS['paf_options']              = array();
	$GLOBALS['paf_remote_config_result'] = array(); // false, or an array config.

	class PixelgradeAssistant_Admin {
		public static function get_option( $key, $default = array() ) {
			return array_key_exists( $key, $GLOBALS['paf_options'] ) ? $GLOBALS['paf_options'][ $key ] : $default;
		}

		public static function set_option( $key, $value ) {
			$GLOBALS['paf_options'][ $key ] = $value;
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

	$GLOBALS['paf_content_patterns_sources'] = array();

	function pixassist_get_content_patterns_sources() {
		return $GLOBALS['paf_content_patterns_sources'];
	}

	// ---------------------------------------------------------------------------------------
	// A scriptable double for PixelgradeAssistant_StarterContent: every test configures exactly
	// the return values / journal side effects it needs.
	// ---------------------------------------------------------------------------------------

	class Fake_Starter_Content {
		public $import_starter_result   = array();
		public $import_starter_journal  = null; // when set, replaces $GLOBALS['paf_options']['imported_starter_content'] after the call.
		public $reset_summary           = array();
		public $reset_throws            = false;
		public $list_recipes_result     = array();
		public $list_recipes_sources_seen = null;
		public $apply_recipe_result     = array();
		public $applied_layout_units_sequence = array(); // consumed one at a time per call.
		public $applied_content_units   = array();
		public $applied_content_units_sequence = array(); // consumed one at a time per call.
		public $list_content_units_result = array();
		public $list_content_units_sources_seen = null;
		public $import_content_unit_result = array();
		public $import_content_unit_args_seen = null;
		public $journal_after_import    = null; // when set, replaces the starter-content journal after the call.

		public function import_starter( $demo_key, $base_url ) {
			if ( null !== $this->import_starter_journal ) {
				$GLOBALS['paf_options']['imported_starter_content'] = $this->import_starter_journal;
			}

			return $this->import_starter_result;
		}

		public function reset_starter_content() {
			if ( $this->reset_throws ) {
				throw new \RuntimeException( 'boom' );
			}

			return $this->reset_summary;
		}

		public function list_recipes( $sources = array() ) {
			$this->list_recipes_sources_seen = $sources;

			return $this->list_recipes_result;
		}

		public function apply_recipe( $recipe_id, $base_url, $options = array() ) {
			return $this->apply_recipe_result;
		}

		public function get_applied_layout_units() {
			if ( empty( $this->applied_layout_units_sequence ) ) {
				return array();
			}

			return array_shift( $this->applied_layout_units_sequence );
		}

		public function get_applied_content_units() {
			if ( ! empty( $this->applied_content_units_sequence ) ) {
				return array_shift( $this->applied_content_units_sequence );
			}

			return $this->applied_content_units;
		}

		public function list_content_units_for_sources( $sources ) {
			$this->list_content_units_sources_seen = $sources;

			return $this->list_content_units_result;
		}

		public function import_content_unit( $demo_key, $base_url, $unit_type, $unit ) {
			$this->import_content_unit_args_seen = compact( 'demo_key', 'base_url', 'unit_type', 'unit' );

			// The real importer sideloads media into the starter-content journal before it journals
			// the record itself; the double lets a test reproduce exactly that mid-way state.
			if ( null !== $this->journal_after_import ) {
				$GLOBALS['paf_options']['imported_starter_content'] = $this->journal_after_import;
			}

			return $this->import_content_unit_result;
		}
	}

	$GLOBALS['paf_starter_content'] = new Fake_Starter_Content();

	function PixelgradeAssistant() {
		return (object) array( 'starter_content' => $GLOBALS['paf_starter_content'] );
	}

	// ---------------------------------------------------------------------------------------
	// Load the CLI classes under test.
	// ---------------------------------------------------------------------------------------

	require_once __DIR__ . '/../includes/agent/class-pixelgrade_assistant-agent-core.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-envelope.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-starter-command.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-recipe-command.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-pattern-command.php';

	// ---------------------------------------------------------------------------------------
	// Test harness helpers.
	// ---------------------------------------------------------------------------------------

	function paf_reset_runtime() {
		WP_CLI::reset();
		$GLOBALS['paf_denied_caps']          = array();
		$GLOBALS['paf_options']              = array();
		$GLOBALS['paf_remote_config_result'] = array( 'starterContent' => array() );
		$GLOBALS['paf_admin_hub_starters']   = array();
		$GLOBALS['paf_active_starter']       = '';
		$GLOBALS['paf_layout_units_sources'] = array();
		$GLOBALS['paf_content_patterns_sources'] = array();
		$GLOBALS['paf_starter_content']      = new Fake_Starter_Content();
	}

	/**
	 * Run a CLI command callback, catching the halt() it always ends in.
	 *
	 * @return int The exit code passed to WP_CLI::halt().
	 */
	function paf_run( $callable, $args, $assoc_args ) {
		try {
			call_user_func( $callable, $args, $assoc_args );
		} catch ( WP_CLI_Test_Halt_Exception $e ) {
			return $e->exit_code;
		}

		throw new \RuntimeException( 'Command did not halt.' );
	}

	function assert_same( $expected, $actual, $message ) {
		if ( $expected !== $actual ) {
			fwrite( STDERR, $message . PHP_EOL );
			fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
			fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
			exit( 1 );
		}
	}

	function assert_true( $condition, $message ) {
		if ( ! $condition ) {
			fwrite( STDERR, $message . PHP_EOL );
			exit( 1 );
		}
	}

	// =========================================================================================
	// Envelope: permission-first (§3.0), --yes (§3.6), and the JSON/table envelope shape (§2).
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_denied_caps']['manage_options'] = true;
	$exit = paf_run(
		function ( $a, $aa ) {
			PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $aa );
		},
		array(),
		array()
	);
	assert_same( 3, $exit, 'A denied capability must halt with exit 3 (table format).' );

	paf_reset_runtime();
	$GLOBALS['paf_denied_caps']['manage_options'] = true;
	try {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', array( 'format' => 'json' ) );
		assert_true( false, 'require_capability() must halt, not return, when denied.' );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 3, $e->exit_code, 'Denied capability halts 3.' );
		assert_same( false, WP_CLI::$printed_value['ok'], 'Denied capability envelope must be ok:false.' );
		assert_same( 'permission_denied', WP_CLI::$printed_value['code'], 'Denied capability code must be permission_denied.' );
		assert_true( false !== strpos( WP_CLI::$printed_value['summary'], 'manage_options' ), 'Summary must name the required capability.' );
		assert_true( false !== strpos( WP_CLI::$printed_value['summary'], '--user' ), 'Summary must suggest --user.' );
	}

	paf_reset_runtime();
	// Capability allowed: require_capability() must return normally (no halt).
	$threw = false;
	try {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', array() );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		$threw = true;
	}
	assert_true( ! $threw, 'An allowed capability must not halt.' );

	paf_reset_runtime();
	// ok:true/exit:0 in json mode — envelope shape + no extra STDOUT chatter mixed in.
	try {
		PixelgradeAssistant_CLI_Envelope::emit( true, 'ok', 'All good.', array( 'x' => 1 ), array(), 0, array(), array( 'format' => 'json' ) );
		assert_true( false, 'emit() must always halt.' );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 0, $e->exit_code, 'ok:true exit 0.' );
		assert_same( 'json', WP_CLI::$printed_format, 'json format must route through print_value(format=json).' );
		assert_same( true, WP_CLI::$printed_value['ok'], 'Envelope ok must be true.' );
		assert_same( 'ok', WP_CLI::$printed_value['code'], 'Envelope code must round-trip.' );
		assert_same( array( 'x' => 1 ), WP_CLI::$printed_value['data'], 'Envelope data must round-trip.' );
		assert_same( array(), WP_CLI::$printed_value['warnings'], 'Envelope warnings must default to an empty array.' );
		assert_true( ! array_key_exists( 'retryable', WP_CLI::$printed_value ), 'retryable must be absent when not supplied via $extra.' );
	}

	paf_reset_runtime();
	// Empty data must serialize as `{}` (an object), never `[]`, per the pinned §2 schema.
	try {
		PixelgradeAssistant_CLI_Envelope::emit( true, 'ok', 'Nothing to report.', array(), array(), 0, array(), array( 'format' => 'json' ) );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_true( WP_CLI::$printed_value['data'] instanceof stdClass, 'Empty data must be a stdClass so it json-encodes as {}.' );
		assert_same( '{}', wp_json_encode( WP_CLI::$printed_value['data'] ), 'Empty data must json-encode as {}.' );
	}

	paf_reset_runtime();
	// ok:true/exit:2 ("findings") — retryable propagates when present in $extra.
	try {
		PixelgradeAssistant_CLI_Envelope::emit( false, 'hub_fetch_failed', 'Could not reach the hub.', array(), array(), 1, array( 'retryable' => true ), array( 'format' => 'json' ) );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 1, $e->exit_code, 'ok:false exit 1.' );
		assert_same( true, WP_CLI::$printed_value['retryable'], 'retryable:true must propagate into the envelope.' );
	}

	paf_reset_runtime();
	// Table mode: same fields as success/warning/log lines, identical exit code (§2).
	try {
		PixelgradeAssistant_CLI_Envelope::emit(
			true,
			'partial',
			'Partly done.',
			array( 'n' => 2 ),
			array( array( 'code' => 'missing_required_plugins', 'message' => 'Install nova-blocks.' ) ),
			2,
			array(),
			array( 'format' => 'table' )
		);
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 2, $e->exit_code, 'Table mode exit code must match the envelope exit code.' );
		assert_same( null, WP_CLI::$printed_value, 'Table mode must not call print_value().' );
		assert_same( array( 'success', 'Partly done.' ), WP_CLI::$log[0], 'ok:true must render as a success line.' );
		assert_same( array( 'warning', 'Install nova-blocks.' ), WP_CLI::$log[1], 'Each warnings[] entry must render as a warning line.' );
	}

	paf_reset_runtime();
	// §3.6: --yes present -> confirmed, no halt, no matter the format.
	assert_true(
		PixelgradeAssistant_CLI_Envelope::confirmed( array( 'yes' => true ), 'Proceed?' ),
		'--yes must confirm.'
	);
	assert_true(
		PixelgradeAssistant_CLI_Envelope::confirmed( array( 'yes' => true, 'format' => 'json' ), 'Proceed?' ),
		'--yes must confirm under --format=json too.'
	);

	paf_reset_runtime();
	// §3.6 (v0.3.2, W2 review H1): confirmation is bound to --format, NOT to TTY detection. Under
	// json/yaml, --yes is strictly required and no prompt is ever attempted — confirmed() must
	// return false immediately without touching STDIN/STDOUT.
	assert_true(
		! PixelgradeAssistant_CLI_Envelope::confirmed( array( 'format' => 'json' ), 'Proceed?' ),
		'Missing --yes under --format=json must not confirm (no prompt attempted).'
	);
	assert_true(
		! PixelgradeAssistant_CLI_Envelope::confirmed( array( 'format' => 'yaml' ), 'Proceed?' ),
		'Missing --yes under --format=yaml must not confirm (no prompt attempted).'
	);
	try {
		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt( array( 'format' => 'json' ), 'wp pixelgrade assist starter reset --yes' );
		assert_true( false, 'require_yes_or_halt() must halt when unconfirmed.' );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 1, $e->exit_code, 'Missing --yes halts 1.' );
		assert_same( false, WP_CLI::$printed_value['ok'], 'Missing --yes must be ok:false.' );
		assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'Missing --yes code.' );
	}

	// NOT exercised here: the --format=table branch of confirmed() (an interactive-style
	// WP_CLI::confirm() prompt, contract-permitted per v0.3.2) unconditionally writes to STDERR
	// and reads one line from STDIN — driving that path here would make this file block on STDIN
	// whenever `composer test` runs from an interactive terminal. Verified by code inspection
	// instead (class-pixelgrade_assistant-cli-envelope.php, confirmed()): the --format check is
	// the function's first statement after the --yes check, so the json/yaml assertions above
	// prove the gate; the table branch is the same function with that condition false, differing
	// only in that its prompt goes to STDERR (never STDOUT, per H2/security LOW-1) instead of
	// being skipped.

	echo "Envelope contract OK\n";

	// =========================================================================================
	// `starter list`
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_remote_config_result'] = false; // hub fetch failed, no fresh AND no stale fallback.
	$cmd = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'list_starters' ), array(), array( 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter list: hub fetch failure must exit 1.' );
	assert_same( 'hub_fetch_failed', WP_CLI::$printed_value['code'], 'starter list: hub fetch failure code.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter list: hub fetch failure ok:false.' );
	assert_same( true, WP_CLI::$printed_value['retryable'], 'starter list: hub fetch failure must be retryable.' );

	paf_reset_runtime();
	$GLOBALS['paf_remote_config_result'] = array( 'starterContent' => array( 'demos' => array() ) );
	$GLOBALS['paf_admin_hub_starters']   = array(
		array( 'id' => 'anima-restaurant', 'title' => 'Rosa LT' ),
		array( 'id' => 'anima-portfolio', 'title' => 'Mies LT' ),
	);
	$cmd = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'list_starters' ), array(), array( 'format' => 'json' ) );
	assert_same( 0, $exit, 'starter list: success exits 0.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter list: success ok:true.' );
	assert_same( 2, count( WP_CLI::$printed_value['data']['starters'] ), 'starter list: data.starters round-trips the hub starters.' );

	echo "starter list contract OK\n";

	// =========================================================================================
	// `starter import`
	// =========================================================================================

	paf_reset_runtime();
	$cmd = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array(), array( 'format' => 'json', 'yes' => true ) );
	assert_same( 1, $exit, 'starter import: missing demo-key/--url must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'starter import: invalid_params code.' );

	paf_reset_runtime();
	$cmd = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'anima-restaurant' ), array( 'source-url' => 'https://x.test/', 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: missing --yes must exit 1.' );
	assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'starter import: missing --yes code.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->import_starter_result = array(
		'code'    => 'success',
		'message' => 'Starter content imported.',
		'data'    => array( 'summary' => array( 'media' => 3 ) ),
	);
	$GLOBALS['paf_starter_content']->import_starter_journal = array(
		'anima-restaurant' => array( 'post_types' => array( 'page' => array( 5 => 5 ) ) ),
	);
	$GLOBALS['paf_active_starter'] = 'anima-restaurant';
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'anima-restaurant' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 0, $exit, 'starter import: success exits 0.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter import: success ok:true.' );
	assert_same( 'anima-restaurant', WP_CLI::$printed_value['data']['activeStarter'], 'starter import: data.activeStarter is re-read post-import.' );
	assert_true( isset( WP_CLI::$printed_value['data']['importedStarterContent']['anima-restaurant'] ), 'starter import: data.importedStarterContent is re-read post-import.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->import_starter_result = array(
		'code'    => 'invalid_source',
		'message' => 'The starter content source is not allowed.',
		'data'    => array(),
	);
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://evil.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: invalid_source must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter import: invalid_source ok:false.' );
	assert_same( 'invalid_source', WP_CLI::$printed_value['code'], 'starter import: invalid_source code round-trips.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->import_starter_result = array(
		'code'    => 'missing_required_plugins',
		'message' => 'This starter needs these plugins installed and active first: Nova Blocks.',
		'data'    => array( 'requiredPlugins' => array( array( 'slug' => 'nova-blocks', 'name' => 'Nova Blocks' ) ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'starter import: missing_required_plugins must exit 2.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter import: missing_required_plugins ok:true.' );
	assert_same( 1, count( WP_CLI::$printed_value['warnings'] ), 'starter import: missing_required_plugins must surface a warning.' );

	paf_reset_runtime();
	// A mid-import WP_Error with the journal for this demo grown -> partial (exit 2).
	$GLOBALS['paf_starter_content']->import_starter_result = array(
		'code'    => 'missing_tax',
		'message' => 'A required taxonomy could not be imported.',
		'data'    => array(),
	);
	$GLOBALS['paf_starter_content']->import_starter_journal = array(
		'x' => array( 'media' => array( 1 => 1 ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'starter import: a mid-import failure that wrote journal content must exit 2 (partial).' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter import: partial must be ok:true.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'starter import: partial code.' );

	paf_reset_runtime();
	// A WP_Error with nothing written to the journal at all -> total failure (exit 1).
	$GLOBALS['paf_starter_content']->import_starter_result = array(
		'code'    => 'starter_data_missing',
		'message' => 'The starter source did not provide import data.',
		'data'    => array(),
	);
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: a failure that wrote nothing must exit 1 (total failure).' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter import: total failure ok:false.' );
	assert_same( 'starter_data_missing', WP_CLI::$printed_value['code'], 'starter import: total failure code round-trips.' );

	paf_reset_runtime();
	// H1: import_starter() is @return array|WP_REST_Response — a mid-run sub-step failure
	// (import_settings()/import_taxonomy()/import_post_type()/import_parsed_widgets()) can return
	// a WP_REST_Response, which has no ArrayAccess. The CLI must unwrap it (get_data()) so the
	// real code/message reach the envelope instead of degrading to unknown_error/''. Partial case
	// (journal grew):
	$GLOBALS['paf_starter_content']->import_starter_result = new WP_REST_Response( array(
		'code'    => 'missing_tax',
		'message' => 'A required taxonomy could not be imported.',
		'data'    => array(),
	) );
	$GLOBALS['paf_starter_content']->import_starter_journal = array(
		'x' => array( 'media' => array( 1 => 1 ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'starter import: a WP_REST_Response mid-run failure must still exit 2 (partial) once unwrapped.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter import: WP_REST_Response partial must be ok:true.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'starter import: WP_REST_Response partial code.' );
	assert_same( 'missing_tax', WP_CLI::$printed_value['warnings'][0]['code'], 'starter import: WP_REST_Response must be unwrapped — real producer code must reach warnings[0].code, not lost to unknown_error.' );
	assert_same( 'A required taxonomy could not be imported.', WP_CLI::$printed_value['warnings'][0]['message'], 'starter import: WP_REST_Response must be unwrapped — real message must reach warnings[0].message, not empty.' );

	paf_reset_runtime();
	// H1, total-failure case (nothing journaled): the real code/message must round-trip to the
	// top-level envelope fields, not degrade to unknown_error/''.
	$GLOBALS['paf_starter_content']->import_starter_result = new WP_REST_Response( array(
		'code'    => 'starter_data_missing',
		'message' => 'The starter source did not provide import data.',
		'data'    => array(),
	) );
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: a WP_REST_Response total failure must exit 1 once unwrapped.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter import: WP_REST_Response total failure ok:false.' );
	assert_same( 'starter_data_missing', WP_CLI::$printed_value['code'], 'starter import: WP_REST_Response must be unwrapped — real code must round-trip, not unknown_error.' );
	assert_same( 'The starter source did not provide import data.', WP_CLI::$printed_value['summary'], 'starter import: WP_REST_Response must be unwrapped — real message must reach summary, not empty.' );

	paf_reset_runtime();
	// Security LOW-2: --source-url must be https://.
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'source-url' => 'http://insecure.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: a non-https --source-url must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter import: non-https --source-url ok:false.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'starter import: non-https --source-url code.' );

	echo "starter import contract OK\n";

	// =========================================================================================
	// `starter reset`
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->reset_summary = array( 'posts_deleted' => 4, 'posts_missing' => 0 );
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'reset' ), array(), array( 'yes' => true, 'format' => 'json' ) );
	assert_same( 0, $exit, 'starter reset: clean reset exits 0.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter reset: clean reset ok:true.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->reset_summary = array( 'posts_deleted' => 3, 'posts_missing' => 2 );
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'reset' ), array(), array( 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'starter reset: posts_missing > 0 must exit 2.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'starter reset: partial reset ok:true.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'starter reset: partial code.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Starter_Command();
	$exit = paf_run( array( $cmd, 'reset' ), array(), array( 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter reset: missing --yes must exit 1.' );
	assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'starter reset: missing --yes code.' );

	echo "starter reset contract OK\n";

	// =========================================================================================
	// `recipe list`
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->list_recipes_result = array(
		'code'    => 'success',
		'message' => '',
		'data'    => array(
			'recipes'  => array( array( 'id' => 'anima-restaurant' ), array( 'id' => 'anima-portfolio' ) ),
			'failures' => array(),
			'applied'  => array(),
		),
	);
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'list_recipes' ), array(), array( 'format' => 'json' ) );
	assert_same( 0, $exit, 'recipe list: success exits 0.' );
	assert_same( array(), $GLOBALS['paf_starter_content']->list_recipes_sources_seen, 'recipe list: no --source must pass an empty sources array through.' );

	paf_reset_runtime();
	$GLOBALS['paf_layout_units_sources'] = array(
		array( 'id' => 'anima-restaurant', 'baseRestUrl' => 'https://a.test/' ),
		array( 'id' => 'anima-portfolio', 'baseRestUrl' => 'https://b.test/' ),
		array( 'id' => 'felt-lt', 'baseRestUrl' => 'https://c.test/' ),
	);
	$GLOBALS['paf_starter_content']->list_recipes_result = array(
		'code' => 'success', 'message' => '',
		'data' => array( 'recipes' => array(), 'failures' => array( array( 'id' => 'felt-lt', 'code' => 'missing_tax', 'message' => 'boom' ) ), 'applied' => array() ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'list_recipes' ), array(), array( 'source' => 'anima-restaurant,felt-lt', 'format' => 'json' ) );
	assert_same( 0, $exit, 'recipe list: exit code must stay 0 even with per-source failures (contract has no exit 2 for this command).' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'recipe list: ok:true even with failures.' );
	assert_same( 1, count( WP_CLI::$printed_value['warnings'] ), 'recipe list: failures must surface as warnings.' );
	$seen_ids = array_column( $GLOBALS['paf_starter_content']->list_recipes_sources_seen, 'id' );
	sort( $seen_ids );
	assert_same( array( 'anima-restaurant', 'felt-lt' ), $seen_ids, 'recipe list: --source must filter the sources passed to list_recipes().' );

	echo "recipe list contract OK\n";

	// =========================================================================================
	// `recipe apply`
	// =========================================================================================

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array(), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: missing recipe-id must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'recipe apply: invalid_params code.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'anima-restaurant' ), array( 'source-url' => 'https://x.test/', 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: missing --yes must exit 1.' );
	assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'recipe apply: missing --yes code.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( array(), array( 'header' => array( 'type' => 'header' ) ) );
	$GLOBALS['paf_starter_content']->applied_content_units         = array( 'page:index' => array( 'type' => 'page' ) );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array(
		'code' => 'success', 'message' => 'Recipe applied.', 'data' => array( 'recipe' => array( 'id' => 'anima-restaurant' ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'anima-restaurant' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 0, $exit, 'recipe apply: success exits 0.' );
	assert_true( isset( WP_CLI::$printed_value['data']['appliedLayoutUnits']['header'] ), 'recipe apply: data.appliedLayoutUnits is re-read post-apply.' );
	assert_true( isset( WP_CLI::$printed_value['data']['appliedContentUnits']['page:index'] ), 'recipe apply: data.appliedContentUnits is re-read post-apply.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'recipe_empty', 'message' => 'Empty recipe.', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: recipe_empty must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: recipe_empty ok:false.' );

	paf_reset_runtime();
	// apply_recipe() rolled back cleanly (before == after) -> exit 1, not 2.
	$same_units = array( 'header' => array( 'type' => 'header' ) );
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( $same_units, $same_units );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'missing_tax', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: a clean rollback (units unchanged) must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: clean rollback ok:false.' );
	assert_same( 'missing_tax', WP_CLI::$printed_value['code'], 'recipe apply: clean rollback code round-trips.' );

	paf_reset_runtime();
	// apply_recipe() left partial state behind (before != after) -> exit 2, partial.
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( array(), array( 'header' => array( 'type' => 'header' ) ) );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'missing_tax', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'recipe apply: leftover applied units after a failure must exit 2 (partial).' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'recipe apply: partial ok:true.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'recipe apply: partial code.' );

	paf_reset_runtime();
	// H1 defensive twin: apply_recipe()'s error paths are array-only today, but the CLI unwraps a
	// WP_REST_Response defensively too (cheap insurance against the same degradation).
	$rollback_units = array( 'header' => array( 'type' => 'header' ) );
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( $rollback_units, $rollback_units );
	$GLOBALS['paf_starter_content']->apply_recipe_result = new WP_REST_Response( array(
		'code' => 'missing_tax', 'message' => 'boom', 'data' => array(),
	) );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: a WP_REST_Response clean-rollback failure must exit 1 once unwrapped.' );
	assert_same( 'missing_tax', WP_CLI::$printed_value['code'], 'recipe apply: WP_REST_Response must be unwrapped — real code must round-trip, not unknown_error.' );

	paf_reset_runtime();
	// M2(a): --include-look failures (units rolled back to their pre-call state) must carry a
	// look_partially_applied warning, since import_recipe_look() runs after every unit already
	// succeeded and its own failure is not undone by the unit rollback.
	$look_same_units = array( 'header' => array( 'type' => 'header' ) );
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( $look_same_units, $look_same_units );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'layout_import_error', 'message' => 'Look import failed.', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'include-look' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: --include-look clean-rollback failure still exits 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: --include-look clean-rollback ok:false.' );
	assert_same( 1, count( WP_CLI::$printed_value['warnings'] ), 'recipe apply: --include-look failure must carry a look_partially_applied warning.' );
	assert_same( 'look_partially_applied', WP_CLI::$printed_value['warnings'][0]['code'], 'recipe apply: look_partially_applied warning code.' );

	// Control: the same shape of failure WITHOUT --include-look carries no such warning.
	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( $look_same_units, $look_same_units );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'missing_tax', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: clean-rollback failure without --include-look still exits 1.' );
	assert_same( 0, count( WP_CLI::$printed_value['warnings'] ), 'recipe apply: no look_partially_applied warning without --include-look.' );

	paf_reset_runtime();
	// Security LOW-2: --source-url must be https://.
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'source-url' => 'http://insecure.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: a non-https --source-url must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: non-https --source-url ok:false.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'recipe apply: non-https --source-url code.' );

	echo "recipe apply contract OK\n";

	// =========================================================================================
	// `pattern list`
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_content_patterns_sources'] = array(
		array( 'id' => 'content-library', 'baseRestUrl' => 'https://a.test/' ),
		array( 'id' => 'rosa-lt', 'baseRestUrl' => 'https://b.test/' ),
	);
	$GLOBALS['paf_starter_content']->list_content_units_result = array(
		'code' => 'success',
		'data' => array(
			'sources' => array(
				array( 'id' => 'content-library', 'code' => 'success', 'units' => array( array( 'slug' => 'about-design-studio' ) ) ),
				array( 'id' => 'rosa-lt', 'code' => 'success', 'units' => array( array( 'slug' => 'menu' ), array( 'slug' => 'contact' ) ) ),
			),
			'applied' => array(),
		),
	);
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run( array( $cmd, 'list_patterns' ), array(), array( 'format' => 'json' ) );
	assert_same( 0, $exit, 'pattern list: success exits 0.' );
	assert_same( 3, count( WP_CLI::$printed_value['data']['patterns'] ), 'pattern list: units from every source must be flattened into data.patterns.' );
	assert_same( 2, count( $GLOBALS['paf_starter_content']->list_content_units_sources_seen ), 'pattern list: no --source must pass every content source through.' );

	paf_reset_runtime();
	$GLOBALS['paf_content_patterns_sources'] = array(
		array( 'id' => 'content-library', 'baseRestUrl' => 'https://a.test/' ),
		array( 'id' => 'rosa-lt', 'baseRestUrl' => 'https://b.test/' ),
	);
	$GLOBALS['paf_starter_content']->list_content_units_result = array(
		'code' => 'success',
		'data' => array( 'sources' => array( array( 'id' => 'content-library', 'code' => 'success', 'units' => array() ) ), 'applied' => array() ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run( array( $cmd, 'list_patterns' ), array(), array( 'source' => 'content-library', 'format' => 'json' ) );
	assert_same( 0, $exit, 'pattern list: filtered listing exits 0.' );
	$seen_ids = array_column( $GLOBALS['paf_starter_content']->list_content_units_sources_seen, 'id' );
	assert_same( array( 'content-library' ), $seen_ids, 'pattern list: --source must filter the sources passed through.' );

	paf_reset_runtime();
	// A source that cannot be read must ride as a warning and never move the exit code — losing one
	// catalog must not hide the rest.
	$GLOBALS['paf_content_patterns_sources'] = array( array( 'id' => 'content-library', 'baseRestUrl' => 'https://a.test/' ) );
	$GLOBALS['paf_starter_content']->list_content_units_result = array(
		'code' => 'success',
		'data' => array(
			'sources' => array(
				array( 'id' => 'content-library', 'code' => 'source_unreachable', 'message' => 'boom', 'units' => array() ),
				array( 'id' => 'rosa-lt', 'code' => 'success', 'units' => array( array( 'slug' => 'menu' ) ) ),
			),
			'applied' => array(),
		),
	);
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run( array( $cmd, 'list_patterns' ), array(), array( 'format' => 'json' ) );
	assert_same( 0, $exit, 'pattern list: a failing source must not move the exit code.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'pattern list: ok:true even with a failing source.' );
	assert_same( 1, count( WP_CLI::$printed_value['warnings'] ), 'pattern list: a failing source must surface as a warning.' );
	assert_same( 'source_unreachable', WP_CLI::$printed_value['warnings'][0]['code'], 'pattern list: the producer code must round-trip into the warning.' );
	assert_same( 1, count( WP_CLI::$printed_value['data']['patterns'] ), 'pattern list: the healthy source\'s units must still be returned.' );

	echo "pattern list contract OK\n";

	// =========================================================================================
	// `pattern import`
	// =========================================================================================

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->import_content_unit_result = array(
		'code' => 'success', 'message' => 'Imported.', 'data' => array( 'unit' => 'about-design-studio' ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 0, $exit, 'pattern import: success exits 0.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'pattern import: success ok:true.' );
	assert_same( 'ok', WP_CLI::$printed_value['code'], 'pattern import: success code.' );
	assert_same(
		array( 'demo_key' => 'content-library', 'base_url' => 'https://a.test/', 'unit_type' => 'page', 'unit' => 'about-design-studio' ),
		$GLOBALS['paf_starter_content']->import_content_unit_args_seen,
		'pattern import: the four arguments must reach import_content_unit() unchanged, with unit_type defaulting to page.'
	);
	assert_true( array_key_exists( 'appliedContentUnits', WP_CLI::$printed_value['data'] ), 'pattern import: the mandatory post-import re-read must be in data.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: missing --yes must exit 1.' );
	assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'pattern import: missing --yes code.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'http://insecure.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: a non-https --source-url must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'pattern import: non-https --source-url code.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array(),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: a missing <slug> must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'pattern import: missing slug code.' );

	paf_reset_runtime();
	// Ordering: validation runs BEFORE the confirmation gate, so a malformed call says what is wrong
	// with it rather than asking to be confirmed (the same order the ability surface runs).
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array(),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: a missing <slug> without --yes must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'pattern import: a missing <slug> must be reported as invalid_params, not confirmation_required.' );

	paf_reset_runtime();
	// Enumerated flag: validated in-command, naming the value and the accepted set (contract §2).
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'unit-type' => 'bogus', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: an unsupported --unit-type must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'pattern import: unsupported --unit-type code.' );
	assert_same( array( 'page', 'post', 'portfolio', 'product' ), WP_CLI::$printed_value['data']['accepted'], 'pattern import: the refusal must name the accepted types.' );
	assert_same( null, $GLOBALS['paf_starter_content']->import_content_unit_args_seen, 'pattern import: an unsupported --unit-type must never reach the importer.' );

	// Refusals: nothing was written, so retrying unchanged cannot help — ok:false, exit 1.
	foreach ( array( 'invalid_source', 'unit_not_found', 'page_pattern_hidden', 'gated_segment_unavailable' ) as $refusal ) {
		paf_reset_runtime();
		$GLOBALS['paf_starter_content']->import_content_unit_result = array( 'code' => $refusal, 'message' => 'no', 'data' => array() );
		$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
		$exit = paf_run(
			array( $cmd, 'import' ),
			array( 'about-design-studio' ),
			array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
		);
		assert_same( 1, $exit, 'pattern import: ' . $refusal . ' must exit 1.' );
		assert_same( false, WP_CLI::$printed_value['ok'], 'pattern import: ' . $refusal . ' ok:false.' );
		assert_same( $refusal, WP_CLI::$printed_value['code'], 'pattern import: ' . $refusal . ' code round-trips.' );
	}

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->import_content_unit_result = array(
		'code' => 'missing_required_plugins', 'message' => 'install them', 'data' => array( 'requiredPlugins' => array( array( 'slug' => 'nova-blocks' ) ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 2, $exit, 'pattern import: missing_required_plugins must exit 2.' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'pattern import: missing_required_plugins ok:true.' );

	paf_reset_runtime();
	// The importer writes media and terms before the record, so a failure that changed the applied
	// set is a genuine partial — decided by reading back and diffing, never by trusting the producer.
	$GLOBALS['paf_starter_content']->applied_content_units_sequence = array(
		array(),
		array( 'page:about-design-studio' => array( 'slug' => 'about-design-studio' ) ),
	);
	$GLOBALS['paf_starter_content']->import_content_unit_result = array( 'code' => 'unit_import_failed', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 2, $exit, 'pattern import: leftover applied content after a failure must exit 2 (partial).' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'pattern import: partial code.' );
	assert_same( 'unit_import_failed', WP_CLI::$printed_value['warnings'][0]['code'], 'pattern import: the producer code must survive in the warning.' );

	paf_reset_runtime();
	// The importer sideloads media BEFORE it journals the record, so a failure after that point is a
	// partial even though no content unit was ever applied. Only the starter-content journal can see
	// it — which is why both journals are diffed.
	$GLOBALS['paf_starter_content']->applied_content_units = array();
	$GLOBALS['paf_starter_content']->import_content_unit_result = array( 'code' => 'unit_import_failed', 'message' => 'boom', 'data' => array() );
	$GLOBALS['paf_starter_content']->journal_after_import = array( 'content-library' => array( 'media' => array( 'ignored' => array( 11 => 42 ) ) ) );
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 2, $exit, 'pattern import: media sideloaded before a failure must exit 2 (partial), even with no unit journaled.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'pattern import: media-only partial code.' );

	paf_reset_runtime();
	// Same failure, nothing left behind -> a plain failure, not a partial.
	$unchanged = array( 'page:other' => array( 'slug' => 'other' ) );
	$GLOBALS['paf_starter_content']->applied_content_units_sequence = array( $unchanged, $unchanged );
	$GLOBALS['paf_starter_content']->import_content_unit_result = array( 'code' => 'unit_import_failed', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: a failure that wrote nothing must exit 1.' );
	assert_same( 'unit_import_failed', WP_CLI::$printed_value['code'], 'pattern import: the producer code round-trips on a clean failure.' );

	paf_reset_runtime();
	// Defensive unwrap: a WP_REST_Response error must not degrade to unknown_error.
	$GLOBALS['paf_starter_content']->import_content_unit_result = new WP_REST_Response( array(
		'code' => 'unit_not_found', 'message' => 'gone', 'data' => array(),
	) );
	$cmd  = new PixelgradeAssistant_CLI_Pattern_Command();
	$exit = paf_run(
		array( $cmd, 'import' ),
		array( 'about-design-studio' ),
		array( 'demo-key' => 'content-library', 'source-url' => 'https://a.test/', 'yes' => true, 'format' => 'json' )
	);
	assert_same( 1, $exit, 'pattern import: an unwrapped WP_REST_Response failure exits 1.' );
	assert_same( 'unit_not_found', WP_CLI::$printed_value['code'], 'pattern import: WP_REST_Response must be unwrapped — real code must round-trip.' );

	echo "pattern import contract OK\n";

	echo "All wp pixelgrade assist CLI contract tests OK\n";
}
