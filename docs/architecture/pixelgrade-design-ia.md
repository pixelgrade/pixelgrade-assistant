# Pixelgrade Design IA

Status: Active direction
Date: 2026-06-23

## Purpose

Pixelgrade Design is the admin workbench for free Pixelgrade themes. It should help users understand and act on the design system without turning the dashboard into a sales page or a duplicate of the WordPress Editor.

The hub separates design work from service and utility areas:

- Design cluster: Home, Design System, Starter Sites, Layouts, Setup.
- Service cluster: Account, Help.
- Utility menu: System Status, Tools.

## Home

Home is the orientation and launcher surface. It explains the design-system idea at a high level, shows site/account/setup state, and points users to the right task areas.

Home should not become a long documentation page and should not carry large Plus management cards after Plus is active. Plus setup or management belongs in Account, with deep links to `tab=account&section=plus`.

## Design System

Design System is an in-hub section, not a link tab. Its stable route id remains `styles` for backward compatibility.

This keeps the top navigation consistent: choosing a Pixelgrade Design tab always opens a Pixelgrade Design section. From that section, users can follow direct actions into the WordPress Editor or Customizer where editing actually happens.

Design System should behave as a style control center:

- Lead with real free value.
- Expose direct links to the best available editing surface.
- Group practical style destinations such as Style Manager, Colors, Typography, and Spacing.
- Keep all destination copy short, actionable, and tied to site design work.
- Avoid educational bulk that belongs on Home or in Help.

For block themes, the primary destination is the Site Editor styles surface. For classic themes, the fallback is the Customizer or the closest Style Manager-compatible admin surface.

## Plus In Design System

Pixelgrade Plus may extend the style system, but the Design System tab must not push gated options too hard.

The default message is: Pixelgrade Design gives users meaningful style control for free. Plus is only for sites that need advanced design capabilities.

Plus-gated style areas should be contextual, quiet, and specific:

- Motion can appear as a style capability because it belongs to the design system.
- The Motion card should sit after the core free controls.
- Copy should say what Motion does, not pressure users to upgrade.
- Use language such as "Available with Pixelgrade Plus" or "Requires Pixelgrade Plus", not aggressive upgrade language.
- Any Plus action should be secondary to the free style actions.
- Assistant reads Plus state only through `pixassist_get_plus_status()` and never owns Plus license or entitlement logic.

## Routing

Top-level hub tabs are sections. Buttons inside those sections are actions.

Therefore:

- `Design System` opens `tab=styles` inside Pixelgrade Design.
- Primary and per-destination actions may link to the Editor or Customizer.
- Plus setup or management links go to `tab=account&section=plus`.
- Legacy or external integrations should still be able to rely on the stable `styles` tab id.

## Implementation Notes

The Styles tab should follow the existing hub architecture:

- PHP registers the Design System tab descriptor through `pixelgrade/admin_hub/tabs`.
- PHP assembles a tab-specific payload, including destinations, URLs, and Plus state.
- React renders the payload presentationally.
- Companion plugins may extend the payload through a narrow filter if needed.
