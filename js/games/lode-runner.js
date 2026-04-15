// Lode Runner — Collect gold, dig holes to trap enemies
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
var player,enemies=[],particles=[],gold=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyDigLeft=false,keyDigRight=false;
var PLAYER_SPEED=120,GRAVITY=300,FALL_SPEED=180;
var TILE=0,mapW=20,mapH=14,map=[];
var goldTotal=0,goldCollected=0;
var exitLadderActive=false,exitX=0;
var holes=[];
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
TILE=Math.min(Math.floor(W/mapW),Math.floor(H/(mapH+1)));
}

// Map legend: 0=empty, 1=brick, 2=ladder, 3=bar(rope), 4=solid(unbreakable)
function generateMap(){
map=[];
for(var y=0;y<mapH;y++){
map[y]=[];
for(var x=0;x<mapW;x++){
if(y===mapH-1)map[y][x]=4; // bottom solid
else if(x===0||x===mapW-1)map[y][x]=0;
else map[y][x]=0;
}
}

// Create platforms (brick rows)
var platformRows=[3,5,7,9,11];
for(var r=0;r<platformRows.length;r++){
var py=platformRows[r];
if(py>=mapH)continue;
for(var x=1;x<mapW-1;x++){
if(Math.random()<0.7)map[py][x]=1;
}
// Ensure gaps
var gapCount=2+Math.floor(Math.random()*2);
for(var g=0;g<gapCount;g++){
var gx=1+Math.floor(Math.random()*(mapW-2));
map[py][gx]=0;
}
}

// Ladders connecting platforms
for(var i=0;i<8+level;i++){
var lx=1+Math.floor(Math.random()*(mapW-2));
var startY=1+Math.floor(Math.random()*(mapH-3));
var len=2+Math.floor(Math.random()*3);
for(var ly=startY;ly<Math.min(startY+len,mapH-1);ly++){
if(map[ly][lx]===0||map[ly][lx]===1)map[ly][lx]=2;
}
}

// Bars (horizontal ropes)
for(var i=0;i<3+level;i++){
var barY=2+Math.floor(Math.random()*(mapH-4));
var barStart=2+Math.floor(Math.random()*(mapW-8));
var barLen=3+Math.floor(Math.random()*5);
for(var bx=barStart;bx<Math.min(barStart+barLen,mapW-1);bx++){
if(map[barY][bx]===0)map[barY][bx]=3;
}
}

// Place gold
gold=[];
goldTotal=5+level*2;goldCollected=0;
for(var g=0;g<goldTotal;g++){
var gx2,gy;
var attempts=0;
do{
gx2=1+Math.floor(Math.random()*(mapW-2));
gy=1+Math.floor(Math.random()*(mapH-2));
attempts++;
} while(attempts<50&&(map[gy][gx2]!==0||(gy+1<mapH&&map[gy+1][gx2]===0)));
gold.push({x:gx2,y:gy,collected:false});
}

// Place enemies
enemies=[];
var enemyCount=Math.min(2+level,6);
for(var i=0;i<enemyCount;i++){
var ex,ey;
do{
ex=2+Math.floor(Math.random()*(mapW-4));
ey=1+Math.floor(Math.random()*(mapH-3));
} while(map[ey][ex]!==0&&map[ey][ex]!==2);
enemies.push({
x:ex*TILE,y:ey*TILE,w:TILE-4,h:TILE-2,
speed:50+level*5+Math.random()*20,
alive:true,trapped:false,trapTimer:0,trapX:0,trapY:0,
dir:Math.random()<0.5?-1:1,
climbing:false,onBar:false,falling:false,vy:0,
frame:0,respawnTimer:0
});
}

// Place player
player={x:2*TILE,y:(mapH-2)*TILE,w:TILE-4,h:TILE-2,
facing:1,climbing:false,onBar:false,falling:false,vy:0};

// Exit
exitX=Math.floor(mapW/2);
exitLadderActive=false;

// Holes
holes=[];
}

function resetGame(){
score=0;lives=3;level=1;gameTime=0;
particles=[];
generateMap();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=20+Math.random()*80;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.4,maxLife:0.3+Math.random()*0.4,color:color,size:1+Math.random()*2});
}}

function tileAt(tx,ty){
if(tx<0||tx>=mapW||ty<0||ty>=mapH)return 4;
// Check holes
for(var i=0;i<holes.length;i++){
if(holes[i].x===tx&&holes[i].y===ty&&holes[i].timer>0)return 0;
}
return map[ty][tx];
}

function isSupported(px,py,pw){
var tx1=Math.floor(px/TILE);
var tx2=Math.floor((px+pw-1)/TILE);
var ty=Math.floor(py/TILE);
var tBelow=ty+1;
// On ladder
if(tileAt(tx1,ty)===2||tileAt(tx2,ty)===2)return true;
// On bar
if(tileAt(tx1,ty)===3||tileAt(tx2,ty)===3)return true;
// On solid ground
if(tBelow<mapH){
var b1=tileAt(tx1,tBelow);
var b2=tileAt(tx2,tBelow);
if(b1===1||b1===4||b2===1||b2===4)return true;
}
// At bottom
if(py+TILE>=mapH*TILE)return true;
return false;
}

function canWalk(px,py,pw,ph){
var tx1=Math.floor(px/TILE);
var tx2=Math.floor((px+pw-1)/TILE);
var ty1=Math.floor(py/TILE);
var ty2=Math.floor((py+ph-1)/TILE);
for(var ty=ty1;ty<=ty2;ty++){
for(var tx=tx1;tx<=tx2;tx++){
var t=tileAt(tx,ty);
if(t===1||t===4)return false;
}
}
return true;
}

function digHole(side){
var tx=Math.floor((player.x+player.w/2)/TILE)+side;
var ty=Math.floor((player.y+player.h)/TILE);
if(ty>=0&&ty<mapH&&tx>=0&&tx<mapW&&map[ty][tx]===1){
// Check if player is supported
if(!isSupported(player.x,player.y,player.w))return;
holes.push({x:tx,y:ty,timer:(4+level*0.2)/diffMult});
addParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#aa8866',6);
}
}

function update(dt){
gameTime+=dt;
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12);

// Player movement
var onLadder=false,onBar=false;
var ptx=Math.floor((player.x+player.w/2)/TILE);
var pty=Math.floor((player.y+player.h/2)/TILE);
var currentTile=tileAt(ptx,pty);
if(currentTile===2)onLadder=true;
if(currentTile===3)onBar=true;

if(keyLeft){
var nx=player.x-PLAYER_SPEED*dt;
if(canWalk(nx,player.y,player.w,player.h)){player.x=nx;player.facing=-1;}
}
if(keyRight){
var nx2=player.x+PLAYER_SPEED*dt;
if(canWalk(nx2,player.y,player.w,player.h)){player.x=nx2;player.facing=1;}
}
if(keyUp&&onLadder){
var ny=player.y-PLAYER_SPEED*dt;
player.y=ny;player.climbing=true;player.falling=false;player.vy=0;
}
if(keyDown){
var ny2=player.y+PLAYER_SPEED*dt;
var btx=Math.floor((player.x+player.w/2)/TILE);
var bty=Math.floor((ny2+player.h)/TILE);
if(tileAt(btx,bty)===2||tileAt(btx,pty)===2){
player.y=ny2;player.climbing=true;
}
}

// Digging
if(keyDigLeft)digHole(-1);
if(keyDigRight)digHole(1);

// Gravity
if(!onLadder&&!onBar){
if(!isSupported(player.x,player.y,player.w)){
player.vy=Math.min(FALL_SPEED,player.vy+GRAVITY*dt);
player.y+=player.vy*dt;
player.falling=true;
} else {
// Snap to tile
var snapY=Math.floor(player.y/TILE)*TILE;
if(Math.abs(player.y-snapY)<5)player.y=snapY;
player.vy=0;player.falling=false;
}
} else {
player.vy=0;player.falling=false;
}

// Collect gold
for(var i=0;i<gold.length;i++){
var g=gold[i];if(g.collected)continue;
if(Math.abs(player.x-g.x*TILE)<TILE*0.7&&Math.abs(player.y-g.y*TILE)<TILE*0.7){
g.collected=true;goldCollected++;score+=250;
addParticles(g.x*TILE+TILE/2,g.y*TILE+TILE/2,'#ffcc00',10);
}
}

// Check if all gold collected - activate exit
if(goldCollected>=goldTotal&&!exitLadderActive){
exitLadderActive=true;
// Place exit ladder at top
for(var y=0;y<mapH-1;y++){
map[y][exitX]=2;
}
addParticles(exitX*TILE+TILE/2,TILE,'#00ff00',15);
}

// Exit check
if(exitLadderActive&&player.y<TILE){
level++;score+=2000;
generateMap();
}

// Update holes
for(var i=holes.length-1;i>=0;i--){
holes[i].timer-=dt;
if(holes[i].timer<=0){
// Kill any enemy in the hole
for(var j=0;j<enemies.length;j++){
var e=enemies[j];
var etx=Math.floor((e.x+e.w/2)/TILE);
var ety=Math.floor((e.y+e.h/2)/TILE);
if(etx===holes[i].x&&ety===holes[i].y&&e.trapped){
e.trapped=false;e.alive=true;
// Respawn enemy at top
e.x=(1+Math.floor(Math.random()*(mapW-2)))*TILE;
e.y=TILE;e.vy=0;
addParticles(holes[i].x*TILE+TILE/2,holes[i].y*TILE+TILE/2,'#ff0000',8);
}
}
holes.splice(i,1);
}
}

// Update enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(e.trapped){
e.trapTimer-=dt;
if(e.trapTimer<=0){
e.trapped=false;
e.x=e.trapX*TILE;e.y=(e.trapY-1)*TILE;e.vy=0;
}
continue;
}

e.frame++;

// Simple AI: move toward player
var edx=player.x-e.x,edy=player.y-e.y;
var etx2=Math.floor((e.x+e.w/2)/TILE);
var ety2=Math.floor((e.y+e.h/2)/TILE);
var eTile=tileAt(etx2,ety2);
var eOnLadder=eTile===2;
var eOnBar=eTile===3;

// Horizontal movement
if(Math.abs(edx)>5){
var emx=Math.sign(edx)*e.speed*diffMult*dt;
var enx=e.x+emx;
if(canWalk(enx,e.y,e.w,e.h)){
e.x=enx;
e.dir=edx>0?1:-1;
}
}

// Climb ladders
if(eOnLadder&&Math.abs(edy)>TILE){
e.y+=Math.sign(edy)*e.speed*0.7*diffMult*dt;
}

// Gravity for enemies
if(!eOnLadder&&!eOnBar){
if(!isSupported(e.x,e.y,e.w)){
e.vy=Math.min(FALL_SPEED,e.vy+GRAVITY*dt);
e.y+=e.vy*dt;
} else {
e.vy=0;
var eSnapY=Math.floor(e.y/TILE)*TILE;
if(Math.abs(e.y-eSnapY)<5)e.y=eSnapY;
}
} else {
e.vy=0;
}

// Check if enemy fell into hole
for(var h=0;h<holes.length;h++){
var hx=holes[h].x,hy=holes[h].y;
if(Math.abs(e.x-hx*TILE)<TILE*0.6&&Math.abs(e.y-hy*TILE)<TILE*0.6){
e.trapped=true;
e.trapTimer=3;
e.trapX=hx;e.trapY=hy;
e.x=hx*TILE;e.y=hy*TILE;
score+=100;
addParticles(e.x+TILE/2,e.y+TILE/2,'#ffcc00',6);
break;
}
}

// Enemy-player collision
if(!e.trapped){
if(Math.abs(e.x-player.x)<TILE*0.6&&Math.abs(e.y-player.y)<TILE*0.6){
lives--;
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff0000',15);
if(lives<=0){gameState='gameover';return;}
player.x=2*TILE;player.y=(mapH-2)*TILE;player.vy=0;
}
}
}

// Fall off screen
if(player.y>mapH*TILE+50){
lives--;
if(lives<=0){gameState='gameover';return;}
player.x=2*TILE;player.y=(mapH-2)*TILE;player.vy=0;
}

// Particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function render(){
ctx.fillStyle='#0a0a15';ctx.fillRect(0,0,W,H);

var offsetX=(W-mapW*TILE)/2;
var offsetY=(H-mapH*TILE)/2;
ctx.save();
ctx.translate(offsetX,offsetY);

// Draw map
for(var y=0;y<mapH;y++){
for(var x=0;x<mapW;x++){
var t=tileAt(x,y);
var tx2=x*TILE,ty2=y*TILE;
if(t===1){
// Brick
var bGrad=ctx.createLinearGradient(tx2,ty2,tx2,ty2+TILE);
bGrad.addColorStop(0,'#aa7744');bGrad.addColorStop(1,'#774422');
ctx.fillStyle=bGrad;ctx.fillRect(tx2,ty2,TILE,TILE);
ctx.strokeStyle='#663311';ctx.lineWidth=1;
ctx.strokeRect(tx2,ty2,TILE,TILE);
// Brick lines
ctx.strokeStyle='#553311';
ctx.beginPath();ctx.moveTo(tx2+TILE/2,ty2);ctx.lineTo(tx2+TILE/2,ty2+TILE/2);ctx.stroke();
ctx.beginPath();ctx.moveTo(tx2,ty2+TILE/2);ctx.lineTo(tx2+TILE,ty2+TILE/2);ctx.stroke();
} else if(t===2){
// Ladder
ctx.strokeStyle='#888';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(tx2+TILE*0.2,ty2);ctx.lineTo(tx2+TILE*0.2,ty2+TILE);ctx.stroke();
ctx.beginPath();ctx.moveTo(tx2+TILE*0.8,ty2);ctx.lineTo(tx2+TILE*0.8,ty2+TILE);ctx.stroke();
// Rungs
ctx.beginPath();ctx.moveTo(tx2+TILE*0.2,ty2+TILE*0.3);ctx.lineTo(tx2+TILE*0.8,ty2+TILE*0.3);ctx.stroke();
ctx.beginPath();ctx.moveTo(tx2+TILE*0.2,ty2+TILE*0.7);ctx.lineTo(tx2+TILE*0.8,ty2+TILE*0.7);ctx.stroke();
} else if(t===3){
// Bar/rope
ctx.strokeStyle='#cc8844';ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(tx2,ty2+TILE*0.3);ctx.lineTo(tx2+TILE,ty2+TILE*0.3);ctx.stroke();
} else if(t===4){
// Solid
ctx.fillStyle='#444455';ctx.fillRect(tx2,ty2,TILE,TILE);
ctx.fillStyle='#555566';ctx.fillRect(tx2+1,ty2+1,TILE-2,TILE-2);
}
}
}

// Draw holes (empty space in bricks)
for(var i=0;i<holes.length;i++){
var h=holes[i];
ctx.fillStyle='#0a0a15';
ctx.fillRect(h.x*TILE,h.y*TILE,TILE,TILE);
// Crumbling edge effect
if(h.timer<1.5){
ctx.fillStyle='#aa7744';
var fillAmt=1-(h.timer/1.5);
ctx.fillRect(h.x*TILE,h.y*TILE,TILE,TILE*fillAmt*0.5);
ctx.fillRect(h.x*TILE,h.y*TILE+TILE*(1-fillAmt*0.5),TILE,TILE*fillAmt*0.5);
}
}

// Gold
for(var i=0;i<gold.length;i++){
var g=gold[i];if(g.collected)continue;
ctx.save();
ctx.shadowColor='#ffcc00';ctx.shadowBlur=6+Math.sin(gameTime*4+i)*3;
ctx.fillStyle='#ffcc00';
var gx=g.x*TILE+TILE*0.2,gy=g.y*TILE+TILE*0.2;
var gw=TILE*0.6,gh=TILE*0.6;
ctx.beginPath();
ctx.moveTo(gx+gw/2,gy);ctx.lineTo(gx+gw,gy+gh*0.4);
ctx.lineTo(gx+gw*0.8,gy+gh);ctx.lineTo(gx+gw*0.2,gy+gh);
ctx.lineTo(gx,gy+gh*0.4);ctx.closePath();ctx.fill();
ctx.fillStyle='#ffee88';
ctx.fillRect(gx+gw*0.3,gy+gh*0.3,gw*0.4,gh*0.3);
ctx.shadowBlur=0;ctx.restore();
}

// Exit ladder indicator
if(exitLadderActive){
ctx.save();
ctx.shadowColor='#00ff00';ctx.shadowBlur=8+Math.sin(gameTime*5)*4;
ctx.fillStyle='rgba(0,255,0,0.2)';
ctx.fillRect(exitX*TILE,0,TILE,mapH*TILE);
ctx.shadowBlur=0;ctx.restore();
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
ctx.save();
if(e.trapped){
// Trapped in hole - only head visible
ctx.fillStyle='#cc3333';
ctx.beginPath();ctx.arc(e.x+TILE/2,e.y+TILE*0.3,TILE*0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+TILE*0.4,e.y+TILE*0.25,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+TILE*0.6,e.y+TILE*0.25,2,0,Math.PI*2);ctx.fill();
} else {
// Full enemy
ctx.fillStyle='#cc3333';
ctx.fillRect(e.x+2,e.y+2,e.w,e.h);
// Head
ctx.fillStyle='#ff4444';
ctx.beginPath();ctx.arc(e.x+TILE/2,e.y+TILE*0.3,TILE*0.28,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(e.x+TILE*0.38,e.y+TILE*0.25,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+TILE*0.62,e.y+TILE*0.25,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(e.x+TILE*0.38+e.dir,e.y+TILE*0.25,1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(e.x+TILE*0.62+e.dir,e.y+TILE*0.25,1,0,Math.PI*2);ctx.fill();
// Body
ctx.fillStyle='#cc3333';
ctx.fillRect(e.x+TILE*0.2,e.y+TILE*0.5,TILE*0.6,TILE*0.3);
// Legs
ctx.fillRect(e.x+TILE*0.2,e.y+TILE*0.75,TILE*0.2,TILE*0.25);
ctx.fillRect(e.x+TILE*0.6,e.y+TILE*0.75,TILE*0.2,TILE*0.25);
}
ctx.restore();
}

// Player
ctx.save();
// Head
ctx.fillStyle='#4488ff';
ctx.beginPath();ctx.arc(player.x+TILE/2,player.y+TILE*0.28,TILE*0.28,0,Math.PI*2);ctx.fill();
// Face
ctx.fillStyle='#ffccaa';
ctx.fillRect(player.x+TILE*0.3,player.y+TILE*0.2,TILE*0.4,TILE*0.2);
// Eyes
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(player.x+TILE*0.4+player.facing,player.y+TILE*0.28,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(player.x+TILE*0.6+player.facing,player.y+TILE*0.28,1.5,0,Math.PI*2);ctx.fill();
// Body
ctx.fillStyle='#4488ff';
ctx.fillRect(player.x+TILE*0.2,player.y+TILE*0.48,TILE*0.6,TILE*0.3);
// Legs
ctx.fillStyle='#3366cc';
ctx.fillRect(player.x+TILE*0.2,player.y+TILE*0.75,TILE*0.2,TILE*0.25);
ctx.fillRect(player.x+TILE*0.6,player.y+TILE*0.75,TILE*0.2,TILE*0.25);
// Dig indicator
if(keyDigLeft||keyDigRight){
ctx.strokeStyle='#ffaa00';ctx.lineWidth=2;
var digDir=keyDigLeft?-1:1;
ctx.beginPath();
ctx.moveTo(player.x+TILE/2+digDir*TILE*0.4,player.y+TILE*0.6);
ctx.lineTo(player.x+TILE/2+digDir*TILE*0.8,player.y+TILE*0.9);
ctx.stroke();
}
ctx.restore();

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life/p.maxLife;
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

ctx.restore(); // End offset

// HUD
ctx.fillStyle='#ffcc00';ctx.font='12px "Courier New",monospace';
ctx.fillText('GOLD: '+goldCollected+'/'+goldTotal,10,16);
if(exitLadderActive){
ctx.fillStyle='#00ff00';ctx.fillText('EXIT OPEN!',10,30);
}

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#4488ff';
ctx.beginPath();ctx.arc(W-60+i*20,15,7,0,Math.PI*2);ctx.fill();
}

// Level
ctx.fillStyle='#aaa';ctx.textAlign='right';
ctx.fillText('LVL '+level,W-10,30);ctx.textAlign='left';
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#0a0a15';ctx.fillRect(0,0,W,H);

// Ladder pattern
ctx.strokeStyle='rgba(100,100,100,0.2)';ctx.lineWidth=2;
for(var lx=W*0.1;lx<W;lx+=W*0.15){
ctx.beginPath();ctx.moveTo(lx,0);ctx.lineTo(lx,H);ctx.stroke();
ctx.beginPath();ctx.moveTo(lx+20,0);ctx.lineTo(lx+20,H);ctx.stroke();
for(var ly=10;ly<H;ly+=25){
ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+20,ly);ctx.stroke();
}
}

// Gold sparkle
for(var i=0;i<5;i++){
var gx2=W*0.2+i*(W*0.15);
var gy2=H*0.45+Math.sin(titlePulse+i)*15;
ctx.save();
ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;
ctx.fillStyle='#ffcc00';
ctx.beginPath();
ctx.moveTo(gx2,gy2-8);ctx.lineTo(gx2+8,gy2);
ctx.lineTo(gx2,gy2+8);ctx.lineTo(gx2-8,gy2);
ctx.closePath();ctx.fill();
ctx.shadowBlur=0;ctx.restore();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('LODE RUNNER',W/2,H*0.22);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#aa8844';
ctx.fillText('COLLECT ALL THE GOLD',W/2,H*0.31);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('ARROWS/WASD: Move | Z/Q: Dig Left | X/E: Dig Right',W/2,H*0.67);
ctx.fillText('Collect all gold, then climb the exit ladder!',W/2,H*0.72);
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
ctx.fillText('Level: '+level+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
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
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key==='z'||e.key==='Z'||e.key==='q'||e.key==='Q')keyDigLeft=down;
if(e.key==='x'||e.key==='X'||e.key==='e'||e.key==='E')keyDigRight=down;
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

window.initLodeRunner=function(){
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

window.stopLodeRunner=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyDigLeft=keyDigRight=false;
};
})();
