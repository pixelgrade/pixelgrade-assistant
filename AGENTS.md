# Pixelgrade Assistant - Agent Notes

## Overview

Pixelgrade Assistant is a WordPress plugin for free Pixelgrade themes. It powers the admin dashboard experience for recommended plugins, starter/demo content, premium support, in-dashboard documentation, data collection, and conditional update guardrails for theme-dependent plugins.

GitHub: `git@github.com:pixelgrade/pixelgrade-assistant.git`

Local plugin path:
`/Users/georgeolaru/Local Sites/style-manager/app/public/wp-content/plugins/pixelgrade-assistant/`

Sibling plugins in this install:
- `../pixelgrade-care` is the related/maintained Pixelgrade Care plugin. Use it for patterns, but do not assume this project has the same Node version, release flow, or public/private file set.
- `../nova-blocks` is a theme-dependent block plugin that Pixelgrade Assistant may protect through conditional updates. Use its notes only for Nova-specific behavior.

Do not copy credentials, release secrets, or private operational details from sibling plugin notes into this repo.

## Agent File Layout

- Keep `AGENTS.md` as the canonical shared instruction file for Codex and Claude.
- Keep `CLAUDE.md` as a thin shim to `@AGENTS.md`.
- Keep shared private agent instructions in `AGENTS.local.md`.
- Keep vendor-neutral private research notes, plans, and issue writeups in `.ai/`.
- Keep tool-specific distilled working memory in `.claude/napkin.md`.
- Keep local env values in `.env.local`.
- Do not commit private overlays; commit only the example files.
- Use `bin/bootstrap-private` to hydrate private overlays after cloning.

Fresh private-overlay setup:

```bash
git config --local pixelgradeassistant.privateRepo git@github.com:<you>/pixelgrade-assistant-private.git
bin/bootstrap-private
```

Managed private overlay targets:
- `AGENTS.local.md`
- `.ai/`
- `.claude/napkin.md`
- `.env.local`

## Runtime Architecture

- Main plugin file: `pixelgrade-assistant.php`
  - Defines `PIXELGRADE_ASSISTANT__*` constants.
  - Loads Composer autoload and devmode integration.
  - Creates the `PixelgradeAssistant` singleton with version `2.0.0`.
- Core loader: `includes/class-pixelgrade_assistant.php`
  - Checks PHP and WordPress compatibility.
  - Prevents loading alongside Pixelgrade Care.
  - Loads admin, starter content, setup wizard, data collector, notifications, conditional updates, integrations, and theme helpers. (There is no standalone "support" module class; help/support UI is folded into the admin + config layers.)
- Admin controller: `admin/class-pixelgrade_assistant-admin.php`
  - Registers admin menu, tabs, notices, enqueues, REST endpoint data, Pixelgrade API endpoint data, and localized JS data.
  - Localized browser global is `pixassist`.
- REST controller: `admin/class-pixelgrade_assistant-admin_rest_interface.php`
  - Namespace is `pixassist/v1`.
  - Uses the extra `pixelgrade_assistant_rest` nonce passed as `pixassist_nonce` in addition to the standard WP REST nonce used by JS.
- Default remote-config fallback: `includes/default-plugin-config.php`.
- Conditional plugin-update guardrails: `includes/modules/conditional-updates/class-pixelgrade_assistant-conditional-updates.php`.
  - This reads theme plugin support constraints such as `Pixelgrade Plugin Supports: Nova Blocks (>2.0 <3.0), Style Manager (^2.0)`.
  - Some filters still use inherited `pixelgrade_care/...` names. Do not rename those casually; external integrations may rely on them.

Important persisted state:
- Options: `pixassist_options`.
- Theme mods: `pixassist_license`, `pixassist_new_theme_version`.
- User meta (legacy): pre-2.0 OAuth/account fields such as `pixassist_oauth_token`, `pixassist_user_ID`. These are no longer written by the free plugin (account/license moved to Pixelgrade Plus); the dashboard reset path still purges them on existing installs.
- Browser local storage: `pixassist_state`, `pixassist_last_updated`.

## Extension Points (companion plugins)

Pixelgrade Plus and other companions extend Assistant through public hooks rather than forking. The supported contract:

- **`pixassist_loaded` (action)** — fires after all core modules load, passing the main `PixelgradeAssistant` instance. Register additional modules/behavior here.
- **`pixelgrade_assistant_plus_status` (filter)** — Pixelgrade Plus reports its status (`is_plus_active`, `is_plus_licensed`, `plus_settings_url`, `plus_product_label`). Read via `pixassist_get_plus_status()`; the result is also localized to JS as `pixassist.plus`. Assistant only READS this — it never owns license/account state. **This is a shared contract.** Its canonical, authoritative definition (payload types, roles, load order, Care coexistence) and the **change protocol** live in the sibling Plus repo: `../pixelgrade-plus/docs/architecture/plus-assistant-contract.md`. Changing it means updating BOTH repos in lockstep and keeping both pinning tests green — Assistant's is `tests/plus-status-contract-test.php`; Plus's is `../pixelgrade-plus/tests/assistant-status-test.php`. Don't add license/OAuth/WUpdates/cloud/support internals to this payload.
- **`pixassist_default_config` / `pixassist_config` (filters)** — the canonical way to extend the dashboard + setup wizard UI declaratively. Inject tabs, cards, wizard steps and fields into the config array (`pixassist_default_config` mutates the defaults; `pixassist_config` is the final word after the default+remote merge). The renderer understands field types `text`, `h1`–`h4`, `button`, `links`, and a fixed set of `component` values. NOTE: adding a *new interactive component* is not yet supported without a bundle change — a JS component registry is a planned follow-up.
- **`pixassist_recommended_plugins` (filter)** — add/modify the recommended-plugins list.
- **`pixassist_localized_data` (filter)** — mutate the entire localized `pixassist` JS global.
- **`pixassist_internal_api_endpoints` / `pixassist_external_api_endpoints` (filters)** — adjust the REST/API endpoint descriptors handed to JS.
- **`pixassist_sce_allowed_demo_hosts` (filter)** — allow additional hosts for starter-content imports.
- **`pixassist_allow_*_module` (filters)** — disable individual core modules (setup wizard, notifications, data collector).

### Host extension surface (0.9.0 — Assistant as host shell)

The reverse direction of the Plus contract: Assistant is the host and exposes a small, curated, PHP-first surface companions consume (`includes/host-extension-surface.php`). **Shared contract** — same lockstep rule and source of truth as the status filter: `../pixelgrade-plus/docs/architecture/plus-assistant-contract.md` (§"Host extension surface"). Assistant's pin test is `tests/host-extension-surface-test.php`; the Plus consumer side + its pin test are `pixelgrade-plus#56`.

- **`pixelgrade/admin_hub/tabs` (PHP filter) + `pixassist_get_admin_hub_tabs()`** — register Appearance → Pixelgrade hub tabs. Descriptor: `id` (required, `sanitize_key`'d, first wins), `label`, `capability` (default `manage_options`; **this is the access control** — inaccessible tabs are dropped), `gate` (cosmetic upsell hint: `''`|`plus`|`plus_licensed`), `component` (JS registry key; cleared for link tabs), `url` (non-empty ⇒ link tab), `icon`, `order` (default 10, ties by label). The hub React app (#43) localizes the normalized list and re-applies the JS filter `pixelgrade.adminHub.tabs` (`@wordpress/hooks`) to bind components.
- **`pixassist_get_account()` / `pixassist_is_account_connected()`** — host-owned pixelgrade.com account READ accessors. Returns EXACTLY eight identity keys (`is_connected`, `email`, `display_name`, `user_login`, `pixelgrade_user_id`, `avatar_url`, `wp_user_id`, `connected_at`), whitelisted + type-coerced via the `pixassist_account` filter. **Identity only — never OAuth tokens/secrets** (a PHP-only credentials accessor is deferred to #45). Legacy storage today; #45 modernizes behind the same contract.
- **Docs-panel escalation SlotFill** — scope `pixelgrade-docs` (reserved/documented; the `<Slot>` ships with the editor docs panel in #46).

Conditional-updates also exposes public filters under the legacy `pixelgrade_care/...` namespace — kept stable for back-compat (see the class note); do not rename them.

## Build System

Use the project-local Node version, not the sibling plugin versions.

```bash
nvm use
npm install
```

Current constraints:
- `.nvmrc`: Node major `20`.
- `package.json`: Node `>=20.0.0`, npm `>=9.0.0`.
- Toolchain is Node 20 LTS + Dart Sass (`sass`) + gulp 5 + rollup 2 (`@rollup/plugin-babel`); `node-sass` and the deprecated rollup polyfill plugins were removed.
- `npm install` runs `node-tasks/lock_node_version.js`, which rewrites `.node-version` and `.nvmrc` from `package.json`.

Main commands:

```bash
npm run dev            # Rollup admin JS + admin CSS/RTL CSS
npm run production     # Production JS + CSS
npm run distribution   # Production JS, minified JS, CSS
./node_modules/.bin/gulp zip
```

Release packaging notes:
- Build sources are in `admin/src` and `admin/scss`.
- Compiled assets live in `admin/js` and `admin/css`.
- `gulp zip` packages the current compiled assets. Run `npm run distribution` first for release-grade assets.
- Zip output is one directory above the plugin, named like `Pixelgrade-assistant-1-4-0.zip`.
- The packaging task replaces source text-domain placeholders `__plugin_txtd` with `pixelgrade_assistant` inside the temporary build folder.
- If WP-CLI is available, packaging regenerates `languages/pixelgrade_assistant.pot` in the temporary build folder.
- Agent files and private overlays must stay out of release zips.

## Coding Guardrails

- Preserve the plugin's declared compatibility unless the task explicitly includes a compatibility bump.
- Follow existing non-namespaced PHP class patterns and file naming.
- For REST/AJAX/admin handlers: verify nonce, check capability when changing privileged behavior, sanitize input, escape output, and use prepared SQL for variable queries.
- Keep user-facing strings translatable. Source often uses `__plugin_txtd`; packaging replaces it in built zips.
- Keep `pixassist_*` option/meta/localStorage keys stable unless a migration is part of the task.
- Treat OAuth tokens, license hashes, support data, and remote API payloads as sensitive.
- Do not activate Pixelgrade Assistant and Pixelgrade Care together; the plugin intentionally blocks that combination.

## Verification

Use the smallest verification that matches the change:

```bash
php -l path/to/changed.php
composer test                          # pins the Pixelgrade Plus status contract (standalone, no WP)
npm run dev
npm run distribution
./node_modules/.bin/gulp zip
```

If you touch the Pixelgrade Plus status contract (`pixassist_get_plus_status()` /
`pixelgrade_assistant_plus_status`), follow the change protocol in
`../pixelgrade-plus/docs/architecture/plus-assistant-contract.md` and keep both repos' pinning
tests green (`composer test` here and in `../pixelgrade-plus`).

For release zips, verify:

```bash
unzip -l ../Pixelgrade-assistant-X-Y-Z.zip | grep -E "AGENTS.md|CLAUDE.md|AGENTS.local|\\.ai/|\\.claude/|\\.private/|\\.env"
unzip -p ../Pixelgrade-assistant-X-Y-Z.zip pixelgrade-assistant/pixelgrade-assistant.php | grep "Version:"
unzip -p ../Pixelgrade-assistant-X-Y-Z.zip pixelgrade-assistant/readme.txt | grep -E "Stable tag|Tested up to"
```

The first command should produce no matches.
