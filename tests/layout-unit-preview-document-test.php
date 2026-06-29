<?php
/**
 * Pins the site-mode layout-unit preview document shell.
 *
 * Standalone: run with `php tests/layout-unit-preview-document-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters'] = array();

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = array(
		'callback' => $callback,
		'args'     => $args,
	);

	return true;
}

function apply_filters( $hook, $value ) {
	return $value;
}

function show_admin_bar( $show ) {
	$GLOBALS['paf_show_admin_bar'] = (bool) $show;
}

function get_bloginfo( $show = '' ) {
	return 'charset' === $show ? 'UTF-8' : '';
}

function esc_attr( $value ) {
	return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
}

function language_attributes() {
	echo 'lang="en-US"';
}

function wp_head() {
	echo '<style id="theme-alignfull">.wp-site-blocks > .alignfull, .nb-sidecar-area--content { grid-column: fs / fe !important; }</style>';
}

function body_class( $class = '' ) {
	echo 'class="' . esc_attr( $class ) . '"';
}

function do_blocks( $markup ) {
	return $markup;
}

function wp_footer() {}

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

$starter_content = new PixelgradeAssistant_StarterContent( (object) array( 'file' => __FILE__ ) );
$method          = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'render_layout_unit_preview_document' );
$method->setAccessible( true );

$sidecar_markup = '<div class="nb-sidecar"><div class="nb-sidecar-area--content alignfull">Post body</div><aside class="nb-sidecar-area--sidebar">Sidebar</aside></div>';

ob_start();
$method->invoke( $starter_content, $sidecar_markup );
$document = ob_get_clean();

$theme_alignfull_rule = strpos( $document, '.wp-site-blocks > .alignfull' );
$sidecar_guard_rule   = strpos( $document, '.pixassist-layout-preview-canvas .nb-sidecar .nb-sidecar-area--content' );

assert_true( false !== $theme_alignfull_rule, 'The fixture must include the theme constrained alignfull rule before the preview guard.' );
assert_true( false !== $sidecar_guard_rule, 'Preview document CSS must guard sidecar content placement from theme alignfull rules.' );
assert_true( $sidecar_guard_rule > $theme_alignfull_rule, 'The sidecar placement guard must be emitted after wp_head() theme CSS.' );
assert_true( false !== strpos( $document, 'grid-column: var(--block-content-start) / var(--block-content-end) !important;' ), 'The sidecar guard must restore Nova Blocks sidecar content grid placement from its own variables with enough priority to beat full-width grid-container rules.' );
assert_true( false !== strpos( $document, $sidecar_markup ), 'The preview document must still render the supplied block markup.' );

echo "Layout unit preview document OK\n";
