(function () {
    var canvas = document.getElementById('canv');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var animId = null;
    var currentAnim = -1;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    function rand(a, b) { return Math.random() * (b - a) + a; }
    function randInt(a, b) { return Math.floor(rand(a, b)); }
    function stopCurrent() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

    // ═══════════════════════════════════════════════════════════
    // 1. MATRIX RAIN — DEFAULT
    // ═══════════════════════════════════════════════════════════
    function matrixRain() {
        var colors = ['#1a7a2e','#0055aa','#aa2200','#7722aa','#cc6600','#006688','#884400','#2a6e4e'];
        var colW = 20, cols = Math.floor(canvas.width / colW) + 1;
        var ypos = [], colCols = [];
        for (var i = 0; i < cols; i++) { ypos.push(rand(0, canvas.height)); colCols.push(colors[randInt(0, colors.length)]); }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0, 0, w, h);
            ctx.font = '14pt monospace';
            for (var i = 0; i < cols; i++) {
                ctx.globalAlpha = 0.35 + Math.random() * 0.5;
                ctx.fillStyle = colCols[i];
                ctx.fillText(String.fromCharCode(randInt(33, 126)), i * colW, ypos[i]);
                ctx.globalAlpha = 1;
                if (ypos[i] > 100 + Math.random() * 8000) { ypos[i] = 0; colCols[i] = colors[randInt(0, colors.length)]; }
                else ypos[i] += 8;
            }
            animId = requestAnimationFrame(draw);
        }
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 2. TETRIS
    // ═══════════════════════════════════════════════════════════
    function tetris() {
        var cs2, gW, gH, grid, piece, dropTimer, dropInt = 200;
        var shapes = [
            { s:[[1,1,1,1]], c:'#0097dc' }, { s:[[1,1],[1,1]], c:'#d4c800' },
            { s:[[0,1,0],[1,1,1]], c:'#8b00ab' }, { s:[[1,0,0],[1,1,1]], c:'#0033b4' },
            { s:[[0,0,1],[1,1,1]], c:'#e88a0c' }, { s:[[0,1,1],[1,1,0]], c:'#00a84f' },
            { s:[[1,1,0],[0,1,1]], c:'#e00e2c' }
        ];
        function init() {
            cs2 = Math.max(18, Math.min(32, Math.floor(canvas.width / 45)));
            gW = Math.floor(canvas.width / cs2); gH = Math.floor(canvas.height / cs2);
            grid = [];
            for (var y = 0; y < gH; y++) { grid[y] = []; for (var x = 0; x < gW; x++) grid[y][x] = 0; }
            var fillTo = Math.floor(gH * 0.65);
            for (var y2 = fillTo; y2 < gH; y2++) for (var x2 = 0; x2 < gW; x2++) {
                if (Math.random() < 0.7) grid[y2][x2] = shapes[randInt(0, shapes.length)].c;
            }
            for (var y3 = fillTo; y3 < gH; y3++) { grid[y3][randInt(0, gW)] = 0; }
            spawn(); dropTimer = Date.now();
        }
        function spawn() {
            var t = shapes[randInt(0, shapes.length)];
            piece = { shape: t.s, color: t.c, x: randInt(0, gW - t.s[0].length), y: 0 };
        }
        function fits(px, py, sh) {
            for (var r = 0; r < sh.length; r++) for (var c = 0; c < sh[r].length; c++) {
                if (!sh[r][c]) continue; var nx = px + c, ny = py + r;
                if (nx < 0 || nx >= gW || ny >= gH) return false;
                if (ny >= 0 && grid[ny][nx]) return false;
            } return true;
        }
        function lock() {
            for (var r = 0; r < piece.shape.length; r++) for (var c = 0; c < piece.shape[r].length; c++) {
                if (!piece.shape[r][c]) continue; var ny = piece.y + r;
                if (ny >= 0 && ny < gH) grid[ny][piece.x + c] = piece.color;
            }
            for (var y = gH - 1; y >= 0; y--) {
                var full = true;
                for (var x = 0; x < gW; x++) if (!grid[y][x]) { full = false; break; }
                if (full) { grid.splice(y, 1); var nr = []; for (var x2 = 0; x2 < gW; x2++) nr.push(0); grid.unshift(nr); y++; }
            }
            var topRow = gH;
            for (var y2 = 0; y2 < gH; y2++) for (var x3 = 0; x3 < gW; x3++) if (grid[y2][x3]) { topRow = y2; y2 = gH; break; }
            if (topRow < gH * 0.25) { for (var y3 = Math.floor(gH * 0.55); y3 < gH; y3++) for (var x4 = 0; x4 < gW; x4++) grid[y3][x4] = 0; }
            spawn();
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 0.5;
            for (var x = 0; x <= gW; x++) { ctx.beginPath(); ctx.moveTo(x*cs2,0); ctx.lineTo(x*cs2,gH*cs2); ctx.stroke(); }
            for (var y = 0; y <= gH; y++) { ctx.beginPath(); ctx.moveTo(0,y*cs2); ctx.lineTo(gW*cs2,y*cs2); ctx.stroke(); }
            for (var y = 0; y < gH; y++) for (var x = 0; x < gW; x++) {
                if (grid[y][x]) {
                    ctx.fillStyle = grid[y][x]; ctx.fillRect(x*cs2+1, y*cs2+1, cs2-2, cs2-2);
                    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x*cs2+1, y*cs2+1, cs2-2, 3);
                }
            }
            if (piece) for (var r = 0; r < piece.shape.length; r++) for (var c = 0; c < piece.shape[r].length; c++) {
                if (!piece.shape[r][c]) continue;
                var dx = (piece.x+c)*cs2, dy = (piece.y+r)*cs2;
                ctx.fillStyle = piece.color; ctx.fillRect(dx+1,dy+1,cs2-2,cs2-2);
                ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(dx+1,dy+1,cs2-2,3);
            }
            if (Date.now() - dropTimer > dropInt) { dropTimer = Date.now(); if (fits(piece.x, piece.y+1, piece.shape)) piece.y++; else lock(); }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 3. SNAKE — 3 AI snakes, 10 foods, walls, particles
    // ═══════════════════════════════════════════════════════════
    function snake() {
        var cs2, gW, gH, snakes, foods, walls, particles, moveTimer, moveInt = 55;
        var snakeThemes = [
            ['#2d8a4e','#3a9a5e','#4aaa6e'],
            ['#1a7a9e','#2a8aae','#3a9abe'],
            ['#cc7a00','#dd8a10','#ee9a20'],
            ['#aa2266','#bb3376','#cc4486']
        ];
        var fruitColors = ['#cc2222','#dd6600','#cc22aa','#22aa66','#2266cc','#ddaa00','#00aaaa','#aa4400'];
        var NUM_FOODS = 10, NUM_SNAKES = 3;
        function init() {
            cs2 = Math.max(10, Math.min(18, Math.floor(canvas.width / 90)));
            gW = Math.floor(canvas.width / cs2); gH = Math.floor(canvas.height / cs2);
            snakes = [];
            for (var si = 0; si < NUM_SNAKES; si++) {
                var cx = randInt(Math.floor(gW*0.2), Math.floor(gW*0.8));
                var cy = randInt(Math.floor(gH*0.2), Math.floor(gH*0.8));
                var body = [];
                for (var i = 0; i < 35 + si*5; i++) body.push({x: cx - i, y: cy});
                snakes.push({body: body, dir: {x:1,y:0}, colors: snakeThemes[si], alive: true});
            }
            foods = []; for (var f = 0; f < NUM_FOODS; f++) placeFood();
            walls = [];
            var numWalls = Math.floor((gW * gH) * 0.015);
            for (var wi = 0; wi < numWalls; wi++) walls.push({x: randInt(2, gW - 2), y: randInt(2, gH - 2)});
            // Add some wall clusters (L-shapes, lines)
            for (var ci = 0; ci < 6; ci++) {
                var wx = randInt(5, gW-5), wy = randInt(5, gH-5), len = randInt(3,7);
                var horiz = Math.random() < 0.5;
                for (var wl = 0; wl < len; wl++) walls.push({x: wx + (horiz ? wl : 0), y: wy + (horiz ? 0 : wl)});
            }
            particles = []; moveTimer = Date.now();
        }
        function placeFood() {
            for (var att = 0; att < 300; att++) {
                var f = {x:randInt(1,gW-1), y:randInt(1,gH-1), color: fruitColors[randInt(0,fruitColors.length)], pulse: rand(0,Math.PI*2)};
                var ok = true;
                for (var si = 0; si < snakes.length && ok; si++) for (var i = 0; i < snakes[si].body.length; i++) if (snakes[si].body[i].x===f.x && snakes[si].body[i].y===f.y) { ok=false; break; }
                for (var j = 0; j < foods.length && ok; j++) if (foods[j].x===f.x && foods[j].y===f.y) { ok=false; break; }
                if (ok) { foods.push(f); return; }
            }
        }
        function isWall(x, y) { for (var i = 0; i < walls.length; i++) if (walls[i].x === x && walls[i].y === y) return true; return false; }
        function isSnakeBody(x, y, skipIdx) {
            for (var si = 0; si < snakes.length; si++) { if (si === skipIdx) continue; for (var i = 0; i < snakes[si].body.length; i++) if (snakes[si].body[i].x===x && snakes[si].body[i].y===y) return true; }
            return false;
        }
        function aiFor(sn, idx) {
            var h = sn.body[0], bestDist = 99999, target = foods[0];
            for (var fi = 0; fi < foods.length; fi++) { var d = Math.abs(foods[fi].x - h.x) + Math.abs(foods[fi].y - h.y); if (d < bestDist) { bestDist = d; target = foods[fi]; } }
            var dx = target.x-h.x, dy = target.y-h.y, opts = [];
            if (dx>0 && sn.dir.x!==-1) opts.push({x:1,y:0}); if (dx<0 && sn.dir.x!==1) opts.push({x:-1,y:0});
            if (dy>0 && sn.dir.y!==-1) opts.push({x:0,y:1}); if (dy<0 && sn.dir.y!==1) opts.push({x:0,y:-1});
            if (!opts.length) { [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].forEach(function(d2){ if(d2.x!==-sn.dir.x||d2.y!==-sn.dir.y) opts.push(d2); }); }
            var safe = opts.filter(function(d2){ var nx=h.x+d2.x, ny=h.y+d2.y; if(nx<0||nx>=gW||ny<0||ny>=gH) return false; if(isWall(nx,ny)) return false; for(var i=0;i<sn.body.length-1;i++) if(sn.body[i].x===nx&&sn.body[i].y===ny) return false; if(isSnakeBody(nx,ny,idx)) return false; return true; });
            sn.dir = safe.length ? safe[0] : (opts.length ? opts[0] : sn.dir);
        }
        function draw() {
            var w = canvas.width, h2 = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h2);
            ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5;
            for (var x = 0; x <= gW; x++) { ctx.beginPath(); ctx.moveTo(x*cs2,0); ctx.lineTo(x*cs2,gH*cs2); ctx.stroke(); }
            for (var y = 0; y <= gH; y++) { ctx.beginPath(); ctx.moveTo(0,y*cs2); ctx.lineTo(gW*cs2,y*cs2); ctx.stroke(); }
            for (var wi = 0; wi < walls.length; wi++) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(walls[wi].x*cs2, walls[wi].y*cs2, cs2, cs2); }
            // Particles
            for (var pi = particles.length - 1; pi >= 0; pi--) {
                particles[pi].life -= 0.03; if (particles[pi].life <= 0) { particles.splice(pi, 1); continue; }
                var pp = particles[pi]; ctx.fillStyle = pp.color; ctx.globalAlpha = pp.life;
                ctx.beginPath(); ctx.arc(pp.x*cs2+cs2/2+pp.ox, pp.y*cs2+cs2/2+pp.oy, cs2*0.2*pp.life, 0, Math.PI*2); ctx.fill();
                pp.ox += pp.vx; pp.oy += pp.vy;
            }
            ctx.globalAlpha = 1;
            // Draw all snakes
            for (var si = 0; si < snakes.length; si++) {
                var sn = snakes[si];
                for (var i = 0; i < sn.body.length; i++) {
                    var s = sn.body[i]; ctx.fillStyle = sn.colors[i % sn.colors.length];
                    ctx.fillRect(s.x*cs2+1, s.y*cs2+1, cs2-2, cs2-2);
                    if (i===0) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(s.x*cs2+cs2*0.35, s.y*cs2+cs2*0.35, cs2*0.15, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(s.x*cs2+cs2*0.65, s.y*cs2+cs2*0.35, cs2*0.15, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(s.x*cs2+cs2*0.35, s.y*cs2+cs2*0.35, cs2*0.07, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(s.x*cs2+cs2*0.65, s.y*cs2+cs2*0.35, cs2*0.07, 0, Math.PI*2); ctx.fill(); }
                }
            }
            // Draw foods with pulse
            var now = Date.now() * 0.003;
            for (var fi = 0; fi < foods.length; fi++) {
                var fd = foods[fi], pulse = 1 + Math.sin(now + fd.pulse) * 0.15;
                ctx.fillStyle = fd.color;
                ctx.beginPath(); ctx.arc(fd.x*cs2+cs2/2, fd.y*cs2+cs2/2, (cs2/2-2)*pulse, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath(); ctx.arc(fd.x*cs2+cs2/2-2, fd.y*cs2+cs2/2-2, cs2/5, 0, Math.PI*2); ctx.fill();
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, gW*cs2, gH*cs2);
            if (Date.now() - moveTimer > moveInt) {
                moveTimer = Date.now();
                for (var si2 = 0; si2 < snakes.length; si2++) {
                    var sn2 = snakes[si2]; aiFor(sn2, si2);
                    var nh = {x:sn2.body[0].x+sn2.dir.x, y:sn2.body[0].y+sn2.dir.y};
                    if (nh.x<0||nh.x>=gW||nh.y<0||nh.y>=gH||isWall(nh.x,nh.y)) { var cx=randInt(Math.floor(gW*0.2),Math.floor(gW*0.8)),cy=randInt(Math.floor(gH*0.2),Math.floor(gH*0.8)); sn2.body=[]; for(var ri=0;ri<35;ri++) sn2.body.push({x:cx-ri,y:cy}); sn2.dir={x:1,y:0}; continue; }
                    var hit=false; for(var j=0;j<sn2.body.length;j++) if(sn2.body[j].x===nh.x&&sn2.body[j].y===nh.y){hit=true;break;}
                    if(!hit) hit=isSnakeBody(nh.x,nh.y,si2);
                    if(hit){var cx2=randInt(Math.floor(gW*0.2),Math.floor(gW*0.8)),cy2=randInt(Math.floor(gH*0.2),Math.floor(gH*0.8));sn2.body=[];for(var ri2=0;ri2<35;ri2++) sn2.body.push({x:cx2-ri2,y:cy2});sn2.dir={x:1,y:0};continue;}
                    sn2.body.unshift(nh);
                    var ate=false;
                    for(var fi2=0;fi2<foods.length;fi2++){if(nh.x===foods[fi2].x&&nh.y===foods[fi2].y){for(var pk=0;pk<5;pk++) particles.push({x:nh.x,y:nh.y,ox:0,oy:0,vx:rand(-2,2),vy:rand(-2,2),life:1,color:foods[fi2].color}); foods.splice(fi2,1);placeFood();ate=true;break;}}
                    if(!ate) sn2.body.pop();
                    if(sn2.body.length>gW*gH*0.12){var cx3=randInt(Math.floor(gW*0.2),Math.floor(gW*0.8)),cy3=randInt(Math.floor(gH*0.2),Math.floor(gH*0.8));sn2.body=[];for(var ri3=0;ri3<35;ri3++) sn2.body.push({x:cx3-ri3,y:cy3});sn2.dir={x:1,y:0};}
                }
            }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 4. PONG — 4-paddle, 5-ball
    // ═══════════════════════════════════════════════════════════
    function pong() {
        var balls, paddles, padW, padH, sparks, scores, NUM_BALLS = 5;
        var padColors = ['#0077aa','#cc3333','#229944','#cc7700'];
        var ballColors = ['#333','#0066bb','#cc2244','#dd7700','#aa44aa'];
        function makeBall(w, h) {
            var angle = rand(0, Math.PI*2), spd = rand(2.5, 4.5);
            return {x:rand(w*0.2,w*0.8), y:rand(h*0.2,h*0.8), vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd, trail:[], color:ballColors[randInt(0,ballColors.length)], r:rand(5,9)};
        }
        function init() {
            var w = canvas.width, h = canvas.height;
            padW = 16; padH = h * 0.14; balls = [];
            for (var i = 0; i < NUM_BALLS; i++) balls.push(makeBall(w, h));
            paddles = [{side:'left',pos:h/2,len:padH,color:padColors[0]},{side:'right',pos:h/2,len:padH,color:padColors[1]},{side:'top',pos:w/2,len:w*0.14,color:padColors[2]},{side:'bottom',pos:w/2,len:w*0.14,color:padColors[3]}];
            sparks = []; scores = [0,0,0,0];
        }
        function spawnHit(x, y, color) { for (var i = 0; i < 8; i++) { var a = rand(0,Math.PI*2); sparks.push({x:x,y:y,vx:Math.cos(a)*rand(1,4),vy:Math.sin(a)*rand(1,4),life:1,color:color,size:rand(2,5)}); } }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 2; ctx.setLineDash([8,8]);
            ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
            ctx.setLineDash([]); ctx.beginPath(); ctx.arc(w/2,h/2,60,0,Math.PI*2); ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
            ctx.fillText(scores[0], 50, h/2+12); ctx.fillText(scores[1], w-50, h/2+12); ctx.fillText(scores[2], w/2, 45); ctx.fillText(scores[3], w/2, h-20);
            for (var si = sparks.length-1; si >= 0; si--) { var sp = sparks[si]; sp.x+=sp.vx; sp.y+=sp.vy; sp.life-=0.04; if(sp.life<=0){sparks.splice(si,1);continue;} ctx.globalAlpha=sp.life; ctx.fillStyle=sp.color; ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.size*sp.life,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
            for (var pi=0;pi<paddles.length;pi++){var pad=paddles[pi],bestBall=balls[0],bestDist=99999;for(var bi2=0;bi2<balls.length;bi2++){var bl=balls[bi2],dist=99998;if(pad.side==='left'&&bl.vx<0)dist=bl.x;else if(pad.side==='right'&&bl.vx>0)dist=w-bl.x;else if(pad.side==='top'&&bl.vy<0)dist=bl.y;else if(pad.side==='bottom'&&bl.vy>0)dist=h-bl.y;if(dist<bestDist){bestDist=dist;bestBall=bl;}}var target=(pad.side==='left'||pad.side==='right')?bestBall.y:bestBall.x;pad.pos+=(target-pad.pos)*0.07+rand(-2,2);if(pad.side==='left'||pad.side==='right')pad.pos=Math.max(pad.len/2,Math.min(h-pad.len/2,pad.pos));else pad.pos=Math.max(pad.len/2,Math.min(w-pad.len/2,pad.pos));}
            for (var pd=0;pd<paddles.length;pd++){var p=paddles[pd];ctx.fillStyle=p.color;if(p.side==='left')ctx.fillRect(18,p.pos-p.len/2,padW,p.len);else if(p.side==='right')ctx.fillRect(w-18-padW,p.pos-p.len/2,padW,p.len);else if(p.side==='top')ctx.fillRect(p.pos-p.len/2,18,p.len,padW);else ctx.fillRect(p.pos-p.len/2,h-18-padW,p.len,padW);}
            for (var b=0;b<balls.length;b++){var ball=balls[b];for(var ti=0;ti<ball.trail.length;ti++){ctx.fillStyle=ball.color;ctx.globalAlpha=(ti/ball.trail.length)*0.3;ctx.beginPath();ctx.arc(ball.trail[ti].x,ball.trail[ti].y,ball.r*(ti/ball.trail.length),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.fillStyle=ball.color;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ball.trail.push({x:ball.x,y:ball.y});if(ball.trail.length>20)ball.trail.shift();ball.x+=ball.vx;ball.y+=ball.vy;var lp=paddles[0];if(ball.x<=18+padW+ball.r&&ball.vx<0&&ball.y>=lp.pos-lp.len/2&&ball.y<=lp.pos+lp.len/2){ball.vx=Math.abs(ball.vx)*1.01;ball.vy+=(ball.y-lp.pos)*0.08;ball.x=18+padW+ball.r+1;spawnHit(ball.x,ball.y,lp.color);}var rp=paddles[1];if(ball.x>=w-18-padW-ball.r&&ball.vx>0&&ball.y>=rp.pos-rp.len/2&&ball.y<=rp.pos+rp.len/2){ball.vx=-Math.abs(ball.vx)*1.01;ball.vy+=(ball.y-rp.pos)*0.08;ball.x=w-18-padW-ball.r-1;spawnHit(ball.x,ball.y,rp.color);}var tp=paddles[2];if(ball.y<=18+padW+ball.r&&ball.vy<0&&ball.x>=tp.pos-tp.len/2&&ball.x<=tp.pos+tp.len/2){ball.vy=Math.abs(ball.vy)*1.01;ball.vx+=(ball.x-tp.pos)*0.08;ball.y=18+padW+ball.r+1;spawnHit(ball.x,ball.y,tp.color);}var bp=paddles[3];if(ball.y>=h-18-padW-ball.r&&ball.vy>0&&ball.x>=bp.pos-bp.len/2&&ball.x<=bp.pos+bp.len/2){ball.vy=-Math.abs(ball.vy)*1.01;ball.vx+=(ball.x-bp.pos)*0.08;ball.y=h-18-padW-ball.r-1;spawnHit(ball.x,ball.y,bp.color);}if(ball.x<-30){scores[1]++;var nb=makeBall(w,h);ball.x=nb.x;ball.y=nb.y;ball.vx=nb.vx;ball.vy=nb.vy;ball.trail=[];}if(ball.x>w+30){scores[0]++;var nb2=makeBall(w,h);ball.x=nb2.x;ball.y=nb2.y;ball.vx=nb2.vx;ball.vy=nb2.vy;ball.trail=[];}if(ball.y<-30){scores[3]++;var nb3=makeBall(w,h);ball.x=nb3.x;ball.y=nb3.y;ball.vx=nb3.vx;ball.vy=nb3.vy;ball.trail=[];}if(ball.y>h+30){scores[2]++;var nb4=makeBall(w,h);ball.x=nb4.x;ball.y=nb4.y;ball.vx=nb4.vx;ball.vy=nb4.vy;ball.trail=[];}if(Math.abs(ball.vx)>10)ball.vx=10*(ball.vx>0?1:-1);if(Math.abs(ball.vy)>10)ball.vy=10*(ball.vy>0?1:-1);}
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 5. MISSILE COMMAND — FIXED
    // ═══════════════════════════════════════════════════════════
    function missileCommand() {
        var cities, bases, missiles, defenses, explosions, spawnTimer, groundY;
        var missileColors = ['#cc2244','#dd7700','#cc5588','#aa44aa','#0066bb'];
        function init() {
            var w = canvas.width, h = canvas.height;
            groundY = h - 60;
            cities = []; bases = []; missiles = []; defenses = []; explosions = [];
            var citySpacing = w / 10;
            for (var i = 1; i <= 9; i++) {
                if (i === 1 || i === 5 || i === 9) { bases.push({x: i * citySpacing, ammo: 15}); }
                else { cities.push({x: i * citySpacing, alive: true}); }
            }
            spawnTimer = Date.now();
            for (var m = 0; m < 8; m++) spawnMissile(w);
        }
        function spawnMissile(w) {
            var targets = [];
            for (var c = 0; c < cities.length; c++) if (cities[c].alive) targets.push(cities[c].x);
            for (var b = 0; b < bases.length; b++) if (bases[b].ammo > 0) targets.push(bases[b].x);
            var tx = targets.length ? targets[randInt(0, targets.length)] : rand(40, w - 40);
            var sx = rand(20, w - 20), sy = -rand(0, 50);
            var angle = Math.atan2(groundY - sy, tx - sx), speed = rand(0.4, 1.2);
            missiles.push({sx:sx,sy:sy,x:sx,y:sy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color:missileColors[randInt(0,missileColors.length)],alive:true});
        }
        function launchDefense(targetM) {
            var bestBase = null, bestDist = 99999;
            for (var b = 0; b < bases.length; b++) { if (bases[b].ammo <= 0) continue; var d = Math.abs(bases[b].x - targetM.x); if (d < bestDist) { bestDist = d; bestBase = bases[b]; } }
            if (!bestBase) return; bestBase.ammo--;
            var angle = Math.atan2(targetM.y - groundY, targetM.x - bestBase.x), speed = 5;
            defenses.push({sx:bestBase.x,sy:groundY-15,x:bestBase.x,y:groundY-15,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,tx:targetM.x,ty:targetM.y,alive:true});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#c8b888'; ctx.fillRect(0, groundY, w, h - groundY);
            ctx.fillStyle = '#b8a878'; ctx.fillRect(0, groundY, w, 4);
            for (var c = 0; c < cities.length; c++) {
                var ci = cities[c];
                if (!ci.alive) { ctx.fillStyle = '#999'; ctx.fillRect(ci.x-15, groundY-5, 30, 5); continue; }
                ctx.fillStyle = '#556'; ctx.fillRect(ci.x-12, groundY-28, 10, 28);
                ctx.fillStyle = '#667'; ctx.fillRect(ci.x-4, groundY-38, 12, 38);
                ctx.fillStyle = '#445'; ctx.fillRect(ci.x+6, groundY-22, 8, 22);
                ctx.fillStyle = '#ccaa00';
                for (var wy = groundY - 34; wy < groundY - 5; wy += 7) { ctx.fillRect(ci.x-1, wy, 3, 3); ctx.fillRect(ci.x+5, wy, 3, 3); }
            }
            for (var b = 0; b < bases.length; b++) {
                var ba = bases[b]; ctx.fillStyle = ba.ammo > 0 ? '#229944' : '#999';
                ctx.beginPath(); ctx.moveTo(ba.x, groundY-20); ctx.lineTo(ba.x-18, groundY); ctx.lineTo(ba.x+18, groundY); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#cc6600'; var ammoShow = Math.min(ba.ammo, 10);
                for (var ai = 0; ai < ammoShow; ai++) { ctx.beginPath(); ctx.arc(ba.x-10+(ai%5)*5, groundY-8-Math.floor(ai/5)*5, 2, 0, Math.PI*2); ctx.fill(); }
            }
            for (var mi = missiles.length-1; mi >= 0; mi--) {
                var ms = missiles[mi]; if (!ms.alive) continue;
                ctx.strokeStyle = ms.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ms.sx, ms.sy); ctx.lineTo(ms.x, ms.y); ctx.stroke();
                ctx.fillStyle = ms.color; ctx.beginPath(); ctx.arc(ms.x, ms.y, 3, 0, Math.PI*2); ctx.fill();
                ms.x += ms.vx; ms.y += ms.vy;
                if (ms.y >= groundY) { ms.alive = false; explosions.push({x:ms.x,y:groundY,r:0,maxR:rand(30,55),growing:true,color:ms.color}); for (var cd=0;cd<cities.length;cd++) if(cities[cd].alive&&Math.abs(cities[cd].x-ms.x)<25) cities[cd].alive=false; }
            }
            for (var mi2=0;mi2<missiles.length;mi2++){var ms2=missiles[mi2];if(!ms2.alive||ms2.y<50)continue;if(ms2.y>groundY*0.3&&Math.random()<0.02)launchDefense(ms2);}
            for (var di=defenses.length-1;di>=0;di--){var df=defenses[di];if(!df.alive)continue;ctx.strokeStyle='#229944';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(df.sx,df.sy);ctx.lineTo(df.x,df.y);ctx.stroke();ctx.fillStyle='#44cc66';ctx.beginPath();ctx.arc(df.x,df.y,2.5,0,Math.PI*2);ctx.fill();df.x+=df.vx;df.y+=df.vy;if(Math.abs(df.x-df.tx)<15&&Math.abs(df.y-df.ty)<15){df.alive=false;explosions.push({x:df.x,y:df.y,r:0,maxR:rand(25,45),growing:true,color:'#44cc66'});}if(df.y<-20||df.x<-20||df.x>w+20)df.alive=false;}
            for (var ei=explosions.length-1;ei>=0;ei--){var ex=explosions[ei];if(ex.growing){ex.r+=1.2;if(ex.r>=ex.maxR)ex.growing=false;}else{ex.r-=0.6;if(ex.r<=0){explosions.splice(ei,1);continue;}}ctx.globalAlpha=Math.min(1,ex.r/10);ctx.fillStyle=ex.color;ctx.beginPath();ctx.arc(ex.x,ex.y,ex.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex.x,ex.y,ex.r*0.4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;for(var mi3=missiles.length-1;mi3>=0;mi3--)if(missiles[mi3].alive&&Math.hypot(missiles[mi3].x-ex.x,missiles[mi3].y-ex.y)<ex.r)missiles[mi3].alive=false;}
            if(Date.now()-spawnTimer>600){spawnTimer=Date.now();var activeM=0;for(var mc=0;mc<missiles.length;mc++)if(missiles[mc].alive)activeM++;if(activeM<15){var toSpawn=randInt(1,4);for(var ns=0;ns<toSpawn;ns++)spawnMissile(w);}}
            for(var br=0;br<bases.length;br++)if(bases[br].ammo<3)bases[br].ammo+=2;
            var anyCity=false;for(var ac=0;ac<cities.length;ac++)if(cities[ac].alive){anyCity=true;break;}
            if(!anyCity) init();
            for(var cl=missiles.length-1;cl>=0;cl--)if(!missiles[cl].alive&&missiles[cl].y>groundY+10)missiles.splice(cl,1);
            for(var cl2=defenses.length-1;cl2>=0;cl2--)if(!defenses[cl2].alive)defenses.splice(cl2,1);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 6. SPACE INVADERS
    // ═══════════════════════════════════════════════════════════
    function spaceInvaders() {
        var invaders, ship, bullets, iBullets, iDir, iSpeed, shootTimer;
        var invColors = ['#229944','#0066bb','#cc5588','#ccaa00','#dd7700'];
        function init() {
            var w = canvas.width, cols = Math.floor(w/48), rows = Math.max(3, Math.floor(canvas.height*0.28/32));
            var startX = (w-cols*42)/2; invaders = [];
            for (var r=0;r<rows;r++) for (var c=0;c<cols;c++) invaders.push({x:startX+c*42,y:35+r*32,alive:true,color:invColors[r%invColors.length],w:28,h:18});
            ship={x:w/2,w:28}; bullets=[]; iBullets=[]; iDir=1; iSpeed=0.5; shootTimer=Date.now();
        }
        function draw() {
            var w=canvas.width, h=canvas.height;
            ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
            ctx.fillStyle='#2a6e4e'; ctx.fillRect(ship.x-ship.w/2,h-48,ship.w,14); ctx.fillRect(ship.x-4,h-56,8,10);
            var anyAlive=false,leftmost=w,rightmost=0,lowest=0;
            for(var i=0;i<invaders.length;i++){var inv=invaders[i];if(!inv.alive)continue;anyAlive=true;if(inv.x<leftmost)leftmost=inv.x;if(inv.x+inv.w>rightmost)rightmost=inv.x+inv.w;if(inv.y>lowest)lowest=inv.y;ctx.fillStyle=inv.color;ctx.fillRect(inv.x+3,inv.y,inv.w-6,inv.h);ctx.fillRect(inv.x,inv.y+3,inv.w,inv.h-6);ctx.fillRect(inv.x+2,inv.y+inv.h,4,3);ctx.fillRect(inv.x+inv.w-6,inv.y+inv.h,4,3);}
            if(!anyAlive||lowest>h-90) init();
            for(var i2=0;i2<invaders.length;i2++)if(invaders[i2].alive)invaders[i2].x+=iDir*iSpeed;
            if(rightmost+iDir*iSpeed>w-8||leftmost+iDir*iSpeed<8){iDir*=-1;for(var i3=0;i3<invaders.length;i3++)if(invaders[i3].alive)invaders[i3].y+=10;}
            var nearX=w/2;for(var i4=0;i4<invaders.length;i4++)if(invaders[i4].alive){nearX=invaders[i4].x+invaders[i4].w/2;break;}
            ship.x+=(nearX-ship.x)*0.04;
            if(Date.now()-shootTimer>350){shootTimer=Date.now();bullets.push({x:ship.x,y:h-58});}
            for(var b=bullets.length-1;b>=0;b--){bullets[b].y-=7;ctx.fillStyle='#cc6600';ctx.fillRect(bullets[b].x-1.5,bullets[b].y,3,10);if(bullets[b].y<-10){bullets.splice(b,1);continue;}for(var inv2=0;inv2<invaders.length;inv2++){var iv=invaders[inv2];if(!iv.alive)continue;if(bullets[b]&&bullets[b].x>=iv.x&&bullets[b].x<=iv.x+iv.w&&bullets[b].y>=iv.y&&bullets[b].y<=iv.y+iv.h){iv.alive=false;bullets.splice(b,1);break;}}}
            if(Math.random()<0.012){var sh2=invaders.filter(function(v){return v.alive;});if(sh2.length){var s=sh2[randInt(0,sh2.length)];iBullets.push({x:s.x+s.w/2,y:s.y+s.h});}}
            for(var ib=iBullets.length-1;ib>=0;ib--){iBullets[ib].y+=3.5;ctx.fillStyle='#cc2244';ctx.fillRect(iBullets[ib].x-1.5,iBullets[ib].y,3,8);if(iBullets[ib].y>h+10)iBullets.splice(ib,1);}
            animId=requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 7. FROGGER
    // ═══════════════════════════════════════════════════════════
    function frogger() {
        var laneH, numLanes, lanes, frog, moveTimer, moveInt = 180;
        var carColors = ['#cc2244','#0066bb','#dd7700','#aa44aa','#229944','#cc5588','#008888'];
        function init() {
            var w = canvas.width, h = canvas.height;
            numLanes = Math.max(9, Math.floor(h / 55)); laneH = h / numLanes; lanes = [];
            for (var i = 0; i < numLanes; i++) {
                var lType; if (i===0||i===numLanes-1) lType='safe'; else if (i===Math.floor(numLanes/2)) lType='safe'; else if (i<Math.floor(numLanes/2)) lType='water'; else lType='road';
                var speed = rand(0.5, 2.5)*(Math.random()<0.5?1:-1), objW, count;
                if (lType==='road'){objW=rand(40,80);count=Math.max(4,Math.floor(w/(objW+rand(80,180))));}else if(lType==='water'){objW=rand(60,130);count=Math.max(3,Math.floor(w/(objW+rand(60,120))));}else{objW=0;count=0;}
                var objs = []; for (var j=0;j<count;j++) objs.push({x:j*(w/count)+rand(-20,20),w:objW,color:carColors[randInt(0,carColors.length)]});
                lanes.push({type:lType,speed:speed,objs:objs,y:i*laneH});
            }
            frog = {lane:numLanes-1, px:Math.floor(w/2)}; frog.py = frog.lane*laneH+laneH/2; moveTimer = Date.now();
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            for (var i = 0; i < numLanes; i++) {
                var lane = lanes[i], ly = lane.y;
                if (lane.type==='safe'){ctx.fillStyle='#88bb55';ctx.fillRect(0,ly,w,laneH);}
                else if (lane.type==='water'){ctx.fillStyle='#aad4e6';ctx.fillRect(0,ly,w,laneH);}
                else {ctx.fillStyle='#ddd';ctx.fillRect(0,ly,w,laneH);ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;ctx.setLineDash([12,8]);ctx.beginPath();ctx.moveTo(0,ly+laneH/2);ctx.lineTo(w,ly+laneH/2);ctx.stroke();ctx.setLineDash([]);}
                for (var j = 0; j < lane.objs.length; j++) {
                    var obj = lane.objs[j]; obj.x += lane.speed;
                    if (lane.speed>0&&obj.x>w+20) obj.x=-obj.w-20; if (lane.speed<0&&obj.x+obj.w<-20) obj.x=w+20;
                    if (lane.type==='road'){ctx.fillStyle=obj.color;ctx.fillRect(obj.x,ly+4,obj.w,laneH-8);ctx.fillStyle='rgba(255,255,255,0.4)';if(lane.speed>0)ctx.fillRect(obj.x+obj.w-12,ly+7,9,laneH-14);else ctx.fillRect(obj.x+3,ly+7,9,laneH-14);ctx.fillStyle='#222';ctx.fillRect(obj.x+5,ly+1,8,4);ctx.fillRect(obj.x+obj.w-13,ly+1,8,4);ctx.fillRect(obj.x+5,ly+laneH-5,8,4);ctx.fillRect(obj.x+obj.w-13,ly+laneH-5,8,4);}
                    else if (lane.type==='water'){ctx.fillStyle='#8B5E3C';ctx.fillRect(obj.x,ly+6,obj.w,laneH-12);ctx.fillStyle='#7a5230';ctx.beginPath();ctx.arc(obj.x+4,ly+laneH/2,(laneH-12)/2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(obj.x+obj.w-4,ly+laneH/2,(laneH-12)/2,0,Math.PI*2);ctx.fill();}
                }
            }
            if (Date.now()-moveTimer>moveInt) {
                moveTimer = Date.now();
                if (frog.lane > 0) {
                    var nextLane = lanes[frog.lane-1], safe = true;
                    if (nextLane.type==='road') for (var ci=0;ci<nextLane.objs.length;ci++){var car=nextLane.objs[ci];if(Math.abs(car.x+car.w/2-frog.px)<car.w/2+laneH/2+20){safe=false;break;}}
                    if (safe) frog.lane--; else { frog.px+=(Math.random()<0.5?1:-1)*laneH; frog.px=Math.max(laneH/2,Math.min(w-laneH/2,frog.px)); }
                } else { frog.lane=numLanes-1; frog.px=rand(laneH,w-laneH); }
                frog.py = frog.lane*laneH+laneH/2;
                if (lanes[frog.lane].type==='water'){var onLog=false;for(var li=0;li<lanes[frog.lane].objs.length;li++){var log=lanes[frog.lane].objs[li];if(frog.px>=log.x&&frog.px<=log.x+log.w){onLog=true;frog.px+=lanes[frog.lane].speed;break;}}if(!onLog){frog.lane=numLanes-1;frog.px=rand(laneH,w-laneH);frog.py=frog.lane*laneH+laneH/2;}}
            }
            var fr = laneH/2-4; ctx.fillStyle='#2d8a2e'; ctx.beginPath(); ctx.arc(frog.px,frog.py,fr,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(frog.px-fr*0.35,frog.py-fr*0.3,fr*0.25,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(frog.px+fr*0.35,frog.py-fr*0.3,fr*0.25,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(frog.px-fr*0.35,frog.py-fr*0.3,fr*0.12,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(frog.px+fr*0.35,frog.py-fr*0.3,fr*0.12,0,Math.PI*2); ctx.fill();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 8. PAC-MAN
    // ═══════════════════════════════════════════════════════════
    function pacman() {
        var cs2, gW, gH, dots, pac, ghosts, moveTimer, moveInt = 85, mouthOpen = 0, mouthDir = 1;
        var ghostColors = ['#cc2244','#0097dc','#cc5588','#dd7700'];
        function init() {
            cs2 = Math.max(14, Math.min(24, Math.floor(canvas.width/60)));
            gW = Math.floor(canvas.width/cs2); gH = Math.floor(canvas.height/cs2); dots = [];
            for(var y=0;y<gH;y++){dots[y]=[];for(var x=0;x<gW;x++) dots[y][x]=1;}
            pac = {x:Math.floor(gW/2),y:Math.floor(gH/2),dir:0}; ghosts = [];
            for(var g=0;g<4;g++) ghosts.push({x:randInt(2,gW-2),y:randInt(2,gH-2),dir:randInt(0,4),color:ghostColors[g]});
            moveTimer = Date.now();
        }
        var dirs = [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
        function draw() {
            var w=canvas.width,h=canvas.height; ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
            for(var y=0;y<gH;y++) for(var x=0;x<gW;x++){if(dots[y][x]){ctx.fillStyle='#ccaa00';ctx.beginPath();ctx.arc(x*cs2+cs2/2,y*cs2+cs2/2,2.5,0,Math.PI*2);ctx.fill();}}
            mouthOpen+=mouthDir*0.15;if(mouthOpen>0.8||mouthOpen<0.05)mouthDir*=-1;
            var px=pac.x*cs2+cs2/2,py=pac.y*cs2+cs2/2,pr=cs2/2-2,angle=pac.dir*Math.PI/2;
            ctx.fillStyle='#ccaa00';ctx.beginPath();ctx.arc(px,py,pr,angle+mouthOpen,angle+Math.PI*2-mouthOpen);ctx.lineTo(px,py);ctx.closePath();ctx.fill();
            for(var g=0;g<ghosts.length;g++){var gh=ghosts[g],gx=gh.x*cs2+cs2/2,gy=gh.y*cs2+cs2/2,gr=cs2/2-2;ctx.fillStyle=gh.color;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,0);ctx.lineTo(gx+gr,gy+gr);for(var wv=0;wv<3;wv++){var wx=gx+gr-(wv+1)*(2*gr/3);ctx.quadraticCurveTo(gx+gr-(wv+0.5)*(2*gr/3),gy+gr+4,wx,gy+gr);}ctx.lineTo(gx-gr,gy+gr);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx-gr*0.3,gy-2,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(gx+gr*0.3,gy-2,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(gx-gr*0.3,gy-1,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(gx+gr*0.3,gy-1,1.5,0,Math.PI*2);ctx.fill();}
            if(Date.now()-moveTimer>moveInt){moveTimer=Date.now();
                var best=null,bestDist=99999;for(var y2=0;y2<gH;y2++)for(var x2=0;x2<gW;x2++){if(!dots[y2][x2])continue;var d=Math.abs(x2-pac.x)+Math.abs(y2-pac.y);if(d<bestDist){bestDist=d;best={x:x2,y:y2};}}
                if(!best){init();return;}var dx2=best.x-pac.x,dy2=best.y-pac.y;if(Math.abs(dx2)>Math.abs(dy2))pac.dir=dx2>0?0:2;else pac.dir=dy2>0?1:3;var d3=dirs[pac.dir],nx=pac.x+d3.x,ny=pac.y+d3.y;if(nx>=0&&nx<gW&&ny>=0&&ny<gH){pac.x=nx;pac.y=ny;}if(dots[pac.y]&&dots[pac.y][pac.x])dots[pac.y][pac.x]=0;
                for(var g2=0;g2<ghosts.length;g2++){var gh2=ghosts[g2];if(Math.random()<0.3)gh2.dir=randInt(0,4);var d4=dirs[gh2.dir],nx2=gh2.x+d4.x,ny2=gh2.y+d4.y;if(nx2>=0&&nx2<gW&&ny2>=0&&ny2<gH){gh2.x=nx2;gh2.y=ny2;}else gh2.dir=randInt(0,4);}
            }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 9. RETRO GRID
    // ═══════════════════════════════════════════════════════════
    function retroGrid() {
        var t = 0;
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            var horizon = h * 0.4;
            var skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
            skyGrad.addColorStop(0, '#f0f4ff'); skyGrad.addColorStop(1, '#e0e8f8');
            ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, horizon);
            var sunY = horizon - 35;
            var sunGrad = ctx.createRadialGradient(w/2, sunY, 8, w/2, sunY, 75);
            sunGrad.addColorStop(0, '#ee8822'); sunGrad.addColorStop(0.4, '#dd5544'); sunGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(w/2, sunY, 75, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f0f4ff'; for(var s=0;s<5;s++) ctx.fillRect(w/2-75, sunY-25+s*12, 150, 3);
            var gGrad = ctx.createLinearGradient(0, horizon, 0, h);
            gGrad.addColorStop(0, '#e8ecf4'); gGrad.addColorStop(1, '#f4f6fa');
            ctx.fillStyle = gGrad; ctx.fillRect(0, horizon, w, h-horizon);
            for(var i=0;i<25;i++){var frac=Math.pow((i+(t*3)%1)/25,2);var ly=horizon+frac*(h-horizon);ctx.strokeStyle='rgba(80,100,180,'+(frac*0.4)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,ly);ctx.lineTo(w,ly);ctx.stroke();}
            var numV=20;for(var v=-numV;v<=numV;v++){ctx.strokeStyle='rgba(80,100,180,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w/2+v*2,horizon);ctx.lineTo(w/2+v*(w/numV)*1.5,h);ctx.stroke();}
            ctx.strokeStyle='rgba(80,100,180,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w,horizon);ctx.stroke();
            t += 0.02; animId = requestAnimationFrame(draw);
        }
        draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 10. ASTEROIDS
    // ═══════════════════════════════════════════════════════════
    function asteroids() {
        var rocks, ship, bullets, shipAngle, shootTimer;
        var rockColors = ['#0066bb','#229944','#ccaa00','#cc5588','#dd7700'];
        function makeRock(x,y,size){var pts=[],n=randInt(7,12);for(var i=0;i<n;i++){var a=(i/n)*Math.PI*2;pts.push({x:Math.cos(a)*size*(0.7+Math.random()*0.6),y:Math.sin(a)*size*(0.7+Math.random()*0.6)});}return {x:x,y:y,vx:rand(-1,1),vy:rand(-1,1),pts:pts,size:size,rot:0,rotV:rand(-0.015,0.015),color:rockColors[randInt(0,rockColors.length)]};}
        function init(){var w=canvas.width,h=canvas.height;rocks=[];for(var i=0;i<12;i++)rocks.push(makeRock(rand(0,w),rand(0,h),rand(25,55)));ship={x:w/2,y:h/2,vx:0,vy:0};shipAngle=-Math.PI/2;bullets=[];shootTimer=Date.now();}
        function draw(){
            var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
            var nearRock=null,nearDist=99999;for(var r=0;r<rocks.length;r++){var d=Math.hypot(rocks[r].x-ship.x,rocks[r].y-ship.y);if(d<nearDist){nearDist=d;nearRock=rocks[r];}}
            if(nearRock){var ta=Math.atan2(nearRock.y-ship.y,nearRock.x-ship.x),diff=ta-shipAngle;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;shipAngle+=diff*0.05;}
            ship.vx+=Math.cos(shipAngle)*0.03;ship.vy+=Math.sin(shipAngle)*0.03;ship.vx*=0.99;ship.vy*=0.99;ship.x+=ship.vx;ship.y+=ship.vy;if(ship.x<0)ship.x=w;if(ship.x>w)ship.x=0;if(ship.y<0)ship.y=h;if(ship.y>h)ship.y=0;
            ctx.strokeStyle='#2a6e4e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ship.x+Math.cos(shipAngle)*15,ship.y+Math.sin(shipAngle)*15);ctx.lineTo(ship.x+Math.cos(shipAngle+2.5)*10,ship.y+Math.sin(shipAngle+2.5)*10);ctx.lineTo(ship.x+Math.cos(shipAngle-2.5)*10,ship.y+Math.sin(shipAngle-2.5)*10);ctx.closePath();ctx.stroke();
            if(Date.now()-shootTimer>450){shootTimer=Date.now();bullets.push({x:ship.x+Math.cos(shipAngle)*16,y:ship.y+Math.sin(shipAngle)*16,vx:Math.cos(shipAngle)*5+ship.vx,vy:Math.sin(shipAngle)*5+ship.vy,life:80});}
            for(var b=bullets.length-1;b>=0;b--){var bl=bullets[b];bl.x+=bl.vx;bl.y+=bl.vy;bl.life--;ctx.fillStyle='#cc6600';ctx.beginPath();ctx.arc(bl.x,bl.y,2.5,0,Math.PI*2);ctx.fill();if(bl.life<=0||bl.x<-10||bl.x>w+10||bl.y<-10||bl.y>h+10){bullets.splice(b,1);continue;}for(var r2=rocks.length-1;r2>=0;r2--){if(Math.hypot(bl.x-rocks[r2].x,bl.y-rocks[r2].y)<rocks[r2].size){if(rocks[r2].size>18){rocks.push(makeRock(rocks[r2].x,rocks[r2].y,rocks[r2].size*0.55));rocks.push(makeRock(rocks[r2].x,rocks[r2].y,rocks[r2].size*0.55));}rocks.splice(r2,1);bullets.splice(b,1);break;}}}
            if(rocks.length<5)for(var a=0;a<6;a++)rocks.push(makeRock(rand(0,w),rand(0,h),rand(25,55)));
            if(rocks.length>30)rocks.splice(0,rocks.length-25);
            for(var i=0;i<rocks.length;i++){var rk=rocks[i];rk.x+=rk.vx;rk.y+=rk.vy;rk.rot+=rk.rotV;if(rk.x<-rk.size)rk.x=w+rk.size;if(rk.x>w+rk.size)rk.x=-rk.size;if(rk.y<-rk.size)rk.y=h+rk.size;if(rk.y>h+rk.size)rk.y=-rk.size;ctx.strokeStyle=rk.color;ctx.lineWidth=2;ctx.beginPath();for(var p=0;p<=rk.pts.length;p++){var pt=rk.pts[p%rk.pts.length];var px2=rk.x+Math.cos(rk.rot)*pt.x-Math.sin(rk.rot)*pt.y;var py2=rk.y+Math.sin(rk.rot)*pt.x+Math.cos(rk.rot)*pt.y;if(p===0)ctx.moveTo(px2,py2);else ctx.lineTo(px2,py2);}ctx.closePath();ctx.stroke();}
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 11. BREAKOUT / DX BALL — multiple balls
    // ═══════════════════════════════════════════════════════════
    function breakout() {
        var bricks, balls, paddle, padW, brickW, brickH, rows, cols, sparks;
        var brickColors = ['#cc2244','#dd7700','#ccaa00','#229944','#0066bb','#aa44aa','#cc5588'];
        var NUM_BALLS = 5;
        function init() {
            var w = canvas.width, h = canvas.height;
            cols = Math.floor(w / 60); rows = Math.max(5, Math.floor(h * 0.3 / 22));
            brickW = (w - 20) / cols; brickH = 20; padW = Math.max(80, w * 0.12);
            bricks = [];
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) bricks.push({x: 10 + c*brickW, y: 40 + r*(brickH+3), w: brickW-3, h: brickH, alive: true, color: brickColors[r % brickColors.length]});
            paddle = {x: w/2, y: h - 40};
            balls = [];
            for (var i = 0; i < NUM_BALLS; i++) balls.push({x: rand(w*0.2,w*0.8), y: h*0.55+rand(0,60), vx: rand(-2.5,2.5), vy: -rand(2,4), r: rand(4,7), color: brickColors[randInt(0, brickColors.length)]});
            sparks = [];
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            // Bricks
            var anyAlive = false;
            for (var i = 0; i < bricks.length; i++) {
                var br = bricks[i]; if (!br.alive) continue; anyAlive = true;
                ctx.fillStyle = br.color; ctx.fillRect(br.x, br.y, br.w, br.h);
                ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(br.x, br.y, br.w, 3);
            }
            if (!anyAlive) init();
            // Paddle AI tracks average ball x
            var avgX = 0; for (var bi = 0; bi < balls.length; bi++) avgX += balls[bi].x; avgX /= balls.length;
            paddle.x += (avgX - paddle.x) * 0.08;
            ctx.fillStyle = '#2a6e4e'; ctx.fillRect(paddle.x - padW/2, paddle.y, padW, 12);
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(paddle.x - padW/2, paddle.y, padW, 3);
            // Sparks
            for (var si = sparks.length-1; si >= 0; si--) { var sp = sparks[si]; sp.x+=sp.vx; sp.y+=sp.vy; sp.life-=0.05; if(sp.life<=0){sparks.splice(si,1);continue;} ctx.globalAlpha=sp.life; ctx.fillStyle=sp.color; ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.size*sp.life,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
            // Balls
            for (var b = 0; b < balls.length; b++) {
                var ball = balls[b]; ball.x += ball.vx; ball.y += ball.vy;
                // Wall bounces
                if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
                if (ball.x + ball.r > w) { ball.x = w - ball.r; ball.vx = -Math.abs(ball.vx); }
                if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
                // Paddle bounce
                if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + 18 && ball.x >= paddle.x - padW/2 && ball.x <= paddle.x + padW/2) {
                    ball.vy = -Math.abs(ball.vy); ball.vx += (ball.x - paddle.x) * 0.05;
                    for(var sk=0;sk<4;sk++){var a2=rand(0,Math.PI*2);sparks.push({x:ball.x,y:paddle.y,vx:Math.cos(a2)*rand(1,3),vy:Math.sin(a2)*rand(1,3),life:1,color:ball.color,size:rand(2,4)});}
                }
                // Bottom reset
                if (ball.y > h + 20) { ball.x = rand(w*0.3, w*0.7); ball.y = h*0.4; ball.vx = rand(-2,2); ball.vy = -rand(2,4); }
                // Brick collision
                for (var br2 = 0; br2 < bricks.length; br2++) {
                    var bk = bricks[br2]; if (!bk.alive) continue;
                    if (ball.x+ball.r > bk.x && ball.x-ball.r < bk.x+bk.w && ball.y+ball.r > bk.y && ball.y-ball.r < bk.y+bk.h) {
                        bk.alive = false; ball.vy *= -1;
                        for(var sk2=0;sk2<5;sk2++){var a3=rand(0,Math.PI*2);sparks.push({x:ball.x,y:ball.y,vx:Math.cos(a3)*rand(1,3),vy:Math.sin(a3)*rand(1,3),life:1,color:bk.color,size:rand(2,4)});}
                        break;
                    }
                }
                // Speed cap
                if(Math.abs(ball.vx)>6) ball.vx=6*(ball.vx>0?1:-1); if(Math.abs(ball.vy)>6) ball.vy=6*(ball.vy>0?1:-1);
                if(Math.abs(ball.vy)<1.5) ball.vy = ball.vy>0?1.5:-1.5;
                // Draw ball
                ctx.fillStyle = ball.color; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(ball.x-ball.r*0.2, ball.y-ball.r*0.2, ball.r*0.35, 0, Math.PI*2); ctx.fill();
            }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 12. TRON LIGHT CYCLES
    // ═══════════════════════════════════════════════════════════
    function tron() {
        var cycles, gW, gH, cs2, grid, moveTimer, moveInt = 40;
        var cycleColors = ['#0088cc','#cc3344','#44aa44','#cc8800'];
        function init() {
            cs2 = Math.max(4, Math.min(8, Math.floor(canvas.width / 200)));
            gW = Math.floor(canvas.width / cs2); gH = Math.floor(canvas.height / cs2);
            grid = []; for (var y = 0; y < gH; y++) { grid[y] = []; for (var x = 0; x < gW; x++) grid[y][x] = 0; }
            cycles = [];
            var starts = [{x:Math.floor(gW*0.2),y:Math.floor(gH/2),dir:0},{x:Math.floor(gW*0.8),y:Math.floor(gH/2),dir:2},{x:Math.floor(gW/2),y:Math.floor(gH*0.2),dir:1},{x:Math.floor(gW/2),y:Math.floor(gH*0.8),dir:3}];
            for (var i = 0; i < 4; i++) cycles.push({x:starts[i].x, y:starts[i].y, dir:starts[i].dir, color:cycleColors[i], alive:true});
            moveTimer = Date.now();
        }
        var dirs = [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = 'rgba(255,255,255,0.01)'; ctx.fillRect(0, 0, w, h);
            // Draw grid trails
            for (var y = 0; y < gH; y++) for (var x = 0; x < gW; x++) { if (grid[y][x]) { ctx.fillStyle = grid[y][x]; ctx.fillRect(x*cs2, y*cs2, cs2, cs2); } }
            // Draw cycle heads
            for (var ci = 0; ci < cycles.length; ci++) { if (!cycles[ci].alive) continue; ctx.fillStyle = '#fff'; ctx.fillRect(cycles[ci].x*cs2-1, cycles[ci].y*cs2-1, cs2+2, cs2+2); ctx.fillStyle = cycles[ci].color; ctx.fillRect(cycles[ci].x*cs2, cycles[ci].y*cs2, cs2, cs2); }
            if (Date.now() - moveTimer > moveInt) {
                moveTimer = Date.now();
                var anyAlive = false;
                for (var ci2 = 0; ci2 < cycles.length; ci2++) {
                    var c = cycles[ci2]; if (!c.alive) continue; anyAlive = true;
                    // AI: avoid walls and trails, slight randomness
                    if (Math.random() < 0.1) { var newDir = (c.dir + (Math.random()<0.5?1:3)) % 4; var nd = dirs[newDir]; var tnx = c.x+nd.x, tny = c.y+nd.y; if (tnx>=0&&tnx<gW&&tny>=0&&tny<gH&&!grid[tny][tnx]) c.dir = newDir; }
                    var d = dirs[c.dir], nx = c.x+d.x, ny = c.y+d.y;
                    if (nx<0||nx>=gW||ny<0||ny>=gH||grid[ny][nx]) {
                        // Try turning
                        var turned = false;
                        for (var t = 0; t < 4; t++) { var td = dirs[t]; var tx = c.x+td.x, ty = c.y+td.y; if (tx>=0&&tx<gW&&ty>=0&&ty<gH&&!grid[ty][tx]) { c.dir = t; nx = tx; ny = ty; turned = true; break; } }
                        if (!turned) { c.alive = false; continue; }
                    }
                    grid[c.y][c.x] = c.color; c.x = nx; c.y = ny;
                }
                // Check grid fill
                var filled = 0; for (var y2 = 0; y2 < gH; y2++) for (var x2 = 0; x2 < gW; x2++) if (grid[y2][x2]) filled++;
                if (!anyAlive || filled > gW*gH*0.5) { ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h); init(); }
            }
            animId = requestAnimationFrame(draw);
        }
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 13. CENTIPEDE
    // ═══════════════════════════════════════════════════════════
    function centipede() {
        var segs, mushrooms, ship, bullets, moveTimer, moveInt = 50, cs2, gW, gH;
        var segColors = ['#cc2244','#dd5544','#cc7744','#cc9944','#ccbb44','#aacc44','#66cc44','#44cc66','#44ccaa','#44aacc'];
        function init() {
            cs2 = Math.max(14, Math.min(22, Math.floor(canvas.width/65)));
            gW = Math.floor(canvas.width/cs2); gH = Math.floor(canvas.height/cs2);
            segs = []; for (var i = 0; i < 14; i++) segs.push({x: Math.floor(gW/2)-i, y: 0, dir: 1});
            mushrooms = [];
            for (var m = 0; m < Math.floor(gW*gH*0.04); m++) mushrooms.push({x: randInt(0,gW), y: randInt(2, gH-4), hp: 3});
            ship = {x: Math.floor(gW/2), y: gH-2}; bullets = []; moveTimer = Date.now();
        }
        function isMush(x, y) { for (var i = 0; i < mushrooms.length; i++) if (mushrooms[i].x===x && mushrooms[i].y===y && mushrooms[i].hp>0) return true; return false; }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            // Mushrooms
            for (var m = 0; m < mushrooms.length; m++) {
                var mu = mushrooms[m]; if (mu.hp <= 0) continue;
                var alpha = mu.hp / 3; ctx.fillStyle = 'rgba(100,180,80,'+alpha+')';
                ctx.beginPath(); ctx.arc(mu.x*cs2+cs2/2, mu.y*cs2+cs2*0.35, cs2*0.4, Math.PI, 0); ctx.fill();
                ctx.fillStyle = 'rgba(139,119,101,'+alpha+')'; ctx.fillRect(mu.x*cs2+cs2*0.4, mu.y*cs2+cs2*0.35, cs2*0.2, cs2*0.5);
            }
            // Centipede segments
            for (var s = 0; s < segs.length; s++) {
                var sg = segs[s]; ctx.fillStyle = segColors[s % segColors.length];
                ctx.beginPath(); ctx.arc(sg.x*cs2+cs2/2, sg.y*cs2+cs2/2, cs2/2-1, 0, Math.PI*2); ctx.fill();
                if (s===0) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sg.x*cs2+cs2*0.35, sg.y*cs2+cs2*0.35, cs2*0.12, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(sg.x*cs2+cs2*0.65, sg.y*cs2+cs2*0.35, cs2*0.12, 0, Math.PI*2); ctx.fill(); }
            }
            // Ship
            ctx.fillStyle = '#2a6e4e'; ctx.fillRect(ship.x*cs2+2, ship.y*cs2+4, cs2-4, cs2-6); ctx.fillRect(ship.x*cs2+cs2/2-2, ship.y*cs2, 4, 6);
            // AI: track head
            if (segs.length) { var dx = segs[0].x - ship.x; if (dx > 0) ship.x = Math.min(gW-1, ship.x+1); else if (dx < 0) ship.x = Math.max(0, ship.x-1); }
            // Shoot
            if (bullets.length < 3) bullets.push({x: ship.x*cs2+cs2/2, y: ship.y*cs2});
            for (var b = bullets.length-1; b >= 0; b--) {
                bullets[b].y -= 6; ctx.fillStyle = '#cc6600'; ctx.fillRect(bullets[b].x-1.5, bullets[b].y, 3, 8);
                if (bullets[b].y < -10) { bullets.splice(b, 1); continue; }
                // Hit mushroom
                var bx = Math.floor(bullets[b].x / cs2), by = Math.floor(bullets[b].y / cs2);
                for (var m2 = 0; m2 < mushrooms.length; m2++) { if (mushrooms[m2].x===bx && mushrooms[m2].y===by && mushrooms[m2].hp>0) { mushrooms[m2].hp--; bullets.splice(b, 1); b = -1; break; } }
                if (b < 0) continue;
                // Hit segment
                for (var s2 = segs.length-1; s2 >= 0; s2--) { if (segs[s2].x===bx && segs[s2].y===by) { mushrooms.push({x:segs[s2].x, y:segs[s2].y, hp:3}); segs.splice(s2, 1); bullets.splice(b, 1); break; } }
            }
            // Move centipede
            if (Date.now() - moveTimer > moveInt) {
                moveTimer = Date.now();
                for (var s3 = 0; s3 < segs.length; s3++) {
                    var sg2 = segs[s3], nx = sg2.x + sg2.dir;
                    if (nx < 0 || nx >= gW || isMush(nx, sg2.y)) { sg2.y++; sg2.dir *= -1; }
                    else sg2.x = nx;
                    if (sg2.y >= gH) sg2.y = 0;
                }
            }
            if (segs.length === 0) init();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 14. GALAGA — formation + dive attacks
    // ═══════════════════════════════════════════════════════════
    function galaga() {
        var enemies, ship, bullets, eBullets, diveTimer, shootTimer, formY;
        var eColors = ['#cc2244','#dd7700','#0066bb','#229944','#aa44aa'];
        function init() {
            var w = canvas.width;
            enemies = []; formY = 0;
            var cols = Math.floor(w / 50), rows = 4;
            for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) enemies.push({x: 25+c*45, y: 30+r*35, homeX: 25+c*45, homeY: 30+r*35, diving: false, diveY: 0, color: eColors[r%eColors.length], alive: true, w: 24, h: 20});
            ship = {x: w/2, w: 28}; bullets = []; eBullets = []; diveTimer = Date.now(); shootTimer = Date.now();
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            // Ship
            ctx.fillStyle = '#2a6e4e'; ctx.fillRect(ship.x-14, h-45, 28, 14); ctx.fillRect(ship.x-4, h-53, 8, 10);
            // Formation sway
            formY = Math.sin(Date.now()*0.001) * 15;
            var anyAlive = false;
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i]; if (!e.alive) continue; anyAlive = true;
                if (e.diving) { e.y += 3; if (e.y > h + 20) { e.diving = false; e.x = e.homeX; e.y = e.homeY; } }
                else { e.x = e.homeX + Math.sin(Date.now()*0.002+i)*20; e.y = e.homeY + formY; }
                ctx.fillStyle = e.color;
                ctx.beginPath(); ctx.moveTo(e.x, e.y-e.h/2); ctx.lineTo(e.x+e.w/2, e.y+e.h/2); ctx.lineTo(e.x, e.y+e.h/4); ctx.lineTo(e.x-e.w/2, e.y+e.h/2); ctx.closePath(); ctx.fill();
            }
            if (!anyAlive) init();
            // Dive attack
            if (Date.now()-diveTimer>800) { diveTimer=Date.now(); var alive=enemies.filter(function(e){return e.alive&&!e.diving;}); if(alive.length){var pick=alive[randInt(0,alive.length)];pick.diving=true;} }
            // AI: track nearest alive enemy
            var nearX = w/2; for (var i2=0;i2<enemies.length;i2++) if (enemies[i2].alive&&enemies[i2].diving){nearX=enemies[i2].x;break;}
            ship.x += (nearX - ship.x) * 0.06;
            // Shoot
            if (Date.now()-shootTimer>300) { shootTimer=Date.now(); bullets.push({x:ship.x,y:h-55}); }
            for (var b=bullets.length-1;b>=0;b--) { bullets[b].y-=8; ctx.fillStyle='#cc6600'; ctx.fillRect(bullets[b].x-1.5,bullets[b].y,3,10); if(bullets[b].y<-10){bullets.splice(b,1);continue;} for(var e2=0;e2<enemies.length;e2++){var en=enemies[e2];if(!en.alive)continue;if(Math.abs(bullets[b].x-en.x)<en.w/2&&Math.abs(bullets[b].y-en.y)<en.h/2){en.alive=false;bullets.splice(b,1);break;}} }
            // Enemy bullets
            if(Math.random()<0.015){var divers=enemies.filter(function(e){return e.alive&&e.diving;});if(divers.length){var s=divers[randInt(0,divers.length)];eBullets.push({x:s.x,y:s.y+s.h/2});}}
            for(var eb=eBullets.length-1;eb>=0;eb--){eBullets[eb].y+=4;ctx.fillStyle='#cc2244';ctx.fillRect(eBullets[eb].x-1.5,eBullets[eb].y,3,8);if(eBullets[eb].y>h+10)eBullets.splice(eb,1);}
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 15. FLAPPY BIRD — pipe dodging
    // ═══════════════════════════════════════════════════════════
    function flappyBird() {
        var bird, pipes, pipeTimer, gravity = 0.18, flapStr = -4.2, pipeGap, pipeW;
        function init() {
            var h = canvas.height;
            bird = {x: canvas.width*0.2, y: h/2, vy: 0}; pipes = []; pipeTimer = Date.now();
            pipeGap = Math.max(120, h * 0.2); pipeW = 55;
            for (var i = 0; i < 6; i++) addPipe(canvas.width + i * 250);
        }
        function addPipe(x) {
            var h = canvas.height, gapY = rand(pipeGap+40, h-pipeGap-40);
            pipes.push({x: x, gapY: gapY});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#eef6ee'; ctx.fillRect(0, 0, w, h);
            // Ground
            ctx.fillStyle = '#c8b888'; ctx.fillRect(0, h-30, w, 30);
            // Pipes
            for (var i = pipes.length-1; i >= 0; i--) {
                var p = pipes[i]; p.x -= 1.8;
                if (p.x < -pipeW-10) { pipes.splice(i, 1); addPipe(pipes[pipes.length-1].x + 250); continue; }
                ctx.fillStyle = '#44aa55';
                ctx.fillRect(p.x, 0, pipeW, p.gapY - pipeGap/2);
                ctx.fillRect(p.x, p.gapY + pipeGap/2, pipeW, h - p.gapY - pipeGap/2);
                ctx.fillStyle = '#55bb66';
                ctx.fillRect(p.x-4, p.gapY-pipeGap/2-15, pipeW+8, 15);
                ctx.fillRect(p.x-4, p.gapY+pipeGap/2, pipeW+8, 15);
            }
            // Bird AI: flap when below gap center of next pipe
            var nextPipe = null;
            for (var p2 = 0; p2 < pipes.length; p2++) { if (pipes[p2].x + pipeW > bird.x) { nextPipe = pipes[p2]; break; } }
            if (nextPipe && bird.y > nextPipe.gapY) bird.vy = flapStr;
            if (bird.y < 40) bird.vy = 1;
            bird.vy += gravity; bird.y += bird.vy;
            // Reset if hit ground/ceiling or pipe
            var reset = false;
            if (bird.y > h-40 || bird.y < 5) reset = true;
            if (nextPipe && bird.x+12>nextPipe.x && bird.x-12<nextPipe.x+pipeW) { if (bird.y-12<nextPipe.gapY-pipeGap/2 || bird.y+12>nextPipe.gapY+pipeGap/2) reset = true; }
            if (reset) init();
            // Draw bird
            ctx.fillStyle = '#ddaa00'; ctx.beginPath(); ctx.arc(bird.x, bird.y, 14, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ee6600'; ctx.beginPath(); ctx.moveTo(bird.x+14, bird.y); ctx.lineTo(bird.x+22, bird.y-3); ctx.lineTo(bird.x+22, bird.y+3); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bird.x+4, bird.y-5, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bird.x+5, bird.y-5, 2.5, 0, Math.PI*2); ctx.fill();
            // Wing
            ctx.fillStyle = '#cc9900'; ctx.beginPath(); ctx.ellipse(bird.x-8, bird.y+2, 10, 6, -0.3, 0, Math.PI*2); ctx.fill();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 16. COLUMNS — falling gem triples
    // ═══════════════════════════════════════════════════════════
    function columns() {
        var cs2, gW, gH, grid, piece, dropTimer, dropInt = 180;
        var gemColors = ['#cc2244','#0066bb','#229944','#ccaa00','#aa44aa','#dd7700'];
        function init() {
            cs2 = Math.max(20, Math.min(32, Math.floor(canvas.width/40)));
            gW = Math.floor(canvas.width/cs2); gH = Math.floor(canvas.height/cs2);
            grid = []; for (var y=0;y<gH;y++){grid[y]=[];for(var x=0;x<gW;x++)grid[y][x]=0;}
            var fillTo = Math.floor(gH*0.6);
            for (var y2=fillTo;y2<gH;y2++) for(var x2=0;x2<gW;x2++) if(Math.random()<0.6) grid[y2][x2]=gemColors[randInt(0,gemColors.length)];
            spawn(); dropTimer=Date.now();
        }
        function spawn() { var x = randInt(0,gW); piece = {x:x, y:0, gems:[gemColors[randInt(0,gemColors.length)],gemColors[randInt(0,gemColors.length)],gemColors[randInt(0,gemColors.length)]]}; }
        function lock() {
            for (var i=0;i<3;i++){var py=piece.y+i; if(py>=0&&py<gH) grid[py][piece.x]=piece.gems[i];}
            // Clear matches (3+ same color in a row/col/diag)
            var cleared = true;
            while (cleared) {
                cleared = false; var toRemove = [];
                for (var y=0;y<gH;y++) for(var x=0;x<gW;x++){if(!grid[y][x])continue;var c=grid[y][x];
                    if(x+2<gW&&grid[y][x+1]===c&&grid[y][x+2]===c){toRemove.push([y,x],[y,x+1],[y,x+2]);}
                    if(y+2<gH&&grid[y+1][x]===c&&grid[y+2][x]===c){toRemove.push([y,x],[y+1,x],[y+2,x]);}
                }
                for(var r=0;r<toRemove.length;r++){grid[toRemove[r][0]][toRemove[r][1]]=0;cleared=true;}
                // Gravity
                for(var x2=0;x2<gW;x2++){var write=gH-1;for(var y2=gH-1;y2>=0;y2--)if(grid[y2][x2]){grid[write][x2]=grid[y2][x2];if(write!==y2)grid[y2][x2]=0;write--;}}
            }
            var topRow=gH;for(var y3=0;y3<gH;y3++)for(var x3=0;x3<gW;x3++)if(grid[y3][x3]){topRow=y3;y3=gH;break;}
            if(topRow<gH*0.2){for(var y4=Math.floor(gH*0.5);y4<gH;y4++)for(var x4=0;x4<gW;x4++)grid[y4][x4]=0;}
            spawn();
        }
        function draw() {
            var w=canvas.width,h=canvas.height; ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
            ctx.strokeStyle='rgba(0,0,0,0.04)';ctx.lineWidth=0.5;
            for(var x=0;x<=gW;x++){ctx.beginPath();ctx.moveTo(x*cs2,0);ctx.lineTo(x*cs2,gH*cs2);ctx.stroke();}
            for(var y=0;y<=gH;y++){ctx.beginPath();ctx.moveTo(0,y*cs2);ctx.lineTo(gW*cs2,y*cs2);ctx.stroke();}
            for(var y=0;y<gH;y++)for(var x=0;x<gW;x++){if(!grid[y][x])continue;ctx.fillStyle=grid[y][x];ctx.beginPath();ctx.arc(x*cs2+cs2/2,y*cs2+cs2/2,cs2/2-2,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(x*cs2+cs2/2-3,y*cs2+cs2/2-3,cs2/5,0,Math.PI*2);ctx.fill();}
            if(piece) for(var i=0;i<3;i++){var py=piece.y+i;if(py<0)continue;ctx.fillStyle=piece.gems[i];ctx.beginPath();ctx.arc(piece.x*cs2+cs2/2,py*cs2+cs2/2,cs2/2-2,0,Math.PI*2);ctx.fill();}
            if(Date.now()-dropTimer>dropInt){dropTimer=Date.now();if(piece.y+3<gH&&!grid[piece.y+3]||piece.y+2<gH&&!grid[piece.y+2][piece.x])piece.y++;else lock();}
            animId=requestAnimationFrame(draw);
        }
        init(); draw();
    }


    // ═══════════════════════════════════════════════════════════
    // 17. DOODLE JUMP — monsters, springs, moving platforms, jetpacks, projectiles
    // ═══════════════════════════════════════════════════════════
    function doodleJump() {
        var player, platforms, scrollY, jumpV = -8.2, monsters, springs, score, projectiles, jetpack;
        var platColors = ['#44aa55','#55bb66','#66cc77'];
        var clouds = [];
        function init() {
            var w = canvas.width, h = canvas.height;
            player = {x: w/2, y: h*0.6, vy: jumpV, dir: 1, frame: 0, shooting: 0};
            platforms = []; scrollY = 0; monsters = []; springs = []; score = 0; projectiles = [];
            jetpack = {active: false, fuel: 0, pickups: []};
            clouds = [];
            for (var ci = 0; ci < 12; ci++) clouds.push({x: rand(0, w), y: rand(0, h*3), w: rand(40,100), alpha: rand(0.03,0.08)});
            for (var i = 0; i < 50; i++) {
                var pType = 'normal';
                if (i > 5 && Math.random() < 0.14) pType = 'moving';
                if (i > 5 && Math.random() < 0.07) pType = 'breaking';
                if (i > 10 && Math.random() < 0.04) pType = 'vanishing';
                var pw = rand(55, 90);
                platforms.push({x: rand(15, w-pw-15), y: h - i*45 - rand(0,12), w: pw, type: pType, moveDir: Math.random()<0.5?1:-1, broken: false, vanishTimer: 0});
                if (i > 3 && Math.random() < 0.13) springs.push({platIdx: platforms.length-1, bounce: -14});
                if (i > 8 && Math.random() < 0.06) monsters.push({x: rand(30, w-30), y: h - i*45 - rand(30,80), vx: rand(0.5,1.5)*(Math.random()<0.5?1:-1), w: 30, h: 25, alive: true, hp: 1});
                if (i > 6 && Math.random() < 0.03) jetpack.pickups.push({platIdx: platforms.length-1, collected: false});
            }
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            // Sky gradient
            var grad = ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#e8f0ff'); grad.addColorStop(1,'#f4f8f4');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            // Parallax clouds
            for (var ci = 0; ci < clouds.length; ci++) {
                var cl = clouds[ci], cy = ((cl.y - scrollY*0.15) % (h+200) + h+200) % (h+200) - 100;
                ctx.fillStyle = 'rgba(180,200,220,'+cl.alpha+')';
                ctx.beginPath(); ctx.arc(cl.x, cy, cl.w*0.35, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(cl.x+cl.w*0.3, cy-5, cl.w*0.25, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(cl.x-cl.w*0.25, cy+3, cl.w*0.2, 0, Math.PI*2); ctx.fill();
            }
            // Faint grid bg
            ctx.strokeStyle = 'rgba(0,0,0,0.015)'; ctx.lineWidth = 1;
            for (var gx = 0; gx < w; gx += 35) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
            // Jetpack
            if (jetpack.active) {
                jetpack.fuel -= 0.015;
                player.vy = Math.min(player.vy, -4);
                // Flame particles
                for (var fp = 0; fp < 2; fp++) projectiles.push({x: player.x + rand(-5,5), y: player.y + 22, vx: rand(-0.5,0.5), vy: rand(2,4), life: 0.4, isFlame: true});
                if (jetpack.fuel <= 0) jetpack.active = false;
            } else {
                player.vy += 0.23;
            }
            player.y += player.vy;
            player.x += player.dir * 1.9; player.frame += 0.1;
            if (player.x > w + 20) player.x = -20; if (player.x < -20) player.x = w + 20;
            // AI: steer toward nearest platform above, avoid monsters
            var bestPlat = null, bestDist = 99999;
            for (var i = 0; i < platforms.length; i++) {
                var py = platforms[i].y - scrollY;
                if (py < player.y && py > player.y - 250 && !platforms[i].broken) { var d = Math.abs(platforms[i].x + platforms[i].w/2 - player.x); if (d < bestDist) { bestDist = d; bestPlat = platforms[i]; } }
            }
            var avoidDir = 0;
            for (var m = 0; m < monsters.length; m++) { var mon = monsters[m]; if (!mon.alive) continue; var my = mon.y - scrollY; if (Math.abs(my - player.y) < 80 && Math.abs(mon.x - player.x) < 60) avoidDir = mon.x > player.x ? -1 : 1; }
            if (avoidDir) player.dir = avoidDir;
            else if (bestPlat) { var dx = bestPlat.x + bestPlat.w/2 - player.x; player.dir = dx > 0 ? 1 : -1; }
            else if (Math.random() < 0.02) player.dir *= -1;
            // Auto shoot at nearby monsters
            player.shooting = Math.max(0, player.shooting - 1);
            for (var mi2 = 0; mi2 < monsters.length; mi2++) {
                var mon3 = monsters[mi2]; if (!mon3.alive) continue;
                var my2 = mon3.y - scrollY;
                if (my2 < player.y && my2 > player.y - 200 && Math.abs(mon3.x - player.x) < 80 && player.shooting <= 0) {
                    projectiles.push({x: player.x, y: player.y - 18, vx: 0, vy: -6, life: 1, isFlame: false, isBullet: true});
                    player.shooting = 20;
                    break;
                }
            }
            // Scroll
            if (player.y < h * 0.35) { var diff = h*0.35 - player.y; scrollY -= diff; player.y = h*0.35; score++; }
            // Platforms
            for (var p = platforms.length-1; p >= 0; p--) {
                var plat = platforms[p], sy = plat.y - scrollY;
                if (sy > h + 50) {
                    plat.y = scrollY - rand(10,50); plat.x = rand(15, w-80); plat.type = Math.random()<0.12?'moving':(Math.random()<0.06?'breaking':(Math.random()<0.03?'vanishing':'normal')); plat.broken = false; plat.moveDir = Math.random()<0.5?1:-1; plat.vanishTimer = 0;
                    if (Math.random() < 0.1) springs.push({platIdx: p, bounce: -14});
                    if (Math.random() < 0.05) monsters.push({x: rand(30, w-30), y: plat.y - rand(30,80), vx: rand(0.5,1.5)*(Math.random()<0.5?1:-1), w: 30, h: 25, alive: true, hp: 1});
                    if (Math.random() < 0.025) jetpack.pickups.push({platIdx: p, collected: false});
                    continue;
                }
                if (plat.broken) continue;
                if (plat.type === 'moving') { plat.x += plat.moveDir * 1.3; if (plat.x < 10 || plat.x + plat.w > w - 10) plat.moveDir *= -1; }
                // Vanishing platforms
                if (plat.type === 'vanishing' && plat.vanishTimer > 0) { plat.vanishTimer--; if (plat.vanishTimer <= 0) plat.broken = true; }
                // Draw platform
                if (plat.type === 'breaking') { ctx.fillStyle = '#cc8844'; ctx.fillRect(plat.x, sy, plat.w, 10); ctx.setLineDash([4,3]); ctx.strokeStyle='#aa6633'; ctx.strokeRect(plat.x, sy, plat.w, 10); ctx.setLineDash([]); }
                else if (plat.type === 'moving') { ctx.fillStyle = '#4488cc'; ctx.fillRect(plat.x, sy, plat.w, 12); ctx.fillStyle = '#55aaee'; ctx.fillRect(plat.x, sy, plat.w, 4); ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(plat.x+5,sy+6,6,3); ctx.fillRect(plat.x+plat.w-11,sy+6,6,3); }
                else if (plat.type === 'vanishing') { var va = plat.vanishTimer > 0 ? Math.max(0.2, plat.vanishTimer/60) : 1; ctx.globalAlpha = va; ctx.fillStyle = '#aa66cc'; ctx.fillRect(plat.x, sy, plat.w, 10); ctx.fillStyle = '#cc88ee'; ctx.fillRect(plat.x, sy, plat.w, 3); ctx.globalAlpha = 1; }
                else { ctx.fillStyle = '#44aa55'; ctx.fillRect(plat.x, sy, plat.w, 12); ctx.fillStyle = '#55cc66'; ctx.fillRect(plat.x, sy, plat.w, 4); ctx.fillStyle = '#338844'; ctx.fillRect(plat.x+3, sy+8, 8, 4); ctx.fillRect(plat.x+plat.w-11, sy+8, 8, 4); }
                // Landing
                if (player.vy > 0 && player.y+16 >= sy && player.y+16 <= sy+16 && player.x+10 > plat.x && player.x-10 < plat.x+plat.w) {
                    if (plat.type === 'breaking') { plat.broken = true; }
                    else if (plat.type === 'vanishing') { player.vy = jumpV; player.y = sy - 16; if (plat.vanishTimer <= 0) plat.vanishTimer = 60; }
                    else { player.vy = jumpV; player.y = sy - 16; }
                }
            }
            // Springs
            for (var si = 0; si < springs.length; si++) {
                var sp = springs[si], plat2 = platforms[sp.platIdx]; if (!plat2 || plat2.broken) continue;
                var spx = plat2.x + plat2.w/2, spy = plat2.y - scrollY - 8;
                ctx.fillStyle = '#dd7700'; ctx.fillRect(spx-5, spy, 10, 8);
                ctx.strokeStyle = '#cc6600'; ctx.lineWidth = 2;
                ctx.beginPath(); for(var sw=0;sw<3;sw++){ctx.moveTo(spx-4,spy+sw*3);ctx.lineTo(spx+4,spy+sw*3+1.5);} ctx.stroke(); ctx.lineWidth = 1;
                if (player.vy > 0 && player.y+16 >= spy && player.y+16 <= spy+12 && Math.abs(player.x - spx) < 15) { player.vy = sp.bounce; }
            }
            // Jetpack pickups
            for (var ji = 0; ji < jetpack.pickups.length; ji++) {
                var jp = jetpack.pickups[ji]; if (jp.collected) continue;
                var jpPlat = platforms[jp.platIdx]; if (!jpPlat || jpPlat.broken) continue;
                var jpx = jpPlat.x + jpPlat.w * 0.7, jpy = jpPlat.y - scrollY - 14;
                ctx.fillStyle = '#ff6600'; ctx.fillRect(jpx-6, jpy, 12, 14); ctx.fillStyle = '#ffaa00'; ctx.fillRect(jpx-4, jpy+2, 8, 4);
                ctx.fillStyle = '#ff3300'; ctx.beginPath(); ctx.moveTo(jpx-3, jpy+14); ctx.lineTo(jpx, jpy+20); ctx.lineTo(jpx+3, jpy+14); ctx.fill();
                if (Math.abs(player.x - jpx) < 18 && Math.abs(player.y - jpy) < 22) { jp.collected = true; jetpack.active = true; jetpack.fuel = 1; }
            }
            // Monsters
            for (var mi = 0; mi < monsters.length; mi++) {
                var mon2 = monsters[mi]; if (!mon2.alive) continue;
                var monY = mon2.y - scrollY;
                if (monY > h + 100 || monY < -100) continue;
                mon2.x += mon2.vx; if (mon2.x < 10 || mon2.x > w - 40) mon2.vx *= -1;
                ctx.fillStyle = '#aa3355'; ctx.beginPath(); ctx.arc(mon2.x+15, monY+10, 15, Math.PI, 0); ctx.fill(); ctx.fillRect(mon2.x, monY+10, 30, 15);
                ctx.fillStyle = '#fff'; for(var ti=0;ti<4;ti++) ctx.fillRect(mon2.x+4+ti*7, monY+22, 4, 5);
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mon2.x+8, monY+6, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(mon2.x+22, monY+6, 5, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(mon2.x+9, monY+6, 2.5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(mon2.x+23, monY+6, 2.5, 0, Math.PI*2); ctx.fill();
                if (player.vy > 0 && player.y+16 >= monY && player.y < monY+10 && player.x > mon2.x-10 && player.x < mon2.x+40) { mon2.alive = false; player.vy = jumpV; }
                else if (Math.abs(player.x - (mon2.x+15)) < 20 && Math.abs(player.y - monY) < 20) init();
            }
            // Projectiles
            for (var pi = projectiles.length-1; pi >= 0; pi--) {
                var pr = projectiles[pi]; pr.x += pr.vx; pr.y += pr.vy; pr.life -= 0.02;
                if (pr.isFlame) { pr.life -= 0.03; ctx.globalAlpha = pr.life; ctx.fillStyle = '#ff6600'; ctx.beginPath(); ctx.arc(pr.x, pr.y, 3*pr.life, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
                else if (pr.isBullet) {
                    ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(pr.x, pr.y, 3, 0, Math.PI*2); ctx.fill();
                    // Hit monsters
                    for (var mh = 0; mh < monsters.length; mh++) { var mt = monsters[mh]; if (!mt.alive) continue; var mty = mt.y - scrollY; if (Math.abs(pr.x - (mt.x+15)) < 20 && Math.abs(pr.y - mty) < 20) { mt.alive = false; pr.life = 0; break; } }
                }
                if (pr.life <= 0 || pr.y < -20 || pr.y > h+20) { projectiles.splice(pi, 1); }
            }
            if (player.y > h + 50) init();
            // Draw player (doodler)
            if (jetpack.active) { ctx.fillStyle = '#666'; ctx.fillRect(player.x-14, player.y-2, 6, 12); ctx.fillRect(player.x+8, player.y-2, 6, 12); }
            ctx.fillStyle = '#44aa55'; ctx.beginPath(); ctx.arc(player.x, player.y-8, 12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#55cc66'; ctx.beginPath(); ctx.arc(player.x + (player.dir > 0 ? 10 : -10), player.y-6, 5, 0, Math.PI*2); ctx.fill();
            // Eyes that look in movement direction
            var eyeOff = player.dir > 0 ? 1 : -1;
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(player.x-3, player.y-11, 4.5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(player.x+5, player.y-11, 4.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(player.x-3+eyeOff, player.y-11, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(player.x+5+eyeOff, player.y-11, 2, 0, Math.PI*2); ctx.fill();
            // Hat
            ctx.fillStyle = '#44bb44'; ctx.fillRect(player.x-10, player.y-21, 20, 4); ctx.fillRect(player.x-6, player.y-27, 12, 7);
            ctx.fillStyle = '#338833'; ctx.fillRect(player.x-8, player.y+4, 16, 14);
            var legOff = Math.sin(player.frame * 4) * 3;
            ctx.fillStyle = '#44aa55'; ctx.fillRect(player.x-7, player.y+18, 5, 6+legOff); ctx.fillRect(player.x+2, player.y+18, 5, 6-legOff);
            // Score
            ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'left'; ctx.fillText('Score: ' + score, 10, 25);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }
    // ═══════════════════════════════════════════════════════════
    // 19. SKIING
    // ═══════════════════════════════════════════════════════════
    function skiing() {
        var skier, obstacles, scrollSpeed = 3, score;
        function init() {
            var w = canvas.width;
            skier = {x: w/2, y: canvas.height*0.3}; obstacles = []; score = 0;
            for (var i = 0; i < 25; i++) obstacles.push({x: rand(30, w-30), y: rand(-200, canvas.height+200), type: Math.random()<0.5?'tree':'flag'});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#f0f4ff'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(200,210,230,0.3)'; for (var s = 0; s < 40; s++) ctx.fillRect(rand(0,w), rand(0,h), rand(30,100), 2);
            for (var i = obstacles.length-1; i >= 0; i--) {
                var o = obstacles[i]; o.y -= scrollSpeed;
                if (o.y < -50) { o.y = h + rand(20, 100); o.x = rand(30, w-30); }
                if (o.type === 'tree') {
                    ctx.fillStyle = '#5a3825'; ctx.fillRect(o.x-3, o.y, 6, 18);
                    ctx.fillStyle = '#2a7a3e'; ctx.beginPath(); ctx.moveTo(o.x, o.y-18); ctx.lineTo(o.x-14, o.y+4); ctx.lineTo(o.x+14, o.y+4); ctx.closePath(); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(o.x, o.y-10); ctx.lineTo(o.x-10, o.y+10); ctx.lineTo(o.x+10, o.y+10); ctx.closePath(); ctx.fill();
                } else {
                    ctx.fillStyle = '#cc2244'; ctx.fillRect(o.x-1.5, o.y-15, 3, 30);
                    ctx.fillStyle = '#cc2244'; ctx.beginPath(); ctx.moveTo(o.x, o.y-15); ctx.lineTo(o.x+12, o.y-10); ctx.lineTo(o.x, o.y-5); ctx.closePath(); ctx.fill();
                }
            }
            var nearest = null, nearDist = 99999;
            for (var i2 = 0; i2 < obstacles.length; i2++) { var o2 = obstacles[i2]; if (o2.y > skier.y - 150 && o2.y < skier.y + 30 && o2.type === 'tree') { var d = Math.abs(o2.x - skier.x); if (d < nearDist) { nearDist = d; nearest = o2; } } }
            if (nearest && nearDist < 40) skier.x += (nearest.x > skier.x ? -3 : 3);
            else { var nearFlag = null, nfd = 99999; for(var i3=0;i3<obstacles.length;i3++){var o3=obstacles[i3];if(o3.type==='flag'&&o3.y>skier.y-80&&o3.y<skier.y+30){var d2=Math.abs(o3.x-skier.x);if(d2<nfd){nfd=d2;nearFlag=o3;}}} if(nearFlag) skier.x+=(nearFlag.x-skier.x)*0.03; }
            skier.x = Math.max(20, Math.min(w-20, skier.x));
            ctx.fillStyle = '#0066bb'; ctx.beginPath(); ctx.arc(skier.x, skier.y-10, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#cc5500'; ctx.fillRect(skier.x-6, skier.y-2, 12, 16);
            ctx.fillStyle = '#333'; ctx.fillRect(skier.x-8, skier.y+14, 5, 10); ctx.fillRect(skier.x+3, skier.y+14, 5, 10);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(skier.x-5, skier.y+24); ctx.lineTo(skier.x-5, skier.y+40); ctx.stroke(); ctx.beginPath(); ctx.moveTo(skier.x+5, skier.y+24); ctx.lineTo(skier.x+5, skier.y+40); ctx.stroke();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 20. LUNAR LANDER
    // ═══════════════════════════════════════════════════════════
    function lunarLander() {
        var lander, terrain, particles, padX, padW;
        function init() {
            var w = canvas.width, h = canvas.height;
            lander = {x: w/2, y: 60, vx: rand(-0.5,0.5), vy: 0, fuel: 200, thrust: false, angle: 0};
            terrain = []; var ty = h*0.7;
            padW = 80; padX = rand(w*0.2, w*0.8-padW);
            for (var x = 0; x <= w; x += 15) { if (x >= padX && x <= padX+padW) terrain.push({x:x, y:ty}); else terrain.push({x:x, y:ty + rand(-40,40)}); }
            particles = [];
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (var s = 0; s < 30; s++) ctx.fillRect((s*137.3)%w, (s*271.7)%h*0.5, 2, 2);
            ctx.fillStyle = '#c8b888'; ctx.beginPath(); ctx.moveTo(0, h); for(var t=0;t<terrain.length;t++) ctx.lineTo(terrain[t].x, terrain[t].y); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#229944'; ctx.fillRect(padX, terrain[0].y-4, padW, 8);
            var targetX = padX + padW/2;
            if (lander.y < canvas.height*0.4) { if (Math.abs(lander.x - targetX) > 20) lander.angle = lander.x > targetX ? -0.15 : 0.15; else lander.angle = 0; lander.thrust = lander.vy > 1; }
            else { lander.angle = (targetX - lander.x) * 0.001; lander.thrust = lander.vy > 0.8; }
            lander.angle = Math.max(-0.3, Math.min(0.3, lander.angle));
            lander.vy += 0.02;
            if (lander.thrust && lander.fuel > 0) { lander.vx += Math.sin(lander.angle)*0.06; lander.vy -= 0.06; lander.fuel--; for(var p2=0;p2<2;p2++) particles.push({x:lander.x,y:lander.y+12,vx:rand(-1,1)-Math.sin(lander.angle)*2,vy:rand(1,3),life:1,color:'#dd7700'}); }
            lander.x += lander.vx; lander.y += lander.vy;
            if (lander.x < 10) lander.x = 10; if (lander.x > w-10) lander.x = w-10;
            var groundY = canvas.height*0.7; for(var t2=0;t2<terrain.length-1;t2++){if(lander.x>=terrain[t2].x&&lander.x<terrain[t2+1].x){groundY=terrain[t2].y;break;}}
            if (lander.y+12 >= groundY) init();
            for(var pi=particles.length-1;pi>=0;pi--){var pp=particles[pi];pp.x+=pp.vx;pp.y+=pp.vy;pp.life-=0.04;if(pp.life<=0){particles.splice(pi,1);continue;}ctx.globalAlpha=pp.life;ctx.fillStyle=pp.color;ctx.beginPath();ctx.arc(pp.x,pp.y,3*pp.life,0,Math.PI*2);ctx.fill();}
            ctx.globalAlpha=1;
            ctx.save(); ctx.translate(lander.x, lander.y); ctx.rotate(lander.angle);
            ctx.fillStyle = '#888'; ctx.fillRect(-10, -8, 20, 16); ctx.fillStyle = '#aaa'; ctx.fillRect(-6, -14, 12, 8);
            ctx.fillStyle = '#666'; ctx.fillRect(-14, 8, 8, 6); ctx.fillRect(6, 8, 8, 6);
            if(lander.thrust){ctx.fillStyle='#dd7700';ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(4,8);ctx.lineTo(0,18+rand(0,6));ctx.closePath();ctx.fill();}
            ctx.restore();
            ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(10,10,104,14);ctx.fillStyle='#229944';ctx.fillRect(12,12,lander.fuel/2,10);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 21. PINBALL — lots of bumpers, rails, flippers
    // ═══════════════════════════════════════════════════════════
    function pinball() {
        var ball, bumpers, flippers, sparks, score, rails, slingshots;
        var bumperColors = ['#cc2244','#0066bb','#229944','#dd7700','#aa44aa','#ccaa00','#cc5588','#008888'];
        function init() {
            var w = canvas.width, h = canvas.height;
            ball = {x: w*0.7, y: 60, vx: rand(-1,1), vy: 1, r: 8};
            bumpers = []; score = 0; sparks = []; rails = []; slingshots = [];
            // Lots of bumpers in a grid-like pattern
            for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) {
                var bx = w*0.15 + c*(w*0.7/3) + (r%2)*(w*0.7/6);
                var by = h*0.12 + r*(h*0.55/4);
                bumpers.push({x: bx+rand(-15,15), y: by+rand(-10,10), r: rand(16,30), color: bumperColors[randInt(0,bumperColors.length)], flash: 0});
            }
            // Extra scattered bumpers
            for (var i = 0; i < 6; i++) bumpers.push({x: rand(60,w-60), y: rand(h*0.15,h*0.65), r: rand(12,22), color: bumperColors[randInt(0,bumperColors.length)], flash: 0});
            // Slingshots (triangular bumpers on sides)
            slingshots.push({x: 50, y: h*0.55, points: [{x:30,y:h*0.45},{x:30,y:h*0.65},{x:70,y:h*0.55}], color: '#cc5500'});
            slingshots.push({x: w-50, y: h*0.55, points: [{x:w-30,y:h*0.45},{x:w-30,y:h*0.65},{x:w-70,y:h*0.55}], color: '#cc5500'});
            // Rails (guide paths)
            rails.push({x1: w*0.15, y1: h*0.02, x2: w*0.05, y2: h*0.3});
            rails.push({x1: w*0.85, y1: h*0.02, x2: w*0.95, y2: h*0.3});
            rails.push({x1: w*0.3, y1: h*0.7, x2: w*0.15, y2: h*0.85});
            rails.push({x1: w*0.7, y1: h*0.7, x2: w*0.85, y2: h*0.85});
            flippers = [{x: w*0.33, y: h-70, angle: 0.3, side: -1}, {x: w*0.67, y: h-70, angle: -0.3, side: 1}];
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#f8f4f0'; ctx.fillRect(0, 0, w, h);
            // Table border
            ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(8, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w-25, 0); ctx.lineTo(w-8, h); ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.03)';
            for (var gx = 0; gx < w; gx += 20) for (var gy = 0; gy < h; gy += 20) ctx.fillRect(gx, gy, 1, 1);
            // Rails
            ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 3;
            for (var ri = 0; ri < rails.length; ri++) { var rl = rails[ri]; ctx.beginPath(); ctx.moveTo(rl.x1, rl.y1); ctx.lineTo(rl.x2, rl.y2); ctx.stroke(); }
            // Slingshots
            for (var si2 = 0; si2 < slingshots.length; si2++) {
                var sl = slingshots[si2]; ctx.fillStyle = sl.color; ctx.globalAlpha = 0.3;
                ctx.beginPath(); ctx.moveTo(sl.points[0].x, sl.points[0].y); ctx.lineTo(sl.points[1].x, sl.points[1].y); ctx.lineTo(sl.points[2].x, sl.points[2].y); ctx.closePath(); ctx.fill();
                ctx.globalAlpha = 1; ctx.strokeStyle = sl.color; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(sl.points[0].x, sl.points[0].y); ctx.lineTo(sl.points[1].x, sl.points[1].y); ctx.lineTo(sl.points[2].x, sl.points[2].y); ctx.closePath(); ctx.stroke();
                // Slingshot bounce
                var sx = (sl.points[0].x+sl.points[1].x+sl.points[2].x)/3, sy = (sl.points[0].y+sl.points[1].y+sl.points[2].y)/3;
                var sd = Math.hypot(ball.x-sx, ball.y-sy);
                if (sd < 40) { var snx=(ball.x-sx)/sd, sny=(ball.y-sy)/sd; ball.vx=snx*5; ball.vy=sny*5; score+=5; }
            }
            // Bumpers with glow
            for (var i = 0; i < bumpers.length; i++) {
                var bm = bumpers[i];
                if (bm.flash > 0) { bm.flash -= 0.05; ctx.fillStyle = '#fff'; ctx.globalAlpha = bm.flash; ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.r+8, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
                ctx.fillStyle = bm.color; ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.r, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(bm.x-bm.r*0.25, bm.y-bm.r*0.25, bm.r*0.4, 0, Math.PI*2); ctx.fill();
                // Outer ring
                ctx.strokeStyle = bm.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.r+5, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
                var dx = ball.x-bm.x, dy = ball.y-bm.y, dist = Math.hypot(dx, dy);
                if (dist < bm.r + ball.r) {
                    var nx = dx/dist, ny = dy/dist;
                    ball.vx = nx * 5; ball.vy = ny * 5;
                    ball.x = bm.x + nx*(bm.r+ball.r+1); ball.y = bm.y + ny*(bm.r+ball.r+1);
                    score += 10; bm.flash = 1;
                    for(var sk=0;sk<6;sk++){var a=rand(0,Math.PI*2);sparks.push({x:ball.x,y:ball.y,vx:Math.cos(a)*rand(1,4),vy:Math.sin(a)*rand(1,4),life:1,color:bm.color,size:rand(2,5)});}
                }
            }
            // Flippers
            for (var f = 0; f < flippers.length; f++) {
                var fl = flippers[f]; ctx.fillStyle = '#555'; ctx.save(); ctx.translate(fl.x, fl.y); ctx.rotate(fl.angle);
                ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(fl.side*55, -4); ctx.lineTo(fl.side*55, 4); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(fl.side*55, -4); ctx.lineTo(fl.side*55, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
                ctx.restore();
                ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(fl.x, fl.y, 6, 0, Math.PI*2); ctx.fill();
            }
            if (ball.y > h-110 && ball.vy > 0) { flippers[0].angle = -0.5; flippers[1].angle = 0.5; ball.vy = -Math.abs(ball.vy)*1.1 - 2; score += 5; }
            else { flippers[0].angle += (0.3-flippers[0].angle)*0.1; flippers[1].angle += (-0.3-flippers[1].angle)*0.1; }
            // Physics
            ball.vy += 0.08; ball.x += ball.vx; ball.y += ball.vy; ball.vx *= 0.998;
            if (ball.x < 20+ball.r) { ball.x = 20+ball.r; ball.vx = Math.abs(ball.vx); }
            if (ball.x > w-20-ball.r) { ball.x = w-20-ball.r; ball.vx = -Math.abs(ball.vx); }
            if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
            if (ball.y > h + 30) init();
            // Sparks
            for(var si=sparks.length-1;si>=0;si--){var sp=sparks[si];sp.x+=sp.vx;sp.y+=sp.vy;sp.life-=0.05;if(sp.life<=0){sparks.splice(si,1);continue;}ctx.globalAlpha=sp.life;ctx.fillStyle=sp.color;ctx.beginPath();ctx.arc(sp.x,sp.y,sp.size*sp.life,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
            // Ball with trail
            ctx.fillStyle = 'rgba(136,136,136,0.15)'; ctx.beginPath(); ctx.arc(ball.x-ball.vx*2, ball.y-ball.vy*2, ball.r*0.8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(ball.x-2, ball.y-2, ball.r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center'; ctx.fillText(score, w/2, 35);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 22. TANKS — 8 tanks, obstacles, craters
    // ═══════════════════════════════════════════════════════════
    function tanks() {
        var tanks2, bullets, explosions, walls, craters, moveTimer;
        var tankColors = ['#229944','#0066bb','#cc7700','#cc2244','#aa44aa','#008888','#887722','#664488'];
        function init() {
            var w = canvas.width, h = canvas.height;
            tanks2 = [];
            for (var i = 0; i < 8; i++) tanks2.push({x:rand(60,w-60),y:rand(60,h-60),angle:rand(0,Math.PI*2),turret:rand(0,Math.PI*2),color:tankColors[i],hp:5,moveDir:rand(0,Math.PI*2),moveTimer2:0});
            bullets = []; explosions = []; craters = []; moveTimer = Date.now();
            walls = [];
            // Scatter wall obstacles (buildings, barriers)
            for (var wi = 0; wi < 12; wi++) walls.push({x:rand(40,w-80),y:rand(40,h-80),w:rand(30,70),h:rand(30,70),color:'rgba(0,0,0,0.12)'});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#f0ece4'; ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0,0,0,0.03)'; ctx.lineWidth = 1;
            for (var gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
            for (var gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
            // Craters
            for (var ci = 0; ci < craters.length; ci++) { var cr = craters[ci]; ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.beginPath(); ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=1; ctx.stroke(); }
            // Walls
            for (var wi2 = 0; wi2 < walls.length; wi2++) { var wl = walls[wi2]; ctx.fillStyle = wl.color; ctx.fillRect(wl.x, wl.y, wl.w, wl.h); ctx.fillStyle='rgba(0,0,0,0.04)'; ctx.fillRect(wl.x, wl.y, wl.w, 4); }
            // Update tanks
            if (Date.now()-moveTimer>80) {
                moveTimer = Date.now();
                for (var i = 0; i < tanks2.length; i++) {
                    var t = tanks2[i]; if (t.hp<=0) continue;
                    if (Math.random()<0.06) t.moveDir = rand(0,Math.PI*2);
                    var nx = t.x+Math.cos(t.moveDir)*1.8, ny = t.y+Math.sin(t.moveDir)*1.8;
                    // Wall collision
                    var blocked = false;
                    for (var wc=0;wc<walls.length;wc++){var ww=walls[wc];if(nx>ww.x-15&&nx<ww.x+ww.w+15&&ny>ww.y-15&&ny<ww.y+ww.h+15){blocked=true;break;}}
                    if(!blocked&&nx>30&&nx<w-30&&ny>30&&ny<h-30){t.x=nx;t.y=ny;}else t.moveDir=rand(0,Math.PI*2);
                    var bestDist = 99999, bestAngle = t.turret;
                    for (var j=0;j<tanks2.length;j++){if(j===i||tanks2[j].hp<=0)continue;var d=Math.hypot(tanks2[j].x-t.x,tanks2[j].y-t.y);if(d<bestDist){bestDist=d;bestAngle=Math.atan2(tanks2[j].y-t.y,tanks2[j].x-t.x);}}
                    var diff = bestAngle-t.turret; while(diff>Math.PI)diff-=Math.PI*2; while(diff<-Math.PI)diff+=Math.PI*2; t.turret+=diff*0.1;
                    if (Math.random()<0.025) bullets.push({x:t.x+Math.cos(t.turret)*22,y:t.y+Math.sin(t.turret)*22,vx:Math.cos(t.turret)*5,vy:Math.sin(t.turret)*5,life:80,owner:i});
                }
            }
            // Draw tanks
            for (var i2=0;i2<tanks2.length;i2++){
                var tk=tanks2[i2];
                if(tk.hp<=0){ctx.fillStyle='#999';ctx.fillRect(tk.x-14,tk.y-10,28,20);craters.length<40&&Math.random()<0.01&&craters.push({x:tk.x,y:tk.y,r:rand(12,20)});continue;}
                ctx.fillStyle=tk.color; ctx.save(); ctx.translate(tk.x,tk.y); ctx.rotate(tk.moveDir);
                ctx.fillRect(-16,-12,32,24);
                // Treads
                ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(-16,-12,32,4); ctx.fillRect(-16,8,32,4);
                ctx.restore();
                // Turret body
                ctx.fillStyle=tk.color; ctx.beginPath(); ctx.arc(tk.x,tk.y,10,0,Math.PI*2); ctx.fill();
                ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(tk.x-2,tk.y-2,5,0,Math.PI*2); ctx.fill();
                // Barrel
                ctx.strokeStyle=tk.color; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(tk.x,tk.y); ctx.lineTo(tk.x+Math.cos(tk.turret)*22,tk.y+Math.sin(tk.turret)*22); ctx.stroke();
                // HP bar
                ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(tk.x-15,tk.y-22,30,4);ctx.fillStyle=tk.color;ctx.fillRect(tk.x-15,tk.y-22,30*(tk.hp/5),4);
            }
            // Bullets
            for (var b=bullets.length-1;b>=0;b--){var bl=bullets[b];bl.x+=bl.vx;bl.y+=bl.vy;bl.life--;ctx.fillStyle='#555';ctx.beginPath();ctx.arc(bl.x,bl.y,3.5,0,Math.PI*2);ctx.fill();if(bl.life<=0||bl.x<0||bl.x>w||bl.y<0||bl.y>h){bullets.splice(b,1);continue;}
                for(var t2=0;t2<tanks2.length;t2++){if(t2===bl.owner||tanks2[t2].hp<=0)continue;if(Math.hypot(bl.x-tanks2[t2].x,bl.y-tanks2[t2].y)<18){tanks2[t2].hp--;bullets.splice(b,1);craters.push({x:bl.x,y:bl.y,r:rand(8,14)});for(var sk=0;sk<10;sk++){var a=rand(0,Math.PI*2);explosions.push({x:bl.x,y:bl.y,vx:Math.cos(a)*rand(1,4),vy:Math.sin(a)*rand(1,4),life:1,color:tanks2[t2].color});}break;}}
                // Wall collision
                for(var wh=0;wh<walls.length;wh++){var ww2=walls[wh];if(bl.x>ww2.x&&bl.x<ww2.x+ww2.w&&bl.y>ww2.y&&bl.y<ww2.y+ww2.h){bullets.splice(b,1);break;}}
            }
            for(var e=explosions.length-1;e>=0;e--){var ex=explosions[e];ex.x+=ex.vx;ex.y+=ex.vy;ex.life-=0.04;if(ex.life<=0){explosions.splice(e,1);continue;}ctx.globalAlpha=ex.life;ctx.fillStyle=ex.color;ctx.beginPath();ctx.arc(ex.x,ex.y,5*ex.life,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
            var alive2=0;for(var a2=0;a2<tanks2.length;a2++)if(tanks2[a2].hp>0)alive2++;
            if(alive2<=1) init();
            if(craters.length>50) craters.splice(0,10);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 23. TOWER DEFENSE — long winding path, many towers
    // ═══════════════════════════════════════════════════════════
    function towerDefense() {
        var path, towers, enemies, bullets, spawnTimer, wave;
        var towerColors = ['#0066bb','#cc2244','#229944','#dd7700','#aa44aa','#008888'];
        function init() {
            var w = canvas.width, h = canvas.height;
            // Generate a long winding path that fills the screen
            path = [{x: 0, y: h*0.15}];
            var px = 0, py = h*0.15, goRight = true;
            while (py < h - 60) {
                if (goRight) { px = w - 60; path.push({x: px, y: py}); }
                else { px = 60; path.push({x: px, y: py}); }
                py += h * 0.18;
                path.push({x: px, y: Math.min(py, h-30)});
                goRight = !goRight;
            }
            path.push({x: goRight ? w + 20 : -20, y: py});
            towers = [];
            // Place towers along the path
            for (var i = 0; i < path.length - 1; i++) {
                var mx = (path[i].x + path[i+1].x) / 2, my = (path[i].y + path[i+1].y) / 2;
                var offsets = [{dx:60,dy:0},{dx:-60,dy:0},{dx:0,dy:50},{dx:0,dy:-50},{dx:40,dy:40},{dx:-40,dy:-40}];
                for (var o = 0; o < 3; o++) {
                    var off = offsets[randInt(0, offsets.length)];
                    var tx = mx + off.dx + rand(-15,15), ty = my + off.dy + rand(-15,15);
                    tx = Math.max(20, Math.min(w-20, tx)); ty = Math.max(20, Math.min(h-20, ty));
                    towers.push({x: tx, y: ty, range: rand(90,140), color: towerColors[randInt(0,towerColors.length)], shootTimer: 0, level: randInt(1,3)});
                }
            }
            enemies = []; bullets = []; spawnTimer = Date.now(); wave = 0;
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#f0ece4'; ctx.fillRect(0, 0, w, h);
            // Draw path (thick road)
            ctx.strokeStyle = '#d4c8a0'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); for(var p=0;p<path.length;p++){if(p===0)ctx.moveTo(path[p].x,path[p].y);else ctx.lineTo(path[p].x,path[p].y);} ctx.stroke();
            ctx.strokeStyle = '#c8b888'; ctx.lineWidth = 28;
            ctx.beginPath(); for(var p2=0;p2<path.length;p2++){if(p2===0)ctx.moveTo(path[p2].x,path[p2].y);else ctx.lineTo(path[p2].x,path[p2].y);} ctx.stroke();
            // Path center line
            ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 2; ctx.setLineDash([6,6]);
            ctx.beginPath(); for(var p3=0;p3<path.length;p3++){if(p3===0)ctx.moveTo(path[p3].x,path[p3].y);else ctx.lineTo(path[p3].x,path[p3].y);} ctx.stroke();
            ctx.setLineDash([]);
            // Towers
            for (var t=0;t<towers.length;t++){
                var tw=towers[t], sz = 10 + tw.level*3;
                ctx.fillStyle=tw.color; ctx.fillRect(tw.x-sz,tw.y-sz,sz*2,sz*2);
                ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(tw.x-sz,tw.y-sz,sz*2,4);
                ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(tw.x-sz,tw.y+sz-4,sz*2,4);
                // Range ring
                ctx.strokeStyle=tw.color;ctx.lineWidth=1;ctx.globalAlpha=0.08;ctx.beginPath();ctx.arc(tw.x,tw.y,tw.range,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
                // Level dots
                for(var ld=0;ld<tw.level;ld++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(tw.x-4+ld*4,tw.y-sz-5,2,0,Math.PI*2);ctx.fill();}
                // Shoot nearest enemy
                var bestE=null,bestD=99999;for(var e=0;e<enemies.length;e++){var d=Math.hypot(enemies[e].x-tw.x,enemies[e].y-tw.y);if(d<tw.range&&d<bestD){bestD=d;bestE=enemies[e];}}
                if(bestE&&Date.now()-tw.shootTimer>Math.max(150,400-tw.level*80)){tw.shootTimer=Date.now();var a=Math.atan2(bestE.y-tw.y,bestE.x-tw.x);bullets.push({x:tw.x,y:tw.y,vx:Math.cos(a)*(4+tw.level),vy:Math.sin(a)*(4+tw.level),life:30,color:tw.color,dmg:tw.level});}
            }
            // Spawn enemies
            if(Date.now()-spawnTimer>400){spawnTimer=Date.now();var hp=3+Math.floor(wave/20);enemies.push({x:path[0].x,y:path[0].y,pathIdx:0,pathT:0,hp:hp,maxHp:hp,speed:rand(0.8,1.8),color:'#cc5555',size:rand(6,10)});wave++;}
            // Move enemies along path
            for(var e2=enemies.length-1;e2>=0;e2--){var en=enemies[e2];if(en.pathIdx>=path.length-1){enemies.splice(e2,1);continue;}
                var target=path[en.pathIdx+1];var dx=target.x-en.x,dy=target.y-en.y,dist=Math.hypot(dx,dy);
                if(dist<5)en.pathIdx++;else{en.x+=dx/dist*en.speed*2;en.y+=dy/dist*en.speed*2;}
                ctx.fillStyle=en.color;ctx.beginPath();ctx.arc(en.x,en.y,en.size,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(en.x-12,en.y-en.size-6,24,4);ctx.fillStyle='#44cc44';ctx.fillRect(en.x-12,en.y-en.size-6,24*(en.hp/en.maxHp),4);
            }
            // Bullets
            for(var b=bullets.length-1;b>=0;b--){var bl=bullets[b];bl.x+=bl.vx;bl.y+=bl.vy;bl.life--;ctx.fillStyle=bl.color;ctx.beginPath();ctx.arc(bl.x,bl.y,3,0,Math.PI*2);ctx.fill();
                if(bl.life<=0){bullets.splice(b,1);continue;}
                for(var e3=enemies.length-1;e3>=0;e3--){if(Math.hypot(bl.x-enemies[e3].x,bl.y-enemies[e3].y)<enemies[e3].size+5){enemies[e3].hp-=bl.dmg;if(enemies[e3].hp<=0)enemies.splice(e3,1);bullets.splice(b,1);break;}}
            }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 24. MAZE RUNNER — 3 simultaneous runners
    // ═══════════════════════════════════════════════════════════
    function mazeRunner() {
        var cs2, gW, gH, maze, runners, target, moveTimer, moveInt = 50;
        var runnerColors = ['#229944','#0066bb','#cc7700'];
        function init() {
            cs2 = Math.max(14, Math.min(24, Math.floor(canvas.width/55)));
            gW = Math.floor(canvas.width/cs2); gH = Math.floor(canvas.height/cs2);
            if(gW%2===0)gW--; if(gH%2===0)gH--;
            maze = []; for(var y=0;y<gH;y++){maze[y]=[];for(var x=0;x<gW;x++)maze[y][x]=1;}
            function carve(x,y){maze[y][x]=0;var dirs2=[[0,-2],[0,2],[-2,0],[2,0]];for(var i=dirs2.length-1;i>0;i--){var j=randInt(0,i+1),tmp=dirs2[i];dirs2[i]=dirs2[j];dirs2[j]=tmp;}for(var d=0;d<dirs2.length;d++){var nx=x+dirs2[d][0],ny=y+dirs2[d][1];if(nx>=0&&nx<gW&&ny>=0&&ny<gH&&maze[ny][nx]===1){maze[y+dirs2[d][1]/2][x+dirs2[d][0]/2]=0;carve(nx,ny);}}}
            carve(1,1);
            target = {x:gW-2,y:gH-2}; maze[target.y][target.x]=0;
            runners = [];
            var starts = [{x:1,y:1},{x:1,y:gH-2},{x:gW-2,y:1}];
            for (var r = 0; r < 3; r++) {
                var st = starts[r]; maze[st.y][st.x] = 0;
                // BFS from start to target
                var queue = [{x:st.x,y:st.y,path:[]}], visited = {}; visited[st.x+','+st.y] = true;
                var foundPath = [];
                while(queue.length){var cur=queue.shift();if(cur.x===target.x&&cur.y===target.y){foundPath=cur.path;break;}
                    var moves=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
                    for(var m=0;m<moves.length;m++){var nx2=cur.x+moves[m].x,ny2=cur.y+moves[m].y;if(nx2>=0&&nx2<gW&&ny2>=0&&ny2<gH&&!maze[ny2][nx2]&&!visited[nx2+','+ny2]){visited[nx2+','+ny2]=true;queue.push({x:nx2,y:ny2,path:cur.path.concat({x:nx2,y:ny2})});}}
                }
                runners.push({x:st.x, y:st.y, path: foundPath, pathIdx: 0, color: runnerColors[r], trail: [], done: false});
            }
            moveTimer = Date.now();
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            for(var y=0;y<gH;y++) for(var x=0;x<gW;x++){if(maze[y][x])ctx.fillStyle='rgba(0,0,0,0.15)';else ctx.fillStyle='rgba(0,0,0,0.01)';ctx.fillRect(x*cs2,y*cs2,cs2,cs2);}
            // Draw all runner trails
            for (var ri = 0; ri < runners.length; ri++) {
                var rn = runners[ri];
                for(var t=0;t<rn.trail.length;t++){ctx.fillStyle=rn.color;ctx.globalAlpha=0.08+0.12*(t/rn.trail.length);ctx.fillRect(rn.trail[t].x*cs2+2,rn.trail[t].y*cs2+2,cs2-4,cs2-4);}
                ctx.globalAlpha=1;
            }
            // Target
            var pulse = 1 + Math.sin(Date.now()*0.005)*0.15;
            ctx.fillStyle = '#cc2244'; ctx.beginPath(); ctx.arc(target.x*cs2+cs2/2,target.y*cs2+cs2/2,cs2/3*pulse,0,Math.PI*2); ctx.fill();
            // Move runners
            if(Date.now()-moveTimer>moveInt){
                moveTimer=Date.now();
                var allDone = true;
                for (var ri2 = 0; ri2 < runners.length; ri2++) {
                    var rn2 = runners[ri2]; if (rn2.done) continue; allDone = false;
                    if (rn2.pathIdx < rn2.path.length) {
                        rn2.trail.push({x:rn2.x,y:rn2.y});
                        var next = rn2.path[rn2.pathIdx]; rn2.x = next.x; rn2.y = next.y; rn2.pathIdx++;
                        if(rn2.x===target.x&&rn2.y===target.y) rn2.done = true;
                    } else rn2.done = true;
                }
                if (allDone) init();
            }
            // Draw runners
            for (var ri3 = 0; ri3 < runners.length; ri3++) {
                var rn3 = runners[ri3];
                ctx.fillStyle = rn3.color; ctx.beginPath(); ctx.arc(rn3.x*cs2+cs2/2, rn3.y*cs2+cs2/2, cs2/3, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(rn3.x*cs2+cs2*0.4, rn3.y*cs2+cs2*0.35, cs2*0.08, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(rn3.x*cs2+cs2*0.6, rn3.y*cs2+cs2*0.35, cs2*0.08, 0, Math.PI*2); ctx.fill();
            }
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 25. BUBBLE SHOOTER
    // ═══════════════════════════════════════════════════════════
    function bubbleShooter() {
        var bubbles, shooter, bullet, bubR, cols2, rows2, shootTimer;
        var bubColors = ['#cc2244','#0066bb','#229944','#ccaa00','#aa44aa','#dd7700'];
        function init() {
            var w = canvas.width;
            bubR = Math.max(14, Math.min(22, Math.floor(w/50)));
            cols2 = Math.floor(w / (bubR*2)); rows2 = 8; bubbles = [];
            for(var r=0;r<rows2;r++) for(var c=0;c<cols2;c++){var offset=(r%2)*bubR;if(offset+c*bubR*2+bubR>w)continue;bubbles.push({x:offset+c*bubR*2+bubR,y:r*bubR*1.7+bubR+20,color:bubColors[randInt(0,bubColors.length)],alive:true});}
            shooter = {x:w/2,y:canvas.height-40,angle:-Math.PI/2}; bullet = null; shootTimer = Date.now();
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            for(var i=0;i<bubbles.length;i++){var b=bubbles[i];if(!b.alive)continue;ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,bubR-1,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(b.x-bubR*0.2,b.y-bubR*0.2,bubR*0.3,0,Math.PI*2);ctx.fill();}
            ctx.strokeStyle = '#555'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(shooter.x, shooter.y); ctx.lineTo(shooter.x+Math.cos(shooter.angle)*40, shooter.y+Math.sin(shooter.angle)*40); ctx.stroke();
            var anyAlive=false; for(var a=0;a<bubbles.length;a++)if(bubbles[a].alive){anyAlive=true;break;}
            if(!anyAlive){init();return;}
            if(!bullet){var targetB=null;for(var b2=0;b2<bubbles.length;b2++)if(bubbles[b2].alive){targetB=bubbles[b2];break;}if(targetB)shooter.angle=Math.atan2(targetB.y-shooter.y,targetB.x-shooter.x);if(Date.now()-shootTimer>500){shootTimer=Date.now();bullet={x:shooter.x,y:shooter.y,vx:Math.cos(shooter.angle)*6,vy:Math.sin(shooter.angle)*6,color:bubColors[randInt(0,bubColors.length)]};}}
            if(bullet){bullet.x+=bullet.vx;bullet.y+=bullet.vy;if(bullet.x<bubR||bullet.x>w-bubR)bullet.vx*=-1;if(bullet.y<0)bullet=null;else{ctx.fillStyle=bullet.color;ctx.beginPath();ctx.arc(bullet.x,bullet.y,bubR-1,0,Math.PI*2);ctx.fill();for(var b3=0;b3<bubbles.length;b3++){if(!bubbles[b3].alive)continue;if(Math.hypot(bullet.x-bubbles[b3].x,bullet.y-bubbles[b3].y)<bubR*1.8){bubbles[b3].alive=false;bullet=null;break;}}}}
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 26. FALLING SAND
    // ═══════════════════════════════════════════════════════════
    function fallingSand() {
        var cs2, gW, gH, grid, sources;
        var sandColors = ['#ccaa44','#ddbb55','#c89944','#bbaa33','#eebb44'];
        var waterColors = ['#4488cc','#5599dd','#3377bb'];
        function init() {
            cs2 = Math.max(4, Math.min(8, Math.floor(canvas.width/180)));
            gW = Math.floor(canvas.width/cs2); gH = Math.floor(canvas.height/cs2);
            grid = []; for(var y=0;y<gH;y++){grid[y]=[];for(var x=0;x<gW;x++)grid[y][x]=0;}
            sources = []; for(var s=0;s<5;s++) sources.push({x:randInt(Math.floor(gW*0.1),Math.floor(gW*0.9)),type:Math.random()<0.6?'sand':'water'});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            for(var s=0;s<sources.length;s++){var src=sources[s];if(!grid[0][src.x]){grid[0][src.x]=src.type==='sand'?sandColors[randInt(0,sandColors.length)]:waterColors[randInt(0,waterColors.length)];grid[0][src.x+'t']=src.type;}ctx.fillStyle=src.type==='sand'?'#ccaa44':'#4488cc';ctx.beginPath();ctx.arc(src.x*cs2+cs2/2,4,5,0,Math.PI*2);ctx.fill();}
            for(var y=gH-2;y>=0;y--) for(var x=0;x<gW;x++){if(!grid[y][x])continue;var type=grid[y][x+'t']||'sand';if(!grid[y+1][x]){grid[y+1][x]=grid[y][x];grid[y+1][x+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}else if(type==='sand'){if(x>0&&!grid[y+1][x-1]){grid[y+1][x-1]=grid[y][x];grid[y+1][(x-1)+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}else if(x<gW-1&&!grid[y+1][x+1]){grid[y+1][x+1]=grid[y][x];grid[y+1][(x+1)+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}}else{var lr=Math.random()<0.5?-1:1;if(x+lr>=0&&x+lr<gW&&!grid[y][x+lr]){grid[y][x+lr]=grid[y][x];grid[y][(x+lr)+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}else if(x>0&&!grid[y+1][x-1]){grid[y+1][x-1]=grid[y][x];grid[y+1][(x-1)+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}else if(x<gW-1&&!grid[y+1][x+1]){grid[y+1][x+1]=grid[y][x];grid[y+1][(x+1)+'t']=type;grid[y][x]=0;delete grid[y][x+'t'];}}}
            for(var y2=0;y2<gH;y2++) for(var x2=0;x2<gW;x2++){if(grid[y2][x2]){ctx.fillStyle=grid[y2][x2];ctx.fillRect(x2*cs2,y2*cs2,cs2,cs2);}}
            var filled=0;for(var y3=0;y3<gH;y3++)for(var x3=0;x3<gW;x3++)if(grid[y3][x3])filled++;
            if(filled>gW*gH*0.6) init();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 27. FIREWORKS — star/ring/cascade shapes, intense
    // ═══════════════════════════════════════════════════════════
    function fireworks() {
        var rockets, sparks2, launchTimer;
        var fwColors = ['#cc2244','#dd7700','#ccaa00','#229944','#0066bb','#aa44aa','#cc5588','#00aaaa','#ff4466','#44ddff'];
        function init() { rockets = []; sparks2 = []; launchTimer = Date.now(); }
        function launch() {
            var w = canvas.width, h = canvas.height;
            rockets.push({x:rand(w*0.05,w*0.95), y:h, vy:-rand(6,11), targetY:rand(h*0.08,h*0.45), color:fwColors[randInt(0,fwColors.length)], trail:[]});
        }
        function explode(r) {
            var type = randInt(0, 5);
            var color2 = fwColors[randInt(0, fwColors.length)];
            if (type === 0) {
                // Star burst
                var arms = randInt(5,8), numPerArm = randInt(8,15);
                for(var a=0;a<arms;a++){var angle=a*(Math.PI*2/arms)+rand(-0.1,0.1);for(var p=0;p<numPerArm;p++){var spd=rand(1,6)*(p/numPerArm+0.3);sparks2.push({x:r.x,y:r.y,vx:Math.cos(angle)*spd+rand(-0.3,0.3),vy:Math.sin(angle)*spd+rand(-0.3,0.3),life:1,color:p%2===0?r.color:color2,size:rand(2,5)});}}
            } else if (type === 1) {
                // Ring burst
                var ringN = randInt(30,60);
                for(var i=0;i<ringN;i++){var a2=i*(Math.PI*2/ringN),spd2=rand(3,5);sparks2.push({x:r.x,y:r.y,vx:Math.cos(a2)*spd2,vy:Math.sin(a2)*spd2,life:1,color:r.color,size:rand(2,4)});}
                // Inner ring
                for(var i2=0;i2<ringN/2;i2++){var a3=i2*(Math.PI*4/ringN),spd3=rand(1.5,2.5);sparks2.push({x:r.x,y:r.y,vx:Math.cos(a3)*spd3,vy:Math.sin(a3)*spd3,life:1,color:color2,size:rand(2,4)});}
            } else if (type === 2) {
                // Cascade / willow
                var cascN = randInt(50,90);
                for(var i3=0;i3<cascN;i3++){var a4=rand(0,Math.PI*2),spd4=rand(1,4);sparks2.push({x:r.x,y:r.y,vx:Math.cos(a4)*spd4,vy:Math.sin(a4)*spd4-1,life:1.5,color:r.color,size:rand(1.5,3.5),gravity:0.06});}
            } else if (type === 3) {
                // Crossette (splits into sub-bursts)
                var mainN = 6;
                for(var i4=0;i4<mainN;i4++){var a5=i4*(Math.PI*2/mainN),sx=r.x+Math.cos(a5)*30,sy=r.y+Math.sin(a5)*30;
                    for(var sub=0;sub<12;sub++){var sa=rand(0,Math.PI*2),ss=rand(0.5,2.5);sparks2.push({x:sx,y:sy,vx:Math.cos(sa)*ss,vy:Math.sin(sa)*ss,life:0.8,color:sub%2===0?r.color:color2,size:rand(2,4)});}}
            } else {
                // Dense sphere
                var sphN = randInt(60,100);
                for(var i5=0;i5<sphN;i5++){var a6=rand(0,Math.PI*2),spd5=rand(0.5,5.5);sparks2.push({x:r.x,y:r.y,vx:Math.cos(a6)*spd5,vy:Math.sin(a6)*spd5,life:1,color:fwColors[randInt(0,fwColors.length)],size:rand(2,5)});}
            }
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 0, w, h);
            // Launch frequently
            if(Date.now()-launchTimer>180){launchTimer=Date.now();launch();if(Math.random()<0.5)launch();if(Math.random()<0.2)launch();}
            // Rockets
            for(var r=rockets.length-1;r>=0;r--){var rk=rockets[r];rk.y+=rk.vy;rk.vy+=0.02;
                rk.trail.push({x:rk.x,y:rk.y,life:1});if(rk.trail.length>15)rk.trail.shift();
                for(var tr=0;tr<rk.trail.length;tr++){ctx.fillStyle=rk.color;ctx.globalAlpha=rk.trail[tr].life*0.3;rk.trail[tr].life-=0.07;ctx.beginPath();ctx.arc(rk.trail[tr].x,rk.trail[tr].y,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
                ctx.fillStyle=rk.color;ctx.beginPath();ctx.arc(rk.x,rk.y,3,0,Math.PI*2);ctx.fill();
                if(rk.y<=rk.targetY){explode(rk);rockets.splice(r,1);}
            }
            // Sparks
            for(var s=sparks2.length-1;s>=0;s--){var sp=sparks2[s];sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=(sp.gravity||0.025);sp.vx*=0.985;sp.life-=0.012;
                if(sp.life<=0){sparks2.splice(s,1);continue;}
                ctx.globalAlpha=Math.min(1,sp.life);ctx.fillStyle=sp.color;ctx.beginPath();ctx.arc(sp.x,sp.y,sp.size*Math.min(1,sp.life),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
            }
            if(rockets.length===0&&sparks2.length===0){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);}
            animId = requestAnimationFrame(draw);
        }
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height); init(); draw();
    }
    // ═══════════════════════════════════════════════════════════
    // 30. PLATFORMER — near-100% success rate AI
    // ═══════════════════════════════════════════════════════════
    function platformer() {
        var player2, platforms2, coins, scrollX, jumpV = -8.5, coyoteFrames;
        function init() {
            var h = canvas.height;
            player2 = {x: 100, y: h*0.6, vy: 0, grounded: false, runFrame: 0, wasGrounded: false};
            platforms2 = []; coins = []; scrollX = 0; coyoteFrames = 0;
            var py = h*0.65;
            // Generate very easy platforms — narrow gaps, wide platforms, small height changes
            for (var i = 0; i < 50; i++) {
                var pw = rand(150, 300), gap = rand(15, 70);
                var nextY = py + rand(-18, 12);
                nextY = Math.max(h*0.4, Math.min(h*0.78, nextY));
                platforms2.push({x: (i===0?0:platforms2[platforms2.length-1].x+platforms2[platforms2.length-1].w+gap), y: nextY, w: pw});
                py = nextY;
            }
            for (var c = 0; c < 30; c++) coins.push({x: platforms2[Math.min(c+1,platforms2.length-1)].x+rand(10,80), y: platforms2[Math.min(c+1,platforms2.length-1)].y-rand(25,50), collected:false});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#eef6ff'; ctx.fillRect(0, 0, w, h);
            // BG clouds
            ctx.fillStyle = 'rgba(200,220,240,0.3)';
            for (var cl = 0; cl < 6; cl++) { var cx = ((cl*317+scrollX*0.15)%w+w)%w; ctx.beginPath(); ctx.arc(cx,50+cl*30,30+cl*10,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+25,45+cl*30,20+cl*8,0,Math.PI*2); ctx.fill(); }
            // BG hills
            ctx.fillStyle = 'rgba(100,180,100,0.06)';
            for (var hi = 0; hi < 4; hi++) { var hx = ((hi*400-scrollX*0.1)%(w*2)+w*2)%(w*2)-200; ctx.beginPath(); ctx.arc(hx, h, 200+hi*50, Math.PI, 0); ctx.fill(); }
            scrollX += 2.2; player2.x += 2.2;
            // Track grounded state for coyote time
            player2.wasGrounded = player2.grounded;
            player2.grounded = false;
            // Platform collision + draw
            for (var i = 0; i < platforms2.length; i++) {
                var p = platforms2[i], sx = p.x - scrollX;
                if (sx > w+150 || sx+p.w < -150) continue;
                ctx.fillStyle = '#88aa55'; ctx.fillRect(sx, p.y, p.w, 14);
                ctx.fillStyle = '#779944'; ctx.fillRect(sx, p.y+14, p.w, 200);
                ctx.fillStyle = '#99bb66'; ctx.fillRect(sx, p.y, p.w, 4);
                ctx.fillStyle = '#6b9933'; for (var gt = sx; gt < sx+p.w; gt += rand(12,22)) ctx.fillRect(gt, p.y-2, 3, 4);
                // Wider collision hitbox for landing
                if (player2.vy >= 0 && player2.x-scrollX+14 > sx && player2.x-scrollX-14 < sx+p.w && player2.y+20 >= p.y && player2.y+20 <= p.y+24) { player2.y = p.y-20; player2.vy = 0; player2.grounded = true; }
            }
            // Coyote time: allow jumping a few frames after leaving a platform
            if (player2.wasGrounded && !player2.grounded && player2.vy >= 0) coyoteFrames = 6;
            else if (player2.grounded) coyoteFrames = 6;
            else coyoteFrames = Math.max(0, coyoteFrames - 1);
            // Coins
            for (var c = 0; c < coins.length; c++) { if (coins[c].collected) continue; var ccx = coins[c].x-scrollX, ccy = coins[c].y; if (ccx > -20 && ccx < w+20) { var pulse = 1+Math.sin(Date.now()*0.005+c)*0.1; ctx.fillStyle = '#ddaa00'; ctx.beginPath(); ctx.arc(ccx,ccy,8*pulse,0,Math.PI*2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(ccx-2,ccy-2,3,0,Math.PI*2); ctx.fill(); } if (Math.abs(player2.x-coins[c].x) < 20 && Math.abs(player2.y-coins[c].y) < 20) coins[c].collected = true; }
            // Gravity — lower for easier jumps
            player2.vy += 0.22; player2.y += player2.vy;
            // Smarter AI: look ahead and jump conservatively
            var canJump = player2.grounded || coyoteFrames > 0;
            if (canJump) {
                var playerScreenX = player2.x - scrollX;
                var shouldJump = false;
                var onPlat = null;
                for (var p2 = 0; p2 < platforms2.length; p2++) { var pp = platforms2[p2]; if (player2.x >= pp.x-5 && player2.x <= pp.x+pp.w+5 && Math.abs(pp.y - player2.y-20) < 8) { onPlat = pp; break; } }
                if (onPlat) {
                    var edgeDist = onPlat.x + onPlat.w - player2.x;
                    // Find next platform
                    var nextPlat = null;
                    for (var p3 = 0; p3 < platforms2.length; p3++) { if (platforms2[p3].x > onPlat.x + onPlat.w*0.5 && platforms2[p3] !== onPlat) { nextPlat = platforms2[p3]; break; } }
                    if (nextPlat) {
                        var gapDist = nextPlat.x - (onPlat.x + onPlat.w);
                        var heightDiff = nextPlat.y - onPlat.y;
                        // Jump earlier for larger gaps or higher target platforms
                        var jumpPoint = Math.max(25, Math.min(60, gapDist * 0.5 + (heightDiff < 0 ? 35 : 15)));
                        if (edgeDist < jumpPoint) shouldJump = true;
                    } else if (edgeDist < 50) shouldJump = true;
                } else {
                    // Not on any platform — emergency jump if we have coyote frames
                    shouldJump = true;
                }
                if (shouldJump) { player2.vy = jumpV; player2.grounded = false; coyoteFrames = 0; }
            }
            // Recovery: if falling, steer toward nearest platform below
            if (!player2.grounded && player2.vy > 0) {
                var bestRecovery = null, bestRDist = 99999;
                for (var p4 = 0; p4 < platforms2.length; p4++) {
                    var rp = platforms2[p4], rpsx = rp.x - scrollX;
                    if (rpsx + rp.w > -50 && rpsx < w+50 && rp.y > player2.y) {
                        var rd = Math.abs(rp.x + rp.w/2 - player2.x);
                        if (rd < bestRDist) { bestRDist = rd; bestRecovery = rp; }
                    }
                }
                // Nudge player toward recovery platform
                if (bestRecovery) { var nudge = (bestRecovery.x + bestRecovery.w/2 - player2.x) * 0.005; player2.x += nudge; }
            }
            if (player2.y > h+50) init();
            // Extend level with easy platforms
            if (player2.x > platforms2[platforms2.length-1].x-700) {
                var lastP = platforms2[platforms2.length-1];
                for (var n = 0; n < 15; n++) {
                    var np = {x: lastP.x + lastP.w + rand(15, 70), y: lastP.y + rand(-18, 12), w: rand(150, 300)};
                    np.y = Math.max(h*0.4, Math.min(h*0.78, np.y));
                    platforms2.push(np); lastP = np;
                    coins.push({x: np.x+np.w/2, y: np.y-rand(25,50), collected:false});
                }
            }
            // Draw player
            var px3 = player2.x - scrollX; player2.runFrame += 0.15;
            ctx.fillStyle = '#cc5500'; ctx.beginPath(); ctx.arc(px3, player2.y-4, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#cc3300'; ctx.fillRect(px3-12, player2.y-16, 24, 5); ctx.fillRect(px3-7, player2.y-22, 14, 7);
            ctx.fillStyle = '#0066bb'; ctx.fillRect(px3-7, player2.y+6, 14, 14);
            ctx.fillStyle = '#333'; var legOff = Math.sin(player2.runFrame*3)*5;
            ctx.fillRect(px3-5, player2.y+20, 4, 8+legOff); ctx.fillRect(px3+1, player2.y+20, 4, 8-legOff);
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px3+3, player2.y-6, 3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(px3+4, player2.y-6, 1.5, 0, Math.PI*2); ctx.fill();
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 31. DEFENDER — side-scrolling space shooter
    // ═══════════════════════════════════════════════════════════
    function defender() {
        var ship, enemies, bullets, particles, terrain, scrollX, shootTimer, score;
        var enemyColors = ['#cc2244','#dd7700','#aa44aa','#cc5588'];
        function init() {
            var w = canvas.width, h = canvas.height;
            ship = {x: w*0.2, y: h/2, vy: 0, targetY: h/2};
            enemies = []; bullets = []; particles = []; scrollX = 0; shootTimer = Date.now(); score = 0;
            terrain = []; var ty = h*0.85;
            for(var x=0;x<=w*3;x+=8){ty+=rand(-3,3);ty=Math.max(h*0.7,Math.min(h*0.95,ty));terrain.push({x:x,y:ty});}
            for(var i=0;i<15;i++) enemies.push({x:rand(w,w*2.5),y:rand(60,h*0.65),vx:rand(-1.5,-0.3),vy:rand(-0.5,0.5),color:enemyColors[randInt(0,enemyColors.length)],alive:true,w:20,h:16});
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            scrollX += 2;
            // Stars
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            for(var s=0;s<30;s++){var sx=((s*173.7-scrollX*0.3)%(w+50)+w+50)%(w+50);ctx.fillRect(sx,(s*271.3)%h*0.6,2,2);}
            // Terrain
            ctx.fillStyle = '#c8b888'; ctx.beginPath(); ctx.moveTo(0,h);
            for(var t=0;t<terrain.length;t++){var tx=terrain[t].x-scrollX%w;if(tx<-10)tx+=w*3;ctx.lineTo(tx,terrain[t].y);}
            ctx.lineTo(w,h); ctx.closePath(); ctx.fill();
            // Minimap
            ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(w*0.3, 5, w*0.4, 15);
            for(var em=0;em<enemies.length;em++){if(!enemies[em].alive)continue;var mx=w*0.3+((enemies[em].x-scrollX)/w*0.8+0.1)*w*0.4;ctx.fillStyle='#cc2244';ctx.fillRect(mx,8,3,3);}
            ctx.fillStyle='#229944';ctx.fillRect(w*0.3+0.2*w*0.4,8,4,3);
            // Ship AI: move toward nearest enemy
            var nearEnemy = null, nearDist = 99999;
            for(var ei=0;ei<enemies.length;ei++){if(!enemies[ei].alive)continue;var d=enemies[ei].x-scrollX-ship.x;if(d>0&&d<nearDist){nearDist=d;nearEnemy=enemies[ei];}}
            if(nearEnemy) ship.targetY = nearEnemy.y;
            ship.vy += (ship.targetY - ship.y) * 0.02; ship.vy *= 0.92; ship.y += ship.vy;
            ship.y = Math.max(30, Math.min(h*0.7, ship.y));
            // Draw ship
            ctx.fillStyle = '#229944';
            ctx.beginPath(); ctx.moveTo(ship.x+20, ship.y); ctx.lineTo(ship.x-12, ship.y-10); ctx.lineTo(ship.x-8, ship.y); ctx.lineTo(ship.x-12, ship.y+10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#44cc66'; ctx.beginPath(); ctx.moveTo(ship.x+20, ship.y); ctx.lineTo(ship.x-12, ship.y-10); ctx.lineTo(ship.x-8, ship.y); ctx.closePath(); ctx.fill();
            // Thrust
            ctx.fillStyle = '#dd7700'; ctx.beginPath(); ctx.moveTo(ship.x-12, ship.y-4); ctx.lineTo(ship.x-20-rand(0,6), ship.y); ctx.lineTo(ship.x-12, ship.y+4); ctx.closePath(); ctx.fill();
            // Shoot
            if(Date.now()-shootTimer>250){shootTimer=Date.now();bullets.push({x:ship.x+22,y:ship.y,vx:8,vy:0});}
            // Enemies
            for(var e=enemies.length-1;e>=0;e--){
                var en=enemies[e]; if(!en.alive)continue;
                var ex=en.x-scrollX; en.y+=en.vy;
                if(en.y<40||en.y>h*0.65) en.vy*=-1;
                if(ex<-50){en.x=scrollX+w+rand(100,400);en.y=rand(60,h*0.65);en.alive=true;}
                if(ex>w+100) continue;
                ctx.fillStyle=en.color;
                ctx.beginPath(); ctx.moveTo(ex-10, en.y); ctx.lineTo(ex+10, en.y-8); ctx.lineTo(ex+6, en.y); ctx.lineTo(ex+10, en.y+8); ctx.closePath(); ctx.fill();
                ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex-4,en.y-2,3,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex-3,en.y-2,1.5,0,Math.PI*2);ctx.fill();
            }
            // Bullets
            for(var b=bullets.length-1;b>=0;b--){var bl=bullets[b];bl.x+=bl.vx;ctx.fillStyle='#ccaa00';ctx.fillRect(bl.x,bl.y-1.5,8,3);
                if(bl.x>w+20){bullets.splice(b,1);continue;}
                for(var e2=0;e2<enemies.length;e2++){var en2=enemies[e2];if(!en2.alive)continue;var ex2=en2.x-scrollX;if(Math.abs(bl.x-ex2)<15&&Math.abs(bl.y-en2.y)<12){en2.alive=false;score++;bullets.splice(b,1);for(var pk=0;pk<10;pk++){var a=rand(0,Math.PI*2);particles.push({x:ex2,y:en2.y,vx:Math.cos(a)*rand(1,4),vy:Math.sin(a)*rand(1,4),life:1,color:en2.color,size:rand(2,5)});}break;}}
            }
            // Particles
            for(var pi=particles.length-1;pi>=0;pi--){var pp=particles[pi];pp.x+=pp.vx;pp.y+=pp.vy;pp.life-=0.04;if(pp.life<=0){particles.splice(pi,1);continue;}ctx.globalAlpha=pp.life;ctx.fillStyle=pp.color;ctx.beginPath();ctx.arc(pp.x,pp.y,pp.size*pp.life,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
            // Respawn enemies
            var aliveCount=0;for(var ac=0;ac<enemies.length;ac++)if(enemies[ac].alive)aliveCount++;
            if(aliveCount<8) enemies.push({x:scrollX+w+rand(100,300),y:rand(60,h*0.65),vx:rand(-1.5,-0.3),vy:rand(-0.5,0.5),color:enemyColors[randInt(0,enemyColors.length)],alive:true,w:20,h:16});
            ctx.fillStyle='rgba(0,0,0,0.08)';ctx.font='bold 18px monospace';ctx.textAlign='right';ctx.fillText('Score: '+score,w-15,25);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }

    // ═══════════════════════════════════════════════════════════
    // 32. HELICOPTER GAME — cave flyer with obstacles and collectibles
    // ═══════════════════════════════════════════════════════════
    function helicopter() {
        var heli, cave, scrollX, particles, score, obstacles, collectibles, speed;
        function init() {
            var w = canvas.width, h = canvas.height;
            heli = {x: w*0.2, y: h/2, vy: 0, thrust: false};
            scrollX = 0; particles = []; score = 0; obstacles = []; collectibles = []; speed = 2.5;
            cave = {top: [], bottom: [], gap: h*0.48};
            var topY = h*0.15, botY = h*0.85;
            for (var x = 0; x <= w*3; x += 6) {
                topY += rand(-2.5, 2.5); botY += rand(-2.5, 2.5);
                topY = Math.max(10, Math.min(h*0.38, topY));
                botY = Math.max(h*0.62, Math.min(h-10, botY));
                if (botY - topY < cave.gap) botY = topY + cave.gap;
                cave.top.push(topY); cave.bottom.push(botY);
            }
            // Floating obstacles
            for (var oi = 0; oi < 20; oi++) {
                var ox = rand(w, w*3);
                var oidx = Math.floor(ox / 6);
                var otop = oidx < cave.top.length ? cave.top[oidx] : h*0.2;
                var obot = oidx < cave.bottom.length ? cave.bottom[oidx] : h*0.8;
                obstacles.push({x: ox, y: rand(otop+25, obot-25), type: Math.random() < 0.5 ? 'stalactite' : 'rock', w: rand(12, 24), h: rand(15, 35)});
            }
            // Collectible stars
            for (var ci = 0; ci < 25; ci++) {
                var cx = rand(w*0.5, w*3);
                var cidx = Math.floor(cx / 6);
                var ctop = cidx < cave.top.length ? cave.top[cidx] : h*0.2;
                var cbot = cidx < cave.bottom.length ? cave.bottom[cidx] : h*0.8;
                collectibles.push({x: cx, y: rand(ctop+20, cbot-20), collected: false});
            }
        }
        function draw() {
            var w = canvas.width, h = canvas.height;
            // Sky gradient
            var grad = ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#e8f0ff'); grad.addColorStop(1,'#f0f4ff');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            scrollX += speed; score++;
            // Gradual speed increase
            if (score % 600 === 0 && speed < 4.5) speed += 0.08;
            // Gradual gap narrowing
            if (score % 400 === 0 && cave.gap > h*0.35) cave.gap -= 2;
            var idx = Math.floor(scrollX / 6);
            // Extend cave
            while (idx + Math.floor(w/6) + 10 >= cave.top.length) {
                var lt = cave.top[cave.top.length-1] + rand(-2.5, 2.5);
                var lb = cave.bottom[cave.bottom.length-1] + rand(-2.5, 2.5);
                lt = Math.max(10, Math.min(h*0.38, lt));
                lb = Math.max(h*0.62, Math.min(h-10, lb));
                if (lb - lt < cave.gap) lb = lt + cave.gap;
                cave.top.push(lt); cave.bottom.push(lb);
            }
            // Draw far cave layer (parallax)
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            ctx.beginPath(); ctx.moveTo(0, 0);
            for (var fx = 0; fx < w; fx += 12) { var fi = idx + Math.floor(fx*0.8/6); if (fi >= 0 && fi < cave.top.length) ctx.lineTo(fx, cave.top[fi] - 15); }
            ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0, h);
            for (var fx2 = 0; fx2 < w; fx2 += 12) { var fi2 = idx + Math.floor(fx2*0.8/6); if (fi2 >= 0 && fi2 < cave.bottom.length) ctx.lineTo(fx2, cave.bottom[fi2] + 15); }
            ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
            // Draw main cave
            ctx.fillStyle = '#8a8a8a'; ctx.beginPath(); ctx.moveTo(0, 0);
            for (var x = 0; x < w; x += 6) { var ti = idx + Math.floor(x/6); if (ti >= 0 && ti < cave.top.length) ctx.lineTo(x, cave.top[ti]); }
            ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#8a8a8a'; ctx.beginPath(); ctx.moveTo(0, h);
            for (var x2 = 0; x2 < w; x2 += 6) { var bi = idx + Math.floor(x2/6); if (bi >= 0 && bi < cave.bottom.length) ctx.lineTo(x2, cave.bottom[bi]); }
            ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
            // Cave texture (rock lines)
            ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
            for (var tl = 0; tl < w; tl += 25) {
                var tli = idx + Math.floor(tl/6);
                if (tli >= 0 && tli < cave.top.length) { ctx.beginPath(); ctx.moveTo(tl, cave.top[tli]); ctx.lineTo(tl+rand(-3,3), cave.top[tli]-rand(3,10)); ctx.stroke(); }
                if (tli >= 0 && tli < cave.bottom.length) { ctx.beginPath(); ctx.moveTo(tl, cave.bottom[tli]); ctx.lineTo(tl+rand(-3,3), cave.bottom[tli]+rand(3,10)); ctx.stroke(); }
            }
            // Obstacles
            for (var oi = obstacles.length-1; oi >= 0; oi--) {
                var ob = obstacles[oi], obsx = ob.x - scrollX;
                if (obsx < -50) { ob.x = scrollX + w + rand(100, 400); var nidx = Math.floor(ob.x/6); ob.y = nidx < cave.top.length && nidx < cave.bottom.length ? rand(cave.top[nidx]+25, cave.bottom[nidx]-25) : h/2; continue; }
                if (obsx > w+100) continue;
                if (ob.type === 'stalactite') {
                    ctx.fillStyle = '#777'; ctx.beginPath(); ctx.moveTo(obsx, ob.y-ob.h/2); ctx.lineTo(obsx+ob.w/2, ob.y+ob.h/2); ctx.lineTo(obsx-ob.w/2, ob.y+ob.h/2); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(obsx, ob.y-ob.h/2); ctx.lineTo(obsx+ob.w*0.15, ob.y+ob.h/2); ctx.lineTo(obsx-ob.w*0.15, ob.y+ob.h/2); ctx.closePath(); ctx.fill();
                } else {
                    ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(obsx, ob.y, ob.w/2, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(obsx-ob.w*0.15, ob.y-ob.w*0.15, ob.w/4, 0, Math.PI*2); ctx.fill();
                }
                // Obstacle collision
                if (Math.abs(heli.x - obsx) < ob.w/2+8 && Math.abs(heli.y - ob.y) < ob.h/2+6) init();
            }
            // Collectibles
            for (var ci = collectibles.length-1; ci >= 0; ci--) {
                var cl = collectibles[ci]; if (cl.collected) continue;
                var clsx = cl.x - scrollX;
                if (clsx < -50) { cl.x = scrollX + w + rand(100, 500); var cidx = Math.floor(cl.x/6); cl.y = cidx < cave.top.length && cidx < cave.bottom.length ? rand(cave.top[cidx]+20, cave.bottom[cidx]-20) : h/2; cl.collected = false; continue; }
                if (clsx > w+50) continue;
                // Draw star
                var pulse = 1 + Math.sin(Date.now()*0.005+ci)*0.15;
                ctx.fillStyle = '#ddaa00'; ctx.beginPath();
                for (var si = 0; si < 5; si++) { var sa = si*Math.PI*2/5-Math.PI/2; ctx.lineTo(clsx+Math.cos(sa)*7*pulse, cl.y+Math.sin(sa)*7*pulse); var sa2 = sa+Math.PI/5; ctx.lineTo(clsx+Math.cos(sa2)*3*pulse, cl.y+Math.sin(sa2)*3*pulse); }
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(clsx-1, cl.y-2, 2, 0, Math.PI*2); ctx.fill();
                // Collect
                if (Math.abs(heli.x - clsx) < 15 && Math.abs(heli.y - cl.y) < 15) { cl.collected = true; score += 50; for (var sp = 0; sp < 6; sp++) particles.push({x: clsx, y: cl.y, vx: rand(-2,2), vy: rand(-2,2), life: 0.6, color:'#ffcc00', size:rand(2,4)}); }
            }
            // AI: stay in middle of gap, avoid obstacles
            var currentIdx = idx + Math.floor(heli.x / 6);
            var lookAheadIdx = idx + Math.floor((heli.x + 60) / 6);
            var topY2 = currentIdx >= 0 && currentIdx < cave.top.length ? cave.top[currentIdx] : h*0.2;
            var botY2 = currentIdx >= 0 && currentIdx < cave.bottom.length ? cave.bottom[currentIdx] : h*0.8;
            var topAhead = lookAheadIdx >= 0 && lookAheadIdx < cave.top.length ? cave.top[lookAheadIdx] : topY2;
            var botAhead = lookAheadIdx >= 0 && lookAheadIdx < cave.bottom.length ? cave.bottom[lookAheadIdx] : botY2;
            var midY = ((topY2 + botY2) / 2 + (topAhead + botAhead) / 2) / 2;
            // Avoid obstacles
            for (var ai = 0; ai < obstacles.length; ai++) { var aob = obstacles[ai]; var aobx = aob.x - scrollX; if (aobx > heli.x-30 && aobx < heli.x+80 && Math.abs(heli.y - aob.y) < aob.h) { midY += (heli.y > aob.y ? 30 : -30); } }
            heli.thrust = heli.y > midY;
            // Physics
            if (heli.thrust) { heli.vy -= 0.35; for (var tp = 0; tp < 2; tp++) particles.push({x: heli.x-8, y: heli.y+8, vx: rand(-2,-0.5), vy: rand(0.5,2.5), life: 0.5, color: '#dd7700', size: rand(2,4)}); }
            heli.vy += 0.2; heli.y += heli.vy;
            heli.vy = Math.max(-5, Math.min(5, heli.vy));
            // Wall collision
            if (heli.y-10 < topY2 || heli.y+10 > botY2) init();
            // Particles
            for (var pi = particles.length-1; pi >= 0; pi--) { var pp = particles[pi]; pp.x += pp.vx; pp.y += pp.vy; pp.life -= 0.04; if (pp.life <= 0) { particles.splice(pi, 1); continue; } ctx.globalAlpha = pp.life; ctx.fillStyle = pp.color; ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.size*pp.life, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
            // Draw helicopter
            // Body
            ctx.fillStyle = '#229944'; ctx.fillRect(heli.x-14, heli.y-7, 28, 14);
            ctx.fillStyle = '#44cc66'; ctx.fillRect(heli.x-14, heli.y-7, 28, 5);
            // Cabin window
            ctx.fillStyle = '#aaddff'; ctx.fillRect(heli.x+4, heli.y-5, 8, 7);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(heli.x+5, heli.y-4, 3, 5);
            // Tail boom
            ctx.fillStyle = '#229944'; ctx.fillRect(heli.x-22, heli.y-3, 10, 6);
            // Tail rotor
            ctx.fillStyle = '#117733';
            var tailRotor = Math.sin(Date.now()*0.04)*6;
            ctx.fillRect(heli.x-24, heli.y-3+tailRotor-4, 3, 8);
            // Main rotor (spinning)
            var rotorW = 22 + Math.sin(Date.now()*0.03)*20;
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(heli.x-rotorW, heli.y-10, rotorW*2, 2);
            // Rotor mast
            ctx.fillStyle = '#555'; ctx.fillRect(heli.x-1, heli.y-11, 2, 4);
            // Skids
            ctx.fillStyle = '#555'; ctx.fillRect(heli.x-12, heli.y+7, 24, 2);
            ctx.fillRect(heli.x-8, heli.y+5, 2, 3); ctx.fillRect(heli.x+6, heli.y+5, 2, 3);
            // Score
            ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'right'; ctx.fillText(Math.floor(score/10), w-15, 25);
            animId = requestAnimationFrame(draw);
        }
        init(); draw();
    }
    // ═══════════════════════════════════════════════════════════
    // Registry — Matrix is index 0 (DEFAULT)
    // ═══════════════════════════════════════════════════════════
    var MATRIX_INDEX = 0;
    var animations = [
        { name: 'Matrix', fn: matrixRain },
        { name: 'Tetris', fn: tetris },
        { name: 'Snake', fn: snake },
        { name: 'Pong', fn: pong },
        { name: 'Missile Command', fn: missileCommand },
        { name: 'Invaders', fn: spaceInvaders },
        { name: 'Frogger', fn: frogger },
        { name: 'Pac-Man', fn: pacman },
        { name: 'Retro Grid', fn: retroGrid },
        { name: 'Asteroids', fn: asteroids },
        { name: 'Breakout', fn: breakout },
        { name: 'Tron', fn: tron },
        { name: 'Centipede', fn: centipede },
        { name: 'Galaga', fn: galaga },
        { name: 'Flappy Bird', fn: flappyBird },
        { name: 'Columns', fn: columns },
        { name: 'Doodle Jump', fn: doodleJump },
        { name: 'Skiing', fn: skiing },
        { name: 'Lunar Lander', fn: lunarLander },
        { name: 'Pinball', fn: pinball },
        { name: 'Tanks', fn: tanks },
        { name: 'Tower Defense', fn: towerDefense },
        { name: 'Maze Runner', fn: mazeRunner },
        { name: 'Bubble Shooter', fn: bubbleShooter },
        { name: 'Falling Sand', fn: fallingSand },
        { name: 'Fireworks', fn: fireworks },
        { name: 'Platformer', fn: platformer },
        { name: 'Defender', fn: defender },
        { name: 'Helicopter', fn: helicopter }
    ];

    // White backgrounds — overlay uses dark text
    function setOverlayTheme() {
        var nameSpans = document.querySelectorAll('.stack span');
        var shuffleIcon = document.querySelector('.shuffle-icon');
        var shuffleBtn = document.getElementById('shuffleBtn');
        for (var i = 0; i < nameSpans.length; i++) nameSpans[i].style.color = '#000';
        if (shuffleIcon) shuffleIcon.style.color = 'rgba(0,0,0,0.7)';
        if (shuffleBtn) { shuffleBtn.style.background = 'rgba(0,0,0,0.06)'; shuffleBtn.style.borderColor = 'rgba(0,0,0,0.25)'; shuffleBtn.setAttribute('data-dark', '0'); }
    }

    function switchTo(index) {
        stopCurrent(); resize();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.setLineDash([]);
        currentAnim = index;
        setOverlayTheme();
        animations[index].fn();
    }

    // Build a randomized playlist — no repeats until every game has been shown.
    // Order is randomized per page load but stays fixed for the session.
    var playlist = [];
    var playlistPos = 0;
    function buildPlaylist() {
        playlist = [];
        for (var i = 0; i < animations.length; i++) playlist.push(i);
        // Fisher-Yates shuffle
        for (var j = playlist.length - 1; j > 0; j--) {
            var k = randInt(0, j + 1);
            var tmp = playlist[j]; playlist[j] = playlist[k]; playlist[k] = tmp;
        }
        // Ensure Matrix Rain is first on initial load
        var matIdx = playlist.indexOf(MATRIX_INDEX);
        if (matIdx > 0) { playlist.splice(matIdx, 1); playlist.unshift(MATRIX_INDEX); }
        playlistPos = 0;
    }
    buildPlaylist();

    function shuffleAnimation() {
        playlistPos++;
        if (playlistPos >= playlist.length) playlistPos = 0;
        switchTo(playlist[playlistPos]);
    }

    window.shuffleAnimation = shuffleAnimation;
    switchTo(playlist[0]);
})();
