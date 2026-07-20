# Pile LT Starter Import Contract Design

## Objective and accepted scope

The Pile LT full-site import will restore the historical curated-media contract rather than clone every source attachment. The source exporter advertises five photographic placeholders and ten preserved brand assets. Pixelgrade Assistant must import both groups, send both remote-to-local maps back while requesting posts, and let the exporter use placeholders only for replaceable project imagery. An ignored asset may be reused only when the source record explicitly references that same ignored attachment. Full replication of all 213 source attachments is deliberately outside this change.

The full starter must also carry its structural overrides. The Pile LT exporter selection will include every non-commerce `wp_template` record, the Header and Footer template parts, and the navigation records on which those parts depend. WooCommerce pages, products, variations, and commerce templates remain subject to Assistant's existing capability-segment gates. Site identity gains an explicit core `site_logo` contract: Starter Content Exporter includes the option in post settings, and Assistant remaps the source attachment ID through the imported media journal before updating the local option.

## Alternatives considered

Keeping the live exporter's ignored-media fallback is rejected because it silently converts photography into logos and badges. Importing all 213 source attachments would produce the closest clone, but changes the licensing, performance, and curation model of every starter and is too broad for this repair. The accepted approach restores the existing 15-asset contract, fixes structural omissions, and leaves a future full-fidelity mode as a separate product decision.

## Components and data flow

Assistant's server-side media collector will treat `placeholders` and `ignored` as importable groups while continuing to treat `source_urls` as metadata. Its existing journal remains keyed by demo, group, and remote attachment ID, so re-import deduplication works for both groups. The existing request to the exporter's `/posts` endpoint then carries local placeholder and ignored maps. Assistant also registers a `pixassist_sce_import_post_option_site_logo` filter using the same attachment-remap behavior as the custom-logo theme-mod filter.

Starter Content Exporter will always include the core `site_logo` option in post settings. Its placeholder helpers will remain fail-safe when a client sends no placeholder map: return no replacement details, retain the original numeric ID where applicable, and use `#` for an unresolved URL. They must never substitute an unrelated ignored attachment. The live server will be replaced from the clean upstream exporter worktree after backing up both its plugin directory and current exporter option.

## Error handling and verification

Standalone PHP contract tests cover media collection, re-import deduplication, site-logo remapping, exporter site-logo settings, and the no-fallback placeholder behavior. The exporter placeholder test can target an alternate plugin file, allowing the current live variant to provide the RED reproduction and the clean branch to provide GREEN. Full repository tests, PHP syntax checks, and diffs run before deployment.

The final smoke import must show 15 imported attachments with no missing files, all intended non-commerce templates, both Header and Footer parts, a remapped nonzero `site_logo`, photographic project thumbnails rather than ignored logos, and no broken rendered images. Browser checks cover the home footer and one portfolio single page.
