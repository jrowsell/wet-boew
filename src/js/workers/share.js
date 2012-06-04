/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Share widget plugin
 */
/*global jQuery: false, pe:false, wet_boew_share:false, data:false */
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.share = {
		type : 'plugin',
		depends : ['metadata', 'bookmark'],
		_exec : function (elm) {
			var opts, overrides, $popup, $popupText, target, leftoffset, navbykey;

			// Defaults
			opts = {
				url: '', // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '', // The title to bookmark, leave blank for the current one
				description: '', // A longer description of the site
				sites: [], // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: false, // True if a compact presentation should be used, false for full
				hint: pe.dic.get('%share-text') + pe.dic.get('%share-hint'), // Popup hint for links, {s} is replaced by display name
				popup: true, // True to have it popup on demand, false to show always
				popupText: pe.dic.get('%share-text'), // Text for the popup trigger
				hideText: (pe.dic.get('%hide') + " - "), // Text to prepend to the popup trigger when popup is open
				addFavorite: false,  // True to add a 'add to favourites' link, false for none
				favoriteText: pe.dic.get('%favourite'),  // Display name for the favourites link
				addEmail: false, // True to add a 'e-mail a friend' link, false for none
				emailText: pe.dic.get('%email'), // Display name for the e-mail link
				emailSubject: pe.dic.get('%share-email-subject'), // The subject for the e-mail
				emailBody: pe.dic.get('%share-email-body'), // The body of the e-mail,
					// use '{t}' for the position of the page title, '{u}' for the page URL,
					// '{d}' for the description, and '\n' for new lines
				manualBookmark: pe.dic.get('%share-manual'), // Instructions for manually bookmarking the page
				addShowAll: false, // True to show listed sites first, then all on demand
				showAllText: pe.dic.get('%share-showall'), // Display name for show all link, use '{n}' for the number of sites
				showAllTitle: pe.dic.get('%share-showall-title'), // Title for show all popup
				addAnalytics: false, // True to include Google Analytics for links
				analyticsName: '/share/{r}/{s}' // The "URL" that is passed to the Google Analytics,
					// use '{s}' for the site code, '{n}' for the site name,
					// '{u}' for the current full URL, '{r}' for the current relative URL,
					// or '{t}' for the current title
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				compact: elm.hasClass("compact") ? true : undefined,
				popup: elm.hasClass("popup-none") ? false : undefined,
				addFavorite: elm.hasClass("favourite") ? true : undefined,
				addEmail: elm.hasClass("email") ? true : undefined,
				addShowAll: elm.hasClass("showall") ? true : undefined,
				addAnalytics: elm.hasClass('analytics') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_share), class-based overrides and the data attribute
			$.metadata.setType("attr", "data");
			if (typeof wet_boew_share !== 'undefined' && wet_boew_share !== null) {
				$.extend(opts, wet_boew_share, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			navbykey = function (e, links) {
				var keychar = String.fromCharCode(e.keyCode).toLowerCase(), elmtext = $(e.target).text(), matches, match;
				matches = links.find('li a').filter(function (index) {
					return ($(this).text().substring(1, 2).toLowerCase() === keychar || $(this).text() === elmtext);
				});
				if (matches.length > 0) {
					if ($(e.target).hasClass('bookmark_popup_text')) {
						pe.focus(matches.eq(0));
					} else {
						matches.each(function (index) {
							if ($(this).text() === elmtext) {
								match = index;
								return false;
							}
						});
						if (match < (matches.length - 1)) {
							pe.focus(matches.eq(match + 1));
							return false;
						}
						pe.focus(matches.eq(0));
					}
				}
				return false;
			};

			elm.bookmark(opts);
			if (opts.popup && pe.cssenabled) {
				elm.attr('role', 'application');
				$popup = elm.find('.bookmark_popup').attr('id', 'bookmark_popup').attr('aria-hidden', 'true').attr('role', 'menu').prepend('<p class="popup_title">' + opts.popupText + '</p>');
				$popup.find('li').attr('role', 'presentation').find('a').attr('role', 'menuitem').attr('tabindex', '-1');
				$popupText = elm.find('.bookmark_popup_text').off('click');
				$popupText.attr('role', 'button').attr('aria-controls', 'bookmark_popup').attr('aria-pressed', 'false').on("click keydown", function (e) {
					if (e.type === "keydown" && (!(e.ctrlKey || e.altKey || e.metaKey))) {
						if ($(e.target).attr('aria-pressed') === 'false') {
							switch (e.keyCode) {
							case 13: // enter key
								$popup.trigger("open");
								return false;
							case 32: // spacebar
								$popup.trigger("open");
								return false;
							case 38: // up arrow
								$popup.trigger("open");
								return false;
							case 40: // down arrow
								$popup.trigger("open");
								return false;
							}
						} else {
							switch (e.keyCode) {
							case 9: // tab key
								if (e.shiftKey) {
									$popup.trigger("close");
									return false;
								}
								break;
							case 13: // enter key
								$popup.trigger("close");
								return false;
							case 27: // escape key
								$popup.trigger("close");
								return false;
							case 32: // spacebar
								$popup.trigger("close");
								return false;
							default:
								// 0 - 9 and a - z keys
								if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
									return navbykey(e, $popup);
								}
							}
						}
					} else if (e.type === "click") {
						if ($(e.target).attr('aria-pressed') === 'false') {
							$popup.trigger("open");
						} else {
							$popup.trigger("close");
						}
						return false;
					}
				});
				$popup.on("keydown open close", function (e) {
					if (e.type === "keydown") {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							switch (e.keyCode) {
							case 9: // tab key
								$popup.trigger("close");
								return false;
							case 27: // escape key
								$popup.trigger("close");
								return false;
							case 37: // left arrow
								target = $(e.target).closest('li').prev().find('a');
								if (target.length === 0) {
									target = $popup.find('li a');
								}
								pe.focus(target.last());
								return false;
							case 38: // up arrow
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').prevAll().find('a').filter(function (index) {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $(e.target).closest('li').prev().find('a');
									if (target.length > 0) {
										leftoffset = target.offset().left;
										target = target.closest('li').nextAll().find('a').filter(function (index) {
											return ($(this).offset().left === leftoffset);
										});
										if (target.length > 0) {
											pe.focus(target.last());
											return false;
										}
									}
									pe.focus($popup.find('li a').last());
								}
								return false;
							case 39: // right arrow
								target = $(e.target).closest('li').next().find('a');
								if (target.length === 0) {
									target = $popup.find('li a');
								}
								pe.focus(target.first());
								return false;
							case 40: // down arrow
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').nextAll().find('a').filter(function (index) {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $(e.target).closest('li').next().find('a');
									if (target.length > 0) {
										leftoffset = target.offset().left;
										target = target.closest('li').prevAll().find('a').filter(function (index) {
											return ($(this).offset().left === leftoffset);
										});
										if (target.length > 0) {
											pe.focus(target.last());
											return false;
										}
									}
									pe.focus($popup.find('li a').first());
								}
								return false;
							default:
								// 0 - 9 and a - z keys
								if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
									return navbykey(e, $popup);
								}
							}
						}
					} else if (e.type === "open") {
						$popupText.text(opts.hideText + opts.popupText).attr('aria-pressed', 'true');
						pe.focus($popup.show().attr('aria-hidden', 'false').find('li a').first());
					} else if (e.type === "close") {
						pe.focus($popupText.text(opts.popupText).attr('aria-pressed', 'false').first());
						$popup.hide().attr('aria-hidden', 'true');
					}
				});
				$(document).on("click", function (e) {
					if ($popup.attr('aria-hidden') === 'false') {
						$popup.trigger("close");
					}
				});
			} else {
				elm.addClass('popup-none');
			}
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));