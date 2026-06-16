/**
 * Webpack config for the modern (@wordpress/scripts) build pipeline.
 *
 * Extends the wp-scripts default config (which includes the DependencyExtractionWebpackPlugin
 * that emits the `*.asset.php` manifests) and only overrides the entry + output location so the
 * modern host shell builds from `admin/src-modern/` into `admin/build/`.
 *
 * This runs in parallel to the legacy gulp + rollup pipeline (admin/src -> admin/js); that one
 * is untouched and retired later (#43).
 */
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	// The repo's legacy `browserslist` file includes "maintained node versions" for the gulp/babel
	// pipeline. Webpack would resolve a mixed browser+Node target from it and fail to pick a chunk
	// format. The host shell is a browser bundle, so pin a browser target here and leave the legacy
	// browserslist untouched.
	target: [ 'web', 'es2017' ],
	entry: {
		index: path.resolve( process.cwd(), 'admin/src-modern', 'index.js' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( process.cwd(), 'admin/build' ),
	},
};
