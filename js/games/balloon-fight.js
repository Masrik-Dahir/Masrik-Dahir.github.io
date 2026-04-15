// Balloon Fight — Float with balloons, pop enemy balloons
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
var player,enemies=[],particles=[],platforms=[];
var keyLeft=false,keyRight=false,keyUp=false;
var PLAYER_SPEED=180,FLAP_POWER=-220,GRAVITY=200,MAX_FALL=250;
var waterY,fishTimer=0,fishActive=false,fishX=0,fishTargetY=0;
var stars=[];
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
waterY=H-50;
buildLevel();
initStars();
}

function initStars(){
stars=[];
for(var i=0;i<40;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.3,s:0.5+Math.random()*1,b:0.4+Math.random()*0.6});
}

function buildLevel(){
platforms=[];
// Bottom solid (above water)
platforms.push({x:0,y:waterY-8,w:W*0.3,h:8});
platforms.push({x:W*0.7,y:waterY-8,w:W*0.3,h:8});
// Middle platforms
platforms.push({x:W*0.15,y:H*0.6,w:W*0.2,h:8});
platforms.push({x:W*0.55,y:H*0.55,w:W*0.25,h:8});
platforms.push({x:W*0.35,y:H*0.4,w:W*0.3,h:8});
// Top platforms
platforms.push({x:W*0.05,y:H*0.28,w:W*0.2,h:8});
platforms.push({x:W*0.65,y:H*0.25,w:W*0.25,h:8});
platforms.push({x:W*0.3,y:H*0.15,w:W*0.2,h:8});
}

function spawnWaveEnemies(){
enemies=[];
var count=Math.min(3+wave,8);
for(var i=0;i<count;i++){
var ex=50+Math.random()*(W-100);
var ey=50+Math.random()*(H*0.4);
enemies.push({
x:ex,y:ey,w:20,h:24,
balloons:2,alive:true,
vx:(Math.random()-0.5)*60,vy:0,
speed:40+wave*5+Math.random()*20,
flapTimer:0.5+Math.random()*2,
grounded:false,falling:false,
frame:0,
color:['#ff4444','#44ff44','#ffaa00','#ff44ff','#44aaff'][i%5]
});
}
}

function resetGame(){
player={x:W/2-10,y:H*0.5,w:20,h:24,vy:0,balloons:2,facing:1};
enemies=[];particles=[];
score=0;lives=3;wave=1;gameTime=0;
fishTimer=0;fishActive=false;
spawnWaveEnemies();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=30+Math.random()*100;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2.5});
}}

function popBalloon(entity,isPlayer){
entity.balloons--;
addParticles(entity.x+entity.w/2,entity.y-5,isPlayer?'#ff4444':'#ffcc00',8);
if(entity.balloons<=0){
if(isPlayer){
entity.falling=true;
} else {
entity.alive=false;
score+=500;
addParticles(entity.x+entity.w/2,entity.y+entity.h/2,'#ffffff',10);
}
}
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: waves 1-2 easy, 3-5 medium, 6+ hard
var diffMult=wave<=2?0.7:(wave<=5?1.0:1.0+(wave-5)*0.12);

// Player movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.facing=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.facing=1;}

// Wrap
if(player.x<-player.w)player.x=W;
if(player.x>W)player.x=-player.w;

// Flap
if(keyUp&&player.balloons>0){
player.vy-=FLAP_POWER*dt;
player.vy=Math.max(-180,player.vy);
} else {
player.vy+=GRAVITY*dt;
}
player.vy=Math.min(MAX_FALL,player.vy);
player.y+=player.vy*dt;

// Ceiling
if(player.y<0){player.y=0;player.vy=Math.abs(player.vy)*0.3;}

// Platform collision
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.vy>=0){
if(player.y+player.h>=p.y&&player.y+player.h<=p.y+15){
player.y=p.y-player.h;player.vy=0;
}
}
}

// Water death
if(player.y+player.h>=waterY){
lives--;
addParticles(player.x+player.w/2,waterY,['#4488ff','#66aaff'][Math.floor(Math.random()*2)],12);
if(lives<=0){gameState='gameover';return;}
player.x=W/2;player.y=H*0.3;player.vy=0;player.balloons=2;
}

// Fish mechanic
fishTimer+=dt;
if(!fishActive&&fishTimer>3){
// Check if player or enemies near water
var nearWater=player.y+player.h>waterY-60;
if(nearWater){
fishActive=true;fishTimer=0;
fishX=player.x+player.w/2;fishTargetY=player.y;
}
}
if(fishActive){
fishTimer+=dt;
if(fishTimer>1.5){fishActive=false;fishTimer=0;}
}

// Fish collision
if(fishActive&&fishTimer<0.8){
var fishY=waterY-fishTimer*200;
if(Math.abs(fishX-player.x-player.w/2)<25&&Math.abs(fishY-player.y)<30){
lives--;
addParticles(player.x+player.w/2,player.y,'#ff0000',15);
fishActive=false;
if(lives<=0){gameState='gameover';return;}
player.x=W/2;player.y=H*0.3;player.vy=0;player.balloons=2;
}
}

// Update enemies
var aliveCount=0;
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
aliveCount++;
e.frame++;

// Enemy AI - flap and move - difficulty scales aggression
e.flapTimer-=dt;
var flapInterval=wave<=2?0.5+Math.random()*2:0.3+Math.random()*1.5;
if(e.flapTimer<=0){
e.flapTimer=flapInterval;
if(e.balloons>0)e.vy=wave<=2?-90-Math.random()*40:-120-Math.random()*60;
}
e.vy+=GRAVITY*dt;
e.vy=Math.min(MAX_FALL,e.vy);
e.y+=e.vy*dt;

// Move toward player - difficulty scales chase frequency
var chaseChance=wave<=2?0.01:0.02*diffMult;
if(Math.random()<chaseChance){
e.vx=(player.x-e.x)>0?e.speed*diffMult:-e.speed*diffMult;
}
e.x+=e.vx*dt;

// Wrap
if(e.x<-e.w)e.x=W;if(e.x>W)e.x=-e.w;
if(e.y<0){e.y=0;e.vy=Math.abs(e.vy)*0.3;}

// Platform collision
for(var j=0;j<platforms.length;j++){
var p=platforms[j];
if(e.x+e.w>p.x&&e.x<p.x+p.w&&e.vy>=0&&e.y+e.h>=p.y&&e.y+e.h<=p.y+15){
e.y=p.y-e.h;e.vy=0;
}
}

// Water death
if(e.y+e.h>=waterY){
e.alive=false;score+=200;
addParticles(e.x+e.w/2,waterY,'#4488ff',8);
continue;
}

// Player vs enemy collision
if(player.balloons>0){
if(player.x+player.w>e.x&&player.x<e.x+e.w&&
player.y+player.h>e.y&&player.y<e.y+e.h){
// Who's on top?
if(player.y+player.h/2<e.y+e.h/2){
// Player above enemy - pop enemy balloon
popBalloon(e,false);
player.vy=-150;
} else {
// Enemy above player - pop player balloon
popBalloon(player,true);
if(player.balloons<=0){
lives--;
if(lives<=0){gameState='gameover';return;}
player.x=W/2;player.y=H*0.3;player.vy=0;player.balloons=2;
}
}
}
}
}

// Wave complete
if(aliveCount===0){
wave++;score+=1000;
spawnWaveEnemies();
player.balloons=2;
}

// Particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function drawBalloons(x,y,count,colors){
for(var i=0;i<count;i++){
var bx=x-6+i*12;
var by=y-14+Math.sin(gameTime*3+i)*2;// Gentle bob
ctx.save();
// Balloon body with radial gradient for 3D effect
var bGrad=ctx.createRadialGradient(bx-2,by-3,1,bx,by,8);
bGrad.addColorStop(0,'rgba(255,255,255,0.4)');
bGrad.addColorStop(0.3,colors[i%colors.length]);
bGrad.addColorStop(1,colors[i%colors.length]);
ctx.fillStyle=bGrad;
ctx.shadowColor=colors[i%colors.length];ctx.shadowBlur=6;
ctx.beginPath();
// Slightly elongated balloon shape
ctx.ellipse(bx,by,6,8,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Highlight shine
ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.beginPath();ctx.arc(bx-2,by-4,2.5,0,Math.PI*2);ctx.fill();
// Balloon knot
ctx.fillStyle=colors[i%colors.length];
ctx.beginPath();ctx.moveTo(bx-2,by+7);ctx.lineTo(bx,by+10);ctx.lineTo(bx+2,by+7);ctx.closePath();ctx.fill();
// String with gentle curve
ctx.strokeStyle='#999';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(bx,by+10);
ctx.quadraticCurveTo(bx+Math.sin(gameTime*2+i)*3,by+12+(y-by-10)/2,x,y);
ctx.stroke();
ctx.restore();
}
}

function drawCharacter(x,y,w,h,facing,isPlayer,color){
ctx.save();
// Body
ctx.fillStyle=isPlayer?'#ffccaa':'#ddddaa';
ctx.beginPath();ctx.arc(x+w/2,y+6,7,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(x+w/2+facing*2-2,y+5,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w/2+facing*2+2,y+5,1.5,0,Math.PI*2);ctx.fill();
// Body
ctx.fillStyle=isPlayer?'#ff4444':'#666';
ctx.fillRect(x+4,y+12,w-8,10);
// Legs
ctx.fillStyle=isPlayer?'#4444ff':color||'#444';
ctx.fillRect(x+4,y+h-6,5,6);
ctx.fillRect(x+w-9,y+h-6,5,6);
// Arms flapping
if(keyUp&&isPlayer){
ctx.strokeStyle=isPlayer?'#ffccaa':'#ddddaa';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(x+3,y+14);ctx.lineTo(x-6,y+8);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w-3,y+14);ctx.lineTo(x+w+6,y+8);ctx.stroke();
} else {
ctx.strokeStyle=isPlayer?'#ffccaa':'#ddddaa';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(x+3,y+14);ctx.lineTo(x-4,y+18);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w-3,y+14);ctx.lineTo(x+w+4,y+18);ctx.stroke();
}
ctx.restore();
}

function render(){
// Sky gradient
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#000022');sky.addColorStop(0.7,'#001144');sky.addColorStop(1,'#002266');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Stars
for(var i=0;i<stars.length;i++){
var s=stars[i];
var alpha=s.b*(0.5+0.5*Math.sin(gameTime*2+i*0.5));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
}

// Platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
ctx.fillStyle='#446622';
ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.fillStyle='#558833';
ctx.fillRect(p.x,p.y,p.w,3);
// Grass tufts
ctx.fillStyle='#66aa44';
for(var gx=p.x+5;gx<p.x+p.w-5;gx+=12){
ctx.beginPath();
ctx.moveTo(gx,p.y);ctx.lineTo(gx+3,p.y-5);ctx.lineTo(gx+6,p.y);
ctx.closePath();ctx.fill();
}
}

// Water
var waterGrad=ctx.createLinearGradient(0,waterY,0,H);
waterGrad.addColorStop(0,'#2244aa');waterGrad.addColorStop(1,'#112266');
ctx.fillStyle=waterGrad;ctx.fillRect(0,waterY,W,H-waterY);
// Water surface waves
ctx.strokeStyle='rgba(100,150,255,0.4)';ctx.lineWidth=2;
for(var wx=0;wx<W;wx+=8){
var wy=waterY+Math.sin(gameTime*3+wx*0.05)*3;
ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(wx+8,wy+Math.sin(gameTime*3+(wx+8)*0.05)*3);ctx.stroke();
}

// Fish
if(fishActive){
var fishY2=waterY-Math.min(fishTimer*200,150);
if(fishTimer<0.8){
ctx.save();
ctx.fillStyle='#88ccff';
ctx.beginPath();
ctx.moveTo(fishX-15,fishY2);
ctx.quadraticCurveTo(fishX,fishY2-20,fishX+15,fishY2);
ctx.quadraticCurveTo(fishX,fishY2+15,fishX-15,fishY2);
ctx.fill();
// Jaw
ctx.fillStyle='#ff4444';
ctx.beginPath();ctx.arc(fishX+10,fishY2+2,4,0,Math.PI);ctx.fill();
// Eye
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(fishX+8,fishY2-4,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(fishX+9,fishY2-4,1.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
if(e.balloons>0)drawBalloons(e.x+e.w/2,e.y,e.balloons,[e.color,e.color]);
drawCharacter(e.x,e.y,e.w,e.h,e.vx>0?1:-1,false,e.color);
}

// Player
if(player.balloons>0)drawBalloons(player.x+player.w/2,player.y,player.balloons,['#ff4444','#4444ff']);
drawCharacter(player.x,player.y,player.w,player.h,player.facing,true);

// Particles
for(var i=0;i<particles.length;i++){
var p2=particles[i];ctx.globalAlpha=p2.life/p2.maxLife;
ctx.fillStyle=p2.color;ctx.beginPath();ctx.arc(p2.x,p2.y,p2.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff4444';
ctx.beginPath();ctx.arc(15+i*20,15,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();ctx.arc(13+i*20,13,2,0,Math.PI*2);ctx.fill();
}

// Wave
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';
ctx.textAlign='right';ctx.fillText('WAVE '+wave,W-10,20);ctx.textAlign='left';

// Balloon indicator
ctx.fillStyle='#fff';ctx.font='11px monospace';
ctx.fillText('Balloons: '+player.balloons,10,32);
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#000033');sky.addColorStop(1,'#002266');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

for(var i=0;i<stars.length;i++){
var alpha=stars[i].b*(0.5+0.5*Math.sin(titlePulse+i));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(stars[i].x,stars[i].y,stars[i].s,0,Math.PI*2);ctx.fill();
}

// Animated balloons floating
for(var b=0;b<5;b++){
var bx=W*0.2+b*(W*0.15);
var by=H*0.45+Math.sin(titlePulse+b)*20;
ctx.fillStyle=['#ff4444','#44ff44','#4444ff','#ffaa00','#ff44ff'][b];
ctx.beginPath();ctx.arc(bx,by,12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();ctx.arc(bx-3,by-4,4,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#aaa';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(bx,by+12);ctx.lineTo(bx,by+30);ctx.stroke();
}

// Water
ctx.fillStyle='#2244aa';ctx.fillRect(0,H*0.8,W,H*0.2);

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff6666';
ctx.fillText('BALLOON FIGHT',W/2,H*0.2);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#88ccff';
ctx.fillText('POP ENEMY BALLOONS!',W/2,H*0.28);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.62);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT: Move | UP: Flap',W/2,H*0.7);
ctx.fillText('Land on enemies from above to pop their balloons!',W/2,H*0.75);
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
ctx.fillText('Wave: '+wave+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
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

window.initBalloonFight=function(){
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

window.stopBalloonFight=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=false;
};
})();
