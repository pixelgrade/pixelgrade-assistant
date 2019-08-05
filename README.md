# Pixelgrade Assistant

Pixelgrade Assistant is a plugin to go along with any free WordPress theme made by Pixelgrade.

It will elevate the whole experience of setting up your site:
* recommended plugins
* starter content
* premium support access
* theme documentation right in your WordPress dashboard
* various functionality and logic that a theme may need to do it's best work.

All these facilities and enhancements are conditioned by having your site connected with pixelgrade.com. This way we can leverage our already existing infrastructure to best serve our free themes users also, with the efficiency required by a small team.

You can chose not to use Pixelgrade Assistant but you will not be able to access the benefits that accompany your Pixelgrade theme.

## Developers

The JavaScript files located at `admin/src` get transpiled, tree-shaken and bundled together (via Rollup or Browserify) into `admin/js`. 

The SCSS files located at `admin/scss` get processed into CSS located at `admin/css`.

We use **Gulp and npm** for all development and build tasks. So, to get started run the following commands from a terminal:

* First, `npm install`
* To compile everything in dev mode, run `npm run dev`
* To compile everything in production mode, run `npm run production`
* To compile everything in distribution (release) mode, run `npm run distribution`
* After you have compiled the JS and SCSS, if you want to generate a `.zip` file of the WordPress plugin ready to install, run the `gulp zip` command.

That is is. If you have suggestions or even PR, don't hesitate.

## License

This software is licensed under the GPL v3.0 license.
