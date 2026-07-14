=== Pixelgrade Assistant ===
Contributors: pixelgrade, vlad.olaru, babbardel
Tags: dashboard, starter-content, demo-content, recommended-plugins, pixelgrade
Requires at least: 5.9
Tested up to: 7.0.1
Requires PHP: 7.4
Stable tag: 2.3.0
License: GPLv3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html

The free companion for the Pixelgrade LT stack — stack health, recommended plugins, and starter content. No account required.

== Description ==

Pixelgrade Assistant is the free companion for the Pixelgrade LT stack — the Anima LT theme together with the Style Manager and Nova Blocks plugins.

It gives you a calm, in-dashboard home for getting the most out of your free Pixelgrade site:

* **Stack health** — see at a glance whether Style Manager and Nova Blocks are installed, active, or need an update.
* **One-click install** of recommended free companions, straight from WordPress.org.
* **Starter content** to give your new site a head start.
* **Documentation** links to help you along the way.
* Behind-the-scenes compatibility logic so your theme and its companion plugins play nicely together.

**No account required.** Pixelgrade Assistant works out of the box — you do not need a Pixelgrade.com account or a license to use the free stack. Optional commercial features live in a separate plugin, **Pixelgrade Plus** (see below); the free stack never asks you to connect an account.

Looking for more? **Pixelgrade Plus** is the optional premium companion that adds advanced design tools on top of the free stack. It is never required, and you can explore it any time from the Pixelgrade screen.

**Made with love by [Pixelgrade](https://pixelgrade.com)**

== External services ==

Pixelgrade Assistant runs almost entirely on your own site — installing recommended plugins (from WordPress.org), documentation links, and the stack-health information never leave your server. A few features reach Pixelgrade-hosted services, described below. No Pixelgrade.com account is required for any of them.

* **Theme configuration and documentation (pixelgrade.com).** When Pixelgrade Assistant needs the configuration or documentation for your active theme, it requests it from `https://pixelgrade.com` (`/wp-json/pxm/v2/front/`). Responses are cached locally, so they are not requested on every page load.
* **Starter content (starter.pixelgrade.com and demos.pixelgrade.com).** When you browse or apply a starter, layout, or page, the plugin requests the corresponding manifest and content from Pixelgrade-hosted starter sources. No account is required.
* **Design assets (cloud.pixelgrade.com).** Style Manager requests compatible palettes, fonts, and theme configuration from the Pixelgrade Cloud API (`https://cloud.pixelgrade.com`, `/wp-json/pixcloud/v1/front/design_assets`). The request includes the current color-palette identifier, variation, and customized state when available.
* **First-party site registry (automatic).** The functional requests above automatically include your canonical site URL, active theme and version, WordPress and Pixelgrade plugin versions, site language, RTL state, environment type, and — only when already connected — the numeric Pixelgrade customer ID. Pixelgrade retains the normalized URL, first/last-seen dates, latest observed service, stack details, and aggregate daily request counts at `https://cloud.pixelgrade.com` (`/wp-json/pixcloud/v1/front/stats`). The registry does not include site content, credentials, license hashes, support messages, email addresses, user names, or IP addresses. These requests are described as observed service traffic, not as clicks or completed user actions.

The WordPress.org build never downloads or installs plugin code from servers other than WordPress.org.

Your use of these Pixelgrade services is subject to Pixelgrade's privacy policy and terms, available at [pixelgrade.com](https://pixelgrade.com/).

== Issues ==

If you identify any errors or have an idea for improving the plugin, please open an [issue](https://github.com/pixelgrade/pixelgrade-assistant/issues?stage=open).

If Github is not your thing but you are passionate about Pixelgrade Assistant and want to help us make it better, don't hesitate to [reach us](https://pixelgrade.com/contact/).

== Credits ==

Unless otherwise specified, all the plugin files, scripts and images are licensed under GNU General Public License v3.0.
This plugin makes heavy use of JavaScript libraries and packages since it's entire interface is built with React. The primary packages being bundled are as follows:

* [@babel/core](https://www.npmjs.com/package/@babel/core) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [@material-ui/core](https://www.npmjs.com/package/@material-ui/core) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [@material-ui/icons](https://www.npmjs.com/package/@material-ui/icons) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [@material-ui/styles](https://www.npmjs.com/package/@material-ui/styles) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [core-js](https://www.npmjs.com/package/core-js) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [entities](https://www.npmjs.com/package/entities) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [lodash](https://www.npmjs.com/package/lodash) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [qs](https://www.npmjs.com/package/qs) - License: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
* [react](https://www.npmjs.com/package/react) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [react-dom](https://www.npmjs.com/package/react-dom) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [react-redux](https://www.npmjs.com/package/react-redux) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [redux](https://www.npmjs.com/package/redux) - License: [MIT](http://opensource.org/licenses/mit-license.html)

== Installation ==

Installing "Pixelgrade Assistant" can be done either by searching for "Pixelgrade Assistant" via the `Plugins → Add New` screen in your WordPress dashboard, or by using the following steps:

1. Download the plugin via WordPress.org.
2. Upload the ZIP file through the `Plugins → Add New → Upload` screen in your WordPress dashboard.
3. Activate the plugin through the `Plugins` menu in WordPress.
4. Head over to `Pixelgrade` and set things up.

== Frequently Asked Questions ==

= Do I need a Pixelgrade.com account or a license? =

No. Pixelgrade Assistant works fully without an account or a license. You can install the recommended free plugins, import starter content, and use the dashboard with no connection at all. Connecting an account is optional and only adds extras like cloud starter content and premium support.

= What is Pixelgrade Plus? =

Pixelgrade Plus is the optional premium companion for the Pixelgrade LT stack — advanced design tools that build on everything in the free stack. You can keep using the free stack indefinitely; Plus is there if you want more. Learn more at [pixelgrade.com](https://pixelgrade.com/).

= I'm already using Pixelgrade Care — will this conflict? =

No. If Pixelgrade Care (our legacy companion for premium themes) is active, Pixelgrade Assistant detects it and stays out of the way — it does not load a second dashboard or touch your existing license. Your current setup keeps working exactly as before. New LT-stack sites use Pixelgrade Assistant, with Pixelgrade Plus as the optional premium path.

= Is this plugin tracking me? =

Pixelgrade Assistant does not perform advertising, cross-site, or event-level behavioral tracking. The first-party services required for configuration, documentation, design assets, and starter content automatically retain your canonical site URL and the minimal operational context listed in the External services section. They do not receive your site content, credentials, license hashes, support messages, email address, user name, or IP address as part of the site registry.

== Screenshots ==

1. Main dashboard tab
2. Useful links tab
3. System status tab
4. Contextual docs sidebar
5. Open support ticket tab
6. Site setup wizard

== Changelog ==

= 2.3.0 =
* New onboarding: an essentials-first Site Setup checklist can install or activate Anima LT, Style Manager, and Nova Blocks from one place.
* Design previews: Styles now shows live, site-specific color and typography previews that refresh with Style Manager changes.
* Companion extensions: new contributed sections for Styles and Setup, plus setup-readiness checks that participate in the overall status.
* Starter imports now repair missing media on re-import, skip unavailable optional taxonomies, and exclude locked WooCommerce content and settings while preserving server-side enforcement.

= 2.2.2 =
* Service infrastructure: functional Pixelgrade requests now use a documented first-party site registry with explicit URL/stack context and aggregate service reporting.

= 2.2.1 =
* Service infrastructure: functional Pixelgrade requests now use a documented first-party site registry with explicit URL/stack context and aggregate service reporting.
* Fix: remote theme-configuration lookups are now strictly rate-limited with a cached fallback, eliminating the excessive background requests to pixelgrade.com that some installs generated.
* Fix: a PHP 8.2 deprecation notice (dynamic property) in the navigation menu integration.
* Fix: the editor docs launcher now uses WordPress core's interface package, avoiding a duplicate `core/interface` store warning in the Site Editor.
* Onboarding: a failed starter import can be retried right from the error state, without re-asking the "already imported?" confirmation.
* Onboarding: after a full starter import, the default WordPress sample content is moved to trash and the Layouts card correctly reflects the import.
* Onboarding: recommended plugins now install inline within the starter apply flow, a Get Started checklist guides the free path, and the duplicate "Install Plugins" menu item is gone.
* Smaller release package — internal development docs are no longer bundled.

= 2.2.0 =
* Fix: Anima LT is now recognized out of the box — the free WordPress.org build no longer comes up unrecognized, so starter sites, recommended plugins, and the setup wizard all work as intended.
* Style Manager now appears alongside Nova Blocks as a recommended companion, so the full free Pixelgrade LT stack sets up in one pass.
* New home: the whole experience now lives under Appearance → Pixelgrade Design — a calmer hub organized into Home, Design System, Starter Sites, Layouts, Page Patterns, Setup, Account, and Help.
* Starter Sites: pick a free Anima LT starter (Hive, Rosa, Mies, Felt, Julia, or Pile LT), preview it, and choose how much of it to apply.
* Layouts: browse and apply individual templates and parts with live previews, without importing a whole site.
* New: Page Patterns — add ready-made page designs to your site.
* Help & Docs: a redesigned Help tab and a floating documentation window that follows you across the dashboard and opens articles right where you are working — no new tabs.
* Account: optional, account-free by default; connect a free Pixelgrade account for support when you want it, and it coexists cleanly with Pixelgrade Care.
* Plenty of clearer, jargon-free copy throughout, plus performance and reliability improvements to previews and starter imports.

= 2.1.0 =
* New: Pixelgrade Docs sidebar - browse, search, read, and rate your theme's documentation right inside the block editor.
* Finished moving account and license features out to the optional Pixelgrade Plus companion; the free plugin is now fully account-free.
* Added extension points so companion plugins (like Pixelgrade Plus) can build on the dashboard cleanly.
* The starter content card now always shows, regardless of any leftover connection state.
* Fixes: bundled translations now load correctly; in-dashboard documentation resolves to the right theme; hardened starter-content downloads against unexpected sources.
* Under the hood: modernized the build toolchain (Node 20 LTS, Dart Sass) and cleared all dependency security advisories.

= 2.0.0 =
* Reborn as the free, community-first companion for the Pixelgrade LT stack (Anima LT, Style Manager, and Nova Blocks).
* No account and no license required — install the recommended free plugins from WordPress.org and import starter content right out of the box.
* Removed the legacy in-dashboard support overlay, the external-plugin installer, and the account/license machinery. Premium design tools now live in the optional Pixelgrade Plus companion.
* Calmer dashboard — the header reflects your theme's health, with no connection nags.
* Added a clear "External services" disclosure; usage data is strictly opt-in and off by default.
* Lighter, faster admin bundle. Now requires WordPress 5.9 and PHP 7.4.

= 1.4.0 =
* Fixes and improvements throughout the plugin dashboard
* Prevent updates to unsupported version of plugins that our themes rely upon (e.g. Nova Blocks, Style Manager).
* Update node packages to their latest version
* Ensure compatibility with the latest WordPress 5.9.3.

= 1.3.5 =
* Tested with the latest WordPress 5.8.3.
* Better compatibility for themes based on the Classic Editor.

= 1.3.4 =
* Fixes for starter content (demo data) importing process.
* Minor styling and copy improvements.

= 1.3.2 =
* Fixes for starter content (demo data) importing process.
* Minor styling and copy improvements.

= 1.3.1 =
* Improvements and fixes to the theme update notice.
* Minor styling and copy improvements.

= 1.3.0 =
* Better starter content (aka demo data) management.
* Added support for multiple starter content sources (if available).
* Added starter content import logging field so you can see what is going on.
* Minor styling and copy improvements.

= 1.2.1 =
* Fixed a couple of bugs related to the new recommended plugins management.
* Fixed an issue related to the setup wizard page showing "no access".

= 1.2.0 =
* Better recommended plugins management.
* Fixed a couple of edge cases regarding setup wizard.
* Force all recommended plugins to be recommended, not required.
* Updated npm packages to the latest versions.

= 1.1.5 =
* Better handling for error during the import of the starter content (demo content).

= 1.1.4 =
* Added notification for feedback/rating.

= 1.1.2 =
* Fixed an issue with importing demo content images.
* Fixed an issue with activating recommended plugins
* Fixed some JS errors.

= 1.1.1 =
* Minor fix for better theme compatibility.

= 1.1.0 =
* Added the "Recommended Plugins" section to the dashboard also
* Compatibility and stability improvements
* Updated npm packages to latest versions
* Minor styling improvements

= 1.0.0 =
* Let's rock!
