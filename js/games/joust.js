// Joust — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,wave=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],platforms=[],lava={},stars=[];
var keyLeft=false,keyRight=false,keyFlap=false,lastFlap=0;
var GRAVITY=400,FLAP_VEL=-220,MAX_FALL=300,MOVE_SPEED=200,DRAG=0.92;
var ENEMY_SPEED=80,ENEMY_FLAP_VEL=-180;
var LAVA_HEIGHT=40;
// Difficulty: easy(wave 1-2), medium(3-5), hard(6+)
function diffMult(){ return wave<=2?0.7:(wave<=5?1.0:1.0+(wave-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.7,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
buildPlatforms();
}

function buildPlatforms(){
platforms=[];
var pw=W*0.25,ph=10;
// Bottom platform left/right
platforms.push({x:0,y:H-LAVA_HEIGHT-60,w:W*0.3,h:ph});
platforms.push({x:W*0.7,y:H-LAVA_HEIGHT-60,w:W*0.3,h:ph});
// Mid platforms
platforms.push({x:W*0.2,y:H*0.55,w:pw,h:ph});
platforms.push({x:W*0.55,y:H*0.55,w:pw,h:ph});
// Upper platforms
platforms.push({x:0,y:H*0.35,w:W*0.22,h:ph});
platforms.push({x:W*0.38,y:H*0.35,w:W*0.24,h:ph});
platforms.push({x:W*0.78,y:H*0.35,w:W*0.22,h:ph});
// Top
platforms.push({x:W*0.15,y:H*0.18,w:W*0.3,h:ph});
platforms.push({x:W*0.55,y:H*0.18,w:W*0.3,h:ph});
}

function spawnEnemies(){
enemies=[];
var count=wave<=2?2+wave:3+wave;if(count>8)count=8;
var dm=diffMult();
for(var i=0;i<count;i++){
var ex=Math.random()*W,ey=Math.random()*H*0.3+50;
enemies.push({x:ex,y:ey,vx:(Math.random()-0.5)*ENEMY_SPEED*dm,vy:0,dir:Math.random()>0.5?1:-1,
flapTimer:Math.random()*(wave<=2?3:2),alive:true,falling:false,wingPhase:Math.random()*Math.PI*2,
color:['#ff4444','#ff8800','#aa22aa','#44aa44'][i%4]});
}}

function resetGame(){
player={x:W/2,y:H*0.5,vx:0,vy:0,dir:1,wingPhase:0,invince:2};
score=0;lives=3;wave=1;gameTime=0;particles=[];
spawnEnemies();gameState='playing';
}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.4+Math.random()*0.5,color:color,size:2+Math.random()*3});}

function collideRect(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

function applyPhysics(obj,dt){
obj.vy+=GRAVITY*dt;if(obj.vy>MAX_FALL)obj.vy=MAX_FALL;
obj.x+=obj.vx*dt;obj.y+=obj.vy*dt;
// Platform collision
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(obj.vy>0&&obj.y>p.y-20&&obj.y<p.y+p.h&&obj.x>p.x-10&&obj.x<p.x+p.w+10){
obj.y=p.y-18;obj.vy=0;}}
// Wrap horizontal
if(obj.x<-20)obj.x=W+20;if(obj.x>W+20)obj.x=-20;
// Lava
if(obj.y>H-LAVA_HEIGHT)return true;
return false;
}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// Player movement
if(keyLeft){player.vx-=MOVE_SPEED*dt*3;player.dir=-1;}
if(keyRight){player.vx+=MOVE_SPEED*dt*3;player.dir=1;}
player.vx*=DRAG;
// Flap
if(keyFlap&&gameTime-lastFlap>0.15){lastFlap=gameTime;player.vy=FLAP_VEL;
addParticles(player.x,player.y+10,'#aaddff',3);}
player.wingPhase+=dt*8;
var inLava=applyPhysics(player,dt);
if(player.invince>0)player.invince-=dt;
if(inLava){lives--;addParticles(player.x,player.y,'#ff6600',15);
player.x=W/2;player.y=H*0.3;player.vx=0;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}
// Enemies
for(var i=enemies.length-1;i>=0;i--){var e=enemies[i];
if(!e.alive){e.vy+=GRAVITY*dt;e.y+=e.vy*dt;
if(e.y>H)enemies.splice(i,1);continue;}
e.flapTimer-=dt;e.wingPhase+=dt*6;
if(e.flapTimer<=0){e.vy=ENEMY_FLAP_VEL*(0.7+Math.random()*0.3);e.flapTimer=1+Math.random()*2;}
// Move toward player loosely
if(player.x>e.x+50)e.vx+=(ENEMY_SPEED*0.5)*dt;
else if(player.x<e.x-50)e.vx-=(ENEMY_SPEED*0.5)*dt;
e.vx*=0.98;if(e.vx>ENEMY_SPEED)e.vx=ENEMY_SPEED;if(e.vx<-ENEMY_SPEED)e.vx=-ENEMY_SPEED;
e.dir=e.vx>0?1:-1;
var eLava=applyPhysics(e,dt);
if(eLava){e.alive=false;e.vy=-100;score+=200;addParticles(e.x,e.y,'#ff6600',10);}
// Joust collision
if(e.alive&&player.invince<=0){
var dx=player.x-e.x,dy=player.y-e.y,dist=Math.sqrt(dx*dx+dy*dy);
if(dist<28){
if(player.y<e.y-5){// Player wins joust
score+=500;addParticles(e.x,e.y,e.color,12);e.alive=false;e.vy=-150;}
else if(player.y>e.y+5){// Enemy wins
lives--;addParticles(player.x,player.y,'#00ccff',15);
player.x=W/2;player.y=H*0.3;player.vx=0;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}
else{// Bounce both
player.vx=-player.vx*1.5;player.vy=-150;e.vx=-e.vx*1.5;e.vy=-150;}
}}}
// Wave clear
var aliveCount=0;for(var i=0;i<enemies.length;i++)if(enemies[i].alive)aliveCount++;
if(aliveCount===0&&enemies.length===0){wave++;spawnEnemies();}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawBird(x,y,dir,wingPhase,color,bodyColor){
ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
// Shadow
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(0,14,12,4,0,0,Math.PI*2);ctx.fill();
// Body with gradient
var bGrad=ctx.createRadialGradient(-3,-2,2,0,0,14);
bGrad.addColorStop(0,bodyColor||'#ffe866');bGrad.addColorStop(1,bodyColor||'#ccaa22');
ctx.fillStyle=bGrad;
ctx.beginPath();ctx.ellipse(0,0,14,10,0,0,Math.PI*2);ctx.fill();
// Feather detail
ctx.strokeStyle='rgba(0,0,0,0.1)';ctx.lineWidth=0.8;
ctx.beginPath();ctx.ellipse(-4,2,8,6,0.1,0,Math.PI*2);ctx.stroke();
// Wing with flap animation
var wingY=Math.sin(wingPhase)*8;
var wGrad=ctx.createLinearGradient(-12,-8+wingY,8,-3+wingY);
wGrad.addColorStop(0,color||'#ddaa00');wGrad.addColorStop(1,color||'#ffcc44');
ctx.fillStyle=wGrad;
ctx.beginPath();ctx.ellipse(-2,-8+wingY,11,5,0.2,0,Math.PI*2);ctx.fill();
// Wing tip feathers
ctx.strokeStyle=color||'#cc9900';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(-12,-8+wingY);ctx.lineTo(-14,-10+wingY);ctx.stroke();
ctx.beginPath();ctx.moveTo(-10,-12+wingY);ctx.lineTo(-12,-15+wingY);ctx.stroke();
// Rider (knight) with helmet
ctx.fillStyle=color||'#00ccff';
ctx.beginPath();ctx.arc(0,-16,7,0,Math.PI*2);ctx.fill();
// Helmet visor
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.fillRect(3,-19,4,5);
// Helmet plume
ctx.fillStyle='#ff4444';
ctx.beginPath();ctx.ellipse(0,-23,3,4,0,0,Math.PI*2);ctx.fill();
// Armor body hint
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(-3,-12,6,4);
// Lance with metallic shine
ctx.save();ctx.shadowColor='#ffffff';ctx.shadowBlur=3;
ctx.strokeStyle='#dddddd';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(8,-12);ctx.lineTo(22,-12);ctx.stroke();
ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(8,-12);ctx.lineTo(22,-12);ctx.stroke();
// Lance tip
ctx.fillStyle='#cccccc';ctx.beginPath();ctx.moveTo(22,-14);ctx.lineTo(26,-12);ctx.lineTo(22,-10);ctx.fill();
ctx.restore();
// Beak
ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(19,-2);ctx.lineTo(12,-4);ctx.fill();
ctx.fillStyle='#ffaa44';ctx.beginPath();ctx.moveTo(12,-1);ctx.lineTo(16,-2);ctx.lineTo(12,-3);ctx.fill();
// Eye
ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(8,-4,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(8.5,-4,1.2,0,Math.PI*2);ctx.fill();
// Legs with animation
var legAnim=Math.sin(wingPhase*0.5)*2;
ctx.strokeStyle='#dd9922';ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(-6+legAnim,16);ctx.moveTo(4,8);ctx.lineTo(6-legAnim,16);ctx.stroke();
// Talons
ctx.fillStyle='#dd9922';
ctx.beginPath();ctx.moveTo(-8+legAnim,16);ctx.lineTo(-6+legAnim,16);ctx.lineTo(-4+legAnim,18);ctx.fill();
ctx.beginPath();ctx.moveTo(4-legAnim,16);ctx.lineTo(6-legAnim,16);ctx.lineTo(8-legAnim,18);ctx.fill();
ctx.restore();
}

function render(){
// Background
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a2e');bg.addColorStop(0.7,'#1a1040');bg.addColorStop(1,'#2a0a0a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*0.5;ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// Platforms
for(var i=0;i<platforms.length;i++){var p=platforms[i];
var pg=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);pg.addColorStop(0,'#886644');pg.addColorStop(1,'#554422');
ctx.fillStyle=pg;ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.strokeStyle='#aa8866';ctx.lineWidth=1;ctx.strokeRect(p.x,p.y,p.w,p.h);
}
// Lava with multi-layer animation
var lavaY=H-LAVA_HEIGHT;
var lavaGrad=ctx.createLinearGradient(0,lavaY,0,H);
lavaGrad.addColorStop(0,'#ff4400');lavaGrad.addColorStop(0.3,'#ff2200');lavaGrad.addColorStop(0.6,'#cc1100');lavaGrad.addColorStop(1,'#881100');
ctx.fillStyle=lavaGrad;ctx.fillRect(0,lavaY,W,LAVA_HEIGHT);
// Bright lava surface bubbles
ctx.fillStyle='#ff6600';
for(var i=0;i<W;i+=14){var lh=6+Math.sin(gameTime*3+i*0.12)*5+Math.sin(gameTime*5+i*0.07)*3;ctx.fillRect(i,lavaY-lh,12,lh);}
ctx.fillStyle='#ffaa33';
for(var i=0;i<W;i+=22){var lh2=3+Math.sin(gameTime*4+i*0.15)*3;ctx.fillRect(i+5,lavaY-lh2,8,lh2);}
// Hot air shimmer glow
ctx.save();ctx.shadowColor='#ff6600';ctx.shadowBlur=25;ctx.fillStyle='rgba(255,100,20,0.25)';ctx.fillRect(0,lavaY-15,W,15);ctx.restore();
// Occasional bright spot
var bubbleX=(gameTime*50)%W;
ctx.fillStyle='rgba(255,255,100,0.3)';ctx.beginPath();ctx.arc(bubbleX,lavaY+10,6+Math.sin(gameTime*8)*3,0,Math.PI*2);ctx.fill();
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(e.alive)drawBird(e.x,e.y,e.dir,e.wingPhase,e.color,'#666688');
else{ctx.fillStyle='#888';ctx.beginPath();ctx.arc(e.x,e.y,6,0,Math.PI*2);ctx.fill();}}
// Player
if(player.invince<=0||Math.sin(gameTime*15)>0){
drawBird(player.x,player.y,player.dir,player.wingPhase,'#00ccff','#ffcc44');}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){ctx.fillStyle='#ffcc44';ctx.beginPath();ctx.arc(20+i*25,H-LAVA_HEIGHT-30,8,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('WAVE '+wave,W-15,25);
}

function drawTitle(dt){
ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*(0.3+0.2*Math.sin(gameTime*2+i));ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// Lava at bottom
var lavaY=H-LAVA_HEIGHT;ctx.fillStyle='#ff3300';ctx.fillRect(0,lavaY,W,LAVA_HEIGHT);
for(var i=0;i<W;i+=20){var lh=8+Math.sin(titlePulse+i*0.1)*6;ctx.fillStyle='#ff6600';ctx.fillRect(i,lavaY-lh,18,lh);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('JOUST',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ff8844';ctx.fillText('KNIGHTS ON OSTRICHES',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to move, Up/Space to flap',W/2,H*0.62);
ctx.fillText('Be HIGHER than enemies to joust them!',W/2,H*0.68);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Wave reached: '+wave,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='WAVE '+wave;
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
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')keyFlap=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initJoust=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyFlap=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopJoust=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyFlap=false;};
})();
