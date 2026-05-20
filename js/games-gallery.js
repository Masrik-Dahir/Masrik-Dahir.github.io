// ═══════════════════════════════════════════════════
// GALLERY — Animated preview cards
// ═══════════════════════════════════════════════════
(function() {
    var GAMES = [
        { name: 'Night Racer', tag: 'PLAY', id: 'night-racer', anim: animRacer },
        { name: 'Cosmic Raiders', tag: 'PLAY', id: 'invaders', anim: animInvaders },
        { name: 'Slither', tag: 'PLAY', id: 'snake', anim: animSnake },
        { name: 'Block Stack', tag: 'PLAY', id: 'tetris', anim: animTetris },
        { name: 'Dot Muncher', tag: 'PLAY', id: 'pacman', anim: animPacman },
        { name: 'Brick Buster', tag: 'PLAY', id: 'breakout', anim: animBreakout },
        { name: 'Meteor Field', tag: 'PLAY', id: 'asteroids', anim: animAsteroids },
        { name: 'Paddle Blip', tag: 'PLAY', id: 'pong', anim: animPong },
        { name: 'Road Hopper', tag: 'PLAY', id: 'frogger', anim: animFrogger },
        { name: 'Warhead Watch', tag: 'PLAY', id: 'missile', anim: animMissile },
        { name: 'Flutter Wing', tag: 'PLAY', id: 'flappy', anim: animFlappy },
        { name: 'Sketch Hop', tag: 'PLAY', id: 'doodle', anim: animDoodle },
        { name: 'Wriggler', tag: 'PLAY', id: 'centipede', anim: animCentipede },
        { name: 'Bomb Finder', tag: 'PLAY', id: 'minesweeper', anim: animMinesweeper },
        { name: 'Barrel Ape', tag: 'PLAY', id: 'donkey-kong', anim: animDonkeyKong },
        { name: 'Echo Chirp', tag: 'PLAY', id: 'simon', anim: animSimon },
        { name: 'Link Four', tag: 'PLAY', id: 'connect-four', anim: animConnectFour },
        { name: 'Star Swoop', tag: 'PLAY', id: 'galaga', anim: animGalaga },
        { name: 'X and O', tag: 'PLAY', id: 'tic-tac-toe', anim: animTicTacToe },
        { name: '2048', tag: 'PLAY', id: '2048', anim: animGame2048 },
        { name: 'Moon Lander', tag: 'PLAY', id: 'lunar-lander', anim: animLunarLander },
        { name: 'Blast Buddy', tag: 'PLAY', id: 'bomberman', anim: animBomberman },
        { name: 'Star Squad', tag: 'PLAY', id: 'galaxian', anim: animGalaxian },
        { name: 'Sky Guardian', tag: 'PLAY', id: 'defender', anim: animDefender },
        { name: 'Air Ace 42', tag: 'PLAY', id: '1942', anim: anim1942 },
        { name: 'Crate Pusher', tag: 'PLAY', id: 'sokoban', anim: animSokoban },
        { name: 'Vortex', tag: 'PLAY', id: 'tempest', anim: animTempest },
        { name: 'Cube Hopper', tag: 'PLAY', id: 'qbert', anim: animQbert },
        { name: 'Agent Chase', tag: 'PLAY', id: 'spy-hunter', anim: animSpyHunter },
        { name: 'News Route', tag: 'PLAY', id: 'paperboy', anim: animPaperboy },
        { name: 'Paddle Bricks', tag: 'PLAY', id: 'arkanoid', anim: animArkanoid },
        { name: 'Tunnel Dig', tag: 'PLAY', id: 'dig-dug', anim: animDigDug },
        { name: 'Bubble Burst', tag: 'PLAY', id: 'bubble-bobble', anim: animBubbleBobble },
        { name: 'Sky Lance', tag: 'PLAY', id: 'joust', anim: animJoust },
        { name: 'Patty Stack', tag: 'PLAY', id: 'burger-time', anim: animBurgerTime },
        { name: 'Peak Climber', tag: 'PLAY', id: 'ice-climber', anim: animIceClimber },
        { name: 'Lift Mission', tag: 'PLAY', id: 'elevator-action', anim: animElevatorAction },
        { name: 'Turbo Bike', tag: 'PLAY', id: 'excitebike', anim: animExcitebike },
        { name: 'Fist Master', tag: 'PLAY', id: 'kung-fu-master', anim: animKungFuMaster },
        { name: 'Twin Dragon', tag: 'PLAY', id: 'double-dragon', anim: animDoubleDragon },
        { name: 'Ice Penguin', tag: 'PLAY', id: 'pengo', anim: animPengo },
        { name: 'Maze Racer', tag: 'PLAY', id: 'rally-x', anim: animRallyX },
        { name: 'Chrono Ace', tag: 'PLAY', id: 'time-pilot', anim: animTimePilot },
        { name: 'Firebird', tag: 'PLAY', id: 'phoenix', anim: animPhoenix },
        { name: 'Lunar Patrol', tag: 'PLAY', id: 'moon-patrol', anim: animMoonPatrol },
        { name: 'Cavern Flight', tag: 'PLAY', id: 'scramble', anim: animScramble },
        { name: 'Bot-Tron 2099', tag: 'PLAY', id: 'robotron', anim: animRobotron },
        { name: 'Crypt Crawl', tag: 'PLAY', id: 'gauntlet', anim: animGauntlet },
        { name: 'Graveyard Knight', tag: 'PLAY', id: 'ghosts-n-goblins', anim: animGhostsNGoblins },
        { name: 'Metal Hero', tag: 'PLAY', id: 'mega-man', anim: animMegaMan },
        { name: 'Plumber Bros', tag: 'PLAY', id: 'mario-bros', anim: animMarioBros },
        { name: 'Balloon Brawl', tag: 'PLAY', id: 'balloon-fight', anim: animBalloonFight },
        { name: 'Gold Runner', tag: 'PLAY', id: 'lode-runner', anim: animLodeRunner },
        { name: 'Jungle Leap', tag: 'PLAY', id: 'pitfall', anim: animPitfall },
        { name: 'Delta Strike', tag: 'PLAY', id: 'river-raid', anim: animRiverRaid },
        { name: 'Bucket Catch', tag: 'PLAY', id: 'kaboom', anim: animKaboom },
        { name: 'Robo Maze', tag: 'PLAY', id: 'berzerk', anim: animBerzerk },
        { name: 'Maze Wizard', tag: 'PLAY', id: 'wizard-of-wor', anim: animWizardOfWor },
        { name: 'Strike Team', tag: 'PLAY', id: 'commando', anim: animCommando },
        { name: 'Xeros Strike', tag: 'PLAY', id: 'xevious', anim: animXevious },
        { name: 'Star Legion', tag: 'PLAY', id: 'star-force', anim: animStarForce },
        { name: 'Knockout!!', tag: 'PLAY', id: 'punch-out', anim: animPunchOut },
        { name: 'Marble Maze', tag: 'PLAY', id: 'marble-madness', anim: animMarbleMadness },
        { name: 'Zone Trap', tag: 'PLAY', id: 'qix', anim: animQix },
        { name: 'Bubble Pop', tag: 'PLAY', id: 'puzzle-bobble', anim: animPuzzleBobble },
        { name: 'Column Stack', tag: 'PLAY', id: 'columns', anim: animColumns },
        { name: 'Virus Buster', tag: 'PLAY', id: 'dr-mario', anim: animDrMario },
        { name: 'Pipe Flow', tag: 'PLAY', id: 'pipe-dream', anim: animPipeDream },
        { name: 'Light Grid', tag: 'PLAY', id: 'lights-out', anim: animLightsOut },
        { name: 'Tile Track', tag: 'PLAY', id: 'klax', anim: animKlax },
        { name: 'Blob Drop', tag: 'PLAY', id: 'puyo-puyo', anim: animPuyoPuyo },
        { name: 'Reversi', tag: 'PLAY', id: 'reversi', anim: animReversi },
        { name: 'Checkers', tag: 'PLAY', id: 'checkers', anim: animCheckers },
        { name: 'Memory Match', tag: 'PLAY', id: 'memory-match', anim: animMemoryMatch },
        { name: 'Sudoku', tag: 'PLAY', id: 'sudoku', anim: animSudoku },
        { name: 'Codebreaker', tag: 'PLAY', id: 'mastermind', anim: animMastermind },
        { name: 'Word Save', tag: 'PLAY', id: 'hangman', anim: animHangman },
        { name: 'Navy Hunt', tag: 'PLAY', id: 'battleship', anim: animBattleship },
        { name: 'Desert Dash', tag: 'PLAY', id: 'chrome-dino', anim: animChromeDino },
        { name: 'Helicopter', tag: 'PLAY', id: 'helicopter', anim: animHelicopter },
        { name: 'Traffic Hop', tag: 'PLAY', id: 'crossy-road', anim: animCrossyRoad },
        { name: 'Bonk-a-Mole', tag: 'PLAY', id: 'whack-a-mole', anim: animWhackAMole },
        { name: 'Fruit Slicer', tag: 'PLAY', id: 'fruit-ninja', anim: animFruitNinja },
        { name: 'Bar Tapper', tag: 'PLAY', id: 'tapper', anim: animTapper },
        { name: 'Quest', tag: 'PLAY', id: 'adventure', anim: animAdventure },
        { name: 'Tower Guard', tag: 'PLAY', id: 'tower-defense', anim: animTowerDefense },
        { name: 'Gradient', tag: 'PLAY', id: 'gradius', anim: animGradius },
        { name: 'R-Wing', tag: 'PLAY', id: 'r-type', anim: animRType },
        { name: 'Demo Crew', tag: 'PLAY', id: 'wrecking-crew', anim: animWreckingCrew },
        { name: 'Duck Shoot', tag: 'PLAY', id: 'duck-hunt', anim: animDuckHunt },
        { name: 'Tank', tag: 'PLAY', id: 'tank', anim: animTank },
        { name: 'Cruise Lane', tag: 'PLAY', id: 'outrun', anim: animOutrun },
        { name: 'Pole Lap', tag: 'PLAY', id: 'pole-position', anim: animPolePosition },
        { name: 'Track Star', tag: 'PLAY', id: 'track-field', anim: animTrackField },
        { name: 'Solitaire', tag: 'PLAY', id: 'solitaire', anim: animSolitaire },
        { name: 'Nonogram', tag: 'PLAY', id: 'nonogram', anim: animNonogram },
        { name: 'Isoflight', tag: 'PLAY', id: 'zaxxon', anim: animZaxxon },
        { name: 'Jungle Trek', tag: 'PLAY', id: 'jungle-hunt', anim: animJungleHunt },
        { name: 'Barrel Ape Jr', tag: 'PLAY', id: 'donkey-kong-jr', anim: animDonkeyKongJr },
        { name: 'Mr. Dig!', tag: 'PLAY', id: 'mr-do', anim: animMrDo }
    ];

    var grid = document.getElementById('game-grid');
    var cardCanvases = [];
    var cardAnimIds = [];

    // Build cards
    for (var i = 0; i < GAMES.length; i++) {
        var g = GAMES[i];
        var card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-game', g.id);
        var tagClass = g.tag === 'PLAY' ? 'game-card-tag' : 'game-card-tag coming';
        card.innerHTML =
            '<canvas id="preview-' + g.id + '" width="400" height="240"></canvas>' +
            '<div class="game-card-play"></div>' +
            '<div class="game-card-info">' +
            '<span class="game-card-name">' + g.name + '</span>' +
            '<span class="' + tagClass + '">' + g.tag + '</span>' +
            '</div>';
        if (g.tag === 'PLAY') {
            (function(gameId) {
                card.addEventListener('click', function() { launchGame(gameId); });
            })(g.id);
        }
        grid.appendChild(card);
    }

    // Start preview animations
    function startPreviews() {
        for (var i = 0; i < GAMES.length; i++) {
            var cvs = document.getElementById('preview-' + GAMES[i].id);
            if (cvs) {
                var cctx = cvs.getContext('2d');
                GAMES[i].anim(cvs, cctx, i);
            }
        }
    }

    // ── Preview animation: Night Racer ──
    function animRacer(cvs, cx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var speedLines = [];
        for (var i = 0; i < 20; i++) speedLines.push({ x: Math.random() * w, y: Math.random() * h, len: 5 + Math.random() * 15, sp: 2 + Math.random() * 4 });
        var sparks = [];
        function draw() {
            t += 0.03;
            // Sky with aurora gradient
            var sky = cx.createLinearGradient(0, 0, 0, h * 0.52);
            sky.addColorStop(0, '#020015');
            sky.addColorStop(0.3, '#0a0a3e');
            sky.addColorStop(0.55, '#1a0a4e');
            sky.addColorStop(0.8, '#150835');
            sky.addColorStop(1, '#0a1a2e');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, h * 0.52);
            // Aurora bands
            cx.globalAlpha = 0.08 + 0.04 * Math.sin(t * 0.5);
            var aur = cx.createLinearGradient(0, h * 0.05, 0, h * 0.35);
            aur.addColorStop(0, '#00ff88'); aur.addColorStop(0.5, '#00aaff'); aur.addColorStop(1, '#8800ff');
            cx.fillStyle = aur;
            cx.beginPath(); cx.moveTo(0, h * 0.1);
            for (var ax = 0; ax <= w; ax += 10) cx.lineTo(ax, h * 0.15 + Math.sin(ax * 0.02 + t * 0.7) * 15 + Math.sin(ax * 0.05 + t) * 8);
            cx.lineTo(w, h * 0.35); cx.lineTo(0, h * 0.35); cx.closePath(); cx.fill();
            cx.globalAlpha = 1;
            // Stars with twinkle
            for (var s = 0; s < 25; s++) {
                var sx = (s * 97 + 13) % w, sy = (s * 53 + 7) % (h * 0.4);
                var bright = 0.3 + 0.5 * Math.sin(t * 2.5 + s * 1.7);
                cx.fillStyle = 'rgba(255,255,255,' + bright + ')';
                cx.beginPath(); cx.arc(sx, sy, 0.6 + bright * 0.8, 0, Math.PI * 2); cx.fill();
            }
            // Moon with glow
            cx.shadowColor = '#f5f5aa'; cx.shadowBlur = 20;
            cx.fillStyle = '#f5f5dc'; cx.beginPath(); cx.arc(w * 0.82, h * 0.13, 13, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = 'rgba(245,245,200,0.15)'; cx.beginPath(); cx.arc(w * 0.82, h * 0.13, 22, 0, Math.PI * 2); cx.fill();
            // Mountains with layered depth
            var mtn2 = cx.createLinearGradient(0, h * 0.3, 0, h * 0.5);
            mtn2.addColorStop(0, '#0d0d28'); mtn2.addColorStop(1, '#151540');
            cx.fillStyle = mtn2; cx.beginPath(); cx.moveTo(0, h * 0.5);
            for (var mx = 0; mx <= w; mx += 15) cx.lineTo(mx, h * 0.38 - Math.sin(mx * 0.015 + 1) * 20 - Math.cos(mx * 0.008) * 25);
            cx.lineTo(w, h * 0.5); cx.closePath(); cx.fill();
            cx.fillStyle = '#1a1a3a'; cx.beginPath(); cx.moveTo(0, h * 0.5);
            for (var mx = 0; mx <= w; mx += 12) cx.lineTo(mx, h * 0.42 - Math.sin(mx * 0.02) * 12 - Math.cos(mx * 0.012) * 18);
            cx.lineTo(w, h * 0.5); cx.closePath(); cx.fill();
            // Grass gradient
            var grass = cx.createLinearGradient(0, h * 0.48, 0, h);
            grass.addColorStop(0, '#0d6b0d'); grass.addColorStop(0.4, '#0a550a'); grass.addColorStop(1, '#063506');
            cx.fillStyle = grass; cx.fillRect(0, h * 0.48, w, h * 0.52);
            // Road with gradient
            var roadL = w * 0.3 + Math.sin(t) * 20, roadR = w * 0.7 + Math.sin(t) * 20;
            var roadGrad = cx.createLinearGradient(0, h * 0.48, 0, h);
            roadGrad.addColorStop(0, '#4a4a4a'); roadGrad.addColorStop(0.5, '#555'); roadGrad.addColorStop(1, '#636363');
            cx.fillStyle = roadGrad;
            cx.beginPath(); cx.moveTo(roadL, h * 0.48); cx.lineTo(roadR, h * 0.48);
            cx.lineTo(w * 0.82, h); cx.lineTo(w * 0.18, h); cx.closePath(); cx.fill();
            // Road reflections (wet look)
            cx.globalAlpha = 0.04 + 0.02 * Math.sin(t * 3);
            cx.fillStyle = '#aaccff';
            for (var ry = h * 0.55; ry < h; ry += 8) {
                var rw = (ry - h * 0.48) / (h * 0.52) * w * 0.5;
                cx.fillRect(w * 0.5 - rw * 0.4, ry, rw * 0.8, 2);
            }
            cx.globalAlpha = 1;
            // Lane dashes
            cx.strokeStyle = '#ddd'; cx.lineWidth = 1.8; cx.setLineDash([7, 12]);
            cx.lineDashOffset = -t * 90;
            cx.beginPath(); cx.moveTo(w * 0.5, h * 0.5); cx.lineTo(w * 0.5, h); cx.stroke();
            cx.setLineDash([]);
            // Rumble strips with glow
            var seg = Math.floor(t * 5) % 2;
            cx.fillStyle = seg ? '#ff2222' : '#fff';
            cx.shadowColor = seg ? '#ff2222' : '#ffffff'; cx.shadowBlur = 4;
            cx.fillRect(w * 0.16, h * 0.85, w * 0.04, h * 0.15);
            cx.fillRect(w * 0.80, h * 0.85, w * 0.04, h * 0.15);
            cx.shadowBlur = 0;
            // Speed lines
            cx.strokeStyle = 'rgba(255,255,255,0.12)'; cx.lineWidth = 1;
            for (var sl = 0; sl < speedLines.length; sl++) {
                var ln = speedLines[sl];
                ln.y += ln.sp; if (ln.y > h) { ln.y = h * 0.48; ln.x = w * 0.2 + Math.random() * w * 0.6; }
                cx.beginPath(); cx.moveTo(ln.x, ln.y); cx.lineTo(ln.x, ln.y + ln.len); cx.stroke();
            }
            // Player car body
            var carGrad = cx.createLinearGradient(w * 0.44, h * 0.78, w * 0.56, h * 0.78);
            carGrad.addColorStop(0, '#cc0000'); carGrad.addColorStop(0.5, '#ff2222'); carGrad.addColorStop(1, '#cc0000');
            cx.fillStyle = carGrad;
            cx.beginPath();
            cx.moveTo(w * 0.43, h * 0.98); cx.lineTo(w * 0.455, h * 0.81);
            cx.quadraticCurveTo(w * 0.5, h * 0.77, w * 0.545, h * 0.81);
            cx.lineTo(w * 0.57, h * 0.98); cx.closePath(); cx.fill();
            // Car shadow/underside
            cx.fillStyle = 'rgba(0,0,0,0.3)';
            cx.fillRect(w * 0.44, h * 0.95, w * 0.12, h * 0.03);
            // Windshield with reflection
            var windGrad = cx.createLinearGradient(w * 0.47, h * 0.84, w * 0.53, h * 0.88);
            windGrad.addColorStop(0, 'rgba(100,200,255,0.8)'); windGrad.addColorStop(1, 'rgba(60,120,200,0.5)');
            cx.fillStyle = windGrad;
            cx.beginPath(); cx.moveTo(w * 0.47, h * 0.89);
            cx.quadraticCurveTo(w * 0.5, h * 0.84, w * 0.53, h * 0.89); cx.closePath(); cx.fill();
            // Headlight beams (cones of light)
            cx.save();
            var hlGrad1 = cx.createRadialGradient(w * 0.465, h * 0.82, 2, w * 0.465, h * 0.82, 80);
            hlGrad1.addColorStop(0, 'rgba(255,255,200,0.25)'); hlGrad1.addColorStop(1, 'rgba(255,255,200,0)');
            cx.fillStyle = hlGrad1;
            cx.beginPath(); cx.moveTo(w * 0.465, h * 0.82); cx.lineTo(w * 0.40, h * 0.55); cx.lineTo(w * 0.49, h * 0.55); cx.closePath(); cx.fill();
            var hlGrad2 = cx.createRadialGradient(w * 0.535, h * 0.82, 2, w * 0.535, h * 0.82, 80);
            hlGrad2.addColorStop(0, 'rgba(255,255,200,0.25)'); hlGrad2.addColorStop(1, 'rgba(255,255,200,0)');
            cx.fillStyle = hlGrad2;
            cx.beginPath(); cx.moveTo(w * 0.535, h * 0.82); cx.lineTo(w * 0.51, h * 0.55); cx.lineTo(w * 0.60, h * 0.55); cx.closePath(); cx.fill();
            cx.restore();
            // Headlight dots with glow
            cx.shadowColor = '#ffffaa'; cx.shadowBlur = 12;
            cx.fillStyle = '#ffffcc';
            cx.beginPath(); cx.arc(w * 0.465, h * 0.82, 3, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(w * 0.535, h * 0.82, 3, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Taillights with glow
            cx.shadowColor = '#ff0000'; cx.shadowBlur = 10;
            cx.fillStyle = '#ff3333';
            cx.beginPath(); cx.arc(w * 0.445, h * 0.97, 2.5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(w * 0.555, h * 0.97, 2.5, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Traffic car with detail
            var tcY = (h * 0.5) + ((t * 60) % (h * 0.35));
            var tcScale = 0.4 + (tcY - h * 0.5) / (h * 0.5) * 0.6;
            var tcX = w * 0.57;
            var tcGrad = cx.createLinearGradient(tcX - 10 * tcScale, tcY, tcX + 10 * tcScale, tcY);
            tcGrad.addColorStop(0, '#2222cc'); tcGrad.addColorStop(0.5, '#4444ff'); tcGrad.addColorStop(1, '#2222cc');
            cx.fillStyle = tcGrad;
            cx.fillRect(tcX - 10 * tcScale, tcY - 14 * tcScale, 20 * tcScale, 18 * tcScale);
            // Traffic car taillights
            cx.shadowColor = '#ff4444'; cx.shadowBlur = 6;
            cx.fillStyle = '#ff4444';
            cx.fillRect(tcX - 9 * tcScale, tcY + 2 * tcScale, 3 * tcScale, 2 * tcScale);
            cx.fillRect(tcX + 6 * tcScale, tcY + 2 * tcScale, 3 * tcScale, 2 * tcScale);
            cx.shadowBlur = 0;
            // Vignette overlay
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.35)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[0] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Space Invaders ──
    function animInvaders(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var invaders = [];
        for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) invaders.push({ x: c * 40 + 40, y: r * 30 + 30, alive: true, blinkT: Math.random() * 6 });
        var bullets = [], particles = [];
        function draw() {
            t += 0.02;
            // Nebula background
            var nebula = cx.createRadialGradient(w * 0.3, h * 0.3, 10, w * 0.5, h * 0.5, w * 0.7);
            nebula.addColorStop(0, '#120828'); nebula.addColorStop(0.4, '#0a0420'); nebula.addColorStop(0.7, '#06021a'); nebula.addColorStop(1, '#020010');
            cx.fillStyle = nebula; cx.fillRect(0, 0, w, h);
            // Nebula color patches
            cx.globalAlpha = 0.04 + 0.02 * Math.sin(t);
            var neb2 = cx.createRadialGradient(w * 0.7, h * 0.2, 5, w * 0.7, h * 0.2, 80);
            neb2.addColorStop(0, '#ff00aa'); neb2.addColorStop(1, 'transparent');
            cx.fillStyle = neb2; cx.fillRect(0, 0, w, h);
            var neb3 = cx.createRadialGradient(w * 0.2, h * 0.6, 5, w * 0.2, h * 0.6, 60);
            neb3.addColorStop(0, '#00aaff'); neb3.addColorStop(1, 'transparent');
            cx.fillStyle = neb3; cx.fillRect(0, 0, w, h);
            cx.globalAlpha = 1;
            // Stars with varied sizes
            for (var s = 0; s < 30; s++) {
                var sx = (s * 73 + 11) % w, sy = (s * 47 + 3) % h;
                var sa = 0.15 + 0.35 * Math.sin(t * 2.5 + s * 1.3);
                cx.fillStyle = 'rgba(255,255,255,' + sa + ')';
                cx.beginPath(); cx.arc(sx, sy, s % 5 === 0 ? 1.5 : 0.8, 0, Math.PI * 2); cx.fill();
            }
            // Shield barriers at bottom
            cx.fillStyle = 'rgba(0,255,100,0.15)';
            for (var sb = 0; sb < 3; sb++) {
                var sbx = w * 0.2 + sb * w * 0.3;
                cx.beginPath(); cx.moveTo(sbx - 18, h - 40); cx.lineTo(sbx + 18, h - 40);
                cx.lineTo(sbx + 22, h - 28); cx.lineTo(sbx - 22, h - 28); cx.closePath(); cx.fill();
            }
            // Move invaders
            var shiftX = Math.sin(t * 1.5) * 40;
            var rowColors = ['#00ff66','#ffcc00','#ff3366','#00ccff'];
            for (var i = 0; i < invaders.length; i++) {
                var inv = invaders[i]; if (!inv.alive) continue;
                var ix = inv.x + shiftX, iy = inv.y + Math.sin(t * 0.5) * 10;
                var rc = rowColors[Math.floor(inv.y / 30) % 4];
                // Invader glow
                cx.shadowColor = rc; cx.shadowBlur = 8;
                cx.fillStyle = rc;
                // Body
                cx.fillRect(ix - 8, iy - 5, 16, 10);
                // Arms (animate)
                var armUp = Math.sin(t * 4 + i) > 0;
                if (armUp) { cx.fillRect(ix - 12, iy - 5, 4, 4); cx.fillRect(ix + 8, iy - 5, 4, 4); }
                else { cx.fillRect(ix - 12, iy - 1, 4, 4); cx.fillRect(ix + 8, iy - 1, 4, 4); }
                // Legs (animate)
                if (armUp) { cx.fillRect(ix - 6, iy + 5, 4, 3); cx.fillRect(ix + 2, iy + 5, 4, 3); }
                else { cx.fillRect(ix - 8, iy + 5, 4, 3); cx.fillRect(ix + 4, iy + 5, 4, 3); }
                cx.shadowBlur = 0;
                // Eyes that blink
                inv.blinkT -= 0.02;
                var eyeOpen = inv.blinkT > 0.15 || inv.blinkT < 0;
                if (inv.blinkT < 0) inv.blinkT = 3 + Math.random() * 4;
                if (eyeOpen) {
                    cx.fillStyle = '#fff'; cx.fillRect(ix - 5, iy - 4, 4, 4); cx.fillRect(ix + 1, iy - 4, 4, 4);
                    cx.fillStyle = '#000'; cx.fillRect(ix - 4, iy - 3, 2, 2); cx.fillRect(ix + 2, iy - 3, 2, 2);
                } else {
                    cx.fillStyle = '#000'; cx.fillRect(ix - 5, iy - 2, 4, 1); cx.fillRect(ix + 1, iy - 2, 4, 1);
                }
            }
            // Auto-fire
            if (Math.random() < 0.04) bullets.push({ x: w / 2 + Math.sin(t) * 30, y: h - 30 });
            // Bullets with glow trail
            for (var b = bullets.length - 1; b >= 0; b--) {
                bullets[b].y -= 4;
                // Trail
                cx.fillStyle = 'rgba(0,255,100,0.15)';
                cx.fillRect(bullets[b].x - 2, bullets[b].y + 4, 4, 12);
                cx.fillStyle = 'rgba(0,255,100,0.07)';
                cx.fillRect(bullets[b].x - 3, bullets[b].y + 10, 6, 14);
                // Bullet core with glow
                cx.shadowColor = '#00ff66'; cx.shadowBlur = 10;
                cx.fillStyle = '#aaffcc';
                cx.fillRect(bullets[b].x - 1.5, bullets[b].y, 3, 8);
                cx.shadowBlur = 0;
                if (bullets[b].y < 0) {
                    // Spawn particles on exit
                    for (var pp = 0; pp < 3; pp++) particles.push({ x: bullets[b].x, y: 5, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2, life: 1, c: '#00ff66' });
                    bullets.splice(b, 1);
                }
            }
            // Particles
            for (var p = particles.length - 1; p >= 0; p--) {
                var pt = particles[p];
                pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03;
                cx.globalAlpha = pt.life;
                cx.fillStyle = pt.c;
                cx.beginPath(); cx.arc(pt.x, pt.y, 2 * pt.life, 0, Math.PI * 2); cx.fill();
                cx.globalAlpha = 1;
                if (pt.life <= 0) particles.splice(p, 1);
            }
            // Player ship with detail
            var px = w / 2 + Math.sin(t * 1.2) * 60;
            cx.shadowColor = '#00ff66'; cx.shadowBlur = 8;
            var plGrad = cx.createLinearGradient(px - 15, h - 25, px + 15, h - 25);
            plGrad.addColorStop(0, '#008833'); plGrad.addColorStop(0.5, '#00ff66'); plGrad.addColorStop(1, '#008833');
            cx.fillStyle = plGrad;
            cx.fillRect(px - 15, h - 25, 30, 10);
            cx.fillStyle = '#00ff88'; cx.fillRect(px - 3, h - 32, 6, 8);
            // Cannon tip glow
            cx.fillStyle = '#aaffcc'; cx.fillRect(px - 1, h - 34, 2, 3);
            cx.shadowBlur = 0;
            // Vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, w * 0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Snake ──
    function animSnake(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, cs = 12, t = 0;
        var snake = []; for (var i = 0; i < 12; i++) snake.push({ x: 10 - i, y: 8 });
        var food = { x: 18, y: 8 }, dir = { x: 1, y: 0 }, timer = 0;
        var sparkles = [], foodPulse = 0;
        function draw() {
            t += 0.016; timer += 0.016; foodPulse += 0.06;
            // Dark gradient background
            var bg = cx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.6);
            bg.addColorStop(0, '#0c1225'); bg.addColorStop(1, '#050810');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // Grid with subtle glow
            cx.strokeStyle = 'rgba(0,255,100,0.025)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx <= w; gx += cs) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy <= h; gy += cs) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(w, gy); cx.stroke(); }
            // Grid intersection dots
            cx.fillStyle = 'rgba(0,255,100,0.06)';
            for (var gx = 0; gx < w; gx += cs) for (var gy = 0; gy < h; gy += cs) {
                cx.beginPath(); cx.arc(gx, gy, 0.8, 0, Math.PI * 2); cx.fill();
            }
            if (timer > 0.1) {
                timer = 0;
                var head = snake[0];
                if (head.x < food.x && dir.x !== -1) { dir = { x: 1, y: 0 }; }
                else if (head.x > food.x && dir.x !== 1) { dir = { x: -1, y: 0 }; }
                else if (head.y < food.y && dir.y !== -1) { dir = { x: 0, y: 1 }; }
                else if (head.y > food.y && dir.y !== 1) { dir = { x: 0, y: -1 }; }
                var nh = { x: head.x + dir.x, y: head.y + dir.y };
                if (nh.x < 0) nh.x = Math.floor(w / cs) - 1;
                if (nh.x >= Math.floor(w / cs)) nh.x = 0;
                if (nh.y < 0) nh.y = Math.floor(h / cs) - 1;
                if (nh.y >= Math.floor(h / cs)) nh.y = 0;
                snake.unshift(nh);
                if (nh.x === food.x && nh.y === food.y) {
                    // Spawn sparkles on eat
                    for (var sp = 0; sp < 8; sp++) sparkles.push({ x: food.x * cs + cs / 2, y: food.y * cs + cs / 2, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1 });
                    food = { x: Math.floor(Math.random() * (w / cs)), y: Math.floor(Math.random() * (h / cs)) };
                } else { snake.pop(); }
            }
            // Draw snake body with gradient segments
            for (var s = snake.length - 1; s >= 0; s--) {
                var pct = s / snake.length;
                var r = Math.floor(0 + pct * 0), g = Math.floor(255 - pct * 150), b = Math.floor(100 + pct * 50);
                var alpha = 1 - pct * 0.5;
                var sx = snake[s].x * cs, sy = snake[s].y * cs;
                // Segment shadow
                cx.fillStyle = 'rgba(0,200,80,0.08)';
                cx.fillRect(sx + 2, sy + 2, cs - 2, cs - 2);
                // Segment gradient
                var sg = cx.createLinearGradient(sx, sy, sx + cs, sy + cs);
                sg.addColorStop(0, 'rgba(' + (r + 40) + ',' + Math.min(255, g + 40) + ',' + (b + 20) + ',' + alpha + ')');
                sg.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')');
                cx.fillStyle = sg;
                // Rounded segment
                var rad = (cs - 2) * 0.3;
                cx.beginPath();
                cx.moveTo(sx + 1 + rad, sy + 1);
                cx.lineTo(sx + cs - 1 - rad, sy + 1);
                cx.quadraticCurveTo(sx + cs - 1, sy + 1, sx + cs - 1, sy + 1 + rad);
                cx.lineTo(sx + cs - 1, sy + cs - 1 - rad);
                cx.quadraticCurveTo(sx + cs - 1, sy + cs - 1, sx + cs - 1 - rad, sy + cs - 1);
                cx.lineTo(sx + 1 + rad, sy + cs - 1);
                cx.quadraticCurveTo(sx + 1, sy + cs - 1, sx + 1, sy + cs - 1 - rad);
                cx.lineTo(sx + 1, sy + 1 + rad);
                cx.quadraticCurveTo(sx + 1, sy + 1, sx + 1 + rad, sy + 1);
                cx.closePath(); cx.fill();
                // Highlight on each segment
                cx.fillStyle = 'rgba(255,255,255,' + (0.15 - pct * 0.1) + ')';
                cx.fillRect(sx + 2, sy + 1, cs - 4, 2);
            }
            // Snake head extras: eyes
            if (snake.length > 0) {
                var hx = snake[0].x * cs, hy = snake[0].y * cs;
                cx.shadowColor = '#00ff66'; cx.shadowBlur = 6;
                cx.fillStyle = '#00ff88';
                cx.beginPath();
                var hrad = (cs - 2) * 0.3;
                cx.moveTo(hx + 1 + hrad, hy + 1);
                cx.lineTo(hx + cs - 1 - hrad, hy + 1);
                cx.quadraticCurveTo(hx + cs - 1, hy + 1, hx + cs - 1, hy + 1 + hrad);
                cx.lineTo(hx + cs - 1, hy + cs - 1 - hrad);
                cx.quadraticCurveTo(hx + cs - 1, hy + cs - 1, hx + cs - 1 - hrad, hy + cs - 1);
                cx.lineTo(hx + 1 + hrad, hy + cs - 1);
                cx.quadraticCurveTo(hx + 1, hy + cs - 1, hx + 1, hy + cs - 1 - hrad);
                cx.lineTo(hx + 1, hy + 1 + hrad);
                cx.quadraticCurveTo(hx + 1, hy + 1, hx + 1 + hrad, hy + 1);
                cx.closePath(); cx.fill();
                cx.shadowBlur = 0;
                // Eyes based on direction
                var ex1 = hx + cs * 0.3, ey1 = hy + cs * 0.3;
                var ex2 = hx + cs * 0.7, ey2 = hy + cs * 0.3;
                if (dir.y !== 0) { ex1 = hx + cs * 0.25; ex2 = hx + cs * 0.75; ey1 = ey2 = hy + cs * 0.5; }
                cx.fillStyle = '#fff';
                cx.beginPath(); cx.arc(ex1, ey1, 2.5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(ex2, ey2, 2.5, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#111';
                cx.beginPath(); cx.arc(ex1 + dir.x * 0.8, ey1 + dir.y * 0.8, 1.3, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(ex2 + dir.x * 0.8, ey2 + dir.y * 0.8, 1.3, 0, Math.PI * 2); cx.fill();
            }
            // Food with pulsing glow and sparkles
            var fpx = food.x * cs + cs / 2, fpy = food.y * cs + cs / 2;
            var pulse = 0.7 + 0.3 * Math.sin(foodPulse);
            // Outer glow
            cx.shadowColor = '#ff3355'; cx.shadowBlur = 15 * pulse;
            cx.fillStyle = 'rgba(255,50,80,' + (0.15 * pulse) + ')';
            cx.beginPath(); cx.arc(fpx, fpy, cs * 0.7 * pulse, 0, Math.PI * 2); cx.fill();
            // Food body
            var foodGrad = cx.createRadialGradient(fpx - 1, fpy - 1, 1, fpx, fpy, cs * 0.35);
            foodGrad.addColorStop(0, '#ff6688'); foodGrad.addColorStop(1, '#cc1133');
            cx.fillStyle = foodGrad;
            cx.beginPath(); cx.arc(fpx, fpy, cs * 0.32 * (0.9 + 0.1 * Math.sin(foodPulse * 2)), 0, Math.PI * 2); cx.fill();
            // Food highlight
            cx.fillStyle = 'rgba(255,255,255,0.4)';
            cx.beginPath(); cx.arc(fpx - 1, fpy - 2, 1.5, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Sparkle particles
            for (var sp = sparkles.length - 1; sp >= 0; sp--) {
                var pk = sparkles[sp];
                pk.x += pk.vx; pk.y += pk.vy; pk.life -= 0.025;
                cx.globalAlpha = pk.life;
                cx.fillStyle = '#ffcc44';
                cx.beginPath(); cx.arc(pk.x, pk.y, 2 * pk.life, 0, Math.PI * 2); cx.fill();
                cx.globalAlpha = 1;
                if (pk.life <= 0) sparkles.splice(sp, 1);
            }
            // Vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.3)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tetris ──
    function animTetris(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, cs = 14, t = 0;
        var cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var grid = [], colors = ['#0097dc','#d4c800','#8b00ab','#0033b4','#e88a0c','#00a84f','#e00e2c'];
        for (var y = 0; y < rows; y++) { grid[y] = []; for (var x = 0; x < cols; x++) grid[y][x] = 0; }
        for (var y2 = Math.floor(rows * 0.6); y2 < rows; y2++) for (var x2 = 0; x2 < cols; x2++) {
            if (Math.random() < 0.65) grid[y2][x2] = colors[Math.floor(Math.random() * colors.length)];
        }
        var piece = { x: Math.floor(cols / 2) - 1, y: 0, c: colors[0], s: [[1,1],[1,1]] }, timer = 0;
        var flashRow = -1, flashTimer = 0;
        function draw() {
            t += 0.016; timer += 0.016;
            // Gradient background
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(0.5, '#080820'); bg.addColorStop(1, '#0c0c30');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            if (timer > 0.3) {
                timer = 0; piece.y++;
                if (piece.y > rows - 2) {
                    piece.y = 0; piece.x = Math.floor(Math.random() * (cols - 2));
                    piece.c = colors[Math.floor(Math.random() * colors.length)];
                    // Trigger line clear flash on random filled row
                    flashRow = Math.floor(rows * 0.7 + Math.random() * rows * 0.25);
                    flashTimer = 0.5;
                }
            }
            // Line clear flash effect
            if (flashTimer > 0) {
                flashTimer -= 0.016;
                cx.globalAlpha = flashTimer * 2;
                cx.fillStyle = '#ffffff';
                cx.fillRect(0, flashRow * cs, w, cs);
                cx.globalAlpha = 1;
            }
            // Grid blocks with 3D effect
            for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
                if (grid[y][x]) {
                    var bx = x * cs, by = y * cs, c = grid[y][x];
                    // Main face
                    cx.fillStyle = c; cx.fillRect(bx + 1, by + 1, cs - 2, cs - 2);
                    // Top highlight (lighter)
                    cx.fillStyle = 'rgba(255,255,255,0.25)'; cx.fillRect(bx + 1, by + 1, cs - 2, 3);
                    // Left highlight
                    cx.fillStyle = 'rgba(255,255,255,0.12)'; cx.fillRect(bx + 1, by + 1, 2, cs - 2);
                    // Bottom shadow (darker)
                    cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(bx + 1, by + cs - 4, cs - 2, 3);
                    // Right shadow
                    cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.fillRect(bx + cs - 3, by + 1, 2, cs - 2);
                    // Inner bevel highlight
                    cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fillRect(bx + 3, by + 3, cs - 6, cs - 6);
                }
            }
            // Ghost piece (shadow of where piece lands)
            var ghostY = piece.y;
            while (ghostY < rows - piece.s.length) ghostY++;
            cx.globalAlpha = 0.15;
            cx.fillStyle = piece.c;
            for (var pr = 0; pr < piece.s.length; pr++) for (var pc = 0; pc < piece.s[pr].length; pc++) {
                if (piece.s[pr][pc]) cx.fillRect((piece.x + pc) * cs + 1, (ghostY + pr) * cs + 1, cs - 2, cs - 2);
            }
            cx.globalAlpha = 1;
            // Active piece with 3D + glow
            cx.shadowColor = piece.c; cx.shadowBlur = 8;
            for (var pr = 0; pr < piece.s.length; pr++) for (var pc = 0; pc < piece.s[pr].length; pc++) {
                if (piece.s[pr][pc]) {
                    var bx = (piece.x + pc) * cs, by = (piece.y + pr) * cs;
                    cx.fillStyle = piece.c; cx.fillRect(bx + 1, by + 1, cs - 2, cs - 2);
                    cx.fillStyle = 'rgba(255,255,255,0.35)'; cx.fillRect(bx + 1, by + 1, cs - 2, 3);
                    cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(bx + 1, by + 1, 2, cs - 2);
                    cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(bx + 1, by + cs - 4, cs - 2, 3);
                    cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.fillRect(bx + cs - 3, by + 1, 2, cs - 2);
                }
            }
            cx.shadowBlur = 0;
            // Grid lines
            cx.strokeStyle = 'rgba(255,255,255,0.03)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx <= w; gx += cs) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy <= h; gy += cs) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(w, gy); cx.stroke(); }
            // Side panel glow
            cx.fillStyle = 'rgba(0,100,255,0.03)';
            cx.fillRect(0, 0, 3, h); cx.fillRect(w - 3, 0, 3, h);
            // Vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.3)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pac-Man ──
    function animPacman(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var dots = []; for (var d = 0; d < 20; d++) dots.push({ x: d * 20 + 10, y: h / 2, eaten: false });
        var eatParticles = [], powerPellets = [{ x: 30, y: h / 2 - 50 }, { x: w - 30, y: h / 2 + 50 }];
        var vulnerable = false, vulnTimer = 0;
        function draw() {
            t += 0.04;
            // Dark blue background
            var bg = cx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.6);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(1, '#050515');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // Maze walls with gradient and glow
            cx.shadowColor = '#3344cc'; cx.shadowBlur = 8;
            cx.strokeStyle = '#2244bb'; cx.lineWidth = 3;
            cx.strokeRect(10, 10, w - 20, h - 20);
            cx.shadowBlur = 4;
            cx.strokeStyle = '#2244bb';
            cx.strokeRect(60, 50, 80, 40); cx.strokeRect(180, 50, 80, 40);
            cx.strokeRect(300, 50, 80, 40);
            cx.strokeRect(60, h - 90, 80, 40); cx.strokeRect(180, h - 90, 80, 40);
            // Inner wall glow lines
            cx.shadowBlur = 0;
            cx.strokeStyle = 'rgba(80,120,255,0.15)'; cx.lineWidth = 1;
            cx.strokeRect(12, 12, w - 24, h - 24);
            cx.strokeRect(62, 52, 76, 36); cx.strokeRect(182, 52, 76, 36);
            // Dots with gentle glow
            var px = ((t * 40) % (w + 40)) - 20;
            cx.fillStyle = '#ffcc00';
            for (var i = 0; i < dots.length; i++) {
                var dx = dots[i].x, dy = dots[i].y;
                if (Math.abs(dx - px) < 12) {
                    if (!dots[i].eaten) {
                        dots[i].eaten = true;
                        for (var ep = 0; ep < 3; ep++) eatParticles.push({ x: dx, y: dy, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1 });
                    }
                    continue;
                }
                // Reset dots that are far ahead
                if (px < dx - w * 0.5) dots[i].eaten = false;
                if (dots[i].eaten) continue;
                cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4;
                cx.beginPath(); cx.arc(dx, dy, 3, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
            }
            // Eat particles
            for (var ep = eatParticles.length - 1; ep >= 0; ep--) {
                var p = eatParticles[ep];
                p.x += p.vx; p.y += p.vy; p.life -= 0.04;
                cx.globalAlpha = p.life; cx.fillStyle = '#ffee66';
                cx.beginPath(); cx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2); cx.fill();
                cx.globalAlpha = 1;
                if (p.life <= 0) eatParticles.splice(ep, 1);
            }
            // Power pellets with pulse
            var ppPulse = 0.6 + 0.4 * Math.sin(t * 5);
            for (var pp = 0; pp < powerPellets.length; pp++) {
                var pellet = powerPellets[pp];
                cx.shadowColor = '#ffcc00'; cx.shadowBlur = 12 * ppPulse;
                cx.fillStyle = 'rgba(255,204,0,' + ppPulse + ')';
                cx.beginPath(); cx.arc(pellet.x, pellet.y, 6 * (0.8 + 0.2 * ppPulse), 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
            }
            // Trigger vulnerability periodically
            if (Math.sin(t * 0.5) > 0.95 && !vulnerable) { vulnerable = true; vulnTimer = 3; }
            if (vulnerable) { vulnTimer -= 0.04; if (vulnTimer <= 0) vulnerable = false; }
            // Pac-Man with gradient
            var mouth = Math.abs(Math.sin(t * 6)) * 0.45;
            cx.shadowColor = '#ffcc00'; cx.shadowBlur = 10;
            var pacGrad = cx.createRadialGradient(px - 2, h / 2 - 2, 2, px, h / 2, 14);
            pacGrad.addColorStop(0, '#ffee44'); pacGrad.addColorStop(1, '#ddaa00');
            cx.fillStyle = pacGrad;
            cx.beginPath(); cx.arc(px, h / 2, 14, mouth, Math.PI * 2 - mouth); cx.lineTo(px, h / 2); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            // Pac-Man eye
            cx.fillStyle = '#111';
            cx.beginPath(); cx.arc(px + 2, h / 2 - 7, 2.5, 0, Math.PI * 2); cx.fill();
            // Ghosts
            var ghostColors = ['#ff0000','#ffb8ff','#00ffff','#ffb852'];
            for (var g = 0; g < 4; g++) {
                var gx = px - 50 - g * 30, gy = h / 2;
                if (gx < -20) gx += w + 60;
                var gc = vulnerable ? '#2222ff' : ghostColors[g];
                // Ghost glow
                cx.shadowColor = gc; cx.shadowBlur = vulnerable ? 4 : 6;
                // Ghost body with gradient
                var gGrad = cx.createLinearGradient(gx - 11, gy - 14, gx + 11, gy + 8);
                if (vulnerable) {
                    var flicker = vulnTimer < 1 && Math.sin(t * 15) > 0;
                    gGrad.addColorStop(0, flicker ? '#ffffff' : '#3333ff');
                    gGrad.addColorStop(1, flicker ? '#cccccc' : '#1111aa');
                } else {
                    gGrad.addColorStop(0, gc); gGrad.addColorStop(1, gc);
                }
                cx.fillStyle = gGrad;
                cx.beginPath(); cx.arc(gx, gy - 3, 11, Math.PI, 0); cx.lineTo(gx + 11, gy + 8);
                for (var wv = 0; wv < 4; wv++) {
                    var waveOff = Math.sin(t * 6 + wv) * 1.5;
                    cx.lineTo(gx + 11 - (wv + 1) * 5.5, gy + (wv % 2 ? 3 + waveOff : 8 + waveOff));
                }
                cx.closePath(); cx.fill();
                cx.shadowBlur = 0;
                // Eyes
                if (vulnerable && !(vulnTimer < 1 && Math.sin(t * 15) > 0)) {
                    cx.fillStyle = '#fff';
                    cx.fillRect(gx - 5, gy - 4, 3, 2); cx.fillRect(gx + 2, gy - 4, 3, 2);
                    cx.fillStyle = '#fff';
                    cx.beginPath(); cx.moveTo(gx - 6, gy + 1); cx.lineTo(gx - 3, gy - 1); cx.lineTo(gx, gy + 1); cx.lineTo(gx + 3, gy - 1); cx.lineTo(gx + 6, gy + 1); cx.stroke();
                } else {
                    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(gx - 4, gy - 5, 4.5, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(gx + 4, gy - 5, 4.5, 0, Math.PI * 2); cx.fill();
                    // Pupils look toward pac-man
                    var lookDir = px > gx ? 1 : -1;
                    cx.fillStyle = '#2222cc'; cx.beginPath(); cx.arc(gx - 4 + lookDir * 1.5, gy - 5, 2.2, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(gx + 4 + lookDir * 1.5, gy - 5, 2.2, 0, Math.PI * 2); cx.fill();
                }
            }
            // Vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,20,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Breakout ──
    function animBreakout(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bx = w / 2, by = h * 0.7, bdx = 2.5, bdy = -2.5;
        var bricks = [], bcols = ['#ff2244','#ff6622','#ffcc00','#22cc44','#2266ff'];
        for (var r = 0; r < 5; r++) for (var c = 0; c < 10; c++) bricks.push({ x: c * 38 + 10, y: r * 16 + 20, w: 34, h: 12, c: bcols[r], alive: true });
        function draw() {
            t += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            // Bricks
            for (var i = 0; i < bricks.length; i++) {
                var b = bricks[i]; if (!b.alive) continue;
                cx.fillStyle = b.c; cx.fillRect(b.x, b.y, b.w, b.h);
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(b.x, b.y, b.w, 3);
            }
            // Ball
            bx += bdx; by += bdy;
            if (bx < 5 || bx > w - 5) bdx *= -1;
            if (by < 5) bdy *= -1;
            if (by > h * 0.88) { bdy = -Math.abs(bdy); }
            cx.fillStyle = '#fff'; cx.shadowColor = '#fff'; cx.shadowBlur = 8;
            cx.beginPath(); cx.arc(bx, by, 5, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Paddle
            var px = w / 2 + Math.sin(t * 2) * 80;
            cx.fillStyle = '#00ccff';
            cx.fillRect(px - 30, h * 0.9, 60, 8);
            cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.fillRect(px - 30, h * 0.9, 60, 2);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Asteroids ──
    function animAsteroids(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var asteroids = [];
        for (var a = 0; a < 8; a++) asteroids.push({ x: Math.random() * w, y: Math.random() * h, r: 10 + Math.random() * 20, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2, rot: Math.random() * Math.PI * 2, sides: 6 + Math.floor(Math.random() * 4) });
        var bullets = [], shipAngle = 0;
        function draw() {
            t += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            // Stars
            cx.fillStyle = 'rgba(255,255,255,0.3)';
            for (var s = 0; s < 15; s++) cx.fillRect((s * 83 + 7) % w, (s * 61 + 13) % h, 1, 1);
            // Ship
            shipAngle = t * 0.8;
            var sx = w / 2 + Math.sin(t * 0.5) * 50, sy = h / 2 + Math.cos(t * 0.7) * 30;
            cx.save(); cx.translate(sx, sy); cx.rotate(shipAngle);
            cx.strokeStyle = '#00ff88'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(12, 0); cx.lineTo(-8, -7); cx.lineTo(-5, 0); cx.lineTo(-8, 7); cx.closePath(); cx.stroke();
            // Thrust
            cx.fillStyle = '#ff6600'; cx.globalAlpha = 0.5 + Math.sin(t * 20) * 0.3;
            cx.beginPath(); cx.moveTo(-5, -3); cx.lineTo(-14, 0); cx.lineTo(-5, 3); cx.closePath(); cx.fill();
            cx.globalAlpha = 1; cx.restore();
            // Asteroids
            cx.strokeStyle = '#aaa'; cx.lineWidth = 1.5;
            for (var i = 0; i < asteroids.length; i++) {
                var a = asteroids[i];
                a.x += a.dx; a.y += a.dy; a.rot += 0.01;
                if (a.x < -30) a.x = w + 30; if (a.x > w + 30) a.x = -30;
                if (a.y < -30) a.y = h + 30; if (a.y > h + 30) a.y = -30;
                cx.save(); cx.translate(a.x, a.y); cx.rotate(a.rot);
                cx.beginPath();
                for (var p = 0; p < a.sides; p++) {
                    var ang = (p / a.sides) * Math.PI * 2, rr = a.r * (0.7 + ((p * 37) % 7) / 20);
                    if (p === 0) cx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
                    else cx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
                }
                cx.closePath(); cx.stroke(); cx.restore();
            }
            // Auto-fire
            if (Math.random() < 0.03) bullets.push({ x: sx + Math.cos(shipAngle) * 12, y: sy + Math.sin(shipAngle) * 12, dx: Math.cos(shipAngle) * 5, dy: Math.sin(shipAngle) * 5 });
            cx.fillStyle = '#00ff88';
            for (var b = bullets.length - 1; b >= 0; b--) {
                bullets[b].x += bullets[b].dx; bullets[b].y += bullets[b].dy;
                cx.fillRect(bullets[b].x - 1, bullets[b].y - 1, 3, 3);
                if (bullets[b].x < 0 || bullets[b].x > w || bullets[b].y < 0 || bullets[b].y > h) bullets.splice(b, 1);
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pong ──
    function animPong(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bx = w / 2, by = h / 2, bdx = 3, bdy = 2;
        var p1y = h / 2, p2y = h / 2;
        function draw() {
            t += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            // Center line
            cx.setLineDash([6, 6]); cx.strokeStyle = 'rgba(255,255,255,0.2)'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(w / 2, 0); cx.lineTo(w / 2, h); cx.stroke(); cx.setLineDash([]);
            // Ball
            bx += bdx; by += bdy;
            if (by < 5 || by > h - 5) bdy *= -1;
            if (bx < 25) { bdx = Math.abs(bdx); }
            if (bx > w - 25) { bdx = -Math.abs(bdx); }
            cx.fillStyle = '#fff'; cx.shadowColor = '#fff'; cx.shadowBlur = 10;
            cx.beginPath(); cx.arc(bx, by, 5, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Paddles follow ball
            p1y += (by - p1y) * 0.06; p2y += (by - p2y) * 0.04;
            cx.fillStyle = '#00ccff'; cx.fillRect(10, p1y - 25, 8, 50);
            cx.fillStyle = '#ff4466'; cx.fillRect(w - 18, p2y - 25, 8, 50);
            // Score
            cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.font = 'bold 40px monospace'; cx.textAlign = 'center';
            cx.fillText('3', w * 0.35, 50); cx.fillText('2', w * 0.65, 50);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Frogger ──
    function animFrogger(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var lanes = 5, laneH = h / (lanes + 2);
        function draw() {
            t += 0.016;
            // Water
            cx.fillStyle = '#1a3a6a'; cx.fillRect(0, 0, w, h);
            // Safe zones
            cx.fillStyle = '#2a7a2a'; cx.fillRect(0, 0, w, laneH); cx.fillRect(0, h - laneH, w, laneH);
            // Road
            cx.fillStyle = '#333'; cx.fillRect(0, laneH, w, laneH * lanes);
            // Lane lines
            cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth = 1; cx.setLineDash([8, 12]);
            for (var l = 1; l < lanes; l++) { cx.beginPath(); cx.moveTo(0, laneH + l * laneH); cx.lineTo(w, laneH + l * laneH); cx.stroke(); }
            cx.setLineDash([]);
            // Cars
            var carColors = ['#ff3333','#3388ff','#ffcc00','#ff6600','#cc33ff'];
            for (var l = 0; l < lanes; l++) {
                var speed = (l % 2 === 0 ? 1 : -1) * (40 + l * 15);
                for (var c = 0; c < 3; c++) {
                    var cx2 = ((t * speed + c * 150 + l * 50) % (w + 60)) - 30;
                    cx.fillStyle = carColors[l % carColors.length];
                    cx.fillRect(cx2, laneH + l * laneH + 6, 35, laneH - 12);
                    cx.fillStyle = 'rgba(150,200,255,0.4)';
                    cx.fillRect(cx2 + 5, laneH + l * laneH + 8, 10, laneH / 3);
                }
            }
            // Frog
            var frogX = w / 2 + Math.sin(t * 0.8) * 30, frogY = h - laneH / 2;
            cx.fillStyle = '#22dd44';
            cx.beginPath(); cx.arc(frogX, frogY, 8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(frogX - 3, frogY - 3, 2, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(frogX + 3, frogY - 3, 2, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Missile Command ──
    function animMissile(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var missiles = [], explosions = [];
        function draw() {
            t += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            // Ground
            cx.fillStyle = '#224400'; cx.fillRect(0, h - 20, w, 20);
            // Cities
            cx.fillStyle = '#00aaff';
            for (var c = 0; c < 5; c++) { var bx = c * 80 + 30; cx.fillRect(bx, h - 35, 12, 15); cx.fillRect(bx + 15, h - 42, 10, 22); cx.fillRect(bx + 28, h - 30, 12, 10); }
            // Spawn missiles
            if (Math.random() < 0.03) missiles.push({ x: Math.random() * w, y: 0, tx: Math.random() * w, ty: h - 20, progress: 0 });
            // Missiles
            cx.strokeStyle = '#ff3333'; cx.lineWidth = 1.5;
            for (var m = missiles.length - 1; m >= 0; m--) {
                var mi = missiles[m]; mi.progress += 0.005;
                var mx = mi.x + (mi.tx - mi.x) * mi.progress, my = mi.y + (mi.ty - mi.y) * mi.progress;
                cx.beginPath(); cx.moveTo(mi.x, mi.y); cx.lineTo(mx, my); cx.stroke();
                if (mi.progress > 0.7) { explosions.push({ x: mx, y: my, r: 0, maxR: 20 + Math.random() * 15 }); missiles.splice(m, 1); }
            }
            // Explosions
            for (var e = explosions.length - 1; e >= 0; e--) {
                var ex = explosions[e]; ex.r += 0.8;
                cx.fillStyle = ex.r < ex.maxR * 0.5 ? '#ffcc00' : '#ff6600';
                cx.globalAlpha = 1 - ex.r / ex.maxR;
                cx.beginPath(); cx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2); cx.fill();
                cx.globalAlpha = 1;
                if (ex.r > ex.maxR) explosions.splice(e, 1);
            }
            // Crosshair
            var chx = w / 2 + Math.sin(t * 1.5) * 100, chy = h * 0.4 + Math.cos(t * 1.1) * 40;
            cx.strokeStyle = '#00ff00'; cx.lineWidth = 1;
            cx.beginPath(); cx.arc(chx, chy, 10, 0, Math.PI * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(chx - 15, chy); cx.lineTo(chx + 15, chy); cx.stroke();
            cx.beginPath(); cx.moveTo(chx, chy - 15); cx.lineTo(chx, chy + 15); cx.stroke();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Flappy Bird ──
    function animFlappy(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var birdY = h / 2, birdVy = 0, pipes = [];
        for (var p = 0; p < 4; p++) pipes.push({ x: w + p * 120, gap: 60 + Math.random() * 40, gapY: 60 + Math.random() * (h - 140) });
        function draw() {
            t += 0.016;
            // Sky gradient
            var sky = cx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#4dc9f6'); sky.addColorStop(1, '#87ceeb');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, h);
            // Ground
            cx.fillStyle = '#8B7355'; cx.fillRect(0, h - 20, w, 20);
            cx.fillStyle = '#5a9e3a'; cx.fillRect(0, h - 25, w, 8);
            // Pipes
            cx.fillStyle = '#2ecc71';
            for (var i = 0; i < pipes.length; i++) {
                var p = pipes[i]; p.x -= 1.5;
                if (p.x < -40) { p.x = w + 40; p.gapY = 60 + Math.random() * (h - 140); }
                cx.fillRect(p.x, 0, 36, p.gapY - p.gap / 2);
                cx.fillRect(p.x, p.gapY + p.gap / 2, 36, h - p.gapY - p.gap / 2);
                cx.fillStyle = '#27ae60'; cx.fillRect(p.x - 3, p.gapY - p.gap / 2 - 8, 42, 10);
                cx.fillRect(p.x - 3, p.gapY + p.gap / 2 - 2, 42, 10);
                cx.fillStyle = '#2ecc71';
            }
            // Bird physics
            birdVy += 0.15; birdY += birdVy;
            if (birdY > h - 35) { birdY = h / 3; birdVy = 0; }
            if (Math.sin(t * 3) > 0.8) birdVy = -3.5;
            // Bird body
            var wing = Math.sin(t * 12) * 5;
            cx.fillStyle = '#f1c40f'; cx.beginPath(); cx.arc(80, birdY, 12, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#e67e22'; cx.beginPath(); cx.moveTo(92, birdY); cx.lineTo(102, birdY - 3); cx.lineTo(102, birdY + 3); cx.closePath(); cx.fill();
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(84, birdY - 4, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.beginPath(); cx.arc(86, birdY - 4, 2.5, 0, Math.PI * 2); cx.fill();
            // Wing
            cx.fillStyle = '#f39c12'; cx.beginPath(); cx.ellipse(74, birdY + wing, 8, 5, -0.3, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Doodle Jump ──
    function animDoodle(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var platforms = [], playerX = w / 2, playerY = h * 0.6, vy = -3, scrollY = 0;
        for (var p = 0; p < 12; p++) platforms.push({ x: Math.random() * (w - 60), y: h - p * (h / 10), w: 55 });
        function draw() {
            t += 0.016;
            // BG
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#fffbe6'); bg.addColorStop(1, '#ffeebb');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // Grid
            cx.strokeStyle = 'rgba(0,0,0,0.04)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx < w; gx += 30) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy < h; gy += 30) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(w, gy); cx.stroke(); }
            // Physics
            vy += 0.1; playerY += vy; playerX += Math.sin(t * 1.5) * 2;
            if (playerX < 0) playerX = w; if (playerX > w) playerX = 0;
            // Platform collision
            for (var i = 0; i < platforms.length; i++) {
                var pl = platforms[i], py = pl.y - scrollY;
                if (vy > 0 && playerY > py - 10 && playerY < py + 5 && playerX > pl.x - 5 && playerX < pl.x + pl.w + 5) {
                    vy = -4.5;
                }
            }
            // Scroll
            if (playerY < h * 0.4) { scrollY -= (h * 0.4 - playerY); playerY = h * 0.4; }
            if (playerY > h + 20) { playerY = h * 0.4; vy = -4; scrollY -= 200; }
            // Draw platforms
            for (var i = 0; i < platforms.length; i++) {
                var pl = platforms[i], py = pl.y - scrollY;
                if (py > h + 20) { pl.y -= h * 1.4; pl.x = Math.random() * (w - 60); }
                cx.fillStyle = '#5cb85c'; cx.fillRect(pl.x, py, pl.w, 10);
                cx.fillStyle = '#4cae4c'; cx.fillRect(pl.x, py, pl.w, 3);
            }
            // Doodler
            cx.fillStyle = '#ff8844';
            cx.beginPath(); cx.arc(playerX, playerY - 8, 10, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#cc6633';
            cx.fillRect(playerX - 6, playerY + 2, 12, 10);
            // Eyes
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(playerX - 4, playerY - 10, 4, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(playerX + 4, playerY - 10, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.beginPath(); cx.arc(playerX - 3, playerY - 10, 2, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(playerX + 5, playerY - 10, 2, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Centipede ──
    function animCentipede(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var mushrooms = [];
        for (var i = 0; i < 12; i++) mushrooms.push({ x: Math.random() * (w - 20) + 10, y: 20 + Math.random() * (h - 80), hp: 3 });
        var fleaY = -20, fleaX = w * 0.6, fleaActive = false, fleaTimer = 0;
        var scorpionX = -30, scorpionActive = false, scorpionTimer = 3;
        function draw() {
            t += 0.016;
            // Dark green gradient background
            var bg = cx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.6);
            bg.addColorStop(0, '#0a1a0a'); bg.addColorStop(1, '#040c04');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // Grid with glow
            cx.strokeStyle = 'rgba(0,255,50,0.03)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx < w; gx += 14) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy < h; gy += 14) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(w, gy); cx.stroke(); }
            // Grid node highlights
            cx.fillStyle = 'rgba(0,255,50,0.04)';
            for (var gx = 0; gx < w; gx += 14) for (var gy = 0; gy < h; gy += 14) {
                cx.beginPath(); cx.arc(gx, gy, 0.6, 0, Math.PI * 2); cx.fill();
            }
            // Mushrooms with glow and detail
            for (var i = 0; i < mushrooms.length; i++) {
                var mx = mushrooms[i].x, my = mushrooms[i].y;
                // Stem
                cx.fillStyle = '#c8c4a0'; cx.fillRect(mx - 2, my + 2, 4, 6);
                // Cap gradient
                var mGrad = cx.createRadialGradient(mx - 1, my - 1, 1, mx, my, 7);
                mGrad.addColorStop(0, '#22ee55'); mGrad.addColorStop(0.6, '#00cc44'); mGrad.addColorStop(1, '#008833');
                cx.fillStyle = mGrad;
                cx.shadowColor = '#00cc44'; cx.shadowBlur = 4;
                cx.beginPath(); cx.ellipse(mx, my, 7, 5, 0, Math.PI, 0); cx.fill();
                cx.shadowBlur = 0;
                // Cap spots
                cx.fillStyle = 'rgba(255,255,255,0.12)';
                cx.beginPath(); cx.arc(mx - 2, my - 2, 1.5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(mx + 3, my - 1, 1, 0, Math.PI * 2); cx.fill();
            }
            // Centipede with connection lines and detail
            var segs = 10, prevSx = 0, prevSy = 0;
            for (var i = 0; i < segs; i++) {
                var phase = t * 3 - i * 0.5;
                var sx = w * 0.1 + i * (w * 0.7 / segs) + Math.sin(phase) * 12;
                var sy = h * 0.35 + Math.cos(phase) * 10;
                // Connection line between segments
                if (i > 0) {
                    cx.strokeStyle = 'rgba(34,221,85,0.3)'; cx.lineWidth = 2;
                    cx.beginPath(); cx.moveTo(prevSx, prevSy); cx.lineTo(sx, sy); cx.stroke();
                }
                // Legs
                cx.strokeStyle = 'rgba(0,200,100,0.4)'; cx.lineWidth = 1;
                var legPhase = Math.sin(t * 8 + i * 0.6);
                cx.beginPath(); cx.moveTo(sx - 4, sy + 3); cx.lineTo(sx - 7, sy + 7 + legPhase * 2); cx.stroke();
                cx.beginPath(); cx.moveTo(sx + 4, sy + 3); cx.lineTo(sx + 7, sy + 7 - legPhase * 2); cx.stroke();
                if (i === 0) {
                    // Head with glow and antennae
                    cx.shadowColor = '#00ff88'; cx.shadowBlur = 10;
                    var hGrad = cx.createRadialGradient(sx - 1, sy - 1, 1, sx, sy, 8);
                    hGrad.addColorStop(0, '#44ffaa'); hGrad.addColorStop(1, '#00cc66');
                    cx.fillStyle = hGrad;
                    cx.beginPath(); cx.arc(sx, sy, 7.5, 0, Math.PI * 2); cx.fill();
                    cx.shadowBlur = 0;
                    // Antennae
                    cx.strokeStyle = '#00ff88'; cx.lineWidth = 1;
                    cx.beginPath(); cx.moveTo(sx - 3, sy - 6); cx.lineTo(sx - 8, sy - 13 + Math.sin(t * 6) * 2); cx.stroke();
                    cx.beginPath(); cx.moveTo(sx + 3, sy - 6); cx.lineTo(sx + 8, sy - 13 - Math.sin(t * 6) * 2); cx.stroke();
                    // Antenna tips
                    cx.fillStyle = '#88ffcc';
                    cx.beginPath(); cx.arc(sx - 8, sy - 13 + Math.sin(t * 6) * 2, 1.5, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(sx + 8, sy - 13 - Math.sin(t * 6) * 2, 1.5, 0, Math.PI * 2); cx.fill();
                    // Eyes
                    cx.fillStyle = '#fff';
                    cx.beginPath(); cx.arc(sx - 3, sy - 1, 2.5, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(sx + 3, sy - 1, 2.5, 0, Math.PI * 2); cx.fill();
                    cx.fillStyle = '#111';
                    cx.beginPath(); cx.arc(sx - 2.5, sy - 1, 1.3, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(sx + 3.5, sy - 1, 1.3, 0, Math.PI * 2); cx.fill();
                } else {
                    // Body segment gradient
                    var sGrad = cx.createRadialGradient(sx, sy - 1, 1, sx, sy, 6);
                    sGrad.addColorStop(0, '#44ee77'); sGrad.addColorStop(1, '#1aaa44');
                    cx.fillStyle = sGrad;
                    cx.shadowColor = '#22dd55'; cx.shadowBlur = 3;
                    cx.beginPath(); cx.arc(sx, sy, 5.5, 0, Math.PI * 2); cx.fill();
                    cx.shadowBlur = 0;
                    // Segment highlight
                    cx.fillStyle = 'rgba(255,255,255,0.1)';
                    cx.beginPath(); cx.arc(sx - 1, sy - 2, 2.5, 0, Math.PI * 2); cx.fill();
                }
                prevSx = sx; prevSy = sy;
            }
            // Flea dropping down
            fleaTimer -= 0.016;
            if (fleaTimer <= 0 && !fleaActive) { fleaActive = true; fleaY = -10; fleaX = 50 + Math.random() * (w - 100); }
            if (fleaActive) {
                fleaY += 2.5;
                cx.fillStyle = '#ff6644';
                cx.beginPath(); cx.arc(fleaX, fleaY, 4, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = 'rgba(255,100,60,0.2)';
                cx.beginPath(); cx.arc(fleaX, fleaY - 6, 3, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(fleaX, fleaY - 11, 2, 0, Math.PI * 2); cx.fill();
                if (fleaY > h + 10) { fleaActive = false; fleaTimer = 4 + Math.random() * 3; }
            }
            // Scorpion appearance
            scorpionTimer -= 0.016;
            if (scorpionTimer <= 0 && !scorpionActive) { scorpionActive = true; scorpionX = -25; }
            if (scorpionActive) {
                scorpionX += 1.5;
                var scy = h * 0.55;
                cx.shadowColor = '#ffaa00'; cx.shadowBlur = 5;
                cx.fillStyle = '#ffaa00';
                cx.beginPath(); cx.ellipse(scorpionX, scy, 10, 6, 0, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.strokeStyle = '#ffaa00'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(scorpionX - 8, scy);
                cx.quadraticCurveTo(scorpionX - 14, scy - 12, scorpionX - 10, scy - 16 + Math.sin(t * 4) * 3);
                cx.stroke();
                cx.fillStyle = '#ff4444';
                cx.beginPath(); cx.arc(scorpionX - 10, scy - 16 + Math.sin(t * 4) * 3, 2, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = '#cc8800'; cx.lineWidth = 1;
                for (var l = 0; l < 3; l++) {
                    var lPhase = Math.sin(t * 8 + l);
                    cx.beginPath(); cx.moveTo(scorpionX - 4 + l * 5, scy + 5); cx.lineTo(scorpionX - 6 + l * 5, scy + 10 + lPhase * 2); cx.stroke();
                    cx.beginPath(); cx.moveTo(scorpionX - 4 + l * 5, scy + 5); cx.lineTo(scorpionX - 2 + l * 5, scy + 10 - lPhase * 2); cx.stroke();
                }
                if (scorpionX > w + 25) { scorpionActive = false; scorpionTimer = 5 + Math.random() * 4; }
            }
            // Spider with glow
            var spx = (t * 80) % (w + 40) - 20, spy = h * 0.72 + Math.sin(t * 5) * 15;
            cx.shadowColor = '#ff44ff'; cx.shadowBlur = 6;
            var spGrad = cx.createRadialGradient(spx - 1, spy - 1, 1, spx, spy, 8);
            spGrad.addColorStop(0, '#ff88ff'); spGrad.addColorStop(1, '#cc22cc');
            cx.fillStyle = spGrad;
            cx.beginPath(); cx.ellipse(spx, spy, 8, 6, 0, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            // Spider eyes
            cx.fillStyle = '#fff';
            cx.beginPath(); cx.arc(spx - 2, spy - 2, 2, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(spx + 2, spy - 2, 2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000';
            cx.beginPath(); cx.arc(spx - 2, spy - 2, 1, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(spx + 2, spy - 2, 1, 0, Math.PI * 2); cx.fill();
            // Spider legs with animation
            cx.strokeStyle = '#cc33cc'; cx.lineWidth = 1.2;
            for (var l = 0; l < 4; l++) {
                var lw = Math.sin(t * 10 + l * 0.8) * 4;
                cx.beginPath(); cx.moveTo(spx - 6, spy - 2 + l * 3); cx.quadraticCurveTo(spx - 12, spy + l * 2 + lw, spx - 16, spy + 5 + l * 2 + lw); cx.stroke();
                cx.beginPath(); cx.moveTo(spx + 6, spy - 2 + l * 3); cx.quadraticCurveTo(spx + 12, spy + l * 2 - lw, spx + 16, spy + 5 + l * 2 - lw); cx.stroke();
            }
            // Player with gradient
            var px = w / 2 + Math.sin(t * 1.5) * 50;
            var plGrad = cx.createLinearGradient(px - 8, h - 20, px + 8, h - 20);
            plGrad.addColorStop(0, '#0088cc'); plGrad.addColorStop(0.5, '#00ccff'); plGrad.addColorStop(1, '#0088cc');
            cx.shadowColor = '#00ccff'; cx.shadowBlur = 5;
            cx.fillStyle = plGrad;
            cx.fillRect(px - 8, h - 20, 16, 8);
            cx.fillStyle = '#00ddff'; cx.fillRect(px - 2, h - 25, 4, 6);
            cx.shadowBlur = 0;
            cx.fillStyle = '#aaeeff'; cx.fillRect(px - 1, h - 27, 2, 3);
            // Bullets with glow
            if (Math.sin(t * 10) > 0) {
                var bly = h - 30 - (t * 200 % 70);
                cx.shadowColor = '#00ffcc'; cx.shadowBlur = 8;
                cx.fillStyle = '#88ffee';
                cx.fillRect(px - 1.5, bly, 3, 10);
                cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(0,255,200,0.15)';
                cx.fillRect(px - 2, bly + 8, 4, 15);
            }
            // Vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,10,0,0.35)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Minesweeper ──
    function animMinesweeper(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = 14, cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var cells = [];
        for (var r = 0; r < rows; r++) { cells[r] = []; for (var c = 0; c < cols; c++) cells[r][c] = { revealed: false, mine: Math.random() < 0.12, num: 0, timer: Math.random() * 8, flagged: false, exploding: 0 }; }
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { if (cells[r][c].mine) continue; var n = 0; for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) { var nr = r + dr, nc = c + dc; if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc].mine) n++; } cells[r][c].num = n; }
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { if (cells[r][c].mine && Math.random() < 0.3) cells[r][c].flagged = true; }
        var NC = ['', '#0000ff', '#007700', '#ff0000', '#000088', '#880000', '#008888', '#000000', '#888888'];
        var revealWaveX = -1, revealWaveY = -1, revealWaveR = 0, revealWaveActive = false, revealWaveTimer = 5;
        var mineExplosions = [];
        function draw() {
            t += 0.016;
            // Background gradient
            var bg = cx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, '#b8b8c0'); bg.addColorStop(0.5, '#c0c0c8'); bg.addColorStop(1, '#b0b0b8');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // Sweeping reveal wave
            revealWaveTimer -= 0.016;
            if (revealWaveTimer <= 0 && !revealWaveActive) {
                revealWaveActive = true; revealWaveR = 0;
                revealWaveX = Math.floor(Math.random() * cols); revealWaveY = Math.floor(Math.random() * rows);
            }
            if (revealWaveActive) {
                revealWaveR += 0.15;
                if (revealWaveR > Math.max(cols, rows)) { revealWaveActive = false; revealWaveTimer = 4 + Math.random() * 3; }
            }
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
                var cl = cells[r][c], x = c * cs, y = r * cs;
                if (revealWaveActive) {
                    var dist = Math.sqrt((c - revealWaveX) * (c - revealWaveX) + (r - revealWaveY) * (r - revealWaveY));
                    if (dist < revealWaveR && dist > revealWaveR - 3 && !cl.revealed) {
                        cl.revealed = true; cl.timer = -0.01;
                        if (cl.mine && !cl.flagged) { cl.exploding = 1; mineExplosions.push({ x: x + cs / 2, y: y + cs / 2, r: 0, life: 1 }); }
                    }
                }
                cl.timer -= 0.016;
                if (cl.timer <= 0 && !cl.revealed) { cl.revealed = true; }
                if (cl.timer <= -4) { cl.revealed = false; cl.timer = 3 + Math.random() * 6; cl.exploding = 0; }
                if (!cl.revealed) {
                    // 3D beveled unrevealed cell
                    cx.fillStyle = '#c8c8d0'; cx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
                    cx.fillStyle = '#e8e8f0'; cx.fillRect(x + 1, y + 1, cs - 2, 2);
                    cx.fillStyle = '#dddde5'; cx.fillRect(x + 1, y + 1, 2, cs - 2);
                    cx.fillStyle = '#909098'; cx.fillRect(x + 1, y + cs - 3, cs - 2, 2);
                    cx.fillStyle = '#989898'; cx.fillRect(x + cs - 3, y + 1, 2, cs - 2);
                    cx.fillStyle = '#bbbbc4'; cx.fillRect(x + 3, y + 3, cs - 6, cs - 6);
                    if (cl.flagged) {
                        cx.fillStyle = '#444'; cx.fillRect(x + cs / 2, y + 3, 1, cs - 7);
                        cx.fillStyle = '#ee2222';
                        cx.beginPath(); cx.moveTo(x + cs / 2 + 1, y + 3); cx.lineTo(x + cs / 2 + 6, y + 5);
                        cx.lineTo(x + cs / 2 + 1, y + 7); cx.closePath(); cx.fill();
                        cx.fillStyle = '#444'; cx.fillRect(x + cs / 2 - 2, y + cs - 5, 5, 2);
                    }
                } else {
                    cx.fillStyle = cl.mine && cl.exploding > 0 ? '#ff6666' : '#d8d8e0';
                    cx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
                    cx.strokeStyle = '#c0c0c8'; cx.lineWidth = 0.5; cx.strokeRect(x + 1, y + 1, cs - 2, cs - 2);
                    if (cl.mine) {
                        var mcx = x + cs / 2, mcy = y + cs / 2;
                        cx.strokeStyle = '#333'; cx.lineWidth = 1.5;
                        for (var sp = 0; sp < 4; sp++) {
                            var ang = sp * Math.PI / 4;
                            cx.beginPath(); cx.moveTo(mcx + Math.cos(ang) * 2, mcy + Math.sin(ang) * 2);
                            cx.lineTo(mcx + Math.cos(ang) * cs * 0.35, mcy + Math.sin(ang) * cs * 0.35); cx.stroke();
                        }
                        cx.fillStyle = '#222'; cx.beginPath(); cx.arc(mcx, mcy, cs * 0.22, 0, Math.PI * 2); cx.fill();
                        cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.beginPath(); cx.arc(mcx - 1, mcy - 1, cs * 0.1, 0, Math.PI * 2); cx.fill();
                    }
                    else if (cl.num > 0) {
                        cx.fillStyle = NC[cl.num]; cx.shadowColor = NC[cl.num]; cx.shadowBlur = 2;
                        cx.font = 'bold ' + Math.round(cs * 0.65) + 'px monospace';
                        cx.textAlign = 'center'; cx.textBaseline = 'middle';
                        cx.fillText(cl.num, x + cs / 2, y + cs / 2 + 1); cx.shadowBlur = 0;
                    }
                }
            }
            // Mine explosion effects
            for (var me = mineExplosions.length - 1; me >= 0; me--) {
                var exp = mineExplosions[me]; exp.r += 0.5; exp.life -= 0.02;
                if (exp.life > 0) {
                    cx.globalAlpha = exp.life * 0.4;
                    var eGrad = cx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.r * 8);
                    eGrad.addColorStop(0, '#ffaa00'); eGrad.addColorStop(0.5, '#ff4400'); eGrad.addColorStop(1, 'rgba(255,0,0,0)');
                    cx.fillStyle = eGrad; cx.beginPath(); cx.arc(exp.x, exp.y, exp.r * 8, 0, Math.PI * 2); cx.fill();
                    cx.globalAlpha = 1;
                }
                if (exp.life <= 0) mineExplosions.splice(me, 1);
            }
            // Reveal wave visual ring
            if (revealWaveActive) {
                var waveR = revealWaveR * cs;
                var waveCx = revealWaveX * cs + cs / 2, waveCy = revealWaveY * cs + cs / 2;
                cx.strokeStyle = 'rgba(0,150,255,0.15)'; cx.lineWidth = cs * 2;
                cx.beginPath(); cx.arc(waveCx, waveCy, waveR, 0, Math.PI * 2); cx.stroke();
            }
            // Subtle vignette
            var vig = cx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, w * 0.6);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.15)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Donkey Kong ──
    function animDonkeyKong(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var girders = [];
        for (var i = 0; i < 5; i++) girders.push({ y: h * 0.25 + i * h * 0.15, slant: (i % 2 === 0 ? 1 : -1) * 0.04 });
        var fireParticles = [];
        var barrels = [{x: -20, speed: 1.2}, {x: w * 0.5, speed: 0.9}];
        function draw() {
            t += 0.02;
            // gradient background - dark construction site
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0020'); bg.addColorStop(0.5, '#0c0828'); bg.addColorStop(1, '#140a10');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // subtle ambient glow at top where DK is
            cx.save();
            var ambGlow = cx.createRadialGradient(w * 0.45, h * 0.1, 10, w * 0.45, h * 0.1, 120);
            ambGlow.addColorStop(0, 'rgba(255,100,30,0.12)'); ambGlow.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = ambGlow; cx.fillRect(0, 0, w, h * 0.5);
            cx.restore();
            // girders with rivet detail and glow
            for (var i = 0; i < girders.length; i++) {
                var g = girders[i];
                cx.save(); cx.translate(w / 2, g.y); cx.rotate(g.slant);
                // girder shadow
                cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(-w * 0.44, 3, w * 0.88, 5);
                // main girder
                var grdGrad = cx.createLinearGradient(0, -2, 0, 8);
                grdGrad.addColorStop(0, '#ee4422'); grdGrad.addColorStop(0.5, '#cc3322'); grdGrad.addColorStop(1, '#882211');
                cx.fillStyle = grdGrad; cx.fillRect(-w * 0.45, 0, w * 0.9, 6);
                // rivets with metallic shine
                for (var x = -w * 0.4; x < w * 0.4; x += 12) {
                    cx.fillStyle = '#dd4433'; cx.fillRect(x, -1, 8, 8);
                    cx.fillStyle = 'rgba(255,200,150,0.3)'; cx.fillRect(x, -1, 8, 2);
                }
                cx.restore();
            }
            // ladders with glow
            for (var i = 0; i < 4; i++) {
                var lx = w * 0.3 + (i % 2) * w * 0.35;
                var lTop = h * 0.25 + i * h * 0.15 + 5, lBot = h * 0.25 + (i + 1) * h * 0.15;
                // ladder glow
                cx.save(); cx.shadowColor = 'rgba(100,200,255,0.4)'; cx.shadowBlur = 6;
                cx.strokeStyle = 'rgba(120,210,255,0.35)'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(lx, lTop); cx.lineTo(lx, lBot); cx.stroke();
                cx.beginPath(); cx.moveTo(lx + 10, lTop); cx.lineTo(lx + 10, lBot); cx.stroke();
                // rungs
                for (var ry = lTop + 8; ry < lBot; ry += 10) {
                    cx.beginPath(); cx.moveTo(lx, ry); cx.lineTo(lx + 10, ry); cx.stroke();
                }
                cx.restore();
            }
            // fire barrel at bottom-left with particle flames
            var fbx = w * 0.08, fby = h * 0.88;
            cx.fillStyle = '#555'; cx.fillRect(fbx - 8, fby - 10, 16, 14);
            cx.fillStyle = '#777'; cx.fillRect(fbx - 6, fby - 10, 12, 3);
            // fire particles
            if (Math.random() < 0.3) fireParticles.push({x: fbx + (Math.random() - 0.5) * 8, y: fby - 10, vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random() * 2, life: 1.0});
            for (var fp = fireParticles.length - 1; fp >= 0; fp--) {
                var p = fireParticles[fp];
                p.x += p.vx; p.y += p.vy; p.life -= 0.025;
                if (p.life <= 0) { fireParticles.splice(fp, 1); continue; }
                cx.save(); cx.globalAlpha = p.life;
                cx.shadowColor = p.life > 0.5 ? '#ff6600' : '#ff3300'; cx.shadowBlur = 8;
                cx.fillStyle = p.life > 0.6 ? '#ffcc00' : p.life > 0.3 ? '#ff6600' : '#ff2200';
                cx.beginPath(); cx.arc(p.x, p.y, 2 + p.life * 3, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (fireParticles.length > 40) fireParticles.splice(0, 10);
            // rolling barrels with rotation and shadow
            for (var bi = 0; bi < barrels.length; bi++) {
                var barrel = barrels[bi];
                barrel.x = ((t * 60 * barrel.speed + bi * 180) % (w + 40)) - 20;
                var bby = h * (0.38 + bi * 0.15) + Math.sin(t * 2 + bi) * 3;
                var brot = t * 4 * barrel.speed;
                cx.save(); cx.translate(barrel.x, bby); cx.rotate(brot);
                // barrel shadow
                cx.fillStyle = 'rgba(0,0,0,0.3)';
                cx.beginPath(); cx.ellipse(2, 4, 9, 3, 0, 0, Math.PI * 2); cx.fill();
                // barrel body
                var barGrad = cx.createRadialGradient(-2, -2, 1, 0, 0, 9);
                barGrad.addColorStop(0, '#bb7744'); barGrad.addColorStop(0.7, '#8B4513'); barGrad.addColorStop(1, '#5a2d0a');
                cx.fillStyle = barGrad;
                cx.beginPath(); cx.arc(0, 0, 9, 0, Math.PI * 2); cx.fill();
                // barrel bands
                cx.strokeStyle = '#654321'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.moveTo(-9, 0); cx.lineTo(9, 0); cx.stroke();
                cx.beginPath(); cx.moveTo(0, -9); cx.lineTo(0, 9); cx.stroke();
                cx.restore();
            }
            // DK at top - more detailed
            var dkx = w * 0.42, dky = h * 0.08;
            // DK glow
            cx.save(); cx.shadowColor = '#ff6600'; cx.shadowBlur = 15;
            // DK body
            cx.fillStyle = '#8B4513'; cx.fillRect(dkx - 2, dky + 8, 24, 18);
            // DK chest
            cx.fillStyle = '#cc8844'; cx.fillRect(dkx + 4, dky + 10, 12, 12);
            // DK head
            cx.fillStyle = '#8B4513'; cx.beginPath(); cx.arc(dkx + 10, dky + 4, 10, 0, Math.PI * 2); cx.fill();
            // DK face
            cx.fillStyle = '#cc8844'; cx.fillRect(dkx + 4, dky + 1, 12, 8);
            // DK eyes
            cx.fillStyle = '#fff'; cx.fillRect(dkx + 5, dky + 2, 4, 3); cx.fillRect(dkx + 11, dky + 2, 4, 3);
            cx.fillStyle = '#000'; cx.fillRect(dkx + 7, dky + 3, 2, 2); cx.fillRect(dkx + 13, dky + 3, 2, 2);
            // DK mouth/grin
            cx.fillStyle = '#5a2d0a'; cx.fillRect(dkx + 6, dky + 6, 8, 2);
            cx.restore();
            // Mario climbing with animation detail
            var mx = w * 0.6, my = h * 0.65 + Math.abs(Math.sin(t * 3)) * -14;
            // Mario hat
            cx.fillStyle = '#ff2222'; cx.fillRect(mx - 5, my - 12, 10, 4);
            // Mario head
            cx.fillStyle = '#ffccaa'; cx.fillRect(mx - 3, my - 8, 6, 5);
            // Mario mustache
            cx.fillStyle = '#4a2a0a'; cx.fillRect(mx - 2, my - 5, 5, 2);
            // Mario body (red shirt)
            cx.fillStyle = '#ff3333'; cx.fillRect(mx - 4, my - 3, 8, 6);
            // Mario overalls (blue)
            cx.fillStyle = '#4488ff'; cx.fillRect(mx - 4, my + 3, 8, 5);
            // Mario legs walking
            var legOff = Math.sin(t * 8) * 2;
            cx.fillStyle = '#4488ff'; cx.fillRect(mx - 4, my + 8, 3, 3 + legOff); cx.fillRect(mx + 1, my + 8, 3, 3 - legOff);
            // vignette overlay
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Bubble Bobble ──
    function animBubbleBobble(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bubbles = [];
        var sparkles = [];
        var plats = [{x:20,y:h*0.55,w:80},{x:w-100,y:h*0.55,w:80},{x:w*0.3,y:h*0.75,w:100},{x:10,y:h*0.9,w:w-20}];
        function draw() {
            t += 0.02;
            // gradient background - deep magical cave
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#060028'); bg.addColorStop(0.5, '#0a0838'); bg.addColorStop(1, '#100a40');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // subtle floating sparkles in background
            if (Math.random() < 0.1) sparkles.push({x: Math.random() * w, y: h + 5, vy: -0.3 - Math.random() * 0.5, life: 1.0, size: 1 + Math.random() * 2});
            for (var sp = sparkles.length - 1; sp >= 0; sp--) {
                var s = sparkles[sp]; s.y += s.vy; s.x += Math.sin(t * 2 + sp) * 0.3; s.life -= 0.005;
                if (s.life <= 0 || s.y < -5) { sparkles.splice(sp, 1); continue; }
                cx.save(); cx.globalAlpha = s.life * 0.5;
                cx.fillStyle = '#aaccff'; cx.beginPath(); cx.arc(s.x, s.y, s.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (sparkles.length > 30) sparkles.splice(0, 8);
            // platforms with glow effect
            for (var i = 0; i < plats.length; i++) {
                var p = plats[i];
                cx.save(); cx.shadowColor = '#4466cc'; cx.shadowBlur = 8;
                var platGrad = cx.createLinearGradient(p.x, p.y, p.x, p.y + 6);
                platGrad.addColorStop(0, '#5566cc'); platGrad.addColorStop(1, '#2233aa');
                cx.fillStyle = platGrad; cx.fillRect(p.x, p.y, p.w, 6);
                // platform edge highlights
                cx.fillStyle = 'rgba(150,180,255,0.4)'; cx.fillRect(p.x, p.y, p.w, 1);
                cx.restore();
            }
            // green dragon (Bub) - more detailed
            var dx1 = w * 0.15 + Math.sin(t * 1.2) * 20, dy1 = h * 0.9 - 18;
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 10;
            // body
            cx.fillStyle = '#33cc33'; cx.beginPath(); cx.arc(dx1, dy1, 11, 0, Math.PI * 2); cx.fill();
            // belly
            cx.fillStyle = '#88ee88'; cx.beginPath(); cx.arc(dx1 + 1, dy1 + 2, 6, 0, Math.PI * 2); cx.fill();
            // spines
            cx.fillStyle = '#22aa22';
            for (var sp2 = 0; sp2 < 3; sp2++) { cx.fillRect(dx1 - 6 + sp2 * 4, dy1 - 13, 3, 4); }
            // eyes
            cx.fillStyle = '#fff'; cx.fillRect(dx1 + 3, dy1 - 5, 5, 5);
            cx.fillStyle = '#000'; cx.fillRect(dx1 + 5, dy1 - 4, 3, 3);
            // legs with walk animation
            var bWalk = Math.sin(t * 6) * 2;
            cx.fillStyle = '#33cc33'; cx.fillRect(dx1 - 6, dy1 + 9, 5, 5 + bWalk); cx.fillRect(dx1 + 1, dy1 + 9, 5, 5 - bWalk);
            cx.restore();
            // blue dragon (Bob) - more detailed
            var dx2 = w * 0.75 + Math.cos(t * 1.0) * 20, dy2 = h * 0.55 - 18;
            cx.save(); cx.shadowColor = '#44aaff'; cx.shadowBlur = 10;
            cx.fillStyle = '#3399ff'; cx.beginPath(); cx.arc(dx2, dy2, 11, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#88ccff'; cx.beginPath(); cx.arc(dx2 - 1, dy2 + 2, 6, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#2277dd';
            for (var sp3 = 0; sp3 < 3; sp3++) { cx.fillRect(dx2 - 6 + sp3 * 4, dy2 - 13, 3, 4); }
            cx.fillStyle = '#fff'; cx.fillRect(dx2 - 8, dy2 - 5, 5, 5);
            cx.fillStyle = '#000'; cx.fillRect(dx2 - 8, dy2 - 4, 3, 3);
            var bWalk2 = Math.sin(t * 5) * 2;
            cx.fillStyle = '#3399ff'; cx.fillRect(dx2 - 6, dy2 + 9, 5, 5 + bWalk2); cx.fillRect(dx2 + 1, dy2 + 9, 5, 5 - bWalk2);
            cx.restore();
            // spawn bubbles with rainbow tints
            if (Math.random() < 0.07) bubbles.push({x: dx1 + 12, y: dy1 - 5, r: 6 + Math.random() * 4, phase: Math.random() * 6, hue: 120 + Math.random() * 40});
            if (Math.random() < 0.05) bubbles.push({x: dx2 - 12, y: dy2 - 5, r: 5 + Math.random() * 4, phase: Math.random() * 6, hue: 200 + Math.random() * 40});
            // draw & move bubbles with iridescent glow
            for (var b = bubbles.length - 1; b >= 0; b--) {
                var bb = bubbles[b]; bb.y -= 0.7; bb.x += Math.sin(t * 3 + bb.phase) * 0.6; bb.r += 0.003;
                cx.save();
                cx.shadowColor = 'hsla(' + bb.hue + ',80%,70%,0.6)'; cx.shadowBlur = 10;
                // bubble outline
                var bubGrad = cx.createRadialGradient(bb.x - bb.r * 0.3, bb.y - bb.r * 0.3, bb.r * 0.1, bb.x, bb.y, bb.r);
                bubGrad.addColorStop(0, 'rgba(255,255,255,0.3)'); bubGrad.addColorStop(0.7, 'hsla(' + bb.hue + ',70%,80%,0.15)'); bubGrad.addColorStop(1, 'hsla(' + bb.hue + ',70%,60%,0.05)');
                cx.fillStyle = bubGrad; cx.beginPath(); cx.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = 'hsla(' + bb.hue + ',80%,75%,0.6)'; cx.lineWidth = 1.2;
                cx.beginPath(); cx.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); cx.stroke();
                // highlight reflection
                cx.fillStyle = 'rgba(255,255,255,0.5)';
                cx.beginPath(); cx.arc(bb.x - bb.r * 0.3, bb.y - bb.r * 0.3, bb.r * 0.25, 0, Math.PI * 2); cx.fill();
                cx.restore();
                if (bb.y < -10) bubbles.splice(b, 1);
            }
            if (bubbles.length > 30) bubbles.splice(0, 5);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,20,0.45)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Joust ──
    function animJoust(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var plats = [{x:20,y:h*0.45,w:90},{x:w-110,y:h*0.45,w:90},{x:w*0.3,y:h*0.65,w:w*0.4}];
        var lavaParticles = [];
        function draw() {
            t += 0.02;
            // gradient dark background
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#08081e'); bg.addColorStop(0.6, '#0c0a28'); bg.addColorStop(1, '#1a0800');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // lava glow from below
            var lavaGlow = cx.createRadialGradient(w / 2, h + 10, 10, w / 2, h, h * 0.5);
            lavaGlow.addColorStop(0, 'rgba(255,80,0,0.25)'); lavaGlow.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = lavaGlow; cx.fillRect(0, h * 0.5, w, h * 0.5);
            // stone platforms with texture
            for (var i = 0; i < plats.length; i++) {
                var p = plats[i];
                cx.save(); cx.shadowColor = '#8888bb'; cx.shadowBlur = 6;
                var pGrad = cx.createLinearGradient(p.x, p.y, p.x, p.y + 8);
                pGrad.addColorStop(0, '#7777aa'); pGrad.addColorStop(1, '#444466');
                cx.fillStyle = pGrad; cx.fillRect(p.x, p.y, p.w, 8);
                // platform edge highlight
                cx.fillStyle = 'rgba(180,180,220,0.4)'; cx.fillRect(p.x, p.y, p.w, 2);
                cx.restore();
            }
            // animated lava at bottom
            cx.save();
            for (var layer = 0; layer < 3; layer++) {
                var colors = ['#ff2200', '#ff6600', '#ffaa00'];
                var alphas = [0.9, 0.7, 0.5];
                cx.globalAlpha = alphas[layer];
                cx.fillStyle = colors[layer];
                cx.beginPath(); cx.moveTo(0, h);
                for (var lx = 0; lx <= w; lx += 3) {
                    var ly = h - 10 - layer * 4 + Math.sin(t * (3 + layer) + lx * (0.08 + layer * 0.03)) * (4 + layer * 2);
                    cx.lineTo(lx, ly);
                }
                cx.lineTo(w, h); cx.closePath(); cx.fill();
            }
            cx.globalAlpha = 1; cx.restore();
            // lava sparks
            if (Math.random() < 0.15) lavaParticles.push({x: Math.random() * w, y: h - 8, vy: -2 - Math.random() * 3, vx: (Math.random() - 0.5) * 2, life: 1.0});
            for (var lp = lavaParticles.length - 1; lp >= 0; lp--) {
                var lpr = lavaParticles[lp]; lpr.x += lpr.vx; lpr.y += lpr.vy; lpr.vy += 0.05; lpr.life -= 0.03;
                if (lpr.life <= 0) { lavaParticles.splice(lp, 1); continue; }
                cx.save(); cx.globalAlpha = lpr.life; cx.shadowColor = '#ff6600'; cx.shadowBlur = 6;
                cx.fillStyle = lpr.life > 0.5 ? '#ffcc00' : '#ff6600';
                cx.beginPath(); cx.arc(lpr.x, lpr.y, 1.5, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (lavaParticles.length > 30) lavaParticles.splice(0, 8);
            // red knight on ostrich - detailed
            var rx = w * 0.25 + Math.sin(t * 1.5) * 50, ry = h * 0.32 + Math.sin(t * 2.5) * 20;
            var flapR = Math.sin(t * 8) * 8;
            cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 8;
            // ostrich body
            cx.fillStyle = '#ddaa44';
            cx.beginPath(); cx.ellipse(rx, ry + 4, 8, 6, 0, 0, Math.PI * 2); cx.fill();
            // wings flapping
            cx.fillStyle = '#ccaa33';
            cx.beginPath(); cx.moveTo(rx - 6, ry + 2); cx.lineTo(rx - 16, ry - 2 + flapR); cx.lineTo(rx - 4, ry + 6); cx.fill();
            cx.beginPath(); cx.moveTo(rx + 6, ry + 2); cx.lineTo(rx + 16, ry - 2 - flapR); cx.lineTo(rx + 4, ry + 6); cx.fill();
            // ostrich head and beak
            cx.fillStyle = '#ddaa44'; cx.beginPath(); cx.arc(rx + 8, ry - 4, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff8800'; cx.fillRect(rx + 11, ry - 5, 5, 3);
            // ostrich legs
            cx.strokeStyle = '#ddaa44'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(rx - 3, ry + 9); cx.lineTo(rx - 4, ry + 16 + Math.sin(t * 6) * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(rx + 3, ry + 9); cx.lineTo(rx + 4, ry + 16 - Math.sin(t * 6) * 2); cx.stroke();
            // rider
            cx.fillStyle = '#ff3333'; cx.fillRect(rx - 5, ry - 12, 10, 10);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(rx, ry - 14, 4, 0, Math.PI * 2); cx.fill();
            // lance with glow
            cx.fillStyle = '#ffdd44'; cx.fillRect(rx + 5, ry - 16, 14, 3);
            cx.fillStyle = '#fff'; cx.fillRect(rx + 17, ry - 16, 3, 3);
            cx.restore();
            // blue knight - similar detail
            var bx = w * 0.7 + Math.cos(t * 1.3) * 50, by = h * 0.35 + Math.cos(t * 2.2) * 25;
            var flapB = Math.sin(t * 7) * 8;
            cx.save(); cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
            cx.fillStyle = '#ddaa44';
            cx.beginPath(); cx.ellipse(bx, by + 4, 8, 6, 0, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ccaa33';
            cx.beginPath(); cx.moveTo(bx - 6, by + 2); cx.lineTo(bx - 16, by - 2 + flapB); cx.lineTo(bx - 4, by + 6); cx.fill();
            cx.beginPath(); cx.moveTo(bx + 6, by + 2); cx.lineTo(bx + 16, by - 2 - flapB); cx.lineTo(bx + 4, by + 6); cx.fill();
            cx.fillStyle = '#ddaa44'; cx.beginPath(); cx.arc(bx - 8, by - 4, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff8800'; cx.fillRect(bx - 16, by - 5, 5, 3);
            cx.strokeStyle = '#ddaa44'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(bx - 3, by + 9); cx.lineTo(bx - 4, by + 16 + Math.sin(t * 5) * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(bx + 3, by + 9); cx.lineTo(bx + 4, by + 16 - Math.sin(t * 5) * 2); cx.stroke();
            cx.fillStyle = '#4488ff'; cx.fillRect(bx - 5, by - 12, 10, 10);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(bx, by - 14, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ffdd44'; cx.fillRect(bx - 19, by - 16, 14, 3);
            cx.restore();
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: BurgerTime ──
    function animBurgerTime(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var floors = [h*0.25, h*0.45, h*0.65, h*0.85];
        var pepperParticles = [];
        var ingredients = [
            {x:w*0.15, floor:0, c1:'#ee9933', c2:'#cc7722', label:'bun'},
            {x:w*0.55, floor:1, c1:'#55dd55', c2:'#33aa33', label:'let'},
            {x:w*0.3, floor:2, c1:'#dd4444', c2:'#aa2222', label:'pat'},
            {x:w*0.65, floor:3, c1:'#ddaa33', c2:'#aa7722', label:'bot'}
        ];
        function draw() {
            t += 0.02;
            // warm gradient background
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0818'); bg.addColorStop(0.5, '#0c0a20'); bg.addColorStop(1, '#100810');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // floors with glow
            for (var i = 0; i < floors.length; i++) {
                cx.save(); cx.shadowColor = '#4466aa'; cx.shadowBlur = 4;
                var flGrad = cx.createLinearGradient(10, floors[i], 10, floors[i] + 5);
                flGrad.addColorStop(0, '#5577bb'); flGrad.addColorStop(1, '#334488');
                cx.fillStyle = flGrad; cx.fillRect(10, floors[i], w - 20, 5);
                cx.restore();
            }
            // ladders with warm glow
            cx.save(); cx.shadowColor = 'rgba(200,180,100,0.3)'; cx.shadowBlur = 4;
            cx.strokeStyle = '#aa8844'; cx.lineWidth = 2;
            for (var i = 0; i < floors.length - 1; i++) {
                var lx = w * 0.4 + (i % 2) * w * 0.25;
                cx.beginPath(); cx.moveTo(lx, floors[i] + 5); cx.lineTo(lx, floors[i + 1]); cx.stroke();
                cx.beginPath(); cx.moveTo(lx + 9, floors[i] + 5); cx.lineTo(lx + 9, floors[i + 1]); cx.stroke();
                for (var r = floors[i] + 10; r < floors[i + 1]; r += 8) { cx.beginPath(); cx.moveTo(lx, r); cx.lineTo(lx + 9, r); cx.stroke(); }
            }
            cx.restore();
            // ingredients with gradient fills and glow
            for (var i = 0; i < ingredients.length; i++) {
                var ing = ingredients[i];
                var baseY = floors[ing.floor] - 7;
                var bounce = Math.abs(Math.sin(t * 1.5 + i * 1.7)) * 5;
                cx.save();
                cx.shadowColor = ing.c1; cx.shadowBlur = 8;
                var ingGrad = cx.createLinearGradient(ing.x, baseY - bounce, ing.x, baseY - bounce + 8);
                ingGrad.addColorStop(0, ing.c1); ingGrad.addColorStop(1, ing.c2);
                cx.fillStyle = ingGrad;
                cx.fillRect(ing.x, baseY - bounce, 52, 7);
                // highlight on top
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(ing.x + 2, baseY - bounce, 48, 2);
                if (ing.label === 'bun') {
                    cx.fillStyle = ing.c1; cx.beginPath(); cx.arc(ing.x + 26, baseY - bounce - 2, 26, Math.PI, 0); cx.fill();
                    // sesame seeds
                    cx.fillStyle = '#ffeecc'; cx.fillRect(ing.x + 10, baseY - bounce - 8, 4, 2); cx.fillRect(ing.x + 22, baseY - bounce - 10, 4, 2); cx.fillRect(ing.x + 36, baseY - bounce - 7, 4, 2);
                }
                if (ing.label === 'let') {
                    // lettuce wavy edge
                    for (var lf = 0; lf < 6; lf++) { cx.fillStyle = '#44bb44'; cx.beginPath(); cx.arc(ing.x + 4 + lf * 8, baseY - bounce - 2, 5, Math.PI, 0); cx.fill(); }
                }
                if (ing.label === 'pat') {
                    // patty texture lines
                    cx.fillStyle = 'rgba(100,30,30,0.4)';
                    for (var pl = 0; pl < 5; pl++) cx.fillRect(ing.x + 4 + pl * 10, baseY - bounce + 2, 6, 1);
                }
                cx.restore();
            }
            // chef Peter Pepper - detailed
            var chefX = w * 0.35 + Math.sin(t * 2) * 40, chefY = floors[1] - 16;
            cx.save(); cx.shadowColor = '#ffffff'; cx.shadowBlur = 6;
            // chef hat (tall)
            cx.fillStyle = '#ffffff'; cx.fillRect(chefX - 5, chefY - 14, 10, 8);
            cx.fillStyle = '#eeeeee'; cx.fillRect(chefX - 6, chefY - 6, 12, 3);
            // head
            cx.fillStyle = '#ffccaa'; cx.fillRect(chefX - 4, chefY - 3, 8, 6);
            // eyes
            cx.fillStyle = '#000'; cx.fillRect(chefX - 2, chefY - 1, 2, 2); cx.fillRect(chefX + 2, chefY - 1, 2, 2);
            // body (white chef coat)
            cx.fillStyle = '#ffffff'; cx.fillRect(chefX - 5, chefY + 3, 10, 10);
            cx.fillStyle = '#dddddd'; cx.fillRect(chefX - 1, chefY + 4, 2, 8);
            // legs
            var chefWalk = Math.sin(t * 6) * 2;
            cx.fillStyle = '#333366'; cx.fillRect(chefX - 4, chefY + 13, 3, 5 + chefWalk); cx.fillRect(chefX + 1, chefY + 13, 3, 5 - chefWalk);
            cx.restore();
            // pepper spray particles
            if (Math.sin(t * 3) > 0.8) {
                for (var pp = 0; pp < 2; pp++) pepperParticles.push({x: chefX + 8, y: chefY + 4, vx: 2 + Math.random() * 2, vy: (Math.random() - 0.5) * 2, life: 1.0});
            }
            for (var pp2 = pepperParticles.length - 1; pp2 >= 0; pp2--) {
                var ppr = pepperParticles[pp2]; ppr.x += ppr.vx; ppr.y += ppr.vy; ppr.life -= 0.04;
                if (ppr.life <= 0) { pepperParticles.splice(pp2, 1); continue; }
                cx.save(); cx.globalAlpha = ppr.life * 0.7;
                cx.fillStyle = '#ffcc44'; cx.beginPath(); cx.arc(ppr.x, ppr.y, 2, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (pepperParticles.length > 25) pepperParticles.splice(0, 8);
            // enemy hot dog approaching
            var hdX = w * 0.75 + Math.cos(t * 1.8) * 30, hdY = floors[2] - 12;
            cx.fillStyle = '#cc6644'; cx.fillRect(hdX - 3, hdY, 6, 10);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(hdX, hdY - 2, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#fff'; cx.fillRect(hdX - 2, hdY - 3, 2, 2); cx.fillRect(hdX + 1, hdY - 3, 2, 2);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Ice Climber ──
    function animIceClimber(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var platforms = [];
        for (var i = 0; i < 7; i++) platforms.push({x: 10 + (i % 3) * 20, y: h - 30 - i * 28, w: w * 0.5 + Math.random() * w * 0.3});
        var icicles = [];
        for (var i = 0; i < 8; i++) icicles.push({x: 20 + Math.random() * (w - 40), y: -Math.random() * h * 0.5, speed: 0.5 + Math.random()});
        var iceShards = [];
        var snowflakes = [];
        for (var i = 0; i < 20; i++) snowflakes.push({x: Math.random() * w, y: Math.random() * h, size: 1 + Math.random() * 2, speed: 0.2 + Math.random() * 0.5});
        function draw() {
            t += 0.02;
            // icy gradient background
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0830'); bg.addColorStop(0.3, '#0c1040'); bg.addColorStop(0.7, '#0e1848'); bg.addColorStop(1, '#0a1030');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // subtle aurora effect at top
            cx.save(); cx.globalAlpha = 0.15;
            for (var au = 0; au < 3; au++) {
                var aColor = ['#44ffaa', '#44aaff', '#8844ff'][au];
                cx.fillStyle = aColor;
                cx.beginPath();
                for (var ax = 0; ax <= w; ax += 5) {
                    var ay = 20 + au * 12 + Math.sin(t * 0.5 + ax * 0.02 + au * 2) * 15;
                    if (ax === 0) cx.moveTo(ax, ay); else cx.lineTo(ax, ay);
                }
                cx.lineTo(w, 0); cx.lineTo(0, 0); cx.closePath(); cx.fill();
            }
            cx.restore();
            // snowflakes
            for (var sf = 0; sf < snowflakes.length; sf++) {
                var sn = snowflakes[sf]; sn.y += sn.speed; sn.x += Math.sin(t + sf * 0.7) * 0.3;
                if (sn.y > h) { sn.y = -5; sn.x = Math.random() * w; }
                cx.save(); cx.globalAlpha = 0.5 + Math.sin(t * 2 + sf) * 0.2;
                cx.fillStyle = '#ddeeff'; cx.beginPath(); cx.arc(sn.x, sn.y, sn.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            // ice platforms with crystalline effect
            for (var i = 0; i < platforms.length; i++) {
                var p = platforms[i];
                cx.save(); cx.shadowColor = '#88ddff'; cx.shadowBlur = 8;
                var iceGrad = cx.createLinearGradient(p.x, p.y, p.x, p.y + 8);
                iceGrad.addColorStop(0, '#aaddff'); iceGrad.addColorStop(0.5, '#77bbee'); iceGrad.addColorStop(1, '#5599cc');
                cx.fillStyle = iceGrad; cx.fillRect(p.x, p.y, p.w, 7);
                // ice shine
                cx.fillStyle = 'rgba(200,240,255,0.5)'; cx.fillRect(p.x + 2, p.y, p.w - 4, 2);
                // crystal sparkles on platform
                if (Math.sin(t * 3 + i * 1.5) > 0.7) {
                    cx.fillStyle = '#ffffff';
                    var spx = p.x + (Math.sin(t * 2 + i * 4) + 1) * 0.5 * p.w;
                    cx.fillRect(spx - 1, p.y - 2, 2, 2);
                }
                // ice block breaking effect with shards
                if (i > 0 && Math.sin(t * 2 + i) > 0.85) {
                    var bx = p.x + p.w * 0.5;
                    cx.fillStyle = 'rgba(200,240,255,0.6)';
                    cx.fillRect(bx - 5, p.y - 5, 10, 5);
                    // crack lines
                    cx.strokeStyle = 'rgba(255,255,255,0.6)'; cx.lineWidth = 1;
                    cx.beginPath(); cx.moveTo(bx, p.y - 3); cx.lineTo(bx - 6, p.y - 8); cx.stroke();
                    cx.beginPath(); cx.moveTo(bx, p.y - 3); cx.lineTo(bx + 5, p.y - 7); cx.stroke();
                }
                cx.restore();
            }
            // falling icicles with glow trail
            for (var i = 0; i < icicles.length; i++) {
                var ic = icicles[i]; ic.y += ic.speed;
                if (ic.y > h) { ic.y = -10; ic.x = 20 + Math.random() * (w - 40); }
                cx.save(); cx.shadowColor = '#88ccff'; cx.shadowBlur = 5;
                var icGrad = cx.createLinearGradient(ic.x, ic.y - 12, ic.x, ic.y);
                icGrad.addColorStop(0, 'rgba(180,220,255,0.3)'); icGrad.addColorStop(1, '#aaddff');
                cx.fillStyle = icGrad;
                cx.beginPath(); cx.moveTo(ic.x, ic.y); cx.lineTo(ic.x - 3, ic.y - 12); cx.lineTo(ic.x + 3, ic.y - 12); cx.closePath(); cx.fill();
                cx.restore();
            }
            // climber character - detailed Popo
            var cx2 = w * 0.4 + Math.sin(t * 1.8) * 30;
            var platIdx = Math.floor((Math.sin(t * 0.5) + 1) * 3);
            if (platIdx >= platforms.length) platIdx = platforms.length - 1;
            var cy2 = platforms[platIdx].y - 16 + Math.abs(Math.sin(t * 4)) * -12;
            cx.save(); cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
            // parka body
            var parkaGrad = cx.createLinearGradient(cx2 - 5, cy2 - 4, cx2 + 5, cy2 + 8);
            parkaGrad.addColorStop(0, '#5599ff'); parkaGrad.addColorStop(1, '#3366cc');
            cx.fillStyle = parkaGrad; cx.fillRect(cx2 - 5, cy2 - 4, 10, 12);
            // hood
            cx.fillStyle = '#88bbff'; cx.fillRect(cx2 - 4, cy2 - 12, 8, 4);
            // face
            cx.fillStyle = '#ffccaa'; cx.fillRect(cx2 - 3, cy2 - 8, 6, 5);
            // eyes
            cx.fillStyle = '#000'; cx.fillRect(cx2 - 2, cy2 - 7, 2, 2); cx.fillRect(cx2 + 1, cy2 - 7, 2, 2);
            // hammer with swing animation
            var hammerAngle = Math.sin(t * 6) * 0.5;
            cx.save(); cx.translate(cx2 + 6, cy2 - 4); cx.rotate(hammerAngle);
            cx.fillStyle = '#cc8844'; cx.fillRect(-1, -10, 3, 12);
            var hamGrad = cx.createLinearGradient(-3, -15, 5, -11);
            hamGrad.addColorStop(0, '#aaaaaa'); hamGrad.addColorStop(1, '#666666');
            cx.fillStyle = hamGrad; cx.fillRect(-3, -15, 8, 5);
            cx.restore();
            // legs with walk animation
            var legMove = Math.sin(t * 8) * 3;
            cx.fillStyle = '#3366cc'; cx.fillRect(cx2 - 4, cy2 + 8, 3, 5 + legMove); cx.fillRect(cx2 + 1, cy2 + 8, 3, 5 - legMove);
            cx.restore();
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,20,0.45)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Elevator Action ──
    function animElevatorAction(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var floors = 6, floorH = h / floors;
        var elevators = [{x: w * 0.3, y: 0, speed: 0.7}, {x: w * 0.7, y: h * 0.5, speed: -0.5}];
        var bulletSparks = [];
        function draw() {
            t += 0.02;
            // dark building interior gradient
            var bg = cx.createLinearGradient(0, 0, w, 0);
            bg.addColorStop(0, '#08081a'); bg.addColorStop(0.5, '#0c0c22'); bg.addColorStop(1, '#08081a');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // building structure with depth
            for (var i = 0; i < floors; i++) {
                var fy = i * floorH;
                // wall panels
                cx.fillStyle = '#1a1a30'; cx.fillRect(0, fy, w, floorH - 4);
                // decorative wall trim
                cx.fillStyle = '#222244'; cx.fillRect(0, fy + 2, w, 2);
                // floor with gradient
                var flGrad = cx.createLinearGradient(0, fy + floorH - 5, 0, fy + floorH);
                flGrad.addColorStop(0, '#444466'); flGrad.addColorStop(1, '#2a2a44');
                cx.fillStyle = flGrad; cx.fillRect(0, fy + floorH - 5, w, 5);
                // doors with glow - red doors are secret documents
                var doorPositions = [w * 0.1, w * 0.5, w * 0.85];
                for (var d = 0; d < doorPositions.length; d++) {
                    var isRed = (i + d) % 3 === 0;
                    cx.save();
                    if (isRed) { cx.shadowColor = '#ff4444'; cx.shadowBlur = 8; }
                    var doorGrad = cx.createLinearGradient(doorPositions[d], fy + floorH - 24, doorPositions[d] + 14, fy + floorH - 24);
                    doorGrad.addColorStop(0, isRed ? '#aa2222' : '#884422');
                    doorGrad.addColorStop(0.5, isRed ? '#cc3333' : '#aa5533');
                    doorGrad.addColorStop(1, isRed ? '#882222' : '#774422');
                    cx.fillStyle = doorGrad; cx.fillRect(doorPositions[d], fy + floorH - 24, 14, 20);
                    // door frame
                    cx.strokeStyle = isRed ? '#ff6666' : '#bb7744'; cx.lineWidth = 1;
                    cx.strokeRect(doorPositions[d], fy + floorH - 24, 14, 20);
                    // doorknob
                    cx.fillStyle = '#ffdd44';
                    cx.beginPath(); cx.arc(doorPositions[d] + 11, fy + floorH - 14, 1.5, 0, Math.PI * 2); cx.fill();
                    cx.restore();
                }
            }
            // elevator shafts with subtle glow
            cx.save(); cx.globalAlpha = 0.08;
            var shaftGrad1 = cx.createLinearGradient(w * 0.28, 0, w * 0.28 + 22, 0);
            shaftGrad1.addColorStop(0, '#4466aa'); shaftGrad1.addColorStop(0.5, '#6688cc'); shaftGrad1.addColorStop(1, '#4466aa');
            cx.fillStyle = shaftGrad1; cx.fillRect(w * 0.28, 0, 22, h);
            cx.fillStyle = shaftGrad1; cx.fillRect(w * 0.68, 0, 22, h);
            cx.restore();
            // shaft cables
            cx.strokeStyle = 'rgba(100,120,160,0.3)'; cx.lineWidth = 1;
            cx.setLineDash([4, 8]);
            cx.beginPath(); cx.moveTo(w * 0.29 + 10, 0); cx.lineTo(w * 0.29 + 10, h); cx.stroke();
            cx.beginPath(); cx.moveTo(w * 0.69 + 10, 0); cx.lineTo(w * 0.69 + 10, h); cx.stroke();
            cx.setLineDash([]);
            // elevators with metallic look
            for (var e = 0; e < elevators.length; e++) {
                var el = elevators[e];
                el.y += el.speed;
                if (el.y > h - 10) el.speed = -Math.abs(el.speed);
                if (el.y < 0) el.speed = Math.abs(el.speed);
                cx.save(); cx.shadowColor = '#6688cc'; cx.shadowBlur = 6;
                var elGrad = cx.createLinearGradient(el.x - 12, el.y, el.x + 12, el.y + 8);
                elGrad.addColorStop(0, '#8899bb'); elGrad.addColorStop(0.5, '#aabbdd'); elGrad.addColorStop(1, '#7788aa');
                cx.fillStyle = elGrad; cx.fillRect(el.x - 12, el.y, 24, 8);
                // elevator rail marks
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(el.x - 10, el.y, 20, 1);
                cx.restore();
            }
            // spy character on elevator - detailed
            var spy = elevators[0];
            cx.save(); cx.shadowColor = 'rgba(0,0,0,0.5)'; cx.shadowBlur = 4;
            // trench coat
            var coatGrad = cx.createLinearGradient(spy.x - 5, spy.y - 18, spy.x + 5, spy.y - 2);
            coatGrad.addColorStop(0, '#333333'); coatGrad.addColorStop(1, '#1a1a1a');
            cx.fillStyle = coatGrad; cx.fillRect(spy.x - 5, spy.y - 18, 10, 16);
            // coat collar
            cx.fillStyle = '#444444'; cx.fillRect(spy.x - 6, spy.y - 18, 12, 3);
            // head
            cx.fillStyle = '#ffccaa'; cx.fillRect(spy.x - 3, spy.y - 22, 6, 5);
            // fedora hat
            cx.fillStyle = '#222222'; cx.fillRect(spy.x - 5, spy.y - 25, 10, 4);
            cx.fillStyle = '#1a1a1a'; cx.fillRect(spy.x - 3, spy.y - 27, 6, 3);
            // gun arm
            if (Math.sin(t * 4) > 0.5) {
                cx.fillStyle = '#333'; cx.fillRect(spy.x + 5, spy.y - 14, 8, 2);
                cx.fillStyle = '#666'; cx.fillRect(spy.x + 11, spy.y - 15, 4, 4);
                // muzzle flash
                if (Math.sin(t * 12) > 0.8) {
                    cx.save(); cx.shadowColor = '#ffff44'; cx.shadowBlur = 10;
                    cx.fillStyle = '#ffff88'; cx.beginPath(); cx.arc(spy.x + 16, spy.y - 13, 3, 0, Math.PI * 2); cx.fill();
                    cx.restore();
                    bulletSparks.push({x: spy.x + 16, y: spy.y - 13, vx: 3, vy: (Math.random() - 0.5) * 2, life: 0.5});
                }
            }
            cx.restore();
            // bullet sparks
            for (var bs = bulletSparks.length - 1; bs >= 0; bs--) {
                var bsp = bulletSparks[bs]; bsp.x += bsp.vx; bsp.y += bsp.vy; bsp.life -= 0.05;
                if (bsp.life <= 0) { bulletSparks.splice(bs, 1); continue; }
                cx.save(); cx.globalAlpha = bsp.life; cx.fillStyle = '#ffff44';
                cx.fillRect(bsp.x, bsp.y, 2, 1); cx.restore();
            }
            if (bulletSparks.length > 15) bulletSparks.splice(0, 5);
            // enemy agent on another floor
            var enemyFloor = 2, efy = enemyFloor * floorH;
            var ex = w * 0.8 + Math.sin(t * 1.2) * 20;
            cx.fillStyle = '#555566'; cx.fillRect(ex - 4, efy + floorH - 22, 8, 14);
            cx.fillStyle = '#ffccaa'; cx.fillRect(ex - 3, efy + floorH - 26, 6, 5);
            cx.fillStyle = '#444455'; cx.fillRect(ex - 4, efy + floorH - 28, 8, 3);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Excitebike ──
    function animExcitebike(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var ramps = [{x:100,h:20},{x:220,h:30},{x:350,h:15},{x:480,h:25}];
        var bikes = [{x:w*0.5, c1:'#ff3333', c2:'#cc1111', phase:0},{x:w*0.3, c1:'#4488ff', c2:'#2266cc', phase:1.5},{x:w*0.7, c1:'#44cc44', c2:'#22aa22', phase:3}];
        var dirtParticles = [];
        function draw() {
            t += 0.02;
            var groundY = h * 0.72;
            var scrollX = t * 60;
            // sky gradient
            var skyGrad = cx.createLinearGradient(0, 0, 0, groundY);
            skyGrad.addColorStop(0, '#1a2a5a'); skyGrad.addColorStop(0.6, '#2a3a6a'); skyGrad.addColorStop(1, '#4a5a7a');
            cx.fillStyle = skyGrad; cx.fillRect(0, 0, w, groundY);
            // sun glow
            cx.save(); cx.shadowColor = '#ffaa44'; cx.shadowBlur = 30;
            var sunGrad = cx.createRadialGradient(w * 0.8, groundY * 0.3, 5, w * 0.8, groundY * 0.3, 40);
            sunGrad.addColorStop(0, 'rgba(255,200,100,0.8)'); sunGrad.addColorStop(0.5, 'rgba(255,150,50,0.2)'); sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = sunGrad; cx.fillRect(w * 0.6, 0, w * 0.4, groundY);
            cx.restore();
            // distant mountains
            cx.fillStyle = '#2a3050';
            cx.beginPath(); cx.moveTo(0, groundY);
            for (var mx = 0; mx <= w; mx += 20) cx.lineTo(mx, groundY - 30 - Math.sin(mx * 0.01) * 15 - Math.cos(mx * 0.02) * 10);
            cx.lineTo(w, groundY); cx.closePath(); cx.fill();
            // dirt track with gradient
            var trackGrad = cx.createLinearGradient(0, groundY, 0, h);
            trackGrad.addColorStop(0, '#9B7924'); trackGrad.addColorStop(0.3, '#8B6914'); trackGrad.addColorStop(1, '#6a5010');
            cx.fillStyle = trackGrad; cx.fillRect(0, groundY, w, h - groundY);
            // track lane lines
            cx.fillStyle = 'rgba(255,255,255,0.15)';
            cx.fillRect(0, groundY + 2, w, 1);
            cx.fillRect(0, groundY + (h - groundY) * 0.33, w, 1);
            cx.fillRect(0, groundY + (h - groundY) * 0.66, w, 1);
            // ramps (scrolling) with shadow
            for (var i = 0; i < ramps.length; i++) {
                var r = ramps[i];
                var rx = ((r.x - scrollX) % (w + 200)) + 50;
                if (rx < -50) rx += w + 200;
                // ramp shadow
                cx.fillStyle = 'rgba(0,0,0,0.3)';
                cx.beginPath(); cx.moveTo(rx + 3, groundY); cx.lineTo(rx + 33, groundY); cx.lineTo(rx + 23, groundY - r.h + 3); cx.closePath(); cx.fill();
                // ramp body
                var rampGrad = cx.createLinearGradient(rx, groundY, rx + 20, groundY - r.h);
                rampGrad.addColorStop(0, '#bb8822'); rampGrad.addColorStop(1, '#cc9933');
                cx.fillStyle = rampGrad;
                cx.beginPath(); cx.moveTo(rx, groundY); cx.lineTo(rx + 30, groundY); cx.lineTo(rx + 20, groundY - r.h); cx.closePath(); cx.fill();
                // ramp highlight
                cx.fillStyle = 'rgba(255,255,200,0.2)';
                cx.beginPath(); cx.moveTo(rx + 5, groundY - 1); cx.lineTo(rx + 25, groundY - 1); cx.lineTo(rx + 20, groundY - r.h); cx.closePath(); cx.fill();
            }
            // bikes with detailed rendering
            for (var b = 0; b < bikes.length; b++) {
                var bk = bikes[b];
                var bx = w * 0.3 + Math.sin(t * 1.5 + bk.phase) * 50;
                var by = groundY - 8 - Math.abs(Math.sin(t * 3 + bk.phase)) * 20;
                var tilt = Math.cos(t * 3 + bk.phase) * 0.15;
                cx.save(); cx.translate(bx, by); cx.rotate(tilt);
                // bike body with gradient
                var bikeGrad = cx.createLinearGradient(-10, -5, 10, 5);
                bikeGrad.addColorStop(0, bk.c1); bikeGrad.addColorStop(1, bk.c2);
                cx.fillStyle = bikeGrad; cx.fillRect(-10, -4, 20, 6);
                // exhaust pipe
                cx.fillStyle = '#666'; cx.fillRect(-14, 0, 5, 2);
                // wheels with spokes
                cx.fillStyle = '#222';
                cx.beginPath(); cx.arc(-7, 5, 5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(7, 5, 5, 0, Math.PI * 2); cx.fill();
                // wheel highlights
                cx.strokeStyle = '#555'; cx.lineWidth = 1;
                cx.beginPath(); cx.arc(-7, 5, 5, 0, Math.PI * 2); cx.stroke();
                cx.beginPath(); cx.arc(7, 5, 5, 0, Math.PI * 2); cx.stroke();
                // wheel hub
                cx.fillStyle = '#888'; cx.beginPath(); cx.arc(-7, 5, 1.5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(7, 5, 1.5, 0, Math.PI * 2); cx.fill();
                // rider
                cx.fillStyle = bk.c1; cx.fillRect(-3, -12, 6, 9);
                // helmet
                cx.fillStyle = bk.c2; cx.beginPath(); cx.arc(0, -14, 4, 0, Math.PI * 2); cx.fill();
                // visor
                cx.fillStyle = 'rgba(200,200,255,0.6)'; cx.fillRect(2, -15, 3, 3);
                cx.restore();
                // dirt spray when on ground
                if (Math.abs(Math.sin(t * 3 + bk.phase)) < 0.15) {
                    for (var dp = 0; dp < 2; dp++) dirtParticles.push({x: bx - 7, y: by + 8, vx: -1 - Math.random() * 2, vy: -1 - Math.random(), life: 0.6});
                }
            }
            // dirt particles
            for (var dp2 = dirtParticles.length - 1; dp2 >= 0; dp2--) {
                var dpr = dirtParticles[dp2]; dpr.x += dpr.vx; dpr.y += dpr.vy; dpr.vy += 0.1; dpr.life -= 0.03;
                if (dpr.life <= 0) { dirtParticles.splice(dp2, 1); continue; }
                cx.save(); cx.globalAlpha = dpr.life;
                cx.fillStyle = '#8B6914'; cx.beginPath(); cx.arc(dpr.x, dpr.y, 2, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (dirtParticles.length > 30) dirtParticles.splice(0, 8);
            // speed lines effect
            cx.save(); cx.globalAlpha = 0.1;
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 1;
            for (var sl = 0; sl < 5; sl++) {
                var slx = ((sl * 80 + t * 200) % w);
                cx.beginPath(); cx.moveTo(slx, groundY + 5); cx.lineTo(slx - 15, groundY + 5); cx.stroke();
            }
            cx.restore();
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.35)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Kung-Fu Master ──
    function animKungFuMaster(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var enemies = [];
        for (var i = 0; i < 4; i++) enemies.push({x: Math.random() * w, side: Math.random() < 0.5 ? -1 : 1, alive: true, timer: Math.random() * 3});
        var hitSparks = [];
        function draw() {
            t += 0.02;
            // temple hallway gradient
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#1a0808'); bg.addColorStop(0.15, '#2a1208'); bg.addColorStop(0.8, '#2a1a0a'); bg.addColorStop(1, '#1a0a04');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // ornate ceiling with pattern
            var ceilGrad = cx.createLinearGradient(0, 0, 0, h * 0.15);
            ceilGrad.addColorStop(0, '#553322'); ceilGrad.addColorStop(1, '#443322');
            cx.fillStyle = ceilGrad; cx.fillRect(0, 0, w, h * 0.15);
            // ceiling decorative border
            cx.fillStyle = '#776644';
            cx.fillRect(0, h * 0.14, w, 3);
            cx.fillStyle = '#998866';
            for (var cd = 0; cd < w; cd += 16) cx.fillRect(cd, h * 0.12, 8, 3);
            // wall with scrolling pattern
            cx.fillStyle = '#332211';
            for (var wx2 = 0; wx2 < w; wx2 += 30) {
                cx.fillRect(wx2, h * 0.15, 1, h * 0.63);
                // wall hanging scrolls
                if (wx2 % 90 === 0) {
                    cx.fillStyle = '#554433'; cx.fillRect(wx2 + 8, h * 0.2, 14, 24);
                    cx.fillStyle = '#cc9966'; cx.fillRect(wx2 + 10, h * 0.21, 10, 2);
                    cx.fillStyle = '#332211';
                }
            }
            // ornate floor
            var floorGrad = cx.createLinearGradient(0, h * 0.78, 0, h);
            floorGrad.addColorStop(0, '#665544'); floorGrad.addColorStop(0.1, '#776655'); floorGrad.addColorStop(1, '#554433');
            cx.fillStyle = floorGrad; cx.fillRect(0, h * 0.78, w, h * 0.22);
            cx.fillStyle = '#887766'; cx.fillRect(0, h * 0.78, w, 3);
            // floor pattern
            cx.fillStyle = 'rgba(0,0,0,0.1)';
            for (var fp = 0; fp < w; fp += 20) cx.fillRect(fp, h * 0.8, 10, h * 0.2);
            // health bar with glow
            cx.save(); cx.shadowColor = '#ff3333'; cx.shadowBlur = 6;
            cx.fillStyle = '#222'; cx.fillRect(10, 8, w - 20, 8);
            cx.strokeStyle = '#555'; cx.lineWidth = 1; cx.strokeRect(10, 8, w - 20, 8);
            var healthW = (w - 20) * (0.7 + 0.3 * Math.sin(t * 0.5));
            var hpGrad = cx.createLinearGradient(10, 8, 10, 16);
            hpGrad.addColorStop(0, '#ff5555'); hpGrad.addColorStop(1, '#cc2222');
            cx.fillStyle = hpGrad; cx.fillRect(10, 8, healthW, 8);
            cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.fillRect(10, 8, healthW, 3);
            cx.restore();
            // hero Thomas - martial arts pose
            var hx = w * 0.5 + Math.sin(t * 1.5) * 30, hy = h * 0.78 - 24;
            cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 8;
            // red gi body
            var giGrad = cx.createLinearGradient(hx - 6, hy, hx + 6, hy + 16);
            giGrad.addColorStop(0, '#ff4444'); giGrad.addColorStop(1, '#cc2222');
            cx.fillStyle = giGrad; cx.fillRect(hx - 6, hy, 12, 16);
            // belt
            cx.fillStyle = '#222'; cx.fillRect(hx - 6, hy + 8, 12, 2);
            // head
            cx.fillStyle = '#ffccaa'; cx.fillRect(hx - 4, hy - 8, 8, 8);
            // hair
            cx.fillStyle = '#333'; cx.fillRect(hx - 4, hy - 10, 8, 3);
            // eyes
            cx.fillStyle = '#000'; cx.fillRect(hx - 2, hy - 5, 2, 2); cx.fillRect(hx + 2, hy - 5, 2, 2);
            // dynamic attack animation
            var punch = Math.sin(t * 6);
            if (punch > 0.5) {
                // flying punch with trail
                cx.fillStyle = '#ffccaa'; cx.fillRect(hx + 6, hy + 2, 14, 4);
                cx.save(); cx.globalAlpha = 0.3; cx.fillStyle = '#ff6644';
                cx.fillRect(hx + 6, hy + 1, 14, 6); cx.restore();
                // impact effect
                if (punch > 0.8) hitSparks.push({x: hx + 20, y: hy + 4, vx: 2 + Math.random() * 3, vy: (Math.random() - 0.5) * 4, life: 0.5});
            } else if (punch < -0.5) {
                // roundhouse kick with motion blur
                cx.fillStyle = '#ff3333'; cx.fillRect(hx + 6, hy + 12, 16, 4);
                cx.save(); cx.globalAlpha = 0.3; cx.fillStyle = '#ff6644';
                cx.fillRect(hx + 6, hy + 11, 16, 6); cx.restore();
            }
            // legs
            var legAnim = Math.sin(t * 8) * 2;
            cx.fillStyle = '#cc2222'; cx.fillRect(hx - 5, hy + 16, 4, 6 + legAnim); cx.fillRect(hx + 1, hy + 16, 4, 6 - legAnim);
            cx.restore();
            // hit sparks
            for (var hs = hitSparks.length - 1; hs >= 0; hs--) {
                var hsp = hitSparks[hs]; hsp.x += hsp.vx; hsp.y += hsp.vy; hsp.life -= 0.06;
                if (hsp.life <= 0) { hitSparks.splice(hs, 1); continue; }
                cx.save(); cx.globalAlpha = hsp.life; cx.shadowColor = '#ffff44'; cx.shadowBlur = 4;
                cx.fillStyle = hsp.life > 0.3 ? '#ffff44' : '#ff8844';
                cx.fillRect(hsp.x, hsp.y, 3, 2); cx.restore();
            }
            if (hitSparks.length > 20) hitSparks.splice(0, 8);
            // enemies with variety
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                e.x += e.side * 0.5;
                if (e.x > w + 20 || e.x < -20) { e.x = e.side < 0 ? w + 10 : -10; }
                var ey = h * 0.78 - 20;
                // enemy body
                cx.fillStyle = '#886644'; cx.fillRect(e.x - 4, ey, 8, 14);
                cx.fillStyle = '#ffccaa'; cx.fillRect(e.x - 3, ey - 7, 6, 7);
                // enemy attack pose
                if (Math.abs(e.x - hx) < 50) {
                    cx.fillStyle = '#ffccaa'; cx.fillRect(e.x + e.side * 4, ey + 3, e.side * 8, 3);
                }
            }
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Double Dragon ──
    function animDoubleDragon(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var impactParticles = [];
        function draw() {
            t += 0.02;
            // night city gradient
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#06061a'); bg.addColorStop(0.4, '#0a0a24'); bg.addColorStop(1, '#0e0e1e');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // city skyline buildings with lit windows
            var buildings = [{x:5,w:45,h:h*0.55},{x:55,w:35,h:h*0.45},{x:w-55,w:50,h:h*0.6},{x:w-110,w:40,h:h*0.5}];
            for (var bi = 0; bi < buildings.length; bi++) {
                var bld = buildings[bi];
                var bldGrad = cx.createLinearGradient(bld.x, h - bld.h, bld.x + bld.w, h);
                bldGrad.addColorStop(0, '#1a1a33'); bldGrad.addColorStop(1, '#111125');
                cx.fillStyle = bldGrad; cx.fillRect(bld.x, h * 0.8 - bld.h + h * 0.2, bld.w, bld.h);
                // windows that flicker
                for (var bwx = 0; bwx < Math.floor(bld.w / 12); bwx++) {
                    for (var bwy = 0; bwy < Math.floor(bld.h / 16); bwy++) {
                        if (Math.sin(bwx * 3.7 + bwy * 7.1 + t * 0.3 + bi) > -0.1) {
                            var wBright = 0.4 + Math.sin(t * 0.5 + bwx + bwy * 3 + bi * 2) * 0.3;
                            cx.save(); cx.globalAlpha = wBright;
                            cx.fillStyle = '#ffcc44';
                            cx.fillRect(bld.x + 4 + bwx * 12, h * 0.8 - bld.h + h * 0.2 + 5 + bwy * 16, 6, 9);
                            cx.restore();
                        }
                    }
                }
            }
            // street with wet reflection
            var streetGrad = cx.createLinearGradient(0, h * 0.78, 0, h);
            streetGrad.addColorStop(0, '#333348'); streetGrad.addColorStop(0.1, '#2a2a3e'); streetGrad.addColorStop(1, '#222234');
            cx.fillStyle = streetGrad; cx.fillRect(0, h * 0.78, w, h * 0.22);
            // wet street reflections
            cx.save(); cx.globalAlpha = 0.08;
            for (var ref = 0; ref < w; ref += 3) {
                var refH = 2 + Math.random() * 4;
                cx.fillStyle = '#ffcc44'; cx.fillRect(ref, h * 0.82 + Math.random() * (h * 0.15), 1, refH);
            }
            cx.restore();
            // street lamps with light cones
            var lampPositions = [30, w - 35];
            for (var lp = 0; lp < lampPositions.length; lp++) {
                var lpx = lampPositions[lp];
                cx.fillStyle = '#555566'; cx.fillRect(lpx, h * 0.38, 3, h * 0.42);
                // lamp glow
                cx.save(); cx.shadowColor = '#ffee88'; cx.shadowBlur = 20;
                cx.fillStyle = '#ffee88'; cx.beginPath(); cx.arc(lpx + 1, h * 0.38, 5, 0, Math.PI * 2); cx.fill();
                cx.restore();
                // light cone
                var cone = cx.createRadialGradient(lpx + 1, h * 0.38, 3, lpx + 1, h * 0.55, 50);
                cone.addColorStop(0, 'rgba(255,238,136,0.15)'); cone.addColorStop(1, 'rgba(0,0,0,0)');
                cx.fillStyle = cone; cx.beginPath();
                cx.moveTo(lpx - 2, h * 0.38); cx.lineTo(lpx - 30, h * 0.78); cx.lineTo(lpx + 34, h * 0.78); cx.lineTo(lpx + 4, h * 0.38);
                cx.closePath(); cx.fill();
            }
            // fighter 1 Billy Lee (blue) - detailed
            var f1x = w * 0.35 + Math.sin(t * 1.5) * 12, f1y = h * 0.78 - 22;
            cx.save(); cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
            // body
            var f1Grad = cx.createLinearGradient(f1x - 6, f1y, f1x + 6, f1y + 16);
            f1Grad.addColorStop(0, '#5599ff'); f1Grad.addColorStop(1, '#3366cc');
            cx.fillStyle = f1Grad; cx.fillRect(f1x - 6, f1y, 12, 16);
            // head and hair
            cx.fillStyle = '#ffccaa'; cx.fillRect(f1x - 4, f1y - 8, 8, 8);
            cx.fillStyle = '#8B4513'; cx.fillRect(f1x - 4, f1y - 10, 8, 3);
            cx.restore();
            // fighter 2 Jimmy Lee (red) - detailed
            var f2x = w * 0.65 - Math.sin(t * 1.5) * 12, f2y = h * 0.78 - 22;
            cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 8;
            var f2Grad = cx.createLinearGradient(f2x - 6, f2y, f2x + 6, f2y + 16);
            f2Grad.addColorStop(0, '#ff5555'); f2Grad.addColorStop(1, '#cc2222');
            cx.fillStyle = f2Grad; cx.fillRect(f2x - 6, f2y, 12, 16);
            cx.fillStyle = '#ffccaa'; cx.fillRect(f2x - 4, f2y - 8, 8, 8);
            cx.fillStyle = '#8B4513'; cx.fillRect(f2x - 4, f2y - 10, 8, 3);
            cx.restore();
            // combat animations
            var att = Math.sin(t * 5);
            if (att > 0.3) {
                cx.fillStyle = '#ffccaa'; cx.fillRect(f1x + 6, f1y + 3, 12, 4);
                cx.save(); cx.globalAlpha = 0.4; cx.fillStyle = '#88bbff'; cx.fillRect(f1x + 6, f1y + 2, 12, 6); cx.restore();
            }
            if (att < -0.3) {
                cx.fillStyle = '#ff4444'; cx.fillRect(f2x - 18, f2y + 10, 14, 4);
                cx.save(); cx.globalAlpha = 0.4; cx.fillStyle = '#ff6666'; cx.fillRect(f2x - 18, f2y + 9, 14, 6); cx.restore();
            }
            // impact sparks and particles
            if (Math.abs(att) > 0.7) {
                var sx = (f1x + f2x) / 2, sy = f1y + 5;
                for (var imp = 0; imp < 2; imp++) impactParticles.push({x: sx, y: sy, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 0.5});
                // "POW" flash
                cx.save(); cx.shadowColor = '#ffff44'; cx.shadowBlur = 15; cx.globalAlpha = Math.abs(att) - 0.5;
                cx.fillStyle = '#ffff88'; cx.beginPath(); cx.arc(sx, sy, 8, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            for (var ip = impactParticles.length - 1; ip >= 0; ip--) {
                var ipr = impactParticles[ip]; ipr.x += ipr.vx; ipr.y += ipr.vy; ipr.life -= 0.04;
                if (ipr.life <= 0) { impactParticles.splice(ip, 1); continue; }
                cx.save(); cx.globalAlpha = ipr.life; cx.fillStyle = ipr.life > 0.3 ? '#ffff44' : '#ff8844';
                cx.fillRect(ipr.x, ipr.y, 2, 2); cx.restore();
            }
            if (impactParticles.length > 25) impactParticles.splice(0, 8);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pengo ──
    function animPengo(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, cs = 18;
        var cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var blocks = [];
        for (var r = 1; r < rows - 1; r++) for (var c = 1; c < cols - 1; c++) {
            if (Math.random() < 0.35) blocks.push({r: r, c: c, alive: true});
        }
        var enemies = [{r:2,c:2},{r:rows-3,c:cols-3}];
        var pushTimer = 0;
        var shatterParticles = [];
        function draw() {
            t += 0.02;
            // deep blue ice rink gradient
            var bg = cx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
            bg.addColorStop(0, '#0c0c3a'); bg.addColorStop(1, '#060620');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // ice rink surface shimmer
            cx.save(); cx.globalAlpha = 0.04;
            for (var sx2 = 0; sx2 < w; sx2 += 8) {
                for (var sy2 = 0; sy2 < h; sy2 += 8) {
                    if (Math.sin(sx2 * 0.1 + sy2 * 0.1 + t) > 0.7) {
                        cx.fillStyle = '#88aaff'; cx.fillRect(sx2, sy2, 4, 4);
                    }
                }
            }
            cx.restore();
            // glowing border
            cx.save(); cx.shadowColor = '#4466cc'; cx.shadowBlur = 10;
            cx.strokeStyle = '#5577bb'; cx.lineWidth = 2; cx.strokeRect(2, 2, w - 4, h - 4);
            cx.restore();
            // ice blocks with crystal effect
            for (var i = 0; i < blocks.length; i++) {
                if (!blocks[i].alive) continue;
                var bx = blocks[i].c * cs, by = blocks[i].r * cs;
                // block with gradient
                var blkGrad = cx.createLinearGradient(bx, by, bx + cs, by + cs);
                blkGrad.addColorStop(0, '#99ddff'); blkGrad.addColorStop(0.5, '#77bbee'); blkGrad.addColorStop(1, '#5599cc');
                cx.fillStyle = blkGrad; cx.fillRect(bx + 1, by + 1, cs - 2, cs - 2);
                // ice shine
                cx.fillStyle = 'rgba(200,240,255,0.5)'; cx.fillRect(bx + 2, by + 2, cs - 6, 2);
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(bx + 2, by + 2, 2, cs - 6);
                // crystalline pattern
                cx.strokeStyle = 'rgba(200,230,255,0.2)'; cx.lineWidth = 0.5;
                cx.beginPath(); cx.moveTo(bx + 3, by + cs - 3); cx.lineTo(bx + cs - 3, by + 3); cx.stroke();
            }
            // push a block periodically + shatter effect
            pushTimer += 0.02;
            if (pushTimer > 3) {
                pushTimer = 0;
                if (blocks.length > 3) {
                    var ri = Math.floor(Math.random() * blocks.length);
                    blocks[ri].c += (Math.random() < 0.5 ? 1 : -1);
                    // spawn shatter particles
                    for (var sp4 = 0; sp4 < 4; sp4++) shatterParticles.push({
                        x: blocks[ri].c * cs + cs / 2, y: blocks[ri].r * cs + cs / 2,
                        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 0.8
                    });
                }
            }
            // shatter particles
            for (var sp5 = shatterParticles.length - 1; sp5 >= 0; sp5--) {
                var spr = shatterParticles[sp5]; spr.x += spr.vx; spr.y += spr.vy; spr.life -= 0.03;
                if (spr.life <= 0) { shatterParticles.splice(sp5, 1); continue; }
                cx.save(); cx.globalAlpha = spr.life; cx.shadowColor = '#88ddff'; cx.shadowBlur = 4;
                cx.fillStyle = '#aaddff'; cx.fillRect(spr.x - 2, spr.y - 2, 4, 3);
                cx.restore();
            }
            if (shatterParticles.length > 20) shatterParticles.splice(0, 5);
            // enemies (Sno-Bees) with glow
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                e.r += Math.sin(t * 2 + i * 2) * 0.02;
                e.c += Math.cos(t * 1.5 + i * 3) * 0.02;
                var ex = e.c * cs + cs / 2, ey = e.r * cs + cs / 2;
                cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 10;
                // body
                cx.fillStyle = '#ff4444';
                cx.beginPath(); cx.arc(ex, ey, cs * 0.38, 0, Math.PI * 2); cx.fill();
                // inner glow
                cx.fillStyle = '#ff8888';
                cx.beginPath(); cx.arc(ex - 1, ey - 1, cs * 0.2, 0, Math.PI * 2); cx.fill();
                // angry eyes
                cx.fillStyle = '#fff'; cx.fillRect(ex - 4, ey - 3, 3, 3); cx.fillRect(ex + 1, ey - 3, 3, 3);
                cx.fillStyle = '#000'; cx.fillRect(ex - 3, ey - 2, 2, 2); cx.fillRect(ex + 2, ey - 2, 2, 2);
                cx.restore();
            }
            // Pengo penguin - detailed
            var pr = rows - 2 + Math.sin(t * 1.5) * 0.3, pc = Math.floor(cols / 2) + Math.sin(t * 0.8) * 2;
            var px = pc * cs + cs / 2, py = pr * cs + cs / 2;
            cx.save(); cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
            // body
            cx.fillStyle = '#2244aa';
            cx.beginPath(); cx.ellipse(px, py, cs * 0.42, cs * 0.45, 0, 0, Math.PI * 2); cx.fill();
            // white belly
            cx.fillStyle = '#eeeeff';
            cx.beginPath(); cx.ellipse(px, py + 2, cs * 0.25, cs * 0.3, 0, 0, Math.PI * 2); cx.fill();
            // face
            cx.fillStyle = '#fff'; cx.fillRect(px - 3, py - 5, 3, 3); cx.fillRect(px + 1, py - 5, 3, 3);
            cx.fillStyle = '#000'; cx.fillRect(px - 2, py - 4, 2, 2); cx.fillRect(px + 2, py - 4, 2, 2);
            // beak
            cx.fillStyle = '#ff8800';
            cx.beginPath(); cx.moveTo(px, py - 1); cx.lineTo(px - 3, py + 3); cx.lineTo(px + 3, py + 3); cx.closePath(); cx.fill();
            // flippers with waddle
            var waddle = Math.sin(t * 6) * 3;
            cx.fillStyle = '#2244aa';
            cx.fillRect(px - cs * 0.45, py - 2, 4, 8 + waddle);
            cx.fillRect(px + cs * 0.42 - 3, py - 2, 4, 8 - waddle);
            cx.restore();
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,20,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Rally-X ──
    function animRallyX(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var walls = [];
        for (var i = 0; i < 12; i++) walls.push({x: Math.random() * (w - 40) + 20, y: Math.random() * (h - 60) + 10, w: 20 + Math.random() * 40, h: 4});
        for (var i = 0; i < 8; i++) walls.push({x: Math.random() * (w - 20) + 10, y: Math.random() * (h - 60) + 10, w: 4, h: 20 + Math.random() * 30});
        var flags = [];
        for (var i = 0; i < 5; i++) flags.push({x: 30 + Math.random() * (w - 60), y: 20 + Math.random() * (h - 70), collected: false});
        var enemies = [{x:w*0.8,y:h*0.3},{x:w*0.2,y:h*0.7}];
        var smokeTrail = [];
        function draw() {
            t += 0.02;
            // dark gradient background
            var bg = cx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, '#0a0a1a'); bg.addColorStop(1, '#080818');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // road grid with subtle color
            for (var rx = 0; rx < w; rx += 30) {
                var roadGrad = cx.createLinearGradient(rx, 0, rx + 20, 0);
                roadGrad.addColorStop(0, '#1a1a30'); roadGrad.addColorStop(0.5, '#222240'); roadGrad.addColorStop(1, '#1a1a30');
                cx.fillStyle = roadGrad; cx.fillRect(rx, 0, 20, h);
            }
            for (var ry = 0; ry < h; ry += 30) {
                var roadGrad2 = cx.createLinearGradient(0, ry, 0, ry + 20);
                roadGrad2.addColorStop(0, '#1a1a30'); roadGrad2.addColorStop(0.5, '#222240'); roadGrad2.addColorStop(1, '#1a1a30');
                cx.fillStyle = roadGrad2; cx.fillRect(0, ry, w, 20);
            }
            // maze walls with glow
            cx.save(); cx.shadowColor = '#4444cc'; cx.shadowBlur = 6;
            for (var i = 0; i < walls.length; i++) {
                var wl = walls[i];
                var wallGrad = cx.createLinearGradient(wl.x, wl.y, wl.x + wl.w, wl.y + wl.h);
                wallGrad.addColorStop(0, '#5555bb'); wallGrad.addColorStop(1, '#3333aa');
                cx.fillStyle = wallGrad; cx.fillRect(wl.x, wl.y, wl.w, wl.h);
            }
            cx.restore();
            // flags with glow and wave
            for (var i = 0; i < flags.length; i++) {
                var f = flags[i];
                cx.save(); cx.shadowColor = '#ffcc00'; cx.shadowBlur = 8;
                // flag pole
                cx.fillStyle = '#ff6644'; cx.fillRect(f.x, f.y, 2, 10);
                // waving flag
                var wave = Math.sin(t * 4 + i * 2) * 2;
                cx.fillStyle = '#ffdd00';
                cx.beginPath(); cx.moveTo(f.x + 2, f.y); cx.lineTo(f.x + 10 + wave, f.y + 1); cx.lineTo(f.x + 9 + wave, f.y + 6); cx.lineTo(f.x + 2, f.y + 5); cx.closePath(); cx.fill();
                cx.restore();
            }
            // player car (blue, top-down) - detailed
            var px = w * 0.5 + Math.sin(t * 1.2) * 55, py = h * 0.5 + Math.cos(t * 0.9) * 40;
            var carAngle = Math.atan2(Math.cos(t * 0.9) * -0.9 * 40, Math.cos(t * 1.2) * 1.2 * 55);
            cx.save(); cx.translate(px, py); cx.rotate(carAngle + Math.PI / 2);
            cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
            // car body
            var carGrad = cx.createLinearGradient(-5, -8, 5, 8);
            carGrad.addColorStop(0, '#5599ff'); carGrad.addColorStop(1, '#3366cc');
            cx.fillStyle = carGrad; cx.fillRect(-5, -8, 10, 16);
            // windshield
            cx.fillStyle = '#88ccff'; cx.fillRect(-3, -5, 6, 4);
            // tail lights
            cx.fillStyle = '#ff4444'; cx.fillRect(-4, 6, 3, 2); cx.fillRect(1, 6, 3, 2);
            cx.restore();
            // smoke trail behind player
            smokeTrail.push({x: px - Math.sin(carAngle) * 8, y: py + Math.cos(carAngle) * 8, life: 1.0, size: 2});
            for (var st = smokeTrail.length - 1; st >= 0; st--) {
                var sm = smokeTrail[st]; sm.life -= 0.02; sm.size += 0.05;
                if (sm.life <= 0) { smokeTrail.splice(st, 1); continue; }
                cx.save(); cx.globalAlpha = sm.life * 0.4;
                cx.fillStyle = '#cccccc'; cx.beginPath(); cx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (smokeTrail.length > 30) smokeTrail.splice(0, 8);
            // enemy cars (red) with glow
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                e.x += Math.sin(t * 2 + i * 4) * 0.6; e.y += Math.cos(t * 1.5 + i * 3) * 0.6;
                cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 6;
                cx.fillStyle = '#ff3333'; cx.fillRect(e.x - 4, e.y - 6, 8, 12);
                cx.fillStyle = '#ff8888'; cx.fillRect(e.x - 2, e.y - 3, 4, 4);
                cx.restore();
            }
            // radar minimap with glow
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 6;
            cx.fillStyle = 'rgba(0,40,0,0.8)'; cx.fillRect(w - 38, h - 33, 34, 29);
            cx.strokeStyle = '#44ff44'; cx.lineWidth = 1; cx.strokeRect(w - 38, h - 33, 34, 29);
            // radar dots
            cx.fillStyle = '#44ff44'; cx.fillRect(w - 38 + (px / w) * 32, h - 33 + (py / h) * 27, 3, 3);
            cx.fillStyle = '#ff4444';
            for (var i = 0; i < enemies.length; i++) cx.fillRect(w - 38 + (enemies[i].x / w) * 32, h - 33 + (enemies[i].y / h) * 27, 2, 2);
            cx.fillStyle = '#ffcc00';
            for (var i = 0; i < flags.length; i++) cx.fillRect(w - 38 + (flags[i].x / w) * 32, h - 33 + (flags[i].y / h) * 27, 2, 2);
            cx.restore();
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.45)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Time Pilot ──
    function animTimePilot(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var clouds = [];
        for (var i = 0; i < 6; i++) clouds.push({x: Math.random() * w, y: Math.random() * h, size: 15 + Math.random() * 20});
        var bullets = [], enemies = [], explosions = [];
        for (var i = 0; i < 5; i++) enemies.push({angle: i * Math.PI * 2 / 5, dist: 80 + Math.random() * 30, speed: 0.5 + Math.random() * 0.5, alive: true});
        function draw() {
            t += 0.02;
            // beautiful sky gradient
            var skyGrad = cx.createRadialGradient(w * 0.5, h * 0.4, 30, w * 0.5, h * 0.5, w * 0.8);
            skyGrad.addColorStop(0, '#2255aa'); skyGrad.addColorStop(0.5, '#1a4488'); skyGrad.addColorStop(1, '#0c2255');
            cx.fillStyle = skyGrad; cx.fillRect(0, 0, w, h);
            // drifting clouds with depth
            for (var i = 0; i < clouds.length; i++) {
                var cl = clouds[i]; cl.y += 0.3; cl.x -= 0.2;
                if (cl.y > h + 30) { cl.y = -30; cl.x = Math.random() * w; }
                if (cl.x < -40) cl.x = w + 30;
                cx.save(); cx.globalAlpha = 0.25;
                cx.shadowColor = '#ffffff'; cx.shadowBlur = 10;
                var cloudGrad = cx.createRadialGradient(cl.x, cl.y, cl.size * 0.3, cl.x, cl.y, cl.size);
                cloudGrad.addColorStop(0, 'rgba(255,255,255,0.4)'); cloudGrad.addColorStop(1, 'rgba(200,220,255,0.05)');
                cx.fillStyle = cloudGrad;
                cx.beginPath(); cx.arc(cl.x, cl.y, cl.size, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(cl.x + cl.size * 0.5, cl.y - 4, cl.size * 0.7, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(cl.x - cl.size * 0.3, cl.y + 2, cl.size * 0.6, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            // player plane in center (rotates) - detailed
            var pa = t * 1.5;
            var pcx2 = w * 0.5, pcy2 = h * 0.5;
            cx.save(); cx.translate(pcx2, pcy2); cx.rotate(pa);
            cx.shadowColor = '#44ff44'; cx.shadowBlur = 10;
            // fuselage with gradient
            var fuseGrad = cx.createLinearGradient(-14, 0, 14, 0);
            fuseGrad.addColorStop(0, '#33aa33'); fuseGrad.addColorStop(0.5, '#55dd55'); fuseGrad.addColorStop(1, '#33aa33');
            cx.fillStyle = fuseGrad; cx.fillRect(-14, -3, 28, 6);
            // cockpit
            cx.fillStyle = 'rgba(200,255,200,0.6)'; cx.fillRect(-2, -2, 6, 4);
            // wings
            cx.fillStyle = '#44cc44'; cx.fillRect(-8, -10, 16, 4); cx.fillRect(-8, 6, 16, 4);
            // nose
            cx.fillStyle = '#ffcc00'; cx.fillRect(12, -2, 5, 4);
            // engine glow
            cx.fillStyle = 'rgba(255,150,50,0.6)'; cx.fillRect(-18, -1, 4 + Math.sin(t * 20) * 2, 2);
            cx.restore();
            // bullets with glow
            if (Math.random() < 0.08) bullets.push({x: pcx2 + Math.cos(pa) * 16, y: pcy2 + Math.sin(pa) * 16, dx: Math.cos(pa) * 5, dy: Math.sin(pa) * 5, life: 1});
            cx.save(); cx.shadowColor = '#ffff44'; cx.shadowBlur = 4;
            cx.fillStyle = '#ffff44';
            for (var b = bullets.length - 1; b >= 0; b--) {
                bullets[b].x += bullets[b].dx; bullets[b].y += bullets[b].dy; bullets[b].life -= 0.01;
                cx.globalAlpha = bullets[b].life;
                cx.fillRect(bullets[b].x - 1, bullets[b].y - 1, 3, 3);
                if (bullets[b].x < -5 || bullets[b].x > w + 5 || bullets[b].y < -5 || bullets[b].y > h + 5 || bullets[b].life <= 0) bullets.splice(b, 1);
            }
            cx.restore();
            if (bullets.length > 20) bullets.splice(0, 5);
            // enemy planes with detail
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                e.angle += 0.015 * e.speed;
                var ex = pcx2 + Math.cos(e.angle) * e.dist, ey = pcy2 + Math.sin(e.angle) * e.dist;
                if (ex > 0 && ex < w && ey > 0 && ey < h) {
                    var eAngle = e.angle + Math.PI;
                    cx.save(); cx.translate(ex, ey); cx.rotate(eAngle);
                    cx.shadowColor = '#ff4444'; cx.shadowBlur = 6;
                    cx.fillStyle = '#ff3333'; cx.fillRect(-8, -2, 16, 4);
                    cx.fillRect(-4, -6, 8, 3); cx.fillRect(-4, 3, 8, 3);
                    cx.fillStyle = '#ff8888'; cx.fillRect(-2, -1, 4, 2);
                    cx.restore();
                }
            }
            // explosion effects
            for (var exp = explosions.length - 1; exp >= 0; exp--) {
                var ex2 = explosions[exp]; ex2.life -= 0.03;
                if (ex2.life <= 0) { explosions.splice(exp, 1); continue; }
                cx.save(); cx.globalAlpha = ex2.life; cx.shadowColor = '#ff8844'; cx.shadowBlur = 15;
                cx.fillStyle = ex2.life > 0.5 ? '#ffdd44' : '#ff6622';
                cx.beginPath(); cx.arc(ex2.x, ex2.y, (1 - ex2.life) * 15, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            // spawn random explosion for visual flair
            if (Math.random() < 0.005) {
                var ea = Math.random() * Math.PI * 2, ed = 60 + Math.random() * 40;
                explosions.push({x: pcx2 + Math.cos(ea) * ed, y: pcy2 + Math.sin(ea) * ed, life: 1});
            }
            if (explosions.length > 5) explosions.splice(0, 2);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,30,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Phoenix ──
    function animPhoenix(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var birds = [];
        for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) birds.push({x: c * 40 + 30, y: r * 25 + 25, alive: true, phase: c * 0.3 + r * 1.5});
        var bullets = [];
        var starField = [];
        for (var i = 0; i < 40; i++) starField.push({x: Math.random() * w, y: Math.random() * h, size: 0.5 + Math.random() * 1.5, twinkle: Math.random() * 6});
        var fireParticles2 = [];
        function draw() {
            t += 0.02;
            // deep space gradient
            var bg = cx.createRadialGradient(w / 2, h * 0.3, 20, w / 2, h / 2, w * 0.8);
            bg.addColorStop(0, '#1a0015'); bg.addColorStop(0.5, '#0a0010'); bg.addColorStop(1, '#050008');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // starfield with twinkling
            for (var s = 0; s < starField.length; s++) {
                var star = starField[s];
                var twink = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + star.twinkle));
                cx.save(); cx.globalAlpha = twink;
                var starColors = ['#ff8844', '#ffaa66', '#ffcc88', '#ffffff', '#ffddaa'];
                cx.fillStyle = starColors[s % starColors.length];
                cx.beginPath(); cx.arc(star.x, star.y, star.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            // mothership at top with pulsing shield
            cx.save();
            var shieldPulse = 0.3 + Math.sin(t * 2) * 0.15;
            cx.shadowColor = '#ff6600'; cx.shadowBlur = 15;
            // shield glow
            cx.save(); cx.globalAlpha = shieldPulse;
            var shieldGrad = cx.createRadialGradient(w * 0.5, 12, 10, w * 0.5, 12, w * 0.25);
            shieldGrad.addColorStop(0, 'rgba(255,100,0,0.3)'); shieldGrad.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = shieldGrad; cx.fillRect(w * 0.25, 0, w * 0.5, 30);
            cx.restore();
            // mothership body
            var msGrad = cx.createLinearGradient(w * 0.3, 4, w * 0.7, 22);
            msGrad.addColorStop(0, '#ff8833'); msGrad.addColorStop(0.5, '#ff6600'); msGrad.addColorStop(1, '#cc4400');
            cx.fillStyle = msGrad; cx.fillRect(w * 0.3, 8, w * 0.4, 12);
            cx.fillStyle = '#ffaa55'; cx.fillRect(w * 0.35, 4, w * 0.3, 6);
            // mothership windows with glow
            cx.fillStyle = '#ffdd88';
            cx.fillRect(w * 0.42, 10, 8, 5); cx.fillRect(w * 0.52, 10, 8, 5);
            // mothership bottom details
            cx.fillStyle = '#cc5500';
            cx.fillRect(w * 0.38, 18, 4, 3); cx.fillRect(w * 0.48, 18, 4, 3); cx.fillRect(w * 0.58, 18, 4, 3);
            cx.restore();
            // phoenix bird enemies - fiery with particle trails
            var shiftX = Math.sin(t * 1.5) * 30;
            for (var i = 0; i < birds.length; i++) {
                var b = birds[i]; if (!b.alive) continue;
                var bx = b.x + shiftX, by = b.y + Math.sin(t * 0.8) * 8;
                var flap = Math.sin(t * 6 + b.phase) * 10;
                var isDiving = Math.sin(t * 0.7 + b.phase) > 0.85;
                if (isDiving) by += 25;
                cx.save(); cx.shadowColor = '#ff4400'; cx.shadowBlur = 8;
                // wing glow trail
                if (isDiving) {
                    fireParticles2.push({x: bx, y: by + 3, vx: (Math.random() - 0.5) * 1, vy: -0.5, life: 0.6});
                }
                // bird body with gradient
                var birdGrad = cx.createRadialGradient(bx, by, 1, bx, by, 8);
                birdGrad.addColorStop(0, '#ffcc00'); birdGrad.addColorStop(1, '#ff4400');
                cx.fillStyle = birdGrad; cx.fillRect(bx - 3, by - 2, 6, 5);
                // wings
                cx.strokeStyle = '#ff6600'; cx.lineWidth = 2.5;
                cx.beginPath(); cx.moveTo(bx - 12, by - flap); cx.lineTo(bx - 3, by); cx.stroke();
                cx.beginPath(); cx.moveTo(bx + 3, by); cx.lineTo(bx + 12, by - flap); cx.stroke();
                // wingtips with fire color
                cx.strokeStyle = '#ffaa00'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.moveTo(bx - 12, by - flap); cx.lineTo(bx - 14, by - flap - 2); cx.stroke();
                cx.beginPath(); cx.moveTo(bx + 12, by - flap); cx.lineTo(bx + 14, by - flap - 2); cx.stroke();
                // eyes
                cx.fillStyle = '#fff'; cx.fillRect(bx - 1, by - 2, 2, 2);
                cx.restore();
            }
            // fire particles from diving birds
            for (var fp2 = fireParticles2.length - 1; fp2 >= 0; fp2--) {
                var fpr = fireParticles2[fp2]; fpr.x += fpr.vx; fpr.y += fpr.vy; fpr.life -= 0.03;
                if (fpr.life <= 0) { fireParticles2.splice(fp2, 1); continue; }
                cx.save(); cx.globalAlpha = fpr.life;
                cx.fillStyle = fpr.life > 0.3 ? '#ff8844' : '#ff4400';
                cx.beginPath(); cx.arc(fpr.x, fpr.y, 1.5 + fpr.life * 2, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (fireParticles2.length > 30) fireParticles2.splice(0, 8);
            // player ship with engine glow
            var px = w / 2 + Math.sin(t * 1.2) * 55;
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 12;
            // ship body
            var shipGrad = cx.createLinearGradient(px - 10, h - 30, px + 10, h - 18);
            shipGrad.addColorStop(0, '#33bb33'); shipGrad.addColorStop(0.5, '#55ee55'); shipGrad.addColorStop(1, '#33bb33');
            cx.fillStyle = shipGrad;
            cx.beginPath(); cx.moveTo(px, h - 32); cx.lineTo(px - 12, h - 18); cx.lineTo(px + 12, h - 18); cx.closePath(); cx.fill();
            // cockpit
            cx.fillStyle = 'rgba(150,255,150,0.5)'; cx.fillRect(px - 2, h - 26, 4, 4);
            // engine flames
            cx.fillStyle = 'rgba(255,150,50,0.7)';
            cx.fillRect(px - 3, h - 17, 2, 3 + Math.random() * 3);
            cx.fillRect(px + 1, h - 17, 2, 3 + Math.random() * 3);
            cx.restore();
            // auto-fire bullets with glow
            if (Math.random() < 0.06) bullets.push({x: px, y: h - 32});
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 4;
            cx.fillStyle = '#44ff44';
            for (var b2 = bullets.length - 1; b2 >= 0; b2--) { bullets[b2].y -= 4; cx.fillRect(bullets[b2].x - 1, bullets[b2].y, 2, 6); if (bullets[b2].y < 0) bullets.splice(b2, 1); }
            cx.restore();
            if (bullets.length > 15) bullets.splice(0, 5);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(10,0,15,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Moon Patrol ──
    function animMoonPatrol(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var craters = [{x:80,w:25},{x:200,w:30},{x:350,w:20},{x:500,w:35}];
        var rocks = [];
        var starField2 = [];
        for (var i = 0; i < 35; i++) starField2.push({x: Math.random() * w, y: Math.random() * h * 0.5, size: 0.5 + Math.random() * 1.5, phase: Math.random() * 6});
        var dustTrail = [];
        function draw() {
            t += 0.02;
            // deep space gradient
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#050820'); bg.addColorStop(0.3, '#0a1030'); bg.addColorStop(0.6, '#0c1235'); bg.addColorStop(1, '#1a1a30');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            // twinkling stars
            for (var s = 0; s < starField2.length; s++) {
                var star = starField2[s];
                var twink = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.5 + star.phase));
                cx.save(); cx.globalAlpha = twink;
                cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(star.x, star.y, star.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            // Earth in sky
            cx.save(); cx.shadowColor = '#4488ff'; cx.shadowBlur = 20;
            var earthGrad = cx.createRadialGradient(w * 0.8, h * 0.15, 2, w * 0.8, h * 0.15, 18);
            earthGrad.addColorStop(0, '#4488cc'); earthGrad.addColorStop(0.5, '#2266aa'); earthGrad.addColorStop(1, '#114477');
            cx.fillStyle = earthGrad; cx.beginPath(); cx.arc(w * 0.8, h * 0.15, 18, 0, Math.PI * 2); cx.fill();
            // land masses
            cx.fillStyle = '#33aa55'; cx.fillRect(w * 0.8 - 6, h * 0.15 - 4, 8, 5);
            cx.fillRect(w * 0.8 + 3, h * 0.15 + 3, 5, 4);
            cx.restore();
            // layered mountains background with parallax
            for (var ml = 0; ml < 3; ml++) {
                var mAlpha = 0.15 + ml * 0.1;
                var mColors = ['#1a1040', '#1e1545', '#22184a'];
                cx.save(); cx.globalAlpha = 1;
                cx.fillStyle = mColors[ml];
                cx.beginPath(); cx.moveTo(0, h * 0.55 + ml * 8);
                for (var mx = 0; mx <= w; mx += 10) {
                    var my = h * (0.48 - ml * 0.04) - Math.sin(mx * (0.012 + ml * 0.005) + ml * 2) * (18 - ml * 3) - Math.cos(mx * (0.02 + ml * 0.003)) * (12 - ml * 2);
                    cx.lineTo(mx, my);
                }
                cx.lineTo(w, h * 0.6); cx.lineTo(0, h * 0.6); cx.closePath(); cx.fill();
                cx.restore();
            }
            // lunar surface with gradient
            var groundY = h * 0.75;
            var surfGrad = cx.createLinearGradient(0, groundY, 0, h);
            surfGrad.addColorStop(0, '#666677'); surfGrad.addColorStop(0.1, '#555566'); surfGrad.addColorStop(1, '#444455');
            cx.fillStyle = surfGrad; cx.fillRect(0, groundY, w, h - groundY);
            // surface detail line
            cx.fillStyle = '#777788'; cx.fillRect(0, groundY, w, 2);
            // surface texture
            cx.save(); cx.globalAlpha = 0.1;
            for (var tex = 0; tex < w; tex += 6) {
                if (Math.sin(tex * 0.3) > 0.5) cx.fillRect(tex, groundY + 3, 3, 2);
            }
            cx.restore();
            // craters (scrolling) with shadow
            var scrollX = t * 40;
            for (var i = 0; i < craters.length; i++) {
                var cr = craters[i];
                var cxp = ((cr.x - scrollX) % (w + 100) + w + 100) % (w + 100) - 50;
                // crater shadow
                cx.fillStyle = '#333344';
                cx.beginPath(); cx.ellipse(cxp, groundY + 4, cr.w / 2, 7, 0, 0, Math.PI * 2); cx.fill();
                // crater rim highlight
                cx.strokeStyle = 'rgba(150,150,170,0.3)'; cx.lineWidth = 1;
                cx.beginPath(); cx.ellipse(cxp, groundY + 3, cr.w / 2 + 2, 4, 0, Math.PI, Math.PI * 2); cx.stroke();
            }
            // falling rocks with glow
            if (Math.random() < 0.03) rocks.push({x: Math.random() * w, y: 0, speed: 1.5 + Math.random() * 2, size: 3 + Math.random() * 3});
            for (var r = rocks.length - 1; r >= 0; r--) {
                rocks[r].y += rocks[r].speed; rocks[r].x += 0.5;
                cx.save(); cx.shadowColor = '#ff6644'; cx.shadowBlur = 6;
                cx.fillStyle = '#998888'; cx.beginPath(); cx.arc(rocks[r].x, rocks[r].y, rocks[r].size, 0, Math.PI * 2); cx.fill();
                // hot trail
                cx.save(); cx.globalAlpha = 0.4; cx.fillStyle = '#ff4422';
                cx.beginPath(); cx.moveTo(rocks[r].x - 1, rocks[r].y - rocks[r].size); cx.lineTo(rocks[r].x - 3, rocks[r].y - rocks[r].size - 8); cx.lineTo(rocks[r].x + 3, rocks[r].y - rocks[r].size - 6); cx.closePath(); cx.fill();
                cx.restore();
                cx.restore();
                if (rocks[r].y > h) rocks.splice(r, 1);
            }
            if (rocks.length > 15) rocks.splice(0, 5);
            // moon buggy - detailed
            var bx = w * 0.3 + Math.sin(t * 1.5) * 25, by = groundY - 10;
            var jump = Math.abs(Math.sin(t * 3)) * 14;
            by -= jump;
            cx.save(); cx.shadowColor = '#aaaaff'; cx.shadowBlur = 8;
            // buggy body with gradient
            var bugGrad = cx.createLinearGradient(bx - 14, by - 8, bx + 14, by + 4);
            bugGrad.addColorStop(0, '#bbbbdd'); bugGrad.addColorStop(0.5, '#aaaacc'); bugGrad.addColorStop(1, '#8888aa');
            cx.fillStyle = bugGrad; cx.fillRect(bx - 14, by - 6, 28, 8);
            // cabin with windshield
            cx.fillStyle = '#9999bb'; cx.fillRect(bx - 9, by - 12, 18, 7);
            cx.fillStyle = 'rgba(150,200,255,0.4)'; cx.fillRect(bx - 7, by - 11, 6, 5);
            // antenna
            cx.strokeStyle = '#ccccee'; cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(bx + 6, by - 12); cx.lineTo(bx + 10, by - 18); cx.stroke();
            cx.fillStyle = '#ff4444'; cx.beginPath(); cx.arc(bx + 10, by - 18, 1.5, 0, Math.PI * 2); cx.fill();
            // wheels with spokes
            cx.fillStyle = '#555577';
            cx.beginPath(); cx.arc(bx - 9, by + 4, 5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(bx + 9, by + 4, 5, 0, Math.PI * 2); cx.fill();
            // wheel hubs
            cx.fillStyle = '#8888aa';
            cx.beginPath(); cx.arc(bx - 9, by + 4, 2, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(bx + 9, by + 4, 2, 0, Math.PI * 2); cx.fill();
            // wheel rotation lines
            cx.strokeStyle = '#777799'; cx.lineWidth = 1;
            var wheelRot = t * 8;
            cx.beginPath(); cx.moveTo(bx - 9 + Math.cos(wheelRot) * 4, by + 4 + Math.sin(wheelRot) * 4);
            cx.lineTo(bx - 9 - Math.cos(wheelRot) * 4, by + 4 - Math.sin(wheelRot) * 4); cx.stroke();
            cx.restore();
            // dust trail behind buggy
            if (jump < 3) {
                dustTrail.push({x: bx - 10, y: groundY - 2, vx: -1 - Math.random(), vy: -0.5 - Math.random(), life: 0.7, size: 2});
            }
            for (var dt = dustTrail.length - 1; dt >= 0; dt--) {
                var d = dustTrail[dt]; d.x += d.vx; d.y += d.vy; d.size += 0.1; d.life -= 0.02;
                if (d.life <= 0) { dustTrail.splice(dt, 1); continue; }
                cx.save(); cx.globalAlpha = d.life * 0.4;
                cx.fillStyle = '#888899'; cx.beginPath(); cx.arc(d.x, d.y, d.size, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (dustTrail.length > 25) dustTrail.splice(0, 8);
            // buggy shooting upward
            if (Math.sin(t * 4) > 0.9) {
                cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 4;
                cx.fillStyle = '#44ff44'; cx.fillRect(bx - 1, by - 18, 2, 8);
                cx.restore();
            }
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,15,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Scramble ──
    function animScramble(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bullets = [], missiles = [];
        var exhaustParticles = [];
        var explosionFx = [];
        function draw() {
            t += 0.02;
            // space/cave gradient
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#040818'); bg.addColorStop(0.5, '#080c20'); bg.addColorStop(1, '#0a0a14');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var scrollX = t * 30;
            // stars in the gap between cave walls
            cx.save(); cx.globalAlpha = 0.3;
            for (var st2 = 0; st2 < 15; st2++) {
                var stx = (st2 * 53 + 17) % w, sty = (st2 * 37 + 11) % (h * 0.6) + h * 0.15;
                cx.fillStyle = '#ffffff'; cx.fillRect(stx, sty, 1, 1);
            }
            cx.restore();
            // cave ceiling with gradient and detail
            var ceilGrad = cx.createLinearGradient(0, 0, 0, 50);
            ceilGrad.addColorStop(0, '#2a4422'); ceilGrad.addColorStop(1, '#1a3015');
            cx.fillStyle = ceilGrad;
            cx.beginPath(); cx.moveTo(0, 0);
            for (var x = 0; x <= w; x += 6) {
                var ceilingY = 22 + Math.sin((x + scrollX) * 0.03) * 16 + Math.cos((x + scrollX) * 0.05) * 11;
                cx.lineTo(x, ceilingY);
            }
            cx.lineTo(w, 0); cx.closePath(); cx.fill();
            // ceiling stalactites
            cx.fillStyle = '#334425';
            for (var sc = 0; sc < w; sc += 20) {
                var scY = 22 + Math.sin((sc + scrollX) * 0.03) * 16 + Math.cos((sc + scrollX) * 0.05) * 11;
                cx.beginPath(); cx.moveTo(sc, scY); cx.lineTo(sc - 3, scY + 8); cx.lineTo(sc + 3, scY + 8); cx.closePath(); cx.fill();
            }
            // cave floor with gradient
            var floorGrad = cx.createLinearGradient(0, h - 50, 0, h);
            floorGrad.addColorStop(0, '#3a2818'); floorGrad.addColorStop(1, '#554433');
            cx.fillStyle = floorGrad;
            cx.beginPath(); cx.moveTo(0, h);
            for (var x2 = 0; x2 <= w; x2 += 6) {
                var floorY = h - 22 - Math.sin((x2 + scrollX) * 0.025) * 16 - Math.cos((x2 + scrollX) * 0.04) * 13;
                cx.lineTo(x2, floorY);
            }
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            // floor stalagmites
            cx.fillStyle = '#4a3520';
            for (var sg = 10; sg < w; sg += 25) {
                var sgY = h - 22 - Math.sin((sg + scrollX) * 0.025) * 16 - Math.cos((sg + scrollX) * 0.04) * 13;
                cx.beginPath(); cx.moveTo(sg, sgY); cx.lineTo(sg - 4, sgY - 10); cx.lineTo(sg + 4, sgY - 10); cx.closePath(); cx.fill();
            }
            // fuel tanks on ground with glow
            for (var i = 0; i < 3; i++) {
                var fx = ((i * 120 + 60 - scrollX) % (w + 80) + w + 80) % (w + 80) - 40;
                var fy = h - 27 - Math.sin((fx + scrollX) * 0.025) * 16;
                cx.save(); cx.shadowColor = '#ff4444'; cx.shadowBlur = 8;
                // tank body
                var tankGrad = cx.createLinearGradient(fx - 6, fy - 10, fx + 6, fy);
                tankGrad.addColorStop(0, '#ff5555'); tankGrad.addColorStop(1, '#cc2222');
                cx.fillStyle = tankGrad; cx.fillRect(fx - 6, fy - 10, 12, 10);
                // tank label
                cx.fillStyle = '#ffdd44'; cx.fillRect(fx - 4, fy - 8, 8, 3);
                // tank cap
                cx.fillStyle = '#ff8888'; cx.fillRect(fx - 2, fy - 12, 4, 3);
                cx.restore();
            }
            // spacecraft - detailed with engine effects
            var sx = w * 0.25, sy = h * 0.45 + Math.sin(t * 2) * 22;
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 10;
            // ship body with gradient
            var shipGrad2 = cx.createLinearGradient(sx - 10, sy - 6, sx + 14, sy + 6);
            shipGrad2.addColorStop(0, '#33aa33'); shipGrad2.addColorStop(0.5, '#55dd55'); shipGrad2.addColorStop(1, '#33aa33');
            cx.fillStyle = shipGrad2;
            cx.beginPath(); cx.moveTo(sx + 14, sy); cx.lineTo(sx - 10, sy - 6); cx.lineTo(sx - 6, sy); cx.lineTo(sx - 10, sy + 6); cx.closePath(); cx.fill();
            // cockpit
            cx.fillStyle = 'rgba(150,255,150,0.5)'; cx.fillRect(sx + 4, sy - 2, 5, 4);
            // wing stripes
            cx.fillStyle = '#44bb44'; cx.fillRect(sx - 6, sy - 6, 10, 1); cx.fillRect(sx - 6, sy + 5, 10, 1);
            cx.restore();
            // exhaust flame with particles
            var exLen = 6 + Math.random() * 8;
            cx.save(); cx.shadowColor = '#ff6600'; cx.shadowBlur = 8;
            var exGrad = cx.createLinearGradient(sx - 10, sy, sx - 10 - exLen, sy);
            exGrad.addColorStop(0, '#ffcc44'); exGrad.addColorStop(0.5, '#ff6600'); exGrad.addColorStop(1, 'rgba(255,50,0,0)');
            cx.fillStyle = exGrad;
            cx.beginPath(); cx.moveTo(sx - 10, sy - 3); cx.lineTo(sx - 10 - exLen, sy); cx.lineTo(sx - 10, sy + 3); cx.closePath(); cx.fill();
            cx.restore();
            // exhaust particles
            if (Math.random() < 0.3) exhaustParticles.push({x: sx - 14, y: sy + (Math.random() - 0.5) * 4, vx: -2 - Math.random() * 2, vy: (Math.random() - 0.5), life: 0.6});
            for (var ep = exhaustParticles.length - 1; ep >= 0; ep--) {
                var epr = exhaustParticles[ep]; epr.x += epr.vx; epr.y += epr.vy; epr.life -= 0.03;
                if (epr.life <= 0) { exhaustParticles.splice(ep, 1); continue; }
                cx.save(); cx.globalAlpha = epr.life;
                cx.fillStyle = epr.life > 0.3 ? '#ff8844' : '#ff4400';
                cx.beginPath(); cx.arc(epr.x, epr.y, 1.5, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (exhaustParticles.length > 20) exhaustParticles.splice(0, 5);
            // forward laser with glow
            if (Math.random() < 0.06) bullets.push({x: sx + 14, y: sy});
            cx.save(); cx.shadowColor = '#44ff44'; cx.shadowBlur = 4;
            cx.fillStyle = '#44ff44';
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].x += 5; cx.fillRect(bullets[b].x, bullets[b].y - 1, 8, 2); if (bullets[b].x > w) bullets.splice(b, 1); }
            cx.restore();
            // downward missiles with trail
            if (Math.random() < 0.03) missiles.push({x: sx, y: sy + 6});
            cx.save(); cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4;
            cx.fillStyle = '#ffcc00';
            for (var m = missiles.length - 1; m >= 0; m--) {
                missiles[m].y += 3; missiles[m].x += 1.5;
                cx.fillRect(missiles[m].x - 1, missiles[m].y, 3, 6);
                // missile trail
                cx.save(); cx.globalAlpha = 0.3; cx.fillStyle = '#ff8844';
                cx.fillRect(missiles[m].x - 1, missiles[m].y - 4, 2, 4); cx.restore();
                if (missiles[m].y > h) missiles.splice(m, 1);
            }
            cx.restore();
            if (bullets.length > 10) bullets.splice(0, 3);
            if (missiles.length > 8) missiles.splice(0, 3);
            // random explosion effects
            if (Math.random() < 0.008) explosionFx.push({x: w * 0.5 + Math.random() * w * 0.4, y: h * 0.3 + Math.random() * h * 0.4, life: 1.0});
            for (var ef = explosionFx.length - 1; ef >= 0; ef--) {
                var efr = explosionFx[ef]; efr.life -= 0.03;
                if (efr.life <= 0) { explosionFx.splice(ef, 1); continue; }
                cx.save(); cx.globalAlpha = efr.life; cx.shadowColor = '#ff8844'; cx.shadowBlur = 12;
                var expR = (1 - efr.life) * 12;
                cx.fillStyle = efr.life > 0.5 ? '#ffdd44' : '#ff6622';
                cx.beginPath(); cx.arc(efr.x, efr.y, expR, 0, Math.PI * 2); cx.fill();
                cx.restore();
            }
            if (explosionFx.length > 4) explosionFx.splice(0, 2);
            // vignette
            var vig = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Robotron 2084 ──
    function animRobotron(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var enemies = [];
        for (var i = 0; i < 20; i++) enemies.push({x: Math.random() * w, y: Math.random() * h, c: ['#ff00ff','#00ffff','#ffcc00','#ff4444','#44ff44'][Math.floor(Math.random() * 5)], speed: 0.3 + Math.random() * 0.7});
        var bullets = [];
        function draw() {
            t += 0.02;
            cx.fillStyle = '#050510'; cx.fillRect(0, 0, w, h);
            // border
            cx.strokeStyle = '#330066'; cx.lineWidth = 2; cx.strokeRect(2, 2, w - 4, h - 4);
            var pcx = w * 0.5 + Math.sin(t * 1.5) * 30, pcy = h * 0.5 + Math.cos(t * 1.2) * 20;
            // enemies swarm toward player
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                var dx = pcx - e.x, dy = pcy - e.y;
                var dist = Math.sqrt(dx * dx + dy * dy) || 1;
                e.x += (dx / dist) * e.speed * 0.5;
                e.y += (dy / dist) * e.speed * 0.5;
                // bounce off edges
                if (e.x < 5) e.x = 5; if (e.x > w - 5) e.x = w - 5;
                if (e.y < 5) e.y = 5; if (e.y > h - 5) e.y = h - 5;
                // repel if too close
                if (dist < 30) { e.x = Math.random() * w; e.y = Math.random() * h; }
                cx.fillStyle = e.c;
                cx.fillRect(e.x - 3, e.y - 3, 6, 6);
                // glow
                cx.shadowColor = e.c; cx.shadowBlur = 4;
                cx.fillRect(e.x - 2, e.y - 2, 4, 4);
                cx.shadowBlur = 0;
            }
            // player dot
            cx.fillStyle = '#ffffff';
            cx.shadowColor = '#ffffff'; cx.shadowBlur = 6;
            cx.fillRect(pcx - 4, pcy - 4, 8, 8);
            cx.shadowBlur = 0;
            // 8-way bullets
            if (Math.random() < 0.1) {
                var ba = Math.random() * Math.PI * 2;
                bullets.push({x: pcx, y: pcy, dx: Math.cos(ba) * 5, dy: Math.sin(ba) * 5});
            }
            cx.fillStyle = '#ffffff';
            for (var b = bullets.length - 1; b >= 0; b--) {
                bullets[b].x += bullets[b].dx; bullets[b].y += bullets[b].dy;
                cx.fillRect(bullets[b].x - 1, bullets[b].y - 1, 2, 2);
                if (bullets[b].x < 0 || bullets[b].x > w || bullets[b].y < 0 || bullets[b].y > h) bullets.splice(b, 1);
            }
            if (bullets.length > 25) bullets.splice(0, 8);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Gauntlet ──
    function animGauntlet(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, cs = 16;
        var cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var walls = [];
        // create dungeon walls (border + some interior)
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
            if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) walls.push({r:r,c:c});
            else if (Math.random() < 0.15 && !(r > rows/2-2 && r < rows/2+2 && c > cols/2-2 && c < cols/2+2)) walls.push({r:r,c:c});
        }
        var heroes = [
            {r:rows*0.4,c:cols*0.3,color:'#ff3333',dr:0.02,dc:0.03},   // warrior
            {r:rows*0.6,c:cols*0.7,color:'#44cc44',dr:-0.03,dc:0.02},  // elf
            {r:rows*0.3,c:cols*0.6,color:'#4488ff',dr:0.025,dc:-0.02}, // wizard
            {r:rows*0.7,c:cols*0.4,color:'#ffcc00',dr:-0.02,dc:-0.03}  // valkyrie
        ];
        var ghosts = [];
        for (var i = 0; i < 6; i++) ghosts.push({r: 2 + Math.random() * (rows - 4), c: 2 + Math.random() * (cols - 4), phase: Math.random() * 6});
        function draw() {
            t += 0.02;
            cx.fillStyle = '#0a0a0a'; cx.fillRect(0, 0, w, h);
            // floor tiles
            cx.fillStyle = '#1a1a22';
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
                cx.fillRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
            }
            // walls (stone)
            for (var i = 0; i < walls.length; i++) {
                var wl = walls[i];
                cx.fillStyle = '#555566'; cx.fillRect(wl.c * cs, wl.r * cs, cs, cs);
                cx.fillStyle = '#444455'; cx.fillRect(wl.c * cs + 1, wl.r * cs + 1, cs - 2, cs / 2 - 1);
            }
            // ghost generators (pulsing)
            cx.fillStyle = 'rgba(100,0,100,' + (0.3 + 0.2 * Math.sin(t * 3)) + ')';
            cx.fillRect(3 * cs, 3 * cs, cs, cs); cx.fillRect((cols - 4) * cs, (rows - 4) * cs, cs, cs);
            // heroes
            for (var i = 0; i < heroes.length; i++) {
                var h2 = heroes[i];
                h2.r += Math.sin(t * 2 + i) * h2.dr; h2.c += Math.cos(t * 1.8 + i * 2) * h2.dc;
                cx.fillStyle = h2.color;
                cx.beginPath(); cx.arc(h2.c * cs + cs / 2, h2.r * cs + cs / 2, cs * 0.35, 0, Math.PI * 2); cx.fill();
            }
            // ghosts
            for (var i = 0; i < ghosts.length; i++) {
                var g = ghosts[i];
                g.r += Math.sin(t * 1.5 + g.phase) * 0.03; g.c += Math.cos(t * 1.3 + g.phase) * 0.03;
                cx.fillStyle = 'rgba(180,180,255,0.4)';
                cx.beginPath(); cx.arc(g.c * cs + cs / 2, g.r * cs + cs / 2, cs * 0.3, 0, Math.PI * 2); cx.fill();
                // ghost bottom wave
                for (var gw = -2; gw <= 2; gw++) {
                    cx.fillRect(g.c * cs + cs / 2 + gw * 3 - 1, g.r * cs + cs / 2 + cs * 0.2, 2, 3 + Math.sin(t * 5 + gw) * 2);
                }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Ghosts 'N Goblins ──
    function animGhostsNGoblins(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var tombstones = [];
        for (var i = 0; i < 5; i++) tombstones.push({x: 20 + i * (w - 40) / 5 + Math.random() * 15, h: 12 + Math.random() * 10});
        var zombieY = 0;
        function draw() {
            t += 0.02;
            cx.fillStyle = '#0a0812'; cx.fillRect(0, 0, w, h);
            // moon
            cx.fillStyle = '#ccccaa'; cx.beginPath(); cx.arc(w * 0.8, h * 0.15, 14, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#0a0812'; cx.beginPath(); cx.arc(w * 0.8 + 5, h * 0.15 - 3, 12, 0, Math.PI * 2); cx.fill(); // crescent
            // moonlight glow
            cx.fillStyle = 'rgba(200,200,170,0.03)';
            cx.beginPath(); cx.arc(w * 0.8, h * 0.15, 50, 0, Math.PI * 2); cx.fill();
            // bare trees silhouette
            cx.fillStyle = '#1a1020';
            cx.fillRect(w * 0.1, h * 0.3, 4, h * 0.5);
            cx.beginPath(); cx.moveTo(w * 0.1 + 2, h * 0.3); cx.lineTo(w * 0.1 - 12, h * 0.2); cx.lineTo(w * 0.1 - 8, h * 0.3); cx.fill();
            cx.beginPath(); cx.moveTo(w * 0.1 + 2, h * 0.35); cx.lineTo(w * 0.1 + 16, h * 0.25); cx.lineTo(w * 0.1 + 10, h * 0.35); cx.fill();
            cx.fillRect(w * 0.85, h * 0.25, 4, h * 0.55);
            cx.beginPath(); cx.moveTo(w * 0.85 + 2, h * 0.25); cx.lineTo(w * 0.85 + 15, h * 0.18); cx.lineTo(w * 0.85 + 10, h * 0.27); cx.fill();
            // ground
            var groundY = h * 0.78;
            cx.fillStyle = '#2a1a22'; cx.fillRect(0, groundY, w, h - groundY);
            cx.fillStyle = '#3a2a32'; cx.fillRect(0, groundY, w, 3);
            // tombstones
            cx.fillStyle = '#555566';
            for (var i = 0; i < tombstones.length; i++) {
                var ts = tombstones[i];
                cx.fillRect(ts.x - 6, groundY - ts.h, 12, ts.h);
                cx.beginPath(); cx.arc(ts.x, groundY - ts.h, 6, Math.PI, 0); cx.fill();
                // cross detail
                cx.fillStyle = '#444455'; cx.fillRect(ts.x - 1, groundY - ts.h + 2, 2, 6);
                cx.fillRect(ts.x - 3, groundY - ts.h + 4, 6, 2); cx.fillStyle = '#555566';
            }
            // knight in armor running
            var kx = w * 0.35 + (t * 30) % (w * 0.5), ky = groundY - 16;
            var legSwing = Math.sin(t * 10) * 4;
            cx.fillStyle = '#cccccc'; cx.fillRect(kx - 4, ky, 8, 10); // armor body
            cx.fillStyle = '#aaaaaa'; cx.fillRect(kx - 3, ky - 6, 6, 6); // head/helmet
            cx.fillStyle = '#cccccc'; cx.fillRect(kx - 5, ky + 10, 3, 5 + legSwing); cx.fillRect(kx + 2, ky + 10, 3, 5 - legSwing); // legs
            // lance
            cx.fillStyle = '#888888'; cx.fillRect(kx + 5, ky - 2, 14, 2);
            // zombie rising from ground
            zombieY = Math.abs(Math.sin(t * 0.8)) * 16;
            var zx = w * 0.6;
            cx.fillStyle = '#668844';
            cx.fillRect(zx - 4, groundY - zombieY, 8, zombieY); // body
            if (zombieY > 8) { cx.fillStyle = '#557733'; cx.fillRect(zx - 3, groundY - zombieY - 4, 6, 5); } // head
            // arms reaching up
            if (zombieY > 4) { cx.fillStyle = '#668844'; cx.fillRect(zx - 8, groundY - zombieY + 2, 4, 3); cx.fillRect(zx + 4, groundY - zombieY + 2, 4, 3); }
            // red demon flying overhead
            var dx = w * 0.5 + Math.sin(t * 1.2) * w * 0.3, dy = h * 0.25 + Math.sin(t * 2.5) * 15;
            var wingFlap = Math.sin(t * 7) * 8;
            cx.fillStyle = '#cc3333'; cx.fillRect(dx - 5, dy - 3, 10, 8); // body
            cx.fillStyle = '#aa2222';
            cx.beginPath(); cx.moveTo(dx - 5, dy); cx.lineTo(dx - 14, dy - wingFlap); cx.lineTo(dx - 5, dy + 4); cx.fill(); // left wing
            cx.beginPath(); cx.moveTo(dx + 5, dy); cx.lineTo(dx + 14, dy + wingFlap); cx.lineTo(dx + 5, dy + 4); cx.fill(); // right wing
            cx.fillStyle = '#ff4444'; cx.fillRect(dx - 2, dy - 5, 4, 3); // horns
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Dr. Mario ──
    function animDrMario(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bottleL = w * 0.2, bottleR = w * 0.8, bottleTop = h * 0.15, bottleBot = h * 0.92;
        var viruses = [];
        var colors = ['#ff3333','#4488ff','#ffcc00'];
        for (var i = 0; i < 6; i++) viruses.push({
            x: bottleL + 20 + Math.random() * (bottleR - bottleL - 40),
            y: bottleBot - 20 - Math.random() * (bottleBot - bottleTop) * 0.5,
            c: colors[i % 3], phase: Math.random() * Math.PI * 2
        });
        var pill = { x: w * 0.5, y: bottleTop - 10, c1: colors[0], c2: colors[1] };
        function draw() {
            t += 0.025;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = '#aaaacc'; cx.lineWidth = 2;
            cx.beginPath();
            cx.moveTo(bottleL, bottleTop + 10); cx.lineTo(bottleL, bottleBot); cx.lineTo(bottleR, bottleBot); cx.lineTo(bottleR, bottleTop + 10);
            cx.moveTo(bottleL, bottleTop + 10); cx.lineTo(bottleL + 15, bottleTop + 10); cx.lineTo(bottleL + 15, bottleTop); cx.lineTo(bottleR - 15, bottleTop); cx.lineTo(bottleR - 15, bottleTop + 10); cx.lineTo(bottleR, bottleTop + 10);
            cx.stroke();
            for (var i = 0; i < viruses.length; i++) {
                var v = viruses[i], wobble = Math.sin(t * 3 + v.phase) * 2;
                cx.fillStyle = v.c; cx.globalAlpha = 0.8;
                cx.beginPath(); cx.arc(v.x + wobble, v.y, 6, 0, Math.PI * 2); cx.fill();
                cx.globalAlpha = 1; cx.fillStyle = '#000';
                cx.fillRect(v.x + wobble - 3, v.y - 2, 2, 2); cx.fillRect(v.x + wobble + 1, v.y - 2, 2, 2);
                cx.fillRect(v.x + wobble - 2, v.y + 2, 4, 1);
            }
            pill.y += 0.8;
            if (pill.y > bottleBot - 20) {
                pill.y = bottleTop - 10;
                pill.c1 = colors[Math.floor(Math.random() * 3)]; pill.c2 = colors[Math.floor(Math.random() * 3)];
                pill.x = bottleL + 30 + Math.random() * (bottleR - bottleL - 60);
            }
            cx.fillStyle = pill.c1;
            cx.beginPath(); cx.arc(pill.x - 7, pill.y, 6, Math.PI * 0.5, Math.PI * 1.5); cx.fill();
            cx.fillRect(pill.x - 7, pill.y - 6, 7, 12);
            cx.fillStyle = pill.c2;
            cx.beginPath(); cx.arc(pill.x + 7, pill.y, 6, -Math.PI * 0.5, Math.PI * 0.5); cx.fill();
            cx.fillRect(pill.x, pill.y - 6, 7, 12);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pipe Dream ──
    function animPipeDream(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = 28, cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var path = [], px = 0, py = Math.floor(rows / 2);
        while (px < cols && py >= 0 && py < rows) {
            path.push({ x: px, y: py });
            var rr = Math.random();
            if (rr < 0.6) px++;
            else if (rr < 0.8) { py = Math.max(0, py - 1); px++; }
            else { py = Math.min(rows - 1, py + 1); px++; }
        }
        function draw() {
            t += 0.03;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(100,100,200,0.12)'; cx.lineWidth = 0.5;
            for (var x = 0; x <= cols; x++) { cx.beginPath(); cx.moveTo(x * cs, 0); cx.lineTo(x * cs, rows * cs); cx.stroke(); }
            for (var y = 0; y <= rows; y++) { cx.beginPath(); cx.moveTo(0, y * cs); cx.lineTo(cols * cs, y * cs); cx.stroke(); }
            var fillIdx = Math.floor(t * 3) % (path.length + 5);
            for (var i = 0; i < path.length - 1; i++) {
                var p = path[i], np = path[i + 1];
                var cx1 = p.x * cs + cs / 2, cy1 = p.y * cs + cs / 2;
                var cx2 = np.x * cs + cs / 2, cy2 = np.y * cs + cs / 2;
                cx.strokeStyle = '#888899'; cx.lineWidth = 8; cx.lineCap = 'round';
                cx.beginPath(); cx.moveTo(cx1, cy1); cx.lineTo(cx2, cy2); cx.stroke();
                if (i < fillIdx) {
                    cx.strokeStyle = '#44ff66'; cx.lineWidth = 4;
                    cx.beginPath(); cx.moveTo(cx1, cy1); cx.lineTo(cx2, cy2); cx.stroke();
                }
            }
            if (path.length > 0) {
                cx.fillStyle = '#ff4444';
                cx.beginPath(); cx.arc(path[0].x * cs + cs / 2, path[0].y * cs + cs / 2, 5, 0, Math.PI * 2); cx.fill();
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Lights Out ──
    function animLightsOut(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 5, cs = Math.min(w, h) * 0.15;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2;
        var grid = [];
        for (var r = 0; r < gs; r++) { grid[r] = []; for (var c = 0; c < gs; c++) grid[r][c] = Math.random() < 0.5 ? 1 : 0; }
        var timer = 0, solveR = 0, solveC = 0;
        function toggle(r, c) { if (r >= 0 && r < gs && c >= 0 && c < gs) grid[r][c] = 1 - grid[r][c]; }
        function draw() {
            t += 0.02; timer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                var lit = grid[r][c];
                cx.fillStyle = lit ? '#ffdd44' : '#333344';
                cx.shadowColor = lit ? '#ffdd44' : 'transparent'; cx.shadowBlur = lit ? 8 : 0;
                cx.fillRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
            }
            cx.shadowBlur = 0;
            if (timer > 0.6) {
                timer = 0;
                toggle(solveR, solveC); toggle(solveR - 1, solveC); toggle(solveR + 1, solveC);
                toggle(solveR, solveC - 1); toggle(solveR, solveC + 1);
                solveC++; if (solveC >= gs) { solveC = 0; solveR++; }
                if (solveR >= gs) solveR = 0;
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Klax ──
    function animKlax(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var tileColors = ['#ff3333','#33cc33','#4488ff','#ffcc00','#ff66cc'];
        var convTiles = [], binTiles = [], binCols = 5;
        var binW = w * 0.7, binX = (w - binW) / 2, binY = h * 0.55, binH = h * 0.4;
        var colW = binW / binCols;
        for (var i = 0; i < 4; i++) convTiles.push({ x: w * 0.2 + i * 45, c: tileColors[Math.floor(Math.random() * tileColors.length)] });
        var falling = null;
        function draw() {
            t += 0.02;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#333344'; cx.fillRect(w * 0.1, h * 0.12, w * 0.8, 18);
            cx.strokeStyle = '#555566'; cx.lineWidth = 1;
            for (var d = 0; d < 12; d++) {
                var dx = (w * 0.1 + d * 25 + t * 40) % (w * 0.8) + w * 0.1;
                cx.beginPath(); cx.moveTo(dx, h * 0.12); cx.lineTo(dx, h * 0.12 + 18); cx.stroke();
            }
            for (var i = 0; i < convTiles.length; i++) {
                convTiles[i].x += 0.6;
                cx.fillStyle = convTiles[i].c; cx.fillRect(convTiles[i].x, h * 0.12 + 1, 18, 16);
                cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.strokeRect(convTiles[i].x, h * 0.12 + 1, 18, 16);
            }
            if (convTiles.length > 0 && convTiles[0].x > w * 0.85) {
                var ct = convTiles.shift();
                falling = { x: binX + Math.floor(Math.random() * binCols) * colW + colW / 2 - 9, y: h * 0.3, c: ct.c };
                convTiles.push({ x: w * 0.05, c: tileColors[Math.floor(Math.random() * tileColors.length)] });
            }
            if (falling) {
                falling.y += 2; cx.fillStyle = falling.c; cx.fillRect(falling.x, falling.y, 18, 16);
                if (falling.y > binY + binH - 20) {
                    binTiles.push({ x: falling.x, y: falling.y, c: falling.c }); falling = null;
                    if (binTiles.length > 10) binTiles.shift();
                }
            }
            cx.strokeStyle = '#666688'; cx.lineWidth = 1.5; cx.strokeRect(binX, binY, binW, binH);
            for (var i = 0; i < binTiles.length; i++) { cx.fillStyle = binTiles[i].c; cx.fillRect(binTiles[i].x, binTiles[i].y, 18, 16); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Puyo Puyo ──
    function animPuyoPuyo(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = 18, cols = 6, rows = Math.floor(h / cs), ox = (w - cols * cs) / 2;
        var colors = ['#ff4488','#44cc44','#4488ff','#ffcc00'];
        var grid = [];
        for (var r = 0; r < rows; r++) { grid[r] = []; for (var c = 0; c < cols; c++) grid[r][c] = null; }
        for (var r = rows - 4; r < rows; r++) for (var c = 0; c < cols; c++) {
            if (Math.random() < 0.6) grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
        }
        var pair = { c1: colors[0], c2: colors[1], col: 2, y: 0 };
        var pops = [], popTimer = 0;
        function draw() {
            t += 0.025;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(150,150,200,0.2)'; cx.lineWidth = 1;
            cx.strokeRect(ox, 0, cols * cs, rows * cs);
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
                if (!grid[r][c]) continue;
                var px = ox + c * cs + cs / 2, py = r * cs + cs / 2;
                cx.fillStyle = grid[r][c]; cx.beginPath(); cx.arc(px, py, cs / 2 - 2, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#fff';
                cx.beginPath(); cx.arc(px - 3, py - 2, 2, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(px + 3, py - 2, 2, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#000';
                cx.beginPath(); cx.arc(px - 2.5, py - 1.5, 1, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(px + 3.5, py - 1.5, 1, 0, Math.PI * 2); cx.fill();
            }
            pair.y += 0.7;
            var fpx = ox + pair.col * cs + cs / 2;
            cx.fillStyle = pair.c1; cx.beginPath(); cx.arc(fpx, pair.y, cs / 2 - 2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = pair.c2; cx.beginPath(); cx.arc(fpx, pair.y + cs, cs / 2 - 2, 0, Math.PI * 2); cx.fill();
            if (pair.y > h - cs * 5) {
                pair.y = -cs; pair.col = Math.floor(Math.random() * cols);
                pair.c1 = colors[Math.floor(Math.random() * 4)]; pair.c2 = colors[Math.floor(Math.random() * 4)];
            }
            popTimer += 0.025;
            if (popTimer > 3) {
                popTimer = 0;
                for (var i = 0; i < 8; i++) pops.push({
                    x: ox + Math.random() * cols * cs, y: h - Math.random() * cs * 4,
                    vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 3,
                    life: 1, c: colors[Math.floor(Math.random() * 4)]
                });
            }
            for (var i = pops.length - 1; i >= 0; i--) {
                var p = pops[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
                if (p.life <= 0) { pops.splice(i, 1); continue; }
                cx.fillStyle = p.c; cx.globalAlpha = p.life;
                cx.beginPath(); cx.arc(p.x, p.y, 3, 0, Math.PI * 2); cx.fill();
            }
            cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Reversi ──
    function animReversi(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 8, cs = Math.min(w, h) * 0.1;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2;
        var board = [];
        for (var r = 0; r < gs; r++) { board[r] = []; for (var c = 0; c < gs; c++) board[r][c] = 0; }
        board[3][3] = 1; board[3][4] = -1; board[4][3] = -1; board[4][4] = 1;
        var flipAnims = [], moveTimer = 0, turn = 1;
        function draw() {
            t += 0.02; moveTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#1a6632'; cx.fillRect(ox, oy, gs * cs, gs * cs);
            cx.strokeStyle = '#0e4420'; cx.lineWidth = 0.5;
            for (var i = 0; i <= gs; i++) {
                cx.beginPath(); cx.moveTo(ox + i * cs, oy); cx.lineTo(ox + i * cs, oy + gs * cs); cx.stroke();
                cx.beginPath(); cx.moveTo(ox, oy + i * cs); cx.lineTo(ox + gs * cs, oy + i * cs); cx.stroke();
            }
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                if (board[r][c] === 0) continue;
                var pcx = ox + c * cs + cs / 2, pcy = oy + r * cs + cs / 2;
                cx.fillStyle = board[r][c] === 1 ? '#ffffff' : '#111111';
                cx.beginPath(); cx.arc(pcx, pcy, cs * 0.38, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = '#888'; cx.lineWidth = 0.5; cx.beginPath(); cx.arc(pcx, pcy, cs * 0.38, 0, Math.PI * 2); cx.stroke();
            }
            for (var i = flipAnims.length - 1; i >= 0; i--) {
                var f = flipAnims[i]; f.t += 0.06;
                var fcx2 = ox + f.c * cs + cs / 2, fcy2 = oy + f.r * cs + cs / 2;
                var scaleX = Math.abs(Math.cos(f.t * Math.PI));
                cx.save(); cx.translate(fcx2, fcy2); cx.scale(scaleX, 1);
                cx.fillStyle = f.t < 0.5 ? (f.from === 1 ? '#fff' : '#111') : (f.from === 1 ? '#111' : '#fff');
                cx.beginPath(); cx.arc(0, 0, cs * 0.38, 0, Math.PI * 2); cx.fill();
                cx.restore();
                if (f.t >= 1) { board[f.r][f.c] = -f.from; flipAnims.splice(i, 1); }
            }
            if (moveTimer > 1.5 && flipAnims.length === 0) {
                moveTimer = 0;
                var empties = [];
                for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) if (board[r][c] === 0) empties.push({ r: r, c: c });
                if (empties.length > 0) {
                    var chosen = empties[Math.floor(Math.random() * empties.length)];
                    board[chosen.r][chosen.c] = turn;
                    var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                    for (var d = 0; d < dirs.length; d++) {
                        var nr = chosen.r + dirs[d][0], nc = chosen.c + dirs[d][1];
                        if (nr >= 0 && nr < gs && nc >= 0 && nc < gs && board[nr][nc] === -turn)
                            flipAnims.push({ r: nr, c: nc, from: board[nr][nc], t: 0 });
                    }
                    turn = -turn;
                }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Checkers ──
    function animCheckers(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 8, cs = Math.min(w, h) * 0.1;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2;
        var pieces = [];
        for (var r = 0; r < 3; r++) for (var c = 0; c < gs; c++) {
            if ((r + c) % 2 === 1) pieces.push({ r: r, c: c, color: '#cc3333', king: false });
        }
        for (var r = 5; r < 8; r++) for (var c = 0; c < gs; c++) {
            if ((r + c) % 2 === 1) pieces.push({ r: r, c: c, color: '#222222', king: r === 5 });
        }
        var jumpAnim = { active: false, piece: 0, fromR: 0, fromC: 0, toR: 0, toC: 0, t: 0 };
        var jumpTimer = 0;
        function draw() {
            t += 0.02; jumpTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                cx.fillStyle = (r + c) % 2 === 0 ? '#ddb87a' : '#8b5e3c';
                cx.fillRect(ox + c * cs, oy + r * cs, cs, cs);
            }
            for (var i = 0; i < pieces.length; i++) {
                var p = pieces[i], drawR = p.r, drawC = p.c;
                if (jumpAnim.active && jumpAnim.piece === i) {
                    var jt = jumpAnim.t;
                    drawC = jumpAnim.fromC + (jumpAnim.toC - jumpAnim.fromC) * jt;
                    drawR = jumpAnim.fromR + (jumpAnim.toR - jumpAnim.fromR) * jt - Math.sin(jt * Math.PI) * 2;
                }
                var pcx2 = ox + drawC * cs + cs / 2, pcy2 = oy + drawR * cs + cs / 2;
                cx.fillStyle = p.color; cx.beginPath(); cx.arc(pcx2, pcy2, cs * 0.38, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = p.color === '#cc3333' ? '#ff6666' : '#555555'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.arc(pcx2, pcy2, cs * 0.38, 0, Math.PI * 2); cx.stroke();
                if (p.king) {
                    cx.fillStyle = '#ffcc00'; cx.font = 'bold ' + Math.round(cs * 0.4) + 'px serif';
                    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('\u2654', pcx2, pcy2);
                }
            }
            if (!jumpAnim.active && jumpTimer > 1.5) {
                jumpTimer = 0;
                var pi = Math.floor(Math.random() * pieces.length), p = pieces[pi];
                var dr = p.color === '#cc3333' ? 2 : -2, dc = Math.random() < 0.5 ? 2 : -2;
                var nr = p.r + dr, nc = p.c + dc;
                if (nr >= 0 && nr < gs && nc >= 0 && nc < gs)
                    jumpAnim = { active: true, piece: pi, fromR: p.r, fromC: p.c, toR: nr, toC: nc, t: 0 };
            }
            if (jumpAnim.active) {
                jumpAnim.t += 0.03;
                if (jumpAnim.t >= 1) { pieces[jumpAnim.piece].r = jumpAnim.toR; pieces[jumpAnim.piece].c = jumpAnim.toC; jumpAnim.active = false; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Memory Match ──
    function animMemoryMatch(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gr = 4, gc = 4, cs = Math.min(w / gc, h / gr) * 0.85;
        var ox = (w - gc * cs) / 2, oy = (h - gr * cs) / 2;
        var symbols = ['\u2605','\u2665','\u2666','\u2660','\u266B','\u263A','\u2600','\u2602'];
        var syms = [];
        for (var i = 0; i < 8; i++) { syms.push(i); syms.push(i); }
        for (var i = syms.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = syms[i]; syms[i] = syms[j]; syms[j] = tmp; }
        var cards = [];
        for (var i = 0; i < gr * gc; i++) cards.push({ sym: syms[i], flipped: false, matched: false });
        var flipTimer = 0, showing = [];
        function draw() {
            t += 0.02; flipTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < cards.length; i++) {
                var cd = cards[i], r = Math.floor(i / gc), c = i % gc;
                var cx2 = ox + c * cs + cs / 2, cy2 = oy + r * cs + cs / 2;
                if (cd.matched) {
                    cx.fillStyle = '#1a3322'; cx.fillRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
                    cx.fillStyle = '#44cc44'; cx.font = Math.round(cs * 0.45) + 'px serif';
                    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(symbols[cd.sym], cx2, cy2);
                } else if (cd.flipped) {
                    cx.fillStyle = '#1a1a2e'; cx.fillRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
                    cx.fillStyle = '#ffcc44'; cx.font = Math.round(cs * 0.45) + 'px serif';
                    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(symbols[cd.sym], cx2, cy2);
                } else {
                    cx.fillStyle = '#2244aa'; cx.fillRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
                    cx.fillStyle = '#88aaff'; cx.font = 'bold ' + Math.round(cs * 0.4) + 'px sans-serif';
                    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('?', cx2, cy2);
                }
            }
            if (flipTimer > 0.8) {
                flipTimer = 0;
                var unmatched = [];
                for (var i = 0; i < cards.length; i++) if (!cards[i].matched && !cards[i].flipped) unmatched.push(i);
                if (showing.length < 2 && unmatched.length > 0) {
                    var pick = unmatched[Math.floor(Math.random() * unmatched.length)];
                    cards[pick].flipped = true; showing.push(pick);
                }
                if (showing.length === 2) {
                    if (cards[showing[0]].sym === cards[showing[1]].sym) { cards[showing[0]].matched = true; cards[showing[1]].matched = true; }
                    else { cards[showing[0]].flipped = false; cards[showing[1]].flipped = false; }
                    showing = [];
                }
                var allMatched = true;
                for (var i = 0; i < cards.length; i++) if (!cards[i].matched) { allMatched = false; break; }
                if (allMatched) for (var i = 0; i < cards.length; i++) { cards[i].matched = false; cards[i].flipped = false; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Sudoku ──
    function animSudoku(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 9, cs = Math.min(w, h) * 0.09;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2;
        var grid = [], fixed = [];
        for (var r = 0; r < gs; r++) { grid[r] = []; fixed[r] = []; for (var c = 0; c < gs; c++) {
            var v = ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
            if (Math.random() < 0.35) { grid[r][c] = v; fixed[r][c] = true; } else { grid[r][c] = 0; fixed[r][c] = false; }
        }}
        var fillTimer = 0, fillR = 0, fillC = 0;
        function draw() {
            t += 0.02; fillTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i <= gs; i++) {
                cx.lineWidth = (i % 3 === 0) ? 2 : 0.5;
                cx.strokeStyle = (i % 3 === 0) ? 'rgba(150,150,255,0.5)' : 'rgba(150,150,200,0.15)';
                cx.beginPath(); cx.moveTo(ox + i * cs, oy); cx.lineTo(ox + i * cs, oy + gs * cs); cx.stroke();
                cx.beginPath(); cx.moveTo(ox, oy + i * cs); cx.lineTo(ox + gs * cs, oy + i * cs); cx.stroke();
            }
            cx.textAlign = 'center'; cx.textBaseline = 'middle';
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                if (grid[r][c] === 0) {
                    cx.fillStyle = 'rgba(100,150,200,0.2)'; cx.font = Math.round(cs * 0.22) + 'px monospace';
                    cx.fillText('1', ox + c * cs + cs * 0.2, oy + r * cs + cs * 0.2); continue;
                }
                cx.fillStyle = fixed[r][c] ? '#ffffff' : '#44aaff';
                cx.font = (fixed[r][c] ? 'bold ' : '') + Math.round(cs * 0.55) + 'px monospace';
                cx.fillText(grid[r][c].toString(), ox + c * cs + cs / 2, oy + r * cs + cs / 2);
            }
            if (fillTimer > 0.4) {
                fillTimer = 0;
                for (var i = 0; i < gs * gs; i++) {
                    var rr = (fillR + Math.floor(i / gs)) % gs, cc = (fillC + i % gs) % gs;
                    if (grid[rr][cc] === 0) { grid[rr][cc] = ((rr * 3 + Math.floor(rr / 3) + cc) % 9) + 1; fillR = rr; fillC = cc + 1; break; }
                }
                var full = true;
                for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) if (grid[r][c] === 0) { full = false; break; }
                if (full) for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) { if (!fixed[r][c] && Math.random() < 0.6) grid[r][c] = 0; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Mastermind ──
    function animMastermind(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var pegColors = ['#ff3333','#3366ff','#33cc33','#ffcc00','#ffffff','#ff8800'];
        var pegsPerRow = 4, pegR = Math.min(w, h) * 0.04;
        var maxRows = 8, rowH = h / (maxRows + 2), ox = w * 0.15;
        var guesses = [], secret = [];
        for (var i = 0; i < pegsPerRow; i++) secret.push(pegColors[Math.floor(Math.random() * pegColors.length)]);
        var placeTimer = 0;
        function draw() {
            t += 0.02; placeTimer += 0.02;
            cx.fillStyle = '#1a1020'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < pegsPerRow; i++) {
                var px = ox + i * (pegR * 3), py = rowH * 0.5;
                cx.fillStyle = '#333'; cx.beginPath(); cx.arc(px, py, pegR, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#888'; cx.font = 'bold ' + Math.round(pegR * 1.2) + 'px sans-serif';
                cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('?', px, py);
            }
            for (var r = 0; r < guesses.length; r++) {
                var g = guesses[r];
                for (var i = 0; i < g.pegs.length; i++) {
                    var px = ox + i * (pegR * 3), py = (r + 1.5) * rowH;
                    cx.fillStyle = g.pegs[i]; cx.beginPath(); cx.arc(px, py, pegR, 0, Math.PI * 2); cx.fill();
                    cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1;
                    cx.beginPath(); cx.arc(px, py, pegR, 0, Math.PI * 2); cx.stroke();
                }
                var kx = ox + pegsPerRow * (pegR * 3) + pegR;
                for (var k = 0; k < g.keys.length; k++) {
                    cx.fillStyle = g.keys[k]; cx.beginPath();
                    cx.arc(kx + (k % 2) * pegR * 1.5, (r + 1.5) * rowH + Math.floor(k / 2) * pegR * 1.5 - pegR * 0.4, pegR * 0.4, 0, Math.PI * 2);
                    cx.fill();
                }
            }
            if (placeTimer > 0.7 && guesses.length <= maxRows) {
                placeTimer = 0;
                var guess = { pegs: [], keys: [] };
                for (var i = 0; i < pegsPerRow; i++) guess.pegs.push(pegColors[Math.floor(Math.random() * pegColors.length)]);
                for (var i = 0; i < pegsPerRow; i++) {
                    if (guess.pegs[i] === secret[i]) guess.keys.push('#222222');
                    else if (secret.indexOf(guess.pegs[i]) >= 0) guess.keys.push('#ffffff');
                }
                guesses.push(guess);
                if (guesses.length > maxRows) { guesses = []; for (var i = 0; i < pegsPerRow; i++) secret[i] = pegColors[Math.floor(Math.random() * pegColors.length)]; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Hangman ──
    function animHangman(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var stage = 0, stageTimer = 0, maxStage = 8;
        var word = 'RETRO', guessed = [], letterIdx = 0, wrongLetters = 'XZQWJ';
        function draw() {
            t += 0.02; stageTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = '#aaaacc'; cx.lineWidth = 2; cx.lineCap = 'round';
            var gx = w * 0.25, gy = h * 0.85, top = h * 0.15;
            if (stage >= 1) { cx.beginPath(); cx.moveTo(gx - 20, gy); cx.lineTo(gx + 30, gy); cx.stroke(); }
            if (stage >= 2) { cx.beginPath(); cx.moveTo(gx, gy); cx.lineTo(gx, top); cx.stroke(); }
            if (stage >= 3) { cx.beginPath(); cx.moveTo(gx, top); cx.lineTo(gx + 60, top); cx.stroke(); }
            if (stage >= 4) { cx.beginPath(); cx.moveTo(gx + 60, top); cx.lineTo(gx + 60, top + 20); cx.stroke(); }
            var hx = gx + 60, hy = top + 20;
            if (stage >= 5) { cx.beginPath(); cx.arc(hx, hy + 10, 10, 0, Math.PI * 2); cx.stroke(); }
            if (stage >= 6) { cx.beginPath(); cx.moveTo(hx, hy + 20); cx.lineTo(hx, hy + 45); cx.stroke(); }
            if (stage >= 7) { cx.beginPath(); cx.moveTo(hx, hy + 25); cx.lineTo(hx - 15, hy + 40); cx.stroke(); cx.beginPath(); cx.moveTo(hx, hy + 25); cx.lineTo(hx + 15, hy + 40); cx.stroke(); }
            if (stage >= 8) { cx.beginPath(); cx.moveTo(hx, hy + 45); cx.lineTo(hx - 12, hy + 62); cx.stroke(); cx.beginPath(); cx.moveTo(hx, hy + 45); cx.lineTo(hx + 12, hy + 62); cx.stroke(); }
            cx.textAlign = 'center'; cx.textBaseline = 'middle';
            var bx = w * 0.5, by = h * 0.92;
            for (var i = 0; i < word.length; i++) {
                var lx = bx + (i - word.length / 2) * 22;
                cx.strokeStyle = '#6666aa'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(lx - 8, by + 8); cx.lineTo(lx + 8, by + 8); cx.stroke();
                if (guessed.indexOf(word[i]) >= 0) {
                    cx.fillStyle = '#44ff66'; cx.font = 'bold 14px monospace'; cx.fillText(word[i], lx, by);
                }
            }
            cx.fillStyle = '#ff4444'; cx.font = '10px monospace';
            for (var i = 0; i < Math.min(stage, wrongLetters.length); i++) cx.fillText(wrongLetters[i], w * 0.82, h * 0.2 + i * 14);
            if (stageTimer > 0.9) {
                stageTimer = 0;
                if (letterIdx < word.length + 5) {
                    if (Math.random() < 0.4 && letterIdx < word.length) guessed.push(word[letterIdx]);
                    else if (stage < maxStage) stage++;
                    letterIdx++;
                } else { stage = 0; guessed = []; letterIdx = 0; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Battleship ──
    function animBattleship(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 8, cs = Math.min(w, h) * 0.09;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2;
        var ships = [{ r:1,c:1,len:4,vert:false },{ r:3,c:5,len:3,vert:true },{ r:6,c:0,len:3,vert:false },{ r:5,c:4,len:2,vert:false }];
        var hits = [], misses = [], explosions = [], shotTimer = 0;
        function draw() {
            t += 0.02; shotTimer += 0.02;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                var wave = Math.sin(t * 2 + r * 0.5 + c * 0.3) * 10;
                cx.fillStyle = 'rgb(' + Math.round(10 + wave) + ',' + Math.round(30 + wave) + ',' + Math.round(80 + wave) + ')';
                cx.fillRect(ox + c * cs + 1, oy + r * cs + 1, cs - 2, cs - 2);
            }
            cx.globalAlpha = 0.25;
            for (var s = 0; s < ships.length; s++) {
                var sh = ships[s]; cx.fillStyle = '#888899';
                if (sh.vert) cx.fillRect(ox + sh.c * cs + 2, oy + sh.r * cs + 2, cs - 4, sh.len * cs - 4);
                else cx.fillRect(ox + sh.c * cs + 2, oy + sh.r * cs + 2, sh.len * cs - 4, cs - 4);
            }
            cx.globalAlpha = 1;
            for (var i = 0; i < hits.length; i++) {
                cx.fillStyle = '#ff3333'; cx.font = 'bold ' + Math.round(cs * 0.6) + 'px sans-serif';
                cx.textAlign = 'center'; cx.textBaseline = 'middle';
                cx.fillText('X', ox + hits[i].c * cs + cs / 2, oy + hits[i].r * cs + cs / 2);
            }
            for (var i = 0; i < misses.length; i++) {
                cx.fillStyle = '#ffffff'; cx.beginPath();
                cx.arc(ox + misses[i].c * cs + cs / 2, oy + misses[i].r * cs + cs / 2, cs * 0.15, 0, Math.PI * 2); cx.fill();
            }
            for (var i = explosions.length - 1; i >= 0; i--) {
                var e = explosions[i]; e.life -= 0.03;
                if (e.life <= 0) { explosions.splice(i, 1); continue; }
                cx.fillStyle = '#ff6600'; cx.globalAlpha = e.life;
                cx.beginPath(); cx.arc(e.x, e.y, (1 - e.life) * cs, 0, Math.PI * 2); cx.fill(); cx.globalAlpha = 1;
            }
            if (shotTimer > 0.6) {
                shotTimer = 0;
                var sr = Math.floor(Math.random() * gs), sc = Math.floor(Math.random() * gs), isHit = false;
                for (var s = 0; s < ships.length; s++) {
                    for (var l = 0; l < ships[s].len; l++) {
                        var cr = ships[s].vert ? ships[s].r + l : ships[s].r, cc = ships[s].vert ? ships[s].c : ships[s].c + l;
                        if (cr === sr && cc === sc) { isHit = true; break; }
                    } if (isHit) break;
                }
                if (isHit) { hits.push({ r: sr, c: sc }); explosions.push({ x: ox + sc * cs + cs / 2, y: oy + sr * cs + cs / 2, life: 1 }); }
                else misses.push({ r: sr, c: sc });
                if (hits.length + misses.length > 20) { hits = []; misses = []; }
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Chrome Dino ──
    function animChromeDino(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var ground = h * 0.75, dinoX = w * 0.2, dinoY = ground;
        var jumping = false, jumpVel = 0, jumpTimer = 0;
        var cacti = []; var ptera = { x: w + 50, y: ground - 45 };
        var dust = [], clouds = [];
        for (var i = 0; i < 3; i++) cacti.push({ x: w * 0.5 + i * 120, h: 15 + Math.random() * 20 });
        for (var i = 0; i < 5; i++) clouds.push({ x: Math.random() * w, y: h * 0.06 + Math.random() * h * 0.22, s: 0.5 + Math.random() * 0.8 });
        function draw() {
            t += 0.03; jumpTimer += 0.03;
            var sky = cx.createLinearGradient(0, 0, 0, ground + 15);
            sky.addColorStop(0, '#ffd8a0'); sky.addColorStop(0.35, '#fff3e0'); sky.addColorStop(1, '#f5edd8');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, ground + 15);
            var haze = cx.createLinearGradient(0, ground - 30, 0, ground + 15);
            haze.addColorStop(0, 'rgba(255,190,100,0)'); haze.addColorStop(1, 'rgba(255,190,100,0.18)');
            cx.fillStyle = haze; cx.fillRect(0, ground - 30, w, 45);
            cx.fillStyle = '#e0d4be'; cx.fillRect(0, ground + 15, w, h - ground - 15);
            for (var i = 0; i < clouds.length; i++) {
                var cl = clouds[i]; cl.x -= 0.15 * cl.s; if (cl.x < -50) cl.x = w + 50;
                cx.fillStyle = 'rgba(255,255,255,0.45)';
                cx.beginPath(); cx.arc(cl.x, cl.y, 9 * cl.s, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(cl.x + 11 * cl.s, cl.y - 2, 7 * cl.s, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(cl.x - 9 * cl.s, cl.y + 1, 5.5 * cl.s, 0, Math.PI * 2); cx.fill();
            }
            cx.strokeStyle = '#907a6a'; cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(0, ground + 15); cx.lineTo(w, ground + 15); cx.stroke();
            cx.fillStyle = '#b0a090';
            for (var i = 0; i < 20; i++) { var px = (i * 47 + t * 100) % (w + 20) - 10; cx.fillRect(px, ground + 17, 2 + (i % 3), 1); cx.fillRect(px + 9, ground + 19, 1 + (i % 2), 1); }
            if (jumping) { dinoY += jumpVel; jumpVel += 0.6; if (dinoY >= ground) { dinoY = ground; jumping = false; for (var d = 0; d < 5; d++) dust.push({ x: dinoX + (Math.random() - 0.5) * 12, y: ground + 12, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2.5, life: 1 }); } }
            else if (jumpTimer > 1.2) { jumpTimer = 0; jumping = true; jumpVel = -8; }
            cx.fillStyle = '#3a3a3a';
            cx.fillRect(dinoX - 5, dinoY - 20, 16, 20);
            cx.fillRect(dinoX + 3, dinoY - 28, 14, 12);
            cx.fillStyle = '#4a4a4a'; cx.fillRect(dinoX - 3, dinoY - 18, 2, 4); cx.fillRect(dinoX + 1, dinoY - 16, 2, 3);
            cx.fillStyle = '#fff'; cx.fillRect(dinoX + 12, dinoY - 26, 3, 3);
            cx.fillStyle = '#1a1a1a'; cx.fillRect(dinoX + 13, dinoY - 25, 1, 1);
            cx.fillStyle = '#3a3a3a'; cx.fillRect(dinoX + 8, dinoY - 22, 8, 2);
            for (var j = 0; j < 3; j++) cx.fillRect(dinoX + 9 + j * 3, dinoY - 20, 2, 2);
            var legOff = Math.sin(t * 12) * 3;
            cx.fillRect(dinoX - 2, dinoY, 4, 8 + legOff); cx.fillRect(dinoX + 6, dinoY, 4, 8 - legOff);
            cx.fillRect(dinoX - 10, dinoY - 18, 6, 6); cx.fillRect(dinoX - 14, dinoY - 14, 4, 4);
            for (var i = 0; i < cacti.length; i++) {
                cacti[i].x -= 2.5;
                if (cacti[i].x < -20) { cacti[i].x = w + 30 + Math.random() * 80; cacti[i].h = 15 + Math.random() * 20; }
                var cg = cx.createLinearGradient(cacti[i].x - 5, 0, cacti[i].x + 5, 0);
                cg.addColorStop(0, '#2a5a2a'); cg.addColorStop(0.5, '#3a7a3a'); cg.addColorStop(1, '#2a5a2a');
                cx.fillStyle = cg;
                cx.fillRect(cacti[i].x - 3, ground + 15 - cacti[i].h, 6, cacti[i].h);
                cx.fillRect(cacti[i].x - 9, ground + 15 - cacti[i].h * 0.7, 6, 3);
                cx.fillRect(cacti[i].x + 3, ground + 15 - cacti[i].h * 0.5, 6, 3);
                cx.fillStyle = '#1a4a1a';
                for (var s = 0; s < cacti[i].h; s += 5) cx.fillRect(cacti[i].x - 2 + (s % 3), ground + 15 - cacti[i].h + s, 1, 1);
            }
            ptera.x -= 2; if (ptera.x < -30) { ptera.x = w + 50; ptera.y = ground - 30 - Math.random() * 30; }
            cx.fillStyle = '#5a4a4a'; cx.fillRect(ptera.x - 4, ptera.y, 12, 4);
            cx.fillRect(ptera.x + 8, ptera.y, 6, 3);
            var wingY = Math.sin(t * 8) * 6;
            cx.fillStyle = 'rgba(90,70,70,0.7)';
            cx.beginPath(); cx.moveTo(ptera.x - 2, ptera.y); cx.lineTo(ptera.x - 10, ptera.y - 4 + wingY); cx.lineTo(ptera.x + 2, ptera.y + 2); cx.fill();
            cx.beginPath(); cx.moveTo(ptera.x + 6, ptera.y); cx.lineTo(ptera.x + 14, ptera.y - 4 - wingY); cx.lineTo(ptera.x + 4, ptera.y + 2); cx.fill();
            for (var i = dust.length - 1; i >= 0; i--) {
                var d = dust[i]; d.x += d.vx; d.y += d.vy; d.life -= 0.03;
                if (d.life <= 0) { dust.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(180,160,130,' + (d.life * 0.5) + ')';
                cx.beginPath(); cx.arc(d.x, d.y, 2 + (1 - d.life) * 3, 0, Math.PI * 2); cx.fill();
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.85);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,30,0,0.12)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Helicopter ──
    function animHelicopter(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var ceiling = [], floor = [];
        for (var i = 0; i <= w + 20; i += 10) { ceiling.push(h * 0.08 + Math.random() * h * 0.15); floor.push(h * 0.72 + Math.random() * h * 0.15); }
        var obstacles = [], exhaust = [], bldgLights = [];
        for (var i = 0; i < 3; i++) obstacles.push({ x: w * 0.5 + i * w * 0.4, fromCeil: Math.random() < 0.5, h: h * 0.15 + Math.random() * h * 0.1 });
        for (var i = 0; i < 12; i++) bldgLights.push({ x: Math.random() * w, y: h * 0.78 + Math.random() * h * 0.18, blink: Math.random() * 6 });
        function draw() {
            t += 0.03;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0628'); bg.addColorStop(0.4, '#0c1230'); bg.addColorStop(1, '#080818');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(20,30,50,0.8)';
            for (var i = 0; i < 6; i++) {
                var bx = (i * w / 5 + t * 8) % (w + 60) - 30, bh = 20 + (i * 17 % 30);
                cx.fillRect(bx, h * 0.82 - bh, 25, bh + h * 0.2);
            }
            for (var i = 0; i < bldgLights.length; i++) {
                var bl = bldgLights[i];
                cx.fillStyle = 'rgba(255,220,100,' + (0.2 + 0.3 * Math.sin(t * 2 + bl.blink)) + ')';
                cx.fillRect((bl.x + t * 8) % w, bl.y, 2, 2);
            }
            var heliY = h * 0.4 + Math.sin(t * 1.5) * h * 0.15;
            cx.fillStyle = '#1a3a1a'; cx.beginPath(); cx.moveTo(0, 0);
            for (var i = 0; i < ceiling.length; i++) cx.lineTo(i * 10, ceiling[i] + Math.sin(t + i * 0.3) * 5);
            cx.lineTo(w, 0); cx.closePath(); cx.fill();
            cx.fillStyle = '#1a2a1a'; cx.beginPath(); cx.moveTo(0, 0);
            for (var i = 0; i < ceiling.length; i++) cx.lineTo(i * 10, ceiling[i] + Math.sin(t + i * 0.3) * 5 - 3);
            cx.lineTo(w, 0); cx.closePath(); cx.fill();
            cx.fillStyle = '#1a3a1a'; cx.beginPath(); cx.moveTo(0, h);
            for (var i = 0; i < floor.length; i++) cx.lineTo(i * 10, floor[i] + Math.sin(t + i * 0.2) * 5);
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            for (var i = 0; i < obstacles.length; i++) {
                var ob = obstacles[i]; ob.x -= 1.5;
                if (ob.x < -20) { ob.x = w + 30; ob.fromCeil = Math.random() < 0.5; ob.h = h * 0.15 + Math.random() * h * 0.1; }
                var og = ob.fromCeil ? cx.createLinearGradient(0, 0, 0, ob.h) : cx.createLinearGradient(0, h - ob.h, 0, h);
                og.addColorStop(0, '#556655'); og.addColorStop(1, '#334433');
                cx.fillStyle = og;
                if (ob.fromCeil) cx.fillRect(ob.x - 6, 0, 12, ob.h); else cx.fillRect(ob.x - 6, h - ob.h, 12, ob.h);
            }
            var hx = w * 0.25;
            exhaust.push({ x: hx - 24, y: heliY + 2, vx: -1 - Math.random(), vy: (Math.random() - 0.5) * 0.5, life: 1 });
            if (exhaust.length > 15) exhaust.shift();
            for (var i = exhaust.length - 1; i >= 0; i--) {
                var ex = exhaust[i]; ex.x += ex.vx; ex.y += ex.vy; ex.life -= 0.05;
                if (ex.life <= 0) { exhaust.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(100,120,100,' + (ex.life * 0.3) + ')';
                cx.beginPath(); cx.arc(ex.x, ex.y, 3 + (1 - ex.life) * 5, 0, Math.PI * 2); cx.fill();
            }
            cx.shadowColor = '#33ff33'; cx.shadowBlur = 8;
            cx.fillStyle = '#33cc33'; cx.fillRect(hx - 12, heliY - 5, 24, 12);
            cx.shadowBlur = 0;
            cx.fillStyle = '#44dd44'; cx.fillRect(hx - 8, heliY - 3, 16, 8);
            cx.fillStyle = '#88ff88'; cx.fillRect(hx + 10, heliY - 3, 6, 8);
            cx.fillStyle = '#33cc33'; cx.fillRect(hx - 22, heliY - 2, 12, 5); cx.fillRect(hx - 24, heliY - 8, 4, 10);
            var rotorPhase = Math.sin(t * 30) * 18;
            cx.strokeStyle = 'rgba(102,255,102,0.6)'; cx.lineWidth = 3;
            cx.beginPath(); cx.moveTo(hx - rotorPhase, heliY - 7); cx.lineTo(hx + rotorPhase, heliY - 7); cx.stroke();
            cx.strokeStyle = 'rgba(102,255,102,0.2)'; cx.lineWidth = 8;
            cx.beginPath(); cx.moveTo(hx - 18, heliY - 7); cx.lineTo(hx + 18, heliY - 7); cx.stroke();
            cx.strokeStyle = '#33cc33'; cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(hx - 10, heliY + 7); cx.lineTo(hx - 10, heliY + 10); cx.lineTo(hx + 10, heliY + 10); cx.lineTo(hx + 10, heliY + 7); cx.stroke();
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Crossy Road ──
    function animCrossyRoad(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var laneH = h / 8;
        var lanes = [
            { type: 'grass', color: '#2a6e2a', color2: '#247024' },
            { type: 'road', color: '#444444', carDir: 1, carSpeed: 1.5, cars: [{ x: 30, c: '#dd3333', tp: 'car' }, { x: 180, c: '#3388dd', tp: 'truck' }] },
            { type: 'road', color: '#3a3a3a', carDir: -1, carSpeed: 2, cars: [{ x: 80, c: '#ffaa22', tp: 'bus' }, { x: 220, c: '#44cc44', tp: 'car' }] },
            { type: 'grass', color: '#2d7a2d', color2: '#278027' },
            { type: 'water', color: '#224488', logDir: 1, logSpeed: 0.8, logs: [{ x: 20, w: 60 }, { x: 160, w: 50 }] },
            { type: 'water', color: '#1e3d7a', logDir: -1, logSpeed: 1, logs: [{ x: 50, w: 55 }, { x: 190, w: 45 }] },
            { type: 'grass', color: '#2a6e2a', color2: '#247024' },
            { type: 'grass', color: '#267326', color2: '#207520' }
        ];
        var chickenLane = 6, chickenX = w * 0.45, hopTimer = 0, feathers = [];
        var trees = [{ x: 10, lane: 0 }, { x: w * 0.7, lane: 3 }, { x: w * 0.3, lane: 7 }];
        function draw() {
            t += 0.02; hopTimer += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < lanes.length; i++) {
                var lane = lanes[i], ly = i * laneH;
                if (lane.type === 'grass') {
                    var gg = cx.createLinearGradient(0, ly, 0, ly + laneH);
                    gg.addColorStop(0, lane.color); gg.addColorStop(1, lane.color2 || lane.color);
                    cx.fillStyle = gg; cx.fillRect(0, ly, w, laneH);
                    cx.fillStyle = 'rgba(20,80,20,0.3)';
                    for (var g = 0; g < 8; g++) cx.fillRect((g * 53 + i * 17) % w, ly + laneH - 3, 2, 3);
                } else if (lane.type === 'road') {
                    cx.fillStyle = lane.color; cx.fillRect(0, ly, w, laneH);
                    cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth = 1; cx.setLineDash([6, 8]);
                    cx.beginPath(); cx.moveTo(0, ly + laneH / 2); cx.lineTo(w, ly + laneH / 2); cx.stroke();
                    cx.setLineDash([]);
                    for (var c = 0; c < lane.cars.length; c++) {
                        var car = lane.cars[c];
                        car.x += lane.carDir * lane.carSpeed;
                        if (car.x > w + 40) car.x = -50; if (car.x < -50) car.x = w + 40;
                        var cw = car.tp === 'truck' ? 38 : car.tp === 'bus' ? 42 : 26;
                        var ch = laneH - 6;
                        cx.fillStyle = car.c; cx.fillRect(car.x - cw / 2, ly + 3, cw, ch);
                        cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(car.x - cw / 2 + 2, ly + 4, cw * 0.3, ch * 0.4);
                        cx.fillStyle = '#111';
                        cx.fillRect(car.x - cw / 2 + 2, ly + 1, 5, 3); cx.fillRect(car.x + cw / 2 - 7, ly + 1, 5, 3);
                        cx.fillRect(car.x - cw / 2 + 2, ly + laneH - 4, 5, 3); cx.fillRect(car.x + cw / 2 - 7, ly + laneH - 4, 5, 3);
                    }
                } else {
                    var wg = cx.createLinearGradient(0, ly, 0, ly + laneH);
                    wg.addColorStop(0, lane.color); wg.addColorStop(1, '#1a2a60');
                    cx.fillStyle = wg; cx.fillRect(0, ly, w, laneH);
                    cx.fillStyle = 'rgba(100,180,255,0.08)';
                    for (var r = 0; r < 3; r++) {
                        cx.beginPath();
                        for (var x = 0; x <= w; x += 8) cx.lineTo(x, ly + laneH * 0.3 + r * 4 + Math.sin(x * 0.06 + t * 3 + r) * 2);
                        cx.lineTo(w, ly + laneH); cx.lineTo(0, ly + laneH); cx.fill();
                    }
                    for (var l = 0; l < lane.logs.length; l++) {
                        lane.logs[l].x += lane.logDir * lane.logSpeed;
                        if (lane.logs[l].x > w + 70) lane.logs[l].x = -80; if (lane.logs[l].x < -80) lane.logs[l].x = w + 70;
                        var lg = cx.createLinearGradient(0, ly + 4, 0, ly + laneH - 4);
                        lg.addColorStop(0, '#9B6E4C'); lg.addColorStop(0.5, '#8B5E3C'); lg.addColorStop(1, '#7B4E2C');
                        cx.fillStyle = lg; cx.fillRect(lane.logs[l].x, ly + 4, lane.logs[l].w, laneH - 8);
                        cx.strokeStyle = '#5B3016'; cx.lineWidth = 0.5;
                        for (var k = 0; k < 3; k++) { cx.beginPath(); cx.moveTo(lane.logs[l].x + 5 + k * 15, ly + 5 + k * 2); cx.lineTo(lane.logs[l].x + lane.logs[l].w - 5, ly + laneH / 2 + k); cx.stroke(); }
                    }
                }
            }
            for (var i = 0; i < trees.length; i++) {
                cx.fillStyle = '#5B3A1A'; cx.fillRect(trees[i].x + 2, trees[i].lane * laneH + 2, 8, laneH - 2);
                cx.shadowColor = '#1a7a1a'; cx.shadowBlur = 5;
                cx.fillStyle = '#1a8a1a'; cx.beginPath(); cx.arc(trees[i].x + 6, trees[i].lane * laneH + 1, 11, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#22aa22'; cx.beginPath(); cx.arc(trees[i].x + 9, trees[i].lane * laneH - 1, 6, 0, Math.PI * 2); cx.fill();
            }
            if (hopTimer > 0.6) { hopTimer = 0; chickenLane--; feathers.push({ x: chickenX, y: chickenLane * laneH + laneH, vx: (Math.random() - 0.5) * 2, vy: -1, life: 1 }); if (chickenLane < 0) { chickenLane = 7; chickenX = w * 0.3 + Math.random() * w * 0.4; } }
            var cy = chickenLane * laneH + laneH / 2, hopBounce = hopTimer < 0.15 ? -6 : 0;
            cx.fillStyle = '#ffffff'; cx.fillRect(chickenX - 5, cy - 5 + hopBounce, 10, 10);
            cx.fillStyle = '#eee'; cx.fillRect(chickenX - 4, cy - 2 + hopBounce, 3, 5);
            cx.fillStyle = '#ffcc00'; cx.fillRect(chickenX - 3, cy - 9 + hopBounce, 6, 5);
            cx.fillStyle = '#ff6600'; cx.fillRect(chickenX + 3, cy - 7 + hopBounce, 3, 2);
            cx.fillStyle = '#111'; cx.fillRect(chickenX + 1, cy - 8 + hopBounce, 2, 2);
            cx.fillStyle = '#cc4400'; cx.fillRect(chickenX - 2, cy + 5 + hopBounce, 2, 3); cx.fillRect(chickenX + 2, cy + 5 + hopBounce, 2, 3);
            for (var i = feathers.length - 1; i >= 0; i--) {
                var f = feathers[i]; f.x += f.vx; f.y += f.vy; f.vy += 0.05; f.life -= 0.03;
                if (f.life <= 0) { feathers.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(255,255,255,' + f.life + ')'; cx.fillRect(f.x, f.y, 2, 2);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Whack-a-Mole ──
    function animWhackAMole(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gridR = 3, gridC = 3, holeW = w * 0.22, holeH = h * 0.12;
        var holes = [], stars = [];
        for (var r = 0; r < gridR; r++) for (var c = 0; c < gridC; c++) {
            holes.push({ x: w * 0.18 + c * w * 0.28, y: h * 0.22 + r * h * 0.28, mole: 0, moleTimer: Math.random() * 3, hit: false });
        }
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#5a3a1a'); bg.addColorStop(1, '#3a2210');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(80,60,30,0.15)';
            for (var i = 0; i < 20; i++) cx.fillRect((i * 43 + 7) % w, (i * 31 + 11) % h, 8 + (i % 5) * 3, 2);
            cx.fillStyle = '#2a7a2a';
            var topGrass = cx.createLinearGradient(0, 0, 0, h * 0.06);
            topGrass.addColorStop(0, '#3a9a3a'); topGrass.addColorStop(1, '#2a7a2a');
            cx.fillStyle = topGrass; cx.fillRect(0, 0, w, h * 0.06);
            for (var i = 0; i < holes.length; i++) {
                var hl = holes[i]; hl.moleTimer -= 0.02;
                cx.fillStyle = '#0a0804';
                cx.beginPath(); cx.ellipse(hl.x, hl.y + holeH * 0.3, holeW * 0.5, holeH * 0.4, 0, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#1a1008';
                cx.beginPath(); cx.ellipse(hl.x, hl.y + holeH * 0.3, holeW * 0.45, holeH * 0.35, 0, 0, Math.PI * 2); cx.fill();
                if (hl.moleTimer <= 0 && hl.mole === 0) { hl.mole = 0.01; hl.hit = false; }
                if (hl.mole > 0) {
                    var rise = Math.min(hl.mole, 1), my = hl.y - rise * holeH * 0.8;
                    cx.save(); cx.beginPath(); cx.ellipse(hl.x, hl.y + holeH * 0.3, holeW * 0.5, holeH * 0.4, 0, 0, Math.PI * 2); cx.clip();
                    var mg = cx.createRadialGradient(hl.x, my, 0, hl.x, my, holeW * 0.35);
                    mg.addColorStop(0, '#A07B5A'); mg.addColorStop(1, '#7B5B3A');
                    cx.fillStyle = mg;
                    cx.beginPath(); cx.arc(hl.x, my, holeW * 0.3, Math.PI, 0); cx.fill();
                    cx.fillRect(hl.x - holeW * 0.3, my, holeW * 0.6, holeH * 0.4);
                    cx.fillStyle = '#fff';
                    cx.beginPath(); cx.arc(hl.x - 6, my - 4, 4, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(hl.x + 6, my - 4, 4, 0, Math.PI * 2); cx.fill();
                    cx.fillStyle = '#222';
                    cx.beginPath(); cx.arc(hl.x - 5.5, my - 3.5, 2, 0, Math.PI * 2); cx.fill();
                    cx.beginPath(); cx.arc(hl.x + 6.5, my - 3.5, 2, 0, Math.PI * 2); cx.fill();
                    cx.fillStyle = '#dd7799';
                    cx.beginPath(); cx.arc(hl.x, my + 3, 3, 0, Math.PI); cx.fill();
                    cx.fillStyle = '#8B6B4A';
                    for (var f = 0; f < 5; f++) cx.fillRect(hl.x - 8 + f * 4, my - holeW * 0.2, 1, 3);
                    cx.restore();
                    hl.mole += 0.04;
                    if (hl.mole > 2.5 && !hl.hit && Math.random() < 0.5) {
                        hl.hit = true;
                        for (var s = 0; s < 6; s++) stars.push({ x: hl.x, y: my - 10, vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 3, life: 1 });
                    }
                    if (hl.mole > 3.5) { hl.mole = 0; hl.moleTimer = 1 + Math.random() * 3; }
                }
            }
            var malletTarget = holes[Math.floor(t * 1.5) % holes.length];
            if (Math.sin(t * 4) > 0.7) {
                var mAngle = Math.sin(t * 8) * 0.4;
                cx.save(); cx.translate(malletTarget.x + 20, malletTarget.y - holeH * 1.2);
                cx.rotate(mAngle);
                cx.fillStyle = '#6B3510'; cx.fillRect(-3, 0, 6, 28);
                var hg = cx.createLinearGradient(-10, -6, 10, -6);
                hg.addColorStop(0, '#555'); hg.addColorStop(0.5, '#999'); hg.addColorStop(1, '#555');
                cx.fillStyle = hg; cx.fillRect(-10, -6, 20, 10);
                cx.restore();
            }
            cx.shadowColor = '#ffcc00'; cx.shadowBlur = 6;
            cx.fillStyle = '#ffcc00';
            for (var i = stars.length - 1; i >= 0; i--) {
                var st = stars[i]; st.x += st.vx; st.y += st.vy; st.life -= 0.04;
                if (st.life <= 0) { stars.splice(i, 1); continue; }
                cx.globalAlpha = st.life; cx.font = '12px serif'; cx.textAlign = 'center'; cx.fillText('\u2605', st.x, st.y);
            }
            cx.globalAlpha = 1; cx.shadowBlur = 0;
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Fruit Ninja ──
    function animFruitNinja(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var fruits = [], slashes = [], particles = [], combo = 0, comboTimer = 0;
        var fruitTypes = [
            { color: '#ff2233', inner: '#ff8888', name: 'apple', r: 12 },
            { color: '#ff7700', inner: '#ffcc66', name: 'orange', r: 11 },
            { color: '#22aa22', inner: '#88ee88', name: 'melon', r: 14 },
            { color: '#ffdd00', inner: '#ffee88', name: 'lemon', r: 10 },
            { color: '#8833cc', inner: '#cc88ff', name: 'grape', r: 11 }
        ];
        function draw() {
            t += 0.02;
            var bg = cx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
            bg.addColorStop(0, '#1a0808'); bg.addColorStop(1, '#050202');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            comboTimer -= 0.02; if (comboTimer <= 0) combo = 0;
            if (Math.random() < 0.04) {
                var ft = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                fruits.push({ x: w * 0.15 + Math.random() * w * 0.7, y: h + 10, vx: (Math.random() - 0.5) * 3, vy: -6 - Math.random() * 4, color: ft.color, inner: ft.inner, r: ft.r, sliced: false, rot: Math.random() * 6 });
            }
            for (var i = fruits.length - 1; i >= 0; i--) {
                var f = fruits[i]; f.x += f.vx; f.vy += 0.12; f.y += f.vy; f.rot += 0.05;
                if (f.y > h + 30) { fruits.splice(i, 1); continue; }
                if (!f.sliced) {
                    cx.save(); cx.translate(f.x, f.y); cx.rotate(f.rot);
                    cx.shadowColor = f.color; cx.shadowBlur = 8;
                    cx.fillStyle = f.color; cx.beginPath(); cx.arc(0, 0, f.r, 0, Math.PI * 2); cx.fill();
                    cx.shadowBlur = 0;
                    cx.fillStyle = 'rgba(255,255,255,0.25)'; cx.beginPath(); cx.arc(-f.r * 0.3, -f.r * 0.3, f.r * 0.4, 0, Math.PI * 2); cx.fill();
                    cx.fillStyle = '#3a2a1a'; cx.fillRect(-1, -f.r - 3, 2, 4);
                    cx.restore();
                    if (f.vy > -1 && f.vy < 1) {
                        f.sliced = true; combo++; comboTimer = 1.5;
                        slashes.push({ x: f.x - 22, y: f.y - 12, x2: f.x + 22, y2: f.y + 12, life: 1 });
                        for (var p = 0; p < 10; p++) particles.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, life: 1, color: Math.random() < 0.5 ? f.color : f.inner, s: 2 + Math.random() * 3 });
                    }
                } else {
                    cx.globalAlpha = 0.7;
                    cx.fillStyle = f.inner;
                    cx.beginPath(); cx.arc(f.x - 6, f.y + f.vy * 0.5, f.r * 0.7, 0, Math.PI); cx.fill();
                    cx.fillStyle = f.color;
                    cx.beginPath(); cx.arc(f.x + 6, f.y - 3 + f.vy * 0.5, f.r * 0.7, Math.PI, 0); cx.fill();
                    cx.fillStyle = 'rgba(255,255,200,0.3)';
                    cx.fillRect(f.x - 4, f.y - 1, 2, 2); cx.fillRect(f.x - 2, f.y + 2, 1, 1);
                    cx.globalAlpha = 1;
                }
            }
            for (var i = slashes.length - 1; i >= 0; i--) {
                var sl = slashes[i]; sl.life -= 0.05;
                if (sl.life <= 0) { slashes.splice(i, 1); continue; }
                cx.shadowColor = 'rgba(255,255,255,' + sl.life + ')'; cx.shadowBlur = 6;
                cx.strokeStyle = 'rgba(255,255,255,' + sl.life + ')'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(sl.x, sl.y); cx.lineTo(sl.x2, sl.y2); cx.stroke();
                cx.shadowBlur = 0;
                for (var sp = 0; sp < 2; sp++) {
                    var sx = sl.x + (sl.x2 - sl.x) * Math.random(), sy = sl.y + (sl.y2 - sl.y) * Math.random();
                    cx.fillStyle = 'rgba(255,255,200,' + (sl.life * 0.8) + ')';
                    cx.fillRect(sx - 1, sy - 1, 2, 2);
                }
            }
            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.03;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                cx.fillStyle = p.color; cx.globalAlpha = p.life;
                cx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
            }
            cx.globalAlpha = 1;
            if (combo > 1) {
                cx.shadowColor = '#ffcc00'; cx.shadowBlur = 8;
                cx.fillStyle = '#ffcc00'; cx.font = 'bold 16px sans-serif'; cx.textAlign = 'center';
                cx.fillText(combo + 'x', w * 0.8, h * 0.15);
                cx.shadowBlur = 0;
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tapper ──
    function animTapper(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var mugs = [], patrons = [];
        for (var i = 0; i < 4; i++) {
            mugs.push({ x: 40, y: h * 0.22 + i * h * 0.2, speed: 1.2 + Math.random() * 0.8 });
            patrons.push({ x: w + 20 + Math.random() * 60, y: h * 0.22 + i * h * 0.2, speed: 0.3 + Math.random() * 0.3 });
        }
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#1a0e00'); bg.addColorStop(1, '#0a0400');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < 4; i++) {
                var by = h * 0.25 + i * h * 0.2;
                var barG = cx.createLinearGradient(0, by - 2, 0, by + 8);
                barG.addColorStop(0, '#B08424'); barG.addColorStop(0.4, '#8B6914'); barG.addColorStop(1, '#5B4310');
                cx.fillStyle = barG; cx.fillRect(18, by, w - 36, 8);
                cx.fillStyle = 'rgba(255,220,120,0.08)'; cx.fillRect(20, by - 1, w - 40, 1);
                cx.fillStyle = '#4B3810'; cx.fillRect(16, by + 8, 2, 20); cx.fillRect(w - 18, by + 8, 2, 20);
            }
            var btIdx = Math.floor(t * 0.8) % 4;
            var bty = h * 0.25 + btIdx * h * 0.2;
            cx.fillStyle = '#fff'; cx.fillRect(24, bty - 18, 8, 14);
            cx.fillStyle = '#ff3333'; cx.fillRect(24, bty - 4, 8, 8);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(28, bty - 22, 4, 0, Math.PI * 2); cx.fill();
            for (var i = 0; i < mugs.length; i++) {
                var m = mugs[i]; m.x += m.speed; if (m.x > w - 30) m.x = 40;
                cx.fillStyle = '#cc9900'; cx.fillRect(m.x, m.y - 10, 10, 10);
                cx.fillStyle = '#cc9900'; cx.fillRect(m.x + 10, m.y - 8, 3, 6);
                var foam = cx.createLinearGradient(0, m.y - 14, 0, m.y - 10);
                foam.addColorStop(0, '#ffffee'); foam.addColorStop(1, '#ffee88');
                cx.fillStyle = foam; cx.fillRect(m.x, m.y - 14, 10, 4);
                cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(m.x + 1, m.y - 12, 1, 6);
                cx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.2 * Math.sin(t * 4 + i)) + ')';
                cx.fillRect(m.x + 2 + ((t * 3 + i) % 3), m.y - 13, 1, 1);
            }
            var pColors = ['#44cc44', '#4488ff', '#ff8844', '#cc44cc'];
            for (var i = 0; i < patrons.length; i++) {
                var p = patrons[i]; p.x -= p.speed; if (p.x < 50) p.x = w + 20 + Math.random() * 60;
                cx.fillStyle = pColors[i]; cx.fillRect(p.x - 1, p.y - 16, 8, 12);
                cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.fillRect(p.x, p.y - 15, 3, 5);
                cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(p.x + 3, p.y - 20, 4, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#333'; cx.fillRect(p.x - 1, p.y - 4, 3, 6); cx.fillRect(p.x + 4, p.y - 4, 3, 6);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Adventure ──
    function animAdventure(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var rooms = [
            { x: 0.1, y: 0.1, w: 0.3, h: 0.35 },
            { x: 0.5, y: 0.1, w: 0.4, h: 0.35 },
            { x: 0.2, y: 0.55, w: 0.35, h: 0.35 },
            { x: 0.65, y: 0.55, w: 0.25, h: 0.35 }
        ];
        var torches = [{ x: 0.15, y: 0.15 }, { x: 0.85, y: 0.2 }, { x: 0.25, y: 0.6 }, { x: 0.72, y: 0.62 }];
        var sparks = [];
        function draw() {
            t += 0.015;
            cx.fillStyle = '#060612'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < torches.length; i++) {
                var tc = torches[i], tx = tc.x * w, ty = tc.y * h;
                var flicker = 0.6 + 0.3 * Math.sin(t * 6 + i * 2) + 0.1 * Math.sin(t * 13 + i);
                var glow = cx.createRadialGradient(tx, ty, 0, tx, ty, 50 * flicker);
                glow.addColorStop(0, 'rgba(255,160,50,' + (0.15 * flicker) + ')');
                glow.addColorStop(1, 'rgba(255,80,20,0)');
                cx.fillStyle = glow; cx.fillRect(tx - 60, ty - 60, 120, 120);
            }
            for (var i = 0; i < rooms.length; i++) {
                var r = rooms[i];
                cx.fillStyle = 'rgba(40,35,25,0.2)'; cx.fillRect(r.x * w, r.y * h, r.w * w, r.h * h);
                cx.strokeStyle = '#776644'; cx.lineWidth = 2; cx.strokeRect(r.x * w, r.y * h, r.w * w, r.h * h);
                cx.strokeStyle = '#554422'; cx.lineWidth = 3; cx.strokeRect(r.x * w + 1, r.y * h + 1, r.w * w - 2, r.h * h - 2);
            }
            cx.strokeStyle = 'rgba(120,100,60,0.4)'; cx.lineWidth = 6;
            cx.beginPath(); cx.moveTo(0.35 * w, 0.27 * h); cx.lineTo(0.5 * w, 0.27 * h); cx.stroke();
            cx.beginPath(); cx.moveTo(0.3 * w, 0.45 * h); cx.lineTo(0.3 * w, 0.55 * h); cx.stroke();
            cx.beginPath(); cx.moveTo(0.55 * w, 0.45 * h); cx.lineTo(0.7 * w, 0.55 * h); cx.stroke();
            var px = w * (0.25 + 0.15 * Math.sin(t * 0.8));
            var py = h * (0.28 + 0.05 * Math.cos(t * 1.2));
            if (t % 8 > 4) { px = w * (0.6 + 0.1 * Math.sin(t * 0.6)); py = h * (0.25 + 0.05 * Math.cos(t)); }
            cx.shadowColor = '#ffcc00'; cx.shadowBlur = 10;
            cx.fillStyle = '#ffcc00'; cx.fillRect(px - 3, py - 3, 6, 6);
            cx.shadowBlur = 0;
            cx.fillStyle = '#ffee88'; cx.fillRect(px - 1, py - 1, 2, 2);
            var dx = w * 0.72, dy = h * 0.3;
            cx.fillStyle = '#ff3333'; cx.shadowColor = '#ff3333'; cx.shadowBlur = 6;
            cx.beginPath(); cx.moveTo(dx, dy - 10); cx.lineTo(dx - 8, dy + 7); cx.lineTo(dx + 8, dy + 7); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#fff'; cx.fillRect(dx - 2, dy - 3, 2, 2); cx.fillRect(dx + 1, dy - 3, 2, 2);
            var firePhase = Math.sin(t * 8);
            if (firePhase > 0) {
                cx.fillStyle = 'rgba(255,100,0,' + (firePhase * 0.6) + ')';
                cx.beginPath(); cx.moveTo(dx + 8, dy + 2); cx.lineTo(dx + 18 + firePhase * 5, dy); cx.lineTo(dx + 8, dy + 5); cx.fill();
            }
            var glow = 0.4 + 0.3 * Math.sin(t * 3);
            cx.fillStyle = 'rgba(255,215,0,' + glow + ')'; cx.shadowColor = '#ffd700'; cx.shadowBlur = 12;
            cx.fillRect(w * 0.35 - 4, h * 0.68, 8, 10);
            cx.fillRect(w * 0.35 - 6, h * 0.66, 12, 3);
            cx.shadowBlur = 0;
            if (Math.random() < 0.05) sparks.push({ x: w * 0.35, y: h * 0.68, vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.5, life: 1 });
            for (var i = sparks.length - 1; i >= 0; i--) {
                var sp = sparks[i]; sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.04;
                if (sp.life <= 0) { sparks.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(255,215,100,' + sp.life + ')'; cx.fillRect(sp.x, sp.y, 1.5, 1.5);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tower Defense ──
    function animTowerDefense(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var path = [{ x: 0, y: 0.2 }, { x: 0.35, y: 0.2 }, { x: 0.35, y: 0.55 }, { x: 0.7, y: 0.55 }, { x: 0.7, y: 0.85 }, { x: 1, y: 0.85 }];
        var turrets = [
            { x: 0.2, y: 0.08, type: 'archer', c: '#44aaff' },
            { x: 0.5, y: 0.4, type: 'mage', c: '#aa44ff' },
            { x: 0.55, y: 0.72, type: 'cannon', c: '#ff8844' },
            { x: 0.85, y: 0.68, type: 'archer', c: '#44aaff' }
        ];
        var enemies = [], projectiles = [], goldSparks = [];
        for (var i = 0; i < 5; i++) enemies.push({ prog: i * -0.12, hp: 1, maxHp: 1 });
        function draw() {
            t += 0.008;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a1a0a'); bg.addColorStop(1, '#0a120a');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(20,40,20,0.3)';
            for (var i = 0; i < 15; i++) cx.fillRect((i * 37 + 5) % w, (i * 29 + 3) % h, 4, 3);
            cx.strokeStyle = '#332211'; cx.lineWidth = 16; cx.lineCap = 'round'; cx.lineJoin = 'round';
            cx.beginPath(); cx.moveTo(path[0].x * w, path[0].y * h);
            for (var i = 1; i < path.length; i++) cx.lineTo(path[i].x * w, path[i].y * h);
            cx.stroke();
            var pg = cx.createLinearGradient(0, 0, w, h);
            pg.addColorStop(0, '#665533'); pg.addColorStop(1, '#554422');
            cx.strokeStyle = pg; cx.lineWidth = 12;
            cx.beginPath(); cx.moveTo(path[0].x * w, path[0].y * h);
            for (var i = 1; i < path.length; i++) cx.lineTo(path[i].x * w, path[i].y * h);
            cx.stroke();
            for (var i = 0; i < turrets.length; i++) {
                var tr = turrets[i], tx = tr.x * w, ty = tr.y * h;
                cx.fillStyle = '#333'; cx.fillRect(tx - 8, ty - 4, 16, 12);
                var tg = cx.createRadialGradient(tx, ty, 0, tx, ty, 8);
                tg.addColorStop(0, tr.c); tg.addColorStop(1, 'rgba(0,0,0,0.3)');
                cx.fillStyle = tg; cx.fillRect(tx - 6, ty - 6, 12, 12);
                cx.strokeStyle = tr.c; cx.lineWidth = 2; cx.shadowColor = tr.c; cx.shadowBlur = 4;
                cx.beginPath(); cx.moveTo(tx, ty);
                cx.lineTo(tx + Math.cos(t * 3 + i * 1.5) * 12, ty + Math.sin(t * 3 + i * 1.5) * 12);
                cx.stroke(); cx.shadowBlur = 0;
            }
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i]; e.prog += 0.001;
                if (e.prog > 1) { e.prog = -0.15; e.hp = 1; }
                if (e.prog < 0) continue;
                var seg = Math.min(Math.floor(e.prog * (path.length - 1)), path.length - 2);
                var lp = e.prog * (path.length - 1) - seg;
                var ex = (path[seg].x + (path[seg + 1].x - path[seg].x) * lp) * w;
                var ey = (path[seg].y + (path[seg + 1].y - path[seg].y) * lp) * h;
                cx.fillStyle = '#cc2222'; cx.beginPath(); cx.arc(ex, ey, 5, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#881111'; cx.beginPath(); cx.arc(ex + 1, ey + 1, 3, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#333'; cx.fillRect(ex - 6, ey - 9, 12, 3);
                cx.fillStyle = '#44ff44'; cx.fillRect(ex - 5, ey - 8, 10 * e.hp, 1);
            }
            if (Math.random() < 0.06) {
                var ti = Math.floor(Math.random() * turrets.length);
                var tr = turrets[ti];
                projectiles.push({ x: tr.x * w, y: tr.y * h, vx: Math.cos(t * 3 + ti * 1.5) * 3.5, vy: Math.sin(t * 3 + ti * 1.5) * 3.5, life: 25, c: tr.c });
            }
            for (var i = projectiles.length - 1; i >= 0; i--) {
                var pr = projectiles[i]; pr.x += pr.vx; pr.y += pr.vy; pr.life--;
                cx.shadowColor = pr.c; cx.shadowBlur = 4;
                cx.fillStyle = pr.c; cx.fillRect(pr.x - 1.5, pr.y - 1.5, 3, 3);
                cx.shadowBlur = 0;
                if (pr.life <= 0) { goldSparks.push({ x: pr.x, y: pr.y, life: 1 }); projectiles.splice(i, 1); }
            }
            for (var i = goldSparks.length - 1; i >= 0; i--) {
                var gs = goldSparks[i]; gs.life -= 0.05;
                if (gs.life <= 0) { goldSparks.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(255,200,50,' + gs.life + ')'; cx.beginPath(); cx.arc(gs.x, gs.y, 3 * gs.life, 0, Math.PI * 2); cx.fill();
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Gradius ──
    function animGradius(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var stars = [], nebClouds = [];
        for (var i = 0; i < 45; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, sp: 0.5 + Math.random() * 2, s: 0.5 + Math.random() * 1.5 });
        for (var i = 0; i < 4; i++) nebClouds.push({ x: Math.random() * w, y: Math.random() * h, r: 30 + Math.random() * 40, c: i % 2 === 0 ? '40,20,80' : '80,20,40' });
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, '#030318'); bg.addColorStop(0.5, '#080828'); bg.addColorStop(1, '#050520');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < nebClouds.length; i++) {
                var nc = nebClouds[i]; nc.x -= 0.3; if (nc.x < -nc.r) nc.x = w + nc.r;
                var ng = cx.createRadialGradient(nc.x, nc.y, 0, nc.x, nc.y, nc.r);
                ng.addColorStop(0, 'rgba(' + nc.c + ',0.06)'); ng.addColorStop(1, 'rgba(' + nc.c + ',0)');
                cx.fillStyle = ng; cx.fillRect(nc.x - nc.r, nc.y - nc.r, nc.r * 2, nc.r * 2);
            }
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i]; s.x -= s.sp; if (s.x < 0) { s.x = w; s.y = Math.random() * h; }
                cx.fillStyle = 'rgba(200,220,255,' + (0.3 + 0.4 * (s.sp / 2.5)) + ')';
                cx.fillRect(s.x, s.y, s.s, s.s * 0.5);
            }
            cx.fillStyle = '#331100';
            cx.beginPath(); cx.moveTo(0, h);
            for (var x = 0; x <= w; x += 8) cx.lineTo(x, h - 14 - Math.sin(x * 0.03 + t) * 8 - Math.sin(x * 0.07) * 5);
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            cx.fillStyle = '#441800';
            cx.beginPath(); cx.moveTo(0, h);
            for (var x = 0; x <= w; x += 8) cx.lineTo(x, h - 6 - Math.sin(x * 0.05 + t * 1.3) * 4);
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            var sy = h * 0.45 + Math.sin(t * 2) * 25, sx = w * 0.2;
            cx.fillStyle = '#3366cc';
            cx.beginPath(); cx.moveTo(sx + 16, sy); cx.lineTo(sx - 6, sy - 8); cx.lineTo(sx - 10, sy - 3); cx.lineTo(sx - 6, sy); cx.lineTo(sx - 10, sy + 3); cx.lineTo(sx - 6, sy + 8); cx.closePath(); cx.fill();
            cx.fillStyle = '#5588ee'; cx.fillRect(sx - 2, sy - 2, 8, 4);
            cx.fillStyle = '#88bbff'; cx.fillRect(sx + 6, sy - 1, 4, 2);
            cx.shadowColor = '#4488ff'; cx.shadowBlur = 4;
            cx.fillStyle = 'rgba(100,180,255,0.5)'; cx.fillRect(sx - 14, sy - 1, 6, 2);
            cx.shadowBlur = 0;
            for (var i = 1; i <= 3; i++) {
                var ox = sx - i * 14, oy = sy + Math.sin(t * 2 - i * 0.5) * 8;
                cx.shadowColor = '#ff8800'; cx.shadowBlur = 8;
                cx.fillStyle = '#ff8800'; cx.beginPath(); cx.arc(ox, oy, 4, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#ffcc44'; cx.beginPath(); cx.arc(ox, oy, 2, 0, Math.PI * 2); cx.fill();
            }
            for (var i = 0; i < 2; i++) {
                var mx = w * 0.65 + i * w * 0.2 + Math.sin(t + i) * 10;
                var my = h * 0.3 + i * h * 0.3;
                cx.fillStyle = '#999988';
                cx.fillRect(mx - 7, my - 11, 14, 18);
                cx.fillRect(mx - 9, my - 5, 18, 5);
                cx.fillStyle = '#777766';
                cx.fillRect(mx - 5, my - 9, 4, 4); cx.fillRect(mx + 2, my - 9, 4, 4);
                cx.fillRect(mx - 3, my + 1, 6, 4);
                cx.fillStyle = '#bbbbaa'; cx.fillRect(mx - 4, my - 8, 2, 2); cx.fillRect(mx + 3, my - 8, 2, 2);
                if (Math.sin(t * 3 + i * 2) > 0.4) {
                    cx.strokeStyle = 'rgba(255,136,0,0.5)'; cx.lineWidth = 1.5;
                    var rr = 5 + Math.sin(t * 6) * 3;
                    cx.beginPath(); cx.arc(mx - 12, my, rr, 0, Math.PI * 2); cx.stroke();
                    cx.beginPath(); cx.arc(mx - 12, my, rr * 0.5, 0, Math.PI * 2); cx.stroke();
                }
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: R-Type ──
    function animRType(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, charge = 0;
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, '#050515'); bg.addColorStop(0.5, '#0a0520'); bg.addColorStop(1, '#050510');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(80,30,50,0.15)'; cx.lineWidth = 1;
            for (var i = 0; i < 8; i++) {
                cx.beginPath(); cx.moveTo(w, h * 0.1 + i * h * 0.12);
                for (var x = w; x >= 0; x -= 8) cx.lineTo(x, h * 0.1 + i * h * 0.12 + Math.sin(x * 0.04 + t + i) * 8);
                cx.stroke();
            }
            var organic1 = cx.createLinearGradient(0, 0, 0, 12);
            organic1.addColorStop(0, '#2a0a18'); organic1.addColorStop(1, '#1a0510');
            cx.fillStyle = organic1;
            cx.beginPath(); cx.moveTo(0, 0);
            for (var x = 0; x <= w; x += 5) cx.lineTo(x, 8 + Math.sin(x * 0.05 + t) * 6 + Math.sin(x * 0.1) * 3);
            cx.lineTo(w, 0); cx.closePath(); cx.fill();
            cx.fillStyle = '#1a0515';
            cx.beginPath(); cx.moveTo(0, h);
            for (var x = 0; x <= w; x += 5) cx.lineTo(x, h - 10 - Math.sin(x * 0.04 + t * 0.8) * 8);
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            for (var x = 0; x < w; x += 20) {
                cx.fillStyle = 'rgba(60,20,40,' + (0.1 + 0.05 * Math.sin(x * 0.1 + t)) + ')';
                cx.beginPath(); cx.arc(x, h - 5, 3 + Math.sin(x + t) * 2, 0, Math.PI * 2); cx.fill();
            }
            var sy = h * 0.5 + Math.sin(t * 1.8) * 20, sx = w * 0.22;
            cx.fillStyle = '#ee3333';
            cx.beginPath(); cx.moveTo(sx + 14, sy); cx.lineTo(sx - 4, sy - 7); cx.lineTo(sx - 10, sy - 3); cx.lineTo(sx - 8, sy); cx.lineTo(sx - 10, sy + 3); cx.lineTo(sx - 4, sy + 7); cx.closePath(); cx.fill();
            cx.fillStyle = '#cc1111'; cx.fillRect(sx - 8, sy - 3, 5, 6);
            cx.fillStyle = '#ff6666'; cx.fillRect(sx + 2, sy - 1, 4, 2);
            cx.fillStyle = 'rgba(255,100,100,0.3)'; cx.fillRect(sx - 14, sy - 1, 6, 2);
            var podX = sx + 22 + Math.sin(t * 1.5) * 5;
            charge = (charge + 0.015) % 2;
            cx.shadowColor = '#44aaff'; cx.shadowBlur = 12;
            cx.fillStyle = charge < 1.2 ? '#44aaff' : '#66ccff';
            cx.beginPath(); cx.arc(podX, sy, 6, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#88ddff'; cx.beginPath(); cx.arc(podX - 1, sy - 2, 2, 0, Math.PI * 2); cx.fill();
            if (charge < 1.2) {
                var chs = charge * 7;
                cx.strokeStyle = 'rgba(68,170,255,' + (0.2 + charge * 0.3) + ')'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.arc(sx + 14, sy, chs, 0, Math.PI * 2); cx.stroke();
            } else {
                var beamG = cx.createLinearGradient(sx + 18, sy - 3, sx + 18, sy + 3);
                beamG.addColorStop(0, 'rgba(68,170,255,0.2)'); beamG.addColorStop(0.5, 'rgba(68,170,255,0.7)'); beamG.addColorStop(1, 'rgba(68,170,255,0.2)');
                cx.fillStyle = beamG; cx.fillRect(sx + 18, sy - 3, w * 0.4, 6);
                cx.fillStyle = 'rgba(200,230,255,0.5)'; cx.fillRect(sx + 18, sy - 1, w * 0.4, 2);
            }
            for (var i = 0; i < 3; i++) {
                var ex = w * 0.6 + i * 30 + Math.sin(t * 2 + i) * 15;
                var ey = h * 0.25 + i * h * 0.22 + Math.cos(t * 1.5 + i) * 10;
                cx.fillStyle = '#884466';
                cx.beginPath(); cx.arc(ex, ey, 7, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#aa5577';
                cx.beginPath(); cx.arc(ex + 5, ey - 3, 3.5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(ex - 4, ey + 4, 3, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#cc7799'; cx.beginPath(); cx.arc(ex + 2, ey - 1, 1.5, 0, Math.PI * 2); cx.fill();
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Wrecking Crew ──
    function animWreckingCrew(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bricks = [], debris = [];
        for (var row = 0; row < 5; row++) for (var col = 0; col < 10; col++) {
            if (Math.random() < 0.7) bricks.push({ x: col * (w / 10), y: row * (h / 5) + 10, w: w / 10, h: h / 5 - 4, alive: true, id: row * 10 + col });
        }
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a2a'); bg.addColorStop(1, '#0a0a1a');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 1; i <= 4; i++) {
                var fg = cx.createLinearGradient(0, i * h / 5 + 4, 0, i * h / 5 + 12);
                fg.addColorStop(0, '#665544'); fg.addColorStop(1, '#443322');
                cx.fillStyle = fg; cx.fillRect(0, i * h / 5 + 6, w, 5);
            }
            cx.strokeStyle = 'rgba(150,200,100,0.25)'; cx.lineWidth = 2;
            for (var i = 0; i < 3; i++) {
                var lx = w * 0.2 + i * w * 0.3;
                var ly1 = (Math.floor(i * 1.3) + 1) * h / 5 + 10, ly2 = ly1 + h / 5;
                cx.beginPath(); cx.moveTo(lx, ly1); cx.lineTo(lx, ly2); cx.stroke();
                cx.beginPath(); cx.moveTo(lx + 8, ly1); cx.lineTo(lx + 8, ly2); cx.stroke();
                for (var r = 0; r < 4; r++) { cx.beginPath(); cx.moveTo(lx, ly1 + r * (ly2 - ly1) / 4); cx.lineTo(lx + 8, ly1 + r * (ly2 - ly1) / 4); cx.stroke(); }
            }
            var hitIdx = Math.floor(t * 2) % bricks.length;
            for (var i = 0; i < bricks.length; i++) {
                var b = bricks[i]; if (!b.alive) continue;
                if (i === hitIdx && Math.sin(t * 4) > 0.8) {
                    b.alive = false;
                    for (var d = 0; d < 6; d++) debris.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 4, life: 1, r: 1 + Math.random() * 2 });
                    setTimeout(function(bb) { return function() { bb.alive = true; }; }(b), 2000);
                }
                var bg2 = cx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
                bg2.addColorStop(0, '#dd7744'); bg2.addColorStop(0.5, '#cc6633'); bg2.addColorStop(1, '#aa5522');
                cx.fillStyle = bg2; cx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 4);
                cx.strokeStyle = '#994411'; cx.lineWidth = 0.5; cx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 4);
                cx.fillStyle = 'rgba(255,200,150,0.1)'; cx.fillRect(b.x + 2, b.y + 2, b.w - 4, 2);
            }
            for (var i = debris.length - 1; i >= 0; i--) {
                var d = debris[i]; d.x += d.vx; d.y += d.vy; d.vy += 0.15; d.life -= 0.02;
                cx.fillStyle = 'rgba(204,102,51,' + d.life + ')';
                cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, Math.PI * 2); cx.fill();
                if (d.life <= 0) debris.splice(i, 1);
            }
            var px = w * 0.3 + Math.sin(t * 0.8) * w * 0.25, py = h * 0.35;
            cx.fillStyle = '#4488ff'; cx.fillRect(px - 4, py, 8, 10);
            cx.fillStyle = '#ff2222'; cx.fillRect(px - 5, py - 5, 10, 6);
            cx.fillStyle = '#ffcc00'; cx.fillRect(px - 6, py - 8, 12, 4);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(px, py - 5, 3, Math.PI, 0); cx.fill();
            var hammerAngle = Math.sin(t * 6) * 0.8;
            cx.save(); cx.translate(px + 5, py + 2); cx.rotate(hammerAngle);
            cx.fillStyle = '#8B6530'; cx.fillRect(0, -1.5, 14, 3);
            var hg = cx.createLinearGradient(11, -4, 11, 4);
            hg.addColorStop(0, '#bbb'); hg.addColorStop(0.5, '#888'); hg.addColorStop(1, '#666');
            cx.fillStyle = hg; cx.fillRect(11, -4, 6, 8);
            cx.restore();
            for (var i = 0; i < 2; i++) {
                var fx = (t * 40 + i * w * 0.5) % w, fy = h * 0.55 + i * h * 0.2;
                cx.shadowColor = '#ff6600'; cx.shadowBlur = 8;
                cx.fillStyle = '#ff6600'; cx.beginPath(); cx.arc(fx, fy, 5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#ffcc00'; cx.beginPath(); cx.arc(fx, fy, 2, 0, Math.PI * 2); cx.fill();
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Duck Hunt ──
    function animDuckHunt(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var duck = { x: w * 0.3, y: h * 0.3, vx: 1.5, vy: -1, zigTimer: 0 };
        var bang = 0, reeds = [], feathers = [];
        for (var i = 0; i < 10; i++) reeds.push({ x: i * w / 9, h: 15 + Math.random() * 20, sway: Math.random() * 3 });
        function draw() {
            t += 0.02;
            var sky = cx.createLinearGradient(0, 0, 0, h * 0.7);
            sky.addColorStop(0, '#1a3388'); sky.addColorStop(0.4, '#3366bb'); sky.addColorStop(1, '#88ccee');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, h * 0.7);
            cx.fillStyle = 'rgba(255,200,100,0.05)';
            cx.beginPath(); cx.arc(w * 0.8, h * 0.12, 30, 0, Math.PI * 2); cx.fill();
            var gnd = cx.createLinearGradient(0, h * 0.62, 0, h);
            gnd.addColorStop(0, '#228833'); gnd.addColorStop(0.1, '#1a7728'); gnd.addColorStop(1, '#0d4418');
            cx.fillStyle = gnd; cx.fillRect(0, h * 0.65, w, h * 0.35);
            cx.fillStyle = '#226622';
            cx.beginPath(); cx.arc(w * 0.2, h * 0.68, 20, Math.PI, 0); cx.fill();
            cx.beginPath(); cx.arc(w * 0.6, h * 0.7, 24, Math.PI, 0); cx.fill();
            cx.beginPath(); cx.arc(w * 0.85, h * 0.67, 16, Math.PI, 0); cx.fill();
            for (var i = 0; i < reeds.length; i++) {
                var r = reeds[i], rx = r.x, sway = Math.sin(t * 2 + r.sway) * 3;
                cx.strokeStyle = '#2a5520'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(rx, h * 0.66); cx.quadraticCurveTo(rx + sway, h * 0.66 - r.h * 0.5, rx + sway * 1.5, h * 0.66 - r.h); cx.stroke();
            }
            cx.fillStyle = '#cc8844'; cx.fillRect(w * 0.58, h * 0.62, 8, 10);
            cx.fillRect(w * 0.56, h * 0.59, 4, 5); cx.fillRect(w * 0.64, h * 0.59, 4, 5);
            duck.zigTimer += 0.03;
            if (duck.zigTimer > 1) { duck.zigTimer = 0; duck.vy = -duck.vy; duck.vx = 1 + Math.random(); }
            duck.x += duck.vx; duck.y += duck.vy;
            if (duck.x > w + 10) { duck.x = -10; duck.y = h * 0.2 + Math.random() * h * 0.3; }
            if (duck.y < 10 || duck.y > h * 0.55) duck.vy = -duck.vy;
            cx.fillStyle = '#222';
            cx.beginPath(); cx.ellipse(duck.x, duck.y, 9, 5.5, 0, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#33aa33';
            cx.beginPath(); cx.arc(duck.x + 8, duck.y - 3, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#44cc44'; cx.beginPath(); cx.arc(duck.x + 7, duck.y - 4, 2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff8800'; cx.fillRect(duck.x + 12, duck.y - 3, 4, 2);
            cx.fillStyle = '#fff'; cx.fillRect(duck.x + 10, duck.y - 5, 2, 2);
            cx.fillStyle = '#000'; cx.fillRect(duck.x + 10, duck.y - 4, 1, 1);
            var wingY = Math.sin(t * 12) * 6;
            cx.fillStyle = '#444';
            cx.beginPath(); cx.moveTo(duck.x - 3, duck.y); cx.lineTo(duck.x - 1, duck.y - 7 + wingY); cx.lineTo(duck.x + 4, duck.y - 1); cx.fill();
            cx.fillStyle = '#333';
            cx.beginPath(); cx.moveTo(duck.x - 4, duck.y + 1); cx.lineTo(duck.x - 2, duck.y - 5 + wingY * 0.7); cx.lineTo(duck.x + 2, duck.y); cx.fill();
            var chx = duck.x + Math.sin(t * 1.5) * 22;
            var chy = duck.y + Math.cos(t * 1.8) * 16;
            cx.strokeStyle = '#ff2222'; cx.lineWidth = 1.5;
            cx.beginPath(); cx.arc(chx, chy, 14, 0, Math.PI * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(chx - 18, chy); cx.lineTo(chx + 18, chy); cx.stroke();
            cx.beginPath(); cx.moveTo(chx, chy - 18); cx.lineTo(chx, chy + 18); cx.stroke();
            cx.strokeStyle = 'rgba(255,50,50,0.3)'; cx.lineWidth = 0.5;
            cx.beginPath(); cx.arc(chx, chy, 8, 0, Math.PI * 2); cx.stroke();
            if (Math.abs(chx - duck.x) < 16 && Math.abs(chy - duck.y) < 16 && Math.sin(t * 3) > 0.8) {
                bang = 0.8;
                for (var f = 0; f < 4; f++) feathers.push({ x: duck.x, y: duck.y, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3, life: 1 });
            }
            if (bang > 0) {
                cx.shadowColor = '#ffff88'; cx.shadowBlur = 10;
                cx.fillStyle = 'rgba(255,255,100,' + bang + ')';
                cx.font = 'bold 16px monospace'; cx.textAlign = 'center';
                cx.fillText('BANG!', chx, chy - 22);
                cx.shadowBlur = 0;
                bang -= 0.02;
            }
            for (var i = feathers.length - 1; i >= 0; i--) {
                var f = feathers[i]; f.x += f.vx; f.y += f.vy; f.vy += 0.08; f.life -= 0.025;
                if (f.life <= 0) { feathers.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(80,80,80,' + f.life + ')'; cx.fillRect(f.x, f.y, 2, 3);
            }
            if (Math.sin(t * 0.5) > 0.6) {
                var dogX = w * 0.45, dogY = h * 0.78;
                cx.fillStyle = '#8B6530'; cx.fillRect(dogX - 4, dogY, 8, 6);
                cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(dogX, dogY - 2, 5, Math.PI, 0); cx.fill();
                cx.fillStyle = '#333'; cx.fillRect(dogX - 2, dogY - 3, 2, 2); cx.fillRect(dogX + 1, dogY - 3, 2, 2);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.15)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tank ──
    function animTank(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, cs = 20;
        var walls = [], terrain = [];
        for (var x = 0; x < w; x += cs) for (var y = 0; y < h; y += cs) {
            if (x === 0 || y === 0 || x >= w - cs || y >= h - cs || Math.random() < 0.25)
                walls.push({ x: x, y: y });
            else terrain.push({ x: x, y: y, type: Math.random() < 0.15 ? 'water' : Math.random() < 0.3 ? 'dirt' : 'grass' });
        }
        var bullets = [], explosions = [], trails = [];
        function draw() {
            t += 0.02;
            cx.fillStyle = '#060810'; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < terrain.length; i++) {
                var tr = terrain[i];
                if (tr.type === 'grass') cx.fillStyle = 'rgba(20,50,20,0.4)';
                else if (tr.type === 'dirt') cx.fillStyle = 'rgba(50,35,15,0.4)';
                else { cx.fillStyle = 'rgba(15,25,60,' + (0.3 + 0.1 * Math.sin(t * 2 + tr.x * 0.1)) + ')'; }
                cx.fillRect(tr.x + 1, tr.y + 1, cs - 2, cs - 2);
            }
            cx.fillStyle = '#2a3a2a';
            for (var i = 0; i < walls.length; i++) {
                cx.fillRect(walls[i].x + 1, walls[i].y + 1, cs - 2, cs - 2);
                cx.fillStyle = '#354535'; cx.fillRect(walls[i].x + 2, walls[i].y + 2, cs - 6, 2);
                cx.fillStyle = '#2a3a2a';
            }
            var px = w * 0.25 + Math.sin(t * 0.6) * 40, py = h * 0.5 + Math.cos(t * 0.8) * 30, pa = t * 0.8;
            trails.push({ x: px, y: py, life: 1 });
            if (trails.length > 12) trails.shift();
            for (var i = 0; i < trails.length; i++) {
                trails[i].life -= 0.04;
                if (trails[i].life > 0) { cx.fillStyle = 'rgba(30,50,30,' + (trails[i].life * 0.15) + ')'; cx.fillRect(trails[i].x - 5, trails[i].y - 4, 10, 8); }
            }
            cx.save(); cx.translate(px, py); cx.rotate(pa);
            cx.fillStyle = '#338833'; cx.fillRect(-9, -7, 18, 14);
            cx.fillStyle = '#226622'; cx.fillRect(-9, -7, 18, 2); cx.fillRect(-9, 5, 18, 2);
            cx.fillStyle = '#44aa44';
            for (var tr = 0; tr < 4; tr++) { cx.fillRect(-8 + ((t * 20 + tr * 5) % 16), -7, 2, 2); cx.fillRect(-8 + ((t * 20 + tr * 5 + 2) % 16), 5, 2, 2); }
            cx.fillStyle = '#55cc55'; cx.fillRect(-2, -14, 4, 14);
            cx.fillStyle = '#66dd66'; cx.fillRect(-1, -14, 2, 3);
            cx.restore();
            var ex = w * 0.75 + Math.sin(t * 0.5 + 1) * 40, ey = h * 0.4 + Math.cos(t * 0.7 + 1) * 30;
            var ea = Math.atan2(py - ey, px - ex);
            cx.save(); cx.translate(ex, ey); cx.rotate(ea);
            cx.fillStyle = '#bbbbbb'; cx.fillRect(-9, -7, 18, 14);
            cx.fillStyle = '#999'; cx.fillRect(-9, -7, 18, 2); cx.fillRect(-9, 5, 18, 2);
            cx.fillStyle = '#dddddd'; cx.fillRect(-2, -14, 4, 14);
            cx.restore();
            if (Math.random() < 0.02) bullets.push({ x: px, y: py, vx: Math.cos(pa - Math.PI / 2) * 3, vy: Math.sin(pa - Math.PI / 2) * 3, life: 60, c: '#88ff88' });
            if (Math.random() < 0.02) bullets.push({ x: ex, y: ey, vx: Math.cos(ea) * 2.5, vy: Math.sin(ea) * 2.5, life: 60, c: '#ffcc44' });
            for (var i = bullets.length - 1; i >= 0; i--) {
                var b = bullets[i]; b.x += b.vx; b.y += b.vy; b.life--;
                cx.shadowColor = b.c; cx.shadowBlur = 5;
                cx.fillStyle = b.c; cx.fillRect(b.x - 2, b.y - 2, 4, 4);
                cx.shadowBlur = 0;
                if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) {
                    explosions.push({ x: b.x, y: b.y, r: 0, debris: [] });
                    for (var d = 0; d < 6; d++) explosions[explosions.length - 1].debris.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1 });
                    bullets.splice(i, 1);
                }
            }
            for (var i = explosions.length - 1; i >= 0; i--) {
                var e = explosions[i]; e.r += 0.6;
                cx.strokeStyle = 'rgba(255,150,0,' + (1 - e.r / 16) + ')'; cx.lineWidth = 2;
                cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, Math.PI * 2); cx.stroke();
                cx.strokeStyle = 'rgba(255,220,100,' + (1 - e.r / 12) + ')'; cx.lineWidth = 1;
                cx.beginPath(); cx.arc(e.x, e.y, e.r * 0.5, 0, Math.PI * 2); cx.stroke();
                for (var d = e.debris.length - 1; d >= 0; d--) {
                    var db = e.debris[d]; db.x += db.vx; db.y += db.vy; db.life -= 0.04;
                    if (db.life > 0) { cx.fillStyle = 'rgba(255,180,50,' + db.life + ')'; cx.fillRect(db.x, db.y, 2, 2); }
                }
                if (e.r > 16) explosions.splice(i, 1);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Outrun ──
    function animOutrun(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.03;
            var sky = cx.createLinearGradient(0, 0, 0, h * 0.5);
            sky.addColorStop(0, '#0a0a3e'); sky.addColorStop(0.3, '#3318aa'); sky.addColorStop(0.7, '#cc4422'); sky.addColorStop(1, '#ff8844');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, h * 0.5);
            cx.shadowColor = '#ffaa44'; cx.shadowBlur = 20;
            cx.fillStyle = '#ff9944'; cx.beginPath(); cx.arc(w * 0.5, h * 0.42, 20, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#ffcc88'; cx.beginPath(); cx.arc(w * 0.5, h * 0.42, 12, 0, Math.PI * 2); cx.fill();
            var groundG = cx.createLinearGradient(0, h * 0.48, 0, h);
            groundG.addColorStop(0, '#12bb12'); groundG.addColorStop(0.3, '#10aa10'); groundG.addColorStop(1, '#0a880a');
            cx.fillStyle = groundG; cx.fillRect(0, h * 0.48, w, h * 0.52);
            var curve = Math.sin(t * 0.8) * 30;
            var rl = w * 0.32 + curve * 0.3, rr = w * 0.68 + curve * 0.3;
            var roadG = cx.createLinearGradient(rl, 0, rr, 0);
            roadG.addColorStop(0, '#444'); roadG.addColorStop(0.5, '#555'); roadG.addColorStop(1, '#444');
            cx.fillStyle = roadG;
            cx.beginPath(); cx.moveTo(rl, h * 0.48); cx.lineTo(rr, h * 0.48);
            cx.lineTo(w * 0.82 + curve, h); cx.lineTo(w * 0.18 + curve, h); cx.closePath(); cx.fill();
            cx.strokeStyle = '#ddd'; cx.lineWidth = 1.5; cx.setLineDash([6, 10]); cx.lineDashOffset = -t * 80;
            cx.beginPath(); cx.moveTo(w * 0.5 + curve * 0.3, h * 0.5); cx.lineTo(w * 0.5 + curve, h); cx.stroke();
            cx.setLineDash([]);
            for (var s = 0; s < 8; s++) {
                var sy = h * 0.5 + s * (h * 0.5) / 8;
                var frac = (sy - h * 0.5) / (h * 0.5);
                var elx = w * 0.32 + (w * 0.18 - w * 0.32) * frac + curve * (0.3 + frac * 0.7);
                var erx = w * 0.68 + (w * 0.82 - w * 0.68) * frac + curve * (0.3 + frac * 0.7);
                cx.fillStyle = (s + Math.floor(t * 4)) % 2 === 0 ? '#ff0000' : '#ffffff';
                cx.fillRect(elx - 2, sy, 4, h * 0.5 / 8);
                cx.fillRect(erx - 2, sy, 4, h * 0.5 / 8);
            }
            for (var i = 0; i < 3; i++) {
                var ptx = (w * 0.1 + i * w * 0.35 + t * 20) % (w * 1.2) - w * 0.1;
                var depth = 0.5 + (ptx / w) * 0.5;
                cx.fillStyle = '#553311'; cx.fillRect(ptx, h * 0.25 * depth + h * 0.2, 4, 32 * depth);
                cx.fillStyle = '#22aa22';
                cx.beginPath(); cx.arc(ptx + 2, h * 0.25 * depth + h * 0.18, 13 * depth, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#33cc33';
                cx.beginPath(); cx.arc(ptx + 5, h * 0.25 * depth + h * 0.16, 7 * depth, 0, Math.PI * 2); cx.fill();
                var sway = Math.sin(t * 2 + i) * 2 * depth;
                cx.fillStyle = '#228822';
                cx.beginPath(); cx.arc(ptx - 3 + sway, h * 0.25 * depth + h * 0.19, 5 * depth, 0, Math.PI * 2); cx.fill();
            }
            var carX = w * 0.5 + Math.sin(t * 1.5) * 15 + curve * 0.8;
            cx.fillStyle = '#ee1111';
            cx.beginPath(); cx.moveTo(carX - 14, h * 0.93); cx.lineTo(carX - 11, h * 0.84);
            cx.quadraticCurveTo(carX, h * 0.81, carX + 11, h * 0.84);
            cx.lineTo(carX + 14, h * 0.93); cx.closePath(); cx.fill();
            cx.fillStyle = '#cc0000'; cx.fillRect(carX - 8, h * 0.87, 16, 3);
            cx.fillStyle = '#88ccff'; cx.fillRect(carX - 6, h * 0.845, 12, 3);
            cx.fillStyle = '#ffcc00'; cx.fillRect(carX - 12, h * 0.91, 3, 2); cx.fillRect(carX + 10, h * 0.91, 3, 2);
            cx.fillStyle = '#222'; cx.fillRect(carX - 12, h * 0.93, 5, 2); cx.fillRect(carX + 8, h * 0.93, 5, 2);
            var vg = cx.createRadialGradient(w / 2, h * 0.4, w * 0.15, w / 2, h / 2, w * 0.85);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pole Position ──
    function animPolePosition(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.03;
            var sky = cx.createLinearGradient(0, 0, 0, h * 0.45);
            sky.addColorStop(0, '#1133aa'); sky.addColorStop(1, '#4488dd');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, h * 0.45);
            cx.fillStyle = 'rgba(255,255,255,0.06)';
            for (var i = 0; i < 4; i++) {
                cx.beginPath(); cx.arc(w * 0.15 + i * w * 0.25, h * 0.3, 15 + i * 5, 0, Math.PI * 2); cx.fill();
            }
            cx.fillStyle = 'rgba(100,80,60,0.15)';
            for (var i = 0; i < 8; i++) cx.fillRect((t * 100 + i * 60) % (w + 20) - 10, h * 0.42 + (i % 3), 12, 2);
            var gndG = cx.createLinearGradient(0, h * 0.45, 0, h);
            gndG.addColorStop(0, '#118811'); gndG.addColorStop(1, '#0a660a');
            cx.fillStyle = gndG; cx.fillRect(0, h * 0.45, w, h * 0.55);
            cx.fillStyle = '#666';
            cx.beginPath(); cx.moveTo(w * 0.35, h * 0.45); cx.lineTo(w * 0.65, h * 0.45);
            cx.lineTo(w * 0.85, h); cx.lineTo(w * 0.15, h); cx.closePath(); cx.fill();
            for (var s = 0; s < 10; s++) {
                var sy = h * 0.45 + s * (h * 0.55) / 10;
                var frac = s / 10;
                var elx = w * 0.35 + (w * 0.15 - w * 0.35) * frac;
                var erx = w * 0.65 + (w * 0.85 - w * 0.65) * frac;
                var cw = 4 + frac * 5;
                cx.fillStyle = (s + Math.floor(t * 5)) % 2 === 0 ? '#fff' : '#ff0000';
                cx.fillRect(elx - cw, sy, cw * 2, h * 0.55 / 10);
                cx.fillRect(erx - cw, sy, cw * 2, h * 0.55 / 10);
            }
            cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.setLineDash([5, 8]); cx.lineDashOffset = -t * 90;
            cx.beginPath(); cx.moveTo(w * 0.5, h * 0.47); cx.lineTo(w * 0.5, h); cx.stroke();
            cx.setLineDash([]);
            cx.fillStyle = 'rgba(0,0,0,0.6)'; cx.fillRect(w * 0.22, 3, w * 0.56, 18);
            cx.fillStyle = '#00ff00'; cx.font = 'bold 10px monospace'; cx.textAlign = 'center';
            cx.fillText('LAP ' + (1 + Math.floor(t * 0.5) % 3) + '/3  ' + (t * 10 % 60).toFixed(1) + 's', w * 0.5, 16);
            cx.fillStyle = '#ff2222';
            cx.fillRect(w * 0.46, h * 0.81, 12, 20);
            cx.fillRect(w * 0.43, h * 0.87, 18, 5);
            cx.fillStyle = '#cc0000'; cx.fillRect(w * 0.47, h * 0.82, 10, 4);
            cx.fillStyle = '#ffcc00'; cx.fillRect(w * 0.47, h * 0.82, 10, 2);
            cx.fillStyle = '#fff'; cx.fillRect(w * 0.47, h * 0.84, 10, 1);
            cx.fillStyle = '#222';
            cx.fillRect(w * 0.44, h * 0.92, 4, 3); cx.fillRect(w * 0.56, h * 0.92, 4, 3);
            for (var i = 0; i < 3; i++) {
                var oy = h * 0.5 + (t * 50 + i * 60) % (h * 0.35);
                var frac2 = (oy - h * 0.5) / (h * 0.5);
                var sc = 0.4 + frac2 * 0.6;
                var ox = w * 0.4 + (i - 1) * 30 * sc + Math.sin(t + i) * 10 * sc;
                cx.fillStyle = ['#4488ff', '#44cc44', '#ff8844'][i];
                cx.fillRect(ox, oy, 8 * sc, 14 * sc);
                cx.fillRect(ox - 2 * sc, oy + 6 * sc, 12 * sc, 3 * sc);
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(ox + 1, oy + 1, 6 * sc, 3 * sc);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.15)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Track & Field ──
    function animTrackField(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, ground = h * 0.72;
        function draw() {
            t += 0.03;
            var sky = cx.createLinearGradient(0, 0, 0, ground - 10);
            sky.addColorStop(0, '#1a2855'); sky.addColorStop(1, '#334488');
            cx.fillStyle = sky; cx.fillRect(0, 0, w, ground - 10);
            cx.fillStyle = 'rgba(255,220,120,0.03)';
            for (var i = 0; i < 6; i++) { cx.beginPath(); cx.arc(w * 0.15 + i * w * 0.15, ground - 20, 4, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = 'rgba(150,130,100,0.1)';
            for (var i = 0; i < 30; i++) cx.fillRect(w * 0.05 + (i * 13) % (w * 0.9), ground - 30 - (i * 7) % 20, 3, 2);
            for (var i = 0; i < 4; i++) {
                var tg = cx.createLinearGradient(0, ground + i * 12, 0, ground + i * 12 + 12);
                tg.addColorStop(0, i % 2 === 0 ? '#cc5533' : '#bb4422');
                tg.addColorStop(1, i % 2 === 0 ? '#aa4422' : '#993311');
                cx.fillStyle = tg; cx.fillRect(0, ground + i * 12, w, 12);
                cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 0.5;
                cx.beginPath(); cx.moveTo(0, ground + i * 12); cx.lineTo(w, ground + i * 12); cx.stroke();
            }
            for (var i = 0; i < 3; i++) {
                var hx = (i * w * 0.35 + t * 60) % (w + 40) - 20;
                cx.fillStyle = '#ffdd33'; cx.fillRect(hx, ground - 12, 3, 16);
                cx.fillRect(hx - 5, ground - 12, 13, 2);
                cx.fillStyle = '#ddb822'; cx.fillRect(hx - 4, ground - 11, 11, 1);
            }
            cx.fillStyle = '#ddcc88'; cx.fillRect(w * 0.7, ground, w * 0.15, 48);
            cx.fillStyle = '#ccbb77'; cx.fillRect(w * 0.7, ground, w * 0.15, 3);
            var rx = w * 0.25, ry = ground - 2, legPhase = Math.sin(t * 12);
            cx.fillStyle = '#ff3333'; cx.fillRect(rx - 4, ry - 18, 8, 12);
            cx.fillStyle = '#dd2222'; cx.fillRect(rx - 3, ry - 16, 2, 4);
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(rx, ry - 22, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#333'; cx.fillRect(rx + 1, ry - 23, 2, 1);
            cx.fillStyle = '#4444cc';
            cx.fillRect(rx - 3 + legPhase * 4, ry - 6, 3, 8);
            cx.fillRect(rx - 3 - legPhase * 4, ry - 6, 3, 8);
            cx.fillStyle = '#ffccaa';
            cx.fillRect(rx - 7 - legPhase * 3, ry - 16, 3, 6);
            cx.fillRect(rx + 4 + legPhase * 3, ry - 16, 3, 6);
            cx.fillStyle = 'rgba(0,0,0,0.65)'; cx.fillRect(w * 0.28, 3, w * 0.44, 18);
            cx.fillStyle = '#00ff00'; cx.font = 'bold 10px monospace'; cx.textAlign = 'center';
            cx.fillText('TIME ' + (t * 5 % 20).toFixed(2) + 's', w * 0.5, 16);
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.15)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Solitaire ──
    function animSolitaire(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cols = [], suits = ['\u2660', '\u2665', '\u2666', '\u2663'];
        for (var c = 0; c < 7; c++) {
            var col = [];
            for (var r = 0; r <= c; r++) col.push({ face: r === c, val: Math.floor(Math.random() * 13) + 1, suit: Math.floor(Math.random() * 4) });
            cols.push(col);
        }
        var winFireworks = [];
        function draw() {
            t += 0.016;
            var felt = cx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
            felt.addColorStop(0, '#007700'); felt.addColorStop(1, '#004400');
            cx.fillStyle = felt; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(0,60,0,0.3)';
            for (var i = 0; i < 12; i++) cx.fillRect((i * 37 + 3) % w, (i * 29 + 7) % h, 6, 3);
            for (var i = 0; i < 4; i++) {
                var fx = w * 0.55 + i * 28;
                cx.strokeStyle = 'rgba(255,255,255,0.12)'; cx.lineWidth = 1;
                cx.strokeRect(fx, 6, 22, 30);
                var fill = Math.floor(t * 0.3 + i) % 5;
                if (fill > 0) {
                    cx.fillStyle = '#fffff8'; cx.fillRect(fx + 1, 7, 20, 28);
                    cx.fillStyle = i < 2 ? '#000' : '#cc0000';
                    cx.font = '9px serif'; cx.textAlign = 'center';
                    cx.fillText(suits[i], fx + 11, 26);
                    cx.font = '6px serif';
                    cx.fillText(['A', '2', '3', '4'][fill - 1], fx + 5, 14);
                }
            }
            var colW = 24, gap = (w - colW * 7) / 8;
            for (var c = 0; c < 7; c++) {
                var col = cols[c];
                for (var r = 0; r < col.length; r++) {
                    var cx2 = gap + c * (colW + gap), cy2 = 44 + r * 12;
                    if (col[r].face) {
                        cx.fillStyle = '#fffff8'; cx.fillRect(cx2, cy2, colW, 28);
                        cx.strokeStyle = '#bbb'; cx.lineWidth = 0.5; cx.strokeRect(cx2, cy2, colW, 28);
                        cx.fillStyle = col[r].suit >= 2 ? '#cc0000' : '#111';
                        cx.font = '7px monospace'; cx.textAlign = 'left';
                        cx.fillText(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][col[r].val - 1], cx2 + 2, cy2 + 10);
                        cx.font = '8px serif'; cx.fillText(suits[col[r].suit], cx2 + colW - 10, cy2 + 22);
                    } else {
                        var cardBack = cx.createLinearGradient(cx2, cy2, cx2 + colW, cy2 + 12);
                        cardBack.addColorStop(0, '#cc2222'); cardBack.addColorStop(1, '#aa1111');
                        cx.fillStyle = cardBack; cx.fillRect(cx2, cy2, colW, 12);
                        cx.strokeStyle = '#880000'; cx.lineWidth = 0.5; cx.strokeRect(cx2, cy2, colW, 12);
                        cx.fillStyle = 'rgba(255,255,255,0.1)';
                        cx.fillRect(cx2 + 3, cy2 + 2, colW - 6, 8);
                        cx.strokeStyle = 'rgba(255,200,0,0.15)'; cx.lineWidth = 0.5;
                        cx.strokeRect(cx2 + 4, cy2 + 3, colW - 8, 6);
                    }
                }
            }
            var dragX = w * 0.3 + Math.sin(t * 0.8) * 40, dragY = h * 0.4 + Math.cos(t * 0.6) * 20;
            cx.shadowColor = 'rgba(0,0,0,0.6)'; cx.shadowBlur = 8; cx.shadowOffsetX = 3; cx.shadowOffsetY = 3;
            cx.fillStyle = '#fffff8'; cx.fillRect(dragX, dragY, colW, 28);
            cx.shadowBlur = 0; cx.shadowOffsetX = 0; cx.shadowOffsetY = 0;
            cx.fillStyle = '#cc0000'; cx.font = '8px monospace'; cx.textAlign = 'left';
            cx.fillText('K\u2665', dragX + 2, dragY + 12);
            cx.font = '10px serif'; cx.fillText('\u2665', dragX + colW - 12, dragY + 24);
            if (Math.random() < 0.02) winFireworks.push({ x: Math.random() * w, y: Math.random() * h * 0.5, r: 0, c: ['#ff4444', '#44ff44', '#4444ff', '#ffff44'][Math.floor(Math.random() * 4)], life: 1 });
            for (var i = winFireworks.length - 1; i >= 0; i--) {
                var fw = winFireworks[i]; fw.r += 0.8; fw.life -= 0.02;
                if (fw.life <= 0) { winFireworks.splice(i, 1); continue; }
                cx.strokeStyle = fw.c; cx.globalAlpha = fw.life; cx.lineWidth = 1.5;
                for (var a = 0; a < 8; a++) {
                    var ang = a * Math.PI / 4;
                    cx.beginPath(); cx.moveTo(fw.x + Math.cos(ang) * fw.r * 0.5, fw.y + Math.sin(ang) * fw.r * 0.5);
                    cx.lineTo(fw.x + Math.cos(ang) * fw.r, fw.y + Math.sin(ang) * fw.r); cx.stroke();
                }
            }
            cx.globalAlpha = 1;
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.85);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Nonogram ──
    function animNonogram(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gridSize = 8, cs = Math.min((w - 40) / gridSize, (h - 40) / gridSize);
        var ox = 36, oy = 36;
        var pattern = [
            [0, 1, 1, 0, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        var revealed = [];
        for (var r = 0; r < gridSize; r++) { revealed[r] = []; for (var c = 0; c < gridSize; c++) revealed[r][c] = false; }
        var fillOrder = [];
        for (var r = 0; r < gridSize; r++) for (var c = 0; c < gridSize; c++) if (pattern[r][c]) fillOrder.push({ r: r, c: c });
        for (var i = fillOrder.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = fillOrder[i]; fillOrder[i] = fillOrder[j]; fillOrder[j] = tmp; }
        var fillIdx = 0, fillTimer = 0, inkSplash = [];
        function draw() {
            t += 0.016; fillTimer += 0.016;
            var bg = cx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
            bg.addColorStop(0, '#0e0e38'); bg.addColorStop(1, '#06061e');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            if (fillTimer > 0.15 && fillIdx < fillOrder.length) {
                fillTimer = 0;
                revealed[fillOrder[fillIdx].r][fillOrder[fillIdx].c] = true;
                var sx = ox + fillOrder[fillIdx].c * cs + cs / 2, sy = oy + fillOrder[fillIdx].r * cs + cs / 2;
                for (var p = 0; p < 3; p++) inkSplash.push({ x: sx, y: sy, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1 });
                fillIdx++;
            }
            if (fillIdx >= fillOrder.length && fillTimer > 2) {
                fillIdx = 0; fillTimer = 0;
                for (var r = 0; r < gridSize; r++) for (var c = 0; c < gridSize; c++) revealed[r][c] = false;
            }
            cx.strokeStyle = 'rgba(80,80,180,0.12)'; cx.lineWidth = 0.5;
            for (var r = 0; r <= gridSize; r++) { cx.beginPath(); cx.moveTo(ox, oy + r * cs); cx.lineTo(ox + gridSize * cs, oy + r * cs); cx.stroke(); }
            for (var c = 0; c <= gridSize; c++) { cx.beginPath(); cx.moveTo(ox + c * cs, oy); cx.lineTo(ox + c * cs, oy + gridSize * cs); cx.stroke(); }
            for (var r = 0; r < gridSize; r++) for (var c = 0; c < gridSize; c++) {
                if (revealed[r][c]) {
                    var cg = cx.createRadialGradient(ox + c * cs + cs / 2, oy + r * cs + cs / 2, 0, ox + c * cs + cs / 2, oy + r * cs + cs / 2, cs * 0.6);
                    cg.addColorStop(0, '#5599ff'); cg.addColorStop(1, '#3366cc');
                    cx.fillStyle = cg; cx.fillRect(ox + c * cs + 1, oy + r * cs + 1, cs - 2, cs - 2);
                    cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.fillRect(ox + c * cs + 2, oy + r * cs + 2, cs - 6, 2);
                }
            }
            for (var i = inkSplash.length - 1; i >= 0; i--) {
                var sp = inkSplash[i]; sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.05;
                if (sp.life <= 0) { inkSplash.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(80,140,255,' + sp.life * 0.6 + ')';
                cx.beginPath(); cx.arc(sp.x, sp.y, 1.5, 0, Math.PI * 2); cx.fill();
            }
            cx.font = '7px monospace'; cx.textAlign = 'right';
            for (var r = 0; r < gridSize; r++) {
                var count = 0; for (var c = 0; c < gridSize; c++) count += pattern[r][c];
                var rowDone = true; for (var c = 0; c < gridSize; c++) if (pattern[r][c] && !revealed[r][c]) rowDone = false;
                cx.fillStyle = rowDone ? 'rgba(100,255,100,0.8)' : 'rgba(150,150,255,0.5)';
                if (count > 0) cx.fillText(count, ox - 4, oy + r * cs + cs * 0.7);
            }
            cx.textAlign = 'center';
            for (var c = 0; c < gridSize; c++) {
                var count = 0; for (var r = 0; r < gridSize; r++) count += pattern[r][c];
                var colDone = true; for (var r = 0; r < gridSize; r++) if (pattern[r][c] && !revealed[r][c]) colDone = false;
                cx.fillStyle = colDone ? 'rgba(100,255,100,0.8)' : 'rgba(150,150,255,0.5)';
                if (count > 0) cx.fillText(count, ox + c * cs + cs / 2, oy - 4);
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Zaxxon ──
    function animZaxxon(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#020218'); bg.addColorStop(0.5, '#050530'); bg.addColorStop(1, '#080840');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(100,120,200,0.04)';
            for (var i = 0; i < 15; i++) cx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1);
            cx.strokeStyle = 'rgba(60,80,150,0.12)'; cx.lineWidth = 0.5;
            for (var i = 0; i < 12; i++) {
                var offset = (t * 20 + i * 20) % 240 - 40;
                cx.beginPath(); cx.moveTo(0, h * 0.5 + offset * 0.3); cx.lineTo(w, h * 0.3 + offset * 0.3); cx.stroke();
                cx.beginPath(); cx.moveTo(i * w / 10, h * 0.3); cx.lineTo(i * w / 10 - 30, h); cx.stroke();
            }
            var wallX = w * 0.6 + Math.sin(t * 0.5) * 20;
            var wg = cx.createLinearGradient(wallX, 0, wallX + 20, 0);
            wg.addColorStop(0, '#445577'); wg.addColorStop(1, '#223344');
            cx.fillStyle = wg;
            cx.beginPath(); cx.moveTo(wallX, h * 0.1); cx.lineTo(wallX + 8, h * 0.15);
            cx.lineTo(wallX + 8, h * 0.35); cx.lineTo(wallX, h * 0.4); cx.closePath(); cx.fill();
            cx.beginPath(); cx.moveTo(wallX, h * 0.55); cx.lineTo(wallX + 8, h * 0.6);
            cx.lineTo(wallX + 8, h * 0.85); cx.lineTo(wallX, h * 0.9); cx.closePath(); cx.fill();
            cx.fillStyle = 'rgba(0,0,0,0.25)';
            cx.beginPath(); cx.moveTo(wallX + 8, h * 0.15); cx.lineTo(wallX + 22, h * 0.2);
            cx.lineTo(wallX + 22, h * 0.9); cx.lineTo(wallX + 8, h * 0.85); cx.closePath(); cx.fill();
            cx.fillStyle = 'rgba(100,150,255,0.08)';
            for (var i = 0; i < 3; i++) cx.fillRect(wallX + 2, h * 0.15 + i * 8, 4, 3);
            for (var i = 0; i < 3; i++) {
                var fx = w * 0.15 + i * w * 0.25, fy = h * 0.7 + i * 8;
                cx.fillStyle = '#ff6600'; cx.fillRect(fx, fy, 10, 6);
                cx.fillStyle = '#cc4400'; cx.fillRect(fx + 2, fy - 2, 6, 2);
                cx.fillStyle = '#ffaa44'; cx.fillRect(fx + 3, fy + 1, 4, 2);
            }
            cx.fillStyle = 'rgba(0,0,0,0.6)'; cx.fillRect(w * 0.02, h * 0.85, w * 0.2, 10);
            cx.fillStyle = '#44ff44'; cx.fillRect(w * 0.03, h * 0.86, w * 0.18 * (0.5 + 0.3 * Math.sin(t)), 6);
            cx.fillStyle = '#88ff88'; cx.font = '6px monospace'; cx.textAlign = 'left'; cx.fillText('FUEL', w * 0.03, h * 0.83);
            var shipX = w * 0.3 + Math.sin(t) * 30, shipY = h * 0.45 + Math.cos(t * 1.5) * 15;
            cx.shadowColor = '#44aaff'; cx.shadowBlur = 6;
            cx.fillStyle = '#44aaff';
            cx.beginPath(); cx.moveTo(shipX + 12, shipY); cx.lineTo(shipX - 6, shipY - 6);
            cx.lineTo(shipX - 10, shipY); cx.lineTo(shipX - 6, shipY + 6); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#66ccff'; cx.fillRect(shipX - 2, shipY - 1, 6, 2);
            cx.fillStyle = 'rgba(68,170,255,0.3)'; cx.fillRect(shipX - 14, shipY - 1, 6, 2);
            cx.fillStyle = 'rgba(0,0,0,0.15)';
            cx.beginPath(); cx.ellipse(shipX, shipY + 42, 9, 3, 0, 0, Math.PI * 2); cx.fill();
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Jungle Hunt ──
    function animJungleHunt(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a2a0a'); bg.addColorStop(0.3, '#0d3310'); bg.addColorStop(1, '#061a08');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var canopy = cx.createLinearGradient(0, 0, 0, h * 0.3);
            canopy.addColorStop(0, '#0d3310'); canopy.addColorStop(1, '#1a5528');
            cx.fillStyle = canopy; cx.fillRect(0, 0, w, h * 0.3);
            cx.fillStyle = '#0a2a0c';
            for (var i = 0; i < 6; i++) { cx.beginPath(); cx.arc(i * w / 5 - 10, h * 0.15, 32 + Math.sin(i) * 10, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#1a5528';
            for (var i = 0; i < 5; i++) { cx.beginPath(); cx.arc(i * w / 4, h * 0.28, 26, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#10441a';
            for (var i = 0; i < 8; i++) { cx.beginPath(); cx.arc(i * w / 7 + 5, h * 0.22, 12 + (i % 3) * 5, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#553311';
            cx.fillRect(w * 0.15, h * 0.05, 7, h * 0.5);
            cx.fillRect(w * 0.5, h * 0.05, 7, h * 0.5);
            cx.fillRect(w * 0.82, h * 0.05, 7, h * 0.5);
            cx.fillStyle = '#442208';
            cx.fillRect(w * 0.15, h * 0.05, 2, h * 0.5);
            cx.fillRect(w * 0.5, h * 0.05, 2, h * 0.5);
            var vines = [{ x: w * 0.18, y: h * 0.15, len: h * 0.35 }, { x: w * 0.53, y: h * 0.12, len: h * 0.38 }, { x: w * 0.85, y: h * 0.18, len: h * 0.3 }];
            cx.lineWidth = 2.5;
            for (var i = 0; i < vines.length; i++) {
                var v = vines[i], swing = Math.sin(t * 2 + i * 1.5) * 22;
                var vg = cx.createLinearGradient(v.x, v.y, v.x + swing, v.y + v.len);
                vg.addColorStop(0, '#558833'); vg.addColorStop(1, '#336622');
                cx.strokeStyle = vg;
                cx.beginPath(); cx.moveTo(v.x, v.y);
                cx.quadraticCurveTo(v.x + swing, v.y + v.len * 0.5, v.x + swing * 0.6, v.y + v.len);
                cx.stroke();
                for (var lf = 0; lf < 3; lf++) {
                    var lfy = v.y + v.len * (0.3 + lf * 0.25), lfx = v.x + swing * (0.3 + lf * 0.2);
                    cx.fillStyle = '#44aa33'; cx.beginPath(); cx.ellipse(lfx, lfy, 4, 2, swing * 0.02, 0, Math.PI * 2); cx.fill();
                }
            }
            var activeVine = Math.floor(t * 0.3) % 3;
            var v = vines[activeVine], swing = Math.sin(t * 2 + activeVine * 1.5) * 22;
            var charX = v.x + swing * 0.5, charY = v.y + v.len * 0.6;
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(charX, charY - 7, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#44cc44'; cx.fillRect(charX - 3, charY - 3, 6, 9);
            cx.fillStyle = '#ffccaa';
            cx.fillRect(charX - 5, charY - 2, 2, 5); cx.fillRect(charX + 3, charY - 2, 2, 5);
            cx.fillRect(charX - 2, charY + 6, 2, 4); cx.fillRect(charX + 1, charY + 6, 2, 4);
            var riverG = cx.createLinearGradient(0, h * 0.75, 0, h);
            riverG.addColorStop(0, '#1a4488'); riverG.addColorStop(1, '#0d2244');
            cx.fillStyle = riverG; cx.fillRect(0, h * 0.75, w, h * 0.25);
            cx.strokeStyle = 'rgba(100,180,255,0.2)'; cx.lineWidth = 1;
            for (var i = 0; i < 4; i++) {
                cx.beginPath();
                for (var x = 0; x <= w; x += 8) cx.lineTo(x, h * 0.77 + i * 8 + Math.sin(x * 0.05 + t * 3 + i) * 3);
                cx.stroke();
            }
            var crocX = (t * 30) % (w + 40) - 20;
            cx.fillStyle = '#336633';
            cx.beginPath(); cx.ellipse(crocX, h * 0.85, 16, 5, 0, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#2a552a';
            cx.beginPath(); cx.ellipse(crocX + 12, h * 0.84, 6, 3.5, -0.2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff3333'; cx.fillRect(crocX + 14, h * 0.84, 3, 1);
            cx.fillStyle = '#ffcc00'; cx.fillRect(crocX + 9, h * 0.83, 2, 1);
            cx.fillStyle = '#224422';
            for (var i = 0; i < 4; i++) cx.fillRect(crocX - 10 + i * 6, h * 0.845, 2, 2);
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,10,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Donkey Kong Jr ──
    function animDonkeyKongJr(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a2a'); bg.addColorStop(1, '#0a0a1a');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var vines = [w * 0.2, w * 0.4, w * 0.6, w * 0.8];
            for (var i = 0; i < vines.length; i++) {
                var vg = cx.createLinearGradient(vines[i] - 3, 0, vines[i] + 3, 0);
                vg.addColorStop(0, '#2a4418'); vg.addColorStop(0.5, '#447733'); vg.addColorStop(1, '#2a4418');
                cx.fillStyle = vg; cx.fillRect(vines[i] - 2, 0, 4, h);
                cx.fillStyle = '#335522';
                for (var y = 8; y < h; y += 16) {
                    cx.fillRect(vines[i] - 4, y, 8, 3);
                    cx.fillStyle = '#2a4418'; cx.fillRect(vines[i] - 3, y + 1, 1, 1);
                    cx.fillStyle = '#335522';
                }
            }
            cx.strokeStyle = '#888'; cx.lineWidth = 2;
            cx.strokeRect(w * 0.3, 7, w * 0.4, 32);
            for (var i = 0; i < 4; i++) {
                cx.beginPath(); cx.moveTo(w * 0.3 + i * w * 0.1 + w * 0.05, 7);
                cx.lineTo(w * 0.3 + i * w * 0.1 + w * 0.05, 39); cx.stroke();
            }
            cx.strokeStyle = '#666'; cx.lineWidth = 1;
            cx.strokeRect(w * 0.31, 8, w * 0.38, 30);
            cx.fillStyle = '#8B4513'; cx.fillRect(w * 0.44, 13, 16, 18);
            cx.fillStyle = '#cc8844'; cx.fillRect(w * 0.46, 9, 12, 8);
            cx.fillStyle = '#aa6633'; cx.beginPath(); cx.arc(w * 0.5, 16, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#fff'; cx.fillRect(w * 0.48, 15, 2, 2); cx.fillRect(w * 0.52, 15, 2, 2);
            cx.fillStyle = '#000'; cx.fillRect(w * 0.485, 15.5, 1, 1); cx.fillRect(w * 0.525, 15.5, 1, 1);
            var climbVine = Math.floor(t * 0.5) % 4;
            var jx = vines[climbVine], jy = h * 0.7 - (t * 15 % (h * 0.5));
            if (jy < h * 0.2) jy = h * 0.7;
            cx.fillStyle = '#cc8844'; cx.fillRect(jx - 5, jy - 4, 10, 11);
            cx.fillStyle = '#aa6633'; cx.fillRect(jx - 4, jy - 2, 8, 4);
            cx.fillStyle = '#ffddaa'; cx.beginPath(); cx.arc(jx, jy - 8, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#cc8844'; cx.beginPath(); cx.arc(jx, jy - 12, 3, Math.PI, 0); cx.fill();
            cx.fillStyle = '#fff'; cx.fillRect(jx - 3, jy - 9, 2, 2); cx.fillRect(jx + 1, jy - 9, 2, 2);
            cx.fillStyle = '#000'; cx.fillRect(jx - 2, jy - 8, 1, 1); cx.fillRect(jx + 2, jy - 8, 1, 1);
            cx.strokeStyle = '#cc8844'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(jx - 5, jy); cx.lineTo(jx - 2, jy - 7 + Math.sin(t * 8) * 3); cx.stroke();
            cx.beginPath(); cx.moveTo(jx + 5, jy); cx.lineTo(jx + 2, jy - 7 - Math.sin(t * 8) * 3); cx.stroke();
            for (var i = 0; i < 3; i++) {
                var sv = (i + 1) % 4, sy = (t * 25 + i * 80) % h;
                cx.fillStyle = '#ff3333';
                cx.fillRect(vines[sv] - 6, sy - 3, 12, 6);
                cx.fillRect(vines[sv] + 4, sy - 5, 6, 5);
                cx.fillStyle = '#ff5555'; cx.fillRect(vines[sv] - 4, sy - 2, 8, 3);
                cx.fillStyle = '#fff'; cx.fillRect(vines[sv] + 6, sy - 4, 2, 2);
                cx.fillStyle = '#000'; cx.fillRect(vines[sv] + 7, sy - 3, 1, 1);
                cx.fillStyle = '#cc2222'; cx.fillRect(vines[sv] + 5, sy + 1, 4, 2);
            }
            var fruits = [{ x: w * 0.3, y: h * 0.35 }, { x: w * 0.7, y: h * 0.5 }, { x: w * 0.5, y: h * 0.65 }];
            for (var i = 0; i < fruits.length; i++) {
                var glow = 0.5 + 0.3 * Math.sin(t * 3 + i);
                cx.shadowColor = 'rgba(255,255,0,0.6)'; cx.shadowBlur = 6;
                cx.fillStyle = 'rgba(255,255,0,' + glow + ')';
                cx.beginPath(); cx.arc(fruits[i].x, fruits[i].y, 5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(255,255,200,0.4)'; cx.beginPath(); cx.arc(fruits[i].x - 1, fruits[i].y - 2, 2, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#44aa00'; cx.fillRect(fruits[i].x - 1, fruits[i].y - 7, 2, 3);
                cx.fillStyle = '#228800'; cx.beginPath(); cx.ellipse(fruits[i].x + 2, fruits[i].y - 6, 3, 1.5, 0.3, 0, Math.PI * 2); cx.fill();
            }
            var keyLinks = [{ x: w * 0.35, y: h * 0.15 }, { x: w * 0.45, y: h * 0.12 }, { x: w * 0.55, y: h * 0.14 }, { x: w * 0.65, y: h * 0.11 }];
            cx.strokeStyle = '#ccaa44'; cx.lineWidth = 1.5;
            for (var i = 0; i < keyLinks.length - 1; i++) {
                cx.beginPath(); cx.moveTo(keyLinks[i].x, keyLinks[i].y + Math.sin(t * 2 + i) * 2);
                cx.lineTo(keyLinks[i + 1].x, keyLinks[i + 1].y + Math.sin(t * 2 + i + 1) * 2); cx.stroke();
            }
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Mr. Do! ──
    function animMrDo(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var tunnels = [
            { x1: w * 0.1, y1: h * 0.3, x2: w * 0.5, y2: h * 0.3 },
            { x1: w * 0.5, y1: h * 0.3, x2: w * 0.5, y2: h * 0.6 },
            { x1: w * 0.5, y1: h * 0.6, x2: w * 0.85, y2: h * 0.6 },
            { x1: w * 0.2, y1: h * 0.5, x2: w * 0.5, y2: h * 0.5 },
            { x1: w * 0.2, y1: h * 0.3, x2: w * 0.2, y2: h * 0.7 },
            { x1: w * 0.2, y1: h * 0.7, x2: w * 0.7, y2: h * 0.7 },
            { x1: w * 0.7, y1: h * 0.4, x2: w * 0.9, y2: h * 0.4 },
            { x1: w * 0.7, y1: h * 0.4, x2: w * 0.7, y2: h * 0.7 }
        ];
        var ball = { x: 0, y: 0, vx: 2, vy: 0, active: false, life: 0 }, sparkles = [];
        function draw() {
            t += 0.02;
            var soilG = cx.createLinearGradient(0, h * 0.15, 0, h);
            soilG.addColorStop(0, '#6a4a2a'); soilG.addColorStop(0.3, '#5a3a1a'); soilG.addColorStop(1, '#4a2a0a');
            cx.fillStyle = soilG; cx.fillRect(0, 0, w, h);
            var grassG = cx.createLinearGradient(0, 0, 0, h * 0.15);
            grassG.addColorStop(0, '#44bb44'); grassG.addColorStop(1, '#337733');
            cx.fillStyle = grassG; cx.fillRect(0, 0, w, h * 0.15);
            cx.fillStyle = '#2a6622'; cx.fillRect(0, h * 0.13, w, 4);
            cx.fillStyle = 'rgba(80,50,20,0.25)';
            for (var i = 0; i < 25; i++) cx.fillRect((i * 53 + 7) % w, h * 0.15 + (i * 37 + 11) % (h * 0.85), 3 + (i % 3), 2);
            cx.fillStyle = 'rgba(60,40,15,0.15)';
            for (var i = 0; i < 10; i++) { cx.beginPath(); cx.arc((i * 67 + 13) % w, h * 0.2 + (i * 41 + 23) % (h * 0.7), 2, 0, Math.PI * 2); cx.fill(); }
            cx.strokeStyle = '#0a0500'; cx.lineWidth = 14; cx.lineCap = 'round';
            for (var i = 0; i < tunnels.length; i++) {
                var tn = tunnels[i]; cx.beginPath(); cx.moveTo(tn.x1, tn.y1); cx.lineTo(tn.x2, tn.y2); cx.stroke();
            }
            cx.strokeStyle = '#1a0a02'; cx.lineWidth = 12;
            for (var i = 0; i < tunnels.length; i++) {
                var tn = tunnels[i]; cx.beginPath(); cx.moveTo(tn.x1, tn.y1); cx.lineTo(tn.x2, tn.y2); cx.stroke();
            }
            cx.strokeStyle = 'rgba(40,25,5,0.3)'; cx.lineWidth = 10;
            for (var i = 0; i < tunnels.length; i++) {
                var tn = tunnels[i]; cx.beginPath(); cx.moveTo(tn.x1, tn.y1); cx.lineTo(tn.x2, tn.y2); cx.stroke();
            }
            var doX = w * 0.3 + Math.sin(t * 1.2) * w * 0.15, doY = h * 0.5 + Math.cos(t * 0.8) * 10;
            cx.fillStyle = '#ff3333'; cx.beginPath(); cx.arc(doX, doY, 7, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff5555'; cx.beginPath(); cx.arc(doX - 1, doY - 2, 3, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#fff';
            cx.beginPath(); cx.arc(doX - 2, doY - 2, 2, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(doX + 3, doY - 2, 2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#111';
            cx.beginPath(); cx.arc(doX - 1.5, doY - 1.5, 0.8, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(doX + 3.5, doY - 1.5, 0.8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(doX, doY - 9, 4, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#ffee88'; cx.beginPath(); cx.arc(doX - 1, doY - 10, 1.5, 0, Math.PI * 2); cx.fill();
            if (!ball.active && Math.sin(t * 2) > 0.9) {
                ball.active = true; ball.x = doX + 8; ball.y = doY; ball.vx = 2.5; ball.vy = 0; ball.life = 80;
            }
            if (ball.active) {
                ball.x += ball.vx; ball.y += ball.vy;
                if (ball.x > w - 5 || ball.x < 5) ball.vx = -ball.vx;
                if (ball.y > h - 5 || ball.y < h * 0.15) ball.vy = -ball.vy;
                ball.life--;
                if (ball.life <= 0) ball.active = false;
                cx.shadowColor = '#00eeff'; cx.shadowBlur = 10;
                cx.fillStyle = '#00ccff'; cx.beginPath(); cx.arc(ball.x, ball.y, 4, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#88eeff'; cx.beginPath(); cx.arc(ball.x - 1, ball.y - 1, 1.5, 0, Math.PI * 2); cx.fill();
                if (Math.random() < 0.3) sparkles.push({ x: ball.x, y: ball.y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 1 });
            }
            for (var i = sparkles.length - 1; i >= 0; i--) {
                var sp = sparkles[i]; sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.06;
                if (sp.life <= 0) { sparkles.splice(i, 1); continue; }
                cx.fillStyle = 'rgba(0,220,255,' + sp.life + ')'; cx.fillRect(sp.x, sp.y, 1.5, 1.5);
            }
            var cherries = [{ x: w * 0.6, y: h * 0.35 }, { x: w * 0.75, y: h * 0.55 }, { x: w * 0.35, y: h * 0.68 }];
            for (var i = 0; i < cherries.length; i++) {
                var ch = cherries[i];
                cx.fillStyle = '#ff2255'; cx.shadowColor = '#ff2255'; cx.shadowBlur = 3;
                cx.beginPath(); cx.arc(ch.x - 3, ch.y, 3.5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(ch.x + 3, ch.y, 3.5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.arc(ch.x - 4, ch.y - 1, 1.5, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = '#44aa00'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.moveTo(ch.x - 2, ch.y - 3); cx.quadraticCurveTo(ch.x, ch.y - 9, ch.x + 2, ch.y - 3); cx.stroke();
                cx.fillStyle = '#33aa00'; cx.beginPath(); cx.ellipse(ch.x + 1, ch.y - 7, 3, 1.5, 0.5, 0, Math.PI * 2); cx.fill();
            }
            for (var i = 0; i < 3; i++) {
                var mx = w * 0.6 + Math.sin(t * 1.5 + i * 2) * 25;
                var my = h * 0.6 + Math.cos(t + i * 2.5) * 10 + i * 20;
                if (my > h - 5) my = h * 0.6;
                var mc = ['#ff8800', '#aa44ff', '#44cccc'][i];
                cx.fillStyle = mc; cx.beginPath(); cx.arc(mx, my, 6, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.beginPath(); cx.arc(mx - 1, my - 2, 2, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#fff'; cx.fillRect(mx - 3, my - 2, 2.5, 2.5); cx.fillRect(mx + 1, my - 2, 2.5, 2.5);
                cx.fillStyle = '#000'; cx.fillRect(mx - 2, my - 1, 1, 1); cx.fillRect(mx + 2, my - 1, 1, 1);
            }
            var treeX = w * 0.5, treeY = h * 0.08;
            cx.fillStyle = '#663311'; cx.fillRect(treeX - 2, treeY, 4, h * 0.08);
            cx.fillStyle = '#44aa00';
            cx.beginPath(); cx.arc(treeX, treeY, 8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#55cc00'; cx.beginPath(); cx.arc(treeX + 3, treeY - 3, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff4444'; cx.beginPath(); cx.arc(treeX + 2, treeY + 2 + Math.sin(t * 0.5) * 2, 3, 0, Math.PI * 2); cx.fill();
            var vg = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }


    // ── Preview: Simon ──
    function animSimon(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, active = -1, timer = 0, seq = 0;
        var pads = [
            { x: 0.08, y: 0.08, c: '#cc0000', lit: '#ff4444', g1: '#aa0000', g2: '#ff2222' },
            { x: 0.52, y: 0.08, c: '#008800', lit: '#33ff33', g1: '#006600', g2: '#22ee22' },
            { x: 0.08, y: 0.52, c: '#0000cc', lit: '#4488ff', g1: '#000099', g2: '#3366ff' },
            { x: 0.52, y: 0.52, c: '#ccaa00', lit: '#ffee44', g1: '#aa8800', g2: '#ffdd22' }
        ];
        var particles = [];
        function draw() {
            t += 0.016; timer += 0.016;
            var bg = cx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
            bg.addColorStop(0, '#12122e'); bg.addColorStop(1, '#050510');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            if (timer > 0.6) { timer = 0; seq = (seq + 1) % 5; active = seq < 4 ? seq : -1;
                if (active >= 0) { var p = pads[active]; for (var k = 0; k < 6; k++) particles.push({x: p.x * w + w * 0.2, y: p.y * h + h * 0.2, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 1, c: p.lit}); }
            }
            var pw = w * 0.4, ph = h * 0.4;
            for (var i = 0; i < 4; i++) {
                var p = pads[i], isA = (i === active);
                var rx = p.x * w, ry = p.y * h, rad = Math.min(pw, ph) * 0.12;
                var grd = cx.createLinearGradient(rx, ry, rx + pw, ry + ph);
                grd.addColorStop(0, isA ? p.lit : p.g1); grd.addColorStop(1, isA ? p.g2 : p.c);
                cx.fillStyle = grd; cx.globalAlpha = isA ? 1.0 : 0.5;
                cx.beginPath(); cx.moveTo(rx + rad, ry);
                cx.lineTo(rx + pw - rad, ry); cx.quadraticCurveTo(rx + pw, ry, rx + pw, ry + rad);
                cx.lineTo(rx + pw, ry + ph - rad); cx.quadraticCurveTo(rx + pw, ry + ph, rx + pw - rad, ry + ph);
                cx.lineTo(rx + rad, ry + ph); cx.quadraticCurveTo(rx, ry + ph, rx, ry + ph - rad);
                cx.lineTo(rx, ry + rad); cx.quadraticCurveTo(rx, ry, rx + rad, ry);
                cx.closePath(); cx.fill();
                cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(rx + 4, ry + 2, pw - 8, ph * 0.3);
                cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.fillRect(rx + 4, ry + ph * 0.7, pw - 8, ph * 0.28);
                if (isA) { cx.shadowColor = p.lit; cx.shadowBlur = 25; cx.fill(); cx.shadowBlur = 0;
                    cx.strokeStyle = p.lit; cx.lineWidth = 2; cx.globalAlpha = 0.6 + Math.sin(t * 12) * 0.4;
                    cx.beginPath(); cx.arc(rx + pw / 2, ry + ph / 2, Math.min(pw, ph) * 0.45, 0, Math.PI * 2); cx.stroke();
                }
            }
            cx.globalAlpha = 1;
            var hubGrad = cx.createRadialGradient(w/2 - 2, h/2 - 2, 0, w/2, h/2, w * 0.09);
            hubGrad.addColorStop(0, '#555'); hubGrad.addColorStop(0.7, '#222'); hubGrad.addColorStop(1, '#111');
            cx.fillStyle = hubGrad; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.085, 0, Math.PI * 2); cx.fill();
            cx.strokeStyle = '#666'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.085, 0, Math.PI * 2); cx.stroke();
            cx.fillStyle = '#888'; cx.font = 'bold ' + Math.round(w * 0.03) + 'px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText('SIMON', w / 2, h / 2);
            for (var pi = particles.length - 1; pi >= 0; pi--) {
                var pp = particles[pi]; pp.x += pp.vx; pp.y += pp.vy; pp.life -= 0.03;
                cx.fillStyle = pp.c; cx.globalAlpha = pp.life * 0.6;
                cx.fillRect(pp.x - 1.5, pp.y - 1.5, 3, 3);
                if (pp.life <= 0) particles.splice(pi, 1);
            }
            cx.globalAlpha = 1;
            cx.fillStyle = 'rgba(0,0,0,0.3)';
            cx.fillRect(0, 0, w, h * 0.03); cx.fillRect(0, h * 0.97, w, h * 0.03);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Connect Four ──
    function animConnectFour(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cols = 7, rows = 6, cs = Math.min(w / (cols + 1), h / (rows + 2));
        var ox = (w - cols * cs) / 2, oy = h - rows * cs - cs * 0.5;
        var grid = [], bounceMap = [];
        for (var r = 0; r < rows; r++) { grid[r] = []; bounceMap[r] = []; for (var c = 0; c < cols; c++) { grid[r][c] = 0; bounceMap[r][c] = 0; } }
        var dropCol = Math.floor(Math.random() * cols), dropY = oy - cs, dropTarget = 0, dropColor = 1, bounceV = 0;
        function emptyRow(col) { for (var r = rows - 1; r >= 0; r--) { if (!grid[r][col]) return r; } return -1; }
        dropTarget = emptyRow(dropCol);
        var particles = [];
        function draw() {
            t += 0.016;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a2a'); bg.addColorStop(1, '#050518');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var boardGrad = cx.createLinearGradient(ox - 4, oy - 4, ox - 4, oy + rows * cs + 8);
            boardGrad.addColorStop(0, '#1133cc'); boardGrad.addColorStop(0.5, '#0d22aa'); boardGrad.addColorStop(1, '#081888');
            cx.fillStyle = boardGrad;
            cx.beginPath(); var br = 6;
            cx.moveTo(ox - 4 + br, oy - 4); cx.lineTo(ox + cols * cs + 4 - br, oy - 4);
            cx.quadraticCurveTo(ox + cols * cs + 4, oy - 4, ox + cols * cs + 4, oy - 4 + br);
            cx.lineTo(ox + cols * cs + 4, oy + rows * cs + 4 - br);
            cx.quadraticCurveTo(ox + cols * cs + 4, oy + rows * cs + 4, ox + cols * cs + 4 - br, oy + rows * cs + 4);
            cx.lineTo(ox - 4 + br, oy + rows * cs + 4);
            cx.quadraticCurveTo(ox - 4, oy + rows * cs + 4, ox - 4, oy + rows * cs + 4 - br);
            cx.lineTo(ox - 4, oy - 4 + br);
            cx.quadraticCurveTo(ox - 4, oy - 4, ox - 4 + br, oy - 4);
            cx.fill();
            cx.fillStyle = 'rgba(255,255,255,0.06)'; cx.fillRect(ox - 2, oy - 2, cols * cs + 4, 6);
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
                var px = ox + c * cs + cs / 2, py = oy + r * cs + cs / 2;
                var bOff = bounceMap[r][c] > 0 ? Math.sin(bounceMap[r][c] * Math.PI) * -4 : 0;
                if (bounceMap[r][c] > 0) bounceMap[r][c] -= 0.04;
                cx.fillStyle = '#060616'; cx.beginPath(); cx.arc(px, py + 2, cs * 0.38, 0, Math.PI * 2); cx.fill();
                if (grid[r][c] === 1) {
                    var rg = cx.createRadialGradient(px - 2, py + bOff - 2, 1, px, py + bOff, cs * 0.38);
                    rg.addColorStop(0, '#ff6666'); rg.addColorStop(0.7, '#ee2222'); rg.addColorStop(1, '#aa0000');
                    cx.fillStyle = rg;
                } else if (grid[r][c] === 2) {
                    var yg = cx.createRadialGradient(px - 2, py + bOff - 2, 1, px, py + bOff, cs * 0.38);
                    yg.addColorStop(0, '#ffee66'); yg.addColorStop(0.7, '#ffcc00'); yg.addColorStop(1, '#cc9900');
                    cx.fillStyle = yg;
                } else { cx.fillStyle = '#0a0a20'; }
                cx.beginPath(); cx.arc(px, py + bOff, cs * 0.38, 0, Math.PI * 2); cx.fill();
                if (grid[r][c]) { cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.arc(px - cs * 0.12, py + bOff - cs * 0.12, cs * 0.14, 0, Math.PI * 2); cx.fill(); }
            }
            if (dropTarget >= 0) {
                var targetY = oy + dropTarget * cs + cs / 2;
                dropY += (targetY - dropY) * 0.15;
                var dg = cx.createRadialGradient(ox + dropCol * cs + cs / 2 - 2, dropY - 2, 1, ox + dropCol * cs + cs / 2, dropY, cs * 0.38);
                if (dropColor === 1) { dg.addColorStop(0, '#ff6666'); dg.addColorStop(1, '#cc0000'); }
                else { dg.addColorStop(0, '#ffee66'); dg.addColorStop(1, '#ccaa00'); }
                cx.fillStyle = dg; cx.shadowColor = dropColor === 1 ? '#ff2222' : '#ffcc00'; cx.shadowBlur = 8;
                cx.beginPath(); cx.arc(ox + dropCol * cs + cs / 2, dropY, cs * 0.38, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                if (Math.abs(dropY - targetY) < 1) {
                    grid[dropTarget][dropCol] = dropColor; bounceMap[dropTarget][dropCol] = 1;
                    for (var k = 0; k < 5; k++) particles.push({x: ox + dropCol * cs + cs/2, y: targetY, vx: (Math.random()-0.5)*4, vy: -Math.random()*3, life: 0.7, c: dropColor === 1 ? '#ff4444' : '#ffcc00'});
                    dropColor = dropColor === 1 ? 2 : 1;
                    var tries = 0;
                    do { dropCol = Math.floor(Math.random() * cols); dropTarget = emptyRow(dropCol); tries++; } while (dropTarget < 0 && tries < 20);
                    if (dropTarget < 0) { for (var r2 = 0; r2 < rows; r2++) for (var c2 = 0; c2 < cols; c2++) { grid[r2][c2] = 0; bounceMap[r2][c2] = 0; } dropCol = Math.floor(Math.random() * cols); dropTarget = emptyRow(dropCol); }
                    dropY = oy - cs;
                }
            }
            for (var pi = particles.length - 1; pi >= 0; pi--) { var pp = particles[pi]; pp.x += pp.vx; pp.y += pp.vy; pp.vy += 0.15; pp.life -= 0.03; cx.fillStyle = pp.c; cx.globalAlpha = pp.life; cx.fillRect(pp.x-1,pp.y-1,3,3); if (pp.life <= 0) particles.splice(pi, 1); }
            cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Galaga ──
    function animGalaga(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, aliens = [], bullets = [], trails = [];
        for (var r = 0; r < 3; r++) for (var c = 0; c < 7; c++) aliens.push({ hx: c * 36 + 55, hy: r * 28 + 25, x: 0, y: 0, diving: false, dt: 0, da: 0 });
        var stars = []; for (var s = 0; s < 50; s++) stars.push({x: Math.random()*w, y: Math.random()*h, sp: 0.3 + Math.random()*1.5, sz: 0.5 + Math.random()});
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#02020e'); bg.addColorStop(0.5, '#080828'); bg.addColorStop(1, '#04040a');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var s = 0; s < stars.length; s++) { var st = stars[s]; st.y += st.sp; if (st.y > h) { st.y = 0; st.x = Math.random() * w; }
                cx.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.3 * Math.sin(t * 3 + s)) + ')'; cx.fillRect(st.x, st.y, st.sz, st.sz); }
            var sx = Math.sin(t * 1.2) * 25;
            if (Math.random() < 0.008) { var ai = Math.floor(Math.random() * aliens.length); if (!aliens[ai].diving) { aliens[ai].diving = true; aliens[ai].dt = 0; aliens[ai].da = Math.random() * Math.PI * 2; } }
            var colors = ['#ff3366', '#00ccff', '#ffcc00'];
            for (var i = 0; i < aliens.length; i++) {
                var a = aliens[i], col = colors[Math.floor(i / 7) % 3];
                if (a.diving) { a.dt += 0.03; a.x = a.hx + sx + Math.sin(a.dt * 3 + a.da) * 60; a.y = a.hy + a.dt * 120;
                    trails.push({x: a.x, y: a.y, life: 0.5, c: col});
                    if (a.y > h + 20) { a.diving = false; a.dt = 0; } }
                else { a.x = a.hx + sx; a.y = a.hy + Math.sin(t + i * 0.3) * 5; }
                cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = 6;
                cx.beginPath(); cx.arc(a.x, a.y, 5, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.ellipse(a.x - 7, a.y - 2, 5, 3, -0.3, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.ellipse(a.x + 7, a.y - 2, 5, 3, 0.3, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(255,255,255,0.4)'; cx.beginPath(); cx.arc(a.x, a.y - 2, 2, 0, Math.PI * 2); cx.fill();
            }
            for (var ti = trails.length - 1; ti >= 0; ti--) { var tr = trails[ti]; tr.life -= 0.04; cx.fillStyle = tr.c; cx.globalAlpha = tr.life * 0.3; cx.beginPath(); cx.arc(tr.x, tr.y, 3 * tr.life, 0, Math.PI * 2); cx.fill(); if (tr.life <= 0) trails.splice(ti, 1); }
            cx.globalAlpha = 1;
            if (Math.random() < 0.04) bullets.push({ x: w / 2 + Math.sin(t) * 40, y: h - 30 });
            cx.fillStyle = '#00ff66'; cx.shadowColor = '#00ff66'; cx.shadowBlur = 5;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].y -= 5; cx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 8); if (bullets[b].y < 0) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            var px = w / 2 + Math.sin(t * 1.5) * 40;
            cx.fillStyle = '#ffffff';
            cx.beginPath(); cx.moveTo(px, h - 28); cx.lineTo(px - 10, h - 16); cx.lineTo(px + 10, h - 16); cx.closePath(); cx.fill();
            cx.fillStyle = '#00ccff'; cx.fillRect(px - 12, h - 16, 6, 4); cx.fillRect(px + 6, h - 16, 6, 4);
            cx.fillStyle = '#ff6600'; cx.globalAlpha = 0.5 + Math.sin(t * 10) * 0.3;
            cx.beginPath(); cx.moveTo(px - 3, h - 14); cx.lineTo(px + 3, h - 14); cx.lineTo(px, h - 8); cx.closePath(); cx.fill();
            cx.globalAlpha = 1;
            var vig = cx.createRadialGradient(w/2, h/2, w*0.3, w/2, h/2, w*0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tic-Tac-Toe ──
    function animTicTacToe(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = Math.min(w, h) * 0.24, ox = (w - cs * 3) / 2, oy = (h - cs * 3) / 2;
        var moves = [], step = 0, timer = 0, order = [], winLine = null, winTimer = 0;
        function shuffle() { order = []; moves = []; step = 0; winLine = null; winTimer = 0; var cells = [0,1,2,3,4,5,6,7,8]; for (var i = cells.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = cells[i]; cells[i] = cells[j]; cells[j] = tmp; } order = cells; }
        shuffle();
        var dustParts = [];
        function draw() {
            t += 0.016; timer += 0.016;
            var bg = cx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.6);
            bg.addColorStop(0, '#1a1a10'); bg.addColorStop(1, '#0a0a08');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(60,55,40,0.04)';
            for (var i = 0; i < 20; i++) cx.fillRect((i * 47 + 5) % w, (i * 31 + 9) % h, 3 + (i % 4), 2 + (i % 3));
            cx.strokeStyle = 'rgba(220,210,180,0.35)'; cx.lineWidth = 3; cx.lineCap = 'round';
            cx.shadowColor = 'rgba(200,190,160,0.2)'; cx.shadowBlur = 3;
            for (var i = 1; i < 3; i++) {
                cx.beginPath(); cx.moveTo(ox + i * cs + Math.sin(i*2)*1.5, oy - 3); cx.lineTo(ox + i * cs - Math.sin(i)*1, oy + cs * 3 + 3); cx.stroke();
                cx.beginPath(); cx.moveTo(ox - 3, oy + i * cs + Math.cos(i)*1.5); cx.lineTo(ox + cs * 3 + 3, oy + i * cs - Math.cos(i*3)*1); cx.stroke();
            }
            cx.shadowBlur = 0;
            if (timer > 0.55) { timer = 0; if (step < 9) { moves.push({ cell: order[step], type: step % 2 === 0 ? 'X' : 'O', prog: 0 }); step++;
                dustParts.push({x: ox + (order[step-1]%3) * cs + cs/2, y: oy + Math.floor(order[step-1]/3) * cs + cs/2, life: 0.5});
            } else { shuffle(); } }
            for (var m = 0; m < moves.length; m++) {
                var mv = moves[m]; mv.prog = Math.min(mv.prog + 0.08, 1);
                var r = Math.floor(mv.cell / 3), c = mv.cell % 3;
                var cx2 = ox + c * cs + cs / 2, cy2 = oy + r * cs + cs / 2, sz = cs * 0.32 * mv.prog;
                if (mv.type === 'X') {
                    cx.strokeStyle = '#5599ff'; cx.lineWidth = 3.5; cx.lineCap = 'round';
                    cx.shadowColor = '#5599ff'; cx.shadowBlur = 6;
                    var p1 = Math.min(mv.prog * 2, 1), p2 = Math.max((mv.prog - 0.5) * 2, 0);
                    if (p1 > 0) { cx.beginPath(); cx.moveTo(cx2 - sz, cy2 - sz); cx.lineTo(cx2 - sz + sz * 2 * p1, cy2 - sz + sz * 2 * p1); cx.stroke(); }
                    if (p2 > 0) { cx.beginPath(); cx.moveTo(cx2 + sz, cy2 - sz); cx.lineTo(cx2 + sz - sz * 2 * p2, cy2 - sz + sz * 2 * p2); cx.stroke(); }
                } else {
                    cx.strokeStyle = '#ff5577'; cx.lineWidth = 3.5; cx.lineCap = 'round';
                    cx.shadowColor = '#ff5577'; cx.shadowBlur = 6;
                    cx.beginPath(); cx.arc(cx2, cy2, sz, 0, Math.PI * 2 * mv.prog); cx.stroke();
                }
                cx.shadowBlur = 0;
            }
            for (var di = dustParts.length - 1; di >= 0; di--) { var dp = dustParts[di]; dp.life -= 0.02; cx.fillStyle = 'rgba(220,210,180,' + dp.life + ')';
                for (var k = 0; k < 3; k++) cx.fillRect(dp.x + (Math.random()-0.5)*20, dp.y + (Math.random()-0.5)*20, 2, 1);
                if (dp.life <= 0) dustParts.splice(di, 1); }
            if (step >= 9 && !winLine) { winLine = {prog: 0}; }
            if (winLine) { winLine.prog = Math.min(winLine.prog + 0.03, 1);
                cx.strokeStyle = '#ffcc44'; cx.lineWidth = 4; cx.shadowColor = '#ffcc44'; cx.shadowBlur = 10; cx.globalAlpha = winLine.prog;
                cx.beginPath(); cx.moveTo(ox + cs * 0.5, oy + cs * 0.5); cx.lineTo(ox + cs * 0.5 + cs * 2 * winLine.prog, oy + cs * 0.5 + cs * 2 * winLine.prog); cx.stroke();
                cx.shadowBlur = 0; cx.globalAlpha = 1;
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: 2048 ──
    function animGame2048(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var gs = 4, pad = 6, cs = (Math.min(w, h) - pad * 5) / gs;
        var ox = (w - gs * cs - (gs + 1) * pad) / 2 + pad, oy = (h - gs * cs - (gs + 1) * pad) / 2 + pad;
        var tileColors = { 2:['#eee4da','#d6cfc0'], 4:['#ede0c8','#d5c9b0'], 8:['#f2b179','#da9560'], 16:['#f59563','#dd7d4a'], 32:['#f67c5f','#de6447'], 64:['#f65e3b','#de4622'], 128:['#edcf72','#d5b75a'], 256:['#edcc61','#d5b449'] };
        var textColors = { 2:'#776e65', 4:'#776e65', 8:'#f9f6f2', 16:'#f9f6f2', 32:'#f9f6f2', 64:'#f9f6f2', 128:'#f9f6f2', 256:'#f9f6f2' };
        var vals = [2,4,8,16,32,64,128,256], grid = [], scales = [];
        function fillGrid() { grid = []; scales = []; for (var r = 0; r < gs; r++) { grid[r] = []; scales[r] = []; for (var c = 0; c < gs; c++) { grid[r][c] = Math.random() < 0.7 ? vals[Math.floor(Math.random() * vals.length)] : 0; scales[r][c] = grid[r][c] ? 0.8 + Math.random() * 0.2 : 1; } } }
        fillGrid(); var slideTimer = 0;
        function draw() {
            t += 0.016; slideTimer += 0.016;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0e0e22'); bg.addColorStop(1, '#060612');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var bx = ox - pad, by = oy - pad, bw = gs * cs + (gs + 1) * pad, bh = bw, brad = 8;
            var boardGrad = cx.createLinearGradient(bx, by, bx, by + bh);
            boardGrad.addColorStop(0, '#c4a98a'); boardGrad.addColorStop(1, '#a08870');
            cx.fillStyle = boardGrad; cx.globalAlpha = 0.95;
            cx.beginPath(); cx.moveTo(bx + brad, by); cx.lineTo(bx + bw - brad, by); cx.quadraticCurveTo(bx + bw, by, bx + bw, by + brad); cx.lineTo(bx + bw, by + bh - brad); cx.quadraticCurveTo(bx + bw, by + bh, bx + bw - brad, by + bh); cx.lineTo(bx + brad, by + bh); cx.quadraticCurveTo(bx, by + bh, bx, by + bh - brad); cx.lineTo(bx, by + brad); cx.quadraticCurveTo(bx, by, bx + brad, by); cx.fill();
            cx.globalAlpha = 1;
            for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
                var tx = ox + c * (cs + pad), ty = oy + r * (cs + pad), v = grid[r][c], tr = 5;
                scales[r][c] = Math.min(scales[r][c] + 0.04, 1);
                var sc = scales[r][c];
                var tcol = v ? tileColors[v] : null;
                if (tcol) { var tg = cx.createLinearGradient(tx, ty, tx, ty + cs); tg.addColorStop(0, tcol[0]); tg.addColorStop(1, tcol[1]); cx.fillStyle = tg; }
                else { cx.fillStyle = 'rgba(238,228,218,0.35)'; }
                cx.save(); cx.translate(tx + cs / 2, ty + cs / 2); cx.scale(sc, sc); cx.translate(-(tx + cs / 2), -(ty + cs / 2));
                cx.beginPath(); cx.moveTo(tx + tr, ty); cx.lineTo(tx + cs - tr, ty); cx.quadraticCurveTo(tx + cs, ty, tx + cs, ty + tr); cx.lineTo(tx + cs, ty + cs - tr); cx.quadraticCurveTo(tx + cs, ty + cs, tx + cs - tr, ty + cs); cx.lineTo(tx + tr, ty + cs); cx.quadraticCurveTo(tx, ty + cs, tx, ty + cs - tr); cx.lineTo(tx, ty + tr); cx.quadraticCurveTo(tx, ty, tx + tr, ty); cx.fill();
                if (v) {
                    cx.fillStyle = 'rgba(255,255,255,0.12)'; cx.fillRect(tx + 2, ty + 2, cs - 4, cs * 0.15);
                    cx.fillStyle = textColors[v] || '#f9f6f2';
                    cx.shadowColor = 'rgba(0,0,0,0.25)'; cx.shadowBlur = 2; cx.shadowOffsetY = 1;
                    var fs = v >= 100 ? cs * 0.28 : cs * 0.38; cx.font = 'bold ' + Math.round(fs) + 'px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
                    cx.fillText(v, tx + cs / 2, ty + cs / 2 + 1); cx.shadowBlur = 0; cx.shadowOffsetY = 0;
                }
                cx.restore();
            }
            if (slideTimer > 1.8) { slideTimer = 0; fillGrid(); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Lunar Lander ──
    function animLunarLander(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, terrain = [], starArr = [], thrustParts = [];
        for (var i = 0; i <= 20; i++) terrain.push({ x: i * w / 20, y: h * 0.72 + Math.sin(i * 1.3) * 18 + Math.random() * 12 });
        terrain[9].y = terrain[10].y = terrain[11].y = h * 0.75;
        for (var s = 0; s < 50; s++) starArr.push({ x: Math.random() * w, y: Math.random() * h * 0.65, b: Math.random(), sz: 0.5 + Math.random() * 1.5 });
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#020210'); bg.addColorStop(0.6, '#0a0a28'); bg.addColorStop(1, '#0a0a18');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var s = 0; s < starArr.length; s++) { var st = starArr[s]; cx.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.4 * Math.sin(t * 2 + st.b * 10)) + ')'; cx.fillRect(st.x, st.y, st.sz, st.sz); }
            var moonGrd = cx.createLinearGradient(0, h * 0.7, 0, h);
            moonGrd.addColorStop(0, '#555555'); moonGrd.addColorStop(0.4, '#3a3a3a'); moonGrd.addColorStop(1, '#222222');
            cx.fillStyle = moonGrd; cx.beginPath(); cx.moveTo(0, h);
            for (var i = 0; i < terrain.length; i++) cx.lineTo(terrain[i].x, terrain[i].y);
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            for (var cr = 0; cr < 5; cr++) { var crx = (cr * 73 + 20) % w, cry = h * 0.78 + (cr * 31 % 20); cx.fillStyle = 'rgba(0,0,0,0.15)'; cx.beginPath(); cx.ellipse(crx, cry, 8 + cr * 2, 3 + cr, 0, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 6;
            cx.fillRect(terrain[9].x, terrain[9].y - 2, terrain[11].x - terrain[9].x, 3);
            cx.shadowBlur = 0;
            var shipX = w * 0.35 + Math.sin(t * 0.5) * 60, shipY = h * 0.15 + ((t * 8) % (h * 0.55));
            cx.fillStyle = '#dddddd';
            cx.beginPath(); cx.moveTo(shipX, shipY - 10); cx.lineTo(shipX - 8, shipY + 5); cx.lineTo(shipX + 8, shipY + 5); cx.closePath(); cx.fill();
            cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.moveTo(shipX - 2, shipY - 8); cx.lineTo(shipX - 6, shipY + 3); cx.lineTo(shipX - 2, shipY + 3); cx.closePath(); cx.fill();
            cx.strokeStyle = '#999'; cx.lineWidth = 1.5;
            cx.beginPath(); cx.moveTo(shipX - 6, shipY + 5); cx.lineTo(shipX - 10, shipY + 12); cx.stroke();
            cx.beginPath(); cx.moveTo(shipX + 6, shipY + 5); cx.lineTo(shipX + 10, shipY + 12); cx.stroke();
            for (var p = 0; p < 6; p++) { thrustParts.push({x: shipX + (Math.random()-0.5)*6, y: shipY + 6 + Math.random()*3, vx: (Math.random()-0.5)*1.5, vy: 1 + Math.random()*2, life: 0.5 + Math.random()*0.3, c: Math.random() < 0.5 ? '#ff6600' : '#ffcc00'}); }
            for (var pi = thrustParts.length - 1; pi >= 0; pi--) { var pp = thrustParts[pi]; pp.x += pp.vx; pp.y += pp.vy; pp.life -= 0.04;
                cx.fillStyle = pp.c; cx.globalAlpha = pp.life; cx.fillRect(pp.x - 1, pp.y - 1, 2 + Math.random(), 2 + Math.random());
                if (pp.life <= 0) thrustParts.splice(pi, 1); }
            cx.globalAlpha = 1;
            cx.fillStyle = '#33ff66'; cx.font = '8px monospace'; cx.textAlign = 'left';
            var alt = Math.max(0, Math.round((h * 0.72 - shipY) / 2));
            cx.fillText('ALT:' + alt, 6, h - 20);
            cx.fillStyle = '#444'; cx.fillRect(6, h - 14, 40, 5);
            cx.fillStyle = '#44cc44'; cx.fillRect(6, h - 14, 40 * (0.5 + Math.sin(t * 0.3) * 0.3), 5);
            cx.fillStyle = '#aaa'; cx.font = '6px monospace'; cx.fillText('FUEL', 6, h - 4);
            var vig = cx.createRadialGradient(w/2, h/2, w*0.25, w/2, h/2, w*0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Bomberman ──
    function animBomberman(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, gs = 14, cs = Math.min(w, h) / gs;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2, walls = [];
        for (var r = 0; r < gs; r++) for (var c = 0; c < gs; c++) {
            if (r === 0 || r === gs - 1 || c === 0 || c === gs - 1) walls.push({ x: c, y: r, t: 'solid' });
            else if (r % 2 === 0 && c % 2 === 0) walls.push({ x: c, y: r, t: 'solid' });
            else if (Math.random() < 0.3) walls.push({ x: c, y: r, t: 'soft' });
        }
        var bombX = 3, bombY = 3, bombTimer = 0, exploding = false, explodeTimer = 0, sparks = [];
        function draw() {
            t += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            var floorGrad = cx.createLinearGradient(ox, oy, ox + gs * cs, oy + gs * cs);
            floorGrad.addColorStop(0, '#2e6e1e'); floorGrad.addColorStop(1, '#1e5e10');
            cx.fillStyle = floorGrad; cx.fillRect(ox, oy, gs * cs, gs * cs);
            for (var fx = 0; fx < gs; fx++) for (var fy = 0; fy < gs; fy++) { cx.fillStyle = (fx + fy) % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'; cx.fillRect(ox + fx * cs, oy + fy * cs, cs, cs); }
            for (var i = 0; i < walls.length; i++) {
                var wl = walls[i];
                if (wl.t === 'solid') {
                    var wg = cx.createLinearGradient(ox + wl.x * cs, oy + wl.y * cs, ox + wl.x * cs, oy + (wl.y + 1) * cs);
                    wg.addColorStop(0, '#777'); wg.addColorStop(1, '#444');
                    cx.fillStyle = wg; cx.fillRect(ox + wl.x * cs + 0.5, oy + wl.y * cs + 0.5, cs - 1, cs - 1);
                    cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(ox + wl.x * cs + 1, oy + wl.y * cs + 1, cs - 2, 3);
                } else {
                    var sg = cx.createLinearGradient(ox + wl.x * cs, oy + wl.y * cs, ox + wl.x * cs, oy + (wl.y + 1) * cs);
                    sg.addColorStop(0, '#997755'); sg.addColorStop(1, '#775533');
                    cx.fillStyle = sg; cx.fillRect(ox + wl.x * cs + 0.5, oy + wl.y * cs + 0.5, cs - 1, cs - 1);
                    cx.strokeStyle = 'rgba(0,0,0,0.2)'; cx.lineWidth = 0.5;
                    cx.strokeRect(ox + wl.x * cs + 2, oy + wl.y * cs + 2, cs * 0.4, cs * 0.4);
                    cx.strokeRect(ox + wl.x * cs + cs * 0.5, oy + wl.y * cs + cs * 0.5, cs * 0.4, cs * 0.35);
                }
            }
            var charX = 2 + Math.sin(t * 1.2) * 1.5, charY = 2 + Math.cos(t * 0.9) * 1.5;
            var ccx = ox + charX * cs + cs / 2, ccy = oy + charY * cs + cs / 2;
            cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(ccx, ccy - 2, cs * 0.3, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.beginPath(); cx.arc(ccx - 2, ccy - 4, 1.5, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(ccx + 2, ccy - 4, 1.5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#3355ff'; cx.fillRect(ccx - cs * 0.25, ccy + cs * 0.05, cs * 0.5, cs * 0.3);
            bombTimer += 0.016;
            if (!exploding && bombTimer > 2.0) { exploding = true; explodeTimer = 0;
                for (var k = 0; k < 15; k++) sparks.push({x: ox + bombX * cs + cs/2, y: oy + bombY * cs + cs/2, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6, life: 0.8}); }
            if (exploding) {
                explodeTimer += 0.016;
                var ep = Math.max(0, 1 - explodeTimer * 1.5);
                for (var d = -3; d <= 3; d++) {
                    var fade = 1 - Math.abs(d) * 0.15;
                    var fg = cx.createRadialGradient(ox + (bombX + d) * cs + cs/2, oy + bombY * cs + cs/2, 0, ox + (bombX + d) * cs + cs/2, oy + bombY * cs + cs/2, cs * 0.6);
                    fg.addColorStop(0, 'rgba(255,200,0,' + ep * fade + ')'); fg.addColorStop(1, 'rgba(255,80,0,' + ep * fade * 0.3 + ')');
                    cx.fillStyle = fg; cx.fillRect(ox + (bombX + d) * cs, oy + bombY * cs, cs, cs);
                    var fg2 = cx.createRadialGradient(ox + bombX * cs + cs/2, oy + (bombY + d) * cs + cs/2, 0, ox + bombX * cs + cs/2, oy + (bombY + d) * cs + cs/2, cs * 0.6);
                    fg2.addColorStop(0, 'rgba(255,200,0,' + ep * fade + ')'); fg2.addColorStop(1, 'rgba(255,80,0,' + ep * fade * 0.3 + ')');
                    cx.fillStyle = fg2; cx.fillRect(ox + bombX * cs, oy + (bombY + d) * cs, cs, cs);
                }
                if (explodeTimer > 0.7) { exploding = false; bombTimer = 0; bombX = 1 + Math.floor(Math.random() * 5) * 2 + 1; bombY = 1 + Math.floor(Math.random() * 5) * 2 + 1; }
            } else {
                var bcx = ox + bombX * cs + cs / 2, bcy = oy + bombY * cs + cs / 2;
                var bg = cx.createRadialGradient(bcx - 1, bcy - 1, 0, bcx, bcy, cs * 0.35);
                bg.addColorStop(0, '#444'); bg.addColorStop(1, '#111');
                cx.fillStyle = bg; cx.beginPath(); cx.arc(bcx, bcy, cs * 0.35, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.arc(bcx - cs*0.1, bcy - cs*0.1, cs*0.1, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = '#aa8800'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(bcx + cs * 0.1, bcy - cs * 0.3); cx.quadraticCurveTo(bcx + cs * 0.3, bcy - cs * 0.5, bcx + cs * 0.25, bcy - cs * 0.55); cx.stroke();
                var fuseGlow = Math.sin(t * 15) > 0 ? '#ff8800' : '#ffcc00';
                cx.fillStyle = fuseGlow; cx.shadowColor = fuseGlow; cx.shadowBlur = 8;
                cx.beginPath(); cx.arc(bcx + cs * 0.25, bcy - cs * 0.55, 3, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                for (var sp = 0; sp < 2; sp++) sparks.push({x: bcx + cs*0.25 + (Math.random()-0.5)*4, y: bcy - cs*0.55 - Math.random()*5, vx: (Math.random()-0.5)*2, vy: -Math.random()*2, life: 0.3});
            }
            for (var si = sparks.length - 1; si >= 0; si--) { var sk = sparks[si]; sk.x += sk.vx; sk.y += sk.vy; sk.vy += 0.05; sk.life -= 0.03;
                cx.fillStyle = '#ffcc00'; cx.globalAlpha = sk.life; cx.fillRect(sk.x - 1, sk.y - 1, 2, 2);
                if (sk.life <= 0) sparks.splice(si, 1); } cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Galaxian ──
    function animGalaxian(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, fleet = [], trails = [];
        var rowColors = ['#ff3333', '#ff3333', '#4488ff', '#4488ff', '#ffcc00', '#ffcc00'];
        for (var r = 0; r < 6; r++) { var count = 7 - Math.abs(r - 2); for (var c = 0; c < count; c++) fleet.push({ hx: (c - count / 2 + 0.5) * 34 + w / 2, hy: r * 22 + 25, col: rowColors[r], diving: false, dt: 0 }); }
        var stars = []; for (var s = 0; s < 40; s++) stars.push({x: Math.random()*w, y: Math.random()*h, sp: 0.5+Math.random()*2, sz: 0.5+Math.random()});
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#010108'); bg.addColorStop(0.5, '#060620'); bg.addColorStop(1, '#020210');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var s = 0; s < stars.length; s++) { var st = stars[s]; st.y += st.sp; if (st.y > h) { st.y = 0; st.x = Math.random()*w; }
                cx.fillStyle = 'rgba(255,255,255,' + (0.15 + 0.2 * Math.sin(t + s * 2)) + ')'; cx.fillRect(st.x, st.y, st.sz, st.sz); }
            var sx = Math.sin(t * 0.8) * 20;
            if (Math.random() < 0.006) { var fi = Math.floor(Math.random() * fleet.length); if (!fleet[fi].diving) { fleet[fi].diving = true; fleet[fi].dt = 0; } }
            for (var i = 0; i < fleet.length; i++) {
                var a = fleet[i], ax, ay;
                if (a.diving) { a.dt += 0.025; ax = a.hx + sx + Math.sin(a.dt * 4) * 50 * a.dt; ay = a.hy + a.dt * 100;
                    trails.push({x: ax, y: ay, life: 0.4, c: a.col});
                    if (ay > h + 20) { a.diving = false; a.dt = 0; } }
                else { ax = a.hx + sx; ay = a.hy; }
                cx.fillStyle = a.col; cx.shadowColor = a.col; cx.shadowBlur = 4;
                cx.beginPath(); cx.moveTo(ax, ay - 6); cx.lineTo(ax - 8, ay + 4); cx.lineTo(ax + 8, ay + 4); cx.closePath(); cx.fill();
                cx.fillRect(ax - 10, ay + 2, 20, 3); cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.beginPath(); cx.arc(ax, ay - 2, 2, 0, Math.PI * 2); cx.fill();
            }
            for (var ti = trails.length - 1; ti >= 0; ti--) { var tr = trails[ti]; tr.life -= 0.03; cx.fillStyle = tr.c; cx.globalAlpha = tr.life * 0.25; cx.beginPath(); cx.arc(tr.x, tr.y, 2, 0, Math.PI * 2); cx.fill(); if (tr.life <= 0) trails.splice(ti, 1); }
            cx.globalAlpha = 1;
            var px = w / 2 + Math.sin(t * 1.3) * 50;
            cx.fillStyle = '#ffffff'; cx.shadowColor = '#aaccff'; cx.shadowBlur = 5;
            cx.beginPath(); cx.moveTo(px, h - 25); cx.lineTo(px - 8, h - 14); cx.lineTo(px + 8, h - 14); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#ff4400'; cx.globalAlpha = 0.4 + Math.sin(t * 12) * 0.3;
            cx.beginPath(); cx.moveTo(px - 2, h - 13); cx.lineTo(px + 2, h - 13); cx.lineTo(px, h - 7); cx.closePath(); cx.fill();
            cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Defender ──
    function animDefender(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, mountains = [], humans = [], lasers = [], boostParts = [];
        for (var i = 0; i <= 30; i++) mountains.push(h * 0.75 + Math.sin(i * 0.8) * 15 + Math.random() * 10);
        for (var i = 0; i < 5; i++) humans.push({ x: 40 + i * 80 });
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#000814'); bg.addColorStop(0.5, '#081428'); bg.addColorStop(1, '#040a18');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#001a00'; cx.fillRect(0, 0, w, 16);
            var scanGrad = cx.createLinearGradient(0, 0, w, 0);
            scanGrad.addColorStop(0, 'rgba(0,255,68,0.1)'); scanGrad.addColorStop(0.5, 'rgba(0,255,68,0.3)'); scanGrad.addColorStop(1, 'rgba(0,255,68,0.1)');
            cx.fillStyle = scanGrad;
            for (var r = 0; r < 10; r++) { var rx = (r * 39 + t * 20) % w; cx.fillRect(rx, 4, 4, 8); }
            cx.fillStyle = '#fff'; for (var s = 0; s < 20; s++) { cx.globalAlpha = 0.1 + 0.15 * Math.sin(t + s); cx.fillRect((s * 53 + 7) % w, 18 + (s * 31 + 5) % (h * 0.5), 1, 1); } cx.globalAlpha = 1;
            var scrollX = t * 30;
            var terrGrad = cx.createLinearGradient(0, h * 0.7, 0, h);
            terrGrad.addColorStop(0, '#2a4422'); terrGrad.addColorStop(1, '#112211');
            cx.fillStyle = terrGrad; cx.beginPath(); cx.moveTo(0, h);
            for (var i = 0; i < mountains.length; i++) { var mx = (i * w / 20 - scrollX % (w * 1.5) + w * 2) % (w * 1.5) - w * 0.25; cx.lineTo(mx, mountains[i]); }
            cx.lineTo(w, h); cx.closePath(); cx.fill();
            for (var i = 0; i < humans.length; i++) { var hx = (humans[i].x - scrollX * 0.5 % w + w * 2) % w, hy = h * 0.73;
                cx.fillStyle = '#ff88cc'; cx.shadowColor = '#ff88cc'; cx.shadowBlur = 3;
                cx.fillRect(hx - 1.5, hy, 3, 6); cx.beginPath(); cx.arc(hx, hy - 1, 2, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0; }
            var shx = w * 0.3, shy = h * 0.4 + Math.sin(t * 2) * 25;
            cx.fillStyle = '#00ff66'; cx.shadowColor = '#00ff66'; cx.shadowBlur = 6;
            cx.beginPath(); cx.moveTo(shx + 16, shy); cx.lineTo(shx - 8, shy - 6); cx.lineTo(shx - 8, shy + 6); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            for (var bp = 0; bp < 3; bp++) boostParts.push({x: shx - 10, y: shy + (Math.random()-0.5)*6, vx: -2 - Math.random()*2, vy: (Math.random()-0.5)*1, life: 0.4, c: Math.random() < 0.5 ? '#00ff66' : '#ffcc00'});
            for (var bi = boostParts.length - 1; bi >= 0; bi--) { var bp2 = boostParts[bi]; bp2.x += bp2.vx; bp2.y += bp2.vy; bp2.life -= 0.04;
                cx.fillStyle = bp2.c; cx.globalAlpha = bp2.life; cx.fillRect(bp2.x, bp2.y, 2, 1); if (bp2.life <= 0) boostParts.splice(bi, 1); } cx.globalAlpha = 1;
            if (Math.random() < 0.04) lasers.push({ x: shx + 16, y: shy });
            cx.fillStyle = '#00ff66'; cx.shadowColor = '#00ff66'; cx.shadowBlur = 4;
            for (var l = lasers.length - 1; l >= 0; l--) { lasers[l].x += 8; cx.fillRect(lasers[l].x, lasers[l].y - 1, 12, 2); if (lasers[l].x > w) lasers.splice(l, 1); }
            cx.shadowBlur = 0;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: 1942 ──
    function anim1942(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, islands = [], enemies = [], bullets = [], clouds = [];
        for (var i = 0; i < 4; i++) islands.push({ x: 30 + Math.random() * (w - 60), y: Math.random() * h, r: 12 + Math.random() * 18 });
        for (var i = 0; i < 4; i++) enemies.push({ x: w * 0.3 + i * 30, y: -20 - i * 40 });
        for (var i = 0; i < 3; i++) clouds.push({x: Math.random() * w, y: Math.random() * h, r: 20 + Math.random() * 15});
        function draw() {
            t += 0.02;
            var seaGrad = cx.createLinearGradient(0, 0, 0, h);
            seaGrad.addColorStop(0, '#0a2a5a'); seaGrad.addColorStop(0.5, '#0e3060'); seaGrad.addColorStop(1, '#061a3a');
            cx.fillStyle = seaGrad; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(100,180,255,0.08)'; cx.lineWidth = 1;
            for (var wv = 0; wv < 12; wv++) { var wy = (wv * 25 + t * 40) % (h + 40) - 20; cx.beginPath(); cx.moveTo(0, wy); for (var x = 0; x < w; x += 8) cx.lineTo(x, wy + Math.sin(x * 0.05 + t + wv) * 3); cx.stroke(); }
            cx.fillStyle = '#2a7e2a'; for (var i = 0; i < islands.length; i++) { var isl = islands[i]; isl.y = (isl.y + 0.5) % (h + 60) - 30;
                var ig = cx.createRadialGradient(isl.x, isl.y, 0, isl.x, isl.y, isl.r * 1.3);
                ig.addColorStop(0, '#3a9e3a'); ig.addColorStop(0.7, '#2a7a2a'); ig.addColorStop(1, '#1a5a1a');
                cx.fillStyle = ig; cx.beginPath(); cx.ellipse(isl.x, isl.y, isl.r * 1.3, isl.r, 0, 0, Math.PI * 2); cx.fill(); }
            var px = w / 2 + Math.sin(t * 1.5) * 40, py = h * 0.75;
            cx.fillStyle = '#559955'; cx.fillRect(px - 3, py - 14, 6, 22); cx.fillRect(px - 15, py - 5, 30, 7);
            cx.fillStyle = '#88bb88'; cx.fillRect(px - 2, py - 12, 4, 6);
            var propR = t * 30; cx.strokeStyle = '#aaddaa'; cx.lineWidth = 1;
            cx.beginPath(); cx.arc(px, py - 14, 4, propR, propR + Math.PI); cx.stroke();
            cx.fillRect(px - 5, py + 7, 10, 4);
            cx.fillStyle = '#ff8800'; cx.globalAlpha = 0.4 + Math.sin(t * 12) * 0.3;
            cx.beginPath(); cx.moveTo(px - 2, py + 11); cx.lineTo(px + 2, py + 11); cx.lineTo(px, py + 18); cx.closePath(); cx.fill();
            cx.globalAlpha = 1;
            if (Math.random() < 0.05) bullets.push({ x: px, y: py - 14 });
            cx.fillStyle = '#ffdd44'; cx.shadowColor = '#ffdd44'; cx.shadowBlur = 3;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].y -= 5; cx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 6); if (bullets[b].y < -10) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            cx.fillStyle = '#cc3333'; for (var i = 0; i < enemies.length; i++) { var e = enemies[i]; e.y += 1.5; if (e.y > h + 30) { e.y = -30; e.x = 40 + Math.random() * (w - 80); }
                cx.fillRect(e.x - 2, e.y - 8, 4, 16); cx.fillRect(e.x - 10, e.y - 2, 20, 5);
                cx.fillStyle = '#ff4444'; cx.fillRect(e.x - 1, e.y - 6, 2, 4); cx.fillStyle = '#cc3333'; }
            for (var ci = 0; ci < clouds.length; ci++) { var cl = clouds[ci]; cl.y = (cl.y + 0.3) % (h + 60) - 30;
                cx.fillStyle = 'rgba(200,220,255,0.08)'; cx.beginPath(); cx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(cl.x + cl.r * 0.6, cl.y - cl.r * 0.2, cl.r * 0.7, 0, Math.PI * 2); cx.fill(); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Sokoban ──
    function animSokoban(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, gs = 8, cs = Math.min(w, h) / gs;
        var ox = (w - gs * cs) / 2, oy = (h - gs * cs) / 2, walls = [];
        for (var i = 0; i < gs; i++) { walls.push({x:i,y:0}); walls.push({x:i,y:gs-1}); walls.push({x:0,y:i}); walls.push({x:gs-1,y:i}); }
        var targets = [{x:2,y:2},{x:5,y:3},{x:3,y:5}], boxes = [{x:3,y:3},{x:4,y:4},{x:5,y:5}];
        var playerGX = 1, playerGY = 1, moveTimer = 0, moveIdx = 0;
        var moves = [{dx:1,dy:0},{dx:1,dy:0},{dx:0,dy:1},{dx:0,dy:1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0},{dx:0,dy:-1}];
        function draw() {
            t += 0.016; moveTimer += 0.016;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            var floorGrad = cx.createLinearGradient(ox, oy, ox + (gs-2)*cs, oy + (gs-2)*cs);
            floorGrad.addColorStop(0, '#33334e'); floorGrad.addColorStop(1, '#22223a');
            cx.fillStyle = floorGrad; cx.fillRect(ox + cs, oy + cs, (gs - 2) * cs, (gs - 2) * cs);
            for (var fx = 1; fx < gs - 1; fx++) for (var fy = 1; fy < gs - 1; fy++) { cx.fillStyle = (fx + fy) % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'; cx.fillRect(ox + fx * cs, oy + fy * cs, cs, cs); }
            for (var i = 0; i < walls.length; i++) {
                var wg = cx.createLinearGradient(ox + walls[i].x * cs, oy + walls[i].y * cs, ox + walls[i].x * cs, oy + (walls[i].y + 1) * cs);
                wg.addColorStop(0, '#777788'); wg.addColorStop(1, '#444455');
                cx.fillStyle = wg; cx.fillRect(ox + walls[i].x * cs + 1, oy + walls[i].y * cs + 1, cs - 2, cs - 2);
                cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.fillRect(ox + walls[i].x * cs + 2, oy + walls[i].y * cs + 2, cs - 4, 3);
            }
            for (var i = 0; i < targets.length; i++) {
                var tx = ox + targets[i].x * cs + cs / 2, ty = oy + targets[i].y * cs + cs / 2;
                var tglow = 0.4 + Math.sin(t * 3 + i) * 0.2;
                cx.strokeStyle = 'rgba(255,100,100,' + tglow + ')'; cx.lineWidth = 2; cx.shadowColor = '#ff4444'; cx.shadowBlur = 6;
                cx.beginPath(); cx.moveTo(tx, ty - cs * 0.25); cx.lineTo(tx + cs * 0.25, ty); cx.lineTo(tx, ty + cs * 0.25); cx.lineTo(tx - cs * 0.25, ty); cx.closePath(); cx.stroke();
                cx.shadowBlur = 0;
            }
            for (var i = 0; i < boxes.length; i++) {
                var bxp = ox + boxes[i].x * cs + 3, byp = oy + boxes[i].y * cs + 3;
                var boxG = cx.createLinearGradient(bxp, byp, bxp, byp + cs - 6);
                boxG.addColorStop(0, '#ddaa55'); boxG.addColorStop(1, '#aa7733');
                cx.fillStyle = boxG; cx.fillRect(bxp, byp, cs - 6, cs - 6);
                cx.strokeStyle = '#996622'; cx.lineWidth = 1; cx.strokeRect(bxp, byp, cs - 6, cs - 6);
                cx.strokeStyle = 'rgba(0,0,0,0.15)'; cx.beginPath(); cx.moveTo(bxp, byp); cx.lineTo(bxp + cs - 6, byp + cs - 6); cx.stroke();
                cx.beginPath(); cx.moveTo(bxp + cs - 6, byp); cx.lineTo(bxp, byp + cs - 6); cx.stroke();
                cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(bxp + 1, byp + 1, cs - 8, 3);
            }
            var pcx = ox + playerGX * cs + cs / 2, pcy = oy + playerGY * cs + cs / 2;
            cx.fillStyle = '#4499ff'; cx.shadowColor = '#4499ff'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(pcx, pcy - 2, cs * 0.22, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#3377dd'; cx.fillRect(pcx - cs * 0.15, pcy + cs * 0.05, cs * 0.3, cs * 0.2);
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(pcx - 2, pcy - 4, 1.5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(pcx + 2, pcy - 4, 1.5, 0, Math.PI * 2); cx.fill();
            if (moveTimer > 0.5) { moveTimer = 0; var mv = moves[moveIdx % moves.length]; var nx = playerGX + mv.dx, ny = playerGY + mv.dy; if (nx > 0 && nx < gs - 1 && ny > 0 && ny < gs - 1) { playerGX = nx; playerGY = ny; } moveIdx++; if (moveIdx >= moves.length) { moveIdx = 0; playerGX = 1; playerGY = 1; } }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Tempest ──
    function animTempest(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, sides = 16, enemies = [];
        function draw() {
            t += 0.02;
            cx.fillStyle = '#020208'; cx.fillRect(0, 0, w, h);
            var cx0 = w / 2, cy0 = h / 2, outerR = Math.min(w, h) * 0.44, innerR = outerR * 0.15;
            for (var i = 0; i < sides; i++) {
                var a1 = (i / sides) * Math.PI * 2, a2 = ((i + 1) / sides) * Math.PI * 2;
                var ox1 = cx0 + Math.cos(a1) * outerR, oy1 = cy0 + Math.sin(a1) * outerR;
                var ox2 = cx0 + Math.cos(a2) * outerR, oy2 = cy0 + Math.sin(a2) * outerR;
                var ix1 = cx0 + Math.cos(a1) * innerR, iy1 = cy0 + Math.sin(a1) * innerR;
                cx.strokeStyle = '#1a3388'; cx.lineWidth = 1; cx.shadowColor = '#2244aa'; cx.shadowBlur = 3;
                cx.beginPath(); cx.moveTo(ix1, iy1); cx.lineTo(ox1, oy1); cx.stroke();
                cx.strokeStyle = '#4466ff'; cx.lineWidth = 2; cx.shadowColor = '#4466ff'; cx.shadowBlur = 5;
                cx.beginPath(); cx.moveTo(ox1, oy1); cx.lineTo(ox2, oy2); cx.stroke();
                cx.shadowBlur = 0;
                cx.fillStyle = 'rgba(30,50,120,0.03)';
                cx.beginPath(); cx.moveTo(ix1, iy1); cx.lineTo(ox1, oy1); cx.lineTo(ox2, oy2); var ix2 = cx0 + Math.cos(a2) * innerR, iy2 = cy0 + Math.sin(a2) * innerR; cx.lineTo(ix2, iy2); cx.closePath(); cx.fill();
            }
            if (Math.random() < 0.02) enemies.push({ lane: Math.floor(Math.random() * sides), depth: 0 });
            for (var e = enemies.length - 1; e >= 0; e--) { var en = enemies[e]; en.depth += 0.008; var a = (en.lane + 0.5) / sides * Math.PI * 2; var r = innerR + (outerR - innerR) * en.depth; var ex = cx0 + Math.cos(a) * r, ey = cy0 + Math.sin(a) * r;
                cx.fillStyle = '#ff3366'; cx.shadowColor = '#ff3366'; cx.shadowBlur = 5;
                cx.beginPath(); cx.arc(ex, ey, 2 + en.depth * 4, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                if (en.depth > 0.3) { cx.strokeStyle = 'rgba(255,51,102,' + (1 - en.depth) * 0.3 + ')'; cx.lineWidth = 1;
                    var pr = innerR + (outerR - innerR) * (en.depth - 0.05); cx.beginPath(); cx.arc(cx0 + Math.cos(a) * pr, cy0 + Math.sin(a) * pr, 1 + en.depth * 2, 0, Math.PI * 2); cx.stroke(); }
                if (en.depth > 1) enemies.splice(e, 1); }
            var playerLane = (Math.floor(t * 3) % sides + sides) % sides, pa = (playerLane + 0.5) / sides * Math.PI * 2;
            var prx = cx0 + Math.cos(pa) * outerR, pry = cy0 + Math.sin(pa) * outerR;
            cx.fillStyle = '#00ffff'; cx.shadowColor = '#00ffff'; cx.shadowBlur = 12; cx.beginPath(); cx.arc(prx, pry, 5, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            if (Math.sin(t * 5) > 0.8) { cx.strokeStyle = '#ffff00'; cx.lineWidth = 2; cx.shadowColor = '#ffff00'; cx.shadowBlur = 8;
                var shotR = outerR * (0.3 + 0.4 * ((t * 3) % 1)); var ssx = cx0 + Math.cos(pa) * shotR, ssy = cy0 + Math.sin(pa) * shotR;
                cx.beginPath(); cx.moveTo(prx, pry); cx.lineTo(ssx, ssy); cx.stroke(); cx.shadowBlur = 0; }
            var vig = cx.createRadialGradient(cx0, cy0, outerR * 0.5, cx0, cy0, w * 0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.6)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Q*bert ──
    function animQbert(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, rows = 6, cubeW = 28, cubeH = 16, cubes = [], colors = [];
        for (var r = 0; r < rows; r++) for (var c = 0; c <= r; c++) { cubes.push({ r: r, c: c }); colors.push(0); }
        var qR = 0, qC = 0, moveTimer = 0, coilyY = -20;
        function cubePos(r, c) { return { x: w / 2 - r * cubeW / 2 + c * cubeW, y: 30 + r * cubeH * 1.3 }; }
        function draw() {
            t += 0.016; moveTimer += 0.016;
            var bg = cx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w*0.7);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(1, '#040410');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < cubes.length; i++) {
                var cb = cubes[i], pos = cubePos(cb.r, cb.c), px = pos.x, py = pos.y;
                var topC = colors[i] ? '#ff9922' : '#7755bb';
                var leftC = colors[i] ? '#cc6600' : '#4422aa';
                var rightC = colors[i] ? '#aa4400' : '#332288';
                var topG = cx.createLinearGradient(px, py, px + cubeW, py + cubeH);
                topG.addColorStop(0, topC); topG.addColorStop(1, colors[i] ? '#dd8811' : '#6644aa');
                cx.fillStyle = topG;
                cx.beginPath(); cx.moveTo(px + cubeW / 2, py); cx.lineTo(px + cubeW, py + cubeH / 2); cx.lineTo(px + cubeW / 2, py + cubeH); cx.lineTo(px, py + cubeH / 2); cx.closePath(); cx.fill();
                cx.fillStyle = leftC;
                cx.beginPath(); cx.moveTo(px, py + cubeH / 2); cx.lineTo(px + cubeW / 2, py + cubeH); cx.lineTo(px + cubeW / 2, py + cubeH + cubeH * 0.6); cx.lineTo(px, py + cubeH / 2 + cubeH * 0.6); cx.closePath(); cx.fill();
                cx.fillStyle = rightC;
                cx.beginPath(); cx.moveTo(px + cubeW / 2, py + cubeH); cx.lineTo(px + cubeW, py + cubeH / 2); cx.lineTo(px + cubeW, py + cubeH / 2 + cubeH * 0.6); cx.lineTo(px + cubeW / 2, py + cubeH + cubeH * 0.6); cx.closePath(); cx.fill();
                cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.beginPath(); cx.moveTo(px + cubeW/2, py); cx.lineTo(px + cubeW * 0.7, py + cubeH * 0.3); cx.lineTo(px + cubeW/2, py + cubeH * 0.5); cx.lineTo(px + cubeW * 0.3, py + cubeH * 0.3); cx.closePath(); cx.fill();
            }
            if (moveTimer > 0.45) { moveTimer = 0; for (var i = 0; i < cubes.length; i++) { if (cubes[i].r === qR && cubes[i].c === qC) { colors[i] = 1; break; } } if (qR < rows - 1) { if (Math.random() < 0.5) qR++; else { qR++; qC++; } qC = Math.min(qC, qR); } else { qR = 0; qC = 0; } }
            var qp = cubePos(qR, qC), bounce = Math.abs(Math.sin(moveTimer / 0.45 * Math.PI)) * -8;
            var qx = qp.x + cubeW / 2, qy = qp.y - 4 + bounce;
            cx.fillStyle = '#ff6600'; cx.shadowColor = '#ff8800'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(qx, qy, 7, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(qx - 3, qy - 2, 2.5, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(qx + 3, qy - 2, 2.5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.beginPath(); cx.arc(qx - 2, qy - 2, 1, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(qx + 4, qy - 2, 1, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff8800'; cx.beginPath(); cx.moveTo(qx, qy + 2); cx.lineTo(qx + 5, qy + 5); cx.lineTo(qx - 1, qy + 5); cx.closePath(); cx.fill();
            cx.fillStyle = '#ff6600'; cx.fillRect(qx - 4, qy + 7, 3, 4); cx.fillRect(qx + 1, qy + 7, 3, 4);
            coilyY = h * 0.65 + Math.sin(t * 2) * 8;
            var coilyX = w * 0.8 + Math.sin(t * 1.5) * 10;
            cx.fillStyle = '#cc33ff'; cx.shadowColor = '#cc33ff'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(coilyX, coilyY - 4, 5, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = '#9922cc';
            for (var si = 0; si < 4; si++) { var sy = coilyY + si * 4; cx.beginPath(); cx.arc(coilyX + Math.sin(t * 3 + si) * 3, sy, 3, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#ff0'; cx.beginPath(); cx.arc(coilyX - 2, coilyY - 5, 1.5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(coilyX + 2, coilyY - 5, 1.5, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Spy Hunter ──
    function animSpyHunter(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, enemies = [], smokeParts = [];
        for (var i = 0; i < 3; i++) enemies.push({ x: w * 0.35 + Math.random() * w * 0.3, y: -40 - i * 100, speed: 1.5 + Math.random(), type: i % 3 });
        function draw() {
            t += 0.02;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            var grassGrad = cx.createLinearGradient(0, 0, 0, h);
            grassGrad.addColorStop(0, '#1a5522'); grassGrad.addColorStop(1, '#0d3311');
            cx.fillStyle = grassGrad; cx.fillRect(0, 0, w * 0.25, h); cx.fillRect(w * 0.75, 0, w * 0.25, h);
            var roadGrad = cx.createLinearGradient(w * 0.25, 0, w * 0.75, 0);
            roadGrad.addColorStop(0, '#333'); roadGrad.addColorStop(0.5, '#555'); roadGrad.addColorStop(1, '#333');
            cx.fillStyle = roadGrad; cx.fillRect(w * 0.25, 0, w * 0.5, h);
            cx.fillStyle = '#ffffff'; cx.fillRect(w * 0.25, 0, 2, h); cx.fillRect(w * 0.75 - 2, 0, 2, h);
            for (var d = 0; d < 12; d++) { var dy = (d * 30 + t * 80) % (h + 30) - 15; cx.fillRect(w / 2 - 1, dy, 2, 16); }
            for (var tr = 0; tr < 6; tr++) { var ty = (tr * 50 + t * 60) % (h + 20) - 10;
                cx.fillStyle = 'rgba(100,80,60,0.15)'; cx.fillRect(w * 0.05, ty, 8, 12); cx.fillRect(w * 0.9, ty, 8, 12);
                cx.fillStyle = 'rgba(40,100,40,0.3)'; cx.beginPath(); cx.arc(w * 0.05 + 4, ty - 4, 10, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(w * 0.9 + 4, ty - 4, 10, 0, Math.PI * 2); cx.fill(); }
            var px = w / 2 + Math.sin(t * 2) * w * 0.08;
            var carGrad = cx.createLinearGradient(px - 8, 0, px + 8, 0);
            carGrad.addColorStop(0, '#2244bb'); carGrad.addColorStop(0.5, '#4477ff'); carGrad.addColorStop(1, '#2244bb');
            cx.fillStyle = carGrad; cx.fillRect(px - 8, h * 0.72, 16, 24);
            cx.fillStyle = '#1a33aa'; cx.fillRect(px - 10, h * 0.72 + 4, 20, 4); cx.fillRect(px - 10, h * 0.72 + 16, 20, 4);
            cx.fillStyle = '#aaddff'; cx.fillRect(px - 5, h * 0.72 + 2, 10, 6);
            cx.fillStyle = '#ff3333'; cx.fillRect(px - 4, h * 0.72 + 20, 3, 2); cx.fillRect(px + 1, h * 0.72 + 20, 3, 2);
            if (Math.sin(t * 4) > 0.8) { for (var sk = 0; sk < 2; sk++) smokeParts.push({x: px + (Math.random()-0.5)*8, y: h * 0.72 + 24, vx: (Math.random()-0.5)*0.5, vy: 0.5, life: 0.6}); }
            for (var si = smokeParts.length - 1; si >= 0; si--) { var sp = smokeParts[si]; sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.02;
                cx.fillStyle = 'rgba(180,180,180,' + sp.life * 0.3 + ')'; cx.beginPath(); cx.arc(sp.x, sp.y, 3 * (1 - sp.life), 0, Math.PI * 2); cx.fill();
                if (sp.life <= 0) smokeParts.splice(si, 1); }
            for (var i = 0; i < enemies.length; i++) { var e = enemies[i]; e.y += e.speed; e.x += Math.sin(t * 3 + i * 2) * 0.5; if (e.y > h + 40) { e.y = -50; e.x = w * 0.32 + Math.random() * w * 0.36; }
                var eCol = ['#cc2222', '#228822', '#888822'][e.type];
                cx.fillStyle = eCol; cx.fillRect(e.x - 7, e.y, 14, 22); cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(e.x - 9, e.y + 3, 18, 4); cx.fillRect(e.x - 9, e.y + 14, 18, 4); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Paperboy ──
    function animPaperboy(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, houses = [], papers = [];
        for (var i = 0; i < 5; i++) houses.push({ x: i * 100 + 50, baseY: h * 0.35, w: 55, h: 45 });
        var dogX = -20, dogY = h * 0.56;
        function draw() {
            t += 0.02;
            var skyGrad = cx.createLinearGradient(0, 0, 0, h * 0.6);
            skyGrad.addColorStop(0, '#3388dd'); skyGrad.addColorStop(1, '#77bbee');
            cx.fillStyle = skyGrad; cx.fillRect(0, 0, w, h);
            cx.fillStyle = 'rgba(255,255,255,0.3)'; for (var ci = 0; ci < 3; ci++) { var clx = (ci * 130 + t * 8) % (w + 60) - 30; cx.beginPath(); cx.arc(clx, 25 + ci * 12, 14, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(clx + 12, 22 + ci * 12, 10, 0, Math.PI * 2); cx.fill(); }
            var lawnGrad = cx.createLinearGradient(0, h * 0.55, 0, h);
            lawnGrad.addColorStop(0, '#55bb55'); lawnGrad.addColorStop(1, '#338833');
            cx.fillStyle = lawnGrad; cx.fillRect(0, h * 0.6, w, h * 0.4);
            cx.fillStyle = '#ccbb88'; cx.fillRect(0, h * 0.56, w, h * 0.08);
            cx.fillStyle = 'rgba(0,0,0,0.06)'; for (var sl = 0; sl < w; sl += 3) cx.fillRect(sl, h * 0.56, 1, h * 0.08);
            var houseColors = ['#cc6644','#8888cc','#ddaa55','#77aa77','#cc7799'];
            for (var i = 0; i < houses.length; i++) {
                var hx = (houses[i].x - t * 40) % (w + 200) - 50, hy = houses[i].baseY;
                var hg = cx.createLinearGradient(hx, hy, hx, hy + houses[i].h);
                hg.addColorStop(0, houseColors[i % 5]); hg.addColorStop(1, '#774433');
                cx.fillStyle = hg; cx.fillRect(hx, hy, houses[i].w, houses[i].h);
                cx.fillStyle = '#884444';
                cx.beginPath(); cx.moveTo(hx - 5, hy); cx.lineTo(hx + houses[i].w / 2, hy - 22); cx.lineTo(hx + houses[i].w + 5, hy); cx.closePath(); cx.fill();
                cx.fillStyle = '#663333'; cx.beginPath(); cx.moveTo(hx - 5, hy); cx.lineTo(hx + houses[i].w / 2, hy - 22); cx.lineTo(hx + houses[i].w + 5, hy); cx.closePath(); cx.fill();
                cx.fillStyle = '#553322'; cx.fillRect(hx + houses[i].w / 2 - 5, hy + 22, 10, 23);
                cx.fillStyle = '#bbddff'; cx.fillRect(hx + 6, hy + 8, 10, 10); cx.fillRect(hx + houses[i].w - 16, hy + 8, 10, 10);
                cx.fillStyle = 'rgba(255,255,200,0.15)'; cx.fillRect(hx + 7, hy + 9, 4, 4);
                cx.fillRect(hx + houses[i].w - 15, hy + 9, 4, 4);
            }
            var bx = w * 0.25, by = h * 0.55 + Math.sin(t * 8) * 2;
            cx.strokeStyle = '#444'; cx.lineWidth = 2; cx.beginPath(); cx.arc(bx - 8, by + 8, 7, 0, Math.PI * 2); cx.stroke(); cx.beginPath(); cx.arc(bx + 10, by + 8, 7, 0, Math.PI * 2); cx.stroke();
            cx.fillStyle = '#888'; cx.beginPath(); cx.arc(bx - 8, by + 8, 3, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(bx + 10, by + 8, 3, 0, Math.PI * 2); cx.fill();
            cx.strokeStyle = '#ff4444'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(bx - 8, by + 8); cx.lineTo(bx, by); cx.lineTo(bx + 10, by + 8); cx.stroke();
            cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(bx - 4, by - 10); cx.stroke();
            cx.fillStyle = '#ffccaa'; cx.beginPath(); cx.arc(bx - 2, by - 14, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff4444'; cx.fillRect(bx - 4, by - 10, 6, 10);
            cx.fillStyle = '#444'; cx.beginPath(); cx.arc(bx - 2, by - 17, 4.5, Math.PI, 0); cx.fill();
            dogX = (t * 35) % (w + 60) - 30; dogY = h * 0.56 + Math.abs(Math.sin(t * 6)) * -4;
            cx.fillStyle = '#aa6633'; cx.fillRect(dogX - 6, dogY, 12, 6); cx.fillRect(dogX + 5, dogY - 3, 5, 4);
            cx.fillRect(dogX - 6, dogY + 6, 3, 4); cx.fillRect(dogX + 3, dogY + 6, 3, 4);
            cx.fillStyle = '#000'; cx.fillRect(dogX + 8, dogY - 2, 1, 1);
            if (Math.random() < 0.02) papers.push({ x: bx + 5, y: by - 8, vx: 3, vy: -3, r: 0 });
            for (var p = papers.length - 1; p >= 0; p--) { var pp = papers[p]; pp.x += pp.vx; pp.y += pp.vy; pp.vy += 0.15; pp.r += 0.15;
                cx.save(); cx.translate(pp.x, pp.y); cx.rotate(pp.r);
                cx.fillStyle = '#ffffff'; cx.fillRect(-4, -3, 8, 6);
                cx.fillStyle = '#ccc'; cx.fillRect(-3, -1, 6, 1); cx.fillRect(-3, 1, 4, 1);
                cx.restore(); if (pp.y > h) papers.splice(p, 1); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Arkanoid ──
    function animArkanoid(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, bx = w / 2, by = h * 0.6, bdx = 2.2, bdy = -2.2;
        var bricks = [], bcols = ['#c0c0c0','#ffd700','#ff2244','#ff6622','#ffcc00','#22cc44','#2266ff','#aa44ff'], powerups = [], ballTrail = [];
        for (var r = 0; r < 6; r++) for (var c = 0; c < 10; c++) bricks.push({ x: c * 38 + 10, y: r * 14 + 16, w: 34, h: 10, c: bcols[r], alive: true, crack: 0 });
        function draw() {
            t += 0.016;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(1, '#050518');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var wallGrad = cx.createLinearGradient(0, 0, 6, 0);
            wallGrad.addColorStop(0, '#556'); wallGrad.addColorStop(1, '#334');
            cx.fillStyle = wallGrad; cx.fillRect(0, 0, 6, h); cx.fillRect(w - 6, 0, 6, h); cx.fillRect(0, 0, w, 4);
            for (var i = 0; i < bricks.length; i++) { var b = bricks[i]; if (!b.alive) continue;
                var bg2 = cx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
                bg2.addColorStop(0, b.c); bg2.addColorStop(1, 'rgba(0,0,0,0.3)');
                cx.fillStyle = bg2; cx.fillRect(b.x, b.y, b.w, b.h);
                cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.fillRect(b.x, b.y, b.w, 2);
                cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
                if (b.crack > 0) { cx.strokeStyle = 'rgba(0,0,0,0.4)'; cx.lineWidth = 0.5;
                    cx.beginPath(); cx.moveTo(b.x + b.w * 0.3, b.y); cx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.6); cx.lineTo(b.x + b.w * 0.7, b.y + b.h); cx.stroke(); }
            }
            ballTrail.push({x: bx, y: by, life: 0.5});
            bx += bdx; by += bdy; if (bx < 10 || bx > w - 10) bdx *= -1; if (by < 8) bdy = Math.abs(bdy); if (by > h * 0.88) bdy = -Math.abs(bdy);
            for (var ti = ballTrail.length - 1; ti >= 0; ti--) { ballTrail[ti].life -= 0.04;
                cx.fillStyle = '#ff6644'; cx.globalAlpha = ballTrail[ti].life * 0.3; cx.beginPath(); cx.arc(ballTrail[ti].x, ballTrail[ti].y, 3 * ballTrail[ti].life, 0, Math.PI * 2); cx.fill();
                if (ballTrail[ti].life <= 0) ballTrail.splice(ti, 1); } cx.globalAlpha = 1;
            cx.fillStyle = '#fff'; cx.shadowColor = '#ff8844'; cx.shadowBlur = 10; cx.beginPath(); cx.arc(bx, by, 4, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            var px = w / 2 + Math.sin(t * 2.5) * 70;
            var padGrad = cx.createLinearGradient(px - 28, h * 0.9, px + 28, h * 0.9);
            padGrad.addColorStop(0, '#ff4466'); padGrad.addColorStop(0.2, '#ccccdd'); padGrad.addColorStop(0.5, '#eeeeff'); padGrad.addColorStop(0.8, '#ccccdd'); padGrad.addColorStop(1, '#ff4466');
            cx.fillStyle = padGrad; cx.fillRect(px - 28, h * 0.9, 56, 8);
            cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.fillRect(px - 26, h * 0.9 + 1, 52, 3);
            if (Math.random() < 0.005) powerups.push({ x: 50 + Math.random() * (w - 100), y: 60, c: Math.random() < 0.5 ? '#ff4466' : '#4488ff' });
            for (var p = powerups.length - 1; p >= 0; p--) { var pu = powerups[p]; pu.y += 1.2;
                cx.fillStyle = pu.c; cx.shadowColor = pu.c; cx.shadowBlur = 4;
                cx.beginPath(); cx.moveTo(pu.x - 8, pu.y - 4); cx.lineTo(pu.x + 8, pu.y - 4); cx.arc(pu.x + 8, pu.y, 4, -Math.PI / 2, Math.PI / 2); cx.lineTo(pu.x - 8, pu.y + 4); cx.arc(pu.x - 8, pu.y, 4, Math.PI / 2, -Math.PI / 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#fff'; cx.font = 'bold 7px monospace'; cx.textAlign = 'center'; cx.fillText('P', pu.x, pu.y + 3); if (pu.y > h) powerups.splice(p, 1); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Dig Dug ──
    function animDigDug(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, surfaceY = h * 0.12;
        var digX = w * 0.5, digY = h * 0.35, digDirX = 1, digDirY = 0, trail = [{x: w * 0.5, y: h * 0.35}], moveTimer = 0;
        var pooka = { x: w * 0.25, y: h * 0.55, dx: 0.5 }, fygar = { x: w * 0.7, y: h * 0.72, dx: -0.4 };
        function draw() {
            t += 0.016; moveTimer += 0.016;
            var skyGrad = cx.createLinearGradient(0, 0, 0, surfaceY);
            skyGrad.addColorStop(0, '#66aaee'); skyGrad.addColorStop(1, '#88ccff');
            cx.fillStyle = skyGrad; cx.fillRect(0, 0, w, surfaceY);
            cx.fillStyle = '#55bb55'; cx.fillRect(0, surfaceY - 6, w, 10);
            for (var fl = 0; fl < 8; fl++) { cx.fillStyle = '#44aa44'; cx.beginPath(); cx.arc(fl * w / 8 + w / 16, surfaceY - 4, 4 + Math.sin(t + fl) * 1, 0, Math.PI * 2); cx.fill(); }
            var dirtGrad = cx.createLinearGradient(0, surfaceY, 0, h);
            dirtGrad.addColorStop(0, '#8B5A2B'); dirtGrad.addColorStop(0.3, '#7A4A1B'); dirtGrad.addColorStop(0.6, '#6A3A0B'); dirtGrad.addColorStop(1, '#5A2A00');
            cx.fillStyle = dirtGrad; cx.fillRect(0, surfaceY, w, h - surfaceY);
            cx.fillStyle = 'rgba(0,0,0,0.04)';
            for (var ly = 0; ly < 6; ly++) { var lyr = surfaceY + ly * (h - surfaceY) / 6; cx.fillRect(0, lyr, w, 1); }
            for (var sp = 0; sp < 15; sp++) { cx.fillStyle = 'rgba(100,70,30,0.2)'; cx.fillRect((sp * 53 + 7) % w, surfaceY + (sp * 37 + 11) % (h * 0.7), 3, 2); }
            if (moveTimer > 0.08) {
                moveTimer = 0; digX += digDirX * 4; digY += digDirY * 4; trail.push({x: digX, y: digY}); if (trail.length > 200) trail.shift();
                if (digX > w * 0.8) { digDirX = 0; digDirY = 1; } else if (digX < w * 0.2) { digDirX = 0; digDirY = 1; }
                if (digY > h * 0.85) { digDirX = digDirX === 0 ? (digX < w / 2 ? 1 : -1) : digDirX; digDirY = 0; }
                if (digY < h * 0.25 && digDirY < 0) { digDirX = digDirX === 0 ? 1 : digDirX; digDirY = 0; }
                if (Math.random() < 0.05) { if (digDirX !== 0) { digDirX = 0; digDirY = 1; } else { digDirY = 0; digDirX = Math.random() < 0.5 ? 1 : -1; } }
                digX = Math.max(10, Math.min(w - 10, digX)); digY = Math.max(surfaceY + 10, Math.min(h - 10, digY));
            }
            cx.fillStyle = '#080818'; for (var i = 1; i < trail.length; i++) cx.fillRect(trail[i].x - 7, trail[i].y - 7, 14, 14);
            pooka.x += pooka.dx; if (pooka.x > w * 0.45 || pooka.x < w * 0.15) pooka.dx *= -1;
            cx.fillStyle = '#ff3333'; cx.shadowColor = '#ff3333'; cx.shadowBlur = 3;
            cx.beginPath(); cx.arc(pooka.x, pooka.y, 8, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(pooka.x - 3, pooka.y - 2, 3, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(pooka.x + 3, pooka.y - 2, 3, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.beginPath(); cx.arc(pooka.x - 2, pooka.y - 2, 1.2, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(pooka.x + 4, pooka.y - 2, 1.2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#ff6666'; cx.fillRect(pooka.x - 5, pooka.y + 6, 10, 3);
            fygar.x += fygar.dx; if (fygar.x > w * 0.85 || fygar.x < w * 0.55) fygar.dx *= -1;
            cx.fillStyle = '#33cc33'; cx.shadowColor = '#33cc33'; cx.shadowBlur = 3;
            cx.beginPath(); cx.arc(fygar.x, fygar.y, 8, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillRect(fygar.dx > 0 ? fygar.x + 6 : fygar.x - 12, fygar.y - 2, 6, 4);
            if (Math.sin(t * 3) > 0.7) {
                var fd = fygar.dx > 0 ? 1 : -1;
                var fireGrad = cx.createLinearGradient(fygar.x + fd * 10, fygar.y, fygar.x + fd * 30, fygar.y);
                fireGrad.addColorStop(0, 'rgba(255,150,0,0.7)'); fireGrad.addColorStop(0.5, 'rgba(255,80,0,0.4)'); fireGrad.addColorStop(1, 'rgba(255,40,0,0)');
                cx.fillStyle = fireGrad;
                cx.beginPath(); cx.moveTo(fygar.x + fd * 10, fygar.y - 4); cx.lineTo(fygar.x + fd * 30, fygar.y - 7); cx.lineTo(fygar.x + fd * 30, fygar.y + 7); cx.lineTo(fygar.x + fd * 10, fygar.y + 4); cx.closePath(); cx.fill();
            }
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(fygar.x - 3, fygar.y - 2, 2, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(fygar.x + 3, fygar.y - 2, 2, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#4488ff'; cx.shadowColor = '#4488ff'; cx.shadowBlur = 3;
            cx.beginPath(); cx.arc(digX, digY, 6, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = '#ffffff'; cx.fillRect(digX - 7, digY - 9, 14, 3);
            cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(digX - 2, digY - 2, 1.5, 0, Math.PI * 2); cx.fill(); cx.beginPath(); cx.arc(digX + 2, digY - 2, 1.5, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Mega Man ──
    function animMegaMan(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bullets = [], chargeParts = [], plats = [
            {x:0,y:h*0.85,w:w},{x:w*0.1,y:h*0.55,w:w*0.25},{x:w*0.5,y:h*0.4,w:w*0.3},{x:w*0.7,y:h*0.65,w:w*0.25}
        ];
        var enemies = [{x:w*0.65,y:h*0.5,d:1},{x:w*0.85,y:h*0.57,d:-1}];
        var chargeLevel = 0;
        function draw() {
            t += 0.025; chargeLevel = (chargeLevel + 0.01) % 1;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a2a'); bg.addColorStop(1, '#060618');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(30,60,120,0.1)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx < w; gx += 20) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy < h; gy += 20) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(w, gy); cx.stroke(); }
            for (var i = 0; i < plats.length; i++) {
                var p = plats[i];
                var pg = cx.createLinearGradient(p.x, p.y, p.x, p.y + 14);
                pg.addColorStop(0, '#446699'); pg.addColorStop(1, '#223355');
                cx.fillStyle = pg; cx.fillRect(p.x, p.y, p.w, 6);
                cx.fillStyle = '#223355'; for (var bxp = p.x; bxp < p.x + p.w; bxp += 12) cx.fillRect(bxp, p.y + 6, 10, 8);
                cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.fillRect(p.x, p.y, p.w, 2);
            }
            var mx = w * 0.25 + Math.sin(t * 1.8) * 50;
            var my = h * 0.85 - 20 + Math.abs(Math.sin(t * 3)) * -25;
            var runFrame = Math.floor(t * 8) % 2;
            cx.fillStyle = '#1e90ff'; cx.fillRect(mx - 5, my - 6, 10, 12);
            cx.fillStyle = '#1070cc'; cx.fillRect(mx - 6, my - 12, 12, 7);
            cx.fillStyle = '#1e90ff'; cx.fillRect(mx - 4, my - 10, 8, 4);
            cx.fillStyle = '#ffccaa'; cx.fillRect(mx - 3, my - 8, 6, 4);
            cx.fillStyle = '#000'; cx.fillRect(mx + 1, my - 7, 2, 2);
            cx.fillStyle = '#1070cc'; cx.fillRect(mx + 5, my - 4, 8, 5);
            var cannonGrad = cx.createRadialGradient(mx + 13, my - 2, 0, mx + 13, my - 2, 5);
            cannonGrad.addColorStop(0, '#88ccff'); cannonGrad.addColorStop(1, '#1e90ff');
            cx.fillStyle = cannonGrad; cx.fillRect(mx + 11, my - 4, 5, 4);
            if (chargeLevel > 0.5) { for (var cp = 0; cp < 2; cp++) chargeParts.push({x: mx + 13 + (Math.random()-0.5)*12, y: my - 2 + (Math.random()-0.5)*12, life: 0.3}); }
            for (var ci = chargeParts.length - 1; ci >= 0; ci--) { var cp2 = chargeParts[ci]; cp2.life -= 0.02;
                cx.fillStyle = '#88eeff'; cx.globalAlpha = cp2.life; cx.fillRect(cp2.x, cp2.y, 2, 2);
                if (cp2.life <= 0) chargeParts.splice(ci, 1); } cx.globalAlpha = 1;
            cx.fillStyle = '#1e90ff';
            cx.fillRect(mx - 4 + runFrame * 3, my + 6, 4, 6);
            cx.fillRect(mx + 1 - runFrame * 3, my + 6, 4, 6);
            if (Math.random() < 0.06) bullets.push({x: mx + 15, y: my - 2});
            cx.fillStyle = '#ffee44'; cx.shadowColor = '#ffee44'; cx.shadowBlur = 8;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].x += 5; cx.beginPath(); cx.arc(bullets[b].x, bullets[b].y, 3, 0, Math.PI * 2); cx.fill(); if (bullets[b].x > w) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            for (var e = 0; e < enemies.length; e++) {
                var en = enemies[e]; en.x += Math.sin(t * 2 + e) * 0.5;
                cx.fillStyle = '#cc4444'; cx.fillRect(en.x - 6, en.y - 6, 12, 8);
                cx.fillStyle = '#ff6666'; cx.fillRect(en.x - 4, en.y - 10, 8, 5);
                cx.fillStyle = '#ffcc00'; cx.fillRect(en.x - 2, en.y - 4, 2, 2); cx.fillRect(en.x + 2, en.y - 4, 2, 2);
                cx.fillStyle = '#ff4444'; cx.globalAlpha = 0.3 + Math.sin(t * 4 + e) * 0.2;
                cx.beginPath(); cx.arc(en.x, en.y, 10, 0, Math.PI * 2); cx.fill(); cx.globalAlpha = 1;
            }
            cx.fillStyle = '#333'; cx.fillRect(w - 35, 6, 30, 5);
            cx.fillStyle = '#44ccff'; cx.fillRect(w - 35, 6, 30 * (0.6 + Math.sin(t) * 0.2), 5);
            cx.fillStyle = '#888'; cx.font = '5px monospace'; cx.textAlign = 'right'; cx.fillText('EN', w - 36, 10);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Mario Bros ──
    function animMarioBros(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var enemies = [{x: -10, y: 0, type: 0, spd: 0.8},{x: w + 10, y: 0, type: 1, spd: -0.7}];
        var bumpY = 0, coins = [];
        function draw() {
            t += 0.025;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(1, '#050518');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var pipeGrad = cx.createLinearGradient(0, 0, 25, 0);
            pipeGrad.addColorStop(0, '#009933'); pipeGrad.addColorStop(0.5, '#00cc55'); pipeGrad.addColorStop(1, '#009933');
            cx.fillStyle = pipeGrad;
            cx.fillRect(0, h * 0.3, 25, h * 0.15); cx.fillRect(0, h * 0.28, 30, 8);
            cx.fillRect(w - 25, h * 0.3, 25, h * 0.15); cx.fillRect(w - 30, h * 0.28, 30, 8);
            cx.fillStyle = 'rgba(0,200,80,0.3)'; cx.fillRect(2, h * 0.31, 6, h * 0.12); cx.fillRect(w - 8, h * 0.31, 6, h * 0.12);
            var platY1 = h * 0.45, platY2 = h * 0.65, platY3 = h * 0.85;
            var platGrad = cx.createLinearGradient(0, 0, 0, 6);
            cx.fillStyle = '#dd7744'; cx.fillRect(30, platY1, w - 60, 6); cx.fillRect(50, platY2, w - 100, 6); cx.fillRect(0, platY3, w, 6);
            cx.fillStyle = '#bb5522'; for (var bxp = 30; bxp < w - 30; bxp += 14) cx.fillRect(bxp, platY1 + 1, 12, 4);
            for (var bx2 = 50; bx2 < w - 50; bx2 += 14) cx.fillRect(bx2, platY2 + 1, 12, 4);
            var powGrad = cx.createLinearGradient(w * 0.46, platY3 - 14, w * 0.46, platY3);
            powGrad.addColorStop(0, '#5555ff'); powGrad.addColorStop(1, '#3333cc');
            cx.fillStyle = powGrad; cx.fillRect(w * 0.46, platY3 - 14, 20, 14);
            cx.fillStyle = '#fff'; cx.font = 'bold 7px monospace'; cx.textAlign = 'center';
            cx.shadowColor = '#fff'; cx.shadowBlur = 3; cx.fillText('POW', w * 0.46 + 10, platY3 - 4); cx.shadowBlur = 0;
            for (var i = 0; i < enemies.length; i++) {
                var en = enemies[i]; en.x += en.spd;
                var ey = (i === 0) ? platY2 - 10 : platY1 - 10;
                if (en.spd > 0 && en.x > w + 10) en.x = -10;
                if (en.spd < 0 && en.x < -10) en.x = w + 10;
                if (en.type === 0) {
                    cx.fillStyle = '#44dd44'; cx.fillRect(en.x - 6, ey - 4, 12, 10);
                    cx.fillStyle = '#228822'; cx.fillRect(en.x - 4, ey - 7, 8, 4);
                    cx.fillStyle = '#44dd44'; cx.fillRect(en.x - 8, ey + 2, 4, 4); cx.fillRect(en.x + 4, ey + 2, 4, 4);
                    cx.fillStyle = '#fff'; cx.fillRect(en.x - 3, ey - 2, 2, 2); cx.fillRect(en.x + 1, ey - 2, 2, 2);
                } else {
                    cx.fillStyle = '#ff5555'; cx.fillRect(en.x - 7, ey - 3, 14, 8);
                    cx.fillStyle = '#dd3333'; cx.fillRect(en.x - 10, ey - 6, 5, 5); cx.fillRect(en.x + 5, ey - 6, 5, 5);
                    cx.fillStyle = '#fff'; cx.fillRect(en.x - 3, ey - 1, 2, 2); cx.fillRect(en.x + 2, ey - 1, 2, 2);
                }
            }
            bumpY = Math.abs(Math.sin(t * 2.5)) < 0.15 ? -4 : 0;
            var marioX = w * 0.4 + Math.sin(t * 1.5) * 30, marioY = platY2 + 10;
            cx.fillStyle = '#ff3333'; cx.fillRect(marioX - 4, marioY - 10 + bumpY, 8, 5);
            cx.fillStyle = '#ffccaa'; cx.fillRect(marioX - 3, marioY - 5 + bumpY, 6, 4);
            cx.fillStyle = '#3344ff'; cx.fillRect(marioX - 5, marioY - 1 + bumpY, 10, 6);
            cx.fillStyle = '#884422'; cx.fillRect(marioX - 4, marioY + 5 + bumpY, 3, 3); cx.fillRect(marioX + 1, marioY + 5 + bumpY, 3, 3);
            if (bumpY < 0) { coins.push({x: marioX, y: marioY - 18, vy: -2, life: 0.6}); }
            for (var ci = coins.length - 1; ci >= 0; ci--) { var cn = coins[ci]; cn.y += cn.vy; cn.vy += 0.1; cn.life -= 0.02;
                cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4; cx.globalAlpha = cn.life;
                cx.beginPath(); cx.arc(cn.x, cn.y, 3, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0; if (cn.life <= 0) coins.splice(ci, 1); } cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Balloon Fight ──
    function animBalloonFight(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var enemies = [];
        for (var i = 0; i < 3; i++) enemies.push({x: w * 0.3 + i * w * 0.25, y: h * 0.3 + Math.random() * h * 0.15});
        var pops = [], lightningTimer = 0;
        function draw() {
            t += 0.025;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#060628'); bg.addColorStop(0.6, '#0a0a3a'); bg.addColorStop(1, '#0a1a44');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#fff';
            for (var s = 0; s < 20; s++) { cx.globalAlpha = 0.15 + 0.15 * Math.sin(t * 2 + s); cx.fillRect((s * 67 + 13) % w, (s * 41 + 7) % (h * 0.5), 1.5, 1.5); }
            cx.globalAlpha = 1;
            for (var c = 0; c < 3; c++) {
                var clx = (c * 140 + t * 10) % (w + 80) - 40;
                cx.fillStyle = 'rgba(140,170,220,0.08)';
                cx.beginPath(); cx.arc(clx, h * 0.12 + c * 20, 20, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(clx + 16, h * 0.12 + c * 20 - 5, 15, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(clx - 10, h * 0.12 + c * 20 + 3, 12, 0, Math.PI * 2); cx.fill();
            }
            var waterGrad = cx.createLinearGradient(0, h * 0.82, 0, h);
            waterGrad.addColorStop(0, '#1a3366'); waterGrad.addColorStop(1, '#0a1a44');
            cx.fillStyle = waterGrad; cx.fillRect(0, h * 0.82, w, h * 0.18);
            for (var wv = 0; wv < w; wv += 6) { cx.fillStyle = 'rgba(60,100,200,0.3)'; cx.fillRect(wv, h * 0.82 + Math.sin(t * 3 + wv * 0.1) * 2, 4, 2); }
            var fishX = (t * 50) % (w + 40) - 20, fishPhase = Math.sin(t * 3);
            if (fishPhase > 0.5) {
                var fishY = h * 0.82 - fishPhase * 20;
                cx.fillStyle = '#ff7744'; cx.shadowColor = '#ff7744'; cx.shadowBlur = 3;
                cx.beginPath(); cx.moveTo(fishX, fishY); cx.lineTo(fishX - 8, fishY + 6); cx.lineTo(fishX - 8, fishY - 6); cx.closePath(); cx.fill();
                cx.beginPath(); cx.arc(fishX + 4, fishY, 5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0; cx.fillStyle = '#000'; cx.beginPath(); cx.arc(fishX + 5, fishY - 1, 1, 0, Math.PI * 2); cx.fill();
            }
            lightningTimer += 0.025;
            if (lightningTimer > 4 && lightningTimer < 4.1) {
                cx.strokeStyle = '#ffff44'; cx.lineWidth = 2; cx.shadowColor = '#ffff44'; cx.shadowBlur = 10;
                var lx = w * 0.6; cx.beginPath(); cx.moveTo(lx, 0); cx.lineTo(lx - 8, h * 0.2); cx.lineTo(lx + 5, h * 0.25); cx.lineTo(lx - 3, h * 0.45); cx.stroke(); cx.shadowBlur = 0;
            }
            if (lightningTimer > 5) lightningTimer = 0;
            for (var i = 0; i < enemies.length; i++) {
                var en = enemies[i]; en.x += Math.sin(t * 1.5 + i * 2) * 0.5; en.y += Math.cos(t * 1.2 + i) * 0.4;
                cx.fillStyle = '#ff5599'; cx.shadowColor = '#ff5599'; cx.shadowBlur = 4;
                cx.beginPath(); cx.arc(en.x, en.y - 16, 8, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
                cx.strokeStyle = '#ff5599'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(en.x, en.y - 8); cx.lineTo(en.x, en.y - 2); cx.stroke();
                cx.fillStyle = '#cc3366'; cx.fillRect(en.x - 4, en.y - 2, 8, 8);
                cx.fillRect(en.x - 5, en.y + 6, 4, 4); cx.fillRect(en.x + 1, en.y + 6, 4, 4);
            }
            var px = w * 0.2 + Math.sin(t * 1.3) * 40, py = h * 0.45 + Math.sin(t * 0.8) * 30;
            cx.fillStyle = '#ff7799'; cx.shadowColor = '#ff7799'; cx.shadowBlur = 5;
            cx.beginPath(); cx.arc(px - 7, py - 22, 9, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#55bbff'; cx.shadowColor = '#55bbff';
            cx.beginPath(); cx.arc(px + 7, py - 22, 9, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = 'rgba(255,255,255,0.25)'; cx.beginPath(); cx.arc(px - 9, py - 25, 3, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(px + 5, py - 25, 3, 0, Math.PI * 2); cx.fill();
            cx.strokeStyle = '#aaa'; cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(px - 7, py - 13); cx.lineTo(px, py - 6); cx.stroke();
            cx.beginPath(); cx.moveTo(px + 7, py - 13); cx.lineTo(px, py - 6); cx.stroke();
            cx.fillStyle = '#ffccaa'; cx.fillRect(px - 3, py - 6, 6, 4);
            cx.fillStyle = '#888'; cx.beginPath(); cx.arc(px, py - 9, 5, Math.PI, 0); cx.fill();
            cx.fillStyle = '#4488ff'; cx.fillRect(px - 4, py - 2, 8, 8);
            cx.fillStyle = '#4488ff'; cx.fillRect(px - 5, py + 6, 4, 4); cx.fillRect(px + 1, py + 6, 4, 4);
            for (var p = pops.length - 1; p >= 0; p--) { pops[p].life -= 0.02; if (pops[p].life <= 0) { pops.splice(p, 1); continue; }
                cx.fillStyle = '#ffcc00'; cx.globalAlpha = pops[p].life; cx.fillRect(pops[p].x + Math.random() * 6 - 3, pops[p].y + Math.random() * 6 - 3, 2, 2); }
            cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Lode Runner ──
    function animLodeRunner(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = 14, cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var ladders = [{x:4,y1:2,y2:5},{x:10,y1:5,y2:8},{x:18,y1:3,y2:6},{x:24,y1:6,y2:9}];
        var platRows = [2, 5, 8, 11];
        var gold = [{x:6,y:1},{x:15,y:4},{x:22,y:7},{x:8,y:7},{x:20,y:1}];
        var holes = [], dissolveEffects = [];
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a1e'); bg.addColorStop(1, '#050510');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < platRows.length; i++) {
                var py = platRows[i] * cs;
                var pg = cx.createLinearGradient(0, py, 0, py + cs);
                pg.addColorStop(0, '#996644'); pg.addColorStop(1, '#664422');
                cx.fillStyle = pg; cx.fillRect(0, py, w, cs);
                cx.fillStyle = '#553311'; for (var bxp = 0; bxp < w; bxp += cs) { cx.fillRect(bxp + 1, py + 1, cs - 2, cs - 2); cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fillRect(bxp + 2, py + 2, cs - 4, 3); cx.fillStyle = '#553311'; }
            }
            for (var hi = holes.length - 1; hi >= 0; hi--) { holes[hi].life -= 0.02; if (holes[hi].life <= 0) holes.splice(hi, 1); }
            if (Math.sin(t * 1.5) > 0.98 && holes.length < 3) { var hx = Math.floor(Math.random() * cols), hr = platRows[Math.floor(Math.random() * platRows.length)] / cs;
                holes.push({x: hx, row: hr, life: 2}); dissolveEffects.push({x: hx * cs, y: hr * cs, life: 0.5}); }
            cx.fillStyle = '#080818'; for (var hi2 = 0; hi2 < holes.length; hi2++) cx.fillRect(holes[hi2].x * cs, holes[hi2].row * cs, cs, cs);
            for (var di = dissolveEffects.length - 1; di >= 0; di--) { var de = dissolveEffects[di]; de.life -= 0.03;
                for (var dp = 0; dp < 3; dp++) { cx.fillStyle = '#996644'; cx.globalAlpha = de.life; cx.fillRect(de.x + Math.random() * cs, de.y + cs + Math.random() * 8, 2, 2); }
                if (de.life <= 0) dissolveEffects.splice(di, 1); } cx.globalAlpha = 1;
            cx.strokeStyle = '#7799bb'; cx.lineWidth = 2;
            for (var i = 0; i < ladders.length; i++) {
                var la = ladders[i];
                cx.beginPath(); cx.moveTo(la.x * cs + 3, la.y1 * cs); cx.lineTo(la.x * cs + 3, la.y2 * cs); cx.stroke();
                cx.beginPath(); cx.moveTo(la.x * cs + cs - 3, la.y1 * cs); cx.lineTo(la.x * cs + cs - 3, la.y2 * cs); cx.stroke();
                for (var ry = la.y1; ry < la.y2; ry++) { cx.beginPath(); cx.moveTo(la.x * cs + 3, ry * cs + cs / 2); cx.lineTo(la.x * cs + cs - 3, ry * cs + cs / 2); cx.stroke(); }
            }
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 6;
            for (var i = 0; i < gold.length; i++) {
                var gx = gold[i].x * cs + cs / 2, gy = gold[i].y * cs + cs / 2;
                cx.beginPath(); cx.moveTo(gx, gy - 3); cx.lineTo(gx + 4, gy); cx.lineTo(gx, gy + 3); cx.lineTo(gx - 4, gy); cx.closePath(); cx.fill();
                cx.fillStyle = 'rgba(255,255,200,' + (0.3 + Math.sin(t * 4 + i) * 0.2) + ')';
                cx.beginPath(); cx.arc(gx, gy, 5, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#ffcc00';
            }
            cx.shadowBlur = 0;
            var phase = (t * 0.5) % 4, pxl, py2;
            if (phase < 1) { pxl = w * 0.15 + phase * w * 0.2; py2 = platRows[0] * cs - 6; }
            else if (phase < 2) { pxl = w * 0.35; py2 = platRows[0] * cs - 6 + (phase - 1) * (platRows[1] - platRows[0]) * cs; }
            else if (phase < 3) { pxl = w * 0.35 + (phase - 2) * w * 0.3; py2 = platRows[1] * cs - 6; }
            else { pxl = w * 0.65; py2 = platRows[1] * cs - 6 + (phase - 3) * (platRows[2] - platRows[1]) * cs; }
            cx.fillStyle = '#55ddff'; cx.shadowColor = '#55ddff'; cx.shadowBlur = 3;
            cx.fillRect(pxl - 4, py2 - 8, 8, 10); cx.shadowBlur = 0;
            cx.fillStyle = '#ffccaa'; cx.fillRect(pxl - 3, py2 - 12, 6, 5);
            cx.fillRect(pxl - 6, py2 - 4, 3, 3); cx.fillRect(pxl + 3, py2 - 4, 3, 3);
            var ex = w * 0.7 + Math.sin(t * 1.2) * 30, ey = platRows[1] * cs - 6;
            cx.fillStyle = '#ff5555'; cx.fillRect(ex - 4, ey - 8, 8, 10);
            cx.fillStyle = '#dd3333'; cx.fillRect(ex - 3, ey - 12, 6, 5);
            cx.fillStyle = '#ff0'; cx.fillRect(ex - 2, ey - 10, 2, 2); cx.fillRect(ex + 1, ey - 10, 2, 2);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Pitfall ──
    function animPitfall(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.025;
            cx.fillStyle = '#080818'; cx.fillRect(0, 0, w, h);
            var canopyGrad = cx.createLinearGradient(0, 0, 0, 35);
            canopyGrad.addColorStop(0, '#0d550d'); canopyGrad.addColorStop(1, '#116611');
            cx.fillStyle = canopyGrad; cx.fillRect(0, 0, w, 10);
            cx.fillStyle = '#116611';
            for (var lx = 0; lx < w; lx += 18) { cx.beginPath(); cx.arc(lx + 9, 20, 14 + Math.sin(t + lx * 0.1) * 2, 0, Math.PI * 2); cx.fill(); }
            cx.fillStyle = '#0d8d0d'; for (var lx2 = 0; lx2 < w; lx2 += 22) { cx.beginPath(); cx.arc(lx2 + 11, 14, 8, 0, Math.PI * 2); cx.fill(); }
            cx.strokeStyle = '#338833'; cx.lineWidth = 3;
            cx.beginPath(); cx.moveTo(w * 0.3, 25); cx.lineTo(w * 0.3, h * 0.55); cx.stroke();
            cx.beginPath(); cx.moveTo(w * 0.7, 25); cx.lineTo(w * 0.7, h * 0.55); cx.stroke();
            for (var vn = 0; vn < 4; vn++) { cx.strokeStyle = 'rgba(50,130,50,0.3)'; cx.lineWidth = 1;
                cx.beginPath(); cx.moveTo(w * 0.3 + vn * 10, 25); cx.quadraticCurveTo(w * 0.3 + vn * 10 + 8, 35, w * 0.3 + vn * 10 + 3, 50); cx.stroke(); }
            cx.fillStyle = '#554422'; cx.fillRect(0, h * 0.6, w, 8);
            cx.fillStyle = '#080818'; cx.fillRect(w * 0.4, h * 0.6, w * 0.2, 8);
            var waterGrad = cx.createLinearGradient(0, h * 0.68, 0, h * 0.83);
            waterGrad.addColorStop(0, '#2a5588'); waterGrad.addColorStop(1, '#1a3366');
            cx.fillStyle = waterGrad; cx.fillRect(0, h * 0.68, w, h * 0.15);
            for (var wv = 0; wv < w; wv += 8) { cx.fillStyle = 'rgba(80,150,220,0.3)'; cx.fillRect(wv, h * 0.68 + Math.sin(t * 3 + wv * 0.2) * 1.5, 6, 2); }
            var crocX = w * 0.35 + Math.sin(t) * 20;
            cx.fillStyle = '#44aa33'; cx.fillRect(crocX - 12, h * 0.72, 24, 5);
            cx.fillRect(crocX + 10, h * 0.71, 8, 3);
            cx.fillStyle = '#338822'; cx.fillRect(crocX - 10, h * 0.725, 20, 2);
            var jawAngle = Math.sin(t * 4) * 0.3;
            cx.fillStyle = '#ff3333'; cx.fillRect(crocX + 14, h * 0.715 - jawAngle * 4, 4, 2);
            cx.fillStyle = '#fff'; for (var tt = 0; tt < 3; tt++) cx.fillRect(crocX + 11 + tt * 3, h * 0.725, 1, 1);
            cx.fillStyle = '#443311'; cx.fillRect(0, h * 0.83, w, h * 0.17);
            cx.fillStyle = 'rgba(60,40,15,0.3)'; for (var rk = 0; rk < 6; rk++) cx.fillRect((rk * 67 + 10) % w, h * 0.85 + (rk % 3) * 8, 8, 5);
            var scorpX = (t * 30) % (w + 20) - 10;
            cx.fillStyle = '#dd7733'; cx.fillRect(scorpX - 5, h * 0.57, 10, 4);
            cx.fillRect(scorpX + 4, h * 0.54, 3, 4); cx.fillRect(scorpX + 6, h * 0.52, 2, 3);
            cx.fillStyle = '#ff3333'; cx.fillRect(scorpX + 7, h * 0.51, 2, 1);
            var snakeX = w * 0.6 + Math.sin(t * 2) * 10; cx.fillStyle = '#339933';
            for (var si = 0; si < 5; si++) cx.fillRect(snakeX + Math.sin(t * 3 + si * 0.5) * 3, h * 0.57 + si * 2, 3, 3);
            var swingAngle = Math.sin(t * 2.5) * 0.6;
            var ropeX = w * 0.3, ropeLen = h * 0.25;
            var charX = ropeX + Math.sin(swingAngle) * ropeLen;
            var charY = 25 + Math.cos(swingAngle) * ropeLen;
            cx.strokeStyle = '#55aa55'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(ropeX, 25); cx.lineTo(charX, charY); cx.stroke();
            cx.fillStyle = '#ffccaa'; cx.fillRect(charX - 3, charY - 4, 6, 4);
            cx.fillStyle = '#dd9944'; cx.fillRect(charX - 4, charY, 8, 6);
            cx.fillStyle = '#cc8833'; cx.fillRect(charX - 5, charY + 6, 3, 4); cx.fillRect(charX + 2, charY + 6, 3, 4);
            cx.fillStyle = '#884422'; cx.beginPath(); cx.arc(charX, charY - 6, 4, Math.PI, 0); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: River Raid ──
    function animRiverRaid(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var boats = [{y:h*0.3,x:0.5,spd:0.3},{y:h*0.6,x:0.6,spd:-0.4}];
        var bullets = [], jetParts = [];
        function draw() {
            t += 0.025;
            var riverGrad = cx.createLinearGradient(0, 0, 0, h);
            riverGrad.addColorStop(0, '#1155aa'); riverGrad.addColorStop(0.5, '#2266bb'); riverGrad.addColorStop(1, '#1155aa');
            cx.fillStyle = riverGrad; cx.fillRect(0, 0, w, h);
            for (var cr = 0; cr < 8; cr++) { var cry = (cr * 35 + t * 30) % (h + 20) - 10;
                cx.fillStyle = 'rgba(100,180,255,0.08)'; cx.fillRect(w * 0.15, cry, w * 0.7, 2); }
            var scroll = (t * 40) % h;
            cx.fillStyle = '#228833';
            for (var sy = -h; sy < h * 2; sy += 4) {
                var yy = (sy + scroll) % (h * 2) - h;
                var bankL = w * 0.12 + Math.sin((sy + t * 40) * 0.015) * w * 0.06;
                var bankR = w * 0.88 + Math.sin((sy + t * 40) * 0.015 + 2) * w * 0.06;
                cx.fillRect(0, yy, bankL, 4); cx.fillRect(bankR, yy, w - bankR, 4);
            }
            var bridgeY = ((t * 40) % (h * 1.5));
            if (bridgeY < h) { var brGrad = cx.createLinearGradient(w * 0.08, bridgeY, w * 0.08, bridgeY + 8);
                brGrad.addColorStop(0, '#aaaaaa'); brGrad.addColorStop(1, '#666666');
                cx.fillStyle = brGrad; cx.fillRect(w * 0.08, bridgeY, w * 0.84, 8);
                cx.fillStyle = '#888'; cx.fillRect(w * 0.15, bridgeY - 4, 4, 16); cx.fillRect(w * 0.8, bridgeY - 4, 4, 16); }
            var fuelY = ((t * 40 + h * 0.7) % (h * 1.5));
            if (fuelY < h) { cx.fillStyle = '#ffdd33'; cx.shadowColor = '#ffdd33'; cx.shadowBlur = 4; cx.fillRect(w * 0.04, fuelY, 14, 10); cx.shadowBlur = 0;
                cx.fillStyle = '#ff4444'; cx.font = 'bold 6px monospace'; cx.textAlign = 'center'; cx.fillText('F', w * 0.04 + 7, fuelY + 8); }
            for (var i = 0; i < boats.length; i++) {
                var b = boats[i]; b.x += Math.sin(t * 2 + i) * 0.003;
                var bxp = w * Math.max(0.2, Math.min(0.8, b.x)), byp = (b.y + scroll) % (h + 40) - 20;
                cx.fillStyle = '#995555'; cx.fillRect(bxp - 8, byp - 3, 16, 6);
                cx.fillStyle = '#aa6666'; cx.fillRect(bxp - 4, byp - 6, 8, 4);
                cx.fillStyle = '#777'; cx.fillRect(bxp - 1, byp - 8, 2, 4);
            }
            var heliX = w * 0.5 + Math.sin(t * 3) * w * 0.15, heliY = (h * 0.2 + scroll * 0.5) % (h + 40) - 20;
            cx.fillStyle = '#cc4444'; cx.fillRect(heliX - 6, heliY - 3, 12, 6);
            cx.fillStyle = '#ff6666'; cx.fillRect(heliX - 12 + Math.sin(t * 20) * 4, heliY - 5, 24, 2);
            var px = w * 0.5 + Math.sin(t * 1.5) * 25;
            cx.fillStyle = '#dddddd';
            cx.beginPath(); cx.moveTo(px, h * 0.82 - 10); cx.lineTo(px - 8, h * 0.82 + 6); cx.lineTo(px + 8, h * 0.82 + 6); cx.closePath(); cx.fill();
            cx.fillStyle = '#5599ff'; cx.fillRect(px - 12, h * 0.82, 6, 4); cx.fillRect(px + 6, h * 0.82, 6, 4);
            for (var jp = 0; jp < 2; jp++) jetParts.push({x: px + (Math.random()-0.5)*4, y: h * 0.82 + 8, vy: 1 + Math.random(), life: 0.3, c: Math.random() < 0.5 ? '#ff8844' : '#ffcc44'});
            for (var ji = jetParts.length - 1; ji >= 0; ji--) { var jp2 = jetParts[ji]; jp2.y += jp2.vy; jp2.life -= 0.03;
                cx.fillStyle = jp2.c; cx.globalAlpha = jp2.life; cx.fillRect(jp2.x - 1, jp2.y, 2, 2);
                if (jp2.life <= 0) jetParts.splice(ji, 1); } cx.globalAlpha = 1;
            if (Math.random() < 0.05) bullets.push({x: px, y: h * 0.82 - 10});
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 3;
            for (var bi = bullets.length - 1; bi >= 0; bi--) { bullets[bi].y -= 5; cx.fillRect(bullets[bi].x - 1, bullets[bi].y, 2, 6); if (bullets[bi].y < 0) bullets.splice(bi, 1); }
            cx.shadowBlur = 0;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Kaboom ──
    function animKaboom(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bombs = [], score = 0, splashParts = [];
        function draw() {
            t += 0.03;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a22'); bg.addColorStop(1, '#050510');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            var bomberX = w * 0.5 + Math.sin(t * 2.5) * (w * 0.35);
            cx.fillStyle = '#cc4444'; cx.fillRect(bomberX - 12, 15, 24, 16);
            cx.fillStyle = '#ffccaa'; cx.fillRect(bomberX - 6, 6, 12, 10);
            cx.fillStyle = '#333'; cx.fillRect(bomberX - 8, 3, 16, 5);
            cx.fillStyle = '#fff'; cx.fillRect(bomberX - 4, 9, 3, 3); cx.fillRect(bomberX + 1, 9, 3, 3);
            cx.fillStyle = '#000'; cx.fillRect(bomberX - 3, 10, 2, 2); cx.fillRect(bomberX + 2, 10, 2, 2);
            cx.fillStyle = '#000'; cx.fillRect(bomberX - 3, 14, 6, 1);
            cx.fillStyle = '#ffaa00'; cx.globalAlpha = 0.5 + Math.sin(t * 8) * 0.3;
            cx.beginPath(); cx.arc(bomberX - 4, 14, 1.5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(bomberX + 4, 14, 1.5, 0, Math.PI * 2); cx.fill();
            cx.globalAlpha = 1;
            if (Math.random() < 0.06) bombs.push({x: bomberX + (Math.random() - 0.5) * 10, y: 32, spd: 1.5 + Math.random()});
            var bucketX = w * 0.5 + Math.sin(t * 2.5 - 0.3) * (w * 0.35);
            var bucketColors = ['#ff4444', '#ffcc00', '#44cc44'];
            for (var i = 0; i < 3; i++) {
                var byp = h - 18 - i * 16, bw = 28 + i * 6;
                var bg2 = cx.createLinearGradient(bucketX - bw/2, byp, bucketX + bw/2, byp);
                bg2.addColorStop(0, bucketColors[i]); bg2.addColorStop(0.5, 'rgba(255,255,255,0.2)'); bg2.addColorStop(1, bucketColors[i]);
                cx.fillStyle = bg2; cx.fillRect(bucketX - bw / 2, byp, bw, 12);
                cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(bucketX - bw / 2 + 2, byp + 2, bw - 4, 3);
            }
            for (var b = bombs.length - 1; b >= 0; b--) {
                bombs[b].y += bombs[b].spd;
                var bxp = bombs[b].x, by2 = bombs[b].y;
                var bombGrad = cx.createRadialGradient(bxp - 1, by2 - 1, 0, bxp, by2, 5);
                bombGrad.addColorStop(0, '#444'); bombGrad.addColorStop(1, '#111');
                cx.fillStyle = bombGrad; cx.beginPath(); cx.arc(bxp, by2, 5, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.arc(bxp - 1.5, by2 - 1.5, 1.5, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = '#aa6622'; cx.lineWidth = 1.5;
                cx.beginPath(); cx.moveTo(bxp, by2 - 5); cx.lineTo(bxp + 2, by2 - 9); cx.stroke();
                var fuseC = Math.sin(t * 15 + b) > 0 ? '#ff8800' : '#ffee00';
                cx.fillStyle = fuseC; cx.shadowColor = fuseC; cx.shadowBlur = 5;
                cx.fillRect(bxp + 1, by2 - 11, 2, 3); cx.shadowBlur = 0;
                if (by2 > h - 50 && Math.abs(bxp - bucketX) < 18) {
                    for (var sp = 0; sp < 5; sp++) splashParts.push({x: bxp, y: by2, vx: (Math.random()-0.5)*4, vy: -Math.random()*3, life: 0.4});
                    bombs.splice(b, 1); score++; continue; }
                if (by2 > h + 10) bombs.splice(b, 1);
            }
            for (var si = splashParts.length - 1; si >= 0; si--) { var sp2 = splashParts[si]; sp2.x += sp2.vx; sp2.y += sp2.vy; sp2.vy += 0.1; sp2.life -= 0.03;
                cx.fillStyle = '#88ccff'; cx.globalAlpha = sp2.life; cx.fillRect(sp2.x, sp2.y, 2, 2);
                if (sp2.life <= 0) splashParts.splice(si, 1); } cx.globalAlpha = 1;
            cx.fillStyle = '#fff'; cx.font = '10px monospace'; cx.textAlign = 'right';
            cx.fillText('' + (score % 1000), w - 8, 14);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Berzerk ──
    function animBerzerk(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var robots = [];
        for (var i = 0; i < 5; i++) robots.push({x: w * 0.3 + Math.random() * w * 0.5, y: h * 0.2 + Math.random() * h * 0.5, dx: (Math.random() - 0.5) * 0.8, dy: (Math.random() - 0.5) * 0.8, type: i % 3});
        var rBullets = [], pBullets = [], wallZaps = [];
        function draw() {
            t += 0.025;
            cx.fillStyle = '#000000'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = '#0044ff'; cx.lineWidth = 3; cx.shadowColor = '#0066ff'; cx.shadowBlur = 6;
            cx.strokeRect(4, 4, w - 8, h - 8); cx.shadowBlur = 0;
            cx.strokeStyle = '#0033cc'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(w * 0.4, 4); cx.lineTo(w * 0.4, h * 0.3); cx.stroke();
            cx.beginPath(); cx.moveTo(w * 0.65, h * 0.7); cx.lineTo(w * 0.65, h - 4); cx.stroke();
            cx.beginPath(); cx.moveTo(w * 0.2, h * 0.5); cx.lineTo(w * 0.5, h * 0.5); cx.stroke();
            cx.fillStyle = '#000'; cx.fillRect(w * 0.45, 0, 30, 6); cx.fillRect(w * 0.45, h - 6, 30, 6);
            if (Math.random() < 0.01) wallZaps.push({x: Math.random() * w, y: Math.random() < 0.5 ? 4 : h - 4, life: 0.3});
            for (var wz = wallZaps.length - 1; wz >= 0; wz--) { var zp = wallZaps[wz]; zp.life -= 0.02;
                cx.fillStyle = '#4488ff'; cx.globalAlpha = zp.life; cx.shadowColor = '#4488ff'; cx.shadowBlur = 8;
                cx.beginPath(); cx.arc(zp.x, zp.y, 4, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0; if (zp.life <= 0) wallZaps.splice(wz, 1); } cx.globalAlpha = 1;
            for (var i = 0; i < robots.length; i++) {
                var r = robots[i]; r.x += r.dx; r.y += r.dy;
                if (r.x < 15 || r.x > w - 15) r.dx *= -1;
                if (r.y < 15 || r.y > h - 15) r.dy *= -1;
                var rcols = ['#00ff44', '#00cc88', '#44ff88'][r.type];
                cx.fillStyle = rcols; cx.fillRect(r.x - 5, r.y - 8, 10, 12);
                cx.fillRect(r.x - 4, r.y - 12, 8, 5);
                cx.fillStyle = '#ff0000'; cx.shadowColor = '#ff0000'; cx.shadowBlur = 3;
                cx.fillRect(r.x - 3, r.y - 11, 2, 2); cx.fillRect(r.x + 1, r.y - 11, 2, 2); cx.shadowBlur = 0;
                cx.fillStyle = rcols; cx.fillRect(r.x - 5, r.y + 4, 3, 5); cx.fillRect(r.x + 2, r.y + 4, 3, 5);
                cx.fillStyle = '#888'; cx.fillRect(r.x - 1, r.y - 14, 2, 3);
                cx.fillStyle = rcols; cx.beginPath(); cx.arc(r.x, r.y - 14, 1.5, 0, Math.PI * 2); cx.fill();
                if (Math.random() < 0.008) rBullets.push({x: r.x, y: r.y, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3});
            }
            cx.fillStyle = '#ff4444'; cx.shadowColor = '#ff4444'; cx.shadowBlur = 2;
            for (var b = rBullets.length - 1; b >= 0; b--) { rBullets[b].x += rBullets[b].dx; rBullets[b].y += rBullets[b].dy; cx.fillRect(rBullets[b].x - 1, rBullets[b].y - 1, 3, 3); if (rBullets[b].x < 0 || rBullets[b].x > w || rBullets[b].y < 0 || rBullets[b].y > h) rBullets.splice(b, 1); }
            cx.shadowBlur = 0;
            var px = w * 0.15 + Math.sin(t * 1.8) * 25, py = h * 0.7 + Math.cos(t * 1.3) * 20;
            cx.fillStyle = '#00ff44'; cx.fillRect(px - 3, py - 8, 6, 10); cx.fillRect(px - 2, py - 12, 4, 5);
            cx.fillRect(px - 4, py + 2, 3, 5); cx.fillRect(px + 1, py + 2, 3, 5);
            cx.fillRect(px - 6, py - 4, 3, 3); cx.fillRect(px + 3, py - 4, 3, 3);
            if (Math.random() < 0.03) pBullets.push({x: px, y: py - 4, dx: 4, dy: 0});
            cx.fillStyle = '#ffff44'; cx.shadowColor = '#ffff44'; cx.shadowBlur = 3;
            for (var b2 = pBullets.length - 1; b2 >= 0; b2--) { pBullets[b2].x += pBullets[b2].dx; pBullets[b2].y += pBullets[b2].dy; cx.fillRect(pBullets[b2].x - 1, pBullets[b2].y - 1, 3, 3); if (pBullets[b2].x > w) pBullets.splice(b2, 1); }
            cx.shadowBlur = 0;
            var ottoX = w * 0.8 + Math.sin(t * 1.5) * 15, ottoY = h * 0.3 + Math.abs(Math.sin(t * 3)) * 20;
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 8;
            cx.beginPath(); cx.arc(ottoX, ottoY, 10, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = '#000'; cx.fillRect(ottoX - 4, ottoY - 3, 3, 3); cx.fillRect(ottoX + 1, ottoY - 3, 3, 3);
            cx.strokeStyle = '#000'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(ottoX, ottoY + 1, 5, 0.2, Math.PI - 0.2); cx.stroke();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Wizard of Wor ──
    function animWizardOfWor(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0, cs = 18;
        var maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
            [1,0,1,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,1],
            [1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        var monsters = [{x:5,y:3,c:'#ff4444'},{x:14,y:5,c:'#44ccff'},{x:9,y:7,c:'#ffcc00'}];
        var torches = [{x:1,y:1},{x:18,y:1},{x:1,y:7},{x:18,y:7}];
        function draw() {
            t += 0.025;
            cx.fillStyle = '#06000e'; cx.fillRect(0, 0, w, h);
            var ofx = (w - 20 * cs) / 2, ofy = (h - 9 * cs) / 2;
            for (var r = 0; r < maze.length; r++) for (var c = 0; c < maze[r].length; c++) {
                if (maze[r][c] === 1) {
                    var wg = cx.createLinearGradient(ofx + c * cs, ofy + r * cs, ofx + c * cs, ofy + (r + 1) * cs);
                    wg.addColorStop(0, '#5533bb'); wg.addColorStop(1, '#3311aa');
                    cx.fillStyle = wg; cx.fillRect(ofx + c * cs, ofy + r * cs, cs, cs);
                    cx.fillStyle = 'rgba(255,255,255,0.06)'; cx.fillRect(ofx + c * cs + 1, ofy + r * cs + 1, cs - 2, 2);
                }
            }
            for (var ti = 0; ti < torches.length; ti++) {
                var tc = torches[ti], tcx = ofx + tc.x * cs + cs / 2, tcy = ofy + tc.y * cs + cs / 2;
                var tg = cx.createRadialGradient(tcx, tcy, 0, tcx, tcy, cs * 2);
                tg.addColorStop(0, 'rgba(255,150,50,0.15)'); tg.addColorStop(1, 'rgba(255,100,0,0)');
                cx.fillStyle = tg; cx.fillRect(tcx - cs * 2, tcy - cs * 2, cs * 4, cs * 4);
                cx.fillStyle = '#ff8833'; cx.shadowColor = '#ff8833'; cx.shadowBlur = 6;
                cx.beginPath(); cx.arc(tcx, tcy - 2 + Math.sin(t * 6 + ti) * 1, 2, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            }
            var wizX = ofx + 3 * cs + Math.sin(t * 1.5) * cs, wizY = ofy + 1 * cs + cs / 2;
            cx.fillStyle = '#ffcc00'; cx.beginPath(); cx.moveTo(wizX, wizY - 10); cx.lineTo(wizX - 5, wizY - 2); cx.lineTo(wizX + 5, wizY - 2); cx.closePath(); cx.fill();
            cx.fillStyle = '#aa88ff'; cx.fillRect(wizX - 4, wizY - 2, 8, 8);
            cx.fillRect(wizX - 5, wizY + 6, 4, 3); cx.fillRect(wizX + 1, wizY + 6, 4, 3);
            if (Math.sin(t * 4) > 0.5) {
                cx.strokeStyle = '#ffee44'; cx.lineWidth = 2; cx.shadowColor = '#ffee44'; cx.shadowBlur = 8;
                cx.beginPath(); cx.moveTo(wizX + 5, wizY); cx.lineTo(wizX + 15, wizY - 3); cx.lineTo(wizX + 12, wizY + 1); cx.lineTo(wizX + 22, wizY - 2); cx.stroke();
                cx.shadowBlur = 0;
            }
            for (var i = 0; i < monsters.length; i++) {
                var m = monsters[i];
                var mmx = ofx + m.x * cs + Math.sin(t * 1.2 + i * 2) * 6 + cs / 2;
                var mmy = ofy + m.y * cs + Math.cos(t * 1 + i) * 4 + cs / 2;
                cx.fillStyle = m.c; cx.shadowColor = m.c; cx.shadowBlur = 5;
                cx.globalAlpha = 0.7 + Math.sin(t * 3 + i) * 0.3;
                cx.beginPath(); cx.arc(mmx, mmy, 5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                cx.fillStyle = '#fff'; cx.fillRect(mmx - 2, mmy - 2, 2, 2); cx.fillRect(mmx + 1, mmy - 2, 2, 2);
                cx.globalAlpha = 1;
            }
            cx.fillStyle = '#001a00'; cx.fillRect(0, 0, w, 14);
            var radarGrad = cx.createLinearGradient(0, 0, w, 0);
            radarGrad.addColorStop(0, 'rgba(0,255,68,0.05)'); radarGrad.addColorStop(0.5, 'rgba(0,255,68,0.2)'); radarGrad.addColorStop(1, 'rgba(0,255,68,0.05)');
            cx.fillStyle = radarGrad; cx.fillRect(0, 2, w, 10);
            cx.fillStyle = '#00ff44'; for (var ri = 0; ri < 6; ri++) cx.fillRect((ri * 60 + t * 30) % w, 5, 3, 4);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Commando ──
    function animCommando(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bullets = [], grenades = [], enemies = [], explosions = [];
        for (var i = 0; i < 4; i++) enemies.push({x: w * 0.2 + Math.random() * w * 0.6, y: Math.random() * h * 0.4});
        function draw() {
            t += 0.025;
            var jungleGrad = cx.createLinearGradient(0, 0, 0, h);
            jungleGrad.addColorStop(0, '#1a3a1a'); jungleGrad.addColorStop(1, '#0e2a0e');
            cx.fillStyle = jungleGrad; cx.fillRect(0, 0, w, h);
            var scroll = (t * 30) % 40;
            cx.fillStyle = 'rgba(30,50,22,0.3)';
            for (var gy = -40; gy < h; gy += 40) for (var gx = 0; gx < w; gx += 40) cx.fillRect(gx + 2, gy + scroll + 2, 36, 36);
            for (var tr = 0; tr < 6; tr++) {
                var ttx = (tr * 73 + 20) % w, tty = ((tr * 97 + scroll * 2) % (h + 60)) - 30;
                cx.fillStyle = '#664422'; cx.fillRect(ttx - 2, tty + 8, 4, 10);
                cx.fillStyle = '#115511'; cx.beginPath(); cx.arc(ttx, tty, 14, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#0d440d'; cx.beginPath(); cx.arc(ttx + 4, tty - 3, 8, 0, Math.PI * 2); cx.fill();
            }
            var bunkerY = ((scroll * 3) % (h + 80)) - 40;
            var bunkGrad = cx.createLinearGradient(w * 0.55, bunkerY, w * 0.55, bunkerY + 20);
            bunkGrad.addColorStop(0, '#777766'); bunkGrad.addColorStop(1, '#444433');
            cx.fillStyle = bunkGrad; cx.fillRect(w * 0.55, bunkerY, 30, 20);
            cx.fillStyle = '#222211'; cx.fillRect(w * 0.58, bunkerY + 5, 10, 10);
            cx.fillStyle = '#998866'; cx.fillRect(w * 0.52, bunkerY + 18, 36, 6);
            for (var i = 0; i < enemies.length; i++) {
                var en = enemies[i]; en.y += 0.3; if (en.y > h + 10) { en.y = -10; en.x = w * 0.2 + Math.random() * w * 0.6; }
                cx.fillStyle = '#886644'; cx.fillRect(en.x - 4, en.y - 6, 8, 10);
                cx.fillStyle = '#666644'; cx.fillRect(en.x - 3, en.y - 10, 6, 5);
                cx.fillStyle = '#777'; cx.fillRect(en.x - 1, en.y - 4, 2, 8);
            }
            var px = w * 0.5 + Math.sin(t * 2) * 30, py = h * 0.78;
            cx.fillStyle = '#44bb44'; cx.fillRect(px - 5, py - 7, 10, 12);
            cx.fillStyle = '#336633'; cx.fillRect(px - 4, py - 12, 8, 6);
            cx.fillStyle = '#555'; cx.fillRect(px - 1, py - 16, 2, 8);
            cx.fillStyle = '#ffccaa'; cx.fillRect(px - 2, py - 9, 4, 3);
            if (Math.random() < 0.06) bullets.push({x: px, y: py - 16});
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 2;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].y -= 5; cx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 5); if (bullets[b].y < 0) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            if (Math.random() < 0.015) grenades.push({x: px, y: py - 10, vx: (Math.random() - 0.5) * 3, vy: -4, life: 1.5});
            for (var g = grenades.length - 1; g >= 0; g--) {
                var gr = grenades[g]; gr.x += gr.vx; gr.y += gr.vy; gr.vy += 0.1; gr.life -= 0.03;
                cx.fillStyle = '#556655'; cx.beginPath(); cx.arc(gr.x, gr.y, 3, 0, Math.PI * 2); cx.fill();
                if (gr.life <= 0) {
                    explosions.push({x: gr.x, y: gr.y, life: 0.6});
                    grenades.splice(g, 1);
                }
            }
            for (var ei = explosions.length - 1; ei >= 0; ei--) { var ex = explosions[ei]; ex.life -= 0.03;
                var eg = cx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, 15);
                eg.addColorStop(0, 'rgba(255,200,50,' + ex.life + ')'); eg.addColorStop(0.5, 'rgba(255,100,0,' + ex.life * 0.5 + ')'); eg.addColorStop(1, 'rgba(255,50,0,0)');
                cx.fillStyle = eg; cx.beginPath(); cx.arc(ex.x, ex.y, 15, 0, Math.PI * 2); cx.fill();
                if (ex.life <= 0) explosions.splice(ei, 1); }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Xevious ──
    function animXevious(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var bullets = [], bombs = [];
        function draw() {
            t += 0.025;
            var scroll = (t * 30) % h;
            var terrGrad = cx.createLinearGradient(0, 0, 0, h);
            terrGrad.addColorStop(0, '#2a6622'); terrGrad.addColorStop(0.5, '#336633'); terrGrad.addColorStop(1, '#2a5522');
            cx.fillStyle = terrGrad; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#3a7733';
            for (var py = -h; py < h * 2; py += 60) { var yy = (py + scroll) % (h * 2) - h; cx.fillRect(w * 0.1, yy, w * 0.15, 40); cx.fillRect(w * 0.6, yy + 30, w * 0.2, 25); }
            var riverGrad = cx.createLinearGradient(w * 0.35, 0, w * 0.55, 0);
            riverGrad.addColorStop(0, '#225599'); riverGrad.addColorStop(0.5, '#3377bb'); riverGrad.addColorStop(1, '#225599');
            cx.fillStyle = riverGrad;
            for (var ry = -h; ry < h * 2; ry += 4) { var ryy = (ry + scroll) % (h * 2) - h; cx.fillRect(w * 0.38 + Math.sin(ryy * 0.02) * w * 0.08, ryy, w * 0.12, 4); }
            cx.fillStyle = '#666655'; for (var rd = 0; rd < 3; rd++) { var rdy = ((rd * h * 0.5 + scroll) % (h + 40)) - 20; cx.fillRect(w * 0.05, rdy, w * 0.9, 3); }
            var gtY = ((scroll * 2) % (h + 60)) - 30;
            cx.fillStyle = '#999977'; cx.fillRect(w * 0.55, gtY, 16, 16);
            cx.strokeStyle = '#bbbb99'; cx.lineWidth = 1; cx.strokeRect(w * 0.55, gtY, 16, 16);
            cx.fillStyle = '#777755'; cx.beginPath(); cx.arc(w * 0.55 + 8, gtY + 8, 4, 0, Math.PI * 2); cx.fill();
            var px = w * 0.5 + Math.sin(t * 1.8) * 40, py2 = h * 0.75;
            cx.fillStyle = '#cccccc';
            cx.beginPath(); cx.moveTo(px, py2 - 10); cx.lineTo(px - 10, py2 + 6); cx.lineTo(px + 10, py2 + 6); cx.closePath(); cx.fill();
            cx.fillStyle = '#999'; cx.fillRect(px - 14, py2 + 1, 8, 3); cx.fillRect(px + 6, py2 + 1, 8, 3);
            cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.moveTo(px - 3, py2 - 8); cx.lineTo(px - 8, py2 + 4); cx.lineTo(px - 3, py2 + 4); cx.closePath(); cx.fill();
            if (Math.random() < 0.06) bullets.push({x: px, y: py2 - 10});
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 3;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].y -= 6; cx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 6); if (bullets[b].y < 0) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            var bombSightY = py2 + 40 + Math.sin(t * 2) * 10;
            cx.strokeStyle = '#ff4444'; cx.lineWidth = 1.5; cx.shadowColor = '#ff4444'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(px, bombSightY, 10, 0, Math.PI * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(px - 12, bombSightY); cx.lineTo(px + 12, bombSightY); cx.stroke();
            cx.beginPath(); cx.moveTo(px, bombSightY - 12); cx.lineTo(px, bombSightY + 12); cx.stroke();
            cx.shadowBlur = 0;
            if (Math.random() < 0.02) bombs.push({x: px, y: py2 + 6, targetY: bombSightY, size: 2});
            for (var bi = bombs.length - 1; bi >= 0; bi--) {
                bombs[bi].y += 2; bombs[bi].size += 0.05;
                cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.beginPath(); cx.ellipse(bombs[bi].x + 2, bombSightY + 2, bombs[bi].size * 2, bombs[bi].size, 0, 0, Math.PI * 2); cx.fill();
                cx.fillStyle = '#ff6644'; cx.beginPath(); cx.arc(bombs[bi].x, bombs[bi].y, bombs[bi].size, 0, Math.PI * 2); cx.fill();
                if (bombs[bi].y > bombs[bi].targetY + 5) {
                    var eg = cx.createRadialGradient(bombs[bi].x, bombs[bi].y, 0, bombs[bi].x, bombs[bi].y, 18);
                    eg.addColorStop(0, 'rgba(255,200,100,0.5)'); eg.addColorStop(1, 'rgba(255,80,0,0)');
                    cx.fillStyle = eg; cx.beginPath(); cx.arc(bombs[bi].x, bombs[bi].y, 18, 0, Math.PI * 2); cx.fill();
                    bombs.splice(bi, 1); }
            }
            for (var i = 0; i < 3; i++) {
                var eex = w * 0.2 + i * w * 0.25 + Math.sin(t * 2 + i * 1.5) * 20;
                var eey = (h * 0.15 + i * 20 + scroll * 0.3) % (h * 0.5);
                cx.fillStyle = '#cc4444'; cx.shadowColor = '#cc4444'; cx.shadowBlur = 3;
                cx.beginPath(); cx.moveTo(eex, eey + 5); cx.lineTo(eex - 6, eey - 4); cx.lineTo(eex + 6, eey - 4); cx.closePath(); cx.fill();
                cx.shadowBlur = 0;
            }
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Star Force ──
    function animStarForce(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var stars = [], bullets = [];
        for (var i = 0; i < 50; i++) stars.push({x: Math.random() * w, y: Math.random() * h, s: 0.5 + Math.random() * 2, sp: 0.5 + Math.random() * 3});
        var enemies = [];
        for (var i = 0; i < 6; i++) enemies.push({x: w * 0.15 + (i % 3) * w * 0.3, y: h * 0.1 + Math.floor(i / 3) * 30, shape: i % 3, angle: i * 1.2});
        function draw() {
            t += 0.025;
            var bg = cx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.7);
            bg.addColorStop(0, '#0e0e28'); bg.addColorStop(1, '#040410');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i]; s.y += s.sp; if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
                cx.fillStyle = 'rgba(255,255,255,' + (0.3 + s.s * 0.2) + ')'; cx.fillRect(s.x, s.y, s.s, s.s);
            }
            for (var i = 0; i < enemies.length; i++) {
                var en = enemies[i]; en.angle += 0.02;
                var ex = en.x + Math.sin(en.angle + t) * 25, ey = en.y + Math.cos(en.angle * 0.7 + t) * 15 + Math.sin(t * 0.5) * 10;
                cx.save(); cx.translate(ex, ey); cx.rotate(en.angle);
                if (en.shape === 0) { cx.fillStyle = '#ff4488'; cx.shadowColor = '#ff4488'; cx.shadowBlur = 4; cx.beginPath(); for (var a = 0; a < 6; a++) { var ang = a * Math.PI / 3; cx.lineTo(Math.cos(ang) * 7, Math.sin(ang) * 7); } cx.closePath(); cx.fill(); }
                else if (en.shape === 1) { cx.fillStyle = '#44ccff'; cx.shadowColor = '#44ccff'; cx.shadowBlur = 4; cx.beginPath(); cx.moveTo(0, -8); cx.lineTo(6, 0); cx.lineTo(0, 8); cx.lineTo(-6, 0); cx.closePath(); cx.fill(); }
                else { cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4; cx.beginPath(); for (var a2 = 0; a2 < 5; a2++) { var a1b = a2 * Math.PI * 2 / 5 - Math.PI / 2, a2b = a1b + Math.PI / 5; cx.lineTo(Math.cos(a1b) * 8, Math.sin(a1b) * 8); cx.lineTo(Math.cos(a2b) * 4, Math.sin(a2b) * 4); } cx.closePath(); cx.fill(); }
                cx.shadowBlur = 0; cx.restore();
            }
            var puY = (t * 30) % (h + 40) - 20, puX = w * 0.7 + Math.sin(t * 2) * 15;
            var puGrad = cx.createRadialGradient(puX, puY, 0, puX, puY, 8);
            puGrad.addColorStop(0, '#ffcc66'); puGrad.addColorStop(1, '#ff8844');
            cx.fillStyle = puGrad; cx.shadowColor = '#ff8844'; cx.shadowBlur = 6;
            cx.beginPath(); cx.moveTo(puX, puY - 7); cx.lineTo(puX + 7, puY); cx.lineTo(puX, puY + 7); cx.lineTo(puX - 7, puY); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#fff'; cx.font = 'bold 7px monospace'; cx.textAlign = 'center'; cx.fillText('P', puX, puY + 3);
            var px = w * 0.5 + Math.sin(t * 2) * 35, py = h * 0.82;
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 5;
            cx.beginPath(); cx.moveTo(px, py - 10); cx.lineTo(px - 8, py + 6); cx.lineTo(px + 8, py + 6); cx.closePath(); cx.fill();
            cx.shadowBlur = 0;
            cx.fillStyle = '#ff8800'; cx.fillRect(px - 12, py + 1, 6, 3); cx.fillRect(px + 6, py + 1, 6, 3);
            cx.fillStyle = 'rgba(100,180,255,0.3)'; cx.beginPath(); cx.arc(px, py, 12, 0, Math.PI * 2); cx.stroke();
            if (Math.random() < 0.1) bullets.push({x: px, y: py - 10});
            cx.fillStyle = '#ff4444'; cx.shadowColor = '#ff4444'; cx.shadowBlur = 3;
            for (var b = bullets.length - 1; b >= 0; b--) { bullets[b].y -= 6; cx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 5); if (bullets[b].y < 0) bullets.splice(b, 1); }
            cx.shadowBlur = 0;
            cx.fillStyle = '#ff4400'; cx.globalAlpha = 0.5 + Math.sin(t * 15) * 0.3;
            cx.beginPath(); cx.moveTo(px - 3, py + 6); cx.lineTo(px + 3, py + 6); cx.lineTo(px, py + 14); cx.closePath(); cx.fill();
            cx.globalAlpha = 1;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Punch-Out!! ──
    function animPunchOut(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var hitStars = [];
        function draw() {
            t += 0.03;
            cx.fillStyle = '#1a1a2e'; cx.fillRect(0, 0, w, h);
            var ringGrad = cx.createLinearGradient(0, h * 0.55, 0, h);
            ringGrad.addColorStop(0, '#445577'); ringGrad.addColorStop(1, '#223344');
            cx.fillStyle = ringGrad;
            cx.beginPath(); cx.moveTo(w * 0.1, h * 0.55); cx.lineTo(w * 0.9, h * 0.55); cx.lineTo(w, h); cx.lineTo(0, h); cx.closePath(); cx.fill();
            cx.fillStyle = 'rgba(255,255,255,0.03)';
            for (var rl = 0; rl < 8; rl++) cx.fillRect(w * 0.15 + rl * w * 0.1, h * 0.55, 2, h * 0.45);
            cx.strokeStyle = '#dd4444'; cx.lineWidth = 2.5; cx.shadowColor = '#dd4444'; cx.shadowBlur = 3;
            cx.beginPath(); cx.moveTo(0, h * 0.25); cx.lineTo(w, h * 0.25); cx.stroke();
            cx.beginPath(); cx.moveTo(0, h * 0.35); cx.lineTo(w, h * 0.35); cx.stroke();
            cx.shadowBlur = 0;
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.5;
            cx.beginPath(); cx.moveTo(0, h * 0.45); cx.lineTo(w, h * 0.45); cx.stroke();
            cx.fillStyle = '#999'; cx.fillRect(w * 0.05, h * 0.2, 6, h * 0.35); cx.fillRect(w * 0.92, h * 0.2, 6, h * 0.35);
            var punchPhase = Math.sin(t * 2.5);
            var oppX = w * 0.5, oppY = h * 0.35;
            cx.fillStyle = '#44aa44'; cx.fillRect(oppX - 18, oppY, 36, 35);
            cx.fillStyle = 'rgba(255,255,255,0.1)'; cx.fillRect(oppX - 16, oppY + 2, 14, 33);
            cx.fillStyle = '#dd9966'; cx.beginPath(); cx.arc(oppX, oppY - 8, 14, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#cc8855'; cx.beginPath(); cx.arc(oppX, oppY - 8, 14, 0, Math.PI, true); cx.fill();
            cx.fillStyle = '#000'; cx.fillRect(oppX - 6, oppY - 12, 4, 4); cx.fillRect(oppX + 2, oppY - 12, 4, 4);
            cx.fillStyle = '#cc3333'; cx.fillRect(oppX - 4, oppY - 3, 8, 3);
            if (punchPhase > 0.6) {
                var pArm = (Math.floor(t * 3) % 2 === 0) ? -1 : 1;
                cx.fillStyle = '#dd9966'; cx.fillRect(oppX + pArm * 20, oppY + 25, 14 * pArm, 12);
                cx.fillStyle = '#cc2222'; cx.shadowColor = '#ff4444'; cx.shadowBlur = 4;
                cx.beginPath(); cx.arc(oppX + pArm * 30, oppY + 31, 7, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            } else {
                cx.fillStyle = '#dd9966'; cx.fillRect(oppX - 26, oppY + 5, 10, 20); cx.fillRect(oppX + 16, oppY + 5, 10, 20);
                cx.fillStyle = '#cc2222'; cx.beginPath(); cx.arc(oppX - 21, oppY + 25, 6, 0, Math.PI * 2); cx.fill();
                cx.beginPath(); cx.arc(oppX + 21, oppY + 25, 6, 0, Math.PI * 2); cx.fill();
            }
            var dodgeDir = Math.sin(t * 3) * 0.5;
            var playerX = w * 0.5 + dodgeDir * 30, playerY = h * 0.7;
            cx.fillStyle = '#44cc44'; cx.fillRect(playerX - 12, playerY - 5, 24, 20);
            cx.fillStyle = '#333'; cx.beginPath(); cx.arc(playerX, playerY - 10, 8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#44ff44'; cx.shadowColor = '#44ff44'; cx.shadowBlur = 4;
            cx.beginPath(); cx.arc(playerX - 16, playerY + 2, 6, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(playerX + 16, playerY + 2, 6, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
            if (Math.random() < 0.02) hitStars.push({x: oppX + (Math.random() - 0.5) * 30, y: oppY - 5 + Math.random() * 20, life: 0.8});
            cx.fillStyle = '#ffcc00'; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 6;
            for (var s = hitStars.length - 1; s >= 0; s--) {
                hitStars[s].life -= 0.02; if (hitStars[s].life <= 0) { hitStars.splice(s, 1); continue; }
                cx.globalAlpha = hitStars[s].life;
                var sx = hitStars[s].x, sy = hitStars[s].y;
                cx.beginPath(); for (var sp = 0; sp < 5; sp++) { var sa1 = sp * Math.PI * 2 / 5 - Math.PI / 2, sa2 = sa1 + Math.PI / 5;
                    cx.lineTo(sx + Math.cos(sa1) * 5, sy + Math.sin(sa1) * 5); cx.lineTo(sx + Math.cos(sa2) * 2, sy + Math.sin(sa2) * 2); } cx.closePath(); cx.fill();
            }
            cx.globalAlpha = 1; cx.shadowBlur = 0;
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Marble Madness ──
    function animMarbleMadness(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        function draw() {
            t += 0.02;
            cx.fillStyle = '#0a0a1e'; cx.fillRect(0, 0, w, h);
            var pathSegs = 12;
            for (var i = 0; i < pathSegs; i++) {
                var baseX = w * 0.3 + Math.sin(i * 0.5 + t * 0.3) * 40;
                var baseY = h * 0.1 + i * (h * 0.07);
                cx.save(); cx.translate(baseX, baseY); cx.transform(1, 0.3, -0.5, 1, 0, 0);
                for (var c2 = -2; c2 < 4; c2++) {
                    var tc = ((c2 + i) % 2 === 0) ? '#3344aa' : '#445588';
                    var tg = cx.createLinearGradient(c2 * 14, 0, c2 * 14 + 14, 14);
                    tg.addColorStop(0, tc); tg.addColorStop(1, ((c2 + i) % 2 === 0) ? '#223388' : '#334466');
                    cx.fillStyle = tg; cx.fillRect(c2 * 14, 0, 14, 14);
                    cx.fillStyle = 'rgba(255,255,255,0.06)'; cx.fillRect(c2 * 14, 0, 14, 3);
                }
                cx.restore();
                if (i === 5) { cx.fillStyle = 'rgba(100,255,50,0.15)'; cx.fillRect(baseX - 30, baseY + 10, 20, 8); }
                if (i > 2) { cx.fillStyle = 'rgba(20,20,50,0.6)'; cx.fillRect(baseX - 40, baseY + 10, 8, 6); }
            }
            var marbleIdx = ((t * 1.5) % pathSegs), mi = Math.floor(marbleIdx), mFrac = marbleIdx - mi;
            var mBaseX = w * 0.3 + Math.sin(mi * 0.5 + t * 0.3) * 40, mBaseY = h * 0.1 + mi * (h * 0.07);
            var mNextX = w * 0.3 + Math.sin((mi + 1) * 0.5 + t * 0.3) * 40, mNextY = h * 0.1 + (mi + 1) * (h * 0.07);
            var mx = mBaseX + (mNextX - mBaseX) * mFrac, my = mBaseY + (mNextY - mBaseY) * mFrac;
            cx.fillStyle = 'rgba(0,0,0,0.35)';
            cx.beginPath(); cx.ellipse(mx + 3, my + 9, 8, 3, 0, 0, Math.PI * 2); cx.fill();
            var grad = cx.createRadialGradient(mx - 3, my - 3, 1, mx, my, 8);
            grad.addColorStop(0, '#aaccff'); grad.addColorStop(0.3, '#6699ee'); grad.addColorStop(0.7, '#4466cc'); grad.addColorStop(1, '#223388');
            cx.fillStyle = grad; cx.shadowColor = '#4466cc'; cx.shadowBlur = 6;
            cx.beginPath(); cx.arc(mx, my, 8, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            cx.fillStyle = 'rgba(255,255,255,0.55)'; cx.beginPath(); cx.arc(mx - 2, my - 3, 2.5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.beginPath(); cx.arc(mx + 2, my + 1, 1.5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#050510'; cx.fillRect(0, h * 0.92, w, h * 0.08);
            cx.fillStyle = 'rgba(80,80,140,0.15)';
            for (var v = 0; v < 5; v++) cx.fillRect(v * 80 + (t * 20) % 80, h * 0.92, 30, 3);
            var vig = cx.createRadialGradient(w/2, h/2, w*0.25, w/2, h/2, w*0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Qix ──
    function animQix(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var claimed = [];
        for (var i = 0; i < 3; i++) claimed.push({x: Math.random() * w * 0.3, y: h * (0.5 + Math.random() * 0.4), w: 30 + Math.random() * 40, h: 20 + Math.random() * 30, c: i % 2 === 0 ? '#2244aa' : '#aa2244'});
        var sparx = {x: 2, y: h / 2, dx: 0, dy: 2};
        function draw() {
            t += 0.025;
            cx.fillStyle = '#000000'; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.strokeRect(2, 2, w - 4, h - 4);
            for (var i = 0; i < claimed.length; i++) {
                var cl = claimed[i];
                var cg = cx.createLinearGradient(cl.x, cl.y, cl.x + cl.w, cl.y + cl.h);
                cg.addColorStop(0, cl.c); cg.addColorStop(1, i % 2 === 0 ? '#4466cc' : '#cc4466');
                cx.fillStyle = cg; cx.globalAlpha = 0.45; cx.fillRect(cl.x, cl.y, cl.w, cl.h); cx.globalAlpha = 1;
            }
            if (Math.sin(t * 1.5) > 0) {
                var fillX = w * 0.6 + Math.sin(t * 0.8) * w * 0.15, fillY = h * 0.2 + Math.cos(t * 0.6) * h * 0.15;
                cx.fillStyle = '#2244aa'; cx.globalAlpha = 0.15 + Math.sin(t * 4) * 0.1;
                cx.fillRect(fillX, fillY, 20 + Math.sin(t * 2) * 10, 15 + Math.cos(t * 1.7) * 8); cx.globalAlpha = 1;
            }
            var qx = w * 0.5 + Math.sin(t * 1.2) * w * 0.2, qy = h * 0.4 + Math.cos(t * 0.9) * h * 0.2;
            cx.strokeStyle = '#ff00ff'; cx.lineWidth = 2.5; cx.shadowColor = '#ff00ff'; cx.shadowBlur = 10;
            for (var seg = 0; seg < 6; seg++) {
                var a1 = t * 3 + seg * Math.PI / 3, a2 = t * 3 + (seg + 1) * Math.PI / 3;
                var r1 = 12 + Math.sin(t * 5 + seg) * 5, r2 = 12 + Math.sin(t * 5 + seg + 1) * 5;
                cx.beginPath(); cx.moveTo(qx + Math.cos(a1) * r1, qy + Math.sin(a1) * r1); cx.lineTo(qx + Math.cos(a2) * r2, qy + Math.sin(a2) * r2); cx.stroke();
            }
            cx.shadowBlur = 0;
            cx.strokeStyle = '#00ffff'; cx.lineWidth = 1.5; cx.shadowColor = '#00ffff'; cx.shadowBlur = 6;
            for (var seg2 = 0; seg2 < 6; seg2++) {
                var sa1 = -t * 2.5 + seg2 * Math.PI / 3, sa2 = -t * 2.5 + (seg2 + 1) * Math.PI / 3;
                var sr1 = 8 + Math.sin(t * 4 + seg2 * 2) * 4, sr2 = 8 + Math.sin(t * 4 + seg2 * 2 + 1) * 4;
                cx.beginPath(); cx.moveTo(qx + Math.cos(sa1) * sr1, qy + Math.sin(sa1) * sr1); cx.lineTo(qx + Math.cos(sa2) * sr2, qy + Math.sin(sa2) * sr2); cx.stroke();
            }
            cx.shadowBlur = 0;
            sparx.x += sparx.dx; sparx.y += sparx.dy;
            if (sparx.x <= 2) { sparx.x = 2; sparx.dx = 0; sparx.dy = sparx.dy > 0 ? 2 : -2; }
            if (sparx.x >= w - 2) { sparx.x = w - 2; sparx.dx = 0; sparx.dy = sparx.dy > 0 ? 2 : -2; }
            if (sparx.y <= 2) { sparx.y = 2; sparx.dy = 0; sparx.dx = sparx.dx > 0 ? 2 : -2; }
            if (sparx.y >= h - 2) { sparx.y = h - 2; sparx.dy = 0; sparx.dx = sparx.dx > 0 ? 2 : -2; }
            if (Math.random() < 0.02) { if (sparx.dx !== 0) { sparx.dy = Math.random() < 0.5 ? 2 : -2; sparx.dx = 0; } else { sparx.dx = Math.random() < 0.5 ? 2 : -2; sparx.dy = 0; } }
            cx.fillStyle = '#ff8800'; cx.shadowColor = '#ff8800'; cx.shadowBlur = 6;
            cx.beginPath(); cx.arc(sparx.x, sparx.y, 3, 0, Math.PI * 2); cx.fill(); cx.shadowBlur = 0;
            var plX = w * 0.1 + ((t * 20) % (w * 0.4)), plY = h - 6;
            cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.shadowColor = '#ffcc00'; cx.shadowBlur = 4;
            cx.beginPath(); cx.moveTo(w * 0.1, h - 6); cx.lineTo(plX, plY);
            if (Math.sin(t * 2) > 0.3) cx.lineTo(plX, plY - 30 * Math.sin(t * 2));
            cx.stroke(); cx.shadowBlur = 0;
            cx.fillStyle = '#ffcc00'; cx.fillRect(plX - 3, plY - 3 - (Math.sin(t * 2) > 0.3 ? 30 * Math.sin(t * 2) : 0), 6, 6);
            cx.fillStyle = '#fff'; cx.font = '9px monospace'; cx.textAlign = 'right';
            cx.fillText('72%', w - 6, 14);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Puzzle Bobble ──
    function animPuzzleBobble(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var colors = ['#ff4444','#44cc44','#4488ff','#ffcc00','#ff44ff','#44ffff'];
        var grid = [];
        for (var row = 0; row < 6; row++) {
            var rowArr = [], ncols = (row % 2 === 0) ? 8 : 7;
            for (var col = 0; col < ncols; col++) rowArr.push(Math.random() < 0.7 ? colors[Math.floor(Math.random() * colors.length)] : null);
            grid.push(rowArr);
        }
        var shootBubble = null, popEffects = [];
        function draw() {
            t += 0.025;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a2e'); bg.addColorStop(1, '#050518');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.fillStyle = '#1a1a44'; cx.fillRect(0, 0, 4, h); cx.fillRect(w - 4, 0, 4, h); cx.fillRect(0, 0, w, 4);
            var bubR = 9, startY = 15;
            for (var row = 0; row < grid.length; row++) {
                var offset = (row % 2 === 0) ? 0 : bubR;
                for (var col = 0; col < grid[row].length; col++) {
                    if (!grid[row][col]) continue;
                    var bxp = 10 + offset + col * bubR * 2, byp = startY + row * (bubR * 1.7);
                    var bubGrad = cx.createRadialGradient(bxp - 2, byp - 2, 1, bxp, byp, bubR - 1);
                    bubGrad.addColorStop(0, 'rgba(255,255,255,0.3)'); bubGrad.addColorStop(0.3, grid[row][col]); bubGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
                    cx.fillStyle = bubGrad; cx.beginPath(); cx.arc(bxp, byp, bubR - 1, 0, Math.PI * 2); cx.fill();
                    cx.fillStyle = 'rgba(255,255,255,0.4)'; cx.beginPath(); cx.arc(bxp - 3, byp - 3, 2.5, 0, Math.PI * 2); cx.fill();
                }
            }
            var launchX = w * 0.5, launchY = h - 20;
            var aimAngle = Math.sin(t * 1.5) * 0.6;
            cx.fillStyle = '#666688'; cx.fillRect(launchX - 10, launchY, 20, 12);
            cx.fillStyle = '#777799'; cx.beginPath(); cx.arc(launchX, launchY, 10, Math.PI, 0); cx.fill();
            cx.strokeStyle = 'rgba(170,170,204,0.5)'; cx.lineWidth = 1; cx.setLineDash([3, 3]);
            cx.beginPath(); cx.moveTo(launchX, launchY); cx.lineTo(launchX + Math.sin(aimAngle) * 50, launchY - Math.cos(aimAngle) * 50); cx.stroke();
            cx.setLineDash([]);
            cx.strokeStyle = '#aaaacc'; cx.lineWidth = 2;
            cx.beginPath(); cx.moveTo(launchX, launchY); cx.lineTo(launchX + Math.sin(aimAngle) * 30, launchY - Math.cos(aimAngle) * 30); cx.stroke();
            cx.fillStyle = '#44cc44'; cx.beginPath(); cx.arc(launchX, launchY + 16, 8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000'; cx.fillRect(launchX - 4, launchY + 14, 2, 2); cx.fillRect(launchX + 2, launchY + 14, 2, 2);
            cx.fillStyle = '#ff4444'; cx.fillRect(launchX - 2, launchY + 18, 4, 2);
            if (!shootBubble && Math.random() < 0.02) shootBubble = {x: launchX, y: launchY, vx: Math.sin(aimAngle) * 4, vy: -Math.cos(aimAngle) * 4, c: colors[Math.floor(Math.random() * colors.length)]};
            if (shootBubble) {
                shootBubble.x += shootBubble.vx; shootBubble.y += shootBubble.vy;
                if (shootBubble.x < 10 || shootBubble.x > w - 10) shootBubble.vx *= -1;
                var sbGrad = cx.createRadialGradient(shootBubble.x - 2, shootBubble.y - 2, 1, shootBubble.x, shootBubble.y, bubR - 1);
                sbGrad.addColorStop(0, 'rgba(255,255,255,0.3)'); sbGrad.addColorStop(0.3, shootBubble.c); sbGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
                cx.fillStyle = sbGrad; cx.shadowColor = shootBubble.c; cx.shadowBlur = 5;
                cx.beginPath(); cx.arc(shootBubble.x, shootBubble.y, bubR - 1, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0;
                if (shootBubble.y < startY + grid.length * bubR * 1.7) {
                    for (var sp = 0; sp < 8; sp++) popEffects.push({x: shootBubble.x + (Math.random()-0.5)*12, y: shootBubble.y + (Math.random()-0.5)*12, life: 0.5, c: shootBubble.c});
                    shootBubble = null;
                }
            }
            for (var p = popEffects.length - 1; p >= 0; p--) {
                popEffects[p].life -= 0.03; cx.fillStyle = popEffects[p].c; cx.globalAlpha = popEffects[p].life;
                cx.beginPath(); cx.arc(popEffects[p].x, popEffects[p].y, 2, 0, Math.PI * 2); cx.fill();
                if (popEffects[p].life <= 0) popEffects.splice(p, 1);
            } cx.globalAlpha = 1;
            cx.fillStyle = colors[Math.floor(t * 2) % colors.length];
            cx.beginPath(); cx.arc(launchX + 25, launchY + 5, 5, 0, Math.PI * 2); cx.fill();
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── Preview: Columns ──
    function animColumns(cvs, cx, idx) {
        var w = cvs.width, h = cvs.height, t = 0;
        var cs = 16, cols = Math.floor(w / cs), rows = Math.floor(h / cs);
        var gemColors = ['#ff3366','#44cc44','#4488ff','#ffcc00','#ff8844','#cc44ff'];
        var gemShapes = ['diamond','circle','square'];
        var grid = [];
        for (var y = 0; y < rows; y++) { grid[y] = []; for (var x = 0; x < cols; x++) grid[y][x] = null; }
        for (var y = Math.floor(rows * 0.55); y < rows; y++) for (var x = 0; x < cols; x++) {
            if (Math.random() < 0.55) grid[y][x] = {c: gemColors[Math.floor(Math.random() * gemColors.length)], s: gemShapes[Math.floor(Math.random() * 3)]};
        }
        var falling = {col: Math.floor(cols / 2), y: 0, gems: []};
        var flashCells = [], flashTimer = 0, sparkles = [];
        function newFalling() { falling.col = Math.floor(Math.random() * cols); falling.y = 0; falling.gems = []; for (var i = 0; i < 3; i++) falling.gems.push({c: gemColors[Math.floor(Math.random() * gemColors.length)], s: gemShapes[Math.floor(Math.random() * 3)]}); }
        newFalling();
        function drawGem(gx, gy, gem, sz) {
            var gg = cx.createRadialGradient(gx - sz * 0.1, gy - sz * 0.1, 0, gx, gy, sz * 0.4);
            gg.addColorStop(0, 'rgba(255,255,255,0.3)'); gg.addColorStop(0.5, gem.c); gg.addColorStop(1, 'rgba(0,0,0,0.2)');
            cx.fillStyle = gg;
            if (gem.s === 'diamond') { cx.beginPath(); cx.moveTo(gx, gy - sz * 0.4); cx.lineTo(gx + sz * 0.35, gy); cx.lineTo(gx, gy + sz * 0.4); cx.lineTo(gx - sz * 0.35, gy); cx.closePath(); cx.fill(); }
            else if (gem.s === 'circle') { cx.beginPath(); cx.arc(gx, gy, sz * 0.35, 0, Math.PI * 2); cx.fill(); }
            else cx.fillRect(gx - sz * 0.3, gy - sz * 0.3, sz * 0.6, sz * 0.6);
            cx.fillStyle = 'rgba(255,255,255,0.45)'; cx.beginPath(); cx.arc(gx - sz * 0.1, gy - sz * 0.15, sz * 0.1, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(gx - sz * 0.05, gy + sz * 0.1, sz * 0.08, sz * 0.08);
        }
        function draw() {
            t += 0.02;
            var bg = cx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#0a0a28'); bg.addColorStop(1, '#050514');
            cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = 'rgba(255,255,255,0.02)'; cx.lineWidth = 0.5;
            for (var gx = 0; gx <= cols * cs; gx += cs) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, h); cx.stroke(); }
            for (var gy = 0; gy <= rows * cs; gy += cs) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(cols * cs, gy); cx.stroke(); }
            for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) { if (grid[y][x]) drawGem(x * cs + cs / 2, y * cs + cs / 2, grid[y][x], cs); }
            falling.y += 0.04;
            for (var i = 0; i < falling.gems.length; i++) {
                var fy = Math.floor(falling.y) + i;
                if (fy >= 0 && fy < rows) drawGem(falling.col * cs + cs / 2, (falling.y + i) * cs + cs / 2, falling.gems[i], cs);
            }
            if (falling.y + 2 >= rows * 0.55) newFalling();
            flashTimer += 0.02;
            if (flashTimer > 3) { flashTimer = 0; flashCells = []; var fc = Math.floor(Math.random() * cols);
                for (var fy2 = Math.floor(rows * 0.55); fy2 < Math.min(rows, Math.floor(rows * 0.55) + 3); fy2++) { if (grid[fy2][fc]) { flashCells.push({x: fc, y: fy2});
                    for (var sp = 0; sp < 4; sp++) sparkles.push({x: fc * cs + cs/2 + (Math.random()-0.5)*cs, y: fy2 * cs + cs/2 + (Math.random()-0.5)*cs, life: 0.6, c: grid[fy2][fc].c}); } } }
            if (flashCells.length > 0) {
                cx.fillStyle = '#ffffff'; cx.globalAlpha = 0.4 + Math.sin(t * 15) * 0.3;
                for (var f = 0; f < flashCells.length; f++) cx.fillRect(flashCells[f].x * cs, flashCells[f].y * cs, cs, cs);
                cx.globalAlpha = 1;
            }
            for (var si = sparkles.length - 1; si >= 0; si--) { var sk = sparkles[si]; sk.life -= 0.03;
                cx.fillStyle = sk.c; cx.globalAlpha = sk.life; cx.shadowColor = sk.c; cx.shadowBlur = 4;
                cx.beginPath(); cx.arc(sk.x, sk.y, 1.5, 0, Math.PI * 2); cx.fill();
                cx.shadowBlur = 0; if (sk.life <= 0) sparkles.splice(si, 1); } cx.globalAlpha = 1;
            var vig = cx.createRadialGradient(w/2, h/2, w*0.25, w/2, h/2, w*0.65);
            vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.35)');
            cx.fillStyle = vig; cx.fillRect(0, 0, w, h);
            cardAnimIds[idx] = requestAnimationFrame(draw);
        }
        draw();
    }

    // ── All generic preview animations removed — each game now has its own unique function ──

    // ── Launch game ──
    function setGameTitle(name) {
        var el = document.getElementById('game-title-text');
        el.innerHTML = '';
        var chars = name.split('');
        for (var i = 0; i < chars.length; i++) {
            if (chars[i] === ' ') {
                var sp = document.createElement('span');
                sp.className = 'glyph-space';
                el.appendChild(sp);
            } else {
                var s = document.createElement('span');
                s.className = 'glyph';
                s.textContent = chars[i];
                s.style.animationDelay = (i * 0.06) + 's, ' + (i * 0.15) + 's, ' + (i * 0.2) + 's';
                el.appendChild(s);
            }
        }
    }

    var GAME_MAP = {
        'night-racer':  { title: 'NIGHT RACER',      init: 'initNightRacer',      stop: 'stopNightRacer' },
        'invaders':     { title: 'COSMIC RAIDERS',   init: 'initSpaceInvaders',   stop: 'stopSpaceInvaders' },
        'snake':        { title: 'SLITHER',          init: 'initSnake',           stop: 'stopSnake' },
        'tetris':       { title: 'BLOCK STACK',      init: 'initTetris',          stop: 'stopTetris' },
        'pacman':       { title: 'DOT MUNCHER',      init: 'initPacman',          stop: 'stopPacman' },
        'breakout':     { title: 'BRICK BUSTER',     init: 'initBreakout',        stop: 'stopBreakout' },
        'asteroids':    { title: 'METEOR FIELD',     init: 'initAsteroids',       stop: 'stopAsteroids' },
        'pong':         { title: 'PADDLE BLIP',      init: 'initPong',            stop: 'stopPong' },
        'frogger':      { title: 'ROAD HOPPER',      init: 'initFrogger',         stop: 'stopFrogger' },
        'missile':      { title: 'WARHEAD WATCH',    init: 'initMissileCommand',  stop: 'stopMissileCommand' },
        'flappy':       { title: 'FLUTTER WING',     init: 'initFlappyBird',      stop: 'stopFlappyBird' },
        'doodle':       { title: 'SKETCH HOP',       init: 'initDoodleJump',      stop: 'stopDoodleJump' },
        'centipede':    { title: 'WRIGGLER',         init: 'initCentipede',       stop: 'stopCentipede' },
        'minesweeper':  { title: 'BOMB FINDER',      init: 'initMinesweeper',     stop: 'stopMinesweeper' },
        'donkey-kong':  { title: 'BARREL APE',       init: 'initDonkeyKong',      stop: 'stopDonkeyKong' },
        'simon':        { title: 'ECHO CHIRP',       init: 'initSimon',           stop: 'stopSimon' },
        'connect-four': { title: 'LINK FOUR',        init: 'initConnectFour',     stop: 'stopConnectFour' },
        'galaga':       { title: 'STAR SWOOP',       init: 'initGalaga',          stop: 'stopGalaga' },
        'tic-tac-toe':  { title: 'X AND O',          init: 'initTicTacToe',       stop: 'stopTicTacToe' },
        '2048':         { title: '2048',             init: 'init2048',            stop: 'stop2048' },
        'lunar-lander': { title: 'MOON LANDER',      init: 'initLunarLander',     stop: 'stopLunarLander' },
        'bomberman':    { title: 'BLAST BUDDY',      init: 'initBomberman',       stop: 'stopBomberman' },
        'galaxian':     { title: 'STAR SQUAD',       init: 'initGalaxian',        stop: 'stopGalaxian' },
        'defender':     { title: 'SKY GUARDIAN',     init: 'initDefender',        stop: 'stopDefender' },
        '1942':         { title: 'AIR ACE 42',       init: 'init1942',            stop: 'stop1942' },
        'sokoban':      { title: 'CRATE PUSHER',     init: 'initSokoban',         stop: 'stopSokoban' },
        'tempest':      { title: 'VORTEX',           init: 'initTempest',         stop: 'stopTempest' },
        'qbert':        { title: 'CUBE HOPPER',      init: 'initQbert',           stop: 'stopQbert' },
        'spy-hunter':   { title: 'AGENT CHASE',      init: 'initSpyHunter',       stop: 'stopSpyHunter' },
        'paperboy':     { title: 'NEWS ROUTE',       init: 'initPaperboy',        stop: 'stopPaperboy' },
        'arkanoid':     { title: 'PADDLE BRICKS',    init: 'initArkanoid',        stop: 'stopArkanoid' },
        'dig-dug':      { title: 'TUNNEL DIG',       init: 'initDigDug',          stop: 'stopDigDug' },
        'bubble-bobble':{ title: 'BUBBLE BURST',     init: 'initBubbleBobble',    stop: 'stopBubbleBobble' },
        'joust':        { title: 'SKY LANCE',        init: 'initJoust',           stop: 'stopJoust' },
        'burger-time':  { title: 'PATTY STACK',      init: 'initBurgerTime',      stop: 'stopBurgerTime' },
        'ice-climber':  { title: 'PEAK CLIMBER',     init: 'initIceClimber',      stop: 'stopIceClimber' },
        'elevator-action':{ title: 'LIFT MISSION',   init: 'initElevatorAction',  stop: 'stopElevatorAction' },
        'excitebike':   { title: 'TURBO BIKE',       init: 'initExcitebike',      stop: 'stopExcitebike' },
        'kung-fu-master':{ title: 'FIST MASTER',     init: 'initKungFuMaster',    stop: 'stopKungFuMaster' },
        'double-dragon':{ title: 'TWIN DRAGON',      init: 'initDoubleDragon',    stop: 'stopDoubleDragon' },
        'pengo':        { title: 'ICE PENGUIN',      init: 'initPengo',           stop: 'stopPengo' },
        'rally-x':      { title: 'MAZE RACER',       init: 'initRallyX',          stop: 'stopRallyX' },
        'time-pilot':   { title: 'CHRONO ACE',       init: 'initTimePilot',       stop: 'stopTimePilot' },
        'phoenix':      { title: 'FIREBIRD',         init: 'initPhoenix',         stop: 'stopPhoenix' },
        'moon-patrol':  { title: 'LUNAR PATROL',     init: 'initMoonPatrol',      stop: 'stopMoonPatrol' },
        'scramble':     { title: 'CAVERN FLIGHT',    init: 'initScramble',        stop: 'stopScramble' },
        'robotron':     { title: 'BOT-TRON 2099',    init: 'initRobotron',        stop: 'stopRobotron' },
        'gauntlet':     { title: 'CRYPT CRAWL',      init: 'initGauntlet',        stop: 'stopGauntlet' },
        'ghosts-n-goblins':{ title: 'GRAVEYARD KNIGHT', init: 'initGhostsNGoblins', stop: 'stopGhostsNGoblins' },
        'mega-man':     { title: 'METAL HERO',       init: 'initMegaMan',         stop: 'stopMegaMan' },
        'mario-bros':   { title: 'PLUMBER BROS',     init: 'initMarioBros',       stop: 'stopMarioBros' },
        'balloon-fight':{ title: 'BALLOON BRAWL',    init: 'initBalloonFight',    stop: 'stopBalloonFight' },
        'lode-runner':  { title: 'GOLD RUNNER',      init: 'initLodeRunner',      stop: 'stopLodeRunner' },
        'pitfall':      { title: 'JUNGLE LEAP',      init: 'initPitfall',         stop: 'stopPitfall' },
        'river-raid':   { title: 'DELTA STRIKE',     init: 'initRiverRaid',       stop: 'stopRiverRaid' },
        'kaboom':       { title: 'BUCKET CATCH',     init: 'initKaboom',          stop: 'stopKaboom' },
        'berzerk':      { title: 'ROBO MAZE',        init: 'initBerzerk',         stop: 'stopBerzerk' },
        'wizard-of-wor':{ title: 'MAZE WIZARD',     init: 'initWizardOfWor',     stop: 'stopWizardOfWor' },
        'commando':     { title: 'STRIKE TEAM',      init: 'initCommando',        stop: 'stopCommando' },
        'xevious':      { title: 'XEROS STRIKE',     init: 'initXevious',         stop: 'stopXevious' },
        'star-force':   { title: 'STAR LEGION',      init: 'initStarForce',       stop: 'stopStarForce' },
        'punch-out':    { title: 'KNOCKOUT!!',       init: 'initPunchOut',        stop: 'stopPunchOut' },
        'marble-madness':{ title: 'MARBLE MAZE',     init: 'initMarbleMadness',   stop: 'stopMarbleMadness' },
        'qix':          { title: 'ZONE TRAP',        init: 'initQix',             stop: 'stopQix' },
        'puzzle-bobble':{ title: 'BUBBLE POP',       init: 'initPuzzleBobble',    stop: 'stopPuzzleBobble' },
        'columns':      { title: 'COLUMN STACK',     init: 'initColumns',         stop: 'stopColumns' },
        'dr-mario':     { title: 'VIRUS BUSTER',     init: 'initDrMario',         stop: 'stopDrMario' },
        'pipe-dream':   { title: 'PIPE FLOW',        init: 'initPipeDream',       stop: 'stopPipeDream' },
        'lights-out':   { title: 'LIGHT GRID',       init: 'initLightsOut',       stop: 'stopLightsOut' },
        'klax':         { title: 'TILE TRACK',       init: 'initKlax',            stop: 'stopKlax' },
        'puyo-puyo':    { title: 'BLOB DROP',        init: 'initPuyoPuyo',        stop: 'stopPuyoPuyo' },
        'reversi':      { title: 'REVERSI',          init: 'initReversi',         stop: 'stopReversi' },
        'checkers':     { title: 'CHECKERS',         init: 'initCheckers',        stop: 'stopCheckers' },
        'memory-match': { title: 'MEMORY MATCH',     init: 'initMemoryMatch',     stop: 'stopMemoryMatch' },
        'sudoku':       { title: 'SUDOKU',           init: 'initSudoku',          stop: 'stopSudoku' },
        'mastermind':   { title: 'CODEBREAKER',      init: 'initMastermind',      stop: 'stopMastermind' },
        'hangman':      { title: 'WORD SAVE',        init: 'initHangman',         stop: 'stopHangman' },
        'battleship':   { title: 'NAVY HUNT',        init: 'initBattleship',      stop: 'stopBattleship' },
        'chrome-dino':  { title: 'DESERT DASH',      init: 'initChromeDino',      stop: 'stopChromeDino' },
        'helicopter':   { title: 'HELICOPTER',       init: 'initHelicopter',      stop: 'stopHelicopter' },
        'crossy-road':  { title: 'TRAFFIC HOP',      init: 'initCrossyRoad',      stop: 'stopCrossyRoad' },
        'whack-a-mole': { title: 'BONK-A-MOLE',      init: 'initWhackAMole',      stop: 'stopWhackAMole' },
        'fruit-ninja':  { title: 'FRUIT SLICER',     init: 'initFruitNinja',      stop: 'stopFruitNinja' },
        'tapper':       { title: 'BAR TAPPER',       init: 'initTapper',          stop: 'stopTapper' },
        'adventure':    { title: 'QUEST',            init: 'initAdventure',       stop: 'stopAdventure' },
        'tower-defense':{ title: 'TOWER GUARD',      init: 'initTowerDefense',    stop: 'stopTowerDefense' },
        'gradius':      { title: 'GRADIENT',         init: 'initGradius',         stop: 'stopGradius' },
        'r-type':       { title: 'R-WING',           init: 'initRType',           stop: 'stopRType' },
        'wrecking-crew':{ title: 'DEMO CREW',        init: 'initWreckingCrew',    stop: 'stopWreckingCrew' },
        'duck-hunt':    { title: 'DUCK SHOOT',       init: 'initDuckHunt',        stop: 'stopDuckHunt' },
        'tank':         { title: 'TANK',             init: 'initTank',            stop: 'stopTank' },
        'outrun':       { title: 'CRUISE LANE',      init: 'initOutrun',          stop: 'stopOutrun' },
        'pole-position':{ title: 'POLE LAP',         init: 'initPolePosition',    stop: 'stopPolePosition' },
        'track-field':  { title: 'TRACK STAR',       init: 'initTrackField',      stop: 'stopTrackField' },
        'solitaire':    { title: 'SOLITAIRE',        init: 'initSolitaire',       stop: 'stopSolitaire' },
        'nonogram':     { title: 'NONOGRAM',         init: 'initNonogram',        stop: 'stopNonogram' },
        'zaxxon':       { title: 'ISOFLIGHT',        init: 'initZaxxon',          stop: 'stopZaxxon' },
        'jungle-hunt':  { title: 'JUNGLE TREK',      init: 'initJungleHunt',      stop: 'stopJungleHunt' },
        'donkey-kong-jr':{ title: 'BARREL APE JR',  init: 'initDonkeyKongJr',    stop: 'stopDonkeyKongJr' },
        'mr-do':        { title: 'MR. DIG!',         init: 'initMrDo',            stop: 'stopMrDo' }
    };
    var currentGameId = null;

    window.launchGame = function(id) {
        var gm = GAME_MAP[id];
        if (!gm) return;
        currentGameId = id;
        document.getElementById('gallery-view').style.display = 'none';
        var gv = document.getElementById('game-view');
        gv.classList.add('active');
        setGameTitle(gm.title);
        if (window.setTitleBgTheme) window.setTitleBgTheme(id);
        if (window.startTitleBgAnim) window.startTitleBgAnim();
        for (var i = 0; i < cardAnimIds.length; i++) { if (cardAnimIds[i]) cancelAnimationFrame(cardAnimIds[i]); }
        if (window[gm.init]) window[gm.init]();
        // Trigger resize after game view is visible so canvas gets correct dimensions
        setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 50);
    };

    window.backToGallery = function() {
        var gv = document.getElementById('game-view');
        gv.classList.remove('active');
        document.getElementById('gallery-view').style.display = '';
        if (currentGameId && GAME_MAP[currentGameId]) {
            var stopFn = GAME_MAP[currentGameId].stop;
            if (window[stopFn]) window[stopFn]();
        }
        currentGameId = null;
        if (window.stopTitleBgAnim) window.stopTitleBgAnim();
        startPreviews();
    };

    // Search filtering
    var searchInput = document.getElementById('game-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var query = this.value.toLowerCase().trim();
            var cards = grid.querySelectorAll('.game-card');
            for (var i = 0; i < cards.length; i++) {
                var name = cards[i].querySelector('.game-card-name').textContent.toLowerCase();
                cards[i].style.display = (query === '' || name.indexOf(query) !== -1) ? '' : 'none';
            }
        });
    }

    startPreviews();
})();

// ═══════════════════════════════════════════════════
// TITLE BAR — Per-game themed background animations
// ═══════════════════════════════════════════════════
(function() {
    var cvs, cx, w, h, animId = null, t = 0;
    var particles = [], currentTheme = 'night-racer';

    var THEMES = {
        'night-racer': { bg: '#0a0a1a', accent: '#ff4422', accent2: '#ffaa44', style: 'racer' },
        'invaders':    { bg: '#050520', accent: '#00ff66', accent2: '#ff3366', style: 'space' },
        'snake':       { bg: '#0a180a', accent: '#00ff66', accent2: '#ff3355', style: 'matrix' },
        'tetris':      { bg: '#0a0a2e', accent: '#00d4ff', accent2: '#ffcc00', style: 'blocks' },
        'pacman':      { bg: '#000010', accent: '#ffcc00', accent2: '#ff0000', style: 'dots' },
        'breakout':    { bg: '#0a0a2e', accent: '#00ccff', accent2: '#ff3366', style: 'bricks' },
        'asteroids':   { bg: '#060612', accent: '#ffcc00', accent2: '#aaaaaa', style: 'rocks' },
        'pong':        { bg: '#080818', accent: '#00ccff', accent2: '#ff4466', style: 'volley' },
        'frogger':     { bg: '#001a00', accent: '#00ff66', accent2: '#4488ff', style: 'river' },
        'missile':     { bg: '#000022', accent: '#ff3355', accent2: '#ffcc00', style: 'defend' },
        'flappy':      { bg: '#1a3355', accent: '#ffcc00', accent2: '#44aa44', style: 'sky' },
        'doodle':      { bg: '#1a2e1a', accent: '#66bb6a', accent2: '#ff9800', style: 'bounce' },
        'centipede':   { bg: '#0a1a0a', accent: '#00ff44', accent2: '#ff44ff', style: 'bugs' },
        'minesweeper': { bg: '#2c3e50', accent: '#c0c0c0', accent2: '#ff0000', style: 'grid' },
        'donkey-kong': { bg: '#0a0a1a', accent: '#cc3322', accent2: '#8B4513', style: 'girders' },
        'simon':       { bg: '#0a0a1a', accent: '#ff3333', accent2: '#33cc33', style: 'dots' },
        'connect-four':{ bg: '#00008b', accent: '#ff4444', accent2: '#ffcc00', style: 'blocks' },
        'galaga':      { bg: '#050520', accent: '#ff3366', accent2: '#ffcc00', style: 'space' },
        'tic-tac-toe': { bg: '#0a0a2e', accent: '#00ccff', accent2: '#ff4466', style: 'grid' },
        '2048':        { bg: '#1a1a0a', accent: '#edc22e', accent2: '#f67c5f', style: 'blocks' },
        'lunar-lander':{ bg: '#050510', accent: '#aaaaaa', accent2: '#ffcc00', style: 'space' },
        'bomberman':   { bg: '#0a1a0a', accent: '#ff6600', accent2: '#44cc44', style: 'bricks' },
        'galaxian':    { bg: '#050520', accent: '#ff4444', accent2: '#44aaff', style: 'space' },
        'defender':    { bg: '#050520', accent: '#00ff66', accent2: '#ff6600', style: 'space' },
        '1942':        { bg: '#0a1a0a', accent: '#44cc44', accent2: '#ff3333', style: 'space' },
        'sokoban':     { bg: '#1a1a0a', accent: '#cc8844', accent2: '#ffcc00', style: 'blocks' },
        'tempest':     { bg: '#0a0a2e', accent: '#ff00ff', accent2: '#00ffff', style: 'rocks' },
        'qbert':       { bg: '#1a0a1a', accent: '#ff8800', accent2: '#aa44ff', style: 'bounce' },
        'spy-hunter':  { bg: '#0a0a1a', accent: '#ff2222', accent2: '#cccccc', style: 'racer' },
        'paperboy':    { bg: '#0a1a0a', accent: '#4488ff', accent2: '#44cc44', style: 'river' },
        'arkanoid':    { bg: '#0a0a2e', accent: '#ff3366', accent2: '#00ccff', style: 'bricks' },
        'dig-dug':     { bg: '#1a0a00', accent: '#cc8844', accent2: '#ff4444', style: 'bugs' },
        'bubble-bobble':{ bg: '#0a1a0a', accent: '#44cc44', accent2: '#4488ff', style: 'bounce' },
        'joust':       { bg: '#0a0a1a', accent: '#ffcc00', accent2: '#ff4444', style: 'sky' },
        'burger-time': { bg: '#1a0a00', accent: '#ff8800', accent2: '#44cc44', style: 'bricks' },
        'ice-climber': { bg: '#0a1a2e', accent: '#88ccff', accent2: '#ffffff', style: 'sky' },
        'elevator-action':{ bg: '#0a0a1a', accent: '#ff3333', accent2: '#4488ff', style: 'blocks' },
        'excitebike':  { bg: '#0a0a1a', accent: '#ff4444', accent2: '#ffcc00', style: 'racer' },
        'kung-fu-master':{ bg: '#1a0a0a', accent: '#ff4444', accent2: '#ffcc00', style: 'bricks' },
        'double-dragon':{ bg: '#0a0a1a', accent: '#4488ff', accent2: '#ff4444', style: 'bricks' },
        'pengo':       { bg: '#0a1a2e', accent: '#44aaff', accent2: '#ffffff', style: 'grid' },
        'rally-x':     { bg: '#0a0a1a', accent: '#4488ff', accent2: '#ff4444', style: 'racer' },
        'time-pilot':  { bg: '#1a2e3e', accent: '#00ccff', accent2: '#ff8800', style: 'sky' },
        'phoenix':     { bg: '#050520', accent: '#ff6600', accent2: '#ffcc00', style: 'space' },
        'moon-patrol': { bg: '#050510', accent: '#aaaaaa', accent2: '#ff4444', style: 'space' },
        'scramble':    { bg: '#0a0a1a', accent: '#44cc44', accent2: '#ff6600', style: 'defend' },
        'robotron':    { bg: '#050520', accent: '#ff00ff', accent2: '#00ff66', style: 'space' },
        'gauntlet':    { bg: '#1a0a00', accent: '#ffcc00', accent2: '#ff4444', style: 'bricks' },
        'ghosts-n-goblins':{ bg: '#0a0a1a', accent: '#ff3333', accent2: '#aa44ff', style: 'defend' },
        'mega-man':    { bg: '#0a0a2e', accent: '#4488ff', accent2: '#00ffcc', style: 'blocks' },
        'mario-bros':  { bg: '#0a0a1a', accent: '#ff3333', accent2: '#44cc44', style: 'bricks' },
        'balloon-fight':{ bg: '#0a1a2e', accent: '#ff4488', accent2: '#44aaff', style: 'sky' },
        'lode-runner': { bg: '#1a0a00', accent: '#ffcc00', accent2: '#cc8844', style: 'bricks' },
        'pitfall':     { bg: '#0a1a0a', accent: '#44cc44', accent2: '#cc8844', style: 'river' },
        'river-raid':  { bg: '#0a0a2e', accent: '#4488ff', accent2: '#44cc44', style: 'river' },
        'kaboom':      { bg: '#0a0a1a', accent: '#ff4444', accent2: '#ffcc00', style: 'defend' },
        'berzerk':     { bg: '#050520', accent: '#00ff66', accent2: '#ff4444', style: 'grid' },
        'wizard-of-wor':{ bg: '#0a001a', accent: '#aa44ff', accent2: '#ffcc00', style: 'grid' },
        'commando':    { bg: '#0a1a0a', accent: '#44cc44', accent2: '#cc8844', style: 'defend' },
        'xevious':     { bg: '#0a1a0a', accent: '#cccccc', accent2: '#44cc44', style: 'space' },
        'star-force':  { bg: '#050520', accent: '#ffcc00', accent2: '#ff4444', style: 'space' },
        'punch-out':   { bg: '#0a0a1a', accent: '#44cc44', accent2: '#ff4444', style: 'volley' },
        'marble-madness':{ bg: '#0a0a2e', accent: '#4488ff', accent2: '#ff4488', style: 'bounce' },
        'qix':         { bg: '#000010', accent: '#ff00ff', accent2: '#00ffff', style: 'grid' },
        'puzzle-bobble':{ bg: '#0a0a2e', accent: '#ff4488', accent2: '#44aaff', style: 'bounce' },
        'columns':     { bg: '#0a0a2e', accent: '#ff3366', accent2: '#44cc44', style: 'blocks' },
        'dr-mario':    { bg: '#0a0a2e', accent: '#ff4444', accent2: '#4488ff', style: 'blocks' },
        'pipe-dream':  { bg: '#0a1a1a', accent: '#cccccc', accent2: '#44cc44', style: 'grid' },
        'lights-out':  { bg: '#0a0a1a', accent: '#ffcc00', accent2: '#444444', style: 'grid' },
        'klax':        { bg: '#0a0a2e', accent: '#ff6600', accent2: '#44aaff', style: 'blocks' },
        'puyo-puyo':   { bg: '#0a1a0a', accent: '#ff4488', accent2: '#44cc44', style: 'bounce' },
        'reversi':     { bg: '#004400', accent: '#ffffff', accent2: '#222222', style: 'grid' },
        'checkers':    { bg: '#1a0a00', accent: '#ff3333', accent2: '#222222', style: 'grid' },
        'memory-match':{ bg: '#0a0a2e', accent: '#ff8800', accent2: '#4488ff', style: 'dots' },
        'sudoku':      { bg: '#0a0a2e', accent: '#4488ff', accent2: '#ffcc00', style: 'grid' },
        'mastermind':  { bg: '#0a0a1a', accent: '#ff4444', accent2: '#44cc44', style: 'dots' },
        'hangman':     { bg: '#1a1a0a', accent: '#ffcc00', accent2: '#ffffff', style: 'matrix' },
        'battleship':  { bg: '#001a2e', accent: '#4488ff', accent2: '#ff4444', style: 'river' },
        'chrome-dino': { bg: '#1a1a1a', accent: '#555555', accent2: '#44cc44', style: 'rocks' },
        'helicopter':  { bg: '#0a1a0a', accent: '#44cc44', accent2: '#ff4444', style: 'sky' },
        'crossy-road': { bg: '#0a1a0a', accent: '#ffcc00', accent2: '#ff4444', style: 'river' },
        'whack-a-mole':{ bg: '#1a0a00', accent: '#cc8844', accent2: '#44cc44', style: 'bounce' },
        'fruit-ninja': { bg: '#0a0a1a', accent: '#ff4444', accent2: '#44cc44', style: 'defend' },
        'tapper':      { bg: '#1a0a00', accent: '#ffcc00', accent2: '#cc8844', style: 'bricks' },
        'adventure':   { bg: '#0a1a0a', accent: '#ffcc00', accent2: '#44cc44', style: 'grid' },
        'tower-defense':{ bg: '#0a1a1a', accent: '#44aaff', accent2: '#ff4444', style: 'defend' },
        'gradius':     { bg: '#050520', accent: '#4488ff', accent2: '#ff8800', style: 'space' },
        'r-type':      { bg: '#050520', accent: '#ff4444', accent2: '#44aaff', style: 'space' },
        'wrecking-crew':{ bg: '#0a0a1a', accent: '#ffcc00', accent2: '#ff4444', style: 'bricks' },
        'duck-hunt':   { bg: '#1a3355', accent: '#44cc44', accent2: '#cc8844', style: 'sky' },
        'tank':        { bg: '#0a1a0a', accent: '#44cc44', accent2: '#cccccc', style: 'grid' },
        'outrun':      { bg: '#1a3355', accent: '#ff4444', accent2: '#44aaff', style: 'racer' },
        'pole-position':{ bg: '#0a1a0a', accent: '#ff4444', accent2: '#ffcc00', style: 'racer' },
        'track-field': { bg: '#1a0a00', accent: '#ff4444', accent2: '#ffcc00', style: 'volley' },
        'solitaire':   { bg: '#004400', accent: '#ff4444', accent2: '#44cc44', style: 'dots' },
        'nonogram':    { bg: '#0a0a2e', accent: '#4488ff', accent2: '#222222', style: 'grid' },
        'zaxxon':      { bg: '#050520', accent: '#44aaff', accent2: '#ff6600', style: 'space' },
        'jungle-hunt': { bg: '#0a1a0a', accent: '#44cc44', accent2: '#cc8844', style: 'river' },
        'donkey-kong-jr':{ bg: '#0a0a1a', accent: '#cc8844', accent2: '#ff4444', style: 'girders' },
        'mr-do':       { bg: '#0a0a1a', accent: '#ff4444', accent2: '#ffcc00', style: 'bugs' }
    };

    function init() {
        cvs = document.getElementById('title-bg-canvas');
        if (!cvs) return;
        cx = cvs.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }
    function resize() {
        if (!cvs) return;
        var rect = cvs.parentElement.getBoundingClientRect();
        cvs.width = Math.round(rect.width);
        cvs.height = Math.round(rect.height);
        w = cvs.width; h = cvs.height;
        seed();
    }
    function seed() {
        particles = [];
        for (var i = 0; i < 60; i++) particles.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            size: 1 + Math.random() * 3, life: Math.random(),
            phase: Math.random() * Math.PI * 2, speed: 1 + Math.random() * 5
        });
    }

    function drawRacer() {
        // Night racer: streaking stars, road dashes, headlight flares, sparks
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x -= p.speed; if (p.x < -20) { p.x = w + 20; p.y = Math.random() * h; }
            var tw = 0.4 + 0.4 * Math.sin(t * 5 + p.phase);
            cx.strokeStyle = 'rgba(255,255,255,' + (tw * 0.7) + ')'; cx.lineWidth = p.size * 0.6;
            cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x + p.speed * 4, p.y); cx.stroke();
            if (i < 12) { // road dashes at bottom
                var dy = h * 0.6 + (i / 12) * h * 0.35;
                cx.strokeStyle = 'rgba(200,200,200,0.2)'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(p.x, dy); cx.lineTo(p.x + 15, dy); cx.stroke();
            }
            if (i < 8) { // sparks
                var a = 0.3 + 0.3 * Math.sin(t * 6 + i);
                cx.strokeStyle = 'hsla(' + (i * 5) + ',100%,60%,' + (a * 0.4) + ')'; cx.lineWidth = 1;
                cx.beginPath(); cx.moveTo(p.x + p.speed * 2, p.y); cx.lineTo(p.x - 10, p.y); cx.stroke();
            }
        }
        // headlight flares
        for (var f = 0; f < 3; f++) {
            var fx = (t * 40 + f * w / 3) % (w + 100) - 50;
            var pulse = 0.1 + 0.06 * Math.sin(t * 3 + f * 2);
            var grd = cx.createRadialGradient(fx, h / 2, 0, fx, h / 2, 40);
            grd.addColorStop(0, 'rgba(255,200,100,' + pulse + ')'); grd.addColorStop(1, 'rgba(255,50,20,0)');
            cx.fillStyle = grd; cx.fillRect(fx - 40, 0, 80, h);
        }
        var rumble = Math.floor(t * 10) % 2;
        cx.fillStyle = rumble ? 'rgba(255,30,30,0.3)' : 'rgba(255,255,255,0.08)';
        cx.fillRect(0, h - 2, w, 2);
    }

    function drawSpace() {
        // Space invaders: twinkling stars, descending invader silhouettes, laser flashes
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var twinkle = 0.3 + 0.5 * Math.sin(t * 3 + p.phase);
            cx.fillStyle = 'rgba(255,255,255,' + twinkle + ')';
            cx.fillRect(p.x, p.y, p.size * 0.8, p.size * 0.8);
        }
        // descending invader shapes
        for (var i = 0; i < 6; i++) {
            var ix = (i * w / 6 + t * 20) % (w + 40) - 20;
            var iy = h * 0.3 + Math.sin(t * 2 + i) * 5;
            cx.fillStyle = 'rgba(0,255,100,0.12)';
            cx.fillRect(ix - 6, iy - 4, 12, 8); cx.fillRect(ix - 8, iy, 4, 4); cx.fillRect(ix + 4, iy, 4, 4);
        }
        // laser bolts
        for (var i = 0; i < 3; i++) {
            var ly = ((t * 200 + i * 150) % (h + 20)) - 10;
            var lx = w * 0.2 + i * w * 0.3 + Math.sin(t + i) * 20;
            cx.fillStyle = 'rgba(0,255,100,0.4)'; cx.fillRect(lx - 1, ly, 2, 8);
        }
    }

    function drawMatrix() {
        // Snake: falling green characters, grid pattern
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.y += p.speed * 0.8; if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
            var a = 0.15 + 0.15 * Math.sin(t * 2 + p.phase);
            cx.fillStyle = 'rgba(0,255,100,' + a + ')'; cx.font = Math.round(8 + p.size * 2) + 'px monospace';
            cx.fillText(String.fromCharCode(0x2580 + Math.floor(p.phase * 10) % 30), p.x, p.y);
        }
        // subtle grid
        cx.strokeStyle = 'rgba(0,255,100,0.04)';
        for (var x = 0; x < w; x += 16) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
    }

    function drawBlocks() {
        // Tetris: falling block shapes, color bands
        var colors = ['#00d4ff', '#ffcc00', '#aa44ff', '#ff6600', '#2266ff', '#00cc44', '#ff2244'];
        for (var i = 0; i < 10; i++) {
            var bx = (i * w / 10 + t * 15) % (w + 30) - 15;
            var by = ((t * (30 + i * 8) + i * 80) % (h + 30)) - 15;
            cx.fillStyle = colors[i % 7]; cx.globalAlpha = 0.12;
            cx.fillRect(bx, by, 12, 12); cx.fillRect(bx + 12, by, 12, 12);
            if (i % 3 === 0) cx.fillRect(bx, by + 12, 12, 12);
            if (i % 3 === 1) cx.fillRect(bx + 12, by + 12, 12, 12);
        }
        cx.globalAlpha = 1;
        // grid lines
        cx.strokeStyle = 'rgba(0,212,255,0.04)';
        for (var x = 0; x < w; x += 14) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
    }

    function drawDots() {
        // Pac-Man: dot grid, pac mouth, ghost silhouettes
        for (var x = 10; x < w; x += 20) for (var y = 5; y < h; y += 12) {
            cx.fillStyle = 'rgba(255,204,136,0.12)'; cx.beginPath(); cx.arc(x, y, 1.5, 0, Math.PI * 2); cx.fill();
        }
        // pac
        var px = (t * 60) % (w + 40) - 20, py = h / 2;
        var mouth = 0.3 + 0.2 * Math.sin(t * 12);
        cx.fillStyle = 'rgba(255,204,0,0.25)'; cx.beginPath(); cx.arc(px, py, 10, mouth, Math.PI * 2 - mouth); cx.lineTo(px, py); cx.fill();
        // ghost chase
        for (var g = 0; g < 3; g++) {
            var gx = px - 30 - g * 22, gy = py;
            cx.fillStyle = ['rgba(255,0,0,0.15)','rgba(255,184,255,0.15)','rgba(0,255,255,0.15)'][g];
            cx.beginPath(); cx.arc(gx, gy - 3, 8, Math.PI, 0); cx.lineTo(gx + 8, gy + 6); cx.lineTo(gx - 8, gy + 6); cx.fill();
        }
    }

    function drawBricks() {
        // Breakout: brick pattern, bouncing ball trail
        var colors = ['#ff3366', '#ff6622', '#ffcc00', '#22cc44', '#00ccff', '#aa44ff'];
        for (var r = 0; r < 3; r++) for (var c = 0; c < Math.ceil(w / 30); c++) {
            cx.fillStyle = colors[(r + c) % 6]; cx.globalAlpha = 0.1;
            cx.fillRect(c * 30 + 2, r * 10 + 2, 26, 7);
        }
        cx.globalAlpha = 1;
        // bouncing ball
        var bx = w / 2 + Math.sin(t * 3) * w * 0.3, by = h * 0.5 + Math.cos(t * 4) * h * 0.3;
        cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.beginPath(); cx.arc(bx, by, 4, 0, Math.PI * 2); cx.fill();
        // trail
        for (var i = 1; i <= 4; i++) {
            var tx2 = w / 2 + Math.sin(t * 3 - i * 0.1) * w * 0.3, ty = h * 0.5 + Math.cos(t * 4 - i * 0.1) * h * 0.3;
            cx.fillStyle = 'rgba(255,255,255,' + (0.08 / i) + ')'; cx.beginPath(); cx.arc(tx2, ty, 3, 0, Math.PI * 2); cx.fill();
        }
    }

    function drawRocks() {
        // Asteroids: drifting asteroid outlines, star field
        for (var i = 0; i < 40; i++) {
            var p = particles[i]; if (!p) continue;
            cx.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.2 * Math.sin(t + p.phase)) + ')';
            cx.fillRect(p.x, p.y, p.size * 0.5, p.size * 0.5);
        }
        for (var i = 0; i < 5; i++) {
            var ax = (t * (10 + i * 5) + i * 200) % (w + 60) - 30;
            var ay = h * 0.2 + i * h * 0.15;
            var ar = 8 + i * 3;
            cx.strokeStyle = 'rgba(170,170,170,0.15)'; cx.lineWidth = 1;
            cx.beginPath();
            for (var j = 0; j < 8; j++) {
                var ang = Math.PI * 2 * j / 8, r2 = ar * (0.7 + Math.sin(j * 3) * 0.3);
                j === 0 ? cx.moveTo(ax + r2 * Math.cos(ang), ay + r2 * Math.sin(ang)) : cx.lineTo(ax + r2 * Math.cos(ang), ay + r2 * Math.sin(ang));
            }
            cx.closePath(); cx.stroke();
        }
    }

    function drawVolley() {
        // Pong: center line, bouncing ball, paddle hints
        cx.setLineDash([4, 4]); cx.strokeStyle = 'rgba(255,255,255,0.1)'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(w / 2, 0); cx.lineTo(w / 2, h); cx.stroke(); cx.setLineDash([]);
        var bx = w / 2 + Math.sin(t * 4) * w * 0.35, by = h / 2 + Math.cos(t * 3) * h * 0.35;
        cx.fillStyle = 'rgba(255,255,255,0.25)'; cx.beginPath(); cx.arc(bx, by, 4, 0, Math.PI * 2); cx.fill();
        // paddles
        cx.fillStyle = 'rgba(0,136,204,0.15)'; cx.fillRect(8, h / 2 + Math.sin(t * 2) * h * 0.3 - 15, 6, 30);
        cx.fillStyle = 'rgba(255,68,102,0.15)'; cx.fillRect(w - 14, h / 2 + Math.cos(t * 2.5) * h * 0.3 - 15, 6, 30);
    }

    function drawRiver() {
        // Frogger: flowing water lines, log shapes, car shapes
        for (var y = 0; y < h; y += 8) {
            var wave = Math.sin(t * 3 + y * 0.1) * 3;
            cx.strokeStyle = y < h / 2 ? 'rgba(0,100,255,0.08)' : 'rgba(100,100,100,0.06)';
            cx.lineWidth = 1; cx.beginPath(); cx.moveTo(wave, y); cx.lineTo(w + wave, y); cx.stroke();
        }
        // logs
        for (var i = 0; i < 4; i++) {
            var lx = ((t * (25 + i * 10)) + i * 200) % (w + 100) - 50;
            cx.fillStyle = 'rgba(139,69,19,0.15)'; cx.fillRect(lx, 4 + i * 8, 50, 6);
        }
        // frog silhouette
        var fx = w / 2 + Math.sin(t) * 30;
        cx.fillStyle = 'rgba(0,204,68,0.2)'; cx.beginPath(); cx.arc(fx, h / 2, 6, 0, Math.PI * 2); cx.fill();
    }

    function drawDefend() {
        // Missile Command: descending missiles, explosions, city silhouette
        for (var i = 0; i < 5; i++) {
            var mx = w * 0.1 + i * w * 0.2, my = ((t * 20 + i * 60) % (h + 20)) - 10;
            cx.strokeStyle = 'rgba(255,50,80,0.2)'; cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(mx + Math.sin(i) * 10, 0); cx.lineTo(mx, my); cx.stroke();
            cx.fillStyle = 'rgba(255,50,80,0.3)'; cx.beginPath(); cx.arc(mx, my, 2, 0, Math.PI * 2); cx.fill();
        }
        // explosions
        for (var i = 0; i < 2; i++) {
            var ex2 = w * 0.3 + i * w * 0.4, ey = h * 0.4 + Math.sin(t * 2 + i * 3) * 8;
            var er = 10 + 6 * Math.sin(t * 5 + i);
            cx.fillStyle = 'rgba(255,200,50,' + (0.08 + 0.05 * Math.sin(t * 4 + i)) + ')';
            cx.beginPath(); cx.arc(ex2, ey, er, 0, Math.PI * 2); cx.fill();
        }
        // city silhouette
        cx.fillStyle = 'rgba(0,200,255,0.08)';
        for (var i = 0; i < 6; i++) cx.fillRect(w * 0.1 + i * w * 0.15, h - 10, 15, -(5 + i % 3 * 4));
    }

    function drawSky() {
        // Flappy Bird: clouds, sun glow
        cx.fillStyle = 'rgba(255,255,255,0.06)';
        for (var i = 0; i < 5; i++) {
            var clx = ((t * (8 + i * 3) + i * 200) % (w + 120)) - 60;
            cx.beginPath(); cx.ellipse(clx, 6 + i * 6, 30, 6, 0, 0, Math.PI * 2); cx.fill();
        }
        // sun
        var sr = 15 + 3 * Math.sin(t * 1.5);
        cx.fillStyle = 'rgba(255,200,50,0.08)'; cx.beginPath(); cx.arc(w * 0.8, 8, sr, 0, Math.PI * 2); cx.fill();
        // ground
        cx.fillStyle = 'rgba(100,180,100,0.1)'; cx.fillRect(0, h - 3, w, 3);
        // bird silhouette
        var birdX = w * 0.3, birdY = h / 2 + Math.sin(t * 3) * 8;
        cx.fillStyle = 'rgba(255,200,0,0.2)'; cx.beginPath(); cx.ellipse(birdX, birdY, 8, 6, 0, 0, Math.PI * 2); cx.fill();
    }

    function drawBounce() {
        // Doodle Jump: platforms, springs, doodler silhouette
        cx.strokeStyle = 'rgba(0,100,0,0.05)';
        for (var x = 0; x < w; x += 20) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
        for (var y = 0; y < h; y += 20) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); }
        // platforms
        for (var i = 0; i < 6; i++) {
            var px2 = (i * w / 6 + Math.sin(t + i * 2) * 20 + 10);
            var py2 = ((t * 15 + i * 50) % (h + 20));
            cx.fillStyle = 'rgba(68,170,68,0.15)'; cx.fillRect(px2, py2, 35, 6);
        }
        // bouncing doodler
        var dy2 = h / 2 + Math.abs(Math.sin(t * 3)) * -h * 0.25;
        cx.fillStyle = 'rgba(102,187,106,0.2)'; cx.beginPath(); cx.ellipse(w / 2, dy2, 8, 10, 0, 0, Math.PI * 2); cx.fill();
    }

    function drawBugs() {
        // Centipede: mushroom field, crawling centipede, spider
        cx.strokeStyle = 'rgba(0,255,50,0.04)'; cx.lineWidth = 0.5;
        for (var x = 0; x < w; x += 12) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
        // Mushrooms
        for (var i = 0; i < 8; i++) {
            var mx = (i * w / 8 + 15 + Math.sin(i * 7) * 10), my = 5 + (i % 3) * 9;
            cx.fillStyle = 'rgba(0,200,68,0.15)'; cx.beginPath(); cx.ellipse(mx, my, 5, 3.5, 0, Math.PI, 0); cx.fill();
            cx.fillStyle = 'rgba(200,200,180,0.1)'; cx.fillRect(mx - 1.5, my, 3, 4);
        }
        // Centipede crawling
        for (var i = 0; i < 8; i++) {
            var phase = t * 3 - i * 0.5;
            var sx = w * 0.1 + i * (w * 0.6 / 8) + Math.sin(phase) * 6;
            var sy = h * 0.45 + Math.cos(phase) * 4;
            cx.fillStyle = i === 0 ? 'rgba(0,255,136,0.25)' : 'rgba(34,221,85,0.18)';
            cx.beginPath(); cx.arc(sx, sy, i === 0 ? 5 : 4, 0, Math.PI * 2); cx.fill();
        }
        // Spider bouncing
        var spx = (t * 40) % (w + 30) - 15, spy = h * 0.75 + Math.sin(t * 6) * 5;
        cx.fillStyle = 'rgba(255,68,255,0.2)'; cx.beginPath(); cx.ellipse(spx, spy, 6, 4, 0, 0, Math.PI * 2); cx.fill();
        for (var l = 0; l < 3; l++) {
            cx.strokeStyle = 'rgba(200,50,200,0.12)'; cx.lineWidth = 0.7;
            cx.beginPath(); cx.moveTo(spx - 5, spy + l * 2); cx.lineTo(spx - 10, spy + 3 + l * 2); cx.stroke();
            cx.beginPath(); cx.moveTo(spx + 5, spy + l * 2); cx.lineTo(spx + 10, spy + 3 + l * 2); cx.stroke();
        }
    }

    var drawFns = {
        racer: drawRacer, space: drawSpace, matrix: drawMatrix, blocks: drawBlocks,
        dots: drawDots, bricks: drawBricks, rocks: drawRocks, volley: drawVolley,
        river: drawRiver, defend: drawDefend, sky: drawSky, bounce: drawBounce,
        bugs: drawBugs
    };

    function draw() {
        if (!cx) return;
        t += 0.016;
        var theme = THEMES[currentTheme] || THEMES['night-racer'];
        cx.fillStyle = theme.bg; cx.fillRect(0, 0, w, h);
        var fn = drawFns[theme.style];
        if (fn) fn();
        animId = requestAnimationFrame(draw);
    }

    window.setTitleBgTheme = function(gameId) { currentTheme = gameId || 'night-racer'; t = 0; seed(); };
    window.startTitleBgAnim = function() { init(); if (!animId) draw(); };
    window.stopTitleBgAnim = function() { if (animId) { cancelAnimationFrame(animId); animId = null; } };
})();

// ═══════════════════════════════════════════════════
// NIGHT RACER — Full game
// ═══════════════════════════════════════════════════
(function() {
    var canvas, ctx, W, H;
    var ROAD_W = 2000, SEG_LENGTH = 200, CAMERA_DEPTH = 1 / Math.tan((80/2)*Math.PI/180);
    var CAMERA_HEIGHT = 1000, DRAW_DISTANCE = 150, TOTAL_SEGMENTS = 6000, LANES = 3;
    var SKY_TOP = '#0a0a2e', SKY_BOT = '#1a0a3e';
    var COLORS = {
        ROAD: {light:'#6b6b6b',dark:'#636363'}, GRASS: {light:'#10aa10',dark:'#009a00'},
        RUMBLE: {light:'#ff2222',dark:'#ffffff'}, LANE: {light:'#cccccc',dark:'transparent'}
    };
    var segments=[], cars=[], playerX=0, speed=0, position=0, score=0, gameTime=0;
    var gameState='title', steerDir=0, trackLength=0, crashTimer=0, starField=[], titlePulse=0, speedLines=[];
    var maxSpeed, accel, braking, decel, offRoadDecel, offRoadLimit, centrifugal=0.3;
    var keyLeft=false, keyRight=false, keyUp=false, keyDown=false;
    var nightRacerAnimId = null;

    function regenerateStars() {
        starField = [];
        for (var i = 0; i < 200; i++) starField.push({ x: Math.random()*W, y: Math.random()*H*0.45, size: Math.random()*2+0.5, twinkle: Math.random()*Math.PI*2 });
    }

    function easeIn(a,b,t){return a+(b-a)*Math.pow(t,2);}
    function easeInOut(a,b,t){return a+(b-a)*((-Math.cos(t*Math.PI)/2)+0.5);}

    function addSegment(curve,y){
        var lastY=(y!=null)?y:(segments.length>0?segments[segments.length-1].p.world.y:0);
        segments.push({index:segments.length,p:{world:{y:lastY,z:segments.length*SEG_LENGTH},camera:{},screen:{}},curve:curve,clip:0});
    }
    function addRoad(enter,hold,leave,curve,y){
        var startY=segments.length===0?0:segments[segments.length-1].p.world.y, endY=startY+(y||0), n=enter+hold+leave;
        for(var i=0;i<enter;i++) addSegment(easeIn(0,curve,i/enter),easeInOut(startY,endY,i/n));
        for(var i=0;i<hold;i++) addSegment(curve,easeInOut(startY,endY,(enter+i)/n));
        for(var i=0;i<leave;i++) addSegment(easeInOut(curve,0,i/leave),easeInOut(startY,endY,(enter+hold+i)/n));
    }
    function addStraight(n){addRoad(n||25,n||25,n||25,0,0);}
    function addHill(n,h){addRoad(n||25,n||25,n||25,0,h||600);}
    function addCurve(n,c,h){addRoad(n||25,n||25,n||25,c||3,h||0);}
    function addSCurves(){addRoad(10,20,10,2,0);addRoad(10,20,10,-2,0);addRoad(10,20,10,4,300);addRoad(10,20,10,-3,-200);addRoad(10,20,10,-2,500);addRoad(10,20,10,3,-400);}

    function buildTrack(){
        segments=[];
        addStraight(50);addCurve(30,3,400);addHill(20,800);addSCurves();addStraight(30);
        addCurve(40,-4,-600);addHill(30,-500);addCurve(25,5,300);addStraight(20);addSCurves();
        addHill(20,1000);addCurve(30,-3,-800);addStraight(40);
        while(segments.length<TOTAL_SEGMENTS){addStraight(20);addCurve(15,(Math.random()-0.5)*6,(Math.random()-0.5)*800);addHill(15,(Math.random()-0.5)*1200);}
        trackLength=segments.length*SEG_LENGTH;
    }
    function resetCars(){
        cars=[];var cc=['#ff3333','#3333ff','#ffcc00','#ff6600','#00ccff','#cc33ff','#33ff66','#ff3399'];
        for(var i=0;i<40;i++) cars.push({offset:Math.random()*1.6-0.8,z:Math.floor(Math.random()*segments.length)*SEG_LENGTH,speed:maxSpeed/6+Math.random()*maxSpeed/3,color:cc[Math.floor(Math.random()*cc.length)],w:300});
    }
    function project(p,cX,cY,cZ,cD,w,h,rW){
        p.camera.x=(p.world.x||0)-cX;p.camera.y=(p.world.y||0)-cY;p.camera.z=(p.world.z||0)-cZ;
        p.screen.scale=cD/p.camera.z;
        p.screen.x=Math.round(w/2+p.screen.scale*p.camera.x*w/2);
        p.screen.y=Math.round(h/2-p.screen.scale*p.camera.y*h/2);
        p.screen.w=Math.round(p.screen.scale*rW*w/2);
    }
    function findSegment(z){return segments[Math.floor(z/SEG_LENGTH)%segments.length];}
    function overlap(x1,w1,x2,w2){return!((x1-w1*0.5)>(x2+w2*0.5)||(x1+w1*0.5)<(x2-w2*0.5));}

    function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();c.fill();}
    function lightenColor(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return'#'+((1<<24)+(Math.min(255,r+a)<<16)+(Math.min(255,g+a)<<8)+Math.min(255,b+a)).toString(16).slice(1);}
    function darkenColor(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return'#'+((1<<24)+(Math.max(0,r-a)<<16)+(Math.max(0,g-a)<<8)+Math.max(0,b-a)).toString(16).slice(1);}
    function drawPolygon(c,x1,y1,x2,y2,x3,y3,x4,y4,col){c.fillStyle=col;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.lineTo(x4,y4);c.closePath();c.fill();}

    function drawSegmentShape(width,lanes,x1,y1,w1,x2,y2,w2,colors){
        var r1=w1/Math.max(6,lanes),r2=w2/Math.max(6,lanes),l1=w1/Math.max(32,lanes*2),l2=w2/Math.max(32,lanes*2);
        ctx.fillStyle=colors.grass;ctx.fillRect(0,y2,width,y1-y2);
        drawPolygon(ctx,x1-w1-r1,y1,x1-w1,y1,x2-w2,y2,x2-w2-r2,y2,colors.rumble);
        drawPolygon(ctx,x1+w1+r1,y1,x1+w1,y1,x2+w2,y2,x2+w2+r2,y2,colors.rumble);
        drawPolygon(ctx,x1-w1,y1,x1+w1,y1,x2+w2,y2,x2-w2,y2,colors.road);
        if(colors.lane){var lw1=w1*2/lanes,lw2=w2*2/lanes,lX1=x1-w1+lw1,lX2=x2-w2+lw2;for(var ln=1;ln<lanes;ln++){drawPolygon(ctx,lX1-l1/2,y1,lX1+l1/2,y1,lX2+l2/2,y2,lX2-l2/2,y2,colors.lane);lX1+=lw1;lX2+=lw2;}}
    }
    function drawCar(c,x,y,scale,color){
        var w=70*scale,h=45*scale;if(w<2)return;
        c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(x,y,w*1.1,h*0.3,0,0,Math.PI*2);c.fill();
        var bg=c.createLinearGradient(x-w,y-h,x+w,y);bg.addColorStop(0,lightenColor(color,40));bg.addColorStop(0.5,color);bg.addColorStop(1,darkenColor(color,40));
        c.fillStyle=bg;roundRect(c,x-w/2,y-h,w,h,4*scale);
        c.fillStyle='rgba(150,200,255,0.7)';roundRect(c,x-w*0.3,y-h*0.85,w*0.6,h*0.35,2*scale);
        c.fillStyle='#ffffaa';c.shadowColor='#ffffaa';c.shadowBlur=6*scale;c.beginPath();c.arc(x-w*0.35,y-h*0.1,3*scale,0,Math.PI*2);c.fill();c.beginPath();c.arc(x+w*0.35,y-h*0.1,3*scale,0,Math.PI*2);c.fill();c.shadowBlur=0;
        c.fillStyle='#ff3333';c.shadowColor='#ff3333';c.shadowBlur=4*scale;c.beginPath();c.arc(x-w*0.38,y-h*0.95,2.5*scale,0,Math.PI*2);c.fill();c.beginPath();c.arc(x+w*0.38,y-h*0.95,2.5*scale,0,Math.PI*2);c.fill();c.shadowBlur=0;
        c.fillStyle='#111';roundRect(c,x-w*0.52,y-h*0.25,w*0.12,h*0.25,1*scale);roundRect(c,x+w*0.40,y-h*0.25,w*0.12,h*0.25,1*scale);
    }
    function drawPlayerCar(c,steer){
        var cx2=W/2,cy=H-30,bw=70,bh=45,tilt=steer*3;
        c.save();c.translate(cx2,cy);c.rotate(tilt*Math.PI/180);
        c.fillStyle='rgba(0,0,0,0.4)';c.beginPath();c.ellipse(0,10,bw*1.1,12,0,0,Math.PI*2);c.fill();
        var bg=c.createLinearGradient(-bw,-bh*2,bw,0);bg.addColorStop(0,'#ff4444');bg.addColorStop(0.3,'#ff1111');bg.addColorStop(0.7,'#cc0000');bg.addColorStop(1,'#880000');
        c.fillStyle=bg;c.beginPath();c.moveTo(-bw*0.8,0);c.lineTo(-bw*0.6,-bh*1.8);c.quadraticCurveTo(-bw*0.3,-bh*2.1,0,-bh*2.1);c.quadraticCurveTo(bw*0.3,-bh*2.1,bw*0.6,-bh*1.8);c.lineTo(bw*0.8,0);c.quadraticCurveTo(bw*0.5,5,0,5);c.quadraticCurveTo(-bw*0.5,5,-bw*0.8,0);c.closePath();c.fill();
        c.fillStyle='rgba(255,255,255,0.2)';c.beginPath();c.moveTo(-8,5);c.lineTo(-6,-bh*2);c.lineTo(6,-bh*2);c.lineTo(8,5);c.closePath();c.fill();
        var wg=c.createLinearGradient(0,-bh*1.4,0,-bh*0.8);wg.addColorStop(0,'rgba(100,180,255,0.8)');wg.addColorStop(1,'rgba(150,220,255,0.5)');
        c.fillStyle=wg;c.beginPath();c.moveTo(-bw*0.45,-bh*0.85);c.quadraticCurveTo(-bw*0.3,-bh*1.45,0,-bh*1.5);c.quadraticCurveTo(bw*0.3,-bh*1.45,bw*0.45,-bh*0.85);c.closePath();c.fill();
        c.fillStyle='#ffffcc';c.shadowColor='#ffffaa';c.shadowBlur=15;c.beginPath();c.ellipse(-bw*0.45,-bh*1.85,6,4,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(bw*0.45,-bh*1.85,6,4,0,0,Math.PI*2);c.fill();c.shadowBlur=0;
        c.fillStyle='#ff2200';c.shadowColor='#ff3300';c.shadowBlur=12;c.beginPath();c.ellipse(-bw*0.55,-3,7,4,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(bw*0.55,-3,7,4,0,0,Math.PI*2);c.fill();c.shadowBlur=0;
        c.fillStyle='#111';roundRect(c,-bw*0.78,-bh*1.5-8,10,16,3);roundRect(c,bw*0.78-10,-bh*1.5-8,10,16,3);roundRect(c,-bw*0.82,-13,10,16,3);roundRect(c,bw*0.82-10,-13,10,16,3);
        if(speed>maxSpeed*0.1){var int=Math.min(speed/maxSpeed,1);c.fillStyle='rgba(255,100,0,'+(0.3+int*0.5)+')';c.shadowColor='#ff6600';c.shadowBlur=20*int;c.beginPath();c.ellipse(-15,8,4+int*3,6+int*4,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(15,8,4+int*3,6+int*4,0,0,Math.PI*2);c.fill();c.shadowBlur=0;}
        c.restore();
    }
    function drawTree(c,x,y,scale){if(scale<0.003)return;var tw=8*scale,th=40*scale,lr=25*scale;c.fillStyle='#5c3d2e';c.fillRect(x-tw/2,y-th,tw,th);var gs=['#0d7a0d','#11aa11','#0e8e0e'];for(var i=0;i<3;i++){c.fillStyle=gs[i];c.beginPath();c.arc(x+(i-1)*lr*0.3,y-th-lr*0.5-i*lr*0.4,lr*(1-i*0.15),0,Math.PI*2);c.fill();}}

    function drawSky(){
        var g=ctx.createLinearGradient(0,0,0,H*0.5);g.addColorStop(0,SKY_TOP);g.addColorStop(1,SKY_BOT);ctx.fillStyle=g;ctx.fillRect(0,0,W,H*0.5);
        for(var i=0;i<starField.length;i++){var s=starField[i],tw=0.5+0.5*Math.sin(s.twinkle+gameTime*2+i);ctx.fillStyle='rgba(255,255,255,'+tw+')';ctx.beginPath();ctx.arc(s.x,s.y,s.size*tw,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#f5f5dc';ctx.shadowColor='#f5f5dc';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(W*0.81,H*0.1,30,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='#1a1a3a';ctx.beginPath();ctx.moveTo(0,H*0.48);for(var x=0;x<=W;x+=40){ctx.lineTo(x,H*0.42-Math.sin(x*0.008)*30-Math.sin(x*0.015+2)*20-Math.cos(x*0.003)*40);}ctx.lineTo(W,H*0.48);ctx.closePath();ctx.fill();
        ctx.fillStyle='#252545';ctx.beginPath();ctx.moveTo(0,H*0.5);for(var x=0;x<=W;x+=30){ctx.lineTo(x,H*0.46-Math.sin(x*0.012+1)*20-Math.sin(x*0.02+3)*15);}ctx.lineTo(W,H*0.5);ctx.closePath();ctx.fill();
    }
    function drawTitle(dt){
        drawSky();ctx.fillStyle='#1a5a1a';ctx.fillRect(0,H*0.48,W,H*0.52);titlePulse+=dt*3;
        ctx.save();ctx.shadowColor='#ff3300';ctx.shadowBlur=20+Math.sin(titlePulse)*10;ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.textAlign='center';ctx.fillStyle='#ff2222';ctx.fillText('NIGHT RACER',W/2,H*0.3);ctx.shadowBlur=0;
        ctx.font=Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('RETRO EDITION',W/2,H*0.38);
        var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
        ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.fillText('Arrow keys / WASD to steer & accelerate',W/2,H*0.65);ctx.fillText('Avoid traffic - Survive as long as you can!',W/2,H*0.72);
        drawPlayerCar(ctx,0);ctx.restore();
    }
    function drawGameOver(){
        ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;
        ctx.fillStyle='rgba(0,0,0,0.6)';roundRect(ctx,W*0.15,H*0.28,W*0.7,H*0.42,15);
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillText('FINAL SCORE',W/2,H*0.36);
        ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillText(Math.floor(score).toLocaleString(),W/2,H*0.46);
        ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Distance: '+(position/100).toFixed(0)+'m',W/2,H*0.55);ctx.fillText('Time: '+gameTime.toFixed(1)+'s',W/2,H*0.61);
        var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
        ctx.restore();
    }

    function update(dt){
        if(dt>0.1)dt=0.1;gameTime+=dt;
        // Difficulty progression: easy (0-20s) → medium (20-50s) → hard (50-90s)
        var diffPhase=gameTime<20?0:(gameTime<50?1:2);
        var diffMult=diffPhase===0?0.7:(diffPhase===1?1.0:1.0+Math.min((gameTime-50)/40,1)*0.5);
        var ps=findSegment(position+CAMERA_HEIGHT),sp=speed/maxSpeed;
        steerDir=0;if(keyLeft)steerDir=-1;if(keyRight)steerDir=1;
        if(crashTimer>0){crashTimer-=dt;speed=Math.max(0,speed+braking*3*dt);}
        else if(keyUp)speed=Math.min(speed+accel*dt,maxSpeed);
        else if(keyDown)speed=Math.max(speed+braking*dt,0);
        else speed=Math.max(speed+decel*dt,0);
        if(Math.abs(playerX)>1&&speed>offRoadLimit)speed=Math.max(speed+offRoadDecel*dt,offRoadLimit);
        playerX+=(steerDir*sp*dt*3);playerX+=(ps.curve*centrifugal*sp*sp*dt*diffMult);
        if(playerX<-2)playerX=-2;if(playerX>2)playerX=2;
        position+=speed*dt;if(position>=trackLength)position-=trackLength;
        score+=sp*dt*100*diffMult;
        for(var i=0;i<cars.length;i++){
            var c=cars[i];c.z+=(c.speed*diffMult)*dt;if(c.z>=trackLength)c.z-=trackLength;
            var cs=Math.floor(c.z/SEG_LENGTH)%segments.length,pSeg=Math.floor((position+CAMERA_HEIGHT)/SEG_LENGTH)%segments.length;
            var hitW=diffPhase===0?0.5:(diffPhase===1?0.6:0.65);
            if(Math.abs(cs-pSeg)<3&&overlap(playerX,hitW,c.offset,hitW)&&crashTimer<=0){crashTimer=0.5;speed*=0.2;score=Math.max(0,score-50);}
        }
        if(gameTime>90){gameState='gameover';keyLeft=keyRight=keyUp=keyDown=false;}
        // Speed lines
        var intensity=speed/maxSpeed;
        if(intensity>0.5&&Math.random()<intensity*2*dt*60)speedLines.push({x:Math.random()*W,y:H*0.5,len:20+Math.random()*40,speed:800+Math.random()*400,alpha:0.3+Math.random()*0.4});
        for(var i=speedLines.length-1;i>=0;i--){speedLines[i].y+=speedLines[i].speed*dt;speedLines[i].alpha-=dt*2;if(speedLines[i].y>H||speedLines[i].alpha<=0)speedLines.splice(i,1);}
    }
    function render(){
        ctx.clearRect(0,0,W,H);drawSky();
        var bs=findSegment(position),bi=bs.index,maxy=H,x=0,dx=-(bs.curve*(position%SEG_LENGTH)/SEG_LENGTH);
        for(var n=0;n<DRAW_DISTANCE;n++){
            var idx=(bi+n)%segments.length,seg=segments[idx],looped=(bi+n)>=segments.length,segZ=seg.index*SEG_LENGTH;if(looped)segZ+=trackLength;
            project(seg.p,playerX*ROAD_W-x,CAMERA_HEIGHT+(segments[bi%segments.length].p.world.y||0),position,CAMERA_DEPTH,W,H,ROAD_W);
            x+=dx;dx+=seg.curve;seg.clip=maxy;
            if(seg.p.camera.z<=CAMERA_DEPTH||seg.p.screen.y>=maxy)continue;maxy=seg.p.screen.y;
        }
        for(var n=DRAW_DISTANCE-1;n>0;n--){
            var idx=(bi+n)%segments.length,prevIdx=(bi+n-1)%segments.length,seg=segments[idx],prev=segments[prevIdx];
            if(seg.p.screen.y>=seg.clip)continue;
            var dark=Math.floor(idx/2)%2===0;
            drawSegmentShape(W,LANES,prev.p.screen.x,prev.p.screen.y,prev.p.screen.w,seg.p.screen.x,seg.p.screen.y,seg.p.screen.w,{road:dark?COLORS.ROAD.dark:COLORS.ROAD.light,grass:dark?COLORS.GRASS.dark:COLORS.GRASS.light,rumble:dark?COLORS.RUMBLE.dark:COLORS.RUMBLE.light,lane:dark?COLORS.LANE.dark:COLORS.LANE.light});
            if(n%4===0){var sc=seg.p.screen.scale;drawTree(ctx,seg.p.screen.x-seg.p.screen.w*1.8,seg.p.screen.y,sc*800);if(n%8===0)drawTree(ctx,seg.p.screen.x+seg.p.screen.w*1.8,seg.p.screen.y,sc*800);}
            for(var c=0;c<cars.length;c++){var car=cars[c];if(Math.floor(car.z/SEG_LENGTH)%segments.length===idx)drawCar(ctx,seg.p.screen.x+car.offset*seg.p.screen.w,seg.p.screen.y,seg.p.screen.scale*2000,car.color);}
        }
        for(var i=0;i<speedLines.length;i++){var sl=speedLines[i];ctx.strokeStyle='rgba(255,255,255,'+sl.alpha+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sl.x,sl.y);ctx.lineTo(sl.x,sl.y-sl.len);ctx.stroke();}
        if(crashTimer>0.3){ctx.fillStyle='rgba(255,0,0,'+(crashTimer-0.3)*2+')';ctx.fillRect(0,0,W,H);}
        drawPlayerCar(ctx,steerDir);
        if(speed>maxSpeed*0.8){var v=ctx.createRadialGradient(W/2,H/2,W*0.3,W/2,H/2,W*0.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.3)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);}
    }
    function updateHUD(){
        document.getElementById('hud-score').textContent=Math.floor(score).toLocaleString();
        document.getElementById('hud-speed').textContent=Math.floor(speed/maxSpeed*320);
        document.getElementById('hud-time').textContent=Math.max(0,(90-gameTime)).toFixed(1);
    }
    function startGame(){
        buildTrack();resetCars();playerX=0;speed=0;position=0;score=0;gameTime=0;crashTimer=0;speedLines=[];gameState='playing';
    }
    var lastTs=0;
    function gameLoop(ts){
        var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
        if(gameState==='title'){drawTitle(dt);titlePulse+=dt;}
        else if(gameState==='playing'){update(dt);render();updateHUD();}
        else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
        nightRacerAnimId=requestAnimationFrame(gameLoop);
    }

    function onKey(e,down){
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
        if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
        if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
        if(down&&(e.key==='Enter'||e.key===' '||e.key==='Tab')&&gameState!=='playing')startGame();
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
    }
    var nrKd=function(e){onKey(e,true);};
    var nrKu=function(e){onKey(e,false);};

    function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

    window.initNightRacer = function(){
        canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
        function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;regenerateStars();}
        window.addEventListener('resize',resize);resize();
        maxSpeed=SEG_LENGTH*60;accel=maxSpeed/4;braking=-maxSpeed;decel=-maxSpeed/5;offRoadDecel=-maxSpeed/2;offRoadLimit=maxSpeed/4;
        document.addEventListener('keydown',nrKd);
        document.addEventListener('keyup',nrKu);
        bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
        gameState='title';titlePulse=0;lastTs=performance.now();
        canvas.addEventListener('click',function(){if(gameState!=='playing')startGame();});
        nightRacerAnimId=requestAnimationFrame(gameLoop);
    };
    window.stopNightRacer = function(){
        if(nightRacerAnimId){cancelAnimationFrame(nightRacerAnimId);nightRacerAnimId=null;}
        document.removeEventListener('keydown',nrKd);
        document.removeEventListener('keyup',nrKu);
        gameState='title';speed=0;keyLeft=keyRight=keyUp=keyDown=false;
    };
})();
