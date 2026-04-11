// Pong — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var ball,p1,p2,p1Score=0,p2Score=0,PADDLE_H=80,PADDLE_W=12,BALL_R=6,PADDLE_SPEED=350,BALL_SPEED=350;
var keyUp=false,keyDown=false,particles=[],trail=[];
var WIN_SCORE=7;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function resetBall(dir){
ball={x:W/2,y:H/2,vx:BALL_SPEED*dir*(0.8+Math.random()*0.4),vy:(Math.random()-0.5)*BALL_SPEED*0.6};trail=[];}

function resetGame(){
p1={x:20,y:H/2,h:PADDLE_H};p2={x:W-20-PADDLE_W,y:H/2,h:PADDLE_H};
p1Score=0;p2Score=0;gameTime=0;particles=[];
resetBall(1);gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*300,vy:(Math.random()-0.5)*300,life:0.3+Math.random()*0.3,color:c,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// player paddle
if(keyUp)p1.y-=PADDLE_SPEED*dt;
if(keyDown)p1.y+=PADDLE_SPEED*dt;
p1.y=Math.max(p1.h/2,Math.min(H-p1.h/2,p1.y));
// AI paddle
var aiTarget=ball.y;var aiSpeed=PADDLE_SPEED*(0.5+p2Score*0.03);
if(p2.y<aiTarget-30)p2.y+=aiSpeed*dt;
else if(p2.y>aiTarget+30)p2.y-=aiSpeed*dt;
p2.y=Math.max(p2.h/2,Math.min(H-p2.h/2,p2.y));
// ball
ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
// trail
trail.push({x:ball.x,y:ball.y,life:0.3});for(var i=trail.length-1;i>=0;i--){trail[i].life-=dt;if(trail[i].life<=0)trail.splice(i,1);}
// top/bottom bounce
if(ball.y-BALL_R<0){ball.y=BALL_R;ball.vy=Math.abs(ball.vy);}
if(ball.y+BALL_R>H){ball.y=H-BALL_R;ball.vy=-Math.abs(ball.vy);}
// paddle collision
if(ball.x-BALL_R<p1.x+PADDLE_W&&ball.x+BALL_R>p1.x&&ball.y>p1.y-p1.h/2&&ball.y<p1.y+p1.h/2){
ball.vx=Math.abs(ball.vx)*1.05;ball.vy+=((ball.y-p1.y)/(p1.h/2))*200;ball.x=p1.x+PADDLE_W+BALL_R;
addParticles(ball.x,ball.y,'#00ccff',8);}
if(ball.x+BALL_R>p2.x&&ball.x-BALL_R<p2.x+PADDLE_W&&ball.y>p2.y-p2.h/2&&ball.y<p2.y+p2.h/2){
ball.vx=-Math.abs(ball.vx)*1.05;ball.vy+=((ball.y-p2.y)/(p2.h/2))*200;ball.x=p2.x-BALL_R;
addParticles(ball.x,ball.y,'#ff4466',8);}
// scoring
if(ball.x<-20){p2Score++;addParticles(0,ball.y,'#ff4466',20);if(p2Score>=WIN_SCORE)gameState='gameover';else resetBall(1);}
if(ball.x>W+20){p1Score++;addParticles(W,ball.y,'#00ccff',20);if(p1Score>=WIN_SCORE)gameState='gameover';else resetBall(-1);}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
// center line
ctx.setLineDash([8,8]);ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
// scores
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.font='bold '+Math.round(W*0.1)+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(p1Score,W*0.3,80);ctx.fillText(p2Score,W*0.7,80);
// trail
for(var i=0;i<trail.length;i++){var t=trail[i];ctx.fillStyle='rgba(255,255,255,'+(t.life*0.3)+')';ctx.beginPath();ctx.arc(t.x,t.y,BALL_R*t.life*2,0,Math.PI*2);ctx.fill();}
// ball
ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(ball.x,ball.y,BALL_R,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
// paddles
var g1=ctx.createLinearGradient(p1.x,0,p1.x+PADDLE_W,0);g1.addColorStop(0,'#0088cc');g1.addColorStop(1,'#00ccff');
ctx.fillStyle=g1;ctx.fillRect(p1.x,p1.y-p1.h/2,PADDLE_W,p1.h);
var g2=ctx.createLinearGradient(p2.x,0,p2.x+PADDLE_W,0);g2.addColorStop(0,'#ff4466');g2.addColorStop(1,'#cc2244');
ctx.fillStyle=g2;ctx.fillRect(p2.x,p2.y-p2.h/2,PADDLE_W,p2.h);
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#fff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#fff';ctx.fillText('PONG',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('FIRST TO '+WIN_SCORE+' WINS',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Up/Down or W/S to move paddle',W/2,H*0.65);ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
var won=p1Score>=WIN_SCORE;
ctx.shadowColor=won?'#00ccff':'#ff4466';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle=won?'#00ccff':'#ff4466';ctx.fillText(won?'YOU WIN!':'YOU LOSE',W/2,H*0.3);ctx.shadowBlur=0;
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
ctx.fillText(p1Score+' - '+p2Score,W/2,H*0.45);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=p1Score+' - '+p2Score;
document.getElementById('hud-speed').textContent='';
document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initPong=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopPong=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyUp=keyDown=false;};
})();
