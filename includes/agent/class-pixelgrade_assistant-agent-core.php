<?php
/**
 * Shared command cores for the `assist` agent surface — one implementation, two callers.
 *
 * The `wp pixelgrade assist …` CLI subtree (contract §1.3) and the `pixelgrade/*` abilities
 * (contract §4) must produce the same result for the same input. The only way to guarantee that
 * is for both to run the SAME code, so the verb bodies live here and each surface is reduced to
 * what is genuinely its own: flag parsing, `--yes`/`confirm` gating, and output shaping.
 *
 * Every method returns the contract §2 envelope as plain data — never printing, never halting:
 *
 *     array(
 *         'ok'       => bool,   // bound to the exit code, not to the outcome
 *         'code'     => string, // stable machine token, never translated
 *         'summary'  => string, // one translated human line
 *         'data'     => array,  // the command's pinned data schema
 *         'warnings' => array,  // each at least {code, message}
 *         'exit'     => int,    // 0 / 1 / 2 / 3 per contract §2
 *         'extra'    => array,  // optional top-level keys (retryable, …)
 *     )
 *
 * Parameter validation is deliberately a SEPARATE public step from the work, because both
 * surfaces must run the two in the same order: validate first, then gate on confirmation, then
 * act. Folding validation into the work would make a call that is both unconfirmed and malformed
 * report `confirmation_required` on one surface and `invalid_params` on the other.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/agent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_Agent_Core {

	/**
	 * The capability floor for every `assist` verb — the same floor
	 * `permission_nonce_callback()` enforces before its nonce check (contract §1.3).
	 */
	const CAPABILITY = 'manage_options';

	/**
	 * Build one envelope-shaped result.
	 *
	 * @param bool   $ok
	 * @param string $code
	 * @param string $summary
	 * @param array  $data
	 * @param array  $warnings
	 * @param int    $exit
	 * @param array  $extra
	 *
	 * @return array
	 */
	public static function result( $ok, $code, $summary, $data = array(), $warnings = array(), $exit = 0, $extra = array() ) {
		return array(
			'ok'       => (bool) $ok,
			'code'     => (string) $code,
			'summary'  => (string) $summary,
			'data'     => (array) $data,
			'warnings' => array_values( (array) $warnings ),
			'exit'     => (int) $exit,
			'extra'    => (array) $extra,
		);
	}

	/**
	 * Resolve the loaded PixelgradeAssistant_StarterContent instance.
	 *
	 * @return PixelgradeAssistant_StarterContent|null
	 */
	public static function starter_content() {
		if ( ! function_exists( 'PixelgradeAssistant' ) ) {
			return null;
		}

		$plugin = PixelgradeAssistant();

		return isset( $plugin->starter_content ) ? $plugin->starter_content : null;
	}

	/**
	 * The consistent "core not loaded" result both surfaces emit.
	 *
	 * @return array
	 */
	public static function assistant_unavailable() {
		return self::result(
			false,
			'assistant_unavailable',
			__( 'Pixelgrade Assistant core modules are not loaded.', '__plugin_txtd' ),
			array(),
			array(),
			1
		);
	}

	/**
	 * Validate and normalize a `<key> --source-url` pair.
	 *
	 * The https pin is a security rule, not a convenience: the fetched starter/recipe payload is
	 * trusted at admin level once imported, so a cleartext source would let an on-path attacker
	 * substitute it. Both surfaces must apply it identically, which is why it lives here.
	 *
	 * The two messages are supplied by the caller because `summary` is human-facing prose and each
	 * surface names its own input ("--source-url" on the CLI, "source_url" in an ability's typed
	 * input). The RULE, the sanitization and the machine `code` are shared; only the wording is not.
	 *
	 * @param string $key             Raw demo/recipe key.
	 * @param string $source_url      Raw source base URL.
	 * @param string $missing_message Message for a missing key/url.
	 * @param string $scheme_message  Message for a non-https url.
	 *
	 * @return array `array( 'ok' => true, 'key' => …, 'source_url' => … )` or an envelope result.
	 */
	public static function validate_keyed_source( $key, $source_url, $missing_message, $scheme_message ) {
		$key        = ( '' !== (string) $key ) ? sanitize_key( (string) $key ) : '';
		$source_url = ( '' !== (string) $source_url ) ? esc_url_raw( (string) $source_url ) : '';

		if ( '' === $key || '' === $source_url ) {
			return self::result( false, 'invalid_params', $missing_message, array(), array(), 1 );
		}

		if ( 'https' !== wp_parse_url( $source_url, PHP_URL_SCHEME ) ) {
			return self::result( false, 'invalid_params', $scheme_message, array(), array(), 1 );
		}

		return array(
			'ok'         => true,
			'key'        => $key,
			'source_url' => $source_url,
		);
	}

	/**
	 * `assist starter list` / `pixelgrade/list-starters`.
	 *
	 * @param array $params `refresh` (bool).
	 *
	 * @return array
	 */
	public static function list_starters( $params = array() ) {
		if ( ! class_exists( 'PixelgradeAssistant_Admin' ) || ! function_exists( 'pixassist_get_admin_hub_starters' ) ) {
			return self::assistant_unavailable();
		}

		$refresh = ! empty( $params['refresh'] );

		// pixassist_get_admin_hub_starters() has no cache-bust parameter of its own; it reads
		// through PixelgradeAssistant_Admin::get_config() -> get_remote_config( false ), which
		// always prefers the (already fresh-or-stale) transient. Calling get_remote_config()
		// directly first — with $refresh forwarded as its own $skip_cache — both busts the cache
		// on --refresh AND is the one call whose return value can tell a genuine hub-fetch failure
		// (no fresh transient AND no stale fallback: `false`) apart from a legitimately empty
		// catalog. It warms the very same transient get_config() then reads.
		$remote_config = PixelgradeAssistant_Admin::get_remote_config( $refresh );

		if ( false === $remote_config ) {
			return self::result(
				false,
				'hub_fetch_failed',
				__( 'Could not reach the Pixelgrade hub to fetch starter descriptors.', '__plugin_txtd' ),
				array(),
				array(),
				1,
				array( 'retryable' => true )
			);
		}

		$starters = pixassist_get_admin_hub_starters();

		return self::result(
			true,
			'ok',
			sprintf(
				/* translators: %d: number of starter sites. */
				_n( '%d starter site available.', '%d starter sites available.', count( $starters ), '__plugin_txtd' ),
				count( $starters )
			),
			array( 'starters' => $starters ),
			array(),
			0
		);
	}

	/**
	 * `assist starter import` / `pixelgrade/import-starter`.
	 *
	 * Callers MUST have run {@see validate_keyed_source()} and their own confirmation gate first.
	 *
	 * @param array $params `demo_key`, `source_url` (both already validated).
	 *
	 * @return array
	 */
	public static function import_starter( $params ) {
		$demo_key = (string) $params['demo_key'];
		$base_url = (string) $params['source_url'];

		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		$before_journal  = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		$before_snapshot = isset( $before_journal[ $demo_key ] ) ? $before_journal[ $demo_key ] : array();

		$result = $starter_content->import_starter( $demo_key, $base_url );

		// import_starter() is documented/implemented as @return array|WP_REST_Response — a mid-run
		// sub-step failure can return a WP_REST_Response, which has no ArrayAccess. Unwrap it so
		// the real code/message reach the envelope instead of degrading to unknown_error/''.
		if ( class_exists( 'WP_REST_Response' ) && $result instanceof WP_REST_Response ) {
			$result = $result->get_data();
		}

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
			return self::result(
				true,
				'ok',
				'' !== $message ? $message : __( 'Starter content imported.', '__plugin_txtd' ),
				$data,
				array(),
				0
			);
		}

		// `not_a_starter` joins the refusals: a curated library is not a site, and the guard runs
		// before anything is touched, so the call provably wrote nothing.
		if ( in_array( $code, array( 'invalid_params', 'invalid_source', 'not_a_starter' ), true ) ) {
			return self::result( false, $code, $message, $data, array(), 1 );
		}

		if ( 'missing_required_plugins' === $code ) {
			return self::result(
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
				2
			);
		}

		// Any other failure surfaced from a sub-step. import_starter() discards its own in-progress
		// $summary on that path, so partial vs. total failure is decided the way the contract's
		// writes are decided elsewhere (§3.5): read back and diff the journal this call touched.
		$wrote_something = ( $after_snapshot !== $before_snapshot ) && ! empty( $after_snapshot );

		if ( $wrote_something ) {
			return self::result(
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
				2
			);
		}

		return self::result( false, $code, $message, $data, array(), 1 );
	}

	/**
	 * `assist starter reset` / `pixelgrade/reset-starter-content`.
	 *
	 * @return array
	 */
	public static function reset_starter_content() {
		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		try {
			$summary = $starter_content->reset_starter_content();
		} catch ( \Throwable $e ) {
			return self::result( false, 'reset_failed', $e->getMessage(), array(), array(), 1 );
		}

		$posts_missing = isset( $summary['posts_missing'] ) ? (int) $summary['posts_missing'] : 0;

		if ( $posts_missing > 0 ) {
			return self::result(
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
				2
			);
		}

		return self::result( true, 'ok', __( 'Starter content was reset.', '__plugin_txtd' ), $summary, array(), 0 );
	}

	/**
	 * Resolve a list of source ids to the Page Patterns source descriptors.
	 *
	 * Reads the same collector the hub section reads, so the LISTING agrees across every surface —
	 * `serves` is resolved in exactly one place. It is a catalog rule, not access control: importing
	 * addresses a source by key and url, and what gates that is `is_allowed_demo_url()`.
	 *
	 * @param array $ids Sanitized source ids. Empty means "every source that serves content".
	 *
	 * @return array
	 */
	public static function resolve_page_pattern_sources( $ids ) {
		$all_sources = function_exists( 'pixassist_get_content_patterns_sources' ) ? pixassist_get_content_patterns_sources() : array();

		$ids = array_values( array_unique( array_filter( array_map( 'sanitize_key', (array) $ids ) ) ) );
		if ( empty( $ids ) ) {
			return $all_sources;
		}

		$sources = array();
		foreach ( $all_sources as $source ) {
			if ( ! empty( $source['id'] ) && in_array( $source['id'], $ids, true ) ) {
				$sources[] = $source;
			}
		}

		return $sources;
	}

	/**
	 * `assist pattern list` / `pixelgrade/list-page-patterns`.
	 *
	 * A source that fails to answer never fails the call: it rides as a warning, the same way
	 * `recipe list` treats a source that will not build. Losing one catalog must not hide the rest.
	 *
	 * @param array $params `sources` (string[] of source ids).
	 *
	 * @return array
	 */
	public static function list_page_patterns( $params = array() ) {
		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		$sources = self::resolve_page_pattern_sources( isset( $params['sources'] ) ? $params['sources'] : array() );

		$result = $starter_content->list_content_units_for_sources( $sources );
		$data   = ( isset( $result['data'] ) && is_array( $result['data'] ) ) ? $result['data'] : array();

		$source_results = ( isset( $data['sources'] ) && is_array( $data['sources'] ) ) ? $data['sources'] : array();

		$units    = array();
		$warnings = array();
		foreach ( $source_results as $source_result ) {
			$code = isset( $source_result['code'] ) ? (string) $source_result['code'] : 'error';
			if ( 'success' !== $code ) {
				$warnings[] = array(
					'code'    => $code,
					'message' => isset( $source_result['message'] ) ? (string) $source_result['message'] : '',
					'ids'     => isset( $source_result['id'] ) ? array( (string) $source_result['id'] ) : array(),
				);
				continue;
			}

			$source_units = isset( $source_result['units'] ) ? (array) $source_result['units'] : array();
			foreach ( $source_units as $unit ) {
				$units[] = $unit;
			}
		}

		$data['patterns'] = $units;

		return self::result(
			true,
			'ok',
			sprintf(
				/* translators: %d: number of page patterns. */
				_n( '%d page pattern available.', '%d page patterns available.', count( $units ), '__plugin_txtd' ),
				count( $units )
			),
			$data,
			$warnings,
			0
		);
	}

	/**
	 * Validate the record selector for a page-pattern import.
	 *
	 * Separate and public for the same reason `validate_keyed_source()` is: both surfaces must run
	 * validation BEFORE their confirmation gate, or the same malformed call reports
	 * `confirmation_required` on one and `invalid_params` on the other.
	 *
	 * @param string $unit            Raw record slug.
	 * @param string $unit_type       Raw record post type ('' means the default).
	 * @param string $missing_message Message for a missing slug.
	 * @param string $type_message    Message template for an unsupported type; `%1$s` is the given
	 *                                type and `%2$s` the accepted list.
	 *
	 * @return array `array( 'ok' => true, 'unit' => …, 'unit_type' => … )` or an envelope result.
	 */
	public static function validate_page_pattern_selector( $unit, $unit_type, $missing_message, $type_message ) {
		$unit      = sanitize_text_field( (string) $unit );
		$unit_type = ( '' !== (string) $unit_type ) ? sanitize_key( (string) $unit_type ) : 'page';

		if ( '' === $unit ) {
			return self::result( false, 'invalid_params', $missing_message, array(), array(), 1 );
		}

		$allowed = self::page_pattern_types();
		if ( ! in_array( $unit_type, $allowed, true ) ) {
			return self::result(
				false,
				'invalid_params',
				sprintf( $type_message, $unit_type, implode( ', ', $allowed ) ),
				array( 'accepted' => $allowed ),
				array(),
				1
			);
		}

		return array(
			'ok'        => true,
			'unit'      => $unit,
			'unit_type' => $unit_type,
		);
	}

	/**
	 * The record types a page pattern may be.
	 *
	 * Mirrors the importer's own `pixassist_content_unit_post_types` filter so the CLI and the
	 * ability reject an unsupported type by name instead of letting it reach the importer and come
	 * back as the same generic message a missing key produces.
	 *
	 * @return string[]
	 */
	public static function page_pattern_types() {
		$types = apply_filters( 'pixassist_content_unit_post_types', array( 'page', 'post', 'portfolio', 'product' ) );

		return array_values( array_unique( array_filter( array_map( 'sanitize_key', (array) $types ) ) ) );
	}

	/**
	 * `assist pattern import` / `pixelgrade/import-page-pattern`.
	 *
	 * Callers MUST have run {@see validate_keyed_source()} and their own confirmation gate first.
	 *
	 * @param array $params `demo_key`, `source_url` (both already validated), `unit_type`, `unit`.
	 *
	 * @return array
	 */
	public static function import_page_pattern( $params ) {
		$demo_key  = (string) $params['demo_key'];
		$base_url  = (string) $params['source_url'];
		$unit_type = sanitize_key( isset( $params['unit_type'] ) ? (string) $params['unit_type'] : 'page' );
		$unit      = sanitize_text_field( isset( $params['unit'] ) ? (string) $params['unit'] : '' );

		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		// Read back BOTH journals. The applied-content-unit map is written only by the last statement
		// of a successful import, so on its own it cannot see the media and terms the importer
		// sideloads first — and those are real, user-visible state. The starter-content journal is
		// where sideloaded media is recorded, so diffing the pair is what makes `partial` mean what
		// the docs promise.
		$before_units   = $starter_content->get_applied_content_units();
		$before_journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );

		$result = $starter_content->import_content_unit( $demo_key, $base_url, $unit_type, $unit );

		// import_content_unit() is @return array|WP_REST_Response; unwrap so the real code reaches
		// the envelope instead of degrading to unknown_error.
		if ( class_exists( 'WP_REST_Response' ) && $result instanceof WP_REST_Response ) {
			$result = $result->get_data();
		}

		$after_units   = $starter_content->get_applied_content_units();
		$after_journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );

		$code    = isset( $result['code'] ) ? (string) $result['code'] : 'unknown_error';
		$message = isset( $result['message'] ) ? (string) $result['message'] : '';
		$data    = ( isset( $result['data'] ) && is_array( $result['data'] ) ) ? $result['data'] : array();

		// Mandatory post-import re-read (contract §1.3).
		$data['appliedContentUnits'] = $after_units;

		if ( 'success' === $code ) {
			return self::result(
				true,
				'ok',
				'' !== $message ? $message : __( 'Page pattern imported.', '__plugin_txtd' ),
				$data,
				array(),
				0
			);
		}

		// Refusals: the call did nothing and retrying it unchanged will do nothing either.
		$refusals = array(
			'invalid_params',
			'invalid_source',
			'unit_not_found',
			'page_pattern_hidden',
			'gated_segment_unavailable',
		);
		if ( in_array( $code, $refusals, true ) ) {
			return self::result( false, $code, $message, $data, array(), 1 );
		}

		if ( 'missing_required_plugins' === $code ) {
			return self::result(
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
				2
			);
		}

		// Anything else failed mid-import. Decide partial vs. total the way every other write in the
		// contract decides it (§3.5): read back and diff what this call could have touched. The
		// importer sideloads media and terms before the record, so a failure after that point leaves
		// real state behind even when no content unit was journaled — which is why the journal is
		// diffed too, and not just the applied-unit map.
		if ( $after_units !== $before_units || $after_journal !== $before_journal ) {
			return self::result(
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
				2
			);
		}

		return self::result( false, $code, $message, $data, array(), 1 );
	}

	/**
	 * Resolve a list of source ids to the hub source descriptors `list_recipes()` expects.
	 *
	 * @param array $ids Sanitized source ids. Empty means "every hub source".
	 *
	 * @return array
	 */
	public static function resolve_recipe_sources( $ids ) {
		$ids = array_values( array_unique( array_filter( array_map( 'sanitize_key', (array) $ids ) ) ) );

		if ( empty( $ids ) ) {
			return array();
		}

		$sources     = array();
		$all_sources = function_exists( 'pixassist_get_layout_units_sources' ) ? pixassist_get_layout_units_sources() : array();

		foreach ( $all_sources as $source ) {
			if ( ! empty( $source['id'] ) && in_array( $source['id'], $ids, true ) ) {
				$sources[] = $source;
			}
		}

		return $sources;
	}

	/**
	 * `assist recipe list` / `pixelgrade/list-recipes`.
	 *
	 * @param array $params `sources` (string[] of source ids).
	 *
	 * @return array
	 */
	public static function list_recipes( $params = array() ) {
		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		$sources = self::resolve_recipe_sources( isset( $params['sources'] ) ? $params['sources'] : array() );

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

		return self::result(
			true,
			'ok',
			sprintf(
				/* translators: %d: number of recipes. */
				_n( '%d recipe available.', '%d recipes available.', count( $recipes ), '__plugin_txtd' ),
				count( $recipes )
			),
			$data,
			$warnings,
			0
		);
	}

	/**
	 * `assist recipe apply` / `pixelgrade/apply-recipe`.
	 *
	 * Callers MUST have run {@see validate_keyed_source()} and their own confirmation gate first.
	 *
	 * @param array $params `recipe_id`, `source_url` (both already validated), `include_look`,
	 *                      `include_sample`.
	 *
	 * @return array
	 */
	public static function apply_recipe( $params ) {
		$recipe_id = (string) $params['recipe_id'];
		$base_url  = (string) $params['source_url'];

		$starter_content = self::starter_content();
		if ( ! $starter_content ) {
			return self::assistant_unavailable();
		}

		$options = array(
			'include_look'   => ! empty( $params['include_look'] ),
			'include_sample' => ! empty( $params['include_sample'] ),
		);

		$before_units = $starter_content->get_applied_layout_units();

		$result = $starter_content->apply_recipe( $recipe_id, $base_url, $options );

		// Defensive twin of the import unwrap: apply_recipe()'s own error paths are array-only
		// today, but unwrap in case that ever changes.
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
			return self::result(
				true,
				'ok',
				'' !== $message ? $message : __( 'Recipe applied.', '__plugin_txtd' ),
				$data,
				array(),
				0
			);
		}

		if ( in_array( $code, array( 'invalid_params', 'recipe_empty' ), true ) ) {
			return self::result( false, $code, $message, $data, array(), 1 );
		}

		// apply_recipe() rolls back applied units on a mid-bundle failure before returning, so a
		// genuine partial only exists when that rollback did not fully restore the pre-call state —
		// detected the same read-back-and-diff way as `starter import`.
		if ( $after_units !== $before_units ) {
			return self::result(
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
				2
			);
		}

		// The units are back to (or still at) their pre-call state, but import_recipe_look() runs
		// only after every unit already succeeded — a look-step failure rolls the units back while
		// leaving whatever design settings it already wrote untouched. We cannot tell from here
		// whether the failure happened before or during the look step, so warn conservatively
		// whenever the look was requested.
		$warnings = array();
		if ( ! empty( $options['include_look'] ) ) {
			$warnings[] = array(
				'code'    => 'look_partially_applied',
				'message' => __( 'This recipe requested the look. The failure may have happened after design settings (colors/fonts) were already written; they are not automatically reverted. Check the site\'s Style Manager settings before retrying.', '__plugin_txtd' ),
			);
		}

		return self::result( false, $code, $message, $data, $warnings, 1 );
	}
}
