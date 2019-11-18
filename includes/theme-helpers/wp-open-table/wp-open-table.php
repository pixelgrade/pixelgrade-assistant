<?php
/**
 * A simple Open Table widget and shortcode.
 *
 */
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'Pixassist_Open_Table_Widget' ) ) :
class Pixassist_Open_Table_Widget extends WP_Widget {

	/**
	 * Register widget with WordPress.
	 */
	public function __construct() {
		parent::__construct(
			'Pixassist_Open_Table_Widget',
			esc_html__( 'OpenTable Widget', '__plugin_txtd' ),
			array(
				'description' => __( 'OpenTable Widget for WordPress', '__plugin_txtd' ),
			)
		);
	}

	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];

		if ( ! empty( $instance['title'] ) ) {
			echo $args['before_title'] . $instance['title'] . $args['after_title'];
		}

		// get the embed code from the Customizer
		$open_table_embed_code = pixelgrade_option( 'open_table_embed_code' );
		if ( ! empty( $open_table_embed_code ) ) {
			// we need to process it a bit - extract the parameters
			$params = self::extract_embed_params( $open_table_embed_code );

			if ( ! empty( $instance['widget_style'] ) ) {
				$params['theme'] = $instance['widget_style'];
			}

			// Now rebuild the parameters with out special alterations depending on widget options
			echo '<script type="text/javascript" src="' . esc_url( self::build_embed_url( $params ) ) . '"></script>';
		} else {
			printf( __( '<p>You first need to copy&paste your EMBED code from <a href="%s">OpenTable Reservations</a> in <a href="%s">Appearance > Customize > General</a>.</p>', '__plugin_txtd' ),
				'https://www.otrestaurant.com/marketing/ReservationWidget" target="_blank',
				esc_url( add_query_arg(
					array(
						array( 'autofocus' => array( 'section' => 'pixelgrade_options[general]' ) ),
						'return' => urlencode( wp_unslash( $_SERVER['REQUEST_URI'] ) ),
					),
					admin_url( 'customize.php' )
				) )
			);
		}

		echo $args['after_widget'];
	}

	/**
	 * Sanitize widget form values as they are saved.
	 *
	 * @see WP_Widget::update()
	 *
	 * @param array $new_instance Values just sent to be saved.
	 * @param array $old_instance Previously saved values from database.
	 *
	 * @return array Updated safe values to be saved.
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = array();

		$instance['title']   =  sanitize_text_field( $new_instance['title'] );

		$instance['widget_style'] = sanitize_text_field( $new_instance['widget_style'] );

		return $instance;
	}

	/**
	 * Back-end widget form.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 *
	 * @return void
	 */
	public function form( $instance ) {
	?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>">
				<?php esc_html_e( 'Title:', '__plugin_txtd' ); ?>
			</label>
			<?php
			printf( '<input class="widefat" id="%1$s" name="%2$s" type="text" value="%3$s" />',
				esc_attr( $this->get_field_id( 'title' ) ),
				esc_attr( $this->get_field_name( 'title' ) ),
				isset( $instance['title'] ) ? esc_attr( $instance['title'] ) : esc_attr__( 'My OpenTable Widget', '__plugin_txtd' )
			);
			?>
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'widget_style' ) ); ?>"><?php esc_html_e( 'Widget Style', '__plugin_txtd' ); ?>:</label>
			<select id="<?php echo esc_attr( $this->get_field_id( 'widget_style' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'widget_style' ) ); ?>" class="widefat">
				<?php
				$options = array(
					'standard' => esc_html__( 'Standard', '__plugin_txtd' ),
					'tall' => esc_html__( 'Tall', '__plugin_txtd' ),
					'wide' => esc_html__( 'Wide', '__plugin_txtd' ),
					'button' => esc_html__( 'Button', '__plugin_txtd' ),
				);

				foreach ( $options as $option_value => $option_name ) {
					echo '<option value="' . esc_attr( $option_value ) . '"' . ( ( isset( $instance['widget_style'] ) && $instance['widget_style'] == $option_value ) ? ' selected="selected"' : '' ) . '>' . $option_name . '</option>' . PHP_EOL;
				} ?>
			</select>
		</p>
	<?php
	}

	/**
	 * Parse Javascript elements so we don't let them execute any weird code.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param string. The Javascript embed code from OpenTable Website.
	 *
	 * @return array The extracted values from the URL.
	 */
	static public function extract_embed_params( $js_string ) {
		preg_match( '/< *script[^>]*src *= *["\']?([^"\']*)/i', $js_string, $matches );

		if ( ! isset( $matches[1] ) ) {
			return false;
		}

		$allowed_args = array(
			'rid'           => '',
			'bgcolor'       => '',
			'titlecolor'    => '',
			'subtitlecolor' => '',
			'btnbgimage'    => '',
			'otlink'        => '',
			'icon'          => '',
			'mode'          => '',
			'domain'          => 'com',
			'type'          => 'standard',
			'theme'          => 'standard',
			'lang'          => 'en',
			'overlay'          => 'false',
		);
		$parts = parse_url( $matches[1] );

		if ( ! isset( $parts['query'] ) ) {
			return false;
		}

		$parts['query'] = pixassist_open_table_proper_parse_str( urldecode( $parts['query'] ) );

		$whitelisted_query_args = wp_parse_args( $parts['query'], $allowed_args );

		return $whitelisted_query_args ;
	}

	/**
	 * Build an embed URL from an array of URL values.
	 *
	 * @param $params Array of URL values.
	 *
	 * @return string Embed URL
	 */
	static public function build_embed_url( $params ) {
		return add_query_arg( array(
				'rid'           => $params['rid'],
				'restref'       => (int) $params['rid'],
				'bgcolor'       => $params['bgcolor'],
				'titlecolor'    => $params['titlecolor'],
				'subtitlecolor' => $params['subtitlecolor'],
				'btnbgimage'    => $params['btnbgimage'],
				'otlink'        => $params['otlink'],
				'icon'          => $params['icon'],
				'mode'          => 'ist',
				'hover'         => '1',
				'domain'          => $params['domain'],
				'type'          => $params['type'],
				'theme'          => $params['theme'],
				'lang'          => $params['lang'],
				'overlay'          => $params['overlay'],
				'iframe' => false, // force without iFrame so we can style it
		), '//www.opentable.com/widget/reservation/loader' );
	}
}
endif;

if ( ! function_exists ( 'pixassist_open_table_proper_parse_str' ) ) :
function pixassist_open_table_proper_parse_str($str) {
	# result array
	$arr = array();

	# split on outer delimiter
	$pairs = explode('&', $str);

	# loop through each pair
	foreach ($pairs as $i) {
		# split into name and value
		list($name,$value) = explode('=', $i, 2);

		# if name already exists
		if( isset($arr[$name]) ) {
			# stick multiple values into an array
			if( is_array($arr[$name]) ) {
				$arr[$name][] = $value;
			}
			else {
				$arr[$name] = array($arr[$name], $value);
			}
		}
		# otherwise, simply stick it in a scalar
		else {
			$arr[$name] = $value;
		}
	}

	# return result array
	return $arr;
}
endif;

if ( ! function_exists( 'pixelgrade_open_table_customify_option' ) ) :
function pixelgrade_open_table_customify_option( $options ) {
	if ( ! isset( $options['general']['options'] ) ) {
		$options['general']['options'] = array();
	}

	// We add a field for the embed code
	$options['general']['options']['open_table_embed_code'] = array(
		'type'    => 'textarea',
		'label'   => esc_html__( 'OpenTable Embed Code', '__plugin_txtd' ),
		'default' => '',
		'desc'    => sprintf( __( 'Paste your EMBED code from <a href="%s">OpenTable Reservations</a>.', '__plugin_txtd' ),
			'https://www.otrestaurant.com/marketing/ReservationWidget" target="_blank'
		),
		'priority' => 30,
	);

	return $options;
}
endif;

if ( ! function_exists( 'pixelgrade_ot_reservation_widget_shortcode' ) ) :
function pixelgrade_ot_reservation_widget_shortcode( $atts ) {
	// Default attributes
	$atts = shortcode_atts( array(
		'type'   => 'standard', // this can be 'standard', 'tall', 'wide' or 'button'
	), $atts, 'ot_reservation_widget' );

	// A little sanitization
	if ( $atts['type'] && ! in_array( $atts['type'], array( 'standard', 'tall', 'wide', 'button' ) ) ) {
		// in case of illegal value fallback to 'standard'
		$atts['type'] = 'standard';
	}

	// get the embed code from the Customizer
	$open_table_embed_code = pixelgrade_option( 'open_table_embed_code' );
	if ( ! empty( $open_table_embed_code ) ) {
		// we need to process it a bit - extract the parameters
		$params = Pixassist_Open_Table_Widget::extract_embed_params( $open_table_embed_code );

		if ( ! empty( $atts['type'] ) ) {
			// The button type is a little special - meaning is not a theme but an actual type, parameters wise
			if ( 'button' == $atts['type'] ) {
				$params['type'] = 'button';
				$params['theme'] = 'standard';
			} else {
				$params['theme'] = $atts['type'];
			}
		}

		// Now rebuild the parameters with out special alterations depending on widget options
		return '<script type="text/javascript" src="' . esc_attr( Pixassist_Open_Table_Widget::build_embed_url( $params ) ) . '"></script>';
	} else {
		return sprintf( __( '<p>You first need to copy&paste your EMBED code from <a href="%s">OpenTable Reservations</a> in <a href="%s">Appearance > Customize > General</a>.</p>', '__plugin_txtd' ),
			'https://www.otrestaurant.com/marketing/ReservationWidget" target="_blank',
			esc_url( add_query_arg(
				array(
					array( 'autofocus' => array( 'section' => 'pixelgrade_options[general]' ) ),
					'return' => urlencode( wp_unslash( $_SERVER['REQUEST_URI'] ) ),
				),
				admin_url( 'customize.php' )
			) )
		);
	}
}
endif;
