<?php
/**
 * Create a custom Social Menu if Jetpack is not installed/configured.
 *
 * Code borrowed from Jetpack just in case Jetpack is missing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'pixassist_jetpack_social_menu_init' ) ) {
	/**
	 * Initialize the Social Menu logic.
	 *
	 * @uses current_theme_supports()
	 */
	function pixassist_jetpack_social_menu_init() {
		// Only load our code if our theme declares support
		if ( ! current_theme_supports( 'jetpack-social-menu' ) ) {
			return;
		}

		/*
		 * Social Menu description.
		 *
		 * Rename the social menu description.
		 *
		 * @module theme-tools
		 *
		 * @since 3.9.0
		 *
		 * @param string $social_menu_description Social Menu description
		 */
		$social_menu_description = apply_filters( 'pixassist_jetpack_social_menu_description', __( 'Social Menu', '__plugin_txtd' ) );

		// Register a new menu location
		register_nav_menus(
			array(
				'jetpack-social-menu' => esc_html( $social_menu_description ),
			)
		);

		// Enqueue CSS
		add_action( 'wp_enqueue_scripts', 'pixassist_jetpack_social_menu_style' );

		// Load SVG icons related functions and filters
		if ( 'svg' === pixassist_jetpack_social_menu_get_type() ) {
			require dirname( __FILE__ ) . '/social-menu/icon-functions.php';
		}


	}
}
add_action( 'after_setup_theme', 'pixassist_jetpack_social_menu_init', 99 );

if ( ! function_exists( 'pixassist_jetpack_social_menu_style' ) ) {

	/**
	 * Function to enqueue the CSS.
	 */
	function pixassist_jetpack_social_menu_style() {
		$menu_type = pixassist_jetpack_social_menu_get_type();

		if ( ! $menu_type ) {
			return;
		}

		$deps = ( 'genericons' === $menu_type ) ? array( 'genericons' ) : null;

		if ( has_nav_menu( 'jetpack-social-menu' ) ) {
			wp_enqueue_style( 'jetpack-social-menu', plugins_url( 'social-menu/social-menu.css', __FILE__ ), $deps, '1.0' );
		}
	}
}

if ( ! function_exists( 'jetpack_social_menu' ) ) {

	/**
	 * Create the function for the menu.
	 */
	function jetpack_social_menu() {
		if ( has_nav_menu( 'jetpack-social-menu' ) ) {
			$menu_type  = pixassist_jetpack_social_menu_get_type();
			$link_after = '</span>';

			if ( 'svg' === $menu_type ) {
				$link_after .= pixassist_jetpack_social_menu_get_svg( array( 'icon' => 'chain' ) );
			} ?>
            <nav class="jetpack-social-navigation jetpack-social-navigation-<?php echo esc_attr( $menu_type ); ?>"
                 role="navigation" aria-label="<?php esc_html_e( 'Social Links Menu', '__plugin_txtd' ); ?>">
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'jetpack-social-menu',
						'link_before'    => '<span class="screen-reader-text">',
						'link_after'     => $link_after,
						'depth'          => 1,
					)
				);
				?>
            </nav><!-- .jetpack-social-navigation -->
		<?php }
	}
}

if ( ! function_exists( 'pixassist_jetpack_social_menu_get_type' ) ) {

	/**
	 * Return the type of menu the theme is using.
	 *
	 * @uses get_theme_support()
	 * @return null|string $menu_type
	 */
	function pixassist_jetpack_social_menu_get_type() {
		$options = get_theme_support( 'jetpack-social-menu' );

		if ( empty( $options ) || ! is_array( $options ) ) {
			$menu_type = null;
		} else {
			$menu_type = ( in_array( $options[0], array( 'genericons', 'svg' ) ) ) ? $options[0] : 'genericons';
		}

		return $menu_type;
	}
}

if ( ! function_exists( 'pixassist_jetpack_social_menu_get_svg' ) ) {
	/**
	 * Return SVG markup.
	 *
	 * @param array $args {
	 *     Parameters needed to display an SVG.
	 *
	 * @type string $icon Required SVG icon filename.
	 * }
	 * @return string SVG markup.
	 */
	function pixassist_jetpack_social_menu_get_svg( $args = array() ) {
		// Make sure $args are an array.
		if ( empty( $args ) ) {
			return esc_html__( 'Please define default parameters in the form of an array.', '__plugin_txtd' );
		}

		// Define an icon.
		if ( false === array_key_exists( 'icon', $args ) ) {
			return esc_html__( 'Please define an SVG icon filename.', '__plugin_txtd' );
		}

		// Set defaults.
		$defaults = array(
			'icon'     => '',
			'fallback' => false,
		);

		// Parse args.
		$args = wp_parse_args( $args, $defaults );

		// Set aria hidden.
		$aria_hidden = ' aria-hidden="true"';

		// Begin SVG markup.
		$svg = '<svg class="icon icon-' . esc_attr( $args['icon'] ) . '"' . $aria_hidden . ' role="img">';

		/*
		 * Display the icon.
		 *
		 * The whitespace around `<use>` is intentional - it is a work around to a keyboard navigation bug in Safari 10.
		 *
		 * See https://core.trac.wordpress.org/ticket/38387.
		 */
		$svg .= ' <use href="#icon-' . esc_html( $args['icon'] ) . '" xlink:href="#icon-' . esc_html( $args['icon'] ) . '"></use> ';

		// Add some markup to use as a fallback for browsers that do not support SVGs.
		if ( $args['fallback'] ) {
			$svg .= '<span class="svg-fallback icon-' . esc_attr( $args['icon'] ) . '"></span>';
		}

		$svg .= '</svg>';

		return $svg;
	}
}
