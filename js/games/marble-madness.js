// Marble Madness — Isometric marble racing with timer
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var marble,platforms=[],enemies=[],particles=[],checkpoints=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var bestScore=0,level=1,timeLeft=60,cameraY=0;
var GRAVITY_ISO=200,FRICTION=0.92,MARBLE_ACCEL=300,MARBLE_R=10;
var ISO_SCALE_X=1.0,ISO_SCALE_Y=0.5;// isometric projection
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
}

function toIso(x,y,z){
return{
sx:W/2+(x-y)*ISO_SCALE_X*0.7,
sy:H*0.3+(x+y)*ISO_SCALE_Y*0.35-z*0.5
};
}

function generateLevel(){
platforms=[];enemies=[];checkpoints=[];
var numPlatforms=15+level*5;
var y=0;
for(var i=0;i<numPlatforms;i++){
var pw=60+Math.random()*80;
var ph=40+Math.random()*60;
var px=(Math.random()-0.5)*200;
var py=y;
var pz=0;
platforms.push({x:px,y:py,z:pz,w:pw,h:ph,type:i===numPlatforms-1?'goal':'normal',
color:i===numPlatforms-1?'#ffcc00':'hsl('+(180+Math.random()*60)+',40%,'+(30+Math.random()*15)+'%)'});
// ramps between platforms
if(i>0&&i<numPlatforms-1){
if(Math.random()<0.3){
platforms.push({x:px+pw*0.3,y:py+ph*0.2,z:10,w:pw*0.4,h:ph*0.3,type:'raised',
color:'hsl('+(200+Math.random()*40)+',50%,35%)'});
}
}
y+=ph*0.6+10+Math.random()*20;
}
// enemies - scale with difficulty
var dm=diffMult();
var numEnemies=Math.floor((3+level*2)*dm);
for(var i=0;i<numEnemies;i++){
var pi=Math.floor(2+Math.random()*(platforms.length-3));
var p=platforms[pi];
enemies.push({x:p.x+p.w/2,y:p.y+p.h/2,z:5,r:8,vx:(30+Math.random()*20)*dm,
startX:p.x+10,endX:p.x+p.w-10,color:'#ff4466',type:'slider'});
}
// acid pools
var numAcid=Math.floor((level+1)*dm);
for(var i=0;i<numAcid;i++){
var pi=Math.floor(3+Math.random()*(platforms.length-5));
var p=platforms[pi];
enemies.push({x:p.x+Math.random()*p.w*0.5+p.w*0.25,y:p.y+Math.random()*p.h*0.3+p.h*0.3,
z:0,r:15,vx:0,startX:0,endX:0,color:'rgba(0,255,100,0.4)',type:'acid'});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;level=1;timeLeft=60;
marble={x:0,y:10,z:15,vx:0,vy:0,vz:0,onGround:false,r:MARBLE_R};
generateLevel();cameraY=0;
gameState='playing';
}

function nextLevel(){
level++;score+=Math.floor(timeLeft)*100;timeLeft=60+level*5;
marble={x:0,y:10,z:15,vx:0,vy:0,vz:0,onGround:false,r:MARBLE_R};
generateLevel();cameraY=0;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*100,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*3});
}

function marbleDie(){
lives--;addParticles(marble.x,marble.y,'#44aaff',15);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{
marble.x=0;marble.y=Math.max(0,marble.y-100);marble.z=20;
marble.vx=0;marble.vy=0;marble.vz=0;
}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
timeLeft-=dt;
if(timeLeft<=0){timeLeft=0;marbleDie();if(gameState==='playing'){lives=0;if(score>bestScore)bestScore=score;gameState='gameover';}}
// marble physics
if(keyLeft)marble.vx-=MARBLE_ACCEL*dt;
if(keyRight)marble.vx+=MARBLE_ACCEL*dt;
if(keyUp)marble.vy-=MARBLE_ACCEL*dt;
if(keyDown)marble.vy+=MARBLE_ACCEL*dt;
marble.vx*=FRICTION;marble.vy*=FRICTION;
// gravity
if(!marble.onGround)marble.vz-=GRAVITY_ISO*dt;
marble.x+=marble.vx*dt;
marble.y+=marble.vy*dt;
marble.z+=marble.vz*dt;
// platform collision
marble.onGround=false;
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
var pz=p.type==='raised'?p.z:0;
if(marble.x>p.x-5&&marble.x<p.x+p.w+5&&
marble.y>p.y-5&&marble.y<p.y+p.h+5){
if(marble.z<=pz+marble.r&&marble.z>pz-10){
marble.z=pz+marble.r;marble.vz=0;marble.onGround=true;
// goal check
if(p.type==='goal'){
addParticles(marble.x,marble.y,'#ffcc00',20);
nextLevel();return;
}
}
}
}
// fall off
if(marble.z<-50)marbleDie();
// enemy collision
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(e.type==='slider'){
e.x+=e.vx*dt;
if(e.x>e.endX||e.x<e.startX)e.vx*=-1;
}
var dx=marble.x-e.x,dy=marble.y-e.y;
if(Math.sqrt(dx*dx+dy*dy)<marble.r+e.r&&Math.abs(marble.z-e.z)<15){
if(e.type==='acid'){marble.vz=100;marbleDie();}
else{
// bounce off
marble.vx+=dx*3;marble.vy+=dy*3;
addParticles(e.x,e.y,'#ff4466',5);
}
}
}
// camera
var iso=toIso(marble.x,marble.y,marble.z);
var targetCamY=iso.sy-H*0.4;
cameraY+=(targetCamY-cameraY)*3*dt;
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// bg with rich gradient
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#060620');bg.addColorStop(0.5,'#0a0a2e');bg.addColorStop(1,'#151540');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// starfield background
ctx.fillStyle='rgba(100,120,200,0.15)';
for(var si=0;si<20;si++){
var sx=(si*127+gameTime*5)%W,sy=(si*97)%H;
ctx.beginPath();ctx.arc(sx,sy,1+Math.sin(gameTime+si)*0.5,0,Math.PI*2);ctx.fill();
}
// grid lines for depth with glow
ctx.strokeStyle='rgba(60,80,140,0.08)';ctx.lineWidth=1;
for(var i=-500;i<1500;i+=50){
var p1=toIso(i,-500,0);var p2=toIso(i,1500,0);
ctx.beginPath();ctx.moveTo(p1.sx,p1.sy-cameraY);ctx.lineTo(p2.sx,p2.sy-cameraY);ctx.stroke();
var p3=toIso(-500,i,0);var p4=toIso(1500,i,0);
ctx.beginPath();ctx.moveTo(p3.sx,p3.sy-cameraY);ctx.lineTo(p4.sx,p4.sy-cameraY);ctx.stroke();
}
// sort platforms by depth
var sortedPlatforms=platforms.slice().sort(function(a,b){return(a.x+a.y)-(b.x+b.y);});
// draw platforms
for(var i=0;i<sortedPlatforms.length;i++){
var p=sortedPlatforms[i];
var pz=p.type==='raised'?p.z:0;
var tl=toIso(p.x,p.y,pz);
var tr=toIso(p.x+p.w,p.y,pz);
var br=toIso(p.x+p.w,p.y+p.h,pz);
var bl=toIso(p.x,p.y+p.h,pz);
// top face
ctx.fillStyle=p.color;
ctx.beginPath();ctx.moveTo(tl.sx,tl.sy-cameraY);ctx.lineTo(tr.sx,tr.sy-cameraY);
ctx.lineTo(br.sx,br.sy-cameraY);ctx.lineTo(bl.sx,bl.sy-cameraY);ctx.closePath();ctx.fill();
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.stroke();
// side faces (right and front)
var depth=8;
var br2=toIso(p.x+p.w,p.y+p.h,pz-depth);
var bl2=toIso(p.x,p.y+p.h,pz-depth);
var tr2=toIso(p.x+p.w,p.y,pz-depth);
// front face
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.beginPath();ctx.moveTo(bl.sx,bl.sy-cameraY);ctx.lineTo(br.sx,br.sy-cameraY);
ctx.lineTo(br2.sx,br2.sy-cameraY);ctx.lineTo(bl2.sx,bl2.sy-cameraY);ctx.closePath();ctx.fill();
// right face
ctx.fillStyle='rgba(0,0,0,0.2)';
ctx.beginPath();ctx.moveTo(tr.sx,tr.sy-cameraY);ctx.lineTo(br.sx,br.sy-cameraY);
ctx.lineTo(br2.sx,br2.sy-cameraY);ctx.lineTo(tr2.sx,tr2.sy-cameraY);ctx.closePath();ctx.fill();
// goal marker
if(p.type==='goal'){
ctx.fillStyle='rgba(255,204,0,'+(0.3+Math.sin(gameTime*4)*0.2)+')';
ctx.beginPath();ctx.moveTo(tl.sx,tl.sy-cameraY);ctx.lineTo(tr.sx,tr.sy-cameraY);
ctx.lineTo(br.sx,br.sy-cameraY);ctx.lineTo(bl.sx,bl.sy-cameraY);ctx.closePath();ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold 12px "Courier New"';ctx.textAlign='center';
var gc=toIso(p.x+p.w/2,p.y+p.h/2,pz);
ctx.fillText('GOAL',gc.sx,gc.sy-cameraY);
}
}
// enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
var ep=toIso(e.x,e.y,e.z);
ctx.fillStyle=e.color;
if(e.type==='acid'){
ctx.beginPath();ctx.ellipse(ep.sx,ep.sy-cameraY,e.r*1.5,e.r*0.8,0,0,Math.PI*2);ctx.fill();
// bubbles
ctx.fillStyle='rgba(100,255,150,0.3)';
for(var b=0;b<3;b++){
ctx.beginPath();ctx.arc(ep.sx+Math.sin(gameTime*3+b*2)*8,ep.sy-cameraY-Math.sin(gameTime*2+b)*5,3,0,Math.PI*2);ctx.fill();
}
}else{
ctx.beginPath();ctx.arc(ep.sx,ep.sy-cameraY,e.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.stroke();
}
}
// marble
var mp=toIso(marble.x,marble.y,marble.z);
// shadow
ctx.fillStyle='rgba(0,0,0,0.3)';
var sp=toIso(marble.x,marble.y,0);
ctx.beginPath();ctx.ellipse(sp.sx,sp.sy-cameraY,marble.r*1.2,marble.r*0.6,0,0,Math.PI*2);ctx.fill();
// marble body with enhanced 3D
ctx.save();
var grad=ctx.createRadialGradient(mp.sx-marble.r*0.3,mp.sy-cameraY-marble.r*0.3,marble.r*0.1,mp.sx,mp.sy-cameraY,marble.r);
grad.addColorStop(0,'#bbddff');grad.addColorStop(0.3,'#88ccff');grad.addColorStop(0.6,'#3388dd');grad.addColorStop(1,'#0a3366');
ctx.fillStyle=grad;
ctx.shadowColor='#44aaff';ctx.shadowBlur=12;
ctx.beginPath();ctx.arc(mp.sx,mp.sy-cameraY,marble.r,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// marble specular highlight
ctx.fillStyle='rgba(255,255,255,0.6)';
ctx.beginPath();ctx.arc(mp.sx-marble.r*0.25,mp.sy-cameraY-marble.r*0.3,marble.r*0.25,0,Math.PI*2);ctx.fill();
// secondary highlight
ctx.fillStyle='rgba(200,230,255,0.2)';
ctx.beginPath();ctx.arc(mp.sx+marble.r*0.15,mp.sy-cameraY+marble.r*0.15,marble.r*0.15,0,Math.PI*2);ctx.fill();
// surface lines (rolling effect)
ctx.strokeStyle='rgba(100,180,255,0.15)';ctx.lineWidth=0.5;
var rollAngle=gameTime*3;
ctx.beginPath();ctx.arc(mp.sx,mp.sy-cameraY,marble.r*0.7,rollAngle,rollAngle+1);ctx.stroke();
ctx.beginPath();ctx.arc(mp.sx,mp.sy-cameraY,marble.r*0.5,rollAngle+2,rollAngle+3.5);ctx.stroke();
ctx.restore();
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];
var pp=toIso(p.x,p.y,5);
ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(pp.sx-p.size/2,pp.sy-cameraY-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD
// timer
ctx.fillStyle=timeLeft>15?'#44ff44':'#ff4444';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';
ctx.fillText('TIME: '+Math.ceil(timeLeft),W/2,25);
// level
ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.textAlign='left';
ctx.fillText('LEVEL '+level,10,20);
// lives
ctx.fillStyle='#44aaff';ctx.textAlign='right';
for(var i=0;i<lives;i++){
ctx.beginPath();ctx.arc(W-15-i*22,16,7,0,Math.PI*2);ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a2e');bg.addColorStop(1,'#1a1a3e');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// isometric grid decoration
ctx.strokeStyle='rgba(60,100,180,0.1)';ctx.lineWidth=1;
for(var i=0;i<10;i++){
var y=H*0.3+i*30;
ctx.beginPath();ctx.moveTo(W*0.1,y);ctx.lineTo(W*0.5,y+80);ctx.stroke();
ctx.beginPath();ctx.moveTo(W*0.9,y);ctx.lineTo(W*0.5,y+80);ctx.stroke();
}
// bouncing marble
var by=H*0.45+Math.abs(Math.sin(titlePulse*2))*30;
var grad=ctx.createRadialGradient(W/2-3,by-3,3,W/2,by,15);
grad.addColorStop(0,'#88ccff');grad.addColorStop(1,'#1155aa');
ctx.fillStyle=grad;ctx.beginPath();ctx.arc(W/2,by,15,0,Math.PI*2);ctx.fill();
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44aaff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#44aaff';
ctx.fillText('MARBLE MADNESS',W/2,H*0.25);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('ISOMETRIC RACER',W/2,H*0.33);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.6);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to roll marble, reach the goal before time runs out!',W/2,H*0.68);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.76);}
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
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=Math.ceil(timeLeft)+'s';
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
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initMarbleMadness=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopMarbleMadness=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
