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

## Cross-Stack Strategy Decisions

When Pixelgrade Assistant work changes or settles product, business, positioning, monetization, Pixelgrade.com, Pixelgrade LT vs Pixelgrade Plus, starter strategy, or cross-repo LT stack architecture, save the durable decision in the central strategy folder:

`/Users/georgeolaru/Developer/pixelsite/master-strategy/`

Before making or changing those decisions, read:
- `/Users/georgeolaru/Developer/pixelsite/master-strategy/README.md`
- `/Users/georgeolaru/Developer/pixelsite/master-strategy/decisions/README.md`
- `/Users/georgeolaru/Developer/pixelsite/master-strategy/pixelgrade-lt-stack-strategy.md`
- `/Users/georgeolaru/Developer/pixelsite/master-strategy/source-index.md`

For any meaningful cross-stack strategy decision:
- Create a dated note in `/Users/georgeolaru/Developer/pixelsite/master-strategy/decisions/YYYY-MM-DD-short-title.md` using the template in `decisions/README.md`.
- Update `source-index.md` when the decision depends on a new source document, repo note, issue, or public reference.
- Update `pixelgrade-lt-stack-strategy.md` only when the decision changes the central strategy.

Keep implementation details, tests, and repo-specific plans in the repo where the work happens. Keep cross-stack product direction, positioning, monetization, and Pixelgrade.com strategy in `pixelsite/master-strategy`.

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
- Account state: `pixassist_options['account']` is the modern host-owned pixelgrade.com account connection storage (identity + OAuth token/secret for PHP-only server signing). Legacy user meta such as `pixassist_oauth_token`, `pixassist_user_ID`, and `pixelgrade_user_login` remains readable and is mirrored/cleared as a compatibility shim for old dashboard/reset paths; companion plugins must not read those raw keys.
- Browser local storage: `pixassist_state`, `pixassist_last_updated`.

## Extension Points (companion plugins)

Pixelgrade Plus and other companions extend Assistant through public hooks rather than forking. The supported contract:

- **`pixassist_loaded` (action)** — fires after all core modules load, passing the main `PixelgradeAssistant` instance. Register additional modules/behavior here.
- **`pixelgrade_assistant_plus_status` (filter)** — Pixelgrade Plus reports its status (`is_plus_active`, `is_plus_licensed`, `plus_settings_url`, `plus_product_label`). Read via `pixassist_get_plus_status()`; the result is also localized to JS as `pixassist.plus`. Assistant only READS this — it never owns license/account state. **This is a shared contract.** Its canonical, authoritative definition (payload types, roles, load order, Care coexistence) and the **change protocol** live in the sibling Plus repo: `../pixelgrade-plus/docs/architecture/plus-assistant-contract.md`. Changing it means updating BOTH repos in lockstep and keeping both pinning tests green — Assistant's is `tests/plus-status-contract-test.php`; Plus's is `../pixelgrade-plus/tests/assistant-status-test.php`. Don't add license/OAuth/WUpdates/cloud/support internals to this payload.
- **`pixassist_get_account_license_summary()`** — Assistant-owned, display-safe pixelgrade.com account-license discovery for guidance when Plus is absent. It may say the connected account owns a Plus-family license (`hasPlusLicense`, safe labels/SKUs, Pixelgrade.com setup hand-off URL), but it is **not** local Plus status and never enforces, activates, or exposes license hashes, OAuth secrets, WUpdates ids/digests, package URLs, entitlements, support, or cloud internals. The WordPress.org Assistant build must not download/install Plus from WUpdates inside wp-admin; missing Plus is a Pixelgrade.com hand-off, while already-installed Plus can be activated locally.
- **`pixassist_default_config` / `pixassist_config` (filters)** — the canonical way to extend the dashboard + setup wizard UI declaratively. Inject tabs, cards, wizard steps and fields into the config array (`pixassist_default_config` mutates the defaults; `pixassist_config` is the final word after the default+remote merge). The renderer understands field types `text`, `h1`–`h4`, `button`, `links`, and a fixed set of `component` values. NOTE: adding a *new interactive component* is not yet supported without a bundle change — a JS component registry is a planned follow-up.
- **`pixassist_recommended_plugins` (filter)** — add/modify the recommended-plugins list.
- **`pixassist_localized_data` (filter)** — mutate the entire localized `pixassist` JS global.
- **`pixassist_internal_api_endpoints` / `pixassist_external_api_endpoints` (filters)** — adjust the REST/API endpoint descriptors handed to JS.
- **`pixassist_sce_allowed_demo_hosts` (filter)** — allow additional hosts for starter-content imports.
- **`pixassist_allow_*_module` (filters)** — disable individual core modules (setup wizard, notifications, data collector).

### Host extension surface (0.9.0 — Assistant as host shell)

The reverse direction of the Plus contract: Assistant is the host and exposes a small, curated, PHP-first surface companions consume (`includes/host-extension-surface.php`). **Shared contract** — same lockstep rule and source of truth as the status filter: `../pixelgrade-plus/docs/architecture/plus-assistant-contract.md` (§"Host extension surface"). Assistant's pin test is `tests/host-extension-surface-test.php`; the Plus consumer side + its pin test are `pixelgrade-plus#56`.

- **`pixelgrade/admin_hub/tabs` (PHP filter) + `pixassist_get_admin_hub_tabs()`** — register Pixelgrade Design hub tabs (the top-level `Pixelgrade` admin menu — sidebar label is the bare brand, page title stays "Pixelgrade Design" — slug `pixelgrade`, right above Appearance; its sidebar submenus derive from the same registry via `pixassist_get_admin_hub_submenu_items()`, and `pixassist_get_hub_url()` is the canonical link builder — old `themes.php?page=pixelgrade` URLs 302 to the admin.php form). Descriptor: `id` (required, `sanitize_key`'d, first wins), `label`, `capability` (default `manage_options`; **this is the access control** — inaccessible tabs are dropped), `gate` (cosmetic upsell hint: `''`|`plus`|`plus_licensed`), `badge` (short sanitized display text, e.g. Plus annotates Account with `PLUS`), `badgeTone` (`''`|`plus`|`plus-active`; Plus uses neutral `plus` when installed/unlicensed and active purple `plus-active` when licensed), `component` (JS registry key; cleared for link tabs), `url` (non-empty ⇒ link tab), `icon`, `group` (`primary`|`secondary`, default `primary`; secondary sorts after primary), `order` (default 10, ties by label inside each group). The hub React app (#43) localizes the normalized list and re-applies the JS filter `pixelgrade.adminHub.tabs` (`@wordpress/hooks`) to bind components. Legacy `?tab=account-license` routes to `?tab=account&section=plus`.
- **`pixelgrade.adminHub.accountPanels` (JS filter)** — Account renders the host-owned Pixelgrade account card first, then contributed panel descriptors (`id`, `component`, `order`) after it. Plus uses this to render license/setup/migration/design-library UI at `section=plus` while keeping all Plus license state/actions/entitlements in Plus.
- **`pixelgrade/admin_hub/starters` (PHP filter) + `pixassist_get_admin_hub_starters()`** — Assistant seeds the Starter Sites tab from free `starterContent.demos`; companions append premium starter descriptors. Normalized item keys: `id`, `title`, `description`, `url`, `baseRestUrl`, `gate`, `image`, `previewUrl`, `badge`, `role`, `source`, `order`, `capabilities`, `requiredPlugins`, `segments`, `applyPlan`. `gate` is item-level presentation (`''`|`plus`|`plus_licensed`), not access control. `role` is presentation too — `'starter'` (default; shown in Starter Sites AND as a Layouts source) vs `'library'` (a Layouts-only parts/template library, e.g. the Frame Library — dropped from the Starter Sites tab card list, still a Layouts source; the Layouts tab + `LayoutPreview` read the full `window.pixelgradeStarterSites` source list, so libraries stay available there). Plus must also extend `pixassist_sce_allowed_demo_hosts` for any injected premium host outside Assistant's free demo config.
- **Starter capability-segments (`includes/starter-segments.php`)** — a starter's import is decomposed into **segments** (`base`/`look`/`layouts` free + `commerce` gated), exposed on each normalized starter under `segments` (secret-free: id, label, description, affectedAreas, defaultIncluded, requiredPlugins, requiredEntitlements, requiredCapabilities, gate, availability, availabilityReason, available). **Starter sites stay free objects** — the gate lives on the *segment*, never on the card. Commerce requires WooCommerce active **AND** the Plus capability `woocommerce_integration`, read through Plus's existing absence-safe bridge `apply_filters('pixelgrade/has_entitlement', false, 'woocommerce_integration')` (Assistant only READS; never reuse the coarse `PRO_STARTER_SITES` gate). On the Plus side `woocommerce_integration` stays in the add-on **taxonomy** (`Entitlement::add_ons()`, not `core()`), but an active Plus license bundles it by default; `pixelgrade_plus_has_add_on` can still override that default for a future tier. **Server-side enforcement is intrinsic** (content-classified, never client-trusted) at TWO levels: operation-level `pixassist_starter_classify_import()` and **record-level** `pixassist_starter_classify_post_record($post,$context)` (WooCommerce pages shipped as ordinary `page` posts — slugs shop/cart/checkout/my-account — woo block templates, woo blocks/shortcodes in content, and **nav menu items** by exported target meta: `_menu_item_object`=product/`product_cat`, or a `_menu_item_object`+`_menu_item_object_id` pair targeting a skipped commerce record — the importer threads the skipped-commerce-source-id set as `$context`, keyed by typed `"<object-type>:<id>"` (`pixassist_starter_commerce_object_key()`) so a page-targeting nav item matches only a skipped page and an editorial category/post_tag link can never collide with a product/term sharing its numeric id). A starter declares the commerce segment via an explicit `segments`/`commerce` flag, the filterable `pixassist_starter_commerce_ids` allowlist (default `felt-lt`), or identity inference. `/import` rejects unauthorized commerce steps; `import_post_type()` skips unauthorized commerce *records* (recording skipped ids; pages/products at priority 10 import before nav items at 900) so the free full demo keeps base pages/templates/menu items but drops shop pages/woo templates/commerce menu items; `import_starter` strips `woocommerce_*` settings (incl. `woocommerce_shop_page_id`); `import_unit`/`queue_unit` reject commerce template units. **Shared contract** — see `../pixelgrade-plus/docs/architecture/plus-assistant-contract.md` §6; pin tests `tests/starter-segments-test.php` (Assistant) + `tests/entitlement-bridge-test.php` (Plus).
- **`pixassist_get_account()` / `pixassist_is_account_connected()`** — host-owned pixelgrade.com account READ accessors. Returns EXACTLY eight identity keys (`is_connected`, `email`, `display_name`, `user_login`, `pixelgrade_user_id`, `avatar_url`, `wp_user_id`, `connected_at`), whitelisted + type-coerced via the `pixassist_account` filter. **Identity only — never OAuth tokens/secrets**. Modern storage lives behind this contract, with legacy meta as a fallback.
- **`pixassist_get_account_credentials()`** — PHP-only host account credentials accessor. Returns `null` or exactly `token` / `token_secret` for server-side OAuth1 signing. **Never localize this to JS and never merge it into the identity payload.** Plus consumes this in `plus#57`; callers must guard with `function_exists()`.
- **Docs-panel surfaces (`window.pixelgradeAdminHub.docs`)** — scope `pixelgrade-docs`. The editor docs experience is a **single modeless floating window** (`DocsArticleWindow`, portaled to `<body>`; role=dialog aria-modal=false — NOT a docked sidebar, NOT a blocking modal; the editor stays interactive) styled to the native editor chrome (`@wordpress/icons`, panel-header look). It floats over the canvas, drags (pointer-shield over the canvas iframe), minimizes to a bottom-left chip, persists position to localStorage, falls back to a bottom sheet under 783px. It hosts two modes: the full **KB browser** (default; the `compact` `KbPanel`) and a **single article** (deep-linked, `request.browse` distinguishes them). **The window FOLLOWS the user across ALL of wp-admin** (#46): the JS is split into two bundles — `docs-window` (editor-agnostic: window + KbPanel + data + host API + SlotFill; deps `wp-element/components/api-fetch/i18n` only) which mounts on ANY admin page, and `docs` (editor launchers only) — coordinated by a React-free `events.js` (dispatchers + window-global listener counter). The window persists its open `request` to localStorage + mirrors a `pixassist_docs_open` cookie; PHP `enqueue_docs_window()` (on `admin_enqueue_scripts`) loads `docs-window` only when `is_block_editor()` OR the cookie is set OR `?pixassist_open_docs=1` (so closed-docs pages cost nothing), and the window re-hydrates on mount. It opens four ways: a **pinned toolbar button** (`@wordpress/interface` `PinnedItems`, scope `core`), a **⋮ Options-menu item** (`PluginMoreMenuItem`), a **command-palette command** (`useCommand`, `pixelgrade-assistant/open-docs`) — all editor-only — and an **admin-bar "Pixelgrade Docs" node** (any admin page, links `?pixassist_open_docs=1` → `autoOpen`). Two companion-consumable surfaces hang off the global:
  - **Escalation SlotFill** — `{ EscalationSlot, EscalationFill }`; Plus may enhance support requests through the JS filter `pixelgrade.docs.ticketRequest`.
  - **`openArticle({ url | id | slug })`** — deep-links a documentation article into the floating window so companions (Style Manager, Nova Blocks, …) can read a doc while they work (no new tab). **It returns truthy ONLY when the window's listener is mounted**, so callers MUST keep their normal external-link fallback for when it returns `false` (Assistant absent / no window). Resolution is by the **trailing docs-URL slug** (theme-agnostic — SM's links carry no theme slug), backed by `GET /pixassist/v1/kb_article` → `pixassist_get_docs_article()` / `pixassist_docs_find_article()`: capability+nonce gated, secret-free `{id,title,content,url,breadcrumbs}`, resolved from the cached `get_kb_categories()` tree (cache-first, fresh retry on a miss) — **no pixelgrade.com endpoint**. Reference consumer: Style Manager's delegated `.sm-site-editor` docs-link handler (`src/_js/site-editor/docs-links.js`). The window / `ArticleView` / `KbPanel` are shared with the Help hub tab (`admin/src-modern/docs/KbPanel.js`).

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

### Local Test Sites

- `pixelgrade-integrated-check` (Studio, `/Users/georgeolaru/Studio/pixelgrade-integrated-check`) is the canonical Assistant-active local verify site for the Pixelgrade hub. Use it instead of `style-manager.local` when the Assistant must load; `style-manager.local` has Pixelgrade Care active, so Assistant is dormant there.
- Runtime: `studio site start --path /Users/georgeolaru/Studio/pixelgrade-integrated-check --skip-browser`; stop with `studio site stop --path /Users/georgeolaru/Studio/pixelgrade-integrated-check`; inspect access with `studio site status --path /Users/georgeolaru/Studio/pixelgrade-integrated-check`.
- URL/admin: `http://localhost:8889/`; wp-admin via `http://localhost:8889/studio-auto-login?redirect_to=%2Fwp-admin%2F` or directly to the hub with `http://localhost:8889/studio-auto-login?redirect_to=%2Fwp-admin%2Fadmin.php%3Fpage%3Dpixelgrade`.
- Verified 2026-06-17: Anima LT active; Pixelgrade Assistant and Pixelgrade Plus active; Pixelgrade Care not active; the Pixelgrade Design hub renders (top-level menu since 2026-07-09; formerly Appearance -> Pixelgrade). Style Manager and Nova Blocks are installed but inactive. As of 2026-06-17 the Assistant pixelgrade.com account IS now connected (`contact@pixelgrade.com`, Pixelgrade ID 1) — connected during free account/support end-to-end verification via the shipped `pkDQYLDpG7ji` consumer; there is still no theme license and Plus is still unlicensed, so do not use it for theme-license/Plus-license/entitlement tests. NOTE: the previously-documented clean *unconnected* baseline no longer holds — disconnect via Pixelgrade Design → Account to restore it.
