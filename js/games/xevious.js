// Xevious — Vertical scrolling dual-weapon shooter
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,zapBullets=[],blastBombs=[],airEnemies=[],groundTargets=[],particles=[],explosions=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false;
var lastZap=0,lastBlast=0,scrollY=0,scrollSpeed=80,bestScore=0;
var terrain=[],spawnTimer=0,groundTimer=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
generateTerrain();
}

function generateTerrain(){
terrain=[];
for(var i=0;i<50;i++){
terrain.push({x:Math.random()*W,y:Math.random()*H*2-H,w:40+Math.random()*80,h:30+Math.random()*60,
color:'hsl('+(90+Math.random()*40)+',30%,'+(20+Math.random()*15)+'%)'});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;scrollY=0;scrollSpeed=80;
player={x:W/2,y:H*0.75,w:22,h:26};
zapBullets=[];blastBombs=[];airEnemies=[];groundTargets=[];particles=[];explosions=[];
spawnTimer=0;groundTimer=0;
generateTerrain();
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*180,vy:(Math.random()-0.5)*180,
life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function addExplosion(x,y,r,color){
for(var i=0;i<12;i++){
var a=Math.random()*Math.PI*2;
explosions.push({x:x,y:y,vx:Math.cos(a)*50*Math.random(),vy:Math.sin(a)*50*Math.random(),
life:0.4+Math.random()*0.3,size:r*0.3+Math.random()*r*0.4,color:color||'#ff6600'});
}
}

function spawnAirEnemy(){
var types=['toroid','torkan','zoshi'];
var type=types[Math.floor(Math.random()*types.length)];
var ex=30+Math.random()*(W-60);
var e={x:ex,y:-20,w:16,h:16,type:type,hp:1,vy:60+Math.random()*40,vx:0,
shootTimer:2+Math.random()*3,phase:Math.random()*Math.PI*2};
if(type==='toroid'){e.color='#44aaff';e.points=100;e.vx=Math.sin(e.phase)*60;}
else if(type==='torkan'){e.color='#ff6644';e.points=200;e.hp=2;e.vy=40;}
else{e.color='#ffcc00';e.points=150;e.vx=(Math.random()-0.5)*80;}
airEnemies.push(e);
}

function spawnGroundTarget(){
var types=['turret','base','flag'];
var type=types[Math.floor(Math.random()*types.length)];
var gx=40+Math.random()*(W-80);
var g={x:gx,y:-30,w:24,h:24,type:type,hp:1};
if(type==='turret'){g.color='#888888';g.points=300;g.hp=1;g.shootTimer=3+Math.random()*2;}
else if(type==='base'){g.color='#666666';g.points=500;g.hp=2;g.w=36;g.h=30;}
else{g.color='#ff4444';g.points=100;g.hp=1;g.w=16;g.h=20;}
groundTargets.push(g);
}

function playerDie(){
lives--;addExplosion(player.x,player.y,25,'#00ccff');addParticles(player.x,player.y,'#00ccff',15);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=W/2;player.y=H*0.75;}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=gameTime<30?0.7:(gameTime<90?1.0:1.0+(gameTime-90)*0.005);
scrollY+=scrollSpeed*dt;
// player
var speed=190;
if(keyLeft)player.x-=speed*dt;if(keyRight)player.x+=speed*dt;
if(keyUp)player.y-=speed*dt;if(keyDown)player.y+=speed*dt;
if(player.x<15)player.x=15;if(player.x>W-15)player.x=W-15;
if(player.y<30)player.y=30;if(player.y>H-30)player.y=H-30;
// zapper (air weapon) — fires up
if(keyUp&&gameTime-lastZap>0.1){
lastZap=gameTime;
zapBullets.push({x:player.x-4,y:player.y-player.h/2,vy:-400});
zapBullets.push({x:player.x+4,y:player.y-player.h/2,vy:-400});
}
// blaster (ground weapon) — drops bomb ahead
if(keyFire&&gameTime-lastBlast>0.5){
lastBlast=gameTime;
blastBombs.push({x:player.x,y:player.y-20,targetY:player.y-150,vy:-120,size:6});
}
// spawn
spawnTimer+=dt;
if(spawnTimer>1.0/diffMult){spawnTimer=0;spawnAirEnemy();if(Math.random()<0.3*diffMult)spawnAirEnemy();}
groundTimer+=dt;
if(groundTimer>2.5){groundTimer=0;spawnGroundTarget();}
// zap bullets
for(var i=zapBullets.length-1;i>=0;i--){
zapBullets[i].y+=zapBullets[i].vy*dt;
if(zapBullets[i].y<-10){zapBullets.splice(i,1);continue;}
if(zapBullets[i].enemy)continue;
// hit air enemies
for(var e=airEnemies.length-1;e>=0;e--){
if(Math.abs(zapBullets[i].x-airEnemies[e].x)<airEnemies[e].w&&
Math.abs(zapBullets[i].y-airEnemies[e].y)<airEnemies[e].h){
airEnemies[e].hp--;
if(airEnemies[e].hp<=0){
score+=airEnemies[e].points;addExplosion(airEnemies[e].x,airEnemies[e].y,15,airEnemies[e].color);
airEnemies.splice(e,1);
}
zapBullets.splice(i,1);break;
}
}
}
// blast bombs
for(var i=blastBombs.length-1;i>=0;i--){
var b=blastBombs[i];b.y+=b.vy*dt;b.size*=0.995;
if(b.y<=b.targetY){
// explode on ground targets
addExplosion(b.x,b.y,20,'#ff8800');
for(var g=groundTargets.length-1;g>=0;g--){
if(Math.abs(b.x-groundTargets[g].x)<groundTargets[g].w+10&&
Math.abs(b.y-groundTargets[g].y)<groundTargets[g].h+10){
groundTargets[g].hp--;
if(groundTargets[g].hp<=0){
score+=groundTargets[g].points;
addParticles(groundTargets[g].x,groundTargets[g].y,groundTargets[g].color,10);
groundTargets.splice(g,1);
}
}
}
blastBombs.splice(i,1);
}
}
// air enemies
for(var i=airEnemies.length-1;i>=0;i--){
var e=airEnemies[i];
e.y+=e.vy*dt;e.phase+=dt*3;
if(e.type==='toroid')e.x+=Math.sin(e.phase)*2;
e.x+=e.vx*dt;
if(e.x<15||e.x>W-15)e.vx*=-1;
if(e.y>H+30){airEnemies.splice(i,1);continue;}
// shoot at player
e.shootTimer-=dt;
if(e.shootTimer<=0&&e.y>0){
e.shootTimer=(2.5+Math.random()*2)/diffMult;
var angle=Math.atan2(player.y-e.y,player.x-e.x)+(Math.random()-0.5)*(0.5/diffMult);
zapBullets.push({x:e.x,y:e.y,vy:Math.sin(angle)*200*diffMult,vx_e:Math.cos(angle)*200*diffMult,enemy:true});
}
// hit player
if(Math.abs(e.x-player.x)<(e.w+player.w)/2&&Math.abs(e.y-player.y)<(e.h+player.h)/2){
addParticles(e.x,e.y,e.color,10);airEnemies.splice(i,1);playerDie();break;
}
}
// enemy bullets (stored as zapBullets with enemy flag)
for(var i=zapBullets.length-1;i>=0;i--){
var b=zapBullets[i];
if(b.enemy){
if(b.vx_e)b.x+=b.vx_e*dt;
if(Math.abs(b.x-player.x)<player.w&&Math.abs(b.y-player.y)<player.h){
zapBullets.splice(i,1);playerDie();break;
}
}
}
// ground targets scroll
for(var i=groundTargets.length-1;i>=0;i--){
groundTargets[i].y+=scrollSpeed*0.3*dt;
if(groundTargets[i].y>H+30)groundTargets.splice(i,1);
}
// terrain scroll
for(var i=0;i<terrain.length;i++){
terrain[i].y+=scrollSpeed*0.2*dt;
if(terrain[i].y>H+60){terrain[i].y=-60;terrain[i].x=Math.random()*W;}
}
// explosions
for(var i=explosions.length-1;i>=0;i--){var e=explosions[i];e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;if(e.life<=0)explosions.splice(i,1);}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// sky/ground bg
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2a1a');bg.addColorStop(1,'#2a3a2a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// terrain patches
for(var i=0;i<terrain.length;i++){
var t=terrain[i];
ctx.fillStyle=t.color;
ctx.beginPath();ctx.ellipse(t.x,t.y,t.w/2,t.h/2,0,0,Math.PI*2);ctx.fill();
}
// ground targets
for(var i=0;i<groundTargets.length;i++){
var g=groundTargets[i];
ctx.fillStyle=g.color;
if(g.type==='turret'){
ctx.fillRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h);
ctx.fillStyle='#aaa';ctx.beginPath();ctx.arc(g.x,g.y,6,0,Math.PI*2);ctx.fill();
// barrel points at player
var a=Math.atan2(player.y-g.y,player.x-g.x);
ctx.strokeStyle='#ccc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+Math.cos(a)*12,g.y+Math.sin(a)*12);ctx.stroke();
}else if(g.type==='base'){
ctx.fillRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h);
ctx.strokeStyle='#444';ctx.lineWidth=1;ctx.strokeRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h);
ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(g.x,g.y,5,0,Math.PI*2);ctx.fill();
}else{
ctx.fillRect(g.x-4,g.y-g.h/2,8,g.h);
ctx.fillStyle='#ff4444';ctx.fillRect(g.x,g.y-g.h/2,12,8);
}
}
// blast target reticle
ctx.strokeStyle='rgba(255,136,0,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(player.x,player.y-150,15,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.moveTo(player.x-20,player.y-150);ctx.lineTo(player.x+20,player.y-150);ctx.stroke();
ctx.beginPath();ctx.moveTo(player.x,player.y-170);ctx.lineTo(player.x,player.y-130);ctx.stroke();
// air enemies
for(var i=0;i<airEnemies.length;i++){
var e=airEnemies[i];
ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=4;
if(e.type==='toroid'){
ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.arc(e.x,e.y,e.w/4,0,Math.PI*2);ctx.fill();
}else if(e.type==='torkan'){
ctx.beginPath();ctx.moveTo(e.x,e.y-e.h/2);ctx.lineTo(e.x-e.w/2,e.y+e.h/2);ctx.lineTo(e.x+e.w/2,e.y+e.h/2);ctx.closePath();ctx.fill();
}else{
ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(e.x-e.w/4,e.y-e.h/4,e.w/2,e.h/2);
}
ctx.shadowBlur=0;
}
// player
ctx.save();ctx.translate(player.x,player.y);
ctx.fillStyle='#4488cc';
ctx.beginPath();ctx.moveTo(0,-player.h/2);ctx.lineTo(-player.w/2,player.h/2);ctx.lineTo(0,player.h/2-8);ctx.lineTo(player.w/2,player.h/2);ctx.closePath();ctx.fill();
ctx.fillStyle='#3366aa';ctx.fillRect(-player.w/2-6,2,player.w+12,4);
ctx.fillStyle='#88ccff';ctx.beginPath();ctx.arc(0,-3,4,0,Math.PI*2);ctx.fill();
// engine
ctx.fillStyle='rgba(255,150,50,'+(0.5+Math.random()*0.3)+')';
ctx.beginPath();ctx.arc(-3,player.h/2+2,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(3,player.h/2+2,3,0,Math.PI*2);ctx.fill();
ctx.restore();
// zap bullets
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=3;
for(var i=0;i<zapBullets.length;i++){
var b=zapBullets[i];
if(b.enemy){ctx.fillStyle='#ff3333';ctx.shadowColor='#ff3333';}
else{ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';}
ctx.fillRect(b.x-1.5,b.y-4,3,8);
}
ctx.shadowBlur=0;
// blast bombs
for(var i=0;i<blastBombs.length;i++){
var b=blastBombs[i];
ctx.fillStyle='#ff8800';ctx.shadowColor='#ff8800';ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
// shadow on ground
ctx.fillStyle='rgba(0,0,0,0.2)';
ctx.beginPath();ctx.ellipse(b.x,b.targetY,10,4,0,0,Math.PI*2);ctx.fill();
}
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
// lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#4488cc';
ctx.beginPath();ctx.moveTo(10+i*22+7,H-20);ctx.lineTo(10+i*22,H-8);ctx.lineTo(10+i*22+14,H-8);ctx.closePath();ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a2a0a');bg.addColorStop(1,'#1a3a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// terrain patches decoration
ctx.fillStyle='rgba(40,80,40,0.2)';
for(var i=0;i<10;i++){
ctx.beginPath();ctx.ellipse(W*0.1+i*W*0.09,(titlePulse*20+i*60)%H,30,15,0,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44aaff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#44aaff';
ctx.fillText('XEVIOUS',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ff8800';
ctx.fillText('DUAL-WEAPON ASSAULT',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrows to move, Up to zap air, Space to blast ground',W/2,H*0.65);
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
document.getElementById('hud-speed').textContent='AIR+GND';
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

window.initXevious=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;keyFire=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopXevious=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
