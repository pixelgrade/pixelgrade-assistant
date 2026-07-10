# Live Design System Previews — Design

## Outcome

The Colors, Typography, and Spacing cards on Pixelgrade Assistant's Design System tab render compact previews from the site's current saved Style Manager design system. The cards do not embed the frontend, parse generated CSS, or read Style Manager options directly. Style Manager owns the data model and publishes a small normalized contract; Assistant owns the card presentation.

"Live" means the latest saved state when the tab mounts or becomes visible again. Unsaved Customizer or Site Editor changes in another tab are intentionally outside this contract.

## Ownership boundary

Style Manager owns palette generation, canonical font roles, connected-field diffusion, font resources, and spacing ranges. It exposes `GET /style_manager/v1/design-system-preview`, protected by the same `edit_theme_options` capability as the Design System tab. Its existing `Integration\PixelgradeAssistant` adapter adds a small descriptor to the `pixassist_styles_data` payload:

```json
{
  "designSystemPreview": {
    "schemaVersion": 1,
    "path": "/style_manager/v1/design-system-preview"
  }
}
```

Assistant only knows this descriptor and the versioned response shape. It never reads `sm_*` options, palette arrays, theme connected-field IDs, or `--theme-*` CSS. Older or absent Style Manager versions simply do not contribute the descriptor, leaving the existing PNG previews untouched.

## Contract

The response contains `schemaVersion`, a content `revision`, and three independently valid sections:

- `colors`: the first user palette, its current site variation, and up to four representative light-to-deep samples. Each sample contains its server-owned label, source marker, surface, text, muted text, and accent colors.
- `typography`: the canonical `Primary`, `Body`, and `Secondary` roles. Each role contains a family, safe generic fallback, representative resolved weight/style/spacing/transform/line-height, selected internally from the connected field nearest the preview's target size. No connected-field ID is exposed.
- `spacing`: `Container`, `Inset`, and `Rhythm` metrics with raw, formatted, and normalized values. Assistant uses only `formatted` for labels and `normalized` for geometry.

The target site's measured compact JSON is about 2.3 KB. Cached Style Manager derivation is roughly 1 ms, so the normal same-origin REST round trip dominates the cost.

## Rendering and lifecycle

Assistant fetches once when the Styles tab mounts. It refetches on `pageshow` and when the document becomes visible after being hidden, with in-flight and short-window deduplication. A failed refresh preserves the last valid response. Initial failure leaves all PNGs in place and does not show a global error notice because live rendering is an enhancement.

Each card validates its section independently. A valid section cross-fades over its PNG; an invalid or missing section keeps only that card's PNG. Font stylesheet URLs are normalized to same-page-resolved HTTP(S) URLs, loaded once, and never removed. Blocked fonts fall back to the server-provided generic family.

The live board is noninteractive. It exposes one concise dynamic `role="img"` label while its visual descendants are `aria-hidden`. The card CTA remains the only focusable action. Motion is disabled under `prefers-reduced-motion`.

The card grid already reaches 230 px. The board uses container queries: a rich layout at 320 px and above, and a compact composition at 260 px and below. The tested 230×129 state has no descendant overflow.

## Alternatives rejected

1. A frontend iframe per card is maximally faithful but loads roughly 62–64 resources and 1–1.5 MB per card on the target site.
2. A minimal CSS capsule avoids scripts but still parses about 58 KB of generated CSS and introduces three iframe accessibility and compositing boundaries.
3. A normalized inline renderer is the chosen approach: one small response, no iframe documents, responsive presentation, and an explicit cross-plugin contract.

## Verification

Style Manager unit tests cover permissions, palette sampling, canonical role resolution, spacing normalization, missing-section behavior, route registration, and Assistant descriptor injection. Assistant Jest tests cover descriptor/response validation, unsafe font URL rejection, real DOM rendering, canonical role labels, per-card fallbacks, refresh deduplication, and accessible summaries. Existing PHP pin tests continue to require the PNG fallbacks.

Runtime verification uses `/Users/georgeolaru/Studio/pixelgrade-integrated-check` and proves:

- the authenticated endpoint returns schema v1 and rejects users without `edit_theme_options`;
- all three rendered boards match saved Style Manager values;
- 230 px and desktop card widths remain unclipped;
- one malformed section falls back without affecting the other cards;
- returning from Style Manager refreshes saved values without reloading the hub.
