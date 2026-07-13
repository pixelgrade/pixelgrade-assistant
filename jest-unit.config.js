/**
 * Extends the default `@wordpress/scripts` unit-test Jest config.
 *
 * `@wordpress/components` ships a transitive `uuid` dependency (published as pure ESM,
 * no CJS entry point) under its own nested `node_modules/`. Jest's default
 * `transformIgnorePatterns` skips everything under `node_modules/`, so importing
 * `@wordpress/components` directly in a test (e.g. `admin/src-modern/hub/tabs/Styles.js`,
 * which renders `Button`/`Card`/`CardBody`) fails with `SyntaxError: Unexpected token
 * 'export'`. Allow that one nested package through the transform.
 */
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config' );

module.exports = {
	...defaultConfig,
	transformIgnorePatterns: [
		'node_modules/(?!(@wordpress/components|uuid)/)',
	],
};
