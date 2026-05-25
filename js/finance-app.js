/* finance-app.js — shared helpers for every web/<app>.html calculator
   (formatters, Chart.js wrappers, stat-card rendering, table builders).
   Vanilla JS, ES5-safe-ish, attached to window.FA. */
(function(){
    'use strict';

    var FA = window.FA = window.FA || {};

    /* ── Site nav installer ─────────────────────────────────────
       Renders the SAME desktop + mobile nav HTML that components.js
       builds for work.html / academia.html / software.html. We
       inline the markup here (rather than load components.js after
       DOMContentLoaded fired) so the placeholders fill immediately
       on every web/<app>.html page.

       The nav HTML uses these CSS classes from the legacy chain:
         w3-content (w3.css)  · topnav, navbar-fixed-top, popup,
         overlay, content     (default.css + popup.css)
         glow-on-hover-nav    (glowing.css)
       We auto-load those stylesheets so each app gets the exact
       same chrome the main site uses. */
    function loadCSS(href){
        if (document.querySelector('link[href="'+href+'"]')) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = href;
        document.head.appendChild(l);
    }
    function loadScriptSync(src){
        if (document.querySelector('script[data-fa-loaded="'+src+'"]')) return;
        document.write('<script data-fa-loaded="'+src+'" src="'+src+'"><\/script>');
    }

    /* ── Site chrome installer ──────────────────────────────────
       Called once at head-load of every web/<app>.html. Loads the
       SAME CSS + JS chain work.html uses, sets the same body class
       ("w3-white polish") + data-page-graphics="aurora", inserts
       <div id="nav-placeholder">/<div id="footer-placeholder">,
       pulls in jQuery + components.js + eagle-loader.js +
       page-graphics.js so the aurora background, polish glass
       effects, and site nav populate exactly as on work.html /
       academia.html.
       Uses document.write (only valid while head is being parsed)
       to keep these scripts synchronous-by-position so
       components.js sees #nav-placeholder when it runs its own
       DOMContentLoaded handler. */
    FA.installSiteChrome = function(appName){
        if (document.documentElement.getAttribute('data-fa-chrome')) return;
        document.documentElement.setAttribute('data-fa-chrome','1');
        [
            '../css/vendor/www.w3schools.com.w3css.4.w3.css',
            '../css/vendor/cdnjs.cloudflare.com.ajax.libs.font-awesome.4.7.0.css.font-awesome.min.css',
            '../css/icons.css',
            '../css/box.css',
            '../css/default.css',
            '../css/glowing.css',
            '../css/new.css',
            '../css/if.css',
            '../css/popup.css',
            '../css/search.css',
            '../css/vintage.css',
            '../css/eagle-loader.css',
            '../css/polish.css',
            '../css/animations.css',
            /* d.css contains `.navbar-fixed-top { position:fixed;
               left:0; right:0 }` which is what makes the topnav span
               the full viewport width in work.html — without it, the
               topnav stays constrained to its parent .w3-content and
               the black line ends up too short / too far down. */
            '../css/d.css',
            /* .lang-bar + .glow-sm second-nav styling (same chrome
               library/awsutil/python.html uses for its language
               switcher). */
            '../css/awsutil-docs.css'
        ].forEach(loadCSS);
        /* Re-append finance-app.css so it cascades AFTER polish.css */
        var faCss = document.querySelector('link[href*="finance-app.css"]');
        if (faCss) document.head.appendChild(faCss);

        /* Wire live comma-formatting + Example buttons once the
           markup exists. Runs after a microtask + a frame so HTML
           parser has finished. */
        document.addEventListener('DOMContentLoaded', function(){
            requestAnimationFrame(function(){
                if (FA.installMoneyInputFormatting) FA.installMoneyInputFormatting();
                if (FA.installExampleButtons)       FA.installExampleButtons();
            });
        });

        /* Register the placeholder-creation handler BEFORE loading
           components.js so it fires first on DOMContentLoaded. */
        document.addEventListener('DOMContentLoaded', function(){
            document.body.classList.add('w3-white');
            document.body.classList.add('polish');
            document.body.setAttribute('data-page-graphics', 'aurora');
            if (!document.getElementById('nav-placeholder')){
                var np = document.createElement('div');
                np.id = 'nav-placeholder';
                document.body.insertBefore(np, document.body.firstChild);

                /* SECOND TOP NAV — same fixed bar chrome as
                   library/awsutil/python.html's .lang-bar, but the
                   contents are just a simple breadcrumb:
                       Software › <current app name>
                   "Software" is a button-styled link back to the
                   gallery, and the current app name is shown in red
                   (matches the "active language" styling). */
                var name = appName || document.title.split('·')[0].trim() || 'Calculator';
                var bar = document.createElement('div');
                bar.className = 'lang-bar fa-app-bar';
                bar.innerHTML =
                    '<a class="lang-home" href="../software.html" style="text-decoration:none" title="Software gallery">' +
                        '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent">' +
                            '<div class="w3-padding-small"><div>' +
                                '<b style="color:black;font-size:calc(11px + 0.3vw)">Software</b>' +
                            '</div></div></button></a>' +
                    '<span class="fa-app-bar-sep" style="margin:0 6px;color:#9ca3af;font-size:calc(12px + 0.3vw)">›</span>' +
                    '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent;cursor:default">' +
                        '<div class="w3-padding-small"><div>' +
                            '<b style="color:red;font-size:calc(11px + 0.3vw)">' + name + '</b>' +
                        '</div></div></button>';
                np.parentNode.insertBefore(bar, np.nextSibling);
            }
            if (!document.getElementById('footer-placeholder')){
                var fp = document.createElement('div');
                fp.id = 'footer-placeholder';
                document.body.appendChild(fp);
            }
            /* Wrap everything between #nav-placeholder and
               #footer-placeholder in a .w3-content white container,
               just like work.html. The aurora background (canvas
               injected by page-graphics.js) then shows ONLY in the
               margins on either side, exactly matching the rest of
               the site. */
            if (!document.querySelector('.fa-page-wrap')){
                var np = document.getElementById('nav-placeholder');
                var fp2 = document.getElementById('footer-placeholder');
                var wrap = document.createElement('div');
                wrap.className = 'w3-content w3-margin-top fa-page-wrap';
                /* Centered, limited-width white wrap — matches the
                   rest of the site (work.html / academia.html). */
                wrap.style.cssText = 'max-width: min(1800px, 95%); background-color: white; position: relative; z-index: 1;';
                /* Move every sibling between nav and footer into wrap */
                var node = np.nextSibling;
                while (node && node !== fp2){
                    var next = node.nextSibling;
                    if (node.classList && node.classList.contains('fa-app-nav')){
                        /* breadcrumb stays outside the wrap so it sits
                           directly under the top nav */
                    } else {
                        wrap.appendChild(node);
                    }
                    node = next;
                }
                document.body.insertBefore(wrap, fp2);
            }
        });

        /* NOW load the legacy scripts. Their listeners register
           AFTER ours, so they fire AFTER our placeholders are
           created. */
        loadScriptSync('../js/vendor/code.jquery.com.jquery-1.10.2.js');
        loadScriptSync('../js/components.js?v=active-aliases');
        loadScriptSync('../js/eagle-loader.js');
        loadScriptSync('../js/page-graphics.js');
        /* aesthetics.js installs the FontAwesome 5 kit (ka-f.fontawesome.com).
           components.js's footer uses FA5 brand/solid classes (fab fa-instagram,
           fas fa-handshake, …); without this kit the local FA 4.7 stylesheet
           doesn't provide those glyphs, so the social icons render blank. Every
           library/awsutil page loads aesthetics.js statically — match that here. */
        loadScriptSync('../js/aesthetics.js');

    };

    /* Provide a way for inline <script>FA.bootstrap('Name')</script>
       in each app's head to set the breadcrumb name. */
    FA.bootstrap = function(name){ FA._appName = name; FA.installSiteChrome(name); };

    var SITE_PAGES = [
        { label:'Home',       href:'../index.html' },
        { label:'Career',     href:'../work.html' },
        { label:'Academia',   href:'../academia.html' },
        { label:'Software',   href:'../software.html', active:true },
        { label:'Milestones', href:'../milestone.html' },
        { label:'Travel',     href:'../map.html' },
        { label:'Games',      href:'../games.html' }
    ];

    function buildDesktopNav(){
        var html = '<div class="resizing-1026-more">' +
            '<div class="w3-content" style="max-width: min(1800px, 95%); background-color: white">' +
            '<div class="topnav navbar-fixed-top" style="display:flex;justify-content:center;background:white;border-bottom:black 2px solid;padding:5px 10px;flex-wrap:wrap;">';
        SITE_PAGES.forEach(function(p){
            var color = p.active ? 'red' : 'black';
            html += '<a href="'+p.href+'" style="text-decoration:none">' +
                '<button class="glow-on-hover-nav" type="button" style="margin:0 5px;border:none;background:transparent">' +
                '<div class="w3-padding-small"><div>' +
                '<b style="color:'+color+';font-size:calc(15px + 0.4vw)">' +
                '<div class="wrapper"></div>'+p.label+'</b>' +
                '</div></div></button></a>';
        });
        html += '</div><br><br><br></div></div>';
        return html;
    }
    function buildMobileNav(){
        var html = '<div class="resizing-1026-less" style="margin-bottom:70px">' +
            '<div class="popup" id="popup-3">' +
            '<div class="overlay" onclick="(function(p){var el=document.getElementById(\'popup-\'+p);if(el)el.classList.remove(\'active\');})(\'3\')"></div>' +
            '<div class="content"><div style="color:black"><TABLE>';
        SITE_PAGES.forEach(function(p){
            var color = p.active ? 'red' : 'black';
            html += '<TR><TD><a href="'+p.href+'" style="text-decoration:none">' +
                '<button class="glow-on-hover-nav" type="button" style="float:left;padding:5px">' +
                '<div><b style="color:'+color+';font-size:calc(20px + 0.4vw)">'+p.label+'</b></div>' +
                '</button></a></TD></TR>';
        });
        html += '</TABLE></div></div></div>' +
            '<div class="w3-content" style="max-width:min(1800px,95%);background:white">' +
            '<div class="topnav navbar-fixed-top" style="background:white;border-bottom:black 2px solid;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">' +
            '<a href="../index.html"><img src="https://d3dw5jtb3w1kgy.cloudfront.net/logo.png" alt="" style="width:36px;height:36px;border-radius:8px"></a>' +
            '<button type="button" onclick="(function(p){var el=document.getElementById(\'popup-\'+p);if(el)el.classList.toggle(\'active\');})(\'3\')" style="border:none;background:transparent;font-size:24px;cursor:pointer">☰</button>' +
            '</div></div></div>';
        return html;
    }
    function buildFooter(){
        return '<div style="text-align:center;padding:24px 16px;margin-top:40px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px">' +
            'Connect with me · ' +
            '<a href="https://www.instagram.com/masrik_dahir" style="color:#0a0a0a;text-decoration:none;font-weight:600;margin:0 6px">Instagram</a>·' +
            '<a href="https://www.twitter.com/masrik_dahir" style="color:#0a0a0a;text-decoration:none;font-weight:600;margin:0 6px">Twitter/X</a>·' +
            '<a href="https://www.linkedin.com/in/masrik-dahir-2b79b2163/" style="color:#0a0a0a;text-decoration:none;font-weight:600;margin:0 6px">LinkedIn</a>·' +
            '<a href="https://github.com/Masrik-Dahir" style="color:#0a0a0a;text-decoration:none;font-weight:600;margin:0 6px">GitHub</a>' +
            '</div>';
    }

    /* ── Live comma formatting on every money-input ───────────────
       Any input inside .fa-input-wrap whose sibling .fa-input-prefix
       contains "$" is upgraded:
         • switched from type="number" to type="text" inputmode="decimal"
           so the comma characters render
         • formatted on every keystroke (25000 → 25,000) while
           preserving caret position
         • cleaned on blur (12,000.500 → 12,000.5)
       FA.num already strips commas + $ + spaces + % so any downstream
       math keeps working unchanged. Idempotent — won\'t re-bind. */
    FA.installMoneyInputFormatting = function(){
        var wraps = document.querySelectorAll('.fa-input-wrap');
        wraps.forEach(function(wrap){
            var prefix = wrap.querySelector('.fa-input-prefix');
            if (!prefix || prefix.textContent.indexOf('$') === -1) return;
            var input = wrap.querySelector('input');
            if (!input || input.dataset.faMoney === '1') return;
            input.dataset.faMoney = '1';
            /* Switch number → text so commas render */
            if (input.type === 'number') input.type = 'text';
            input.setAttribute('inputmode', 'decimal');
            input.setAttribute('autocomplete', 'off');
            /* Format anything that was server-rendered as a value */
            if (input.value !== '') input.value = formatMoneyText(input.value);
            /* Live formatting on every keystroke */
            input.addEventListener('input', function(ev){
                var oldVal = ev.target.value;
                var caret  = ev.target.selectionStart;
                /* count digits before the caret to restore position */
                var digitsBefore = 0;
                for (var i = 0; i < caret; i++) {
                    if (/[0-9.]/.test(oldVal.charAt(i))) digitsBefore++;
                }
                var newVal = formatMoneyText(oldVal);
                if (newVal === oldVal) return;
                ev.target.value = newVal;
                /* Walk through new value and restore caret at the
                   same digit count. */
                var seen = 0, pos = newVal.length;
                for (var j = 0; j < newVal.length; j++) {
                    if (/[0-9.]/.test(newVal.charAt(j))) seen++;
                    if (seen === digitsBefore) { pos = j + 1; break; }
                }
                try { ev.target.setSelectionRange(pos, pos); } catch (_) {}
            });
        });
    };
    function formatMoneyText(raw){
        raw = String(raw == null ? '' : raw);
        /* keep digits, optional leading minus, single decimal point */
        var neg = /^-/.test(raw);
        var digits = raw.replace(/[^\d.]/g, '');
        /* collapse multiple decimal points to the FIRST one */
        var firstDot = digits.indexOf('.');
        if (firstDot !== -1) {
            digits = digits.slice(0, firstDot + 1) +
                     digits.slice(firstDot + 1).replace(/\./g, '');
        }
        if (digits === '' || digits === '.') return neg ? '-' : digits;
        var parts = digits.split('.');
        /* strip leading zeros from the integer part (but keep a
           single "0" before a decimal) */
        parts[0] = parts[0].replace(/^0+(?=\d)/, '');
        if (parts[0] === '') parts[0] = '0';
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return (neg ? '-' : '') + parts.join('.');
    }
    /* Re-scan when the DOM changes (e.g. dynamic row lists). */
    FA._moneyObs = null;
    FA.watchMoneyInputs = function(){
        if (FA._moneyObs || typeof MutationObserver === 'undefined') return;
        FA._moneyObs = new MutationObserver(function(){
            if (FA.installMoneyInputFormatting) FA.installMoneyInputFormatting();
        });
        FA._moneyObs.observe(document.body, { childList: true, subtree: true });
    };
    document.addEventListener('DOMContentLoaded', function(){
        /* run the initial scan AND start watching for new DOM
           additions — without the initial pass, money inputs
           that exist at page-load time never get the live
           comma formatter attached. */
        if (FA.installMoneyInputFormatting) FA.installMoneyInputFormatting();
        if (FA.watchMoneyInputs) FA.watchMoneyInputs();
    });

    /* ── Example button system ────────────────────────────────────
       Pages call FA.example(cardSelector, fillerFn). When the user
       clicks the auto-mounted "Load example" button in that card,
       fillerFn runs (sets inputs + calls the page\'s calculate fn).
       installExampleButtons() mounts the button into every
       registered card\'s .fa-card-head. */
    FA._examples = [];
    FA.example = function(cardSelector, filler){
        FA._examples.push({ selector: cardSelector, fn: filler });
    };
    FA.installExampleButtons = function(){
        FA._examples.forEach(function(ex){
            var card = document.querySelector(ex.selector);
            if (!card) return;
            if (card.querySelector('.fa-example-btn')) return;
            var head = card.querySelector('.fa-card-head');
            if (!head) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'fa-btn fa-btn-ghost fa-example-btn';
            btn.textContent = 'Load example';
            btn.style.marginLeft = 'auto';
            btn.style.flex = '0 0 auto';
            btn.addEventListener('click', function(){
                try { ex.fn(card); }
                catch (e) { console.warn('FA.example filler error:', e); }
                /* Re-format any newly set values */
                if (FA.installMoneyInputFormatting) FA.installMoneyInputFormatting();
                /* Re-run comma formatting on each input we touched */
                card.querySelectorAll('input').forEach(function(inp){
                    if (inp.dataset.faMoney === '1' && inp.value !== '') {
                        inp.value = formatMoneyText(inp.value);
                    }
                });
            });
            head.appendChild(btn);
        });
    };
    /* Public helper to set + format an input in one shot */
    FA.set = function(id, value){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return;
        el.value = value;
        if (el.dataset.faMoney === '1') el.value = formatMoneyText(el.value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    /* Only inserts the breadcrumb. The legacy site nav itself is now
       wired by static <script src="../js/components.js"> tags in
       each app HTML (matching work.html exactly), and components.js
       populates #nav-placeholder + #footer-placeholder on
       DOMContentLoaded. */
    FA.installTopnav = function(appName){
        if (document.querySelector('.fa-app-nav')) return;
        var nav = document.getElementById('nav-placeholder');
        if (!nav) return;
        var bc = document.createElement('div');
        bc.className = 'fa-app-nav';
        bc.innerHTML =
            '<a href="../software.html">Software</a>' +
            '<span class="fa-app-nav-sep">›</span>' +
            '<span class="fa-app-nav-current">' + (appName || 'Calculator') + '</span>';
        nav.parentNode.insertBefore(bc, nav.nextSibling);
    };
    FA.installFooter = function(){ /* footer is wired by components.js into #footer-placeholder */ };

    /* ── Formatters ─────────────────────────────────────────────── */
    FA.fmtMoney = function(v, opts){
        opts = opts || {};
        if (v === null || v === undefined || isNaN(v)) return '—';
        var sign = v < 0 ? '-' : '';
        var abs = Math.abs(v);
        var digits = opts.digits != null ? opts.digits : (abs < 100 ? 2 : 0);
        var s = abs.toFixed(digits);
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return sign + (opts.symbol || '$') + parts.join('.');
    };
    FA.fmtPercent = function(v, digits){
        if (v === null || v === undefined || isNaN(v)) return '—';
        return (v).toFixed(digits != null ? digits : 2) + '%';
    };
    FA.fmtNumber = function(v, digits){
        if (v === null || v === undefined || isNaN(v)) return '—';
        return Number(v).toLocaleString(undefined, {
            minimumFractionDigits: digits || 0,
            maximumFractionDigits: digits || 0
        });
    };
    FA.fmtDuration = function(months){
        if (!isFinite(months) || months < 0) return '—';
        var y = Math.floor(months / 12);
        var m = Math.round(months - y*12);
        if (y === 0) return m + ' mo';
        if (m === 0) return y + ' yr';
        return y + ' yr ' + m + ' mo';
    };

    /* ── Parsing helpers ────────────────────────────────────────── */
    FA.num = function(id, fallback){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return fallback != null ? fallback : NaN;
        var raw = String(el.value || '').replace(/[$,\s%]/g, '').trim();
        if (raw === '') return fallback != null ? fallback : NaN;
        var n = parseFloat(raw);
        return isNaN(n) ? (fallback != null ? fallback : NaN) : n;
    };
    FA.text = function(id){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        return el ? String(el.value || '') : '';
    };

    /* ── DOM helpers ────────────────────────────────────────────── */
    FA.show = function(id){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.classList.add('fa-active');
    };
    FA.hide = function(id){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.classList.remove('fa-active');
    };
    FA.setText = function(id, text){
        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.textContent = text;
    };

    /* ── Stat-card builder ──────────────────────────────────────── */
    /* stats: array of { label, value, sub?, kind? }                */
    FA.renderStats = function(containerId, stats){
        var host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!host) return;
        host.innerHTML = '';
        stats.forEach(function(s){
            var card = document.createElement('div');
            card.className = 'fa-stat' + (s.kind ? ' fa-' + s.kind : '');
            card.innerHTML =
                '<p class="fa-stat-label">' + (s.label || '') + '</p>' +
                '<p class="fa-stat-value">' + (s.value != null ? s.value : '—') + '</p>' +
                (s.sub ? '<p class="fa-stat-sub">' + s.sub + '</p>' : '');
            host.appendChild(card);
        });
    };

    /* ── Table builder ──────────────────────────────────────────── */
    /* rows: array of arrays. heads: array of strings.
       numCols: array of column indexes that should be right-aligned. */
    FA.renderTable = function(containerId, heads, rows, numCols){
        var host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!host) return;
        var numSet = {};
        (numCols || []).forEach(function(i){ numSet[i] = true; });
        var html = '<div class="fa-table-wrap"><table class="fa-table"><thead><tr>';
        heads.forEach(function(h, i){
            html += '<th' + (numSet[i] ? ' class="fa-num"' : '') + '>' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row){
            html += '<tr>';
            row.forEach(function(cell, i){
                html += '<td' + (numSet[i] ? ' class="fa-num"' : '') + '>' + cell + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        host.innerHTML = html;
    };

    /* ── Chart.js helpers — manage one chart per canvas id ─────── */
    var CHARTS = {};
    FA.destroyChart = function(canvasId){
        if (CHARTS[canvasId]) {
            try { CHARTS[canvasId].destroy(); } catch (e) {}
            delete CHARTS[canvasId];
        }
    };
    /* SUPER COLORFUL palette — every chart/table on every page pulls
       from this. Buttons stay text-only black-and-white per the
       editorial design, but data visualizations are vibrant.
       Carefully tuned for contrast on white + colorblind safety
       (Wong-style + tertiaries). */
    FA.PALETTE = [
        '#6366f1',  /* indigo    */
        '#ec4899',  /* pink      */
        '#10b981',  /* emerald   */
        '#f59e0b',  /* amber     */
        '#3b82f6',  /* blue      */
        '#8b5cf6',  /* violet    */
        '#ef4444',  /* red       */
        '#14b8a6',  /* teal      */
        '#f97316',  /* orange    */
        '#0ea5e9',  /* sky       */
        '#84cc16',  /* lime      */
        '#a855f7'   /* purple    */
    ];
    /* Lighter pastel variants for stacked-area / hover bg / table tint */
    FA.PALETTE_SOFT = [
        'rgba(99,102,241,0.18)', 'rgba(236,72,153,0.18)',
        'rgba(16,185,129,0.18)', 'rgba(245,158,11,0.18)',
        'rgba(59,130,246,0.18)', 'rgba(139,92,246,0.18)',
        'rgba(239,68,68,0.18)',  'rgba(20,184,166,0.18)',
        'rgba(249,115,22,0.18)', 'rgba(14,165,233,0.18)',
        'rgba(132,204,22,0.18)', 'rgba(168,85,247,0.18)'
    ];
    /* Helper — pick N colors round-robin */
    FA.colors = function(n){
        var out = [];
        for (var i = 0; i < n; i++) out.push(FA.PALETTE[i % FA.PALETTE.length]);
        return out;
    };
    FA.colorsSoft = function(n){
        var out = [];
        for (var i = 0; i < n; i++) out.push(FA.PALETTE_SOFT[i % FA.PALETTE_SOFT.length]);
        return out;
    };

    /* Format helper used by tooltips. If the value looks like money,
       format as $; if percent, append %; else thousands-separator. */
    FA.smartFmt = function(v, hint){
        if (v === null || v === undefined || isNaN(v)) return v;
        if (hint === 'money') return FA.fmtMoney(v);
        if (hint === 'percent') return FA.fmtPercent(v);
        return Number(v).toLocaleString();
    };

    /* Gradient fill helper — vertical color-to-transparent gradient.
       Pass an RGB color (default = indigo). */
    FA.gradient = function(ctx, chartArea, topAlpha, bottomAlpha, rgb){
        rgb = rgb || '99,102,241';   /* default = indigo */
        if (!chartArea) return 'rgba(' + rgb + ',' + (topAlpha || 0.22) + ')';
        var g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(' + rgb + ',' + (topAlpha    != null ? topAlpha    : 0.45) + ')');
        g.addColorStop(1, 'rgba(' + rgb + ',' + (bottomAlpha != null ? bottomAlpha : 0.02) + ')');
        return g;
    };
    /* Hex like "#6366f1" → "99,102,241" — used by gradient fills */
    FA.hexToRgb = function(hex){
        hex = (hex || '').replace('#','');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var n = parseInt(hex, 16);
        if (isNaN(n)) return '99,102,241';
        return ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255);
    };

    /* Premium FA.chart — every chart on every formula page gets:
        • silky entrance animation (1100 ms cubic ease-out)
        • per-element hover highlight + scaled point radii
        • rich monochrome tooltip with title icon, value formatter,
          smartFmt money/percent detection, multi-dataset support
        • dotted gridlines, axis tick padding, no chart-border
        • clean legend with circle markers
        • optional dataset-level `tooltipFormat` ('money'|'percent')
        • auto gradient fill for line charts when fill:true is set */
    FA.chart = function(canvasId, type, data, options){
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return null;
        }
        FA.destroyChart(canvasId);
        var el = document.getElementById(canvasId);
        if (!el) return null;
        var ctx = el.getContext('2d');

        /* Auto-apply vibrant colors + gradients to line datasets.
           Each dataset that doesn\'t specify a color picks the next
           palette color, and `fill:true` gets a matching gradient. */
        if (type === 'line' && data && data.datasets) {
            data.datasets.forEach(function(ds, i){
                var color = ds.borderColor;
                if (color === undefined) {
                    color = FA.PALETTE[i % FA.PALETTE.length];
                    ds.borderColor = color;
                }
                var rgb = FA.hexToRgb(color);
                if (ds.fill === true && ds.backgroundColor === undefined) {
                    ds.backgroundColor = function(c){
                        return FA.gradient(c.chart.ctx, c.chart.chartArea, 0.42, 0.02, rgb);
                    };
                }
                if (ds.tension === undefined)     ds.tension = 0.32;
                if (ds.pointRadius === undefined) ds.pointRadius = 0;
                if (ds.pointHoverRadius === undefined) ds.pointHoverRadius = 6;
                if (ds.pointHoverBackgroundColor === undefined) ds.pointHoverBackgroundColor = color;
                if (ds.pointHoverBorderColor === undefined) ds.pointHoverBorderColor = '#ffffff';
                if (ds.pointHoverBorderWidth === undefined) ds.pointHoverBorderWidth = 2;
                if (ds.borderWidth === undefined) ds.borderWidth = 2.8;
            });
        }
        if ((type === 'bar' || type === 'doughnut' || type === 'pie' || type === 'polarArea' || type === 'radar') && data && data.datasets) {
            data.datasets.forEach(function(ds, i){
                if (ds.backgroundColor === undefined) {
                    /* For pie/doughnut/polarArea: per-slice palette */
                    if (type === 'doughnut' || type === 'pie' || type === 'polarArea') {
                        ds.backgroundColor = FA.colors((data.labels || ds.data).length);
                    } else if (type === 'radar') {
                        var c = FA.PALETTE[i % FA.PALETTE.length];
                        ds.borderColor = ds.borderColor || c;
                        ds.backgroundColor = 'rgba(' + FA.hexToRgb(c) + ',0.20)';
                    } else {
                        /* bar: one color per dataset */
                        ds.backgroundColor = FA.PALETTE[i % FA.PALETTE.length];
                    }
                }
                if (ds.borderColor === undefined) ds.borderColor = '#ffffff';
                if (ds.borderWidth === undefined) ds.borderWidth = type === 'bar' ? 0 : 2;
                if (ds.hoverOffset === undefined && (type === 'doughnut' || type === 'pie')) ds.hoverOffset = 14;
                if (ds.hoverBorderColor === undefined) ds.hoverBorderColor = '#0a0a0a';
                if (ds.hoverBorderWidth === undefined) ds.hoverBorderWidth = type === 'bar' ? 1.5 : 3;
                if (type === 'bar' && ds.borderRadius === undefined) ds.borderRadius = 6;
            });
        }

        var defaults = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false, axis: 'x' },
            animation: {
                duration: 1100,
                easing: 'easeOutCubic'
            },
            animations: {
                tension:  { duration: 800, easing: 'easeOutCubic', from: 0.2, to: 0.32 },
                numbers:  { duration: 1100, easing: 'easeOutCubic' }
            },
            transitions: {
                active: { animation: { duration: 250 } }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#0a0a0a',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 8,
                        boxHeight: 8,
                        padding: 14,
                        font: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(10,10,10,0.96)',
                    titleColor: '#ffffff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(255,255,255,0.10)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 6,
                    titleFont: { weight: '700', size: 13 },
                    bodyFont:  { weight: '600', size: 12 },
                    callbacks: {
                        label: function(c){
                            var ds = c.dataset || {};
                            var hint = ds.tooltipFormat || ds.format || null;
                            var v = c.parsed && (c.parsed.y != null ? c.parsed.y : c.parsed);
                            var label = ds.label || c.label || '';
                            var fmt = FA.smartFmt(v, hint);
                            return (label ? label + ': ' : '') + fmt;
                        }
                    }
                }
            },
            scales: type === 'pie' || type === 'doughnut' || type === 'polarArea' || type === 'radar' ? undefined : {
                x: {
                    grid: { color: 'rgba(15,23,42,0.05)', drawBorder: false, borderDash: [3,3] },
                    ticks: { color: '#374151', font: { size: 11 }, padding: 6 }
                },
                y: {
                    grid: { color: 'rgba(15,23,42,0.05)', drawBorder: false, borderDash: [3,3] },
                    ticks: { color: '#374151', font: { size: 11 }, padding: 6 },
                    beginAtZero: true
                }
            }
        };
        /* Deep-merge for `plugins` so callers can add their own
           plugin options without clobbering defaults. */
        var merged = Object.assign({}, defaults, options || {});
        if (options && options.plugins) {
            merged.plugins = Object.assign({}, defaults.plugins, options.plugins);
            if (options.plugins.tooltip) {
                merged.plugins.tooltip = Object.assign({}, defaults.plugins.tooltip, options.plugins.tooltip);
                if (options.plugins.tooltip.callbacks) {
                    merged.plugins.tooltip.callbacks = Object.assign({}, defaults.plugins.tooltip.callbacks, options.plugins.tooltip.callbacks);
                }
            }
            if (options.plugins.legend) {
                merged.plugins.legend = Object.assign({}, defaults.plugins.legend, options.plugins.legend);
            }
        }
        CHARTS[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: merged
        });
        return CHARTS[canvasId];
    };

    /* ── Multi-chart dashboard helper ────────────────────────────
       Build N charts in a responsive grid from one declarative call:
         FA.dashboard('id_root', [
           { title: 'Allocation',  type: 'doughnut', data: {...} },
           { title: 'Trend',       type: 'line',     data: {...}, options: {...} },
           { title: 'By category', type: 'bar',      data: {...} }
         ]);
       Each card gets a title + canvas, all in a .fa-chart-grid. */
    FA.dashboard = function(rootId, charts){
        var root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return;
        var grid = document.createElement('div');
        grid.className = 'fa-chart-grid';
        root.innerHTML = '';
        root.appendChild(grid);
        charts.forEach(function(spec, i){
            var cell = document.createElement('div');
            cell.className = 'fa-chart-cell';
            var title = document.createElement('p');
            title.className = 'fa-chart-cell-title';
            title.textContent = spec.title || ('Chart ' + (i+1));
            var wrap = document.createElement('div');
            wrap.className = 'fa-chart-wrap';
            wrap.style.height = (spec.height || 260) + 'px';
            var canvasId = rootId + '_c' + i;
            var canvas = document.createElement('canvas');
            canvas.id = canvasId;
            wrap.appendChild(canvas);
            cell.appendChild(title);
            cell.appendChild(wrap);
            grid.appendChild(cell);
            /* Defer so the canvas has its computed size before
               Chart.js measures it. */
            requestAnimationFrame(function(){
                FA.chart(canvasId, spec.type, spec.data, spec.options || {});
            });
        });
    };

    /* ── Sparkline (small inline trend chart) ───────────────────── */
    FA.spark = function(canvasId, values, opts){
        opts = opts || {};
        var data = {
            labels: values.map(function(_, i){ return i; }),
            datasets: [{
                data: values,
                borderColor: opts.color || '#0a0a0a',
                borderWidth: opts.width || 2,
                fill: opts.fill !== false,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.32,
                tooltipFormat: opts.format || null
            }]
        };
        return FA.chart(canvasId, 'line', data, {
            plugins: {
                legend: { display: false },
                tooltip: { enabled: opts.tooltip !== false }
            },
            scales: { x: { display: false }, y: { display: false } }
        });
    };

    /* ── Dynamic row list (subscriptions / debts / line items) ─── */
    /* schema: array of { ph: placeholder, prefix?, suffix?, type? } */
    FA.addRow = function(containerId, schema, values){
        var host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!host) return null;
        var row = document.createElement('div');
        row.className = 'fa-row';
        var html = '';
        schema.forEach(function(col, i){
            html += '<div class="fa-input-wrap">';
            if (col.prefix) html += '<span class="fa-input-prefix">' + col.prefix + '</span>';
            var val = values && values[i] != null ? ('value="' + values[i] + '"') : '';
            html += '<input type="' + (col.type || 'text') + '" placeholder="' +
                    (col.ph || '') + '" ' + val + '>';
            if (col.suffix) html += '<span class="fa-input-suffix">' + col.suffix + '</span>';
            html += '</div>';
        });
        html += '<button type="button" class="fa-row-rm" aria-label="Remove row">&times;</button>';
        row.innerHTML = html;
        row.querySelector('.fa-row-rm').addEventListener('click', function(){
            row.parentNode.removeChild(row);
        });
        host.appendChild(row);
        return row;
    };
    /* read all rows: returns array of arrays of input string values */
    FA.readRows = function(containerId){
        var host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!host) return [];
        var out = [];
        Array.prototype.forEach.call(host.querySelectorAll('.fa-row'), function(row){
            var vals = [];
            Array.prototype.forEach.call(row.querySelectorAll('input'), function(inp){
                vals.push(inp.value);
            });
            out.push(vals);
        });
        return out;
    };

})();
