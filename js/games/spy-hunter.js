// Spy Hunter — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],civilians=[],oilSlicks=[],particles=[],trees=[];
var weaponsVan=null,ammo=20,maxAmmo=20;
var scrollSpeed=120,baseScrollSpeed=120,maxScrollSpeed=320;
var diffLevel=1;
function diffMult(){ return diffLevel<=2?0.7:(diffLevel<=5?1.0:1.0+(diffLevel-5)*0.12); }
var scrollOffset=0,distanceTraveled=0;
var keyUp=false,keyDown=false,keyLeft=false,keyRight=false,keyFire=false;
var lastShotTime=0,shotCooldown=0.18;
var LANE_COUNT=3,roadLeft=0,roadRight=0,roadW=0,laneW=0;
var bridgeActive=false,bridgeTimer=0,bridgeDuration=5;
var iceActive=false,iceTimer=0,iceDuration=4;
var forkActive=false,forkTimer=0,forkSide=0,forkDuration=4;
var spawnTimer=0,civilianTimer=0,weaponsTimer=0,terrainTimer=0;
var speedIncreaseInterval=30,lastSpeedIncrease=0;
var iceSlide=0;

// --- ROAD GEOMETRY ---
function computeRoad(){
var baseRoadW=W*0.48;
if(bridgeActive)baseRoadW=W*0.30;
roadW=baseRoadW;
roadLeft=(W-roadW)/2;
roadRight=roadLeft+roadW;
laneW=roadW/LANE_COUNT;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
computeRoad();
generateTrees();
}

// --- TREES ---
function generateTrees(){
trees=[];
for(var i=0;i<40;i++){
trees.push({
x:Math.random()*((W-roadW)/2-30)+5,
y:Math.random()*H*2,
size:8+Math.random()*14,
side:0
});
trees.push({
x:roadRight+10+Math.random()*((W-roadW)/2-30),
y:Math.random()*H*2,
size:8+Math.random()*14,
side:1
});
}
}

// --- PLAYER ---
function resetPlayer(){
player={
x:W/2,
y:H*0.78,
w:W*0.055,
h:W*0.09,
speed:0,
targetLane:1,
invincible:0
};
}

function resetGame(){
computeRoad();
resetPlayer();
bullets=[];enemies=[];civilians=[];oilSlicks=[];particles=[];
weaponsVan=null;
score=0;lives=3;gameTime=0;distanceTraveled=0;
scrollSpeed=baseScrollSpeed;scrollOffset=0;
ammo=20;
bridgeActive=false;iceActive=false;forkActive=false;
spawnTimer=0;civilianTimer=0;weaponsTimer=8;terrainTimer=12;
lastSpeedIncrease=0;iceSlide=0;
generateTrees();
gameState='playing';
}

// --- PARTICLES ---
function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
particles.push({
x:x,y:y,
vx:(Math.random()-0.5)*250,
vy:(Math.random()-0.5)*250,
life:0.3+Math.random()*0.4,
color:color,
size:2+Math.random()*4
});
}
}

// --- SPAWNING ---
function spawnEnemy(){
var types=['blue','red','green'];
var type=types[Math.floor(Math.random()*types.length)];
var lane=Math.floor(Math.random()*LANE_COUNT);
var ex=roadLeft+lane*laneW+laneW/2;
var ew=W*0.045;
var eh=W*0.075;
var espeed=0;
if(type==='blue')espeed=scrollSpeed*0.3;
if(type==='red')espeed=scrollSpeed*0.7;
if(type==='green')espeed=scrollSpeed*0.15;
enemies.push({
x:ex-ew/2,y:-eh-20,
w:ew,h:eh,
type:type,
speed:espeed,
lane:lane,
oilTimer:type==='green'?2+Math.random()*3:0,
alive:true
});
}

function spawnCivilian(){
var lane=Math.floor(Math.random()*LANE_COUNT);
var cx=roadLeft+lane*laneW+laneW/2;
var cw=W*0.04;
var ch=W*0.065;
civilians.push({
x:cx-cw/2,y:-ch-10,
w:cw,h:ch,
speed:scrollSpeed*0.15,
lane:lane,
alive:true
});
}

function spawnWeaponsVan(){
var lane=Math.floor(Math.random()*LANE_COUNT);
var vx=roadLeft+lane*laneW+laneW/2;
var vw=W*0.05;
var vh=W*0.08;
weaponsVan={
x:vx-vw/2,y:-vh-10,
w:vw,h:vh,
speed:scrollSpeed*0.25,
lane:lane
};
}

// --- COLLISION ---
function rectsOverlap(a,b,shrink){
var s=shrink||0;
return a.x+s<b.x+b.w-s&&a.x+a.w-s>b.x+s&&a.y+s<b.y+b.h-s&&a.y+a.h-s>b.y+s;
}

// --- UPDATE ---
function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
distanceTraveled+=scrollSpeed*dt;

// Speed increase
if(gameTime-lastSpeedIncrease>=speedIncreaseInterval){
lastSpeedIncrease=gameTime;
scrollSpeed=Math.min(maxScrollSpeed,scrollSpeed+18);diffLevel=Math.floor(distanceTraveled/2000)+1;
}

scrollOffset+=scrollSpeed*dt;
if(scrollOffset>60)scrollOffset-=60;

computeRoad();

// --- Player movement ---
var pw=W*0.055,ph=W*0.09;
player.w=pw;player.h=ph;
var moveSpeed=W*0.45;

if(keyLeft){
if(iceActive){iceSlide-=moveSpeed*0.6*dt;}
else{player.x-=moveSpeed*dt;iceSlide=0;}
}
if(keyRight){
if(iceActive){iceSlide+=moveSpeed*0.6*dt;}
else{player.x+=moveSpeed*dt;iceSlide=0;}
}
if(iceActive){
player.x+=iceSlide;
iceSlide*=0.97;
}else{iceSlide=0;}

if(keyUp)player.y-=moveSpeed*0.5*dt;
if(keyDown)player.y+=moveSpeed*0.5*dt;

// Clamp player to road with generous margin
var margin=player.w*0.15;
if(player.x<roadLeft-margin)player.x=roadLeft-margin;
if(player.x+player.w>roadRight+margin)player.x=roadRight+margin-player.w;
if(player.y<H*0.1)player.y=H*0.1;
if(player.y+player.h>H-10)player.y=H-10;

// --- Shooting ---
if(keyFire&&ammo>0&&gameTime-lastShotTime>=shotCooldown){
lastShotTime=gameTime;
ammo--;
var bw=3,bh=12;
bullets.push({
x:player.x+player.w/2-bw/2,
y:player.y-bh,
w:bw,h:bh,
speed:600
});
}

// --- Bullets ---
for(var i=bullets.length-1;i>=0;i--){
bullets[i].y-=bullets[i].speed*dt;
if(bullets[i].y+bullets[i].h<0){bullets.splice(i,1);continue;}

// Hit enemies
var removed=false;
for(var j=enemies.length-1;j>=0;j--){
if(rectsOverlap(bullets[i],enemies[j],2)){
score+=100;
addParticles(enemies[j].x+enemies[j].w/2,enemies[j].y+enemies[j].h/2,
enemies[j].type==='blue'?'#4488ff':enemies[j].type==='red'?'#ff4444':'#44cc44',12);
enemies.splice(j,1);
bullets.splice(i,1);
removed=true;
break;
}
}
if(removed)continue;

// Hit civilians (penalty!)
for(var j=civilians.length-1;j>=0;j--){
if(rectsOverlap(bullets[i],civilians[j],2)){
score-=200;
if(score<0)score=0;
addParticles(civilians[j].x+civilians[j].w/2,civilians[j].y+civilians[j].h/2,'#ffffff',10);
civilians.splice(j,1);
bullets.splice(i,1);
removed=true;
break;
}
}
}

// --- Enemies ---
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
// Move down screen (relative to scroll)
e.y+=(scrollSpeed-e.speed)*dt;

// Green van drops oil
if(e.type==='green'){
e.oilTimer-=dt;
if(e.oilTimer<=0){
e.oilTimer=3+Math.random()*3;
oilSlicks.push({
x:e.x+e.w*0.2,y:e.y+e.h+5,
w:e.w*0.6,h:e.w*0.4,
life:8
});
}
}

// Red cars move up faster (try to pass then come back)
if(e.type==='red'){
e.y-=scrollSpeed*0.4*dt;
}

// Blue cars ram toward player lane
if(e.type==='blue'&&e.y>H*0.2){
var diff=player.x+player.w/2-(e.x+e.w/2);
e.x+=Math.sign(diff)*W*0.12*dt;
}

// Off screen
if(e.y>H+50){enemies.splice(i,1);continue;}
if(e.y<-200){enemies.splice(i,1);continue;}

// Collision with player
if(player.invincible<=0&&rectsOverlap(player,e,player.w*0.12)){
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff8800',18);
addParticles(e.x+e.w/2,e.y+e.h/2,
e.type==='blue'?'#4488ff':e.type==='red'?'#ff4444':'#44cc44',12);
enemies.splice(i,1);
killPlayer();
}
}

// --- Civilians ---
for(var i=civilians.length-1;i>=0;i--){
var c=civilians[i];
c.y+=(scrollSpeed-c.speed)*dt;
if(c.y>H+50){civilians.splice(i,1);continue;}

// Collision with player (no penalty for bumping, just slow down)
if(player.invincible<=0&&rectsOverlap(player,c,player.w*0.15)){
// Just nudge the civilian aside
c.x+=(c.x<player.x?-40:40)*dt;
}
}

// --- Oil slicks ---
for(var i=oilSlicks.length-1;i>=0;i--){
var o=oilSlicks[i];
o.y+=scrollSpeed*dt;
o.life-=dt;
if(o.life<=0||o.y>H+50){oilSlicks.splice(i,1);continue;}

// Player hits oil
if(player.invincible<=0&&rectsOverlap(player,o,2)){
// Spin out — lose control briefly
addParticles(player.x+player.w/2,player.y+player.h/2,'#664400',8);
oilSlicks.splice(i,1);
killPlayer();
}
}

// --- Weapons van ---
if(weaponsVan){
weaponsVan.y+=(scrollSpeed-weaponsVan.speed)*dt;
if(weaponsVan.y>H+50){weaponsVan=null;}
else if(rectsOverlap(player,weaponsVan,2)){
ammo=maxAmmo;
addParticles(weaponsVan.x+weaponsVan.w/2,weaponsVan.y+weaponsVan.h/2,'#ffff00',15);
weaponsVan=null;
}
}

// --- Terrain timers ---
if(bridgeActive){
bridgeTimer-=dt;
if(bridgeTimer<=0)bridgeActive=false;
}
if(iceActive){
iceTimer-=dt;
if(iceTimer<=0){iceActive=false;iceSlide=0;}
}

terrainTimer-=dt;
if(terrainTimer<=0){
terrainTimer=10+Math.random()*8;
var r=Math.random();
if(r<0.4){bridgeActive=true;bridgeTimer=bridgeDuration;}
else if(r<0.7){iceActive=true;iceTimer=iceDuration;}
}

// --- Spawn timers ---
var spawnRate=Math.max(0.7,2.2-gameTime*0.01);
spawnTimer-=dt;
if(spawnTimer<=0){
spawnTimer=spawnRate;
spawnEnemy();
}

civilianTimer-=dt;
if(civilianTimer<=0){
civilianTimer=3+Math.random()*3;
spawnCivilian();
}

if(!weaponsVan){
weaponsTimer-=dt;
if(weaponsTimer<=0){
weaponsTimer=12+Math.random()*8;
spawnWeaponsVan();
}
}

// --- Invincibility ---
if(player.invincible>0)player.invincible-=dt;

// --- Particles ---
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// --- Trees scroll ---
for(var i=0;i<trees.length;i++){
trees[i].y+=scrollSpeed*dt;
if(trees[i].y>H+30){
trees[i].y=-20-Math.random()*40;
if(trees[i].side===0)trees[i].x=Math.random()*((W-roadW)/2-30)+5;
else trees[i].x=roadRight+10+Math.random()*((W-roadW)/2-30);
trees[i].size=8+Math.random()*14;
}
}

// Distance bonus
score+=Math.round(scrollSpeed*dt*0.1);
}

function killPlayer(){
lives--;
player.invincible=2;
if(lives<=0){
gameState='gameover';
}
}

// --- DRAWING ---
function drawRoad(){
// Grass
var grassGrad=ctx.createLinearGradient(0,0,W,0);
grassGrad.addColorStop(0,'#1a5c1a');
grassGrad.addColorStop(0.3,'#227722');
grassGrad.addColorStop(0.7,'#227722');
grassGrad.addColorStop(1,'#1a5c1a');
ctx.fillStyle=grassGrad;
ctx.fillRect(0,0,W,H);

// Grass texture stripes
ctx.fillStyle='rgba(0,80,0,0.3)';
for(var gy=(-scrollOffset%20);gy<H;gy+=20){
ctx.fillRect(0,gy,roadLeft-2,2);
ctx.fillRect(roadRight+2,gy,W-roadRight-2,2);
}

// Trees
for(var i=0;i<trees.length;i++){
var t=trees[i];
// trunk
ctx.fillStyle='#5c3a1e';
ctx.fillRect(t.x+t.size*0.35,t.y+t.size*0.5,t.size*0.3,t.size*0.5);
// canopy
ctx.fillStyle='#1e8c1e';
ctx.beginPath();
ctx.arc(t.x+t.size*0.5,t.y+t.size*0.35,t.size*0.45,0,Math.PI*2);
ctx.fill();
// highlight
ctx.fillStyle='rgba(100,200,80,0.3)';
ctx.beginPath();
ctx.arc(t.x+t.size*0.4,t.y+t.size*0.25,t.size*0.2,0,Math.PI*2);
ctx.fill();
}

// Road shoulder
ctx.fillStyle='#555';
ctx.fillRect(roadLeft-4,0,roadW+8,H);

// Road surface
if(iceActive){
var iceGrad=ctx.createLinearGradient(roadLeft,0,roadRight,0);
iceGrad.addColorStop(0,'#88aacc');
iceGrad.addColorStop(0.5,'#aaccee');
iceGrad.addColorStop(1,'#88aacc');
ctx.fillStyle=iceGrad;
}else if(bridgeActive){
ctx.fillStyle='#8B7355';
}else{
ctx.fillStyle='#444';
}
ctx.fillRect(roadLeft,0,roadW,H);

// Bridge railings
if(bridgeActive){
ctx.fillStyle='#654321';
ctx.fillRect(roadLeft-6,0,6,H);
ctx.fillRect(roadRight,0,6,H);
// Bridge planks
ctx.strokeStyle='rgba(100,70,40,0.3)';
ctx.lineWidth=1;
for(var by=(-scrollOffset%15);by<H;by+=15){
ctx.beginPath();
ctx.moveTo(roadLeft,by);
ctx.lineTo(roadRight,by);
ctx.stroke();
}
// Water on sides
ctx.fillStyle='#1a4a8a';
ctx.fillRect(roadLeft-40,0,34,H);
ctx.fillRect(roadRight+6,0,34,H);
// Water ripples
ctx.strokeStyle='rgba(100,180,255,0.3)';
ctx.lineWidth=1;
for(var wy=(-scrollOffset*0.5%30);wy<H;wy+=30){
ctx.beginPath();
ctx.moveTo(roadLeft-38,wy);
ctx.quadraticCurveTo(roadLeft-23,wy-5,roadLeft-8,wy);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(roadRight+8,wy);
ctx.quadraticCurveTo(roadRight+23,wy-5,roadRight+38,wy);
ctx.stroke();
}
}

// Center dashed lines
ctx.strokeStyle='#fff';
ctx.lineWidth=2;
ctx.setLineDash([20,15]);
ctx.lineDashOffset=-scrollOffset;
for(var li=1;li<LANE_COUNT;li++){
var lx=roadLeft+li*laneW;
ctx.beginPath();
ctx.moveTo(lx,0);
ctx.lineTo(lx,H);
ctx.stroke();
}
ctx.setLineDash([]);

// Road edge lines
ctx.strokeStyle='#fff';
ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(roadLeft,0);ctx.lineTo(roadLeft,H);ctx.stroke();
ctx.beginPath();ctx.moveTo(roadRight,0);ctx.lineTo(roadRight,H);ctx.stroke();

// Ice indicator
if(iceActive){
ctx.fillStyle='rgba(150,200,255,0.15)';
ctx.fillRect(roadLeft,0,roadW,H);
var fs=Math.max(10,Math.round(W*0.025));
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.textAlign='center';
ctx.fillStyle='rgba(200,230,255,0.6)';
ctx.fillText('ICY ROAD!',W/2,H*0.15);
}
}

function drawPlayerCar(){
if(player.invincible>0&&Math.floor(player.invincible*10)%2===0)return;
var x=player.x,y=player.y,w=player.w,h=player.h;
ctx.save();

// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.beginPath();ctx.roundRect(x+3,y+3,w,h,4);ctx.fill();

// Main body — sleek black
ctx.fillStyle='#1a1a1a';
ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();

// Hood (darker front section)
ctx.fillStyle='#111';
ctx.beginPath();ctx.roundRect(x+w*0.15,y,w*0.7,h*0.35,3);ctx.fill();

// Windshield
ctx.fillStyle='rgba(100,160,220,0.7)';
ctx.beginPath();ctx.roundRect(x+w*0.18,y+h*0.28,w*0.64,h*0.18,2);ctx.fill();

// Cabin roof
ctx.fillStyle='#222';
ctx.beginPath();ctx.roundRect(x+w*0.2,y+h*0.4,w*0.6,h*0.22,2);ctx.fill();

// Rear window
ctx.fillStyle='rgba(100,160,220,0.5)';
ctx.beginPath();ctx.roundRect(x+w*0.22,y+h*0.58,w*0.56,h*0.1,2);ctx.fill();

// Side panels (metallic accent)
ctx.fillStyle='#333';
ctx.fillRect(x+1,y+h*0.25,w*0.12,h*0.55);
ctx.fillRect(x+w-w*0.12-1,y+h*0.25,w*0.12,h*0.55);

// Wheels
ctx.fillStyle='#111';
ctx.fillRect(x-2,y+h*0.12,5,h*0.18);
ctx.fillRect(x+w-3,y+h*0.12,5,h*0.18);
ctx.fillRect(x-2,y+h*0.68,5,h*0.18);
ctx.fillRect(x+w-3,y+h*0.68,5,h*0.18);

// Wheel rims
ctx.fillStyle='#666';
ctx.fillRect(x-1,y+h*0.15,3,h*0.12);
ctx.fillRect(x+w-2,y+h*0.15,3,h*0.12);
ctx.fillRect(x-1,y+h*0.71,3,h*0.12);
ctx.fillRect(x+w-2,y+h*0.71,3,h*0.12);

// Headlights
ctx.fillStyle='#ffff88';
ctx.fillRect(x+w*0.15,y+1,w*0.15,3);
ctx.fillRect(x+w*0.7,y+1,w*0.15,3);

// Taillights
ctx.fillStyle='#ff2222';
ctx.fillRect(x+w*0.15,y+h-3,w*0.12,3);
ctx.fillRect(x+w*0.73,y+h-3,w*0.12,3);

// Hood ornament / center stripe
ctx.fillStyle='#666';
ctx.fillRect(x+w*0.47,y+2,w*0.06,h*0.25);

// Gun barrel at front
ctx.fillStyle='#888';
ctx.fillRect(x+w*0.45,y-6,w*0.1,8);

ctx.restore();
}

function drawEnemyCar(e){
var x=e.x,y=e.y,w=e.w,h=e.h;
ctx.save();

// Shadow
ctx.fillStyle='rgba(0,0,0,0.25)';
ctx.beginPath();ctx.roundRect(x+2,y+2,w,h,3);ctx.fill();

if(e.type==='blue'){
// Blue sedan — ram car
ctx.fillStyle='#2255bb';
ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();
// Roof
ctx.fillStyle='#1a3a88';
ctx.beginPath();ctx.roundRect(x+w*0.15,y+h*0.3,w*0.7,h*0.35,2);ctx.fill();
// Windshield (rear — car faces down)
ctx.fillStyle='rgba(150,200,255,0.6)';
ctx.beginPath();ctx.roundRect(x+w*0.2,y+h*0.22,w*0.6,h*0.12,2);ctx.fill();
// Bumper
ctx.fillStyle='#aaa';
ctx.fillRect(x+w*0.1,y+h-3,w*0.8,3);
// Headlights (bottom = front since facing down)
ctx.fillStyle='#ffff88';
ctx.fillRect(x+w*0.12,y+h-2,w*0.15,2);
ctx.fillRect(x+w*0.73,y+h-2,w*0.15,2);
}
else if(e.type==='red'){
// Red sports car — fast
ctx.fillStyle='#cc2222';
ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();
// Aerodynamic body shape
ctx.fillStyle='#991111';
ctx.beginPath();ctx.roundRect(x+w*0.1,y+h*0.15,w*0.8,h*0.6,3);ctx.fill();
// Windshield
ctx.fillStyle='rgba(150,180,220,0.6)';
ctx.beginPath();ctx.roundRect(x+w*0.2,y+h*0.2,w*0.6,h*0.15,2);ctx.fill();
// Racing stripe
ctx.fillStyle='#ff6644';
ctx.fillRect(x+w*0.42,y+2,w*0.16,h-4);
// Spoiler at back
ctx.fillStyle='#880808';
ctx.fillRect(x+w*0.1,y+1,w*0.8,3);
}
else if(e.type==='green'){
// Green van — drops oil
ctx.fillStyle='#228833';
ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();
// Van body (boxy)
ctx.fillStyle='#1a6628';
ctx.fillRect(x+w*0.08,y+h*0.1,w*0.84,h*0.8);
// Windshield
ctx.fillStyle='rgba(150,200,200,0.5)';
ctx.fillRect(x+w*0.15,y+h*0.15,w*0.7,h*0.15);
// Rear doors
ctx.strokeStyle='#115522';
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(x+w*0.5,y+h*0.55);
ctx.lineTo(x+w*0.5,y+h*0.88);
ctx.stroke();
// Taillights
ctx.fillStyle='#ff4444';
ctx.fillRect(x+w*0.08,y+h-3,w*0.18,3);
ctx.fillRect(x+w*0.74,y+h-3,w*0.18,3);
}

// Wheels
ctx.fillStyle='#111';
ctx.fillRect(x-1,y+h*0.1,3,h*0.15);
ctx.fillRect(x+w-2,y+h*0.1,3,h*0.15);
ctx.fillRect(x-1,y+h*0.72,3,h*0.15);
ctx.fillRect(x+w-2,y+h*0.72,3,h*0.15);

ctx.restore();
}

function drawCivilian(c){
var x=c.x,y=c.y,w=c.w,h=c.h;
ctx.save();

// Shadow
ctx.fillStyle='rgba(0,0,0,0.2)';
ctx.beginPath();ctx.roundRect(x+2,y+2,w,h,3);ctx.fill();

// White civilian car
ctx.fillStyle='#e8e8e8';
ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();

// Roof
ctx.fillStyle='#d0d0d0';
ctx.beginPath();ctx.roundRect(x+w*0.15,y+h*0.28,w*0.7,h*0.35,2);ctx.fill();

// Windshield
ctx.fillStyle='rgba(150,200,255,0.5)';
ctx.beginPath();ctx.roundRect(x+w*0.2,y+h*0.22,w*0.6,h*0.12,2);ctx.fill();

// Lights
ctx.fillStyle='#ffff88';
ctx.fillRect(x+w*0.15,y+h-2,w*0.12,2);
ctx.fillRect(x+w*0.73,y+h-2,w*0.12,2);

// Taillights
ctx.fillStyle='#ff4444';
ctx.fillRect(x+w*0.15,y+1,w*0.12,2);
ctx.fillRect(x+w*0.73,y+1,w*0.12,2);

// Wheels
ctx.fillStyle='#333';
ctx.fillRect(x-1,y+h*0.12,3,h*0.14);
ctx.fillRect(x+w-2,y+h*0.12,3,h*0.14);
ctx.fillRect(x-1,y+h*0.72,3,h*0.14);
ctx.fillRect(x+w-2,y+h*0.72,3,h*0.14);

ctx.restore();
}

function drawOilSlick(o){
ctx.save();
ctx.globalAlpha=Math.min(1,o.life*0.5);
ctx.fillStyle='#2a1a0a';
ctx.beginPath();
ctx.ellipse(o.x+o.w/2,o.y+o.h/2,o.w/2,o.h/2,0,0,Math.PI*2);
ctx.fill();
// Iridescent sheen
ctx.fillStyle='rgba(80,40,120,0.3)';
ctx.beginPath();
ctx.ellipse(o.x+o.w*0.4,o.y+o.h*0.4,o.w*0.3,o.h*0.3,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='rgba(40,80,60,0.25)';
ctx.beginPath();
ctx.ellipse(o.x+o.w*0.6,o.y+o.h*0.6,o.w*0.25,o.h*0.25,0,0,Math.PI*2);
ctx.fill();
ctx.restore();
}

function drawWeaponsVan(v){
var x=v.x,y=v.y,w=v.w,h=v.h;
ctx.save();

// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.beginPath();ctx.roundRect(x+2,y+2,w,h,3);ctx.fill();

// Yellow weapons van
ctx.fillStyle='#ddaa00';
ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();

// Body
ctx.fillStyle='#bb8800';
ctx.fillRect(x+w*0.08,y+h*0.1,w*0.84,h*0.8);

// "AMMO" text
var fs=Math.max(6,Math.round(w*0.3));
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.textAlign='center';
ctx.fillStyle='#000';
ctx.fillText('AMMO',x+w/2,y+h*0.55);

// Blinking beacon
ctx.fillStyle=Math.floor(gameTime*4)%2===0?'#ff0':'#fa0';
ctx.beginPath();
ctx.arc(x+w/2,y+h*0.15,w*0.1,0,Math.PI*2);
ctx.fill();

// Wheels
ctx.fillStyle='#111';
ctx.fillRect(x-1,y+h*0.12,3,h*0.15);
ctx.fillRect(x+w-2,y+h*0.12,3,h*0.15);
ctx.fillRect(x-1,y+h*0.72,3,h*0.15);
ctx.fillRect(x+w-2,y+h*0.72,3,h*0.15);

ctx.restore();
}

function drawBullets(){
ctx.fillStyle='#ffff44';
ctx.shadowColor='#ffff00';
ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.fillRect(b.x,b.y,b.w,b.h);
// Tracer glow
ctx.fillStyle='rgba(255,255,100,0.3)';
ctx.fillRect(b.x-1,b.y,b.w+2,b.h+4);
ctx.fillStyle='#ffff44';
}
ctx.shadowBlur=0;
}

function drawHUD(){
var fs=Math.max(10,Math.round(W*0.022));
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.textAlign='left';

// Ammo bar
var ammoBarW=W*0.2,ammoBarH=fs*0.6;
var abx=10,aby=10;
ctx.fillStyle='rgba(0,0,0,0.5)';
ctx.fillRect(abx,aby,ammoBarW+4,ammoBarH+4);
ctx.fillStyle=ammo>5?'#44ff44':ammo>0?'#ffaa00':'#ff3333';
ctx.fillRect(abx+2,aby+2,ammoBarW*(ammo/maxAmmo),ammoBarH);
ctx.fillStyle='#fff';
ctx.fillText('AMMO: '+ammo,abx+ammoBarW+10,aby+ammoBarH);

// Lives
ctx.fillStyle='#fff';
ctx.textAlign='right';
ctx.fillText('LIVES: '+lives,W-10,aby+ammoBarH);

// Speed indicator
var speedPct=((scrollSpeed-baseScrollSpeed)/(maxScrollSpeed-baseScrollSpeed))*100;
ctx.textAlign='center';
ctx.fillStyle='#aaa';
ctx.fillText(Math.round(scrollSpeed)+' MPH',W/2,H-10);

// Terrain warning
if(bridgeActive){
ctx.fillStyle='#ffcc44';
ctx.fillText('BRIDGE',W/2,aby+ammoBarH);
}
if(iceActive){
ctx.fillStyle='#88ccff';
ctx.fillText('ICE',W/2,aby+ammoBarH);
}
}

function render(){
ctx.clearRect(0,0,W,H);
drawRoad();

// Oil slicks
for(var i=0;i<oilSlicks.length;i++)drawOilSlick(oilSlicks[i]);

// Weapons van
if(weaponsVan)drawWeaponsVan(weaponsVan);

// Civilians
for(var i=0;i<civilians.length;i++)drawCivilian(civilians[i]);

// Enemies
for(var i=0;i<enemies.length;i++)drawEnemyCar(enemies[i]);

// Bullets
drawBullets();

// Player
drawPlayerCar();

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];
ctx.globalAlpha=Math.max(0,p.life*2);
ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

drawHUD();
}

// --- TITLE SCREEN ---
function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);

// Animated road in background
var roadBgW=W*0.3;
var rbLeft=(W-roadBgW)/2;
ctx.fillStyle='#333';
ctx.fillRect(rbLeft,0,roadBgW,H);
ctx.strokeStyle='#fff';
ctx.lineWidth=2;
ctx.setLineDash([15,12]);
ctx.lineDashOffset=-titlePulse*40;
ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
ctx.setLineDash([]);
ctx.strokeStyle='#fff';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(rbLeft,0);ctx.lineTo(rbLeft,H);ctx.stroke();
ctx.beginPath();ctx.moveTo(rbLeft+roadBgW,0);ctx.lineTo(rbLeft+roadBgW,H);ctx.stroke();

// Grass sides
ctx.fillStyle='#1a5c1a';
ctx.fillRect(0,0,rbLeft,H);
ctx.fillRect(rbLeft+roadBgW,0,W-rbLeft-roadBgW,H);

// Title
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4400';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
var titleFs=Math.round(W*0.07);
ctx.font='bold '+titleFs+'px "Courier New",monospace';
ctx.fillStyle='#ff4400';
ctx.fillText('SPY HUNTER',W/2,H*0.14);
ctx.shadowBlur=0;

// Subtitle
var subFs=Math.max(10,Math.round(W*0.025));
ctx.font='bold '+subFs+'px "Courier New",monospace';
ctx.fillStyle='#ffcc44';
ctx.fillText('TOP SECRET MISSION',W/2,H*0.21);

// Instructions
var fs=Math.max(9,Math.round(W*0.018));
ctx.font=fs+'px "Courier New",monospace';

ctx.fillStyle='#88aaff';
ctx.fillText('DESTROY ENEMY VEHICLES',W/2,H*0.32);

ctx.fillStyle='#4488ff';
ctx.fillText('Blue Sedans — ram you',W/2,H*0.38);
ctx.fillStyle='#ff4444';
ctx.fillText('Red Sports Cars — fast overtake',W/2,H*0.43);
ctx.fillStyle='#44cc44';
ctx.fillText('Green Vans — drop oil slicks',W/2,H*0.48);

ctx.fillStyle='#ff8888';
ctx.fillText('DO NOT shoot white civilian cars! (-200)',W/2,H*0.55);

ctx.fillStyle='#ffcc44';
ctx.fillText('Drive into AMMO van for weapon refill',W/2,H*0.62);

ctx.fillStyle='#aaa';
ctx.fillText('Arrow/WASD: Steer & Speed',W/2,H*0.70);
ctx.fillText('SPACE: Fire',W/2,H*0.75);

// Start prompt
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font='bold '+Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);

// Animated player car on road
var carY=H*0.9+Math.sin(titlePulse*2)*5;
var carW=W*0.04,carH=W*0.065;
ctx.fillStyle='#1a1a1a';
ctx.beginPath();ctx.roundRect(W/2-carW/2,carY,carW,carH,3);ctx.fill();
ctx.fillStyle='rgba(100,160,220,0.6)';
ctx.beginPath();ctx.roundRect(W/2-carW*0.3,carY+carH*0.3,carW*0.6,carH*0.15,1);ctx.fill();
ctx.fillStyle='#ffff88';
ctx.fillRect(W/2-carW*0.3,carY+1,carW*0.12,2);
ctx.fillRect(W/2+carW*0.18,carY+1,carW*0.12,2);

ctx.restore();
}

// --- GAME OVER SCREEN ---
function drawGameOver(){
render();
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.40);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
var dist=Math.round(distanceTraveled/100);
ctx.fillText('Distance: '+dist+' miles',W/2,H*0.50);
ctx.fillText('Top Speed: '+Math.round(scrollSpeed)+' MPH',W/2,H*0.56);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font='bold '+Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=Math.round(scrollSpeed)+' MPH';
document.getElementById('hud-time').textContent=lives+' HP';
}

// --- GAME LOOP ---
var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

if(gameState==='title'){
drawTitle(dt);
}else if(gameState==='playing'){
update(dt);
render();
updateHUD();
}else if(gameState==='gameover'){
titlePulse+=dt*3;
drawGameOver();
}
animId=requestAnimationFrame(gameLoop);
}

// --- INPUT ---
function onKeyDown(e){
if(gameState==='playing'){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=true;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=true;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=true;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=true;
if(e.key===' ')keyFire=true;
}
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){
resetGame();
}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}

function onKeyUp(e){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=false;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=false;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=false;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=false;
if(e.key===' ')keyFire=false;
}

function bindMobile(id,fn){
var el=document.getElementById(id);
if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
el.addEventListener('mousedown',function(){fn();});
}

// --- INIT / STOP ---
window.initSpyHunter=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',onKeyDown);
document.addEventListener('keyup',onKeyUp);

bindMobile('btn-left',function(){
if(gameState==='playing'){
player.x-=laneW*0.5;
var margin=player.w*0.15;
if(player.x<roadLeft-margin)player.x=roadLeft-margin;
}
});
bindMobile('btn-right',function(){
if(gameState==='playing'){
player.x+=laneW*0.5;
var margin=player.w*0.15;
if(player.x+player.w>roadRight+margin)player.x=roadRight+margin-player.w;
}
});
bindMobile('btn-up',function(){
if(gameState==='playing'){
keyFire=true;
setTimeout(function(){keyFire=false;},150);
}
});

canvas.addEventListener('click',function(){
if(gameState!=='playing')resetGame();
});

gameState='title';titlePulse=0;
keyLeft=false;keyRight=false;keyUp=false;keyDown=false;keyFire=false;
lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopSpyHunter=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',onKeyDown);
document.removeEventListener('keyup',onKeyUp);
window.removeEventListener('resize',resize);
gameState='title';
keyLeft=false;keyRight=false;keyUp=false;keyDown=false;keyFire=false;
};
})();
