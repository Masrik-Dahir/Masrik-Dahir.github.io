(function () {
    var canvas = document.getElementById('canv');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var bgCvs   = document.createElement('canvas'), bgC   = bgCvs.getContext('2d');
    var cityCvs = document.createElement('canvas'), cityC = cityCvs.getContext('2d');
    var dynCvs  = document.createElement('canvas'), dynC  = dynCvs.getContext('2d');

    var W, H, GROUND, animId, lastTime = 0;

    /* ── window states ── */
    var WIN_POOL = [0,0,0,1,1,1,2,2,2,2,3,3]; /* weighted toward lit */
    var WIN_FLICKER_INT = 1800;
    var winFlickerT = 0;

    /* ── weather / disaster events (whitish-night palette: deep indigo → near-white horizon) ── */
    var EVENTS = [
        { type:'clear',     sky0:'#606f88', sky1:'#b8c8d8' },
        { type:'rain',      sky0:'#5e6878', sky1:'#9aaab8' },
        { type:'storm',     sky0:'#505860', sky1:'#848c98' },
        { type:'snow',      sky0:'#686e80', sky1:'#b4c0cc' },
        { type:'blizzard',  sky0:'#606878', sky1:'#a8b4c4' },
        { type:'tornado',   sky0:'#5a5e58', sky1:'#909488' },
        { type:'flood',     sky0:'#546070', sky1:'#8c9eac' },
        { type:'hail',      sky0:'#585860', sky1:'#8c8c9c' },
        { type:'wind',      sky0:'#606878', sky1:'#a8b4c4' },
        { type:'heat',      sky0:'#685848', sky1:'#a09488' },
        { type:'earthquake',sky0:'#5e5048', sky1:'#948c7e' },
        { type:'meteor',    sky0:'#4c4c5c', sky1:'#848090' },
        { type:'aurora',    sky0:'#4a5a60', sky1:'#7c909c' },
        { type:'starry',    sky0:'#0a0c14', sky1:'#1a1c28' },
        { type:'shooting',  sky0:'#0c0e18', sky1:'#181a24' },
        { type:'fireworks', sky0:'#08080e', sky1:'#14141e' },
        { type:'bloodmoon', sky0:'#1a0404', sky1:'#2a0808' },
        { type:'nebula',    sky0:'#0a0218', sky1:'#180830' },

        /* ── ten invented weather phenomena ──────────────────────
           Each event keeps its own display name (`type`) so the
           weather widget treats it as a distinct entry, but pipes
           into one of the existing particle/render systems via the
           `alias` field. Sky palettes are hand-tuned and unique. */

        /* Pink dust storm: warm purple gloom drifting fine particles. */
        { type:'roseDust',       alias:'wind',      sky0:'#5a3c4c', sky1:'#a08090' },

        /* Golden mid-day shower — soft gold drizzle, warm beige horizon. */
        { type:'goldShower',     alias:'rain',      sky0:'#6a5828', sky1:'#cfb888' },

        /* Cherry-blossom storm: dusty pink slow-falling petals. */
        { type:'cherryStorm',    alias:'blizzard',  sky0:'#6a4858', sky1:'#d8a0b8' },

        /* Mint mist: minty teal-green hush over the city. */
        { type:'mintMist',       alias:'rain',      sky0:'#386858', sky1:'#a0cfb8' },

        /* Amber hail: warm copper sky, bronze ice. */
        { type:'amberHail',      alias:'hail',      sky0:'#5a3818', sky1:'#b8884c' },

        /* Violet gale: deep amethyst cyclonic wind streaks. */
        { type:'violetWind',     alias:'wind',      sky0:'#382858', sky1:'#7868b8' },

        /* Coral flood: warm peach rising-water cataclysm. */
        { type:'coralFlood',     alias:'flood',     sky0:'#5a2c20', sky1:'#c08868' },

        /* Jade meteors: emerald sky, green plasma trails. */
        { type:'jadeMeteors',    alias:'meteor',    sky0:'#08382a', sky1:'#388058' },

        /* Topaz fireworks: warm yellow night sky, golden bursts. */
        { type:'topazFireworks', alias:'fireworks', sky0:'#181408', sky1:'#382c10' },

        /* Silver nebula: cool silvery cosmic clouds over a sleeping city. */
        { type:'silverNebula',   alias:'nebula',    sky0:'#1c2030', sky1:'#9cb0c8' }
    ];

    /* Resolve an event entry's effective rendering type.
       Some EVENTS carry a UI-only `type` (e.g. 'roseDust') with an
       `alias` field naming the existing particle/render path to
       reuse (e.g. 'wind'). All rendering code that previously read
       `ev.type` should go through this helper. */
    function effType(ev) { return (ev && ev.alias) ? ev.alias : (ev && ev.type); }
    /* start on a real weather/disaster event (skip index 0 = 'clear') */
    var eventIndex = 1 + Math.floor(Math.random() * (EVENTS.length - 1));
    var eventTimer = 0, EVENT_DURATION = 12000;

    var particles = [], POOL = 360, splashes = [];
    var ltTimer = 0, ltActive = false, ltPts = [], ltFlash = 0;
    var floodY = 0, floodRising = false;
    var tSwayT = 0, tX = 0;

    var LM = [], BGBUILDS = [];
    var vehicles = [], peds = [];
    var cityBuilt = false;
    var esbAngle = 0;

    function rng(a,b)  { return Math.random()*(b-a)+a; }
    function rngI(a,b) { return Math.floor(rng(a,b)); }

    function resize() {
        W = canvas.width  = bgCvs.width  = cityCvs.width  = dynCvs.width  = window.innerWidth;
        H = canvas.height = bgCvs.height = cityCvs.height = dynCvs.height = window.innerHeight;
        GROUND = Math.floor(H * 0.78);
        ctx.lineCap = bgC.lineCap = cityC.lineCap = dynC.lineCap = 'round';
    }

    /* ══════════════════════════════════════════════
       LIGHT + GLOW HELPERS
    ══════════════════════════════════════════════ */

    /* soft radial bloom — never use shadowBlur (kills perf) */
    function radialGlow(c, cx, cy, r, rr, gg, bb, a) {
        var g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, 'rgba('+rr+','+gg+','+bb+','+a+')');
        g.addColorStop(1, 'rgba('+rr+','+gg+','+bb+',0)');
        c.fillStyle = g;
        c.fillRect(cx-r, cy-r, r*2, r*2);
    }

    /* draw one window with optional corona halo
       state: 0=dark  1=blue-office  2=warm-amber  3=bright-white */
    function drawWin(c, x, y, w, h, state) {
        var cols = [
            'rgba(8,15,35,0.90)',       /* dark */
            'rgba(50,110,210,0.85)',    /* blue */
            'rgba(255,210,70,0.95)',    /* amber */
            'rgba(255,252,235,0.98)'   /* bright white */
        ];
        c.fillStyle = cols[state] || cols[0];
        c.fillRect(x, y, w, h);
        if (state === 1) radialGlow(c, x+w/2, y+h/2, w*3.5, 60,120,220, 0.18);
        if (state === 2) radialGlow(c, x+w/2, y+h/2, w*4,   255,200,60, 0.22);
        if (state === 3) radialGlow(c, x+w/2, y+h/2, w*5,   255,250,220,0.28);
    }

    /* neon sign with colored bloom */
    function neonSign(c, cx, ty, text, rr, gg, bb, sz) {
        sz = sz || 9;
        var tw = text.length * sz * 0.65 + 10;
        /* bloom */
        radialGlow(c, cx, ty, tw*1.2, rr,gg,bb, 0.35);
        /* panel */
        c.fillStyle = 'rgba(0,0,0,0.70)';
        c.fillRect(cx-tw/2, ty-sz-4, tw, sz+8);
        /* text */
        c.fillStyle = 'rgb('+rr+','+gg+','+bb+')';
        c.font = 'bold '+sz+'px monospace';
        c.textAlign = 'center';
        c.fillText(text, cx, ty);
        c.textAlign = 'left';
    }

    /* street lamp cone beam downward */
    function lampCone(c, lx, ly, angle) {
        var g = c.createLinearGradient(lx, ly, lx + Math.sin(angle)*60, ly+80);
        g.addColorStop(0, 'rgba(255,210,80,0.28)');
        g.addColorStop(1, 'rgba(255,210,80,0)');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(lx, ly);
        c.lineTo(lx - 38, ly+80);
        c.lineTo(lx + 38, ly+80);
        c.closePath();
        c.fill();
    }

    /* ══════════════════════════════════════════════
       BACKGROUND BUILDINGS — 5 architectural types
       each with floor lines + window grid + corona
    ══════════════════════════════════════════════ */

    var BLD_TYPES = ['brownstone','prewar','glass','artdeco','industrial'];

    var NEON_TEXTS  = ['HOTEL','DINER','PIZZA','CAFE','BAKERY','LAUNDRY','OPEN','PHARMACY','TAILOR','MARKET'];
    var NEON_COLORS = [
        [255,40,40],[40,200,255],[255,120,20],[180,60,255],
        [60,255,120],[255,220,0],[255,60,160],[80,220,255]
    ];

    /* city-specific background building palettes — indexed by currentCityIndex */
    /* shade = base luminance (12-50 for night scene dark buildings)
       tint  = [Δr, Δg, Δb] color push to create real building hues               */
    var CITY_BG_CFG = [
        /* 0 NYC */ {types:['brownstone','prewar','glass','artdeco','industrial'], flR:[3,32], shR:[22,40], tint:[40,8,-8],  glassBlue:true,  neon:0.22, roof:'flat'},
        /* 1 CHI */ {types:['glass','artdeco','glass','prewar','industrial'],      flR:[8,35], shR:[18,32], tint:[10,14,28], glassBlue:true,  neon:0.15, roof:'flat'},
        /* 2 TKY */ {types:['glass','glass','industrial','prewar'],                flR:[8,40], shR:[16,28], tint:[8,10,22],  glassBlue:true,  neon:0.50, roof:'flat'},
        /* 3 BEI */ {types:['brownstone','prewar','artdeco'],                      flR:[3,12], shR:[20,34], tint:[38,16,-5], glassBlue:false, neon:0.10, roof:'flat'},
        /* 4 LON */ {types:['brownstone','brownstone','prewar','artdeco'],         flR:[4,14], shR:[22,38], tint:[45,6,-8],  glassBlue:false, neon:0.08, roof:'flat'},
        /* 5 DXB */ {types:['glass','glass','artdeco'],                            flR:[20,55],shR:[14,26], tint:[6,14,40],  glassBlue:true,  neon:0.12, roof:'flat'},
        /* 6 PAR */ {types:['prewar','prewar','brownstone','artdeco'],             flR:[5,8],  shR:[24,38], tint:[46,36,16], glassBlue:false, neon:0.10, roof:'mansard'},
        /* 7 PRG */ {types:['brownstone','prewar'],                                flR:[3,7],  shR:[22,36], tint:[44,22,-6], glassBlue:false, neon:0.08, roof:'flat'}
    ];

    function buildBgBuildings() {
        BGBUILDS = [];
        var cfg = CITY_BG_CFG[currentCityIndex] || CITY_BG_CFG[0];
        for (var i = 0; i < 90; i++) {
            var type  = cfg.types[rngI(0, cfg.types.length)];
            var flH   = (type==='brownstone'||type==='industrial') ? rngI(14,20) : rngI(10,16);
            var floors= rngI(cfg.flR[0], cfg.flR[1]);
            var bw    = (type==='glass') ? rngI(28,62) : (type==='brownstone') ? rngI(18,36) : rngI(20,56);
            var bh    = floors * flH;
            var shade = rngI(cfg.shR[0], cfg.shR[1]);
            var t     = cfg.tint;
            var nc    = NEON_COLORS[rngI(0,NEON_COLORS.length)];
            BGBUILDS.push({
                x:         rng(-30, W+30),
                w:         bw,
                h:         bh,
                floors:    floors,
                flH:       flH,
                type:      type,
                shade:     shade,
                facadeRgb: [Math.min(255,shade+t[0]), Math.min(255,shade+t[1]), Math.min(255,shade+t[2])],
                glassBlue: cfg.glassBlue,
                roofStyle: cfg.roof,
                wins:      genWins(floors * Math.max(1,Math.floor(bw/9))),
                hasNeon:   rng(0,1) < cfg.neon,
                neonText:  NEON_TEXTS[rngI(0,NEON_TEXTS.length)],
                neonColor: nc
            });
        }
    }

    function genWins(n) {
        var w=[];
        for (var i=0;i<n;i++) w.push(WIN_POOL[rngI(0,WIN_POOL.length)]);
        return w;
    }

    function drawBgBuilding(c, b) {
        var x = b.x, bw = b.w, bh = b.h;
        var by = GROUND - bh;
        var s  = b.shade;
        var fr = b.facadeRgb ? b.facadeRgb[0] : s;
        var fg = b.facadeRgb ? b.facadeRgb[1] : s;
        var fbl= b.facadeRgb ? b.facadeRgb[2] : s + 6;

        /* facade */
        if (b.type === 'glass') {
            var gf = c.createLinearGradient(x, by, x+bw, by);
            /* reflective glass — cool blue for all cities */
            gf.addColorStop(0,   'rgb('+fr+','+fg+','+fbl+')');
            gf.addColorStop(0.3, 'rgb('+(fr+8)+','+(fg+12)+','+(fbl+22)+')');
            gf.addColorStop(0.6, 'rgb('+(fr+4)+','+(fg+8)+','+(fbl+16)+')');
            gf.addColorStop(1,   'rgb('+fr+','+fg+','+fbl+')');
            c.fillStyle = gf;
        } else {
            c.fillStyle = 'rgb('+fr+','+fg+','+fbl+')';
        }
        c.fillRect(x, by, bw, bh);

        /* outline */
        c.strokeStyle = 'rgba(30,30,50,0.55)';
        c.lineWidth   = 0.8;
        c.strokeRect(x+0.5, by+0.5, bw-1, bh-1);

        /* floor lines */
        c.strokeStyle = (b.type==='glass') ? 'rgba(60,80,120,0.35)' : 'rgba(0,0,0,0.22)';
        c.lineWidth = 0.7;
        for (var f=1; f<b.floors; f++) {
            var fy = GROUND - f*b.flH;
            c.beginPath(); c.moveTo(x+1, fy); c.lineTo(x+bw-1, fy); c.stroke();
        }

        /* cornice / parapet */
        if (b.type==='brownstone' || b.type==='prewar' || b.type==='artdeco') {
            c.fillStyle = 'rgba(255,255,255,0.08)';
            c.fillRect(x, by, bw, 4);
            c.fillStyle = 'rgba(0,0,0,0.18)';
            c.fillRect(x, by+4, bw, 3);
        }
        if (b.type==='artdeco') {
            c.fillStyle = 'rgba(255,255,255,0.06)';
            c.fillRect(x+bw*0.15, by-5, bw*0.70, 5);
            c.fillRect(x+bw*0.30, by-9, bw*0.40, 4);
        }

        /* Paris mansard roof */
        if (b.roofStyle === 'mansard') {
            var ms = Math.max(0, fr - 20);
            c.fillStyle = 'rgb('+ms+','+Math.max(0,fg-18)+','+Math.max(0,fbl-14)+')';
            c.beginPath();
            c.moveTo(x, by); c.lineTo(x-4, by-13); c.lineTo(x+bw+4, by-13); c.lineTo(x+bw, by);
            c.closePath(); c.fill();
            c.strokeStyle = 'rgba(80,60,40,0.35)'; c.lineWidth = 0.7; c.stroke();
            /* dormer windows */
            c.fillStyle = 'rgba(255,240,200,0.65)';
            var dormers = Math.max(1, Math.floor(bw/14));
            for (var dm = 0; dm < dormers; dm++) {
                var dmx = x + 8 + dm * 14;
                if (dmx + 5 < x + bw) {
                    c.fillRect(dmx, by-11, 5, 6);
                    c.beginPath(); c.arc(dmx+2.5, by-11, 2.5, Math.PI, 0, false); c.fill();
                }
            }
        }

        /* window grid — clipped strictly to building bounds */
        c.save();
        c.beginPath(); c.rect(x+1, by+1, bw-2, bh-2); c.clip();
        var wCols = Math.max(1, Math.floor(bw/9));
        var ww    = 5, wh = 7;
        var padX  = (bw - wCols*(ww+2)) / 2;
        var wi    = 0;
        for (var row=0; row<b.floors-1; row++) {
            for (var col=0; col<wCols; col++, wi++) {
                var wx = x + padX + col*(ww+2);
                var wy = GROUND - (row+1)*b.flH + 3;
                var st = b.wins[wi % b.wins.length];
                drawWin(c, wx, wy, ww, wh, st);
            }
        }
        c.restore();

        /* neon sign */
        if (b.hasNeon) {
            var nc = b.neonColor;
            neonSign(c, x+bw/2, by+bh*0.08, b.neonText, nc[0],nc[1],nc[2], 8);
        }

        /* water tower on some buildings */
        if (b.type==='prewar'||b.type==='artdeco') {
            if (rng(0,1)<0.3) {
                var tx = x + bw*0.65, tBaseY = by;
                c.fillStyle = 'rgb('+(s-4)+','+(s-4)+','+(s-2)+')';
                c.beginPath();
                c.moveTo(tx-6, tBaseY); c.lineTo(tx+6, tBaseY);
                c.lineTo(tx+5, tBaseY-14); c.lineTo(tx-5, tBaseY-14);
                c.closePath(); c.fill();
                c.fillRect(tx-1, tBaseY-22, 2, 8);
            }
        }
    }

    /* ══════════════════════════════════════════════
       LANDMARK DRAWING — greatly improved detail
    ══════════════════════════════════════════════ */

    function drawStatueOfLiberty(c, cx, gy) {
        var bH = H * 0.38;
        var patina = '#6a8a78', patinaD = '#4a6858', patinaL = '#8aaa98';
        var stone  = '#2a2a36', stoneL  = '#363648';

        /* harbour water shimmer */
        c.fillStyle='rgba(50,70,100,0.35)'; c.fillRect(cx-60,gy,120,14);
        for(var ww=0;ww<6;ww++) {
            c.strokeStyle='rgba(120,160,200,0.18)'; c.lineWidth=1;
            c.beginPath(); c.moveTo(cx-50+ww*18,gy+4+ww%2*4); c.lineTo(cx-34+ww*18,gy+4+ww%2*4); c.stroke();
        }

        /* star-fort island base */
        c.fillStyle=stone;
        c.beginPath();
        for(var pt=0;pt<10;pt++) {
            var ra = pt%2===0 ? 44 : 28;
            var an = -Math.PI/2 + pt*Math.PI/5;
            if(pt===0) c.moveTo(cx+Math.cos(an)*ra, gy+Math.sin(an)*ra);
            else c.lineTo(cx+Math.cos(an)*ra, gy+Math.sin(an)*ra);
        }
        c.closePath(); c.fill();
        c.strokeStyle=stoneL; c.lineWidth=0.8; c.stroke();

        /* fort battlements */
        c.fillStyle=stoneL;
        for(var mb=-4;mb<=4;mb++) { c.fillRect(cx+mb*9-3, gy-14, 5, 8); }
        c.fillRect(cx-40, gy-8, 80, 8);

        /* granite pedestal — 3 tiers */
        c.fillStyle=stone; c.strokeStyle=stoneL; c.lineWidth=1;
        c.fillRect(cx-26, gy-bH*0.28, 52, bH*0.28); c.strokeRect(cx-26, gy-bH*0.28, 52, bH*0.28);
        c.fillRect(cx-20, gy-bH*0.40, 40, bH*0.12); c.strokeRect(cx-20, gy-bH*0.40, 40, bH*0.12);
        c.fillRect(cx-15, gy-bH*0.48, 30, bH*0.08); c.strokeRect(cx-15, gy-bH*0.48, 30, bH*0.08);
        /* pedestal detail lines */
        c.strokeStyle='rgba(80,80,110,0.4)'; c.lineWidth=0.6;
        for(var pl=1;pl<4;pl++) {
            var py=gy-bH*0.07*pl;
            c.beginPath(); c.moveTo(cx-26,py); c.lineTo(cx+26,py); c.stroke();
        }
        /* pedestal corner pilasters */
        c.strokeStyle=stoneL; c.lineWidth=1.2;
        c.beginPath(); c.moveTo(cx-22,gy-bH*0.28); c.lineTo(cx-22,gy); c.stroke();
        c.beginPath(); c.moveTo(cx+22,gy-bH*0.28); c.lineTo(cx+22,gy); c.stroke();

        /* glow at base — uplight */
        radialGlow(c, cx, gy-bH*0.10, 50, 120,180,140, 0.12);

        /* robe / draped body — smooth curves */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=1.2;
        c.beginPath();
        c.moveTo(cx-14, gy-bH*0.48);
        c.lineTo(cx+14, gy-bH*0.48);
        c.quadraticCurveTo(cx+16, gy-bH*0.58, cx+12, gy-bH*0.66);
        c.lineTo(cx+9,  gy-bH*0.70);
        c.lineTo(cx+8,  gy-bH*0.74);
        c.lineTo(cx+6,  gy-bH*0.76);
        c.lineTo(cx-6,  gy-bH*0.76);
        c.lineTo(cx-8,  gy-bH*0.73);
        c.quadraticCurveTo(cx-13, gy-bH*0.66, cx-12, gy-bH*0.58);
        c.closePath(); c.fill(); c.stroke();
        /* robe fold lines */
        c.strokeStyle=patinaD; c.lineWidth=0.7;
        for(var rf=-1;rf<=1;rf++) {
            c.beginPath();
            c.moveTo(cx+rf*4, gy-bH*0.50);
            c.quadraticCurveTo(cx+rf*5, gy-bH*0.62, cx+rf*3, gy-bH*0.74);
            c.stroke();
        }

        /* tablet (book of law) — in left arm */
        c.fillStyle=patinaD; c.strokeStyle=patina; c.lineWidth=0.8;
        c.fillRect(cx-13, gy-bH*0.68, 9, bH*0.16);
        c.strokeRect(cx-13, gy-bH*0.68, 9, bH*0.16);
        c.strokeStyle='rgba(150,200,170,0.25)'; c.lineWidth=0.5;
        c.beginPath(); c.moveTo(cx-9, gy-bH*0.66); c.lineTo(cx-9, gy-bH*0.54); c.stroke();

        /* neck + shoulders */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=1;
        c.beginPath();
        c.moveTo(cx-9, gy-bH*0.76);
        c.lineTo(cx+9, gy-bH*0.76);
        c.lineTo(cx+7, gy-bH*0.80);
        c.lineTo(cx-7, gy-bH*0.80);
        c.closePath(); c.fill(); c.stroke();

        /* right arm raised — elbow bend */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=1;
        c.beginPath();
        c.moveTo(cx+8,  gy-bH*0.76);
        c.lineTo(cx+14, gy-bH*0.72);
        c.lineTo(cx+18, gy-bH*0.80);
        c.lineTo(cx+16, gy-bH*0.88);
        c.lineTo(cx+12, gy-bH*0.92);
        c.lineTo(cx+9,  gy-bH*0.90);
        c.lineTo(cx+11, gy-bH*0.82);
        c.lineTo(cx+10, gy-bH*0.76);
        c.closePath(); c.fill(); c.stroke();

        /* head — face silhouette */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=1;
        c.beginPath();
        c.ellipse(cx, gy-bH*0.84, 7, 9, 0, 0, Math.PI*2);
        c.fill(); c.stroke();
        /* nose/chin profile */
        c.strokeStyle=patinaD; c.lineWidth=0.7;
        c.beginPath();
        c.moveTo(cx+4, gy-bH*0.84);
        c.quadraticCurveTo(cx+8, gy-bH*0.82, cx+5, gy-bH*0.78);
        c.stroke();

        /* crown — 7 rays radiating upward */
        c.strokeStyle=patinaL; c.lineWidth=1.8;
        for(var s=0;s<7;s++) {
            var ang = -Math.PI/2 + (s-3)*0.26;
            c.beginPath();
            c.moveTo(cx+Math.cos(ang)*7,  gy-bH*0.90+Math.sin(ang)*7);
            c.lineTo(cx+Math.cos(ang)*20, gy-bH*0.90+Math.sin(ang)*20);
            c.stroke();
        }
        /* crown band */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=0.8;
        c.beginPath(); c.arc(cx, gy-bH*0.90, 7, Math.PI, 0); c.closePath(); c.fill(); c.stroke();

        /* torch handle */
        c.fillStyle=patina; c.strokeStyle=patinaD; c.lineWidth=1;
        c.fillRect(cx+10, gy-bH*0.98, 5, bH*0.06);
        c.strokeRect(cx+10, gy-bH*0.98, 5, bH*0.06);
        /* torch bowl */
        c.beginPath();
        c.moveTo(cx+8,  gy-bH*0.98);
        c.lineTo(cx+18, gy-bH*0.98);
        c.lineTo(cx+16, gy-bH*1.01);
        c.lineTo(cx+10, gy-bH*1.01);
        c.closePath(); c.fill(); c.stroke();

        /* torch flame — layered glow */
        var tx=cx+13, ty=gy-bH*1.05;
        radialGlow(c, tx, ty, 55, 255,140,0,  0.25);
        radialGlow(c, tx, ty, 28, 255,190,60, 0.45);
        radialGlow(c, tx, ty, 14, 255,230,100,0.70);
        /* inner flame shape */
        c.fillStyle='rgba(255,220,80,0.95)';
        c.beginPath();
        c.moveTo(tx-5, ty+4);
        c.quadraticCurveTo(tx-3, ty-6, tx, ty-12);
        c.quadraticCurveTo(tx+3, ty-6, tx+5, ty+4);
        c.closePath(); c.fill();
        c.fillStyle='rgba(255,255,200,0.90)';
        c.beginPath();
        c.moveTo(tx-2, ty+2);
        c.quadraticCurveTo(tx, ty-8, tx+2, ty+2);
        c.closePath(); c.fill();

        /* reflection in water */
        c.globalAlpha=0.10;
        c.save(); c.scale(1,-0.25); c.translate(0,-gy*4.25);
        c.fillStyle=patina;
        c.fillRect(cx-14, gy-bH*0.48, 28, bH*0.48);
        c.restore(); c.globalAlpha=1;
    }

    function drawBrooklynBridge(c, cx, gy) {
        var span=W*0.21, th=H*0.32, deckY=gy-H*0.06;

        /* anchorage blocks */
        c.fillStyle='#181822'; c.strokeStyle='#25253a'; c.lineWidth=1;
        c.fillRect(cx-span*0.72-18,gy-H*0.04,36,H*0.04);
        c.fillRect(cx+span*0.72-18,gy-H*0.04,36,H*0.04);

        /* road deck */
        c.fillStyle='#101018'; c.fillRect(cx-span*0.74,deckY,span*1.48,8);
        /* upper walkway */
        c.fillStyle='#13131c'; c.fillRect(cx-span*0.74,deckY-8,span*1.48,5);

        /* left tower — Gothic */
        c.fillStyle='#181824'; c.strokeStyle='#25253c'; c.lineWidth=1.5;
        c.fillRect(cx-span/2-15,gy-th,30,th); c.strokeRect(cx-span/2-15,gy-th,30,th);

        /* left tower Gothic arch windows (double) */
        var atx=cx-span/2-15;
        c.strokeStyle='#2c2c40'; c.lineWidth=1.2;
        for(var ai=0;ai<2;ai++) {
            var aox=atx+5+ai*12;
            c.beginPath();
            c.moveTo(aox,gy-th*0.58);
            c.lineTo(aox,gy-th*0.74);
            c.quadraticCurveTo(aox+5,gy-th*0.84,aox+10,gy-th*0.74);
            c.lineTo(aox+10,gy-th*0.58);
            c.stroke();
        }
        /* lower arch cutout */
        c.strokeStyle='#2c2c40'; c.lineWidth=2;
        c.beginPath();
        c.moveTo(atx+4,gy-th*0.34);
        c.lineTo(atx+4,gy-th*0.48);
        c.quadraticCurveTo(atx+15,gy-th*0.56,atx+26,gy-th*0.48);
        c.lineTo(atx+26,gy-th*0.34);
        c.stroke();
        /* tower top decorative cornice */
        c.fillStyle='rgba(255,255,255,0.07)';
        c.fillRect(cx-span/2-18,gy-th,36,4);

        /* right tower — same */
        c.fillStyle='#181824'; c.strokeStyle='#25253c'; c.lineWidth=1.5;
        c.fillRect(cx+span/2-15,gy-th,30,th); c.strokeRect(cx+span/2-15,gy-th,30,th);
        var atx2=cx+span/2-15;
        c.strokeStyle='#2c2c40'; c.lineWidth=1.2;
        for(var ai2=0;ai2<2;ai2++) {
            var aox2=atx2+5+ai2*12;
            c.beginPath();
            c.moveTo(aox2,gy-th*0.58);
            c.lineTo(aox2,gy-th*0.74);
            c.quadraticCurveTo(aox2+5,gy-th*0.84,aox2+10,gy-th*0.74);
            c.lineTo(aox2+10,gy-th*0.58);
            c.stroke();
        }
        c.strokeStyle='#2c2c40'; c.lineWidth=2;
        c.beginPath();
        c.moveTo(atx2+4,gy-th*0.34);
        c.lineTo(atx2+4,gy-th*0.48);
        c.quadraticCurveTo(atx2+15,gy-th*0.56,atx2+26,gy-th*0.48);
        c.lineTo(atx2+26,gy-th*0.34);
        c.stroke();
        c.fillStyle='rgba(255,255,255,0.07)';
        c.fillRect(cx+span/2-18,gy-th,36,4);

        /* main suspension cables — pair */
        c.strokeStyle='#2e2e44'; c.lineWidth=2.5;
        var cPts=[
            {ax:cx-span*0.70, ay:gy-th*0.06},
            {ax:cx-span/2,    ay:gy-th*0.94},
            {ax:cx,           ay:deckY-H*0.055},
            {ax:cx+span/2,    ay:gy-th*0.94},
            {ax:cx+span*0.70, ay:gy-th*0.06}
        ];
        for(var off=-3;off<=3;off+=6) {
            c.beginPath();
            c.moveTo(cPts[0].ax,cPts[0].ay+off);
            c.bezierCurveTo(cPts[1].ax,cPts[1].ay+off, cPts[2].ax,cPts[2].ay+off, cPts[2].ax,cPts[2].ay+off);
            c.bezierCurveTo(cPts[2].ax,cPts[2].ay+off, cPts[3].ax,cPts[3].ay+off, cPts[4].ax,cPts[4].ay+off);
            c.stroke();
        }

        /* vertical hangers */
        c.strokeStyle='#252535'; c.lineWidth=0.8;
        for(var hw=-12;hw<=12;hw++) {
            var hx=cx+hw*span*0.052;
            var frac=Math.abs(hw)/12;
            var cableY=deckY-H*0.055+frac*frac*(gy-th*0.94-(deckY-H*0.055));
            c.beginPath(); c.moveTo(hx,deckY); c.lineTo(hx,cableY); c.stroke();
        }
    }

    function drawFlatiron(c, cx, gy, wins) {
        var bH=H*0.38;

        /* base wider sections */
        c.fillStyle='#191924'; c.strokeStyle='#272738'; c.lineWidth=1;
        c.beginPath();
        c.moveTo(cx-28,gy);
        c.lineTo(cx+28,gy);
        c.lineTo(cx+22,gy-bH*0.08);
        c.lineTo(cx+16,gy-bH*0.16);
        c.lineTo(cx+10,gy-bH*0.28);
        c.lineTo(cx+5, gy-bH*0.50);
        c.lineTo(cx+2, gy-bH*0.74);
        c.lineTo(cx+0.5,gy-bH);
        c.lineTo(cx-0.5,gy-bH);
        c.lineTo(cx-2, gy-bH*0.74);
        c.lineTo(cx-5, gy-bH*0.50);
        c.lineTo(cx-10,gy-bH*0.28);
        c.lineTo(cx-16,gy-bH*0.16);
        c.lineTo(cx-22,gy-bH*0.08);
        c.closePath(); c.fill(); c.stroke();

        /* horizontal belt courses */
        c.strokeStyle='rgba(255,255,255,0.09)'; c.lineWidth=1.5;
        for(var bc=0;bc<4;bc++) {
            var frac=0.15+bc*0.18;
            var w2=28*(1-frac)+2;
            c.beginPath();
            c.moveTo(cx-w2,gy-bH*frac);
            c.lineTo(cx+w2, gy-bH*frac);
            c.stroke();
        }

        /* cornice */
        c.fillStyle='rgba(255,255,255,0.08)'; c.fillRect(cx-20,gy-bH*0.14,40,4);

        /* windows grid — clipped to tapered silhouette */
        if(wins) {
            var rows=7, wi=0;
            c.save();
            c.beginPath();
            c.moveTo(cx-28,gy); c.lineTo(cx+28,gy);
            c.lineTo(cx+22,gy-bH*0.08); c.lineTo(cx+16,gy-bH*0.16);
            c.lineTo(cx+10,gy-bH*0.28); c.lineTo(cx+5,gy-bH*0.50);
            c.lineTo(cx+2,gy-bH*0.74);  c.lineTo(cx+0.5,gy-bH);
            c.lineTo(cx-0.5,gy-bH);     c.lineTo(cx-2,gy-bH*0.74);
            c.lineTo(cx-5,gy-bH*0.50);  c.lineTo(cx-10,gy-bH*0.28);
            c.lineTo(cx-16,gy-bH*0.16); c.lineTo(cx-22,gy-bH*0.08);
            c.closePath(); c.clip();
            for(var r=0;r<rows;r++) {
                for(var co=-1;co<=1;co++,wi++) {
                    var wx=cx+co*8-3, wy=gy-bH*(0.18+r*0.09);
                    drawWin(c, wx,wy, 5,7, wins[wi%wins.length]);
                }
            }
            c.restore();
        }
    }

    function drawRockCenter(c, cx, gy, wins) {
        var bH=H*0.37;

        c.fillStyle='#1a1a26'; c.strokeStyle='#27273a'; c.lineWidth=1;
        /* setback tiers */
        var tiers=[
            {dx:70,frac:0.22},{dx:52,frac:0.46},{dx:36,frac:0.66},
            {dx:22,frac:0.82},{dx:12,frac:1.00}
        ];
        for(var t=0;t<tiers.length;t++) {
            var prev=t>0?tiers[t-1].frac:0;
            var ti=tiers[t];
            c.fillRect(cx-ti.dx, gy-bH*ti.frac, ti.dx*2, bH*(ti.frac-prev));
            c.strokeRect(cx-ti.dx+0.5, gy-bH*ti.frac+0.5, ti.dx*2-1, bH*(ti.frac-prev)-1);
        }

        /* Art Deco vertical ribs */
        c.strokeStyle='rgba(255,255,255,0.06)'; c.lineWidth=1;
        for(var rib=-3;rib<=3;rib++) {
            c.beginPath();
            c.moveTo(cx+rib*16, gy);
            c.lineTo(cx+rib*14, gy-bH*0.46);
            c.stroke();
        }

        /* Atlas statue silhouette at base center */
        c.fillStyle='rgba(255,255,255,0.10)';
        c.beginPath(); c.arc(cx, gy-bH*0.23-8, 4, Math.PI,0); c.closePath(); c.fill();
        c.fillRect(cx-2, gy-bH*0.23-8, 4, 8);
        /* globe arcs */
        c.strokeStyle='rgba(255,255,255,0.14)'; c.lineWidth=0.8;
        c.beginPath(); c.arc(cx, gy-bH*0.23-16, 6, 0, Math.PI*2); c.stroke();

        /* windows — clipped to setback tiers */
        if(wins) {
            var wi=0;
            c.save();
            c.beginPath();
            /* trace tier rects as clip (bottom-up) */
            c.rect(cx-70, gy-bH*0.22, 140, bH*0.22);
            c.rect(cx-52, gy-bH*0.46, 104, bH*0.24);
            c.rect(cx-36, gy-bH*0.66, 72,  bH*0.20);
            c.rect(cx-22, gy-bH*0.82, 44,  bH*0.16);
            c.rect(cx-12, gy-bH,      24,  bH*0.18);
            c.clip();
            for(var r=0;r<6;r++) {
                for(var co=-4;co<=4;co++,wi++) {
                    var wy=gy-bH*(0.10+r*0.10);
                    var wx=cx+co*14-4;
                    drawWin(c, wx,wy, 7,9, wins[wi%wins.length]);
                }
            }
            c.restore();
        }
    }

    function drawEmpireState(c, cx, gy, wins) {
        var bH=H*0.55;

        c.fillStyle='#181820'; c.strokeStyle='#252535'; c.lineWidth=1;
        /* base block */
        c.fillRect(cx-92,gy-bH*0.14,184,bH*0.14); c.strokeRect(cx-92,gy-bH*0.14,184,bH*0.14);

        /* setback tiers */
        var eTiers=[
            {dx:70,top:0.34},{dx:50,top:0.54},{dx:32,top:0.68},
            {dx:16,top:0.80},{dx:8, top:0.88}
        ];
        for(var t=0;t<eTiers.length;t++) {
            var prev=t>0?eTiers[t-1].top:0.14;
            var et=eTiers[t];
            c.fillStyle='#181820';
            c.fillRect(cx-et.dx, gy-bH*et.top, et.dx*2, bH*(et.top-prev));
            c.strokeRect(cx-et.dx+0.5, gy-bH*et.top+0.5, et.dx*2-1, bH*(et.top-prev)-1);
        }

        /* observatory deck rim */
        c.fillStyle='rgba(255,255,255,0.10)';
        c.fillRect(cx-18, gy-bH*0.70-3, 36, 3);
        c.fillRect(cx-22, gy-bH*0.68,   44, 5);

        /* mooring mast cylinder */
        c.fillStyle='#1c1c28';
        c.fillRect(cx-5, gy-bH*0.88, 10, bH*0.18);

        /* broadcast antenna */
        c.strokeStyle='#30304a'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,gy-bH*0.88); c.lineTo(cx,gy-bH); c.stroke();
        c.strokeStyle='#50506a'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx,gy-bH*0.88); c.lineTo(cx,gy-bH); c.stroke();
        /* antenna cross-pieces */
        for(var ap=0;ap<3;ap++) {
            var ay=gy-bH*(0.90+ap*0.03);
            c.beginPath(); c.moveTo(cx-6+ap*2,ay); c.lineTo(cx+6-ap*2,ay); c.stroke();
        }

        /* ESB beacon glow — drawn here as static base; rotating done in dynLayer */
        radialGlow(c, cx,gy-bH*0.88, 28, 255,80,0, 0.15);

        /* windows grid — clipped to ESB setback tiers */
        if(wins) {
            var wi=0;
            c.save();
            c.beginPath();
            c.rect(cx-92, gy-bH*0.14, 184, bH*0.14);
            c.rect(cx-70, gy-bH*0.34, 140, bH*0.20);
            c.rect(cx-50, gy-bH*0.54, 100, bH*0.20);
            c.rect(cx-32, gy-bH*0.68, 64,  bH*0.14);
            c.rect(cx-16, gy-bH*0.80, 32,  bH*0.12);
            c.rect(cx-8,  gy-bH*0.88, 16,  bH*0.08);
            c.clip();
            for(var r=0;r<8;r++) {
                for(var co=-5;co<=5;co++,wi++) {
                    var wy=gy-bH*(0.08+r*0.07);
                    var wx=cx+co*16-4;
                    drawWin(c, wx,wy, 7,10, wins[wi%wins.length]);
                }
            }
            c.restore();
        }
    }

    function drawChrysler(c, cx, gy, wins) {
        var bH=H*0.51;

        /* base blocks */
        c.fillStyle='#161620'; c.strokeStyle='#222230'; c.lineWidth=1;
        c.fillRect(cx-76,gy-bH*0.16,152,bH*0.16); c.strokeRect(cx-76,gy-bH*0.16,152,bH*0.16);
        c.fillRect(cx-56,gy-bH*0.34,112,bH*0.18); c.strokeRect(cx-56,gy-bH*0.34,112,bH*0.18);
        c.fillRect(cx-40,gy-bH*0.50,80, bH*0.16); c.strokeRect(cx-40,gy-bH*0.50,80, bH*0.16);
        c.fillRect(cx-26,gy-bH*0.62,52, bH*0.12); c.strokeRect(cx-26,gy-bH*0.62,52, bH*0.12);

        /* eagle gargoyle silhouettes at corners */
        c.fillStyle='rgba(255,255,255,0.08)';
        var gargY=gy-bH*0.34;
        /* left gargoyle — simple triangle beak + round body */
        c.beginPath(); c.arc(cx-56-5,gargY,4,0,Math.PI*2); c.fill();
        c.beginPath(); c.moveTo(cx-56-8,gargY-2); c.lineTo(cx-56-14,gargY-5); c.lineTo(cx-56-8,gargY+2); c.closePath(); c.fill();
        /* right gargoyle */
        c.beginPath(); c.arc(cx+56+5,gargY,4,0,Math.PI*2); c.fill();
        c.beginPath(); c.moveTo(cx+56+8,gargY-2); c.lineTo(cx+56+14,gargY-5); c.lineTo(cx+56+8,gargY+2); c.closePath(); c.fill();

        /* Art Deco sunburst crown — 7 scallop tiers */
        var crownBase=gy-bH*0.62;
        var crownCols=['#1c1c2c','#201e30','#24223a','#282640','#2c2a44','#30284a','#34305c'];
        for(var tier=0;tier<7;tier++) {
            var tw=46-tier*5.5;
            var ty2=crownBase-tier*(bH*0.038);
            c.fillStyle=crownCols[tier];
            c.fillRect(cx-tw/2,ty2-bH*0.025,tw,bH*0.025);
            /* scallop arc */
            c.strokeStyle='rgba(180,180,220,0.18)'; c.lineWidth=0.9;
            c.beginPath(); c.arc(cx,ty2-bH*0.025,tw/2,Math.PI,0); c.stroke();
            /* side triangular fins */
            c.fillStyle='rgba(255,255,255,0.05)';
            c.beginPath(); c.moveTo(cx-tw/2,ty2); c.lineTo(cx-tw/2-5,ty2+bH*0.02); c.lineTo(cx-tw/2,ty2+bH*0.02); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(cx+tw/2,ty2); c.lineTo(cx+tw/2+5,ty2+bH*0.02); c.lineTo(cx+tw/2,ty2+bH*0.02); c.closePath(); c.fill();
        }

        /* crown glow — silver-blue */
        radialGlow(c, cx,crownBase-7*bH*0.038, 38, 160,180,255, 0.22);

        /* needle */
        var needleTop=crownBase-7*bH*0.038-bH*0.025;
        c.strokeStyle='#3c3c58'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,needleTop); c.lineTo(cx,gy-bH); c.stroke();
        c.strokeStyle='#8888b0'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx,needleTop); c.lineTo(cx,gy-bH); c.stroke();

        /* windows — clipped to Chrysler setback blocks */
        if(wins) {
            var wi=0;
            c.save();
            c.beginPath();
            c.rect(cx-76, gy-bH*0.16, 152, bH*0.16);
            c.rect(cx-56, gy-bH*0.34, 112, bH*0.18);
            c.rect(cx-40, gy-bH*0.50, 80,  bH*0.16);
            c.rect(cx-26, gy-bH*0.62, 52,  bH*0.12);
            c.clip();
            for(var r=0;r<7;r++) {
                for(var co=-4;co<=4;co++,wi++) {
                    var wy2=gy-bH*(0.10+r*0.07);
                    var wx2=cx+co*16-4;
                    drawWin(c, wx2,wy2, 7,10, wins[wi%wins.length]);
                }
            }
            c.restore();
        }
    }

    function drawOneWTC(c, cx, gy, wins) {
        var bH=H*0.63;

        /* podium */
        c.fillStyle='#121218'; c.strokeStyle='#1c1c28'; c.lineWidth=1;
        c.fillRect(cx-58,gy-bH*0.08,116,bH*0.08); c.strokeRect(cx-58,gy-bH*0.08,116,bH*0.08);

        /* octagonal tapered tower body */
        c.beginPath();
        c.moveTo(cx-52, gy-bH*0.08);
        c.lineTo(cx+52, gy-bH*0.08);
        c.lineTo(cx+50, gy-bH*0.15);
        c.lineTo(cx+22, gy-bH*0.86);
        c.lineTo(cx+10, gy-bH*0.90);
        c.lineTo(cx-10, gy-bH*0.90);
        c.lineTo(cx-22, gy-bH*0.86);
        c.lineTo(cx-50, gy-bH*0.15);
        c.closePath(); c.fill(); c.stroke();

        /* glass curtain wall reflection lines */
        c.strokeStyle='rgba(50,70,120,0.20)'; c.lineWidth=0.8;
        for(var gl=1;gl<7;gl++) {
            var gfrac=gl/7;
            var topX=cx-22+44*gfrac, botX=cx-52+104*gfrac;
            c.beginPath(); c.moveTo(botX,gy-bH*0.08); c.lineTo(topX,gy-bH*0.86); c.stroke();
        }
        /* horizontal glass bands */
        c.strokeStyle='rgba(40,60,100,0.15)'; c.lineWidth=0.6;
        for(var gb=1;gb<12;gb++) {
            var gfrac2=gb/12;
            var interp=gfrac2;
            var wl=cx-(52-(52-22)*interp);
            var wr=cx+(52-(52-22)*interp);
            var gby=gy-bH*(0.08+0.78*gfrac2);
            c.beginPath(); c.moveTo(wl,gby); c.lineTo(wr,gby); c.stroke();
        }

        /* observation deck detail */
        c.fillStyle='rgba(255,255,255,0.10)';
        c.fillRect(cx-13,gy-bH*0.90-4,26,4);

        /* spire */
        c.strokeStyle='#252535'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,gy-bH*0.90); c.lineTo(cx,gy-bH); c.stroke();
        c.strokeStyle='#6060a0'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx,gy-bH*0.90); c.lineTo(cx,gy-bH); c.stroke();

        /* windows — tapered grid, clipped to tower silhouette */
        if(wins) {
            var wi=0;
            c.save();
            c.beginPath();
            c.moveTo(cx-52, gy-bH*0.08);
            c.lineTo(cx+52, gy-bH*0.08);
            c.lineTo(cx+50, gy-bH*0.15);
            c.lineTo(cx+22, gy-bH*0.86);
            c.lineTo(cx+10, gy-bH*0.90);
            c.lineTo(cx-10, gy-bH*0.90);
            c.lineTo(cx-22, gy-bH*0.86);
            c.lineTo(cx-50, gy-bH*0.15);
            c.closePath(); c.clip();
            for(var r=0;r<10;r++) {
                var interp2=r/10;
                var rowW=cx-(50-(50-20)*interp2);
                var cols2=Math.max(2,5-Math.floor(r/3));
                for(var co=0;co<cols2;co++,wi++) {
                    var wx3=rowW + co*(Math.abs(rowW-cx)*2+4)/cols2;
                    var wy3=gy-bH*(0.12+r*0.075);
                    drawWin(c, wx3,wy3, 6,9, wins[wi%wins.length]);
                }
            }
            c.restore();
        }
    }

    /* palm tree helper — Dubai / tropical */
    function drawPalmTree(c, cx, gy) {
        var h=H*0.12;
        /* trunk */
        c.strokeStyle='#8a6a30'; c.lineWidth=4;
        c.beginPath(); c.moveTo(cx,gy); c.quadraticCurveTo(cx+8,gy-h*0.5,cx+4,gy-h); c.stroke();
        c.strokeStyle='#a07840'; c.lineWidth=2;
        c.beginPath(); c.moveTo(cx,gy); c.quadraticCurveTo(cx+8,gy-h*0.5,cx+4,gy-h); c.stroke();
        /* trunk segments */
        c.strokeStyle='rgba(100,70,30,0.40)'; c.lineWidth=0.7;
        for(var seg=1;seg<7;seg++){var sy=gy-h*seg/7;c.beginPath();c.moveTo(cx+seg*0.5-2,sy);c.lineTo(cx+seg*0.5+4,sy);c.stroke();}
        /* fronds */
        var tipX=cx+4, tipY=gy-h;
        var fronds=[[-50,-20],[-40,-32],[-24,-38],[-8,-36],[8,-30],[22,-20],[34,-10],[38,2],[28,12]];
        for(var f=0;f<fronds.length;f++){
            var fx=tipX+fronds[f][0], fy=tipY+fronds[f][1];
            c.strokeStyle='#2a6020'; c.lineWidth=1.8;
            c.beginPath(); c.moveTo(tipX,tipY); c.quadraticCurveTo((tipX+fx)/2,tipY-8,fx,fy); c.stroke();
            c.strokeStyle='#3a8030'; c.lineWidth=0.8;
            c.beginPath(); c.moveTo(tipX,tipY); c.quadraticCurveTo((tipX+fx)/2,tipY-8,fx,fy); c.stroke();
        }
    }

    /* cherry blossom tree helper — Tokyo */
    function drawBlossom(c, cx, gy) {
        var h=H*0.10;
        c.strokeStyle='#5a3820'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,gy); c.lineTo(cx,gy-h*0.55); c.stroke();
        c.strokeStyle='#7a5030'; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(cx,gy-h*0.35); c.quadraticCurveTo(cx-22,gy-h*0.55,cx-28,gy-h*0.40); c.stroke();
        c.beginPath(); c.moveTo(cx,gy-h*0.45); c.quadraticCurveTo(cx+20,gy-h*0.60,cx+26,gy-h*0.48); c.stroke();
        /* blossom clouds */
        var clouds=[{x:0,y:h,r:22},{x:-20,y:h*0.75,r:16},{x:22,y:h*0.78,r:18},{x:-10,y:h*0.55,r:14},{x:12,y:h*0.52,r:12}];
        for(var cl=0;cl<clouds.length;cl++){
            radialGlow(c,cx+clouds[cl].x,gy-clouds[cl].y,clouds[cl].r,255,160,180,0.22);
            c.fillStyle='rgba(255,180,200,0.55)';
            c.beginPath(); c.arc(cx+clouds[cl].x,gy-clouds[cl].y,clouds[cl].r*0.65,0,Math.PI*2); c.fill();
        }
    }

    /* lantern helper — Beijing */
    function drawLantern(c, cx, cy, r, rr, gg, bb) {
        c.fillStyle='rgba('+rr+','+gg+','+bb+',0.90)';
        c.beginPath(); c.ellipse(cx,cy,r,r*1.4,0,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(255,200,60,0.60)'; c.lineWidth=0.7;
        for(var ls=-1;ls<=1;ls++){c.beginPath();c.moveTo(cx+ls*r*0.4,cy-r*1.4);c.lineTo(cx+ls*r*0.4,cy+r*1.4);c.stroke();}
        c.fillStyle='rgba(255,220,80,0.70)'; c.beginPath(); c.arc(cx,cy,r*0.35,0,Math.PI*2); c.fill();
        radialGlow(c,cx,cy,r*3.5,rr,gg,bb,0.20);
        /* tassel */
        c.strokeStyle='rgba(255,200,60,0.55)'; c.lineWidth=0.8;
        c.beginPath(); c.moveTo(cx,cy+r*1.4); c.lineTo(cx,cy+r*2.5); c.stroke();
    }

    /* ══════════════════════════════════════════════
       CHICAGO LANDMARKS  (steel blue / silver / lake-blue palette)
    ══════════════════════════════════════════════ */
    function drawWillisTower(c, cx, gy, wins) {
        var bH=H*0.62;
        /* 9 bundled tubes — 3×3 grid, each tube visible */
        var tubeW=16;
        var grid=[
            {gx:-1,gy2:-1,h:1.00},{gx:0,gy2:-1,h:1.00},{gx:1,gy2:-1,h:0.50},
            {gx:-1,gy2:0, h:0.85},{gx:0,gy2:0, h:0.85},{gx:1,gy2:0, h:0.50},
            {gx:-1,gy2:1, h:0.68},{gx:0,gy2:1, h:0.68},{gx:1,gy2:1, h:0.50}
        ];
        for(var t=0;t<grid.length;t++) {
            var tb=grid[t], tx=cx+tb.gx*tubeW, ty=gy-bH*tb.h;
            c.fillStyle='#16202e'; c.strokeStyle='#2a3a52'; c.lineWidth=0.8;
            c.fillRect(tx-tubeW/2,ty,tubeW,bH*tb.h);
            c.strokeRect(tx-tubeW/2,ty,tubeW,bH*tb.h);
        }
        /* aluminum curtain wall ribs */
        c.strokeStyle='rgba(100,140,200,0.18)'; c.lineWidth=0.7;
        for(var rib=-5;rib<=5;rib++) { c.beginPath(); c.moveTo(cx+rib*8,gy); c.lineTo(cx+rib*7,gy-bH); c.stroke(); }
        /* horizontal spandrels */
        c.strokeStyle='rgba(60,90,140,0.15)'; c.lineWidth=0.6;
        for(var sp2=1;sp2<12;sp2++) { c.beginPath(); c.moveTo(cx-42,gy-bH*sp2/12); c.lineTo(cx+42,gy-bH*sp2/12); c.stroke(); }
        /* skydeck level */
        c.fillStyle='#1e2e46'; c.fillRect(cx-28,gy-bH*0.69,56,6); c.strokeRect(cx-28,gy-bH*0.69,56,6);
        c.strokeStyle='rgba(140,200,255,0.30)'; c.lineWidth=0.8;
        c.beginPath(); c.moveTo(cx-28,gy-bH*0.69-1); c.lineTo(cx+28,gy-bH*0.69-1); c.stroke();
        /* twin antennae */
        c.strokeStyle='#283858'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(cx-9,gy-bH); c.lineTo(cx-9,gy-bH*1.16); c.stroke();
        c.beginPath(); c.moveTo(cx+9,gy-bH); c.lineTo(cx+9,gy-bH*1.12); c.stroke();
        c.strokeStyle='#7090c0'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx-9,gy-bH); c.lineTo(cx-9,gy-bH*1.16); c.stroke();
        c.beginPath(); c.moveTo(cx+9,gy-bH); c.lineTo(cx+9,gy-bH*1.12); c.stroke();
        radialGlow(c,cx-9,gy-bH*1.16,10,255,60,60,0.55);
        radialGlow(c,cx+9,gy-bH*1.12,10,255,60,60,0.55);
        radialGlow(c,cx,gy-bH,25,120,180,255,0.18);
        if(wins) {
            var wi=0; c.save(); c.beginPath();
            c.rect(cx-42,gy-bH,84,bH*0.50);
            c.rect(cx-28,gy-bH*0.50,56,bH*0.15);
            c.rect(cx-28,gy-bH*0.65,56,bH*0.15); c.clip();
            for(var r=0;r<11;r++) for(var co=-4;co<=4;co++,wi++) {
                drawWin(c,cx+co*9-3,gy-bH*(0.07+r*0.086),6,9,wins[wi%wins.length]);
            }
            c.restore();
        }
    }
    function drawHancockCenter(c, cx, gy, wins) {
        var bH=H*0.54;
        c.fillStyle='#0e1620'; c.strokeStyle='#182030'; c.lineWidth=1;
        c.beginPath();
        c.moveTo(cx-44,gy); c.lineTo(cx+44,gy);
        c.lineTo(cx+20,gy-bH); c.lineTo(cx-20,gy-bH);
        c.closePath(); c.fill(); c.stroke();
        /* dark glass curtain wall with blue tint */
        c.strokeStyle='rgba(40,80,140,0.18)'; c.lineWidth=0.8;
        for(var hb=1;hb<10;hb++) { var hf=hb/10; var hw=44-(44-20)*hf; c.beginPath(); c.moveTo(cx-hw,gy-bH*hf); c.lineTo(cx+hw,gy-bH*hf); c.stroke(); }
        /* iconic X-braces — white/silver steel */
        c.strokeStyle='rgba(180,210,255,0.55)'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(cx-44,gy); c.lineTo(cx+20,gy-bH*0.55); c.stroke();
        c.beginPath(); c.moveTo(cx+44,gy); c.lineTo(cx-20,gy-bH*0.55); c.stroke();
        c.beginPath(); c.moveTo(cx-44,gy); c.lineTo(cx+20,gy-bH); c.stroke();
        c.beginPath(); c.moveTo(cx+44,gy); c.lineTo(cx-20,gy-bH); c.stroke();
        c.beginPath(); c.moveTo(cx-20,gy-bH*0.55); c.lineTo(cx+20,gy-bH); c.stroke();
        c.beginPath(); c.moveTo(cx+20,gy-bH*0.55); c.lineTo(cx-20,gy-bH); c.stroke();
        /* observation deck ledge */
        c.fillStyle='#1a2838'; c.fillRect(cx-22,gy-bH*0.93,44,5);
        /* twin antennae with red aircraft lights */
        c.strokeStyle='#202840'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(cx-10,gy-bH); c.lineTo(cx-10,gy-bH*1.12); c.stroke();
        c.beginPath(); c.moveTo(cx+10,gy-bH); c.lineTo(cx+10,gy-bH*1.09); c.stroke();
        radialGlow(c,cx-10,gy-bH*1.12,8,255,40,40,0.60);
        radialGlow(c,cx+10,gy-bH*1.09,8,255,40,40,0.60);
        if(wins) {
            var wi2=0; c.save(); c.beginPath();
            c.moveTo(cx-44,gy); c.lineTo(cx+44,gy); c.lineTo(cx+20,gy-bH); c.lineTo(cx-20,gy-bH); c.closePath(); c.clip();
            for(var r2=0;r2<10;r2++) for(var co2=-4;co2<=4;co2++,wi2++) {
                var frac=r2/10; var hw2=44-(44-20)*frac;
                var wx=cx+co2*(hw2*2/9)-3; var wy=gy-bH*(0.07+r2*0.086);
                drawWin(c,wx,wy,6,9,wins[wi2%wins.length]);
            }
            c.restore();
        }
    }
    function drawNavyPierFerris(c, cx, gy) {
        var r=H*0.15, cy2=gy-r-H*0.04;
        /* outer rim */
        c.strokeStyle='#2a3448'; c.lineWidth=3;
        c.beginPath(); c.arc(cx,cy2,r,0,Math.PI*2); c.stroke();
        c.strokeStyle='rgba(140,180,255,0.30)'; c.lineWidth=1;
        c.beginPath(); c.arc(cx,cy2,r,0,Math.PI*2); c.stroke();
        /* inner hub ring */
        c.strokeStyle='#2a3448'; c.lineWidth=2;
        c.beginPath(); c.arc(cx,cy2,r*0.12,0,Math.PI*2); c.stroke();
        radialGlow(c,cx,cy2,r*0.20,180,220,255,0.35);
        /* spokes — alternating steel cables */
        for(var sp=0;sp<16;sp++) {
            var ang=sp*Math.PI/8;
            c.strokeStyle=sp%2===0?'#2a3448':'rgba(100,140,200,0.25)'; c.lineWidth=sp%2===0?1.2:0.7;
            c.beginPath(); c.moveTo(cx,cy2); c.lineTo(cx+Math.cos(ang)*r,cy2+Math.sin(ang)*r); c.stroke();
        }
        /* gondolas with colored lights */
        var gondolaColors=['#e84040','#40c0ff','#40e060','#ffc040','#e040e0','#40e0e0','#ff8040','#c040ff'];
        for(var gd=0;gd<16;gd++) {
            var ga=gd*Math.PI/8;
            var gpx=cx+Math.cos(ga)*r, gpy=cy2+Math.sin(ga)*r;
            var gc=gondolaColors[gd%gondolaColors.length];
            c.fillStyle=gc; c.fillRect(gpx-5,gpy-6,10,8);
            c.strokeStyle='rgba(255,255,255,0.40)'; c.lineWidth=0.5; c.strokeRect(gpx-5,gpy-6,10,8);
            radialGlow(c,gpx,gpy,14,parseInt(gc.slice(1,3),16),parseInt(gc.slice(3,5),16),parseInt(gc.slice(5,7),16),0.22);
        }
        /* support legs */
        c.strokeStyle='#1e2838'; c.lineWidth=4;
        c.beginPath(); c.moveTo(cx-8,cy2+r); c.lineTo(cx-10,gy); c.stroke();
        c.beginPath(); c.moveTo(cx+8,cy2+r); c.lineTo(cx+10,gy); c.stroke();
        c.strokeStyle='#2a3a50'; c.lineWidth=2;
        c.beginPath(); c.moveTo(cx-8,cy2+r); c.lineTo(cx-10,gy); c.stroke();
        c.beginPath(); c.moveTo(cx+8,cy2+r); c.lineTo(cx+10,gy); c.stroke();
    }
    function drawChicagoWaterTower(c, cx, gy) {
        var bH=H*0.20;
        /* limestone base — warm cream/stone */
        c.fillStyle='#d8d0b0'; c.strokeStyle='#b8a888'; c.lineWidth=1.2;
        c.fillRect(cx-16,gy,32,12);
        c.fillRect(cx-14,gy-bH*0.60,28,bH*0.60); c.strokeRect(cx-14,gy-bH*0.60,28,bH*0.60);
        /* Gothic buttress details */
        c.strokeStyle='rgba(140,120,80,0.35)'; c.lineWidth=0.7;
        for(var sc=1;sc<5;sc++) { c.beginPath(); c.moveTo(cx-14,gy-bH*0.60*sc/5); c.lineTo(cx+14,gy-bH*0.60*sc/5); c.stroke(); }
        /* corner pilasters */
        c.fillStyle='#c8c0a0'; c.fillRect(cx-16,gy-bH*0.60,4,bH*0.60); c.fillRect(cx+12,gy-bH*0.60,4,bH*0.60);
        /* battlements */
        c.fillStyle='#d8d0b0';
        for(var mb=-2;mb<=2;mb++) { c.fillRect(cx+mb*6-2,gy-bH*0.60-10,5,9); }
        c.fillRect(cx-16,gy-bH*0.62,32,4);
        /* octagonal upper section */
        c.fillRect(cx-10,gy-bH*0.80,20,bH*0.20); c.strokeRect(cx-10,gy-bH*0.80,20,bH*0.20);
        /* battlements top */
        for(var mb2=-1;mb2<=1;mb2++) { c.fillRect(cx+mb2*7-2,gy-bH*0.80-8,4,7); }
        /* conical spire */
        c.beginPath(); c.moveTo(cx-8,gy-bH*0.80); c.lineTo(cx,gy-bH); c.lineTo(cx+8,gy-bH*0.80); c.closePath(); c.fill(); c.stroke();
        /* arched window */
        c.strokeStyle='#8a7850'; c.lineWidth=0.8;
        c.beginPath(); c.arc(cx,gy-bH*0.34,5,Math.PI,0,false); c.stroke();
        c.beginPath(); c.moveTo(cx-5,gy-bH*0.34); c.lineTo(cx-5,gy-bH*0.20); c.stroke();
        c.beginPath(); c.moveTo(cx+5,gy-bH*0.34); c.lineTo(cx+5,gy-bH*0.20); c.stroke();
        radialGlow(c,cx,gy-bH*0.34,12,255,220,140,0.15);
    }

    /* ══════════════════════════════════════════════
       TOKYO LANDMARKS  (indigo/neon/orange palette)
    ══════════════════════════════════════════════ */
    function drawTokyoSkytree(c, cx, gy) {
        var bH=H*0.84;
        var baseW=52;
        /* lattice tripod legs — three triangular columns */
        for(var leg=-1;leg<=1;leg++) {
            var lx=cx+leg*baseW*0.38;
            c.strokeStyle='#1e3060'; c.lineWidth=3;
            c.beginPath(); c.moveTo(lx,gy); c.lineTo(cx,gy-bH*0.40); c.stroke();
            c.strokeStyle='rgba(60,120,220,0.40)'; c.lineWidth=1;
            c.beginPath(); c.moveTo(lx,gy); c.lineTo(cx,gy-bH*0.40); c.stroke();
        }
        /* main shaft above merge point */
        c.strokeStyle='#1e3060'; c.lineWidth=5;
        c.beginPath(); c.moveTo(cx,gy-bH*0.40); c.lineTo(cx,gy-bH*0.75); c.stroke();
        c.strokeStyle='rgba(80,140,255,0.35)'; c.lineWidth=2;
        c.beginPath(); c.moveTo(cx,gy-bH*0.40); c.lineTo(cx,gy-bH*0.75); c.stroke();
        /* cross bracing along legs */
        for(var seg=0;seg<6;seg++) {
            var f0=seg/6*0.40, f1=(seg+1)/6*0.40;
            var w0=baseW*(1-f0/0.40*0.85), w1=baseW*(1-f1/0.40*0.85);
            c.strokeStyle='rgba(40,80,180,0.28)'; c.lineWidth=0.8;
            c.beginPath(); c.moveTo(cx-w0*0.60,gy-bH*f0); c.lineTo(cx+w1*0.60,gy-bH*f1); c.stroke();
            c.beginPath(); c.moveTo(cx+w0*0.60,gy-bH*f0); c.lineTo(cx-w1*0.60,gy-bH*f1); c.stroke();
        }
        /* lower observation deck — Tembo Deck 350m */
        c.fillStyle='#182040'; c.strokeStyle='#304880'; c.lineWidth=1;
        c.fillRect(cx-22,gy-bH*0.42,44,14); c.strokeRect(cx-22,gy-bH*0.42,44,14);
        radialGlow(c,cx,gy-bH*0.42,38,80,140,255,0.22);
        c.strokeStyle='rgba(100,160,255,0.35)'; c.lineWidth=0.8;
        for(var wr=0;wr<6;wr++) { c.beginPath(); c.moveTo(cx-22+wr*8,gy-bH*0.42); c.lineTo(cx-22+wr*8,gy-bH*0.42+14); c.stroke(); }
        /* upper observation deck — Tembo Galleria 450m */
        c.fillStyle='#182040'; c.strokeStyle='#304880'; c.lineWidth=1;
        c.fillRect(cx-16,gy-bH*0.60,32,10); c.strokeRect(cx-16,gy-bH*0.60,32,10);
        radialGlow(c,cx,gy-bH*0.60,24,100,180,255,0.18);
        /* broadcasting cylinder 450m–634m */
        c.strokeStyle='#1e3060'; c.lineWidth=4;
        c.beginPath(); c.moveTo(cx,gy-bH*0.75); c.lineTo(cx,gy-bH*0.90); c.stroke();
        /* antenna */
        c.strokeStyle='#304878'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(cx,gy-bH*0.90); c.lineTo(cx,gy-bH); c.stroke();
        c.strokeStyle='rgba(140,200,255,0.55)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx,gy-bH*0.90); c.lineTo(cx,gy-bH); c.stroke();
        /* neon blue tip beacon */
        radialGlow(c,cx,gy-bH,22,80,160,255,0.50);
        c.fillStyle='#60c0ff'; c.beginPath(); c.arc(cx,gy-bH,4,0,Math.PI*2); c.fill();
    }
    function drawTokyoTower(c, cx, gy) {
        var bH=H*0.56;
        /* proper red-white-orange Tokyo Tower palette */
        var sections=[
            {y0:0,y1:0.18,col:'#e83010',sw:36},
            {y0:0.18,y1:0.36,col:'#f5f0e8',sw:28},
            {y0:0.36,y1:0.56,col:'#e83010',sw:20},
            {y0:0.56,y1:0.72,col:'#f5f0e8',sw:12},
            {y0:0.72,y1:1.00,col:'#e83010',sw:5}
        ];
        for(var sec=0;sec<sections.length;sec++) {
            var s=sections[sec];
            c.strokeStyle=s.col; c.lineWidth=Math.max(1,s.sw*0.055);
            c.beginPath(); c.moveTo(cx-s.sw,gy-bH*s.y0); c.lineTo(cx-s.sw*(1-(s.y1-s.y0)/(1-s.y0)*0.9),gy-bH*s.y1); c.stroke();
            c.beginPath(); c.moveTo(cx+s.sw,gy-bH*s.y0); c.lineTo(cx+s.sw*(1-(s.y1-s.y0)/(1-s.y0)*0.9),gy-bH*s.y1); c.stroke();
        }
        /* cross-bracing every section */
        for(var tb2=0;tb2<8;tb2++) {
            var tf=tb2/8; var tf2=(tb2+1)/8; var tw2=36*(1-tf*0.88); var tw3=36*(1-tf2*0.88);
            c.strokeStyle=tb2%2===0?'rgba(232,48,16,0.40)':'rgba(240,240,232,0.35)'; c.lineWidth=0.8;
            c.beginPath(); c.moveTo(cx-tw2,gy-bH*tf); c.lineTo(cx+tw3,gy-bH*tf2); c.stroke();
            c.beginPath(); c.moveTo(cx+tw2,gy-bH*tf); c.lineTo(cx-tw3,gy-bH*tf2); c.stroke();
        }
        /* observation decks */
        c.fillStyle='#181820'; c.strokeStyle='#282828'; c.lineWidth=1;
        c.fillRect(cx-18,gy-bH*0.37,36,9); c.strokeRect(cx-18,gy-bH*0.37,36,9);
        c.fillRect(cx-10,gy-bH*0.67,20,7); c.strokeRect(cx-10,gy-bH*0.67,20,7);
        /* tip beacon */
        radialGlow(c,cx,gy-bH,20,255,100,30,0.40);
        c.fillStyle='#ffaa40'; c.beginPath(); c.arc(cx,gy-bH,4,0,Math.PI*2); c.fill();
    }
    function drawPagoda(c, cx, gy) {
        var bH=H*0.32;
        /* traditional stone/wood base */
        c.fillStyle='#2a1810'; c.strokeStyle='#5a3020'; c.lineWidth=1;
        c.fillRect(cx-20,gy-bH*0.14,40,bH*0.14); c.strokeRect(cx-20,gy-bH*0.14,40,bH*0.14);
        /* 5 tiers with proper curved eaves and red detailing */
        var tiers5=[{w:32,y:0.20},{w:26,y:0.38},{w:20,y:0.56},{w:14,y:0.72},{w:8,y:0.86}];
        for(var ti=0;ti<tiers5.length;ti++) {
            var tr=tiers5[ti], tw3=tr.w;
            var ty3=gy-bH*tr.y;
            /* tile roof — dark grey-green */
            c.fillStyle='#1e2818'; c.strokeStyle='#2e3828'; c.lineWidth=1;
            c.beginPath();
            c.moveTo(cx-tw3-8,ty3); c.lineTo(cx,ty3-bH*0.08); c.lineTo(cx+tw3+8,ty3);
            c.lineTo(cx+tw3,ty3+bH*0.06); c.lineTo(cx-tw3,ty3+bH*0.06); c.closePath(); c.fill(); c.stroke();
            /* red beam below eave */
            c.fillStyle='#8a1810'; c.fillRect(cx-tw3,ty3+bH*0.04,tw3*2,bH*0.05);
            /* floor body */
            c.fillStyle='#2a1810'; c.strokeStyle='#5a3020'; c.lineWidth=0.8;
            c.fillRect(cx-tw3+2,ty3+bH*0.06,tw3*2-4,bH*0.12); c.strokeRect(cx-tw3+2,ty3+bH*0.06,tw3*2-4,bH*0.12);
            /* upturned eave tips */
            c.strokeStyle='#5a3820'; c.lineWidth=1.5;
            c.beginPath(); c.moveTo(cx-tw3-8,ty3); c.quadraticCurveTo(cx-tw3-14,ty3+4,cx-tw3-18,ty3-4); c.stroke();
            c.beginPath(); c.moveTo(cx+tw3+8,ty3); c.quadraticCurveTo(cx+tw3+14,ty3+4,cx+tw3+18,ty3-4); c.stroke();
            /* small window */
            c.fillStyle='rgba(255,180,60,0.60)'; c.fillRect(cx-4,ty3+bH*0.07,8,bH*0.07);
            radialGlow(c,cx,ty3+bH*0.10,10,255,180,60,0.12);
        }
        /* finial spire */
        c.strokeStyle='#8a6030'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,gy-bH*0.86); c.lineTo(cx,gy-bH); c.stroke();
        /* 9 rings on spire */
        for(var rng=0;rng<5;rng++) {
            var ry=gy-bH*(0.88+rng*0.024);
            c.strokeStyle='#c08040'; c.lineWidth=2;
            c.beginPath(); c.arc(cx,ry,3-rng*0.4,0,Math.PI*2); c.stroke();
        }
        radialGlow(c,cx,gy-bH,12,255,200,80,0.25);
    }

    /* ══════════════════════════════════════════════
       BEIJING LANDMARKS  (imperial crimson / gold / cobalt / jade palette)
    ══════════════════════════════════════════════ */
    function drawTiananmen(c, cx, gy) {
        var bH = H * 0.30;
        var red = '#aa1414', redD = '#880e0e', redL = '#cc2020';
        var gold = '#e8b020', goldL = '#ffd040';
        var yellow = '#d49010';
        var blue = '#1c1880';

        radialGlow(c, cx, gy, 120, 255, 80, 20, 0.14);

        /* marble base balustrade */
        c.fillStyle = '#d8d0b8'; c.strokeStyle = '#b8a880'; c.lineWidth = 1;
        c.fillRect(cx - 76, gy - bH * 0.05, 152, bH * 0.05); c.strokeRect(cx - 76, gy - bH * 0.05, 152, bH * 0.05);

        /* MASSIVE RED GATE WALL */
        c.fillStyle = red; c.strokeStyle = redD; c.lineWidth = 1;
        c.fillRect(cx - 74, gy - bH * 0.46, 148, bH * 0.41); c.strokeRect(cx - 74, gy - bH * 0.46, 148, bH * 0.41);
        /* plinth darker red at base */
        c.fillStyle = redD; c.fillRect(cx - 74, gy - bH * 0.12, 148, bH * 0.07);

        /* 5 ARCHED TUNNEL GATES */
        c.fillStyle = '#060408';
        for (var ag = -2; ag <= 2; ag++) {
            var ax = cx + ag * 26;
            c.beginPath(); c.arc(ax, gy - bH * 0.19, 9, Math.PI, 0, false); c.fill();
            c.fillRect(ax - 9, gy - bH * 0.19, 18, bH * 0.19); c.fill();
            /* gold arch trim */
            c.strokeStyle = gold; c.lineWidth = 1;
            c.beginPath(); c.arc(ax, gy - bH * 0.19, 9, Math.PI, 0, false); c.stroke();
            c.strokeRect(ax - 9, gy - bH * 0.19, 18, bH * 0.19);
            /* gold studs on gate doors */
            c.fillStyle = goldL;
            for (var gsd = 0; gsd < 3; gsd++) {
                for (var gsrow = 0; gsrow < 4; gsrow++) {
                    c.beginPath(); c.arc(ax - 5 + gsd * 5, gy - bH * 0.12 + gsrow * bH * 0.032, 1, 0, Math.PI * 2); c.fill();
                }
            }
            c.fillStyle = '#060408';
        }

        /* MAO PORTRAIT — centered, framed in gold */
        c.fillStyle = '#181810'; c.fillRect(cx - 16, gy - bH * 0.43, 32, bH * 0.24);
        c.fillStyle = '#c8a878'; c.fillRect(cx - 13, gy - bH * 0.42, 26, bH * 0.21);
        c.strokeStyle = gold; c.lineWidth = 1.2; c.strokeRect(cx - 15, gy - bH * 0.44, 30, bH * 0.24);
        /* simplified face detail */
        c.fillStyle = '#b89060'; c.fillRect(cx - 8, gy - bH * 0.31, 16, bH * 0.06);
        c.fillStyle = '#0a0808';
        c.fillRect(cx - 7, gy - bH * 0.38, 5, 2);
        c.fillRect(cx + 2, gy - bH * 0.38, 5, 2);
        c.fillRect(cx - 4, gy - bH * 0.33, 8, 2);
        c.fillRect(cx - 13, gy - bH * 0.42, 26, bH * 0.06);

        /* 5-STAR CLUSTER */
        c.fillStyle = gold;
        c.beginPath(); c.arc(cx, gy - bH * 0.46, 5, 0, Math.PI * 2); c.fill();
        for (var star = 0; star < 4; star++) {
            var sa = star * Math.PI / 2 - Math.PI / 4;
            c.beginPath(); c.arc(cx + Math.cos(sa) * 14, gy - bH * 0.46 + Math.sin(sa) * 5, 2.5, 0, Math.PI * 2); c.fill();
        }
        radialGlow(c, cx, gy - bH * 0.46, 22, 255, 200, 60, 0.25);

        /* RED INSCRIPTION BANNERS flanking portrait */
        for (var bn = -1; bn <= 1; bn += 2) {
            var bnx = cx + bn * 50;
            c.fillStyle = red; c.strokeStyle = gold; c.lineWidth = 0.8;
            c.fillRect(bnx - 9, gy - bH * 0.44, 18, bH * 0.34); c.strokeRect(bnx - 9, gy - bH * 0.44, 18, bH * 0.34);
            c.strokeStyle = goldL; c.lineWidth = 0.6;
            for (var tl = 0; tl < 4; tl++) { c.beginPath(); c.moveTo(bnx - 6, gy - bH * 0.41 + tl * bH * 0.06); c.lineTo(bnx + 6, gy - bH * 0.41 + tl * bH * 0.06); c.stroke(); }
        }

        /* PAVILION BODY — deep imperial blue-purple walls */
        c.fillStyle = blue; c.strokeStyle = '#2a2480'; c.lineWidth = 1;
        c.fillRect(cx - 62, gy - bH * 0.80, 124, bH * 0.34); c.strokeRect(cx - 62, gy - bH * 0.80, 124, bH * 0.34);
        /* red columns */
        c.fillStyle = red;
        for (var col = -5; col <= 5; col++) { c.fillRect(cx + col * 11 - 3, gy - bH * 0.80, 6, bH * 0.34); }
        /* pavilion windows — lantern amber glow */
        c.fillStyle = 'rgba(255,170,40,0.55)';
        for (var pw2 = -4; pw2 <= 4; pw2 += 2) {
            c.fillRect(cx + pw2 * 11 - 3, gy - bH * 0.75, 6, 14);
            radialGlow(c, cx + pw2 * 11, gy - bH * 0.70, 10, 255, 150, 30, 0.22);
        }

        /* LOWER EAVE — widest imperial yellow */
        c.fillStyle = yellow; c.strokeStyle = '#a07008'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx - 78, gy - bH * 0.80); c.lineTo(cx, gy - bH * 0.97); c.lineTo(cx + 78, gy - bH * 0.80); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#e0a828';
        c.beginPath(); c.moveTo(cx - 70, gy - bH * 0.82); c.lineTo(cx, gy - bH * 0.97); c.lineTo(cx + 70, gy - bH * 0.82); c.closePath(); c.fill();

        /* UPPER EAVE — narrower */
        c.fillStyle = '#d49010'; c.strokeStyle = '#a07008'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(cx - 58, gy - bH * 0.86); c.lineTo(cx, gy - bH * 1.00); c.lineTo(cx + 58, gy - bH * 0.86); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#e8b030';
        c.beginPath(); c.moveTo(cx - 52, gy - bH * 0.88); c.lineTo(cx, gy - bH * 1.00); c.lineTo(cx + 52, gy - bH * 0.88); c.closePath(); c.fill();

        /* UPTURNED EAVE TIPS */
        c.strokeStyle = '#c07010'; c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(cx - 78, gy - bH * 0.80); c.quadraticCurveTo(cx - 90, gy - bH * 0.74, cx - 92, gy - bH * 0.62); c.stroke();
        c.beginPath(); c.moveTo(cx + 78, gy - bH * 0.80); c.quadraticCurveTo(cx + 90, gy - bH * 0.74, cx + 92, gy - bH * 0.62); c.stroke();
        c.lineWidth = 1.8;
        c.beginPath(); c.moveTo(cx - 58, gy - bH * 0.86); c.quadraticCurveTo(cx - 68, gy - bH * 0.81, cx - 70, gy - bH * 0.72); c.stroke();
        c.beginPath(); c.moveTo(cx + 58, gy - bH * 0.86); c.quadraticCurveTo(cx + 68, gy - bH * 0.81, cx + 70, gy - bH * 0.72); c.stroke();

        /* ridge beast sculptures */
        c.fillStyle = gold;
        for (var rb = -1; rb <= 1; rb += 2) {
            c.beginPath(); c.ellipse(cx + rb * 76, gy - bH * 0.80, 4, 3, rb > 0 ? 0.4 : -0.4, 0, Math.PI * 2); c.fill();
        }

        /* ROOF GLOW */
        radialGlow(c, cx, gy - bH * 0.97, 40, 255, 200, 80, 0.28);
        radialGlow(c, cx, gy - bH * 1.00, 24, 255, 220, 100, 0.32);

        /* RED LANTERNS at lower eave */
        for (var ln = -3; ln <= 3; ln++) { drawLantern(c, cx + ln * 22, gy - bH * 0.78, 5, 220, 30, 30); }
    }
    function drawTempleOfHeaven(c, cx, gy) {
        var bH = H * 0.44;
        var marble = '#e0d8c0', marbleD = '#c0b898';
        var cobalt = '#1428a8', cobaltL = '#2038d0', cobaltD = '#0c1878';
        var red2 = '#8a1010';
        var gold2 = '#d4a020', goldL2 = '#f0c030';

        radialGlow(c, cx, gy, 90, 200, 160, 80, 0.16);

        /* surrounding circular wall + moon gate */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 0.8;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.05, 78, 10, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillRect(cx - 78, gy - bH * 0.05, 156, bH * 0.05); c.strokeRect(cx - 78, gy - bH * 0.05, 156, bH * 0.05);
        c.fillStyle = '#080406';
        c.beginPath(); c.arc(cx, gy - bH * 0.05, 8, Math.PI, 0, false); c.fill();
        c.fillRect(cx - 8, gy - bH * 0.05, 16, bH * 0.05); c.fill();
        c.strokeStyle = gold2; c.lineWidth = 0.8;
        c.beginPath(); c.arc(cx, gy - bH * 0.05, 8, Math.PI, 0, false); c.stroke();

        /* THREE-TIER MARBLE CIRCULAR TERRACES — each tier sits on the one below, bottom tier on the surrounding wall */
        var tierW = [52, 38, 24];
        var tierY = [gy - bH * 0.18, gy - bH * 0.31, gy - bH * 0.44];
        for (var tier = 0; tier < 3; tier++) {
            var tr = tierW[tier], tBase = tierY[tier];
            c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
            c.beginPath(); c.ellipse(cx, tBase, tr, 8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillRect(cx - tr, tBase, tr * 2, bH * 0.13); c.strokeRect(cx - tr, tBase, tr * 2, bH * 0.13);
            /* highlight ledge */
            c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(cx - tr, tBase, tr * 2, 3);
            /* balustrade posts */
            c.strokeStyle = 'rgba(180,170,140,0.42)'; c.lineWidth = 0.7;
            var posts = Math.floor(tr / 7);
            for (var bl3 = -posts; bl3 <= posts; bl3++) { c.beginPath(); c.moveTo(cx + bl3 * 7, tBase); c.lineTo(cx + bl3 * 7, tBase + bH * 0.13); c.stroke(); }
            /* balusters top rail */
            c.strokeStyle = marble; c.lineWidth = 1;
            c.beginPath(); c.moveTo(cx - tr, tBase); c.lineTo(cx + tr, tBase); c.stroke();
            c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
        }

        /* CIRCULAR PRAYER HALL DRUM — sits directly on top terrace */
        var hallTop = gy - bH * 0.57;
        c.fillStyle = red2; c.strokeStyle = '#601010'; c.lineWidth = 1;
        c.fillRect(cx - 20, hallTop, 40, bH * 0.13); c.strokeRect(cx - 20, hallTop, 40, bH * 0.13);
        /* circular drum ellipse cap */
        c.beginPath(); c.ellipse(cx, hallTop, 20, 5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        /* columns on drum */
        c.fillStyle = '#aa1818';
        for (var hcol = -3; hcol <= 3; hcol++) { c.fillRect(cx + hcol * 7 - 2, hallTop, 4, bH * 0.13); }
        /* warm amber window glow */
        c.fillStyle = 'rgba(255,180,60,0.65)';
        for (var hw = -2; hw <= 2; hw += 2) {
            c.fillRect(cx + hw * 7 - 2, hallTop + 4, 4, 9);
            radialGlow(c, cx + hw * 7, hallTop + 8, 8, 255, 160, 40, 0.28);
        }

        /* TRIPLE-EAVE COBALT BLUE ROOF */
        for (var er = 0; er < 3; er++) {
            var ew = 26 - er * 7;
            var eY = hallTop - bH * 0.13 * er;
            c.fillStyle = er === 0 ? cobalt : cobaltL; c.strokeStyle = cobaltD; c.lineWidth = 1;
            c.beginPath(); c.moveTo(cx - ew - 8, eY); c.lineTo(cx, eY - bH * 0.12); c.lineTo(cx + ew + 8, eY); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = cobaltL;
            c.beginPath(); c.moveTo(cx - ew - 4, eY); c.lineTo(cx, eY - bH * 0.09); c.lineTo(cx + ew + 4, eY); c.closePath(); c.fill();
            /* tile ridges */
            c.strokeStyle = 'rgba(100,160,255,0.30)'; c.lineWidth = 0.6;
            for (var tk = 1; tk < 4; tk++) {
                var tf = tk / 4;
                c.beginPath(); c.moveTo(cx - (ew + 8) * tf, eY - bH * 0.12 * tf); c.lineTo(cx + (ew + 8) * tf, eY - bH * 0.12 * tf); c.stroke();
            }
            /* upturned eave tips */
            c.strokeStyle = gold2; c.lineWidth = 2;
            c.beginPath(); c.moveTo(cx - ew - 8, eY); c.quadraticCurveTo(cx - ew - 18, eY + 6, cx - ew - 22, eY - 8); c.stroke();
            c.beginPath(); c.moveTo(cx + ew + 8, eY); c.quadraticCurveTo(cx + ew + 18, eY + 6, cx + ew + 22, eY - 8); c.stroke();
            /* ridge beast ornaments */
            c.fillStyle = gold2;
            c.beginPath(); c.ellipse(cx - ew - 8, eY, 3, 2, 0.4, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(cx + ew + 8, eY, 3, 2, -0.4, 0, Math.PI * 2); c.fill();
        }

        /* GILDED FINIAL SPHERE + SPIKE */
        var finY = hallTop - bH * 0.41;
        radialGlow(c, cx, finY, 32, 220, 170, 40, 0.50);
        c.fillStyle = gold2; c.strokeStyle = goldL2; c.lineWidth = 1.5;
        c.beginPath(); c.arc(cx, finY, 10, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = goldL2; c.beginPath(); c.arc(cx, finY, 5, 0, Math.PI * 2); c.fill();
        c.strokeStyle = goldL2; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(cx, finY - 10); c.lineTo(cx, finY - 22); c.stroke();
        c.fillStyle = goldL2; c.beginPath(); c.arc(cx, finY - 22, 2, 0, Math.PI * 2); c.fill();
    }
    function drawCCTV(c, cx, gy, wins) {
        var bH = H * 0.52;
        var steel = '#1c2030', steelL = '#2c3448', steelHL = '#3c4860';

        radialGlow(c, cx, gy, 80, 60, 100, 200, 0.18);

        /* LEFT TOWER — angled, leans right at top */
        c.fillStyle = steel; c.strokeStyle = steelL; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(cx - 28, gy); c.lineTo(cx, gy);
        c.lineTo(cx + 8, gy - bH); c.lineTo(cx - 20, gy - bH);
        c.closePath(); c.fill(); c.stroke();
        var lgL = c.createLinearGradient(cx - 28, 0, cx, 0);
        lgL.addColorStop(0, 'rgba(80,130,220,0.14)'); lgL.addColorStop(1, 'rgba(40,80,160,0.06)');
        c.fillStyle = lgL;
        c.beginPath(); c.moveTo(cx - 28, gy); c.lineTo(cx, gy); c.lineTo(cx + 8, gy - bH); c.lineTo(cx - 20, gy - bH); c.closePath(); c.fill();

        /* RIGHT TOWER — angled, leans left at top */
        c.fillStyle = steel; c.strokeStyle = steelL; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(cx, gy); c.lineTo(cx + 28, gy);
        c.lineTo(cx + 20, gy - bH); c.lineTo(cx - 8, gy - bH);
        c.closePath(); c.fill(); c.stroke();
        var lgR = c.createLinearGradient(cx, 0, cx + 28, 0);
        lgR.addColorStop(0, 'rgba(40,80,160,0.06)'); lgR.addColorStop(1, 'rgba(80,130,220,0.14)');
        c.fillStyle = lgR;
        c.beginPath(); c.moveTo(cx, gy); c.lineTo(cx + 28, gy); c.lineTo(cx + 20, gy - bH); c.lineTo(cx - 8, gy - bH); c.closePath(); c.fill();

        /* TOP HORIZONTAL BRIDGE */
        c.fillStyle = steel; c.strokeStyle = steelL; c.lineWidth = 1;
        c.fillRect(cx - 20, gy - bH, 28, 24); c.strokeRect(cx - 20, gy - bH, 28, 24);
        c.fillRect(cx - 8, gy - bH - 3, 16, 24); c.strokeRect(cx - 8, gy - bH - 3, 16, 24);

        /* BOTTOM CANTILEVER OVERHANG */
        c.fillRect(cx - 32, gy - bH * 0.44, 64, 20); c.strokeRect(cx - 32, gy - bH * 0.44, 64, 20);
        c.fillStyle = steelHL; c.fillRect(cx - 32, gy - bH * 0.44, 64, 5);

        /* DIAMOND GRID CURTAIN WALL */
        c.strokeStyle = 'rgba(80,140,240,0.28)'; c.lineWidth = 0.8;
        for (var dg = 0; dg < 9; dg++) {
            var dx1 = cx - 28 + dg * 3.1;
            c.beginPath(); c.moveTo(dx1, gy); c.lineTo(dx1 + 8, gy - bH); c.stroke();
            c.beginPath(); c.moveTo(dx1 + 3, gy); c.lineTo(dx1 - 7, gy - bH); c.stroke();
        }
        c.strokeStyle = 'rgba(60,110,200,0.20)'; c.lineWidth = 0.6;
        for (var gl2 = 1; gl2 < 12; gl2++) {
            var gly = gy - bH * gl2 / 12;
            c.beginPath(); c.moveTo(cx - 28 + gl2 * 1.9, gly); c.lineTo(cx + 28 - gl2 * 1.9, gly); c.stroke();
        }

        /* BLUE LED ACCENT LIGHTING */
        radialGlow(c, cx, gy - bH, 28, 80, 130, 255, 0.32);
        radialGlow(c, cx, gy - bH * 0.5, 18, 60, 100, 200, 0.18);
        radialGlow(c, cx, gy - bH * 0.44, 22, 80, 120, 220, 0.24);

        if (wins) {
            var wi3 = 0; c.save(); c.beginPath();
            c.moveTo(cx - 28, gy); c.lineTo(cx, gy); c.lineTo(cx + 8, gy - bH); c.lineTo(cx - 20, gy - bH); c.closePath();
            c.moveTo(cx, gy); c.lineTo(cx + 28, gy); c.lineTo(cx + 20, gy - bH); c.lineTo(cx - 8, gy - bH); c.closePath();
            c.rect(cx - 20, gy - bH, 28, 24); c.rect(cx - 32, gy - bH * 0.44, 64, 20); c.clip();
            for (var r3 = 0; r3 < 8; r3++) for (var co3 = -3; co3 <= 3; co3++, wi3++) {
                drawWin(c, cx + co3 * 9 - 3, gy - bH * (0.08 + r3 * 0.11), 7, 10, wins[wi3 % wins.length]);
            }
            c.restore();
        }
    }
    function drawForbiddenCity(c, cx, gy) {
        var bH = H * 0.38;
        var red3 = '#aa1414', redD3 = '#800e0e';
        var gold3 = '#e0b020', goldL3 = '#ffd040';
        var yellow2 = '#d49010';

        radialGlow(c, cx, gy, 100, 255, 100, 20, 0.12);

        /* moat water */
        c.fillStyle = 'rgba(18,35,65,0.35)'; c.fillRect(cx - 88, gy - bH * 0.03, 176, bH * 0.03);
        c.strokeStyle = 'rgba(60,100,170,0.22)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 88, gy - bH * 0.02); c.lineTo(cx + 88, gy - bH * 0.02); c.stroke();

        /* MASSIVE RED OUTER WALLS */
        c.fillStyle = red3; c.strokeStyle = redD3; c.lineWidth = 1;
        c.fillRect(cx - 84, gy - bH * 0.58, 168, bH * 0.58); c.strokeRect(cx - 84, gy - bH * 0.58, 168, bH * 0.58);
        c.fillStyle = redD3; c.fillRect(cx - 84, gy - bH * 0.12, 168, bH * 0.12);

        /* 5 arched gates */
        c.fillStyle = '#060408';
        for (var fg2 = -2; fg2 <= 2; fg2++) {
            var fgx = cx + fg2 * 30;
            c.beginPath(); c.arc(fgx, gy - bH * 0.22, 10, Math.PI, 0, false); c.fill();
            c.fillRect(fgx - 10, gy - bH * 0.22, 20, bH * 0.22); c.fill();
            c.strokeStyle = gold3; c.lineWidth = 0.9;
            c.beginPath(); c.arc(fgx, gy - bH * 0.22, 10, Math.PI, 0, false); c.stroke();
            c.fillStyle = goldL3;
            for (var gs2 = 0; gs2 < 4; gs2++) {
                for (var gr3 = 0; gr3 < 5; gr3++) {
                    c.beginPath(); c.arc(fgx - 6 + gs2 * 4, gy - bH * 0.14 + gr3 * bH * 0.034, 1, 0, Math.PI * 2); c.fill();
                }
            }
            c.fillStyle = '#060408';
        }

        /* FLANKING CORNER TOWERS */
        for (var ct = -1; ct <= 1; ct += 2) {
            var ctx2 = cx + ct * 78;
            c.fillStyle = red3; c.strokeStyle = redD3; c.lineWidth = 1;
            c.fillRect(ctx2 - 10, gy - bH * 0.76, 20, bH * 0.76); c.strokeRect(ctx2 - 10, gy - bH * 0.76, 20, bH * 0.76);
            /* column detail on corner tower */
            c.fillStyle = '#881010';
            for (var cc = -1; cc <= 1; cc++) { c.fillRect(ctx2 + cc * 6 - 2, gy - bH * 0.76, 4, bH * 0.76); }
            /* yellow roof */
            c.fillStyle = yellow2; c.strokeStyle = '#a07008'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(ctx2 - 14, gy - bH * 0.76); c.lineTo(ctx2, gy - bH * 0.88); c.lineTo(ctx2 + 14, gy - bH * 0.76); c.closePath(); c.fill(); c.stroke();
            /* upturned corners */
            c.strokeStyle = '#c07010'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(ctx2 - 14, gy - bH * 0.76); c.quadraticCurveTo(ctx2 - 20, gy - bH * 0.71, ctx2 - 22, gy - bH * 0.62); c.stroke();
            c.beginPath(); c.moveTo(ctx2 + 14, gy - bH * 0.76); c.quadraticCurveTo(ctx2 + 20, gy - bH * 0.71, ctx2 + 22, gy - bH * 0.62); c.stroke();
            radialGlow(c, ctx2, gy - bH * 0.84, 12, 255, 200, 80, 0.18);
        }

        /* MAIN GATE TOWER (Wumen) body */
        c.fillStyle = '#1c1880'; c.strokeStyle = '#2a2488'; c.lineWidth = 1;
        c.fillRect(cx - 52, gy - bH * 0.82, 104, bH * 0.24); c.strokeRect(cx - 52, gy - bH * 0.82, 104, bH * 0.24);
        /* red columns on tower */
        c.fillStyle = red3;
        for (var col3b = -4; col3b <= 4; col3b++) { c.fillRect(cx + col3b * 12 - 3, gy - bH * 0.82, 6, bH * 0.24); }
        /* amber windows */
        c.fillStyle = 'rgba(255,180,50,0.60)';
        for (var w3 = -3; w3 <= 3; w3 += 2) { c.fillRect(cx + w3 * 12 - 3, gy - bH * 0.77, 6, 12); radialGlow(c, cx + w3 * 12, gy - bH * 0.73, 8, 255, 160, 40, 0.22); }

        /* TRIPLE YELLOW EAVE ROOF */
        c.fillStyle = yellow2; c.strokeStyle = '#a07008'; c.lineWidth = 1.8;
        c.beginPath(); c.moveTo(cx - 70, gy - bH * 0.82); c.lineTo(cx, gy - bH * 0.99); c.lineTo(cx + 70, gy - bH * 0.82); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#e0a828';
        c.beginPath(); c.moveTo(cx - 62, gy - bH * 0.84); c.lineTo(cx, gy - bH * 0.99); c.lineTo(cx + 62, gy - bH * 0.84); c.closePath(); c.fill();
        c.fillStyle = '#d49010'; c.strokeStyle = '#a07008'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(cx - 52, gy - bH * 0.88); c.lineTo(cx, gy - bH * 1.00); c.lineTo(cx + 52, gy - bH * 0.88); c.closePath(); c.fill(); c.stroke();

        /* eave tips */
        c.strokeStyle = '#c07010'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx - 70, gy - bH * 0.82); c.quadraticCurveTo(cx - 82, gy - bH * 0.76, cx - 84, gy - bH * 0.65); c.stroke();
        c.beginPath(); c.moveTo(cx + 70, gy - bH * 0.82); c.quadraticCurveTo(cx + 82, gy - bH * 0.76, cx + 84, gy - bH * 0.65); c.stroke();

        radialGlow(c, cx, gy - bH * 0.99, 40, 255, 200, 80, 0.28);
        for (var ln3 = -3; ln3 <= 3; ln3++) { drawLantern(c, cx + ln3 * 20, gy - bH * 0.80, 5, 220, 30, 30); }
    }

    /* ══════════════════════════════════════════════
       LONDON LANDMARKS  (warm Portland stone / Victorian steel / Gothic palette)
    ══════════════════════════════════════════════ */
    function drawBigBen(c, cx, gy) {
        var bH = H * 0.52;
        var lime = '#d4c080', limeD = '#a89050';

        radialGlow(c, cx, gy, 80, 255, 230, 140, 0.14);

        /* base plinth — two-step */
        c.fillStyle = lime; c.strokeStyle = limeD; c.lineWidth = 1;
        c.fillRect(cx - 22, gy - bH * 0.07, 44, bH * 0.07); c.strokeRect(cx - 22, gy - bH * 0.07, 44, bH * 0.07);
        c.fillRect(cx - 18, gy - bH * 0.10, 36, bH * 0.03); c.strokeRect(cx - 18, gy - bH * 0.10, 36, bH * 0.03);

        /* main Gothic shaft */
        c.fillRect(cx - 13, gy - bH * 0.82, 26, bH * 0.72); c.strokeRect(cx - 13, gy - bH * 0.82, 26, bH * 0.72);

        /* horizontal stone courses */
        c.strokeStyle = 'rgba(120,100,50,0.30)'; c.lineWidth = 0.6;
        for (var sc2 = 1; sc2 < 9; sc2++) {
            var sy = gy - bH * 0.10 - bH * 0.72 * sc2 / 9;
            c.beginPath(); c.moveTo(cx - 13, sy); c.lineTo(cx + 13, sy); c.stroke();
        }

        /* vertical pilaster ribs */
        c.strokeStyle = limeD; c.lineWidth = 0.9;
        for (var pr = -1; pr <= 1; pr++) {
            c.beginPath(); c.moveTo(cx + pr * 6, gy - bH * 0.10); c.lineTo(cx + pr * 6, gy - bH * 0.82); c.stroke();
        }

        /* Gothic lancet windows in shaft */
        c.fillStyle = 'rgba(20,18,8,0.88)';
        for (var wfl = 1; wfl < 5; wfl++) {
            var wly = gy - bH * (0.12 + wfl * 0.13);
            for (var wls = -1; wls <= 1; wls += 2) {
                var wlx = cx + wls * 5;
                c.fillRect(wlx - 2, wly, 4, 10); c.fill();
                c.beginPath(); c.arc(wlx, wly, 2, Math.PI, 0, false); c.fill();
            }
        }

        /* corner pilaster towers */
        c.fillStyle = limeD; c.strokeStyle = '#8a7040'; c.lineWidth = 0.8;
        c.fillRect(cx - 17, gy - bH * 0.80, 4, bH * 0.70); c.strokeRect(cx - 17, gy - bH * 0.80, 4, bH * 0.70);
        c.fillRect(cx + 13, gy - bH * 0.80, 4, bH * 0.70); c.strokeRect(cx + 13, gy - bH * 0.80, 4, bH * 0.70);

        /* clock stage — projecting band */
        c.fillStyle = lime; c.strokeStyle = limeD; c.lineWidth = 1;
        c.fillRect(cx - 17, gy - bH * 0.86, 34, bH * 0.06); c.strokeRect(cx - 17, gy - bH * 0.86, 34, bH * 0.06);
        c.fillStyle = 'rgba(255,240,160,0.22)'; c.fillRect(cx - 17, gy - bH * 0.87, 34, 3);

        /* front clock face — large, illuminated */
        var cf = gy - bH * 0.89;
        radialGlow(c, cx, cf, 26, 255, 248, 200, 0.65);
        c.fillStyle = 'rgba(255,252,220,0.97)';
        c.beginPath(); c.arc(cx, cf, 13, 0, Math.PI * 2); c.fill();
        c.strokeStyle = limeD; c.lineWidth = 1.2;
        c.beginPath(); c.arc(cx, cf, 13, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = '#181810'; c.lineWidth = 0.8;
        for (var tm = 0; tm < 12; tm++) {
            var ta = tm / 12 * Math.PI * 2 - Math.PI / 2;
            c.beginPath(); c.moveTo(cx + Math.cos(ta) * 10, cf + Math.sin(ta) * 10); c.lineTo(cx + Math.cos(ta) * 13, cf + Math.sin(ta) * 13); c.stroke();
        }
        c.strokeStyle = '#181810'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx, cf); c.lineTo(cx + 8, cf - 6); c.stroke();
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx, cf); c.lineTo(cx - 5, cf + 7); c.stroke();
        c.fillStyle = '#181810'; c.beginPath(); c.arc(cx, cf, 1.8, 0, Math.PI * 2); c.fill();

        /* side clock faces — foreshortened ellipses */
        for (var sfc = -1; sfc <= 1; sfc += 2) {
            radialGlow(c, cx + sfc * 15, cf, 14, 255, 248, 200, 0.42);
            c.fillStyle = 'rgba(255,252,210,0.85)';
            c.beginPath(); c.ellipse(cx + sfc * 15, cf, 5, 12, 0, 0, Math.PI * 2); c.fill();
            c.strokeStyle = limeD; c.lineWidth = 0.8;
            c.beginPath(); c.ellipse(cx + sfc * 15, cf, 5, 12, 0, 0, Math.PI * 2); c.stroke();
        }

        /* belfry — open Gothic arched stage */
        c.fillStyle = lime; c.strokeStyle = limeD; c.lineWidth = 1;
        c.fillRect(cx - 13, gy - bH * 0.96, 26, bH * 0.10); c.strokeRect(cx - 13, gy - bH * 0.96, 26, bH * 0.10);
        c.fillStyle = 'rgba(15,12,5,0.92)';
        for (var ba = -1; ba <= 1; ba += 2) {
            var bax = cx + ba * 6;
            c.fillRect(bax - 3, gy - bH * 0.96 + 4, 6, bH * 0.075);
            c.beginPath(); c.arc(bax, gy - bH * 0.96 + 4, 3, Math.PI, 0, false); c.fill();
        }
        c.fillStyle = 'rgba(220,200,100,0.22)'; c.fillRect(cx - 14, gy - bH * 0.97, 28, 2);

        /* main Gothic spire */
        c.fillStyle = lime; c.strokeStyle = limeD; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 13, gy - bH * 0.96); c.lineTo(cx, gy - bH); c.lineTo(cx + 13, gy - bH * 0.96); c.closePath(); c.fill(); c.stroke();

        /* 4 corner pinnacles */
        c.fillStyle = limeD; c.strokeStyle = '#8a7040'; c.lineWidth = 0.8;
        for (var pin = -1; pin <= 1; pin += 2) {
            c.fillRect(cx + pin * 14 - 2, gy - bH * 0.99, 4, bH * 0.05);
            c.strokeRect(cx + pin * 14 - 2, gy - bH * 0.99, 4, bH * 0.05);
            c.beginPath(); c.moveTo(cx + pin * 14 - 3, gy - bH * 0.99); c.lineTo(cx + pin * 14, gy - bH * 1.025); c.lineTo(cx + pin * 14 + 3, gy - bH * 0.99); c.closePath(); c.fill(); c.stroke();
        }

        radialGlow(c, cx, gy - bH, 16, 255, 240, 150, 0.32);
        c.fillStyle = '#ffe080'; c.beginPath(); c.arc(cx, gy - bH, 2.5, 0, Math.PI * 2); c.fill();
    }
    function drawTowerBridge(c, cx, gy) {
        var span = W * 0.22;
        var th = H * 0.35;
        var deckY = gy - H * 0.07;
        var stone = '#d4c890', stoneD = '#b0a068';
        var steel = '#5c6878', steelD = '#44505e';
        var ironBlue = '#3c5070';

        /* Thames shimmer */
        c.fillStyle = 'rgba(20,35,60,0.28)'; c.fillRect(cx - span, gy - H * 0.04, span * 2, H * 0.04);
        c.strokeStyle = 'rgba(60,100,160,0.18)'; c.lineWidth = 1;
        for (var rw2 = 0; rw2 < 3; rw2++) { c.beginPath(); c.moveTo(cx - span, gy - H * 0.02 + rw2 * 4); c.lineTo(cx + span, gy - H * 0.02 + rw2 * 4); c.stroke(); }

        /* road deck */
        c.fillStyle = steel; c.strokeStyle = steelD; c.lineWidth = 1;
        c.fillRect(cx - span, deckY, span * 2, 8); c.strokeRect(cx - span, deckY, span * 2, 8);

        /* high-level walkway */
        c.fillStyle = steel; c.strokeStyle = stoneD; c.lineWidth = 1;
        c.fillRect(cx - span * 0.44, deckY - th * 0.25, span * 0.88, 6); c.strokeRect(cx - span * 0.44, deckY - th * 0.25, span * 0.88, 6);

        /* catenary suspension cables */
        c.strokeStyle = ironBlue; c.lineWidth = 2.8;
        c.beginPath(); c.moveTo(cx - span, deckY - 4); c.quadraticCurveTo(cx - span * 0.75, deckY - th * 0.18, cx - span * 0.46, gy - th * 0.72); c.stroke();
        c.beginPath(); c.moveTo(cx + span, deckY - 4); c.quadraticCurveTo(cx + span * 0.75, deckY - th * 0.18, cx + span * 0.46, gy - th * 0.72); c.stroke();
        c.strokeStyle = '#4c6080'; c.lineWidth = 1.8;
        c.beginPath(); c.moveTo(cx - span * 0.46, gy - th * 0.72); c.lineTo(cx - span * 0.44, deckY - th * 0.24); c.stroke();
        c.beginPath(); c.moveTo(cx + span * 0.46, gy - th * 0.72); c.lineTo(cx + span * 0.44, deckY - th * 0.24); c.stroke();
        c.strokeStyle = 'rgba(80,100,130,0.42)'; c.lineWidth = 0.8;
        for (var hr = -6; hr <= 6; hr++) {
            if (Math.abs(hr) < 3) continue;
            var hx = cx + hr * span / 6.5;
            c.beginPath(); c.moveTo(hx, deckY); c.lineTo(hx, deckY - th * 0.24 * (1 - Math.abs(hr) / 9)); c.stroke();
        }

        /* two Portland stone Gothic towers */
        for (var tow = -1; tow <= 1; tow += 2) {
            var tx2 = cx + tow * span * 0.46;

            c.fillStyle = stone; c.strokeStyle = stoneD; c.lineWidth = 1.2;
            c.fillRect(tx2 - 15, gy - th, 30, th); c.strokeRect(tx2 - 15, gy - th, 30, th);

            /* stone courses */
            c.strokeStyle = 'rgba(120,100,50,0.26)'; c.lineWidth = 0.6;
            for (var tc = 1; tc < 9; tc++) { c.beginPath(); c.moveTo(tx2 - 15, gy - th * tc / 9); c.lineTo(tx2 + 15, gy - th * tc / 9); c.stroke(); }

            /* center pilaster */
            c.strokeStyle = stoneD; c.lineWidth = 0.9;
            c.beginPath(); c.moveTo(tx2, gy - th); c.lineTo(tx2, gy); c.stroke();

            /* corner turrets */
            for (var tur = -1; tur <= 1; tur += 2) {
                var turX = tx2 + tur * 17;
                c.fillStyle = stone; c.strokeStyle = stoneD; c.lineWidth = 1;
                c.fillRect(turX - 4, gy - th * 0.70, 8, th * 0.70); c.strokeRect(turX - 4, gy - th * 0.70, 8, th * 0.70);
                c.fillStyle = '#7a8878'; c.strokeStyle = '#5a6858'; c.lineWidth = 0.8;
                c.beginPath(); c.moveTo(turX - 5, gy - th * 0.70); c.lineTo(turX, gy - th * 0.86); c.lineTo(turX + 5, gy - th * 0.70); c.closePath(); c.fill(); c.stroke();
            }

            /* Gothic arched windows */
            c.fillStyle = 'rgba(255,240,200,0.72)';
            for (var gw = 0; gw < 3; gw++) {
                var gwy = gy - th * (0.20 + gw * 0.22);
                c.fillRect(tx2 - 4, gwy, 8, 14);
                c.beginPath(); c.arc(tx2, gwy, 4, Math.PI, 0, false); c.fill();
                radialGlow(c, tx2, gwy + 8, 10, 255, 230, 180, 0.18);
            }

            /* peaked tower roof */
            c.fillStyle = '#8a9080'; c.strokeStyle = '#6a7060'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(tx2 - 15, gy - th); c.lineTo(tx2, gy - th * 1.16); c.lineTo(tx2 + 15, gy - th); c.closePath(); c.fill(); c.stroke();

            /* flagpole + Union Jack hint */
            c.strokeStyle = '#8a8070'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(tx2, gy - th * 1.16); c.lineTo(tx2, gy - th * 1.26); c.stroke();
            c.fillStyle = '#c81020'; c.fillRect(tx2, gy - th * 1.26, 14, 8);
            c.strokeStyle = 'rgba(255,255,255,0.60)'; c.lineWidth = 0.8;
            c.beginPath(); c.moveTo(tx2, gy - th * 1.26); c.lineTo(tx2 + 14, gy - th * 1.26 + 8); c.stroke();
            c.beginPath(); c.moveTo(tx2 + 14, gy - th * 1.26); c.lineTo(tx2, gy - th * 1.26 + 8); c.stroke();
            c.beginPath(); c.moveTo(tx2, gy - th * 1.26 + 4); c.lineTo(tx2 + 14, gy - th * 1.26 + 4); c.stroke();
            c.beginPath(); c.moveTo(tx2 + 7, gy - th * 1.26); c.lineTo(tx2 + 7, gy - th * 1.26 + 8); c.stroke();

            radialGlow(c, tx2, gy - th * 0.35, 28, 255, 220, 140, 0.12);
        }
    }
    function drawTheShard(c, cx, gy, wins) {
        var bH=H*0.58;
        c.fillStyle='#141824'; c.strokeStyle='#202840'; c.lineWidth=1;
        c.beginPath();
        c.moveTo(cx-34,gy); c.lineTo(cx+34,gy);
        c.lineTo(cx+28,gy-bH*0.30);
        c.lineTo(cx+16,gy-bH*0.60);
        c.lineTo(cx+4,  gy-bH*0.85);
        c.lineTo(cx,    gy-bH);
        c.lineTo(cx-4,  gy-bH*0.85);
        c.lineTo(cx-16, gy-bH*0.60);
        c.lineTo(cx-28, gy-bH*0.30);
        c.closePath(); c.fill(); c.stroke();
        /* glass panels — angled reflections */
        c.strokeStyle='rgba(60,100,180,0.18)'; c.lineWidth=0.7;
        for(var gp2=1;gp2<8;gp2++) {
            var gf=gp2/8;
            var gl3=cx-(34-(34-0)*gf);
            var gr=cx+(34-(34-0)*gf);
            c.beginPath(); c.moveTo(gl3,gy-bH*gf); c.lineTo(gr,gy-bH*gf); c.stroke();
        }
        if(wins) {
            var wi4=0; c.save(); c.beginPath();
            c.moveTo(cx-34,gy); c.lineTo(cx+34,gy); c.lineTo(cx+28,gy-bH*0.30); c.lineTo(cx+16,gy-bH*0.60); c.lineTo(cx+4,gy-bH*0.85); c.lineTo(cx,gy-bH); c.lineTo(cx-4,gy-bH*0.85); c.lineTo(cx-16,gy-bH*0.60); c.lineTo(cx-28,gy-bH*0.30); c.closePath(); c.clip();
            for(var r4=0;r4<8;r4++) for(var co4=-4;co4<=4;co4++,wi4++) {
                drawWin(c,cx+co4*7-3,gy-bH*(0.08+r4*0.10),5,8,wins[wi4%wins.length]);
            }
            c.restore();
        }
    }

    /* ══════════════════════════════════════════════
       DUBAI LANDMARKS  (warm ivory / gold / amber desert palette)
    ══════════════════════════════════════════════ */
    function drawBurjAlArab(c, cx, gy) {
        var bH=H*0.56;
        /* REAL Burj Al Arab: Teflon-coated woven glass-fibre sail, brilliant white exterior
           with distinctive gold and blue atrium interior, deep-water island setting         */

        /* Persian Gulf water at base */
        var seaG=c.createLinearGradient(cx-60,gy,cx-60,gy+20);
        seaG.addColorStop(0,'rgba(0,60,120,0.55)');
        seaG.addColorStop(1,'rgba(0,30,80,0.20)');
        c.fillStyle=seaG; c.fillRect(cx-90,gy,180,20);
        /* water shimmer lines */
        c.strokeStyle='rgba(80,180,255,0.22)'; c.lineWidth=0.8;
        for(var ws=0;ws<5;ws++) { c.beginPath(); c.moveTo(cx-90,gy+3+ws*3); c.lineTo(cx+90,gy+3+ws*3); c.stroke(); }

        /* artificial island concrete base */
        c.fillStyle='#3a4050'; c.strokeStyle='#282e3c'; c.lineWidth=1;
        c.fillRect(cx-35,gy-4,70,8); c.strokeRect(cx-35,gy-4,70,8);
        /* concrete pile foundation stem */
        c.fillStyle='#2a3040';
        c.fillRect(cx-10,gy-8,20,8);

        /* concrete raft / ground floor */
        c.fillStyle='#4a5060'; c.strokeStyle='#383e4a'; c.lineWidth=1;
        c.fillRect(cx-30,gy-bH*0.06,60,bH*0.06); c.strokeRect(cx-30,gy-bH*0.06,60,bH*0.06);

        /* ── EXOSKELETON SAIL SHAPE ── */
        /* The building has a distinctive curved sail silhouette — left edge is nearly straight
           vertical, right edge curves out dramatically then back in at the top */

        /* shadow / dark back face */
        c.fillStyle='rgba(20,30,60,0.40)';
        c.beginPath();
        c.moveTo(cx-25, gy-bH*0.06);
        c.lineTo(cx-25, gy-bH*0.98);
        c.quadraticCurveTo(cx-18, gy-bH, cx-10, gy-bH*0.98);
        c.lineTo(cx-10, gy-bH*0.06);
        c.closePath(); c.fill();

        /* main sail — brilliant white teflon-coated glass-fibre */
        var sailW=c.createLinearGradient(cx-25,0,cx+70,0);
        sailW.addColorStop(0,  'rgb(200,210,225)');  /* left shadow edge */
        sailW.addColorStop(0.1,'rgb(235,242,252)');
        sailW.addColorStop(0.3,'rgb(250,254,255)');  /* bright lit face */
        sailW.addColorStop(0.55,'rgb(242,248,255)');
        sailW.addColorStop(0.8,'rgb(215,228,245)');
        sailW.addColorStop(1,  'rgb(180,195,220)');  /* curved far edge */
        c.fillStyle=sailW;
        c.beginPath();
        c.moveTo(cx-25, gy-bH*0.06);               /* left base */
        c.lineTo(cx+28, gy-bH*0.06);               /* right base */
        c.lineTo(cx+30, gy-bH*0.12);
        c.quadraticCurveTo(cx+75, gy-bH*0.32, cx+68, gy-bH*0.65);
        c.quadraticCurveTo(cx+60, gy-bH*0.88, cx+44, gy-bH*0.98);
        c.lineTo(cx-24, gy-bH*0.98);               /* left top */
        c.quadraticCurveTo(cx-28, gy-bH*0.55, cx-25, gy-bH*0.06);
        c.closePath(); c.fill();
        c.strokeStyle='rgba(150,170,200,0.55)'; c.lineWidth=1.2; c.stroke();

        /* inner face / atrium — warm golden glow visible through fabric */
        var atmG=c.createLinearGradient(cx-22,gy-bH,cx+60,gy-bH*0.12);
        atmG.addColorStop(0,'rgba(255,200,60,0.18)');
        atmG.addColorStop(0.4,'rgba(255,160,20,0.28)');
        atmG.addColorStop(1,'rgba(200,120,10,0.10)');
        c.fillStyle=atmG;
        c.beginPath();
        c.moveTo(cx-22, gy-bH*0.08); c.lineTo(cx+26, gy-bH*0.08);
        c.lineTo(cx+28, gy-bH*0.14);
        c.quadraticCurveTo(cx+68, gy-bH*0.34, cx+62, gy-bH*0.66);
        c.quadraticCurveTo(cx+54, gy-bH*0.88, cx+40, gy-bH*0.97);
        c.lineTo(cx-22, gy-bH*0.97);
        c.quadraticCurveTo(cx-25, gy-bH*0.55, cx-22, gy-bH*0.08);
        c.closePath(); c.fill();

        /* horizontal floor bands across sail — 58 storeys */
        c.strokeStyle='rgba(140,165,200,0.30)'; c.lineWidth=0.6;
        for(var fl=1;fl<30;fl++) {
            var ff=fl/30;
            var lx=cx-24+(cx-22-(cx-25*(1-ff*0.3)))*0.05;
            var rx=cx+28+ff*38;
            c.beginPath(); c.moveTo(cx-23, gy-bH*ff*0.96); c.lineTo(cx+28+ff*35, gy-bH*ff*0.96); c.stroke();
        }

        /* V-shaped exoskeleton diagonal stays — iconic structural feature */
        c.strokeStyle='rgba(160,180,220,0.60)'; c.lineWidth=2;
        /* left diagonal stay */
        c.beginPath(); c.moveTo(cx-25,gy-bH*0.06); c.quadraticCurveTo(cx,gy-bH*0.48, cx+5,gy-bH*0.96); c.stroke();
        /* right diagonal stay */
        c.beginPath(); c.moveTo(cx+28,gy-bH*0.06); c.quadraticCurveTo(cx+48,gy-bH*0.35, cx+10,gy-bH*0.96); c.stroke();
        /* secondary diagonals */
        c.strokeStyle='rgba(160,180,220,0.35)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(cx-25,gy-bH*0.06); c.lineTo(cx+44,gy-bH*0.98); c.stroke();
        c.beginPath(); c.moveTo(cx+28,gy-bH*0.06); c.lineTo(cx-24,gy-bH*0.98); c.stroke();

        /* gold accent strips at key floor plates */
        c.strokeStyle='rgba(220,170,40,0.55)'; c.lineWidth=1.5;
        for(var ga=0;ga<4;ga++) {
            var gaf=(ga+1)*0.22;
            c.beginPath(); c.moveTo(cx-23,gy-bH*gaf); c.lineTo(cx+28+gaf*35,gy-bH*gaf); c.stroke();
        }

        /* ── helipad — top of curved sail ── */
        /* arm extending from sail top */
        c.fillStyle='#e8eef8'; c.strokeStyle='#b0c0d8'; c.lineWidth=1.2;
        c.beginPath();
        c.moveTo(cx+44, gy-bH*0.98);
        c.lineTo(cx+88, gy-bH*0.94);
        c.lineTo(cx+87, gy-bH*0.96);
        c.lineTo(cx+43, gy-bH*0.995);
        c.closePath(); c.fill(); c.stroke();
        /* helipad deck */
        c.fillStyle='#d4dce8'; c.strokeStyle='#90a0b8'; c.lineWidth=1;
        c.beginPath(); c.ellipse(cx+88,gy-bH*0.952,16,5,0,0,Math.PI*2); c.fill(); c.stroke();
        /* "H" markings */
        c.strokeStyle='rgba(255,255,255,0.75)'; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(cx+83,gy-bH*0.952-3); c.lineTo(cx+83,gy-bH*0.952+3); c.stroke();
        c.beginPath(); c.moveTo(cx+88,gy-bH*0.952-3); c.lineTo(cx+88,gy-bH*0.952+3); c.stroke();
        c.beginPath(); c.moveTo(cx+83,gy-bH*0.952); c.lineTo(cx+88,gy-bH*0.952); c.stroke();
        /* aviation orange circle */
        c.strokeStyle='rgba(255,140,0,0.80)'; c.lineWidth=1.2;
        c.beginPath(); c.ellipse(cx+88,gy-bH*0.952,12,4,0,0,Math.PI*2); c.stroke();
        radialGlow(c,cx+88,gy-bH*0.952,20,255,160,40,0.22);

        /* crescent moon ornament at very top */
        c.fillStyle='rgba(220,170,40,0.90)';
        c.beginPath(); c.arc(cx-8,gy-bH*0.995,5,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(20,30,60,0.85)';
        c.beginPath(); c.arc(cx-6,gy-bH*0.995,3.5,0,Math.PI*2); c.fill();

        /* uplights / spotlights at base */
        radialGlow(c,cx,gy-bH*0.06,50,180,200,255,0.20);
        radialGlow(c,cx-30,gy-bH*0.06,30,180,200,255,0.14);
        radialGlow(c,cx+28,gy-bH*0.06,30,180,200,255,0.14);
    }
    function drawBurjKhalifa(c, cx, gy, wins) {
        var bH=H*0.85;
        /* REAL Burj Khalifa: blue-silver reflective glass and aluminium cladding */
        /* Y-shaped tripartite plan — three wings spiral upward with setbacks */

        /* ground uplight */
        radialGlow(c,cx,gy,90,60,140,255,0.18);

        /* tier data: dx=half-width, h=fractional height from base */
        var bkTiers=[
            {dx:58,h:0.07},{dx:50,h:0.16},{dx:42,h:0.27},
            {dx:34,h:0.38},{dx:26,h:0.50},{dx:20,h:0.61},
            {dx:15,h:0.71},{dx:10,h:0.80},{dx:6, h:0.89},{dx:3, h:0.94}
        ];

        /* draw each tier: reflective blue-grey glass */
        for(var t2=0;t2<bkTiers.length;t2++) {
            var prev2=t2>0?bkTiers[t2-1].h:0;
            var bk=bkTiers[t2];
            var tierH=bH*(bk.h-prev2);
            var tierY=gy-bH*bk.h;
            /* left and right wing (Y-plan gives slight asymmetry) */
            var leftX=cx-bk.dx, rightX=cx-bk.dx*0.62;
            /* main body — deep steel-blue reflective glass */
            var glF=c.createLinearGradient(cx-bk.dx,0,cx+bk.dx,0);
            glF.addColorStop(0,  'rgb(22,40,72)');
            glF.addColorStop(0.2,'rgb(34,62,108)');
            glF.addColorStop(0.4,'rgb(50,82,138)');
            glF.addColorStop(0.6,'rgb(42,70,120)');
            glF.addColorStop(0.8,'rgb(28,50,90)');
            glF.addColorStop(1,  'rgb(18,34,60)');
            c.fillStyle=glF;
            c.fillRect(cx-bk.dx, tierY, bk.dx*2, tierH);
            /* right wing offset shape (Y-plan chamfer) */
            var wF=c.createLinearGradient(cx+bk.dx*0.52,0,cx+bk.dx*0.9,0);
            wF.addColorStop(0,'rgb(40,65,115)');
            wF.addColorStop(1,'rgb(24,42,78)');
            c.fillStyle=wF;
            c.beginPath();
            c.moveTo(cx+bk.dx*0.52, tierY);
            c.lineTo(cx+bk.dx,      tierY);
            c.lineTo(cx+bk.dx,      tierY+tierH);
            c.lineTo(cx+bk.dx*0.52, tierY+tierH);
            c.closePath(); c.fill();
            /* setback ledge — bright silver edge */
            c.strokeStyle='rgba(140,200,255,0.55)'; c.lineWidth=1.5;
            c.beginPath(); c.moveTo(cx-bk.dx,tierY); c.lineTo(cx+bk.dx,tierY); c.stroke();
            /* vertical glass curtain wall fins */
            c.strokeStyle='rgba(80,140,220,0.18)'; c.lineWidth=0.6;
            var nFins=Math.max(2,Math.floor(bk.dx*2/8));
            for(var vf2=0;vf2<=nFins;vf2++) {
                var vfx=cx-bk.dx+vf2*(bk.dx*2/nFins);
                c.beginPath(); c.moveTo(vfx,tierY); c.lineTo(vfx,tierY+tierH); c.stroke();
            }
        }

        /* specular reflection band — sun/city-lights gleam on glass */
        c.fillStyle='rgba(140,210,255,0.12)';
        c.beginPath();
        c.moveTo(cx-10,gy);
        c.lineTo(cx-2,gy-bH*0.89);
        c.lineTo(cx+2,gy-bH*0.89);
        c.lineTo(cx+10,gy);
        c.closePath(); c.fill();

        /* horizontal floor bands */
        c.strokeStyle='rgba(60,120,210,0.30)'; c.lineWidth=0.7;
        for(var hb=1;hb<22;hb++) {
            var hbY=gy-bH*(hb/22);
            var hbW=0;
            for(var ti=0;ti<bkTiers.length;ti++) {
                if(hb/22<=bkTiers[ti].h){hbW=bkTiers[ti].dx;break;}
            }
            if(hbW>0) { c.beginPath(); c.moveTo(cx-hbW,hbY); c.lineTo(cx+hbW,hbY); c.stroke(); }
        }

        /* nose / spire — stainless steel needle */
        c.strokeStyle='#c0d4f0'; c.lineWidth=3.5;
        c.beginPath(); c.moveTo(cx-1,gy-bH*0.94); c.lineTo(cx,gy-bH); c.stroke();
        c.strokeStyle='rgba(200,230,255,0.90)'; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(cx+1,gy-bH*0.94); c.lineTo(cx,gy-bH); c.stroke();
        /* aviation warning light */
        radialGlow(c,cx,gy-bH,18,180,220,255,0.65);
        c.fillStyle='#e0f0ff';
        c.beginPath(); c.arc(cx,gy-bH,3,0,Math.PI*2); c.fill();

        /* LED accent rings at setbacks */
        for(var lr2=0;lr2<bkTiers.length;lr2+=2) {
            var lrY=gy-bH*bkTiers[lr2].h;
            var lrW=bkTiers[lr2].dx;
            radialGlow(c,cx,lrY,lrW*1.4,60,140,255,0.12);
        }

        /* illuminated windows — blue-white glass tones */
        if(wins) {
            var wi5=0; c.save(); c.beginPath();
            for(var bkt=0;bkt<bkTiers.length;bkt++) {
                var pp=bkt>0?bkTiers[bkt-1].h:0; var bkb=bkTiers[bkt];
                c.rect(cx-bkb.dx,gy-bH*bkb.h,bkb.dx*2,bH*(bkb.h-pp));
            }
            c.clip();
            for(var r5=0;r5<18;r5++) for(var co5=-5;co5<=5;co5++,wi5++) {
                var wstate=wins[wi5%wins.length];
                c.fillStyle=wstate===0?'rgba(8,15,35,0.90)':
                            wstate===1?'rgba(80,150,240,0.85)':'rgba(180,220,255,0.92)';
                var wx5=cx+co5*7-3, wy5=gy-bH*(0.03+r5*0.052);
                c.fillRect(wx5,wy5,5,8);
                if(wstate>0) radialGlow(c,wx5+2.5,wy5+4,14,80,150,255,0.22);
            }
            c.restore();
        }
    }
    function drawDubaiFrame(c, cx, gy) {
        var bH=H*0.42;
        /* REAL Dubai Frame: giant 150m × 93m picture-frame structure
           Gold anodized steel outer frame, floor-to-ceiling glass skybridge at top,
           twin towers connected by glass bridge — opened 2018               */

        /* ground uplights */
        radialGlow(c,cx,gy,70,200,150,30,0.18);
        radialGlow(c,cx-32,gy,28,200,150,30,0.12);
        radialGlow(c,cx+32,gy,28,200,150,30,0.12);

        /* ── left tower ── gold anodized steel cladding */
        var goldL=c.createLinearGradient(cx-42,0,cx-20,0);
        goldL.addColorStop(0,'rgb(80,55,8)');
        goldL.addColorStop(0.25,'rgb(160,118,22)');
        goldL.addColorStop(0.5,'rgb(210,162,35)');
        goldL.addColorStop(0.75,'rgb(185,138,25)');
        goldL.addColorStop(1,'rgb(100,72,12)');
        c.fillStyle=goldL; c.fillRect(cx-42,gy-bH,22,bH);
        /* tower facade panels */
        c.strokeStyle='rgba(240,190,50,0.45)'; c.lineWidth=0.8;
        for(var lf=1;lf<20;lf++) { c.beginPath(); c.moveTo(cx-42,gy-bH*lf/20); c.lineTo(cx-20,gy-bH*lf/20); c.stroke(); }
        /* highlight strip on left tower */
        c.fillStyle='rgba(255,230,100,0.25)'; c.fillRect(cx-36,gy-bH,6,bH);
        c.strokeStyle='rgba(80,55,8,0.70)'; c.lineWidth=1.2;
        c.strokeRect(cx-42,gy-bH,22,bH);

        /* ── right tower ── */
        var goldR=c.createLinearGradient(cx+20,0,cx+42,0);
        goldR.addColorStop(0,'rgb(100,72,12)');
        goldR.addColorStop(0.25,'rgb(185,138,25)');
        goldR.addColorStop(0.5,'rgb(210,162,35)');
        goldR.addColorStop(0.75,'rgb(160,118,22)');
        goldR.addColorStop(1,'rgb(80,55,8)');
        c.fillStyle=goldR; c.fillRect(cx+20,gy-bH,22,bH);
        for(var rf=1;rf<20;rf++) { c.beginPath(); c.moveTo(cx+20,gy-bH*rf/20); c.lineTo(cx+42,gy-bH*rf/20); c.stroke(); }
        c.fillStyle='rgba(255,230,100,0.20)'; c.fillRect(cx+30,gy-bH,6,bH);
        c.strokeStyle='rgba(80,55,8,0.70)'; c.lineWidth=1.2;
        c.strokeRect(cx+20,gy-bH,22,bH);

        /* ── top bridge / skybridge ── floor-to-ceiling glass + gold frame */
        var bridgeG=c.createLinearGradient(cx,gy-bH,cx,gy-bH+bH*0.12);
        bridgeG.addColorStop(0,'rgb(160,118,22)');
        bridgeG.addColorStop(0.3,'rgb(210,162,35)');
        bridgeG.addColorStop(0.7,'rgb(185,138,25)');
        bridgeG.addColorStop(1,'rgb(120,88,14)');
        c.fillStyle=bridgeG; c.fillRect(cx-42,gy-bH,84,bH*0.12);
        /* glass panel inside bridge */
        var bridgeGlass=c.createLinearGradient(cx-38,gy-bH+4,cx-38,gy-bH+bH*0.10);
        bridgeGlass.addColorStop(0,'rgba(80,160,240,0.35)');
        bridgeGlass.addColorStop(0.5,'rgba(100,180,255,0.50)');
        bridgeGlass.addColorStop(1,'rgba(60,120,200,0.30)');
        c.fillStyle=bridgeGlass; c.fillRect(cx-38,gy-bH+3,76,bH*0.09);
        /* bridge grid lines */
        c.strokeStyle='rgba(240,190,50,0.35)'; c.lineWidth=0.8;
        for(var bg2=1;bg2<8;bg2++) { c.beginPath(); c.moveTo(cx-38+bg2*76/8,gy-bH+3); c.lineTo(cx-38+bg2*76/8,gy-bH+bH*0.09); c.stroke(); }
        c.strokeStyle='rgba(80,55,8,0.70)'; c.lineWidth=1.2;
        c.strokeRect(cx-42,gy-bH,84,bH*0.12);
        /* sky view glow through bridge glass */
        radialGlow(c,cx,gy-bH+bH*0.06,35,80,160,255,0.22);

        /* ── bottom beam ── ground-level base connector */
        c.fillStyle=goldL; c.fillRect(cx-42,gy-bH*0.05,84,bH*0.05);
        for(var bbf=1;bbf<4;bbf++) { c.strokeStyle='rgba(240,190,50,0.35)'; c.lineWidth=0.8; c.beginPath(); c.moveTo(cx-42,gy-bH*0.05+bbf*(bH*0.05/4)); c.lineTo(cx+42,gy-bH*0.05+bbf*(bH*0.05/4)); c.stroke(); }
        c.strokeStyle='rgba(80,55,8,0.70)'; c.lineWidth=1.2;
        c.strokeRect(cx-42,gy-bH*0.05,84,bH*0.05);

        /* ── center opening ── sky visible through the frame */
        var openG=c.createLinearGradient(cx-18,gy-bH+bH*0.12,cx-18,gy-bH*0.05);
        openG.addColorStop(0,'rgba(20,40,100,0.25)');
        openG.addColorStop(0.5,'rgba(10,25,70,0.40)');
        openG.addColorStop(1,'rgba(20,40,100,0.22)');
        c.fillStyle=openG; c.fillRect(cx-18,gy-bH+bH*0.12,36,bH*0.83);
        /* glass window grid lines in opening */
        c.strokeStyle='rgba(180,140,30,0.18)'; c.lineWidth=0.6;
        for(var og=1;og<12;og++) { c.beginPath(); c.moveTo(cx-18,gy-bH+bH*0.12+og*(bH*0.83/12)); c.lineTo(cx+18,gy-bH+bH*0.12+og*(bH*0.83/12)); c.stroke(); }
        for(var ov=1;ov<4;ov++) { c.beginPath(); c.moveTo(cx-18+ov*36/4,gy-bH+bH*0.12); c.lineTo(cx-18+ov*36/4,gy-bH*0.05); c.stroke(); }

        /* ── golden frame glow ── */
        radialGlow(c,cx,gy-bH*0.50,32,220,170,40,0.18);
        radialGlow(c,cx,gy-bH,18,240,180,50,0.28);
        c.fillStyle='rgba(255,220,80,0.90)';
        c.beginPath(); c.arc(cx,gy-bH,2.5,0,Math.PI*2); c.fill();
        radialGlow(c,cx,gy-bH,14,255,210,80,0.25);
    }

    /* ══════════════════════════════════════════════
       PARIS LANDMARKS  (warm wrought iron / cream limestone / romantic palette)
    ══════════════════════════════════════════════ */
    function drawEiffelTower(c, cx, gy) {
        var bH = H * 0.70;
        var iron = '#7a5c30', ironD = '#52380e', ironL = '#a07840', ironHL = '#c09848';

        /* golden ground uplights */
        radialGlow(c, cx, gy, 100, 255, 180, 60, 0.20);
        radialGlow(c, cx - 58, gy - 2, 42, 255, 160, 40, 0.16);
        radialGlow(c, cx + 58, gy - 2, 42, 255, 160, 40, 0.16);

        /* ── CURVING BASE LEGS (catenary shape) ── */
        c.strokeStyle = iron; c.lineWidth = 4;
        /* front-left leg */
        c.beginPath(); c.moveTo(cx - 66, gy); c.bezierCurveTo(cx - 66, gy - bH * 0.08, cx - 16, gy - bH * 0.36, cx - 13, gy - bH * 0.46); c.stroke();
        /* front-right leg */
        c.beginPath(); c.moveTo(cx + 66, gy); c.bezierCurveTo(cx + 66, gy - bH * 0.08, cx + 16, gy - bH * 0.36, cx + 13, gy - bH * 0.46); c.stroke();
        /* rear-left leg (slightly thinner / darker) */
        c.strokeStyle = ironD; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(cx - 48, gy - 3); c.bezierCurveTo(cx - 48, gy - bH * 0.06, cx - 10, gy - bH * 0.34, cx - 8, gy - bH * 0.44); c.stroke();
        /* rear-right leg */
        c.beginPath(); c.moveTo(cx + 48, gy - 3); c.bezierCurveTo(cx + 48, gy - bH * 0.06, cx + 10, gy - bH * 0.34, cx + 8, gy - bH * 0.44); c.stroke();

        /* iconic parabolic arch between front legs at ground */
        c.strokeStyle = ironL; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx - 66, gy); c.quadraticCurveTo(cx, gy - bH * 0.34, cx + 66, gy); c.stroke();
        /* inner arch */
        c.strokeStyle = 'rgba(160,120,64,0.45)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 52, gy - 2); c.quadraticCurveTo(cx, gy - bH * 0.27, cx + 52, gy - 2); c.stroke();

        /* ── LOWER SECTION DENSE LATTICE (ground → first floor) ── */
        /* horizontal girder rings */
        c.strokeStyle = ironD; c.lineWidth = 1.4;
        for (var hg = 1; hg <= 7; hg++) {
            var hgf = hg / 8;
            var hgw = 66 * (1 - hgf * 0.80);
            c.beginPath(); c.moveTo(cx - hgw, gy - bH * 0.46 * hgf); c.lineTo(cx + hgw, gy - bH * 0.46 * hgf); c.stroke();
        }
        /* X-cross diagonals in each panel */
        c.strokeStyle = 'rgba(120,88,40,0.58)'; c.lineWidth = 1.0;
        for (var ld = 0; ld < 8; ld++) {
            var ldf = ld / 8, ldf2 = (ld + 1) / 8;
            var lw1 = 66 * (1 - ldf * 0.80), lw2 = 66 * (1 - ldf2 * 0.80);
            var ly1 = gy - bH * 0.46 * ldf, ly2 = gy - bH * 0.46 * ldf2;
            c.beginPath(); c.moveTo(cx - lw1, ly1); c.lineTo(cx + lw2, ly2); c.stroke();
            c.beginPath(); c.moveTo(cx + lw1, ly1); c.lineTo(cx - lw2, ly2); c.stroke();
            /* secondary V-diagonals */
            c.strokeStyle = 'rgba(120,88,40,0.32)'; c.lineWidth = 0.7;
            var mx = (lw1 + lw2) * 0.5;
            c.beginPath(); c.moveTo(cx - lw1, ly1); c.lineTo(cx - mx * 0.5, (ly1 + ly2) * 0.5); c.stroke();
            c.beginPath(); c.moveTo(cx + lw1, ly1); c.lineTo(cx + mx * 0.5, (ly1 + ly2) * 0.5); c.stroke();
            c.strokeStyle = 'rgba(120,88,40,0.58)'; c.lineWidth = 1.0;
        }
        /* vertical struts */
        c.strokeStyle = 'rgba(100,70,28,0.40)'; c.lineWidth = 0.6;
        for (var vs = -3; vs <= 3; vs++) {
            var vx = cx + vs * 18;
            if (Math.abs(vs) > 0) { c.beginPath(); c.moveTo(vx, gy); c.lineTo(vx * 0.5 + cx * 0.5, gy - bH * 0.40); c.stroke(); }
        }

        /* ── FIRST FLOOR (57 m) ── */
        var f1Y = gy - bH * 0.46;
        c.fillStyle = iron; c.strokeStyle = ironD; c.lineWidth = 1.5;
        c.fillRect(cx - 22, f1Y - 8, 44, 12); c.strokeRect(cx - 22, f1Y - 8, 44, 12);
        /* observation railing lines */
        c.strokeStyle = ironL; c.lineWidth = 0.9;
        c.beginPath(); c.moveTo(cx - 24, f1Y - 2); c.lineTo(cx + 24, f1Y - 2); c.stroke();
        c.beginPath(); c.moveTo(cx - 24, f1Y + 3); c.lineTo(cx + 24, f1Y + 3); c.stroke();
        /* balustrade posts */
        for (var bp = -4; bp <= 4; bp++) { c.beginPath(); c.moveTo(cx + bp * 5, f1Y - 8); c.lineTo(cx + bp * 5, f1Y + 4); c.stroke(); }
        /* restaurant amber glow */
        radialGlow(c, cx, f1Y - 2, 38, 255, 200, 100, 0.30);
        c.fillStyle = 'rgba(255,200,80,0.55)';
        for (var fw1 = -3; fw1 <= 3; fw1++) { c.fillRect(cx + fw1 * 6 - 2, f1Y - 6, 4, 8); }

        /* ── MIDDLE SECTION (first → second floor) ── */
        /* main chords */
        c.strokeStyle = iron; c.lineWidth = 3;
        c.beginPath(); c.moveTo(cx - 14, f1Y); c.lineTo(cx - 3, gy - bH * 0.74); c.stroke();
        c.beginPath(); c.moveTo(cx + 14, f1Y); c.lineTo(cx + 3, gy - bH * 0.74); c.stroke();
        /* middle lattice */
        c.strokeStyle = 'rgba(120,88,40,0.52)'; c.lineWidth = 0.9;
        for (var ms = 0; ms < 7; ms++) {
            var mf1 = ms / 7, mf2 = (ms + 1) / 7;
            var mw1 = 14 * (1 - mf1 * 0.78), mw2 = 14 * (1 - mf2 * 0.78);
            var my1 = f1Y - bH * 0.28 * mf1, my2 = f1Y - bH * 0.28 * mf2;
            c.beginPath(); c.moveTo(cx - mw1, my1); c.lineTo(cx + mw2, my2); c.stroke();
            c.beginPath(); c.moveTo(cx + mw1, my1); c.lineTo(cx - mw2, my2); c.stroke();
            c.strokeStyle = 'rgba(100,70,28,0.32)'; c.lineWidth = 0.6;
            c.beginPath(); c.moveTo(cx - mw1, my1); c.lineTo(cx + mw1, my1); c.stroke();
            c.strokeStyle = 'rgba(120,88,40,0.52)'; c.lineWidth = 0.9;
        }

        /* ── SECOND FLOOR (115 m) ── */
        var f2Y = gy - bH * 0.74;
        c.fillStyle = iron; c.strokeStyle = ironD; c.lineWidth = 1.3;
        c.fillRect(cx - 13, f2Y - 6, 26, 9); c.strokeRect(cx - 13, f2Y - 6, 26, 9);
        /* balcony rail */
        c.strokeStyle = ironL; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 15, f2Y - 1); c.lineTo(cx + 15, f2Y - 1); c.stroke();
        for (var bp2 = -3; bp2 <= 3; bp2++) { c.beginPath(); c.moveTo(cx + bp2 * 4.5, f2Y - 6); c.lineTo(cx + bp2 * 4.5, f2Y + 3); c.stroke(); }
        radialGlow(c, cx, f2Y - 2, 26, 255, 190, 90, 0.32);
        c.fillStyle = 'rgba(255,195,75,0.58)';
        for (var fw2 = -2; fw2 <= 2; fw2++) { c.fillRect(cx + fw2 * 5 - 2, f2Y - 5, 4, 7); }

        /* ── UPPER SECTION (second → third floor) ── */
        c.strokeStyle = iron; c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(cx - 11, f2Y); c.lineTo(cx - 3, gy - bH * 0.88); c.stroke();
        c.beginPath(); c.moveTo(cx + 11, f2Y); c.lineTo(cx + 3, gy - bH * 0.88); c.stroke();
        c.strokeStyle = 'rgba(120,88,40,0.50)'; c.lineWidth = 0.9;
        for (var us = 0; us < 5; us++) {
            var uf1 = us / 5, uf2 = (us + 1) / 5;
            var uw1 = 11 * (1 - uf1 * 0.72), uw2 = 11 * (1 - uf2 * 0.72);
            var uy1 = f2Y - bH * 0.14 * uf1, uy2 = f2Y - bH * 0.14 * uf2;
            c.beginPath(); c.moveTo(cx - uw1, uy1); c.lineTo(cx + uw2, uy2); c.stroke();
            c.beginPath(); c.moveTo(cx + uw1, uy1); c.lineTo(cx - uw2, uy2); c.stroke();
            c.strokeStyle = 'rgba(100,70,28,0.30)'; c.lineWidth = 0.6;
            c.beginPath(); c.moveTo(cx - uw1, uy1); c.lineTo(cx + uw1, uy1); c.stroke();
            c.strokeStyle = 'rgba(120,88,40,0.50)'; c.lineWidth = 0.9;
        }

        /* ── THIRD FLOOR (276 m) ── */
        var f3Y = gy - bH * 0.88;
        c.fillStyle = iron; c.strokeStyle = ironD; c.lineWidth = 1.2;
        c.fillRect(cx - 6, f3Y - 5, 12, 7); c.strokeRect(cx - 6, f3Y - 5, 12, 7);
        radialGlow(c, cx, f3Y - 2, 20, 255, 180, 80, 0.38);
        /* railing */
        for (var bp3 = -2; bp3 <= 2; bp3++) { c.beginPath(); c.moveTo(cx + bp3 * 3, f3Y - 5); c.lineTo(cx + bp3 * 3, f3Y + 2); c.stroke(); }

        /* ── TAPERING MAST above third floor ── */
        c.strokeStyle = iron; c.lineWidth = 2.8;
        c.beginPath(); c.moveTo(cx - 5, f3Y); c.lineTo(cx, gy - bH * 0.97); c.stroke();
        c.beginPath(); c.moveTo(cx + 5, f3Y); c.lineTo(cx, gy - bH * 0.97); c.stroke();
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx, gy - bH * 0.97); c.lineTo(cx, gy - bH * 1.02); c.stroke();

        /* radio antennae */
        c.strokeStyle = '#c0b0a0'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(cx, gy - bH * 1.02); c.lineTo(cx, gy - bH * 1.09); c.stroke();
        c.strokeStyle = '#a09080'; c.lineWidth = 1.5;
        /* antenna guywires */
        c.strokeStyle = 'rgba(160,140,100,0.35)'; c.lineWidth = 0.7;
        c.beginPath(); c.moveTo(cx, gy - bH * 1.06); c.lineTo(cx - 5, gy - bH * 1.01); c.stroke();
        c.beginPath(); c.moveTo(cx, gy - bH * 1.06); c.lineTo(cx + 5, gy - bH * 1.01); c.stroke();

        /* ── BEACON + ROTATING LIGHT ── */
        var beaconY = gy - bH * 1.09;
        radialGlow(c, cx, beaconY, 40, 255, 230, 80, 0.55);
        radialGlow(c, cx, beaconY, 18, 255, 255, 180, 0.65);
        c.fillStyle = '#fffff8'; c.beginPath(); c.arc(cx, beaconY, 3.8, 0, Math.PI * 2); c.fill();

        /* LED light ring at second floor level */
        c.strokeStyle = 'rgba(255,220,60,0.35)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 13, f2Y - 3); c.lineTo(cx + 13, f2Y - 3); c.stroke();

        /* golden uplights at base corner piers */
        for (var ul = -1; ul <= 1; ul += 2) {
            c.fillStyle = ironHL;
            c.fillRect(cx + ul * 68 - 4, gy - 6, 8, 10);
            radialGlow(c, cx + ul * 65, gy - 3, 28, 255, 200, 80, 0.20);
        }
    }
    function drawArcDeTriomphe(c, cx, gy) {
        var bH = H * 0.30;
        var lime2 = '#e0d4a8', limeD2 = '#b8a870', limeL2 = '#f0e8c0', limeSh = '#a89060';

        radialGlow(c, cx, gy, 90, 255, 220, 160, 0.18);

        /* ── WIDE LIMESTONE BASE ── */
        c.fillStyle = limeD2; c.strokeStyle = '#988050'; c.lineWidth = 1;
        c.fillRect(cx - 42, gy - bH * 0.06, 84, bH * 0.06); c.strokeRect(cx - 42, gy - bH * 0.06, 84, bH * 0.06);

        /* main block */
        c.fillStyle = lime2; c.strokeStyle = limeD2; c.lineWidth = 1;
        c.fillRect(cx - 40, gy - bH, 80, bH * 0.94); c.strokeRect(cx - 40, gy - bH, 80, bH * 0.94);

        /* deep stone courses */
        c.strokeStyle = 'rgba(150,120,70,0.28)'; c.lineWidth = 0.6;
        for (var sc4 = 1; sc4 < 10; sc4++) {
            var scy4 = gy - bH * sc4 * 0.095;
            c.beginPath(); c.moveTo(cx - 40, scy4); c.lineTo(cx + 40, scy4); c.stroke();
        }

        /* MAIN CENTRAL ARCH — tall round arch */
        c.fillStyle = '#080808';
        c.beginPath(); c.arc(cx, gy - bH * 0.47, 25, Math.PI, 0, false);
        c.rect(cx - 25, gy - bH * 0.47, 50, bH * 0.47); c.fill();
        /* arch intrados moulding */
        c.strokeStyle = limeD2; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, gy - bH * 0.47, 27, Math.PI, 0, false); c.stroke();
        c.beginPath(); c.arc(cx, gy - bH * 0.47, 23, Math.PI, 0, false); c.stroke();

        /* TWO FLANKING SMALLER ARCHES */
        for (var sa = -1; sa <= 1; sa += 2) {
            var sax = cx + sa * 30;
            c.fillStyle = '#080808';
            c.beginPath(); c.arc(sax, gy - bH * 0.34, 11, Math.PI, 0, false);
            c.rect(sax - 11, gy - bH * 0.34, 22, bH * 0.34); c.fill();
            /* arch moulding */
            c.strokeStyle = limeD2; c.lineWidth = 0.8;
            c.beginPath(); c.arc(sax, gy - bH * 0.34, 13, Math.PI, 0, false); c.stroke();
        }

        /* ATTIC ZONE — inscription band */
        c.fillStyle = limeL2; c.strokeStyle = limeD2; c.lineWidth = 0.8;
        c.fillRect(cx - 40, gy - bH * 0.96, 80, bH * 0.16); c.strokeRect(cx - 40, gy - bH * 0.96, 80, bH * 0.16);
        /* inscription lines */
        c.strokeStyle = 'rgba(160,130,80,0.45)'; c.lineWidth = 0.7;
        for (var il = 0; il < 3; il++) { c.beginPath(); c.moveTo(cx - 32, gy - bH * 0.91 + il * bH * 0.04); c.lineTo(cx + 32, gy - bH * 0.91 + il * bH * 0.04); c.stroke(); }

        /* FOUR CORNER PILASTERS */
        for (var cp = -1; cp <= 1; cp += 2) {
            c.fillStyle = limeD2; c.strokeStyle = limeSh; c.lineWidth = 1;
            c.fillRect(cx + cp * 40 - cp * 7, gy - bH, 7, bH * 0.94); c.strokeRect(cx + cp * 40 - cp * 7, gy - bH, 7, bH * 0.94);
            /* capital at top */
            c.fillStyle = limeL2;
            c.fillRect(cx + cp * 40 - cp * 8, gy - bH, 9, 5);
        }

        /* RELIEF SCULPTURE PANELS — four high-relief panels
           Left: "La Marseillaise" (Rude's famous group) */
        var panels = [
            { x: cx - 32, w: 12, label: 'MARS' },
            { x: cx + 20, w: 12, label: 'TRPH' }
        ];
        for (var pn = 0; pn < panels.length; pn++) {
            var pnx = panels[pn].x, pnw = panels[pn].w;
            c.fillStyle = 'rgba(200,165,100,0.22)'; c.fillRect(pnx, gy - bH * 0.90, pnw, bH * 0.44);
            c.strokeStyle = limeSh; c.lineWidth = 0.6; c.strokeRect(pnx, gy - bH * 0.90, pnw, bH * 0.44);
            /* figure group — simplified sculptural relief */
            c.fillStyle = 'rgba(180,145,80,0.42)';
            /* winged figure at top */
            c.beginPath(); c.arc(pnx + pnw * 0.5, gy - bH * 0.80, 3.5, 0, Math.PI * 2); c.fill();
            c.fillRect(pnx + pnw * 0.5 - 2, gy - bH * 0.77, 4, 12);
            /* wing suggestion */
            c.strokeStyle = 'rgba(180,145,80,0.50)'; c.lineWidth = 0.8;
            c.beginPath(); c.moveTo(pnx + pnw * 0.5 - 2, gy - bH * 0.78); c.lineTo(pnx + 1, gy - bH * 0.75); c.stroke();
            c.beginPath(); c.moveTo(pnx + pnw * 0.5 + 2, gy - bH * 0.78); c.lineTo(pnx + pnw - 1, gy - bH * 0.75); c.stroke();
            /* soldiers below */
            for (var fig = 0; fig < 3; fig++) {
                var figx = pnx + 2 + fig * 3.8;
                c.fillStyle = 'rgba(170,135,72,0.40)';
                c.beginPath(); c.arc(figx, gy - bH * 0.64, 1.8, 0, Math.PI * 2); c.fill();
                c.fillRect(figx - 1.2, gy - bH * 0.62, 2.4, 9);
                /* sword/spear */
                c.strokeStyle = 'rgba(200,160,80,0.50)'; c.lineWidth = 0.7;
                c.beginPath(); c.moveTo(figx + 2, gy - bH * 0.62); c.lineTo(figx + 5, gy - bH * 0.68); c.stroke();
            }
        }

        /* CORNICE at very top */
        c.fillStyle = limeL2; c.strokeStyle = limeD2; c.lineWidth = 1;
        c.fillRect(cx - 42, gy - bH, 84, 6); c.strokeRect(cx - 42, gy - bH, 84, 6);
        /* corona moulding */
        c.fillStyle = 'rgba(240,230,190,0.35)'; c.fillRect(cx - 42, gy - bH, 84, 2);

        /* TOP ATTIC inscription text suggestion */
        c.strokeStyle = 'rgba(150,120,70,0.50)'; c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(cx - 20, gy - bH * 0.985); c.lineTo(cx + 20, gy - bH * 0.985); c.stroke();

        /* ── ETERNAL FLAME (Tomb of Unknown Soldier) ── */
        /* stone slab */
        c.fillStyle = limeD2; c.strokeStyle = limeSh; c.lineWidth = 0.8;
        c.fillRect(cx - 10, gy - bH * 0.08, 20, 5); c.strokeRect(cx - 10, gy - bH * 0.08, 20, 5);
        /* flame */
        radialGlow(c, cx, gy - bH * 0.11, 22, 255, 140, 30, 0.55);
        radialGlow(c, cx, gy - bH * 0.12, 10, 255, 220, 80, 0.65);
        c.fillStyle = '#ff7010'; c.beginPath(); c.arc(cx, gy - bH * 0.11, 3.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffe050'; c.beginPath(); c.arc(cx, gy - bH * 0.13, 1.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, gy - bH * 0.14, 0.8, 0, Math.PI * 2); c.fill();

        /* uplights at base */
        radialGlow(c, cx - 30, gy - 4, 30, 255, 210, 120, 0.18);
        radialGlow(c, cx + 30, gy - 4, 30, 255, 210, 120, 0.18);
    }
    function drawNotreDame(c, cx, gy) {
        var bH = H * 0.36;
        var stone2 = '#9a9282', stoneD2 = '#726a5a', stoneL2 = '#b8b0a0', stoneHL = '#c8c0b0';

        radialGlow(c, cx, gy, 100, 180, 160, 220, 0.14);

        /* ── ÎLE DE LA CITÉ — Seine island shimmer ── */
        c.fillStyle = 'rgba(14,28,52,0.30)'; c.fillRect(cx - 70, gy - bH * 0.03, 140, bH * 0.03);
        c.strokeStyle = 'rgba(40,80,140,0.20)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 70, gy - bH * 0.015); c.lineTo(cx + 70, gy - bH * 0.015); c.stroke();

        /* ── NAVE BODY ── */
        c.fillStyle = stone2; c.strokeStyle = stoneD2; c.lineWidth = 1;
        c.fillRect(cx - 55, gy - bH * 0.60, 110, bH * 0.57); c.strokeRect(cx - 55, gy - bH * 0.60, 110, bH * 0.57);
        /* vertical buttress ribs on nave */
        c.strokeStyle = 'rgba(100,90,70,0.35)'; c.lineWidth = 1;
        for (var nvb = -4; nvb <= 4; nvb++) { c.beginPath(); c.moveTo(cx + nvb * 12, gy); c.lineTo(cx + nvb * 12, gy - bH * 0.60); c.stroke(); }

        /* ── DENSE FLYING BUTTRESSES ── */
        for (var fb = -3; fb <= 3; fb++) {
            var fbx = cx + fb * 17;
            /* outer pier column */
            c.fillStyle = stoneD2; c.fillRect(fbx - 2, gy, 5, -bH * 0.22);
            /* upper flying arc */
            c.strokeStyle = 'rgba(110,100,80,0.55)'; c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(fbx + 2, gy - bH * 0.22); c.quadraticCurveTo(fbx - 5, gy - bH * 0.44, cx + fb * 12, gy - bH * 0.46); c.stroke();
            /* lower flying arc */
            c.lineWidth = 1;
            c.beginPath(); c.moveTo(fbx + 2, gy - bH * 0.16); c.quadraticCurveTo(fbx - 4, gy - bH * 0.34, cx + fb * 12, gy - bH * 0.36); c.stroke();
            /* pinnacle on outer pier */
            c.fillStyle = stoneL2;
            c.beginPath(); c.moveTo(fbx - 2, gy - bH * 0.22); c.lineTo(fbx + 1.5, gy - bH * 0.26); c.lineTo(fbx + 5, gy - bH * 0.22); c.closePath(); c.fill();
        }

        /* ── WEST FACADE — three portals + Gallery of Kings ── */
        /* Gallery of Kings — 28 statues band */
        c.fillStyle = stoneL2; c.strokeStyle = stoneD2; c.lineWidth = 0.8;
        c.fillRect(cx - 55, gy - bH * 0.66, 110, bH * 0.06); c.strokeRect(cx - 55, gy - bH * 0.66, 110, bH * 0.06);
        /* king statue silhouettes */
        c.fillStyle = 'rgba(180,170,150,0.55)';
        for (var kg = -6; kg <= 6; kg++) {
            var kgx = cx + kg * 8.5;
            c.beginPath(); c.arc(kgx, gy - bH * 0.67, 2, 0, Math.PI * 2); c.fill();
            c.fillRect(kgx - 1.5, gy - bH * 0.65, 3, 6);
        }

        /* Three main portal doorways */
        c.fillStyle = '#0a0806';
        /* centre portal — pointed Gothic arch */
        c.beginPath();
        c.moveTo(cx - 10, gy - bH * 0.37);
        c.lineTo(cx - 10, gy - bH * 0.50);
        c.quadraticCurveTo(cx - 10, gy - bH * 0.57, cx, gy - bH * 0.58);
        c.quadraticCurveTo(cx + 10, gy - bH * 0.57, cx + 10, gy - bH * 0.50);
        c.lineTo(cx + 10, gy - bH * 0.37); c.closePath(); c.fill();
        /* flanking portals */
        for (var sp3 = -1; sp3 <= 1; sp3 += 2) {
            var spx3 = cx + sp3 * 30;
            c.beginPath();
            c.moveTo(spx3 - 7, gy - bH * 0.28);
            c.lineTo(spx3 - 7, gy - bH * 0.40);
            c.quadraticCurveTo(spx3 - 7, gy - bH * 0.46, spx3, gy - bH * 0.47);
            c.quadraticCurveTo(spx3 + 7, gy - bH * 0.46, spx3 + 7, gy - bH * 0.40);
            c.lineTo(spx3 + 7, gy - bH * 0.28); c.closePath(); c.fill();
        }
        /* portal moulding archivolts */
        c.strokeStyle = stoneD2; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 12, gy - bH * 0.37); c.quadraticCurveTo(cx - 12, gy - bH * 0.60, cx, gy - bH * 0.61); c.quadraticCurveTo(cx + 12, gy - bH * 0.60, cx + 12, gy - bH * 0.37); c.stroke();
        c.beginPath(); c.moveTo(cx - 14, gy - bH * 0.37); c.quadraticCurveTo(cx - 14, gy - bH * 0.62, cx, gy - bH * 0.63); c.quadraticCurveTo(cx + 14, gy - bH * 0.62, cx + 14, gy - bH * 0.37); c.stroke();

        /* ── TWIN TOWERS ── */
        for (var tw2 = -1; tw2 <= 1; tw2 += 2) {
            var twx = cx + tw2 * 40;
            c.fillStyle = stone2; c.strokeStyle = stoneD2; c.lineWidth = 1;
            c.fillRect(twx - 12, gy - bH * 0.98, 24, bH * 0.38); c.strokeRect(twx - 12, gy - bH * 0.98, 24, bH * 0.38);
            /* tower stone courses */
            c.strokeStyle = 'rgba(100,90,70,0.28)'; c.lineWidth = 0.5;
            for (var tc3 = 1; tc3 < 6; tc3++) { c.beginPath(); c.moveTo(twx - 12, gy - bH * (0.60 + tc3 * 0.06)); c.lineTo(twx + 12, gy - bH * (0.60 + tc3 * 0.06)); c.stroke(); }
            /* twin tower lancet windows */
            c.fillStyle = '#0a0806';
            for (var tw3 = 0; tw3 < 4; tw3++) {
                var twy2 = gy - bH * (0.66 + tw3 * 0.08);
                c.fillRect(twx - 5, twy2, 10, 14);
                c.beginPath(); c.moveTo(twx - 5, twy2); c.lineTo(twx, twy2 - 6); c.lineTo(twx + 5, twy2); c.closePath(); c.fill();
                if (tw3 < 2) radialGlow(c, twx, twy2 + 6, 6, 255, 200, 80, 0.14);
            }
            /* tower top arcade belfry */
            c.strokeStyle = 'rgba(100,90,70,0.45)'; c.lineWidth = 0.8;
            for (var bl2 = -1; bl2 <= 1; bl2++) { c.beginPath(); c.moveTo(twx + bl2 * 6, gy - bH * 0.98); c.lineTo(twx + bl2 * 6, gy - bH * 0.96); c.stroke(); }
            /* crenellated parapet */
            c.fillStyle = stone2;
            for (var cr2 = -2; cr2 <= 2; cr2++) { c.fillRect(twx + cr2 * 5 - 2, gy - bH * 0.98, 4, 5); }
        }

        /* ── GREAT ROSE WINDOW ── */
        var rwY = gy - bH * 0.76;
        radialGlow(c, cx, rwY, 36, 120, 60, 220, 0.42);
        radialGlow(c, cx, rwY, 22, 200, 100, 255, 0.50);
        /* outer ring */
        c.strokeStyle = stoneD2; c.lineWidth = 1.2;
        c.beginPath(); c.arc(cx, rwY, 18, 0, Math.PI * 2); c.stroke();
        /* stone tracery rings */
        c.beginPath(); c.arc(cx, rwY, 12, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, rwY, 6, 0, Math.PI * 2); c.stroke();
        /* radial tracery spokes */
        c.strokeStyle = 'rgba(100,70,140,0.60)'; c.lineWidth = 0.8;
        for (var rsp = 0; rsp < 12; rsp++) {
            var rspa = rsp * Math.PI / 6;
            c.beginPath(); c.moveTo(cx + Math.cos(rspa) * 6, rwY + Math.sin(rspa) * 6);
            c.lineTo(cx + Math.cos(rspa) * 18, rwY + Math.sin(rspa) * 18); c.stroke();
        }
        /* oculus jewel */
        c.fillStyle = 'rgba(140,80,220,0.40)'; c.beginPath(); c.arc(cx, rwY, 5, 0, Math.PI * 2); c.fill();

        /* ── REBUILT OCTAGONAL SPIRE (2024 reconstruction, copper) ── */
        var spireBase = gy - bH * 0.60;
        c.fillStyle = '#4a7050'; c.strokeStyle = '#3a5840'; c.lineWidth = 1;
        /* spire shaft — octagonal */
        c.beginPath();
        c.moveTo(cx - 8, spireBase);
        c.lineTo(cx - 6, gy - bH * 0.78);
        c.lineTo(cx - 3, gy - bH * 0.88);
        c.lineTo(cx, gy - bH);
        c.lineTo(cx + 3, gy - bH * 0.88);
        c.lineTo(cx + 6, gy - bH * 0.78);
        c.lineTo(cx + 8, spireBase);
        c.closePath(); c.fill(); c.stroke();
        /* spire highlight */
        c.strokeStyle = '#6a9070'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 1, spireBase); c.lineTo(cx, gy - bH); c.stroke();
        /* crockets */
        c.fillStyle = '#3a5840';
        for (var crk = 1; crk < 4; crk++) {
            var crkf = crk / 4;
            c.fillRect(cx - 6 * (1 - crkf) - 2, gy - bH * (0.60 + 0.40 * crkf) - 2, 4, 4);
            c.fillRect(cx + 6 * (1 - crkf) - 2, gy - bH * (0.60 + 0.40 * crkf) - 2, 4, 4);
        }
        /* golden cockerel weathervane at tip */
        radialGlow(c, cx, gy - bH, 12, 255, 220, 100, 0.35);
        c.fillStyle = '#d4a830'; c.beginPath(); c.arc(cx, gy - bH, 2.5, 0, Math.PI * 2); c.fill();
    }

    /* ══════════════════════════════════════════════
       PRAGUE LANDMARKS  (vivid ochre / terracotta / medieval palette)
    ══════════════════════════════════════════════ */
    function drawPragueCastle(c, cx, gy) {
        var bH = H * 0.46;
        var ochre = '#d4a840', ochreD = '#a87e1c', ochreL = '#f0c860';
        var terra = '#9a3022', terraD = '#722210', terraL = '#c05030';
        var stone5 = '#a09880', stoneD5 = '#787060';
        var dark7 = '#0c0a08';

        radialGlow(c, cx, gy, 120, 255, 200, 100, 0.14);

        /* ── HRADČANY HILL ── */
        c.fillStyle = '#3a3520'; c.strokeStyle = '#2a2510'; c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(cx - 90, gy); c.lineTo(cx - 90, gy - bH * 0.18);
        c.quadraticCurveTo(cx - 70, gy - bH * 0.28, cx - 40, gy - bH * 0.30);
        c.lineTo(cx + 40, gy - bH * 0.30);
        c.quadraticCurveTo(cx + 70, gy - bH * 0.28, cx + 90, gy - bH * 0.18);
        c.lineTo(cx + 90, gy); c.closePath(); c.fill(); c.stroke();

        /* Rampart wall with battlements */
        c.fillStyle = stone5; c.strokeStyle = stoneD5; c.lineWidth = 1;
        c.fillRect(cx - 88, gy - bH * 0.34, 176, bH * 0.04); c.strokeRect(cx - 88, gy - bH * 0.34, 176, bH * 0.04);
        /* Merlons (battlements) */
        c.fillStyle = stone5;
        for (var bm3 = -11; bm3 <= 11; bm3++) { c.fillRect(cx + bm3 * 8 - 3, gy - bH * 0.34 - 7, 5, 7); }

        /* ── OLD ROYAL PALACE WING ── */
        c.fillStyle = ochre; c.strokeStyle = ochreD; c.lineWidth = 1;
        c.fillRect(cx - 80, gy - bH * 0.56, 160, bH * 0.22); c.strokeRect(cx - 80, gy - bH * 0.56, 160, bH * 0.22);
        /* window arcade — arched windows */
        c.fillStyle = dark7;
        for (var pw = -6; pw <= 6; pw++) {
            var pwx = cx + pw * 11;
            c.fillRect(pwx - 3, gy - bH * 0.52, 6, 11);
            c.beginPath(); c.arc(pwx, gy - bH * 0.52, 3, Math.PI, 0, false); c.fill();
            if (Math.abs(pw) <= 4) radialGlow(c, pwx, gy - bH * 0.48, 7, 255, 220, 150, 0.16);
        }
        /* Mansard / pitched roof with dormer windows */
        c.fillStyle = terra; c.strokeStyle = terraD; c.lineWidth = 1;
        c.fillRect(cx - 82, gy - bH * 0.62, 164, bH * 0.06); c.strokeRect(cx - 82, gy - bH * 0.62, 164, bH * 0.06);
        /* dormers */
        c.fillStyle = ochreD;
        for (var dm = -4; dm <= 4; dm += 2) {
            c.beginPath(); c.moveTo(cx + dm * 18 - 7, gy - bH * 0.62); c.lineTo(cx + dm * 18, gy - bH * 0.68); c.lineTo(cx + dm * 18 + 7, gy - bH * 0.62); c.closePath(); c.fill();
            c.fillStyle = dark7; c.fillRect(cx + dm * 18 - 3, gy - bH * 0.65, 6, 5);
            c.fillStyle = ochreD;
        }
        /* ornamental urns on roofline */
        c.fillStyle = stoneD5;
        for (var urn = -5; urn <= 5; urn += 2) { c.beginPath(); c.arc(cx + urn * 15, gy - bH * 0.62, 2, 0, Math.PI * 2); c.fill(); c.fillRect(cx + urn * 15 - 1.5, gy - bH * 0.62, 3, 4); }

        /* ── ST. GEORGE BASILICA (Romanesque) — right side ── */
        c.fillStyle = stone5; c.strokeStyle = stoneD5; c.lineWidth = 1;
        c.fillRect(cx + 42, gy - bH * 0.54, 36, bH * 0.20); c.strokeRect(cx + 42, gy - bH * 0.54, 36, bH * 0.20);
        /* twin Romanesque towers */
        for (var rt = -1; rt <= 1; rt += 2) {
            var rtx = cx + 60 + rt * 12;
            c.fillRect(rtx - 5, gy - bH * 0.70, 10, bH * 0.16); c.strokeRect(rtx - 5, gy - bH * 0.70, 10, bH * 0.16);
            c.fillStyle = terra;
            c.beginPath(); c.arc(rtx, gy - bH * 0.70, 6, Math.PI, 0, false); c.fill();
            c.strokeStyle = terraD; c.stroke();
            c.fillStyle = stone5; c.strokeStyle = stoneD5;
            /* round Romanesque windows */
            c.fillStyle = dark7; c.beginPath(); c.arc(rtx, gy - bH * 0.64, 3, 0, Math.PI * 2); c.fill();
        }

        /* ── ST. VITUS CATHEDRAL — the crown jewel ── */
        /* Cathedral nave body */
        c.fillStyle = '#787268'; c.strokeStyle = '#504840'; c.lineWidth = 1;
        c.fillRect(cx - 34, gy - bH * 0.76, 68, bH * 0.44); c.strokeRect(cx - 34, gy - bH * 0.76, 68, bH * 0.44);
        /* Cathedral flying buttresses */
        c.strokeStyle = 'rgba(90,80,60,0.50)'; c.lineWidth = 1;
        for (var cfb = -3; cfb <= 3; cfb++) {
            var cfbx = cx + cfb * 10;
            c.beginPath(); c.moveTo(cfbx + 3, gy - bH * 0.54); c.quadraticCurveTo(cfbx - 4, gy - bH * 0.68, cfbx - 2, gy - bH * 0.70); c.stroke();
        }
        /* Rose window of cathedral */
        var rwY2 = gy - bH * 0.82;
        radialGlow(c, cx, rwY2, 22, 140, 80, 220, 0.40);
        c.strokeStyle = '#504840'; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, rwY2, 14, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, rwY2, 8, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = 'rgba(120,80,180,0.55)'; c.lineWidth = 0.7;
        for (var rws = 0; rws < 8; rws++) {
            var rwsa = rws * Math.PI / 4;
            c.beginPath(); c.moveTo(cx + Math.cos(rwsa) * 8, rwY2 + Math.sin(rwsa) * 8);
            c.lineTo(cx + Math.cos(rwsa) * 14, rwY2 + Math.sin(rwsa) * 14); c.stroke();
        }
        /* Cathedral windows */
        c.fillStyle = dark7;
        for (var cw = -2; cw <= 2; cw++) {
            var cwx = cx + cw * 14;
            c.fillRect(cwx - 4, gy - bH * 0.70, 8, 16);
            c.beginPath(); c.moveTo(cwx - 4, gy - bH * 0.70); c.lineTo(cwx, gy - bH * 0.75); c.lineTo(cwx + 4, gy - bH * 0.70); c.closePath(); c.fill();
            if (Math.abs(cw) <= 1) radialGlow(c, cwx, gy - bH * 0.65, 8, 140, 80, 220, 0.22);
        }

        /* TWIN GOTHIC SPIRES of St. Vitus */
        for (var sp2 = -1; sp2 <= 1; sp2 += 2) {
            var spx = cx + sp2 * 24;
            /* tower body */
            c.fillStyle = '#6a6258'; c.strokeStyle = '#484038'; c.lineWidth = 1;
            c.fillRect(spx - 11, gy - bH * 0.97, 22, bH * 0.21); c.strokeRect(spx - 11, gy - bH * 0.97, 22, bH * 0.21);
            /* tower Gothic windows */
            c.fillStyle = dark7;
            for (var spw = 0; spw < 4; spw++) {
                var spwy = gy - bH * (0.78 + spw * 0.05);
                c.fillRect(spx - 4, spwy, 8, 11);
                c.beginPath(); c.moveTo(spx - 4, spwy); c.lineTo(spx, spwy - 5); c.lineTo(spx + 4, spwy); c.closePath(); c.fill();
            }
            /* decorative stone tracery ring below spire */
            c.strokeStyle = '#a09078'; c.lineWidth = 0.8;
            c.beginPath(); c.arc(spx, gy - bH * 0.97, 8, Math.PI, 0, false); c.stroke();
            /* SPIRE — tall and graceful */
            c.fillStyle = '#5a5248'; c.strokeStyle = '#383028'; c.lineWidth = 1;
            c.beginPath();
            c.moveTo(spx - 11, gy - bH * 0.97);
            c.lineTo(spx - 4, gy - bH * 0.99);
            c.lineTo(spx, gy - bH);
            c.lineTo(spx + 4, gy - bH * 0.99);
            c.lineTo(spx + 11, gy - bH * 0.97);
            c.closePath(); c.fill(); c.stroke();
            /* spire crockets */
            for (var spc = 1; spc < 4; spc++) {
                var spcf = spc / 4;
                var spcW = 11 * (1 - spcf);
                c.fillRect(spx - spcW - 2, gy - bH * (0.97 + spcf * 0.03) - 2, 4, 4);
                c.fillRect(spx + spcW - 2, gy - bH * (0.97 + spcf * 0.03) - 2, 4, 4);
            }
            /* gold cross finial */
            radialGlow(c, spx, gy - bH, 12, 220, 180, 60, 0.25);
            c.fillStyle = '#d4a820'; c.beginPath(); c.arc(spx, gy - bH, 2.5, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#e8c040'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(spx, gy - bH - 2.5); c.lineTo(spx, gy - bH - 8); c.stroke();
            c.beginPath(); c.moveTo(spx - 3, gy - bH - 6); c.lineTo(spx + 3, gy - bH - 6); c.stroke();
        }

        /* ── CORNER DEFENSIVE TOWERS ── */
        for (var ct2 = -1; ct2 <= 1; ct2 += 2) {
            var ctX2 = cx + ct2 * 82;
            c.fillStyle = stone5; c.strokeStyle = stoneD5; c.lineWidth = 1;
            c.fillRect(ctX2 - 8, gy - bH * 0.50, 16, bH * 0.50); c.strokeRect(ctX2 - 8, gy - bH * 0.50, 16, bH * 0.50);
            /* tower windows */
            c.fillStyle = dark7;
            for (var ctw = 0; ctw < 3; ctw++) {
                c.fillRect(ctX2 - 3, gy - bH * (0.15 + ctw * 0.12), 6, 9);
                c.beginPath(); c.arc(ctX2, gy - bH * (0.15 + ctw * 0.12), 3, Math.PI, 0, false); c.fill();
            }
            /* conical tower roof */
            c.fillStyle = terra; c.strokeStyle = terraD; c.lineWidth = 1;
            c.beginPath(); c.moveTo(ctX2 - 10, gy - bH * 0.50); c.lineTo(ctX2, gy - bH * 0.60); c.lineTo(ctX2 + 10, gy - bH * 0.50); c.closePath(); c.fill(); c.stroke();
            /* upturned eave tips */
            c.strokeStyle = terraL; c.lineWidth = 1.2;
            c.beginPath(); c.moveTo(ctX2 - 10, gy - bH * 0.50); c.quadraticCurveTo(ctX2 - 16, gy - bH * 0.46, ctX2 - 18, gy - bH * 0.38); c.stroke();
            c.beginPath(); c.moveTo(ctX2 + 10, gy - bH * 0.50); c.quadraticCurveTo(ctX2 + 16, gy - bH * 0.46, ctX2 + 18, gy - bH * 0.38); c.stroke();
            radialGlow(c, ctX2, gy - bH * 0.58, 12, 255, 200, 100, 0.16);
        }

        /* Uplights on cathedral facade */
        radialGlow(c, cx, gy - bH * 0.54, 50, 255, 200, 100, 0.16);
        radialGlow(c, cx - 30, gy - bH * 0.38, 30, 255, 180, 80, 0.12);
        radialGlow(c, cx + 30, gy - bH * 0.38, 30, 255, 180, 80, 0.12);
    }
    function drawCharlesBridge(c, cx, gy) {
        var span2 = W * 0.26;
        var deckY2 = gy - H * 0.058;
        var amber = '#c8922a', amberD = '#9a6e18', amberL = '#e8b840';
        var dark8 = '#0e0a06';

        /* ── VLTAVA RIVER ── */
        c.fillStyle = 'rgba(14,26,52,0.35)'; c.fillRect(cx - span2, gy - H * 0.05, span2 * 2, H * 0.05);
        c.strokeStyle = 'rgba(30,70,140,0.22)'; c.lineWidth = 1;
        for (var rv = 0; rv < 4; rv++) { c.beginPath(); c.moveTo(cx - span2, gy - H * 0.03 + rv * 4); c.lineTo(cx + span2, gy - H * 0.03 + rv * 4); c.stroke(); }
        /* boat reflections on water */
        c.fillStyle = 'rgba(60,50,30,0.28)';
        c.beginPath(); c.ellipse(cx - span2 * 0.4, gy - H * 0.03, 10, 3, 0, 0, Math.PI * 2); c.fill();

        /* ── BRIDGE DECK — Bohemian sandstone ── */
        c.fillStyle = amber; c.strokeStyle = amberD; c.lineWidth = 1;
        c.fillRect(cx - span2, deckY2, span2 * 2, 13); c.strokeRect(cx - span2, deckY2, span2 * 2, 13);
        /* cobble texture suggestion */
        c.strokeStyle = 'rgba(140,100,30,0.25)'; c.lineWidth = 0.5;
        for (var cob = -5; cob <= 5; cob++) { c.beginPath(); c.moveTo(cx + cob * span2 / 5.5, deckY2); c.lineTo(cx + cob * span2 / 5.5, deckY2 + 13); c.stroke(); }

        /* PARAPETS — thick sandstone walls both sides */
        c.fillStyle = amber; c.strokeStyle = amberD; c.lineWidth = 1;
        c.fillRect(cx - span2, deckY2 - 9, span2 * 2, 9); c.strokeRect(cx - span2, deckY2 - 9, span2 * 2, 9);
        /* stone block courses on parapet */
        c.strokeStyle = 'rgba(140,100,30,0.28)'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(cx - span2, deckY2 - 5); c.lineTo(cx + span2, deckY2 - 5); c.stroke();
        c.beginPath(); c.moveTo(cx - span2, deckY2 - 3); c.lineTo(cx + span2, deckY2 - 3); c.stroke();

        /* ── 16 GOTHIC POINTED ARCHES beneath deck ── */
        c.fillStyle = dark8;
        var archCount = 9;
        for (var arch2 = -archCount / 2; arch2 <= archCount / 2; arch2++) {
            var ax2 = cx + arch2 * (span2 * 2 / archCount);
            var archW = span2 / archCount * 0.78;
            c.beginPath(); c.arc(ax2, deckY2 + 13, archW, Math.PI, 0, false);
            c.rect(ax2 - archW, deckY2 + 13, archW * 2, H * 0.04); c.fill();
            /* pier between arches */
            c.fillStyle = amberD;
            c.fillRect(ax2 - 6, deckY2 + 13, 12, H * 0.04 + 4);
            /* cutwater on pier nose */
            c.beginPath(); c.moveTo(ax2 - 4, deckY2 + H * 0.05 + 13); c.lineTo(ax2, deckY2 + H * 0.055 + 13); c.lineTo(ax2 + 4, deckY2 + H * 0.05 + 13); c.closePath(); c.fill();
            c.fillStyle = dark8;
        }

        /* ── 30 BAROQUE STATUES (15 per side, but simplified to 7+7 visible) ── */
        for (var st2 = -4; st2 <= 4; st2++) {
            var sx2 = cx + st2 * (span2 * 1.8 / 8);
            /* tall stone pedestal */
            c.fillStyle = amberD; c.strokeStyle = '#7a5010'; c.lineWidth = 0.7;
            c.fillRect(sx2 - 5, deckY2 - 22, 10, 13); c.strokeRect(sx2 - 5, deckY2 - 22, 10, 13);
            /* pedestal base moulding */
            c.fillStyle = amberL; c.fillRect(sx2 - 6, deckY2 - 22, 12, 2);
            c.fillRect(sx2 - 6, deckY2 - 10, 12, 2);
            /* Baroque figure — detailed */
            c.fillStyle = '#c8a84a'; c.strokeStyle = '#a07828'; c.lineWidth = 0.8;
            /* body */
            c.fillRect(sx2 - 3.5, deckY2 - 33, 7, 11);
            /* head with halo-like disc */
            c.beginPath(); c.arc(sx2, deckY2 - 35, 3.5, 0, Math.PI * 2); c.fill();
            /* robes flow */
            c.beginPath(); c.moveTo(sx2 - 3, deckY2 - 22); c.lineTo(sx2 - 6, deckY2 - 26); c.lineTo(sx2 - 4, deckY2 - 31); c.stroke();
            c.beginPath(); c.moveTo(sx2 + 3, deckY2 - 22); c.lineTo(sx2 + 6, deckY2 - 26); c.lineTo(sx2 + 4, deckY2 - 31); c.stroke();
            /* arm outstretched */
            c.strokeStyle = '#c8a84a'; c.lineWidth = 1;
            var armDir = (st2 % 2 === 0) ? 1 : -1;
            c.beginPath(); c.moveTo(sx2, deckY2 - 30); c.lineTo(sx2 + armDir * 7, deckY2 - 33); c.stroke();
            /* attribute (cross, book, palm) */
            c.strokeStyle = '#e0c060'; c.lineWidth = 1.2;
            c.beginPath(); c.moveTo(sx2 + armDir * 7, deckY2 - 36); c.lineTo(sx2 + armDir * 7, deckY2 - 30); c.stroke();
            if (st2 % 3 === 0) { c.beginPath(); c.moveTo(sx2 + armDir * 5, deckY2 - 34); c.lineTo(sx2 + armDir * 9, deckY2 - 34); c.stroke(); }
            /* glow for key saints */
            if (Math.abs(st2) <= 1) { radialGlow(c, sx2, deckY2 - 32, 12, 200, 160, 60, 0.18); }
        }

        /* ── OLD TOWN BRIDGE TOWER (east end) ── */
        var tE = cx + span2 - 14;
        c.fillStyle = amber; c.strokeStyle = amberD; c.lineWidth = 1;
        c.fillRect(tE - 13, gy - H * 0.30, 26, H * 0.30 - 13); c.strokeRect(tE - 13, gy - H * 0.30, 26, H * 0.30 - 13);
        /* stone courses */
        c.strokeStyle = 'rgba(140,100,30,0.28)'; c.lineWidth = 0.6;
        for (var tc5 = 1; tc5 < 6; tc5++) { c.beginPath(); c.moveTo(tE - 13, gy - H * 0.05 * tc5); c.lineTo(tE + 13, gy - H * 0.05 * tc5); c.stroke(); }
        /* lancet windows */
        c.fillStyle = dark8;
        for (var tw6 = 0; tw6 < 3; tw6++) {
            var twy6 = gy - H * (0.08 + tw6 * 0.07);
            c.fillRect(tE - 4, twy6, 8, 14);
            c.beginPath(); c.moveTo(tE - 4, twy6); c.lineTo(tE, twy6 - 5); c.lineTo(tE + 4, twy6); c.closePath(); c.fill();
        }
        /* tower roof */
        c.fillStyle = '#8a3a1a'; c.strokeStyle = '#6a2a0a'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(tE - 15, gy - H * 0.30); c.lineTo(tE, gy - H * 0.38); c.lineTo(tE + 15, gy - H * 0.30); c.closePath(); c.fill(); c.stroke();
        radialGlow(c, tE, gy - H * 0.38, 12, 255, 200, 100, 0.22);
        c.fillStyle = amberL; c.beginPath(); c.arc(tE, gy - H * 0.38, 2, 0, Math.PI * 2); c.fill();

        /* ── MALÁ STRANA BRIDGE TOWERS (west end) ── */
        var tW = cx - span2 + 10;
        /* short Romanesque tower */
        c.fillStyle = stone5; c.strokeStyle = stoneD5; c.lineWidth = 1;
        var stone5 = '#a09880', stoneD5 = '#787060';
        c.fillRect(tW - 9, gy - H * 0.18, 18, H * 0.18 - 13); c.strokeRect(tW - 9, gy - H * 0.18, 18, H * 0.18 - 13);
        c.fillStyle = '#7a3818'; c.beginPath(); c.moveTo(tW - 10, gy - H * 0.18); c.lineTo(tW, gy - H * 0.22); c.lineTo(tW + 10, gy - H * 0.18); c.closePath(); c.fill();
        /* tall Gothic tower adjacent */
        c.fillStyle = amber; c.strokeStyle = amberD; c.lineWidth = 1;
        c.fillRect(tW + 10, gy - H * 0.28, 22, H * 0.28 - 13); c.strokeRect(tW + 10, gy - H * 0.28, 22, H * 0.28 - 13);
        c.fillStyle = dark8;
        for (var wtw = 0; wtw < 3; wtw++) {
            var wtwy = gy - H * (0.07 + wtw * 0.07);
            c.fillRect(tW + 15, wtwy, 8, 12);
            c.beginPath(); c.arc(tW + 19, wtwy, 4, Math.PI, 0, false); c.fill();
        }
        c.fillStyle = '#8a3a1a'; c.strokeStyle = '#6a2a0a'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(tW + 8, gy - H * 0.28); c.lineTo(tW + 21, gy - H * 0.36); c.lineTo(tW + 34, gy - H * 0.28); c.closePath(); c.fill(); c.stroke();
        radialGlow(c, tW + 21, gy - H * 0.36, 10, 255, 200, 100, 0.18);

        /* lamposts on bridge */
        c.strokeStyle = '#4a3820'; c.lineWidth = 1.2;
        for (var lp = -3; lp <= 3; lp++) {
            var lpx = cx + lp * span2 / 4;
            c.beginPath(); c.moveTo(lpx, deckY2 - 9); c.lineTo(lpx, deckY2 - 22); c.stroke();
            c.beginPath(); c.moveTo(lpx, deckY2 - 22); c.lineTo(lpx + 5, deckY2 - 24); c.stroke();
            radialGlow(c, lpx + 5, deckY2 - 24, 6, 255, 210, 100, 0.22);
            c.fillStyle = 'rgba(255,210,100,0.90)'; c.beginPath(); c.arc(lpx + 5, deckY2 - 24, 2, 0, Math.PI * 2); c.fill();
        }
    }

    /* ══════════════════════════════════════════════
       PARIS EXTRA LANDMARKS
    ══════════════════════════════════════════════ */
    function drawLouvre(c, cx, gy) {
        var bH = H * 0.28;
        var stone6 = '#d0c490', stoneD6 = '#a89e60', stoneL6 = '#e8dca8';
        var dark9 = '#0a0806';

        radialGlow(c, cx, gy, 120, 255, 220, 140, 0.14);

        /* NORTH WING (Richelieu) */
        c.fillStyle = stone6; c.strokeStyle = stoneD6; c.lineWidth = 1;
        c.fillRect(cx - 82, gy - bH * 0.70, 52, bH * 0.70); c.strokeRect(cx - 82, gy - bH * 0.70, 52, bH * 0.70);
        /* SOUTH WING (Denon) */
        c.fillRect(cx + 30, gy - bH * 0.70, 52, bH * 0.70); c.strokeRect(cx + 30, gy - bH * 0.70, 52, bH * 0.70);
        /* EAST WING (Sully) — deeper in composition */
        c.fillStyle = '#c8bc88'; c.strokeStyle = stoneD6;
        c.fillRect(cx - 28, gy - bH * 0.55, 56, bH * 0.55); c.strokeRect(cx - 28, gy - bH * 0.55, 56, bH * 0.55);

        /* MANSARD ROOFS — zinc grey-green French style */
        c.fillStyle = '#6e7e68'; c.strokeStyle = '#4e5e48'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 84, gy - bH * 0.70); c.lineTo(cx - 58, gy - bH * 0.84); c.lineTo(cx - 32, gy - bH * 0.70); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx + 28, gy - bH * 0.70); c.lineTo(cx + 56, gy - bH * 0.84); c.lineTo(cx + 84, gy - bH * 0.70); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx - 30, gy - bH * 0.55); c.lineTo(cx, gy - bH * 0.70); c.lineTo(cx + 30, gy - bH * 0.55); c.closePath(); c.fill(); c.stroke();

        /* DORMER WINDOWS on mansard roofs */
        c.fillStyle = dark9;
        for (var dm2 = -3; dm2 <= 3; dm2 += 2) {
            var dmy = gy - bH * 0.77 + Math.abs(dm2) * bH * 0.02;
            c.fillRect(cx + dm2 * 14 - 3, dmy, 6, 7);
            c.beginPath(); c.moveTo(cx + dm2 * 14 - 3, dmy); c.lineTo(cx + dm2 * 14, dmy - 4); c.lineTo(cx + dm2 * 14 + 3, dmy); c.closePath(); c.fill();
        }

        /* COLONNADED FACADE — Corinthian columns */
        c.strokeStyle = 'rgba(150,135,85,0.40)'; c.lineWidth = 0.9;
        for (var nc6 = 0; nc6 < 9; nc6++) { var ncx6 = cx - 80 + nc6 * 5.8; c.beginPath(); c.moveTo(ncx6, gy); c.lineTo(ncx6, gy - bH * 0.70); c.stroke(); }
        for (var sc6 = 0; sc6 < 9; sc6++) { var scx6 = cx + 32 + sc6 * 5.8; c.beginPath(); c.moveTo(scx6, gy); c.lineTo(scx6, gy - bH * 0.70); c.stroke(); }

        /* ARCHED WINDOWS — three floors */
        c.fillStyle = dark9;
        for (var nwf6 = 0; nwf6 < 7; nwf6++) {
            var nwfx = cx - 79 + nwf6 * 7;
            for (var fl6 = 0; fl6 < 3; fl6++) {
                var nwfy = gy - bH * (0.15 + fl6 * 0.20);
                c.fillRect(nwfx - 2.5, nwfy, 5, 12);
                c.beginPath(); c.arc(nwfx, nwfy, 2.5, Math.PI, 0, false); c.fill();
                if (fl6 === 1) radialGlow(c, nwfx, nwfy + 5, 6, 255, 210, 100, 0.14);
            }
        }
        for (var swf6 = 0; swf6 < 7; swf6++) {
            var swfx = cx + 33 + swf6 * 7;
            for (var sfl6 = 0; sfl6 < 3; sfl6++) {
                var swfy = gy - bH * (0.15 + sfl6 * 0.20);
                c.fillRect(swfx - 2.5, swfy, 5, 12);
                c.beginPath(); c.arc(swfx, swfy, 2.5, Math.PI, 0, false); c.fill();
                if (sfl6 === 1) radialGlow(c, swfx, swfy + 5, 6, 255, 210, 100, 0.14);
            }
        }

        /* COURTYARD COBBLESTONE */
        c.fillStyle = '#a89c6a'; c.fillRect(cx - 28, gy - bH * 0.08, 56, bH * 0.08);
        c.strokeStyle = 'rgba(120,110,60,0.30)'; c.lineWidth = 0.5;
        for (var cb2 = -3; cb2 <= 3; cb2++) { c.beginPath(); c.moveTo(cx + cb2 * 9, gy - bH * 0.08); c.lineTo(cx + cb2 * 9, gy); c.stroke(); }

        /* I.M. PEI GLASS PYRAMID */
        /* Blue glass panels */
        c.fillStyle = 'rgba(80,140,220,0.06)';
        c.beginPath(); c.moveTo(cx - 22, gy - bH * 0.08); c.lineTo(cx, gy - bH * 0.44); c.lineTo(cx + 22, gy - bH * 0.08); c.closePath(); c.fill();
        /* Glass structure lines */
        c.strokeStyle = 'rgba(100,170,255,0.75)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx - 22, gy - bH * 0.08); c.lineTo(cx, gy - bH * 0.44); c.stroke();
        c.beginPath(); c.moveTo(cx + 22, gy - bH * 0.08); c.lineTo(cx, gy - bH * 0.44); c.stroke();
        c.beginPath(); c.moveTo(cx - 22, gy - bH * 0.08); c.lineTo(cx + 22, gy - bH * 0.08); c.stroke();
        /* glass panel grid */
        c.strokeStyle = 'rgba(80,150,230,0.45)'; c.lineWidth = 0.8;
        for (var gp6 = 1; gp6 < 5; gp6++) {
            var gpf6 = gp6 / 5, gpW = 22 * (1 - gpf6);
            var gpY6 = gy - bH * (0.08 + 0.36 * gpf6);
            c.beginPath(); c.moveTo(cx - gpW, gpY6); c.lineTo(cx + gpW, gpY6); c.stroke();
            c.beginPath(); c.moveTo(cx - 22 + gp6 * 8, gy - bH * 0.08); c.lineTo(cx, gy - bH * 0.44); c.stroke();
            c.beginPath(); c.moveTo(cx + 22 - gp6 * 8, gy - bH * 0.08); c.lineTo(cx, gy - bH * 0.44); c.stroke();
        }
        /* pyramid apex glow */
        radialGlow(c, cx, gy - bH * 0.44, 18, 150, 200, 255, 0.30);
        c.fillStyle = 'rgba(180,220,255,0.80)'; c.beginPath(); c.arc(cx, gy - bH * 0.44, 2, 0, Math.PI * 2); c.fill();

        /* uplights */
        radialGlow(c, cx - 40, gy - 4, 28, 255, 220, 140, 0.18);
        radialGlow(c, cx + 40, gy - 4, 28, 255, 220, 140, 0.18);
    }

    function drawSacreCoeur(c, cx, gy) {
        var bH = H * 0.46;
        var white8 = '#f6f2ec', whiteD8 = '#d4ccc0', whiteL8 = '#fefcf8';
        var gray8 = '#b8b0a0';
        var dark10 = '#0a0806';

        radialGlow(c, cx, gy, 110, 255, 245, 225, 0.14);

        /* MONTMARTRE HILL */
        c.fillStyle = '#3a3520'; c.strokeStyle = '#2a2510'; c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(cx - 72, gy); c.lineTo(cx - 72, gy - bH * 0.10);
        c.quadraticCurveTo(cx - 45, gy - bH * 0.20, cx, gy - bH * 0.18);
        c.quadraticCurveTo(cx + 45, gy - bH * 0.16, cx + 72, gy - bH * 0.10);
        c.lineTo(cx + 72, gy); c.closePath(); c.fill(); c.stroke();
        /* vineyard lines */
        c.strokeStyle = 'rgba(60,70,30,0.40)'; c.lineWidth = 0.6;
        for (var vl = -3; vl <= 3; vl++) { c.beginPath(); c.moveTo(cx + vl * 22, gy - bH * 0.10); c.lineTo(cx + vl * 18, gy - bH * 0.16); c.stroke(); }

        /* WIDE STONE STEPS — narrow at top (facade base), widen going down to hill */
        for (var step = 0; step < 5; step++) {
            var stW2 = 58 + step * 7, stY2 = gy - bH * 0.20 + step * bH * 0.02;
            c.fillStyle = whiteD8; c.strokeStyle = '#b0a898'; c.lineWidth = 0.6;
            c.fillRect(cx - stW2, stY2, stW2 * 2, bH * 0.02); c.strokeRect(cx - stW2, stY2, stW2 * 2, bH * 0.02);
        }

        /* BASE FACADE PORTICO — triple arcade */
        var baseY8 = gy - bH * 0.36;
        c.fillStyle = white8; c.strokeStyle = whiteD8; c.lineWidth = 1;
        c.fillRect(cx - 50, baseY8, 100, bH * 0.16); c.strokeRect(cx - 50, baseY8, 100, bH * 0.16);
        /* three large arched bays */
        c.fillStyle = dark10;
        for (var bay8 = -1; bay8 <= 1; bay8++) {
            var bayX8 = cx + bay8 * 28;
            c.beginPath(); c.arc(bayX8, baseY8, 15, Math.PI, 0, false); c.fill();
            c.fillRect(bayX8 - 15, baseY8, 30, bH * 0.12); c.fill();
            /* arch moulding */
            c.strokeStyle = whiteD8; c.lineWidth = 0.8;
            c.beginPath(); c.arc(bayX8, baseY8, 17, Math.PI, 0, false); c.stroke();
        }
        /* facade Corinthian columns */
        c.strokeStyle = 'rgba(200,190,170,0.45)'; c.lineWidth = 1;
        for (var fc8 = -5; fc8 <= 5; fc8++) {
            var fcx8 = cx + fc8 * 9.5;
            c.beginPath(); c.moveTo(fcx8, baseY8); c.lineTo(fcx8, baseY8 + bH * 0.16); c.stroke();
            /* capital */
            c.fillStyle = whiteL8; c.fillRect(fcx8 - 3, baseY8 + bH * 0.155, 6, 2);
        }

        /* TWO FLANKING SQUARE TOWERS */
        for (var bt8 = -1; bt8 <= 1; bt8 += 2) {
            var btX8 = cx + bt8 * 54;
            c.fillStyle = white8; c.strokeStyle = whiteD8; c.lineWidth = 1;
            c.fillRect(btX8 - 12, gy - bH * 0.68, 24, bH * 0.32); c.strokeRect(btX8 - 12, gy - bH * 0.68, 24, bH * 0.32);
            /* stone courses */
            c.strokeStyle = 'rgba(190,180,160,0.30)'; c.lineWidth = 0.5;
            for (var tc8 = 1; tc8 < 5; tc8++) { c.beginPath(); c.moveTo(btX8 - 12, gy - bH * (0.36 + tc8 * 0.065)); c.lineTo(btX8 + 12, gy - bH * (0.36 + tc8 * 0.065)); c.stroke(); }
            /* arched belfry windows */
            c.fillStyle = dark10;
            for (var btw = 0; btw < 3; btw++) {
                var btwY = gy - bH * (0.42 + btw * 0.09);
                c.fillRect(btX8 - 5, btwY, 10, 14);
                c.beginPath(); c.arc(btX8, btwY, 5, Math.PI, 0, false); c.fill();
                radialGlow(c, btX8, btwY + 6, 6, 255, 230, 180, 0.12);
            }
            /* onion dome atop tower */
            c.fillStyle = gray8; c.strokeStyle = '#988880'; c.lineWidth = 1;
            c.beginPath(); c.arc(btX8, gy - bH * 0.68, 14, Math.PI, 0, false); c.fill(); c.stroke();
            c.fillStyle = white8; c.beginPath(); c.arc(btX8, gy - bH * 0.68, 10, 0, Math.PI * 2); c.fill();
            c.strokeStyle = whiteD8; c.stroke();
            /* dome rib lines */
            c.strokeStyle = 'rgba(200,190,170,0.35)'; c.lineWidth = 0.7;
            for (var dr8 = 0; dr8 < 8; dr8++) { var dra8 = dr8 * Math.PI / 4; c.beginPath(); c.moveTo(btX8, gy - bH * 0.68); c.lineTo(btX8 + Math.cos(dra8) * 10, gy - bH * 0.68 + Math.sin(dra8) * 10); c.stroke(); }
            /* lantern finial */
            c.strokeStyle = whiteD8; c.lineWidth = 1.2;
            c.beginPath(); c.moveTo(btX8, gy - bH * 0.68 - 10); c.lineTo(btX8, gy - bH * 0.75); c.stroke();
            c.fillStyle = '#ccc090'; c.beginPath(); c.arc(btX8, gy - bH * 0.75, 2, 0, Math.PI * 2); c.fill();
            radialGlow(c, btX8, gy - bH * 0.74, 7, 255, 240, 190, 0.18);
        }

        /* MAIN DOME — Romano-Byzantine */
        var domeY8 = gy - bH * 0.71;
        /* drum */
        c.fillStyle = gray8; c.strokeStyle = '#989080'; c.lineWidth = 1;
        c.fillRect(cx - 24, domeY8, 48, bH * 0.07); c.strokeRect(cx - 24, domeY8, 48, bH * 0.07);
        /* drum colonnaded gallery */
        c.strokeStyle = 'rgba(180,170,150,0.45)'; c.lineWidth = 0.9;
        for (var dc8 = -4; dc8 <= 4; dc8++) { c.beginPath(); c.moveTo(cx + dc8 * 5.5, domeY8); c.lineTo(cx + dc8 * 5.5, domeY8 + bH * 0.07); c.stroke(); }
        /* drum windows */
        c.fillStyle = dark10;
        for (var dw8 = -2; dw8 <= 2; dw8 += 2) { c.fillRect(cx + dw8 * 9 - 3, domeY8 + 3, 6, 8); c.beginPath(); c.arc(cx + dw8 * 9, domeY8 + 3, 3, Math.PI, 0, false); c.fill(); }
        /* main dome body */
        c.fillStyle = gray8; c.strokeStyle = '#989080'; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, domeY8, 32, Math.PI, 0, false); c.fill(); c.stroke();
        c.fillStyle = white8; c.strokeStyle = whiteD8; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, domeY8, 25, Math.PI, 0, false); c.fill(); c.stroke();
        /* dome ribs */
        c.strokeStyle = 'rgba(210,200,180,0.40)'; c.lineWidth = 0.9;
        for (var dr9 = 0; dr9 < 10; dr9++) { var dra9 = dr9 * Math.PI / 10; c.beginPath(); c.moveTo(cx - 25, domeY8); c.lineTo(cx + Math.cos(Math.PI - dra9) * 25, domeY8 - Math.sin(dra9) * 25); c.stroke(); }
        /* dome highlight */
        c.fillStyle = whiteL8; c.beginPath(); c.arc(cx - 6, domeY8 - 18, 9, 0, Math.PI * 2); c.fill();
        radialGlow(c, cx, domeY8, 44, 255, 248, 238, 0.22);

        /* TWO FLANKING SECONDARY DOMES */
        for (var sd8 = -1; sd8 <= 1; sd8 += 2) {
            var sdX8 = cx + sd8 * 40;
            c.fillStyle = gray8; c.strokeStyle = '#989080'; c.lineWidth = 0.8;
            c.beginPath(); c.arc(sdX8, gy - bH * 0.52, 13, Math.PI, 0, false); c.fill(); c.stroke();
            c.fillStyle = whiteD8; c.beginPath(); c.arc(sdX8, gy - bH * 0.52, 9, 0, Math.PI * 2); c.fill();
            c.strokeStyle = whiteD8; c.lineWidth = 1;
            c.beginPath(); c.moveTo(sdX8, gy - bH * 0.52 - 9); c.lineTo(sdX8, gy - bH * 0.58); c.stroke();
            c.fillStyle = '#c8bc90'; c.beginPath(); c.arc(sdX8, gy - bH * 0.58, 1.5, 0, Math.PI * 2); c.fill();
        }

        /* MAIN LANTERN + CROSS */
        var lanY8 = domeY8 - 25;
        c.fillStyle = white8; c.strokeStyle = whiteD8; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, lanY8, 9, 0, Math.PI * 2); c.fill(); c.stroke();
        c.strokeStyle = whiteD8; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx, lanY8 - 9); c.lineTo(cx, lanY8 - 20); c.stroke();
        /* cross */
        c.strokeStyle = '#c0b480'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx, lanY8 - 20); c.lineTo(cx, lanY8 - 28); c.stroke();
        c.beginPath(); c.moveTo(cx - 5, lanY8 - 25); c.lineTo(cx + 5, lanY8 - 25); c.stroke();
        radialGlow(c, cx, lanY8, 40, 255, 248, 238, 0.28);
    }

    function drawPantheon(c, cx, gy) {
        var bH = H * 0.38;
        var stone7 = '#c4bc9a', stoneD7 = '#a09876', stoneL7 = '#dcd4b0';
        var dark11 = '#0c0a06';

        radialGlow(c, cx, gy, 90, 220, 200, 150, 0.12);

        /* WIDE STEPPED BASE (stylobate) */
        c.fillStyle = stoneD7; c.strokeStyle = '#888458'; c.lineWidth = 0.8;
        c.fillRect(cx - 58, gy - bH * 0.08, 116, bH * 0.08); c.strokeRect(cx - 58, gy - bH * 0.08, 116, bH * 0.08);
        c.fillRect(cx - 50, gy - bH * 0.12, 100, bH * 0.04); c.strokeRect(cx - 50, gy - bH * 0.12, 100, bH * 0.04);

        /* MAIN RECTANGULAR BODY */
        c.fillStyle = stone7; c.strokeStyle = stoneD7; c.lineWidth = 1;
        c.fillRect(cx - 46, gy - bH * 0.54, 92, bH * 0.42); c.strokeRect(cx - 46, gy - bH * 0.54, 92, bH * 0.42);
        /* stone block courses */
        c.strokeStyle = 'rgba(140,125,80,0.28)'; c.lineWidth = 0.6;
        for (var sc7 = 1; sc7 < 7; sc7++) { c.beginPath(); c.moveTo(cx - 46, gy - bH * sc7 * 0.075); c.lineTo(cx + 46, gy - bH * sc7 * 0.075); c.stroke(); }

        /* CORINTHIAN COLONNADE — 6 columns */
        c.strokeStyle = 'rgba(150,135,88,0.45)'; c.lineWidth = 1.1;
        for (var col7 = -5; col7 <= 5; col7++) {
            c.beginPath(); c.moveTo(cx + col7 * 8.5, gy - bH * 0.12); c.lineTo(cx + col7 * 8.5, gy - bH * 0.54); c.stroke();
            /* capital */
            c.fillStyle = stoneL7; c.fillRect(cx + col7 * 8.5 - 3.5, gy - bH * 0.535, 7, 2.5);
            /* base */
            c.fillRect(cx + col7 * 8.5 - 3, gy - bH * 0.12, 6, 2.5);
        }

        /* TRIANGULAR PEDIMENT */
        c.fillStyle = stone7; c.strokeStyle = stoneD7; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 48, gy - bH * 0.54); c.lineTo(cx, gy - bH * 0.66); c.lineTo(cx + 48, gy - bH * 0.54); c.closePath(); c.fill(); c.stroke();
        /* pediment relief — "Glorification of France" */
        c.fillStyle = 'rgba(180,160,110,0.28)'; c.fillRect(cx - 34, gy - bH * 0.59, 68, bH * 0.08);
        /* central figure */
        c.strokeStyle = stoneD7; c.lineWidth = 0.7;
        c.beginPath(); c.arc(cx, gy - bH * 0.60, 3, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(cx, gy - bH * 0.57); c.lineTo(cx, gy - bH * 0.54); c.stroke();
        /* flanking allegories */
        for (var af = -1; af <= 1; af += 2) {
            c.beginPath(); c.arc(cx + af * 18, gy - bH * 0.58, 2.5, 0, Math.PI * 2); c.stroke();
            c.beginPath(); c.moveTo(cx + af * 18, gy - bH * 0.555); c.lineTo(cx + af * 18, gy - bH * 0.54); c.stroke();
            c.beginPath(); c.moveTo(cx + af * 18, gy - bH * 0.57); c.lineTo(cx + af * 18 + af * 8, gy - bH * 0.57); c.stroke();
        }

        /* SQUARE DRUM */
        c.fillStyle = stone7; c.strokeStyle = stoneD7; c.lineWidth = 1;
        c.fillRect(cx - 28, gy - bH * 0.76, 56, bH * 0.10); c.strokeRect(cx - 28, gy - bH * 0.76, 56, bH * 0.10);
        /* drum colonnettes */
        c.strokeStyle = 'rgba(150,135,88,0.42)'; c.lineWidth = 0.9;
        for (var dc7 = -4; dc7 <= 4; dc7++) { c.beginPath(); c.moveTo(cx + dc7 * 7, gy - bH * 0.66); c.lineTo(cx + dc7 * 7, gy - bH * 0.76); c.stroke(); }

        /* MAIN DOME */
        c.fillStyle = stone7; c.strokeStyle = stoneD7; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, gy - bH * 0.76, 30, Math.PI, 0, false); c.closePath(); c.fill(); c.stroke();
        /* dome ribs */
        c.strokeStyle = 'rgba(150,135,88,0.38)'; c.lineWidth = 0.8;
        for (var dr7 = 1; dr7 <= 6; dr7++) {
            var dra7 = dr7 * Math.PI / 7;
            c.beginPath(); c.moveTo(cx - 30, gy - bH * 0.76); c.lineTo(cx + Math.cos(Math.PI - dra7) * 30, gy - bH * 0.76 - Math.sin(dra7) * 30); c.stroke();
            c.beginPath(); c.moveTo(cx + 30, gy - bH * 0.76); c.lineTo(cx + Math.cos(dra7) * 30, gy - bH * 0.76 - Math.sin(dra7) * 30); c.stroke();
        }
        /* dome specular highlight */
        c.fillStyle = 'rgba(240,230,200,0.12)'; c.beginPath(); c.arc(cx - 8, gy - bH * 0.84, 16, 0, Math.PI * 2); c.fill();
        radialGlow(c, cx, gy - bH * 0.76, 38, 220, 200, 150, 0.16);

        /* LANTERN */
        c.fillStyle = stoneL7; c.strokeStyle = stoneD7; c.lineWidth = 1;
        c.fillRect(cx - 6, gy - bH * 0.92, 12, bH * 0.08); c.strokeRect(cx - 6, gy - bH * 0.92, 12, bH * 0.08);
        /* cross/finial */
        c.strokeStyle = '#a09870'; c.lineWidth = 1.8;
        c.beginPath(); c.moveTo(cx, gy - bH * 0.92); c.lineTo(cx, gy - bH); c.stroke();
        c.beginPath(); c.moveTo(cx - 4, gy - bH * 0.97); c.lineTo(cx + 4, gy - bH * 0.97); c.stroke();
        radialGlow(c, cx, gy - bH * 0.92, 20, 220, 200, 150, 0.22);
    }

    /* ══════════════════════════════════════════════
       PRAGUE EXTRA LANDMARKS
    ══════════════════════════════════════════════ */
    function drawTynChurch(c, cx, gy) {
        var bH = H * 0.58;
        var dark12 = '#161210', darkM2 = '#222018', darkL2 = '#302e20';
        var gold6 = '#c8a020', goldL6 = '#e8c040';

        radialGlow(c, cx, gy, 80, 160, 130, 70, 0.12);

        /* WIDE NAVE BODY — dark Gothic brick */
        c.fillStyle = darkM2; c.strokeStyle = dark12; c.lineWidth = 1;
        c.fillRect(cx - 46, gy - bH * 0.40, 92, bH * 0.40); c.strokeRect(cx - 46, gy - bH * 0.40, 92, bH * 0.40);
        /* brick coursing */
        c.strokeStyle = 'rgba(40,36,22,0.55)'; c.lineWidth = 0.5;
        for (var bc = 1; bc < 7; bc++) { c.beginPath(); c.moveTo(cx - 46, gy - bH * bc / 7 * 0.40); c.lineTo(cx + 46, gy - bH * bc / 7 * 0.40); c.stroke(); }
        /* nave clerestory windows */
        c.fillStyle = 'rgba(50,35,15,0.80)';
        for (var nw3 = -4; nw3 <= 4; nw3++) {
            var nwx3 = cx + nw3 * 11;
            c.fillRect(nwx3 - 3.5, gy - bH * 0.30, 7, 16);
            c.beginPath(); c.moveTo(nwx3 - 3.5, gy - bH * 0.30); c.lineTo(nwx3, gy - bH * 0.35); c.lineTo(nwx3 + 3.5, gy - bH * 0.30); c.closePath(); c.fill();
            if (Math.abs(nw3) <= 2) radialGlow(c, nwx3, gy - bH * 0.26, 6, 255, 175, 50, 0.16);
        }

        /* CENTRAL GABLE — with golden Madonna */
        c.fillStyle = darkL2; c.strokeStyle = dark12; c.lineWidth = 1;
        c.fillRect(cx - 20, gy - bH * 0.54, 40, bH * 0.14); c.strokeRect(cx - 20, gy - bH * 0.54, 40, bH * 0.14);
        /* pointed gable apex */
        c.beginPath(); c.moveTo(cx - 20, gy - bH * 0.54); c.lineTo(cx, gy - bH * 0.64); c.lineTo(cx + 20, gy - bH * 0.54); c.closePath(); c.fill(); c.stroke();
        /* gold finial at gable tip */
        c.fillStyle = gold6; c.beginPath(); c.arc(cx, gy - bH * 0.64, 3, 0, Math.PI * 2); c.fill();
        radialGlow(c, cx, gy - bH * 0.64, 10, 200, 160, 50, 0.28);
        /* GOLDEN MADONNA STATUE on gable */
        c.fillStyle = gold6;
        c.beginPath(); c.arc(cx, gy - bH * 0.58, 4.5, 0, Math.PI * 2); c.fill(); /* head */
        c.fillRect(cx - 3.5, gy - bH * 0.54, 7, 12); /* body */
        c.strokeStyle = gold6; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 3, gy - bH * 0.52); c.lineTo(cx - 9, gy - bH * 0.56); c.stroke();
        c.beginPath(); c.moveTo(cx + 3, gy - bH * 0.52); c.lineTo(cx + 9, gy - bH * 0.56); c.stroke();
        radialGlow(c, cx, gy - bH * 0.56, 18, 220, 180, 60, 0.32);
        /* Rose window */
        radialGlow(c, cx, gy - bH * 0.48, 16, 160, 90, 220, 0.28);
        c.strokeStyle = '#4a3820'; c.lineWidth = 0.9;
        c.beginPath(); c.arc(cx, gy - bH * 0.48, 10, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, gy - bH * 0.48, 6, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = 'rgba(110,70,160,0.55)'; c.lineWidth = 0.7;
        for (var rw3 = 0; rw3 < 8; rw3++) {
            var rwa3 = rw3 * Math.PI / 4;
            c.beginPath(); c.moveTo(cx + Math.cos(rwa3) * 6, gy - bH * 0.48 + Math.sin(rwa3) * 6);
            c.lineTo(cx + Math.cos(rwa3) * 10, gy - bH * 0.48 + Math.sin(rwa3) * 10); c.stroke();
        }

        /* TWO TALL GOTHIC SPIRES */
        for (var sp4 = -1; sp4 <= 1; sp4 += 2) {
            var spX4 = cx + sp4 * 32;

            /* tower body */
            c.fillStyle = dark12; c.strokeStyle = darkM2; c.lineWidth = 1;
            c.fillRect(spX4 - 17, gy - bH * 0.94, 34, bH * 0.54); c.strokeRect(spX4 - 17, gy - bH * 0.94, 34, bH * 0.54);
            /* brick texture on tower */
            c.strokeStyle = 'rgba(40,36,22,0.45)'; c.lineWidth = 0.5;
            for (var tbc = 1; tbc < 9; tbc++) { c.beginPath(); c.moveTo(spX4 - 17, gy - bH * (0.40 + tbc * 0.06)); c.lineTo(spX4 + 17, gy - bH * (0.40 + tbc * 0.06)); c.stroke(); }

            /* Blind tracery niches */
            c.strokeStyle = 'rgba(60,50,28,0.50)'; c.lineWidth = 0.8;
            for (var tn = -1; tn <= 1; tn++) {
                var tnx = spX4 + tn * 8;
                c.beginPath(); c.moveTo(tnx - 4, gy - bH * 0.62); c.lineTo(tnx - 4, gy - bH * 0.76); c.lineTo(tnx + 4, gy - bH * 0.76); c.lineTo(tnx + 4, gy - bH * 0.62); c.stroke();
                c.beginPath(); c.moveTo(tnx - 4, gy - bH * 0.76); c.quadraticCurveTo(tnx, gy - bH * 0.80, tnx + 4, gy - bH * 0.76); c.stroke();
            }

            /* GOTHIC LANCET WINDOWS */
            c.fillStyle = 'rgba(55,38,14,0.78)';
            for (var tw7 = 0; tw7 < 6; tw7++) {
                var twy7 = gy - bH * (0.46 + tw7 * 0.08);
                c.fillRect(spX4 - 5, twy7, 10, 15);
                c.beginPath(); c.moveTo(spX4 - 5, twy7); c.lineTo(spX4, twy7 - 6); c.lineTo(spX4 + 5, twy7); c.closePath(); c.fill();
                if (tw7 < 4) radialGlow(c, spX4, twy7 + 6, 5, 255, 170, 50, 0.12);
            }

            /* Belfry storey with paired arches */
            c.fillStyle = 'rgba(45,30,10,0.85)';
            for (var ba = -1; ba <= 1; ba++) {
                c.fillRect(spX4 + ba * 7 - 3, gy - bH * 0.94, 7, 14);
                c.beginPath(); c.arc(spX4 + ba * 7, gy - bH * 0.94, 3.5, Math.PI, 0, false); c.fill();
            }

            /* Octagonal spire base collar */
            c.fillStyle = darkL2; c.strokeStyle = dark12; c.lineWidth = 1;
            c.fillRect(spX4 - 18, gy - bH * 0.94, 36, 6); c.strokeRect(spX4 - 18, gy - bH * 0.94, 36, 6);

            /* SPIRE — tall, tapering black Gothic */
            c.fillStyle = dark12; c.strokeStyle = darkM2; c.lineWidth = 0.8;
            c.beginPath();
            c.moveTo(spX4 - 17, gy - bH * 0.94);
            c.lineTo(spX4 - 6, gy - bH * 0.97);
            c.lineTo(spX4 - 2, gy - bH * 0.99);
            c.lineTo(spX4, gy - bH);
            c.lineTo(spX4 + 2, gy - bH * 0.99);
            c.lineTo(spX4 + 6, gy - bH * 0.97);
            c.lineTo(spX4 + 17, gy - bH * 0.94);
            c.closePath(); c.fill(); c.stroke();
            /* spire crockets */
            c.fillStyle = darkL2;
            for (var crt = 1; crt < 5; crt++) {
                var crtf = crt / 5, crtW = 17 * (1 - crtf);
                var crtY = gy - bH * (0.94 + crtf * 0.06);
                c.fillRect(spX4 - crtW - 3, crtY - 3, 5, 5);
                c.fillRect(spX4 + crtW - 2, crtY - 3, 5, 5);
            }
            /* GOLDEN FINIAL CROSS */
            var finY2 = gy - bH;
            c.fillStyle = gold6; c.beginPath(); c.arc(spX4, finY2, 3.5, 0, Math.PI * 2); c.fill();
            c.strokeStyle = goldL6; c.lineWidth = 2;
            c.beginPath(); c.moveTo(spX4, finY2 - 3.5); c.lineTo(spX4, finY2 - 11); c.stroke();
            c.beginPath(); c.moveTo(spX4 - 4, finY2 - 8); c.lineTo(spX4 + 4, finY2 - 8); c.stroke();
            radialGlow(c, spX4, finY2, 14, 200, 160, 50, 0.28);
        }

        /* MAIN PORTAL — large pointed arch */
        c.fillStyle = '#0a0806';
        c.beginPath();
        c.moveTo(cx - 15, gy); c.lineTo(cx - 15, gy - bH * 0.28);
        c.quadraticCurveTo(cx - 15, gy - bH * 0.36, cx, gy - bH * 0.38);
        c.quadraticCurveTo(cx + 15, gy - bH * 0.36, cx + 15, gy - bH * 0.28);
        c.lineTo(cx + 15, gy); c.closePath(); c.fill();
        /* portal tracery archivolts */
        c.strokeStyle = '#4a3818'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 17, gy - bH * 0.22); c.quadraticCurveTo(cx - 17, gy - bH * 0.38, cx, gy - bH * 0.40); c.quadraticCurveTo(cx + 17, gy - bH * 0.38, cx + 17, gy - bH * 0.22); c.stroke();
    }

    function drawAstronomicalClock(c, cx, gy) {
        var bH = H * 0.52;
        var stone8 = '#c4b070', stoneD8 = '#9e8c48', stoneL8 = '#e0cc88';
        var gold7 = '#d4a820', goldL7 = '#f0c840';
        var dark13 = '#0e0c08';

        radialGlow(c, cx, gy, 80, 200, 170, 80, 0.12);

        /* OLD TOWN HALL TOWER BODY */
        c.fillStyle = stone8; c.strokeStyle = stoneD8; c.lineWidth = 1;
        c.fillRect(cx - 22, gy - bH * 0.90, 44, bH * 0.90); c.strokeRect(cx - 22, gy - bH * 0.90, 44, bH * 0.90);
        /* stone ashlar courses */
        c.strokeStyle = 'rgba(140,115,50,0.32)'; c.lineWidth = 0.6;
        for (var sc9 = 1; sc9 < 14; sc9++) { c.beginPath(); c.moveTo(cx - 22, gy - bH * sc9 / 14 * 0.90); c.lineTo(cx + 22, gy - bH * sc9 / 14 * 0.90); c.stroke(); }
        /* corner quoins */
        c.strokeStyle = stoneL8; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(cx - 22, gy); c.lineTo(cx - 22, gy - bH * 0.90); c.stroke();
        c.beginPath(); c.moveTo(cx + 22, gy); c.lineTo(cx + 22, gy - bH * 0.90); c.stroke();

        /* HIGH WINDOWS (upper half) */
        c.fillStyle = dark13;
        for (var wh = 0; wh < 3; wh++) {
            var why = gy - bH * (0.12 + wh * 0.16);
            c.fillRect(cx - 8, why, 16, 20);
            c.beginPath(); c.moveTo(cx - 8, why); c.lineTo(cx, why - 7); c.lineTo(cx + 8, why); c.closePath(); c.fill();
            radialGlow(c, cx, why + 8, 9, 255, 200, 80, 0.15);
        }
        /* side lancet windows */
        for (var whs = -1; whs <= 1; whs += 2) {
            var whsx = cx + whs * 14;
            c.fillRect(whsx - 4, gy - bH * 0.18, 8, 14);
            c.beginPath(); c.arc(whsx, gy - bH * 0.18, 4, Math.PI, 0, false); c.fill();
        }

        /* GOTHIC POINTED ROOF */
        c.fillStyle = '#8a3018'; c.strokeStyle = '#6a2210'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 24, gy - bH * 0.90); c.lineTo(cx, gy - bH); c.lineTo(cx + 24, gy - bH * 0.90); c.closePath(); c.fill(); c.stroke();
        /* gable tracery */
        c.strokeStyle = stoneD8; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 14, gy - bH * 0.90); c.lineTo(cx, gy - bH * 0.96); c.lineTo(cx + 14, gy - bH * 0.90); c.stroke();
        /* roof finial */
        c.fillStyle = gold7; c.beginPath(); c.arc(cx, gy - bH, 3.5, 0, Math.PI * 2); c.fill();
        radialGlow(c, cx, gy - bH, 10, 210, 170, 50, 0.26);

        /* ════ ASTRONOMICAL CLOCK DIAL ════ */
        var clkY = gy - bH * 0.58;
        var clkR = 19;

        /* outermost stone frame ring */
        c.fillStyle = stone8; c.strokeStyle = stoneD8; c.lineWidth = 1.5;
        c.beginPath(); c.arc(cx, clkY, clkR + 4, 0, Math.PI * 2); c.fill(); c.stroke();

        /* OUTER ZODIAC RING — deep midnight blue */
        c.fillStyle = '#08122a';
        c.beginPath(); c.arc(cx, clkY, clkR, 0, Math.PI * 2); c.fill();
        c.strokeStyle = gold7; c.lineWidth = 1.8;
        c.beginPath(); c.arc(cx, clkY, clkR, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, clkY, clkR - 5, 0, Math.PI * 2); c.stroke();

        /* 24-hour marks on outer ring */
        c.strokeStyle = gold7; c.lineWidth = 0.9;
        for (var hr2 = 0; hr2 < 24; hr2++) {
            var hra2 = hr2 * Math.PI / 12 - Math.PI / 2;
            var hR3 = (hr2 % 6 === 0) ? clkR - 7 : clkR - 9;
            c.beginPath(); c.moveTo(cx + Math.cos(hra2) * clkR, clkY + Math.sin(hra2) * clkR); c.lineTo(cx + Math.cos(hra2) * hR3, clkY + Math.sin(hra2) * hR3); c.stroke();
        }

        /* MIDDLE RING — dark blue horizon sphere (Earth/cosmos) */
        c.fillStyle = '#102060';
        c.beginPath(); c.arc(cx, clkY, clkR - 5, 0, Math.PI * 2); c.fill();
        /* gold inner ring */
        c.strokeStyle = gold7; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, clkY, clkR - 5, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, clkY, clkR - 10, 0, Math.PI * 2); c.stroke();

        /* Zodiac glyphs around outer blue zone */
        c.fillStyle = goldL7; c.font = 'bold 5.5px serif';
        var zodiac2 = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
        for (var z2 = 0; z2 < 12; z2++) {
            var za2 = z2 * Math.PI / 6 - Math.PI / 2;
            var zr2 = clkR - 7.5;
            c.fillText(zodiac2[z2], cx + Math.cos(za2) * zr2 - 3.5, clkY + Math.sin(za2) * zr2 + 2);
        }

        /* INNER GOLD SUN DISK */
        c.fillStyle = '#10204a';
        c.beginPath(); c.arc(cx, clkY, clkR - 10, 0, Math.PI * 2); c.fill();
        radialGlow(c, cx, clkY, 12, 255, 200, 60, 0.40);
        c.fillStyle = goldL7;
        c.beginPath(); c.arc(cx, clkY, 5.5, 0, Math.PI * 2); c.fill();
        /* sun rays */
        c.strokeStyle = gold7; c.lineWidth = 0.8;
        for (var sr2 = 0; sr2 < 12; sr2++) {
            var sra2 = sr2 * Math.PI / 6;
            c.beginPath(); c.moveTo(cx + Math.cos(sra2) * 5.5, clkY + Math.sin(sra2) * 5.5); c.lineTo(cx + Math.cos(sra2) * 9, clkY + Math.sin(sra2) * 9); c.stroke();
        }

        /* CLOCK HANDS */
        c.strokeStyle = goldL7; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(cx, clkY); c.lineTo(cx, clkY - clkR * 0.58); c.stroke();
        c.strokeStyle = gold7; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(cx, clkY); c.lineTo(cx + clkR * 0.45, clkY + clkR * 0.18); c.stroke();
        c.fillStyle = goldL7; c.beginPath(); c.arc(cx, clkY, 2.5, 0, Math.PI * 2); c.fill();

        /* ════ CALENDAR DIAL ════ */
        var calY2 = gy - bH * 0.34;
        var calR2 = 13;
        c.fillStyle = '#1a1408';
        c.beginPath(); c.arc(cx, calY2, calR2, 0, Math.PI * 2); c.fill();
        c.strokeStyle = gold7; c.lineWidth = 1.4;
        c.beginPath(); c.arc(cx, calY2, calR2, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(cx, calY2, calR2 - 4, 0, Math.PI * 2); c.stroke();
        /* month segments */
        c.strokeStyle = '#a08020'; c.lineWidth = 0.8;
        for (var mo = 0; mo < 12; mo++) {
            var moa = mo * Math.PI / 6 - Math.PI / 2;
            c.beginPath(); c.moveTo(cx + Math.cos(moa) * (calR2 - 4), calY2 + Math.sin(moa) * (calR2 - 4));
            c.lineTo(cx + Math.cos(moa) * calR2, calY2 + Math.sin(moa) * calR2); c.stroke();
        }
        c.fillStyle = goldL7; c.beginPath(); c.arc(cx, calY2, 3, 0, Math.PI * 2); c.fill();

        /* DEATH FIGURE on right side */
        var skX2 = cx + 26, skY2 = gy - bH * 0.46;
        c.fillStyle = '#c8c0a0';
        c.beginPath(); c.arc(skX2, skY2 - 2, 3.5, 0, Math.PI * 2); c.fill(); /* skull */
        c.fillRect(skX2 - 2.5, skY2 + 1.5, 5, 10); /* ribcage */
        c.strokeStyle = '#b8b090'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(skX2, skY2 + 5); c.lineTo(skX2 + 8, skY2 + 2); c.stroke(); /* arm with bell */
        c.beginPath(); c.arc(skX2 + 9, skY2 + 1, 2, 0, Math.PI * 2); c.fill(); /* bell */
        c.strokeStyle = '#b0a880'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(skX2, skY2 + 5); c.lineTo(skX2 - 7, skY2 + 3); c.stroke(); /* other arm, hourglass */
        c.fillRect(skX2 - 10, skY2 + 1, 3, 5);

        /* VANITY/ROOSTER on left side */
        var vnX = cx - 26, vnY = gy - bH * 0.46;
        c.fillStyle = '#c0a840';
        c.beginPath(); c.arc(vnX, vnY, 3, 0, Math.PI * 2); c.fill(); /* mirror */
        c.fillRect(vnX - 2, vnY + 3, 4, 8);
        c.strokeStyle = '#b09830'; c.lineWidth = 0.8;
        c.beginPath(); c.arc(vnX, vnY - 5, 4, 0, Math.PI * 2); c.stroke(); /* crown on mirror */

        /* APOSTLE WINDOWS above clock face */
        c.fillStyle = dark13;
        for (var ap2 = -1; ap2 <= 1; ap2 += 2) {
            var apX2 = cx + ap2 * 15;
            c.fillRect(apX2 - 4, gy - bH * 0.74, 8, 10);
            c.beginPath(); c.arc(apX2, gy - bH * 0.74, 4, Math.PI, 0, false); c.fill();
        }
    }

    /* ══════════════════════════════════════════════
       BEIJING EXTRA LANDMARKS
    ══════════════════════════════════════════════ */
    function drawBirdsNest(c, cx, gy) {
        var bH = H * 0.36;
        var steel3 = '#b8943a', steelD3 = '#906a18', steelL3 = '#deb850';
        var red6 = '#c41818';

        radialGlow(c, cx, gy - bH * 0.22, 110, 255, 120, 40, 0.18);

        /* concrete base plinth */
        c.fillStyle = '#302820'; c.strokeStyle = '#201810'; c.lineWidth = 1;
        c.fillRect(cx - 70, gy - bH * 0.06, 140, bH * 0.06); c.strokeRect(cx - 70, gy - bH * 0.06, 140, bH * 0.06);

        /* OVAL STADIUM BOWL */
        c.fillStyle = '#1e1008'; c.strokeStyle = '#120804'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 64, bH * 0.30, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        /* red seating tiers */
        c.fillStyle = red6;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 52, bH * 0.24, 0, 0, Math.PI * 2); c.fill();
        /* seating tier bands */
        c.strokeStyle = '#aa1010'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 44, bH * 0.20, 0, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 36, bH * 0.16, 0, 0, Math.PI * 2); c.stroke();
        /* playing field — natural grass */
        c.fillStyle = '#1e5012';
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 32, bH * 0.14, 0, 0, Math.PI * 2); c.fill();
        /* field markings */
        c.strokeStyle = '#2e7020'; c.lineWidth = 0.8;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 22, bH * 0.09, 0, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(cx - 32, gy - bH * 0.30); c.lineTo(cx + 32, gy - bH * 0.30); c.stroke();

        /* ── INTERLOCKED STEEL NEST STRUCTURE ── */
        /* outer structural ring */
        c.strokeStyle = steel3; c.lineWidth = 4;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 67, bH * 0.33, 0, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 62, bH * 0.29, 0, Math.PI, false); c.stroke();

        /* primary lattice beams — main nest elements */
        c.lineWidth = 2.8;
        for (var nb4 = 0; nb4 < 20; nb4++) {
            var nba4 = nb4 * Math.PI / 10;
            var nx4a = cx + Math.cos(nba4) * 67, ny4a = gy - bH * 0.30 + Math.sin(nba4) * bH * 0.33;
            var nx4b = cx + Math.cos(nba4 + Math.PI * 0.65) * 52, ny4b = gy - bH * 0.30 + Math.sin(nba4 + Math.PI * 0.65) * bH * 0.24;
            c.strokeStyle = nb4 % 2 === 0 ? steel3 : steelD3;
            c.beginPath(); c.moveTo(nx4a, ny4a); c.lineTo(nx4b, ny4b); c.stroke();
        }
        /* secondary crossing beams */
        c.lineWidth = 2;
        for (var nb5 = 0; nb5 < 16; nb5++) {
            var nba5 = nb5 * Math.PI / 8 + Math.PI / 16;
            var nx5a = cx + Math.cos(nba5) * 64, ny5a = gy - bH * 0.30 + Math.sin(nba5) * bH * 0.31;
            var nx5b = cx + Math.cos(nba5 + Math.PI * 0.52) * 56, ny5b = gy - bH * 0.30 + Math.sin(nba5 + Math.PI * 0.52) * bH * 0.26;
            c.strokeStyle = 'rgba(184,148,58,0.65)';
            c.beginPath(); c.moveTo(nx5a, ny5a); c.lineTo(nx5b, ny5b); c.stroke();
        }
        /* tertiary fine mesh */
        c.lineWidth = 1.2;
        for (var nb6 = 0; nb6 < 24; nb6++) {
            var nba6 = nb6 * Math.PI / 12 + Math.PI / 24;
            var nx6a = cx + Math.cos(nba6) * 60, ny6a = gy - bH * 0.30 + Math.sin(nba6) * bH * 0.28;
            var nx6b = cx + Math.cos(nba6 + Math.PI * 0.38) * 50, ny6b = gy - bH * 0.30 + Math.sin(nba6 + Math.PI * 0.38) * bH * 0.22;
            c.strokeStyle = 'rgba(184,148,58,0.40)';
            c.beginPath(); c.moveTo(nx6a, ny6a); c.lineTo(nx6b, ny6b); c.stroke();
        }
        /* inner horizontal rings */
        c.strokeStyle = 'rgba(144,106,24,0.55)'; c.lineWidth = 1.5;
        for (var hr3 = 0; hr3 < 4; hr3++) {
            var hrf3 = 0.85 - hr3 * 0.18;
            c.beginPath(); c.ellipse(cx, gy - bH * 0.30, 67 * hrf3, bH * 0.33 * hrf3, 0, 0, Math.PI * 2); c.stroke();
        }

        /* ROOF ACCENT LIGHTS */
        for (var rl2 = 0; rl2 < 10; rl2++) {
            var rla2 = rl2 * Math.PI / 5;
            var rlX2 = cx + Math.cos(rla2) * 65, rlY2 = gy - bH * 0.30 + Math.sin(rla2) * bH * 0.32;
            radialGlow(c, rlX2, rlY2, 8, 255, 225, 180, 0.20);
            c.fillStyle = '#fff8e0'; c.beginPath(); c.arc(rlX2, rlY2, 1.5, 0, Math.PI * 2); c.fill();
        }
        /* interior flood glow */
        radialGlow(c, cx, gy - bH * 0.30, 55, 255, 120, 40, 0.16);
    }

    function drawSummerPalace(c, cx, gy) {
        var bH = H * 0.38;
        var red7 = '#aa1414', redD7 = '#840e0e';
        var gold8 = '#d4a020', goldL8 = '#f0c030';
        var yellow3 = '#c4900a';
        var marble3 = '#dcd4bc', marbleD3 = '#bcb498';
        var teal2 = '#1e5858';

        radialGlow(c, cx, gy, 100, 80, 140, 180, 0.14);

        /* KUNMING LAKE */
        c.fillStyle = 'rgba(14,44,76,0.40)'; c.fillRect(cx - 84, gy - bH * 0.07, 168, bH * 0.07);
        c.strokeStyle = 'rgba(30,80,140,0.22)'; c.lineWidth = 1;
        for (var rip2 = 0; rip2 < 4; rip2++) { c.beginPath(); c.moveTo(cx - 80, gy - bH * 0.04 + rip2 * 4); c.lineTo(cx + 80, gy - bH * 0.04 + rip2 * 4); c.stroke(); }

        /* MARBLE BOAT (Qingyan Zhou) */
        /* hull — white marble */
        c.fillStyle = marble3; c.strokeStyle = marbleD3; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(cx - 55, gy - bH * 0.07);
        c.lineTo(cx - 52, gy - bH * 0.18);
        c.lineTo(cx + 52, gy - bH * 0.18);
        c.lineTo(cx + 55, gy - bH * 0.07);
        c.closePath(); c.fill(); c.stroke();
        /* hull marble panels */
        c.strokeStyle = 'rgba(180,168,136,0.40)'; c.lineWidth = 0.6;
        for (var hp = -4; hp <= 4; hp++) { c.beginPath(); c.moveTo(cx + hp * 12, gy - bH * 0.07); c.lineTo(cx + hp * 12, gy - bH * 0.18); c.stroke(); }
        /* paddlewheel slots on side */
        c.fillStyle = marbleD3;
        c.beginPath(); c.arc(cx, gy - bH * 0.12, 10, 0, Math.PI * 2); c.stroke();
        for (var pw3 = 0; pw3 < 6; pw3++) { var pwa = pw3 * Math.PI / 3; c.beginPath(); c.moveTo(cx, gy - bH * 0.12); c.lineTo(cx + Math.cos(pwa) * 10, gy - bH * 0.12 + Math.sin(pwa) * 10); c.stroke(); }

        /* UPPER DECK — white marble */
        c.fillStyle = marble3; c.strokeStyle = marbleD3; c.lineWidth = 1;
        c.fillRect(cx - 46, gy - bH * 0.28, 92, bH * 0.10); c.strokeRect(cx - 46, gy - bH * 0.28, 92, bH * 0.10);
        /* deck columns */
        c.strokeStyle = 'rgba(180,168,136,0.42)'; c.lineWidth = 0.9;
        for (var mbc = -5; mbc <= 5; mbc++) { c.beginPath(); c.moveTo(cx + mbc * 8.5, gy - bH * 0.18); c.lineTo(cx + mbc * 8.5, gy - bH * 0.28); c.stroke(); }

        /* AFT PAVILION (right end) — imperial red + yellow roof */
        c.fillStyle = red7; c.strokeStyle = redD7; c.lineWidth = 1;
        c.fillRect(cx + 18, gy - bH * 0.38, 30, bH * 0.10); c.strokeRect(cx + 18, gy - bH * 0.38, 30, bH * 0.10);
        c.fillStyle = yellow3; c.strokeStyle = '#9a7008'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx + 16, gy - bH * 0.38); c.lineTo(cx + 33, gy - bH * 0.46); c.lineTo(cx + 50, gy - bH * 0.38); c.closePath(); c.fill(); c.stroke();
        /* eave tips */
        c.strokeStyle = '#c07010'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx + 16, gy - bH * 0.38); c.quadraticCurveTo(cx + 10, gy - bH * 0.34, cx + 8, gy - bH * 0.28); c.stroke();
        c.beginPath(); c.moveTo(cx + 50, gy - bH * 0.38); c.quadraticCurveTo(cx + 56, gy - bH * 0.34, cx + 58, gy - bH * 0.28); c.stroke();
        radialGlow(c, cx + 33, gy - bH * 0.44, 14, 255, 190, 60, 0.20);

        /* FORE PAVILION (left end) */
        c.fillStyle = red7; c.strokeStyle = redD7; c.lineWidth = 1;
        c.fillRect(cx - 48, gy - bH * 0.38, 30, bH * 0.10); c.strokeRect(cx - 48, gy - bH * 0.38, 30, bH * 0.10);
        c.fillStyle = yellow3; c.strokeStyle = '#9a7008'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 50, gy - bH * 0.38); c.lineTo(cx - 33, gy - bH * 0.46); c.lineTo(cx - 16, gy - bH * 0.38); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = '#c07010'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx - 50, gy - bH * 0.38); c.quadraticCurveTo(cx - 56, gy - bH * 0.34, cx - 58, gy - bH * 0.28); c.stroke();
        c.beginPath(); c.moveTo(cx - 16, gy - bH * 0.38); c.quadraticCurveTo(cx - 10, gy - bH * 0.34, cx - 8, gy - bH * 0.28); c.stroke();
        radialGlow(c, cx - 33, gy - bH * 0.44, 14, 255, 190, 60, 0.20);

        /* LONGEVITY HILL PAGODA (background) */
        var pgX2 = cx + 58;
        /* hill */
        c.fillStyle = '#363220'; c.strokeStyle = '#262210'; c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(pgX2 - 26, gy); c.lineTo(pgX2 - 26, gy - bH * 0.24);
        c.quadraticCurveTo(pgX2, gy - bH * 0.40, pgX2 + 26, gy - bH * 0.24);
        c.lineTo(pgX2 + 26, gy); c.closePath(); c.fill(); c.stroke();
        /* five-tier pagoda */
        for (var pt2 = 0; pt2 < 5; pt2++) {
            var pW2 = 17 - pt2 * 2.8, pY2 = gy - bH * (0.40 + pt2 * 0.10);
            c.fillStyle = red7; c.strokeStyle = redD7; c.lineWidth = 0.8;
            c.fillRect(pgX2 - pW2, pY2, pW2 * 2, bH * 0.10); c.strokeRect(pgX2 - pW2, pY2, pW2 * 2, bH * 0.10);
            /* yellow eave */
            c.fillStyle = yellow3; c.strokeStyle = '#9a7008'; c.lineWidth = 0.8;
            c.beginPath(); c.moveTo(pgX2 - pW2 - 5, pY2); c.lineTo(pgX2, pY2 - bH * 0.06); c.lineTo(pgX2 + pW2 + 5, pY2); c.closePath(); c.fill(); c.stroke();
            c.strokeStyle = '#c07010'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(pgX2 - pW2 - 5, pY2); c.quadraticCurveTo(pgX2 - pW2 - 9, pY2 + 4, pgX2 - pW2 - 11, pY2 - 5); c.stroke();
            c.beginPath(); c.moveTo(pgX2 + pW2 + 5, pY2); c.quadraticCurveTo(pgX2 + pW2 + 9, pY2 + 4, pgX2 + pW2 + 11, pY2 - 5); c.stroke();
            radialGlow(c, pgX2, pY2 - bH * 0.04, 8, 255, 180, 60, 0.14);
        }
        /* pagoda spire */
        c.strokeStyle = gold8; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(pgX2, gy - bH * 0.86); c.lineTo(pgX2, gy - bH); c.stroke();
        c.fillStyle = goldL8; c.beginPath(); c.arc(pgX2, gy - bH, 3.5, 0, Math.PI * 2); c.fill();
        radialGlow(c, pgX2, gy - bH * 0.93, 22, 220, 180, 60, 0.28);

        /* lake reflection of pagoda */
        c.fillStyle = 'rgba(180,130,40,0.14)';
        c.beginPath(); c.ellipse(pgX2, gy - bH * 0.04, 14, 5, 0, 0, Math.PI * 2); c.fill();
    }

    /* ══════════════════════════════════════════════
       ROME LANDMARKS  (rich travertine / cream marble / ancient palette)
    ══════════════════════════════════════════════ */
    function drawColosseum(c, cx, gy) {
        var bH = H * 0.32, bW = W * 0.16;
        var trav = '#c8a860', travD = '#a88640', travL = '#e0c080';
        var dark3 = '#181010';

        radialGlow(c, cx, gy - bH * 0.25, 100, 255, 180, 80, 0.16);

        /* outer travertine wall */
        c.fillStyle = trav; c.strokeStyle = travD; c.lineWidth = 1;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.50, bW, bH * 0.50, 0, 0, Math.PI * 2); c.fill(); c.stroke();

        /* tiered arcade rings */
        c.strokeStyle = 'rgba(140,100,40,0.32)'; c.lineWidth = 0.8;
        for (var ec = 1; ec < 4; ec++) {
            c.beginPath(); c.ellipse(cx, gy - bH * 0.50, bW - ec * 0.5, bH * (0.50 - ec * 0.06), 0, 0, Math.PI * 2); c.stroke();
        }

        /* dark interior cutout */
        c.fillStyle = dark3;
        c.beginPath(); c.ellipse(cx, gy - bH * 0.50, bW * 0.72, bH * 0.38, 0, 0, Math.PI * 2); c.fill();

        /* arena sand floor */
        c.fillStyle = '#a09060';
        c.beginPath(); c.ellipse(cx, gy - bH * 0.50, bW * 0.52, bH * 0.22, 0, 0, Math.PI * 2); c.fill();
        /* hypogeum lines */
        c.strokeStyle = 'rgba(80,60,30,0.35)'; c.lineWidth = 0.8;
        for (var hg = -2; hg <= 2; hg++) { c.beginPath(); c.moveTo(cx + hg * bW * 0.18, gy - bH * 0.36); c.lineTo(cx + hg * bW * 0.18, gy - bH * 0.65); c.stroke(); }

        /* three arcade tiers of arches on exterior face */
        c.fillStyle = dark3;
        for (var aa2 = -6; aa2 <= 6; aa2++) {
            var aax2 = cx + aa2 * (bW * 0.145);
            if (Math.abs(aax2 - cx) < bW * 0.86) {
                for (var at = 0; at < 3; at++) {
                    var aay = gy - bH * (0.13 + at * 0.17);
                    var aarW = bW * 0.055;
                    c.beginPath(); c.arc(aax2, aay, aarW, Math.PI, 0, false); c.fill();
                    c.fillRect(aax2 - aarW, aay, aarW * 2, bH * 0.14);
                }
            }
        }

        /* pilasters between arches */
        c.strokeStyle = 'rgba(180,140,60,0.32)'; c.lineWidth = 0.8;
        for (var pil = -5; pil <= 5; pil++) {
            var pilx = cx + pil * (bW * 0.18);
            if (Math.abs(pilx - cx) < bW) { c.beginPath(); c.moveTo(pilx, gy - bH * 0.06); c.lineTo(pilx, gy - bH * 0.56); c.stroke(); }
        }

        /* north wall damage — iconic broken section */
        c.fillStyle = dark3;
        c.beginPath();
        c.moveTo(cx + bW * 0.58, gy - bH * 0.50);
        c.ellipse(cx, gy - bH * 0.50, bW, bH * 0.50, 0, -Math.PI * 0.32, -Math.PI * 0.04, false);
        c.lineTo(cx + bW * 0.83, gy - bH * 0.16);
        c.ellipse(cx, gy - bH * 0.50, bW * 0.80, bH * 0.40, 0, -Math.PI * 0.04, -Math.PI * 0.32, true);
        c.closePath(); c.fill();
        /* broken-wall jagged edge */
        c.strokeStyle = travD; c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(cx + bW * 0.60, gy - bH * 0.60);
        c.lineTo(cx + bW * 0.68, gy - bH * 0.52);
        c.lineTo(cx + bW * 0.74, gy - bH * 0.57);
        c.lineTo(cx + bW * 0.80, gy - bH * 0.42);
        c.lineTo(cx + bW * 0.86, gy - bH * 0.34);
        c.stroke();
    }
    function drawStPetersDome(c, cx, gy) {
        var bH = H * 0.42;
        var marble = '#e8ddc8', marbleD = '#c4b898', marbleL = '#f4ecd8';
        var gold = '#c8a030', goldL = '#e8c040';

        radialGlow(c, cx, gy, 100, 255, 220, 160, 0.15);

        /* Egyptian obelisk in piazza */
        c.fillStyle = '#4a3820'; c.strokeStyle = '#3a2a10'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(cx - 55, gy); c.lineTo(cx - 57, gy - bH * 0.14); c.lineTo(cx - 53, gy - bH * 0.14); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = gold;
        c.beginPath(); c.moveTo(cx - 56, gy - bH * 0.14); c.lineTo(cx - 55, gy - bH * 0.17); c.lineTo(cx - 54, gy - bH * 0.14); c.closePath(); c.fill();

        /* Bernini colonnade */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
        c.fillRect(cx - 70, gy - bH * 0.15, 140, bH * 0.15); c.strokeRect(cx - 70, gy - bH * 0.15, 140, bH * 0.15);
        c.strokeStyle = 'rgba(160,140,100,0.35)'; c.lineWidth = 1;
        for (var col3 = -8; col3 <= 8; col3++) { c.beginPath(); c.moveTo(cx + col3 * 8.5, gy); c.lineTo(cx + col3 * 8.5, gy - bH * 0.15); c.stroke(); }
        c.fillStyle = 'rgba(220,200,160,0.25)'; c.fillRect(cx - 70, gy - bH * 0.15, 140, 3);
        /* colonnade statues */
        c.fillStyle = marbleD;
        for (var cs2 = -6; cs2 <= 6; cs2 += 2) {
            var csx2 = cx + cs2 * 10;
            c.fillRect(csx2 - 2, gy - bH * 0.18, 4, 6);
            c.beginPath(); c.arc(csx2, gy - bH * 0.19, 2.5, 0, Math.PI * 2); c.fill();
        }

        /* basilica facade — wide Classical */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
        c.fillRect(cx - 34, gy - bH * 0.46, 68, bH * 0.31); c.strokeRect(cx - 34, gy - bH * 0.46, 68, bH * 0.31);
        c.strokeStyle = 'rgba(160,140,100,0.30)'; c.lineWidth = 1;
        for (var fp = -3; fp <= 3; fp++) { c.beginPath(); c.moveTo(cx + fp * 10, gy - bH * 0.15); c.lineTo(cx + fp * 10, gy - bH * 0.46); c.stroke(); }
        /* central portal */
        c.fillStyle = '#0e0c0a';
        c.beginPath(); c.arc(cx, gy - bH * 0.25, 10, Math.PI, 0, false);
        c.rect(cx - 10, gy - bH * 0.25, 20, bH * 0.10); c.fill();
        /* triangular pediment */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 34, gy - bH * 0.46); c.lineTo(cx, gy - bH * 0.55); c.lineTo(cx + 34, gy - bH * 0.46); c.closePath(); c.fill(); c.stroke();

        /* drum — proportional radius: bottom=pediment peak (bH*0.55), top=dome base (bH*0.69) */
        c.fillStyle = marbleD; c.strokeStyle = '#a09070'; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, gy - bH * 0.62, bH * 0.07, 0, Math.PI * 2); c.fill(); c.stroke();
        /* drum windows — warm glow */
        for (var dw = 0; dw < 6; dw++) {
            var dwa = dw * Math.PI / 3;
            radialGlow(c, cx + Math.cos(dwa) * bH * 0.055, gy - bH * 0.62 + Math.sin(dwa) * bH * 0.04, 8, 255, 230, 180, 0.22);
        }

        /* main dome — flat base at drum top (gy-bH*0.69), top at gy-bH*0.79 */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1.2;
        c.beginPath(); c.arc(cx, gy - bH * 0.69, bH * 0.10, Math.PI, 0, false); c.closePath(); c.fill(); c.stroke();
        /* golden dome ribs */
        c.strokeStyle = gold; c.lineWidth = 1.3;
        for (var rib3 = -4; rib3 <= 4; rib3++) {
            var ra3 = rib3 * Math.PI / 10;
            c.beginPath(); c.moveTo(cx, gy - bH * 0.69); c.lineTo(cx + Math.cos(ra3) * bH * 0.10, gy - bH * 0.69 - Math.sin(Math.abs(ra3)) * bH * 0.10); c.stroke();
        }
        /* specular highlight */
        c.fillStyle = 'rgba(255,240,200,0.14)';
        c.beginPath(); c.arc(cx - bH * 0.03, gy - bH * 0.76, bH * 0.04, Math.PI, 0, false); c.fill();
        radialGlow(c, cx, gy - bH * 0.69, bH * 0.12, 220, 200, 160, 0.14);

        /* lantern — bottom at dome top (gy-bH*0.79) */
        c.fillStyle = marble; c.strokeStyle = marbleD; c.lineWidth = 1;
        c.fillRect(cx - 6, gy - bH * 0.96, 12, bH * 0.17); c.strokeRect(cx - 6, gy - bH * 0.96, 12, bH * 0.17);
        c.strokeStyle = 'rgba(160,140,100,0.35)'; c.lineWidth = 0.7;
        for (var lc2 = -2; lc2 <= 2; lc2++) { c.beginPath(); c.moveTo(cx + lc2 * 3, gy - bH * 0.79); c.lineTo(cx + lc2 * 3, gy - bH * 0.96); c.stroke(); }
        /* gold cross */
        c.strokeStyle = gold; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(cx, gy - bH * 0.96); c.lineTo(cx, gy - bH); c.stroke();
        c.beginPath(); c.moveTo(cx - 7, gy - bH * 0.98); c.lineTo(cx + 7, gy - bH * 0.98); c.stroke();
        radialGlow(c, cx, gy - bH, 20, 255, 220, 140, 0.38);
        c.fillStyle = goldL; c.beginPath(); c.arc(cx, gy - bH, 3, 0, Math.PI * 2); c.fill();
    }

    /* ══════════════════════════════════════════════
       CITY SYSTEM
    ══════════════════════════════════════════════ */
    var currentCityIndex = 0;
    var airplane = null;
    var cityLabelTimer = 0;
    var CITIES = [
        { name:'NEW YORK',  build:function(){ LM=[
            {fn:drawStatueOfLiberty,x:W*0.06,wins:null},
            {fn:drawBrooklynBridge, x:W*0.20,wins:null},
            {fn:drawFlatiron,       x:W*0.36,wins:genWins(21)},
            {fn:drawRockCenter,     x:W*0.50,wins:genWins(54)},
            {fn:drawEmpireState,    x:W*0.63,wins:genWins(88)},
            {fn:drawChrysler,       x:W*0.76,wins:genWins(63)},
            {fn:drawOneWTC,         x:W*0.89,wins:genWins(50)}
        ];}},
        { name:'CHICAGO',   build:function(){ LM=[
            {fn:drawNavyPierFerris, x:W*0.10,wins:null},
            {fn:drawChicagoWaterTower,x:W*0.26,wins:null},
            {fn:drawHancockCenter,  x:W*0.45,wins:genWins(60)},
            {fn:drawWillisTower,    x:W*0.65,wins:genWins(90)},
            {fn:drawNavyPierFerris, x:W*0.88,wins:null}
        ];}},
        { name:'TOKYO',     build:function(){ LM=[
            {fn:drawBlossom,        x:W*0.06,wins:null},
            {fn:drawPagoda,         x:W*0.18,wins:null},
            {fn:drawBlossom,        x:W*0.30,wins:null},
            {fn:drawTokyoTower,     x:W*0.44,wins:null},
            {fn:drawBlossom,        x:W*0.58,wins:null},
            {fn:drawTokyoSkytree,   x:W*0.72,wins:null},
            {fn:drawPagoda,         x:W*0.88,wins:null}
        ];}},
        { name:'BEIJING',   build:function(){ LM=[
            {fn:drawSummerPalace,   x:W*0.08,wins:null},
            {fn:drawTempleOfHeaven, x:W*0.22,wins:null},
            {fn:drawTiananmen,      x:W*0.36,wins:null},
            {fn:drawForbiddenCity,  x:W*0.52,wins:null},
            {fn:drawCCTV,           x:W*0.66,wins:genWins(40)},
            {fn:drawBirdsNest,      x:W*0.80,wins:null},
            {fn:drawTempleOfHeaven, x:W*0.93,wins:null}
        ];}},
        { name:'LONDON',    build:function(){ LM=[
            {fn:drawBigBen,         x:W*0.14,wins:null},
            {fn:drawTowerBridge,    x:W*0.36,wins:null},
            {fn:drawTheShard,       x:W*0.56,wins:genWins(60)},
            {fn:drawBigBen,         x:W*0.74,wins:null},
            {fn:drawTowerBridge,    x:W*0.90,wins:null}
        ];}},
        { name:'DUBAI',     build:function(){ LM=[
            {fn:drawDubaiFrame,     x:W*0.10,wins:null},
            {fn:drawPalmTree,       x:W*0.20,wins:null},
            {fn:drawBurjAlArab,     x:W*0.33,wins:null},
            {fn:drawPalmTree,       x:W*0.44,wins:null},
            {fn:drawBurjKhalifa,    x:W*0.55,wins:genWins(100)},
            {fn:drawPalmTree,       x:W*0.68,wins:null},
            {fn:drawBurjAlArab,     x:W*0.78,wins:null},
            {fn:drawDubaiFrame,     x:W*0.90,wins:null}
        ];}},
        { name:'PARIS',     build:function(){ LM=[
            {fn:drawLouvre,         x:W*0.07,wins:null},
            {fn:drawNotreDame,      x:W*0.20,wins:null},
            {fn:drawSacreCoeur,     x:W*0.34,wins:null},
            {fn:drawPantheon,       x:W*0.48,wins:null},
            {fn:drawEiffelTower,    x:W*0.63,wins:null},
            {fn:drawArcDeTriomphe,  x:W*0.78,wins:null},
            {fn:drawNotreDame,      x:W*0.92,wins:null}
        ];}},
        { name:'PRAGUE',    build:function(){ LM=[
            {fn:drawTynChurch,          x:W*0.09,wins:null},
            {fn:drawAstronomicalClock,  x:W*0.24,wins:null},
            {fn:drawCharlesBridge,      x:W*0.44,wins:null},
            {fn:drawPragueCastle,       x:W*0.64,wins:null},
            {fn:drawTynChurch,          x:W*0.79,wins:null},
            {fn:drawAstronomicalClock,  x:W*0.93,wins:null}
        ];}}
    ];

    /* ══════════════════════════════════════════════
       LANDMARK CONFIG
    ══════════════════════════════════════════════ */

    function buildLandmarks() {
        CITIES[currentCityIndex].build();
    }

    /* ══════════════════════════════════════════════
       SKY + GROUND (bgCvs — every frame, fast)
    ══════════════════════════════════════════════ */

    function drawBg() {
        var ev=EVENTS[eventIndex];
        var rdH=H-GROUND;

        /* sky — ALWAYS light blue regardless of weather event.
           Weather elements (clouds, rain, lightning, meteors, etc.) still
           render on top in drawDynamic. */
        var sky=bgC.createLinearGradient(0,0,0,GROUND);
        sky.addColorStop(0, '#a8d6ff');
        sky.addColorStop(1, '#e6f3ff');
        bgC.fillStyle=sky; bgC.fillRect(0,0,W,H);

        /* sun is always present on the light blue sky */
        radialGlow(bgC, W*0.82,H*0.12, 90, 255,240,180, 0.30);
        radialGlow(bgC, W*0.82,H*0.12, 44, 255,250,210, 0.55);
        bgC.fillStyle='rgba(255,252,230,0.98)';
        bgC.beginPath(); bgC.arc(W*0.82,H*0.12,22,0,Math.PI*2); bgC.fill();

        /* overcast cloud wisps */
        var bgType=effType(ev);
        if(bgType==='snow'||bgType==='blizzard'||bgType==='rain') {
            bgC.fillStyle='rgba(255,255,255,0.22)';
            for(var ci=0;ci<6;ci++) {
                var cx2=(ci*W/5.5+40)%W, cy2=H*0.08+ci*H*0.03;
                bgC.beginPath(); bgC.ellipse(cx2,cy2,80+ci*20,18+ci*4,0,0,Math.PI*2); bgC.fill();
            }
        }

        /* heat glow disk */
        if(bgType==='heat') {
            radialGlow(bgC, W*0.15,H*0.09, 110, 255,140,40, 0.45);
            radialGlow(bgC, W*0.15,H*0.09,  55, 255,200,80, 0.65);
            bgC.fillStyle='rgba(255,220,100,0.98)';
            bgC.beginPath(); bgC.arc(W*0.15,H*0.09,20,0,Math.PI*2); bgC.fill();
        }

        /* road */
        bgC.fillStyle='#181820';
        bgC.fillRect(0,GROUND,W,rdH*0.52);

        /* road center dashes */
        bgC.strokeStyle='rgba(255,220,0,0.55)';
        bgC.setLineDash([22,14]); bgC.lineWidth=2;
        bgC.beginPath(); bgC.moveTo(0,GROUND+rdH*0.26); bgC.lineTo(W,GROUND+rdH*0.26); bgC.stroke();
        bgC.setLineDash([]);

        /* edge lines */
        bgC.strokeStyle='rgba(255,255,255,0.18)'; bgC.lineWidth=1.5;
        bgC.beginPath(); bgC.moveTo(0,GROUND+rdH*0.04); bgC.lineTo(W,GROUND+rdH*0.04); bgC.stroke();
        bgC.beginPath(); bgC.moveTo(0,GROUND+rdH*0.50); bgC.lineTo(W,GROUND+rdH*0.50); bgC.stroke();

        /* sidewalks */
        bgC.fillStyle='#14142a'; bgC.fillRect(0,GROUND+rdH*0.51,W,rdH*0.11);
        bgC.fillStyle='#121228'; bgC.fillRect(0,GROUND+rdH*0.80,W,rdH*0.20);

        /* street lamps + cone beams */
        for(var l=0;l<10;l++) {
            var lx=(l+0.5)*W/10;
            var ly=GROUND+rdH*0.51;
            /* cone beam */
            lampCone(bgC, lx, ly-rdH*0.46, 0);
            /* pavement glow pool */
            radialGlow(bgC, lx,ly+8, 38, 255,210,90, 0.20);
            /* post */
            bgC.strokeStyle='#22223c'; bgC.lineWidth=2;
            bgC.beginPath(); bgC.moveTo(lx,ly); bgC.lineTo(lx,GROUND+rdH*0.05); bgC.stroke();
            /* arm */
            bgC.beginPath(); bgC.moveTo(lx,GROUND+rdH*0.05); bgC.lineTo(lx+8,GROUND+rdH*0.03); bgC.stroke();
            /* bulb */
            bgC.fillStyle='rgba(255,218,100,0.95)';
            bgC.beginPath(); bgC.arc(lx+8,GROUND+rdH*0.03,3.5,0,Math.PI*2); bgC.fill();
        }

        /* river */
        bgC.fillStyle='#02050b';
        bgC.fillRect(0,GROUND+rdH,W,H-(GROUND+rdH));
        /* river shimmer */
        bgC.strokeStyle='rgba(30,60,120,0.25)'; bgC.lineWidth=1;
        for(var rw=0;rw<4;rw++) {
            var ry=GROUND+rdH+rw*8;
            bgC.beginPath(); bgC.moveTo(0,ry); bgC.lineTo(W,ry); bgC.stroke();
        }
    }

    /* ══════════════════════════════════════════════
       CITY LAYER (cached)
    ══════════════════════════════════════════════ */

    function drawCity() {
        if(cityBuilt) return;
        cityBuilt=true;
        cityC.clearRect(0,0,W,H);

        for(var i=0;i<BGBUILDS.length;i++) drawBgBuilding(cityC,BGBUILDS[i]);
        for(var i=0;i<LM.length;i++) LM[i].fn(cityC,LM[i].x,GROUND,LM[i].wins);
    }

    /* ══════════════════════════════════════════════
       VEHICLES — 5 types, realistic side profiles
    ══════════════════════════════════════════════ */

    var VEH_TYPES  = ['taxi','sedan','nypd','bus','truck'];
    var SEDAN_COLS = ['#c82020','#205ac8','#20a820','#c89020','#882088','#208888','#c0c0c0','#f0ece8'];

    function makeVehicle() {
        var type = VEH_TYPES[rngI(0,VEH_TYPES.length)];
        var dir  = rngI(0,2)===0 ? 1 : -1;
        return {
            type: type, x: rng(-200,W+200), dir: dir,
            speed: (type==='bus'||type==='truck') ? rng(0.5,1.4) : rng(1.0,2.8),
            baseSpeed: 0,
            lit: rng(0,1)<0.75,
            col: (type==='sedan') ? SEDAN_COLS[rngI(0,SEDAN_COLS.length)] : null,
            lightPhase: rng(0,Math.PI*2),
            wiperT: rng(0,Math.PI*2),
            hazT: rng(0,Math.PI*2),
            drift: 0,
            yOff: 0
        };
    }

    function initVehicles() {
        vehicles=[];
        for(var i=0;i<22;i++) {
            var v=makeVehicle();
            v.baseSpeed=v.speed;
            vehicles.push(v);
        }
    }

    function updateVehicles(dt) {
        var type=effType(EVENTS[eventIndex]);
        /* speed multiplier — bad weather slows traffic */
        var spMul = 1;
        if(type==='rain') spMul=0.65;
        else if(type==='storm') spMul=0.45;
        else if(type==='snow') spMul=0.55;
        else if(type==='blizzard') spMul=0.30;
        else if(type==='hail') spMul=0.45;
        else if(type==='flood') spMul=0.25;
        else if(type==='tornado') spMul=0.20;
        else if(type==='earthquake') spMul=0.15;
        else if(type==='meteor') spMul=0.35;
        else if(type==='bloodmoon') spMul=0.55;
        else if(type==='heat') spMul=0.75;
        else if(type==='wind') spMul=1.2;
        for(var i=0;i<vehicles.length;i++) {
            var v=vehicles[i];
            v.x+=v.dir*v.speed*spMul*dt*0.055;
            v.lightPhase+=dt*0.005;
            v.wiperT+=dt*0.012;
            v.hazT+=dt*0.008;
            /* lateral drift in tornado / wind / earthquake */
            if(type==='tornado') {
                var dist=v.x-tX;
                v.drift += -Math.sign(dist)*Math.max(0,(200-Math.abs(dist))/200)*0.4*dt*0.02;
                v.x+=v.drift*dt*0.02;
            } else if(type==='wind') {
                v.drift = Math.sin(performance.now()*0.001 + v.x*0.01)*1.2;
            } else if(type==='earthquake') {
                v.yOff = Math.sin(performance.now()*0.025 + v.x*0.02)*1.4;
                v.xShake = Math.cos(performance.now()*0.030 + v.x*0.015)*1.2;
            } else {
                v.drift *= 0.95; v.yOff *= 0.9; v.xShake *= 0.9;
            }
            if(v.x>W+220) v.x=-220;
            if(v.x<-220)  v.x=W+220;
        }
    }

    /* tyre + hubcap */
    function drawWheel(c, cx, cy, r) {
        c.fillStyle='#181818';
        c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(100,100,100,0.50)'; c.lineWidth=r*0.16;
        c.beginPath(); c.arc(cx,cy,r*0.80,-2.1,-0.8); c.stroke();
        c.fillStyle='#a8a8a8';
        c.beginPath(); c.arc(cx,cy,r*0.44,0,Math.PI*2); c.fill();
        c.fillStyle='#787878';
        c.beginPath(); c.arc(cx,cy,r*0.14,0,Math.PI*2); c.fill();
    }

    /* realistic car body silhouette + glass
       d=1 → faces right (front is rightward), d=-1 → faces left
       fw/rw/bH/cH in pixels; cfi/cri = cabin inset from bumper; wsl/rgl = glass lean */
    function carProfile(c, x, by, d, fw, rw, bH, cH, cfi, cri, wsl, rgl, bodyCol, glassCol, outlineCol) {
        var xF   = x + d*fw;           /* front bumper */
        var xR   = x - d*rw;           /* rear bumper  */
        var xCF  = x + d*(fw-cfi);     /* windshield base (on hood) */
        var xCR  = x - d*(rw-cri);     /* rear-glass base (on trunk) */
        var xWF  = xCF - d*wsl;        /* windshield top (leans rearward) */
        var xWR  = xCR + d*rgl;        /* rear-glass top (leans forward) */
        var hY   = by - bH;            /* hood/trunk level */
        var rY   = hY - cH;            /* roofline */

        /* full body */
        c.fillStyle = bodyCol;
        c.beginPath();
        c.moveTo(xR, by);  c.lineTo(xF, by);    /* floor */
        c.lineTo(xF, hY);  c.lineTo(xCF, hY);   /* front bumper face + hood */
        c.lineTo(xWF, rY); c.lineTo(xWR, rY);   /* windshield + roof */
        c.lineTo(xCR, hY); c.lineTo(xR, hY);    /* rear glass + trunk */
        c.closePath(); c.fill();

        /* outline */
        c.strokeStyle = outlineCol||'rgba(0,0,0,0.38)'; c.lineWidth=0.9;
        c.beginPath();
        c.moveTo(xR,by); c.lineTo(xF,by); c.lineTo(xF,hY); c.lineTo(xCF,hY);
        c.lineTo(xWF,rY); c.lineTo(xWR,rY); c.lineTo(xCR,hY); c.lineTo(xR,hY);
        c.closePath(); c.stroke();

        /* glass */
        c.fillStyle = glassCol||'rgba(140,200,240,0.60)';
        c.beginPath();
        c.moveTo(xCR,hY); c.lineTo(xCF,hY);
        c.lineTo(xWF,rY); c.lineTo(xWR,rY);
        c.closePath(); c.fill();

        /* A-pillar */
        c.strokeStyle='rgba(0,0,0,0.28)'; c.lineWidth=1.1;
        c.beginPath(); c.moveTo(xCF,hY); c.lineTo(xWF,rY); c.stroke();
        /* C-pillar */
        c.beginPath(); c.moveTo(xCR,hY); c.lineTo(xWR,rY); c.stroke();
        /* B-pillar + door line */
        c.lineWidth=0.8;
        var bp=(xCF+xCR)/2;
        c.beginPath(); c.moveTo(bp,hY); c.lineTo(bp,by); c.stroke();

        return {xF:xF,xR:xR,xCF:xCF,xCR:xCR,xWF:xWF,xWR:xWR,hY:hY,rY:rY};
    }

    function drawVehicle(c, v) {
        var rdH = H-GROUND;
        var s   = Math.max(5, rdH*0.12);    /* scale unit */
        var wr  = Math.max(3, s*0.30);      /* wheel radius */
        /* lane split by direction so opposite-direction cars don't drive through each other */
        var laneOff = (v.dir===1) ? rdH*0.06 : -rdH*0.06;
        var by  = GROUND + rdH*0.10 + laneOff; /* body bottom */
        var wy  = by + wr*0.52;             /* wheel centre (half-embedded) */
        var d   = v.dir, x = v.x;

        if (v.type==='taxi') {
            var p = carProfile(c,x,by,d, s*0.96,s*0.96, s*0.42,s*0.46,
                               s*0.28,s*0.30, s*0.16,s*0.14,
                               '#f5c518','rgba(80,135,180,0.96)','#b89000');
            /* taxi roof sign */
            var sW=s*0.40, sH=s*0.17, sY=p.rY-sH-1;
            c.fillStyle='#fff'; c.fillRect(x-sW/2,sY,sW,sH);
            c.fillStyle='#222'; c.font='bold '+(s*0.13)+'px sans-serif'; c.textAlign='center';
            c.fillText('TAXI',x,sY+sH*0.82); c.textAlign='left';
            /* headlights */
            c.fillStyle='#fffce0'; c.fillRect(Math.min(p.xF,p.xF-d*2),by-p.hY>0?by-2:p.hY+2,2,s*0.18);
            if(v.lit) radialGlow(c,p.xF+d*2,by-s*0.20,s*0.80,255,248,200,0.32);
            /* taillights */
            c.fillStyle='#ff1800'; c.fillRect(Math.min(p.xR,p.xR+d*2),by-s*0.30,2,s*0.18);
            radialGlow(c,p.xR-d*2,by-s*0.22,s*0.30,255,20,0,0.22);
            drawWheel(c, x+d*s*0.50, wy, wr);
            drawWheel(c, x-d*s*0.50, wy, wr);

        } else if (v.type==='sedan') {
            var p = carProfile(c,x,by,d, s*0.90,s*0.90, s*0.36,s*0.44,
                               s*0.24,s*0.32, s*0.20,s*0.18,
                               v.col,'rgba(60,115,170,0.95)','rgba(0,0,0,0.36)');
            c.fillStyle='#fffce0'; c.fillRect(Math.min(p.xF,p.xF-d*2),by-s*0.26,2,s*0.16);
            if(v.lit) radialGlow(c,p.xF+d*2,by-s*0.18,s*0.78,255,248,200,0.28);
            c.fillStyle='#ff1000'; c.fillRect(Math.min(p.xR,p.xR+d*2),by-s*0.28,2,s*0.16);
            drawWheel(c, x+d*s*0.48, wy, wr);
            drawWheel(c, x-d*s*0.48, wy, wr);

        } else if (v.type==='nypd') {
            var p = carProfile(c,x,by,d, s*0.94,s*0.94, s*0.40,s*0.44,
                               s*0.26,s*0.30, s*0.15,s*0.13,
                               '#141418','rgba(45,90,140,0.95)','rgba(0,0,0,0.50)');
            /* white door panel */
            var dL=Math.min(p.xCF,p.xCR), dR=Math.max(p.xCF,p.xCR);
            c.fillStyle='#d8dcea'; c.fillRect(dL,p.hY,dR-dL,s*0.22);
            c.fillStyle='#141418'; c.font='bold '+(s*0.12)+'px sans-serif'; c.textAlign='center';
            c.fillText('NYPD',x,p.hY+s*0.20); c.textAlign='left';
            /* lightbar */
            var lb=Math.sin(v.lightPhase*3)>0;
            var lbW=s*0.58,lbH=s*0.11,lbX=x-lbW/2,lbY=p.rY-lbH;
            c.fillStyle='#1a1a1a'; c.fillRect(lbX,lbY,lbW,lbH);
            c.fillStyle=lb?'rgba(0,80,255,0.96)':'rgba(255,20,20,0.96)';
            c.fillRect(lbX+1,lbY+1,lbW/2-2,lbH-2);
            c.fillStyle=lb?'rgba(255,20,20,0.96)':'rgba(0,80,255,0.96)';
            c.fillRect(lbX+lbW/2+1,lbY+1,lbW/2-2,lbH-2);
            if(lb) radialGlow(c,x-lbW*0.25,lbY,s*0.75,0,80,255,0.45);
            else   radialGlow(c,x+lbW*0.25,lbY,s*0.75,255,20,20,0.45);
            c.fillStyle='#fffce0'; c.fillRect(Math.min(p.xF,p.xF-d*2),by-s*0.28,2,s*0.18);
            if(v.lit) radialGlow(c,p.xF+d*2,by-s*0.20,s*0.78,255,248,200,0.28);
            c.fillStyle='#ff0000'; c.fillRect(Math.min(p.xR,p.xR+d*2),by-s*0.28,2,s*0.18);
            drawWheel(c, x+d*s*0.50, wy, wr);
            drawWheel(c, x-d*s*0.50, wy, wr);

        } else if (v.type==='bus') {
            /* MTA bus — long flat box with angled front face */
            var bw=s*1.90, bh=s*1.55;
            var xL=x-bw, xR2=x+bw, bTop=by-bh;
            /* body */
            c.fillStyle='#1a3870';
            c.fillRect(xL,bTop,xR2-xL,bh);
            /* cream waist band */
            c.fillStyle='#cec8b4';
            c.fillRect(xL,bTop+bh*0.52,xR2-xL,bh*0.18);
            /* darker roof stripe */
            c.fillStyle='#102860';
            c.fillRect(xL,bTop,xR2-xL,bh*0.07);
            /* angled front face */
            var frontX = d===1 ? xR2 : xL;
            c.fillStyle='rgba(0,0,0,0.22)';
            c.beginPath();
            c.moveTo(frontX,bTop); c.lineTo(frontX+d*s*0.12,bTop+bh*0.25);
            c.lineTo(frontX+d*s*0.12,by); c.lineTo(frontX,by);
            c.closePath(); c.fill();
            /* windows — 7 evenly spaced */
            c.fillStyle='rgba(55,110,165,0.96)';
            var nw=7, wWin=(xR2-xL-s*0.50)/nw, wGap=s*0.10;
            for(var bi2=0;bi2<nw;bi2++) {
                var wx4=xL+s*0.25+bi2*(wWin+wGap);
                c.fillRect(wx4,bTop+bh*0.12,wWin-wGap,bh*0.32);
            }
            /* destination display at front */
            var destX2=d===1?xR2-s*0.55:xL+s*0.15;
            c.fillStyle='rgba(255,255,60,0.88)';
            c.fillRect(destX2,bTop+bh*0.10,s*0.35,bh*0.22);
            /* outline */
            c.strokeStyle='rgba(0,0,0,0.35)'; c.lineWidth=1.2;
            c.strokeRect(xL,bTop,xR2-xL,bh);
            /* MTA label */
            c.fillStyle='rgba(255,255,255,0.55)'; c.font='bold '+(s*0.15)+'px sans-serif'; c.textAlign='center';
            c.fillText('MTA',x,bTop+bh*0.46); c.textAlign='left';
            if(v.lit) radialGlow(c,frontX+d*s*0.14,by-bh*0.50,s*0.90,255,248,220,0.30);
            var bwr=wr*1.10;
            drawWheel(c, x+bw*0.68,  by+bwr*0.50, bwr);
            drawWheel(c, x+bw*0.10,  by+bwr*0.50, bwr);
            drawWheel(c, x-bw*0.68,  by+bwr*0.50, bwr);

        } else if (v.type==='truck') {
            /* box truck: cab at front, cargo box at rear */
            var tcW=s*0.70, tbW=s*1.50, tbH=s*1.12, tcH=s*0.82;
            var cabFront = x+d*tcW;   /* front bumper of cab */
            var boxRear  = x-d*tbW;   /* rear of cargo box  */
            /* cargo box */
            var bxL=Math.min(x,boxRear), bxW=Math.abs(x-boxRear);
            c.fillStyle='#b0a898'; c.fillRect(bxL,by-tbH,bxW,tbH);
            /* box door horizontal bands */
            c.strokeStyle='rgba(0,0,0,0.18)'; c.lineWidth=0.8;
            for(var dl2=1;dl2<3;dl2++) {
                c.beginPath(); c.moveTo(bxL+1,by-tbH*dl2/3); c.lineTo(bxL+bxW-1,by-tbH*dl2/3); c.stroke();
            }
            /* vertical rear door seam */
            var rearSeam=d===1?bxL+s*0.22:bxL+bxW-s*0.22;
            c.beginPath(); c.moveTo(rearSeam,by-tbH); c.lineTo(rearSeam,by); c.stroke();
            c.strokeStyle='rgba(0,0,0,0.25)'; c.lineWidth=1;
            c.strokeRect(bxL+0.5,by-tbH+0.5,bxW-1,tbH-1);
            /* company stripe */
            c.fillStyle='rgba(200,80,20,0.55)';
            c.fillRect(bxL,by-tbH*0.60,bxW,tbH*0.12);
            /* cab silhouette */
            c.fillStyle='#887c6e';
            c.beginPath();
            c.moveTo(x,by);
            c.lineTo(cabFront,by);
            c.lineTo(cabFront,by-tcH*0.62);   /* front lower */
            c.lineTo(cabFront-d*s*0.10,by-tcH);/* hood/windshield join */
            c.lineTo(x,by-tcH);               /* top at cab-box join */
            c.closePath(); c.fill();
            c.strokeStyle='rgba(0,0,0,0.30)'; c.lineWidth=1; c.stroke();
            /* cab windshield glass */
            c.fillStyle='rgba(130,192,228,0.65)';
            c.beginPath();
            c.moveTo(cabFront-d*s*0.06, by-tcH*0.64);
            c.lineTo(cabFront-d*s*0.14, by-tcH*0.96);
            c.lineTo(x+d*s*0.05,        by-tcH*0.93);
            c.lineTo(x+d*s*0.05,        by-tcH*0.63);
            c.closePath(); c.fill();
            /* headlights */
            c.fillStyle='#fffce0';
            c.fillRect(Math.min(cabFront,cabFront-d*2),by-tcH*0.30,2,s*0.16);
            if(v.lit) radialGlow(c,cabFront+d*2,by-tcH*0.22,s*0.80,255,248,220,0.26);
            /* taillights */
            c.fillStyle='#ff1800';
            c.fillRect(Math.min(boxRear,boxRear+d*2),by-tbH*0.36,2,s*0.18);
            /* wheels */
            var twr=wr*1.05;
            drawWheel(c, x+d*tcW*0.55, by+twr*0.52, twr);
            drawWheel(c, x-d*tbW*0.55, by+twr*0.52, twr);
            drawWheel(c, x-d*tbW*0.78, by+twr*0.52, twr);
        }
    }

    /* ══════════════════════════════════════════════
       PEDESTRIANS
    ══════════════════════════════════════════════ */

    function initPeds() {
        peds=[];
        for(var i=0;i<32;i++) {
            peds.push({
                x:   rng(0,W),
                dir: rngI(0,2)===0?1:-1,
                speed:rng(0.22,0.65),
                baseSpeed:0,
                t:   rng(0,Math.PI*2),
                coat:rngI(0,5),
                umbrellaCol: rngI(0,6),
                row: rngI(0,2),
                slipT: 0,
                fallT: 0,
                hat: rng(0,1)<0.35
            });
        }
        for(var pi=0;pi<peds.length;pi++) peds[pi].baseSpeed=peds[pi].speed;
    }

    function updatePeds(dt) {
        var type=effType(EVENTS[eventIndex]);
        /* pedestrians ALWAYS walk at normal speed — only outfit changes by weather */
        var sm = 1;
        for(var i=0;i<peds.length;i++) {
            var p=peds[i];
            p.x+=p.dir*p.speed*sm*dt*0.038;
            p.t+=dt*0.003;
            if(type==='earthquake') {
                p.eqX = Math.cos(performance.now()*0.040 + p.x*0.05)*1.0;
                p.eqY = Math.sin(performance.now()*0.050 + p.x*0.04)*0.7;
            } else if(p.eqX||p.eqY) {
                p.eqX *= 0.85; p.eqY *= 0.85;
                if(Math.abs(p.eqX)<0.05) p.eqX=0;
                if(Math.abs(p.eqY)<0.05) p.eqY=0;
            }
            if(p.x>W+20) p.x=-20;
            if(p.x<-20)  p.x=W+20;
        }
    }

    function drawPeds(c) {
        var rdH=H-GROUND;
        var type=effType(EVENTS[eventIndex]);
        var COATS=['#c8cce0','#e0e4f0','#8898b0','#a0a8c0','#e8d0b0'];
        var UMB=['#c83838','#1e6cb8','#1e8c3c','#444444','#c0a020','#7030a0'];
        /* outfit-only changes — body pose & walking speed stay normal */
        var isWet=(type==='rain'||type==='storm');
        var isCold=(type==='snow'||type==='blizzard');
        var isHot=(type==='heat');
        for(var i=0;i<peds.length;i++) {
            var p=peds[i];
            var rowOff=p.row*6;
            /* earthquake per-ped jitter */
            var eqX = p.eqX||0, eqY = p.eqY||0;
            if(eqX||eqY) { c.save(); c.translate(eqX, eqY); }
            var pedY=GROUND+rdH*0.58+rowOff;
            var col=COATS[p.coat];

            var swing=Math.sin(p.t*4.5)*3;

            /* body */
            c.fillStyle=col;
            c.fillRect(p.x-2, pedY-13, 4, 8);
            /* head */
            var headX=p.x, headY=pedY-16;
            c.beginPath(); c.arc(headX,headY,3,0,Math.PI*2); c.fill();

            /* hat / hood in cold (outfit) */
            if(isCold || p.hat) {
                c.fillStyle = isCold ? '#5a3020' : '#222';
                c.fillRect(headX-3, headY-3, 6, 2);
            }

            /* scarf in cold (outfit) */
            if(isCold) {
                c.strokeStyle = '#c84050';
                c.lineWidth = 1.4;
                c.beginPath();
                c.moveTo(headX, headY+2);
                c.lineTo(headX - p.dir*5 + Math.sin(p.t*5)*1.5, headY+5);
                c.stroke();
            }

            /* arms — neutral walking pose */
            c.strokeStyle=col; c.lineWidth=1.4;
            if(isWet) {
                /* one arm up holding umbrella */
                c.beginPath(); c.moveTo(p.x,pedY-10); c.lineTo(p.x,pedY-15); c.stroke();
                c.beginPath(); c.moveTo(p.x,pedY-10); c.lineTo(p.x+2-swing,pedY-5); c.stroke();
            } else {
                c.beginPath(); c.moveTo(p.x,pedY-10); c.lineTo(p.x-2+swing*0.5,pedY-6); c.stroke();
                c.beginPath(); c.moveTo(p.x,pedY-10); c.lineTo(p.x+2-swing*0.5,pedY-6); c.stroke();
            }

            /* legs — always walking */
            c.beginPath(); c.moveTo(p.x,pedY-5); c.lineTo(p.x-2+swing,pedY); c.stroke();
            c.beginPath(); c.moveTo(p.x,pedY-5); c.lineTo(p.x+2-swing,pedY); c.stroke();

            /* umbrella (outfit) in wet weather */
            if(isWet) {
                var ux=p.x, uy=headY-6;
                c.fillStyle=UMB[p.umbrellaCol];
                c.beginPath();
                c.ellipse(ux, uy, 8, 4, 0, Math.PI, 0);
                c.fill();
                /* umbrella ribs */
                c.strokeStyle='rgba(0,0,0,0.4)'; c.lineWidth=0.6;
                c.beginPath(); c.moveTo(ux-8,uy); c.lineTo(ux-4,uy-2); c.stroke();
                c.beginPath(); c.moveTo(ux-4,uy-2); c.lineTo(ux,uy-3); c.stroke();
                c.beginPath(); c.moveTo(ux,uy-3); c.lineTo(ux+4,uy-2); c.stroke();
                c.beginPath(); c.moveTo(ux+4,uy-2); c.lineTo(ux+8,uy); c.stroke();
                /* shaft to hand */
                c.strokeStyle='#222'; c.lineWidth=0.8;
                c.beginPath(); c.moveTo(ux,uy); c.lineTo(p.x,pedY-10); c.stroke();
            }

            /* heat sweat drops (outfit-ish atmospheric) */
            if(isHot && Math.random()<0.04) {
                c.fillStyle='rgba(120,180,220,0.7)';
                c.beginPath(); c.arc(headX+3, headY+2, 1, 0, Math.PI*2); c.fill();
            }
            if(eqX||eqY) c.restore();
        }
    }

    /* ══════════════════════════════════════════════
       PARTICLE SYSTEM
    ══════════════════════════════════════════════ */

    var eqShakeX=0, eqShakeY=0, eqTimer=0;  /* earthquake shake state */
    var meteorTrails=[];                      /* falling meteors */
    var auroraT=0;                            /* aurora animation time */
    var starField=[];                         /* static star positions */
    var shootingStars=[];                     /* animated shooting stars */
    var fireworksBursts=[];                   /* firework burst particles */
    var fwLaunchers=[];                       /* firework launch timers */
    var nebulaT=0;                            /* nebula animation time */
    var bloodMoonT=0;                         /* blood moon pulse time */

    function buildStarField() {
        starField=[];
        for(var si=0;si<320;si++) {
            starField.push({
                x: rng(0,W), y: rng(0,GROUND*0.85),
                r: rng(0.4,2.2),
                bright: rng(0.4,1.0),
                twinkleSpeed: rng(0.0008,0.003),
                twinkleOffset: rng(0,Math.PI*2)
            });
        }
    }
    function makeShootingStar() {
        var sx=rng(0,W*0.7), sy=rng(0,GROUND*0.4);
        return { x:sx, y:sy, vx:rng(4,12), vy:rng(2,7),
                 len:rng(60,180), r:rng(1,2.5),
                 life:0, maxLife:rng(600,1400),
                 col:rngI(0,3) /* 0=white,1=cyan,2=gold */ };
    }
    function makeFireworkBurst(x,y) {
        var burst=[], colType=rngI(0,6);
        var cols=[
            [255,80,80],[80,200,255],[255,200,60],
            [180,80,255],[80,255,180],[255,140,60]
        ];
        var c3=cols[colType];
        for(var pi=0;pi<55;pi++) {
            var angle=rng(0,Math.PI*2), speed=rng(1.5,6);
            burst.push({ x:x,y:y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
                         life:0, maxLife:rng(600,1100), r:rng(1,3),
                         rr:c3[0],gg:c3[1],bb:c3[2], gravity:0.04 });
        }
        return burst;
    }

    function initEvent(type) {
        particles=[]; splashes=[];
        floodY=GROUND; floodRising=(type==='flood');
        tSwayT=0; tX=W*0.5;
        ltTimer=0; ltActive=false; ltFlash=0; ltPts=[];
        eqShakeX=0; eqShakeY=0; eqTimer=0;
        meteorTrails=[]; shootingStars=[]; fireworksBursts=[]; fwLaunchers=[];
        nebulaT=0; bloodMoonT=0;
        var count=(type==='storm')      ?POOL:
                  (type==='blizzard')   ?POOL*0.9:
                  (type==='rain')       ?POOL*0.7:
                  (type==='hail')       ?POOL*0.5:
                  (type==='tornado')    ?60:
                  (type==='wind')       ?80:
                  (type==='snow')       ?POOL*0.55:
                  (type==='earthquake') ?30:
                  (type==='meteor')     ?0:0;
        for(var i=0;i<count;i++) particles.push(makeParticle(type));
        if(type==='meteor') {
            for(var m=0;m<12;m++) meteorTrails.push(makeMeteor());
        }
        if(type==='starry'||type==='bloodmoon'||type==='nebula') {
            if(starField.length===0) buildStarField();
            if(type==='starry') { for(var ss=0;ss<4;ss++) shootingStars.push(makeShootingStar()); }
        }
        if(type==='shooting') {
            if(starField.length===0) buildStarField();
            for(var ss2=0;ss2<10;ss2++) shootingStars.push(makeShootingStar());
        }
        if(type==='fireworks') {
            if(starField.length===0) buildStarField();
            for(var fl=0;fl<6;fl++) fwLaunchers.push({timer:rng(0,3000), interval:rng(800,2200), x:rng(W*0.1,W*0.9)});
        }
    }

    function makeMeteor() {
        return { x:rng(0,W), y:rng(-H*0.6,-20),
                 vx:rng(3,7), vy:rng(8,16),
                 len:rng(40,100), r:rng(1,3),
                 col:rngI(0,3) /* 0=white,1=orange,2=cyan */ };
    }

    function makeParticle(type) {
        var p={type:type,x:rng(0,W),y:rng(-H,0)};
        if(type==='rain'||type==='storm'){p.vy=rng(10,18);p.vx=rng(-2.0,-0.6);p.len=rng(18,32);}
        else if(type==='snow'||type==='blizzard'){p.vy=rng(0.4,1.8);p.vx=rng(-0.4,0.4);p.r=rng(1.5,3.5);p.sw=rng(0,Math.PI*2);p.swS=rng(0.001,0.003);}
        else if(type==='hail'){p.vy=rng(10,16);p.r=rng(2,5);p.vx=rng(-1,1);}
        else if(type==='wind'){p.y=rng(0,GROUND);p.vy=rng(-0.6,0.6);p.vx=rng(6,14);p.len=rng(30,80);}
        else if(type==='tornado'){p.angle=rng(0,Math.PI*2);p.radius=rng(20,130);p.vy=rng(-3,-7);p.y=GROUND+rng(-60,10);}
        else if(type==='earthquake'){p.x=rng(0,W);p.y=GROUND+rng(0,(H-GROUND)*0.8);p.vx=rng(-4,4);p.vy=rng(-3,-1);p.life=rng(20,60);p.r=rng(3,10);}
        return p;
    }

    function updateParticles(dt) {
        var k=dt/16;
        var type=effType(EVENTS[eventIndex]);
        var i,p;

        if(type==='flood'&&floodRising&&floodY>GROUND-H*0.26) floodY-=0.065*k;
        if(type==='tornado'){tSwayT+=0.0010*dt;tX=W*0.5+Math.sin(tSwayT)*W*0.20;}
        if(type==='earthquake'){eqTimer+=dt; eqShakeX=Math.sin(eqTimer*0.18)*3*(1-Math.min(1,eqTimer/8000)); eqShakeY=Math.cos(eqTimer*0.24)*2*(1-Math.min(1,eqTimer/8000));}
        if(type==='aurora') auroraT+=0.0004*dt;
        if(type==='nebula') nebulaT+=0.0003*dt;
        if(type==='bloodmoon') bloodMoonT+=0.0006*dt;

        /* shooting stars update */
        if(type==='starry'||type==='shooting') {
            for(i=shootingStars.length-1;i>=0;i--) {
                var ss3=shootingStars[i];
                ss3.x+=ss3.vx*k; ss3.y+=ss3.vy*k; ss3.life+=dt;
                if(ss3.life>ss3.maxLife||ss3.x>W+ss3.len||ss3.y>GROUND) {
                    shootingStars[i]=makeShootingStar();
                    shootingStars[i].life=0;
                }
            }
            var target=(type==='shooting')?10:4;
            while(shootingStars.length<target) shootingStars.push(makeShootingStar());
        }

        /* fireworks update */
        if(type==='fireworks') {
            for(var fi=0;fi<fwLaunchers.length;fi++) {
                fwLaunchers[fi].timer-=dt;
                if(fwLaunchers[fi].timer<=0) {
                    fwLaunchers[fi].timer=fwLaunchers[fi].interval;
                    fwLaunchers[fi].x=rng(W*0.08,W*0.92);
                    var burstY=rng(GROUND*0.08, GROUND*0.45);
                    var newBurst=makeFireworkBurst(fwLaunchers[fi].x, burstY);
                    fireworksBursts=fireworksBursts.concat(newBurst);
                }
            }
            for(i=fireworksBursts.length-1;i>=0;i--) {
                var fp=fireworksBursts[i];
                fp.life+=dt; fp.x+=fp.vx*k; fp.y+=fp.vy*k; fp.vy+=fp.gravity*k;
                fp.vx*=Math.pow(0.985,k); fp.vy*=Math.pow(0.985,k);
                if(fp.life>fp.maxLife) fireworksBursts.splice(i,1);
            }
            if(fireworksBursts.length>800) fireworksBursts.splice(0,fireworksBursts.length-800);
        }

        if(type==='meteor'){
            for(i=0;i<meteorTrails.length;i++){
                var m=meteorTrails[i];
                m.x+=m.vx*k; m.y+=m.vy*k;
                if(m.y>H+30){
                    meteorTrails[i]=makeMeteor();
                    splashes.push({x:m.x,r:0,maxR:rng(12,28),life:0,maxLife:rng(400,800),op:0.60});
                }
            }
        }

        for(i=0;i<particles.length;i++){
            p=particles[i];
            if(p.type==='rain'||p.type==='storm'){
                p.x+=p.vx*k; p.y+=p.vy*k;
                if(p.y>=GROUND&&p.y<GROUND+p.vy*k+2&&splashes.length<120){
                    splashes.push({x:p.x,r:0,maxR:rng(2,6),life:0,maxLife:rng(120,220),op:rng(0.25,0.55)});
                }
                if(p.y>H+12){p.y=rng(-80,-10);p.x=rng(0,W);}
                if(p.x<-12) p.x=W+12;
            } else if(p.type==='snow'||p.type==='blizzard'){
                p.sw+=p.swS*dt; p.x+=Math.sin(p.sw)*0.35+p.vx; p.y+=p.vy*k;
                if(p.y>GROUND){p.y=rng(-50,-10);p.x=rng(0,W);}
            } else if(p.type==='hail'){
                p.x+=p.vx*k; p.y+=p.vy*k;
                if(p.y>GROUND){
                    splashes.push({x:p.x,r:0,maxR:rng(3,8),life:0,maxLife:rng(80,160),op:0.55});
                    p.y=rng(-60,-10);p.x=rng(0,W);
                }
            } else if(p.type==='wind'){
                p.x+=p.vx*k; p.y+=p.vy*k;
                if(p.x>W+80){p.x=rng(-80,-10);p.y=rng(0,GROUND);}
            } else if(p.type==='tornado'){
                p.angle+=0.065*k; p.radius=Math.max(0,p.radius-0.04*k); p.y+=p.vy*k;
                if(p.radius<5||p.y<0){p.angle=rng(0,Math.PI*2);p.radius=rng(20,130);p.y=GROUND+rng(-60,10);p.vy=rng(-3,-7);}
            } else if(p.type==='earthquake'){
                p.x+=p.vx*k; p.y+=p.vy*k; p.vy+=0.5*k; p.life-=dt;
                if(p.life<=0||p.y>GROUND+50){
                    p.x=rng(0,W); p.y=GROUND+rng(0,(H-GROUND)*0.8);
                    p.vx=rng(-4,4); p.vy=rng(-3,-1); p.life=rng(20,60); p.r=rng(3,10);
                }
            }
        }

        for(i=splashes.length-1;i>=0;i--){
            var sp=splashes[i]; sp.life+=dt; sp.r=sp.maxR*(sp.life/sp.maxLife);
            if(sp.life>=sp.maxLife) splashes.splice(i,1);
        }

        if(type==='storm'||type==='meteor'){
            ltTimer+=dt;
            if(ltActive){ltFlash=Math.max(0,ltFlash-dt*0.10);if(ltFlash<=0)ltActive=false;}
            else if(ltTimer>rng(type==='meteor'?800:2200, type==='meteor'?2000:5000)){
                ltTimer=0;ltActive=true;ltFlash=90;
                var lx=rng(W*0.05,W*0.95); ltPts=[{x:lx,y:0}];
                var cy=0;
                while(cy<GROUND){cy+=rng(18,55);ltPts.push({x:ltPts[ltPts.length-1].x+rng(-40,40),y:cy});}
            }
        }
    }

    /* ══════════════════════════════════════════════
       VEHICLE WEATHER-IMPACT OVERLAY
    ══════════════════════════════════════════════ */

    function _carScale(v) {
        var rdH=H-GROUND;
        return Math.max(5, rdH*0.12);
    }
    function _carBodyBottom(v) {
        var rdH=H-GROUND;
        var laneOff = (v.dir===1) ? rdH*0.06 : -rdH*0.06;
        return GROUND + rdH*0.10 + laneOff;
    }
    /* dark/night-like events where headlights are visible */
    function _headlightsOn(type) {
        return type==='storm'||type==='tornado'||type==='earthquake'||type==='meteor'||
               type==='blizzard'||type==='bloodmoon'||type==='starry'||type==='shooting'||
               type==='nebula'||type==='flood'||type==='rain';
    }
    /* Draw the forward beam BEFORE the car so cars in front occlude beams behind them */
    function drawCarBeam(c, v, type) {
        if(!_headlightsOn(type)) return;
        var s = _carScale(v);
        var by = _carBodyBottom(v) + (v.yOff||0);
        /* anchor on the front bumper, at hood-front level (not wheel level) */
        var s0 = (v.type==='bus') ? s*2.05 : (v.type==='truck') ? s*1.25 : s*0.96;
        var bumperX = v.x + v.dir*s0 + (v.xShake||0);
        var headHt = (v.type==='bus') ? by - s*1.10 : (v.type==='truck') ? by - s*0.95 : by - s*0.30;
        var beamLen = 80 + (type==='storm'||type==='blizzard'?28:0);
        var bg = c.createLinearGradient(bumperX, headHt, bumperX + v.dir*beamLen, headHt);
        bg.addColorStop(0,   'rgba(255,250,220,0.70)');
        bg.addColorStop(0.5, 'rgba(255,240,180,0.22)');
        bg.addColorStop(1,   'rgba(255,220,140,0)');
        c.fillStyle = bg;
        c.beginPath();
        c.moveTo(bumperX, headHt-3);
        c.lineTo(bumperX + v.dir*beamLen, headHt-16);
        c.lineTo(bumperX + v.dir*beamLen, headHt+16);
        c.lineTo(bumperX, headHt+3);
        c.closePath();
        c.fill();
        /* hot bulb glow at the bumper, also drawn before the car so it sits "in" the headlight */
        radialGlow(c, bumperX, headHt, 7, 255, 245, 210, 0.55);
    }
    /* Wipers, spray, hazards, accumulation — drawn AFTER the car so they sit on it */
    function drawCarExtras(c, v, type) {
        var s = _carScale(v);
        var by = _carBodyBottom(v) + (v.yOff||0);
        var rainy = (type==='rain'||type==='storm'||type==='flood');
        var hazardy = (type==='tornado'||type==='earthquake'||type==='meteor'||type==='blizzard'||type==='flood');
        var s0 = (v.type==='bus') ? s*2.05 : (v.type==='truck') ? s*1.25 : s*0.96;
        /* hazard tail-light blink at rear bumper, hood-line height */
        if(hazardy) {
            var on = Math.sin(v.hazT*4) > 0;
            if(on) {
                var rearX = v.x - v.dir*s0 + (v.xShake||0);
                var tailY = (v.type==='bus') ? by - s*1.10 : (v.type==='truck') ? by - s*0.95 : by - s*0.30;
                radialGlow(c, rearX, tailY, 7, 255, 140, 20, 0.78);
            }
        }
        if(rainy) {
            /* wiper sweeping windshield in rain */
            var wx = v.x + v.dir*s*0.18 + (v.xShake||0);
            var wy = by - s*0.62;
            var ang = Math.sin(v.wiperT*3)*0.5;
            c.strokeStyle='rgba(30,30,30,0.7)'; c.lineWidth=1.2;
            c.beginPath();
            c.moveTo(wx, wy);
            c.lineTo(wx + Math.cos(ang)*s*0.30, wy - Math.sin(ang)*s*0.18);
            c.stroke();
            /* spray from wheels */
            c.fillStyle='rgba(200,220,240,0.35)';
            for(var sp=0;sp<3;sp++) {
                var sx = v.x - v.dir*s*0.45 + rng(-2,2) + (v.xShake||0);
                var sy = by + s*0.55 + rng(-1,1);
                c.beginPath(); c.arc(sx, sy, rng(0.8,2.2), 0, Math.PI*2); c.fill();
            }
        }
        if(type==='snow'||type==='blizzard'||type==='meteor') {
            c.fillStyle = (type==='meteor') ? 'rgba(50,40,30,0.85)' : 'rgba(245,250,255,0.95)';
            c.fillRect(v.x - s*0.45 + (v.xShake||0), by - s*0.62, s*0.9, 1.6);
        }
    }

    /* ══════════════════════════════════════════════
       DYNAMIC LAYER
    ══════════════════════════════════════════════ */

    function drawDynamic() {
        dynC.clearRect(0,0,W,H);
        var type=effType(EVENTS[eventIndex]);
        var i,p;

        /* ── DESTROYED-BUILDING / WRECKAGE LAYER ──────────────────────────
           Drawn FIRST in dynC so weather (rain, snow, lightning, fog…) and
           the rest of the scene layer above it. This keeps destroyed buildings
           at the same logical z as the live city silhouette. */
        if(typeof drawWreckageLayer==='function') drawWreckageLayer(dynC);
        /* ── AIR-DEFENCE BATTERIES on the ground (low z, cars pass over) ── */
        if(typeof drawAirDefence==='function') drawAirDefence(dynC);

        /* wet pavement reflections */
        if(type==='rain'||type==='storm'||type==='flood'){
            var refA=dynC.createLinearGradient(0,GROUND-3,0,GROUND+50);
            refA.addColorStop(0,'rgba(255,210,70,0.18)');
            refA.addColorStop(0.5,'rgba(255,210,70,0.07)');
            refA.addColorStop(1,'rgba(0,0,0,0)');
            dynC.fillStyle=refA; dynC.fillRect(0,GROUND-3,W,53);
            var refB=dynC.createLinearGradient(0,GROUND-3,0,GROUND+50);
            refB.addColorStop(0,'rgba(60,130,220,0.12)');
            refB.addColorStop(0.6,'rgba(60,130,220,0.04)');
            refB.addColorStop(1,'rgba(0,0,0,0)');
            dynC.fillStyle=refB; dynC.fillRect(0,GROUND-3,W,53);
        }

        if(type==='heat'){
            dynC.fillStyle='rgba(180,60,0,0.08)';
            dynC.fillRect(0,GROUND-H*0.14,W,H*0.14);
        }

        /* particles */
        for(i=0;i<particles.length;i++){
            p=particles[i];
            if(p.type==='rain'||p.type==='storm'){
                dynC.strokeStyle=p.type==='storm'?'rgba(180,210,255,0.72)':'rgba(160,200,240,0.55)';
                dynC.lineWidth=p.type==='storm'?1.5:1;
                dynC.beginPath(); dynC.moveTo(p.x,p.y); dynC.lineTo(p.x+p.vx*0.5,p.y+p.len); dynC.stroke();
            } else if(p.type==='snow'||p.type==='blizzard'){
                dynC.fillStyle='#ffffff';
                dynC.beginPath(); dynC.arc(p.x,p.y,p.r,0,Math.PI*2); dynC.fill();
            } else if(p.type==='hail'){
                dynC.fillStyle='#d0eeff';
                dynC.beginPath(); dynC.arc(p.x,p.y,p.r,0,Math.PI*2); dynC.fill();
                dynC.strokeStyle='#90c8e8'; dynC.lineWidth=0.6; dynC.stroke();
            } else if(p.type==='wind'){
                dynC.strokeStyle='rgba(200,220,255,0.38)'; dynC.lineWidth=1;
                dynC.beginPath(); dynC.moveTo(p.x,p.y); dynC.lineTo(p.x+p.len,p.y); dynC.stroke();
            } else if(p.type==='tornado'){
                var tx2=tX+Math.cos(p.angle)*p.radius;
                dynC.fillStyle='#3a3028';
                dynC.beginPath(); dynC.arc(tx2,p.y,2.5,0,Math.PI*2); dynC.fill();
            } else if(p.type==='earthquake'){
                dynC.fillStyle='rgba(160,120,60,'+(p.life/60)*0.70+')';
                dynC.beginPath(); dynC.arc(p.x,p.y,p.r,0,Math.PI*2); dynC.fill();
            }
        }

        /* aurora borealis */
        if(type==='aurora'){
            for(var ab=0;ab<5;ab++){
                var aFrac=ab/5;
                var aY=GROUND*(0.15+aFrac*0.35);
                var aG=dynC.createLinearGradient(0,aY-80,0,aY+40);
                var cols3=['rgba(0,255,120,','rgba(0,200,255,','rgba(120,80,255,','rgba(255,80,200,','rgba(0,255,180,'];
                aG.addColorStop(0,cols3[ab]+'0)');
                aG.addColorStop(0.4,cols3[ab]+'0.22)');
                aG.addColorStop(1,cols3[ab]+'0)');
                dynC.fillStyle=aG;
                dynC.beginPath();
                for(var aw=0;aw<=W;aw+=8){
                    var ay2=aY+Math.sin(aw*0.012+auroraT+ab*1.3)*28+Math.sin(aw*0.006+auroraT*0.7)*18;
                    aw===0?dynC.moveTo(aw,ay2):dynC.lineTo(aw,ay2);
                }
                dynC.lineTo(W,aY+80); dynC.lineTo(0,aY+80); dynC.closePath(); dynC.fill();
            }
        }

        /* ── starfield ── shown for starry / shooting / fireworks / bloodmoon / nebula */
        if(type==='starry'||type==='shooting'||type==='fireworks'||type==='bloodmoon'||type==='nebula') {
            for(var sfi=0;sfi<starField.length;sfi++) {
                var sf=starField[sfi];
                var tw=0.5+0.5*Math.sin(Date.now()*sf.twinkleSpeed+sf.twinkleOffset);
                var alpha=sf.bright*(0.55+0.45*tw);
                var starR=sf.r*(type==='starry'?1.4:type==='nebula'?1.2:1.0);
                dynC.fillStyle='rgba(255,255,255,'+alpha+')';
                dynC.beginPath(); dynC.arc(sf.x,sf.y,starR,0,Math.PI*2); dynC.fill();
                /* twinkle glow on bright stars */
                if(sf.bright>0.75&&tw>0.6) radialGlow(dynC,sf.x,sf.y,starR*4,220,230,255,alpha*0.35);
            }
        }

        /* ── milky way band for starry ── */
        if(type==='starry') {
            var mwG=dynC.createLinearGradient(0,GROUND*0.05,W*0.8,GROUND*0.55);
            mwG.addColorStop(0,'rgba(200,210,255,0)');
            mwG.addColorStop(0.3,'rgba(200,215,255,0.07)');
            mwG.addColorStop(0.5,'rgba(220,225,255,0.11)');
            mwG.addColorStop(0.7,'rgba(200,215,255,0.07)');
            mwG.addColorStop(1,'rgba(200,210,255,0)');
            dynC.fillStyle=mwG; dynC.fillRect(0,0,W,GROUND*0.85);
            /* milky way star clusters */
            for(var mwi=0;mwi<40;mwi++) {
                var mwx=rng(W*0.05,W*0.75), mwy=rng(0,GROUND*0.6);
                dynC.fillStyle='rgba(230,235,255,'+(rng(0.04,0.12))+')';
                dynC.beginPath(); dynC.ellipse(mwx,mwy,rng(4,18),rng(2,8),rng(0,Math.PI),0,Math.PI*2); dynC.fill();
            }
        }

        /* ── nebula clouds ── */
        if(type==='nebula') {
            var nbCols=[
                [80,0,200],[0,80,200],[200,0,120],
                [0,180,160],[120,0,200],[60,0,160]
            ];
            for(var nb=0;nb<8;nb++) {
                var nc3=nbCols[nb%nbCols.length];
                var nbx=W*(0.1+nb*0.11+Math.sin(nebulaT+nb*1.3)*0.06);
                var nby=GROUND*(0.08+Math.sin(nb*0.7+nebulaT*0.8)*0.18);
                var nbr=rng(60,160);
                var nbG=dynC.createRadialGradient(nbx,nby,0,nbx,nby,nbr);
                nbG.addColorStop(0,'rgba('+nc3[0]+','+nc3[1]+','+nc3[2]+',0.22)');
                nbG.addColorStop(0.5,'rgba('+nc3[0]+','+nc3[1]+','+nc3[2]+',0.10)');
                nbG.addColorStop(1,'rgba('+nc3[0]+','+nc3[1]+','+nc3[2]+',0)');
                dynC.fillStyle=nbG; dynC.fillRect(nbx-nbr,nby-nbr,nbr*2,nbr*2);
            }
        }

        /* ── blood moon ── */
        if(type==='bloodmoon') {
            var moonX=W*0.72, moonY=H*0.18;
            var moonR=Math.min(W,H)*0.07;
            radialGlow(dynC,moonX,moonY,moonR*4.5,200,20,0,0.35);
            radialGlow(dynC,moonX,moonY,moonR*2.5,255,60,0,0.50);
            var moonGrd=dynC.createRadialGradient(moonX-moonR*0.3,moonY-moonR*0.3,0,moonX,moonY,moonR);
            moonGrd.addColorStop(0,'rgba(255,90,30,0.98)');
            moonGrd.addColorStop(0.5,'rgba(200,30,10,0.97)');
            moonGrd.addColorStop(1,'rgba(120,10,5,0.96)');
            dynC.fillStyle=moonGrd; dynC.beginPath(); dynC.arc(moonX,moonY,moonR,0,Math.PI*2); dynC.fill();
            /* crater texture */
            dynC.strokeStyle='rgba(80,10,0,0.35)'; dynC.lineWidth=1;
            for(var cr=0;cr<6;cr++) {
                var crx=moonX+rng(-moonR*0.6,moonR*0.6), cry=moonY+rng(-moonR*0.6,moonR*0.6);
                dynC.beginPath(); dynC.arc(crx,cry,rng(moonR*0.06,moonR*0.18),0,Math.PI*2); dynC.stroke();
            }
            /* eerie red cloud wisps */
            for(var rw=0;rw<5;rw++) {
                var rwx=(rw*W*0.22+Date.now()*0.006)%W, rwy=GROUND*(0.04+rw*0.08);
                dynC.fillStyle='rgba(180,10,0,0.06)';
                dynC.beginPath(); dynC.ellipse(rwx,rwy,120+rw*30,20+rw*5,0,0,Math.PI*2); dynC.fill();
            }
        }

        /* ── shooting stars ── */
        if(type==='starry'||type==='shooting') {
            for(var ssi=0;ssi<shootingStars.length;ssi++) {
                var sst=shootingStars[ssi];
                if(sst.life<100) continue;
                var ssCols=['rgba(255,255,255,','rgba(80,240,255,','rgba(255,220,80,'];
                var sstG=dynC.createLinearGradient(sst.x,sst.y, sst.x-sst.vx*sst.len/sst.vy, sst.y-sst.len);
                sstG.addColorStop(0,ssCols[sst.col]+'0.95)');
                sstG.addColorStop(1,ssCols[sst.col]+'0)');
                dynC.strokeStyle=sstG; dynC.lineWidth=sst.r;
                dynC.beginPath(); dynC.moveTo(sst.x,sst.y);
                dynC.lineTo(sst.x-sst.vx*sst.len/sst.vy, sst.y-sst.len); dynC.stroke();
                radialGlow(dynC,sst.x,sst.y,sst.r*6,255,240,200,0.60);
                dynC.fillStyle=ssCols[sst.col]+'1)';
                dynC.beginPath(); dynC.arc(sst.x,sst.y,sst.r,0,Math.PI*2); dynC.fill();
            }
        }

        /* ── fireworks ── */
        if(type==='fireworks') {
            for(var fbi=0;fbi<fireworksBursts.length;fbi++) {
                var fb=fireworksBursts[fbi];
                var fpAlpha=1-fb.life/fb.maxLife;
                var fpR=fb.r*(1-fb.life/fb.maxLife*0.5);
                if(fpAlpha<0.05) continue;
                dynC.fillStyle='rgba('+fb.rr+','+fb.gg+','+fb.bb+','+fpAlpha+')';
                dynC.beginPath(); dynC.arc(fb.x,fb.y,fpR,0,Math.PI*2); dynC.fill();
                if(fpAlpha>0.35) radialGlow(dynC,fb.x,fb.y,fpR*3.5,fb.rr,fb.gg,fb.bb,fpAlpha*0.30);
            }
        }

        /* falling meteors */
        if(type==='meteor'){
            for(var mi=0;mi<meteorTrails.length;mi++){
                var mt=meteorTrails[mi];
                var mCols=['rgba(255,255,240,','rgba(255,160,60,','rgba(80,220,255,'];
                var mG=dynC.createLinearGradient(mt.x,mt.y, mt.x-mt.vx*mt.len/mt.vy,mt.y-mt.len);
                mG.addColorStop(0,mCols[mt.col]+'0.95)');
                mG.addColorStop(1,mCols[mt.col]+'0)');
                dynC.strokeStyle=mG; dynC.lineWidth=mt.r;
                dynC.beginPath(); dynC.moveTo(mt.x,mt.y);
                dynC.lineTo(mt.x-mt.vx*mt.len/mt.vy, mt.y-mt.len); dynC.stroke();
                /* bright head */
                radialGlow(dynC,mt.x,mt.y,mt.r*5,255,220,160,0.55);
                dynC.fillStyle=mCols[mt.col]+'1)';
                dynC.beginPath(); dynC.arc(mt.x,mt.y,mt.r,0,Math.PI*2); dynC.fill();
            }
        }

        /* earthquake: screen shake applied via ctx offset in tick(), crack lines here */
        if(type==='earthquake'){
            dynC.strokeStyle='rgba(100,60,20,0.55)'; dynC.lineWidth=1.5;
            for(var qi=0;qi<4;qi++){
                var qx=(qi*W*0.28+eqTimer*0.3)%W;
                dynC.beginPath(); dynC.moveTo(qx,GROUND);
                dynC.lineTo(qx+rng(-20,20),GROUND+(H-GROUND)*0.4);
                dynC.stroke();
            }
            /* ground dust clouds */
            for(var qd=0;qd<6;qd++){
                var qdx=(qd*W/5+eqTimer*0.5)%W;
                radialGlow(dynC, qdx,GROUND, 30+Math.sin(eqTimer*0.05+qd)*10, 180,140,80, 0.20);
            }
        }

        if(type==='tornado'){
            for(var seg=0;seg<22;seg++){
                var frac=seg/22;
                var fw=6+frac*88;
                var fy2=frac*GROUND;
                dynC.fillStyle='rgba(40,35,15,'+(0.07+frac*0.26)+')';
                dynC.beginPath(); dynC.ellipse(tX,fy2,fw,fw*0.28,0,0,Math.PI*2); dynC.fill();
            }
        }

        if(type==='flood'&&floodY<GROUND){
            dynC.fillStyle='rgba(10,40,100,0.50)';
            dynC.fillRect(0,floodY,W,GROUND-floodY);
            dynC.strokeStyle='rgba(80,160,255,0.45)'; dynC.lineWidth=2;
            dynC.beginPath();
            for(var wx=0;wx<=W;wx+=28){
                var wy2=floodY+Math.sin(wx*0.04+tSwayT*0.01)*3;
                wx===0?dynC.moveTo(wx,wy2):dynC.lineTo(wx,wy2);
            }
            dynC.stroke();
        }

        if(ltActive&&ltFlash>0&&ltPts.length>1){
            dynC.fillStyle='rgba(200,220,255,'+(Math.min(0.22,ltFlash/90*0.22))+')';
            dynC.fillRect(0,0,W,H);
            dynC.strokeStyle='rgba(140,180,255,0.55)'; dynC.lineWidth=5;
            dynC.beginPath(); dynC.moveTo(ltPts[0].x,ltPts[0].y);
            for(var lp=1;lp<ltPts.length;lp++) dynC.lineTo(ltPts[lp].x,ltPts[lp].y);
            dynC.stroke();
            dynC.strokeStyle='#ffffff'; dynC.lineWidth=1.5;
            dynC.beginPath(); dynC.moveTo(ltPts[0].x,ltPts[0].y);
            for(var lp2=1;lp2<ltPts.length;lp2++) dynC.lineTo(ltPts[lp2].x,ltPts[lp2].y);
            dynC.stroke();
        }

        if(splashes.length>0){
            dynC.strokeStyle='rgba(180,210,240,0.60)'; dynC.lineWidth=0.8;
            for(var si=0;si<splashes.length;si++){
                var sp=splashes[si];
                dynC.globalAlpha=sp.op*(1-sp.life/sp.maxLife);
                dynC.beginPath(); dynC.ellipse(sp.x,GROUND-1,sp.r,sp.r*0.4,0,0,Math.PI*2); dynC.stroke();
            }
            dynC.globalAlpha=1;
        }

        /* ESB rotating colored beacon — NYC only */
        esbAngle+=0.008;
        if(currentCityIndex===0) {
            var esbX=W*0.63;
            var esbY=GROUND-H*0.55*0.88;
            var beaconColors=[[255,80,0],[255,180,0],[0,180,255],[255,60,180]];
            var bc2=beaconColors[Math.floor(esbAngle/0.5)%beaconColors.length];
            var beamLen=W*0.22;
            var bx1=esbX+Math.cos(esbAngle)*beamLen;
            var by1=esbY+Math.sin(esbAngle)*beamLen*0.3;
            var bg2=dynC.createLinearGradient(esbX,esbY,bx1,by1);
            bg2.addColorStop(0,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0.55)');
            bg2.addColorStop(1,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0)');
            dynC.strokeStyle=bg2; dynC.lineWidth=3;
            dynC.beginPath(); dynC.moveTo(esbX,esbY); dynC.lineTo(bx1,by1); dynC.stroke();
            var bx2=esbX+Math.cos(esbAngle+Math.PI)*beamLen;
            var by2=esbY+Math.sin(esbAngle+Math.PI)*beamLen*0.3;
            var bg3=dynC.createLinearGradient(esbX,esbY,bx2,by2);
            bg3.addColorStop(0,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0.55)');
            bg3.addColorStop(1,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0)');
            dynC.strokeStyle=bg3; dynC.lineWidth=3;
            dynC.beginPath(); dynC.moveTo(esbX,esbY); dynC.lineTo(bx2,by2); dynC.stroke();
            radialGlow(dynC, esbX,esbY, 22, bc2[0],bc2[1],bc2[2], 0.50);
        }

        /* sort vehicles back-to-front so closer cars occlude farther ones:
           upper lane (dir=-1) drawn first; within a lane, the "back" of the lane drawn first */
        var sortedV = vehicles.slice().sort(function(a,b){
            if(a.dir!==b.dir) return (a.dir===1?1:-1) - (b.dir===1?1:-1);
            return a.dir===1 ? a.x-b.x : b.x-a.x;
        });
        for(var vi=0;vi<sortedV.length;vi++) {
            var V=sortedV[vi];
            var off = (V.xShake||0)||(V.yOff||0);
            if(off) { dynC.save(); dynC.translate(V.xShake||0, V.yOff||0); }
            drawVehicle(dynC,V);
            drawCarExtras(dynC, V, type);
            if(off) dynC.restore();
        }
        drawPeds(dynC);

        /* airplane transition */
        if(airplane) drawAirplane(dynC);

        /* city label */
        if(cityLabelTimer>0) {
            var alpha=Math.min(1,cityLabelTimer/400)*Math.min(1,(cityLabelTimer)/1)*1;
            alpha=cityLabelTimer>2500?(3000-cityLabelTimer)/500:Math.min(1,cityLabelTimer/400);
            alpha=Math.max(0,alpha);
            var fs=Math.round(H*0.048);
            dynC.font='bold '+fs+'px "Arial Black",Arial,sans-serif';
            dynC.textAlign='center';
            dynC.textBaseline='middle';
            dynC.fillStyle='rgba(255,255,255,'+alpha*0.22+')';
            dynC.fillText(CITIES[currentCityIndex].name,W/2+2,H*0.16+2);
            dynC.fillStyle='rgba(255,255,255,'+alpha+')';
            dynC.fillText(CITIES[currentCityIndex].name,W/2,H*0.16);
            dynC.textBaseline='alphabetic';
        }
    }

    function drawAirplane(c) {
        var pl=airplane, x=pl.x, y=pl.y, d=pl.dir;
        var t=pl.t||0;

        /* ── contrail — world space, rendered before the plane ── */
        if(pl.trail&&pl.trail.length>1) {
            for(var tri=0;tri<pl.trail.length-1;tri++) {
                var tp=pl.trail[tri];
                var ageFrac=tp.age/5000;
                var trAlpha=(1-ageFrac)*(1-ageFrac)*0.50;
                if(trAlpha<0.008) continue;
                var trW=1.0+ageFrac*13;
                /* two engine lanes, separated vertically */
                for(var trLane=-1;trLane<=1;trLane+=2) {
                    c.fillStyle='rgba(238,244,255,'+trAlpha+')';
                    c.beginPath();
                    c.ellipse(tp.x, tp.y+trLane*(2+ageFrac*3.5),
                              trW, trW*0.28, 0, 0, Math.PI*2);
                    c.fill();
                }
            }
        }

        /* ── all plane art in local space (nose = +x) ── */
        c.save();
        c.translate(x,y);
        if(d<0) c.scale(-1,1);

        /* scale: small & crisp — ~55-60px on a 1080p screen */
        var sc=Math.max(0.42, Math.min(0.54, Math.min(W,H)/1900));
        c.scale(sc,sc);

        /* very subtle bank that follows the altitude sine wave */
        var bankAngle=Math.sin(t*0.00042)*0.020;
        c.rotate(bankAngle);

        /* ── exhaust heat bloom (behind everything) ── */
        for(var el=0;el<3;el++) {
            var eR=7+el*7, eA=0.15-el*0.04;
            var exG=c.createRadialGradient(-53+el*4,21,0,-53+el*4,21,eR);
            exG.addColorStop(0,'rgba(215,195,140,'+eA+')');
            exG.addColorStop(1,'rgba(195,160,90,0)');
            c.fillStyle=exG; c.fillRect(-53+el*4-eR,21-eR,eR*2,eR*2);
        }

        /* ── horizontal stabilizer (draw first — tail covers base) ── */
        c.fillStyle='#788898'; c.strokeStyle='#50606e'; c.lineWidth=0.70;
        c.beginPath();
        c.moveTo(-44,2); c.lineTo(-58,14); c.lineTo(-61,11); c.lineTo(-46,0);
        c.closePath(); c.fill(); c.stroke();

        /* ── vertical tail fin ── */
        c.fillStyle='#1a3570'; c.strokeStyle='#102260'; c.lineWidth=0.80;
        c.beginPath();
        c.moveTo(-43,-2);
        c.bezierCurveTo(-45,-7,-53,-17,-57,-24);  /* swept leading edge */
        c.bezierCurveTo(-55,-24,-53,-21,-51,-17);  /* rounded tip */
        c.bezierCurveTo(-49,-12,-47,-6,-43,-2);    /* trailing edge */
        c.closePath(); c.fill(); c.stroke();
        /* fin highlight — subtle specular */
        c.fillStyle='rgba(65,120,215,0.22)';
        c.beginPath();
        c.moveTo(-43,-2); c.bezierCurveTo(-45,-8,-53,-18,-57,-24);
        c.bezierCurveTo(-56,-23,-54,-19,-52,-15);
        c.bezierCurveTo(-50,-10,-46,-5,-43,-2);
        c.closePath(); c.fill();

        /* ── main wing ── swept 32°, winglet upswept tip ── */
        c.fillStyle='#788898'; c.strokeStyle='#506070'; c.lineWidth=0.80;
        c.beginPath();
        c.moveTo(10, 4);   /* root LE */
        c.lineTo(-33,30);  /* tip LE */
        c.lineTo(-37,21);  /* winglet tip (angled up) */
        c.lineTo(-35,19);  /* winglet inner face */
        c.lineTo(-39,32);  /* tip TE */
        c.lineTo( 1,  8);  /* root TE */
        c.closePath(); c.fill(); c.stroke();
        /* upper wing surface highlight */
        c.fillStyle='rgba(165,195,218,0.20)';
        c.beginPath();
        c.moveTo(8,4); c.lineTo(-31,28); c.lineTo(-33,27); c.lineTo(6,5);
        c.closePath(); c.fill();
        /* flap hinge line */
        c.strokeStyle='rgba(36,50,60,0.34)'; c.lineWidth=0.55;
        c.beginPath(); c.moveTo(-1,8); c.lineTo(-29,31); c.stroke();
        /* aileron panel */
        c.beginPath(); c.moveTo(-26,30); c.lineTo(-37,33); c.stroke();

        /* ── engine pylon ── */
        c.fillStyle='#62748a'; c.strokeStyle='#485868'; c.lineWidth=0.65;
        c.beginPath();
        c.moveTo(-11,13); c.lineTo(-9,21); c.lineTo(-5,21); c.lineTo(-3,14);
        c.closePath(); c.fill(); c.stroke();

        /* ── engine nacelle — CFM LEAP style ── */
        /* main barrel */
        c.fillStyle='#62748a'; c.strokeStyle='#4a5c6a'; c.lineWidth=0.80;
        c.beginPath(); c.ellipse(-15,23,14,4.5,-0.10,0,Math.PI*2); c.fill(); c.stroke();
        /* nacelle top specular */
        c.fillStyle='rgba(150,188,215,0.28)';
        c.beginPath(); c.ellipse(-15,19.5,10,2.0,-0.10,0,Math.PI); c.fill();
        /* inlet cowl — nearly circular bell mouth */
        c.fillStyle='#14202c';
        c.beginPath(); c.ellipse(-27,20,4.4,4.0,-0.10,0,Math.PI*2); c.fill();
        /* fan disc — high-bypass blue-grey */
        c.fillStyle='rgba(58,105,158,0.68)';
        c.beginPath(); c.ellipse(-27,20,3.5,3.2,-0.10,0,Math.PI*2); c.fill();
        /* fan hub highlight */
        c.fillStyle='rgba(130,175,225,0.65)';
        c.beginPath(); c.arc(-27,20,1.1,0,Math.PI*2); c.fill();
        /* inlet lip specular */
        c.strokeStyle='rgba(95,150,210,0.42)'; c.lineWidth=0.5;
        c.beginPath(); c.arc(-27,20,4.2,-1.1,0.35); c.stroke();
        /* exhaust nozzle — hot core */
        c.fillStyle='rgba(200,182,132,0.42)';
        c.beginPath(); c.ellipse(-3,23,3.5,2.8,-0.10,0,Math.PI*2); c.fill();
        /* exhaust shimmer streak */
        c.strokeStyle='rgba(220,195,130,0.28)'; c.lineWidth=0.5;
        c.beginPath(); c.moveTo(-3,21); c.lineTo(6,21); c.stroke();
        c.beginPath(); c.moveTo(-2,23); c.lineTo(8,23); c.stroke();

        /* ── fuselage (drawn over wing root / fin base) ── */
        /* base shape: smooth tube tapering at both ends */
        c.fillStyle='#f2f5ff'; c.strokeStyle='#b6c0d0'; c.lineWidth=0.80;
        c.beginPath();
        c.moveTo(-56,0);                                    /* tail point */
        c.bezierCurveTo(-44,4, -6,6,  36,5);               /* belly sweep */
        c.bezierCurveTo( 50,4, 60,2,  64,0);               /* nose belly */
        c.bezierCurveTo( 60,-2,50,-4, 36,-5);              /* nose top */
        c.bezierCurveTo( -6,-6,-44,-3,-56,0);               /* spine to tail */
        c.closePath(); c.fill(); c.stroke();

        /* cheatline — clip blue upper stripe + gold divider */
        c.save();
        c.beginPath();
        c.moveTo(-56,0);
        c.bezierCurveTo(-44,4, -6,6, 36,5);
        c.bezierCurveTo(50,4, 60,2, 64,0);
        c.bezierCurveTo(60,-2,50,-4,36,-5);
        c.bezierCurveTo(-6,-6,-44,-3,-56,0);
        c.closePath(); c.clip();
        c.fillStyle='#192f6a';                              /* royal blue */
        c.fillRect(-60,-8,132,5.0);                         /* top band: y -8→-3 */
        c.fillStyle='rgba(205,162,30,0.94)';                /* gold stripe */
        c.fillRect(-60,-3.2,132,1.1);
        c.restore();

        /* belly shadow */
        c.fillStyle='rgba(0,0,0,0.07)';
        c.beginPath();
        c.moveTo(-50,2); c.bezierCurveTo(-18,8,18,8,50,4);
        c.bezierCurveTo(18,5,-18,5,-50,2); c.closePath(); c.fill();

        /* top fuselage reflection */
        c.fillStyle='rgba(210,228,255,0.13)';
        c.beginPath();
        c.moveTo(-32,-4.5); c.bezierCurveTo(-8,-5.5,16,-5.5,36,-4.5);
        c.bezierCurveTo(16,-4.5,-8,-4.5,-32,-4.5); c.closePath(); c.fill();

        /* ── nose cone ── */
        c.fillStyle='#cad2e4'; c.strokeStyle='#96a0b4'; c.lineWidth=0.70;
        c.beginPath();
        c.moveTo(63,2.8);
        c.bezierCurveTo(68,1.8, 75,0.8, 80,0);
        c.bezierCurveTo(75,-0.8,68,-1.8,63,-2.5);
        c.closePath(); c.fill(); c.stroke();
        /* weather radar dome — dark composite */
        c.fillStyle='#20283a';
        c.beginPath(); c.arc(80,0,1.8,0,Math.PI*2); c.fill();

        /* ── cockpit windows — slanted band ── */
        c.fillStyle='#111e2c';
        c.beginPath(); c.ellipse(50,-3.5,5.5,2.4,0.12,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(125,185,232,0.52)'; c.lineWidth=0.40; c.stroke();
        /* cockpit glass reflection */
        c.fillStyle='rgba(65,155,255,0.22)';
        c.beginPath(); c.ellipse(48,-4.5,2.3,1.0,0.12,0,Math.PI*2); c.fill();

        /* ── cabin windows ── 16 uniformly spaced ── */
        c.fillStyle='rgba(125,205,255,0.88)';
        for(var wi=0;wi<18;wi++) {
            var winX=36-wi*5.5; if(winX<-40) break;
            c.fillRect(winX-1.8,-3.0,3.0,2.4);
        }
        /* window glint */
        c.fillStyle='rgba(255,255,255,0.38)';
        for(var wir=0;wir<18;wir++) {
            var winRX=36-wir*5.5; if(winRX<-40) break;
            c.fillRect(winRX-1.8,-3.0,1.3,0.72);
        }

        /* ── gear fairings (retracted) ── */
        c.fillStyle='rgba(38,48,62,0.66)'; c.strokeStyle='rgba(26,34,46,0.42)'; c.lineWidth=0.50;
        c.beginPath(); c.ellipse(2,7,7.5,2.8,0,0,Math.PI*2); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(50,4,4.5,1.8,0,0,Math.PI*2); c.fill(); c.stroke();

        /* ── nose landing light ── */
        radialGlow(c,80,0,12,218,240,255,0.72);
        c.fillStyle='rgba(230,248,255,0.96)';
        c.beginPath(); c.arc(80,0,1.4,0,Math.PI*2); c.fill();

        /* ── anti-collision strobe on fin tip — blinks ── */
        if(Math.floor(t/1100)%2===0) {
            radialGlow(c,-57,-24,9,255,45,45,0.90);
            c.fillStyle='#ff1c1c';
            c.beginPath(); c.arc(-57,-24,2.0,0,Math.PI*2); c.fill();
        }

        /* ── nav lights ── */
        /* port wingtip — red */
        radialGlow(c,-40,27,6,255,20,20,0.82);
        c.fillStyle='#ff0e0e';
        c.beginPath(); c.arc(-40,27,2.0,0,Math.PI*2); c.fill();
        /* tail — white */
        radialGlow(c,-60,0,6,248,255,232,0.68);
        c.fillStyle='#f6fff0';
        c.beginPath(); c.arc(-60,0,1.6,0,Math.PI*2); c.fill();

        c.restore();
    }

    /* ══════════════════════════════════════════════
       WINDOW FLICKER
    ══════════════════════════════════════════════ */

    function flickerWindows() {
        /* landmarks */
        for(var i=0;i<LM.length;i++){
            var lm=LM[i];
            if(!lm.wins) continue;
            var count=rngI(2,6);
            for(var k=0;k<count;k++){
                lm.wins[rngI(0,lm.wins.length)]=WIN_POOL[rngI(0,WIN_POOL.length)];
            }
        }
        /* bg buildings */
        for(var i=0;i<BGBUILDS.length;i++){
            var b=BGBUILDS[i];
            if(!b.wins||b.wins.length===0) continue;
            var count2=rngI(1,4);
            for(var k2=0;k2<count2;k2++){
                b.wins[rngI(0,b.wins.length)]=WIN_POOL[rngI(0,WIN_POOL.length)];
            }
        }
        cityBuilt=false;
    }

    /* ══════════════════════════════════════════════
       MAIN LOOP
    ══════════════════════════════════════════════ */

    /* ── perf / a11y gates: reduced-motion users get a single static frame;
       small viewports throttle to ~30fps to save battery on phones. */
    var _reduceMotionMQ = (typeof window !== 'undefined' && window.matchMedia)
        ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var _reduceMotion = _reduceMotionMQ ? _reduceMotionMQ.matches : false;
    if (_reduceMotionMQ && _reduceMotionMQ.addEventListener) {
        _reduceMotionMQ.addEventListener('change', function(e){ _reduceMotion = e.matches; });
    }
    function _isSmallViewport(){ return (typeof window !== 'undefined') && window.innerWidth < 768; }
    var _lastFrame = 0;

    function tick(ts) {
        /* reduced motion: render one frame and stop the loop entirely */
        if (_reduceMotion && lastTime) { return; }
        /* small viewports: throttle to ~30fps */
        if (_isSmallViewport()) {
            if (ts - _lastFrame < 33) { animId=requestAnimationFrame(tick); return; }
            _lastFrame = ts;
        }
        if(!lastTime) lastTime=ts;
        var dt=Math.min(ts-lastTime,50);
        lastTime=ts;

        if(!(typeof weatherPinned!=='undefined'&&weatherPinned)) eventTimer+=dt;
        if(eventTimer>=EVENT_DURATION){
            eventTimer=0;
            eventIndex=(eventIndex+1)%EVENTS.length;
            initEvent(effType(EVENTS[eventIndex]));
            cityBuilt=false;
        }

        winFlickerT+=dt;
        if(winFlickerT>=WIN_FLICKER_INT){winFlickerT=0;flickerWindows();}

        updateParticles(dt);
        updateVehicles(dt);
        updatePeds(dt);
        if(airplane){
            airplane.t+=dt;
            airplane.strobT+=dt;
            airplane.x+=airplane.dir*dt*0.60;
            /* gentle sine-wave altitude variation */
            var targetY=airplane.baseY+Math.sin(airplane.t*0.00042)*H*0.028;
            airplane.y+=(targetY-airplane.y)*0.04;
            /* store contrail position every ~14ms */
            if(!airplane._lastTrail||airplane.t-airplane._lastTrail>14) {
                airplane._lastTrail=airplane.t;
                airplane.trail.push({x:airplane.x,y:airplane.y,age:0});
            }
            /* age and prune contrail */
            for(var tri=0;tri<airplane.trail.length;tri++) airplane.trail[tri].age+=dt;
            while(airplane.trail.length>0&&airplane.trail[0].age>5000) airplane.trail.shift();
            if(!airplane.switched&&airplane.x>W/2){
                currentCityIndex=airplane.nextCity;
                buildBgBuildings();
                buildLandmarks();
                cityBuilt=false;
                cityLabelTimer=3000;
                /* fresh city — wipe every trace of prior destruction */
                wreckage=[];
                craters=[];
                debrisParts=[];
                explosions=[];
                smokePlumes=[];
                missiles=[];
                interceptors=[];
                laserBeams=[];
                targetLocks=[];
                mushroomClouds=[];
                fireFields=[];
                gasClouds=[];
                empPulses=[];
                gravityWells=[];
                neutronPulses=[];
                antimatterBursts=[];
                photonStrikes=[];
                screenFlash=0;
                initVehicles();
                initPeds();
                initAirDefence();
                airplane.switched=true;
            }
            if(airplane.x>W+200||airplane.x<-200) airplane=null;
        }
        if(cityLabelTimer>0) cityLabelTimer-=dt;

        drawBg();
        drawCity();
        drawDynamic();

        ctx.clearRect(0,0,W,H);
        var evType=effType(EVENTS[eventIndex]);
        ctx.drawImage(bgCvs,0,0);
        /* Earthquake shakes the BUILDINGS (cityCvs) but not the sky.
           Vehicles + peds shake individually inside dynCvs via their own xShake/yOff. */
        if(evType==='earthquake') {
            ctx.drawImage(cityCvs, eqShakeX, eqShakeY);
        } else {
            ctx.drawImage(cityCvs,0,0);
        }
        ctx.drawImage(dynCvs,0,0);

        /* film grain */
        ctx.fillStyle='rgba(0,0,0,'+rng(0.010,0.022)+')';
        ctx.fillRect(0,0,W,H);

        animId=requestAnimationFrame(tick);
    }

    /* ── init ── */
    resize();
    buildBgBuildings();
    buildStarField();
    buildLandmarks();
    initVehicles();
    initPeds();
    initAirDefence();
    initEvent(effType(EVENTS[eventIndex]));

    window.addEventListener('resize',function(){
        resize();
        buildBgBuildings();
        buildStarField();
        buildLandmarks();
        initAirDefence();   /* keep batteries positioned at current width */
        cityBuilt=false;
    });

    animId=requestAnimationFrame(tick);

    window.switchCity=function(){
        if(airplane) return;
        var next=(currentCityIndex+1)%CITIES.length;
        var baseY=GROUND*0.22;
        airplane={x:-160,y:baseY,dir:1,nextCity:next,switched:false,
                  t:0, baseY:baseY, strobT:0, trail:[]};
        var btn=document.getElementById('citySwitchBtn');
        if(btn) btn.removeAttribute('title');
    };
    window.getCityName=function(){ return CITIES[currentCityIndex].name; };
    window.getNextCityName=function(){ return CITIES[(currentCityIndex+1)%CITIES.length].name; };
    window.getCurrentCityIndex=function(){ return currentCityIndex; };
    window.getAllCities=function(){
        return CITIES.map(function(c,i){ return { index:i, name:c.name }; });
    };
    /* fly to a specific city by index */
    window.flyToCity=function(targetIdx){
        if(airplane) return;
        if(typeof targetIdx!=='number' || targetIdx<0 || targetIdx>=CITIES.length) return;
        if(targetIdx===currentCityIndex) return;
        var baseY=GROUND*0.22;
        airplane={x:-160,y:baseY,dir:1,nextCity:targetIdx,switched:false,
                  t:0, baseY:baseY, strobT:0, trail:[]};
        var btn=document.getElementById('citySwitchBtn');
        if(btn) btn.removeAttribute('title');
    };

    /* ── weather widget API ── */
    var weatherPinned=false;
    var WEATHER_LABELS={
        clear:'Clear',  rain:'Rain',     storm:'Thunderstorm', snow:'Snow',
        blizzard:'Blizzard', tornado:'Tornado', flood:'Flood', hail:'Hail',
        wind:'Wind', heat:'Heatwave', earthquake:'Earthquake', meteor:'Meteor Shower',
        aurora:'Aurora', starry:'Starry Night', shooting:'Shooting Stars',
        fireworks:'Fireworks', bloodmoon:'Blood Moon', nebula:'Nebula',
        /* ── invented phenomena ── */
        roseDust:'Rose Dust',
        goldShower:'Gold Shower',
        cherryStorm:'Cherry Blossom Storm',
        mintMist:'Mint Mist',
        amberHail:'Amber Hail',
        violetWind:'Violet Gale',
        coralFlood:'Coral Tide',
        jadeMeteors:'Jade Meteors',
        topazFireworks:'Topaz Fireworks',
        silverNebula:'Silver Nebula'
    };
    /* black-and-white Font Awesome 4.7 icons (filled variants only — safer) */
    var WEATHER_ICONS={
        clear:'fa-sun-o', rain:'fa-tint', storm:'fa-bolt',
        snow:'fa-snowflake-o', blizzard:'fa-snowflake-o', tornado:'fa-life-ring',
        flood:'fa-tint', hail:'fa-asterisk', wind:'fa-flag',
        heat:'fa-fire', earthquake:'fa-exclamation-triangle', meteor:'fa-rocket',
        aurora:'fa-magic', starry:'fa-star', shooting:'fa-asterisk',
        fireworks:'fa-bullseye', bloodmoon:'fa-moon-o', nebula:'fa-cloud',
        /* invented event icons — reuse FA 4.7 filled glyphs */
        roseDust:'fa-leaf',
        goldShower:'fa-tint',
        cherryStorm:'fa-pagelines',
        mintMist:'fa-cloud',
        amberHail:'fa-asterisk',
        violetWind:'fa-flag',
        coralFlood:'fa-tint',
        jadeMeteors:'fa-rocket',
        topazFireworks:'fa-bullseye',
        silverNebula:'fa-cloud'
    };
    function setEvent(idx){
        eventIndex=((idx%EVENTS.length)+EVENTS.length)%EVENTS.length;
        eventTimer=0;
        initEvent(effType(EVENTS[eventIndex]));
        cityBuilt=false;
    }
    window.getWeatherEventType=function(){ return EVENTS[eventIndex].type; };
    window.getWeatherEventName=function(){
        var t=EVENTS[eventIndex].type;
        return WEATHER_LABELS[t]||t;
    };
    window.getWeatherEventIcon=function(){
        var t=EVENTS[eventIndex].type;
        return WEATHER_ICONS[t]||'•';
    };
    window.nextWeatherEvent=function(){ setEvent(eventIndex+1); };
    window.prevWeatherEvent=function(){ setEvent(eventIndex-1); };
    window.getWeatherEventIndex=function(){ return eventIndex; };
    window.setWeatherEvent=function(i){ setEvent(i); };
    window.getAllWeatherEvents=function(){
        return EVENTS.map(function(e,i){
            return {
                index:i, type:e.type,
                name: WEATHER_LABELS[e.type]||e.type,
                icon: WEATHER_ICONS[e.type]||'fa-circle'
            };
        });
    };
    window.toggleWeatherPin=function(){
        weatherPinned=!weatherPinned;
        return weatherPinned;
    };
    window.isWeatherPinned=function(){ return weatherPinned; };

    window._weatherIsPinned=function(){ return weatherPinned; };

    /* ══════════════════════════════════════════════
       MISSILE STRIKE SYSTEM
    ══════════════════════════════════════════════ */
    var missiles = [];       /* in-flight missiles */
    var explosions = [];     /* expanding fireballs / shockwaves */
    var debrisParts = [];    /* flying fragments */
    var craters = [];        /* lingering scorched ground */
    var smokePlumes = [];    /* smoke rising after impact */
    var wreckage = [];       /* PERSISTENT wreck objects: broken cars, rubble, twisted lamps, broken buildings */
    var missileArmed = false;
    var screenFlash = 0;

    /* ── UNIQUE BLAST EFFECTS ── */
    var mushroomClouds = [];  /* nuclear / hydrogen */
    var fireFields = [];      /* thermobaric */
    var gasClouds = [];       /* bio / chemical */
    var empPulses = [];       /* emp expanding ring with arcs */
    var gravityWells = [];    /* gravity inward suck + outward burst */
    var neutronPulses = [];   /* neutron green radiation pulse */
    var antimatterBursts = [];/* antimatter spherical burst with rays */
    var photonStrikes = [];   /* vertical white beam */

    /* ── AIR DEFENCE ── */
    var airDefence = [];     /* batteries on the ground */
    var interceptors = [];   /* in-flight interceptors */
    var laserBeams = [];     /* instant laser strikes (for hypersonic) */
    var targetLocks = [];    /* red crosshair ring shown briefly on a locked missile */
    var INTERCEPT_RATE = 0.90;
    /* mapping: missile.kind → interceptor kind */
    var INTERCEPT_FOR = {
        standard:'sam', cluster:'multi', plasma:'emp',
        cruise:'patriot', hypersonic:'laser',
        nuclear:'laser', hydrogen:'laser', thermobaric:'patriot',
        bunker:'patriot', mirv:'multi',
        stealth:'emp', railgun:'laser', drone:'sam',
        icbm:'patriot', tactical:'sam',
        antimatter:'emp',
        decoy:'sam', swarm:'multi',
        photon:'laser', gravity:'emp', neutron:'patriot',
        emp:'sam', saturation:'multi',
        '_bomblet':'sam'
    };
    /* ── DEFENCE control ── */
    var DEFENCE_TYPES  = ['auto','sam','patriot','multi','laser','emp'];
    var DEFENCE_LABELS = {
        auto:'AUTO',     sam:'SAM',     patriot:'PATRIOT',
        multi:'MULTI',   laser:'LASER', emp:'EMP'
    };
    var DEFENCE_ICONS  = {
        auto:'fa-magic',     sam:'fa-rocket',     patriot:'fa-paper-plane',
        multi:'fa-cubes',    laser:'fa-bolt',     emp:'fa-bullseye'
    };
    var defenceTypeIdx = 0;     /* 0 = AUTO */
    var defenceActive  = true;  /* automatic interceptor batteries (on by default) */
    var defenceMode    = false; /* user-driven defence game: AI fires, user clicks to intercept */
    var defenceModeTimer = 0;   /* ms until next AI missile */

    /* ── STRATEGY (queue up to 50 missiles, execute as one salvo) ── */
    var STRATEGY_MAX = 50;
    var strategyMode  = false;
    var strategyQueue = [];     /* [{ kind, tx, ty }] */
    var strategyStats = { fired:0, hits:0, intercepted:0, total:0, success:0 };
    var strategyRunning = false;
    function initAirDefence() {
        airDefence = [];
        var xs = [W*0.12, W*0.32, W*0.50, W*0.70, W*0.90];
        for (var i=0; i<xs.length; i++) {
            airDefence.push({
                x: xs[i], y: GROUND-2,
                cooldown: 0,
                flashT: 0
            });
        }
    }

    /* ── missile types ────────────────────────────────────────────────── */
    var MISSILE_TYPES = [
        'standard','cluster','plasma','cruise','hypersonic',
        /* ── new heavy-arsenal types ── */
        'nuclear','hydrogen','thermobaric','bunker','mirv',
        'stealth','railgun','drone','icbm','tactical',
        'antimatter','decoy','swarm',
        'photon','gravity','neutron','emp','saturation'
    ];
    var MISSILE_LABELS = {
        standard:'STANDARD', cluster:'CLUSTER',
        plasma:'PLASMA',     cruise:'CRUISE',
        hypersonic:'HYPER',
        nuclear:'NUCLEAR',   hydrogen:'HYDROGEN', thermobaric:'THERMOBARIC',
        bunker:'BUNKER BUSTER', mirv:'MIRV',
        stealth:'STEALTH',   railgun:'RAILGUN',   drone:'DRONE',
        icbm:'ICBM',         tactical:'TACTICAL',
        antimatter:'ANTIMATTER',
        decoy:'DECOY',       swarm:'SWARM',
        photon:'PHOTON',     gravity:'GRAVITY',   neutron:'NEUTRON',
        emp:'EMP',           saturation:'SATURATION'
    };
    var MISSILE_ICONS = {
        standard:'fa-rocket',   cluster:'fa-cubes',
        plasma:'fa-bolt',       cruise:'fa-paper-plane',
        hypersonic:'fa-fighter-jet',
        nuclear:'fa-bomb',      hydrogen:'fa-fire',  thermobaric:'fa-fire-extinguisher',
        bunker:'fa-gavel',      mirv:'fa-th',
        stealth:'fa-eye-slash', railgun:'fa-bolt',   drone:'fa-plane',
        icbm:'fa-arrow-circle-up', tactical:'fa-dot-circle-o',
        antimatter:'fa-asterisk',
        decoy:'fa-question-circle', swarm:'fa-th-large',
        photon:'fa-sun-o',      gravity:'fa-circle',   neutron:'fa-times-circle',
        emp:'fa-bolt',          saturation:'fa-th-list'
    };
    var missileTypeIdx = 0;

    function fireMissile(tx, ty, kindOverride) {
        var kind = kindOverride || MISSILE_TYPES[missileTypeIdx];
        /* swarm/saturation/mirv: spawn many at launch site, each tracking offsets */
        if (kind==='swarm') {
            for (var sw=0; sw<10; sw++) {
                fireMissile(tx + rng(-80,80), ty + rng(-30,30), '_swarmer');
            }
            return;
        }
        if (kind==='saturation') {
            for (var st=0; st<20; st++) {
                fireMissile(tx + rng(-120,120), ty + rng(-60,60), '_bomblet');
            }
            return;
        }
        var sx, sy, spd;
        if(kind==='cruise') {
            var fromLeft = Math.random()<0.5;
            sx = fromLeft ? -60 : W+60;
            sy = ty + rng(-30, -10);
            spd = 0.70;
        } else if(kind==='hypersonic') {
            var fL = Math.random()<0.5;
            sx = fL ? -120 : W+120;
            sy = rng(-80, H*0.2);
            spd = 1.40;
        } else if(kind==='plasma') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -60;
            spd = 0.38;
        } else if(kind==='cluster' || kind==='mirv') {
            sx = (Math.random()<0.5 ? -60 : W+60);
            sy = -80;
            spd = 0.48;
        } else if(kind==='nuclear' || kind==='hydrogen' || kind==='thermobaric') {
            sx = (Math.random()<0.5 ? -60 : W+60);
            sy = -100;
            spd = 0.40;
        } else if(kind==='icbm') {
            sx = tx + rng(-40, 40);
            sy = -200;
            spd = 0.95;
        } else if(kind==='bunker') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -60;
            spd = 0.75;
        } else if(kind==='drone') {
            sx = (Math.random()<0.5 ? -60 : W+60);
            sy = H * 0.20;
            spd = 0.30;
        } else if(kind==='stealth') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -40;
            spd = 0.55;
        } else if(kind==='railgun' || kind==='photon') {
            sx = tx + rng(-20, 20);
            sy = -300;
            spd = 2.20;
        } else if(kind==='antimatter' || kind==='gravity' || kind==='neutron') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -60;
            spd = 0.50;
        } else if(kind==='bio' || kind==='chemical') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -40;
            spd = 0.55;
        } else if(kind==='emp') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -60;
            spd = 0.55;
        } else if(kind==='tactical' || kind==='decoy' || kind==='_swarmer') {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -40;
            spd = 0.62;
        } else {
            sx = (Math.random()<0.5 ? -40 : W+40);
            sy = -40;
            spd = 0.62;
        }
        var dxN = tx - sx, dyN = ty - sy;
        var dist = Math.sqrt(dxN*dxN+dyN*dyN);
        var m = {
            kind: kind,
            x:sx, y:sy, sx:sx, sy:sy, tx:tx, ty:ty,
            vx:(dxN/dist)*spd, vy:(dyN/dist)*spd,
            angle:Math.atan2(dyN,dxN),
            trail:[],
            life:0,
            maxLife: dist/spd,
            spd: spd,
            wobbleT: rng(0, Math.PI*2),
            boomT: 0,
            boomRings: [],
            sparks: []
        };
        if(kind==='cluster') {
            m.splitFrac = rng(0.45, 0.58);
            m.split = false;
            m.bomblets = [];
        }
        if(kind==='plasma') {
            m.arcs = [];
            m.orbits = [];
            for(var oi=0;oi<8;oi++) {
                m.orbits.push({
                    ang: rng(0, Math.PI*2),
                    rad: rng(10, 22),
                    spd: rng(0.005, 0.015) * (Math.random()<0.5?1:-1),
                    size: rng(1.5, 3.5),
                    hue: rngI(180, 260)
                });
            }
        }
        if(kind==='cruise') {
            m.wingT = 0;
            m.diveStart = 0.80; /* dive in last 20% */
        }
        if(kind==='hypersonic') {
            m.shockCones = [];
        }
        /* tag the missile as user-fired so defence batteries
           get 100% intercept when in attack mode */
        m.userFired = !!missileArmed;
        missiles.push(m);
        tryIntercept(m);
    }

    /* schedule an interceptor for this missile.
       - Strategy missiles: 90% (so user can craft a salvo that evades defence)
       - Single attack missiles: 100% (always intercepted)
       - AI / spawned (defenceMode): 90% */
    function tryIntercept(m) {
        if (!defenceActive) return;           /* defence is offline */
        if (!airDefence.length) return;
        if (m.userFired && !m.strategy) {
            /* attackDifficulty: 0 = easy (50% intercepted), 1 = hard (100% intercepted) */
            var userIRate = 0.5 + 0.5*attackDifficulty;
            if (Math.random() > userIRate) return;
        } else if (Math.random() > INTERCEPT_RATE) return;
        /* pick the closest battery to the missile's target */
        var best = airDefence[0], bestD = Infinity;
        for (var i=0;i<airDefence.length;i++) {
            var d = Math.abs(airDefence[i].x - m.tx);
            if (d < bestD) { bestD = d; best = airDefence[i]; }
        }
        /* AUTO = smart-pick by missile type; otherwise force the selected defence */
        var defSel = DEFENCE_TYPES[defenceTypeIdx];
        var iKind = (defSel === 'auto')
            ? (INTERCEPT_FOR[m.kind] || 'sam')
            : defSel;
        /* launch delay — short so user sees the response quickly */
        var delay = (iKind==='laser') ? 500 : 180 + Math.random()*180;
        best.cooldown = 240;
        best.alertT = delay;  /* show pre-launch warning blink */
        setTimeout(function(){
            /* missile may have already exploded — abort if so */
            if (missiles.indexOf(m) === -1) return;
            best.flashT = 220;
            if (iKind === 'laser') {
                /* instant beam strike */
                laserBeams.push({
                    x1: best.x, y1: best.y - 14,
                    x2: m.x,   y2: m.y,
                    life: 0, maxLife: 260
                });
                killMissile(m, true);
                return;
            }
            var startX = best.x, startY = best.y - 14;
            var dx = m.x - startX, dy = m.y - startY;
            var dist = Math.sqrt(dx*dx + dy*dy) || 1;
            var spd = (iKind==='patriot') ? 1.10 :
                      (iKind==='emp')     ? 0.85 :
                      (iKind==='multi')   ? 0.95 :
                      0.95;
            interceptors.push({
                kind: iKind,
                x: startX, y: startY,
                vx: dx/dist*spd, vy: dy/dist*spd,
                angle: Math.atan2(dy,dx),
                spd: spd,
                target: m,
                trail: [],
                life: 0,
                arcs: (iKind==='emp') ? [] : null,
                spinT: 0
            });
            /* launch smoke puff at the battery */
            for (var pi=0; pi<10; pi++) {
                debrisParts.push({
                    x: best.x + rng(-3,3), y: best.y - 8,
                    vx: rng(-2,2), vy: -rng(2,5),
                    rot:0, spin:0, size: rng(1.5,3),
                    shade: 99,
                    life:0, maxLife: rng(400,800)
                });
            }
        }, delay);
    }

    /* destroy a missile without it impacting (intercepted) */
    function killMissile(m, midairExplosion) {
        var idx = missiles.indexOf(m);
        if (idx === -1) return;
        if (m.strategy) strategyStats.intercepted++;
        missiles.splice(idx, 1);
        if (midairExplosion) {
            /* small mid-air detonation */
            explosions.push({ x:m.x, y:m.y, r:0, maxR:40, life:0, maxLife:420, kind:'fire' });
            explosions.push({ x:m.x, y:m.y, r:0, maxR:70, life:0, maxLife:320, kind:'shock' });
            explosions.push({ x:m.x, y:m.y, r:0, maxR:22, life:0, maxLife:180, kind:'flash' });
            for (var i=0;i<20;i++) {
                var a = Math.random()*Math.PI*2;
                debrisParts.push({
                    x:m.x, y:m.y,
                    vx:Math.cos(a)*rng(1.5,4), vy:Math.sin(a)*rng(1.5,4),
                    rot:rng(0,Math.PI*2), spin:rng(-0.3,0.3),
                    size:rng(1.5,3.5), shade:rngI(0,4),
                    life:0, maxLife:rng(500,1000)
                });
            }
        }
    }

    function updateMissileSystem(dt) {
        /* defensive — make sure batteries exist (handles deferred canvas sizing) */
        if (!airDefence || airDefence.length===0) initAirDefence();
        /* DEFENCE MODE — AI spawns hostile missiles for the user to intercept */
        if (defenceMode) {
            defenceModeTimer -= dt;
            if (defenceModeTimer <= 0) {
                /* defenceDifficulty: 0 = slow (4–6.5s), 1 = fast (0.5–2s) */
                var base   = 4000 - 3500*defenceDifficulty;
                var jitter = 2500 - 1000*defenceDifficulty;
                defenceModeTimer = base + Math.random()*jitter;
                spawnAIMissile();
            }
        }
        /* missiles */
        for(var i=missiles.length-1;i>=0;i--) {
            var m=missiles[i];
            m.life+=dt;
            m.wobbleT += dt*0.006;
            var lifeFrac = m.life/m.maxLife;

            /* per-kind motion */
            if(m.kind==='cruise') {
                /* horizontal cruise, then dive */
                if(lifeFrac < m.diveStart) {
                    /* fly mostly horizontal toward target x */
                    var dxC = m.tx - m.x;
                    var dyC = (m.ty - 80) - m.y;
                    var dC = Math.sqrt(dxC*dxC+dyC*dyC);
                    m.vx = dxC/dC * m.spd;
                    m.vy = dyC/dC * m.spd * 0.4;
                } else {
                    /* dive: aim straight at target */
                    var dxD = m.tx - m.x, dyD = m.ty - m.y;
                    var dD = Math.sqrt(dxD*dxD+dyD*dyD) || 1;
                    m.vx = dxD/dD * m.spd*1.4;
                    m.vy = dyD/dD * m.spd*1.4;
                }
                m.angle = Math.atan2(m.vy, m.vx);
                m.wingT += dt*0.005;
            } else {
                /* keep tracking target angle for smooth aim */
                var dxR = m.tx - m.x, dyR = m.ty - m.y;
                var dR = Math.sqrt(dxR*dxR+dyR*dyR) || 1;
                m.vx = dxR/dR * m.spd;
                m.vy = dyR/dR * m.spd;
                m.angle = Math.atan2(m.vy, m.vx) + Math.sin(m.wobbleT)*0.04;
            }
            m.x += m.vx*dt;
            m.y += m.vy*dt;
            m.trail.push({x:m.x,y:m.y,age:0,jitter:rng(-1.5,1.5)});
            for(var ti=0;ti<m.trail.length;ti++) m.trail[ti].age+=dt;
            var trailLife = (m.kind==='hypersonic')?1400 : (m.kind==='plasma')?700 : 900;
            while(m.trail.length>0 && m.trail[0].age>trailLife) m.trail.shift();

            /* sonic boom rings */
            m.boomT += dt;
            var boomInt = (m.kind==='hypersonic')?90 : (m.kind==='cruise')?200 : 220;
            if(m.boomT>boomInt && m.kind!=='plasma') {
                m.boomT = 0;
                m.boomRings.push({x:m.x, y:m.y, r:0, maxR:rng(28, 42), life:0, maxLife:rng(380,640)});
            }
            for(var br=m.boomRings.length-1;br>=0;br--) {
                m.boomRings[br].life+=dt;
                m.boomRings[br].r = m.boomRings[br].maxR * (m.boomRings[br].life/m.boomRings[br].maxLife);
                if(m.boomRings[br].life>=m.boomRings[br].maxLife) m.boomRings.splice(br,1);
            }

            /* exhaust sparks */
            var sparkRate = (m.kind==='hypersonic')?5 : (m.kind==='plasma')?2 : 3;
            for(var sk=0;sk<sparkRate;sk++) {
                m.sparks.push({
                    x: m.x - Math.cos(m.angle)*10 + rng(-2,2),
                    y: m.y - Math.sin(m.angle)*10 + rng(-2,2),
                    vx: -Math.cos(m.angle)*rng(0.5,2) + rng(-0.5,0.5),
                    vy: -Math.sin(m.angle)*rng(0.5,2) + rng(-0.5,0.5),
                    life:0, maxLife:rng(250, 600),
                    size: rng(0.6, 1.8),
                    hue: (m.kind==='plasma') ? rngI(180,280) : (m.kind==='hypersonic') ? rngI(0,40) : rngI(20, 50)
                });
            }
            for(var skj=m.sparks.length-1;skj>=0;skj--) {
                var sp2=m.sparks[skj];
                sp2.life+=dt; sp2.x+=sp2.vx*dt*0.05; sp2.y+=sp2.vy*dt*0.05;
                if(sp2.life>=sp2.maxLife) m.sparks.splice(skj,1);
            }

            /* plasma orbits & arcs */
            if(m.kind==='plasma') {
                for(var oi=0;oi<m.orbits.length;oi++) m.orbits[oi].ang += m.orbits[oi].spd*dt;
                if(Math.random()<0.18 && m.arcs.length<6) {
                    var a1 = rng(0, Math.PI*2), a2 = a1 + rng(0.5, Math.PI*1.5);
                    var r1 = rng(8, 26),       r2 = rng(8, 26);
                    var pts=[];
                    var segs = rngI(4,7);
                    for(var ps=0;ps<=segs;ps++) {
                        var ang = a1 + (a2-a1)*(ps/segs);
                        var rd = r1 + (r2-r1)*(ps/segs) + rng(-3,3);
                        pts.push({dx:Math.cos(ang)*rd, dy:Math.sin(ang)*rd});
                    }
                    m.arcs.push({pts:pts, life:0, maxLife:rng(120,260), hue:rngI(180,280)});
                }
                for(var ai=m.arcs.length-1;ai>=0;ai--) {
                    m.arcs[ai].life+=dt;
                    if(m.arcs[ai].life>=m.arcs[ai].maxLife) m.arcs.splice(ai,1);
                }
            }

            /* hypersonic shock cones */
            if(m.kind==='hypersonic' && Math.random()<0.3) {
                m.shockCones.push({x:m.x, y:m.y, angle:m.angle, life:0, maxLife:rng(300,500)});
            }
            if(m.shockCones) {
                for(var sc=m.shockCones.length-1;sc>=0;sc--) {
                    m.shockCones[sc].life+=dt;
                    if(m.shockCones[sc].life>=m.shockCones[sc].maxLife) m.shockCones.splice(sc,1);
                }
            }

            /* cluster split at midpoint — spawn bomblets at THIS position
               (not from a screen corner) so they look like the warhead opened */
            if(m.kind==='cluster' && !m.split && lifeFrac>=m.splitFrac) {
                m.split = true;
                /* small "pop" flash at split point */
                explosions.push({ x:m.x, y:m.y, r:0, maxR:36, life:0, maxLife:280, kind:'flash' });
                /* eject 5 bomblets from current position, each tracking an offset target */
                for(var bb=0;bb<5;bb++) {
                    var oxB = rng(-50, 50), oyB = rng(-20, 20);
                    var btx = m.tx + oxB, bty = m.ty + oyB;
                    var bSx = m.x, bSy = m.y;
                    /* give the bomblets a small ejection velocity spread */
                    var ejAng = rng(-Math.PI*0.18, Math.PI*0.18);
                    var bDx = btx - bSx, bDy = bty - bSy;
                    var bDist = Math.sqrt(bDx*bDx + bDy*bDy) || 1;
                    var bSpd = 0.55;
                    var baseAng = Math.atan2(bDy, bDx) + ejAng;
                    missiles.push({
                        kind:'_bomblet',
                        x: bSx, y: bSy,
                        sx: bSx, sy: bSy,
                        tx: btx, ty: bty,
                        vx: Math.cos(baseAng)*bSpd,
                        vy: Math.sin(baseAng)*bSpd,
                        angle: baseAng,
                        trail: [],
                        life: 0,
                        maxLife: bDist/bSpd,
                        spd: bSpd,
                        wobbleT: rng(0, Math.PI*2),
                        boomT: 0,
                        boomRings: [],
                        sparks: []
                    });
                }
                missiles.splice(i,1);
                continue;
            }

            /* impact */
            if(m.life>=m.maxLife) {
                /* hypersonic and standard get a full blast; bomblets get a smaller one */
                if(m.kind==='_bomblet') {
                    /* mini explosion */
                    var bR = 50;
                    screenFlash = Math.max(screenFlash, 0.55);
                    explosions.push({ x:m.tx, y:m.ty, r:0, maxR:bR*1.4, life:0, maxLife:550, kind:'fire' });
                    explosions.push({ x:m.tx, y:m.ty, r:0, maxR:bR*2.4, life:0, maxLife:430, kind:'shock' });
                    explosions.push({ x:m.tx, y:m.ty, r:0, maxR:bR*0.55,life:0, maxLife:200, kind:'flash' });
                    for(var dd=0;dd<20;dd++) {
                        var ang2=Math.random()*Math.PI*2, sp3=rng(2,6);
                        debrisParts.push({x:m.tx,y:m.ty,vx:Math.cos(ang2)*sp3,vy:Math.sin(ang2)*sp3-rng(1,4),
                            rot:rng(0,Math.PI*2),spin:rng(-0.4,0.4),size:rng(1.5,5),shade:rngI(0,4),
                            life:0,maxLife:rng(600,1500)});
                    }
                    /* small destruction check */
                    triggerSmallExplosion(m.tx, m.ty, bR);
                } else {
                    triggerExplosion(m.tx, m.ty, m.kind);
                }
                if (m.strategy) strategyStats.hits++;
                missiles.splice(i,1);
            }
        }
        /* interceptors — chase their target missile and kill on contact */
        for(var I=interceptors.length-1;I>=0;I--) {
            var ic=interceptors[I];
            ic.life+=dt; ic.spinT+=dt;
            /* re-aim at target if still alive */
            if (ic.target && missiles.indexOf(ic.target)===-1) {
                /* original target gone — pick nearest in-flight missile */
                var closest=null, closestD=Infinity;
                for (var mi=0;mi<missiles.length;mi++) {
                    var mm=missiles[mi];
                    var dxx=mm.x-ic.x, dyy=mm.y-ic.y;
                    var dd=dxx*dxx+dyy*dyy;
                    if (dd<closestD) { closestD=dd; closest=mm; }
                }
                ic.target = closest;
            }
            if (ic.target) {
                var tdx=ic.target.x-ic.x, tdy=ic.target.y-ic.y;
                var tdist=Math.sqrt(tdx*tdx+tdy*tdy)||1;
                /* homing — re-aim every frame */
                ic.vx = tdx/tdist*ic.spd;
                ic.vy = tdy/tdist*ic.spd;
                ic.angle = Math.atan2(ic.vy, ic.vx);
            }
            ic.x += ic.vx*dt; ic.y += ic.vy*dt;
            ic.trail.push({x:ic.x, y:ic.y, age:0});
            for (var ti=0;ti<ic.trail.length;ti++) ic.trail[ti].age+=dt;
            while (ic.trail.length>0 && ic.trail[0].age>500) ic.trail.shift();
            /* EMP electric arcs */
            if (ic.kind==='emp' && ic.arcs && Math.random()<0.20 && ic.arcs.length<4) {
                var pts=[]; var a1=rng(0,Math.PI*2);
                for (var ps=0;ps<5;ps++) {
                    pts.push({dx:Math.cos(a1+ps*0.5)*rng(4,10), dy:Math.sin(a1+ps*0.5)*rng(4,10)});
                }
                ic.arcs.push({pts:pts, life:0, maxLife:180});
            }
            if (ic.arcs) {
                for (var ai=ic.arcs.length-1;ai>=0;ai--) {
                    ic.arcs[ai].life+=dt;
                    if (ic.arcs[ai].life>=ic.arcs[ai].maxLife) ic.arcs.splice(ai,1);
                }
            }
            /* contact check */
            if (ic.target) {
                var hx=ic.target.x-ic.x, hy=ic.target.y-ic.y;
                var hitR2 = ic.enhanced ? 600 : 220;  /* ~24px vs 15px */
                if (hx*hx+hy*hy < hitR2) {
                    if (ic.enhanced) killMissileBig(ic.target);
                    else killMissile(ic.target, true);
                    interceptors.splice(I,1);
                    continue;
                }
            }
            /* off-screen or stale — drop */
            if (ic.life>8000 || ic.y<-40 || ic.y>H+40 || ic.x<-40 || ic.x>W+40) {
                interceptors.splice(I,1);
            }
        }
        /* target locks track the missile until they expire */
        for (var tl=targetLocks.length-1; tl>=0; tl--) {
            var TL = targetLocks[tl];
            TL.life += dt;
            if (TL.targetM && missiles.indexOf(TL.targetM) !== -1) {
                TL.x = TL.targetM.x; TL.y = TL.targetM.y;
            }
            if (TL.life >= TL.maxLife) targetLocks.splice(tl,1);
        }
        /* laser beams fade */
        for (var lb=laserBeams.length-1;lb>=0;lb--) {
            laserBeams[lb].life+=dt;
            if (laserBeams[lb].life>=laserBeams[lb].maxLife) laserBeams.splice(lb,1);
        }
        /* battery animation cooldown */
        for (var ab=0;ab<airDefence.length;ab++) {
            if (airDefence[ab].cooldown>0) airDefence[ab].cooldown -= dt;
            if (airDefence[ab].flashT>0)   airDefence[ab].flashT   -= dt;
            if (airDefence[ab].alertT>0)   airDefence[ab].alertT   -= dt;
        }
        /* explosions */
        for(var e=explosions.length-1;e>=0;e--) {
            var ex=explosions[e];
            ex.life+=dt;
            ex.r = ex.maxR * Math.pow(ex.life/ex.maxLife, 0.55);
            if(ex.life>ex.maxLife) explosions.splice(e,1);
        }
        /* debris */
        for(var d=debrisParts.length-1;d>=0;d--) {
            var p=debrisParts[d];
            p.life+=dt; p.x+=p.vx*dt*0.06; p.y+=p.vy*dt*0.06;
            p.vy += 0.04*dt*0.06 * 9.0;
            p.rot += p.spin*dt*0.06;
            if(p.y>GROUND+rng(0,30)) {
                p.vy*=-0.3; p.vx*=0.6; p.y=GROUND;
                if(p.life>p.maxLife*0.4) { debrisParts.splice(d,1); continue; }
            }
            if(p.life>p.maxLife) debrisParts.splice(d,1);
        }
        /* craters persist forever — just advance time for any subtle anim */
        for(var cr=0;cr<craters.length;cr++) craters[cr].life+=dt;
        /* wreckage fire timer */
        for(var wi=0;wi<wreckage.length;wi++) {
            if(wreckage[wi].fireT!==undefined) wreckage[wi].fireT += dt;
            if(wreckage[wi].smokeT!==undefined) wreckage[wi].smokeT += dt;
        }
        /* smoke plumes rise */
        for(var sp=smokePlumes.length-1;sp>=0;sp--) {
            var s=smokePlumes[sp];
            s.life+=dt;
            s.y -= s.vy*dt*0.06;
            s.r += 0.03*dt*0.06;
            if(s.life>s.maxLife) smokePlumes.splice(sp,1);
        }
        /* mushroom clouds */
        for (var mc=mushroomClouds.length-1; mc>=0; mc--) {
            var M=mushroomClouds[mc];
            M.life += dt;
            var p = M.life/M.maxLife;
            M.capR = Math.min(M.capMaxR, M.capR + (M.capMaxR/2200)*dt);
            M.stemTop -= 0.025 * dt;
            if (M.life >= M.maxLife) mushroomClouds.splice(mc,1);
        }
        /* fire fields — flame instances */
        for (var ff=fireFields.length-1; ff>=0; ff--) {
            fireFields[ff].life += dt;
            if (fireFields[ff].life >= fireFields[ff].maxLife) fireFields.splice(ff,1);
        }
        /* gas clouds expand and drift */
        for (var gc=gasClouds.length-1; gc>=0; gc--) {
            var G=gasClouds[gc];
            G.life += dt;
            var gp = G.life/G.maxLife;
            G.r = Math.min(G.maxR, G.r + (G.maxR/1800)*dt);
            G.x += G.vx * dt * 0.04;
            G.y += G.vy * dt * 0.04;
            if (G.life >= G.maxLife) gasClouds.splice(gc,1);
        }
        /* emp pulses */
        for (var ep=empPulses.length-1; ep>=0; ep--) {
            var EP = empPulses[ep];
            EP.life += dt;
            EP.r = EP.maxR * Math.pow(EP.life/EP.maxLife, 0.5);
            if (Math.random()<0.4 && EP.arcs.length<10) {
                var pts=[];
                var a0=rng(0,Math.PI*2);
                var rs=EP.r*0.6;
                pts.push({x:EP.x+Math.cos(a0)*rs, y:EP.y+Math.sin(a0)*rs});
                for (var pp=1; pp<6; pp++) {
                    var rs2=EP.r*(0.6+pp*0.07);
                    pts.push({x:EP.x+Math.cos(a0+pp*0.4)*rs2+rng(-6,6),
                              y:EP.y+Math.sin(a0+pp*0.4)*rs2+rng(-6,6)});
                }
                EP.arcs.push({pts:pts, life:0, maxLife:200});
            }
            for (var ai=EP.arcs.length-1; ai>=0; ai--) {
                EP.arcs[ai].life += dt;
                if (EP.arcs[ai].life >= EP.arcs[ai].maxLife) EP.arcs.splice(ai,1);
            }
            if (EP.life >= EP.maxLife) empPulses.splice(ep,1);
        }
        /* gravity wells — pull debris toward center, then release */
        for (var gw=gravityWells.length-1; gw>=0; gw--) {
            var GW = gravityWells[gw];
            GW.life += dt;
            /* pull existing debris and embers toward center */
            if (GW.phase==='pull') {
                for (var dpi=0; dpi<debrisParts.length; dpi++) {
                    var dp2=debrisParts[dpi];
                    var dxg = GW.x-dp2.x, dyg = GW.y-dp2.y;
                    var dg = Math.sqrt(dxg*dxg+dyg*dyg) || 1;
                    if (dg < GW.innerR) {
                        var pull = 0.04 * dt;
                        dp2.vx += (dxg/dg) * pull;
                        dp2.vy += (dyg/dg) * pull;
                    }
                }
            }
            if (GW.life >= GW.maxLife) gravityWells.splice(gw,1);
        }
        /* neutron pulse expands fast and fades */
        for (var np=neutronPulses.length-1; np>=0; np--) {
            var NP=neutronPulses[np];
            NP.life += dt;
            NP.r = NP.maxR * Math.pow(NP.life/NP.maxLife, 0.5);
            if (NP.life >= NP.maxLife) neutronPulses.splice(np,1);
        }
        /* antimatter bursts */
        for (var am=antimatterBursts.length-1; am>=0; am--) {
            var AM=antimatterBursts[am];
            AM.life += dt;
            AM.r = AM.maxR * Math.pow(AM.life/AM.maxLife, 0.4);
            AM.rayPhase += dt * 0.005;
            if (AM.life >= AM.maxLife) antimatterBursts.splice(am,1);
        }
        /* photon strikes — vertical beam fades quickly */
        for (var ph=photonStrikes.length-1; ph>=0; ph--) {
            photonStrikes[ph].life += dt;
            if (photonStrikes[ph].life >= photonStrikes[ph].maxLife) photonStrikes.splice(ph,1);
        }

        /* screen flash decays */
        if(screenFlash>0) screenFlash = Math.max(0, screenFlash - dt*0.0025);
    }

    /* small bomblet explosion — lighter destruction */
    function triggerSmallExplosion(x, y, blastR) {
        var hitV=[];
        for(var vh=0;vh<vehicles.length;vh++) {
            var vv=vehicles[vh];
            var loff = (vv.dir===1) ? (H-GROUND)*0.06 : -(H-GROUND)*0.06;
            var yy = GROUND + (H-GROUND)*0.10 + loff;
            var dxx=vv.x-x, dyy=yy-y;
            if(dxx*dxx+dyy*dyy < blastR*blastR) hitV.push(vh);
        }
        var hitB = isBuildingAt(x, y);
        if(!hitV.length && !hitB) return;
        /* light wreckage */
        if(hitB) {
            var bbW = blastR*1.2;
            var bbL = x-bbW/2, bbR2 = x+bbW/2;
            var edge=[];
            for(var jj=0;jj<=14;jj++) {
                edge.push({x:bbL+(jj/14)*bbW, y:y+rng(-8,8)});
            }
            wreckage.push({kind:'brokenBuilding', x:x, leftX:bbL, rightX:bbR2,
                breakY:y, edge:edge,
                rebar:(function(){var r=[];for(var i=0;i<4;i++)r.push({x:x+rng(-bbW*0.4,bbW*0.4),y0:y+rng(-3,5),y1:y-rng(10,25),bend:rng(-5,5)});return r;})(),
                fires:[{x:x,y:y,scale:0.55,phase:rng(0,500)}],
                smokeT:0});
        }
        for(var vi2=0;vi2<hitV.length;vi2++) {
            var vv2=vehicles[hitV[vi2]];
            var loff2=(vv2.dir===1)?(H-GROUND)*0.06:-(H-GROUND)*0.06;
            wreckage.push({kind:'carWreck', x:vv2.x, y:GROUND+(H-GROUND)*0.10+loff2,
                type:vv2.type, dir:vv2.dir, col:vv2.col,
                tilt:rng(-0.2,0.2), sinkY:rng(1,3),
                cracks:(function(){var c=[];for(var i=0;i<4;i++)c.push({a:rng(0,Math.PI*2),len:rng(3,9)});return c;})(),
                burning:true, fireT:0});
            vv2.x = vv2.dir===1 ? -200 : W+200;
        }
    }

    /* Is there a still-standing building at (x, y)?
       Samples cityCvs (transparent where there's only sky) and rules out areas
       already destroyed by previous strikes. */
    function isBuildingAt(x, y) {
        if(y >= GROUND-2) return false;
        /* already-destroyed column? */
        for(var wi=0;wi<wreckage.length;wi++) {
            var w=wreckage[wi];
            if(w.kind==='brokenBuilding' &&
               x>=w.leftX && x<=w.rightX && y<=w.breakY) return false;
        }
        try {
            var d = cityC.getImageData(Math.max(0,Math.floor(x)),
                                       Math.max(0,Math.floor(y)), 1, 1).data;
            return d[3] > 30;
        } catch(e) { return true; /* fall back to treat as hit */ }
    }

    /* ── kill all live entities (vehicles + peds) within radius, push wrecks ── */
    function _shredInRadius(x, y, r, opts) {
        opts = opts || {};
        for (var vi=vehicles.length-1; vi>=0; vi--) {
            var v=vehicles[vi];
            var lo=(v.dir===1)?(H-GROUND)*0.06:-(H-GROUND)*0.06;
            var vy_=GROUND+(H-GROUND)*0.10+lo;
            var dx=v.x-x, dy=vy_-y;
            if (dx*dx+dy*dy < r*r) {
                if (opts.keepVehicleVisible !== true) {
                    wreckage.push({
                        kind:'carWreck', x:v.x, y:vy_,
                        type:v.type, dir:v.dir, col:v.col,
                        tilt:rng(-0.3,0.3), sinkY:rng(2,6),
                        cracks:(function(){var c=[];for(var i=0;i<rngI(4,8);i++)c.push({a:rng(0,Math.PI*2),len:rng(4,12)});return c;})(),
                        burning: opts.fire !== false,
                        fireT:rng(0,100)
                    });
                }
                v.x = v.dir===1 ? -200 : W+200;
            }
        }
        for (var pi=peds.length-1; pi>=0; pi--) {
            var p=peds[pi];
            var pdy=GROUND+(H-GROUND)*0.58;
            var ddx=p.x-x, ddy=pdy-y;
            if (ddx*ddx+ddy*ddy < r*r) {
                for (var dq=0; dq<3; dq++) {
                    debrisParts.push({ x:p.x, y:pdy,
                        vx:rng(-5,5), vy:rng(-6,-2),
                        rot:rng(0,Math.PI*2), spin:rng(-0.3,0.3),
                        size:rng(1.5,3), shade:99,
                        life:0, maxLife:rng(700,1400) });
                }
                p.x = p.dir===1 ? -30 : W+30;
            }
        }
    }
    function _flattenBuilding(x, y, r) {
        if (y >= GROUND-10) return;
        if (!isBuildingAt(x, y)) return;
        var bbW = r*1.6;
        var bbL = x-bbW/2, bbR2 = x+bbW/2;
        var edge=[];
        for (var jj=0; jj<=16; jj++) {
            edge.push({ x:bbL+(jj/16)*bbW, y:y+rng(-10,8) });
        }
        wreckage.push({
            kind:'brokenBuilding', x:x,
            leftX:bbL, rightX:bbR2, breakY:y,
            edge:edge,
            rebar:(function(){
                var rb=[];
                for (var ri=0;ri<8;ri++) rb.push({x:x+rng(-bbW*0.45,bbW*0.45),y0:y+rng(-4,6),y1:y-rng(14,38),bend:rng(-7,7)});
                return rb;
            })(),
            fires:(function(){
                var fs=[];
                for (var fi=0;fi<3;fi++) {
                    var pf = edge[Math.floor((fi+1)*edge.length/4)];
                    if (pf) fs.push({x:pf.x, y:pf.y, scale:rng(0.55,0.95), phase:rng(0,1000)});
                }
                return fs;
            })(),
            smokeT:0
        });
    }

    /* ──── NUCLEAR / HYDROGEN ─────────────────────────────────────────── */
    function triggerNuclear(x, y, scale) {
        scale = scale || 1.0;
        var blastR = 220 * scale;
        screenFlash = 1.4;
        eqShakeX = (Math.random()-0.5)*30*scale;
        eqShakeY = (Math.random()-0.5)*22*scale;
        /* triple flash bloom (white-hot core, mid, far) */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.6, life:0, maxLife:400, kind:'flash' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.0, life:0, maxLife:900, kind:'fire' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.8, life:0, maxLife:700, kind:'shock' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*3.2, life:0, maxLife:1400, kind:'shock' });
        /* mushroom cloud */
        mushroomClouds.push({
            x:x, gy: (y<GROUND? y : GROUND),
            stemTop: y - blastR*0.4, stemBot: GROUND,
            capR: 0, capMaxR: blastR*1.4,
            life:0, maxLife: 18000 * scale,
            scale: scale
        });
        /* heavy embers + debris */
        for (var i=0; i<120*scale; i++) {
            var a=Math.random()*Math.PI*2, sp=rng(3,12);
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-rng(2,8),
                rot:rng(0,Math.PI*2), spin:rng(-0.5,0.5),
                size:rng(2,8), shade:rngI(0,4),
                life:0, maxLife:rng(1200,2600)
            });
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a+0.4)*sp*1.2, vy:Math.sin(a+0.4)*sp*1.2-rng(1,5),
                rot:0, spin:0, size:rng(1,2.5), shade:99,
                life:0, maxLife:rng(700,1500)
            });
        }
        /* large persistent smoke plumes */
        for (var sp1=0; sp1<10; sp1++) {
            smokePlumes.push({
                x:x+rng(-blastR*0.3,blastR*0.3),
                y:y+rng(-20,30),
                r:rng(40,80)*scale, vy:rng(0.5,1.5),
                life:0, maxLife:rng(8000,14000),
                op:rng(0.55,0.85)
            });
        }
        /* devastating destruction across a HUGE radius */
        _shredInRadius(x, y, blastR);
        _shredInRadius(x, y, blastR*1.5, {fire:true});
        if (y < GROUND-10) {
            _flattenBuilding(x, y, blastR);
            /* secondary flatten on neighboring columns */
            _flattenBuilding(x - blastR*0.7, y, blastR*0.7);
            _flattenBuilding(x + blastR*0.7, y, blastR*0.7);
        }
    }

    /* ──── THERMOBARIC ────────────────────────────────────────────────── */
    function triggerThermobaric(x, y) {
        var blastR = 160;
        screenFlash = 1;
        eqShakeX = (Math.random()-0.5)*18;
        eqShakeY = (Math.random()-0.5)*12;
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.5, life:0, maxLife:900, kind:'fire' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*2.4, life:0, maxLife:600, kind:'shock' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.6, life:0, maxLife:300, kind:'flash' });
        /* persistent fire field on the ground */
        var fireCount = 9;
        for (var fc=0; fc<fireCount; fc++) {
            fireFields.push({
                x: x + rng(-blastR*0.85, blastR*0.85),
                y: GROUND - rng(0, 6),
                scale: rng(0.8, 1.6),
                phase: rng(0, 2000),
                life: 0, maxLife: rng(8000, 14000)
            });
        }
        /* sparks */
        for (var i=0; i<70; i++) {
            var a=Math.random()*Math.PI*2;
            debrisParts.push({
                x:x, y:y,
                vx:Math.cos(a)*rng(3,10), vy:Math.sin(a)*rng(3,7)-rng(1,4),
                rot:0, spin:0, size:rng(1,2.5), shade:99,
                life:0, maxLife:rng(700,1500)
            });
        }
        for (var sp=0; sp<6; sp++) {
            smokePlumes.push({ x:x+rng(-30,30),y:y+rng(-10,10),
                r:rng(30,60), vy:rng(0.5,1.4),
                life:0, maxLife:rng(5000,9000), op:rng(0.55,0.80) });
        }
        _shredInRadius(x, y, blastR, {fire:true});
        if (y < GROUND-10) _flattenBuilding(x, y, blastR);
    }

    /* ──── BUNKER BUSTER (delayed secondary blast) ────────────────────── */
    function triggerBunker(x, y) {
        var blastR = 130;
        screenFlash = 0.6;
        eqShakeX = (Math.random()-0.5)*10;
        eqShakeY = (Math.random()-0.5)*8;
        /* small initial penetration burst */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.4, life:0, maxLife:300, kind:'flash' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.7, life:0, maxLife:500, kind:'fire' });
        /* secondary deep blast after a delay */
        setTimeout(function(){
            screenFlash = 1;
            eqShakeX = (Math.random()-0.5)*20;
            eqShakeY = (Math.random()-0.5)*16;
            explosions.push({ x:x, y:y, r:0, maxR:blastR*1.6, life:0, maxLife:850, kind:'fire' });
            explosions.push({ x:x, y:y, r:0, maxR:blastR*2.6, life:0, maxLife:650, kind:'shock' });
            for (var i=0; i<60; i++) {
                var a=Math.random()*Math.PI*2, sp=rng(4,9);
                debrisParts.push({ x:x,y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-rng(3,7),
                    rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                    size:rng(3,8), shade:rngI(0,4),
                    life:0, maxLife:rng(1000,2200) });
            }
            for (var sp2=0; sp2<5; sp2++) {
                smokePlumes.push({ x:x+rng(-25,25),y:y+rng(-10,10),
                    r:rng(30,50), vy:rng(0.5,1.2),
                    life:0, maxLife:rng(4000,7000), op:rng(0.5,0.75) });
            }
            _shredInRadius(x, y, blastR);
            if (y < GROUND-10) _flattenBuilding(x, y, blastR);
        }, 450);
    }

    /* ──── BIO / CHEMICAL (gas cloud, kills peds, leaves buildings) ──── */
    function triggerGas(x, y, type) {
        var gasR = 180;
        var color = (type==='bio')
            ? {core:'rgba(120,255,80,', edge:'rgba(20,80,20,'}
            : {core:'rgba(255,220,40,', edge:'rgba(140,80,0,'};
        /* small initial puff */
        explosions.push({ x:x, y:y, r:0, maxR:30, life:0, maxLife:300, kind:'flash' });
        for (var i=0; i<8; i++) {
            gasClouds.push({
                x: x + rng(-20,20), y: y + rng(-15,15),
                r: rng(20,40), maxR: gasR + rng(-30,30),
                vy: rng(-0.3, 0.05),
                vx: rng(-0.4, 0.4),
                life:0, maxLife: rng(14000, 22000),
                core: color.core, edge: color.edge,
                op: rng(0.55, 0.80)
            });
        }
        /* peds killed silently within radius (no fire) */
        for (var pi=peds.length-1; pi>=0; pi--) {
            var p=peds[pi];
            var pdy=GROUND+(H-GROUND)*0.58;
            var ddx=p.x-x, ddy=pdy-y;
            if (ddx*ddx+ddy*ddy < gasR*gasR) {
                for (var dq=0; dq<2; dq++) {
                    debrisParts.push({ x:p.x, y:pdy,
                        vx:rng(-1,1), vy:rng(-2,-1),
                        rot:0, spin:0, size:rng(0.8,1.5), shade:99,
                        life:0, maxLife:rng(500,1000) });
                }
                p.x = p.dir===1 ? -30 : W+30;
            }
        }
        /* vehicles abandoned (stopped, not destroyed) — leave them */
    }

    /* ──── ANTIMATTER ─────────────────────────────────────────────────── */
    function triggerAntimatter(x, y) {
        var blastR = 200;
        screenFlash = 1.6;
        eqShakeX = (Math.random()-0.5)*24;
        eqShakeY = (Math.random()-0.5)*18;
        /* signature antimatter sphere + radial rays */
        antimatterBursts.push({
            x:x, y:y, r:0, maxR: blastR*2.2,
            life:0, maxLife: 1600,
            rayPhase: 0
        });
        /* layered fireball + shockwave for actual blast feel */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.55, life:0, maxLife:380, kind:'flash' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.2, life:0, maxLife:850, kind:'fire' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*2.2, life:0, maxLife:700, kind:'shock' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*3.4, life:0, maxLife:900, kind:'shock' });
        /* white-blue tinted debris streaks */
        for (var i=0; i<90; i++) {
            var a=Math.random()*Math.PI*2, sp=rng(4,13);
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-rng(1,6),
                rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                size:rng(2,5), shade:rngI(0,4),
                life:0, maxLife:rng(900,1800)
            });
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a+0.5)*sp*1.3, vy:Math.sin(a+0.5)*sp*1.3-rng(0,3),
                rot:0, spin:0, size:rng(1,2), shade:99,
                life:0, maxLife:rng(600,1300)
            });
        }
        /* smoke plumes */
        for (var sp=0; sp<6; sp++) {
            smokePlumes.push({
                x:x+rng(-25,25), y:y+rng(-15,15),
                r:rng(30,55), vy:rng(0.5,1.2),
                life:0, maxLife:rng(4000,8000),
                op:rng(0.45,0.70)
            });
        }
        /* clean annihilation across a wide zone */
        _shredInRadius(x, y, blastR*1.3, {fire:true});
        if (y < GROUND-10) {
            _flattenBuilding(x, y, blastR);
            _flattenBuilding(x - blastR*0.6, y, blastR*0.55);
            _flattenBuilding(x + blastR*0.6, y, blastR*0.55);
        }
    }

    /* ──── GRAVITY (inward implosion, then outward burst) ─────────────── */
    function triggerGravity(x, y) {
        var blastR = 180;
        eqShakeX = (Math.random()-0.5)*10;
        eqShakeY = (Math.random()-0.5)*8;
        gravityWells.push({
            x:x, y:y, r:0,
            phase:'pull',
            life:0, maxLife:2000,
            innerR: blastR*1.5
        });
        /* after 1.2s, trigger outward burst */
        setTimeout(function(){
            screenFlash = 1.2;
            eqShakeX = (Math.random()-0.5)*22;
            eqShakeY = (Math.random()-0.5)*16;
            explosions.push({ x:x, y:y, r:0, maxR:blastR*1.6, life:0, maxLife:800, kind:'fire' });
            explosions.push({ x:x, y:y, r:0, maxR:blastR*3.0, life:0, maxLife:700, kind:'shock' });
            for (var i=0; i<80; i++) {
                var a=Math.random()*Math.PI*2, sp=rng(5,14);
                debrisParts.push({ x:x,y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
                    rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                    size:rng(2,6), shade:rngI(0,4),
                    life:0, maxLife:rng(1000,2200) });
            }
            _shredInRadius(x, y, blastR*1.3);
            if (y < GROUND-10) {
                _flattenBuilding(x, y, blastR);
                _flattenBuilding(x - blastR*0.7, y, blastR*0.6);
                _flattenBuilding(x + blastR*0.7, y, blastR*0.6);
            }
        }, 1200);
    }

    /* ──── NEUTRON (green radiation blast — full destruction) ────────── */
    function triggerNeutron(x, y) {
        var blastR = 140;
        screenFlash = 1.0;
        eqShakeX = (Math.random()-0.5)*18;
        eqShakeY = (Math.random()-0.5)*14;
        /* signature green radiation pulse */
        neutronPulses.push({
            x:x, y:y, r:0, maxR:blastR*2.4,
            life:0, maxLife:1200
        });
        /* layered green-tinted fireball + shockwave for actual blast feel */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.5, life:0, maxLife:350, kind:'flash' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.0, life:0, maxLife:700, kind:'fire' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*2.0, life:0, maxLife:600, kind:'shock' });
        /* heavy debris — chunks plus glowing green sparks */
        for (var i=0; i<70; i++) {
            var a=Math.random()*Math.PI*2, sp=rng(3,11);
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-rng(2,6),
                rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                size:rng(2,6), shade:rngI(0,4),
                life:0, maxLife:rng(1000,2000)
            });
            debrisParts.push({
                x:x, y:y, vx:Math.cos(a+0.3)*sp*1.1, vy:Math.sin(a+0.3)*sp*1.1-rng(1,4),
                rot:0, spin:0, size:rng(1,2.2), shade:99,
                life:0, maxLife:rng(600,1200)
            });
        }
        /* smoke plumes */
        for (var sp2=0; sp2<5; sp2++) {
            smokePlumes.push({
                x:x+rng(-25,25), y:y+rng(-10,15),
                r:rng(28,50), vy:rng(0.5,1.2),
                life:0, maxLife:rng(4000,7000),
                op:rng(0.45,0.70)
            });
        }
        /* full destruction — cars wrecked, peds gone, buildings collapsed */
        _shredInRadius(x, y, blastR, {fire:true});
        if (y < GROUND-10) _flattenBuilding(x, y, blastR);
    }

    /* ──── EMP (electric arcs, no fireball, disables nothing physical) ── */
    function triggerEMP(x, y) {
        var blastR = 150;
        screenFlash = 0.4;
        empPulses.push({
            x:x, y:y, r:0, maxR:blastR*2.6,
            life:0, maxLife:1100,
            arcs: []
        });
        explosions.push({ x:x, y:y, r:0, maxR:30, life:0, maxLife:240, kind:'flash' });
        /* no shred — EMP doesn't physically destroy */
    }

    /* ──── PHOTON (vertical white beam) ──────────────────────────────── */
    function triggerPhoton(x, y) {
        var blastR = 120;
        screenFlash = 1.4;
        photonStrikes.push({
            x: x, ty: y,
            life:0, maxLife: 600,
            width: 24
        });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.5, life:0, maxLife:300, kind:'flash' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.2, life:0, maxLife:600, kind:'fire' });
        explosions.push({ x:x, y:y, r:0, maxR:blastR*2.0, life:0, maxLife:500, kind:'shock' });
        for (var i=0; i<30; i++) {
            var a=Math.random()*Math.PI*2;
            debrisParts.push({ x:x, y:y,
                vx:Math.cos(a)*rng(3,8), vy:Math.sin(a)*rng(3,7)-rng(1,4),
                rot:0, spin:0, size:rng(1,2), shade:99,
                life:0, maxLife:rng(500,1000) });
        }
        _shredInRadius(x, y, blastR);
        if (y < GROUND-10) _flattenBuilding(x, y, blastR);
    }

    function triggerExplosion(x, y, kindOverride) {
        var kind = kindOverride || 'standard';
        /* ── special unique blast handlers ── */
        if (kind==='nuclear')      return triggerNuclear(x, y, 1.0);
        if (kind==='hydrogen')     return triggerNuclear(x, y, 1.6);
        if (kind==='thermobaric')  return triggerThermobaric(x, y);
        if (kind==='antimatter')   return triggerAntimatter(x, y);
        if (kind==='gravity')      return triggerGravity(x, y);
        if (kind==='neutron')      return triggerNeutron(x, y);
        if (kind==='emp')          return triggerEMP(x, y);
        if (kind==='photon')       return triggerPhoton(x, y);
        if (kind==='decoy') {
            for (var dp=0; dp<14; dp++) {
                debrisParts.push({ x:x,y:y, vx:rng(-2,2),vy:rng(-3,1),
                    rot:0,spin:0,size:rng(1,2),shade:99,
                    life:0,maxLife:rng(400,700) });
            }
            return;
        }
        if (kind==='bunker') return triggerBunker(x, y);
        /* per-kind blast scaling */
        var blastR = 90;
        var flashIntensity = 1;
        if (kind==='tactical')    blastR = 55;
        else if (kind==='railgun')blastR = 70;
        else if (kind==='icbm')   blastR = 160;
        else if (kind==='drone')  blastR = 75;
        else if (kind==='stealth')blastR = 100;
        screenFlash = flashIntensity;
        eqShakeX = (Math.random()-0.5) * 14;
        eqShakeY = (Math.random()-0.5) * 10;
        /* main fireball */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*1.4, life:0, maxLife:700, kind:'fire' });
        /* shock ring (faster, expanding outline) */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*2.6, life:0, maxLife:550, kind:'shock' });
        /* secondary flash */
        explosions.push({ x:x, y:y, r:0, maxR:blastR*0.55, life:0, maxLife:260, kind:'flash' });
        /* debris fragments */
        for(var i=0;i<48;i++) {
            var ang=Math.random()*Math.PI*2;
            var spd=rng(2.5, 8.5);
            debrisParts.push({
                x:x, y:y,
                vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd - rng(2, 6),
                rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                size:rng(2,7),
                shade:rngI(0,4),
                life:0, maxLife:rng(900,2200)
            });
        }
        /* embers / sparks */
        for(var k=0;k<60;k++) {
            var a2=Math.random()*Math.PI*2;
            debrisParts.push({
                x:x, y:y,
                vx:Math.cos(a2)*rng(3,12), vy:Math.sin(a2)*rng(3,9)-rng(1,4),
                rot:0, spin:0, size:rng(0.8,1.8),
                shade:99, /* ember marker */
                life:0, maxLife:rng(500,1300)
            });
        }
        /* ── HIT DETECTION ───────────────────────────────────────────────── */
        var hitVehicleIdxs = [];
        for(var vh=0;vh<vehicles.length;vh++) {
            var vv=vehicles[vh];
            var laneOffH = (vv.dir===1) ? (H-GROUND)*0.06 : -(H-GROUND)*0.06;
            var vyH=GROUND + (H-GROUND)*0.10 + laneOffH;
            var dxH=vv.x-x, dyH=vyH-y;
            if(dxH*dxH+dyH*dyH < blastR*blastR) hitVehicleIdxs.push(vh);
        }
        var hitPedIdxs = [];
        for(var ph=0;ph<peds.length;ph++) {
            var pp=peds[ph];
            var pyH=GROUND+(H-GROUND)*0.58;
            var dxp=pp.x-x, dyp=pyH-y;
            if(dxp*dxp+dyp*dyp < blastR*blastR) hitPedIdxs.push(ph);
        }
        var hitBuilding = isBuildingAt(x, y);
        var hitSomething = hitBuilding || hitVehicleIdxs.length>0 || hitPedIdxs.length>0;

        /* short-lived smoke plumes — ONLY when something was actually destroyed.
           Empty-air hits get blast animation only, no smoke aftermath. */
        if(hitSomething) {
            for(var sp=0;sp<5;sp++) {
                smokePlumes.push({
                    x:x+rng(-20,20), y:y+rng(-10,10),
                    r:rng(20,40), vy:rng(0.4,1.2),
                    life:0, maxLife:rng(4000,7000),
                    op:rng(0.45,0.75)
                });
            }
        }

        /* ── EARLY EXIT: nothing to destroy → blast animation only ───────── */
        if(!hitSomething) return;

        /* ── PERSISTENT WRECKAGE ─────────────────────────────────────────── */
        /* broken building: only if we actually hit a building */
        if(hitBuilding && y < GROUND-10) {
            var bbW = blastR*1.6;
            var bbLeft  = x - bbW/2;
            var bbRight = x + bbW/2;
            var breakY  = y;                   /* shear line = impact y */
            /* jagged horizontal edge along the break */
            var edgePts = [];
            var edgeN = 16;
            for(var jj=0;jj<=edgeN;jj++) {
                var fx2 = bbLeft + (jj/edgeN)*bbW;
                /* edge dips up (toward sky) in the middle, more jagged near center */
                var jitter = rng(-12, 8) - (1 - Math.abs((jj/edgeN)-0.5)*2)*8;
                edgePts.push({x:fx2, y: breakY + jitter});
            }
            wreckage.push({
                kind:'brokenBuilding',
                x:x,
                leftX: bbLeft,
                rightX: bbRight,
                breakY: breakY,
                edge: edgePts,
                rebar: (function(){
                    var rb=[];
                    for(var ri=0;ri<7;ri++) {
                        var rx2 = x + rng(-bbW*0.45, bbW*0.45);
                        rb.push({x:rx2, y0:breakY+rng(-4,6), y1:breakY-rng(14,38), bend:rng(-7,7)});
                    }
                    return rb;
                })(),
                /* small flames + smoke positions along the break edge */
                fires: (function(){
                    var fs=[];
                    for(var fi=0;fi<3;fi++) {
                        var pf = edgePts[Math.floor((fi+1)*edgePts.length/4)];
                        if(pf) fs.push({x: pf.x, y: pf.y, scale: rng(0.55, 0.95), phase: rng(0,1000)});
                    }
                    return fs;
                })(),
                smokeT: 0
            });
        }
        /* rubble piles — only on ground-level hits or building hits */
        var groundLevelHit = (y > GROUND - 30);
        var rubCount = (hitBuilding || hitVehicleIdxs.length>0 || groundLevelHit) ? rngI(3, 6) : 0;
        for(var rp=0;rp<rubCount;rp++) {
            var rrx = x + rng(-blastR*0.9, blastR*0.9);
            var rry = GROUND;
            var rrw = rng(30, 60);
            var rrh = rng(10, 22);
            var chunks=[];
            for(var ch=0;ch<rngI(5,9);ch++) {
                chunks.push({
                    dx: rng(-rrw/2, rrw/2),
                    dy: -rng(0, rrh),
                    w: rng(4, 12),
                    h: rng(3, 9),
                    rot: rng(-0.4, 0.4),
                    shade: rngI(0,4)
                });
            }
            wreckage.push({ kind:'rubble', x:rrx, y:rry, w:rrw, h:rrh, chunks:chunks });
        }
        /* twisted lamp post — only on ground-level hits */
        if(groundLevelHit && Math.random() < 0.65) {
            wreckage.push({
                kind:'twistedLamp',
                x: x + rng(-blastR*0.7, blastR*0.7),
                y: GROUND,
                bend: rng(-0.9, 0.9),
                broken: Math.random()<0.5
            });
        }
        /* destroy entities in blast radius → leave PERSISTENT WRECKS */
        for(var vi=vehicles.length-1;vi>=0;vi--) {
            var v=vehicles[vi];
            var laneOff = (v.dir===1) ? (H-GROUND)*0.06 : -(H-GROUND)*0.06;
            var vy_=GROUND + (H-GROUND)*0.10 + laneOff;
            var dx=v.x-x, dy=vy_-y;
            if(dx*dx+dy*dy < blastR*blastR) {
                /* spawn a wrecked-car hulk that stays forever */
                wreckage.push({
                    kind:'carWreck',
                    x: v.x, y: vy_,
                    type: v.type, dir: v.dir, col: v.col,
                    tilt: rng(-0.30, 0.30),
                    sinkY: rng(2, 6),
                    cracks: (function(){
                        var cr=[];
                        for(var ci=0;ci<rngI(4,8);ci++) {
                            cr.push({a: rng(0, Math.PI*2), len: rng(4, 12)});
                        }
                        return cr;
                    })(),
                    burning: true,
                    fireT: rng(0, 100)
                });
                /* immediate fragments */
                for(var dk=0;dk<8;dk++) {
                    var aD=Math.random()*Math.PI*2;
                    debrisParts.push({
                        x:v.x, y:vy_,
                        vx:Math.cos(aD)*rng(2,7), vy:Math.sin(aD)*rng(2,6)-rng(2,5),
                        rot:rng(0,Math.PI*2), spin:rng(-0.5,0.5),
                        size:rng(4,10), shade:rngI(0,4),
                        life:0, maxLife:rng(1200,2400)
                    });
                }
                /* respawn the live vehicle elsewhere so traffic continues */
                v.x = v.dir===1 ? -200 : W+200;
            }
        }
        for(var pi=peds.length-1;pi>=0;pi--) {
            var p=peds[pi];
            var pdy=GROUND+(H-GROUND)*0.58;
            var ddx=p.x-x, ddy=pdy-y;
            if(ddx*ddx+ddy*ddy < blastR*blastR) {
                for(var dq=0;dq<3;dq++) {
                    debrisParts.push({
                        x:p.x, y:pdy,
                        vx:rng(-5,5), vy:rng(-6,-2),
                        rot:rng(0,Math.PI*2), spin:rng(-0.3,0.3),
                        size:rng(1.5,3), shade:99,
                        life:0, maxLife:rng(700,1400)
                    });
                }
                p.x = p.dir===1 ? -30 : W+30;
            }
        }
    }

    function drawWreck(c, w) {
        if(w.kind==='carWreck') {
            var s = Math.max(5, (H-GROUND)*0.12);
            var by = w.y + (w.sinkY||0);
            c.save();
            c.translate(w.x, by);
            c.rotate(w.tilt||0);
            /* charred hulk silhouette — flatter and crumpled */
            var carW = (w.type==='bus') ? s*1.90 : (w.type==='truck') ? s*1.50 : s*0.96;
            var carH = (w.type==='bus') ? s*0.95 : (w.type==='truck') ? s*0.85 : s*0.42;
            /* main body — dark scorched */
            c.fillStyle='#1a1410';
            c.beginPath();
            c.moveTo(-carW, 0);
            c.lineTo(carW, 0);
            c.lineTo(carW*0.95, -carH*0.55);
            c.lineTo(carW*0.40, -carH*0.85);
            c.lineTo(-carW*0.35, -carH*0.95); /* crumpled roof */
            c.lineTo(-carW*0.90, -carH*0.50);
            c.closePath(); c.fill();
            /* original color peeking through (rust patches) */
            if(w.col) {
                c.fillStyle = w.col;
                c.globalAlpha = 0.32;
                c.fillRect(-carW*0.3, -carH*0.5, carW*0.5, carH*0.3);
                c.globalAlpha = 1;
            }
            /* dark outline */
            c.strokeStyle='#0a0805'; c.lineWidth=1.2;
            c.beginPath();
            c.moveTo(-carW, 0);
            c.lineTo(carW, 0);
            c.lineTo(carW*0.95, -carH*0.55);
            c.lineTo(carW*0.40, -carH*0.85);
            c.lineTo(-carW*0.35, -carH*0.95);
            c.lineTo(-carW*0.90, -carH*0.50);
            c.closePath(); c.stroke();
            /* shattered window — jagged dark patch */
            c.fillStyle='#000';
            c.beginPath();
            c.moveTo(-carW*0.1, -carH*0.55);
            c.lineTo( carW*0.3, -carH*0.70);
            c.lineTo( carW*0.25,-carH*0.45);
            c.lineTo(-carW*0.05,-carH*0.40);
            c.closePath(); c.fill();
            /* glass crack lines */
            c.strokeStyle='rgba(220,230,255,0.45)';
            c.lineWidth=0.6;
            if(w.cracks) {
                for(var cri=0;cri<w.cracks.length;cri++) {
                    var crk=w.cracks[cri];
                    var ccx = carW*0.05, ccy = -carH*0.55;
                    c.beginPath();
                    c.moveTo(ccx, ccy);
                    c.lineTo(ccx + Math.cos(crk.a)*crk.len, ccy + Math.sin(crk.a)*crk.len);
                    c.stroke();
                }
            }
            /* twisted/missing wheels */
            c.fillStyle='#0a0a0a';
            var wr=s*0.28;
            c.beginPath(); c.arc(carW*0.55, wr*0.3, wr*0.85, 0, Math.PI*2); c.fill();
            /* missing rear wheel — just a black gash */
            c.fillStyle='#000';
            c.fillRect(-carW*0.65, -wr*0.2, wr*1.2, wr*0.6);
            c.restore();
            /* engine bay smoke wisp */
            var fT = w.fireT||0;
            var smokeY = by - (Math.sin(fT*0.001)*4 + 18);
            var sg = c.createRadialGradient(w.x, smokeY, 0, w.x, smokeY, 22);
            sg.addColorStop(0,'rgba(45,38,32,0.55)');
            sg.addColorStop(1,'rgba(80,68,60,0)');
            c.fillStyle = sg;
            c.beginPath(); c.arc(w.x, smokeY, 22, 0, Math.PI*2); c.fill();
            /* flickering fire on the hood */
            if(w.burning) {
                drawFireLick(c, w.x + (carW*0.1), by - carH*0.6, 1, fT);
                drawFireLick(c, w.x - (carW*0.2), by - carH*0.4, 0.7, fT*1.3);
            }
        }
        else if(w.kind==='rubble') {
            for(var rk=0;rk<w.chunks.length;rk++) {
                var ch=w.chunks[rk];
                var cols=['#3a3a40','#5a5258','#7a7068','#a8632a'];
                c.save();
                c.translate(w.x + ch.dx, w.y + ch.dy);
                c.rotate(ch.rot);
                c.fillStyle = cols[ch.shade];
                c.beginPath();
                c.moveTo(-ch.w, ch.h*0.5);
                c.lineTo(ch.w, ch.h*0.5);
                c.lineTo(ch.w*0.7, -ch.h*0.5);
                c.lineTo(-ch.w*0.6, -ch.h*0.4);
                c.closePath(); c.fill();
                c.strokeStyle='rgba(0,0,0,0.55)'; c.lineWidth=0.7; c.stroke();
                c.restore();
            }
        }
        else if(w.kind==='twistedLamp') {
            c.save();
            c.translate(w.x, w.y);
            /* base — broken concrete */
            c.fillStyle='#2a2a30';
            c.fillRect(-4, -4, 8, 4);
            /* bent post */
            c.strokeStyle='#22222e'; c.lineWidth=2.5;
            c.beginPath();
            c.moveTo(0, -4);
            c.bezierCurveTo(0, -20, w.bend*16, -34, w.bend*22, -50);
            c.stroke();
            /* broken end */
            if(w.broken) {
                c.strokeStyle='#1a1a1a'; c.lineWidth=1.2;
                c.beginPath();
                c.moveTo(w.bend*22, -50);
                c.lineTo(w.bend*22+rng(-3,3), -52);
                c.lineTo(w.bend*22+rng(-4,4), -48);
                c.stroke();
            } else {
                /* shattered bulb */
                c.fillStyle='rgba(40,40,40,0.85)';
                c.beginPath(); c.arc(w.bend*22, -52, 3, 0, Math.PI*2); c.fill();
                c.strokeStyle='rgba(0,0,0,0.7)'; c.lineWidth=0.7;
                for(var sh=0;sh<3;sh++) {
                    c.beginPath();
                    c.moveTo(w.bend*22, -52);
                    c.lineTo(w.bend*22+rng(-5,5), -52+rng(-5,5));
                    c.stroke();
                }
            }
            c.restore();
        }
        else if(w.kind==='brokenBuilding') {
            /* Mask the column above the impact with the SKY GRADIENT so the
               original building's upper floors visually collapse / disappear. */
            c.save();
            /* clip to a polygon: top of canvas across the column, then down to
               the jagged broken edge — only above the break is replaced with sky. */
            c.beginPath();
            c.moveTo(w.leftX, 0);
            c.lineTo(w.rightX, 0);
            for(var ep=w.edge.length-1;ep>=0;ep--) c.lineTo(w.edge[ep].x, w.edge[ep].y);
            c.closePath();
            c.clip();
            /* paint the full-height sky gradient inside the clip */
            var sg2 = c.createLinearGradient(0, 0, 0, GROUND);
            sg2.addColorStop(0, '#a8d6ff');
            sg2.addColorStop(1, '#e6f3ff');
            c.fillStyle = sg2;
            c.fillRect(w.leftX-2, 0, (w.rightX-w.leftX)+4, w.breakY+50);
            c.restore();

            /* draw the jagged broken-edge "stump" right below the cut line so
               the silhouette of the remaining building gets a charred ragged top */
            c.save();
            c.fillStyle='#1a1410';
            c.beginPath();
            c.moveTo(w.edge[0].x, w.edge[0].y);
            for(var ep2=1;ep2<w.edge.length;ep2++) c.lineTo(w.edge[ep2].x, w.edge[ep2].y);
            /* go down a bit to give the broken edge some thickness on the building */
            for(var ep3=w.edge.length-1;ep3>=0;ep3--) {
                c.lineTo(w.edge[ep3].x, w.edge[ep3].y + 6 + Math.sin(ep3*1.3)*3);
            }
            c.closePath(); c.fill();
            /* burn highlight along the edge */
            c.strokeStyle='rgba(255,90,30,0.55)';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(w.edge[0].x, w.edge[0].y);
            for(var ep4=1;ep4<w.edge.length;ep4++) c.lineTo(w.edge[ep4].x, w.edge[ep4].y);
            c.stroke();
            /* dark outline */
            c.strokeStyle='rgba(0,0,0,0.85)'; c.lineWidth=1.2;
            c.beginPath();
            c.moveTo(w.edge[0].x, w.edge[0].y);
            for(var ep5=1;ep5<w.edge.length;ep5++) c.lineTo(w.edge[ep5].x, w.edge[ep5].y);
            c.stroke();
            /* exposed rebar — twisted thin lines poking up from the break */
            c.strokeStyle='#5a3018'; c.lineWidth=1.1;
            for(var rb=0;rb<w.rebar.length;rb++) {
                var R=w.rebar[rb];
                c.beginPath();
                c.moveTo(R.x, R.y0);
                c.quadraticCurveTo(R.x+R.bend, (R.y0+R.y1)/2, R.x+R.bend*1.4, R.y1);
                c.stroke();
            }
            c.restore();

            /* lingering smoke rising from the break line */
            var tT = w.smokeT||0;
            for(var sm=0;sm<2;sm++) {
                var smkY = w.breakY - 25 - sm*18 - (Math.sin(tT*0.0005+sm)*6);
                var smkR = 32 + sm*10;
                var smG = c.createRadialGradient(w.x+Math.sin(tT*0.0008+sm)*8, smkY, 0,
                                                  w.x+Math.sin(tT*0.0008+sm)*8, smkY, smkR);
                smG.addColorStop(0,'rgba(50,42,38,'+(0.55-sm*0.18)+')');
                smG.addColorStop(1,'rgba(90,80,70,0)');
                c.fillStyle = smG;
                c.beginPath(); c.arc(w.x+Math.sin(tT*0.0008+sm)*8, smkY, smkR, 0, Math.PI*2); c.fill();
            }
            /* flickering flames along the broken top */
            for(var fi3=0;fi3<w.fires.length;fi3++) {
                var f=w.fires[fi3];
                drawFireLick(c, f.x, f.y, f.scale, tT+f.phase);
            }
        }
    }

    function drawFireLick(c, x, y, scale, t) {
        var amp = 6*scale;
        var h = 14*scale;
        var sway = Math.sin((t||0)*0.012 + x*0.05) * 2;
        /* outer red */
        c.fillStyle='rgba(200,40,0,0.85)';
        c.beginPath();
        c.moveTo(x-amp, y);
        c.quadraticCurveTo(x-amp*0.4+sway, y-h*0.6, x+sway, y-h);
        c.quadraticCurveTo(x+amp*0.4+sway, y-h*0.6, x+amp, y);
        c.closePath(); c.fill();
        /* inner orange */
        c.fillStyle='rgba(255,140,30,0.95)';
        c.beginPath();
        c.moveTo(x-amp*0.6, y);
        c.quadraticCurveTo(x-amp*0.2+sway, y-h*0.55, x+sway, y-h*0.85);
        c.quadraticCurveTo(x+amp*0.2+sway, y-h*0.55, x+amp*0.6, y);
        c.closePath(); c.fill();
        /* core yellow */
        c.fillStyle='rgba(255,235,150,0.95)';
        c.beginPath();
        c.moveTo(x-amp*0.25, y);
        c.quadraticCurveTo(x+sway, y-h*0.5, x+sway, y-h*0.65);
        c.quadraticCurveTo(x+sway, y-h*0.5, x+amp*0.25, y);
        c.closePath(); c.fill();
        /* glow */
        var fg = c.createRadialGradient(x, y-h*0.5, 0, x, y-h*0.5, amp*3);
        fg.addColorStop(0,'rgba(255,160,40,0.25)');
        fg.addColorStop(1,'rgba(255,80,20,0)');
        c.fillStyle = fg;
        c.beginPath(); c.arc(x, y-h*0.5, amp*3, 0, Math.PI*2); c.fill();
    }

    /* Wreckage & lingering smoke — drawn BEFORE cars/peds so they pass over it.
       Called from drawDynamic just before the vehicle loop. */
    function drawWreckageLayer(c) {
        for(var wi=0;wi<wreckage.length;wi++) {
            drawWreck(c, wreckage[wi]);
        }
        for(var si=0;si<smokePlumes.length;si++) {
            var s=smokePlumes[si];
            var sf = 1 - s.life/s.maxLife;
            var sg = c.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);
            sg.addColorStop(0,'rgba(40,32,28,'+(s.op*sf*0.85)+')');
            sg.addColorStop(0.55,'rgba(80,68,60,'+(s.op*sf*0.45)+')');
            sg.addColorStop(1,'rgba(120,100,90,0)');
            c.fillStyle = sg;
            c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI*2); c.fill();
        }
    }

    function drawMissileTrail(c, m) {
        var n = m.trail.length; if(n<2) return;
        var trailLife = (m.kind==='hypersonic')?1400 : (m.kind==='plasma')?700 : 900;
        if(m.kind==='hypersonic') {
            /* triple-band white-hot vapor streak */
            for(var band=0; band<3; band++) {
                c.beginPath();
                for(var i=0;i<n;i++) {
                    var tp=m.trail[i];
                    var jx=tp.jitter*(0.6+band*0.6), jy=tp.jitter*(0.6+band*0.6);
                    if(i===0) c.moveTo(tp.x+jx, tp.y+jy);
                    else c.lineTo(tp.x+jx, tp.y+jy);
                }
                var alpha = [0.85,0.55,0.30][band];
                var col = band===0 ? 'rgba(255,255,255,' : (band===1? 'rgba(255,210,140,' : 'rgba(255,120,40,');
                c.strokeStyle = col+alpha+')';
                c.lineWidth = (band===0?2.4 : band===1?5 : 9);
                c.lineCap='round';
                c.stroke();
            }
            return;
        }
        if(m.kind==='plasma') {
            /* lightning-streak trail */
            for(var ti=0;ti<n-1;ti++) {
                var t1=m.trail[ti], t2=m.trail[ti+1];
                var a = 1 - (t1.age/trailLife);
                c.strokeStyle = 'hsla('+((ti*10)%360)+',95%,75%,'+(a*0.85)+')';
                c.lineWidth = 2.5*a;
                c.shadowColor = 'rgba(140,80,255,0.9)'; c.shadowBlur=10;
                c.beginPath(); c.moveTo(t1.x,t1.y); c.lineTo(t2.x+rng(-2,2),t2.y+rng(-2,2)); c.stroke();
            }
            c.shadowBlur=0;
            return;
        }
        if(m.kind==='cruise') {
            /* thin twin contrail */
            for(var ti2=0;ti2<n-1;ti2++) {
                var p1=m.trail[ti2], p2=m.trail[ti2+1];
                var aa = 1 - (p1.age/trailLife);
                /* twin lanes */
                for(var lane=-1;lane<=1;lane+=2) {
                    var nx = -Math.sin(m.angle)*lane*2, ny=Math.cos(m.angle)*lane*2;
                    c.strokeStyle = 'rgba(120,180,255,'+(aa*0.55)+')';
                    c.lineWidth = 1.8;
                    c.beginPath(); c.moveTo(p1.x+nx,p1.y+ny); c.lineTo(p2.x+nx,p2.y+ny); c.stroke();
                }
            }
            return;
        }
        /* standard / cluster / bomblet — multilayer smoke + fire core */
        for(var t=0;t<n;t++) {
            var pt=m.trail[t], frac=t/n;
            var af=pt.age/trailLife;
            var op=(1-af)*0.7*frac;
            var rad = 4 + af*16;
            var tg = c.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,rad);
            tg.addColorStop(0,'rgba(255,210,90,'+(op*1.2)+')');
            tg.addColorStop(0.4,'rgba(255,90,30,'+op+')');
            tg.addColorStop(1,'rgba(50,40,35,0)');
            c.fillStyle = tg;
            c.beginPath(); c.arc(pt.x, pt.y, rad, 0, Math.PI*2); c.fill();
        }
        /* fire-core stripe */
        c.beginPath();
        for(var ti3=0;ti3<n;ti3++) {
            var p=m.trail[ti3];
            if(ti3===0) c.moveTo(p.x,p.y); else c.lineTo(p.x,p.y);
        }
        c.strokeStyle = 'rgba(255,240,180,0.55)';
        c.lineWidth = 1.4; c.lineCap='round';
        c.stroke();
    }

    function drawStandardBody(c, m) {
        var t = performance.now();
        var pulse = 0.5+0.5*Math.sin(t*0.04);
        /* heat shimmer halo */
        var hg = c.createRadialGradient(0,0,4,0,0,28);
        hg.addColorStop(0,'rgba(255,180,60,0.30)');
        hg.addColorStop(1,'rgba(255,80,20,0)');
        c.fillStyle = hg;
        c.beginPath(); c.arc(0,0,28,0,Math.PI*2); c.fill();
        /* main body (cylindrical, panel lines) */
        var grad = c.createLinearGradient(0,-4,0,4);
        grad.addColorStop(0,'#f4f6fb');
        grad.addColorStop(0.5,'#b8bec8');
        grad.addColorStop(1,'#5e6470');
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(13,0); c.lineTo(6,-4); c.lineTo(-12,-4); c.lineTo(-12,4); c.lineTo(6,4);
        c.closePath(); c.fill();
        c.strokeStyle='#2a2e38'; c.lineWidth=0.7; c.stroke();
        /* panel lines + rivets */
        c.strokeStyle='rgba(40,40,55,0.45)'; c.lineWidth=0.4;
        for(var pl=-9;pl<=2;pl+=3) { c.beginPath(); c.moveTo(pl,-4); c.lineTo(pl,4); c.stroke(); }
        c.fillStyle='rgba(40,40,55,0.55)';
        for(var rv=-10;rv<=4;rv+=2.5) { c.fillRect(rv-0.4,-3.5,0.8,0.8); c.fillRect(rv-0.4,2.7,0.8,0.8); }
        /* warhead nose */
        var ng = c.createLinearGradient(6,0,13,0);
        ng.addColorStop(0,'#c8302a'); ng.addColorStop(1,'#7c1a14');
        c.fillStyle = ng;
        c.beginPath(); c.moveTo(13,0); c.lineTo(6,-4); c.lineTo(6,4); c.closePath(); c.fill();
        c.strokeStyle='#3a0808'; c.lineWidth=0.6; c.stroke();
        /* nose ring */
        c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=0.6;
        c.beginPath(); c.moveTo(8,-4); c.lineTo(8,4); c.stroke();
        /* fins (swept) */
        c.fillStyle='#7c8290';
        c.beginPath(); c.moveTo(-12,-4); c.lineTo(-17,-8); c.lineTo(-12,-4); c.lineTo(-9,-4); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-12,4);  c.lineTo(-17,8);  c.lineTo(-12,4);  c.lineTo(-9,4);  c.closePath(); c.fill();
        c.strokeStyle='#3a3e48'; c.lineWidth=0.5;
        c.beginPath(); c.moveTo(-12,-4); c.lineTo(-17,-8); c.lineTo(-9,-4); c.stroke();
        c.beginPath(); c.moveTo(-12,4);  c.lineTo(-17,8);  c.lineTo(-9,4);  c.stroke();
        /* exhaust — multi-layer flame */
        var flick = 7 + pulse*5;
        var fg = c.createLinearGradient(-12,0,-12-flick*2.2,0);
        fg.addColorStop(0,'rgba(255,255,255,1)');
        fg.addColorStop(0.2,'rgba(180,220,255,0.95)');
        fg.addColorStop(0.5,'rgba(255,200,80,0.85)');
        fg.addColorStop(0.85,'rgba(255,90,30,0.6)');
        fg.addColorStop(1,'rgba(120,30,10,0)');
        c.fillStyle = fg;
        c.beginPath();
        c.moveTo(-12,-3.5); c.lineTo(-12-flick*2.2, 0); c.lineTo(-12,3.5);
        c.closePath(); c.fill();
        /* inner cyan core */
        var ic = c.createLinearGradient(-12,0,-12-flick,0);
        ic.addColorStop(0,'rgba(180,230,255,1)');
        ic.addColorStop(1,'rgba(60,140,255,0)');
        c.fillStyle = ic;
        c.beginPath();
        c.moveTo(-12,-1.5); c.lineTo(-12-flick, 0); c.lineTo(-12,1.5);
        c.closePath(); c.fill();
    }

    function drawClusterBody(c, m) {
        /* fatter, bigger missile */
        c.fillStyle='#48505c';
        c.beginPath();
        c.moveTo(16,0); c.lineTo(8,-6); c.lineTo(-16,-6); c.lineTo(-16,6); c.lineTo(8,6);
        c.closePath(); c.fill();
        c.strokeStyle='#1c2028'; c.lineWidth=0.8; c.stroke();
        /* yellow hazard stripes */
        c.fillStyle='#ffb820';
        for(var s=-12;s<=4;s+=6) {
            c.beginPath();
            c.moveTo(s,-6); c.lineTo(s+3,-6); c.lineTo(s+1,6); c.lineTo(s-2,6);
            c.closePath(); c.fill();
        }
        /* warning text band */
        c.fillStyle='rgba(0,0,0,0.55)';
        c.fillRect(-12, -1, 18, 2);
        /* dome nose */
        c.fillStyle='#883020';
        c.beginPath();
        c.moveTo(16,0); c.lineTo(8,-6); c.lineTo(8,6); c.closePath(); c.fill();
        /* fins */
        c.fillStyle='#3a3e48';
        c.beginPath(); c.moveTo(-16,-6); c.lineTo(-22,-12); c.lineTo(-14,-6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-16, 6); c.lineTo(-22, 12); c.lineTo(-14, 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-16,0);  c.lineTo(-24,0);   c.lineTo(-14,2);  c.closePath(); c.fill();
        /* exhaust */
        var pul = 0.5+0.5*Math.sin(performance.now()*0.03);
        var flick2 = 9+pul*5;
        var fg2 = c.createLinearGradient(-16,0,-16-flick2*2,0);
        fg2.addColorStop(0,'rgba(255,255,200,1)');
        fg2.addColorStop(0.4,'rgba(255,150,40,0.9)');
        fg2.addColorStop(1,'rgba(120,30,10,0)');
        c.fillStyle = fg2;
        c.beginPath();
        c.moveTo(-16,-5); c.lineTo(-16-flick2*2,0); c.lineTo(-16,5);
        c.closePath(); c.fill();
    }

    function drawBombletBody(c, m) {
        c.fillStyle='#3e4450';
        c.beginPath();
        c.moveTo(7,0); c.lineTo(3,-3); c.lineTo(-6,-3); c.lineTo(-6,3); c.lineTo(3,3);
        c.closePath(); c.fill();
        c.strokeStyle='#1a1d24'; c.lineWidth=0.5; c.stroke();
        /* nose */
        c.fillStyle='#b02020';
        c.beginPath(); c.moveTo(7,0); c.lineTo(3,-3); c.lineTo(3,3); c.closePath(); c.fill();
        /* small fins */
        c.fillStyle='#444a54';
        c.beginPath(); c.moveTo(-6,-3); c.lineTo(-9,-5); c.lineTo(-5,-3); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-6,3);  c.lineTo(-9,5);  c.lineTo(-5,3);  c.closePath(); c.fill();
        /* flame */
        var ff = c.createLinearGradient(-6,0,-12,0);
        ff.addColorStop(0,'rgba(255,240,160,1)');
        ff.addColorStop(1,'rgba(180,40,10,0)');
        c.fillStyle = ff;
        c.beginPath();
        c.moveTo(-6,-2); c.lineTo(-12,0); c.lineTo(-6,2);
        c.closePath(); c.fill();
    }

    function drawPlasmaBody(c, m) {
        var t = performance.now();
        /* outer halo */
        var og = c.createRadialGradient(0,0,2,0,0,40);
        og.addColorStop(0,'rgba(220,170,255,0.95)');
        og.addColorStop(0.4,'rgba(140,80,255,0.55)');
        og.addColorStop(1,'rgba(40,0,80,0)');
        c.fillStyle = og;
        c.beginPath(); c.arc(0,0,40,0,Math.PI*2); c.fill();
        /* electric arcs around the body */
        if(m.arcs) {
            for(var ai=0;ai<m.arcs.length;ai++) {
                var A=m.arcs[ai], af=A.life/A.maxLife;
                c.strokeStyle = 'hsla('+A.hue+',100%,80%,'+((1-af))+')';
                c.lineWidth = 2;
                c.shadowColor = 'hsl('+A.hue+',100%,70%)'; c.shadowBlur=14;
                c.beginPath();
                c.moveTo(A.pts[0].dx, A.pts[0].dy);
                for(var pi=1;pi<A.pts.length;pi++) c.lineTo(A.pts[pi].dx, A.pts[pi].dy);
                c.stroke();
                c.shadowBlur=0;
                /* white core */
                c.strokeStyle = 'rgba(255,255,255,'+((1-af)*0.9)+')';
                c.lineWidth = 0.9;
                c.beginPath();
                c.moveTo(A.pts[0].dx, A.pts[0].dy);
                for(var pi2=1;pi2<A.pts.length;pi2++) c.lineTo(A.pts[pi2].dx, A.pts[pi2].dy);
                c.stroke();
            }
        }
        /* orbiting particles */
        if(m.orbits) {
            for(var oi=0;oi<m.orbits.length;oi++) {
                var O=m.orbits[oi];
                var ox=Math.cos(O.ang)*O.rad, oy=Math.sin(O.ang)*O.rad;
                var pg = c.createRadialGradient(ox,oy,0,ox,oy,O.size*3);
                pg.addColorStop(0,'hsla('+O.hue+',100%,80%,1)');
                pg.addColorStop(1,'hsla('+O.hue+',100%,50%,0)');
                c.fillStyle = pg;
                c.beginPath(); c.arc(ox,oy,O.size*3,0,Math.PI*2); c.fill();
            }
        }
        /* core orb */
        var cg = c.createRadialGradient(0,0,0,0,0,8);
        cg.addColorStop(0,'rgba(255,255,255,1)');
        cg.addColorStop(0.5,'rgba(220,180,255,1)');
        cg.addColorStop(1,'rgba(140,80,255,0.85)');
        c.fillStyle = cg;
        c.beginPath(); c.arc(0,0,8+Math.sin(t*0.012)*1.5,0,Math.PI*2); c.fill();
        /* pulsing inner highlight */
        c.fillStyle = 'rgba(255,255,255,'+(0.6+0.4*Math.sin(t*0.025))+')';
        c.beginPath(); c.arc(-2,-2,3,0,Math.PI*2); c.fill();
    }

    function drawCruiseBody(c, m) {
        /* sleek elongated body */
        var grad = c.createLinearGradient(0,-3,0,3);
        grad.addColorStop(0,'#e8ecf2');
        grad.addColorStop(0.5,'#a8aebc');
        grad.addColorStop(1,'#444a58');
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(20,0); c.lineTo(14,-3); c.lineTo(-14,-3); c.lineTo(-14,3); c.lineTo(14,3);
        c.closePath(); c.fill();
        c.strokeStyle='#23262e'; c.lineWidth=0.6; c.stroke();
        /* nose tip */
        c.fillStyle='#202830';
        c.beginPath(); c.moveTo(20,0); c.lineTo(14,-3); c.lineTo(14,3); c.closePath(); c.fill();
        /* canard / wing */
        c.fillStyle='#787e8a';
        c.beginPath();
        c.moveTo(0,-3); c.lineTo(-2,-9); c.lineTo(4,-9); c.lineTo(6,-3); c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(0,3); c.lineTo(-2,9); c.lineTo(4,9); c.lineTo(6,3); c.closePath(); c.fill();
        c.strokeStyle='#23262e'; c.lineWidth=0.5;
        c.beginPath(); c.moveTo(0,-3); c.lineTo(-2,-9); c.lineTo(4,-9); c.lineTo(6,-3); c.stroke();
        c.beginPath(); c.moveTo(0,3); c.lineTo(-2,9); c.lineTo(4,9); c.lineTo(6,3); c.stroke();
        /* tail fin */
        c.fillStyle='#5a606c';
        c.beginPath();
        c.moveTo(-10,-3); c.lineTo(-15,-7); c.lineTo(-10,-3); c.lineTo(-8,-3); c.closePath(); c.fill();
        /* blue plasma exhaust */
        var bg = c.createLinearGradient(-14,0,-14-12,0);
        bg.addColorStop(0,'rgba(220,240,255,1)');
        bg.addColorStop(0.4,'rgba(80,160,255,0.85)');
        bg.addColorStop(1,'rgba(20,30,120,0)');
        c.fillStyle = bg;
        c.beginPath();
        c.moveTo(-14,-2.5); c.lineTo(-14-12,0); c.lineTo(-14,2.5);
        c.closePath(); c.fill();
    }

    function drawHypersonicBody(c, m) {
        var t = performance.now();
        /* glowing red-hot heat halo */
        var hh = c.createRadialGradient(0,0,0,0,0,22);
        hh.addColorStop(0,'rgba(255,180,80,0.95)');
        hh.addColorStop(0.5,'rgba(255,80,30,0.55)');
        hh.addColorStop(1,'rgba(160,0,0,0)');
        c.fillStyle = hh;
        c.beginPath(); c.arc(0,0,22,0,Math.PI*2); c.fill();
        /* sleek dart body — incandescent */
        var bg = c.createLinearGradient(0,-2,0,2);
        bg.addColorStop(0,'#ffe0a0');
        bg.addColorStop(0.5,'#ff7030');
        bg.addColorStop(1,'#a01000');
        c.fillStyle = bg;
        c.beginPath();
        c.moveTo(16,0); c.lineTo(10,-2); c.lineTo(-12,-2); c.lineTo(-12,2); c.lineTo(10,2);
        c.closePath(); c.fill();
        c.strokeStyle='rgba(255,255,180,0.85)'; c.lineWidth=0.7; c.stroke();
        /* tiny canard fins */
        c.fillStyle='#552010';
        c.beginPath(); c.moveTo(-8,-2); c.lineTo(-11,-4); c.lineTo(-6,-2); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-8, 2); c.lineTo(-11, 4); c.lineTo(-6, 2); c.closePath(); c.fill();
        /* white-hot plasma trail behind */
        var pg = c.createLinearGradient(-12,0,-12-22,0);
        pg.addColorStop(0,'rgba(255,255,255,1)');
        pg.addColorStop(0.4,'rgba(255,200,120,0.85)');
        pg.addColorStop(1,'rgba(255,60,20,0)');
        c.fillStyle = pg;
        c.beginPath();
        c.moveTo(-12,-2); c.lineTo(-12-22,0); c.lineTo(-12,2);
        c.closePath(); c.fill();
        /* nose glow */
        c.fillStyle='rgba(255,255,200,'+(0.6+0.4*Math.sin(t*0.05))+')';
        c.beginPath(); c.arc(16,0,3,0,Math.PI*2); c.fill();
    }

    /* ── new heavy body draw functions ─────────────────────────────────── */
    function _coloredBody(c, m, bodyA, bodyB, noseCol, finCol, stripeCol) {
        var grad = c.createLinearGradient(0,-4,0,4);
        grad.addColorStop(0, bodyA);
        grad.addColorStop(1, bodyB);
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(13,0); c.lineTo(6,-4); c.lineTo(-12,-4); c.lineTo(-12,4); c.lineTo(6,4);
        c.closePath(); c.fill();
        c.strokeStyle='rgba(0,0,0,0.45)'; c.lineWidth=0.7; c.stroke();
        /* nose */
        c.fillStyle = noseCol;
        c.beginPath(); c.moveTo(13,0); c.lineTo(6,-4); c.lineTo(6,4); c.closePath(); c.fill();
        /* fins */
        c.fillStyle = finCol;
        c.beginPath(); c.moveTo(-12,-4); c.lineTo(-17,-8); c.lineTo(-9,-4); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-12, 4); c.lineTo(-17, 8); c.lineTo(-9, 4); c.closePath(); c.fill();
        /* optional accent stripe */
        if (stripeCol) {
            c.fillStyle = stripeCol;
            c.fillRect(-9, -0.8, 14, 1.6);
        }
        /* exhaust */
        var fl = 6 + Math.sin(performance.now()*0.04)*3;
        var fg = c.createLinearGradient(-12,0,-12-fl*2,0);
        fg.addColorStop(0,'rgba(255,250,180,1)');
        fg.addColorStop(0.5,'rgba(255,140,40,0.85)');
        fg.addColorStop(1,'rgba(120,30,10,0)');
        c.fillStyle = fg;
        c.beginPath();
        c.moveTo(-12,-3); c.lineTo(-12-fl*2,0); c.lineTo(-12,3);
        c.closePath(); c.fill();
    }

    function drawNuclearBody(c, m) {
        /* heavy black warhead with yellow trefoil */
        _coloredBody(c, m, '#222a36','#0a0d14','#ffd040','#1a1d24','#ffd040');
        /* trefoil symbol on side */
        c.fillStyle = '#000';
        c.beginPath(); c.arc(-3,0,1.8,0,Math.PI*2); c.fill();
        for (var a=0;a<3;a++) {
            var ang = a*(Math.PI*2/3) - Math.PI/2;
            c.beginPath();
            c.arc(-3+Math.cos(ang)*3, Math.sin(ang)*3, 1.4, 0, Math.PI*2);
            c.fill();
        }
    }
    function drawHydrogenBody(c, m) {
        /* larger silver-blue warhead */
        c.save(); c.scale(1.15,1.15);
        _coloredBody(c, m, '#cfd6e2','#5a6a82','#2080ff','#384458','#2080ff');
        c.restore();
        /* "H" label */
        c.fillStyle='#000'; c.font='bold 7px sans-serif'; c.textAlign='center';
        c.fillText('H', -3, 2);
    }
    function drawThermobaricBody(c, m) {
        _coloredBody(c, m, '#ff8030','#a02000','#ffd040','#5a2010','#ffe000');
    }
    function drawBunkerBody(c, m) {
        _coloredBody(c, m, '#6a6e7c','#2a2d36','#404858','#1a1d24',null);
        /* deep ridges */
        c.strokeStyle='rgba(0,0,0,0.55)'; c.lineWidth=0.5;
        for (var i=-9;i<=3;i+=3) {
            c.beginPath(); c.moveTo(i,-4); c.lineTo(i,4); c.stroke();
        }
    }
    function drawStealthBody(c, m) {
        c.globalAlpha = 0.32;
        _coloredBody(c, m, '#2a3340','#0a0d14','#1a1d24','#0a0d14',null);
        c.globalAlpha = 1;
    }
    function drawRailgunBody(c, m) {
        /* slim white-hot dart */
        var bg = c.createLinearGradient(0,-2,0,2);
        bg.addColorStop(0,'#ffffff'); bg.addColorStop(1,'#a0e0ff');
        c.fillStyle = bg;
        c.beginPath();
        c.moveTo(14,0); c.lineTo(8,-2); c.lineTo(-10,-2); c.lineTo(-10,2); c.lineTo(8,2);
        c.closePath(); c.fill();
        /* glow halo */
        var hg = c.createRadialGradient(0,0,2,0,0,20);
        hg.addColorStop(0,'rgba(180,220,255,0.6)');
        hg.addColorStop(1,'rgba(60,140,255,0)');
        c.fillStyle = hg;
        c.beginPath(); c.arc(0,0,20,0,Math.PI*2); c.fill();
    }
    function drawDroneBody(c, m) {
        /* small drone with wings */
        c.fillStyle='#444a58';
        c.fillRect(-8, -2, 16, 4);
        c.fillStyle='#5a606c';
        c.fillRect(-2, -10, 4, 8);   /* top wing */
        c.fillRect(-2,  2, 4, 8);    /* bottom wing */
        c.fillStyle='#1a1d24';
        c.beginPath(); c.arc(7,0,2,0,Math.PI*2); c.fill();
        /* propeller blur */
        c.strokeStyle='rgba(160,170,190,0.65)'; c.lineWidth=1;
        c.beginPath(); c.arc(-8,-6, 4, 0, Math.PI*2); c.stroke();
        c.beginPath(); c.arc(-8, 6, 4, 0, Math.PI*2); c.stroke();
    }
    function drawICBMBody(c, m) {
        /* large white missile with red stripes */
        c.save(); c.scale(1.10,1.10);
        _coloredBody(c, m, '#f4f6fb','#a0a8b8','#c0202a','#5a606c','#c0202a');
        c.restore();
    }
    function drawAntimatterBody(c, m) {
        /* bright blue-white orb with rays */
        var t = performance.now();
        var hg = c.createRadialGradient(0,0,2,0,0,18);
        hg.addColorStop(0,'rgba(255,255,255,1)');
        hg.addColorStop(0.4,'rgba(160,200,255,0.85)');
        hg.addColorStop(1,'rgba(40,80,200,0)');
        c.fillStyle = hg;
        c.beginPath(); c.arc(0,0,18,0,Math.PI*2); c.fill();
        /* radiating rays */
        c.strokeStyle='rgba(220,240,255,0.85)'; c.lineWidth=1;
        for (var r=0;r<8;r++) {
            var ang = r*(Math.PI/4) + t*0.001;
            c.beginPath();
            c.moveTo(Math.cos(ang)*6, Math.sin(ang)*6);
            c.lineTo(Math.cos(ang)*16, Math.sin(ang)*16);
            c.stroke();
        }
    }
    function drawBioBody(c, m) {
        _coloredBody(c, m, '#5ad04a','#1c5a18','#ffd040','#0a3a08','#a8ff80');
        /* biohazard glow */
        var bg = c.createRadialGradient(0,0,1,0,0,12);
        bg.addColorStop(0,'rgba(180,255,140,0.5)');
        bg.addColorStop(1,'rgba(40,120,30,0)');
        c.fillStyle = bg;
        c.beginPath(); c.arc(0,0,12,0,Math.PI*2); c.fill();
    }
    function drawChemicalBody(c, m) {
        _coloredBody(c, m, '#f0d020','#7a6400','#ff8000','#3a3000','#ffe060');
    }
    function drawPhotonBody(c, m) {
        /* pure white beam dart */
        c.fillStyle = '#ffffff';
        c.fillRect(-12, -1, 26, 2);
        var hg = c.createRadialGradient(0,0,0,0,0,16);
        hg.addColorStop(0,'rgba(255,255,255,0.95)');
        hg.addColorStop(1,'rgba(255,240,180,0)');
        c.fillStyle = hg;
        c.beginPath(); c.arc(0,0,16,0,Math.PI*2); c.fill();
    }
    function drawGravityBody(c, m) {
        /* swirling dark orb with distortion ring */
        var t = performance.now();
        c.fillStyle='#000';
        c.beginPath(); c.arc(0,0,9,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(180,120,255,0.55)'; c.lineWidth=1.5;
        c.save(); c.rotate(t*0.002);
        c.beginPath(); c.ellipse(0,0,16,6,0,0,Math.PI*2); c.stroke();
        c.restore();
        c.save(); c.rotate(-t*0.003);
        c.beginPath(); c.ellipse(0,0,18,4,0,0,Math.PI*2); c.stroke();
        c.restore();
    }
    function drawNeutronBody(c, m) {
        _coloredBody(c, m, '#d8e0f0','#5a6a82','#00d090','#384458','#80ffe0');
        /* radiation halo */
        var hg = c.createRadialGradient(0,0,2,0,0,16);
        hg.addColorStop(0,'rgba(120,255,200,0.55)');
        hg.addColorStop(1,'rgba(0,180,120,0)');
        c.fillStyle = hg;
        c.beginPath(); c.arc(0,0,16,0,Math.PI*2); c.fill();
    }

    /* ── DRAW UNIQUE BLASTS ───────────────────────────────────────────── */
    function drawMushroomClouds(c) {
        for (var i=0; i<mushroomClouds.length; i++) {
            var M = mushroomClouds[i];
            var prog = M.life / M.maxLife;
            var alpha = (prog<0.7) ? 1 : 1 - (prog-0.7)/0.3;
            /* stem — muted dark greys */
            var stemW = 30 * M.scale + prog*15;
            var stemH = M.gy - M.stemTop;
            if (stemH > 0) {
                var sg = c.createLinearGradient(M.x, M.gy, M.x, M.stemTop);
                sg.addColorStop(0,   'rgba(55,55,55,'+(0.75*alpha)+')');
                sg.addColorStop(0.4, 'rgba(110,105,100,'+(0.55*alpha)+')');
                sg.addColorStop(1,   'rgba(150,145,140,0)');
                c.fillStyle = sg;
                c.beginPath();
                c.moveTo(M.x - stemW*0.4, M.gy);
                c.bezierCurveTo(M.x - stemW*0.7, M.gy-stemH*0.4, M.x - stemW*0.6, M.stemTop+30, M.x - stemW, M.stemTop+10);
                c.lineTo(M.x + stemW, M.stemTop+10);
                c.bezierCurveTo(M.x + stemW*0.6, M.stemTop+30, M.x + stemW*0.7, M.gy-stemH*0.4, M.x + stemW*0.4, M.gy);
                c.closePath();
                c.fill();
            }
            /* cap — muted monochrome billowing mushroom */
            var capX = M.x, capY = M.stemTop;
            var layers = 5;
            for (var ly=0; ly<layers; ly++) {
                var R = M.capR * (1 - ly*0.18);
                var dy = -R*0.35 + ly*8;
                var cg = c.createRadialGradient(capX, capY+dy, 0, capX, capY+dy, R);
                if (prog < 0.15) {
                    /* bright but desaturated flash — neutral cream → grey */
                    cg.addColorStop(0,   'rgba(245,242,235,'+alpha+')');
                    cg.addColorStop(0.3, 'rgba(190,185,178,'+(0.85*alpha)+')');
                    cg.addColorStop(0.7, 'rgba(110,105,100,'+(0.55*alpha)+')');
                    cg.addColorStop(1,   'rgba(60,58,55,0)');
                } else if (prog < 0.45) {
                    cg.addColorStop(0,   'rgba(190,185,178,'+(0.85*alpha)+')');
                    cg.addColorStop(0.4, 'rgba(130,124,118,'+(0.70*alpha)+')');
                    cg.addColorStop(0.8, 'rgba(75,72,68,'+(0.50*alpha)+')');
                    cg.addColorStop(1,   'rgba(50,48,45,0)');
                } else {
                    cg.addColorStop(0,   'rgba(115,112,108,'+(0.65*alpha)+')');
                    cg.addColorStop(0.5, 'rgba(78,75,72,'+(0.55*alpha)+')');
                    cg.addColorStop(1,   'rgba(50,48,45,0)');
                }
                c.fillStyle = cg;
                c.beginPath();
                c.ellipse(capX, capY+dy, R, R*0.85, 0, 0, Math.PI*2);
                c.fill();
            }
            /* base ring of dust — desaturated */
            if (prog < 0.5) {
                var ringR = M.capR * 1.8 * (prog*2);
                c.strokeStyle = 'rgba(150,145,138,'+((1-prog*2)*0.5)+')';
                c.lineWidth = 6;
                c.beginPath(); c.ellipse(M.x, M.gy, ringR, ringR*0.25, 0, 0, Math.PI*2); c.stroke();
            }
        }
    }
    function drawFireFields(c) {
        for (var i=0; i<fireFields.length; i++) {
            var F = fireFields[i];
            var p = F.life / F.maxLife;
            var alpha = (p<0.85) ? 1 : 1 - (p-0.85)/0.15;
            c.save();
            c.globalAlpha = alpha;
            drawFireLick(c, F.x, F.y, F.scale, F.life + F.phase);
            c.restore();
        }
    }
    function drawGasClouds(c) {
        for (var i=0; i<gasClouds.length; i++) {
            var G = gasClouds[i];
            var p = G.life / G.maxLife;
            var fade = (p<0.7) ? 1 : 1 - (p-0.7)/0.3;
            var gg = c.createRadialGradient(G.x, G.y, 0, G.x, G.y, G.r);
            gg.addColorStop(0, G.core + (G.op*fade*0.85) + ')');
            gg.addColorStop(0.55, G.core + (G.op*fade*0.40) + ')');
            gg.addColorStop(1, G.edge + '0)');
            c.fillStyle = gg;
            c.beginPath(); c.arc(G.x, G.y, G.r, 0, Math.PI*2); c.fill();
        }
    }
    function drawEMPPulses(c) {
        for (var i=0; i<empPulses.length; i++) {
            var E = empPulses[i];
            var p = E.life / E.maxLife;
            /* expanding ring */
            c.strokeStyle = 'rgba(180,120,255,'+((1-p)*0.85)+')';
            c.lineWidth = 4 * (1-p) + 1;
            c.shadowColor = 'rgba(140,80,255,0.95)';
            c.shadowBlur = 14;
            c.beginPath(); c.arc(E.x, E.y, E.r, 0, Math.PI*2); c.stroke();
            c.shadowBlur = 0;
            /* inner brighter ring */
            c.strokeStyle = 'rgba(255,255,255,'+((1-p)*0.7)+')';
            c.lineWidth = 1.2;
            c.beginPath(); c.arc(E.x, E.y, E.r*0.95, 0, Math.PI*2); c.stroke();
            /* lightning arcs */
            for (var ai=0; ai<E.arcs.length; ai++) {
                var A = E.arcs[ai], ap = A.life/A.maxLife;
                c.strokeStyle = 'rgba(220,180,255,'+(1-ap)+')';
                c.lineWidth = 2;
                c.shadowColor = 'rgba(180,120,255,0.95)'; c.shadowBlur = 10;
                c.beginPath();
                c.moveTo(A.pts[0].x, A.pts[0].y);
                for (var pi=1; pi<A.pts.length; pi++) c.lineTo(A.pts[pi].x, A.pts[pi].y);
                c.stroke();
                c.shadowBlur = 0;
                c.strokeStyle = 'rgba(255,255,255,'+((1-ap)*0.9)+')';
                c.lineWidth = 0.9;
                c.beginPath();
                c.moveTo(A.pts[0].x, A.pts[0].y);
                for (var pi2=1; pi2<A.pts.length; pi2++) c.lineTo(A.pts[pi2].x, A.pts[pi2].y);
                c.stroke();
            }
        }
    }
    function drawGravityWells(c) {
        for (var i=0; i<gravityWells.length; i++) {
            var G = gravityWells[i];
            var p = G.life / G.maxLife;
            /* swirling dark vortex with violet rings */
            var R = G.innerR * (1 - p*0.5);
            var t = performance.now();
            /* spiraling rings */
            c.save();
            c.translate(G.x, G.y);
            c.rotate(t*0.003);
            for (var r=0; r<5; r++) {
                c.strokeStyle = 'rgba(180,120,255,'+((1-p)*0.55*(1-r*0.15))+')';
                c.lineWidth = 1.5;
                c.beginPath();
                c.ellipse(0, 0, R*(0.4+r*0.15), R*(0.15+r*0.05), r*0.3, 0, Math.PI*2);
                c.stroke();
            }
            c.restore();
            /* dark core */
            var dg = c.createRadialGradient(G.x, G.y, 0, G.x, G.y, R*0.3);
            dg.addColorStop(0, 'rgba(0,0,0,0.95)');
            dg.addColorStop(1, 'rgba(0,0,0,0)');
            c.fillStyle = dg;
            c.beginPath(); c.arc(G.x, G.y, R*0.3, 0, Math.PI*2); c.fill();
            /* accretion glow */
            var ag = c.createRadialGradient(G.x, G.y, R*0.15, G.x, G.y, R*0.6);
            ag.addColorStop(0, 'rgba(220,180,255,0.65)');
            ag.addColorStop(0.6, 'rgba(140,80,255,0.40)');
            ag.addColorStop(1, 'rgba(60,0,100,0)');
            c.fillStyle = ag;
            c.beginPath(); c.arc(G.x, G.y, R*0.6, 0, Math.PI*2); c.fill();
        }
    }
    function drawNeutronPulses(c) {
        for (var i=0; i<neutronPulses.length; i++) {
            var N = neutronPulses[i];
            var p = N.life / N.maxLife;
            /* expanding bright green ring */
            c.strokeStyle = 'rgba(140,255,180,'+((1-p))+')';
            c.lineWidth = 3*(1-p) + 1;
            c.shadowColor = 'rgba(80,255,160,0.95)'; c.shadowBlur = 16;
            c.beginPath(); c.arc(N.x, N.y, N.r, 0, Math.PI*2); c.stroke();
            c.shadowBlur = 0;
            /* fading glow inside */
            var ng = c.createRadialGradient(N.x, N.y, 0, N.x, N.y, N.r);
            ng.addColorStop(0, 'rgba(160,255,200,'+((1-p)*0.4)+')');
            ng.addColorStop(0.8, 'rgba(60,200,140,'+((1-p)*0.2)+')');
            ng.addColorStop(1, 'rgba(0,120,80,0)');
            c.fillStyle = ng;
            c.beginPath(); c.arc(N.x, N.y, N.r, 0, Math.PI*2); c.fill();
        }
    }
    function drawAntimatterBursts(c) {
        for (var i=0; i<antimatterBursts.length; i++) {
            var A = antimatterBursts[i];
            var p = A.life / A.maxLife;
            /* spherical white-blue burst */
            var bg = c.createRadialGradient(A.x, A.y, 0, A.x, A.y, A.r);
            bg.addColorStop(0, 'rgba(255,255,255,'+((1-p))+')');
            bg.addColorStop(0.3, 'rgba(220,230,255,'+((1-p)*0.85)+')');
            bg.addColorStop(0.7, 'rgba(140,180,255,'+((1-p)*0.45)+')');
            bg.addColorStop(1, 'rgba(20,40,160,0)');
            c.fillStyle = bg;
            c.beginPath(); c.arc(A.x, A.y, A.r, 0, Math.PI*2); c.fill();
            /* radial rays */
            c.save();
            c.translate(A.x, A.y);
            c.rotate(A.rayPhase);
            c.strokeStyle = 'rgba(255,255,255,'+((1-p)*0.7)+')';
            c.lineWidth = 1.5;
            for (var r=0; r<16; r++) {
                var ang = r * (Math.PI/8);
                c.beginPath();
                c.moveTo(Math.cos(ang)*A.r*0.4, Math.sin(ang)*A.r*0.4);
                c.lineTo(Math.cos(ang)*A.r, Math.sin(ang)*A.r);
                c.stroke();
            }
            c.restore();
        }
    }
    function drawPhotonStrikes(c) {
        for (var i=0; i<photonStrikes.length; i++) {
            var P = photonStrikes[i];
            var p = P.life / P.maxLife;
            var alpha = (p<0.3) ? 1 : 1 - (p-0.3)/0.7;
            /* vertical white beam from top of screen to target */
            var bg = c.createLinearGradient(P.x, 0, P.x, P.ty);
            bg.addColorStop(0, 'rgba(255,255,255,0)');
            bg.addColorStop(0.5, 'rgba(255,255,255,'+(alpha*0.6)+')');
            bg.addColorStop(1, 'rgba(255,255,255,'+alpha+')');
            c.fillStyle = bg;
            c.fillRect(P.x - P.width/2, 0, P.width, P.ty);
            /* bright core line */
            c.strokeStyle = 'rgba(255,255,220,'+alpha+')';
            c.lineWidth = 3;
            c.shadowColor = 'rgba(255,255,200,0.95)'; c.shadowBlur = 16;
            c.beginPath(); c.moveTo(P.x, 0); c.lineTo(P.x, P.ty); c.stroke();
            c.shadowBlur = 0;
        }
    }

    function drawAirDefence(c) {
        for (var i=0;i<airDefence.length;i++) {
            var b=airDefence[i];
            /* base platform */
            c.fillStyle='#3a4050';
            c.fillRect(b.x-14, b.y-9, 28, 11);
            c.strokeStyle='#1a1d24'; c.lineWidth=1;
            c.strokeRect(b.x-14, b.y-9, 28, 11);
            /* armoured plating ridges */
            c.strokeStyle='rgba(0,0,0,0.45)'; c.lineWidth=0.6;
            c.beginPath(); c.moveTo(b.x-14,b.y-4); c.lineTo(b.x+14,b.y-4); c.stroke();
            /* launch tube (taller, with stripes) */
            c.fillStyle='#5a606e';
            c.fillRect(b.x-5, b.y-22, 10, 13);
            c.strokeStyle='#222630'; c.lineWidth=0.8;
            c.strokeRect(b.x-5, b.y-22, 10, 13);
            c.fillStyle='#c0202a';
            c.fillRect(b.x-5, b.y-18, 10, 1.5);
            c.fillRect(b.x-5, b.y-13, 10, 1.5);
            /* radar dish + antenna */
            c.strokeStyle='#7a8290'; c.lineWidth=1.4;
            c.beginPath();
            c.arc(b.x+10, b.y-12, 4, Math.PI, 0);
            c.stroke();
            c.beginPath(); c.moveTo(b.x+10,b.y-12); c.lineTo(b.x+10,b.y-9); c.stroke();
            /* warning light + alert blink */
            var alertOn = (b.alertT && b.alertT>0) && (Math.floor(performance.now()/80)%2===0);
            var lightCol = alertOn ? '#ffe040'
                         : (b.cooldown>0) ? '#ff5030'
                         : '#30c050';
            c.fillStyle = lightCol;
            c.beginPath(); c.arc(b.x-10, b.y-4, 1.8, 0, Math.PI*2); c.fill();
            /* alert glow halo when about to fire */
            if (alertOn) {
                var lg = c.createRadialGradient(b.x, b.y-12, 0, b.x, b.y-12, 18);
                lg.addColorStop(0,'rgba(255,224,80,0.55)');
                lg.addColorStop(1,'rgba(255,180,40,0)');
                c.fillStyle = lg;
                c.beginPath(); c.arc(b.x, b.y-12, 18, 0, Math.PI*2); c.fill();
            }
            /* muzzle flash on fire (larger) */
            if (b.flashT > 0) {
                var f = Math.min(1, b.flashT/220);
                var fg = c.createRadialGradient(b.x, b.y-22, 0, b.x, b.y-22, 36);
                fg.addColorStop(0,'rgba(255,250,200,'+f+')');
                fg.addColorStop(0.4,'rgba(255,160,60,'+(f*0.85)+')');
                fg.addColorStop(1,'rgba(255,40,0,0)');
                c.fillStyle = fg;
                c.beginPath(); c.arc(b.x, b.y-22, 36, 0, Math.PI*2); c.fill();
            }
        }
    }

    function drawInterceptors(c) {
        for (var i=0;i<interceptors.length;i++) {
            var ic=interceptors[i];
            var enh = ic.enhanced;
            /* trail */
            for (var ti=0;ti<ic.trail.length;ti++) {
                var tp=ic.trail[ti];
                var af=tp.age/500;
                var op=(1-af)*(enh?1.0:0.7)*(ti/ic.trail.length);
                var rad=(enh?4:2)+af*(enh?14:8);
                var trailCol = ic.kind==='emp'   ? 'rgba(200,140,255,'
                              : ic.kind==='patriot' ? 'rgba(180,220,255,'
                              : ic.kind==='multi' ? 'rgba(255,220,80,'
                              : 'rgba(255,220,140,';
                var tg = c.createRadialGradient(tp.x,tp.y,0,tp.x,tp.y,rad);
                tg.addColorStop(0, trailCol+(op*1.3)+')');
                tg.addColorStop(1, trailCol+'0)');
                c.fillStyle = tg;
                c.beginPath(); c.arc(tp.x, tp.y, rad, 0, Math.PI*2); c.fill();
            }
            /* enhanced — bright body halo */
            if (enh) {
                var hg = c.createRadialGradient(ic.x, ic.y, 0, ic.x, ic.y, 22);
                var haloCol = ic.kind==='emp'   ? 'rgba(220,160,255,'
                            : ic.kind==='patriot' ? 'rgba(140,200,255,'
                            : ic.kind==='multi' ? 'rgba(255,220,100,'
                            : 'rgba(255,200,120,';
                hg.addColorStop(0, haloCol+'0.65)');
                hg.addColorStop(1, haloCol+'0)');
                c.fillStyle = hg;
                c.beginPath(); c.arc(ic.x, ic.y, 22, 0, Math.PI*2); c.fill();
            }
            /* body */
            c.save();
            c.translate(ic.x, ic.y);
            c.rotate(ic.angle);
            if (ic.kind==='emp') {
                /* glowing energy orb */
                var og = c.createRadialGradient(0,0,0,0,0,16);
                og.addColorStop(0,'rgba(255,255,255,1)');
                og.addColorStop(0.4,'rgba(220,180,255,0.9)');
                og.addColorStop(1,'rgba(120,40,200,0)');
                c.fillStyle = og;
                c.beginPath(); c.arc(0,0,16,0,Math.PI*2); c.fill();
                /* lightning arcs */
                if (ic.arcs) {
                    for (var ai=0;ai<ic.arcs.length;ai++) {
                        var A=ic.arcs[ai], af2=A.life/A.maxLife;
                        c.strokeStyle = 'rgba(220,180,255,'+(1-af2)+')';
                        c.lineWidth = 1.4;
                        c.beginPath();
                        c.moveTo(A.pts[0].dx, A.pts[0].dy);
                        for (var pi=1;pi<A.pts.length;pi++) c.lineTo(A.pts[pi].dx, A.pts[pi].dy);
                        c.stroke();
                    }
                }
            } else {
                /* small white SAM body */
                c.fillStyle = '#e8ecf2';
                c.beginPath();
                c.moveTo(8,0); c.lineTo(3,-2); c.lineTo(-7,-2); c.lineTo(-7,2); c.lineTo(3,2);
                c.closePath(); c.fill();
                c.strokeStyle='#404858'; c.lineWidth=0.6; c.stroke();
                /* nose */
                c.fillStyle = ic.kind==='multi'   ? '#ffd040'
                            : ic.kind==='patriot' ? '#3060e0'
                            : '#c0202a';
                c.beginPath(); c.moveTo(8,0); c.lineTo(3,-2); c.lineTo(3,2); c.closePath(); c.fill();
                /* fins */
                c.fillStyle='#5a606c';
                c.beginPath(); c.moveTo(-7,-2); c.lineTo(-10,-4); c.lineTo(-5,-2); c.closePath(); c.fill();
                c.beginPath(); c.moveTo(-7,2);  c.lineTo(-10,4);  c.lineTo(-5,2);  c.closePath(); c.fill();
                /* exhaust */
                var fl = 5 + Math.sin(ic.spinT*0.04)*2;
                var fg2 = c.createLinearGradient(-7,0,-7-fl*1.8,0);
                fg2.addColorStop(0,'rgba(255,240,180,1)');
                fg2.addColorStop(0.5,'rgba(255,140,40,0.7)');
                fg2.addColorStop(1,'rgba(120,30,10,0)');
                c.fillStyle = fg2;
                c.beginPath();
                c.moveTo(-7,-1.5); c.lineTo(-7-fl*1.8,0); c.lineTo(-7,1.5);
                c.closePath(); c.fill();
            }
            c.restore();
        }
    }

    function drawLaserBeams(c) {
        for (var i=0;i<laserBeams.length;i++) {
            var b=laserBeams[i];
            var p=b.life/b.maxLife;
            var op=1-p;
            if (b.enhanced) {
                /* ultra-thick double-glow beam for user-triggered laser */
                c.strokeStyle='rgba(255,80,40,'+(op*0.45)+')';
                c.lineWidth=18;
                c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
                c.strokeStyle='rgba(255,200,120,'+(op*0.75)+')';
                c.lineWidth=10;
                c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
                c.strokeStyle='rgba(255,255,255,'+op+')';
                c.lineWidth=3.5;
                c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
                /* glow ball at impact end */
                var ig = c.createRadialGradient(b.x2, b.y2, 0, b.x2, b.y2, 24);
                ig.addColorStop(0,'rgba(255,255,255,'+op+')');
                ig.addColorStop(1,'rgba(255,80,40,0)');
                c.fillStyle = ig;
                c.beginPath(); c.arc(b.x2,b.y2,24,0,Math.PI*2); c.fill();
                continue;
            }
            /* outer glow */
            c.strokeStyle='rgba(255,120,80,'+(op*0.55)+')';
            c.lineWidth=8;
            c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
            /* core */
            c.strokeStyle='rgba(255,255,255,'+op+')';
            c.lineWidth=2;
            c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
        }
    }

    function drawTargetLocks(c) {
        for (var i=0; i<targetLocks.length; i++) {
            var T = targetLocks[i];
            var p = T.life / T.maxLife;
            var fade = (p < 0.7) ? 1 : 1 - (p-0.7)/0.3;
            /* contracting ring */
            var r = 28 - p * 14;
            /* pulsing brackets */
            var brP = 0.5 + 0.5*Math.sin(T.life*0.025);
            c.strokeStyle = 'rgba(255,60,60,'+(fade*0.95)+')';
            c.lineWidth = 2.2;
            /* outer pulsing ring */
            c.beginPath(); c.arc(T.x, T.y, r, 0, Math.PI*2); c.stroke();
            /* 4 corner brackets */
            var br = r + 4 + brP*3;
            var arms = 6;
            c.lineWidth = 2.6;
            [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(dir){
                c.beginPath();
                c.moveTo(T.x + dir[0]*br, T.y + dir[1]*(br-arms));
                c.lineTo(T.x + dir[0]*br, T.y + dir[1]*br);
                c.lineTo(T.x + dir[0]*(br-arms), T.y + dir[1]*br);
                c.stroke();
            });
            /* center dot */
            c.fillStyle = 'rgba(255,255,255,'+(fade*0.95)+')';
            c.beginPath(); c.arc(T.x, T.y, 1.5, 0, Math.PI*2); c.fill();
            /* radial sweeps */
            c.strokeStyle = 'rgba(255,80,80,'+(fade*0.55)+')';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(T.x - r - 8, T.y); c.lineTo(T.x - r - 2, T.y); c.stroke();
            c.beginPath();
            c.moveTo(T.x + r + 2, T.y); c.lineTo(T.x + r + 8, T.y); c.stroke();
            c.beginPath();
            c.moveTo(T.x, T.y - r - 8); c.lineTo(T.x, T.y - r - 2); c.stroke();
            c.beginPath();
            c.moveTo(T.x, T.y + r + 2); c.lineTo(T.x, T.y + r + 8); c.stroke();
        }
    }

    function drawMissileSystem(c) {
        /* (batteries are drawn early in drawDynamic so cars pass over them) */
        /* missiles — fully per-kind rendering */
        for(var mi=0;mi<missiles.length;mi++) {
            var m=missiles[mi];

            /* ── shared: trail (per kind) ───────────────────────────────── */
            drawMissileTrail(c, m);

            /* ── sonic boom rings ───────────────────────────────────────── */
            if(m.boomRings && m.boomRings.length) {
                for(var br=0;br<m.boomRings.length;br++) {
                    var R=m.boomRings[br];
                    var bp = R.life/R.maxLife;
                    c.strokeStyle = (m.kind==='hypersonic')
                        ? 'rgba(255,200,120,'+((1-bp)*0.55)+')'
                        : 'rgba(220,235,255,'+((1-bp)*0.45)+')';
                    c.lineWidth = 2*(1-bp);
                    c.beginPath(); c.arc(R.x, R.y, R.r, 0, Math.PI*2); c.stroke();
                }
            }

            /* ── shock cones (hypersonic) ───────────────────────────────── */
            if(m.shockCones) {
                for(var sci=0;sci<m.shockCones.length;sci++) {
                    var SC=m.shockCones[sci];
                    var sp=SC.life/SC.maxLife;
                    c.save();
                    c.translate(SC.x, SC.y);
                    c.rotate(SC.angle);
                    c.strokeStyle = 'rgba(255,240,200,'+((1-sp)*0.50)+')';
                    c.lineWidth = 1.8*(1-sp);
                    var coneLen = 50+sp*80;
                    var coneSpread = 22+sp*30;
                    c.beginPath();
                    c.moveTo(0,0); c.lineTo(-coneLen, -coneSpread); c.stroke();
                    c.beginPath();
                    c.moveTo(0,0); c.lineTo(-coneLen,  coneSpread); c.stroke();
                    c.restore();
                }
            }

            /* ── exhaust sparks ─────────────────────────────────────────── */
            if(m.sparks) {
                for(var sk=0;sk<m.sparks.length;sk++) {
                    var SP=m.sparks[sk], spf=SP.life/SP.maxLife;
                    var sg = c.createRadialGradient(SP.x,SP.y,0,SP.x,SP.y,SP.size*4);
                    sg.addColorStop(0,'hsla('+SP.hue+',95%,75%,'+((1-spf)*1.0)+')');
                    sg.addColorStop(1,'hsla('+SP.hue+',95%,50%,0)');
                    c.fillStyle = sg;
                    c.beginPath(); c.arc(SP.x,SP.y,SP.size*4,0,Math.PI*2); c.fill();
                }
            }

            /* ── body per kind ──────────────────────────────────────────── */
            c.save();
            c.translate(m.x, m.y);
            c.rotate(m.angle);
            if(m.kind==='plasma')          drawPlasmaBody(c, m);
            else if(m.kind==='cruise')     drawCruiseBody(c, m);
            else if(m.kind==='hypersonic') drawHypersonicBody(c, m);
            else if(m.kind==='cluster')    drawClusterBody(c, m);
            else if(m.kind==='_bomblet')   drawBombletBody(c, m);
            else if(m.kind==='_swarmer')   drawBombletBody(c, m);
            else if(m.kind==='nuclear')    drawNuclearBody(c, m);
            else if(m.kind==='hydrogen')   drawHydrogenBody(c, m);
            else if(m.kind==='thermobaric')drawThermobaricBody(c, m);
            else if(m.kind==='bunker')     drawBunkerBody(c, m);
            else if(m.kind==='mirv')       drawClusterBody(c, m);
            else if(m.kind==='stealth')    drawStealthBody(c, m);
            else if(m.kind==='railgun')    drawRailgunBody(c, m);
            else if(m.kind==='drone')      drawDroneBody(c, m);
            else if(m.kind==='icbm')       drawICBMBody(c, m);
            else if(m.kind==='tactical')   drawStandardBody(c, m);
            else if(m.kind==='antimatter') drawAntimatterBody(c, m);
            else if(m.kind==='decoy')      drawStandardBody(c, m);
            else if(m.kind==='photon')     drawPhotonBody(c, m);
            else if(m.kind==='gravity')    drawGravityBody(c, m);
            else if(m.kind==='neutron')    drawNeutronBody(c, m);
            else if(m.kind==='emp')        drawPlasmaBody(c, m);
            else                           drawStandardBody(c, m);
            c.restore();
        }
        /* explosions */
        for(var ei=0;ei<explosions.length;ei++) {
            var ex=explosions[ei];
            var prog=ex.life/ex.maxLife;
            if(ex.kind==='fire') {
                var eg = c.createRadialGradient(ex.x,ex.y,0,ex.x,ex.y,ex.r);
                eg.addColorStop(0,'rgba(255,255,230,'+(1-prog)+')');
                eg.addColorStop(0.25,'rgba(255,220,80,'+(0.95-prog*0.95)+')');
                eg.addColorStop(0.55,'rgba(255,90,20,'+(0.80-prog*0.80)+')');
                eg.addColorStop(0.85,'rgba(120,30,5,'+(0.50-prog*0.50)+')');
                eg.addColorStop(1,'rgba(40,10,0,0)');
                c.fillStyle = eg;
                c.beginPath(); c.arc(ex.x, ex.y, ex.r, 0, Math.PI*2); c.fill();
                /* dark smoke ball */
                if(prog>0.3) {
                    var dg = c.createRadialGradient(ex.x,ex.y-ex.r*0.2,0,ex.x,ex.y-ex.r*0.2,ex.r*0.85);
                    dg.addColorStop(0,'rgba(40,30,25,'+(prog-0.3)*0.7+')');
                    dg.addColorStop(1,'rgba(40,30,25,0)');
                    c.fillStyle = dg;
                    c.beginPath(); c.arc(ex.x, ex.y-ex.r*0.2, ex.r*0.85, 0, Math.PI*2); c.fill();
                }
            } else if(ex.kind==='shock') {
                c.strokeStyle = 'rgba(255,250,220,'+(1-prog)+')';
                c.lineWidth = 3*(1-prog);
                c.beginPath(); c.arc(ex.x, ex.y, ex.r, 0, Math.PI*2); c.stroke();
                c.strokeStyle = 'rgba(255,180,80,'+((1-prog)*0.6)+')';
                c.lineWidth = 8*(1-prog);
                c.beginPath(); c.arc(ex.x, ex.y, ex.r*0.92, 0, Math.PI*2); c.stroke();
            } else if(ex.kind==='flash') {
                var fgFlash = c.createRadialGradient(ex.x,ex.y,0,ex.x,ex.y,ex.r*3);
                fgFlash.addColorStop(0,'rgba(255,255,255,'+(1-prog)+')');
                fgFlash.addColorStop(0.4,'rgba(255,240,180,'+((1-prog)*0.5)+')');
                fgFlash.addColorStop(1,'rgba(255,200,80,0)');
                c.fillStyle = fgFlash;
                c.beginPath(); c.arc(ex.x, ex.y, ex.r*3, 0, Math.PI*2); c.fill();
            }
        }
        /* debris & embers */
        for(var di=0;di<debrisParts.length;di++) {
            var p=debrisParts[di];
            var prog2=p.life/p.maxLife;
            if(p.shade===99) {
                /* ember */
                var emg=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*3);
                emg.addColorStop(0,'rgba(255,240,150,'+(1-prog2)+')');
                emg.addColorStop(0.4,'rgba(255,120,30,'+(1-prog2)*0.7+')');
                emg.addColorStop(1,'rgba(200,40,0,0)');
                c.fillStyle = emg;
                c.beginPath(); c.arc(p.x,p.y,p.size*3,0,Math.PI*2); c.fill();
            } else {
                /* concrete / metal fragment */
                var cols=['#3a3a40','#5a5258','#8a847a','#a8632a'];
                c.save();
                c.translate(p.x, p.y);
                c.rotate(p.rot);
                c.fillStyle = cols[p.shade];
                c.fillRect(-p.size, -p.size*0.5, p.size*2, p.size);
                c.strokeStyle = 'rgba(0,0,0,0.55)';
                c.lineWidth = 0.6;
                c.strokeRect(-p.size, -p.size*0.5, p.size*2, p.size);
                c.restore();
            }
        }
        /* strategy queue markers (when in strategy mode) */
        if (strategyMode && strategyQueue.length) {
            var t = performance.now();
            var pulse = 0.55 + 0.45*Math.sin(t*0.005);
            for (var sq=0; sq<strategyQueue.length; sq++) {
                var Q = strategyQueue[sq];
                /* outer ring */
                c.strokeStyle = 'rgba(120,80,255,'+(0.85*pulse)+')';
                c.lineWidth = 1.5;
                c.beginPath(); c.arc(Q.tx, Q.ty, 12, 0, Math.PI*2); c.stroke();
                /* crosshair */
                c.strokeStyle = 'rgba(220,200,255,0.9)';
                c.lineWidth = 1;
                c.beginPath();
                c.moveTo(Q.tx-10, Q.ty); c.lineTo(Q.tx-3, Q.ty); c.stroke();
                c.beginPath();
                c.moveTo(Q.tx+3, Q.ty); c.lineTo(Q.tx+10, Q.ty); c.stroke();
                c.beginPath();
                c.moveTo(Q.tx, Q.ty-10); c.lineTo(Q.tx, Q.ty-3); c.stroke();
                c.beginPath();
                c.moveTo(Q.tx, Q.ty+3); c.lineTo(Q.tx, Q.ty+10); c.stroke();
                /* center dot */
                c.fillStyle = 'rgba(220,180,255,1)';
                c.beginPath(); c.arc(Q.tx, Q.ty, 2, 0, Math.PI*2); c.fill();
                /* index label */
                c.fillStyle = 'rgba(20,10,40,0.95)';
                c.font = 'bold 9px "Arial Black",sans-serif';
                c.textAlign = 'center';
                c.fillText(String(sq+1), Q.tx, Q.ty-14);
                c.textAlign = 'left';
            }
        }
        /* interceptors on top of missiles */
        drawInterceptors(c);
        drawLaserBeams(c);
        drawTargetLocks(c);
        /* unique blast visuals */
        drawMushroomClouds(c);
        drawFireFields(c);
        drawGasClouds(c);
        drawEMPPulses(c);
        drawGravityWells(c);
        drawNeutronPulses(c);
        drawAntimatterBursts(c);
        drawPhotonStrikes(c);
        /* screen flash overlay (post-explosion white-out) */
        if(screenFlash>0) {
            c.fillStyle = 'rgba(255,250,220,'+(screenFlash*0.55)+')';
            c.fillRect(0,0,W,H);
        }
    }

    /* canvas click handler.
       - Defence mode: click intercepts the nearest in-flight missile (manual intercept game)
       - Attack mode: click fires a missile at that spot
       Stays in mode across multiple clicks; only the widget buttons toggle modes. */
    canvas.addEventListener('click', function(ev){
        if(!defenceMode && !missileArmed && !strategyMode) return;
        var rect = canvas.getBoundingClientRect();
        var sx = (ev.clientX - rect.left) * (canvas.width / rect.width);
        var sy = (ev.clientY - rect.top)  * (canvas.height/ rect.height);
        if (strategyMode) {
            if (strategyQueue.length >= STRATEGY_MAX) return;
            var kind = MISSILE_TYPES[missileTypeIdx];
            strategyQueue.push({ kind:kind, tx:sx, ty:sy });
            return;
        }
        if (defenceMode) {
            interceptByClick(sx, sy);
            return;
        }
        if (missileArmed) {
            fireMissile(sx, sy);
        }
    });

    window.armMissile = function(){
        missileArmed = !missileArmed;
        if (missileArmed) {
            /* attack mode requires auto-defence active; also exit defence mode */
            defenceActive = true;
            if (defenceMode) defenceMode = false;
        }
        canvas.style.cursor = missileArmed ? 'crosshair' : '';
        return missileArmed;
    };
    window.isMissileArmed = function(){ return missileArmed; };
    window.fireMissileAt = fireMissile;

    /* ── missile type API ─────────────────────────────────────────────── */
    window.cycleMissileType = function(dir){
        var n = MISSILE_TYPES.length;
        missileTypeIdx = ((missileTypeIdx + (dir||1)) % n + n) % n;
        return MISSILE_TYPES[missileTypeIdx];
    };
    window.getMissileType = function(){ return MISSILE_TYPES[missileTypeIdx]; };
    window.getMissileTypeName = function(){ return MISSILE_LABELS[MISSILE_TYPES[missileTypeIdx]]; };
    window.getMissileTypeIcon = function(){ return MISSILE_ICONS[MISSILE_TYPES[missileTypeIdx]]; };
    window.getMissileTypeIndex = function(){ return missileTypeIdx; };
    window.setMissileTypeIndex = function(i){
        var n = MISSILE_TYPES.length;
        if(typeof i!=='number') return;
        missileTypeIdx = ((i%n)+n)%n;
    };
    window.getAllMissileTypes = function(){
        return MISSILE_TYPES.map(function(t,i){
            return { index:i, type:t, name: MISSILE_LABELS[t], icon: MISSILE_ICONS[t] };
        });
    };

    /* ── DEFENCE API ───────────────────────────────────────────────────── */
    /* AI fires a random missile at an ACTUAL destructible target
       (a building, vehicle, or pedestrian) so misses always cause damage. */
    function spawnAIMissile() {
        var picks = MISSILE_TYPES.filter(function(t){
            return t!=='swarm' && t!=='saturation' && t!=='cluster'
                && t!=='mirv' && t!=='decoy';
        });
        var kind = picks[Math.floor(Math.random()*picks.length)];

        /* build a list of valid live targets */
        var targets = [];
        /* landmarks (LM) */
        if (typeof LM !== 'undefined' && LM && LM.length) {
            for (var li=0; li<LM.length; li++) {
                var lm = LM[li];
                var lx = (typeof lm.x === 'number') ? lm.x : W*0.5;
                targets.push({ x: lx, y: GROUND - rng(40, GROUND*0.55) });
            }
        }
        /* bg buildings — most common */
        if (typeof BGBUILDS !== 'undefined' && BGBUILDS && BGBUILDS.length) {
            for (var bi=0; bi<BGBUILDS.length; bi++) {
                var b = BGBUILDS[bi];
                if (b.x > -50 && b.x < W+50 && b.h > 30) {
                    targets.push({
                        x: b.x + b.w/2,
                        y: GROUND - b.h*rng(0.30, 0.85)
                    });
                }
            }
        }
        /* moving vehicles */
        for (var vi2=0; vi2<vehicles.length; vi2++) {
            var v = vehicles[vi2];
            if (v.x > 20 && v.x < W-20) {
                targets.push({ x: v.x, y: GROUND + (H-GROUND)*0.10 });
            }
        }
        /* pedestrians */
        for (var pi2=0; pi2<peds.length; pi2++) {
            var p = peds[pi2];
            if (p.x > 20 && p.x < W-20) {
                targets.push({ x: p.x, y: GROUND + (H-GROUND)*0.58 });
            }
        }
        /* fallback */
        var t;
        if (targets.length) {
            t = targets[Math.floor(Math.random()*targets.length)];
        } else {
            t = { x: rng(W*0.1, W*0.9), y: GROUND - rng(20, GROUND*0.4) };
        }
        /* normally fire WITHOUT auto-intercept so the user clicks to defend,
           but when AUTO-DEFENCE is on, leave defenceActive alone so batteries
           engage every AI missile using the rotating interceptor type. */
        if (autoDefenceOn) {
            fireMissile(t.x, t.y, kind);
        } else {
            var savedActive = defenceActive;
            defenceActive = false;
            fireMissile(t.x, t.y, kind);
            defenceActive = savedActive;
        }
    }
    /* User clicked at (sx, sy) in defence mode — launch a CINEMATIC interceptor at
       the nearest in-flight missile (type-specific animation, target-lock, big hit). */
    function interceptByClick(sx, sy) {
        var clickR = 90, clickR2 = clickR*clickR;
        var nearest = null, nearestD = clickR2;
        for (var i=0; i<missiles.length; i++) {
            var m = missiles[i];
            var dx = m.x - sx, dy = m.y - sy;
            var d  = dx*dx + dy*dy;
            if (d < nearestD) { nearestD = d; nearest = m; }
        }
        if (!nearest) return false;
        return launchUserInterceptor(nearest);
    }

    function launchUserInterceptor(m) {
        if (!airDefence || !airDefence.length) return false;
        /* pick closest battery to the missile (not the target) */
        var best = airDefence[0], bestD = Infinity;
        for (var i=0; i<airDefence.length; i++) {
            var d = Math.abs(airDefence[i].x - m.x);
            if (d < bestD) { bestD = d; best = airDefence[i]; }
        }
        var defSel = DEFENCE_TYPES[defenceTypeIdx];
        var iKind  = (defSel === 'auto') ? (INTERCEPT_FOR[m.kind] || 'sam') : defSel;

        /* RED TARGET-LOCK ring at the missile */
        targetLocks.push({
            x: m.x, y: m.y,
            targetM: m,
            life: 0, maxLife: 850
        });

        /* big battery muzzle flash + alert */
        best.flashT = 360;
        best.alertT = 0;

        if (iKind === 'laser') {
            /* INSTANT laser strike — bright, thick beam */
            laserBeams.push({
                x1: best.x, y1: best.y - 14,
                x2: m.x,    y2: m.y,
                life: 0, maxLife: 420,
                enhanced: true
            });
            killMissileBig(m);
            return true;
        }

        /* kinetic interceptor — faster than auto-fire and visually enhanced */
        var startX = best.x, startY = best.y - 14;
        var dxN = m.x - startX, dyN = m.y - startY;
        var dist = Math.sqrt(dxN*dxN + dyN*dyN) || 1;
        var spd = (iKind==='patriot') ? 1.70 :
                  (iKind==='emp')     ? 1.30 :
                  (iKind==='multi')   ? 1.55 :
                  1.55;
        interceptors.push({
            kind: iKind,
            x: startX, y: startY,
            vx: dxN/dist*spd, vy: dyN/dist*spd,
            angle: Math.atan2(dyN, dxN),
            spd: spd,
            target: m,
            trail: [],
            life: 0,
            arcs: (iKind==='emp') ? [] : null,
            spinT: 0,
            enhanced: true,    /* render brighter / thicker */
            userTriggered: true
        });

        /* fat launch puff at the battery */
        for (var pi=0; pi<20; pi++) {
            debrisParts.push({
                x: best.x + rng(-5,5), y: best.y - 8,
                vx: rng(-3.5,3.5), vy: -rng(3,7),
                rot:0, spin:0, size: rng(1.8,4),
                shade: 99,
                life:0, maxLife: rng(500,1100)
            });
        }
        return true;
    }

    /* enhanced mid-air explosion used when user-triggered interceptor connects */
    function killMissileBig(m) {
        var idx = missiles.indexOf(m);
        if (idx === -1) return;
        if (m.strategy) strategyStats.intercepted++;
        missiles.splice(idx, 1);
        /* big explosion — larger fireball, double shock, bright flash */
        explosions.push({ x:m.x, y:m.y, r:0, maxR:60, life:0, maxLife:520, kind:'fire' });
        explosions.push({ x:m.x, y:m.y, r:0, maxR:110, life:0, maxLife:480, kind:'shock' });
        explosions.push({ x:m.x, y:m.y, r:0, maxR:170, life:0, maxLife:560, kind:'shock' });
        explosions.push({ x:m.x, y:m.y, r:0, maxR:35, life:0, maxLife:240, kind:'flash' });
        screenFlash = Math.max(screenFlash, 0.55);
        for (var i=0; i<32; i++) {
            var a = Math.random()*Math.PI*2;
            debrisParts.push({
                x:m.x, y:m.y,
                vx:Math.cos(a)*rng(2.5,7), vy:Math.sin(a)*rng(2.5,6)-rng(1,4),
                rot:rng(0,Math.PI*2), spin:rng(-0.4,0.4),
                size:rng(1.5,4), shade:rngI(0,4),
                life:0, maxLife:rng(600,1300)
            });
        }
        for (var k=0; k<16; k++) {
            var a2 = Math.random()*Math.PI*2;
            debrisParts.push({
                x:m.x, y:m.y,
                vx:Math.cos(a2)*rng(3,9), vy:Math.sin(a2)*rng(2,6)-rng(1,3),
                rot:0, spin:0, size:rng(1,2),
                shade:99,
                life:0, maxLife:rng(500,1000)
            });
        }
    }
    window.toggleDefence = function(){
        defenceActive = !defenceActive;
        return defenceActive;
    };
    window.isDefenceActive   = function(){ return defenceActive; };
    /* mode toggle — DEFENCE GAME: AI fires, user clicks to intercept */
    window.toggleDefenceMode = function(){
        defenceMode = !defenceMode;
        if (defenceMode) {
            /* disable auto-intercept — user is the defender */
            defenceActive = false;
            defenceModeTimer = 600;     /* first shot soon */
            /* disarm attack mode if it was on */
            if (missileArmed) {
                missileArmed = false;
            }
            canvas.style.cursor = 'crosshair';
        } else {
            /* exit defence mode — restore auto-intercept */
            defenceActive = true;
            canvas.style.cursor = '';
        }
        return defenceMode;
    };
    window.isDefenceMode = function(){ return defenceMode; };

    /* ── STRATEGY API ──────────────────────────────────────────────────── */
    window.toggleStrategyMode = function(){
        strategyMode = !strategyMode;
        if (strategyMode) {
            /* mutual exclusion */
            if (missileArmed)   missileArmed = false;
            if (defenceMode)    defenceMode  = false;
            defenceActive = true;
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = '';
        }
        return strategyMode;
    };
    window.isStrategyMode = function(){ return strategyMode; };
    window.getStrategyQueue = function(){
        return strategyQueue.map(function(q){
            return { kind:q.kind, name:MISSILE_LABELS[q.kind], icon:MISSILE_ICONS[q.kind], tx:q.tx, ty:q.ty };
        });
    };
    window.getStrategyCount = function(){ return strategyQueue.length; };
    window.getStrategyMax = function(){ return STRATEGY_MAX; };
    window.getStrategyStats = function(){
        return {
            fired: strategyStats.fired,
            hits: strategyStats.hits,
            intercepted: strategyStats.intercepted,
            total: strategyStats.total,
            success: strategyStats.total>0
                ? Math.round(strategyStats.hits/strategyStats.total*100)
                : 0,
            running: strategyRunning
        };
    };
    window.clearStrategy = function(){
        strategyQueue = [];
        strategyStats = { fired:0, hits:0, intercepted:0, total:0, success:0 };
    };
    window.executeStrategy = function(){
        if (strategyRunning) return false;
        if (strategyQueue.length === 0) return false;
        var queue = strategyQueue.slice();
        strategyStats = { fired:0, hits:0, intercepted:0, total:queue.length, success:0 };
        strategyRunning = true;
        /* fire ALL missiles SIMULTANEOUSLY (no delay) — one massive salvo */
        var savedArmed = missileArmed;
        missileArmed = true;
        for (var i=0; i<queue.length; i++) {
            var item = queue[i];
            fireMissile(item.tx, item.ty, item.kind);
            var m = missiles[missiles.length - 1];
            if (m) { m.strategy = true; m.userFired = true; }
            strategyStats.fired++;
        }
        missileArmed = savedArmed;
        /* allow time for all impacts before clearing the running flag */
        setTimeout(function(){ strategyRunning = false; }, 8000);
        return true;
    };
    window.getDefenceType    = function(){ return DEFENCE_TYPES[defenceTypeIdx]; };
    window.getDefenceTypeName= function(){ return DEFENCE_LABELS[DEFENCE_TYPES[defenceTypeIdx]]; };
    window.getDefenceTypeIcon= function(){ return DEFENCE_ICONS[DEFENCE_TYPES[defenceTypeIdx]]; };
    window.getDefenceTypeIndex = function(){ return defenceTypeIdx; };
    window.setDefenceTypeIndex = function(i){
        var n = DEFENCE_TYPES.length;
        if (typeof i!=='number') return;
        defenceTypeIdx = ((i%n)+n)%n;
    };
    window.getAllDefenceTypes = function(){
        return DEFENCE_TYPES.map(function(t,i){
            return { index:i, type:t, name: DEFENCE_LABELS[t], icon: DEFENCE_ICONS[t] };
        });
    };

    /* ── SEVERITY / DIFFICULTY sliders (0..1) ────────────────────────────
       weatherSeverity   — multiplies intensity of active weather event
       attackDifficulty  — higher = lower intercept rate (missiles get through)
       defenceDifficulty — higher = AI fires faster, more often (defence-mode) */
    var weatherSeverity   = 0.5;
    var attackDifficulty  = 0.5;
    var defenceDifficulty = 0.5;
    window.getWeatherSeverity   = function(){ return weatherSeverity; };
    window.setWeatherSeverity   = function(v){
        v = +v; if (!isFinite(v)) return;
        weatherSeverity = Math.max(0, Math.min(1, v));
    };
    window.getAttackDifficulty  = function(){ return attackDifficulty; };
    window.setAttackDifficulty  = function(v){
        v = +v; if (!isFinite(v)) return;
        attackDifficulty = Math.max(0, Math.min(1, v));
    };
    window.getDefenceDifficulty = function(){ return defenceDifficulty; };
    window.setDefenceDifficulty = function(v){
        v = +v; if (!isFinite(v)) return;
        defenceDifficulty = Math.max(0, Math.min(1, v));
    };

    /* ── AUTO toggles: cycle through ALL missile / interceptor types ──
       autoAttackOn  — when true, fires missiles cycling through MISSILE_TYPES
       autoDefenceOn — when true, cycles DEFENCE_TYPES (and enables defence-mode
                       so AI launches targets to intercept).
       Cadence is scaled by the matching difficulty slider. */
    var autoAttackOn  = false, autoAttackTimer  = 0, autoAttackCyc  = 0;
    var autoDefenceOn = false, autoDefenceTimer = 0, autoDefenceCyc = 0;
    window.isAutoAttackOn   = function(){ return autoAttackOn; };
    window.setAutoAttackEnabled = function(on){
        autoAttackOn = !!on;
        autoAttackTimer = 0;  /* fire immediately on enable */
    };
    window.isAutoDefenceOn  = function(){ return autoDefenceOn; };
    window.setAutoDefenceEnabled = function(on){
        autoDefenceOn = !!on;
        autoDefenceTimer = 0;
        if (autoDefenceOn && !defenceMode) defenceMode = true;
    };

    function pickAutoAttackTarget(){
        var targets = [];
        if (typeof LM !== 'undefined' && LM && LM.length) {
            for (var li=0; li<LM.length; li++) {
                var lx = (typeof LM[li].x === 'number') ? LM[li].x : W*0.5;
                targets.push({ x: lx, y: GROUND - rng(40, GROUND*0.55) });
            }
        }
        if (typeof BGBUILDS !== 'undefined' && BGBUILDS && BGBUILDS.length) {
            for (var bi=0; bi<BGBUILDS.length; bi++) {
                var b = BGBUILDS[bi];
                if (b.x > -50 && b.x < W+50 && b.h > 30) {
                    targets.push({ x: b.x + b.w/2, y: GROUND - b.h*rng(0.30, 0.85) });
                }
            }
        }
        if (targets.length) return targets[Math.floor(Math.random()*targets.length)];
        return { x: rng(W*0.1, W*0.9), y: GROUND - rng(20, GROUND*0.4) };
    }

    function updateAutoSliders(dt){
        /* AUTO-ATTACK: cycle every missile kind, fire at city targets.
           interval ≈ 1500ms easy → 750ms hard (scaled by attack difficulty) */
        if (autoAttackOn) {
            autoAttackTimer -= dt;
            if (autoAttackTimer <= 0) {
                autoAttackTimer = 1500 - 750*attackDifficulty;
                autoAttackCyc = (autoAttackCyc + 1) % MISSILE_TYPES.length;
                missileTypeIdx = autoAttackCyc;  /* sync the visible chip so user sees the rotation */
                var kind = MISSILE_TYPES[autoAttackCyc];
                var tgt = pickAutoAttackTarget();
                var savedArmed = missileArmed;
                missileArmed = true; /* counts as user-fired — attack difficulty applies */
                fireMissile(tgt.x, tgt.y, kind);
                missileArmed = savedArmed;
            }
        }
        /* AUTO-DEFENCE: rotate the active interceptor type so every combo is exercised */
        if (autoDefenceOn) {
            autoDefenceTimer -= dt;
            if (autoDefenceTimer <= 0) {
                autoDefenceTimer = 1500 - 750*defenceDifficulty;
                autoDefenceCyc = (autoDefenceCyc + 1) % DEFENCE_TYPES.length;
                defenceTypeIdx = autoDefenceCyc;
            }
        }
    }

    /* ════════════════════════════════════════════════════════════════
       RECONSTRUCTION SYSTEM
       ────────────────────────────────────────────────────────────────
       Activates automatically (a) when the user turns off attack or
       defence, or (b) when auto-attack/auto-defence has been running
       for 13 seconds (the global cap). The user can also click the
       reconstruction button manually.

       On activation the system samples the damage state (fires, smoke
       plumes, wreckage, craters) and spawns proportional numbers of
       fire trucks, tow trucks, and cranes. Each vehicle drives in
       from off-screen, finds a target, performs its work animation,
       then loops to the next target. Runs for 13 seconds, then any
       remaining damage is cleared.
       ════════════════════════════════════════════════════════════════ */
    var reconstructOn = false;
    var reconstructStartedAt = 0;
    var reconstructVehicles = [];
    var reconstructFX = [];                 /* steam puffs, dust clouds, splash drops, sparkles */
    var reconstructWorkers = [];            /* small construction worker figures walking on ground */
    var reconstructGhosts = [];             /* translucent building outlines materialising while cranes rebuild */
    var reconstructCones = [];              /* orange traffic cones lining the road during rebuild */
    var dynamicSpawnTimer = 0;              /* drip-feed fresh vehicles while damage remains */
    var reconstructSpeed = 1.0;             /* dt multiplier — 0.25× slow … 5× turbo */
    var AUTO_MAX_DURATION = 30000;          /* auto-attack/defence still capped at 30 s */
    var autoAttackStartT = 0;
    var autoDefenceStartT = 0;

    function spawnTrafficCones(){
        /* lay out 8-14 traffic cones along the road every time the
           rebuild kicks off, plus a few clustered near each currently-
           damaged location. */
        reconstructCones.length = 0;
        var lanes = 9 + Math.floor(Math.random() * 5);
        for (var i = 0; i < lanes; i++){
            reconstructCones.push({
                x: W * (i + 0.5) / lanes + rng(-W * 0.04, W * 0.04),
                y: GROUND - 1 + rng(-2, 2),
                size: rng(0.85, 1.10),
                bob: Math.random() * Math.PI * 2
            });
        }
        /* cluster around each damaged site */
        function clusterAt(cx){
            var n = 3 + Math.floor(Math.random() * 2);
            for (var k = 0; k < n; k++){
                reconstructCones.push({
                    x: cx + rng(-26, 26),
                    y: GROUND - 1 + rng(-2, 2),
                    size: rng(0.9, 1.1),
                    bob: Math.random() * Math.PI * 2
                });
            }
        }
        for (var a = 0; a < fireFields.length; a++) clusterAt(fireFields[a].x);
        for (var b = 0; b < wreckage.length; b++)   clusterAt(wreckage[b].x);
        for (var c2 = 0; c2 < craters.length; c2++) clusterAt(craters[c2].x);
    }

    function damageCount(){
        /* Every persistent damage entry counts as ≥1 — the old fractional
           weights (×0.6, ×0.4, ×0.3) meant a single wreckage piece or
           crater would `Math.floor` to 0, and reconstruction would
           finalize while debris was still on screen. Now we count
           every visible scar across ALL damage arrays. */
        return fireFields.length
             + smokePlumes.length
             + wreckage.length
             + craters.length
             + explosions.length
             + (typeof mushroomClouds   !== 'undefined' ? mushroomClouds.length   : 0)
             + (typeof gasClouds        !== 'undefined' ? gasClouds.length        : 0)
             + (typeof empPulses        !== 'undefined' ? empPulses.length        : 0)
             + (typeof gravityWells     !== 'undefined' ? gravityWells.length     : 0)
             + (typeof neutronPulses    !== 'undefined' ? neutronPulses.length    : 0)
             + (typeof antimatterBursts !== 'undefined' ? antimatterBursts.length : 0)
             + (typeof photonStrikes    !== 'undefined' ? photonStrikes.length    : 0)
             + (typeof debrisParts      !== 'undefined' ? Math.floor(debrisParts.length / 8) : 0);
    }

    function spawnReconstructVehicle(kind, delay){
        var fromLeft = Math.random() < 0.5;
        var startX = fromLeft ? -120 : W + 120;
        var dir = fromLeft ? 1 : -1;
        var isHeli = kind === 'helicopter';
        reconstructVehicles.push({
            kind: kind,
            x: startX,
            /* helicopters fly high; ground vehicles sit on the road */
            y: isHeli
               ? (GROUND * 0.42 + rng(-20, 10))
               : (GROUND + (H - GROUND) * 0.20 + rng(-4, 4)),
            vx: dir * (isHeli ? (1.5 + Math.random() * 0.6) : (0.7 + Math.random() * 0.4)),
            vy: 0,
            phase: 'travel',
            workT: 0,
            target: null,
            spawnDelay: delay,
            visible: false,
            sprayParticles: [],
            sparkles: [],
            rotorPhase: Math.random() * Math.PI * 2,
            bobPhase:   Math.random() * Math.PI * 2,
            bucketDrop: 0          /* 0–1: how far the water bucket has lowered */
        });
    }

    function spawnWorker(){
        /* small humanoid construction worker walking on ground */
        var fromLeft = Math.random() < 0.5;
        reconstructWorkers.push({
            x: fromLeft ? -30 : W + 30,
            y: GROUND - 1,
            vx: (fromLeft ? 1 : -1) * (0.35 + Math.random() * 0.25),
            walkPhase: Math.random() * Math.PI * 2,
            helmetHue: rng(0, 60),   /* yellow/orange variations */
            shirtHue:  pickShirt(),
            life: 0,
            maxLife: 14000 + Math.random() * 8000,
            tool: Math.random() < 0.5 ? 'wrench' : (Math.random() < 0.5 ? 'hammer' : 'pipe')
        });
    }
    function pickShirt(){
        var shirts = ['#1e40af', '#ea580c', '#0891b2', '#15803d', '#9333ea', '#be123c'];
        return shirts[Math.floor(Math.random() * shirts.length)];
    }

    function startReconstruction(){
        if (reconstructOn) return;
        reconstructOn = true;
        reconstructStartedAt = (typeof performance !== 'undefined' && performance.now)
                               ? performance.now() : Date.now();
        dynamicSpawnTimer = 2200;

        /* initial vehicle wave scales with current damage. Fire trucks
           always get a hefty minimum of 4 so the water cannon show is
           always front and centre, even on light damage. */
        var nFire  = Math.min(12, Math.max(4, Math.ceil(fireFields.length * 1.5 + smokePlumes.length * 0.6 + wreckage.length * 0.3)));
        var nHeli  = Math.min(4,  Math.max(2, Math.ceil(fireFields.length * 0.5 + smokePlumes.length * 0.25)));
        var nTow   = Math.min(8,  Math.max(1, Math.ceil(wreckage.length * 0.40) + 1));
        var nCrane = Math.min(7,  Math.max(1, Math.ceil(wreckage.length * 0.25 + craters.length * 0.5)));

        for (var i = 0; i < nFire;  i++) spawnReconstructVehicle('fire',       i * 260 + rng(0, 180));
        for (var h = 0; h < nHeli;  h++) spawnReconstructVehicle('helicopter', 200 + h * 500 + rng(0, 220));
        for (var j = 0; j < nTow;   j++) spawnReconstructVehicle('tow',        320 + j * 320 + rng(0, 180));
        for (var k = 0; k < nCrane; k++) spawnReconstructVehicle('crane',      600 + k * 380 + rng(0, 220));

        /* and a small crew of construction workers — at least 4, more
           for heavy damage. They walk independently across the ground
           and do little hammering / digging gestures whenever they're
           next to wreckage or a crater. */
        var nWorkers = Math.min(10, Math.max(4, Math.ceil(damageCount() * 0.4)));
        for (var w = 0; w < nWorkers; w++) spawnWorker();

        /* lay traffic cones across the road */
        spawnTrafficCones();

        /* visual feedback — a quick golden flash */
        screenFlash = Math.max(screenFlash, 0.35);
    }

    function maybeSpawnMore(){
        /* if there's still damage to fix but few capable vehicles, drip
           a fresh one in. Only matters when the user keeps the sim
           running and damage outpaces the initial wave. */
        var fires = fireFields.length + smokePlumes.length;
        var wrecks = 0, brokenBuildings = 0;
        for (var w = 0; w < wreckage.length; w++){
            if (wreckage[w].kind === 'carWreck') wrecks++;
            else if (wreckage[w].kind === 'brokenBuilding') brokenBuildings++;
        }
        var crat = craters.length;

        /* count active per kind */
        var aF = 0, aH = 0, aT = 0, aC = 0;
        for (var i = 0; i < reconstructVehicles.length; i++){
            var v = reconstructVehicles[i];
            if (v.phase === 'leave') continue;
            if      (v.kind === 'fire')       aF++;
            else if (v.kind === 'helicopter') aH++;
            else if (v.kind === 'tow')        aT++;
            else if (v.kind === 'crane')      aC++;
        }
        if (fires > aF) spawnReconstructVehicle('fire', 0);
        if (fires > aH * 3) spawnReconstructVehicle('helicopter', 200);
        if (wrecks > aT * 2) spawnReconstructVehicle('tow', 200);
        if ((brokenBuildings + crat) > aC * 2) spawnReconstructVehicle('crane', 400);
        if (reconstructWorkers.length < 8 && damageCount() > 0) spawnWorker();
    }

    function finalizeReconstruction(){
        /* called when damage has reached 0. Send every remaining
           vehicle off-screen, then do a final SWEEP of any lingering
           damage arrays — guarantees a fully clean city. */
        reconstructCones.length = 0;
        /* The vehicle
           work loop tends to leave trace items behind (e.g. wreckage
           with stuck fireT/smokeT timers); this catches them all. */
        reconstructOn = false;
        fireFields.length      = 0;
        smokePlumes.length     = 0;
        wreckage.length        = 0;
        craters.length         = 0;
        explosions.length      = 0;
        if (typeof mushroomClouds   !== 'undefined') mushroomClouds.length   = 0;
        if (typeof gasClouds        !== 'undefined') gasClouds.length        = 0;
        if (typeof empPulses        !== 'undefined') empPulses.length        = 0;
        if (typeof gravityWells     !== 'undefined') gravityWells.length     = 0;
        if (typeof neutronPulses    !== 'undefined') neutronPulses.length    = 0;
        if (typeof antimatterBursts !== 'undefined') antimatterBursts.length = 0;
        if (typeof photonStrikes    !== 'undefined') photonStrikes.length    = 0;
        if (typeof debrisParts      !== 'undefined') debrisParts.length      = 0;
        for (var i = 0; i < reconstructVehicles.length; i++){
            var rv = reconstructVehicles[i];
            rv.phase = 'leave';
            rv.target = null;
            rv.sprayParticles.length = 0;
            rv.sparkles.length = 0;
            rv.vx = (rv.x < W / 2 ? -1 : 1) * 1.4;
            if (rv.spawnDelay > 0) { reconstructVehicles.splice(i, 1); i--; }
        }
        /* workers exit naturally via their walk velocity */
    }

    /* hard cancel — used by the toggle button and the auto-system. */
    function stopReconstruction(){
        if (!reconstructOn && reconstructVehicles.length === 0 &&
            reconstructWorkers.length === 0 && reconstructGhosts.length === 0) return;
        reconstructOn = false;
        reconstructFX.length = 0;
        reconstructGhosts.length = 0;
        reconstructCones.length = 0;
        /* clear damage immediately on manual cancel — same sweep as
           finalizeReconstruction so the city is fully clean. */
        fireFields.length = 0;
        smokePlumes.length = 0;
        explosions.length = 0;
        wreckage.length = 0;
        craters.length = 0;
        if (typeof mushroomClouds   !== 'undefined') mushroomClouds.length   = 0;
        if (typeof gasClouds        !== 'undefined') gasClouds.length        = 0;
        if (typeof empPulses        !== 'undefined') empPulses.length        = 0;
        if (typeof gravityWells     !== 'undefined') gravityWells.length     = 0;
        if (typeof neutronPulses    !== 'undefined') neutronPulses.length    = 0;
        if (typeof antimatterBursts !== 'undefined') antimatterBursts.length = 0;
        if (typeof photonStrikes    !== 'undefined') photonStrikes.length    = 0;
        if (typeof debrisParts      !== 'undefined') debrisParts.length      = 0;
        /* command vehicles + workers to leave */
        for (var i = 0; i < reconstructVehicles.length; i++){
            var rv = reconstructVehicles[i];
            rv.phase = 'leave';
            rv.target = null;
            rv.sprayParticles.length = 0;
            rv.sparkles.length = 0;
            rv.vx = (rv.x < W / 2 ? -1 : 1) * 1.6;
            if (rv.spawnDelay > 0) { reconstructVehicles.splice(i, 1); i--; }
        }
        for (var wk = 0; wk < reconstructWorkers.length; wk++){
            reconstructWorkers[wk].maxLife = Math.min(reconstructWorkers[wk].maxLife,
                                                      reconstructWorkers[wk].life + 1500);
        }
    }

    function pickReconstructTarget(v){
        if (v.kind === 'fire' || v.kind === 'helicopter'){
            if (fireFields.length){
                var ff = fireFields[Math.floor(Math.random() * fireFields.length)];
                return { kind: 'fire', ref: ff, x: ff.x, y: GROUND - 20 };
            }
            if (smokePlumes.length){
                var sp = smokePlumes[Math.floor(Math.random() * smokePlumes.length)];
                return { kind: 'smoke', ref: sp, x: sp.x, y: GROUND - 20 };
            }
            /* burning wreckage — most car wrecks have smoke/fire timers */
            for (var bi = 0; bi < wreckage.length; bi++){
                var bw = wreckage[bi];
                if (bw.fireT !== undefined || bw.smokeT !== undefined){
                    return { kind: 'wreckFire', ref: bw,
                             x: bw.x, y: (bw.y || GROUND) - 5 };
                }
            }
            /* last-resort: ANY wreckage — cool it down */
            if (wreckage.length){
                var anyW = wreckage[Math.floor(Math.random() * wreckage.length)];
                return { kind: 'wreckFire', ref: anyW,
                         x: anyW.x, y: (anyW.y || GROUND) - 5 };
            }
            return null;
        }
        if (v.kind === 'tow'){
            for (var i = 0; i < wreckage.length; i++){
                if (wreckage[i].kind === 'carWreck' && !wreckage[i].towed){
                    return { kind: 'wreck', ref: wreckage[i], x: wreckage[i].x, y: wreckage[i].y };
                }
            }
            /* fall back to any wreckage */
            if (wreckage.length){
                return { kind: 'wreck', ref: wreckage[0], x: wreckage[0].x, y: wreckage[0].y };
            }
            return null;
        }
        if (v.kind === 'crane'){
            for (var j = 0; j < wreckage.length; j++){
                if (wreckage[j].kind === 'brokenBuilding'){
                    return { kind: 'building', ref: wreckage[j],
                             x: wreckage[j].x, y: GROUND - 30 };
                }
            }
            if (craters.length){
                var cr = craters[Math.floor(Math.random() * craters.length)];
                return { kind: 'crater', ref: cr, x: cr.x, y: GROUND - 8 };
            }
            return null;
        }
    }

    function updateReconstruction(dt){
        if (!reconstructOn && reconstructVehicles.length === 0 &&
            reconstructFX.length === 0 && reconstructWorkers.length === 0 &&
            reconstructGhosts.length === 0 && reconstructCones.length === 0) return;
        /* speed multiplier — applies to ALL reconstruction internals so
           the slider can dial the whole sequence slow or turbo. */
        dt = dt * reconstructSpeed;

        if (reconstructOn){
            /* end the active phase as soon as there's nothing left to
               repair. Vehicles already in 'work' will finish their
               current target on the next iteration via their normal
               transitions; this only flips the global "spawning new
               vehicles" flag off. */
            if (damageCount() === 0){
                finalizeReconstruction();
            } else {
                /* drip-feed additional vehicles + workers if damage is
                   high and the initial wave isn't keeping up. */
                dynamicSpawnTimer -= dt;
                if (dynamicSpawnTimer <= 0){
                    dynamicSpawnTimer = 1800;
                    maybeSpawnMore();
                }
            }
        }

        /* update construction workers — they walk along ground, do
           little hammer/wrench animations near targets. */
        for (var wi = reconstructWorkers.length - 1; wi >= 0; wi--){
            var wk = reconstructWorkers[wi];
            wk.life += dt;
            wk.walkPhase += dt * 0.012;
            /* slow down if next to a target */
            var nearTarget = false;
            for (var wt = 0; wt < wreckage.length; wt++){
                if (Math.abs(wreckage[wt].x - wk.x) < 22){ nearTarget = true; break; }
            }
            if (!nearTarget){
                for (var ct = 0; ct < craters.length; ct++){
                    if (Math.abs(craters[ct].x - wk.x) < 22){ nearTarget = true; break; }
                }
            }
            wk.x += wk.vx * dt * 0.055 * (nearTarget ? 0.15 : 1);
            wk.working = nearTarget;
            /* tool sparks at target */
            if (nearTarget && Math.random() < 0.25){
                reconstructFX.push({
                    kind: 'spark',
                    x: wk.x + (wk.vx > 0 ? 4 : -4),
                    y: wk.y - 6,
                    vx: rng(-0.5, 0.5), vy: -1 - Math.random() * 0.5,
                    life: 0, maxLife: 350,
                    r: 0.8 + Math.random() * 0.4
                });
            }
            if (wk.life >= wk.maxLife || wk.x < -50 || wk.x > W + 50){
                reconstructWorkers.splice(wi, 1);
            }
        }

        /* update rebuild ghosts — translucent building outlines that
           emerge over a brokenBuilding then solidify before vanishing. */
        for (var gi = reconstructGhosts.length - 1; gi >= 0; gi--){
            var g = reconstructGhosts[gi];
            g.life += dt;
            /* emit sparkles along the outline */
            if (Math.random() < 0.5){
                reconstructFX.push({
                    kind: 'spark',
                    x: g.x + rng(-g.w / 2, g.w / 2),
                    y: g.y - rng(0, g.h),
                    vx: rng(-0.3, 0.3), vy: -0.4 - Math.random() * 0.3,
                    life: 0, maxLife: 700,
                    r: 1 + Math.random() * 0.4
                });
            }
            if (g.life >= g.maxLife) reconstructGhosts.splice(gi, 1);
        }

        for (var i = reconstructVehicles.length - 1; i >= 0; i--){
            var v = reconstructVehicles[i];
            v.spawnDelay -= dt;
            if (v.spawnDelay > 0) continue;
            v.visible = true;

            if (v.phase === 'travel'){
                if (!v.target){
                    v.target = pickReconstructTarget(v);
                    if (!v.target){
                        /* no work left → leave */
                        v.phase = 'leave';
                        v.vx = (v.x < W/2 ? -1 : 1) * (v.kind === 'helicopter' ? 2.4 : 1.4);
                        continue;
                    }
                }
                if (v.kind === 'helicopter'){
                    /* fly toward target; bob up/down a tiny bit */
                    var hdx = v.target.x - v.x;
                    var hdir = hdx >= 0 ? 1 : -1;
                    v.vx = hdir * Math.min(2.5, 0.9 + Math.abs(hdx) * 0.004);
                    v.x += v.vx * dt * 0.09;
                    v.bobPhase += dt * 0.005;
                    /* target altitude: ~38 % of GROUND from top */
                    var tgtY = GROUND * 0.38 + Math.sin(v.bobPhase) * 4;
                    v.y += (tgtY - v.y) * 0.05;
                    v.rotorPhase += dt * 0.06;
                    if (Math.abs(hdx) < 22){
                        v.phase = 'work';
                        v.workT = 0;
                        v.vx = 0;
                    }
                } else {
                    var dx = v.target.x - v.x;
                    var dir = dx > 0 ? 1 : -1;
                    v.vx = dir * Math.min(1.5, 0.6 + Math.abs(dx) * 0.003);
                    v.x += v.vx * dt * 0.06;
                    if (Math.abs(dx) < 30){
                        v.phase = 'work';
                        v.workT = 0;
                        v.vx = 0;
                    }
                }
            }
            else if (v.phase === 'work'){
                v.workT += dt;
                /* per-kind work animation + effect */
                if (v.kind === 'fire'){
                    /* PRESSURISED MULTI-STREAM water cannon. Three
                       layers of particles per frame — a fast jet at
                       the centre, a wider spray cone, and a fine mist.
                       Each droplet has gravity + splash. */
                    if (v.workT < 2200){
                        var hoseDir = v.target && v.target.x > v.x ? 1 : -1;
                        var tdx = v.target ? (v.target.x - v.x) : hoseDir * 60;
                        var tdy = v.target ? -(v.y - 12 - v.target.y) : 30;
                        var aim = Math.atan2(tdy, tdx);
                        /* main jet — fast tight droplets */
                        for (var j = 0; j < 3; j++){
                            var jSpread = (Math.random() - 0.5) * 0.18;
                            var spd = 3.0 + Math.random() * 1.4;
                            v.sprayParticles.push({
                                kind: 'jet',
                                x: v.x + hoseDir * 22, y: v.y - 14,
                                vx: Math.cos(aim + jSpread) * spd,
                                vy: Math.sin(aim + jSpread) * spd - 0.6,
                                life: 0, maxLife: 900 + Math.random() * 300,
                                r: 1.4 + Math.random() * 0.6
                            });
                        }
                        /* wide cone — slower fan of droplets */
                        if (Math.random() < 0.85){
                            var fSpread = (Math.random() - 0.5) * 0.55;
                            v.sprayParticles.push({
                                kind: 'cone',
                                x: v.x + hoseDir * 20, y: v.y - 13,
                                vx: Math.cos(aim + fSpread) * (1.6 + Math.random() * 0.8),
                                vy: Math.sin(aim + fSpread) * (1.6 + Math.random() * 0.8) - 0.8,
                                life: 0, maxLife: 1200,
                                r: 2.0 + Math.random() * 0.9
                            });
                        }
                        /* fine mist — drifts and dissipates */
                        if (Math.random() < 0.4){
                            v.sprayParticles.push({
                                kind: 'mist',
                                x: v.x + hoseDir * 18 + rng(-3, 3),
                                y: v.y - 12 + rng(-4, 4),
                                vx: Math.cos(aim) * 0.6 + rng(-0.3, 0.3),
                                vy: -0.5 + rng(-0.3, 0.1),
                                life: 0, maxLife: 1400,
                                r: 5 + Math.random() * 4
                            });
                        }
                    }
                    if (v.workT > 2300){
                        if (v.target){
                            if (v.target.kind === 'fire'){
                                var fi = fireFields.indexOf(v.target.ref);
                                if (fi >= 0) fireFields.splice(fi, 1);
                                /* steam burst at extinguish point */
                                for (var st = 0; st < 8; st++){
                                    reconstructFX.push({
                                        kind: 'steam',
                                        x: v.target.x + rng(-12, 12),
                                        y: v.target.y + rng(-8, 8),
                                        vx: rng(-0.4, 0.4),
                                        vy: -0.8 - Math.random() * 0.6,
                                        life: 0, maxLife: 1500,
                                        r: 6 + Math.random() * 5
                                    });
                                }
                            } else if (v.target.kind === 'smoke'){
                                var si = smokePlumes.indexOf(v.target.ref);
                                if (si >= 0) smokePlumes.splice(si, 1);
                            } else if (v.target.kind === 'wreckFire'){
                                /* cool a smoking wreck without towing it */
                                if (v.target.ref){
                                    v.target.ref.fireT = undefined;
                                    v.target.ref.smokeT = undefined;
                                }
                                for (var stw = 0; stw < 6; stw++){
                                    reconstructFX.push({
                                        kind: 'steam',
                                        x: v.target.x + rng(-10, 10),
                                        y: v.target.y + rng(-6, 6),
                                        vx: rng(-0.4, 0.4),
                                        vy: -0.7 - Math.random() * 0.5,
                                        life: 0, maxLife: 1400,
                                        r: 5 + Math.random() * 4
                                    });
                                }
                            }
                        }
                        v.target = null;
                        v.phase = 'travel';
                    }
                }
                else if (v.kind === 'helicopter'){
                    /* Hover-and-dump water bucket attack: rotor keeps spinning,
                       the bucket lowers (bucketDrop 0→1), a vertical cascade
                       of water pours down onto the target, steam bursts on
                       impact, then the bucket retracts and the heli moves on. */
                    v.rotorPhase += dt * 0.06;
                    v.bobPhase += dt * 0.005;
                    /* lower bucket smoothly */
                    var prog = Math.min(1, v.workT / 600);
                    v.bucketDrop += (prog - v.bucketDrop) * 0.08;
                    /* pour water 700–2400 ms window */
                    if (v.workT > 600 && v.workT < 2400){
                        /* WALL of falling water */
                        for (var hd = 0; hd < 5; hd++){
                            v.sprayParticles.push({
                                kind: 'jet',
                                x: v.x + rng(-9, 9),
                                y: v.y + 4 + v.bucketDrop * 14,
                                vx: rng(-0.5, 0.5),
                                vy: 3.5 + Math.random() * 1.6,
                                life: 0, maxLife: 1200,
                                r: 1.8 + Math.random() * 0.8
                            });
                        }
                        if (Math.random() < 0.8){
                            v.sprayParticles.push({
                                kind: 'cone',
                                x: v.x + rng(-12, 12),
                                y: v.y + 4 + v.bucketDrop * 14,
                                vx: rng(-1.0, 1.0),
                                vy: 2.4 + Math.random() * 1.2,
                                life: 0, maxLife: 1400,
                                r: 2.4 + Math.random() * 1.0
                            });
                        }
                        if (Math.random() < 0.5){
                            v.sprayParticles.push({
                                kind: 'mist',
                                x: v.x + rng(-15, 15),
                                y: v.y + 12 + v.bucketDrop * 14,
                                vx: rng(-0.4, 0.4),
                                vy: 0.8 + Math.random() * 0.6,
                                life: 0, maxLife: 1700,
                                r: 7 + Math.random() * 5
                            });
                        }
                        /* impact steam at target */
                        if (v.target && Math.random() < 0.35){
                            reconstructFX.push({
                                kind: 'steam',
                                x: v.target.x + rng(-14, 14),
                                y: v.target.y + rng(-3, 5),
                                vx: rng(-0.6, 0.6),
                                vy: -1.2 - Math.random() * 0.6,
                                life: 0, maxLife: 1500,
                                r: 7 + Math.random() * 5
                            });
                        }
                    }
                    if (v.workT > 2600){
                        if (v.target){
                            if (v.target.kind === 'fire'){
                                var fhi = fireFields.indexOf(v.target.ref);
                                if (fhi >= 0) fireFields.splice(fhi, 1);
                                /* huge steam burst */
                                for (var bst = 0; bst < 12; bst++){
                                    reconstructFX.push({
                                        kind: 'steam',
                                        x: v.target.x + rng(-18, 18),
                                        y: v.target.y + rng(-10, 10),
                                        vx: rng(-0.6, 0.6),
                                        vy: -1 - Math.random() * 0.8,
                                        life: 0, maxLife: 1800,
                                        r: 8 + Math.random() * 6
                                    });
                                }
                            } else if (v.target.kind === 'smoke'){
                                var shi = smokePlumes.indexOf(v.target.ref);
                                if (shi >= 0) smokePlumes.splice(shi, 1);
                            } else if (v.target.kind === 'wreckFire'){
                                if (v.target.ref){
                                    v.target.ref.fireT = undefined;
                                    v.target.ref.smokeT = undefined;
                                }
                            }
                        }
                        v.target = null;
                        v.phase = 'travel';
                        v.bucketDrop = 0;
                    }
                }
                else if (v.kind === 'tow'){
                    /* engage hook, then haul. mid-work spawns sparks +
                       small dust puffs as the wreck lifts. */
                    if (Math.random() < 0.5 && v.target && v.workT > 400){
                        reconstructFX.push({
                            kind: 'dust',
                            x: v.target.x + rng(-12, 12),
                            y: v.target.y + rng(-2, 4),
                            vx: rng(-0.3, 0.3), vy: -0.4 - Math.random() * 0.3,
                            life: 0, maxLife: 1100,
                            r: 5 + Math.random() * 3
                        });
                    }
                    if (Math.random() < 0.25 && v.target && v.workT > 200 && v.workT < 1400){
                        /* sparks from the hook */
                        var hookDir = v.target.x > v.x ? 1 : -1;
                        reconstructFX.push({
                            kind: 'spark',
                            x: v.x + hookDir * 30, y: v.y - 3,
                            vx: hookDir * (1.5 + Math.random()) + rng(-0.5, 0.5),
                            vy: -1 - Math.random(),
                            life: 0, maxLife: 400,
                            r: 1.2 + Math.random() * 0.6
                        });
                    }
                    if (v.workT > 1600){
                        if (v.target && v.target.ref){
                            var wi = wreckage.indexOf(v.target.ref);
                            if (wi >= 0) wreckage.splice(wi, 1);
                            /* triumph puff */
                            for (var dp = 0; dp < 6; dp++){
                                reconstructFX.push({
                                    kind: 'dust',
                                    x: v.target.x + rng(-15, 15),
                                    y: v.target.y + rng(-5, 5),
                                    vx: rng(-0.6, 0.6),
                                    vy: -0.8 - Math.random() * 0.5,
                                    life: 0, maxLife: 1300,
                                    r: 6 + Math.random() * 4
                                });
                            }
                        }
                        v.target = null;
                        v.phase = 'travel';
                    }
                }
                else if (v.kind === 'crane'){
                    /* construction sparkles + drifting dust + slow
                       rebuild progress. After completion spawn a burst
                       of golden + white "rebuilt!" sparkles. */
                    if (Math.random() < 0.7 && v.target){
                        v.sparkles.push({
                            x: v.target.x + rng(-20, 20),
                            y: GROUND - rng(5, 35),
                            life: 0, maxLife: 700,
                            r: rng(0.8, 2.0),
                            hue: 40 + rng(0, 25)
                        });
                    }
                    if (Math.random() < 0.35 && v.target){
                        reconstructFX.push({
                            kind: 'dust',
                            x: v.target.x + rng(-25, 25),
                            y: GROUND - rng(0, 10),
                            vx: rng(-0.3, 0.3), vy: -0.3 - Math.random() * 0.3,
                            life: 0, maxLife: 1500,
                            r: 7 + Math.random() * 5
                        });
                    }
                    if (v.workT > 2400){
                        if (v.target){
                            if (v.target.kind === 'building' && v.target.ref){
                                /* Use the broken building's recorded
                                   bounds (set when it was destroyed) so
                                   the ghost matches the actual silhouette. */
                                var br = v.target.ref;
                                var bw = (br.rightX && br.leftX)
                                         ? (br.rightX - br.leftX) : rng(40, 70);
                                var bh = rng(55, 95);
                                reconstructGhosts.push({
                                    x: v.target.x,
                                    y: GROUND,
                                    w: bw, h: bh,
                                    life: 0, maxLife: 2600,
                                    hue: 40 + rng(0, 20),
                                    floors: Math.floor(bh / 12)
                                });
                                var bi = wreckage.indexOf(v.target.ref);
                                if (bi >= 0) wreckage.splice(bi, 1);
                            } else if (v.target.kind === 'crater' && v.target.ref){
                                var ci = craters.indexOf(v.target.ref);
                                if (ci >= 0) craters.splice(ci, 1);
                            }
                            /* "rebuilt!" — burst of golden sparkles */
                            for (var sk2 = 0; sk2 < 24; sk2++){
                                v.sparkles.push({
                                    x: v.target.x + rng(-32, 32),
                                    y: GROUND - rng(0, 60),
                                    life: 0, maxLife: 1100,
                                    r: rng(1.2, 2.8),
                                    hue: 40 + rng(0, 30)
                                });
                            }
                        }
                        v.target = null;
                        v.phase = 'travel';
                    }
                }

                /* update spray particles with gravity + splash */
                for (var sp = v.sprayParticles.length - 1; sp >= 0; sp--){
                    var p = v.sprayParticles[sp];
                    p.x += p.vx * dt * 0.06;
                    p.y += p.vy * dt * 0.06;
                    /* mist drifts upward (rises), others fall */
                    if (p.kind === 'mist'){
                        p.vy += 0.01;
                        p.r *= 1.005;
                    } else {
                        p.vy += 0.06;
                    }
                    p.life += dt;
                    /* splash on ground */
                    if (p.y >= GROUND && p.kind !== 'mist' && !p.splashed){
                        p.splashed = true;
                        for (var sp2 = 0; sp2 < 3; sp2++){
                            reconstructFX.push({
                                kind: 'splash',
                                x: p.x + rng(-2, 2),
                                y: GROUND - 1,
                                vx: rng(-0.8, 0.8),
                                vy: -0.6 - Math.random() * 0.4,
                                life: 0, maxLife: 350,
                                r: 1 + Math.random() * 0.6
                            });
                        }
                    }
                    if (p.life >= p.maxLife || p.y > GROUND + 3) v.sprayParticles.splice(sp, 1);
                }
                /* update sparkles */
                for (var sk = v.sparkles.length - 1; sk >= 0; sk--){
                    var s = v.sparkles[sk];
                    s.life += dt;
                    if (s.life >= s.maxLife) v.sparkles.splice(sk, 1);
                }
            }
            else if (v.phase === 'leave'){
                v.x += v.vx * dt * 0.08;
                if (v.x < -180 || v.x > W + 180){
                    reconstructVehicles.splice(i, 1);
                }
            }
        }

        /* update global FX (steam, dust, sparks, splash). These live
           in `reconstructFX[]` independently of any single vehicle so
           they persist after the spawning vehicle moves on. */
        for (var fxi = reconstructFX.length - 1; fxi >= 0; fxi--){
            var fx = reconstructFX[fxi];
            fx.life += dt;
            fx.x += fx.vx * dt * 0.06;
            fx.y += fx.vy * dt * 0.06;
            if (fx.kind === 'steam' || fx.kind === 'dust'){
                fx.vy -= 0.002;            /* rises */
                fx.r  *= 1.012;            /* expands */
                fx.vx *= 0.985;
            } else if (fx.kind === 'spark'){
                fx.vy += 0.10;             /* falls */
                fx.vx *= 0.95;
            } else if (fx.kind === 'splash'){
                fx.vy += 0.10;
            }
            if (fx.life >= fx.maxLife) reconstructFX.splice(fxi, 1);
        }
    }

    function drawReconstruction(c){
        if (!reconstructOn && reconstructVehicles.length === 0 &&
            reconstructFX.length === 0 && reconstructWorkers.length === 0 &&
            reconstructGhosts.length === 0 && reconstructCones.length === 0) return;

        /* ─── Traffic cones ── orange triangular cones laid out across
           the road. Drawn FIRST so everything else (water, sparkles,
           vehicles) sits visually on top of them — and the cars driving
           in the main scene render over them too. */
        for (var ci2 = 0; ci2 < reconstructCones.length; ci2++){
            drawCone(c, reconstructCones[ci2]);
        }

        /* ─── Rebuild ghosts ── translucent building outlines that
           emerge and solidify when cranes complete a brokenBuilding. */
        for (var gi = 0; gi < reconstructGhosts.length; gi++){
            var g = reconstructGhosts[gi];
            var t = g.life / g.maxLife;
            /* alpha curve — fade in (0→0.7), hold, then fade out */
            var ga = t < 0.3 ? (t / 0.3) * 0.7
                   : t < 0.85 ? 0.7
                   : (1 - t) / 0.15 * 0.7;
            /* outline glow */
            c.strokeStyle = 'hsla(' + g.hue.toFixed(0) + ',95%,65%,' +
                            (0.85 * ga).toFixed(2) + ')';
            c.lineWidth = 1.4;
            c.shadowColor = 'hsla(' + g.hue.toFixed(0) + ',100%,60%,' + ga.toFixed(2) + ')';
            c.shadowBlur = 16;
            c.strokeRect(g.x - g.w / 2, g.y - g.h, g.w, g.h);
            /* horizontal floor lines reveal progressively */
            var floorsToShow = Math.floor(g.floors * Math.min(1, t * 1.8));
            for (var fr = 1; fr < floorsToShow; fr++){
                var fy = g.y - (g.h / g.floors) * fr;
                c.beginPath();
                c.moveTo(g.x - g.w / 2 + 3, fy);
                c.lineTo(g.x + g.w / 2 - 3, fy);
                c.stroke();
            }
            c.shadowBlur = 0;
            /* glowing fill inside */
            c.fillStyle = 'hsla(' + g.hue.toFixed(0) + ',95%,80%,' + (0.10 * ga).toFixed(2) + ')';
            c.fillRect(g.x - g.w / 2, g.y - g.h, g.w, g.h);
            /* window pips */
            for (var fy2 = 1; fy2 < floorsToShow; fy2++){
                var rowY = g.y - (g.h / g.floors) * fy2 + (g.h / g.floors) * 0.5;
                for (var wx = 0; wx < Math.floor(g.w / 6); wx++){
                    if ((fy2 + wx) % 2 === 0 && Math.random() < 0.7){
                        c.fillStyle = 'hsla(' + g.hue.toFixed(0) + ',90%,75%,' +
                                      (0.5 * ga).toFixed(2) + ')';
                        c.fillRect(g.x - g.w / 2 + wx * 6 + 2, rowY - 2, 2, 3);
                    }
                }
            }
        }

        /* Draw global FX FIRST so they sit behind the vehicles —
           steam/dust looks natural rising behind a fire-truck cab. */
        for (var fxi = 0; fxi < reconstructFX.length; fxi++){
            var fx = reconstructFX[fxi];
            var fa = 1 - fx.life / fx.maxLife;
            if (fx.kind === 'steam'){
                /* steam — white cloud puff, low saturation */
                c.fillStyle = 'rgba(245,250,255,' + (0.55 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2); c.fill();
                c.fillStyle = 'rgba(255,255,255,' + (0.30 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r * 0.6, 0, Math.PI * 2); c.fill();
            } else if (fx.kind === 'dust'){
                /* construction dust — warm tan */
                c.fillStyle = 'rgba(220,200,170,' + (0.50 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2); c.fill();
                c.fillStyle = 'rgba(190,170,140,' + (0.30 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r * 0.7, 0, Math.PI * 2); c.fill();
            } else if (fx.kind === 'spark'){
                /* orange spark — bright core, warm halo */
                c.fillStyle = 'rgba(255,210,90,' + fa.toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2); c.fill();
                c.fillStyle = 'rgba(255,140,40,' + (0.55 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r * 2.4, 0, Math.PI * 2); c.fill();
            } else if (fx.kind === 'splash'){
                c.fillStyle = 'rgba(160,210,250,' + (0.85 * fa).toFixed(2) + ')';
                c.beginPath(); c.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2); c.fill();
            }
        }

        for (var i = 0; i < reconstructVehicles.length; i++){
            var v = reconstructVehicles[i];
            if (!v.visible) continue;
            /* Helicopters render in a SEPARATE top-of-stack pass
               (drawReconstructionAirborne) so they sit above cars
               + missiles. Skip them entirely in this ground pass. */
            if (v.kind === 'helicopter') continue;

            /* Per-vehicle spray + sparkle particles drawn AROUND the vehicle */
            if (v.sprayParticles && v.sprayParticles.length){
                /* Pass 1: mist (drawn FIRST, behind the jet) */
                for (var s = 0; s < v.sprayParticles.length; s++){
                    var sp = v.sprayParticles[s];
                    if (sp.kind !== 'mist') continue;
                    var ma = 1 - sp.life / sp.maxLife;
                    c.fillStyle = 'rgba(220,235,250,' + (0.18 * ma).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2); c.fill();
                }
                /* Pass 2: cone droplets (wider spray) */
                for (var s2 = 0; s2 < v.sprayParticles.length; s2++){
                    var sp2 = v.sprayParticles[s2];
                    if (sp2.kind !== 'cone') continue;
                    var ca = 1 - sp2.life / sp2.maxLife;
                    c.fillStyle = 'rgba(150,210,255,' + (0.65 * ca).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp2.x, sp2.y, sp2.r, 0, Math.PI * 2); c.fill();
                    /* white core for fresh drops */
                    if (sp2.life < 200){
                        c.fillStyle = 'rgba(255,255,255,' + (0.5 * ca).toFixed(2) + ')';
                        c.beginPath(); c.arc(sp2.x, sp2.y, sp2.r * 0.5, 0, Math.PI * 2); c.fill();
                    }
                }
                /* Pass 3: jet droplets (brightest, tightest) */
                for (var s3 = 0; s3 < v.sprayParticles.length; s3++){
                    var sp3 = v.sprayParticles[s3];
                    if (sp3.kind !== 'jet') continue;
                    var ja = 1 - sp3.life / sp3.maxLife;
                    /* trail line — streak in motion direction */
                    c.strokeStyle = 'rgba(180,225,255,' + (0.55 * ja).toFixed(2) + ')';
                    c.lineWidth = sp3.r * 1.4;
                    c.lineCap = 'round';
                    c.beginPath();
                    c.moveTo(sp3.x, sp3.y);
                    c.lineTo(sp3.x - sp3.vx * 2, sp3.y - sp3.vy * 2);
                    c.stroke();
                    /* bright head droplet */
                    c.fillStyle = 'rgba(240,250,255,' + (0.95 * ja).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp3.x, sp3.y, sp3.r * 0.9, 0, Math.PI * 2); c.fill();
                }
                c.lineCap = 'butt';
            }

            /* Vehicle body */
            if      (v.kind === 'fire')   drawFireTruck(c, v);
            else if (v.kind === 'tow')    drawTowTruck(c, v);
            else if (v.kind === 'crane')  drawCrane(c, v);

            /* Rebuild sparkles drawn ON TOP of the crane scene */
            if (v.sparkles && v.sparkles.length){
                for (var k = 0; k < v.sparkles.length; k++){
                    var skp = v.sparkles[k];
                    var ka  = 1 - skp.life / skp.maxLife;
                    /* outer soft halo */
                    c.fillStyle = 'hsla(' + skp.hue.toFixed(0) + ', 100%, 85%, ' +
                                  (0.45 * ka).toFixed(2) + ')';
                    c.beginPath(); c.arc(skp.x, skp.y, skp.r * 2.6, 0, Math.PI * 2); c.fill();
                    /* inner solid pip */
                    c.fillStyle = 'hsla(' + skp.hue.toFixed(0) + ', 95%, 65%, ' +
                                  (0.95 * ka).toFixed(2) + ')';
                    c.fillRect(skp.x - skp.r, skp.y - skp.r, skp.r * 2, skp.r * 2);
                    /* cross-glints make them feel like real sparkles */
                    c.strokeStyle = 'hsla(' + skp.hue.toFixed(0) + ', 100%, 90%, ' +
                                    (0.75 * ka).toFixed(2) + ')';
                    c.lineWidth = 0.8;
                    c.beginPath();
                    c.moveTo(skp.x - skp.r * 3, skp.y); c.lineTo(skp.x + skp.r * 3, skp.y);
                    c.moveTo(skp.x, skp.y - skp.r * 3); c.lineTo(skp.x, skp.y + skp.r * 3);
                    c.stroke();
                }
            }
        }

        /* ── Construction workers ── small humanoid sprites walking
           along the ground with animated legs and a hard-hat. When
           next to a target they swing a tool with sparks. */
        for (var wki = 0; wki < reconstructWorkers.length; wki++){
            var wkr = reconstructWorkers[wki];
            drawWorker(c, wkr);
        }
    }

    function drawHelicopter(c, v){
        var x = v.x, y = v.y;
        var dir = (v.vx === 0 && v.target) ? (v.target.x > v.x ? 1 : -1)
                                            : (v.vx >= 0 ? 1 : -1);
        var now = Date.now();
        var rotorA = v.rotorPhase || (now * 0.06);

        /* ── ROTOR DOWNWASH — a wide cone of moving dust just below
           the helicopter, only when low enough or working */
        if (v.phase === 'work' || v.y > GROUND * 0.45){
            for (var dn = 0; dn < 2; dn++){
                if (Math.random() < 0.4){
                    reconstructFX.push({
                        kind: 'dust',
                        x: x + rng(-22, 22),
                        y: GROUND - rng(0, 12),
                        vx: rng(-0.7, 0.7),
                        vy: -0.2 - Math.random() * 0.3,
                        life: 0, maxLife: 1300,
                        r: 5 + Math.random() * 4
                    });
                }
            }
        }

        /* ── TAIL BOOM (drawn first so fuselage covers the inner joint) */
        c.fillStyle = '#1e293b';
        c.fillRect(x - dir * 8, y - 3, -dir * 22, 4);
        /* tail rudder */
        c.fillStyle = '#facc15';
        c.fillRect(x - dir * 28, y - 8, dir * 2, 8);
        /* tail rotor blur */
        c.strokeStyle = 'rgba(180,180,180,0.55)';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(x - dir * 28, y - 4, 5, 0, Math.PI * 2);
        c.stroke();
        var trA = rotorA * 2.4;
        c.strokeStyle = '#1f2937';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(x - dir * 28 - Math.cos(trA) * 5, y - 4 - Math.sin(trA) * 5);
        c.lineTo(x - dir * 28 + Math.cos(trA) * 5, y - 4 + Math.sin(trA) * 5);
        c.stroke();

        /* ── FUSELAGE — rounded body with gradient */
        var bg = c.createLinearGradient(x, y - 14, x, y + 8);
        bg.addColorStop(0, '#fef9c3');
        bg.addColorStop(0.4, '#facc15');
        bg.addColorStop(1, '#a16207');
        c.fillStyle = bg;
        c.beginPath();
        c.ellipse(x, y - 2, 22, 12, 0, 0, Math.PI * 2);
        c.fill();
        /* dark belly underline */
        c.fillStyle = 'rgba(0,0,0,0.20)';
        c.beginPath();
        c.ellipse(x, y + 5, 18, 4, 0, 0, Math.PI);
        c.fill();
        /* red side stripe */
        c.fillStyle = '#dc2626';
        c.fillRect(x - 20, y - 4, 40, 2);
        /* "FIRE & RESCUE" lettering placeholder — tiny block */
        c.fillStyle = '#0f172a';
        c.fillRect(x - 5, y, 10, 1.5);

        /* ── COCKPIT GLASS — bubble at the front */
        var glassGrad = c.createRadialGradient(x + dir * 8, y - 8, 2,
                                                x + dir * 8, y - 6, 12);
        glassGrad.addColorStop(0, '#dbeafe');
        glassGrad.addColorStop(0.6, '#3b82f6');
        glassGrad.addColorStop(1, '#1e3a8a');
        c.fillStyle = glassGrad;
        c.beginPath();
        c.ellipse(x + dir * 10, y - 6, 9, 7, 0, 0, Math.PI * 2);
        c.fill();
        /* highlight on glass */
        c.fillStyle = 'rgba(255,255,255,0.55)';
        c.beginPath();
        c.ellipse(x + dir * 12, y - 9, 3, 1.5, 0, 0, Math.PI * 2);
        c.fill();
        /* glass frame */
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.beginPath();
        c.ellipse(x + dir * 10, y - 6, 9, 7, 0, 0, Math.PI * 2);
        c.stroke();

        /* ── LANDING SKIDS */
        c.strokeStyle = '#1f2937';
        c.lineWidth = 1.8;
        c.beginPath();
        c.moveTo(x - 12, y + 9); c.lineTo(x + 12, y + 9);
        c.stroke();
        /* skid struts */
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(x - 8, y + 6); c.lineTo(x - 10, y + 9);
        c.moveTo(x + 8, y + 6); c.lineTo(x + 10, y + 9);
        c.stroke();

        /* ── MAIN ROTOR — fast-spinning, motion-blurred */
        var rotorY = y - 14;
        /* rotor blur disc */
        var blurGrad = c.createRadialGradient(x, rotorY, 5, x, rotorY, 36);
        blurGrad.addColorStop(0, 'rgba(220,220,220,0.50)');
        blurGrad.addColorStop(0.7, 'rgba(180,180,180,0.20)');
        blurGrad.addColorStop(1, 'rgba(180,180,180,0.00)');
        c.fillStyle = blurGrad;
        c.beginPath();
        c.ellipse(x, rotorY, 36, 4, 0, 0, Math.PI * 2);
        c.fill();
        /* mast */
        c.fillStyle = '#0f172a';
        c.fillRect(x - 1.5, y - 14, 3, 6);
        c.fillStyle = '#fbbf24';
        c.beginPath(); c.arc(x, y - 14, 2.5, 0, Math.PI * 2); c.fill();
        /* two blades drawn with current rotation for crisp ones over the blur */
        c.strokeStyle = '#1f2937';
        c.lineWidth = 2.2;
        c.lineCap = 'round';
        var bl1c = Math.cos(rotorA);
        var bl1s = Math.sin(rotorA);
        c.beginPath();
        c.moveTo(x - bl1c * 36, rotorY - bl1s * 3.5);
        c.lineTo(x + bl1c * 36, rotorY + bl1s * 3.5);
        c.stroke();
        var bl2c = Math.cos(rotorA + Math.PI / 2);
        var bl2s = Math.sin(rotorA + Math.PI / 2);
        c.strokeStyle = 'rgba(31,41,55,0.35)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(x - bl2c * 36, rotorY - bl2s * 3.5);
        c.lineTo(x + bl2c * 36, rotorY + bl2s * 3.5);
        c.stroke();
        c.lineCap = 'butt';

        /* ── WATER BUCKET — lowers from the belly during work */
        if (v.phase === 'work' || (v.bucketDrop && v.bucketDrop > 0.02)){
            var drop = (v.bucketDrop || 0);
            var bkx = x;
            var bky = y + 10 + drop * 26;
            /* cable */
            c.strokeStyle = '#475569';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(x, y + 8);
            c.lineTo(bkx, bky - 6);
            c.stroke();
            /* bucket body — orange canvas with red ring */
            c.fillStyle = '#ea580c';
            c.beginPath();
            c.moveTo(bkx - 9, bky - 6);
            c.lineTo(bkx + 9, bky - 6);
            c.lineTo(bkx + 7, bky + 8);
            c.lineTo(bkx - 7, bky + 8);
            c.closePath();
            c.fill();
            c.fillStyle = '#9a3412';
            c.fillRect(bkx - 9, bky - 6, 18, 2);
            c.fillStyle = '#fbbf24';
            c.fillRect(bkx - 9, bky - 4, 18, 1);
            /* water visible inside (top edge) when not pouring */
            if (v.workT < 700 || v.workT > 2400){
                c.fillStyle = '#3b82f6';
                c.fillRect(bkx - 7, bky - 4, 14, 4);
                c.fillStyle = 'rgba(255,255,255,0.45)';
                c.fillRect(bkx - 7, bky - 4, 14, 0.8);
            } else {
                /* mid-pour: water pouring from the bottom of the bucket */
                c.fillStyle = 'rgba(59,130,246,0.85)';
                c.fillRect(bkx - 6, bky + 6, 12, 4);
            }
        }

        /* ── NAVIGATION LIGHTS — red (port), green (starboard), white strobe */
        var navBlink = Math.sin(now * 0.012) > 0;
        c.fillStyle = '#ef4444';
        c.fillRect(x - dir * 20, y - 1, 2, 2);
        c.fillStyle = '#10b981';
        c.fillRect(x + dir * 18, y - 1, 2, 2);
        c.fillStyle = navBlink ? '#ffffff' : 'rgba(255,255,255,0.25)';
        c.fillRect(x - 1, y - 16, 2, 2);
        c.fillStyle = 'rgba(255,255,255,' + (navBlink ? 0.55 : 0.15) + ')';
        c.beginPath(); c.arc(x, y - 15, 5, 0, Math.PI * 2); c.fill();

        /* ── SEARCHLIGHT BEAM when working */
        if (v.phase === 'work' && v.target){
            var tx = v.target.x;
            var ty = v.target.y;
            var beamG = c.createLinearGradient(x, y + 6, tx, ty);
            beamG.addColorStop(0, 'rgba(255,250,200,0.45)');
            beamG.addColorStop(1, 'rgba(255,250,200,0.00)');
            c.fillStyle = beamG;
            c.beginPath();
            c.moveTo(x - 4, y + 6);
            c.lineTo(x + 4, y + 6);
            c.lineTo(tx + 16, ty);
            c.lineTo(tx - 16, ty);
            c.closePath();
            c.fill();
        }
    }

    /* Airborne pass — drawn DIRECTLY to dynC after the destination-over
       composite, so helicopters and their water cascade always render
       above the cars, the missiles, and everything else on screen. */
    function drawReconstructionAirborne(c){
        if (!reconstructOn && reconstructVehicles.length === 0) return;
        for (var i = 0; i < reconstructVehicles.length; i++){
            var v = reconstructVehicles[i];
            if (!v.visible || v.kind !== 'helicopter') continue;

            /* spray particles (water bucket cascade) first so the
               helicopter body draws on top of its own water stream */
            if (v.sprayParticles && v.sprayParticles.length){
                for (var s = 0; s < v.sprayParticles.length; s++){
                    var sp = v.sprayParticles[s];
                    if (sp.kind !== 'mist') continue;
                    var ma = 1 - sp.life / sp.maxLife;
                    c.fillStyle = 'rgba(220,235,250,' + (0.18 * ma).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2); c.fill();
                }
                for (var s2 = 0; s2 < v.sprayParticles.length; s2++){
                    var sp2 = v.sprayParticles[s2];
                    if (sp2.kind !== 'cone') continue;
                    var ca = 1 - sp2.life / sp2.maxLife;
                    c.fillStyle = 'rgba(150,210,255,' + (0.65 * ca).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp2.x, sp2.y, sp2.r, 0, Math.PI * 2); c.fill();
                    if (sp2.life < 200){
                        c.fillStyle = 'rgba(255,255,255,' + (0.5 * ca).toFixed(2) + ')';
                        c.beginPath(); c.arc(sp2.x, sp2.y, sp2.r * 0.5, 0, Math.PI * 2); c.fill();
                    }
                }
                for (var s3 = 0; s3 < v.sprayParticles.length; s3++){
                    var sp3 = v.sprayParticles[s3];
                    if (sp3.kind !== 'jet') continue;
                    var ja = 1 - sp3.life / sp3.maxLife;
                    c.strokeStyle = 'rgba(180,225,255,' + (0.55 * ja).toFixed(2) + ')';
                    c.lineWidth = sp3.r * 1.4;
                    c.lineCap = 'round';
                    c.beginPath();
                    c.moveTo(sp3.x, sp3.y);
                    c.lineTo(sp3.x - sp3.vx * 2, sp3.y - sp3.vy * 2);
                    c.stroke();
                    c.fillStyle = 'rgba(240,250,255,' + (0.95 * ja).toFixed(2) + ')';
                    c.beginPath(); c.arc(sp3.x, sp3.y, sp3.r * 0.9, 0, Math.PI * 2); c.fill();
                }
                c.lineCap = 'butt';
            }

            drawHelicopter(c, v);
        }
    }

    function drawCone(c, co){
        var x = co.x, y = co.y;
        var s = co.size || 1;
        var h = 11 * s;
        /* base (dark mat) */
        c.fillStyle = '#1f2937';
        c.fillRect(x - 5 * s, y, 10 * s, 1.6 * s);
        /* main orange triangle body */
        c.fillStyle = '#ea580c';
        c.beginPath();
        c.moveTo(x, y - h);
        c.lineTo(x - 4 * s, y);
        c.lineTo(x + 4 * s, y);
        c.closePath();
        c.fill();
        /* shaded right side for depth */
        c.fillStyle = 'rgba(0,0,0,0.18)';
        c.beginPath();
        c.moveTo(x, y - h);
        c.lineTo(x + 4 * s, y);
        c.lineTo(x, y);
        c.closePath();
        c.fill();
        /* white reflective bands */
        c.fillStyle = '#ffffff';
        c.fillRect(x - 3.2 * s, y - h * 0.45, 6.4 * s, 1.3 * s);
        c.fillRect(x - 2.4 * s, y - h * 0.72, 4.8 * s, 1.0 * s);
        /* tip highlight */
        c.fillStyle = '#fb923c';
        c.fillRect(x - 0.4 * s, y - h, 0.8 * s, 1.4 * s);
    }

    function drawWorker(c, wk){
        var x = wk.x, y = wk.y;
        var dir = wk.vx >= 0 ? 1 : -1;
        var legSwing = Math.sin(wk.walkPhase) * 2;
        var armSwing = wk.working
                       ? Math.sin(wk.life * 0.012) * 8     /* big hammer swing */
                       : -Math.sin(wk.walkPhase) * 1.6;    /* small walk swing */
        /* shadow */
        c.fillStyle = 'rgba(0,0,0,0.18)';
        c.beginPath(); c.ellipse(x, y, 5, 1.4, 0, 0, Math.PI * 2); c.fill();
        /* body — high-vis shirt */
        c.fillStyle = wk.shirtHue;
        c.fillRect(x - 2.5, y - 11, 5, 6);
        /* high-vis reflective stripes */
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillRect(x - 2.5, y - 9, 5, 0.7);
        c.fillRect(x - 2.5, y - 7, 5, 0.7);
        /* pants */
        c.fillStyle = '#1e293b';
        c.fillRect(x - 2.5, y - 5, 2.2, 5 + legSwing * 0.4);
        c.fillRect(x + 0.3, y - 5, 2.2, 5 - legSwing * 0.4);
        /* boots */
        c.fillStyle = '#0f172a';
        c.fillRect(x - 2.7, y - 1 + legSwing * 0.3, 2.5, 1.3);
        c.fillRect(x + 0.2, y - 1 - legSwing * 0.3, 2.5, 1.3);
        /* head */
        c.fillStyle = '#fcd5b5';
        c.beginPath(); c.arc(x, y - 13, 2.2, 0, Math.PI * 2); c.fill();
        /* hard hat */
        c.fillStyle = 'hsl(' + wk.helmetHue.toFixed(0) + ', 95%, 55%)';
        c.beginPath();
        c.arc(x, y - 14, 2.6, Math.PI, 2 * Math.PI);
        c.closePath(); c.fill();
        /* hat brim */
        c.fillStyle = 'hsl(' + wk.helmetHue.toFixed(0) + ', 95%, 45%)';
        c.fillRect(x - 3, y - 14, 6, 0.8);
        /* arm holding tool */
        c.strokeStyle = wk.shirtHue;
        c.lineWidth = 1.4;
        c.lineCap = 'round';
        var armX = x + dir * 2;
        var armY = y - 9;
        var toolX = armX + dir * (3 + Math.abs(armSwing) * 0.4);
        var toolY = armY + armSwing;
        c.beginPath(); c.moveTo(armX, armY); c.lineTo(toolX, toolY); c.stroke();
        /* tool */
        if (wk.tool === 'wrench'){
            c.strokeStyle = '#94a3b8';
            c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(toolX, toolY); c.lineTo(toolX + dir * 3, toolY - 2); c.stroke();
            c.fillStyle = '#cbd5e1';
            c.fillRect(toolX + dir * 2.5, toolY - 3, 2, 2);
        } else if (wk.tool === 'hammer'){
            c.strokeStyle = '#78350f';
            c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(toolX, toolY); c.lineTo(toolX + dir * 2.4, toolY - 2.2); c.stroke();
            c.fillStyle = '#475569';
            c.fillRect(toolX + dir * 2 - 1, toolY - 3.5, 3, 1.8);
        } else {
            /* pipe */
            c.strokeStyle = '#64748b';
            c.lineWidth = 2;
            c.beginPath(); c.moveTo(toolX, toolY); c.lineTo(toolX + dir * 4, toolY - 0.6); c.stroke();
        }
        c.lineCap = 'butt';
    }

    function drawFireTruck(c, v){
        var x = v.x, y = v.y;
        var dir = (v.vx === 0 && v.target) ? (v.target.x > v.x ? 1 : -1)
                                            : (v.vx >= 0 ? 1 : -1);
        var now = Date.now();
        /* chassis underbody shadow */
        c.fillStyle = 'rgba(0,0,0,0.18)';
        c.beginPath();
        c.ellipse(x, y + 4, 28, 3, 0, 0, Math.PI * 2);
        c.fill();
        /* chassis — red with gradient feel */
        var bodyGrad = c.createLinearGradient(x, y - 14, x, y);
        bodyGrad.addColorStop(0, '#ef4444');
        bodyGrad.addColorStop(0.5, '#dc2626');
        bodyGrad.addColorStop(1, '#7f1d1d');
        c.fillStyle = bodyGrad;
        c.fillRect(x - 24, y - 14, 48, 14);
        /* gold chrome trim */
        c.fillStyle = '#fbbf24';
        c.fillRect(x - 24, y - 5, 48, 1);
        /* equipment lockers */
        c.fillStyle = 'rgba(0,0,0,0.20)';
        c.fillRect(x - 22, y - 11, 8, 5);
        c.fillRect(x - 12, y - 11, 8, 5);
        c.fillRect(x - 2, y - 11, 8, 5);
        c.fillRect(x + 8, y - 11, 8, 5);
        /* cab */
        c.fillStyle = '#b91c1c';
        c.fillRect(x + (dir > 0 ? 9 : -25), y - 22, 16, 8);
        /* cab roof curve */
        c.fillStyle = '#7f1d1d';
        c.fillRect(x + (dir > 0 ? 9 : -25), y - 22, 16, 2);
        /* window — gradient blue (sky reflection) */
        var winGrad = c.createLinearGradient(x, y - 20, x, y - 14);
        winGrad.addColorStop(0, '#dbeafe');
        winGrad.addColorStop(1, '#3b82f6');
        c.fillStyle = winGrad;
        c.fillRect(x + (dir > 0 ? 11 : -23), y - 20, 12, 5);
        /* window frame */
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.strokeRect(x + (dir > 0 ? 11 : -23), y - 20, 12, 5);
        /* deployed water cannon turret on top — rotates toward target */
        var aimAng = 0;
        if (v.phase === 'work' && v.target){
            aimAng = Math.atan2(v.target.y - (y - 18), v.target.x - x);
        }
        c.save();
        c.translate(x, y - 18);
        if (v.phase === 'work'){
            c.rotate(aimAng);
            /* cannon base */
            c.fillStyle = '#374151';
            c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
            /* cannon barrel */
            c.fillStyle = '#1f2937';
            c.fillRect(0, -3, 16, 6);
            /* nozzle */
            c.fillStyle = '#fbbf24';
            c.fillRect(14, -2.5, 4, 5);
            c.fillStyle = '#fde047';
            c.fillRect(16, -1.5, 2, 3);
        }
        c.restore();
        /* ladder on top — yellow rails + rungs (when not in work mode) */
        if (v.phase !== 'work'){
            c.strokeStyle = '#fcd34d';
            c.lineWidth = 1.3;
            c.beginPath(); c.moveTo(x - 20, y - 16); c.lineTo(x + 20, y - 16); c.stroke();
            c.beginPath(); c.moveTo(x - 20, y - 19); c.lineTo(x + 20, y - 19); c.stroke();
            for (var ri = 0; ri < 9; ri++){
                c.beginPath();
                c.moveTo(x - 20 + ri * 5, y - 19);
                c.lineTo(x - 20 + ri * 5, y - 16);
                c.stroke();
            }
        }
        /* hose snaking from cab to cannon during work */
        if (v.phase === 'work'){
            c.strokeStyle = '#dc2626';
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(x + (dir > 0 ? 16 : -16), y - 8);
            c.bezierCurveTo(x, y - 22, x, y - 22, x, y - 18);
            c.stroke();
            c.strokeStyle = '#fbbf24';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(x + (dir > 0 ? 16 : -16), y - 8);
            c.bezierCurveTo(x, y - 22, x, y - 22, x, y - 18);
            c.stroke();
        }
        /* wheels — proper rims + tires + rotation lines */
        c.fillStyle = '#0f172a';
        c.beginPath(); c.arc(x - 15, y + 1, 4.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(x + 15, y + 1, 4.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#94a3b8';
        c.beginPath(); c.arc(x - 15, y + 1, 2.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(x + 15, y + 1, 2.4, 0, Math.PI * 2); c.fill();
        /* spinning hubcap markers */
        var spin = now * 0.02 + x * 0.1;
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(x - 15 + Math.cos(spin) * 2.4, y + 1 + Math.sin(spin) * 2.4);
        c.lineTo(x - 15 - Math.cos(spin) * 2.4, y + 1 - Math.sin(spin) * 2.4);
        c.moveTo(x + 15 + Math.cos(spin) * 2.4, y + 1 + Math.sin(spin) * 2.4);
        c.lineTo(x + 15 - Math.cos(spin) * 2.4, y + 1 - Math.sin(spin) * 2.4);
        c.stroke();
        /* TWIN siren — alternating red/blue with sweeping glow */
        var pulse = (Math.sin(now * 0.018) + 1) * 0.5;
        c.fillStyle = pulse > 0.5 ? '#ef4444' : '#3b82f6';
        c.fillRect(x - 6, y - 26, 5, 3);
        c.fillStyle = pulse > 0.5 ? '#3b82f6' : '#ef4444';
        c.fillRect(x + 1, y - 26, 5, 3);
        /* glow halos */
        c.fillStyle = 'rgba(239,68,68,' + (0.5 * (1 - pulse)).toFixed(2) + ')';
        c.beginPath(); c.arc(x - 3, y - 24, 8, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(59,130,246,' + (0.5 * pulse).toFixed(2) + ')';
        c.beginPath(); c.arc(x + 3, y - 24, 8, 0, Math.PI * 2); c.fill();
        /* small headlight beam when traveling */
        if (v.phase === 'travel' && Math.abs(v.vx) > 0.1){
            c.fillStyle = 'rgba(255,250,200,0.30)';
            c.beginPath();
            c.moveTo(x + dir * 25, y - 11);
            c.lineTo(x + dir * 60, y - 18);
            c.lineTo(x + dir * 60, y - 2);
            c.closePath();
            c.fill();
        }
    }

    function drawTowTruck(c, v){
        var x = v.x, y = v.y;
        var dir = (v.vx === 0 && v.target) ? (v.target.x > v.x ? 1 : -1)
                                            : (v.vx >= 0 ? 1 : -1);
        var now = Date.now();
        /* shadow */
        c.fillStyle = 'rgba(0,0,0,0.18)';
        c.beginPath(); c.ellipse(x, y + 4, 26, 3, 0, 0, Math.PI * 2); c.fill();
        /* chassis — yellow gradient */
        var bg = c.createLinearGradient(x, y - 12, x, y);
        bg.addColorStop(0, '#fde047');
        bg.addColorStop(0.5, '#facc15');
        bg.addColorStop(1, '#a16207');
        c.fillStyle = bg;
        c.fillRect(x - 22, y - 12, 44, 12);
        /* hazard chevron stripes — diagonal */
        c.fillStyle = '#000000';
        for (var st = 0; st < 7; st++){
            c.save();
            c.beginPath();
            c.moveTo(x - 22 + st * 6.5, y - 4);
            c.lineTo(x - 22 + st * 6.5 + 3, y - 4);
            c.lineTo(x - 22 + st * 6.5 + 3 + 4, y);
            c.lineTo(x - 22 + st * 6.5 + 4, y);
            c.closePath();
            c.fill();
            c.restore();
        }
        /* cab */
        c.fillStyle = '#ca8a04';
        c.fillRect(x + (dir > 0 ? 7 : -23), y - 20, 16, 8);
        /* window — sky-reflective gradient */
        var twg = c.createLinearGradient(x, y - 20, x, y - 14);
        twg.addColorStop(0, '#dbeafe');
        twg.addColorStop(1, '#3b82f6');
        c.fillStyle = twg;
        c.fillRect(x + (dir > 0 ? 9 : -21), y - 18, 12, 5);
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.strokeRect(x + (dir > 0 ? 9 : -21), y - 18, 12, 5);
        /* HYDRAULIC TOW BOOM — articulated two-segment arm */
        var hookExtend = v.phase === 'work' ? Math.min(1, v.workT / 700) : 0.30;
        /* pillar */
        c.fillStyle = '#374151';
        c.fillRect(x + (dir > 0 ? 13 : -17), y - 18, 4, 8);
        /* boom segment 1 (rising from pillar) */
        var p1x = x + dir * 15;
        var p1y = y - 18;
        var p2x = x + dir * (20 + 10 * hookExtend);
        var p2y = y - 22 - 8 * hookExtend;
        c.strokeStyle = '#0f172a';
        c.lineWidth = 4;
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(p1x, p1y); c.lineTo(p2x, p2y); c.stroke();
        /* hydraulic piston detail */
        c.strokeStyle = '#94a3b8';
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(p1x, p1y - 2); c.lineTo(p1x + (p2x - p1x) * 0.6, p1y + (p2y - p1y) * 0.6 - 2); c.stroke();
        /* boom segment 2 — extending out toward target */
        var p3x = p2x + dir * (12 + 12 * hookExtend);
        var p3y = p2y + 3 + 8 * hookExtend;
        c.strokeStyle = '#0f172a';
        c.lineWidth = 3.5;
        c.beginPath(); c.moveTo(p2x, p2y); c.lineTo(p3x, p3y); c.stroke();
        /* dangling chain to hook — swings during work */
        var swing = v.phase === 'work' ? Math.sin(now * 0.008) * 4 : 0;
        var chainLen = 8 + 4 * hookExtend;
        var hookX = p3x + swing;
        var hookY = p3y + chainLen;
        c.strokeStyle = '#475569';
        c.lineWidth = 1;
        c.beginPath();
        for (var ch = 0; ch < 5; ch++){
            var cy0 = p3y + (chainLen / 5) * ch;
            var cy1 = p3y + (chainLen / 5) * (ch + 1);
            var cx0 = p3x + (hookX - p3x) * (ch / 5);
            var cx1 = p3x + (hookX - p3x) * ((ch + 1) / 5);
            c.moveTo(cx0, cy0); c.lineTo(cx1, cy1);
        }
        c.stroke();
        /* link dots */
        c.fillStyle = '#1f2937';
        for (var ld = 0; ld <= 5; ld++){
            var lcy = p3y + (chainLen / 5) * ld;
            var lcx = p3x + (hookX - p3x) * (ld / 5);
            c.beginPath(); c.arc(lcx, lcy, 1, 0, Math.PI * 2); c.fill();
        }
        c.lineCap = 'butt';
        /* hook */
        c.fillStyle = '#1f2937';
        c.beginPath();
        c.moveTo(hookX, hookY);
        c.lineTo(hookX + 4, hookY + 1);
        c.lineTo(hookX + 4, hookY + 5);
        c.lineTo(hookX, hookY + 8);
        c.lineTo(hookX - 3, hookY + 5);
        c.closePath();
        c.fill();
        c.fillStyle = '#fbbf24';
        c.fillRect(hookX - 1, hookY, 2, 2);
        /* wheels */
        c.fillStyle = '#0f172a';
        c.beginPath(); c.arc(x - 14, y + 1, 4.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(x + 14, y + 1, 4.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#94a3b8';
        c.beginPath(); c.arc(x - 14, y + 1, 2.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(x + 14, y + 1, 2.4, 0, Math.PI * 2); c.fill();
        var spin2 = now * 0.022 + x * 0.13;
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(x - 14 + Math.cos(spin2) * 2.4, y + 1 + Math.sin(spin2) * 2.4);
        c.lineTo(x - 14 - Math.cos(spin2) * 2.4, y + 1 - Math.sin(spin2) * 2.4);
        c.moveTo(x + 14 + Math.cos(spin2) * 2.4, y + 1 + Math.sin(spin2) * 2.4);
        c.lineTo(x + 14 - Math.cos(spin2) * 2.4, y + 1 - Math.sin(spin2) * 2.4);
        c.stroke();
        /* amber strobe — alternates with halo */
        var blink2 = Math.sin(now * 0.028) > 0;
        c.fillStyle = blink2 ? '#fbbf24' : '#f97316';
        c.fillRect(x - 2, y - 26, 4, 3);
        c.fillStyle = blink2 ? 'rgba(251,191,36,0.55)' : 'rgba(249,115,22,0.55)';
        c.beginPath(); c.arc(x, y - 24, 8, 0, Math.PI * 2); c.fill();
        /* headlight when traveling */
        if (v.phase === 'travel' && Math.abs(v.vx) > 0.1){
            c.fillStyle = 'rgba(255,245,180,0.32)';
            c.beginPath();
            c.moveTo(x + dir * 22, y - 11);
            c.lineTo(x + dir * 56, y - 18);
            c.lineTo(x + dir * 56, y - 4);
            c.closePath(); c.fill();
        }
    }

    function drawCrane(c, v){
        var x = v.x, y = v.y;
        var now = Date.now();
        /* shadow */
        c.fillStyle = 'rgba(0,0,0,0.20)';
        c.beginPath(); c.ellipse(x, y + 4, 26, 3, 0, 0, Math.PI * 2); c.fill();
        /* TANK TRACKS — animated tread pattern */
        c.fillStyle = '#1f2937';
        c.fillRect(x - 20, y - 1, 40, 5);
        c.fillStyle = '#0f172a';
        var trackOff = (v.phase === 'travel') ? (now * 0.08) % 6 : 0;
        for (var t = 0; t < 11; t++){
            c.fillRect(x - 20 + ((t * 4 + trackOff) % 44) - 2, y, 2, 4);
        }
        /* roller wheels inside tracks */
        c.fillStyle = '#475569';
        for (var rw = 0; rw < 4; rw++){
            c.beginPath();
            c.arc(x - 15 + rw * 10, y + 1.5, 2, 0, Math.PI * 2);
            c.fill();
        }
        /* chassis — yellow gradient */
        var cg = c.createLinearGradient(x, y - 13, x, y);
        cg.addColorStop(0, '#fde047');
        cg.addColorStop(0.6, '#facc15');
        cg.addColorStop(1, '#a16207');
        c.fillStyle = cg;
        c.fillRect(x - 17, y - 13, 34, 12);
        /* black trim line */
        c.fillStyle = '#1f2937';
        c.fillRect(x - 17, y - 6, 34, 1.5);
        /* cab — rotates with the arm */
        c.fillStyle = '#f59e0b';
        c.fillRect(x - 8, y - 22, 16, 9);
        /* window — sky-reflective */
        var wg = c.createLinearGradient(x, y - 22, x, y - 16);
        wg.addColorStop(0, '#dbeafe');
        wg.addColorStop(1, '#1d4ed8');
        c.fillStyle = wg;
        c.fillRect(x - 6, y - 20, 12, 6);
        c.strokeStyle = '#1f2937';
        c.lineWidth = 0.8;
        c.strokeRect(x - 6, y - 20, 12, 6);
        /* counterweight on back */
        c.fillStyle = '#1f2937';
        c.fillRect(x - 17, y - 19, 7, 7);
        c.fillStyle = '#fbbf24';
        c.fillRect(x - 16, y - 18, 5, 1.5);
        c.fillRect(x - 16, y - 14, 5, 1.5);
        /* CRANE ARM — rotates + swings during work */
        var pivotX = x + 4, pivotY = y - 22;
        var swingT = v.phase === 'work' ? v.workT * 0.003 : 0;
        var armAngle = -Math.PI / 3 + Math.sin(swingT) * 0.35;
        var armLen   = 50;
        var armEndX  = pivotX + Math.cos(armAngle) * armLen;
        var armEndY  = pivotY + Math.sin(armAngle) * armLen;
        /* main boom — fat yellow */
        c.strokeStyle = '#facc15';
        c.lineWidth = 5;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(pivotX, pivotY);
        c.lineTo(armEndX, armEndY);
        c.stroke();
        /* outer boom outline */
        c.strokeStyle = '#a16207';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(pivotX, pivotY);
        c.lineTo(armEndX, armEndY);
        c.stroke();
        /* INDUSTRIAL LATTICE — proper cross-bracing pattern */
        c.strokeStyle = '#7c2d12';
        c.lineWidth = 0.7;
        for (var seg = 0; seg < 8; seg++){
            var f  = seg / 8;
            var f2 = (seg + 1) / 8;
            var midX = pivotX + (armEndX - pivotX) * (f + f2) * 0.5;
            var midY = pivotY + (armEndY - pivotY) * (f + f2) * 0.5;
            /* perpendicular offset */
            var perpDX = -(armEndY - pivotY) / armLen * 2.5;
            var perpDY =  (armEndX - pivotX) / armLen * 2.5;
            c.beginPath();
            c.moveTo(pivotX + (armEndX - pivotX) * f + perpDX,
                     pivotY + (armEndY - pivotY) * f + perpDY);
            c.lineTo(pivotX + (armEndX - pivotX) * f2 - perpDX,
                     pivotY + (armEndY - pivotY) * f2 - perpDY);
            c.stroke();
            c.beginPath();
            c.moveTo(pivotX + (armEndX - pivotX) * f - perpDX,
                     pivotY + (armEndY - pivotY) * f - perpDY);
            c.lineTo(pivotX + (armEndX - pivotX) * f2 + perpDX,
                     pivotY + (armEndY - pivotY) * f2 + perpDY);
            c.stroke();
        }
        c.lineCap = 'butt';
        /* boom tip pulley */
        c.fillStyle = '#1f2937';
        c.beginPath(); c.arc(armEndX, armEndY, 2.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#94a3b8';
        c.beginPath(); c.arc(armEndX, armEndY, 1.2, 0, Math.PI * 2); c.fill();
        /* dangling cable + hook block + payload */
        var dangle = v.phase === 'work' ? 12 + Math.sin(v.workT * 0.006) * 10 : 8;
        c.strokeStyle = '#374151';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(armEndX, armEndY);
        c.lineTo(armEndX, armEndY + dangle);
        c.stroke();
        /* HOOK BLOCK — squared with crossbar */
        c.fillStyle = '#1e293b';
        c.fillRect(armEndX - 3.5, armEndY + dangle, 7, 5);
        c.fillStyle = '#475569';
        c.fillRect(armEndX - 3.5, armEndY + dangle + 1, 7, 1);
        /* if working, dangle a SUSPENDED BUILDING BLOCK from the hook */
        if (v.phase === 'work'){
            var bxL = armEndX - 8, byL = armEndY + dangle + 5;
            /* girder/block being placed */
            c.fillStyle = '#94a3b8';
            c.fillRect(bxL, byL, 16, 6);
            c.fillStyle = '#475569';
            c.fillRect(bxL, byL, 16, 1.5);
            c.fillRect(bxL, byL + 4.5, 16, 1.5);
            /* rivet dots */
            c.fillStyle = '#1f2937';
            for (var rv = 0; rv < 4; rv++){
                c.beginPath();
                c.arc(bxL + 2 + rv * 4, byL + 3, 0.7, 0, Math.PI * 2);
                c.fill();
            }
        }
        /* PIVOT base detail */
        c.fillStyle = '#1f2937';
        c.beginPath(); c.arc(pivotX, pivotY, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fbbf24';
        c.beginPath(); c.arc(pivotX, pivotY, 2, 0, Math.PI * 2); c.fill();
        /* warning strobe */
        var blink3 = Math.sin(now * 0.022 + x * 0.1) > 0;
        c.fillStyle = blink3 ? '#facc15' : '#fde047';
        c.fillRect(pivotX - 2, pivotY - 5, 4, 2);
        c.fillStyle = blink3 ? 'rgba(250,204,21,0.55)' : 'rgba(253,224,71,0.55)';
        c.beginPath(); c.arc(pivotX, pivotY - 4, 6, 0, Math.PI * 2); c.fill();
        /* headlight when traveling */
        if (v.phase === 'travel' && Math.abs(v.vx) > 0.1){
            var dirC = v.vx >= 0 ? 1 : -1;
            c.fillStyle = 'rgba(255,250,200,0.30)';
            c.beginPath();
            c.moveTo(x + dirC * 18, y - 10);
            c.lineTo(x + dirC * 50, y - 16);
            c.lineTo(x + dirC * 50, y - 2);
            c.closePath(); c.fill();
        }
    }

    /* ─── Cap auto-attack / auto-defence at AUTO_MAX_DURATION ─── */
    function updateAutoTimers(){
        var now = (typeof performance !== 'undefined' && performance.now)
                  ? performance.now() : Date.now();
        if (autoAttackOn && (now - autoAttackStartT) > AUTO_MAX_DURATION){
            autoAttackOn = false;
            autoAttackTimer = 0;
            var aBtn = document.getElementById('ttAttackAutoBtn');
            if (aBtn){
                aBtn.setAttribute('aria-pressed', 'false');
                aBtn.classList.remove('on');
                aBtn.textContent = 'OFF';
            }
            startReconstruction();
        }
        if (autoDefenceOn && (now - autoDefenceStartT) > AUTO_MAX_DURATION){
            autoDefenceOn = false;
            autoDefenceTimer = 0;
            var dBtn = document.getElementById('ttDefenceAutoBtn');
            if (dBtn){
                dBtn.setAttribute('aria-pressed', 'false');
                dBtn.classList.remove('on');
                dBtn.textContent = 'OFF';
            }
            startReconstruction();
        }
    }

    /* ─── Public window API ──────────────────────────────────── */
    window.startReconstruction = startReconstruction;
    window.stopReconstruction  = stopReconstruction;
    window.isReconstructing    = function(){ return reconstructOn; };
    window.getReconstructionTimer = function(){
        /* No fixed timer anymore — return elapsed time so the widget
           tooltip can show how long the rebuild has been running. */
        if (!reconstructOn) return 0;
        var now = (typeof performance !== 'undefined' && performance.now)
                  ? performance.now() : Date.now();
        return now - reconstructStartedAt;
    };
    window.getReconstructionDamage = function(){
        return reconstructOn ? damageCount() : 0;
    };
    window.toggleReconstruction = function(){
        if (reconstructOn) { stopReconstruction(); return false; }
        startReconstruction();
        return true;
    };
    /* slow ↔ fast control. `m` ∈ [0.1, 5] — values < 1 slow the rebuild
       down (more time to admire animations), values > 1 speed it up. */
    window.setReconstructionSpeed = function(m){
        var v = parseFloat(m);
        if (isNaN(v)) return;
        reconstructSpeed = Math.max(0.1, Math.min(5, v));
    };
    window.getReconstructionSpeed = function(){ return reconstructSpeed; };
    /* Instant rebuild — completes the current cycle right now. */
    window.completeReconstructionNow = function(){
        if (!reconstructOn){
            /* nothing in flight; just clear any leftover damage anyway */
            finalizeReconstruction();
            return false;
        }
        finalizeReconstruction();
        return true;
    };

    /* Wrap setAutoAttackEnabled / setAutoDefenceEnabled to record
       the start time and to auto-trigger reconstruction on turn-off. */
    var _origSetAutoAttack = window.setAutoAttackEnabled;
    window.setAutoAttackEnabled = function(on){
        if (on){
            autoAttackStartT = (typeof performance !== 'undefined' && performance.now)
                               ? performance.now() : Date.now();
        }
        _origSetAutoAttack(on);
        if (!on) startReconstruction();
    };
    var _origSetAutoDefence = window.setAutoDefenceEnabled;
    window.setAutoDefenceEnabled = function(on){
        if (on){
            autoDefenceStartT = (typeof performance !== 'undefined' && performance.now)
                                ? performance.now() : Date.now();
        }
        _origSetAutoDefence(on);
        if (!on) startReconstruction();
    };

    /* Manual attack / defence toggles also trigger reconstruction
       when turning OFF. armMissile() / toggleDefenceMode() are the
       toggle functions on those widgets. */
    var _origArm = window.armMissile;
    if (typeof _origArm === 'function'){
        window.armMissile = function(){
            var wasArmed = !!missileArmed;
            var r = _origArm.apply(this, arguments);
            if (wasArmed && !missileArmed) startReconstruction();
            return r;
        };
    }
    var _origTogDef = window.toggleDefenceMode;
    if (typeof _origTogDef === 'function'){
        window.toggleDefenceMode = function(){
            var wasDM = !!defenceMode;
            var r = _origTogDef.apply(this, arguments);
            if (wasDM && !defenceMode) startReconstruction();
            return r;
        };
    }

    /* hook update + draw into the existing loop */
    var _origUpd = updateParticles;
    updateParticles = function(dt){
        _origUpd(dt);
        updateMissileSystem(dt);
        updateAutoSliders(dt);
        updateAutoTimers();
        updateReconstruction(dt);
    };
    /* Offscreen buffer used to composite the reconstruction layer
       BEHIND the existing dynamic content. _origDrw clears dynC at
       its start, so drawing reconstruction before it would just be
       erased. Instead we let _origDrw draw cars/pedestrians as usual,
       then paint reconstruction onto an offscreen canvas (preserving
       its internal layer order), then blit that buffer onto dynC with
       `destination-over` so the buffer only fills pixels NOT already
       occupied by cars → cars visibly drive over the rebuild scene. */
    var rcnBuffer = null;
    function ensureRcnBuffer(){
        if (!rcnBuffer){
            rcnBuffer = document.createElement('canvas');
        }
        if (rcnBuffer.width !== W || rcnBuffer.height !== H){
            rcnBuffer.width = W;
            rcnBuffer.height = H;
        }
        return rcnBuffer;
    }
    function reconstructionHasAnyContent(){
        return reconstructOn ||
               reconstructVehicles.length > 0 ||
               reconstructFX.length > 0 ||
               reconstructWorkers.length > 0 ||
               reconstructGhosts.length > 0 ||
               reconstructCones.length > 0;
    }

    var _origDrw = drawDynamic;
    drawDynamic = function(){
        _origDrw();
        if (reconstructionHasAnyContent()){
            var buf = ensureRcnBuffer();
            var rc  = buf.getContext('2d');
            rc.clearRect(0, 0, W, H);
            drawReconstruction(rc);              /* ground pass to buffer (helis skipped) */
            dynC.save();
            dynC.globalCompositeOperation = 'destination-over';
            dynC.drawImage(buf, 0, 0);            /* composite BEHIND cars */
            dynC.restore();
        }
        drawMissileSystem(dynC);
        /* Helicopters last — drawn directly on dynC so they sit on TOP
           of cars, missiles, and the entire reconstruction scene. */
        drawReconstructionAirborne(dynC);
    };
})();
