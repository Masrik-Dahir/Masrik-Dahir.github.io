(function () {
    var canvas = document.getElementById('canv');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var bgCvs   = document.createElement('canvas'), bgC   = bgCvs.getContext('2d');
    var cityCvs = document.createElement('canvas'), cityC = cityCvs.getContext('2d');
    var dynCvs  = document.createElement('canvas'), dynC  = dynCvs.getContext('2d');

    var W, H, GROUND;
    var animId, lastTime = 0;

    /* ── palette ── everything white-ish */
    var C = {
        ground:    '#1a1a28',
        gndLine:   '#12121e',
        gndMark:   'rgba(255,220,0,0.75)',
        winDark:   'rgba(15,25,50,0.80)',
        winLit:    'rgba(255,225,100,0.92)',
        winBlue:   'rgba(80,150,220,0.75)',
        winOff:    'rgba(30,50,90,0.55)'
    };

    var LM_COLORS = {
        liberty: {
            island:   '#1e1e24',
            pedestal: '#1a1a20',
            fill:     '#161618',
            line:     '#2c2c38',
            torch:    '#ffb030'
        },
        bridge: {
            fill:  '#1c1c24',
            line:  '#2e2e3c',
            cable: '#363644',
            deck:  '#181820'
        },
        flatiron: {
            fill:    '#191922',
            line:    '#28283a',
            cornice: '#1e1e28'
        },
        empire: {
            fill:    '#181820',
            line:    '#26263c',
            mast:    '#20202c',
            antenna: '#44445a'
        },
        rock: {
            fill:    '#1a1a24',
            line:    '#28283a',
            setback: '#1e1e2a'
        },
        chrysler: {
            fill:   '#161620',
            line:   '#22222e',
            crown:  '#28283c',
            needle: '#40405a'
        },
        wtc: {
            fill:    '#121218',
            line:    '#1c1c28',
            glass:   '#161626',
            reflect: 'rgba(70,70,110,0.05)'
        }
    };

    var WIN_COLORS = [
        'rgba(15,25,55,0.85)',
        'rgba(60,120,200,0.70)',
        'rgba(255,222,80,0.95)'
    ];
    var WIN_POOL = [0,0,0,0,0,1,1,2];
    var WIN_FLICKER_INT = 1800;
    var winFlickerT     = 0;

    /* ── weather events ── (vanilla + invented apocalyptic disasters) */
    var EVENTS = [
        { type:'clear',      sky0:'#010810', sky1:'#0b2040', sun:'rgba(255,240,160,0.82)', sunR:28 },
        { type:'rain',       sky0:'#06080c', sky1:'#111c28', sun:null, sunR:0 },
        { type:'storm',      sky0:'#030305', sky1:'#08101a', sun:null, sunR:0 },
        { type:'snow',       sky0:'#0c1422', sky1:'#243448', sun:'rgba(210,225,245,0.50)', sunR:22 },
        { type:'blizzard',   sky0:'#080e1c', sky1:'#182638', sun:null, sunR:0 },
        { type:'tornado',    sky0:'#060908', sky1:'#10180c', sun:null, sunR:0 },
        { type:'flood',      sky0:'#030a12', sky1:'#081624', sun:null, sunR:0 },
        { type:'hail',       sky0:'#080c12', sky1:'#141c24', sun:null, sunR:0 },
        { type:'wind',       sky0:'#040c1e', sky1:'#142a56', sun:'rgba(225,230,195,0.58)', sunR:24 },
        { type:'heat',       sky0:'#240600', sky1:'#601400', sun:'rgba(255,90,10,0.92)',   sunR:38 },

        /* ── invented apocalyptic events ── */
        { type:'earthquake', sky0:'#0a0808', sky1:'#1a1410', sun:'rgba(255,180,80,0.40)', sunR:20 },
        { type:'tsunami',    sky0:'#020410', sky1:'#06122a', sun:null, sunR:0 },
        { type:'meteors',    sky0:'#0a0205', sky1:'#240810', sun:'rgba(255,80,40,0.65)',  sunR:18 },
        { type:'volcano',    sky0:'#1a0400', sky1:'#480800', sun:'rgba(255,100,20,0.95)', sunR:34 },
        { type:'sandstorm',  sky0:'#2a1808', sky1:'#7a3a14', sun:'rgba(255,170,60,0.45)', sunR:22 },
        { type:'acidrain',   sky0:'#020a04', sky1:'#0a2210', sun:null, sunR:0 },
        { type:'solarflare', sky0:'#180a02', sky1:'#5a2800', sun:'rgba(255,240,150,1.0)', sunR:60 },
        { type:'bloodmoon',  sky0:'#0a0204', sky1:'#1c0608', sun:'rgba(220,30,30,0.95)',  sunR:38 },
        { type:'firenado',   sky0:'#0a0200', sky1:'#280a00', sun:null, sunR:0 },
        { type:'plasma',     sky0:'#0a0220', sky1:'#1c0840', sun:null, sunR:0 },
        { type:'ashfall',    sky0:'#0a0808', sky1:'#1a1818', sun:'rgba(160,140,120,0.45)', sunR:20 },
        { type:'bloodrain',  sky0:'#0a0204', sky1:'#220608', sun:null, sunR:0 },
        { type:'locusts',    sky0:'#0a0a04', sky1:'#1c1a08', sun:'rgba(200,180,80,0.50)', sunR:18 },
        { type:'fogvenom',   sky0:'#020a04', sky1:'#0a1808', sun:null, sunR:0 },
        { type:'blackhole',  sky0:'#000000', sky1:'#080010', sun:null, sunR:0 },
        { type:'aurora',     sky0:'#020410', sky1:'#0a1a30', sun:'rgba(220,230,255,0.45)', sunR:18 },
        { type:'eclipse',    sky0:'#020204', sky1:'#0a0612', sun:'rgba(20,20,30,1)',       sunR:34 },
        { type:'embers',     sky0:'#0a0200', sky1:'#3a1004', sun:'rgba(255,140,30,0.65)',  sunR:24 },
        { type:'fireworks',  sky0:'#020208', sky1:'#0a0418', sun:null, sunR:0 },
        { type:'ufo',        sky0:'#020012', sky1:'#0a0230', sun:null, sunR:0 },
        { type:'frostquake', sky0:'#04101a', sky1:'#0a2438', sun:'rgba(180,220,255,0.55)', sunR:18 },
        { type:'glitch',     sky0:'#020208', sky1:'#080220', sun:null, sunR:0 }
    ];

    /* start on a real weather/disaster event (skip index 0 = 'clear') */
    var eventIndex = 1 + Math.floor(Math.random() * (EVENTS.length - 1));
    var eventTimer = 0, EVENT_DURATION = 13000;

    /* ── disaster-specific state ── */
    var shake = 0, shakeMag = 0;
    var cracks = [], dustCol = [];
    var tsunamiX = 0, tsunamiActive = false, tsunamiFoam = [];
    var meteors = [], meteorImpacts = [];
    var lavaBombs = [], lavaPools = [], volcanoPlume = 0;
    var sandLayers = [];
    var acidPools = [];
    var flareT = 0, flareRays = [];
    var bats = [];
    var arcs = [];
    var ashAccum = [];
    var bloodPools = [];
    var locustSwarm = [];
    var venomFog = [];
    var bhRot = 0, bhParts = [];
    var auroraRibbons = [];
    var embersList = [];
    var fireworks = [];
    var ufos = [];
    var ufoBeams = [];
    var iceSpikes = [];
    var glitchBands = [];

    /* ── particles ── */
    var particles = [], POOL = 380;
    var tX = 0, tSwayT = 0, tParts = [];
    var floodY = 0, floodRising = false;
    var splashes = [];
    var ltTimer = 0, ltActive = false, ltPts = [], ltFlash = 0;

    /* ── generic background buildings ── */
    var BGBUILDS = [];
    var CLOUDS = [];
    var STREET_OBJ = [];

    function rng(a, b)  { return Math.random() * (b - a) + a; }
    function rngI(a, b) { return Math.floor(rng(a, b)); }

    function resize() {
        W = canvas.width  = bgCvs.width  = cityCvs.width  = dynCvs.width  = window.innerWidth;
        H = canvas.height = bgCvs.height = cityCvs.height = dynCvs.height = window.innerHeight;
        GROUND = Math.floor(H * 0.80);
    }

    /* ══════════════════════════════════════
       LANDMARK DRAWING FUNCTIONS
       Each draws at full height.
       Progress clipping done by drawLandmark().
    ══════════════════════════════════════ */

    /* helper: filled + stroked rect */
    function fr(c, x, y, w, h) {
        c.fillRect(x, y, w, h);
        c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    function depthOverlay(c, x, y, w, h) {
        var g = c.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0,    'rgba(0,0,0,0.04)');
        g.addColorStop(0.30, 'rgba(255,255,255,0.18)');
        g.addColorStop(0.65, 'rgba(255,255,255,0.08)');
        g.addColorStop(1,    'rgba(0,0,0,0.07)');
        return g;
    }

    /* ── Empire State Building ── */
    function drawEmpireState(c, cx, gy, wins) {
        var bH = H * 0.54;
        var col = LM_COLORS.empire;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        /* base */         fr(c, cx - 88, gy - bH * 0.14, 176, bH * 0.14);
        /* setback 1 */    fr(c, cx - 66, gy - bH * 0.34, 132, bH * 0.20);
        /* setback 2 */    fr(c, cx - 46, gy - bH * 0.54, 92,  bH * 0.20);
        c.fillStyle = depthOverlay(c, cx-46, gy-bH*0.54, 92, bH*0.54);
        c.fillRect(cx-46, gy-bH*0.54, 92, bH*0.54);
        c.fillStyle = col.fill;
        /* setback 3 */    fr(c, cx - 28, gy - bH * 0.70, 56,  bH * 0.16);
        /* mast body */    fr(c, cx - 13, gy - bH * 0.84, 26,  bH * 0.14);
        /* mooring cap */  fr(c, cx -  5, gy - bH * 0.88, 10,  bH * 0.04);
        /* antenna */
        c.strokeStyle = col.line;
        c.lineWidth   = 2.5;
        c.beginPath(); c.moveTo(cx, gy - bH * 0.88); c.lineTo(cx, gy - bH); c.stroke();
        /* windows grid on mid section */
        var wi3 = 0;
        for (var row = 0; row < 7; row++) {
            for (var col2 = -4; col2 <= 4; col2++) {
                c.fillStyle = WIN_COLORS[wins && wins[wi3] !== undefined ? wins[wi3] : 0];
                c.fillRect(cx + col2 * 14 - 4, gy - bH * 0.12 + row * -16 - 8, 8, 10);
                wi3++;
            }
        }
    }

    /* ── Chrysler Building ── */
    function drawChrysler(c, cx, gy, wins) {
        var bH = H * 0.50;
        var col = LM_COLORS.chrysler;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        /* base */         fr(c, cx - 72, gy - bH * 0.16, 144, bH * 0.16);
        c.fillStyle = depthOverlay(c, cx-72, gy-bH*0.34, 144, bH*0.34);
        c.fillRect(cx-72, gy-bH*0.34, 144, bH*0.34);
        c.fillStyle = col.fill;
        /* setback 1 */    fr(c, cx - 52, gy - bH * 0.34, 104, bH * 0.18);
        /* setback 2 */    fr(c, cx - 36, gy - bH * 0.50, 72,  bH * 0.16);
        /* setback 3 */    fr(c, cx - 22, gy - bH * 0.62, 44,  bH * 0.12);
        /* crown tiers — Art Deco sunburst arcs */
        var crownBase = gy - bH * 0.62;
        for (var tier = 0; tier < 5; tier++) {
            var tw  = 38 - tier * 6;
            var ty  = crownBase - tier * bH * 0.04 - bH * 0.02;
            fr(c, cx - tw / 2, ty, tw, bH * 0.025);
            /* sunburst arc */
            c.beginPath();
            c.arc(cx, ty + bH * 0.025, tw / 2, Math.PI, 0);
            c.strokeStyle = col.line;
            c.lineWidth   = 0.8;
            c.stroke();
        }
        /* needle */
        c.strokeStyle = col.line; c.lineWidth = 2;
        var needleBase = crownBase - 5 * bH * 0.04 - bH * 0.02;
        c.beginPath(); c.moveTo(cx, needleBase); c.lineTo(cx, gy - bH); c.stroke();
        var wi3 = 0;
        for (var row = 0; row < 6; row++) {
            for (var col2 = -3; col2 <= 3; col2++) {
                c.fillStyle = WIN_COLORS[wins && wins[wi3] !== undefined ? wins[wi3] : 0];
                c.fillRect(cx + col2 * 14 - 4, gy - bH * 0.14 + row * -16 - 8, 8, 10);
                wi3++;
            }
        }
    }

    /* ── One World Trade Center ── */
    function drawOneWTC(c, cx, gy, wins) {
        var bH = H * 0.60;
        var col = LM_COLORS.wtc;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        /* square base podium */
        fr(c, cx - 55, gy - bH * 0.08, 110, bH * 0.08);
        /* tapered tower — draw as trapezoid */
        c.beginPath();
        c.moveTo(cx - 50, gy - bH * 0.08);
        c.lineTo(cx + 50, gy - bH * 0.08);
        c.lineTo(cx + 18, gy - bH * 0.85);
        c.lineTo(cx - 18, gy - bH * 0.85);
        c.closePath();
        c.fill(); c.stroke();
        c.fillStyle = depthOverlay(c, cx-50, gy-bH*0.85, 100, bH*0.85);
        c.fillRect(cx-50, gy-bH*0.85, 100, bH*0.85);
        c.fillStyle = col.fill;
        /* chamfered mid section highlight */
        c.strokeStyle = '#d8d8d8';
        c.lineWidth   = 0.5;
        c.beginPath();
        c.moveTo(cx - 30, gy - bH * 0.30);
        c.lineTo(cx + 30, gy - bH * 0.30);
        c.stroke();
        c.beginPath();
        c.moveTo(cx - 20, gy - bH * 0.60);
        c.lineTo(cx + 20, gy - bH * 0.60);
        c.stroke();
        /* observation deck */
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        fr(c, cx - 10, gy - bH * 0.875, 20, bH * 0.025);
        /* antenna */
        c.strokeStyle = col.line; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(cx, gy - bH * 0.875); c.lineTo(cx, gy - bH); c.stroke();
        /* windows */
        var wi4 = 0;
        for (var row = 0; row < 14; row++) {
            var frac = row / 14;
            var halfW = 46 - frac * 28;
            for (var col2 = -3; col2 <= 3; col2++) {
                if (Math.abs(col2 * 12) < halfW - 4) {
                    c.fillStyle = WIN_COLORS[wins && wins[wi4] !== undefined ? wins[wi4] : 0];
                    c.fillRect(cx + col2 * 12 - 4, gy - bH * 0.06 - row * 20 - 14, 8, 12);
                }
                wi4++;
            }
        }
    }

    /* ── Statue of Liberty ── */
    function drawStatueLiberty(c, cx, gy, wins) {
        var bH = H * 0.32;
        var col = LM_COLORS.liberty;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        /* island / star fort base */
        c.fillStyle = '#e4e4e4';
        c.fillRect(cx - 50, gy - bH * 0.06, 100, bH * 0.06);
        c.fillRect(cx - 38, gy - bH * 0.12, 76, bH * 0.06);
        /* pedestal */
        c.fillStyle = col.fill;
        fr(c, cx - 28, gy - bH * 0.30, 56, bH * 0.18);
        fr(c, cx - 22, gy - bH * 0.36, 44, bH * 0.06);
        /* robe / body */
        c.beginPath();
        c.moveTo(cx - 18, gy - bH * 0.36);
        c.lineTo(cx + 18, gy - bH * 0.36);
        c.lineTo(cx + 14, gy - bH * 0.62);
        c.lineTo(cx - 14, gy - bH * 0.62);
        c.closePath();
        c.fill(); c.stroke();
        c.fillStyle = depthOverlay(c, cx-18, gy-bH*0.36, 32, bH*0.26);
        c.fillRect(cx-18, gy-bH*0.36, 32, bH*0.26);
        c.fillStyle = col.fill;
        /* head */
        c.beginPath();
        c.arc(cx, gy - bH * 0.68, 12, 0, Math.PI * 2);
        c.fill(); c.stroke();
        /* crown spikes */
        c.strokeStyle = col.line; c.lineWidth = 1.5;
        for (var sp = -3; sp <= 3; sp += 1) {
            c.beginPath();
            c.moveTo(cx + sp * 4, gy - bH * 0.66);
            c.lineTo(cx + sp * 4.5, gy - bH * 0.78);
            c.stroke();
        }
        /* raised right arm */
        c.strokeStyle = col.line; c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx + 12, gy - bH * 0.62);
        c.lineTo(cx + 22, gy - bH * 0.78);
        c.lineTo(cx + 18, gy - bH * 0.88);
        c.stroke();
        /* torch flame */
        c.fillStyle = 'rgba(255,210,80,0.7)';
        c.beginPath();
        c.ellipse(cx + 18, gy - bH * 0.93, 5, 8, 0, 0, Math.PI * 2);
        c.fill();
    }

    /* ── Brooklyn Bridge (two towers + cables) ── */
    function drawBrooklynBridge(c, lx, rx, gy, wins) {
        /* lx = left tower center, rx = right tower center */
        var tH = H * 0.30;
        var col = LM_COLORS.bridge;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;

        function tower(tx) {
            /* base */     fr(c, tx - 24, gy - tH * 0.20, 48, tH * 0.20);
            /* mid */      fr(c, tx - 20, gy - tH * 0.72, 40, tH * 0.52);
            c.fillStyle = depthOverlay(c, tx-20, gy-tH*0.72, 40, tH*0.72);
            c.fillRect(tx-20, gy-tH*0.72, 40, tH*0.72);
            c.fillStyle = col.fill;
            /* gothic arch cutout (drawn as darker rect) */
            c.fillStyle = 'rgba(180,180,180,0.4)';
            c.fillRect(tx - 8, gy - tH * 0.56, 16, tH * 0.24);
            c.fillStyle = col.fill;
            /* arch top */
            c.beginPath();
            c.arc(tx, gy - tH * 0.56, 8, Math.PI, 0);
            c.fillStyle = 'rgba(180,180,180,0.4)';
            c.fill();
            c.fillStyle = col.fill;
            /* top gothic points */
            c.beginPath();
            c.moveTo(tx - 20, gy - tH * 0.72);
            c.lineTo(tx,      gy - tH);
            c.lineTo(tx + 20, gy - tH * 0.72);
            c.closePath();
            c.fill(); c.stroke();
        }

        tower(lx); tower(rx);

        /* main suspension cables */
        var deckY = gy - tH * 0.08;
        var peakL = gy - tH * 0.96, peakR = gy - tH * 0.96;
        c.strokeStyle = col.line; c.lineWidth = 1.5;
        for (var s = 0; s < 2; s++) {
            var oy = (s === 0) ? -6 : 6;
            c.beginPath();
            c.moveTo(lx - 120, deckY + oy);
            c.quadraticCurveTo(lx - 60, deckY + 20 + oy, lx, gy - tH * 0.96);
            c.stroke();
            c.beginPath();
            c.moveTo(lx, gy - tH * 0.96);
            c.quadraticCurveTo((lx + rx) / 2, deckY + 30 + oy, rx, gy - tH * 0.96);
            c.stroke();
            c.beginPath();
            c.moveTo(rx, gy - tH * 0.96);
            c.quadraticCurveTo(rx + 60, deckY + 20 + oy, rx + 120, deckY + oy);
            c.stroke();
        }

        /* vertical hanger cables */
        c.lineWidth = 0.6;
        for (var hx = lx - 110; hx <= rx + 110; hx += 18) {
            c.beginPath();
            c.moveTo(hx, deckY - 3);
            /* approximate catenary height at this x */
            var d = Math.abs(hx - (lx + rx) / 2) / ((rx - lx) / 2 + 100);
            var cableY = gy - tH * 0.96 + (1 - d * d) * (deckY - (gy - tH * 0.96));
            c.lineTo(hx, cableY);
            c.stroke();
        }

        /* bridge deck */
        c.fillStyle = col.fill;
        c.fillRect(lx - 120, deckY - 4, rx - lx + 240, 8);
        c.strokeStyle = col.line; c.lineWidth = 1;
        c.strokeRect(lx - 120, deckY - 4, rx - lx + 240, 8);
    }

    /* ── Flatiron Building ── */
    function drawFlatiron(c, cx, gy, wins) {
        var bH = H * 0.34;
        var col = LM_COLORS.flatiron;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        /* triangular footprint — narrow end at cx-40, wide end at cx+30 */
        c.beginPath();
        c.moveTo(cx - 38, gy);
        c.lineTo(cx + 32, gy);
        c.lineTo(cx + 32, gy - bH * 0.95);
        c.lineTo(cx,      gy - bH);
        c.lineTo(cx - 38, gy - bH * 0.95);
        c.closePath();
        c.fill(); c.stroke();
        c.fillStyle = depthOverlay(c, cx-38, gy-bH, 70, bH);
        c.fillRect(cx-38, gy-bH, 70, bH);
        c.fillStyle = col.fill;
        /* cornice cap */
        fr(c, cx - 40, gy - bH, 72, bH * 0.025);
        /* window grid clipped to triangle so windows can't escape the shape */
        c.save();
        c.beginPath();
        c.moveTo(cx - 38, gy);
        c.lineTo(cx + 32, gy);
        c.lineTo(cx + 32, gy - bH * 0.95);
        c.lineTo(cx,      gy - bH);
        c.lineTo(cx - 38, gy - bH * 0.95);
        c.closePath();
        c.clip();
        var wi3 = 0;
        for (var row = 0; row < 10; row++) {
            for (var col2 = 0; col2 < 5; col2++) {
                c.fillStyle = WIN_COLORS[wins && wins[wi3] !== undefined ? wins[wi3] : 0];
                c.fillRect(cx - 2 + col2 * 12, gy - bH * 0.10 - row * 28 - 14, 8, 16);
                wi3++;
            }
        }
        c.restore();
    }

    /* ── Rockefeller Center / 30 Rock ── */
    function draw30Rock(c, cx, gy, wins) {
        var bH = H * 0.38;
        var col = LM_COLORS.rock;
        c.fillStyle   = col.fill;
        c.strokeStyle = col.line;
        c.lineWidth   = 1;
        fr(c, cx - 58, gy - bH * 0.12, 116, bH * 0.12);
        fr(c, cx - 44, gy - bH * 0.32, 88,  bH * 0.20);
        fr(c, cx - 30, gy - bH * 0.60, 60,  bH * 0.28);
        c.fillStyle = depthOverlay(c, cx-30, gy-bH*0.60, 60, bH*0.60);
        c.fillRect(cx-30, gy-bH*0.60, 60, bH*0.60);
        c.fillStyle = col.fill;
        fr(c, cx - 18, gy - bH * 0.80, 36,  bH * 0.20);
        fr(c, cx - 10, gy - bH,        20,  bH * 0.20);
        var wi3 = 0;
        for (var row = 0; row < 8; row++) {
            for (var col2 = -3; col2 <= 3; col2++) {
                c.fillStyle = WIN_COLORS[wins && wins[wi3] !== undefined ? wins[wi3] : 0];
                c.fillRect(cx + col2 * 11 - 3, gy - bH * 0.10 - row * 22 - 12, 7, 14);
                wi3++;
            }
        }
    }

    /* ── generic background buildings ── */
    function buildBgCity() {
        BGBUILDS = [];
        var x = 0;
        while (x < W + 20) {
            var bw = rngI(30, 90);
            var bh = rngI(Math.floor(H * 0.08), Math.floor(H * 0.30));
            BGBUILDS.push({ x: x, w: bw, h: bh, currentH: 0, growRate: rng(0.4, 1.4) });
            x += bw + rngI(0, 5);
        }
        STREET_OBJ = [];
        var lp2;
        for (lp2 = 80; lp2 < W - 40; lp2 += rngI(110, 180))
            STREET_OBJ.push({ type: 'lamp', x: lp2 });
        var taxiCount = rngI(3, 7);
        for (var ti = 0; ti < taxiCount; ti++)
            STREET_OBJ.push({ type: 'taxi', x: rng(60, W-80), w: rngI(24, 34) });
        for (var tr = 140; tr < W - 80; tr += rngI(160, 270))
            STREET_OBJ.push({ type: 'tree', x: tr, h: rngI(22, 38) });
    }

    function buildClouds() {
        var t = EVENTS[eventIndex].type;
        CLOUDS = [];
        if (t === 'heat' || t === 'blackhole' || t === 'solarflare' || t === 'eclipse' || t === 'glitch') return;
        var isStratus = (t === 'snow' || t === 'blizzard');
        var isDark    = (t === 'storm' || t === 'tornado' || t === 'flood' || t === 'bloodrain' || t === 'firenado' || t === 'meteors' || t === 'volcano' || t === 'ashfall');
        var isVenom   = (t === 'fogvenom' || t === 'acidrain');
        var isSand    = (t === 'sandstorm');
        var isBlood   = (t === 'bloodmoon' || t === 'bloodrain');
        var count = isDark ? rngI(6,9) : (t==='clear'||t==='wind'||t==='aurora') ? rngI(3,5) : rngI(4,7);
        var color = isBlood ? '#5a1a20' : isVenom ? '#9ad080' : isSand ? '#c08648' :
                    isDark ? '#b8bdc8' : isStratus ? '#dce2ee' : '#edf2f8';
        for (var i = 0; i < count; i++) {
            var cx3  = rng(W*0.04, W*0.92);
            var cy3  = rng(H*0.03, H*0.26);
            var baseR = isStratus ? rng(50,90) : (isDark ? rng(40,75) : rng(22,55));
            var circCount = rngI(4, 9);
            var circles = [];
            for (var ci = 0; ci < circCount; ci++) {
                circles.push({
                    dx: rng(-baseR*0.9, baseR*0.9),
                    dy: isStratus ? rng(-baseR*0.15, baseR*0.15) : rng(-baseR*0.45, baseR*0.30),
                    rx: isStratus ? rng(baseR*0.9, baseR*1.8) : rng(baseR*0.55, baseR*1.05),
                    ry: isStratus ? rng(baseR*0.22, baseR*0.40) : rng(baseR*0.55, baseR*1.05)
                });
            }
            var alpha = isDark ? rng(0.38,0.60) : (t==='clear') ? rng(0.12,0.26) : rng(0.26,0.46);
            CLOUDS.push({ x: cx3, y: cy3, circles: circles, alpha: alpha, color: color });
        }
    }

    /* ── positions of landmarks (recomputed on resize) ── */
    var LM = []; /* { drawFn, args, fullH, currentH, growRate } */

    function buildLandmarks() {
        LM = [
            /* Statue of Liberty — far left */
            { fn: 'liberty',  cx: W * 0.10, fullH: H * 0.32, currentH: 0, growRate: 0.4 },
            /* Brooklyn Bridge — spans W*0.23 to W*0.37 */
            { fn: 'bridge',   lx: W * 0.23, rx: W * 0.37, fullH: H * 0.30, currentH: 0, growRate: 0.5 },
            /* Flatiron */
            { fn: 'flatiron', cx: W * 0.47, fullH: H * 0.34, currentH: 0, growRate: 0.7 },
            /* Empire State */
            { fn: 'empire',   cx: W * 0.56, fullH: H * 0.54, currentH: 0, growRate: 0.6 },
            /* 30 Rock */
            { fn: 'rock',     cx: W * 0.67, fullH: H * 0.38, currentH: 0, growRate: 0.65 },
            /* Chrysler */
            { fn: 'chrysler', cx: W * 0.76, fullH: H * 0.50, currentH: 0, growRate: 0.55 },
            /* One WTC */
            { fn: 'wtc',      cx: W * 0.87, fullH: H * 0.60, currentH: 0, growRate: 0.5 }
        ];

        var WIN_COUNTS = { empire:63, chrysler:42, wtc:98, liberty:0, bridge:0, flatiron:50, rock:56 };
        for (var li2 = 0; li2 < LM.length; li2++) {
            var lm2 = LM[li2];
            var wc = WIN_COUNTS[lm2.fn] || 0;
            lm2.wins = [];
            for (var wi2 = 0; wi2 < wc; wi2++)
                lm2.wins.push(WIN_POOL[Math.floor(rng(0, WIN_POOL.length))]);
        }
    }

    function flickerWindows() {
        for (var fi = 0; fi < LM.length; fi++) {
            var lmf = LM[fi];
            if (!lmf.wins || lmf.wins.length === 0) continue;
            var count = rngI(1, 4);
            for (var fk = 0; fk < count; fk++) {
                var idx = rngI(0, lmf.wins.length);
                lmf.wins[idx] = WIN_POOL[rngI(0, WIN_POOL.length)];
            }
        }
    }

    /* ── draw landmark with growth clip ── */
    function drawOneLandmark(c, lm, ts) {
        var prog = Math.min(1, lm.currentH / lm.fullH);
        if (prog <= 0) return;
        var clipH = lm.fullH * prog;

        c.save();
        c.beginPath();
        /* clip rect from gy-clipH upward */
        var clipX = (lm.fn === 'bridge') ? lm.lx - 140 : lm.cx - 160;
        var clipW = (lm.fn === 'bridge') ? (lm.rx - lm.lx + 310) : 320;
        c.rect(clipX, GROUND - clipH - 2, clipW, clipH + 4);
        c.clip();

        if      (lm.fn === 'empire')   drawEmpireState(c, lm.cx, GROUND, lm.wins);
        else if (lm.fn === 'chrysler') drawChrysler(c, lm.cx, GROUND, lm.wins);
        else if (lm.fn === 'wtc')      drawOneWTC(c, lm.cx, GROUND, lm.wins);
        else if (lm.fn === 'liberty')  drawStatueLiberty(c, lm.cx, GROUND, lm.wins);
        else if (lm.fn === 'bridge')   drawBrooklynBridge(c, lm.lx, lm.rx, GROUND, lm.wins);
        else if (lm.fn === 'flatiron') drawFlatiron(c, lm.cx, GROUND, lm.wins);
        else if (lm.fn === 'rock')     draw30Rock(c, lm.cx, GROUND, lm.wins);

        c.restore();
    }

    /* ── drawBg ── */
    function drawBg() {
        var ev = EVENTS[eventIndex];
        var gr = bgC.createLinearGradient(0, 0, 0, GROUND);
        gr.addColorStop(0, ev.sky0);
        gr.addColorStop(1, ev.sky1);
        bgC.fillStyle = gr;
        bgC.fillRect(0, 0, W, H);

        var t = ev.type;
        if (ev.sun) {
            /* sun / moon glow halo */
            var sunGlowGr = bgC.createRadialGradient(W*0.84, H*0.10, ev.sunR*0.4, W*0.84, H*0.10, ev.sunR*2.8);
            sunGlowGr.addColorStop(0, ev.sun);
            sunGlowGr.addColorStop(0.4, ev.sun.replace(/[\d.]+\)$/, '0.18)'));
            sunGlowGr.addColorStop(1, 'rgba(0,0,0,0)');
            bgC.beginPath();
            bgC.arc(W*0.84, H*0.10, ev.sunR*2.8, 0, Math.PI*2);
            bgC.fillStyle = sunGlowGr;
            bgC.fill();
            bgC.beginPath();
            bgC.arc(W*0.84, H*0.10, ev.sunR, 0, Math.PI*2);
            bgC.fillStyle = ev.sun;
            bgC.fill();
        }
        /* horizon darkening */
        var hz = bgC.createLinearGradient(0, GROUND - 80, 0, GROUND);
        hz.addColorStop(0, 'rgba(0,0,0,0)');
        hz.addColorStop(1, 'rgba(0,0,0,0.38)');
        bgC.fillStyle = hz;
        bgC.fillRect(0, GROUND - 80, W, 80);

        /* clouds */
        for (var ci2 = 0; ci2 < CLOUDS.length; ci2++) {
            var cl = CLOUDS[ci2];
            bgC.globalAlpha = cl.alpha;
            bgC.fillStyle   = cl.color;
            for (var cj = 0; cj < cl.circles.length; cj++) {
                var cc = cl.circles[cj];
                bgC.beginPath();
                bgC.ellipse(cl.x + cc.dx, cl.y + cc.dy, cc.rx, cc.ry, 0, 0, Math.PI * 2);
                bgC.fill();
            }
        }
        bgC.globalAlpha = 1;
    }

    /* ── drawCity ── */
    function drawCity(ts) {
        cityC.clearRect(0, 0, W, H);

        /* ground / road — whitish */
        cityC.fillStyle = C.ground;
        cityC.fillRect(0, GROUND, W, H - GROUND);
        cityC.fillStyle = C.gndLine;
        cityC.fillRect(0, GROUND, W, 2);

        /* road centerline dashes */
        cityC.strokeStyle = C.gndMark;
        cityC.lineWidth   = 2;
        cityC.setLineDash([18, 14]);
        cityC.beginPath();
        cityC.moveTo(0, GROUND + Math.floor((H - GROUND) * 0.45));
        cityC.lineTo(W, GROUND + Math.floor((H - GROUND) * 0.45));
        cityC.stroke();
        cityC.setLineDash([]);

        /* street furniture */
        for (var si = 0; si < STREET_OBJ.length; si++) {
            var so = STREET_OBJ[si];
            if (so.type === 'lamp') {
                cityC.strokeStyle = '#30304a'; cityC.lineWidth = 2;
                cityC.beginPath(); cityC.moveTo(so.x, GROUND); cityC.lineTo(so.x, GROUND - 38); cityC.stroke();
                cityC.beginPath(); cityC.moveTo(so.x, GROUND-38); cityC.lineTo(so.x+10, GROUND-42); cityC.stroke();
                cityC.beginPath(); cityC.arc(so.x+10, GROUND-42, 4, 0, Math.PI*2);
                cityC.fillStyle = 'rgba(255,200,80,0.95)'; cityC.fill();
                var hGrad = cityC.createRadialGradient(so.x+10,GROUND-42,2,so.x+10,GROUND-42,11);
                hGrad.addColorStop(0,'rgba(255,240,160,0.24)'); hGrad.addColorStop(1,'rgba(255,240,160,0)');
                cityC.beginPath(); cityC.arc(so.x+10, GROUND-42, 11, 0, Math.PI*2);
                cityC.fillStyle = hGrad; cityC.fill();
            } else if (so.type === 'taxi') {
                var ty2 = GROUND - 14;
                cityC.fillStyle = 'rgba(255,200,0,0.92)';
                cityC.fillRect(so.x, ty2, so.w, 12);
                cityC.fillRect(so.x + Math.floor(so.w*0.2), ty2-6, Math.floor(so.w*0.6), 7);
                cityC.fillStyle = '#1a1a28';
                cityC.beginPath(); cityC.arc(so.x+6, GROUND-1, 3, 0, Math.PI*2); cityC.fill();
                cityC.beginPath(); cityC.arc(so.x+so.w-6, GROUND-1, 3, 0, Math.PI*2); cityC.fill();
            } else if (so.type === 'tree') {
                cityC.strokeStyle = '#909090'; cityC.lineWidth = 2;
                cityC.beginPath(); cityC.moveTo(so.x, GROUND); cityC.lineTo(so.x, GROUND-so.h); cityC.stroke();
                cityC.lineWidth = 1;
                cityC.beginPath(); cityC.moveTo(so.x, GROUND-so.h*0.6); cityC.lineTo(so.x-12, GROUND-so.h*0.86); cityC.stroke();
                cityC.beginPath(); cityC.moveTo(so.x, GROUND-so.h*0.6); cityC.lineTo(so.x+10, GROUND-so.h*0.90); cityC.stroke();
                cityC.beginPath(); cityC.moveTo(so.x, GROUND-so.h*0.75); cityC.lineTo(so.x-8, GROUND-so.h); cityC.stroke();
                cityC.beginPath(); cityC.moveTo(so.x, GROUND-so.h*0.75); cityC.lineTo(so.x+7, GROUND-so.h*0.95); cityC.stroke();
            }
        }

        /* background generic buildings */
        cityC.fillStyle   = '#111118';
        cityC.strokeStyle = '#1c1c28';
        cityC.lineWidth   = 0.8;
        for (var i = 0; i < BGBUILDS.length; i++) {
            var b  = BGBUILDS[i];
            var cH = Math.min(b.h, Math.floor(b.currentH));
            if (cH < 2) continue;
            cityC.fillRect(b.x, GROUND - cH, b.w, cH);
            cityC.strokeRect(b.x + 0.5, GROUND - cH + 0.5, b.w - 1, cH - 1);
        }

        /* landmarks */
        for (var li = 0; li < LM.length; li++) drawOneLandmark(cityC, LM[li], ts);
    }

    /* ── particles ── */
    function initEvent() {
        var t = EVENTS[eventIndex].type;
        particles = [];
        /* per-event particle population */
        var poolType = t;
        var poolSize = POOL;
        if (t === 'sandstorm') poolSize = 700;
        else if (t === 'locusts') poolSize = 260;
        else if (t === 'fogvenom') poolSize = 18;
        else if (t === 'plasma') poolSize = 90;
        else if (t === 'ashfall') poolSize = 460;
        else if (t === 'embers') poolSize = 240;
        else if (t === 'acidrain' || t === 'bloodrain') poolSize = 420;
        for (var i = 0; i < poolSize; i++) particles.push(makePart(poolType, true));

        ltTimer = rng(2000, 5000); ltActive = false; ltFlash = 0;
        tX = W * rng(0.3, 0.7); tSwayT = 0;
        tParts = [];
        if (t === 'tornado' || t === 'firenado') {
            for (var tp = 0; tp < 120; tp++)
                tParts.push({ angle: rng(0, Math.PI * 2), rad: rng(10, 100),
                    speed: rng(0.03, 0.08), radSpd: rng(-0.3, 0.3),
                    size: rng(2, 5), y: rng(0, 1), dot: Math.random() > 0.5 });
        }
        floodY = GROUND; floodRising = (t === 'flood');
        splashes = [];
        winFlickerT = 0;

        /* ── reset disaster state ── */
        shake = 0; shakeMag = 0;
        cracks = []; dustCol = [];
        tsunamiX = W + 80; tsunamiActive = (t === 'tsunami'); tsunamiFoam = [];
        meteors = []; meteorImpacts = [];
        lavaBombs = []; lavaPools = []; volcanoPlume = 0;
        sandLayers = [];
        acidPools = [];
        flareT = 0; flareRays = [];
        bats = [];
        arcs = [];
        ashAccum = [];
        bloodPools = [];
        bhRot = 0; bhParts = [];
        auroraRibbons = [];
        embersList = [];
        fireworks = [];
        ufos = [];
        iceSpikes = [];
        glitchBands = [];
    }

    function makePart(type, scattered) {
        var p = { type: type };
        if (type === 'rain' || type === 'storm' || type === 'acidrain' || type === 'bloodrain') {
            p.x = rng(0, W); p.y = scattered ? rng(-H, H) : -30;
            p.vy = rng(9, 16) * (type === 'storm' ? 1.6 : 1);
            p.dx = type === 'storm' ? rng(1.5, 3) : rng(0.3, 0.8);
            p.len = rng(10, 24); p.op = rng(0.3, 0.65);
        } else if (type === 'snow' || type === 'blizzard') {
            p.x = rng(0, W); p.y = scattered ? rng(-H, H) : -10;
            p.vx = type === 'blizzard' ? rng(2, 5) : rng(-0.4, 0.4);
            p.vy = rng(0.6, 2); p.r = rng(1, 2.8); p.op = rng(0.5, 0.9);
        } else if (type === 'hail') {
            p.x = rng(0, W); p.y = scattered ? rng(-H, H) : -10;
            p.vy = rng(14, 24); p.dx = rng(-1, 1); p.r = rng(2, 4); p.op = rng(0.6, 0.9);
        } else if (type === 'wind') {
            p.x = -rng(10, 100); p.y = rng(0, GROUND * 0.9);
            p.vx = rng(10, 22); p.len = rng(20, 90); p.op = rng(0.12, 0.35);
        } else if (type === 'ashfall' || type === 'embers') {
            p.x = rng(0, W); p.y = scattered ? rng(-H, H) : -10;
            p.vx = rng(-1.2, 1.2); p.vy = rng(0.4, 1.6);
            p.r = rng(1.2, 3.2); p.op = rng(0.4, 0.9);
            p.glow = (type === 'embers') ? rng(0.6, 1) : 0;
            p.spin = rng(-0.05, 0.05); p.angle = rng(0, Math.PI*2);
        } else if (type === 'sandstorm') {
            p.x = -rng(0, W*0.5); p.y = rng(0, GROUND);
            p.vx = rng(8, 18); p.vy = rng(-0.4, 0.4);
            p.r = rng(0.8, 2.4); p.op = rng(0.25, 0.7);
            p.hue = rngI(20, 45);
        } else if (type === 'locusts') {
            p.x = rng(-50, W); p.y = rng(20, GROUND - 20);
            p.vx = rng(2, 5); p.vy = rng(-0.5, 0.5);
            p.r = rng(1.5, 3); p.op = rng(0.55, 0.9);
            p.flap = rng(0, Math.PI*2); p.flapSpd = rng(0.4, 0.8);
            p.tx = rng(W*0.2, W*0.8); p.ty = rng(GROUND*0.2, GROUND*0.7);
        } else if (type === 'fogvenom') {
            p.x = rng(0, W); p.y = rng(GROUND*0.4, GROUND);
            p.vx = rng(0.3, 1.4); p.vy = rng(-0.3, 0.1);
            p.r = rng(28, 80); p.op = rng(0.08, 0.22);
        } else if (type === 'plasma') {
            p.x = rng(0, W); p.y = rng(0, GROUND*0.9);
            p.vx = rng(-0.6, 0.6); p.vy = rng(-0.6, 0.6);
            p.r = rng(0.8, 1.8); p.op = rng(0.5, 1);
            p.life = rngI(40, 200);
        } else { p.type = 'none'; }
        return p;
    }

    function updateParticles(dt) {
        var t = EVENTS[eventIndex].type, k = dt / 16;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.type === 'rain' || p.type === 'storm' || p.type === 'acidrain' || p.type === 'bloodrain') {
                p.y += p.vy * k; p.x += p.dx * k;
                if (p.y >= GROUND && p.y < GROUND + 24 && splashes.length < 90) {
                    var splashCol = (p.type === 'acidrain') ? 'acid' : (p.type === 'bloodrain') ? 'blood' : 'water';
                    splashes.push({ x: p.x, r: 0, maxR: rng(2, 5), life: 0, maxLife: rng(160, 260), op: rng(0.25, 0.55), kind: splashCol });
                    if (p.type === 'acidrain' && acidPools.length < 60 && Math.random() < 0.18) {
                        acidPools.push({ x: p.x, y: GROUND - 1, r: rng(3, 7), life: 0, maxLife: rng(900, 1800) });
                    }
                    if (p.type === 'bloodrain' && bloodPools.length < 80 && Math.random() < 0.30) {
                        bloodPools.push({ x: p.x, y: GROUND - 1, r: rng(2, 6), grow: rng(0.01, 0.03), maxR: rng(8, 22) });
                    }
                }
                if (p.y > H + 30) { p.y = -30; p.x = rng(0, W); }
                if (p.x > W + 10) p.x = -10;
            } else if (p.type === 'snow' || p.type === 'blizzard') {
                p.x += p.vx * k; p.y += p.vy * k;
                if (p.y > H + 6) { p.y = -6; p.x = rng(0, W); }
                if (p.x > W + 6) p.x = -6; if (p.x < -6) p.x = W + 6;
            } else if (p.type === 'hail') {
                p.y += p.vy * k; p.x += p.dx * k;
                if (p.y > H + 10) { p.y = -10; p.x = rng(0, W); }
            } else if (p.type === 'wind') {
                p.x += p.vx * k;
                if (p.x > W + 100) { p.x = -80; p.y = rng(0, GROUND * 0.9); }
            } else if (p.type === 'ashfall' || p.type === 'embers') {
                p.x += p.vx * k; p.y += p.vy * k;
                p.angle += p.spin * k;
                p.vx += Math.sin(p.y * 0.01 + p.x * 0.003) * 0.05 * k;
                if (p.y > GROUND + 4) {
                    if (p.type === 'ashfall' && ashAccum.length < 200) ashAccum.push({ x: p.x, r: p.r });
                    p.y = -10; p.x = rng(0, W);
                }
                if (p.x > W + 6) p.x = -6; if (p.x < -6) p.x = W + 6;
            } else if (p.type === 'sandstorm') {
                p.x += p.vx * k; p.y += p.vy * k + Math.sin(p.x*0.01)*0.3*k;
                if (p.x > W + 20) { p.x = -rng(0, 200); p.y = rng(0, GROUND); }
            } else if (p.type === 'locusts') {
                p.flap += p.flapSpd * k;
                /* swarm-seek behaviour */
                var dx = p.tx - p.x, dy = p.ty - p.y;
                var dist = Math.sqrt(dx*dx + dy*dy) || 1;
                p.vx += (dx/dist) * 0.04 * k + Math.sin(p.flap)*0.06;
                p.vy += (dy/dist) * 0.04 * k + Math.cos(p.flap)*0.06;
                p.vx *= 0.96; p.vy *= 0.96;
                p.x += p.vx * k; p.y += p.vy * k;
                if (dist < 30) { p.tx = rng(W*0.1, W*0.9); p.ty = rng(GROUND*0.15, GROUND*0.85); }
                if (p.x > W + 30) p.x = -20;
                if (p.x < -30) p.x = W + 20;
            } else if (p.type === 'fogvenom') {
                p.x += p.vx * k; p.y += p.vy * k;
                if (p.x > W + 100) { p.x = -100; p.y = rng(GROUND*0.4, GROUND); }
            } else if (p.type === 'plasma') {
                p.x += p.vx * k; p.y += p.vy * k;
                p.life -= dt;
                if (p.life <= 0) {
                    p.x = rng(0, W); p.y = rng(0, GROUND*0.9);
                    p.vx = rng(-0.6, 0.6); p.vy = rng(-0.6, 0.6);
                    p.life = rngI(40, 200);
                }
            }
        }
        if (t === 'storm') {
            ltTimer -= dt; if (ltFlash > 0) ltFlash -= dt;
            if (ltTimer <= 0) {
                ltTimer = rng(1800, 4500); ltFlash = 90; ltActive = true; ltPts = [];
                var lx = rng(W * 0.1, W * 0.9), ly = H * 0.05, ey = GROUND - rngI(30, 120);
                ltPts.push({ x: lx, y: ly });
                while (ly < ey) { ly += rng(12, 30); ltPts.push({ x: ltPts[ltPts.length-1].x + rng(-30,30), y: Math.min(ly,ey) }); }
            }
            if (ltFlash <= 0) ltActive = false;
        }
        if (t === 'tornado') {
            tSwayT += dt; tX = W * 0.5 + Math.sin(tSwayT / 3000) * W * 0.22;
            for (var tp = 0; tp < tParts.length; tp++) {
                var tp_ = tParts[tp]; tp_.angle += tp_.speed * k;
                tp_.rad += tp_.radSpd * k;
                var mn = 8 + tp_.y * 80, mx = 30 + tp_.y * 160;
                if (tp_.rad > mx || tp_.rad < mn) tp_.radSpd *= -1;
            }
        }
        if (t === 'flood' && floodRising) {
            var target = GROUND - H * 0.30;
            if (floodY > target) floodY -= 0.04 * k * H; else floodRising = false;
        }
        for (var si = splashes.length - 1; si >= 0; si--) {
            var sp = splashes[si];
            sp.life += dt;
            sp.r = sp.maxR * (sp.life / sp.maxLife);
            if (sp.life >= sp.maxLife) { splashes.splice(si, 1); }
        }

        /* ── earthquake ── */
        if (t === 'earthquake') {
            shakeMag = 10 + Math.sin(performance.now()/220)*4;
            shake = (Math.random() < 0.92) ? shakeMag : 0;
            if (Math.random() < 0.08 && dustCol.length < 30) {
                dustCol.push({ x: rng(0, W), y: GROUND, r: 4, op: 0.7, vy: -rng(0.3, 1.2), maxR: rng(20, 60) });
            }
            if (Math.random() < 0.02 && cracks.length < 18) {
                var cx = rng(W*0.1, W*0.9);
                var seg = [{x:cx,y:GROUND}];
                var sy = GROUND, sx = cx;
                for (var ks = 0; ks < 8; ks++) { sy -= rng(2, 6); sx += rng(-12, 12); seg.push({x:sx,y:sy}); }
                cracks.push({ pts: seg, life: 0, maxLife: 4000 });
            }
            for (var dc = dustCol.length-1; dc >= 0; dc--) {
                var d = dustCol[dc];
                d.y += d.vy * k; d.r = Math.min(d.maxR, d.r + 0.35*k); d.op *= 0.992;
                if (d.op < 0.02) dustCol.splice(dc, 1);
            }
            for (var ck = cracks.length-1; ck >= 0; ck--) {
                cracks[ck].life += dt;
                if (cracks[ck].life > cracks[ck].maxLife) cracks.splice(ck, 1);
            }
        } else { shake *= 0.85; }

        /* ── tsunami ── */
        if (t === 'tsunami') {
            if (!tsunamiActive) { tsunamiX = W + 80; tsunamiActive = true; tsunamiFoam = []; }
            tsunamiX -= 1.2 * k;
            if (tsunamiX < -200) tsunamiX = W + 80;
            if (Math.random() < 0.7 && tsunamiFoam.length < 200) {
                var fy = GROUND - rng(0, H*0.45);
                tsunamiFoam.push({ x: tsunamiX + rng(-40, 40), y: fy, r: rng(1, 3.5), op: rng(0.4, 1), vx: -rng(2, 6), vy: rng(-1.5, 0.6) });
            }
            for (var tf = tsunamiFoam.length-1; tf >= 0; tf--) {
                var f = tsunamiFoam[tf];
                f.x += f.vx * k; f.y += f.vy * k; f.vy += 0.04 * k; f.op *= 0.985;
                if (f.op < 0.05 || f.y > H) tsunamiFoam.splice(tf, 1);
            }
        }

        /* ── meteors ── */
        if (t === 'meteors') {
            if (Math.random() < 0.07 && meteors.length < 14) {
                meteors.push({
                    x: rng(W*0.05, W*0.95), y: -40,
                    vx: rng(-2, 2), vy: rng(8, 16),
                    r: rng(3, 7), trail: [], hot: rng(0.8, 1)
                });
            }
            for (var mi = meteors.length-1; mi >= 0; mi--) {
                var m = meteors[mi];
                m.x += m.vx * k; m.y += m.vy * k;
                m.trail.push({x:m.x, y:m.y});
                if (m.trail.length > 18) m.trail.shift();
                if (m.y > GROUND - 2) {
                    meteorImpacts.push({ x: m.x, y: GROUND, r: 0, maxR: rng(50, 120), life: 0, maxLife: 700 });
                    shake = 14; shakeMag = 14;
                    for (var sp = 0; sp < 12; sp++) {
                        embersList.push({ x: m.x, y: GROUND, vx: rng(-5,5), vy: rng(-9,-3), r: rng(1,3), life: 0, maxLife: rng(400, 900) });
                    }
                    meteors.splice(mi, 1);
                }
            }
            for (var mp = meteorImpacts.length-1; mp >= 0; mp--) {
                var mip = meteorImpacts[mp];
                mip.life += dt;
                mip.r = mip.maxR * (mip.life / mip.maxLife);
                if (mip.life > mip.maxLife) meteorImpacts.splice(mp, 1);
            }
        }

        /* ── volcano ── */
        if (t === 'volcano') {
            volcanoPlume += dt;
            if (Math.random() < 0.10 && lavaBombs.length < 22) {
                var vox = W * 0.5;
                lavaBombs.push({
                    x: vox, y: GROUND - H*0.40,
                    vx: rng(-7, 7), vy: rng(-14, -8),
                    r: rng(3, 6), trail: []
                });
            }
            for (var lb = lavaBombs.length-1; lb >= 0; lb--) {
                var L = lavaBombs[lb];
                L.x += L.vx * k; L.y += L.vy * k; L.vy += 0.28 * k;
                L.trail.push({x:L.x, y:L.y});
                if (L.trail.length > 12) L.trail.shift();
                if (L.y > GROUND) {
                    lavaPools.push({ x: L.x, r: rng(6, 14), life: 0, maxLife: rng(2000, 4500) });
                    shake = 6; shakeMag = 6;
                    for (var sp2 = 0; sp2 < 6; sp2++) {
                        embersList.push({ x: L.x, y: GROUND, vx: rng(-4,4), vy: rng(-7,-2), r: rng(1,2.5), life: 0, maxLife: rng(300, 700) });
                    }
                    lavaBombs.splice(lb, 1);
                }
            }
            for (var lp = lavaPools.length-1; lp >= 0; lp--) {
                lavaPools[lp].life += dt;
                if (lavaPools[lp].life > lavaPools[lp].maxLife) lavaPools.splice(lp, 1);
            }
        }

        /* ── solar flare ── */
        if (t === 'solarflare') {
            flareT += dt;
            if (Math.random() < 0.04 && flareRays.length < 24) {
                flareRays.push({ angle: rng(0, Math.PI*2), len: rng(W*0.1, W*0.6), life: 0, maxLife: rng(400, 1000), thick: rng(2, 6) });
            }
            for (var fr2 = flareRays.length-1; fr2 >= 0; fr2--) {
                flareRays[fr2].life += dt;
                if (flareRays[fr2].life > flareRays[fr2].maxLife) flareRays.splice(fr2, 1);
            }
        }

        /* ── bloodmoon (bats) ── */
        if (t === 'bloodmoon') {
            if (bats.length < 30 && Math.random() < 0.10) {
                bats.push({ x: -20, y: rng(GROUND*0.1, GROUND*0.7), vx: rng(1.5, 3.5), flap: rng(0, Math.PI*2), flapSpd: rng(0.3, 0.6), size: rng(4, 8) });
            }
            for (var bi = bats.length-1; bi >= 0; bi--) {
                var B = bats[bi];
                B.x += B.vx * k; B.flap += B.flapSpd * k;
                B.y += Math.sin(B.flap*0.5) * 0.6 * k;
                if (B.x > W + 30) bats.splice(bi, 1);
            }
        }

        /* ── plasma arcs ── */
        if (t === 'plasma') {
            if (Math.random() < 0.08 && arcs.length < 8) {
                var ax = rng(0, W), ay = rng(0, GROUND*0.7);
                var bx = ax + rng(-180, 180), by = ay + rng(-120, 120);
                var pts = [{x:ax,y:ay}];
                var steps = rngI(6, 12), dx2 = (bx-ax)/steps, dy2 = (by-ay)/steps;
                for (var ps = 1; ps <= steps; ps++) {
                    pts.push({ x: ax + dx2*ps + rng(-15,15), y: ay + dy2*ps + rng(-15,15) });
                }
                arcs.push({ pts: pts, life: 0, maxLife: rngI(120, 280), hue: rngI(180, 320) });
            }
            for (var ai = arcs.length-1; ai >= 0; ai--) {
                arcs[ai].life += dt;
                if (arcs[ai].life > arcs[ai].maxLife) arcs.splice(ai, 1);
            }
        }

        /* ── firenado (extra embers) ── */
        if (t === 'firenado') {
            tSwayT += dt; tX = W*0.5 + Math.sin(tSwayT/3000) * W*0.22;
            if (Math.random() < 0.4 && embersList.length < 220) {
                embersList.push({ x: tX + rng(-W*0.06, W*0.06), y: GROUND - rng(0, H*0.6), vx: rng(-2, 2), vy: rng(-3, -0.5), r: rng(1, 3), life: 0, maxLife: rng(800, 1800) });
            }
            for (var tp = 0; tp < tParts.length; tp++) {
                var tp_ = tParts[tp]; tp_.angle += tp_.speed * k;
                tp_.rad += tp_.radSpd * k;
                var mn = 8 + tp_.y * 80, mx = 30 + tp_.y * 160;
                if (tp_.rad > mx || tp_.rad < mn) tp_.radSpd *= -1;
            }
        }

        /* ── embers (drifting) ── */
        for (var em = embersList.length-1; em >= 0; em--) {
            var E = embersList[em];
            E.life += dt; E.x += E.vx * k; E.y += E.vy * k; E.vy += 0.04 * k;
            if (E.life > E.maxLife || E.y > GROUND + 2) embersList.splice(em, 1);
        }

        /* ── acid pools ── */
        for (var ap = acidPools.length-1; ap >= 0; ap--) {
            acidPools[ap].life += dt;
            if (acidPools[ap].life > acidPools[ap].maxLife) acidPools.splice(ap, 1);
        }
        /* ── blood pools grow ── */
        for (var bp = bloodPools.length-1; bp >= 0; bp--) {
            var BP = bloodPools[bp];
            BP.r = Math.min(BP.maxR, BP.r + BP.grow * dt);
        }

        /* ── black hole ── */
        if (t === 'blackhole') {
            bhRot += dt * 0.003;
            if (bhParts.length < 220) {
                for (var bhk = 0; bhk < 4; bhk++) {
                    bhParts.push({
                        angle: rng(0, Math.PI*2),
                        rad: rng(40, Math.max(W, H)*0.8),
                        spd: rng(0.005, 0.025),
                        rIn: rng(0.985, 0.998),
                        size: rng(0.8, 2.6),
                        hue: rngI(220, 320),
                        op: rng(0.4, 1)
                    });
                }
            }
            for (var bhp = bhParts.length-1; bhp >= 0; bhp--) {
                var BH = bhParts[bhp];
                BH.angle += BH.spd * k;
                BH.rad *= Math.pow(BH.rIn, k);
                if (BH.rad < 8) bhParts.splice(bhp, 1);
            }
        }

        /* ── aurora ribbons ── */
        if (t === 'aurora') {
            if (auroraRibbons.length < 5) {
                auroraRibbons.push({
                    y: rng(H*0.08, H*0.35),
                    amp: rng(20, 60),
                    freq: rng(0.005, 0.015),
                    speed: rng(0.0004, 0.0012),
                    hue: rngI(100, 300),
                    h: rng(50, 130),
                    op: rng(0.25, 0.55),
                    phase: rng(0, Math.PI*2)
                });
            }
            for (var ar = 0; ar < auroraRibbons.length; ar++) {
                auroraRibbons[ar].phase += auroraRibbons[ar].speed * dt;
            }
        }

        /* ── fireworks ── */
        if (t === 'fireworks') {
            if (Math.random() < 0.04 && fireworks.length < 60) {
                var fx0 = rng(W*0.1, W*0.9), fy0 = rng(H*0.15, H*0.45);
                var hue = rngI(0, 360);
                for (var fbk = 0; fbk < 30; fbk++) {
                    var ang = (fbk/30) * Math.PI*2;
                    fireworks.push({
                        x: fx0, y: fy0,
                        vx: Math.cos(ang)*rng(2, 5),
                        vy: Math.sin(ang)*rng(2, 5),
                        life: 0, maxLife: rng(700, 1400),
                        hue: hue
                    });
                }
            }
            for (var fk = fireworks.length-1; fk >= 0; fk--) {
                var F = fireworks[fk];
                F.life += dt; F.x += F.vx * k; F.y += F.vy * k; F.vy += 0.05 * k;
                F.vx *= 0.985; F.vy *= 0.985;
                if (F.life > F.maxLife) fireworks.splice(fk, 1);
            }
        }

        /* ── ufo invasion ── */
        if (t === 'ufo') {
            if (ufos.length < 4 && Math.random() < 0.01) {
                ufos.push({
                    x: -50, y: rng(H*0.1, H*0.4),
                    vx: rng(0.5, 1.4),
                    bob: rng(0, Math.PI*2),
                    bobSpd: rng(0.002, 0.005),
                    size: rng(28, 50),
                    beamT: 0,
                    beamOn: false,
                    hue: rngI(120, 320)
                });
            }
            for (var ui = ufos.length-1; ui >= 0; ui--) {
                var U = ufos[ui];
                U.x += U.vx * k; U.bob += U.bobSpd * dt;
                U.beamT += dt;
                if (U.beamT > 1500) { U.beamOn = !U.beamOn; U.beamT = 0; }
                if (U.x > W + 60) ufos.splice(ui, 1);
            }
        }

        /* ── frostquake ── */
        if (t === 'frostquake') {
            if (Math.random() < 0.04) shake = 4; else shake *= 0.9;
            if (Math.random() < 0.05 && iceSpikes.length < 30) {
                iceSpikes.push({ x: rng(20, W-20), grow: 0, maxH: rng(20, 60), w: rng(8, 16) });
            }
            for (var is2 = 0; is2 < iceSpikes.length; is2++) {
                iceSpikes[is2].grow = Math.min(iceSpikes[is2].maxH, iceSpikes[is2].grow + 0.05*dt);
            }
        }

        /* ── glitch ── */
        if (t === 'glitch') {
            if (Math.random() < 0.18) {
                glitchBands.length = 0;
                for (var gb = 0; gb < rngI(3, 9); gb++) {
                    glitchBands.push({ y: rngI(0, H), h: rngI(4, 30), off: rngI(-40, 40), hue: rngI(0, 360) });
                }
            }
        }
    }

    function updateBuildings(dt) {
        for (var i = 0; i < BGBUILDS.length; i++) {
            var b = BGBUILDS[i];
            if (b.currentH < b.h) b.currentH = Math.min(b.h, b.currentH + b.growRate * dt);
        }
        for (var li = 0; li < LM.length; li++) {
            var lm = LM[li];
            if (lm.currentH < lm.fullH) lm.currentH = Math.min(lm.fullH, lm.currentH + lm.growRate * dt);
        }
    }

    function drawDynamic(ts) {
        dynC.clearRect(0, 0, W, H);
        var evType = EVENTS[eventIndex].type;
        if (evType === 'rain' || evType === 'storm' || evType === 'flood') {
            var refA = dynC.createLinearGradient(0, GROUND - 3, 0, GROUND + 44);
            refA.addColorStop(0,   'rgba(255,210,70,0.14)');
            refA.addColorStop(0.5, 'rgba(255,210,70,0.06)');
            refA.addColorStop(1,   'rgba(0,0,0,0)');
            dynC.fillStyle = refA;
            dynC.fillRect(0, GROUND - 3, W, 47);

            var refB = dynC.createLinearGradient(0, GROUND - 3, 0, GROUND + 44);
            refB.addColorStop(0,   'rgba(60,130,220,0.10)');
            refB.addColorStop(0.6, 'rgba(60,130,220,0.04)');
            refB.addColorStop(1,   'rgba(0,0,0,0)');
            dynC.fillStyle = refB;
            dynC.fillRect(0, GROUND - 3, W, 47);
        }
        var t = EVENTS[eventIndex].type;

        if (t === 'heat') {
            var bands = 30, bH2 = Math.ceil(H / bands);
            for (var b = 0; b < bands; b++) {
                var by = b * bH2;
                dynC.drawImage(cityCvs, 0, by, W, bH2+1, Math.sin(ts/360+b*0.8)*3, by, W, bH2+1);
            }
            dynC.fillStyle = 'rgba(180,60,0,0.07)'; dynC.fillRect(0,0,W,H);
        }

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i]; if (p.type === 'none') continue;
            dynC.globalAlpha = p.op;
            if (p.type === 'rain' || p.type === 'storm') {
                dynC.strokeStyle = p.type === 'storm' ? 'rgba(180,210,255,0.70)' : 'rgba(160,200,240,0.55)';
                dynC.lineWidth   = p.type === 'storm' ? 1.5 : 1;
                dynC.beginPath(); dynC.moveTo(p.x, p.y); dynC.lineTo(p.x+p.dx, p.y+p.len); dynC.stroke();
            } else if (p.type === 'acidrain') {
                dynC.strokeStyle = 'rgba(150,255,90,0.75)'; dynC.lineWidth = 1.2;
                dynC.shadowColor = '#5cff60'; dynC.shadowBlur = 6;
                dynC.beginPath(); dynC.moveTo(p.x, p.y); dynC.lineTo(p.x+p.dx, p.y+p.len); dynC.stroke();
                dynC.shadowBlur = 0;
            } else if (p.type === 'bloodrain') {
                dynC.strokeStyle = 'rgba(200,20,30,0.80)'; dynC.lineWidth = 1.4;
                dynC.beginPath(); dynC.moveTo(p.x, p.y); dynC.lineTo(p.x+p.dx, p.y+p.len); dynC.stroke();
            } else if (p.type === 'snow' || p.type === 'blizzard') {
                dynC.fillStyle = '#ffffff';
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r, 0, Math.PI*2); dynC.fill();
            } else if (p.type === 'hail') {
                dynC.fillStyle   = '#d0eeff';
                dynC.strokeStyle = '#90c8e8';
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r, 0, Math.PI*2); dynC.fill();
                dynC.lineWidth=0.5; dynC.stroke();
            } else if (p.type === 'wind') {
                dynC.strokeStyle = 'rgba(200,220,255,0.40)'; dynC.lineWidth = 1;
                dynC.beginPath(); dynC.moveTo(p.x, p.y); dynC.lineTo(p.x+p.len, p.y); dynC.stroke();
            } else if (p.type === 'ashfall') {
                dynC.fillStyle = '#7a7570';
                dynC.save(); dynC.translate(p.x, p.y); dynC.rotate(p.angle);
                dynC.beginPath(); dynC.ellipse(0, 0, p.r, p.r*0.6, 0, 0, Math.PI*2); dynC.fill();
                dynC.restore();
            } else if (p.type === 'embers') {
                var eg = dynC.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*3);
                eg.addColorStop(0, 'rgba(255,220,120,1)');
                eg.addColorStop(0.4, 'rgba(255,120,30,0.7)');
                eg.addColorStop(1, 'rgba(255,40,0,0)');
                dynC.fillStyle = eg;
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r*3, 0, Math.PI*2); dynC.fill();
            } else if (p.type === 'sandstorm') {
                dynC.fillStyle = 'hsl(' + p.hue + ',75%,55%)';
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r, 0, Math.PI*2); dynC.fill();
            } else if (p.type === 'locusts') {
                dynC.fillStyle = '#1a1206';
                var flapY = Math.sin(p.flap) * p.r * 1.1;
                dynC.beginPath(); dynC.ellipse(p.x, p.y, p.r, p.r*0.6, 0, 0, Math.PI*2); dynC.fill();
                dynC.strokeStyle = 'rgba(40,30,10,0.7)'; dynC.lineWidth = 0.8;
                dynC.beginPath(); dynC.moveTo(p.x-p.r, p.y); dynC.lineTo(p.x-p.r*2, p.y - flapY); dynC.stroke();
                dynC.beginPath(); dynC.moveTo(p.x+p.r, p.y); dynC.lineTo(p.x+p.r*2, p.y - flapY); dynC.stroke();
            } else if (p.type === 'fogvenom') {
                var fg = dynC.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                fg.addColorStop(0, 'rgba(120,255,80,' + p.op + ')');
                fg.addColorStop(1, 'rgba(20,80,20,0)');
                dynC.fillStyle = fg;
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r, 0, Math.PI*2); dynC.fill();
            } else if (p.type === 'plasma') {
                var pg = dynC.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*8);
                pg.addColorStop(0, 'rgba(220,180,255,1)');
                pg.addColorStop(0.4, 'rgba(140,80,255,0.5)');
                pg.addColorStop(1, 'rgba(40,0,80,0)');
                dynC.fillStyle = pg;
                dynC.beginPath(); dynC.arc(p.x, p.y, p.r*8, 0, Math.PI*2); dynC.fill();
            }
        }
        dynC.globalAlpha = 1;

        /* lightning */
        if (ltActive && ltFlash > 0 && ltPts.length > 1) {
            dynC.fillStyle = 'rgba(200,220,255,' + Math.min(0.22, ltFlash / 90 * 0.22) + ')';
            dynC.fillRect(0,0,W,H);
            /* outer glow bolt */
            dynC.strokeStyle = 'rgba(140,180,255,0.55)'; dynC.lineWidth = 5;
            dynC.beginPath(); dynC.moveTo(ltPts[0].x, ltPts[0].y);
            for (var lp = 1; lp < ltPts.length; lp++) dynC.lineTo(ltPts[lp].x, ltPts[lp].y);
            dynC.stroke();
            /* bright core bolt */
            dynC.strokeStyle = '#ffffff'; dynC.lineWidth = 1.5;
            dynC.beginPath(); dynC.moveTo(ltPts[0].x, ltPts[0].y);
            for (var lp2 = 1; lp2 < ltPts.length; lp2++) dynC.lineTo(ltPts[lp2].x, ltPts[lp2].y);
            dynC.stroke();
        }

        /* tornado */
        if (t === 'tornado') {
            for (var tp=0; tp<tParts.length; tp++) {
                var p2=tParts[tp], frac=p2.y;
                var cx2=tX+Math.cos(p2.angle)*p2.rad*(0.2+frac*0.8);
                var cy2=GROUND*0.15+frac*(GROUND*0.85);
                dynC.globalAlpha=0.5-frac*0.2; dynC.fillStyle='#3a3028';
                if (p2.dot) { dynC.beginPath(); dynC.arc(cx2,cy2,p2.size*(0.3+frac*0.7),0,Math.PI*2); dynC.fill(); }
                else { dynC.strokeStyle='#282018'; dynC.lineWidth=1; dynC.beginPath(); dynC.moveTo(cx2,cy2); dynC.lineTo(cx2+p2.size*3,cy2-p2.size); dynC.stroke(); }
            }
            dynC.globalAlpha=1;
            var topW=W*0.10, tipW=5, fTop=GROUND*0.08, fBot=GROUND*0.93;
            dynC.beginPath();
            dynC.moveTo(tX-topW, fTop);
            dynC.bezierCurveTo(tX-topW*0.5, fTop+(fBot-fTop)*0.5, tX-tipW, fBot-30, tX-tipW*0.5, fBot);
            dynC.lineTo(tX+tipW*0.5, fBot);
            dynC.bezierCurveTo(tX+tipW, fBot-30, tX+topW*0.5, fTop+(fBot-fTop)*0.5, tX+topW, fTop);
            dynC.closePath();
            dynC.fillStyle='rgba(40,35,15,0.28)'; dynC.fill();
            dynC.strokeStyle='rgba(30,25,10,0.55)'; dynC.lineWidth=2; dynC.stroke();
        }

        /* flood */
        if (t === 'flood') {
            dynC.fillStyle = 'rgba(10,40,100,0.50)';
            dynC.fillRect(0, floodY, W, H-floodY);
            dynC.beginPath(); dynC.moveTo(0, floodY);
            for (var wx=0; wx<=W; wx+=4) dynC.lineTo(wx, floodY+Math.sin(wx/W*Math.PI*8+ts/600)*4);
            dynC.lineTo(W,H); dynC.lineTo(0,H); dynC.closePath();
            dynC.fillStyle='rgba(15,55,140,0.45)'; dynC.fill();
            dynC.strokeStyle='rgba(80,160,255,0.55)'; dynC.lineWidth=1.5;
            dynC.beginPath();
            for (var wx2=0; wx2<=W; wx2+=4) {
                var wy2=floodY+Math.sin(wx2/W*Math.PI*8+ts/600)*4;
                if (wx2===0) dynC.moveTo(wx2,wy2); else dynC.lineTo(wx2,wy2);
            }
            dynC.stroke();
        }

        if (splashes.length > 0) {
            dynC.lineWidth = 0.8;
            for (var sri = 0; sri < splashes.length; sri++) {
                var spr = splashes[sri];
                var fade = 1 - spr.life / spr.maxLife;
                dynC.globalAlpha = spr.op * fade;
                dynC.strokeStyle = spr.kind === 'acid' ? 'rgba(160,255,90,0.85)'
                                 : spr.kind === 'blood' ? 'rgba(220,30,40,0.9)'
                                 : 'rgba(180,210,240,0.60)';
                dynC.beginPath();
                dynC.ellipse(spr.x, GROUND - 1, spr.r, spr.r * 0.4, 0, 0, Math.PI * 2);
                dynC.stroke();
            }
            dynC.globalAlpha = 1;
        }

        /* ════════ APOCALYPTIC OVERLAYS ════════ */

        /* ── earthquake: ground cracks + dust ── */
        if (t === 'earthquake') {
            for (var ck = 0; ck < cracks.length; ck++) {
                var C2 = cracks[ck];
                var op = Math.max(0, 1 - C2.life / C2.maxLife);
                dynC.strokeStyle = 'rgba(255,140,40,' + (op*0.95) + ')';
                dynC.lineWidth = 2.2;
                dynC.shadowColor = '#ff6020'; dynC.shadowBlur = 8;
                dynC.beginPath();
                dynC.moveTo(C2.pts[0].x, C2.pts[0].y);
                for (var kp = 1; kp < C2.pts.length; kp++) dynC.lineTo(C2.pts[kp].x, C2.pts[kp].y);
                dynC.stroke();
                dynC.shadowBlur = 0;
                dynC.strokeStyle = 'rgba(0,0,0,' + (op*0.8) + ')';
                dynC.lineWidth = 1;
                dynC.beginPath();
                dynC.moveTo(C2.pts[0].x, C2.pts[0].y);
                for (var kp2 = 1; kp2 < C2.pts.length; kp2++) dynC.lineTo(C2.pts[kp2].x, C2.pts[kp2].y);
                dynC.stroke();
            }
            for (var dc = 0; dc < dustCol.length; dc++) {
                var D = dustCol[dc];
                var dg = dynC.createRadialGradient(D.x, D.y, 0, D.x, D.y, D.r);
                dg.addColorStop(0, 'rgba(140,120,100,' + (D.op*0.7) + ')');
                dg.addColorStop(1, 'rgba(60,50,40,0)');
                dynC.fillStyle = dg;
                dynC.beginPath(); dynC.arc(D.x, D.y, D.r, 0, Math.PI*2); dynC.fill();
            }
        }

        /* ── tsunami: massive wave wall ── */
        if (t === 'tsunami') {
            var waveTop = GROUND - H * 0.55;
            dynC.save();
            /* wall of water */
            var wgrad = dynC.createLinearGradient(tsunamiX, waveTop, tsunamiX, GROUND);
            wgrad.addColorStop(0,   'rgba(30,90,150,0.4)');
            wgrad.addColorStop(0.4, 'rgba(20,60,120,0.85)');
            wgrad.addColorStop(1,   'rgba(5,20,60,0.98)');
            dynC.fillStyle = wgrad;
            dynC.beginPath();
            dynC.moveTo(tsunamiX, GROUND);
            for (var wx = 0; wx <= 180; wx += 6) {
                var px = tsunamiX + wx;
                var py = waveTop + Math.sin(wx*0.05 + ts/220) * 6 + (wx/180)*(GROUND-waveTop);
                dynC.lineTo(px, py);
            }
            dynC.lineTo(W + 100, GROUND);
            dynC.lineTo(tsunamiX, GROUND);
            dynC.closePath();
            dynC.fill();
            /* curl crest */
            dynC.strokeStyle = 'rgba(220,240,255,0.9)';
            dynC.lineWidth = 3;
            dynC.beginPath();
            for (var cx3 = 0; cx3 <= 40; cx3 += 4) {
                var lx2 = tsunamiX + cx3;
                var ly2 = waveTop - Math.sqrt(40*40 - cx3*cx3)*0.5 + Math.sin(ts/200 + cx3)*3;
                if (cx3 === 0) dynC.moveTo(lx2, ly2); else dynC.lineTo(lx2, ly2);
            }
            dynC.stroke();
            /* foam droplets */
            for (var fmi = 0; fmi < tsunamiFoam.length; fmi++) {
                var Fm = tsunamiFoam[fmi];
                dynC.globalAlpha = Fm.op;
                dynC.fillStyle = '#eaf4ff';
                dynC.beginPath(); dynC.arc(Fm.x, Fm.y, Fm.r, 0, Math.PI*2); dynC.fill();
            }
            dynC.globalAlpha = 1;
            dynC.restore();
        }

        /* ── meteors ── */
        if (t === 'meteors') {
            for (var mi = 0; mi < meteors.length; mi++) {
                var M = meteors[mi];
                /* trail */
                for (var tr2 = 0; tr2 < M.trail.length; tr2++) {
                    var T = M.trail[tr2], a = tr2 / M.trail.length;
                    var tg = dynC.createRadialGradient(T.x, T.y, 0, T.x, T.y, M.r*2*a + 2);
                    tg.addColorStop(0, 'rgba(255,200,80,' + (a*0.8) + ')');
                    tg.addColorStop(1, 'rgba(255,40,0,0)');
                    dynC.fillStyle = tg;
                    dynC.beginPath(); dynC.arc(T.x, T.y, M.r*2*a+2, 0, Math.PI*2); dynC.fill();
                }
                /* core */
                var mg = dynC.createRadialGradient(M.x, M.y, 0, M.x, M.y, M.r*4);
                mg.addColorStop(0, 'rgba(255,255,220,1)');
                mg.addColorStop(0.3, 'rgba(255,140,30,1)');
                mg.addColorStop(1, 'rgba(180,40,0,0)');
                dynC.fillStyle = mg;
                dynC.beginPath(); dynC.arc(M.x, M.y, M.r*4, 0, Math.PI*2); dynC.fill();
                dynC.fillStyle = '#1a0a04';
                dynC.beginPath(); dynC.arc(M.x, M.y, M.r, 0, Math.PI*2); dynC.fill();
            }
            for (var mp2 = 0; mp2 < meteorImpacts.length; mp2++) {
                var MI = meteorImpacts[mp2];
                var prog = MI.life / MI.maxLife;
                dynC.strokeStyle = 'rgba(255,180,40,' + (1-prog) + ')';
                dynC.lineWidth = 4 * (1-prog);
                dynC.beginPath(); dynC.arc(MI.x, MI.y, MI.r, 0, Math.PI*2); dynC.stroke();
                dynC.strokeStyle = 'rgba(255,255,200,' + (1-prog)*0.7 + ')';
                dynC.lineWidth = 1.5;
                dynC.beginPath(); dynC.arc(MI.x, MI.y, MI.r*0.6, 0, Math.PI*2); dynC.stroke();
            }
        }

        /* ── volcano ── */
        if (t === 'volcano') {
            var vox = W * 0.5;
            /* ash plume column */
            var pg2 = dynC.createRadialGradient(vox, GROUND - H*0.35, 0, vox, GROUND - H*0.35, H*0.6);
            pg2.addColorStop(0, 'rgba(80,30,10,0.7)');
            pg2.addColorStop(0.5, 'rgba(140,40,10,0.4)');
            pg2.addColorStop(1, 'rgba(20,10,5,0)');
            dynC.fillStyle = pg2;
            dynC.beginPath(); dynC.arc(vox, GROUND - H*0.35, H*0.6, 0, Math.PI*2); dynC.fill();
            /* lava bombs */
            for (var lb2 = 0; lb2 < lavaBombs.length; lb2++) {
                var LB = lavaBombs[lb2];
                for (var ltr = 0; ltr < LB.trail.length; ltr++) {
                    var Tt = LB.trail[ltr], aT = ltr / LB.trail.length;
                    dynC.fillStyle = 'rgba(255,120,30,' + (aT*0.5) + ')';
                    dynC.beginPath(); dynC.arc(Tt.x, Tt.y, LB.r*aT, 0, Math.PI*2); dynC.fill();
                }
                var lg = dynC.createRadialGradient(LB.x, LB.y, 0, LB.x, LB.y, LB.r*3);
                lg.addColorStop(0, 'rgba(255,240,160,1)');
                lg.addColorStop(0.4, 'rgba(255,80,10,0.9)');
                lg.addColorStop(1, 'rgba(180,20,0,0)');
                dynC.fillStyle = lg;
                dynC.beginPath(); dynC.arc(LB.x, LB.y, LB.r*3, 0, Math.PI*2); dynC.fill();
            }
            /* lava pools on ground */
            for (var lp2 = 0; lp2 < lavaPools.length; lp2++) {
                var LP = lavaPools[lp2];
                var lpfade = 1 - LP.life / LP.maxLife;
                var lpg = dynC.createRadialGradient(LP.x, GROUND, 0, LP.x, GROUND, LP.r*3);
                lpg.addColorStop(0, 'rgba(255,200,80,' + lpfade + ')');
                lpg.addColorStop(0.4, 'rgba(255,80,20,' + (lpfade*0.7) + ')');
                lpg.addColorStop(1, 'rgba(100,0,0,0)');
                dynC.fillStyle = lpg;
                dynC.beginPath(); dynC.ellipse(LP.x, GROUND, LP.r*3, LP.r*1.2, 0, 0, Math.PI*2); dynC.fill();
            }
        }

        /* ── sandstorm overlay ── */
        if (t === 'sandstorm') {
            var sgr = dynC.createLinearGradient(0, 0, 0, H);
            sgr.addColorStop(0, 'rgba(200,120,40,0.0)');
            sgr.addColorStop(0.6, 'rgba(220,130,50,0.30)');
            sgr.addColorStop(1, 'rgba(160,80,20,0.55)');
            dynC.fillStyle = sgr;
            dynC.fillRect(0, 0, W, H);
        }

        /* ── acid rain pools ── */
        if (t === 'acidrain') {
            for (var ap2 = 0; ap2 < acidPools.length; ap2++) {
                var AP = acidPools[ap2];
                var afad = 1 - AP.life / AP.maxLife;
                var ag = dynC.createRadialGradient(AP.x, AP.y, 0, AP.x, AP.y, AP.r*2);
                ag.addColorStop(0, 'rgba(160,255,90,' + (afad*0.8) + ')');
                ag.addColorStop(1, 'rgba(40,100,30,0)');
                dynC.fillStyle = ag;
                dynC.beginPath(); dynC.ellipse(AP.x, AP.y, AP.r*2, AP.r*0.6, 0, 0, Math.PI*2); dynC.fill();
                /* steam wisp */
                dynC.strokeStyle = 'rgba(180,255,150,' + (afad*0.35) + ')';
                dynC.lineWidth = 1;
                dynC.beginPath();
                dynC.moveTo(AP.x, AP.y);
                dynC.quadraticCurveTo(AP.x + Math.sin(ts/300+AP.x)*4, AP.y - 12, AP.x + Math.sin(ts/200+AP.x)*8, AP.y - 24);
                dynC.stroke();
            }
            dynC.fillStyle = 'rgba(60,160,30,0.05)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── solar flare ── */
        if (t === 'solarflare') {
            var scx = W*0.84, scy = H*0.10;
            /* pulsing corona */
            var corR = 80 + Math.sin(flareT/200)*30;
            var cg = dynC.createRadialGradient(scx, scy, 20, scx, scy, corR*2.5);
            cg.addColorStop(0, 'rgba(255,255,200,0.9)');
            cg.addColorStop(0.3, 'rgba(255,180,80,0.5)');
            cg.addColorStop(1, 'rgba(255,80,20,0)');
            dynC.fillStyle = cg;
            dynC.beginPath(); dynC.arc(scx, scy, corR*2.5, 0, Math.PI*2); dynC.fill();
            /* rays */
            for (var fr3 = 0; fr3 < flareRays.length; fr3++) {
                var R = flareRays[fr3];
                var rf = 1 - R.life / R.maxLife;
                dynC.save();
                dynC.translate(scx, scy);
                dynC.rotate(R.angle);
                var rg = dynC.createLinearGradient(0, 0, R.len, 0);
                rg.addColorStop(0, 'rgba(255,240,180,' + rf + ')');
                rg.addColorStop(1, 'rgba(255,80,20,0)');
                dynC.fillStyle = rg;
                dynC.fillRect(0, -R.thick/2, R.len, R.thick);
                dynC.restore();
            }
            /* flash */
            if (Math.sin(flareT/170) > 0.95) {
                dynC.fillStyle = 'rgba(255,250,210,0.18)';
                dynC.fillRect(0, 0, W, H);
            }
        }

        /* ── bloodmoon ── */
        if (t === 'bloodmoon') {
            var bmcx = W*0.84, bmcy = H*0.10;
            var bmg = dynC.createRadialGradient(bmcx, bmcy, 10, bmcx, bmcy, 150);
            bmg.addColorStop(0, 'rgba(220,30,30,0.55)');
            bmg.addColorStop(1, 'rgba(60,0,0,0)');
            dynC.fillStyle = bmg;
            dynC.beginPath(); dynC.arc(bmcx, bmcy, 150, 0, Math.PI*2); dynC.fill();
            /* bats */
            for (var bi = 0; bi < bats.length; bi++) {
                var BB = bats[bi];
                var wing = Math.sin(BB.flap) * BB.size * 0.8;
                dynC.fillStyle = '#0a0204';
                dynC.beginPath();
                dynC.moveTo(BB.x, BB.y);
                dynC.lineTo(BB.x - BB.size, BB.y - wing);
                dynC.lineTo(BB.x - BB.size*0.4, BB.y);
                dynC.lineTo(BB.x + BB.size*0.4, BB.y);
                dynC.lineTo(BB.x + BB.size, BB.y - wing);
                dynC.closePath(); dynC.fill();
            }
            dynC.fillStyle = 'rgba(80,0,10,0.12)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── firenado ── */
        if (t === 'firenado') {
            for (var tp2 = 0; tp2 < tParts.length; tp2++) {
                var fp = tParts[tp2], ffrac = fp.y;
                var fcx = tX + Math.cos(fp.angle) * fp.rad * (0.2 + ffrac*0.8);
                var fcy = GROUND*0.15 + ffrac * (GROUND*0.85);
                var fg2 = dynC.createRadialGradient(fcx, fcy, 0, fcx, fcy, fp.size*3);
                fg2.addColorStop(0, 'rgba(255,240,150,0.9)');
                fg2.addColorStop(0.4, 'rgba(255,100,20,0.7)');
                fg2.addColorStop(1, 'rgba(120,20,0,0)');
                dynC.fillStyle = fg2;
                dynC.beginPath(); dynC.arc(fcx, fcy, fp.size*3, 0, Math.PI*2); dynC.fill();
            }
            var topW2=W*0.10, tipW2=5, fTop2=GROUND*0.08, fBot2=GROUND*0.93;
            dynC.save();
            var ftg = dynC.createLinearGradient(tX, fTop2, tX, fBot2);
            ftg.addColorStop(0, 'rgba(255,80,10,0.6)');
            ftg.addColorStop(0.6, 'rgba(255,160,40,0.45)');
            ftg.addColorStop(1, 'rgba(120,30,0,0.7)');
            dynC.fillStyle = ftg;
            dynC.beginPath();
            dynC.moveTo(tX-topW2, fTop2);
            dynC.bezierCurveTo(tX-topW2*0.5, fTop2+(fBot2-fTop2)*0.5, tX-tipW2, fBot2-30, tX-tipW2*0.5, fBot2);
            dynC.lineTo(tX+tipW2*0.5, fBot2);
            dynC.bezierCurveTo(tX+tipW2, fBot2-30, tX+topW2*0.5, fTop2+(fBot2-fTop2)*0.5, tX+topW2, fTop2);
            dynC.closePath();
            dynC.fill();
            dynC.restore();
        }

        /* ── plasma arcs ── */
        if (t === 'plasma') {
            for (var ai = 0; ai < arcs.length; ai++) {
                var A = arcs[ai];
                var af = 1 - A.life / A.maxLife;
                dynC.strokeStyle = 'hsla(' + A.hue + ',100%,75%,' + (af*0.9) + ')';
                dynC.lineWidth = 4;
                dynC.shadowColor = 'hsl(' + A.hue + ',100%,70%)';
                dynC.shadowBlur = 18;
                dynC.beginPath();
                dynC.moveTo(A.pts[0].x, A.pts[0].y);
                for (var pp = 1; pp < A.pts.length; pp++) dynC.lineTo(A.pts[pp].x, A.pts[pp].y);
                dynC.stroke();
                dynC.shadowBlur = 0;
                dynC.strokeStyle = 'rgba(255,255,255,' + af + ')';
                dynC.lineWidth = 1.4;
                dynC.beginPath();
                dynC.moveTo(A.pts[0].x, A.pts[0].y);
                for (var pp2 = 1; pp2 < A.pts.length; pp2++) dynC.lineTo(A.pts[pp2].x, A.pts[pp2].y);
                dynC.stroke();
            }
            dynC.fillStyle = 'rgba(80,30,160,0.06)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── ashfall accumulation ── */
        if (t === 'ashfall') {
            dynC.fillStyle = 'rgba(60,55,50,0.65)';
            for (var aa = 0; aa < ashAccum.length; aa++) {
                var AA = ashAccum[aa];
                dynC.beginPath(); dynC.ellipse(AA.x, GROUND-1, AA.r*1.5, AA.r*0.5, 0, 0, Math.PI*2); dynC.fill();
            }
            dynC.fillStyle = 'rgba(40,35,30,0.08)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── bloodrain pools ── */
        if (t === 'bloodrain') {
            for (var bp2 = 0; bp2 < bloodPools.length; bp2++) {
                var BPL = bloodPools[bp2];
                var bbg = dynC.createRadialGradient(BPL.x, GROUND, 0, BPL.x, GROUND, BPL.r);
                bbg.addColorStop(0, 'rgba(160,10,20,0.9)');
                bbg.addColorStop(1, 'rgba(40,0,5,0.2)');
                dynC.fillStyle = bbg;
                dynC.beginPath(); dynC.ellipse(BPL.x, GROUND, BPL.r, BPL.r*0.3, 0, 0, Math.PI*2); dynC.fill();
            }
            dynC.fillStyle = 'rgba(80,0,10,0.10)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── venom fog ── */
        if (t === 'fogvenom') {
            dynC.fillStyle = 'rgba(20,80,30,0.18)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── black hole ── */
        if (t === 'blackhole') {
            var bcx = W*0.5, bcy = H*0.40;
            /* outer halo */
            var bgr = dynC.createRadialGradient(bcx, bcy, 20, bcx, bcy, Math.max(W,H)*0.6);
            bgr.addColorStop(0, 'rgba(180,40,255,0.6)');
            bgr.addColorStop(0.15, 'rgba(120,40,255,0.25)');
            bgr.addColorStop(0.5, 'rgba(40,0,100,0.15)');
            bgr.addColorStop(1, 'rgba(0,0,0,0)');
            dynC.fillStyle = bgr;
            dynC.fillRect(0, 0, W, H);
            /* accretion disc */
            dynC.save();
            dynC.translate(bcx, bcy);
            dynC.rotate(bhRot);
            for (var bd = 0; bd < 90; bd++) {
                var bdAng = (bd / 90) * Math.PI * 2;
                var bdR = 80 + bd*1.6;
                var bdg = dynC.createLinearGradient(0, 0, bdR, 0);
                bdg.addColorStop(0, 'rgba(255,255,255,0)');
                bdg.addColorStop(0.85, 'hsla(' + ((bd*4 + bhRot*40) % 360) + ',95%,65%,0.5)');
                bdg.addColorStop(1, 'rgba(255,255,255,0)');
                dynC.strokeStyle = bdg;
                dynC.lineWidth = 2;
                dynC.beginPath();
                dynC.arc(0, 0, bdR, bdAng, bdAng + 0.05);
                dynC.stroke();
            }
            dynC.restore();
            /* particles being sucked in */
            for (var bhi = 0; bhi < bhParts.length; bhi++) {
                var BH = bhParts[bhi];
                var bx = bcx + Math.cos(BH.angle) * BH.rad;
                var by = bcy + Math.sin(BH.angle) * BH.rad;
                dynC.fillStyle = 'hsla(' + BH.hue + ',95%,75%,' + BH.op + ')';
                dynC.beginPath(); dynC.arc(bx, by, BH.size, 0, Math.PI*2); dynC.fill();
            }
            /* event horizon */
            dynC.fillStyle = '#000000';
            dynC.beginPath(); dynC.arc(bcx, bcy, 60, 0, Math.PI*2); dynC.fill();
            var ehg = dynC.createRadialGradient(bcx, bcy, 55, bcx, bcy, 90);
            ehg.addColorStop(0, 'rgba(255,200,255,0.9)');
            ehg.addColorStop(1, 'rgba(120,0,200,0)');
            dynC.fillStyle = ehg;
            dynC.beginPath(); dynC.arc(bcx, bcy, 90, 0, Math.PI*2); dynC.fill();
        }

        /* ── aurora ── */
        if (t === 'aurora') {
            for (var ar2 = 0; ar2 < auroraRibbons.length; ar2++) {
                var AR = auroraRibbons[ar2];
                var rgrad = dynC.createLinearGradient(0, AR.y - AR.h/2, 0, AR.y + AR.h/2);
                rgrad.addColorStop(0, 'hsla(' + AR.hue + ',90%,65%,0)');
                rgrad.addColorStop(0.5, 'hsla(' + AR.hue + ',90%,65%,' + AR.op + ')');
                rgrad.addColorStop(1, 'hsla(' + ((AR.hue+60)%360) + ',90%,55%,0)');
                dynC.fillStyle = rgrad;
                dynC.beginPath();
                dynC.moveTo(0, AR.y);
                for (var rx = 0; rx <= W; rx += 8) {
                    var ry = AR.y + Math.sin(rx*AR.freq + AR.phase) * AR.amp;
                    dynC.lineTo(rx, ry - AR.h/2);
                }
                for (var rx2 = W; rx2 >= 0; rx2 -= 8) {
                    var ry2 = AR.y + Math.sin(rx2*AR.freq + AR.phase) * AR.amp;
                    dynC.lineTo(rx2, ry2 + AR.h/2);
                }
                dynC.closePath();
                dynC.fill();
            }
        }

        /* ── eclipse ── */
        if (t === 'eclipse') {
            var ecx = W*0.84, ecy = H*0.10;
            /* dark disc */
            dynC.fillStyle = '#000';
            dynC.beginPath(); dynC.arc(ecx, ecy, 32, 0, Math.PI*2); dynC.fill();
            /* corona */
            var ecg = dynC.createRadialGradient(ecx, ecy, 30, ecx, ecy, 110);
            ecg.addColorStop(0, 'rgba(255,255,220,0.9)');
            ecg.addColorStop(0.3, 'rgba(255,180,80,0.4)');
            ecg.addColorStop(1, 'rgba(255,80,20,0)');
            dynC.fillStyle = ecg;
            dynC.beginPath(); dynC.arc(ecx, ecy, 110, 0, Math.PI*2); dynC.fill();
            dynC.fillStyle = 'rgba(0,0,10,0.35)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── fireworks ── */
        if (t === 'fireworks') {
            for (var fk2 = 0; fk2 < fireworks.length; fk2++) {
                var FF = fireworks[fk2];
                var ffd = 1 - FF.life / FF.maxLife;
                var fgr = dynC.createRadialGradient(FF.x, FF.y, 0, FF.x, FF.y, 6);
                fgr.addColorStop(0, 'hsla(' + FF.hue + ',95%,75%,' + ffd + ')');
                fgr.addColorStop(1, 'hsla(' + FF.hue + ',95%,50%,0)');
                dynC.fillStyle = fgr;
                dynC.beginPath(); dynC.arc(FF.x, FF.y, 6, 0, Math.PI*2); dynC.fill();
            }
        }

        /* ── ufo ── */
        if (t === 'ufo') {
            for (var ui = 0; ui < ufos.length; ui++) {
                var U = ufos[ui];
                var uy = U.y + Math.sin(U.bob)*8;
                /* beam */
                if (U.beamOn) {
                    var bg2 = dynC.createLinearGradient(U.x, uy, U.x, GROUND);
                    bg2.addColorStop(0, 'hsla(' + U.hue + ',95%,70%,0.7)');
                    bg2.addColorStop(1, 'hsla(' + U.hue + ',95%,50%,0)');
                    dynC.fillStyle = bg2;
                    dynC.beginPath();
                    dynC.moveTo(U.x - U.size*0.2, uy + 4);
                    dynC.lineTo(U.x + U.size*0.2, uy + 4);
                    dynC.lineTo(U.x + U.size*1.4, GROUND);
                    dynC.lineTo(U.x - U.size*1.4, GROUND);
                    dynC.closePath(); dynC.fill();
                }
                /* saucer body */
                dynC.fillStyle = '#3a3a4a';
                dynC.beginPath(); dynC.ellipse(U.x, uy, U.size, U.size*0.32, 0, 0, Math.PI*2); dynC.fill();
                /* dome */
                var dg2 = dynC.createRadialGradient(U.x, uy - U.size*0.1, 2, U.x, uy - U.size*0.1, U.size*0.4);
                dg2.addColorStop(0, 'hsla(' + U.hue + ',95%,80%,1)');
                dg2.addColorStop(1, 'hsla(' + U.hue + ',95%,40%,0.4)');
                dynC.fillStyle = dg2;
                dynC.beginPath(); dynC.ellipse(U.x, uy - U.size*0.18, U.size*0.4, U.size*0.3, 0, Math.PI, 0); dynC.fill();
                /* lights */
                for (var ul = -2; ul <= 2; ul++) {
                    dynC.fillStyle = 'hsla(' + ((U.hue + ul*40 + ts/4) % 360) + ',95%,65%,1)';
                    dynC.beginPath(); dynC.arc(U.x + ul*U.size*0.3, uy + U.size*0.1, 2.5, 0, Math.PI*2); dynC.fill();
                }
            }
        }

        /* ── frostquake (ice spikes) ── */
        if (t === 'frostquake') {
            for (var is3 = 0; is3 < iceSpikes.length; is3++) {
                var IS = iceSpikes[is3];
                var ig = dynC.createLinearGradient(IS.x, GROUND - IS.grow, IS.x, GROUND);
                ig.addColorStop(0, 'rgba(200,240,255,0.95)');
                ig.addColorStop(1, 'rgba(80,150,220,0.6)');
                dynC.fillStyle = ig;
                dynC.beginPath();
                dynC.moveTo(IS.x - IS.w/2, GROUND);
                dynC.lineTo(IS.x, GROUND - IS.grow);
                dynC.lineTo(IS.x + IS.w/2, GROUND);
                dynC.closePath(); dynC.fill();
                dynC.strokeStyle = 'rgba(220,250,255,0.7)'; dynC.lineWidth = 1;
                dynC.stroke();
            }
            dynC.fillStyle = 'rgba(160,220,255,0.06)';
            dynC.fillRect(0, 0, W, H);
        }

        /* ── glitch ── */
        if (t === 'glitch') {
            for (var gb2 = 0; gb2 < glitchBands.length; gb2++) {
                var G = glitchBands[gb2];
                dynC.drawImage(cityCvs, 0, G.y, W, G.h, G.off, G.y, W, G.h);
                dynC.fillStyle = 'hsla(' + G.hue + ',95%,60%,0.30)';
                dynC.fillRect(0, G.y, W, G.h);
            }
            /* chromatic shift overlay */
            dynC.globalCompositeOperation = 'screen';
            dynC.globalAlpha = 0.20;
            dynC.fillStyle = '#ff0040';
            dynC.fillRect(Math.sin(ts/40)*3, 0, W, H);
            dynC.fillStyle = '#00ffaa';
            dynC.fillRect(Math.cos(ts/55)*3, 0, W, H);
            dynC.globalAlpha = 1;
            dynC.globalCompositeOperation = 'source-over';
        }
    }

    /* ── main loop ── */
    function tick(ts) {
        var dt = Math.min(ts - lastTime, 50); lastTime = ts;
        eventTimer += dt;
        if (eventTimer >= EVENT_DURATION) {
            eventTimer = 0;
            eventIndex = (eventIndex + 1) % EVENTS.length;
            drawBg(); buildClouds(); buildBgCity(); buildLandmarks(); initEvent();
        }
        updateBuildings(dt); updateParticles(dt);
        winFlickerT += dt;
        if (winFlickerT >= WIN_FLICKER_INT) {
            winFlickerT = 0;
            flickerWindows();
        }
        drawCity(ts); drawDynamic(ts);

        var evt = EVENTS[eventIndex].type;
        var shimmer = evt === 'heat';

        /* screen shake offsets */
        var sx = (shake > 0.1) ? (Math.random()-0.5) * shake : 0;
        var sy = (shake > 0.1) ? (Math.random()-0.5) * shake : 0;

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        if (sx || sy) ctx.translate(sx, sy);
        ctx.drawImage(bgCvs, 0, 0);
        if (!shimmer) ctx.drawImage(cityCvs, 0, 0);
        ctx.drawImage(dynCvs, 0, 0);
        ctx.restore();

        /* vignette for apocalyptic moods */
        if (evt === 'blackhole' || evt === 'bloodmoon' || evt === 'eclipse' || evt === 'meteors' || evt === 'volcano') {
            var vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.7);
            vg.addColorStop(0, 'rgba(0,0,0,0)');
            vg.addColorStop(1, 'rgba(0,0,0,0.55)');
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, W, H);
        }
        animId = requestAnimationFrame(tick);
    }

    function init() {
        resize(); buildBgCity(); buildClouds(); buildLandmarks(); drawBg(); buildClouds(); initEvent();
        lastTime = performance.now();
        animId = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', function () {
        resize(); buildBgCity(); buildClouds(); buildLandmarks(); drawBg(); initEvent();
    });

    init();
})();
