<?php
/**
 * Pins starter recipes as bundle presets over granular layout units.
 *
 * Standalone: run with `php tests/recipe-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/fixtures/wp/' );
define( 'PIXELGRADE_ASSISTANT__API_BASE_DOMAIN', 'pixelgrade.test' );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['paf_pixassist_options'] = array();
$GLOBALS['paf_theme_mods']        = array();
$GLOBALS['paf_wp_options']        = array();
$GLOBALS['paf_deleted_posts']     = array();
$GLOBALS['paf_deleted_terms']     = array();
$GLOBALS['paf_deleted_media']     = array();
$GLOBALS['paf_style_actions']     = array();

class PAF_WPDB {
	public $options = 'wp_options';

	public function query( $sql ) {
		$GLOBALS['paf_last_sql'] = $sql;

		return true;
	}
}

$GLOBALS['wpdb'] = new PAF_WPDB();

class WP_Error {
	private $code;
	private $message;
	private $data;

	public function __construct( $code, $message = '', $data = array() ) {
		$this->code    = $code;
		$this->message = $message;
		$this->data    = $data;
	}

	public function get_error_code() {
		return $this->code;
	}

	public function get_error_message() {
		return $this->message;
	}

	public function get_error_data() {
		return $this->data;
	}
}

class WP_REST_Response {}

function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
	return true;
}

function apply_filters( $hook, $value ) {
	return $value;
}

function do_action( $hook ) {
	$GLOBALS['paf_style_actions'][] = $hook;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

function esc_html( $text ) {
	return (string) $text;
}

function sanitize_text_field( $value ) {
	return trim( wp_strip_all_tags( (string) $value ) );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function sanitize_title( $key ) {
	return sanitize_key( $key );
}

function wp_strip_all_tags( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function esc_url_raw( $url ) {
	return (string) $url;
}

function trailingslashit( $value ) {
	return rtrim( (string) $value, '/' ) . '/';
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}

function absint( $value ) {
	return abs( (int) $value );
}

function is_wp_error( $value ) {
	return $value instanceof WP_Error;
}

function rest_ensure_response( $value ) {
	return $value;
}

function current_user_can( $capability ) {
	return true;
}

function wp_cache_flush() {
	return true;
}

function get_option( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_wp_options'] ) ? $GLOBALS['paf_wp_options'][ $key ] : $default;
}

function update_option( $key, $value ) {
	$GLOBALS['paf_wp_options'][ $key ] = $value;

	return true;
}

function delete_option( $key ) {
	unset( $GLOBALS['paf_wp_options'][ $key ] );

	return true;
}

function get_theme_mod( $key, $default = false ) {
	return array_key_exists( $key, $GLOBALS['paf_theme_mods'] ) ? $GLOBALS['paf_theme_mods'][ $key ] : $default;
}

function set_theme_mod( $key, $value ) {
	$GLOBALS['paf_theme_mods'][ $key ] = $value;
}

function remove_theme_mod( $key ) {
	unset( $GLOBALS['paf_theme_mods'][ $key ] );
}

function wp_delete_post( $post_id, $force = false ) {
	$GLOBALS['paf_deleted_posts'][] = absint( $post_id );

	return true;
}

function taxonomy_exists( $taxonomy ) {
	return true;
}

function term_exists( $term_id, $taxonomy = '' ) {
	return true;
}

function wp_delete_term( $term_id, $taxonomy ) {
	$GLOBALS['paf_deleted_terms'][] = array( absint( $term_id ), sanitize_key( $taxonomy ) );

	return true;
}

function wp_get_attachment_metadata( $attachment_id ) {
	return array( 'imported_with_pixassist' => true );
}

function wp_delete_attachment( $attachment_id, $force = false ) {
	$GLOBALS['paf_deleted_media'][] = absint( $attachment_id );

	return true;
}

class PixelgradeAssistant_Admin {
	public static function get_option( $key, $default = null, $force_refresh = false ) {
		return array_key_exists( $key, $GLOBALS['paf_pixassist_options'] ) ? $GLOBALS['paf_pixassist_options'][ $key ] : $default;
	}

	public static function set_option( $key, $value ) {
		$GLOBALS['paf_pixassist_options'][ $key ] = $value;
	}

	public static function save_options() {
		return true;
	}

	public static function get_config() {
		return array();
	}
}

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

require __DIR__ . '/../admin/class-pixelgrade_assistant-starter_content.php';

class PAF_Recipe_Starter_Content extends PixelgradeAssistant_StarterContent {
	public $import_calls = array();
	public $undo_calls   = array();
	public $sources      = array();
	public $units        = array();

	public function __construct() {}

	public function list_layout_units( $demo_key, $base_url ) {
		$demo_key = sanitize_key( $demo_key );

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'units' => isset( $this->units[ $demo_key ] ) ? $this->units[ $demo_key ] : array(),
			),
		);
	}

	public function import_layout_unit( $demo_key, $base_url, $unit_type, $unit, $options = array() ) {
		$demo_key  = sanitize_key( $demo_key );
		$unit_type = sanitize_key( $unit_type );
		$unit      = sanitize_key( $unit );
		$slot      = $unit_type . ':' . $unit;

		$this->import_calls[] = array(
			'demoKey'       => $demo_key,
			'type'          => $unit_type,
			'slug'          => $unit,
			'includeSample' => isset( $options['include_sample'] ) ? (bool) $options['include_sample'] : null,
		);

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		if ( ! is_array( $starter_content ) ) {
			$starter_content = array();
		}

		foreach ( $starter_content as &$journal ) {
			if ( isset( $journal['layout_units'][ $slot ] ) ) {
				unset( $journal['layout_units'][ $slot ] );
			}
		}
		unset( $journal );

		if ( empty( $starter_content[ $demo_key ] ) || ! is_array( $starter_content[ $demo_key ] ) ) {
			$starter_content[ $demo_key ] = array();
		}
		if ( empty( $starter_content[ $demo_key ]['layout_units'] ) || ! is_array( $starter_content[ $demo_key ]['layout_units'] ) ) {
			$starter_content[ $demo_key ]['layout_units'] = array();
		}

		$starter_content[ $demo_key ]['layout_units'][ $slot ] = array(
			'type'        => $unit_type,
			'slug'        => $unit,
			'title'       => ucwords( str_replace( '-', ' ', $unit ) ),
			'demoKey'     => $demo_key,
			'baseRestUrl' => esc_url_raw( $base_url ),
			'journal'     => array(
				'post_types' => array(
					$unit_type => array( count( $this->import_calls ) => 1000 + count( $this->import_calls ) ),
				),
			),
		);

		if ( 'feature' === $unit_type ) {
			$features = PixelgradeAssistant_Admin::get_option( 'enabled_features', array() );
			$features[] = $unit;
			PixelgradeAssistant_Admin::set_option( 'enabled_features', array_values( array_unique( $features ) ) );
			$starter_content[ $demo_key ]['enabled_features'][ $unit ] = true;
			$starter_content[ $demo_key ]['layout_units'][ $slot ]['journal']['enabled_features'][ $unit ] = true;
		}

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'unit'         => array(
					'type' => $unit_type,
					'slug' => $unit,
				),
				'appliedUnits' => $this->get_applied_layout_units(),
			),
		);
	}

	public function undo_layout_unit( $unit_type, $unit, $options = array() ) {
		$unit_type = sanitize_key( $unit_type );
		$unit      = sanitize_key( $unit );
		$slot      = $unit_type . ':' . $unit;

		$starter_content = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
		foreach ( $starter_content as $demo_key => &$journal ) {
			if ( empty( $journal['layout_units'][ $slot ] ) ) {
				continue;
			}

			$this->undo_calls[] = array(
				'demoKey' => sanitize_key( $demo_key ),
				'type'    => $unit_type,
				'slug'    => $unit,
			);
			unset( $journal['layout_units'][ $slot ] );

			if ( 'feature' === $unit_type ) {
				$features = array_values(
					array_filter(
						(array) PixelgradeAssistant_Admin::get_option( 'enabled_features', array() ),
						function ( $feature ) use ( $unit ) {
							return $feature !== $unit;
						}
					)
				);
				PixelgradeAssistant_Admin::set_option( 'enabled_features', $features );
				unset( $journal['enabled_features'][ $unit ] );
			}
			break;
		}
		unset( $journal );

		PixelgradeAssistant_Admin::set_option( 'imported_starter_content', $starter_content );

		return array(
			'code'    => 'success',
			'message' => '',
			'data'    => array(
				'appliedUnits' => $this->get_applied_layout_units(),
			),
		);
	}
}

$starter = new PAF_Recipe_Starter_Content();
$sources = array(
	array(
		'id'          => 'anima-portfolio',
		'title'       => 'Meridian',
		'description' => 'Architecture portfolio starter.',
		'baseRestUrl' => 'https://portfolio-source.test/wp-json/sce/v2/',
		'image'       => 'https://portfolio-source.test/preview.jpg',
	),
	array(
		'id'          => 'anima-blog',
		'title'       => 'Field Notes',
		'baseRestUrl' => 'https://blog-source.test/wp-json/sce/v2/',
	),
);
$starter->units = array(
	'anima-portfolio' => array(
		array( 'id' => 98, 'type' => 'wp_template_part', 'slug' => 'header', 'title' => 'Header' ),
		array( 'id' => 86, 'type' => 'wp_template_part', 'slug' => 'footer', 'title' => 'Footer' ),
		array( 'id' => 501, 'type' => 'wp_template', 'slug' => 'archive-portfolio', 'title' => 'Portfolio Archive' ),
		array( 'id' => 502, 'type' => 'wp_template', 'slug' => 'single-portfolio', 'title' => 'Portfolio Single' ),
		array( 'id' => 'portfolio', 'type' => 'feature', 'slug' => 'portfolio', 'title' => 'Portfolio', 'sampleDefault' => true ),
	),
	'anima-blog'      => array(
		array( 'id' => 11, 'type' => 'wp_template_part', 'slug' => 'header', 'title' => 'Header' ),
		array( 'id' => 12, 'type' => 'wp_template', 'slug' => 'home', 'title' => 'Home' ),
	),
);

assert_true( method_exists( $starter, 'list_recipes' ), 'Starter Content must expose list_recipes().' );
assert_true( method_exists( $starter, 'apply_recipe' ), 'Starter Content must expose apply_recipe().' );
assert_true( method_exists( $starter, 'undo_recipe' ), 'Starter Content must expose undo_recipe().' );
assert_true( method_exists( $starter, 'get_applied_recipes' ), 'Starter Content must expose get_applied_recipes().' );

$recipes_response = $starter->list_recipes( $sources );
assert_same( 'success', $recipes_response['code'], 'Recipe listing must return a success code.' );
assert_same( 2, count( $recipes_response['data']['recipes'] ), 'Recipe listing must expose one recipe per available source.' );

$recipe = $recipes_response['data']['recipes'][0];
assert_same( 'anima-portfolio', $recipe['id'], 'A source recipe id must match its source id.' );
assert_same( 'Meridian', $recipe['title'], 'A source recipe title must match its source title.' );
assert_same( 'https://portfolio-source.test/preview.jpg', $recipe['image'], 'A recipe must preserve the source preview image.' );
assert_same( false, $recipe['defaults']['includeLook'], 'Recipes must be layout-only by default.' );
assert_same( false, $recipe['defaults']['includeSample'], 'Recipes must not import sample content by default.' );
assert_same(
	array(
		'wp_template_part:header',
		'wp_template_part:footer',
		'wp_template:archive-portfolio',
		'wp_template:single-portfolio',
		'feature:portfolio',
	),
	array_keys( $recipe['units'] ),
	'Recipe units must be ordered as parts, templates, then features.'
);

$apply = $starter->apply_recipe(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/',
	array(
		'include_sample' => false,
		'include_look'   => false,
		'sources'        => $sources,
	)
);
assert_same( 'success', $apply['code'], 'Applying a recipe must succeed.' );
assert_same(
	array(
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template_part', 'slug' => 'header', 'includeSample' => null ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template_part', 'slug' => 'footer', 'includeSample' => null ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template', 'slug' => 'archive-portfolio', 'includeSample' => null ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template', 'slug' => 'single-portfolio', 'includeSample' => null ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'feature', 'slug' => 'portfolio', 'includeSample' => false ),
	),
	$starter->import_calls,
	'Applying a recipe must import each unit in bundle order and force feature samples off by default.'
);

$journal = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
assert_true( isset( $journal['anima-portfolio']['recipe_bundles']['recipe:anima-portfolio'] ), 'Applying a recipe must store one recipe bundle in the starter-content journal.' );
$bundle = $journal['anima-portfolio']['recipe_bundles']['recipe:anima-portfolio'];
assert_same( 'anima-portfolio', $bundle['id'], 'The recipe bundle must carry the recipe id.' );
assert_same( false, $bundle['includeSample'], 'The recipe bundle must journal the sample-content choice.' );
assert_same( false, $bundle['includeLook'], 'The recipe bundle must journal the look choice.' );
assert_same( 5, count( $bundle['units'] ), 'The recipe bundle must journal the full unit set as one bundle.' );

$applied_recipes = $starter->get_applied_recipes();
assert_same( true, $applied_recipes['recipe:anima-portfolio']['isApplied'], 'Applied recipe state must mark the complete recipe as applied.' );
assert_same( 5, $applied_recipes['recipe:anima-portfolio']['appliedUnitCount'], 'Applied recipe state must count all current recipe units.' );

$starter->import_layout_unit( 'anima-blog', 'https://blog-source.test/wp-json/sce/v2/', 'wp_template_part', 'header' );
$deviated_recipes = $starter->get_applied_recipes();
assert_same( false, $deviated_recipes['recipe:anima-portfolio']['isApplied'], 'Replacing one unit after recipe apply must mark the recipe as deviated.' );
assert_same( 4, $deviated_recipes['recipe:anima-portfolio']['appliedUnitCount'], 'Deviated recipe state must count only units still matching the bundle.' );

$undo = $starter->undo_recipe( 'anima-portfolio' );
assert_same( 'success', $undo['code'], 'Undoing an applied recipe must succeed.' );
assert_same(
	array(
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template_part', 'slug' => 'footer' ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template', 'slug' => 'archive-portfolio' ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'wp_template', 'slug' => 'single-portfolio' ),
		array( 'demoKey' => 'anima-portfolio', 'type' => 'feature', 'slug' => 'portfolio' ),
	),
	$starter->undo_calls,
	'Undoing a recipe must skip a slot the user already replaced after applying the recipe.'
);

$after_undo = PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() );
assert_true( isset( $after_undo['anima-blog']['layout_units']['wp_template_part:header'] ), 'Undoing a recipe must not touch an unrelated replacement unit.' );
assert_true( empty( $after_undo['anima-portfolio']['recipe_bundles'] ), 'Undoing a recipe must remove its bundle metadata.' );
assert_same( array(), PixelgradeAssistant_Admin::get_option( 'enabled_features', array() ), 'Undoing a recipe must disable feature flags still owned by the bundle.' );
assert_same( array(), $starter->get_applied_recipes(), 'No applied recipe state should remain after undo.' );

$starter->apply_recipe(
	'anima-portfolio',
	'https://portfolio-source.test/wp-json/sce/v2/',
	array(
		'include_sample' => true,
		'include_look'   => false,
		'sources'        => $sources,
	)
);
$reset_summary = $starter->reset_starter_content();
assert_same( array(), PixelgradeAssistant_Admin::get_option( 'imported_starter_content', array() ), 'Full Reset must clear recipe bundle metadata with the starter-content journal.' );
assert_same( array(), $starter->get_applied_recipes(), 'Full Reset must leave no applied recipes.' );
assert_true( 0 < $reset_summary['journals'], 'Full Reset must process the recipe source journal.' );

echo "Recipe bundle contract OK\n";
