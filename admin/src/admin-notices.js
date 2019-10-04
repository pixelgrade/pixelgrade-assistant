(function ($) {
	$(document).ready(function () {
		var $noticesContainer = $( '.pixassist-notice' );

		var $ratingContainer = $( '.pixassist-notice.rating-notice' );
		if ( $ratingContainer.length ) {
			var $initialStep = $ratingContainer.find('.initial-step'),
				$enjoyedStep = $ratingContainer.find('.yes-step'),
				$notEnjoyedStep = $ratingContainer.find('.no-step'),
				$ratingThankYouStep = $ratingContainer.find('.rating-thankyou-step'),
				$feedbackThankYouStep = $ratingContainer.find('.feedback-thankyou-step'),
				$maybeLaterThankYouStep = $ratingContainer.find('.maybelater-thankyou-step');

			$ratingContainer.find('.js-pixassist-enjoyed-handle').on('click', function (event) {
				event.preventDefault();

				$initialStep.hide();
				$enjoyedStep.show();
			})

			$ratingContainer.find('.js-pixassist-awardrating-handle').on('click', function (event) {
				// No prevent default since we want the new tab to open.

				$initialStep.hide(); // just to be safe
				$enjoyedStep.hide();
				$ratingThankYouStep.show();
			})

			$ratingContainer.find('.js-pixassist-maybelater-handle').on('click', function (event) {
				event.preventDefault();

				$initialStep.hide(); // just to be safe
				$enjoyedStep.hide();
				$maybeLaterThankYouStep.show();
			})

			$ratingContainer.find('.js-pixassist-notenjoyed-handle').on('click', function (event) {
				event.preventDefault();

				$initialStep.hide();
				$notEnjoyedStep.show();
				$ratingContainer.find( 'textarea.feedback-message').autogrow().focus();
			})

			$ratingContainer.find('.js-pixassist-submitfeedback-handle').on('click', function (event) {
				event.preventDefault();

				if ( ! $ratingContainer.find( 'textarea.feedback-message').val() ) {
					$ratingContainer.find( '.feedback-message-wrapper').addClass('shake animated');
					setTimeout( function() {
						$ratingContainer.find( '.feedback-message-wrapper').removeClass('shake animated');
					}, 1000);
					return;
				}

				var $target = $(event.target);

				// Make the button show a loading icon
				$target.addClass('updating-message');

				let license = {
					hash: '',
				};
				if ( typeof pixassist.themeMod.licenseHash != "undefined" && pixassist.themeMod.licenseHash.length > 0) {
					license.hash = pixassist.themeMod.licenseHash;
				}

				// Send the feedback
				if ( typeof window.pixassistHelpers !== "undefined" ) {
					let params = {
						subject: pixassistNotices.feedbackTicketSubject,
						topic: 'The feedback you asked through the admin notification.',
						details: $ratingContainer.find( 'textarea.feedback-message').val(),
						license_hash: license.hash,
						tag: 'feedback',
						site_url: pixassistNotices.installurl,
						user_id: parseInt(pixassist.user.pixassist_user_ID),
						theme_slug: pixassist.themeSupports.original_slug,
						hash_id: pixassist.themeSupports.theme_id,
						theme_type: pixassist.themeSupports.theme_type
					};

					window.pixassistHelpers.restOauth1Request(
						pixassist.apiEndpoints.pxm.createTicket.method,
						pixassist.apiEndpoints.pxm.createTicket.url,
						params,
						function (response) {
							if ( response.code !== 'success') {
								console.log(response);
							}

							$initialStep.hide(); // just to be safe
							$notEnjoyedStep.hide();
							$feedbackThankYouStep.show();

							return response;
						},function(error) {
							console.log(error)
						}, function(response) {
							// HTTP error status check part of the restRequest promise chain
							// Get the first digit of the status
							let status = (!_.isUndefined(response.status)) ? parseInt(response.status.toString()[0]) : parseInt(response.code.toString()[0]);
							// If the status is not in the 2xx form - throw exception
							if (status !== 2) {
								console.log(response);
							}

							return response;
						}
					);
				} else {
					$initialStep.hide(); // just to be safe
					$notEnjoyedStep.hide();
					$feedbackThankYouStep.show();
				}
			})

			$ratingContainer.find('.js-pixassist-notnow-handle').on('click', function (event) {
				event.preventDefault();

				$initialStep.hide(); // just to be safe
				$notEnjoyedStep.hide();
				$maybeLaterThankYouStep.show();
			})
		}

		// Send ajax on click of dismiss icon or button
		$noticesContainer.on( 'click', '.button.dismiss, .notice-dismiss', function( event ) {
			event.preventDefault();

			ajaxDismiss(event);
		});

		// Send ajax
		function ajaxDismiss(event) {
			var $target = $(event.target),
				$targetContainer = $(event.target).closest('.pixassist-notice');

			$target.addClass('updating-message');
			$.ajax({
				url: pixassistNotices.ajaxurl,
				type: 'post',
				data: {
					action: $targetContainer.find('[name="pixassist-notice-dismiss-action"]').val(),
					nonce_dismiss: $targetContainer.find('[name="nonce_dismiss"]').val()
				}
			})
			.always( function() {
				$targetContainer.slideUp();
			})
		}
	});


	/**
	 * Auto-growing textareas; technique ripped from Facebook
	 *
	 *
	 * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
	 */
	$.fn.autogrow = function(options)
	{
		return this.filter('textarea').each(function()
		{
			var self         = this;
			var $self        = $(self);
			var minHeight    = $self.height();
			var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;
			var settings = $.extend({
				preGrowCallback: null,
				postGrowCallback: null
			}, options );

			var shadow = $('<div></div>').css({
				position:    'absolute',
				top:         -10000,
				left:        -10000,
				width:       $self.width(),
				fontSize:    $self.css('fontSize'),
				fontFamily:  $self.css('fontFamily'),
				fontWeight:  $self.css('fontWeight'),
				lineHeight:  $self.css('lineHeight'),
				resize:      'none',
				'word-wrap': 'break-word'
			}).appendTo(document.body);

			var update = function(event)
			{
				var times = function(string, number)
				{
					for (var i=0, r=''; i<number; i++) r += string;
					return r;
				};

				var val = self.value.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\n$/, '<br/>&#xa0;')
					.replace(/\n/g, '<br/>')
					.replace(/ {2,}/g, function(space){ return times('&#xa0;', space.length - 1) + ' ' });

				// Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
				if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
					val += '<br />';
				}

				shadow.css('width', $self.width());
				shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.

				var newHeight=Math.max(shadow.height() + noFlickerPad, minHeight);
				if(settings.preGrowCallback!=null){
					newHeight=settings.preGrowCallback($self,shadow,newHeight,minHeight);
				}

				$self.height(newHeight);

				if(settings.postGrowCallback!=null){
					settings.postGrowCallback($self);
				}
			}

			$self.change(update).keyup(update).keydown({event:'keydown'},update);
			$(window).resize(update);

			update();
		});
	};
})(jQuery);
