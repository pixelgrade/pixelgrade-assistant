<?php
/**
 * Pins the local avatar bridge (#77): `pxg_local_avatar_id` user meta served through
 * `pre_get_avatar_data()`, resolved from every input core's get_avatar_data() accepts, sized to
 * the smallest covering square hard crop, and left inert for anyone without the meta set.
 *
 * Standalone: run with `php tests/local-avatar-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_filters']         = array();
$GLOBALS['paf_users']           = array();
$GLOBALS['paf_users_by_email']  = array();
$GLOBALS['paf_user_meta']       = array();
$GLOBALS['paf_posts']           = array();
$GLOBALS['paf_options']         = array();
$GLOBALS['paf_image_src']       = array();
$GLOBALS['paf_denied_caps']     = array();
$_wp_additional_image_sizes     = array();

/* ============================ WP hook system stub ============================ */

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['paf_filters'][ $hook ][] = $callback;

	return true;
}

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	return add_filter( $hook, $callback, $priority, $args );
}

function apply_filters( $hook, $value ) {
	$args = func_get_args();
	array_shift( $args );

	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return $value;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		$args[0] = call_user_func_array( $callback, $args );
	}

	return $args[0];
}

function do_action( $hook, ...$args ) {
	if ( empty( $GLOBALS['paf_filters'][ $hook ] ) ) {
		return;
	}

	foreach ( $GLOBALS['paf_filters'][ $hook ] as $callback ) {
		call_user_func_array( $callback, $args );
	}
}

/* ============================ WP core object stubs ============================ */

class WP_User {
	public $ID;
	private $registered;

	public function __construct( $id, $registered = true ) {
		$this->ID         = $id;
		$this->registered = $registered;
	}

	public function exists() {
		return $this->registered;
	}
}

class WP_Post {
	public $post_author;

	public function __construct( $post_author ) {
		$this->post_author = $post_author;
	}
}

class WP_Comment {
	public $user_id;
	public $comment_type;

	public function __construct( $user_id, $comment_type = 'comment' ) {
		$this->user_id      = $user_id;
		$this->comment_type = $comment_type;
	}
}

/* ============================ WP core function stubs ============================ */

function absint( $value ) {
	return abs( (int) $value );
}

function is_email( $email ) {
	return (bool) filter_var( $email, FILTER_VALIDATE_EMAIL );
}

function get_user_by( $field, $value ) {
	if ( 'id' === $field ) {
		return isset( $GLOBALS['paf_users'][ $value ] ) ? $GLOBALS['paf_users'][ $value ] : false;
	}

	if ( 'email' === $field ) {
		if ( ! isset( $GLOBALS['paf_users_by_email'][ $value ] ) ) {
			return false;
		}

		return $GLOBALS['paf_users'][ $GLOBALS['paf_users_by_email'][ $value ] ];
	}

	return false;
}

function get_comment_type( $comment ) {
	return $comment->comment_type;
}

function is_avatar_comment_type( $type ) {
	return in_array( $type, array( 'comment' ), true );
}

function get_user_meta( $user_id, $key, $single = false ) {
	return isset( $GLOBALS['paf_user_meta'][ $user_id ][ $key ] ) ? $GLOBALS['paf_user_meta'][ $user_id ][ $key ] : '';
}

function update_user_meta( $user_id, $key, $value ) {
	$GLOBALS['paf_user_meta'][ $user_id ][ $key ] = $value;

	return true;
}

function delete_user_meta( $user_id, $key ) {
	unset( $GLOBALS['paf_user_meta'][ $user_id ][ $key ] );

	return true;
}

function get_post_type( $id ) {
	return isset( $GLOBALS['paf_posts'][ $id ]['post_type'] ) ? $GLOBALS['paf_posts'][ $id ]['post_type'] : false;
}

function get_post_mime_type( $id ) {
	return isset( $GLOBALS['paf_posts'][ $id ]['post_mime_type'] ) ? $GLOBALS['paf_posts'][ $id ]['post_mime_type'] : '';
}

function get_option( $name ) {
	return isset( $GLOBALS['paf_options'][ $name ] ) ? $GLOBALS['paf_options'][ $name ] : false;
}

function wp_get_attachment_image_src( $id, $size ) {
	$key = $id . ':' . ( is_array( $size ) ? implode( 'x', $size ) : $size );

	return isset( $GLOBALS['paf_image_src'][ $key ] ) ? $GLOBALS['paf_image_src'][ $key ] : false;
}

function add_image_size( $name, $width, $height, $crop = false ) {
	global $_wp_additional_image_sizes;
	$_wp_additional_image_sizes[ $name ] = array(
		'width'  => $width,
		'height' => $height,
		'crop'   => $crop,
	);
}

function current_user_can( $capability, ...$args ) {
	return empty( $GLOBALS['paf_denied_caps'][ $capability ] );
}

function wp_verify_nonce( $nonce, $action ) {
	return ( 'VALID-NONCE' === $nonce ) ? 1 : false;
}

function wp_unslash( $value ) {
	return $value;
}

/* ============================ Assertions ============================ */

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite( STDERR, $message . PHP_EOL );
		fwrite( STDERR, 'Expected: ' . var_export( $expected, true ) . PHP_EOL );
		fwrite( STDERR, 'Actual:   ' . var_export( $actual, true ) . PHP_EOL );
		exit( 1 );
	}
}

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, $message . PHP_EOL );
		exit( 1 );
	}
}

require __DIR__ . '/../includes/local-avatar.php';

/* ============================ Fixtures ============================ */

// Core square-cropped size: only thumbnail is hard-cropped by default (matches real WP options).
$GLOBALS['paf_options'] = array(
	'thumbnail_size_w' => 150,
	'thumbnail_size_h' => 150,
	'thumbnail_crop'   => true,
	'medium_size_w'    => 300,
	'medium_size_h'    => 300,
	// No 'medium_crop' option exists in core -> get_option() returns false, matching real WP.
	'large_size_w'     => 1024,
	'large_size_h'     => 1024,
);

// Users.
$GLOBALS['paf_users'] = array(
	1 => new WP_User( 1 ),
	2 => new WP_User( 2 ),
	3 => new WP_User( 3 ),
);
$GLOBALS['paf_users_by_email'] = array(
	'user1@example.test' => 1,
	'user2@example.test' => 2,
);

// User 1 has a local avatar (attachment 601, used in the size-selection fixtures below).
$GLOBALS['paf_user_meta'][1]['pxg_local_avatar_id'] = 601;
// User 2 has no local avatar meta at all.
// User 3's local avatar meta points at an attachment id that isn't a real attachment.
$GLOBALS['paf_user_meta'][3]['pxg_local_avatar_id'] = 999;

// Attachments for image-size-selection fixtures.
$GLOBALS['paf_posts'] = array(
	601 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' ), // thumbnail + avatar generated
	602 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' ), // only avatar generated
	603 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' ), // no square crop generated
	604 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' ), // nothing but the original
	605 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg' ), // nothing at all
	650 => array( 'post_type' => 'attachment', 'post_mime_type' => 'image/png' ),  // used by save-handler tests
	651 => array( 'post_type' => 'attachment', 'post_mime_type' => 'application/pdf' ), // not an image
);

$GLOBALS['paf_image_src'] = array(
	'601:thumbnail' => array( 'https://example.test/601-thumbnail.jpg', 150, 150, true ),
	'601:avatar'    => array( 'https://example.test/601-avatar.jpg', 192, 192, true ),
	'602:avatar'    => array( 'https://example.test/602-avatar.jpg', 192, 192, true ),
	'603:80x80'     => array( 'https://example.test/603-sized.jpg', 80, 80, true ),
	'604:full'      => array( 'https://example.test/604-original.jpg', 400, 400, false ),
);

// Register the optional sharp-avatar crop the same way `after_setup_theme` would.
pixassist_register_local_avatar_image_size();

/* ============================ Square-cropped size registry ============================ */

$square_sizes = pixassist_get_square_cropped_image_sizes();
assert_same( 150, $square_sizes['thumbnail'], 'Core thumbnail (150x150, cropped) must be recognised as a square hard crop.' );
assert_true( ! isset( $square_sizes['medium'] ), 'Core medium is never hard-cropped and must be excluded.' );
assert_same( 192, $square_sizes['avatar'], 'The registered 192x192 "avatar" crop must be recognised as a square hard crop.' );

/* ============================ Best-fit image selection ============================ */

assert_same(
	$GLOBALS['paf_image_src']['601:thumbnail'],
	pixassist_get_local_avatar_image_src( 601, 80 ),
	'With both thumbnail(150) and avatar(192) generated, the SMALLEST covering crop (thumbnail) must win.'
);

assert_same(
	$GLOBALS['paf_image_src']['602:avatar'],
	pixassist_get_local_avatar_image_src( 602, 80 ),
	'When the smaller covering crop was never generated for this attachment, the next-smallest one that exists must be used.'
);

assert_same(
	$GLOBALS['paf_image_src']['603:80x80'],
	pixassist_get_local_avatar_image_src( 603, 80 ),
	'With no covering square crop generated, must fall back to the size WordPress picks for [size, size].'
);

assert_same(
	$GLOBALS['paf_image_src']['604:full'],
	pixassist_get_local_avatar_image_src( 604, 80 ),
	'With no covering crop and no sized image, must fall back to the original.'
);

assert_same(
	null,
	pixassist_get_local_avatar_image_src( 605, 80 ),
	'With nothing resolvable at all, must return null so the caller can fall back to Gravatar cleanly.'
);

assert_same(
	null,
	pixassist_get_local_avatar_image_src( 999, 80 ),
	'A meta value that is not a real attachment must resolve to null, not fatal.'
);

/* ============================ pre_get_avatar_data resolution ============================ */

$base_args = array( 'size' => 80 );

// User 1 resolved by ID.
$result = apply_filters( 'pre_get_avatar_data', $base_args, 1 );
assert_true( ! empty( $result['found_avatar'] ), 'A user ID with a local avatar must resolve found_avatar = true.' );
assert_same( $GLOBALS['paf_image_src']['601:thumbnail'][0], $result['url'], 'The resolved URL must be the smallest covering crop for the requested size.' );

// Same user, resolved by email string.
$result = apply_filters( 'pre_get_avatar_data', $base_args, 'user1@example.test' );
assert_true( ! empty( $result['found_avatar'] ), 'An email address for a user with a local avatar must resolve found_avatar = true.' );
assert_same( $GLOBALS['paf_image_src']['601:thumbnail'][0], $result['url'], 'Email resolution must produce the same URL as ID resolution.' );

// Same user, resolved by WP_User object.
$result = apply_filters( 'pre_get_avatar_data', $base_args, $GLOBALS['paf_users'][1] );
assert_true( ! empty( $result['found_avatar'] ), 'A WP_User object with a local avatar must resolve found_avatar = true.' );

// Same user, resolved as a post author (WP_Post).
$result = apply_filters( 'pre_get_avatar_data', $base_args, new WP_Post( 1 ) );
assert_true( ! empty( $result['found_avatar'] ), 'A WP_Post whose author has a local avatar must resolve found_avatar = true.' );

// Same user, resolved as a registered commenter (WP_Comment with user_id).
$result = apply_filters( 'pre_get_avatar_data', $base_args, new WP_Comment( 1, 'comment' ) );
assert_true( ! empty( $result['found_avatar'] ), 'A WP_Comment from a registered user with a local avatar must resolve found_avatar = true.' );

// A guest comment (user_id = 0) must be left completely untouched -> core's own Gravatar path runs.
$result = apply_filters( 'pre_get_avatar_data', $base_args, new WP_Comment( 0, 'comment' ) );
assert_same( $base_args, $result, 'A guest comment (no user_id) must be returned untouched.' );

// A non-avatar comment type (e.g. pingback) must be left untouched even for a registered user.
$result = apply_filters( 'pre_get_avatar_data', $base_args, new WP_Comment( 1, 'pingback' ) );
assert_same( $base_args, $result, 'A non-avatar comment type must be left untouched, regardless of user_id.' );

// A user with no local avatar meta must be left untouched (unchanged today, per the acceptance).
$result = apply_filters( 'pre_get_avatar_data', $base_args, 2 );
assert_same( $base_args, $result, 'A user without the local avatar meta must be returned untouched.' );

// A user whose meta points at a missing/invalid attachment must fall back cleanly.
$result = apply_filters( 'pre_get_avatar_data', $base_args, 3 );
assert_same( $base_args, $result, 'A local avatar meta pointing at a non-attachment must fall back to Gravatar untouched.' );

// force_default must be respected even for a user who has a local avatar set.
$forced = array( 'size' => 80, 'force_default' => true );
$result = apply_filters( 'pre_get_avatar_data', $forced, 1 );
assert_same( $forced, $result, 'force_default must short-circuit local avatar resolution and return $args untouched.' );

// A non-existent numeric user ID must be left untouched.
$result = apply_filters( 'pre_get_avatar_data', $base_args, 424242 );
assert_same( $base_args, $result, 'A non-existent user ID must be returned untouched.' );

// A malformed identifier (neither numeric, string, nor a known object) must be left untouched.
$result = apply_filters( 'pre_get_avatar_data', $base_args, array( 'not' => 'valid' ) );
assert_same( $base_args, $result, 'A malformed identifier must be returned untouched rather than erroring.' );

/* ============================ Profile-screen save handler ============================ */

$GLOBALS['paf_denied_caps'] = array();
$_POST                      = array();

// A valid selection for an image attachment must be saved.
$_POST['pixassist_local_avatar_nonce'] = 'VALID-NONCE';
$_POST['pxg_local_avatar_id']          = '650';
pixassist_save_local_avatar_field( 10 );
assert_same( 650, $GLOBALS['paf_user_meta'][10]['pxg_local_avatar_id'], 'A valid image attachment selection must be saved as the local avatar meta.' );

// Clearing the field (id = 0) must delete the meta.
$_POST['pxg_local_avatar_id'] = '0';
pixassist_save_local_avatar_field( 10 );
assert_true( ! isset( $GLOBALS['paf_user_meta'][10]['pxg_local_avatar_id'] ), 'Submitting an empty selection must delete the local avatar meta (clean fallback to Gravatar).' );

// Re-set it, then confirm a non-image attachment id is ignored rather than stored.
$_POST['pxg_local_avatar_id'] = '650';
pixassist_save_local_avatar_field( 10 );
$_POST['pxg_local_avatar_id'] = '651'; // application/pdf
pixassist_save_local_avatar_field( 10 );
assert_same( 650, $GLOBALS['paf_user_meta'][10]['pxg_local_avatar_id'], 'A non-image attachment id must be ignored, leaving the existing local avatar meta untouched.' );

// An invalid nonce must block the save entirely.
$_POST['pixassist_local_avatar_nonce'] = 'WRONG-NONCE';
$_POST['pxg_local_avatar_id']          = '0';
pixassist_save_local_avatar_field( 10 );
assert_same( 650, $GLOBALS['paf_user_meta'][10]['pxg_local_avatar_id'], 'An invalid nonce must block the save (meta stays at its prior value).' );

// A user who cannot manage local avatars (no upload_files) must never have their meta touched.
$_POST['pixassist_local_avatar_nonce'] = 'VALID-NONCE';
$_POST['pxg_local_avatar_id']          = '650';
$GLOBALS['paf_denied_caps']['upload_files'] = true;
pixassist_save_local_avatar_field( 20 );
assert_true( ! isset( $GLOBALS['paf_user_meta'][20] ), 'A user lacking upload_files must never get local avatar meta written.' );
$GLOBALS['paf_denied_caps'] = array();

echo "Local avatar OK\n";
