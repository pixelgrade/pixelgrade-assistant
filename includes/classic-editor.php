<?php
/**
 * Classic Editor loading policy.
 *
 * @package PixelgradeAssistant
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Determines whether the active theme explicitly requires Assistant's bundled Classic Editor.
 *
 * The block editor is the default. Classic Editor is loaded only when a theme config opts in via
 * `classicEditorRequired: true`, or through the legacy explicit `gutenbergReady: false` signal.
 *
 * @param array|false $config Theme config.
 *
 * @return bool
 */
function pixassist_theme_requires_classic_editor( $config ) {
	if ( ! is_array( $config ) ) {
		return false;
	}

	if ( array_key_exists( 'classicEditorRequired', $config ) ) {
		return true === filter_var( $config['classicEditorRequired'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
	}

	if ( array_key_exists( 'gutenbergReady', $config ) ) {
		return false === filter_var( $config['gutenbergReady'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
	}

	return false;
}
