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
	 * --url=<base-url>
	 * : The recipe source's SCE REST base URL.
	 *
	 * [--include-look]
	 * : Also apply the source's design look (colors/fonts).
	 *
	 * [--include-sample]
	 * : Also import sample content for feature units.
	 *
	 * [--yes]
	 * : Confirm the apply. Required outside an interactive TTY.
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
	 *     wp pixelgrade assist recipe apply anima-restaurant --url=https://demo.example.com/wp-json/sce/v2/ --yes --user=admin
	 *
	 * @subcommand apply
	 */
	public function apply( $args, $assoc_args ) {
		PixelgradeAssistant_CLI_Envelope::require_capability( 'manage_options', $assoc_args );

		$recipe_id = isset( $args[0] ) ? sanitize_key( $args[0] ) : '';
		$base_url  = isset( $assoc_args['url'] ) ? esc_url_raw( $assoc_args['url'] ) : '';

		if ( '' === $recipe_id || '' === $base_url ) {
			PixelgradeAssistant_CLI_Envelope::emit(
				false,
				'invalid_params',
				__( 'You need to provide a recipe id and --url.', '__plugin_txtd' ),
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
			sprintf( 'wp pixelgrade assist recipe apply %s --url=%s --yes', $recipe_id, $base_url )
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

		PixelgradeAssistant_CLI_Envelope::emit( false, $code, $message, $data, array(), 1, array(), $assoc_args );
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
