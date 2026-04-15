// Pitfall — Side-scrolling jungle adventure
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,platforms=[],vines=[],treasures=[],logs=[],crocs=[],pits=[],particles=[];
var cameraX=0,scrollSpeed=0;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var GRAVITY=800,JUMP_VEL=-420,PLAYER_SPEED=220,GROUND_Y;
var trees=[],clouds=[];
var swingingVine=null,swingAngle=0,swingDir=1;
var levelLength=12000,bestScore=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;GROUND_Y=H*0.78;
}

function generateLevel(){
platforms=[];vines=[];treasures=[];logs=[];crocs=[];pits=[];trees=[];clouds=[];
// ground platforms with pits
var x=0;
while(x<levelLength){
var segLen=200+Math.random()*300;
platforms.push({x:x,y:GROUND_Y,w:segLen,h:40});
// sometimes add elevated platform
if(Math.random()<0.3){
platforms.push({x:x+50,y:GROUND_Y-80-Math.random()*60,w:80+Math.random()*60,h:14});
}
x+=segLen;
// pit or obstacle
if(x<levelLength-400){
var gapType=Math.random();
if(gapType<0.3){
// pit with croc
var pw=100+Math.random()*80;
pits.push({x:x,w:pw});
crocs.push({x:x+pw/2,y:GROUND_Y+10,w:60,phase:Math.random()*Math.PI*2});
x+=pw;
} else if(gapType<0.5){
// vine over gap
var pw=120+Math.random()*60;
pits.push({x:x,w:pw});
vines.push({x:x+pw/2,topY:GROUND_Y-220,len:140,angle:0});
x+=pw;
} else {
// rolling log
logs.push({x:x+30,y:GROUND_Y-20,r:18,vx:40+Math.random()*30,startX:x+30});
x+=60;
}
}
}
// treasures scattered on platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(Math.random()<0.5&&p.w>100){
var tx=p.x+30+Math.random()*(p.w-60);
var ty=p.y-20;
var type=Math.random()<0.3?'gold':Math.random()<0.5?'silver':'ring';
treasures.push({x:tx,y:ty,type:type,collected:false});
}
}
// trees for bg
for(var i=0;i<levelLength/150;i++){
trees.push({x:Math.random()*levelLength,h:60+Math.random()*80,w:20+Math.random()*15});
}
// clouds
for(var i=0;i<30;i++){
clouds.push({x:Math.random()*levelLength,y:20+Math.random()*80,w:50+Math.random()*80,h:15+Math.random()*15});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;cameraX=0;swingingVine=null;
player={x:100,y:GROUND_Y-30,vx:0,vy:0,w:20,h:28,onGround:false,facing:1};
generateLevel();gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:-Math.random()*120,life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function playerDie(){
lives--;addParticles(player.x,player.y,'#ff4444',15);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=cameraX+100;player.y=GROUND_Y-60;player.vx=0;player.vy=0;swingingVine=null;}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=gameTime<30?0.7:(gameTime<90?1.0:1.0+(gameTime-90)*0.005);
// handle vine swinging
if(swingingVine){
swingAngle+=swingDir*2.5*dt;
if(swingAngle>0.8)swingDir=-1;
if(swingAngle<-0.8)swingDir=1;
var v=swingingVine;
player.x=v.x+Math.sin(swingAngle)*v.len;
player.y=v.topY+Math.cos(swingAngle)*v.len;
if(keyUp||keyDown){
swingingVine=null;
player.vy=-250;
player.vx=Math.sin(swingAngle)*300;
}
return updateCamera(dt);
}
// horizontal movement
if(keyLeft){player.vx=-PLAYER_SPEED;player.facing=-1;}
else if(keyRight){player.vx=PLAYER_SPEED;player.facing=1;}
else player.vx*=0.7;
// jump
if(keyUp&&player.onGround){player.vy=JUMP_VEL;player.onGround=false;}
// gravity
player.vy+=GRAVITY*dt;
player.x+=player.vx*dt;
player.y+=player.vy*dt;
// platform collision
player.onGround=false;
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(player.x+player.w/2>p.x&&player.x-player.w/2<p.x+p.w){
if(player.vy>=0&&player.y+player.h>p.y&&player.y+player.h<p.y+p.h+player.vy*dt+5){
player.y=p.y-player.h;player.vy=0;player.onGround=true;
}
}
}
// fall into pit
if(player.y>H+50)playerDie();
// vine grab
for(var i=0;i<vines.length;i++){
var v=vines[i];
var vbx=v.x,vby=v.topY+v.len;
if(Math.abs(player.x-vbx)<30&&Math.abs(player.y-vby)<40&&!player.onGround){
swingingVine=v;swingAngle=0;swingDir=1;break;
}
}
// treasure collect
for(var i=0;i<treasures.length;i++){
var t=treasures[i];
if(!t.collected&&Math.abs(player.x-t.x)<25&&Math.abs(player.y-t.y)<30){
t.collected=true;
var pts=t.type==='gold'?500:t.type==='silver'?200:100;
score+=pts;addParticles(t.x,t.y,'#ffcc00',8);
}
}
// log collision
for(var i=0;i<logs.length;i++){
var l=logs[i];
l.x+=l.vx*diffMult*dt;
if(l.x>l.startX+200)l.vx=-Math.abs(l.vx);
if(l.x<l.startX-50)l.vx=Math.abs(l.vx);
var dx=player.x-l.x,dy=(player.y+player.h/2)-(l.y);
if(dx*dx+dy*dy<(l.r+12)*(l.r+12)){playerDie();break;}
}
// croc collision
for(var i=0;i<crocs.length;i++){
var c=crocs[i];
c.phase+=dt*2*diffMult;
// croc mouth opening/closing
if(Math.abs(player.x-c.x)<35&&Math.abs(player.y+player.h-c.y)<25){
// can walk on closed croc mouth
if(Math.sin(c.phase)>0.3){playerDie();break;}
else{player.y=c.y-player.h-10;player.vy=0;player.onGround=true;}
}
}
updateCamera(dt);
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function updateCamera(dt){
var targetCam=player.x-W*0.35;
cameraX+=(targetCam-cameraX)*4*dt;
if(cameraX<0)cameraX=0;
}

function render(){
// sky gradient
var skyGrad=ctx.createLinearGradient(0,0,0,H*0.5);
skyGrad.addColorStop(0,'#0a2a1a');skyGrad.addColorStop(1,'#1a5a2a');
ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);
// lower area - dark
ctx.fillStyle='#0a1a0a';ctx.fillRect(0,H*0.5,W,H*0.5);
// clouds
ctx.fillStyle='rgba(200,255,200,0.08)';
for(var i=0;i<clouds.length;i++){
var c=clouds[i];var sx=c.x-cameraX*0.3;
if(sx>-100&&sx<W+100){
ctx.beginPath();ctx.ellipse(sx,c.y,c.w/2,c.h/2,0,0,Math.PI*2);ctx.fill();
}
}
// bg trees (parallax)
for(var i=0;i<trees.length;i++){
var t=trees[i];var sx=t.x-cameraX*0.5;
if(sx>-50&&sx<W+50){
ctx.fillStyle='#0d3d0d';
ctx.fillRect(sx-t.w/4,GROUND_Y-t.h,t.w/2,t.h);
ctx.beginPath();ctx.moveTo(sx-t.w,GROUND_Y-t.h+10);ctx.lineTo(sx,GROUND_Y-t.h-40);ctx.lineTo(sx+t.w,GROUND_Y-t.h+10);ctx.closePath();
ctx.fillStyle='#1a6a1a';ctx.fill();
}
}
// platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];var sx=p.x-cameraX;
if(sx+p.w>-10&&sx<W+10){
var pg=ctx.createLinearGradient(sx,p.y,sx,p.y+p.h);
pg.addColorStop(0,'#5a3a1a');pg.addColorStop(1,'#3a2a0a');
ctx.fillStyle=pg;ctx.fillRect(sx,p.y,p.w,p.h);
ctx.strokeStyle='#7a5a2a';ctx.lineWidth=1;ctx.strokeRect(sx,p.y,p.w,p.h);
// grass on top
ctx.fillStyle='#2a8a2a';ctx.fillRect(sx,p.y-3,p.w,4);
}
}
// pits (water)
for(var i=0;i<pits.length;i++){
var p=pits[i];var sx=p.x-cameraX;
if(sx+p.w>0&&sx<W){
ctx.fillStyle='rgba(20,60,120,0.7)';ctx.fillRect(sx,GROUND_Y+5,p.w,40);
// water shimmer
ctx.fillStyle='rgba(40,100,180,0.3)';
for(var w=0;w<p.w;w+=12){
ctx.fillRect(sx+w,GROUND_Y+10+Math.sin(gameTime*3+w*0.1)*3,8,2);
}
}
}
// crocs
for(var i=0;i<crocs.length;i++){
var c=crocs[i];var sx=c.x-cameraX;
if(sx>-40&&sx<W+40){
var mouthOpen=Math.sin(c.phase)>0.3;
ctx.fillStyle='#2a6a2a';
// body
ctx.fillRect(sx-25,c.y-5,50,14);
// head
ctx.fillRect(sx+20,c.y-10,18,18);
// mouth
if(mouthOpen){
ctx.fillStyle='#aa2222';ctx.fillRect(sx+25,c.y-10,15,7);
ctx.fillStyle='#ffffff';
for(var t=0;t<4;t++)ctx.fillRect(sx+27+t*3,c.y-4,2,3);
}
// eye
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(sx+30,c.y-6,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(sx+30,c.y-6,1,0,Math.PI*2);ctx.fill();
}
}
// vines
for(var i=0;i<vines.length;i++){
var v=vines[i];var sx=v.x-cameraX;
if(sx>-20&&sx<W+20){
var angle=swingingVine===v?swingAngle:Math.sin(gameTime*1.5+i)*0.15;
var ex=sx+Math.sin(angle)*v.len;
var ey=v.topY+Math.cos(angle)*v.len;
ctx.strokeStyle='#4a8a2a';ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(sx,v.topY);ctx.lineTo(ex,ey);ctx.stroke();
// leaves at top
ctx.fillStyle='#2a9a2a';
ctx.beginPath();ctx.ellipse(sx,v.topY,12,6,0,0,Math.PI*2);ctx.fill();
}
}
// logs
for(var i=0;i<logs.length;i++){
var l=logs[i];var sx=l.x-cameraX;
if(sx>-30&&sx<W+30){
ctx.fillStyle='#6a4a2a';ctx.beginPath();ctx.arc(sx,l.y,l.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#4a3a1a';ctx.lineWidth=2;
// rings
ctx.beginPath();ctx.arc(sx,l.y,l.r*0.6,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(sx,l.y,l.r*0.3,0,Math.PI*2);ctx.stroke();
}
}
// treasures
for(var i=0;i<treasures.length;i++){
var t=treasures[i];if(t.collected)continue;
var sx=t.x-cameraX;
if(sx>-20&&sx<W+20){
ctx.save();
if(t.type==='gold'){ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;}
else if(t.type==='silver'){ctx.fillStyle='#c0c0c0';ctx.shadowColor='#c0c0c0';ctx.shadowBlur=6;}
else{ctx.fillStyle='#ff66aa';ctx.shadowColor='#ff66aa';ctx.shadowBlur=6;}
var bob=Math.sin(gameTime*3+t.x)*4;
if(t.type==='ring'){
ctx.beginPath();ctx.arc(sx,t.y+bob,8,0,Math.PI*2);ctx.lineWidth=3;ctx.strokeStyle=ctx.fillStyle;ctx.stroke();
}else{
ctx.fillRect(sx-7,t.y-7+bob,14,14);
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(sx-4,t.y-5+bob,5,5);
}
ctx.restore();
}
}
// player
var px=player.x-cameraX,py=player.y;
ctx.save();ctx.translate(px,py+player.h/2);
if(player.facing<0)ctx.scale(-1,1);
// body
ctx.fillStyle='#ff6633';ctx.fillRect(-8,-player.h/2,16,14);
// legs
var legPhase=Math.abs(player.vx)>10?Math.sin(gameTime*12):0;
ctx.fillStyle='#3366aa';
ctx.fillRect(-7,0,6,10+legPhase*3);ctx.fillRect(1,0,6,10-legPhase*3);
// head
ctx.fillStyle='#ffcc99';ctx.beginPath();ctx.arc(0,-player.h/2-2,8,0,Math.PI*2);ctx.fill();
// hat
ctx.fillStyle='#886633';ctx.fillRect(-10,-player.h/2-9,20,5);ctx.fillRect(-6,-player.h/2-13,12,5);
ctx.restore();
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-cameraX-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD overlay
ctx.fillStyle='#ffcc00';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++){
ctx.fillText('\u2665',15+i*20,H-15);
}
// distance marker
var dist=Math.floor(player.x/10);
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText(dist+'m',W-15,H-10);
}

function drawTitle(dt){
titlePulse+=dt*3;
var skyGrad=ctx.createLinearGradient(0,0,0,H);
skyGrad.addColorStop(0,'#0a2a1a');skyGrad.addColorStop(1,'#1a4a2a');
ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);
// jungle vines decorative
for(var i=0;i<8;i++){
var vx=W*0.1+i*W*0.12;
ctx.strokeStyle='rgba(40,140,40,0.3)';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(vx,0);
ctx.quadraticCurveTo(vx+Math.sin(titlePulse+i)*20,H*0.3,vx+Math.sin(titlePulse*0.7+i)*15,H*0.6);
ctx.stroke();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('PITFALL!',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#2a8a2a';
ctx.fillText('JUNGLE ADVENTURE',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to move, Up to jump, Down to drop from vine',W/2,H*0.65);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.73);}
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Distance: '+Math.floor(player.x/10)+'m',W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=Math.floor(player.x/10)+'m';
document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;if(down)keyRight=false;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;if(down)keyLeft=false;}
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initPitfall=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPitfall=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
