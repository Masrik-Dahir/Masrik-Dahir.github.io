/* expand_jquery.js
   Two responsibilities — gated so neither one fires on a page that
   doesn't need it:

   1. work.html collapse/extend toggle pairs
      Each pair: btnN (collapse) hides its target with slideUp,
      btnN+1 (extend) reveals it with slideDown. Targets are custom
      tag names (<p1>, <p34>, …) wrapping each section's card bodies.

   2. re.html left section nav (.fv-side-nav)
      Smooth-scrolls to the clicked section and tracks the active
      link based on scroll position. */
$(document).ready(function () {

    /* ── 1. Collapse / extend button pairs ───────────────────────
       Targets are <a> tags with no href, which iOS Safari and some
       mobile browsers don't recognise as clickable — so a tap never
       fires a `click` event. Bind via `pointerup` (covers mouse +
       touch + pen) and fall back to `click` for legacy browsers
       without PointerEvent. A 350 ms debounce guards against the
       synthetic click that follows a touch on hybrid devices. */
    var pairs = [
        { up: ".btn1",  down: ".btn2",  target: "p1"  },
        { up: ".btn3",  down: ".btn4",  target: "p34" },
        { up: ".btn5",  down: ".btn6",  target: "p56" },
        { up: ".btn7",  down: ".btn8",  target: "p78" },
        { up: ".btn9",  down: ".btn10", target: "p910"}
    ];
    var POINTER_OK = (typeof window !== 'undefined') && ('PointerEvent' in window);
    function bindTap($el, handler){
        var lock = 0;
        function fire(e){
            var now = Date.now();
            if (now - lock < 400) return;
            lock = now;
            handler(e);
        }
        if (POINTER_OK){
            $el.on('pointerup', function(e){
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                fire(e);
            });
        } else {
            $el.on('click touchend', function(e){
                if (e.type === 'touchend') e.preventDefault();
                fire(e);
            });
        }
    }
    pairs.forEach(function (pair) {
        bindTap($(pair.up),   function () { $(pair.target).slideUp();   });
        bindTap($(pair.down), function () { $(pair.target).slideDown(); });
    });

    /* ── 2. re.html side-nav ───────────────────────────────────── */
    var $links = $('.fv-side-link');
    if (!$links.length) return;

    function targetIdFor(a) {
        return $(a).attr('data-target') || ($(a).attr('href') || '').replace(/^#/, '');
    }

    /* Strip href so the browser's default anchor-jump can't compete
       with our scroll, and so middle-click doesn't open a new tab to
       a meaningless URL. Keep the link "feel" via cursor:pointer. */
    $links.each(function () {
        if (this.getAttribute('data-target')) this.removeAttribute('href');
        this.style.cursor = 'pointer';
    });

    $links.on('click', function (ev) {
        var id = targetIdFor(this);
        var sec = document.getElementById(id);
        if (!sec) return;
        ev.preventDefault();
        var startEl = document.scrollingElement || document.documentElement;
        var top = sec.getBoundingClientRect().top + startEl.scrollTop - 16;
        /* Try the native smooth scroll first; fall back to direct
           assignment if the browser ignores `behavior: 'smooth'`. */
        try {
            startEl.scrollTo({ top: top, behavior: 'smooth' });
        } catch (e) {
            startEl.scrollTop = top;
        }
        setTimeout(function () {
            if (Math.abs(startEl.scrollTop - top) > 4) startEl.scrollTop = top;
        }, 500);
        history.replaceState(null, '', '#' + id);
        $links.removeClass('fv-active');
        $(this).addClass('fv-active');
    });

    /* Highlight whichever section is closest to 30% of the viewport. */
    function updateActive() {
        var winMid = window.scrollY + window.innerHeight * 0.30;
        var best = null, bestDelta = Infinity;
        $links.each(function () {
            var sec = document.getElementById(targetIdFor(this));
            if (!sec) return;
            var top = sec.offsetTop;
            var bottom = top + sec.offsetHeight;
            if (winMid >= top && winMid <= bottom) {
                var delta = Math.abs(winMid - (top + bottom) / 2);
                if (delta < bestDelta) { bestDelta = delta; best = this; }
            }
        });
        if (!best) {
            $links.each(function () {
                var sec = document.getElementById(targetIdFor(this));
                if (!sec) return;
                var d = winMid - sec.offsetTop;
                if (d >= 0 && d < bestDelta) { bestDelta = d; best = this; }
            });
        }
        $links.removeClass('fv-active');
        if (best) $(best).addClass('fv-active');
    }

    $(window).on('scroll resize', updateActive);
    setTimeout(updateActive, 100);
    updateActive();
});
