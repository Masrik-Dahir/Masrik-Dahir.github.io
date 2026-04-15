// Chrome Dino — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var dino={x:0,y:0,vy:0,w:40,h:44,ducking:false,frame:0,frameTimer:0};
var GRAVITY=1200,JUMP_VEL=-520,GROUND_Y;
var obstacles=[],clouds=[],stars=[];
var speed=280,score=0,bestScore=0,distance=0;
var spawnTimer=0,spawnInterval=1.8;
var particles=[];
var dayNight=0,isNight=false,nightTimer=0;
var groundScroll=0;

function diffMult(){var t=gameTime;return t<30?0.7:(t<90?1.0:1.0+(t-90)*0.003);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;GROUND_Y=H*0.78;dino.x=W*0.12;}

function resetGame(){
    dino.y=GROUND_Y-dino.h;dino.vy=0;dino.ducking=false;dino.frame=0;
    obstacles=[];clouds=[];stars=[];particles=[];
    speed=280;score=0;distance=0;spawnTimer=0;spawnInterval=1.8;
    gameTime=0;dayNight=0;isNight=false;nightTimer=0;groundScroll=0;
    // init clouds
    for(var i=0;i<5;i++){clouds.push({x:Math.random()*W,y:H*0.15+Math.random()*H*0.25,w:40+Math.random()*40,s:0.3+Math.random()*0.4});}
    // init stars
    for(var i=0;i<30;i++){stars.push({x:Math.random()*W,y:Math.random()*H*0.5,s:Math.random()*2+1,b:Math.random()});}
    gameState='playing';
}

function spawnObstacle(){
    var type=Math.random();
    if(type<0.55){
        // cactus small
        var count=1+Math.floor(Math.random()*3);
        obstacles.push({type:'cactus',x:W+20,y:GROUND_Y,w:15*count,h:30+Math.random()*15,count:count});
    }else if(type<0.85){
        // cactus large
        obstacles.push({type:'cactus',x:W+20,y:GROUND_Y,w:20,h:45+Math.random()*10,count:1});
    }else if(score>5){
        // pterodactyl
        var hy=GROUND_Y-30-Math.random()*60;
        obstacles.push({type:'ptero',x:W+20,y:hy,w:36,h:28,frame:0,frameTimer:0});
    }
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*80+20;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:1,color:color,size:Math.random()*3+1});
    }
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;

    // day/night cycle
    nightTimer+=dt;
    if(nightTimer>15){nightTimer=0;isNight=!isNight;}
    dayNight+=(isNight?1:-1)*dt*0.3;
    dayNight=Math.max(0,Math.min(1,dayNight));

    // Difficulty progression: easy (0-20s), medium (20-50s), hard (50s+)
    var diffPhase=gameTime<20?0:(gameTime<50?1:2);
    var speedBase=diffPhase===0?280:(diffPhase===1?340:400);
    var speedRamp=diffPhase===0?gameTime*1.5:(diffPhase===1?gameTime*2.5:gameTime*3.5);
    speed=speedBase+speedRamp;
    if(speed>600)speed=600;

    // dino physics
    var dinoH=dino.ducking?28:44;
    dino.h=dinoH;
    dino.vy+=GRAVITY*dt;
    dino.y+=dino.vy*dt;
    if(dino.y+dino.h>=GROUND_Y){
        dino.y=GROUND_Y-dino.h;
        if(dino.vy>0)dino.vy=0;
    }

    // running animation
    dino.frameTimer+=dt;
    if(dino.frameTimer>0.1){dino.frameTimer=0;dino.frame=(dino.frame+1)%2;}

    // ground scroll
    groundScroll=(groundScroll+speed*dt)%20;

    // score
    distance+=speed*dt;
    score=Math.floor(distance/50);

    // spawn obstacles
    spawnTimer+=dt;
    spawnInterval=Math.max(0.8,(1.8-gameTime*0.008)/diffMult());
    if(spawnTimer>=spawnInterval){
        spawnTimer=0;spawnObstacle();
    }

    // move obstacles
    for(var i=obstacles.length-1;i>=0;i--){
        var o=obstacles[i];
        var ospd=o.type==='ptero'?speed*1.1:speed;
        o.x-=ospd*dt;
        if(o.type==='ptero'){o.frameTimer=(o.frameTimer||0)+dt;if(o.frameTimer>0.15){o.frameTimer=0;o.frame=(o.frame+1)%2;}}
        if(o.x+o.w<-20){obstacles.splice(i,1);continue;}

        // collision — generous hitbox
        var dx=dino.x,dy=dino.y,dw=dino.w*0.6,ddh=dino.h*0.85;
        var ox=o.x,oy=o.type==='cactus'?o.y-o.h:o.y,ow=o.w*0.7,oh=o.type==='cactus'?o.h*0.85:o.h*0.7;
        if(dx+dw>ox+ow*0.15&&dx<ox+ow&&dy+ddh>oy+oh*0.15&&dy<oy+oh){
            if(score>bestScore)bestScore=score;
            addParticles(dino.x+dino.w/2,dino.y+dino.h/2,'#ff3333',15);
            gameState='gameover';return;
        }
    }

    // clouds
    for(var i=0;i<clouds.length;i++){
        clouds[i].x-=clouds[i].s*speed*0.15*dt;
        if(clouds[i].x+clouds[i].w<0){clouds[i].x=W+10;clouds[i].y=H*0.15+Math.random()*H*0.25;}
    }

    // particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawDino(){
    ctx.save();
    var x=dino.x,y=dino.y;
    var bodyColor=isNight?'#ddd':'#535353';
    var bodyDark=isNight?'#bbb':'#3a3a3a';
    var bodyLight=isNight?'#eee':'#6a6a6a';
    if(dino.ducking){
        // ducking dino — wide and short with gradient
        var dg=ctx.createLinearGradient(x,y+8,x,y+28);dg.addColorStop(0,bodyLight);dg.addColorStop(1,bodyDark);
        ctx.fillStyle=dg;ctx.fillRect(x,y+8,36,20);// body
        ctx.fillStyle=bodyColor;ctx.fillRect(x+30,y+4,10,12);// head
        ctx.fillRect(x+36,y+4,4,4);// snout
        // scales texture
        ctx.fillStyle=bodyDark;
        for(var sx=x+2;sx<x+34;sx+=6)ctx.fillRect(sx,y+14,2,1);
        // eye with highlight
        ctx.fillStyle=isNight?'#333':'#fff';ctx.fillRect(x+34,y+6,3,3);
        ctx.fillStyle='#000';ctx.fillRect(x+35,y+7,1,1);
        // legs
        ctx.fillStyle=bodyColor;
        if(dino.frame===0){ctx.fillRect(x+6,y+28,4,12);ctx.fillRect(x+20,y+28,4,8);}
        else{ctx.fillRect(x+6,y+28,4,8);ctx.fillRect(x+20,y+28,4,12);}
    }else{
        // standing dino with gradient
        var bg=ctx.createLinearGradient(x+4,y,x+32,y+32);bg.addColorStop(0,bodyLight);bg.addColorStop(1,bodyDark);
        ctx.fillStyle=bg;ctx.fillRect(x+4,y,28,32);// body
        // head
        var hg=ctx.createLinearGradient(x+20,y-12,x+38,y+8);hg.addColorStop(0,bodyLight);hg.addColorStop(1,bodyColor);
        ctx.fillStyle=hg;ctx.fillRect(x+20,y-12,18,20);// head
        ctx.fillStyle=bodyColor;ctx.fillRect(x+32,y-12,6,6);// snout
        // teeth
        ctx.fillStyle='#fff';ctx.fillRect(x+33,y+2,2,2);ctx.fillRect(x+36,y+2,2,2);
        // scales texture
        ctx.fillStyle=bodyDark;
        for(var sx=x+6;sx<x+30;sx+=5)ctx.fillRect(sx,y+8,2,1);
        for(var sx=x+8;sx<x+28;sx+=5)ctx.fillRect(sx,y+16,2,1);
        // eye with highlight
        ctx.fillStyle=isNight?'#333':'#fff';ctx.fillRect(x+30,y-8,4,4);
        ctx.fillStyle='#000';ctx.fillRect(x+31,y-7,2,2);
        // arms
        ctx.fillStyle=bodyColor;ctx.fillRect(x,y+12,6,8);
        ctx.fillStyle=bodyDark;ctx.fillRect(x,y+12,6,1);
        // tail with slight gradient
        ctx.fillStyle=bodyColor;ctx.fillRect(x-4,y+4,8,6);
        ctx.fillStyle=bodyDark;ctx.fillRect(x-4,y+4,8,1);
        // legs
        ctx.fillStyle=bodyColor;
        if(dino.vy!==0){// jumping — jump dust
            ctx.fillRect(x+8,y+32,5,12);ctx.fillRect(x+22,y+32,5,12);
        }else if(dino.frame===0){
            ctx.fillRect(x+8,y+32,5,12);ctx.fillRect(x+22,y+32,5,8);
        }else{
            ctx.fillRect(x+8,y+32,5,8);ctx.fillRect(x+22,y+32,5,12);
        }
    }
    ctx.restore();
}

function drawCactus(o){
    var bw=12,x=o.x;
    for(var i=0;i<o.count;i++){
        var cx=x+i*bw;
        // main stem with gradient
        var cg=ctx.createLinearGradient(cx+3,0,cx+bw-3,0);
        cg.addColorStop(0,isNight?'#5a5':'#1a5a1a');cg.addColorStop(0.5,isNight?'#7c7':'#2a7a2a');cg.addColorStop(1,isNight?'#4a4':'#1a5a1a');
        ctx.fillStyle=cg;ctx.fillRect(cx+3,o.y-o.h,bw-6,o.h);
        // spines
        ctx.fillStyle=isNight?'#8a8':'#3a8a3a';
        for(var sy=o.y-o.h+4;sy<o.y;sy+=6){
            ctx.fillRect(cx+1,sy,2,1);ctx.fillRect(cx+bw-5,sy+3,2,1);
        }
        // arms
        if(o.h>35){
            ctx.fillStyle=isNight?'#6a6':'#2a6a2a';
            ctx.fillRect(cx-2,o.y-o.h*0.6,6,o.h*0.25);
            ctx.fillRect(cx-2,o.y-o.h*0.6,3,3);
            ctx.fillRect(cx+bw-7,o.y-o.h*0.4,6,o.h*0.2);
            ctx.fillRect(cx+bw-4,o.y-o.h*0.4,3,3);
        }
        // highlight on stem
        ctx.fillStyle=isNight?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)';
        ctx.fillRect(cx+4,o.y-o.h+1,2,o.h-2);
    }
}

function drawPtero(o){
    ctx.fillStyle=isNight?'#aaa':'#666';
    var x=o.x,y=o.y;
    var pc=isNight?'#aaa':'#666';var pd=isNight?'#888':'#444';
    // body with gradient
    var pg=ctx.createLinearGradient(x+8,y+8,x+28,y+18);pg.addColorStop(0,pc);pg.addColorStop(1,pd);
    ctx.fillStyle=pg;ctx.fillRect(x+8,y+8,20,10);
    // head
    ctx.fillStyle=pc;ctx.fillRect(x+24,y+6,8,6);
    // beak
    ctx.fillStyle=isNight?'#cc9':'#996';ctx.fillRect(x+30,y+8,6,3);
    // eye
    ctx.fillStyle=isNight?'#333':'#fff';ctx.fillRect(x+27,y+7,2,2);
    ctx.fillStyle='#000';ctx.fillRect(x+27,y+7,1,1);
    // wings with gradient
    ctx.fillStyle=pd;
    if(o.frame===0){
        ctx.beginPath();ctx.moveTo(x+10,y+8);ctx.lineTo(x-2,y-4);ctx.lineTo(x+20,y+8);ctx.fill();
    }else{
        ctx.beginPath();ctx.moveTo(x+10,y+18);ctx.lineTo(x-2,y+28);ctx.lineTo(x+20,y+18);ctx.fill();
    }
}

function render(){
    // sky with gradient
    var t=dayNight;
    var skyG=ctx.createLinearGradient(0,0,0,GROUND_Y);
    if(t<0.3){
        skyG.addColorStop(0,'rgb('+Math.round(100+35*(1-t*3))+','+Math.round(180+26*(1-t*3))+','+Math.round(220+15*(1-t*3))+')');
        skyG.addColorStop(1,'rgb('+Math.round(200-60*t*3)+','+Math.round(220-30*t*3)+','+Math.round(240-20*t*3)+')');
    }else{
        var nt=(t-0.3)/0.7;
        skyG.addColorStop(0,'rgb('+Math.round(100-90*nt)+','+Math.round(180-170*nt)+','+Math.round(220-190*nt)+')');
        skyG.addColorStop(1,'rgb('+Math.round(140-120*nt)+','+Math.round(190-170*nt)+','+Math.round(220-180*nt)+')');
    }
    ctx.fillStyle=skyG;ctx.fillRect(0,0,W,H);

    // stars (night) with glow
    if(dayNight>0.3){
        for(var i=0;i<stars.length;i++){
            var s=stars[i];
            var sa=(dayNight-0.3)/0.7*(0.5+0.5*Math.sin(gameTime*3+s.b*10));
            ctx.globalAlpha=sa*0.4;ctx.shadowColor='#aaccff';ctx.shadowBlur=6;
            ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.s*1.5,0,Math.PI*2);ctx.fill();
            ctx.shadowBlur=0;ctx.globalAlpha=sa;
            ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        // moon with glow
        ctx.shadowColor='#ffffcc';ctx.shadowBlur=30;
        ctx.fillStyle='#eee';ctx.beginPath();ctx.arc(W*0.8,H*0.15,20,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        var skyBg=ctx.createRadialGradient(W*0.8,H*0.15,0,W*0.8,H*0.15,60);
        skyBg.addColorStop(0,'rgba(200,200,180,0.1)');skyBg.addColorStop(1,'transparent');
        ctx.fillStyle=skyBg;ctx.beginPath();ctx.arc(W*0.8,H*0.15,60,0,Math.PI*2);ctx.fill();
        var r=Math.round(10+125*(1-t)),g=Math.round(10+196*(1-t)),b=Math.round(30+205*(1-t));
        ctx.fillStyle='rgb('+r+','+g+','+b+')';ctx.beginPath();ctx.arc(W*0.8+6,H*0.15-4,18,0,Math.PI*2);ctx.fill();
    }

    // clouds with soft edges
    for(var i=0;i<clouds.length;i++){
        var c=clouds[i];
        ctx.fillStyle=isNight?'rgba(40,40,60,0.5)':'rgba(255,255,255,0.7)';
        ctx.shadowColor=isNight?'rgba(40,40,80,0.3)':'rgba(255,255,255,0.3)';ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(c.x,c.y,c.w*0.3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(c.x+c.w*0.3,c.y-c.w*0.15,c.w*0.35,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(c.x+c.w*0.6,c.y,c.w*0.25,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
    }

    // ground with gradient
    var grdG=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+20);
    grdG.addColorStop(0,isNight?'#444':'#999');grdG.addColorStop(1,isNight?'#222':'#666');
    ctx.fillStyle=grdG;ctx.fillRect(0,GROUND_Y,W,20);
    ctx.fillStyle=isNight?'#555':'#aaa';ctx.fillRect(0,GROUND_Y,W,2);
    // ground texture
    ctx.fillStyle=isNight?'#333':'#888';
    for(var gx=-groundScroll;gx<W;gx+=20){
        ctx.fillRect(gx,GROUND_Y+4,8,1);
        ctx.fillRect(gx+10,GROUND_Y+8,5,1);
        ctx.fillRect(gx+5,GROUND_Y+12,3,1);
    }

    // obstacles
    for(var i=0;i<obstacles.length;i++){
        var o=obstacles[i];
        if(o.type==='cactus')drawCactus(o);
        else drawPtero(o);
    }

    // dino
    drawDino();

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // score
    ctx.fillStyle=isNight?'#ddd':'#535353';
    ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.textAlign='right';
    var scoreStr=('00000'+score).slice(-5);
    ctx.fillText('HI '+('00000'+bestScore).slice(-5)+'  '+scoreStr,W-15,30);
}

function drawTitle(dt){
    ctx.fillStyle='#f7f7f7';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // ground
    ctx.fillStyle='#888';ctx.fillRect(0,H*0.7,W,2);
    // standing dino
    ctx.save();ctx.translate(W/2-20,H*0.7-44);
    ctx.fillStyle='#535353';
    ctx.fillRect(4,0,28,32);ctx.fillRect(20,-12,18,20);ctx.fillRect(32,-12,6,6);
    ctx.fillStyle='#fff';ctx.fillRect(30,-8,4,4);
    ctx.fillStyle='#535353';ctx.fillRect(0,12,6,8);ctx.fillRect(-4,4,8,6);
    ctx.fillRect(8,32,5,12);ctx.fillRect(22,32,5,12);
    ctx.restore();
    ctx.save();ctx.textAlign='center';
    ctx.fillStyle='#535353';ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillText('CHROME DINO',W/2,H*0.2);
    ctx.fillStyle='#888';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Jump over cacti, duck under pterodactyls!',W/2,H*0.3);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.35);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(80,80,80,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.88);ctx.restore();
}

function drawGameOver(){
    ctx.save();ctx.textAlign='center';
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(W/2-120,H*0.3,240,70);
    ctx.fillStyle='#535353';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
    ctx.fillText('GAME OVER',W/2,H*0.35+15);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(80,80,80,'+a+')';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.35+45);
    ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent=Math.round(speed);
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

var jumpHeld=false,duckHeld=false;
function doJump(){if(dino.y+dino.h>=GROUND_Y-1){dino.vy=JUMP_VEL;}}
function doDuck(on){dino.ducking=on;}

function onKey(e,down){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    if(down){
        if(e.key==='ArrowUp'||e.key===' '||e.key==='w'||e.key==='W'){doJump();jumpHeld=true;}
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){doDuck(true);duckHeld=true;}
    }else{
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){doDuck(false);duckHeld=false;}
        if(e.key==='ArrowUp'||e.key===' '||e.key==='w'||e.key==='W')jumpHeld=false;
    }
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

// Mobile: tap top half = jump, tap bottom half = duck
function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var my=e.clientY-r.top;
    if(my<H/2)doJump();else doDuck(true);
    setTimeout(function(){doDuck(false);},200);
}

// D-pad buttons
function setupButtons(){
    var btnUp=document.getElementById('btn-up');
    var btnDown=document.getElementById('btn-down');
    if(btnUp){
        btnUp.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing'){resetGame();return;}doJump();});
        btnUp.addEventListener('mousedown',function(){if(gameState!=='playing'){resetGame();return;}doJump();});
    }
    if(btnDown){
        btnDown.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')return;doDuck(true);});
        btnDown.addEventListener('touchend',function(e){e.preventDefault();doDuck(false);});
        btnDown.addEventListener('mousedown',function(){if(gameState!=='playing')return;doDuck(true);});
        btnDown.addEventListener('mouseup',function(){doDuck(false);});
    }
}

window.initChromeDino=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',function(e){e.preventDefault();onClick(e.touches[0]);},{passive:false});
    setupButtons();
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopChromeDino=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
