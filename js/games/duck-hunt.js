// Duck Hunt — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,round=1,gameTime=0,titlePulse=0;
var ducks=[],particles=[],clouds=[];
var shots=3,ducksHit=0,ducksPerRound=6,ducksLaunched=0;
var roundTimer=0,betweenRounds=false,roundDelay=2;
var dog={x:0,y:0,state:'hidden',timer:0,frame:0,duckCount:0}; // 'hidden','sniff','jump','laugh','retrieve'
var crosshair={x:0,y:0};
var flashTimer=0;
var GRASS_Y=0,SKY_BOTTOM=0;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var CROSSHAIR_SPEED=300;
var ammoPerDuck=3;

// Difficulty progression: round 1-2 easy, 3-5 medium, 6+ hard
function getDiffMult(){
    return round<=2?0.7:(round<=5?1.0:1.0+(round-5)*0.15);
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
GRASS_Y=H*0.75;SKY_BOTTOM=H*0.7;
crosshair.x=W/2;crosshair.y=H/2;
clouds=[];
for(var i=0;i<6;i++)clouds.push({x:Math.random()*W,y:H*0.05+Math.random()*H*0.2,w:60+Math.random()*80,speed:5+Math.random()*10});
}

function resetGame(){
score=0;round=1;gameTime=0;
ducks=[];particles=[];ducksHit=0;ducksLaunched=0;
shots=ammoPerDuck;betweenRounds=false;roundTimer=0;
dog.state='hidden';dog.timer=0;dog.duckCount=0;
crosshair.x=W/2;crosshair.y=H/2;
flashTimer=0;
gameState='playing';
launchDuck();
}

function launchDuck(){
if(ducksLaunched>=ducksPerRound)return;
ducksLaunched++;
shots=ammoPerDuck;
var dx2=Math.random()>0.5?1:-1;
var dm=getDiffMult();
var spd=(60+round*5+Math.random()*30)*dm;
spd=Math.min(spd,180); // cap speed
ducks.push({
x:W*0.3+Math.random()*W*0.4,
y:GRASS_Y-10,
vx:dx2*spd,
vy:-(spd*0.8+Math.random()*40),
alive:true,
escaping:false,
escapeTimer:0,
falling:false,
fallSpeed:0,
wingPhase:Math.random()*Math.PI*2,
color:Math.random()>0.5?'#2a6a2a':'#1a4a6a',
size:18+Math.random()*6
});
}

function shootAt(sx,sy){
if(gameState!=='playing')return;
if(shots<=0)return;
shots--;
flashTimer=0.1;
addParticles(sx,sy,'#ffcc00',6);

// Check hit on any alive duck
var hit=false;
for(var i=0;i<ducks.length;i++){
var d=ducks[i];
if(!d.alive||d.falling)continue;
var dx3=sx-d.x,dy3=sy-d.y;
if(dx3*dx3+dy3*dy3<(d.size+15)*(d.size+15)){
d.alive=false;d.falling=true;d.fallSpeed=0;d.vy=0;d.vx=0;
score+=100*round;ducksHit++;hit=true;
addParticles(d.x,d.y,'#ff4444',12);
dog.duckCount++;
break;
}
}

// If no shots left and duck still alive, it escapes
if(shots<=0){
for(var i=0;i<ducks.length;i++){
if(ducks[i].alive&&!ducks[i].falling&&!ducks[i].escaping){
ducks[i].escaping=true;ducks[i].vy=-200;
}
}
}
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*3});
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
if(flashTimer>0)flashTimer-=dt;

// Crosshair movement
if(keyLeft)crosshair.x-=CROSSHAIR_SPEED*dt;
if(keyRight)crosshair.x+=CROSSHAIR_SPEED*dt;
if(keyUp)crosshair.y-=CROSSHAIR_SPEED*dt;
if(keyDown)crosshair.y+=CROSSHAIR_SPEED*dt;
crosshair.x=Math.max(0,Math.min(W,crosshair.x));
crosshair.y=Math.max(0,Math.min(H,crosshair.y));

if(keySpace){shootAt(crosshair.x,crosshair.y);keySpace=false;}

// Update ducks
var allDone=true;
for(var i=ducks.length-1;i>=0;i--){
var d=ducks[i];
if(d.falling){
d.fallSpeed+=400*dt;
d.y+=d.fallSpeed*dt;
if(d.y>GRASS_Y){
ducks.splice(i,1);
// Show dog retrieving
if(dog.state==='hidden'){dog.state='retrieve';dog.timer=1.5;dog.x=d.x;dog.y=GRASS_Y;}
continue;
}
allDone=false;
}else if(d.escaping){
d.y+=d.vy*dt;
if(d.y<-40){
ducks.splice(i,1);
// Dog laughs
if(dog.state==='hidden'){dog.state='laugh';dog.timer=1.5;dog.x=W/2;dog.y=GRASS_Y;}
continue;
}
allDone=false;
}else if(d.alive){
d.x+=d.vx*dt;d.y+=d.vy*dt;
d.wingPhase+=dt*8;
// Bounce off walls
if(d.x<20||d.x>W-20)d.vx*=-1;
if(d.y<20)d.vy=Math.abs(d.vy)*0.8;
if(d.y>SKY_BOTTOM-20)d.vy=-Math.abs(d.vy)*0.8;
// Random direction changes
if(Math.random()<dt*1.5){d.vx+=(Math.random()-0.5)*60;d.vy+=(Math.random()-0.5)*60;}
// After some time, escape
d.escapeTimer+=dt;
if(d.escapeTimer>6){d.escaping=true;d.vy=-200;}
allDone=false;
}
}

// Dog animation
if(dog.state!=='hidden'){
dog.timer-=dt;
if(dog.timer<=0){
dog.state='hidden';
// Next duck or next round
if(ducksLaunched<ducksPerRound&&ducks.length===0){
launchDuck();
}else if(ducks.length===0){
// Round over
betweenRounds=true;roundTimer=0;
}
}
}else if(ducks.length===0&&allDone){
// No dog animation needed, proceed
if(ducksLaunched<ducksPerRound){
launchDuck();
}else{
betweenRounds=true;roundTimer=0;
}
}

// Between rounds
if(betweenRounds){
roundTimer+=dt;
if(roundTimer>=roundDelay){
betweenRounds=false;
if(ducksHit===0){
gameState='gameover'; // Failed to hit any duck
}else{
round++;ducksHit=0;ducksLaunched=0;
ducksPerRound=Math.min(10,6+Math.floor(round/3));
ammoPerDuck=3;
launchDuck();
}
}
}

// Clouds
for(var i=0;i<clouds.length;i++){
clouds[i].x-=clouds[i].speed*dt;
if(clouds[i].x<-clouds[i].w)clouds[i].x=W+clouds[i].w;
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function drawSky(){
var sky=ctx.createLinearGradient(0,0,0,SKY_BOTTOM);
sky.addColorStop(0,'#4488cc');sky.addColorStop(0.6,'#88bbee');sky.addColorStop(1,'#aaddff');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,SKY_BOTTOM);
// Sun
ctx.fillStyle='rgba(255,240,200,0.4)';
ctx.beginPath();ctx.arc(W*0.8,H*0.12,40,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffee88';
ctx.beginPath();ctx.arc(W*0.8,H*0.12,25,0,Math.PI*2);ctx.fill();
// Clouds
for(var i=0;i<clouds.length;i++){
var c=clouds[i];
ctx.fillStyle='rgba(255,255,255,0.7)';
ctx.beginPath();ctx.arc(c.x,c.y,c.w*0.25,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(c.x+c.w*0.2,c.y-5,c.w*0.2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(c.x+c.w*0.4,c.y,c.w*0.22,0,Math.PI*2);ctx.fill();
}
}

function drawGrass(){
// Grass
var grass=ctx.createLinearGradient(0,GRASS_Y,0,H);
grass.addColorStop(0,'#44aa44');grass.addColorStop(0.3,'#338833');grass.addColorStop(1,'#226622');
ctx.fillStyle=grass;ctx.fillRect(0,GRASS_Y,W,H-GRASS_Y);
// Grass blades
ctx.strokeStyle='#55bb55';ctx.lineWidth=1.5;
for(var i=0;i<40;i++){
var gx=i*W/40+Math.sin(i)*5;
ctx.beginPath();ctx.moveTo(gx,GRASS_Y);
ctx.quadraticCurveTo(gx+Math.sin(gameTime+i)*5,GRASS_Y-12-Math.random()*5,gx+3,GRASS_Y-18);
ctx.stroke();
}
// Trees in background
for(var i=0;i<5;i++){
var tx=W*0.1+i*W*0.2;
// Trunk
ctx.fillStyle='#664422';ctx.fillRect(tx-4,GRASS_Y-40,8,40);
// Foliage
ctx.fillStyle='#336633';
ctx.beginPath();ctx.arc(tx,GRASS_Y-55,22,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#448844';
ctx.beginPath();ctx.arc(tx-8,GRASS_Y-48,16,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(tx+8,GRASS_Y-48,16,0,Math.PI*2);ctx.fill();
}
}

function drawDuck(d){
if(!d)return;
var x=d.x,y=d.y;
var wingY=Math.sin(d.wingPhase)*8;
var facingR=d.vx>0?1:-1;

ctx.save();ctx.translate(x,y);
if(facingR<0)ctx.scale(-1,1);

if(d.falling){
// Falling duck
ctx.fillStyle=d.color;ctx.beginPath();ctx.ellipse(0,0,d.size*0.6,d.size*0.4,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(5,-2,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.fillText('X',3,-4);
}else{
// Body with gradient
var bodyGrad=ctx.createRadialGradient(-2,-2,d.size*0.1,0,0,d.size*0.6);
var dc1=d.color;var dc2=dc1==='#2a6a2a'?'#1a4a1a':'#0a3a5a';
bodyGrad.addColorStop(0,dc1);bodyGrad.addColorStop(1,dc2);
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.ellipse(0,0,d.size*0.6,d.size*0.35,0,0,Math.PI*2);ctx.fill();
// Body outline
ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,d.size*0.6,d.size*0.35,0,0,Math.PI*2);ctx.stroke();
// Wing with animation
ctx.fillStyle='rgba(255,255,255,0.2)';
ctx.beginPath();ctx.ellipse(-2,wingY-5,d.size*0.4,d.size*0.25,-0.2,0,Math.PI*2);ctx.fill();
// Wing highlight
ctx.fillStyle='rgba(255,255,255,0.1)';
ctx.beginPath();ctx.ellipse(-2,wingY-8,d.size*0.25,d.size*0.12,-0.2,0,Math.PI*2);ctx.fill();
// Head with gradient
var headGrad=ctx.createRadialGradient(d.size*0.45,-d.size*0.2,2,d.size*0.5,-d.size*0.15,d.size*0.25);
headGrad.addColorStop(0,dc1==='#2a6a2a'?'#3a8a3a':'#2a5a7a');headGrad.addColorStop(1,dc1);
ctx.fillStyle=headGrad;
ctx.beginPath();ctx.arc(d.size*0.5,-d.size*0.15,d.size*0.25,0,Math.PI*2);ctx.fill();
// Eye
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(d.size*0.55,-d.size*0.2,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(d.size*0.57,-d.size*0.2,1.5,0,Math.PI*2);ctx.fill();
// Beak
ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.moveTo(d.size*0.7,-d.size*0.15);ctx.lineTo(d.size*0.9,-d.size*0.1);
ctx.lineTo(d.size*0.7,-d.size*0.05);ctx.closePath();ctx.fill();
}
ctx.restore();
}

function drawDog(){
if(dog.state==='hidden')return;
var x=dog.x,y=dog.y;
ctx.save();ctx.translate(x,y);

// Body
ctx.fillStyle='#aa7744';
ctx.beginPath();ctx.ellipse(0,5,20,12,0,0,Math.PI*2);ctx.fill();
// Head
ctx.fillStyle='#cc9966';
ctx.beginPath();ctx.arc(0,-12,14,0,Math.PI*2);ctx.fill();
// Ears
ctx.fillStyle='#886633';
ctx.beginPath();ctx.ellipse(-12,-8,5,10,-0.3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(12,-8,5,10,0.3,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(-5,-14,2.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(5,-14,2.5,0,Math.PI*2);ctx.fill();
// Nose
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(0,-9,3,0,Math.PI*2);ctx.fill();

if(dog.state==='laugh'){
// Open mouth laughing
ctx.fillStyle='#ff6666';
ctx.beginPath();ctx.arc(0,-5,6,0,Math.PI);ctx.fill();
// Tongue
ctx.fillStyle='#ff8888';
ctx.beginPath();ctx.ellipse(0,0,3,5,0,0,Math.PI*2);ctx.fill();
}else if(dog.state==='retrieve'){
// Holding duck
ctx.fillStyle='#2a6a2a';
ctx.beginPath();ctx.ellipse(0,18,12,6,0,0,Math.PI*2);ctx.fill();
// Happy expression
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(0,-6,3,0,Math.PI);ctx.stroke();
}

ctx.restore();
}

function render(){
drawSky();
drawGrass();

// Ducks
for(var i=0;i<ducks.length;i++)drawDuck(ducks[i]);

// Dog
drawDog();

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

// Flash effect
if(flashTimer>0){
ctx.fillStyle='rgba(255,255,200,'+(flashTimer*5)+')';ctx.fillRect(0,0,W,H);
}

// Crosshair with glow
ctx.save();
ctx.shadowColor='#ff0000';ctx.shadowBlur=6;
ctx.strokeStyle='#ff3333';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(crosshair.x,crosshair.y,15,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.moveTo(crosshair.x-22,crosshair.y);ctx.lineTo(crosshair.x-8,crosshair.y);ctx.stroke();
ctx.beginPath();ctx.moveTo(crosshair.x+8,crosshair.y);ctx.lineTo(crosshair.x+22,crosshair.y);ctx.stroke();
ctx.beginPath();ctx.moveTo(crosshair.x,crosshair.y-22);ctx.lineTo(crosshair.x,crosshair.y-8);ctx.stroke();
ctx.beginPath();ctx.moveTo(crosshair.x,crosshair.y+8);ctx.lineTo(crosshair.x,crosshair.y+22);ctx.stroke();
// Center dot
ctx.fillStyle='#ff0000';ctx.beginPath();ctx.arc(crosshair.x,crosshair.y,2,0,Math.PI*2);ctx.fill();
ctx.restore();

// HUD overlay
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,H-30,W,30);
// Shots remaining
ctx.fillStyle='#ffcc00';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<shots;i++){
ctx.fillText('\u2022',15+i*18,H-10);
}
// Round
ctx.fillStyle='#fff';ctx.font='12px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('ROUND '+round,W/2,H-10);
// Duck count
ctx.fillStyle='#aaa';ctx.textAlign='right';
ctx.fillText('HIT: '+ducksHit+'/'+ducksLaunched,W-15,H-10);

// Between rounds message
if(betweenRounds){
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,H*0.35,W,H*0.15);
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(ducksHit>0?'ROUND '+(round+1)+' COMING...':'ROUND CLEAR!',W/2,H*0.44);
}
}

function drawTitle(dt){
titlePulse+=dt*3;
drawSky();drawGrass();
// Flying ducks in background
for(var i=0;i<3;i++){
var dx=((titlePulse*30+i*200)%(W+100))-50;
var dy=H*0.2+Math.sin(titlePulse+i*2)*30+i*40;
ctx.fillStyle=i%2===0?'#2a6a2a':'#1a4a6a';
ctx.beginPath();ctx.ellipse(dx,dy,12,7,0,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#cc6600';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ff8800';
ctx.fillText('DUCK HUNT',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffaa44';
ctx.fillText('READY... AIM... FIRE!',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);
ctx.fillStyle='#fff';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to aim crosshair, Space to shoot',W/2,H*0.6);
ctx.fillText('Click/Tap directly on ducks to shoot them!',W/2,H*0.66);
ctx.fillText('3 shots per duck - don\'t miss!',W/2,H*0.72);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.3,W*0.6,H*0.38,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Rounds: '+round+'  Ducks hit: '+dog.duckCount,W/2,H*0.63);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='RND '+round;
document.getElementById('hud-time').textContent=shots+' AMMO';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initDuckHunt=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(e2){
if(gameState!=='playing'){resetGame();return;}
var rect=canvas.getBoundingClientRect();
var mx=e2.clientX-rect.left,my=e2.clientY-rect.top;
// Scale to canvas coordinates
mx=mx*(canvas.width/rect.width);my=my*(canvas.height/rect.height);
crosshair.x=mx;crosshair.y=my;
shootAt(mx,my);
});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopDuckHunt=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
