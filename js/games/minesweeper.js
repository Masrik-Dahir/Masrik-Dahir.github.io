// Minesweeper — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0;
var ROWS=9,COLS=9,MINES=10;
var grid=[],revealed=[],flagged=[],mineMap=[];
var minesRemaining=MINES,timer=0,firstClick=true,gameTime=0;
var cellSize,gridOffsetX,gridOffsetY;
var revealAnim=[]; // tracks animation progress per cell
var particles=[];
var hitMine=null; // {r,c} of mine that killed player
var smileyState='happy'; // 'happy','dead','cool'
var touchTimer=null,touchStartPos=null,longPressTriggered=false;

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

var NUM_COLORS=['','#0000ff','#008000','#ff0000','#000080','#800000','#008080','#000000','#808080'];

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    calcGrid();
}

function calcGrid(){
    var maxCellW=Math.floor((W-40)/COLS);
    var maxCellH=Math.floor((H-60)/ROWS);
    cellSize=Math.min(maxCellW,maxCellH);
    cellSize=Math.max(cellSize,20);
    gridOffsetX=Math.floor((W-COLS*cellSize)/2);
    gridOffsetY=Math.floor((H-ROWS*cellSize)/2)+10;
}

function initGrid(){
    grid=[];revealed=[];flagged=[];mineMap=[];revealAnim=[];
    for(var r=0;r<ROWS;r++){
        grid[r]=[];revealed[r]=[];flagged[r]=[];mineMap[r]=[];revealAnim[r]=[];
        for(var c=0;c<COLS;c++){
            grid[r][c]=0;revealed[r][c]=false;flagged[r][c]=false;mineMap[r][c]=false;revealAnim[r][c]=1;
        }
    }
}

function placeMines(safeR,safeC){
    var placed=0;
    while(placed<MINES){
        var r=Math.floor(Math.random()*ROWS);
        var c=Math.floor(Math.random()*COLS);
        if(mineMap[r][c])continue;
        // safe zone: clicked cell and all neighbors
        if(Math.abs(r-safeR)<=1&&Math.abs(c-safeC)<=1)continue;
        mineMap[r][c]=true;placed++;
    }
    // calculate numbers
    for(var r=0;r<ROWS;r++){
        for(var c=0;c<COLS;c++){
            if(mineMap[r][c]){grid[r][c]=-1;continue;}
            var count=0;
            for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
                if(dr===0&&dc===0)continue;
                var nr=r+dr,nc=c+dc;
                if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&mineMap[nr][nc])count++;
            }
            grid[r][c]=count;
        }
    }
}

function floodFill(r,c){
    // BFS to reveal all connected zeros and their number borders
    var queue=[{r:r,c:c}];
    while(queue.length>0){
        var cell=queue.shift();
        var cr=cell.r,cc=cell.c;
        if(cr<0||cr>=ROWS||cc<0||cc>=COLS)continue;
        if(revealed[cr][cc]||flagged[cr][cc])continue;
        revealed[cr][cc]=true;
        revealAnim[cr][cc]=0; // start animation
        if(grid[cr][cc]===0){
            for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
                if(dr===0&&dc===0)continue;
                var nr=cr+dr,nc=cc+dc;
                if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!revealed[nr][nc]){
                    queue.push({r:nr,c:nc});
                }
            }
        }
    }
}

function revealCell(r,c){
    if(r<0||r>=ROWS||c<0||c>=COLS)return;
    if(revealed[r][c]||flagged[r][c])return;
    if(firstClick){
        placeMines(r,c);
        firstClick=false;
    }
    if(mineMap[r][c]){
        // hit a mine
        hitMine={r:r,c:c};
        revealed[r][c]=true;
        revealAnim[r][c]=0;
        // reveal all mines
        for(var mr=0;mr<ROWS;mr++)for(var mc=0;mc<COLS;mc++){
            if(mineMap[mr][mc]){revealed[mr][mc]=true;revealAnim[mr][mc]=0;}
        }
        gameState='gameover';
        smileyState='dead';
        addParticles(gridOffsetX+c*cellSize+cellSize/2,gridOffsetY+r*cellSize+cellSize/2,'#ff0000',25);
        return;
    }
    if(grid[r][c]===0){
        floodFill(r,c);
    } else {
        revealed[r][c]=true;
        revealAnim[r][c]=0;
    }
    checkWin();
}

function toggleFlag(r,c){
    if(r<0||r>=ROWS||c<0||c>=COLS)return;
    if(revealed[r][c])return;
    flagged[r][c]=!flagged[r][c];
    minesRemaining=MINES;
    for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
        if(flagged[rr][cc])minesRemaining--;
    }
}

function checkWin(){
    var unrevealed=0;
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(!revealed[r][c])unrevealed++;
    }
    if(unrevealed===MINES){
        gameState='won';
        smileyState='cool';
        // flag all remaining mines
        for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
            if(mineMap[r][c]&&!flagged[r][c])flagged[r][c]=true;
        }
        minesRemaining=0;
        // celebration particles
        for(var i=0;i<60;i++){
            var px=Math.random()*W,py=Math.random()*H;
            addParticles(px,py,['#ff3355','#00ff66','#ffcc00','#00ccff'][Math.floor(Math.random()*4)],3);
        }
    }
}

function addParticles(x,y,c,n){
    for(var i=0;i<n;i++){
        particles.push({x:x,y:y,
            vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200-80,
            life:0.6+Math.random()*0.5,color:c,size:2+Math.random()*4});
    }
}

function resetGame(){
    initGrid();firstClick=true;minesRemaining=MINES;timer=0;gameTime=0;
    hitMine=null;particles=[];smileyState='happy';gameState='playing';
}

function getCellFromPos(px,py){
    var c=Math.floor((px-gridOffsetX)/cellSize);
    var r=Math.floor((py-gridOffsetY)/cellSize);
    if(r>=0&&r<ROWS&&c>=0&&c<COLS)return{r:r,c:c};
    return null;
}

// ---- UPDATE ----
function update(dt){
    if(dt>0.1)dt=0.1;
    if(gameState==='playing'&&!firstClick){
        timer+=dt;
    }
    gameTime+=dt;
    // animate reveal
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(revealAnim[r][c]<1){
            revealAnim[r][c]=Math.min(1,revealAnim[r][c]+dt*6);
        }
    }
    // particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;
        p.life-=dt;if(p.life<=0)particles.splice(i,1);
    }
}

// ---- RENDER ----
function drawCell(r,c){
    var x=gridOffsetX+c*cellSize;
    var y=gridOffsetY+r*cellSize;
    var pad=1;
    var anim=revealAnim[r][c];

    if(!revealed[r][c]){
        // unrevealed: enhanced 3D raised look
        var bevel=Math.max(2,cellSize*0.08);
        // face with subtle gradient
        var cellGrad=ctx.createLinearGradient(x,y,x,y+cellSize);
        cellGrad.addColorStop(0,'#d0d0d0');cellGrad.addColorStop(0.5,'#c0c0c0');cellGrad.addColorStop(1,'#b0b0b0');
        ctx.fillStyle=cellGrad;
        ctx.fillRect(x+pad,y+pad,cellSize-pad*2,cellSize-pad*2);
        // top/left highlight (brighter)
        ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.fillRect(x+pad,y+pad,cellSize-pad*2,bevel);
        ctx.fillRect(x+pad,y+pad,bevel,cellSize-pad*2);
        // inner subtle highlight
        ctx.fillStyle='rgba(255,255,255,0.1)';
        ctx.fillRect(x+pad+bevel,y+pad+bevel,cellSize-pad*2-bevel*2,cellSize-pad*2-bevel*2);
        // bottom/right shadow (darker)
        ctx.fillStyle='rgba(0,0,0,0.35)';
        ctx.fillRect(x+pad,y+cellSize-pad-bevel,cellSize-pad*2,bevel);
        ctx.fillRect(x+cellSize-pad-bevel,y+pad,bevel,cellSize-pad*2);

        // flag
        if(flagged[r][c]){
            var cx2=x+cellSize/2,cy2=y+cellSize/2;
            var fs=cellSize*0.3;
            // pole
            ctx.strokeStyle='#333';
            ctx.lineWidth=Math.max(1,cellSize*0.05);
            ctx.beginPath();ctx.moveTo(cx2,cy2-fs);ctx.lineTo(cx2,cy2+fs*0.7);ctx.stroke();
            // flag triangle
            ctx.fillStyle='#ff0000';
            ctx.beginPath();
            ctx.moveTo(cx2,cy2-fs);
            ctx.lineTo(cx2+fs*0.8,cy2-fs*0.4);
            ctx.lineTo(cx2,cy2+fs*0.1);
            ctx.closePath();ctx.fill();
            // base
            ctx.fillStyle='#333';
            ctx.fillRect(cx2-fs*0.4,cy2+fs*0.5,fs*0.8,fs*0.25);
        }
    } else {
        // revealed cell with animation (scale from 0 to 1)
        var scale=anim;
        var cx2=x+cellSize/2,cy2=y+cellSize/2;
        var size=(cellSize-pad*2)*scale;

        // check if this is the mine that killed player
        if(hitMine&&hitMine.r===r&&hitMine.c===c){
            ctx.fillStyle='#ff0000';
        } else {
            ctx.fillStyle='#d8d8d8';
        }
        ctx.fillRect(cx2-size/2,cy2-size/2,size,size);
        // border
        ctx.strokeStyle='#b0b0b0';
        ctx.lineWidth=1;
        ctx.strokeRect(cx2-size/2,cy2-size/2,size,size);

        if(scale>0.5){
            var alpha=Math.min(1,(scale-0.5)*2);
            ctx.globalAlpha=alpha;

            if(mineMap[r][c]){
                // draw mine
                drawMine(cx2,cy2,cellSize*0.3);
            } else if(grid[r][c]>0){
                // draw number with shadow for readability
                var nc=NUM_COLORS[grid[r][c]]||'#000';
                ctx.fillStyle='rgba(0,0,0,0.15)';
                ctx.font='bold '+Math.round(cellSize*0.55)+'px "Courier New",monospace';
                ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillText(grid[r][c],cx2+1,cy2+cellSize*0.03+1);
                ctx.fillStyle=nc;
                ctx.fillText(grid[r][c],cx2,cy2+cellSize*0.03);
            }
            ctx.globalAlpha=1;
        }
    }
}

function drawMine(cx,cy,radius){
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();ctx.arc(cx+1,cy+1,radius*0.65,0,Math.PI*2);ctx.fill();
    // black circle body with gradient
    var mineG=ctx.createRadialGradient(cx-radius*0.2,cy-radius*0.2,radius*0.1,cx,cy,radius*0.6);
    mineG.addColorStop(0,'#333');mineG.addColorStop(1,'#000');
    ctx.fillStyle=mineG;
    ctx.beginPath();ctx.arc(cx,cy,radius*0.6,0,Math.PI*2);ctx.fill();
    // spikes with rounded tips
    ctx.strokeStyle='#111';
    ctx.lineWidth=Math.max(1.5,radius*0.15);
    ctx.lineCap='round';
    for(var i=0;i<8;i++){
        var angle=i*Math.PI/4;
        var x1=cx+Math.cos(angle)*radius*0.3;
        var y1=cy+Math.sin(angle)*radius*0.3;
        var x2=cx+Math.cos(angle)*radius;
        var y2=cy+Math.sin(angle)*radius;
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    }
    ctx.lineCap='butt';
    // main highlight
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.arc(cx-radius*0.2,cy-radius*0.2,radius*0.17,0,Math.PI*2);ctx.fill();
    // secondary highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.beginPath();ctx.arc(cx-radius*0.1,cy-radius*0.05,radius*0.08,0,Math.PI*2);ctx.fill();
}

function drawSmiley(cx,cy,size){
    // background circle
    ctx.fillStyle='#ffcc00';
    ctx.beginPath();ctx.arc(cx,cy,size,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#996600';ctx.lineWidth=Math.max(1,size*0.08);
    ctx.beginPath();ctx.arc(cx,cy,size,0,Math.PI*2);ctx.stroke();

    var eyeOff=size*0.3,eyeY=cy-size*0.15,eyeR=size*0.12;

    if(smileyState==='happy'){
        // eyes
        ctx.fillStyle='#000';
        ctx.beginPath();ctx.arc(cx-eyeOff,eyeY,eyeR,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(cx+eyeOff,eyeY,eyeR,0,Math.PI*2);ctx.fill();
        // smile
        ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size*0.08);
        ctx.beginPath();ctx.arc(cx,cy+size*0.05,size*0.45,0.2,Math.PI-0.2);ctx.stroke();
    } else if(smileyState==='dead'){
        // X eyes
        ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size*0.1);
        var xs=eyeR*1.2;
        ctx.beginPath();ctx.moveTo(cx-eyeOff-xs,eyeY-xs);ctx.lineTo(cx-eyeOff+xs,eyeY+xs);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-eyeOff+xs,eyeY-xs);ctx.lineTo(cx-eyeOff-xs,eyeY+xs);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+eyeOff-xs,eyeY-xs);ctx.lineTo(cx+eyeOff+xs,eyeY+xs);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+eyeOff+xs,eyeY-xs);ctx.lineTo(cx+eyeOff-xs,eyeY+xs);ctx.stroke();
        // frown
        ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size*0.08);
        ctx.beginPath();ctx.arc(cx,cy+size*0.55,size*0.35,Math.PI+0.3,2*Math.PI-0.3);ctx.stroke();
    } else if(smileyState==='cool'){
        // sunglasses
        ctx.fillStyle='#000';
        var gw=size*0.32,gh=size*0.22;
        ctx.fillRect(cx-eyeOff-gw/2,eyeY-gh/2,gw,gh);
        ctx.fillRect(cx+eyeOff-gw/2,eyeY-gh/2,gw,gh);
        ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size*0.06);
        ctx.beginPath();ctx.moveTo(cx-eyeOff+gw/2,eyeY);ctx.lineTo(cx+eyeOff-gw/2,eyeY);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-eyeOff-gw/2,eyeY);ctx.lineTo(cx-size,eyeY-size*0.15);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+eyeOff+gw/2,eyeY);ctx.lineTo(cx+size,eyeY-size*0.15);ctx.stroke();
        // grin
        ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size*0.08);
        ctx.beginPath();ctx.arc(cx,cy+size*0.05,size*0.45,0.1,Math.PI-0.1);ctx.stroke();
    }
}

function render(){
    // background
    ctx.fillStyle='#a0a0a0';ctx.fillRect(0,0,W,H);

    // subtle gradient background
    var grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#b8b8c8');grad.addColorStop(1,'#909098');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);

    // draw grid
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        drawCell(r,c);
    }

    // grid border
    var bevel=3;
    ctx.strokeStyle='#808080';ctx.lineWidth=bevel;
    ctx.strokeRect(gridOffsetX-bevel,gridOffsetY-bevel,COLS*cellSize+bevel*2,ROWS*cellSize+bevel*2);
    // top-left darkened inset
    ctx.strokeStyle='#606060';ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(gridOffsetX-bevel,gridOffsetY+ROWS*cellSize+bevel);
    ctx.lineTo(gridOffsetX-bevel,gridOffsetY-bevel);
    ctx.lineTo(gridOffsetX+COLS*cellSize+bevel,gridOffsetY-bevel);
    ctx.stroke();

    // smiley
    var smileySize=Math.min(cellSize*0.6,20);
    var smileyY=gridOffsetY-smileySize*1.8;
    drawSmiley(W/2,smileyY,smileySize);

    // mines counter (left)
    ctx.fillStyle='#300';
    var counterH=smileySize*1.8,counterW=cellSize*2.2;
    var counterY=smileyY-counterH/2;
    ctx.fillRect(gridOffsetX,counterY,counterW,counterH);
    ctx.fillStyle='#ff0000';
    ctx.font='bold '+Math.round(counterH*0.7)+'px "Courier New",monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var displayMines=Math.max(-99,minesRemaining);
    ctx.fillText((displayMines<10&&displayMines>=0?'0':'')+displayMines,gridOffsetX+counterW/2,smileyY);

    // timer (right)
    ctx.fillStyle='#300';
    ctx.fillRect(gridOffsetX+COLS*cellSize-counterW,counterY,counterW,counterH);
    ctx.fillStyle='#ff0000';
    var displayTime=Math.min(999,Math.floor(timer));
    var timeStr=displayTime<100?(displayTime<10?'00'+displayTime:'0'+displayTime):''+displayTime;
    ctx.fillText(timeStr,gridOffsetX+COLS*cellSize-counterW/2,smileyY);

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life/0.8);
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
}

function drawTitle(dt){
    ctx.fillStyle='#2c3e50';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;

    // draw a mini preview grid
    var previewCell=Math.min(Math.floor(W*0.04),20);
    var previewX=Math.floor((W-9*previewCell)/2);
    var previewY=Math.floor(H*0.4);
    for(var r=0;r<9;r++)for(var c=0;c<9;c++){
        var x=previewX+c*previewCell,y=previewY+r*previewCell;
        var bvl=Math.max(1,previewCell*0.08);
        ctx.fillStyle='#c0c0c0';
        ctx.fillRect(x+1,y+1,previewCell-2,previewCell-2);
        ctx.fillStyle='#fff';ctx.fillRect(x+1,y+1,previewCell-2,bvl);
        ctx.fillStyle='#808080';ctx.fillRect(x+1,y+previewCell-1-bvl,previewCell-2,bvl);
        // randomly show some "revealed" cells
        var idx=r*9+c;
        var wave=Math.sin(titlePulse*0.5+idx*0.3)*0.5+0.5;
        if(wave>0.7){
            ctx.fillStyle='#d8d8d8';ctx.fillRect(x+1,y+1,previewCell-2,previewCell-2);
            if(idx%7===0){
                ctx.fillStyle='#0000ff';ctx.font='bold '+Math.round(previewCell*0.5)+'px "Courier New",monospace';
                ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillText(''+(idx%3+1),x+previewCell/2,y+previewCell/2);
            }
        }
        // show a couple flags
        if(idx===20||idx===55){
            ctx.fillStyle='#ff0000';
            ctx.beginPath();
            var fx=x+previewCell/2,fy=y+previewCell*0.3;
            ctx.moveTo(fx,fy);ctx.lineTo(fx+previewCell*0.25,fy+previewCell*0.15);ctx.lineTo(fx,fy+previewCell*0.3);
            ctx.closePath();ctx.fill();
        }
    }

    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#3498db';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ecf0f1';ctx.fillText('MINESWEEPER',W/2,H*0.18);
    ctx.shadowBlur=0;

    ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillStyle='#3498db';ctx.fillText('9 x 9  \u2022  10 MINES  \u2022  BEGINNER',W/2,H*0.26);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.82);

    ctx.fillStyle='#95a5a6';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Left-click: Reveal  \u2022  Right-click: Flag',W/2,H*0.89);
    ctx.fillText('Mobile: Tap to reveal  \u2022  Long-press to flag',W/2,H*0.93);
    ctx.restore();
}

function drawGameOver(){
    render(); // draw the board underneath
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('Time: '+Math.floor(timer)+'s',W/2,H*0.32);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.88);
    ctx.restore();
}

function drawWon(){
    render(); // draw the board underneath
    ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#00ff66';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#00ff66';ctx.fillText('YOU WIN!',W/2,H*0.2);ctx.shadowBlur=0;

    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('TIME: '+Math.floor(timer)+'s',W/2,H*0.32);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.88);
    ctx.restore();
}

function updateHUD(){
    var scoreEl=document.getElementById('hud-score');
    var speedEl=document.getElementById('hud-speed');
    var timeEl=document.getElementById('hud-time');
    if(scoreEl) scoreEl.textContent=(gameState==='won'?'WIN!':'MINES');
    if(speedEl) speedEl.textContent=minesRemaining+' left';
    if(timeEl) timeEl.textContent=Math.floor(timer)+'s';
}

// ---- GAME LOOP ----
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){update(dt);titlePulse+=dt;drawGameOver();updateHUD();}
    else if(gameState==='won'){update(dt);titlePulse+=dt;drawWon();updateHUD();}
    animId=requestAnimationFrame(gameLoop);
}

// ---- INPUT ----
function getCanvasPos(e){
    var rect=canvas.getBoundingClientRect();
    var scaleX=canvas.width/rect.width;
    var scaleY=canvas.height/rect.height;
    var cx,cy;
    if(e.touches){cx=(e.touches[0].clientX-rect.left)*scaleX;cy=(e.touches[0].clientY-rect.top)*scaleY;}
    else{cx=(e.clientX-rect.left)*scaleX;cy=(e.clientY-rect.top)*scaleY;}
    return{x:cx,y:cy};
}

function handleClick(e){
    e.preventDefault();
    if(gameState==='title'||gameState==='gameover'||gameState==='won'){resetGame();return;}
    if(gameState!=='playing')return;
    var pos=getCanvasPos(e);
    var cell=getCellFromPos(pos.x,pos.y);

    // check smiley click (reset)
    var smileySize=Math.min(cellSize*0.6,20);
    var smileyY=gridOffsetY-smileySize*1.8;
    var dx=pos.x-W/2,dy=pos.y-smileyY;
    if(dx*dx+dy*dy<smileySize*smileySize*2){resetGame();return;}

    if(cell){revealCell(cell.r,cell.c);}
}

function handleRightClick(e){
    e.preventDefault();
    if(gameState!=='playing')return;
    var pos=getCanvasPos(e);
    var cell=getCellFromPos(pos.x,pos.y);
    if(cell)toggleFlag(cell.r,cell.c);
}

// touch: long press for flag, tap for reveal
function handleTouchStart(e){
    if(gameState!=='playing'){
        if(gameState==='title'||gameState==='gameover'||gameState==='won'){
            // handle as start/restart on touchend
        }
        return;
    }
    if(e.touches.length!==1)return;
    var pos=getCanvasPos(e);
    touchStartPos=pos;
    longPressTriggered=false;
    touchTimer=setTimeout(function(){
        longPressTriggered=true;
        var cell=getCellFromPos(pos.x,pos.y);
        if(cell)toggleFlag(cell.r,cell.c);
    },500);
}

function handleTouchEnd(e){
    if(touchTimer){clearTimeout(touchTimer);touchTimer=null;}
    if(gameState==='title'||gameState==='gameover'||gameState==='won'){resetGame();return;}
    if(longPressTriggered){longPressTriggered=false;return;}
    if(gameState!=='playing')return;
    if(!touchStartPos)return;
    var cell=getCellFromPos(touchStartPos.x,touchStartPos.y);

    // check smiley click (reset)
    var smileySize=Math.min(cellSize*0.6,20);
    var smileyY=gridOffsetY-smileySize*1.8;
    var dx=touchStartPos.x-W/2,dy=touchStartPos.y-smileyY;
    if(dx*dx+dy*dy<smileySize*smileySize*2){resetGame();return;}

    if(cell)revealCell(cell.r,cell.c);
    touchStartPos=null;
}

function handleTouchMove(e){
    // if finger moves too far, cancel long press
    if(touchTimer&&touchStartPos&&e.touches.length===1){
        var pos=getCanvasPos(e);
        var dx=pos.x-touchStartPos.x,dy=pos.y-touchStartPos.y;
        if(dx*dx+dy*dy>100){clearTimeout(touchTimer);touchTimer=null;}
    }
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();}
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}

var kd=function(e){onKey(e);};
var contextHandler=function(e){e.preventDefault();};

// ---- INIT / STOP ----
window.initMinesweeper=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);
    resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',handleClick);
    canvas.addEventListener('contextmenu',handleRightClick);
    canvas.addEventListener('mousedown',function(e){if(e.button===2)e.preventDefault();});
    // Prevent browser context menu on canvas
    canvas.addEventListener('contextmenu',contextHandler);
    // Touch support
    canvas.addEventListener('touchstart',function(e){e.preventDefault();handleTouchStart(e);},{passive:false});
    canvas.addEventListener('touchend',function(e){e.preventDefault();handleTouchEnd(e);},{passive:false});
    canvas.addEventListener('touchmove',function(e){e.preventDefault();handleTouchMove(e);},{passive:false});
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopMinesweeper=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    if(canvas){
        canvas.removeEventListener('contextmenu',contextHandler);
    }
    if(touchTimer){clearTimeout(touchTimer);touchTimer=null;}
    gameState='title';
};
})();
