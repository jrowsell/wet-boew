/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * GC Web Usability theme scripting
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var wet_boew_theme, _wet_boew_theme;
	/**
	* wet_boew_theme object
	* @namespace wet_boew_theme
	* @version 3.0
	*/
	wet_boew_theme = (typeof window.wet_boew_theme !== "undefined" && window.wet_boew_theme !== null) ? window.wet_boew_theme : {
		fn: {}
	};
	_wet_boew_theme = {
		theme: 'theme-gcwu-fegc',
		psnb: $('#wb-head #gcwu-psnb'),
		search: $('#wb-head #gcwu-srchbx'),
		bcrumb: $('#wb-head #gcwu-bc'),
		title: $('#wb-head #gcwu-title'),
		sft: $('#wb-foot #gcwu-sft'),
		gcft: $('#wb-foot #gcwu-gcft'),
		wmms: $('#gcwu-wmms'),
		init: function () {
			var current = pe.menu.navcurrent(pe.menubar, wet_boew_theme.bcrumb),
				submenu = current.parents('div.mb-sm');
			// If the link with class="nav-current" is in the submenu, then move the class up to the associated menu bar link
			if (submenu.length > 0) {
				submenu.prev().children('a').addClass('nav-current');
			}
			pe.theme = wet_boew_theme.theme;
			$('html').addClass(wet_boew_theme.theme);
			if (pe.secnav.length > 0) {
				pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
			}

			// If no search is provided, then make the site menu link 100% wide
			if (wet_boew_theme.psnb.length > 0 && wet_boew_theme.search.length === 0) {
				wet_boew_theme.psnb.css('width', '100%');
			}
		},
		themename: function () {
			return wet_boew_theme.theme;
		},
		mobileview: function () {
			var mb_dialogue, mb_header, nav, s_dialogue, _list, links, footer1, ul, lang_links, lang_nav, mb_li;
			if (pe.menubar.length > 0) {
				// @TODO: optimize the dom manipulation routines - there is alot of DOM additions that should be keep as a document frag and replaced with .innerHTML as the end. // jsperf - 342% increase
				// lets transform the menu to a dialog box
				mb_li = pe.menubar.find('ul.mb-menu li');
				mb_dialogue = '<div data-role="page" id="jqm-wb-mb"><div data-role="header">';
				mb_header = wet_boew_theme.psnb.children(':header');
				mb_dialogue += "<h1>" + mb_header.html() + '</h1></div>';
				mb_dialogue += '<div data-role="content" data-inset="true"><nav role="navigation">';

				if (wet_boew_theme.bcrumb.length > 0) {
					mb_dialogue += '<section><div id="jqm-mb-location-text">' + wet_boew_theme.bcrumb.html() + '</div></section>';
					wet_boew_theme.bcrumb.remove();
				} else {
					mb_dialogue += '<div id="jqm-mb-location-text"></div>';
				}

				if (pe.secnav.length > 0) {
					nav = pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, "c");
					pe.menu.expandmobile(nav);
					mb_dialogue += $('<section><h2>' + pe.secnav.find('h2').eq(0).html() + '</h2></section>').append(nav).html();
					pe.secnav.remove();
				}

				nav = pe.menu.buildmobile(mb_li, 3, "a", true);
				pe.menu.expandmobile(nav);
				mb_dialogue += $('<section><h2>' + mb_header.html() + '</h2></section>').append(nav).html();
				mb_dialogue += '</nav></div></div></div>';
				pe.pagecontainer().append(mb_dialogue);
				mb_header.wrapInner('<a href="#jqm-wb-mb" data-rel="dialog"></a>');
				_list = $('<ul></ul>').hide().append('<li><a data-rel="dialog" data-theme="b"  data-icon="grid" href="' + mb_header.find('a').attr('href') + '">' + mb_header.find('a').text() + "</a></li>");

				if (wet_boew_theme.search.length > 0) {
					// :: Search box transform lets transform the search box to a dialog box
					s_dialogue = $('<div data-role="page" id="jqm-wb-search"></div>');
					s_dialogue.append($('<div data-role="header"><h1>' + wet_boew_theme.search.find(':header').text() + '</h1></div>')).append($('<div data-role="content"></div>').append(wet_boew_theme.search.find('form').clone()));
					pe.pagecontainer().append(s_dialogue);
					wet_boew_theme.search.find(':header').wrapInner('<a href="#jqm-wb-search" data-rel="dialog"></a>');
					_list.append('<li><a data-rel="dialog" data-theme="b" data-icon="search" href="' + wet_boew_theme.search.find(':header a').attr('href') + '">' + wet_boew_theme.search.find(':header a').text() + "</a></li>");
				}

				wet_boew_theme.title.after($('<div data-role="navbar" data-iconpos="right"></div>').append(_list));
			}

			lang_links = $('body #gcwu-lang');
			if (lang_links.length > 0) {
				links = lang_links.find('a').attr("data-theme", "a");
				lang_nav = $('<div data-role="navbar"><ul></ul></div>');
				ul = lang_nav.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				lang_links.find('#gcwu-ef-lang').replaceWith(lang_nav.children().end());
				lang_links.find('#gcwu-other-lang').remove();
			}

			if (wet_boew_theme.sft.length > 0) {
				// transform the footer into mobile nav bar
				links = wet_boew_theme.sft.find('#gcwu-sft-in #gcwu-tctr a, #gcwu-sft-in .gcwu-col-head a').attr("data-theme", "b");
				footer1 = $('<div data-role="navbar"><ul></ul></div>');
				ul = footer1.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				wet_boew_theme.sft.children('#gcwu-sft-in').replaceWith(footer1.children().end());
				wet_boew_theme.gcft.parent().remove();
			} else if (pe.footer.find('#gcwu-tc').length > 0) {
				// transform the footer into mobile nav bar
				links = pe.footer.find('#gcwu-tc a').attr("data-theme", "b");
				footer1 = $('<div data-role="navbar"><ul></ul></div>');
				ul = footer1.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				pe.footer.find('#gcwu-tc').replaceWith(footer1.children().end());
			}
			pe.footer.find('footer').append(wet_boew_theme.wmms.detach());

			// jquery mobile has loaded
			$(document).on("mobileinit", function () {
				if (pe.menubar.length > 0) {
					wet_boew_theme.psnb.parent().remove();
					if (wet_boew_theme.search.length > 0) {
						wet_boew_theme.search.parent().remove();
					}
					_list.show();
				}
			});
			// preprocessing before mobile page is enhanced
			$(document).on("pageinit", function () {
				// Correct the corners for each of the site menu/secondary menu sections and sub-sections
				pe.menu.correctmobile($('#jqm-wb-mb'));
			});
			return;
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));