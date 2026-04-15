// Space Invaders — Full Game (Enhanced Graphics + Difficulty Progression)
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],eBullets=[],particles=[],stars=[],bgStars2=[];
var keyLeft=false,keyRight=false,keySpace=false,lastShot=0;
var PLAYER_SPEED=450,BULLET_SPEED=550,ENEMY_BULLET_SPEED=180;
var moveDir=1,moveTimer=0,moveInterval=0.5,dropAmount=20,edgeReached=false;
var screenShake=0,screenShakeX=0,screenShakeY=0;
var levelFlash=0;

/* ---------- difficulty helpers ---------- */
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}
function enemyShootChance(){return level<=2?0.008:(level<=5?0.012:0.012+level*0.004);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
stars=[];bgStars2=[];for(var i=0;i<100;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*1.5,p:Math.random()*Math.PI*2,spd:0.2+Math.random()*0.5});
for(var i=0;i<40;i++)bgStars2.push({x:Math.random()*W,y:Math.random()*H,s:1+Math.random()*2,p:Math.random()*Math.PI*2,spd:0.5+Math.random()*1});}

function spawnEnemies(){
enemies=[];var cols=Math.min(8+level,12),rows=Math.min(3+Math.floor(level/2),6);
var ew=30,eh=22,gap=12,totalW=cols*(ew+gap),startX=(W-totalW)/2+gap/2;
var colors=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccff','#aa44ff'];
for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
enemies.push({x:startX+c*(ew+gap),y:60+r*(eh+gap+4),w:ew,h:eh,alive:true,type:r%3,color:colors[r%colors.length],frame:0,deathTimer:-1,eyeBlink:Math.random()*5});
}}

function resetGame(){
player={x:W/2,y:H-50,w:40,h:20,engineGlow:0};bullets=[];eBullets=[];particles=[];
score=0;lives=3;level=1;gameTime=0;moveDir=1;moveTimer=0;moveInterval=0.6;screenShake=0;levelFlash=0;
spawnEnemies();gameState='playing';}

function addParticles(x,y,color,count,opts){
opts=opts||{};
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;var speed=(opts.speed||200)*(0.3+Math.random()*0.7);
particles.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
life:0.5+Math.random()*0.5,color:color,size:(opts.minSize||2)+Math.random()*(opts.maxSize||3),
shrink:opts.shrink!==false,startLife:0.5+Math.random()*0.5});}}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(levelFlash>0)levelFlash-=dt;
// screen shake
if(screenShake>0){screenShake-=dt;screenShakeX=(Math.random()-0.5)*screenShake*20;screenShakeY=(Math.random()-0.5)*screenShake*20;}else{screenShakeX=0;screenShakeY=0;}
var dm=diffMult();
// player
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));
player.engineGlow+=(keyLeft||keyRight?1:0-player.engineGlow)*dt*5;
// shoot
if(keySpace&&gameTime-lastShot>0.25){lastShot=gameTime;
bullets.push({x:player.x,y:player.y-player.h/2,w:3,h:12,trail:[]});keySpace=false;}
// bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.trail.push({x:b.x,y:b.y,life:0.12});
b.y-=BULLET_SPEED*dt;
if(b.trail.length>6)b.trail.shift();
for(var t=b.trail.length-1;t>=0;t--){b.trail[t].life-=dt;if(b.trail[t].life<=0)b.trail.splice(t,1);}
if(b.y<-10)bullets.splice(i,1);}
// enemy movement
var mi=Math.max(0.15,moveInterval-dm*0.05);
moveTimer+=dt;
if(moveTimer>=mi){moveTimer=0;edgeReached=false;
for(var i=0;i<enemies.length;i++){if(!enemies[i].alive)continue;
if((enemies[i].x+enemies[i].w>W-10&&moveDir>0)||(enemies[i].x<10&&moveDir<0))edgeReached=true;}
if(edgeReached){moveDir*=-1;for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].y+=dropAmount;}
else{for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].x+=moveDir*18;}
for(var i=0;i<enemies.length;i++)if(enemies[i].alive)enemies[i].frame=(enemies[i].frame+1)%2;}
// enemy shoot
var aliveEnemies=[];for(var i=0;i<enemies.length;i++)if(enemies[i].alive)aliveEnemies.push(enemies[i]);
if(aliveEnemies.length>0&&Math.random()<enemyShootChance()*dt*60){
var shooter=aliveEnemies[Math.floor(Math.random()*aliveEnemies.length)];
eBullets.push({x:shooter.x+shooter.w/2,y:shooter.y+shooter.h,w:3,h:10});}
// enemy bullets
var ebSpd=ENEMY_BULLET_SPEED*dm+level*5;
for(var i=eBullets.length-1;i>=0;i--){eBullets[i].y+=ebSpd*dt;if(eBullets[i].y>H+10)eBullets.splice(i,1);}
// bullet-enemy collision
for(var b=bullets.length-1;b>=0;b--){for(var e=0;e<enemies.length;e++){if(!enemies[e].alive)continue;
var en=enemies[e],bu=bullets[b];
if(bu.x>en.x&&bu.x<en.x+en.w&&bu.y>en.y&&bu.y<en.y+en.h){
enemies[e].alive=false;enemies[e].deathTimer=0.3;bullets.splice(b,1);score+=10*(enemies[e].type+1);
addParticles(en.x+en.w/2,en.y+en.h/2,en.color,20,{speed:250,maxSize:5});
addParticles(en.x+en.w/2,en.y+en.h/2,'#fff',5,{speed:100,maxSize:2});
screenShake=0.1;break;}}}
// enemy bullet-player collision
for(var i=eBullets.length-1;i>=0;i--){var eb=eBullets[i];
if(eb.x>player.x-player.w/2&&eb.x<player.x+player.w/2&&eb.y>player.y-player.h/2&&eb.y<player.y+player.h/2){
eBullets.splice(i,1);lives--;
addParticles(player.x,player.y,'#00ccff',25,{speed:300,maxSize:5});
addParticles(player.x,player.y,'#fff',10,{speed:150,maxSize:3});
screenShake=0.3;
if(lives<=0)gameState='gameover';}}
// enemy reach player
for(var i=0;i<enemies.length;i++){if(enemies[i].alive&&enemies[i].y+enemies[i].h>player.y-player.h){gameState='gameover';break;}}
// death animation timers
for(var i=0;i<enemies.length;i++){if(enemies[i].deathTimer>=0){enemies[i].deathTimer-=dt;}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.shrink)p.size=Math.max(0.5,p.size*(p.life/p.startLife));
if(p.life<=0)particles.splice(i,1);}
// level clear
if(aliveEnemies.length===0){level++;moveInterval=Math.max(0.15,0.6-level*0.05);levelFlash=1;spawnEnemies();}
}

function drawStars(){
// layer 1 - dim
for(var i=0;i<stars.length;i++){var s=stars[i],a=0.2+0.2*Math.sin(gameTime*2+s.p);
ctx.globalAlpha=a;ctx.fillStyle='#aaccff';ctx.fillRect(s.x,s.y,s.s,s.s);}
// layer 2 - bright
for(var i=0;i<bgStars2.length;i++){var s=bgStars2[i],a=0.4+0.3*Math.sin(gameTime*1.5+s.p);
ctx.globalAlpha=a;ctx.fillStyle='#ffffff';ctx.fillRect(s.x,s.y,s.s,s.s);}
ctx.globalAlpha=1;}

function drawEnemy(e){
if(e.deathTimer>=0&&e.deathTimer<0.3){
// death flash
ctx.globalAlpha=e.deathTimer/0.3;
ctx.fillStyle='#fff';ctx.fillRect(e.x-2,e.y-2,e.w+4,e.h+4);
ctx.globalAlpha=1;return;}
if(!e.alive)return;
var x=e.x,y=e.y,w=e.w,h=e.h,f=e.frame;
ctx.save();
// glow
ctx.shadowColor=e.color;ctx.shadowBlur=6;
ctx.fillStyle=e.color;
if(e.type===0){
// Type 0 - squid-like with antennae
ctx.fillRect(x+4,y,w-8,h);ctx.fillRect(x,y+4,w,h-8);
ctx.fillRect(x+2,y+h-4,4,4);ctx.fillRect(x+w-6,y+h-4,4,4);
if(f===0){ctx.fillRect(x-2,y+h-6,4,4);ctx.fillRect(x+w-2,y+h-6,4,4);}
else{ctx.fillRect(x+2,y+h,4,4);ctx.fillRect(x+w-6,y+h,4,4);}
// antennae
ctx.strokeStyle=e.color;ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+w*0.3,y);ctx.lineTo(x+w*0.2,y-5-Math.sin(gameTime*4)*2);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w*0.7,y);ctx.lineTo(x+w*0.8,y-5+Math.sin(gameTime*4)*2);ctx.stroke();
}
else if(e.type===1){
// Type 1 - crab-like with claws
ctx.fillRect(x+2,y,w-4,h);ctx.fillRect(x,y+3,w,h-6);
if(f===0){ctx.fillRect(x-3,y+2,4,6);ctx.fillRect(x+w-1,y+2,4,6);}
else{ctx.fillRect(x-3,y+h-8,4,6);ctx.fillRect(x+w-1,y+h-8,4,6);}
// claw details
ctx.fillStyle=e.color;
ctx.beginPath();ctx.arc(x-1,f===0?y+5:y+h-5,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w+1,f===0?y+5:y+h-5,3,0,Math.PI*2);ctx.fill();
}
else{
// Type 2 - octopus with tentacles
ctx.beginPath();ctx.arc(x+w/2,y+h*0.4,w*0.4,0,Math.PI*2);ctx.fill();
ctx.fillRect(x+2,y+h*0.4,w-4,h*0.6);
if(f===0){ctx.fillRect(x+4,y+h-2,4,4);ctx.fillRect(x+w-8,y+h-2,4,4);}
else{ctx.fillRect(x+2,y+h-2,4,4);ctx.fillRect(x+w-6,y+h-2,4,4);}
// tentacle wave
for(var t=0;t<3;t++){
var tx=x+4+t*(w-8)/2;
ctx.fillRect(tx,y+h+Math.sin(gameTime*6+t)*2,3,3);}
}
ctx.shadowBlur=0;
// Eyes with tracking
var eyeY=y+6;
var exL=x+6,exR=x+w-10;
// eye whites
ctx.fillStyle='#fff';ctx.fillRect(exL,eyeY,5,5);ctx.fillRect(exR,eyeY,5,5);
// pupils - track player
var dx=player?(player.x-(x+w/2)):0;var pupilOff=Math.max(-1,Math.min(1,dx/200));
ctx.fillStyle='#000';
ctx.fillRect(exL+1+pupilOff,eyeY+1,3,3);ctx.fillRect(exR+1+pupilOff,eyeY+1,3,3);
// blink animation
if(Math.sin(gameTime*2+e.eyeBlink)>0.95){
ctx.fillStyle=e.color;ctx.fillRect(exL,eyeY,5,5);ctx.fillRect(exR,eyeY,5,5);}
ctx.restore();
}

function drawPlayer(){
var px=player.x,py=player.y,pw=player.w,ph=player.h;
ctx.save();
// Engine glow underneath
var eg=ctx.createRadialGradient(px,py+ph/2,0,px,py+ph/2,pw*0.6);
eg.addColorStop(0,'rgba(0,255,100,0.15)');eg.addColorStop(1,'rgba(0,255,100,0)');
ctx.fillStyle=eg;ctx.fillRect(px-pw,py-ph,pw*2,ph*3);
// Ship body gradient
var sg=ctx.createLinearGradient(px-pw/2,py-ph/2,px-pw/2,py+ph/2);
sg.addColorStop(0,'#00ff88');sg.addColorStop(0.5,'#00cc55');sg.addColorStop(1,'#008833');
ctx.fillStyle=sg;
// Main hull
ctx.beginPath();
ctx.moveTo(px-pw/2,py+ph/2);
ctx.lineTo(px-pw/2+4,py-ph/2);
ctx.lineTo(px-3,py-ph/2);
ctx.lineTo(px,py-ph/2-10);
ctx.lineTo(px+3,py-ph/2);
ctx.lineTo(px+pw/2-4,py-ph/2);
ctx.lineTo(px+pw/2,py+ph/2);
ctx.closePath();ctx.fill();
// Cockpit
var cg=ctx.createRadialGradient(px,py-2,0,px,py-2,6);
cg.addColorStop(0,'#aaffcc');cg.addColorStop(1,'#00aa44');
ctx.fillStyle=cg;ctx.beginPath();ctx.arc(px,py-2,5,0,Math.PI*2);ctx.fill();
// Wing accents
ctx.fillStyle='#00aa44';
ctx.fillRect(px-pw/2+2,py,pw/4,3);
ctx.fillRect(px+pw/4-2,py,pw/4,3);
// Cannon tip glow
ctx.shadowColor='#00ff66';ctx.shadowBlur=8;
ctx.fillStyle='#00ff88';ctx.fillRect(px-2,py-ph/2-10,4,6);
ctx.shadowBlur=0;
ctx.restore();
}

function render(){
ctx.save();
ctx.translate(screenShakeX,screenShakeY);
// Background - deep space gradient
var bgG=ctx.createLinearGradient(0,0,0,H);
bgG.addColorStop(0,'#020010');bgG.addColorStop(0.5,'#080820');bgG.addColorStop(1,'#0a0a30');
ctx.fillStyle=bgG;ctx.fillRect(-10,-10,W+20,H+20);
// Nebula effect
ctx.globalAlpha=0.05;
var ng=ctx.createRadialGradient(W*0.3,H*0.4,0,W*0.3,H*0.4,W*0.5);
ng.addColorStop(0,'#ff3366');ng.addColorStop(1,'transparent');
ctx.fillStyle=ng;ctx.fillRect(0,0,W,H);
var ng2=ctx.createRadialGradient(W*0.7,H*0.6,0,W*0.7,H*0.6,W*0.4);
ng2.addColorStop(0,'#3366ff');ng2.addColorStop(1,'transparent');
ctx.fillStyle=ng2;ctx.fillRect(0,0,W,H);
ctx.globalAlpha=1;
drawStars();
// Scanline effect
ctx.fillStyle='rgba(0,0,0,0.03)';
for(var sy=0;sy<H;sy+=3)ctx.fillRect(0,sy,W,1);
// enemies
for(var i=0;i<enemies.length;i++)drawEnemy(enemies[i]);
// player
drawPlayer();
// bullets with trails
ctx.shadowColor='#00ff66';ctx.shadowBlur=8;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
// trail
for(var t=0;t<b.trail.length;t++){
var tr=b.trail[t];
ctx.globalAlpha=tr.life*0.5;
ctx.fillStyle='#00ff66';ctx.fillRect(tr.x-1,tr.y,2,8);}
ctx.globalAlpha=1;
// main bullet
var bg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+12);
bg.addColorStop(0,'#aaffcc');bg.addColorStop(1,'#00ff66');
ctx.fillStyle=bg;ctx.fillRect(b.x-1.5,b.y,3,12);
}
ctx.shadowBlur=0;
// enemy bullets
ctx.shadowColor='#ff4444';ctx.shadowBlur=6;
for(var i=0;i<eBullets.length;i++){
var eb=eBullets[i];
var ebg=ctx.createLinearGradient(eb.x,eb.y,eb.x,eb.y+10);
ebg.addColorStop(0,'#ff4444');ebg.addColorStop(1,'#ff8888');
ctx.fillStyle=ebg;
ctx.beginPath();ctx.ellipse(eb.x,eb.y+5,2,5,0,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];
ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
// lives as mini ships
for(var i=0;i<lives;i++){
ctx.save();ctx.translate(15+i*25+8,H-20);
ctx.fillStyle='#00ff66';ctx.beginPath();
ctx.moveTo(0,-8);ctx.lineTo(-6,4);ctx.lineTo(6,4);ctx.closePath();ctx.fill();
ctx.restore();}
// level indicator
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-18);
// level flash
if(levelFlash>0){ctx.fillStyle='rgba(255,255,255,'+levelFlash*0.3+')';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
ctx.fillStyle='rgba(0,255,100,'+levelFlash+')';ctx.fillText('LEVEL '+level,W/2,H/2);}
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9);
vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,0.4)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
ctx.restore();
}

function drawTitle(dt){
ctx.fillStyle='#020010';ctx.fillRect(0,0,W,H);drawStars();titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
// Title with glow
ctx.shadowColor='#00ff66';ctx.shadowBlur=30+Math.sin(titlePulse)*12;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#00ff66';ctx.fillText('SPACE INVADERS',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('DEFEND EARTH',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / A-D to move, Space to shoot',W/2,H*0.65);
// animated sample enemies
var sz=24,gap=40,startX=W/2-2*gap;
var cols=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccff'];
for(var i=0;i<5;i++){
ctx.fillStyle=cols[i];ctx.shadowColor=cols[i];ctx.shadowBlur=8;
ctx.fillRect(startX+i*gap-sz/2,H*0.75+Math.sin(titlePulse*2+i)*5,sz,sz*0.7);
ctx.shadowBlur=0;}
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
if(gameState==='title'){drawTitle(dt);}
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
