/**
 * matrix.js — MONOCHROME CITY
 *
 * A continuously-running, video-like simulation of a living black/white/grey
 * city. Cranes rotate and lift loads. Cars drive. Pedestrians walk. Workers
 * hammer on scaffolding. Smoke rises from chimneys. Clouds drift.
 *
 * Three-layer rendering:
 *   staticBg  — sky, hills, distant silhouettes (drawn once)
 *   staticCity — completed buildings, road, sidewalk, trees, furniture (drawn once, updated on construction completion)
 *   dynamic   — cranes, vehicles, pedestrians, workers, birds, clouds, smoke, window lights (every frame)
 */
(function () {
    var canvas = document.getElementById('canv');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    /* offscreen layers */
    var bgCvs = document.createElement('canvas'), bgC = bgCvs.getContext('2d');
    var cityCvs = document.createElement('canvas'), cityC = cityCvs.getContext('2d');
    var dynCvs = document.createElement('canvas'), dynC = dynCvs.getContext('2d');
    var grainCvs = document.createElement('canvas'), grainC = grainCvs.getContext('2d');

    var W, H, GROUND, HORIZON, STREET_BOT, FORE_TOP, animId;
    var SIDEWALK_N, SIDEWALK_N_B, LANE_Y = [], CENTER_Y, SIDEWALK_S, SIDEWALK_S_B;

    function resize() {
        W = canvas.width = bgCvs.width = cityCvs.width = dynCvs.width = grainCvs.width = window.innerWidth;
        H = canvas.height = bgCvs.height = cityCvs.height = dynCvs.height = grainCvs.height = window.innerHeight;
        HORIZON = H * 0.28;
        GROUND = H * 0.76;
        STREET_BOT = H * 0.92;
        FORE_TOP = STREET_BOT;
        /* street layout */
        var roadH = STREET_BOT - GROUND;
        SIDEWALK_N = GROUND + 1;
        SIDEWALK_N_B = GROUND + roadH * 0.12;
        var laneStart = GROUND + roadH * 0.15;
        var laneH = roadH * 0.7 / 4;
        LANE_Y = [laneStart + laneH * 0.5, laneStart + laneH * 1.5, laneStart + laneH * 2.5, laneStart + laneH * 3.5];
        CENTER_Y = laneStart + laneH * 2;
        SIDEWALK_S = GROUND + roadH * 0.88;
        SIDEWALK_S_B = STREET_BOT;
        TRACK_Y = STREET_BOT + (H - STREET_BOT) * 0.2;
        /* waterfront layout */
        RIVER_TOP = STREET_BOT + (H - STREET_BOT) * 0.35;
        RIVER_BOT = H;
        BEACH_Y = RIVER_TOP - 2;
        LIGHTHOUSE_X = W * 0.92;
    }
    var RIVER_TOP, RIVER_BOT, BEACH_Y, LIGHTHOUSE_X;
    resize();

    /* ═══════════ CONFIG ═══════════ */
    var PAPER_BASE = 249;
    var MAX_VEHICLES = 22;
    var MAX_PEDS = 32;
    var MAX_CONSTRUCTIONS = 5;
    var MAX_CRANES = 5;
    var MAX_CLOUDS = 6;
    var MAX_FLOCKS = 3;
    var MAX_SMOKE = 35;
    var MAX_PLANES = 2;
    var MAX_HELIS = 2;
    var DAY_CYCLE = 600; /* seconds */
    var MAX_BOATS = 4;
    var MAX_BEACH = 8;
    var MAX_DOLPHINS = 2;
    var MAX_FISH = 12;

    /* ═══════════ SEEDED RNG ═══════════ */
    var seed = Date.now();
    function mulberry32(a) {
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    var layoutRng = mulberry32(seed);
    var behRng = mulberry32(seed ^ 0xBEEF);

    function lr(a, b) { return layoutRng() * (b - a) + a; }
    function lri(a, b) { return Math.floor(lr(a, b)); }
    function br(a, b) { return behRng() * (b - a) + a; }
    function bri(a, b) { return Math.floor(br(a, b)); }

    function weightedPick(items, weights) {
        var t = 0, i;
        for (i = 0; i < weights.length; i++) t += weights[i];
        var r = layoutRng() * t, acc = 0;
        for (i = 0; i < items.length; i++) { acc += weights[i]; if (r < acc) return items[i]; }
        return items[items.length - 1];
    }

    /* ═══════════ DRAWING UTILITIES ═══════════ */
    function hashJ(a, b) {
        var x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
        return (x - Math.floor(x)) - 0.5;
    }

    function stk(c, x1, y1, x2, y2, w, g, a, jit) {
        if (a === undefined) a = 1;
        if (jit === undefined) jit = 0.35;
        var jx1 = x1 + hashJ(x1, y1) * jit;
        var jy1 = y1 + hashJ(y1, x1) * jit;
        var jx2 = x2 + hashJ(x2, y2) * jit;
        var jy2 = y2 + hashJ(y2, x2) * jit;
        c.beginPath(); c.moveTo(jx1, jy1); c.lineTo(jx2, jy2);
        c.strokeStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + a + ')';
        c.lineWidth = w; c.lineCap = 'round'; c.stroke();
    }

    /* no-jitter variant for fills */
    function stkFlat(c, x1, y1, x2, y2, w, g, a) {
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
        c.strokeStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + (a || 1) + ')';
        c.lineWidth = w; c.lineCap = 'round'; c.stroke();
    }

    function arcStr(c, cx, cy, rx, ry, a1, a2, step, w, g, a) {
        for (var t = a1; t < a2; t += step) {
            var n = Math.min(t + step, a2);
            stk(c, cx + Math.cos(t) * rx, cy + Math.sin(t) * ry,
                cx + Math.cos(n) * rx, cy + Math.sin(n) * ry, w, g, a, 0.2);
        }
    }

    function rectStk(c, x, y, w, h, lw, g, a) {
        stk(c, x, y, x + w, y, lw, g, a); stk(c, x + w, y, x + w, y + h, lw, g, a);
        stk(c, x + w, y + h, x, y + h, lw, g, a); stk(c, x, y + h, x, y, lw, g, a);
    }

    function hatch(c, x, y, w, h, angle, sp, lw, g, a) {
        if (a === undefined) a = 1;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var d = Math.sqrt(w * w + h * h);
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        for (var t = -d; t < d * 2; t += sp) {
            var ox = x + w / 2 + t * cos, oy = y + h / 2 + t * sin;
            stk(c, ox - d * sin, oy + d * cos, ox + d * sin, oy - d * cos, lw, g, a, 0.15);
        }
        c.restore();
    }

    function stipple(c, x, y, w, h, count, r, g, a) {
        for (var i = 0; i < count; i++) {
            var px = x + layoutRng() * w, py = y + layoutRng() * h;
            stk(c, px, py, px + 0.3, py + 0.3, r, g, a || 1, 0);
        }
    }

    /* ═══════════ STATE ═══════════ */
    var buildings = [];
    var constructions = [];
    var cranes = [];
    var vehicles = [];
    var peds = [];
    var workers = [];
    var flocks = [];
    var clouds = [];
    var smokePuffs = [];
    var crosswalks = [];
    var chimneys = [];
    var litWindows = [];
    var planes = [];
    var helis = [];
    var trains = [];
    var boats = [];
    var beachPeople = [];
    var dolphins = [];
    var fish = [];
    var TRACK_Y = 0; /* computed on resize */
    var dayPhase = 0; /* 0..1 over DAY_CYCLE */

    /* ═══════════ BUILDING GENERATION ═══════════ */
    function generateLayout() {
        buildings = []; constructions = [];
        var x = lr(8, 25);
        var conCount = 0;
        while (x < W - 25) {
            var bw = Math.max(16, Math.min(70, lr(16, 65) * (W / 1400)));
            if (x + bw > W - 8) break;

            /* reserve some gaps for construction */
            if (layoutRng() < 0.22 && conCount < MAX_CONSTRUCTIONS && x > W * 0.08 && x < W * 0.88) {
                var cFloors = lri(8, 22), cFlH = lri(8, 13);
                constructions.push({
                    x: x, w: bw, floors: cFloors, floorH: cFlH,
                    h: cFloors * cFlH, y: GROUND - cFloors * cFlH,
                    curFloor: 0, buildTimer: 0,
                    floorInterval: lr(35, 80),
                    g: lri(65, 125), done: false,
                    scaffolding: false, workers: []
                });
                conCount++;
                x += bw + lr(5, 18);
                continue;
            }

            var floors = lri(4, 25);
            var centerBias = 1 - Math.abs(x / W - 0.5) * 1.6;
            floors = Math.max(4, Math.floor(floors * (0.4 + centerBias * 0.8)));
            var flH = lri(8, 13), bh = floors * flH;
            var style = weightedPick(
                ['block', 'setback', 'spire', 'wide', 'brownstone'],
                [0.4, 0.2, 0.15, 0.15, 0.1]);

            var chimney = layoutRng() < 0.12;
            buildings.push({
                x: x, w: bw, floors: floors, floorH: flH,
                h: bh, y: GROUND - bh, style: style,
                g: lri(55, 130),
                hasFireEscape: layoutRng() < 0.28,
                chimney: chimney,
                chimneyX: chimney ? x + lr(3, bw - 3) : 0
            });

            x += bw + lr(3, 14);
        }
    }

    /* ═══════════ DRAW A SINGLE BUILDING (to any ctx) ═══════════ */
    function drawBuilding(c, b) {
        var x = b.x, y = b.y, w = b.w, h = b.h, g = b.g;
        var floors = b.floors, flH = b.floorH;

        /* atmospheric perspective — farther up = lighter */
        var depthFade = Math.max(0, (GROUND - y) / (GROUND - HORIZON) * 0.35);
        var gAdj = Math.min(210, Math.floor(g + depthFade * 100));

        /* facade fill — hatching, not solid */
        hatch(c, x, y, w, h, Math.PI * 0.48, 2, 0.08, gAdj + 25, 0.5);

        /* brick texture for brick-style buildings */
        if (b.style === 'block' || b.style === 'brownstone') {
            for (var row = y + 1; row < y + h - 1; row += 2.8) {
                var off = (Math.floor(row / 2.8) % 2) * 3.5;
                for (var bx = x + 1 + off; bx < x + w - 1; bx += 7) {
                    stk(c, bx, row, bx, row + 2.3, 0.06, gAdj + 20, 0.4);
                }
                stk(c, x + 1, row, x + w - 1, row, 0.04, gAdj + 28, 0.3);
            }
        }

        /* floor lines */
        for (var f = 0; f <= floors; f++) {
            var fy = y + f * flH;
            stk(c, x, fy, x + w, fy, 0.25, gAdj - 10, 0.6);
        }

        /* outline */
        rectStk(c, x, y, w, h, 0.6, Math.max(30, gAdj - 35));

        /* windows */
        var winW = b.style === 'wide' ? Math.min(w - 6, lri(8, 14)) : lri(4, 7);
        var winH = flH - 3.5;
        var winGap = lri(2, 5);
        for (var f = 0; f < floors; f++) {
            var fy = y + f * flH + 1.8;
            for (var wx = x + 3; wx + winW < x + w - 2; wx += winW + winGap) {
                var wg = lri(165, 225);
                rectStk(c, wx, fy, winW, winH, 0.3, gAdj + 8, 0.8);
                /* glass — diagonal hatch */
                hatch(c, wx + 0.5, fy + 0.5, winW - 1, winH - 1, 0.78, 1.5, 0.06, wg, 0.35);
                /* sill */
                stk(c, wx - 0.4, fy + winH, wx + winW + 0.4, fy + winH, 0.4, gAdj - 8);
                /* mullion */
                if (winW > 5 && layoutRng() > 0.3) {
                    stk(c, wx + winW / 2, fy, wx + winW / 2, fy + winH, 0.12, gAdj + 5, 0.6);
                }
                /* occasional lit window marker (for dynamic overlay) */
                if (layoutRng() < 0.08) {
                    litWindows.push({ x: wx + 0.5, y: fy + 0.5, w: winW - 1, h: winH - 1,
                        phase: layoutRng() * Math.PI * 2, period: lr(20, 60) });
                }
            }
        }

        /* roof edge */
        stk(c, x - 1.5, y, x + w + 1.5, y, 1.2, gAdj - 25);
        /* parapet */
        stk(c, x - 1, y - 2.5, x + w + 1, y - 2.5, 0.5, gAdj - 5);
        stk(c, x - 1, y, x - 1, y - 2.5, 0.35, gAdj);
        stk(c, x + w + 1, y, x + w + 1, y - 2.5, 0.35, gAdj);

        /* rooftop equipment */
        if (layoutRng() > 0.55) {
            /* water tower */
            var wtx = x + lr(5, w - 15);
            rectStk(c, wtx, y - 13, 10, 8, 0.4, gAdj + 5);
            stk(c, wtx + 2, y - 5, wtx + 2, y - 2, 0.25, gAdj);
            stk(c, wtx + 8, y - 5, wtx + 8, y - 2, 0.25, gAdj);
            stk(c, wtx, y - 13, wtx + 5, y - 16, 0.35, gAdj + 5);
            stk(c, wtx + 10, y - 13, wtx + 5, y - 16, 0.35, gAdj + 5);
            stk(c, wtx, y - 10, wtx + 10, y - 10, 0.2, gAdj + 12);
        }
        if (layoutRng() > 0.5) {
            /* antenna */
            var ax = x + lr(3, w - 3), ah = lr(10, 28);
            stk(c, ax, y - 2, ax, y - 2 - ah, 0.35, gAdj + 12);
            for (var ay = y - 6; ay > y - 2 - ah; ay -= 7) {
                stk(c, ax - 2.5, ay, ax + 2.5, ay, 0.15, gAdj + 18);
            }
        }
        if (layoutRng() > 0.55) {
            /* AC units */
            for (var i = 0; i < lri(1, 3); i++) {
                var acx = x + lr(3, w - 10);
                rectStk(c, acx, y - 4.5, 6, 3.5, 0.35, gAdj + 18);
                arcStr(c, acx + 3, y - 2.5, 1.5, 1.5, 0, Math.PI * 2, 0.5, 0.15, gAdj + 25, 0.6);
            }
        }
        /* chimney */
        if (b.chimney) {
            var cx = b.chimneyX;
            rectStk(c, cx - 2, y - 10, 4, 10, 0.5, gAdj - 5);
            stk(c, cx - 2.5, y - 10, cx + 2.5, y - 10, 0.6, gAdj - 12);
            chimneys.push({ x: cx, y: y - 10 });
        }

        /* fire escape */
        if (b.hasFireEscape && floors > 3) {
            var fex = layoutRng() > 0.5 ? x + 1.5 : x + w - 7;
            for (var f = 1; f < floors; f++) {
                var fy = y + f * flH;
                rectStk(c, fex, fy - 0.8, 5.5, 1.2, 0.2, 48, 0.7);
                stk(c, fex + 1.5, fy + 0.5, fex + 1.5, fy + flH - 0.5, 0.12, 55, 0.6);
                stk(c, fex + 4, fy + 0.5, fex + 4, fy + flH - 0.5, 0.12, 55, 0.6);
                for (var ry = fy + 1.5; ry < fy + flH; ry += 2.2) {
                    stk(c, fex + 2, ry, fex + 3.5, ry, 0.1, 60, 0.5);
                }
            }
        }

        /* ground floor / storefront */
        var gfY = y + (floors - 1) * flH;
        /* awning */
        stk(c, x - 1.5, gfY + 1.2, x + w + 1.5, gfY + 1.2, 0.9, gAdj - 18);
        stk(c, x - 2, gfY + 3, x + w + 2, gfY + 3, 0.25, gAdj);
        for (var sx = x; sx < x + w; sx += 3.5) {
            stk(c, sx, gfY + 1.2, sx + 1.8, gfY + 3, 0.08, gAdj + 25, 0.5);
        }
        /* door */
        var dx = x + lr(w * 0.3, w * 0.65);
        rectStk(c, dx, gfY + 3.5, 5.5, flH - 4.5, 0.45, gAdj - 5);
        stk(c, dx + 4.5, gfY + flH * 0.55, dx + 4.5, gfY + flH * 0.55 + 1, 0.35, 100);
        /* display window */
        rectStk(c, x + 2.5, gfY + 3.5, dx - x - 4, flH - 4.5, 0.45, gAdj + 5, 0.8);
        hatch(c, x + 3, gfY + 4, dx - x - 5, flH - 6, 0.7, 2, 0.05, 200, 0.25);

        /* cornices every ~4 floors */
        for (var f = 0; f < floors; f += lri(3, 5)) {
            var fy = y + f * flH;
            stk(c, x - 1.2, fy, x + w + 1.2, fy, 0.65, gAdj - 12, 0.7);
        }
    }

    /* ═══════════ PAINT STATIC BACKGROUND ═══════════ */
    function paintBg() {
        var c = bgC;
        /* sky — subtle gradient via horizontal strokes */
        for (var y = 0; y < GROUND + 30; y += 1) {
            var g = y < HORIZON ? 248 - Math.floor((y / HORIZON) * 12) : 242;
            stkFlat(c, 0, y, W, y, 1.5, g);
        }
        /* sky hatching (very faint) */
        hatch(c, 0, 0, W, HORIZON, 0.15, 8, 0.06, 210, 0.08);

        /* distant hills */
        for (var x = 0; x < W; x += 2) {
            var hh = Math.sin(x * 0.003) * 28 + Math.sin(x * 0.0085) * 16 + Math.sin(x * 0.019) * 7;
            var nx = x + 2;
            var nh = Math.sin(nx * 0.003) * 28 + Math.sin(nx * 0.0085) * 16 + Math.sin(nx * 0.019) * 7;
            stk(c, x, HORIZON + hh, nx, HORIZON + nh, 0.4, 195, 0.7, 0.15);
        }
        /* hill fill below */
        for (var y = HORIZON - 25; y < HORIZON + 55; y += 2.5) {
            for (var x = 0; x < W; x += 3) {
                var hh = Math.sin(x * 0.003) * 28 + Math.sin(x * 0.0085) * 16 + Math.sin(x * 0.019) * 7;
                if (y > HORIZON + hh) {
                    stk(c, x, y, x + 3, y, 0.15, lri(200, 215), 0.35, 0.1);
                }
            }
        }

        /* distant building silhouettes */
        var far = HORIZON + 10;
        for (var x = 0; x < W; x += lr(8, 22)) {
            var fh = lr(10, 45);
            var fw = lr(5, 15);
            stkFlat(c, x, far - fh, x, far, fw, lri(185, 205), 0.25);
        }
    }

    /* ═══════════ PAINT STATIC CITY ═══════════ */
    function paintCity() {
        var c = cityC;
        c.clearRect(0, 0, W, H);

        /* draw all complete buildings */
        chimneys = []; litWindows = [];
        for (var i = 0; i < buildings.length; i++) drawBuilding(c, buildings[i]);

        /* north sidewalk */
        for (var x = 0; x < W; x += 1.5) {
            stkFlat(c, x, SIDEWALK_N, x, SIDEWALK_N_B, 1.2, lri(178, 192));
        }
        /* sidewalk cracks */
        for (var x = lr(20, 60); x < W; x += lr(30, 80)) {
            stk(c, x, SIDEWALK_N, x + lr(-3, 3), SIDEWALK_N_B, 0.08, 155, 0.5);
        }
        stk(c, 0, SIDEWALK_N_B, W, SIDEWALK_N_B, 0.8, 140); /* curb */

        /* road surface */
        for (var x = 0; x < W; x += 1.5) {
            stkFlat(c, x, SIDEWALK_N_B + 1, x, SIDEWALK_S - 1, 1.2, lri(130, 145));
        }
        /* road texture — subtle grain */
        for (var y = SIDEWALK_N_B + 2; y < SIDEWALK_S; y += 4) {
            for (var x = 0; x < W; x += lr(8, 20)) {
                stk(c, x, y, x + lr(1, 4), y + lr(-0.5, 0.5), 0.06, lri(115, 140), 0.3, 0.1);
            }
        }

        /* center line dashes */
        for (var x = 0; x < W; x += 28) {
            stk(c, x, CENTER_Y, x + 14, CENTER_Y, 1.2, 185, 0.8, 0);
        }

        /* crosswalks */
        crosswalks = [];
        for (var cx = lr(100, 200); cx < W; cx += lr(200, 380)) {
            crosswalks.push(cx);
            for (var stripe = 0; stripe < 5; stripe++) {
                var sy = SIDEWALK_N_B + 3 + stripe * (SIDEWALK_S - SIDEWALK_N_B - 6) / 5;
                stk(c, cx - 9, sy, cx + 9, sy, 2.5, 195, 0.65, 0);
            }
        }

        /* south sidewalk */
        for (var x = 0; x < W; x += 1.5) {
            stkFlat(c, x, SIDEWALK_S, x, SIDEWALK_S_B, 1.2, lri(178, 192));
        }
        stk(c, 0, SIDEWALK_S, W, SIDEWALK_S, 0.8, 140);

        /* street lamps */
        for (var x = lr(35, 75); x < W; x += lr(80, 150)) {
            stk(c, x, GROUND, x, GROUND - 26, 0.7, 52);
            stk(c, x - 5, GROUND - 26, x, GROUND - 28, 0.4, 56);
            stk(c, x, GROUND - 28, x + 5, GROUND - 26, 0.4, 56);
            arcStr(c, x, GROUND - 27, 2.5, 2, 0, Math.PI * 2, 0.45, 0.25, 215, 0.5);
        }

        /* fire hydrants */
        for (var x = lr(55, 120); x < W; x += lr(150, 280)) {
            stk(c, x, GROUND, x, GROUND - 5, 1.8, 55);
            stk(c, x - 2, GROUND - 5, x + 2, GROUND - 5, 0.8, 48);
            stk(c, x - 1.5, GROUND - 3, x + 1.5, GROUND - 3, 0.4, 60);
        }

        /* benches */
        for (var x = lr(100, 200); x < W; x += lr(200, 380)) {
            stk(c, x, GROUND - 1.2, x + 11, GROUND - 1.2, 0.5, 80);
            stk(c, x + 1, GROUND - 1.2, x + 1, GROUND, 0.35, 70);
            stk(c, x + 10, GROUND - 1.2, x + 10, GROUND, 0.35, 70);
            stk(c, x, GROUND - 1.2, x, GROUND - 4.5, 0.35, 70);
            stk(c, x + 11, GROUND - 1.2, x + 11, GROUND - 4.5, 0.35, 70);
            stk(c, x, GROUND - 4.5, x + 11, GROUND - 4.5, 0.4, 78);
        }

        /* trees */
        for (var x = lr(28, 70); x < W; x += lr(55, 130)) {
            var th = lr(10, 19);
            stk(c, x, GROUND, x, GROUND - th, 1.2, lri(55, 78));
            var cr = lr(5, 11);
            arcStr(c, x, GROUND - th - cr * 0.45, cr, cr * 0.65, 0, Math.PI * 2, 0.25, 0.35, lri(72, 95), 0.7);
            arcStr(c, x - cr * 0.3, GROUND - th - cr * 0.3, cr * 0.6, cr * 0.5, 0, Math.PI * 2, 0.3, 0.25, lri(78, 100), 0.5);
            arcStr(c, x + cr * 0.3, GROUND - th - cr * 0.35, cr * 0.55, cr * 0.45, 0, Math.PI * 2, 0.3, 0.25, lri(75, 98), 0.5);
            /* foliage stipple */
            stipple(c, x - cr, GROUND - th - cr, cr * 2, cr * 1.2, lri(8, 18), 0.3, lri(80, 105), 0.3);
        }

        /* trash cans */
        for (var x = lr(90, 180); x < W; x += lr(180, 320)) {
            rectStk(c, x, GROUND - 5, 3.5, 5, 0.35, 65);
            stk(c, x - 0.5, GROUND - 5, x + 4, GROUND - 5, 0.5, 55);
        }

        /* manholes */
        for (var x = lr(80, 160); x < W; x += lr(180, 320)) {
            arcStr(c, x, LANE_Y[1] + 3, 3.5, 2, 0, Math.PI * 2, 0.35, 0.25, 110, 0.5);
        }

        /* train tracks */
        var ty = TRACK_Y + 5;
        /* rails */
        stk(c, 0, ty, W, ty, 0.6, 90); stk(c, 0, ty + 5, W, ty + 5, 0.6, 90);
        /* ties */
        for (var tx = 0; tx < W; tx += 8) {
            stk(c, tx, ty - 1, tx, ty + 6, 1.2, lri(100, 120), 0.5, 0);
        }
        /* gravel bed */
        for (var tx = 0; tx < W; tx += 3) {
            stk(c, tx, ty + 7, tx + lr(1, 2), ty + 7 + lr(0, 1.5), 0.15, lri(140, 165), 0.4, 0.1);
        }

        /* ── WATERFRONT ── */
        /* beach / shoreline */
        for (var bx = 0; bx < W; bx += 1.5) {
            stkFlat(c, bx, BEACH_Y - 3, bx, RIVER_TOP, 1.2, lri(190, 210), 0.6);
        }
        /* sand texture */
        for (var bx = 0; bx < W; bx += lr(3, 8)) {
            stk(c, bx, BEACH_Y + lr(-3, 0), bx + lr(0.5, 2), BEACH_Y + lr(-3, 0), 0.1, lri(170, 195), 0.3, 0.1);
        }
        /* shoreline edge */
        for (var bx = 0; bx < W; bx += 2) {
            var wave = Math.sin(bx * 0.03) * 1.5 + Math.sin(bx * 0.08) * 0.8;
            stk(c, bx, RIVER_TOP + wave, bx + 2, RIVER_TOP + Math.sin((bx + 2) * 0.03) * 1.5 + Math.sin((bx + 2) * 0.08) * 0.8,
                0.4, 140, 0.5, 0.1);
        }

        /* river / water */
        for (var wy = RIVER_TOP; wy < RIVER_BOT; wy += 1.5) {
            var depth = (wy - RIVER_TOP) / (RIVER_BOT - RIVER_TOP);
            var wg = Math.floor(160 - depth * 40);
            stkFlat(c, 0, wy, W, wy, 1.5, wg, 0.5);
        }
        /* water ripple hatching */
        for (var wy = RIVER_TOP + 3; wy < RIVER_BOT - 2; wy += lr(4, 8)) {
            for (var wx = 0; wx < W; wx += lr(10, 30)) {
                var rw = lr(5, 18);
                stk(c, wx, wy, wx + rw, wy + lr(-0.5, 0.5), 0.08, lri(130, 165), 0.3, 0.1);
            }
        }

        /* bridge (arch bridge spanning ~30% of width) */
        var brX1 = W * 0.3, brX2 = W * 0.55;
        var brY = RIVER_TOP - 8;
        var brMid = (brX1 + brX2) / 2;
        var brSpan = brX2 - brX1;
        /* road deck */
        stk(c, brX1 - 5, brY, brX2 + 5, brY, 1.2, 70, 0.8);
        stk(c, brX1 - 5, brY + 3, brX2 + 5, brY + 3, 0.8, 75, 0.7);
        /* deck fill */
        for (var dx = brX1 - 4; dx < brX2 + 4; dx += 2) {
            stkFlat(c, dx, brY, dx, brY + 3, 1.5, lri(130, 150), 0.4);
        }
        /* arch underneath */
        for (var arch = 0; arch < 3; arch++) {
            var ax1 = brX1 + arch * brSpan / 3;
            var ax2 = brX1 + (arch + 1) * brSpan / 3;
            var amidx = (ax1 + ax2) / 2;
            arcStr(c, amidx, brY + 3, (ax2 - ax1) / 2, 12, 0, Math.PI, 0.15, 0.4, 65, 0.7);
        }
        /* piers / pylons */
        for (var pi = 0; pi <= 3; pi++) {
            var px = brX1 + pi * brSpan / 3;
            stk(c, px, brY + 3, px, RIVER_TOP + 8, 1, 60, 0.8, 0);
            stk(c, px - 2, RIVER_TOP + 8, px + 2, RIVER_TOP + 8, 0.5, 65, 0.6, 0);
        }
        /* railing */
        for (var rx = brX1 - 4; rx < brX2 + 4; rx += 5) {
            stk(c, rx, brY, rx, brY - 4, 0.2, 72, 0.5, 0);
        }
        stk(c, brX1 - 5, brY - 4, brX2 + 5, brY - 4, 0.3, 70, 0.5);

        /* lighthouse (right side) */
        var lhx = LIGHTHOUSE_X, lhy = RIVER_TOP;
        /* base / rock */
        arcStr(c, lhx, lhy + 2, 10, 4, Math.PI, Math.PI * 2, 0.2, 0.5, 95, 0.6);
        stk(c, lhx - 8, lhy + 2, lhx + 8, lhy + 2, 0.4, 90, 0.5);
        /* tower (tapers upward) */
        stk(c, lhx - 4, lhy, lhx - 2.5, lhy - 32, 0.6, 80);
        stk(c, lhx + 4, lhy, lhx + 2.5, lhy - 32, 0.6, 80);
        /* fill */
        for (var ly = lhy; ly > lhy - 32; ly -= 1.5) {
            var taper = 4 - (lhy - ly) / 32 * 1.5;
            stkFlat(c, lhx - taper, ly, lhx + taper, ly, 1, 210, 0.45);
        }
        /* horizontal bands */
        stk(c, lhx - 3.5, lhy - 10, lhx + 3.5, lhy - 10, 0.5, 75, 0.6);
        stk(c, lhx - 3, lhy - 20, lhx + 3, lhy - 20, 0.5, 75, 0.6);
        /* lantern room */
        rectStk(c, lhx - 3, lhy - 36, 6, 4, 0.4, 65);
        /* glass */
        stkFlat(c, lhx - 2, lhy - 35.5, lhx + 2, lhy - 35.5, 3, 180, 0.4);
        /* dome */
        arcStr(c, lhx, lhy - 36, 3.5, 3, Math.PI, Math.PI * 2, 0.25, 0.4, 70, 0.7);
        /* gallery rail */
        stk(c, lhx - 4, lhy - 32, lhx + 4, lhy - 32, 0.4, 72);
        for (var rx = lhx - 3.5; rx < lhx + 4; rx += 1.5) {
            stk(c, rx, lhy - 32, rx, lhy - 33.5, 0.12, 75, 0.5, 0);
        }
        stk(c, lhx - 4, lhy - 33.5, lhx + 4, lhy - 33.5, 0.25, 72, 0.5);

        /* beach umbrellas & towels (static detail) */
        for (var ux = lr(30, 80); ux < W * 0.85; ux += lr(50, 120)) {
            var uy = BEACH_Y + lr(-2, 0);
            /* umbrella pole */
            stk(c, ux, uy, ux, uy - 8, 0.35, 70, 0.6, 0);
            /* canopy arcs */
            arcStr(c, ux, uy - 8, 5, 2.5, Math.PI, Math.PI * 2, 0.25, 0.3, lri(90, 140), 0.5);
            stk(c, ux - 5, uy - 8, ux + 5, uy - 8, 0.25, lri(85, 130), 0.5);
            /* towel */
            stk(c, ux + lr(3, 7), uy, ux + lr(9, 14), uy, 1.5, lri(140, 180), 0.4, 0);
        }

        /* foreground haze */
        for (var y = FORE_TOP; y < RIVER_TOP; y += 1.5) {
            var ga = 0.02 + (y - FORE_TOP) / (RIVER_TOP - FORE_TOP) * 0.04;
            stkFlat(c, 0, y, W, y, 1.5, 230, ga);
        }
    }

    /* ═══════════ GRAIN & VIGNETTE ═══════════ */
    function makeGrain() {
        var id = grainC.createImageData(W, H);
        var d = id.data;
        for (var i = 0; i < d.length; i += 4) {
            var v = 180 + Math.floor(Math.random() * 60);
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
            d[i + 3] = Math.random() > 0.45 ? 7 : 0;
        }
        grainC.putImageData(id, 0, 0);
    }

    function drawVignette(c) {
        var g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.045)');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
    }

    /* ═══════════ CRANES ═══════════ */
    function createCrane(con) {
        var dir = layoutRng() > 0.5 ? 1 : -1;
        var cx = dir > 0 ? con.x + con.w + 8 : con.x - 8;
        var craneH = con.h + lr(35, 65);
        var jibLen = lr(45, 85);
        var cr = {
            x: cx, baseY: GROUND, height: craneH,
            jibLen: jibLen, counterLen: jibLen * 0.38,
            jibAngle: 0, targetAngle: 0,
            trolleyT: 0.5, targetTrolley: 0.5,
            hookDrop: 15, targetHook: 15,
            maxHook: craneH * 0.85,
            hasLoad: false, loadType: 0,
            g: lri(38, 72),
            conIdx: constructions.indexOf(con),
            actions: [], actionIdx: 0,
            pauseTimer: 0,
            pendulumAngle: 0, pendulumVel: 0,
            warningPhase: behRng() * Math.PI * 2
        };
        nextCraneActions(cr);
        return cr;
    }

    function nextCraneActions(cr) {
        var pickupAngle = br(-0.6, 0.6);
        var dropAngle = br(0.8, 2.4) * (behRng() > 0.5 ? 1 : -1);
        var pickupTrolley = br(0.55, 0.92);
        var dropTrolley = br(0.25, 0.65);
        var con = constructions[cr.conIdx];
        var dropH = con ? Math.max(15, (GROUND - con.y) * (1 - con.curFloor / con.floors) + 15) : 30;
        cr.loadType = bri(0, 4);
        cr.actions = [
            { type: 'slew', target: pickupAngle, speed: br(0.025, 0.05) },
            { type: 'trolley', target: pickupTrolley, speed: br(0.003, 0.006) },
            { type: 'hook', target: cr.maxHook, speed: br(0.6, 1.0) },
            { type: 'pause', dur: br(0.8, 2.0), attach: true },
            { type: 'hook', target: 18, speed: br(0.4, 0.65) },
            { type: 'slew', target: dropAngle, speed: br(0.02, 0.045) },
            { type: 'trolley', target: dropTrolley, speed: br(0.002, 0.005) },
            { type: 'hook', target: dropH, speed: br(0.4, 0.6) },
            { type: 'pause', dur: br(0.5, 1.2), attach: false },
            { type: 'hook', target: 18, speed: br(0.7, 1.0) }
        ];
        cr.actionIdx = 0;
        cr.pauseTimer = 0;
    }

    function updateCrane(cr, dt) {
        if (cr.actionIdx >= cr.actions.length) { nextCraneActions(cr); return; }
        var a = cr.actions[cr.actionIdx];
        var done = false;
        var spd = dt * 60;

        switch (a.type) {
            case 'slew':
                var diff = a.target - cr.jibAngle;
                var step = a.speed * spd;
                if (Math.abs(diff) < step) { cr.jibAngle = a.target; done = true; }
                else cr.jibAngle += (diff > 0 ? 1 : -1) * step;
                break;
            case 'trolley':
                var diff = a.target - cr.trolleyT;
                var step = a.speed * spd;
                if (Math.abs(diff) < step) { cr.trolleyT = a.target; done = true; }
                else cr.trolleyT += (diff > 0 ? 1 : -1) * step;
                break;
            case 'hook':
                var diff = a.target - cr.hookDrop;
                var step = a.speed * spd;
                if (Math.abs(diff) < step) { cr.hookDrop = a.target; done = true; }
                else cr.hookDrop += (diff > 0 ? 1 : -1) * step;
                /* pendulum on hook stop */
                if (done && cr.hasLoad) {
                    cr.pendulumVel = br(-0.04, 0.04);
                }
                break;
            case 'pause':
                cr.pauseTimer += dt;
                if (cr.pauseTimer >= a.dur) {
                    if (a.attach !== undefined) cr.hasLoad = a.attach;
                    cr.pauseTimer = 0;
                    done = true;
                }
                break;
        }
        /* pendulum damping */
        cr.pendulumAngle += cr.pendulumVel;
        cr.pendulumVel *= 0.985;
        cr.pendulumAngle *= 0.99;

        if (done) cr.actionIdx++;
        cr.warningPhase += dt * Math.PI;
    }

    function drawCrane(c, cr) {
        var x = cr.x, topY = cr.baseY - cr.height, g = cr.g;

        /* mast — lattice tower */
        stk(c, x - 2.5, cr.baseY, x - 2.5, topY, 1.2, g, 1, 0);
        stk(c, x + 2.5, cr.baseY, x + 2.5, topY, 1.2, g, 1, 0);
        for (var my = cr.baseY; my > topY + 5; my -= 8) {
            stk(c, x - 2.5, my, x + 2.5, my - 8, 0.15, g + 22, 0.7, 0);
            stk(c, x + 2.5, my, x - 2.5, my - 8, 0.15, g + 22, 0.7, 0);
            stk(c, x - 2.5, my, x + 2.5, my, 0.1, g + 18, 0.5, 0);
        }

        /* base / outriggers */
        stk(c, x - 10, cr.baseY, x + 10, cr.baseY, 1.8, g - 8, 1, 0);
        stk(c, x - 10, cr.baseY, x - 3, cr.baseY - 18, 0.5, g + 5, 0.8, 0);
        stk(c, x + 10, cr.baseY, x + 3, cr.baseY - 18, 0.5, g + 5, 0.8, 0);

        /* operator cab */
        c.fillStyle = 'rgba(' + (g + 28) + ',' + (g + 28) + ',' + (g + 28) + ',1)';
        c.fillRect(x - 4.5, topY - 1.5, 9, 7);
        rectStk(c, x - 4.5, topY - 1.5, 9, 7, 0.35, g, 1);
        /* window */
        c.fillStyle = 'rgba(195,195,200,0.8)';
        c.fillRect(x - 3, topY + 0.5, 6, 3.5);
        /* operator silhouette */
        stk(c, x, topY + 1.5, x, topY + 3.5, 0.6, g - 8, 0.6, 0);
        arcStr(c, x, topY + 1, 0.8, 0.8, 0, Math.PI * 2, 0.5, 0.25, g - 5, 0.6);

        /* cat head (peak) */
        var peakY = topY - 16;
        stk(c, x - 2, topY - 1.5, x, peakY, 0.6, g, 1, 0);
        stk(c, x + 2, topY - 1.5, x, peakY, 0.6, g, 1, 0);
        stk(c, x - 2, topY - 1.5, x + 2, topY - 1.5, 0.3, g + 10, 0.8, 0);

        /* jib rotation — cos(angle) for perspective foreshortening */
        var cosA = Math.cos(cr.jibAngle);
        var jibApp = cr.jibLen * cosA;
        var cjApp = cr.counterLen * cosA;
        var jibEndX = x + jibApp;
        var cjEndX = x - cjApp;

        /* jib (main arm) */
        stk(c, x, topY, jibEndX, topY, 0.9, g, 1, 0);
        stk(c, x, topY - 2.5, jibEndX, topY - 2.5, 0.4, g + 8, 0.9, 0);
        /* jib lattice */
        var absJib = Math.abs(jibApp);
        var steps = Math.max(1, Math.floor(absJib / 6));
        for (var i = 0; i < steps; i++) {
            var t1 = i / steps, t2 = (i + 1) / steps;
            var lx1 = x + jibApp * t1, lx2 = x + jibApp * t2;
            stk(c, lx1, topY, lx2, topY - 2.5, 0.08, g + 22, 0.6, 0);
            stk(c, lx1, topY - 2.5, lx2, topY, 0.08, g + 22, 0.6, 0);
        }

        /* counter-jib */
        stk(c, x, topY, cjEndX, topY, 0.8, g, 1, 0);
        stk(c, x, topY - 2.5, cjEndX, topY - 2.5, 0.35, g + 8, 0.9, 0);
        /* counterweight */
        var cwx = cjEndX;
        c.fillStyle = 'rgba(' + (g - 3) + ',' + (g - 3) + ',' + (g - 3) + ',0.9)';
        c.fillRect(cwx - 3, topY, 6, 5);

        /* pendant cables */
        stk(c, x, peakY, jibEndX, topY - 2.5, 0.2, g + 28, 0.6, 0);
        stk(c, x, peakY, cjEndX, topY - 2.5, 0.2, g + 28, 0.6, 0);

        /* trolley */
        var trolleyX = x + jibApp * cr.trolleyT;
        c.fillStyle = 'rgba(' + (g + 15) + ',' + (g + 15) + ',' + (g + 15) + ',1)';
        c.fillRect(trolleyX - 2, topY - 0.5, 4, 2);

        /* hoist cable + hook */
        var hookX = trolleyX + Math.sin(cr.pendulumAngle) * cr.hookDrop * 0.025;
        var hookY = topY + cr.hookDrop;
        stk(c, trolleyX, topY + 1.5, hookX, hookY, 0.3, g + 18, 0.8, 0);
        /* hook block */
        stk(c, hookX - 2, hookY, hookX + 2, hookY, 0.8, g, 1, 0);
        stk(c, hookX - 2, hookY, hookX - 2.5, hookY + 2.5, 0.4, g, 1, 0);
        stk(c, hookX + 2, hookY, hookX + 2.5, hookY + 2.5, 0.4, g, 1, 0);
        stk(c, hookX - 2.5, hookY + 2.5, hookX + 2.5, hookY + 2.5, 0.35, g, 1, 0);

        /* load */
        if (cr.hasLoad) {
            var lx = hookX + Math.sin(cr.pendulumAngle) * 1.5;
            if (cr.loadType === 0) { /* I-beam */
                stk(c, lx - 8, hookY + 3.5, lx + 8, hookY + 3.5, 1.4, g - 8, 1, 0);
                stk(c, lx - 8, hookY + 3.5, lx - 8, hookY + 5, 0.3, g, 0.8, 0);
                stk(c, lx + 8, hookY + 3.5, lx + 8, hookY + 5, 0.3, g, 0.8, 0);
            } else if (cr.loadType === 1) { /* rebar bundle */
                for (var r = 0; r < 5; r++) {
                    stk(c, lx - 6, hookY + 3 + r * 0.8, lx + 6, hookY + 3 + r * 0.8, 0.25, 65, 0.8, 0);
                }
            } else if (cr.loadType === 2) { /* concrete panel */
                rectStk(c, lx - 5, hookY + 3, 10, 7, 0.4, 140, 0.8);
            } else { /* pallet */
                rectStk(c, lx - 4, hookY + 3, 8, 4, 0.35, 80, 0.8);
                stk(c, lx - 3, hookY + 4, lx + 3, hookY + 4, 0.15, 100, 0.6, 0);
            }
            /* sling cables */
            stk(c, hookX - 1, hookY + 2.5, lx - 4, hookY + 3, 0.12, g + 22, 0.6, 0);
            stk(c, hookX + 1, hookY + 2.5, lx + 4, hookY + 3, 0.12, g + 22, 0.6, 0);
        }

        /* aircraft warning light at jib tip (subtle blink) */
        var warnG = 110 + Math.sin(cr.warningPhase) * 70;
        arcStr(c, jibEndX, topY - 2.5, 1, 1, 0, Math.PI * 2, 0.5, 0.3, Math.floor(warnG), 0.35);
    }

    /* ═══════════ CONSTRUCTION BUILDINGS ═══════════ */
    function drawConstruction(c, con) {
        if (con.done) return;
        var x = con.x, w = con.w, g = con.g;
        var builtH = con.curFloor * con.floorH;
        var topBuilt = GROUND - builtH;

        /* foundation pit */
        rectStk(c, x - 1, GROUND - 3, w + 2, 3, 0.5, g - 8, 0.6);
        hatch(c, x, GROUND - 2, w, 2, 0.4, 2, 0.08, g + 35, 0.3);

        /* steel frame for built floors */
        for (var f = 0; f < con.curFloor; f++) {
            var fy = GROUND - (f + 1) * con.floorH;
            /* columns */
            stk(c, x, fy + con.floorH, x, fy, 0.8, g - 8, 0.8, 0);
            stk(c, x + w, fy + con.floorH, x + w, fy, 0.8, g - 8, 0.8, 0);
            var nCols = Math.max(1, Math.floor(w / 18));
            for (var col = 1; col <= nCols; col++) {
                stk(c, x + w * col / (nCols + 1), fy + con.floorH, x + w * col / (nCols + 1), fy, 0.4, g, 0.7, 0);
            }
            /* beams */
            stk(c, x, fy, x + w, fy, 0.55, g - 5, 0.8);
            /* cross bracing on some floors */
            if (f % 3 === 0) {
                stk(c, x, fy, x + w * 0.4, fy + con.floorH, 0.15, g + 20, 0.4);
                stk(c, x + w, fy, x + w * 0.6, fy + con.floorH, 0.15, g + 20, 0.4);
            }
            /* floor fill (lower floors only — indicates concrete poured) */
            if (f < con.curFloor - 2) {
                for (var fx = x + 1; fx < x + w; fx += 2.5) {
                    stkFlat(c, fx, fy + 1, fx, fy + con.floorH - 1, 1.8, g + 38, 0.25);
                }
            }
        }

        /* scaffolding (once >50% built) */
        if (con.curFloor > con.floors * 0.4) {
            con.scaffolding = true;
            var scX = x - 4, scW = w + 8;
            for (var f = 0; f < con.curFloor; f++) {
                var fy = GROUND - (f + 1) * con.floorH;
                /* ledgers */
                stk(c, scX, fy, scX + scW, fy, 0.2, 75, 0.5);
                /* standards */
                stk(c, scX, fy, scX, fy + con.floorH, 0.2, 70, 0.5);
                stk(c, scX + scW, fy, scX + scW, fy + con.floorH, 0.2, 70, 0.5);
                /* X-brace */
                stk(c, scX, fy, scX + scW, fy + con.floorH, 0.08, 80, 0.3);
                stk(c, scX + scW, fy, scX, fy + con.floorH, 0.08, 80, 0.3);
                /* planks */
                stk(c, scX + 0.5, fy + 0.5, scX + scW - 0.5, fy + 0.5, 0.6, 85, 0.3, 0);
            }
            /* netting lines */
            for (var ny = topBuilt; ny < GROUND; ny += 3) {
                stk(c, scX, ny, scX + scW, ny, 0.04, 100, 0.15);
            }
        }

        /* ground-level construction site */
        /* safety barriers */
        stk(c, x - 6, GROUND - 6, x + w + 6, GROUND - 6, 0.35, 55, 0.5);
        stk(c, x - 6, GROUND - 4, x + w + 6, GROUND - 4, 0.35, 55, 0.5);
        for (var bx = x - 6; bx < x + w + 6; bx += 8) {
            stk(c, bx, GROUND, bx, GROUND - 7, 0.35, 48, 0.5, 0);
        }
    }

    function updateConstruction(con, dt) {
        if (con.done) return;
        con.buildTimer += dt;
        if (con.buildTimer >= con.floorInterval) {
            con.buildTimer = 0;
            con.curFloor++;
            if (con.curFloor >= con.floors) {
                con.done = true;
                /* promote to static city */
                var bld = {
                    x: con.x, w: con.w, floors: con.floors, floorH: con.floorH,
                    h: con.h, y: con.y, style: 'block',
                    g: con.g, hasFireEscape: behRng() < 0.3,
                    chimney: behRng() < 0.1,
                    chimneyX: con.x + br(3, con.w - 3)
                };
                buildings.push(bld);
                drawBuilding(cityC, bld);
            }
        }
    }

    /* ═══════════ VEHICLES ═══════════ */
    var VTYPES = [
        { n: 'sedan', w: 22, h: 8, cs: 0.2, ce: 0.68, wt: 0.35 },
        { n: 'hatch', w: 18, h: 7, cs: 0.22, ce: 0.65, wt: 0.15 },
        { n: 'truck', w: 30, h: 10, cs: 0.08, ce: 0.5, flat: true, wt: 0.15 },
        { n: 'bus', w: 40, h: 11, cs: 0.1, ce: 0.88, wt: 0.08 },
        { n: 'taxi', w: 22, h: 8, cs: 0.2, ce: 0.68, wt: 0.12 },
        { n: 'cmixer', w: 32, h: 12, cs: 0.08, ce: 0.45, flat: true, drum: true, wt: 0.05 },
        { n: 'dump', w: 28, h: 11, cs: 0.08, ce: 0.4, flat: true, wt: 0.05 },
        { n: 'bike', w: 10, h: 9, cs: 0.3, ce: 0.7, wt: 0.03 },
        { n: 'moto', w: 14, h: 7, cs: 0.25, ce: 0.7, wt: 0.02 }
    ];

    function createVehicle() {
        var lane = bri(0, 4);
        var dir = lane < 2 ? 1 : -1;
        var tp = weightedPick(VTYPES, VTYPES.map(function (t) { return t.wt; }));
        var speed = br(25, 55); /* px/s */
        if (tp.n === 'bus' || tp.n === 'cmixer' || tp.n === 'dump') speed = br(18, 35);
        if (tp.n === 'bike') speed = br(14, 22);
        if (tp.n === 'moto') speed = br(35, 55);
        return {
            x: dir > 0 ? -tp.w - 10 : W + 10,
            y: LANE_Y[lane], lane: lane, dir: dir,
            tp: tp, speed: speed, g: bri(35, 120),
            wheelAngle: 0, alive: true,
            drumAngle: 0
        };
    }

    function updateVehicle(v, dt) {
        v.x += v.dir * v.speed * dt;
        v.wheelAngle += v.speed * dt * 0.18;
        if (v.tp.drum) v.drumAngle += dt * 1.2;

        /* simple collision avoidance */
        for (var i = 0; i < vehicles.length; i++) {
            var o = vehicles[i];
            if (o === v || o.lane !== v.lane) continue;
            var dist = (o.x - v.x) * v.dir;
            if (dist > 0 && dist < 45) {
                v.speed = Math.max(5, o.speed * 0.9);
            }
        }

        if ((v.dir > 0 && v.x > W + 50) || (v.dir < 0 && v.x < -50)) v.alive = false;
    }

    function drawVehicle(c, v) {
        var x = v.x, y = v.y, d = v.dir, g = v.g, tp = v.tp;
        var w = tp.w * d, h = tp.h;

        /* body */
        stk(c, x, y, x + w, y, h * 0.5, g, 1, 0);
        /* outline */
        stk(c, x, y - h * 0.25, x + w, y - h * 0.25, 0.35, g - 15, 0.8, 0);
        stk(c, x, y + h * 0.25, x + w, y + h * 0.25, 0.35, g - 15, 0.8, 0);

        /* cabin (if not flat-top) */
        if (!tp.flat) {
            var cs = tp.cs, ce = tp.ce;
            stk(c, x + w * cs, y - h * 0.38, x + w * ce, y - h * 0.38, h * 0.25, g + 14, 1, 0);
            /* windshield */
            stk(c, x + w * cs, y - h * 0.25, x + w * (cs + 0.08), y - h * 0.05, 0.3, 145, 0.7, 0);
        } else {
            /* truck bed / flatbed */
            stk(c, x + w * tp.ce, y - h * 0.2, x + w * 0.95, y - h * 0.2, 0.3, g - 10, 0.7, 0);
        }

        /* cement mixer drum */
        if (tp.drum) {
            var dcx = x + w * 0.6, dcy = y - h * 0.15;
            var dr = h * 0.3;
            arcStr(c, dcx, dcy, dr * 1.3, dr, 0, Math.PI * 2, 0.3, 0.3, g + 20, 0.7);
            /* spiral ridges */
            for (var r = 0; r < 3; r++) {
                var a = v.drumAngle + r * Math.PI * 2 / 3;
                stk(c, dcx + Math.cos(a) * dr * 1.1, dcy + Math.sin(a) * dr * 0.8,
                    dcx + Math.cos(a + 0.6) * dr * 0.8, dcy + Math.sin(a + 0.6) * dr * 0.6, 0.15, g + 30, 0.5, 0);
            }
        }

        /* wheels */
        var wy = y + h * 0.28;
        var wr = h * 0.2;
        var wx1 = x + w * 0.2, wx2 = x + w * 0.8;
        arcStr(c, wx1, wy, wr, wr, 0, Math.PI * 2, 0.4, 0.35, 32, 0.9);
        arcStr(c, wx2, wy, wr, wr, 0, Math.PI * 2, 0.4, 0.35, 32, 0.9);
        /* spokes */
        for (var s = 0; s < 4; s++) {
            var a = v.wheelAngle + s * Math.PI / 2;
            stk(c, wx1 + Math.cos(a) * wr * 0.7, wy + Math.sin(a) * wr * 0.7,
                wx1 - Math.cos(a) * wr * 0.7, wy - Math.sin(a) * wr * 0.7, 0.1, 42, 0.6, 0);
            stk(c, wx2 + Math.cos(a) * wr * 0.7, wy + Math.sin(a) * wr * 0.7,
                wx2 - Math.cos(a) * wr * 0.7, wy - Math.sin(a) * wr * 0.7, 0.1, 42, 0.6, 0);
        }

        /* undercarriage shadow */
        stk(c, x + w * 0.08, y + h * 0.32, x + w * 0.92, y + h * 0.32, 0.25, 135, 0.35, 0);
    }

    /* ═══════════ PEDESTRIANS ═══════════ */
    function createPedestrian(far) {
        var dir = behRng() > 0.5 ? 1 : -1;
        var sidewalkY = far ? SIDEWALK_S - 2 : SIDEWALK_N_B - 2;
        var scale = far ? 0.75 : 1;
        var speed = br(9, 21); /* px/s */
        return {
            x: dir > 0 ? -10 : W + 10,
            y: sidewalkY, dir: dir,
            speed: speed, scale: scale,
            g: bri(35, 80) + (far ? 25 : 0),
            walkPhase: 0, phaseTimer: 0,
            phaseDur: 9 / speed,
            pauseTimer: 0, paused: false,
            alive: true, far: far,
            crossing: false, crossTarget: 0
        };
    }

    function updatePedestrian(p, dt) {
        if (p.paused) {
            p.pauseTimer -= dt;
            if (p.pauseTimer <= 0) p.paused = false;
            return;
        }

        if (p.crossing) {
            /* walk vertically */
            var dy = p.crossTarget - p.y;
            if (Math.abs(dy) < 2) {
                p.crossing = false;
                p.y = p.crossTarget;
                p.far = !p.far;
                p.scale = p.far ? 0.75 : 1;
                p.g = bri(35, 80) + (p.far ? 25 : 0);
            } else {
                p.y += (dy > 0 ? 1 : -1) * p.speed * 0.6 * dt;
            }
        } else {
            p.x += p.dir * p.speed * dt;
        }

        /* walk cycle */
        p.phaseTimer += dt;
        if (p.phaseTimer >= p.phaseDur) {
            p.phaseTimer = 0;
            p.walkPhase = (p.walkPhase + 1) % 4;
        }

        /* random pause */
        if (!p.crossing && behRng() < 0.0003) {
            p.paused = true; p.pauseTimer = br(2, 5);
        }
        /* random crossing at crosswalks */
        if (!p.crossing && behRng() < 0.0006) {
            for (var i = 0; i < crosswalks.length; i++) {
                if (Math.abs(p.x - crosswalks[i]) < 12) {
                    p.crossing = true;
                    p.crossTarget = p.far ? SIDEWALK_N_B - 2 : SIDEWALK_S - 2;
                    break;
                }
            }
        }

        if ((p.dir > 0 && p.x > W + 20) || (p.dir < 0 && p.x < -20)) p.alive = false;
    }

    function drawPedestrian(c, p) {
        var x = p.x, y = p.y, g = p.g, s = p.scale;
        var h = 10 * s;
        var ph = p.walkPhase;
        var bob = (ph === 1 || ph === 3) ? -0.4 * s : 0;

        /* head */
        arcStr(c, x, y - h + bob, 1.4 * s, 1.4 * s, 0, Math.PI * 2, 0.45, 0.25 * s, g, 0.9);
        /* body */
        stk(c, x, y - h + 2.2 * s + bob, x, y - h * 0.38, 0.35 * s, g, 0.9, 0);
        /* legs */
        var legBase = y - h * 0.38;
        var stride = (ph === 0 || ph === 2) ? 1.5 * s : 0.3 * s;
        var legDir = (ph === 0) ? 1 : (ph === 2) ? -1 : 0;
        stk(c, x, legBase, x + legDir * stride * p.dir, y, 0.25 * s, g, 0.85, 0);
        stk(c, x, legBase, x - legDir * stride * p.dir, y, 0.25 * s, g + 12, 0.75, 0);
        /* arms */
        var armBase = y - h + 3.2 * s + bob;
        var armSwing = (ph === 0 || ph === 2) ? 2 * s : 0.5 * s;
        var armDir = (ph === 0) ? -1 : 1;
        stk(c, x, armBase, x + armDir * armSwing * p.dir * 0.5, armBase + 2 * s, 0.2 * s, g, 0.7, 0);
        stk(c, x, armBase, x - armDir * armSwing * p.dir * 0.5, armBase + 2 * s, 0.2 * s, g, 0.7, 0);
    }

    /* ═══════════ WORKERS ═══════════ */
    function createWorker(con) {
        var floor = Math.max(0, con.curFloor - bri(1, 3));
        var fy = GROUND - (floor + 1) * con.floorH;
        return {
            x: con.x + br(3, con.w - 3),
            y: fy + con.floorH,
            baseY: fy + con.floorH,
            conIdx: constructions.indexOf(con),
            g: bri(35, 65), scale: 0.85,
            dir: behRng() > 0.5 ? 1 : -1,
            speed: br(4, 10),
            walkPhase: 0, phaseTimer: 0,
            phaseDur: 0.4,
            state: 'walking', /* walking | hammering | welding | idle */
            stateTimer: br(4, 15),
            hammerTimer: 0, hammerDown: false,
            alive: true
        };
    }

    function updateWorker(w, dt) {
        var con = constructions[w.conIdx];
        if (!con || con.done) { w.alive = false; return; }

        w.stateTimer -= dt;
        if (w.stateTimer <= 0) {
            var states = ['walking', 'hammering', 'welding', 'idle'];
            w.state = states[bri(0, states.length)];
            w.stateTimer = br(5, 18);
        }

        if (w.state === 'walking') {
            w.x += w.dir * w.speed * dt;
            if (w.x < con.x + 2 || w.x > con.x + con.w - 2) w.dir = -w.dir;
            w.phaseTimer += dt;
            if (w.phaseTimer > w.phaseDur) { w.phaseTimer = 0; w.walkPhase = (w.walkPhase + 1) % 4; }
        } else if (w.state === 'hammering') {
            w.hammerTimer += dt;
            if (w.hammerTimer > 0.4) { w.hammerTimer = 0; w.hammerDown = !w.hammerDown; }
        }

        /* update floor position */
        var floor = Math.min(con.curFloor - 1, Math.max(0, Math.floor((GROUND - w.baseY) / con.floorH)));
        if (con.curFloor > 0 && behRng() < 0.001) {
            floor = Math.max(0, con.curFloor - bri(1, 3));
            w.baseY = GROUND - (floor + 1) * con.floorH + con.floorH;
            w.y = w.baseY;
        }
    }

    function drawWorker(c, w) {
        var x = w.x, y = w.y, g = w.g, s = w.scale;
        var h = 9 * s;
        var ph = w.state === 'walking' ? w.walkPhase : 0;

        /* hard hat */
        arcStr(c, x, y - h - 0.5, 2 * s, 1 * s, Math.PI, Math.PI * 2, 0.3, 0.35 * s, 50, 0.9);
        /* head */
        arcStr(c, x, y - h + 0.5, 1.2 * s, 1.2 * s, 0, Math.PI * 2, 0.45, 0.2 * s, g, 0.8);
        /* body */
        stk(c, x, y - h + 2 * s, x, y - h * 0.38, 0.35 * s, g, 0.85, 0);
        /* vest X */
        var vy = y - h + 2.5 * s;
        stk(c, x - 1 * s, vy, x + 1 * s, vy + 2.5 * s, 0.15, 130, 0.6, 0);
        stk(c, x + 1 * s, vy, x - 1 * s, vy + 2.5 * s, 0.15, 130, 0.6, 0);
        /* legs */
        var legBase = y - h * 0.38;
        var stride = (ph === 0 || ph === 2) ? 1.2 * s : 0.2 * s;
        var legDir = ph === 0 ? 1 : (ph === 2 ? -1 : 0);
        stk(c, x, legBase, x + legDir * stride, y, 0.25 * s, g, 0.8, 0);
        stk(c, x, legBase, x - legDir * stride, y, 0.25 * s, g + 10, 0.7, 0);
        /* arms + state */
        var armY = y - h + 3 * s;
        if (w.state === 'hammering') {
            var hamY = w.hammerDown ? armY + 3 * s : armY + 1 * s;
            stk(c, x, armY, x + 2 * s, hamY, 0.2 * s, g, 0.8, 0);
            stk(c, x + 2 * s, hamY, x + 2.5 * s, hamY + 1 * s, 0.3, 55, 0.8, 0);
            stk(c, x, armY, x - 1.5 * s, armY + 2 * s, 0.2 * s, g, 0.7, 0);
            if (w.hammerDown) {
                stk(c, x + 2.5 * s, hamY + 1 * s, x + 3 * s, hamY + 1.5 * s, 0.15, 90, 0.5, 0);
            }
        } else if (w.state === 'welding') {
            stk(c, x, armY, x + 2 * s, armY + 2 * s, 0.2 * s, g, 0.8, 0);
            stk(c, x, armY, x - 1.5 * s, armY + 1 * s, 0.2 * s, g, 0.7, 0);
            /* sparks */
            if (Math.random() > 0.4) {
                for (var sp = 0; sp < 4; sp++) {
                    var sx = x + 2 * s + br(-2, 2), sy = armY + 2 * s + br(-2, 2);
                    stk(c, sx, sy, sx + br(-1, 1), sy + br(-1, 1), 0.2, 200, 0.7, 0);
                }
            }
        } else {
            stk(c, x, armY, x + 1.5 * s, armY + 2 * s, 0.2 * s, g, 0.7, 0);
            stk(c, x, armY, x - 1.5 * s, armY + 2 * s, 0.2 * s, g, 0.7, 0);
        }
    }

    /* ═══════════ BIRDS ═══════════ */
    function createFlock() {
        var n = bri(5, 12);
        var birds = [];
        var fx = br(-50, W * 0.3), fy = br(25, HORIZON * 0.7);
        var speed = br(18, 36);
        for (var i = 0; i < n; i++) {
            birds.push({ ox: br(-12, 12), oy: br(-8, 8), flapPhase: br(0, Math.PI * 2) });
        }
        return { x: fx, y: fy, speed: speed, birds: birds, alive: true, sinePhase: br(0, Math.PI * 2) };
    }

    function updateFlock(f, dt) {
        f.x += f.speed * dt;
        f.sinePhase += dt * 0.5;
        f.y += Math.sin(f.sinePhase) * 0.15;
        for (var i = 0; i < f.birds.length; i++) {
            f.birds[i].flapPhase += dt * 12;
            f.birds[i].ox += br(-0.1, 0.1);
            f.birds[i].oy += br(-0.1, 0.1);
        }
        if (f.x > W + 80) f.alive = false;
    }

    function drawFlock(c, f) {
        for (var i = 0; i < f.birds.length; i++) {
            var b = f.birds[i];
            var bx = f.x + b.ox, by = f.y + b.oy;
            var wing = Math.sin(b.flapPhase) * 2.5;
            stk(c, bx - 3, by + wing, bx, by, 0.25, 62, 0.7, 0);
            stk(c, bx + 3, by + wing, bx, by, 0.25, 62, 0.7, 0);
        }
    }

    /* ═══════════ CLOUDS ═══════════ */
    function createCloud() {
        var cx = br(-100, W + 100), cy = br(20, HORIZON * 0.65);
        var np = bri(3, 6);
        var puffs = [];
        for (var i = 0; i < np; i++) {
            puffs.push({ ox: br(-20, 20), oy: br(-5, 5), rx: br(12, 30), ry: br(6, 14) });
        }
        return { x: cx, y: cy, speed: br(1.2, 3), puffs: puffs };
    }

    function updateCloud(cl, dt) {
        cl.x += cl.speed * dt;
        if (cl.x > W + 120) cl.x = -100;
    }

    function drawCloud(c, cl) {
        for (var i = 0; i < cl.puffs.length; i++) {
            var p = cl.puffs[i];
            arcStr(c, cl.x + p.ox, cl.y + p.oy, p.rx, p.ry, 0, Math.PI * 2, 0.28, 0.15, 205, 0.2);
            /* interior stipple */
            stipple(c, cl.x + p.ox - p.rx * 0.6, cl.y + p.oy - p.ry * 0.5,
                p.rx * 1.2, p.ry, Math.floor(p.rx * 0.4), 0.2, 218, 0.15);
        }
        /* flat bottom */
        var maxR = 0, minOx = 999, maxOx = -999;
        for (var i = 0; i < cl.puffs.length; i++) {
            if (cl.puffs[i].oy + cl.puffs[i].ry > maxR) maxR = cl.puffs[i].oy + cl.puffs[i].ry;
            minOx = Math.min(minOx, cl.puffs[i].ox - cl.puffs[i].rx);
            maxOx = Math.max(maxOx, cl.puffs[i].ox + cl.puffs[i].rx);
        }
        stk(c, cl.x + minOx, cl.y + maxR, cl.x + maxOx, cl.y + maxR, 0.2, 188, 0.25, 0);
    }

    /* ═══════════ SMOKE ═══════════ */
    function createSmokePuff(cx, cy) {
        return { x: cx + br(-1, 1), y: cy, startY: cy, age: 0, maxAge: br(3, 6), speed: br(10, 20), g: bri(170, 195), alive: true };
    }

    function updateSmoke(p, dt) {
        p.age += dt;
        p.y -= p.speed * dt;
        p.x += Math.sin(p.age * 2 + p.startY) * 0.3;
        if (p.age >= p.maxAge) p.alive = false;
    }

    function drawSmoke(c, p) {
        var alpha = Math.max(0, 1 - p.age / p.maxAge) * 0.35;
        var r = 2 + p.age * 2.2;
        arcStr(c, p.x, p.y, r, r * 0.8, 0, Math.PI * 2, 0.35, 0.15, p.g, alpha);
    }

    /* ═══════════ SUN & MOON ═══════════ */
    function drawSunMoon(c, now) {
        var nightAmt = getDayAlpha();
        /* sun arc across sky: dayPhase 0→1, sun goes left→right */
        var sunAngle = dayPhase * Math.PI * 2 - Math.PI / 2;
        var sunX = W * 0.5 + Math.cos(sunAngle) * W * 0.42;
        var sunY = HORIZON * 0.45 - Math.sin(sunAngle) * HORIZON * 0.35;

        /* draw sun when above horizon and daytime */
        if (nightAmt < 0.7 && sunY < HORIZON + 20) {
            var sunR = Math.min(W, H) * 0.022;
            var sunG = Math.floor(210 - nightAmt * 60);
            /* disc via hatched arcs */
            arcStr(c, sunX, sunY, sunR, sunR, 0, Math.PI * 2, 0.2, 0.35, sunG, 0.6);
            arcStr(c, sunX, sunY, sunR * 0.7, sunR * 0.7, 0, Math.PI * 2, 0.25, 0.25, sunG, 0.5);
            arcStr(c, sunX, sunY, sunR * 0.4, sunR * 0.4, 0, Math.PI * 2, 0.3, 0.2, sunG, 0.4);
            /* rays */
            for (var r = 0; r < 12; r++) {
                var a = r * Math.PI / 6 + now * 0.00003;
                var inner = sunR * 1.2, outer = sunR * 1.8;
                stk(c, sunX + Math.cos(a) * inner, sunY + Math.sin(a) * inner,
                    sunX + Math.cos(a) * outer, sunY + Math.sin(a) * outer, 0.12, sunG, 0.3, 0);
            }
        }

        /* moon — opposite side of sun */
        var moonAngle = sunAngle + Math.PI;
        var moonX = W * 0.5 + Math.cos(moonAngle) * W * 0.42;
        var moonY = HORIZON * 0.45 - Math.sin(moonAngle) * HORIZON * 0.35;

        if (nightAmt > 0.3 && moonY < HORIZON + 20) {
            var moonR = Math.min(W, H) * 0.018;
            var moonG = Math.floor(195 + nightAmt * 30);
            /* crescent: full circle then dark "bite" offset */
            arcStr(c, moonX, moonY, moonR, moonR, 0, Math.PI * 2, 0.18, 0.3, moonG, 0.55);
            /* inner shadow arc to create crescent */
            arcStr(c, moonX + moonR * 0.35, moonY - moonR * 0.1, moonR * 0.85, moonR * 0.85,
                0, Math.PI * 2, 0.2, 0.25, Math.floor(PAPER_BASE - nightAmt * 18), 0.55);
            /* stipple for lunar texture */
            for (var s = 0; s < 6; s++) {
                var sx = moonX + br(-moonR * 0.4, moonR * 0.1);
                var sy = moonY + br(-moonR * 0.5, moonR * 0.5);
                stk(c, sx, sy, sx + 0.4, sy + 0.4, 0.2, moonG - 15, 0.3, 0);
            }
        }
    }

    /* ═══════════ PLANES ═══════════ */
    function createPlane() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: dir > 0 ? -40 : W + 40,
            y: br(12, HORIZON * 0.35),
            dir: dir,
            speed: br(12, 25),
            g: bri(80, 130),
            trailAge: 0,
            alive: true
        };
    }

    function updatePlane(p, dt) {
        p.x += p.dir * p.speed * dt;
        p.trailAge += dt;
        if ((p.dir > 0 && p.x > W + 60) || (p.dir < 0 && p.x < -60)) p.alive = false;
    }

    function drawPlane(c, p) {
        var x = p.x, y = p.y, d = p.dir, g = p.g;
        /* fuselage */
        stk(c, x, y, x + d * 16, y, 0.5, g, 0.7, 0);
        /* nose */
        stk(c, x + d * 16, y, x + d * 19, y - 0.5, 0.3, g, 0.6, 0);
        /* wings */
        stk(c, x + d * 6, y, x + d * 6, y - 7, 0.3, g, 0.6, 0);
        stk(c, x + d * 6, y, x + d * 6, y + 7, 0.3, g, 0.6, 0);
        /* tail fin */
        stk(c, x, y, x - d * 2, y - 4, 0.25, g, 0.55, 0);
        stk(c, x, y, x - d * 2, y + 1.5, 0.2, g, 0.5, 0);
        /* contrail */
        var trailLen = Math.min(80, p.trailAge * 15);
        for (var t = 0; t < trailLen; t += 3) {
            var alpha = Math.max(0, 0.15 - t / trailLen * 0.15);
            stk(c, x - d * t, y + 0.5, x - d * (t + 3), y + 0.5 + Math.sin(t * 0.2) * 0.3,
                0.3 + t / trailLen * 0.8, 195, alpha, 0);
            stk(c, x - d * t, y - 0.5, x - d * (t + 3), y - 0.5 - Math.sin(t * 0.2) * 0.3,
                0.3 + t / trailLen * 0.8, 195, alpha, 0);
        }
    }

    /* ═══════════ HELICOPTERS ═══════════ */
    function createHeli() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: dir > 0 ? -30 : W + 30,
            y: br(HORIZON * 0.15, HORIZON * 0.65),
            dir: dir,
            speed: br(8, 18),
            g: bri(55, 95),
            rotorAngle: 0,
            tailRotorAngle: 0,
            bobPhase: br(0, Math.PI * 2),
            alive: true
        };
    }

    function updateHeli(h, dt) {
        h.x += h.dir * h.speed * dt;
        h.rotorAngle += dt * 35;
        h.tailRotorAngle += dt * 50;
        h.bobPhase += dt * 1.8;
        if ((h.dir > 0 && h.x > W + 60) || (h.dir < 0 && h.x < -60)) h.alive = false;
    }

    function drawHeli(c, h) {
        var x = h.x, y = h.y + Math.sin(h.bobPhase) * 1.2, d = h.dir, g = h.g;
        /* fuselage */
        stk(c, x - d * 6, y, x + d * 8, y, 0.6, g, 0.8, 0);
        /* cockpit bubble */
        arcStr(c, x + d * 6, y - 0.5, 3.5, 3, Math.PI, Math.PI * 2, 0.3, 0.35, g + 15, 0.6);
        /* windshield glass */
        stk(c, x + d * 5, y - 1, x + d * 8, y - 1, 1.5, 160, 0.3, 0);
        /* tail boom */
        stk(c, x - d * 6, y, x - d * 18, y - 2, 0.35, g, 0.7, 0);
        /* tail fin */
        stk(c, x - d * 18, y - 2, x - d * 18, y - 6, 0.3, g, 0.65, 0);
        stk(c, x - d * 18, y - 6, x - d * 15, y - 5, 0.25, g, 0.55, 0);
        /* tail rotor */
        var tra = h.tailRotorAngle;
        var trx = x - d * 18, try_ = y - 4;
        stk(c, trx, try_ + Math.sin(tra) * 3, trx, try_ - Math.sin(tra) * 3, 0.2, g - 10, 0.6, 0);
        /* skids */
        stk(c, x - d * 4, y + 2, x + d * 5, y + 2, 0.3, g - 5, 0.6, 0);
        stk(c, x - d * 2, y, x - d * 2, y + 2, 0.2, g, 0.5, 0);
        stk(c, x + d * 3, y, x + d * 3, y + 2, 0.2, g, 0.5, 0);
        /* mast */
        stk(c, x + d * 1, y - 1, x + d * 1, y - 4, 0.3, g, 0.7, 0);
        /* main rotor (spinning disc) */
        var ra = h.rotorAngle;
        var rotorR = 14;
        var rotorY = y - 4;
        /* draw 2 blades at current angle — they look like a spinning line */
        stk(c, x + d * 1 + Math.cos(ra) * rotorR, rotorY,
            x + d * 1 - Math.cos(ra) * rotorR, rotorY, 0.25, g - 15, 0.65, 0);
        stk(c, x + d * 1 + Math.cos(ra + Math.PI / 2) * rotorR, rotorY,
            x + d * 1 - Math.cos(ra + Math.PI / 2) * rotorR, rotorY, 0.25, g - 15, 0.55, 0);
        /* rotor disc hint (faint circle) */
        arcStr(c, x + d * 1, rotorY, rotorR, 1.5, 0, Math.PI * 2, 0.3, 0.08, g + 20, 0.15);
    }

    /* ═══════════ TRAIN ═══════════ */
    function createTrain() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var nCars = bri(3, 7);
        var cars = [];
        var carW = 28, gap = 3;
        /* locomotive */
        cars.push({ type: 'loco', w: 32 });
        for (var i = 0; i < nCars; i++) {
            var tp = behRng() > 0.3 ? 'passenger' : 'freight';
            cars.push({ type: tp, w: carW });
        }
        var totalW = 0;
        for (var i = 0; i < cars.length; i++) totalW += cars[i].w + gap;
        return {
            x: dir > 0 ? -totalW - 20 : W + 20,
            y: TRACK_Y,
            dir: dir,
            speed: br(22, 42),
            g: bri(45, 85),
            cars: cars, carW: carW, gap: gap, totalW: totalW,
            wheelAngle: 0,
            alive: true
        };
    }

    function updateTrain(tr, dt) {
        tr.x += tr.dir * tr.speed * dt;
        tr.wheelAngle += tr.speed * dt * 0.15;
        var front = tr.dir > 0 ? tr.x + tr.totalW : tr.x - tr.totalW;
        if ((tr.dir > 0 && tr.x > W + 30) || (tr.dir < 0 && tr.x + tr.dir * tr.totalW < -30)) {
            /* check if fully off screen */
            var tail = tr.dir > 0 ? tr.x : tr.x;
            if ((tr.dir > 0 && tail > W + tr.totalW + 30) || (tr.dir < 0 && tail < -tr.totalW - 30))
                tr.alive = false;
        }
    }

    function drawTrain(c, tr) {
        var x = tr.x, y = tr.y, d = tr.dir, g = tr.g;
        var cx = x;
        for (var i = 0; i < tr.cars.length; i++) {
            var car = tr.cars[i];
            var cw = car.w * d;
            var carG = i === 0 ? g - 10 : g;

            if (car.type === 'loco') {
                /* locomotive body */
                stk(c, cx, y, cx + cw, y, 9, carG, 0.9, 0);
                /* roof */
                stk(c, cx + cw * 0.1, y - 5.5, cx + cw * 0.85, y - 5.5, 2.5, carG + 12, 0.8, 0);
                /* cab */
                rectStk(c, cx + (d > 0 ? cw * 0.65 : cw * 0.05), y - 7, car.w * 0.3 * d, 7, 0.35, carG - 5, 0.8);
                /* cab window */
                stk(c, cx + (d > 0 ? cw * 0.7 : cw * 0.1), y - 5.5,
                    cx + (d > 0 ? cw * 0.88 : cw * 0.28), y - 5.5, 2, 150, 0.4, 0);
                /* headlight */
                arcStr(c, cx + cw, y - 1, 1.2, 1.2, 0, Math.PI * 2, 0.4, 0.25, 200, 0.5);
                /* exhaust stack */
                stk(c, cx + cw * 0.3, y - 5.5, cx + cw * 0.3, y - 9, 0.8, carG - 8, 0.7, 0);
                stk(c, cx + cw * 0.3 - d * 1, y - 9, cx + cw * 0.3 + d * 1, y - 9, 0.6, carG, 0.6, 0);
            } else if (car.type === 'passenger') {
                /* passenger car body */
                stk(c, cx, y, cx + cw, y, 8, carG + 8, 0.85, 0);
                /* outline */
                stk(c, cx, y - 4, cx + cw, y - 4, 0.3, carG - 5, 0.7, 0);
                stk(c, cx, y + 4, cx + cw, y + 4, 0.3, carG - 5, 0.7, 0);
                /* windows */
                for (var wi = 0.1; wi < 0.9; wi += 0.15) {
                    var wx = cx + cw * wi;
                    rectStk(c, wx, y - 2.5, car.w * 0.08 * d, 3, 0.2, 155, 0.5);
                }
                /* roof line */
                stk(c, cx + cw * 0.05, y - 5, cx + cw * 0.95, y - 5, 0.5, carG + 15, 0.6, 0);
            } else {
                /* freight car */
                stk(c, cx, y, cx + cw, y, 8, carG + 15, 0.8, 0);
                rectStk(c, cx + cw * 0.05, y - 4, car.w * 0.9 * d, 8, 0.35, carG, 0.7);
                /* ribs */
                for (var ri2 = 0.2; ri2 < 0.8; ri2 += 0.25) {
                    stk(c, cx + cw * ri2, y - 4, cx + cw * ri2, y + 4, 0.15, carG + 5, 0.4, 0);
                }
            }

            /* wheels (all cars) */
            var wy = y + 5;
            var nWheels = car.type === 'loco' ? 3 : 2;
            for (var wi = 0; wi < nWheels; wi++) {
                var wx = cx + cw * (0.2 + wi * 0.3);
                arcStr(c, wx, wy, 2, 2, 0, Math.PI * 2, 0.4, 0.3, 35, 0.8);
                /* spoke */
                stk(c, wx + Math.cos(tr.wheelAngle) * 1.5, wy + Math.sin(tr.wheelAngle) * 1.5,
                    wx - Math.cos(tr.wheelAngle) * 1.5, wy - Math.sin(tr.wheelAngle) * 1.5, 0.1, 45, 0.5, 0);
            }
            /* coupler */
            if (i < tr.cars.length - 1) {
                stk(c, cx + cw, y + 2, cx + cw + tr.gap * d, y + 2, 0.3, carG + 10, 0.5, 0);
            }

            cx += (car.w + tr.gap) * d;
        }
    }

    /* ═══════════ BOATS ═══════════ */
    function createBoat() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var type = behRng() > 0.4 ? 'sail' : 'motor';
        return {
            x: dir > 0 ? -30 : W + 30,
            y: RIVER_TOP + br(8, (RIVER_BOT - RIVER_TOP) * 0.55),
            dir: dir,
            speed: type === 'sail' ? br(3, 8) : br(8, 16),
            type: type,
            g: bri(55, 95),
            bobPhase: br(0, Math.PI * 2),
            alive: true
        };
    }

    function updateBoat(b, dt) {
        b.x += b.dir * b.speed * dt;
        b.bobPhase += dt * 2.2;
        if ((b.dir > 0 && b.x > W + 40) || (b.dir < 0 && b.x < -40)) b.alive = false;
    }

    function drawBoat(c, b) {
        var x = b.x, y = b.y + Math.sin(b.bobPhase) * 0.8, d = b.dir, g = b.g;

        if (b.type === 'sail') {
            arcStr(c, x, y + 1.5, 10, 3, 0, Math.PI, 0.25, 0.5, g, 0.7);
            stk(c, x - 9, y + 1.5, x + 9, y + 1.5, 0.4, g - 8, 0.8, 0);
            stk(c, x + d * 1, y + 1, x + d * 1, y - 14, 0.35, g - 5, 0.8, 0);
            stk(c, x + d * 1, y - 13, x + d * 8, y - 2, 0.3, g + 30, 0.6, 0);
            stk(c, x + d * 1, y - 13, x + d * 1, y - 2, 0.15, g + 25, 0.5, 0);
            for (var sy = y - 12; sy < y - 3; sy += 2) {
                var t = (sy - (y - 13)) / 11;
                stk(c, x + d * 1, sy, x + d * 1 + t * 7 * d, sy, 0.08, g + 40, 0.25, 0);
            }
            stk(c, x - 5, y + 4, x + 5, y + 4, 0.12, g + 30, 0.15, 0);
        } else {
            arcStr(c, x, y + 1, 8, 2.5, 0, Math.PI, 0.25, 0.45, g, 0.7);
            stk(c, x - 7, y + 1, x + 7, y + 1, 0.4, g - 8, 0.8, 0);
            rectStk(c, x - 2, y - 3.5, 5, 4, 0.3, g + 10, 0.7);
            stk(c, x - 1, y - 3, x + 2, y - 3, 1, 160, 0.3, 0);
            for (var w = 1; w < 5; w++) {
                var wx = x - d * (w * 5 + 2);
                var wa = Math.max(0, 0.25 - w * 0.05);
                arcStr(c, wx, y + 2, w * 2.5, 1.5, d > 0 ? Math.PI * 0.7 : 0, d > 0 ? Math.PI : Math.PI * 0.3, 0.3, 0.12, 185, wa);
            }
        }
        stk(c, x - 8, y + 3, x + 8, y + 3, 0.08, 155, 0.2, 0);
    }

    /* ═══════════ BEACH PEOPLE ═══════════ */
    function createBeachPerson() {
        var state = behRng() < 0.4 ? 'sitting' : (behRng() < 0.6 ? 'standing' : 'walking');
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: br(30, W - 30),
            y: BEACH_Y + br(-2, 0),
            state: state,
            dir: dir,
            speed: state === 'walking' ? br(4, 9) : 0,
            g: bri(55, 100),
            scale: 0.65,
            walkPhase: 0, phaseTimer: 0,
            stateTimer: br(8, 30),
            alive: true
        };
    }

    function updateBeachPerson(bp, dt) {
        bp.stateTimer -= dt;
        if (bp.stateTimer <= 0) {
            var states = ['sitting', 'standing', 'walking'];
            bp.state = states[bri(0, states.length)];
            bp.speed = bp.state === 'walking' ? br(4, 9) : 0;
            bp.stateTimer = br(8, 30);
        }
        if (bp.state === 'walking') {
            bp.x += bp.dir * bp.speed * dt;
            bp.phaseTimer += dt;
            if (bp.phaseTimer > 0.25) { bp.phaseTimer = 0; bp.walkPhase = (bp.walkPhase + 1) % 4; }
            if (bp.x < 10 || bp.x > W - 10) bp.dir = -bp.dir;
        }
    }

    function drawBeachPerson(c, bp) {
        var x = bp.x, y = bp.y, g = bp.g, s = bp.scale;
        if (bp.state === 'sitting') {
            arcStr(c, x, y - 3 * s, 1 * s, 1 * s, 0, Math.PI * 2, 0.45, 0.2 * s, g, 0.7);
            stk(c, x, y - 2 * s, x, y - 0.5 * s, 0.25 * s, g, 0.7, 0);
            stk(c, x, y - 0.5 * s, x + 2 * s, y, 0.2 * s, g, 0.6, 0);
            stk(c, x - 3, y + 0.5, x + 4, y + 0.5, 0.8, g + 40, 0.3, 0);
        } else if (bp.state === 'standing') {
            arcStr(c, x, y - 6 * s, 1 * s, 1 * s, 0, Math.PI * 2, 0.45, 0.2 * s, g, 0.7);
            stk(c, x, y - 5 * s, x, y - 2 * s, 0.25 * s, g, 0.7, 0);
            stk(c, x, y - 2 * s, x - 1 * s, y, 0.2 * s, g, 0.6, 0);
            stk(c, x, y - 2 * s, x + 1 * s, y, 0.2 * s, g + 8, 0.55, 0);
        } else {
            var ph = bp.walkPhase;
            var bob = (ph === 1 || ph === 3) ? -0.3 * s : 0;
            arcStr(c, x, y - 6 * s + bob, 1 * s, 1 * s, 0, Math.PI * 2, 0.45, 0.2 * s, g, 0.7);
            stk(c, x, y - 5 * s + bob, x, y - 2 * s, 0.25 * s, g, 0.7, 0);
            var stride = (ph === 0 || ph === 2) ? 1.2 * s : 0.2 * s;
            var legDir = ph === 0 ? 1 : (ph === 2 ? -1 : 0);
            stk(c, x, y - 2 * s, x + legDir * stride * bp.dir, y, 0.2 * s, g, 0.6, 0);
            stk(c, x, y - 2 * s, x - legDir * stride * bp.dir, y, 0.2 * s, g + 8, 0.55, 0);
        }
    }

    /* ═══════════ DOLPHINS ═══════════ */
    function createDolphin() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var baseY = RIVER_TOP + br(5, (RIVER_BOT - RIVER_TOP) * 0.45);
        return {
            x: br(W * 0.15, W * 0.85),
            y: baseY,
            baseY: baseY,
            dir: dir,
            speed: br(20, 35),
            jumpPhase: 0,
            jumping: false,
            jumpHeight: br(14, 24),
            jumpTimer: br(1, 4),
            g: bri(70, 100),
            alive: true,
            age: 0,
            maxAge: br(15, 35)
        };
    }

    function updateDolphin(d, dt) {
        d.age += dt;
        d.x += d.dir * d.speed * dt;
        if (d.jumping) {
            d.jumpPhase += dt * 2.5;
            d.y = d.baseY - Math.sin(d.jumpPhase) * d.jumpHeight;
            if (d.jumpPhase >= Math.PI) {
                d.jumping = false;
                d.jumpPhase = 0;
                d.y = d.baseY;
                d.jumpTimer = br(3, 8);
            }
        } else {
            d.jumpTimer -= dt;
            if (d.jumpTimer <= 0) {
                d.jumping = true;
                d.jumpPhase = 0;
                d.jumpHeight = br(14, 24);
            }
        }
        if (d.x < -30 || d.x > W + 30 || d.age > d.maxAge) d.alive = false;
    }

    function drawDolphin(c, d) {
        var x = d.x, y = d.y, dir = d.dir, g = d.g;
        if (d.jumping && d.y < d.baseY - 2) {
            stk(c, x - dir * 6, y + 2, x + dir * 6, y - 1, 0.6, g, 0.7, 0);
            stk(c, x - dir * 4, y + 2.5, x + dir * 4, y + 0.5, 0.4, g + 30, 0.5, 0);
            stk(c, x, y - 1, x - dir * 1, y - 4, 0.3, g - 5, 0.7, 0);
            stk(c, x - dir * 1, y - 4, x - dir * 3, y - 1, 0.2, g, 0.6, 0);
            stk(c, x - dir * 6, y + 2, x - dir * 9, y, 0.25, g, 0.6, 0);
            stk(c, x - dir * 6, y + 2, x - dir * 9, y + 4, 0.25, g, 0.6, 0);
            stk(c, x + dir * 6, y - 1, x + dir * 8, y - 0.5, 0.3, g, 0.6, 0);
            stk(c, x + dir * 4, y - 0.5, x + dir * 4.3, y - 0.5, 0.3, g - 25, 0.8, 0);
            if (d.jumpPhase < 0.5 || d.jumpPhase > Math.PI - 0.5) {
                for (var s = 0; s < 4; s++) {
                    var sx = x + br(-4, 4), sy = d.baseY + br(-1, 2);
                    stk(c, sx, sy, sx + br(-2, 2), sy - br(1, 4), 0.15, 175, 0.35, 0);
                }
            }
        } else if (!d.jumping) {
            stk(c, x, d.baseY, x - dir * 1.5, d.baseY - 2.5, 0.2, g, 0.35, 0);
            stk(c, x - dir * 1.5, d.baseY - 2.5, x - dir * 3, d.baseY, 0.15, g, 0.3, 0);
        }
    }

    /* ═══════════ FISH ═══════════ */
    function createFish() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: br(20, W - 20),
            y: RIVER_TOP + br(8, (RIVER_BOT - RIVER_TOP) * 0.7),
            dir: dir,
            speed: br(3, 10),
            g: bri(100, 145),
            tailPhase: br(0, Math.PI * 2),
            alive: true,
            age: 0,
            maxAge: br(20, 60)
        };
    }

    function updateFish(f, dt) {
        f.age += dt;
        f.x += f.dir * f.speed * dt;
        f.tailPhase += dt * 8;
        f.y += Math.sin(f.tailPhase * 0.3) * 0.05;
        if (f.x < -10 || f.x > W + 10 || f.age > f.maxAge) f.alive = false;
        if (behRng() < 0.001) f.dir = -f.dir;
    }

    function drawFish(c, f) {
        var x = f.x, y = f.y, d = f.dir, g = f.g;
        var tailW = Math.sin(f.tailPhase) * 1;
        stk(c, x - d * 2.5, y, x + d * 2.5, y, 0.3, g, 0.3, 0);
        stk(c, x - d * 2.5, y, x - d * 3.5 + tailW, y - 1, 0.15, g, 0.25, 0);
        stk(c, x - d * 2.5, y, x - d * 3.5 + tailW, y + 1, 0.15, g, 0.25, 0);
    }

    /* ═══════════ WINDOW LIGHTS ═══════════ */
    function drawLitWindows(c, now) {
        for (var i = 0; i < litWindows.length; i++) {
            var lw = litWindows[i];
            var gOsc = 115 + Math.sin(now / 1000 / lw.period * Math.PI * 2 + lw.phase) * 25;
            var dayFade = getDayAlpha();
            c.fillStyle = 'rgba(' + Math.floor(gOsc) + ',' + Math.floor(gOsc) + ',' + Math.floor(gOsc - 5) + ',' + (dayFade * 0.45) + ')';
            c.fillRect(lw.x, lw.y, lw.w, lw.h);
        }
    }

    /* ═══════════ DAY/NIGHT ═══════════ */
    function getDayAlpha() {
        /* returns 0 (noon) to 1 (midnight) */
        return (Math.sin(dayPhase * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    }

    function paperColor() {
        var nightAmt = getDayAlpha();
        var g = Math.floor(PAPER_BASE - nightAmt * 20);
        return 'rgb(' + g + ',' + g + ',' + g + ')';
    }

    /* ═══════════ WORLD INIT ═══════════ */
    function init() {
        /* reset RNG */
        seed = Date.now();
        layoutRng = mulberry32(seed);
        behRng = mulberry32(seed ^ 0xBEEF);

        /* generate layout */
        generateLayout();

        /* paint static layers */
        paintBg();
        paintCity();
        makeGrain();

        /* spawn cranes for construction zones */
        cranes = [];
        for (var i = 0; i < constructions.length && cranes.length < MAX_CRANES; i++) {
            cranes.push(createCrane(constructions[i]));
        }

        /* spawn initial vehicles */
        vehicles = [];
        for (var i = 0; i < Math.floor(MAX_VEHICLES * 0.5); i++) {
            var v = createVehicle();
            v.x = br(50, W - 50);
            vehicles.push(v);
        }

        /* spawn initial pedestrians */
        peds = [];
        for (var i = 0; i < Math.floor(MAX_PEDS * 0.5); i++) {
            var p = createPedestrian(behRng() > 0.4);
            p.x = br(20, W - 20);
            peds.push(p);
        }

        /* spawn workers */
        workers = [];
        for (var i = 0; i < constructions.length; i++) {
            var nw = bri(2, 5);
            for (var j = 0; j < nw; j++) {
                if (constructions[i].curFloor > 0) workers.push(createWorker(constructions[i]));
            }
        }

        /* spawn clouds */
        clouds = [];
        for (var i = 0; i < MAX_CLOUDS; i++) clouds.push(createCloud());

        /* spawn flocks */
        flocks = [];
        for (var i = 0; i < bri(1, MAX_FLOCKS + 1); i++) flocks.push(createFlock());

        /* reset smoke */
        smokePuffs = [];

        /* spawn planes & helicopters */
        planes = [];
        helis = [];
        if (behRng() > 0.4) planes.push(createPlane());
        if (behRng() > 0.5) helis.push(createHeli());

        /* spawn initial train */
        trains = [];
        var t = createTrain();
        t.x = br(W * 0.2, W * 0.6);
        trains.push(t);

        /* spawn boats */
        boats = [];
        for (var i = 0; i < bri(1, 3); i++) {
            var bt = createBoat();
            bt.x = br(W * 0.1, W * 0.9);
            boats.push(bt);
        }

        /* spawn beach people */
        beachPeople = [];
        for (var i = 0; i < bri(3, MAX_BEACH); i++) {
            beachPeople.push(createBeachPerson());
        }

        /* spawn dolphins (rare — maybe 0 or 1) */
        dolphins = [];
        if (behRng() > 0.6) dolphins.push(createDolphin());

        /* spawn fish */
        fish = [];
        for (var i = 0; i < bri(4, MAX_FISH); i++) {
            fish.push(createFish());
        }

        dayPhase = 0;
    }

    init();

    /* ═══════════ MAIN LOOP ═══════════ */
    var lastNow = performance.now();
    var spawnVehicleTimer = 0;
    var spawnPedTimer = 0;
    var smokeTimer = 0;
    var workerSpawnTimer = 0;
    var boatSpawnTimer = 0;
    var dolphinSpawnTimer = 0;
    var fishSpawnTimer = 0;

    function frame(now) {
        var dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow = now;
        dayPhase += dt / DAY_CYCLE;
        if (dayPhase > 1) dayPhase -= 1;

        /* ── UPDATE ── */
        /* construction */
        var allDone = true;
        for (var i = 0; i < constructions.length; i++) {
            updateConstruction(constructions[i], dt);
            if (!constructions[i].done) allDone = false;
        }

        /* cranes */
        for (var i = 0; i < cranes.length; i++) updateCrane(cranes[i], dt);

        /* vehicles */
        for (var i = vehicles.length - 1; i >= 0; i--) {
            updateVehicle(vehicles[i], dt);
            if (!vehicles[i].alive) vehicles.splice(i, 1);
        }
        spawnVehicleTimer += dt;
        if (spawnVehicleTimer > br(0.8, 2.5) && vehicles.length < MAX_VEHICLES) {
            vehicles.push(createVehicle());
            spawnVehicleTimer = 0;
        }

        /* pedestrians */
        for (var i = peds.length - 1; i >= 0; i--) {
            updatePedestrian(peds[i], dt);
            if (!peds[i].alive) peds.splice(i, 1);
        }
        spawnPedTimer += dt;
        if (spawnPedTimer > br(0.6, 2.0) && peds.length < MAX_PEDS) {
            peds.push(createPedestrian(behRng() > 0.45));
            spawnPedTimer = 0;
        }

        /* workers */
        for (var i = workers.length - 1; i >= 0; i--) {
            updateWorker(workers[i], dt);
            if (!workers[i].alive) workers.splice(i, 1);
        }
        workerSpawnTimer += dt;
        if (workerSpawnTimer > 5) {
            workerSpawnTimer = 0;
            for (var i = 0; i < constructions.length; i++) {
                if (!constructions[i].done && constructions[i].curFloor > 0) {
                    var wCount = 0;
                    for (var j = 0; j < workers.length; j++) {
                        if (workers[j].conIdx === i) wCount++;
                    }
                    if (wCount < 4) workers.push(createWorker(constructions[i]));
                }
            }
        }

        /* flocks */
        for (var i = flocks.length - 1; i >= 0; i--) {
            updateFlock(flocks[i], dt);
            if (!flocks[i].alive) flocks.splice(i, 1);
        }
        if (flocks.length < MAX_FLOCKS && behRng() < 0.001) flocks.push(createFlock());

        /* clouds */
        for (var i = 0; i < clouds.length; i++) updateCloud(clouds[i], dt);

        /* planes */
        for (var i = planes.length - 1; i >= 0; i--) {
            updatePlane(planes[i], dt);
            if (!planes[i].alive) planes.splice(i, 1);
        }
        if (planes.length < MAX_PLANES && behRng() < 0.0004) planes.push(createPlane());

        /* helicopters */
        for (var i = helis.length - 1; i >= 0; i--) {
            updateHeli(helis[i], dt);
            if (!helis[i].alive) helis.splice(i, 1);
        }
        if (helis.length < MAX_HELIS && behRng() < 0.0003) helis.push(createHeli());

        /* trains */
        for (var i = trains.length - 1; i >= 0; i--) {
            updateTrain(trains[i], dt);
            if (!trains[i].alive) trains.splice(i, 1);
        }
        if (trains.length === 0 && behRng() < 0.003) trains.push(createTrain());

        /* boats */
        for (var i = boats.length - 1; i >= 0; i--) {
            updateBoat(boats[i], dt);
            if (!boats[i].alive) boats.splice(i, 1);
        }
        boatSpawnTimer += dt;
        if (boatSpawnTimer > br(8, 20) && boats.length < MAX_BOATS) {
            boats.push(createBoat());
            boatSpawnTimer = 0;
        }

        /* beach people */
        for (var i = beachPeople.length - 1; i >= 0; i--) {
            updateBeachPerson(beachPeople[i], dt);
        }
        if (beachPeople.length < MAX_BEACH && behRng() < 0.0008) {
            beachPeople.push(createBeachPerson());
        }

        /* dolphins */
        for (var i = dolphins.length - 1; i >= 0; i--) {
            updateDolphin(dolphins[i], dt);
            if (!dolphins[i].alive) dolphins.splice(i, 1);
        }
        dolphinSpawnTimer += dt;
        if (dolphinSpawnTimer > br(15, 45) && dolphins.length < MAX_DOLPHINS) {
            dolphins.push(createDolphin());
            dolphinSpawnTimer = 0;
        }

        /* fish */
        for (var i = fish.length - 1; i >= 0; i--) {
            updateFish(fish[i], dt);
            if (!fish[i].alive) fish.splice(i, 1);
        }
        fishSpawnTimer += dt;
        if (fishSpawnTimer > br(3, 8) && fish.length < MAX_FISH) {
            fish.push(createFish());
            fishSpawnTimer = 0;
        }

        /* smoke */
        smokeTimer += dt;
        if (smokeTimer > br(0.5, 1.5)) {
            smokeTimer = 0;
            for (var i = 0; i < chimneys.length; i++) {
                if (smokePuffs.length < MAX_SMOKE) {
                    smokePuffs.push(createSmokePuff(chimneys[i].x, chimneys[i].y));
                }
            }
        }
        for (var i = smokePuffs.length - 1; i >= 0; i--) {
            updateSmoke(smokePuffs[i], dt);
            if (!smokePuffs[i].alive) smokePuffs.splice(i, 1);
        }

        /* ── DRAW DYNAMIC LAYER ── */
        dynC.clearRect(0, 0, W, H);

        /* sun & moon (behind clouds) */
        drawSunMoon(dynC, now);

        /* clouds */
        for (var i = 0; i < clouds.length; i++) drawCloud(dynC, clouds[i]);

        /* planes */
        for (var i = 0; i < planes.length; i++) drawPlane(dynC, planes[i]);

        /* helicopters */
        for (var i = 0; i < helis.length; i++) drawHeli(dynC, helis[i]);

        /* flocks */
        for (var i = 0; i < flocks.length; i++) drawFlock(dynC, flocks[i]);

        /* smoke */
        for (var i = 0; i < smokePuffs.length; i++) drawSmoke(dynC, smokePuffs[i]);

        /* construction buildings */
        for (var i = 0; i < constructions.length; i++) drawConstruction(dynC, constructions[i]);

        /* workers */
        for (var i = 0; i < workers.length; i++) drawWorker(dynC, workers[i]);

        /* cranes */
        for (var i = 0; i < cranes.length; i++) drawCrane(dynC, cranes[i]);

        /* window lights */
        drawLitWindows(dynC, now);

        /* vehicles (on street) */
        for (var i = 0; i < vehicles.length; i++) drawVehicle(dynC, vehicles[i]);

        /* pedestrians (on street) */
        for (var i = 0; i < peds.length; i++) drawPedestrian(dynC, peds[i]);

        /* trains (foreground, on tracks) */
        for (var i = 0; i < trains.length; i++) drawTrain(dynC, trains[i]);

        /* fish (underwater, subtle) */
        for (var i = 0; i < fish.length; i++) drawFish(dynC, fish[i]);

        /* boats (on water) */
        for (var i = 0; i < boats.length; i++) drawBoat(dynC, boats[i]);

        /* dolphins (jumping from water) */
        for (var i = 0; i < dolphins.length; i++) drawDolphin(dynC, dolphins[i]);

        /* beach people */
        for (var i = 0; i < beachPeople.length; i++) drawBeachPerson(dynC, beachPeople[i]);

        /* ── COMPOSITE ── */
        ctx.fillStyle = paperColor();
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(bgCvs, 0, 0);
        ctx.drawImage(cityCvs, 0, 0);
        ctx.drawImage(dynCvs, 0, 0);
        ctx.drawImage(grainCvs, 0, 0);
        drawVignette(ctx);

        /* ── REGENERATE when all construction done ── */
        if (allDone && constructions.length > 0) {
            /* try to find a new gap for construction */
            var newZone = findBuildGap();
            if (newZone) {
                constructions.push(newZone);
                cranes.push(createCrane(newZone));
            }
        }

        animId = requestAnimationFrame(frame);
    }

    /* find a gap to place new construction */
    function findBuildGap() {
        var ranges = [];
        for (var i = 0; i < buildings.length; i++) {
            ranges.push({ x: buildings[i].x, r: buildings[i].x + buildings[i].w });
        }
        for (var i = 0; i < constructions.length; i++) {
            ranges.push({ x: constructions[i].x, r: constructions[i].x + constructions[i].w });
        }
        ranges.sort(function (a, b) { return a.x - b.x; });

        var gaps = [];
        var prev = 10;
        for (var i = 0; i < ranges.length; i++) {
            if (ranges[i].x - prev > 35) gaps.push({ x: prev + 3, w: Math.min(65, ranges[i].x - prev - 8) });
            prev = Math.max(prev, ranges[i].r + 5);
        }
        if (W - prev > 40) gaps.push({ x: prev + 3, w: Math.min(65, W - prev - 15) });

        if (gaps.length === 0) return null;
        var gap = gaps[bri(0, gaps.length)];
        var bw = Math.max(18, Math.min(gap.w, br(20, 55)));
        var cFloors = bri(8, 20), cFlH = bri(8, 13);
        return {
            x: gap.x, w: bw, floors: cFloors, floorH: cFlH,
            h: cFloors * cFlH, y: GROUND - cFloors * cFlH,
            curFloor: 0, buildTimer: 0,
            floorInterval: br(35, 80),
            g: bri(65, 125), done: false,
            scaffolding: false, workers: []
        };
    }

    /* visibility API — pause when hidden */
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            lastNow = performance.now();
            if (!animId) animId = requestAnimationFrame(frame);
        }
    });

    animId = requestAnimationFrame(frame);

    /* ═══════════ RESIZE ═══════════ */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (animId) cancelAnimationFrame(animId);
            resize();
            init();
            lastNow = performance.now();
            animId = requestAnimationFrame(frame);
        }, 150);
    });

    /* ═══════════ SHUFFLE (exposed for index.html button) ═══════════ */
    window.shuffleAnimation = function () {
        if (animId) cancelAnimationFrame(animId);
        resize();
        init();
        lastNow = performance.now();
        animId = requestAnimationFrame(frame);
    };
})();
