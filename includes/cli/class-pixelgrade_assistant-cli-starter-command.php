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
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0. `data.starters` is the normalized hub catalog.
	 * * `permission_denied` — exit 3. No resolved user, or the resolved user lacks
	 *   `manage_options`.
	 * * `hub_fetch_failed` — exit 1, `retryable:true`. `PixelgradeAssistant_Admin::get_remote_config()`
	 *   returned `false` with no fresh AND no stale cached hub config (includes the case where the
	 *   site has no theme hash id registered — that sub-case is not currently distinguished, so a
	 *   retry may not help; see the review notes in the slice report).
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (should not occur
	 *   in a normal WP-CLI run; defensive only).
	 *
	 * @subcommand list
	 */
	public function list_starters( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::list_starters(
				array( 'refresh' => (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'refresh', false ) )
			),
			$assoc_args
		);
	}

	/**
	 * Import a starter site's full content into the current site.
	 *
	 * CAUTION: as the very first step, before anything is journaled, this force-deletes an
	 * untouched default "Hello world!" post / "Sample Page" pair if present
	 * (`delete_default_wordpress_content_before_starter_import()`). If the import then fails on an
	 * early sub-step — before any content has been journaled for this demo key — the CLI reports
	 * `ok:false` (nothing journaled looks like "nothing was done"), but those two default posts can
	 * already be gone. This deletion is not tracked by `starter reset` and is not undoable from the
	 * CLI.
	 *
	 * ## OPTIONS
	 *
	 * <demo-key>
	 * : The starter/demo key (see `wp pixelgrade assist starter list`).
	 *
	 * --source-url=<base-url>
	 * : The starter's source SCE REST base URL (its `baseRestUrl`). Must use `https://` — a
	 * plaintext `http://` source is rejected (`code:"invalid_params"`) so an operator-typed URL
	 * cannot accidentally downgrade to a scheme an on-path attacker could tamper with; the fetched
	 * content is trusted at admin level once imported.
	 *
	 * NOTE: the agentic-stack contract (§1.3) names this flag `--url`, but WP-CLI reserves
	 * `--url` as one of its own global parameters ("pretend request came from given URL") and
	 * strips it from every command's $assoc_args before the command ever runs — confirmed
	 * empirically: a value passed as `--url=…` never reaches this (or any) command. `--url` can
	 * therefore never work as a per-command flag under WP-CLI; `--source-url` is used here as the
	 * only usable name, flagged for a Gate-0 contract fix rather than silently shipping a flag
	 * that can never carry a value.
	 *
	 * [--yes]
	 * : Confirm the import. Under --format=table an interactive STDERR prompt is offered in its
	 * place; under --format=json|yaml no prompt is ever shown and --yes is strictly required
	 * (contract §3.6).
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
	 *     wp pixelgrade assist starter import anima-restaurant --source-url=https://demo.example.com/wp-json/sce/v2/ --yes --user=admin
	 *
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0.
	 * * `invalid_params` — exit 1. Missing `<demo-key>`/`--source-url`, or `--source-url` is not
	 *   `https://`.
	 * * `invalid_source` — exit 1. `--source-url` host is not on the allowlist
	 *   (`is_allowed_demo_url()`).
	 * * `missing_required_plugins` — exit 2, `ok:true`. Also surfaced in `warnings[]`;
	 *   `data.requiredPlugins` names what's missing.
	 * * `confirmation_required` — exit 1. Missing `--yes` (contract §3.6).
	 * * `partial` — exit 2, `ok:true`. A mid-import sub-step failed AFTER something was journaled
	 *   for this demo key; the underlying producer code/message (e.g. `missing_tax`,
	 *   `invalid_taxonomy`, a Nova/Style-Manager save error) is in `warnings[0].code`/`.message`.
	 * * *(any other producer code)* — exit 1, `ok:false`. A sub-step failed before anything was
	 *   journaled for this demo key (e.g. `starter_data_missing`, or a bubbled `WP_Error` code from
	 *   `import_settings()`/`import_taxonomy()`/`import_post_type()`/`import_parsed_widgets()`).
	 *   This set is not closed — `import_starter()` forwards whatever `WP_Error::get_error_code()`
	 *   the failing sub-importer used.
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand import
	 */
	public function import( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		// Security hardening lives on the shared seam (PixelgradeAssistant_Agent_Core): the https
		// pin and the key/url sanitization are the same rule the `pixelgrade/import-starter`
		// ability enforces. Only the wording of the two summaries is CLI-specific.
		$validated = PixelgradeAssistant_Agent_Core::validate_keyed_source(
			isset( $args[0] ) ? $args[0] : '',
			isset( $assoc_args['source-url'] ) ? $assoc_args['source-url'] : '',
			__( 'You need to provide a demo key and --source-url.', '__plugin_txtd' ),
			__( '--source-url must use https://.', '__plugin_txtd' )
		);

		if ( isset( $validated['code'] ) ) {
			PixelgradeAssistant_CLI_Envelope::emit_result( $validated, $assoc_args );

			return;
		}

		$demo_key = $validated['key'];
		$base_url = $validated['source_url'];

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt(
			$assoc_args,
			sprintf( 'wp pixelgrade assist starter import %s --source-url=%s --yes', $demo_key, $base_url )
		);

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::import_starter(
				array(
					'demo_key'   => $demo_key,
					'source_url' => $base_url,
				)
			),
			$assoc_args
		);
	}

	/**
	 * Reset (undo) all imported starter content on the current site.
	 *
	 * ## OPTIONS
	 *
	 * [--yes]
	 * : Confirm the reset. Under --format=table an interactive STDERR prompt is offered in its
	 * place; under --format=json|yaml no prompt is ever shown and --yes is strictly required
	 * (contract §3.6).
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
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0. Nothing was journaled, or everything journaled was fully cleaned up.
	 * * `partial` — exit 2, `ok:true`. `data.posts_missing > 0` — some journaled posts were
	 *   already gone and could not be deleted; also surfaced as a `warnings[]` entry
	 *   (`code:"posts_missing"`).
	 * * `confirmation_required` — exit 1. Missing `--yes` (contract §3.6).
	 * * `reset_failed` — exit 1. An unexpected exception was thrown while resetting.
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand reset
	 */
	public function reset( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt( $assoc_args, 'wp pixelgrade assist starter reset --yes' );

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::reset_starter_content(),
			$assoc_args
		);
	}
}
