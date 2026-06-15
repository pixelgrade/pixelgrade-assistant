# Pixelgrade Assistant

Pixelgrade Assistant is the free companion plugin for Pixelgrade's free WordPress themes and the
Pixelgrade LT stack (Anima LT + Style Manager + Nova Blocks).

It smooths out setting up your site:

* recommended free plugins, installed straight from WordPress.org
* starter/demo content so your site can look like the theme's demo
* theme documentation right in your WordPress dashboard
* theme helpers and update guardrails that a theme may need to do its best work

**No account required.** Pixelgrade Assistant works on its own — you don't need to connect a
Pixelgrade account to use the free stack. Commercial features live in a separate, optional
**Pixelgrade Plus** plugin; you can keep using the free stack for as long as you like.

For the list of outside services the plugin talks to (and when), see the **External Services**
section in `readme.txt`.

## Developers

The JavaScript files in `admin/src` get transpiled, tree-shaken and bundled (via Rollup) into
`admin/js`. The SCSS files in `admin/scss` get compiled (via Dart Sass) into `admin/css`.

We use **Gulp + npm** (Node 20 LTS) for all development and build tasks. From a terminal:

* First, `nvm use` then `npm install`
* Compile in dev mode: `npm run dev`
* Compile in production mode: `npm run production`
* Compile in distribution (release) mode: `npm run distribution`
* To generate an installable `.zip` of the plugin after compiling, run `./node_modules/.bin/gulp zip`

That's it. Suggestions and PRs are welcome.

## License

This software is licensed under the GPL v3.0 license.
