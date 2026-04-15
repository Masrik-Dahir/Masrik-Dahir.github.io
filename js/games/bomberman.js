// Bomberman — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var COLS=13,ROWS=11,cs;
var map=[];// 0=empty,1=wall(indestructible),2=brick(destructible)
var player,enemies=[],bombs=[],explosions=[],particles=[],powerups=[];
var keys={};
var maxBombs=3,bombRange=2,playerSpeed=3.0;
var activeBombs=0;

// Difficulty multiplier: easy(1-2) / medium(3-5) / hard(6+)
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }
function diffEnemySpeed(){ return (1.5+level*0.1)*diffMult(); }
function diffBrickDensity(){ return level<=2?0.3:(level<=5?0.4:0.5); }

// Power-up types
var PU_FLAME=0,PU_BOMB=1,PU_SPEED=2;
var PU_COLORS=['#ff6600','#ff0066','#00ccff'];
var PU_LABELS=['F','B','S'];
var ENEMY_COLORS=['#ff4444','#ff66aa','#66aaff','#ffaa00','#aa66ff'];

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);
canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
cs=Math.floor(Math.min(W/COLS,(H-10)/ROWS));
}

function generateMap(){
map=[];
for(var y=0;y<ROWS;y++){
map[y]=[];
for(var x=0;x<COLS;x++){
// Outer walls
if(x===0||x===COLS-1||y===0||y===ROWS-1){map[y][x]=1;continue;}
// Inner pillars at even positions
if(x%2===0&&y%2===0){map[y][x]=1;continue;}
// Clear area around player spawn (1,1) — keep (1,1),(2,1),(1,2) free
if((x===1&&y===1)||(x===2&&y===1)||(x===1&&y===2)){map[y][x]=0;continue;}
// Random bricks scaled by difficulty
if(Math.random()<diffBrickDensity()){map[y][x]=2;}
else{map[y][x]=0;}
}}
}

function isWalkable(gx,gy){
if(gx<0||gx>=COLS||gy<0||gy>=ROWS)return false;
return map[gy][gx]===0;
}

function hasBombAt(gx,gy){
for(var i=0;i<bombs.length;i++){
if(bombs[i].gx===gx&&bombs[i].gy===gy)return true;
}
return false;
}

function isExplosionAt(gx,gy){
for(var i=0;i<explosions.length;i++){
var e=explosions[i];
for(var j=0;j<e.cells.length;j++){
if(e.cells[j].x===gx&&e.cells[j].y===gy)return true;
}
}
return false;
}

function spawnPowerup(gx,gy){
// 30% chance to spawn a power-up when brick destroyed
if(Math.random()<0.3){
var type=Math.floor(Math.random()*3);
powerups.push({gx:gx,gy:gy,type:type,pulse:0});
}
}

function spawnEnemies(count){
enemies=[];
var spots=[];
// Collect walkable spots far from player
for(var y=1;y<ROWS-1;y++){
for(var x=1;x<COLS-1;x++){
if(map[y][x]===0&&(Math.abs(x-1)+Math.abs(y-1))>5){
spots.push({x:x,y:y});
}
}}
// Shuffle
for(var i=spots.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=spots[i];spots[i]=spots[j];spots[j]=t;}
for(var i=0;i<Math.min(count,spots.length);i++){
enemies.push({
x:spots[i].x,y:spots[i].y,
tx:spots[i].x,ty:spots[i].y,
dir:{x:0,y:0},
color:ENEMY_COLORS[i%ENEMY_COLORS.length],
speed:diffEnemySpeed(),
moveTimer:0,
changeDirTimer:0,
alive:true,
animFrame:0,animTimer:0
});
}
}

function resetGame(){
score=0;lives=3;level=1;gameTime=0;
maxBombs=3;bombRange=2;playerSpeed=3.0;activeBombs=0;
bombs=[];explosions=[];particles=[];powerups=[];
generateMap();
player={x:1,y:1,tx:1,ty:1,dir:{x:0,y:0},moveTimer:0,invincible:0};
spawnEnemies(5);
gameState='playing';
}

function nextLevel(){
level++;
bombs=[];explosions=[];particles=[];powerups=[];activeBombs=0;
generateMap();
player.tx=1;player.ty=1;player.x=1;player.y=1;player.dir={x:0,y:0};player.moveTimer=0;player.invincible=1.5;
spawnEnemies(level<=2?4+level:5+Math.floor(level*1.2));
}

function placeBomb(){
if(gameState!=='playing')return;
if(activeBombs>=maxBombs)return;
var gx=player.tx,gy=player.ty;
if(hasBombAt(gx,gy))return;
bombs.push({gx:gx,gy:gy,timer:2.5,pulse:0});
activeBombs++;
}

function explodeBomb(bomb){
activeBombs--;
var cells=[{x:bomb.gx,y:bomb.gy}];
var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
for(var d=0;d<4;d++){
for(var r=1;r<=bombRange;r++){
var nx=bomb.gx+dirs[d].x*r;
var ny=bomb.gy+dirs[d].y*r;
if(nx<0||nx>=COLS||ny<0||ny>=ROWS)break;
if(map[ny][nx]===1)break;// indestructible wall stops explosion
if(map[ny][nx]===2){
// Destroy brick
map[ny][nx]=0;
cells.push({x:nx,y:ny});
score+=50;
spawnPowerup(nx,ny);
addParticles(nx,ny,'#8B4513',8);
break;// explosion stops after destroying brick
}
cells.push({x:nx,y:ny});
}
}
explosions.push({cells:cells,timer:0.5});
// Chain reaction: explode other bombs caught in explosion
for(var i=bombs.length-1;i>=0;i--){
var b=bombs[i];
if(b===bomb)continue;
for(var j=0;j<cells.length;j++){
if(cells[j].x===b.gx&&cells[j].y===b.gy){
b.timer=-1;// mark for immediate explosion
break;
}
}
}
addParticles(bomb.gx,bomb.gy,'#ff6600',15);
}

function addParticles(gx,gy,color,count){
var ox=(W-COLS*cs)/2;
for(var i=0;i<count;i++){
particles.push({
x:ox+gx*cs+cs/2,
y:gy*cs+cs/2,
vx:(Math.random()-0.5)*150,
vy:(Math.random()-0.5)*150,
life:0.4+Math.random()*0.4,
color:color,
size:2+Math.random()*4
});
}
}

function pickEnemyDir(e){
var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
var valid=[];
for(var i=0;i<dirs.length;i++){
var nx=e.tx+dirs[i].x,ny=e.ty+dirs[i].y;
if(isWalkable(nx,ny)&&!hasBombAt(nx,ny)){
valid.push(dirs[i]);
}
}
if(valid.length===0)return{x:0,y:0};
// Hard mode: enemies track player more aggressively
if(level>=6&&Math.random()<0.4){
var best=null,bestDist=Infinity;
for(var i=0;i<valid.length;i++){
var nx=e.tx+valid[i].x,ny=e.ty+valid[i].y;
var d=Math.abs(nx-player.tx)+Math.abs(ny-player.ty);
if(d<bestDist){bestDist=d;best=valid[i];}
}
if(best)return best;
}
// Medium mode: slight player tracking
if(level>=3&&level<=5&&Math.random()<0.2){
var best=null,bestDist=Infinity;
for(var i=0;i<valid.length;i++){
var nx=e.tx+valid[i].x,ny=e.ty+valid[i].y;
var d=Math.abs(nx-player.tx)+Math.abs(ny-player.ty);
if(d<bestDist){bestDist=d;best=valid[i];}
}
if(best)return best;
}
return valid[Math.floor(Math.random()*valid.length)];
}

function update(dt){
if(dt>0.1)dt=0.1;
if(gameState!=='playing')return;
gameTime+=dt;

// Player invincibility
if(player.invincible>0)player.invincible-=dt;

// Player movement
player.moveTimer+=dt;
var moveInterval=1/playerSpeed;
if(player.moveTimer>=moveInterval){
player.moveTimer=0;
var dx=0,dy=0;
if(keys.left)dx=-1;
else if(keys.right)dx=1;
else if(keys.up)dy=-1;
else if(keys.down)dy=1;
if(dx!==0||dy!==0){
var nx=player.tx+dx,ny=player.ty+dy;
if(isWalkable(nx,ny)&&!hasBombAt(nx,ny)){
player.tx=nx;player.ty=ny;
player.dir={x:dx,y:dy};
}
// Allow walking off own bomb (player can stand on bomb they placed)
else if(isWalkable(nx,ny)&&hasBombAt(nx,ny)){
// Only block — standard Bomberman behavior
}
}
}
// Smooth visual interpolation
player.x+=(player.tx-player.x)*Math.min(1,dt*14);
player.y+=(player.ty-player.y)*Math.min(1,dt*14);

// Bomb timers
for(var i=bombs.length-1;i>=0;i--){
var b=bombs[i];
b.timer-=dt;
b.pulse+=dt*8;
if(b.timer<=0){
explodeBomb(b);
bombs.splice(i,1);
}
}

// Explosion timers
for(var i=explosions.length-1;i>=0;i--){
explosions[i].timer-=dt;
if(explosions[i].timer<=0)explosions.splice(i,1);
}

// Enemy movement
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive)continue;

// Check if caught in explosion
if(isExplosionAt(e.tx,e.ty)){
e.alive=false;
score+=100;
addParticles(e.tx,e.ty,e.color,15);
continue;
}

e.moveTimer+=dt;
e.changeDirTimer-=dt;
var eInterval=1/e.speed;
if(e.moveTimer>=eInterval){
e.moveTimer=0;
// Try current direction
var nx=e.tx+e.dir.x,ny=e.ty+e.dir.y;
if(!isWalkable(nx,ny)||hasBombAt(nx,ny)||e.changeDirTimer<=0){
e.dir=pickEnemyDir(e);
e.changeDirTimer=1+Math.random()*2;
nx=e.tx+e.dir.x;ny=e.ty+e.dir.y;
}
if(isWalkable(nx,ny)&&!hasBombAt(nx,ny)){
e.tx=nx;e.ty=ny;
}else{
e.dir=pickEnemyDir(e);
e.changeDirTimer=1+Math.random()*2;
}
}
e.x+=(e.tx-e.x)*Math.min(1,dt*12);
e.y+=(e.ty-e.y)*Math.min(1,dt*12);

// Collision with player
if(e.alive&&player.invincible<=0&&e.tx===player.tx&&e.ty===player.ty){
lives--;
addParticles(player.tx,player.ty,'#ffffff',20);
player.tx=1;player.ty=1;player.x=1;player.y=1;player.dir={x:0,y:0};
player.invincible=2.0;
if(lives<=0){gameState='gameover';return;}
}
}

// Player caught in explosion
if(player.invincible<=0&&isExplosionAt(player.tx,player.ty)){
lives--;
addParticles(player.tx,player.ty,'#ffffff',20);
player.tx=1;player.ty=1;player.x=1;player.y=1;player.dir={x:0,y:0};
player.invincible=2.0;
if(lives<=0){gameState='gameover';return;}
}

// Power-up collection
for(var i=powerups.length-1;i>=0;i--){
var pu=powerups[i];
pu.pulse+=dt*5;
if(pu.gx===player.tx&&pu.gy===player.ty){
score+=200;
if(pu.type===PU_FLAME)bombRange=Math.min(bombRange+1,6);
else if(pu.type===PU_BOMB)maxBombs=Math.min(maxBombs+1,8);
else if(pu.type===PU_SPEED)playerSpeed=Math.min(playerSpeed+0.3,5.5);
addParticles(pu.gx,pu.gy,PU_COLORS[pu.type],10);
powerups.splice(i,1);
}
// Destroy power-ups in explosions
else if(isExplosionAt(pu.gx,pu.gy)){
powerups.splice(i,1);
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Level clear check
var aliveCount=0;
for(var i=0;i<enemies.length;i++){if(enemies[i].alive)aliveCount++;}
if(aliveCount===0)nextLevel();
}

function render(){
// Rich dark background with subtle gradient
var bgGrad=ctx.createLinearGradient(0,0,0,H);
bgGrad.addColorStop(0,'#0a0a14');bgGrad.addColorStop(1,'#111118');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
var ox=(W-COLS*cs)/2,oy=Math.max(0,(H-ROWS*cs)/2);

// Draw grid with enhanced graphics
for(var y=0;y<ROWS;y++){
for(var x=0;x<COLS;x++){
var px=ox+x*cs,py=oy+y*cs;
var cell=map[y][x];
if(cell===0){
// Lush green grass floor with gradient
ctx.save();
var grassGrad=ctx.createLinearGradient(px,py,px+cs,py+cs);
grassGrad.addColorStop(0,'#2a5a1a');grassGrad.addColorStop(0.5,'#306818');grassGrad.addColorStop(1,'#285616');
ctx.fillStyle=grassGrad;
ctx.fillRect(px,py,cs,cs);
// Checkerboard subtle pattern
if((x+y)%2===0){ctx.fillStyle='rgba(60,120,40,0.15)';ctx.fillRect(px,py,cs,cs);}
// Tiny grass blades
ctx.strokeStyle='rgba(80,160,50,0.25)';ctx.lineWidth=0.8;
for(var gi=0;gi<3;gi++){
var gx=px+cs*0.2+gi*cs*0.3,gy=py+cs*0.8;
ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+2,gy-cs*0.15);ctx.stroke();
}
ctx.restore();
}else if(cell===1){
// 3D stone walls with depth gradient
ctx.save();
var stoneGrad=ctx.createLinearGradient(px,py,px+cs,py+cs);
stoneGrad.addColorStop(0,'#6a6a7a');stoneGrad.addColorStop(0.3,'#585868');stoneGrad.addColorStop(1,'#48484f');
ctx.fillStyle=stoneGrad;
ctx.fillRect(px,py,cs,cs);
// Top highlight
ctx.fillStyle='rgba(200,200,220,0.15)';
ctx.fillRect(px,py,cs,cs*0.12);
ctx.fillRect(px,py,cs*0.08,cs);
// Bottom shadow
ctx.fillStyle='rgba(0,0,0,0.25)';
ctx.fillRect(px,py+cs*0.88,cs,cs*0.12);
ctx.fillRect(px+cs*0.92,py,cs*0.08,cs);
// Stone block pattern
ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
ctx.strokeRect(px+1,py+1,cs-2,cs-2);
ctx.fillStyle='rgba(120,120,140,0.2)';
ctx.fillRect(px+cs*0.1,py+cs*0.1,cs*0.35,cs*0.35);
ctx.fillRect(px+cs*0.55,py+cs*0.55,cs*0.35,cs*0.35);
// Mortar lines
ctx.strokeStyle='rgba(0,0,0,0.2)';
ctx.beginPath();
ctx.moveTo(px,py+cs*0.5);ctx.lineTo(px+cs,py+cs*0.5);
ctx.moveTo(px+cs*0.5,py);ctx.lineTo(px+cs*0.5,py+cs);
ctx.stroke();
ctx.restore();
}else if(cell===2){
// Richly textured destructible bricks
ctx.save();
var brickGrad=ctx.createLinearGradient(px,py,px,py+cs);
brickGrad.addColorStop(0,'#A0622D');brickGrad.addColorStop(0.5,'#8B4513');brickGrad.addColorStop(1,'#6B3410');
ctx.fillStyle=brickGrad;
ctx.fillRect(px,py,cs,cs);
// Top highlight
ctx.fillStyle='rgba(255,200,150,0.12)';
ctx.fillRect(px+1,py+1,cs-2,cs*0.15);
// Brick pattern with mortar
ctx.strokeStyle='rgba(80,30,5,0.6)';ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(px,py+cs*0.33);ctx.lineTo(px+cs,py+cs*0.33);
ctx.moveTo(px,py+cs*0.66);ctx.lineTo(px+cs,py+cs*0.66);
ctx.moveTo(px+cs*0.5,py);ctx.lineTo(px+cs*0.5,py+cs*0.33);
ctx.moveTo(px+cs*0.25,py+cs*0.33);ctx.lineTo(px+cs*0.25,py+cs*0.66);
ctx.moveTo(px+cs*0.75,py+cs*0.33);ctx.lineTo(px+cs*0.75,py+cs*0.66);
ctx.moveTo(px+cs*0.5,py+cs*0.66);ctx.lineTo(px+cs*0.5,py+cs);
ctx.stroke();
// Subtle cracks
ctx.strokeStyle='rgba(40,15,0,0.35)';ctx.lineWidth=0.8;
ctx.beginPath();
ctx.moveTo(px+cs*0.2,py+cs*0.3);ctx.lineTo(px+cs*0.5,py+cs*0.5);ctx.lineTo(px+cs*0.7,py+cs*0.35);
ctx.stroke();
// Inner shadow for depth
ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;
ctx.strokeRect(px+1,py+1,cs-2,cs-2);
ctx.restore();
}
}
}

// Draw power-ups
for(var i=0;i<powerups.length;i++){
var pu=powerups[i];
var px=ox+pu.gx*cs+cs/2,py=oy+pu.gy*cs+cs/2;
var glow=0.6+0.4*Math.sin(pu.pulse);
ctx.save();
ctx.shadowColor=PU_COLORS[pu.type];
ctx.shadowBlur=8*glow;
ctx.fillStyle=PU_COLORS[pu.type];
ctx.globalAlpha=0.7+0.3*glow;
ctx.beginPath();ctx.arc(px,py,cs*0.3,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;
ctx.fillStyle='#fff';
ctx.font='bold '+Math.round(cs*0.35)+'px "Courier New",monospace';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText(PU_LABELS[pu.type],px,py);
ctx.restore();
}

// Draw bombs with enhanced metallic look
for(var i=0;i<bombs.length;i++){
var b=bombs[i];
var bx=ox+b.gx*cs+cs/2,by=oy+b.gy*cs+cs/2;
var pulseScale=1+0.06*Math.sin(b.pulse);
var urgency=Math.max(0,1-b.timer/2.5);
ctx.save();
// Pulsing danger glow
ctx.shadowColor=urgency>0.6?'#ff0000':'#ff6600';
ctx.shadowBlur=6+urgency*18;
// Bomb body with metallic gradient
var bombGrad=ctx.createRadialGradient(bx-cs*0.08,by-cs*0.1,cs*0.05,bx,by,cs*0.35*pulseScale);
bombGrad.addColorStop(0,'#444');bombGrad.addColorStop(0.5,'#222');bombGrad.addColorStop(1,'#111');
ctx.fillStyle=bombGrad;
ctx.beginPath();ctx.arc(bx,by,cs*0.35*pulseScale,0,Math.PI*2);ctx.fill();
// Metallic highlight
ctx.fillStyle='rgba(255,255,255,0.15)';
ctx.beginPath();ctx.ellipse(bx-cs*0.08,by-cs*0.1,cs*0.15,cs*0.1,-0.3,0,Math.PI*2);ctx.fill();
// Band around bomb
ctx.strokeStyle='#555';ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(bx,by+cs*0.05,cs*0.3*pulseScale,cs*0.06,0,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
// Fuse with curve
ctx.strokeStyle='#6B3410';ctx.lineWidth=2.5;
ctx.beginPath();
ctx.moveTo(bx,by-cs*0.35*pulseScale);
ctx.bezierCurveTo(bx+cs*0.1,by-cs*0.45,bx+cs*0.2,by-cs*0.5,bx+cs*0.12,by-cs*0.58);
ctx.stroke();
// Animated spark with trail
var sparkPhase=gameTime*20+i;
var sparkOn=Math.sin(sparkPhase)>-0.3;
if(sparkOn){
var sparkBright=0.6+0.4*Math.sin(sparkPhase*3);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=12*sparkBright;
ctx.fillStyle='rgba(255,220,50,'+sparkBright+')';
ctx.beginPath();ctx.arc(bx+cs*0.12,by-cs*0.58,cs*0.07,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,'+(sparkBright*0.8)+')';
ctx.beginPath();ctx.arc(bx+cs*0.12,by-cs*0.58,cs*0.03,0,Math.PI*2);ctx.fill();
// Tiny spark particles
for(var sp=0;sp<3;sp++){
var sa=sparkPhase*2+sp*2.1;
ctx.fillStyle='rgba(255,200,0,0.5)';
ctx.beginPath();ctx.arc(bx+cs*0.12+Math.cos(sa)*cs*0.08,by-cs*0.58+Math.sin(sa)*cs*0.06,cs*0.015,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;
}
// Urgency red flash on body
if(urgency>0.7){
ctx.fillStyle='rgba(255,0,0,'+(0.15*Math.sin(gameTime*15)+0.15)+')';
ctx.beginPath();ctx.arc(bx,by,cs*0.35*pulseScale,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}

// Draw explosions
for(var i=0;i<explosions.length;i++){
var exp=explosions[i];
var alpha=exp.timer/0.5;
for(var j=0;j<exp.cells.length;j++){
var c=exp.cells[j];
var ex=ox+c.x*cs,ey=oy+c.y*cs;
// Orange/yellow gradient burst
var grad=ctx.createRadialGradient(ex+cs/2,ey+cs/2,0,ex+cs/2,ey+cs/2,cs*0.6);
grad.addColorStop(0,'rgba(255,255,200,'+alpha+')');
grad.addColorStop(0.4,'rgba(255,165,0,'+alpha+')');
grad.addColorStop(0.7,'rgba(255,69,0,'+(alpha*0.7)+')');
grad.addColorStop(1,'rgba(255,0,0,0)');
ctx.fillStyle=grad;
ctx.fillRect(ex-cs*0.1,ey-cs*0.1,cs*1.2,cs*1.2);
}
}

// Draw enemies (detailed animated balloon creatures)
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
var ex=ox+e.x*cs+cs/2,ey=oy+e.y*cs+cs/2;
var bounce=Math.sin(gameTime*4+i)*cs*0.04;
var squish=1+0.03*Math.sin(gameTime*6+i*2);
ctx.save();
// Glow shadow
ctx.shadowColor=e.color;ctx.shadowBlur=8+3*Math.sin(gameTime*3+i);
// Body with gradient (balloon)
var bodyGrad=ctx.createRadialGradient(ex-cs*0.08,ey-cs*0.1+bounce,cs*0.05,ex,ey+bounce,cs*0.4);
bodyGrad.addColorStop(0,'rgba(255,255,255,0.25)');bodyGrad.addColorStop(0.3,e.color);bodyGrad.addColorStop(1,e.color);
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.ellipse(ex,ey+bounce,cs*0.38*squish,cs*0.38/squish,0,0,Math.PI*2);ctx.fill();
// Specular highlight
ctx.fillStyle='rgba(255,255,255,0.35)';
ctx.beginPath();ctx.ellipse(ex-cs*0.1,ey-cs*0.12+bounce,cs*0.12,cs*0.08,Math.PI*-0.2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Eyes with whites and pupils
ctx.fillStyle='#fff';
ctx.beginPath();ctx.ellipse(ex-cs*0.13,ey-cs*0.06+bounce,cs*0.1,cs*0.09,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(ex+cs*0.13,ey-cs*0.06+bounce,cs*0.1,cs*0.09,0,0,Math.PI*2);ctx.fill();
// Iris
ctx.fillStyle='#222';
var lookX=e.dir.x*cs*0.03,lookY=e.dir.y*cs*0.03;
ctx.beginPath();ctx.arc(ex-cs*0.11+lookX,ey-cs*0.06+lookY+bounce,cs*0.055,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+cs*0.15+lookX,ey-cs*0.06+lookY+bounce,cs*0.055,0,Math.PI*2);ctx.fill();
// Pupil shine
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(ex-cs*0.09+lookX,ey-cs*0.08+bounce,cs*0.02,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+cs*0.17+lookX,ey-cs*0.08+bounce,cs*0.02,0,Math.PI*2);ctx.fill();
// Mouth (animated)
ctx.strokeStyle='#222';ctx.lineWidth=1.5;
var mouthOpen=Math.sin(gameTime*5+i)*0.15;
ctx.beginPath();ctx.arc(ex,ey+cs*0.1+bounce,cs*0.07,mouthOpen,Math.PI-mouthOpen);ctx.stroke();
// Tiny feet (wobbling)
var footAnim=Math.sin(gameTime*7+i)*cs*0.03;
ctx.fillStyle=e.color;
ctx.beginPath();ctx.ellipse(ex-cs*0.1,ey+cs*0.38+bounce,cs*0.06,cs*0.04,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(ex+cs*0.1,ey+cs*0.38+bounce+footAnim,cs*0.06,cs*0.04,0,0,Math.PI*2);ctx.fill();
// Balloon tie at bottom
ctx.beginPath();
ctx.moveTo(ex-cs*0.04,ey+cs*0.36+bounce);
ctx.lineTo(ex,ey+cs*0.44+bounce);
ctx.lineTo(ex+cs*0.04,ey+cs*0.36+bounce);
ctx.fill();
ctx.restore();
}

// Draw player (detailed Bomberman character)
var ppx=ox+player.x*cs+cs/2,ppy=oy+player.y*cs+cs/2;
var blink=(player.invincible>0&&Math.sin(gameTime*15)>0);
if(!blink){
ctx.save();
// Glow aura
ctx.shadowColor='#00ffcc';ctx.shadowBlur=10+4*Math.sin(gameTime*4);
// Body (round white with gradient)
var bodyGrad=ctx.createRadialGradient(ppx-cs*0.05,ppy-cs*0.05,cs*0.05,ppx,ppy+cs*0.05,cs*0.38);
bodyGrad.addColorStop(0,'#ffffff');bodyGrad.addColorStop(0.7,'#eef8f8');bodyGrad.addColorStop(1,'#ccdddd');
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.arc(ppx,ppy+cs*0.05,cs*0.35,0,Math.PI*2);ctx.fill();
// Arms (animated with walking)
var walkAnim=Math.sin(gameTime*8)*cs*0.04*(player.dir.x!==0||player.dir.y!==0?1:0.3);
ctx.fillStyle='#eef0f0';
ctx.beginPath();ctx.ellipse(ppx-cs*0.32,ppy+cs*0.08+walkAnim,cs*0.06,cs*0.1,0.2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(ppx+cs*0.32,ppy+cs*0.08-walkAnim,cs*0.06,cs*0.1,-0.2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Colored hat (cyan/teal) with gradient and antenna
var hatGrad=ctx.createLinearGradient(ppx-cs*0.28,ppy-cs*0.35,ppx+cs*0.28,ppy-cs*0.12);
hatGrad.addColorStop(0,'#00ddbb');hatGrad.addColorStop(0.5,'#00ccaa');hatGrad.addColorStop(1,'#009980');
ctx.fillStyle=hatGrad;
ctx.beginPath();ctx.arc(ppx,ppy-cs*0.14,cs*0.28,Math.PI,0);ctx.fill();
// Hat brim with 3D effect
var brimGrad=ctx.createLinearGradient(ppx-cs*0.33,ppy-cs*0.14,ppx-cs*0.33,ppy-cs*0.06);
brimGrad.addColorStop(0,'#00bb99');brimGrad.addColorStop(1,'#008866');
ctx.fillStyle=brimGrad;
ctx.fillRect(ppx-cs*0.33,ppy-cs*0.16,cs*0.66,cs*0.1);
// Hat antenna
ctx.strokeStyle='#00ddcc';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(ppx,ppy-cs*0.4);ctx.lineTo(ppx,ppy-cs*0.5);ctx.stroke();
ctx.fillStyle='#00ffee';ctx.beginPath();ctx.arc(ppx,ppy-cs*0.52,cs*0.04,0,Math.PI*2);ctx.fill();
// Eyes with expression
var blinkEye=(Math.sin(gameTime*0.5)>0.98)?0.02:0.06;
ctx.fillStyle='#222';
ctx.beginPath();ctx.ellipse(ppx-cs*0.1,ppy+cs*0.02,cs*0.06,cs*blinkEye,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(ppx+cs*0.1,ppy+cs*0.02,cs*0.06,cs*blinkEye,0,0,Math.PI*2);ctx.fill();
// Eye shine
if(blinkEye>0.03){
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(ppx-cs*0.08,ppy,cs*0.025,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ppx+cs*0.12,ppy,cs*0.025,0,Math.PI*2);ctx.fill();
}
// Small smile
ctx.strokeStyle='#444';ctx.lineWidth=1.2;
ctx.beginPath();ctx.arc(ppx,ppy+cs*0.12,cs*0.06,0.2,Math.PI-0.2);ctx.stroke();
// Belt
ctx.fillStyle='#008877';
ctx.fillRect(ppx-cs*0.22,ppy+cs*0.2,cs*0.44,cs*0.05);
ctx.fillStyle='#ffcc00';
ctx.beginPath();ctx.arc(ppx,ppy+cs*0.225,cs*0.03,0,Math.PI*2);ctx.fill();
ctx.restore();
}

// Particles with glow trails
for(var i=0;i<particles.length;i++){
var p=particles[i];
var alpha=Math.max(0,p.life*2.5);
ctx.save();
ctx.globalAlpha=alpha;
ctx.shadowColor=p.color;ctx.shadowBlur=p.size*2;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*alpha*0.5,0,Math.PI*2);ctx.fill();
// Trail
ctx.globalAlpha=alpha*0.3;
ctx.beginPath();ctx.arc(p.x-p.vx*0.02,p.y-p.vy*0.02,p.size*alpha*0.3,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;

// Lives display
ctx.fillStyle='#aaa';
ctx.font=Math.round(cs*0.4)+'px "Courier New",monospace';
ctx.textAlign='left';
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff3366';
ctx.beginPath();
// Heart shape
var hx=ox+10+i*cs*0.6,hy=oy+ROWS*cs+cs*0.1;
ctx.arc(hx,hy,cs*0.15,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle='#aaa';ctx.textAlign='right';
ctx.font=Math.round(cs*0.35)+'px "Courier New",monospace';
ctx.fillText('LVL '+level,ox+COLS*cs-5,oy+ROWS*cs+cs*0.15);
}

function drawTitle(dt){
ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);
titlePulse+=dt*3;

// Animated bomb background
for(var i=0;i<8;i++){
var bx=W*0.1+W*0.1*(i%4),by=H*0.15+H*0.25*Math.floor(i/4);
var drift=Math.sin(titlePulse+i*0.7)*20;
ctx.fillStyle='rgba(50,50,50,0.4)';
ctx.beginPath();ctx.arc(bx+drift,by+drift*0.5,15+Math.sin(titlePulse+i)*3,0,Math.PI*2);ctx.fill();
}

ctx.save();ctx.textAlign='center';
// Title
ctx.shadowColor='#ff6600';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff6600';ctx.fillText('BOMBERMAN',W/2,H*0.28);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';ctx.fillText('BLAST YOUR WAY!',W/2,H*0.36);

// Flashing prompt
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);

// Controls info
ctx.fillStyle='#888';
ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to move    SPACE to drop bomb',W/2,H*0.62);

// Draw a small scene
var sx=W/2-60,sy=H*0.74;
// Player
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#00ccaa';ctx.beginPath();ctx.arc(sx,sy-5,8,Math.PI,0);ctx.fill();
// Bomb
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(sx+35,sy,8,0,Math.PI*2);ctx.fill();
// Enemies
for(var i=0;i<3;i++){
ctx.fillStyle=ENEMY_COLORS[i];
ctx.beginPath();ctx.arc(sx+80+i*25,sy,8,0,Math.PI*2);ctx.fill();
}
// Explosion effect
var ea=0.5+0.3*Math.sin(titlePulse*3);
ctx.fillStyle='rgba(255,165,0,'+ea+')';
ctx.beginPath();ctx.arc(sx+35,sy,16+Math.sin(titlePulse*4)*4,0,Math.PI*2);ctx.fill();

ctx.restore();
}

function drawGameOver(){
// Draw game underneath
render();
ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';

ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.4);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('Level reached: '+level,W/2,H*0.5);

// Stats
ctx.fillStyle='#666';
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('Bomb Range: '+bombRange+'  Max Bombs: '+maxBombs,W/2,H*0.58);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.72);

ctx.restore();
}

function updateHUD(){
var el1=document.getElementById('hud-score');
var el2=document.getElementById('hud-speed');
var el3=document.getElementById('hud-time');
if(el1)el1.textContent=score;
if(el2)el2.textContent='LVL '+level;
if(el3)el3.textContent=lives+' HP';
}

function onKey(e,down){
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keys.up=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keys.down=down;
if(e.key===' '&&down&&gameState==='playing')placeBomb();
if((e.key==='Enter'||e.key==='Tab')&&down&&gameState!=='playing')resetGame();
}

var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn,releaseFn){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
el.addEventListener('touchend',function(e){e.preventDefault();if(releaseFn)releaseFn();});
el.addEventListener('mousedown',function(){fn();});
el.addEventListener('mouseup',function(){if(releaseFn)releaseFn();});
}

var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){titlePulse+=dt;drawGameOver();updateHUD();}
animId=requestAnimationFrame(gameLoop);
}

window.initBomberman=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(){keys={};keys.left=true;},function(){keys.left=false;});
bindMobile('btn-right',function(){keys={};keys.right=true;},function(){keys.right=false;});
bindMobile('btn-up',function(){keys={};keys.up=true;},function(){keys.up=false;});
bindMobile('btn-down',function(){keys={};keys.down=true;},function(){keys.down=false;});
bindMobile('btn-a',function(){placeBomb();});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;keys={};
lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopBomberman=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keys={};
};
})();
