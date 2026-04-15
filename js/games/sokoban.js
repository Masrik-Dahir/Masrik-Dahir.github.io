// Sokoban — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
    CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
        if(typeof r==='number')r={tl:r,tr:r,br:r,bl:r};
        this.beginPath();
        this.moveTo(x+r.tl,y);
        this.lineTo(x+w-r.tr,y);
        this.quadraticCurveTo(x+w,y,x+w,y+r.tr);
        this.lineTo(x+w,y+h-r.br);
        this.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);
        this.lineTo(x+r.bl,y+h);
        this.quadraticCurveTo(x,y+h,x,y+h-r.bl);
        this.lineTo(x,y+r.tl);
        this.quadraticCurveTo(x,y,x+r.tl,y);
        this.closePath();
        return this;
    };
}

var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var currentLevel=0,moves=0,history=[];
var grid=[],playerR=0,playerC=0,playerDir={r:0,c:1};
var cellSize=32;
var gridOffsetX=0,gridOffsetY=0;
var particles=[];
var levelCompleteTimer=0;
var totalLevels=10;

// Animation state for smooth movement
var animPlayer={r:0,c:0,tr:0,tc:0,t:1}; // lerp from (r,c) to (tr,tc), t=0..1
var animBoxes=[]; // array of {r,c,tr,tc,t} for each box being animated
var ANIM_SPEED=12; // lerp speed multiplier

// Tile types: ' '=floor, '#'=wall, '.'=target, '$'=box, '@'=player, '*'=box on target, '+'=player on target
// Internal grid uses numbers: 0=floor, 1=wall, 2=target, 3=box, 4=player, 5=box+target, 6=player+target

// Level definitions as string arrays
// Each level is hand-crafted and verified solvable
// Legend: # wall, . target, $ box, @ player, * box on target, + player on target, space floor
var LEVELS=[
// Level 1: Tutorial - one box, straight push (easy intro)
[
'#####',
'#  .#',
'# $ #',
'# @ #',
'#####'
],
// Level 2: Two boxes in a row
[
'######',
'#.   #',
'#. $ #',
'#  $ #',
'#  @ #',
'######'
],
// Level 3: Simple L-push
[
'#####',
'#. @#',
'#   #',
'# $ #',
'#   #',
'#####'
],
// Level 4: Two boxes, need to plan order
[
'######',
'#    #',
'# #  #',
'# $. #',
'# $. #',
'# @  #',
'######'
],
// Level 5: Wider room, two boxes
[
'#######',
'#     #',
'# .$. #',
'#  $  #',
'#  @  #',
'#######'
],
// Level 6: Three boxes, corridors
[
'########',
'#      #',
'# $ $  #',
'## ## ##',
'#...#  #',
'#   $  #',
'#  @   #',
'########'
],
// Level 7: Corners matter
[
'#######',
'#  .  #',
'# #.# #',
'#  .  #',
'# $$$ #',
'#  @  #',
'#######'
],
// Level 8: Room with internal walls
[
'########',
'#   #  #',
'# $  $ #',
'## .#. #',
' #  $  #',
' #. @  #',
' ######'
],
// Level 9: Four boxes, moderate challenge
[
'#########',
'#       #',
'# $ $ $ #',
'#  ###  #',
'# . . . #',
'#  # #$ #',
'#  .  @ #',
'#########'
],
// Level 10: The grand finale - four boxes, careful planning
[
' ########',
'## .  . #',
'#  #$$  #',
'#    #  #',
'## .  . #',
'#  #$$  #',
'#   # @ #',
'#########'
]
];

// Parse level string into grid, find player and boxes
function parseLevel(lvl){
    // Fix level 10 which has two @ symbols - use only the first
    var rows=lvl.length;
    var cols=0;
    for(var i=0;i<rows;i++) if(lvl[i].length>cols) cols=lvl[i].length;
    grid=[];
    var boxes=[];
    var targets=[];
    var foundPlayer=false;
    for(var r=0;r<rows;r++){
        grid[r]=[];
        for(var c=0;c<cols;c++){
            var ch=(c<lvl[r].length)?lvl[r][c]:' ';
            switch(ch){
                case '#': grid[r][c]=1; break;
                case '.': grid[r][c]=2; targets.push({r:r,c:c}); break;
                case '$': grid[r][c]=0; boxes.push({r:r,c:c}); break;
                case '@':
                    if(!foundPlayer){
                        grid[r][c]=0; playerR=r; playerC=c; foundPlayer=true;
                    } else {
                        // Second @ in level 10 — treat as target
                        grid[r][c]=2; targets.push({r:r,c:c});
                    }
                    break;
                case '*': grid[r][c]=2; boxes.push({r:r,c:c}); targets.push({r:r,c:c}); break;
                case '+': grid[r][c]=2; playerR=r; playerC=c; targets.push({r:r,c:c}); foundPlayer=true; break;
                default: grid[r][c]=0; break;
            }
        }
    }
    return {rows:rows,cols:cols,boxes:boxes,targets:targets};
}

var levelRows=0,levelCols=0,boxes=[],targets=[];

function loadLevel(n){
    if(n>=LEVELS.length) n=0;
    currentLevel=n;
    var parsed=parseLevel(LEVELS[n]);
    levelRows=parsed.rows;
    levelCols=parsed.cols;
    boxes=parsed.boxes;
    targets=parsed.targets;
    moves=0;
    history=[];
    particles=[];
    levelCompleteTimer=0;
    // Reset animation state
    animPlayer={r:playerR,c:playerC,tr:playerR,tc:playerC,t:1};
    animBoxes=[];
    calcLayout();
}

function calcLayout(){
    var maxCellW=Math.floor((W-40)/levelCols);
    var maxCellH=Math.floor((H-60)/levelRows);
    cellSize=Math.min(maxCellW,maxCellH);
    cellSize=Math.max(cellSize,20);
    cellSize=Math.min(cellSize,64);
    gridOffsetX=Math.floor((W-levelCols*cellSize)/2);
    gridOffsetY=Math.floor((H-levelRows*cellSize)/2)+10;
}

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    if(gameState==='playing'||gameState==='gameover') calcLayout();
}

// Check if a position has a box
function boxAt(r,c){
    for(var i=0;i<boxes.length;i++){
        if(boxes[i].r===r&&boxes[i].c===c) return i;
    }
    return -1;
}

// Check if a position is a wall
function isWall(r,c){
    if(r<0||r>=levelRows||c<0||c>=levelCols) return true;
    return grid[r][c]===1;
}

// Check if level is complete (all targets have boxes)
function isLevelComplete(){
    for(var i=0;i<targets.length;i++){
        if(boxAt(targets[i].r,targets[i].c)===-1) return false;
    }
    return true;
}

// Move player in direction (dr, dc)
function movePlayer(dr,dc){
    if(gameState!=='playing') return;
    if(levelCompleteTimer>0) return;
    // Don't move while animating
    if(animPlayer.t<1) return;

    var nr=playerR+dr;
    var nc=playerC+dc;
    playerDir={r:dr,c:dc};

    if(isWall(nr,nc)) return;

    var bi=boxAt(nr,nc);
    if(bi>=0){
        // Try to push box
        var br=nr+dr;
        var bc=nc+dc;
        if(isWall(br,bc)) return;
        if(boxAt(br,bc)>=0) return; // Can't push into another box

        // Save state for undo
        history.push({
            pr:playerR,pc:playerC,
            bi:bi,boxFromR:boxes[bi].r,boxFromC:boxes[bi].c,
            boxToR:br,boxToC:bc
        });

        // Animate box
        animBoxes.push({idx:bi,r:boxes[bi].r,c:boxes[bi].c,tr:br,tc:bc,t:0});

        // Move box
        boxes[bi].r=br;
        boxes[bi].c=bc;
    } else {
        // Save state for undo (no box pushed)
        history.push({
            pr:playerR,pc:playerC,
            bi:-1,boxFromR:0,boxFromC:0,
            boxToR:0,boxToC:0
        });
    }

    // Animate player
    animPlayer={r:playerR,c:playerC,tr:nr,tc:nc,t:0};

    // Move player
    playerR=nr;
    playerC=nc;
    moves++;

    // Check completion
    if(isLevelComplete()){
        levelCompleteTimer=0.01; // Start complete animation
        addCompletionParticles();
    }
}

function undoMove(){
    if(gameState!=='playing') return;
    if(history.length===0) return;
    if(levelCompleteTimer>0) return;

    var h=history.pop();
    playerR=h.pr;
    playerC=h.pc;
    animPlayer={r:playerR,c:playerC,tr:playerR,tc:playerC,t:1};

    if(h.bi>=0){
        boxes[h.bi].r=h.boxFromR;
        boxes[h.bi].c=h.boxFromC;
    }
    moves--;
    if(moves<0) moves=0;
}

function addCompletionParticles(){
    for(var i=0;i<targets.length;i++){
        var t=targets[i];
        var px=gridOffsetX+(t.c+0.5)*cellSize;
        var py=gridOffsetY+(t.r+0.5)*cellSize;
        for(var j=0;j<15;j++){
            var angle=Math.random()*Math.PI*2;
            var speed=60+Math.random()*120;
            particles.push({
                x:px,y:py,
                vx:Math.cos(angle)*speed,
                vy:Math.sin(angle)*speed,
                life:0.8+Math.random()*0.6,
                color:['#ffcc00','#00ff66','#00ccff','#ff66cc'][Math.floor(Math.random()*4)],
                size:2+Math.random()*4
            });
        }
    }
}

function addParticles(x,y,color,n){
    for(var i=0;i<n;i++){
        particles.push({
            x:x,y:y,
            vx:(Math.random()-0.5)*100,
            vy:(Math.random()-0.5)*100,
            life:0.3+Math.random()*0.4,
            color:color,
            size:2+Math.random()*3
        });
    }
}

// ---- UPDATE ----
function update(dt){
    if(dt>0.1) dt=0.1;
    gameTime+=dt;

    // Update animations
    if(animPlayer.t<1){
        animPlayer.t=Math.min(1,animPlayer.t+dt*ANIM_SPEED);
    }
    for(var i=animBoxes.length-1;i>=0;i--){
        animBoxes[i].t=Math.min(1,animBoxes[i].t+dt*ANIM_SPEED);
        if(animBoxes[i].t>=1) animBoxes.splice(i,1);
    }

    // Update particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.vy+=200*dt; // gravity on particles
        p.life-=dt;
        if(p.life<=0) particles.splice(i,1);
    }

    // Level complete timer
    if(levelCompleteTimer>0){
        levelCompleteTimer+=dt;
        if(levelCompleteTimer>2.5){
            if(currentLevel<totalLevels-1){
                loadLevel(currentLevel+1);
            } else {
                gameState='gameover'; // Beat all levels!
            }
        }
    }
}

// ---- RENDERING ----
function lerp(a,b,t){ return a+(b-a)*t; }
function easeOut(t){ return 1-(1-t)*(1-t); }

function drawFloor(x,y,s){
    // Tile floor with subtle gradient
    var fg=ctx.createLinearGradient(x,y,x+s,y+s);
    fg.addColorStop(0,'#ddd8d0');fg.addColorStop(0.5,'#d4d0c8');fg.addColorStop(1,'#ccc8c0');
    ctx.fillStyle=fg;
    ctx.fillRect(x,y,s,s);
    // Tile highlight and shadow for 3D
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(x,y,s,s*0.06);
    ctx.fillRect(x,y,s*0.06,s);
    ctx.fillStyle='rgba(0,0,0,0.06)';
    ctx.fillRect(x,y+s*0.94,s,s*0.06);
    ctx.fillRect(x+s*0.94,y,s*0.06,s);
    // Grid lines
    ctx.strokeStyle='rgba(0,0,0,0.06)';
    ctx.lineWidth=1;
    ctx.strokeRect(x+0.5,y+0.5,s-1,s-1);
}

function drawWall(x,y,s){
    // Dark stone block with 3D depth
    var g=ctx.createLinearGradient(x,y,x+s,y+s);
    g.addColorStop(0,'#5a5a6e');
    g.addColorStop(0.5,'#44445a');
    g.addColorStop(1,'#333348');
    ctx.fillStyle=g;
    ctx.fillRect(x,y,s,s);

    // Top highlight
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.fillRect(x,y,s,s*0.15);
    ctx.fillRect(x,y,s*0.1,s);

    // Bottom shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.fillRect(x,y+s*0.85,s,s*0.15);
    ctx.fillRect(x+s*0.9,y,s*0.1,s);

    // Brick pattern
    ctx.strokeStyle='rgba(0,0,0,0.2)';
    ctx.lineWidth=1;
    ctx.strokeRect(x+1,y+1,s-2,s-2);
    ctx.beginPath();
    ctx.moveTo(x+s*0.5,y);ctx.lineTo(x+s*0.5,y+s*0.5);
    ctx.moveTo(x,y+s*0.5);ctx.lineTo(x+s,y+s*0.5);
    ctx.moveTo(x+s*0.25,y+s*0.5);ctx.lineTo(x+s*0.25,y+s);
    ctx.moveTo(x+s*0.75,y+s*0.5);ctx.lineTo(x+s*0.75,y+s);
    ctx.stroke();
}

function drawTarget(x,y,s,t){
    // Glowing diamond
    var cx=x+s/2,cy=y+s/2;
    var pulse=0.7+0.3*Math.sin(t*4);
    var ds=s*0.25*pulse;

    // Glow
    ctx.shadowColor='#00ccff';
    ctx.shadowBlur=8+4*Math.sin(t*4);
    ctx.fillStyle='rgba(0,200,255,'+0.3*pulse+')';
    ctx.beginPath();
    ctx.moveTo(cx,cy-ds*1.5);
    ctx.lineTo(cx+ds*1.5,cy);
    ctx.lineTo(cx,cy+ds*1.5);
    ctx.lineTo(cx-ds*1.5,cy);
    ctx.closePath();
    ctx.fill();

    // Diamond
    ctx.fillStyle='#00ccff';
    ctx.beginPath();
    ctx.moveTo(cx,cy-ds);
    ctx.lineTo(cx+ds,cy);
    ctx.lineTo(cx,cy+ds);
    ctx.lineTo(cx-ds,cy);
    ctx.closePath();
    ctx.fill();

    // Inner highlight
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(cx,cy-ds*0.5);
    ctx.lineTo(cx+ds*0.3,cy);
    ctx.lineTo(cx,cy+ds*0.3);
    ctx.lineTo(cx-ds*0.3,cy);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur=0;
}

function drawBox(x,y,s,onTarget){
    var pad=s*0.08;
    var bx=x+pad,by=y+pad,bs=s-pad*2;

    // Box body
    if(onTarget){
        var g=ctx.createLinearGradient(bx,by,bx+bs,by+bs);
        g.addColorStop(0,'#4caf50');
        g.addColorStop(1,'#2e7d32');
        ctx.fillStyle=g;
    } else {
        var g=ctx.createLinearGradient(bx,by,bx+bs,by+bs);
        g.addColorStop(0,'#c8a050');
        g.addColorStop(1,'#8b6914');
        ctx.fillStyle=g;
    }

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.fillRect(bx+3,by+3,bs,bs);

    // Main box
    if(onTarget){
        var g2=ctx.createLinearGradient(bx,by,bx+bs,by+bs);
        g2.addColorStop(0,'#66bb6a');
        g2.addColorStop(1,'#388e3c');
        ctx.fillStyle=g2;
    } else {
        var g2=ctx.createLinearGradient(bx,by,bx+bs,by+bs);
        g2.addColorStop(0,'#d4a84b');
        g2.addColorStop(1,'#9b7320');
        ctx.fillStyle=g2;
    }
    ctx.fillRect(bx,by,bs,bs);

    // Top highlight
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.fillRect(bx,by,bs,bs*0.15);

    // Cross pattern
    ctx.strokeStyle=onTarget?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.2)';
    ctx.lineWidth=Math.max(1,s*0.04);
    ctx.beginPath();
    ctx.moveTo(bx+bs*0.2,by+bs*0.2);
    ctx.lineTo(bx+bs*0.8,by+bs*0.8);
    ctx.moveTo(bx+bs*0.8,by+bs*0.2);
    ctx.lineTo(bx+bs*0.2,by+bs*0.8);
    ctx.stroke();

    // Border
    ctx.strokeStyle=onTarget?'#2e7d32':'#6b4c00';
    ctx.lineWidth=Math.max(1,s*0.04);
    ctx.strokeRect(bx,by,bs,bs);

    // Green glow if on target
    if(onTarget){
        ctx.shadowColor='#4caf50';
        ctx.shadowBlur=10;
        ctx.strokeStyle='rgba(76,175,80,0.5)';
        ctx.lineWidth=2;
        ctx.strokeRect(bx-1,by-1,bs+2,bs+2);
        ctx.shadowBlur=0;
    }
}

function drawPlayer(x,y,s,dir){
    var cx=x+s/2,cy=y+s/2;
    var r=s*0.35;

    ctx.save();
    // Shadow with soft edge
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx+2,cy+s*0.15,r*0.9,r*0.4,0,0,Math.PI*2);
    ctx.fill();

    // Body with rich gradient
    ctx.shadowColor='rgba(255,100,50,0.3)';ctx.shadowBlur=6;
    var g=ctx.createRadialGradient(cx-r*0.25,cy-r*0.35-s*0.05,r*0.1,cx,cy-s*0.05,r);
    g.addColorStop(0,'#ffaa88');g.addColorStop(0.5,'#ff8866');g.addColorStop(1,'#cc4433');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(cx,cy-s*0.05,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;

    // Outline
    ctx.strokeStyle='#992211';ctx.lineWidth=Math.max(1,s*0.03);
    ctx.beginPath();ctx.arc(cx,cy-s*0.05,r,0,Math.PI*2);ctx.stroke();

    // Cheek blush
    ctx.fillStyle='rgba(255,120,100,0.3)';
    ctx.beginPath();ctx.ellipse(cx-r*0.5,cy+r*0.05,r*0.15,r*0.1,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx+r*0.5,cy+r*0.05,r*0.15,r*0.1,0,0,Math.PI*2);ctx.fill();

    // Eyes with improved detail
    var ex=dir.c*r*0.25;
    var ey=dir.r*r*0.25;
    var eyeR=Math.max(2,s*0.07);
    // Blink animation
    var blinkPhase=Math.sin(gameTime*0.8);
    var eyeScaleY=blinkPhase>0.97?0.2:1.0;

    // Left eye
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(cx-r*0.3+ex,cy-s*0.12+ey,eyeR*1.3,eyeR*1.3*eyeScaleY,0,0,Math.PI*2);ctx.fill();
    if(eyeScaleY>0.5){
    ctx.fillStyle='#332211';
    ctx.beginPath();ctx.arc(cx-r*0.3+ex+dir.c*eyeR*0.3,cy-s*0.12+ey+dir.r*eyeR*0.3,eyeR*0.6,0,Math.PI*2);ctx.fill();
    // Eye shine
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(cx-r*0.3+ex+dir.c*eyeR*0.1-eyeR*0.2,cy-s*0.12+ey-eyeR*0.3,eyeR*0.2,0,Math.PI*2);ctx.fill();
    }

    // Right eye
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(cx+r*0.3+ex,cy-s*0.12+ey,eyeR*1.3,eyeR*1.3*eyeScaleY,0,0,Math.PI*2);ctx.fill();
    if(eyeScaleY>0.5){
    ctx.fillStyle='#332211';
    ctx.beginPath();ctx.arc(cx+r*0.3+ex+dir.c*eyeR*0.3,cy-s*0.12+ey+dir.r*eyeR*0.3,eyeR*0.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(cx+r*0.3+ex+dir.c*eyeR*0.1-eyeR*0.2,cy-s*0.12+ey-eyeR*0.3,eyeR*0.2,0,Math.PI*2);ctx.fill();
    }

    // Smile/expression
    ctx.strokeStyle='#992211';ctx.lineWidth=Math.max(1,s*0.03);
    ctx.beginPath();ctx.arc(cx+ex*0.5,cy+r*0.1+ey*0.3,r*0.25,0.1*Math.PI,0.9*Math.PI);ctx.stroke();

    // Tiny cap/hat
    ctx.fillStyle='#4488cc';
    ctx.beginPath();
    ctx.ellipse(cx,cy-s*0.05-r*0.85,r*0.5,r*0.2,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#3377bb';
    ctx.beginPath();
    ctx.ellipse(cx,cy-s*0.05-r*0.95,r*0.25,r*0.15,0,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
}

function render(){
    // Rich background gradient
    var bgG=ctx.createLinearGradient(0,0,0,H);
    bgG.addColorStop(0,'#2a2a42');bgG.addColorStop(0.5,'#222236');bgG.addColorStop(1,'#1a1a2e');
    ctx.fillStyle=bgG;
    ctx.fillRect(0,0,W,H);
    // Subtle vignette
    var vig=ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.8);
    vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.15)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);

    // Draw grid
    for(var r=0;r<levelRows;r++){
        for(var c=0;c<levelCols;c++){
            var x=gridOffsetX+c*cellSize;
            var y=gridOffsetY+r*cellSize;

            if(grid[r][c]===1){
                drawWall(x,y,cellSize);
            } else {
                drawFloor(x,y,cellSize);
                // Draw target if this is a target cell
                if(grid[r][c]===2){
                    drawTarget(x,y,cellSize,gameTime);
                }
            }
        }
    }

    // Draw boxes (handle animation)
    for(var i=0;i<boxes.length;i++){
        var b=boxes[i];
        var bx=b.c,by=b.r;

        // Check if this box is currently animating
        var animating=false;
        for(var a=0;a<animBoxes.length;a++){
            if(animBoxes[a].idx===i){
                var ab=animBoxes[a];
                var et=easeOut(ab.t);
                bx=lerp(ab.c,ab.tc,et);
                by=lerp(ab.r,ab.tr,et);
                animating=true;
                break;
            }
        }

        var px=gridOffsetX+bx*cellSize;
        var py=gridOffsetY+by*cellSize;
        var onT=false;
        for(var j=0;j<targets.length;j++){
            if(targets[j].r===b.r&&targets[j].c===b.c){ onT=true; break; }
        }
        drawBox(px,py,cellSize,onT);
    }

    // Draw player (animated)
    var pr,pc;
    if(animPlayer.t<1){
        var et=easeOut(animPlayer.t);
        pc=lerp(animPlayer.c,animPlayer.tc,et);
        pr=lerp(animPlayer.r,animPlayer.tr,et);
    } else {
        pr=playerR;
        pc=playerC;
    }
    drawPlayer(gridOffsetX+pc*cellSize,gridOffsetY+pr*cellSize,cellSize,playerDir);

    // Draw particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life);
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;

    // Level & moves display
    var fs=Math.round(W*0.025);
    ctx.font='bold '+fs+'px "Courier New",monospace';
    ctx.textAlign='left';
    ctx.fillStyle='#ffcc00';
    ctx.fillText('Level '+(currentLevel+1)+'/'+totalLevels,gridOffsetX,gridOffsetY-10);
    ctx.textAlign='right';
    ctx.fillStyle='#aaa';
    ctx.fillText('Moves: '+moves,gridOffsetX+levelCols*cellSize,gridOffsetY-10);

    // Level complete overlay
    if(levelCompleteTimer>0){
        var alpha=Math.min(1,levelCompleteTimer*2);
        ctx.fillStyle='rgba(0,0,0,'+alpha*0.4+')';
        ctx.fillRect(0,0,W,H);
        ctx.save();
        ctx.textAlign='center';
        ctx.shadowColor='#00ff66';
        ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
        ctx.fillStyle='#00ff66';
        ctx.fillText('LEVEL COMPLETE!',W/2,H*0.4);
        ctx.shadowBlur=0;
        ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('Moves: '+moves,W/2,H*0.52);
        ctx.restore();
    }
}

// ---- TITLE SCREEN ----
var titleDemoT=0;
var titleDemoPhase=0;
var titleBoxX=0,titleBoxY=0;
var titlePlayerX=0,titlePlayerY=0;

function drawTitle(dt){
    ctx.fillStyle='#1a1a2e';
    ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    titleDemoT+=dt;

    // Animated box-pushing demo
    var demoSize=Math.min(W*0.06,40);
    var demoCX=W/2,demoCY=H*0.55;

    // Simple demo: player pushes box back and forth
    var cycle=titleDemoT%6;
    var demoPlayerX,demoPlayerY,demoBoxX,demoBoxY;

    if(cycle<1.5){
        // Push right
        var t=cycle/1.5;
        demoPlayerX=demoCX-demoSize*2+t*demoSize;
        demoBoxX=demoCX-demoSize+t*demoSize;
        demoPlayerY=demoCY;demoBoxY=demoCY;
    } else if(cycle<3){
        // Idle right side
        demoPlayerX=demoCX-demoSize*0.5;
        demoBoxX=demoCX+demoSize*0.5;
        demoPlayerY=demoCY;demoBoxY=demoCY;
    } else if(cycle<4.5){
        // Push down
        var t=(cycle-3)/1.5;
        demoPlayerX=demoCX-demoSize*0.5;
        demoBoxX=demoCX+demoSize*0.5;
        demoPlayerY=demoCY;
        demoBoxY=demoCY+t*demoSize;
        demoPlayerX=demoCX+demoSize*0.5;
        demoPlayerY=demoCY-demoSize+t*demoSize;
    } else {
        // Idle
        demoPlayerX=demoCX+demoSize*0.5;
        demoPlayerY=demoCY+demoSize*0.5-demoSize;
        demoBoxX=demoCX+demoSize*0.5;
        demoBoxY=demoCY+demoSize*0.5;
    }

    // Draw demo floor
    for(var dx=-2;dx<=2;dx++){
        for(var dy=-1;dy<=2;dy++){
            drawFloor(demoCX+dx*demoSize-demoSize*0.5,demoCY+dy*demoSize-demoSize*0.5,demoSize);
        }
    }
    // Draw a target in demo
    drawTarget(demoCX+demoSize*0.5-demoSize*0.5,demoCY+demoSize*1.5-demoSize*0.5,demoSize,titlePulse);

    // Draw demo box
    var demoOnTarget=Math.abs(demoBoxX-(demoCX+demoSize*0.5-demoSize*0.5))<5&&Math.abs(demoBoxY-(demoCY+demoSize*1.5-demoSize*0.5))<5;
    drawBox(demoBoxX-demoSize*0.5,demoBoxY-demoSize*0.5,demoSize,demoOnTarget);

    // Draw demo player
    drawPlayer(demoPlayerX-demoSize*0.5,demoPlayerY-demoSize*0.5,demoSize,{r:0,c:1});

    // Title text
    ctx.save();
    ctx.textAlign='center';
    ctx.shadowColor='#d4a84b';
    ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
    ctx.fillStyle='#d4a84b';
    ctx.fillText('SOKOBAN',W/2,H*0.2);
    ctx.shadowBlur=0;

    ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillStyle='#aaa';
    ctx.fillText('Push all boxes onto diamond targets',W/2,H*0.28);

    // Controls
    ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.fillStyle='#888';
    ctx.fillText('Arrow Keys / WASD to move',W/2,H*0.76);
    ctx.fillText('Z = Undo    R = Reset',W/2,H*0.81);

    // Blink prompt
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.92);
    ctx.restore();
}

// ---- GAME OVER (ALL LEVELS COMPLETE) ----
function drawGameOver(){
    render(); // draw last level state behind
    ctx.fillStyle='rgba(0,0,0,0.8)';
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';
    ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';
    ctx.fillText('CONGRATULATIONS!',W/2,H*0.25);
    ctx.shadowBlur=0;

    ctx.fillStyle='#00ff66';
    ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('All '+totalLevels+' Levels Complete!',W/2,H*0.40);

    ctx.fillStyle='#aaa';
    ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('Total Moves: '+moves,W/2,H*0.52);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

// ---- HUD ----
function updateHUD(){
    var scoreEl=document.getElementById('hud-score');
    var speedEl=document.getElementById('hud-speed');
    var timeEl=document.getElementById('hud-time');
    if(scoreEl) scoreEl.textContent='LVL '+(currentLevel+1);
    if(speedEl) speedEl.textContent='MOVES '+moves;
    if(timeEl) timeEl.textContent=Math.floor(gameTime)+'s';
}

// ---- GAME LOOP ----
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5) dt=0.016;
    lastTs=ts;

    if(gameState==='title'){
        drawTitle(dt);
    } else if(gameState==='playing'){
        update(dt);
        render();
        updateHUD();
    } else if(gameState==='gameover'){
        titlePulse+=dt*3;
        update(dt); // keep particles alive
        drawGameOver();
    }
    animId=requestAnimationFrame(gameLoop);
}

// ---- INPUT ----
function startGame(){
    loadLevel(0);
    gameState='playing';
    gameTime=0;
}

function onKey(e,down){
    if(!down) return;
    var key=e.key;

    if((key==='Enter'||key==='Tab')&&gameState!=='playing'){
        if(gameState==='title') startGame();
        else if(gameState==='gameover'){ gameState='title'; titlePulse=0; titleDemoT=0; }
        e.preventDefault();
        return;
    }

    if(gameState!=='playing') return;

    if(key==='ArrowLeft'||key==='a'||key==='A') movePlayer(0,-1);
    else if(key==='ArrowRight'||key==='d'||key==='D') movePlayer(0,1);
    else if(key==='ArrowUp'||key==='w'||key==='W') movePlayer(-1,0);
    else if(key==='ArrowDown'||key==='s'||key==='S') movePlayer(1,0);
    else if(key==='z'||key==='Z') undoMove();
    else if(key==='r'||key==='R') loadLevel(currentLevel);

    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(key)!==-1) e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,set){
    var el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('touchstart',function(e){e.preventDefault();set();});
    el.addEventListener('mousedown',function(){set();});
}

// ---- INIT / STOP ----
window.initSokoban=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);
    resize();
    document.addEventListener('keydown',kd);

    bindMobile('btn-left',function(){ movePlayer(0,-1); });
    bindMobile('btn-right',function(){ movePlayer(0,1); });
    bindMobile('btn-up',function(){ movePlayer(-1,0); });
    bindMobile('btn-down',function(){ movePlayer(1,0); });

    canvas.addEventListener('click',function(){
        if(gameState==='title') startGame();
        else if(gameState==='gameover'){ gameState='title'; titlePulse=0; titleDemoT=0; }
    });

    gameState='title';
    titlePulse=0;
    titleDemoT=0;
    lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopSokoban=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
