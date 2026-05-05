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
        { type:'nebula',    sky0:'#0a0218', sky1:'#180830' }
    ];
    var eventIndex = 0, eventTimer = 0, EVENT_DURATION = 12000;

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

        /* sky */
        var sky=bgC.createLinearGradient(0,0,0,GROUND);
        sky.addColorStop(0,ev.sky0); sky.addColorStop(1,ev.sky1);
        bgC.fillStyle=sky; bgC.fillRect(0,0,W,H);

        /* sun disk — clear sky */
        if(ev.type==='clear') {
            radialGlow(bgC, W*0.82,H*0.12, 90, 255,240,180, 0.30);
            radialGlow(bgC, W*0.82,H*0.12, 44, 255,250,210, 0.55);
            bgC.fillStyle='rgba(255,252,230,0.98)';
            bgC.beginPath(); bgC.arc(W*0.82,H*0.12,22,0,Math.PI*2); bgC.fill();
        }

        /* overcast cloud wisps */
        if(ev.type==='snow'||ev.type==='blizzard'||ev.type==='rain') {
            bgC.fillStyle='rgba(255,255,255,0.22)';
            for(var ci=0;ci<6;ci++) {
                var cx2=(ci*W/5.5+40)%W, cy2=H*0.08+ci*H*0.03;
                bgC.beginPath(); bgC.ellipse(cx2,cy2,80+ci*20,18+ci*4,0,0,Math.PI*2); bgC.fill();
            }
        }

        /* heat glow disk */
        if(ev.type==='heat') {
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
            lit: rng(0,1)<0.75,
            col: (type==='sedan') ? SEDAN_COLS[rngI(0,SEDAN_COLS.length)] : null,
            lightPhase: rng(0,Math.PI*2)
        };
    }

    function initVehicles() {
        vehicles=[];
        for(var i=0;i<22;i++) vehicles.push(makeVehicle());
    }

    function updateVehicles(dt) {
        for(var i=0;i<vehicles.length;i++) {
            var v=vehicles[i];
            v.x+=v.dir*v.speed*dt*0.055;
            v.lightPhase+=dt*0.005;
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
        var by  = GROUND + rdH*0.10;        /* body bottom */
        var wy  = by + wr*0.52;             /* wheel centre (half-embedded) */
        var d   = v.dir, x = v.x;

        if (v.type==='taxi') {
            var p = carProfile(c,x,by,d, s*0.96,s*0.96, s*0.42,s*0.46,
                               s*0.28,s*0.30, s*0.16,s*0.14,
                               '#f5c518','rgba(150,210,245,0.62)','#b89000');
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
                               v.col,'rgba(140,200,238,0.58)','rgba(0,0,0,0.36)');
            c.fillStyle='#fffce0'; c.fillRect(Math.min(p.xF,p.xF-d*2),by-s*0.26,2,s*0.16);
            if(v.lit) radialGlow(c,p.xF+d*2,by-s*0.18,s*0.78,255,248,200,0.28);
            c.fillStyle='#ff1000'; c.fillRect(Math.min(p.xR,p.xR+d*2),by-s*0.28,2,s*0.16);
            drawWheel(c, x+d*s*0.48, wy, wr);
            drawWheel(c, x-d*s*0.48, wy, wr);

        } else if (v.type==='nypd') {
            var p = carProfile(c,x,by,d, s*0.94,s*0.94, s*0.40,s*0.44,
                               s*0.26,s*0.30, s*0.15,s*0.13,
                               '#141418','rgba(110,175,215,0.55)','rgba(0,0,0,0.50)');
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
            c.fillStyle='rgba(120,185,235,0.68)';
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
        for(var i=0;i<28;i++) {
            peds.push({
                x:   rng(0,W),
                dir: rngI(0,2)===0?1:-1,
                speed:rng(0.22,0.65),
                t:   rng(0,Math.PI*2),
                coat:rngI(0,5),
                row: rngI(0,2) /* sidewalk row variation */
            });
        }
    }

    function updatePeds(dt) {
        for(var i=0;i<peds.length;i++) {
            var p=peds[i];
            p.x+=p.dir*p.speed*dt*0.038;
            p.t+=dt*0.003;
            if(p.x>W+20) p.x=-20;
            if(p.x<-20)  p.x=W+20;
        }
    }

    function drawPeds(c) {
        var rdH=H-GROUND;
        var COATS=['#c8cce0','#e0e4f0','#8898b0','#a0a8c0','#e8d0b0'];
        for(var i=0;i<peds.length;i++) {
            var p=peds[i];
            var rowOff=p.row*6;
            var pedY=GROUND+rdH*0.58+rowOff;
            var swing=Math.sin(p.t*4.5)*3;
            var col=COATS[p.coat];
            c.fillStyle=col;
            c.fillRect(p.x-2, pedY-13, 4, 8);
            c.beginPath(); c.arc(p.x,pedY-16,3,0,Math.PI*2); c.fill();
            c.strokeStyle=col; c.lineWidth=1.4;
            c.beginPath(); c.moveTo(p.x,pedY-5); c.lineTo(p.x-2+swing,pedY); c.stroke();
            c.beginPath(); c.moveTo(p.x,pedY-5); c.lineTo(p.x+2-swing,pedY); c.stroke();
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
        var type=EVENTS[eventIndex].type;
        var i,p;

        if(type==='flood'&&floodRising&&floodY>GROUND-H*0.26) floodY-=0.065*k;
        if(type==='tornado'){tSwayT+=0.0010*dt;tX=W*0.5+Math.sin(tSwayT)*W*0.20;}
        if(type==='earthquake'){eqTimer+=dt; eqShakeX=Math.sin(eqTimer*0.18)*8*(1-Math.min(1,eqTimer/8000)); eqShakeY=Math.cos(eqTimer*0.24)*5*(1-Math.min(1,eqTimer/8000));}
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
       DYNAMIC LAYER
    ══════════════════════════════════════════════ */

    function drawDynamic() {
        dynC.clearRect(0,0,W,H);
        var type=EVENTS[eventIndex].type;
        var i,p;

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

        /* vehicles and pedestrians */
        for(var vi=0;vi<vehicles.length;vi++) drawVehicle(dynC,vehicles[vi]);
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

    function tick(ts) {
        if(!lastTime) lastTime=ts;
        var dt=Math.min(ts-lastTime,50);
        lastTime=ts;

        eventTimer+=dt;
        if(eventTimer>=EVENT_DURATION){
            eventTimer=0;
            eventIndex=(eventIndex+1)%EVENTS.length;
            initEvent(EVENTS[eventIndex].type);
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
                airplane.switched=true;
            }
            if(airplane.x>W+200||airplane.x<-200) airplane=null;
        }
        if(cityLabelTimer>0) cityLabelTimer-=dt;

        drawBg();
        drawCity();
        drawDynamic();

        ctx.clearRect(0,0,W,H);
        ctx.drawImage(bgCvs,0,0);
        ctx.drawImage(cityCvs,0,0);
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
    initEvent(EVENTS[0].type);

    window.addEventListener('resize',function(){
        resize();
        buildBgBuildings();
        buildStarField();
        buildLandmarks();
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
        if(btn) btn.setAttribute('title','Fly to '+CITIES[next].name);
    };
    window.getCityName=function(){ return CITIES[currentCityIndex].name; };
    window.getNextCityName=function(){ return CITIES[(currentCityIndex+1)%CITIES.length].name; };
})();
