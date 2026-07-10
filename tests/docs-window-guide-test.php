<?php
/**
 * Pins the companion guide surface of the floating docs window (openGuide).
 *
 * Companions (Nova Blocks, Style Manager, …) push a SERIALIZABLE guide payload
 * ({ id, title, content, actions }) into the window via
 * window.pixelgradeAdminHub.docs.openGuide(); action button clicks come back as
 * `pixelgrade-docs:guide-action` CustomEvents. This test pins the source-level
 * contract so a refactor can't silently drop it:
 *   - listener-attested delivery (same rule as openArticle),
 *   - live re-push of the SAME guide id must not steal focus / un-minimize,
 *   - guide requests are page-scoped: excluded from persistence AND the
 *     follow-everywhere cookie,
 *   - guide mode never fetches an article,
 *   - both sender and receiver normalize the serializable payload boundary.
 *
 * Standalone: run with `php tests/docs-window-guide-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

$events_source  = file_get_contents( __DIR__ . '/../admin/src-modern/docs/events.js' );
$entry_source   = file_get_contents( __DIR__ . '/../admin/src-modern/docs/window-entry.js' );
$kbpanel_source = file_get_contents( __DIR__ . '/../admin/src-modern/docs/KbPanel.js' );

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, 'FAIL: ' . $message . PHP_EOL );
		exit( 1 );
	}
}

function assert_match( $pattern, $subject, $message ) {
	assert_true( 1 === preg_match( $pattern, $subject ), $message );
}

// --- events.js: the guide event vocabulary + listener-attested opener. -------------------------

assert_match(
	'/DOCS_EVENT_OPEN_GUIDE\s*=\s*\'pixelgrade-docs:open-guide\'/',
	$events_source,
	'events.js must define the open-guide event name.'
);

assert_match(
	'/DOCS_EVENT_GUIDE_ACTION\s*=\s*\'pixelgrade-docs:guide-action\'/',
	$events_source,
	'events.js must define the guide-action event name.'
);

assert_match(
	'/export function openDocsGuide\( payload \) \{[^}]*listenerCount\(\) < 1[^}]*return false;/s',
	$events_source,
	'openDocsGuide must attest delivery: return false when no window is mounted (callers keep their fallback UI).'
);

assert_match(
	'/export function normalizeDocsGuidePayload\( payload \)/',
	$events_source,
	'events.js must normalize the public guide payload to serializable descriptors.'
);

assert_match(
	'/const guide = normalizeDocsGuidePayload\( payload \);\s*if \( ! guide \) \{\s*return false;/',
	$events_source,
	'openDocsGuide must reject malformed payloads before dispatch.'
);

assert_match(
	'/export function emitDocsGuideAction\( guideId, actionId \)/',
	$events_source,
	'The window must be able to dispatch guide actions back to the owning companion.'
);

// --- window-entry.js: the companion-facing hub surface. ----------------------------------------

assert_match(
	'/openGuide:\s*openDocsGuide/',
	$entry_source,
	'window.pixelgradeAdminHub.docs must expose openGuide for companions.'
);

// --- KbPanel.js: the window-side behavior. ------------------------------------------------------

assert_match(
	'/addEventListener\( DOCS_EVENT_OPEN_GUIDE, onOpenGuide \)/',
	$kbpanel_source,
	'DocsArticleWindow must listen for open-guide events.'
);

assert_match(
	'/const payload = normalizeDocsGuidePayload\( event && event\.detail \);\s*if \( ! payload \)/',
	$kbpanel_source,
	'DocsArticleWindow must normalize direct open-guide events at the receiving boundary.'
);

assert_match(
	'/const sameGuide = [^;]*prev\.guide\.id === payload\.id[^;]*;\s*if \( ! sameGuide \) \{/',
	$kbpanel_source,
	'A re-push of the same guide id must be treated as a live update (no focus steal, no un-minimize).'
);

assert_match(
	'/const persistableRequest = request && request\.guide \? null : request;/',
	$kbpanel_source,
	'Guide requests must be excluded from the persisted window state.'
);

assert_match(
	'/setDocsOpenCookie\( !! persistableRequest \)/',
	$kbpanel_source,
	'Guide requests must not keep the follow-everywhere cookie alive.'
);

assert_match(
	'/if \( request\.guide \) \{\s*setLoading\( false \);/',
	$kbpanel_source,
	'Guide mode must short-circuit the article fetch effect.'
);

assert_match(
	'/function GuideView\( \{ guide \} \)[\s\S]{0,1800}?emitDocsGuideAction\( guide\.id, action\.id \)/',
	$kbpanel_source,
	'Guide action buttons must dispatch guide-action events keyed by the guide id.'
);

assert_match(
	'/closest\( \'\[data-guide-action\]\' \)[\s\S]{0,300}?emitDocsGuideAction\( guide\.id, trigger\.getAttribute\( \'data-guide-action\' \) \)/',
	$kbpanel_source,
	'Inline data-guide-action elements inside guide content must dispatch guide-action events (contextual links like "Show me the block").'
);

echo 'OK: docs window guide surface contracts hold.' . PHP_EOL;
