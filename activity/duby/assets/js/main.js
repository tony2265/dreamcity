/*
	Landscape by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/

(function($) {

	"use strict";

	var	$window = $(window),
		$body = $('body'),
		settings = {
			parallax: true,
			speed: 1250
		};

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Forms.
		var $form = $('form');

		// Events.
			$('input,textarea,select').on('keydown', function(event) {
				event.stopPropagation();
			});

		// Fix: Placeholder polyfill.
			$form.placeholder();

	// Touch?
		if (browser.mobile)
			$body.addClass('is-touch');

	// Main.
		(function() {

			var	$nav = $('#nav'),
				$navItems = $nav.find('> ul > li'),
				$main = $('#main'),
				$reel = $main.children('.reel'),
				$slides = $reel.children('.slide'),
				$controls = $('<nav><span class="previous"></span><span class="next"></span></nav>').appendTo($main),
				$next = $controls.children('.next'),
				$previous = $controls.children('.previous'),
				pos = 0,
				locked = false;

			// Switch function.
				var switchTo = function(newPos, instant) {

					var $slide, $navItem, left;

					// Out of bounds? Bail.
						if (newPos < 0
						||	newPos >= $slides.length)
							return;

					// Deal with lock.
						if (instant !== true) {

							if (locked)
								return;

							locked = true;

						}

					// Update position.
						pos = newPos;
						left = $slides.width() * pos;

					// Update nav.

						// Clear active state.
							$navItems
								.removeClass('active');

						// Get new item and activate it.
							$navItem = $navItems.eq(pos);

							$navItem
								.addClass('active');

					// Update slides.

						// Clear active state.
							$slides
								.removeClass('active');

						// Get new slide and activate it.
							$slide = $slides.eq(pos);

							$slide
								.addClass('active');

					// Update hash.
						history.replaceState(null, null, (pos == 0 ? '#' : '#' + $slide.attr('id')));

					// Update controls.

						// Previous.
							if (pos == 0)
								$previous.addClass('disabled');
							else
								$previous.removeClass('disabled');

						// Next.
							if (pos == $slides.length - 1)
								$next.addClass('disabled');
							else
								$next.removeClass('disabled');

					// Not instant? Animate to new scroll position.
						if (instant !== true) {

							$main.animate({
								scrollLeft: left
							}, settings.speed, 'swing', function() {
								locked = false;
							});

						}

					// Otherwise, jump straight to new scroll position.
						else
							$main.scrollLeft(left);

				};

			// Reel.
				$reel
					.css('width', (100 * $slides.length) + 'vw');

			// Slides.
				$slides.each(function() {

					var $this = $(this),
						$img = $this.children('img'),
						id = $this.attr('id'),
						position = $img.data('position'),
						bg = {
							image: $this.css('background-image'),
							size: $this.css('background-size'),
							position: $this.css('background-position'),
							repeat: $this.css('background-repeat'),
							attachment: $this.css('background-attachment')
						},
						x;

					// Set index.
						$this
							.data('index', $this.index())
							.attr('data-index', $this.index());

					// Image.

						// Assign image.
							$this
								.css('background-image', (bg.image ? bg.image + ',' : '') + 'url("' + $img.attr('src') + '")')
								.css('background-size', (bg.size ? bg.size + ',' : '') + 'cover')
								.css('background-position', (bg.position ? bg.position + ',' : '') + '0% 50%')
								.css('background-repeat', (bg.repeat ? bg.repeat + ',' : '') + 'no-repeat')
								.css('background-attachment', (bg.attachment ? bg.attachment + ',' : '') + 'fixed');

						// Hack: IE workaround because it's a crappy browser.
							if (browser.name == 'ie') {

								x = $this.css('background-image');

								$this.css('background-image', x.replace($img.attr('src'), 'invalid'));

								window.setTimeout(function() {
									$this.css('background-image', x);
								}, 100);

							}

						// Hide <img>.
							$img.hide();

					// Links.
						$body.on('click', 'a[href="#' + id + '"]', function(event) {

							event.preventDefault();
							event.stopPropagation();

							switchTo($this.index());

						});

					// Parallax.
						if (settings.parallax)
							$main.on('scroll', function() {

								if (breakpoints.active('<=large')
								||	browser.mobile
								||	!browser.canUse('transition')
								||	$window.prop('orientation') == 0 || $window.prop('orientation') == 180
								||	$window.width() < $window.height()) {

									if (position)
										$this.css('background-position', (bg.position ? bg.position + ',' : '') + position);
									else
										$this.css('background-position', (bg.position ? bg.position + ',' : '') + '0% 50%');

								}
								else {

									var l = $this.width() * $this.index(),
										sl = $main.scrollLeft(),
										w = $this.width(),
										p = ( (sl - l) / w );

									$this.css('background-position', (bg.position ? bg.position + ',' : '') + (p * 100) + '% 50%');

								}

							});

				});

			// Controls.
				$next
					.on('touchmove', function(event) {
						event.stopPropagation();
						event.preventDefault();
					})
					.on('click', function(event) {
						switchTo(pos + 1);
					});

				$previous
					.on('touchmove', function(event) {
						event.stopPropagation();
						event.preventDefault();
					})
					.on('click', function(event) {
						switchTo(pos - 1);
					});

			// Window.
				$window
					.on('keydown', function(event) {

						var newPos = null;

						switch (event.keyCode) {

							// Home.
								case 36:
									newPos = 0;
									break;

							// End.
								case 35:
									newPos = $slides.length - 1;
									break;

							// Left.
								case 37:
									newPos = pos - 1;
									break;

							// Space, Right.
								case 32:
								case 39:
									newPos = pos + 1;
									break;

						}

						if (newPos !== null) {

							event.stopPropagation();
							event.preventDefault();

							switchTo(newPos);

						}

					})
					.on('resize orientationchange', function() {
						setTimeout(function() {

							// Switch.
								switchTo(pos, true);

						}, 0);
					})
					.on('load', function() {
						setTimeout(function() {

							var h, $slide;

							// Trigger resize.
								$window.triggerHandler('resize');

							// Get initial slide.
								h = location.hash;

								if (h
								&&	($slide = $slides.filter('[id="' + h.substr(1) + '"]')).length > 0)
									pos = $slide.data('index');

							// Switch.
								switchTo(pos, true);

						}, 0);
					});

				// Parallax.
					if (settings.parallax)
						$window.on('resize', function() {
							$main.triggerHandler('scroll');
						});

		})();

})(jQuery);