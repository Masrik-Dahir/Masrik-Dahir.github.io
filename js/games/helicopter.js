// Helicopter Game — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var heli={x:0,y:0,vy:0,w:30,h:16};
var GRAVITY=420,THRUST=-550;
var caveTop=[],caveBot=[],caveSegW=6;
var gapSize,minGap=120;
var scrollSpeed=180,score=0,bestScore=0,distance=0;
var particles=[],trail=[];
var holding=false;
var obstacles=[];
var obstacleTimer=0;

function diffMult(){var t=gameTime;return t<30?0.7:(t<90?1.0:1.0+(t-90)*0.003);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function initCave(){
    caveTop=[];caveBot=[];
    gapSize=H*0.6;
    var topY=H*0.1,botY=topY+gapSize;
    var segs=Math.ceil(W/caveSegW)+10;
    for(var i=0;i<segs;i++){
        caveTop.push(topY);
        caveBot.push(botY);
    }
}

function resetGame(){
    heli.x=W*0.2;heli.y=H*0.5;heli.vy=0;
    scrollSpeed=180;score=0;distance=0;gameTime=0;
    particles=[];trail=[];obstacles=[];obstacleTimer=0;holding=false;
    initCave();
    gameState='playing';
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*80+20;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+1});
    }
}

function advanceCave(){
    caveTop.shift();caveBot.shift();
    var last=caveTop.length-1;
    var topY=caveTop[last]+((Math.random()-0.5)*8);
    // slowly narrow
    gapSize=Math.max(minGap,H*0.6-distance*0.003);
    topY=Math.max(10,Math.min(H-gapSize-10,topY));
    caveTop.push(topY);
    caveBot.push(topY+gapSize);
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;

    // speed ramp — scaled by difficulty
    var dm=diffMult();scrollSpeed=(180+gameTime*0.8)*dm;
    if(scrollSpeed>380)scrollSpeed=380;

    // physics
    if(holding){heli.vy+=THRUST*dt;}
    heli.vy+=GRAVITY*dt;
    heli.vy=Math.max(-300,Math.min(300,heli.vy));
    heli.y+=heli.vy*dt;

    // scroll cave
    var scrollPx=scrollSpeed*dt;
    distance+=scrollPx;
    score=Math.floor(distance/10);

    // advance cave segments
    var segsToAdvance=Math.floor(scrollPx/caveSegW);
    for(var i=0;i<segsToAdvance;i++){
        if(caveTop.length>Math.ceil(W/caveSegW)+5)advanceCave();
        else{
            var topY=caveTop[caveTop.length-1]+((Math.random()-0.5)*6);
            gapSize=Math.max(minGap,H*0.6-distance*0.003);
            topY=Math.max(10,Math.min(H-gapSize-10,topY));
            caveTop.push(topY);caveBot.push(topY+gapSize);
        }
    }

    // obstacles
    obstacleTimer+=dt;
    if(obstacleTimer>3.5&&distance>500){
        obstacleTimer=0;
        var segIdx=Math.min(caveTop.length-1,Math.ceil(W/caveSegW)+3);
        var midY=(caveTop[segIdx]+caveBot[segIdx])/2;
        obstacles.push({x:W+40,y:midY-10,w:15,h:20});
    }
    for(var i=obstacles.length-1;i>=0;i--){
        obstacles[i].x-=scrollSpeed*dt;
        if(obstacles[i].x+obstacles[i].w<0)obstacles.splice(i,1);
    }

    // trail
    if(Math.random()<0.3){trail.push({x:heli.x-5,y:heli.y+heli.h/2+Math.random()*4-2,life:0.6,size:Math.random()*3+2});}
    for(var i=trail.length-1;i>=0;i--){
        trail[i].x-=scrollSpeed*dt*0.5;trail[i].life-=dt*2;
        if(trail[i].life<=0)trail.splice(i,1);
    }

    // collision with cave walls
    var segIdx=Math.floor(heli.x/caveSegW);
    if(segIdx>=0&&segIdx<caveTop.length){
        if(heli.y<caveTop[segIdx]||heli.y+heli.h>caveBot[segIdx]){
            if(score>bestScore)bestScore=score;
            addParticles(heli.x,heli.y,'#ff6633',20);
            gameState='gameover';return;
        }
    }

    // collision with obstacles
    for(var i=0;i<obstacles.length;i++){
        var o=obstacles[i];
        if(heli.x+heli.w>o.x&&heli.x<o.x+o.w&&heli.y+heli.h>o.y&&heli.y<o.y+o.h){
            if(score>bestScore)bestScore=score;
            addParticles(heli.x,heli.y,'#ff6633',20);
            gameState='gameover';return;
        }
    }

    // particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawCave(){
    // top wall with layered gradient
    var topG=ctx.createLinearGradient(0,0,0,H*0.4);
    topG.addColorStop(0,'#1a3a1a');topG.addColorStop(0.5,'#2a5a2a');topG.addColorStop(1,'#1a4a1a');
    ctx.fillStyle=topG;
    ctx.beginPath();ctx.moveTo(0,0);
    for(var i=0;i<caveTop.length&&i*caveSegW<W+caveSegW;i++){
        ctx.lineTo(i*caveSegW,caveTop[i]);
    }
    ctx.lineTo(W+caveSegW,0);ctx.closePath();ctx.fill();
    // Rocky texture on top wall
    ctx.fillStyle='rgba(60,100,60,0.3)';
    for(var i=0;i<caveTop.length-1&&i*caveSegW<W;i+=3){
        var tx=i*caveSegW,ty=caveTop[i];
        ctx.fillRect(tx,ty-8-Math.random()*4,caveSegW*2,6);
    }
    // Top edge glow with double line
    ctx.strokeStyle='rgba(80,200,80,0.3)';ctx.lineWidth=4;
    ctx.beginPath();
    for(var i=0;i<caveTop.length&&i*caveSegW<W+caveSegW;i++){
        if(i===0)ctx.moveTo(0,caveTop[i]);else ctx.lineTo(i*caveSegW,caveTop[i]);
    }
    ctx.stroke();
    ctx.strokeStyle='#55cc55';ctx.lineWidth=1.5;
    ctx.beginPath();
    for(var i=0;i<caveTop.length&&i*caveSegW<W+caveSegW;i++){
        if(i===0)ctx.moveTo(0,caveTop[i]);else ctx.lineTo(i*caveSegW,caveTop[i]);
    }
    ctx.stroke();

    // bottom wall with gradient
    var botG=ctx.createLinearGradient(0,H*0.6,0,H);
    botG.addColorStop(0,'#1a4a1a');botG.addColorStop(0.5,'#2a5a2a');botG.addColorStop(1,'#1a3a1a');
    ctx.fillStyle=botG;
    ctx.beginPath();ctx.moveTo(0,H);
    for(var i=0;i<caveBot.length&&i*caveSegW<W+caveSegW;i++){
        ctx.lineTo(i*caveSegW,caveBot[i]);
    }
    ctx.lineTo(W+caveSegW,H);ctx.closePath();ctx.fill();
    // Rocky texture on bottom wall
    ctx.fillStyle='rgba(60,100,60,0.3)';
    for(var i=0;i<caveBot.length-1&&i*caveSegW<W;i+=3){
        var tx=i*caveSegW,ty=caveBot[i];
        ctx.fillRect(tx,ty+2,caveSegW*2,6);
    }
    ctx.strokeStyle='rgba(80,200,80,0.3)';ctx.lineWidth=4;
    ctx.beginPath();
    for(var i=0;i<caveBot.length&&i*caveSegW<W+caveSegW;i++){
        if(i===0)ctx.moveTo(0,caveBot[i]);else ctx.lineTo(i*caveSegW,caveBot[i]);
    }
    ctx.stroke();
    ctx.strokeStyle='#55cc55';ctx.lineWidth=1.5;
    ctx.beginPath();
    for(var i=0;i<caveBot.length&&i*caveSegW<W+caveSegW;i++){
        if(i===0)ctx.moveTo(0,caveBot[i]);else ctx.lineTo(i*caveSegW,caveBot[i]);
    }
    ctx.stroke();
}

function drawHeli(){
    ctx.save();
    var hx=heli.x,hy=heli.y,hw=heli.w,hh=heli.h;
    // Shadow below
    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(hx+hw/2,hy+hh+4,hw*0.5,4,0,0,Math.PI*2);ctx.fill();
    // Tail boom
    var tg=ctx.createLinearGradient(hx-10,hy+4,hx-10,hy+12);
    tg.addColorStop(0,'#dd7700');tg.addColorStop(1,'#aa5500');
    ctx.fillStyle=tg;ctx.fillRect(hx-12,hy+6,14,3);
    // Tail rotor housing
    ctx.fillStyle='#bb6600';ctx.fillRect(hx-14,hy+2,4,10);
    // Tail rotor spinning
    ctx.strokeStyle='rgba(200,200,200,0.6)';ctx.lineWidth=1.5;
    var tailRot=gameTime*25;
    ctx.beginPath();ctx.moveTo(hx-12,hy+2+5*Math.cos(tailRot));ctx.lineTo(hx-12,hy+12-5*Math.cos(tailRot));ctx.stroke();
    // Main body with gradient
    var bg=ctx.createLinearGradient(hx,hy+2,hx,hy+hh);
    bg.addColorStop(0,'#ffaa44');bg.addColorStop(0.4,'#ff9933');bg.addColorStop(1,'#cc6600');
    ctx.fillStyle=bg;
    // Rounded body shape
    ctx.beginPath();ctx.moveTo(hx+2,hy+hh);ctx.lineTo(hx,hy+6);ctx.lineTo(hx+4,hy+3);
    ctx.lineTo(hx+hw-4,hy+3);ctx.lineTo(hx+hw+2,hy+6);ctx.lineTo(hx+hw,hy+hh);ctx.closePath();ctx.fill();
    // Body highlight stripe
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(hx+2,hy+4,hw-4,3);
    // Racing stripe
    ctx.fillStyle='rgba(255,50,0,0.5)';ctx.fillRect(hx+4,hy+hh-3,hw-8,2);
    // Cockpit windshield with reflection
    var wg=ctx.createLinearGradient(hx+hw-8,hy+4,hx+hw,hy+hh-2);
    wg.addColorStop(0,'#88ddff');wg.addColorStop(0.5,'#44aadd');wg.addColorStop(1,'#2288bb');
    ctx.fillStyle=wg;
    ctx.beginPath();ctx.moveTo(hx+hw-7,hy+5);ctx.lineTo(hx+hw+1,hy+6);ctx.lineTo(hx+hw,hy+hh-2);ctx.lineTo(hx+hw-6,hy+hh-2);ctx.closePath();ctx.fill();
    // Windshield glare
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(hx+hw-5,hy+6,2,4);
    // Skids (landing gear)
    ctx.strokeStyle='#888';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(hx+4,hy+hh);ctx.lineTo(hx+2,hy+hh+2);ctx.lineTo(hx+hw-2,hy+hh+2);ctx.lineTo(hx+hw-4,hy+hh);ctx.stroke();
    // Main rotor mast
    ctx.fillStyle='#999';ctx.fillRect(hx+hw/2-1,hy,2,4);
    // Main rotor blades (motion blur)
    var rotorW=hw*1.0;
    ctx.strokeStyle='rgba(200,210,220,0.7)';ctx.lineWidth=2.5;
    var rot=gameTime*25;
    ctx.beginPath();
    ctx.moveTo(hx+hw/2-rotorW/2*Math.cos(rot),hy-1);
    ctx.lineTo(hx+hw/2+rotorW/2*Math.cos(rot),hy-1);ctx.stroke();
    // Rotor disc transparency effect
    ctx.fillStyle='rgba(180,200,220,0.06)';ctx.beginPath();ctx.ellipse(hx+hw/2,hy-1,rotorW/2,3,0,0,Math.PI*2);ctx.fill();
    // Engine exhaust/glow when thrusting
    if(holding){
        ctx.save();ctx.shadowColor='#ff8800';ctx.shadowBlur=8;
        ctx.fillStyle='rgba(255,180,50,0.5)';
        var flameSize=4+Math.random()*4;
        ctx.beginPath();ctx.moveTo(hx-2,hy+hh/2-2);ctx.lineTo(hx-flameSize-2,hy+hh/2);ctx.lineTo(hx-2,hy+hh/2+2);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,255,150,0.4)';
        ctx.beginPath();ctx.moveTo(hx-1,hy+hh/2-1);ctx.lineTo(hx-flameSize*0.5,hy+hh/2);ctx.lineTo(hx-1,hy+hh/2+1);ctx.closePath();ctx.fill();
        ctx.shadowBlur=0;ctx.restore();
    }
    ctx.restore();
}

function render(){
    // dark bg
    ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
    // faint grid
    ctx.strokeStyle='rgba(30,60,30,0.3)';ctx.lineWidth=1;
    var gridOff=(distance*0.3)%40;
    for(var x=-gridOff;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    drawCave();

    // obstacles
    ctx.fillStyle='#884422';
    for(var i=0;i<obstacles.length;i++){
        var o=obstacles[i];ctx.fillRect(o.x,o.y,o.w,o.h);
        ctx.strokeStyle='#aa6633';ctx.lineWidth=1;ctx.strokeRect(o.x,o.y,o.w,o.h);
    }

    // trail
    for(var i=0;i<trail.length;i++){
        var t=trail[i];ctx.globalAlpha=t.life;
        ctx.fillStyle='#ff9933';ctx.beginPath();ctx.arc(t.x,t.y,t.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    drawHeli();

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // score overlay
    ctx.fillStyle='#33ff66';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
    ctx.textAlign='right';ctx.fillText('DIST: '+score+'m',W-15,30);
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // animated cave demo
    ctx.strokeStyle='#44aa44';ctx.lineWidth=2;ctx.beginPath();
    for(var x=0;x<W;x+=8){
        ctx.lineTo(x,H*0.35+Math.sin(titlePulse+x*0.01)*30);
    }
    ctx.stroke();
    ctx.beginPath();
    for(var x=0;x<W;x+=8){
        ctx.lineTo(x,H*0.65+Math.sin(titlePulse+x*0.01+1)*30);
    }
    ctx.stroke();
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff9933';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff9933';
    ctx.fillText('HELICOPTER',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('HOLD to fly up, RELEASE to descend',W/2,H*0.25);
    ctx.fillText('Navigate through the cave!',W/2,H*0.3);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore+'m',W/2,H*0.75);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('CRASH!',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('DISTANCE: '+score+'m',W/2,H*0.42);
    if(bestScore>0){ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillText('Best: '+bestScore+'m',W/2,H*0.52);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent=Math.round(scrollSpeed);
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*0.016;p.y+=p.vy*0.016;p.vy+=150*0.016;p.life-=0.016*2;if(p.life<=0)particles.splice(i,1);}render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W')holding=down;
    if([' ','ArrowUp','ArrowDown','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

window.initHelicopter=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    canvas.addEventListener('mousedown',function(e){if(gameState!=='playing'){resetGame();return;}holding=true;});
    canvas.addEventListener('mouseup',function(){holding=false;});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing'){resetGame();return;}holding=true;},{passive:false});
    canvas.addEventListener('touchend',function(e){e.preventDefault();holding=false;},{passive:false});
    var btnUp=document.getElementById('btn-up');
    if(btnUp){btnUp.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing'){resetGame();return;}holding=true;});
    btnUp.addEventListener('touchend',function(e){e.preventDefault();holding=false;});
    btnUp.addEventListener('mousedown',function(){if(gameState!=='playing'){resetGame();return;}holding=true;});
    btnUp.addEventListener('mouseup',function(){holding=false;});}
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopHelicopter=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    holding=false;gameState='title';
};
})();
