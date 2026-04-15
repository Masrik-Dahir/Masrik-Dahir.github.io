// Berzerk — Top-down maze shooter with robots and Evil Otto
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],robots=[],robotBullets=[],particles=[],walls=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false;
var lastShot=0,room=0,ottoTimer=0,otto=null,bestScore=0;
var PLAYER_SPEED=160,ROBOT_SPEED=55,BULLET_SPEED=300,ROBOT_SHOOT_RATE=2.5;
var CELL=40,COLS,ROWS;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;COLS=Math.floor(W/CELL);ROWS=Math.floor(H/CELL);
}

function generateRoom(){
walls=[];robots=[];robotBullets=[];otto=null;ottoTimer=0;
// border walls
for(var c=0;c<COLS;c++){
walls.push({x:c*CELL,y:0,w:CELL,h:4});
walls.push({x:c*CELL,y:H-4,w:CELL,h:4});
}
for(var r=0;r<ROWS;r++){
walls.push({x:0,y:r*CELL,w:4,h:CELL});
walls.push({x:W-4,y:r*CELL,w:4,h:CELL});
}
// internal walls — simple grid pattern with gaps
for(var c=2;c<COLS-2;c+=3){
for(var r=2;r<ROWS-2;r+=3){
if(Math.random()<0.5){
var wl=CELL*(1+Math.floor(Math.random()*2));
walls.push({x:c*CELL,y:r*CELL,w:wl,h:4});
}
if(Math.random()<0.5){
var wl=CELL*(1+Math.floor(Math.random()*2));
walls.push({x:c*CELL,y:r*CELL,w:4,h:wl});
}
}
}
// exits (gaps in borders)
// right exit
walls=walls.filter(function(w){
if(w.x>=W-6&&w.y>H/2-CELL&&w.y<H/2+CELL)return false;
if(w.y<=2&&w.x>W/2-CELL&&w.x<W/2+CELL)return false;
if(w.y>=H-6&&w.x>W/2-CELL&&w.x<W/2+CELL)return false;
if(w.x<=2&&w.y>H/2-CELL&&w.y<H/2+CELL)return false;
return true;
});
// spawn robots
var numRobots=3+Math.min(room,8);
for(var i=0;i<numRobots;i++){
var rx,ry;
do{rx=CELL*2+Math.random()*(W-CELL*4);ry=CELL*2+Math.random()*(H-CELL*4);}
while(Math.abs(rx-player.x)<100&&Math.abs(ry-player.y)<100);
robots.push({x:rx,y:ry,w:18,h:22,vx:0,vy:0,shootTimer:1+Math.random()*ROBOT_SHOOT_RATE,hp:1,
color:'hsl('+(Math.random()*360)+',70%,50%)'});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;room=0;
player={x:W/2,y:H/2,w:16,h:20,dir:0,firing:false};
bullets=[];particles=[];
generateRoom();gameState='playing';
}

function wallCollide(x,y,w,h){
for(var i=0;i<walls.length;i++){
var wl=walls[i];
if(x+w>wl.x&&x<wl.x+wl.w&&y+h>wl.y&&y<wl.y+wl.h)return true;
}
return false;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function playerDie(){
lives--;addParticles(player.x,player.y,'#00ccff',20);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{player.x=W/2;player.y=H/2;}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=room<=2?0.7:(room<=5?1.0:1.0+(room-5)*0.12);
// player movement
var dx=0,dy=0;
if(keyLeft)dx=-1;if(keyRight)dx=1;if(keyUp)dy=-1;if(keyDown)dy=1;
if(dx||dy){
var len=Math.sqrt(dx*dx+dy*dy);dx/=len;dy/=len;
player.dir=Math.atan2(dy,dx);
var nx=player.x+dx*PLAYER_SPEED*dt;
var ny=player.y+dy*PLAYER_SPEED*dt;
if(!wallCollide(nx-player.w/2,player.y-player.h/2,player.w,player.h))player.x=nx;
if(!wallCollide(player.x-player.w/2,ny-player.h/2,player.w,player.h))player.y=ny;
}
// check exit
if(player.x>W+5||player.x<-5||player.y>H+5||player.y<-5){
room++;score+=room*50;
player.x=player.x>W?30:player.x<0?W-30:player.x;
player.y=player.y>H?30:player.y<0?H-30:player.y;
generateRoom();
}
// fire
if(keyFire&&gameTime-lastShot>0.2){
lastShot=gameTime;
bullets.push({x:player.x,y:player.y,vx:Math.cos(player.dir)*BULLET_SPEED,vy:Math.sin(player.dir)*BULLET_SPEED,life:1.5,owner:'player'});
}
// Evil Otto timer
ottoTimer+=dt;
if(ottoTimer>12/diffMult&&!otto){
otto={x:10,y:H/2,speed:(80+room*5)*diffMult};
}
// Evil Otto movement
if(otto){
var odx=player.x-otto.x,ody=player.y-otto.y;
var ol=Math.sqrt(odx*odx+ody*ody);
if(ol>0){otto.x+=odx/ol*otto.speed*dt;otto.y+=ody/ol*otto.speed*dt;}
// otto hits player
if(Math.abs(otto.x-player.x)<20&&Math.abs(otto.y-player.y)<20)playerDie();
}
// robots AI
for(var i=robots.length-1;i>=0;i--){
var r=robots[i];
// move toward player slowly
var rdx=player.x-r.x,rdy=player.y-r.y;
var rl=Math.sqrt(rdx*rdx+rdy*rdy);
if(rl>0){
var spd=(ROBOT_SPEED+room*3)*diffMult;if(spd>100)spd=100;
var nx=r.x+rdx/rl*spd*dt;
var ny=r.y+rdy/rl*spd*dt;
if(!wallCollide(nx-r.w/2,r.y-r.h/2,r.w,r.h))r.x=nx;
if(!wallCollide(r.x-r.w/2,ny-r.h/2,r.w,r.h))r.y=ny;
}
// shoot
r.shootTimer-=dt;
if(r.shootTimer<=0){
r.shootTimer=(ROBOT_SHOOT_RATE-room*0.05)/diffMult;if(r.shootTimer<0.8)r.shootTimer=0.8;
var angle=Math.atan2(player.y-r.y,player.x-r.x);
// robots have inaccurate aim (easy mode), less inaccurate at higher difficulty
angle+=(Math.random()-0.5)*(0.6/diffMult);
robotBullets.push({x:r.x,y:r.y,vx:Math.cos(angle)*180*diffMult,vy:Math.sin(angle)*180*diffMult,life:2});
}
// robot-robot collision kills them
for(var j=i+1;j<robots.length;j++){
if(Math.abs(r.x-robots[j].x)<r.w&&Math.abs(r.y-robots[j].y)<r.h){
addParticles(robots[j].x,robots[j].y,robots[j].color,10);
score+=50;robots.splice(j,1);break;
}
}
}
// player bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0||wallCollide(b.x-2,b.y-2,4,4)){
addParticles(b.x,b.y,'#ffcc00',4);bullets.splice(i,1);continue;
}
// hit robots
for(var r=robots.length-1;r>=0;r--){
if(Math.abs(b.x-robots[r].x)<robots[r].w&&Math.abs(b.y-robots[r].y)<robots[r].h){
score+=50;addParticles(robots[r].x,robots[r].y,robots[r].color,12);
robots.splice(r,1);bullets.splice(i,1);break;
}
}
}
// robot bullets
for(var i=robotBullets.length-1;i>=0;i--){
var b=robotBullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0||wallCollide(b.x-2,b.y-2,4,4)){robotBullets.splice(i,1);continue;}
if(Math.abs(b.x-player.x)<player.w&&Math.abs(b.y-player.y)<player.h){
robotBullets.splice(i,1);playerDie();break;
}
}
// wall collision kills player
if(wallCollide(player.x-player.w/2,player.y-player.h/2,player.w,player.h)){
playerDie();
}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#000008';ctx.fillRect(0,0,W,H);
// walls
ctx.fillStyle='#2244ff';ctx.shadowColor='#2244ff';ctx.shadowBlur=4;
for(var i=0;i<walls.length;i++){var w=walls[i];ctx.fillRect(w.x,w.y,w.w,w.h);}
ctx.shadowBlur=0;
// robots
for(var i=0;i<robots.length;i++){
var r=robots[i];
ctx.fillStyle=r.color;
// head
ctx.beginPath();ctx.arc(r.x,r.y-r.h/2+5,7,0,Math.PI*2);ctx.fill();
// body
ctx.fillRect(r.x-r.w/2,r.y-r.h/2+10,r.w,r.h-10);
// eyes
ctx.fillStyle='#ff0000';
ctx.fillRect(r.x-4,r.y-r.h/2+2,3,3);ctx.fillRect(r.x+1,r.y-r.h/2+2,3,3);
// antenna
ctx.strokeStyle=r.color;ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(r.x,r.y-r.h/2-2);ctx.lineTo(r.x,r.y-r.h/2-8);ctx.stroke();
ctx.fillStyle=r.color;ctx.beginPath();ctx.arc(r.x,r.y-r.h/2-8,2,0,Math.PI*2);ctx.fill();
}
// Evil Otto
if(otto){
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=10;
ctx.beginPath();ctx.arc(otto.x,otto.y,16,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// smiley face
ctx.fillStyle='#000';
ctx.fillRect(otto.x-6,otto.y-4,4,4);ctx.fillRect(otto.x+2,otto.y-4,4,4);
ctx.beginPath();ctx.arc(otto.x,otto.y+2,7,0.2,Math.PI-0.2);ctx.lineWidth=2;ctx.strokeStyle='#000';ctx.stroke();
}
// player
ctx.fillStyle='#00ccff';ctx.shadowColor='#00ccff';ctx.shadowBlur=6;
ctx.save();ctx.translate(player.x,player.y);
// body
ctx.fillRect(-player.w/2,-player.h/2,player.w,player.h);
// face direction indicator
ctx.fillStyle='#ffffff';
var fx=Math.cos(player.dir)*6,fy=Math.sin(player.dir)*6;
ctx.beginPath();ctx.arc(fx,fy-3,3,0,Math.PI*2);ctx.fill();
ctx.restore();ctx.shadowBlur=0;
// player bullets
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
for(var i=0;i<bullets.length;i++){ctx.beginPath();ctx.arc(bullets[i].x,bullets[i].y,3,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
// robot bullets
ctx.fillStyle='#ff3333';
for(var i=0;i<robotBullets.length;i++){ctx.beginPath();ctx.arc(robotBullets[i].x,robotBullets[i].y,3,0,Math.PI*2);ctx.fill();}
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD
ctx.fillStyle='#00ccff';ctx.font='12px "Courier New"';ctx.textAlign='left';
ctx.fillText('ROOM '+(room+1),10,H-10);
ctx.fillStyle='#ffcc00';ctx.textAlign='right';
ctx.fillText('ROBOTS: '+robots.length,W-10,H-10);
for(var i=0;i<lives;i++){ctx.fillStyle='#00ccff';ctx.fillRect(10+i*18,H-30,12,14);}
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#000010';ctx.fillRect(0,0,W,H);
// maze lines decoration
ctx.strokeStyle='rgba(34,68,255,0.2)';ctx.lineWidth=2;
for(var i=0;i<10;i++){
ctx.beginPath();ctx.moveTo(i*W/10,0);ctx.lineTo(i*W/10,H);ctx.stroke();
ctx.beginPath();ctx.moveTo(0,i*H/10);ctx.lineTo(W,i*H/10);ctx.stroke();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff3333';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('BERZERK',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#2244ff';
ctx.fillText('DESTROY THE ROBOTS',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Space/Up to shoot in facing direction',W/2,H*0.65);
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
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Rooms cleared: '+room,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='ROOM '+(room+1);
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

window.initBerzerk=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;keyFire=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopBerzerk=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
