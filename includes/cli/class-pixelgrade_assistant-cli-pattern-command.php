<?php
/**
 * `wp pixelgrade assist pattern …` — contract §1.3.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/cli
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_CLI_Pattern_Command {

	/**
	 * List the page patterns — complete page/post/project/product records — available to this site.
	 *
	 * A page pattern is ONE complete content record: applying it creates a whole new page, which is
	 * a different action from inserting blocks at a cursor (that is a block pattern, see
	 * `wp pixelgrade blocks patterns`) and from applying a whole site (`assist starter import`).
	 *
	 * ## OPTIONS
	 *
	 * [--source=<ids>]
	 * : Comma-separated source ids to restrict the list to. Defaults to every source that offers
	 * content records.
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
	 *     wp pixelgrade assist pattern list --format=json --user=admin
	 *     wp pixelgrade assist pattern list --source=content-library
	 *
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0, always. `data.patterns` is the flattened record list and `data.sources` the
	 *   per-source results. A source that could not be read is reported in `warnings[]`, each
	 *   `{code, message, ids}`, and never moves the exit code — losing one catalog must not hide
	 *   the rest.
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand list
	 */
	public function list_patterns( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		// The comma-separated flag is the CLI's own encoding; the ability takes a real array. Both
		// resolve through the same PixelgradeAssistant_Agent_Core::resolve_page_pattern_sources().
		$source_flag = \WP_CLI\Utils\get_flag_value( $assoc_args, 'source', '' );
		$ids         = ( '' !== $source_flag && null !== $source_flag ) ? explode( ',', (string) $source_flag ) : array();

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::list_page_patterns( array( 'sources' => $ids ) ),
			$assoc_args
		);
	}

	/**
	 * Import one page pattern into this site as a new content record.
	 *
	 * CAUTION: this creates content and media and is NOT idempotent in the ordinary sense — if the
	 * same pattern is already applied it is REMOVED first (its page and its sideloaded media are
	 * deleted) and then re-imported, so a failure mid-way can leave the previously applied copy
	 * gone. The imported page takes a non-colliding slug when the source slug is already taken.
	 *
	 * ## OPTIONS
	 *
	 * <slug>
	 * : The record's source slug (see `wp pixelgrade assist pattern list`).
	 *
	 * --demo-key=<demo-key>
	 * : The source's demo key (see `wp pixelgrade assist starter list`).
	 *
	 * --source-url=<base-url>
	 * : The source's SCE REST base URL. Must use `https://` — a plaintext `http://` source is
	 * rejected (`code:"invalid_params"`) because the fetched record is trusted at admin level once
	 * imported. Named `--source-url` and not `--url` because WP-CLI reserves `--url` as a global
	 * parameter and strips it before any command runs (contract §1.3).
	 *
	 * [--unit-type=<post-type>]
	 * : The record's post type. One of `page`, `post`, `portfolio`, `product` (the set the importer
	 * accepts, filterable through `pixassist_content_unit_post_types`). Defaults to `page`. An
	 * unsupported value is `invalid_params` naming the value and the accepted set — validated in the
	 * command, not as a synopsis enum, so the filtered set stays authoritative.
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
	 *     wp pixelgrade assist pattern import about-design-studio --demo-key=content-library --source-url=https://example.com/wp-json/sce/v2/ --yes --user=admin
	 *
	 * ## CODES
	 *
	 * `code` (contract §2 — never translated):
	 *
	 * * `ok` — exit 0. `data.appliedContentUnits` is the post-import re-read.
	 * * `invalid_params` — exit 1. Missing `<slug>`/`--demo-key`/`--source-url`, `--source-url` is
	 *   not `https://`, or `--unit-type` is not one of the accepted types (`data.accepted` lists
	 *   them). Every one of these is reported BEFORE the `--yes` gate.
	 * * `invalid_source` — exit 1. The source host is not on the allow-list.
	 * * `unit_not_found` — exit 1. No record with that slug at that source.
	 * * `page_pattern_hidden` — exit 1. The source has withdrawn the record from its catalog.
	 * * `gated_segment_unavailable` — exit 1. The record needs a capability this site does not have.
	 * * `confirmation_required` — exit 1. Missing `--yes` (contract §3.6).
	 * * `missing_required_plugins` — exit 2, `ok:true`. Nothing usable was imported until the
	 *   companion plugins in `data.requiredPlugins` are installed and active.
	 * * `partial` — exit 2, `ok:true`. The import failed after it had already written state (media
	 *   and terms are imported before the record). The producer code/message is in
	 *   `warnings[0].code`/`.message`.
	 * * *(any other producer code)* — exit 1, `ok:false`. Not a closed set; bubbled from the
	 *   importer.
	 * * `assistant_unavailable` — exit 1. Assistant's core modules are not loaded (defensive only).
	 * * `permission_denied` — exit 3.
	 *
	 * @subcommand import
	 */
	public function import( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		// Same shared seam as `starter import` / `recipe apply`: one https pin, one sanitization.
		$validated = PixelgradeAssistant_Agent_Core::validate_keyed_source(
			isset( $assoc_args['demo-key'] ) ? $assoc_args['demo-key'] : '',
			isset( $assoc_args['source-url'] ) ? $assoc_args['source-url'] : '',
			__( 'You need to provide --demo-key and --source-url.', '__plugin_txtd' ),
			__( '--source-url must use https://.', '__plugin_txtd' )
		);

		if ( isset( $validated['code'] ) ) {
			PixelgradeAssistant_CLI_Envelope::emit_result( $validated, $assoc_args );

			return;
		}

		$demo_key = $validated['key'];
		$base_url = $validated['source_url'];

		// Validate the record selector BEFORE the confirmation gate, so a malformed call reports what
		// is actually wrong with it instead of `confirmation_required` (agent-core's ordering rule).
		$selector = PixelgradeAssistant_Agent_Core::validate_page_pattern_selector(
			isset( $args[0] ) ? $args[0] : '',
			(string) \WP_CLI\Utils\get_flag_value( $assoc_args, 'unit-type', '' ),
			__( 'You need to provide the page pattern slug.', '__plugin_txtd' ),
			/* translators: 1: the given record type, 2: the accepted types. */
			__( '--unit-type must be one of %2$s; got "%1$s".', '__plugin_txtd' )
		);

		if ( isset( $selector['code'] ) ) {
			PixelgradeAssistant_CLI_Envelope::emit_result( $selector, $assoc_args );

			return;
		}

		$unit      = $selector['unit'];
		$unit_type = $selector['unit_type'];

		PixelgradeAssistant_CLI_Envelope::require_yes_or_halt(
			$assoc_args,
			sprintf(
				'wp pixelgrade assist pattern import %s --demo-key=%s --source-url=%s --yes',
				$unit,
				$demo_key,
				$base_url
			)
		);

		PixelgradeAssistant_CLI_Envelope::emit_result(
			PixelgradeAssistant_Agent_Core::import_page_pattern(
				array(
					'demo_key'   => $demo_key,
					'source_url' => $base_url,
					'unit_type'  => $unit_type,
					'unit'       => $unit,
				)
			),
			$assoc_args
		);
	}
}
