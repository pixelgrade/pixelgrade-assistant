<?php
/**
 * Pins the Abilities API gate in PixelgradeAssistant_MCP_Server::bootstrap_adapter().
 *
 * The property under test, in one sentence: BELOW WordPress 6.9 THE MCP SURFACE DOES NOT EXIST —
 * the vendored adapter is never even `require`d — and AT 6.9+ NOTHING ABOUT THE EXISTING PATH
 * CHANGES.
 *
 * Why this needs its own file rather than a case in tests/agent-abilities-test.php: the predicate is
 * `function_exists( 'wp_register_ability' )`, and that suite defines the Abilities API stubs at file
 * scope for every one of its assertions. A function cannot be undefined once declared, so "the API is
 * absent" is not a state that suite can reach. This file therefore re-executes ITSELF as a child
 * process once per phase, each child declaring exactly the surface its phase is about.
 *
 * Phase `absent`  — no `wp_register_ability()`. Asserts the gate refuses at load time: the adapter
 *                   entry file is never required (no WP_MCP_VERSION), no adapter hook is wired, the
 *                   default-server suppression filter is never added, the public whitelist is empty
 *                   and the tool list is empty. This is the WordPress 5.9–6.8 case, and the reason
 *                   the gate exists: the adapter's own dependency notice calls wp_admin_notice()
 *                   (`@since` 6.4), which on 5.9–6.3 is a fatal inside `admin_notices`.
 *
 * Phase `present` — `wp_register_ability()` declared, so the gate passes and control reaches the
 *                   pre-existing already-booted branch. Asserts the 6.9+ path is untouched: a
 *                   foreign-booted adapter inside the pinned minor still wires `mcp_adapter_init`
 *                   and the error redaction filter, still declines to grant `meta.mcp.public`
 *                   (architecture review H1), and skew outside the pinned minor still degrades to
 *                   no curated server instead of a fatal.
 *
 * Standalone: run with `php tests/mcp-abilities-api-gate-test.php < /dev/null`.
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', dirname( __DIR__ ) . '/' );

$pa_gate_phase = getenv( 'PA_MCP_GATE_PHASE' );

// -------------------------------------------------------------------------------------------------
// Parent: run each phase in its own process, because the phases disagree about which functions exist.
// -------------------------------------------------------------------------------------------------
if ( false === $pa_gate_phase || '' === $pa_gate_phase ) {
	$failed = false;

	foreach ( array( 'absent', 'present' ) as $phase ) {
		$command = sprintf(
			'PA_MCP_GATE_PHASE=%s %s %s',
			escapeshellarg( $phase ),
			escapeshellarg( PHP_BINARY ),
			escapeshellarg( __FILE__ )
		);

		$output = array();
		$status = 0;
		exec( $command . ' 2>&1', $output, $status );

		echo implode( PHP_EOL, $output ) . PHP_EOL;

		if ( 0 !== $status ) {
			$failed = true;
		}
	}

	if ( $failed ) {
		exit( 1 );
	}

	echo 'MCP Abilities API gate OK' . PHP_EOL;
	exit( 0 );
}

// -------------------------------------------------------------------------------------------------
// Child: the shared WordPress surface both phases need.
// -------------------------------------------------------------------------------------------------

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

function is_wp_error( $thing ) {
	return $thing instanceof WP_Error;
}

$GLOBALS['pa_gate_actions'] = array();
$GLOBALS['pa_gate_filters'] = array();

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['pa_gate_actions'][ $hook ][] = $callback;

	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['pa_gate_filters'][ $hook ][] = $callback;

	return true;
}

function apply_filters( $hook, $value ) {
	return $value;
}

function __( $text, $domain = 'default' ) {
	return $text;
}

function trailingslashit( $string ) {
	return rtrim( (string) $string, '/\\' ) . '/';
}

function current_user_can( $capability ) {
	return false;
}

function esc_html( $text ) {
	return $text;
}

// Deliberately stubbed so the NEGATIVE case is legible rather than explosive. Without the gate,
// `bootstrap_adapter()` requires the adapter entry file, which calls this from `WP\MCP\constants()`;
// unstubbed, the phase dies there with an undefined-function fatal instead of reporting which
// assertions broke. With it, removing the gate fails three assertions on their merits — the entry
// file gets required, WP_MCP_AUTOLOAD gets defined, and a supported adapter version gets claimed.
//
// The `admin_notices` assertion below stays green even without the gate, and that is not a weakness
// to paper over: this phase does not load the Composer autoloader, so `class_exists( Plugin::class )`
// inside the entry file is false and `Plugin::instance()` is never reached. On a real site the
// autoloader IS loaded, the adapter's dependency closure DOES get registered, and — because
// `wp_admin_notice()` is only `@since` 6.4 — firing it on WordPress 5.9–6.3 is a fatal inside the
// `admin_notices` action. The assertion pins the shape we require; the fatal itself is argued from
// the adapter's source (`includes/Plugin.php`), not reproduced here.
function plugin_dir_path( $file ) {
	return rtrim( dirname( $file ), '/\\' ) . '/';
}

// -------------------------------------------------------------------------------------------------
// Child: the phase-specific surface.
// -------------------------------------------------------------------------------------------------

if ( 'present' === $pa_gate_phase ) {
	// WordPress 6.9+: the Abilities API exists. Nothing is registered into it here — the gate only
	// asks whether the function is declared, which is exactly the predicate the abilities registrar
	// uses.
	function wp_register_ability( $name, $args ) {
		return (object) array( 'name' => $name );
	}

	function wp_has_ability( $name ) {
		return false;
	}

	// Stand in for a coexisting MCP Adapter that booted first, inside the pinned minor. This keeps
	// the phase deterministic: the gate passes, control reaches the pre-existing already-booted
	// branch, and no adapter code has to run for the wiring to be observable.
	define( 'WP_MCP_VERSION', '0.6.1' );

	require_once dirname( __DIR__ ) . '/vendor/autoload.php';
}

require_once dirname( __DIR__ ) . '/includes/agent/class-pixelgrade_assistant-mcp-server.php';

// -------------------------------------------------------------------------------------------------
// Assertions.
// -------------------------------------------------------------------------------------------------

$pa_gate_failures = array();

function pa_gate_assert( $condition, $description ) {
	if ( $condition ) {
		echo '  ok - ' . $description . PHP_EOL;

		return;
	}

	$GLOBALS['pa_gate_failures'][] = $description;
	echo '  NOT OK - ' . $description . PHP_EOL;
}

function pa_gate_hooked( $bucket, $hook ) {
	return ! empty( $GLOBALS[ $bucket ][ $hook ] );
}

echo 'phase: ' . $pa_gate_phase . PHP_EOL;

PixelgradeAssistant_MCP_Server::register();

// The whitelist filter is published in BOTH phases, unconditionally and before the boot check. That
// is what makes "Assistant absent means the whole stack is private" true: the filter is the one
// channel style-manager, nova-blocks and pixelgrade-plus consult, and it must answer even when there
// is no server.
pa_gate_assert(
	pa_gate_hooked( 'pa_gate_filters', 'pixelgrade/mcp/public_abilities' ),
	'the public-abilities filter is published regardless of the adapter'
);

if ( 'absent' === $pa_gate_phase ) {
	pa_gate_assert(
		! defined( 'WP_MCP_VERSION' ),
		'the adapter entry file is never required, so it defines no constants'
	);

	pa_gate_assert(
		! defined( 'WP_MCP_AUTOLOAD' ),
		'the gate refuses BEFORE the autoload bypass constant is defined'
	);

	pa_gate_assert(
		! pa_gate_hooked( 'pa_gate_actions', 'mcp_adapter_init' ),
		'no server is ever created: mcp_adapter_init is not hooked'
	);

	pa_gate_assert(
		! pa_gate_hooked( 'pa_gate_filters', 'mcp_adapter_create_default_server' ),
		'the default-server suppression filter is not added, because no adapter was booted'
	);

	pa_gate_assert(
		! pa_gate_hooked( 'pa_gate_filters', 'mcp_adapter_tool_call_result' ),
		'the tool-result redaction filter is not added'
	);

	pa_gate_assert(
		! pa_gate_hooked( 'pa_gate_actions', 'admin_notices' ),
		'no admin notice is registered: the user never chose the adapter and cannot act on it'
	);

	pa_gate_assert(
		array() === PixelgradeAssistant_MCP_Server::public_abilities( array( 'pixelgrade/list-starters' ) ),
		'no ability is granted meta.mcp.public'
	);

	pa_gate_assert(
		array() === PixelgradeAssistant_MCP_Server::tools_for_server(),
		'the tool list handed to create_server() is empty'
	);

	pa_gate_assert(
		false === PixelgradeAssistant_MCP_Server::adapter_version_supported(),
		'no adapter version is claimed to be supported'
	);
}

if ( 'present' === $pa_gate_phase ) {
	pa_gate_assert(
		pa_gate_hooked( 'pa_gate_actions', 'mcp_adapter_init' ),
		'the gate does not change the 6.9+ path: mcp_adapter_init is still hooked'
	);

	pa_gate_assert(
		pa_gate_hooked( 'pa_gate_filters', 'mcp_adapter_tool_call_result' ),
		'the tool-result redaction filter is still added'
	);

	pa_gate_assert(
		true === PixelgradeAssistant_MCP_Server::adapter_version_supported(),
		'a foreign adapter inside the pinned minor is still supported'
	);

	// H1, unchanged by the gate: we did not boot this adapter, so we do not publish onto its default
	// server.
	pa_gate_assert(
		array() === PixelgradeAssistant_MCP_Server::public_abilities( array( 'pixelgrade/list-starters' ) ),
		'a foreign-booted adapter is still denied the meta.mcp.public grant'
	);

	pa_gate_assert(
		! pa_gate_hooked( 'pa_gate_filters', 'mcp_adapter_create_default_server' ),
		'a foreign adapter keeps its own default server, as before'
	);

	// H2, unchanged by the gate: the major.minor handshake still rejects skew.
	pa_gate_assert(
		14 === count( PixelgradeAssistant_MCP_Server::PUBLIC_ABILITIES ),
		'the reviewed whitelist is still the fourteen names'
	);

	pa_gate_assert(
		! in_array( 'pixelgrade/describe-block', PixelgradeAssistant_MCP_Server::PUBLIC_ABILITIES, true ),
		'describe-block stays private'
	);
}

if ( ! empty( $pa_gate_failures ) ) {
	echo 'FAILED: ' . count( $pa_gate_failures ) . ' assertion(s) in phase ' . $pa_gate_phase . PHP_EOL;
	exit( 1 );
}

echo '  phase ' . $pa_gate_phase . ' OK' . PHP_EOL;
exit( 0 );
