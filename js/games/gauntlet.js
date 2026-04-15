// Gauntlet — Top-down dungeon crawler
(function(){
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,health=200,maxHealth=200,keys=0,floor=1,gameTime=0,titlePulse=0;
var player,projectiles=[],enemies=[],items=[],generators=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var PLAYER_SPEED=160,PROJ_SPEED=300,FIRE_CD=0.3;
var fireTimer=0,lastDirX=0,lastDirY=1;
var TILE=32,mapW=0,mapH=0,map=[];
var camX=0,camY=0;
var healthDrainRate=1; // HP per second
var doorX=0,doorY=0;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
}

function generateDungeon(){
mapW=20+Math.floor(floor*2);mapH=16+Math.floor(floor*1.5);
mapW=Math.min(mapW,30);mapH=Math.min(mapH,24);
map=[];
for(var y=0;y<mapH;y++){
map[y]=[];
for(var x=0;x<mapW;x++){
if(x===0||y===0||x===mapW-1||y===mapH-1)map[y][x]=1; // wall
else map[y][x]=Math.random()<0.2?1:0; // random walls
}
}
// Ensure connectivity with corridors
var cx=Math.floor(mapW/2),cy=Math.floor(mapH/2);
for(var x=1;x<mapW-1;x++){map[cy][x]=0;map[Math.floor(mapH/4)][x]=0;map[Math.floor(mapH*3/4)][x]=0;}
for(var y=1;y<mapH-1;y++){map[y][cx]=0;map[y][Math.floor(mapW/4)]=0;map[y][Math.floor(mapW*3/4)]=0;}

// Place player
player={x:2*TILE,y:2*TILE,w:TILE-4,h:TILE-4,facing:0};

// Place door (exit)
doorX=(mapW-3)*TILE;doorY=(mapH-3)*TILE;
map[mapH-3][mapW-3]=0;

// Place generators
generators=[];
var genCount=Math.min(2+floor,6);
for(var i=0;i<genCount;i++){
var gx,gy;
do{gx=3+Math.floor(Math.random()*(mapW-6));gy=3+Math.floor(Math.random()*(mapH-6));}
while(map[gy][gx]!==0||(gx<4&&gy<4));
generators.push({x:gx*TILE,y:gy*TILE,hp:3+floor,maxHp:3+floor,type:Math.random()<0.5?'ghost':'demon',
spawnTimer:3,spawnRate:Math.max(2,5-floor*0.3),alive:true});
}

// Place items
items=[];
var itemCount=5+Math.floor(floor*1.5);
for(var i=0;i<itemCount;i++){
var ix,iy;
do{ix=2+Math.floor(Math.random()*(mapW-4));iy=2+Math.floor(Math.random()*(mapH-4));}
while(map[iy][ix]!==0);
var type=Math.random()<0.3?'food':Math.random()<0.5?'key':'treasure';
items.push({x:ix*TILE+TILE/4,y:iy*TILE+TILE/4,w:TILE/2,h:TILE/2,type:type,alive:true});
}

// Spawn initial enemies
enemies=[];
var enemyCount=5+floor*3;
for(var i=0;i<enemyCount;i++){
var ex,ey;
do{ex=3+Math.floor(Math.random()*(mapW-6));ey=3+Math.floor(Math.random()*(mapH-6));}
while(map[ey][ex]!==0||(ex<5&&ey<5));
var etype=Math.random()<0.5?'ghost':'demon';
enemies.push({x:ex*TILE,y:ey*TILE,w:TILE-6,h:TILE-6,type:etype,
speed:40+Math.random()*30+floor*3,hp:1,alive:true,frame:0});
}
}

function resetGame(){
score=0;health=200;maxHealth=200;keys=0;floor=1;gameTime=0;
projectiles=[];particles=[];
healthDrainRate=1;
generateDungeon();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=30+Math.random()*100;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.4,maxLife:0.3+Math.random()*0.4,color:color,size:1+Math.random()*2});
}}

function canMove(x,y,w,h){
var x1=Math.floor(x/TILE),y1=Math.floor(y/TILE);
var x2=Math.floor((x+w-1)/TILE),y2=Math.floor((y+h-1)/TILE);
for(var ty=y1;ty<=y2;ty++){
for(var tx=x1;tx<=x2;tx++){
if(ty<0||ty>=mapH||tx<0||tx>=mapW)return false;
if(map[ty][tx]===1)return false;
}
}
return true;
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: floors 1-2 easy, 3-5 medium, 6+ hard
var diffMult=floor<=2?0.7:(floor<=5?1.0:1.0+(floor-5)*0.15);
var drainMult=floor<=2?0.5:diffMult;
health-=healthDrainRate*drainMult*dt;
if(health<=0){health=0;gameState='gameover';return;}

var mx=0,my=0;
if(keyLeft)mx=-1;if(keyRight)mx=1;if(keyUp)my=-1;if(keyDown)my=1;
if(mx!==0&&my!==0){mx*=0.7071;my*=0.7071;}
if(mx!==0||my!==0){lastDirX=mx>0?1:mx<0?-1:0;lastDirY=my>0?1:my<0?-1:0;}

var nx=player.x+mx*PLAYER_SPEED*dt;
var ny=player.y+my*PLAYER_SPEED*dt;
if(canMove(nx,player.y,player.w,player.h))player.x=nx;
if(canMove(player.x,ny,player.w,player.h))player.y=ny;

// Shooting
fireTimer+=dt;
if(keySpace&&fireTimer>=FIRE_CD){
fireTimer=0;
var dx=lastDirX,dy=lastDirY;
if(dx===0&&dy===0)dy=1;
var len=Math.sqrt(dx*dx+dy*dy);
projectiles.push({x:player.x+player.w/2,y:player.y+player.h/2,
vx:dx/len*PROJ_SPEED,vy:dy/len*PROJ_SPEED,life:0.8});
}

// Camera
camX=player.x-W/2+player.w/2;
camY=player.y-H/2+player.h/2;
camX=Math.max(0,Math.min(mapW*TILE-W,camX));
camY=Math.max(0,Math.min(mapH*TILE-H,camY));

// Update projectiles
for(var i=projectiles.length-1;i>=0;i--){
var p=projectiles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
var tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
if(p.life<=0||tx<0||tx>=mapW||ty<0||ty>=mapH||map[ty][tx]===1){
addParticles(p.x,p.y,'#ffcc00',4);
projectiles.splice(i,1);continue;
}
// Hit enemy
for(var j=enemies.length-1;j>=0;j--){
var e=enemies[j];if(!e.alive)continue;
if(p.x>e.x&&p.x<e.x+e.w&&p.y>e.y&&p.y<e.y+e.h){
e.hp--;
if(e.hp<=0){e.alive=false;score+=100;
addParticles(e.x+e.w/2,e.y+e.h/2,e.type==='ghost'?'#88aaff':'#ff6644',10);
}
projectiles.splice(i,1);break;
}
}
// Hit generator
for(var j=0;j<generators.length;j++){
var g=generators[j];if(!g.alive)continue;
if(p.x>g.x&&p.x<g.x+TILE&&p.y>g.y&&p.y<g.y+TILE){
g.hp--;
if(g.hp<=0){g.alive=false;score+=500;
addParticles(g.x+TILE/2,g.y+TILE/2,'#ff8800',15);
}
if(i<projectiles.length)projectiles.splice(i,1);break;
}
}
}

// Update generators
for(var i=0;i<generators.length;i++){
var g=generators[i];if(!g.alive)continue;
g.spawnTimer-=dt;
if(g.spawnTimer<=0&&enemies.length<30){
g.spawnTimer=g.spawnRate;
enemies.push({x:g.x,y:g.y,w:TILE-6,h:TILE-6,type:g.type,
speed:40+Math.random()*30+floor*3,hp:1,alive:true,frame:0});
}
}

// Update enemies - difficulty scales speed and damage
var eDmg=floor<=2?12:(20*diffMult);
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];if(!e.alive){enemies.splice(i,1);continue;}
e.frame++;
var dx=player.x-e.x,dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist>0){
var speedMult=floor<=2?0.7:diffMult;
var spd=e.speed*speedMult*dt;
// Easy mode: enemies sometimes pause
if(floor<=2&&Math.random()<0.02){spd=0;}
var nx2=e.x+dx/dist*spd;
var ny2=e.y+dy/dist*spd;
if(canMove(nx2,e.y,e.w,e.h))e.x=nx2;
if(canMove(e.x,ny2,e.w,e.h))e.y=ny2;
}
// Collision with player
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
health-=eDmg*dt;
}
}

// Item pickup
for(var i=items.length-1;i>=0;i--){
var it=items[i];if(!it.alive)continue;
if(player.x+player.w>it.x&&player.x<it.x+it.w&&player.y+player.h>it.y&&player.y<it.y+it.h){
it.alive=false;
if(it.type==='food'){health=Math.min(maxHealth,health+50);addParticles(it.x,it.y,'#00ff00',8);}
else if(it.type==='key'){keys++;addParticles(it.x,it.y,'#ffff00',8);}
else{score+=200;addParticles(it.x,it.y,'#ffcc00',8);}
}
}

// Door/exit check
if(Math.abs(player.x-doorX)<TILE&&Math.abs(player.y-doorY)<TILE){
if(keys>0||floor<=1){
if(keys>0)keys--;
floor++;
score+=1000;
healthDrainRate=Math.min(3,1+floor*0.15);
generateDungeon();
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function render(){
// Dungeon ambient background
var dungBg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
dungBg.addColorStop(0,'#1a1518');dungBg.addColorStop(1,'#0a0808');
ctx.fillStyle=dungBg;ctx.fillRect(0,0,W,H);
ctx.save();
ctx.translate(-camX,-camY);

// Draw tiles with enhanced stonework
for(var y=0;y<mapH;y++){
for(var x=0;x<mapW;x++){
var sx=x*TILE-camX,sy=y*TILE-camY;
if(sx<-TILE||sx>W||sy<-TILE||sy>H)continue;
if(map[y][x]===1){
// Stone wall with 3D bevel effect
var wGrad=ctx.createLinearGradient(x*TILE,y*TILE,x*TILE+TILE,y*TILE+TILE);
wGrad.addColorStop(0,'#606070');wGrad.addColorStop(0.5,'#4a4a58');wGrad.addColorStop(1,'#333344');
ctx.fillStyle=wGrad;
ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
// Top/left highlight
ctx.fillStyle='#707080';ctx.fillRect(x*TILE,y*TILE,TILE,2);
ctx.fillRect(x*TILE,y*TILE,2,TILE);
// Bottom/right shadow
ctx.fillStyle='#222233';ctx.fillRect(x*TILE,y*TILE+TILE-2,TILE,2);
ctx.fillRect(x*TILE+TILE-2,y*TILE,2,TILE);
// Stone crack detail
if((x*7+y*13)%5===0){
ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x*TILE+TILE*0.3,y*TILE);ctx.lineTo(x*TILE+TILE*0.5,y*TILE+TILE*0.6);ctx.stroke();}
} else {
// Floor tiles with subtle pattern
var floorBase=(x+y)%2===0?'#1c1a24':'#19171f';
ctx.fillStyle=floorBase;
ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
// Floor tile edge
ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=0.5;
ctx.strokeRect(x*TILE+1,y*TILE+1,TILE-2,TILE-2);
}
}}

// Door
ctx.save();
ctx.shadowColor='#ffff00';ctx.shadowBlur=10+Math.sin(gameTime*4)*5;
ctx.fillStyle='#aa8800';
ctx.fillRect(doorX,doorY,TILE,TILE);
ctx.fillStyle='#ffcc00';
ctx.font='bold 14px monospace';ctx.textAlign='center';
ctx.fillText('EXIT',doorX+TILE/2,doorY+TILE/2+5);
ctx.textAlign='left';
ctx.shadowBlur=0;ctx.restore();

// Items
for(var i=0;i<items.length;i++){
var it=items[i];if(!it.alive)continue;
if(it.type==='food'){
ctx.fillStyle='#22cc22';
ctx.beginPath();ctx.arc(it.x+it.w/2,it.y+it.h/2,it.w/2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#44ff44';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('+',it.x+it.w/2,it.y+it.h/2+4);ctx.textAlign='left';
} else if(it.type==='key'){
ctx.fillStyle='#ffff00';
ctx.fillRect(it.x+2,it.y+it.h/2-2,it.w-4,4);
ctx.beginPath();ctx.arc(it.x+it.w-4,it.y+it.h/2,5,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle='#ffcc00';
ctx.beginPath();
ctx.moveTo(it.x+it.w/2,it.y);
ctx.lineTo(it.x+it.w,it.y+it.h*0.6);
ctx.lineTo(it.x+it.w*0.7,it.y+it.h);
ctx.lineTo(it.x+it.w*0.3,it.y+it.h);
ctx.lineTo(it.x,it.y+it.h*0.6);
ctx.closePath();ctx.fill();
}
}

// Generators
for(var i=0;i<generators.length;i++){
var g=generators[i];if(!g.alive)continue;
ctx.save();
ctx.shadowColor=g.type==='ghost'?'#4466ff':'#ff4422';
ctx.shadowBlur=8+Math.sin(gameTime*5)*3;
ctx.fillStyle=g.type==='ghost'?'#334488':'#883322';
ctx.fillRect(g.x,g.y,TILE,TILE);
ctx.strokeStyle=g.type==='ghost'?'#6688ff':'#ff6644';ctx.lineWidth=2;
ctx.strokeRect(g.x+2,g.y+2,TILE-4,TILE-4);
// HP
var bw=TILE-4;
ctx.fillStyle='#333';ctx.fillRect(g.x+2,g.y-6,bw,4);
ctx.fillStyle='#ff0000';ctx.fillRect(g.x+2,g.y-6,bw*(g.hp/g.maxHp),4);
ctx.shadowBlur=0;ctx.restore();
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
ctx.save();
if(e.type==='ghost'){
ctx.fillStyle='rgba(100,130,255,0.8)';
ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/3,e.w/2,Math.PI,0);
ctx.lineTo(e.x+e.w,e.y+e.h);
for(var s=0;s<4;s++){
var sx2=e.x+e.w-s*(e.w/4);
ctx.lineTo(sx2-e.w/8,e.y+e.h-5);
ctx.lineTo(sx2-e.w/4,e.y+e.h);
}
ctx.closePath();ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+e.w*0.35,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(e.x+e.w*0.37,e.y+e.h*0.32,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.67,e.y+e.h*0.32,1.5,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle='#cc3322';
ctx.fillRect(e.x,e.y,e.w,e.h);
ctx.fillStyle='#ff5544';
ctx.fillRect(e.x+3,e.y+3,e.w-6,e.h-6);
// Horns
ctx.fillStyle='#cc3322';
ctx.beginPath();ctx.moveTo(e.x+3,e.y);ctx.lineTo(e.x-3,e.y-6);ctx.lineTo(e.x+8,e.y);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(e.x+e.w-3,e.y);ctx.lineTo(e.x+e.w+3,e.y-6);ctx.lineTo(e.x+e.w-8,e.y);ctx.closePath();ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+e.w*0.35,e.y+e.h*0.35,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+e.w*0.65,e.y+e.h*0.35,2,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}

// Player (warrior)
ctx.save();
var pGrad=ctx.createRadialGradient(player.x+player.w/2,player.y+player.h/2,2,player.x+player.w/2,player.y+player.h/2,player.w/2);
pGrad.addColorStop(0,'#ffcc44');pGrad.addColorStop(1,'#aa7700');
ctx.fillStyle=pGrad;
ctx.fillRect(player.x,player.y,player.w,player.h);
// Helmet
ctx.fillStyle='#888';
ctx.fillRect(player.x+2,player.y-4,player.w-4,8);
ctx.fillStyle='#aaa';
ctx.fillRect(player.x+player.w/2-3,player.y-6,6,4);
// Sword direction indicator
ctx.strokeStyle='#ddd';ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(player.x+player.w/2,player.y+player.h/2);
ctx.lineTo(player.x+player.w/2+lastDirX*18,player.y+player.h/2+lastDirY*18);
ctx.stroke();
ctx.shadowColor='#ffaa00';ctx.shadowBlur=8;
ctx.strokeStyle='#ffaa00';ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(player.x+player.w/2,player.y+player.h/2);
ctx.lineTo(player.x+player.w/2+lastDirX*18,player.y+player.h/2+lastDirY*18);
ctx.stroke();
ctx.shadowBlur=0;
ctx.restore();

// Projectiles
ctx.fillStyle='#ffaa00';ctx.shadowColor='#ffaa00';ctx.shadowBlur=8;
for(var i=0;i<projectiles.length;i++){
var p=projectiles[i];
ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life/p.maxLife;
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

ctx.restore(); // End camera transform

// HUD overlay - Health bar
var hpW=150,hpH=12,hpX=10,hpY=10;
ctx.fillStyle='#333';ctx.fillRect(hpX,hpY,hpW,hpH);
ctx.fillStyle=health>maxHealth*0.3?'#cc2222':'#ff4444';
ctx.fillRect(hpX,hpY,hpW*(health/maxHealth),hpH);
ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.strokeRect(hpX,hpY,hpW,hpH);
ctx.fillStyle='#fff';ctx.font='10px monospace';
ctx.fillText('HP: '+Math.ceil(health),hpX+hpW+5,hpY+10);

// Keys
ctx.fillStyle='#ffff00';ctx.fillText('KEYS: '+keys,10,35);

// Floor
ctx.fillStyle='#aaa';ctx.textAlign='right';
ctx.fillText('FLOOR '+floor,W-10,20);ctx.textAlign='left';
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);

// Torch-like ambient
for(var i=0;i<4;i++){
var tx=W*0.2+i*(W*0.2),ty=H*0.45;
ctx.save();
ctx.shadowColor='#ff6622';ctx.shadowBlur=30+Math.sin(titlePulse+i)*10;
ctx.fillStyle='#ff8833';
ctx.beginPath();ctx.arc(tx,ty,5+Math.sin(titlePulse*2+i)*2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4400';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff6633';
ctx.fillText('GAUNTLET',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.032)+'px "Courier New",monospace';
ctx.fillStyle='#ffaa44';
ctx.fillText('WARRIOR NEEDS FOOD BADLY',W/2,H*0.34);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('ARROWS/WASD: Move | SPACE: Attack',W/2,H*0.67);
ctx.fillText('Find keys, eat food, reach the exit!',W/2,H*0.72);
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
ctx.fillText('Floor: '+floor+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='FLR '+floor;
var st=document.getElementById('hud-time');if(st)st.textContent=Math.ceil(health)+' HP';
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
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
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

window.initGauntlet=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopGauntlet=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
