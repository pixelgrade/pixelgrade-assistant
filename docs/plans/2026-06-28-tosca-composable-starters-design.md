# Tosca — Composable Starters: frames + content, one shared engine

Date: 2026-06-28
Status: Design agreed (brainstorm). Not implemented.
Repo: `pixelgrade-assistant`.
Extends: `.ai/starter-layouts/strategy/design.md` (Composable Starter Layouts, 2026-06-19) and the
Jun-28 `evaluation-layouts-tab-2026-06-28.md`. This resolves the two open gaps that eval named:
content/sections as the "missing middle", and the unstated Starter-Sites↔Layouts relationship.

## Vision

A "starter" stops being a whole-site bundle and becomes a **curated composition over a shared
catalog of reusable units** — applied by the import/journal/undo engine the plugin already has.

You author a rich design-system source site ("Tosca"): many **template variants per type** (e.g. 5
single-post designs, a vertical + a horizontal single-project) and a set of **content examples**
(an architecture-studio About page, food-recipe posts, portfolio projects). All of it surfaces in
**Pixelgrade Design**, where you — and end users — **mix and match frames with content** to create
starter content. Compositions are **saveable as recipes** that become Starter Site products.

We keep the cloud model. Source sites stay real WP sites in wp-admin; the SCE exporter stays the
publisher; Assistant stays the loader. We change **granularity + vocabulary**, not where things live.

## Locked decisions (this brainstorm)

1. **Two orthogonal axes.** Template (the *frame*) and content (the *substance*) are independent and
   crossed at compose time — not fused units. The same project content renders through either the
   vertical or the horizontal single-project frame.
2. **Content is a first-class catalog unit.** A Page/Post/Project/Product is individually browsable
   and importable, dependency-complete. Its design lives in its **blocks** (patterns), not its
   template. This is the "missing middle" the engine lacked.
3. **Shared engine, two doors.** One composition engine. You author the catalog *and* save
   compositions as **recipes** (products); customers apply a recipe whole *or* remix the same units.
   A recipe = a saved composition.
4. **One frame per type on a composed site.** No per-post Template assignment, no custom-template
   juggling. The blog has *a* single-post design; the portfolio has *a* single-project design. The
   multiplicity lives in the **catalog**, not on one live site.
5. **Variants are defined + offered through the starter-sites system.** Each frame declares a
   `type_group` (the slot) + a `variant_label` (a human name) in the export; the catalog groups
   siblings into one slot per type; recipes are the curation layer that pins one variant per slot.

## The model: two orthogonal axes

| Axis | WP entity | Authored in Tosca as | Where the design lives |
|---|---|---|---|
| **Frames** | `wp_template` + `wp_template_part` | N variants per type | the template (archives/loops/front-page) / a thin shell (singular) |
| **Content** | Page / Post / Project / Product | curated example entities | the **blocks inside them** (patterns) |

The asymmetry is the point: for **archives, blog home, front page** there is no per-entry content, so
the *template* carries the design. For **singular content** (page/post/project/product) the *blocks*
carry the design and the template is a thin frame. "Mix and match" is the **cross-product**: pick a
frame variant for a type × drop in content examples → preview the content through the chosen frame.

## Unit taxonomy

- **Frame — template** (`wp_template`): core slugs (`single`, `page`, `archive`, `front-page`,
  `home`, `index`, `search`, `404`) and per-type variants. Carries `type_group` + `variant_label`.
- **Frame — template part** (`wp_template_part`): `header`, `footer`. (Already a unit type.)
- **Content** (NEW first-class): a Page/Post/Project/Product as a real entity with curated blocks,
  **frame-agnostic**. Imports as a real local post; journalled; undo deletes it.
- **Feature** (CPT enablement + its templates/taxonomies): `portfolio`, etc. (Already a unit type.)
  **Resolved 2026-06-28:** enabling a CPT is a *capability*, not a layout, so it stops being a
  co-equal "Features" browse group and becomes an **implicit dependency** — a Project content unit (or
  any recipe using one) drags the Portfolio CPT exactly like a header drags its menu, resolved at
  apply time ("This starter adds the Projects content type — OK?"). Keep one **Setup** toggle for the
  power user who wants the content type without importing anything.
- **Look** (colors/fonts): optional, low-weight, never load-bearing. Units recolor to the site's
  existing palette via Style Manager + Nova contextual color. (Already the design philosophy.)
- **Recipe** (NEW): a thin manifest over the above — a *saved composition*.

## Define & offer (the variant mechanism)

**Authoring contract (kept deliberately thin).** Build N templates in the frame-library site; the
catalog needs two things, both derivable from native WordPress data first:

- **`type_group`** — the slot key (`single-post`, `single-project`, `blog-archive`, `page`, …).
  Derivation order: (1) the template's native **`post_types`** declaration (the Site Editor records
  what a custom template is *for*) + its archive/single role — the robust, no-convention signal;
  (2) slug parse for core slugs as fallback; (3) explicit export metadata only when a grouping the
  above can't express is needed.
- **`variant_label`** — a human name ("Magazine", "Split Header", "Minimal"). Free for the taking: the
  template **title**, which `buildTemplateTitles()` already extracts.

Net: variant authoring in one library site works with a **thin exporter pass-through** (`post_types`
+ title), not a heavy new contract.

**Offer at two levels:**

1. **Catalog (Layouts hub):** one browse section per `type_group` ("Single Post"), the variants as
   **sibling cards** inside it, one **Active** (the slot). This is where the current code is already
   heading — `getSectionKey()` splits one section per `wp_template` *slug* today
   (`LayoutUnits.js:348`); it moves to grouping by **`type_group`** so siblings share a section and a
   slot, with `variant_label` as the card title (`buildTemplateTitles()`/`getSectionLabel()` already
   name custom templates by authored title).
2. **Recipes (starter-sites layer):** a starter is a **curation** that pins one variant per slot + a
   content set. "Architecture Studio" = `single-project` *Horizontal* + 3 projects + an About page +
   header/footer. "Food Blog" = `single-post` *Magazine* + recipe posts. Different recipes showcase
   different variants — *that's* how all five single-post designs reach users; the hub then lets
   anyone swap a sibling in.

So the starter-sites system becomes a **recipe/curation layer over one shared unit catalog** — which
also answers the eval's "two tabs browse the same sources, nothing says which to use": Starter Sites
= "a whole look at once (a recipe)"; Layouts = "swap one piece (a unit)".

## Recipe schema (saved composition)

A recipe is delivered like today's `starterContent.demos` (Manager config, normalized through
`pixassist_get_admin_hub_starters()` / `pixassist_normalize_admin_hub_starters()`), extended with an
explicit composition:

```
recipe = {
  id, title, description, image, previewUrl, gate, order,   // existing starter descriptor fields
  frames: {                                                 // one variant per slot
    'header'         : { source, unit },
    'footer'         : { source, unit },
    'front-page'     : { source, unit },
    'blog-archive'   : { source, unit, variant_label },
    'single-post'    : { source, unit, variant_label },
    'single-project' : { source, unit, variant_label },
    ...
  },
  content: [                                                // frame-agnostic example entities
    { source, type: 'page',    unit: 'about',        role: 'about' },
    { source, type: 'project', unit: 'lakeside-house' },
    { source, type: 'post',    unit: 'lemon-tart' },
    ...
  ],
  look: { source } | null,                                  // optional palette/fonts
  requiredPlugins, segments                                 // reuse existing gating
}
```

- **Apply** = a sequence of unit imports (each already reversible + journalled): set frames into their
  slots, import content entities, optionally apply look.
- **Undo** = journal rollback per unit (existing machinery).
- **Save-as-recipe (round-trip)** = read the applied-units journal + the list of imported content,
  emit this manifest. The author's bench and the customer's apply path are the same engine.

**Relation to the shipped recipe primitive.** A recipe REST surface already exists — `recipes` /
`apply_recipe` / `undo_recipe` (Phase-5 capstone `807adec`), journalled under `recipe:<demo>`. But it
applies a **whole-source bundle** (a recipe ≈ one source's units), and its hub tab was retired (the
Jun-28 eval folds recipes into the Starter-Sites composer). This design **refines** that primitive
from *source-as-recipe* into a **curated composition**: a manifest that pins **one variant per slot**
(across sources) + **selects individual content examples** + optional look. The apply/undo machinery
is reused; what changes is the manifest's expressiveness (per-slot variant + content selection) and
its delivery as Manager-config Starter Site products.

## Composition engine — reuse, extend vocabulary

The foundation exists and is reused as-is:

- `import_layout_unit()` (`starter_content.php:3216`) → fetch a typed unit from a source's SCE REST →
  import onto the matching local WP entity → `record_applied_layout_unit()` journal → reversible undo.
- REST: `import_unit` / `queue_unit` / `unit_job_status` / `undo_unit` / `layout_units` /
  `prewarm_unit_bundles` (`pixassist/v1`, registered `starter_content.php:152-320`).
- Applied-units map keyed `"type:slug"` (`get_applied_layout_units()` `:327`).
- Record-level commerce classification already gates Product/woo content
  (`pixassist_starter_classify_post_record()`), so **Product** content units inherit the existing
  `woocommerce_integration` segment gate with no new policy.

**What's new in the engine:**

- A **content unit type** (`page`/`post`/`project`/`product`) addressable individually and
  dependency-complete (its featured image, inline media, referenced reusable patterns, terms).
  Today content imports only at whole-site scope; this makes a single entity an addressable unit.
- **`type_group` slotting**: the applied map gains a slot per `type_group` for frames so a sibling
  swap (Magazine → Minimal) replaces in-place (auto-undo of the prior occupant already exists for
  single-slot sections, `import_layout_unit()` :3284-3292).
- **Recipe apply/save** orchestration over the per-unit calls.

## Preview — the cross-product

The render route + recoloring iframe preview already exist (`LayoutPreview.js`, `My site` / `Demo
site` modes). Extensions:

- **Content × chosen frame.** Preview a content example rendered through the *currently-active* (or a
  hovered sibling) frame for its type — the honest "this is my recipe post in the Magazine layout".
- **Seed sparse My-site previews with the example content** (the eval's #1 leverage move): because
  content is now a catalog citizen, a frame preview can pull a representative example entity instead
  of rendering bare nav-on-white. One preview that is both honest and attractive.

## Exporter (SCE) — evolve, don't rewrite

The publishing work, evolving the existing typed exports:

- **Thin pass-through first** — surface each template's native **`post_types`** + title so the catalog
  can derive `type_group` + `variant_label` with no new authoring contract. This is all Phase 1 needs.
- Expose **individual content entities** (page/post/project/product) as addressable units, each
  **dependency-complete** (media, featured image, referenced patterns, terms) — Phase 2.
- Keep per-unit **dependency export** (the design's flagged hard part) — now also for content entities
  and their cross-source **media/term remap** on import.
- Explicit `type_group`/`variant_label` metadata only later, if native derivation proves insufficient.

## Source topology — pantries, not starters (resolved 2026-06-28)

A demo is no longer a sub-site exported wholesale. Sub-sites become **role-specialized ingredient
pantries**, and a recipe assembles **across** them:

- **One frame-library sub-site** — author all variant siblings together (the 5 single-post designs,
  vertical + horizontal single-project, the archives). One site is what makes them a *coherent family*
  (the "Magazine" single relates to the "Magazine" archive) instead of drifting across unrelated
  demos. This is the site the original "5 single-post templates" vision describes. ("Tosca" was just a
  placeholder name — any fresh sub-site on the starter multisite serves.)
- **Niche content sub-sites** — author content examples where they're authentic (a food site's recipe
  posts; an architecture site's About page + projects). Content is **frame-agnostic** (it carries only
  its blocks), so it doesn't matter that it was authored under that niche's own template.

The **content×frame cross-product never has to exist inside one authoring site** — it happens in the
Assistant hub preview (phase 3). That's what frees the model from a single mega-site. The **catalog is
the integration point**; recipes pin the frame-library's frames + a niche pantry's content.

**Authoring workflow:**
1. In the frame-library site, build template variants per type (native WP editing); the variant's
   `post_types` + title carry `type_group` + `variant_label` for free.
2. In niche sites, author content examples as designed pages/posts/projects/products.
3. SCE publishes each pantry's units; the catalog lists them across sources.
4. Compose in the hub: pin frames, import content, preview the cross-product.
5. **Save as recipe** → the manifest above → delivered as a Starter Site product via Manager config.
6. Customers see the recipe in Starter Sites (apply whole) and the units in Layouts (remix).

## Already built vs new

**Built (Phases 1–5 shipped):** reset-to-scratch (`eb63a35`); single-unit dependency-complete import
(`20df3f4`); cross-source mix-and-match + per-unit undo (`5a56ee7`); feature units / CPT enable
(`17a1d1f`); **source-as-recipe** apply/undo (`807adec`); queued+prewarmed apply; per-slug template
sections + custom-template titling + type sub-filters (`1f48f29`, `af6a4ad`, `042f8cb`); live
recoloring render previews with My-site/Demo modes; record-level commerce gating; starter
normalization + host-extension surface.

**New:** **content-as-unit** (export + import + dependency completeness) — the genuinely-missing
middle, deferred at Phase 6; **`type_group`/`variant_label`** grouping (siblings → one slot);
**curated-composition recipes** (per-slot variant + content selection) refining the shipped
source-as-recipe primitive + save round-trip; **content×frame preview** + example-seeded sparse
previews; exporter v3 per-entity + variant metadata.

## Phasing (default-first, value front-loaded)

Slots into the existing `.ai/starter-layouts/` phase plan; adds content + recipes.

1. **Catalog grouping by `type_group`.** Siblings share one slot/section; `variant_label` as card
   title. Small, builds directly on the recent commits. (Frames only; no exporter change if
   `type_group` is slug-derived initially.)
2. **Content as a unit.** Exporter exposes individual entities dependency-complete; importer imports
   one page/post/project; journalled + undo. Product reuses the commerce gate.
3. **Content × frame preview** + example-seeded sparse My-site previews (the honesty/appeal fix).
4. **Recipe manifest + apply.** A recipe pins frames + content; apply = unit sequence; undo = journal.
5. **Save-as-recipe round-trip** (authoring bench) + Manager delivery as products.
6. **Variant metadata in exporter v3** (`variant_label` authored, not slug-derived) once authoring at
   scale needs it.

## Resolved 2026-06-28 (was open)

- **Source topology** → **role-specialized pantries**: one frame-library sub-site for variant siblings
  + niche content sub-sites; recipes assemble across; no mega-site. (See Source topology.)
- **`type_group` derivation** → **native `post_types` first**, slug fallback, explicit metadata last.
  `variant_label` = template title.
- **"Features" placement** → **implicit dependency** of content/recipes, not a browse group; keep a
  Setup toggle.

## Remaining risks

- **Per-unit dependency export + cross-source media/term remap** — the genuine new engineering, now
  spanning content entities. The hard part, per the original design.
- **Site-Editor handoff.** After apply, invite the user into the Editor to refine (the eval's missing
  bridge) — keep the plugin journal and the Editor's notion of "applied" from drifting.
- **Content-unit pattern dependencies.** A content example's blocks may reference reusable patterns /
  synced patterns / media that must travel with it — the content analogue of "a header drags its menu."

## Out of scope (YAGNI)

- No per-post custom-template assignment / `_wp_page_template` carrying (dropped with "one frame per
  type").
- No move of authoring into the theme or Site Editor — sources stay real WP sites + SCE.
- No change to the `pixelgrade_assistant_plus_status` contract or the host-extension pin tests.
- No new gating policy — content Products reuse the existing `woocommerce_integration` segment gate.
