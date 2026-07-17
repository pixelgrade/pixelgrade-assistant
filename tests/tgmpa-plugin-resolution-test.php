<?php
/**
 * Pins canonical plugin paths ahead of renamed backup copies in TGMPA discovery.
 *
 * Standalone: run with `php tests/tgmpa-plugin-resolution-test.php` (no WordPress needed).
 *
 * @package PixelgradeAssistant
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['paf_installed_plugins'] = array();

function did_action( $hook_name ) {
	return 0;
}

function add_action( $hook_name, $callback, $priority = 10, $accepted_args = 1 ) {
	return true;
}

function get_plugins( $plugin_folder = '' ) {
	return $GLOBALS['paf_installed_plugins'];
}

class WP_List_Table {
}

require_once __DIR__ . '/../admin/required-plugins/class-tgm-plugin-activation.php';

class PAF_TGMPA_Plugin_Resolver_Test extends TGM_Plugin_Activation {
	public function resolve_plugin_basename( $slug ) {
		return $this->_get_plugin_basename_from_slug( $slug );
	}
}

function assert_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		fwrite(
			STDERR,
			$message . "\nExpected: " . var_export( $expected, true ) . "\nActual: " . var_export( $actual, true ) . "\n"
		);
		exit( 1 );
	}
}

$reflection = new ReflectionClass( PAF_TGMPA_Plugin_Resolver_Test::class );
$resolver   = $reflection->newInstanceWithoutConstructor();

$GLOBALS['paf_installed_plugins'] = array(
	'nova-blocks.backup-before-patch/nova-blocks.php' => array( 'Name' => 'Nova Blocks backup' ),
	'nova-blocks.replaced/nova-blocks.php'            => array( 'Name' => 'Nova Blocks replaced' ),
	'nova-blocks/nova-blocks.php'                     => array( 'Name' => 'Nova Blocks' ),
);

assert_same(
	'nova-blocks/nova-blocks.php',
	$resolver->resolve_plugin_basename( 'nova-blocks' ),
	'TGMPA must prefer the canonical plugin directory even when a renamed backup is discovered first.'
);

$GLOBALS['paf_installed_plugins'] = array(
	'custom-nova-directory/nova-blocks.php' => array( 'Name' => 'Nova Blocks' ),
);

assert_same(
	'custom-nova-directory/nova-blocks.php',
	$resolver->resolve_plugin_basename( 'nova-blocks' ),
	'TGMPA must preserve the Pixelgrade fallback for a genuinely renamed plugin directory.'
);

echo "TGMPA plugin resolution contract passed.\n";
