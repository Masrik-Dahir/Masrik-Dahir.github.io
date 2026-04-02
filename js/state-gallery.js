/**
 * state-gallery.js - Shared template and slideshow controls for state gallery pages.
 *
 * Usage:
 *   1. Set window.STATE_ABBR before this script loads (e.g., <script>window.STATE_ABBR = 'ny';</script>)
 *   2. Add <div id="state-gallery-container"></div> to the page body
 *   3. Include this script with defer BEFORE vueJs/image.js
 *   4. image.js will mount the Vue app to the injected #app_XX element
 */
(function () {
    var abbr = (window.STATE_ABBR || "").toLowerCase();
    if (!abbr) return;

    var ICONS = {
        home: "https://d3dw5jtb3w1kgy.cloudfront.net/Icons/home.png",
        left: "https://d3dw5jtb3w1kgy.cloudfront.net/Icons/left_arrow.png",
        right: "https://d3dw5jtb3w1kgy.cloudfront.net/Icons/right_arrow.png",
        map: "https://d3dw5jtb3w1kgy.cloudfront.net/Icons/map.png",
        gallery: "https://d3dw5jtb3w1kgy.cloudfront.net/gallery.png",
        slideshow: "https://d3dw5jtb3w1kgy.cloudfront.net/slideshow.png",
        pause: "https://d3dw5jtb3w1kgy.cloudfront.net/pause.png",
        resume: "https://d3dw5jtb3w1kgy.cloudfront.net/resume.webp"
    };

    var btnStyle = 'style="width: min(40px, max(1vw + 10px, 25px));"';
    var btnStyleMobile = 'style="width: calc(1vw + 20px);"';

    function navButton(iconKey, onclick, vShow, extraClass, href, imgStyle) {
        var cls = "glow-on-hover4" + (extraClass ? " " + extraClass : "");
        var style = href ? "" : (onclick ? ' onclick="' + onclick + '"' : "");
        var vShowAttr = vShow ? ' v-show="' + vShow + '"' : "";
        var clickAttr = "";
        if (onclick && onclick.indexOf("@click") === 0) {
            clickAttr = " " + onclick;
            style = "";
        }
        var inner = '<img src="' + ICONS[iconKey] + '" alt="" ' + imgStyle + '>';
        if (href) inner = '<a href="' + href + '">' + inner + '</a>';
        return '<button class="' + cls + '" style="width: fit-content; margin: 5px"' + vShowAttr + style + clickAttr + '>' + inner + '</button>';
    }

    function buildDesktopControls() {
        return '<div class="resizing-1026-more"><table width="100%"><tr><td><div style="padding: 10px">' +
            '<button class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px"><a href="http://www.masrikdahir.com"><img src="' + ICONS.home + '" alt="" ' + btnStyle + '></a></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px" onclick="prevSlide()"><img src="' + ICONS.left + '" alt="" ' + btnStyle + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px" @click="showGallery" onclick="showGalById()"><img src="' + ICONS.gallery + '" alt="" ' + btnStyle.replace(';"', ';padding-top: 3px;padding-bottom: 3px;"') + '></button>' +
            '<button v-show="!isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px" @click="showSlide" onclick="showSlideById()"><img src="' + ICONS.slideshow + '" alt="" ' + btnStyle + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4" style="width: fit-content;margin: 5px" onclick="pauseSlideShow()"><img src="' + ICONS.pause + '" alt="" ' + btnStyle + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4" style="width: fit-content;margin: 5px" onclick="resumeSlideShow()"><img src="' + ICONS.resume + '" alt="" ' + btnStyle + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px" onclick="nextSlide()"><img src="' + ICONS.right + '" alt="" ' + btnStyle + '></button>' +
            '<button class="glow-on-hover4 Blazing" style="width: fit-content;margin: 5px"><a href="http://www.masrikdahir.com/map" style="width: 40px"><img src="' + ICONS.map + '" alt="" ' + btnStyle + '></a></button>' +
            '</div></td></tr></table></div>';
    }

    function buildMobileControls() {
        var s = btnStyleMobile;
        return '<div class="resizing-1026-less"><table width="100%"><tr><td><div style="padding: 2px">' +
            '<button class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px"><a href="http://www.masrikdahir.com"><img src="' + ICONS.home + '" alt="" ' + s + '></a></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px" onclick="prevSlide()"><img src="' + ICONS.left + '" alt="" ' + s + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px" @click="showGallery" onclick="showGalById()"><img src="' + ICONS.gallery + '" alt="" ' + s + '></button>' +
            '<button v-show="!isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px" @click="showSlide" onclick="showSlideById()"><img src="' + ICONS.slideshow + '" alt="" ' + s + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4" style="width: fit-content; padding: 2px; margin: 5px" onclick="pauseSlideShow()"><img src="' + ICONS.pause + '" alt="" ' + s + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4" style="width: fit-content; padding: 2px; margin: 5px" onclick="resumeSlideShow()"><img src="' + ICONS.resume + '" alt="" ' + s + '></button>' +
            '<button v-show="isSlideVisible" class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px" onclick="nextSlide()"><img src="' + ICONS.right + '" alt="" ' + s + '></button>' +
            '<button class="glow-on-hover4 Blazing" style="width: fit-content; padding: 2px; margin: 5px"><a href="http://www.masrikdahir.com/map"><img src="' + ICONS.map + '" alt="" ' + s + '></a></button>' +
            '</div></td></tr></table></div>';
    }

    // Extract region name from page title ("Masrik Dahir - Region Name" or just "Masrik Dahir")
    var pageTitle = document.title || "";
    var regionName = pageTitle.indexOf(" - ") !== -1 ? pageTitle.substring(pageTitle.indexOf(" - ") + 3).trim() : "";
    var thumbCdn = "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/";

    function buildGalleryTemplate() {
        // Title bar rendered statically (not dependent on Vue mounting)
        var titleHtml = regionName
            ? '<div class="tag w3-margin-bottom" style="margin-top:70px"><div class="it"><img src="' + thumbCdn + regionName + '/img.png" alt="' + regionName + '" onerror="this.style.display=\'none\'" style="width: calc(5% + 40px); margin: 1px; vertical-align: middle;"/> ' + regionName + '</div></div>'
            : '';

        return '<table width="100%" style="margin-top: 10px"><tr><td width="100%">' +
            '<div class="content-slideshow-container">' +
            titleHtml +
            '<div id="app_' + abbr + '" class="w3-margin-bottom">' +

            // Slideshow view
            '<div id="showSlide" v-show="isSlideVisible">' +
            '<div v-for="item in resources" :key="item.title" class="content-slide">' +
            '<img :src="item.url" :alt="name + \' photo \' + item.title" style="width:100%; height: 100%; object-fit: contain; padding: 0"/>' +
            '</div></div>' +

            // Gallery view
            '<div id="showGal" v-show="!isSlideVisible">' +
            '<div class="inactive-container w3-margin-top w3-margin-left w3-margin-right">' +
            '<div v-for="(item, index) in resources" :key="index" :style="item.isActive ? \'flex-basis:100%\' : \'\'">' +
            '<div v-if="item.isActive" class="image-container active-image"><img :src="item.url" :alt="name + \' photo \' + item.title" /></div>' +
            '<div v-else class="inactive-image image-container" @click="selectImage(index)"><img :src="item.url" :alt="name + \' photo \' + item.title" /></div>' +
            '</div></div></div>' +

            // Nav panel
            '<div class="content-dot-container-frame w3-margin-bottom w3-margin-top">' +
            buildDesktopControls() +
            buildMobileControls() +
            '</div>' +

            '</div></div></td></tr></table>';
    }

    // Inject the template into the page
    var container = document.getElementById("state-gallery-container");
    if (container) {
        container.innerHTML = buildGalleryTemplate();
    }

    /* =====================================================================
     * Slideshow Controls
     * Extracted from the identical inline <script> in all 46 state files.
     * ===================================================================== */
    var slides, sla, gal;
    var slideIndex = 1;
    var slideInterval = null;

    function initDomRefs() {
        slides = document.getElementsByClassName("content-slide");
        sla = document.getElementById("showSlide");
        gal = document.getElementById("showGal");
    }

    window.showSlideById = function () {
        initDomRefs();
        if (sla) sla.style.display = "block";
        if (gal) gal.style.display = "none";
        startSlideShow();
    };

    window.showGalById = function () {
        initDomRefs();
        if (gal) gal.style.display = "block";
        if (sla) sla.style.display = "none";
        stopSlideShow();
    };

    function initializeSlides() {
        initDomRefs();
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
    }

    function changeSlide(n) {
        showSlides(slideIndex += n);
    }

    window.nextSlide = function () { changeSlide(1); };
    window.prevSlide = function () { changeSlide(-1); };
    window.currentSlide = function (n) { showSlides(slideIndex = n); };

    function showSlides(n) {
        initDomRefs();
        var dots = document.getElementsByClassName("content-dot");
        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length;
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (var j = 0; j < dots.length; j++) {
            dots[j].className = dots[j].className.replace(" content-active-dot", "");
        }
        if (slides[slideIndex - 1]) slides[slideIndex - 1].style.display = "block";
        if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " content-active-dot";
    }

    function startSlideShow() {
        stopSlideShow();
        initializeSlides();
        showSlides(slideIndex);
        slideInterval = setInterval(function () { changeSlide(1); }, 2000);
    }

    function stopSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    window.pauseSlideShow = function () { stopSlideShow(); };
    window.resumeSlideShow = function () { startSlideShow(); };

    document.addEventListener("DOMContentLoaded", function () {
        showGalById();
        initializeSlides();
    });
})();
