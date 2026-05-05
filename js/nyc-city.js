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
        { type:'aurora',    sky0:'#4a5a60', sky1:'#7c909c' }
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

    function buildBgBuildings() {
        BGBUILDS = [];
        for (var i = 0; i < 90; i++) {
            var type  = BLD_TYPES[rngI(0,BLD_TYPES.length)];
            var flH   = (type==='brownstone'||type==='industrial') ? rngI(14,20) : rngI(10,16);
            var floors= (type==='brownstone') ? rngI(3,6)  :
                        (type==='industrial') ? rngI(3,6)  :
                        (type==='prewar')     ? rngI(8,15) :
                        (type==='artdeco')    ? rngI(10,19):
                                               rngI(18,32);
            var bw    = (type==='glass')      ? rngI(30,60) :
                        (type==='brownstone') ? rngI(20,34) : rngI(22,54);
            var bh    = floors * flH;
            var shade = (type==='glass') ? rngI(10,20) : rngI(12,26);
            var nc    = NEON_COLORS[rngI(0,NEON_COLORS.length)];
            BGBUILDS.push({
                x:      rng(-30, W+30),
                w:      bw,
                h:      bh,
                floors: floors,
                flH:    flH,
                type:   type,
                shade:  shade,
                wins:   genWins(floors * Math.max(1,Math.floor(bw/9))),
                hasNeon:   rng(0,1) < 0.22,
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

        /* facade */
        if (b.type === 'glass') {
            var gf = c.createLinearGradient(x, by, x+bw, by);
            gf.addColorStop(0, 'rgb('+s+','+(s+4)+','+(s+18)+')');
            gf.addColorStop(0.4, 'rgb('+(s+6)+','+(s+10)+','+(s+24)+')');
            gf.addColorStop(1, 'rgb('+s+','+(s+2)+','+(s+14)+')');
            c.fillStyle = gf;
        } else {
            c.fillStyle = 'rgb('+s+','+s+','+Math.min(255,s+6)+')';
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
            /* stepped top */
            c.fillStyle = 'rgba(255,255,255,0.06)';
            c.fillRect(x+bw*0.15, by-5, bw*0.70, 5);
            c.fillRect(x+bw*0.30, by-9, bw*0.40, 4);
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

    /* ══════════════════════════════════════════════
       LANDMARK CONFIG
    ══════════════════════════════════════════════ */

    function buildLandmarks() {
        LM=[
            { fn:drawStatueOfLiberty, x:W*0.06, wins:null        },
            { fn:drawBrooklynBridge,  x:W*0.20, wins:null        },
            { fn:drawFlatiron,        x:W*0.36, wins:genWins(21) },
            { fn:drawRockCenter,      x:W*0.50, wins:genWins(54) },
            { fn:drawEmpireState,     x:W*0.63, wins:genWins(88) },
            { fn:drawChrysler,        x:W*0.76, wins:genWins(63) },
            { fn:drawOneWTC,          x:W*0.89, wins:genWins(50) }
        ];
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

    function initEvent(type) {
        particles=[]; splashes=[];
        floodY=GROUND; floodRising=(type==='flood');
        tSwayT=0; tX=W*0.5;
        ltTimer=0; ltActive=false; ltFlash=0; ltPts=[];
        eqShakeX=0; eqShakeY=0; eqTimer=0;
        meteorTrails=[];
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
        /* seed meteors */
        if(type==='meteor') {
            for(var m=0;m<12;m++) meteorTrails.push(makeMeteor());
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

        /* ESB rotating colored beacon */
        var esbX=W*0.63;
        var esbY=GROUND-H*0.55*0.88;
        esbAngle+=0.008;
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
        /* opposite beam */
        var bx2=esbX+Math.cos(esbAngle+Math.PI)*beamLen;
        var by2=esbY+Math.sin(esbAngle+Math.PI)*beamLen*0.3;
        var bg3=dynC.createLinearGradient(esbX,esbY,bx2,by2);
        bg3.addColorStop(0,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0.55)');
        bg3.addColorStop(1,'rgba('+bc2[0]+','+bc2[1]+','+bc2[2]+',0)');
        dynC.strokeStyle=bg3; dynC.lineWidth=3;
        dynC.beginPath(); dynC.moveTo(esbX,esbY); dynC.lineTo(bx2,by2); dynC.stroke();
        radialGlow(dynC, esbX,esbY, 22, bc2[0],bc2[1],bc2[2], 0.50);

        /* vehicles and pedestrians */
        for(var vi=0;vi<vehicles.length;vi++) drawVehicle(dynC,vehicles[vi]);
        drawPeds(dynC);
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
    buildLandmarks();
    initVehicles();
    initPeds();
    initEvent(EVENTS[0].type);

    window.addEventListener('resize',function(){
        resize();
        buildBgBuildings();
        buildLandmarks();
        cityBuilt=false;
    });

    animId=requestAnimationFrame(tick);
})();
