/**
 * Wires the "Avatar Image" media picker on the user profile screen (#77).
 *
 * Plain vanilla admin script (no build step): copied as-is from admin/src to admin/js by the
 * gulp `copy_other_scripts` task, same as admin-notices.js.
 */
/* global wp, jQuery, pixassistLocalAvatar */
( function ( $ ) {
	'use strict';

	function ready() {
		var $root = $( '.pixassist-local-avatar' );

		if ( ! $root.length || typeof wp === 'undefined' || ! wp.media ) {
			return;
		}

		var $hiddenInput = $root.find( '#pixassist-local-avatar-id' );
		var $preview = $root.find( '#pixassist-local-avatar-preview' );
		var $selectButton = $root.find( '#pixassist-local-avatar-button' );
		var $removeButton = $root.find( '#pixassist-local-avatar-remove' );
		var frame;

		function setSelection( attachmentId, url ) {
			$hiddenInput.val( attachmentId || 0 );

			if ( url ) {
				$preview.attr( 'src', url ).show();
				$removeButton.show();
			} else {
				$preview.hide().attr( 'src', '' );
				$removeButton.hide();
			}
		}

		$selectButton.on( 'click', function ( event ) {
			event.preventDefault();

			if ( frame ) {
				frame.open();
				return;
			}

			var options = ( typeof pixassistLocalAvatar !== 'undefined' ) ? pixassistLocalAvatar : {};

			frame = wp.media( {
				title: options.title || 'Select Avatar Image',
				button: { text: options.button || 'Use this image' },
				library: { type: 'image' },
				multiple: false
			} );

			frame.on( 'select', function () {
				var attachment = frame.state().get( 'selection' ).first().toJSON();
				var url = ( attachment.sizes && attachment.sizes.thumbnail )
					? attachment.sizes.thumbnail.url
					: attachment.url;

				setSelection( attachment.id, url );
			} );

			frame.open();
		} );

		$removeButton.on( 'click', function ( event ) {
			event.preventDefault();
			setSelection( 0, '' );
		} );
	}

	$( ready );
} )( jQuery );
