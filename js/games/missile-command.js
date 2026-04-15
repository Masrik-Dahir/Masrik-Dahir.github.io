// Missile Command — Full Game (Enhanced Graphics + Difficulty Progression)
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,level=1,gameTime=0,titlePulse=0;
var cities=[],missiles=[],interceptors=[],explosions=[],particles=[],stars=[];
var LAUNCH_SPEED=500,MISSILE_SPEED=25,ammo=60;
var screenShake=0;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.7,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});}

function resetCities(){cities=[];var cityW=40;
var positions=[W*0.1,W*0.2,W*0.35,W*0.65,W*0.8,W*0.9];
for(var i=0;i<6;i++)cities.push({x:positions[i],alive:true});}

function spawnWave(){
missiles=[];var count=3+level*2; // fewer missiles: 5 at wave 1, 7 at wave 2, etc.
for(var i=0;i<count;i++){
var alive=[];for(var c=0;c<cities.length;c++)if(cities[c].alive)alive.push(cities[c]);
if(alive.length===0)break;
var target=alive[Math.floor(Math.random()*alive.length)];
var dm=diffMult();
missiles.push({sx:Math.random()*W,sy:-20-Math.random()*200,tx:target.x,ty:H-40,
x:0,y:0,t:0,speed:((MISSILE_SPEED+level*4)*dm)/(400+Math.random()*250),trail:[],alive:true});
missiles[missiles.length-1].x=missiles[missiles.length-1].sx;
missiles[missiles.length-1].y=missiles[missiles.length-1].sy;}}

function resetGame(){
score=0;level=1;gameTime=0;ammo=60;interceptors=[];explosions=[];particles=[];
resetCities();spawnWave();gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250,life:0.5+Math.random()*0.5,color:c,size:1.5+Math.random()*3});}

function launch(tx,ty){
if(ammo<=0)return;ammo--;
interceptors.push({sx:W/2,sy:H-10,tx:tx,ty:ty,x:W/2,y:H-10,speed:LAUNCH_SPEED,alive:true});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// interceptors
for(var i=interceptors.length-1;i>=0;i--){var ic=interceptors[i];
var dx=ic.tx-ic.x,dy=ic.ty-ic.y,dist=Math.sqrt(dx*dx+dy*dy);
if(dist<5){explosions.push({x:ic.tx,y:ic.ty,r:0,maxR:85+level*5,growing:true,life:2.0});
addParticles(ic.tx,ic.ty,'#ffcc00',8);interceptors.splice(i,1);continue;}
ic.x+=dx/dist*ic.speed*dt;ic.y+=dy/dist*ic.speed*dt;}
// explosions
for(var i=explosions.length-1;i>=0;i--){var ex=explosions[i];
if(ex.growing){ex.r+=120*dt;if(ex.r>=ex.maxR)ex.growing=false;}
else{ex.life-=dt;if(ex.life<=0){explosions.splice(i,1);continue;}}}
// missiles
var allDead=true;
for(var i=missiles.length-1;i>=0;i--){var m=missiles[i];if(!m.alive){continue;}
allDead=false;
m.t+=m.speed*dt;if(m.t>1)m.t=1;
m.x=m.sx+(m.tx-m.sx)*m.t;m.y=m.sy+(m.ty-m.sy)*m.t;
m.trail.push({x:m.x,y:m.y,life:2});
// hit by explosion?
for(var j=0;j<explosions.length;j++){var ex=explosions[j];
var edx=m.x-ex.x,edy=m.y-ex.y;
if(edx*edx+edy*edy<ex.r*ex.r){m.alive=false;score+=25;
addParticles(m.x,m.y,'#ff6622',6);break;}}
// reached target?
if(m.t>=1&&m.alive){m.alive=false;
explosions.push({x:m.tx,y:m.ty,r:0,maxR:30,growing:true,life:0.8});
// damage city
for(var c=0;c<cities.length;c++){if(cities[c].alive&&Math.abs(cities[c].x-m.tx)<25){
cities[c].alive=false;addParticles(cities[c].x,H-40,'#ff3355',25);screenShake=0.3;break;}}}}
if(screenShake>0)screenShake-=dt;
// trail fade
for(var i=0;i<missiles.length;i++){for(var j=missiles[i].trail.length-1;j>=0;j--){
missiles[i].trail[j].life-=dt;if(missiles[i].trail[j].life<=0)missiles[i].trail.splice(j,1);}}
// check wave complete
var anyAlive=false;for(var i=0;i<missiles.length;i++)if(missiles[i].alive)anyAlive=true;
if(!anyAlive&&explosions.length===0){
var citiesAlive=0;for(var c=0;c<cities.length;c++)if(cities[c].alive)citiesAlive++;
if(citiesAlive===0){gameState='gameover';}
else{level++;ammo=Math.min(ammo+25+level*3,70);score+=citiesAlive*100;
// restore one destroyed city every 3 waves as a bonus
if(level%3===0){for(var rc=0;rc<cities.length;rc++){if(!cities[rc].alive){cities[rc].alive=true;addParticles(cities[rc].x,H-40,'#00ff66',15);break;}}}
spawnWave();}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.save();
var shk=screenShake>0?screenShake:0;
ctx.translate((Math.random()-0.5)*shk*15,(Math.random()-0.5)*shk*15);
// sky gradient (enhanced)
var grad=ctx.createLinearGradient(0,0,0,H);
grad.addColorStop(0,'#000033');grad.addColorStop(0.4,'#000022');grad.addColorStop(0.8,'#110011');grad.addColorStop(1,'#080818');
ctx.fillStyle=grad;ctx.fillRect(-5,-5,W+10,H+10);
// stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*(0.5+0.3*Math.sin(gameTime*1.5+i));ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// ground
ctx.fillStyle='#1a3300';ctx.fillRect(0,H-30,W,30);
ctx.fillStyle='#224400';ctx.fillRect(0,H-35,W,8);
// cities
for(var i=0;i<cities.length;i++){var c=cities[i];
if(c.alive){
ctx.fillStyle='#00ccff';
// building shapes
ctx.fillRect(c.x-15,H-55,8,20);ctx.fillRect(c.x-5,H-65,10,30);ctx.fillRect(c.x+7,H-50,8,15);
// windows
ctx.fillStyle='#ffcc00';for(var wy=0;wy<3;wy++){ctx.fillRect(c.x-13,H-53+wy*6,3,3);ctx.fillRect(c.x-2,H-63+wy*8,3,3);ctx.fillRect(c.x+9,H-48+wy*5,3,3);}
}else{
ctx.fillStyle='#333';ctx.fillRect(c.x-12,H-38,5,3);ctx.fillRect(c.x-2,H-40,7,5);ctx.fillRect(c.x+8,H-37,5,2);}}
// launcher
ctx.fillStyle='#888';ctx.fillRect(W/2-15,H-40,30,10);ctx.fillRect(W/2-5,H-50,10,15);
ctx.fillStyle='#aaa';ctx.font='10px "Courier New"';ctx.textAlign='center';ctx.fillText(ammo,W/2,H-15);
// missile trails
for(var i=0;i<missiles.length;i++){var m=missiles[i];
for(var j=1;j<m.trail.length;j++){var t=m.trail[j];ctx.strokeStyle='rgba(255,50,50,'+(t.life*0.4)+')';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(m.trail[j-1].x,m.trail[j-1].y);ctx.lineTo(t.x,t.y);ctx.stroke();}
if(m.alive){ctx.fillStyle='#ff3355';ctx.shadowColor='#ff3355';ctx.shadowBlur=4;ctx.beginPath();ctx.arc(m.x,m.y,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
// interceptors
for(var i=0;i<interceptors.length;i++){var ic=interceptors[i];
ctx.strokeStyle='rgba(0,200,255,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ic.sx,ic.sy);ctx.lineTo(ic.x,ic.y);ctx.stroke();
ctx.fillStyle='#00ccff';ctx.beginPath();ctx.arc(ic.x,ic.y,2.5,0,Math.PI*2);ctx.fill();}
// explosions
for(var i=0;i<explosions.length;i++){var ex=explosions[i];
var alpha=ex.growing?0.8:ex.life*0.7;
var g=ctx.createRadialGradient(ex.x,ex.y,0,ex.x,ex.y,ex.r);
g.addColorStop(0,'rgba(255,255,200,'+alpha+')');g.addColorStop(0.3,'rgba(255,150,50,'+alpha*0.8+')');g.addColorStop(1,'rgba(255,50,50,0)');
ctx.fillStyle=g;ctx.beginPath();ctx.arc(ex.x,ex.y,ex.r,0,Math.PI*2);ctx.fill();}
// crosshair
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.5)');ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
ctx.restore();
}

function drawTitle(dt){
var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#000022');grad.addColorStop(1,'#080818');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*0.6;ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff3355';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.055)+'px "Courier New",monospace';ctx.fillStyle='#ff3355';ctx.fillText('MISSILE COMMAND',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('DEFEND YOUR CITIES',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Click / Tap to launch interceptors',W/2,H*0.65);ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Waves survived: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='WAVE '+level;
document.getElementById('hud-time').textContent=ammo+' AMMO';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

window.initMissileCommand=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
canvas.addEventListener('click',function(e){
if(gameState!=='playing'){resetGame();return;}
var r=canvas.getBoundingClientRect();launch(e.clientX-r.left,e.clientY-r.top);});
canvas.addEventListener('touchstart',function(e){
e.preventDefault();if(gameState!=='playing'){resetGame();return;}
var r=canvas.getBoundingClientRect();var t=e.touches[0];launch(t.clientX-r.left,t.clientY-r.top);});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopMissileCommand=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);gameState='title';};
})();
