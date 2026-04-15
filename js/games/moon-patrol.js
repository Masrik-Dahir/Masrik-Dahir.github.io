// Moon Patrol — Side-scrolling moon buggy
(function(){
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var buggy,bullets=[],enemies=[],particles=[],stars=[];
var terrain=[],obstacles=[];
var keyLeft=false,keyRight=false,keyUp=false,keySpace=false;
var scrollSpeed=150,scrollX=0,groundY;
var jumpVel=0,jumping=false,gravity=600;
var lastShot=0,SHOOT_COOLDOWN=0.3;
var distanceTraveled=0,nextCheckpoint=1000;
var bgMountains=[],bgHills=[];
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
groundY=H*0.75;
initBackground();
initTerrain();
}

function initBackground(){
stars=[];
for(var i=0;i<80;i++){
stars.push({x:Math.random()*W,y:Math.random()*H*0.5,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
}
bgMountains=[];
for(var i=0;i<12;i++){
bgMountains.push({x:i*W/5,h:40+Math.random()*80,w:80+Math.random()*120});
}
bgHills=[];
for(var i=0;i<20;i++){
bgHills.push({x:i*W/8,h:20+Math.random()*40,w:50+Math.random()*80});
}
}

function initTerrain(){
terrain=[];
for(var i=0;i<Math.ceil(W/4)+200;i++){
terrain.push(groundY+Math.sin(i*0.02)*10);
}
}

function spawnObstacle(){
var type=Math.random()<0.5?'crater':'rock';
obstacles.push({
x:W+scrollX+50,
type:type,
w:type==='crater'?60:30,
h:type==='crater'?20:25,
active:true
});
}

function spawnEnemy(){
var type=Math.random()<0.6?'ufo':'bomber';
enemies.push({
x:W+20,
y:50+Math.random()*100,
type:type,
w:30,h:18,
vx:-100-Math.random()*80,
vy:type==='bomber'?20:-10+Math.random()*20,
hp:1,alive:true,
shootTimer:1+Math.random()*3,
frame:0
});
}

function resetGame(){
buggy={x:W*0.2,y:groundY-30,w:50,h:25,wheelAngle:0};
bullets=[];enemies=[];particles=[];obstacles=[];
score=0;lives=3;level=1;gameTime=0;
scrollX=0;scrollSpeed=150;distanceTraveled=0;nextCheckpoint=1000;
jumpVel=0;jumping=false;
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=30+Math.random()*150;
particles.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2.5});
}}

function drawBuggy(x,y,w,h){
ctx.save();
// Enhanced body with multi-layer gradient
var bodyGrad=ctx.createLinearGradient(x,y,x,y+h);
bodyGrad.addColorStop(0,'#ffaa33');bodyGrad.addColorStop(0.4,'#ff8800');bodyGrad.addColorStop(1,'#cc4400');
ctx.fillStyle=bodyGrad;
ctx.shadowColor='#ff6600';ctx.shadowBlur=6;
ctx.beginPath();ctx.roundRect(x,y+5,w,h-10,5);ctx.fill();
ctx.shadowBlur=0;

// Body detail - panel lines
ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x+w*0.3,y+5);ctx.lineTo(x+w*0.3,y+h-5);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w*0.6,y+5);ctx.lineTo(x+w*0.6,y+h-5);ctx.stroke();

// Cabin with gradient dome
var cabGrad=ctx.createRadialGradient(x+10+w*0.2,y-2,2,x+10+w*0.2,y+5,15);
cabGrad.addColorStop(0,'#ffdd44');cabGrad.addColorStop(1,'#cc9900');
ctx.fillStyle=cabGrad;
ctx.beginPath();ctx.roundRect(x+10,y-5,w*0.4,15,4);ctx.fill();

// Window with reflection
var winGrad=ctx.createLinearGradient(x+14,y-2,x+14+w*0.3,y+6);
winGrad.addColorStop(0,'#bbddff');winGrad.addColorStop(0.3,'#88ccff');winGrad.addColorStop(1,'#5599cc');
ctx.fillStyle=winGrad;
ctx.fillRect(x+14,y-2,w*0.3,8);
// Window reflection highlight
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.fillRect(x+16,y-1,w*0.08,3);

// Gun turret with detail
ctx.fillStyle='#999';ctx.fillRect(x+w-10,y,14,5);
ctx.fillStyle='#bbb';ctx.fillRect(x+w-8,y+1,10,2);
// Muzzle flash when shooting (brief)
if(lastShot<0.05){ctx.fillStyle='#ffff88';ctx.shadowColor='#ffff00';ctx.shadowBlur=8;
ctx.beginPath();ctx.arc(x+w+5,y+2,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}

// Antenna
ctx.strokeStyle='#aaa';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x+w*0.5,y-5);ctx.lineTo(x+w*0.55,y-16);ctx.stroke();
ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(x+w*0.55,y-16,2,0,Math.PI*2);ctx.fill();

// Wheels with enhanced rotation and tire tread
buggy.wheelAngle+=(scrollSpeed*0.01);
var wheelR=9;
// Wheel function helper
var drawWheel=function(wx,wy){
// Tire
ctx.fillStyle='#333';ctx.beginPath();ctx.arc(wx,wy,wheelR,0,Math.PI*2);ctx.fill();
// Tread marks
ctx.strokeStyle='#555';ctx.lineWidth=2;
for(var spoke=0;spoke<4;spoke++){
var sa=buggy.wheelAngle+spoke*Math.PI/2;
ctx.beginPath();
ctx.moveTo(wx+Math.cos(sa)*(wheelR-2),wy+Math.sin(sa)*(wheelR-2));
ctx.lineTo(wx+Math.cos(sa)*(wheelR+1),wy+Math.sin(sa)*(wheelR+1));
ctx.stroke();}
// Hub
ctx.fillStyle='#888';ctx.beginPath();ctx.arc(wx,wy,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#aaa';ctx.beginPath();ctx.arc(wx,wy,1.5,0,Math.PI*2);ctx.fill();
};
drawWheel(x+w-10,y+h-5);
drawWheel(x+10,y+h-5);

// Suspension springs
ctx.strokeStyle='#cc8800';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+8,y+h-12);ctx.lineTo(x+12,y+h-14);ctx.lineTo(x+8,y+h-16);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w-12,y+h-12);ctx.lineTo(x+w-8,y+h-14);ctx.lineTo(x+w-12,y+h-16);ctx.stroke();

// Under-glow effect
ctx.shadowColor='#ff6600';ctx.shadowBlur=12;
ctx.fillStyle='rgba(255,100,0,0.4)';
ctx.beginPath();ctx.ellipse(x+w/2,y+h+2,w*0.4,4,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;

ctx.restore();
}

function update(dt){
gameTime+=dt;
distanceTraveled+=scrollSpeed*dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);

// Speed ramp - scales with difficulty
scrollSpeed=Math.min(level<=2?200:250,150+gameTime*(level<=2?0.8:1.5)*diffMult);

// Player movement
if(keyLeft)buggy.x-=200*dt;
if(keyRight)buggy.x+=200*dt;
buggy.x=Math.max(20,Math.min(W*0.5,buggy.x));

// Jump
if(keyUp&&!jumping){
jumping=true;
jumpVel=-350;
}
if(jumping){
buggy.y+=jumpVel*dt;
jumpVel+=gravity*dt;
if(buggy.y>=groundY-30){
buggy.y=groundY-30;
jumping=false;
jumpVel=0;
addParticles(buggy.x+buggy.w/2,groundY,['#aa8866','#886644'][Math.floor(Math.random()*2)],5);
}
}

// Shooting
lastShot+=dt;
if(keySpace&&lastShot>=SHOOT_COOLDOWN){
lastShot=0;
// Forward bullet
bullets.push({x:buggy.x+buggy.w,y:buggy.y+5,vx:400,vy:0,type:'forward'});
// Upward bullet
bullets.push({x:buggy.x+buggy.w/2,y:buggy.y-5,vx:0,vy:-400,type:'up'});
}

// Scroll terrain
scrollX+=scrollSpeed*dt;

// Spawn obstacles - difficulty scales spawn rate
var obsRate=level<=2?0.005:0.008+level*0.001*diffMult;
if(Math.random()<obsRate)spawnObstacle();
// Spawn enemies - difficulty scales spawn rate
var enmRate=level<=2?0.002:0.004+level*0.001*diffMult;
if(Math.random()<enmRate)spawnEnemy();

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.x>W+20||b.y<-20)bullets.splice(i,1);
}

// Update obstacles
for(var i=obstacles.length-1;i>=0;i--){
var o=obstacles[i];
var screenX=o.x-scrollX;
if(screenX<-100){obstacles.splice(i,1);continue;}

// Collision with buggy
if(!jumping||buggy.y>groundY-50){
var ox=screenX;
if(buggy.x+buggy.w>ox&&buggy.x<ox+o.w){
lives--;
addParticles(buggy.x+buggy.w/2,buggy.y+buggy.h/2,['#ff0000','#ff6600','#ffff00'],15);
obstacles.splice(i,1);
if(lives<=0){gameState='gameover';}
continue;
}
}

// Bullet hits obstacle
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.type==='forward'&&b.x>ox&&b.x<ox+o.w&&b.y>groundY-30){
score+=25;
addParticles(ox+o.w/2,groundY,['#aa8866','#ffcc00'],8);
obstacles.splice(i,1);
bullets.splice(j,1);
break;
}
}
}

// Update enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}
e.x+=e.vx*dt;
e.y+=Math.sin(gameTime*2+i)*20*dt;
e.frame++;
if(e.x<-50){enemies.splice(i,1);continue;}

// Enemy shooting
e.shootTimer-=dt;
if(e.shootTimer<=0){
e.shootTimer=2+Math.random()*3;
// Drop a bomb toward buggy
var dx=buggy.x-e.x,dy=groundY-e.y;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist>0){
particles.push({x:e.x+e.w/2,y:e.y+e.h,vx:dx/dist*120,vy:dy/dist*120,
life:3,maxLife:3,color:'#ff4444',size:4});
}
}

// Bullet hits enemy
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){
e.alive=false;
score+=100;
addParticles(e.x+e.w/2,e.y+e.h/2,['#ff4400','#ffcc00','#fff'],12);
bullets.splice(j,1);
break;
}
}

// Enemy bomb hits buggy (check certain particles)
}

// Enemy projectile (bomb) hits buggy - check red particles near buggy
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
if(p.color==='#ff4444'&&p.size>=4){
if(Math.abs(p.x-buggy.x-buggy.w/2)<30&&Math.abs(p.y-buggy.y)<25){
lives--;
addParticles(buggy.x+buggy.w/2,buggy.y,['#ff0000','#ff6600'],10);
particles.splice(i,1);
if(lives<=0){gameState='gameover';}
continue;
}
}
}

// Checkpoints
if(distanceTraveled>=nextCheckpoint){
nextCheckpoint+=1000;
level++;
score+=500;
}

// Update particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.color!=='#ff4444')p.life-=dt;
else p.life-=dt*0.5;
if(p.life<=0)particles.splice(i,1);
}

// Stars scroll
for(var i=0;i<stars.length;i++){
stars[i].x-=scrollSpeed*0.05*dt;
if(stars[i].x<0)stars[i].x=W;
}
}

function render(){
// Sky gradient
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#000022');sky.addColorStop(0.6,'#110033');sky.addColorStop(1,'#220044');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Stars
for(var i=0;i<stars.length;i++){
var s=stars[i];
var alpha=s.b*(0.5+0.5*Math.sin(gameTime*1.5+i*0.3));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
}

// Earth in sky
ctx.save();
ctx.shadowColor='#4488ff';ctx.shadowBlur=30;
var earthGrad=ctx.createRadialGradient(W*0.8,H*0.15,5,W*0.8,H*0.15,35);
earthGrad.addColorStop(0,'#4488ff');earthGrad.addColorStop(0.7,'#2255aa');earthGrad.addColorStop(1,'#001133');
ctx.fillStyle=earthGrad;
ctx.beginPath();ctx.arc(W*0.8,H*0.15,35,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();

// Mountains (parallax far)
ctx.fillStyle='#1a0033';
for(var i=0;i<bgMountains.length;i++){
var m=bgMountains[i];
var mx=m.x-scrollX*0.1;
while(mx<-m.w)mx+=W*2.4;
ctx.beginPath();
ctx.moveTo(mx,groundY-20);
ctx.lineTo(mx+m.w/2,groundY-20-m.h);
ctx.lineTo(mx+m.w,groundY-20);
ctx.closePath();ctx.fill();
}

// Hills (parallax mid)
ctx.fillStyle='#220044';
for(var i=0;i<bgHills.length;i++){
var h=bgHills[i];
var hx=h.x-scrollX*0.3;
while(hx<-h.w)hx+=W*2.5;
ctx.beginPath();
ctx.moveTo(hx,groundY-10);
ctx.quadraticCurveTo(hx+h.w/2,groundY-10-h.h,hx+h.w,groundY-10);
ctx.closePath();ctx.fill();
}

// Ground
var grdGrad=ctx.createLinearGradient(0,groundY,0,H);
grdGrad.addColorStop(0,'#553300');grdGrad.addColorStop(1,'#331100');
ctx.fillStyle=grdGrad;
ctx.fillRect(0,groundY,W,H-groundY);

// Ground line
ctx.strokeStyle='#886644';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(0,groundY);ctx.lineTo(W,groundY);ctx.stroke();

// Obstacles
for(var i=0;i<obstacles.length;i++){
var o=obstacles[i];
var sx=o.x-scrollX;
if(sx<-100||sx>W+100)continue;
if(o.type==='crater'){
ctx.fillStyle='#220000';
ctx.beginPath();ctx.ellipse(sx+o.w/2,groundY,o.w/2,o.h/2,0,0,Math.PI);ctx.fill();
ctx.strokeStyle='#664400';ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(sx+o.w/2,groundY,o.w/2,o.h/2,0,0,Math.PI);ctx.stroke();
} else {
ctx.fillStyle='#666';
ctx.beginPath();
ctx.moveTo(sx,groundY);ctx.lineTo(sx+o.w/2,groundY-o.h);ctx.lineTo(sx+o.w,groundY);
ctx.closePath();ctx.fill();
ctx.strokeStyle='#888';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(sx,groundY);ctx.lineTo(sx+o.w/2,groundY-o.h);ctx.lineTo(sx+o.w,groundY);
ctx.closePath();ctx.stroke();
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
ctx.save();
if(e.type==='ufo'){
ctx.fillStyle='#88ff88';
ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2,e.h/3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#44cc44';
ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h*0.3,e.w/4,e.h/4,0,0,Math.PI*2);ctx.fill();
ctx.shadowColor='#44ff44';ctx.shadowBlur=10;
ctx.strokeStyle='#44ff44';ctx.lineWidth=1;
ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2+2,e.h/3+2,0,0,Math.PI*2);ctx.stroke();
} else {
ctx.fillStyle='#ff4444';
ctx.beginPath();
ctx.moveTo(e.x+e.w/2,e.y);
ctx.lineTo(e.x+e.w,e.y+e.h);
ctx.lineTo(e.x,e.y+e.h);
ctx.closePath();ctx.fill();
ctx.fillStyle='#ff8888';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h*0.5,4,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;ctx.restore();
}

// Bullets
ctx.fillStyle='#ffff00';
ctx.shadowColor='#ffff00';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.fillRect(b.x-2,b.y-2,4,4);
}
ctx.shadowBlur=0;

// Buggy
drawBuggy(buggy.x,buggy.y,buggy.w,buggy.h);

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];
var alpha=Math.min(1,p.life/p.maxLife);
ctx.globalAlpha=alpha;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Lives display
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff8800';
ctx.fillRect(10+i*28,10,22,12);
ctx.fillStyle='#ddd';
ctx.beginPath();ctx.arc(10+i*28+5,22+2,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(10+i*28+17,22+2,4,0,Math.PI*2);ctx.fill();
}

// Checkpoint indicator
ctx.fillStyle='#aaa';
ctx.font='12px "Courier New",monospace';
ctx.textAlign='right';
ctx.fillText('CP: '+Math.floor(distanceTraveled)+'/'+nextCheckpoint,W-10,20);
ctx.textAlign='left';
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#000022');sky.addColorStop(1,'#220044');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

for(var i=0;i<stars.length;i++){
var alpha=stars[i].b*(0.5+0.5*Math.sin(titlePulse+i*0.5));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(stars[i].x,stars[i].y,stars[i].s,0,Math.PI*2);ctx.fill();
}

// Ground
ctx.fillStyle='#553300';
ctx.fillRect(0,groundY||H*0.75,W,H);

ctx.save();ctx.textAlign='center';

ctx.shadowColor='#ff6600';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff8800';
ctx.fillText('MOON PATROL',W/2,H*0.28);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.032)+'px "Courier New",monospace';
ctx.fillStyle='#aaccff';
ctx.fillText('LUNAR DEFENSE FORCE',W/2,H*0.36);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT: Move | UP: Jump | SPACE: Shoot',W/2,H*0.63);

ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='rgba(0,0,0,0.6)';
ctx.beginPath();ctx.roundRect(W*0.2,H*0.32,W*0.6,H*0.38,15);ctx.fill();

ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);

ctx.fillStyle='#ffffff';
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Distance: '+Math.floor(distanceTraveled)+'m  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='LVL '+level;
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
if(e.key===' ')keySpace=down;
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

window.initMoonPatrol=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopMoonPatrol=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keySpace=false;
};
})();
