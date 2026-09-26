<?php
/**
 * Local avatar images for LT-stack users (#77).
 *
 * A per-user Media Library picture that feeds WordPress's own `get_avatar_data()` machinery, so
 * it shows up everywhere `get_avatar()` already runs (Nova Blocks' Post Meta byline, core's
 * Avatar block, comment lists, author boxes) with no changes needed in any of those consumers.
 *
 * Contract:
 * - The `pxg_local_avatar_id` user meta key holds an attachment ID. Empty/missing meta is a
 *   no-op: `pre_get_avatar_data` returns $args untouched and core's normal Gravatar/default
 *   resolution keeps running exactly as it does today.
 * - We only ever set `$args['url']` + `$args['found_avatar']`; we never touch `force_default`,
 *   `size`, or any other input core already resolved.
 * - `force_default` short-circuits us: we return $args untouched so core's own default path runs.
 * - Guests and non-avatar comment types are resolved to `null` (not a WP_User) and left alone, so
 *   core's own WP_Comment handling in get_avatar_data() keeps deciding their fate.
 *
 * @package PixelgradeAssistant
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'PIXASSIST_LOCAL_AVATAR_META_KEY' ) ) {
	define( 'PIXASSIST_LOCAL_AVATAR_META_KEY', 'pxg_local_avatar_id' );
}

/* ============================ get_avatar_data() bridge ============================ */

if ( ! function_exists( 'pixassist_pre_get_avatar_data' ) ) {
	/**
	 * Serve a user's local avatar through `pre_get_avatar_data`, WordPress's own short-circuit
	 * filter for `get_avatar_data()` (and therefore `get_avatar()` / `get_avatar_url()`).
	 *
	 * @param array $args        Arguments passed to get_avatar_data(), including 'size' and
	 *                            'force_default'.
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 *
	 * @return array
	 */
	function pixassist_pre_get_avatar_data( $args, $id_or_email ) {
		if ( ! empty( $args['force_default'] ) ) {
			return $args;
		}

		$user = pixassist_resolve_local_avatar_user( $id_or_email );
		if ( ! $user instanceof WP_User ) {
			return $args;
		}

		$attachment_id = absint( get_user_meta( $user->ID, PIXASSIST_LOCAL_AVATAR_META_KEY, true ) );
		if ( empty( $attachment_id ) ) {
			return $args;
		}

		$size  = isset( $args['size'] ) ? absint( $args['size'] ) : 96;
		$image = pixassist_get_local_avatar_image_src( $attachment_id, $size );
		if ( empty( $image ) || empty( $image[0] ) ) {
			// Meta points at a missing/unreadable attachment -> fall back to Gravatar cleanly.
			return $args;
		}

		$args['url']          = $image[0];
		$args['found_avatar'] = true;

		return $args;
	}

	add_filter( 'pre_get_avatar_data', 'pixassist_pre_get_avatar_data', 10, 2 );
}

if ( ! function_exists( 'pixassist_resolve_local_avatar_user' ) ) {
	/**
	 * Resolve a WP_User for local-avatar purposes from any input core's get_avatar_data() accepts.
	 *
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 *
	 * @return WP_User|null Null when there is no registered user to resolve (including guest
	 *                       commenters and non-avatar comment types), so core's own resolution
	 *                       keeps running for them, unchanged.
	 */
	function pixassist_resolve_local_avatar_user( $id_or_email ) {
		if ( is_numeric( $id_or_email ) ) {
			return pixassist_local_avatar_existing_user( get_user_by( 'id', absint( $id_or_email ) ) );
		}

		if ( is_string( $id_or_email ) ) {
			if ( ! is_email( $id_or_email ) ) {
				return null;
			}

			return pixassist_local_avatar_existing_user( get_user_by( 'email', $id_or_email ) );
		}

		if ( $id_or_email instanceof WP_User ) {
			return pixassist_local_avatar_existing_user( $id_or_email );
		}

		if ( $id_or_email instanceof WP_Post ) {
			return pixassist_local_avatar_existing_user( get_user_by( 'id', (int) $id_or_email->post_author ) );
		}

		if ( $id_or_email instanceof WP_Comment ) {
			// Mirror core: non-avatar comment types (e.g. pingbacks) never show one.
			if ( function_exists( 'is_avatar_comment_type' ) && ! is_avatar_comment_type( get_comment_type( $id_or_email ) ) ) {
				return null;
			}

			if ( empty( $id_or_email->user_id ) ) {
				return null; // Guest commenter -> stays on Gravatar, unchanged.
			}

			return pixassist_local_avatar_existing_user( get_user_by( 'id', (int) $id_or_email->user_id ) );
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_local_avatar_existing_user' ) ) {
	/**
	 * @param WP_User|false $user
	 *
	 * @return WP_User|null
	 */
	function pixassist_local_avatar_existing_user( $user ) {
		return ( $user instanceof WP_User && $user->exists() ) ? $user : null;
	}
}

/* ============================ Best-fit image selection ============================ */

if ( ! function_exists( 'pixassist_get_local_avatar_image_src' ) ) {
	/**
	 * Pick the best-fit image for a local avatar attachment at the requested pixel size:
	 * the smallest square hard-cropped intermediate that covers it, else the size WordPress
	 * itself picks for [size, size], else the original.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @param int $size          Requested avatar size in pixels.
	 *
	 * @return array|null [ url, width, height, is_intermediate ], or null when unresolvable.
	 */
	function pixassist_get_local_avatar_image_src( $attachment_id, $size ) {
		$attachment_id = absint( $attachment_id );
		$size          = max( 1, absint( $size ) );

		if ( empty( $attachment_id ) || 'attachment' !== get_post_type( $attachment_id ) ) {
			return null;
		}

		$covering = pixassist_find_smallest_covering_square_image( $attachment_id, $size );
		if ( ! empty( $covering ) ) {
			return $covering;
		}

		$sized = wp_get_attachment_image_src( $attachment_id, array( $size, $size ) );
		if ( is_array( $sized ) && ! empty( $sized[0] ) ) {
			return $sized;
		}

		$original = wp_get_attachment_image_src( $attachment_id, 'full' );

		return ( is_array( $original ) && ! empty( $original[0] ) ) ? $original : null;
	}
}

if ( ! function_exists( 'pixassist_find_smallest_covering_square_image' ) ) {
	/**
	 * Among registered square hard-cropped sizes wide enough to cover $size, return the smallest
	 * one that this attachment actually has a generated intermediate for.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @param int $size          Requested pixel size.
	 *
	 * @return array|null
	 */
	function pixassist_find_smallest_covering_square_image( $attachment_id, $size ) {
		$covering_widths = array();

		foreach ( pixassist_get_square_cropped_image_sizes() as $name => $width ) {
			if ( $width >= $size ) {
				$covering_widths[ $name ] = $width;
			}
		}

		if ( empty( $covering_widths ) ) {
			return null;
		}

		asort( $covering_widths );

		foreach ( $covering_widths as $name => $width ) {
			$image = wp_get_attachment_image_src( $attachment_id, $name );
			if ( is_array( $image ) && ! empty( $image[0] ) ) {
				return $image;
			}
		}

		return null;
	}
}

if ( ! function_exists( 'pixassist_get_square_cropped_image_sizes' ) ) {
	/**
	 * All registered image sizes that are square AND hard-cropped to an exact final size, core
	 * sizes and theme/plugin-registered ones alike.
	 *
	 * @return array<string,int> Size name => pixel width.
	 */
	function pixassist_get_square_cropped_image_sizes() {
		$sizes = array();

		foreach ( array( 'thumbnail', 'medium', 'medium_large', 'large' ) as $name ) {
			$width  = (int) get_option( "{$name}_size_w" );
			$height = (int) get_option( "{$name}_size_h" );
			// Only 'thumbnail_crop' exists in core; medium/large/medium_large are never hard
			// cropped by core, so get_option() naturally returns false for those.
			$crop = (bool) get_option( "{$name}_crop" );

			if ( $crop && $width > 0 && $width === $height ) {
				$sizes[ $name ] = $width;
			}
		}

		global $_wp_additional_image_sizes;
		if ( is_array( $_wp_additional_image_sizes ) ) {
			foreach ( $_wp_additional_image_sizes as $name => $definition ) {
				$width  = isset( $definition['width'] ) ? (int) $definition['width'] : 0;
				$height = isset( $definition['height'] ) ? (int) $definition['height'] : 0;

				if ( ! empty( $definition['crop'] ) && $width > 0 && $width === $height ) {
					$sizes[ $name ] = $width;
				}
			}
		}

		return $sizes;
	}
}

if ( ! function_exists( 'pixassist_register_local_avatar_image_size' ) ) {
	/**
	 * Register a dedicated square hard crop so newly uploaded avatars get a sharp intermediate on
	 * 2x screens. Existing attachments only gain it after a thumbnail regeneration.
	 */
	function pixassist_register_local_avatar_image_size() {
		add_image_size( 'avatar', 192, 192, true );
	}

	add_action( 'after_setup_theme', 'pixassist_register_local_avatar_image_size' );
}

/* ============================ Profile screen UI ============================ */

if ( ! function_exists( 'pixassist_can_manage_local_avatar' ) ) {
	/**
	 * @param int $user_id The profile being edited.
	 *
	 * @return bool
	 */
	function pixassist_can_manage_local_avatar( $user_id ) {
		return current_user_can( 'upload_files' ) && current_user_can( 'edit_user', $user_id );
	}
}

if ( ! function_exists( 'pixassist_render_local_avatar_field' ) ) {
	/**
	 * Render the "Avatar Image" media picker on the user profile screen (own profile and, for
	 * users who can manage it, other users' edit screens).
	 *
	 * @param WP_User $user The profile being rendered.
	 */
	function pixassist_render_local_avatar_field( $user ) {
		if ( ! ( $user instanceof WP_User ) || ! pixassist_can_manage_local_avatar( $user->ID ) ) {
			return;
		}

		$attachment_id = absint( get_user_meta( $user->ID, PIXASSIST_LOCAL_AVATAR_META_KEY, true ) );
		$preview       = $attachment_id ? wp_get_attachment_image_src( $attachment_id, array( 96, 96 ) ) : false;
		$preview_url   = is_array( $preview ) ? $preview[0] : '';

		wp_nonce_field( 'pixassist_local_avatar_' . $user->ID, 'pixassist_local_avatar_nonce' );
		?>
		<h2><?php esc_html_e( 'Local Avatar', '__plugin_txtd' ); ?></h2>
		<table class="form-table" role="presentation">
			<tr>
				<th>
					<label for="pixassist-local-avatar-button"><?php esc_html_e( 'Avatar Image', '__plugin_txtd' ); ?></label>
				</th>
				<td>
					<div class="pixassist-local-avatar">
						<img
							id="pixassist-local-avatar-preview"
							src="<?php echo esc_url( $preview_url ); ?>"
							style="<?php echo $preview_url ? '' : 'display:none;'; ?>max-width:96px;height:auto;display:block;margin-bottom:8px;"
							alt=""
						/>
						<input
							type="hidden"
							name="pxg_local_avatar_id"
							id="pixassist-local-avatar-id"
							value="<?php echo esc_attr( $attachment_id ); ?>"
						/>
						<button type="button" class="button" id="pixassist-local-avatar-button">
							<?php esc_html_e( 'Select Image', '__plugin_txtd' ); ?>
						</button>
						<button
							type="button"
							class="button"
							id="pixassist-local-avatar-remove"
							style="<?php echo $attachment_id ? '' : 'display:none;'; ?>"
						>
							<?php esc_html_e( 'Remove Image', '__plugin_txtd' ); ?>
						</button>
						<p class="description">
							<?php esc_html_e( 'Used instead of Gravatar for this user across the site (comments, author boxes, bylines). Leave empty to use Gravatar.', '__plugin_txtd' ); ?>
						</p>
					</div>
				</td>
			</tr>
		</table>
		<?php
	}

	add_action( 'show_user_profile', 'pixassist_render_local_avatar_field' );
	add_action( 'edit_user_profile', 'pixassist_render_local_avatar_field' );
}

if ( ! function_exists( 'pixassist_save_local_avatar_field' ) ) {
	/**
	 * Persist the "Avatar Image" field from the user profile screen.
	 *
	 * @param int $user_id The profile being saved.
	 */
	function pixassist_save_local_avatar_field( $user_id ) {
		if ( ! pixassist_can_manage_local_avatar( $user_id ) ) {
			return;
		}

		if ( ! isset( $_POST['pixassist_local_avatar_nonce'] )
			|| ! wp_verify_nonce( $_POST['pixassist_local_avatar_nonce'], 'pixassist_local_avatar_' . $user_id ) ) {
			return;
		}

		if ( ! isset( $_POST['pxg_local_avatar_id'] ) ) {
			return;
		}

		$attachment_id = absint( wp_unslash( $_POST['pxg_local_avatar_id'] ) );

		if ( empty( $attachment_id ) ) {
			delete_user_meta( $user_id, PIXASSIST_LOCAL_AVATAR_META_KEY );

			return;
		}

		$is_image = 'attachment' === get_post_type( $attachment_id )
			&& 0 === strpos( (string) get_post_mime_type( $attachment_id ), 'image/' );

		if ( ! $is_image ) {
			// Not a real image attachment -> ignore silently rather than storing garbage.
			return;
		}

		update_user_meta( $user_id, PIXASSIST_LOCAL_AVATAR_META_KEY, $attachment_id );
	}

	add_action( 'personal_options_update', 'pixassist_save_local_avatar_field' );
	add_action( 'edit_user_profile_update', 'pixassist_save_local_avatar_field' );
}

if ( ! function_exists( 'pixassist_enqueue_local_avatar_assets' ) ) {
	/**
	 * Load the media picker only on the two profile screens, and only for users who can use it.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	function pixassist_enqueue_local_avatar_assets( $hook_suffix ) {
		if ( ! in_array( $hook_suffix, array( 'profile.php', 'user-edit.php' ), true ) ) {
			return;
		}

		$user_id = isset( $_GET['user_id'] ) ? absint( $_GET['user_id'] ) : get_current_user_id();

		if ( ! pixassist_can_manage_local_avatar( $user_id ) ) {
			return;
		}

		wp_enqueue_media();

		$version = function_exists( 'PixelgradeAssistant' ) ? PixelgradeAssistant()->get_version() : false;

		wp_enqueue_script(
			'pixassist-local-avatar',
			plugins_url( 'admin/js/local-avatar.js', PIXELGRADE_ASSISTANT__PLUGIN_FILE ),
			array( 'jquery' ),
			$version,
			true
		);

		wp_localize_script(
			'pixassist-local-avatar',
			'pixassistLocalAvatar',
			array(
				'title'  => esc_html__( 'Select Avatar Image', '__plugin_txtd' ),
				'button' => esc_html__( 'Use this image', '__plugin_txtd' ),
			)
		);
	}

	add_action( 'admin_enqueue_scripts', 'pixassist_enqueue_local_avatar_assets' );
}
