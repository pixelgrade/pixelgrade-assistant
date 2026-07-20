# Pile LT Starter Contract Verification

Verified on 2026-07-20 against the live Pile LT starter source and a reset Studio smoke site.

## Deployed exporter

- Branch commit: `starter_content_exporter` `c6abdb8`
- Deployed plugin version: `1.5.6`
- Deployed `starter_content_exporter.php` SHA-256: `d57f2a69310036db275f621477a9a992dbfc04ae261cff0a791264440a4813c8`
- Deployment archive SHA-256: `a79bfdbd9e0c5541c84f2c79ed21b43dcc67d41a624736950fa63208143ae937`
- Recoverable plugin backup: `wp-content/plugins/starter_content_exporter.backup-20260720-132214`
- Recoverable Pile LT option backup: `starter_content_exporter_backup_20260720_132214`
- PHP-FPM retained the old OPcache entry after the directory swap. The authenticated Network Admin WP OPcache control flushed it; no server-wide restart was performed.

The cache-busted public `/sce/v2/data?media_urls=1` manifest then exposed:

- placeholders `2070, 2071, 2072, 2073, 2074`
- ignored assets `299, 300, 182, 168, 89, 40, 41, 87, 88, 257`
- 15 direct media source URLs
- templates `328, 329, 330, 331, 332, 333, 1746, 2086, 2108`
- template parts `140, 334`
- navigation records `1765, 4`
- `site_logo` `299`

The must-import manifest exposes the same nine templates and both template parts.

## Assistant smoke runtime

- Reviewed branch commit: `fd69041`
- Built `admin/build/index.js` SHA-256: `cdc43a3788d8e42891a7353b97ff8602d6c6dd127106a7f82d99539f6fc052e4`
- Built `admin/build/index.asset.php` SHA-256: `0ed901ac0b11f32731be3ea818d00d559bd8dab343e55d4c229781c192fa0eaf`
- Smoke site: `http://localhost:8886/`
- Pre-reset backup: `/tmp/pile-lt-smoke-backup-20260720-132214/`
  - consistent SQLite backup
  - WordPress WXR export
  - uploads archive

Resetting the previously imported starter removed 58 journaled posts, 19 terms, and 10 media attachments, then left no starter journal, active starter, attachment, portfolio, template, or template-part records.

The real Starter Sites UI completed a fresh Pile LT full-site import with 46/46 steps and reported “All done — your site is ready.”

## Imported data evidence

- journaled media: 5 placeholders and 10 ignored assets
- attachments: 15; every attached file exists
- templates: 9, exactly `archive`, `archive-portfolio`, `front-page`, `home`, `index`, `page`, `search`, `single`, `single-portfolio`
- template parts: 2, exactly `footer`, `header`
- site logo: local attachment `2116`, equal to the journal mapping for source attachment `299`; its file exists
- portfolios: 15
- portfolio featured images: 15 placeholder-backed, 0 ignored-backed, 0 other, 0 missing
- active starter: `pile-lt`

## Frontend evidence

- Home renders the imported Pile footer (`© Pixelgrade 2026 …`, Map It, phone, email, social links), not the Anima “Proudly powered” footer.
- `/portfolio/iona-brown/` renders the Pile project-single structure, including its project gallery, “Next Project” section, and imported footer.
- The local project semantic snapshot matches the live source on title, navigation, next-project section, and footer content.
- Home and project requests produced no failed network requests or HTTP errors.
- After lazy media loaded, neither page had broken images.
- No frontend resource referenced `starter.pixelgrade.com`; imported media resolves locally.
- Frontend console output contained only the existing jQuery Migrate notice and the expected localhost support notice, with no import-attributable errors.

No WordPress.org Assistant release was published as part of this repair.
