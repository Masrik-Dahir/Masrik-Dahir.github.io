// Kung Fu Master — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,currentFloor=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],boss=null;
var keyLeft=false,keyRight=false,keyPunch=false,keyKick=false,keyJump=false;
var cameraX=0,FLOOR_WIDTH=0;
var PLAYER_SPEED=180,GRAVITY=800,JUMP_VEL=-350;
var TOTAL_FLOORS=5,enemySpawnTimer=0;
function diffMult(){ return currentFloor<=2?0.7:(currentFloor<=5?1.0:1.0+(currentFloor-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;FLOOR_WIDTH=W*3;
}

function spawnWave(){
enemies=[];boss=null;
var count=currentFloor<=2?3+currentFloor:4+currentFloor*2;if(count>14)count=14;
for(var i=0;i<count;i++){
var side=Math.random()>0.5?1:-1;
var ex=player.x+side*(W*0.6+Math.random()*W*0.5);
var type=Math.random()>0.7?'grabber':'puncher';
enemies.push({x:ex,y:H*0.7,vx:0,dir:-side,type:type,alive:true,hp:1,
attackTimer:1+Math.random()*2,frame:0,hitTimer:0});}
// Boss on last section
if(player.x>FLOOR_WIDTH*0.7){
boss={x:FLOOR_WIDTH-100,y:H*0.7,hp:5+currentFloor*2,dir:-1,alive:true,
attackTimer:2,frame:0,hitTimer:0,type:'boss'};}
}

function resetGame(){
player={x:100,y:H*0.7,vx:0,vy:0,dir:1,onGround:true,punching:0,kicking:0,
invince:1,frame:0,hp:20};
score=0;lives=3;currentFloor=1;gameTime=0;cameraX=0;particles=[];
enemySpawnTimer=0;boss=null;
spawnWave();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*150-50,life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*8;
// Player movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.dir=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.dir=1;}
// Jump
if(keyJump&&player.onGround){player.vy=JUMP_VEL;player.onGround=false;}
// Gravity
if(!player.onGround){player.vy+=GRAVITY*dt;player.y+=player.vy*dt;
if(player.y>=H*0.7){player.y=H*0.7;player.vy=0;player.onGround=true;}}
// Attack states
if(keyPunch&&player.punching<=0&&player.kicking<=0)player.punching=0.25;
if(keyKick&&player.kicking<=0&&player.punching<=0)player.kicking=0.3;
if(player.punching>0)player.punching-=dt;
if(player.kicking>0)player.kicking-=dt;
if(player.invince>0)player.invince-=dt;
// Clamp
if(player.x<20)player.x=20;if(player.x>FLOOR_WIDTH-20)player.x=FLOOR_WIDTH-20;
// Camera
cameraX=player.x-W*0.3;if(cameraX<0)cameraX=0;if(cameraX>FLOOR_WIDTH-W)cameraX=FLOOR_WIDTH-W;
// Spawn enemies periodically
enemySpawnTimer-=dt;
if(enemySpawnTimer<=0&&enemies.length<8+currentFloor){
enemySpawnTimer=2-currentFloor*0.1;if(enemySpawnTimer<0.8)enemySpawnTimer=0.8;
var side=Math.random()>0.5?1:-1;
enemies.push({x:player.x+side*(W*0.6+Math.random()*200),y:H*0.7,vx:0,dir:-side,
type:Math.random()>0.7?'grabber':'puncher',alive:true,hp:1,
attackTimer:1+Math.random()*2,frame:0,hitTimer:0});}
// Enemies
for(var i=enemies.length-1;i>=0;i--){var e=enemies[i];
if(!e.alive){e.hitTimer-=dt;if(e.hitTimer<=0)enemies.splice(i,1);continue;}
e.frame+=dt*6;e.hitTimer-=dt;
// Move toward player
var dx=player.x-e.x;
e.dir=dx>0?1:-1;
var spd=60+currentFloor*5;if(spd>100)spd=100; // Easy mode
e.x+=e.dir*spd*dt;
// Attack
e.attackTimer-=dt;
if(e.attackTimer<=0&&Math.abs(dx)<30){
e.attackTimer=2+Math.random();
if(player.invince<=0){player.hp-=1;addParticles(player.x,player.y-20,'#ff4444',5);
if(player.hp<=0){lives--;player.hp=20;player.x=100;player.invince=2;cameraX=0;
if(lives<=0)gameState='gameover';}}}
// Player attack hit
if((player.punching>0.1||player.kicking>0.1)&&Math.abs(dx)<40&&Math.abs(player.y-e.y)<30){
var dmg=player.kicking>0.1?2:1;
e.hp-=dmg;e.hitTimer=0.3;e.x+=player.dir*30;
if(e.hp<=0){e.alive=false;e.hitTimer=0.5;
score+=e.type==='grabber'?200:100;
addParticles(e.x,e.y-20,e.type==='grabber'?'#ff8800':'#ffcc00',8);}}}
// Boss
if(boss&&boss.alive){
boss.frame+=dt*4;boss.hitTimer-=dt;
var bdx=player.x-boss.x;boss.dir=bdx>0?1:-1;
boss.x+=boss.dir*40*dt;
boss.attackTimer-=dt;
if(boss.attackTimer<=0&&Math.abs(bdx)<50){
boss.attackTimer=1.5;
if(player.invince<=0){player.hp-=3;addParticles(player.x,player.y-20,'#ff0000',8);
if(player.hp<=0){lives--;player.hp=20;player.x=100;player.invince=2;cameraX=0;
if(lives<=0)gameState='gameover';}}}
if((player.punching>0.1||player.kicking>0.1)&&Math.abs(bdx)<45){
boss.hp--;boss.hitTimer=0.3;boss.x+=player.dir*10;
addParticles(boss.x,boss.y-30,'#ffcc00',5);
if(boss.hp<=0){boss.alive=false;score+=2000;
addParticles(boss.x,boss.y-20,'#ff8800',20);
// Next floor
currentFloor++;if(currentFloor>TOTAL_FLOORS){score+=5000;gameState='gameover';}
else{player.x=100;cameraX=0;player.hp=20;spawnWave();}}}}
// Progress to boss
if(!boss&&player.x>FLOOR_WIDTH*0.7){
boss={x:FLOOR_WIDTH-100,y:H*0.7,hp:5+currentFloor*2,dir:-1,alive:true,
attackTimer:2,frame:0,hitTimer:0,type:'boss'};}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawFighter(x,y,dir,color,punching,kicking,frame,isBoss){
ctx.save();ctx.translate(x-cameraX,y);ctx.scale(dir,1);
var s=isBoss?1.4:1;
// Body
ctx.fillStyle=color;ctx.fillRect(-6*s,-30*s,12*s,22*s);
// Head
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-34*s,6*s,0,Math.PI*2);ctx.fill();
// Hair
ctx.fillStyle=color;ctx.fillRect(-6*s,-40*s,12*s,4*s);
// Arms
if(punching>0.1){
ctx.fillStyle='#ffcc88';ctx.fillRect(6*s,-24*s,20*s,5*s);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;ctx.fillStyle='#ffcc00';
ctx.beginPath();ctx.arc(28*s,-22*s,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}else if(kicking>0.1){
ctx.fillStyle=color;ctx.fillRect(6*s,-4*s,22*s,5*s);
ctx.shadowColor='#ff8800';ctx.shadowBlur=8;ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.arc(30*s,-2*s,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}else{
ctx.fillStyle='#ffcc88';ctx.fillRect(6*s,-26*s,8*s,4*s);
ctx.fillRect(-14*s,-26*s,8*s,4*s);}
// Legs
var lo=Math.sin(frame)*3*s;
ctx.fillStyle=color==='#ff4444'?'#cc3333':'#444';
ctx.fillRect(-4*s,-8*s,4*s,12*s+lo);ctx.fillRect(1*s,-8*s,4*s,12*s-lo);
ctx.restore();}

function render(){
// Background - temple interior
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a0a');bg.addColorStop(0.5,'#2a1a1a');bg.addColorStop(1,'#1a0a0a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Floor
ctx.fillStyle='#443322';ctx.fillRect(0,H*0.72,W,H*0.28);
var fg=ctx.createLinearGradient(0,H*0.72,0,H*0.76);fg.addColorStop(0,'#554433');fg.addColorStop(1,'#443322');
ctx.fillStyle=fg;ctx.fillRect(0,H*0.72,W,4);
// Pillars in background
for(var i=0;i<6;i++){
var px=i*(W/5)-((cameraX*0.3)%200);
ctx.fillStyle='#332222';ctx.fillRect(px,H*0.1,20,H*0.62);
ctx.fillStyle='#442222';ctx.fillRect(px-5,H*0.1,30,10);ctx.fillRect(px-5,H*0.68,30,10);}
// Floor indicator
ctx.fillStyle='#cc4444';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('FLOOR '+currentFloor+'/'+TOTAL_FLOORS,W/2,20);
// HP bar
var hpW=100,hpH=8,hpX=15,hpY=H-30;
ctx.fillStyle='#333';ctx.fillRect(hpX,hpY,hpW,hpH);
ctx.fillStyle='#44cc44';ctx.fillRect(hpX,hpY,hpW*(player.hp/20),hpH);
ctx.strokeStyle='#666';ctx.strokeRect(hpX,hpY,hpW,hpH);
// Boss HP
if(boss&&boss.alive){
var bossMaxHp=5+currentFloor*2;
ctx.fillStyle='#333';ctx.fillRect(W-115,hpY,100,hpH);
ctx.fillStyle='#cc4444';ctx.fillRect(W-115,hpY,100*(boss.hp/bossMaxHp),hpH);
ctx.strokeStyle='#666';ctx.strokeRect(W-115,hpY,100,hpH);
ctx.fillStyle='#ff4444';ctx.font='10px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('BOSS',W-120,hpY+8);}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
var alpha=e.alive?1:Math.max(0,e.hitTimer*2);ctx.globalAlpha=alpha;
var ec=e.type==='grabber'?'#cc8844':'#4488cc';
if(e.hitTimer>0&&e.alive)ec='#ffffff';
drawFighter(e.x,e.y,e.dir,ec,0,0,e.frame,false);}ctx.globalAlpha=1;
// Boss
if(boss){var ba=boss.alive?1:0.5;ctx.globalAlpha=ba;
var bc=boss.hitTimer>0&&boss.alive?'#ffffff':'#880088';
drawFighter(boss.x,boss.y,boss.dir,bc,0,0,boss.frame,true);ctx.globalAlpha=1;}
// Player
if(player.invince<=0||Math.sin(gameTime*15)>0){
drawFighter(player.x,player.y,player.dir,'#ff4444',player.punching,player.kicking,player.frame,false);}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-cameraX-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(20+i*22,15,8,0,Math.PI*2);ctx.fill();}
}

function drawTitle(dt){
ctx.fillStyle='#1a0a0a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Decorative columns
for(var i=0;i<4;i++){ctx.fillStyle='#332222';ctx.fillRect(W*0.1+i*(W*0.25),H*0.1,20,H*0.8);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff4444';ctx.fillText('KUNG FU MASTER',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ff8866';ctx.fillText('FIVE FLOORS OF FURY',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right move, Up jump, Z punch, X kick',W/2,H*0.65);
ctx.fillText('Defeat the boss on each floor!',W/2,H*0.71);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
var won=currentFloor>TOTAL_FLOORS;
ctx.shadowColor=won?'#ffcc00':'#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle=won?'#ffcc00':'#ff3333';ctx.fillText(won?'VICTORY!':'GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='FLR '+currentFloor;
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
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyJump=down;
if(e.key==='z'||e.key==='Z')keyPunch=down;
if(e.key==='x'||e.key==='X'||e.key===' ')keyKick=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initKungFuMaster=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyJump=v;keyPunch=v;});bindMobile('btn-down',function(v){keyKick=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopKungFuMaster=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyPunch=keyKick=keyJump=false;};
})();
