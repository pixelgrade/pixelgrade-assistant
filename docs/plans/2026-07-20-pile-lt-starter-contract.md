# Pile LT Starter Contract Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task.

**Goal:** Restore Pile LT placeholder media, structural templates/footer, and site-logo parity across Pixelgrade Assistant and Starter Content Exporter.

**Architecture:** Assistant imports and journals both curated media groups, then remaps the exported `site_logo` option through the same attachment map used for custom logos. Starter Content Exporter exports `site_logo`, refuses to use ignored assets as placeholder fallbacks, and is deployed from its clean upstream repository before the Pile LT exporter selection is corrected.

**Tech Stack:** WordPress PHP, standalone PHP contract tests, WP-CLI, Studio CLI, SSH, and browser smoke testing.

---

### Task 1: Pin Assistant placeholder collection

**Files:**
- Modify: `tests/starter-media-reimport-dedup-test.php`
- Modify: `admin/class-pixelgrade_assistant-starter_content.php:7410`

1. Change the fresh-import expectation so IDs `175, 9, 10, 11` are collected and the placeholder item retains group `placeholders` plus its direct source URL.
2. Extend re-import fixtures with the placeholder journal mapping and existing local attachment.
3. Run `/opt/homebrew/opt/php/bin/php tests/starter-media-reimport-dedup-test.php`; expect failure because ID 175 is absent.
4. Change `collect_starter_media_items()` to skip only `source_urls`, importing both real media groups.
5. Re-run the focused test; expect PASS.
6. Commit the focused red-green change.

### Task 2: Pin Assistant core site-logo remapping

**Files:**
- Modify: `tests/starter-import-parity-test.php`
- Modify: `admin/class-pixelgrade_assistant-starter_content.php:142`
- Modify: `admin/class-pixelgrade_assistant-starter_content.php:13229`

1. Add a focused assertion that source `site_logo` attachment 299 becomes local attachment 6001 from `media.ignored`.
2. Run `/opt/homebrew/opt/php/bin/php tests/starter-import-parity-test.php`; expect the remote ID 299 to remain unchanged.
3. Register `pixassist_sce_import_post_option_site_logo` and route it through the existing guarded logo remapper.
4. Re-run the focused test; expect PASS.
5. Run PHP syntax checks and the full `PATH=/opt/homebrew/opt/php/bin:$PATH composer test` suite.
6. Commit the site-logo change.

### Task 3: Pin exporter media and site-logo contracts

**Files in `/Users/georgeolaru/.config/superpowers/worktrees/starter_content_exporter/pile-lt-starter-contract`:**
- Create: `tests/placeholder-contract-test.php`
- Create: `tests/site-logo-settings-test.php`
- Modify: `starter_content_exporter.php:3029`
- Modify: `starter_content_exporter.php:3437`

1. Add a standalone placeholder test exposing the protected helpers through a test subclass. It must assert that empty placeholders never rotate through ignored media and that an unresolved URL returns `#`.
2. Run the test against the captured live exporter using `SCE_PLUGIN_FILE=/tmp/sce-inspect.Z279I1/starter_content_exporter/starter_content_exporter.php`; expect failure because ignored media is returned.
3. Run the test against the clean branch; expect failure at the unguarded empty URL rotation.
4. Add the minimal empty-placeholder guard to `get_rotated_placeholder_url()` and re-run; expect PASS.
5. Add a standalone test expecting `get_post_settings()` to include `site_logo => 299`; run it and expect failure.
6. Add `site_logo` to the default exported post options and re-run; expect PASS.
7. Run all exporter tests and PHP syntax checks, then commit.

### Task 4: Prepare deployable branches

1. Inspect both worktree diffs and ensure only planned files changed.
2. Run Assistant and exporter full test suites again.
3. Request code review against this design and address only verified findings.
4. Keep the branches local until final smoke verification; do not publish a WordPress.org Assistant release as part of this goal.

### Task 5: Back up and deploy the exporter

1. Copy the live `starter_content_exporter` option to a timestamped backup option via remote WP-CLI.
2. Stage the clean exporter worktree beside the network-active live directory, verify its version and key-file hashes, and atomically rename directories so the old directory remains recoverable.
3. Restart PHP-FPM only if fresh HTTP responses retain old code behavior.
4. Update both standard and must-import Pile LT selections to templates `328,329,330,331,332,333,1746,2086,2108`, template parts `140,334`, and the existing required navigation records.
5. Verify `/sce/v2/data?media_urls=1` exposes the intended templates, parts, 5 placeholders, 10 ignored assets, and `site_logo` 299.

### Task 6: Sync Assistant and run a clean smoke import

1. Back up the current smoke-site import state or create a separate clean Studio verification site.
2. Mirror the changed Assistant PHP file into the smoke runtime and verify hashes.
3. Reset only Pixelgrade Assistant-imported starter data, or use the separate clean site.
4. Import Pile LT through the real Starter Sites UI.
5. Verify WP-CLI counts, media files, template slugs, template parts, `site_logo`, and portfolio thumbnail sources.
6. Verify the home footer and a project single page in the browser, with zero broken images or console errors attributable to the import.

### Task 7: Final regression and handoff

1. Re-run both repository test suites and syntax checks from clean worktrees.
2. Record exact deployment backups and verification evidence without credentials.
3. Curate `.claude/napkin.md` with only reusable guidance.
4. Present branch integration options using the finishing-a-development-branch workflow.
