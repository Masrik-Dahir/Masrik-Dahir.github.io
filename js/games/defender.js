// Defender — Full Game
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
var WORLD_W=0; // 3x canvas width, set on resize
var cameraX=0; // left edge of viewport in world coords
var player,bullets=[],enemies=[],mines=[],particles=[],stars=[];
var humanoids=[],smartBombs=3;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false,keyBomb=false;
var lastShot=0,lastBombTime=0;
var PLAYER_SPEED=280,PLAYER_VERT_SPEED=220,BULLET_SPEED=700,BULLET_LIFE=0.6;
var TERRAIN_POINTS=[];
var MINIMAP_H=24;
var planetExploded=false;
var waveTimer=0,waveDelay=3,spawningWave=false;

// Difficulty: easy(1-2), medium(3-5), hard(6+)
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }
var BASE_LANDER_SPEED=50,BASE_LANDER_DESCEND=30,BASE_BOMBER_SPEED=40,BASE_POD_SPEED=35,BASE_SWARMER_SPEED=90,BASE_MUTANT_SPEED=120;
var LANDER_SPEED=50,LANDER_DESCEND=30,BOMBER_SPEED=40,POD_SPEED=35,SWARMER_SPEED=90,MUTANT_SPEED=120;
var LANDERS_PER_WAVE=5,BOMBERS_PER_WAVE=2,PODS_PER_WAVE=1;
var MINE_SPEED=60;
function updateDiffSpeeds(){
var m=diffMult();
LANDER_SPEED=BASE_LANDER_SPEED*m;LANDER_DESCEND=BASE_LANDER_DESCEND*m;
BOMBER_SPEED=BASE_BOMBER_SPEED*m;POD_SPEED=BASE_POD_SPEED*m;
SWARMER_SPEED=BASE_SWARMER_SPEED*m;MUTANT_SPEED=BASE_MUTANT_SPEED*m;
MINE_SPEED=60*m;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
WORLD_W=W*3;
generateTerrain();
generateStars();
}

function generateTerrain(){
TERRAIN_POINTS=[];
var segments=120;
var groundY=H*0.82;
for(var i=0;i<=segments;i++){
var x=i*(WORLD_W/segments);
var y=groundY+Math.sin(i*0.15)*H*0.06+Math.sin(i*0.4)*H*0.03+Math.sin(i*0.08)*H*0.04;
TERRAIN_POINTS.push({x:x,y:y});
}
}

function generateStars(){
stars=[];
for(var i=0;i<200;i++){
stars.push({x:Math.random()*WORLD_W,y:Math.random()*(H*0.75),s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
}
}

function getTerrainY(wx){
// Get terrain height at world x
var norm=((wx%WORLD_W)+WORLD_W)%WORLD_W;
var segW=WORLD_W/((TERRAIN_POINTS.length-1)||1);
var idx=norm/segW;
var i0=Math.floor(idx);
var i1=Math.min(i0+1,TERRAIN_POINTS.length-1);
var t=idx-i0;
if(i0<0)i0=0;if(i0>=TERRAIN_POINTS.length)i0=TERRAIN_POINTS.length-1;
return TERRAIN_POINTS[i0].y*(1-t)+TERRAIN_POINTS[i1].y*t;
}

function wrapX(x){
return((x%WORLD_W)+WORLD_W)%WORLD_W;
}

function worldDist(a,b){
// Shortest distance on wrapping world
var d=Math.abs(a-b);
return Math.min(d,WORLD_W-d);
}

function worldDiff(from,to){
// Signed shortest diff from->to
var d=to-from;
if(d>WORLD_W/2)d-=WORLD_W;
if(d<-WORLD_W/2)d+=WORLD_W;
return d;
}

function toScreen(wx,wy){
var dx=worldDiff(cameraX+W/2,wx);
return{x:W/2+dx,y:wy};
}

function isOnScreen(wx){
var dx=worldDiff(cameraX+W/2,wx);
return Math.abs(dx)<W/2+40;
}

function spawnHumanoids(){
humanoids=[];
for(var i=0;i<8;i++){
var wx=Math.random()*WORLD_W;
var ty=getTerrainY(wx);
humanoids.push({
x:wx,y:ty-6,groundY:ty-6,
alive:true,state:'ground', // ground, abducted, falling, rescued
abductor:null,
fallVy:0,
rescueTimer:0
});
}
}

function spawnWave(){
updateDiffSpeeds();
var numLanders=LANDERS_PER_WAVE+Math.floor(level*(level<=2?0.3:0.5));
var numBombers=BOMBERS_PER_WAVE+Math.floor(level*(level<=2?0.15:0.3));
var numPods=PODS_PER_WAVE+Math.floor(level*(level<=2?0.1:0.2));
// Cap
var maxL=level<=2?8:12,maxB=level<=2?3:6,maxP=level<=2?2:4;
if(numLanders>maxL)numLanders=maxL;
if(numBombers>maxB)numBombers=maxB;
if(numPods>maxP)numPods=maxP;

for(var i=0;i<numLanders;i++){
var wx=wrapX(player.x+W*0.6+Math.random()*WORLD_W*0.7);
enemies.push({
type:'lander',x:wx,y:30+Math.random()*60,
vx:(Math.random()-0.5)*LANDER_SPEED,vy:LANDER_DESCEND*0.5,
w:18,h:18,alive:true,
targetHumanoid:null,hasHumanoid:false,isMutant:false,
descendTimer:0,actionTimer:1+Math.random()*3
});
}
for(var i=0;i<numBombers;i++){
var wx=wrapX(player.x+W*0.6+Math.random()*WORLD_W*0.7);
enemies.push({
type:'bomber',x:wx,y:50+Math.random()*100,
vx:(Math.random()>0.5?1:-1)*BOMBER_SPEED,vy:Math.sin(Math.random()*6)*20,
w:20,h:16,alive:true,
mineTimer:2+Math.random()*4,wobblePhase:Math.random()*6
});
}
for(var i=0;i<numPods;i++){
var wx=wrapX(player.x+W*0.8+Math.random()*WORLD_W*0.5);
enemies.push({
type:'pod',x:wx,y:40+Math.random()*80,
vx:(Math.random()-0.5)*POD_SPEED,vy:(Math.random()-0.5)*POD_SPEED*0.5,
w:22,h:22,alive:true
});
}
}

function spawnSwarmers(x,y,count){
for(var i=0;i<count;i++){
var angle=Math.PI*2*i/count;
enemies.push({
type:'swarmer',x:x,y:y,
vx:Math.cos(angle)*SWARMER_SPEED,vy:Math.sin(angle)*SWARMER_SPEED,
w:10,h:10,alive:true,
chaseTimer:0
});
}
}

function makeMutant(e){
e.isMutant=true;
e.type='mutant';
e.vx=(Math.random()-0.5)*MUTANT_SPEED*2;
e.vy=(Math.random()-0.5)*MUTANT_SPEED;
e.w=16;e.h=16;
e.hasHumanoid=false;
e.targetHumanoid=null;
}

function resetGame(){
player={x:WORLD_W/4,y:H*0.5,w:30,h:14,facingRight:true,invince:2,thrustTimer:0};
cameraX=player.x-W/2;
bullets=[];enemies=[];mines=[];particles=[];
score=0;lives=3;level=1;smartBombs=3;gameTime=0;
planetExploded=false;waveTimer=0;spawningWave=false;
spawnHumanoids();
spawnWave();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=50+Math.random()*200;
particles.push({
x:x,y:y,
vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
life:0.4+Math.random()*0.6,maxLife:0.4+Math.random()*0.6,
color:color,size:1.5+Math.random()*3
});
}
}

function addExplosion(x,y,colors,count){
for(var i=0;i<count;i++){
var c=colors[Math.floor(Math.random()*colors.length)];
addParticles(x,y,c,1);
}
}

function useSmartBomb(){
if(smartBombs<=0)return;
if(gameTime-lastBombTime<0.5)return;
smartBombs--;lastBombTime=gameTime;
// Destroy all visible enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive)continue;
if(isOnScreen(e.x)){
var sc=toScreen(e.x,e.y);
addExplosion(sc.x,sc.y,['#ffffff','#ffcc00','#ff6600'],12);
// Release humanoid if abducted
if(e.hasHumanoid&&e.targetHumanoid){
e.targetHumanoid.state='falling';
e.targetHumanoid.abductor=null;
e.targetHumanoid.fallVy=0;
}
// Score
if(e.type==='lander'||e.type==='mutant')score+=150;
else if(e.type==='bomber')score+=250;
else if(e.type==='pod'){score+=1000;spawnSwarmers(e.x,e.y,4);}
else if(e.type==='swarmer')score+=150;
e.alive=false;
}
}
// White flash particle at center
addParticles(player.x,player.y,'#ffffff',30);
}

function checkPlanetDestruction(){
if(planetExploded)return;
var aliveCount=0;
for(var i=0;i<humanoids.length;i++){
if(humanoids[i].alive)aliveCount++;
}
if(aliveCount===0){
planetExploded=true;
// All enemies become mutants
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive&&enemies[i].type!=='mutant'&&enemies[i].type!=='swarmer'){
makeMutant(enemies[i]);
}
}
// Big explosion particles across terrain
for(var i=0;i<50;i++){
var wx=Math.random()*WORLD_W;
var ty=getTerrainY(wx);
addParticles(wx,ty,'#ff4400',3);
addParticles(wx,ty,'#ffcc00',2);
}
}
}

function update(dt){
if(dt>0.1)dt=0.1;
if(gameState!=='playing')return;
gameTime+=dt;

// Player movement
var moveX=0,moveY=0;
if(keyLeft){moveX=-1;player.facingRight=false;}
if(keyRight){moveX=1;player.facingRight=true;}
if(keyUp)moveY=-1;
if(keyDown)moveY=1;

player.x=wrapX(player.x+moveX*PLAYER_SPEED*dt);
player.y+=moveY*PLAYER_VERT_SPEED*dt;

// Clamp vertical: below minimap, above terrain
var minY=MINIMAP_H+20;
var maxY=getTerrainY(player.x)-player.h;
if(player.y<minY)player.y=minY;
if(player.y>maxY)player.y=maxY;

// Thrust visual timer
if(moveX!==0)player.thrustTimer=0.1;
else player.thrustTimer=Math.max(0,player.thrustTimer-dt);

// Camera follows player horizontally
var targetCam=player.x-W*0.35;
if(!player.facingRight)targetCam=player.x-W*0.65;
cameraX+=(targetCam-cameraX)*5*dt;
cameraX=wrapX(cameraX);

// Invincibility
if(player.invince>0)player.invince-=dt;

// Shooting
if(keySpace&&gameTime-lastShot>0.12){
lastShot=gameTime;
var dir=player.facingRight?1:-1;
bullets.push({
x:player.x+dir*player.w*0.6,y:player.y,
vx:dir*BULLET_SPEED,vy:0,
life:BULLET_LIFE,worldX:player.x+dir*player.w*0.6
});
}

// Smart bomb
if(keyBomb){
keyBomb=false;
useSmartBomb();
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.worldX=wrapX(b.worldX+b.vx*dt);
b.life-=dt;
if(b.life<=0)bullets.splice(i,1);
}

// Update enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}

if(e.type==='lander'){
updateLander(e,dt);
}else if(e.type==='mutant'){
updateMutant(e,dt);
}else if(e.type==='bomber'){
updateBomber(e,dt);
}else if(e.type==='pod'){
updatePod(e,dt);
}else if(e.type==='swarmer'){
updateSwarmer(e,dt);
}
// Wrap x
e.x=wrapX(e.x);
// Clamp y
if(e.y<MINIMAP_H+10)e.y=MINIMAP_H+10;
var ety=getTerrainY(e.x)-10;
if(e.type!=='lander'&&e.y>ety)e.y=ety;
}

// Update mines
for(var i=mines.length-1;i>=0;i--){
var m=mines[i];
m.y+=m.vy*dt;
m.life-=dt;
var mTerrain=getTerrainY(m.x);
if(m.life<=0||m.y>=mTerrain){
mines.splice(i,1);continue;
}
// Check collision with player
if(player.invince<=0){
var sx=worldDist(m.x,player.x);
var sy=Math.abs(m.y-player.y);
if(sx<15&&sy<15){
playerHit();
mines.splice(i,1);
continue;
}
}
}

// Bullet-enemy collisions
for(var b=bullets.length-1;b>=0;b--){
var bu=bullets[b];
for(var e=enemies.length-1;e>=0;e--){
var en=enemies[e];
if(!en.alive)continue;
var dx=worldDist(bu.worldX,en.x);
var dy=Math.abs(bu.y-en.y);
if(dx<en.w*0.6&&dy<en.h*0.6){
// Hit
var sc=toScreen(en.x,en.y);
if(en.type==='lander'||en.type==='mutant'){
score+=150;
addExplosion(en.x,en.y,['#00ff66','#ffcc00'],10);
// Release humanoid
if(en.hasHumanoid&&en.targetHumanoid){
en.targetHumanoid.state='falling';
en.targetHumanoid.abductor=null;
en.targetHumanoid.fallVy=0;
}
}else if(en.type==='bomber'){
score+=250;
addExplosion(en.x,en.y,['#bb44ff','#ff44aa'],10);
}else if(en.type==='pod'){
score+=1000;
addExplosion(en.x,en.y,['#ff8800','#ffdd00'],15);
spawnSwarmers(en.x,en.y,4);
}else if(en.type==='swarmer'){
score+=150;
addExplosion(en.x,en.y,['#ff4444','#ffaa00'],6);
}
en.alive=false;
bullets.splice(b,1);
break;
}
}
}

// Player-enemy collisions
if(player.invince<=0){
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
var dx=worldDist(player.x,e.x);
var dy=Math.abs(player.y-e.y);
if(dx<(player.w+e.w)*0.35&&dy<(player.h+e.h)*0.35){
playerHit();break;
}
}
}

// Update humanoids
for(var i=0;i<humanoids.length;i++){
var h=humanoids[i];
if(!h.alive)continue;

if(h.state==='abducted'&&h.abductor){
if(!h.abductor.alive){
h.state='falling';h.abductor=null;h.fallVy=0;
}else{
h.x=h.abductor.x;
h.y=h.abductor.y+h.abductor.h*0.5+6;
// Check if lander reached top with humanoid
if(h.abductor.y<MINIMAP_H+30){
// Lander becomes mutant
makeMutant(h.abductor);
h.alive=false;
checkPlanetDestruction();
}
}
}else if(h.state==='falling'){
h.fallVy+=300*dt;
h.y+=h.fallVy*dt;
// Check if player catches
var dx=worldDist(h.x,player.x);
var dy=Math.abs(h.y-player.y);
if(dx<30&&dy<25){
// Caught! carry to ground
h.state='rescued';
h.rescueTimer=0;
score+=500;
addParticles(h.x,h.y,'#00ff88',8);
}
// Hit ground
var gy=h.groundY;
if(!planetExploded){
var terrY=getTerrainY(h.x)-6;
if(h.y>=terrY){
h.y=terrY;h.groundY=terrY;
h.state='ground';h.fallVy=0;
}
}else{
// No ground (planet exploded), humanoid falls to death
if(h.y>H+50){h.alive=false;checkPlanetDestruction();}
}
}else if(h.state==='rescued'){
// Float with player, slowly lower to ground
h.x=player.x;
h.y=player.y+20;
h.rescueTimer+=dt;
var terrY=getTerrainY(player.x)-6;
if(!planetExploded&&player.y>terrY-40){
// Close to ground, deposit
h.state='ground';
h.y=terrY;h.groundY=terrY;
h.x=player.x;
score+=500; // Bonus for safe return
addParticles(h.x,h.y,'#ffcc00',10);
}
}
}

// Update particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.vx*=0.97;p.vy*=0.97;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Wave management
var aliveEnemies=0;
for(var i=0;i<enemies.length;i++){if(enemies[i].alive)aliveEnemies++;}
if(aliveEnemies===0&&!spawningWave){
spawningWave=true;waveTimer=0;
}
if(spawningWave){
waveTimer+=dt;
if(waveTimer>=waveDelay){
level++;
spawningWave=false;
spawnWave();
}
}
}

function updateLander(e,dt){
e.actionTimer-=dt;
if(!e.hasHumanoid&&!e.targetHumanoid&&e.actionTimer<=0){
// Find a humanoid to abduct
var best=null,bestD=Infinity;
for(var i=0;i<humanoids.length;i++){
var h=humanoids[i];
if(!h.alive||h.state!=='ground')continue;
var d=worldDist(e.x,h.x);
if(d<bestD){bestD=d;best=h;}
}
if(best){
e.targetHumanoid=best;
best.abductor=e;
}
e.actionTimer=2+Math.random()*3;
}
// Move toward target humanoid
if(e.targetHumanoid&&!e.hasHumanoid){
var h=e.targetHumanoid;
if(!h.alive||h.state!=='ground'){
e.targetHumanoid=null;
e.vx=(Math.random()-0.5)*LANDER_SPEED;
e.vy=-LANDER_DESCEND*0.3;
return;
}
var dx=worldDiff(e.x,h.x);
e.vx=Math.sign(dx)*LANDER_SPEED;
var terrY=getTerrainY(e.x)-e.h;
if(Math.abs(dx)<15&&Math.abs(e.y-terrY)<20){
// Grab humanoid
e.hasHumanoid=true;
h.state='abducted';
h.abductor=e;
e.vy=-LANDER_DESCEND; // Ascend
e.vx=(Math.random()-0.5)*LANDER_SPEED*0.5;
}else{
// Descend toward ground
if(e.y<terrY-5)e.vy=LANDER_DESCEND;
else e.vy=-LANDER_DESCEND*0.2;
}
}else if(e.hasHumanoid){
// Ascend to top
e.vy=-LANDER_DESCEND;
e.vx*=0.99;
}else{
// Wander
e.vy=Math.sin(gameTime*2+e.x*0.01)*LANDER_DESCEND*0.5;
}
e.x=wrapX(e.x+e.vx*dt);
e.y+=e.vy*dt;
}

function updateMutant(e,dt){
// Chase player aggressively
var dx=worldDiff(e.x,player.x);
var dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy)||1;
e.vx+=(dx/dist)*MUTANT_SPEED*2*dt;
e.vy+=(dy/dist)*MUTANT_SPEED*2*dt;
// Clamp speed
var spd=Math.sqrt(e.vx*e.vx+e.vy*e.vy);
if(spd>MUTANT_SPEED){e.vx=e.vx/spd*MUTANT_SPEED;e.vy=e.vy/spd*MUTANT_SPEED;}
e.x=wrapX(e.x+e.vx*dt);
e.y+=e.vy*dt;
}

function updateBomber(e,dt){
e.wobblePhase+=dt*2;
e.vy=Math.sin(e.wobblePhase)*30;
e.x=wrapX(e.x+e.vx*dt);
e.y+=e.vy*dt;
// Drop mines
e.mineTimer-=dt;
if(e.mineTimer<=0){
e.mineTimer=3+Math.random()*4;
mines.push({x:e.x,y:e.y,vy:MINE_SPEED,life:5});
}
}

function updatePod(e,dt){
e.x=wrapX(e.x+e.vx*dt);
e.y+=e.vy*dt;
// Bounce off screen edges vertically
if(e.y<MINIMAP_H+20){e.y=MINIMAP_H+20;e.vy=Math.abs(e.vy);}
var ety=getTerrainY(e.x)-20;
if(e.y>ety){e.y=ety;e.vy=-Math.abs(e.vy);}
}

function updateSwarmer(e,dt){
e.chaseTimer+=dt;
// After a delay, chase player
if(e.chaseTimer>1){
var dx=worldDiff(e.x,player.x);
var dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy)||1;
e.vx+=(dx/dist)*SWARMER_SPEED*1.5*dt;
e.vy+=(dy/dist)*SWARMER_SPEED*1.5*dt;
var spd=Math.sqrt(e.vx*e.vx+e.vy*e.vy);
if(spd>SWARMER_SPEED){e.vx=e.vx/spd*SWARMER_SPEED;e.vy=e.vy/spd*SWARMER_SPEED;}
}
e.x=wrapX(e.x+e.vx*dt);
e.y+=e.vy*dt;
}

function playerHit(){
lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff','#ff4444'],20);
// Drop any rescued humanoid
for(var i=0;i<humanoids.length;i++){
if(humanoids[i].state==='rescued'){
humanoids[i].state='falling';
humanoids[i].fallVy=0;
}
}
if(lives<=0){
gameState='gameover';
}else{
player.invince=2.5;
player.y=H*0.4;
}
}

// ── Rendering ──

function drawStars(){
for(var i=0;i<stars.length;i++){
var s=stars[i];
var sx=toScreen(s.x,s.y);
if(sx.x<-5||sx.x>W+5)continue;
var twinkle=0.5+0.5*Math.sin(gameTime*2+s.x*0.1);
ctx.globalAlpha=s.b*twinkle;
ctx.fillStyle='#ffffff';
ctx.fillRect(sx.x,s.y,s.s,s.s);
}
ctx.globalAlpha=1;
}

function drawTerrain(){
if(planetExploded){
// Draw fiery debris
var debGrd=ctx.createLinearGradient(0,H*0.85,0,H);
debGrd.addColorStop(0,'#330500');debGrd.addColorStop(0.5,'#220000');debGrd.addColorStop(1,'#110000');
ctx.fillStyle=debGrd;ctx.fillRect(0,H*0.85,W,H*0.15);
for(var i=0;i<30;i++){
var wx=wrapX(cameraX+Math.random()*W);
var sy=H*0.85+Math.random()*H*0.15;
var db=0.3+Math.random()*0.3;
ctx.fillStyle='rgba('+(80+Math.random()*40)+','+Math.floor(20+Math.random()*20)+','+Math.floor(Math.random()*15)+','+db+')';
ctx.fillRect(toScreen(wx,0).x,sy,3+Math.random()*8,2+Math.random()*4);
}
// Ember particles
ctx.fillStyle='rgba(255,100,20,0.2)';
for(var i=0;i<5;i++){
var ex=Math.random()*W,ey=H*0.8+Math.random()*H*0.1;
ctx.beginPath();ctx.arc(ex,ey+Math.sin(gameTime*2+i)*5,2+Math.random()*3,0,Math.PI*2);ctx.fill();
}
return;
}
// Draw filled terrain with rich gradient
ctx.beginPath();
var first=true;
for(var i=0;i<TERRAIN_POINTS.length;i++){
var tp=TERRAIN_POINTS[i];
var sx=toScreen(tp.x,tp.y);
if(first){ctx.moveTo(sx.x,tp.y);first=false;}
else ctx.lineTo(sx.x,tp.y);
}
ctx.lineTo(toScreen(TERRAIN_POINTS[TERRAIN_POINTS.length-1].x,0).x,H);
ctx.lineTo(toScreen(TERRAIN_POINTS[0].x,0).x,H);
ctx.closePath();
// Multi-stop gradient for rich terrain
var grd=ctx.createLinearGradient(0,H*0.72,0,H);
grd.addColorStop(0,'#1a6a2a');grd.addColorStop(0.15,'#1a4a1a');
grd.addColorStop(0.4,'#0d330d');grd.addColorStop(0.7,'#082508');grd.addColorStop(1,'#041504');
ctx.fillStyle=grd;ctx.fill();
// Glow outline
ctx.save();
ctx.shadowColor='#44ff66';ctx.shadowBlur=4;
ctx.strokeStyle='#2a8a3a';ctx.lineWidth=1.8;ctx.stroke();
ctx.restore();
// Surface texture dots
ctx.fillStyle='rgba(50,120,50,0.15)';
for(var i=0;i<TERRAIN_POINTS.length;i+=2){
var tp=TERRAIN_POINTS[i];
var sx2=toScreen(tp.x,tp.y);
ctx.fillRect(sx2.x,tp.y+2,4,2);
}
}

function drawPlayer(){
if(player.invince>0&&Math.floor(player.invince*10)%2===0)return;
var sx=W*(player.facingRight?0.35:0.65);
var sy=player.y;
var dir=player.facingRight?1:-1;

ctx.save();
ctx.translate(sx,sy);
ctx.scale(dir,1);

// Engine trail
if(player.thrustTimer>0||keyLeft||keyRight){
ctx.shadowColor='#4488ff';ctx.shadowBlur=8;
ctx.fillStyle='#2244cc';
ctx.beginPath();
ctx.moveTo(-player.w*0.5,0);
ctx.lineTo(-player.w*0.5-8-Math.random()*12,-3);
ctx.lineTo(-player.w*0.5-6-Math.random()*10,0);
ctx.lineTo(-player.w*0.5-8-Math.random()*12,3);
ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
}

// Ship body - sleek craft
ctx.shadowColor='#66ff88';ctx.shadowBlur=4;
// Main hull
ctx.fillStyle='#cceecc';
ctx.beginPath();
ctx.moveTo(player.w*0.6,0);  // Nose
ctx.lineTo(player.w*0.1,-player.h*0.5);
ctx.lineTo(-player.w*0.4,-player.h*0.3);
ctx.lineTo(-player.w*0.5,0);
ctx.lineTo(-player.w*0.4,player.h*0.3);
ctx.lineTo(player.w*0.1,player.h*0.5);
ctx.closePath();
ctx.fill();

// Cockpit
ctx.fillStyle='#44ff88';
ctx.beginPath();
ctx.moveTo(player.w*0.4,0);
ctx.lineTo(player.w*0.1,-player.h*0.2);
ctx.lineTo(-player.w*0.05,0);
ctx.lineTo(player.w*0.1,player.h*0.2);
ctx.closePath();
ctx.fill();

// Wing accents
ctx.fillStyle='#88ccaa';
ctx.fillRect(-player.w*0.3,-player.h*0.5,player.w*0.15,player.h*0.15);
ctx.fillRect(-player.w*0.3,player.h*0.35,player.w*0.15,player.h*0.15);

ctx.shadowBlur=0;
ctx.restore();
}

function drawEnemies(){
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
if(!isOnScreen(e.x))continue;
var s=toScreen(e.x,e.y);

ctx.save();
ctx.translate(s.x,s.y);

if(e.type==='lander'){
// Green diamond with antenna
ctx.shadowColor='#00ff44';ctx.shadowBlur=4;
ctx.fillStyle=e.isMutant?'#ff4444':'#22cc44';
ctx.beginPath();
ctx.moveTo(0,-e.h*0.5);
ctx.lineTo(e.w*0.5,0);
ctx.lineTo(0,e.h*0.5);
ctx.lineTo(-e.w*0.5,0);
ctx.closePath();ctx.fill();
// Eye
ctx.fillStyle='#ffffff';
ctx.fillRect(-3,-3,6,4);
ctx.fillStyle='#000';
ctx.fillRect(-1,-2,3,2);
// Antenna
ctx.strokeStyle=e.isMutant?'#ff6666':'#44ff66';
ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(-3,-e.h*0.5);ctx.lineTo(-6,-e.h*0.5-5);ctx.stroke();
ctx.beginPath();ctx.moveTo(3,-e.h*0.5);ctx.lineTo(6,-e.h*0.5-5);ctx.stroke();
// If carrying humanoid, show tractor beam
if(e.hasHumanoid){
ctx.strokeStyle='rgba(0,255,100,0.3)';ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(0,e.h*0.5);ctx.lineTo(0,e.h*0.5+12);ctx.stroke();
}
ctx.shadowBlur=0;
}else if(e.type==='mutant'){
// Red aggressive shape
ctx.shadowColor='#ff2200';ctx.shadowBlur=6;
ctx.fillStyle='#ff3322';
ctx.beginPath();
ctx.moveTo(0,-e.h*0.6);
ctx.lineTo(e.w*0.5,-e.h*0.1);
ctx.lineTo(e.w*0.3,e.h*0.5);
ctx.lineTo(-e.w*0.3,e.h*0.5);
ctx.lineTo(-e.w*0.5,-e.h*0.1);
ctx.closePath();ctx.fill();
// Angry eyes
ctx.fillStyle='#ffff00';
ctx.fillRect(-4,-3,3,3);
ctx.fillRect(1,-3,3,3);
ctx.shadowBlur=0;
}else if(e.type==='bomber'){
// Purple hexagon
ctx.shadowColor='#aa44ff';ctx.shadowBlur=4;
ctx.fillStyle='#8833cc';
ctx.beginPath();
for(var j=0;j<6;j++){
var a=Math.PI*2*j/6-Math.PI/2;
var px=Math.cos(a)*e.w*0.5,py=Math.sin(a)*e.h*0.5;
if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();
// Inner
ctx.fillStyle='#aa55ee';
ctx.beginPath();
for(var j=0;j<6;j++){
var a=Math.PI*2*j/6-Math.PI/2;
var px=Math.cos(a)*e.w*0.25,py=Math.sin(a)*e.h*0.25;
if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
}else if(e.type==='pod'){
// Large orange circle
ctx.shadowColor='#ff8800';ctx.shadowBlur=5;
ctx.fillStyle='#cc6600';
ctx.beginPath();ctx.arc(0,0,e.w*0.45,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#ffaa44';ctx.lineWidth=2;ctx.stroke();
// Inner pattern
ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.arc(0,0,e.w*0.2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
}else if(e.type==='swarmer'){
// Small red triangles
ctx.shadowColor='#ff4400';ctx.shadowBlur=3;
ctx.fillStyle='#ff5533';
ctx.beginPath();
ctx.moveTo(0,-e.h*0.5);
ctx.lineTo(e.w*0.45,e.h*0.4);
ctx.lineTo(-e.w*0.45,e.h*0.4);
ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
}

ctx.restore();
}
}

function drawMines(){
for(var i=0;i<mines.length;i++){
var m=mines[i];
if(!isOnScreen(m.x))continue;
var s=toScreen(m.x,m.y);
ctx.save();
ctx.translate(s.x,s.y);
// Blinking mine
var blink=Math.sin(gameTime*10+m.x)>0;
ctx.fillStyle=blink?'#ff4466':'#cc2244';
ctx.shadowColor='#ff4466';ctx.shadowBlur=blink?6:2;
ctx.beginPath();
// Star shape
for(var j=0;j<8;j++){
var a=Math.PI*2*j/8;
var r2=(j%2===0)?6:3;
var px=Math.cos(a)*r2,py=Math.sin(a)*r2;
if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
ctx.restore();
}
}

function drawBullets(){
ctx.shadowColor='#aaddff';ctx.shadowBlur=8;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
if(!isOnScreen(b.worldX))continue;
var s=toScreen(b.worldX,b.y);
// Bright laser beam
var len=18;
var dir=b.vx>0?1:-1;
ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+dir*len,s.y);ctx.stroke();
ctx.strokeStyle='rgba(100,180,255,0.6)';ctx.lineWidth=5;
ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+dir*len,s.y);ctx.stroke();
}
ctx.shadowBlur=0;
}

function drawHumanoids(){
for(var i=0;i<humanoids.length;i++){
var h=humanoids[i];
if(!h.alive)continue;
if(h.state==='abducted')continue; // Drawn near lander
if(!isOnScreen(h.x))continue;
var s=toScreen(h.x,h.y);
ctx.save();
ctx.translate(s.x,s.y);
// Detailed humanoid figure
var walkCycle=Math.sin(gameTime*5+i)*2;
ctx.shadowColor='#44aaff';ctx.shadowBlur=3;
// Head with face
ctx.fillStyle='#66ccff';
ctx.beginPath();ctx.arc(0,-8,3.5,0,Math.PI*2);ctx.fill();
// Face
ctx.fillStyle='#fff';ctx.fillRect(-2,-9,1.5,1.5);ctx.fillRect(0.5,-9,1.5,1.5);
// Body (torso)
ctx.fillStyle='#3388cc';
ctx.fillRect(-2,-5,4,7);
// Arms with animation
ctx.strokeStyle='#66ccff';ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-2,-3);ctx.lineTo(-5+walkCycle,-1);ctx.stroke();
ctx.beginPath();ctx.moveTo(2,-3);ctx.lineTo(5-walkCycle,-1);ctx.stroke();
// Legs with walking
ctx.beginPath();ctx.moveTo(-1,2);ctx.lineTo(-3+walkCycle,7);ctx.stroke();
ctx.beginPath();ctx.moveTo(1,2);ctx.lineTo(3-walkCycle,7);ctx.stroke();
ctx.shadowBlur=0;
if(h.state==='falling'){
var wave=Math.sin(gameTime*12)*4;
ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-5+wave,-5);ctx.lineTo(5-wave,-5);ctx.stroke();
// Scared expression
ctx.fillStyle='#ff6644';
ctx.beginPath();ctx.arc(0,-6,1.5,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}
}

function drawMinimap(){
// Background strip
ctx.fillStyle='rgba(0,0,0,0.7)';
ctx.fillRect(0,0,W,MINIMAP_H);
ctx.strokeStyle='#336633';ctx.lineWidth=1;
ctx.strokeRect(0,0,W,MINIMAP_H);

var scale=W/WORLD_W;

// Terrain line on minimap
if(!planetExploded){
ctx.strokeStyle='#1a5a1a';ctx.lineWidth=1;
ctx.beginPath();
for(var i=0;i<TERRAIN_POINTS.length;i+=3){
var mx=TERRAIN_POINTS[i].x*scale;
var my=(TERRAIN_POINTS[i].y/H)*MINIMAP_H;
if(i===0)ctx.moveTo(mx,my);else ctx.lineTo(mx,my);
}
ctx.stroke();
}

// Viewport indicator
var vpLeft=wrapX(cameraX)*scale;
var vpW=W*scale;
ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1;
ctx.strokeRect(vpLeft,1,vpW,MINIMAP_H-2);

// Player dot
var px=player.x*scale;
var py=(player.y/H)*MINIMAP_H;
ctx.fillStyle='#44ff88';
ctx.fillRect(px-2,py-1,4,3);

// Enemy dots
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
var ex=e.x*scale;
var ey=(e.y/H)*MINIMAP_H;
if(e.type==='lander')ctx.fillStyle='#22cc44';
else if(e.type==='mutant')ctx.fillStyle='#ff3322';
else if(e.type==='bomber')ctx.fillStyle='#8833cc';
else if(e.type==='pod')ctx.fillStyle='#ff8800';
else if(e.type==='swarmer')ctx.fillStyle='#ff5533';
else ctx.fillStyle='#ff0000';
ctx.fillRect(ex-1,ey-1,2,2);
}

// Humanoid dots
for(var i=0;i<humanoids.length;i++){
var h=humanoids[i];
if(!h.alive)continue;
var hx=h.x*scale;
var hy=(h.y/H)*MINIMAP_H;
ctx.fillStyle='#44aaff';
ctx.fillRect(hx-1,hy-1,2,2);
}
}

function drawParticles(){
for(var i=0;i<particles.length;i++){
var p=particles[i];
if(!isOnScreen(p.x))continue;
var s=toScreen(p.x,p.y);
var alpha=Math.max(0,p.life/p.maxLife);
var sz=p.size*alpha;
ctx.save();
ctx.globalAlpha=alpha;
ctx.shadowColor=p.color;ctx.shadowBlur=sz*3;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(s.x,s.y,sz,0,Math.PI*2);ctx.fill();
// Fading trail
ctx.globalAlpha=alpha*0.3;
ctx.beginPath();ctx.arc(s.x-p.vx*0.01,s.y-p.vy*0.01,sz*0.6,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;
}

function drawHUD_ingame(){
// Lives as ship icons at bottom-left
ctx.save();
for(var i=0;i<lives;i++){
var lx=15+i*25,ly=H-15;
ctx.fillStyle='#cceecc';
ctx.beginPath();
ctx.moveTo(lx+8,ly);
ctx.lineTo(lx-4,ly-5);
ctx.lineTo(lx-6,ly);
ctx.lineTo(lx-4,ly+5);
ctx.closePath();ctx.fill();
}
// Smart bombs indicator
ctx.fillStyle='#ffcc00';ctx.font='12px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('BOMBS: '+smartBombs,15,H-28);
// Level
ctx.fillStyle='#aaa';ctx.textAlign='right';
ctx.fillText('WAVE '+level,W-15,H-15);
ctx.restore();
}

function render(){
// Background
ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);

// Stars
drawStars();

// Terrain
drawTerrain();

// Humanoids
drawHumanoids();

// Enemies
drawEnemies();

// Mines
drawMines();

// Player
drawPlayer();

// Bullets
drawBullets();

// Particles
drawParticles();

// Minimap (on top)
drawMinimap();

// In-game HUD
drawHUD_ingame();
}

function drawTitle(dt){
ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
// Animate stars in title
for(var i=0;i<stars.length;i++){
var s=stars[i];
var sx=(s.x-gameTime*20)%W;
if(sx<0)sx+=W;
var twinkle=0.5+0.5*Math.sin(gameTime*2+s.x);
ctx.globalAlpha=s.b*twinkle;
ctx.fillStyle='#ffffff';
ctx.fillRect(sx,s.y,s.s,s.s);
}
ctx.globalAlpha=1;
titlePulse+=dt*3;

ctx.save();ctx.textAlign='center';

// Title glow
var glowPulse=15+Math.sin(titlePulse)*10;
ctx.shadowColor='#00ff66';ctx.shadowBlur=glowPulse;

// DEFENDER title
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';
ctx.fillStyle='#22ff66';
ctx.fillText('DEFENDER',W/2,H*0.22);
ctx.shadowColor='#44ffaa';ctx.shadowBlur=glowPulse*0.5;
ctx.fillStyle='#44ff88';
ctx.fillText('DEFENDER',W/2,H*0.22);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillStyle='#88ccaa';
ctx.fillText('PROTECT THE HUMANOIDS',W/2,H*0.30);

// Start prompt
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.42);

// Controls
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to move, Space to shoot, B for Smart Bomb',W/2,H*0.50);

// Enemy guide
var guideY=H*0.62;
var sp=W*0.15;
var bx=W/2-sp*2;
// Lander
ctx.fillStyle='#22cc44';
ctx.beginPath();ctx.moveTo(bx,guideY-9);ctx.lineTo(bx+9,guideY);ctx.lineTo(bx,guideY+9);ctx.lineTo(bx-9,guideY);ctx.closePath();ctx.fill();
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.012)+'px "Courier New",monospace';
ctx.fillText('Lander 150',bx,guideY+22);

// Bomber
bx+=sp;
ctx.fillStyle='#8833cc';
ctx.beginPath();
for(var j=0;j<6;j++){var ang=Math.PI*2*j/6-Math.PI/2;var px2=Math.cos(ang)*10,py2=Math.sin(ang)*8;if(j===0)ctx.moveTo(bx+px2,guideY+py2);else ctx.lineTo(bx+px2,guideY+py2);}
ctx.closePath();ctx.fill();
ctx.fillStyle='#aaa';
ctx.fillText('Bomber 250',bx,guideY+22);

// Pod
bx+=sp;
ctx.fillStyle='#cc6600';
ctx.beginPath();ctx.arc(bx,guideY,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#ffaa44';ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle='#aaa';
ctx.fillText('Pod 1000',bx,guideY+22);

// Swarmer
bx+=sp;
ctx.fillStyle='#ff5533';
ctx.beginPath();ctx.moveTo(bx,guideY-7);ctx.lineTo(bx+6,guideY+5);ctx.lineTo(bx-6,guideY+5);ctx.closePath();ctx.fill();
ctx.fillStyle='#aaa';
ctx.fillText('Swarmer 150',bx,guideY+22);

// Info
ctx.fillStyle='#ffcc00';ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
ctx.fillText('Rescue falling humanoids for 500 bonus!',W/2,H*0.82);
ctx.fillStyle='#ff6644';
ctx.fillText('If all 8 humanoids are lost, the planet explodes!',W/2,H*0.88);

ctx.restore();
}

function drawGameOver(){
// Still render the game behind
render();
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.40);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Wave reached: '+level,W/2,H*0.50);

// Humanoid survival count
var survived=0;
for(var i=0;i<humanoids.length;i++){if(humanoids[i].alive)survived++;}
ctx.fillStyle='#44aaff';
ctx.fillText('Humanoids saved: '+survived+'/8',W/2,H*0.58);

var a2=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a2+')';
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='WAVE '+level;
var survived=0;
for(var i=0;i<humanoids.length;i++){if(humanoids[i].alive)survived++;}
document.getElementById('hud-time').textContent=lives+' HP | '+survived+' HMN | '+smartBombs+' BMB';
}

var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

if(gameState==='title'){
gameTime+=dt;
drawTitle(dt);
}else if(gameState==='playing'){
update(dt);render();updateHUD();
}else if(gameState==='gameover'){
titlePulse+=dt*3;
drawGameOver();
}

animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(gameState!=='playing'&&down&&(e.key==='Enter'||e.key==='Tab')){resetGame();}
if(gameState!=='playing'){
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
return;
}
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;}
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){keyUp=down;}
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keyDown=down;}
if(e.key===' '){keySpace=down;}
if((e.key==='b'||e.key==='B')&&down){keyBomb=true;}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1){e.preventDefault();}
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,set){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});
}

window.initDefender=function(){
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
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;gameTime=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopDefender=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';
keyLeft=keyRight=keyUp=keyDown=keySpace=keyBomb=false;
};
})();
