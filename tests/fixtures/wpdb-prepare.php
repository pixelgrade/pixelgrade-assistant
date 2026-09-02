<?php
/**
 * A shared stand-in for `wpdb::prepare()`, for the standalone tests that hand the starter
 * content importer a fake `$wpdb`.
 *
 * The point is to be faithful in the ways a test can be misled by:
 *
 * - Substitution is a SINGLE pass over the format string, the way the real `prepare()` does
 *   one `vsprintf()`. Replacing one argument at a time re-scans text that has already been
 *   substituted, so a value containing a literal `%s` would swallow the following
 *   placeholder — something the real `prepare()` cannot do. A mock that allowed it would
 *   fail a `%`-in-slug test for a fault that does not exist in production.
 * - `%s` arrives quoted by `prepare()` itself, so a caller must NOT write its own quotes;
 *   any it did write are stripped here so the mock models the real contract rather than
 *   silently accepting a double-quoted value.
 * - Quotes and backslashes in a value are escaped, so the value cannot terminate the
 *   literal it sits in.
 *
 * It is not a security oracle: the escaping here is the mock's, not production's. Tests
 * should assert that a query went THROUGH `prepare()`; that is the part a stub can honestly
 * prove.
 *
 * @package PixelgradeAssistant
 */

if ( ! function_exists( 'paf_fake_wpdb_prepare' ) ) {
	/**
	 * @param string $query Query with %s / %d / %f / %F placeholders.
	 * @param array  $args  Values, in placeholder order.
	 *
	 * @return string
	 */
	function paf_fake_wpdb_prepare( $query, array $args ) {
		// The real prepare() supplies the quotes around %s; a caller must not add its own.
		$query = str_replace( array( "'%s'", '"%s"' ), '%s', $query );

		$index = 0;

		return preg_replace_callback(
			'/%[sdfF]/',
			function ( $matches ) use ( $args, &$index ) {
				if ( ! array_key_exists( $index, $args ) ) {
					return $matches[0];
				}

				$arg = $args[ $index ];
				$index++;

				switch ( substr( $matches[0], 1 ) ) {
					case 'd':
						return (string) (int) $arg;
					case 'f':
					case 'F':
						return (string) (float) $arg;
					default:
						return "'" . str_replace(
							array( '\\', "'" ),
							array( '\\\\', "\\'" ),
							(string) $arg
						) . "'";
				}
			},
			$query
		);
	}
}
