/**
 * eagle-loader.js — small centered loader: eagle flying in a circle.
 *
 * Public API on window.EagleLoader:
 *   show()       — display widget
 *   hide()       — fade out + unmount
 *   isVisible()  — boolean
 *   bindLink(a)  — opt-in: show loader when this <a> is clicked
 *
 * Auto-shows on DOMContentLoaded, auto-hides 280 ms after window.load.
 * Honors prefers-reduced-motion.
 */
(function () {
    "use strict";

    var ROOT_CLASS = "eagle-loader";
    var HIDDEN_CLASS = "is-hidden";
    var MIN_VISIBLE_MS = 420;
    var shownAt = 0;
    var rootEl = null;
    var hideTimer = null;

    var SVG_NS = "http://www.w3.org/2000/svg";

    function el(name, attrs) {
        var n = document.createElementNS(SVG_NS, name);
        if (attrs) {
            for (var k in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                    n.setAttribute(k, attrs[k]);
                }
            }
        }
        return n;
    }

    /**
     * Bald eagle viewed FROM THE BACK — heavily detailed, top-down.
     * Layered plumage: scaled back feathers, multi-row wing feathers
     * (tertiaries / secondaries / primaries / coverts / rim-light),
     * fanned tail with individual feathers, crown feather wisps, brown
     * nape blending into the white skull.
     */
    function buildEagleGroup() {
        var g = el("g", { "class": "eagle-loader__eagle" });

        // ── TAIL — fan with individual feathers ────────────────
        var tail = el("g", { "class": "eagle-loader__tail" });
        // Tail base / undertail
        tail.appendChild(el("path", {
            d: "M-8 10 Q-10 20 -5 21 Q0 22 5 21 Q10 20 8 10 Z",
            fill: "url(#el-bodyGrad)",
            stroke: "#1a1a1a",
            "stroke-width": "0.6",
            "stroke-linejoin": "round"
        }));
        // Individual tail feather wedges (7 feathers fanning outward)
        var tailWedges = [
            "M-7.6 11 L-9.3 20.5 L-6 20.5 Z",
            "M-5.4 11 L-6.4 21 L-3.2 21 Z",
            "M-3.0 11 L-3.4 21.5 L-0.8 21.5 Z",
            "M-0.8 11 L-1.0 22 L 1.0 22 Z",
            "M 1.0 11 L 1.0 21.8 L 3.4 21.5 Z",
            "M 3.2 11 L 3.4 21 L 6.4 21 Z",
            "M 5.4 11 L 6.0 20.5 L 9.3 20.5 Z"
        ];
        for (var ti = 0; ti < tailWedges.length; ti++) {
            tail.appendChild(el("path", {
                d: tailWedges[ti],
                fill: "url(#el-bodyGrad)",
                stroke: "#0a0a0a",
                "stroke-width": "0.4",
                "stroke-linejoin": "round"
            }));
        }
        // Dark sub-terminal band — dark stripe just before the white tip
        tail.appendChild(el("path", {
            d: "M-9 17 Q0 19.5 9 17 Q7 19 0 20 Q-7 19 -9 17 Z",
            fill: "rgba(0, 0, 0, 0.55)",
            stroke: "none"
        }));
        // White tail-tip band (signature bald-eagle marker)
        tail.appendChild(el("path", {
            d: "M-9.5 18.5 Q0 21.5 9.5 18.5 Q7 20.5 0 22 Q-7 20.5 -9.5 18.5 Z",
            fill: "#f4f0e6",
            stroke: "#1a1a1a",
            "stroke-width": "0.3",
            "stroke-linejoin": "round"
        }));
        // Tan specks scattered on the tail's body-side
        var tailSpecks = [
            [-5.5, 13], [-3, 14], [0, 14.5], [3, 14], [5.5, 13],
            [-4.5, 16], [-2, 16.5], [2, 16.5], [4.5, 16]
        ];
        for (var tsp = 0; tsp < tailSpecks.length; tsp++) {
            tail.appendChild(el("circle", {
                cx: tailSpecks[tsp][0],
                cy: tailSpecks[tsp][1],
                r: 0.16,
                fill: "rgba(195, 160, 110, 0.60)"
            }));
        }
        // Tail rachis lines + barbs — each feather gets a central spine
        // and three pairs of barbs branching off to either side.
        var tailFeathers = [
            { rachis: "M-6.4 12 L-7.7 19.5", barbs: "M-6.7 14.2 L-7.6 14 M-7.0 16 L-8.0 15.8 M-7.3 17.8 L-8.3 17.6 M-6.7 14.2 L-5.8 14.5 M-7.0 16 L-6.1 16.4 M-7.3 17.8 L-6.4 18.2" },
            { rachis: "M-4.2 12 L-4.6 20",   barbs: "M-4.3 14.5 L-5.3 14.3 M-4.4 16.5 L-5.4 16.3 M-4.55 18.5 L-5.55 18.3 M-4.3 14.5 L-3.3 14.7 M-4.4 16.5 L-3.4 16.7 M-4.55 18.5 L-3.55 18.7" },
            { rachis: "M-1.8 12 L-1.9 20.5", barbs: "M-1.85 14.7 L-2.95 14.5 M-1.85 16.8 L-2.95 16.6 M-1.9 19 L-3.0 18.8 M-1.85 14.7 L-0.75 14.9 M-1.85 16.8 L-0.75 17.0 M-1.9 19 L-0.8 19.2" },
            { rachis: "M 0 12 L 0 21",       barbs: "M0 14.8 L-1.2 14.6 M0 17 L-1.2 16.8 M0 19.4 L-1.3 19.2 M0 14.8 L1.2 14.6 M0 17 L1.2 16.8 M0 19.4 L1.3 19.2" },
            { rachis: "M 1.8 12 L 1.9 20.5", barbs: "M1.85 14.7 L0.75 14.9 M1.85 16.8 L0.75 17.0 M1.9 19 L0.8 19.2 M1.85 14.7 L2.95 14.5 M1.85 16.8 L2.95 16.6 M1.9 19 L3.0 18.8" },
            { rachis: "M 4.2 12 L 4.6 20",   barbs: "M4.3 14.5 L3.3 14.7 M4.4 16.5 L3.4 16.7 M4.55 18.5 L3.55 18.7 M4.3 14.5 L5.3 14.3 M4.4 16.5 L5.4 16.3 M4.55 18.5 L5.55 18.3" },
            { rachis: "M 6.4 12 L 7.7 19.5", barbs: "M6.7 14.2 L5.8 14.5 M7.0 16 L6.1 16.4 M7.3 17.8 L6.4 18.2 M6.7 14.2 L7.6 14 M7.0 16 L8.0 15.8 M7.3 17.8 L8.3 17.6" }
        ];
        for (var tr = 0; tr < tailFeathers.length; tr++) {
            tail.appendChild(el("path", {
                d: tailFeathers[tr].rachis,
                fill: "none",
                stroke: "#050505",
                "stroke-width": "0.34",
                "stroke-linecap": "round",
                opacity: "0.9"
            }));
            tail.appendChild(el("path", {
                d: tailFeathers[tr].barbs,
                fill: "none",
                stroke: "rgba(10, 5, 2, 0.55)",
                "stroke-width": "0.20",
                "stroke-linecap": "round"
            }));
        }
        // Undertail coverts — small scallops where tail meets body
        tail.appendChild(el("path", {
            d: "M-6 11 Q-4 9.6 -2 11 Q0 9.6 2 11 Q4 9.6 6 11",
            fill: "none",
            stroke: "#050505",
            "stroke-width": "0.35",
            "stroke-linecap": "round"
        }));
        g.appendChild(tail);

        // ── BODY — scaled back feathers ────────────────────────
        var body = el("g", { "class": "eagle-loader__body" });
        // Main body silhouette
        body.appendChild(el("ellipse", {
            cx: "0", cy: "0", rx: "7.5", ry: "12",
            fill: "url(#el-bodyGrad)",
            stroke: "#1a1a1a",
            "stroke-width": "0.7"
        }));
        // Soft top-light highlight along the spine
        body.appendChild(el("ellipse", {
            cx: "-1.4", cy: "-3", rx: "1.8", ry: "6",
            fill: "rgba(255, 240, 200, 0.18)"
        }));
        // Spine ridge — central back line
        body.appendChild(el("path", {
            d: "M0 -10 L0 9",
            fill: "none",
            stroke: "#0a0a0a",
            "stroke-width": "0.6",
            "stroke-linecap": "round",
            opacity: "0.55"
        }));
        // Scaled back-feather pattern — overlapping arcs in 6 rows
        var scaleRows = [
            { y: -8, xs: [-4, -2, 0, 2, 4] },
            { y: -5, xs: [-5.5, -3.5, -1.5, 0.5, 2.5, 4.5] },
            { y: -2, xs: [-6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5] },
            { y:  1, xs: [-6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5] },
            { y:  4, xs: [-5.5, -3.5, -1.5, 0.5, 2.5, 4.5] },
            { y:  7, xs: [-4, -2, 0, 2, 4] }
        ];
        var scaleD = "";
        for (var r = 0; r < scaleRows.length; r++) {
            var row = scaleRows[r];
            for (var sc = 0; sc < row.xs.length - 1; sc++) {
                var x1 = row.xs[sc];
                var x2 = row.xs[sc + 1];
                var mid = (x1 + x2) / 2;
                scaleD += "M" + x1 + " " + row.y + " Q" + mid + " " + (row.y + 1.4) + " " + x2 + " " + row.y + " ";
            }
        }
        body.appendChild(el("path", {
            d: scaleD,
            fill: "none",
            stroke: "#0a0a0a",
            "stroke-width": "0.38",
            "stroke-linecap": "round",
            opacity: "0.7"
        }));
        // Tan feather highlights — every other row gets a faint warm rim
        body.appendChild(el("path", {
            d: "M-5 -5 Q0 -3.4 5 -5 M-6 1 Q0 2.6 6 1 M-5 7 Q0 8.4 5 7",
            fill: "none",
            stroke: "rgba(180, 140, 100, 0.42)",
            "stroke-width": "0.45",
            "stroke-linecap": "round"
        }));

        // Individual scapular feathers — small filled feather shapes scattered
        // across the upper back where the wings meet. These give the feather
        // pattern actual depth instead of just outline arcs.
        var scapFeathers = [
            [-4.2, -8,  -4.6, -5,  0.7],
            [-2.5, -8.5, -2.7, -5.5, 0.7],
            [-0.8, -8.7, -0.9, -5.8, 0.7],
            [ 0.8, -8.7,  0.9, -5.8, 0.7],
            [ 2.5, -8.5,  2.7, -5.5, 0.7],
            [ 4.2, -8,    4.6, -5,   0.7],
            [-5.5, -5.5, -5.8, -2,   0.8],
            [-3.6, -6,   -3.8, -2.5, 0.8],
            [-1.8, -6.2, -1.9, -2.7, 0.8],
            [ 1.8, -6.2,  1.9, -2.7, 0.8],
            [ 3.6, -6,    3.8, -2.5, 0.8],
            [ 5.5, -5.5,  5.8, -2,   0.8]
        ];
        for (var sf = 0; sf < scapFeathers.length; sf++) {
            var sfp = scapFeathers[sf];
            var sSide = sfp[0] < 0 ? -1 : 1;
            body.appendChild(el("path", {
                d: "M" + sfp[0] + " " + sfp[1] +
                   " Q" + (sfp[0] + sSide * sfp[4]) + " " + ((sfp[1] + sfp[3]) / 2) + " " + (sfp[2] + sSide * sfp[4] * 0.5) + " " + sfp[3] +
                   " L" + (sfp[2] - sSide * sfp[4] * 0.5) + " " + (sfp[3] + 0.2) +
                   " Q" + (sfp[0] - sSide * sfp[4] * 0.85) + " " + ((sfp[1] + sfp[3]) / 2) + " " + sfp[0] + " " + sfp[1] + " Z",
                fill: "url(#el-bodyGrad)",
                stroke: "#050505",
                "stroke-width": "0.22",
                "stroke-linejoin": "round",
                opacity: "0.85"
            }));
            // Tiny rachis on each scapular
            body.appendChild(el("path", {
                d: "M" + sfp[0] + " " + sfp[1] + " L" + sfp[2] + " " + sfp[3],
                fill: "none",
                stroke: "#050505",
                "stroke-width": "0.18",
                "stroke-linecap": "round",
                opacity: "0.6"
            }));
        }

        // Lower-back / rump feather rows — denser arcs near the tail
        body.appendChild(el("path", {
            d: "M-4.5 8.5 Q-2.5 9.7 -0.5 8.5 Q1.5 9.7 3.5 8.5 Q5 9.5 6 8.8 " +
               "M-5 10 Q-3 11 -1 10 Q1 11 3 10 Q5 11 6 10.4",
            fill: "none",
            stroke: "#050505",
            "stroke-width": "0.32",
            "stroke-linecap": "round",
            opacity: "0.7"
        }));

        // Tan / cream feather specks — tiny dots scattered across the back
        // suggest individual feather tips catching the light.
        var speckPositions = [
            [-3.4, -7.2], [-1.4, -7.5], [0.6, -7.6], [2.6, -7.5], [4.4, -7.2],
            [-4.6, -4.5], [-2.8, -4.8], [-0.8, -5.0], [1.2, -5.0], [3.0, -4.8], [4.8, -4.5],
            [-5.4, -1.5], [-3.6, -1.8], [-1.6, -2.0], [0.4, -2.0], [2.4, -1.8], [4.2, -1.5], [5.6, -1.0],
            [-5.4,  1.5], [-3.6,  1.5], [-1.6,  1.6], [0.4,  1.6], [2.4,  1.5], [4.2,  1.5], [5.6,  1.8],
            [-4.6,  4.6], [-2.8,  4.4], [-0.8,  4.3], [1.2,  4.3], [3.0,  4.4], [4.8,  4.6],
            [-3.4,  7.4], [-1.4,  7.6], [0.6,  7.6], [2.6,  7.6], [4.4,  7.4]
        ];
        for (var sp = 0; sp < speckPositions.length; sp++) {
            body.appendChild(el("circle", {
                cx: speckPositions[sp][0],
                cy: speckPositions[sp][1],
                r: 0.18,
                fill: "rgba(195, 160, 110, 0.65)"
            }));
        }

        // Cape — V-shaped lighter band across the upper back (where mantle
        // feathers catch a bit more light).
        body.appendChild(el("path", {
            d: "M-6 -6 Q-3 -4 0 -5 Q3 -4 6 -6 " +
               "M-5.6 -3.5 Q-3 -2 0 -2.6 Q3 -2 5.6 -3.5",
            fill: "none",
            stroke: "rgba(165, 125, 80, 0.42)",
            "stroke-width": "0.4",
            "stroke-linecap": "round"
        }));

        // Tiny dark feather valleys between rows (depth between scallops)
        body.appendChild(el("path", {
            d: "M-3 -6.5 L-1 -6.5 M1 -6.5 L3 -6.5 " +
               "M-4 -3.5 L-2 -3.5 M0 -3.5 L2 -3.5 M3 -3.5 L4.5 -3.5 " +
               "M-4 -0.5 L-2 -0.5 M0 -0.5 L2 -0.5 M3 -0.5 L4.5 -0.5 " +
               "M-3 2.5 L-1 2.5 M1 2.5 L3 2.5 " +
               "M-3 5.5 L-1 5.5 M1 5.5 L3 5.5",
            fill: "none",
            stroke: "rgba(0, 0, 0, 0.30)",
            "stroke-width": "0.16",
            "stroke-linecap": "round"
        }));

        g.appendChild(body);

        // ── WINGS ──────────────────────────────────────────────
        g.appendChild(buildWing("left"));
        g.appendChild(buildWing("right"));

        // ── SHOULDER PATCHES — overlay where wings meet body ───
        var shoulder = el("g", { "class": "eagle-loader__shoulder" });
        shoulder.appendChild(el("path", {
            d: "M-7.8 -4 Q-9 -2 -8.5 1 Q-7 0 -7 -3.5 Z " +
               "M 7.8 -4 Q 9 -2  8.5 1 Q 7 0  7 -3.5 Z",
            fill: "url(#el-bodyGrad)",
            stroke: "#0a0a0a",
            "stroke-width": "0.4",
            "stroke-linejoin": "round"
        }));
        g.appendChild(shoulder);

        // ── HEAD — back of skull, white with feather wisps ─────
        var head = el("g", { "class": "eagle-loader__head" });

        // Brown nape — gradient from body brown into white head
        head.appendChild(el("path", {
            d: "M-4.2 -10 Q0 -7.6 4.2 -10 L3.6 -12.2 L-3.6 -12.2 Z",
            fill: "url(#el-bodyGrad)",
            stroke: "#1a1a1a",
            "stroke-width": "0.4"
        }));
        // Nape feather chevrons — fade into the head
        head.appendChild(el("path", {
            d: "M-3 -10.6 Q-1.5 -9.4 0 -10.2 Q1.5 -9.4 3 -10.6 " +
               "M-2.4 -11.6 Q-1.2 -10.6 0 -11.3 Q1.2 -10.6 2.4 -11.6",
            fill: "none",
            stroke: "rgba(150, 110, 70, 0.50)",
            "stroke-width": "0.4",
            "stroke-linecap": "round"
        }));

        // White head — back of skull
        head.appendChild(el("ellipse", {
            cx: "0", cy: "-15.5", rx: "5.2", ry: "5.8",
            fill: "url(#el-headGrad)",
            stroke: "#1a1a1a",
            "stroke-width": "0.6"
        }));
        // Head feather wisps — overlapping scallops on top of skull
        head.appendChild(el("path", {
            d: "M-3.2 -16.8 Q-1.6 -18 0 -17.2 Q1.6 -18 3.2 -16.8 " +
               "M-3.6 -15 Q-1.8 -16 0 -15.3 Q1.8 -16 3.6 -15 " +
               "M-3.0 -13.4 Q-1.2 -14.2 0 -13.8 Q1.2 -14.2 3.0 -13.4 " +
               "M-2.0 -19.6 Q-1.0 -20.2 0 -19.7 Q1.0 -20.2 2.0 -19.6",
            fill: "none",
            stroke: "rgba(150, 130, 100, 0.55)",
            "stroke-width": "0.4",
            "stroke-linecap": "round"
        }));
        // Spine of skull — central feather line
        head.appendChild(el("path", {
            d: "M0 -20.2 L0 -12.6",
            fill: "none",
            stroke: "rgba(120, 100, 70, 0.45)",
            "stroke-width": "0.4",
            "stroke-linecap": "round"
        }));
        // Head top-light highlight
        head.appendChild(el("ellipse", {
            cx: "-1.2", cy: "-17", rx: "1.4", ry: "2.4",
            fill: "rgba(255, 255, 255, 0.40)"
        }));

        // Beak tip — yellow point peeking past the front of the skull
        head.appendChild(el("path", {
            d: "M-1.1 -20.6 L0 -22.6 L1.1 -20.6 Q0 -20.0 -1.1 -20.6 Z",
            fill: "#f4b819",
            stroke: "#1a1a1a",
            "stroke-width": "0.4",
            "stroke-linejoin": "round"
        }));
        // Beak ridge highlight
        head.appendChild(el("path", {
            d: "M0 -22.4 L0 -20.4",
            fill: "none",
            stroke: "#a8770a",
            "stroke-width": "0.3",
            "stroke-linecap": "round"
        }));

        g.appendChild(head);

        return g;
    }

    /**
     * Draw a single flight feather as a filled curved shape with a
     * central rachis and N barb lines branching to either side.
     * basePt and tipPt are the feather's anchor points; `side` controls
     * which side of the bird this feather lives on (-1 = left, +1 = right);
     * `width` is the half-width of the feather at its midpoint.
     */
    function drawDetailedFeather(parent, basePt, tipPt, side, width, barbCount, opts) {
        opts = opts || {};
        var bx = basePt[0], by = basePt[1];
        var tx = tipPt[0],  ty = tipPt[1];

        // 1. Filled feather body — asymmetric teardrop curving outward
        parent.appendChild(el("path", {
            d: "M" + bx + " " + by +
               " Q" + (bx + side * width) + " " + ((by + ty) / 2) + " " + (tx + side * width * 0.45) + " " + ty +
               " L" + (tx - side * width * 0.5) + " " + (ty + 0.3) +
               " Q" + (bx - side * width * 0.85) + " " + ((by + ty) / 2) + " " + bx + " " + by + " Z",
            fill: opts.fill || "url(#el-wingGrad)",
            stroke: opts.stroke || "#0a0a0a",
            "stroke-width": opts.strokeW || "0.32",
            "stroke-linejoin": "round"
        }));

        // 2. Cream-edge rim — light accent along the outer leading edge
        parent.appendChild(el("path", {
            d: "M" + bx + " " + by +
               " Q" + (bx + side * width) + " " + ((by + ty) / 2) + " " + (tx + side * width * 0.45) + " " + ty,
            fill: "none",
            stroke: "rgba(220, 195, 150, 0.35)",
            "stroke-width": "0.32",
            "stroke-linecap": "round"
        }));

        // 3. Inner-edge dark accent — separates from neighbour
        parent.appendChild(el("path", {
            d: "M" + bx + " " + by +
               " Q" + (bx - side * width * 0.85) + " " + ((by + ty) / 2) + " " + (tx - side * width * 0.5) + " " + (ty + 0.3),
            fill: "none",
            stroke: "rgba(0, 0, 0, 0.45)",
            "stroke-width": "0.30",
            "stroke-linecap": "round"
        }));

        // 4. Rachis (central feather spine) — thicker at base, thinner at tip
        parent.appendChild(el("path", {
            d: "M" + bx + " " + by + " L" + tx + " " + ty,
            fill: "none",
            stroke: "#050505",
            "stroke-width": "0.32",
            "stroke-linecap": "round",
            opacity: "0.90"
        }));
        // Highlight stripe along the rachis (subtle top-light)
        parent.appendChild(el("path", {
            d: "M" + (bx + side * 0.18) + " " + (by + 0.2) + " L" + (tx + side * 0.18) + " " + (ty - 0.15),
            fill: "none",
            stroke: "rgba(180, 145, 100, 0.50)",
            "stroke-width": "0.16",
            "stroke-linecap": "round"
        }));

        // 5. Barbs — fine angled lines branching from the rachis to either side
        if (barbCount > 0) {
            var dx = tx - bx, dy = ty - by;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var px = -dy / len, py = dx / len;
            var barbD = "";
            var subBarbD = "";
            for (var i = 1; i <= barbCount; i++) {
                var t = (i + 0.4) / (barbCount + 1);
                var rx = bx + dx * t;
                var ry = by + dy * t;
                var bw = width * (1 - t * 0.30) * 0.85;
                // Outer barb (longer, away from body)
                var oxEnd = rx + px * bw * side;
                var oyEnd = ry + py * bw * side - 0.35;
                barbD += " M" + rx.toFixed(2) + " " + ry.toFixed(2) +
                         " L" + oxEnd.toFixed(2) + " " + oyEnd.toFixed(2);
                // Inner barb (shorter, toward body)
                var ixEnd = rx - px * bw * side * 0.78;
                var iyEnd = ry - py * bw * side * 0.78 + 0.25;
                barbD += " M" + rx.toFixed(2) + " " + ry.toFixed(2) +
                         " L" + ixEnd.toFixed(2) + " " + iyEnd.toFixed(2);
                // Sub-barbs (faint cross-hatches on each barb — barbules)
                if (opts.subBarbs !== false) {
                    var subT = 0.55;
                    var sox = rx + (oxEnd - rx) * subT;
                    var soy = ry + (oyEnd - ry) * subT;
                    var six = rx + (ixEnd - rx) * subT;
                    var siy = ry + (iyEnd - ry) * subT;
                    subBarbD += " M" + sox.toFixed(2) + " " + soy.toFixed(2) +
                                " L" + (sox + dx * 0.06).toFixed(2) + " " + (soy + dy * 0.06).toFixed(2);
                    subBarbD += " M" + six.toFixed(2) + " " + siy.toFixed(2) +
                                " L" + (six + dx * 0.06).toFixed(2) + " " + (siy + dy * 0.06).toFixed(2);
                }
            }
            parent.appendChild(el("path", {
                d: barbD,
                fill: "none",
                stroke: "rgba(10, 5, 2, 0.55)",
                "stroke-width": "0.20",
                "stroke-linecap": "round"
            }));
            if (subBarbD) {
                parent.appendChild(el("path", {
                    d: subBarbD,
                    fill: "none",
                    stroke: "rgba(20, 12, 6, 0.40)",
                    "stroke-width": "0.14",
                    "stroke-linecap": "round"
                }));
            }
        }

        // 6. Dark tip cap (eagle primary tips are darker than the rest)
        if (opts.darkTip) {
            parent.appendChild(el("ellipse", {
                cx: tx, cy: ty - 0.2,
                rx: width * 0.55, ry: 0.7,
                fill: "rgba(0, 0, 0, 0.55)"
            }));
        }

        // 7. Warm tip lightening (rim of light at feather edge)
        if (opts.tipLight !== false) {
            parent.appendChild(el("circle", {
                cx: tx, cy: ty - 0.3,
                r: width * 0.45,
                fill: "rgba(190, 155, 110, 0.30)"
            }));
        }
    }

    /**
     * Build one heavily detailed wing. Layers, shoulder → tip:
     *   1. Wing membrane (base shape)
     *   2. Marginal coverts (tiny scallops along leading edge)
     *   3. Lesser + greater covert rows
     *   4. Alula — small "thumb" feather group near the shoulder
     *   5. Tertiary feathers — three small inner feathers
     *   6. Secondary feathers — four mid-wing flight feathers
     *   7. Primary feathers — five long fingers fanning out at the tip
     *   + rim-light on leading edge, dark band on trailing edge.
     * Every flight feather has rachis + 2-4 barb pairs.
     */
    function buildWing(side) {
        var s = side === "left" ? -1 : 1;
        var cls = "eagle-loader__wing eagle-loader__wing--" + side;
        var w = el("g", { "class": cls });

        // 1. Wing membrane (base teardrop shape)
        w.appendChild(el("path", {
            d: "M" + (s * 7.5) + " -3 " +
               "Q" + (s * 17)  + " -5 " + (s * 24) + " 3 " +
               "Q" + (s * 22)  + " 8 "  + (s * 14) + " 7 " +
               "Q" + (s * 9)   + " 5.5 " + (s * 7.5) + " 0 Z",
            fill: "url(#el-wingGrad)",
            stroke: "#1a1a1a",
            "stroke-width": "0.6",
            "stroke-linejoin": "round"
        }));

        // 2. Marginal coverts — tiny scallops along the leading edge
        w.appendChild(el("path", {
            d: "M" + (s * 8.5) + " -3 Q" + (s * 9.5) + " -3.8 " + (s * 10.5) + " -3 " +
               "M" + (s * 10.5) + " -3 Q" + (s * 11.5) + " -4 " + (s * 12.5) + " -3.4 " +
               "M" + (s * 12.5) + " -3.4 Q" + (s * 13.5) + " -4.4 " + (s * 14.5) + " -3.8 " +
               "M" + (s * 14.5) + " -3.8 Q" + (s * 15.5) + " -4.8 " + (s * 16.5) + " -4.2 " +
               "M" + (s * 16.5) + " -4.2 Q" + (s * 17.7) + " -5.0 " + (s * 19.0) + " -4.4 " +
               "M" + (s * 19.0) + " -4.4 Q" + (s * 20.2) + " -5.2 " + (s * 21.5) + " -4.4 " +
               "M" + (s * 21.5) + " -4.4 Q" + (s * 22.5) + " -5.0 " + (s * 23.5) + " -4.0 ",
            fill: "none",
            stroke: "#050505",
            "stroke-width": "0.30",
            "stroke-linecap": "round"
        }));

        // 3. Lesser + greater covert layer — small overlapping feathers
        var coverts = [
            [s * 9.5,  -2.0, s * 10.5, 1.0],
            [s * 11.0, -2.6, s * 12.0, 1.2],
            [s * 12.5, -3.0, s * 13.5, 1.4],
            [s * 14.0, -3.4, s * 15.0, 1.8],
            [s * 15.6, -3.8, s * 16.6, 2.2],
            [s * 17.2, -3.9, s * 18.2, 2.6],
            [s * 18.8, -4.0, s * 19.8, 3.0],
            [s * 20.4, -4.0, s * 21.4, 3.2]
        ];
        for (var c = 0; c < coverts.length; c++) {
            var cf = coverts[c];
            drawDetailedFeather(w, [cf[0], cf[1]], [cf[2], cf[3]], s, 0.55, 0, { strokeW: "0.28", tipLight: false });
        }

        // 4. Alula — small "thumb" feather group at the leading edge
        w.appendChild(el("path", {
            d: "M" + (s * 9) + " -3.6 Q" + (s * 10.5) + " -5.6 " + (s * 13) + " -3.5 Q" + (s * 11) + " -2.4 " + (s * 9) + " -3.6 Z",
            fill: "url(#el-wingGrad)",
            stroke: "#050505",
            "stroke-width": "0.32",
            "stroke-linejoin": "round"
        }));
        w.appendChild(el("path", {
            d: "M" + (s * 9.5) + " -3.5 L" + (s * 12.5) + " -4.6",
            fill: "none",
            stroke: "#050505",
            "stroke-width": "0.25",
            "stroke-linecap": "round"
        }));

        // 5. Tertiary feathers — three small inner feathers, with barbs
        var terts = [
            [s * 8.5, -2.4,  s * 11.0, 4.0],
            [s * 10.0, -3.3, s * 13.0, 5.0],
            [s * 12.0, -3.8, s * 15.0, 5.6]
        ];
        for (var t = 0; t < terts.length; t++) {
            drawDetailedFeather(w, [terts[t][0], terts[t][1]], [terts[t][2], terts[t][3]], s, 0.95, 2);
        }

        // 6. Secondary feathers — four mid-wing flight feathers, 3 barbs each
        var secs = [
            [s * 14, -3.5, s * 17.0, 6.5],
            [s * 16, -4.0, s * 19.0, 7.0],
            [s * 18, -4.0, s * 21.0, 7.5],
            [s * 20, -3.5, s * 23.0, 7.5]
        ];
        for (var sec = 0; sec < secs.length; sec++) {
            drawDetailedFeather(w, [secs[sec][0], secs[sec][1]], [secs[sec][2], secs[sec][3]], s, 1.10, 3);
        }

        // 7. Primary feathers — five long fingers, 4 barbs each, with the
        // outermost three carrying a darker tip cap (real bald-eagles have
        // black-tipped outer primaries).
        var prims = [
            [s * 21,   3.0,  s * 25,   9.0,  true],
            [s * 19,   4.0,  s * 22.5, 10.0, true],
            [s * 17,   5.0,  s * 20,   10.5, true],
            [s * 15,   5.5,  s * 17.5, 10.5, false],
            [s * 13,   5.6,  s * 15,   10.0, false]
        ];
        for (var p = 0; p < prims.length; p++) {
            drawDetailedFeather(
                w,
                [prims[p][0], prims[p][1]],
                [prims[p][2], prims[p][3]],
                s, 1.30, 4,
                { strokeW: "0.40", darkTip: prims[p][4] }
            );
        }

        // Leading-edge rim light
        w.appendChild(el("path", {
            d: "M" + (s * 8) + " -2.5 Q" + (s * 17) + " -4.5 " + (s * 23) + " 2.5",
            fill: "none",
            stroke: "rgba(255, 240, 200, 0.42)",
            "stroke-width": "0.7",
            "stroke-linecap": "round"
        }));

        // Trailing-edge dark band — separates wing from background
        w.appendChild(el("path", {
            d: "M" + (s * 8) + " 4 Q" + (s * 16) + " 6.5 " + (s * 22) + " 7.5",
            fill: "none",
            stroke: "rgba(0, 0, 0, 0.50)",
            "stroke-width": "0.55",
            "stroke-linecap": "round"
        }));

        return w;
    }

    function buildOrbitSvg() {
        var svg = el("svg", {
            "class": "eagle-loader__orbit",
            "viewBox": "-32 -30 64 54",
            "aria-hidden": "true"
        });

        // Gradient & filter defs — referenced by url(#…) inside buildEagleGroup
        var defs = el("defs");

        var bodyGrad = el("linearGradient", { id: "el-bodyGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
        bodyGrad.appendChild(el("stop", { offset: "0%",   "stop-color": "#5a3621" }));
        bodyGrad.appendChild(el("stop", { offset: "55%",  "stop-color": "#3d2614" }));
        bodyGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#221306" }));
        defs.appendChild(bodyGrad);

        var wingGrad = el("linearGradient", { id: "el-wingGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
        wingGrad.appendChild(el("stop", { offset: "0%",   "stop-color": "#3b2415" }));
        wingGrad.appendChild(el("stop", { offset: "60%",  "stop-color": "#2c1a0e" }));
        wingGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#140a04" }));
        defs.appendChild(wingGrad);

        var headGrad = el("radialGradient", { id: "el-headGrad", cx: "0.5", cy: "0.4", r: "0.6" });
        headGrad.appendChild(el("stop", { offset: "0%",   "stop-color": "#ffffff" }));
        headGrad.appendChild(el("stop", { offset: "65%",  "stop-color": "#f4f0e6" }));
        headGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#c8c0a8" }));
        defs.appendChild(headGrad);

        // Speed-haze gradient — soft contrail behind the bird
        var hazeGrad = el("linearGradient", { id: "el-hazeGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
        hazeGrad.appendChild(el("stop", { offset: "0%",   "stop-color": "rgba(190, 215, 255, 0)" }));
        hazeGrad.appendChild(el("stop", { offset: "55%",  "stop-color": "rgba(190, 215, 255, 0.42)" }));
        hazeGrad.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(190, 215, 255, 0)" }));
        defs.appendChild(hazeGrad);

        svg.appendChild(defs);

        // ── DROP SHADOW — soft ellipse beneath the bird (altitude cue) ──
        svg.appendChild(el("ellipse", {
            "class": "eagle-loader__shadow",
            cx: "0", cy: "21", rx: "16", ry: "2.4",
            fill: "rgba(0, 0, 0, 0.20)"
        }));

        // ── WIND STREAKS — many lines rushing past, varied speeds ────────
        var wind = el("g", { "class": "eagle-loader__wind" });
        var streaks = [
            // x      len  delay  opacity  duration  width
            [-29.0,   6,   0.00,  0.45,    0.85,     0.30],
            [-26.5,  10,   0.45,  0.65,    0.95,     0.42],
            [-24.0,   7,   0.20,  0.50,    0.78,     0.32],
            [-21.5,  14,   0.10,  0.70,    1.05,     0.50],
            [-19.0,   8,   0.65,  0.55,    0.90,     0.36],
            [-17.0,  16,   0.30,  0.75,    1.10,     0.55],
            [-14.5,   9,   0.85,  0.55,    0.88,     0.38],
            [-12.0,  12,   0.15,  0.65,    1.00,     0.45],
            [ -9.5,   6,   0.55,  0.45,    0.82,     0.30],
            [ -7.0,  10,   1.00,  0.60,    0.95,     0.40],
            [ -4.5,   7,   0.40,  0.50,    0.85,     0.32],
            [  4.5,   7,   0.25,  0.50,    0.86,     0.32],
            [  7.0,  10,   0.75,  0.60,    0.95,     0.40],
            [  9.5,   6,   0.10,  0.45,    0.82,     0.30],
            [ 12.0,  12,   0.95,  0.65,    1.00,     0.45],
            [ 14.5,   9,   0.35,  0.55,    0.88,     0.38],
            [ 17.0,  16,   0.70,  0.75,    1.10,     0.55],
            [ 19.0,   8,   0.20,  0.55,    0.90,     0.36],
            [ 21.5,  14,   0.55,  0.70,    1.05,     0.50],
            [ 24.0,   7,   1.05,  0.50,    0.78,     0.32],
            [ 26.5,  10,   0.05,  0.65,    0.95,     0.42],
            [ 29.0,   6,   0.50,  0.45,    0.85,     0.30]
        ];
        for (var sk = 0; sk < streaks.length; sk++) {
            var st = streaks[sk];
            var line = el("rect", {
                x: (st[0] - st[5] / 2).toFixed(2),
                y: "-32",
                width: st[5].toFixed(2),
                height: st[1].toFixed(2),
                rx: (st[5] / 2).toFixed(2),
                fill: "rgba(170, 200, 240, " + st[3] + ")",
                "class": "eagle-loader__streak"
            });
            line.style.animationDelay = st[2] + "s";
            line.style.animationDuration = st[4] + "s";
            wind.appendChild(line);
        }
        // Speed dust particles — small dots that blast past the bird
        var dustCount = 18;
        for (var d = 0; d < dustCount; d++) {
            var dx = (Math.random() * 60 - 30).toFixed(2);
            var dot = el("circle", {
                cx: dx,
                cy: "-32",
                r: (0.30 + Math.random() * 0.30).toFixed(2),
                fill: "rgba(220, 235, 255, 0.7)",
                "class": "eagle-loader__dust"
            });
            dot.style.animationDelay = (Math.random() * 1.6).toFixed(2) + "s";
            dot.style.animationDuration = (0.7 + Math.random() * 0.5).toFixed(2) + "s";
            wind.appendChild(dot);
        }
        svg.appendChild(wind);

        // ── VAPOR CONTRAILS — long thin streaks tailing each wing tip ───
        var vaporL = el("g", { "class": "eagle-loader__vapor eagle-loader__vapor--left" });
        var vaporR = el("g", { "class": "eagle-loader__vapor eagle-loader__vapor--right" });
        for (var vi = 0; vi < 4; vi++) {
            var vapO = (0.55 - vi * 0.12).toFixed(2);
            var vapY = (12 + vi * 4);
            var vapLen = (8 - vi * 1.2).toFixed(2);
            // left
            var vL = el("rect", {
                x: (-22 - vi * 0.8).toFixed(2),
                y: vapY.toFixed(2),
                width: "0.55",
                height: vapLen,
                rx: "0.27",
                fill: "rgba(200, 220, 250, " + vapO + ")",
                "class": "eagle-loader__vapor-streak"
            });
            vL.style.animationDelay = (vi * 0.15) + "s";
            vaporL.appendChild(vL);
            // right
            var vR = el("rect", {
                x: (21.5 + vi * 0.8).toFixed(2),
                y: vapY.toFixed(2),
                width: "0.55",
                height: vapLen,
                rx: "0.27",
                fill: "rgba(200, 220, 250, " + vapO + ")",
                "class": "eagle-loader__vapor-streak"
            });
            vR.style.animationDelay = (vi * 0.15) + "s";
            vaporR.appendChild(vR);
        }
        svg.appendChild(vaporL);
        svg.appendChild(vaporR);

        // ── SPEED HAZE — soft contrail trailing behind the body ──────────
        svg.appendChild(el("path", {
            "class": "eagle-loader__haze",
            d: "M-7 22 Q-3 26 0 27 Q3 26 7 22 Q3 30 0 30.5 Q-3 30 -7 22 Z",
            fill: "url(#el-hazeGrad)",
            opacity: "0.55"
        }));

        var host = el("g", { "class": "eagle-loader__eagle-host" });
        host.appendChild(buildEagleGroup());
        svg.appendChild(host);

        // ── WING-TIP VORTEX CURLS — small spirals at each wing tip ──────
        var vortexL = el("g", { "class": "eagle-loader__vortex eagle-loader__vortex--left" });
        vortexL.appendChild(el("path", {
            d: "M-26 12 Q-29 15 -27 18 Q-25 19.5 -24 18 Q-25 17 -26 17.5",
            fill: "none",
            stroke: "rgba(180, 210, 245, 0.55)",
            "stroke-width": "0.45",
            "stroke-linecap": "round"
        }));
        vortexL.appendChild(el("path", {
            d: "M-22 14 Q-24 17 -22.5 19",
            fill: "none",
            stroke: "rgba(180, 210, 245, 0.40)",
            "stroke-width": "0.35",
            "stroke-linecap": "round"
        }));
        svg.appendChild(vortexL);

        var vortexR = el("g", { "class": "eagle-loader__vortex eagle-loader__vortex--right" });
        vortexR.appendChild(el("path", {
            d: "M26 12 Q29 15 27 18 Q25 19.5 24 18 Q25 17 26 17.5",
            fill: "none",
            stroke: "rgba(180, 210, 245, 0.55)",
            "stroke-width": "0.45",
            "stroke-linecap": "round"
        }));
        vortexR.appendChild(el("path", {
            d: "M22 14 Q24 17 22.5 19",
            fill: "none",
            stroke: "rgba(180, 210, 245, 0.40)",
            "stroke-width": "0.35",
            "stroke-linecap": "round"
        }));
        svg.appendChild(vortexR);

        return svg;
    }

    function build() {
        var root = document.createElement("div");
        root.className = ROOT_CLASS;
        root.setAttribute("role", "status");
        root.setAttribute("aria-live", "polite");
        root.setAttribute("aria-label", "Loading");

        var lane = document.createElement("div");
        lane.className = "eagle-loader__lane";
        lane.appendChild(buildOrbitSvg());
        root.appendChild(lane);

        var caption = document.createElement("div");
        caption.className = "eagle-loader__caption";
        caption.textContent = "loading";
        root.appendChild(caption);

        return root;
    }

    function ensureRoot() {
        if (rootEl && rootEl.isConnected) return rootEl;
        rootEl = document.querySelector("." + ROOT_CLASS);
        if (!rootEl) {
            rootEl = build();
            (document.body || document.documentElement).appendChild(rootEl);
        }
        return rootEl;
    }

    function show() {
        var r = ensureRoot();
        r.classList.remove(HIDDEN_CLASS);
        if (document.body) document.body.classList.add("eagle-loading");
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        shownAt = Date.now();
        if (typeof console !== "undefined" && console.debug) {
            console.debug("[eagle-loader] show");
        }
    }

    function hide() {
        if (!rootEl) return;
        var elapsed = Date.now() - shownAt;
        var wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
            if (!rootEl) return;
            rootEl.classList.add(HIDDEN_CLASS);
            if (document.body) document.body.classList.remove("eagle-loading");
            if (typeof console !== "undefined" && console.debug) {
                console.debug("[eagle-loader] hide");
            }
        }, wait);
    }

    function isVisible() {
        return !!(rootEl && rootEl.isConnected && !rootEl.classList.contains(HIDDEN_CLASS));
    }

    function bindLink(a) {
        if (!a || a.dataset.eagleBound === "1") return;
        a.dataset.eagleBound = "1";
        a.addEventListener("click", function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            var href = a.getAttribute("href") || "";
            if (!href || href.charAt(0) === "#") return;
            if (a.target && a.target !== "_self") return;
            show();
        }, false);
    }

    function bindAllInternalLinks() {
        var links = document.querySelectorAll("a[href]");
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var href = a.getAttribute("href") || "";
            if (!href || href.charAt(0) === "#") continue;
            if (/^https?:\/\//i.test(href)) {
                try {
                    var u = new URL(href, window.location.href);
                    if (u.origin !== window.location.origin) continue;
                } catch (err) { continue; }
            }
            if (a.target && a.target !== "_self") continue;
            bindLink(a);
        }
    }

    function init() {
        if (typeof console !== "undefined" && console.debug) {
            console.debug("[eagle-loader] init");
        }
        if (document.body) {
            document.body.classList.add("polish");
        }
        ensureRoot();
        show();
    }

    function onReady() {
        init();
        bindAllInternalLinks();
        if (typeof MutationObserver !== "undefined") {
            var mo = new MutationObserver(function () { bindAllInternalLinks(); });
            mo.observe(document.documentElement, { childList: true, subtree: true });
        }
    }

    function onLoad() { hide(); }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }

    if (document.readyState === "complete") {
        setTimeout(onLoad, 0);
    } else {
        window.addEventListener("load", onLoad);
    }

    window.EagleLoader = {
        show: show,
        hide: hide,
        isVisible: isVisible,
        bindLink: bindLink
    };
})();
