# Companion Practice Guides

Status: Active architecture
Date: 2026-07-10
Reference implementation: Nova Blocks Color Signal practice

## Purpose

Use a companion practice guide when a feature is best understood by changing real
content and observing the result. The guide inserts a disposable example into the
editor, asks the user to make a few meaningful changes, derives progress from the
document, and can remove the example afterward.

This is different from documentation:

- Use a tooltip for a control-level clarification.
- Use a knowledge-base article for concepts, reference, and troubleshooting.
- Use a practice guide when the user needs to build the feature's mental model by
  seeing cause and effect in the real editor.

## Ownership Boundary

The companion plugin owns the lesson. It provides the practice content, target
detection, step derivation, current-state copy, editor actions, removal behavior,
and a fallback when Pixelgrade Assistant is unavailable.

Pixelgrade Assistant owns only the generic floating host. It displays a serializable
guide payload and sends action identifiers back to the companion. Companion React
components, WordPress data selectors, and feature-specific logic must not cross into
the Assistant root.

The knowledge base remains the deeper reading layer. Completing a practice may link
to relevant articles, but reading should not replace the hands-on lesson.

## Host Contract

Open or update a guide through the mounted docs window:

```js
window.pixelgradeAdminHub?.docs?.openGuide?.( {
  id: 'stable-companion-guide-id',
  title: 'Practice title',
  content: '<p>Trusted companion-authored HTML.</p>',
  actions: [
    { id: 'remove-practice', label: 'Remove practice section', isDestructive: true },
  ],
} );
```

`openGuide()` returns truthy only when a docs-window listener is mounted. The
companion must keep a useful fallback when it returns false. Re-pushing the same
`id` replaces the guide content in place without restoring, focusing, or otherwise
interrupting the window. The host normalizes the payload to string fields, boolean
flags, and action descriptors; callbacks and unsupported fields are discarded.

Buttons in `actions` and elements in `content` with a `data-guide-action` attribute
dispatch the same event:

```js
window.addEventListener( 'pixelgrade-docs:guide-action', ( event ) => {
  if ( event.detail?.guideId !== 'stable-companion-guide-id' ) {
    return;
  }

  // Handle event.detail.actionId in the owning companion.
} );
```

Guide payloads are page-scoped and are not persisted across admin navigation. The
owning companion decides whether to reopen one when its editor context returns.

`content` currently accepts trusted HTML from Pixelgrade companion code and is
rendered with `dangerouslySetInnerHTML`. Do not pass user-authored, remote, or
third-party HTML. Sanitize such content first, or extend the host with a structured
content model before allowing those sources.

## Practice Design Rules

1. Insert real, editable blocks. The lesson must use the same controls and rendering
   path as the user's content.
2. Make the example visibly disposable. Add stable marker classes and a clear remove
   action; normal block deletion must also work.
3. Put enough instruction inside the inserted content for the exercise to remain
   understandable without Assistant.
4. Use three to five purpose-driven changes. Explain why an element should become
   quieter, louder, denser, or otherwise different; do not merely name controls.
5. Let steps complete in any order. Observe the editor instead of forcing a wizard
   sequence.
6. Show current state in the copy and offer actions such as "Show me the block" when
   the target may be hard to find.
7. End with the learned principle, relevant deeper reading, and an explicit choice to
   remove or keep the practice content.

## State And Lifecycle

Prefer derivable state. Progress should come from block attributes and document
structure, not post meta, options, cookies, or a second checklist database. Keep only
the minimum transient baseline needed to detect a relative change such as switching
palettes.

Editor inspector components remount when block selection changes. Session state,
guide-action listeners, and live watchers that must survive selection belong outside
the inspector component lifecycle. Scope any `wp.data.subscribe()` watcher tightly:
return early when the blocks reference has not changed, derive a compact signature,
and never dispatch merely to record progress. Closing a guide must unsubscribe its
watcher so later edits cannot reopen a surface the user dismissed; an explicit reopen
may create a fresh watcher while retaining the exercise baseline.

Shared drawers must measure the rendered panel, not React element identity. A stable
panel node plus `ResizeObserver` handles content replacement and live guide changes
without clipping controls.

## Verification Checklist

- Unit-test pure target discovery, step derivation, guide-content generation, and the
  practice template.
- Pin the cross-plugin event vocabulary and listener-attested delivery contract.
- Verify the full exercise in the non-iframed Post Editor and the iframed Site Editor.
- Check insertion, out-of-order completion, live guide updates, target selection,
  minimization, close/reopen, manual deletion, and the remove action.
- Test with Assistant available and unavailable.
- Verify the shared controls drawer after selecting blocks whose panels have different
  heights; no content may be clipped.
- Run each repository's required build and test commands before committing generated
  assets.

## Reference Files

- Nova lesson controller: `packages/color-signal/src/onboarding/guide-session.js`
- Nova pure step model: `packages/color-signal/src/onboarding/derive-steps.js`
- Nova disposable template: `packages/color-signal/src/onboarding/practice-section.js`
- Assistant event contract: `admin/src-modern/docs/events.js`
- Assistant floating host: `admin/src-modern/docs/KbPanel.js`
- Assistant contract test: `tests/docs-window-guide-test.php`
