<?php
/**
 * WordPress Abilities for the `assist` verbs — contract §4.
 *
 * Five abilities, mapping 1:1 onto the `wp pixelgrade assist …` commands of §1.3. Each one calls
 * the SAME {@see PixelgradeAssistant_Agent_Core} method the CLI calls, so a command and its
 * ability cannot produce different results for the same input.
 *
 * Registration is guarded by `function_exists( 'wp_register_ability' )` (WordPress 6.9+), so a
 * pre-6.9 site is unaffected — the same shape as the CLI's `class_exists( '\WP_CLI' )` guard.
 *
 * PRIVACY (contract §4): every ability registers `meta.mcp.public = false` unless its name appears
 * in the one reviewed whitelist, which is reached through the `pixelgrade/mcp/public_abilities`
 * filter and owned by {@see PixelgradeAssistant_MCP_Server}. Nothing here hardcodes an exposure.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/agent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PixelgradeAssistant_Abilities {

	/**
	 * The shared ability category every Pixelgrade plugin registers into.
	 */
	const CATEGORY = 'pixelgrade';

	/**
	 * Wire the two registration hooks.
	 */
	public static function register() {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		add_action( 'wp_abilities_api_categories_init', array( __CLASS__, 'register_category' ) );
		add_action( 'wp_abilities_api_init', array( __CLASS__, 'register_abilities' ) );
	}

	/**
	 * Register the shared `pixelgrade` category, idempotently.
	 *
	 * Every Pixelgrade plugin that owns abilities does this defensively, because any subset of the
	 * four may be active and a category must exist before an ability that names it registers.
	 */
	public static function register_category() {
		// Both functions are guarded, not just the registrar: if the API ever ships them
		// asymmetrically, an unguarded wp_has_ability_category() would fatal here.
		if ( ! function_exists( 'wp_register_ability_category' ) || ! function_exists( 'wp_has_ability_category' ) ) {
			return;
		}

		if ( wp_has_ability_category( self::CATEGORY ) ) {
			return;
		}

		wp_register_ability_category(
			self::CATEGORY,
			array(
				'label'       => __( 'Pixelgrade', '__plugin_txtd' ),
				'description' => __( 'Design system, licensing, starter content and block operations for the Pixelgrade stack.', '__plugin_txtd' ),
			)
		);
	}

	/**
	 * Register the five `assist` abilities.
	 */
	public static function register_abilities() {
		foreach ( self::descriptors() as $name => $descriptor ) {
			// Contract §4, forward policy: an ability that declares an `entitlement` is ABSENT from
			// the registry when Plus denies it, mirroring the existing seam rather than registering
			// and refusing. No `assist` ability declares one today — Plus gating happens inside the
			// writes, as stripping (§3.2) — but the seam ships so the first one that needs it has
			// nowhere to improvise. The same check runs again in the permission callback, because
			// registration happens at `init` while entitlement state can change afterwards.
			if ( ! self::entitled( $descriptor ) ) {
				continue;
			}

			wp_register_ability( $name, self::build_args( $name, $descriptor ) );
		}
	}

	/**
	 * Is this descriptor's entitlement (if any) granted right now?
	 *
	 * @param array $descriptor
	 *
	 * @return bool
	 */
	public static function entitled( $descriptor ) {
		if ( empty( $descriptor['entitlement'] ) ) {
			return true;
		}

		return (bool) apply_filters( 'pixelgrade/has_entitlement', false, $descriptor['entitlement'] );
	}

	/**
	 * Is this ability name on the one reviewed public whitelist?
	 *
	 * @param string $name
	 *
	 * @return bool
	 */
	public static function is_public( $name ) {
		return in_array( $name, (array) apply_filters( 'pixelgrade/mcp/public_abilities', array() ), true );
	}

	/**
	 * Turn a descriptor into the `wp_register_ability()` argument array.
	 *
	 * @param string $name
	 * @param array  $descriptor
	 *
	 * @return array
	 */
	public static function build_args( $name, $descriptor ) {
		return array(
			'label'               => $descriptor['label'],
			'description'         => $descriptor['description'],
			'category'            => self::CATEGORY,
			'input_schema'        => $descriptor['input_schema'],
			'output_schema'       => $descriptor['output_schema'],
			'execute_callback'    => $descriptor['execute'],
			'permission_callback' => self::permission_callback( $descriptor ),
			'meta'                => array(
				'annotations' => $descriptor['annotations'],
				'mcp'         => array( 'public' => self::is_public( $name ) ),
			),
		);
	}

	/**
	 * The capability floor is the same one the CLI verb enforces (contract §4) — never more
	 * permissive, and never auto-elevating (§3.0).
	 *
	 * @param array $descriptor
	 *
	 * @return callable
	 */
	private static function permission_callback( $descriptor ) {
		return static function () use ( $descriptor ) {
			// A named reason, matching the other three repos: "denied" and "denied because Plus does
			// not grant this" are different operator problems and should not look identical.
			if ( ! self::entitled( $descriptor ) ) {
				return new WP_Error(
					'permission_denied',
					__( 'This ability requires a Pixelgrade Plus entitlement that is not currently granted.', '__plugin_txtd' )
				);
			}

			if ( ! current_user_can( PixelgradeAssistant_Agent_Core::CAPABILITY ) ) {
				return new WP_Error(
					'permission_denied',
					sprintf(
						/* translators: %s: the WordPress capability the ability requires. */
						__( 'This ability requires the "%s" capability.', '__plugin_txtd' ),
						PixelgradeAssistant_Agent_Core::CAPABILITY
					)
				);
			}

			return true;
		};
	}

	/**
	 * Map a core result onto what an ability returns.
	 *
	 * Contract §2 binds `ok` to the exit code: `ok:true` is exit 0 or 2 (the machinery completed,
	 * findings live in `code`/`warnings`) and `ok:false` is exit 1 or 3. That maps cleanly onto the
	 * Abilities error channel — a completed call returns the envelope, a failed one returns a
	 * `WP_Error` carrying the command's closed machine token verbatim. Exit 3 never reaches here:
	 * the permission callback denies first.
	 *
	 * @param array $result A PixelgradeAssistant_Agent_Core result.
	 *
	 * @return array|WP_Error
	 */
	public static function respond( $result ) {
		if ( empty( $result['ok'] ) ) {
			return new WP_Error(
				$result['code'],
				$result['summary'],
				array(
					'data'     => $result['data'],
					'warnings' => $result['warnings'],
				)
			);
		}

		$envelope = array(
			'ok'       => true,
			'code'     => $result['code'],
			'summary'  => $result['summary'],
			'data'     => $result['data'],
			'warnings' => $result['warnings'],
		);

		if ( isset( $result['extra']['retryable'] ) ) {
			$envelope['retryable'] = (bool) $result['extra']['retryable'];
		}

		return $envelope;
	}

	/**
	 * The `confirmation_required` refusal a destructive ability returns without `confirm: true`.
	 *
	 * Contract §3.6 binds confirmation to the OUTPUT FORMAT: under `--format=json|yaml` — the
	 * machine path, which is exactly what an ability is — `--yes` is strictly required and its
	 * absence is `ok:false`, `code:"confirmation_required"`, exit 1. An ability mirrors that rule
	 * rather than inventing a softer one: an MCP client's `destructive` annotation is a hint to its
	 * user, not a confirmation the site received.
	 *
	 * @param string $what Human name of the operation.
	 *
	 * @return WP_Error
	 */
	public static function needs_confirmation( $what ) {
		return new WP_Error(
			'confirmation_required',
			sprintf(
				/* translators: %s: the name of the destructive operation. */
				__( '%s is destructive. Re-run with "confirm": true once you intend it.', '__plugin_txtd' ),
				$what
			)
		);
	}

	/**
	 * The envelope wrapper every `output_schema` shares.
	 *
	 * Contract §4 asks for "the envelope's `data` object … plus `warnings`/`stripped`". The whole
	 * envelope is returned instead — a strict superset that additionally preserves `code`, the
	 * closed machine token a caller must branch on to notice an exit-2 finding (a partial import,
	 * a Plus-stripped write). Hoisting `data`'s keys to the top level would collide with
	 * `warnings` and would mean re-deriving the pinned `data` schemas, which §4 forbids.
	 *
	 * @param array $data_schema The command's pinned `data` schema.
	 *
	 * @return array
	 */
	public static function envelope_schema( $data_schema ) {
		return array(
			'type'       => 'object',
			'properties' => array(
				'ok'       => array(
					'type'        => 'boolean',
					'description' => __( 'Always true here: the call completed. A failure arrives as an error, not as this envelope.', '__plugin_txtd' ),
				),
				'code'     => array(
					'type'        => 'string',
					'description' => __( 'Stable machine token, never translated. "ok" means nothing to inspect; anything else means the call completed WITH findings you must read (e.g. "partial").', '__plugin_txtd' ),
				),
				'summary'  => array(
					'type'        => 'string',
					'description' => __( 'One human-readable line.', '__plugin_txtd' ),
				),
				'data'     => $data_schema,
				'warnings' => array(
					'type'        => 'array',
					'description' => __( 'Findings that did not fail the call. Each has at least {code, message}.', '__plugin_txtd' ),
					'items'       => array( 'type' => 'object' ),
				),
			),
			'required'   => array( 'ok', 'code', 'summary', 'data', 'warnings' ),
		);
	}

	/**
	 * The five ability descriptors.
	 *
	 * Descriptions are written for a language model deciding whether to call the tool: what it
	 * does, when to reach for it, and what it costs.
	 *
	 * @return array
	 */
	public static function descriptors() {
		$opaque_object = array( 'type' => 'object', 'additionalProperties' => true );

		return array(

			'pixelgrade/list-starters' => array(
				'label'       => __( 'List starter sites', '__plugin_txtd' ),
				'description' => __( 'List the starter sites (demo content bundles) this site can import from the Pixelgrade hub. Read-only. Call this first to discover the demo key and the source URL that pixelgrade/import-starter requires — those two values come from here, not from guesswork. Set refresh:true to bypass the cached hub config and re-fetch; a hub that cannot be reached is a retryable failure, not an empty catalog.', '__plugin_txtd' ),
				'annotations' => array( 'readonly' => true, 'destructive' => false, 'idempotent' => true ),
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'refresh' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Bypass the cached hub config and fetch a fresh starter descriptor list.', '__plugin_txtd' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => self::envelope_schema(
					array(
						'type'       => 'object',
						'properties' => array(
							'starters' => array(
								'type'        => 'array',
								'description' => __( 'The normalized hub catalog. Each entry carries the demo key and its source base URL.', '__plugin_txtd' ),
								'items'       => array( 'type' => 'object' ),
							),
						),
					)
				),
				'execute'     => static function ( $input = array() ) {
					return self::respond(
						PixelgradeAssistant_Agent_Core::list_starters(
							array( 'refresh' => ! empty( $input['refresh'] ) )
						)
					);
				},
			),

			'pixelgrade/import-starter' => array(
				'label'       => __( 'Import a starter site', '__plugin_txtd' ),
				'description' => __( 'Import a starter site\'s full content — posts, pages, media, taxonomies, widgets and design settings — into this site. DESTRUCTIVE and NOT idempotent: it creates content and media every time it runs, and before anything is journaled it force-deletes an untouched default "Hello world!" post and "Sample Page" pair if present; that deletion is not undone by pixelgrade/reset-starter-content. Requires confirm:true. Get demo_key and source_url from pixelgrade/list-starters; source_url must be https and its host must be on the allowlist. A result with code "partial" means some units imported and some failed — read warnings and data before retrying. code "missing_required_plugins" means nothing usable was imported until those plugins are installed.', '__plugin_txtd' ),
				'annotations' => array( 'readonly' => false, 'destructive' => true, 'idempotent' => false ),
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'demo_key'   => array(
							'type'        => 'string',
							'description' => __( 'The starter/demo key, as listed by pixelgrade/list-starters.', '__plugin_txtd' ),
						),
						'source_url' => array(
							'type'        => 'string',
							'description' => __( 'The starter\'s source SCE REST base URL (its baseRestUrl). Must use https://.', '__plugin_txtd' ),
						),
						'confirm'    => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Must be true. This import creates content it cannot cleanly reverse.', '__plugin_txtd' ),
						),
					),
					'required'             => array( 'demo_key', 'source_url' ),
					'additionalProperties' => false,
				),
				'output_schema' => self::envelope_schema(
					array(
						'type'                 => 'object',
						'description'          => 'The importer\'s own summary, plus a mandatory post-import re-read: importedStarterContent (the full journal) and activeStarter.',
						'additionalProperties' => true,
					)
				),
				'execute'     => static function ( $input = array() ) {
					$validated = PixelgradeAssistant_Agent_Core::validate_keyed_source(
						isset( $input['demo_key'] ) ? $input['demo_key'] : '',
						isset( $input['source_url'] ) ? $input['source_url'] : '',
						__( 'You need to provide demo_key and source_url.', '__plugin_txtd' ),
						__( 'source_url must use https://.', '__plugin_txtd' )
					);

					if ( isset( $validated['code'] ) ) {
						return self::respond( $validated );
					}

					if ( empty( $input['confirm'] ) ) {
						return self::needs_confirmation( __( 'Importing starter content', '__plugin_txtd' ) );
					}

					return self::respond(
						PixelgradeAssistant_Agent_Core::import_starter(
							array(
								'demo_key'   => $validated['key'],
								'source_url' => $validated['source_url'],
							)
						)
					);
				},
			),

			'pixelgrade/reset-starter-content' => array(
				'label'       => __( 'Reset starter content', '__plugin_txtd' ),
				'description' => __( 'Undo every starter import journaled on this site: delete the imported posts, media and terms, and restore the options and theme mods that were replaced. DESTRUCTIVE — it deletes content. Requires confirm:true. Idempotent: running it again on an already-reset site is a no-op. code "partial" means some journaled posts were already gone (data.posts_missing counts them); that is a finding, not a failure. It does NOT restore the default "Hello world!" post and "Sample Page" that an import may have removed.', '__plugin_txtd' ),
				'annotations' => array( 'readonly' => false, 'destructive' => true, 'idempotent' => true ),
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'confirm' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Must be true. This deletes imported content.', '__plugin_txtd' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => self::envelope_schema(
					array(
						'type'                 => 'object',
						'description'          => 'The importer\'s own counters: posts_deleted, posts_missing, terms_deleted, media_deleted, options_restored, theme_mods_restored, and so on.',
						'additionalProperties' => true,
					)
				),
				'execute'     => static function ( $input = array() ) {
					if ( empty( $input['confirm'] ) ) {
						return self::needs_confirmation( __( 'Resetting starter content', '__plugin_txtd' ) );
					}

					return self::respond( PixelgradeAssistant_Agent_Core::reset_starter_content() );
				},
			),

			'pixelgrade/list-recipes' => array(
				'label'       => __( 'List recipes', '__plugin_txtd' ),
				'description' => __( 'List the source recipes — bundles of layout units that can be applied together — backed by the layout units available to this site. Read-only. Call this to discover the recipe_id pixelgrade/apply-recipe needs. Pass sources to narrow the list to specific hub source ids; omit it for every source. A source that fails to build is reported in warnings and never fails the call.', '__plugin_txtd' ),
				'annotations' => array( 'readonly' => true, 'destructive' => false, 'idempotent' => true ),
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'sources' => array(
							'type'        => 'array',
							'items'       => array( 'type' => 'string' ),
							'description' => __( 'Hub source ids to restrict the listing to. Omit for every source.', '__plugin_txtd' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => self::envelope_schema(
					array(
						'type'       => 'object',
						'properties' => array(
							'recipes'  => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
							'failures' => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
						),
						'additionalProperties' => true,
					)
				),
				'execute'     => static function ( $input = array() ) {
					return self::respond(
						PixelgradeAssistant_Agent_Core::list_recipes(
							array( 'sources' => isset( $input['sources'] ) ? (array) $input['sources'] : array() )
						)
					);
				},
			),

			'pixelgrade/apply-recipe' => array(
				'label'       => __( 'Apply a recipe', '__plugin_txtd' ),
				'description' => __( 'Apply one source recipe as a single bundle of layout units. DESTRUCTIVE and NOT idempotent — it creates content each time. Requires confirm:true. Get recipe_id from pixelgrade/list-recipes; source_url must be https. include_look also writes the recipe\'s design settings (colors and fonts) through Style Manager: if the apply then fails, the layout units are rolled back but those design settings are NOT reverted, and the result says so in warnings. code "partial" means the rollback did not fully restore the pre-call state.', '__plugin_txtd' ),
				'annotations' => array( 'readonly' => false, 'destructive' => true, 'idempotent' => false ),
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'recipe_id'      => array(
							'type'        => 'string',
							'description' => __( 'The recipe/source id, as listed by pixelgrade/list-recipes.', '__plugin_txtd' ),
						),
						'source_url'     => array(
							'type'        => 'string',
							'description' => __( 'The recipe source\'s SCE REST base URL. Must use https://.', '__plugin_txtd' ),
						),
						'include_look'   => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Also apply the recipe\'s design settings (colors and fonts). These are not reverted if a later step fails.', '__plugin_txtd' ),
						),
						'include_sample' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Also import the recipe\'s sample content.', '__plugin_txtd' ),
						),
						'confirm'        => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Must be true. This creates content it cannot cleanly reverse.', '__plugin_txtd' ),
						),
					),
					'required'             => array( 'recipe_id', 'source_url' ),
					'additionalProperties' => false,
				),
				'output_schema' => self::envelope_schema(
					array(
						'type'                 => 'object',
						'description'          => 'The apply result, plus a mandatory post-apply re-read: appliedLayoutUnits and appliedContentUnits.',
						'additionalProperties' => true,
					)
				),
				'execute'     => static function ( $input = array() ) {
					$validated = PixelgradeAssistant_Agent_Core::validate_keyed_source(
						isset( $input['recipe_id'] ) ? $input['recipe_id'] : '',
						isset( $input['source_url'] ) ? $input['source_url'] : '',
						__( 'You need to provide recipe_id and source_url.', '__plugin_txtd' ),
						__( 'source_url must use https://.', '__plugin_txtd' )
					);

					if ( isset( $validated['code'] ) ) {
						return self::respond( $validated );
					}

					if ( empty( $input['confirm'] ) ) {
						return self::needs_confirmation( __( 'Applying a recipe', '__plugin_txtd' ) );
					}

					return self::respond(
						PixelgradeAssistant_Agent_Core::apply_recipe(
							array(
								'recipe_id'      => $validated['key'],
								'source_url'     => $validated['source_url'],
								'include_look'   => ! empty( $input['include_look'] ),
								'include_sample' => ! empty( $input['include_sample'] ),
							)
						)
					);
				},
			),
		);
	}
}
