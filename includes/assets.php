<?php
/**
 * Helpers for enqueuing build artifacts produced by the @wordpress/scripts toolchain.
 *
 * The modern host shell is built with `@wordpress/scripts` into `admin/build/`. Alongside each
 * JS bundle, wp-scripts emits a `*.asset.php` manifest that declares the script's WordPress/vendor
 * dependencies and a content-hash version. These helpers read that manifest and enqueue the bundle
 * with the right dependencies + cache-busting version, so the host shell and later companion
 * surfaces (#43/#44/#46) all enqueue the same way.
 *
 * Function-style, mirroring includes/capabilities.php — no class, no new state.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_read_asset_manifest' ) ) {
	/**
	 * Read a `@wordpress/scripts` `*.asset.php` dependency manifest.
	 *
	 * Pure reader: given the absolute path to a manifest, return its declared script dependencies
	 * and version hash. When the file is missing (build not run yet) or malformed (does not return
	 * an array), fall back to safe empty defaults so callers never fatal and never see a missing key.
	 *
	 * @param string $path Absolute path to a `*.asset.php` manifest file.
	 *
	 * @return array {
	 *     @type string[] $dependencies Script handles this bundle depends on.
	 *     @type string   $version      Content-hash version string for cache busting.
	 * }
	 */
	function pixassist_read_asset_manifest( $path ) {
		$defaults = array(
			'dependencies' => array(),
			'version'      => '',
		);

		if ( ! is_string( $path ) || ! file_exists( $path ) ) {
			return $defaults;
		}

		$manifest = include $path;

		if ( ! is_array( $manifest ) ) {
			return $defaults;
		}

		return array(
			'dependencies' => ( isset( $manifest['dependencies'] ) && is_array( $manifest['dependencies'] ) )
				? array_values( $manifest['dependencies'] )
				: array(),
			'version'      => ( isset( $manifest['version'] ) && is_string( $manifest['version'] ) )
				? $manifest['version']
				: '',
		);
	}
}

if ( ! function_exists( 'pixassist_enqueue_built_script' ) ) {
	/**
	 * Register + enqueue a build artifact from `admin/build/`, wired to its asset manifest.
	 *
	 * Resolves `admin/build/{$name}.js` and its sibling `admin/build/{$name}.asset.php`, then
	 * registers the script with the manifest's dependencies (merged with any extra dependencies,
	 * de-duplicated) and the manifest's version hash for cache busting.
	 *
	 * @param string   $handle     Script handle to register/enqueue under.
	 * @param string   $name       Build entry name (file base, without extension) under admin/build/.
	 * @param string[] $extra_deps Optional extra script handles to depend on, beyond the manifest.
	 * @param bool     $in_footer  Optional. Whether to enqueue in the footer. Default true.
	 *
	 * @return string The script handle.
	 */
	function pixassist_enqueue_built_script( $handle, $name, $extra_deps = array(), $in_footer = true ) {
		$relative = 'admin/build/' . $name;

		$manifest = pixassist_read_asset_manifest( PIXELGRADE_ASSISTANT__PLUGIN_DIR . $relative . '.asset.php' );

		$deps    = array_values( array_unique( array_merge( $manifest['dependencies'], (array) $extra_deps ) ) );
		$version = ! empty( $manifest['version'] ) ? $manifest['version'] : false;
		$src     = plugin_dir_url( PIXELGRADE_ASSISTANT__PLUGIN_FILE ) . $relative . '.js';

		wp_register_script( $handle, $src, $deps, $version, $in_footer );
		wp_enqueue_script( $handle );

		return $handle;
	}
}
