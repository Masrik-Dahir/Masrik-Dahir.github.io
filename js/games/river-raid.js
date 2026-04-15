// River Raid — Vertical scrolling shooter
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],fuelDepots=[],particles=[],explosions=[];
var scrollY=0,scrollSpeed=120,fuel=100,riverSegs=[],bridges=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false,lastShot=0;
var bestScore=0,spawnTimer=0,bridgeTimer=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
generateRiver();
}

function generateRiver(){
riverSegs=[];
var segs=Math.ceil(H/20)+5;
for(var i=0;i<segs;i++){
var cx=W/2+Math.sin(i*0.15)*W*0.15;
var rw=W*0.35+Math.sin(i*0.08)*W*0.08;
riverSegs.push({cx:cx,w:rw});
}
}

function getRiverAt(y){
var idx=Math.floor((H-y+scrollY%20)/20);
if(idx<0)idx=0;if(idx>=riverSegs.length)idx=riverSegs.length-1;
var seg=riverSegs[idx%riverSegs.length];
return{cx:seg.cx,w:seg.w,left:seg.cx-seg.w/2,right:seg.cx+seg.w/2};
}

function resetGame(){
score=0;lives=3;gameTime=0;scrollY=0;scrollSpeed=120;fuel=100;
player={x:W/2,y:H*0.8,w:24,h:30};
bullets=[];enemies=[];fuelDepots=[];particles=[];explosions=[];bridges=[];
spawnTimer=0;bridgeTimer=0;
generateRiver();gameState='playing';
}

function spawnEnemy(){
var r=getRiverAt(0);
var type;var rnd=Math.random();
if(rnd<0.4)type='boat';
else if(rnd<0.7)type='heli';
else type='jet';
var ex=r.left+30+Math.random()*(r.w-60);
var spd=type==='jet'?80:type==='heli'?50:30;
var hw=type==='jet'?12:type==='heli'?16:20;
enemies.push({x:ex,y:-20,w:hw,h:type==='boat'?16:20,type:type,vy:spd,vx:(Math.random()-0.5)*40,hp:type==='jet'?1:1});
}

function spawnFuelDepot(){
var r=getRiverAt(0);
var fx=r.left+40+Math.random()*(r.w-80);
fuelDepots.push({x:fx,y:-20,w:30,h:18});
}

function spawnBridge(){
var r=getRiverAt(0);
bridges.push({x:r.cx,y:-10,w:r.w+40,hp:3,maxHp:3});
}

function addExplosion(x,y,color,n){
for(var i=0;i<n;i++)explosions.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.5+Math.random()*0.5,color:color,size:2+Math.random()*4});
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=gameTime<30?0.7:(gameTime<90?1.0:1.0+(gameTime-90)*0.005);
scrollY+=scrollSpeed*dt;
// shift river
for(var i=riverSegs.length-1;i>0;i--){
riverSegs[i].cx+=(Math.sin(gameTime*0.5+i*0.2)*0.5);
}
// fuel drain
fuel-=5*diffMult*dt;if(fuel<=0){fuel=0;playerDie();}
// speed ramp (gentle)
scrollSpeed=(120+gameTime*1.5)*diffMult;if(scrollSpeed>220)scrollSpeed=220;
// player movement
if(keyLeft)player.x-=200*dt;
if(keyRight)player.x+=200*dt;
if(keyUp)player.y-=150*dt;
if(keyDown)player.y+=150*dt;
// clamp to river
var rv=getRiverAt(player.y);
if(player.x-player.w/2<rv.left+5){player.x=rv.left+5+player.w/2;}
if(player.x+player.w/2>rv.right-5){player.x=rv.right-5-player.w/2;}
if(player.y<30)player.y=30;if(player.y>H-30)player.y=H-30;
// check bank collision
if(player.x-player.w/2<rv.left+3||player.x+player.w/2>rv.right-3){
playerDie();
}
// fire
if(keyUp&&gameTime-lastShot>0.15){
lastShot=gameTime;
bullets.push({x:player.x,y:player.y-player.h/2,vy:-400});
}
// spawn
spawnTimer+=dt;
if(spawnTimer>1.2/diffMult){spawnTimer=0;spawnEnemy();if(Math.random()<0.25)spawnFuelDepot();}
bridgeTimer+=dt;
if(bridgeTimer>8){bridgeTimer=0;spawnBridge();}
// bullets
for(var i=bullets.length-1;i>=0;i--){
bullets[i].y+=bullets[i].vy*dt;
if(bullets[i].y<-10)bullets.splice(i,1);
}
// enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
e.y+=e.vy*dt+scrollSpeed*0.3*dt;
e.x+=e.vx*dt;
// keep in river
var erv=getRiverAt(e.y);
if(e.x<erv.left+e.w)e.vx=Math.abs(e.vx);
if(e.x>erv.right-e.w)e.vx=-Math.abs(e.vx);
if(e.y>H+30){enemies.splice(i,1);continue;}
// bullet hit
for(var b=bullets.length-1;b>=0;b--){
if(Math.abs(bullets[b].x-e.x)<e.w+5&&Math.abs(bullets[b].y-e.y)<e.h+5){
e.hp--;bullets.splice(b,1);
if(e.hp<=0){
var pts=e.type==='jet'?100:e.type==='heli'?60:30;
score+=pts;addExplosion(e.x,e.y,'#ff6600',12);enemies.splice(i,1);
}
break;
}
}
}
// check enemy-player collision
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(Math.abs(player.x-e.x)<(player.w+e.w)/2&&Math.abs(player.y-e.y)<(player.h+e.h)/2){
addExplosion(e.x,e.y,'#ff4400',15);enemies.splice(i,1);playerDie();break;
}
}
// fuel depots
for(var i=fuelDepots.length-1;i>=0;i--){
var f=fuelDepots[i];f.y+=scrollSpeed*0.3*dt;
if(f.y>H+20){fuelDepots.splice(i,1);continue;}
// bullet destroys depot
for(var b=bullets.length-1;b>=0;b--){
if(Math.abs(bullets[b].x-f.x)<f.w&&Math.abs(bullets[b].y-f.y)<f.h){
bullets.splice(b,1);fuelDepots.splice(i,1);score+=80;
addExplosion(f.x,f.y,'#44ff44',8);break;
}
}
if(i<fuelDepots.length){
var f=fuelDepots[i];
if(Math.abs(player.x-f.x)<(player.w+f.w)/2&&Math.abs(player.y-f.y)<(player.h+f.h)/2){
fuel=Math.min(100,fuel+30);addExplosion(f.x,f.y,'#00ff88',6);fuelDepots.splice(i,1);
}
}
}
// bridges
for(var i=bridges.length-1;i>=0;i--){
var br=bridges[i];br.y+=scrollSpeed*0.3*dt;
if(br.y>H+20){bridges.splice(i,1);continue;}
// bullet hit bridge
for(var b=bullets.length-1;b>=0;b--){
if(Math.abs(bullets[b].x-br.x)<br.w/2&&Math.abs(bullets[b].y-br.y)<12){
br.hp--;bullets.splice(b,1);
if(br.hp<=0){score+=500;addExplosion(br.x,br.y,'#ff8800',20);bridges.splice(i,1);}
break;
}
}
if(i<bridges.length){
var br=bridges[i];
if(Math.abs(player.y-br.y)<15&&player.x>br.x-br.w/2&&player.x<br.x+br.w/2){
playerDie();bridges.splice(i,1);
}
}
}
// explosions
for(var i=explosions.length-1;i>=0;i--){
var e=explosions[i];e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;if(e.life<=0)explosions.splice(i,1);
}
}

function playerDie(){
lives--;addExplosion(player.x,player.y,'#ff4400',20);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=W/2;player.y=H*0.8;fuel=Math.max(fuel,50);}
}

function render(){
// water bg
ctx.fillStyle='#0a2a5a';ctx.fillRect(0,0,W,H);
// draw river and banks
for(var y=0;y<H;y+=4){
var rv=getRiverAt(y);
// bank left
ctx.fillStyle='#1a6a1a';ctx.fillRect(0,y,rv.left,4);
// river
var waterShade=Math.sin(y*0.05+gameTime*3)*10;
ctx.fillStyle='rgb('+(20+waterShade)+','+(60+waterShade)+','+(140+waterShade)+')';
ctx.fillRect(rv.left,y,rv.w,4);
// bank right
ctx.fillStyle='#1a6a1a';ctx.fillRect(rv.right,y,W-rv.right,4);
}
// water shimmer
ctx.fillStyle='rgba(100,180,255,0.1)';
for(var i=0;i<20;i++){
var wy=((i*47+scrollY*0.5)%H);
var wrv=getRiverAt(wy);
ctx.fillRect(wrv.left+10+Math.sin(gameTime*2+i)*20,wy,30,2);
}
// fuel depots
for(var i=0;i<fuelDepots.length;i++){
var f=fuelDepots[i];
ctx.fillStyle='#00cc44';ctx.fillRect(f.x-f.w/2,f.y-f.h/2,f.w,f.h);
ctx.fillStyle='#ffffff';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';
ctx.fillText('FUEL',f.x,f.y+4);
}
// bridges
for(var i=0;i<bridges.length;i++){
var br=bridges[i];
var alpha=br.hp/br.maxHp;
ctx.fillStyle='rgba(140,100,60,'+alpha+')';ctx.fillRect(br.x-br.w/2,br.y-6,br.w,12);
ctx.strokeStyle='#8a6a3a';ctx.lineWidth=2;ctx.strokeRect(br.x-br.w/2,br.y-6,br.w,12);
// stripes
ctx.fillStyle='rgba(100,70,40,0.5)';
for(var s=0;s<br.w;s+=15){ctx.fillRect(br.x-br.w/2+s,br.y-6,3,12);}
}
// enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
ctx.save();ctx.translate(e.x,e.y);
if(e.type==='boat'){
ctx.fillStyle='#888';ctx.beginPath();ctx.moveTo(-e.w,5);ctx.lineTo(-e.w+5,-8);ctx.lineTo(e.w-5,-8);ctx.lineTo(e.w,5);ctx.closePath();ctx.fill();
ctx.fillStyle='#666';ctx.fillRect(-3,-12,6,5);
}else if(e.type==='heli'){
ctx.fillStyle='#aa4444';ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
// rotor
var rotAngle=gameTime*20;
ctx.strokeStyle='#ccc';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-15*Math.cos(rotAngle),-e.h/2-3);ctx.lineTo(15*Math.cos(rotAngle),-e.h/2-3);ctx.stroke();
}else{
// jet
ctx.fillStyle='#ccccdd';ctx.beginPath();ctx.moveTo(0,-e.h/2);ctx.lineTo(-e.w/2,e.h/2);ctx.lineTo(0,e.h/2-5);ctx.lineTo(e.w/2,e.h/2);ctx.closePath();ctx.fill();
ctx.fillStyle='#4466aa';ctx.fillRect(-e.w/2-6,e.h/4,e.w+12,4);
}
ctx.restore();
}
// player
ctx.save();ctx.translate(player.x,player.y);
// body
ctx.fillStyle='#3388dd';ctx.beginPath();ctx.moveTo(0,-player.h/2);ctx.lineTo(-player.w/2,player.h/2);ctx.lineTo(-player.w/4,player.h/2-5);ctx.lineTo(0,player.h/2);ctx.lineTo(player.w/4,player.h/2-5);ctx.lineTo(player.w/2,player.h/2);ctx.closePath();ctx.fill();
// wings
ctx.fillStyle='#2266aa';ctx.fillRect(-player.w/2-8,0,player.w+16,4);
// cockpit
ctx.fillStyle='#aaddff';ctx.beginPath();ctx.arc(0,-5,5,0,Math.PI*2);ctx.fill();
// engine glow
ctx.fillStyle='rgba(255,150,50,0.6)';ctx.beginPath();ctx.arc(0,player.h/2+3,4+Math.random()*2,0,Math.PI*2);ctx.fill();
ctx.restore();
// bullets
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
for(var i=0;i<bullets.length;i++){ctx.fillRect(bullets[i].x-1.5,bullets[i].y-4,3,8);}
ctx.shadowBlur=0;
// explosions
for(var i=0;i<explosions.length;i++){
var e=explosions[i];ctx.globalAlpha=e.life*2;ctx.fillStyle=e.color;
ctx.fillRect(e.x-e.size/2,e.y-e.size/2,e.size,e.size);
}
ctx.globalAlpha=1;
// fuel gauge
ctx.fillStyle='#333';ctx.fillRect(10,10,104,14);
ctx.fillStyle=fuel>25?'#00cc44':'#ff3333';ctx.fillRect(12,12,fuel,10);
ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.strokeRect(10,10,104,14);
ctx.fillStyle='#fff';ctx.font='9px "Courier New"';ctx.textAlign='left';ctx.fillText('FUEL',14,21);
// lives
ctx.fillStyle='#3388dd';
for(var i=0;i<lives;i++){
ctx.beginPath();ctx.moveTo(W-20-i*25,15);ctx.lineTo(W-30-i*25,25);ctx.lineTo(W-20-i*25,22);ctx.lineTo(W-10-i*25,25);ctx.closePath();ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#0a1a3a';ctx.fillRect(0,0,W,H);
// water effect
for(var y=0;y<H;y+=6){
var shade=Math.sin(y*0.03+titlePulse)*15;
ctx.fillStyle='rgb('+(15+shade)+','+(40+shade)+','+(90+shade)+')';
ctx.fillRect(W*0.2,y,W*0.6,6);
}
ctx.fillStyle='#1a5a1a';ctx.fillRect(0,0,W*0.2,H);ctx.fillRect(W*0.8,0,W*0.2,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4422';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff4422';
ctx.fillText('RIVER RAID',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#4488ff';
ctx.fillText('FUEL UP & FIRE AWAY',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to steer, Up to shoot & accelerate',W/2,H*0.65);
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
document.getElementById('hud-speed').textContent='FUEL '+Math.floor(fuel)+'%';
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

window.initRiverRaid=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopRiverRaid=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
