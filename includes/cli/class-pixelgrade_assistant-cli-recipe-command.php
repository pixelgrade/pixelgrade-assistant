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

		// The comma-separated flag is the CLI's own encoding; the ability takes a real array. Both
		// resolve through the same PixelgradeAssistant_Agent_Core::resolve_recipe_sources().
		$source_flag = \WP_CLI\Utils\get_flag_value( $assoc_args, 'source', '' );
		$ids         = ( '' !== $source_flag && null !== $source_flag ) ? explode( ',', (string) $source_flag ) : array();

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::list_recipes( array( 'sources' => $ids ) ),
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

		// Same shared seam as `starter import`: one https pin, one sanitization, two wordings.
		$validated = PixelgradeAssistant_Agent_Core::validate_keyed_source(
			isset( $args[0] ) ? $args[0] : '',
			isset( $assoc_args['source-url'] ) ? $assoc_args['source-url'] : '',
			__( 'You need to provide a recipe id and --source-url.', '__plugin_txtd' ),
			__( '--source-url must use https://.', '__plugin_txtd' )
		);

		if ( isset( $validated['code'] ) ) {
			PixelgradeAssistant_CLI_Envelope::emit_result( $validated, $assoc_args );

			return;
		}

		$recipe_id = $validated['key'];
		$base_url  = $validated['source_url'];

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt(
			$assoc_args,
			sprintf( 'wp pixelgrade assist recipe apply %s --source-url=%s --yes', $recipe_id, $base_url )
		);

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::apply_recipe(
				array(
					'recipe_id'      => $recipe_id,
					'source_url'     => $base_url,
					'include_look'   => (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'include-look', false ),
					'include_sample' => (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'include-sample', false ),
				)
			),
			$assoc_args
		);
	}
}
