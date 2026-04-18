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

    /* offscreen layers (5-layer composite: bg → city → dyn → fx → grain) */
    var bgCvs = document.createElement('canvas'), bgC = bgCvs.getContext('2d');
    var cityCvs = document.createElement('canvas'), cityC = cityCvs.getContext('2d');
    var dynCvs = document.createElement('canvas'), dynC = dynCvs.getContext('2d');
    var fxCvs = document.createElement('canvas'), fxC = fxCvs.getContext('2d');
    var grainCvs = document.createElement('canvas'), grainC = grainCvs.getContext('2d');

    var W, H, GROUND, HORIZON, STREET_BOT, FORE_TOP, animId;
    var SIDEWALK_N, SIDEWALK_N_B, LANE_Y = [], CENTER_Y, SIDEWALK_S, SIDEWALK_S_B;

    function resize() {
        W = canvas.width = bgCvs.width = cityCvs.width = dynCvs.width = fxCvs.width = grainCvs.width = window.innerWidth;
        H = canvas.height = bgCvs.height = cityCvs.height = dynCvs.height = fxCvs.height = grainCvs.height = window.innerHeight;
        HORIZON = H * 0.12;
        GROUND = H * 0.84;
        STREET_BOT = H * 0.93;
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
        /* waterfront layout */
        RIVER_TOP = STREET_BOT + (H - STREET_BOT) * 0.35;
        RIVER_BOT = H;
        BEACH_Y = RIVER_TOP - 2;
        TRACK_Y = BEACH_Y - 6;
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
    var MAX_CLOUDS = 12;
    var MAX_FLOCKS = 15;
    var MAX_SMOKE = 15;
    var MAX_PLANES = 2;
    var MAX_HELIS = 2;
    var DAY_CYCLE = 480; /* seconds — 8 minute full cycle */
    var MAX_BOATS = 4;
    var MAX_BEACH = 8;
    var MAX_DOLPHINS = 2;
    var MAX_FISH = 12;

    /* ═══════════ ATMOSPHERE & WEATHER ═══════════ */
    var ATM = {
        dayT: 0,
        rainIntensity: 0.95,
        rainBase: 0.85,
        windStrength: 0.5,
        windAngle: 0.2,
        flashIntensity: 0,
        thunderTimer: 5,
        paperDarken: 10
    };
    var MAX_RAIN = 350;
    var MAX_HAIL = 80;
    var MAX_SNOW = 120;
    var MAX_METEORS = 8;
    var MAX_DEBRIS = 25;
    var MAX_JOGGERS = 6;
    var MAX_BUSKERS = 3;
    var MAX_VENDORS = 3;
    var MAX_PIGEONS = 6;
    var MAX_CATS = 3;
    var MAX_SEAGULLS = 8;
    var MAX_SWIMMERS = 5;
    var MAX_SURFERS = 4;
    var MAX_PADDLERS = 3;
    var MAX_JETSKIS = 3;
    var MAX_FISHERMEN = 2;
    var MAX_SUNBATHERS = 7;
    var MAX_BPLAYERS = 4;
    var MAX_VOLUNTEERS = 4;
    var MAX_CRIMINALS = 1;
    var MAX_POLICE_FOOT = 1;

    /* ═══════════ DISASTER SYSTEM ═══════════ */
    var DISASTER = {
        active: null,
        timer: 0,
        duration: 0,
        nextIn: 120,
        recentLog: [],
        shakeX: 0, shakeY: 0,
        floodLevel: 0,
        fireIntensity: 0,
        sinkholeX: 0, sinkholeR: 0,
        tsunamiX: 0
    };
    var DISASTER_TYPES = [
        { type: 'earthquake', weight: 8, dur: [10, 18] },
        { type: 'tsunami', weight: 5, dur: [30, 45] },
        { type: 'storm', weight: 0, dur: [40, 70] },
        { type: 'wildfire', weight: 6, dur: [45, 80] },
        { type: 'flood', weight: 10, dur: [50, 90] },
        { type: 'hail', weight: 8, dur: [25, 50] },
        { type: 'blizzard', weight: 6, dur: [60, 100] },
        { type: 'hurricane', weight: 12, dur: [70, 110] },
        { type: 'meteor', weight: 4, dur: [20, 40] },
        { type: 'dust-storm', weight: 5, dur: [40, 65] },
        { type: 'landslide', weight: 3, dur: [8, 14] },
        { type: 'sinkhole', weight: 3, dur: [45, 70] }
    ];

    function pickDisaster() {
        var total = 0, i;
        for (i = 0; i < DISASTER_TYPES.length; i++) total += DISASTER_TYPES[i].weight;
        var r = behRng() * total, acc = 0;
        for (i = 0; i < DISASTER_TYPES.length; i++) {
            acc += DISASTER_TYPES[i].weight;
            if (r < acc) return DISASTER_TYPES[i];
        }
        return DISASTER_TYPES[0];
    }

    function triggerDisaster() {
        var d = pickDisaster();
        DISASTER.active = d.type;
        DISASTER.duration = br(d.dur[0], d.dur[1]);
        DISASTER.timer = 0;
        DISASTER.recentLog.unshift(d.type);
        if (DISASTER.recentLog.length > 3) DISASTER.recentLog.pop();
        if (d.type === 'sinkhole') {
            DISASTER.sinkholeX = br(W * 0.2, W * 0.8);
            DISASTER.sinkholeR = 0;
        }
        if (d.type === 'tsunami') DISASTER.tsunamiX = W + 50;
        if (d.type === 'flood') DISASTER.floodLevel = 0;
        if (d.type === 'wildfire') DISASTER.fireIntensity = 0;
    }

    function updateDisaster(dt) {
        ATM.rainIntensity = 0.95 + Math.sin(performance.now() * 0.0003) * 0.05;
        ATM.windStrength = 0.6 + Math.sin(performance.now() * 0.0005) * 0.25;
        ATM.windAngle = 0.2 + Math.sin(performance.now() * 0.0002) * 0.15;
        ATM.paperDarken = 15 + Math.sin(performance.now() * 0.0004) * 5;
    }

    /* ═══════════ LIGHTNING STRIKE SYSTEM ═══════════ */
    var strikeTimer = 2;
    var pendingDamage = null;
    var damageTimer = 0;

    function createTargetedBolt(targetX, targetY) {
        var x = targetX + br(-15, 15), y = 0;
        var pts = [{ x: x, y: y }];
        var cx = x, cy = y;
        while (cy < targetY) {
            cx += br(-20, 20);
            cx = cx + (targetX - cx) * 0.15;
            cy += br(15, 35);
            pts.push({ x: cx, y: Math.min(cy, targetY) });
            if (behRng() < 0.35 && pts.length > 2) {
                var brPts = [{ x: cx, y: cy }];
                var bx = cx, by = cy;
                for (var b = 0; b < bri(2, 5); b++) {
                    bx += br(-25, 25); by += br(10, 30);
                    brPts.push({ x: bx, y: by });
                }
                pts.branches = pts.branches || [];
                pts.branches.push(brPts);
            }
        }
        pts.push({ x: targetX, y: targetY });
        return { pts: pts, age: 0, maxAge: 0.25 };
    }

    function strikeBuildingWithLightning() {
        var minBuildings = Math.max(5, Math.floor(buildings.length * 0.4));
        if (buildings.length < minBuildings) return;
        var idx = bri(0, buildings.length);
        var target = buildings[idx];
        lightningBolt = createTargetedBolt(target.x + target.w / 2, target.y);
        ATM.flashIntensity = 0.3;
        pendingDamage = target;
        damageTimer = 0.3;
    }

    var needsCityRebake = false;
    var rebakeCooldown = 0;
    var crumbleDebris = [];
    function spawnCrumbleDebris(b) {
        var topY = b.y;
        for (var i = 0; i < 6; i++) {
            crumbleDebris.push({
                x: b.x + behRng() * b.w,
                y: topY + behRng() * b.h * 0.5,
                vx: (behRng() - 0.5) * 60,
                vy: behRng() * -40 + 20,
                r: 1 + behRng() * 3,
                g: b.g + Math.floor((behRng() - 0.5) * 20),
                spin: (behRng() - 0.5) * 6,
                angle: behRng() * Math.PI * 2,
                age: 0, life: 0.6 + behRng() * 1,
                type: behRng() < 0.3 ? 'dust' : 'chunk'
            });
        }
        for (var i = 0; i < 2; i++) {
            crumbleDebris.push({
                x: b.x + behRng() * b.w,
                y: topY + behRng() * b.h * 0.3,
                vx: (behRng() - 0.5) * 30,
                vy: -15 - behRng() * 30,
                r: 3 + behRng() * 6,
                g: b.g + 40 + Math.floor(behRng() * 20),
                spin: 0, angle: 0,
                age: 0, life: 1 + behRng() * 1.5,
                type: 'dustcloud'
            });
        }
    }
    function updateCrumbleDebris(dt) {
        while (crumbleDebris.length > 30) crumbleDebris.shift();
        for (var i = crumbleDebris.length - 1; i >= 0; i--) {
            var d = crumbleDebris[i];
            d.age += dt;
            if (d.age > d.life) { crumbleDebris.splice(i, 1); continue; }
            if (d.type === 'chunk') {
                d.x += d.vx * dt; d.vy += 180 * dt; d.y += d.vy * dt;
                d.angle += d.spin * dt;
                if (d.y > GROUND) { d.y = GROUND; d.vy *= -0.3; d.vx *= 0.7; }
            } else if (d.type === 'dust') {
                d.x += d.vx * dt; d.vy += 50 * dt; d.y += d.vy * dt;
                d.r += dt * 2;
            } else {
                d.x += d.vx * dt * 0.3; d.y += d.vy * dt * 0.5;
                d.r += dt * 6;
                d.vx *= 0.97; d.vy *= 0.97;
            }
        }
    }
    function drawCrumbleDebris(c) {
        for (var i = 0; i < crumbleDebris.length; i++) {
            var d = crumbleDebris[i];
            var alpha = Math.max(0, 1 - d.age / d.life);
            if (d.type === 'chunk') {
                c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
                var hw = d.r * 0.5, hh = d.r * 0.4;
                c.beginPath();
                c.moveTo(-hw, -hh); c.lineTo(hw * 0.8, -hh * 0.6);
                c.lineTo(hw, hh * 0.7); c.lineTo(-hw * 0.5, hh);
                c.closePath();
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + (alpha * 0.8) + ')';
                c.fill();
                c.strokeStyle = 'rgba(' + (d.g - 20) + ',' + (d.g - 20) + ',' + (d.g - 20) + ',' + (alpha * 0.6) + ')';
                c.lineWidth = 0.3;
                c.stroke();
                c.restore();
            } else if (d.type === 'dust') {
                c.beginPath();
                c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + (alpha * 0.25) + ')';
                c.fill();
            } else {
                arcStr(c, d.x, d.y, d.r, d.r * 0.7, 0, Math.PI * 2, 0.5, 0.08, d.g, alpha * 0.15);
            }
        }
    }
    function damageBuilding(b) {
        var idx = buildings.indexOf(b);
        if (idx < 0) return;
        if (buildings.length <= 5) return;
        spawnCrumbleDebris(b);
        buildings.splice(idx, 1);
        cityC.clearRect(b.x - 5, b.y - 35, b.w + 10, GROUND - b.y + 36);
        var con = {
            x: b.x, w: b.w, floors: b.floors, floorH: b.floorH,
            h: b.h, y: b.y,
            curFloor: 0, buildTimer: 0,
            floorInterval: br(0.3, 0.8),
            g: b.g, done: false,
            scaffolding: false, workers: []
        };
        constructions.push(con);
        cranes.push(createCrane(con));
    }

    var rebakePending = false;
    function rebakeCity() {
        if (rebakePending) return;
        rebakePending = true;
        needsCityRebake = false;
        setTimeout(function () {
            var savedSeed = seed;
            layoutRng = mulberry32(savedSeed);
            chimneys = []; litWindows = [];
            paintCity();
            layoutRng = mulberry32(savedSeed);
            rebakePending = false;
        }, 0);
    }

    /* ── ALIEN ATTACK SAUCERS (wave system) ── */
    var aliens = [];
    var MAX_ALIENS = 30;
    var alienTimer = 1;
    var waveTimer = 0;
    var WAVE_DURATION = 60;
    var waveSpawnCount = 0;
    var WAVE_SPAWN_TARGET = 18;
    var victoryBanner = { active: false, x: 0, y: 0, age: 0, helis: [], particles: [], triggered: false };

    function createAlien() {
        var patrolY = br(HORIZON + 25, HORIZON + 100);
        return {
            x: br(W * 0.05, W * 0.95), y: -30,
            targetX: br(W * 0.1, W * 0.9), targetY: patrolY,
            patrolY: patrolY,
            speed: br(55, 95), g: bri(65, 105),
            pulsePhase: br(0, Math.PI * 2),
            hoverPhase: br(0, Math.PI * 2),
            ringAngle: br(0, Math.PI * 2),
            scanAngle: 0,
            tiltAngle: 0,
            alive: true, age: 0, maxAge: br(30, 40),
            size: br(1.8, 3.0),
            fireCooldown: br(3, 6),
            launchFlash: 0,
            launchedAst: null,
            beamAge: 0,
            shieldFlicker: 3,
            engineGlow: br(0, Math.PI * 2),
            panelPhase: br(0, Math.PI * 2)
        };
    }
    function createAlienAsteroid(alien) {
        var targetB = buildings.length > 0 ? buildings[bri(0, buildings.length)] : null;
        var tx = targetB ? targetB.x + targetB.w / 2 : br(W * 0.1, W * 0.9);
        var ty = GROUND - 20;
        var ang = Math.atan2(ty - alien.y, tx - alien.x);
        var spd = br(200, 320);
        return {
            x: alien.x, y: alien.y + 1 * alien.size,
            vx: Math.cos(ang) * spd + br(-2, 2),
            vy: Math.sin(ang) * spd,
            r: br(2, 3), g: bri(2, 3), spin: br(-4, 4), angle: 0,
            alive: true, exploded: false, explodeAge: 0,
            fireTrailPhase: br(0, Math.PI * 2)
        };
    }
    function updateAlien(a, dt) {
        a.age += dt;
        a.pulsePhase += dt * 5;
        a.hoverPhase += dt * 2.2;
        a.ringAngle += dt * 1.8;
        a.scanAngle += dt * 3;
        a.engineGlow += dt * 8;
        a.panelPhase += dt * 1.5;
        if (a.shieldFlicker > 0) a.shieldFlicker -= dt * 3;
        if (a.launchFlash > 0) a.launchFlash -= dt * 2;
        if (a.beamAge > 0) a.beamAge -= dt;
        if (a.launchedAst && (a.beamAge <= 0 || a.launchedAst.exploded || !a.launchedAst.alive)) {
            a.launchedAst = null;
        }
        a.fireCooldown -= dt;

        var dx = a.targetX - a.x, dy = a.targetY - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        a.tiltAngle = dx * 0.0015;
        if (dist > 5) {
            a.x += dx / dist * a.speed * dt;
            a.y += dy / dist * a.speed * dt;
        } else {
            a.targetX = br(W * 0.05, W * 0.95);
            a.targetY = a.patrolY + br(-15, 15);
        }
        a.y += Math.sin(a.hoverPhase) * 0.4;

        /* launch asteroids at the city */
        if (a.fireCooldown <= 0 && buildings.length > 2) {
            var aCons = 0;
            for (var ci = 0; ci < constructions.length; ci++) { if (!constructions[ci].done) aCons++; }
            if (buildings.length > 5 && aCons < 10) {
                var newAst = createAlienAsteroid(a);
                asteroids.push(newAst);
                a.launchedAst = newAst;
                a.beamAge = 1.5;
                a.launchFlash = 1;
                a.shieldFlicker = 0.5;
            }
            a.fireCooldown = br(4, 8);
        }

        if (a.age > a.maxAge) a.alive = false;
    }
    function drawAlien(c, a) {
        var x = a.x, y = a.y, g = a.g, sz = a.size;
        var pulse = Math.sin(a.pulsePhase) * 0.15 + 0.75;
        var hover = Math.sin(a.hoverPhase) * 2;
        c.save(); c.translate(x, y + hover); c.rotate(a.tiltAngle);

        var diskW = 18 * sz;
        var diskH = 5 * sz;
        var domeR = 7 * sz;

        /* shield shimmer on fire */
        if (a.shieldFlicker > 0) {
            var shA = a.shieldFlicker * 0.25;
            arcStr(c, 0, 0, diskW * 1.3, diskH * 2.5, 0, Math.PI * 2, 0.1, 0.08 * sz, g + 60, shA);
        }

        /* bottom hull glow — engine exhaust cone */
        var engPulse = 0.25 + Math.sin(a.engineGlow) * 0.12;
        c.beginPath();
        c.moveTo(-diskW * 0.3, diskH * 0.5);
        c.lineTo(0, diskH * 1.8);
        c.lineTo(diskW * 0.3, diskH * 0.5);
        c.closePath();
        c.fillStyle = 'rgba(' + Math.min(210, g + 50) + ',' + Math.min(210, g + 50) + ',' + Math.min(210, g + 50) + ',' + (engPulse * 0.2) + ')';
        c.fill();

        /* main saucer disk — elliptical body */
        c.beginPath();
        c.ellipse(0, 0, diskW, diskH, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + (pulse * 0.55) + ')';
        c.fill();
        c.strokeStyle = 'rgba(' + (g - 25) + ',' + (g - 25) + ',' + (g - 25) + ',' + (pulse * 0.8) + ')';
        c.lineWidth = 0.5 * sz; c.stroke();

        /* disk rim — double outline for thickness */
        arcStr(c, 0, 0, diskW * 0.92, diskH * 0.85, 0, Math.PI * 2, 0.12, 0.12 * sz, g - 10, pulse * 0.35);

        /* hull plate lines — horizontal bands across disk */
        stk(c, -diskW * 0.8, -diskH * 0.2, diskW * 0.8, -diskH * 0.2, 0.08 * sz, g + 10, pulse * 0.25, 0);
        stk(c, -diskW * 0.85, diskH * 0.15, diskW * 0.85, diskH * 0.15, 0.08 * sz, g + 10, pulse * 0.25, 0);

        /* portholes — row of windows around the saucer rim */
        for (var pi = 0; pi < 10; pi++) {
            var pa = (pi / 10) * Math.PI * 2 + a.panelPhase * 0.15;
            var px = Math.cos(pa) * diskW * 0.75;
            var py = Math.sin(pa) * diskH * 0.6;
            var pBright = (Math.sin(a.pulsePhase * 1.5 + pi * 0.7) + 1) * 0.35;
            c.beginPath(); c.arc(px, py, 0.8 * sz, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.min(230, g + 70) + ',' + Math.min(230, g + 70) + ',' + Math.min(230, g + 70) + ',' + pBright + ')';
            c.fill();
            c.strokeStyle = 'rgba(' + (g - 15) + ',' + (g - 15) + ',' + (g - 15) + ',' + (pBright + 0.15) + ')';
            c.lineWidth = 0.15 * sz; c.stroke();
        }

        /* dome — glass cockpit bubble on top */
        arcStr(c, 0, -diskH * 0.3, domeR, domeR * 0.9, Math.PI, Math.PI * 2, 0.1, 0.3 * sz, g + 20, pulse * 0.65);
        c.beginPath();
        c.ellipse(0, -diskH * 0.3, domeR, domeR * 0.9, 0, Math.PI, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 15) + ',' + (g + 15) + ',' + (g + 15) + ',' + (pulse * 0.35) + ')';
        c.fill();
        c.strokeStyle = 'rgba(' + (g - 20) + ',' + (g - 20) + ',' + (g - 20) + ',' + (pulse * 0.7) + ')';
        c.lineWidth = 0.35 * sz; c.stroke();

        /* dome highlight — reflective streak */
        arcStr(c, -domeR * 0.2, -diskH * 0.3 - domeR * 0.35, domeR * 0.5, domeR * 0.25,
            Math.PI * 1.2, Math.PI * 1.8, 0.15, 0.1 * sz, g + 50, pulse * 0.4);

        /* dome inner glow / occupant silhouette */
        c.beginPath(); c.arc(0, -diskH * 0.35, domeR * 0.3, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 40) + ',' + (g + 40) + ',' + (g + 40) + ',' + (pulse * 0.3) + ')';
        c.fill();

        /* antenna on top of dome */
        stk(c, 0, -diskH * 0.3 - domeR * 0.85, 0, -diskH * 0.3 - domeR * 1.5, 0.12 * sz, g + 10, pulse * 0.6, 0);
        var antPulse = (Math.sin(a.scanAngle) + 1) * 0.45;
        c.beginPath(); c.arc(0, -diskH * 0.3 - domeR * 1.5, 0.6 * sz, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + Math.min(230, g + 80) + ',' + Math.min(230, g + 80) + ',' + Math.min(230, g + 80) + ',' + antPulse + ')';
        c.fill();

        /* landing legs — three small prongs underneath */
        for (var li = 0; li < 3; li++) {
            var lAngle = li * Math.PI * 2 / 3 + 0.5;
            var lx = Math.cos(lAngle) * diskW * 0.55;
            var ly = diskH * 0.4;
            stk(c, lx, ly, lx + Math.cos(lAngle) * 2 * sz, ly + 3 * sz, 0.12 * sz, g - 15, pulse * 0.5, 0);
        }

        /* rotating ring of running lights on disk edge */
        for (var ri = 0; ri < 6; ri++) {
            var ra = (ri / 6) * Math.PI * 2 + a.ringAngle;
            var rx = Math.cos(ra) * diskW * 0.95;
            var ry = Math.sin(ra) * diskH * 0.9;
            var rBright = (Math.sin(a.pulsePhase * 2.5 + ri * 1.1) + 1) * 0.4;
            c.beginPath(); c.arc(rx, ry, 0.5 * sz, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.min(230, g + 75) + ',' + Math.min(230, g + 75) + ',' + Math.min(230, g + 75) + ',' + rBright + ')';
            c.fill();
        }

        /* bottom center — launch bay */
        c.beginPath(); c.arc(0, diskH * 0.5, 2 * sz, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 35) + ',' + (g + 35) + ',' + (g + 35) + ',' + (pulse * 0.5) + ')';
        c.fill();
        arcStr(c, 0, diskH * 0.5, 3 * sz, 3 * sz, 0, Math.PI * 2, 0.2, 0.1 * sz, g + 15, pulse * 0.35);

        /* launch flash — wide bright cone when firing */
        if (a.launchFlash > 0) {
            var lfA = a.launchFlash * 0.5;
            c.beginPath();
            c.moveTo(-diskW * 0.25, diskH * 0.6);
            c.lineTo(-diskW * 0.05, diskH * 5);
            c.lineTo(diskW * 0.05, diskH * 5);
            c.lineTo(diskW * 0.25, diskH * 0.6);
            c.closePath();
            c.fillStyle = 'rgba(' + Math.min(230, g + 70) + ',' + Math.min(230, g + 70) + ',' + Math.min(230, g + 70) + ',' + lfA + ')';
            c.fill();
            /* bright ring around launch bay */
            arcStr(c, 0, diskH * 0.5, 4 * sz, 4 * sz, 0, Math.PI * 2, 0.1, 0.15 * sz, g + 80, lfA * 0.7);
        }

        c.restore();

        /* beam connecting saucer to the asteroid it just launched */
        if (a.launchedAst && a.beamAge > 0 && !a.launchedAst.exploded) {
            var ba = Math.min(0.4, a.beamAge * 0.3);
            var ast = a.launchedAst;
            var bx1 = x, by1 = y + hover + diskH * 0.5;
            var bx2 = ast.x, by2 = ast.y;
            /* wide energy beam */
            c.beginPath();
            c.moveTo(bx1 - 3 * sz, by1);
            c.lineTo(bx2 - 1.5 * sz, by2);
            c.lineTo(bx2 + 1.5 * sz, by2);
            c.lineTo(bx1 + 3 * sz, by1);
            c.closePath();
            c.fillStyle = 'rgba(' + Math.min(220, g + 55) + ',' + Math.min(220, g + 55) + ',' + Math.min(220, g + 55) + ',' + ba + ')';
            c.fill();
            /* center line of beam */
            stk(c, bx1, by1, bx2, by2, 0.3 * sz, g + 60, ba * 1.2, 0);
            /* pulsing nodes along beam */
            for (var bi = 1; bi < 4; bi++) {
                var bf = bi / 4;
                var bnx = bx1 + (bx2 - bx1) * bf;
                var bny = by1 + (by2 - by1) * bf;
                var bnP = (Math.sin(a.pulsePhase * 4 + bi * 2) + 1) * 0.3;
                c.beginPath(); c.arc(bnx, bny, 1.2 * sz, 0, Math.PI * 2);
                c.fillStyle = 'rgba(' + Math.min(220, g + 65) + ',' + Math.min(220, g + 65) + ',' + Math.min(220, g + 65) + ',' + (ba * bnP + 0.1) + ')';
                c.fill();
            }
        }
    }

    function destroyAlien(a) {
        for (var i = 0; i < 5; i++) {
            alienDebris.push({
                x: a.x + (behRng() - 0.5) * 16 * a.size,
                y: a.y + (behRng() - 0.5) * 8 * a.size,
                vx: (behRng() - 0.5) * 150,
                vy: behRng() * 50 - 30,
                r: 1.5 + behRng() * 4 * a.size,
                g: a.g + bri(-15, 25),
                spin: (behRng() - 0.5) * 12,
                angle: behRng() * Math.PI * 2,
                age: 0, life: 1.5 + behRng() * 2,
                type: behRng() < 0.3 ? 'plate' : 'shard'
            });
        }
        for (var i = 0; i < 2; i++) {
            alienDebris.push({
                x: a.x + (behRng() - 0.5) * 10,
                y: a.y + (behRng() - 0.5) * 5,
                vx: (behRng() - 0.5) * 60,
                vy: -25 - behRng() * 50,
                r: 6 + behRng() * 12,
                g: a.g + 40,
                spin: 0, angle: 0,
                age: 0, life: 1.5 + behRng() * 2,
                type: 'smoke'
            });
        }
        a.alive = false;
    }
    /* ── ALIEN DEBRIS ── */
    var alienDebris = [];
    function updateAlienDebris(dt) {
        while (alienDebris.length > 20) alienDebris.shift();
        for (var i = alienDebris.length - 1; i >= 0; i--) {
            var d = alienDebris[i];
            d.age += dt;
            if (d.age > d.life) { alienDebris.splice(i, 1); continue; }
            if (d.type === 'smoke') {
                d.x += d.vx * dt * 0.3; d.y += d.vy * dt * 0.4;
                d.r += dt * 5; d.vx *= 0.98; d.vy *= 0.98;
            } else {
                d.x += d.vx * dt; d.vy += 200 * dt; d.y += d.vy * dt;
                d.angle += d.spin * dt;
                if (d.y > GROUND) { d.y = GROUND; d.vy *= -0.25; d.vx *= 0.6; if (Math.abs(d.vy) < 5) d.vy = 0; }
            }
        }
    }
    function drawAlienDebris(c) {
        for (var i = 0; i < alienDebris.length; i++) {
            var d = alienDebris[i];
            var alpha = Math.max(0, 1 - d.age / d.life);
            if (d.type === 'smoke') {
                arcStr(c, d.x, d.y, d.r, d.r * 0.7, 0, Math.PI * 2, 0.5, 0.08, d.g, alpha * 0.2);
            } else if (d.type === 'plate') {
                c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
                c.beginPath();
                c.moveTo(-d.r, -d.r * 0.3); c.lineTo(d.r * 0.7, -d.r * 0.5);
                c.lineTo(d.r, d.r * 0.4); c.lineTo(-d.r * 0.4, d.r * 0.6);
                c.closePath();
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + (alpha * 0.75) + ')';
                c.fill();
                c.strokeStyle = 'rgba(' + (d.g - 25) + ',' + (d.g - 25) + ',' + (d.g - 25) + ',' + (alpha * 0.5) + ')';
                c.lineWidth = 0.3; c.stroke();
                c.restore();
            } else {
                c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
                stk(c, -d.r * 0.5, 0, d.r * 0.5, 0, 0.4, d.g, alpha * 0.7, 0);
                stk(c, 0, -d.r * 0.3, 0, d.r * 0.3, 0.3, d.g - 10, alpha * 0.5, 0);
                c.restore();
            }
        }
    }

    /* ═══════════ MISSILE DEFENSE SYSTEM ═══════════ */
    var missiles = [];
    var missileTimer = 0;
    var MISSILE_TYPES = [
        { name: 'sam', speed: 500, r: 1.5, trailW: 0.6, g: 80, dmg: 2, turnRate: 7 },
        { name: 'interceptor', speed: 420, r: 2.5, trailW: 1.0, g: 60, dmg: 3, turnRate: 6 },
        { name: 'heavy', speed: 350, r: 3.5, trailW: 1.5, g: 50, dmg: 5, turnRate: 5 }
    ];

    function createMissile(targetAlien) {
        var mType = MISSILE_TYPES[bri(0, MISSILE_TYPES.length)];
        var launchX, launchY;
        if (buildings.length > 0 && behRng() < 0.7) {
            var lb = buildings[bri(0, buildings.length)];
            launchX = lb.x + lb.w * 0.5;
            launchY = lb.y;
        } else {
            launchX = br(W * 0.05, W * 0.95);
            launchY = GROUND;
        }
        var ang = Math.atan2(targetAlien.y - launchY, targetAlien.x - launchX);
        return {
            x: launchX, y: launchY,
            vx: Math.cos(ang) * mType.speed,
            vy: Math.sin(ang) * mType.speed,
            targetId: targetAlien,
            type: mType,
            age: 0, alive: true,
            trail: [],
            exhaustPhase: br(0, Math.PI * 2)
        };
    }
    function updateMissile(m, dt) {
        m.age += dt;
        m.exhaustPhase += dt * 25;
        var hasTarget = false;
        if (m.targetId && m.targetId.alive) {
            hasTarget = true;
            var dx = m.targetId.x - m.x, dy = m.targetId.y - m.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                var desVx = dx / dist * m.type.speed;
                var desVy = dy / dist * m.type.speed;
                m.vx += (desVx - m.vx) * m.type.turnRate * dt;
                m.vy += (desVy - m.vy) * m.type.turnRate * dt;
                var curSpd = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                if (curSpd > 0) { m.vx = m.vx / curSpd * m.type.speed; m.vy = m.vy / curSpd * m.type.speed; }
            }
            if (dist < 20) {
                m.targetId.hp -= m.type.dmg;
                m.targetId.hitFlash = 1;
                m.targetId.evading = true;
                m.targetId.evadeDir = behRng() > 0.5 ? 1 : -1;
                if (m.targetId.hp <= 0) destroyAlien(m.targetId);
                missileExplosions.push({ x: m.x, y: m.y, age: 0, r: m.type.r * 3, g: m.type.g + 40 });
                m.alive = false;
                return;
            }
        } else if (m.targetAst && !m.targetAst.exploded) {
            hasTarget = true;
            var dx = m.targetAst.x - m.x, dy = m.targetAst.y - m.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                var desVx = dx / dist * m.type.speed * 1.3;
                var desVy = dy / dist * m.type.speed * 1.3;
                m.vx += (desVx - m.vx) * m.type.turnRate * 1.5 * dt;
                m.vy += (desVy - m.vy) * m.type.turnRate * 1.5 * dt;
                var curSpd = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                var maxSpd = m.type.speed * 1.3;
                if (curSpd > 0) { m.vx = m.vx / curSpd * maxSpd; m.vy = m.vy / curSpd * maxSpd; }
            }
        }
        if (!hasTarget) {
            m.vy -= 30 * dt;
        }
        m.x += m.vx * dt; m.y += m.vy * dt;
        for (var ai = 0; ai < asteroids.length; ai++) {
            var ast = asteroids[ai];
            if (ast.exploded) continue;
            var adx = ast.x - m.x, ady = ast.y - m.y;
            if (adx * adx + ady * ady < (ast.r + 8) * (ast.r + 8)) {
                ast.exploded = true; ast.explodeAge = 0;
                spawnAsteroidImpact(ast);
                missileExplosions.push({ x: m.x, y: m.y, age: 0, r: m.type.r * 4, g: m.type.g + 40 });
                m.alive = false; return;
            }
        }
        m.trail.push({ x: m.x, y: m.y, age: 0 });
        if (m.trail.length > 12) m.trail.shift();
        for (var t = 0; t < m.trail.length; t++) m.trail[t].age += dt;
        if (m.age > 5 || m.x < -50 || m.x > W + 50 || m.y < -80 || m.y > H + 20) m.alive = false;
    }
    var missileExplosions = [];
    function updateMissileExplosions(dt) {
        for (var i = missileExplosions.length - 1; i >= 0; i--) {
            missileExplosions[i].age += dt;
            missileExplosions[i].r += dt * 25;
            if (missileExplosions[i].age > 0.5) missileExplosions.splice(i, 1);
        }
    }
    function drawMissile(c, m) {
        var ang = Math.atan2(m.vy, m.vx);
        /* smoke trail — greenish tint */
        for (var t = 0; t < m.trail.length; t++) {
            var tp = m.trail[t];
            var ta = Math.max(0, 0.4 - tp.age * 0.6);
            var tr = m.type.trailW * (1 + tp.age * 3);
            var tAge = Math.min(1, tp.age * 0.8);
            c.beginPath(); c.arc(tp.x, tp.y, tr, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.floor(100 + tAge * 80) + ',' + Math.floor(160 + tAge * 50) + ',' + Math.floor(90 + tAge * 60) + ',' + ta + ')';
            c.fill();
        }
        /* missile body — green defense */
        var tipX = m.x + Math.cos(ang) * m.type.r * 2.5;
        var tipY = m.y + Math.sin(ang) * m.type.r * 2.5;
        var tailX = m.x - Math.cos(ang) * m.type.r * 2;
        var tailY = m.y - Math.sin(ang) * m.type.r * 2;
        stkC(c, tailX, tailY, tipX, tipY, m.type.r * 0.7, 50, 120, 60, 0.9);
        /* nose cone */
        stkC(c, m.x, m.y, tipX, tipY, m.type.r * 0.4, 40, 100, 50, 0.95);
        /* fins */
        var perpX = -Math.sin(ang) * m.type.r * 1.5;
        var perpY = Math.cos(ang) * m.type.r * 1.5;
        stkC(c, tailX, tailY, tailX + perpX, tailY + perpY, 0.2, 60, 130, 70, 0.6);
        stkC(c, tailX, tailY, tailX - perpX, tailY - perpY, 0.2, 60, 130, 70, 0.6);
        /* exhaust flicker — greenish glow */
        var exLen = m.type.r * (2 + Math.sin(m.exhaustPhase) * 0.8);
        var exX = tailX - Math.cos(ang) * exLen;
        var exY = tailY - Math.sin(ang) * exLen;
        stkC(c, tailX, tailY, exX, exY, m.type.r * 0.5, 120, 220, 100, 0.5);
        stkC(c, tailX, tailY,
            exX + (behRng() - 0.5) * 3, exY + (behRng() - 0.5) * 3,
            m.type.r * 0.3, 150, 240, 120, 0.3);
    }
    function drawMissileExplosions(c) {
        for (var i = 0; i < missileExplosions.length; i++) {
            var e = missileExplosions[i];
            var alpha = Math.max(0, 1 - e.age / 0.5);
            arcStr(c, e.x, e.y, e.r, e.r * 0.8, 0, Math.PI * 2, 0.3, 0.2, e.g, alpha * 0.5);
            arcStr(c, e.x, e.y, e.r * 0.5, e.r * 0.4, 0, Math.PI * 2, 0.4, 0.15, e.g + 30, alpha * 0.7);
        }
    }
    function createAsteroidMissile(ast) {
        var mType = MISSILE_TYPES[bri(0, MISSILE_TYPES.length)];
        var launchX, launchY;
        if (buildings.length > 0 && behRng() < 0.7) {
            var lb = buildings[bri(0, buildings.length)];
            launchX = lb.x + lb.w * 0.5; launchY = lb.y;
        } else {
            launchX = br(W * 0.05, W * 0.95); launchY = GROUND;
        }
        var ang = Math.atan2(ast.y - launchY, ast.x - launchX);
        return {
            x: launchX, y: launchY,
            vx: Math.cos(ang) * mType.speed,
            vy: Math.sin(ang) * mType.speed,
            targetId: null, targetAst: ast,
            type: mType, age: 0, alive: true,
            trail: [], exhaustPhase: br(0, Math.PI * 2)
        };
    }
    function updateDefenseSystem(dt) {
        missileTimer += dt;
        updateMissileExplosions(dt);
        if (missileTimer > 0.6 && asteroids.length > 0) {
            missileTimer = 0;
            for (var ai = 0; ai < asteroids.length; ai++) {
                if (!asteroids[ai].exploded && behRng() < 0.5) {
                    missiles.push(createAsteroidMissile(asteroids[ai]));
                }
            }
        }
        for (var i = missiles.length - 1; i >= 0; i--) {
            updateMissile(missiles[i], dt);
            if (!missiles[i].alive) missiles.splice(i, 1);
        }
    }

    /* ═══════════ NUCLEAR MISSILE DEFENSE (anti-alien) ═══════════ */
    var nukes = [];
    var nukeTimer = 5;
    var nukeExplosions = [];
    function createNuke(targetAlien) {
        var launchX = br(W * 0.1, W * 0.9);
        var launchY = GROUND;
        var ang = Math.atan2(targetAlien.y - launchY, targetAlien.x - launchX);
        var spd = 400;
        return {
            x: launchX, y: launchY,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            target: targetAlien,
            speed: spd, turnRate: 4,
            age: 0, alive: true,
            trail: [],
            exhaustPhase: br(0, Math.PI * 2),
            r: 5, g: 55
        };
    }
    function updateNuke(n, dt) {
        n.age += dt;
        n.exhaustPhase += dt * 15;
        if (n.target && n.target.alive) {
            var dx = n.target.x - n.x, dy = n.target.y - n.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                var desVx = dx / dist * n.speed;
                var desVy = dy / dist * n.speed;
                n.vx += (desVx - n.vx) * n.turnRate * dt;
                n.vy += (desVy - n.vy) * n.turnRate * dt;
                var curSpd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
                if (curSpd > 0) { n.vx = n.vx / curSpd * n.speed; n.vy = n.vy / curSpd * n.speed; }
            }
            if (dist < 30) {
                destroyAlien(n.target);
                nukeExplosions.push({ x: n.x, y: n.y, age: 0, maxR: 50 + n.r * 8, g: 70 });
                ATM.flashIntensity = Math.min(ATM.flashIntensity + 0.3, 0.6);
                n.alive = false;
                return;
            }
        } else {
            n.vy -= 50 * dt;
        }
        n.x += n.vx * dt; n.y += n.vy * dt;
        n.trail.push({ x: n.x, y: n.y, age: 0 });
        if (n.trail.length > 20) n.trail.shift();
        for (var t = 0; t < n.trail.length; t++) n.trail[t].age += dt;
        if (n.age > 8 || n.x < -80 || n.x > W + 80 || n.y < -100 || n.y > H + 30) n.alive = false;
    }
    function drawNuke(c, n) {
        var ang = Math.atan2(n.vy, n.vx);
        var len = n.r * 3;
        var wid = n.r * 0.8;
        /* thick smoke trail — greenish */
        for (var t = 0; t < n.trail.length; t++) {
            var tp = n.trail[t];
            var ta = Math.max(0, 0.5 - tp.age * 0.35);
            var tr = 2 + tp.age * 8;
            var tAge = Math.min(1, tp.age * 0.6);
            c.beginPath(); c.arc(tp.x, tp.y, tr, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.floor(80 + tAge * 60) + ',' + Math.floor(140 + tAge * 40) + ',' + Math.floor(70 + tAge * 50) + ',' + (ta * 0.25) + ')';
            c.fill();
        }
        /* missile body — big and stocky, olive green */
        c.save(); c.translate(n.x, n.y); c.rotate(ang);
        c.beginPath();
        c.moveTo(len * 1.2, 0);
        c.lineTo(len * 0.3, -wid);
        c.lineTo(-len, -wid * 0.9);
        c.lineTo(-len * 1.1, -wid * 0.4);
        c.lineTo(-len * 1.1, wid * 0.4);
        c.lineTo(-len, wid * 0.9);
        c.lineTo(len * 0.3, wid);
        c.closePath();
        c.fillStyle = 'rgba(55,100,50,0.9)';
        c.fill();
        c.strokeStyle = 'rgba(35,75,30,0.8)';
        c.lineWidth = 0.6; c.stroke();
        /* nose cone */
        c.beginPath();
        c.moveTo(len * 2, 0);
        c.lineTo(len * 0.3, -wid * 0.6);
        c.lineTo(len * 0.3, wid * 0.6);
        c.closePath();
        c.fillStyle = 'rgba(45,90,40,0.9)';
        c.fill(); c.stroke();
        /* nuclear symbol — circle with arcs */
        c.beginPath(); c.arc(0, 0, wid * 0.5, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(120,200,100,0.5)';
        c.lineWidth = 0.3; c.stroke();
        for (var si = 0; si < 3; si++) {
            var sa = si * Math.PI * 2 / 3;
            stkC(c, 0, 0, Math.cos(sa) * wid * 0.5, Math.sin(sa) * wid * 0.5, 0.15, 120, 200, 100, 0.4);
        }
        /* body bands */
        stkC(c, -len * 0.4, -wid * 0.85, -len * 0.4, wid * 0.85, 0.15, 70, 120, 65, 0.4);
        stkC(c, -len * 0.7, -wid * 0.8, -len * 0.7, wid * 0.8, 0.12, 65, 115, 60, 0.35);
        /* big tail fins */
        c.beginPath();
        c.moveTo(-len * 0.8, -wid * 0.8);
        c.lineTo(-len * 1.3, -wid * 2.5);
        c.lineTo(-len * 0.5, -wid * 0.9);
        c.closePath();
        c.fillStyle = 'rgba(60,105,55,0.7)';
        c.fill();
        c.beginPath();
        c.moveTo(-len * 0.8, wid * 0.8);
        c.lineTo(-len * 1.3, wid * 2.5);
        c.lineTo(-len * 0.5, wid * 0.9);
        c.closePath();
        c.fill();
        c.restore();
        /* exhaust flame — green glow */
        var exLen = len * (1.5 + Math.sin(n.exhaustPhase) * 0.5);
        var exX = n.x - Math.cos(ang) * len * 1.1;
        var exY = n.y - Math.sin(ang) * len * 1.1;
        stkC(c, exX, exY,
            exX - Math.cos(ang) * exLen, exY - Math.sin(ang) * exLen,
            wid * 0.6, 100, 220, 80, 0.5);
        stkC(c, exX, exY,
            exX - Math.cos(ang) * exLen * 0.7 + (behRng() - 0.5) * 4,
            exY - Math.sin(ang) * exLen * 0.7 + (behRng() - 0.5) * 4,
            wid * 0.35, 130, 245, 110, 0.35);
    }
    function updateNukeExplosions(dt) {
        for (var i = nukeExplosions.length - 1; i >= 0; i--) {
            var e = nukeExplosions[i];
            e.age += dt;
            if (e.age > 2) { nukeExplosions.splice(i, 1); continue; }
        }
    }
    function drawNukeExplosions(c) {
        for (var i = 0; i < nukeExplosions.length; i++) {
            var e = nukeExplosions[i];
            var alpha = Math.max(0, 1 - e.age / 2);
            var growR = e.maxR * Math.min(1, e.age * 3);
            /* mushroom cloud base ring */
            arcStr(c, e.x, e.y, growR, growR * 0.4, 0, Math.PI * 2, 0.1, 0.2, e.g + 30, alpha * 0.4);
            /* expanding shockwave */
            arcStr(c, e.x, e.y, growR * 1.3, growR * 1.3, 0, Math.PI * 2, 0.08, 0.1, e.g + 50, alpha * 0.2);
            /* bright core */
            c.beginPath(); c.arc(e.x, e.y, growR * 0.4, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.min(230, e.g + 80) + ',' + Math.min(230, e.g + 80) + ',' + Math.min(230, e.g + 80) + ',' + (alpha * 0.35) + ')';
            c.fill();
            /* mushroom stem */
            if (e.age > 0.3) {
                var stemH = growR * 1.5 * Math.min(1, (e.age - 0.3) * 2);
                stk(c, e.x - growR * 0.1, e.y, e.x - growR * 0.05, e.y + stemH, growR * 0.15, e.g + 20, alpha * 0.25, 0);
                stk(c, e.x + growR * 0.1, e.y, e.x + growR * 0.05, e.y + stemH, growR * 0.15, e.g + 20, alpha * 0.25, 0);
                /* cloud top */
                arcStr(c, e.x, e.y - growR * 0.3, growR * 0.7, growR * 0.5, Math.PI, Math.PI * 2, 0.12, 0.15, e.g + 15, alpha * 0.3);
            }
        }
    }
    function updateNukeDefense(dt) {
        nukeTimer += dt;
        updateNukeExplosions(dt);
        var wavePhase = waveTimer / WAVE_DURATION;
        var fireInterval;
        if (wavePhase < 0.25) {
            fireInterval = br(2.5, 4);
        } else if (wavePhase < 0.6) {
            fireInterval = br(0.6, 1.2);
        } else {
            fireInterval = br(0.3, 0.7);
        }
        if (nukeTimer > fireInterval && aliens.length > 0) {
            nukeTimer = 0;
            var bestAlien = null, bestY = -9999;
            var targeted = {};
            for (var ni = 0; ni < nukes.length; ni++) {
                if (nukes[ni].target && nukes[ni].target.alive) {
                    targeted[nukes[ni].target.x + '_' + nukes[ni].target.y] = true;
                }
            }
            for (var ai = 0; ai < aliens.length; ai++) {
                var a = aliens[ai];
                var key = a.x + '_' + a.y;
                if (a.alive && !targeted[key] && a.y > bestY) {
                    bestY = a.y;
                    bestAlien = a;
                }
            }
            if (!bestAlien) {
                for (var ai2 = 0; ai2 < aliens.length; ai2++) {
                    if (aliens[ai2].alive && aliens[ai2].y > bestY) {
                        bestY = aliens[ai2].y;
                        bestAlien = aliens[ai2];
                    }
                }
            }
            if (bestAlien) {
                nukes.push(createNuke(bestAlien));
            }
        }
        for (var i = nukes.length - 1; i >= 0; i--) {
            updateNuke(nukes[i], dt);
            if (!nukes[i].alive) nukes.splice(i, 1);
        }
    }

    /* (removed F-15 system) */
    /* ── ASTEROIDS ── */
    var asteroids = [];
    var asteroidTimer = 3;
    var asteroidImpacts = [];
    function createAsteroid() {
        return {
            x: br(W * 0.05, W * 0.95), y: -60,
            vx: br(-30, 30), vy: br(150, 300),
            r: br(6, 16), g: bri(60, 100), spin: br(-4, 4), angle: 0,
            alive: true, exploded: false, explodeAge: 0,
            fireTrailPhase: br(0, Math.PI * 2)
        };
    }
    function spawnAsteroidImpact(a) {
        var impactR = a.r * 2;
        for (var i = 0; i < 3; i++) {
            var ang = behRng() * Math.PI * 2;
            var spd = 40 + behRng() * 120;
            asteroidImpacts.push({
                x: a.x, y: a.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd * 0.5 - behRng() * 80,
                r: 1 + behRng() * 3,
                g: a.g + bri(-10, 20),
                spin: (behRng() - 0.5) * 8,
                angle: behRng() * Math.PI * 2,
                age: 0, life: 0.8 + behRng() * 1,
                type: 'rock'
            });
        }
        asteroidImpacts.push({
            x: a.x + (behRng() - 0.5) * impactR,
            y: a.y - behRng() * 10,
            vx: (behRng() - 0.5) * 40,
            vy: -20 - behRng() * 50,
            r: 4 + behRng() * 8,
            g: a.g + 40 + bri(0, 20),
            spin: 0, angle: 0,
            age: 0, life: 1 + behRng() * 1,
            type: 'dustball'
        });
        asteroidImpacts.push({
            x: a.x, y: a.y,
            vx: 0, vy: 0,
            r: 3, g: a.g + 20,
            spin: 0, angle: 0,
            age: 0, life: 0.8,
            type: 'shockwave',
            maxR: impactR * 3
        });
    }
    function updateAsteroidImpacts(dt) {
        while (asteroidImpacts.length > 15) asteroidImpacts.shift();
        for (var i = asteroidImpacts.length - 1; i >= 0; i--) {
            var d = asteroidImpacts[i];
            d.age += dt;
            if (d.age > d.life) { asteroidImpacts.splice(i, 1); continue; }
            if (d.type === 'rock') {
                d.x += d.vx * dt; d.vy += 220 * dt; d.y += d.vy * dt;
                d.angle += d.spin * dt;
                if (d.y > GROUND) { d.y = GROUND; d.vy *= -0.3; d.vx *= 0.6; if (Math.abs(d.vy) < 8) d.vy = 0; }
            } else if (d.type === 'dustball') {
                d.x += d.vx * dt * 0.5; d.y += d.vy * dt * 0.4;
                d.r += dt * 8; d.vx *= 0.97; d.vy *= 0.96;
            } else if (d.type === 'spark') {
                d.x += d.vx * dt; d.vy += 300 * dt; d.y += d.vy * dt;
            } else if (d.type === 'shockwave') {
                d.r += (d.maxR - d.r) * dt * 3;
            }
        }
    }
    function drawAsteroidImpacts(c) {
        for (var i = 0; i < asteroidImpacts.length; i++) {
            var d = asteroidImpacts[i];
            var alpha = Math.max(0, 1 - d.age / d.life);
            if (d.type === 'rock') {
                c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
                c.beginPath();
                var pts = 5 + Math.floor(d.r);
                for (var p = 0; p < pts; p++) {
                    var pa = (p / pts) * Math.PI * 2;
                    var pr = d.r * (0.6 + hashJ(p, d.g) * 0.4);
                    if (p === 0) c.moveTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
                    else c.lineTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
                }
                c.closePath();
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + (alpha * 0.85) + ')';
                c.fill();
                c.strokeStyle = 'rgba(' + (d.g - 25) + ',' + (d.g - 25) + ',' + (d.g - 25) + ',' + (alpha * 0.6) + ')';
                c.lineWidth = 0.4; c.stroke();
                c.restore();
            } else if (d.type === 'dustball') {
                c.beginPath(); c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + (alpha * 0.15) + ')';
                c.fill();
            } else if (d.type === 'spark') {
                var sa = alpha * 0.9;
                stk(c, d.x, d.y, d.x - d.vx * 0.02, d.y - d.vy * 0.02, 0.3, d.g, sa, 0);
                c.beginPath(); c.arc(d.x, d.y, 0.8, 0, Math.PI * 2);
                c.fillStyle = 'rgba(' + d.g + ',' + d.g + ',' + d.g + ',' + sa + ')';
                c.fill();
            } else if (d.type === 'shockwave') {
                var swA = alpha * 0.3;
                arcStr(c, d.x, d.y, d.r, d.r * 0.3, 0, Math.PI * 2, 0.15, 0.15, d.g + 30, swA);
                arcStr(c, d.x, d.y, d.r * 0.9, d.r * 0.25, 0, Math.PI * 2, 0.2, 0.08, d.g + 50, swA * 0.5);
            } else if (d.type === 'crater') {
                var crA = alpha * 0.4;
                arcStr(c, d.x, d.y, d.r, d.r * 0.25, 0, Math.PI * 2, 0.2, 0.2, d.g, crA);
                for (var ci = 0; ci < 6; ci++) {
                    var ca = (ci / 6) * Math.PI * 2 + 0.3;
                    var cr1 = d.r * 0.4, cr2 = d.r * (1.1 + hashJ(ci, d.g) * 0.3);
                    stk(c, d.x + Math.cos(ca) * cr1, d.y + Math.sin(ca) * cr1 * 0.3,
                        d.x + Math.cos(ca) * cr2, d.y + Math.sin(ca) * cr2 * 0.3,
                        0.15, d.g - 15, crA * 0.6, 0);
                }
            }
        }
    }
    function updateAsteroid(a, dt) {
        if (a.exploded) {
            a.explodeAge += dt;
            if (a.explodeAge > 2.5) a.alive = false;
            return;
        }
        a.x += a.vx * dt; a.y += a.vy * dt; a.angle += a.spin * dt;
        a.fireTrailPhase += dt * 20;
        if (a.y > GROUND - 20) {
            a.exploded = true; a.explodeAge = 0;
            spawnAsteroidImpact(a);
            var closest = null, closestDist = 999;
            for (var i = 0; i < buildings.length; i++) {
                var bdist = Math.abs(buildings[i].x + buildings[i].w / 2 - a.x);
                if (bdist < closestDist) { closestDist = bdist; closest = buildings[i]; }
            }
            if (closest && closestDist < closest.w + 40) {
                damageBuilding(closest);
            }
            killNearbyPeds(a.x);
        }
    }
    function drawAsteroid(c, a) {
        if (a.exploded) {
            var alpha = Math.max(0, 1 - a.explodeAge / 2.5);
            var flashA = Math.max(0, 1 - a.explodeAge / 0.3);
            if (flashA > 0) {
                c.beginPath(); c.arc(a.x, a.y, a.r * 4, 0, Math.PI * 2);
                c.fillStyle = 'rgba(255,100,50,' + (flashA * 0.35) + ')';
                c.fill();
            }
            return;
        }
        var ang = Math.atan2(a.vy, a.vx);
        var len = a.r * 2.5;
        var wid = a.r * 0.55;
        c.save(); c.translate(a.x, a.y); c.rotate(ang);

        /* missile body — elongated cylinder (reddish enemy) */
        c.beginPath();
        c.moveTo(len, 0);
        c.lineTo(len * 0.3, -wid);
        c.lineTo(-len * 0.7, -wid * 0.9);
        c.lineTo(-len, -wid * 0.5);
        c.lineTo(-len, wid * 0.5);
        c.lineTo(-len * 0.7, wid * 0.9);
        c.lineTo(len * 0.3, wid);
        c.closePath();
        c.fillStyle = 'rgba(160,40,35,0.85)';
        c.fill();
        c.strokeStyle = 'rgba(120,25,20,0.75)';
        c.lineWidth = 0.4; c.stroke();

        /* nose cone — pointed tip */
        c.beginPath();
        c.moveTo(len * 1.5, 0);
        c.lineTo(len * 0.3, -wid * 0.7);
        c.lineTo(len * 0.3, wid * 0.7);
        c.closePath();
        c.fillStyle = 'rgba(200,50,40,0.9)';
        c.fill();
        c.stroke();

        /* body band details */
        stkC(c, -len * 0.2, -wid * 0.85, -len * 0.2, wid * 0.85, 0.12, 180, 60, 50, 0.4);
        stkC(c, len * 0.1, -wid * 0.9, len * 0.1, wid * 0.9, 0.1, 170, 55, 45, 0.35);
        /* warhead marking */
        stkC(c, len * 0.6, -wid * 0.4, len * 0.6, wid * 0.4, 0.08, 220, 80, 60, 0.3);

        /* tail fins — 4 stabilizers */
        stkC(c, -len * 0.8, -wid * 0.8, -len * 1.1, -wid * 2, 0.25, 130, 30, 25, 0.7);
        stkC(c, -len * 1.1, -wid * 2, -len * 0.5, -wid * 0.9, 0.15, 130, 30, 25, 0.5);
        stkC(c, -len * 0.8, wid * 0.8, -len * 1.1, wid * 2, 0.25, 130, 30, 25, 0.7);
        stkC(c, -len * 1.1, wid * 2, -len * 0.5, wid * 0.9, 0.15, 130, 30, 25, 0.5);

        c.restore();

        /* exhaust trail — oriented opposite to velocity */
        var tailX = a.x - Math.cos(ang) * len;
        var tailY = a.y - Math.sin(ang) * len;
        var perpX = -Math.sin(ang);
        var perpY = Math.cos(ang);
        var trailLen = Math.min(a.y + 40, 60);
        for (var t = 0; t < trailLen; t += 3) {
            var tFrac = t / trailLen;
            var ta = Math.max(0, 0.45 - tFrac * 0.45);
            var tw = wid * 0.6 * (1 + tFrac * 2);
            var wobble = Math.sin(t * 0.4 + a.fireTrailPhase) * (1 + t * 0.04);
            var tx = tailX - Math.cos(ang) * t + perpX * wobble;
            var ty = tailY - Math.sin(ang) * t + perpY * wobble;
            var tg = a.g + 40 + Math.floor(tFrac * 50);
            c.beginPath(); c.arc(tx, ty, tw, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + Math.min(220, tg + 80) + ',' + Math.min(100, tg + 20) + ',' + Math.min(60, tg) + ',' + (ta * 0.35) + ')';
            c.fill();
        }
        /* exhaust core glow — reddish-orange */
        var exLen = len * 0.8 + Math.sin(a.fireTrailPhase) * len * 0.3;
        stkC(c, tailX, tailY,
            tailX - Math.cos(ang) * exLen, tailY - Math.sin(ang) * exLen,
            wid * 0.4, 255, 120, 40, 0.45);
    }

    function killNearbyPeds(x) {
        for (var i = peds.length - 1; i >= 0; i--) {
            if (Math.abs(peds[i].x - x) < 40) peds[i].alive = false;
        }
    }


    function updateStrikeSystem(dt) {
        var activeConstructions = 0;
        for (var ci = 0; ci < constructions.length; ci++) {
            if (!constructions[ci].done) activeConstructions++;
        }
        var canDestroy = buildings.length > 5 && activeConstructions < 10;

        strikeTimer -= dt;
        if (strikeTimer <= 0) {
            strikeTimer = br(3, 6);
        }
        if (damageTimer > 0) {
            damageTimer -= dt;
            if (damageTimer <= 0 && pendingDamage) {
                if (canDestroy) {
                    damageBuilding(pendingDamage);
                    killNearbyPeds(pendingDamage.x + pendingDamage.w / 2);
                }
                pendingDamage = null;
            }
        }

        /* (natural asteroids removed — only aliens launch missiles now) */

        DISASTER.shakeX *= 0.92;
        DISASTER.shakeY *= 0.92;
    }

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
    /* color stroke — accepts r,g,b separately */
    function stkC(c, x1, y1, x2, y2, w, r, g, b, a, jit) {
        if (a === undefined) a = 1;
        if (jit === undefined) jit = 0.35;
        var jx1 = x1 + hashJ(x1, y1) * jit;
        var jy1 = y1 + hashJ(y1, x1) * jit;
        var jx2 = x2 + hashJ(x2, y2) * jit;
        var jy2 = y2 + hashJ(y2, x2) * jit;
        c.beginPath(); c.moveTo(jx1, jy1); c.lineTo(jx2, jy2);
        c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        c.lineWidth = w; c.lineCap = 'round'; c.stroke();
    }
    /* color flat stroke */
    function stkFlatC(c, x1, y1, x2, y2, w, r, g, b, a) {
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
        c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a || 1) + ')';
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
    function arcStrC(c, cx, cy, rx, ry, a1, a2, step, w, r, g, b, a) {
        for (var t = a1; t < a2; t += step) {
            var n = Math.min(t + step, a2);
            stkC(c, cx + Math.cos(t) * rx, cy + Math.sin(t) * ry,
                cx + Math.cos(n) * rx, cy + Math.sin(n) * ry, w, r, g, b, a, 0.2);
        }
    }

    function rectStk(c, x, y, w, h, lw, g, a) {
        stk(c, x, y, x + w, y, lw, g, a); stk(c, x + w, y, x + w, y + h, lw, g, a);
        stk(c, x + w, y + h, x, y + h, lw, g, a); stk(c, x, y + h, x, y, lw, g, a);
    }
    function rectStkC(c, x, y, w, h, lw, r, g, b, a) {
        stkC(c, x, y, x + w, y, lw, r, g, b, a); stkC(c, x + w, y, x + w, y + h, lw, r, g, b, a);
        stkC(c, x + w, y + h, x, y + h, lw, r, g, b, a); stkC(c, x, y + h, x, y, lw, r, g, b, a);
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
    function hatchC(c, x, y, w, h, angle, sp, lw, cr, cg, cb, a) {
        if (a === undefined) a = 1;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var d = Math.sqrt(w * w + h * h);
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        for (var t = -d; t < d * 2; t += sp) {
            var ox = x + w / 2 + t * cos, oy = y + h / 2 + t * sin;
            stkC(c, ox - d * sin, oy + d * cos, ox + d * sin, oy - d * cos, lw, cr, cg, cb, a, 0.15);
        }
        c.restore();
    }

    function stipple(c, x, y, w, h, count, r, g, a) {
        for (var i = 0; i < count; i++) {
            var px = x + layoutRng() * w, py = y + layoutRng() * h;
            stk(c, px, py, px + 0.3, py + 0.3, r, g, a || 1, 0);
        }
    }
    function stippleC(c, x, y, w, h, count, sz, cr, cg, cb, a) {
        for (var i = 0; i < count; i++) {
            var px = x + layoutRng() * w, py = y + layoutRng() * h;
            stkC(c, px, py, px + 0.3, py + 0.3, sz, cr, cg, cb, a || 1, 0);
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
                var cFloors = lri(18, 40), cFlH = lri(8, 13);
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

            var floors = lri(18, 50);
            var centerBias = 1 - Math.abs(x / W - 0.5) * 1.2;
            floors = Math.max(12, Math.floor(floors * (0.5 + centerBias * 0.7)));
            var flH = lri(8, 13), bh = floors * flH;
            var style = weightedPick(
                ['block', 'setback', 'spire', 'wide', 'brownstone'],
                [0.4, 0.2, 0.15, 0.15, 0.1]);

            var chimney = layoutRng() < 0.12;
            var bldColors = [
                [90, 110, 150], [70, 100, 140], [80, 95, 135],
                [100, 120, 155], [85, 105, 145], [110, 125, 160],
                [95, 115, 150], [75, 95, 130], [105, 118, 148],
                [120, 135, 165], [88, 108, 142], [78, 98, 138]
            ];
            var bc = bldColors[lri(0, bldColors.length)];
            buildings.push({
                x: x, w: bw, floors: floors, floorH: flH,
                h: bh, y: GROUND - bh, style: style,
                g: lri(55, 130),
                br: bc[0], bg: bc[1], bb: bc[2],
                hasFireEscape: layoutRng() < 0.28,
                chimney: chimney,
                chimneyX: chimney ? x + lr(3, bw - 3) : 0,
                hasRoofTrees: layoutRng() < 0.35
            });

            x += bw + lr(3, 14);
        }
    }

    /* ═══════════ DRAW A SINGLE BUILDING (to any ctx) ═══════════ */
    function drawBuilding(c, b) {
        var x = b.x, y = b.y, w = b.w, h = b.h;
        var floors = b.floors, flH = b.floorH;
        var bR = b.br || 90, bG = b.bg || 110, bB = b.bb || 150;

        /* atmospheric perspective — farther up = lighter */
        var depthFade = Math.max(0, (GROUND - y) / (GROUND - HORIZON) * 0.35);
        var rAdj = Math.min(230, Math.floor(bR + depthFade * 80));
        var gAdj = Math.min(235, Math.floor(bG + depthFade * 80));
        var bAdj = Math.min(240, Math.floor(bB + depthFade * 60));

        /* facade fill — bluish hatching */
        hatchC(c, x, y, w, h, Math.PI * 0.48, 2, 0.08, rAdj + 15, gAdj + 15, bAdj + 10, 0.5);

        /* brick texture for brick-style buildings */
        if (b.style === 'block' || b.style === 'brownstone') {
            for (var row = y + 1; row < y + h - 1; row += 2.8) {
                var off = (Math.floor(row / 2.8) % 2) * 3.5;
                for (var bx = x + 1 + off; bx < x + w - 1; bx += 7) {
                    stkC(c, bx, row, bx, row + 2.3, 0.06, rAdj + 10, gAdj + 10, bAdj + 5, 0.4);
                }
                stkC(c, x + 1, row, x + w - 1, row, 0.04, rAdj + 18, gAdj + 18, bAdj + 12, 0.3);
            }
        }

        /* floor lines */
        for (var f = 0; f <= floors; f++) {
            var fy = y + f * flH;
            stkC(c, x, fy, x + w, fy, 0.25, Math.max(0, rAdj - 15), Math.max(0, gAdj - 15), Math.max(0, bAdj - 10), 0.6);
        }

        /* outline */
        rectStkC(c, x, y, w, h, 0.6, Math.max(20, rAdj - 40), Math.max(25, gAdj - 40), Math.max(30, bAdj - 35), 1);

        /* windows — blue-tinted glass */
        var winW = b.style === 'wide' ? Math.min(w - 6, lri(8, 14)) : lri(4, 7);
        var winH = flH - 3.5;
        var winGap = lri(2, 5);
        for (var f = 0; f < floors; f++) {
            var fy = y + f * flH + 1.8;
            for (var wx = x + 3; wx + winW < x + w - 2; wx += winW + winGap) {
                rectStkC(c, wx, fy, winW, winH, 0.3, rAdj - 5, gAdj, bAdj + 10, 0.8);
                /* glass — blue-sky reflection */
                hatchC(c, wx + 0.5, fy + 0.5, winW - 1, winH - 1, 0.78, 1.5, 0.06, 140, 170, 210, 0.35);
                /* sill */
                stkC(c, wx - 0.4, fy + winH, wx + winW + 0.4, fy + winH, 0.4, Math.max(0, rAdj - 12), Math.max(0, gAdj - 12), Math.max(0, bAdj - 8), 1);
                /* mullion */
                if (winW > 5 && layoutRng() > 0.3) {
                    stkC(c, wx + winW / 2, fy, wx + winW / 2, fy + winH, 0.12, rAdj - 5, gAdj, bAdj + 5, 0.6);
                }
                /* occasional lit window marker */
                if (layoutRng() < 0.08) {
                    litWindows.push({ x: wx + 0.5, y: fy + 0.5, w: winW - 1, h: winH - 1,
                        phase: layoutRng() * Math.PI * 2, period: lr(20, 60) });
                }
            }
        }

        /* roof edge */
        stkC(c, x - 1.5, y, x + w + 1.5, y, 1.2, Math.max(0, rAdj - 30), Math.max(0, gAdj - 30), Math.max(0, bAdj - 25), 1);
        /* parapet */
        stkC(c, x - 1, y - 2.5, x + w + 1, y - 2.5, 0.5, rAdj - 5, gAdj - 5, bAdj, 1);
        stkC(c, x - 1, y, x - 1, y - 2.5, 0.35, rAdj, gAdj, bAdj, 1);
        stkC(c, x + w + 1, y, x + w + 1, y - 2.5, 0.35, rAdj, gAdj, bAdj, 1);

        /* rooftop trees — vibrant green */
        if (b.hasRoofTrees) {
            var treeCount = lri(1, 4);
            for (var ti = 0; ti < treeCount; ti++) {
                var tx = x + lr(4, w - 4);
                var treeH = lr(4, 10);
                stkC(c, tx, y - 2, tx, y - 2 - treeH, 0.6, 90, 65, 40, 0.8, 0);
                var tcr = lr(3, 6);
                arcStrC(c, tx, y - 2 - treeH - tcr * 0.3, tcr, tcr * 0.6, 0, Math.PI * 2, 0.3, 0.3, 30 + lri(0, 40), 120 + lri(0, 60), 20 + lri(0, 30), 0.7);
                stippleC(c, tx - tcr, y - 2 - treeH - tcr * 0.6, tcr * 2, tcr, lri(3, 8), 0.2, 25 + lri(0, 35), 100 + lri(0, 50), 15 + lri(0, 20), 0.3);
            }
        }

        /* rooftop equipment */
        if (layoutRng() > 0.55) {
            /* water tower */
            var wtx = x + lr(5, w - 15);
            rectStkC(c, wtx, y - 13, 10, 8, 0.4, rAdj + 5, gAdj + 5, bAdj + 3, 1);
            stkC(c, wtx + 2, y - 5, wtx + 2, y - 2, 0.25, rAdj, gAdj, bAdj, 1);
            stkC(c, wtx + 8, y - 5, wtx + 8, y - 2, 0.25, rAdj, gAdj, bAdj, 1);
            stkC(c, wtx, y - 13, wtx + 5, y - 16, 0.35, rAdj + 5, gAdj + 5, bAdj + 3, 1);
            stkC(c, wtx + 10, y - 13, wtx + 5, y - 16, 0.35, rAdj + 5, gAdj + 5, bAdj + 3, 1);
            stkC(c, wtx, y - 10, wtx + 10, y - 10, 0.2, rAdj + 10, gAdj + 10, bAdj + 5, 1);
        }
        if (layoutRng() > 0.5) {
            /* antenna */
            var ax = x + lr(3, w - 3), ah = lr(10, 28);
            stkC(c, ax, y - 2, ax, y - 2 - ah, 0.35, 100, 100, 110, 1);
            for (var ay = y - 6; ay > y - 2 - ah; ay -= 7) {
                stkC(c, ax - 2.5, ay, ax + 2.5, ay, 0.15, 120, 120, 130, 1);
            }
        }
        if (layoutRng() > 0.55) {
            /* AC units */
            for (var i = 0; i < lri(1, 3); i++) {
                var acx = x + lr(3, w - 10);
                rectStkC(c, acx, y - 4.5, 6, 3.5, 0.35, rAdj + 15, gAdj + 15, bAdj + 10, 1);
                arcStrC(c, acx + 3, y - 2.5, 1.5, 1.5, 0, Math.PI * 2, 0.5, 0.15, rAdj + 25, gAdj + 25, bAdj + 18, 0.6);
            }
        }
        /* chimney — brick red */
        if (b.chimney) {
            var cx = b.chimneyX;
            rectStkC(c, cx - 2, y - 10, 4, 10, 0.5, 140, 70, 50, 1);
            stkC(c, cx - 2.5, y - 10, cx + 2.5, y - 10, 0.6, 120, 55, 35, 1);
            chimneys.push({ x: cx, y: y - 10 });
        }

        /* fire escape — dark iron */
        if (b.hasFireEscape && floors > 3) {
            var fex = layoutRng() > 0.5 ? x + 1.5 : x + w - 7;
            for (var f = 1; f < floors; f++) {
                var fy = y + f * flH;
                rectStkC(c, fex, fy - 0.8, 5.5, 1.2, 0.2, 45, 45, 50, 0.7);
                stkC(c, fex + 1.5, fy + 0.5, fex + 1.5, fy + flH - 0.5, 0.12, 50, 50, 55, 0.6, 0);
                stkC(c, fex + 4, fy + 0.5, fex + 4, fy + flH - 0.5, 0.12, 50, 50, 55, 0.6, 0);
                for (var ry = fy + 1.5; ry < fy + flH; ry += 2.2) {
                    stkC(c, fex + 2, ry, fex + 3.5, ry, 0.1, 55, 55, 60, 0.5);
                }
            }
        }

        /* ground floor / storefront */
        var gfY = y + (floors - 1) * flH;
        /* awning — colored canopy */
        var awnColors = [[160, 40, 40], [40, 80, 140], [50, 120, 60], [140, 100, 50], [120, 50, 100]];
        var awn = awnColors[lri(0, awnColors.length)];
        stkC(c, x - 1.5, gfY + 1.2, x + w + 1.5, gfY + 1.2, 0.9, awn[0], awn[1], awn[2], 1);
        stkC(c, x - 2, gfY + 3, x + w + 2, gfY + 3, 0.25, awn[0] + 20, awn[1] + 20, awn[2] + 20, 1);
        for (var sx = x; sx < x + w; sx += 3.5) {
            stkC(c, sx, gfY + 1.2, sx + 1.8, gfY + 3, 0.08, awn[0] + 40, awn[1] + 40, awn[2] + 40, 0.5);
        }
        /* door */
        var dx = x + lr(w * 0.3, w * 0.65);
        rectStkC(c, dx, gfY + 3.5, 5.5, flH - 4.5, 0.45, 80, 55, 35, 1);
        stkC(c, dx + 4.5, gfY + flH * 0.55, dx + 4.5, gfY + flH * 0.55 + 1, 0.35, 180, 160, 60, 1);
        /* display window */
        rectStkC(c, x + 2.5, gfY + 3.5, dx - x - 4, flH - 4.5, 0.45, rAdj + 5, gAdj + 5, bAdj + 8, 0.8);
        hatchC(c, x + 3, gfY + 4, dx - x - 5, flH - 6, 0.7, 2, 0.05, 160, 190, 220, 0.25);

        /* cornices — slightly darker */
        for (var f = 0; f < floors; f += lri(3, 5)) {
            var fy = y + f * flH;
            stkC(c, x - 1.2, fy, x + w + 1.2, fy, 0.65, Math.max(0, rAdj - 15), Math.max(0, gAdj - 15), Math.max(0, bAdj - 10), 0.7);
        }
    }

    /* ═══════════ PAINT STATIC BACKGROUND ═══════════ */
    function paintBg() {
        var c = bgC;
        /* sky — white-ish gradient matching navbar */
        for (var y = 0; y < GROUND + 30; y += 1) {
            var t = y < HORIZON ? y / HORIZON : 1;
            var sr = Math.floor(210 + t * 35);
            var sg = Math.floor(215 + t * 30);
            var sb = Math.floor(225 + t * 20);
            if (y >= HORIZON) { sr = 240; sg = 242; sb = 245; }
            stkFlatC(c, 0, y, W, y, 1.5, sr, sg, sb, 1);
        }
        /* sky hatching (very faint) */
        hatch(c, 0, 0, W, HORIZON, 0.15, 8, 0.06, 230, 0.04);

        /* ── MOUNTAINS ── */
        var mtnSegs = [];
        for (var x = 0; x <= W; x += 3) {
            var peak = Math.sin(x * 0.0018 + 1.2) * 55
                     + Math.sin(x * 0.005 + 0.7) * 30
                     + Math.sin(x * 0.013) * 12
                     + Math.sin(x * 0.031) * 5;
            mtnSegs.push({ x: x, y: HORIZON - peak - 10 });
        }
        /* mountain fill — light whitish-grey tones */
        for (var i = 0; i < mtnSegs.length - 1; i++) {
            var s1 = mtnSegs[i], s2 = mtnSegs[i + 1];
            stkC(c, s1.x, s1.y, s2.x, s2.y, 0.5, 185, 190, 200, 0.65, 0.1);
            for (var fy = s1.y; fy < HORIZON + 50; fy += 2) {
                var mr = 190 + lri(0, 15), mg = 195 + lri(0, 15), mb = 205 + lri(0, 10);
                stkC(c, s1.x, fy, s2.x, fy, 0.1, mr, mg, mb, 0.3, 0.08);
            }
        }
        /* mountain ridge hatching — subtle grey */
        for (var i = 0; i < mtnSegs.length - 1; i += 2) {
            var s1 = mtnSegs[i];
            var depth = HORIZON + 40 - s1.y;
            for (var j = 0; j < depth; j += 4) {
                var hy = s1.y + j;
                var hx1 = s1.x + j * 0.3;
                var hx2 = s1.x + j * 0.3 + 3;
                stkC(c, hx1, hy, hx2, hy + 3, 0.06, 175 + lri(0, 15), 180 + lri(0, 15), 195 + lri(0, 15), 0.25, 0.1);
            }
        }
        /* snow caps on peaks — bright white */
        for (var i = 1; i < mtnSegs.length - 1; i++) {
            var prev = mtnSegs[i - 1], cur = mtnSegs[i], next = mtnSegs[i + 1];
            if (cur.y < prev.y && cur.y < next.y && cur.y < HORIZON - 40) {
                var snowH = Math.min(12, (HORIZON - 40 - cur.y) * 0.4);
                for (var sy = cur.y; sy < cur.y + snowH; sy += 1.5) {
                    var sw = (sy - cur.y) * 1.2 + 2;
                    stkC(c, cur.x - sw, sy, cur.x + sw, sy, 0.15, 245, 248, 252, 0.5, 0.05);
                }
            }
        }
        /* second mountain range — farther back, very light */
        for (var x = 0; x < W; x += 3) {
            var peak2 = Math.sin(x * 0.0025 + 3) * 35
                      + Math.sin(x * 0.007 + 1.5) * 18
                      + Math.sin(x * 0.018) * 8;
            var my2 = HORIZON - peak2 + 15;
            var nx = x + 3;
            var peak2n = Math.sin(nx * 0.0025 + 3) * 35
                       + Math.sin(nx * 0.007 + 1.5) * 18
                       + Math.sin(nx * 0.018) * 8;
            var my2n = HORIZON - peak2n + 15;
            if (my2 < HORIZON + 20) {
                stkC(c, x, my2, nx, my2n, 0.3, 205, 208, 218, 0.45, 0.1);
            }
        }

        /* distant hills — white-ish, matching navbar */
        for (var x = 0; x < W; x += 2) {
            var hh = Math.sin(x * 0.003) * 28 + Math.sin(x * 0.0085) * 16 + Math.sin(x * 0.019) * 7;
            var nx = x + 2;
            var nh = Math.sin(nx * 0.003) * 28 + Math.sin(nx * 0.0085) * 16 + Math.sin(nx * 0.019) * 7;
            stkC(c, x, HORIZON + hh, nx, HORIZON + nh, 0.4, 200, 205, 210, 0.7, 0.15);
        }
        /* hill fill below */
        for (var y = HORIZON - 25; y < HORIZON + 55; y += 2.5) {
            for (var x = 0; x < W; x += 3) {
                var hh = Math.sin(x * 0.003) * 28 + Math.sin(x * 0.0085) * 16 + Math.sin(x * 0.019) * 7;
                if (y > HORIZON + hh) {
                    stkC(c, x, y, x + 3, y, 0.15, 215 + lri(0, 15), 218 + lri(0, 15), 222 + lri(0, 12), 0.35, 0.1);
                }
            }
        }

        /* ── COMPLEX SKY: stars, nebulae, constellations ── */
        /* stars — scattered across the sky (colored tints) */
        for (var i = 0; i < 250; i++) {
            var sx = lr(0, W), sy = lr(2, HORIZON * 0.9);
            var sr2 = lr(0.2, 1.2);
            var starType = layoutRng();
            var sR, sG, sB;
            if (starType < 0.3) { sR = lri(200, 255); sG = lri(200, 240); sB = lri(150, 200); }
            else if (starType < 0.5) { sR = lri(150, 200); sG = lri(180, 220); sB = lri(220, 255); }
            else { sR = lri(220, 255); sG = lri(220, 255); sB = lri(220, 255); }
            var sa = lr(0.15, 0.55);
            c.beginPath();
            c.arc(sx, sy, sr2, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + sR + ',' + sG + ',' + sB + ',' + sa + ')';
            c.fill();
            if (sr2 > 0.8 && layoutRng() < 0.2) {
                for (var r = 0; r < 4; r++) {
                    var a = r * Math.PI / 2;
                    stkC(c, sx + Math.cos(a) * sr2, sy + Math.sin(a) * sr2,
                        sx + Math.cos(a) * (sr2 + 2.5), sy + Math.sin(a) * (sr2 + 2.5),
                        0.08, sR, sG, sB, sa * 0.5, 0);
                }
            }
        }
        /* constellations — connect nearby bright stars */
        var constellationStars = [];
        for (var i = 0; i < 30; i++) {
            constellationStars.push({ x: lr(20, W - 20), y: lr(5, HORIZON * 0.7) });
        }
        for (var i = 0; i < constellationStars.length - 1; i++) {
            var s1 = constellationStars[i], s2 = constellationStars[i + 1];
            var dist = Math.sqrt((s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y));
            if (dist < 120) {
                stkC(c, s1.x, s1.y, s2.x, s2.y, 0.06, 140, 160, 200, 0.12, 0);
            }
        }
        /* nebula clouds — colored hazes (purple, teal, rose) */
        var nebColors = [[120, 80, 160], [60, 140, 150], [160, 90, 120], [80, 100, 170], [150, 120, 80]];
        for (var i = 0; i < 5; i++) {
            var nx = lr(W * 0.1, W * 0.9), ny = lr(5, HORIZON * 0.6);
            var nr = lr(25, 65);
            var ng = c.createRadialGradient(nx, ny, 0, nx, ny, nr);
            var nc = nebColors[i % nebColors.length];
            ng.addColorStop(0, 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',0.08)');
            ng.addColorStop(1, 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',0)');
            c.fillStyle = ng;
            c.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
        }
    }

    /* ═══════════ PAINT STATIC CITY ═══════════ */
    function paintCity() {
        var c = cityC;
        c.clearRect(0, 0, W, H);

        /* draw all complete buildings */
        chimneys = []; litWindows = [];
        for (var i = 0; i < buildings.length; i++) drawBuilding(c, buildings[i]);

        /* north sidewalk — warm concrete tan */
        for (var x = 0; x < W; x += 1.5) {
            stkFlatC(c, x, SIDEWALK_N, x, SIDEWALK_N_B, 1.2, 185 + lri(-5, 5), 175 + lri(-5, 5), 160 + lri(-5, 5), 1);
        }
        /* sidewalk cracks */
        for (var x = lr(20, 60); x < W; x += lr(30, 80)) {
            stkC(c, x, SIDEWALK_N, x + lr(-3, 3), SIDEWALK_N_B, 0.08, 140, 130, 115, 0.5);
        }
        stkC(c, 0, SIDEWALK_N_B, W, SIDEWALK_N_B, 0.8, 130, 120, 105, 1); /* curb */

        /* road surface — dark asphalt grey */
        for (var x = 0; x < W; x += 1.5) {
            stkFlatC(c, x, SIDEWALK_N_B + 1, x, SIDEWALK_S - 1, 1.2, 75 + lri(-5, 5), 75 + lri(-5, 5), 80 + lri(-5, 5), 1);
        }
        /* road texture — subtle grain */
        for (var y = SIDEWALK_N_B + 2; y < SIDEWALK_S; y += 4) {
            for (var x = 0; x < W; x += lr(8, 20)) {
                stkC(c, x, y, x + lr(1, 4), y + lr(-0.5, 0.5), 0.06, 65 + lri(0, 15), 65 + lri(0, 15), 70 + lri(0, 15), 0.3, 0.1);
            }
        }

        /* center line dashes — yellow */
        for (var x = 0; x < W; x += 28) {
            stkC(c, x, CENTER_Y, x + 14, CENTER_Y, 1.2, 220, 200, 60, 0.8, 0);
        }

        /* crosswalks — white stripes */
        crosswalks = [];
        for (var cx = lr(100, 200); cx < W; cx += lr(200, 380)) {
            crosswalks.push(cx);
            for (var stripe = 0; stripe < 5; stripe++) {
                var sy = SIDEWALK_N_B + 3 + stripe * (SIDEWALK_S - SIDEWALK_N_B - 6) / 5;
                stkC(c, cx - 9, sy, cx + 9, sy, 2.5, 230, 230, 225, 0.65, 0);
            }
        }

        /* south sidewalk — warm concrete tan */
        for (var x = 0; x < W; x += 1.5) {
            stkFlatC(c, x, SIDEWALK_S, x, SIDEWALK_S_B, 1.2, 185 + lri(-5, 5), 175 + lri(-5, 5), 160 + lri(-5, 5), 1);
        }
        stkC(c, 0, SIDEWALK_S, W, SIDEWALK_S, 0.8, 130, 120, 105, 1);

        /* street lamps */
        for (var x = lr(35, 75); x < W; x += lr(80, 150)) {
            stk(c, x, GROUND, x, GROUND - 26, 0.7, 52);
            stk(c, x - 5, GROUND - 26, x, GROUND - 28, 0.4, 56);
            stk(c, x, GROUND - 28, x + 5, GROUND - 26, 0.4, 56);
            arcStr(c, x, GROUND - 27, 2.5, 2, 0, Math.PI * 2, 0.45, 0.25, 215, 0.5);
        }

        /* fire hydrants — red */
        for (var x = lr(55, 120); x < W; x += lr(150, 280)) {
            stkC(c, x, GROUND, x, GROUND - 5, 1.8, 180, 40, 35, 1);
            stkC(c, x - 2, GROUND - 5, x + 2, GROUND - 5, 0.8, 160, 30, 25, 1);
            stkC(c, x - 1.5, GROUND - 3, x + 1.5, GROUND - 3, 0.4, 200, 50, 40, 1);
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

        /* trees — vibrant green foliage, brown trunk */
        for (var x = lr(28, 70); x < W; x += lr(55, 130)) {
            var th = lr(10, 19);
            stkC(c, x, GROUND, x, GROUND - th, 1.2, 95 + lri(-10, 10), 65 + lri(-10, 10), 30 + lri(-10, 10), 1);
            var cr = lr(5, 11);
            var treeType = layoutRng();
            var tR, tG, tB;
            if (treeType < 0.3) { tR = 20 + lri(0, 25); tG = 140 + lri(0, 50); tB = 20 + lri(0, 20); }
            else if (treeType < 0.6) { tR = 50 + lri(0, 30); tG = 160 + lri(0, 40); tB = 30 + lri(0, 25); }
            else if (treeType < 0.85) { tR = 30 + lri(0, 20); tG = 120 + lri(0, 50); tB = 40 + lri(0, 30); }
            else { tR = 180 + lri(0, 40); tG = 60 + lri(0, 40); tB = 20 + lri(0, 20); }
            arcStrC(c, x, GROUND - th - cr * 0.45, cr, cr * 0.65, 0, Math.PI * 2, 0.25, 0.35, tR, tG, tB, 0.8);
            arcStrC(c, x - cr * 0.3, GROUND - th - cr * 0.3, cr * 0.6, cr * 0.5, 0, Math.PI * 2, 0.3, 0.25, tR + 10, tG + 10, tB + 5, 0.6);
            arcStrC(c, x + cr * 0.3, GROUND - th - cr * 0.35, cr * 0.55, cr * 0.45, 0, Math.PI * 2, 0.3, 0.25, tR + 5, tG + 5, tB + 8, 0.6);
            /* foliage stipple */
            stippleC(c, x - cr, GROUND - th - cr, cr * 2, cr * 1.2, lri(10, 22), 0.3, tR - 10, tG - 10, tB - 5, 0.4);
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

        /* ── WATERFRONT ── */
        /* beach / shoreline — warm sand */
        for (var bx = 0; bx < W; bx += 1.5) {
            stkFlatC(c, bx, BEACH_Y - 3, bx, RIVER_TOP, 1.2, 210 + lri(-8, 8), 190 + lri(-8, 8), 140 + lri(-10, 10), 0.6);
        }
        /* sand texture */
        for (var bx = 0; bx < W; bx += lr(3, 8)) {
            stkC(c, bx, BEACH_Y + lr(-3, 0), bx + lr(0.5, 2), BEACH_Y + lr(-3, 0), 0.1, 195 + lri(-10, 10), 175 + lri(-10, 10), 120 + lri(-10, 10), 0.3, 0.1);
        }
        /* shoreline edge — foam white-blue */
        for (var bx = 0; bx < W; bx += 2) {
            var wave = Math.sin(bx * 0.03) * 1.5 + Math.sin(bx * 0.08) * 0.8;
            stkC(c, bx, RIVER_TOP + wave, bx + 2, RIVER_TOP + Math.sin((bx + 2) * 0.03) * 1.5 + Math.sin((bx + 2) * 0.08) * 0.8,
                0.4, 180, 210, 230, 0.5, 0.1);
        }

        /* train tracks — on top of beach, full width edge to edge */
        var ty = TRACK_Y;
        /* gravel bed */
        stkC(c, 0, ty + 2, W, ty + 2, 12, 140, 130, 110, 0.6);
        /* ties */
        for (var tx = 0; tx < W; tx += 10) {
            stkC(c, tx, ty - 2, tx, ty + 8, 2, 100 + lri(-8, 8), 80 + lri(-5, 5), 50 + lri(-5, 5), 0.8);
        }
        /* rails — steel grey, thick and visible */
        stkC(c, 0, ty, W, ty, 1.5, 90, 90, 100, 1);
        stkC(c, 0, ty + 6, W, ty + 6, 1.5, 90, 90, 100, 1);

        /* river / water — blue gradient */
        for (var wy = RIVER_TOP; wy < RIVER_BOT; wy += 1.5) {
            var depth = (wy - RIVER_TOP) / (RIVER_BOT - RIVER_TOP);
            var wr = Math.floor(40 + depth * 10);
            var wgc = Math.floor(90 + depth * 20);
            var wb = Math.floor(150 - depth * 20);
            stkFlatC(c, 0, wy, W, wy, 1.5, wr, wgc, wb, 0.5);
        }
        /* water ripple hatching */
        for (var wy = RIVER_TOP + 3; wy < RIVER_BOT - 2; wy += lr(4, 8)) {
            for (var wx = 0; wx < W; wx += lr(10, 30)) {
                var rw = lr(5, 18);
                stkC(c, wx, wy, wx + rw, wy + lr(-0.5, 0.5), 0.08, 60 + lri(0, 30), 100 + lri(0, 40), 160 + lri(0, 30), 0.3, 0.1);
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

        /* lighthouse (right side) — red and white stripes */
        var lhx = LIGHTHOUSE_X, lhy = RIVER_TOP;
        /* base / rock */
        arcStrC(c, lhx, lhy + 2, 10, 4, Math.PI, Math.PI * 2, 0.2, 0.5, 100, 95, 85, 0.6);
        stkC(c, lhx - 8, lhy + 2, lhx + 8, lhy + 2, 0.4, 90, 85, 75, 0.5);
        /* tower (tapers upward) */
        stkC(c, lhx - 4, lhy, lhx - 2.5, lhy - 32, 0.6, 80, 30, 25, 1);
        stkC(c, lhx + 4, lhy, lhx + 2.5, lhy - 32, 0.6, 80, 30, 25, 1);
        /* fill — alternating red and white bands */
        for (var ly = lhy; ly > lhy - 32; ly -= 1.5) {
            var taper = 4 - (lhy - ly) / 32 * 1.5;
            var band = Math.floor((lhy - ly) / 8) % 2;
            if (band === 0) { stkFlatC(c, lhx - taper, ly, lhx + taper, ly, 1, 200, 45, 35, 0.45); }
            else { stkFlatC(c, lhx - taper, ly, lhx + taper, ly, 1, 235, 235, 230, 0.45); }
        }
        /* horizontal bands */
        stkC(c, lhx - 3.5, lhy - 10, lhx + 3.5, lhy - 10, 0.5, 60, 55, 50, 0.6);
        stkC(c, lhx - 3, lhy - 20, lhx + 3, lhy - 20, 0.5, 60, 55, 50, 0.6);
        /* lantern room */
        rectStkC(c, lhx - 3, lhy - 36, 6, 4, 0.4, 50, 50, 50, 1);
        /* glass — warm yellow glow */
        stkFlatC(c, lhx - 2, lhy - 35.5, lhx + 2, lhy - 35.5, 3, 255, 230, 100, 0.4);
        /* dome */
        arcStrC(c, lhx, lhy - 36, 3.5, 3, Math.PI, Math.PI * 2, 0.25, 0.4, 60, 60, 60, 0.7);
        /* gallery rail */
        stkC(c, lhx - 4, lhy - 32, lhx + 4, lhy - 32, 0.4, 55, 55, 55, 1);
        for (var rx = lhx - 3.5; rx < lhx + 4; rx += 1.5) {
            stkC(c, rx, lhy - 32, rx, lhy - 33.5, 0.12, 60, 60, 60, 0.5, 0);
        }
        stkC(c, lhx - 4, lhy - 33.5, lhx + 4, lhy - 33.5, 0.25, 55, 55, 55, 0.5);

        /* beach umbrellas & towels (static detail) — colored */
        var umbrellaColors = [[220, 60, 50], [50, 130, 200], [250, 200, 40], [60, 180, 80], [200, 80, 180]];
        var towelColors = [[180, 60, 60], [60, 120, 180], [200, 180, 50], [80, 160, 100], [180, 100, 160]];
        for (var ux = lr(30, 80); ux < W * 0.85; ux += lr(50, 120)) {
            var uy = BEACH_Y + lr(-2, 0);
            var uc = umbrellaColors[lri(0, umbrellaColors.length)];
            var tc = towelColors[lri(0, towelColors.length)];
            /* umbrella pole */
            stkC(c, ux, uy, ux, uy - 8, 0.35, 90, 70, 50, 0.6, 0);
            /* canopy arcs */
            arcStrC(c, ux, uy - 8, 5, 2.5, Math.PI, Math.PI * 2, 0.25, 0.3, uc[0], uc[1], uc[2], 0.5);
            stkC(c, ux - 5, uy - 8, ux + 5, uy - 8, 0.25, uc[0] - 20, uc[1] - 20, uc[2] - 20, 0.5);
            /* towel */
            stkC(c, ux + lr(3, 7), uy, ux + lr(9, 14), uy, 1.5, tc[0], tc[1], tc[2], 0.4, 0);
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

    var vignetteCvs = null, vignetteW = 0, vignetteH = 0;
    function drawVignette(c) {
        if (!vignetteCvs || vignetteW !== W || vignetteH !== H) {
            vignetteCvs = document.createElement('canvas');
            vignetteCvs.width = vignetteW = W;
            vignetteCvs.height = vignetteH = H;
            var vc = vignetteCvs.getContext('2d');
            var g = vc.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(1, 'rgba(0,0,0,0.045)');
            vc.fillStyle = g;
            vc.fillRect(0, 0, W, H);
        }
        c.drawImage(vignetteCvs, 0, 0);
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
        /* ensure minimum 4 seconds total build time */
        var interval = Math.max(4 / Math.max(1, con.floors), con.floorInterval);
        con.buildTimer += dt;
        if (con.buildTimer >= interval) {
            con.buildTimer = 0;
            con.curFloor += 1;
            if (con.curFloor >= con.floors) {
                con.curFloor = con.floors;
                con.done = true;
                var conColors = [
                    [90, 110, 150], [70, 100, 140], [80, 95, 135],
                    [100, 120, 155], [85, 105, 145], [110, 125, 160]
                ];
                var cc = conColors[bri(0, conColors.length)];
                var bld = {
                    x: con.x, w: con.w, floors: con.floors, floorH: con.floorH,
                    h: con.h, y: con.y, style: 'block',
                    g: con.g, br: cc[0], bg: cc[1], bb: cc[2],
                    hasFireEscape: behRng() < 0.3,
                    chimney: behRng() < 0.1,
                    chimneyX: con.x + br(3, con.w - 3),
                    hasRoofTrees: behRng() < 0.35
                };
                buildings.push(bld);
                needsCityRebake = true;
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
        { n: 'moto', w: 14, h: 7, cs: 0.25, ce: 0.7, wt: 0.02 },
        { n: 'police', w: 24, h: 8, cs: 0.18, ce: 0.7, wt: 0.08 }
    ];

    function createVehicle() {
        var lane = bri(0, 4);
        var dir = lane < 2 ? 1 : -1;
        var tp = weightedPick(VTYPES, VTYPES.map(function (t) { return t.wt; }));
        var speed = br(25, 55); /* px/s */
        if (tp.n === 'bus' || tp.n === 'cmixer' || tp.n === 'dump') speed = br(18, 35);
        if (tp.n === 'bike') speed = br(14, 22);
        if (tp.n === 'moto') speed = br(35, 55);
        if (tp.n === 'police') speed = br(40, 65);
        var carColors = [
            [180, 30, 30], [30, 60, 160], [40, 120, 50], [200, 180, 40],
            [60, 60, 65], [140, 140, 145], [200, 200, 205], [100, 40, 120],
            [200, 100, 30], [40, 40, 42], [170, 60, 30], [50, 100, 140]
        ];
        var vc = carColors[bri(0, carColors.length)];
        if (tp.n === 'taxi') vc = [230, 200, 40];
        if (tp.n === 'bus') vc = [200, 160, 30];
        if (tp.n === 'police') vc = [40, 50, 60];
        if (tp.n === 'ambu') vc = [220, 220, 225];
        if (tp.n === 'fire') vc = [200, 40, 30];
        return {
            x: dir > 0 ? -tp.w - 10 : W + 10,
            y: LANE_Y[lane], lane: lane, dir: dir,
            tp: tp, speed: speed, g: bri(35, 120),
            cr: vc[0], cg: vc[1], cb: vc[2],
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
        var x = v.x, y = v.y, d = v.dir, tp = v.tp;
        var w = tp.w * d, h = tp.h;
        var vr = v.cr, vg = v.cg, vb = v.cb;

        /* body — colored */
        stkC(c, x, y, x + w, y, h * 0.5, vr, vg, vb, 1, 0);
        /* outline */
        stkC(c, x, y - h * 0.25, x + w, y - h * 0.25, 0.35, Math.max(0, vr - 30), Math.max(0, vg - 30), Math.max(0, vb - 30), 0.8, 0);
        stkC(c, x, y + h * 0.25, x + w, y + h * 0.25, 0.35, Math.max(0, vr - 30), Math.max(0, vg - 30), Math.max(0, vb - 30), 0.8, 0);

        /* cabin (if not flat-top) */
        if (!tp.flat) {
            var cs = tp.cs, ce = tp.ce;
            stkC(c, x + w * cs, y - h * 0.38, x + w * ce, y - h * 0.38, h * 0.25, Math.min(255, vr + 20), Math.min(255, vg + 20), Math.min(255, vb + 20), 1, 0);
            /* windshield — light blue tint */
            stkC(c, x + w * cs, y - h * 0.25, x + w * (cs + 0.08), y - h * 0.05, 0.3, 140, 170, 200, 0.7, 0);
        } else {
            /* truck bed / flatbed */
            stkC(c, x + w * tp.ce, y - h * 0.2, x + w * 0.95, y - h * 0.2, 0.3, Math.max(0, vr - 15), Math.max(0, vg - 15), Math.max(0, vb - 15), 0.7, 0);
        }

        /* cement mixer drum */
        if (tp.drum) {
            var dcx = x + w * 0.6, dcy = y - h * 0.15;
            var dr = h * 0.3;
            arcStrC(c, dcx, dcy, dr * 1.3, dr, 0, Math.PI * 2, 0.3, 0.3, 180, 180, 185, 0.7);
            /* spiral ridges */
            for (var r = 0; r < 3; r++) {
                var a = v.drumAngle + r * Math.PI * 2 / 3;
                stkC(c, dcx + Math.cos(a) * dr * 1.1, dcy + Math.sin(a) * dr * 0.8,
                    dcx + Math.cos(a + 0.6) * dr * 0.8, dcy + Math.sin(a + 0.6) * dr * 0.6, 0.15, 190, 190, 195, 0.5, 0);
            }
        }

        /* wheels — dark rubber */
        var wy = y + h * 0.28;
        var wr = h * 0.2;
        var wx1 = x + w * 0.2, wx2 = x + w * 0.8;
        arcStr(c, wx1, wy, wr, wr, 0, Math.PI * 2, 0.4, 0.35, 32, 0.9);
        arcStr(c, wx2, wy, wr, wr, 0, Math.PI * 2, 0.4, 0.35, 32, 0.9);
        /* spokes */
        for (var s = 0; s < 4; s++) {
            var a = v.wheelAngle + s * Math.PI / 2;
            stkC(c, wx1 + Math.cos(a) * wr * 0.7, wy + Math.sin(a) * wr * 0.7,
                wx1 - Math.cos(a) * wr * 0.7, wy - Math.sin(a) * wr * 0.7, 0.1, 50, 50, 55, 0.6, 0);
            stkC(c, wx2 + Math.cos(a) * wr * 0.7, wy + Math.sin(a) * wr * 0.7,
                wx2 - Math.cos(a) * wr * 0.7, wy - Math.sin(a) * wr * 0.7, 0.1, 50, 50, 55, 0.6, 0);
        }

        /* undercarriage shadow */
        stk(c, x + w * 0.08, y + h * 0.32, x + w * 0.92, y + h * 0.32, 0.25, 135, 0.35, 0);

        /* police light bar */
        if (tp.n === 'police') {
            var flashT = performance.now() * 0.008;
            var lbx = x + w * 0.44, lby = y - h * 0.55;
            stkC(c, lbx - d * 3, lby, lbx + d * 3, lby, h * 0.15, 30, 30, 35, 0.9, 0);
            var redA = Math.sin(flashT) > 0 ? 0.9 : 0.15;
            var blueA = Math.sin(flashT) > 0 ? 0.15 : 0.9;
            c.beginPath(); c.arc(lbx - d * 2, lby, 2, 0, Math.PI * 2);
            c.fillStyle = 'rgba(255,30,20,' + redA + ')'; c.fill();
            c.beginPath(); c.arc(lbx + d * 2, lby, 2, 0, Math.PI * 2);
            c.fillStyle = 'rgba(30,80,255,' + blueA + ')'; c.fill();
        }
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
            crossing: false, crossTarget: 0,
            hasUmbrella: behRng() < 0.75
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
        var cx = br(-100, W + 100), cy = br(10, HORIZON * 0.85);
        var np = bri(4, 8);
        var puffs = [];
        for (var i = 0; i < np; i++) {
            puffs.push({ ox: br(-30, 30), oy: br(-8, 8), rx: br(18, 45), ry: br(8, 20) });
        }
        return { x: cx, y: cy, speed: br(2, 6), puffs: puffs };
    }

    function updateCloud(cl, dt) {
        cl.x += cl.speed * dt;
        if (cl.x > W + 120) cl.x = -100;
    }

    function drawCloud(c, cl) {
        for (var i = 0; i < cl.puffs.length; i++) {
            var p = cl.puffs[i];
            arcStr(c, cl.x + p.ox, cl.y + p.oy, p.rx, p.ry, 0, Math.PI * 2, 0.28, 0.2, 155, 0.35);
        }
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
            x: dir > 0 ? -60 : W + 60,
            y: br(12, HORIZON * 0.35),
            dir: dir, speed: br(12, 25),
            g: bri(80, 130), trailAge: 0,
            bankAngle: 0, bankTarget: 0, bankTimer: br(3, 8),
            flapPhase: br(0, Math.PI * 2),
            alive: true
        };
    }
    function updatePlane(p, dt) {
        p.x += p.dir * p.speed * dt;
        p.trailAge += dt;
        p.flapPhase += dt * 0.8;
        p.bankTimer -= dt;
        if (p.bankTimer <= 0) { p.bankTarget = (behRng() - 0.5) * 0.12; p.bankTimer = br(3, 8); }
        p.bankAngle += (p.bankTarget - p.bankAngle) * dt * 1.5;
        if ((p.dir > 0 && p.x > W + 80) || (p.dir < 0 && p.x < -80)) p.alive = false;
    }
    function drawPlane(c, p) {
        var x = p.x, y = p.y, d = p.dir, g = p.g;
        var s = 1.6;
        c.save(); c.translate(x, y); c.rotate(p.bankAngle);
        /* arrowhead body */
        c.beginPath();
        c.moveTo(d * 24 * s, 0);
        c.lineTo(-d * 6 * s, -5 * s);
        c.lineTo(-d * 4 * s, 0);
        c.lineTo(-d * 6 * s, 5 * s);
        c.closePath();
        c.fillStyle = 'rgba(' + g + ',' + g + ',' + g + ',0.7)';
        c.fill();
        c.strokeStyle = 'rgba(' + (g - 20) + ',' + (g - 20) + ',' + (g - 20) + ',0.8)';
        c.lineWidth = 0.4 * s; c.stroke();
        /* swept wings */
        c.beginPath();
        c.moveTo(d * 8 * s, 0);
        c.lineTo(-d * 2 * s, -14 * s);
        c.lineTo(-d * 5 * s, -10 * s);
        c.lineTo(-d * 1 * s, -1 * s);
        c.closePath();
        c.fillStyle = 'rgba(' + (g + 5) + ',' + (g + 5) + ',' + (g + 5) + ',0.55)';
        c.fill(); c.stroke();
        c.beginPath();
        c.moveTo(d * 8 * s, 0);
        c.lineTo(-d * 2 * s, 14 * s);
        c.lineTo(-d * 5 * s, 10 * s);
        c.lineTo(-d * 1 * s, 1 * s);
        c.closePath(); c.fill(); c.stroke();
        /* tail fin */
        stk(c, -d * 4 * s, 0, -d * 7 * s, -6 * s, 0.3 * s, g - 10, 0.7, 0);
        c.restore();
        /* jet exhaust */
        var exLen = 6 + Math.sin(p.flapPhase * 8) * 2;
        stk(c, x - d * 5 * s, y, x - d * (5 + exLen) * s, y, 0.7 * s, g + 60, 0.4, 0);
        stk(c, x - d * 5.5 * s, y, x - d * (5.5 + exLen * 0.5) * s, y, 0.3 * s, g + 80, 0.3, 0);
        /* contrail */
        var trailLen = Math.min(80, p.trailAge * 15);
        for (var t = 0; t < trailLen; t += 5) {
            var alpha = Math.max(0, 0.12 - t / trailLen * 0.12);
            var tw = 0.3 + t / trailLen * 1.5;
            stk(c, x - d * (t + 7 * s), y + Math.sin(t * 0.1) * 0.3,
                x - d * (t + 9 * s), y + Math.sin((t + 3) * 0.1) * 0.3, tw, 190, alpha, 0);
        }
    }

    /* ═══════════ HELICOPTERS ═══════════ */
    function createHeli() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var heliColors = [
            [45, 80, 130], [160, 40, 40], [30, 100, 60], [180, 140, 30],
            [50, 50, 55], [20, 60, 110], [140, 60, 20], [100, 100, 110]
        ];
        var hc = heliColors[bri(0, heliColors.length)];
        return {
            x: dir > 0 ? -30 : W + 30,
            y: br(-15, 12),
            dir: dir, speed: br(55, 100),
            g: bri(55, 95), rotorAngle: 0,
            tailRotorAngle: 0, bobPhase: br(0, Math.PI * 2),
            pitchAngle: 0, alive: true,
            cr: hc[0], cg: hc[1], cb: hc[2]
        };
    }
    function updateHeli(h, dt) {
        h.x += h.dir * h.speed * dt;
        h.rotorAngle += dt * 35;
        h.tailRotorAngle += dt * 50;
        h.bobPhase += dt * 1.8;
        h.pitchAngle = h.dir * 0.08 + Math.sin(h.bobPhase * 0.7) * 0.03;
        if ((h.dir > 0 && h.x > W + 60) || (h.dir < 0 && h.x < -60)) h.alive = false;
    }
    function drawHeli(c, h) {
        var x = h.x, y = h.y + Math.sin(h.bobPhase) * 1.5, d = h.dir;
        var R = h.cr, G = h.cg, B = h.cb;
        var s = 1.3;
        c.save(); c.translate(x, y); c.rotate(h.pitchAngle);
        arcStrC(c, d * 2 * s, 0, 8 * s, 4 * s, 0, Math.PI * 2, 0.15, 0.5 * s, R, G, B, 0.8);
        arcStrC(c, d * 7 * s, -s, 4.5 * s, 3.5 * s, Math.PI, Math.PI * 2, 0.12, 0.35 * s, 140, 180, 220, 0.65);
        stkC(c, d * 4 * s, -2.5 * s, d * 10 * s, -1.5 * s, 0.2 * s, R - 15, G - 15, B - 15, 0.7);
        stkC(c, d * 6 * s, -2.5 * s, d * 9 * s, -2 * s, 1.8 * s, 180, 210, 240, 0.2);
        stkC(c, -d * 6 * s, -0.5 * s, -d * 22 * s, -3 * s, 0.4 * s, R, G, B, 0.75);
        stkC(c, -d * 6 * s, 0.5 * s, -d * 20 * s, -1.5 * s, 0.3 * s, R + 10, G + 10, B + 10, 0.6);
        for (var ts = 0; ts < 3; ts++) {
            var tt = 0.3 + ts * 0.2;
            var tsx = -d * (6 + tt * 16) * s, tsy = -0.5 * s + (-3 + 0.5) * tt * s;
            stkC(c, tsx, tsy - s, tsx, tsy + s, 0.08 * s, 255, 255, 255, 0.3);
        }
        stkC(c, -d * 22 * s, -3 * s, -d * 22 * s, -8 * s, 0.35 * s, R - 5, G - 5, B - 5, 0.7);
        stkC(c, -d * 22 * s, -8 * s, -d * 18 * s, -6 * s, 0.25 * s, R, G, B, 0.55);
        stkC(c, -d * 20 * s, -2.5 * s, -d * 24 * s, -3.5 * s, 0.2 * s, R, G, B, 0.5);
        stkC(c, -d * 20 * s, -1.5 * s, -d * 24 * s, -0.5 * s, 0.2 * s, R, G, B, 0.5);
        var tra = h.tailRotorAngle;
        var trx = -d * 22 * s, trY = -5.5 * s;
        stkC(c, trx, trY + Math.sin(tra) * 3.5 * s, trx, trY - Math.sin(tra) * 3.5 * s, 0.2 * s, 60, 60, 65, 0.6);
        arcStrC(c, trx, trY, 3.5 * s, 3.5 * s, 0, Math.PI * 2, 0.5, 0.05, 120, 120, 130, 0.12);
        stkC(c, -d * 5 * s, 3.5 * s, d * 7 * s, 3.5 * s, 0.35 * s, 50, 50, 55, 0.65);
        stkC(c, -d * 3 * s, 1.5 * s, -d * 3 * s, 3.5 * s, 0.2 * s, 60, 60, 65, 0.5);
        stkC(c, d * 4 * s, s, d * 4 * s, 3.5 * s, 0.2 * s, 60, 60, 65, 0.5);
        stkC(c, -d * 3 * s, 2.5 * s, d * 4 * s, 2.5 * s, 0.1 * s, 70, 70, 75, 0.35);
        stkC(c, d * s, -2 * s, d * s, -5 * s, 0.35 * s, 60, 60, 65, 0.75);
        var ra = h.rotorAngle, rotorR = 18 * s, rotorY2 = -5 * s;
        for (var rb = 0; rb < 4; rb++) {
            var ba = ra + rb * Math.PI / 2;
            stkC(c, d * s + Math.cos(ba) * rotorR, rotorY2,
                d * s - Math.cos(ba) * rotorR, rotorY2, 0.3 * s, 40, 40, 45, 0.6 - rb * 0.05);
        }
        arcStrC(c, d * s, rotorY2, rotorR, 2 * s, 0, Math.PI * 2, 0.3, 0.06, 120, 120, 130, 0.1);
        stkC(c, 0, -2 * s, 0, 2 * s, 0.1 * s, R - 15, G - 15, B - 15, 0.4);
        stkC(c, 0, -2 * s, d * 4 * s, -2 * s, 0.1 * s, R - 15, G - 15, B - 15, 0.35);
        c.restore();
    }

    /* ═══════════ VICTORY BANNER ═══════════ */
    var VICTORY_LINES = [
        'Victory will come with patience',
        'Relief will come with affliction',
        'And with hardship comes ease'
    ];
    var VICTORY_DURATION = 18;

    function spawnVictoryBanner() {
        var bannerY = H * 0.36;
        var bw = Math.min(500, W * 0.55);
        var heliColors = [
            [45, 80, 130], [160, 40, 40], [30, 100, 60], [180, 140, 30],
            [50, 50, 55], [20, 60, 110], [140, 60, 20], [100, 100, 110]
        ];
        var hc1 = heliColors[bri(0, heliColors.length)];
        var hc2 = heliColors[bri(0, heliColors.length)];
        victoryBanner = {
            active: true, age: 0, triggered: true,
            x: -bw - 60, y: bannerY,
            bw: bw, bh: 120,
            speed: 65,
            helis: [
                { xOff: -(bw / 2 + 50), yOff: -45, rotorAngle: 0, bobPhase: 0, cr: hc1[0], cg: hc1[1], cb: hc1[2] },
                { xOff: (bw / 2 + 50), yOff: -45, rotorAngle: Math.PI * 0.5, bobPhase: Math.PI, cr: hc2[0], cg: hc2[1], cb: hc2[2] }
            ],
            particles: [],
            fireworks: [],
            fadeIn: 0, textGlow: 0,
            windPhase: 0
        };
    }

    function updateVictoryBanner(dt) {
        if (!victoryBanner.active) return;
        var vb = victoryBanner;
        vb.age += dt;
        vb.x += vb.speed * dt;
        vb.fadeIn = Math.min(1, vb.age / 2.5);
        vb.textGlow = (Math.sin(vb.age * 2.0) * 0.5 + 0.5);
        vb.windPhase += dt * 3.5;
        for (var i = 0; i < vb.helis.length; i++) {
            vb.helis[i].rotorAngle += dt * 35;
            vb.helis[i].bobPhase += dt * 1.8;
        }
        if (behRng() < 0.3) {
            vb.particles.push({
                x: vb.x + br(-vb.bw * 0.6, vb.bw * 0.6),
                y: vb.y + br(-15, 25),
                vx: br(-12, 12), vy: br(-20, -8),
                life: br(0.6, 1.5), age: 0,
                r: br(1.5, 4),
                cr: bri(200, 255), cg: bri(180, 240), cb: bri(40, 130)
            });
        }
        for (var i = vb.particles.length - 1; i >= 0; i--) {
            var p = vb.particles[i];
            p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
            p.vy -= 5 * dt;
            if (p.age > p.life) vb.particles.splice(i, 1);
        }
        while (vb.particles.length > 40) vb.particles.shift();

        if (behRng() < 0.15 && vb.fireworks.length < 10) {
            var fwColors = [
                [255,50,50],[50,255,80],[80,120,255],[255,220,40],[255,100,220],
                [0,255,255],[255,160,30],[180,80,255],[255,255,100],[100,255,200]
            ];
            var fc = fwColors[bri(0, fwColors.length)];
            var explodeY = br(H * 0.05, HORIZON * 0.8);
            vb.fireworks.push({
                x: br(W * 0.05, W * 0.95),
                y: GROUND - 5,
                vx: br(-12, 12), vy: br(-500, -350),
                exploded: false, explodeY: explodeY,
                life: br(5.0, 8.0), age: 0,
                cr: fc[0], cg: fc[1], cb: fc[2],
                sparkles: [], trail: []
            });
        }
        for (var i = vb.fireworks.length - 1; i >= 0; i--) {
            var fw = vb.fireworks[i];
            fw.age += dt;
            if (!fw.exploded) {
                fw.x += fw.vx * dt;
                fw.y += fw.vy * dt;
                fw.vy += 80 * dt;
                if (fw.trail.length < 12) fw.trail.push({x: fw.x, y: fw.y});
                else { fw.trail.shift(); fw.trail.push({x: fw.x, y: fw.y}); }
                if (fw.y <= fw.explodeY) {
                    fw.exploded = true;
                    fw.explodeTime = fw.age;
                    fw.popX = fw.x; fw.popY = fw.y;
                    var shapes = ['star','heart','ring','doubleRing','chrysanthemum','palm','willow'];
                    fw.shape = shapes[bri(0, shapes.length)];
                    var n, j, a2, sp2, sc2 = br(80, 140);
                    if (fw.shape === 'star') {
                        n = bri(30, 45); var pts = bri(4, 7);
                        for (j = 0; j < n; j++) {
                            a2 = (j / n) * Math.PI * 2;
                            var sR = (j % 2 === 0) ? sc2 : sc2 * 0.4;
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2 * pts / 2) * sR * br(0.9,1.1), vy: Math.sin(a2 * pts / 2) * sR * br(0.9,1.1), age: 0, life: br(1.2, 2.2), r: br(2.5, 5), cr: fw.cr + bri(-20,20), cg: fw.cg + bri(-20,20), cb: fw.cb + bri(-20,20) });
                        }
                    } else if (fw.shape === 'heart') {
                        n = bri(35, 50);
                        for (j = 0; j < n; j++) {
                            a2 = (j / n) * Math.PI * 2;
                            var hx2 = 16 * Math.pow(Math.sin(a2), 3);
                            var hy2 = -(13 * Math.cos(a2) - 5 * Math.cos(2*a2) - 2 * Math.cos(3*a2) - Math.cos(4*a2));
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: hx2 * sc2 * 0.07 * br(0.9,1.1), vy: hy2 * sc2 * 0.07 * br(0.9,1.1), age: 0, life: br(1.5, 2.8), r: br(3, 5.5), cr: Math.min(255, fw.cr + bri(0,40)), cg: Math.max(0, fw.cg - 20), cb: Math.max(0, fw.cb - 20) });
                        }
                    } else if (fw.shape === 'ring') {
                        n = bri(30, 45);
                        for (j = 0; j < n; j++) {
                            a2 = (j / n) * Math.PI * 2; sp2 = sc2 * br(0.95, 1.05);
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2, age: 0, life: br(1.2, 2.2), r: br(2.5, 4.5), cr: fw.cr + bri(-15,15), cg: fw.cg + bri(-15,15), cb: fw.cb + bri(-15,15) });
                        }
                    } else if (fw.shape === 'doubleRing') {
                        for (var ring = 0; ring < 2; ring++) {
                            n = bri(22, 35); var rR = ring === 0 ? sc2 : sc2 * 0.5;
                            for (j = 0; j < n; j++) {
                                a2 = (j / n) * Math.PI * 2; sp2 = rR * br(0.9, 1.1);
                                fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2, age: 0, life: br(1.3, 2.4), r: br(2, 4), cr: Math.min(255, fw.cr + ring * 50), cg: Math.min(255, fw.cg + ring * 40), cb: fw.cb + bri(-15,15) });
                            }
                        }
                    } else if (fw.shape === 'chrysanthemum') {
                        n = bri(40, 60);
                        for (j = 0; j < n; j++) {
                            a2 = br(0, Math.PI * 2); sp2 = br(25, sc2 * 1.2);
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2) * sp2 * br(0.8,1.2), vy: Math.sin(a2) * sp2 * br(0.8,1.2), age: 0, life: br(1.5, 2.8), r: br(2, 4), cr: fw.cr + bri(-15,15), cg: fw.cg + bri(-15,15), cb: fw.cb + bri(-15,15) });
                        }
                    } else if (fw.shape === 'palm') {
                        n = bri(25, 40);
                        for (j = 0; j < n; j++) {
                            a2 = br(-Math.PI * 0.7, Math.PI * 0.7) - Math.PI / 2; sp2 = br(60, sc2 * 1.1);
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2, age: 0, life: br(1.8, 3.0), r: br(2.5, 5), gravity: 80, cr: fw.cr + bri(-20,20), cg: fw.cg + bri(-20,20), cb: fw.cb + bri(-10,10) });
                        }
                    } else if (fw.shape === 'willow') {
                        n = bri(35, 50);
                        for (j = 0; j < n; j++) {
                            a2 = br(0, Math.PI * 2); sp2 = br(20, sc2 * 0.6);
                            fw.sparkles.push({ x: fw.x, y: fw.y, vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2, age: 0, life: br(2.2, 3.5), r: br(1.5, 3), gravity: 90, cr: fw.cr + bri(-10,30), cg: fw.cg + bri(-10,30), cb: fw.cb + bri(-10,15) });
                        }
                    }
                }
            } else {
                for (var sp = fw.sparkles.length - 1; sp >= 0; sp--) {
                    var sk = fw.sparkles[sp];
                    sk.age += dt;
                    sk.x += sk.vx * dt;
                    sk.y += sk.vy * dt;
                    sk.vy += (sk.gravity || 35) * dt;
                    sk.vx *= 0.985;
                    if (sk.age > sk.life) fw.sparkles.splice(sp, 1);
                }
            }
            if (fw.age > fw.life || (fw.exploded && fw.sparkles.length === 0)) vb.fireworks.splice(i, 1);
        }

        if (vb.x > W + vb.bw + 100) {
            vb.active = false;
        }
    }

    function drawVictoryBanner(c) {
        if (!victoryBanner.active) return;
        var vb = victoryBanner;
        var alpha = vb.fadeIn;
        var cx = vb.x, cy = vb.y;
        var bw = vb.bw, bh = vb.bh;

        for (var i = 0; i < vb.particles.length; i++) {
            var p = vb.particles[i];
            var pa = Math.max(0, 1 - p.age / p.life) * alpha;
            c.beginPath();
            c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + p.cr + ',' + p.cg + ',' + p.cb + ',' + (pa * 0.7) + ')';
            c.fill();
        }

        var ropeAlpha = alpha * 0.75;
        for (var hi = 0; hi < vb.helis.length; hi++) {
            var h = vb.helis[hi];
            var hx = cx + h.xOff;
            var hy = cy + h.yOff + Math.sin(h.bobPhase) * 2;
            var ropeSway = Math.sin(vb.age * 1.2 + hi * 2) * 4;
            var attachX = hi === 0 ? cx - bw / 2 + 8 : cx + bw / 2 - 8;
            c.beginPath();
            c.moveTo(hx, hy + 5);
            c.quadraticCurveTo(hx + ropeSway, (hy + 5 + cy - bh / 2) / 2, attachX, cy - bh / 2);
            c.strokeStyle = 'rgba(70,50,30,' + ropeAlpha + ')';
            c.lineWidth = 1.2;
            c.stroke();
        }

        c.save();
        c.translate(cx, cy);

        var segments = 20;
        var windAmp = 4 + Math.sin(vb.age * 0.8) * 2;

        c.beginPath();
        for (var si = 0; si <= segments; si++) {
            var t = si / segments;
            var sx = -bw / 2 + t * bw;
            var topWave = -bh / 2 + Math.sin(vb.windPhase + t * Math.PI * 3) * windAmp * t * (1 - t) * 4;
            if (si === 0) c.moveTo(sx, topWave);
            else c.lineTo(sx, topWave);
        }
        for (var si = segments; si >= 0; si--) {
            var t = si / segments;
            var sx = -bw / 2 + t * bw;
            var botWave = bh / 2 + Math.sin(vb.windPhase + t * Math.PI * 3 + 0.5) * windAmp * t * (1 - t) * 4;
            c.lineTo(sx, botWave);
        }
        c.closePath();

        c.fillStyle = 'rgba(255,252,245,' + (alpha * 0.94) + ')';
        c.fill();

        c.strokeStyle = 'rgba(180,145,60,' + (alpha * 0.7) + ')';
        c.lineWidth = 1.5;
        c.stroke();

        c.strokeStyle = 'rgba(218,175,50,' + (alpha * 0.35) + ')';
        c.lineWidth = 0.8;
        c.beginPath();
        for (var si = 0; si <= segments; si++) {
            var t = si / segments;
            var sx = -bw / 2 + 4 + t * (bw - 8);
            var topWave2 = -bh / 2 + 4 + Math.sin(vb.windPhase + t * Math.PI * 3) * windAmp * t * (1 - t) * 4;
            if (si === 0) c.moveTo(sx, topWave2);
            else c.lineTo(sx, topWave2);
        }
        c.stroke();
        c.beginPath();
        for (var si = 0; si <= segments; si++) {
            var t = si / segments;
            var sx = -bw / 2 + 4 + t * (bw - 8);
            var botWave2 = bh / 2 - 4 + Math.sin(vb.windPhase + t * Math.PI * 3 + 0.5) * windAmp * t * (1 - t) * 4;
            if (si === 0) c.moveTo(sx, botWave2);
            else c.lineTo(sx, botWave2);
        }
        c.stroke();

        var fontSize = Math.max(14, Math.min(22, bw / 18));
        c.font = 'italic bold ' + fontSize + 'px Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        var lineH = fontSize * 1.55;
        var startY = -(VICTORY_LINES.length - 1) * lineH / 2;
        for (var li = 0; li < VICTORY_LINES.length; li++) {
            var ty = startY + li * lineH;
            var lineWave = Math.sin(vb.windPhase + li * 0.7) * windAmp * 0.3;
            var textAlpha = alpha * (0.8 + vb.textGlow * 0.2);
            c.fillStyle = 'rgba(85,55,15,' + textAlpha + ')';
            c.fillText(VICTORY_LINES[li], 0, ty + lineWave);
        }

        var foldAlpha = alpha * 0.08;
        for (var fi = 1; fi < 6; fi++) {
            var fx = -bw / 2 + fi * (bw / 6);
            var fWave1 = Math.sin(vb.windPhase + (fi / 6) * Math.PI * 3) * windAmp * (fi / 6) * (1 - fi / 6) * 4;
            c.beginPath();
            c.moveTo(fx, -bh / 2 + fWave1);
            c.lineTo(fx, bh / 2 + fWave1);
            c.strokeStyle = 'rgba(0,0,0,' + foldAlpha + ')';
            c.lineWidth = 0.5;
            c.stroke();
        }

        c.restore();

        for (var hi = 0; hi < vb.helis.length; hi++) {
            var h = vb.helis[hi];
            var hx = cx + h.xOff;
            var hy = cy + h.yOff + Math.sin(h.bobPhase) * 2;
            var d = hi === 0 ? 1 : -1;
            var R = h.cr, G = h.cg, B = h.cb;
            var s = 1.6;
            c.save(); c.translate(hx, hy);
            arcStrC(c, d * 2 * s, 0, 8 * s, 4 * s, 0, Math.PI * 2, 0.15, 0.5 * s, R, G, B, alpha * 0.8);
            arcStrC(c, d * 7 * s, -1 * s, 4.5 * s, 3.5 * s, Math.PI, Math.PI * 2, 0.12, 0.35 * s, 140, 180, 220, alpha * 0.65);
            stkC(c, d * 4 * s, -2.5 * s, d * 10 * s, -1.5 * s, 0.2 * s, R - 15, G - 15, B - 15, alpha * 0.7);
            stkC(c, d * 6 * s, -2.5 * s, d * 9 * s, -2 * s, 1.8 * s, 180, 210, 240, alpha * 0.2);
            stkC(c, -d * 6 * s, -0.5 * s, -d * 22 * s, -3 * s, 0.4 * s, R, G, B, alpha * 0.75);
            stkC(c, -d * 6 * s, 0.5 * s, -d * 20 * s, -1.5 * s, 0.3 * s, R + 10, G + 10, B + 10, alpha * 0.6);
            stkC(c, -d * 22 * s, -3 * s, -d * 22 * s, -8 * s, 0.35 * s, R - 5, G - 5, B - 5, alpha * 0.7);
            stkC(c, -d * 22 * s, -8 * s, -d * 18 * s, -6 * s, 0.25 * s, R, G, B, alpha * 0.55);
            stkC(c, -d * 20 * s, -2.5 * s, -d * 24 * s, -3.5 * s, 0.2 * s, R, G, B, alpha * 0.5);
            stkC(c, -d * 20 * s, -1.5 * s, -d * 24 * s, -0.5 * s, 0.2 * s, R, G, B, alpha * 0.5);
            stkC(c, -d * 5 * s, 3.5 * s, d * 7 * s, 3.5 * s, 0.35 * s, 50, 50, 55, alpha * 0.65);
            stkC(c, -d * 3 * s, 1.5 * s, -d * 3 * s, 3.5 * s, 0.2 * s, 60, 60, 65, alpha * 0.5);
            stkC(c, d * 4 * s, 1 * s, d * 4 * s, 3.5 * s, 0.2 * s, 60, 60, 65, alpha * 0.5);
            stkC(c, -d * 3 * s, 2.5 * s, d * 4 * s, 2.5 * s, 0.1 * s, 70, 70, 75, alpha * 0.35);
            stkC(c, d * 1 * s, -2 * s, d * 1 * s, -5 * s, 0.35 * s, 60, 60, 65, alpha * 0.75);
            var ra = h.rotorAngle, rotorR = 18 * s, rotorY2 = -5 * s;
            for (var rb = 0; rb < 4; rb++) {
                var ba = ra + rb * Math.PI / 2;
                stkC(c, d * 1 * s + Math.cos(ba) * rotorR, rotorY2,
                    d * 1 * s - Math.cos(ba) * rotorR, rotorY2, 0.3 * s, 40, 40, 45, alpha * (0.6 - rb * 0.05));
            }
            arcStrC(c, d * 1 * s, rotorY2, rotorR, 2 * s, 0, Math.PI * 2, 0.3, 0.06, 120, 120, 130, alpha * 0.1);
            var tra = h.rotorAngle * 1.4;
            var trx = -d * 22 * s, trY = -5.5 * s;
            stkC(c, trx, trY + Math.sin(tra) * 3.5 * s, trx, trY - Math.sin(tra) * 3.5 * s, 0.2 * s, 60, 60, 65, alpha * 0.6);
            arcStrC(c, trx, trY, 3.5 * s, 3.5 * s, 0, Math.PI * 2, 0.5, 0.05, 120, 120, 130, alpha * 0.12);
            stkC(c, 0, -2 * s, 0, 2 * s, 0.1 * s, R - 15, G - 15, B - 15, alpha * 0.4);
            stkC(c, 0, -2 * s, d * 4 * s, -2 * s, 0.1 * s, R - 15, G - 15, B - 15, alpha * 0.35);
            c.restore();
        }

        for (var fi = 0; fi < vb.fireworks.length; fi++) {
            var fw = vb.fireworks[fi];
            if (!fw.exploded) {
                var tLen = fw.trail.length;
                for (var tp = 0; tp < tLen; tp++) {
                    var ta = (tp + 1) / tLen;
                    c.beginPath();
                    c.arc(fw.trail[tp].x, fw.trail[tp].y, 2 * ta, 0, Math.PI * 2);
                    c.fillStyle = 'rgba(' + fw.cr + ',' + fw.cg + ',' + fw.cb + ',' + (ta * 0.7) + ')';
                    c.fill();
                }
                c.beginPath();
                c.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
                c.fillStyle = 'rgba(255,255,240,0.95)';
                c.fill();
                c.beginPath();
                c.arc(fw.x, fw.y, 8, 0, Math.PI * 2);
                c.fillStyle = 'rgba(' + fw.cr + ',' + fw.cg + ',' + fw.cb + ',0.25)';
                c.fill();
            } else {
                var ea = fw.age - (fw.explodeTime || 0);
                var px2 = fw.popX, py2 = fw.popY;
                if (ea < 1.0) {
                    var fa = Math.max(0, 1 - ea / 1.0);
                    c.beginPath();
                    c.arc(px2, py2, 12 + ea * 70, 0, Math.PI * 2);
                    c.fillStyle = 'rgba(255,255,255,' + (fa * fa * 0.65) + ')';
                    c.fill();
                    c.beginPath();
                    c.arc(px2, py2, 5 + ea * 35, 0, Math.PI * 2);
                    c.fillStyle = 'rgba(' + fw.cr + ',' + fw.cg + ',' + fw.cb + ',' + (fa * fa * 0.45) + ')';
                    c.fill();
                    c.beginPath();
                    c.arc(px2, py2, 25 + ea * 300, 0, Math.PI * 2);
                    c.strokeStyle = 'rgba(' + fw.cr + ',' + fw.cg + ',' + fw.cb + ',' + (fa * 0.5) + ')';
                    c.lineWidth = 3 * fa;
                    c.stroke();
                    if (ea < 0.6) {
                        c.beginPath();
                        c.arc(px2, py2, 40 + ea * 400, 0, Math.PI * 2);
                        c.strokeStyle = 'rgba(' + fw.cr + ',' + fw.cg + ',' + fw.cb + ',' + (fa * 0.3) + ')';
                        c.lineWidth = 2 * fa;
                        c.stroke();
                    }
                    c.beginPath();
                    for (var ry = 0; ry < 10; ry++) {
                        var rAng = (ry / 10) * Math.PI * 2 + ea * 3;
                        var rIn = 10 + ea * 25;
                        var rLen = (45 + ea * 200) * fa;
                        c.moveTo(px2 + Math.cos(rAng) * rIn, py2 + Math.sin(rAng) * rIn);
                        c.lineTo(px2 + Math.cos(rAng) * rLen, py2 + Math.sin(rAng) * rLen);
                    }
                    c.strokeStyle = 'rgba(255,255,255,' + (fa * 0.35) + ')';
                    c.lineWidth = 1.8 * fa;
                    c.stroke();
                }
                for (var sp = 0; sp < fw.sparkles.length; sp++) {
                    var sk = fw.sparkles[sp];
                    var sa = Math.max(0, 1 - sk.age / sk.life);
                    if (sa < 0.05) continue;
                    c.beginPath();
                    c.arc(sk.x, sk.y, sk.r * sa * 1.3, 0, Math.PI * 2);
                    c.fillStyle = 'rgba(' + Math.min(255,sk.cr) + ',' + Math.min(255,sk.cg) + ',' + Math.min(255,sk.cb) + ',' + (sa * 0.9) + ')';
                    c.fill();
                }
            }
        }
    }

    /* ═══════════ WAR PLANES ═══════════ */
    var warPlanes = [];
    var MAX_WARPLANES = 3;
    function createWarPlane() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: dir > 0 ? -80 : W + 80,
            y: br(HORIZON * 0.1, HORIZON * 0.5),
            dir: dir, speed: br(45, 80),
            g: bri(50, 80),
            trailAge: 0, rollPhase: br(0, Math.PI * 2),
            afterburner: behRng() < 0.4,
            alive: true
        };
    }
    function updateWarPlane(p, dt) {
        p.x += p.dir * p.speed * dt;
        p.trailAge += dt;
        p.rollPhase += dt * 0.5;
        if ((p.dir > 0 && p.x > W + 100) || (p.dir < 0 && p.x < -100)) p.alive = false;
    }
    function drawWarPlane(c, p) {
        var x = p.x, y = p.y, d = p.dir, g = p.g;
        var s = 1.5;
        c.save(); c.translate(x, y);
        /* fuselage — sleek fighter body */
        stk(c, -d * 5 * s, 0, d * 22 * s, 0, 0.9 * s, g - 8, 0.9, 0);
        stk(c, -d * 5 * s, -0.6 * s, d * 20 * s, -0.4 * s, 0.25 * s, g + 5, 0.5, 0);
        /* nose — pointed radome */
        stk(c, d * 22 * s, 0, d * 28 * s, -0.2 * s, 0.45 * s, g - 5, 0.85, 0);
        stk(c, d * 28 * s, -0.2 * s, d * 32 * s, 0, 0.25 * s, g, 0.7, 0);
        /* canopy — bubble */
        arcStr(c, d * 16 * s, -1.8 * s, 4 * s, 2.5 * s, Math.PI, Math.PI * 2, 0.15, 0.3 * s, g + 30, 0.6);
        stk(c, d * 13 * s, -1.5 * s, d * 19 * s, -1 * s, 1.8 * s, g + 50, 0.2, 0);
        /* canopy frame */
        stk(c, d * 15 * s, -2.5 * s, d * 15 * s, -0.5 * s, 0.1 * s, g - 10, 0.5, 0);
        /* delta wings */
        stk(c, d * 8 * s, 0, d * 2 * s, -12 * s, 0.45 * s, g - 5, 0.75, 0);
        stk(c, d * 8 * s, 0, d * 2 * s, 12 * s, 0.45 * s, g - 5, 0.75, 0);
        /* wing trailing edge */
        stk(c, d * 2 * s, -12 * s, -d * 2 * s, -8 * s, 0.2 * s, g, 0.55, 0);
        stk(c, d * 2 * s, 12 * s, -d * 2 * s, 8 * s, 0.2 * s, g, 0.55, 0);
        /* wing tip missiles */
        stk(c, d * 1 * s, -12.5 * s, d * 5 * s, -12 * s, 0.25 * s, g + 10, 0.5, 0);
        stk(c, d * 1 * s, 12.5 * s, d * 5 * s, 12 * s, 0.25 * s, g + 10, 0.5, 0);
        /* underwing pylons */
        stk(c, d * 5 * s, -6 * s, d * 5 * s, -7.5 * s, 0.15 * s, g, 0.45, 0);
        stk(c, d * 5 * s, 6 * s, d * 5 * s, 7.5 * s, 0.15 * s, g, 0.45, 0);
        arcStr(c, d * 5 * s, -8 * s, 2 * s, 0.8 * s, 0, Math.PI * 2, 0.3, 0.15 * s, g - 5, 0.5);
        arcStr(c, d * 5 * s, 8 * s, 2 * s, 0.8 * s, 0, Math.PI * 2, 0.3, 0.15 * s, g - 5, 0.5);
        /* twin vertical tails */
        stk(c, -d * 3 * s, -2 * s, -d * 6 * s, -7 * s, 0.3 * s, g - 5, 0.7, 0);
        stk(c, -d * 3 * s, 2 * s, -d * 6 * s, 7 * s, 0.3 * s, g - 5, 0.7, 0);
        stk(c, -d * 6 * s, -7 * s, -d * 3 * s, -5.5 * s, 0.15 * s, g, 0.45, 0);
        stk(c, -d * 6 * s, 7 * s, -d * 3 * s, 5.5 * s, 0.15 * s, g, 0.45, 0);
        /* horizontal stabilizers */
        stk(c, -d * 4 * s, 0, -d * 7 * s, -4 * s, 0.25 * s, g, 0.55, 0);
        stk(c, -d * 4 * s, 0, -d * 7 * s, 4 * s, 0.25 * s, g, 0.55, 0);
        /* engine nozzles */
        arcStr(c, -d * 5 * s, -1.5 * s, 1.8 * s, 1.5 * s, 0, Math.PI * 2, 0.3, 0.2 * s, g - 15, 0.65);
        arcStr(c, -d * 5 * s, 1.5 * s, 1.8 * s, 1.5 * s, 0, Math.PI * 2, 0.3, 0.2 * s, g - 15, 0.65);
        /* afterburner glow */
        if (p.afterburner) {
            var abFlick = Math.sin(p.trailAge * 30) * 0.15 + 0.35;
            stk(c, -d * 6.5 * s, -1.5 * s, -d * (9 + Math.sin(p.trailAge * 25) * 2) * s, -1.5 * s, 0.5 * s, g + 60, abFlick, 0);
            stk(c, -d * 6.5 * s, 1.5 * s, -d * (9 + Math.sin(p.trailAge * 28) * 2) * s, 1.5 * s, 0.5 * s, g + 60, abFlick, 0);
        }
        c.restore();
        /* twin contrails */
        var trailLen = Math.min(120, p.trailAge * 25);
        for (var t = 0; t < trailLen; t += 3) {
            var alpha = Math.max(0, 0.14 - t / trailLen * 0.14);
            var tw = 0.3 + t / trailLen * 1.5;
            stk(c, x - d * (t + 5), y - 1.5 + Math.sin(t * 0.1) * 0.3,
                x - d * (t + 8), y - 1.5 + Math.sin((t + 3) * 0.1) * 0.3, tw, 185, alpha, 0);
            stk(c, x - d * (t + 5), y + 1.5 + Math.sin(t * 0.12) * 0.3,
                x - d * (t + 8), y + 1.5 + Math.sin((t + 3) * 0.12) * 0.3, tw, 185, alpha, 0);
        }
    }

    /* ═══════════ SPACESHIP ═══════════ */
    var spaceships = [];
    var MAX_SPACESHIPS = 2;
    function createSpaceship() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return {
            x: dir > 0 ? -60 : W + 60,
            y: br(8, HORIZON * 0.35),
            dir: dir, speed: br(15, 35),
            g: bri(90, 140), pulsePhase: br(0, Math.PI * 2),
            tilt: br(-0.1, 0.1), trailAge: 0,
            shieldPhase: br(0, Math.PI * 2),
            engineGlow: br(0, Math.PI * 2),
            alive: true
        };
    }
    function updateSpaceship(s, dt) {
        s.x += s.dir * s.speed * dt;
        s.y += Math.sin(s.pulsePhase) * 0.2;
        s.pulsePhase += dt * 4;
        s.trailAge += dt;
        s.shieldPhase += dt * 2;
        s.engineGlow += dt * 12;
        if ((s.dir > 0 && s.x > W + 100) || (s.dir < 0 && s.x < -100)) s.alive = false;
    }
    function drawSpaceship(c, s) {
        var x = s.x, y = s.y, d = s.dir, g = s.g;
        var sz = 1.6;
        var pulse = Math.sin(s.pulsePhase) * 0.2 + 0.7;
        c.save(); c.translate(x, y); c.rotate(s.tilt);
        /* main hull — elongated with curves */
        arcStr(c, 0, 0, 16 * sz, 5 * sz, 0, Math.PI * 2, 0.12, 0.5 * sz, g - 5, pulse * 0.85);
        /* hull panel lines */
        stk(c, -8 * sz, -2 * sz, -8 * sz, 2 * sz, 0.08 * sz, g + 10, 0.3, 0);
        stk(c, 0, -3 * sz, 0, 3 * sz, 0.08 * sz, g + 10, 0.25, 0);
        stk(c, 8 * sz, -2 * sz, 8 * sz, 2 * sz, 0.08 * sz, g + 10, 0.2, 0);
        /* command dome */
        arcStr(c, d * 2 * sz, -4 * sz, 7 * sz, 5 * sz, Math.PI, Math.PI * 2, 0.1, 0.4 * sz, g + 25, pulse * 0.8);
        /* dome glass panels */
        for (var wp = 0; wp < 4; wp++) {
            var wa = Math.PI * 1.15 + wp * (Math.PI * 0.7 / 4);
            var wx = d * 2 * sz + Math.cos(wa) * 5 * sz;
            var wy = -4 * sz + Math.sin(wa) * 3.5 * sz;
            c.beginPath(); c.arc(wx, wy, 0.8 * sz, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + (g + 50) + ',' + (g + 50) + ',' + (g + 50) + ',' + (pulse * 0.4) + ')';
            c.fill();
        }
        /* antenna spire */
        stk(c, d * 2 * sz, -8.5 * sz, d * 2 * sz, -5 * sz, 0.15 * sz, g + 15, 0.5, 0);
        c.beginPath(); c.arc(d * 2 * sz, -9 * sz, 0.6 * sz, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 40) + ',' + (g + 40) + ',' + (g + 40) + ',' + (pulse * 0.6) + ')';
        c.fill();
        /* lower hull detail */
        arcStr(c, 0, 2 * sz, 14 * sz, 2.5 * sz, 0, Math.PI, 0.15, 0.2 * sz, g - 12, 0.55);
        /* landing struts (retracted) */
        stk(c, -10 * sz, 3 * sz, -11 * sz, 5 * sz, 0.2 * sz, g - 10, 0.5, 0);
        stk(c, 10 * sz, 3 * sz, 11 * sz, 5 * sz, 0.2 * sz, g - 10, 0.5, 0);
        stk(c, 0, 3.5 * sz, 0, 5.5 * sz, 0.2 * sz, g - 10, 0.5, 0);
        /* running lights — animated chase */
        for (var li = 0; li < 10; li++) {
            var la = (li / 10) * Math.PI * 2 + s.pulsePhase * 0.6;
            var lx = Math.cos(la) * 14 * sz, ly = Math.sin(la) * 4 * sz;
            var lBright = (Math.sin(s.pulsePhase * 2 + li * 0.6) + 1) * 0.5;
            c.beginPath(); c.arc(lx, ly, 0.6 * sz, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + (g + 60) + ',' + (g + 60) + ',' + (g + 60) + ',' + (pulse * lBright * 0.6) + ')';
            c.fill();
        }
        /* engine pods */
        arcStr(c, -d * 14 * sz, -2 * sz, 3 * sz, 2 * sz, 0, Math.PI * 2, 0.2, 0.25 * sz, g - 15, 0.7);
        arcStr(c, -d * 14 * sz, 2 * sz, 3 * sz, 2 * sz, 0, Math.PI * 2, 0.2, 0.25 * sz, g - 15, 0.7);
        /* engine glow */
        var egFlick = Math.sin(s.engineGlow) * 0.15 + 0.3;
        var egR = (2 + Math.sin(s.engineGlow * 1.3) * 0.8) * sz;
        var egCol = g + 50;
        c.beginPath(); c.arc(-d * 17 * sz, -2 * sz, egR, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + egCol + ',' + egCol + ',' + egCol + ',' + (egFlick * 0.5) + ')';
        c.fill();
        c.beginPath(); c.arc(-d * 17 * sz, 2 * sz, egR, 0, Math.PI * 2);
        c.fill();
        /* shield shimmer */
        var shA = Math.sin(s.shieldPhase) * 0.04 + 0.04;
        if (shA > 0.02) {
            arcStr(c, 0, 0, 20 * sz, 8 * sz, 0, Math.PI * 2, 0.25, 0.05 * sz, g + 40, shA);
        }
        c.restore();
        /* exhaust trail */
        var trailLen = Math.min(40, s.trailAge * 14);
        for (var t = 0; t < trailLen; t += 5) {
            var alpha = Math.max(0, 0.12 - t / trailLen * 0.12);
            var tr = (1.5 + t * 0.04) * sz;
            var tx = x - d * (t + 17 * sz);
            arcStr(c, tx, y - 2, tr, tr * 0.5, 0, Math.PI * 2, 0.5, 0.06, g + 45, alpha);
            arcStr(c, tx, y + 2, tr, tr * 0.5, 0, Math.PI * 2, 0.5, 0.06, g + 45, alpha);
        }
    }

    /* ═══════════ FLYING CARS ═══════════ */
    var flyingCars = [];
    var MAX_FLYING_CARS = 4;
    function createFlyingCar() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var lane = bri(0, 3);
        return {
            x: dir > 0 ? -30 : W + 30,
            y: HORIZON * (0.2 + lane * 0.15) + br(-5, 5),
            dir: dir, speed: br(20, 45),
            g: bri(60, 110), bobPhase: br(0, Math.PI * 2),
            thrusterPhase: br(0, Math.PI * 2),
            headlightFlick: br(0, Math.PI * 2),
            alive: true
        };
    }
    function updateFlyingCar(fc, dt) {
        fc.x += fc.dir * fc.speed * dt;
        fc.bobPhase += dt * 2.5;
        fc.thrusterPhase += dt * 15;
        fc.headlightFlick += dt * 8;
        if ((fc.dir > 0 && fc.x > W + 40) || (fc.dir < 0 && fc.x < -40)) fc.alive = false;
    }
    function drawFlyingCar(c, fc) {
        var x = fc.x, y = fc.y + Math.sin(fc.bobPhase) * 1.5, d = fc.dir, g = fc.g;
        var s = 1.3;
        /* body — sleek car shape */
        arcStr(c, x, y, 12 * s, 4 * s, 0, Math.PI, 0.15, 0.4 * s, g - 5, 0.75);
        stk(c, x - 12 * s, y, x + 12 * s, y, 0.5 * s, g - 10, 0.85, 0);
        /* roof / cabin */
        arcStr(c, x + d * 3 * s, y - 3 * s, 6 * s, 3.5 * s, Math.PI, Math.PI * 2, 0.12, 0.35 * s, g + 12, 0.65);
        /* windshield */
        stk(c, x + d * 1 * s, y - 2 * s, x + d * 7 * s, y - 1.5 * s, 2 * s, g + 45, 0.25, 0);
        /* rear window */
        stk(c, x - d * 1 * s, y - 2 * s, x - d * 4 * s, y - 1.5 * s, 1.5 * s, g + 40, 0.2, 0);
        /* headlights */
        var hlBright = 0.4 + Math.sin(fc.headlightFlick) * 0.1;
        c.beginPath(); c.arc(x + d * 11 * s, y - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 70) + ',' + (g + 70) + ',' + (g + 70) + ',' + hlBright + ')';
        c.fill();
        c.beginPath(); c.arc(x + d * 11 * s, y + 0.5 * s, 0.6 * s, 0, Math.PI * 2);
        c.fill();
        /* tail lights */
        c.beginPath(); c.arc(x - d * 11 * s, y - 0.3 * s, 0.5 * s, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + (g + 30) + ',' + (g + 30) + ',' + (g + 30) + ',0.5)';
        c.fill();
        /* side panels */
        stk(c, x - 6 * s, y - 1 * s, x + 6 * s, y - 1 * s, 0.08 * s, g + 15, 0.3, 0);
        /* hover pads */
        var thrustFlicker = Math.sin(fc.thrusterPhase) * 0.15 + 0.35;
        for (var tp = 0; tp < 4; tp++) {
            var tpx = x + (-7.5 + tp * 5) * s;
            c.beginPath(); c.arc(tpx, y + 3 * s, 1.3 * s, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + (g + 55) + ',' + (g + 55) + ',' + (g + 55) + ',' + thrustFlicker + ')';
            c.fill();
            /* thrust jet */
            var jetLen = (1.5 + Math.sin(fc.thrusterPhase + tp * 1.5) * 1) * s;
            stk(c, tpx, y + 3.5 * s, tpx, y + 3.5 * s + jetLen, 0.2 * s, g + 60, thrustFlicker * 0.5, 0);
        }
        /* heat distortion below */
        for (var hd = 0; hd < 3; hd++) {
            var hdx = x + (-5 + hd * 5) * s;
            var hda = 0.06 * thrustFlicker;
            stk(c, hdx - 2 * s, y + 5 * s + Math.sin(fc.thrusterPhase * 0.5 + hd) * s,
                hdx + 2 * s, y + 5.5 * s + Math.cos(fc.thrusterPhase * 0.4 + hd) * s,
                0.05 * s, g + 40, hda, 0);
        }
    }

    /* ═══════════ TRAIN ═══════════ */
    function createTrain() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var nCars = bri(4, 8);
        var cars = [];
        var carW = 28, gap = 3;
        cars.push({ type: 'loco', w: 32 });
        for (var i = 0; i < nCars; i++) {
            var tp = behRng() > 0.3 ? 'passenger' : 'freight';
            cars.push({ type: tp, w: carW });
        }
        var totalW = 0;
        for (var i = 0; i < cars.length; i++) totalW += cars[i].w + gap;
        return {
            x: dir > 0 ? -totalW - 40 : W + 40,
            y: TRACK_Y,
            dir: dir,
            speed: br(50, 90),
            g: bri(45, 85),
            cars: cars, carW: carW, gap: gap, totalW: totalW,
            wheelAngle: 0,
            alive: true
        };
    }

    function updateTrain(tr, dt) {
        tr.x += tr.dir * tr.speed * dt;
        tr.wheelAngle += tr.speed * dt * 0.15;
        if (tr.dir > 0 && tr.x - tr.totalW > W + 50) tr.alive = false;
        if (tr.dir < 0 && tr.x + tr.totalW < -50) tr.alive = false;
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
        var x = b.x, y = b.y + Math.sin(b.bobPhase) * 0.8, d = b.dir;

        if (b.type === 'sail') {
            /* hull — dark wood brown */
            arcStrC(c, x, y + 1.5, 10, 3, 0, Math.PI, 0.25, 0.5, 100, 60, 30, 0.7);
            stkC(c, x - 9, y + 1.5, x + 9, y + 1.5, 0.4, 80, 50, 25, 0.8, 0);
            /* mast */
            stkC(c, x + d * 1, y + 1, x + d * 1, y - 14, 0.35, 90, 65, 40, 0.8, 0);
            /* sail — off-white */
            stkC(c, x + d * 1, y - 13, x + d * 8, y - 2, 0.3, 235, 230, 220, 0.6, 0);
            stkC(c, x + d * 1, y - 13, x + d * 1, y - 2, 0.15, 230, 225, 215, 0.5, 0);
            for (var sy = y - 12; sy < y - 3; sy += 2) {
                var t = (sy - (y - 13)) / 11;
                stkC(c, x + d * 1, sy, x + d * 1 + t * 7 * d, sy, 0.08, 240, 235, 225, 0.25, 0);
            }
            stkC(c, x - 5, y + 4, x + 5, y + 4, 0.12, 80, 120, 160, 0.15, 0);
        } else {
            /* fishing boat — blue-white hull */
            arcStrC(c, x, y + 1, 8, 2.5, 0, Math.PI, 0.25, 0.45, 50, 80, 140, 0.7);
            stkC(c, x - 7, y + 1, x + 7, y + 1, 0.4, 40, 65, 120, 0.8, 0);
            rectStkC(c, x - 2, y - 3.5, 5, 4, 0.3, 200, 200, 200, 0.7);
            stkC(c, x - 1, y - 3, x + 2, y - 3, 1, 220, 220, 210, 0.3, 0);
            for (var w = 1; w < 5; w++) {
                var wx = x - d * (w * 5 + 2);
                var wa = Math.max(0, 0.25 - w * 0.05);
                arcStrC(c, wx, y + 2, w * 2.5, 1.5, d > 0 ? Math.PI * 0.7 : 0, d > 0 ? Math.PI : Math.PI * 0.3, 0.3, 0.12, 180, 210, 235, wa);
            }
        }
        stkC(c, x - 8, y + 3, x + 8, y + 3, 0.08, 80, 120, 170, 0.2, 0);
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

    /* ═══════════ RAIN ═══════════ */
    var raindrops = [];
    function createRaindrop() {
        return {
            x: br(-50, W + 50),
            y: br(-40, -5),
            speed: br(350, 600),
            len: br(6, 18),
            g: bri(110, 160),
            alive: true
        };
    }
    function updateRain(dt) {
        var target = Math.floor(ATM.rainIntensity * MAX_RAIN);
        while (raindrops.length < target) raindrops.push(createRaindrop());
        var wind = ATM.windAngle * ATM.windStrength;
        for (var i = raindrops.length - 1; i >= 0; i--) {
            var r = raindrops[i];
            r.y += r.speed * dt;
            r.x += wind * r.speed * dt * 0.5;
            if (r.y > H + 10) {
                if (raindrops.length > target) { raindrops.splice(i, 1); }
                else { r.y = br(-30, -5); r.x = br(-50, W + 50); }
            }
        }
    }
    function drawRain(c) {
        var wind = ATM.windAngle * ATM.windStrength;
        for (var i = 0; i < raindrops.length; i++) {
            var r = raindrops[i];
            var dx = wind * r.len * 0.5;
            c.beginPath();
            c.moveTo(r.x, r.y);
            c.lineTo(r.x + dx, r.y + r.len);
            c.strokeStyle = 'rgba(120,150,200,0.45)';
            c.lineWidth = 0.9;
            c.lineCap = 'round';
            c.stroke();
        }
    }

    /* ═══════════ LIGHTNING ═══════════ */
    var lightningBolt = null;
    function createLightningBolt() {
        var x = br(W * 0.1, W * 0.9), y = 0;
        var pts = [{ x: x, y: y }];
        var cx = x, cy = y;
        var targetY = br(HORIZON * 0.5, GROUND * 0.6);
        while (cy < targetY) {
            cx += br(-25, 25);
            cy += br(15, 40);
            pts.push({ x: cx, y: Math.min(cy, targetY) });
            if (behRng() < 0.3 && pts.length > 2) {
                var brPts = [{ x: cx, y: cy }];
                var bx = cx, by = cy;
                for (var b = 0; b < bri(2, 4); b++) {
                    bx += br(-20, 20); by += br(10, 25);
                    brPts.push({ x: bx, y: by });
                }
                pts.branches = pts.branches || [];
                pts.branches.push(brPts);
            }
        }
        return { pts: pts, age: 0, maxAge: 0.15 };
    }
    function drawLightning(c) {
        if (!lightningBolt) return;
        var alpha = Math.max(0, 1 - lightningBolt.age / lightningBolt.maxAge);
        c.lineWidth = 2.5;
        c.strokeStyle = 'rgba(240,240,245,' + alpha + ')';
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(lightningBolt.pts[0].x, lightningBolt.pts[0].y);
        for (var i = 1; i < lightningBolt.pts.length; i++) {
            c.lineTo(lightningBolt.pts[i].x, lightningBolt.pts[i].y);
        }
        c.stroke();
        if (lightningBolt.pts.branches) {
            c.lineWidth = 1.2;
            c.strokeStyle = 'rgba(225,225,230,' + (alpha * 0.7) + ')';
            for (var b = 0; b < lightningBolt.pts.branches.length; b++) {
                var br2 = lightningBolt.pts.branches[b];
                c.beginPath();
                c.moveTo(br2[0].x, br2[0].y);
                for (var j = 1; j < br2.length; j++) c.lineTo(br2[j].x, br2[j].y);
                c.stroke();
            }
        }
    }
    function updateLightning(dt) {
        if (ATM.flashIntensity > 0) ATM.flashIntensity *= Math.pow(0.03, dt);
        if (ATM.flashIntensity < 0.01) ATM.flashIntensity = 0;
        if (lightningBolt) {
            lightningBolt.age += dt;
            if (lightningBolt.age >= lightningBolt.maxAge) lightningBolt = null;
        }
    }

    /* ═══════════ HAIL ═══════════ */
    var hailstones = [];
    function createHailstone() {
        return { x: br(-20, W + 20), y: br(-30, -5), vy: br(200, 350), vx: ATM.windStrength * br(30, 80),
                 r: br(1.5, 3.5), g: bri(180, 215), bounced: false, bounceY: 0, alive: true };
    }
    function updateHail(dt) {
        if (DISASTER.active !== 'hail') { hailstones = []; return; }
        while (hailstones.length < MAX_HAIL) hailstones.push(createHailstone());
        for (var i = hailstones.length - 1; i >= 0; i--) {
            var h = hailstones[i];
            if (h.bounced) {
                h.bounceY += h.vy * 0.3 * dt;
                h.vy -= 600 * dt;
                h.x += h.vx * 0.5 * dt;
                h.y -= h.bounceY * dt;
                if (h.y > H + 10) { hailstones.splice(i, 1); continue; }
            } else {
                h.y += h.vy * dt;
                h.x += h.vx * dt;
                if (h.y > GROUND - br(0, 30)) {
                    h.bounced = true; h.bounceY = 0; h.vy = br(80, 160);
                }
            }
        }
    }
    function drawHail(c) {
        for (var i = 0; i < hailstones.length; i++) {
            var h = hailstones[i];
            c.beginPath();
            c.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + h.g + ',' + h.g + ',' + h.g + ',0.55)';
            c.fill();
        }
    }

    /* ═══════════ SNOW ═══════════ */
    var snowflakes = [];
    function createSnowflake() {
        return { x: br(-20, W + 20), y: br(-20, -5), speed: br(25, 60), drift: br(-15, 15),
                 phase: br(0, Math.PI * 2), r: br(1, 3), g: bri(210, 235), alive: true };
    }
    function updateSnow(dt) {
        if (DISASTER.active !== 'blizzard') { snowflakes = []; return; }
        while (snowflakes.length < MAX_SNOW) snowflakes.push(createSnowflake());
        for (var i = snowflakes.length - 1; i >= 0; i--) {
            var s = snowflakes[i];
            s.y += s.speed * dt;
            s.phase += dt * 2;
            s.x += (s.drift + Math.sin(s.phase) * 12 + ATM.windStrength * 40) * dt;
            if (s.y > H + 5) { snowflakes.splice(i, 1); }
        }
    }
    function drawSnow(c) {
        for (var i = 0; i < snowflakes.length; i++) {
            var s = snowflakes[i];
            c.beginPath();
            c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + s.g + ',' + s.g + ',' + s.g + ',0.6)';
            c.fill();
        }
    }

    /* ═══════════ METEORS ═══════════ */
    var meteors = [];
    function createMeteor() {
        return { x: br(0, W), y: br(-20, HORIZON * 0.3), vx: br(-120, -40), vy: br(80, 200),
                 len: br(15, 40), g: bri(160, 200), age: 0, maxAge: br(0.8, 2), alive: true };
    }
    function updateMeteors(dt) {
        if (DISASTER.active !== 'meteor') { meteors = []; return; }
        if (meteors.length < MAX_METEORS && behRng() < 0.08) meteors.push(createMeteor());
        for (var i = meteors.length - 1; i >= 0; i--) {
            var m = meteors[i];
            m.x += m.vx * dt; m.y += m.vy * dt; m.age += dt;
            if (m.age > m.maxAge || m.y > HORIZON) {
                if (m.y >= HORIZON - 5) ATM.flashIntensity = Math.max(ATM.flashIntensity, 0.3);
                meteors.splice(i, 1);
            }
        }
    }
    function drawMeteors(c) {
        for (var i = 0; i < meteors.length; i++) {
            var m = meteors[i];
            var alpha = Math.max(0, 1 - m.age / m.maxAge) * 0.7;
            var tx = m.x - m.vx * 0.1 * m.len / 30;
            var ty = m.y - m.vy * 0.1 * m.len / 30;
            c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(tx, ty);
            c.strokeStyle = 'rgba(' + m.g + ',' + m.g + ',' + m.g + ',' + alpha + ')';
            c.lineWidth = 1.2; c.lineCap = 'round'; c.stroke();
        }
    }

    /* ═══════════ DEBRIS (hurricane) ═══════════ */
    var debris = [];
    function createDebris() {
        var types = ['leaf', 'paper', 'branch', 'sign'];
        return { x: -20, y: br(HORIZON, GROUND), type: types[bri(0, types.length)],
                 vx: br(100, 250), vy: br(-40, 40), spin: br(-5, 5),
                 angle: br(0, Math.PI * 2), g: bri(80, 140), size: br(3, 8), alive: true };
    }
    function updateDebris(dt) {
        if (DISASTER.active !== 'hurricane') { debris = []; return; }
        if (debris.length < MAX_DEBRIS && behRng() < 0.15) debris.push(createDebris());
        for (var i = debris.length - 1; i >= 0; i--) {
            var d = debris[i];
            d.x += d.vx * dt; d.y += d.vy * dt + Math.sin(d.angle) * 15 * dt;
            d.angle += d.spin * dt;
            if (d.x > W + 30) debris.splice(i, 1);
        }
    }
    function drawDebris(c) {
        for (var i = 0; i < debris.length; i++) {
            var d = debris[i];
            c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
            if (d.type === 'leaf') {
                arcStr(c, 0, 0, d.size, d.size * 0.5, 0, Math.PI * 2, 0.3, 0.3, d.g, 0.6);
            } else if (d.type === 'paper') {
                rectStk(c, -d.size / 2, -d.size / 2, d.size, d.size * 0.7, 0.2, d.g + 30, 0.5);
            } else if (d.type === 'branch') {
                stk(c, -d.size, 0, d.size, 0, 0.4, d.g - 15, 0.6, 0);
                stk(c, d.size * 0.3, 0, d.size * 0.6, -d.size * 0.4, 0.2, d.g, 0.5, 0);
            } else {
                rectStk(c, -d.size / 2, -d.size, d.size, d.size * 1.5, 0.3, d.g, 0.5);
            }
            c.restore();
        }
    }

    /* ═══════════ DUST STORM FX ═══════════ */
    function drawDustStorm(c) {
        if (DISASTER.active !== 'dust-storm') return;
        var prog = DISASTER.timer / DISASTER.duration;
        var intensity = Math.sin(prog * Math.PI) * 0.25;
        c.fillStyle = 'rgba(180,175,165,' + intensity + ')';
        c.fillRect(0, 0, W, H);
        for (var i = 0; i < 40; i++) {
            var y = behRng() * H, x1 = behRng() * W, len = br(30, 120);
            c.beginPath(); c.moveTo(x1, y); c.lineTo(x1 + len, y + br(-3, 3));
            c.strokeStyle = 'rgba(165,160,150,' + (intensity * 0.5) + ')';
            c.lineWidth = br(0.5, 1.5); c.stroke();
        }
    }

    /* ═══════════ FLOOD FX ═══════════ */
    function drawFloodFx(c) {
        if (DISASTER.active !== 'flood' || DISASTER.floodLevel <= 0) return;
        var floodH = DISASTER.floodLevel * (STREET_BOT - GROUND) * 0.6;
        var floodY = STREET_BOT - floodH;
        c.fillStyle = 'rgba(130,135,140,0.18)';
        c.fillRect(0, floodY, W, floodH);
        for (var x = 0; x < W; x += br(8, 20)) {
            stk(c, x, floodY, x + br(4, 12), floodY + br(-1, 1), 0.08, 145, 0.2, 0);
        }
    }

    /* ═══════════ WILDFIRE GLOW ═══════════ */
    function drawWildfireFx(c) {
        if (DISASTER.active !== 'wildfire' || DISASTER.fireIntensity <= 0) return;
        var glow = DISASTER.fireIntensity;
        for (var i = 0; i < 5; i++) {
            var fx = br(W * 0.05, W * 0.95), fy = HORIZON + br(-15, 15);
            var fr = br(15, 40);
            c.beginPath(); c.arc(fx, fy, fr, 0, Math.PI * 2);
            c.fillStyle = 'rgba(160,140,120,' + (glow * 0.08) + ')';
            c.fill();
        }
        c.fillStyle = 'rgba(150,140,130,' + (glow * 0.06) + ')';
        c.fillRect(0, 0, W, HORIZON + 30);
    }

    /* ═══════════ LANDSLIDE FX ═══════════ */
    var landslideRocks = [];
    function updateLandslide(dt) {
        if (DISASTER.active !== 'landslide') { landslideRocks = []; return; }
        if (landslideRocks.length < 20 && DISASTER.timer < DISASTER.duration * 0.6) {
            landslideRocks.push({ x: br(W * 0.1, W * 0.9), y: HORIZON + br(-10, 10),
                vx: br(-20, 20), vy: br(40, 120), r: br(2, 6), g: bri(90, 130), alive: true });
        }
        for (var i = landslideRocks.length - 1; i >= 0; i--) {
            var r = landslideRocks[i];
            r.x += r.vx * dt; r.y += r.vy * dt; r.vy += 150 * dt;
            if (r.y > GROUND + 10) landslideRocks.splice(i, 1);
        }
    }
    function drawLandslide(c) {
        for (var i = 0; i < landslideRocks.length; i++) {
            var r = landslideRocks[i];
            c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            c.fillStyle = 'rgba(' + r.g + ',' + r.g + ',' + r.g + ',0.7)';
            c.fill();
        }
    }

    /* ═══════════ SINKHOLE FX ═══════════ */
    function drawSinkhole(c) {
        if (DISASTER.active !== 'sinkhole' || DISASTER.sinkholeR <= 0) return;
        var sx = DISASTER.sinkholeX, sy = (GROUND + STREET_BOT) / 2, sr = DISASTER.sinkholeR;
        arcStr(c, sx, sy, sr, sr * 0.5, 0, Math.PI * 2, 0.2, 0.8, 50, 0.7);
        arcStr(c, sx, sy, sr * 0.7, sr * 0.35, 0, Math.PI * 2, 0.25, 0.5, 35, 0.5);
        c.fillStyle = 'rgba(30,30,30,0.3)';
        c.beginPath(); c.ellipse(sx, sy, sr * 0.6, sr * 0.3, 0, 0, Math.PI * 2); c.fill();
        for (var a = 0; a < Math.PI * 2; a += 0.4) {
            var cr2 = sr + br(2, 6);
            stk(c, sx + Math.cos(a) * sr, sy + Math.sin(a) * sr * 0.5,
                sx + Math.cos(a + br(-0.2, 0.2)) * cr2, sy + Math.sin(a + br(-0.2, 0.2)) * cr2 * 0.5,
                0.15, 70, 0.4, 0);
        }
    }

    /* ═══════════ TSUNAMI FX ═══════════ */
    function drawTsunami(c) {
        if (DISASTER.active !== 'tsunami') return;
        var tx = DISASTER.tsunamiX;
        if (tx > W + 100 || tx < -100) return;
        for (var y = RIVER_TOP; y < H; y += 1.5) {
            var waveX = tx + Math.sin(y * 0.05) * 8;
            c.beginPath(); c.moveTo(waveX, y); c.lineTo(waveX + 25, y);
            c.strokeStyle = 'rgba(100,105,110,0.3)';
            c.lineWidth = 1.5; c.stroke();
        }
        for (var i = 0; i < 15; i++) {
            var fy = RIVER_TOP + br(0, H - RIVER_TOP);
            arcStr(c, tx + br(-5, 5), fy, br(3, 8), br(2, 5), Math.PI, Math.PI * 2, 0.3, 0.2, 195, 0.4);
        }
    }

    /* ═══════════ JOGGER ═══════════ */
    var joggers = [];
    function createJogger() {
        var dir = behRng() > 0.5 ? 1 : -1;
        var far = behRng() > 0.5;
        return { x: dir > 0 ? -10 : W + 10, y: far ? SIDEWALK_S - 2 : SIDEWALK_N_B - 2,
                 dir: dir, speed: br(28, 48), g: bri(40, 75), scale: far ? 0.75 : 1,
                 walkPhase: 0, phaseTimer: 0, alive: true };
    }
    function updateJogger(j, dt) {
        j.x += j.dir * j.speed * dt;
        j.phaseTimer += dt;
        if (j.phaseTimer > 0.1) { j.phaseTimer = 0; j.walkPhase = (j.walkPhase + 1) % 4; }
        if ((j.dir > 0 && j.x > W + 20) || (j.dir < 0 && j.x < -20)) j.alive = false;
    }
    function drawJogger(c, j) {
        var x = j.x, y = j.y, g = j.g, s = j.scale, ph = j.walkPhase;
        var h = 10 * s, bob = (ph === 1 || ph === 3) ? -0.6 * s : 0;
        arcStr(c, x, y - h + bob, 1.4 * s, 1.4 * s, 0, Math.PI * 2, 0.45, 0.25 * s, g, 0.9);
        stk(c, x - 1.2 * s, y - h + 0.3 + bob, x + 1.2 * s, y - h + 0.3 + bob, 0.3, g + 15, 0.6, 0);
        stk(c, x, y - h + 2.2 * s + bob, x, y - h * 0.38, 0.35 * s, g, 0.9, 0);
        var stride = (ph === 0 || ph === 2) ? 2.5 * s : 0.4 * s;
        var legDir = (ph === 0) ? 1 : (ph === 2) ? -1 : 0;
        stk(c, x, y - h * 0.38, x + legDir * stride * j.dir, y, 0.25 * s, g, 0.85, 0);
        stk(c, x, y - h * 0.38, x - legDir * stride * j.dir, y, 0.25 * s, g + 12, 0.75, 0);
        var armSwing = (ph === 0 || ph === 2) ? 3 * s : 0.6 * s;
        var armDir = (ph === 0) ? -1 : 1;
        stk(c, x, y - h + 3.2 * s + bob, x + armDir * armSwing * j.dir * 0.5, y - h * 0.45, 0.2 * s, g, 0.7, 0);
        stk(c, x, y - h + 3.2 * s + bob, x - armDir * armSwing * j.dir * 0.5, y - h * 0.45, 0.2 * s, g, 0.7, 0);
    }

    /* ═══════════ BUSKER ═══════════ */
    var buskers = [];
    function createBusker() {
        var instruments = ['guitar', 'sax', 'violin'];
        return { x: br(W * 0.15, W * 0.85), y: SIDEWALK_N_B - 2, g: bri(38, 70),
                 instrument: instruments[bri(0, 3)], noteTimer: 0, alive: true };
    }
    function updateBusker(b, dt) { b.noteTimer += dt; }
    function drawBusker(c, b) {
        var x = b.x, y = b.y, g = b.g;
        arcStr(c, x, y - 9, 1.4, 1.4, 0, Math.PI * 2, 0.45, 0.25, g, 0.9);
        stk(c, x, y - 7.5, x, y - 3.5, 0.35, g, 0.9, 0);
        stk(c, x, y - 3.5, x - 1.2, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3.5, x + 1.2, y, 0.25, g + 10, 0.7, 0);
        if (b.instrument === 'guitar') {
            stk(c, x + 1.5, y - 6, x + 1.5, y - 2, 0.3, 55, 0.7, 0);
            arcStr(c, x + 1.5, y - 2, 1.8, 1.2, 0, Math.PI * 2, 0.4, 0.2, 60, 0.6);
        } else if (b.instrument === 'sax') {
            stk(c, x + 1, y - 7, x + 2.5, y - 3, 0.35, 50, 0.7, 0);
            arcStr(c, x + 2.5, y - 2.5, 1, 1.5, 0, Math.PI, 0.3, 0.25, 55, 0.6);
        } else {
            stk(c, x - 2.5, y - 7, x + 0.5, y - 5, 0.3, 50, 0.7, 0);
            stk(c, x - 2, y - 7, x - 3, y - 5.5, 0.15, 55, 0.5, 0);
        }
        if (ATM.rainIntensity < 0.5 && Math.sin(b.noteTimer * 3) > 0.5) {
            var ny = y - 11 - Math.sin(b.noteTimer * 2) * 3;
            stk(c, x + 1, ny, x + 2, ny - 1, 0.2, g + 30, 0.4, 0);
            arcStr(c, x + 1, ny, 0.8, 0.8, 0, Math.PI * 2, 0.5, 0.15, g + 25, 0.35);
        }
    }

    /* ═══════════ VENDOR ═══════════ */
    var vendors = [];
    function createVendor() {
        return { x: br(W * 0.1, W * 0.9), y: SIDEWALK_N_B - 2, g: bri(45, 75),
                 smokeTimer: 0, alive: true };
    }
    function updateVendor(v, dt) { v.smokeTimer += dt; }
    function drawVendor(c, v) {
        var x = v.x, y = v.y, g = v.g;
        arcStr(c, x, y - 9, 1.4, 1.4, 0, Math.PI * 2, 0.45, 0.25, g, 0.9);
        stk(c, x, y - 7.5, x, y - 3.5, 0.35, g, 0.85, 0);
        stk(c, x, y - 3.5, x - 1, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3.5, x + 1, y, 0.25, g + 10, 0.7, 0);
        rectStk(c, x + 3, y - 6, 12, 6, 0.4, g + 20, 0.7);
        stk(c, x + 3, y - 8, x + 15, y - 8, 0.6, g + 35, 0.5, 0);
        stk(c, x + 3, y - 8, x + 3, y - 6, 0.25, g + 15, 0.5, 0);
        stk(c, x + 15, y - 8, x + 15, y - 6, 0.25, g + 15, 0.5, 0);
        for (var sx = x + 3; sx < x + 15; sx += 2.5) {
            stk(c, sx, y - 8, sx + 1.2, y - 6, 0.06, g + 40, 0.35, 0);
        }
        if (Math.sin(v.smokeTimer * 1.5) > 0) {
            for (var s = 0; s < 3; s++) {
                var sy = y - 8 - s * 3 - Math.sin(v.smokeTimer * 2 + s) * 2;
                arcStr(c, x + 9 + Math.sin(v.smokeTimer + s) * 1.5, sy, 1.5 + s * 0.5, 1 + s * 0.3,
                    0, Math.PI * 2, 0.4, 0.12, 185, 0.2 - s * 0.05);
            }
        }
    }

    /* ═══════════ PIGEON ═══════════ */
    var pigeons = [];
    function createPigeon() {
        return { x: br(20, W - 20), y: SIDEWALK_N_B - 1, g: bri(70, 110),
                 state: 'walk', dir: behRng() > 0.5 ? 1 : -1, speed: br(5, 12),
                 peckTimer: 0, walkPhase: 0, phaseTimer: 0, stateTimer: br(2, 8),
                 flyY: 0, alive: true };
    }
    function updatePigeon(p, dt) {
        p.stateTimer -= dt;
        if (p.stateTimer <= 0) {
            var states = ['walk', 'peck', 'idle'];
            p.state = states[bri(0, states.length)];
            p.stateTimer = br(2, 8);
            if (p.state === 'walk') p.dir = behRng() > 0.5 ? 1 : -1;
        }
        if (p.state === 'walk') {
            p.x += p.dir * p.speed * dt;
            p.phaseTimer += dt;
            if (p.phaseTimer > 0.2) { p.phaseTimer = 0; p.walkPhase = (p.walkPhase + 1) % 4; }
            if (p.x < 5 || p.x > W - 5) p.dir = -p.dir;
        } else if (p.state === 'peck') {
            p.peckTimer += dt;
        }
        for (var i = 0; i < peds.length; i++) {
            if (Math.abs(peds[i].x - p.x) < 12 && Math.abs(peds[i].y - p.y) < 8) {
                p.state = 'fly'; p.flyY = p.y; p.stateTimer = 3;
                break;
            }
        }
        if (p.state === 'fly') {
            p.flyY -= 40 * dt;
            p.x += p.dir * 30 * dt;
            if (p.flyY < HORIZON) p.alive = false;
        }
    }
    function drawPigeon(c, p) {
        var x = p.x, y = p.state === 'fly' ? p.flyY : p.y, g = p.g;
        if (p.state === 'fly') {
            stk(c, x - 3, y + Math.sin(p.phaseTimer * 20) * 2, x, y, 0.25, g, 0.7, 0);
            stk(c, x + 3, y + Math.sin(p.phaseTimer * 20) * 2, x, y, 0.25, g, 0.7, 0);
            stk(c, x, y, x - p.dir * 2, y + 1, 0.2, g, 0.6, 0);
        } else {
            arcStr(c, x, y - 2.5, 1.2, 1, 0, Math.PI * 2, 0.4, 0.2, g, 0.7);
            stk(c, x, y - 1.5, x, y - 0.5, 0.3, g, 0.7, 0);
            var headDip = p.state === 'peck' && Math.sin(p.peckTimer * 12) > 0 ? 1 : 0;
            arcStr(c, x + p.dir * 1.2, y - 3 + headDip, 0.6, 0.5, 0, Math.PI * 2, 0.5, 0.15, g - 10, 0.7);
            stk(c, x + p.dir * 1.8, y - 2.8 + headDip, x + p.dir * 2.3, y - 2.6 + headDip, 0.15, 50, 0.6, 0);
            stk(c, x - 0.5, y - 0.5, x - 0.5, y, 0.12, g - 10, 0.6, 0);
            stk(c, x + 0.5, y - 0.5, x + 0.5, y, 0.12, g - 10, 0.6, 0);
        }
    }

    /* ═══════════ CAT ═══════════ */
    var cats = [];
    function createCat() {
        return { x: br(30, W - 30), y: SIDEWALK_S - 1.5, g: bri(50, 90),
                 state: 'sit', dir: behRng() > 0.5 ? 1 : -1, speed: br(6, 14),
                 stateTimer: br(5, 20), tailPhase: br(0, Math.PI * 2), alive: true };
    }
    function updateCat(cat, dt) {
        cat.tailPhase += dt * 2;
        cat.stateTimer -= dt;
        if (cat.stateTimer <= 0) {
            cat.state = cat.state === 'sit' ? 'walk' : 'sit';
            cat.stateTimer = br(5, 20);
            cat.dir = behRng() > 0.5 ? 1 : -1;
        }
        if (cat.state === 'walk') {
            cat.x += cat.dir * cat.speed * dt;
            if (cat.x < 10 || cat.x > W - 10) cat.dir = -cat.dir;
        }
    }
    function drawCat(c, cat) {
        var x = cat.x, y = cat.y, g = cat.g;
        if (cat.state === 'sit') {
            arcStr(c, x, y - 2, 2, 1.5, 0, Math.PI * 2, 0.4, 0.25, g, 0.7);
            arcStr(c, x + cat.dir * 1.8, y - 3.5, 0.8, 0.7, 0, Math.PI * 2, 0.45, 0.2, g, 0.7);
            stk(c, x + cat.dir * 1.2, y - 4, x + cat.dir * 1.8, y - 4.8, 0.15, g - 5, 0.6, 0);
            stk(c, x + cat.dir * 2.2, y - 4, x + cat.dir * 2.6, y - 4.8, 0.15, g - 5, 0.6, 0);
            var tailTip = Math.sin(cat.tailPhase) * 2;
            stk(c, x - cat.dir * 1.8, y - 1.5, x - cat.dir * 4, y - 2.5 + tailTip, 0.2, g, 0.6, 0);
        } else {
            stk(c, x - cat.dir * 2, y - 1.5, x + cat.dir * 2, y - 1.5, 0.35, g, 0.7, 0);
            arcStr(c, x + cat.dir * 2.5, y - 2.5, 0.8, 0.7, 0, Math.PI * 2, 0.45, 0.2, g, 0.7);
            stk(c, x - cat.dir * 0.8, y - 1, x - cat.dir * 0.8, y, 0.12, g - 5, 0.6, 0);
            stk(c, x + cat.dir * 0.8, y - 1, x + cat.dir * 0.8, y, 0.12, g - 5, 0.6, 0);
            var tailTip2 = Math.sin(cat.tailPhase) * 1.5;
            stk(c, x - cat.dir * 2, y - 1.5, x - cat.dir * 4, y - 3 + tailTip2, 0.2, g, 0.5, 0);
        }
    }

    /* ═══════════ SEAGULL ═══════════ */
    var seagulls = [];
    function createSeagull() {
        return { x: br(-20, W + 20), y: br(HORIZON * 0.3, BEACH_Y - 10),
                 dir: behRng() > 0.5 ? 1 : -1, speed: br(15, 30),
                 flapPhase: br(0, Math.PI * 2), diving: false,
                 diveTarget: 0, baseY: 0, g: bri(85, 120), alive: true };
    }
    function updateSeagull(s, dt) {
        s.flapPhase += dt * 8;
        s.x += s.dir * s.speed * dt;
        if (!s.diving) {
            s.y += Math.sin(s.flapPhase * 0.3) * 0.3;
            if (behRng() < 0.002) {
                s.diving = true; s.baseY = s.y;
                s.diveTarget = RIVER_TOP + br(0, 15);
            }
        } else {
            if (s.y < s.diveTarget) { s.y += 60 * dt; }
            else { s.y -= 30 * dt; if (s.y <= s.baseY) { s.y = s.baseY; s.diving = false; } }
        }
        if ((s.dir > 0 && s.x > W + 30) || (s.dir < 0 && s.x < -30)) s.alive = false;
    }
    function drawSeagull(c, s) {
        var x = s.x, y = s.y, wing = Math.sin(s.flapPhase) * 3.5;
        stk(c, x - 5, y + wing, x, y, 0.3, s.g, 0.7, 0);
        stk(c, x + 5, y + wing, x, y, 0.3, s.g, 0.7, 0);
        stk(c, x, y, x + s.dir * 2, y + 0.5, 0.2, s.g - 15, 0.6, 0);
    }

    /* ═══════════ SWIMMER ═══════════ */
    var swimmers = [];
    function createSwimmer() {
        return { x: br(W * 0.1, W * 0.9), y: RIVER_TOP + br(3, 15),
                 dir: behRng() > 0.5 ? 1 : -1, speed: br(4, 10), g: bri(50, 85),
                 splashPhase: br(0, Math.PI * 2), alive: true };
    }
    function updateSwimmer(s, dt) {
        s.x += s.dir * s.speed * dt;
        s.splashPhase += dt * 6;
        if (s.x < W * 0.05 || s.x > W * 0.95) s.dir = -s.dir;
    }
    function drawSwimmer(c, s) {
        var x = s.x, y = s.y, g = s.g;
        arcStr(c, x, y - 1.2, 1.2, 1.2, 0, Math.PI * 2, 0.45, 0.2, g, 0.7);
        var splash = Math.sin(s.splashPhase) * 1.5;
        stk(c, x + s.dir * 2, y, x + s.dir * 3, y - 1 + splash, 0.15, g + 20, 0.4, 0);
        stk(c, x - 1.5, y + 0.5, x + 1.5, y + 0.5, 0.1, 155, 0.25, 0);
    }

    /* ═══════════ SURFER ═══════════ */
    var surfers = [];
    function createSurfer() {
        return { x: br(W * 0.1, W * 0.9), y: RIVER_TOP + br(2, 10),
                 dir: behRng() > 0.5 ? 1 : -1, speed: br(8, 18), g: bri(45, 80),
                 standing: behRng() > 0.4, bobPhase: br(0, Math.PI * 2), alive: true };
    }
    function updateSurfer(s, dt) {
        s.x += s.dir * s.speed * dt;
        s.bobPhase += dt * 2;
        if (s.x < W * 0.05 || s.x > W * 0.95) s.dir = -s.dir;
    }
    function drawSurfer(c, s) {
        var x = s.x, y = s.y + Math.sin(s.bobPhase) * 0.8, g = s.g;
        stk(c, x - 5, y + 1, x + 5, y + 1, 0.5, g + 15, 0.6, 0);
        if (s.standing) {
            stk(c, x, y + 1, x, y - 5, 0.3, g, 0.8, 0);
            arcStr(c, x, y - 6, 1, 1, 0, Math.PI * 2, 0.45, 0.2, g, 0.8);
            stk(c, x, y - 3, x - 1, y, 0.2, g, 0.7, 0);
            stk(c, x, y - 3, x + 1, y, 0.2, g + 8, 0.65, 0);
        } else {
            stk(c, x - 2, y - 0.5, x + 2, y - 0.5, 0.25, g, 0.7, 0);
            arcStr(c, x + 2, y - 1.5, 0.7, 0.7, 0, Math.PI * 2, 0.45, 0.15, g, 0.7);
        }
        stk(c, x + s.dir * 4, y + 1.5, x + s.dir * 6, y + 2, 0.1, 155, 0.2, 0);
    }

    /* ═══════════ PADDLEBOARDER ═══════════ */
    var paddlers = [];
    function createPaddler() {
        return { x: br(W * 0.1, W * 0.9), y: RIVER_TOP + br(5, 18),
                 dir: behRng() > 0.5 ? 1 : -1, speed: br(5, 12), g: bri(50, 80),
                 paddlePhase: br(0, Math.PI * 2), bobPhase: br(0, Math.PI * 2), alive: true };
    }
    function updatePaddler(p, dt) {
        p.x += p.dir * p.speed * dt; p.paddlePhase += dt * 3; p.bobPhase += dt * 2;
        if (p.x < W * 0.05 || p.x > W * 0.95) p.dir = -p.dir;
    }
    function drawPaddler(c, p) {
        var x = p.x, y = p.y + Math.sin(p.bobPhase) * 0.6, g = p.g;
        stk(c, x - 5, y + 0.5, x + 5, y + 0.5, 0.5, g + 15, 0.6, 0);
        stk(c, x, y + 0.5, x, y - 6, 0.3, g, 0.8, 0);
        arcStr(c, x, y - 7, 1, 1, 0, Math.PI * 2, 0.45, 0.2, g, 0.8);
        var paddleSwing = Math.sin(p.paddlePhase) * 3;
        var side = Math.sin(p.paddlePhase) > 0 ? 1 : -1;
        stk(c, x, y - 4, x + side * 3, y - 1 + paddleSwing * 0.3, 0.2, 55, 0.6, 0);
        stk(c, x + side * 3, y - 1 + paddleSwing * 0.3, x + side * 3.5, y + 0.5, 0.25, 50, 0.5, 0);
    }

    /* ═══════════ JET SKI ═══════════ */
    var jetskis = [];
    function createJetSki() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return { x: dir > 0 ? -15 : W + 15, y: RIVER_TOP + br(3, 12),
                 dir: dir, speed: br(45, 80), g: bri(45, 75),
                 bobPhase: br(0, Math.PI * 2), alive: true };
    }
    function updateJetSki(j, dt) {
        j.x += j.dir * j.speed * dt; j.bobPhase += dt * 4;
        if ((j.dir > 0 && j.x > W + 30) || (j.dir < 0 && j.x < -30)) j.alive = false;
    }
    function drawJetSki(c, j) {
        var x = j.x, y = j.y + Math.sin(j.bobPhase) * 1.2, d = j.dir, g = j.g;
        arcStr(c, x, y + 1, 6, 2.5, 0, Math.PI, 0.25, 0.45, g, 0.7);
        stk(c, x - d * 5, y + 1, x + d * 5, y + 1, 0.4, g - 8, 0.8, 0);
        stk(c, x, y + 0.5, x, y - 4, 0.3, g, 0.8, 0);
        arcStr(c, x, y - 5, 0.8, 0.8, 0, Math.PI * 2, 0.45, 0.2, g, 0.8);
        for (var w = 1; w < 6; w++) {
            var wx = x - d * (w * 4 + 3);
            var wa = Math.max(0, 0.3 - w * 0.05);
            arcStr(c, wx, y + 2, w * 1.8, 1, d > 0 ? Math.PI * 0.7 : 0, d > 0 ? Math.PI : Math.PI * 0.3, 0.3, 0.12, 190, wa);
        }
    }

    /* ═══════════ FISHERMAN ═══════════ */
    var fishermen = [];
    function createFisherman() {
        return { x: br(W * 0.55, W * 0.75), y: RIVER_TOP - 5, g: bri(45, 70),
                 bobberPhase: br(0, Math.PI * 2), alive: true };
    }
    function updateFisherman(f, dt) { f.bobberPhase += dt * 1.5; }
    function drawFisherman(c, f) {
        var x = f.x, y = f.y, g = f.g;
        arcStr(c, x, y - 8, 1.3, 1.3, 0, Math.PI * 2, 0.45, 0.2, g, 0.8);
        stk(c, x, y - 6.5, x, y - 2.5, 0.3, g, 0.85, 0);
        stk(c, x, y - 2.5, x - 1, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 2.5, x + 1, y, 0.25, g + 10, 0.7, 0);
        var rodTipX = x + 12, rodTipY = y - 14;
        stk(c, x + 1, y - 5.5, rodTipX, rodTipY, 0.2, 65, 0.7, 0);
        var bobberX = rodTipX + 3, bobberY = RIVER_TOP + 2 + Math.sin(f.bobberPhase) * 1;
        stk(c, rodTipX, rodTipY, bobberX, bobberY, 0.08, 120, 0.3, 0);
        arcStr(c, bobberX, bobberY, 0.8, 0.8, 0, Math.PI * 2, 0.5, 0.2, 70, 0.6);
    }

    /* ═══════════ SUNBATHER ═══════════ */
    var sunbathers = [];
    function createSunbather() {
        return { x: br(40, W - 40), y: BEACH_Y + br(-2, 0), g: bri(55, 95),
                 lying: behRng() > 0.3, alive: true };
    }
    function drawSunbather(c, s) {
        var x = s.x, y = s.y, g = s.g;
        stk(c, x - 4, y + 0.5, x + 5, y + 0.5, 0.8, g + 40, 0.3, 0);
        if (s.lying) {
            stk(c, x - 3, y - 0.5, x + 3, y - 0.5, 0.3, g, 0.7, 0);
            arcStr(c, x - 3.5, y - 1, 0.8, 0.8, 0, Math.PI * 2, 0.45, 0.15, g, 0.7);
        } else {
            arcStr(c, x, y - 3, 1, 1, 0, Math.PI * 2, 0.45, 0.2, g, 0.7);
            stk(c, x, y - 2, x, y - 0.5, 0.25, g, 0.7, 0);
            stk(c, x, y - 0.5, x + 2, y, 0.2, g, 0.6, 0);
        }
    }

    /* ═══════════ BEACH VOLLEYBALL PLAYER ═══════════ */
    var bplayers = [];
    function createBPlayer() {
        var side = behRng() > 0.5 ? 1 : -1;
        var netX = W * 0.4;
        return { x: netX + side * br(5, 20), y: BEACH_Y - 1, g: bri(50, 80),
                 armUp: false, armTimer: br(1, 4), alive: true };
    }
    function updateBPlayer(p, dt) {
        p.armTimer -= dt;
        if (p.armTimer <= 0) { p.armUp = !p.armUp; p.armTimer = br(0.5, 3); }
    }
    function drawBPlayer(c, p) {
        var x = p.x, y = p.y, g = p.g;
        arcStr(c, x, y - 8, 1.2, 1.2, 0, Math.PI * 2, 0.45, 0.2, g, 0.8);
        stk(c, x, y - 6.5, x, y - 3, 0.3, g, 0.85, 0);
        stk(c, x, y - 3, x - 1, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3, x + 1, y, 0.25, g + 8, 0.7, 0);
        if (p.armUp) {
            stk(c, x, y - 5.5, x + 2, y - 8, 0.2, g, 0.7, 0);
            stk(c, x, y - 5.5, x - 1.5, y - 4, 0.2, g, 0.7, 0);
        } else {
            stk(c, x, y - 5.5, x + 1.5, y - 3.5, 0.2, g, 0.7, 0);
            stk(c, x, y - 5.5, x - 1.5, y - 3.5, 0.2, g, 0.7, 0);
        }
    }

    /* ═══════════ VOLUNTEER ═══════════ */
    var volunteers = [];
    function createVolunteer() {
        var roles = ['cleanup', 'gardener', 'foodline'];
        var role = roles[bri(0, 3)];
        var yPos = role === 'cleanup' ? BEACH_Y - 1 : SIDEWALK_N_B - 2;
        return { x: br(30, W - 30), y: yPos, g: bri(40, 70), role: role,
                 dir: behRng() > 0.5 ? 1 : -1, speed: br(4, 10),
                 walkPhase: 0, phaseTimer: 0, alive: true };
    }
    function updateVolunteer(v, dt) {
        v.x += v.dir * v.speed * dt;
        v.phaseTimer += dt;
        if (v.phaseTimer > 0.22) { v.phaseTimer = 0; v.walkPhase = (v.walkPhase + 1) % 4; }
        if (v.x < 15 || v.x > W - 15) v.dir = -v.dir;
    }
    function drawVolunteer(c, v) {
        var x = v.x, y = v.y, g = v.g, ph = v.walkPhase;
        arcStr(c, x, y - 9, 1.4, 1.4, 0, Math.PI * 2, 0.45, 0.25, g, 0.9);
        stk(c, x, y - 7.5, x, y - 3.5, 0.35, g, 0.85, 0);
        stk(c, x - 1, y - 6, x + 1, y - 4.5, 0.12, 120, 0.5, 0);
        stk(c, x + 1, y - 6, x - 1, y - 4.5, 0.12, 120, 0.5, 0);
        var stride = (ph === 0 || ph === 2) ? 1.3 : 0.2;
        var legDir = ph === 0 ? 1 : (ph === 2 ? -1 : 0);
        stk(c, x, y - 3.5, x + legDir * stride * v.dir, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3.5, x - legDir * stride * v.dir, y, 0.25, g + 10, 0.7, 0);
        if (v.role === 'cleanup') {
            stk(c, x + 1.5, y - 5, x + 3, y - 1, 0.2, 55, 0.6, 0);
        } else if (v.role === 'gardener') {
            stk(c, x + 1.5, y - 5, x + 2, y - 2, 0.3, 50, 0.5, 0);
            stk(c, x + 2, y - 2, x + 2.5, y - 1, 0.4, 55, 0.5, 0);
        }
    }

    /* ═══════════ CRIMINAL & POLICE ═══════════ */
    var criminals = [];
    var policeFoot = [];
    function createCriminal() {
        var dir = behRng() > 0.5 ? 1 : -1;
        return { x: br(W * 0.2, W * 0.8), y: SIDEWALK_N_B - 2, g: bri(30, 55),
                 dir: dir, speed: br(8, 15), state: 'prowl', stateTimer: br(5, 15),
                 walkPhase: 0, phaseTimer: 0, fleeSpeed: br(35, 55), alive: true };
    }
    function updateCriminal(cr, dt) {
        cr.stateTimer -= dt;
        cr.phaseTimer += dt;
        if (cr.phaseTimer > 0.15) { cr.phaseTimer = 0; cr.walkPhase = (cr.walkPhase + 1) % 4; }
        if (cr.state === 'prowl') {
            cr.x += cr.dir * cr.speed * dt;
            if (cr.x < 30 || cr.x > W - 30) cr.dir = -cr.dir;
            if (cr.stateTimer <= 0) {
                cr.state = 'flee'; cr.stateTimer = 10;
                if (policeFoot.length < MAX_POLICE_FOOT) policeFoot.push(createPolice(cr));
            }
        } else if (cr.state === 'flee') {
            cr.x += cr.dir * cr.fleeSpeed * dt;
            if ((cr.dir > 0 && cr.x > W + 20) || (cr.dir < 0 && cr.x < -20)) cr.alive = false;
        }
    }
    function drawCriminal(c, cr) {
        var x = cr.x, y = cr.y, g = cr.g, ph = cr.walkPhase;
        arcStr(c, x, y - 9, 1.4, 1.4, 0, Math.PI * 2, 0.45, 0.25, g, 0.9);
        stk(c, x - 1.5, y - 9.8, x + 1.5, y - 9.8, 0.8, g - 5, 0.6, 0);
        stk(c, x - 1.5, y - 9.8, x - 1.5, y - 8.5, 0.2, g - 5, 0.5, 0);
        stk(c, x + 1.5, y - 9.8, x + 1.5, y - 8.5, 0.2, g - 5, 0.5, 0);
        stk(c, x, y - 7.5, x, y - 3.5, 0.35, g, 0.85, 0);
        var spd = cr.state === 'flee' ? 2.5 : 1.2;
        var stride = (ph === 0 || ph === 2) ? spd : 0.2;
        var legDir = ph === 0 ? 1 : (ph === 2 ? -1 : 0);
        stk(c, x, y - 3.5, x + legDir * stride * cr.dir, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3.5, x - legDir * stride * cr.dir, y, 0.25, g + 8, 0.7, 0);
        stk(c, x, y - 6, x + 1.5, y - 4, 0.2, g, 0.7, 0);
        stk(c, x, y - 6, x - 1.5, y - 4, 0.2, g, 0.7, 0);
    }
    function createPolice(target) {
        return { x: target.x + (target.dir > 0 ? -80 : 80), y: SIDEWALK_N_B - 2,
                 g: bri(30, 50), dir: target.dir, speed: br(40, 55),
                 targetCriminal: target, walkPhase: 0, phaseTimer: 0, alive: true };
    }
    function updatePolice(p, dt) {
        if (!p.targetCriminal || !p.targetCriminal.alive) { p.alive = false; return; }
        var dx = p.targetCriminal.x - p.x;
        p.dir = dx > 0 ? 1 : -1;
        p.x += p.dir * p.speed * dt;
        p.phaseTimer += dt;
        if (p.phaseTimer > 0.1) { p.phaseTimer = 0; p.walkPhase = (p.walkPhase + 1) % 4; }
        if (Math.abs(dx) < 8) { p.targetCriminal.alive = false; p.alive = false; }
        if ((p.dir > 0 && p.x > W + 20) || (p.dir < 0 && p.x < -20)) p.alive = false;
    }
    function drawPolice(c, p) {
        var x = p.x, y = p.y, g = p.g, ph = p.walkPhase;
        arcStr(c, x, y - 9, 1.4, 1.4, 0, Math.PI * 2, 0.45, 0.25, g, 0.9);
        stk(c, x - 1.8, y - 10, x + 1.8, y - 10, 0.6, 45, 0.7, 0);
        stk(c, x - 1.8, y - 10.5, x + 1.8, y - 10.5, 0.3, 50, 0.5, 0);
        stk(c, x, y - 7.5, x, y - 3.5, 0.35, g + 5, 0.85, 0);
        var stride = (ph === 0 || ph === 2) ? 2.5 : 0.3;
        var legDir = ph === 0 ? 1 : (ph === 2 ? -1 : 0);
        stk(c, x, y - 3.5, x + legDir * stride * p.dir, y, 0.25, g, 0.8, 0);
        stk(c, x, y - 3.5, x - legDir * stride * p.dir, y, 0.25, g + 8, 0.7, 0);
        stk(c, x + 0.8, y - 7, x + 0.8, y - 6.5, 0.25, 200, 0.5, 0);
    }

    /* ═══════════ EMERGENCY VEHICLES ═══════════ */
    var emTimers = { ambulance: 60, fire: 100, patrol: 35 };

    /* ═══════════ UMBRELLA PEDESTRIANS ═══════════ */
    function drawUmbrella(c, x, y, g) {
        stk(c, x, y - 11, x, y - 3, 0.2, g + 20, 0.6, 0);
        arcStr(c, x, y - 11.5, 4, 2.5, Math.PI, Math.PI * 2, 0.2, 0.3, g + 25, 0.55);
        stk(c, x - 4, y - 11.5, x + 4, y - 11.5, 0.25, g + 20, 0.5, 0);
        for (var ux = x - 3.5; ux < x + 4; ux += 2) {
            stk(c, ux, y - 11.5, ux + 1, y - 10, 0.06, g + 30, 0.3, 0);
        }
    }

    /* ═══════════ WINDOW LIGHTS ═══════════ */
    function drawLitWindows(c, now) {
        var dayFade = getDayAlpha();
        if (dayFade < 0.05) return;
        var alpha = dayFade * 0.45;
        var t = now / 1000;
        for (var i = 0; i < litWindows.length; i++) {
            var lw = litWindows[i];
            var gOsc = 115 + Math.sin(t / lw.period * Math.PI * 2 + lw.phase) * 25;
            var g = Math.floor(gOsc);
            c.fillStyle = 'rgba(' + g + ',' + g + ',' + (g - 5) + ',' + alpha + ')';
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
        var g = Math.floor(PAPER_BASE - nightAmt * 20 - ATM.paperDarken);
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

        /* spawn flocks (many!) */
        flocks = [];
        for (var i = 0; i < bri(6, MAX_FLOCKS); i++) flocks.push(createFlock());

        /* reset smoke */
        smokePuffs = [];

        planes = [];
        helis = [];

        /* spawn alien attack saucers — wave system */
        aliens = [];
        alienDebris = [];
        alienTimer = 0.5;
        waveTimer = 0;
        waveSpawnCount = 0;

        /* reset nuclear defense */
        nukes = [];
        nukeExplosions = [];
        nukeTimer = 0;

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

        /* spawn joggers */
        joggers = [];
        for (var i = 0; i < bri(1, 3); i++) { var j = createJogger(); j.x = br(30, W - 30); joggers.push(j); }

        /* spawn buskers */
        buskers = [];
        for (var i = 0; i < bri(1, MAX_BUSKERS); i++) buskers.push(createBusker());

        /* spawn vendors */
        vendors = [];
        for (var i = 0; i < bri(1, MAX_VENDORS); i++) vendors.push(createVendor());

        /* spawn pigeons */
        pigeons = [];
        for (var i = 0; i < bri(4, MAX_PIGEONS); i++) pigeons.push(createPigeon());

        /* spawn cats */
        cats = [];
        for (var i = 0; i < bri(1, MAX_CATS); i++) cats.push(createCat());

        /* spawn seagulls */
        seagulls = [];
        for (var i = 0; i < bri(2, MAX_SEAGULLS); i++) seagulls.push(createSeagull());

        /* spawn swimmers */
        swimmers = [];
        for (var i = 0; i < bri(1, MAX_SWIMMERS); i++) swimmers.push(createSwimmer());

        /* spawn surfers */
        surfers = [];
        for (var i = 0; i < bri(1, MAX_SURFERS); i++) surfers.push(createSurfer());

        /* spawn paddleboarders */
        paddlers = [];
        for (var i = 0; i < bri(1, MAX_PADDLERS); i++) paddlers.push(createPaddler());

        /* spawn jetskis */
        jetskis = [];

        /* spawn fishermen */
        fishermen = [];
        for (var i = 0; i < bri(1, MAX_FISHERMEN); i++) fishermen.push(createFisherman());

        /* spawn sunbathers */
        sunbathers = [];
        for (var i = 0; i < bri(2, MAX_SUNBATHERS); i++) sunbathers.push(createSunbather());

        /* spawn beach volleyball players */
        bplayers = [];
        for (var i = 0; i < bri(2, MAX_BPLAYERS); i++) bplayers.push(createBPlayer());

        /* spawn volunteers */
        volunteers = [];
        for (var i = 0; i < bri(1, MAX_VOLUNTEERS); i++) volunteers.push(createVolunteer());

        /* criminals & police */
        criminals = [];
        policeFoot = [];

        warPlanes = [];
        spaceships = [];
        flyingCars = [];

        /* rain */
        raindrops = [];

        /* reset strike system */
        strikeTimer = br(1, 3);
        pendingDamage = null;
        damageTimer = 0;
        asteroidTimer = 1;
        asteroids = [];
        missiles = [];
        missileTimer = 0;
        missileExplosions = [];
        asteroidImpacts = [];

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
    var joggerSpawnTimer = 0;
    var seagullSpawnTimer = 0;
    var criminalSpawnTimer = br(15, 40);
    var jetskiSpawnTimer = 0;

    function frame(now) {
        var dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow = now;
        dayPhase += dt / DAY_CYCLE;
        if (dayPhase > 1) dayPhase -= 1;

        /* ── WEATHER & DISASTER ── */
        updateDisaster(dt);
        updateRain(dt);
        updateLightning(dt);
        updateStrikeSystem(dt);
        updateCrumbleDebris(dt);
        updateDefenseSystem(dt);
        updateNukeDefense(dt);
        updateAlienDebris(dt);
        updateAsteroidImpacts(dt);

        /* ── UPDATE ── */
        /* construction */
        for (var i = constructions.length - 1; i >= 0; i--) {
            updateConstruction(constructions[i], dt);
        }

        /* cranes — remove cranes for done constructions */
        for (var i = cranes.length - 1; i >= 0; i--) {
            var conRef = constructions[cranes[i].conIdx];
            if (conRef && conRef.done) { cranes.splice(i, 1); continue; }
            updateCrane(cranes[i], dt);
        }

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
        if (flocks.length < MAX_FLOCKS && behRng() < 0.03) flocks.push(createFlock());

        /* clouds */
        for (var i = 0; i < clouds.length; i++) updateCloud(clouds[i], dt);

        /* (planes and helicopters removed) */

        /* (war planes removed) */

        /* (spaceships removed) */

        /* (flying cars removed) */


        /* alien wave system — swarm at start of each minute, nukes clear them */
        for (var i = aliens.length - 1; i >= 0; i--) {
            updateAlien(aliens[i], dt);
            if (!aliens[i].alive) aliens.splice(i, 1);
        }
        /* freeze wave timer while victory banner is flying */
        if (!victoryBanner.active) {
            waveTimer += dt;
            if (waveTimer >= WAVE_DURATION) {
                waveTimer = 0;
                waveSpawnCount = 0;
            }
        }
        var wavePhase = waveTimer / WAVE_DURATION;
        if (!victoryBanner.active && wavePhase < 0.3 && waveSpawnCount < WAVE_SPAWN_TARGET) {
            alienTimer -= dt;
            if (alienTimer <= 0) {
                var burst = bri(2, 4);
                for (var bi = 0; bi < burst && waveSpawnCount < WAVE_SPAWN_TARGET; bi++) {
                    aliens.push(createAlien());
                    waveSpawnCount++;
                }
                alienTimer = br(0.4, 1.2);
            }
        }
        /* victory banner — trigger when all spawned aliens are destroyed */
        if (waveSpawnCount >= WAVE_SPAWN_TARGET && aliens.length === 0 && !victoryBanner.active && !victoryBanner.triggered) {
            spawnVictoryBanner();
        }
        if (!victoryBanner.active && waveTimer < dt * 2) victoryBanner.triggered = false;
        updateVictoryBanner(dt);
        /* asteroids */
        for (var i = asteroids.length - 1; i >= 0; i--) {
            updateAsteroid(asteroids[i], dt);
            if (!asteroids[i].alive) asteroids.splice(i, 1);
        }

        /* trains */
        for (var i = trains.length - 1; i >= 0; i--) {
            updateTrain(trains[i], dt);
            if (!trains[i].alive) trains.splice(i, 1);
        }
        if (trains.length === 0) trains.push(createTrain());

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

        /* joggers */
        for (var i = joggers.length - 1; i >= 0; i--) {
            updateJogger(joggers[i], dt);
            if (!joggers[i].alive) joggers.splice(i, 1);
        }
        joggerSpawnTimer += dt;
        if (joggerSpawnTimer > br(5, 15) && joggers.length < MAX_JOGGERS) {
            joggers.push(createJogger());
            joggerSpawnTimer = 0;
        }

        /* buskers */
        for (var i = 0; i < buskers.length; i++) updateBusker(buskers[i], dt);

        /* vendors */
        for (var i = 0; i < vendors.length; i++) updateVendor(vendors[i], dt);

        /* pigeons */
        for (var i = pigeons.length - 1; i >= 0; i--) {
            updatePigeon(pigeons[i], dt);
            if (!pigeons[i].alive) pigeons.splice(i, 1);
        }
        if (pigeons.length < MAX_PIGEONS && behRng() < 0.005) pigeons.push(createPigeon());

        /* cats */
        for (var i = 0; i < cats.length; i++) updateCat(cats[i], dt);

        /* seagulls */
        for (var i = seagulls.length - 1; i >= 0; i--) {
            updateSeagull(seagulls[i], dt);
            if (!seagulls[i].alive) seagulls.splice(i, 1);
        }
        seagullSpawnTimer += dt;
        if (seagullSpawnTimer > br(4, 12) && seagulls.length < MAX_SEAGULLS) {
            seagulls.push(createSeagull());
            seagullSpawnTimer = 0;
        }

        /* swimmers */
        for (var i = 0; i < swimmers.length; i++) updateSwimmer(swimmers[i], dt);

        /* surfers */
        for (var i = 0; i < surfers.length; i++) updateSurfer(surfers[i], dt);

        /* paddlers */
        for (var i = 0; i < paddlers.length; i++) updatePaddler(paddlers[i], dt);

        /* jetskis */
        for (var i = jetskis.length - 1; i >= 0; i--) {
            updateJetSki(jetskis[i], dt);
            if (!jetskis[i].alive) jetskis.splice(i, 1);
        }
        jetskiSpawnTimer += dt;
        if (jetskiSpawnTimer > br(10, 25) && jetskis.length < MAX_JETSKIS) {
            jetskis.push(createJetSki());
            jetskiSpawnTimer = 0;
        }

        /* fishermen */
        for (var i = 0; i < fishermen.length; i++) updateFisherman(fishermen[i], dt);

        /* beach volleyball */
        for (var i = 0; i < bplayers.length; i++) updateBPlayer(bplayers[i], dt);

        /* volunteers */
        for (var i = 0; i < volunteers.length; i++) updateVolunteer(volunteers[i], dt);

        /* criminals */
        for (var i = criminals.length - 1; i >= 0; i--) {
            updateCriminal(criminals[i], dt);
            if (!criminals[i].alive) criminals.splice(i, 1);
        }
        criminalSpawnTimer -= dt;
        if (criminalSpawnTimer <= 0 && criminals.length < MAX_CRIMINALS) {
            criminals.push(createCriminal());
            criminalSpawnTimer = br(25, 60);
        }

        /* police */
        for (var i = policeFoot.length - 1; i >= 0; i--) {
            updatePolice(policeFoot[i], dt);
            if (!policeFoot[i].alive) policeFoot.splice(i, 1);
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

        /* (planes and helicopters removed) */

        /* (war planes removed) */

        /* (spaceships removed) */

        /* (flying cars removed) */


        /* victory banner (behind aliens) */
        drawVictoryBanner(dynC);

        /* alien defender drones */
        for (var i = 0; i < aliens.length; i++) drawAlien(dynC, aliens[i]);
        /* missiles */
        for (var i = 0; i < missiles.length; i++) drawMissile(dynC, missiles[i]);
        drawMissileExplosions(dynC);

        /* nuclear missiles & explosions */
        for (var i = 0; i < nukes.length; i++) drawNuke(dynC, nukes[i]);
        drawNukeExplosions(dynC);
        drawAlienDebris(dynC);

        /* asteroids */
        for (var i = 0; i < asteroids.length; i++) drawAsteroid(dynC, asteroids[i]);
        drawAsteroidImpacts(dynC);

        /* crumble debris */
        drawCrumbleDebris(dynC);

        /* flocks */
        for (var i = 0; i < flocks.length; i++) drawFlock(dynC, flocks[i]);

        /* seagulls */
        for (var i = 0; i < seagulls.length; i++) drawSeagull(dynC, seagulls[i]);

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

        /* buskers & vendors on sidewalk */
        for (var i = 0; i < buskers.length; i++) drawBusker(dynC, buskers[i]);
        for (var i = 0; i < vendors.length; i++) drawVendor(dynC, vendors[i]);

        /* pigeons */
        for (var i = 0; i < pigeons.length; i++) drawPigeon(dynC, pigeons[i]);

        /* cats */
        for (var i = 0; i < cats.length; i++) drawCat(dynC, cats[i]);

        /* vehicles (on street) */
        for (var i = 0; i < vehicles.length; i++) drawVehicle(dynC, vehicles[i]);

        /* pedestrians (on street) */
        for (var i = 0; i < peds.length; i++) {
            drawPedestrian(dynC, peds[i]);
            if (peds[i].hasUmbrella) drawUmbrella(dynC, peds[i].x, peds[i].y, peds[i].g);
        }

        /* joggers */
        for (var i = 0; i < joggers.length; i++) drawJogger(dynC, joggers[i]);

        /* criminals & police */
        for (var i = 0; i < criminals.length; i++) drawCriminal(dynC, criminals[i]);
        for (var i = 0; i < policeFoot.length; i++) drawPolice(dynC, policeFoot[i]);

        /* volunteers */
        for (var i = 0; i < volunteers.length; i++) drawVolunteer(dynC, volunteers[i]);

        /* trains (foreground, on tracks) */
        for (var i = 0; i < trains.length; i++) drawTrain(dynC, trains[i]);

        /* sunbathers */
        for (var i = 0; i < sunbathers.length; i++) drawSunbather(dynC, sunbathers[i]);

        /* beach volleyball */
        for (var i = 0; i < bplayers.length; i++) drawBPlayer(dynC, bplayers[i]);

        /* fishermen */
        for (var i = 0; i < fishermen.length; i++) drawFisherman(dynC, fishermen[i]);

        /* fish (underwater, subtle) */
        for (var i = 0; i < fish.length; i++) drawFish(dynC, fish[i]);

        /* boats (on water) */
        for (var i = 0; i < boats.length; i++) drawBoat(dynC, boats[i]);

        /* jetskis */
        for (var i = 0; i < jetskis.length; i++) drawJetSki(dynC, jetskis[i]);

        /* swimmers */
        for (var i = 0; i < swimmers.length; i++) drawSwimmer(dynC, swimmers[i]);

        /* surfers */
        for (var i = 0; i < surfers.length; i++) drawSurfer(dynC, surfers[i]);

        /* paddlers */
        for (var i = 0; i < paddlers.length; i++) drawPaddler(dynC, paddlers[i]);

        /* dolphins (jumping from water) */
        for (var i = 0; i < dolphins.length; i++) drawDolphin(dynC, dolphins[i]);

        /* beach people */
        for (var i = 0; i < beachPeople.length; i++) drawBeachPerson(dynC, beachPeople[i]);

        /* ── REBAKE city if needed (throttled) ── */
        if (rebakeCooldown > 0) rebakeCooldown -= dt;
        if (needsCityRebake && rebakeCooldown <= 0) {
            rebakeCity();
            rebakeCooldown = 2;
        }

        /* ── FX LAYER (rain, lightning, flash) ── */
        fxC.clearRect(0, 0, W, H);
        drawRain(fxC);
        drawLightning(fxC);
        if (ATM.flashIntensity > 0) {
            fxC.fillStyle = 'rgba(255,255,255,' + (ATM.flashIntensity * 0.1) + ')';
            fxC.fillRect(0, 0, W, H);
        }

        /* ── COMPOSITE ── */
        var paperG = Math.floor(PAPER_BASE - getDayAlpha() * 20 - ATM.paperDarken);
        ctx.fillStyle = 'rgb(' + paperG + ',' + paperG + ',' + paperG + ')';
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(bgCvs, 0, 0);
        ctx.drawImage(cityCvs, 0, 0);
        ctx.drawImage(dynCvs, 0, 0);
        ctx.drawImage(fxCvs, 0, 0);
        ctx.drawImage(grainCvs, 0, 0);
        drawVignette(ctx);

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
        var cFloors = bri(18, 40), cFlH = bri(8, 13);
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
