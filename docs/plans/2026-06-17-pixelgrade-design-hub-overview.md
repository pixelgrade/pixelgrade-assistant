# Pixelgrade Design — hub label + Overview redesign

Date: 2026-06-17
Status: Design agreed (brainstorm). Not implemented.
Repo: `pixelgrade-assistant` (the host owns the admin menu and the Overview tab).
Follow-up to: `pixelgrade-plus/docs/plans/2026-06-16-plus-admin-placement-design.md`
(the 0.9.0 Assistant-as-host admin-placement effort).

## Why

The 0.9.0 work moved the Pixelgrade presence from a top-level branded menu to a
tabbed React hub at **Appearance → Pixelgrade**, with the Assistant as host and Plus
injecting gated tabs. Two things that move did not resolve:

1. **A bare brand word among functional siblings.** Under Appearance the neighbours are
   *Themes, Editor, Customize, Fonts, Menus, Widgets* — every one says what it *does*.
   "Pixelgrade" says who *made* it, so a scanning user learns nothing about what it is
   until they click.
2. **The hub does not explain the stack.** The Overview today renders a theme-status
   card + quick links + a Plus card. There is no orientation — nothing that says what
   the Pixelgrade design system is or why this hub exists.

This was reviewed against a competitive pass (Shopify, Squarespace, WordPress.com, Wix,
Webflow, Figma, and WP-native plugins). The recurring native pattern: a **branded hub
for identity/orientation/account**, with the **actual design editing kept in the host's
native styling surface**. Pixelgrade already satisfies the second half — Style Manager
lives in the **Site Editor → Styles** slot — so the hub does not need to be the design
surface. It can be the orientation surface, which is exactly what fixes both problems
above.

## Decisions

- **Role:** the hub is a **branded orientation hub** — explain the stack, surface
  account/license/docs/plugins/starter-sites, and route *out* to where work happens
  (Site Editor → Styles). It does not own the design editing.
- **Menu label:** `Pixelgrade` → **"Pixelgrade Design"**.
- **Overview framing:** **value-level, not mechanism-level.** Lead with the design-system
  idea; do not expose the internal layer model (Style Manager → Nova Blocks → Anima) or
  Color Signal on the landing — those belong in Style Manager and the docs.
- **Persistence:** **always-on, compact.** One permanent intro line; no dismissal state.
- **Theme card:** show the client's **starter identity** (e.g. "Rosa"), modernised beyond
  Care (option B below).

## Spec

### 1. Menu label

`PixelgradeCare`-equivalent registration in `admin/class-pixelgrade_assistant-admin.php`
→ `add_pixelgrade_assistant_menu()`:

- `menu_title` and `page_title`: `Pixelgrade` → **`Pixelgrade Design`** (translatable string).
- **Slug stays `pixelgrade`** — `themes.php?page=pixelgrade` and the Plus-injected tab
  deep-links (`&tab=account-license`, `&tab=tools`, …) are unaffected. Pure label change,
  zero routing impact.
- Align the React hub header (`admin/src-modern/hub/App.js`) to read the same as the menu
  label so the sidebar and the page heading agree.
- Update the title assertion in `tests/admin-menu-retirement-test.php` (it still pins the
  important invariant: submenu under `themes.php`, slug `pixelgrade`, no top-level menu).

### 2. Overview content model

File: `admin/src-modern/hub/tabs/Overview.js` (presentational; reads
`window.pixelgradeOverview` from `pixassist_get_overview_data()`). Top-to-bottom:

1. **Orientation lead** — *always on*, static JS `__()` strings (product chrome, not data):

   > **Pixelgrade turns your site into a complete design system.** Set your colors, fonts,
   > spacing, and motion once — and your whole site follows.

   No theme proper-noun (the theme name is variable per client — see §3). No Color Signal.

2. **Three value areas** — each doubles as a route out. Labels and URLs stay server-driven
   in the existing link list (so availability is server-decided, canvas link first):
   - **A design system you control** — colors, fonts, spacing, motion live in Style Manager;
     change them once and the theme and blocks update together. → **Edit Styles**
     (Site Editor → Styles).
   - **A head start** — launch from a **starter site** and build pages from ready-made
     **patterns** instead of a blank canvas. → **Browse Starter Sites**.
   - **Help when you need it** — docs and guidance, built in. → **Get Help**.

3. **Theme card** — *demoted* below the orientation. See §3.

4. **Plus card** — unchanged (discover / activate / manage across the 4-key states).

### 3. Theme card — starter identity (option B)

Background (how Care does it — confirmed in the Care codebase): on disk the theme is
**always Anima** (`style.css` says `Theme Name: Anima`; Anima ships its own screenshot;
no file is ever rewritten). Care swaps only the **displayed name** at runtime via a
`wp_prepare_themes_for_js` filter, rendering **"Rosa *(Anima)*"**. The "Rosa" string is
the license `main_product_title` (cloud-sourced, stored in the `pixcare_license` theme
mod). Care does **not** swap the thumbnail — the active theme keeps Anima's generic
screenshot; the starter image only appears in Care's "Club" catalog.

The hub modernises this (**option B**):

- **Title:** clean **"Rosa"** (the starter / `main_product_title`).
- **Secondary:** quiet **"on Anima"** (engine), plus block/classic badge + version.
- **Thumbnail:** the **starter image** (net-new vs Care; the cloud already has the product
  image).
- **Fallback:** when there is no starter identity (free/unlicensed, disconnected, or
  offline), fall back to the **real theme — Anima + its own screenshot**. Degrade
  gracefully; never show a broken image or an empty title.

## Data flow

- `Overview.js` stays presentational. All *data* (theme, account, plus state, link list +
  which links exist) remains server-driven via `pixassist_get_overview_data()`.
- Orientation copy (lead + value-area labels owned by us) lives as static `__()` strings.
- The **starter identity** (title + image URL) must be added to the Overview payload.

## Open flags (resolve at implementation)

- **Starter identity source.** Confirm where `main_product_title` and the starter image
  URL come from in the Assistant/Plus split (host pixelgrade.com account vs Plus license
  data) and ensure both reach the Overview payload. In Care both came from the license;
  in the new model the host account is the more natural owner since the free Overview must
  render without Plus. Decide + wire the accessor; keep the graceful Anima fallback.
- **Motion vs entitlement.** Nova Blocks motion is a Plus entitlement (0.8.0 entitlement
  bridge, #52). "motion" in the free headline describes the *scope of the system*, not a
  free guarantee; the Plus card carries the upsell. Make sure the copy does not read as a
  free promise.
- **Descriptor word.** "Design" in "Pixelgrade Design" is the working choice; revisit only
  if a sharper word emerges during copy review.

## Out of scope (YAGNI)

- No menu re-plumbing — stays a submenu under `themes.php`.
- No change to the design-editing surface — Style Manager stays in Site Editor → Styles.
- No dismissal / per-user state machinery (always-on compact instead).
- No change to the `pixelgrade_assistant_plus_status` 4-key contract — the pin tests in
  both repos stay untouched (see `pixelgrade-plus/docs/architecture/plus-assistant-contract.md`).

## Verification

- **Pin tests:** status-contract tests untouched; update the menu-title assertion in
  `tests/admin-menu-retirement-test.php`.
- **Build:** `@wordpress/scripts` rebuild of the hub bundle.
- **Live check — caveat:** `style-manager.local` has Care active, so the Assistant hub is
  dormant there. Verify on an **Assistant-active** site (e.g. `pix-assistant.local`):
  Appearance reads "Pixelgrade Design"; Overview leads with the orientation line; the three
  value areas route correctly (Edit Styles lands in Site Editor → Styles); the theme card
  shows the starter identity for a licensed site and falls back to Anima otherwise.
- **i18n:** new strings wrapped in `__()`; `.pot` regenerated.
