// Lunar Lander — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,level=1,gameTime=0,titlePulse=0;
var lander,terrain,pad,particles=[],stars=[];
var GRAVITY=30,THRUST=70,ROTATE_SPEED=3,MAX_LAND_VY=40,MAX_LAND_VX=20,MAX_LAND_ANGLE=0.3;
var fuel=100,keyUp=false,keyLeft=false,keyRight=false;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.7,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});}

function buildTerrain(){
terrain=[];var segs=30;
var padIdx=5+Math.floor(Math.random()*(segs-10));
for(var i=0;i<=segs;i++){
var x=i*W/segs;var y=H*0.6+Math.sin(i*0.5)*40+Math.random()*30;
if(i===padIdx||i===padIdx+1){y=H*0.75;}// flat landing pad
terrain.push({x:x,y:y});}
pad={x:terrain[padIdx].x,y:terrain[padIdx].y,w:terrain[padIdx+1].x-terrain[padIdx].x};}

function resetGame(){
lander={x:W*0.3+Math.random()*W*0.4,y:50,vx:20,vy:0,angle:0,alive:true,landed:false};
fuel=100;particles=[];level=1;score=0;gameTime=0;
buildTerrain();gameState='playing';}

function addParticles(x,y,c,n,spread){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2;var s=spread||200;
particles.push({x:x,y:y,vx:Math.cos(a)*s*(0.3+Math.random()*0.7),vy:Math.sin(a)*s*(0.3+Math.random()*0.7),life:0.5+Math.random()*0.5,color:c,size:1+Math.random()*3});}}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(!lander.alive||lander.landed)return;
// controls
if(keyLeft)lander.angle-=ROTATE_SPEED*dt;
if(keyRight)lander.angle+=ROTATE_SPEED*dt;
if(keyUp&&fuel>0){
var tx=Math.sin(lander.angle)*THRUST,ty=-Math.cos(lander.angle)*THRUST;
lander.vx+=tx*dt;lander.vy+=ty*dt;fuel-=20*dt;if(fuel<0)fuel=0;
// thrust particles
addParticles(lander.x-Math.sin(lander.angle)*15,lander.y+Math.cos(lander.angle)*15,'#ff6622',2,60);}
// gravity
lander.vy+=GRAVITY*dt;
lander.x+=lander.vx*dt;lander.y+=lander.vy*dt;
// wrap horizontally
if(lander.x<0)lander.x=W;if(lander.x>W)lander.x=0;
// check ground collision
for(var i=0;i<terrain.length-1;i++){
var t0=terrain[i],t1=terrain[i+1];
if(lander.x>=t0.x&&lander.x<=t1.x){
var frac=(lander.x-t0.x)/(t1.x-t0.x);
var groundY=t0.y+frac*(t1.y-t0.y);
if(lander.y+12>=groundY){
// On pad?
if(lander.x>=pad.x&&lander.x<=pad.x+pad.w&&Math.abs(lander.vy)<MAX_LAND_VY&&Math.abs(lander.vx)<MAX_LAND_VX&&Math.abs(lander.angle)<MAX_LAND_ANGLE){
lander.landed=true;lander.y=groundY-12;lander.vy=0;lander.vx=0;
score+=Math.round(fuel*10+1000/(Math.abs(lander.vy)+1));
addParticles(lander.x,groundY,'#00ff66',15,80);
level++;setTimeout(function(){if(gameState==='playing'){buildTerrain();lander.x=W*0.3+Math.random()*W*0.4;lander.y=50;lander.vx=15+level*3;lander.vy=0;lander.angle=0;lander.landed=false;fuel=Math.min(fuel+40,100);}},1500);
}else{
lander.alive=false;lander.y=groundY-12;
addParticles(lander.x,groundY,'#ff3355',30,150);gameState='gameover';}
break;}}}
// ceiling
if(lander.y<0){lander.y=0;lander.vy=Math.abs(lander.vy)*0.5;}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
// stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*(0.5+0.3*Math.sin(gameTime*2+i));ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// terrain
ctx.fillStyle='#444';ctx.beginPath();ctx.moveTo(0,H);
for(var i=0;i<terrain.length;i++)ctx.lineTo(terrain[i].x,terrain[i].y);
ctx.lineTo(W,H);ctx.closePath();ctx.fill();
ctx.strokeStyle='#888';ctx.lineWidth=2;ctx.beginPath();
for(var i=0;i<terrain.length;i++){if(i===0)ctx.moveTo(terrain[i].x,terrain[i].y);else ctx.lineTo(terrain[i].x,terrain[i].y);}ctx.stroke();
// landing pad
ctx.fillStyle='#00cc44';ctx.fillRect(pad.x,pad.y-3,pad.w,6);
ctx.fillStyle='#00ff66';ctx.font=Math.max(10,Math.round(pad.w*0.15))+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('LAND HERE',pad.x+pad.w/2,pad.y-8);
// lander
if(lander.alive){
ctx.save();ctx.translate(lander.x,lander.y);ctx.rotate(lander.angle);
// body
ctx.fillStyle='#ddd';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-10,8);ctx.lineTo(10,8);ctx.closePath();ctx.fill();
// window
ctx.fillStyle='#66ccff';ctx.beginPath();ctx.arc(0,-2,4,0,Math.PI*2);ctx.fill();
// legs
ctx.strokeStyle='#aaa';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-14,16);ctx.stroke();
ctx.beginPath();ctx.moveTo(8,8);ctx.lineTo(14,16);ctx.stroke();
// foot pads
ctx.fillStyle='#aaa';ctx.fillRect(-17,14,6,3);ctx.fillRect(11,14,6,3);
// thrust flame
if(keyUp&&fuel>0){ctx.fillStyle='#ff6622';ctx.globalAlpha=0.5+Math.random()*0.5;
ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(0,18+Math.random()*10);ctx.lineTo(4,8);ctx.fill();ctx.globalAlpha=1;}
ctx.restore();}
// HUD overlays
ctx.textAlign='left';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
// fuel bar
ctx.fillStyle='#333';ctx.fillRect(15,15,100,12);
ctx.fillStyle=fuel>30?'#00cc44':fuel>10?'#ffcc00':'#ff3333';ctx.fillRect(15,15,fuel,12);
ctx.fillStyle='#fff';ctx.fillText('FUEL',120,25);
// velocity
ctx.fillText('VX:'+Math.abs(lander.vx).toFixed(0)+' VY:'+Math.abs(lander.vy).toFixed(0),15,45);
var safeVY=Math.abs(lander.vy)<MAX_LAND_VY,safeVX=Math.abs(lander.vx)<MAX_LAND_VX,safeA=Math.abs(lander.angle)<MAX_LAND_ANGLE;
ctx.fillStyle=safeVY?'#0f0':'#f33';ctx.fillText(safeVY?'VY OK':'VY HIGH',W-110,25);
ctx.fillStyle=safeVX?'#0f0':'#f33';ctx.fillText(safeVX?'VX OK':'VX HIGH',W-110,42);
ctx.fillStyle=safeA?'#0f0':'#f33';ctx.fillText(safeA?'ANG OK':'TILT!',W-110,59);
// landed message
if(lander.landed){ctx.textAlign='center';ctx.fillStyle='#00ff66';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('LANDED! +'+score,W/2,H*0.3);}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*0.6;ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// moon surface
ctx.fillStyle='#444';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H*0.75);
for(var x=0;x<=W;x+=30)ctx.lineTo(x,H*0.7+Math.sin(x*0.02)*20+Math.random()*2);
ctx.lineTo(W,H);ctx.closePath();ctx.fill();
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#66ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#66ccff';ctx.fillText('LUNAR LANDER',W/2,H*0.22);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('Land gently on the green pad!',W/2,H*0.33);
ctx.fillStyle='#aaa';ctx.fillText('Up = thrust, Left/Right = rotate',W/2,H*0.40);
ctx.fillText('Land slow & level for bonus points',W/2,H*0.46);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.60);ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('CRASH!',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('TAP OR PRESS ENTER TO TRY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=Math.round(fuel)+'% FUEL';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')keyUp=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initLunarLander=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
canvas.addEventListener('touchstart',function(e){if(gameState!=='playing'){e.preventDefault();resetGame();}});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopLunarLander=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
keyUp=keyLeft=keyRight=false;gameState='title';};
})();
