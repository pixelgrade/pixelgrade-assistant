<?php
/**
 * Starter cleanup: remove the default WordPress sample content after a starter's full demo
 * is imported, so a freshly-launched site does not ship the "Hello world!" post and the
 * "Sample Page" that the demo never had.
 *
 * Self-contained: hooks the existing `pixassist_sce_import_end` action, so the main importer
 * class stays untouched. Only *pristine* (never-edited) defaults are removed, only once a
 * starter has set a real static front page, and the front page itself is never touched — so
 * we never delete content a user actually adopted. Items are trashed (reversible), not deleted.
 *
 * @package PixelgradeAssistant
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'pixassist_default_content_candidates' ) ) {
	/**
	 * The default WordPress sample content eligible for cleanup after a full-demo import.
	 *
	 * Filterable so a companion/theme can add or remove entries (e.g. a locale that ships a
	 * differently-slugged sample). Each entry: `slug` + `type`.
	 *
	 * @return array[]
	 */
	function pixassist_default_content_candidates() {
		return apply_filters(
			'pixassist_default_content_candidates',
			array(
				array( 'slug' => 'hello-world', 'type' => 'post' ),
				array( 'slug' => 'sample-page', 'type' => 'page' ),
			)
		);
	}
}

if ( ! function_exists( 'pixassist_is_pristine_default_content' ) ) {
	/**
	 * Whether a post is a pristine, never-edited default: still published and its modified
	 * timestamp equals its creation timestamp. A user who adopted the sample would have edited
	 * it (bumping `post_modified`), so this keeps real content safe.
	 *
	 * @param WP_Post $post Post to test.
	 *
	 * @return bool
	 */
	function pixassist_is_pristine_default_content( $post ) {
		if ( ! ( $post instanceof WP_Post ) ) {
			return false;
		}
		if ( 'publish' !== $post->post_status ) {
			return false;
		}

		return $post->post_date_gmt === $post->post_modified_gmt;
	}
}

if ( ! function_exists( 'pixassist_purge_default_wp_content' ) ) {
	/**
	 * Trash the pristine default WordPress sample content after a starter full-demo import.
	 *
	 * Guards, in order: a real static front page must be set (a full-site import, not a
	 * layouts-only/design-only apply); the front page is never a candidate; each candidate must
	 * exist, be the expected type, and be pristine. Anything that fails a guard is left alone.
	 *
	 * Hooked to `pixassist_sce_import_end`, which fires after a starter's post-settings (incl.
	 * the Reading front-page option) are applied.
	 *
	 * @return void
	 */
	function pixassist_purge_default_wp_content() {
		// Only after a starter set a real static front page — i.e. a genuine full-site setup.
		if ( 'page' !== get_option( 'show_on_front' ) ) {
			return;
		}
		$front_id = (int) get_option( 'page_on_front' );
		if ( $front_id <= 0 || 'publish' !== get_post_status( $front_id ) ) {
			return;
		}

		foreach ( pixassist_default_content_candidates() as $candidate ) {
			if ( empty( $candidate['slug'] ) || empty( $candidate['type'] ) ) {
				continue;
			}

			// Resolve by slug for BOTH hierarchical (page) and non-hierarchical (post) types —
			// get_page_by_path() only handles hierarchical types reliably.
			$found = get_posts(
				array(
					'name'             => $candidate['slug'],
					'post_type'        => $candidate['type'],
					'post_status'      => 'publish',
					'numberposts'      => 1,
					'suppress_filters' => false,
				)
			);
			$post = ! empty( $found ) ? $found[0] : null;
			if ( ! ( $post instanceof WP_Post ) ) {
				continue;
			}
			// Never remove whatever is currently the front page.
			if ( (int) $post->ID === $front_id ) {
				continue;
			}
			if ( ! pixassist_is_pristine_default_content( $post ) ) {
				continue;
			}

			/**
			 * Final say before trashing a default sample item. Return false to keep it.
			 *
			 * @param bool    $trash Whether to trash the item (default true).
			 * @param WP_Post $post  The default sample post/page.
			 */
			if ( ! apply_filters( 'pixassist_trash_default_content', true, $post ) ) {
				continue;
			}

			wp_trash_post( $post->ID );
		}
	}
	add_action( 'pixassist_sce_import_end', 'pixassist_purge_default_wp_content' );
}
