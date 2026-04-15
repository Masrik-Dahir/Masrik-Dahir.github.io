// Pipe Dream — Place pipe pieces to create a path for flowing water
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=7,ROWS=7,grid,queue,score=0,level=1,particles=[];
var waterTimer=0,waterDelay=15,waterFlowing=false,waterPath=[],waterProgress=0;
var startCell,cursorR=0,cursorC=0;
var bgStars=[];for(var _i=0;_i<40;_i++)bgStars.push({x:Math.random(),y:Math.random(),s:Math.random()*2+0.5,b:Math.random()});

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

// Pipe types: 0=straight-H, 1=straight-V, 2=bend-TL, 3=bend-TR, 4=bend-BL, 5=bend-BR, 6=cross
var PIPE_CONNECTS={
    0:{left:true,right:true,top:false,bottom:false},
    1:{left:false,right:false,top:true,bottom:true},
    2:{left:true,right:false,top:true,bottom:false},
    3:{left:false,right:true,top:true,bottom:false},
    4:{left:true,right:false,top:false,bottom:true},
    5:{left:false,right:true,top:false,bottom:true},
    6:{left:true,right:true,top:true,bottom:true}
};

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W*0.6)/COLS,(H-100)/ROWS);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*COLS)/2,y:(H-cs*ROWS)/2+10};}

function resetGame(){
    score=0;level=1;particles=[];gameTime=0;
    initLevel();gameState='playing';
}

function initLevel(){
    grid=[];for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=null;}
    queue=[];for(var i=0;i<5;i++)queue.push(randomPipe());
    startCell={r:Math.floor(Math.random()*(ROWS-2))+1,c:0};
    grid[startCell.r][startCell.c]={type:0,filled:false};
    cursorR=startCell.r;cursorC=1;
    waterFlowing=false;var dm=diffMult();waterTimer=Math.max(5,(waterDelay-level*0.5)/dm);
    if(waterTimer<4)waterTimer=4;
    waterPath=[];waterProgress=0;
}

function randomPipe(){
    var r=Math.random();
    if(r<0.05)return 6; // cross is rare
    return Math.floor(Math.random()*6);
}

function placePipe(){
    if(waterFlowing)return;
    if(cursorR<0||cursorR>=ROWS||cursorC<0||cursorC>=COLS)return;
    if(cursorR===startCell.r&&cursorC===startCell.c)return;
    // Replace existing pipe (costs points)
    if(grid[cursorR][cursorC]&&grid[cursorR][cursorC].filled)return;
    if(grid[cursorR][cursorC])score=Math.max(0,score-50);
    grid[cursorR][cursorC]={type:queue[0],filled:false};
    queue.shift();queue.push(randomPipe());
    score+=10;
}

function opposite(dir){
    if(dir==='left')return'right';if(dir==='right')return'left';
    if(dir==='top')return'bottom';return'top';
}

function computeWaterPath(){
    waterPath=[{r:startCell.r,c:startCell.c,from:'left'}];
    var r=startCell.r,c=startCell.c,fromDir='left';
    var maxSteps=200;
    while(maxSteps-->0){
        if(!grid[r][c])break;
        var pipe=PIPE_CONNECTS[grid[r][c].type];
        var enterSide=fromDir;
        if(!pipe[enterSide])break;
        // Find exit
        var exitDir=null;
        var dirs=['left','right','top','bottom'];
        for(var i=0;i<dirs.length;i++){
            if(dirs[i]===enterSide)continue;
            if(pipe[dirs[i]]){exitDir=dirs[i];break;}
        }
        // For cross pipe, choose the straight-through direction
        if(grid[r][c].type===6){
            if(enterSide==='left')exitDir='right';
            else if(enterSide==='right')exitDir='left';
            else if(enterSide==='top')exitDir='bottom';
            else exitDir='top';
        }
        if(!exitDir)break;
        // Move to next cell
        var nr=r,nc=c;
        if(exitDir==='left')nc--;
        else if(exitDir==='right')nc++;
        else if(exitDir==='top')nr--;
        else nr++;
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS)break;
        fromDir=opposite(exitDir);
        r=nr;c=nc;
        waterPath.push({r:r,c:c,from:fromDir});
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*100,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*2});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    if(!waterFlowing){
        waterTimer-=dt;
        if(waterTimer<=0){
            waterFlowing=true;
            computeWaterPath();
            waterProgress=0;
        }
    } else {
        waterProgress+=dt*1.5*diffMult();
        var filled=Math.floor(waterProgress);
        for(var i=0;i<=filled&&i<waterPath.length;i++){
            var wp=waterPath[i];
            if(grid[wp.r][wp.c]&&!grid[wp.r][wp.c].filled){
                grid[wp.r][wp.c].filled=true;
                score+=100*level;
                var cs=cellSize(),o=boardOrigin();
                addParticles(o.x+wp.c*cs+cs/2,o.y+wp.r*cs+cs/2,'#44aaff',3);
            }
        }
        if(filled>=waterPath.length){
            // Level complete or game over
            var filledCount=0;
            for(var i=0;i<waterPath.length;i++){
                var wp=waterPath[i];
                if(grid[wp.r][wp.c]&&grid[wp.r][wp.c].filled)filledCount++;
            }
            if(filledCount>=5+level*2){level++;score+=1000;initLevel();}
            else{gameState='gameover';}
        }
    }
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#06122a');bg.addColorStop(0.5,'#0a1a3e');bg.addColorStop(1,'#060a1e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Starfield
    for(var si=0;si<bgStars.length;si++){var st=bgStars[si];ctx.fillStyle='rgba(150,180,255,'+(0.3+0.3*Math.sin(gameTime*2+st.b*6))+')';ctx.beginPath();ctx.arc(st.x*W,st.y*H,st.s,0,Math.PI*2);ctx.fill();}
    var cs=cellSize(),o=boardOrigin();
    // Board background with beveled frame
    ctx.save();ctx.shadowColor='rgba(80,130,255,0.3)';ctx.shadowBlur=15;
    ctx.fillStyle='rgba(15,25,50,0.9)';ctx.fillRect(o.x-4,o.y-4,cs*COLS+8,cs*ROWS+8);ctx.shadowBlur=0;ctx.restore();
    ctx.strokeStyle='rgba(80,140,255,0.25)';ctx.lineWidth=1;ctx.strokeRect(o.x-4,o.y-4,cs*COLS+8,cs*ROWS+8);
    ctx.strokeStyle='rgba(100,160,255,0.4)';ctx.lineWidth=2;ctx.strokeRect(o.x-2,o.y-2,cs*COLS+4,cs*ROWS+4);
    // Grid
    ctx.strokeStyle='rgba(100,150,200,0.1)';ctx.lineWidth=0.5;
    for(var c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(o.x+c*cs,o.y);ctx.lineTo(o.x+c*cs,o.y+cs*ROWS);ctx.stroke();}
    for(var r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(o.x,o.y+r*cs);ctx.lineTo(o.x+cs*COLS,o.y+r*cs);ctx.stroke();}
    // Pipes
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(!grid[r][c])continue;
        drawPipe(o.x+c*cs,o.y+r*cs,cs,grid[r][c].type,grid[r][c].filled);
    }
    // Start indicator
    ctx.save();ctx.shadowColor='#00ff66';ctx.shadowBlur=10;
    ctx.fillStyle='#00ff66';ctx.font='bold '+Math.round(cs*0.3)+'px "Courier New",monospace';
    ctx.textAlign='center';ctx.fillText('START',o.x+startCell.c*cs+cs/2,o.y+startCell.r*cs+cs/2+cs*0.1);
    ctx.shadowBlur=0;ctx.restore();
    // Cursor
    if(!waterFlowing){
        ctx.strokeStyle='rgba(255,255,0,'+(.5+.5*Math.sin(gameTime*6))+')';ctx.lineWidth=2;
        ctx.strokeRect(o.x+cursorC*cs+2,o.y+cursorR*cs+2,cs-4,cs-4);
    }
    // Queue
    var qx=o.x+cs*COLS+cs*0.5;
    ctx.textAlign='center';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';ctx.fillStyle='#888';
    ctx.fillText('QUEUE',qx+cs/2,o.y);
    for(var i=0;i<queue.length;i++){
        drawPipe(qx,o.y+cs*(i+0.5),cs*0.8,queue[i],false);
        if(i===0){ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;ctx.strokeRect(qx-2,o.y+cs*(i+0.5)-2,cs*0.8+4,cs*0.8+4);}
    }
    // Timer
    if(!waterFlowing){
        ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
        ctx.fillStyle=waterTimer<5?'#ff3333':'#ffcc00';
        ctx.fillText('WATER: '+Math.ceil(waterTimer)+'s',W/2,o.y-15);
    } else {
        ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
        ctx.fillStyle='#44aaff';ctx.fillText('WATER FLOWING!',W/2,o.y-15);
    }
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawPipe(x,y,s,type,filled){
    var cx=x+s/2,cy=y+s/2,pw=s*0.35,hw=pw/2;
    ctx.save();
    // Pipe background tile
    var tileBg=ctx.createLinearGradient(x,y,x+s,y+s);
    tileBg.addColorStop(0,filled?'rgba(40,100,180,0.35)':'rgba(60,60,80,0.6)');
    tileBg.addColorStop(1,filled?'rgba(30,70,130,0.35)':'rgba(40,40,60,0.6)');
    ctx.fillStyle=tileBg;ctx.fillRect(x+2,y+2,s-4,s-4);
    var conn=PIPE_CONNECTS[type];
    // 3D pipe sections
    function drawSection(rx,ry,rw,rh){
        // outer dark border
        ctx.fillStyle=filled?'#1a4488':'#444';
        ctx.fillRect(rx,ry,rw,rh);
        // main pipe gradient (3D cylinder)
        var isH=rw>rh;
        var g;
        if(isH){g=ctx.createLinearGradient(rx,ry,rx,ry+rh);
        }else{g=ctx.createLinearGradient(rx,ry,rx+rw,ry);}
        g.addColorStop(0,filled?'#66bbff':'#999');
        g.addColorStop(0.3,filled?'#44aaff':'#bbb');
        g.addColorStop(0.5,filled?'#55ccff':'#ccc');
        g.addColorStop(0.7,filled?'#44aaff':'#bbb');
        g.addColorStop(1,filled?'#2288cc':'#777');
        ctx.fillStyle=g;ctx.fillRect(rx+1,ry+1,rw-2,rh-2);
        // specular highlight
        ctx.fillStyle='rgba(255,255,255,0.15)';
        if(isH)ctx.fillRect(rx+1,ry+1,rw-2,rh*0.25);
        else ctx.fillRect(rx+1,ry+1,rw*0.25,rh-2);
        // rivet dots at ends
        ctx.fillStyle='rgba(0,0,0,0.2)';
        if(isH){ctx.beginPath();ctx.arc(rx+3,ry+rh/2,1.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(rx+rw-3,ry+rh/2,1.5,0,Math.PI*2);ctx.fill();}
        else{ctx.beginPath();ctx.arc(rx+rw/2,ry+3,1.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(rx+rw/2,ry+rh-3,1.5,0,Math.PI*2);ctx.fill();}
    }
    if(conn.left)drawSection(x,cy-hw,s/2+hw,pw);
    if(conn.right)drawSection(cx-hw,cy-hw,s/2+hw,pw);
    if(conn.top)drawSection(cx-hw,y,pw,s/2+hw);
    if(conn.bottom)drawSection(cx-hw,cy-hw,pw,s/2+hw);
    // Center junction with metallic gradient
    var jg=ctx.createRadialGradient(cx,cy,0,cx,cy,hw*1.2);
    jg.addColorStop(0,filled?'#77ddff':'#ddd');
    jg.addColorStop(1,filled?'#3388bb':'#888');
    ctx.fillStyle=jg;ctx.fillRect(cx-hw,cy-hw,pw,pw);
    // Water flow animation
    if(filled){
        ctx.shadowColor='#44ccff';ctx.shadowBlur=6;
        var flowAlpha=0.4+0.25*Math.sin(gameTime*5+x*0.1+y*0.1);
        ctx.fillStyle='rgba(100,220,255,'+flowAlpha+')';
        if(conn.left||conn.right)ctx.fillRect(x+4,cy-hw+3,s-8,pw-6);
        if(conn.top||conn.bottom)ctx.fillRect(cx-hw+3,y+4,pw-6,s-8);
        // flowing bubbles
        ctx.fillStyle='rgba(200,240,255,0.5)';
        var bx=cx+Math.sin(gameTime*6+x)*hw*0.4;
        var by=cy+Math.cos(gameTime*6+y)*hw*0.4;
        ctx.beginPath();ctx.arc(bx,by,2,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
    }
    ctx.restore();
}

function drawTitle(dt){
    ctx.fillStyle='#0a1a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Demo pipes
    var ds=Math.min(W*0.06,40);
    for(var i=0;i<5;i++){
        var px=W*0.2+i*ds;
        drawPipe(px,H*0.55,ds,i%6,i<3);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#44aaff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
    ctx.fillStyle='#44aaff';ctx.fillText('PIPE',W/2,H*0.2);
    ctx.fillStyle='#ffcc00';ctx.fillText('DREAM',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Place pipes before the water flows!',W/2,H*0.42);
    ctx.fillText('Arrow keys to move cursor, Space/Up to place pipe',W/2,H*0.48);
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
    document.getElementById('hud-time').textContent=waterFlowing?'FLOWING':'Timer: '+Math.ceil(waterTimer)+'s';
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
    if(gameState!=='playing')return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')cursorC=Math.max(0,cursorC-1);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')cursorC=Math.min(COLS-1,cursorC+1);
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')cursorR=Math.max(0,cursorR-1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')cursorR=Math.min(ROWS-1,cursorR+1);
    if(e.key===' ')placePipe();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();var cs=cellSize(),o=boardOrigin();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var gc=Math.floor((mx-o.x)/cs),gr=Math.floor((my-o.y)/cs);
    if(gc>=0&&gc<COLS&&gr>=0&&gr<ROWS){cursorR=gr;cursorC=gc;placePipe();}
}

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initPipeDream=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',function(e){e.preventDefault();
        var t=e.touches[0];onClick({clientX:t.clientX,clientY:t.clientY});
    });
    bindMobile('btn-left',function(){cursorC=Math.max(0,cursorC-1);});
    bindMobile('btn-right',function(){cursorC=Math.min(COLS-1,cursorC+1);});
    bindMobile('btn-up',function(){cursorR=Math.max(0,cursorR-1);});
    bindMobile('btn-down',function(){placePipe();});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPipeDream=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
