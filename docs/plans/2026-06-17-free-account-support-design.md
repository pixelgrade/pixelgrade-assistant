# Free account connection + support for all users — design

- **Date:** 2026-06-17
- **Status:** Live — `pkDQYLDpG7ji` consumer secret shipped as the hardcoded default; free connect + support enabled (pending release build). #58 resolved.
- **Branch (design):** `feat/portfolio-cpt` (doc only)
- **Branch (implementation):** `feat/free-account-support` — pair-resolution refactor, eligibility gate + `hash_id`, Anima WUpdates back-fill, copy audit, pinning tests
- **Origin:** Onboarding-testing insight #3 — "Fix the account state honestly: either ship an Assistant OAuth secret so free users can connect + get support, or hide the Account/ticket UI when unconfigured. Today it's visible-but-dead."

## Decision summary

| Question | Decision |
|---|---|
| Positioning of account-connect + support | **Free for everyone** (no Plus required) |
| How to source the OAuth consumer secret | **Dedicated Assistant consumer** — finish registering the existing `pkDQYLDpG7ji` app on pixelgrade.com, ship its secret in Assistant PHP, keep PHP-only signing |
| Minimum bar to open a ticket | Free, but require a **recognized Pixelgrade theme** active (WUpdates `hash_id`) as a lightweight anti-spam/triage gate |
| Plus consumer constants | Keep as an **optional override** (back-compat), no longer load-bearing |
| Is connecting ever mandatory | **No** — stays fully optional on every surface |

## Why this is the right shape (precedent)

Pixelgrade Care — the free wp.org plugin that did exactly this for years — **ships its OAuth1 consumer secret hardcoded in public code** (`pixelgrade-care/admin/class-pixelgrade_care-admin.php:1003`). There is **no broker**: pixelgrade.com's OAuth1 server is built around a *publicly-known* consumer secret, and the real auth is the per-user access token (earned through the interactive authorize flow) plus server-side theme/license validation. Shipping an Assistant secret is therefore the established pattern, not a hack.

The modern Assistant already improved on Care in two ways we preserve:
- **PHP-only signing** — `pixassist_get_account_credentials()` is PHP-only and never localized to JS (Care signed in the browser).
- **No license gate on tickets** — Care required a *purchased* license; Assistant's handler requires only "connected + subject/details," which already matches free-for-everyone.

So "free for everyone" reduces to: **provide a working consumer secret** + a small eligibility gate + a copy audit.

## Current state (what's actually there)

The honest-handling work is ~90% done; the machinery is wired but dormant because the consumer **secret is empty**.

- `pixassist_account_oauth_config()` — `includes/account.php:385`. Resolves `base_url`/`consumer_key`/`consumer_secret`. Today: key falls back to `'pkDQYLDpG7ji'` (`:388`), secret falls back to `''` (`:389`). Key and secret are resolved **independently** (latent mismatch bug — see below).
- `pixassist_account_oauth_is_configured()` — `includes/account.php:410`. Returns true only when `base_url`, `consumer_key`, **and** `consumer_secret` are all non-empty. Empty secret ⇒ false ⇒ everything stays dormant.
- When not configured: Account tab renders a disabled "Connect" button + a "not configured for this build" notice (`admin/src-modern/hub/tabs/Account.js`); ticket handler returns `not_configured` (`includes/admin-docs.php:521`,`:525`).
- Ticket handler `pixassist_submit_docs_ticket()` — `includes/admin-docs.php:491`. Requires `pixassist_get_account()['is_connected']` + `pixassist_get_account_credentials()['token']` (`:499`), then subject/details (`:504`). No license check. Signs PHP-side with the consumer secret (`:537`).
- Ticket body `pixassist_docs_ticket_body()` — `includes/admin-docs.php:451`. Sends `product_sku`, `site_url`, `admin_url`, user identity. **Does not send `hash_id`.**
- Theme hash accessor: `PixelgradeAssistant_Admin::get_theme_hash_id()` — `admin/class-pixelgrade_assistant-admin.php:1259` (already used by Help at `admin/class-pixelgrade_assistant-help.php:127`).

## Design

### Change 1 — Resolve key + secret as a pair, ship the Assistant secret

In `pixassist_account_oauth_config()` (`includes/account.php:385`), stop resolving `consumer_key` and `consumer_secret` independently. Pick the first source that supplies **both**, in priority order:

1. Assistant constants (`PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_KEY` + `..._SECRET`)
2. Plus constants (`PIXELGRADE_PLUS_ACCOUNT_CONSUMER_KEY` + `..._SECRET`) — optional override, back-compat
3. **Hardcoded Assistant default**: `pkDQYLDpG7ji` + its real secret

Rationale: independent resolution lets a half-set override produce a mismatched key/secret and silently-broken signing. Pairing makes that impossible. `base_url` resolution and the `pixassist_account_oauth_config` filter stay as-is.

The secret value is supplied by the external dependency below. Until then, read it from `PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET` (definable in `wp-config` for testing); the code change is complete and stays dormant without it.

Sketch:

```php
$sources = array(
    array( 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_KEY', 'PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET' ),
    array( 'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_KEY',       'PIXELGRADE_PLUS_ACCOUNT_CONSUMER_SECRET' ),
);
$consumer_key    = 'pkDQYLDpG7ji';
$consumer_secret = PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET_DEFAULT; // shipped constant once registered
foreach ( $sources as $pair ) {
    if ( defined( $pair[0] ) && defined( $pair[1] )
        && '' !== (string) constant( $pair[0] ) && '' !== (string) constant( $pair[1] ) ) {
        $consumer_key    = (string) constant( $pair[0] );
        $consumer_secret = (string) constant( $pair[1] );
        break;
    }
}
```

### Change 2 — Eligibility gate + `hash_id` in payload

In `pixassist_submit_docs_ticket()` (`includes/admin-docs.php:491`), after the connected check (`:501`) and before signing, require a recognized Pixelgrade theme:

```php
$hash_id = class_exists( 'PixelgradeAssistant_Admin' ) ? PixelgradeAssistant_Admin::get_theme_hash_id() : '';
if ( empty( $hash_id ) ) {
    return pixassist_docs_response( 'no_pixelgrade_theme', esc_html__( 'Support is available for active Pixelgrade themes.', '__plugin_txtd' ) );
}
```

Add `hash_id` to `pixassist_docs_ticket_body()` (`:455`) so pixelgrade.com can route/triage. Note: because Assistant only loads for Pixelgrade themes, this gate almost never fires in practice — it is cheap belt-and-suspenders. Confirm Anima LT actually carries a WUpdates hash; wp.org-distributed free themes sometimes don't (the `wupdates_gather_ids` back-fill at `admin/class-pixelgrade_assistant-admin.php:129` may cover this).

### Change 3 — Copy audit on enabled states

No structural UI work — the guards already swap states once configured. Audit copy for the now-live free states:

- **Account tab disconnected state** (`Account.js` / `pixassist_get_account_data()`): give a clear value proposition for *why* a free user connects (direct support + KB, account identity). Remove any wording implying account/support is a Plus feature.
- **Help tab + editor docs panel** (`Help.js`, `KbPanel`): not connected ⇒ prompt to connect (not a dead form); connected + theme ⇒ working ticket form; Plus escalation SlotFill still layers on untouched.
- **Setup wizard + Overview**: the connect step / CTA become live — message the benefit, keep connect optional (skippable; starters work without it).

## External dependency (resolved)

`pkDQYLDpG7ji` was already a live, registered pixelgrade.com consumer — Plus signs with it successfully, and in Plus it is scoped to the account-connect → `SupportTicketClient` (ticket) flow, not licensing. Its secret is now shipped as Assistant's hardcoded default, making free connect + support work without Plus (world-public posture, same as Care). The secret stays overridable via `PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET` for staging/rotation.

**Tracked in:** [#58 — Register dedicated Assistant OAuth consumer on pixelgrade.com](https://github.com/pixelgrade/pixelgrade-assistant/issues/58) (resolved).

## Rollout sequence

1. ✅ Land code (pair-resolution refactor, eligibility gate + `hash_id`, Anima WUpdates back-fill, copy audit) on `feat/free-account-support`.
2. ✅ Consumer already registered on pixelgrade.com (`pkDQYLDpG7ji`, proven by Plus).
3. ✅ Shipped the secret as the hardcoded default; tests updated to pin the configured-by-default state. `composer test` green.
4. End-to-end verify on `pixelgrade-integrated-check` (live authorize + test ticket), then cut a release.

## Verification

- **Static:** `php -l includes/account.php includes/admin-docs.php`; `composer test` (Plus pin — should not move, confirm green); `npm run dev` if any JS copy changes.
- **Before secret (regression):** `pixassist_account_oauth_is_configured()` false ⇒ UI stays disabled, ticket returns `not_configured`.
- **With a test secret** (define `PIXELGRADE_ASSISTANT_ACCOUNT_CONSUMER_SECRET` in `wp-config` on the `pixelgrade-integrated-check` Studio site — deliberately unconnected/unlicensed, i.e. the free-user state): `is_configured()` flips true ⇒ Connect button enables ⇒ run the live authorize flow ⇒ connect ⇒ file a test ticket ⇒ confirm it lands in pixelgrade.com support.
- **End-to-end** is blocked until the consumer is registered; expected.

## Security

- Shipped secret is **public** by design (extractable from the zip) — accepted because pixelgrade.com treats first-party consumers as low-trust; per-user tokens + server validation are the real auth (same posture Care has run for years).
- Keep signing **PHP-only**; never localize the secret or `pixassist_get_account_credentials()` to JS.
- Rate-limiting / abuse handling is pixelgrade.com's responsibility.

## Out of scope / explicitly untouched

- The Plus status contract (`pixassist_get_plus_status()` / `pixelgrade_assistant_plus_status`).
- `pixassist_get_account()` and the host-extension-surface read accessors (they return per-*user* tokens, not the consumer secret) — no lockstep change with Plus required.
- No broker infrastructure.
