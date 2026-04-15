// Dr. Mario — Falling pills to match 4+ same color, clear viruses
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=8,ROWS=16,PILL_COLORS=['#ff3333','#3333ff','#ffff33'];
var COLOR_NAMES=['RED','BLUE','YELLOW'];
var board,pill,nextPill,score=0,level=1,virusCount=0,totalViruses=0;
var dropTimer=0,dropInterval=0.8,particles=[],clearAnim=[];
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W*0.5)/COLS,(H-80)/ROWS);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*COLS)/2,y:(H-cs*ROWS)/2+15};}

function resetGame(){
    score=0;level=1;particles=[];clearAnim=[];gameTime=0;
    initLevel();gameState='playing';
}

function initLevel(){
    board=[];for(var r=0;r<ROWS;r++){board[r]=[];for(var c=0;c<COLS;c++)board[r][c]=null;}
    // Place viruses scaled by difficulty
    var dm=diffMult();
    var numViruses=Math.floor((4+level*2)*dm);if(numViruses>25)numViruses=25;
    totalViruses=numViruses;virusCount=numViruses;
    for(var i=0;i<numViruses;i++){
        var attempts=0;
        while(attempts<100){
            var r=Math.floor(ROWS/2)+Math.floor(Math.random()*(ROWS/2-1));
            var c=Math.floor(Math.random()*COLS);
            if(!board[r][c]){
                board[r][c]={color:Math.floor(Math.random()*3),virus:true};break;
            }
            attempts++;
        }
    }
    pill=newPill();nextPill=newPill();dropTimer=0;
    dropInterval=Math.max(0.2,0.8-level*0.05*dm);
}

function newPill(){
    return{col:Math.floor(COLS/2)-1,row:0,orientation:0, // 0=horizontal,1=vertical
        colors:[Math.floor(Math.random()*3),Math.floor(Math.random()*3)]};
}

function pillCells(p){
    var cells=[{r:p.row,c:p.col}];
    if(p.orientation===0)cells.push({r:p.row,c:p.col+1});
    else cells.push({r:p.row-1,c:p.col});
    return cells;
}

function canPlace(p){
    var cells=pillCells(p);
    for(var i=0;i<cells.length;i++){
        var r=cells[i].r,c=cells[i].c;
        if(r<0||r>=ROWS||c<0||c>=COLS)return false;
        if(board[r][c])return false;
    }
    return true;
}

function rotatePill(){
    if(!pill)return;
    var old=pill.orientation;
    pill.orientation=(pill.orientation+1)%2;
    if(!canPlace(pill)){
        // Try wall kick
        var origCol=pill.col;
        pill.col=Math.max(0,Math.min(COLS-2,pill.col));
        if(!canPlace(pill)){pill.col=origCol;pill.orientation=old;}
    }
}

function lockPill(){
    if(!pill)return;
    var cells=pillCells(pill);
    for(var i=0;i<cells.length;i++){
        var r=cells[i].r,c=cells[i].c;
        if(r>=0&&r<ROWS)board[r][c]={color:pill.colors[i],virus:false};
    }
    if(pill.row<=1){gameState='gameover';return;}
    pill=nextPill;nextPill=newPill();
    checkMatches();
}

function checkMatches(){
    var toRemove=[];
    // Horizontal runs of 4+
    for(var r=0;r<ROWS;r++){
        for(var c=0;c<=COLS-4;c++){
            if(!board[r][c])continue;
            var col=board[r][c].color;var len=1;
            while(c+len<COLS&&board[r][c+len]&&board[r][c+len].color===col)len++;
            if(len>=4){for(var k=0;k<len;k++)toRemove.push({r:r,c:c+k});}
        }
    }
    // Vertical runs of 4+
    for(var c=0;c<COLS;c++){
        for(var r=0;r<=ROWS-4;r++){
            if(!board[r][c])continue;
            var col=board[r][c].color;var len=1;
            while(r+len<ROWS&&board[r+len][c]&&board[r+len][c].color===col)len++;
            if(len>=4){for(var k=0;k<len;k++)toRemove.push({r:r+k,c:c});}
        }
    }
    var unique={};var final=[];
    for(var i=0;i<toRemove.length;i++){
        var key=toRemove[i].r+','+toRemove[i].c;
        if(!unique[key]){unique[key]=true;final.push(toRemove[i]);}
    }
    if(final.length>0){
        var cs=cellSize(),o=boardOrigin();
        for(var i=0;i<final.length;i++){
            var fr=final[i];
            if(board[fr.r][fr.c]&&board[fr.r][fr.c].virus)virusCount--;
            var color=board[fr.r][fr.c]?PILL_COLORS[board[fr.r][fr.c].color]:'#fff';
            addParticles(o.x+fr.c*cs+cs/2,o.y+fr.r*cs+cs/2,color,4);
            clearAnim.push({r:fr.r,c:fr.c,life:0.3,color:color});
            board[fr.r][fr.c]=null;
        }
        score+=final.length*100*level;
        // Gravity
        setTimeout(function(){
            applyGravity();
            if(virusCount<=0){level++;score+=2000;initLevel();}
            else checkMatches();
        },200);
    }
}

function applyGravity(){
    for(var c=0;c<COLS;c++){
        var write=ROWS-1;
        for(var r=ROWS-1;r>=0;r--){
            if(board[r][c]){
                if(r!==write){board[write][c]=board[r][c];board[r][c]=null;}
                write--;
            }
        }
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*2});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    if(!pill)return;
    dropTimer+=dt;
    if(dropTimer>=dropInterval){
        dropTimer=0;
        var test={col:pill.col,row:pill.row+1,orientation:pill.orientation,colors:pill.colors};
        if(canPlace(test))pill.row++;
        else lockPill();
    }
    for(var i=clearAnim.length-1;i>=0;i--){clearAnim[i].life-=dt;if(clearAnim[i].life<=0)clearAnim.splice(i,1);}
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a2e');bg.addColorStop(1,'#0a0a3e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin();
    // Bottle
    ctx.strokeStyle='rgba(200,200,255,0.5)';ctx.lineWidth=3;
    ctx.strokeRect(o.x-4,o.y-4,cs*COLS+8,cs*ROWS+8);
    // Bottle neck
    ctx.strokeRect(o.x+cs*3-4,o.y-cs-4,cs*2+8,cs+4);
    ctx.fillStyle='rgba(0,0,40,0.5)';ctx.fillRect(o.x,o.y,cs*COLS,cs*ROWS);
    // Grid
    ctx.strokeStyle='rgba(100,100,200,0.08)';ctx.lineWidth=0.5;
    for(var c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(o.x+c*cs,o.y);ctx.lineTo(o.x+c*cs,o.y+cs*ROWS);ctx.stroke();}
    for(var r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(o.x,o.y+r*cs);ctx.lineTo(o.x+cs*COLS,o.y+r*cs);ctx.stroke();}
    // Board cells
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(!board[r][c])continue;
        var cell=board[r][c];
        var cx=o.x+c*cs+cs/2,cy=o.y+r*cs+cs/2;
        if(cell.virus){drawVirus(cx,cy,cs*0.4,cell.color);}
        else{drawPillHalf(cx,cy,cs*0.4,PILL_COLORS[cell.color]);}
    }
    // Active pill
    if(pill){
        var cells=pillCells(pill);
        for(var i=0;i<cells.length;i++){
            var r=cells[i].r,c=cells[i].c;
            if(r>=0)drawPillHalf(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.4,PILL_COLORS[pill.colors[i]]);
        }
    }
    // Clear animations
    for(var i=0;i<clearAnim.length;i++){
        var ca=clearAnim[i];ctx.globalAlpha=ca.life*3;ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(o.x+ca.c*cs+cs/2,o.y+ca.r*cs+cs/2,cs*0.5,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // Next pill display
    ctx.textAlign='center';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';ctx.fillStyle='#888';
    var nx=o.x+cs*COLS+cs*2;
    ctx.fillText('NEXT',nx,o.y+cs);
    if(nextPill){
        drawPillHalf(nx-cs*0.3,o.y+cs*2,cs*0.35,PILL_COLORS[nextPill.colors[0]]);
        drawPillHalf(nx+cs*0.3,o.y+cs*2,cs*0.35,PILL_COLORS[nextPill.colors[1]]);
    }
    // Virus count
    ctx.fillStyle='#ffcc00';ctx.fillText('VIRUSES',nx,o.y+cs*4);
    ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText(virusCount+'/'+totalViruses,nx,o.y+cs*5);
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawVirus(x,y,r,colorIdx){
    var color=PILL_COLORS[colorIdx];
    ctx.save();
    // Animated wobble
    var wobble=Math.sin(gameTime*3+colorIdx)*0.1;
    ctx.translate(x,y);ctx.rotate(wobble);ctx.translate(-x,-y);
    // Glow
    ctx.shadowColor=color;ctx.shadowBlur=10;
    // Body gradient
    var bodyGrad=ctx.createRadialGradient(x-r*0.2,y-r*0.2,r*0.1,x,y,r);
    bodyGrad.addColorStop(0,lighten(color,60));bodyGrad.addColorStop(0.5,color);bodyGrad.addColorStop(1,darken(color,50));
    ctx.fillStyle=bodyGrad;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Animated spikes
    for(var i=0;i<8;i++){
        var angle=i*Math.PI/4+gameTime*2;
        var spikeLen=r*0.35+Math.sin(gameTime*4+i)*r*0.1;
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(angle)*(r-2),y+Math.sin(angle)*(r-2));
        ctx.lineTo(x+Math.cos(angle-0.2)*(r+spikeLen),y+Math.sin(angle-0.2)*(r+spikeLen));
        ctx.lineTo(x+Math.cos(angle+0.2)*(r+spikeLen),y+Math.sin(angle+0.2)*(r+spikeLen));
        ctx.closePath();ctx.fill();
    }
    // Expressive eyes with different moods per color
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(x-r*0.25,y-r*0.15,r*0.22,r*0.2,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+r*0.25,y-r*0.15,r*0.22,r*0.2,0,0,Math.PI*2);ctx.fill();
    // Pupils that look around
    var px=Math.sin(gameTime*2)*r*0.05;
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(x-r*0.2+px,y-r*0.12,r*0.1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+r*0.3+px,y-r*0.12,r*0.1,0,Math.PI*2);ctx.fill();
    // Eyebrow expression
    if(colorIdx===0){ // angry red
        ctx.strokeStyle='#000';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x-r*0.4,y-r*0.35);ctx.lineTo(x-r*0.1,y-r*0.25);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+r*0.4,y-r*0.35);ctx.lineTo(x+r*0.1,y-r*0.25);ctx.stroke();
    }
    // Mouth with expression
    ctx.strokeStyle='#000';ctx.lineWidth=1.5;
    if(colorIdx===1){ // happy blue mouth
        ctx.beginPath();ctx.arc(x,y+r*0.2,r*0.2,0,Math.PI);ctx.stroke();
    } else if(colorIdx===0){ // toothy grin
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x,y+r*0.2,r*0.2,0,Math.PI);ctx.fill();
        ctx.fillStyle='#fff';
        for(var t=0;t<3;t++){ctx.fillRect(x-r*0.15+t*r*0.12,y+r*0.15,r*0.08,r*0.1);}
    } else { // wavy mouth
        ctx.beginPath();
        for(var m=0;m<5;m++){
            var mx=x-r*0.2+m*r*0.1;
            var my=y+r*0.25+Math.sin(gameTime*4+m)*r*0.05;
            if(m===0)ctx.moveTo(mx,my);else ctx.lineTo(mx,my);
        }
        ctx.stroke();
    }
    ctx.restore();
}
function lighten(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,r+a);g=Math.min(255,g+a);b=Math.min(255,b+a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawPillHalf(x,y,r,color){
    ctx.save();
    var grd=ctx.createRadialGradient(x-r*0.2,y-r*0.2,r*0.1,x,y,r);
    grd.addColorStop(0,'#fff');grd.addColorStop(0.3,color);grd.addColorStop(1,darken(color,60));
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    // Highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.beginPath();ctx.arc(x-r*0.2,y-r*0.2,r*0.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
}

function darken(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawTitle(dt){
    ctx.fillStyle='#1a0a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Floating pills
    for(var i=0;i<8;i++){
        var px=W*0.15+(i%4)*W*0.2;
        var py=H*0.5+Math.sin(titlePulse+i)*H*0.1;
        drawPillHalf(px,py,W*0.015,PILL_COLORS[i%3]);
        drawPillHalf(px+W*0.03,py,W*0.015,PILL_COLORS[(i+1)%3]);
    }
    // Viruses
    for(var i=0;i<3;i++)drawVirus(W*0.3+i*W*0.2,H*0.65,W*0.02,i);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('DR.',W/2,H*0.18);
    ctx.fillStyle='#3333ff';ctx.fillText('MARIO',W/2,H*0.28);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Match 4+ same color to clear viruses!',W/2,H*0.38);
    ctx.fillText('Left/Right move, Up rotate, Down drop',W/2,H*0.44);
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
    ctx.fillText('SCORE: '+score,W/2,H*0.45);ctx.fillText('LEVEL: '+level,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent='Viruses: '+virusCount;
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
    if(gameState!=='playing'||!pill)return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){
        var test={col:pill.col-1,row:pill.row,orientation:pill.orientation,colors:pill.colors};
        if(canPlace(test))pill.col--;
    }
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){
        var test={col:pill.col+1,row:pill.row,orientation:pill.orientation,colors:pill.colors};
        if(canPlace(test))pill.col++;
    }
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')rotatePill();
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){
        var test={col:pill.col,row:pill.row+1,orientation:pill.orientation,colors:pill.colors};
        if(canPlace(test))pill.row++;else lockPill();
    }
    if(e.key===' '){
        var test={col:pill.col,row:pill.row+1,orientation:pill.orientation,colors:pill.colors};
        while(canPlace(test)){pill.row++;test.row=pill.row+1;}
        lockPill();
    }
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initDrMario=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')resetGame();});
    bindMobile('btn-left',function(){if(pill){var t={col:pill.col-1,row:pill.row,orientation:pill.orientation,colors:pill.colors};if(canPlace(t))pill.col--;}});
    bindMobile('btn-right',function(){if(pill){var t={col:pill.col+1,row:pill.row,orientation:pill.orientation,colors:pill.colors};if(canPlace(t))pill.col++;}});
    bindMobile('btn-up',function(){rotatePill();});
    bindMobile('btn-down',function(){if(pill){var t={col:pill.col,row:pill.row+1,orientation:pill.orientation,colors:pill.colors};if(canPlace(t))pill.row++;else lockPill();}});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopDrMario=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
