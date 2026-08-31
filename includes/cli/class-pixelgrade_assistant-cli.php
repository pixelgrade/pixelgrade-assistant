<?php
/**
 * WP-CLI subtree: `wp pixelgrade assist …`.
 *
 * CLI wrappers over the existing Starter Sites / Recipes controller methods, built to the
 * agentic-stack contract (`docs/plans/agentic-stack/CONTRACT.md` v0.3, §1.3): the CLI wraps
 * `PixelgradeAssistant_StarterContent::import_starter()` / `::reset_starter_content()` /
 * `::list_recipes()` / `::apply_recipe()` and the `includes/admin-starter-sites.php` starter list
 * helpers directly, sidestepping the REST layer's nonce check entirely while leaving
 * `is_allowed_demo_url()` / `get_missing_required_plugins()` (both private, called from inside
 * `import_starter()`) in force.
 *
 * Registration is guarded by `class_exists( '\WP_CLI' )` (Gate-0 Q2: the CLI ships inside the
 * wp.org plugin, not a separate companion) so this file is inert outside WP-CLI and adds no new
 * distributable.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes/cli
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( '\WP_CLI' ) ) {
	// The verb bodies live on the shared seam the `pixelgrade/*` abilities also call, so the CLI
	// and the abilities cannot drift. `require_once` is idempotent — the main plugin file loads
	// this unconditionally too, because abilities register outside WP-CLI.
	require_once __DIR__ . '/../agent/class-pixelgrade_assistant-agent-core.php';
	require_once __DIR__ . '/class-pixelgrade_assistant-cli-envelope.php';
	require_once __DIR__ . '/class-pixelgrade_assistant-cli-starter-command.php';
	require_once __DIR__ . '/class-pixelgrade_assistant-cli-recipe-command.php';

	\WP_CLI::add_command( 'pixelgrade assist starter', 'PixelgradeAssistant_CLI_Starter_Command' );
	\WP_CLI::add_command( 'pixelgrade assist recipe', 'PixelgradeAssistant_CLI_Recipe_Command' );
}
