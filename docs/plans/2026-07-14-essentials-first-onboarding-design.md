# Essentials-first onboarding

## Goal

Make the Home “Get started” card explain and perform the minimum technical setup first, then let the user deliberately choose a starter site.

## Experience

The checklist contains only required site-preparation work:

1. Install and activate Anima LT.
2. Install the recommended design plugins.
3. Choose a starter site, when the active theme exposes starters.

Pixelgrade account connection is not part of this checklist. It remains available from the Account tab and the Home “At a glance” account row, where its benefits can be explained without competing with required setup.

Before the theme and plugins are ready, the primary action is **Install the essentials**. Supporting copy states: “Installs and activates any missing essentials: Anima LT, Nova Blocks, and Style Manager. You’ll choose a starter site next.” The automatic run installs and activates only the missing theme and recommended plugins, then refreshes server state.

On multisite, a missing or unavailable Anima LT theme uses an explicit **Open Network Themes** hand-off instead of attempting a cross-origin Network Admin action. Once Anima LT is enabled for the network or site, Assistant can activate it on the current site and continue the same checklist.

Once the essentials are ready and a starter remains unselected, the primary action becomes **Choose a starter site** and navigates to the Starter Sites tab. A starter is never imported automatically, even when only one starter is available. The user explicitly reviews and applies it from the dedicated experience.

## Data and behavior

PHP continues to own the ordered onboarding steps and completion state. It no longer adds the optional account step. React derives the primary action from incomplete required steps:

- incomplete theme or plugins: run the automatic essentials tasks;
- essentials complete plus incomplete starter: navigate to its URL;
- all required steps complete: the card follows the existing completion/visibility behavior.

The shared WordPress-core theme installer and the existing recommended-plugin installer remain unchanged.

## Testing

- PHP contract coverage pins the checklist order and absence of the account step.
- React coverage pins the “Install the essentials” label and explanatory copy.
- React coverage verifies the automatic run installs Anima LT but does not import a starter.
- React coverage verifies a single available starter routes to the chooser rather than being imported inline.
- Browser smoke testing checks the initial essentials state and the post-install starter-selection state.
