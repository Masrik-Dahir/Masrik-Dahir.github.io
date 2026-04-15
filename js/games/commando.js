// Commando — Vertical scrolling run-and-gun
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],grenades=[],enemies=[],barriers=[],particles=[],explosions=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false;
var lastShot=0,lastGrenade=0,scrollY=0,scrollSpeed=60,bestScore=0;
var trees=[],bunkers=[],spawnTimer=0,grenadeCount=5;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
generateTerrain();
}

function generateTerrain(){
trees=[];bunkers=[];
for(var i=0;i<40;i++){
trees.push({x:Math.random()*W,y:Math.random()*H*3-H,r:8+Math.random()*12});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;scrollY=0;scrollSpeed=60;grenadeCount=5;
player={x:W/2,y:H*0.8,w:16,h:20,dir:0};
bullets=[];grenades=[];enemies=[];barriers=[];particles=[];explosions=[];
spawnTimer=0;
generateTerrain();
// spawn some barriers
for(var i=0;i<5;i++){
barriers.push({x:50+Math.random()*(W-100),y:-200-Math.random()*400,w:30+Math.random()*40,h:20,hp:2});
}
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*180,vy:(Math.random()-0.5)*180,
life:0.3+Math.random()*0.5,color:color,size:2+Math.random()*3});
}

function addExplosion(x,y,r){
for(var i=0;i<15;i++){
var a=Math.random()*Math.PI*2;
explosions.push({x:x,y:y,vx:Math.cos(a)*60*Math.random(),vy:Math.sin(a)*60*Math.random(),
life:0.4+Math.random()*0.4,size:r*0.3+Math.random()*r*0.5,color:Math.random()>0.5?'#ff6600':'#ffcc00'});
}
}

function playerDie(){
lives--;addExplosion(player.x,player.y,20);addParticles(player.x,player.y,'#ff4444',15);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=W/2;player.y=H*0.8;grenadeCount=Math.max(grenadeCount,3);}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=gameTime<30?0.7:(gameTime<90?1.0:1.0+(gameTime-90)*0.005);
scrollY+=scrollSpeed*dt;
scrollSpeed=(60+gameTime*0.8)*diffMult;if(scrollSpeed>130)scrollSpeed=130;
// player movement
var moveSpeed=180;
if(keyLeft){player.x-=moveSpeed*dt;player.dir=Math.PI;}
if(keyRight){player.x+=moveSpeed*dt;player.dir=0;}
if(keyUp){player.y-=moveSpeed*dt;player.dir=-Math.PI/2;}
if(keyDown){player.y+=moveSpeed*dt;player.dir=Math.PI/2;}
if(keyLeft&&keyUp)player.dir=-Math.PI*3/4;
if(keyRight&&keyUp)player.dir=-Math.PI/4;
if(keyLeft&&keyDown)player.dir=Math.PI*3/4;
if(keyRight&&keyDown)player.dir=Math.PI/4;
if(player.x<15)player.x=15;if(player.x>W-15)player.x=W-15;
if(player.y<30)player.y=30;if(player.y>H-30)player.y=H-30;
// auto-fire when pressing up
if(keyUp&&gameTime-lastShot>0.12){
lastShot=gameTime;
bullets.push({x:player.x,y:player.y-player.h/2,vx:0,vy:-350});
}
// fire with space
if(keyFire&&gameTime-lastShot>0.12){
lastShot=gameTime;
bullets.push({x:player.x,y:player.y-player.h/2,vx:Math.cos(player.dir)*350,vy:Math.sin(player.dir)*350});
}
// grenade (down key when enemies ahead)
if(keyDown&&grenadeCount>0&&gameTime-lastGrenade>0.8){
lastGrenade=gameTime;grenadeCount--;
grenades.push({x:player.x,y:player.y,vy:-200,vx:(Math.random()-0.5)*50,timer:0.8});
}
// spawn enemies
spawnTimer+=dt;
if(spawnTimer>(1.5-Math.min(gameTime*0.01,0.8))/diffMult){
spawnTimer=0;
var type=Math.random()<0.3?'gunner':'runner';
var ex=30+Math.random()*(W-60);
enemies.push({x:ex,y:-20,w:14,h:18,type:type,vy:(40+Math.random()*30)*diffMult,
vx:(Math.random()-0.5)*40,shootTimer:(1.5+Math.random()*2)/diffMult,hp:1});
// sometimes spawn barriers
if(Math.random()<0.15)barriers.push({x:30+Math.random()*(W-60),y:-30,w:30+Math.random()*30,h:16,hp:2});
// sometimes grenade pickup
if(Math.random()<0.08)enemies.push({x:30+Math.random()*(W-60),y:-20,w:12,h:12,type:'ammo',vy:scrollSpeed*0.5,vx:0,shootTimer:99,hp:1});
}
// bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y<-10||b.y>H+10||b.x<-10||b.x>W+10){bullets.splice(i,1);continue;}
// hit enemies
for(var e=enemies.length-1;e>=0;e--){
if(Math.abs(b.x-enemies[e].x)<enemies[e].w&&Math.abs(b.y-enemies[e].y)<enemies[e].h){
enemies[e].hp--;
if(enemies[e].hp<=0){
if(enemies[e].type==='ammo'){grenadeCount+=3;addParticles(enemies[e].x,enemies[e].y,'#44ff44',8);}
else{score+=enemies[e].type==='gunner'?200:100;addParticles(enemies[e].x,enemies[e].y,'#ff6600',10);}
enemies.splice(e,1);
}
bullets.splice(i,1);break;
}
}
}
// grenades
for(var i=grenades.length-1;i>=0;i--){
var g=grenades[i];g.y+=g.vy*dt;g.x+=g.vx*dt;g.vy+=300*dt;g.timer-=dt;
if(g.timer<=0||g.y>H+20){
addExplosion(g.x,g.y,25);
// kill enemies in blast radius
for(var e=enemies.length-1;e>=0;e--){
if(Math.abs(g.x-enemies[e].x)<40&&Math.abs(g.y-enemies[e].y)<40){
score+=150;addParticles(enemies[e].x,enemies[e].y,'#ff8800',8);enemies.splice(e,1);
}
}
// destroy barriers
for(var b=barriers.length-1;b>=0;b--){
if(Math.abs(g.x-barriers[b].x)<45&&Math.abs(g.y-barriers[b].y)<35){
score+=50;addParticles(barriers[b].x,barriers[b].y,'#886644',8);barriers.splice(b,1);
}
}
grenades.splice(i,1);
}
}
// enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
e.y+=e.vy*dt;e.x+=e.vx*dt;
if(e.x<15||e.x>W-15)e.vx*=-1;
if(e.y>H+30){enemies.splice(i,1);continue;}
if(e.type==='gunner'){
e.shootTimer-=dt;
if(e.shootTimer<=0){
e.shootTimer=(2+Math.random()*2)/diffMult;
var angle=Math.atan2(player.y-e.y,player.x-e.x)+(Math.random()-0.5)*(0.5/diffMult);
bullets.push({x:e.x,y:e.y,vx:Math.cos(angle)*180*diffMult,vy:Math.sin(angle)*180*diffMult});
}
}
// enemy-player collision
if(e.type!=='ammo'&&Math.abs(e.x-player.x)<(player.w+e.w)/2&&Math.abs(e.y-player.y)<(player.h+e.h)/2){
addParticles(e.x,e.y,'#ff4444',10);enemies.splice(i,1);playerDie();break;
}
}
// barriers scroll
for(var i=barriers.length-1;i>=0;i--){
barriers[i].y+=scrollSpeed*0.3*dt;
if(barriers[i].y>H+30)barriers.splice(i,1);
}
// tree parallax
for(var i=0;i<trees.length;i++){
trees[i].y+=scrollSpeed*0.15*dt;
if(trees[i].y>H+30){trees[i].y=-30;trees[i].x=Math.random()*W;}
}
// explosions
for(var i=explosions.length-1;i>=0;i--){var e=explosions[i];e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;e.size*=0.97;if(e.life<=0)explosions.splice(i,1);}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// ground
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a3a1a');bg.addColorStop(1,'#2a4a2a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// ground texture
ctx.fillStyle='rgba(0,0,0,0.05)';
for(var y=0;y<H;y+=8){
ctx.fillRect(0,y+(scrollY%8),W,1);
}
// trees (bg)
for(var i=0;i<trees.length;i++){
var t=trees[i];
ctx.fillStyle='#0d2d0d';ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#1a1a0a';ctx.fillRect(t.x-2,t.y+t.r-3,4,8);
}
// barriers
for(var i=0;i<barriers.length;i++){
var b=barriers[i];
ctx.fillStyle=b.hp>1?'#665533':'#554422';
ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
ctx.strokeStyle='#443311';ctx.lineWidth=1;ctx.strokeRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
}
// enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(e.type==='ammo'){
ctx.fillStyle='#44ff44';ctx.shadowColor='#44ff44';ctx.shadowBlur=6;
ctx.fillRect(e.x-6,e.y-6,12,12);
ctx.fillStyle='#fff';ctx.font='8px "Courier New"';ctx.textAlign='center';ctx.fillText('G',e.x,e.y+3);
ctx.shadowBlur=0;continue;
}
ctx.save();ctx.translate(e.x,e.y);
// body
ctx.fillStyle=e.type==='gunner'?'#884422':'#666644';
ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
// head
ctx.fillStyle='#ffcc99';ctx.beginPath();ctx.arc(0,-e.h/2-4,5,0,Math.PI*2);ctx.fill();
// helmet
ctx.fillStyle=e.type==='gunner'?'#553311':'#555533';
ctx.beginPath();ctx.arc(0,-e.h/2-5,6,Math.PI,0);ctx.fill();
ctx.restore();
}
// player
ctx.save();ctx.translate(player.x,player.y);
// body
ctx.fillStyle='#2266aa';ctx.fillRect(-player.w/2,-player.h/2,player.w,player.h);
// head
ctx.fillStyle='#ffcc99';ctx.beginPath();ctx.arc(0,-player.h/2-4,6,0,Math.PI*2);ctx.fill();
// helmet
ctx.fillStyle='#336633';ctx.beginPath();ctx.arc(0,-player.h/2-5,7,Math.PI,0);ctx.fill();
// gun
ctx.fillStyle='#444';ctx.fillRect(5,-player.h/2,3,8);
ctx.restore();
// grenades in flight
for(var i=0;i<grenades.length;i++){
var g=grenades[i];
ctx.fillStyle='#445522';ctx.beginPath();ctx.arc(g.x,g.y,5,0,Math.PI*2);ctx.fill();
}
// player bullets
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=3;
for(var i=0;i<bullets.length;i++){ctx.fillRect(bullets[i].x-1,bullets[i].y-3,2,6);}
ctx.shadowBlur=0;
// explosions
for(var i=0;i<explosions.length;i++){
var e=explosions[i];ctx.globalAlpha=e.life*2;ctx.fillStyle=e.color;
ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD
ctx.fillStyle='#44ff44';ctx.font='12px "Courier New"';ctx.textAlign='left';
ctx.fillText('GRENADES: '+grenadeCount,10,20);
for(var i=0;i<lives;i++){ctx.fillStyle='#2266aa';ctx.fillRect(10+i*18,28,12,14);}
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2a1a');bg.addColorStop(1,'#0a1a0a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// bullet holes decoration
ctx.fillStyle='rgba(255,200,0,0.1)';
for(var i=0;i<15;i++){
var bx=(i*97+13)%W,by=(i*53+7+Math.sin(titlePulse+i)*10)%H;
ctx.beginPath();ctx.arc(bx,by,3+Math.sin(titlePulse*2+i)*2,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44ff44';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#44ff44';
ctx.fillText('COMMANDO',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#886644';
ctx.fillText('RUN AND GUN',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Up to shoot, Down to throw grenades',W/2,H*0.65);
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
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='GRN '+grenadeCount;
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

window.initCommando=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopCommando=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
