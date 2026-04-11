// Snake — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,gameTime=0,titlePulse=0;
var snake=[],dir={x:1,y:0},nextDir={x:1,y:0},food={x:0,y:0},cs=16,timer=0,speed=0.14;
var particles=[],gridW,gridH;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
gridW=Math.floor(W/cs);gridH=Math.floor(H/cs);}

function placeFood(){do{food={x:Math.floor(Math.random()*gridW),y:Math.floor(Math.random()*gridH)};}while(onSnake(food.x,food.y));}
function onSnake(x,y){for(var i=0;i<snake.length;i++)if(snake[i].x===x&&snake[i].y===y)return true;return false;}

function resetGame(){
snake=[];var sx=Math.floor(gridW/2),sy=Math.floor(gridH/2);
for(var i=0;i<5;i++)snake.push({x:sx-i,y:sy});
dir={x:1,y:0};nextDir={x:1,y:0};score=0;gameTime=0;timer=0;speed=0.14;particles=[];
placeFood();gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x*cs+cs/2,y:y*cs+cs/2,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.4+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;timer+=dt;
if(timer<speed)return;timer=0;
dir=nextDir;
var head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
if(head.x<0)head.x=gridW-1;if(head.x>=gridW)head.x=0;
if(head.y<0)head.y=gridH-1;if(head.y>=gridH)head.y=0;
if(onSnake(head.x,head.y)){addParticles(head.x,head.y,'#ff3355',20);gameState='gameover';return;}
snake.unshift(head);
if(head.x===food.x&&head.y===food.y){score+=10;addParticles(food.x,food.y,'#ff3355',15);placeFood();speed=Math.max(0.06,speed-0.001);}
else snake.pop();
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
// grid dots
ctx.fillStyle='rgba(255,255,255,0.03)';for(var x=0;x<gridW;x++)for(var y=0;y<gridH;y++)ctx.fillRect(x*cs,y*cs,1,1);
// snake
for(var i=0;i<snake.length;i++){
var s=snake[i],bright=1-i/snake.length*0.7;
var g=ctx.createLinearGradient(s.x*cs,s.y*cs,s.x*cs+cs,s.y*cs+cs);
g.addColorStop(0,'rgba(0,255,100,'+bright+')');g.addColorStop(1,'rgba(0,200,80,'+bright+')');
ctx.fillStyle=g;ctx.fillRect(s.x*cs+1,s.y*cs+1,cs-2,cs-2);
if(i===0){ctx.fillStyle='#fff';var ex=s.x*cs+cs*0.25,ey=s.y*cs+cs*0.3;
if(dir.x===1){ex=s.x*cs+cs*0.6;}else if(dir.x===-1){ex=s.x*cs+cs*0.15;}
ctx.beginPath();ctx.arc(ex,ey,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ex+dir.y*5,ey+5,2.5,0,Math.PI*2);ctx.fill();}}
// food
ctx.fillStyle='#ff3355';ctx.shadowColor='#ff3355';ctx.shadowBlur=10;
ctx.beginPath();ctx.arc(food.x*cs+cs/2,food.y*cs+cs/2,cs/2-2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// score on screen
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.font='bold '+Math.round(W*0.15)+'px "Courier New",monospace';ctx.textAlign='center';ctx.fillText(score,W/2,H/2+W*0.05);
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff66';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#00ff66';ctx.fillText('SNAKE',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('CLASSIC EDITION',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to steer',W/2,H*0.65);ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Length: '+snake.length,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LEN '+snake.length;
document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(!down)return;
if((e.key==='ArrowLeft'||e.key==='a'||e.key==='A')&&dir.x!==1)nextDir={x:-1,y:0};
if((e.key==='ArrowRight'||e.key==='d'||e.key==='D')&&dir.x!==-1)nextDir={x:1,y:0};
if((e.key==='ArrowUp'||e.key==='w'||e.key==='W')&&dir.y!==1)nextDir={x:0,y:-1};
if((e.key==='ArrowDown'||e.key==='s'||e.key==='S')&&dir.y!==-1)nextDir={x:0,y:1};
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set();});el.addEventListener('mousedown',function(){set();});}

window.initSnake=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
bindMobile('btn-left',function(){if(dir.x!==1)nextDir={x:-1,y:0};});
bindMobile('btn-right',function(){if(dir.x!==-1)nextDir={x:1,y:0};});
bindMobile('btn-up',function(){if(dir.y!==1)nextDir={x:0,y:-1};});
bindMobile('btn-down',function(){if(dir.y!==-1)nextDir={x:0,y:1};});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopSnake=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);gameState='title';};
})();
