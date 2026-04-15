// Puyo Puyo — Falling pairs of colored blobs, match 4+ connected same-color
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=6,ROWS=12,COLORS=['#ff3333','#33cc33','#3366ff','#ffcc00','#cc33ff'];
var EYES_COLORS=['#fff','#fff','#fff','#fff','#fff'];
var board,pair,nextPair,score=0,level=1,chain=0,maxChain=0;
var dropTimer=0,dropInterval=0.8,particles=[],popAnim=[],chainText='';

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W*0.5)/COLS,(H-80)/ROWS);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*COLS)/2,y:(H-cs*ROWS)/2+15};}

function resetGame(){
    score=0;level=1;chain=0;maxChain=0;particles=[];popAnim=[];chainText='';gameTime=0;
    board=[];for(var r=0;r<ROWS;r++){board[r]=[];for(var c=0;c<COLS;c++)board[r][c]=null;}
    pair=newPair();nextPair=newPair();dropTimer=0;
    dropInterval=0.8;gameState='playing';
}

function newPair(){
    var numColors=Math.min(3+Math.floor(level/3),COLORS.length);
    return{col:Math.floor(COLS/2)-1,row:0,
        orientation:0, // 0=vertical(top),1=right,2=bottom,3=left
        colors:[Math.floor(Math.random()*numColors),Math.floor(Math.random()*numColors)]};
}

function pairCells(p){
    var c1={r:p.row,c:p.col};
    var c2;
    if(p.orientation===0)c2={r:p.row-1,c:p.col};
    else if(p.orientation===1)c2={r:p.row,c:p.col+1};
    else if(p.orientation===2)c2={r:p.row+1,c:p.col};
    else c2={r:p.row,c:p.col-1};
    return[c1,c2];
}

function canPlace(p){
    var cells=pairCells(p);
    for(var i=0;i<cells.length;i++){
        var r=cells[i].r,c=cells[i].c;
        if(c<0||c>=COLS||r>=ROWS)return false;
        if(r>=0&&board[r][c]!==null)return false;
    }
    return true;
}

function rotatePair(){
    if(!pair)return;
    var old=pair.orientation;
    pair.orientation=(pair.orientation+1)%4;
    if(!canPlace(pair)){
        // Wall kick
        var origCol=pair.col;
        if(pair.orientation===1)pair.col=Math.min(COLS-2,pair.col);
        else if(pair.orientation===3)pair.col=Math.max(1,pair.col);
        if(!canPlace(pair)){pair.col=origCol;pair.orientation=old;}
    }
}

function lockPair(){
    if(!pair)return;
    var cells=pairCells(pair);
    for(var i=0;i<cells.length;i++){
        var r=cells[i].r,c=cells[i].c;
        if(r>=0&&r<ROWS)board[r][c]=pair.colors[i];
    }
    if(pair.row<=1){gameState='gameover';return;}
    pair=nextPair;nextPair=newPair();
    chain=0;
    applyGravity();
    checkPops();
}

function applyGravity(){
    var moved=true;
    while(moved){
        moved=false;
        for(var c=0;c<COLS;c++){
            for(var r=ROWS-2;r>=0;r--){
                if(board[r][c]!==null&&board[r+1][c]===null){
                    board[r+1][c]=board[r][c];board[r][c]=null;moved=true;
                }
            }
        }
    }
}

function findConnected(r,c,color,visited){
    var key=r+','+c;
    if(visited[key])return[];
    if(r<0||r>=ROWS||c<0||c>=COLS)return[];
    if(board[r][c]!==color)return[];
    visited[key]=true;
    var result=[{r:r,c:c}];
    result=result.concat(findConnected(r-1,c,color,visited));
    result=result.concat(findConnected(r+1,c,color,visited));
    result=result.concat(findConnected(r,c-1,color,visited));
    result=result.concat(findConnected(r,c+1,color,visited));
    return result;
}

function checkPops(){
    var toPop=[];var visited={};
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(board[r][c]===null)continue;
        var key=r+','+c;if(visited[key])continue;
        var group=findConnected(r,c,board[r][c],visited);
        if(group.length>=4){
            for(var g=0;g<group.length;g++)toPop.push(group[g]);
        }
    }
    if(toPop.length>0){
        chain++;if(chain>maxChain)maxChain=chain;
        var cs=cellSize(),o=boardOrigin();
        for(var i=0;i<toPop.length;i++){
            var p=toPop[i];
            addParticles(o.x+p.c*cs+cs/2,o.y+p.r*cs+cs/2,COLORS[board[p.r][p.c]],4);
            popAnim.push({x:o.x+p.c*cs+cs/2,y:o.y+p.r*cs+cs/2,color:COLORS[board[p.r][p.c]],life:0.4});
            board[p.r][p.c]=null;
        }
        var chainBonus=chain*chain;
        score+=toPop.length*10*chainBonus*level;
        if(chain>1)chainText=chain+'CHAIN!';
        setTimeout(function(){
            applyGravity();
            checkPops();
        },250);
    } else {
        chain=0;
        level=1+Math.floor(score/5000);
        var dm=diffMult();dropInterval=Math.max(0.12,(0.8-level*0.06)/dm);
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*180,vy:(Math.random()-0.5)*180,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    if(!pair)return;
    dropTimer+=dt;
    if(dropTimer>=dropInterval){
        dropTimer=0;
        var test={col:pair.col,row:pair.row+1,orientation:pair.orientation,colors:pair.colors};
        if(canPlace(test))pair.row++;
        else lockPair();
    }
    for(var i=popAnim.length-1;i>=0;i--){popAnim[i].life-=dt;if(popAnim[i].life<=0)popAnim.splice(i,1);}
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
    if(chainText&&chain===0){setTimeout(function(){chainText='';},800);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a1a0a');bg.addColorStop(1,'#0a0a2e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin();
    // Board
    ctx.fillStyle='rgba(0,0,30,0.6)';ctx.fillRect(o.x-2,o.y-2,cs*COLS+4,cs*ROWS+4);
    ctx.strokeStyle='rgba(100,200,100,0.3)';ctx.lineWidth=2;ctx.strokeRect(o.x-2,o.y-2,cs*COLS+4,cs*ROWS+4);
    // Grid
    ctx.strokeStyle='rgba(100,100,200,0.08)';ctx.lineWidth=0.5;
    for(var c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(o.x+c*cs,o.y);ctx.lineTo(o.x+c*cs,o.y+cs*ROWS);ctx.stroke();}
    for(var r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(o.x,o.y+r*cs);ctx.lineTo(o.x+cs*COLS,o.y+r*cs);ctx.stroke();}
    // Board puyos
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(board[r][c]!==null)drawPuyo(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.42,COLORS[board[r][c]],board[r][c]);
    }
    // Active pair
    if(pair){
        var cells=pairCells(pair);
        for(var i=0;i<cells.length;i++){
            var r=cells[i].r,c=cells[i].c;
            if(r>=0)drawPuyo(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.42,COLORS[pair.colors[i]],pair.colors[i]);
        }
        // Ghost
        var ghostRow=pair.row;
        var test={col:pair.col,row:ghostRow+1,orientation:pair.orientation,colors:pair.colors};
        while(canPlace(test)){ghostRow++;test.row=ghostRow+1;}
        if(ghostRow>pair.row){
            ctx.globalAlpha=0.3;
            var gc=pairCells({col:pair.col,row:ghostRow,orientation:pair.orientation,colors:pair.colors});
            for(var i=0;i<gc.length;i++){
                if(gc[i].r>=0&&gc[i].r<ROWS)drawPuyo(o.x+gc[i].c*cs+cs/2,o.y+gc[i].r*cs+cs/2,cs*0.35,COLORS[pair.colors[i]],pair.colors[i]);
            }
            ctx.globalAlpha=1;
        }
    }
    // Pop animations
    for(var i=0;i<popAnim.length;i++){
        var pa=popAnim[i];ctx.globalAlpha=pa.life*2.5;
        ctx.fillStyle='#fff';ctx.beginPath();
        ctx.arc(pa.x,pa.y,cs*0.5*(1+0.3*(0.4-pa.life)),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // Next pair
    var nx=o.x+cs*COLS+cs*1.5;
    ctx.textAlign='center';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';ctx.fillStyle='#888';
    ctx.fillText('NEXT',nx,o.y+cs*0.5);
    drawPuyo(nx,o.y+cs*1.5,cs*0.35,COLORS[nextPair.colors[0]],nextPair.colors[0]);
    drawPuyo(nx,o.y+cs*2.5,cs*0.35,COLORS[nextPair.colors[1]],nextPair.colors[1]);
    // Chain text
    if(chainText){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';ctx.fillText(chainText,W/2,o.y-15);
        ctx.shadowBlur=0;ctx.restore();
    }
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawPuyo(x,y,r,color,idx){
    ctx.save();
    // Shadow beneath
    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(x+1,y+r*0.15,r*0.85,r*0.4,0,0,Math.PI*2);ctx.fill();
    // Outer glow
    ctx.shadowColor=color;ctx.shadowBlur=8;
    // Body with rich gradient - slight squish animation
    var squish=1+Math.sin(gameTime*3+idx)*0.04;
    var grd=ctx.createRadialGradient(x-r*0.25,y-r*0.25,r*0.05,x,y,r*squish);
    grd.addColorStop(0,lighten(color,100));grd.addColorStop(0.2,lighten(color,50));grd.addColorStop(0.5,color);grd.addColorStop(0.8,darken(color,40));grd.addColorStop(1,darken(color,70));
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,r*squish,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Rim light (bottom arc)
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x,y,r*0.9,Math.PI*0.6,Math.PI*0.9);ctx.stroke();
    // Eyes (cute big eyes!)
    var eyeOff=r*0.28,eyeR=r*0.2,pupilR=r*0.11;
    // Eye whites with subtle gradient
    var ewg=ctx.createRadialGradient(x-eyeOff,y-r*0.1,eyeR*0.1,x-eyeOff,y-r*0.1,eyeR);
    ewg.addColorStop(0,'#ffffff');ewg.addColorStop(1,'#e0e0e8');
    ctx.fillStyle=ewg;
    ctx.beginPath();ctx.arc(x-eyeOff,y-r*0.1,eyeR,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+eyeOff,y-r*0.1,eyeR,0,Math.PI*2);ctx.fill();
    // Pupil look-around
    var px=Math.sin(gameTime*2+idx)*pupilR*0.35;
    var py=Math.cos(gameTime*1.5+idx)*pupilR*0.2;
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(x-eyeOff+px,y-r*0.05+py,pupilR,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+eyeOff+px,y-r*0.05+py,pupilR,0,Math.PI*2);ctx.fill();
    // Eye sparkle dots
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.beginPath();ctx.arc(x-eyeOff+px-pupilR*0.3,y-r*0.08+py-pupilR*0.3,pupilR*0.3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+eyeOff+px-pupilR*0.3,y-r*0.08+py-pupilR*0.3,pupilR*0.3,0,Math.PI*2);ctx.fill();
    // Happy mouth
    ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1.5;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x,y+r*0.2,r*0.18,0.15,Math.PI-0.15);ctx.stroke();
    // Blush cheeks
    ctx.fillStyle='rgba(255,100,100,0.15)';
    ctx.beginPath();ctx.arc(x-r*0.45,y+r*0.1,r*0.15,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+r*0.45,y+r*0.1,r*0.15,0,Math.PI*2);ctx.fill();
    // Main specular highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.beginPath();ctx.ellipse(x-r*0.15,y-r*0.35,r*0.28,r*0.18,-.3,0,Math.PI*2);ctx.fill();
    // Secondary small highlight
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.beginPath();ctx.arc(x+r*0.2,y-r*0.15,r*0.08,0,Math.PI*2);ctx.fill();
    ctx.restore();
}

function lighten(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,r+a);g=Math.min(255,g+a);b=Math.min(255,b+a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function darken(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawTitle(dt){
    ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Bouncing puyos
    for(var i=0;i<8;i++){
        var px=W*0.15+i*W*0.1;
        var py=H*0.55+Math.abs(Math.sin(titlePulse*2+i*0.7))*H*0.08;
        drawPuyo(px,py,W*0.025,COLORS[i%COLORS.length],i);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#33cc33';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
    ctx.fillStyle='#33cc33';ctx.fillText('PUYO',W/2,H*0.2);
    ctx.fillStyle='#ff3333';ctx.fillText('PUYO',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Connect 4+ same color puyos to pop them!',W/2,H*0.4);
    ctx.fillText('Left/Right move, Up rotate, Down drop',W/2,H*0.46);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
    ctx.fillText('SCORE: '+score,W/2,H*0.45);
    ctx.fillText('MAX CHAIN: '+maxChain,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent=chain>0?'Chain: '+chain:'';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
    if(!down)return;
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();return;}
    if(gameState!=='playing'||!pair)return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){
        var test={col:pair.col-1,row:pair.row,orientation:pair.orientation,colors:pair.colors};
        if(canPlace(test))pair.col--;
    }
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){
        var test={col:pair.col+1,row:pair.row,orientation:pair.orientation,colors:pair.colors};
        if(canPlace(test))pair.col++;
    }
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')rotatePair();
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){
        var test={col:pair.col,row:pair.row+1,orientation:pair.orientation,colors:pair.colors};
        if(canPlace(test))pair.row++;else lockPair();
    }
    if(e.key===' '){
        var test={col:pair.col,row:pair.row+1,orientation:pair.orientation,colors:pair.colors};
        while(canPlace(test)){pair.row++;test.row=pair.row+1;}
        lockPair();
    }
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initPuyoPuyo=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')resetGame();});
    bindMobile('btn-left',function(){if(pair){var t={col:pair.col-1,row:pair.row,orientation:pair.orientation,colors:pair.colors};if(canPlace(t))pair.col--;}});
    bindMobile('btn-right',function(){if(pair){var t={col:pair.col+1,row:pair.row,orientation:pair.orientation,colors:pair.colors};if(canPlace(t))pair.col++;}});
    bindMobile('btn-up',function(){rotatePair();});
    bindMobile('btn-down',function(){if(pair){var t={col:pair.col,row:pair.row+1,orientation:pair.orientation,colors:pair.colors};if(canPlace(t))pair.row++;else lockPair();}});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPuyoPuyo=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
