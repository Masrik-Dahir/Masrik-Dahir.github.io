// Tank/Combat — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,gameTime=0,titlePulse=0;
var player,ai,walls=[],bullets=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var PLAYER_SPEED=100,AI_SPEED=60,TURN_SPEED=3,BULLET_SPEED=200;
var playerScore=0,aiScore=0,roundTimer=90;
var lastShot=0,aiLastShot=0;
var WALL_SIZE=0;
var MAZE_COLS=12,MAZE_ROWS=9;
var maze=[];
var flashTimer=0;

function getDiffMult(){
var r=playerScore+aiScore;
if(r<=3)return 0.7;
if(r<=8)return 1.0;
return 1.0+(r-8)*0.15;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
WALL_SIZE=Math.min(W/MAZE_COLS,H/MAZE_ROWS);
}

function buildMaze(){
maze=[];walls=[];
for(var r2=0;r2<MAZE_ROWS;r2++){
maze[r2]=[];
for(var c=0;c<MAZE_COLS;c++){maze[r2][c]=0;}
}
// Border walls
for(var c=0;c<MAZE_COLS;c++){maze[0][c]=1;maze[MAZE_ROWS-1][c]=1;}
for(var r2=0;r2<MAZE_ROWS;r2++){maze[r2][0]=1;maze[r2][MAZE_COLS-1]=1;}
// Internal walls — designed so both sides are fully connected
var patterns=[
[2,2],[2,3],[2,7],[2,8],
[3,5],
[4,2],[4,5],[4,8],
[5,4],[5,6],
[6,3],[6,5],[6,7]
];
for(var i=0;i<patterns.length;i++){
var pr=patterns[i][0],pc=patterns[i][1];
if(pr<MAZE_ROWS&&pc<MAZE_COLS)maze[pr][pc]=1;
}
for(var r2=0;r2<MAZE_ROWS;r2++){
for(var c=0;c<MAZE_COLS;c++){
if(maze[r2][c]===1){
walls.push({x:c*WALL_SIZE,y:r2*WALL_SIZE,w:WALL_SIZE,h:WALL_SIZE});
}
}
}
}

function resetGame(){
buildMaze();
playerScore=0;aiScore=0;roundTimer=90;gameTime=0;score=0;
bullets=[];particles=[];flashTimer=0;
player={x:WALL_SIZE*1.5,y:WALL_SIZE*1.5,rot:0,speed:0,size:WALL_SIZE*0.35};
ai={x:W-WALL_SIZE*2.5,y:H-WALL_SIZE*2.5,rot:Math.PI,speed:0,size:WALL_SIZE*0.35,
thinkTimer:0,targetRot:Math.PI,moveTimer:0};
lastShot=0;aiLastShot=0;
gameState='playing';
}

function respawnTank(tank,isPlayer){
if(isPlayer){tank.x=WALL_SIZE*1.5;tank.y=WALL_SIZE*1.5;tank.rot=0;}
else{tank.x=W-WALL_SIZE*2.5;tank.y=H-WALL_SIZE*2.5;tank.rot=Math.PI;}
tank.speed=0;
}

function checkWallCollision(x,y,size){
for(var i=0;i<walls.length;i++){
var w=walls[i];
if(x+size>w.x&&x-size<w.x+w.w&&y+size>w.y&&y-size<w.y+w.h)return true;
}
return false;
}

function shootBullet(tank,isPlayer){
var now=gameTime;
var cooldown=isPlayer?0.4:0.8;
var lastTime=isPlayer?lastShot:aiLastShot;
if(now-lastTime<cooldown)return;
if(isPlayer)lastShot=now; else aiLastShot=now;
bullets.push({
x:tank.x+Math.cos(tank.rot)*tank.size,
y:tank.y+Math.sin(tank.rot)*tank.size,
vx:Math.cos(tank.rot)*BULLET_SPEED,
vy:Math.sin(tank.rot)*BULLET_SPEED,
bounces:0,maxBounces:2,
isPlayer:isPlayer,life:4,size:3
});
addParticles(tank.x+Math.cos(tank.rot)*tank.size,
tank.y+Math.sin(tank.rot)*tank.size,
isPlayer?'#ffcc00':'#ff4444',4);
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*2});
}

function aiUpdate(dt){
var dm=getDiffMult();
ai.thinkTimer+=dt;
ai.moveTimer+=dt;
var thinkRate=0.8/dm;
if(ai.thinkTimer>thinkRate){
ai.thinkTimer=0;
var dx=player.x-ai.x,dy=player.y-ai.y;
var targetAngle=Math.atan2(dy,dx);
targetAngle+=(Math.random()-0.5)*(1.2/dm);
ai.targetRot=targetAngle;
}
var diff=ai.targetRot-ai.rot;
while(diff>Math.PI)diff-=Math.PI*2;
while(diff<-Math.PI)diff+=Math.PI*2;
ai.rot+=Math.sign(diff)*TURN_SPEED*0.6*dm*dt;
ai.speed=AI_SPEED*dm;
var nx=ai.x+Math.cos(ai.rot)*ai.speed*dt;
var ny=ai.y+Math.sin(ai.rot)*ai.speed*dt;
if(!checkWallCollision(nx,ny,ai.size*0.4)){ai.x=nx;ai.y=ny;}
else{ai.rot+=Math.PI*0.3;ai.thinkTimer=thinkRate*0.85;}
var dx2=player.x-ai.x,dy2=player.y-ai.y;
var angleToPlayer=Math.atan2(dy2,dx2);
var aimDiff=angleToPlayer-ai.rot;
while(aimDiff>Math.PI)aimDiff-=Math.PI*2;
while(aimDiff<-Math.PI)aimDiff+=Math.PI*2;
var aimTol=0.6/dm;
if(Math.abs(aimDiff)<aimTol&&Math.random()<dt*0.8*dm){shootBullet(ai,false);}
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;roundTimer-=dt;
if(flashTimer>0)flashTimer-=dt;
if(roundTimer<=0){gameState='gameover';score=playerScore*100;return;}

if(keyLeft)player.rot-=TURN_SPEED*dt;
if(keyRight)player.rot+=TURN_SPEED*dt;
if(keyUp)player.speed=PLAYER_SPEED;
else if(keyDown)player.speed=-PLAYER_SPEED*0.5;
else player.speed*=0.9;

var pnx=player.x+Math.cos(player.rot)*player.speed*dt;
var pny=player.y+Math.sin(player.rot)*player.speed*dt;
if(!checkWallCollision(pnx,pny,player.size*0.4)){player.x=pnx;player.y=pny;}
else{player.speed=0;}

if(keySpace){shootBullet(player,true);keySpace=false;}
aiUpdate(dt);

for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0){bullets.splice(i,1);continue;}
var hitWall=false;
for(var j=0;j<walls.length;j++){
var w=walls[j];
if(b.x>w.x&&b.x<w.x+w.w&&b.y>w.y&&b.y<w.y+w.h){
hitWall=true;b.bounces++;
if(b.bounces>b.maxBounces){addParticles(b.x,b.y,'#888',3);bullets.splice(i,1);break;}
var cx2=w.x+w.w/2,cy2=w.y+w.h/2;
var relx=b.x-cx2,rely=b.y-cy2;
if(Math.abs(relx/w.w)>Math.abs(rely/w.h)){b.vx*=-1;b.x+=Math.sign(relx)*5;}
else{b.vy*=-1;b.y+=Math.sign(rely)*5;}
addParticles(b.x,b.y,'#aaa',2);break;
}
}
if(hitWall)continue;
if(!b.isPlayer){
var dx3=b.x-player.x,dy3=b.y-player.y;
if(dx3*dx3+dy3*dy3<player.size*player.size){
aiScore++;addParticles(player.x,player.y,'#00ccff',15);
flashTimer=0.3;respawnTank(player,true);bullets.splice(i,1);continue;
}
}
if(b.isPlayer){
var dx4=b.x-ai.x,dy4=b.y-ai.y;
if(dx4*dx4+dy4*dy4<ai.size*ai.size){
playerScore++;score=playerScore*100;
addParticles(ai.x,ai.y,'#ff4444',15);
flashTimer=0.2;respawnTank(ai,false);bullets.splice(i,1);continue;
}
}
}
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function drawTank(tank,color,turretColor){
ctx.save();ctx.translate(tank.x,tank.y);ctx.rotate(tank.rot);
var s=tank.size;
ctx.fillStyle='#444';
ctx.fillRect(-s*0.9,-s*0.9,s*1.8,s*0.25);
ctx.fillRect(-s*0.9,s*0.65,s*1.8,s*0.25);
ctx.strokeStyle='#555';ctx.lineWidth=1;
for(var t=0;t<6;t++){
var tx=-s*0.8+t*s*0.3;
ctx.beginPath();ctx.moveTo(tx,-s*0.9);ctx.lineTo(tx,-s*0.65);ctx.stroke();
ctx.beginPath();ctx.moveTo(tx,s*0.65);ctx.lineTo(tx,s*0.9);ctx.stroke();
}
var grad=ctx.createLinearGradient(0,-s*0.5,0,s*0.5);
grad.addColorStop(0,color);grad.addColorStop(1,turretColor);
ctx.fillStyle=grad;
ctx.beginPath();ctx.roundRect(-s*0.6,-s*0.55,s*1.2,s*1.1,3);ctx.fill();
ctx.fillStyle=turretColor;
ctx.beginPath();ctx.arc(0,0,s*0.35,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#666';ctx.fillRect(s*0.1,-s*0.08,s*0.8,s*0.16);
ctx.fillStyle='#555';ctx.fillRect(s*0.7,-s*0.1,s*0.2,s*0.2);
ctx.fillStyle='rgba(255,255,255,0.1)';
ctx.beginPath();ctx.arc(-s*0.1,-s*0.1,s*0.2,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function render(){
ctx.fillStyle='#2a2a1a';ctx.fillRect(0,0,W,H);
ctx.strokeStyle='rgba(100,100,80,0.15)';ctx.lineWidth=1;
for(var gx=0;gx<W;gx+=WALL_SIZE){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
for(var gy=0;gy<H;gy+=WALL_SIZE){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}

for(var i=0;i<walls.length;i++){
var w=walls[i];
var grad=ctx.createLinearGradient(w.x,w.y,w.x+w.w,w.y+w.h);
grad.addColorStop(0,'#666');grad.addColorStop(0.5,'#888');grad.addColorStop(1,'#555');
ctx.fillStyle=grad;ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.strokeStyle='#999';ctx.lineWidth=1;ctx.strokeRect(w.x+1,w.y+1,w.w-2,w.h-2);
ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(w.x,w.y,w.w,3);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(w.x,w.y+w.h-3,w.w,3);
}

drawTank(ai,'#cc3322','#992211');
drawTank(player,'#2266cc','#1144aa');

for(var i=0;i<bullets.length;i++){
var b=bullets[i];
var bcolor=b.isPlayer?'#ffcc00':'#ff4444';
ctx.fillStyle=bcolor;ctx.shadowColor=bcolor;ctx.shadowBlur=6;
ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=bcolor;ctx.lineWidth=1;ctx.globalAlpha=0.3;
ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*0.02,b.y-b.vy*0.02);ctx.stroke();
ctx.globalAlpha=1;
}
ctx.shadowBlur=0;

for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

if(flashTimer>0){ctx.fillStyle='rgba(255,100,50,'+(flashTimer*2)+')';ctx.fillRect(0,0,W,H);}

ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(W/2-80,5,160,25);
ctx.fillStyle='#4488ff';ctx.font='bold 16px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText(playerScore+'',W/2-10,22);
ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('-',W/2,22);
ctx.fillStyle='#ff4444';ctx.textAlign='left';ctx.fillText(aiScore+'',W/2+10,22);
ctx.fillStyle='#ffcc00';ctx.font='12px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(Math.ceil(roundTimer)+'s',W/2,H-8);
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#1a1a0a';ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(100,100,80,0.2)';
ctx.save();ctx.translate(W*0.3,H*0.7);ctx.rotate(-0.3);
ctx.fillRect(-20,-15,40,30);ctx.fillRect(10,-5,25,10);ctx.restore();
ctx.save();ctx.translate(W*0.7,H*0.65);ctx.rotate(Math.PI+0.2);
ctx.fillRect(-20,-15,40,30);ctx.fillRect(10,-5,25,10);ctx.restore();
for(var i=0;i<5;i++){
var bx=W*0.35+Math.sin(titlePulse+i)*20;
var by=H*0.7-i*8;
ctx.fillStyle='rgba(255,200,0,'+(0.1+0.05*Math.sin(titlePulse*2+i))+')';
ctx.beginPath();ctx.arc(bx,by,2,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('TANK',W/2,H*0.25);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillStyle='#ff6644';
ctx.fillText('COMBAT',W/2,H*0.34);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.5);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Left/Right to rotate, Up to move forward',W/2,H*0.6);
ctx.fillText('Space to fire - bullets bounce off walls!',W/2,H*0.66);
ctx.fillText('90 second rounds - outscore the red tank!',W/2,H*0.72);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
var won=playerScore>aiScore;
ctx.shadowColor=won?'#ffcc00':'#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle=won?'#ffcc00':'#ff3333';
ctx.fillText(won?'VICTORY!':'DEFEAT!',W/2,H*0.2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.28,W*0.6,H*0.42,15);ctx.fill();
ctx.fillStyle='#4488ff';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillText('YOU: '+playerScore,W/2,H*0.4);
ctx.fillStyle='#ff4444';ctx.fillText('ENEMY: '+aiScore,W/2,H*0.48);
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.58);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Time: '+gameTime.toFixed(1)+'s',W/2,H*0.66);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.8);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=playerScore+'-'+aiScore;
document.getElementById('hud-time').textContent=Math.ceil(roundTimer)+'s';
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
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initTank=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopTank=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
