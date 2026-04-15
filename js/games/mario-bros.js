// Mario Bros (Original) — Single-screen platform game
(function(){
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,phase=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],platforms=[];
var keyLeft=false,keyRight=false,keyUp=false;
var PLAYER_SPEED=220,JUMP_VEL=-420,GRAVITY=750;
var powBlock,powUses=3;
var spawnTimer=0,spawnRate=3.5;
var pipeLeft,pipeRight;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
buildLevel();
}

function buildLevel(){
platforms=[];
var platH=10;
// Bottom floor
platforms.push({x:0,y:H-30,w:W,h:30,type:'floor',bumpable:false});
// Platform 1 (lower)
platforms.push({x:W*0.12,y:H*0.72,w:W*0.76,h:platH,type:'plat',bumpable:true});
// Platform 2 (middle)
platforms.push({x:W*0.05,y:H*0.5,w:W*0.38,h:platH,type:'plat',bumpable:true});
platforms.push({x:W*0.57,y:H*0.5,w:W*0.38,h:platH,type:'plat',bumpable:true});
// Platform 3 (top)
platforms.push({x:W*0.15,y:H*0.3,w:W*0.7,h:platH,type:'plat',bumpable:true});

// Pipes (entry/exit points)
pipeLeft={x:0,y:H*0.3-40,w:30,h:40};
pipeRight={x:W-30,y:H*0.3-40,w:30,h:40};

// POW block
powBlock={x:W/2-15,y:H*0.72-25,w:30,h:25,uses:3,active:true};
}

function spawnEnemy(){
var side=Math.random()<0.5?'left':'right';
var type;
if(phase<=2)type='turtle';
else if(phase<=4)type=Math.random()<0.6?'turtle':'crab';
else type=Math.random()<0.3?'turtle':Math.random()<0.6?'crab':'fly';

var spdMult=phase<=2?0.7:(phase<=5?1.0:1.0+(phase-5)*0.1);
var speed=(type==='turtle'?60+phase*5:type==='crab'?45+phase*4:70+phase*5)*spdMult;
var ex=side==='left'?-20:W+20;
var ey=H*0.3-20;
var dir=side==='left'?1:-1;

enemies.push({
x:ex,y:ey,w:24,h:22,type:type,
speed:speed,dir:dir,alive:true,
flipped:false,flipTimer:0,flipDuration:6,
kicked:false,vy:0,grounded:false,
frame:0,hp:type==='crab'?2:1
});
}

function resetGame(){
player={x:W/2-10,y:H-60,w:20,h:28,vy:0,grounded:false,facing:1,
bumpCooldown:0};
enemies=[];particles=[];
score=0;lives=3;phase=1;gameTime=0;
spawnTimer=0;spawnRate=3.5;
powBlock={x:W/2-15,y:H*0.72-25,w:30,h:25,uses:3,active:true};
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=30+Math.random()*120;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2});
}}

function bumpPlatform(platIdx){
var p=platforms[platIdx];
// Flip any enemy on this platform
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||e.kicked)continue;
if(e.x+e.w>p.x&&e.x<p.x+p.w&&e.y+e.h>=p.y-5&&e.y+e.h<=p.y+15){
if(e.flipped){
// Already flipped - this bump does nothing extra
} else {
e.hp--;
if(e.hp<=0){
e.flipped=true;
e.flipTimer=0;
e.vy=-100;
}
}
addParticles(e.x+e.w/2,e.y+e.h/2,'#ffff00',5);
}
}
}

function usePOW(){
if(!powBlock.active||powBlock.uses<=0)return;
powBlock.uses--;
if(powBlock.uses<=0)powBlock.active=false;

// Flip ALL enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||e.kicked)continue;
e.flipped=true;e.flipTimer=0;e.vy=-120;
addParticles(e.x+e.w/2,e.y+e.h/2,'#ffff00',8);
}

// Screen shake particles
for(var i=0;i<20;i++){
addParticles(Math.random()*W,H-30,'#aa8866',1);
}
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: phases 1-2 easy, 3-5 medium, 6+ hard
var diffMult=phase<=2?0.7:(phase<=5?1.0:1.0+(phase-5)*0.1);

// Movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.facing=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.facing=1;}

// Wrap around screen
if(player.x<-player.w)player.x=W;
if(player.x>W)player.x=-player.w;

// Jump
if(keyUp&&player.grounded){
player.vy=JUMP_VEL;player.grounded=false;
}

// Gravity
player.vy+=GRAVITY*dt;
player.y+=player.vy*dt;

// Platform collision
player.grounded=false;
player.bumpCooldown-=dt;
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(player.x+player.w>p.x&&player.x<p.x+p.w){
// Landing on top
if(player.vy>=0&&player.y+player.h>=p.y&&player.y+player.h<=p.y+20){
player.y=p.y-player.h;player.vy=0;player.grounded=true;
}
// Bumping from below
if(player.vy<0&&p.bumpable&&player.bumpCooldown<=0){
if(player.y<=p.y+p.h&&player.y>=p.y-5){
player.vy=50;
player.bumpCooldown=0.3;
bumpPlatform(i);
}
}
}
}

// POW block collision
if(powBlock.active){
if(player.vy<0&&player.bumpCooldown<=0&&
player.x+player.w>powBlock.x&&player.x<powBlock.x+powBlock.w&&
player.y<=powBlock.y+powBlock.h&&player.y>=powBlock.y-5){
usePOW();
player.vy=50;
player.bumpCooldown=0.3;
}
}

// Spawn enemies - difficulty scales spawn rate and max
var maxEn=phase<=2?5:8;
spawnTimer+=dt;
var sRate=phase<=2?Math.max(2.5,4-phase*0.1):Math.max(1.5,3.5-phase*0.15);
if(spawnTimer>=sRate&&enemies.length<maxEn){
spawnTimer=0;
spawnEnemy();
spawnRate=sRate;
}

// Update enemies
var aliveCount=0;
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}
e.frame++;

if(e.kicked){
e.x+=e.dir*300*dt;
e.vy+=GRAVITY*dt;e.y+=e.vy*dt;
if(e.y>H+50||e.x<-50||e.x>W+50){enemies.splice(i,1);continue;}
// Kicked enemy hits other enemies
for(var j=0;j<enemies.length;j++){
if(i===j||!enemies[j].alive||enemies[j].kicked)continue;
if(e.x+e.w>enemies[j].x&&e.x<enemies[j].x+enemies[j].w&&
e.y+e.h>enemies[j].y&&e.y<enemies[j].y+enemies[j].h){
enemies[j].alive=false;
score+=800;
addParticles(enemies[j].x+enemies[j].w/2,enemies[j].y+enemies[j].h/2,
enemies[j].type==='turtle'?['#00aa44','#44ff88'][Math.floor(Math.random()*2)]:
'#ff4444',10);
}
}
continue;
}

if(e.flipped){
e.flipTimer+=dt;
// Flipped enemies don't move horizontally, just sit
e.vy+=GRAVITY*dt;e.y+=e.vy*dt;
// Land on platform
for(var pi=0;pi<platforms.length;pi++){
var pp=platforms[pi];
if(e.x+e.w>pp.x&&e.x<pp.x+pp.w&&e.vy>=0&&e.y+e.h>=pp.y&&e.y+e.h<=pp.y+15){
e.y=pp.y-e.h;e.vy=0;
}
}
// Recover after timer
if(e.flipTimer>=e.flipDuration){
e.flipped=false;
e.speed*=1.3; // Faster when recovered
e.hp=e.type==='crab'?2:1;
}
// Player kick
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
e.kicked=true;e.dir=player.facing;e.vy=-80;
score+=500;
addParticles(e.x+e.w/2,e.y+e.h/2,'#ffcc00',8);
}
} else {
aliveCount++;
// Normal movement
e.x+=e.dir*e.speed*dt;
// Wrap
if(e.x<-e.w)e.x=W;
if(e.x>W)e.x=-e.w;
// Gravity
e.vy+=GRAVITY*dt;e.y+=e.vy*dt;
// Platform collision
for(var pi=0;pi<platforms.length;pi++){
var pp=platforms[pi];
if(e.x+e.w>pp.x&&e.x<pp.x+pp.w&&e.vy>=0&&e.y+e.h>=pp.y&&e.y+e.h<=pp.y+15){
e.y=pp.y-e.h;e.vy=0;e.grounded=true;
}
}

// Player collision (not flipped = damage)
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
lives--;
addParticles(player.x+player.w/2,player.y+player.h/2,['#ff0000','#ff6600'][Math.floor(Math.random()*2)],15);
if(lives<=0){gameState='gameover';return;}
player.x=W/2-10;player.y=H-60;player.vy=0;
}
}
}

// Phase progression
if(gameTime>phase*20&&phase<20){
phase++;
}

// Particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].vy+=200*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function render(){
// Background
ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);

// Brick pattern background
ctx.fillStyle='#1a1100';
for(var by=0;by<H;by+=20){
for(var bx2=0;bx2<W;bx2+=40){
var offset=(Math.floor(by/20)%2)*20;
ctx.strokeStyle='#2a2200';ctx.lineWidth=1;
ctx.strokeRect(bx2+offset,by,40,20);
}
}

// Platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(p.type==='floor'){
var fGrad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);
fGrad.addColorStop(0,'#886644');fGrad.addColorStop(1,'#553322');
ctx.fillStyle=fGrad;ctx.fillRect(p.x,p.y,p.w,p.h);
} else {
ctx.fillStyle='#44aa44';
ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.fillStyle='#55cc55';
ctx.fillRect(p.x,p.y,p.w,3);
// Brick pattern on platform
ctx.strokeStyle='#338833';ctx.lineWidth=1;
for(var bx3=p.x;bx3<p.x+p.w;bx3+=20){
ctx.beginPath();ctx.moveTo(bx3,p.y);ctx.lineTo(bx3,p.y+p.h);ctx.stroke();
}
}
}

// Pipes with gradient and 3D effect
ctx.save();
// Left pipe
var lpGrad=ctx.createLinearGradient(pipeLeft.x,0,pipeLeft.x+pipeLeft.w,0);
lpGrad.addColorStop(0,'#118811');lpGrad.addColorStop(0.3,'#33cc33');lpGrad.addColorStop(0.7,'#22aa22');lpGrad.addColorStop(1,'#116611');
ctx.fillStyle=lpGrad;
ctx.fillRect(pipeLeft.x,pipeLeft.y,pipeLeft.w,pipeLeft.h);
// Pipe lip
var llGrad=ctx.createLinearGradient(pipeLeft.x-3,0,pipeLeft.x+pipeLeft.w+3,0);
llGrad.addColorStop(0,'#22aa22');llGrad.addColorStop(0.3,'#44ee44');llGrad.addColorStop(0.7,'#33cc33');llGrad.addColorStop(1,'#118811');
ctx.fillStyle=llGrad;
ctx.fillRect(pipeLeft.x-3,pipeLeft.y,pipeLeft.w+6,8);
// Pipe highlight
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(pipeLeft.x+5,pipeLeft.y+8,4,pipeLeft.h-8);

// Right pipe
var rpGrad=ctx.createLinearGradient(pipeRight.x,0,pipeRight.x+pipeRight.w,0);
rpGrad.addColorStop(0,'#118811');rpGrad.addColorStop(0.3,'#33cc33');rpGrad.addColorStop(0.7,'#22aa22');rpGrad.addColorStop(1,'#116611');
ctx.fillStyle=rpGrad;
ctx.fillRect(pipeRight.x,pipeRight.y,pipeRight.w,pipeRight.h);
var rlGrad=ctx.createLinearGradient(pipeRight.x-3,0,pipeRight.x+pipeRight.w+3,0);
rlGrad.addColorStop(0,'#22aa22');rlGrad.addColorStop(0.3,'#44ee44');rlGrad.addColorStop(0.7,'#33cc33');rlGrad.addColorStop(1,'#118811');
ctx.fillStyle=rlGrad;
ctx.fillRect(pipeRight.x-3,pipeRight.y,pipeRight.w+6,8);
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(pipeRight.x+5,pipeRight.y+8,4,pipeRight.h-8);
ctx.restore();

// POW block
if(powBlock.active){
ctx.save();
ctx.fillStyle='#4444ff';
ctx.fillRect(powBlock.x,powBlock.y,powBlock.w,powBlock.h);
ctx.fillStyle='#6666ff';
ctx.fillRect(powBlock.x+2,powBlock.y+2,powBlock.w-4,powBlock.h-4);
ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.textAlign='center';
ctx.fillText('POW',powBlock.x+powBlock.w/2,powBlock.y+powBlock.h/2+4);
ctx.textAlign='left';
ctx.fillStyle='#aaa';ctx.font='9px monospace';
ctx.fillText('x'+powBlock.uses,powBlock.x+powBlock.w+3,powBlock.y+powBlock.h);
ctx.restore();
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
ctx.save();
if(e.flipped&&!e.kicked){
// Flipped - upside down, flashing if about to recover
if(e.flipTimer>e.flipDuration*0.7&&Math.sin(e.flipTimer*15)>0)ctx.globalAlpha=0.5;
ctx.translate(e.x+e.w/2,e.y+e.h/2);
ctx.scale(1,-1);
ctx.translate(-e.x-e.w/2,-e.y-e.h/2);
}
if(e.type==='turtle'){
ctx.fillStyle=e.flipped?'#888':'#22aa44';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h*0.4,e.w/2,0,Math.PI*2);ctx.fill();
// Shell
ctx.fillStyle=e.flipped?'#666':'#116622';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h*0.5,e.w/2-2,0,Math.PI);ctx.fill();
// Eyes
if(!e.flipped){
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+e.w*0.35,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(e.x+e.w*0.35+e.dir,e.y+e.h*0.3,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65+e.dir,e.y+e.h*0.3,1.5,0,Math.PI*2);ctx.fill();
}
// Feet
ctx.fillStyle=e.flipped?'#777':'#ffcc00';
ctx.fillRect(e.x+2,e.y+e.h-6,6,6);
ctx.fillRect(e.x+e.w-8,e.y+e.h-6,6,6);
} else if(e.type==='crab'){
ctx.fillStyle=e.flipped?'#888':e.hp>1?'#ff4444':'#ff8844';
ctx.fillRect(e.x+2,e.y+4,e.w-4,e.h-8);
ctx.fillStyle=e.flipped?'#666':e.hp>1?'#cc2222':'#cc6622';
ctx.fillRect(e.x+4,e.y+6,e.w-8,e.h-12);
// Claws
if(!e.flipped){
ctx.fillStyle='#ff6666';
ctx.beginPath();ctx.arc(e.x-3,e.y+10,5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w+3,e.y+10,5,0,Math.PI*2);ctx.fill();
}
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+e.w*0.35,e.y+8,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65,e.y+8,2,0,Math.PI*2);ctx.fill();
// Legs
ctx.fillStyle=e.flipped?'#777':'#cc4444';
for(var l=0;l<3;l++){
ctx.fillRect(e.x+4+l*7,e.y+e.h-5,3,5);
}
} else {
// Fly
ctx.fillStyle=e.flipped?'#888':'#ff8800';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/2-2,0,Math.PI*2);ctx.fill();
// Wings
if(!e.flipped){
ctx.fillStyle='rgba(255,200,100,0.5)';
var wingY=Math.sin(e.frame*0.3)*3;
ctx.beginPath();ctx.ellipse(e.x-2,e.y+e.h*0.3+wingY,8,4,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(e.x+e.w+2,e.y+e.h*0.3+wingY,8,4,0,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+e.w*0.35,e.y+e.h*0.4,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65,e.y+e.h*0.4,2,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;ctx.restore();
}

// Player (Mario-like)
ctx.save();
// Hat
ctx.fillStyle='#ff0000';
ctx.fillRect(player.x-2,player.y,player.w+4,8);
ctx.beginPath();ctx.arc(player.x+player.w/2,player.y+4,12,Math.PI,0);ctx.fill();
// Face
ctx.fillStyle='#ffccaa';
ctx.fillRect(player.x+2,player.y+6,player.w-4,10);
// Eyes
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(player.x+player.w/2+player.facing*2-2,player.y+10,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(player.x+player.w/2+player.facing*2+3,player.y+10,1.5,0,Math.PI*2);ctx.fill();
// Mustache
ctx.fillStyle='#663300';
ctx.fillRect(player.x+4,player.y+13,player.w-8,2);
// Body
ctx.fillStyle='#ff0000';
ctx.fillRect(player.x+2,player.y+16,player.w-4,8);
// Overalls
ctx.fillStyle='#4444ff';
ctx.fillRect(player.x+2,player.y+20,player.w-4,8);
// Legs
ctx.fillStyle='#4444ff';
ctx.fillRect(player.x+2,player.y+player.h-6,7,6);
ctx.fillRect(player.x+player.w-9,player.y+player.h-6,7,6);
// Shoes
ctx.fillStyle='#663300';
ctx.fillRect(player.x,player.y+player.h-4,8,4);
ctx.fillRect(player.x+player.w-8,player.y+player.h-4,8,4);
ctx.restore();

// Particles
for(var i=0;i<particles.length;i++){
var p2=particles[i];ctx.globalAlpha=p2.life/p2.maxLife;
ctx.fillStyle=p2.color;ctx.beginPath();ctx.arc(p2.x,p2.y,p2.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.arc(15+i*22,15,8,Math.PI,0);ctx.fill();
ctx.fillRect(15+i*22-8,11,16,6);
}

// Phase indicator
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';
ctx.textAlign='right';ctx.fillText('PHASE '+phase,W-10,20);ctx.textAlign='left';
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);

// Brick background
ctx.fillStyle='#1a1100';
for(var by=0;by<H;by+=20){
for(var bx4=0;bx4<W;bx4+=40){
var offset=(Math.floor(by/20)%2)*20;
ctx.strokeStyle='#2a2200';ctx.lineWidth=1;
ctx.strokeRect(bx4+offset,by,40,20);
}
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff2222';
ctx.fillText('MARIO BROS',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#44ff44';
ctx.fillText('THE ORIGINAL ARCADE CLASSIC',W/2,H*0.34);

// Draw turtle and crab
ctx.fillStyle='#22aa44';
ctx.beginPath();ctx.arc(W*0.4,H*0.45,15,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff4444';
ctx.fillRect(W*0.55,H*0.43,24,18);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT: Move | UP: Jump',W/2,H*0.66);
ctx.fillText('Bump platforms from below to flip enemies, then kick them!',W/2,H*0.71);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.32,W*0.6,H*0.38,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Phase: '+phase+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='PHS '+phase;
var st=document.getElementById('hud-time');if(st)st.textContent=lives+' HP';
}

function gameLoop(ts){
var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt*3;drawGameOver();}
animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};var ku=function(e){onKey(e,false);};

function bindMobile(id,set){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});
}

window.initMarioBros=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopMarioBros=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=false;
};
})();
