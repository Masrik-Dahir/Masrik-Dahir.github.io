// Snake — Full Game (Enhanced Graphics + Difficulty Progression)
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,gameTime=0,titlePulse=0;
var snake=[],dir={x:1,y:0},nextDir={x:1,y:0},food={x:0,y:0},cs=16,timer=0,speed=0.12;
var particles=[],gridW,gridH;
var foodPulse=0,foodSparkles=[],trailParticles=[];
var level=1;

function diffMult(){return level<=2?0.8:(level<=5?1.0:1.0+(level-5)*0.1);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
gridW=Math.floor(W/cs);gridH=Math.floor(H/cs);}

function placeFood(){do{food={x:Math.floor(Math.random()*gridW),y:Math.floor(Math.random()*gridH)};}while(onSnake(food.x,food.y));
foodSparkles=[];for(var i=0;i<8;i++)foodSparkles.push({a:Math.random()*Math.PI*2,d:8+Math.random()*6,s:0.5+Math.random()*0.5});}
function onSnake(x,y){for(var i=0;i<snake.length;i++)if(snake[i].x===x&&snake[i].y===y)return true;return false;}

function resetGame(){
snake=[];var sx=Math.floor(gridW/2),sy=Math.floor(gridH/2);
for(var i=0;i<5;i++)snake.push({x:sx-i,y:sy});
dir={x:1,y:0};nextDir={x:1,y:0};score=0;gameTime=0;timer=0;speed=0.12;particles=[];trailParticles=[];level=1;
placeFood();gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x*cs+cs/2,y:y*cs+cs/2,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.5+Math.random()*0.4,color:c,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;timer+=dt;foodPulse+=dt*5;
// Calculate level from score
level=Math.floor(score/100)+1;
var dm=diffMult();
var curSpeed=speed/dm;
if(timer<curSpeed)return;timer=0;
dir=nextDir;
var head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
if(head.x<0)head.x=gridW-1;if(head.x>=gridW)head.x=0;
if(head.y<0)head.y=gridH-1;if(head.y>=gridH)head.y=0;
if(onSnake(head.x,head.y)){addParticles(head.x,head.y,'#ff3355',25);gameState='gameover';return;}
// trail particle
trailParticles.push({x:snake[snake.length-1].x*cs+cs/2,y:snake[snake.length-1].y*cs+cs/2,life:0.4,size:cs*0.3});
snake.unshift(head);
if(head.x===food.x&&head.y===food.y){score+=10;addParticles(food.x,food.y,'#ff3355',20);
addParticles(food.x,food.y,'#ffcc00',10);placeFood();speed=Math.max(0.04,speed-0.001);}
else snake.pop();
// particles & trail
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
for(var i=trailParticles.length-1;i>=0;i--){trailParticles[i].life-=dt;trailParticles[i].size*=0.95;if(trailParticles[i].life<=0)trailParticles.splice(i,1);}
}

function render(){
// Background gradient
var bgG=ctx.createLinearGradient(0,0,0,H);
bgG.addColorStop(0,'#050515');bgG.addColorStop(1,'#0a0a25');
ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
// grid dots with subtle glow
ctx.fillStyle='rgba(255,255,255,0.025)';
for(var x=0;x<gridW;x++)for(var y=0;y<gridH;y++){ctx.fillRect(x*cs,y*cs,1,1);ctx.fillRect(x*cs+cs-1,y*cs,1,1);}
// trail particles
for(var i=0;i<trailParticles.length;i++){var tp=trailParticles[i];
ctx.globalAlpha=tp.life*0.3;ctx.fillStyle='#00ff66';
ctx.beginPath();ctx.arc(tp.x,tp.y,tp.size,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
// snake body
for(var i=snake.length-1;i>=0;i--){
var s=snake[i],bright=1-i/snake.length*0.6;
var px=s.x*cs+1,py=s.y*cs+1,pw=cs-2,ph=cs-2;
// body gradient
var g=ctx.createLinearGradient(px,py,px+pw,py+ph);
g.addColorStop(0,'rgba(0,255,100,'+bright+')');g.addColorStop(1,'rgba(0,180,60,'+bright+')');
ctx.fillStyle=g;
// rounded segments
ctx.beginPath();ctx.roundRect(px,py,pw,ph,3);ctx.fill();
// highlight
ctx.fillStyle='rgba(255,255,255,'+(bright*0.15)+')';
ctx.fillRect(px+2,py+1,pw-4,3);
// scale pattern
if(i>0&&i%2===0){ctx.fillStyle='rgba(0,0,0,0.08)';ctx.fillRect(px+2,py+ph/2-1,pw-4,2);}
if(i===0){
// head - eyes
ctx.fillStyle='#fff';
var ex1,ey1,ex2,ey2;
if(dir.x===1){ex1=px+pw*0.55;ey1=py+ph*0.25;ex2=ex1;ey2=py+ph*0.65;}
else if(dir.x===-1){ex1=px+pw*0.35;ey1=py+ph*0.25;ex2=ex1;ey2=py+ph*0.65;}
else if(dir.y===-1){ex1=px+pw*0.25;ey1=py+ph*0.35;ex2=px+pw*0.65;ey2=ey1;}
else{ex1=px+pw*0.25;ey1=py+ph*0.55;ex2=px+pw*0.65;ey2=ey1;}
ctx.beginPath();ctx.arc(ex1,ey1,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex2,ey2,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(ex1+dir.x*1,ey1+dir.y*1,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex2+dir.x*1,ey2+dir.y*1,1.5,0,Math.PI*2);ctx.fill();
// tongue
var tongueLen=4+Math.sin(gameTime*8)*3;
ctx.strokeStyle='#ff3355';ctx.lineWidth=1.5;
var tx=px+pw/2+dir.x*pw/2,ty=py+ph/2+dir.y*ph/2;
ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+dir.x*tongueLen,ty+dir.y*tongueLen);ctx.stroke();
// forked tongue
ctx.beginPath();ctx.moveTo(tx+dir.x*tongueLen,ty+dir.y*tongueLen);
ctx.lineTo(tx+dir.x*(tongueLen+2)+(dir.y!==0?2:0),ty+dir.y*(tongueLen+2)+(dir.x!==0?2:0));ctx.stroke();
ctx.beginPath();ctx.moveTo(tx+dir.x*tongueLen,ty+dir.y*tongueLen);
ctx.lineTo(tx+dir.x*(tongueLen+2)-(dir.y!==0?2:0),ty+dir.y*(tongueLen+2)-(dir.x!==0?2:0));ctx.stroke();
}}
// food with sparkle
var fx=food.x*cs+cs/2,fy=food.y*cs+cs/2;
var fpulse=0.8+0.2*Math.sin(foodPulse);
ctx.save();
ctx.shadowColor='#ff3355';ctx.shadowBlur=12+Math.sin(foodPulse)*4;
// apple shape
var fg=ctx.createRadialGradient(fx-2,fy-2,0,fx,fy,cs/2);
fg.addColorStop(0,'#ff6688');fg.addColorStop(1,'#ff2244');
ctx.fillStyle=fg;
ctx.beginPath();ctx.arc(fx,fy,cs/2-2,0,Math.PI*2);ctx.fill();
// apple highlight
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();ctx.arc(fx-3,fy-3,3,0,Math.PI*2);ctx.fill();
// stem
ctx.strokeStyle='#663322';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(fx,fy-cs/2+2);ctx.lineTo(fx+2,fy-cs/2-3);ctx.stroke();
// leaf
ctx.fillStyle='#44cc44';ctx.beginPath();ctx.ellipse(fx+4,fy-cs/2-1,4,2,0.5,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// sparkles around food
for(var i=0;i<foodSparkles.length;i++){var sp=foodSparkles[i];
var sa=sp.a+gameTime*2;var sd=sp.d+Math.sin(gameTime*3+i)*3;
var sx=fx+Math.cos(sa)*sd,sy=fy+Math.sin(sa)*sd;
ctx.globalAlpha=0.5+0.3*Math.sin(gameTime*5+i);
ctx.fillStyle='#ffcc00';ctx.fillRect(sx-1,sy-1,2,2);}
ctx.globalAlpha=1;
ctx.restore();
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*1.5;ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
// score on screen
ctx.fillStyle='rgba(255,255,255,0.08)';ctx.font='bold '+Math.round(W*0.15)+'px "Courier New",monospace';ctx.textAlign='center';ctx.fillText(score,W/2,H/2+W*0.05);
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,0.3)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}

function drawTitle(dt){
ctx.fillStyle='#050515';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff66';ctx.shadowBlur=25+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#00ff66';ctx.fillText('SNAKE',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('CLASSIC EDITION',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to steer',W/2,H*0.65);
// animated snake preview
var previewY=H*0.78;
for(var i=0;i<8;i++){
var bright=1-i/8*0.6;
var px=W/2-60+i*15+Math.sin(titlePulse+i*0.5)*5;
ctx.fillStyle='rgba(0,255,100,'+bright+')';ctx.beginPath();ctx.roundRect(px,previewY-6+Math.cos(titlePulse+i*0.5)*3,12,12,3);ctx.fill();}
ctx.restore();}

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
document.removeEventListener('keydown',kd);
window.removeEventListener('resize',resize);
gameState='title';};
})();
