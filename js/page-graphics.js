/**
 * page-graphics.js — per-page decorative full-viewport canvas.
 *
 * Reads body.dataset.pageGraphics and dispatches to one of:
 *   aurora        — soft horizontal ribbons (work)
 *   constellation — stars + nearest-neighbor lines (academia)
 *   confetti      — slow falling rectangles (milestone)
 *   retro-stars   — 8-bit parallax star field (games)
 *   world-dots    — drifting world-map dots (map)
 *
 * If the attribute is missing or "none", nothing is rendered.
 */
(function () {
    "use strict";

    var theme = (document.body && document.body.dataset && document.body.dataset.pageGraphics) || "";
    if (!theme || theme === "none") return;

    var prefersReduced = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var canvas = document.createElement("canvas");
    canvas.id = "page-graphics-canvas";
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var rafId = 0;
    var frame = 0;

    function resize() {
        W = canvas.clientWidth = window.innerWidth;
        H = canvas.clientHeight = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (state && state.onResize) state.onResize();
    }

    var state = null;

    function startLoop(draw) {
        function tick() {
            if (document.hidden) {
                rafId = requestAnimationFrame(tick);
                return;
            }
            frame++;
            draw(frame);
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
    }

    /* ── aurora ─────────────────────────────────────────────── */
    function makeAurora() {
        var bands = [
            { y: 0.30, hue: 165, speed: 0.0006, amp: 60 },
            { y: 0.55, hue: 280, speed: 0.0009, amp: 80 },
            { y: 0.80, hue:  35, speed: 0.0012, amp: 50 }
        ];
        function draw(f) {
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = "lighter";
            for (var i = 0; i < bands.length; i++) {
                var b = bands[i];
                var grad = ctx.createLinearGradient(0, b.y * H - b.amp, 0, b.y * H + b.amp);
                grad.addColorStop(0, "hsla(" + b.hue + ", 80%, 65%, 0)");
                grad.addColorStop(0.5, "hsla(" + b.hue + ", 80%, 65%, 0.55)");
                grad.addColorStop(1, "hsla(" + b.hue + ", 80%, 65%, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(0, H);
                var t = f * b.speed;
                for (var x = 0; x <= W; x += 12) {
                    var y = b.y * H + Math.sin(x * 0.005 + t) * b.amp
                                    + Math.cos(x * 0.011 + t * 1.7) * b.amp * 0.45;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(W, H);
                ctx.closePath();
                ctx.fill();
            }
            ctx.globalCompositeOperation = "source-over";
        }
        return { draw: draw };
    }

    /* ── constellation ─────────────────────────────────────── */
    function makeConstellation() {
        var pts = [];
        function init() {
            var n = Math.max(40, Math.floor(W * H / 22000));
            pts = [];
            for (var i = 0; i < n; i++) {
                pts.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.18,
                    vy: (Math.random() - 0.5) * 0.18,
                    r: 1 + Math.random() * 1.6,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        function draw(f) {
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < pts.length; i++) {
                var p = pts[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
            }
            ctx.strokeStyle = "rgba(60, 90, 160, 0.18)";
            ctx.lineWidth = 1;
            for (var a = 0; a < pts.length; a++) {
                for (var b = a + 1; b < pts.length; b++) {
                    var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
                    var d2 = dx * dx + dy * dy;
                    if (d2 < 14400) {
                        var alpha = 1 - d2 / 14400;
                        ctx.strokeStyle = "rgba(60, 90, 160," + (alpha * 0.32).toFixed(3) + ")";
                        ctx.beginPath();
                        ctx.moveTo(pts[a].x, pts[a].y);
                        ctx.lineTo(pts[b].x, pts[b].y);
                        ctx.stroke();
                    }
                }
            }
            for (var k = 0; k < pts.length; k++) {
                var s = pts[k];
                var pulse = 0.6 + 0.4 * Math.sin(f * 0.04 + s.phase);
                ctx.fillStyle = "rgba(40, 70, 140," + (0.38 * pulse).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * (0.85 + 0.4 * pulse), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return { draw: draw, onResize: init, init: init };
    }

    /* ── confetti ──────────────────────────────────────────── */
    function makeConfetti() {
        var palette = ["#ff5959","#ff9d3a","#ffd166","#06d6a0","#118ab2","#9b5de5","#f15bb5","#00bbf9"];
        var bits = [];
        function init() {
            var n = Math.max(70, Math.floor(W * H / 14000));
            bits = [];
            for (var i = 0; i < n; i++) {
                bits.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    w: 4 + Math.random() * 6,
                    h: 8 + Math.random() * 10,
                    vy: 0.4 + Math.random() * 0.9,
                    vx: (Math.random() - 0.5) * 0.4,
                    rot: Math.random() * Math.PI * 2,
                    vr: (Math.random() - 0.5) * 0.06,
                    color: palette[(Math.random() * palette.length) | 0]
                });
            }
        }
        function draw() {
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < bits.length; i++) {
                var c = bits[i];
                c.x += c.vx;
                c.y += c.vy;
                c.rot += c.vr;
                if (c.y - 20 > H) { c.y = -20; c.x = Math.random() * W; }
                if (c.x < -20) c.x = W + 20;
                if (c.x > W + 20) c.x = -20;
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rot);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                ctx.restore();
            }
        }
        return { draw: draw, onResize: init, init: init };
    }

    /* ── retro-stars (3-layer parallax) ────────────────────── */
    function makeRetroStars() {
        var layers = [
            { count: 0, speed: 0.20, size: 1, alpha: 0.30, stars: [] },
            { count: 0, speed: 0.55, size: 2, alpha: 0.55, stars: [] },
            { count: 0, speed: 1.10, size: 3, alpha: 0.85, stars: [] }
        ];
        function init() {
            for (var i = 0; i < layers.length; i++) {
                var L = layers[i];
                L.count = Math.max(40, Math.floor(W * H / (24000 - i * 4000)));
                L.stars = [];
                for (var j = 0; j < L.count; j++) {
                    L.stars.push({ x: Math.random() * W, y: Math.random() * H });
                }
            }
        }
        function draw() {
            ctx.fillStyle = "rgba(8, 12, 28, 0.18)";
            ctx.fillRect(0, 0, W, H);
            for (var i = 0; i < layers.length; i++) {
                var L = layers[i];
                ctx.fillStyle = "rgba(255, 240, 180, " + L.alpha + ")";
                for (var j = 0; j < L.stars.length; j++) {
                    var s = L.stars[j];
                    s.x -= L.speed;
                    if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
                    ctx.fillRect(s.x | 0, s.y | 0, L.size, L.size);
                }
            }
        }
        return { draw: draw, onResize: init, init: init };
    }

    /* ── world-dots ───────────────────────────────────────── */
    function makeWorldDots() {
        var GRID = 26;
        var phase = 0;
        function draw(f) {
            ctx.clearRect(0, 0, W, H);
            phase = f * 0.012;
            for (var y = 0; y < H + GRID; y += GRID) {
                for (var x = 0; x < W + GRID; x += GRID) {
                    var dx = x - W / 2, dy = y - H / 2;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    var pulse = 0.5 + 0.5 * Math.sin(d * 0.012 - phase);
                    var alpha = (0.04 + pulse * 0.18).toFixed(3);
                    ctx.fillStyle = "rgba(60, 100, 200," + alpha + ")";
                    ctx.beginPath();
                    ctx.arc(x, y, 1.6 + pulse * 0.9, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        return { draw: draw };
    }

    var FACTORIES = {
        "aurora":        makeAurora,
        "constellation": makeConstellation,
        "confetti":      makeConfetti,
        "retro-stars":   makeRetroStars,
        "world-dots":    makeWorldDots
    };

    var factory = FACTORIES[theme];
    if (!factory) {
        console.warn("[page-graphics] unknown theme:", theme);
        return;
    }

    state = factory();
    resize();
    if (state.init) state.init();

    if (prefersReduced) {
        // Render one static frame then stop.
        if (state.draw) state.draw(0);
        return;
    }

    startLoop(state.draw);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            startLoop(state.draw);
        }
    });

    if (typeof console !== "undefined" && console.debug) {
        console.debug("[page-graphics] init", theme);
    }
})();
