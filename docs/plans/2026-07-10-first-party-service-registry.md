# First-Party Service Registry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task.

**Goal:** Automatically retain the canonical URL and minimal stack context of sites using existing Pixelgrade services, with aggregate reporting and no separate client analytics beacon.

**Architecture:** Pixelgrade Assistant builds the canonical Cloud-compatible request envelope. Existing first-party endpoints relay an allowlisted copy to Pixelgrade Cloud, which upserts the site and records one daily aggregate per service. Existing functional responses remain independent from best-effort registry writes.

**Tech Stack:** WordPress PHP/REST/HTTP APIs, `$wpdb`/`dbDelta`, standalone PHP contract tests, Style Manager PHP client, legacy CMB2/DataTables Cloud admin UI.

---

### Task 1: Assistant service context

**Files:**
- Create: `includes/service-request-context.php`
- Modify: `pixelgrade-assistant.php`
- Modify: `admin/class-pixelgrade_assistant-admin.php`
- Modify: `admin/class-pixelgrade_assistant-help.php`
- Modify: `includes/admin-docs.php`
- Test: `tests/service-request-context-test.php`

1. Write a standalone failing test that expects a Cloud-compatible context with canonical URL, service, theme, WordPress, Assistant, environment, locale, RTL, and connected customer ID fields.
2. Run `/usr/local/bin/php tests/service-request-context-test.php`; expect the helper to be missing.
3. Implement `pixassist_get_service_request_context()` and `pixassist_add_service_request_context()` with an allowlisted, filterable payload.
4. Load the helper early and merge it into config and documentation requests with explicit observed-service names.
5. Re-run the focused test and the affected existing config/docs tests; expect PASS.

### Task 2: Style Manager context compatibility

**Files:**
- Modify: `../style-manager/src/Client/PixelgradeCloud.php`
- Modify: `../style-manager/tests/phpunit/Unit/Client/PixelgradeCloudTest.php`
- Test: `../style-manager/tests/service-request-context-contract.php`

1. Write a failing standalone contract asserting that design-asset requests name `design_assets_requested` and include environment/locale/RTL fields.
2. Run the standalone contract; expect missing fields.
3. Add the minimal fields to `get_site_data()` and the top-level service to design-asset and default stats payloads.
4. Re-run the contract; expect PASS. Run PHPUnit when dev dependencies are present.

### Task 3: Cloud registry persistence

**Files:**
- Modify: `/Users/georgeolaru/Developer/pixelgrade-cloud/includes/class-Pixcloud_RestApi_V1.php`
- Modify: `/Users/georgeolaru/Developer/pixelgrade-cloud/includes/lib/class-Pixcloud_Stats.php`
- Test: `/Users/georgeolaru/Developer/pixelgrade-cloud/tests/service-registry-contract.php`

1. Write a failing contract for the new schema columns, service normalization, endpoint parsing, and daily aggregation methods.
2. Run the contract; expect the registry fields/methods to be absent.
3. Bump the DB version; extend the sites table; add the daily service table and prepared aggregate queries.
4. Parse both the existing nested envelope and the new service field, save the site, increment its lifetime count, and upsert the daily service count.
5. Re-run the contract and existing Cloud contracts; expect PASS.

### Task 4: Cloud reporting

**Files:**
- Modify: `/Users/georgeolaru/Developer/pixelgrade-cloud/includes/class-Pixcloud_Settings.php`
- Modify: `/Users/georgeolaru/Developer/pixelgrade-cloud/assets/js/settings-page.js`
- Test: `/Users/georgeolaru/Developer/pixelgrade-cloud/tests/service-registry-contract.php`

1. Extend the failing contract to pin the Sites table columns and observed-service language.
2. Add recent total/new/active/returning metrics and a service-observation table to the Stats tab.
3. Add Last Service, Environment, Stack, and Requests to the Sites DataTable while preserving date ordering/filter behavior.
4. Re-run the Cloud contracts and PHP/JS syntax checks; expect PASS.

### Task 5: First-party relays

**Files:**
- Modify: `/Users/georgeolaru/Local Sites/pixelgrade/app/public/wp-content/plugins/pixcare-manager/includes/class-PixCareManager_REST_Controller_v2.php`
- Test: `/Users/georgeolaru/Local Sites/pixelgrade/app/public/wp-content/plugins/pixcare-manager/tests/service-registry-relay-test.php`
- Modify: `/Users/georgeolaru/Developer/starter_content_exporter/starter_content_exporter.php`
- Test: `/Users/georgeolaru/Developer/starter_content_exporter/tests/service-registry-relay-test.php`

1. Write failing standalone tests for strict allowlisting, URL validation, route-to-service naming, and non-blocking Cloud relay arguments.
2. Implement one best-effort relay helper in each server component.
3. Call the helper from config/docs and starter/layout/page endpoints using only requests they already receive.
4. Re-run both relay contracts and the exporter’s existing contracts; expect PASS.

### Task 6: Verification and disclosure boundary

**Files:**
- Modify: `.claude/napkin.md` only if a reusable project gotcha was learned (private overlay; do not commit).

1. Run all new standalone contracts with `/usr/local/bin/php`.
2. Run Assistant’s existing standalone suite individually with the working PHP binary; run focused Style Manager/Cloud/exporter tests.
3. Run `php -l` on every changed PHP file and a JS syntax check on the Cloud admin script.
4. Inspect diffs for secrets, raw request logging, content/user identity fields, IP storage, or behavioral claims.
5. Report changed repositories, verification evidence, and any deployment/migration requirement without publishing unless explicitly requested.
