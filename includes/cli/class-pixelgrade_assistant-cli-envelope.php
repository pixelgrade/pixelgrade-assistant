<?php
/**
 * Shared response envelope + house invariants for the `wp pixelgrade assist` CLI subtree.
 *
 * Implements the agentic-stack contract's §2 JSON envelope (ok/code/summary/data/warnings/
 * retryable), the §3.0 "resolve the user first, never auto-elevate" rule, and the §3.6 `--yes`
 * rule for destructive commands.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/cli
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_CLI_Envelope {

	/**
	 * Build, print, and halt on the contract §2 envelope.
	 *
	 * `ok` is bound to the exit code, not to the outcome: `ok:true` maps to exit 0 or 2 (the
	 * command's machinery completed; findings live in `code`/`warnings`), `ok:false` maps to exit
	 * 1 or 3. `code` and `stripped[].reason` (n/a here) are never translated; `summary` and
	 * `warnings[].message` are.
	 *
	 * @param bool     $ok         Whether the command's machinery completed.
	 * @param string   $code       Stable machine token (never translated).
	 * @param string   $summary    One translated human line.
	 * @param array    $data       Command payload.
	 * @param array    $warnings   Envelope warnings, each at least `{code, message}`.
	 * @param int|null $exit_code  0/1/2/3 per contract §2. Defaults to 0 (ok) / 1 (!ok).
	 * @param array    $extra      Optional extra top-level keys: retryable (bool), persisted,
	 *                             unchanged, stripped — only emitted when present in $extra.
	 * @param array    $assoc_args The command's assoc_args (read here only for --format).
	 */
	public static function emit( $ok, $code, $summary, $data = array(), $warnings = array(), $exit_code = null, $extra = array(), $assoc_args = array() ) {
		if ( null === $exit_code ) {
			$exit_code = $ok ? 0 : 1;
		}

		$envelope = array(
			'ok'       => (bool) $ok,
			'code'     => (string) $code,
			'summary'  => (string) $summary,
			// An empty PHP array json-encodes as `[]`; the contract's `data` is an object. Force
			// `{}` on the empty case so `--format=json` output always matches the pinned shape.
			'data'     => ( is_array( $data ) && empty( $data ) ) ? new stdClass() : $data,
			'warnings' => array_values( (array) $warnings ),
		);

		foreach ( array( 'persisted', 'unchanged', 'stripped', 'retryable' ) as $key ) {
			if ( array_key_exists( $key, $extra ) ) {
				$envelope[ $key ] = $extra[ $key ];
			}
		}

		$format = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( in_array( $format, array( 'json', 'yaml' ), true ) ) {
			// STDOUT under --format=json/yaml is ONLY the envelope (contract §2) — no success/
			// warning chatter mixed in, so `wp … --format=json | jq` always works.
			\WP_CLI::print_value( $envelope, array( 'format' => $format ) );
		} else {
			self::render_table( $envelope );
		}

		\WP_CLI::halt( $exit_code );
	}

	/**
	 * Human-readable rendering for the default `table` format: the same envelope fields printed
	 * as WP_CLI::success/warning/log lines, with the identical exit code (contract §2).
	 *
	 * @param array $envelope
	 */
	private static function render_table( $envelope ) {
		if ( $envelope['ok'] ) {
			\WP_CLI::success( $envelope['summary'] );
		} else {
			// WP_CLI::error() always exits 1 itself; halt() below is what actually sets the exit
			// code (which may be 1 or 3), so a plain warning line is used here instead.
			\WP_CLI::warning( $envelope['summary'] );
		}

		foreach ( $envelope['warnings'] as $warning ) {
			if ( is_array( $warning ) && isset( $warning['message'] ) ) {
				$message = $warning['message'];
			} elseif ( is_string( $warning ) ) {
				$message = $warning;
			} else {
				$message = wp_json_encode( $warning );
			}

			\WP_CLI::warning( $message );
		}

		$data = $envelope['data'];
		if ( $data instanceof stdClass ) {
			$data = array();
		}

		if ( ! empty( $data ) ) {
			\WP_CLI::log( (string) wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
		}

		if ( ! empty( $envelope['retryable'] ) ) {
			\WP_CLI::log( 'retryable: true' );
		}
	}

	/**
	 * Contract §3.0: resolve the current user's capability FIRST, before any other command work,
	 * and never auto-elevate. Halts with exit 3 and a summary naming the capability + `--user`
	 * hint when the (possibly absent) current user lacks it.
	 *
	 * @param string $capability Required WordPress capability.
	 * @param array  $assoc_args The command's assoc_args (for --format on the halt envelope).
	 */
	/**
	 * Print and halt on a result produced by {@see PixelgradeAssistant_Agent_Core}.
	 *
	 * The core returns the envelope as plain data so the abilities can return it verbatim; this is
	 * the CLI's half of that split — the only place that knows about formats, STDOUT and exit
	 * codes.
	 *
	 * @param array $result     A core result: ok/code/summary/data/warnings/exit/extra.
	 * @param array $assoc_args The command's assoc_args (read here only for --format).
	 */
	public static function emit_result( $result, $assoc_args = array() ) {
		self::emit(
			$result['ok'],
			$result['code'],
			$result['summary'],
			$result['data'],
			$result['warnings'],
			$result['exit'],
			isset( $result['extra'] ) ? $result['extra'] : array(),
			$assoc_args
		);
	}

	public static function require_capability( $capability, $assoc_args = array() ) {
		if ( function_exists( 'current_user_can' ) && current_user_can( $capability ) ) {
			return;
		}

		self::emit(
			false,
			'permission_denied',
			sprintf(
				/* translators: %s: the WordPress capability the command requires. */
				__( 'This command requires the "%s" capability. WP-CLI runs as no user unless you pass --user=<username> for one who has it.', '__plugin_txtd' ),
				$capability
			),
			array(),
			array(),
			3,
			array(),
			$assoc_args
		);
	}

	/**
	 * Contract §3.6 (W2 review H1, pinned in the FROZEN contract as of v0.3.2): whether a
	 * destructive command is confirmed. Confirmation is bound to the OUTPUT FORMAT, not to TTY
	 * detection:
	 *
	 * - `--format=json|yaml`: `--yes` is strictly required. A prompt would corrupt the machine
	 *   contract (STDOUT must stay envelope-only), so no prompt is ever attempted here — this
	 *   returns false immediately without touching STDIN/STDOUT.
	 * - `--format=table`: an interactive-style confirm is permitted. Its prompt goes to STDERR
	 *   (never STDOUT, so it can never land ahead of a JSON/YAML envelope if the caller re-runs
	 *   this in table mode inside a script) and reads one line from STDIN; a closed/non-
	 *   interactive STDIN yields an empty read (declined), never a block.
	 *
	 * @param array  $assoc_args      Command assoc_args.
	 * @param string $confirm_message Message shown at the table-mode STDERR prompt.
	 *
	 * @return bool
	 */
	public static function confirmed( $assoc_args, $confirm_message ) {
		if ( \WP_CLI\Utils\get_flag_value( $assoc_args, 'yes', false ) ) {
			return true;
		}

		$format = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( in_array( $format, array( 'json', 'yaml' ), true ) ) {
			return false;
		}

		fwrite( STDERR, $confirm_message . ' [y/N] ' );
		$answer = strtolower( trim( (string) fgets( STDIN ) ) );

		return in_array( $answer, array( 'y', 'yes' ), true );
	}

	/**
	 * Halt with the standard "missing --yes" envelope for a destructive command (contract §3.6):
	 * `--dry-run` never reaches this call (it never prompts and never requires --yes); every other
	 * destructive path does.
	 *
	 * @param array  $assoc_args      Command assoc_args.
	 * @param string $command_example The full command line to re-run with --yes, shown in the
	 *                                 summary.
	 */
	public static function require_yes_or_halt( $assoc_args, $command_example ) {
		if ( self::confirmed( $assoc_args, __( 'This is a destructive operation. Proceed?', '__plugin_txtd' ) ) ) {
			return;
		}

		self::emit(
			false,
			'confirmation_required',
			sprintf(
				/* translators: %s: the command line to re-run with --yes. */
				__( 'This is a destructive operation; pass --yes to confirm. Example: %s', '__plugin_txtd' ),
				$command_example
			),
			array(),
			array(),
			1,
			array(),
			$assoc_args
		);
	}
}
