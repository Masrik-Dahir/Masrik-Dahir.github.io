// 2048 — Full Game
(function(){
/* ---- roundRect polyfill ---- */
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        var tl = r[0], tr = r[1], br = r[2], bl = r[3];
        this.beginPath();
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

var canvas, ctx, W, H, animId = null, gameState = 'title', score = 0, bestScore = 0;
var gameTime = 0, titlePulse = 0, won = false, keepPlaying = false;
var grid, undoStack = [], moveAnimations = [], newTileAnims = [], mergeAnims = [];
var GRID_SIZE = 4;

/* ---- tile colors ---- */
var TILE_COLORS = {
    2:    '#eee4da', 4:    '#ede0c8', 8:    '#f2b179', 16:   '#f59563',
    32:   '#f67c5f', 64:   '#f65e3b', 128:  '#edcf72', 256:  '#edcc61',
    512:  '#edc850', 1024: '#edc53f', 2048: '#edc22e'
};
var TILE_TEXT_DARK = { 2: true, 4: true };
var GRID_BG = '#bbada0';
var CELL_BG = '#cdc1b4';

/* ---- layout helpers ---- */
var gridPx, cellPx, cellGap, gridX, gridY, cornerR;

function calcLayout() {
    /* Leave room: top margin for score, bottom margin for hint text */
    var topMargin = Math.round(H * 0.08);
    var bottomMargin = Math.round(H * 0.06);
    var availH = H - topMargin - bottomMargin;
    var maxGrid = Math.min(W * 0.82, availH * 0.95);
    gridPx = Math.floor(maxGrid);
    cellGap = Math.floor(gridPx * 0.027);
    cellPx = Math.floor((gridPx - cellGap * 5) / 4);
    gridPx = cellPx * 4 + cellGap * 5;
    gridX = Math.floor((W - gridPx) / 2);
    gridY = topMargin + Math.floor((availH - gridPx) / 2);
    cornerR = Math.floor(cellPx * 0.06);
}

function resize() {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width);
    canvas.height = Math.max(Math.round(r.height), 300);
    W = canvas.width; H = canvas.height;
    calcLayout();
}

/* ---- grid helpers ---- */
function emptyGrid() {
    var g = [];
    for (var r = 0; r < GRID_SIZE; r++) { g[r] = []; for (var c = 0; c < GRID_SIZE; c++) g[r][c] = 0; }
    return g;
}
function copyGrid(g) {
    var n = [];
    for (var r = 0; r < GRID_SIZE; r++) { n[r] = []; for (var c = 0; c < GRID_SIZE; c++) n[r][c] = g[r][c]; }
    return n;
}
function emptyCells() {
    var cells = [];
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) if (grid[r][c] === 0) cells.push({ r: r, c: c });
    return cells;
}
function addRandomTile() {
    var cells = emptyCells();
    if (cells.length === 0) return null;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    var val = Math.random() < 0.9 ? 2 : 4;
    grid[cell.r][cell.c] = val;
    newTileAnims.push({ r: cell.r, c: cell.c, t: 0, duration: 0.15 });
    return cell;
}

/* ---- move logic ---- */
function slideLine(line) {
    /* Slide a single row/col: returns { result, merged, moves } */
    var filtered = [];
    for (var i = 0; i < line.length; i++) if (line[i] !== 0) filtered.push(line[i]);
    var result = [], merged = [], mergeScore = 0;
    var i = 0;
    while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            var val = filtered[i] * 2;
            result.push(val);
            merged.push(true);
            mergeScore += val;
            i += 2;
        } else {
            result.push(filtered[i]);
            merged.push(false);
            i++;
        }
    }
    while (result.length < GRID_SIZE) { result.push(0); merged.push(false); }
    return { result: result, merged: merged, score: mergeScore };
}

function move(direction) {
    /* direction: 0=left, 1=up, 2=right, 3=down */
    var oldGrid = copyGrid(grid);
    var totalScore = 0, moved = false;
    moveAnimations = []; mergeAnims = [];

    for (var i = 0; i < GRID_SIZE; i++) {
        var line = [], coords = [];
        for (var j = 0; j < GRID_SIZE; j++) {
            var r, c;
            if (direction === 0)      { r = i; c = j; }         // left
            else if (direction === 1)  { r = j; c = i; }         // up
            else if (direction === 2)  { r = i; c = GRID_SIZE - 1 - j; }  // right
            else                       { r = GRID_SIZE - 1 - j; c = i; }  // down
            line.push(grid[r][c]);
            coords.push({ r: r, c: c });
        }
        var result = slideLine(line);
        totalScore += result.score;
        for (var j = 0; j < GRID_SIZE; j++) {
            var r = coords[j].r, c = coords[j].c;
            if (grid[r][c] !== result.result[j] || (grid[r][c] !== 0 && j !== indexInResult(line, coords, j, result, direction))) {
                moved = true;
            }
            grid[r][c] = result.result[j];
            if (result.merged[j]) {
                mergeAnims.push({ r: r, c: c, t: 0, duration: 0.12 });
            }
        }
        /* build per-tile animations for this line */
        buildLineAnims(line, result.result, coords, direction);
    }
    /* check if actual move occurred by comparing grids */
    moved = false;
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) {
        if (oldGrid[r][c] !== grid[r][c]) moved = true;
    }
    if (!moved) { moveAnimations = []; mergeAnims = []; return false; }
    undoStack.push({ grid: oldGrid, score: score });
    if (undoStack.length > 30) undoStack.shift();
    score += totalScore;
    if (score > bestScore) bestScore = score;
    addRandomTile();
    if (!won && !keepPlaying && hasValue(2048)) { won = true; gameState = 'win'; }
    if (isGameOver()) gameState = 'gameover';
    return true;
}

function indexInResult() { return -1; } /* stub — move detection uses grid compare */

function buildLineAnims(line, result, coords, dir) {
    /* Track where each nonzero tile in the original line ends up */
    var srcIndices = [];
    for (var j = 0; j < line.length; j++) if (line[j] !== 0) srcIndices.push(j);
    /* result has merged tiles; walk source tiles into result positions */
    var si = 0, di = 0;
    while (si < srcIndices.length && di < result.length) {
        if (result[di] === 0) { di++; continue; }
        var fromCoord = coords[srcIndices[si]];
        var toCoord = coords[di];
        if (fromCoord.r !== toCoord.r || fromCoord.c !== toCoord.c) {
            moveAnimations.push({
                fromR: fromCoord.r, fromC: fromCoord.c,
                toR: toCoord.r, toC: toCoord.c,
                val: line[srcIndices[si]], t: 0, duration: 0.1
            });
        }
        si++;
        /* if this result cell was a merge, consume the next source tile too */
        if (si < srcIndices.length && result[di] === line[srcIndices[si - 1]] * 2 && line[srcIndices[si - 1]] === line[srcIndices[si]]) {
            var fromCoord2 = coords[srcIndices[si]];
            if (fromCoord2.r !== toCoord.r || fromCoord2.c !== toCoord.c) {
                moveAnimations.push({
                    fromR: fromCoord2.r, fromC: fromCoord2.c,
                    toR: toCoord.r, toC: toCoord.c,
                    val: line[srcIndices[si]], t: 0, duration: 0.1
                });
            }
            si++;
        }
        di++;
    }
}

function hasValue(val) {
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) if (grid[r][c] === val) return true;
    return false;
}

function isGameOver() {
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) return false;
        if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
    return true;
}

function undo() {
    if (undoStack.length === 0) return;
    var state = undoStack.pop();
    grid = state.grid;
    score = state.score;
    moveAnimations = []; newTileAnims = []; mergeAnims = [];
    if (gameState === 'gameover') gameState = 'playing';
}

/* ---- game setup ---- */
function resetGame() {
    grid = emptyGrid();
    score = 0; gameTime = 0; won = false; keepPlaying = false;
    undoStack = []; moveAnimations = []; newTileAnims = []; mergeAnims = [];
    addRandomTile(); addRandomTile();
    gameState = 'playing';
}

/* ---- cell pixel position ---- */
function cellX(c) { return gridX + cellGap + c * (cellPx + cellGap); }
function cellY(r) { return gridY + cellGap + r * (cellPx + cellGap); }

/* ---- rendering ---- */
function drawRoundRect(x, y, w, h, r) {
    ctx.roundRect(x, y, w, h, r);
}

function tileColor(val) {
    if (TILE_COLORS[val]) return TILE_COLORS[val];
    /* for values > 2048 */
    return '#3c3a32';
}

function tileTextColor(val) {
    return TILE_TEXT_DARK[val] ? '#776e65' : '#f9f6f2';
}

function tileFont(val) {
    var base;
    if (val < 100) base = 0.45;
    else if (val < 1000) base = 0.38;
    else if (val < 10000) base = 0.30;
    else base = 0.24;
    return 'bold ' + Math.round(cellPx * base) + 'px "Clear Sans", "Helvetica Neue", Arial, sans-serif';
}

function drawTile(x, y, size, val, alpha) {
    if (val === 0) return;
    ctx.save();
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fillStyle = tileColor(val);
    ctx.beginPath();
    drawRoundRect(x, y, size, size, cornerR);
    ctx.fill();
    /* glow for 2048 */
    if (val === 2048) {
        ctx.shadowColor = '#edc22e';
        ctx.shadowBlur = 15 + Math.sin(gameTime * 4) * 5;
        ctx.beginPath();
        drawRoundRect(x, y, size, size, cornerR);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.fillStyle = tileTextColor(val);
    ctx.font = tileFont(val);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(val, x + size / 2, y + size / 2);
    ctx.restore();
}

function drawGrid() {
    /* grid background */
    ctx.fillStyle = GRID_BG;
    ctx.beginPath();
    drawRoundRect(gridX, gridY, gridPx, gridPx, Math.floor(gridPx * 0.02));
    ctx.fill();
    /* empty cells */
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) {
        ctx.fillStyle = CELL_BG;
        ctx.beginPath();
        drawRoundRect(cellX(c), cellY(r), cellPx, cellPx, cornerR);
        ctx.fill();
    }
}

function drawTiles() {
    /* determine which cells are being animated (skip drawing statically) */
    var animating = {};
    for (var i = 0; i < moveAnimations.length; i++) {
        if (moveAnimations[i].t < moveAnimations[i].duration) {
            animating[moveAnimations[i].fromR + ',' + moveAnimations[i].fromC] = true;
        }
    }

    /* draw static tiles */
    for (var r = 0; r < GRID_SIZE; r++) for (var c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) continue;
        /* check if this cell has a new-tile animation */
        var newAnim = null;
        for (var k = 0; k < newTileAnims.length; k++) {
            if (newTileAnims[k].r === r && newTileAnims[k].c === c && newTileAnims[k].t < newTileAnims[k].duration) {
                newAnim = newTileAnims[k]; break;
            }
        }
        /* check merge animation */
        var mAnim = null;
        for (var k = 0; k < mergeAnims.length; k++) {
            if (mergeAnims[k].r === r && mergeAnims[k].c === c && mergeAnims[k].t < mergeAnims[k].duration) {
                mAnim = mergeAnims[k]; break;
            }
        }
        var x = cellX(c), y = cellY(r), size = cellPx;
        if (newAnim) {
            var p = newAnim.t / newAnim.duration;
            var sc = p; /* scale from 0 to 1 */
            var sz = cellPx * sc;
            drawTile(x + (cellPx - sz) / 2, y + (cellPx - sz) / 2, sz, grid[r][c], p);
        } else if (mAnim) {
            var p = mAnim.t / mAnim.duration;
            var sc = 1 + 0.15 * Math.sin(p * Math.PI);
            var sz = cellPx * sc;
            drawTile(x + (cellPx - sz) / 2, y + (cellPx - sz) / 2, sz, grid[r][c], 1);
        } else {
            drawTile(x, y, size, grid[r][c], 1);
        }
    }

    /* draw sliding animations */
    for (var i = 0; i < moveAnimations.length; i++) {
        var a = moveAnimations[i];
        if (a.t >= a.duration) continue;
        var p = Math.min(a.t / a.duration, 1);
        /* ease out */
        p = 1 - (1 - p) * (1 - p);
        var fx = cellX(a.fromC) + (cellX(a.toC) - cellX(a.fromC)) * p;
        var fy = cellY(a.fromR) + (cellY(a.toR) - cellY(a.fromR)) * p;
        drawTile(fx, fy, cellPx, a.val, 1);
    }
}

function render() {
    ctx.fillStyle = '#faf8ef'; ctx.fillRect(0, 0, W, H);
    drawGrid();
    drawTiles();

    /* score above grid */
    var scoreFontSize = Math.round(Math.min(W * 0.03, gridY * 0.45));
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold ' + scoreFontSize + 'px "Clear Sans", Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('Score: ' + score, gridX, gridY - 6);

    ctx.textAlign = 'right';
    ctx.fillText('Best: ' + bestScore, gridX + gridPx, gridY - 6);

    /* undo hint */
    var hintFontSize = Math.round(Math.min(W * 0.017, (H - gridY - gridPx) * 0.4));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b0a89e';
    ctx.font = hintFontSize + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('Press U to undo', W / 2, Math.min(gridY + gridPx + hintFontSize + 8, H - 4));
}

function drawTitle(dt) {
    ctx.fillStyle = '#faf8ef'; ctx.fillRect(0, 0, W, H);
    titlePulse += dt * 3;
    calcLayout();
    ctx.save(); ctx.textAlign = 'center';

    /* big title */
    ctx.font = 'bold ' + Math.round(W * 0.12) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillStyle = '#776e65';
    ctx.fillText('2048', W / 2, H * 0.28);

    /* sample tiles */
    var sampleVals = [2, 4, 8, 16, 64, 128, 512, 2048];
    var sSize = Math.floor(W * 0.07);
    var sGap = Math.floor(sSize * 0.25);
    var totalW = sampleVals.length * sSize + (sampleVals.length - 1) * sGap;
    var sx = (W - totalW) / 2;
    var sy = H * 0.35;
    for (var i = 0; i < sampleVals.length; i++) {
        drawTile(sx + i * (sSize + sGap), sy, sSize, sampleVals[i], 1);
    }

    /* pulsing start text */
    var a = 0.5 + 0.5 * Math.sin(titlePulse * 2);
    ctx.fillStyle = 'rgba(119,110,101,' + a + ')';
    ctx.font = Math.round(W * 0.025) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START', W / 2, H * 0.58);

    ctx.fillStyle = '#b0a89e';
    ctx.font = Math.round(W * 0.018) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('Arrow keys / WASD to slide tiles', W / 2, H * 0.66);
    ctx.fillText('Merge tiles to reach 2048!', W / 2, H * 0.72);

    ctx.restore();
}

function drawOverlay(title, subtitle) {
    ctx.fillStyle = 'rgba(238,228,218,0.73)'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = 'center';
    ctx.font = 'bold ' + Math.round(W * 0.07) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillStyle = '#776e65';
    ctx.fillText(title, W / 2, H * 0.35);

    ctx.font = 'bold ' + Math.round(W * 0.04) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillStyle = '#f59563';
    ctx.fillText('Score: ' + score, W / 2, H * 0.46);

    if (subtitle) {
        ctx.font = Math.round(W * 0.022) + 'px "Clear Sans", Arial, sans-serif';
        ctx.fillStyle = '#776e65';
        ctx.fillText(subtitle, W / 2, H * 0.55);
    }

    var a = 0.5 + 0.5 * Math.sin(titlePulse * 2);
    ctx.fillStyle = 'rgba(119,110,101,' + a + ')';
    ctx.font = Math.round(W * 0.022) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN', W / 2, H * 0.68);
    ctx.restore();
}

function drawWinOverlay() {
    ctx.fillStyle = 'rgba(237,194,46,0.5)'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = 'center';
    ctx.font = 'bold ' + Math.round(W * 0.07) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillStyle = '#f9f6f2';
    ctx.fillText('You Win!', W / 2, H * 0.35);

    ctx.font = 'bold ' + Math.round(W * 0.04) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('Score: ' + score, W / 2, H * 0.46);

    var a = 0.5 + 0.5 * Math.sin(titlePulse * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
    ctx.font = Math.round(W * 0.022) + 'px "Clear Sans", Arial, sans-serif';
    ctx.fillText('TAP / ENTER TO KEEP PLAYING', W / 2, H * 0.58);
    ctx.fillText('OR TAP AGAIN TO RESTART', W / 2, H * 0.64);
    ctx.restore();
}

/* ---- HUD ---- */
function updateHUD() {
    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-speed').textContent = 'BEST ' + bestScore;
    document.getElementById('hud-time').textContent = Math.floor(gameTime) + 's';
}

/* ---- animation update ---- */
function updateAnims(dt) {
    for (var i = moveAnimations.length - 1; i >= 0; i--) {
        moveAnimations[i].t += dt;
        if (moveAnimations[i].t >= moveAnimations[i].duration) moveAnimations.splice(i, 1);
    }
    for (var i = newTileAnims.length - 1; i >= 0; i--) {
        newTileAnims[i].t += dt;
        if (newTileAnims[i].t >= newTileAnims[i].duration) newTileAnims.splice(i, 1);
    }
    for (var i = mergeAnims.length - 1; i >= 0; i--) {
        mergeAnims[i].t += dt;
        if (mergeAnims[i].t >= mergeAnims[i].duration) mergeAnims.splice(i, 1);
    }
}

/* ---- game loop ---- */
var lastTs = 0;
function gameLoop(ts) {
    var dt = (ts - lastTs) / 1000;
    if (dt > 0.5) dt = 0.016;
    lastTs = ts;

    if (gameState === 'title') {
        drawTitle(dt);
    } else if (gameState === 'playing') {
        gameTime += dt;
        updateAnims(dt);
        render();
        updateHUD();
    } else if (gameState === 'gameover') {
        updateAnims(dt);
        titlePulse += dt * 3;
        render();
        drawOverlay('Game Over', 'No more moves!');
    } else if (gameState === 'win') {
        updateAnims(dt);
        titlePulse += dt * 3;
        render();
        drawWinOverlay();
    }
    animId = requestAnimationFrame(gameLoop);
}

/* ---- input ---- */
function handleMove(direction) {
    if (gameState === 'title') { resetGame(); return; }
    if (gameState === 'gameover') { resetGame(); return; }
    if (gameState === 'win') { keepPlaying = true; gameState = 'playing'; return; }
    if (gameState !== 'playing') return;
    move(direction);
}

function onKey(e, down) {
    if (!down) return;
    /* Arrow/WASD keys also start the game from title — natural for 2048 */
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleMove(0);
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleMove(1);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleMove(2);
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleMove(3);
    else if ((e.key === 'u' || e.key === 'U') && gameState === 'playing') undo();
    else if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') && (gameState === 'title' || gameState === 'gameover')) resetGame();
    else if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') && gameState === 'win') { keepPlaying = true; gameState = 'playing'; }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].indexOf(e.key) !== -1) e.preventDefault();
}
var kd = function(e) { onKey(e, true); };

/* ---- mobile / swipe ---- */
function bindMobile(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', function(e) { e.preventDefault(); fn(); });
    el.addEventListener('mousedown', function() { fn(); });
}

var touchStartX = 0, touchStartY = 0, touching = false;
function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}
function onTouchEnd(e) {
    if (!touching) return;
    touching = false;
    if (e.changedTouches.length === 0) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    var absDx = Math.abs(dx), absDy = Math.abs(dy);
    var minSwipe = 30;

    if (gameState === 'title') { resetGame(); return; }
    if (gameState === 'gameover') { resetGame(); return; }
    if (gameState === 'win') { keepPlaying = true; gameState = 'playing'; return; }

    if (absDx < minSwipe && absDy < minSwipe) return; /* too small, ignore */
    if (absDx > absDy) {
        handleMove(dx > 0 ? 2 : 0); /* right : left */
    } else {
        handleMove(dy > 0 ? 3 : 1); /* down : up */
    }
}

/* ---- init / stop ---- */
window.init2048 = function() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resize);
    resize();
    document.addEventListener('keydown', kd);

    /* mobile buttons */
    bindMobile('btn-left', function() { handleMove(0); });
    bindMobile('btn-right', function() { handleMove(2); });
    bindMobile('btn-up', function() { handleMove(1); });
    bindMobile('btn-down', function() { handleMove(3); });

    /* swipe on canvas */
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    /* click/tap to start from title/gameover */
    canvas.addEventListener('click', function() {
        if (gameState === 'title' || gameState === 'gameover') resetGame();
        else if (gameState === 'win') { keepPlaying = true; gameState = 'playing'; }
    });

    gameState = 'title'; titlePulse = 0;
    lastTs = performance.now();
    animId = requestAnimationFrame(gameLoop);
};

window.stop2048 = function() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    document.removeEventListener('keydown', kd);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', resize);
    gameState = 'title';
};
})();
