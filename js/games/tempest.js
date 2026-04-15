// Tempest — Full Game
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
this.closePath();return this;};
}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=0,gameTime=0,titlePulse=0;
var playerLane=0,numSegments=16;
var bullets=[],enemies=[],particles=[],spikes=[];
var keyLeft=false,keyRight=false,keyFire=false,keyZap=false;
var lastShot=0,lastMove=0,moveDelay=0.08;
var superZapAvailable=true;
var warpPhase=false,warpTimer=0,warpSpeed=0;
var levelClearTimer=0,levelClearing=false;
var spawnTimer=0,enemiesSpawned=0,maxEnemiesPerLevel=8;
var SHOT_SPEED=3.5,ENEMY_BASE_SPEED=0.18;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12); }

// Level shape definitions: arrays of angles for rim points
// Each shape is an array of angles (in radians) defining the polygon
var LEVEL_SHAPES=[
{name:'Circle',     segments:16, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Square',     segments:16, getAngle:function(i,n){
  var t=Math.PI*2*i/n;
  // Square superformula approximation
  var a=Math.cos(t),b=Math.sin(t);
  var m=Math.max(Math.abs(a),Math.abs(b));
  return t;}},
{name:'Triangle',   segments:15, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Cross',      segments:16, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Pentagon',   segments:15, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Star',       segments:16, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Hexagon',    segments:16, getAngle:function(i,n){return Math.PI*2*i/n;}},
{name:'Figure8',    segments:16, getAngle:function(i,n){return Math.PI*2*i/n;}}
];

// Rim radius multiplier for shape distortion
function getShapeRadius(shapeIdx,angle){
var s=shapeIdx%LEVEL_SHAPES.length;
var r=1.0;
if(s===1){// Square
  var a=Math.cos(angle),b=Math.sin(angle);
  r=1.0/Math.max(Math.abs(a),Math.abs(b))*0.72;
}else if(s===2){// Triangle
  // 3-sided shape
  var t=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  var sector=Math.floor(t/(Math.PI*2/3));
  var local=t-sector*(Math.PI*2/3)-Math.PI/3;
  r=0.8/Math.cos(local);
  r=Math.min(r,1.3);
}else if(s===3){// Cross
  var t=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  var seg=t/(Math.PI/4);
  var idx=Math.floor(seg)%8;
  r=(idx%2===0)?1.0:0.55;
  // Smooth it a bit
  var frac=seg-Math.floor(seg);
  var next=(idx+1)%8;
  var rNext=(next%2===0)?1.0:0.55;
  r=r*(1-frac)+rNext*frac;
}else if(s===4){// Pentagon
  var t=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  var sector=Math.floor(t/(Math.PI*2/5));
  var local=t-sector*(Math.PI*2/5)-Math.PI/5;
  r=0.85/Math.cos(local);
  r=Math.min(r,1.3);
}else if(s===5){// Star
  r=0.6+0.4*Math.cos(5*angle);
}else if(s===6){// Hexagon
  var t=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  var sector=Math.floor(t/(Math.PI*2/6));
  var local=t-sector*(Math.PI*2/6)-Math.PI/6;
  r=0.88/Math.cos(local);
  r=Math.min(r,1.2);
}else if(s===7){// Figure-8
  var t=angle*2;
  r=0.6+0.4*Math.sin(t);
}
return r;
}

// Tube geometry: compute rim and center points for each segment
var rimPoints=[],centerX,centerY,tubeRadius;
var TUBE_DEPTH=0.15; // How far the center is (fraction of radius — perspective)

function buildTube(){
var shape=LEVEL_SHAPES[level%LEVEL_SHAPES.length];
numSegments=shape.segments;
if(playerLane>=numSegments)playerLane=0;
rimPoints=[];
centerX=W/2;
centerY=H/2;
tubeRadius=Math.min(W,H)*0.38;
for(var i=0;i<numSegments;i++){
  var angle=shape.getAngle(i,numSegments)-Math.PI/2;
  var r=getShapeRadius(level%LEVEL_SHAPES.length,angle)*tubeRadius;
  rimPoints.push({
    x:centerX+Math.cos(angle)*r,
    y:centerY+Math.sin(angle)*r,
    angle:angle,
    r:r
  });
}
}

// Get point along a lane at depth t (0=rim, 1=center)
function getLanePoint(lane,t){
var p=rimPoints[lane%numSegments];
var x=p.x+(centerX-p.x)*t;
var y=p.y+(centerY-p.y)*t;
return {x:x,y:y};
}

// Get midpoint of lane edge (between lane and lane+1) at depth t
function getLaneMid(lane,t){
var a=getLanePoint(lane,t);
var b=getLanePoint((lane+1)%numSegments,t);
return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
buildTube();
}

// --- Enemy types ---
// depth: 0 = at center (far), 1 = at rim (near player)
// lane: which segment they are in
function spawnEnemy(){
var types=['flipper','tanker','spiker'];
var weights=[0.5,0.3,0.2];
var roll=Math.random();
var type='flipper';
if(roll<weights[2])type='spiker';
else if(roll<weights[2]+weights[1])type='tanker';
var lane=Math.floor(Math.random()*numSegments);
var speed=ENEMY_BASE_SPEED*(0.7+level*0.04)*diffMult();
speed=Math.min(speed,0.5);
enemies.push({
  type:type,
  lane:lane,
  depth:0,
  speed:speed,
  alive:true,
  flipTimer:0,
  flipDir:0,
  splitDone:false,
  spikeTrail:type==='spiker',
  flash:0
});
}

function resetGame(){
score=0;lives=3;level=0;gameTime=0;
playerLane=0;superZapAvailable=true;
bullets=[];enemies=[];particles=[];spikes=[];
warpPhase=false;warpTimer=0;
levelClearTimer=0;levelClearing=false;
spawnTimer=0;enemiesSpawned=0;
buildTube();
gameState='playing';
}

function startLevel(){
enemies=[];bullets=[];spikes=[];
warpPhase=false;warpTimer=0;
levelClearTimer=0;levelClearing=false;
spawnTimer=0;enemiesSpawned=0;
superZapAvailable=true;
maxEnemiesPerLevel=8+Math.floor(level*1.5);
maxEnemiesPerLevel=Math.min(maxEnemiesPerLevel,24);
buildTube();
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++){
  var angle=Math.random()*Math.PI*2;
  var speed=50+Math.random()*150;
  particles.push({
    x:x,y:y,
    vx:Math.cos(angle)*speed,
    vy:Math.sin(angle)*speed,
    life:0.4+Math.random()*0.6,
    maxLife:0.4+Math.random()*0.6,
    color:color,
    size:1+Math.random()*3
  });
}
}

function addElectricExplosion(x,y,color,n){
for(var i=0;i<n;i++){
  var angle=Math.random()*Math.PI*2;
  var speed=30+Math.random()*200;
  var branches=2+Math.floor(Math.random()*3);
  particles.push({
    x:x,y:y,
    vx:Math.cos(angle)*speed,
    vy:Math.sin(angle)*speed,
    life:0.3+Math.random()*0.5,
    maxLife:0.3+Math.random()*0.5,
    color:color,
    size:1+Math.random()*2,
    electric:true,
    branches:branches
  });
}
}

function fireSuperzapper(){
if(!superZapAvailable)return;
superZapAvailable=false;
// Destroy all visible enemies
for(var i=enemies.length-1;i>=0;i--){
  var e=enemies[i];
  var pos=getLaneMid(e.lane,1-e.depth);
  if(e.type==='flipper')score+=150;
  else if(e.type==='tanker')score+=200;
  else score+=50;
  addElectricExplosion(pos.x,pos.y,'#ffffff',12);
  addElectricExplosion(pos.x,pos.y,'#00ffff',8);
}
enemies=[];
// Flash effect
addParticles(centerX,centerY,'#ffffff',30);
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

if(warpPhase){
  updateWarp(dt);
  return;
}

if(levelClearing){
  levelClearTimer+=dt;
  if(levelClearTimer>1.5){
    // Check if spikes exist — if so, start warp phase
    if(spikes.length>0){
      warpPhase=true;
      warpTimer=0;
      warpSpeed=0;
    }else{
      level++;
      startLevel();
    }
    levelClearing=false;
  }
  return;
}

// Player movement
if(gameState!=='playing')return;
lastMove-=dt;
if(keyLeft&&lastMove<=0){
  playerLane=(playerLane-1+numSegments)%numSegments;
  lastMove=moveDelay;
}
if(keyRight&&lastMove<=0){
  playerLane=(playerLane+1)%numSegments;
  lastMove=moveDelay;
}

// Superzapper
if(keyZap){
  fireSuperzapper();
  keyZap=false;
}

// Shooting
lastShot-=dt;
if(keyFire&&lastShot<=0){
  lastShot=0.12;
  var pos=getLaneMid(playerLane,0);
  bullets.push({lane:playerLane,depth:0,speed:SHOT_SPEED});
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
  var b=bullets[i];
  b.depth+=b.speed*dt;
  if(b.depth>=1){bullets.splice(i,1);continue;}
  // Check collision with enemies (wider hitbox for easy mode)
  var hitRadius=0.08;
  for(var j=enemies.length-1;j>=0;j--){
    var e=enemies[j];
    if(e.lane===b.lane&&Math.abs(e.depth-b.depth)<hitRadius){
      var pos=getLaneMid(e.lane,1-e.depth);
      if(e.type==='flipper'){
        score+=150;
        addElectricExplosion(pos.x,pos.y,'#ff4444',15);
        enemies.splice(j,1);
      }else if(e.type==='tanker'){
        score+=200;
        addElectricExplosion(pos.x,pos.y,'#44ff44',15);
        // Split into two flippers in adjacent lanes
        if(!e.splitDone){
          var laneA=(e.lane-1+numSegments)%numSegments;
          var laneB=(e.lane+1)%numSegments;
          var spd=ENEMY_BASE_SPEED*(0.5+level*0.03);
          enemies.push({type:'flipper',lane:laneA,depth:e.depth,speed:spd,alive:true,flipTimer:0,flipDir:0,splitDone:false,spikeTrail:false,flash:0});
          enemies.push({type:'flipper',lane:laneB,depth:e.depth,speed:spd,alive:true,flipTimer:0,flipDir:0,splitDone:false,spikeTrail:false,flash:0});
        }
        enemies.splice(j,1);
      }else if(e.type==='spiker'){
        score+=50;
        addElectricExplosion(pos.x,pos.y,'#ff44ff',10);
        enemies.splice(j,1);
      }
      bullets.splice(i,1);
      break;
    }
  }
}

// Check bullet-spike collision
for(var i=bullets.length-1;i>=0;i--){
  var b=bullets[i];
  for(var j=spikes.length-1;j>=0;j--){
    var s=spikes[j];
    if(s.lane===b.lane&&b.depth>=s.depthStart-0.05&&b.depth<=s.depthEnd+0.05){
      // Shorten spike from the near end
      s.depthEnd=Math.max(s.depthStart,b.depth-0.05);
      if(s.depthEnd-s.depthStart<0.02){
        spikes.splice(j,1);
      }
      var pos=getLaneMid(b.lane,1-b.depth);
      addParticles(pos.x,pos.y,'#ff44ff',5);
      bullets.splice(i,1);
      break;
    }
  }
}

// Spawn enemies
spawnTimer-=dt;
if(spawnTimer<=0&&enemiesSpawned<maxEnemiesPerLevel){
  spawnEnemy();
  enemiesSpawned++;
  spawnTimer=1.2-level*0.03;
  spawnTimer=Math.max(spawnTimer,0.4);
}

// Update enemies
for(var i=enemies.length-1;i>=0;i--){
  var e=enemies[i];
  // Move toward rim
  e.depth+=e.speed*dt;

  // Flipper: occasionally change lanes
  if(e.type==='flipper'){
    e.flipTimer-=dt;
    if(e.flipTimer<=0&&e.depth>0.3){
      e.flipTimer=1.5+Math.random()*3;
      e.lane=(e.lane+(Math.random()<0.5?1:-1)+numSegments)%numSegments;
    }
  }

  // Spiker: leave spike trail
  if(e.type==='spiker'&&e.spikeTrail){
    var existingSpike=null;
    for(var s=0;s<spikes.length;s++){
      if(spikes[s].lane===e.lane){existingSpike=spikes[s];break;}
    }
    if(existingSpike){
      existingSpike.depthEnd=Math.max(existingSpike.depthEnd,e.depth);
    }else{
      spikes.push({lane:e.lane,depthStart:0.05,depthEnd:e.depth});
    }
  }

  // Enemy reached rim — hits player
  if(e.depth>=1){
    if(e.lane===playerLane||(e.lane+1)%numSegments===playerLane||
       (e.lane-1+numSegments)%numSegments===playerLane){
      // Player hit
      loseLife();
      enemies.splice(i,1);
      continue;
    }
    // If not on player's lane, enemy just sits at rim
    e.depth=0.98;
    // Move toward player lane
    var diff=playerLane-e.lane;
    if(diff>numSegments/2)diff-=numSegments;
    if(diff<-numSegments/2)diff+=numSegments;
    if(Math.abs(diff)>0){
      e.flipTimer-=dt;
      if(e.flipTimer<=0){
        e.lane=(e.lane+(diff>0?1:-1)+numSegments)%numSegments;
        e.flipTimer=0.4;
      }
    }
  }
}

// Check level clear
if(enemiesSpawned>=maxEnemiesPerLevel&&enemies.length===0&&!levelClearing){
  levelClearing=true;
  levelClearTimer=0;
}

// Update particles
for(var i=particles.length-1;i>=0;i--){
  var p=particles[i];
  p.x+=p.vx*dt;
  p.y+=p.vy*dt;
  p.life-=dt;
  if(p.life<=0)particles.splice(i,1);
}
}

function loseLife(){
lives--;
var pos=getLaneMid(playerLane,0);
addElectricExplosion(pos.x,pos.y,'#ffff00',20);
addElectricExplosion(pos.x,pos.y,'#ff0000',15);
if(lives<=0){
  gameState='gameover';
  titlePulse=0;
}else{
  // Brief invincibility (handled by spawn delay)
  enemies=[];
  bullets=[];
  spawnTimer=1.5;
}
}

function updateWarp(dt){
warpTimer+=dt;
warpSpeed+=dt*2;
// Player moves toward center, check spike collision
var warpDepth=Math.min(warpTimer*0.5,1);
// Check if player hits a spike
var hitSpike=false;
for(var i=0;i<spikes.length;i++){
  var s=spikes[i];
  if(s.lane===playerLane&&warpDepth>=s.depthStart&&warpDepth<=s.depthEnd){
    hitSpike=true;
    break;
  }
}
if(hitSpike){
  var pos=getLaneMid(playerLane,1-warpDepth);
  addElectricExplosion(pos.x,pos.y,'#ff0000',25);
  loseLife();
  if(gameState==='gameover')return;
  warpPhase=false;
  level++;
  startLevel();
  return;
}
if(warpDepth>=1){
  warpPhase=false;
  level++;
  startLevel();
}
}

// ---- RENDERING ----

function drawTube(){
// Draw tube lines from rim to center with gradient fade
var tubeColor=getTubeColor();
ctx.shadowColor=tubeColor;
for(var i=0;i<numSegments;i++){
  var p=rimPoints[i];
  // Lane lines with depth fade
  var lineG=ctx.createLinearGradient(p.x,p.y,centerX,centerY);
  lineG.addColorStop(0,tubeColor);lineG.addColorStop(0.7,'rgba(40,40,80,0.3)');lineG.addColorStop(1,'rgba(20,20,40,0.1)');
  ctx.strokeStyle=lineG;ctx.lineWidth=1.5;ctx.shadowBlur=4;
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(centerX,centerY);ctx.stroke();
}
// Draw rim polygon - bright outer ring with double glow
ctx.lineWidth=3;ctx.shadowBlur=12;ctx.strokeStyle=tubeColor;
ctx.beginPath();
for(var i=0;i<numSegments;i++){
  var p=rimPoints[i];
  if(i===0)ctx.moveTo(p.x,p.y);
  else ctx.lineTo(p.x,p.y);
}
ctx.closePath();ctx.stroke();
// Second brighter inner rim
ctx.lineWidth=1;ctx.shadowBlur=4;ctx.strokeStyle='rgba(255,255,255,0.15)';
ctx.beginPath();
for(var i=0;i<numSegments;i++){
  var pt=getLanePoint(i,0.02);
  if(i===0)ctx.moveTo(pt.x,pt.y);
  else ctx.lineTo(pt.x,pt.y);
}
ctx.closePath();ctx.stroke();

// Draw depth rings with pulsing
ctx.shadowBlur=2;
for(var d=0.2;d<1;d+=0.2){
  var pulse=0.15+0.1*Math.sin(gameTime*2+d*5);
  ctx.globalAlpha=pulse;
  ctx.strokeStyle=tubeColor;ctx.lineWidth=0.6;
  ctx.beginPath();
  for(var i=0;i<numSegments;i++){
    var pt=getLanePoint(i,d);
    if(i===0)ctx.moveTo(pt.x,pt.y);
    else ctx.lineTo(pt.x,pt.y);
  }
  ctx.closePath();ctx.stroke();
}
ctx.globalAlpha=1;
ctx.shadowBlur=0;
// Center point glow
var cpGlow=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,tubeRadius*0.08);
cpGlow.addColorStop(0,'rgba(255,255,255,0.12)');cpGlow.addColorStop(1,'rgba(255,255,255,0)');
ctx.fillStyle=cpGlow;ctx.fillRect(centerX-tubeRadius*0.1,centerY-tubeRadius*0.1,tubeRadius*0.2,tubeRadius*0.2);
}

function getTubeColor(){
var colors=['#4488ff','#44aaff','#6644ff','#44ffaa','#ff44aa','#ffaa44','#44ff44','#aa44ff'];
return colors[level%colors.length];
}

function drawPlayer(){
// Player claw/chevron on the rim at playerLane
var p0=rimPoints[playerLane];
var p1=rimPoints[(playerLane+1)%numSegments];
var mid={x:(p0.x+p1.x)/2,y:(p0.y+p1.y)/2};
// Slightly inward
var inward={x:mid.x+(centerX-mid.x)*0.05,y:mid.y+(centerY-mid.y)*0.05};
// Chevron points
var leftPt={x:p0.x+(centerX-p0.x)*0.03,y:p0.y+(centerY-p0.y)*0.03};
var rightPt={x:p1.x+(centerX-p1.x)*0.03,y:p1.y+(centerY-p1.y)*0.03};
var tipPt={x:inward.x+(centerX-inward.x)*0.12,y:inward.y+(centerY-inward.y)*0.12};

ctx.save();
ctx.strokeStyle='#ffff00';
ctx.lineWidth=3;
ctx.shadowColor='#ffff00';
ctx.shadowBlur=12;
ctx.beginPath();
ctx.moveTo(leftPt.x,leftPt.y);
ctx.lineTo(inward.x,inward.y);
ctx.lineTo(rightPt.x,rightPt.y);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(inward.x,inward.y);
ctx.lineTo(tipPt.x,tipPt.y);
ctx.stroke();
ctx.shadowBlur=0;
ctx.restore();
}

function drawEnemies(){
for(var i=0;i<enemies.length;i++){
  var e=enemies[i];
  var pos=getLaneMid(e.lane,1-e.depth);
  // Scale size based on depth (smaller when far)
  var scale=0.3+0.7*(1-e.depth);
  var sz=8*scale*(W/500);
  sz=Math.max(sz,3);

  ctx.save();
  ctx.translate(pos.x,pos.y);

  if(e.type==='flipper'){
    // Red diamond that flips
    ctx.strokeStyle='#ff3333';
    ctx.lineWidth=2;
    ctx.shadowColor='#ff3333';
    ctx.shadowBlur=6;
    ctx.beginPath();
    ctx.moveTo(0,-sz);ctx.lineTo(sz,0);ctx.lineTo(0,sz);ctx.lineTo(-sz,0);
    ctx.closePath();ctx.stroke();
    // Inner line
    ctx.beginPath();ctx.moveTo(-sz*0.5,0);ctx.lineTo(sz*0.5,0);ctx.stroke();
  }else if(e.type==='tanker'){
    // Green rectangle
    ctx.strokeStyle='#33ff66';
    ctx.lineWidth=2;
    ctx.shadowColor='#33ff66';
    ctx.shadowBlur=6;
    ctx.beginPath();
    ctx.rect(-sz,-sz*0.6,sz*2,sz*1.2);
    ctx.stroke();
    // Cross inside
    ctx.beginPath();
    ctx.moveTo(-sz*0.5,-sz*0.3);ctx.lineTo(sz*0.5,sz*0.3);
    ctx.moveTo(sz*0.5,-sz*0.3);ctx.lineTo(-sz*0.5,sz*0.3);
    ctx.stroke();
  }else if(e.type==='spiker'){
    // Purple/magenta spike shape
    ctx.strokeStyle='#ff44ff';
    ctx.lineWidth=2;
    ctx.shadowColor='#ff44ff';
    ctx.shadowBlur=6;
    ctx.beginPath();
    for(var s=0;s<6;s++){
      var a=Math.PI*2*s/6+gameTime*3;
      var r2=sz*(s%2===0?1:0.4);
      if(s===0)ctx.moveTo(Math.cos(a)*r2,Math.sin(a)*r2);
      else ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);
    }
    ctx.closePath();ctx.stroke();
  }
  ctx.shadowBlur=0;
  ctx.restore();
}
}

function drawBullets(){
ctx.strokeStyle='#ffff88';
ctx.lineWidth=2;
ctx.shadowColor='#ffff00';
ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
  var b=bullets[i];
  var pos=getLaneMid(b.lane,1-b.depth);
  var posAhead=getLaneMid(b.lane,1-Math.max(0,b.depth-0.05));
  ctx.beginPath();
  ctx.moveTo(posAhead.x,posAhead.y);
  ctx.lineTo(pos.x,pos.y);
  ctx.stroke();
}
ctx.shadowBlur=0;
}

function drawSpikes(){
if(spikes.length===0)return;
ctx.strokeStyle='#ff44ff';
ctx.lineWidth=1.5;
ctx.shadowColor='#ff44ff';
ctx.shadowBlur=4;
for(var i=0;i<spikes.length;i++){
  var s=spikes[i];
  var p0L=getLanePoint(s.lane,1-s.depthStart);
  var p0R=getLanePoint((s.lane+1)%numSegments,1-s.depthStart);
  var p1L=getLanePoint(s.lane,1-s.depthEnd);
  var p1R=getLanePoint((s.lane+1)%numSegments,1-s.depthEnd);
  var midStart={x:(p0L.x+p0R.x)/2,y:(p0L.y+p0R.y)/2};
  var midEnd={x:(p1L.x+p1R.x)/2,y:(p1L.y+p1R.y)/2};
  ctx.beginPath();
  ctx.moveTo(midStart.x,midStart.y);
  ctx.lineTo(midEnd.x,midEnd.y);
  ctx.stroke();
  // Zig-zag pattern on spike
  var steps=4;
  for(var k=0;k<steps;k++){
    var t0=k/steps,t1=(k+1)/steps;
    var x0=midStart.x+(midEnd.x-midStart.x)*t0;
    var y0=midStart.y+(midEnd.y-midStart.y)*t0;
    var x1=midStart.x+(midEnd.x-midStart.x)*t1;
    var y1=midStart.y+(midEnd.y-midStart.y)*t1;
    var offX=(k%2===0?1:-1)*3;
    var offY=(k%2===0?1:-1)*3;
    ctx.beginPath();
    ctx.moveTo(x0+offX,y0+offY);
    ctx.lineTo(x1-offX,y1-offY);
    ctx.stroke();
  }
}
ctx.shadowBlur=0;
}

function drawParticles(){
for(var i=0;i<particles.length;i++){
  var p=particles[i];
  var alpha=Math.max(0,p.life/p.maxLife);
  ctx.globalAlpha=alpha;
  if(p.electric){
    // Draw electric bolt segments
    ctx.strokeStyle=p.color;
    ctx.lineWidth=1.5;
    var bx=p.x,by=p.y;
    for(var b=0;b<(p.branches||2);b++){
      var ex=bx+(Math.random()-0.5)*20;
      var ey=by+(Math.random()-0.5)*20;
      ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();
      bx=ex;by=ey;
    }
  }else{
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
  }
}
ctx.globalAlpha=1;
}

function drawSuperzapIndicator(){
if(!superZapAvailable)return;
var fs=Math.round(W*0.016);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillStyle='#00ffff';
ctx.textAlign='left';
ctx.fillText('SUPERZAPPER READY',15,H-15);
}

function drawLevelInfo(){
var shapeName=LEVEL_SHAPES[level%LEVEL_SHAPES.length].name;
var fs=Math.round(W*0.014);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillStyle='#888';
ctx.textAlign='right';
ctx.fillText('LEVEL '+(level+1)+' - '+shapeName,W-15,H-15);
}

function drawLives(){
var fs=Math.round(W*0.015);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillStyle='#ffff00';
ctx.textAlign='left';
ctx.fillText('LIVES: '+lives,15,H-35);
}

function drawWarp(){
// Draw tube with player warping into it
var warpDepth=Math.min(warpTimer*0.5,1);
drawTube();
drawSpikes();

// Draw player moving into the tube
var pos=getLaneMid(playerLane,warpDepth);
var scale=1-warpDepth*0.7;
var sz=10*scale*(W/500);
ctx.save();
ctx.translate(pos.x,pos.y);
ctx.strokeStyle='#ffff00';
ctx.lineWidth=2;
ctx.shadowColor='#ffff00';ctx.shadowBlur=10;
ctx.beginPath();
ctx.moveTo(-sz,sz*0.5);ctx.lineTo(0,-sz*0.5);ctx.lineTo(sz,sz*0.5);
ctx.stroke();
ctx.shadowBlur=0;
ctx.restore();

// Speed lines
ctx.strokeStyle='rgba(255,255,100,0.3)';
ctx.lineWidth=1;
for(var i=0;i<numSegments;i++){
  if(Math.random()>0.3)continue;
  var t=Math.random();
  var pt=getLanePoint(i,t);
  var pt2=getLanePoint(i,Math.min(1,t+0.1));
  ctx.beginPath();ctx.moveTo(pt.x,pt.y);ctx.lineTo(pt2.x,pt2.y);ctx.stroke();
}
}

function drawLevelClear(){
drawTube();drawPlayer();drawSpikes();
var fs=Math.round(W*0.04);
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.fillStyle='#00ffff';
ctx.textAlign='center';
ctx.shadowColor='#00ffff';ctx.shadowBlur=15;
var alpha=Math.min(1,levelClearTimer*2);
ctx.globalAlpha=alpha;
ctx.fillText('LEVEL CLEAR',W/2,H*0.25);
ctx.globalAlpha=1;
ctx.shadowBlur=0;
}

function render(){
// Deep space background with subtle gradient
var bgGrad=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,H*0.8);
bgGrad.addColorStop(0,'#080818');bgGrad.addColorStop(0.5,'#040410');bgGrad.addColorStop(1,'#000000');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
// Subtle starfield
for(var si=0;si<20;si++){
var sx=(gameTime*5+si*137.5)%W;var sy=(si*97.3+gameTime*2)%H;
ctx.fillStyle='rgba(255,255,255,'+(0.1+0.15*Math.sin(gameTime*2+si))+')';
ctx.fillRect(sx,sy,1,1);
}

if(warpPhase){
  drawWarp();
  drawParticles();
  return;
}

if(levelClearing){
  drawLevelClear();
  drawParticles();
  return;
}

// Highlight player lane with glow
var p0=rimPoints[playerLane];
var p1=rimPoints[(playerLane+1)%numSegments];
ctx.save();
ctx.shadowColor='#ffff00';ctx.shadowBlur=8;
ctx.fillStyle='rgba(255,255,0,0.06)';
ctx.beginPath();
ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
ctx.lineTo(centerX,centerY);ctx.closePath();ctx.fill();
ctx.restore();

drawTube();
drawSpikes();
drawBullets();
drawEnemies();
drawPlayer();
drawParticles();
drawSuperzapIndicator();
drawLevelInfo();
drawLives();
}

function drawTitle(dt){
ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
titlePulse+=dt*3;

// Draw a decorative tube in background
buildTube();
ctx.globalAlpha=0.3;
drawTube();
ctx.globalAlpha=1;

// Rotating decorative element
ctx.save();
ctx.translate(centerX,centerY);
ctx.rotate(titlePulse*0.3);
ctx.strokeStyle='#4488ff';ctx.lineWidth=1;
for(var i=0;i<8;i++){
  var a=Math.PI*2*i/8;
  var r1=tubeRadius*0.15;
  var r2=tubeRadius*0.35+Math.sin(titlePulse+i)*20;
  ctx.beginPath();
  ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);
  ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);
  ctx.stroke();
}
ctx.restore();

ctx.save();ctx.textAlign='center';
var fs=Math.round(W*0.08);
ctx.shadowColor='#4488ff';ctx.shadowBlur=25+Math.sin(titlePulse)*10;
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.fillStyle='#4488ff';ctx.fillText('TEMPEST',W/2,H*0.28);
ctx.shadowBlur=0;

fs=Math.round(W*0.025);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillStyle='#ffff00';ctx.fillText('VECTOR TUBE SHOOTER',W/2,H*0.36);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
fs=Math.round(W*0.022);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);

ctx.fillStyle='#aaa';
fs=Math.round(W*0.016);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillText('Left/Right or A/D to move around rim',W/2,H*0.62);
ctx.fillText('Space to shoot, W/Up for Superzapper',W/2,H*0.67);

// Scoring info
ctx.fillStyle='#ff3333';ctx.fillText('Flipper: 150',W/2-W*0.12,H*0.77);
ctx.fillStyle='#33ff66';ctx.fillText('Tanker: 200',W/2,H*0.77);
ctx.fillStyle='#ff44ff';ctx.fillText('Spiker: 50',W/2+W*0.12,H*0.77);

ctx.restore();
}

function drawGameOver(){
render(); // draw the game state behind
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);

ctx.save();ctx.textAlign='center';
var fs=Math.round(W*0.065);
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.28);
ctx.shadowBlur=0;

fs=Math.round(W*0.035);
ctx.fillStyle='#ffff00';ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);

ctx.fillStyle='#aaa';
fs=Math.round(W*0.02);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillText('Level reached: '+(level+1),W/2,H*0.52);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
fs=Math.round(W*0.022);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.68);
ctx.restore();
}

function updateHUD(){
var el;
el=document.getElementById('hud-score');if(el)el.textContent=score;
el=document.getElementById('hud-speed');if(el)el.textContent='LVL '+(level+1);
el=document.getElementById('hud-time');if(el)el.textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){titlePulse+=dt*3;drawGameOver();updateHUD();}

animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(gameState!=='playing'&&!down)return;
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;if(down)lastMove=0;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;if(down)lastMove=0;}
if(e.key===' ')keyFire=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){if(down&&gameState==='playing')keyZap=true;}
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){
  if(gameState==='title'||gameState==='gameover'){
    level=0;
    resetGame();
    startLevel();
  }
}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
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

window.initTempest=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;if(v)lastMove=0;});
bindMobile('btn-right',function(v){keyRight=v;if(v)lastMove=0;});
bindMobile('btn-up',function(v){keyFire=v;});
canvas.addEventListener('click',function(){
  if(gameState!=='playing'){
    level=0;
    resetGame();
    startLevel();
  }
});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopTempest=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';
keyLeft=keyRight=keyFire=keyZap=false;
};
})();
