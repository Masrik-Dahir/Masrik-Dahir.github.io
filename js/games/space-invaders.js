// Space Invaders — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],eBullets=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keySpace=false,lastShot=0;
var PLAYER_SPEED=450,BULLET_SPEED=550,ENEMY_BULLET_SPEED=140;
var moveDir=1,moveTimer=0,moveInterval=0.6,dropAmount=20,edgeReached=false;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*1.5,p:Math.random()*Math.PI*2});}

function spawnEnemies(){
enemies=[];var cols=Math.min(8+level,12),rows=Math.min(3+Math.floor(level/2),6);
var ew=30,eh=22,gap=12,totalW=cols*(ew+gap),startX=(W-totalW)/2+gap/2;
var colors=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccff','#aa44ff'];
for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
enemies.push({x:startX+c*(ew+gap),y:60+r*(eh+gap+4),w:ew,h:eh,alive:true,type:r%3,color:colors[r%colors.length],frame:0});
}}

function resetGame(){
player={x:W/2,y:H-50,w:40,h:20};bullets=[];eBullets=[];particles=[];
score=0;lives=5;level=1;gameTime=0;moveDir=1;moveTimer=0;moveInterval=0.6;
spawnEnemies();gameState='playing';}

function addParticles(x,y,color,count){for(var i=0;i<count;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.5+Math.random()*0.5,color:color,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// player
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));
// shoot
if(keySpace&&gameTime-lastShot>0.25){lastShot=gameTime;bullets.push({x:player.x,y:player.y-player.h/2,w:3,h:12});keySpace=false;}
// bullets
for(var i=bullets.length-1;i>=0;i--){bullets[i].y-=BULLET_SPEED*dt;if(bullets[i].y<-10)bullets.splice(i,1);}
// enemy movement
moveTimer+=dt;
if(moveTimer>=moveInterval){moveTimer=0;edgeReached=false;
for(var i=0;i<enemies.length;i++){if(!enemies[i].alive)continue;
if((enemies[i].x+enemies[i].w>W-10&&moveDir>0)||(enemies[i].x<10&&moveDir<0))edgeReached=true;}
if(edgeReached){moveDir*=-1;for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].y+=dropAmount;}
else{for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].x+=moveDir*18;}
for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].frame=(enemies[i].frame+1)%2;}
// enemy shoot
var aliveEnemies=[];for(var i=0;i<enemies.length;i++)if(enemies[i].alive)aliveEnemies.push(enemies[i]);
if(aliveEnemies.length>0&&Math.random()<(0.012+level*0.004)*dt*60){
var shooter=aliveEnemies[Math.floor(Math.random()*aliveEnemies.length)];
eBullets.push({x:shooter.x+shooter.w/2,y:shooter.y+shooter.h,w:3,h:10});}
// enemy bullets
for(var i=eBullets.length-1;i>=0;i--){eBullets[i].y+=(ENEMY_BULLET_SPEED+level*10)*dt;if(eBullets[i].y>H+10)eBullets.splice(i,1);}
// bullet-enemy collision
for(var b=bullets.length-1;b>=0;b--){for(var e=0;e<enemies.length;e++){if(!enemies[e].alive)continue;
var en=enemies[e],bu=bullets[b];
if(bu.x>en.x&&bu.x<en.x+en.w&&bu.y>en.y&&bu.y<en.y+en.h){
enemies[e].alive=false;bullets.splice(b,1);score+=10*(enemies[e].type+1);
addParticles(en.x+en.w/2,en.y+en.h/2,en.color,12);break;}}}
// enemy bullet-player collision
for(var i=eBullets.length-1;i>=0;i--){var eb=eBullets[i];
if(eb.x>player.x-player.w/2&&eb.x<player.x+player.w/2&&eb.y>player.y-player.h/2&&eb.y<player.y+player.h/2){
eBullets.splice(i,1);lives--;addParticles(player.x,player.y,'#00ccff',20);
if(lives<=0)gameState='gameover';}}
// enemy reach player
for(var i=0;i<enemies.length;i++){if(enemies[i].alive&&enemies[i].y+enemies[i].h>player.y-player.h){gameState='gameover';break;}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
// level clear
if(aliveEnemies.length===0){level++;moveInterval=Math.max(0.15,0.6-level*0.05);spawnEnemies();}
}

function drawStars(){ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i],a=0.3+0.3*Math.sin(gameTime*2+s.p);ctx.globalAlpha=a;ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;}

function drawEnemy(e){
var x=e.x,y=e.y,w=e.w,h=e.h,f=e.frame;
ctx.fillStyle=e.color;
if(e.type===0){ctx.fillRect(x+4,y,w-8,h);ctx.fillRect(x,y+4,w,h-8);ctx.fillRect(x+2,y+h-4,4,4);ctx.fillRect(x+w-6,y+h-4,4,4);if(f===0){ctx.fillRect(x-2,y+h-6,4,4);ctx.fillRect(x+w-2,y+h-6,4,4);}else{ctx.fillRect(x+2,y+h,4,4);ctx.fillRect(x+w-6,y+h,4,4);}}
else if(e.type===1){ctx.fillRect(x+2,y,w-4,h);ctx.fillRect(x,y+3,w,h-6);if(f===0){ctx.fillRect(x-3,y+2,4,6);ctx.fillRect(x+w-1,y+2,4,6);}else{ctx.fillRect(x-3,y+h-8,4,6);ctx.fillRect(x+w-1,y+h-8,4,6);}}
else{ctx.fillRect(x+6,y,w-12,h);ctx.fillRect(x+2,y+3,w-4,h-6);ctx.fillRect(x,y+6,w,h-12);if(f===0){ctx.fillRect(x+4,y+h-2,4,4);ctx.fillRect(x+w-8,y+h-2,4,4);}else{ctx.fillRect(x+2,y+h-2,4,4);ctx.fillRect(x+w-6,y+h-2,4,4);}}
ctx.fillStyle='#000';ctx.fillRect(x+6,y+6,4,4);ctx.fillRect(x+w-10,y+6,4,4);
}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);drawStars();
// enemies
for(var i=0;i<enemies.length;i++)if(enemies[i].alive)drawEnemy(enemies[i]);
// player
ctx.fillStyle='#00ff66';ctx.fillRect(player.x-player.w/2,player.y-player.h/2,player.w,player.h);
ctx.fillRect(player.x-3,player.y-player.h/2-8,6,8);
ctx.fillStyle='#00cc55';ctx.fillRect(player.x-player.w/2+4,player.y-player.h/2+3,player.w-8,player.h-6);
// bullets
ctx.fillStyle='#00ff66';ctx.shadowColor='#00ff66';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++)ctx.fillRect(bullets[i].x-1.5,bullets[i].y,3,12);
ctx.shadowBlur=0;
// enemy bullets
ctx.fillStyle='#ff4444';ctx.shadowColor='#ff4444';ctx.shadowBlur=4;
for(var i=0;i<eBullets.length;i++)ctx.fillRect(eBullets[i].x-1.5,eBullets[i].y,3,10);
ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.fillStyle=p.color;ctx.globalAlpha=p.life;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// lives
for(var i=0;i<lives;i++){ctx.fillStyle='#00ff66';ctx.fillRect(15+i*25,H-25,16,10);ctx.fillRect(15+i*25+6,H-32,4,7);}
// level
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-18);
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);drawStars();titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff66';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#00ff66';ctx.fillText('SPACE INVADERS',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('DEFEND EARTH',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / A-D to move, Space to shoot',W/2,H*0.65);
// draw sample enemies
var sz=24,gap=40,startX=W/2-2*gap;
var cols=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccff'];
for(var i=0;i<5;i++){ctx.fillStyle=cols[i];ctx.fillRect(startX+i*gap-sz/2,H*0.75,sz,sz*0.7);}
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){drawTitle(dt);titlePulse+=dt;}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initSpaceInvaders=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopSpaceInvaders=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keySpace=false;};
})();
