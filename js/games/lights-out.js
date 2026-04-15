// Lights Out — Toggle lights on 5x5 grid, goal: all lights off
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var SIZE=5,grid,moves=0,level=1,score=0,particles=[],ripples=[];
var cursorR=2,cursorC=2,solvedAnim=0;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W-80)/SIZE,(H-120)/SIZE);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*SIZE)/2,y:(H-cs*SIZE)/2};}

function resetGame(){
    score=0;level=1;moves=0;particles=[];ripples=[];gameTime=0;solvedAnim=0;
    initLevel();gameState='playing';
}

function initLevel(){
    // Generate a solvable puzzle by starting from solved state and making random moves
    grid=[];for(var r=0;r<SIZE;r++){grid[r]=[];for(var c=0;c<SIZE;c++)grid[r][c]=false;}
    var dm=diffMult();var numMoves=Math.round((3+level*2)*dm);if(numMoves>20)numMoves=20;
    for(var i=0;i<numMoves;i++){
        var r=Math.floor(Math.random()*SIZE),c=Math.floor(Math.random()*SIZE);
        toggleCell(r,c);
    }
    // Make sure at least one light is on
    var anyOn=false;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)if(grid[r][c])anyOn=true;
    if(!anyOn){toggleCell(2,2);}
    moves=0;
    cursorR=2;cursorC=2;
}

function toggleCell(r,c){
    grid[r][c]=!grid[r][c];
    if(r>0)grid[r-1][c]=!grid[r-1][c];
    if(r<SIZE-1)grid[r+1][c]=!grid[r+1][c];
    if(c>0)grid[r][c-1]=!grid[r][c-1];
    if(c<SIZE-1)grid[r][c+1]=!grid[r][c+1];
}

function checkSolved(){
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)if(grid[r][c])return false;
    return true;
}

function makeMove(r,c){
    toggleCell(r,c);moves++;
    var cs=cellSize(),o=boardOrigin();
    ripples.push({x:o.x+c*cs+cs/2,y:o.y+r*cs+cs/2,radius:0,maxRadius:cs*2,life:1});
    addParticles(o.x+c*cs+cs/2,o.y+r*cs+cs/2,'#ffcc00',5);
    if(checkSolved()){
        score+=Math.max(100,1000-moves*50)*level;
        solvedAnim=2;
        setTimeout(function(){
            level++;initLevel();
        },1500);
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    if(solvedAnim>0)solvedAnim-=dt;
    for(var i=ripples.length-1;i>=0;i--){
        var r=ripples[i];r.radius+=dt*200;r.life-=dt*1.5;
        if(r.life<=0)ripples.splice(i,1);
    }
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a1e');bg.addColorStop(1,'#1a0a2e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin(),pad=3;
    // Board background
    ctx.fillStyle='rgba(20,20,40,0.8)';
    ctx.fillRect(o.x-10,o.y-10,cs*SIZE+20,cs*SIZE+20);
    ctx.strokeStyle='rgba(100,100,200,0.3)';ctx.lineWidth=2;
    ctx.strokeRect(o.x-10,o.y-10,cs*SIZE+20,cs*SIZE+20);
    // Ripples
    for(var i=0;i<ripples.length;i++){
        var r=ripples[i];
        ctx.strokeStyle='rgba(255,204,0,'+r.life*0.5+')';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(r.x,r.y,r.radius,0,Math.PI*2);ctx.stroke();
    }
    // Cells - 3D button effects
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        var x=o.x+c*cs+pad,y=o.y+r*cs+pad,s=cs-pad*2;
        var on=grid[r][c];
        ctx.save();
        if(on){
            // 3D raised glowing button
            // Shadow underneath
            ctx.fillStyle='rgba(200,150,0,0.15)';roundRect(ctx,x+2,y+2,s,s,8);
            // Outer glow
            ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;
            // Main button body - radial gradient for dome effect
            var grd=ctx.createRadialGradient(x+s*0.4,y+s*0.35,s*0.05,x+s/2,y+s/2,s*0.7);
            grd.addColorStop(0,'#fffff0');grd.addColorStop(0.2,'#ffee66');grd.addColorStop(0.5,'#ffcc00');grd.addColorStop(0.8,'#dd9900');grd.addColorStop(1,'#aa6600');
            ctx.fillStyle=grd;
            roundRect(ctx,x,y,s,s,8);
            ctx.shadowBlur=0;
            // Top highlight bevel
            ctx.fillStyle='rgba(255,255,200,0.25)';
            ctx.beginPath();roundRectPath(ctx,x+2,y+2,s-4,s*0.35,6);ctx.fill();
            // Bottom shadow bevel
            ctx.fillStyle='rgba(0,0,0,0.12)';
            ctx.beginPath();roundRectPath(ctx,x+2,y+s*0.65,s-4,s*0.33,6);ctx.fill();
            // Inner circle glow (filament)
            var inner=ctx.createRadialGradient(x+s/2,y+s/2,0,x+s/2,y+s/2,s*0.25);
            inner.addColorStop(0,'rgba(255,255,200,0.5)');inner.addColorStop(1,'rgba(255,200,0,0)');
            ctx.fillStyle=inner;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s*0.25,0,Math.PI*2);ctx.fill();
            // Rotating light rays
            ctx.strokeStyle='rgba(255,220,50,0.12)';ctx.lineWidth=1.5;
            for(var a=0;a<6;a++){
                var angle=a*Math.PI/3+gameTime*1.5;
                ctx.beginPath();ctx.moveTo(x+s/2,y+s/2);
                ctx.lineTo(x+s/2+Math.cos(angle)*s*0.55,y+s/2+Math.sin(angle)*s*0.55);ctx.stroke();
            }
        } else {
            // 3D pressed-in dark button
            // Inset shadow (top-left dark)
            ctx.fillStyle='rgba(0,0,0,0.2)';roundRect(ctx,x,y,s,s,8);
            // Main button body
            var grd=ctx.createLinearGradient(x,y,x+s,y+s);
            grd.addColorStop(0,'#1a1a2e');grd.addColorStop(0.4,'#252540');grd.addColorStop(1,'#1a1a30');
            ctx.fillStyle=grd;
            roundRect(ctx,x+1,y+1,s-2,s-2,7);
            // Inner bevel (recessed look)
            ctx.strokeStyle='rgba(60,60,100,0.4)';ctx.lineWidth=1;
            ctx.beginPath();roundRectPath(ctx,x+3,y+3,s-6,s-6,5);ctx.stroke();
            // Subtle center dot
            ctx.fillStyle='rgba(80,80,120,0.3)';ctx.beginPath();ctx.arc(x+s/2,y+s/2,s*0.08,0,Math.PI*2);ctx.fill();
            // Border
            ctx.strokeStyle='rgba(80,80,130,0.35)';ctx.lineWidth=1;
            ctx.beginPath();roundRectPath(ctx,x,y,s,s,8);ctx.stroke();
        }
        ctx.restore();
    }
    // Cursor
    var cx=o.x+cursorC*cs+pad-2,cy=o.y+cursorR*cs+pad-2,csize=cs-pad*2+4;
    ctx.strokeStyle='rgba(255,255,255,'+(.5+.5*Math.sin(gameTime*6))+')';ctx.lineWidth=3;
    ctx.beginPath();roundRectPath(ctx,cx,cy,csize,csize,10);ctx.stroke();
    // Solved animation
    if(solvedAnim>0){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#00ff66';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
        ctx.fillStyle='#00ff66';ctx.globalAlpha=Math.min(1,solvedAnim);
        ctx.fillText('SOLVED!',W/2,o.y-30);
        ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.restore();
    }
    // Info
    ctx.textAlign='center';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillStyle='#aaa';
    ctx.fillText('MOVES: '+moves,W/2,o.y+cs*SIZE+30);
    ctx.fillText('LEVEL: '+level,W/2,o.y+cs*SIZE+50);
    // Lights remaining
    var lightsOn=0;for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)if(grid[r][c])lightsOn++;
    ctx.fillStyle='#ffcc00';ctx.fillText('LIGHTS ON: '+lightsOn,W/2,o.y+cs*SIZE+70);
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();roundRectPath(ctx,x,y,w,h,r);ctx.fill();}
function roundRectPath(ctx,x,y,w,h,r){
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a1e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Demo grid
    var ds=Math.min(W*0.06,35);
    var ox=W/2-ds*2.5,oy=H*0.5;
    for(var r=0;r<5;r++)for(var c=0;c<5;c++){
        var on=((r+c+Math.floor(titlePulse))%3===0);
        if(on){
            ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;
        } else {
            ctx.fillStyle='#2a2a3e';ctx.shadowBlur=0;
        }
        roundRect(ctx,ox+c*ds+2,oy+r*ds+2,ds-4,ds-4,4);
        ctx.shadowBlur=0;
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';ctx.fillText('LIGHTS',W/2,H*0.2);
    ctx.fillStyle='#ff6600';ctx.fillText('OUT',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Toggle all lights off! Toggling one',W/2,H*0.4);
    ctx.fillText('also toggles its neighbors.',W/2,H*0.45);
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
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent='Moves: '+moves;
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
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')cursorC=Math.min(SIZE-1,cursorC+1);
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')cursorR=Math.max(0,cursorR-1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')cursorR=Math.min(SIZE-1,cursorR+1);
    if(e.key===' '||e.key==='Enter')makeMove(cursorR,cursorC);
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();var cs=cellSize(),o=boardOrigin();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var gc=Math.floor((mx-o.x)/cs),gr=Math.floor((my-o.y)/cs);
    if(gc>=0&&gc<SIZE&&gr>=0&&gr<SIZE){cursorR=gr;cursorC=gc;makeMove(gr,gc);}
}

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initLightsOut=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',function(e){e.preventDefault();
        var t=e.touches[0];onClick({clientX:t.clientX,clientY:t.clientY});
    });
    bindMobile('btn-left',function(){cursorC=Math.max(0,cursorC-1);});
    bindMobile('btn-right',function(){cursorC=Math.min(SIZE-1,cursorC+1);});
    bindMobile('btn-up',function(){cursorR=Math.max(0,cursorR-1);});
    bindMobile('btn-down',function(){makeMove(cursorR,cursorC);});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopLightsOut=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
