<?php
/**
 * `wp pixelgrade assist starter …` — contract §1.3.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/cli
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_CLI_Starter_Command {

	/**
	 * List the starter sites available from the Pixelgrade hub.
	 *
	 * ## OPTIONS
	 *
	 * [--refresh]
	 * : Bypass the cached hub config and fetch a fresh starter descriptor list.
	 *
	 * [--format=<format>]
	 * : Render output in a particular format.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 *   - yaml
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp pixelgrade assist starter list --format=json
	 *     wp pixelgrade assist starter list --refresh --user=admin
	 *
	 * @subcommand list
	 */
	public function list_starters( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		if ( ! class_exists( 'PixelgradeAssistant_Admin' ) || ! function_exists( 'pixassist_get_admin_hub_starters' ) ) {
			$this->halt_assistant_unavailable( $assoc_args );

			return;
		}

		$refresh = (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'refresh', false );

		// pixassist_get_admin_hub_starters() has no cache-bust parameter of its own; it reads
		// through PixelgradeAssistant_Admin::get_config() -> get_remote_config( false ), which
		// always prefers the (already fresh-or-stale) transient. Calling get_remote_config()
		// directly first — with $refresh forwarded as its own $skip_cache — both busts the cache
		// on --refresh AND is the one call whose return value can tell a genuine hub-fetch failure
		// (no fresh transient AND no stale fallback: `false`) apart from a legitimately empty
		// catalog. It warms the very same transient get_config() then reads, so no plugin file is
		// touched to get this: the CLI boundary composes two already-public calls.
		$remote_config = PixelgradeAssistant_Admin::get_remote_config( $refresh );

		if ( false === $remote_config ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'hub_fetch_failed',
				__( 'Could not reach the Pixelgrade hub to fetch starter descriptors.', '__plugin_txtd' ),
				array(),
				array(),
				1,
				array( 'retryable' => true ),
				$assoc_args
			);

			return;
		}

		$starters = pixassist_get_admin_hub_starters();

		PixelgradeAssistant_CLI_Envelope::emit(
			true,
			'ok',
			sprintf(
				/* translators: %d: number of starter sites. */
				_n( '%d starter site available.', '%d starter sites available.', count( $starters ), '__plugin_txtd' ),
				count( $starters )
			),
			array( 'starters' => $starters ),
			array(),
			0,
			array(),
			$assoc_args
		);
	}

	/**
	 * Import a starter site's full content into the current site.
	 *
	 * ## OPTIONS
	 *
	 * <demo-key>
	 * : The starter/demo key (see `wp pixelgrade assist starter list`).
	 *
	 * --url=<base-url>
	 * : The starter's source SCE REST base URL (its `baseRestUrl`).
	 *
	 * [--yes]
	 * : Confirm the import. Required outside an interactive TTY.
	 *
	 * [--format=<format>]
	 * : Render output in a particular format.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 *   - yaml
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp pixelgrade assist starter import anima-restaurant --url=https://demo.example.com/wp-json/sce/v2/ --yes --user=admin
	 *
	 * @subcommand import
	 */
	public function import( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		$demo_key = isset( $args[0] ) ? sanitize_key( $args[0] ) : '';
		$base_url = isset( $assoc_args['url'] ) ? esc_url_raw( $assoc_args['url'] ) : '';

		if ( '' === $demo_key || '' === $base_url ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'invalid_params',
				__( 'You need to provide a demo key and --url.', '__plugin_txtd' ),
				array(),
				array(),
				1,
				array(),
				$assoc_args
			);

			return;
		}

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt(
			$assoc_args,
			sprintf( 'wp pixelgrade assist starter import %s --url=%s --yes', $demo_key, $base_url )
		);

		$starter_content = $this->get_starter_content();
		if ( ! $starter_content ) {
			$this->halt_assistant_unavailable( $assoc_args );

			return;
		}

		$before_journal  = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		$before_snapshot = isset( $before_journal[ $demo_key ] ) ? $before_journal[ $demo_key ] : array();

		$result = $starter_content->import_starter( $demo_key, $base_url );

		$after_journal  = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		$after_snapshot = isset( $after_journal[ $demo_key ] ) ? $after_journal[ $demo_key ] : array();
		$active_starter = function_exists( 'pixassist_get_starter_sites_active_starter' ) ? pixassist_get_starter_sites_active_starter() : '';

		$code    = isset( $result['code'] ) ? (string) $result['code'] : 'unknown_error';
		$message = isset( $result['message'] ) ? (string) $result['message'] : '';
		$data    = ( isset( $result['data'] ) && is_array( $result['data'] ) ) ? $result['data'] : array();

		// Mandatory post-import re-read (contract §1.3), independent of the wrapped method's own
		// payload — a mid-import failure return carries no `imported`/`summary` key at all.
		$data['importedStarterContent'] = $after_journal;
		$data['activeStarter']          = $active_starter;

		if ( 'success' === $code ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				true,
				'ok',
				'' !== $message ? $message : __( 'Starter content imported.', '__plugin_txtd' ),
				$data,
				array(),
				0,
				array(),
				$assoc_args
			);

			return;
		}

		if ( in_array( $code, array( 'invalid_params', 'invalid_source' ), true ) ) {
			PixelgradeAssistant_CLI_Envelope::emit( false, $code, $message, $data, array(), 1, array(), $assoc_args );

			return;
		}

		if ( 'missing_required_plugins' === $code ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				true,
				$code,
				$message,
				$data,
				array(
					array(
						'code'    => $code,
						'message' => $message,
					),
				),
				2,
				array(),
				$assoc_args
			);

			return;
		}

		// Any other failure surfaced from a sub-step (a WP_Error mapped through
		// layout_unit_error_response()). import_starter() discards its own in-progress $summary on
		// that path, so partial vs. total failure is decided the way the contract's writes are
		// decided elsewhere (§3.5): read back and diff the journal this call actually touched.
		$wrote_something = ( $after_snapshot !== $before_snapshot ) && ! empty( $after_snapshot );

		if ( $wrote_something ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				true,
				'partial',
				$message,
				$data,
				array(
					array(
						'code'    => $code,
						'message' => $message,
					),
				),
				2,
				array(),
				$assoc_args
			);

			return;
		}

		PixelgradeAssistant_CLI_Envelope::emit( false, $code, $message, $data, array(), 1, array(), $assoc_args );
	}

	/**
	 * Reset (undo) all imported starter content on the current site.
	 *
	 * ## OPTIONS
	 *
	 * [--yes]
	 * : Confirm the reset. Required outside an interactive TTY.
	 *
	 * [--format=<format>]
	 * : Render output in a particular format.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 *   - yaml
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp pixelgrade assist starter reset --yes --user=admin
	 *
	 * @subcommand reset
	 */
	public function reset( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt( $assoc_args, 'wp pixelgrade assist starter reset --yes' );

		$starter_content = $this->get_starter_content();
		if ( ! $starter_content ) {
			$this->halt_assistant_unavailable( $assoc_args );

			return;
		}

		try {
			$summary = $starter_content->reset_starter_content();
		} catch ( \Throwable $e ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'reset_failed',
				$e->getMessage(),
				array(),
				array(),
				1,
				array(),
				$assoc_args
			);

			return;
		}

		$posts_missing = isset( $summary['posts_missing'] ) ? (int) $summary['posts_missing'] : 0;

		if ( $posts_missing > 0 ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				true,
				'partial',
				sprintf(
					/* translators: %d: number of journaled posts that could not be found for deletion. */
					__( 'Starter content reset, but %d journaled post(s) were already missing.', '__plugin_txtd' ),
					$posts_missing
				),
				$summary,
				array(
					array(
						'code'    => 'posts_missing',
						'message' => __( 'Some journaled posts were already missing and could not be deleted.', '__plugin_txtd' ),
					),
				),
				2,
				array(),
				$assoc_args
			);

			return;
		}

		PixelgradeAssistant_CLI_Envelope::emit(
			true,
			'ok',
			__( 'Starter content was reset.', '__plugin_txtd' ),
			$summary,
			array(),
			0,
			array(),
			$assoc_args
		);
	}

	/**
	 * Resolve the loaded PixelgradeAssistant_StarterContent instance.
	 *
	 * @return PixelgradeAssistant_StarterContent|null
	 */
	private function get_starter_content() {
		if ( ! function_exists( 'PixelgradeAssistant' ) ) {
			return null;
		}

		$plugin = PixelgradeAssistant();

		return isset( $plugin->starter_content ) ? $plugin->starter_content : null;
	}

	/**
	 * Halt with a consistent "core not loaded" envelope.
	 *
	 * @param array $assoc_args
	 */
	private function halt_assistant_unavailable( $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::emit(
			false,
			'assistant_unavailable',
			__( 'Pixelgrade Assistant core modules are not loaded.', '__plugin_txtd' ),
			array(),
			array(),
			1,
			array(),
			$assoc_args
		);
	}
}
