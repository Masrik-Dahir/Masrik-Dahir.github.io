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

    /* Original Home + Map buttons are GONE per user request.
       Every other control (prev/gallery/slideshow/pause/resume/next)
       has been moved into the second top nav (.lang-bar) — see the
       `injectSubNav()` IIFE below. The two builders are kept as
       no-ops so the legacy template scaffold still has the call sites
       it expects without rendering anything. */
    function buildDesktopControls() { return ''; }
    function buildMobileControls()  { return ''; }

    // Extract region name from page title ("Masrik Dahir - Region Name" or just "Masrik Dahir")
    var pageTitle = document.title || "";
    var regionName = pageTitle.indexOf(" - ") !== -1 ? pageTitle.substring(pageTitle.indexOf(" - ") + 3).trim() : "";
    var thumbCdn = "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/";

    function buildGalleryTemplate() {
        // Title bar rendered statically (not dependent on Vue mounting).
        // margin-top accounts for the topnav + the new fixed
        // .lang-bar second top nav (≈90px total clearance).
        var titleHtml = regionName
            ? '<div class="tag w3-margin-bottom" style="margin-top:160px"><div class="it"><img src="' + thumbCdn + regionName + '/img.png" alt="' + regionName + '" onerror="this.style.display=\'none\'" style="width: calc(5% + 40px); margin: 1px; vertical-align: middle;"/> ' + regionName + '</div></div>'
            : '';

        /* New layout — modern photo portfolio:
             • Slideshow view = full-viewport lightbox (dark backdrop,
               image centered, page counter, fade transitions)
             • Gallery view = CSS-grid masonry of cards (lazy-loaded,
               hover lift, smooth fade-in)
             • Every <img> declares loading="lazy" + decoding="async"
               + fetchpriority so the active image loads eagerly and
               offscreen thumbs defer until the user scrolls to them.
         */
        return '<div class="rg-shell">' +
            titleHtml +
            '<div id="app_' + abbr + '" class="rg-app">' +

                /* ──── SLIDESHOW VIEW (lightbox) ──── */
                '<div id="showSlide" class="rg-slideshow" v-show="isSlideVisible">' +
                    /* Counter pill: "5 / 24" */
                    '<div class="rg-counter">' +
                        '<span class="rg-count-cur" id="rgCountCur">1</span>' +
                        '<span class="rg-count-sep">/</span>' +
                        '<span class="rg-count-tot" id="rgCountTot">{{ resources.length }}</span>' +
                    '</div>' +
                    '<div v-for="(item, idx) in resources" :key="\'s\'+item.title"' +
                        ' class="content-slide rg-slide" :data-idx="idx">' +
                        '<img :src="item.url" :alt="name + \' photo \' + item.title"' +
                            ' loading="lazy" decoding="async" fetchpriority="low"' +
                            ' class="rg-slide-img">' +
                    '</div>' +
                '</div>' +

                /* ──── GALLERY VIEW (masonry grid) ──── */
                '<div id="showGal" class="rg-gallery" v-show="!isSlideVisible">' +
                    '<div class="rg-grid">' +
                        '<figure v-for="(item, index) in resources" :key="\'g\'+item.title"' +
                            ' class="rg-card" :class="{ \'rg-card-active\': item.isActive }"' +
                            ' @click="selectImage(index)">' +
                            '<div class="rg-card-frame">' +
                                '<img :src="item.url" :alt="name + \' photo \' + item.title"' +
                                    ' loading="lazy" decoding="async"' +
                                    ' :fetchpriority="item.isActive ? \'high\' : \'low\'"' +
                                    ' class="rg-card-img">' +
                                '<div class="rg-card-overlay">' +
                                    '<span class="rg-card-num">#{{ item.title }}</span>' +
                                '</div>' +
                            '</div>' +
                        '</figure>' +
                    '</div>' +
                '</div>' +

            '</div>' +
        '</div>';
    }

    /* Inject the polished photo-portfolio styles (gallery grid +
       lightbox slideshow + lazy-load placeholders). */
    function injectGalleryStyles() {
        if (document.getElementById('rg-gallery-styles')) return;
        var s = document.createElement('style');
        s.id = 'rg-gallery-styles';
        s.textContent = [
            /* ── Make html element viewport-tall so position:fixed
               lightbox actually covers the whole screen (some pages
               had html shrinking to content height, clipping fixed). */
            'html { min-height: 100vh; }',
            'body { min-height: 100vh; }',

            /* ── Shell — gives the page a calm light backdrop ──── */
            '.rg-shell { max-width: 1600px; margin: 0 auto; padding: 0 18px 80px; }',
            '.rg-app { position: relative; }',

            /* ── GALLERY VIEW: CSS-grid masonry of square cards ── */
            '.rg-gallery { position: relative; }',
            '.rg-grid {',
                'display: grid;',
                'grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));',
                'gap: 12px;',
                'padding: 10px 0 30px;',
            '}',
            '@media (min-width: 768px) {',
                '.rg-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }',
            '}',
            '@media (min-width: 1200px) {',
                '.rg-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }',
            '}',

            /* Card — square aspect, soft shadow, slight lift on hover */
            '.rg-card {',
                'margin: 0;',
                'padding: 0;',
                'cursor: pointer;',
                'border-radius: 12px;',
                'overflow: hidden;',
                'background: linear-gradient(135deg, #f1f5ff 0%, #e9eeff 100%);',
                'transition: transform 0.30s cubic-bezier(.34,1.56,.64,1), box-shadow 0.30s ease;',
                'box-shadow: 0 1px 3px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.06);',
            '}',
            '.rg-card:hover {',
                'transform: translateY(-4px) scale(1.02);',
                'box-shadow: 0 8px 24px rgba(99,102,241,0.20), 0 16px 40px rgba(15,23,42,0.12);',
                'z-index: 2;',
            '}',
            '.rg-card-active {',
                'outline: 2.5px solid rgba(99,102,241,0.85);',
                'outline-offset: 2px;',
            '}',

            /* Frame keeps each card a perfect square; image covers */
            '.rg-card-frame {',
                'position: relative;',
                'width: 100%;',
                'aspect-ratio: 1 / 1;',
                'overflow: hidden;',
                'border-radius: inherit;',
            '}',
            '.rg-card-img {',
                'width: 100%; height: 100%;',
                'object-fit: cover;',
                'display: block;',
                'transition: transform 0.50s cubic-bezier(.22,1,.36,1), filter 0.30s ease;',
                'background: linear-gradient(135deg, #e9eeff, #d9dfff);',
            '}',
            '.rg-card:hover .rg-card-img { transform: scale(1.08); filter: saturate(1.10); }',

            /* Overlay — number on top-left, zoom glyph on bottom-right,
               revealed on hover with a subtle gradient. */
            '.rg-card-overlay {',
                'position: absolute;',
                'inset: 0;',
                'pointer-events: none;',
                'background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%);',
                'opacity: 0;',
                'transition: opacity 0.30s ease;',
                'color: #fff;',
            '}',
            '.rg-card:hover .rg-card-overlay { opacity: 1; }',
            '.rg-card-num {',
                'position: absolute; top: 10px; left: 12px;',
                'padding: 3px 8px;',
                'border-radius: 6px;',
                'background: rgba(15,23,42,0.65);',
                'font-family: "JetBrains Mono", "SF Mono", Consolas, monospace;',
                'font-size: 11px; font-weight: 700;',
                'letter-spacing: 0.04em;',
            '}',
            /* Zoom-glyph icon removed per request — overlay shows only
               the photo number now. */

            /* Smooth fade-in when images decode */
            '.rg-card-img { animation: rg-fade-in 0.45s ease-out both; }',
            '@keyframes rg-fade-in { from { opacity: 0; } to { opacity: 1; } }',

            /* ── SLIDESHOW VIEW: full-viewport lightbox ──────────── */
            /* Top navs keep their ORIGINAL styling — we just push the
               lightbox down so it doesn\'t cover the nav area. The
               navs sit naturally at the top of the document; the
               lightbox starts ~134px below (clearing the topnav +
               lang-bar stack). On scroll the nav-placeholder\'s
               existing fixed positioning keeps it visible. */
            '.rg-slideshow {',
                'position: fixed;',
                'top: 0; left: 0;',
                /* Explicit viewport dimensions instead of `inset: 0`
                   because some pages compress html.offsetHeight and
                   inset becomes relative to that — the lightbox would
                   then only cover the document height, not the screen. */
                'width: 100vw;',
                'height: 100vh;',
                'height: 100dvh;',     /* mobile-safe vh */
                'z-index: 1500;',
                /* Translucent dark backdrop so the heavy `backdrop-filter`
                   blur of the page behind is visible through it — the
                   user sees a softly-blurred, dimmed gallery underneath. */
                'background:',
                    'radial-gradient(ellipse at center, rgba(15,23,42,0.62), rgba(0,0,0,0.85) 80%);',
                'backdrop-filter: blur(22px) saturate(140%) brightness(0.85);',
                '-webkit-backdrop-filter: blur(22px) saturate(140%) brightness(0.85);',
                'display: flex;',
                'align-items: center;',
                'justify-content: center;',
                'overflow: hidden;',
                'animation: rg-light-in 0.30s ease-out;',
                'cursor: zoom-out;',
            '}',
            /* Image itself doesn\'t inherit the zoom-out cursor */
            '.rg-slide-img { cursor: default; }',
            '@keyframes rg-light-in { from { opacity: 0; } to { opacity: 1; } }',

            /* Each slide is absolutely-positioned and fades. The
               `background: transparent !important` override is
               critical — legacy `.content-slide` rules in another
               stylesheet paint these white, which would cover the
               dark lightbox backdrop. The lightbox itself is offset
               below the nav stack via sizeLightboxToViewport(), so
               slide padding can stay small. */
            '.rg-slide, .rg-slideshow .content-slide {',
                'position: absolute !important;',
                'inset: 0 !important;',
                'display: none;',
                'align-items: center;',
                'justify-content: center;',
                'padding: 20px 24px;',
                'background: transparent !important;',
                'animation: rg-slide-in 0.42s cubic-bezier(.22,1,.36,1) both;',
            '}',
            '@keyframes rg-slide-in {',
                'from { opacity: 0; transform: scale(0.97); }',
                'to   { opacity: 1; transform: scale(1.00); }',
            '}',
            '.rg-slide-img {',
                'max-width: 100%;',
                'max-height: 100%;',
                'width: auto;',
                'height: auto;',
                'object-fit: contain;',
                'border-radius: 10px;',
                'box-shadow: 0 24px 80px rgba(0,0,0,0.60);',
                'transition: opacity 0.30s ease;',
            '}',

            /* Counter pill, top center */
            '.rg-counter {',
                'position: absolute;',
                /* Sit at the top of the lightbox (which already starts
                   below the nav stack via sizeLightboxToViewport). */
                'top: 14px;',
                'left: 50%;',
                'transform: translateX(-50%);',
                'z-index: 1600;',
                'padding: 6px 14px;',
                'border-radius: 999px;',
                'background: rgba(15,23,42,0.65);',
                'color: #f1f5f9;',
                'font-family: "JetBrains Mono", "SF Mono", Consolas, monospace;',
                'font-size: 13px; font-weight: 700;',
                'letter-spacing: 0.04em;',
                'box-shadow: 0 4px 14px rgba(0,0,0,0.40);',
                'backdrop-filter: blur(10px);',
                '-webkit-backdrop-filter: blur(10px);',
                'pointer-events: none;',
                'display: none;',
            '}',
            '.rg-slideshow .rg-counter { display: block; }',
            '.rg-count-sep { opacity: 0.50; margin: 0 6px; }',
            '.rg-count-cur { color: #fff; }',
            '.rg-count-tot { color: #cbd5e1; }',

            /* Loading placeholder — animated shimmer while image decodes */
            '.rg-card-img:not([src]), .rg-card-img[src=""] {',
                'background: linear-gradient(90deg, #e9eeff 25%, #f3f4ff 50%, #e9eeff 75%);',
                'background-size: 200% 100%;',
                'animation: rg-shimmer 1.4s linear infinite;',
            '}',
            '@keyframes rg-shimmer {',
                'from { background-position: 200% 0; }',
                'to   { background-position: -200% 0; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }
    injectGalleryStyles();

    // Inject the second top nav (.lang-bar) before the gallery —
    // shows "Travel › <Region Name>" breadcrumb on the LEFT and the
    // slideshow controls (prev/gallery/slideshow/pause/resume/next)
    // on the RIGHT. Home + Map buttons removed per user request.
    (function injectSubNav(){
        if (document.querySelector('.lang-bar')) return;
        var regionName = (window.NAME || abbr || "").toUpperCase();
        var bar = document.createElement('div');
        bar.className = 'lang-bar';
        /* Right-side control buttons: black-on-white Font Awesome
           icons wrapped in the SAME `glow-on-hover-nav` class as the
           Travel breadcrumb on the left — so they pick up the
           red/orange glowing halo on hover instead of any color tint. */
        function ctrlBtn(kind, dataWhen, onclick, faIcon, title) {
            /* The aria-label keeps screen-reader text; the visible
               `.lb-tip` span renders the polished hover tooltip via
               CSS positioning (see injectLangBarStyles below). The
               native `title=""` is intentionally omitted so the OS
               doesn't show a competing tooltip. */
            return '<button class="lb-ctrl lb-ctrl-' + kind + '" type="button"' +
                ' data-when="' + dataWhen + '"' +
                ' onclick="' + onclick + '"' +
                ' aria-label="' + title + '">' +
                '<i class="fa ' + faIcon + '" aria-hidden="true"></i>' +
                '<span class="lb-tip">' + title + '</span>' +
            '</button>';
        }

        bar.innerHTML =
            /* LEFT: breadcrumb */
            '<div class="lang-bar-left">' +
                '<a class="lang-home" href="../map.html" title="Travel">' +
                    '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent">' +
                        '<div class="w3-padding-small"><div>' +
                            '<b style="color:black;font-size:calc(11px + 0.3vw)">Travel</b>' +
                        '</div></div>' +
                    '</button>' +
                '</a>' +
                '<span style="margin:0 6px;color:#9ca3af;font-size:calc(12px + 0.3vw)">&rsaquo;</span>' +
                '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent;cursor:default">' +
                    '<div class="w3-padding-small"><div>' +
                        '<b style="color:red;font-size:calc(11px + 0.3vw)">' + regionName + '</b>' +
                    '</div></div>' +
                '</button>' +
            '</div>' +
            /* RIGHT: slideshow / gallery controls. Each tile is a
               polished liquid-glass button with an accent-color tint
               + hover tooltip. Visibility per state via `data-when`
               + lang-bar `data-state` (see CSS below). */
            '<div class="lang-bar-controls">' +
                ctrlBtn('back',    'slide',         'showGalById()',    'fa-arrow-left',    'Back to gallery') +
                ctrlBtn('prev',    'slide',         'prevSlide()',      'fa-chevron-left',  'Previous') +
                ctrlBtn('zoomout', 'slide',         'zoomOutImage()',   'fa-search-minus',  'Zoom out') +
                ctrlBtn('zoomin',  'slide',         'zoomInImage()',    'fa-search-plus',   'Zoom in') +
                ctrlBtn('resize',  'slide',         'resetImageView()', 'fa-expand',        'Fit to screen') +
                ctrlBtn('gallery', 'slide',         'showGalById()',    'fa-th',            'Gallery') +
                ctrlBtn('play',    'gallery',       'showSlideById()',  'fa-film',          'Start slideshow') +
                ctrlBtn('pause',   'slide-running', 'pauseSlideShow()', 'fa-pause',         'Pause') +
                ctrlBtn('resume',  'slide-paused',  'resumeSlideShow()','fa-play',          'Resume') +
                ctrlBtn('next',    'slide',         'nextSlide()',      'fa-chevron-right', 'Next') +
            '</div>';
        var ref = document.getElementById('state-gallery-container');
        if (ref && ref.parentNode){
            ref.parentNode.insertBefore(bar, ref);
        } else {
            document.body.insertBefore(bar, document.body.firstChild);
        }
        injectLangBarStyles();
    })();

    /* Polished tile buttons for the lang-bar — white liquid-glass
       surface, indigo border, hover lift + glow, accent-color tint
       per action (prev/next neutral indigo, gallery violet, play
       emerald, pause amber, resume emerald). Each button has a
       hover tooltip explaining the action. */
    function injectLangBarStyles() {
        if (document.getElementById('lang-bar-ctrl-styles')) return;
        var s = document.createElement('style');
        s.id = 'lang-bar-ctrl-styles';
        s.textContent = [
            /* ── Animatable angles for the rotating rainbow border ── */
            '@property --lb-edge-angle { syntax: \'<angle>\'; initial-value: 0deg; inherits: false; }',
            '@keyframes lb-edge-spin   { to { --lb-edge-angle: 360deg; } }',
            '@keyframes lb-hex-sweep   { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }',
            '@keyframes lb-hex-hue     { from { filter: saturate(1.45) brightness(1.10) contrast(1.05) hue-rotate(0deg); } to { filter: saturate(1.45) brightness(1.10) contrast(1.05) hue-rotate(360deg); } }',

            /* ── Layout ──────────────────────────────────────────── */
            '.lang-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }',
            '.lang-bar-left { display: flex; align-items: center; flex-wrap: wrap; }',
            '.lang-bar-controls { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; }',

            /* ── DIAMOND-HEX LIQUID GLASS button — every control
               carries the same chrome as work.html .btn1/.btn2:
                 • rotating pastel-rainbow conic-gradient border at rest
                 • hex-mesh shimmer ::before (opacity 0 at rest, 0.55
                   on hover with dual sweep + hue-cycle animations)
                 • indigo solid border + 1-px lift on hover            */
            '.lang-bar-controls .lb-ctrl {',
                'position: relative;',
                'isolation: isolate;',
                'overflow: hidden;',
                'display: none;',
                'align-items: center;',
                'justify-content: center;',
                'width: 46px; height: 46px;',
                'padding: 0;',
                'border-radius: 11px;',
                'cursor: pointer;',
                'color: #000;',
                '--lb-edge-angle: 0deg;',
                '--hex-size: 6px;',
                'background:',
                    'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(248,250,255,0.90) 100%) padding-box,',
                    'conic-gradient(from var(--lb-edge-angle),',
                        'rgba(255,179,198,0.65), rgba(255,209,168,0.65),',
                        'rgba(255,240,168,0.65), rgba(196,242,197,0.65),',
                        'rgba(184,217,255,0.65), rgba(212,193,255,0.65),',
                        'rgba(255,193,229,0.65), rgba(255,179,198,0.65)',
                    ') border-box;',
                'border: 1.5px solid transparent;',
                'box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 3px rgba(15,20,40,0.08);',
                'backdrop-filter: blur(6px) saturate(130%);',
                '-webkit-backdrop-filter: blur(6px) saturate(130%);',
                'transition: transform 0.18s ease, background 0.22s ease, box-shadow 0.22s ease;',
                'animation: lb-edge-spin 4.5s linear infinite;',
            '}',
            /* Icon */
            '.lang-bar-controls .lb-ctrl i {',
                'position: relative;',
                'z-index: 1;',
                'font-size: 20px;',
                'line-height: 1;',
                'pointer-events: none;',
                'color: #0a0a19;',
                '-webkit-font-smoothing: antialiased;',
                '-moz-osx-font-smoothing: grayscale;',
                'text-rendering: geometricPrecision;',
                'transition: transform 0.18s ease;',
            '}',
            /* Hex-mesh shimmer layer behind the icon */
            '.lang-bar-controls .lb-ctrl::before {',
                'content: \'\';',
                'position: absolute;',
                'inset: 0;',
                'z-index: 0;',
                'pointer-events: none;',
                'border-radius: inherit;',
                'background: linear-gradient(90deg,',
                    '#ffb3c6 0%, #ffd1a8 14%, #fff0a8 28%, #c4f2c5 42%,',
                    '#b8d9ff 56%, #d4c1ff 70%, #ffc1e5 85%, #ffb3c6 100%);',
                'background-size: 300% 100%;',
                'background-position: 0% 50%;',
                '-webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 28 32\'><polygon points=\'14,1.5 26,8 26,24 14,30.5 2,24 2,8\' fill=\'none\' stroke=\'%23000\' stroke-width=\'3.5\'/></svg>");',
                '        mask-image: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 28 32\'><polygon points=\'14,1.5 26,8 26,24 14,30.5 2,24 2,8\' fill=\'none\' stroke=\'%23000\' stroke-width=\'3.5\'/></svg>");',
                '-webkit-mask-size: var(--hex-size) calc(var(--hex-size) * 1.14);',
                '        mask-size: var(--hex-size) calc(var(--hex-size) * 1.14);',
                '-webkit-mask-repeat: repeat;',
                '        mask-repeat: repeat;',
                'opacity: 0;',
                'transition: opacity 0.30s ease;',
            '}',
            /* HOVER — diamond-hex shimmer at MEDIUM vibrance:
               opacity 0.70, calmer sweep/hue speeds, softer
               saturation/brightness pump. */
            '.lang-bar-controls .lb-ctrl:hover::before {',
                'opacity: 0.70;',
                'animation: lb-hex-sweep 2.2s linear infinite, lb-hex-hue 3.0s linear infinite;',
                'filter: saturate(1.40) brightness(1.10) contrast(1.05);',
            '}',
            '.lang-bar-controls .lb-ctrl:hover {',
                'transform: translateY(-1px);',
                'background:',
                    'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(248,250,255,0.93) 100%) padding-box,',
                    'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(99,102,241,0.85)) border-box;',
                'border: 1.5px solid transparent;',
                'box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 3px rgba(15,20,40,0.10);',
            '}',
            '.lang-bar-controls .lb-ctrl:hover i { transform: scale(1.10); }',
            '.lang-bar-controls .lb-ctrl:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.30); }',

            /* Polished hover tooltip — dark glass pill with arrow,
               positioned below the button. Fades in on hover after a
               very short delay so accidental flick-throughs don\'t
               flash labels. */
            '.lang-bar-controls .lb-ctrl .lb-tip {',
                'position: absolute;',
                'top: calc(100% + 10px);',
                'left: 50%;',
                'transform: translate(-50%, -6px);',
                'padding: 6px 11px;',
                'border-radius: 8px;',
                'background: rgba(15, 23, 42, 0.96);',
                'color: #f1f5f9;',
                'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
                'font-size: 11.5px; font-weight: 700;',
                'letter-spacing: 0.05em;',
                'white-space: nowrap;',
                'pointer-events: none;',
                'opacity: 0;',
                'transition: opacity 0.20s ease 0.10s, transform 0.20s ease 0.10s;',
                'box-shadow: 0 6px 18px rgba(15,23,42,0.30);',
                'z-index: 200;',
            '}',
            '.lang-bar-controls .lb-ctrl .lb-tip::before {',
                'content: \'\';',
                'position: absolute;',
                'top: -4px;',
                'left: 50%;',
                'width: 8px; height: 8px;',
                'transform: translateX(-50%) rotate(45deg);',
                'background: rgba(15, 23, 42, 0.96);',
                'border-radius: 1px;',
            '}',
            '.lang-bar-controls .lb-ctrl:hover .lb-tip {',
                'opacity: 1;',
                'transform: translate(-50%, 0);',
            '}',
            '@media (hover: none) {',
                '.lang-bar-controls .lb-ctrl .lb-tip { display: none; }',
            '}',

            /* ── State-driven visibility ─────────────────────────── */
            '.lang-bar[data-state="gallery"]       .lb-ctrl[data-when="gallery"]       { display: inline-flex; }',
            '.lang-bar[data-state="slide-running"] .lb-ctrl[data-when="slide"],',
            '.lang-bar[data-state="slide-running"] .lb-ctrl[data-when="slide-running"] { display: inline-flex; }',
            '.lang-bar[data-state="slide-paused"]  .lb-ctrl[data-when="slide"],',
            '.lang-bar[data-state="slide-paused"]  .lb-ctrl[data-when="slide-paused"]  { display: inline-flex; }',
            '.lang-bar:not([data-state])           .lb-ctrl[data-when="gallery"]       { display: inline-flex; }',

            /* ── Mobile tweaks ───────────────────────────────────── */
            '@media (max-width: 720px) {',
                '.lang-bar-controls .lb-ctrl { width: 40px; height: 40px; }',
                '.lang-bar-controls .lb-ctrl i { font-size: 17px; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    /* Public helper that the slideshow code calls whenever the
       gallery/slideshow/paused state changes, so the lang-bar buttons
       update their visibility without touching Vue. */
    window.syncLangBarControls = function (state) {
        /* state ∈ { 'gallery', 'slide-running', 'slide-paused' } */
        var bar = document.querySelector('.lang-bar');
        if (!bar) return;
        bar.setAttribute('data-state', state || 'gallery');
    };

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
    /* Remembers the gallery scroll position at the moment the user
       opened the lightbox so the back action returns them to the
       exact same spot, no matter how long they were in the lightbox
       or how many slides they navigated through. */
    var savedScrollY = null;

    function initDomRefs() {
        slides = document.getElementsByClassName("content-slide");
        sla = document.getElementById("showSlide");
        gal = document.getElementById("showGal");
    }

    function sizeLightboxToViewport() {
        if (!sla) return;
        /* Measure the actual height of the nav stack at the top of
           the page so the lightbox starts below them and leaves them
           fully visible with their original styling. */
        var navTop = 0;
        document.querySelectorAll('#nav-placeholder, .topnav-1, .topnav-2, .navbar-fixed-top, .lang-bar').forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom > navTop && r.top < 200) navTop = r.bottom;
        });
        sla.style.position = 'fixed';
        sla.style.top  = navTop + 'px';
        sla.style.left = '0';
        sla.style.width  = window.innerWidth + 'px';
        sla.style.height = (window.innerHeight - navTop) + 'px';
    }
    /* Re-size on viewport changes while the lightbox is open. */
    window.addEventListener('resize', function () {
        if (sla && getComputedStyle(sla).display !== 'none') sizeLightboxToViewport();
    });
    window.addEventListener('orientationchange', function () {
        if (sla && getComputedStyle(sla).display !== 'none') sizeLightboxToViewport();
    });

    window.showSlideById = function () {
        initDomRefs();
        /* Capture the gallery scroll position ONLY on the
           gallery → slideshow transition so re-opens / state
           toggles inside the lightbox don\'t overwrite it. */
        if (savedScrollY === null) {
            savedScrollY = window.scrollY || window.pageYOffset || 0;
        }
        /* Lift the lightbox out of its constrained parent on first
           open — this guarantees position:fixed truly fills the
           viewport regardless of ancestor heights/overflow. */
        if (sla && sla.parentNode !== document.body) {
            document.body.appendChild(sla);
        }
        if (sla) sla.style.display = "flex";
        if (gal) gal.style.display = "none";
        /* Force absolute viewport dimensions via JS — bypasses CSS
           vh/inset edge cases that can leave the backdrop short. */
        sizeLightboxToViewport();
        startSlideShow();
        if (window.syncLangBarControls) window.syncLangBarControls('slide-running');
    };

    window.showGalById = function () {
        initDomRefs();
        if (gal) gal.style.display = "block";
        if (sla) sla.style.display = "none";
        stopSlideShow();
        if (typeof resetZoom === 'function') resetZoom();
        if (window.syncLangBarControls) window.syncLangBarControls('gallery');
        /* Restore the gallery scroll position the user was at when
           they opened the lightbox. We schedule the scroll multiple
           times because the gallery grid does a lazy layout pass
           after `display: block` toggles — the document\'s
           scrollHeight grows over a couple of frames as the images
           reflow. Fire NOW (immediate) + at 0/32/120 ms so the
           final scroll position sticks even if some browsers clamp
           to a smaller height on the first tick. */
        if (savedScrollY !== null) {
            var y = savedScrollY;
            savedScrollY = null;
            var restore = function () {
                window.scrollTo({ top: y, left: 0, behavior: 'auto' });
            };
            restore();
            setTimeout(restore, 0);
            setTimeout(restore, 32);
            setTimeout(restore, 120);
        }
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
        if (slides[slideIndex - 1]) slides[slideIndex - 1].style.display = "flex";
        if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " content-active-dot";
        /* New slide → reset zoom so it starts at fit-to-screen */
        if (typeof resetZoom === 'function') resetZoom();
        /* Update the lightbox counter "5 / 24" + eagerly load the
           active image's full resolution (rest stay lazy). */
        var cur = document.getElementById('rgCountCur');
        if (cur) cur.textContent = String(slideIndex);
        var activeImg = slides[slideIndex - 1] && slides[slideIndex - 1].querySelector('img');
        if (activeImg) {
            activeImg.setAttribute('fetchpriority', 'high');
            activeImg.loading = 'eager';
        }
        /* Eagerly preload the NEXT slide so the user never sees a blank
           pause when the slideshow advances or they press →. */
        var nextIdx = slideIndex === slides.length ? 0 : slideIndex;
        var nextImg = slides[nextIdx] && slides[nextIdx].querySelector('img');
        if (nextImg && !nextImg.complete) { nextImg.loading = 'eager'; }
    }

    function startSlideShow() {
        stopSlideShow();
        initializeSlides();
        showSlides(slideIndex);
        /* Slower auto-advance (3.5s) — gives the eye time to absorb
           each photo and matches modern photo-album pacing. */
        slideInterval = setInterval(function () { changeSlide(1); }, 3500);
    }

    function stopSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    window.pauseSlideShow = function () {
        stopSlideShow();
        if (window.syncLangBarControls) window.syncLangBarControls('slide-paused');
    };
    window.resumeSlideShow = function () {
        startSlideShow();
        if (window.syncLangBarControls) window.syncLangBarControls('slide-running');
    };

    /* ── Image zoom + pan controls ──
       The active image gets scaled AND translated via CSS transform.
       When zoomed in, the user can click-drag (or touch-drag) to pan
       around the photo. Reset on slide change / lightbox close. */
    var currentZoom = 1;
    var panX = 0, panY = 0;
    var ZOOM_MIN = 1, ZOOM_MAX = 5, ZOOM_STEP = 1.25;
    function activeSlideImg() {
        var slides = document.querySelectorAll('.rg-slideshow .rg-slide, .rg-slideshow .content-slide');
        for (var i = 0; i < slides.length; i++) {
            if (getComputedStyle(slides[i]).display !== 'none') {
                return slides[i].querySelector('.rg-slide-img, img');
            }
        }
        return null;
    }
    function applyZoom(skipTransition) {
        var img = activeSlideImg();
        if (!img) return;
        img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentZoom + ')';
        img.style.transformOrigin = 'center center';
        img.style.transition = skipTransition
            ? 'none'
            : 'transform 0.20s cubic-bezier(.22, 1, .36, 1)';
        img.style.cursor = currentZoom > 1 ? 'grab' : 'default';
        img.style.userSelect = 'none';
        img.style.webkitUserDrag = 'none';
    }
    function resetZoom() {
        currentZoom = 1;
        panX = 0; panY = 0;
        applyZoom();
    }

    /* ─ Click-and-drag pan ─ works at ANY zoom level (including 1×)
       so the user can pan the photo in any direction whether zoomed
       in or not. */
    var dragging = false, dragStartX = 0, dragStartY = 0, dragOriginX = 0, dragOriginY = 0;
    var dragMoved = false;
    document.addEventListener('mousedown', function (ev) {
        if (!isSlideShowOpen()) return;
        if (!ev.target.classList.contains('rg-slide-img')) return;
        dragging = true;
        dragMoved = false;
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        dragOriginX = panX;
        dragOriginY = panY;
        ev.target.style.cursor = 'grabbing';
        ev.preventDefault();
    });
    document.addEventListener('mousemove', function (ev) {
        if (!dragging) return;
        var dx = ev.clientX - dragStartX, dy = ev.clientY - dragStartY;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
        panX = dragOriginX + dx;
        panY = dragOriginY + dy;
        applyZoom(true);   /* skip transition so drag feels 1:1 */
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false;
        var img = activeSlideImg();
        if (img) img.style.cursor = 'grab';
    }
    document.addEventListener('mouseup',    endDrag);
    document.addEventListener('mouseleave', endDrag);

    /* ─ Touch drag (mobile/tablet) ─ */
    var touchPan = false, touchPanStartX = 0, touchPanStartY = 0, touchPanOriginX = 0, touchPanOriginY = 0;
    document.addEventListener('touchstart', function (ev) {
        if (!isSlideShowOpen()) return;
        if (!ev.target || !ev.target.classList || !ev.target.classList.contains('rg-slide-img')) return;
        if (ev.touches.length !== 1) return;
        touchPan = true;
        touchPanStartX = ev.touches[0].clientX;
        touchPanStartY = ev.touches[0].clientY;
        touchPanOriginX = panX;
        touchPanOriginY = panY;
    }, { passive: true });
    document.addEventListener('touchmove', function (ev) {
        if (!touchPan || ev.touches.length !== 1) return;
        panX = touchPanOriginX + (ev.touches[0].clientX - touchPanStartX);
        panY = touchPanOriginY + (ev.touches[0].clientY - touchPanStartY);
        applyZoom(true);
        ev.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', function () { touchPan = false; });
    window.zoomInImage  = function () {
        currentZoom = Math.min(ZOOM_MAX, currentZoom * ZOOM_STEP);
        applyZoom();
        /* If user zooms in, auto-pause the slideshow so the image
           doesn't advance while they\'re inspecting it. */
        if (slideInterval && window.pauseSlideShow) window.pauseSlideShow();
    };
    window.zoomOutImage = function () {
        currentZoom = Math.max(ZOOM_MIN, currentZoom / ZOOM_STEP);
        applyZoom();
    };
    /* Reset zoom + pan to fit-to-screen (used by the Fit button + 0 key) */
    window.resetImageView = function () {
        resetZoom();
    };
    /* Double-click on the image toggles between 1× and 2× */
    document.addEventListener('dblclick', function (ev) {
        if (!ev.target.classList.contains('rg-slide-img')) return;
        currentZoom = currentZoom > 1 ? 1 : 2;
        applyZoom();
    });

    /* Mouse-wheel zoom — scroll UP zooms in, scroll DOWN zooms out.
       Only fires while the lightbox is open, and we preventDefault so
       the page doesn\'t scroll behind the lightbox. */
    document.addEventListener('wheel', function (ev) {
        if (!isSlideShowOpen()) return;
        ev.preventDefault();
        /* Scrolling UP (negative deltaY) → zoom in
           Scrolling DOWN (positive deltaY) → zoom out
           Use a gentler step than the button so wheel feels smooth. */
        var wheelStep = 1.08;
        if (ev.deltaY < 0) {
            currentZoom = Math.min(ZOOM_MAX, currentZoom * wheelStep);
        } else if (ev.deltaY > 0) {
            currentZoom = Math.max(ZOOM_MIN, currentZoom / wheelStep);
        }
        applyZoom();
        /* If user scrolls during a running slideshow, pause it so the
           image doesn\'t move under their cursor. */
        if (slideInterval && window.pauseSlideShow) window.pauseSlideShow();
    }, { passive: false });

    document.addEventListener("DOMContentLoaded", function () {
        showGalById();
        initializeSlides();
        if (window.syncLangBarControls) window.syncLangBarControls('gallery');
    });

    /* ── Delegated click on gallery cards: open the lightbox ──
       Vue's `@click="selectImage(index)"` is also bound but a
       delegated document listener guarantees the lightbox opens
       even if Vue hasn't fully mounted yet (which is what the
       test caught). */
    document.addEventListener('click', function (ev) {
        var card = ev.target.closest('.rg-card');
        if (!card) return;
        /* Ignore clicks once the lightbox is already open */
        if (isSlideShowOpen()) return;
        ev.preventDefault();
        var cards = Array.prototype.slice.call(document.querySelectorAll('.rg-card'));
        var idx = cards.indexOf(card);
        if (idx < 0) return;
        if (window.showSlideById) window.showSlideById();
        if (window.currentSlide)  window.currentSlide(idx + 1);
        /* Auto-pause so the user can study the photo they just opened */
        if (window.pauseSlideShow) setTimeout(window.pauseSlideShow, 0);
    });

    /* Lightbox UX — keyboard + touch + backdrop-click */
    function isSlideShowOpen() {
        var el = document.getElementById('showSlide');
        return el && getComputedStyle(el).display !== 'none';
    }
    document.addEventListener('keydown', function (ev) {
        if (!isSlideShowOpen()) return;
        if (ev.key === 'ArrowRight') { window.nextSlide(); ev.preventDefault(); }
        else if (ev.key === 'ArrowLeft') { window.prevSlide(); ev.preventDefault(); }
        else if (ev.key === 'Escape') { window.showGalById(); ev.preventDefault(); }
        else if (ev.key === ' ') {
            ev.preventDefault();
            if (slideInterval) window.pauseSlideShow(); else window.resumeSlideShow();
        }
        else if (ev.key === '+' || ev.key === '=') { window.zoomInImage();  ev.preventDefault(); }
        else if (ev.key === '-' || ev.key === '_') { window.zoomOutImage(); ev.preventDefault(); }
        else if (ev.key === '0')                   { if (typeof resetZoom === 'function') resetZoom(); ev.preventDefault(); }
    });
    /* Touch swipe — slide navigation when the touch started OUTSIDE
       the image (so it doesn\'t conflict with pan-dragging the image
       itself, which is always enabled at any zoom level). */
    var touchStartX = 0, touchStartY = 0, touchActive = false, touchOnImage = false;
    document.addEventListener('touchstart', function (ev) {
        if (!isSlideShowOpen() || !ev.touches[0]) return;
        touchStartX = ev.touches[0].clientX;
        touchStartY = ev.touches[0].clientY;
        touchActive = true;
        touchOnImage = !!(ev.target && ev.target.classList && ev.target.classList.contains('rg-slide-img'));
    }, { passive: true });
    document.addEventListener('touchend', function (ev) {
        if (!touchActive || !ev.changedTouches[0]) return;
        touchActive = false;
        if (touchOnImage) return;  /* image touch = pan, not swipe-nav */
        var dx = ev.changedTouches[0].clientX - touchStartX;
        var dy = ev.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) window.nextSlide(); else window.prevSlide();
    }, { passive: true });
    /* Close on ANY click that's not on an interactive element
       (button, link, input). This means:
          • Clicks on actual nav links / breadcrumb buttons / slideshow
            control tiles act normally (their own handler runs and the
            lightbox stays open as appropriate).
          • Clicks on the empty padding/background of EITHER topnav,
            the lang-bar, OR the lightbox slide-frame all close the
            lightbox and return to the gallery.
          • Clicks on the rendered image stay open. */
    document.addEventListener('click', function (ev) {
        if (!isSlideShowOpen()) return;

        /* 1. Lang-bar slideshow control tiles (Prev/Next/Zoom/Back/etc.)
              run their own onclick — don\'t interfere. */
        if (ev.target.closest('.lb-ctrl')) return;

        /* 2. Gallery card clicks open the lightbox; if we receive one
              while already open, ignore (don\'t auto-close). Same for
              form inputs (sliders) and labels — those are inert UI. */
        if (ev.target.closest('input, select, textarea, label, .rg-card')) return;

        /* 3. ANY other click on the nav stack (topnav links, breadcrumb
              buttons, the bar background, the menu button) closes the
              lightbox immediately — works at every zoom level so the
              user can always escape via the navs. Link defaults still
              fire so the page navigates normally. */
        if (ev.target.closest('#nav-placeholder, .topnav, .topnav-1, .topnav-2, .navbar-fixed-top, .lang-bar')) {
            window.showGalById();
            return;
        }

        /* 4. When zoomed, clicks in the lightbox\'s dark backdrop
              stay open — protects the user\'s inspection. */
        if (currentZoom > 1 && ev.target.closest('.rg-slideshow')) return;

        /* If we got here, the click landed on a non-interactive region:
           empty nav padding, breadcrumb gap, lang-bar background, or
           the lightbox backdrop. Geometric test against the rendered
           image — close unless click is INSIDE the image rect. */
        var visibleSlide = null;
        var slides = document.querySelectorAll('.rg-slideshow .rg-slide, .rg-slideshow .content-slide');
        for (var i = 0; i < slides.length; i++) {
            if (getComputedStyle(slides[i]).display !== 'none') { visibleSlide = slides[i]; break; }
        }
        if (!visibleSlide) { window.showGalById(); return; }

        var img = visibleSlide.querySelector('.rg-slide-img, img');
        var imgLoaded = img && img.complete && img.naturalWidth > 0;
        if (!imgLoaded) {
            window.showGalById();
            return;
        }

        var r = img.getBoundingClientRect();
        var insideImage =
            ev.clientX >= r.left && ev.clientX <= r.right &&
            ev.clientY >= r.top  && ev.clientY <= r.bottom;
        if (!insideImage) {
            window.showGalById();
        }
    });
})();
