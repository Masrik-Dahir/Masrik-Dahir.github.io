// Time Pilot — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,era=0,gameTime=0,titlePulse=0;
var player,enemies=[],bullets=[],particles=[],stars=[],clouds=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyShoot=false,lastShot=0;
var PLAYER_SPEED=200,BULLET_SPEED=400,ENEMY_SPEED=100;
var killCount=0,killsNeeded=15;
var ERAS=['1910','1940','1970','2001','2999'];
var ERA_COLORS=[['#88aa66','#bbcc88'],['#668899','#88aacc'],['#998866','#ccaa88'],['#666688','#8888aa'],['#440044','#880088']];
var worldX=0,worldY=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<100;i++)stars.push({x:Math.random()*2000-1000,y:Math.random()*2000-1000,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
clouds=[];for(var i=0;i<15;i++)clouds.push({x:Math.random()*3000-1500,y:Math.random()*3000-1500,w:40+Math.random()*80,h:20+Math.random()*30});}

function resetGame(){
player={x:0,y:0,angle:0,speed:0};
score=0;lives=3;era=0;gameTime=0;killCount=0;killsNeeded=15;
worldX=0;worldY=0;
enemies=[];bullets=[];particles=[];
spawnWave();gameState='playing';}

function spawnWave(){
enemies=[];
var count=6+era*2;if(count>16)count=16;
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var dist=300+Math.random()*400;
var ex=player.x+Math.cos(angle)*dist,ey=player.y+Math.sin(angle)*dist;
var ea=Math.atan2(player.y-ey,player.x-ex);
enemies.push({x:ex,y:ey,angle:ea,speed:ENEMY_SPEED+era*10,alive:true,
shootTimer:2+Math.random()*3,frame:Math.random()*10,
type:Math.random()>0.7?'ace':'normal'});}}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// Difficulty multiplier based on era (0-4)
var diffMult=era<=1?0.7:(era<=3?1.0:1.0+(era-3)*0.2);
// Player rotation
var turnSpeed=3.5;
if(keyLeft)player.angle-=turnSpeed*dt;
if(keyRight)player.angle+=turnSpeed*dt;
// Player always moves forward
player.speed=PLAYER_SPEED;
player.x+=Math.cos(player.angle)*player.speed*dt;
player.y+=Math.sin(player.angle)*player.speed*dt;
worldX=player.x;worldY=player.y;
// Shoot
if(keyShoot&&gameTime-lastShot>0.15){lastShot=gameTime;
bullets.push({x:player.x+Math.cos(player.angle)*18,y:player.y+Math.sin(player.angle)*18,
vx:Math.cos(player.angle)*BULLET_SPEED,vy:Math.sin(player.angle)*BULLET_SPEED,
life:1.2,friendly:true});}
// Spawn more enemies if needed - count scales with difficulty
var maxEnemies=era<=1?4:(era<=3?5+era:6+era);
if(enemies.length<maxEnemies){
var angle=Math.random()*Math.PI*2;var dist=400+Math.random()*200;
var eSpeed=(ENEMY_SPEED+era*10)*diffMult;
enemies.push({x:player.x+Math.cos(angle)*dist,y:player.y+Math.sin(angle)*dist,
angle:Math.atan2(player.y-(player.y+Math.sin(angle)*dist),player.x-(player.x+Math.cos(angle)*dist)),
speed:eSpeed,alive:true,shootTimer:(era<=1?3:2)+Math.random()*(era<=1?4:2),frame:Math.random()*10,
type:Math.random()>(era<=1?0.9:era<=3?0.7:0.5)?'ace':'normal'});}
// Enemies
for(var i=enemies.length-1;i>=0;i--){var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}
e.frame+=dt;
// Turn toward player - difficulty scales turn speed
var targetAngle=Math.atan2(player.y-e.y,player.x-e.x);
var diff=targetAngle-e.angle;
while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;
var eTurnSpeed=era<=1?1.0:(1.5+era*0.2)*diffMult;if(eTurnSpeed>3.5)eTurnSpeed=3.5;
e.angle+=Math.sign(diff)*Math.min(Math.abs(diff),eTurnSpeed*dt);
e.x+=Math.cos(e.angle)*e.speed*dt;
e.y+=Math.sin(e.angle)*e.speed*dt;
// Shoot - difficulty scales fire rate
e.shootTimer-=dt;
var eBulletSpeed=era<=1?180:(250*diffMult);
if(e.shootTimer<=0){e.shootTimer=era<=1?3+Math.random()*3:2+Math.random()*2;
bullets.push({x:e.x+Math.cos(e.angle)*12,y:e.y+Math.sin(e.angle)*12,
vx:Math.cos(e.angle)*eBulletSpeed,vy:Math.sin(e.angle)*eBulletSpeed,life:1.5,friendly:false});}
// Remove if too far
var dx=e.x-player.x,dy=e.y-player.y;
if(dx*dx+dy*dy>800*800){enemies.splice(i,1);continue;}}
// Bullets
for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0){bullets.splice(i,1);continue;}
if(b.friendly){// Check enemy hits
for(var j=enemies.length-1;j>=0;j--){var e=enemies[j];
if(!e.alive)continue;
var dx=b.x-e.x,dy=b.y-e.y;
if(dx*dx+dy*dy<400){// Hit
e.alive=false;killCount++;
score+=e.type==='ace'?500:200;
addParticles(e.x,e.y,'#ff8800',10);
bullets.splice(i,1);
if(killCount>=killsNeeded){era++;killCount=0;
if(era>=ERAS.length)era=0;killsNeeded+=5;
score+=2000;addParticles(player.x,player.y,'#ffcc00',20);
spawnWave();}
break;}}}
else{// Check player hit
var dx=b.x-player.x,dy=b.y-player.y;
if(dx*dx+dy*dy<256){
lives--;addParticles(player.x,player.y,'#00ccff',15);
bullets.splice(i,1);
if(lives<=0)gameState='gameover';}}}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawPlane(x,y,angle,color,isPlayer){
ctx.save();ctx.translate(x,y);ctx.rotate(angle);
if(isPlayer){
ctx.shadowColor='#00ccff';ctx.shadowBlur=12;
// Fuselage with gradient
var fGrad=ctx.createLinearGradient(-10,-7,16,7);
fGrad.addColorStop(0,'#0099dd');fGrad.addColorStop(0.5,'#00ccff');fGrad.addColorStop(1,'#66eeff');
ctx.fillStyle=fGrad;
ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-10,8);ctx.lineTo(-6,0);ctx.lineTo(-10,-8);ctx.closePath();ctx.fill();
// Wings with gradient
var wGrad=ctx.createLinearGradient(0,-14,0,14);
wGrad.addColorStop(0,'#0066aa');wGrad.addColorStop(0.5,'#0099dd');wGrad.addColorStop(1,'#0066aa');
ctx.fillStyle=wGrad;ctx.fillRect(-4,-14,10,28);
// Wing tips
ctx.fillStyle='#00aacc';
ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(-8,-16);ctx.lineTo(0,-14);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(-4,14);ctx.lineTo(-8,16);ctx.lineTo(0,14);ctx.closePath();ctx.fill();
// Tail
ctx.fillStyle='#006688';ctx.fillRect(-13,-5,7,10);
// Cockpit dome
var cGrad=ctx.createRadialGradient(4,0,1,4,0,5);
cGrad.addColorStop(0,'#aaeeff');cGrad.addColorStop(1,'#4488aa');
ctx.fillStyle=cGrad;ctx.beginPath();ctx.arc(4,0,4,0,Math.PI*2);ctx.fill();
// Engine exhaust trail
ctx.fillStyle='rgba(255,200,80,0.6)';
for(var f=0;f<3;f++){
ctx.beginPath();ctx.arc(-14-f*5+Math.random()*2,-1+Math.random()*2,3-f*0.7,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
}else{
// Enemy plane with era-based detail
ctx.shadowColor=color||'#cc4444';ctx.shadowBlur=6;
var eGrad=ctx.createLinearGradient(-8,-6,12,6);
eGrad.addColorStop(0,color||'#cc4444');eGrad.addColorStop(1,'#882222');
ctx.fillStyle=eGrad;
ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,7);ctx.lineTo(-5,0);ctx.lineTo(-8,-7);ctx.closePath();ctx.fill();
// Wings
ctx.fillStyle='#aa2222';ctx.fillRect(-3,-10,7,20);
// Tail
ctx.fillRect(-11,-4,5,8);
// Cockpit
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(3,0,2.5,0,Math.PI*2);ctx.fill();
// Markings
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(-3,-10);ctx.lineTo(4,-10);ctx.stroke();
ctx.beginPath();ctx.moveTo(-3,10);ctx.lineTo(4,10);ctx.stroke();
ctx.shadowBlur=0;}
ctx.restore();}

function render(){
// Background
var ec=ERA_COLORS[era]||ERA_COLORS[0];
var bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
bg.addColorStop(0,ec[0]);bg.addColorStop(1,ec[1]);
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
ctx.save();ctx.translate(W/2-worldX,H/2-worldY);
// Clouds/stars based on era
if(era>=3){// Space eras - stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*0.5;
ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
}else{// Sky eras - clouds
ctx.fillStyle='rgba(255,255,255,0.15)';
for(var i=0;i<clouds.length;i++){var c=clouds[i];
ctx.beginPath();ctx.ellipse(c.x,c.y,c.w,c.h,0,0,Math.PI*2);ctx.fill();}}
// Ground reference dots (scrolling grid)
ctx.fillStyle='rgba(255,255,255,0.05)';
var gridSize=100;
var sx=Math.floor((worldX-W)/gridSize)*gridSize;
var sy=Math.floor((worldY-H)/gridSize)*gridSize;
for(var gx=sx;gx<worldX+W;gx+=gridSize){for(var gy=sy;gy<worldY+H;gy+=gridSize){
ctx.fillRect(gx,gy,2,2);}}
// Bullets
for(var i=0;i<bullets.length;i++){var b=bullets[i];
ctx.fillStyle=b.friendly?'#ffcc00':'#ff4444';
ctx.shadowColor=b.friendly?'#ffcc00':'#ff4444';ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
drawPlane(e.x,e.y,e.angle,e.type==='ace'?'#ffcc00':'#cc4444',false);}
// Player
drawPlane(player.x,player.y,player.angle,'#00ccff',true);
// Exhaust
ctx.fillStyle='rgba(255,200,100,0.4)';
for(var i=0;i<2;i++){ctx.beginPath();
ctx.arc(player.x-Math.cos(player.angle)*(14+i*6)+Math.random()*4,
player.y-Math.sin(player.angle)*(14+i*6)+Math.random()*4,2+Math.random()*2,0,Math.PI*2);ctx.fill();}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
ctx.restore();
// HUD
ctx.fillStyle='#ffcc00';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('ERA: '+ERAS[era],W/2,20);
// Kill progress
var progW=120,progH=8,progX=(W-progW)/2,progY=28;
ctx.fillStyle='#333';ctx.fillRect(progX,progY,progW,progH);
ctx.fillStyle='#ff8844';ctx.fillRect(progX,progY,progW*(killCount/killsNeeded),progH);
ctx.strokeStyle='#666';ctx.strokeRect(progX,progY,progW,progH);
// Lives
for(var i=0;i<lives;i++){ctx.save();ctx.translate(20+i*25,H-20);ctx.rotate(-Math.PI/2);
ctx.fillStyle='#00ccff';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,4);ctx.lineTo(-3,0);ctx.lineTo(-5,-4);ctx.closePath();ctx.fill();ctx.restore();}
// Direction indicator ring
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)*0.4,0,Math.PI*2);ctx.stroke();
// Enemy indicators on edge
for(var i=0;i<enemies.length;i++){var e=enemies[i];
var dx=e.x-player.x,dy=e.y-player.y,dist=Math.sqrt(dx*dx+dy*dy);
if(dist>W*0.4){
var a=Math.atan2(dy,dx);var r=Math.min(W,H)*0.42;
ctx.fillStyle='#ff4444';ctx.beginPath();
ctx.arc(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r,4,0,Math.PI*2);ctx.fill();}}
}

function drawTitle(dt){
var ec=ERA_COLORS[0];
var bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
bg.addColorStop(0,ec[0]);bg.addColorStop(1,ec[1]);
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Flying planes
for(var i=0;i<4;i++){
var px=(titlePulse*50+i*200)%W;var py=H*0.4+Math.sin(titlePulse+i)*30;
ctx.fillStyle='#cc4444';ctx.save();ctx.translate(px,py);ctx.rotate(0.3);
ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-6,5);ctx.lineTo(-3,0);ctx.lineTo(-6,-5);ctx.closePath();ctx.fill();ctx.restore();}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('TIME PILOT',W/2,H*0.25);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ffee88';ctx.fillText('THROUGH THE AGES',W/2,H*0.33);
// Era list
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
for(var i=0;i<ERAS.length;i++){
ctx.fillStyle=ERA_COLORS[i][0];ctx.fillText(ERAS[i],W/2,H*0.42+i*20);}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.7);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to turn, Space to shoot',W/2,H*0.78);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Era reached: '+ERAS[era],W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=ERAS[era];
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){gameTime+=dt;drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){gameTime+=dt;render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keyShoot=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initTimePilot=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyShoot=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopTimePilot=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyShoot=false;};
})();
