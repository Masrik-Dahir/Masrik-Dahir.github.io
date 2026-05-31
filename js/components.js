/**
 * components.js - Shared navigation and footer for all pages.
 *
 * Usage:
 *   1. Add <script src="js/components.js" defer></script> in <head>
 *      (or "../js/components.js" for subdirectory pages)
 *   2. Place <div id="nav-placeholder"></div> where the nav should appear
 *   3. Place <div id="footer-placeholder"></div> where the footer should appear
 *
 * The active page is detected from window.location.pathname and highlighted in red.
 */
(function () {
    // ── Mobile menu button styles — copies the work.html .btn1/.btn2
    // collapse/extend pattern exactly, minus the hover lift transform.
    // Rest: frosted white pane + continuously rotating conic-rainbow
    // border. Hover: small-hex shimmer fades in across the surface
    // and the rotating border is replaced by a clean solid indigo.
    // No transform on any state so the button NEVER moves or resizes.
    (function injectMobileMenuStyles() {
        if (document.getElementById('mobile-menu-btn-styles')) return;
        var s = document.createElement('style');
        s.id = 'mobile-menu-btn-styles';
        // SVG hex-outline mask — exactly the one used by work.html's
        // .btn1/.btn2 ::before. fill="none" + stroke="black" means the
        // mask only keeps the hex OUTLINE shape; interior is transparent.
        var hexMask = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 32'><polygon points='14,1.5 26,8 26,24 14,30.5 2,24 2,8' fill='none' stroke='%23000' stroke-width='3.5'/></svg>\")";
        s.textContent =
            // Property registrations + keyframes copied from work.html
            // .btn1/.btn2 (collapse / extend buttons). Same hex shimmer,
            // same rotating conic-rainbow border, same hue-cycle animation.
            '@property --mmb-edge-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }' +
            '@keyframes mmb-edge-spin     { to { --mmb-edge-angle: 360deg; } }' +
            '@keyframes mmb-hex-sweep     { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }' +
            '@keyframes mmb-hex-hue-cycle {' +
            '  from { filter: saturate(1.25) brightness(1.05) hue-rotate(0deg); }' +
            '  to   { filter: saturate(1.25) brightness(1.05) hue-rotate(360deg); }' +
            '}' +
            // ── Rest state — frosted white pane + rotating conic-
            // rainbow border. Identical to work.html .btn1/.btn2 rest.
            // Adapted dims (pill, taller, MENU-friendly padding).
            // Geometry is identical across rest / focus / focus-visible
            // / active so the button CANNOT change shape on press.
            '.mobile-menu-btn,' +
            '.mobile-menu-btn:focus,' +
            '.mobile-menu-btn:focus-visible,' +
            '.mobile-menu-btn:active,' +
            'body.polish .mobile-menu-btn,' +
            'body.polish .mobile-menu-btn:focus,' +
            'body.polish .mobile-menu-btn:focus-visible,' +
            'body.polish .mobile-menu-btn:active' +
            ' {' +
            '  all: unset;' +
            '  box-sizing: border-box;' +
            '  display: inline-flex;' +
            '  align-items: center;' +
            '  justify-content: center;' +
            '  gap: 10px;' +
            '  float: right;' +
            '  margin: 10px 12px 0 0;' +
            '  padding: 0 18px;' +
            '  height: 44px;' +
            '  min-width: 100px;' +
            '  position: relative;' +
            '  isolation: isolate;' +
            '  overflow: hidden;' +
            '  border-radius: 22px;' +
            '  --hex-size: 8px;' +
            '  --mmb-edge-angle: 0deg;' +
            '  cursor: pointer;' +
            '  user-select: none;' +
            '  -webkit-user-select: none;' +
            '  -webkit-tap-highlight-color: transparent;' +
            '  touch-action: manipulation;' +
            '  outline: none;' +
            '  color: #000000;' +
            '  font-family: georgia, sans-serif;' +
            '  font-weight: 900;' +
            '  font-size: 15px;' +
            '  letter-spacing: 1.2px;' +
            '  line-height: 1;' +
            // Multi-layer frosted white background + rotating conic-
            // rainbow border (same recipe as work.html .btn1/.btn2).
            '  background:' +
            '    radial-gradient(ellipse 100% 60% at 50% -25%,' +
            '      rgba(255,255,255,0.85) 0%,' +
            '      rgba(255,255,255,0.30) 35%,' +
            '      rgba(255,255,255,0.00) 70%) padding-box,' +
            '    radial-gradient(ellipse 60% 90% at 0% 0%,' +
            '      rgba(255,255,255,0.55) 0%,' +
            '      rgba(255,255,255,0.00) 60%) padding-box,' +
            '    radial-gradient(ellipse 90% 65% at 50% 120%,' +
            '      rgba(15,20,40,0.08) 0%,' +
            '      rgba(15,20,40,0.00) 60%) padding-box,' +
            '    linear-gradient(135deg,' +
            '      rgba(255,255,255,0.96) 0%,' +
            '      rgba(248,250,255,0.92) 100%) padding-box,' +
            '    conic-gradient(from var(--mmb-edge-angle),' +
            '      rgba(255,179,198,0.65),' +
            '      rgba(255,209,168,0.65),' +
            '      rgba(255,240,168,0.65),' +
            '      rgba(196,242,197,0.65),' +
            '      rgba(184,217,255,0.65),' +
            '      rgba(212,193,255,0.65),' +
            '      rgba(255,193,229,0.65),' +
            '      rgba(255,179,198,0.65)' +
            '    ) border-box;' +
            '  border: 2px solid transparent;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(255,255,255,0.90),' +
            '    inset 0 -1px 0 rgba(20,15,30,0.05),' +
            '    0 0 0 1.5px rgba(15,20,40,0.55),' +
            '    0 2px 6px rgba(15,20,40,0.12);' +
            '  transition: none;' +
            '  transform: none;' +
            '  animation: mmb-edge-spin 4.5s linear infinite;' +
            '}' +
            // ── ::before — small-hex shimmer layer, opacity:0 at rest
            // (identical to work.html .btn1::before / .btn2::before).
            '.mobile-menu-btn::before,' +
            'body.polish .mobile-menu-btn::before' +
            ' {' +
            '  content: "" !important;' +
            '  position: absolute !important;' +
            '  inset: 0 !important;' +
            '  z-index: -1 !important;' +
            '  pointer-events: none !important;' +
            '  border-radius: inherit !important;' +
            '  background: linear-gradient(90deg,' +
            '    #ffb3c6 0%, #ffd1a8 14%, #fff0a8 28%, #c4f2c5 42%,' +
            '    #b8d9ff 56%, #d4c1ff 70%, #ffc1e5 85%, #ffb3c6 100%) !important;' +
            '  background-size: 300% 100% !important;' +
            '  background-position: 0% 50% !important;' +
            '  -webkit-mask-image: ' + hexMask + ' !important;' +
            '          mask-image: ' + hexMask + ' !important;' +
            '  -webkit-mask-size: var(--hex-size) calc(var(--hex-size) * 1.14) !important;' +
            '          mask-size: var(--hex-size) calc(var(--hex-size) * 1.14) !important;' +
            '  -webkit-mask-repeat: repeat !important;' +
            '          mask-repeat: repeat !important;' +
            '  mix-blend-mode: normal !important;' +
            '  opacity: 0 !important;' +
            '  animation: none !important;' +
            '  transition: opacity 0.30s ease !important;' +
            '}' +
            // Inner content (SVG hamburger + MENU text) sits above the
            // shimmer layer.
            '.mobile-menu-btn > *,' +
            'body.polish .mobile-menu-btn > *' +
            ' { position: relative !important; z-index: 2 !important; }' +
            // ── Hover state — same recipe as work.html .btn1:hover.
            // Hex shimmer fades in with sweep + hue-cycle animation,
            // rotating border replaced by clean solid indigo border.
            // NO transform: the user wants the button to NOT move.
            '.mobile-menu-btn:hover,' +
            'body.polish .mobile-menu-btn:hover' +
            ' {' +
            '  transform: none !important;' +
            '  background:' +
            '    linear-gradient(135deg,' +
            '      rgba(255,255,255,0.98) 0%,' +
            '      rgba(248,250,255,0.95) 100%) padding-box,' +
            '    linear-gradient(135deg,' +
            '      rgba(99, 102, 241, 0.85),' +
            '      rgba(99, 102, 241, 0.85)) border-box !important;' +
            '  border: 2px solid transparent !important;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(255,255,255,0.95),' +
            '    0 1px 3px rgba(15,20,40,0.10) !important;' +
            '  animation: none !important;' +
            '}' +
            '.mobile-menu-btn:hover::before,' +
            'body.polish .mobile-menu-btn:hover::before' +
            ' {' +
            '  opacity: 0.55 !important;' +
            '  animation:' +
            '    mmb-hex-sweep      2.4s linear infinite,' +
            '    mmb-hex-hue-cycle  3.6s linear infinite !important;' +
            '  filter: saturate(0.85) brightness(1.05) !important;' +
            '}';
        (document.head || document.documentElement).appendChild(s);
    })();

    var NAV_PAGES = [
        { label: "Home", path: "/", aliases: ["/index"] },
        { label: "Career", path: "/work", aliases: [] },
        { label: "Academia", path: "/academia", aliases: ["/education"] },
        /* Software covers the gallery page (/software) AND every
           sub-directory that hosts an individual software project:
           /web/<app> (calculator apps, real-estate analyzer, etc.)
           and /library/<lib> (awsutil docs, etc.). The isActive()
           prefix-check below treats any of these as Software. */
        { label: "Software", path: "/software", aliases: ["/product", "/web", "/library"] },
        { label: "Milestones", path: "/milestone", aliases: [] },
        { label: "Travel", path: "/map", aliases: [] },
        { label: "Games", path: "/games", aliases: [] }
    ];

    var BASE_URL = "https://www.masrikdahir.com";

    function getActivePath() {
        var p = window.location.pathname.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "") || "/";
        return p;
    }

    function isActive(page) {
        var current = getActivePath();
        if (page.path === "/") {
            return current === "/" || current === "/index" || current === "";
        }
        if (current === page.path) return true;
        if (current.indexOf(page.path + "/") === 0) return true;
        for (var i = 0; i < page.aliases.length; i++) {
            if (current === page.aliases[i]) return true;
            if (current.indexOf(page.aliases[i] + "/") === 0) return true;
        }
        return false;
    }

    function buildDesktopNav() {
        var html = '<div class="resizing-1026-more">' +
            '<div class="w3-content" style="max-width: min(1800px, 95%); background-color: white">' +
            '<div class="topnav navbar-fixed-top" style="display: flex; justify-content: center; background: white; border-bottom: black 2px solid; padding: 5px 10px; flex-wrap: wrap;">';

        for (var i = 0; i < NAV_PAGES.length; i++) {
            var page = NAV_PAGES[i];
            var color = isActive(page) ? "red" : "black";
            var href = page.path === "/" ? BASE_URL : BASE_URL + page.path;
            html += '<a href="' + href + '" style="text-decoration: none">' +
                '<button class="glow-on-hover-nav" type="button" style="margin-left: 5px; margin-right: 5px; border: none; background: transparent">' +
                '<div class="w3-padding-small"><div>' +
                '<b style="color: ' + color + '; font-size: calc(15px + 0.4vw)">' +
                '<div class="wrapper"></div>' + page.label + '</b>' +
                '</div></div></button></a>';
        }

        html += '</div><br><br><br></div></div>';
        return html;
    }

    function buildMobileNav() {
        var html = '<div class="resizing-1026-less" style="margin-bottom: 70px">' +
            '<div class="popup" id="popup-3">' +
            '<div class="overlay" onclick="closePopup(\'3\')"></div>' +
            '<div class="content" style="">' +
            '<div style="color: black;">' +
            '<TABLE>';

        for (var i = 0; i < NAV_PAGES.length; i++) {
            var page = NAV_PAGES[i];
            var color = isActive(page) ? "red" : "black";
            var href = page.path === "/" ? BASE_URL : BASE_URL + page.path;
            html += '<TR><TD>' +
                '<a href="' + href + '" style="text-decoration: none">' +
                '<button class="glow-on-hover-nav" type="button" style="float: left; padding: 5px">' +
                '<div><b style="color: ' + color + '; font-size: calc(20px + 0.4vw)">' +
                '<div class="wrapper"></div>' + page.label + '</b></div>' +
                '</button></a>' +
                '</TD></TR>';
        }

        html += '</TABLE></div></div></div>' +
            '<div class="topnav-2 navbar-fixed-top">' +
            '<h5 class="w3-margin-right w3-margin-left" style="float: left; padding: 5px; padding-top: 7px; padding-bottom: 3px">' +
            '<div class="main">Masrik Dahir</div></h5>' +
            // Mobile menu — rendered as <div role="button"> (NOT <button>)
            // so polish.css's `body.polish button:not(...)` cascade chain
            // doesn't target it. All styling is in the .mobile-menu-btn
            // class injected at IIFE init; every state (rest / hover /
            // focus / active) is locked to identical declarations so the
            // element CANNOT change shape on press.
            '<div role="button" tabindex="0" onclick="togglePopup(\'3\')" ' +
            'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();togglePopup(\'3\');}" ' +
            'aria-label="Open navigation menu" class="mobile-menu-btn">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
            'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
            '<rect x="3" y="5" width="18" height="3" rx="1.5" fill="#000000"/>' +
            '<rect x="3" y="10.5" width="14" height="3" rx="1.5" fill="#000000"/>' +
            '<rect x="3" y="16" width="18" height="3" rx="1.5" fill="#000000"/>' +
            '</svg>' +
            '<span>MENU</span>' +
            '</div></div></div>';
        return html;
    }

    function buildFooter() {
        return '<footer id="footer-relative" class="w3-center w3-margin-top" ' +
            'style="color:#FFFAFA;background-color: black; display: inline-block; width: 100%">' +
            '<div style="padding: 10px">' +
            '<p style="padding-top: 15px;">Connect with me through Social Media</p>' +
            '<a href="https://www.instragram.com/masrik_dahir" target="blank"><i style="font-size:36px" class="fab fa-instagram w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://www.twitter.com/masrik_dahir" target="blank"><i style="font-size:36px" class="fab fa-twitter w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://www.linkedin.com/in/masrik-dahir-2b79b2163/" target="_blank"><i style="font-size:36px" class="fab fa-linkedin w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://github.com/Masrik-Dahir" target="blank"><i style="font-size:36px" class="fab fa-github w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://app.joinhandshake.com/users/20195119" target="blank"><i style="font-size:36px" class="fas fa-handshake w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://www.youtube.com/channel/UC6JyPjDH6oYUi_efCEPp6fw" target="blank"><i style="font-size:36px" class="fab fa-youtube-square w3-hover-opacity">&#160;&#160;</i></a>' +
            '<a href="https://scholar.google.com/citations?hl=en&authuser=2&user=TX_u0HgAAAAJ" target="blank"><i style="font-size:36px" class="fas fa-graduation-cap w3-hover-opacity">&#160;</i></a>' +
            '<a href="https://www.researchgate.net/profile/Masrik-Dahir" style="text-decoration: none;" target="blank"><i style="font-size:34px" class="w3-hover-opacity">R<sup>C</sup></i></a>' +
            '<a href="https://ud.me/masrikdahir.nft" style="text-decoration: none" target="blank">' +
            '<b style="font-size:37px; color: black" class="w3-hover-opacity">' +
            '<img style="width:35px; vertical-align: middle; margin-bottom: 5px; margin-left: 5px" src="https://d3dw5jtb3w1kgy.cloudfront.net/w3_white.png" alt=""/>' +
            '</b></a>' +
            '<a href="https://orcid.org/0000-0002-7841-310X" style="text-decoration: none" target="blank">' +
            '<b style="font-size:37px; color: black" class="w3-hover-opacity">' +
            '<img style="width:41px; vertical-align: middle; padding: 0; margin-bottom: 5px" alt="ORCID iD icon" src="https://d3dw5jtb3w1kgy.cloudfront.net/orcid_white.png"/>' +
            '</b></a>' +
            '</div><br></footer>';
    }

    /** Toggle the mobile popup menu open/closed. */
    window.togglePopup = function (id) {
        var popup = document.getElementById("popup-" + id);
        if (popup) popup.classList.toggle("active");
    };

    /** Close the mobile popup menu. */
    window.closePopup = function (id) {
        var popup = document.getElementById("popup-" + id);
        if (popup) popup.classList.remove("active");
    };

    // ── Click-outside-to-close ───────────────────────────────────
    // The popup itself has an .overlay child whose onclick closes the
    // popup, but the .overlay only covers the area BELOW the topnav.
    // Clicks on the fixed topnav-2 (the bar holding the title and the
    // MENU button) therefore don't reach the overlay, so the popup
    // stayed open when you clicked the topnav. This document-level
    // capture listener catches those clicks too: if the user clicks
    // anywhere outside the popup content AND outside the menu button
    // itself (so the button can still toggle), every active popup is
    // closed.
    document.addEventListener('click', function (e) {
        // Match both `.popup` (most pages, built by components.js) AND
        // `.popuphome` (index.html uses this variant class — same
        // togglePopup() call but the wrapping div has a different
        // class name). Both wrap the same popup-3 id with a .content
        // child holding the nav links.
        var popups = document.querySelectorAll('.popup.active, .popuphome.active, [id^="popup-"].active');
        if (!popups.length) return;
        var target = e.target;
        // Allow clicks inside the popup content area itself to stay open
        if (target.closest && target.closest('.popup .content, .popuphome .content, [id^="popup-"] .content')) return;
        // Allow clicks on the menu button to handle their own toggle
        if (target.closest && target.closest('.mobile-menu-btn')) return;
        for (var i = 0; i < popups.length; i++) popups[i].classList.remove('active');
    }, true);

    document.addEventListener("DOMContentLoaded", function () {
        var navEl = document.getElementById("nav-placeholder");
        if (navEl) {
            navEl.innerHTML = buildDesktopNav() + buildMobileNav();
        }

        var footerEl = document.getElementById("footer-placeholder");
        if (footerEl) {
            footerEl.innerHTML = buildFooter();
        }

        // Close popup when clicking overlay
        document.querySelectorAll(".overlay").forEach(function (overlay) {
            overlay.addEventListener("click", function () {
                var popup = this.parentElement;
                if (popup) popup.classList.remove("active");
            });
        });
    });
})();
