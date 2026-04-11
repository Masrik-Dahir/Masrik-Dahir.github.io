// Flappy Bird — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}
var canvas,ctx,W,H,animId=null,gameState='title',score=0,bestScore=0,gameTime=0,titlePulse=0;
var bird,pipes=[],particles=[],clouds=[];
var GRAVITY=500,FLAP=-280,PIPE_GAP=210,PIPE_W=48,PIPE_SPEED=110,SPAWN_INTERVAL=2.6;
var pipeTimer=0;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
clouds=[];for(var i=0;i<6;i++)clouds.push({x:Math.random()*W,y:30+Math.random()*H*0.3,w:60+Math.random()*80,s:0.3+Math.random()*0.5});}

function resetGame(){
bird={x:W*0.25,y:H/2,vy:0,rot:0,flapFrame:0};
pipes=[];particles=[];pipeTimer=0;score=0;gameTime=0;
gameState='playing';}

function addPipe(){
var gapY=100+Math.random()*(H-PIPE_GAP-200);
pipes.push({x:W+10,gapY:gapY,scored:false});}

function flap(){
if(gameState==='playing'){bird.vy=FLAP;bird.flapFrame=0.15;
addParticles(bird.x-10,bird.y,'#ffcc00',4);}
if(gameState!=='playing')resetGame();}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*100,life:0.3+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// bird physics
bird.vy+=GRAVITY*dt;bird.y+=bird.vy*dt;
bird.rot=Math.max(-0.5,Math.min(1.2,bird.vy/400));
bird.flapFrame-=dt;
// clouds
for(var i=0;i<clouds.length;i++){clouds[i].x-=clouds[i].s*30*dt;if(clouds[i].x+clouds[i].w<0){clouds[i].x=W+20;clouds[i].y=30+Math.random()*H*0.3;}}
// pipes
pipeTimer+=dt;if(pipeTimer>=SPAWN_INTERVAL){pipeTimer=0;addPipe();}
var pSpeed=PIPE_SPEED+score*0.5;
for(var i=pipes.length-1;i>=0;i--){var p=pipes[i];p.x-=pSpeed*dt;
// score
if(!p.scored&&p.x+PIPE_W<bird.x){p.scored=true;score++;if(score>bestScore)bestScore=score;}
if(p.x+PIPE_W<-10){pipes.splice(i,1);continue;}
// collision
var bx=bird.x,by=bird.y,br=12;
if(bx+br>p.x&&bx-br<p.x+PIPE_W){
if(by-br<p.gapY||by+br>p.gapY+PIPE_GAP){
addParticles(bird.x,bird.y,'#ff3355',20);gameState='gameover';return;}}}
// ground/ceiling
if(bird.y+12>H-30){bird.y=H-42;addParticles(bird.x,bird.y,'#ff3355',15);gameState='gameover';return;}
if(bird.y-12<0){bird.y=12;bird.vy=0;}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawBird(x,y,rot){
ctx.save();ctx.translate(x,y);ctx.rotate(rot);
// body
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffaa00';ctx.shadowBlur=6;
ctx.beginPath();ctx.ellipse(0,0,16,12,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
// wing
var wingY=bird.flapFrame>0?-8:-2;ctx.fillStyle='#ff9900';
ctx.beginPath();ctx.ellipse(-4,wingY,10,6,bird.flapFrame>0?-0.4:0.2,0,Math.PI*2);ctx.fill();
// eye
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(8,-3,5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(9,-3,2.5,0,Math.PI*2);ctx.fill();
// beak
ctx.fillStyle='#ff6622';ctx.beginPath();ctx.moveTo(14,-2);ctx.lineTo(22,2);ctx.lineTo(14,5);ctx.fill();
ctx.restore();}

function render(){
// sky gradient
var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#4488cc');grad.addColorStop(0.7,'#88ccee');grad.addColorStop(1,'#aaddbb');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
// clouds
for(var i=0;i<clouds.length;i++){var c=clouds[i];ctx.fillStyle='rgba(255,255,255,0.4)';
ctx.beginPath();ctx.ellipse(c.x,c.y,c.w/2,15,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(c.x+c.w*0.2,c.y-10,c.w*0.3,12,0,0,Math.PI*2);ctx.fill();}
// pipes
for(var i=0;i<pipes.length;i++){var p=pipes[i];
// top pipe
var pg=ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);pg.addColorStop(0,'#2d8b2d');pg.addColorStop(0.5,'#44cc44');pg.addColorStop(1,'#2d8b2d');
ctx.fillStyle=pg;ctx.fillRect(p.x,0,PIPE_W,p.gapY);
ctx.fillRect(p.x-4,p.gapY-20,PIPE_W+8,20);
// bottom pipe
ctx.fillStyle=pg;ctx.fillRect(p.x,p.gapY+PIPE_GAP,PIPE_W,H-30-p.gapY-PIPE_GAP);
ctx.fillRect(p.x-4,p.gapY+PIPE_GAP,PIPE_W+8,20);
// pipe highlights
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(p.x+4,0,8,p.gapY);ctx.fillRect(p.x+4,p.gapY+PIPE_GAP,8,H-30-p.gapY-PIPE_GAP);}
// ground
ctx.fillStyle='#8B7355';ctx.fillRect(0,H-30,W,30);
ctx.fillStyle='#6B5335';for(var i=0;i<W;i+=20){ctx.fillRect(i,H-30,10,5);}
ctx.fillStyle='#44aa44';ctx.fillRect(0,H-32,W,4);
// bird
drawBird(bird.x,bird.y,bird.rot);
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// score display — responsive position, clamped font, background pill for readability
var scoreFontSz=Math.max(18,Math.min(Math.round(W*0.05),40));
var scoreY=Math.max(scoreFontSz+10,H*0.1);
var scoreTxt=''+score;
ctx.font='bold '+scoreFontSz+'px "Courier New",monospace';ctx.textAlign='center';
var tw=ctx.measureText(scoreTxt).width;
ctx.fillStyle='rgba(0,0,0,0.35)';
ctx.beginPath();ctx.roundRect(W/2-tw/2-14,scoreY-scoreFontSz+2,tw+28,scoreFontSz+10,8);ctx.fill();
ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;
ctx.strokeText(scoreTxt,W/2,scoreY);ctx.fillText(scoreTxt,W/2,scoreY);
}

function drawTitle(dt){
var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#4488cc');grad.addColorStop(1,'#88ccee');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
for(var i=0;i<clouds.length;i++){var c=clouds[i];ctx.fillStyle='rgba(255,255,255,0.4)';ctx.beginPath();ctx.ellipse(c.x,c.y,c.w/2,15,0,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#8B7355';ctx.fillRect(0,H-30,W,30);ctx.fillStyle='#44aa44';ctx.fillRect(0,H-32,W,4);
ctx.save();ctx.textAlign='center';
ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.strokeText('FLAPPY BIRD',W/2,H*0.3);ctx.fillStyle='#ffcc00';ctx.fillText('FLAPPY BIRD',W/2,H*0.3);
if(bestScore>0){ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#fff';ctx.strokeText('BEST: '+bestScore,W/2,H*0.38);ctx.fillText('BEST: '+bestScore,W/2,H*0.38);}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.strokeText('PRESS ENTER, TAB, SPACE, OR TAP',W/2,H*0.55);ctx.fillText('PRESS ENTER, TAB, SPACE, OR TAP',W/2,H*0.55);
ctx.fillStyle='#fff';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.strokeText('Space / Up / Tap to flap',W/2,H*0.65);ctx.fillText('Space / Up / Tap to flap',W/2,H*0.65);
// animated bird
drawBird(W/2,H*0.44+Math.sin(titlePulse*2)*10,-0.1);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.strokeText('GAME OVER',W/2,H*0.25);ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
ctx.strokeText(score,W/2,H*0.42);ctx.fillText(score,W/2,H*0.42);
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('BEST: '+bestScore,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('TAP OR PRESS ENTER TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='BEST '+bestScore;
document.getElementById('hud-time').textContent='';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){drawTitle(dt);for(var i=0;i<clouds.length;i++)clouds[i].x-=clouds[i].s*30*dt;}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(down&&(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W')&&gameState==='playing')flap();
if(down&&(e.key==='Enter'||e.key==='Tab'||e.key===' ')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

window.initFlappyBird=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
canvas.addEventListener('click',function(){if(gameState==='playing')flap();else resetGame();});
canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState==='playing')flap();else resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopFlappyBird=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);gameState='title';};
})();
