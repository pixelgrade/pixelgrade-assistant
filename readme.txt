=== Pixelgrade Assistant ===
Contributors: pixelgrade, vlad.olaru
Tags: dashboard, support, pixelgrade, starter-content, demo-data, documentation
Requires at least: 4.9.9
Tested up to: 5.3.2
Requires PHP: 5.4.0
Stable tag: 1.3.2
License: GPLv3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Help and assistance for Pixelgrade WordPress themes.

== Description ==

Pixelgrade Assistant is a plugin to go along with any free WordPress theme made by Pixelgrade.

It will elevate the whole experience of setting up your site:

* **recommended plugins**
* **starter/demo content one-click import**
* **premium support access** right in your WordPress dashboard
* **theme documentation** right in your WordPress dashboard
* various functionality and logic that a theme may need to do it's best work.

All these facilities and enhancements are *conditioned* by having your site connected with pixelgrade.com. This way we can leverage our already existing infrastructure to best serve our free themes users also, with the efficiency required by a small team.
You can chose not to use Pixelgrade Assistant but you will not be able to access the benefits that accompany your Pixelgrade theme.

**Made with love by [Pixelgrade](https://pixelgrade.com)**

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
* [aws-sdk](https://www.npmjs.com/package/aws-sdk) - License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
* [bodybuilder](https://www.npmjs.com/package/bodybuilder) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [core-js](https://www.npmjs.com/package/core-js) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [crypto-js](https://www.npmjs.com/package/crypto-js) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [elasticsearch](https://www.npmjs.com/package/elasticsearch) - License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
* [entities](https://www.npmjs.com/package/entities) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [http-aws-es](https://www.npmjs.com/package/http-aws-es) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [lodash](https://www.npmjs.com/package/lodash) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [oauth-1.0a](https://www.npmjs.com/package/oauth-1.0a) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [oauth-signature](https://www.npmjs.com/package/oauth-signature) - License: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
* [qs](https://www.npmjs.com/package/qs) - License: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
* [react](https://www.npmjs.com/package/react) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [react-dom](https://www.npmjs.com/package/react-dom) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [react-cookies](https://www.npmjs.com/package/react-cookies) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [react-redux](https://www.npmjs.com/package/react-redux) - License: [MIT](http://opensource.org/licenses/mit-license.html)
* [redux](https://www.npmjs.com/package/redux) - License: [MIT](http://opensource.org/licenses/mit-license.html)

== Installation ==

Installing "Pixelgrade Assistant" can be done either by searching for "Pixelgrade Assistant" via the `Plugins → Add New` screen in your WordPress dashboard, or by using the following steps:

1. Download the plugin via WordPress.org.
2. Upload the ZIP file through the `Plugins → Add New → Upload` screen in your WordPress dashboard.
3. Activate the plugin through the `Plugins` menu in WordPress.
4. Head over to `Pixelgrade` and set things up.

== Frequently Asked Questions ==

= Is the site connection secure? =

Yes. We use a secure authorization protocol (OAuth1.0a) for setting up the connection.

= If I connect my site, do you gain access to my site? =

No. Connecting your site is just a small exchange of keys meant to establish a way to securely send information, when needed. We don't have your passwords or other methods to gain access to your site.

If you have a support question that requires us to take a look in your WordPress dashboard, we will ask you for a *temporary username and password* with admin permissions. But **that is up to you to provide.**

= Is this plugin tracking me? =

No. We are not tracking you or your site. We ask your permission to share with us non-specific theme usage data and information about your WordPress install so we can resolve support questions faster - we are a small team and need to be as efficient as possible.

*It is up to you if you are willing to share this data with us.* We respect your decision. We truly appreciate it if you do, but we will do our best to serve you regardless.

== Screenshots ==

1. Main dashboard tab
2. Useful links tab
3. System status tab
4. Main theme help tab
5. Open support ticket tab
6. Site setup wizard

== Changelog ==

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
