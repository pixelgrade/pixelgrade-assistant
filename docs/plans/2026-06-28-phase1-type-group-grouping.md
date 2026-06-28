# Phase 1 — `type_group` catalog grouping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Group template *variant siblings* (e.g. `single` + `single-magazine`) under one "Single Post" section/slot in the Layouts catalog instead of one section per raw slug — the first build step of the composable-starters design (`docs/plans/2026-06-28-tosca-composable-starters-design.md`).

**Architecture:** Derive a `type_group` (the slot key) + `variant_label` (the card name) **server-side** on each `wp_template` unit descriptor, in both list paths, using the source's already-known CPTs so CPT-bound templates (`single-portfolio`) stay their own family. The React grid groups by `type_group`; the apply path keys the single-slot on `type_group` so applying one variant replaces its sibling ("one frame per type").

**Tech Stack:** PHP (no namespace; WP plugin), PHPUnit via `composer test`, React + `@wordpress/components` (built with the existing rollup/`npm run dev` pipeline), localized JS global `pixelgradeLayoutUnits`.

---

## Context the executor needs (read first)

- **Design + decisions:** `docs/plans/2026-06-28-tosca-composable-starters-design.md` (§"Define & offer", §"Source topology"). Locked: one frame per type on a live site; `type_group` from native `post_types` *later*, **slug+CPT derivation now**; `variant_label` = template title.
- **Server unit list:** `admin/class-pixelgrade_assistant-starter_content.php`
  - `list_layout_units()` `:1450` — dynamic path; builds descriptors at **`:1496-1502`** (`id/type/slug/title`).
  - `fetch_layout_source_unit_list()` `:5490` + `normalize_layout_source_units()` `:5656` — the compact fast path that **short-circuits before** the dynamic build; descriptors must be decorated here too.
  - `list_layout_feature_units()` `:1637` — reads `$source_data['post_types']` (the source's CPTs that have content) and the `$features` map (`:~1670`, defines `post_type`, `taxonomies`, `template_slugs`). This is where the **known-CPT list** comes from.
  - Apply path: `import_layout_unit()` `:3216` (auto-undo of the existing slot occupant `:3284-3292`); `record_applied_layout_unit()` `:~6759` (computes the slot key + journal); `get_applied_layout_units()` `:327` (returns the `"type:slug"` applied map localized to the grid).
- **React grid:** `admin/src-modern/hub/tabs/LayoutUnits.js`
  - Section/group helpers **`:224-465`** — `getGroupKey` (`:~224`), `getSectionKey` (`:348`, returns `template:<slug>`), `getTemplateSectionSlug` (`:356`), `isSingleSlotSection` (`:360`), `getSectionLabel` (`:407`), `getSingleSlotKey` (`:428`), `buildTemplateTitles` (`:387`), `TEMPLATE_SLUG_LABELS` (`:321`), `TEMPLATE_SLUG_ORDER` (`:336`).
  - Filter: `filterUnits()` `:275-310` (type filter keys on `getSectionKey`/`getGroupKey`). Type options: `typeOptions` in `LayoutToolbar` `:912`.
- **DO NOT TOUCH the uncommitted WIP** (preferences persistence in `LayoutUnits.js`, preview taming in `starter_content.php`, `LayoutPreview.js`, `preferences.js`, `composer.json`). This plan adds new code paths around them. Before committing each task, `git add` only the specific files this plan changes — never `git add -A` (it would sweep in the maintainer's WIP + rebuild the bundle with it).
- **Boundary:** NO exporter / remote-source change in Phase 1. Derivation is local.

### A note on testing reality
The PHP derivation logic is pure → real TDD (`composer test`). The React grouping has **no JS test harness** in this repo → verify by build + live check on `pixelgrade-integrated-check` (see Task 7). To see sibling grouping live you must first create a sibling template (Task 6 fixture).

---

## Task 1: `type_group` derivation helper (pure, TDD)

**Files:**
- Modify: `admin/class-pixelgrade_assistant-starter_content.php` (add two public methods near the other layout-unit helpers, e.g. after `list_layout_feature_units()` `:1683`)
- Test: `tests/layout-unit-type-group-test.php` (new)

**Step 1: Write the failing test**

```php
<?php
// tests/layout-unit-type-group-test.php
// Pure unit test for layout_unit_type_group() / layout_unit_variant_label().
// Run standalone like the other contract tests (no WP bootstrap needed if the methods are pure;
// if the class can't load without WP, extract the two methods' logic into the test via a thin
// require + stubs for sanitize_key/wp_strip_all_tags/ucwords — mirror tests/starter-segments-test.php).

require_once __DIR__ . '/_stubs.php'; // sanitize_key, wp_strip_all_tags if not defined (see existing tests)

$sc = pixassist_test_starter_content_instance(); // helper used by sibling tests; reuse the pattern

$cpts = array( 'portfolio', 'product' );
$tax  = array( 'portfolio_type' );

// Core slugs are their own family.
assert( 'single'      === $sc->layout_unit_type_group( 'single', $cpts, $tax ) );
assert( 'page'        === $sc->layout_unit_type_group( 'page', $cpts, $tax ) );
assert( 'front-page'  === $sc->layout_unit_type_group( 'front-page', $cpts, $tax ) );
assert( 'archive'     === $sc->layout_unit_type_group( 'archive', $cpts, $tax ) );

// Variants of a core slug collapse to the core family.
assert( 'single'  === $sc->layout_unit_type_group( 'single-magazine', $cpts, $tax ) );
assert( 'single'  === $sc->layout_unit_type_group( 'single-split-header', $cpts, $tax ) );
assert( 'archive' === $sc->layout_unit_type_group( 'archive-wide', $cpts, $tax ) );

// CPT-bound templates stay their own family (NO merge into single/archive).
assert( 'single-portfolio'  === $sc->layout_unit_type_group( 'single-portfolio', $cpts, $tax ) );
assert( 'single-portfolio'  === $sc->layout_unit_type_group( 'single-portfolio-vertical', $cpts, $tax ) );
assert( 'archive-portfolio' === $sc->layout_unit_type_group( 'archive-portfolio', $cpts, $tax ) );
assert( 'taxonomy-portfolio_type' === $sc->layout_unit_type_group( 'taxonomy-portfolio_type', $cpts, $tax ) );

// Unknown custom template → its own family.
assert( 'landing' === $sc->layout_unit_type_group( 'landing', $cpts, $tax ) );

// variant_label: title wins when it adds info; else title-cased slug.
assert( 'Magazine' === $sc->layout_unit_variant_label( 'single-magazine', 'Magazine' ) );
assert( 'Single Magazine' === $sc->layout_unit_variant_label( 'single-magazine', '' ) );

echo "layout_unit_type_group OK\n";
```

**Step 2: Run it to verify it fails**

Run: `php tests/layout-unit-type-group-test.php`
Expected: fatal/`assert` failure — methods don't exist yet. (If the class won't load without WP, first mirror the bootstrap/stub pattern of `tests/starter-segments-test.php`; confirm THAT test runs, then model this one on it.)

**Step 3: Implement the two methods**

```php
/**
 * Derive the catalog "type group" (slot key) for a wp_template slug. CPT/taxonomy-bound templates
 * stay their own family; variants of a core slug collapse to that core. Slug+CPT derivation only —
 * native post_types is a later enhancement.
 *
 * @param string $slug             Template slug (post_name).
 * @param array  $known_cpts       CPT slugs that exist for this source.
 * @param array  $known_taxonomies Taxonomy slugs that exist for this source.
 * @return string Type-group key (e.g. `single`, `single-portfolio`, `archive`, `page`).
 */
public function layout_unit_type_group( $slug, $known_cpts = array(), $known_taxonomies = array() ) {
	$slug = sanitize_key( $slug );
	if ( '' === $slug ) {
		return '';
	}

	$core = array( 'front-page', 'home', 'index', 'archive', 'single', 'singular', 'page', 'search', '404', 'privacy-policy' );
	if ( in_array( $slug, $core, true ) ) {
		return $slug;
	}

	foreach ( array( 'single', 'archive' ) as $prefix ) {
		if ( 0 === strpos( $slug, $prefix . '-' ) ) {
			$rest = substr( $slug, strlen( $prefix ) + 1 );
			$cpt  = $this->match_known_token( $rest, $known_cpts );
			if ( '' !== $cpt ) {
				return $prefix . '-' . $cpt; // CPT family, e.g. single-portfolio
			}
			return $prefix; // a variant of the core single / archive
		}
	}

	if ( 0 === strpos( $slug, 'taxonomy-' ) ) {
		$tax = $this->match_known_token( substr( $slug, strlen( 'taxonomy-' ) ), $known_taxonomies );
		return '' !== $tax ? 'taxonomy-' . $tax : 'taxonomy';
	}

	if ( 0 === strpos( $slug, 'page-' ) ) {
		return 'page';
	}

	return $slug; // unknown custom template — its own family
}

/**
 * Longest known token that `$rest` equals or begins with (token or "token-..."). Longest wins so
 * `portfolio_type` matches before `portfolio`.
 */
private function match_known_token( $rest, $tokens ) {
	$rest  = sanitize_key( $rest );
	$match = '';
	foreach ( (array) $tokens as $token ) {
		$token = sanitize_key( $token );
		if ( '' === $token ) {
			continue;
		}
		if ( $rest === $token || 0 === strpos( $rest, $token . '-' ) ) {
			if ( strlen( $token ) > strlen( $match ) ) {
				$match = $token;
			}
		}
	}
	return $match;
}

/**
 * Human label for a template variant card. The authored title when it adds info beyond the slug,
 * else a title-cased slug.
 */
public function layout_unit_variant_label( $slug, $title ) {
	$slug  = sanitize_key( $slug );
	$title = wp_strip_all_tags( (string) $title );
	if ( '' !== $title && strtolower( $title ) !== strtolower( str_replace( array( '-', '_' ), ' ', $slug ) ) && strtolower( $title ) !== strtolower( $slug ) ) {
		return $title;
	}
	return ucwords( str_replace( array( '-', '_' ), ' ', $slug ) );
}
```

**Step 4: Run the test to verify it passes**

Run: `php tests/layout-unit-type-group-test.php` → `layout_unit_type_group OK`
Then: `php -l admin/class-pixelgrade_assistant-starter_content.php` → "No syntax errors".

**Step 5: Commit**

```bash
git add admin/class-pixelgrade_assistant-starter_content.php tests/layout-unit-type-group-test.php
git commit -m "Layouts: type_group + variant_label derivation helper (slug+CPT)"
```

---

## Task 2: Decorate unit descriptors in BOTH list paths

**Files:**
- Modify: `admin/class-pixelgrade_assistant-starter_content.php` — `list_layout_units()` `:1496-1517`; `normalize_layout_source_units()` `:5656`.
- Test: extend `tests/layout-unit-type-group-test.php` with a decorate-array case.

**Step 1: Add a decorate helper + failing test**

Test addition:
```php
$units = array(
	array( 'id' => 1, 'type' => 'wp_template', 'slug' => 'single', 'title' => 'Single' ),
	array( 'id' => 2, 'type' => 'wp_template', 'slug' => 'single-magazine', 'title' => 'Magazine' ),
	array( 'id' => 3, 'type' => 'wp_template_part', 'slug' => 'header', 'title' => 'Header' ),
);
$out = $sc->decorate_layout_units_with_type_group( $units, array( 'portfolio' ), array() );
assert( 'single' === $out[0]['type_group'] && 'single' === $out[1]['type_group'] );
assert( 'Magazine' === $out[1]['variant_label'] );
assert( ! isset( $out[2]['type_group'] ) ); // parts untouched (grouped by getGroupKey on the client)
echo "decorate OK\n";
```

**Step 2: Run → fails** (`decorate_layout_units_with_type_group` undefined).

**Step 3: Implement the helper + wire both paths**

```php
/**
 * Add type_group + variant_label to every wp_template unit (parts/features pass through unchanged).
 */
public function decorate_layout_units_with_type_group( $units, $known_cpts = array(), $known_taxonomies = array() ) {
	foreach ( $units as $i => $unit ) {
		if ( empty( $unit['type'] ) || 'wp_template' !== $unit['type'] || empty( $unit['slug'] ) ) {
			continue;
		}
		$units[ $i ]['type_group']    = $this->layout_unit_type_group( $unit['slug'], $known_cpts, $known_taxonomies );
		$units[ $i ]['variant_label'] = $this->layout_unit_variant_label( $unit['slug'], isset( $unit['title'] ) ? $unit['title'] : '' );
	}
	return $units;
}

/** Known CPT + taxonomy slugs for a source, from its feature map + its post_types data. */
private function known_source_content_types( $source_data ) {
	$features = apply_filters( 'pixassist_layout_feature_units', $this->get_layout_feature_definitions() ); // or however $features is obtained at :~1670
	$cpts = array();
	$tax  = array();
	foreach ( (array) $features as $feature ) {
		if ( ! empty( $feature['post_type'] ) ) {
			$cpts[] = $feature['post_type'];
		}
		foreach ( (array) ( isset( $feature['taxonomies'] ) ? $feature['taxonomies'] : array() ) as $t ) {
			$tax[] = $t;
		}
	}
	if ( ! empty( $source_data['post_types'] ) && is_array( $source_data['post_types'] ) ) {
		$cpts = array_merge( $cpts, array_keys( $source_data['post_types'] ) );
	}
	return array( array_values( array_unique( $cpts ) ), array_values( array_unique( $tax ) ) );
}
```

> EXECUTOR: read `:1637-1683` to see exactly how the `$features` array is obtained and adapt `known_source_content_types()` to reuse that source — do not invent `get_layout_feature_definitions()` if the array is inline; factor it out or read it the same way `list_layout_feature_units()` does.

Wire the **dynamic path** — in `list_layout_units()`, after the feature merge (`:1508`), before `return`:
```php
list( $known_cpts, $known_tax ) = $this->known_source_content_types( isset( $source_data ) && ! is_wp_error( $source_data ) ? $source_data : array() );
$units = $this->decorate_layout_units_with_type_group( $units, $known_cpts, $known_tax );
```

Wire the **compact path** — at the end of `normalize_layout_source_units()` (`:5656`), decorate before returning. If the source data isn't fetched there, pass `array(), array()` (slug-only derivation still works for core + variant collapse; CPT separation degrades to "kept as own family", which is safe — no wrong merge).

**Step 4: Run** `php tests/layout-unit-type-group-test.php` → both `OK`; `php -l` clean.

**Step 5: Commit**
```bash
git add admin/class-pixelgrade_assistant-starter_content.php tests/layout-unit-type-group-test.php
git commit -m "Layouts: emit type_group + variant_label on unit descriptors (both list paths)"
```

---

## Task 3: React grid groups by `type_group`

**Files:**
- Modify: `admin/src-modern/hub/tabs/LayoutUnits.js` (`:224-465`).

**Step 1: Add a `getTypeGroup` accessor with a slug fallback**

```js
// The server sends unit.type_group for wp_template units. Fall back to the raw slug so the grid
// still works against an un-upgraded source (and for parts/features, which have no type_group).
function getTypeGroup( unit ) {
	if ( 'wp_template' === unit.type ) {
		return unit.type_group || unit.slug || '';
	}
	return '';
}
```

**Step 2: Route sectioning through it**

- `getSectionKey()` (`:348`): `return TEMPLATE_SECTION_PREFIX + getTypeGroup( unit );`
- `getSingleSlotKey()` (`:428`): template branch returns `'wp_template:' + getTemplateSectionSlug( sectionKey )` — keep, since the section slug is now the type_group.
- **Card label:** wherever a card renders its title for `wp_template`, prefer `unit.variant_label || unit.title || titleCaseSlug(unit.slug)`. (Find the card title render; today it uses `unit.title`.)
- **Section label** (`getSectionLabel` `:407` + `TEMPLATE_SLUG_LABELS` `:321`): the section key is now a type_group. Extend `TEMPLATE_SLUG_LABELS` with CPT families (`'single-portfolio': 'Single Project'`, `'archive-portfolio': 'Projects Archive'`, etc.); the existing custom-title fallback (`buildTemplateTitles`) still covers unknown groups. Keep `TEMPLATE_SLUG_ORDER` for ordering (add the CPT families).

**Step 3: Build + eyeball** (no JS unit test) — see Task 7. Expected: a source with `single` + `single-magazine` shows ONE "Single Post" section with two cards; `single-portfolio` remains its own "Single Project" section.

**Step 4: Commit** (after Task 7 build) — grouped with Task 4.

---

## Task 4: Type filter + ordering by `type_group`

**Files:** `admin/src-modern/hub/tabs/LayoutUnits.js` — `filterUnits()` `:275-310`, `typeOptions` `:912`.

**Step 1:** `filterUnits` already compares `getSectionKey(unit) === typeFilter` for template sections — since `getSectionKey` now returns the type_group, this Just Works. Verify the `TEMPLATE_SECTION_PREFIX` branch still matches.

**Step 2:** `typeOptions` (`:912`): build the template options from the **distinct `type_group`s present** (not raw slugs), labelled via `getSectionLabel`. Result: the Type dropdown shows "Single Post" once, not five entries.

**Step 3:** Commit with Task 3 after the build verifies (Task 7).

---

## Task 5: One frame per type — slot key = `type_group` (apply/replace)

> This makes applying `single-minimal` auto-undo `single-magazine` (they share the `single` slot), enforcing "one frame per type". Without it, two siblings could both read "Active".

**Files:** `admin/class-pixelgrade_assistant-starter_content.php` — `record_applied_layout_unit()` `:~6759` (slot computation), `import_layout_unit()` auto-undo `:3284-3292`, `get_applied_layout_units()` `:327`.

**Step 1:** READ `record_applied_layout_unit()` and find where the slot key is computed for `wp_template` (today effectively `wp_template:<slug>`). Change it to `wp_template:<type_group>` using `layout_unit_type_group()` (derive known CPTs the same way Task 2 does, from the demo's source data, or store the type_group on the unit when applying and reuse it).

**Step 2:** Ensure the auto-undo-existing-occupant logic (`:3284-3292`) looks up the slot by `type_group` so a sibling is replaced, and that `get_applied_layout_units()` keys the localized applied map by the same slot so the grid's "Active/Replace" caption (`getGroupActiveSummary` `:450`) lands on the whole section.

**Step 3:** Extend a PHP test (or add `tests/layout-unit-slot-test.php`) asserting two same-`type_group` units resolve to the same slot key. Run `composer test` — expect green (and the existing mix-and-match/recipe contracts still pass).

**Step 4: Commit**
```bash
git add admin/class-pixelgrade_assistant-starter_content.php tests/layout-unit-slot-test.php
git commit -m "Layouts: key the template slot on type_group (one frame per type, replace siblings)"
```

---

## Task 6: Test fixture — a second single-post template

To see grouping live you need a source exposing two single-post templates. On the **frame-library** authoring site (or, for a quick local check, any allowed demo source), add a custom template:

- Site Editor → Templates → Add New → choose a **custom** template (arbitrary name e.g. "Magazine"), give it distinct blocks, save. It becomes `wp_template` slug `magazine` or `single-magazine` depending on how it's created — for this test name it `single-magazine` (so slug-derivation files it under `single`). Confirm via `wp post list --post_type=wp_template --fields=post_name,post_title`.
- Re-export so the source's `/posts` returns it (the SCE exporter must include the new template — verify the demo's `wp_template` post list includes it).

Document in the plan run-notes which source you used.

---

## Task 7: Build, live-verify, commit the React changes

**Step 1: Build only the hub bundle (clean of the maintainer's WIP).**
Per the memory note [Commit amid parallel WIP]: stash the maintainer's source WIP, build clean, commit only this plan's files, restore, rebuild. Concretely:
```bash
git stash push -- admin/src-modern/hub/tabs/LayoutUnits.js admin/src-modern/hub/LayoutPreview.js admin/src-modern/hub/preferences.js admin/class-pixelgrade_assistant-starter_content.php
# re-apply ONLY this plan's LayoutUnits.js edits (re-do them, or stash-pop selectively) — see note
npm run dev
git add admin/src-modern/hub/tabs/LayoutUnits.js admin/build/index.js admin/build/index.asset.php
git commit -m "Layouts: group template variants by type_group in the grid"
```
> The clean-build dance is fiddly with overlapping WIP in the SAME file (`LayoutUnits.js`). SIMPLER, RECOMMENDED: coordinate with the maintainer to land their preferences WIP first (it's nearly done), then this plan edits a clean file and the bundle commit is trivial. Confirm before doing the stash dance.

**Step 2: Live-verify on `pixelgrade-integrated-check`** (the Assistant-active site; `style-manager.local` has Care active and the hub is dormant):
```bash
studio site start --path /Users/georgeolaru/Studio/pixelgrade-integrated-check --skip-browser
```
Open `http://localhost:8889/studio-auto-login?redirect_to=%2Fwp-admin%2Fadmin.php%3Fpage%3Dpixelgrade` → Layouts tab. Confirm:
- A source with two single-post templates shows ONE "Single Post" section, two variant cards (labelled by title).
- `single-portfolio` stays a separate "Single Project" section (no wrong merge).
- The Type dropdown lists "Single Post" once.
- Applying variant B when A is active replaces A (one Active card), and Remove still works.
- The starter-segments / commerce gating and existing apply/undo are unaffected.

**Step 3: Final verification**
```bash
composer test          # all contracts green (status, segments, host-surface, + new type_group/slot)
php -l admin/class-pixelgrade_assistant-starter_content.php
```

---

## Verification checklist (definition of done)

- [ ] `php tests/layout-unit-type-group-test.php` passes; `composer test` green.
- [ ] `single` + `single-magazine` group into one "Single Post" slot; `single-portfolio` stays separate.
- [ ] Variant cards labelled by `variant_label` (title); section labelled by friendly type_group name.
- [ ] Applying a sibling replaces the prior one (one frame per type); Remove/undo intact.
- [ ] Bundle rebuilt WITHOUT sweeping in the maintainer's WIP; only this plan's files committed.
- [ ] No change to the exporter / remote source; no change to `plus_status` / host-surface contracts.

## Out of scope (later phases)
- Native `post_types`-based derivation (exporter pass-through) — Phase-1 stays slug+CPT.
- Content-as-unit, content×frame preview, curated recipes — Phases 2–5 of the design doc.
- Per-entry custom-template assignment — explicitly YAGNI'd ("one frame per type").

## Execution handoff
After review, two options:
1. **Subagent-Driven (this session)** — REQUIRED SUB-SKILL `superpowers:subagent-driven-development`: fresh subagent per task + code review between tasks.
2. **Parallel Session** — new session in a worktree, REQUIRED SUB-SKILL `superpowers:executing-plans`, batch with checkpoints.
