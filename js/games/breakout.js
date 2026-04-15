// Breakout — Full Game (Enhanced Graphics + Difficulty Progression)
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var paddle,ball,bricks=[],particles=[],powerups=[];
var keyLeft=false,keyRight=false;
var PADDLE_W=110,PADDLE_H=14,PADDLE_SPEED=500,BALL_R=5,BALL_SPEED=280;
var COLS=10,ROWS=6,BRICK_GAP=4;
var COLORS=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccff','#aa44ff'];
var screenShake=0,impactFlash=0;
var ballTrail=[];

function diffMult(){return level<=2?0.8:(level<=5?1.0:1.0+(level-5)*0.12);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function buildBricks(){
bricks=[];var bw=(W-40-(COLS-1)*BRICK_GAP)/COLS,bh=18;
for(var r=0;r<ROWS+Math.floor(level/2);r++){for(var c=0;c<COLS;c++){
bricks.push({x:20+c*(bw+BRICK_GAP),y:50+r*(bh+BRICK_GAP),w:bw,h:bh,alive:true,
color:COLORS[r%COLORS.length],hits:r<2?2:1,maxHits:r<2?2:1});}}}

function resetBall(){
ball={x:W/2,y:H-60,vx:BALL_SPEED*(Math.random()>0.5?1:-1)*0.7,vy:-BALL_SPEED};}

function resetGame(){
paddle={x:W/2,y:H-30};score=0;lives=3;level=1;gameTime=0;particles=[];powerups=[];BALL_SPEED=280;
buildBricks();resetBall();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250,life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// paddle
if(keyLeft)paddle.x-=PADDLE_SPEED*dt;
if(keyRight)paddle.x+=PADDLE_SPEED*dt;
paddle.x=Math.max(PADDLE_W/2,Math.min(W-PADDLE_W/2,paddle.x));
// ball
ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
// wall bounce
if(ball.x-BALL_R<0){ball.x=BALL_R;ball.vx=Math.abs(ball.vx);}
if(ball.x+BALL_R>W){ball.x=W-BALL_R;ball.vx=-Math.abs(ball.vx);}
if(ball.y-BALL_R<0){ball.y=BALL_R;ball.vy=Math.abs(ball.vy);}
// paddle bounce
if(ball.vy>0&&ball.y+BALL_R>=paddle.y-PADDLE_H/2&&ball.y+BALL_R<=paddle.y+PADDLE_H/2&&
ball.x>paddle.x-PADDLE_W/2-BALL_R&&ball.x<paddle.x+PADDLE_W/2+BALL_R){
ball.vy=-Math.abs(ball.vy);
var off=(ball.x-paddle.x)/(PADDLE_W/2);
ball.vx=off*BALL_SPEED*1.2;
ball.y=paddle.y-PADDLE_H/2-BALL_R;
addParticles(ball.x,ball.y,'#00ccff',6);}
// brick collision
for(var i=0;i<bricks.length;i++){var b=bricks[i];if(!b.alive)continue;
if(ball.x+BALL_R>b.x&&ball.x-BALL_R<b.x+b.w&&ball.y+BALL_R>b.y&&ball.y-BALL_R<b.y+b.h){
b.hits--;if(b.hits<=0){b.alive=false;score+=10*level;addParticles(b.x+b.w/2,b.y+b.h/2,b.color,10);
if(Math.random()<0.15)powerups.push({x:b.x+b.w/2,y:b.y+b.h/2,vy:120,type:Math.random()<0.5?'wide':'life',life:1});}
// determine bounce direction
var overlapL=ball.x+BALL_R-b.x,overlapR=b.x+b.w-(ball.x-BALL_R);
var overlapT=ball.y+BALL_R-b.y,overlapB=b.y+b.h-(ball.y-BALL_R);
var minO=Math.min(overlapL,overlapR,overlapT,overlapB);
if(minO===overlapL||minO===overlapR)ball.vx=-ball.vx;
else ball.vy=-ball.vy;
break;}}
// powerups
for(var i=powerups.length-1;i>=0;i--){var p=powerups[i];p.y+=p.vy*dt;p.life-=dt*0.1;
if(p.y>H||p.life<=0){powerups.splice(i,1);continue;}
if(p.y+8>paddle.y-PADDLE_H/2&&p.x>paddle.x-PADDLE_W/2&&p.x<paddle.x+PADDLE_W/2){
if(p.type==='wide'){PADDLE_W=Math.min(180,PADDLE_W+25);setTimeout(function(){PADDLE_W=110;},10000);}
else if(p.type==='life'){lives=Math.min(3,lives+1);}
addParticles(p.x,p.y,'#ffcc00',10);powerups.splice(i,1);}}
// ball lost
if(ball.y>H+20){lives--;addParticles(W/2,H,'#ff3355',20);
if(lives<=0)gameState='gameover';else resetBall();}
// level clear
var alive=0;for(var i=0;i<bricks.length;i++)if(bricks[i].alive)alive++;
if(alive===0){level++;BALL_SPEED=Math.min(450,280+level*15*diffMult());buildBricks();resetBall();}
// screen shake & flash
if(screenShake>0)screenShake-=dt;
if(impactFlash>0)impactFlash-=dt;
// ball trail
ballTrail.push({x:ball.x,y:ball.y,life:0.15});
for(var i=ballTrail.length-1;i>=0;i--){ballTrail[i].life-=dt;if(ballTrail[i].life<=0)ballTrail.splice(i,1);}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.save();
var shk=screenShake>0?screenShake:0;
ctx.translate((Math.random()-0.5)*shk*12,(Math.random()-0.5)*shk*12);
// Background gradient
var bgG=ctx.createLinearGradient(0,0,0,H);bgG.addColorStop(0,'#050520');bgG.addColorStop(1,'#0a0a30');
ctx.fillStyle=bgG;ctx.fillRect(-5,-5,W+10,H+10);
// bricks with 3D effect
for(var i=0;i<bricks.length;i++){var b=bricks[i];if(!b.alive)continue;
ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=4;
ctx.fillRect(b.x,b.y,b.w,b.h);ctx.shadowBlur=0;
// top highlight
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(b.x,b.y,b.w,3);
// left highlight
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(b.x,b.y,2,b.h);
// bottom shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(b.x,b.y+b.h-2,b.w,2);
// right shadow
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(b.x+b.w-2,b.y,2,b.h);
if(b.hits>1){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='center';ctx.fillText('x'+b.hits,b.x+b.w/2,b.y+b.h/2+4);}}
// paddle
var pg=ctx.createLinearGradient(paddle.x-PADDLE_W/2,0,paddle.x+PADDLE_W/2,0);
pg.addColorStop(0,'#0088cc');pg.addColorStop(0.5,'#00ccff');pg.addColorStop(1,'#0088cc');
ctx.fillStyle=pg;ctx.shadowColor='#00ccff';ctx.shadowBlur=8;
ctx.beginPath();ctx.moveTo(paddle.x-PADDLE_W/2+6,paddle.y-PADDLE_H/2);ctx.lineTo(paddle.x+PADDLE_W/2-6,paddle.y-PADDLE_H/2);
ctx.quadraticCurveTo(paddle.x+PADDLE_W/2,paddle.y-PADDLE_H/2,paddle.x+PADDLE_W/2,paddle.y);
ctx.quadraticCurveTo(paddle.x+PADDLE_W/2,paddle.y+PADDLE_H/2,paddle.x+PADDLE_W/2-6,paddle.y+PADDLE_H/2);
ctx.lineTo(paddle.x-PADDLE_W/2+6,paddle.y+PADDLE_H/2);
ctx.quadraticCurveTo(paddle.x-PADDLE_W/2,paddle.y+PADDLE_H/2,paddle.x-PADDLE_W/2,paddle.y);
ctx.quadraticCurveTo(paddle.x-PADDLE_W/2,paddle.y-PADDLE_H/2,paddle.x-PADDLE_W/2+6,paddle.y-PADDLE_H/2);
ctx.fill();ctx.shadowBlur=0;
// ball
ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(ball.x,ball.y,BALL_R,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
// ball trail (enhanced)
for(var i=0;i<ballTrail.length;i++){var bt=ballTrail[i];
ctx.globalAlpha=bt.life*0.5;ctx.fillStyle='#aaccff';
ctx.beginPath();ctx.arc(bt.x,bt.y,BALL_R*bt.life*4,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
// powerups
for(var i=0;i<powerups.length;i++){var p=powerups[i];
ctx.fillStyle=p.type==='wide'?'#00ccff':'#ff66aa';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=6;
ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.font='bold 9px "Courier New"';ctx.textAlign='center';ctx.fillText(p.type==='wide'?'W':'♥',p.x,p.y+3);ctx.shadowBlur=0;}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// lives as hearts
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff66aa';ctx.shadowColor='#ff66aa';ctx.shadowBlur=4;
ctx.beginPath();
var hx=18+i*22,hy=H-14;
ctx.moveTo(hx,hy+2);ctx.bezierCurveTo(hx-6,hy-4,hx-6,hy-8,hx,hy-4);
ctx.bezierCurveTo(hx+6,hy-8,hx+6,hy-4,hx,hy+2);ctx.fill();ctx.shadowBlur=0;}
// level
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-10);
// impact flash
if(impactFlash>0){ctx.fillStyle='rgba(255,255,255,'+impactFlash*0.2+')';ctx.fillRect(0,0,W,H);}
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,0.3)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
ctx.restore();
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#00ccff';ctx.fillText('BREAKOUT',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('BRICK BREAKER',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right or A/D to move paddle',W/2,H*0.65);
// sample bricks
var bx=W/2-100,by=H*0.72;
for(var i=0;i<6;i++){ctx.fillStyle=COLORS[i];ctx.fillRect(bx+i*35,by,30,14);}
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initBreakout=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
canvas.addEventListener('mousemove',function(e){if(gameState==='playing'){var r=canvas.getBoundingClientRect();paddle.x=e.clientX-r.left;}});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopBreakout=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=false;};
})();
