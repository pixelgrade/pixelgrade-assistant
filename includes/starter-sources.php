<?php
/**
 * What each Design Library source contributes: reusable parts, complete content records, or both.
 *
 * A source descriptor carries two orthogonal facts that used to be conflated into one `role` value:
 *
 * - `role` is PRESENTATION — does this source get a card in the Starter Sites section?
 * - `serves` is CAPABILITY — which Design Library sections may list its material?
 *
 * Separating them is what lets a curated catalog of complete pages exist without pretending to be a
 * site somebody would apply whole, and lets a catalog of reusable parts stay out of the page-level
 * section. Both consumers read these helpers, so the two sections can never drift apart.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_get_starter_serves' ) ) {
	/**
	 * Resolve a raw descriptor's `serves` declaration.
	 *
	 * Accepts an array or a comma-separated string, drops anything outside the closed vocabulary, and
	 * falls back to a derived default that preserves every earlier behavior: a starter serves both
	 * sections, and a library that declares nothing is a parts catalog — which is what the only
	 * pre-existing library is.
	 *
	 * @param array  $starter Raw starter descriptor.
	 * @param string $role    Normalized role ('starter' or 'library').
	 *
	 * @return string[] Non-empty subset of array( 'parts', 'content' ).
	 */
	function pixassist_get_starter_serves( $starter, $role ) {
		$allowed = array( 'parts', 'content' );

		$declared = isset( $starter['serves'] ) ? $starter['serves'] : null;
		if ( is_string( $declared ) ) {
			$declared = explode( ',', $declared );
		}

		$serves = array();
		foreach ( (array) $declared as $entry ) {
			if ( ! is_scalar( $entry ) ) {
				continue;
			}

			$entry = sanitize_key( (string) $entry );
			if ( in_array( $entry, $allowed, true ) ) {
				$serves[] = $entry;
			}
		}

		$serves = array_values( array_unique( $serves ) );
		if ( ! empty( $serves ) ) {
			return $serves;
		}

		return ( 'library' === $role ) ? array( 'parts' ) : array( 'parts', 'content' );
	}
}

if ( ! function_exists( 'pixassist_starter_serves' ) ) {
	/**
	 * Whether a normalized starter descriptor serves a given Design Library section.
	 *
	 * Falls back to the derived default when a descriptor predates `serves`, so a stale cached payload
	 * resolves exactly as it did before.
	 *
	 * @param array  $starter Normalized starter descriptor.
	 * @param string $what    Section material: 'parts' or 'content'.
	 *
	 * @return bool
	 */
	function pixassist_starter_serves( $starter, $what ) {
		if ( ! is_array( $starter ) ) {
			return false;
		}

		$what = sanitize_key( (string) $what );

		// Always resolve through pixassist_get_starter_serves(): it owns the closed vocabulary, the
		// non-scalar guard and the derived default. Re-implementing any of that here is how the two
		// would drift — and sanitize_key() only started self-guarding against a non-scalar in
		// WordPress 6.2, below this plugin's declared floor.
		$role   = ! empty( $starter['role'] ) ? sanitize_key( $starter['role'] ) : 'starter';
		$serves = pixassist_get_starter_serves( $starter, $role );

		return in_array( $what, $serves, true );
	}
}
