<?php
/**
 * Pins the Layouts tab persisted UI preferences.
 *
 * Standalone: run with `php tests/layout-units-preferences-test.php`.
 *
 * @package PixelgradeAssistant
 */

$helper = __DIR__ . '/../admin/src-modern/hub/preferences.js';

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

assert_true( file_exists( $helper ), 'The modern hub preferences helper must exist.' );

$node_script = <<<'JS'
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('@babel/core');

const helperPath = process.argv[2];
const source = fs.readFileSync(helperPath, 'utf8');
const transformed = babel.transformSync(source, {
	filename: helperPath,
	presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' }, modules: 'commonjs' }]],
	babelrc: false,
	configFile: false,
}).code;

const module = { exports: {} };
vm.runInNewContext(transformed, {
	module,
	exports: module.exports,
	require,
	console,
	window: undefined,
}, { filename: helperPath });

const prefs = module.exports;

function assertDeepEqual(actual, expected, message) {
	const actualJson = JSON.stringify(actual);
	const expectedJson = JSON.stringify(expected);
	if (actualJson !== expectedJson) {
		throw new Error(message + '\nExpected: ' + expectedJson + '\nActual:   ' + actualJson);
	}
}

function assertEqual(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(message + '\nExpected: ' + expected + '\nActual:   ' + actual);
	}
}

function makeStorage(initial = {}) {
	const store = { ...initial };
	return {
		getItem(key) {
			return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
		},
		setItem(key, value) {
			store[key] = String(value);
		},
		dump() {
			return { ...store };
		},
	};
}

const defaultLayoutPrefs = {
	typeFilter: 'all',
	sourceFilter: 'all',
	viewMode: 'grid',
	columns: 2,
};
const defaultContentPatternPrefs = {
	typeFilter: 'all',
	sourceFilter: 'all',
	viewMode: 'grid',
	columns: 2,
};

assertEqual(prefs.LAYOUT_UNIT_PREFERENCES_STORAGE_KEY, 'pixassist_layout_units_preferences', 'The Layouts preference key must be stable.');
assertEqual(prefs.CONTENT_PATTERN_PREFERENCES_STORAGE_KEY, 'pixassist_content_patterns_preferences', 'The Page Patterns preference key must be separate from Layouts.');
assertEqual(prefs.PREVIEW_MODE_STORAGE_KEY, 'pixassist_preview_mode', 'The preview mode key must keep the existing storage contract.');

assertDeepEqual(
	prefs.getLayoutUnitPreferences(makeStorage()),
	defaultLayoutPrefs,
	'Missing stored Layouts preferences must hydrate defaults.'
);

const storedLayoutPrefs = makeStorage({
	pixassist_layout_units_preferences: JSON.stringify({
		typeFilter: 'headers',
		sourceFilter: 'felt-lt',
		viewMode: 'list',
		columns: 4,
		ignored: 'not-localized',
	}),
});
assertDeepEqual(
	prefs.getLayoutUnitPreferences(storedLayoutPrefs),
	{
		typeFilter: 'headers',
		sourceFilter: 'felt-lt',
		viewMode: 'list',
		columns: 4,
	},
	'Valid stored Layouts preferences must survive a new page session.'
);

const invalidLayoutPrefs = makeStorage({
	pixassist_layout_units_preferences: JSON.stringify({
		typeFilter: '',
		sourceFilter: 17,
		viewMode: 'table',
		columns: 99,
	}),
});
assertDeepEqual(
	prefs.getLayoutUnitPreferences(invalidLayoutPrefs),
	defaultLayoutPrefs,
	'Invalid stored Layouts preferences must fall back field-by-field.'
);

assertDeepEqual(
	prefs.getContentPatternPreferences(makeStorage()),
	defaultContentPatternPrefs,
	'Missing stored Page Patterns preferences must hydrate defaults.'
);

const storedContentPatternPrefs = makeStorage({
	pixassist_content_patterns_preferences: JSON.stringify({
		typeFilter: 'page',
		sourceFilter: 'felt-lt',
		viewMode: 'list',
		columns: 4,
		ignored: 'not-localized',
	}),
});
assertDeepEqual(
	prefs.getContentPatternPreferences(storedContentPatternPrefs),
	{
		typeFilter: 'page',
		sourceFilter: 'felt-lt',
		viewMode: 'list',
		columns: 4,
	},
	'Valid stored Page Patterns preferences must survive a new page session.'
);

const invalidContentPatternPrefs = makeStorage({
	pixassist_content_patterns_preferences: JSON.stringify({
		typeFilter: '',
		sourceFilter: 17,
		viewMode: 'cards',
		columns: 99,
	}),
});
assertDeepEqual(
	prefs.getContentPatternPreferences(invalidContentPatternPrefs),
	defaultContentPatternPrefs,
	'Invalid stored Page Patterns preferences must fall back field-by-field.'
);

const writableLayoutPrefs = makeStorage({
	pixassist_layout_units_preferences: JSON.stringify({ typeFilter: 'footers', columns: 3 }),
});
const saved = prefs.setLayoutUnitPreference('sourceFilter', 'anima-blog', writableLayoutPrefs);
assertDeepEqual(
	saved,
	{
		typeFilter: 'footers',
		sourceFilter: 'anima-blog',
		viewMode: 'grid',
		columns: 3,
	},
	'Updating one Layouts preference must preserve the other stored values.'
);
assertDeepEqual(
	JSON.parse(writableLayoutPrefs.dump().pixassist_layout_units_preferences),
	saved,
	'Updating a Layouts preference must write the normalized snapshot to storage.'
);

const writableContentPatternPrefs = makeStorage({
	pixassist_content_patterns_preferences: JSON.stringify({ typeFilter: 'post', columns: 3 }),
});
const savedContentPatternPrefs = prefs.setContentPatternPreference('sourceFilter', 'anima-blog', writableContentPatternPrefs);
assertDeepEqual(
	savedContentPatternPrefs,
	{
		typeFilter: 'post',
		sourceFilter: 'anima-blog',
		viewMode: 'grid',
		columns: 3,
	},
	'Updating one Page Patterns preference must preserve the other stored values.'
);
assertDeepEqual(
	JSON.parse(writableContentPatternPrefs.dump().pixassist_content_patterns_preferences),
	savedContentPatternPrefs,
	'Updating a Page Patterns preference must write the normalized snapshot to storage.'
);

assertEqual(prefs.getPreviewMode(makeStorage()), 'demo', 'Missing preview mode must default to the polished Demo site — a new/empty site shows plain, often-blank previews in My-site mode (S5 UX fix).');
assertEqual(
	prefs.getPreviewMode(makeStorage({ pixassist_preview_mode: 'demo' })),
	'demo',
	'Stored Demo site preview mode must survive a new page session.'
);
assertEqual(
	prefs.getPreviewMode(makeStorage({ pixassist_preview_mode: 'bad-value' })),
	'demo',
	'Invalid preview mode storage must fall back to the default (Demo site).'
);

const previewStorage = makeStorage();
assertEqual(prefs.savePreviewMode('demo', previewStorage), 'demo', 'Saving Demo site mode must return the saved mode.');
assertEqual(previewStorage.dump().pixassist_preview_mode, 'demo', 'Saving Demo site mode must write the existing preview key.');

const throwingStorage = {
	getItem() {
		throw new Error('blocked');
	},
	setItem() {
		throw new Error('blocked');
	},
};
assertDeepEqual(
	prefs.getLayoutUnitPreferences(throwingStorage),
	defaultLayoutPrefs,
	'Blocked storage reads must not break the Layouts tab.'
);
assertDeepEqual(
	prefs.getContentPatternPreferences(throwingStorage),
	defaultContentPatternPrefs,
	'Blocked storage reads must not break the Page Patterns tab.'
);
assertEqual(prefs.savePreviewMode('demo', throwingStorage), 'demo', 'Blocked storage writes must not break preview toggling.');
JS;

$descriptor_spec = array(
	0 => array( 'pipe', 'r' ),
	1 => array( 'pipe', 'w' ),
	2 => array( 'pipe', 'w' ),
);

$process = proc_open( 'node - ' . escapeshellarg( $helper ), $descriptor_spec, $pipes, dirname( __DIR__ ) );
assert_true( is_resource( $process ), 'Node must be available to run the Layouts preferences test.' );

fwrite( $pipes[0], $node_script );
fclose( $pipes[0] );

$stdout = stream_get_contents( $pipes[1] );
$stderr = stream_get_contents( $pipes[2] );
fclose( $pipes[1] );
fclose( $pipes[2] );

$exit_code = proc_close( $process );
if ( 0 !== $exit_code ) {
	fwrite( STDERR, $stderr . PHP_EOL . $stdout . PHP_EOL );
	exit( $exit_code );
}

$layout_units_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/LayoutUnits.js' );
$layout_preview_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/LayoutPreview.js' );
$content_patterns_js = file_get_contents( __DIR__ . '/../admin/src-modern/hub/tabs/ContentPatterns.js' );

assert_true( false !== strpos( $layout_units_js, "from '../preferences'" ), 'Layouts tab must import the shared preferences helper.' );
assert_true( false !== strpos( $layout_units_js, 'getLayoutUnitPreferences' ), 'Layouts tab must hydrate toolbar state from persisted preferences.' );
assert_true( false !== strpos( $layout_units_js, 'saveLayoutUnitPreferences' ), 'Layouts tab must save toolbar state changes to persisted preferences.' );
assert_true( false !== strpos( $layout_units_js, "setLayoutPreference( 'typeFilter'" ), 'Layouts type filter changes must be persisted.' );
assert_true( false !== strpos( $layout_units_js, "setLayoutPreference( 'sourceFilter'" ), 'Layouts starter filter changes must be persisted.' );
assert_true( false !== strpos( $layout_units_js, "setLayoutPreference( 'viewMode'" ), 'Layouts grid/list mode changes must be persisted.' );
assert_true( false !== strpos( $layout_units_js, "setLayoutPreference( 'columns'" ), 'Layouts preview size changes must be persisted.' );
assert_true( false === strpos( $layout_units_js, "useState( 'grid' )" ), 'Layouts view mode must not reset to grid on every mount.' );
assert_true( false === strpos( $layout_units_js, 'useState( PREVIEW_SIZE_DEFAULT_COLUMNS )' ), 'Layouts preview size must not reset to the default on every mount.' );
assert_true( false !== strpos( $layout_preview_js, "from './preferences'" ), 'Layout preview mode must import the shared preferences helper.' );
assert_true( false !== strpos( $layout_preview_js, 'getPreviewMode' ), 'Layout preview mode must hydrate from persisted storage.' );
assert_true( false !== strpos( $layout_preview_js, 'savePreviewMode' ), 'Layout preview mode changes must persist to storage.' );
assert_true( false !== strpos( $content_patterns_js, "from '../preferences'" ), 'Page Patterns tab must import the shared preferences helper.' );
assert_true( false !== strpos( $content_patterns_js, 'PreviewModeToggle' ), 'Page Patterns tab must expose the shared My site / Demo site preview toggle.' );
assert_true( false !== strpos( $content_patterns_js, 'createElement( PreviewModeToggle' ), 'Page Patterns toolbar must render the shared preview-mode toggle.' );
assert_true( false !== strpos( $content_patterns_js, 'getContentPatternPreferences' ), 'Page Patterns tab must hydrate toolbar state from persisted preferences.' );
assert_true( false !== strpos( $content_patterns_js, 'saveContentPatternPreferences' ), 'Page Patterns tab must save toolbar state changes to persisted preferences.' );
assert_true( false !== strpos( $content_patterns_js, 'getCatalogOrder' ), 'Page Patterns tab must preserve source catalog display order.' );
assert_true( false !== strpos( $content_patterns_js, 'unit.group' ), 'Page Patterns tab must consume source catalog group metadata.' );
assert_true( false !== strpos( $content_patterns_js, 'unit.tags' ), 'Page Patterns tab must consume source catalog tag metadata.' );
assert_true( false !== strpos( $content_patterns_js, 'pixassist-content-patterns__grid' ), 'Page Patterns grid must expose a stable class for responsive constraints.' );
assert_true( false !== strpos( $content_patterns_js, '@media (max-width: 782px)' ), 'Page Patterns must include an admin-mobile breakpoint.' );
assert_true( false !== strpos( $content_patterns_js, 'grid-template-columns: 1fr !important;' ), 'Page Patterns mobile grid must collapse to one column to avoid horizontal overflow.' );

echo "Layouts preferences OK\n";
