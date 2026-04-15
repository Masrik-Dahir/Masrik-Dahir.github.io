// Ice Climber — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,floor=1,gameTime=0,titlePulse=0;
var player,platforms=[],iceBlocks=[],enemies=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyJump=false,lastJump=0;
var cameraY=0,targetCameraY=0,scrollSpeed=15;
var GRAVITY=600,JUMP_VEL=-380,PLAYER_SPEED=160;
var PLATFORM_GAP=70,WORLD_HEIGHT=0;
function diffMult(){ return floor<=2?0.7:(floor<=5?1.0:1.0+(floor-5)*0.12); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*2000,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
if(gameState==='title')buildLevel();}

function buildLevel(){
platforms=[];iceBlocks=[];enemies=[];
WORLD_HEIGHT=floor*800+2000;
var numPlats=Math.floor(WORLD_HEIGHT/PLATFORM_GAP);
// Ground
platforms.push({x:0,y:0,w:W,h:12,breakable:false});
for(var i=1;i<numPlats;i++){
var y=-i*PLATFORM_GAP;
var pw=60+Math.random()*100;
var px=Math.random()*(W-pw);
platforms.push({x:px,y:y,w:pw,h:10,breakable:Math.random()>0.3});
// Ice blocks above some platforms
if(Math.random()>0.5){
iceBlocks.push({x:px+Math.random()*pw,y:y-PLATFORM_GAP+10,w:24,h:20,hp:2});}
// Enemies on some platforms
var enemyChance=floor<=2?0.75:0.55;
if(i>3&&Math.random()>enemyChance){
var espd=(40+Math.random()*30)*diffMult();
enemies.push({x:px+pw/2,y:y-14,vx:espd*(Math.random()>0.5?1:-1),
platIdx:platforms.length-1,alive:true,type:Math.random()>0.5?'topi':'nitpicker'});}}
}

function resetGame(){
buildLevel();
player={x:W/2,y:-10,vx:0,vy:0,dir:1,onGround:false,invince:1,frame:0,hammerTimer:0};
score=0;lives=3;floor=1;gameTime=0;cameraY=0;targetCameraY=0;particles=[];
gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200-50,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*8;
// Auto-scroll up slowly
scrollSpeed=15+floor*2;if(scrollSpeed>40)scrollSpeed=40;
targetCameraY-=scrollSpeed*dt;
// Player input
if(keyLeft){player.vx=-PLAYER_SPEED;player.dir=-1;}
else if(keyRight){player.vx=PLAYER_SPEED;player.dir=1;}
else player.vx*=0.8;
// Jump
if(keyJump&&player.onGround&&gameTime-lastJump>0.2){
lastJump=gameTime;player.vy=JUMP_VEL;player.onGround=false;player.hammerTimer=0.3;
}
// Gravity
player.vy+=GRAVITY*dt;if(player.vy>400)player.vy=400;
player.x+=player.vx*dt;player.y+=player.vy*dt;
if(player.invince>0)player.invince-=dt;
// Wrap horizontal
if(player.x<0)player.x=W;if(player.x>W)player.x=0;
// Platform collision
player.onGround=false;
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(player.vy>0&&player.y>p.y-14&&player.y<p.y+p.h&&player.x>p.x-8&&player.x<p.x+p.w+8){
player.y=p.y-14;player.vy=0;player.onGround=true;break;}}
// Hammer hit ice blocks (when jumping up)
if(player.hammerTimer>0){player.hammerTimer-=dt;
for(var i=iceBlocks.length-1;i>=0;i--){var b=iceBlocks[i];
var dx=player.x-b.x,dy=(player.y-10)-b.y;
if(Math.abs(dx)<20&&Math.abs(dy)<20&&player.vy<0){
b.hp--;addParticles(b.x,b.y,'#aaddff',6);
if(b.hp<=0){iceBlocks.splice(i,1);score+=50;addParticles(b.x,b.y,'#ffffff',10);}}}}
// Camera follows player
if(player.y+cameraY<H*0.4)targetCameraY=-player.y+H*0.4;
cameraY+=(targetCameraY-cameraY)*3*dt;
// Die if scrolled off bottom
if(player.y-cameraY>H+50){
lives--;addParticles(player.x,player.y,'#00ccff',15);
player.y=targetCameraY+H*0.3;player.x=W/2;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}
// Score for climbing
var heightScore=Math.floor(-player.y/10);if(heightScore>score)score=heightScore;
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
e.x+=e.vx*dt;
var p=platforms[e.platIdx];
if(p&&(e.x<p.x||e.x>p.x+p.w))e.vx=-e.vx;
// Collision with player
if(player.invince<=0){
var edx=player.x-e.x,edy=player.y-e.y;
if(Math.sqrt(edx*edx+edy*edy)<18){
if(player.vy>0&&player.y<e.y){// Stomp
e.alive=false;score+=200;player.vy=JUMP_VEL*0.5;addParticles(e.x,e.y,'#ff4444',10);}
else{lives--;addParticles(player.x,player.y,'#ff4444',12);
player.y=cameraY+H*0.5;player.x=W/2;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}}}}
// Floor progression
if(-player.y>floor*800){floor++;score+=500;addParticles(player.x,player.y,'#ffcc00',20);}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a1a3a');bg.addColorStop(0.5,'#1a2a4a');bg.addColorStop(1,'#2a1a3a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
ctx.save();ctx.translate(0,cameraY);
// Stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];var sy=((s.y+cameraY)%H+H)%H;ctx.globalAlpha=s.b*0.4;ctx.fillRect(s.x,sy-cameraY,s.s,s.s);}ctx.globalAlpha=1;
// Platforms
for(var i=0;i<platforms.length;i++){var p=platforms[i];
var sy=p.y+cameraY;if(sy<-20||sy>H+20)continue;
if(p.breakable){
ctx.fillStyle='#4488aa';ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.fillStyle='#66aacc';ctx.fillRect(p.x,p.y,p.w,3);
}else{
ctx.fillStyle='#556677';ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.fillStyle='#778899';ctx.fillRect(p.x,p.y,p.w,3);}}
// Ice blocks
for(var i=0;i<iceBlocks.length;i++){var b=iceBlocks[i];
var sy=b.y+cameraY;if(sy<-30||sy>H+30)continue;
ctx.fillStyle=b.hp>1?'#aaddff':'#ffaaaa';ctx.shadowColor='#88ccff';ctx.shadowBlur=8;
ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);ctx.shadowBlur=0;
ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.strokeRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;var sy=e.y+cameraY;if(sy<-30||sy>H+30)continue;
ctx.fillStyle=e.type==='topi'?'#ffffff':'#cc44cc';
ctx.beginPath();ctx.arc(e.x,e.y-6,8,0,Math.PI*2);ctx.fill();
ctx.fillStyle=e.type==='topi'?'#aaaaaa':'#aa22aa';
ctx.fillRect(e.x-6,e.y-2,12,8);
ctx.fillStyle='#000';ctx.fillRect(e.x-3,e.y-9,2,2);ctx.fillRect(e.x+1,e.y-9,2,2);}
// Player
if(player.invince<=0||Math.sin(gameTime*15)>0){
ctx.save();ctx.translate(player.x,player.y);ctx.scale(player.dir,1);
// Shadow
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(0,12,8,3,0,0,Math.PI*2);ctx.fill();
// Parka with gradient
var parkaGrad=ctx.createLinearGradient(-8,-14,8,2);
parkaGrad.addColorStop(0,'#5599ff');parkaGrad.addColorStop(0.5,'#4488ff');parkaGrad.addColorStop(1,'#3366cc');
ctx.fillStyle=parkaGrad;ctx.fillRect(-8,-14,16,16);
// Parka highlight
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(-8,-14,8,16);
// Fur trim
ctx.fillStyle='#ffffff';ctx.fillRect(-8,-14,16,3);
ctx.fillStyle='#eee';ctx.fillRect(-9,-5,18,3);
// Head
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-18,7,0,Math.PI*2);ctx.fill();
// Face
ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-2,-19,1.8,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(3,-19,1.8,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(-2,-19,0.9,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(3,-19,0.9,0,Math.PI*2);ctx.fill();
// Rosy cheeks
ctx.fillStyle='rgba(255,100,100,0.3)';ctx.beginPath();ctx.arc(-4,-16,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(5,-16,2,0,Math.PI*2);ctx.fill();
// Hood with fur detail
ctx.strokeStyle='#3366dd';ctx.lineWidth=2.5;
ctx.beginPath();ctx.arc(0,-18,8,Math.PI*0.6,Math.PI*2.4);ctx.stroke();
ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;
ctx.beginPath();ctx.arc(0,-18,9,Math.PI*0.65,Math.PI*2.35);ctx.stroke();
// Hammer (when active)
if(player.hammerTimer>0){
ctx.save();ctx.shadowColor='#ffaa00';ctx.shadowBlur=6;
ctx.fillStyle='#bb9944';ctx.fillRect(8,-22,12,4);
ctx.fillStyle='#999999';ctx.fillRect(18,-28,8,14);
ctx.fillStyle='#bbbbbb';ctx.fillRect(18,-28,8,3);
ctx.restore();}
// Legs with boots
var lo=Math.sin(player.frame)*3;
ctx.fillStyle='#44aa44';ctx.fillRect(-5,2,4,7+lo);ctx.fillRect(1,2,4,7-lo);
ctx.fillStyle='#553311';ctx.fillRect(-6,8+lo,6,4);ctx.fillRect(0,8-lo,6,4);
ctx.restore();}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
ctx.restore();
// HUD overlay
for(var i=0;i<lives;i++){ctx.fillStyle='#4488ff';ctx.beginPath();ctx.arc(20+i*22,H-18,8,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('FLOOR '+floor,W-15,25);
}

function drawTitle(dt){
ctx.fillStyle='#0a1a3a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Snowfall
for(var i=0;i<30;i++){var sx=(titlePulse*20+i*67)%W;var sy=(titlePulse*40+i*43)%H;
ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(sx,sy,2,2);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#88ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#88ccff';ctx.fillText('ICE CLIMBER',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#aaddff';ctx.fillText('CLIMB THE MOUNTAIN',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to move, Up/Space to jump & hammer',W/2,H*0.65);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Floor reached: '+floor,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='FLR '+floor;
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
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')keyJump=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initIceClimber=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyJump=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopIceClimber=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyJump=false;};
})();
