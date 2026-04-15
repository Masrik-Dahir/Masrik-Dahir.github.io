// Robotron 2084 — Twin-stick arena shooter
(function(){
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,wave=1,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],humans=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var PLAYER_SPEED=280,BULLET_SPEED=500,FIRE_RATE=0.08;
var fireTimer=0,lastDirX=0,lastDirY=-1;
var waveEnemyCount,humansRescued=0,totalHumansRescued=0;
var screenShake=0,screenFlash=0;
var arenaMargin=30;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
}

function spawnWave(){
enemies=[];humans=[];
var count=Math.min(8+wave*3,40);
waveEnemyCount=count;
for(var i=0;i<count;i++){
var side=Math.floor(Math.random()*4);
var ex,ey;
if(side===0){ex=arenaMargin+Math.random()*(W-arenaMargin*2);ey=arenaMargin;}
else if(side===1){ex=arenaMargin+Math.random()*(W-arenaMargin*2);ey=H-arenaMargin;}
else if(side===2){ex=arenaMargin;ey=arenaMargin+Math.random()*(H-arenaMargin*2);}
else{ex=W-arenaMargin;ey=arenaMargin+Math.random()*(H-arenaMargin*2);}
// Avoid spawning on player
var dx=ex-player.x,dy=ey-player.y;
if(Math.sqrt(dx*dx+dy*dy)<100){ex+=120;ey+=120;}
var types=['grunt','hulk','brain','spheroid'];
var type=types[Math.floor(Math.random()*types.length)];
if(wave<3)type=Math.random()<0.7?'grunt':'hulk';
var speed=type==='grunt'?60+wave*3:type==='hulk'?35+wave*2:type==='brain'?50+wave*2:45+wave*2;
var hp=type==='hulk'?3:1;
enemies.push({x:ex,y:ey,w:18,h:18,type:type,speed:speed,hp:hp,alive:true,
frame:0,spawnTimer:0.5+Math.random()*0.3,angle:Math.random()*Math.PI*2});
}
// Humans to rescue
var humanCount=Math.min(3+Math.floor(wave/2),8);
for(var i=0;i<humanCount;i++){
humans.push({
x:arenaMargin+50+Math.random()*(W-arenaMargin*2-100),
y:arenaMargin+50+Math.random()*(H-arenaMargin*2-100),
w:12,h:16,alive:true,rescued:false,
vx:(Math.random()-0.5)*60,vy:(Math.random()-0.5)*60,
color:['#ff88ff','#88ff88','#ffff88','#88ffff'][Math.floor(Math.random()*4)]
});
}
humansRescued=0;
}

function resetGame(){
player={x:W/2,y:H/2,w:20,h:20};
bullets=[];enemies=[];humans=[];particles=[];
score=0;lives=3;wave=1;gameTime=0;
fireTimer=0;lastDirX=0;lastDirY=-1;
totalHumansRescued=0;screenShake=0;screenFlash=0;
spawnWave();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=50+Math.random()*200;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.2+Math.random()*0.5,maxLife:0.2+Math.random()*0.5,color:color,size:1+Math.random()*3});
}}

function update(dt){
gameTime+=dt;
// Difficulty: waves 1-2 easy, 3-5 medium, 6+ hard
var diffMult=wave<=2?0.7:(wave<=5?1.0:1.0+(wave-5)*0.12);

// Player movement
var mx=0,my=0;
if(keyLeft)mx=-1;if(keyRight)mx=1;
if(keyUp)my=-1;if(keyDown)my=1;
if(mx!==0&&my!==0){var inv=0.7071;mx*=inv;my*=inv;}
player.x+=mx*PLAYER_SPEED*dt;
player.y+=my*PLAYER_SPEED*dt;
player.x=Math.max(arenaMargin,Math.min(W-arenaMargin-player.w,player.x));
player.y=Math.max(arenaMargin,Math.min(H-arenaMargin-player.h,player.y));

// Track firing direction
if(mx!==0||my!==0){lastDirX=mx;lastDirY=my;}

// Auto-fire
fireTimer+=dt;
if(fireTimer>=FIRE_RATE&&(lastDirX!==0||lastDirY!==0)){
fireTimer=0;
var len=Math.sqrt(lastDirX*lastDirX+lastDirY*lastDirY);
if(len>0){
bullets.push({
x:player.x+player.w/2,y:player.y+player.h/2,
vx:lastDirX/len*BULLET_SPEED,vy:lastDirY/len*BULLET_SPEED,
life:1.2
});
}
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H)bullets.splice(i,1);
}

// Update enemies
var aliveCount=0;
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){continue;}
aliveCount++;
e.frame++;
e.spawnTimer-=dt;
if(e.spawnTimer>0)continue;

// Move toward player - difficulty scales speed
var eSpdMult=wave<=2?0.6:diffMult;
var dx=player.x-e.x,dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist>0){
e.x+=dx/dist*e.speed*eSpdMult*dt;
e.y+=dy/dist*e.speed*eSpdMult*dt;
}
e.x=Math.max(arenaMargin,Math.min(W-arenaMargin-e.w,e.x));
e.y=Math.max(arenaMargin,Math.min(H-arenaMargin-e.h,e.y));

// Bullet-enemy collision
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){
e.hp--;
bullets.splice(j,1);
if(e.hp<=0){
e.alive=false;aliveCount--;
var pts=e.type==='grunt'?100:e.type==='hulk'?200:e.type==='brain'?300:250;
score+=pts;
var cols=e.type==='grunt'?['#ff0000','#ff6600']:e.type==='hulk'?['#0088ff','#00ccff']:e.type==='brain'?['#ff00ff','#ff88ff']:['#ffff00','#ff8800'];
addParticles(e.x+e.w/2,e.y+e.h/2,cols[0],8);
addParticles(e.x+e.w/2,e.y+e.h/2,cols[1],6);
screenShake=0.15;
}
addParticles(b.x,b.y,'#fff',3);
break;
}
}

// Enemy-player collision
if(e.alive&&e.spawnTimer<=0){
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
lives--;
screenShake=0.3;screenFlash=0.2;
addParticles(player.x+player.w/2,player.y+player.h/2,['#ff0000','#ff6600','#ffff00'][Math.floor(Math.random()*3)],20);
if(lives<=0){gameState='gameover';return;}
// Reset position
player.x=W/2;player.y=H/2;
// Push enemies away
for(var k=0;k<enemies.length;k++){
if(enemies[k].alive){
var edx=enemies[k].x-player.x,edy=enemies[k].y-player.y;
var edist=Math.sqrt(edx*edx+edy*edy);
if(edist<150&&edist>0){enemies[k].x+=edx/edist*100;enemies[k].y+=edy/edist*100;}
}
}
}
}

// Brain chases humans
if(e.type==='brain'&&e.alive&&e.spawnTimer<=0){
for(var h=0;h<humans.length;h++){
if(!humans[h].alive)continue;
var hdx=e.x-humans[h].x,hdy=e.y-humans[h].y;
if(Math.sqrt(hdx*hdx+hdy*hdy)<20){
humans[h].alive=false;
addParticles(humans[h].x,humans[h].y,'#ff00ff',8);
}
}
}
}

// Update humans
for(var i=0;i<humans.length;i++){
var h=humans[i];
if(!h.alive||h.rescued)continue;
h.x+=h.vx*dt;h.y+=h.vy*dt;
if(h.x<arenaMargin||h.x>W-arenaMargin){h.vx*=-1;h.x=Math.max(arenaMargin,Math.min(W-arenaMargin,h.x));}
if(h.y<arenaMargin||h.y>H-arenaMargin){h.vy*=-1;h.y=Math.max(arenaMargin,Math.min(H-arenaMargin,h.y));}

// Player rescue
if(player.x+player.w>h.x&&player.x<h.x+h.w&&player.y+player.h>h.y&&player.y<h.y+h.h){
h.rescued=true;humansRescued++;totalHumansRescued++;
score+=1000;
addParticles(h.x+h.w/2,h.y+h.h/2,'#ffff00',12);
}
}

// Screen effects
if(screenShake>0)screenShake-=dt;
if(screenFlash>0)screenFlash-=dt;

// Next wave
if(aliveCount<=0){
wave++;
spawnWave();
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function render(){
ctx.save();
// Screen shake
if(screenShake>0){
ctx.translate(Math.random()*8-4,Math.random()*8-4);
}

// Background with radial gradient
var bgGrad=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.6);
bgGrad.addColorStop(0,'#10102a');bgGrad.addColorStop(0.6,'#0a0a1a');bgGrad.addColorStop(1,'#050510');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

// Arena border with animated glow
ctx.save();
var borderGlow=6+Math.sin(gameTime*3)*4;
ctx.shadowColor='#4444ff';ctx.shadowBlur=borderGlow;
ctx.strokeStyle='#3333aa';ctx.lineWidth=2;
ctx.strokeRect(arenaMargin,arenaMargin,W-arenaMargin*2,H-arenaMargin*2);
// Inner border highlight
ctx.strokeStyle='rgba(80,80,200,0.3)';ctx.lineWidth=1;
ctx.strokeRect(arenaMargin+3,arenaMargin+3,W-arenaMargin*2-6,H-arenaMargin*2-6);
ctx.shadowBlur=0;ctx.restore();

// Grid lines with subtle pulse
var gridAlpha=0.15+0.08*Math.sin(gameTime*1.5);
ctx.strokeStyle='rgba(30,30,100,'+gridAlpha+')';ctx.lineWidth=1;
for(var gx=arenaMargin;gx<W-arenaMargin;gx+=40){
ctx.beginPath();ctx.moveTo(gx,arenaMargin);ctx.lineTo(gx,H-arenaMargin);ctx.stroke();
}
for(var gy=arenaMargin;gy<H-arenaMargin;gy+=40){
ctx.beginPath();ctx.moveTo(arenaMargin,gy);ctx.lineTo(W-arenaMargin,gy);ctx.stroke();
}
// Grid intersection dots
ctx.fillStyle='rgba(60,60,150,'+gridAlpha+')';
for(var gx=arenaMargin;gx<W-arenaMargin;gx+=40){
for(var gy=arenaMargin;gy<H-arenaMargin;gy+=40){
ctx.fillRect(gx-1,gy-1,2,2);
}
}

// Humans
for(var i=0;i<humans.length;i++){
var h=humans[i];
if(!h.alive||h.rescued)continue;
ctx.fillStyle=h.color;
// Simple stick figure
ctx.beginPath();ctx.arc(h.x+h.w/2,h.y+4,4,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=h.color;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(h.x+h.w/2,h.y+8);ctx.lineTo(h.x+h.w/2,h.y+h.h-3);ctx.stroke();
ctx.beginPath();ctx.moveTo(h.x,h.y+11);ctx.lineTo(h.x+h.w,h.y+11);ctx.stroke();
ctx.beginPath();ctx.moveTo(h.x+h.w/2,h.y+h.h-3);ctx.lineTo(h.x+2,h.y+h.h);ctx.stroke();
ctx.beginPath();ctx.moveTo(h.x+h.w/2,h.y+h.h-3);ctx.lineTo(h.x+h.w-2,h.y+h.h);ctx.stroke();
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
ctx.save();
var alpha=e.spawnTimer>0?0.3+0.7*(1-e.spawnTimer/0.5):1;
ctx.globalAlpha=alpha;
if(e.type==='grunt'){
ctx.fillStyle='#ff3333';
ctx.fillRect(e.x,e.y,e.w,e.h);
ctx.fillStyle='#ff6666';
ctx.fillRect(e.x+3,e.y+3,e.w-6,e.h-6);
ctx.fillStyle='#fff';
ctx.fillRect(e.x+4,e.y+5,4,4);
ctx.fillRect(e.x+e.w-8,e.y+5,4,4);
} else if(e.type==='hulk'){
ctx.fillStyle='#0066ff';
ctx.fillRect(e.x-2,e.y-2,e.w+4,e.h+4);
ctx.fillStyle='#0088ff';
ctx.fillRect(e.x,e.y,e.w,e.h);
ctx.fillStyle='#00ccff';
ctx.fillRect(e.x+4,e.y+4,e.w-8,e.h-8);
} else if(e.type==='brain'){
ctx.fillStyle='#ff00ff';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff88ff';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/3,0,Math.PI*2);ctx.fill();
// Pulsing glow
ctx.shadowColor='#ff00ff';ctx.shadowBlur=8+Math.sin(gameTime*8)*4;
ctx.strokeStyle='#ff44ff';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/2+2,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
} else {
ctx.fillStyle='#ffcc00';
ctx.beginPath();
for(var s=0;s<8;s++){
var sa=s*Math.PI/4+gameTime*2;
var sr=s%2===0?e.w/2:e.w/3;
ctx.lineTo(e.x+e.w/2+Math.cos(sa)*sr,e.y+e.h/2+Math.sin(sa)*sr);
}
ctx.closePath();ctx.fill();
}
ctx.globalAlpha=1;ctx.restore();
}

// Player
ctx.save();
var pGrad=ctx.createRadialGradient(player.x+player.w/2,player.y+player.h/2,2,player.x+player.w/2,player.y+player.h/2,player.w/2);
pGrad.addColorStop(0,'#ffffff');pGrad.addColorStop(0.5,'#00ff00');pGrad.addColorStop(1,'#008800');
ctx.fillStyle=pGrad;
ctx.fillRect(player.x,player.y,player.w,player.h);
// Glow
ctx.shadowColor='#00ff00';ctx.shadowBlur=12;
ctx.strokeStyle='#00ff00';ctx.lineWidth=2;
ctx.strokeRect(player.x-1,player.y-1,player.w+2,player.h+2);
ctx.shadowBlur=0;
ctx.restore();

// Bullets
ctx.fillStyle='#ffffff';ctx.shadowColor='#ffffff';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life/p.maxLife;
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Screen flash
if(screenFlash>0){
ctx.fillStyle='rgba(255,0,0,'+(screenFlash*2)+')';
ctx.fillRect(0,0,W,H);
}

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#00ff00';
ctx.fillRect(10+i*18,10,12,12);
}

// Wave indicator
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';
ctx.textAlign='right';ctx.fillText('WAVE '+wave,W-10,20);ctx.textAlign='left';

// Humans rescued
ctx.fillStyle='#ffff88';
ctx.fillText('RESCUED: '+humansRescued,10,30);

ctx.restore();
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);

// Grid animation
ctx.strokeStyle='rgba(30,30,80,0.3)';ctx.lineWidth=1;
var offset=titlePulse*10%40;
for(var gx=-40+offset;gx<W+40;gx+=40){
ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();
}
for(var gy=-40+offset;gy<H+40;gy+=40){
ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff00';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#00ff44';
ctx.fillText('ROBOTRON',W/2,H*0.25);
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillStyle='#00cc33';
ctx.fillText('2 0 8 4',W/2,H*0.33);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';
ctx.fillStyle='#ff88ff';
ctx.fillText('SAVE THE LAST HUMAN FAMILY',W/2,H*0.42);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('ARROWS/WASD: Move (auto-fires in movement direction)',W/2,H*0.67);
ctx.fillText('Touch humans to rescue them for 1000 points!',W/2,H*0.72);
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
ctx.fillText('Wave: '+wave+'  Rescued: '+totalHumansRescued,W/2,H*0.63);
var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='WAVE '+wave;
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
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
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

window.initRobotron=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopRobotron=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
