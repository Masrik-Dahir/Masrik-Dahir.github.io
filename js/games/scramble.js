// Scramble — Horizontal scrolling shooter with fuel management
(function(){
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var ship,bullets=[],bombs=[],enemies=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false,keyBomb=false;
var fuel=100,fuelDrainRate=3,SHIP_SPEED=250;
var scrollSpeed=120,scrollX=0;
var terrainTop=[],terrainBottom=[];
var groundTargets=[];
var lastShot=0,lastBomb=0,SHOOT_CD=0.18,BOMB_CD=0.4;
var lastTs=0;
var terrainGenIdx=0,nextTargetSeg=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
initTerrain();initStars();
}

function initStars(){
stars=[];
for(var i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.3,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7,speed:10+Math.random()*40});
}

function initTerrain(){
terrainTop=[];terrainBottom=[];groundTargets=[];
terrainGenIdx=0;nextTargetSeg=40+Math.floor(Math.random()*30);
// Generate initial batch ahead of current view
extendTerrain(Math.ceil(W/6)+200);
}

function extendTerrain(count){
var topY=terrainTop.length>0?terrainTop[terrainTop.length-1]:H*0.08;
var botY=terrainBottom.length>0?terrainBottom[terrainBottom.length-1]:H*0.85;
var startIdx=terrainGenIdx;
for(var i=0;i<count;i++){
var gi=startIdx+i;
topY+=Math.sin(gi*0.015)*2+(Math.random()-0.5)*3;
topY=Math.max(H*0.05,Math.min(H*0.35,topY));
botY+=Math.sin(gi*0.012)*2+(Math.random()-0.5)*3;
botY=Math.max(H*0.65,Math.min(H*0.95,botY));
terrainTop.push(topY);
terrainBottom.push(botY);
// Spawn ground targets as terrain extends
if(terrainGenIdx+i>=nextTargetSeg){
var type=Math.random()<0.4?'fuel':'base';
groundTargets.push({segIdx:terrainGenIdx+i,y:botY,type:type,alive:true,w:20,h:15});
nextTargetSeg=terrainGenIdx+i+40+Math.floor(Math.random()*30);
}
}
terrainGenIdx+=count;
}

function resetGame(){
ship={x:W*0.15,y:H/2,w:36,h:18};
bullets=[];bombs=[];enemies=[];particles=[];
score=0;lives=3;level=1;gameTime=0;fuel=100;
scrollX=0;scrollSpeed=120;
terrainGenIdx=0;nextTargetSeg=40+Math.floor(Math.random()*30);
initTerrain();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=30+Math.random()*150;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2.5});
}}

function spawnEnemy(){
var types=['rocket','ufo'];
var type=types[Math.floor(Math.random()*types.length)];
var segStart=Math.floor(scrollX/6)+Math.floor(W/6)+10;
var topBound=terrainTop[Math.min(segStart,terrainTop.length-1)]||H*0.15;
var botBound=terrainBottom[Math.min(segStart,terrainBottom.length-1)]||H*0.8;
var ey=topBound+30+Math.random()*(botBound-topBound-60);
enemies.push({
x:W+20,y:ey,w:24,h:16,type:type,
vx:type==='rocket'?-200-Math.random()*60:-80-Math.random()*40,
vy:type==='ufo'?0:0,
alive:true,frame:0,shootTimer:1+Math.random()*3
});
}

function drawShip(x,y,w,h){
ctx.save();
// Enhanced fuselage with multi-layer gradient
var grad=ctx.createLinearGradient(x,y,x,y+h);
grad.addColorStop(0,'#88ddff');grad.addColorStop(0.3,'#66ccff');grad.addColorStop(0.7,'#3388cc');grad.addColorStop(1,'#2266aa');
ctx.fillStyle=grad;
ctx.shadowColor='#44aaff';ctx.shadowBlur=8;
ctx.beginPath();
ctx.moveTo(x+w+2,y+h/2);ctx.lineTo(x+w*0.6,y-1);ctx.lineTo(x-2,y+h*0.3);
ctx.lineTo(x-2,y+h*0.7);ctx.lineTo(x+w*0.6,y+h+1);ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
// Nose cone highlight
ctx.fillStyle='rgba(255,255,255,0.15)';
ctx.beginPath();ctx.moveTo(x+w+2,y+h/2);ctx.lineTo(x+w*0.6,y);ctx.lineTo(x+w*0.7,y+h/2);ctx.closePath();ctx.fill();
// Wing stripes
ctx.fillStyle='rgba(255,255,255,0.1)';
ctx.fillRect(x+w*0.2,y+2,w*0.3,2);
ctx.fillRect(x+w*0.2,y+h-4,w*0.3,2);
// Cockpit with glass reflection
var cGrad=ctx.createRadialGradient(x+w*0.55,y+h/2-1,1,x+w*0.55,y+h/2,5);
cGrad.addColorStop(0,'#ddeeff');cGrad.addColorStop(0.5,'#aaddff');cGrad.addColorStop(1,'#6699cc');
ctx.fillStyle=cGrad;
ctx.beginPath();ctx.arc(x+w*0.55,y+h/2,5,0,Math.PI*2);ctx.fill();
// Cockpit reflection
ctx.fillStyle='rgba(255,255,255,0.4)';
ctx.beginPath();ctx.arc(x+w*0.53,y+h/2-2,2,0,Math.PI*2);ctx.fill();
// Engine exhaust with multi-color flame
var flameSize=4+Math.sin(gameTime*15)*2;
ctx.shadowColor='#ff6600';ctx.shadowBlur=12;
ctx.fillStyle='#ff8844';
ctx.beginPath();ctx.moveTo(x-2,y+h*0.35);ctx.lineTo(x-flameSize-6,y+h/2);ctx.lineTo(x-2,y+h*0.65);ctx.closePath();ctx.fill();
ctx.fillStyle='#ffcc44';
ctx.beginPath();ctx.moveTo(x-1,y+h*0.4);ctx.lineTo(x-flameSize-2,y+h/2);ctx.lineTo(x-1,y+h*0.6);ctx.closePath();ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-2,y+h/2,2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.restore();
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);
scrollX+=scrollSpeed*dt;
scrollSpeed=Math.min(level<=2?160:200,120+gameTime*(level<=2?0.5:1)*diffMult);
// Procedurally extend terrain ahead of the camera
var seg=Math.floor(scrollX/6);
var needed=seg+Math.ceil(W/6)+200;
if(needed>terrainGenIdx)extendTerrain(needed-terrainGenIdx+100);
// Clean up ground targets far behind the camera
for(var i=groundTargets.length-1;i>=0;i--){
if(groundTargets[i].segIdx<seg-50){groundTargets.splice(i,1);}
}
// Scroll stars for parallax
for(var i=0;i<stars.length;i++){
stars[i].x-=stars[i].speed*dt;
if(stars[i].x<-5){stars[i].x=W+5;stars[i].y=Math.random()*H*0.3;}
}
var drainMult=level<=2?0.6:diffMult;
fuel-=fuelDrainRate*drainMult*dt;
if(fuel<=0){fuel=0;lives--;
if(lives<=0){gameState='gameover';return;}
fuel=50;
}

// Movement
if(keyUp)ship.y-=SHIP_SPEED*dt;
if(keyDown)ship.y+=SHIP_SPEED*dt;
if(keyLeft)ship.x-=SHIP_SPEED*0.6*dt;
if(keyRight)ship.x+=SHIP_SPEED*0.6*dt;

// Terrain bounds
var seg=Math.floor(scrollX/6);
var topH=terrainTop[Math.min(seg+Math.floor(ship.x/6),terrainTop.length-1)]||H*0.1;
var botH=terrainBottom[Math.min(seg+Math.floor(ship.x/6),terrainBottom.length-1)]||H*0.9;
ship.y=Math.max(topH+15,Math.min(botH-ship.h-5,ship.y));
ship.x=Math.max(10,Math.min(W*0.6,ship.x));

// Shoot
lastShot+=dt;
if(keySpace&&lastShot>=SHOOT_CD){lastShot=0;
bullets.push({x:ship.x+ship.w,y:ship.y+ship.h/2,vx:450,vy:0,w:6,h:3});
}

// Bomb
lastBomb+=dt;
if(keyBomb&&lastBomb>=BOMB_CD){lastBomb=0;
bombs.push({x:ship.x+ship.w/2,y:ship.y+ship.h,vx:scrollSpeed,vy:100,w:6,h:6,gravity:300});
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
bullets[i].x+=bullets[i].vx*dt;
if(bullets[i].x>W+20)bullets.splice(i,1);
}

// Update bombs
for(var i=bombs.length-1;i>=0;i--){
var b=bombs[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=b.gravity*dt;
var bseg=Math.floor(scrollX/6)+Math.floor(b.x/6);
var botAt=terrainBottom[Math.min(bseg,terrainBottom.length-1)]||H*0.9;
if(b.y>=botAt){
addParticles(b.x,b.y,['#ff6600','#ffcc00','#ff0000'][Math.floor(Math.random()*3)],10);
// Check ground target hit
for(var j=0;j<groundTargets.length;j++){
var gt=groundTargets[j];
if(!gt.alive)continue;
var gtScreenX=(gt.segIdx-Math.floor(scrollX/6))*6;
if(Math.abs(b.x-gtScreenX)<30){
gt.alive=false;
if(gt.type==='fuel'){fuel=Math.min(100,fuel+30);score+=100;}
else{score+=150;}
addParticles(gtScreenX,gt.y,['#ff8800','#ffff00'],12);
}
}
score+=10;
bombs.splice(i,1);
}
if(b.y>H+20)bombs.splice(i,1);
}

// Spawn enemies - difficulty scales spawn rate
var eSpawnRate=level<=2?0.003:0.006+level*0.001*diffMult;
if(Math.random()<eSpawnRate)spawnEnemy();

// Update enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}
e.x+=e.vx*dt;
if(e.type==='ufo')e.y+=Math.sin(gameTime*3+i)*40*dt;
e.frame++;
if(e.x<-40){enemies.splice(i,1);continue;}

// Bullet hits
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){
e.alive=false;score+=e.type==='rocket'?200:150;
addParticles(e.x+e.w/2,e.y+e.h/2,['#ff4400','#ffcc00','#fff'],12);
bullets.splice(j,1);break;
}
}

// Enemy-ship collision
if(e.alive&&ship.x+ship.w>e.x&&ship.x<e.x+e.w&&ship.y+ship.h>e.y&&ship.y<e.y+e.h){
e.alive=false;lives--;
addParticles(ship.x+ship.w/2,ship.y+ship.h/2,['#ff0000','#ff6600'],15);
if(lives<=0){gameState='gameover';return;}
}
}

// Level up
if(Math.floor(gameTime/30)>=level){level++;fuelDrainRate=Math.min(6,3+level*0.3);}

// Update particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function render(){
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#000011');bg.addColorStop(1,'#001122');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Stars
for(var i=0;i<stars.length;i++){
var s=stars[i];
ctx.fillStyle='rgba(255,255,255,'+(s.b*(0.5+0.5*Math.sin(gameTime+i)))+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
}

// Top terrain
var seg=Math.floor(scrollX/6);
ctx.fillStyle='#112233';
ctx.beginPath();ctx.moveTo(0,0);
for(var i=0;i<=Math.ceil(W/6)+1;i++){
var ty=terrainTop[Math.min(seg+i,terrainTop.length-1)]||H*0.1;
ctx.lineTo(i*6,ty);
}
ctx.lineTo(W,0);ctx.closePath();ctx.fill();

// Bottom terrain
var btGrad=ctx.createLinearGradient(0,H*0.7,0,H);
btGrad.addColorStop(0,'#223311');btGrad.addColorStop(1,'#112200');
ctx.fillStyle=btGrad;
ctx.beginPath();ctx.moveTo(0,H);
for(var i=0;i<=Math.ceil(W/6)+1;i++){
var by=terrainBottom[Math.min(seg+i,terrainBottom.length-1)]||H*0.85;
ctx.lineTo(i*6,by);
}
ctx.lineTo(W,H);ctx.closePath();ctx.fill();

// Ground targets
for(var j=0;j<groundTargets.length;j++){
var gt=groundTargets[j];
if(!gt.alive)continue;
var gtX=(gt.segIdx-seg)*6;
if(gtX<-30||gtX>W+30)continue;
var gtY=terrainBottom[Math.min(gt.segIdx,terrainBottom.length-1)]||H*0.85;
if(gt.type==='fuel'){
ctx.fillStyle='#ff0000';ctx.fillRect(gtX-8,gtY-15,16,15);
ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('F',gtX,gtY-4);ctx.textAlign='left';
} else {
ctx.fillStyle='#888';ctx.fillRect(gtX-10,gtY-12,20,12);
ctx.fillStyle='#ff4444';ctx.fillRect(gtX-4,gtY-18,8,6);
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
ctx.save();
if(e.type==='rocket'){
ctx.fillStyle='#ff6666';
ctx.beginPath();ctx.moveTo(e.x+e.w,e.y+e.h/2);ctx.lineTo(e.x,e.y);ctx.lineTo(e.x+6,e.y+e.h/2);
ctx.lineTo(e.x,e.y+e.h);ctx.closePath();ctx.fill();
ctx.shadowColor='#ff4400';ctx.shadowBlur=8;
ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(e.x+e.w+4,e.y+e.h/2,3,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle='#aaffaa';
ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2,e.h/3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#66ff66';ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h*0.3,5,0,Math.PI*2);ctx.fill();
ctx.shadowColor='#44ff44';ctx.shadowBlur=8;
ctx.strokeStyle='#44ff44';ctx.lineWidth=1;
ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2+2,e.h/3+2,0,0,Math.PI*2);ctx.stroke();
}
ctx.shadowBlur=0;ctx.restore();
}

// Bullets
ctx.fillStyle='#ffff00';ctx.shadowColor='#ffff00';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){var b=bullets[i];ctx.fillRect(b.x,b.y-1,b.w,b.h);}
ctx.shadowBlur=0;

// Bombs
ctx.fillStyle='#ff8800';
for(var i=0;i<bombs.length;i++){var b=bombs[i];
ctx.beginPath();ctx.arc(b.x,b.y,b.w/2,0,Math.PI*2);ctx.fill();}

// Ship
drawShip(ship.x,ship.y,ship.w,ship.h);

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life/p.maxLife;
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Fuel gauge
var fuelW=120,fuelH=10,fuelX=10,fuelY=10;
ctx.fillStyle='#333';ctx.fillRect(fuelX,fuelY,fuelW,fuelH);
ctx.fillStyle=fuel>30?'#00cc44':fuel>15?'#ffcc00':'#ff0000';
ctx.fillRect(fuelX,fuelY,fuelW*(fuel/100),fuelH);
ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.strokeRect(fuelX,fuelY,fuelW,fuelH);
ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.fillText('FUEL',fuelX+fuelW+5,fuelY+9);

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#66ccff';
ctx.beginPath();ctx.moveTo(W-80+i*25,15);ctx.lineTo(W-80+i*25+15,10);
ctx.lineTo(W-80+i*25+15,20);ctx.closePath();ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#000011');bg.addColorStop(1,'#002211');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

for(var i=0;i<stars.length;i++){
var alpha=stars[i].b*(0.5+0.5*Math.sin(titlePulse+i));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(stars[i].x,stars[i].y,stars[i].s,0,Math.PI*2);ctx.fill();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff88';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#00ffaa';
ctx.fillText('SCRAMBLE',W/2,H*0.28);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.032)+'px "Courier New",monospace';
ctx.fillStyle='#88ccff';
ctx.fillText('DEEP SPACE ASSAULT',W/2,H*0.36);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('UP/DOWN: Move | SPACE: Shoot | DOWN: Bomb',W/2,H*0.63);
ctx.fillText('Bomb fuel depots to refuel!',W/2,H*0.68);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.32,W*0.6,H*0.38,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Time: '+gameTime.toFixed(1)+'s  Level: '+level,W/2,H*0.63);
var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='LVL '+level;
var st=document.getElementById('hud-time');if(st)st.textContent=lives+' HP';
}

function gameLoop(ts){
var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt*3;drawGameOver();}
animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keyDown=down;keyBomb=down;}
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};var ku=function(e){onKey(e,false);};

function bindMobile(id,set){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});
}

window.initScramble=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keyDown=v;keyBomb=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopScramble=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=keyBomb=false;
};
})();
