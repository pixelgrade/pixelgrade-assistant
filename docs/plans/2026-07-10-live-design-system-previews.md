# Live Design System Previews Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task.

**Goal:** Render the three Pixelgrade Assistant Design System cards from the site's current saved Style Manager palette, canonical typography roles, and spacing settings while preserving independent PNG fallbacks.

**Architecture:** Style Manager publishes a capability-gated, versioned REST facade and advertises it through its existing Pixelgrade Assistant integration. Assistant fetches that contract lazily, validates every section, and renders responsive inline preview boards over the existing images. The two plugins share only the normalized schema and endpoint descriptor.

**Tech Stack:** WordPress REST API and hooks, PHP 8.1+, PHPUnit/Brain Monkey, React through `@wordpress/element`, `@wordpress/api-fetch`, Jest/jsdom, CSS container queries, `@wordpress/scripts`.

---

### Task 1: Pin the Style Manager response contract

**Files:**
- Create: `style-manager/tests/phpunit/Unit/Provider/DesignSystemPreviewEndpointTest.php`
- Create: `style-manager/src/Provider/DesignSystemPreviewEndpoint.php`

**Step 1: Write the failing tests**

Cover these externally observable behaviors through `get_payload()` and `check_permissions()`:

```php
public function test_payload_uses_canonical_typography_roles_and_normalized_spacing(): void {
	$payload = $this->create_endpoint()->get_payload();

	$this->assertSame( 1, $payload['schemaVersion'] );
	$this->assertSame( [ 'primary', 'body', 'secondary' ], array_column( $payload['typography']['roles'], 'id' ) );
	$this->assertSame( [ 0.25, 0.4, 0.5 ], array_column( $payload['spacing']['metrics'], 'normalized' ) );
}
```

Add focused tests for four representative palette grades, eight-grade sampling that retains the source grade and extremes, site-variation colors, nearest connected-field selection, master-font fallback, malformed/missing sections returning `null`, filtered font URLs, stable revision generation, and `edit_theme_options` permission.

**Step 2: Run the test and verify RED**

Run:

```bash
php vendor/bin/phpunit tests/phpunit/Unit/Provider/DesignSystemPreviewEndpointTest.php --colors=never
```

Expected: failure because `DesignSystemPreviewEndpoint` does not exist.

**Step 3: Implement the minimal provider**

Create an `AbstractHookProvider` with:

```php
final class DesignSystemPreviewEndpoint extends AbstractHookProvider {
	public const SCHEMA_VERSION = 1;
	public const REST_NAMESPACE = 'style_manager/v1';
	public const REST_PATH = '/design-system-preview';

	public function __construct( Options $options, Fonts $fonts, ?callable $palette_payload = null ) { /* inject */ }
	public function register_hooks() { $this->add_action( 'rest_api_init', 'register_routes' ); }
	public function check_permissions(): bool { return current_user_can( 'edit_theme_options' ); }
	public function handle_get() { return rest_ensure_response( $this->get_payload() ); }
	public function get_payload(): array { /* build three nullable sections + revision */ }
}
```

Use the first non-system palette, group repeated variations by the saved grade list, choose at most four representatives while retaining first/source/last, and normalize all color strings. Resolve `sm_font_primary`, `sm_font_body`, and `sm_font_secondary`; select the connected field whose `font_size` is closest to 64, 16, and 16 respectively. Return only safe CSS primitives. Read spacing ranges from option details and clamp normalization to 0–1.

**Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: all new tests pass.

**Step 5: Commit**

```bash
git add src/Provider/DesignSystemPreviewEndpoint.php tests/phpunit/Unit/Provider/DesignSystemPreviewEndpointTest.php
git commit -m "Add design system preview REST contract"
```

### Task 2: Wire Style Manager route discovery

**Files:**
- Modify: `style-manager/src/ServiceProvider.php`
- Modify: `style-manager/src/Plugin.php`
- Modify: `style-manager/src/Integration/PixelgradeAssistant.php`
- Modify: `style-manager/tests/phpunit/Unit/Integration/PixelgradeAssistantTest.php`

**Step 1: Write failing integration tests**

Assert that `register_hooks()` adds `pixassist_styles_data`, and that filtering a payload adds exactly:

```php
'designSystemPreview' => [
	'schemaVersion' => DesignSystemPreviewEndpoint::SCHEMA_VERSION,
	'path'          => '/' . DesignSystemPreviewEndpoint::REST_NAMESPACE . DesignSystemPreviewEndpoint::REST_PATH,
]
```

Also add a lightweight service/composition pin proving the endpoint service is registered outside `is_admin()`.

**Step 2: Verify RED**

Run the two focused test files. Expected: missing filter/descriptor assertions fail.

**Step 3: Wire the provider and adapter**

Register `provider.design_system_preview_endpoint` with `Options` and `Fonts`, compose it next to `provider.site_editor_endpoints`, and add the descriptor filter in `Integration\PixelgradeAssistant`. Return malformed non-array payloads unchanged.

**Step 4: Verify GREEN and commit**

Run focused tests, then:

```bash
git add src/ServiceProvider.php src/Plugin.php src/Integration/PixelgradeAssistant.php tests/phpunit/Unit/Integration/PixelgradeAssistantTest.php
git commit -m "Advertise the design preview contract to Assistant"
```

### Task 3: Pin Assistant's validator, font loader, and fetch lifecycle

**Files:**
- Create: `pixelgrade-assistant/admin/src-modern/hub/stylesPreviewData.js`
- Create: `pixelgrade-assistant/admin/src-modern/hub/stylesPreviewData.test.js`
- Modify: `pixelgrade-assistant/package.json`

**Step 1: Write failing Jest tests**

Define the desired public helpers:

```js
expect( normalizePreviewDescriptor( { schemaVersion: 1, path: '/style_manager/v1/design-system-preview' } ) )
	.toEqual( { schemaVersion: 1, path: '/style_manager/v1/design-system-preview' } );
expect( normalizePreviewPayload( completePayload ).typography.roles.map( ( role ) => role.id ) )
	.toEqual( [ 'primary', 'body', 'secondary' ] );
expect( normalizePreviewPayload( payloadWithBadSpacing ).spacing ).toBeNull();
expect( ensurePreviewFontStylesheets( [ 'javascript:alert(1)', validUrl ] ) ).toHaveLength( 1 );
```

Cover schema mismatch, bad colors, partial sections, safe CSS enum/numeric normalization, HTTP(S)-only URLs, stylesheet deduplication, and revision preservation.

**Step 2: Verify RED**

Add the test file to the npm test script and run it with `--runInBand`. Expected: module-not-found failure.

**Step 3: Implement minimal data helpers**

Import `apiFetch`, expose strict normalizers, and provide a request helper accepting an `AbortSignal`. Never throw for a malformed section; return that section as `null`. Throw only for a missing/unsupported descriptor or top-level response.

**Step 4: Verify GREEN and commit**

Run Jest, then commit the module, test, and package script.

### Task 4: Render real boards with independent fallbacks

**Files:**
- Create: `pixelgrade-assistant/admin/src-modern/hub/LiveStylePreview.js`
- Create: `pixelgrade-assistant/admin/src-modern/hub/LiveStylePreview.test.js`
- Modify: `pixelgrade-assistant/admin/src-modern/hub/tabs/Styles.js`
- Create: `pixelgrade-assistant/admin/css/styles-preview.css`
- Modify: `pixelgrade-assistant/admin/class-pixelgrade_assistant-admin.php`
- Modify: `pixelgrade-assistant/tests/admin-styles-test.php`

**Step 1: Write failing DOM and PHP tests**

Render `LiveStylePreview` into jsdom and assert:

- canonical labels `Primary`, `Body`, and `Secondary` appear;
- one concise dynamic `role="img"` label is exposed and descendants are hidden;
- the color board uses contract colors;
- spacing geometry uses normalized values;
- an invalid section returns no live board.

Extend `admin-styles-test.php` to require the local PNGs and the new preview stylesheet enqueue seam.

**Step 2: Verify RED**

Run focused Jest and PHP tests. Expected: missing component/style assertions fail.

**Step 3: Implement presentational renderers and CSS**

Create one board component with `colors`, `typography`, and `spacing` variants. Set contract values through scoped `--pxg-preview-*` custom properties, not global Style Manager tokens. Use `container-type: inline-size`, a rich default layout, and the validated compact layout under `@container (max-width: 260px)`. Preserve 16:9, hide visual descendants from accessibility APIs, and honor reduced motion.

Update `Styles.js` so every card renders its PNG fallback and overlays a live board only when its own section validates. Enqueue `admin/css/styles-preview.css` only on the Pixelgrade hub.

**Step 4: Verify GREEN and commit**

Run focused tests and `npm run build:modern`, then commit source, CSS, PHP, tests, and generated `admin/build/index*` artifacts.

### Task 5: Add mount/return refresh behavior

**Files:**
- Create: `pixelgrade-assistant/admin/src-modern/hub/useDesignSystemPreview.js`
- Create: `pixelgrade-assistant/admin/src-modern/hub/useDesignSystemPreview.test.js`
- Modify: `pixelgrade-assistant/admin/src-modern/hub/tabs/Styles.js`

**Step 1: Write failing lifecycle tests**

Render a harness using the hook and assert one initial request, no duplicate while in flight, refetch on `pageshow`, refetch when visibility returns to `visible`, short-window deduplication, preservation of last valid data after refresh failure, and abort on unmount.

**Step 2: Verify RED**

Run the focused test. Expected: missing hook failure.

**Step 3: Implement the hook**

Use `useCallback`, `useEffect`, `useRef`, and `useState`. Keep one in-flight promise/controller, a two-second dedupe timestamp, and the last valid payload. Do not surface enhancement failures as notices.

**Step 4: Verify GREEN and commit**

Run all Assistant Jest/PHP tests and rebuild the modern bundle before committing.

### Task 6: Runtime contract and browser verification

**Files:**
- Runtime mirrors only; no new source files expected.

**Step 1: Build both worktrees**

Run Style Manager's production compilation under Node 22 and Assistant's `npm run build:modern` under Node 20.

**Step 2: Mirror changed source/build files into** `/Users/georgeolaru/Studio/pixelgrade-integrated-check`

Preserve the Studio site's data and unrelated plugin files. Mirror only files changed by the feature branches.

**Step 3: Verify REST behavior**

Use authenticated `wp.apiFetch` in the browser to confirm schema v1, canonical role IDs, representative color samples, normalized spacing, and a 403-equivalent permission failure for an insufficient user.

**Step 4: Verify the UI**

At `admin.php?page=pixelgrade&tab=styles`, confirm all three boards use the current saved values, the DOM contains one request rather than three, the 230 px compact state has no overflow, the PNGs remain available, reduced-motion CSS exists, and returning after a saved Style Manager change refreshes the cards.

**Step 5: Capture evidence**

Save desktop and 230 px screenshots under `docs/issue-evidence/live-design-system-previews/` only if the repository convention permits committed evidence; otherwise use `/tmp` and report paths.

### Task 7: Final verification and integration

**Files:**
- Review every changed and generated artifact in both worktrees.

**Step 1: Run complete checks**

Assistant:

```bash
composer test
npm test -- --runInBand
npm run build:modern
```

Style Manager:

```bash
php vendor/bin/phpunit --testsuite=Unit --colors=never
composer phpcs
npm run compile:production
```

Account explicitly for the pre-existing `FontPalettesAccentTest` missing-`is_admin` harness error if it remains unchanged.

**Step 2: Review contract and security invariants**

Confirm the endpoint is read-only, requires `edit_theme_options`, exposes no option IDs/secrets, returns only safe display values, and does not add license/OAuth/WUpdates data to the Assistant payload.

**Step 3: Review git state**

Inspect `git diff --check`, `git status --short`, and each branch's commits. Confirm dependency installs did not change lockfiles or version files unexpectedly.

**Step 4: Integrate**

Use the finishing-a-development-branch workflow. Do not push or open a PR unless explicitly requested; preserve the user's no-PR default.
