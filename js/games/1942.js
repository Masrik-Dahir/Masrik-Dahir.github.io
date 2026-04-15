// 1942 — Vertical Shooter (WWII Pacific Theater)
(function(){
// roundRect polyfill
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();
this.moveTo(x+r[0],y);
this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],eBullets=[],particles=[],powerUps=[];
var islands=[],clouds=[],waveClouds=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false,keyRoll=false;
var lastShot=0,wave=1,waveTimer=0,waveDelay=3,enemiesInWave=0,enemiesSpawned=0;
var scrollY=0,SCROLL_SPEED=80;
var PLAYER_SPEED=300,BULLET_SPEED=500,ENEMY_BULLET_SPEED=120;
// Difficulty: easy(wave 1-2), medium(wave 3-5), hard(wave 6+)
function diffMult(){ return wave<=2?0.7:(wave<=5?1.0:1.0+(wave-5)*0.12); }
var spreadShot=false,spreadTimer=0,rapidFire=false,rapidTimer=0,shieldActive=false,shieldTimer=0;
var rollCharges=3,rollActive=false,rollTimer=0,rollCooldown=0,rollAngle=0;
var bossActive=false,boss=null,bossDefeated=0;
var lastDoubleTap=0,doubleTapKey='';

// === RESIZE ===
function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
initBackground();
}

// === BACKGROUND ===
function initBackground(){
islands=[];clouds=[];waveClouds=[];
for(var i=0;i<6;i++){
islands.push({
x:Math.random()*W,y:Math.random()*H,
w:30+Math.random()*60,h:20+Math.random()*40,
color:Math.random()<0.5?'#2d6b30':'#3a7d3e',
sandColor:'#c2b280'
});
}
for(var i=0;i<8;i++){
clouds.push({
x:Math.random()*W,y:Math.random()*H,
w:40+Math.random()*80,h:20+Math.random()*30,
alpha:0.15+Math.random()*0.15,
speed:20+Math.random()*30
});
}
for(var i=0;i<12;i++){
waveClouds.push({
x:Math.random()*W,y:Math.random()*H,
r:3+Math.random()*6,
alpha:0.08+Math.random()*0.08,
speed:SCROLL_SPEED*0.3+Math.random()*20
});
}
}

// === SPAWN HELPERS ===
function spawnIsland(){
islands.push({
x:Math.random()*W,y:-60,
w:30+Math.random()*60,h:20+Math.random()*40,
color:Math.random()<0.5?'#2d6b30':'#3a7d3e',
sandColor:'#c2b280'
});
}

function spawnCloud(){
clouds.push({
x:Math.random()*W,y:-50,
w:40+Math.random()*80,h:20+Math.random()*30,
alpha:0.15+Math.random()*0.15,
speed:20+Math.random()*30
});
}

// === WAVE SPAWNING ===
function spawnWave(){
var waveType;
if(wave%5===0){
// Boss wave
spawnBoss();
bossActive=true;
return;
}
waveType=wave%3;
var count=5+Math.min(wave,10);
enemiesInWave=count;
enemiesSpawned=0;
waveTimer=0;

if(waveType===0) spawnVFormation(count);
else if(waveType===1) spawnLineFormation(count);
else spawnCircleFormation(count);
}

function spawnVFormation(count){
var cx=W/2;
for(var i=0;i<count;i++){
var side=i%2===0?-1:1;
var row=Math.floor(i/2);
var type=getEnemyType();
enemies.push(makeEnemy(
cx+side*row*40,
-40-row*30,
type
));
}
}

function spawnLineFormation(count){
var startX=W*0.15;
var gap=(W*0.7)/(count-1||1);
for(var i=0;i<count;i++){
var type=getEnemyType();
enemies.push(makeEnemy(
startX+i*gap,
-30-Math.abs(i-count/2)*15,
type
));
}
}

function spawnCircleFormation(count){
var cx=W/2,r=Math.min(W,H)*0.15;
for(var i=0;i<count;i++){
var angle=Math.PI*2*i/count;
var type=getEnemyType();
enemies.push(makeEnemy(
cx+Math.cos(angle)*r,
-r-30+Math.sin(angle)*r*0.5,
type
));
}
}

function getEnemyType(){
var roll=Math.random();
if(roll<0.15) return 'bomber';
if(roll<0.35) return 'ace';
return 'fighter';
}

function makeEnemy(x,y,type){
var dm=diffMult();
var hp=1,speed=(80+Math.min(wave*3,40))*dm,w=24,h=24,scoreVal=100;
if(type==='bomber'){hp=wave<=2?2:3;speed=(50+Math.min(wave*2,30))*dm;w=32;h=32;scoreVal=300;}
else if(type==='ace'){hp=1;speed=(100+Math.min(wave*4,50))*dm;w=22;h=22;scoreVal=200;}
return {
x:x,y:y,w:w,h:h,hp:hp,maxHp:hp,type:type,alive:true,
speed:speed,scoreVal:scoreVal,
moveTimer:Math.random()*4,movePhase:Math.random()*Math.PI*2,
shootTimer:1+Math.random()*3,
zigzagAmp:type==='ace'?60+Math.random()*40:0,
zigzagFreq:type==='ace'?2+Math.random():0,
entryY:60+Math.random()*100,
entering:true,startX:x
};
}

// === BOSS ===
function spawnBoss(){
var bossHp=15+wave*3;
boss={
x:W/2,y:-80,w:80,h:60,hp:bossHp,maxHp:bossHp,
alive:true,entering:true,entryY:60,
speed:40,moveTimer:0,moveDir:1,
shootTimer:0,shootPattern:0,patternTimer:0,
turrets:[
{offX:-30,offY:20,timer:0},
{offX:0,offY:30,timer:0.5},
{offX:30,offY:20,timer:1}
],
flashTimer:0
};
}

// === POWER-UPS ===
function spawnPowerUp(x,y){
if(Math.random()>0.25) return; // 25% drop chance
var types=['spread','rapid','shield','life'];
var type=types[Math.floor(Math.random()*types.length)];
var colors={spread:'#ff8800',rapid:'#00ccff',shield:'#8844ff',life:'#ff4488'};
powerUps.push({
x:x,y:y,w:18,h:18,type:type,
color:colors[type],
speed:40+Math.random()*20,
pulse:0
});
}

// === RESET ===
function resetGame(){
player={x:W/2,y:H*0.8,w:30,h:24,invince:2};
bullets=[];enemies=[];eBullets=[];particles=[];powerUps=[];
score=0;lives=3;level=1;wave=1;gameTime=0;
spreadShot=false;spreadTimer=0;rapidFire=false;rapidTimer=0;
shieldActive=false;shieldTimer=0;
rollCharges=3;rollActive=false;rollTimer=0;rollCooldown=0;rollAngle=0;
bossActive=false;boss=null;bossDefeated=0;
waveTimer=0;waveDelay=2;
scrollY=0;
initBackground();
spawnWave();
gameState='playing';
}

// === PARTICLES ===
function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=40+Math.random()*180;
particles.push({
x:x,y:y,
vx:Math.cos(angle)*speed,
vy:Math.sin(angle)*speed,
life:0.3+Math.random()*0.5,
maxLife:0.3+Math.random()*0.5,
color:color,
size:1.5+Math.random()*3
});
}
}

function addExplosion(x,y,big){
var colors=big?['#ff4400','#ff8800','#ffcc00','#ffffff','#ff6600']:['#ff6600','#ffaa00','#ffcc44'];
var count=big?25:12;
for(var i=0;i<count;i++){
addParticles(x,y,colors[Math.floor(Math.random()*colors.length)],1);
}
// Smoke
for(var i=0;i<(big?8:4);i++){
var angle=Math.random()*Math.PI*2;
var speed=20+Math.random()*60;
particles.push({
x:x,y:y,
vx:Math.cos(angle)*speed,
vy:Math.sin(angle)*speed,
life:0.5+Math.random()*0.8,
maxLife:0.5+Math.random()*0.8,
color:'#666',
size:4+Math.random()*6
});
}
}

// === ROLL MANEUVER ===
function startRoll(){
if(rollCharges<=0||rollActive||rollCooldown>0) return;
rollCharges--;
rollActive=true;
rollTimer=0.6; // 0.6s of invincibility
rollAngle=0;
rollCooldown=0.5;
}

// === UPDATE ===
function update(dt){
if(dt>0.1) dt=0.1;
gameTime+=dt;
scrollY+=SCROLL_SPEED*dt;

if(gameState!=='playing') return;

// Update background
for(var i=islands.length-1;i>=0;i--){
islands[i].y+=SCROLL_SPEED*0.6*dt;
if(islands[i].y>H+60){islands.splice(i,1);spawnIsland();}
}
for(var i=clouds.length-1;i>=0;i--){
clouds[i].y+=clouds[i].speed*dt;
if(clouds[i].y>H+50){clouds.splice(i,1);spawnCloud();}
}
for(var i=0;i<waveClouds.length;i++){
waveClouds[i].y+=waveClouds[i].speed*dt;
if(waveClouds[i].y>H+20){waveClouds[i].y=-20;waveClouds[i].x=Math.random()*W;}
}

// Player movement
if(keyLeft) player.x-=PLAYER_SPEED*dt;
if(keyRight) player.x+=PLAYER_SPEED*dt;
if(keyUp) player.y-=PLAYER_SPEED*dt;
if(keyDown) player.y+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));
player.y=Math.max(player.h/2,Math.min(H-player.h/2,player.y));

// Invincibility timer
if(player.invince>0) player.invince-=dt;

// Roll maneuver
if(rollActive){
rollTimer-=dt;
rollAngle+=dt*12; // fast spin
if(rollTimer<=0){rollActive=false;rollAngle=0;}
}
if(rollCooldown>0) rollCooldown-=dt;

// Power-up timers
if(spreadShot){spreadTimer-=dt;if(spreadTimer<=0) spreadShot=false;}
if(rapidFire){rapidTimer-=dt;if(rapidTimer<=0) rapidFire=false;}
if(shieldActive){shieldTimer-=dt;if(shieldTimer<=0) shieldActive=false;}

// Player shooting
var fireRate=rapidFire?0.08:0.18;
if(keySpace&&gameTime-lastShot>fireRate){
lastShot=gameTime;
if(spreadShot){
bullets.push({x:player.x,y:player.y-player.h/2,vx:0,vy:-BULLET_SPEED,player:true});
bullets.push({x:player.x-8,y:player.y-player.h/2+4,vx:-BULLET_SPEED*0.2,vy:-BULLET_SPEED*0.98,player:true});
bullets.push({x:player.x+8,y:player.y-player.h/2+4,vx:BULLET_SPEED*0.2,vy:-BULLET_SPEED*0.98,player:true});
} else {
bullets.push({x:player.x,y:player.y-player.h/2,vx:0,vy:-BULLET_SPEED,player:true});
}
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;
b.y+=b.vy*dt;
if(b.y<-10||b.y>H+10||b.x<-10||b.x>W+10) bullets.splice(i,1);
}

// Update enemy bullets
for(var i=eBullets.length-1;i>=0;i--){
var eb=eBullets[i];
eb.x+=eb.vx*dt;
eb.y+=eb.vy*dt;
if(eb.y>H+10||eb.y<-10||eb.x<-10||eb.x>W+10) eBullets.splice(i,1);
}

// Update enemies
var aliveCount=0;
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}
aliveCount++;
e.moveTimer+=dt;

if(e.entering){
e.y+=e.speed*dt;
if(e.y>=e.entryY) e.entering=false;
} else {
// Move downward slowly
e.y+=e.speed*0.3*dt;

// Zigzag for aces
if(e.type==='ace'){
e.x=e.startX+Math.sin(e.moveTimer*e.zigzagFreq+e.movePhase)*e.zigzagAmp;
}

// Fighter straight line
if(e.type==='fighter'){
e.x+=Math.sin(e.moveTimer*0.8+e.movePhase)*30*dt;
}

// Bomber slow drift
if(e.type==='bomber'){
e.x+=Math.sin(e.moveTimer*0.4+e.movePhase)*15*dt;
}
}

// Enemy shooting
e.shootTimer-=dt;
if(e.shootTimer<=0&&!e.entering){
e.shootTimer=(wave<=2?3:2)+Math.random()*(wave<=2?4:3);
var dx=player.x-e.x,dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy)||1;
var bSpeed=(ENEMY_BULLET_SPEED+Math.min(wave*3,30))*diffMult();
eBullets.push({
x:e.x,y:e.y+e.h/2,
vx:dx/dist*bSpeed*0.3,
vy:bSpeed*0.8,
w:4,h:4
});
}

// Remove if off screen
if(e.y>H+50){e.alive=false;}
}

// Update boss
if(bossActive&&boss&&boss.alive){
if(boss.entering){
boss.y+=40*dt;
if(boss.y>=boss.entryY) boss.entering=false;
} else {
boss.moveTimer+=dt;
boss.x+=boss.speed*boss.moveDir*dt;
if(boss.x<boss.w/2+20){boss.moveDir=1;}
if(boss.x>W-boss.w/2-20){boss.moveDir=-1;}

// Boss shooting patterns
boss.shootTimer-=dt;
boss.patternTimer+=dt;
if(boss.shootTimer<=0){
boss.shootTimer=0.8+Math.random()*0.5;
boss.shootPattern=(boss.shootPattern+1)%3;

if(boss.shootPattern===0){
// Aimed shot from each turret
for(var t=0;t<boss.turrets.length;t++){
var tx=boss.x+boss.turrets[t].offX;
var ty=boss.y+boss.turrets[t].offY;
var dx=player.x-tx,dy=player.y-ty;
var dist=Math.sqrt(dx*dx+dy*dy)||1;
var bSpd=ENEMY_BULLET_SPEED*0.9;
eBullets.push({x:tx,y:ty,vx:dx/dist*bSpd,vy:dy/dist*bSpd,w:5,h:5});
}
} else if(boss.shootPattern===1){
// Spread pattern
for(var a=-3;a<=3;a++){
var angle=Math.PI/2+a*0.15;
eBullets.push({
x:boss.x,y:boss.y+boss.h/2,
vx:Math.cos(angle)*ENEMY_BULLET_SPEED,
vy:Math.sin(angle)*ENEMY_BULLET_SPEED,
w:4,h:4
});
}
} else {
// Side shots
eBullets.push({x:boss.x-boss.w/2,y:boss.y+boss.h/2,vx:-40,vy:ENEMY_BULLET_SPEED*0.7,w:4,h:4});
eBullets.push({x:boss.x+boss.w/2,y:boss.y+boss.h/2,vx:40,vy:ENEMY_BULLET_SPEED*0.7,w:4,h:4});
}
}
}
if(boss.flashTimer>0) boss.flashTimer-=dt;
}

// Bullet-enemy collision
for(var b=bullets.length-1;b>=0;b--){
if(!bullets[b].player) continue;
var bu=bullets[b];
// Check enemies
var hit=false;
for(var e=0;e<enemies.length;e++){
if(!enemies[e].alive) continue;
var en=enemies[e];
if(bu.x>en.x-en.w/2&&bu.x<en.x+en.w/2&&bu.y>en.y-en.h/2&&bu.y<en.y+en.h/2){
en.hp--;
if(en.hp<=0){
en.alive=false;
score+=en.scoreVal;
addExplosion(en.x,en.y,en.type==='bomber');
spawnPowerUp(en.x,en.y);
}
bullets.splice(b,1);hit=true;break;
}
}
if(hit) continue;
// Check boss
if(bossActive&&boss&&boss.alive){
if(bu.x>boss.x-boss.w/2&&bu.x<boss.x+boss.w/2&&bu.y>boss.y-boss.h/2&&bu.y<boss.y+boss.h/2){
boss.hp--;
boss.flashTimer=0.08;
if(boss.hp<=0){
boss.alive=false;
bossActive=false;
score+=2000;
bossDefeated++;
addExplosion(boss.x,boss.y,true);
addExplosion(boss.x-20,boss.y-10,true);
addExplosion(boss.x+20,boss.y+10,true);
// Drop multiple powerups
powerUps.push({x:boss.x-20,y:boss.y,w:18,h:18,type:'spread',color:'#ff8800',speed:40,pulse:0});
powerUps.push({x:boss.x+20,y:boss.y,w:18,h:18,type:'life',color:'#ff4488',speed:40,pulse:0});
}
bullets.splice(b,1);
}
}
}

// Enemy bullet - player collision
if(player.invince<=0&&!rollActive&&!shieldActive){
for(var i=eBullets.length-1;i>=0;i--){
var eb=eBullets[i];
var pw=player.w*0.6,ph=player.h*0.6; // forgiving hitbox
if(eb.x>player.x-pw/2&&eb.x<player.x+pw/2&&
eb.y>player.y-ph/2&&eb.y<player.y+ph/2){
eBullets.splice(i,1);
hitPlayer();
break;
}
}
}

// Enemy-player collision
if(player.invince<=0&&!rollActive&&!shieldActive){
for(var i=0;i<enemies.length;i++){
if(!enemies[i].alive) continue;
var en=enemies[i];
var pw=player.w*0.5,ph=player.h*0.5;
if(Math.abs(en.x-player.x)<(en.w+pw)/2&&Math.abs(en.y-player.y)<(en.h+ph)/2){
en.alive=false;
addExplosion(en.x,en.y,false);
hitPlayer();
break;
}
}
// Boss collision
if(bossActive&&boss&&boss.alive){
var pw2=player.w*0.5,ph2=player.h*0.5;
if(Math.abs(boss.x-player.x)<(boss.w+pw2)/2&&Math.abs(boss.y-player.y)<(boss.h+ph2)/2){
hitPlayer();
}
}
}

// Power-up collection (generous hitbox)
for(var i=powerUps.length-1;i>=0;i--){
var pu=powerUps[i];
pu.y+=pu.speed*dt;
pu.pulse+=dt*5;
var pickupRange=30; // generous
if(Math.abs(pu.x-player.x)<pickupRange&&Math.abs(pu.y-player.y)<pickupRange){
applyPowerUp(pu.type);
addParticles(pu.x,pu.y,pu.color,8);
powerUps.splice(i,1);
continue;
}
if(pu.y>H+30) powerUps.splice(i,1);
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.life-=dt;
if(p.life<=0) particles.splice(i,1);
}

// Wave progression
if(!bossActive&&aliveCount===0){
waveTimer+=dt;
if(waveTimer>=waveDelay){
wave++;
level=Math.floor((wave-1)/5)+1;
waveTimer=0;
spawnWave();
}
}
if(bossActive&&boss&&!boss.alive){
waveTimer+=dt;
if(waveTimer>=waveDelay){
wave++;
level=Math.floor((wave-1)/5)+1;
bossActive=false;
boss=null;
waveTimer=0;
spawnWave();
}
}
}

function hitPlayer(){
lives--;
addExplosion(player.x,player.y,true);
player.invince=2.5;
rollCharges=3; // refill rolls on death
if(lives<=0){
gameState='gameover';
}
}

function applyPowerUp(type){
if(type==='spread'){spreadShot=true;spreadTimer=10;}
else if(type==='rapid'){rapidFire=true;rapidTimer=8;}
else if(type==='shield'){shieldActive=true;shieldTimer=6;}
else if(type==='life'){lives=Math.min(lives+1,5);}
}

// === DRAWING ===
function drawOcean(){
// Blue ocean gradient
var grad=ctx.createLinearGradient(0,0,0,H);
grad.addColorStop(0,'#0a3060');
grad.addColorStop(0.5,'#0e4080');
grad.addColorStop(1,'#0a3060');
ctx.fillStyle=grad;
ctx.fillRect(0,0,W,H);

// Ocean wave pattern
var waveOff=scrollY*0.4;
ctx.strokeStyle='rgba(100,180,255,0.06)';
ctx.lineWidth=1;
for(var wy=0;wy<H+40;wy+=20){
var yy=(wy+waveOff%20);
ctx.beginPath();
for(var wx=0;wx<W;wx+=4){
ctx.lineTo(wx,yy+Math.sin((wx+scrollY*0.3)*0.03)*6);
}
ctx.stroke();
}

// Small wave dots
for(var i=0;i<waveClouds.length;i++){
var wc=waveClouds[i];
ctx.fillStyle='rgba(140,200,255,'+wc.alpha+')';
ctx.beginPath();
ctx.arc(wc.x,wc.y,wc.r,0,Math.PI*2);
ctx.fill();
}
}

function drawIslands(){
for(var i=0;i<islands.length;i++){
var isl=islands[i];
// Sand ring
ctx.fillStyle=isl.sandColor;
ctx.beginPath();
ctx.ellipse(isl.x,isl.y,isl.w/2+4,isl.h/2+4,0,0,Math.PI*2);
ctx.fill();
// Green center
ctx.fillStyle=isl.color;
ctx.beginPath();
ctx.ellipse(isl.x,isl.y,isl.w/2,isl.h/2,0,0,Math.PI*2);
ctx.fill();
// Small detail
ctx.fillStyle='rgba(0,0,0,0.1)';
ctx.beginPath();
ctx.ellipse(isl.x+isl.w*0.1,isl.y+isl.h*0.1,isl.w/4,isl.h/4,0,0,Math.PI*2);
ctx.fill();
}
}

function drawCloudsBack(){
for(var i=0;i<clouds.length;i++){
var c=clouds[i];
ctx.fillStyle='rgba(220,230,240,'+c.alpha*0.5+')';
ctx.beginPath();
ctx.ellipse(c.x,c.y,c.w/2,c.h/2,0,0,Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.ellipse(c.x-c.w*0.2,c.y-c.h*0.15,c.w*0.35,c.h*0.4,0,0,Math.PI*2);
ctx.fill();
}
}

function drawCloudsFront(){
// Parallax front clouds (over everything)
for(var i=0;i<clouds.length;i++){
var c=clouds[i];
ctx.fillStyle='rgba(240,245,250,'+c.alpha+')';
ctx.beginPath();
ctx.ellipse(c.x+10,c.y+5,c.w/2*0.8,c.h/2*0.8,0,0,Math.PI*2);
ctx.fill();
}
}

function drawPlayer(){
if(player.invince>0&&Math.floor(player.invince*10)%2===0) return;

ctx.save();
ctx.translate(player.x,player.y);

// Barrel roll animation
if(rollActive){
var scaleX=Math.cos(rollAngle);
ctx.scale(scaleX,1);
}

var w=player.w,h=player.h;

// P-38 Lightning twin-boom silhouette with enhanced detail
ctx.shadowColor='#44aa44';ctx.shadowBlur=4;
// Main body (center) with gradient
var bodyGrad=ctx.createLinearGradient(-4,-h/2,8,h/2);
bodyGrad.addColorStop(0,'#4a9a4a');bodyGrad.addColorStop(0.5,'#3a7a3a');bodyGrad.addColorStop(1,'#2a6a2a');
ctx.fillStyle=bodyGrad;
ctx.fillRect(-4,-h/2,8,h);

// Nose with highlight
ctx.fillStyle='#5aaa5a';
ctx.beginPath();ctx.moveTo(-3,-h/2);ctx.lineTo(0,-h/2-7);ctx.lineTo(3,-h/2);ctx.fill();
// Propeller hint
var propAngle=gameTime*30;
ctx.strokeStyle='rgba(200,200,200,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(-3*Math.cos(propAngle),-h/2-7);ctx.lineTo(3*Math.cos(propAngle),-h/2-7);ctx.stroke();

// Wings with gradient
var wingGrad=ctx.createLinearGradient(-w/2,-2,w/2,4);
wingGrad.addColorStop(0,'#2a6a2a');wingGrad.addColorStop(0.5,'#3a8a3a');wingGrad.addColorStop(1,'#2a6a2a');
ctx.fillStyle=wingGrad;
ctx.fillRect(-w/2,-2,w,6);

// Wing tips with nav lights
ctx.fillStyle='#2a6a2a';
ctx.fillRect(-w/2,-3,4,8);ctx.fillRect(w/2-4,-3,4,8);
var blink=Math.sin(gameTime*5)>0;
ctx.fillStyle=blink?'#ff3333':'#661111';
ctx.beginPath();ctx.arc(-w/2+1,0,1.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle=blink?'#33ff33':'#116611';
ctx.beginPath();ctx.arc(w/2-1,0,1.2,0,Math.PI*2);ctx.fill();

// Twin booms with shading
ctx.fillStyle='#3a7a3a';
ctx.fillRect(-w/2+4,-h/2+4,5,h-4);ctx.fillRect(w/2-9,-h/2+4,5,h-4);
ctx.fillStyle='rgba(255,255,255,0.1)';
ctx.fillRect(-w/2+4,-h/2+4,2,h-4);ctx.fillRect(w/2-9,-h/2+4,2,h-4);

// Tail fins
ctx.fillStyle='#4a8a4a';
ctx.fillRect(-w/2+2,h/2-6,8,4);ctx.fillRect(w/2-10,h/2-6,8,4);

// Cockpit with glass reflection
var cockGrad=ctx.createLinearGradient(-2,-4,2,2);
cockGrad.addColorStop(0,'#aaddff');cockGrad.addColorStop(0.5,'#88ccff');cockGrad.addColorStop(1,'#6699cc');
ctx.fillStyle=cockGrad;ctx.fillRect(-2,-4,4,6);
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(-1,-3,1,3);

// Engine glow with animated exhaust
var exFlicker=0.4+0.3*Math.sin(gameTime*15);
ctx.shadowColor='#ffaa44';ctx.shadowBlur=6;
ctx.fillStyle='rgba(255,200,100,'+exFlicker+')';
ctx.fillRect(-w/2+5,h/2-2,3,4+Math.sin(gameTime*12)*2);
ctx.fillRect(w/2-8,h/2-2,3,4+Math.sin(gameTime*12+1)*2);
ctx.shadowBlur=0;

// Star insignia (small white stars)
ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.beginPath();ctx.arc(-w/4,2,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(w/4,2,2,0,Math.PI*2);ctx.fill();

ctx.restore();

// Shield visual
if(shieldActive){
ctx.strokeStyle='rgba(136,68,255,'+(0.4+0.3*Math.sin(gameTime*6))+')';
ctx.lineWidth=2;
ctx.beginPath();
ctx.arc(player.x,player.y,player.w*0.7,0,Math.PI*2);
ctx.stroke();
ctx.lineWidth=1;
}
}

function drawEnemy(e){
ctx.save();
ctx.translate(e.x,e.y);

if(e.type==='fighter'){
// Japanese Zero silhouette - gray body with red
ctx.fillStyle='#888';
ctx.fillRect(-e.w/2+4,-e.h/2,e.w-8,e.h); // body
ctx.fillStyle='#777';
ctx.fillRect(-e.w/2,-3,e.w,6); // wings
// Red circles (hinomaru)
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(-e.w/4,0,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.w/4,0,3,0,Math.PI*2);ctx.fill();
// Tail
ctx.fillStyle='#888';
ctx.fillRect(-3,e.h/2-2,6,4);
// Cockpit
ctx.fillStyle='#335';
ctx.fillRect(-2,-e.h/4,4,5);
} else if(e.type==='bomber'){
// Larger bomber
ctx.fillStyle='#777';
ctx.fillRect(-e.w/2+6,-e.h/2,e.w-12,e.h); // body
ctx.fillStyle='#666';
ctx.fillRect(-e.w/2,-4,e.w,8); // wings
// Engines
ctx.fillStyle='#555';
ctx.fillRect(-e.w/2+4,-6,6,5);
ctx.fillRect(e.w/2-10,-6,6,5);
// Red circles
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(-e.w/3,0,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.w/3,0,4,0,Math.PI*2);ctx.fill();
// Cockpit
ctx.fillStyle='#335';
ctx.fillRect(-3,-e.h/4,6,6);
// HP bar
if(e.hp<e.maxHp){
ctx.fillStyle='#333';
ctx.fillRect(-e.w/2,-e.h/2-6,e.w,3);
ctx.fillStyle='#ff4444';
ctx.fillRect(-e.w/2,-e.h/2-6,e.w*(e.hp/e.maxHp),3);
}
} else if(e.type==='ace'){
// Ace - darker with markings
ctx.fillStyle='#995533';
ctx.fillRect(-e.w/2+3,-e.h/2,e.w-6,e.h);
ctx.fillStyle='#884422';
ctx.fillRect(-e.w/2,-2,e.w,5);
// Lightning bolt marking
ctx.fillStyle='#ffcc00';
ctx.fillRect(-1,-e.h/4,2,e.h/2);
// Red circle
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(0,-e.h/4+2,3,0,Math.PI*2);ctx.fill();
// Cockpit
ctx.fillStyle='#335';
ctx.fillRect(-2,-e.h/4,4,4);
}

ctx.restore();
}

function drawBoss(){
if(!boss||!boss.alive) return;
ctx.save();
ctx.translate(boss.x,boss.y);

var flash=boss.flashTimer>0;

// Large bomber body
ctx.fillStyle=flash?'#fff':'#556';
ctx.fillRect(-boss.w/2+10,-boss.h/2,boss.w-20,boss.h);

// Wings
ctx.fillStyle=flash?'#ddd':'#445';
ctx.fillRect(-boss.w/2,-8,boss.w,16);

// Engines (4)
ctx.fillStyle=flash?'#ccc':'#333';
var ePos=[-boss.w/2+8,-boss.w/4,boss.w/4-6,boss.w/2-14];
for(var i=0;i<ePos.length;i++){
ctx.fillRect(ePos[i],-12,6,8);
}

// Turrets
ctx.fillStyle=flash?'#faa':'#cc3333';
for(var t=0;t<boss.turrets.length;t++){
var tu=boss.turrets[t];
ctx.beginPath();
ctx.arc(tu.offX,tu.offY,5,0,Math.PI*2);
ctx.fill();
}

// Large hinomaru on wings
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(-boss.w/3,0,8,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(boss.w/3,0,8,0,Math.PI*2);ctx.fill();

// Cockpit
ctx.fillStyle='#88aacc';
ctx.fillRect(-5,-boss.h/3,10,8);

// HP bar
ctx.fillStyle='#333';
ctx.fillRect(-boss.w/2,-boss.h/2-10,boss.w,5);
ctx.fillStyle='#ff2222';
ctx.fillRect(-boss.w/2,-boss.h/2-10,boss.w*(boss.hp/boss.maxHp),5);
ctx.strokeStyle='#fff';
ctx.lineWidth=0.5;
ctx.strokeRect(-boss.w/2,-boss.h/2-10,boss.w,5);

ctx.restore();
}

function drawBullets(){
// Player bullets
ctx.fillStyle='#ffee44';
ctx.shadowColor='#ffcc00';
ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
if(!bullets[i].player) continue;
ctx.fillRect(bullets[i].x-2,bullets[i].y-4,4,8);
}
ctx.shadowBlur=0;

// Enemy bullets
ctx.fillStyle='#ff3333';
ctx.shadowColor='#ff0000';
ctx.shadowBlur=4;
for(var i=0;i<eBullets.length;i++){
var eb=eBullets[i];
ctx.beginPath();
ctx.arc(eb.x,eb.y,3,0,Math.PI*2);
ctx.fill();
}
ctx.shadowBlur=0;
}

function drawPowerUps(){
for(var i=0;i<powerUps.length;i++){
var pu=powerUps[i];
var glow=0.5+0.5*Math.sin(pu.pulse);

// Glow
ctx.fillStyle=pu.color;
ctx.globalAlpha=0.3*glow;
ctx.beginPath();
ctx.arc(pu.x,pu.y,14,0,Math.PI*2);
ctx.fill();
ctx.globalAlpha=1;

// Icon background
ctx.fillStyle=pu.color;
ctx.beginPath();
ctx.arc(pu.x,pu.y,9,0,Math.PI*2);
ctx.fill();

// Icon letter
ctx.fillStyle='#fff';
ctx.font='bold 10px "Courier New",monospace';
ctx.textAlign='center';
ctx.textBaseline='middle';
var letter=pu.type==='spread'?'S':pu.type==='rapid'?'R':pu.type==='shield'?'D':'+';
ctx.fillText(letter,pu.x,pu.y);
}
ctx.textBaseline='alphabetic';
}

function drawParticles(){
for(var i=0;i<particles.length;i++){
var p=particles[i];
var alpha=Math.max(0,p.life/p.maxLife);
ctx.save();
ctx.globalAlpha=alpha;
ctx.shadowColor=p.color;ctx.shadowBlur=p.size*2;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*alpha,0,Math.PI*2);ctx.fill();
// Particle trail
ctx.globalAlpha=alpha*0.25;
ctx.beginPath();ctx.arc(p.x-p.vx*0.02,p.y-p.vy*0.02,p.size*alpha*0.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;
}

function drawHUD(){
// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#3a7a3a';
ctx.fillRect(12+i*22,H-28,8,14);
ctx.fillRect(6+i*22,H-22,20,4);
}

// Wave
ctx.fillStyle='#ccc';
ctx.font='12px "Courier New",monospace';
ctx.textAlign='right';
ctx.fillText('WAVE '+wave,W-12,H-16);

// Roll charges
ctx.textAlign='left';
ctx.fillStyle='#aaa';
ctx.fillText('ROLL: ',12,22);
for(var i=0;i<rollCharges;i++){
ctx.fillStyle='#ffcc00';
ctx.fillRect(60+i*14,14,10,10);
}

// Active power-ups
var py=40;
if(spreadShot){
ctx.fillStyle='#ff8800';
ctx.font='10px "Courier New",monospace';
ctx.textAlign='left';
ctx.fillText('SPREAD '+Math.ceil(spreadTimer)+'s',12,py);
py+=14;
}
if(rapidFire){
ctx.fillStyle='#00ccff';
ctx.fillText('RAPID '+Math.ceil(rapidTimer)+'s',12,py);
py+=14;
}
if(shieldActive){
ctx.fillStyle='#8844ff';
ctx.fillText('SHIELD '+Math.ceil(shieldTimer)+'s',12,py);
py+=14;
}

// Wave incoming text
if(!bossActive&&enemies.length===0&&waveTimer>0){
ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
ctx.textAlign='center';
if(wave%5===0){
ctx.fillText('WARNING: BOSS INCOMING!',W/2,H/2);
} else {
ctx.fillText('WAVE '+(wave+1)+' INCOMING',W/2,H/2);
}
}
}

function render(){
drawOcean();
drawIslands();
drawCloudsBack();

// Draw game objects
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive) drawEnemy(enemies[i]);
}
drawBoss();
drawBullets();
drawPowerUps();
drawPlayer();
drawParticles();

// Front clouds (parallax over everything)
drawCloudsFront();

drawHUD();
}

// === TITLE SCREEN ===
function drawTitle(dt){
titlePulse+=dt*3;
drawOcean();
drawIslands();
drawCloudsBack();

ctx.save();
ctx.textAlign='center';

// Title
ctx.shadowColor='#ffcc00';
ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('1942',W/2,H*0.25);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillStyle='#88bbff';
ctx.fillText('PACIFIC THEATER',W/2,H*0.32);

// Sample plane
ctx.save();
ctx.translate(W/2,H*0.45);
ctx.fillStyle='#3a7a3a';
ctx.fillRect(-4,-12,8,24);
ctx.fillRect(-15,-2,30,6);
ctx.fillStyle='#88ccff';
ctx.fillRect(-2,-4,4,6);
ctx.fillStyle='#2a6a2a';
ctx.fillRect(-15,-3,4,8);
ctx.fillRect(11,-3,4,8);
ctx.restore();

// Controls
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to move',W/2,H*0.66);
ctx.fillText('Space to shoot, R to barrel roll',W/2,H*0.72);

// Scoring
ctx.fillStyle='#888';
ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
ctx.fillText('Fighter: 100  Ace: 200  Bomber: 300  Boss: 2000',W/2,H*0.82);

// Sample enemies
var ex=W/2-60;
ctx.fillStyle='#888';ctx.fillRect(ex,H*0.86,16,16);
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(ex+8,H*0.86+8,3,0,Math.PI*2);ctx.fill();

ctx.fillStyle='#995533';ctx.fillRect(ex+50,H*0.86,14,14);
ctx.fillStyle='#ffcc00';ctx.fillRect(ex+56,H*0.86+3,2,8);

ctx.fillStyle='#777';ctx.fillRect(ex+100,H*0.86,20,18);
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(ex+110,H*0.86+9,4,0,Math.PI*2);ctx.fill();

ctx.restore();
drawCloudsFront();
}

// === GAME OVER SCREEN ===
function drawGameOver(){
render();
ctx.fillStyle='rgba(0,0,0,0.5)';
ctx.fillRect(0,0,W,H);

ctx.save();
ctx.textAlign='center';
ctx.shadowColor='#ff4444';
ctx.shadowBlur=15;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff4444';
ctx.fillText('MISSION FAILED',W/2,H*0.35);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('SCORE: '+score,W/2,H*0.45);
ctx.fillStyle='#88bbff';
ctx.fillText('WAVE: '+wave,W/2,H*0.52);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.65);
ctx.restore();
}

// === HUD UPDATE ===
function updateHUD(){
var scoreEl=document.getElementById('hud-score');
var speedEl=document.getElementById('hud-speed');
var timeEl=document.getElementById('hud-time');
if(scoreEl) scoreEl.textContent=score;
if(speedEl) speedEl.textContent='W'+wave;
if(timeEl) timeEl.textContent=lives+' HP';
}

// === GAME LOOP ===
var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5) dt=0.016;
lastTs=ts;

// Always scroll background
scrollY+=SCROLL_SPEED*dt*0.5;
for(var i=0;i<islands.length;i++){
islands[i].y+=SCROLL_SPEED*0.3*dt;
if(islands[i].y>H+60){islands[i].y=-60;islands[i].x=Math.random()*W;}
}
for(var i=0;i<clouds.length;i++){
clouds[i].y+=clouds[i].speed*0.5*dt;
if(clouds[i].y>H+50){clouds[i].y=-50;clouds[i].x=Math.random()*W;}
}

if(gameState==='title'){
drawTitle(dt);
} else if(gameState==='playing'){
update(dt);
render();
updateHUD();
} else if(gameState==='gameover'){
titlePulse+=dt*3;
// Still update particles for visual
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;
particles[i].y+=particles[i].vy*dt;
particles[i].life-=dt;
if(particles[i].life<=0) particles.splice(i,1);
}
drawGameOver();
updateHUD();
}

animId=requestAnimationFrame(gameLoop);
}

// === INPUT ===
function onKey(e,down){
if(gameState!=='playing'&&down&&(e.key==='Enter'||e.key==='Tab')){
resetGame();
e.preventDefault();
return;
}

if(gameState==='playing'){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W') keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S') keyDown=down;
if(e.key===' ') keySpace=down;
if(e.key==='r'||e.key==='R'){
if(down) startRoll();
}
}

if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1){
e.preventDefault();
}
}

var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,set){
var el=document.getElementById(id);if(!el) return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});
}

// === INIT / STOP ===
window.init1942=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){
if(gameState!=='playing') resetGame();
else keySpace=true;
});
canvas.addEventListener('mouseup',function(){
if(gameState==='playing') keySpace=false;
});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stop1942=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';
keyLeft=keyRight=keyUp=keyDown=keySpace=keyRoll=false;
};
})();
