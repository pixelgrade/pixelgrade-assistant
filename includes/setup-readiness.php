<?php
/**
 * Pixelgrade Design preflight / readiness model for the Setup tab.
 *
 * The Setup tab (route/component id `plugins`, see includes/admin-plugins.php) answers one question:
 * "Is this site ready for Pixelgrade Design work, and what needs attention before I start?". This
 * module owns that readiness logic + copy so the React tab stays presentational and the
 * classification stays unit-testable (tests/setup-readiness-test.php).
 *
 * It deliberately does NOT duplicate the full System Status tables (those stay the detailed
 * diagnostics page). It derives a compact, severity-classified summary from data Assistant already
 * has: the recommended-plugins state (TGMPA via includes/admin-plugins.php), the active Pixelgrade
 * theme, the theme-declared companion version ranges (the "Pixelgrade Plugin Supports" header that
 * conditional-updates also reads), the Care coexistence state, and a few environment facts
 * (PHP / WordPress / memory).
 *
 * Architecture mirrors the onboarding model in includes/admin-overview.php: PURE functions driven by
 * injected "facts" (WP-free, testable) + thin, guarded fact-gathering that degrades safely when a
 * subsystem is unavailable.
 *
 * @package    PixelgradeAssistant
 * @subpackage PixelgradeAssistant/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * ---------------------------------------------------------------------------
 * PURE layer — classification + check building. No WP calls (except the
 * translation stubs the tests provide), no side effects. Everything is driven
 * by the injected $facts array.
 * ---------------------------------------------------------------------------
 */

if ( ! function_exists( 'pixassist_setup_version_status' ) ) {
	/**
	 * Classify a version against minimum (blocking) and recommended (warning) thresholds. Pure.
	 *
	 * An empty/unknown current version returns 'ok' rather than a false alarm — readiness should never
	 * invent a blocker it cannot prove.
	 *
	 * @param string $current     Current version (e.g. '8.2.29').
	 * @param string $minimum     Below this is a blocker.
	 * @param string $recommended Below this (but at/above minimum) is a warning.
	 *
	 * @return string ok|warning|blocked
	 */
	function pixassist_setup_version_status( $current, $minimum, $recommended ) {
		$current = (string) $current;

		if ( '' === $current ) {
			return 'ok';
		}

		if ( '' !== (string) $minimum && version_compare( $current, (string) $minimum, '<' ) ) {
			return 'blocked';
		}

		if ( '' !== (string) $recommended && version_compare( $current, (string) $recommended, '<' ) ) {
			return 'warning';
		}

		return 'ok';
	}
}

if ( ! function_exists( 'pixassist_setup_bytes_status' ) ) {
	/**
	 * Classify a byte amount (e.g. memory limit) against minimum/recommended thresholds. Pure.
	 *
	 * A non-positive value (unknown / unlimited reported as -1) returns 'ok' — never a false alarm.
	 *
	 * @param int $current     Current value in bytes.
	 * @param int $minimum     Below this is a blocker.
	 * @param int $recommended Below this (but at/above minimum) is a warning.
	 *
	 * @return string ok|warning|blocked
	 */
	function pixassist_setup_bytes_status( $current, $minimum, $recommended ) {
		$current = (int) $current;

		if ( $current <= 0 ) {
			return 'ok';
		}

		if ( $minimum > 0 && $current < (int) $minimum ) {
			return 'blocked';
		}

		if ( $recommended > 0 && $current < (int) $recommended ) {
			return 'warning';
		}

		return 'ok';
	}
}

if ( ! function_exists( 'pixassist_setup_format_bytes' ) ) {
	/**
	 * Human-friendly byte formatting that does not depend on WP's size_format() (tests run WP-free).
	 *
	 * @param int $bytes Byte amount.
	 *
	 * @return string e.g. '256 MB'. Empty string for non-positive values.
	 */
	function pixassist_setup_format_bytes( $bytes ) {
		$bytes = (int) $bytes;

		if ( $bytes <= 0 ) {
			return '';
		}

		$units = array( 'B', 'KB', 'MB', 'GB', 'TB' );
		$power = 0;
		$value = $bytes;

		while ( $value >= 1024 && $power < count( $units ) - 1 ) {
			$value = $value / 1024;
			$power ++;
		}

		// Whole numbers read cleaner for the common 128/256/512 MB cases.
		$rounded = ( $value == (int) $value ) ? (string) (int) $value : (string) round( $value, 1 );

		return $rounded . ' ' . $units[ $power ];
	}
}

if ( ! function_exists( 'pixassist_setup_check_severity_rank' ) ) {
	/**
	 * Numeric rank for a severity, so the worst status can win a rollup. Pure.
	 *
	 * @param string $status ok|warning|blocked.
	 *
	 * @return int 0 (ok) .. 2 (blocked).
	 */
	function pixassist_setup_check_severity_rank( $status ) {
		if ( 'blocked' === $status ) {
			return 2;
		}

		if ( 'warning' === $status ) {
			return 1;
		}

		return 0;
	}
}

if ( ! function_exists( 'pixassist_build_setup_plugins_check' ) ) {
	/**
	 * Build the recommended-plugins readiness check from the normalized plugins list. Pure.
	 *
	 * A missing/inactive REQUIRED plugin blocks; a missing/inactive RECOMMENDED plugin or any
	 * out-of-date plugin warns; otherwise ready. The actionable install/activate buttons live in the
	 * plugin list rendered right below on the same tab, so this check carries no action URL — only the
	 * names of the plugins that need attention.
	 *
	 * @param array[] $plugins Normalized plugins from pixassist_get_plugins_data().
	 *
	 * @return array Check descriptor.
	 */
	function pixassist_build_setup_plugins_check( $plugins ) {
		$plugins = is_array( $plugins ) ? $plugins : array();

		$required_missing = array();
		$optional_missing = array();
		$outdated         = array();
		$active_count     = 0;

		foreach ( $plugins as $plugin ) {
			$status = isset( $plugin['status'] ) ? (string) $plugin['status'] : 'missing';
			$name   = isset( $plugin['name'] ) ? (string) $plugin['name'] : ( isset( $plugin['slug'] ) ? (string) $plugin['slug'] : '' );
			$req    = ! empty( $plugin['required'] );

			if ( 'active' === $status || 'outdated' === $status ) {
				$active_count ++;
			}

			if ( 'outdated' === $status ) {
				$outdated[] = array( 'name' => $name, 'status' => 'outdated', 'required' => $req );
			}

			if ( 'missing' === $status || 'inactive' === $status ) {
				if ( $req ) {
					$required_missing[] = array( 'name' => $name, 'status' => $status, 'required' => true );
				} else {
					$optional_missing[] = array( 'name' => $name, 'status' => $status, 'required' => false );
				}
			}
		}

		$total = count( $plugins );

		if ( 0 === $total ) {
			$status = 'ok';
			$value  = esc_html__( 'No recommended plugins for this theme', '__plugin_txtd' );
		} elseif ( ! empty( $required_missing ) ) {
			$status = 'blocked';
			$value  = sprintf( esc_html__( '%1$d of %2$d active', '__plugin_txtd' ), $active_count, $total );
		} elseif ( ! empty( $optional_missing ) || ! empty( $outdated ) ) {
			$status = 'warning';
			$value  = sprintf( esc_html__( '%1$d of %2$d active', '__plugin_txtd' ), $active_count, $total );
		} else {
			$status = 'ok';
			$value  = sprintf( esc_html__( 'All %d active and up to date', '__plugin_txtd' ), $total );
		}

		$items = array_merge( $required_missing, $optional_missing, $outdated );

		return array(
			'id'       => 'plugins',
			'group'    => 'plugins',
			'label'    => esc_html__( 'Recommended plugins', '__plugin_txtd' ),
			'status'   => $status,
			'value'    => $value,
			'expected' => esc_html__( 'All recommended plugins installed, active, and up to date', '__plugin_txtd' ),
			'why'      => esc_html__( 'Pixelgrade Design relies on these plugins for blocks, styles, and starter content. Use the list below to install or activate anything missing.', '__plugin_txtd' ),
			'action'   => null,
			'items'    => $items,
		);
	}
}

if ( ! function_exists( 'pixassist_build_setup_companions_check' ) ) {
	/**
	 * Build the companion-version-range check from the theme-declared support ranges. Pure.
	 *
	 * Each companion fact is { label, range, version, installed (bool), satisfies (bool|null) }.
	 * `satisfies` is resolved by the guarded gatherer using Composer\Semver when available; a null
	 * means "could not determine" and is treated as informational (never a warning). Returns null when
	 * the theme declares no ranges for installed companions, so the check is simply omitted.
	 *
	 * @param array[] $companions Companion facts.
	 *
	 * @return array|null Check descriptor, or null to omit.
	 */
	function pixassist_build_setup_companions_check( $companions ) {
		$companions = is_array( $companions ) ? $companions : array();

		$relevant = array();
		foreach ( $companions as $companion ) {
			if ( ! empty( $companion['installed'] ) && ! empty( $companion['range'] ) ) {
				$relevant[] = $companion;
			}
		}

		if ( empty( $relevant ) ) {
			return null;
		}

		$out_of_range = array();
		$items        = array();
		foreach ( $relevant as $companion ) {
			$satisfies = isset( $companion['satisfies'] ) ? $companion['satisfies'] : null;
			$items[]   = array(
				'label'     => isset( $companion['label'] ) ? (string) $companion['label'] : '',
				'version'   => isset( $companion['version'] ) ? (string) $companion['version'] : '',
				'range'     => isset( $companion['range'] ) ? (string) $companion['range'] : '',
				'satisfies' => ( null === $satisfies ) ? null : (bool) $satisfies,
			);

			if ( false === $satisfies ) {
				$out_of_range[] = isset( $companion['label'] ) ? (string) $companion['label'] : '';
			}
		}

		$status = empty( $out_of_range ) ? 'ok' : 'warning';

		return array(
			'id'       => 'companions',
			'group'    => 'companions',
			'label'    => esc_html__( 'Companion plugin versions', '__plugin_txtd' ),
			'status'   => $status,
			'value'    => empty( $out_of_range )
				? esc_html__( 'Within the versions your theme is tested against', '__plugin_txtd' )
				: sprintf( esc_html__( '%d outside the tested range', '__plugin_txtd' ), count( $out_of_range ) ),
			'expected' => esc_html__( 'Within the versions your theme declares support for', '__plugin_txtd' ),
			'why'      => esc_html__( 'Your theme is tested against specific companion plugin versions. Running outside that range can cause layout or styling differences.', '__plugin_txtd' ),
			'action'   => null,
			'items'    => $items,
		);
	}
}

if ( ! function_exists( 'pixassist_build_setup_checks' ) ) {
	/**
	 * Build the ordered readiness checks from facts. Pure: no WP calls, no side effects.
	 *
	 * @param array $facts {
	 *     @type string $php_version        Current PHP version.
	 *     @type string $wp_version         Current WordPress version.
	 *     @type int    $memory_limit_bytes Effective memory limit in bytes.
	 *     @type bool   $is_care_active     Whether Pixelgrade Care is active.
	 *     @type array  $theme              { name, version, is_pixelgrade (bool), is_block (bool) }.
	 *     @type array  $plugins            Normalized recommended plugins.
	 *     @type array  $companions         Companion-version facts.
	 *     @type array  $thresholds         { php, wp, memory } => { minimum, recommended }.
	 *     @type array  $actions            Resolved action URLs keyed by check id.
	 * }
	 *
	 * @return array[] Ordered check descriptors.
	 */
	function pixassist_build_setup_checks( $facts ) {
		$facts      = is_array( $facts ) ? $facts : array();
		$thresholds = isset( $facts['thresholds'] ) && is_array( $facts['thresholds'] ) ? $facts['thresholds'] : array();
		$actions    = isset( $facts['actions'] ) && is_array( $facts['actions'] ) ? $facts['actions'] : array();
		$theme      = isset( $facts['theme'] ) && is_array( $facts['theme'] ) ? $facts['theme'] : array();

		$php_t    = isset( $thresholds['php'] ) ? $thresholds['php'] : array( 'minimum' => '', 'recommended' => '' );
		$wp_t     = isset( $thresholds['wp'] ) ? $thresholds['wp'] : array( 'minimum' => '', 'recommended' => '' );
		$memory_t = isset( $thresholds['memory'] ) ? $thresholds['memory'] : array( 'minimum' => 0, 'recommended' => 0 );

		$checks = array();

		// 1. Active theme — Pixelgrade Design tools target Pixelgrade themes.
		$theme_name    = isset( $theme['name'] ) ? (string) $theme['name'] : '';
		$theme_version = isset( $theme['version'] ) ? (string) $theme['version'] : '';
		$is_pixelgrade = ! empty( $theme['is_pixelgrade'] );
		$theme_value   = trim( $theme_name . ( '' !== $theme_version ? ' ' . $theme_version : '' ) );
		if ( '' === $theme_value ) {
			$theme_value = esc_html__( 'Unknown theme', '__plugin_txtd' );
		}
		$checks[] = array(
			'id'       => 'theme',
			'group'    => 'theme',
			'label'    => esc_html__( 'Active theme', '__plugin_txtd' ),
			'status'   => $is_pixelgrade ? 'ok' : 'blocked',
			'value'    => $theme_value,
			'expected' => esc_html__( 'An active Pixelgrade theme', '__plugin_txtd' ),
			'why'      => esc_html__( 'Pixelgrade Design styles, blocks, and starter content are built for Pixelgrade themes. Activate one to use these tools.', '__plugin_txtd' ),
			'action'   => $is_pixelgrade ? null : ( isset( $actions['theme'] ) ? $actions['theme'] : null ),
			'items'    => array(),
		);

		// 2. Pixelgrade Care coexistence (defensive — the hub does not load while Care is active).
		$care_active = ! empty( $facts['is_care_active'] );
		$checks[]    = array(
			'id'       => 'care',
			'group'    => 'theme',
			'label'    => esc_html__( 'Plugin coexistence', '__plugin_txtd' ),
			'status'   => $care_active ? 'blocked' : 'ok',
			'value'    => $care_active
				? esc_html__( 'Pixelgrade Care is active', '__plugin_txtd' )
				: esc_html__( 'No conflicting Pixelgrade plugins', '__plugin_txtd' ),
			'expected' => esc_html__( 'Pixelgrade Care deactivated', '__plugin_txtd' ),
			'why'      => esc_html__( 'Pixelgrade Care and Pixelgrade Assistant cannot run together. Deactivate Pixelgrade Care so Assistant can power the Pixelgrade Design tools.', '__plugin_txtd' ),
			'action'   => $care_active ? ( isset( $actions['care'] ) ? $actions['care'] : null ) : null,
			'items'    => array(),
		);

		// 3. Recommended plugins.
		$plugins_check = pixassist_build_setup_plugins_check( isset( $facts['plugins'] ) ? $facts['plugins'] : array() );
		if ( isset( $actions['plugins'] ) ) {
			$plugins_check['action'] = $actions['plugins'];
		}
		$checks[] = $plugins_check;

		// 4. Companion plugin version ranges (only when the theme declares them for installed plugins).
		$companions_check = pixassist_build_setup_companions_check( isset( $facts['companions'] ) ? $facts['companions'] : array() );
		if ( null !== $companions_check ) {
			if ( isset( $actions['companions'] ) && 'ok' !== $companions_check['status'] ) {
				$companions_check['action'] = $actions['companions'];
			}
			$checks[] = $companions_check;
		}

		// 5. PHP version.
		$php_version = isset( $facts['php_version'] ) ? (string) $facts['php_version'] : '';
		$php_status  = pixassist_setup_version_status( $php_version, isset( $php_t['minimum'] ) ? $php_t['minimum'] : '', isset( $php_t['recommended'] ) ? $php_t['recommended'] : '' );
		$checks[]    = array(
			'id'       => 'php',
			'group'    => 'environment',
			'label'    => esc_html__( 'PHP version', '__plugin_txtd' ),
			'status'   => $php_status,
			'value'    => '' !== $php_version ? $php_version : esc_html__( 'Unknown', '__plugin_txtd' ),
			'expected' => sprintf( esc_html__( '%s or newer', '__plugin_txtd' ), isset( $php_t['recommended'] ) ? (string) $php_t['recommended'] : '' ),
			'why'      => esc_html__( 'A modern PHP version keeps the editor, Style Manager, and starter imports fast and stable.', '__plugin_txtd' ),
			'action'   => ( 'ok' !== $php_status && isset( $actions['php'] ) ) ? $actions['php'] : null,
			'items'    => array(),
		);

		// 6. WordPress version.
		$wp_version = isset( $facts['wp_version'] ) ? (string) $facts['wp_version'] : '';
		$wp_status  = pixassist_setup_version_status( $wp_version, isset( $wp_t['minimum'] ) ? $wp_t['minimum'] : '', isset( $wp_t['recommended'] ) ? $wp_t['recommended'] : '' );
		$checks[]   = array(
			'id'       => 'wp',
			'group'    => 'environment',
			'label'    => esc_html__( 'WordPress version', '__plugin_txtd' ),
			'status'   => $wp_status,
			'value'    => '' !== $wp_version ? $wp_version : esc_html__( 'Unknown', '__plugin_txtd' ),
			'expected' => sprintf( esc_html__( '%s or newer', '__plugin_txtd' ), isset( $wp_t['recommended'] ) ? (string) $wp_t['recommended'] : '' ),
			'why'      => esc_html__( 'The Site Editor and global styles that Pixelgrade Design uses need a current WordPress version.', '__plugin_txtd' ),
			'action'   => ( 'ok' !== $wp_status && isset( $actions['wp'] ) ) ? $actions['wp'] : null,
			'items'    => array(),
		);

		// 7. Memory limit.
		$memory_bytes  = isset( $facts['memory_limit_bytes'] ) ? (int) $facts['memory_limit_bytes'] : 0;
		$memory_status = pixassist_setup_bytes_status( $memory_bytes, isset( $memory_t['minimum'] ) ? $memory_t['minimum'] : 0, isset( $memory_t['recommended'] ) ? $memory_t['recommended'] : 0 );
		$checks[]      = array(
			'id'       => 'memory',
			'group'    => 'environment',
			'label'    => esc_html__( 'Memory limit', '__plugin_txtd' ),
			'status'   => $memory_status,
			'value'    => '' !== pixassist_setup_format_bytes( $memory_bytes ) ? pixassist_setup_format_bytes( $memory_bytes ) : esc_html__( 'Unknown', '__plugin_txtd' ),
			'expected' => sprintf( esc_html__( '%s or more', '__plugin_txtd' ), pixassist_setup_format_bytes( isset( $memory_t['recommended'] ) ? $memory_t['recommended'] : 0 ) ),
			'why'      => esc_html__( 'Starter-content imports and the block editor can run out of memory on tight limits. More headroom (256 MB+) is ideal for large imports.', '__plugin_txtd' ),
			'action'   => ( 'ok' !== $memory_status && isset( $actions['memory'] ) ) ? $actions['memory'] : null,
			'items'    => array(),
		);

		return $checks;
	}
}

if ( ! function_exists( 'pixassist_classify_setup_overall' ) ) {
	/**
	 * Roll the checks up into the overall status + copy + counts. Pure.
	 *
	 * blocked if any check is blocked; else attention if any is a warning; else ready.
	 *
	 * @param array[] $checks Checks from pixassist_build_setup_checks().
	 *
	 * @return array { status, title, description, counts }.
	 */
	function pixassist_classify_setup_overall( $checks ) {
		$checks = is_array( $checks ) ? $checks : array();

		$counts = array( 'ok' => 0, 'warning' => 0, 'blocked' => 0 );
		foreach ( $checks as $check ) {
			$status = isset( $check['status'] ) ? (string) $check['status'] : 'ok';
			if ( ! isset( $counts[ $status ] ) ) {
				$status = 'ok';
			}
			$counts[ $status ] ++;
		}

		if ( $counts['blocked'] > 0 ) {
			$status      = 'blocked';
			$title       = esc_html__( 'Setup needs attention before you start', '__plugin_txtd' );
			$description = esc_html__( 'Resolve the blockers below to use Pixelgrade Design on this site.', '__plugin_txtd' );
		} elseif ( $counts['warning'] > 0 ) {
			$status      = 'attention';
			$title       = esc_html__( 'A few things need attention', '__plugin_txtd' );
			$description = esc_html__( 'Pixelgrade Design will work, but resolving these gives you the best results.', '__plugin_txtd' );
		} else {
			$status      = 'ready';
			$title       = esc_html__( 'Pixelgrade Design is ready on this site', '__plugin_txtd' );
			$description = esc_html__( 'Everything checks out. You can start designing.', '__plugin_txtd' );
		}

		return array(
			'status'      => $status,
			'title'       => $title,
			'description' => $description,
			'counts'      => $counts,
		);
	}
}

/*
 * ---------------------------------------------------------------------------
 * GUARDED layer — gathers facts from WordPress behind function/feature guards
 * so the payload degrades gracefully outside WordPress (tests) and when a
 * subsystem is unavailable.
 * ---------------------------------------------------------------------------
 */

if ( ! function_exists( 'pixassist_get_setup_readiness_thresholds' ) ) {
	/**
	 * The minimum (blocking) and recommended (warning) thresholds. Filterable so a host/theme can tune
	 * them without code changes.
	 *
	 * @return array
	 */
	function pixassist_get_setup_readiness_thresholds() {
		$mb = 1024 * 1024;

		$defaults = array(
			'php'    => array( 'minimum' => '7.0', 'recommended' => '7.4' ),
			'wp'     => array( 'minimum' => '5.9', 'recommended' => '6.0' ),
			'memory' => array( 'minimum' => 64 * $mb, 'recommended' => 128 * $mb ),
		);

		if ( function_exists( 'apply_filters' ) ) {
			$defaults = apply_filters( 'pixassist_setup_readiness_thresholds', $defaults );
		}

		return is_array( $defaults ) ? $defaults : array();
	}
}

if ( ! function_exists( 'pixassist_get_setup_theme_facts' ) ) {
	/**
	 * Read the active theme facts behind WP guards.
	 *
	 * @return array { name, version, is_pixelgrade (bool), is_block (bool) }
	 */
	function pixassist_get_setup_theme_facts() {
		$name          = '';
		$version       = '';
		$is_pixelgrade = false;
		$is_block      = function_exists( 'wp_is_block_theme' ) ? (bool) wp_is_block_theme() : false;

		if ( class_exists( 'PixelgradeAssistant_Admin' ) ) {
			if ( method_exists( 'PixelgradeAssistant_Admin', 'get_original_theme_name' ) ) {
				$name = (string) PixelgradeAssistant_Admin::get_original_theme_name();
			}

			if ( method_exists( 'PixelgradeAssistant_Admin', 'check_theme_support' ) ) {
				$is_pixelgrade = (bool) PixelgradeAssistant_Admin::check_theme_support();
			}

			// A non-empty WUpdates theme hash id is a strong signal of a genuine Pixelgrade theme.
			if ( ! $is_pixelgrade && method_exists( 'PixelgradeAssistant_Admin', 'get_theme_hash_id' ) ) {
				$hash_id       = PixelgradeAssistant_Admin::get_theme_hash_id( '' );
				$is_pixelgrade = ! empty( $hash_id );
			}
		}

		if ( function_exists( 'wp_get_theme' ) ) {
			$template  = function_exists( 'get_template' ) ? get_template() : '';
			$theme_obj = $template ? wp_get_theme( $template ) : wp_get_theme();

			if ( is_object( $theme_obj ) && method_exists( $theme_obj, 'get' ) ) {
				if ( '' === $name ) {
					$name = (string) $theme_obj->get( 'Name' );
				}
				$version = (string) $theme_obj->get( 'Version' );
			}
		}

		return array(
			'name'          => $name,
			'version'       => $version,
			'is_pixelgrade' => $is_pixelgrade,
			'is_block'      => $is_block,
		);
	}
}

if ( ! function_exists( 'pixassist_get_setup_environment_facts' ) ) {
	/**
	 * Read the local environment facts (PHP / WordPress / database / memory / limits) directly.
	 *
	 * Deliberately computed here rather than through PixelgradeAssistant_DataCollector: the readiness
	 * screen reflects the local environment regardless of the diagnostic data-collection opt-in (which
	 * gates the System Status payload). This keeps the preflight independent of telemetry consent.
	 *
	 * @return array
	 */
	function pixassist_get_setup_environment_facts() {
		$php_version = function_exists( 'phpversion' ) ? (string) phpversion() : '';
		$wp_version  = function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'version' ) : '';

		$db_version = '';
		if ( isset( $GLOBALS['wpdb'] ) && is_object( $GLOBALS['wpdb'] ) && method_exists( $GLOBALS['wpdb'], 'db_version' ) ) {
			$db_version = (string) $GLOBALS['wpdb']->db_version();
		}

		$memory_bytes = 0;
		if ( defined( 'WP_MEMORY_LIMIT' ) && function_exists( 'wp_convert_hr_to_bytes' ) ) {
			$memory_bytes = wp_convert_hr_to_bytes( WP_MEMORY_LIMIT );
		}
		if ( function_exists( 'ini_get' ) && function_exists( 'wp_convert_hr_to_bytes' ) ) {
			$ini_memory   = wp_convert_hr_to_bytes( ini_get( 'memory_limit' ) );
			$memory_bytes = max( $memory_bytes, $ini_memory );
		}

		$max_execution = function_exists( 'ini_get' ) ? (string) ini_get( 'max_execution_time' ) : '';
		$upload_bytes  = function_exists( 'wp_max_upload_size' ) ? (int) wp_max_upload_size() : 0;

		return array(
			'php_version'        => $php_version,
			'wp_version'         => $wp_version,
			'db_version'         => $db_version,
			'memory_limit_bytes' => (int) $memory_bytes,
			'max_execution_time' => $max_execution,
			'upload_max_bytes'   => $upload_bytes,
		);
	}
}

if ( ! function_exists( 'pixassist_parse_setup_supports_header' ) ) {
	/**
	 * Parse a "Pixelgrade Plugin Supports" header into [ identifier => semver_range ]. Mirrors the
	 * private parser in conditional-updates (which we cannot reach) but only for the readiness summary.
	 *
	 * Example: `Nova Blocks (>2.0 <3.0), Style Manager (^2.0)`.
	 *
	 * @param string $raw Raw header value.
	 *
	 * @return array Identifier => range.
	 */
	function pixassist_parse_setup_supports_header( $raw ) {
		$supports = array();
		$raw      = (string) $raw;

		if ( '' === $raw ) {
			return $supports;
		}

		$entries = preg_split( '/,+/', $raw, -1, PREG_SPLIT_NO_EMPTY );
		$entries = is_array( $entries ) ? array_map( 'trim', $entries ) : array();

		foreach ( $entries as $entry ) {
			if ( false === strpos( $entry, '(' ) ) {
				continue;
			}

			preg_match( '#([^\(]+)\(([^\)]+)\)#', $entry, $matches );
			if ( empty( $matches[1] ) || empty( $matches[2] ) ) {
				continue;
			}

			$supports[ trim( $matches[1] ) ] = trim( $matches[2] );
		}

		return $supports;
	}
}

if ( ! function_exists( 'pixassist_get_setup_companion_facts' ) ) {
	/**
	 * Resolve the theme-declared companion version ranges against the installed companion versions.
	 *
	 * Best-effort + fully guarded: returns an empty list when the theme declares no ranges, when the
	 * plugin list is unavailable, or when a companion is not installed. `satisfies` is null when it
	 * cannot be determined (e.g. Composer\Semver absent), which the builder treats as informational.
	 *
	 * @return array[] Each: { label, range, version, installed (bool), satisfies (bool|null) }.
	 */
	function pixassist_get_setup_companion_facts() {
		if ( ! function_exists( 'wp_get_theme' ) ) {
			return array();
		}

		$theme = wp_get_theme();
		if ( ! is_object( $theme ) || ! method_exists( $theme, 'get' ) ) {
			return array();
		}

		$raw_header = $theme->get( 'Pixelgrade Plugin Supports' );
		$ranges     = pixassist_parse_setup_supports_header( $raw_header );

		if ( empty( $ranges ) ) {
			return array();
		}

		$installed = array();
		if ( function_exists( 'get_plugins' ) ) {
			if ( ! function_exists( 'get_plugin_data' ) && defined( 'ABSPATH' ) && file_exists( ABSPATH . 'wp-admin/includes/plugin.php' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}
			$installed = get_plugins();
		}

		$companions = array();
		foreach ( $ranges as $identifier => $range ) {
			$version       = '';
			$is_installed  = false;

			foreach ( (array) $installed as $plugin_data ) {
				$plugin_name = isset( $plugin_data['Name'] ) ? (string) $plugin_data['Name'] : '';
				$text_domain = isset( $plugin_data['TextDomain'] ) ? (string) $plugin_data['TextDomain'] : '';

				if ( 0 === strcasecmp( $plugin_name, $identifier )
					|| 0 === strcasecmp( $text_domain, $identifier )
					|| 0 === strcasecmp( $text_domain, sanitize_title( $identifier ) ) ) {
					$is_installed = true;
					$version      = isset( $plugin_data['Version'] ) ? (string) $plugin_data['Version'] : '';
					break;
				}
			}

			$satisfies = null;
			if ( $is_installed && '' !== $version && class_exists( '\Composer\Semver\Semver' ) ) {
				$satisfies = (bool) \Composer\Semver\Semver::satisfies( $version, $range );
			}

			$companions[] = array(
				'label'     => (string) $identifier,
				'range'     => (string) $range,
				'version'   => $version,
				'installed' => $is_installed,
				'satisfies' => $satisfies,
			);
		}

		return $companions;
	}
}

if ( ! function_exists( 'pixassist_get_setup_readiness_actions' ) ) {
	/**
	 * Resolve the per-check "next action" links behind WP guards.
	 *
	 * @return array Keyed by check id; each { label, url } or absent.
	 */
	function pixassist_get_setup_readiness_actions() {
		$admin = function_exists( 'admin_url' );

		$php_url = function_exists( 'wp_get_update_php_url' )
			? (string) wp_get_update_php_url()
			: 'https://wordpress.org/support/update-php/';

		$actions = array(
			'theme'   => array(
				'label' => esc_html__( 'Choose a theme', '__plugin_txtd' ),
				'url'   => $admin ? admin_url( 'themes.php' ) : 'themes.php',
			),
			'care'    => array(
				'label' => esc_html__( 'Manage plugins', '__plugin_txtd' ),
				'url'   => $admin ? admin_url( 'plugins.php' ) : 'plugins.php',
			),
			'php'     => array(
				'label' => esc_html__( 'How to update PHP', '__plugin_txtd' ),
				'url'   => $php_url,
			),
			'wp'      => array(
				'label' => esc_html__( 'Update WordPress', '__plugin_txtd' ),
				'url'   => $admin ? admin_url( 'update-core.php' ) : 'update-core.php',
			),
			'memory'  => array(
				'label' => esc_html__( 'How to increase memory', '__plugin_txtd' ),
				'url'   => 'https://wordpress.org/documentation/article/editing-wp-config-php/#increasing-memory-allocated-to-php',
			),
			'companions' => array(
				'label' => esc_html__( 'Manage plugins', '__plugin_txtd' ),
				'url'   => $admin ? admin_url( 'plugins.php' ) : 'plugins.php',
			),
		);

		return $actions;
	}
}

if ( ! function_exists( 'pixassist_get_setup_environment_summary' ) ) {
	/**
	 * Build the compact, informational environment summary rows shown when the site is ready (and as
	 * reassurance otherwise). These overlap intentionally with the gating checks: cards explain
	 * problems, the summary states the at-a-glance facts. Full tables stay in System Status.
	 *
	 * @param array $env Environment facts from pixassist_get_setup_environment_facts().
	 *
	 * @return array[] Each: { label, value }.
	 */
	function pixassist_get_setup_environment_summary( $env ) {
		$env = is_array( $env ) ? $env : array();

		$rows = array(
			array(
				'label' => esc_html__( 'PHP', '__plugin_txtd' ),
				'value' => isset( $env['php_version'] ) && '' !== $env['php_version'] ? (string) $env['php_version'] : esc_html__( 'Unknown', '__plugin_txtd' ),
			),
			array(
				'label' => esc_html__( 'WordPress', '__plugin_txtd' ),
				'value' => isset( $env['wp_version'] ) && '' !== $env['wp_version'] ? (string) $env['wp_version'] : esc_html__( 'Unknown', '__plugin_txtd' ),
			),
			array(
				'label' => esc_html__( 'Database', '__plugin_txtd' ),
				'value' => isset( $env['db_version'] ) && '' !== $env['db_version'] ? (string) $env['db_version'] : esc_html__( 'Unknown', '__plugin_txtd' ),
			),
			array(
				'label' => esc_html__( 'Memory limit', '__plugin_txtd' ),
				'value' => '' !== pixassist_setup_format_bytes( isset( $env['memory_limit_bytes'] ) ? $env['memory_limit_bytes'] : 0 )
					? pixassist_setup_format_bytes( $env['memory_limit_bytes'] )
					: esc_html__( 'Unknown', '__plugin_txtd' ),
			),
		);

		if ( ! empty( $env['max_execution_time'] ) ) {
			$rows[] = array(
				'label' => esc_html__( 'Max execution time', '__plugin_txtd' ),
				'value' => sprintf( esc_html__( '%s s', '__plugin_txtd' ), (string) $env['max_execution_time'] ),
			);
		}

		if ( ! empty( $env['upload_max_bytes'] ) ) {
			$rows[] = array(
				'label' => esc_html__( 'Max upload size', '__plugin_txtd' ),
				'value' => pixassist_setup_format_bytes( (int) $env['upload_max_bytes'] ),
			);
		}

		return $rows;
	}
}

if ( ! function_exists( 'pixassist_get_setup_readiness_copy' ) ) {
	/**
	 * UI copy for the readiness summary. Labels live in PHP so the React tab stays presentational.
	 *
	 * @return array
	 */
	function pixassist_get_setup_readiness_copy() {
		return array(
			'issuesTitle'      => esc_html__( 'Needs attention', '__plugin_txtd' ),
			'currentLabel'     => esc_html__( 'Current', '__plugin_txtd' ),
			'expectedLabel'    => esc_html__( 'Recommended', '__plugin_txtd' ),
			'whyLabel'         => esc_html__( 'Why it matters', '__plugin_txtd' ),
			'pluginsTitle'     => esc_html__( 'Recommended plugins', '__plugin_txtd' ),
			'environmentTitle' => esc_html__( 'Site environment', '__plugin_txtd' ),
			'diagnosticsLabel' => esc_html__( 'Open System Status', '__plugin_txtd' ),
			'diagnosticsHint'  => esc_html__( 'Detailed tables, data collection, and the copyable report live in System Status.', '__plugin_txtd' ),
			'blockedBadge'     => esc_html__( 'Blocker', '__plugin_txtd' ),
			'warningBadge'     => esc_html__( 'Heads up', '__plugin_txtd' ),
		);
	}
}

if ( ! function_exists( 'pixassist_get_setup_readiness_links' ) ) {
	/**
	 * Resolve the readiness footer links (full diagnostics destinations).
	 *
	 * @return array { systemStatus, siteHealth }
	 */
	function pixassist_get_setup_readiness_links() {
		$base_url = '';
		if ( function_exists( 'pixassist_get_admin_hub_data' ) ) {
			$hub      = pixassist_get_admin_hub_data();
			$base_url = isset( $hub['baseUrl'] ) ? (string) $hub['baseUrl'] : '';
		}

		return array(
			'systemStatus' => '' !== $base_url ? $base_url . '&tab=system-status' : '',
			'siteHealth'   => function_exists( 'admin_url' ) ? admin_url( 'site-health.php' ) : '',
		);
	}
}

if ( ! function_exists( 'pixassist_get_setup_readiness_facts' ) ) {
	/**
	 * Gather all readiness facts behind guards so the payload degrades gracefully.
	 *
	 * @return array Facts consumed by pixassist_build_setup_checks().
	 */
	function pixassist_get_setup_readiness_facts() {
		$env     = pixassist_get_setup_environment_facts();
		$plugins = array();

		// Use the dedicated list builder, NOT pixassist_get_plugins_data() — the latter assembles this
		// readiness payload, so calling it here would recurse.
		if ( function_exists( 'pixassist_get_recommended_plugins_list' ) ) {
			$plugins = pixassist_get_recommended_plugins_list();
		}

		return array(
			'php_version'        => isset( $env['php_version'] ) ? $env['php_version'] : '',
			'wp_version'         => isset( $env['wp_version'] ) ? $env['wp_version'] : '',
			'memory_limit_bytes' => isset( $env['memory_limit_bytes'] ) ? (int) $env['memory_limit_bytes'] : 0,
			'is_care_active'     => function_exists( 'pixassist_is_care_active' ) ? (bool) pixassist_is_care_active() : false,
			'theme'              => pixassist_get_setup_theme_facts(),
			'plugins'            => $plugins,
			'companions'         => pixassist_get_setup_companion_facts(),
			'thresholds'         => pixassist_get_setup_readiness_thresholds(),
			'actions'            => pixassist_get_setup_readiness_actions(),
		);
	}
}

if ( ! function_exists( 'pixassist_get_setup_readiness_data' ) ) {
	/**
	 * Assemble the readiness payload the Setup tab renders. Wired into pixassist_get_plugins_data()
	 * under the `readiness` key and localized as part of `window.pixelgradePlugins`.
	 *
	 * @return array { overall, checks, environment, copy, links }
	 */
	function pixassist_get_setup_readiness_data() {
		$facts  = pixassist_get_setup_readiness_facts();
		$checks = pixassist_build_setup_checks( $facts );
		$env    = pixassist_get_setup_environment_facts();

		return array(
			'overall'     => pixassist_classify_setup_overall( $checks ),
			'checks'      => $checks,
			'environment' => pixassist_get_setup_environment_summary( $env ),
			'copy'        => pixassist_get_setup_readiness_copy(),
			'links'       => pixassist_get_setup_readiness_links(),
		);
	}
}
