<?php
/**
 * Pins the `wp pixelgrade assist` CLI subtree: the §2 envelope shape, the §2 exit-code mapping,
 * the §3.0 permission-first rule, and the §3.6 --yes rule, per
 * docs/plans/agentic-stack/CONTRACT.md (v0.3) §1.3.
 *
 * Standalone: run with `php tests/cli-assist-commands-test.php` (no WordPress, no real WP-CLI
 * needed — WP_CLI and the WP function surface the CLI code touches are stubbed below).
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

	function esc_url_raw( $url ) {
		return (string) $url;
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
			return $this->applied_content_units;
		}
	}

	$GLOBALS['paf_starter_content'] = new Fake_Starter_Content();

	function PixelgradeAssistant() {
		return (object) array( 'starter_content' => $GLOBALS['paf_starter_content'] );
	}

	// ---------------------------------------------------------------------------------------
	// Load the CLI classes under test.
	// ---------------------------------------------------------------------------------------

	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-envelope.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-starter-command.php';
	require_once __DIR__ . '/../includes/cli/class-pixelgrade_assistant-cli-recipe-command.php';

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
	// §3.6: --yes present -> confirmed, no halt.
	assert_true(
		PixelgradeAssistant_CLI_Envelope::confirmed( array( 'yes' => true ), 'Proceed?' ),
		'--yes must confirm.'
	);

	paf_reset_runtime();
	// §3.6: no --yes, non-TTY (the test harness's STDIN is never a TTY) -> not confirmed, and the
	// halt helper must halt 1 with ok:false, never proceed and never hang.
	assert_true(
		! PixelgradeAssistant_CLI_Envelope::confirmed( array(), 'Proceed?' ),
		'Missing --yes in a non-TTY context must not confirm.'
	);
	try {
		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt( array( 'format' => 'json' ), 'wp pixelgrade assist starter reset --yes' );
		assert_true( false, 'require_yes_or_halt() must halt when unconfirmed.' );
	} catch ( WP_CLI_Test_Halt_Exception $e ) {
		assert_same( 1, $e->exit_code, 'Missing --yes halts 1.' );
		assert_same( false, WP_CLI::$printed_value['ok'], 'Missing --yes must be ok:false.' );
		assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'Missing --yes code.' );
	}

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
	$exit = paf_run( array( $cmd, 'import' ), array( 'anima-restaurant' ), array( 'url' => 'https://x.test/', 'format' => 'json' ) );
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
	$exit = paf_run( array( $cmd, 'import' ), array( 'anima-restaurant' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
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
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'url' => 'https://evil.test/', 'yes' => true, 'format' => 'json' ) );
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
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
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
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
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
	$exit = paf_run( array( $cmd, 'import' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'starter import: a failure that wrote nothing must exit 1 (total failure).' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'starter import: total failure ok:false.' );
	assert_same( 'starter_data_missing', WP_CLI::$printed_value['code'], 'starter import: total failure code round-trips.' );

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
	$exit = paf_run( array( $cmd, 'apply' ), array(), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: missing recipe-id must exit 1.' );
	assert_same( 'invalid_params', WP_CLI::$printed_value['code'], 'recipe apply: invalid_params code.' );

	paf_reset_runtime();
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'anima-restaurant' ), array( 'url' => 'https://x.test/', 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: missing --yes must exit 1.' );
	assert_same( 'confirmation_required', WP_CLI::$printed_value['code'], 'recipe apply: missing --yes code.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( array(), array( 'header' => array( 'type' => 'header' ) ) );
	$GLOBALS['paf_starter_content']->applied_content_units         = array( 'page:index' => array( 'type' => 'page' ) );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array(
		'code' => 'success', 'message' => 'Recipe applied.', 'data' => array( 'recipe' => array( 'id' => 'anima-restaurant' ) ),
	);
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'anima-restaurant' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 0, $exit, 'recipe apply: success exits 0.' );
	assert_true( isset( WP_CLI::$printed_value['data']['appliedLayoutUnits']['header'] ), 'recipe apply: data.appliedLayoutUnits is re-read post-apply.' );
	assert_true( isset( WP_CLI::$printed_value['data']['appliedContentUnits']['page:index'] ), 'recipe apply: data.appliedContentUnits is re-read post-apply.' );

	paf_reset_runtime();
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'recipe_empty', 'message' => 'Empty recipe.', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: recipe_empty must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: recipe_empty ok:false.' );

	paf_reset_runtime();
	// apply_recipe() rolled back cleanly (before == after) -> exit 1, not 2.
	$same_units = array( 'header' => array( 'type' => 'header' ) );
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( $same_units, $same_units );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'missing_tax', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 1, $exit, 'recipe apply: a clean rollback (units unchanged) must exit 1.' );
	assert_same( false, WP_CLI::$printed_value['ok'], 'recipe apply: clean rollback ok:false.' );
	assert_same( 'missing_tax', WP_CLI::$printed_value['code'], 'recipe apply: clean rollback code round-trips.' );

	paf_reset_runtime();
	// apply_recipe() left partial state behind (before != after) -> exit 2, partial.
	$GLOBALS['paf_starter_content']->applied_layout_units_sequence = array( array(), array( 'header' => array( 'type' => 'header' ) ) );
	$GLOBALS['paf_starter_content']->apply_recipe_result = array( 'code' => 'missing_tax', 'message' => 'boom', 'data' => array() );
	$cmd  = new PixelgradeAssistant_CLI_Recipe_Command();
	$exit = paf_run( array( $cmd, 'apply' ), array( 'x' ), array( 'url' => 'https://x.test/', 'yes' => true, 'format' => 'json' ) );
	assert_same( 2, $exit, 'recipe apply: leftover applied units after a failure must exit 2 (partial).' );
	assert_same( true, WP_CLI::$printed_value['ok'], 'recipe apply: partial ok:true.' );
	assert_same( 'partial', WP_CLI::$printed_value['code'], 'recipe apply: partial code.' );

	echo "recipe apply contract OK\n";

	echo "All wp pixelgrade assist CLI contract tests OK\n";
}
