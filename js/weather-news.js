(function () {
    var canvas = document.getElementById('weather-canv');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var bgCvs = document.createElement('canvas'), bgC = bgCvs.getContext('2d');
    var cityCvs = document.createElement('canvas'), cityC = cityCvs.getContext('2d');
    var dynCvs = document.createElement('canvas'), dynC = dynCvs.getContext('2d');
    var hudCvs = document.createElement('canvas'), hudC = hudCvs.getContext('2d');

    var W, H, GROUND, animId;
    var tickerWidth = 0;

    var MONTHS = [
        { name: 'JANUARY',   high: 40, low: 26, severity: 0.9,  condition: 'blizzard',  headline: 'BLIZZARD WARNING: Up to 18 inches of snow expected overnight — NYC declares emergency' },
        { name: 'FEBRUARY',  high: 43, low: 28, severity: 0.75, condition: 'snowwind',  headline: 'WIND ADVISORY: Gusts up to 45 mph — Travel hazardous on bridges and highways' },
        { name: 'MARCH',     high: 52, low: 36, severity: 0.5,  condition: 'coldrain',  headline: 'FLOODING ALERT: Heavy rain causes street flooding in Lower Manhattan' },
        { name: 'APRIL',     high: 62, low: 45, severity: 0.65, condition: 'thunder',   headline: 'SEVERE THUNDERSTORM WATCH: Lightning and hail possible across all five boroughs' },
        { name: 'MAY',       high: 73, low: 55, severity: 0.3,  condition: 'warmrain',  headline: 'WARM FRONT ARRIVES: Highs reach 73°F — Light showers expected through the weekend' },
        { name: 'JUNE',      high: 82, low: 64, severity: 0.6,  condition: 'heat',      shimmer: 0.6,  headline: 'HEAT ADVISORY: Dangerous heat indices — Cooling centers open across the city' },
        { name: 'JULY',      high: 85, low: 70, severity: 0.95, condition: 'extremeheat', shimmer: 0.95, headline: 'EXCESSIVE HEAT WARNING: Record highs of 98°F forecast — Stay hydrated' },
        { name: 'AUGUST',    high: 84, low: 69, severity: 0.8,  condition: 'stormheat', headline: 'TROPICAL STORM REMNANTS: Heavy rainfall and gusty winds through Tuesday' },
        { name: 'SEPTEMBER', high: 76, low: 62, severity: 0.55, condition: 'tropical',  headline: 'HURRICANE SEASON ACTIVE: Category 2 storm 300 miles offshore — Monitoring closely' },
        { name: 'OCTOBER',   high: 65, low: 51, severity: 0.4,  condition: 'windleaves', headline: 'HIGH WIND WATCH: Winds 25–40 mph — Expect delays at all metro airports' },
        { name: 'NOVEMBER',  high: 54, low: 41, severity: 0.6,  condition: 'frost',     headline: 'FROST ADVISORY: First freeze of the season — Protect sensitive plants overnight' },
        { name: 'DECEMBER',  high: 44, low: 32, severity: 0.85, condition: 'snowstorm', headline: 'WINTER STORM WARNING: 12–18 inches of snow — All subway lines on weather delay' }
    ];

    var MONTH_DURATION = 10000;
    var monthIndex = 0;
    var monthTimer = 0;
    var lastTime = 0;
    var tickerX = 0;
    var lightningTimer = 0;
    var lightningFlash = 0;
    var lightningX = 0;
    var frosted = false;
    var wipeActive = false;
    var wipeStart = 0;
    var WIPE_DURATION = 400;
    var pendingMonth = -1;

    var snowParticles = [];
    var rainParticles = [];
    var windStreaks = [];
    var leafParticles = [];
    var hurricaneParticles = [];

    var MAX_SNOW_BLIZ = 200;
    var MAX_SNOW_LIGHT = 80;
    var MAX_RAIN = 300;
    var MAX_WIND = 50;
    var MAX_LEAVES = 30;
    var MAX_HURRICANE = 60;

    var BUILDING_DEFS = [];

    function rng(min, max) {
        return min + Math.random() * (max - min);
    }

    function rngInt(min, max) {
        return Math.floor(rng(min, max + 1));
    }

    function resize() {
        var cw = canvas.offsetWidth || (canvas.parentElement && canvas.parentElement.offsetWidth) || 800;
        var ch = canvas.offsetHeight || (canvas.parentElement && canvas.parentElement.offsetHeight) || 450;
        if (cw <= 0) cw = 800;
        if (ch <= 0) ch = 450;
        W = canvas.width = bgCvs.width = cityCvs.width = dynCvs.width = hudCvs.width = cw;
        H = canvas.height = bgCvs.height = cityCvs.height = dynCvs.height = hudCvs.height = ch;
        GROUND = H * 0.82;
        buildBuildingDefs();
    }

    function buildBuildingWindows(b) {
        var wins = [];
        for (var j = 0; j < 20; j++) {
            wins.push({
                wx: b.x + rng(4, Math.max(5, b.w - 12)),
                wy: b.y + rng(8, Math.max(9, b.h - 12)),
                ww: 6,
                wh: 4
            });
        }
        return wins;
    }

    function buildBuildingDefs() {
        BUILDING_DEFS = [];
        var x = 0;
        var widths = [60, 80, 45, 100, 70, 55, 90, 50, 120, 65, 75, 85, 40, 95, 60];
        var heightRatios = [0.55, 0.45, 0.62, 0.35, 0.58, 0.40, 0.65, 0.30, 0.50, 0.48, 0.60, 0.38, 0.42, 0.52, 0.44];
        for (var i = 0; i < widths.length; i++) {
            var bw = widths[i];
            var bh = H * heightRatios[i];
            var bd = { x: x, w: bw, h: bh, y: GROUND - bh };
            bd.windows = buildBuildingWindows(bd);
            BUILDING_DEFS.push(bd);
            x += bw;
            if (x > W) break;
        }
        while (x < W) {
            var bw2 = rngInt(40, 120);
            var bh2 = H * rng(0.2, 0.65);
            var bd2 = { x: x, w: bw2, h: bh2, y: GROUND - bh2 };
            bd2.windows = buildBuildingWindows(bd2);
            BUILDING_DEFS.push(bd2);
            x += bw2;
        }
    }

    function drawBg() {
        bgC.clearRect(0, 0, W, H);
        bgC.fillStyle = '#000000';
        bgC.fillRect(0, 0, W, H);

        var grad = bgC.createLinearGradient(0, H * 0.4, 0, H * 0.7);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(40,40,40,0.4)');
        bgC.fillStyle = grad;
        bgC.fillRect(0, H * 0.4, W, H * 0.3);

        bgC.fillStyle = '#1a1a1a';
        var distantBuildings = [
            { x: W * 0.05, w: 60, h: H * 0.12 },
            { x: W * 0.12, w: 90, h: H * 0.09 },
            { x: W * 0.22, w: 50, h: H * 0.14 },
            { x: W * 0.30, w: 110, h: H * 0.10 },
            { x: W * 0.42, w: 70, h: H * 0.11 },
            { x: W * 0.55, w: 85, h: H * 0.13 },
            { x: W * 0.65, w: 55, h: H * 0.08 },
            { x: W * 0.74, w: 95, h: H * 0.12 },
            { x: W * 0.85, w: 65, h: H * 0.10 },
            { x: W * 0.93, w: 75, h: H * 0.11 }
        ];
        var horizY = H * 0.55;
        for (var i = 0; i < distantBuildings.length; i++) {
            var db = distantBuildings[i];
            bgC.fillRect(db.x, horizY - db.h, db.w, db.h);
        }
    }

    function drawCity(addFrost) {
        cityC.clearRect(0, 0, W, H);

        cityC.fillStyle = '#111111';
        cityC.fillRect(0, GROUND, W, H - GROUND);

        for (var i = 0; i < BUILDING_DEFS.length; i++) {
            var b = BUILDING_DEFS[i];
            cityC.fillStyle = '#000000';
            cityC.fillRect(b.x, b.y, b.w, b.h);
            cityC.strokeStyle = '#ffffff';
            cityC.lineWidth = 1;
            cityC.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

            if (b.w > 60 && b.h > H * 0.35) {
                cityC.fillStyle = '#ffffff';
                cityC.fillRect(b.x + b.w / 2 - 1, b.y - 20, 2, 20);
            }

            if (b.w > 70) {
                cityC.strokeStyle = '#888888';
                cityC.lineWidth = 1;
                cityC.beginPath();
                cityC.arc(b.x + b.w * 0.25, b.y + 4, 5, 0, Math.PI * 2);
                cityC.stroke();
                cityC.beginPath();
                cityC.arc(b.x + b.w * 0.75, b.y + 4, 3, 0, Math.PI * 2);
                cityC.stroke();
            }
        }

        var windowColors = ['rgba(255,255,200,0.8)', 'rgba(255,255,255,0.6)', 'rgba(200,220,255,0.5)'];
        for (var j = 0; j < BUILDING_DEFS.length; j++) {
            var bb = BUILDING_DEFS[j];
            if (!bb || !bb.windows) continue;
            for (var wj = 0; wj < bb.windows.length; wj++) {
                var win = bb.windows[wj];
                cityC.fillStyle = windowColors[wj % windowColors.length];
                cityC.fillRect(win.wx, win.wy, win.ww, win.wh);
            }
        }

        if (addFrost) {
            var frostPoints = [];
            for (var k = 0; k < 15; k++) {
                var fIdx = rngInt(0, BUILDING_DEFS.length - 1);
                var fb = BUILDING_DEFS[fIdx];
                if (!fb) continue;
                frostPoints.push({ x: fb.x + rng(4, fb.w - 4), y: fb.y });
            }
            for (var p = 0; p < frostPoints.length; p++) {
                drawFrostCrystal(cityC, frostPoints[p].x, frostPoints[p].y);
            }
        }
    }

    function drawFrostCrystal(c, cx, cy) {
        c.save();
        c.strokeStyle = 'rgba(200,220,255,0.4)';
        c.lineWidth = 1;
        for (var a = 0; a < 6; a++) {
            var angle = (a / 6) * Math.PI * 2;
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8);
            c.stroke();
        }
        c.restore();
    }

    function initParticles() {
        var m = MONTHS[monthIndex];
        var cond = m.condition;

        snowParticles = [];
        rainParticles = [];
        windStreaks = [];
        leafParticles = [];
        hurricaneParticles = [];

        if (cond === 'blizzard' || cond === 'snowwind' || cond === 'snowstorm') {
            var count = (cond === 'blizzard' || cond === 'snowstorm') ? MAX_SNOW_BLIZ : MAX_SNOW_LIGHT;
            for (var i = 0; i < count; i++) {
                snowParticles.push({
                    x: rng(0, W),
                    y: rng(0, H),
                    vx: rng(-0.5, 0.5),
                    vy: rng(0.5, 2),
                    r: rng(1, 3),
                    op: rng(0.4, 1.0),
                    blue: cond === 'blizzard' || cond === 'snowstorm'
                });
            }
        }

        if (cond === 'coldrain' || cond === 'thunder' || cond === 'warmrain' ||
            cond === 'stormheat' || cond === 'frost' || cond === 'tropical') {
            for (var j = 0; j < MAX_RAIN; j++) {
                rainParticles.push({
                    x: rng(0, W),
                    y: rng(0, H),
                    speed: rng(8, 15),
                    len: rng(8, 18)
                });
            }
        }

        if (cond === 'snowwind' || cond === 'windleaves') {
            for (var k = 0; k < MAX_WIND; k++) {
                windStreaks.push({
                    x: rng(0, W),
                    y: rng(0, H * 0.7),
                    len: rng(20, 80),
                    speed: rng(10, 20)
                });
            }
        }

        if (cond === 'windleaves') {
            for (var l = 0; l < MAX_LEAVES; l++) {
                leafParticles.push({
                    x: rng(0, W),
                    y: rng(0, H),
                    rot: rng(0, Math.PI * 2),
                    rotSpeed: rng(0.02, 0.08),
                    vx: rng(0.5, 2),
                    vy: rng(0.3, 1)
                });
            }
        }

        if (cond === 'tropical') {
            for (var n = 0; n < MAX_HURRICANE; n++) {
                hurricaneParticles.push({
                    angle: rng(0, Math.PI * 2),
                    radius: rng(10, 80),
                    speed: rng(0.01, 0.04),
                    radiusSpeed: rng(0.05, 0.2)
                });
            }
        }

        hudC.font = '13px Arial, sans-serif';
        tickerWidth = hudC.measureText(m.headline).width;

        lightningTimer = rng(2000, 5000);
        lightningFlash = 0;
        lightningX = W * 0.5;

        if (monthIndex === 10) {
            drawCity(true);
            frosted = true;
        } else {
            if (frosted) {
                drawCity(false);
                frosted = false;
            }
        }
    }

    function updateParticles(dt) {
        var i;
        for (i = 0; i < snowParticles.length; i++) {
            var s = snowParticles[i];
            s.y += s.vy * (dt / 16);
            s.x += s.vx * (dt / 16);
            if (s.y > H) { s.y = 0; s.x = rng(0, W); }
            if (s.x < 0) s.x = W;
            if (s.x > W) s.x = 0;
        }

        var rainAngle = 78 * Math.PI / 180;
        for (i = 0; i < rainParticles.length; i++) {
            var r = rainParticles[i];
            r.x += Math.cos(rainAngle) * r.speed * dt / 16;
            r.y += Math.sin(rainAngle) * r.speed * dt / 16;
            if (r.y > H) { r.y = 0; r.x = rng(0, W); }
            if (r.x > W) { r.x = 0; }
        }

        for (i = 0; i < windStreaks.length; i++) {
            var w = windStreaks[i];
            w.x += w.speed * (dt / 16);
            if (w.x > W) { w.x = -w.len; w.y = rng(0, H * 0.7); }
        }

        for (i = 0; i < leafParticles.length; i++) {
            var lf = leafParticles[i];
            lf.x += lf.vx * (dt / 16);
            lf.y += lf.vy * (dt / 16);
            lf.rot += lf.rotSpeed * (dt / 16);
            if (lf.y > H) { lf.y = 0; lf.x = rng(0, W); }
            if (lf.x > W) { lf.x = 0; }
        }

        for (i = 0; i < hurricaneParticles.length; i++) {
            var hp = hurricaneParticles[i];
            hp.angle += hp.speed * (dt / 16);
            hp.radius += hp.radiusSpeed * (dt / 16);
            if (hp.radius > Math.max(W, H) * 0.6) {
                hp.radius = rng(10, 30);
                hp.angle = rng(0, Math.PI * 2);
            }
        }

        var cond = MONTHS[monthIndex].condition;
        if (cond === 'thunder' || cond === 'stormheat') {
            lightningTimer -= dt;
            if (lightningFlash > 0) lightningFlash -= dt;
            if (lightningTimer <= 0) {
                lightningTimer = rng(2000, 5000);
                lightningFlash = 3 * 16;
                lightningX = rng(W * 0.1, W * 0.9);
            }
        }
    }

    function drawDynamic(timestamp) {
        dynC.clearRect(0, 0, W, H);
        var i;
        var m = MONTHS[monthIndex];
        var cond = m.condition;

        for (i = 0; i < snowParticles.length; i++) {
            var s = snowParticles[i];
            dynC.save();
            dynC.globalAlpha = s.op;
            dynC.fillStyle = s.blue ? 'rgba(180,210,255,1)' : '#ffffff';
            dynC.beginPath();
            dynC.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            dynC.fill();
            dynC.restore();
        }

        if (rainParticles.length > 0) {
            var rainAngle2 = 78 * Math.PI / 180;
            var cosA = Math.cos(rainAngle2);
            var sinA = Math.sin(rainAngle2);
            dynC.save();
            dynC.strokeStyle = cond === 'warmrain' ? 'rgba(180,220,180,0.5)' : 'rgba(180,200,220,0.5)';
            dynC.lineWidth = 1;
            for (i = 0; i < rainParticles.length; i++) {
                var rp = rainParticles[i];
                dynC.beginPath();
                dynC.moveTo(rp.x, rp.y);
                dynC.lineTo(rp.x + cosA * rp.len, rp.y + sinA * rp.len);
                dynC.stroke();
            }
            dynC.restore();
        }

        if (cond === 'warmrain') {
            dynC.save();
            dynC.fillStyle = 'rgba(255,220,100,0.06)';
            dynC.fillRect(0, 0, W, H);
            dynC.restore();
        }

        for (i = 0; i < windStreaks.length; i++) {
            var ws = windStreaks[i];
            dynC.save();
            dynC.globalAlpha = 0.3;
            dynC.strokeStyle = '#ffffff';
            dynC.lineWidth = 1;
            dynC.beginPath();
            dynC.moveTo(ws.x, ws.y);
            dynC.lineTo(ws.x + ws.len, ws.y);
            dynC.stroke();
            dynC.restore();
        }

        for (i = 0; i < leafParticles.length; i++) {
            var lf = leafParticles[i];
            dynC.save();
            dynC.translate(lf.x, lf.y);
            dynC.rotate(lf.rot);
            dynC.fillStyle = 'rgba(120,120,120,0.7)';
            dynC.beginPath();
            dynC.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            dynC.fill();
            dynC.restore();
        }

        var hcx = W * 0.5, hcy = H * 0.4;
        for (i = 0; i < hurricaneParticles.length; i++) {
            var hp = hurricaneParticles[i];
            var hx = hcx + Math.cos(hp.angle) * hp.radius;
            var hy = hcy + Math.sin(hp.angle) * hp.radius * 0.5;
            dynC.save();
            dynC.globalAlpha = 0.5;
            dynC.fillStyle = 'rgba(180,200,220,0.8)';
            dynC.beginPath();
            dynC.arc(hx, hy, 2, 0, Math.PI * 2);
            dynC.fill();
            dynC.restore();
        }

        // heat shimmer: draw city layer into dynCvs with wavy horizontal offset per band
        if (m.shimmer) {
            var bands = 30;
            var bandH = Math.ceil(H / bands);
            for (var b = 0; b < bands; b++) {
                var by = b * bandH;
                var phase = (timestamp / 400) + b * 0.7;
                var shift = Math.sin(phase) * m.shimmer * 4;
                dynC.drawImage(cityCvs, 0, by, W, bandH + 1, shift, by, W, bandH + 1);
            }
            if (m.name === 'JULY') {
                dynC.fillStyle = 'rgba(200,50,0,0.08)';
                dynC.fillRect(0, 0, W, H);
            }
        }

        if (lightningFlash > 0 && (cond === 'thunder' || cond === 'stormheat')) {
            dynC.save();
            dynC.fillStyle = 'rgba(255,255,255,0.15)';
            dynC.fillRect(0, 0, W, H);

            dynC.strokeStyle = 'rgba(255,255,255,0.9)';
            dynC.lineWidth = 2;
            dynC.beginPath();
            var lx = lightningX;
            var ly = H * 0.1;
            dynC.moveTo(lx, ly);
            var segments = 6;
            for (var seg = 0; seg < segments; seg++) {
                lx += rng(-20, 20);
                ly += (GROUND - H * 0.1) / segments;
                dynC.lineTo(lx, ly);
            }
            dynC.stroke();
            dynC.restore();
        }

        if (cond === 'blizzard') {
            dynC.save();
            dynC.fillStyle = 'rgba(180,210,255,0.07)';
            dynC.fillRect(0, 0, W, H);
            dynC.restore();
        }

        if (cond === 'snowstorm') {
            dynC.save();
            dynC.fillStyle = 'rgba(200,220,255,0.08)';
            dynC.fillRect(0, 0, W, H);
            dynC.restore();
        }
    }

    function drawHUD(timestamp) {
        hudC.clearRect(0, 0, W, H);
        var m = MONTHS[monthIndex];

        hudC.save();
        hudC.fillStyle = 'rgba(0,0,0,0.85)';
        hudC.fillRect(0, 0, W, 50);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = '#ffffff';
        hudC.font = 'bold 12px Arial, sans-serif';
        hudC.textAlign = 'left';
        hudC.textBaseline = 'middle';
        hudC.fillText('NYC WEATHER REPORT', 12, 25);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = '#ffffff';
        hudC.font = 'bold 22px Arial, sans-serif';
        hudC.textAlign = 'center';
        hudC.textBaseline = 'middle';
        hudC.fillText(m.name + ' 2025', W / 2, 25);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = '#ffffff';
        hudC.font = '12px Arial, sans-serif';
        hudC.textAlign = 'right';
        hudC.textBaseline = 'middle';
        hudC.fillText('HIGH: ' + m.high + '°F  LOW: ' + m.low + '°F', W - 80, 25);
        hudC.restore();

        var livePulse = Math.sin(timestamp / 500) * 0.2 + 0.8;
        hudC.save();
        hudC.globalAlpha = livePulse;
        hudC.font = 'bold 12px monospace';
        hudC.textAlign = 'right';
        hudC.textBaseline = 'middle';
        hudC.fillStyle = '#ff0000';
        hudC.fillText('●', W - 36, 25);
        hudC.fillStyle = '#ffffff';
        hudC.fillText(' LIVE', W - 8, 25);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = 'rgba(0,0,0,0.9)';
        hudC.fillRect(0, H - 40, W, 40);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = '#cc0000';
        hudC.fillRect(0, H - 40, 80, 40);
        hudC.fillStyle = '#ffffff';
        hudC.font = 'bold 11px Arial, sans-serif';
        hudC.textAlign = 'center';
        hudC.textBaseline = 'middle';
        hudC.fillText('BREAKING', 40, H - 20);
        hudC.restore();

        var headline = m.headline;
        hudC.save();
        hudC.fillStyle = '#ffffff';
        hudC.font = '13px Arial, sans-serif';
        hudC.textAlign = 'left';
        hudC.textBaseline = 'middle';
        hudC.rect(82, H - 40, W - 82 - 130, 40);
        hudC.clip();
        hudC.fillText(headline, tickerX + 82, H - 20);
        hudC.restore();

        var sevY = H - 40 - 20 - 120;
        var sevX = W - 30;
        var sevH = 120;
        var sevW = 20;

        hudC.save();
        hudC.fillStyle = '#ffffff';
        hudC.font = '10px Arial, sans-serif';
        hudC.textAlign = 'center';
        hudC.textBaseline = 'bottom';
        hudC.fillText('SEVERITY', sevX + sevW / 2, sevY - 2);
        hudC.restore();

        hudC.save();
        hudC.fillStyle = '#333333';
        hudC.fillRect(sevX, sevY, sevW, sevH);

        var sev = m.severity;
        var fillH = sev * sevH;
        var fillColor;
        if (sev <= 0.4) {
            fillColor = 'rgba(0,200,0,0.9)';
        } else if (sev <= 0.7) {
            fillColor = 'rgba(220,200,0,0.9)';
        } else {
            fillColor = 'rgba(220,30,0,0.9)';
        }
        hudC.fillStyle = fillColor;
        hudC.fillRect(sevX, sevY + sevH - fillH, sevW, fillH);

        hudC.strokeStyle = '#888888';
        hudC.lineWidth = 1;
        hudC.strokeRect(sevX, sevY, sevW, sevH);
        hudC.restore();
    }

    function updateTickerX(dt) {
        tickerX -= 1.5 * (dt / 16);
        var tickerAreaW = W - 82 - 130;
        if (tickerX + tickerWidth < 0) {
            tickerX = tickerAreaW;
        }
    }

    function triggerWipe() {
        if (!wipeActive) {
            wipeActive = true;
            wipeStart = performance.now();
            pendingMonth = (monthIndex + 1) % 12;
        }
    }

    function drawWipe(now) {
        if (!wipeActive) return false;
        var elapsed = now - wipeStart;
        var progress = elapsed / WIPE_DURATION;
        if (progress >= 1) {
            wipeActive = false;
            monthIndex = pendingMonth;
            monthTimer = 0;
            tickerX = W;
            initParticles();
            return false;
        }
        var sweepX = progress * W;
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, sweepX, H);
        ctx.restore();
        return true;
    }

    function drawStatic() {
        drawBg();
        drawCity(monthIndex === 10);
    }

    function tick(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var dt = timestamp - lastTime;
        lastTime = timestamp;

        if (!wipeActive) {
            monthTimer += dt;
            if (monthTimer >= MONTH_DURATION) {
                monthTimer = 0;
                triggerWipe();
            }
        }

        updateParticles(dt);
        updateTickerX(dt);
        drawDynamic(timestamp);
        drawHUD(timestamp);

        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bgCvs, 0, 0);
        if (!MONTHS[monthIndex].shimmer) ctx.drawImage(cityCvs, 0, 0);  // skipped when shimmer draws it into dynCvs
        ctx.drawImage(dynCvs, 0, 0);
        ctx.drawImage(hudCvs, 0, 0);

        if (wipeActive) {
            drawWipe(timestamp);
        }

        animId = requestAnimationFrame(tick);
    }

    resize();
    drawStatic();
    initParticles();
    tickerX = W;

    window.addEventListener('resize', function () {
        resize();
        drawStatic();
        initParticles();
    });

    animId = requestAnimationFrame(tick);
})();
