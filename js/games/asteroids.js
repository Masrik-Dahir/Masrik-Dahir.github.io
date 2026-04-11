// Asteroids — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=5,level=1,gameTime=0,titlePulse=0;
var ship,bullets=[],asteroids=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyUp=false,keySpace=false,lastShot=0;
var SHIP_ACCEL=300,SHIP_DRAG=0.98,SHIP_TURN=4,BULLET_SPEED=500,BULLET_LIFE=1.5;
// Planet colors for variety
var PLANET_COLORS=[
{fill:'rgba(180,100,60,0.3)',stroke:'#bb8844'},   // brown rocky
{fill:'rgba(60,80,160,0.3)',stroke:'#5577cc'},     // blue ice
{fill:'rgba(160,60,60,0.3)',stroke:'#cc5555'},      // red mars
{fill:'rgba(80,160,80,0.3)',stroke:'#66bb66'},      // green
{fill:'rgba(140,100,160,0.3)',stroke:'#aa77cc'},    // purple
{fill:'rgba(160,160,80,0.3)',stroke:'#bbbb55'},     // yellow
{fill:'rgba(100,100,120,0.2)',stroke:'#aaa'}        // grey classic
];

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<100;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});}

function wrap(o){if(o.x<-20)o.x=W+20;if(o.x>W+20)o.x=-20;if(o.y<-20)o.y=H+20;if(o.y>H+20)o.y=-20;}

function spawnAsteroids(){
asteroids=[];var count=4+level*3;
// Spawn away from ship center
for(var i=0;i<count;i++){var a=Math.random()*Math.PI*2;
var sx,sy;do{sx=Math.random()*W;sy=Math.random()*H;}while(Math.abs(sx-W/2)<100&&Math.abs(sy-H/2)<100);
var spd=40+Math.random()*60+level*8;
var rad=28+Math.random()*18;
asteroids.push({x:sx,y:sy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
r:rad,rot:0,rotSpeed:(Math.random()-0.5)*2.5,verts:makeVerts(rad),size:3,
colorIdx:Math.floor(Math.random()*PLANET_COLORS.length)});}}

function makeVerts(r){var n=8+Math.floor(Math.random()*5),v=[];for(var i=0;i<n;i++){var a=Math.PI*2*i/n;v.push({a:a,d:r*(0.7+Math.random()*0.6)});}return v;}

function splitAsteroid(ast){
if(ast.size<=1)return;
var numParts=ast.size>=3?3:2; // large asteroids split into 3 pieces
for(var i=0;i<numParts;i++){var a=Math.random()*Math.PI*2,nr=ast.r*0.55;
asteroids.push({x:ast.x,y:ast.y,vx:Math.cos(a)*(60+Math.random()*70+level*5),vy:Math.sin(a)*(60+Math.random()*70+level*5),
r:nr,rot:0,rotSpeed:(Math.random()-0.5)*3,verts:makeVerts(nr),size:ast.size-1,
colorIdx:ast.colorIdx});}}

function resetGame(){
ship={x:W/2,y:H/2,vx:0,vy:0,rot:-Math.PI/2,thrust:false,invince:2};
score=0;lives=5;level=1;gameTime=0;bullets=[];particles=[];
spawnAsteroids();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.5+Math.random()*0.5,color:color,size:1.5+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// ship rotation
if(keyLeft)ship.rot-=SHIP_TURN*dt;
if(keyRight)ship.rot+=SHIP_TURN*dt;
// thrust
ship.thrust=keyUp;
if(keyUp){ship.vx+=Math.cos(ship.rot)*SHIP_ACCEL*dt;ship.vy+=Math.sin(ship.rot)*SHIP_ACCEL*dt;
if(Math.random()<0.5)particles.push({x:ship.x-Math.cos(ship.rot)*14,y:ship.y-Math.sin(ship.rot)*14,vx:-Math.cos(ship.rot)*100+(Math.random()-0.5)*40,vy:-Math.sin(ship.rot)*100+(Math.random()-0.5)*40,life:0.2+Math.random()*0.2,color:'#ff6622',size:2+Math.random()*2});}
ship.vx*=SHIP_DRAG;ship.vy*=SHIP_DRAG;
ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;wrap(ship);
if(ship.invince>0)ship.invince-=dt;
// shoot
if(keySpace&&gameTime-lastShot>0.18){lastShot=gameTime;
bullets.push({x:ship.x+Math.cos(ship.rot)*16,y:ship.y+Math.sin(ship.rot)*16,vx:Math.cos(ship.rot)*BULLET_SPEED+ship.vx*0.3,vy:Math.sin(ship.rot)*BULLET_SPEED+ship.vy*0.3,life:BULLET_LIFE});}
// bullets
for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;wrap(b);if(b.life<=0)bullets.splice(i,1);}
// asteroids
for(var i=0;i<asteroids.length;i++){var a=asteroids[i];a.x+=a.vx*dt;a.y+=a.vy*dt;a.rot+=a.rotSpeed*dt;wrap(a);}
// bullet-asteroid collision
for(var b=bullets.length-1;b>=0;b--){for(var a=asteroids.length-1;a>=0;a--){
var dx=bullets[b].x-asteroids[a].x,dy=bullets[b].y-asteroids[a].y;
if(dx*dx+dy*dy<asteroids[a].r*asteroids[a].r){
score+=[0,100,50,20][asteroids[a].size]||10;
addParticles(asteroids[a].x,asteroids[a].y,'#ffcc00',8+asteroids[a].size*4);
splitAsteroid(asteroids[a]);asteroids.splice(a,1);bullets.splice(b,1);break;}}}
// ship-asteroid collision
if(ship.invince<=0){for(var i=0;i<asteroids.length;i++){var a=asteroids[i];
var dx=ship.x-a.x,dy=ship.y-a.y;
if(dx*dx+dy*dy<(a.r+10)*(a.r+10)){lives--;addParticles(ship.x,ship.y,'#00ccff',25);
ship.x=W/2;ship.y=H/2;ship.vx=0;ship.vy=0;ship.invince=2;
if(lives<=0)gameState='gameover';break;}}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
// level clear
if(asteroids.length===0){level++;spawnAsteroids();}
}

function drawShip(x,y,rot,alpha){
ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=alpha;
ctx.strokeStyle='#00ccff';ctx.lineWidth=2;ctx.shadowColor='#00ccff';ctx.shadowBlur=6;
ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,10);ctx.lineTo(-6,0);ctx.lineTo(-10,-10);ctx.closePath();ctx.stroke();
if(ship.thrust&&Math.random()>0.3){ctx.fillStyle='#ff6622';ctx.beginPath();ctx.moveTo(-8,4);ctx.lineTo(-18-Math.random()*8,0);ctx.lineTo(-8,-4);ctx.fill();}
ctx.shadowBlur=0;ctx.restore();ctx.globalAlpha=1;}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
// stars
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*0.5;ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
// asteroids (planet-colored)
for(var i=0;i<asteroids.length;i++){var a=asteroids[i];
var pc=PLANET_COLORS[a.colorIdx||0];
ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot);
ctx.strokeStyle=pc.stroke;ctx.lineWidth=1.5;ctx.beginPath();
ctx.moveTo(a.verts[0].d*Math.cos(a.verts[0].a),a.verts[0].d*Math.sin(a.verts[0].a));
for(var j=1;j<a.verts.length;j++)ctx.lineTo(a.verts[j].d*Math.cos(a.verts[j].a),a.verts[j].d*Math.sin(a.verts[j].a));
ctx.closePath();ctx.stroke();ctx.fillStyle=pc.fill;ctx.fill();
// surface detail — craters on large asteroids
if(a.size>=2){ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.8;
for(var c=0;c<a.size;c++){ctx.beginPath();ctx.arc(a.r*0.2*(c-1),a.r*0.15*(c%2?1:-1),a.r*0.15,0,Math.PI*2);ctx.stroke();}}
ctx.restore();}
// ship
var sAlpha=ship.invince>0?(Math.sin(gameTime*15)>0?0.3:0.9):1;
drawShip(ship.x,ship.y,ship.rot,sAlpha);
// bullets
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){ctx.beginPath();ctx.arc(bullets[i].x,bullets[i].y,2.5,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// lives
for(var i=0;i<lives;i++){ctx.save();ctx.translate(25+i*28,H-20);ctx.rotate(-Math.PI/2);ctx.strokeStyle='#00ccff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,5);ctx.lineTo(-3,0);ctx.lineTo(-5,-5);ctx.closePath();ctx.stroke();ctx.restore();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-10);
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.fillStyle='#fff';for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=s.b*(0.3+0.2*Math.sin(gameTime*2+i));ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('ASTEROIDS',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#00ccff';ctx.fillText('SPACE ROCKS',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to rotate, Up to thrust, Space to shoot',W/2,H*0.65);
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
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initAsteroids=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopAsteroids=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keyUp=keySpace=false;};
})();
