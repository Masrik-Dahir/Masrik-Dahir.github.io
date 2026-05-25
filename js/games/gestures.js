/* ------------------------------------------------------------------
 * Touch-gesture controls for the games gallery.
 *
 * Replaces the on-screen mobile D-pad buttons with hand gestures:
 *   - Swipe left/right/up/down  → corresponding directional press
 *   - Quick tap                 → btn-up (universal "jump / fire /
 *                                 confirm" press, since that's what
 *                                 nearly every game already wires to
 *                                 the up button)
 *   - Long-press / hold-drag    → continuous directional press
 *                                 (mousedown held, mouseup on release)
 *
 * The original #btn-left / #btn-right / #btn-up / #btn-down buttons
 * are kept in the DOM (hidden via CSS) so the existing per-game
 * `bindMobile(...)` wiring continues to work — we just dispatch
 * synthetic MouseEvents at them. Programmatic dispatchEvent bypasses
 * CSS `display: none` and `pointer-events: none`.
 * ------------------------------------------------------------------ */
(function () {
    'use strict';

    var DIRS = ['left', 'right', 'up', 'down'];
    var SWIPE_THRESHOLD = 22;   // px before a touch counts as a swipe
    var DIAGONAL_RATIO  = 0.55; // min(ax,ay)/max(ax,ay) ≥ this → diagonal
    var TAP_MAX_DIST    = 18;   // px of movement still considered a tap
    var TAP_MAX_TIME    = 260;  // ms upper bound for a tap
    var TAP_PRESS_MS    = 90;   // synthetic btn-up press duration on tap

    var active   = { left: false, right: false, up: false, down: false };
    var startX = 0, startY = 0, startT = 0;
    var trackedId = null;
    var anchorX = 0, anchorY = 0;   // moving anchor for continuous direction

    function btn(dir) { return document.getElementById('btn-' + dir); }

    function dispatch(el, type) {
        if (!el) return;
        var ev;
        try {
            ev = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
        } catch (_) {
            ev = document.createEvent('MouseEvents');
            ev.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0,
                              false, false, false, false, 0, null);
        }
        el.dispatchEvent(ev);
    }

    function press(dir, on) {
        if (active[dir] === on) return;
        active[dir] = on;
        dispatch(btn(dir), on ? 'mousedown' : 'mouseup');
    }

    function releaseAll() {
        for (var i = 0; i < DIRS.length; i++) press(DIRS[i], false);
    }

    function applyDirection(dx, dy) {
        var ax = Math.abs(dx), ay = Math.abs(dy);
        if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) {
            releaseAll();
            return;
        }
        var diagonal = ax >= SWIPE_THRESHOLD && ay >= SWIPE_THRESHOLD &&
                       Math.min(ax, ay) / Math.max(ax, ay) >= DIAGONAL_RATIO;
        var goH = ax >= SWIPE_THRESHOLD && (diagonal || ax >= ay);
        var goV = ay >= SWIPE_THRESHOLD && (diagonal || ay >= ax);
        press('left',  goH && dx < 0);
        press('right', goH && dx > 0);
        press('up',    goV && dy < 0);
        press('down',  goV && dy > 0);
    }

    function quickPress(dir) {
        var el = btn(dir);
        if (!el) return;
        dispatch(el, 'mousedown');
        setTimeout(function () { dispatch(el, 'mouseup'); }, TAP_PRESS_MS);
    }

    function isInGameArea(target) {
        if (!target) return false;
        var view = document.getElementById('game-view');
        if (!view || view.style.display === 'none') return false;
        // Only handle gestures that land on the game canvas / wrapper
        // — leave nav, back-btn, HUD, etc. alone.
        if (target.closest && target.closest('#back-btn')) return false;
        if (target.closest && target.closest('#game-top-bar')) return false;
        return view.contains(target);
    }

    /* ---------------- touch handlers ---------------- */
    document.addEventListener('touchstart', function (e) {
        if (trackedId !== null) return;
        var t = e.changedTouches[0];
        if (!t || !isInGameArea(t.target)) return;
        trackedId = t.identifier;
        startX = anchorX = t.clientX;
        startY = anchorY = t.clientY;
        startT = Date.now();
        releaseAll();
    }, { passive: true, capture: true });

    document.addEventListener('touchmove', function (e) {
        if (trackedId === null) return;
        var t = null;
        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === trackedId) {
                t = e.changedTouches[i]; break;
            }
        }
        if (!t) return;
        // Direction is relative to a rolling anchor so the user can
        // change directions mid-touch without lifting the finger.
        var dx = t.clientX - anchorX;
        var dy = t.clientY - anchorY;
        applyDirection(dx, dy);

        // If a direction is firmly committed, slide the anchor along
        // the perpendicular axis so the OTHER axis can be re-triggered
        // by a new motion without releasing.
        var ax = Math.abs(dx), ay = Math.abs(dy);
        if (ax > SWIPE_THRESHOLD * 2) anchorX = t.clientX - (dx > 0 ? SWIPE_THRESHOLD : -SWIPE_THRESHOLD);
        if (ay > SWIPE_THRESHOLD * 2) anchorY = t.clientY - (dy > 0 ? SWIPE_THRESHOLD : -SWIPE_THRESHOLD);
    }, { passive: true, capture: true });

    function endTouch(e) {
        if (trackedId === null) return;
        var t = null;
        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === trackedId) {
                t = e.changedTouches[i]; break;
            }
        }
        var dx = t ? t.clientX - startX : 0;
        var dy = t ? t.clientY - startY : 0;
        var dur = Date.now() - startT;
        releaseAll();
        if (dur <= TAP_MAX_TIME &&
            Math.abs(dx) <= TAP_MAX_DIST &&
            Math.abs(dy) <= TAP_MAX_DIST) {
            // Treat as a tap → universal "action" press on btn-up.
            // Most games wire btn-up to jump/fire/confirm. Games that
            // don't bind btn-up simply ignore the synthetic event.
            quickPress('up');
        }
        trackedId = null;
    }

    document.addEventListener('touchend',    endTouch, { passive: true, capture: true });
    document.addEventListener('touchcancel', endTouch, { passive: true, capture: true });

    // Defensive: if the page is hidden mid-gesture (back button, tab
    // switch), make sure no button stays "stuck" down.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { releaseAll(); trackedId = null; }
    });
})();
