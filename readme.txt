=== Pixelgrade Assistant ===
Contributors: pixelgrade, vlad.olaru
Tags: dashboard, starter-content, demo-content, recommended-plugins, pixelgrade
Requires at least: 4.9.9
Tested up to: 7.0
Requires PHP: 5.6.40
Stable tag: 1.4.0
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

**No account required.** Pixelgrade Assistant works out of the box — you do not need a Pixelgrade.com account or a license to use the free stack. Connecting an account is entirely optional and only unlocks extras such as cloud starter content, account sync, and premium support (see *External services* below).

Looking for more? **Pixelgrade Plus** is the optional premium companion that adds advanced design tools — motion and animation controls, advanced Style Manager sections, pro starter sites, design packs, and priority support. It is never required, and you can explore it any time from the Pixelgrade screen.

**Made with love by [Pixelgrade](https://pixelgrade.com)**

== External services ==

Pixelgrade Assistant runs almost entirely on your own site — installing recommended plugins (from WordPress.org), documentation links, and the stack-health information never leave your server. A few features reach Pixelgrade-hosted services, described below. No Pixelgrade.com account is required for any of them.

* **Theme configuration (pixelgrade.com).** When you open the Pixelgrade Assistant screen, the plugin requests a small configuration file for your theme from `https://pixelgrade.com` (`/wp-json/pxm/v2/front/get_config`). It sends only your theme identifier, the result is cached locally, and it is not requested on every page load or on a schedule.
* **Starter content (demos.pixelgrade.com).** When — and only when — you click Import on the starter content, the plugin downloads your theme's demo content (text, settings, menus, and images) from `https://demos.pixelgrade.com`. Nothing is downloaded until you start an import, and no account is required.
* **Optional usage data (pixelgrade.com).** If — and only if — you opt in, the plugin may share non-identifying information about your WordPress install so we can improve the free Pixelgrade stack and assist you faster. This is off by default.

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

Pixelgrade Plus is the optional premium companion for the Pixelgrade LT stack. It adds advanced design tools — motion and animation controls, advanced Style Manager sections, pro starter sites, design packs, and priority support. You can keep using the free stack indefinitely; Plus is there if you want more. Learn more at [pixelgrade.com](https://pixelgrade.com/).

= I'm already using Pixelgrade Care — will this conflict? =

No. If Pixelgrade Care (our legacy companion for premium themes) is active, Pixelgrade Assistant detects it and stays out of the way — it does not load a second dashboard or touch your existing license. Your current setup keeps working exactly as before. New LT-stack sites use Pixelgrade Assistant, with Pixelgrade Plus as the optional premium path.

= Is this plugin tracking me? =

No. We are not tracking you or your site. Sharing is entirely optional and off by default. If you opt in, we collect non-specific theme usage data and information about your WordPress install so we can improve the free Pixelgrade stack and help you faster when you reach out - we are a small team and need to be as efficient as possible.

*It is up to you if you are willing to share this data with us.* We respect your decision. We truly appreciate it if you do, but we will do our best to serve you regardless.

== Screenshots ==

1. The dashboard — stack health at a glance and recommended free plugins
2. The Customizations tab
3. The System Status tab
4. The optional, skippable site setup wizard
5. Pixelgrade Plus — the optional premium companion

== Changelog ==

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
