/**
 * Extends the default `@wordpress/scripts` unit-test Jest config.
 *
 * `@wordpress/components` ships a transitive `uuid` dependency (published as pure ESM,
 * no CJS entry point) under its own nested `node_modules/`. Jest's default
 * `transformIgnorePatterns` skips everything under `node_modules/`, so importing
 * `@wordpress/components` directly in a test (e.g. `admin/src-modern/hub/tabs/Styles.js`,
 * which renders `Button`/`Card`/`CardBody`) fails with `SyntaxError: Unexpected token
 * 'export'`. Allow that one nested package through the transform.
 *
 * The top-level `react`/`react-dom` in package.json are pinned to ^17 (this admin app's own
 * runtime), while `@wordpress/element` bundles its own nested React 18 (needed for
 * `createRoot`/`flushSync`, used by tab tests that mount/unmount a root). `@wordpress/components`
 * has no nested React of its own, so Node's module resolution hoists it to the top-level v17 —
 * a second, mismatched React instance in the same test. That is invisible for components with no
 * internal context reads, but any `@wordpress/components` component that goes through the
 * context-system (e.g. `Notice`'s internal `VisuallyHidden`) calls `useContext` against the v17
 * instance from within a tree rendered by the v18 instance, which React (correctly) rejects as an
 * "Invalid hook call". Redirect `react`/`react-dom` imports to the same nested copies
 * `@wordpress/element` uses so the whole test tree shares one React instance — matching how the
 * real bundle runs in wp-admin, where WordPress core provides a single `React`/`ReactDOM`.
 */
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config' );

// `@wordpress/element`'s package.json `exports` map does not expose its nested
// `node_modules/react(-dom)`, so resolve the directories directly rather than through
// `require.resolve()`.
const elementReact = path.join( __dirname, 'node_modules/@wordpress/element/node_modules/react' );
const elementReactDom = path.join( __dirname, 'node_modules/@wordpress/element/node_modules/react-dom' );

module.exports = {
	...defaultConfig,
	transformIgnorePatterns: [
		'node_modules/(?!(@wordpress/components|uuid)/)',
	],
	moduleNameMapper: {
		...( defaultConfig.moduleNameMapper || {} ),
		'^react$': elementReact,
		'^react-dom$': elementReactDom,
		'^react/(.*)$': elementReact + '/$1',
		'^react-dom/(.*)$': elementReactDom + '/$1',
	},
};
