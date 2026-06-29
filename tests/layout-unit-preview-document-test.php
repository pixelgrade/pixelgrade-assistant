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

function esc_html( $value ) {
	return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
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
assert_true( false !== strpos( $document, 'anima-intro-target--pending' ), 'Preview runtime must explicitly reveal Anima/Nova intro targets because static previews disable the animations that would normally reveal them.' );
assert_true( false !== strpos( $document, 'revealNovaHeroMedia' ), 'Preview runtime must explicitly reveal Nova stacked hero media because static previews suppress the animation controller that normally flips hero images from display:none to visible.' );
assert_true( false !== strpos( $document, 'img.nb-supernova-item__media' ), 'Preview runtime must target Nova hero media images, not only text intro targets.' );
assert_true( false !== strpos( $document, 'MutationObserver' ), 'Preview runtime must keep Nova hero media visible when a late carousel pass rewrites inline display styles.' );
assert_true( false !== strpos( $document, "position', 'absolute'" ), 'Preview runtime must anchor Nova hero media to the hero box instead of keeping fixed-position parallax media tied to the resized iframe viewport.' );
assert_true( false !== strpos( $document, 'stablePreviewViewportHeight' ), 'Preview runtime must freeze Nova hero vh sizing against the initial preview viewport, not the resized iframe height.' );
assert_true( false !== strpos( $document, 'data-min-height-fallback' ), 'Preview runtime must use Nova hero height fallback data to preserve configured hero proportions in static previews.' );
assert_true( false !== strpos( $document, 'pixassist-nova-hero-preview-style' ), 'Preview runtime must inject CSS that keeps Nova hero media anchored in the hero box after late parallax rewrites.' );
assert_true( false !== strpos( $document, 'blob-mix__mask' ), 'Preview runtime must clamp Nova media-composition layers too, otherwise object-fit crops from an oversized inner media box.' );

$content_method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'render_content_unit_preview_document' );
$content_method->setAccessible( true );

$content_post = array(
	'post_title'   => 'Contact',
	'post_excerpt' => 'Reach us',
	'post_content' => '<!-- wp:paragraph --><p>Pattern body</p><!-- /wp:paragraph -->',
);

ob_start();
$content_method->invoke( $starter_content, $content_post );
$content_document = ob_get_clean();

assert_true( false !== strpos( $content_document, 'wp-block-post-content' ), 'Content-unit previews must wrap source blocks in the real post-content flow class so theme block-gap/layout rules apply.' );
assert_true( false !== strpos( $content_document, 'entry-content' ), 'Content-unit previews must use the front-end entry-content wrapper expected by theme styles.' );
assert_true( false === strpos( $content_document, 'pixassist-content-preview-header' ), 'Content-unit previews must not inject an extra title/excerpt header that is not part of the source page pattern.' );
assert_true( false !== strpos( $content_document, 'Pattern body' ), 'Content-unit previews must still render the supplied source block content.' );

assert_true( method_exists( 'PixelgradeAssistant_StarterContent', 'get_content_unit_demo_preview_url' ), 'Page Patterns demo mode needs an allow-listed source preview URL resolver.' );

$demo_url_method = new ReflectionMethod( 'PixelgradeAssistant_StarterContent', 'get_content_unit_demo_preview_url' );
$demo_url_method->setAccessible( true );

assert_true(
	'https://starter.pixelgrade.com/felt-lt/?page_id=2039' === $demo_url_method->invoke(
		$starter_content,
		'https://starter.pixelgrade.com/felt-lt/wp-json/sce/v2/',
		array( 'link' => 'https://starter.pixelgrade.com/felt-lt/?page_id=2039' )
	),
	'Content demo previews must preserve the source record permalink when it belongs to the same allowed demo host.'
);
assert_true(
	'' === $demo_url_method->invoke(
		$starter_content,
		'https://starter.pixelgrade.com/felt-lt/wp-json/sce/v2/',
		array( 'link' => 'https://example.invalid/contact/' )
	),
	'Content demo previews must reject source permalinks outside the selected demo host.'
);

echo "Layout unit preview document OK\n";
