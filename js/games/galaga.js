// Galaga — Full Game
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
var player,bullets=[],enemies=[],eBullets=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keySpace=false,lastShot=0;
var PLAYER_SPEED=400,BULLET_SPEED=900,ENEMY_BULLET_SPEED=150;
var capturedShip=null,dualFighter=false,captureInProgress=false;
var bonusStage=false,bonusKills=0,bonusTotalEnemies=0;
var formationX=0,formationY=0,formationDir=1,formationTimer=0;
var diveQueue=[],diveTimer=0,diveInterval=2.0;
var waveTransition=false,waveTransitionTimer=0;
var starLayers=[],screenShake=0;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12);}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
initStars();
}

function initStars(){
starLayers=[[],[],[]];
for(var i=0;i<60;i++)starLayers[0].push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*0.5,b:0.3+Math.random()*0.4});
for(var i=0;i<40;i++)starLayers[1].push({x:Math.random()*W,y:Math.random()*H,s:1+Math.random()*0.5,b:0.5+Math.random()*0.3});
for(var i=0;i<20;i++)starLayers[2].push({x:Math.random()*W,y:Math.random()*H,s:1.5+Math.random()*1,b:0.7+Math.random()*0.3});
}

function spawnFormation(){
enemies=[];
var cols=8,rows=5;
var ew=28,eh=22,gapX=8,gapY=6;
var totalW=cols*(ew+gapX);
var startX=(W-totalW)/2+gapX/2;
var startY=50;
bonusTotalEnemies=cols*rows;
bonusKills=0;

for(var r=0;r<rows;r++){
for(var c=0;c<cols;c++){
var type='regular';
if(r===0)type='boss';
else if(r<=1)type='commander';
var hp=1;
if(type==='commander')hp=2;
if(type==='boss')hp=2;
enemies.push({
x:startX+c*(ew+gapX),y:startY+r*(eh+gapY),
homeX:startX+c*(ew+gapX),homeY:startY+r*(eh+gapY),
w:ew,h:eh,hp:hp,maxHp:hp,alive:true,type:type,
row:r,col:c,frame:0,frameTimer:0,
diving:false,divePhase:0,diveTime:0,
diveStartX:0,diveStartY:0,diveAngle:0,
captureAttempt:false,hasCaptured:false,
bonusPath:null,bonusT:0
});
}}
formationX=0;formationY=0;formationDir=1;formationTimer=0;
diveQueue=[];diveTimer=0;
diveInterval=Math.max(0.8,2.0-level*0.1);
}

function resetGame(){
player={x:W/2,y:H-50,w:36,h:20};
bullets=[];eBullets=[];particles=[];diveQueue=[];
score=0;lives=3;level=1;gameTime=0;lastShot=-1;
dualFighter=false;capturedShip=null;captureInProgress=false;
bonusStage=false;waveTransition=false;waveTransitionTimer=0;
spawnFormation();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=50+Math.random()*200;
particles.push({
x:x,y:y,
vx:Math.cos(angle)*speed,
vy:Math.sin(angle)*speed,
life:0.4+Math.random()*0.6,
maxLife:0.4+Math.random()*0.6,
color:color,
size:1.5+Math.random()*3
});
}}

function addExplosion(x,y,colors,count){
for(var i=0;i<count;i++){
var c=colors[Math.floor(Math.random()*colors.length)];
addParticles(x,y,c,1);
}}

// Dive path: sine wave swoop toward player then return or exit bottom
function startDive(enemy){
if(!enemy.alive||enemy.diving)return;
enemy.diving=true;
enemy.divePhase=0;
enemy.diveTime=0;
enemy.diveStartX=enemy.x;
enemy.diveStartY=enemy.y;
enemy.diveAngle=Math.random()*Math.PI*0.4-Math.PI*0.2;
enemy.captureAttempt=(enemy.type==='boss'&&!enemy.hasCaptured&&!capturedShip&&!dualFighter&&Math.random()<0.3);
}

function updateDiving(e,dt){
var diveSpeed=200+level*10;
e.diveTime+=dt;
var t=e.diveTime;

if(e.divePhase===0){
// Swooping down toward player with sine wave
var targetX=player.x;
var targetY=player.y-30;
if(e.captureAttempt){targetY=player.y-60;}
var dx=targetX-e.diveStartX;
var dy=targetY-e.diveStartY;
var dist=Math.sqrt(dx*dx+dy*dy);
var progress=Math.min(1,t*diveSpeed/dist);
e.x=e.diveStartX+dx*progress+Math.sin(t*5)*40;
e.y=e.diveStartY+dy*progress;

if(progress>=1){
e.divePhase=1;e.diveTime=0;
e.diveStartX=e.x;e.diveStartY=e.y;
}

// Fire during dive
if(!bonusStage&&Math.random()<0.008*dt*60){
eBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ENEMY_BULLET_SPEED+level*5});
}
}else if(e.divePhase===1){
if(e.captureAttempt){
// Capture attempt: hover over player briefly
e.x=e.diveStartX+Math.sin(t*3)*20;
e.y=e.diveStartY+Math.sin(t*2)*5;
if(t>1.5){
e.captureAttempt=false;
e.divePhase=2;e.diveTime=0;
e.diveStartX=e.x;e.diveStartY=e.y;
}
// Check capture hitbox (generous for player - they can dodge easily)
var cdx=e.x+e.w/2-player.x;
var cdy=e.y+e.h-player.y;
if(Math.abs(cdx)<15&&Math.abs(cdy)<30&&t>0.3&&!captureInProgress){
captureInProgress=true;
capturedShip={x:player.x,y:player.y,capturedBy:e};
e.hasCaptured=true;
lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff','#4488ff'],15);
if(lives<=0){gameState='gameover';return;}
player.x=W/2;player.y=H-50;
captureInProgress=false;
e.divePhase=2;e.diveTime=0;
e.diveStartX=e.x;e.diveStartY=e.y;
}
}else{
// Overshoot below then loop back
e.y=e.diveStartY+t*diveSpeed*0.5;
if(e.y>H+40){
e.divePhase=2;e.diveTime=0;
e.y=-20;e.x=e.homeX+formationX;
e.diveStartX=e.x;e.diveStartY=e.y;
}
}
}else if(e.divePhase===2){
// Return to formation
var homeX=e.homeX+formationX;
var homeY=e.homeY+formationY;
var dx2=homeX-e.x;
var dy2=homeY-e.y;
var d2=Math.sqrt(dx2*dx2+dy2*dy2);
if(d2<3){
e.x=homeX;e.y=homeY;e.diving=false;
}else{
var returnSpeed=diveSpeed*0.8;
e.x+=dx2/d2*returnSpeed*dt;
e.y+=dy2/d2*returnSpeed*dt;
}
}
}

function updateBonusDiving(e,dt){
if(!e.bonusPath)return;
e.bonusT+=dt*0.6;
var t=e.bonusT;
var path=e.bonusPath;
// Fly in from top in a loop pattern then exit bottom
if(t<1){
e.x=path.startX+Math.sin(t*Math.PI*2)*path.radius;
e.y=-20+t*(H+60);
}else{
e.alive=false;
}
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

if(waveTransition){
waveTransitionTimer-=dt;
if(waveTransitionTimer<=0){
waveTransition=false;
level++;
bonusStage=(level%3===0);
diveInterval=Math.max(0.8,2.0-level*0.1);
spawnFormation();
}
// Allow movement and shooting during wave transition
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));
// Update existing bullets even during transition
for(var i=bullets.length-1;i>=0;i--){
bullets[i].y-=BULLET_SPEED*dt;
if(bullets[i].y<-10)bullets.splice(i,1);
}
return;
}

// Player movement
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));

// Shoot — allow rapid fire with generous bullet limit
var maxBullets=dualFighter?6:4;
if(keySpace&&gameTime-lastShot>0.12&&bullets.length<maxBullets){
lastShot=gameTime;
if(dualFighter){
bullets.push({x:player.x-8,y:player.y-player.h/2,trail:[]});
bullets.push({x:player.x+8,y:player.y-player.h/2,trail:[]});
}else{
bullets.push({x:player.x,y:player.y-player.h/2,trail:[]});
}
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
bullets[i].trail.push({x:bullets[i].x,y:bullets[i].y,life:0.15});
if(bullets[i].trail.length>5)bullets[i].trail.shift();
bullets[i].y-=BULLET_SPEED*dt;
if(bullets[i].y<-10)bullets.splice(i,1);
else{
for(var t=bullets[i].trail.length-1;t>=0;t--){
bullets[i].trail[t].life-=dt;
if(bullets[i].trail[t].life<=0)bullets[i].trail.splice(t,1);
}
}
}

// Formation movement (sway left/right)
formationTimer+=dt;
formationX=Math.sin(formationTimer*0.8)*30;

// Dive scheduling
diveTimer+=dt;
if(diveTimer>=diveInterval&&!bonusStage){
diveTimer=0;
var candidates=[];
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive&&!enemies[i].diving)candidates.push(i);
}
if(candidates.length>0){
var pick=candidates[Math.floor(Math.random()*candidates.length)];
startDive(enemies[pick]);
// Sometimes a wingman joins
if(Math.random()<0.3&&candidates.length>1){
var pick2;
do{pick2=candidates[Math.floor(Math.random()*candidates.length)];}while(pick2===pick);
startDive(enemies[pick2]);
}
}
}

// Bonus stage logic
if(bonusStage){
diveTimer+=dt*0.5;
if(diveTimer>0.6){
diveTimer=0;
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive&&!enemies[i].diving&&!enemies[i].bonusPath){
enemies[i].diving=true;
enemies[i].bonusT=0;
enemies[i].bonusPath={
startX:enemies[i].x,
radius:40+Math.random()*60
};
break;
}
}
}
}

// Update enemies
var aliveCount=0;
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
aliveCount++;
e.frameTimer+=dt;
if(e.frameTimer>0.3){e.frameTimer=0;e.frame=(e.frame+1)%2;}

if(e.diving){
if(bonusStage&&e.bonusPath){
updateBonusDiving(e,dt);
}else{
updateDiving(e,dt);
}
}else{
// Follow formation
e.x=e.homeX+formationX;
e.y=e.homeY+formationY;
}
}

// Enemy shooting (non-diving enemies occasionally shoot)
if(!bonusStage){
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||e.diving)continue;
// Very slow fire rate for easy mode
if(Math.random()<(0.003+level*0.001)*dt*60){
eBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ENEMY_BULLET_SPEED+level*3});
}
}
}

// Update enemy bullets
for(var i=eBullets.length-1;i>=0;i--){
eBullets[i].x+=eBullets[i].vx*dt;
eBullets[i].y+=eBullets[i].vy*dt;
if(eBullets[i].y>H+10||eBullets[i].y<-10)eBullets.splice(i,1);
}

// Bullet-enemy collision
for(var b=bullets.length-1;b>=0;b--){
var hit=false;
for(var e=0;e<enemies.length;e++){
if(!enemies[e].alive)continue;
var en=enemies[e],bu=bullets[b];
// Generous hitbox
var hx=en.x-4,hy=en.y-4,hw=en.w+8,hh=en.h+8;
if(bu.x>hx&&bu.x<hx+hw&&bu.y>hy&&bu.y<hy+hh){
enemies[e].hp--;
if(enemies[e].hp<=0){
enemies[e].alive=false;
var pts=100;
if(enemies[e].type==='commander')pts=300;
if(enemies[e].type==='boss')pts=400;
if(bonusStage)pts*=2;
score+=pts;
bonusKills++;
// Check if boss had captured ship
if(enemies[e].hasCaptured&&capturedShip){
// Rescue! Captured ship joins player as dual fighter
dualFighter=true;
addExplosion(capturedShip.x,capturedShip.y,['#00ff00','#88ff88','#ffffff'],20);
capturedShip=null;
}
var eColors=['#ffffff','#ffcc00','#ff6600'];
if(enemies[e].type==='commander')eColors=['#ff4444','#ff8888','#ffcc00'];
if(enemies[e].type==='boss')eColors=['#8844ff','#4488ff','#ffffff'];
addExplosion(en.x+en.w/2,en.y+en.h/2,eColors,18);
}else{
addExplosion(en.x+en.w/2,en.y+en.h/2,['#ffffff'],5);
}
bullets.splice(b,1);hit=true;break;
}
}
if(hit)continue;
}

// Enemy bullet-player collision (generous hitbox for player = smaller collision box)
for(var i=eBullets.length-1;i>=0;i--){
var eb=eBullets[i];
var px=player.x-player.w*0.3,py=player.y-player.h*0.3;
var pw=player.w*0.6,ph=player.h*0.6;
if(eb.x>px&&eb.x<px+pw&&eb.y>py&&eb.y<py+ph){
eBullets.splice(i,1);lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff','#4488ff'],25);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-50;}
}
}

// Diving enemy-player collision
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||!e.diving)continue;
var dx=e.x+e.w/2-player.x;
var dy=e.y+e.h/2-player.y;
if(Math.abs(dx)<(e.w+player.w)*0.3&&Math.abs(dy)<(e.h+player.h)*0.3){
enemies[i].alive=false;
addExplosion(e.x+e.w/2,e.y+e.h/2,['#ff8800','#ffcc00','#ffffff'],20);
lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff'],15);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-50;}
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.vx*=0.97;p.vy*=0.97;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Update captured ship position (follows captor)
if(capturedShip&&capturedShip.capturedBy){
var captor=capturedShip.capturedBy;
if(captor.alive){
capturedShip.x=captor.x+captor.w/2;
capturedShip.y=captor.y+captor.h+15;
}
}

// Wave clear
if(aliveCount===0){
waveTransition=true;
waveTransitionTimer=1.5;
if(bonusStage){
// Bonus stage results
var perfect=(bonusKills>=bonusTotalEnemies);
if(perfect)score+=10000;
}
}

// Stars scrolling
for(var l=0;l<3;l++){
var speed=(l+1)*30;
for(var i=0;i<starLayers[l].length;i++){
starLayers[l][i].y+=speed*dt;
if(starLayers[l][i].y>H){starLayers[l][i].y=0;starLayers[l][i].x=Math.random()*W;}
}
}
}

function drawStars(){
for(var l=0;l<3;l++){
for(var i=0;i<starLayers[l].length;i++){
var s=starLayers[l][i];
var twinkle=0.5+0.5*Math.sin(gameTime*3+s.x+s.y);
ctx.globalAlpha=s.b*twinkle;
ctx.fillStyle=(l===2)?'#aaccff':'#ffffff';
ctx.fillRect(s.x,s.y,s.s,s.s);
}
}
ctx.globalAlpha=1;
}

function drawPlayerShip(x,y,w,h){
ctx.save();
// Engine glow
ctx.shadowColor='#4488ff';ctx.shadowBlur=8;
ctx.fillStyle='#2244aa';
ctx.beginPath();
ctx.moveTo(x-w*0.15,y+h*0.5);
ctx.lineTo(x,y+h*0.5+6+Math.sin(gameTime*15)*3);
ctx.lineTo(x+w*0.15,y+h*0.5);
ctx.fill();

ctx.shadowColor='#88bbff';ctx.shadowBlur=5;
// Main body - sleek triangle
ctx.fillStyle='#ccddff';
ctx.beginPath();
ctx.moveTo(x,y-h*0.6); // nose
ctx.lineTo(x+w*0.45,y+h*0.4);
ctx.lineTo(x+w*0.2,y+h*0.3);
ctx.lineTo(x-w*0.2,y+h*0.3);
ctx.lineTo(x-w*0.45,y+h*0.4);
ctx.closePath();
ctx.fill();

// Cockpit
ctx.fillStyle='#4488ff';
ctx.beginPath();
ctx.moveTo(x,y-h*0.3);
ctx.lineTo(x+w*0.1,y+h*0.05);
ctx.lineTo(x-w*0.1,y+h*0.05);
ctx.closePath();
ctx.fill();

// Wing tips
ctx.fillStyle='#8899cc';
ctx.fillRect(x-w*0.5,y+h*0.2,w*0.15,h*0.25);
ctx.fillRect(x+w*0.35,y+h*0.2,w*0.15,h*0.25);

ctx.shadowBlur=0;
ctx.restore();
}

function drawEnemyRegular(x,y,w,h,frame){
// Butterfly/insect shape
ctx.save();
var cx=x+w/2,cy=y+h/2;
ctx.fillStyle='#ffffff';
// Body
ctx.fillRect(cx-2,y+2,4,h-4);
// Wings
if(frame===0){
// Wings up
ctx.beginPath();
ctx.moveTo(cx-2,cy-2);
ctx.lineTo(x-2,y);
ctx.lineTo(x+2,cy+4);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.moveTo(cx+2,cy-2);
ctx.lineTo(x+w+2,y);
ctx.lineTo(x+w-2,cy+4);
ctx.closePath();
ctx.fill();
}else{
// Wings down
ctx.beginPath();
ctx.moveTo(cx-2,cy-2);
ctx.lineTo(x-2,cy+6);
ctx.lineTo(x+4,cy+2);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.moveTo(cx+2,cy-2);
ctx.lineTo(x+w+2,cy+6);
ctx.lineTo(x+w-4,cy+2);
ctx.closePath();
ctx.fill();
}
// Eyes
ctx.fillStyle='#4488ff';
ctx.fillRect(cx-5,y+4,3,3);
ctx.fillRect(cx+2,y+4,3,3);
// Lower wing detail
ctx.fillStyle='#aabbff';
ctx.fillRect(cx-4,cy+2,3,4);
ctx.fillRect(cx+1,cy+2,3,4);
ctx.restore();
}

function drawEnemyCommander(x,y,w,h,frame){
// Red commander with antennae
ctx.save();
var cx=x+w/2,cy=y+h/2;
// Antennae
ctx.strokeStyle='#ff6666';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(cx-4,y+2);ctx.lineTo(cx-8,y-6);ctx.stroke();
ctx.beginPath();ctx.moveTo(cx+4,y+2);ctx.lineTo(cx+8,y-6);ctx.stroke();
// Antenna tips
ctx.fillStyle='#ffaaaa';
ctx.fillRect(cx-9,y-8,3,3);
ctx.fillRect(cx+7,y-8,3,3);
// Body
ctx.fillStyle='#ff3333';
ctx.beginPath();
ctx.moveTo(cx,y);
ctx.lineTo(x+w-2,cy);
ctx.lineTo(cx+4,y+h);
ctx.lineTo(cx-4,y+h);
ctx.lineTo(x+2,cy);
ctx.closePath();
ctx.fill();
// Wings
ctx.fillStyle='#ff6644';
if(frame===0){
ctx.beginPath();ctx.moveTo(x+3,cy);ctx.lineTo(x-4,y+2);ctx.lineTo(x,cy+6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w-3,cy);ctx.lineTo(x+w+4,y+2);ctx.lineTo(x+w,cy+6);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(x+3,cy);ctx.lineTo(x-3,cy+4);ctx.lineTo(x+2,cy+8);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w-3,cy);ctx.lineTo(x+w+3,cy+4);ctx.lineTo(x+w-2,cy+8);ctx.closePath();ctx.fill();
}
// Eyes
ctx.fillStyle='#ffffff';
ctx.fillRect(cx-5,cy-4,4,3);
ctx.fillRect(cx+1,cy-4,4,3);
ctx.fillStyle='#000000';
ctx.fillRect(cx-4,cy-3,2,2);
ctx.fillRect(cx+2,cy-3,2,2);
ctx.restore();
}

function drawEnemyBoss(x,y,w,h,frame,hasCaptured){
// Boss galaga - blue/purple with pulsing glow
ctx.save();
var cx=x+w/2,cy=y+h/2;
var pulse=0.5+0.5*Math.sin(gameTime*4);

// Glow
ctx.shadowColor='#8844ff';ctx.shadowBlur=6+pulse*6;

// Main body - larger
ctx.fillStyle=hasCaptured?'#22aa44':'#6633cc';
ctx.beginPath();
ctx.moveTo(cx,y-3);
ctx.lineTo(x+w+3,cy);
ctx.lineTo(cx+6,y+h+2);
ctx.lineTo(cx-6,y+h+2);
ctx.lineTo(x-3,cy);
ctx.closePath();
ctx.fill();

// Inner body
ctx.fillStyle=hasCaptured?'#44cc66':'#8855ee';
ctx.beginPath();
ctx.moveTo(cx,y+3);
ctx.lineTo(x+w-4,cy);
ctx.lineTo(cx+3,y+h-2);
ctx.lineTo(cx-3,y+h-2);
ctx.lineTo(x+4,cy);
ctx.closePath();
ctx.fill();

ctx.shadowBlur=0;

// Wings
ctx.fillStyle=hasCaptured?'#33bb55':'#5522aa';
if(frame===0){
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-6,y);ctx.lineTo(x-2,cy+5);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+6,y);ctx.lineTo(x+w+2,cy+5);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-5,cy+4);ctx.lineTo(x,cy+8);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+5,cy+4);ctx.lineTo(x+w,cy+8);ctx.closePath();ctx.fill();
}

// Crown/top detail
ctx.fillStyle='#aa66ff';
ctx.fillRect(cx-2,y-4,4,5);
ctx.fillRect(cx-6,y-2,3,3);
ctx.fillRect(cx+3,y-2,3,3);

// Eyes - glowing
ctx.fillStyle='#ff4444';
ctx.fillRect(cx-5,cy-2,4,3);
ctx.fillRect(cx+1,cy-2,4,3);
ctx.fillStyle='#ffffff';
ctx.fillRect(cx-4,cy-1,2,1);
ctx.fillRect(cx+2,cy-1,2,1);

ctx.restore();
}

function drawEnemy(e){
if(e.type==='regular')drawEnemyRegular(e.x,e.y,e.w,e.h,e.frame);
else if(e.type==='commander')drawEnemyCommander(e.x,e.y,e.w,e.h,e.frame);
else if(e.type==='boss')drawEnemyBoss(e.x,e.y,e.w,e.h,e.frame,e.hasCaptured);
}

function render(){
ctx.fillStyle='#000011';ctx.fillRect(0,0,W,H);
drawStars();

// Wave transition text
if(waveTransition){
ctx.save();ctx.textAlign='center';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
if(bonusStage){
ctx.fillText('BONUS STAGE COMPLETE',W/2,H*0.4);
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillStyle='#ffffff';
var perfectText=(bonusKills>=bonusTotalEnemies)?'PERFECT! +10000':'Hits: '+bonusKills+'/'+bonusTotalEnemies;
ctx.fillText(perfectText,W/2,H*0.5);
}else{
var nextLvl=level+1;
if(nextLvl%3===0){
ctx.fillText('BONUS STAGE',W/2,H*0.4);
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillStyle='#aaaaaa';
ctx.fillText('Destroy all enemies for a bonus!',W/2,H*0.48);
}else{
ctx.fillText('STAGE '+nextLvl,W/2,H*0.4);
}
}
ctx.restore();
return;
}

// Enemies
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive)drawEnemy(enemies[i]);
}

// Captured ship display
if(capturedShip&&capturedShip.capturedBy&&capturedShip.capturedBy.alive){
ctx.save();
ctx.globalAlpha=0.6;
drawPlayerShip(capturedShip.x,capturedShip.y,player.w,player.h);
ctx.globalAlpha=1;
// Tractor beam effect
ctx.strokeStyle='rgba(136,68,255,0.3)';
ctx.lineWidth=capturedShip.capturedBy.w*0.6;
ctx.beginPath();
ctx.moveTo(capturedShip.capturedBy.x+capturedShip.capturedBy.w/2,capturedShip.capturedBy.y+capturedShip.capturedBy.h);
ctx.lineTo(capturedShip.x,capturedShip.y);
ctx.stroke();
ctx.restore();
}

// Player
drawPlayerShip(player.x,player.y,player.w,player.h);
if(dualFighter){
// Second ship alongside
drawPlayerShip(player.x+player.w*0.9,player.y,player.w,player.h);
}

// Bullets with trails
ctx.shadowColor='#ffff00';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
var bu=bullets[i];
// Trail
for(var t=0;t<bu.trail.length;t++){
var tr=bu.trail[t];
ctx.globalAlpha=tr.life/0.15*0.4;
ctx.fillStyle='#ffcc00';
ctx.fillRect(tr.x-1,tr.y,2,6);
}
ctx.globalAlpha=1;
ctx.fillStyle='#ffff44';
ctx.fillRect(bu.x-1.5,bu.y,3,8);
}
ctx.shadowBlur=0;

// Enemy bullets
ctx.shadowColor='#ff4444';ctx.shadowBlur=4;
ctx.fillStyle='#ff6666';
for(var i=0;i<eBullets.length;i++){
ctx.fillRect(eBullets[i].x-1.5,eBullets[i].y,3,8);
}
ctx.shadowBlur=0;

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];
ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;

// Lives display (ship icons)
for(var i=0;i<lives;i++){
var lx=20+i*22,ly=H-18;
ctx.fillStyle='#ccddff';
ctx.beginPath();
ctx.moveTo(lx,ly-6);
ctx.lineTo(lx+7,ly+4);
ctx.lineTo(lx-7,ly+4);
ctx.closePath();
ctx.fill();
}

// Level / bonus stage indicator
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
if(bonusStage)ctx.fillText('BONUS STAGE',W-15,H-18);
else ctx.fillText('STAGE '+level,W-15,H-18);

// Dual fighter indicator
if(dualFighter){
ctx.fillStyle='#44ff44';ctx.textAlign='center';
ctx.font='11px "Courier New",monospace';
ctx.fillText('DUAL FIGHTER',W/2,H-8);
}
}

function drawTitle(dt){
ctx.fillStyle='#000011';ctx.fillRect(0,0,W,H);
drawStars();
titlePulse+=dt*3;

ctx.save();ctx.textAlign='center';

// Title glow
var glowPulse=15+Math.sin(titlePulse)*10;
ctx.shadowColor='#ff4444';ctx.shadowBlur=glowPulse;

// GALAGA title
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
// Gradient-like effect with multiple draws
ctx.fillStyle='#ff2222';
ctx.fillText('GALAGA',W/2,H*0.25);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=glowPulse*0.5;
ctx.fillStyle='#ff6633';
ctx.fillText('GALAGA',W/2,H*0.25);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('ARCADE CLASSIC',W/2,H*0.32);

// Start prompt
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.5);

// Controls
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / A-D to move, Space to shoot',W/2,H*0.58);

// Draw sample enemies
var sampleY=H*0.7;
var spacing=W*0.12;
var sx=W/2-spacing*2;

// Boss
drawEnemyBoss(sx-14,sampleY-11,28,22,Math.floor(titlePulse)%2,false);
ctx.fillStyle='#aaaaaa';ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
ctx.fillText('400',sx,sampleY+22);

// Commander
drawEnemyCommander(sx+spacing-14,sampleY-11,28,22,Math.floor(titlePulse)%2);
ctx.fillStyle='#aaaaaa';
ctx.fillText('300',sx+spacing,sampleY+22);

// Regular
drawEnemyRegular(sx+spacing*2-14,sampleY-11,28,22,Math.floor(titlePulse)%2);
ctx.fillStyle='#aaaaaa';
ctx.fillText('100',sx+spacing*2,sampleY+22);

// High score display area
ctx.fillStyle='#ff4444';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('CAPTURE MECHANIC - RESCUE YOUR SHIP FOR DUAL FIREPOWER!',W/2,H*0.88);

ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.40);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Stage reached: '+level,W/2,H*0.50);

if(dualFighter){
ctx.fillStyle='#44ff44';
ctx.fillText('Dual Fighter achieved!',W/2,H*0.57);
}

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='STG '+level;
document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

// Always update stars for scrolling effect
if(gameState!=='playing'){
for(var l=0;l<3;l++){
var speed=(l+1)*30;
for(var i=0;starLayers[l]&&i<starLayers[l].length;i++){
starLayers[l][i].y+=speed*dt;
if(starLayers[l][i].y>H){starLayers[l][i].y=0;starLayers[l][i].x=Math.random()*W;}
}
}
}

if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt*3;drawGameOver();}

animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;}
if(e.key===' '){keySpace=down;}
if(down&&(e.key==='Enter'||e.key==='Tab'||e.key===' ')&&gameState!=='playing'){resetGame();}
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

window.initGalaga=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopGalaga=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keySpace=false;
};
})();
