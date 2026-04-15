// Star Force — Vertical scrolling space shooter with power-ups
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],enemyBullets=[],powerups=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false;
var lastShot=0,bestScore=0,spawnTimer=0,waveCount=0;
var powerLevel=1,shieldTimer=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*2,speed:30+Math.random()*80});
}

function resetGame(){
score=0;lives=3;gameTime=0;powerLevel=1;shieldTimer=0;waveCount=0;
player={x:W/2,y:H*0.8,w:22,h:26};
bullets=[];enemies=[];enemyBullets=[];powerups=[];particles=[];
spawnTimer=0;
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,
life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function spawnWave(){
waveCount++;
var formation=Math.floor(Math.random()*4);
var count=4+Math.min(waveCount,8);
for(var i=0;i<count;i++){
var ex,ey,evx=0,evy;
if(formation===0){// V formation
ex=W/2+(i-count/2)*30;ey=-20-Math.abs(i-count/2)*20;evx=0;evy=60+Math.random()*20;
}else if(formation===1){// line
ex=30+i*(W-60)/count;ey=-20;evx=0;evy=50+Math.random()*30;
}else if(formation===2){// swoop from sides
ex=i%2===0?-20:W+20;ey=30+i*25;evx=i%2===0?80:-80;evy=40;
}else{// random
ex=30+Math.random()*(W-60);ey=-20-Math.random()*100;evx=(Math.random()-0.5)*40;evy=50+Math.random()*40;
}
var colors=['#ff4466','#44aaff','#ffaa44','#44ff88','#ff88ff'];
var color=colors[Math.floor(Math.random()*colors.length)];
var hp=1;var pts=100;
if(Math.random()<0.2){hp=3;pts=500;color='#ff0000';}
else if(Math.random()<0.3){hp=2;pts=200;}
enemies.push({x:ex,y:ey,w:16,h:16,vx:evx,vy:evy,hp:hp,color:color,points:pts,
shootTimer:2+Math.random()*3,phase:Math.random()*Math.PI*2,dropPower:Math.random()<0.15});
}
}

function spawnPowerup(x,y){
var types=['P','S','B'];// power, shield, bomb
var type=types[Math.floor(Math.random()*types.length)];
powerups.push({x:x,y:y,type:type,vy:40,phase:0});
}

function playerDie(){
if(shieldTimer>0){shieldTimer=0;return;}
lives--;powerLevel=Math.max(1,powerLevel-1);
addParticles(player.x,player.y,'#00ccff',20);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=W/2;player.y=H*0.8;}
}

function fireBullets(){
var px=player.x,py=player.y-player.h/2;
if(powerLevel>=1)bullets.push({x:px,y:py,vx:0,vy:-400});
if(powerLevel>=2){bullets.push({x:px-8,y:py+5,vx:-30,vy:-380});bullets.push({x:px+8,y:py+5,vx:30,vy:-380});}
if(powerLevel>=3){bullets.push({x:px-14,y:py+10,vx:-60,vy:-350});bullets.push({x:px+14,y:py+10,vx:60,vy:-350});}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
// Difficulty multiplier based on wave count
var diffMult=waveCount<=3?0.7:(waveCount<=8?1.0:1.0+(waveCount-8)*0.1);
if(shieldTimer>0)shieldTimer-=dt;
// stars
for(var i=0;i<stars.length;i++){stars[i].y+=stars[i].speed*dt;if(stars[i].y>H){stars[i].y=-5;stars[i].x=Math.random()*W;}}
// player
var speed=200;
if(keyLeft)player.x-=speed*dt;if(keyRight)player.x+=speed*dt;
if(keyUp)player.y-=speed*dt;if(keyDown)player.y+=speed*dt;
if(player.x<15)player.x=15;if(player.x>W-15)player.x=W-15;
if(player.y<30)player.y=30;if(player.y>H-30)player.y=H-30;
// fire
if((keyFire||keyUp)&&gameTime-lastShot>0.12){lastShot=gameTime;fireBullets();}
// spawn waves - difficulty scales spawn rate and enemy cap
var spawnInterval=waveCount<=3?4.5:Math.max(2,3.5-waveCount*0.08);
var maxEn=waveCount<=3?4:5+Math.min(waveCount,6);
spawnTimer+=dt;
if(spawnTimer>spawnInterval&&enemies.length<maxEn){spawnTimer=0;spawnWave();}
// bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y<-10||b.x<-10||b.x>W+10){bullets.splice(i,1);continue;}
for(var e=enemies.length-1;e>=0;e--){
if(Math.abs(b.x-enemies[e].x)<enemies[e].w&&Math.abs(b.y-enemies[e].y)<enemies[e].h){
enemies[e].hp--;
if(enemies[e].hp<=0){
score+=enemies[e].points;
addParticles(enemies[e].x,enemies[e].y,enemies[e].color,12);
if(enemies[e].dropPower)spawnPowerup(enemies[e].x,enemies[e].y);
enemies.splice(e,1);
}else{addParticles(b.x,b.y,'#fff',3);}
bullets.splice(i,1);break;
}
}
}
// enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
e.x+=e.vx*dt;e.y+=e.vy*dt;e.phase+=dt*3;
if(e.x<10||e.x>W-10)e.vx*=-1;
if(e.y>H+30){enemies.splice(i,1);continue;}
e.shootTimer-=dt;
var eShootRate=waveCount<=3?3.5+Math.random()*3:2.5+Math.random()*2;
var eBulletSpd=waveCount<=3?120:160*diffMult;
if(e.shootTimer<=0&&e.y>0){
e.shootTimer=eShootRate;
var angle=Math.atan2(player.y-e.y,player.x-e.x)+(Math.random()-0.5)*(waveCount<=3?0.8:0.5);
enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(angle)*eBulletSpd,vy:Math.sin(angle)*eBulletSpd});
}
if(Math.abs(e.x-player.x)<(e.w+player.w)/2&&Math.abs(e.y-player.y)<(e.h+player.h)/2){
addParticles(e.x,e.y,e.color,10);enemies.splice(i,1);playerDie();break;
}
}
// enemy bullets
for(var i=enemyBullets.length-1;i>=0;i--){
var b=enemyBullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y>H+10||b.y<-10||b.x<-10||b.x>W+10){enemyBullets.splice(i,1);continue;}
if(Math.abs(b.x-player.x)<player.w&&Math.abs(b.y-player.y)<player.h){
enemyBullets.splice(i,1);playerDie();break;
}
}
// powerups
for(var i=powerups.length-1;i>=0;i--){
var p=powerups[i];p.y+=p.vy*dt;p.phase+=dt*4;
if(p.y>H+20){powerups.splice(i,1);continue;}
if(Math.abs(p.x-player.x)<20&&Math.abs(p.y-player.y)<20){
if(p.type==='P'){powerLevel=Math.min(3,powerLevel+1);addParticles(p.x,p.y,'#ff8800',8);}
else if(p.type==='S'){shieldTimer=8;addParticles(p.x,p.y,'#44aaff',8);}
else{// bomb — clear screen
for(var e=enemies.length-1;e>=0;e--){score+=enemies[e].points;addParticles(enemies[e].x,enemies[e].y,enemies[e].color,6);}
enemies=[];enemyBullets=[];addParticles(player.x,player.y,'#ffffff',30);}
powerups.splice(i,1);
}
}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// Deep space background with nebula gradient
var bgGrad=ctx.createRadialGradient(W*0.3,H*0.4,0,W/2,H/2,W*0.8);
bgGrad.addColorStop(0,'#0a0620');bgGrad.addColorStop(0.5,'#060612');bgGrad.addColorStop(1,'#020208');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
// Subtle nebula wisps
ctx.fillStyle='rgba(40,10,60,0.15)';
ctx.beginPath();ctx.ellipse(W*0.7,H*0.3,W*0.3,H*0.15,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(10,20,50,0.1)';
ctx.beginPath();ctx.ellipse(W*0.2,H*0.7,W*0.25,H*0.1,-0.2,0,Math.PI*2);ctx.fill();
// Enhanced stars with twinkle
for(var i=0;i<stars.length;i++){var s=stars[i];
var twinkle=0.3+s.s*0.2+Math.sin(gameTime*2+i*0.7)*0.15;
ctx.fillStyle='rgba(255,255,255,'+twinkle+')';
ctx.fillRect(s.x,s.y,s.s,s.s);
// Bright stars get a cross sparkle
if(s.s>1.5){ctx.fillStyle='rgba(255,255,255,'+(twinkle*0.3)+')';
ctx.fillRect(s.x-1,s.y,s.s+2,s.s);ctx.fillRect(s.x,s.y-1,s.s,s.s+2);}}
// powerups
for(var i=0;i<powerups.length;i++){
var p=powerups[i];
var glow=Math.sin(p.phase)*0.3+0.7;
ctx.save();
if(p.type==='P'){ctx.fillStyle='rgba(255,136,0,'+glow+')';ctx.shadowColor='#ff8800';}
else if(p.type==='S'){ctx.fillStyle='rgba(68,170,255,'+glow+')';ctx.shadowColor='#44aaff';}
else{ctx.fillStyle='rgba(255,255,255,'+glow+')';ctx.shadowColor='#ffffff';}
ctx.shadowBlur=8;
ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText(p.type,p.x,p.y);
ctx.restore();
}
// enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=4;
ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(e.phase)*0.2);
if(e.hp>=3){// boss-like
ctx.beginPath();ctx.moveTo(0,-e.h);ctx.lineTo(-e.w,e.h/2);ctx.lineTo(-e.w/2,e.h);ctx.lineTo(e.w/2,e.h);ctx.lineTo(e.w,e.h/2);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(0,-e.h/2);ctx.lineTo(-e.w/2,0);ctx.lineTo(-e.w/2+3,e.h/2);ctx.lineTo(e.w/2-3,e.h/2);ctx.lineTo(e.w/2,0);ctx.closePath();ctx.fill();
}
ctx.restore();ctx.shadowBlur=0;
}
// player - enhanced ship with gradient and detail
ctx.save();ctx.translate(player.x,player.y);
if(shieldTimer>0){
var shieldGrad=ctx.createRadialGradient(0,0,10,0,0,20);
shieldGrad.addColorStop(0,'rgba(68,170,255,0)');
shieldGrad.addColorStop(0.7,'rgba(68,170,255,'+(0.15+Math.sin(gameTime*8)*0.15)+')');
shieldGrad.addColorStop(1,'rgba(68,170,255,'+(0.3+Math.sin(gameTime*8)*0.2)+')');
ctx.fillStyle=shieldGrad;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='rgba(100,200,255,'+(0.4+Math.sin(gameTime*8)*0.3)+')';ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.stroke();
}
// Ship body with metallic gradient
var shipGrad=ctx.createLinearGradient(-player.w/2,0,player.w/2,0);
shipGrad.addColorStop(0,'#1188bb');shipGrad.addColorStop(0.3,'#44ddff');shipGrad.addColorStop(0.5,'#55eeff');
shipGrad.addColorStop(0.7,'#44ddff');shipGrad.addColorStop(1,'#1188bb');
ctx.fillStyle=shipGrad;ctx.shadowColor='#33ccff';ctx.shadowBlur=8;
ctx.beginPath();ctx.moveTo(0,-player.h/2-2);ctx.lineTo(-player.w/2,player.h/2);ctx.lineTo(0,player.h/2-8);ctx.lineTo(player.w/2,player.h/2);ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
// Wing detail
ctx.fillStyle='#2299cc';ctx.fillRect(-player.w/2-6,3,player.w+12,3);
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(-player.w/2-6,3,player.w+12,1);
// Wing tips
ctx.fillStyle='#44ccee';
ctx.beginPath();ctx.moveTo(-player.w/2-6,2);ctx.lineTo(-player.w/2-8,6);ctx.lineTo(-player.w/2-4,6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(player.w/2+6,2);ctx.lineTo(player.w/2+8,6);ctx.lineTo(player.w/2+4,6);ctx.closePath();ctx.fill();
// Cockpit with glass dome
var cockGrad=ctx.createRadialGradient(-1,-3,1,0,-2,5);
cockGrad.addColorStop(0,'#ddeeff');cockGrad.addColorStop(0.5,'#aaddff');cockGrad.addColorStop(1,'#4488aa');
ctx.fillStyle=cockGrad;ctx.beginPath();ctx.arc(0,-2,4.5,0,Math.PI*2);ctx.fill();
// Engine exhaust - multi-layer flame
var flameLen=6+Math.random()*5;
ctx.fillStyle='rgba(255,100,20,'+(0.6+Math.random()*0.3)+')';
ctx.beginPath();ctx.moveTo(-6,player.h/2);ctx.lineTo(0,player.h/2+flameLen);ctx.lineTo(6,player.h/2);ctx.fill();
ctx.fillStyle='rgba(255,200,80,'+(0.5+Math.random()*0.3)+')';
ctx.beginPath();ctx.moveTo(-3,player.h/2);ctx.lineTo(0,player.h/2+flameLen*0.7);ctx.lineTo(3,player.h/2);ctx.fill();
ctx.fillStyle='rgba(255,255,200,'+(0.4+Math.random()*0.2)+')';
ctx.beginPath();ctx.moveTo(-1,player.h/2);ctx.lineTo(0,player.h/2+flameLen*0.4);ctx.lineTo(1,player.h/2);ctx.fill();
ctx.restore();
// player bullets
ctx.fillStyle='#ffdd44';ctx.shadowColor='#ffdd44';ctx.shadowBlur=3;
for(var i=0;i<bullets.length;i++){ctx.fillRect(bullets[i].x-1.5,bullets[i].y-4,3,8);}
ctx.shadowBlur=0;
// enemy bullets
ctx.fillStyle='#ff4466';ctx.shadowColor='#ff4466';ctx.shadowBlur=3;
for(var i=0;i<enemyBullets.length;i++){ctx.beginPath();ctx.arc(enemyBullets[i].x,enemyBullets[i].y,3,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2.5;ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD
ctx.fillStyle='#ffcc00';ctx.font='11px "Courier New"';ctx.textAlign='left';
ctx.fillText('POWER: '+'|||'.substring(0,powerLevel),10,20);
if(shieldTimer>0){ctx.fillStyle='#44aaff';ctx.fillText('SHIELD: '+Math.ceil(shieldTimer)+'s',10,34);}
for(var i=0;i<lives;i++){
ctx.fillStyle='#33ccff';
ctx.beginPath();ctx.moveTo(W-20-i*20,12);ctx.lineTo(W-28-i*20,22);ctx.lineTo(W-12-i*20,22);ctx.closePath();ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#060612';ctx.fillRect(0,0,W,H);
for(var i=0;i<stars.length;i++){var s=stars[i];ctx.fillStyle='rgba(255,255,255,'+(0.2+0.2*Math.sin(titlePulse+i))+')';ctx.fillRect(s.x,s.y,s.s,s.s);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4466';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ff4466';
ctx.fillText('STAR FORCE',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#44aaff';
ctx.fillText('SPACE COMBAT',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Up/Space to fire',W/2,H*0.65);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.73);}
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Waves survived: '+waveCount,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='PWR '+powerLevel;
document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keyFire=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initStarForce=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;keyFire=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopStarForce=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
