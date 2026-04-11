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
    var NAV_PAGES = [
        { label: "Home", path: "/", aliases: ["/index"] },
        { label: "Career", path: "/work", aliases: [] },
        { label: "Academia", path: "/academia", aliases: ["/education"] },
        { label: "Software", path: "/software", aliases: [] },
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
            '<button onclick="togglePopup(\'3\')" class="w3-margin-right w3-margin-left glow-on-hover-nav" ' +
            'style="float: right; padding: 5px; margin-top: 15px; border: none">' +
            '<img src="https://d3dw5jtb3w1kgy.cloudfront.net/menu.png" width="25" height="20" alt="Masrik Dahir">' +
            '</button></div></div>';
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
