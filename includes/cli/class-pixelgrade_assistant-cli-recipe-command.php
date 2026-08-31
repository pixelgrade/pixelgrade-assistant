<?php
/**
 * `wp pixelgrade assist recipe …` — contract §1.3.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/cli
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_CLI_Recipe_Command {

	/**
	 * List source-as-recipe presets backed by the available layout units.
	 *
	 * ## OPTIONS
	 *
	 * [--source=<ids>]
	 * : Comma-separated source ids to restrict the list to. Defaults to every hub source.
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
	 *     wp pixelgrade assist recipe list --format=json
	 *     wp pixelgrade assist recipe list --source=anima-restaurant,anima-portfolio
	 *
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0, always (this command has no exit-2 case; per-source build failures are
	 *   reported as `warnings[]`, each `{code, message, ids}`, without moving the exit code).
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand list
	 */
	public function list_recipes( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		$starter_content = $this->get_starter_content();
		if ( ! $starter_content ) {
			$this->halt_assistant_unavailable( $assoc_args );

			return;
		}

		$sources     = array();
		$source_flag = \WP_CLI\Utils\get_flag_value( $assoc_args, 'source', '' );

		if ( '' !== $source_flag && null !== $source_flag ) {
			$ids         = array_values( array_unique( array_filter( array_map( 'sanitize_key', explode( ',', (string) $source_flag ) ) ) ) );
			$all_sources = function_exists( 'pixassist_get_layout_units_sources' ) ? pixassist_get_layout_units_sources() : array();

			foreach ( $all_sources as $source ) {
				if ( ! empty( $source['id'] ) && in_array( $source['id'], $ids, true ) ) {
					$sources[] = $source;
				}
			}
		}

		$result = $starter_content->list_recipes( $sources );
		$data   = ( isset( $result['data'] ) && is_array( $result['data'] ) ) ? $result['data'] : array();

		$recipes  = ( isset( $data['recipes'] ) && is_array( $data['recipes'] ) ) ? $data['recipes'] : array();
		$failures = ( isset( $data['failures'] ) && is_array( $data['failures'] ) ) ? $data['failures'] : array();

		// Per-source build failures never move the exit code for `recipe list` (contract §1.3: 0 /
		// 1 / 3, no 2) — they are surfaced as warnings on an otherwise ok:true, exit-0 response.
		$warnings = array();
		foreach ( $failures as $failure ) {
			$warnings[] = array(
				'code'    => isset( $failure['code'] ) ? (string) $failure['code'] : 'recipe_source_failed',
				'message' => isset( $failure['message'] ) ? (string) $failure['message'] : '',
				'ids'     => isset( $failure['id'] ) ? array( (string) $failure['id'] ) : array(),
			);
		}

		PixelgradeAssistant_CLI_Envelope::emit(
			true,
			'ok',
			sprintf(
				/* translators: %d: number of recipes. */
				_n( '%d recipe available.', '%d recipes available.', count( $recipes ), '__plugin_txtd' ),
				count( $recipes )
			),
			$data,
			$warnings,
			0,
			array(),
			$assoc_args
		);
	}

	/**
	 * Apply a source recipe as one bundle of layout units.
	 *
	 * ## OPTIONS
	 *
	 * <recipe-id>
	 * : The recipe/source id (see `wp pixelgrade assist recipe list`).
	 *
	 * --source-url=<base-url>
	 * : The recipe source's SCE REST base URL. Must use `https://` — a plaintext `http://` source
	 * is rejected (`code:"invalid_params"`) so an operator-typed URL cannot accidentally downgrade
	 * to a scheme an on-path attacker could tamper with; the fetched content is trusted at admin
	 * level once applied.
	 *
	 * NOTE: the agentic-stack contract (§1.3) names this flag `--url`, but WP-CLI reserves
	 * `--url` as one of its own global parameters ("pretend request came from given URL") and
	 * strips it from every command's $assoc_args before the command ever runs — confirmed
	 * empirically: a value passed as `--url=…` never reaches this (or any) command. `--url` can
	 * therefore never work as a per-command flag under WP-CLI; `--source-url` is used here as the
	 * only usable name, flagged for a Gate-0 contract fix rather than silently shipping a flag
	 * that can never carry a value.
	 *
	 * [--include-look]
	 * : Also apply the source's design look (colors/fonts). CAUTION: the look step runs only after
	 * every layout unit has already applied; if it then fails, `apply_recipe()` rolls the units
	 * back but does not undo whatever design settings (theme mods / `sm_*` options) the look step
	 * had already written — the CLI cannot tell from the outside whether that happened, so a
	 * failure with `--include-look` set always carries a `warnings[]` entry warning that the site's
	 * design settings may have changed even when the overall result is `ok:false`.
	 *
	 * [--include-sample]
	 * : Also import sample content for feature units.
	 *
	 * [--yes]
	 * : Confirm the apply. Under --format=table an interactive STDERR prompt is offered in its
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
	 *     wp pixelgrade assist recipe apply anima-restaurant --source-url=https://demo.example.com/wp-json/sce/v2/ --yes --user=admin
	 *
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0.
	 * * `invalid_params` — exit 1. Missing `<recipe-id>`/`--source-url`, or `--source-url` is not
	 *   `https://`.
	 * * `recipe_empty` — exit 1. The resolved recipe has no layout units.
	 * * `confirmation_required` — exit 1. Missing `--yes` (contract §3.6).
	 * * `partial` — exit 2, `ok:true`. `get_applied_layout_units()` differs before vs. after the
	 *   call despite a failure — `apply_recipe()`'s own rollback did not fully restore the pre-call
	 *   state. The underlying producer code/message is in `warnings[0].code`/`.message`.
	 * * *(any other producer code)* — exit 1, `ok:false`. `apply_recipe()`'s rollback restored the
	 *   pre-call applied-units state (or nothing had applied yet); not a closed set — bubbled from
	 *   `import_layout_unit()`/`import_recipe_look()`. With `--include-look` set, this case also
	 *   carries a `warnings[]` entry (`code:"look_partially_applied"`) per the CAUTION above.
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand apply
	 */
	public function apply( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		$recipe_id = isset( $args[0] ) ? sanitize_key( $args[0] ) : '';
		$base_url  = isset( $assoc_args['source-url'] ) ? esc_url_raw( $assoc_args['source-url'] ) : '';

		if ( '' === $recipe_id || '' === $base_url ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'invalid_params',
				__( 'You need to provide a recipe id and --source-url.', '__plugin_txtd' ),
				array(),
				array(),
				1,
				array(),
				$assoc_args
			);

			return;
		}

		// Security hardening: pin the scheme so an operator-typed --source-url cannot
		// accidentally downgrade to cleartext (an on-path attacker could then substitute the
		// fetched recipe content, which apply_recipe() trusts at admin level).
		if ( 'https' !== wp_parse_url( $base_url, PHP_URL_SCHEME ) ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'invalid_params',
				__( '--source-url must use https://.', '__plugin_txtd' ),
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
			sprintf( 'wp pixelgrade assist recipe apply %s --source-url=%s --yes', $recipe_id, $base_url )
		);

		$starter_content = $this->get_starter_content();
		if ( ! $starter_content ) {
			$this->halt_assistant_unavailable( $assoc_args );

			return;
		}

		$options = array(
			'include_look'   => (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'include-look', false ),
			'include_sample' => (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'include-sample', false ),
		);

		$before_units = $starter_content->get_applied_layout_units();

		$result = $starter_content->apply_recipe( $recipe_id, $base_url, $options );

		// H1 defensive twin: apply_recipe()'s own error paths (import_layout_unit(),
		// layout_unit_error_response()) are array-only today, but unwrap defensively in case that
		// ever changes — cheap insurance against the same WP_REST_Response degradation as
		// `starter import`.
		if ( class_exists( 'WP_REST_Response' ) && $result instanceof WP_REST_Response ) {
			$result = $result->get_data();
		}

		$after_units         = $starter_content->get_applied_layout_units();
		$after_content_units = $starter_content->get_applied_content_units();

		$code    = isset( $result['code'] ) ? (string) $result['code'] : 'unknown_error';
		$message = isset( $result['message'] ) ? (string) $result['message'] : '';
		$data    = ( isset( $result['data'] ) && is_array( $result['data'] ) ) ? $result['data'] : array();

		// Mandatory post-apply re-read (contract §1.3).
		$data['appliedLayoutUnits']  = $after_units;
		$data['appliedContentUnits'] = $after_content_units;

		if ( 'success' === $code ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				true,
				'ok',
				'' !== $message ? $message : __( 'Recipe applied.', '__plugin_txtd' ),
				$data,
				array(),
				0,
				array(),
				$assoc_args
			);

			return;
		}

		if ( in_array( $code, array( 'invalid_params', 'recipe_empty' ), true ) ) {
			PixelgradeAssistant_CLI_Envelope::emit( false, $code, $message, $data, array(), 1, array(), $assoc_args );

			return;
		}

		// apply_recipe() rolls back applied units on a mid-bundle failure
		// (rollback_recipe_apply_units()) before returning, so a genuine partial only exists when
		// that rollback did not fully restore the pre-call state — detected the same
		// read-back-and-diff way as `starter import`.
		$partial = ( $after_units !== $before_units );

		if ( $partial ) {
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

		// M2(a): the units are back to (or still at) their pre-call state, but
		// import_recipe_look() runs only after every unit already succeeded — a look-step failure
		// rolls the units back while leaving whatever design settings it already wrote untouched.
		// The CLI cannot tell from here whether the failure happened before or during the look
		// step, so — conservatively — warn whenever --include-look was requested.
		$warnings = array();
		if ( ! empty( $options['include_look'] ) ) {
			$warnings[] = array(
				'code'    => 'look_partially_applied',
				'message' => __( 'This recipe requested --include-look. The failure may have happened after design settings (colors/fonts) were already written; they are not automatically reverted. Check the site\'s Style Manager settings before retrying.', '__plugin_txtd' ),
			);
		}

		PixelgradeAssistant_CLI_Envelope::emit( false, $code, $message, $data, $warnings, 1, array(), $assoc_args );
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
