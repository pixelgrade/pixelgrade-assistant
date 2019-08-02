<?php
/**
 * The template used for displaying the portfolio shortcode loop
 *
 * @global $portfolio_query
 * @global $atts
 */
if ( ! defined( 'ABSPATH' ) ) exit;

$portfolio_index_number = 0;

// If we have posts, create the html
// with the portfolio markup
if ( $portfolio_query->have_posts() ) { ?>

	<div class="jetpack-portfolio-shortcode column-<?php echo esc_attr( $atts['columns'] ); ?>">
		<?php  // open .jetpack-portfolio

		// We allow for the override of each project's markup
		$content_template = pixelgrade_locate_template_part( 'content-jetpack-portfolio', 'portfolio', 'shortcode' );

		// Construct the loop...
		while ( $portfolio_query->have_posts() ) {
			$portfolio_query->the_post();

			if ( ! empty( $content_template ) ) {

				// Now we need to include the content template part (maybe a theme overrides the default one?)
				// If the Portfolio component is present and active, then we will look into it for a file called content-jetpack-portfolio.php
				if ( class_exists( 'Pixelgrade_Portfolio' ) && Pixelgrade_Portfolio::isActive() ) {
					pixelgrade_get_template_part( 'content-jetpack-portfolio', Pixelgrade_Portfolio::COMPONENT_SLUG, $atts, 'shortcode' );
				} else {
					// Otherwise we look first in the usual places (like template-parts) for a file called content-jetpack-portfolio.php
					// But since it might be the case the only the Portfolio component would hold such a file,
					// We want to fallback to content.php (from the Base component)
					$default = '';
					if ( class_exists( 'Pixelgrade_Base' ) && function_exists( 'pixelgrade_get_component_template_part' ) ) {
						$default = pixelgrade_locate_component_template_part( Pixelgrade_Base::COMPONENT_SLUG,'content', get_post_format(), true );
					}
					pixelgrade_get_template_part( 'content-jetpack-portfolio', '', $atts, 'shortcode', $default );
				}
				continue;
			}

			$post_id = get_the_ID();
			?>
			<div class="portfolio-entry <?php echo esc_attr( Pixelgrade_Jetpack_Portfolio_Shortcode::get_project_class( $portfolio_index_number, $atts['columns'] ) ); ?>">
				<header class="portfolio-entry-header">
					<?php
					// Featured image
					echo Pixelgrade_Jetpack_Portfolio_Shortcode::get_portfolio_thumbnail_link( $post_id );
					?>

					<h2 class="portfolio-entry-title"><a href="<?php echo esc_url( get_permalink() ); ?>" title="<?php echo esc_attr( the_title_attribute( ) ); ?>"><?php the_title(); ?></a></h2>

					<div class="portfolio-entry-meta">
						<?php
						if ( false != $atts['display_types'] ) {
							echo Pixelgrade_Jetpack_Portfolio_Shortcode::get_project_type( $post_id );
						}

						if ( false != $atts['display_tags'] ) {
							echo Pixelgrade_Jetpack_Portfolio_Shortcode::get_project_tags( $post_id );
						}

						if ( false != $atts['display_author'] ) {
							echo Pixelgrade_Jetpack_Portfolio_Shortcode::get_project_author();
						}
						?>
					</div>

				</header>

				<?php
				// The content
				if ( false !== $atts['display_content'] ) {
					add_filter( 'wordads_inpost_disable', '__return_true', 20 );
					if ( 'full' === $atts['display_content'] ) {
						?>
						<div class="portfolio-entry-content"><?php the_content(); ?></div>
						<?php
					} else {
						?>
						<div class="portfolio-entry-content"><?php the_excerpt(); ?></div>
						<?php
					}
					remove_filter( 'wordads_inpost_disable', '__return_true', 20 );
				}
				?>
			</div><!-- close .portfolio-entry -->
			<?php $portfolio_index_number++;
		} // end of while loop

		wp_reset_postdata();
		?>
	</div><!-- close .jetpack-portfolio -->
	<?php
} else { ?>
	<p><em><?php _e( 'Your Portfolio Archive currently has no entries. You can start creating them on your dashboard.', '__plugin_txtd' ); ?></em></p>
	<?php
}
