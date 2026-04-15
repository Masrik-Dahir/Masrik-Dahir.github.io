// Double Dragon — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,stage=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyPunch=false,keyKick=false;
var cameraX=0,LEVEL_WIDTH=0;
var PLAYER_SPEED=150,GRAVITY=600,JUMP_VEL=-320;
var enemySpawnTimer=0,enemiesDefeated=0,enemiesNeeded=15;
function diffMult(){ return stage<=2?0.7:(stage<=5?1.0:1.0+(stage-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;LEVEL_WIDTH=W*4;}

function resetGame(){
player={x:100,y:H*0.65,vx:0,vy:0,dir:1,onGround:true,punching:0,kicking:0,jumpKick:0,
invince:1,frame:0,hp:20,maxHp:20};
score=0;lives=3;stage=1;gameTime=0;cameraX=0;particles=[];enemies=[];
enemySpawnTimer=0;enemiesDefeated=0;enemiesNeeded=15;
gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*150-50,life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*4});}

function spawnEnemy(){
var side=Math.random()>0.5?1:-1;
var ex=player.x+side*(W*0.6+Math.random()*200);
var types=['thug','knife','big'];
var type=types[Math.floor(Math.random()*types.length)];
var hp=type==='big'?3:type==='knife'?2:1;
var dm=diffMult();
enemies.push({x:ex,y:H*0.55+Math.random()*H*0.15,vx:0,vy:0,dir:-side,type:type,alive:true,
hp:hp,attackTimer:(stage<=2?2:1.5)+Math.random()*(stage<=2?3:2),frame:0,hitTimer:0,knockback:0,speedMult:dm});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*8;
var groundMin=H*0.55,groundMax=H*0.75;
// Player movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.dir=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.dir=1;}
if(keyUp&&player.onGround)player.y-=PLAYER_SPEED*0.5*dt;
if(keyDown&&player.onGround)player.y+=PLAYER_SPEED*0.5*dt;
if(player.y<groundMin)player.y=groundMin;if(player.y>groundMax)player.y=groundMax;
// Jump
if((keyUp)&&player.onGround&&player.vy===0){player.vy=JUMP_VEL;player.onGround=false;}
if(!player.onGround){player.vy+=GRAVITY*dt;player.y+=player.vy*dt;
if(player.y>=groundMax){player.y=groundMax;player.vy=0;player.onGround=true;}}
// Attacks
if(keyPunch&&player.punching<=0&&player.kicking<=0){player.punching=0.2;
if(!player.onGround)player.jumpKick=0.3;}
if(keyKick&&player.kicking<=0&&player.punching<=0)player.kicking=0.25;
if(player.punching>0)player.punching-=dt;
if(player.kicking>0)player.kicking-=dt;
if(player.jumpKick>0)player.jumpKick-=dt;
if(player.invince>0)player.invince-=dt;
// Clamp
if(player.x<20)player.x=20;if(player.x>LEVEL_WIDTH-20)player.x=LEVEL_WIDTH-20;
// Camera
var targetCX=player.x-W*0.35;if(targetCX<0)targetCX=0;if(targetCX>LEVEL_WIDTH-W)targetCX=LEVEL_WIDTH-W;
cameraX+=(targetCX-cameraX)*3*dt;
// Spawn enemies
enemySpawnTimer-=dt;
if(enemySpawnTimer<=0&&enemies.length<5&&enemiesDefeated<enemiesNeeded){
enemySpawnTimer=2;spawnEnemy();}
// Enemies
for(var i=enemies.length-1;i>=0;i--){var e=enemies[i];
if(!e.alive){e.hitTimer-=dt;if(e.hitTimer<=0)enemies.splice(i,1);continue;}
e.frame+=dt*5;e.hitTimer-=dt;
if(e.knockback>0){e.x+=e.dir*(-1)*150*dt;e.knockback-=dt;continue;}
// Move toward player
var dx=player.x-e.x,dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy);
e.dir=dx>0?1:-1;
var spd=50+stage*5;if(spd>80)spd=80;
if(dist>35){e.x+=e.dir*spd*dt;
var ydir=dy>0?1:dy<0?-1:0;e.y+=ydir*spd*0.5*dt;}
// Attack
e.attackTimer-=dt;
if(e.attackTimer<=0&&dist<35){
e.attackTimer=2+Math.random();
if(player.invince<=0){
var dmg=e.type==='big'?2:1;
player.hp-=dmg;addParticles(player.x,player.y-20,'#ff4444',5);
if(player.hp<=0){lives--;
if(lives<=0){gameState='gameover';}
else{player.hp=player.maxHp;player.invince=2;}}}}
// Hit by player
var attacking=player.punching>0.1||player.kicking>0.1||player.jumpKick>0.1;
if(attacking&&Math.abs(dx)<45&&Math.abs(dy)<30){
var dmg=player.jumpKick>0.1?3:player.kicking>0.1?2:1;
e.hp-=dmg;e.hitTimer=0.2;e.knockback=0.2;
addParticles(e.x,e.y-20,'#ffcc00',6);
if(e.hp<=0){e.alive=false;e.hitTimer=0.6;
score+=e.type==='big'?500:e.type==='knife'?300:100;
enemiesDefeated++;addParticles(e.x,e.y-20,'#ff8800',10);
if(enemiesDefeated>=enemiesNeeded){stage++;enemiesDefeated=0;enemiesNeeded+=5;
score+=2000;addParticles(player.x,player.y,'#ffcc00',20);}}}}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawCharacter(x,y,dir,color,pantsColor,punching,kicking,frame,scale){
ctx.save();ctx.translate(x-cameraX,y);ctx.scale(dir*(scale||1),(scale||1));
var s=1;
// Body
ctx.fillStyle=color;ctx.fillRect(-7*s,-28*s,14*s,20*s);
// Head
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-32*s,6*s,0,Math.PI*2);ctx.fill();
// Hair
ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,-34*s,5*s,Math.PI,0);ctx.fill();
// Arms
if(punching>0.1){
ctx.fillStyle='#ffcc88';ctx.fillRect(7*s,-24*s,22*s,5*s);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=10;
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(30*s,-22*s,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}else if(kicking>0.1){
ctx.fillStyle=pantsColor;ctx.fillRect(7*s,-4*s,24*s,5*s);
ctx.shadowColor='#ff8800';ctx.shadowBlur=10;
ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(32*s,-2*s,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}else{
ctx.fillStyle='#ffcc88';
ctx.fillRect(7*s,-24*s,8*s,4*s);ctx.fillRect(-15*s,-24*s,8*s,4*s);}
// Legs
var lo=Math.sin(frame)*3*s;
ctx.fillStyle=pantsColor;ctx.fillRect(-5*s,-8*s,4*s,14*s+lo);ctx.fillRect(1*s,-8*s,4*s,14*s-lo);
// Shoes
ctx.fillStyle='#333';ctx.fillRect(-6*s,5*s+lo,6*s,3*s);ctx.fillRect(0*s,5*s-lo,6*s,3*s);
ctx.restore();}

function render(){
// Background - city street
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a1a2e');bg.addColorStop(0.3,'#2a2a3e');bg.addColorStop(1,'#1a1a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Buildings in background
for(var i=0;i<8;i++){
var bx=i*W*0.2-(cameraX*0.2)%(W*0.2);
var bh=H*0.3+Math.sin(i*2.3)*H*0.1;
ctx.fillStyle='#222233';ctx.fillRect(bx,H*0.55-bh,W*0.15,bh);
// Windows
for(var wy=0;wy<bh-20;wy+=20){for(var wx=0;wx<3;wx++){
ctx.fillStyle=Math.random()>0.3?'#ffcc44':'#444';
ctx.fillRect(bx+8+wx*16,H*0.55-bh+10+wy,8,10);}}}
// Street
ctx.fillStyle='#333344';ctx.fillRect(0,H*0.55,W,H*0.45);
ctx.fillStyle='#444455';ctx.fillRect(0,H*0.55,W,4);
// Street lines
ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;ctx.setLineDash([20,15]);
ctx.beginPath();ctx.moveTo(0,H*0.75);ctx.lineTo(W,H*0.75);ctx.stroke();ctx.setLineDash([]);
// HP bar
var hpW=100,hpH=8;
ctx.fillStyle='#333';ctx.fillRect(15,H-30,hpW,hpH);
ctx.fillStyle='#44cc44';ctx.fillRect(15,H-30,hpW*(player.hp/player.maxHp),hpH);
ctx.strokeStyle='#666';ctx.strokeRect(15,H-30,hpW,hpH);
ctx.fillStyle='#aaa';ctx.font='10px "Courier New",monospace';ctx.textAlign='left';ctx.fillText('HP',15,H-33);
// Progress
ctx.fillStyle='#888';ctx.font='12px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('DEFEATED: '+enemiesDefeated+'/'+enemiesNeeded,W/2,20);
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
var alpha=e.alive?1:Math.max(0,e.hitTimer);ctx.globalAlpha=alpha;
var ec=e.type==='big'?'#885522':e.type==='knife'?'#882244':'#444466';
var pc=e.type==='big'?'#664411':'#333';
if(e.hitTimer>0&&e.alive)ec='#ffffff';
drawCharacter(e.x,e.y,e.dir,ec,pc,0,0,e.frame,e.type==='big'?1.3:1);}ctx.globalAlpha=1;
// Player
if(player.invince<=0||Math.sin(gameTime*15)>0){
drawCharacter(player.x,player.y,player.dir,'#cc2222','#2222cc',player.punching,player.kicking||player.jumpKick,player.frame,1);}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-cameraX-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){ctx.fillStyle='#cc2222';ctx.beginPath();ctx.arc(20+i*22,15,8,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('STAGE '+stage,W-15,20);
}

function drawTitle(dt){
ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Street scene bg
ctx.fillStyle='#333344';ctx.fillRect(0,H*0.6,W,H*0.4);
// Neon sign effect
var glowI=Math.sin(titlePulse*2)*0.3+0.7;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='rgba(255,50,50,'+glowI+')';ctx.shadowBlur=25+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('DOUBLE DRAGON',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ff8866';ctx.fillText('STREETS OF RAGE',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrows move, Z punch, X/Space kick',W/2,H*0.65);
ctx.fillText('Jump + Punch = Jump Kick!',W/2,H*0.71);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Stage reached: '+stage,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='STG '+stage;
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
if(e.key==='z'||e.key==='Z')keyPunch=down;
if(e.key==='x'||e.key==='X'||e.key===' ')keyKick=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initDoubleDragon=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;keyPunch=v;});bindMobile('btn-down',function(v){keyKick=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopDoubleDragon=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyPunch=keyKick=false;};
})();
