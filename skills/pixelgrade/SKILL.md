---
name: pixelgrade
description: Control a Pixelgrade WordPress site from an agent — read and write the Style Manager design system (color palettes, font palettes, per-element type), check and activate a Pixelgrade Plus license, entitle a lab site through Plus DevMode, list and import starter sites and recipes, and list, validate or canonicalize Nova Blocks content. Use whenever the task mentions a Pixelgrade site, Style Manager, design tokens, color signal, Nova Blocks, block validity, starter sites, or a Pixelgrade Plus license, and whenever you are about to reach for `wp option` on a `sm_*` setting.
---

# Pixelgrade site control

Two surfaces onto the same code: a WP-CLI command tree and an MCP server. Both return the same
JSON envelope and enforce the same capabilities. Prefer the CLI when you have shell access to the
site; use MCP when you are driving a remote site as a tool client.

## 1. The surface

### CLI

One umbrella namespace. Each plugin registers its own subtree, so `wp pixelgrade` lists exactly
what is installed.

```
wp pixelgrade sm     <verb>   # Style Manager — the design system
wp pixelgrade plus   <verb>   # Pixelgrade Plus — licensing and entitlements
wp pixelgrade assist <verb>   # Pixelgrade Assistant — starters and recipes
wp pixelgrade blocks <verb>   # Nova Blocks — block registry, validity, canonical markup
```

| Subtree | Verbs |
|---|---|
| `sm` | `get`, `set`, `export`, `structure`, `apply-font-palette`, `apply-color-palette`, `flush-cache` |
| `plus` | `license status`, `license activate`, `license refresh`, `license disconnect`, `devmode status`, `devmode enable`, `devmode disable` |
| `assist` | `starter list`, `starter import`, `starter reset`, `recipe list`, `recipe apply` |
| `blocks` | `list`, `patterns`, `validate`, `canonicalize` |

Every command takes `--format=json|table|yaml` (**default `table`** — there is no TTY detection,
so pass `--format=json` explicitly, always), `--quiet`, and `--user=<login>`. Destructive verbs
take `--yes`.

`wp style-manager flush-cache` still works as a deprecated alias of `wp pixelgrade sm flush-cache`.

### MCP

Route `/wp-json/pixelgrade/v1/mcp` (streamable HTTP; a STDIO transport also exists via
`wp mcp-adapter serve --server=pixelgrade`). Authenticate with a WordPress **application
password** over HTTP Basic. Server name `Pixelgrade`.

**16 published tools**, named `pixelgrade-<verb>-<noun>`: the 12 read tools
(`get-design-system`, `get-design-settings`, `get-design-structure`, `export-design-system`,
`flush-design-cache`, `get-license-status`, `get-devmode`, `list-starters`, `list-recipes`,
`list-blocks`, `list-patterns`, `validate-post`) plus four opened writes (`apply-font-palette`,
`apply-color-palette`, `import-starter`, `set-devmode`).

Everything else — writing arbitrary settings, license activation, starter reset, recipe apply,
canonicalize — is deliberately **CLI-only**. If a tool is missing from `tools/list`, it is not
broken; it is private. Do not try to reach it over MCP.

Two MCP-specific rules:

- **The transport itself requires `edit_posts`.** A user below that cannot even enumerate the
  catalog. Each tool still enforces its own, stricter capability on top.
- **Destructive tools require an explicit `confirm: true` input property.** It is the machine
  mirror of `--yes`. There is no prompt on this path; without it the call is refused.
- **`set-devmode` is published but self-gating.** It is the only published write that can refuse
  on grounds other than a capability: it turns full Plus entitlements on for a LAB site, and it
  returns `devmode_unavailable` unless the site reports a non-`production` environment type AND
  `PIXELGRADE_PLUS_DEV_MODE` is already defined in `wp-config.php`. It never writes
  `wp-config.php`. On a customer site it therefore exists and always says no. Call
  `get-devmode` first — it is readonly, it answers everywhere, and its `reasons` tell you which
  factor is missing instead of leaving you to guess.

Every tool's `output_schema` is the **whole envelope**, not just `data` — because there is no
exit code on the wire, `code` / `warnings` / `stripped` are your only way to notice a finding.
Successful-with-findings outcomes arrive as the envelope; hard failures arrive as a protocol
error.

## 2. The envelope

```jsonc
{
  "ok": true,
  "code": "ok",              // stable machine token, never a sentence
  "summary": "…",            // one human line
  "data": { },
  "warnings": [ { "code": "plus_stripped", "message": "…", "ids": ["…"] } ],
  "persisted": { },          // writes only: what is on disk after the write
  "unchanged": [ ],          // writes only: requested == already stored
  "stripped":  [ { "id": "…", "reason": "plus_locked", "requested": {}, "current": {} } ],
  "retryable": false         // true only for transient network failures
}
```

| Exit | `ok` | Meaning |
|---|---|---|
| `0` | `true` | Done. Nothing to inspect. Includes idempotent no-ops. |
| `1` | `false` | Error. Nothing was done, or the operation failed. |
| `2` | `true` | **Done, with findings you must inspect.** |
| `3` | `false` | Permission denied — no user resolved, or the user lacks the capability. |

Under `--format=json`, STDOUT is the envelope and nothing else; diagnostics go to STDERR. So
`wp … --format=json | jq` always works.

## 3. Agent invariants

These are the twelve things that go wrong. Read them before your first write.

1. **Always `--format=json`, and always read the envelope.** The default is `table`. `ok` is bound
   to the exit code, not to the outcome: `ok:true` means exit 0 **or 2**. A command that stripped
   half your payload is still `ok:true`. Branch on `code`, never on `ok` alone.

2. **Exit 2 is not success — it is a report you must open.** It means Plus gating stripped
   settings, blocks are invalid, a canonicalize refused or did not stabilize, an import was
   partial, or a font palette was tier-locked. Inspect `stripped[]`, `data.invalid`,
   `data.invalid_after`, `data.refused[]`, `data.not_yet_stable[]`. Never retry blindly; the
   command already told you what it found.

3. **Resolve a user — pass `--user=<admin>`.** WP-CLI runs as *no user*. The wrapped internals
   then fail silently rather than loudly: a read returns an empty map that looks like success.
   Every command except `flush-cache` refuses with exit 3 rather than pretend. Nothing
   auto-elevates.

4. **Never read or write `sm_*` with raw `wp option`.** A Style Manager setting resolves through
   three stores — a standalone option row, an aggregated theme options array, or `theme_mods_*` —
   depending on the setting's own config. A raw `wp option get` is wrong for most ids and
   accidentally right for a few, which is worse. Reads go through `sm get` / `sm export`; writes go
   through `sm set` / the palette applies.

5. **Read back after every write.** The commands do this for you and report
   `persisted`/`unchanged`/`stripped` — use it. On CLI a Plus-gated setting is stripped **loudly**
   (exit 2, `plus_stripped`); over REST it is stripped **silently**. If you ever write through
   another path, re-read yourself.

6. **Fonts are two steps, never one.** Changing a master slot (`sm_font_primary`,
   `sm_font_secondary`, `sm_font_body`, `sm_font_accent`, `sm_font_palette`) regenerates the
   entire per-element defaults table and clobbers per-element overrides. A single invocation that
   carries **both** a master slot and a connected per-element field is rejected with
   `ordering_conflict`, exit 1. Do masters first, then the per-element pass, as two separate
   invocations. The command cannot sequence it for you: only one settings publish is possible per
   process.

7. **One save per invocation.** Never compose a write that calls another write. Sequence multiple
   calls yourself, each in its own request. A second settings publish in the same process fails.

8. **Every authoring flow ends with `blocks canonicalize`, then a fresh `blocks validate`.**
   `wp post create/update` bypasses the editor's own save filters, so markup that renders fine can
   still parse invalid. Canonicalize the page **and its template parts** (`--all-parts`) — the
   missed footer part is the recurring failure. Canonicalization iterates internally to a fixed
   point; exit 0 means stable *and* zero-invalid.
   - `content_altered` (exit 2) means the rewrite would have destroyed text, so **nothing was
     written**. This needs a human in the editor, not a retry.
   - `not_yet_stable` (exit 2) means it did not converge in three passes. Also nothing written.

9. **`--dry-run` is free — use it before every destructive apply.** It predicts the exact
   `persisted`/`stripped` diff without writing, never prompts, never needs `--yes`, and follows the
   same exit-2-on-findings rule. There is no reason to discover a strip by causing one.

10. **Unknown values are named in the error — trust the error text.** A bad setting id, palette id
    or flag value comes back as `invalid_params` with the offenders and the accepted set in `data`.
    Do not guess variants; read the list. Reads are all-or-nothing: one unknown id fails the whole
    `sm get` rather than returning a partial map.

11. **Destructive verbs need explicit intent.** `--yes` on CLI (strictly required under
    `--format=json`; without it you get `confirmation_required`, exit 1), `confirm: true` over MCP.
    Destructive = `apply-color-palette`, `apply-font-palette`, `license disconnect`,
    `devmode enable`, `devmode disable`, `starter import`, `starter reset`, `recipe apply`,
    `canonicalize` — plus any `sm set` whose payload carries a master font slot.

12. **Production sites are never an implicit target.** The commands carry no environment check and
    will happily run anywhere — `plus devmode enable|disable` is the single exception, and it
    refuses there because the underlying DevMode facility is inert on production anyway. Point them at a site the user named. Work on local/staging by
    default; a production run is an explicit, separate decision.

Two supporting facts worth knowing:

- **No theme.json presets in anything you author.** Commands that accept agent-authored block
  markup reject `backgroundColor` / `textColor` / `gradient` attributes, `has-*-background-color`
  classes and `var:preset|color|*` values (`preset_rejected`). Surfaces are Color Signal; inline
  values are `var(--sm-current-*-color)`; spacing is Nova spacing attributes. Commands that pass
  *existing* content through (`canonicalize`, `starter import`, `recipe apply`) do not reject —
  they warn with `preset_detected` and carry on.
- **`blocks validate` and `blocks canonicalize` need a separately installed Node harness.** It is
  not part of the plugin. When it is absent both verbs report `harness_unavailable`, exit 1, with
  the install step named in the summary. `sm`, `plus` and `assist` work on a stock install.

## 4. Task → command

`--format=json --user=admin` is assumed on every row.

| Task | Command |
|---|---|
| See what the site's design system is | `wp pixelgrade sm export` |
| Read specific design settings | `wp pixelgrade sm get sm_font_primary sm_font_body` |
| Discover the setting ids that exist | `wp pixelgrade sm structure` (add `--section=<id>` to narrow) |
| Get a renderable design-token snapshot | MCP `pixelgrade-get-design-system` |
| Apply a brand color palette | `wp pixelgrade sm apply-color-palette --source=@palette.json --yes` |
| Preview that palette apply first | same, with `--dry-run` (drop `--yes`) |
| Apply a pre-generated palette blob | `wp pixelgrade sm apply-color-palette --generator=none --output=@blob.json --yes` |
| Apply a font palette (the voice choice) | `wp pixelgrade sm apply-font-palette <palette-id> --yes` |
| Return to the default font palette | `wp pixelgrade sm set sm_font_palette=system --yes` (not a palette apply) |
| Set master font slots | `wp pixelgrade sm set 'sm_font_primary={"font_family":"…"}' --yes` |
| Set per-element type, after the masters | `wp pixelgrade sm set --from-file=per-element.json --yes` |
| Restore an exported design system | `wp pixelgrade sm set --from-file=export.json --yes` |
| Force a design-cache rebuild | `wp pixelgrade sm flush-cache` |
| Check the license and entitlements | `wp pixelgrade plus license status --entitlements` |
| Activate / refresh a license | `wp pixelgrade plus license activate` · `… refresh` |
| Disconnect a license | `wp pixelgrade plus license disconnect --yes` |
| Check whether a lab site can be entitled | `wp pixelgrade plus devmode status` |
| Entitle a LAB site with no license (dev only) | `wp pixelgrade plus devmode enable --yes` |
| Return a lab site to its real license state | `wp pixelgrade plus devmode disable --yes` |
| List available starter sites | `wp pixelgrade assist starter list` (`--refresh` to bypass cache) |
| Import a starter site | `wp pixelgrade assist starter import <demo-key> --source-url=<https base> --yes` |
| Undo a starter import | `wp pixelgrade assist starter reset --yes` |
| List / apply a recipe | `wp pixelgrade assist recipe list` · `… recipe apply <id> --source-url=<https base> --yes` |
| List available blocks | `wp pixelgrade blocks list` (`--namespace=all`, `--attributes`, `--supports`) |
| List block patterns | `wp pixelgrade blocks patterns` (`--source=local\|cloud\|all`, `--refresh`) |
| Check whether a page is editor-valid | `wp pixelgrade blocks validate <post-id> --all-parts` |
| Repair authored markup | `wp pixelgrade blocks canonicalize <post-id> --all-parts --yes` |

Two flag traps:

- **It is `--source-url`, not `--url`.** `--url` is a reserved WP-CLI global; it never reaches the
  command. No Pixelgrade flag shadows a WP-CLI global.
- **`sm set` parses a value as JSON when it parses as JSON**, otherwise as a raw string. So
  `sm_color_grades_number=12` writes the integer `12`; a numeric *string* must be quoted as
  `'"12"'`. Over MCP this does not apply — typed JSON goes in natively.

## 5. Codes

| Code | Exit | What it means / what to do |
|---|---|---|
| `ok` | 0 | Done. |
| `noop` | 0 | Everything requested was already the stored value. Idempotent. |
| `plus_stripped` | 2 | Some or all ids were not persisted. Read `stripped[]` — `reason` says why. |
| `unknown_setting` | 2 | No such registered setting, or capability-denied for this user. |
| `partial` | 2 | Import-style command finished with some units failed. Read `data`. |
| `invalid_blocks` | 2 | `validate` found invalid blocks. `data.invalid[]` names them. |
| `not_yet_stable` | 2 | `canonicalize` did not converge in 3 passes. **Nothing was written.** |
| `content_altered` | 2 | The rewrite would have destroyed text. **Refused; post byte-identical.** Human repair. |
| `no_license` | 2 | Nothing to activate on this site. |
| `activation_limit_reached` | 2 | The license has no seats left. |
| `invalid_params` | 1 | Bad id, value or flag. `data` names the offenders and the accepted set. |
| `ordering_conflict` | 1 | Master font slot and per-element field in one call. Split into two. |
| `confirmation_required` | 1 | Destructive verb without `--yes` (CLI) or `confirm: true` (MCP). |
| `devmode_unavailable` | 1 | `plus devmode enable\|disable` refused. `data.reasons` names the factor: `production_environment` (never overridable) or `missing_constant` (an operator must add `PIXELGRADE_PLUS_DEV_MODE` to `wp-config.php`; this command never writes it). |
| `preset_rejected` | 1 | Agent-authored input carried a theme.json preset. |
| `generator_unavailable` | 1 | The palette generator or its Node binary is missing. |
| `harness_unavailable` | 1 | The blocks Node harness is not installed. The summary names the step. |
| `harness_degraded` | 1 | A required editor bundle failed to load. Results would be false — nothing ran. |
| `harness_timeout` | 1 | The harness stopped responding. Nothing was written. |
| `write_mutated` | 1 | The saved bytes differ from what was handed to the save call. Something filtered it. |
| `not_connected` | 3 | No host account connection; licensing cannot proceed. |
| `permission_denied` | 3 | No user resolved, or the capability is missing. Pass `--user=<admin>`. |
| `denied` | 3 | The remote refused the licensing operation. |

Warnings, which never fail a command: `preset_detected` (existing content carries a preset),
`third_party_editor_scripts` (editor scripts outside core and Nova Blocks were detected, so the
result may not match what that editor would do).

`retryable: true` marks a transient network failure — a hub or cloud fetch. Only those are worth
retrying.
