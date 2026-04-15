// Wrecking Crew — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var COLS=12,ROWS=8,cellW=0,cellH=0,ox=0,oy=0;
var grid=[]; // 0=empty, 1=brick, 2=concrete, 3=ladder, 4=bomb, 5=column
var player,enemies=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var PLAYER_SPEED=120,ENEMY_SPEED=50;
var hammerTimer=0,hammerActive=false;
var wallsRemaining=0,totalWalls=0;
var GRAVITY=400;

// Difficulty progression: level 1-2 easy, 3-5 medium, 6+ hard
function getDiffMult(){
    return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
cellW=Math.floor(W*0.85/COLS);cellH=Math.floor(H*0.85/ROWS);
ox=(W-cellW*COLS)/2;oy=H*0.05;
}

function buildLevel(){
grid=[];wallsRemaining=0;
for(var i=0;i<COLS*ROWS;i++)grid[i]=0;

// Bottom row is floor (concrete)
for(var c=0;c<COLS;c++)grid[(ROWS-1)*COLS+c]=2;

// Platforms every 2 rows
for(var r2=1;r2<ROWS-1;r2+=2){
for(var c=0;c<COLS;c++){
if(Math.random()<0.7)grid[r2*COLS+c]=1; // brick
else if(Math.random()<0.3)grid[r2*COLS+c]=2; // concrete (unbreakable)
}
}

// Ladders (ensure connectivity)
for(var r2=0;r2<ROWS-1;r2+=2){
var lc=1+Math.floor(Math.random()*(COLS-2));
grid[r2*COLS+lc]=3;
if(r2+1<ROWS)grid[(r2+1)*COLS+lc]=3;
// Second ladder for easier navigation
var lc2=(lc+4+Math.floor(Math.random()*3))%COLS;
grid[r2*COLS+lc2]=3;
if(r2+1<ROWS)grid[(r2+1)*COLS+lc2]=3;
}

// Some bombs (chain destruction)
for(var i=0;i<2+level;i++){
var bc=Math.floor(Math.random()*COLS);
var br2=Math.floor(Math.random()*(ROWS-2))*2+1;
if(br2<ROWS&&grid[br2*COLS+bc]===1)grid[br2*COLS+bc]=4;
}

// Count breakable walls
for(var i=0;i<COLS*ROWS;i++){
if(grid[i]===1||grid[i]===4)wallsRemaining++;
}
totalWalls=wallsRemaining;

// Enemies
enemies=[];
var dm=getDiffMult();
var numEnemies=Math.min(1+Math.floor(level*dm*0.5),4);
for(var i=0;i<numEnemies;i++){
var ec=Math.floor(Math.random()*COLS);
enemies.push({x:ec,y:0,vx:ENEMY_SPEED*dm*(Math.random()>0.5?1:-1),
dir:Math.random()>0.5?1:-1,onLadder:false,type:Math.floor(Math.random()*3),
timer:Math.random()*3});
}
}

function resetGame(){
score=0;lives=3;level=1;gameTime=0;
player={x:1,y:ROWS-2,onGround:true,onLadder:false,facing:1,hammerSwing:0};
hammerTimer=0;hammerActive=false;
particles=[];
buildLevel();
gameState='playing';
}

function getCell(c,r2){
if(c<0||c>=COLS||r2<0||r2>=ROWS)return 2; // out of bounds = solid
return grid[r2*COLS+c];
}

function isSolid(c,r2){
var v=getCell(c,r2);
return v===1||v===2||v===4||v===5;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150-50,
life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function breakWall(c,r2){
var cell=getCell(c,r2);
if(cell===0||cell===2||cell===3)return; // can't break empty, concrete, or ladders
var px=ox+c*cellW+cellW/2,py=oy+r2*cellH+cellH/2;
if(cell===4){
// Bomb - chain explosion
grid[r2*COLS+c]=0;wallsRemaining--;score+=50;
addParticles(px,py,'#ff6600',15);
// Destroy adjacent bricks
for(var dc=-1;dc<=1;dc++){
for(var dr2=-1;dr2<=1;dr2++){
if(dc===0&&dr2===0)continue;
var nc=c+dc,nr=r2+dr2;
if(nc>=0&&nc<COLS&&nr>=0&&nr<ROWS){
var adj=getCell(nc,nr);
if(adj===1||adj===4){
breakWall(nc,nr); // recursive for bomb chains
}
}
}
}
}else{
grid[r2*COLS+c]=0;wallsRemaining--;score+=25;
addParticles(px,py,'#cc8844',8);
}
}

function useHammer(){
if(hammerActive)return;
hammerActive=true;hammerTimer=0.3;
player.hammerSwing=0.3;

// Break wall in front of player
var tc=Math.round(player.x)+player.facing;
var tr=Math.round(player.y);
if(tc>=0&&tc<COLS&&tr>=0&&tr<ROWS){
var cell=getCell(tc,tr);
if(cell===1||cell===4){
breakWall(tc,tr);
}
}
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

if(hammerTimer>0){hammerTimer-=dt;if(hammerTimer<=0)hammerActive=false;}
if(player.hammerSwing>0)player.hammerSwing-=dt;

// Player movement
var px2=player.x,py2=player.y;
var onLadder=getCell(Math.round(px2),Math.round(py2))===3;
var belowSolid=isSolid(Math.round(px2),Math.round(py2)+1);
var belowLadder=getCell(Math.round(px2),Math.round(py2)+1)===3;

if(keyLeft){
player.facing=-1;
var nx=px2-PLAYER_SPEED*dt/cellW;
if(!isSolid(Math.floor(nx),Math.round(py2)))player.x=nx;
}
if(keyRight){
player.facing=1;
var nx2=px2+PLAYER_SPEED*dt/cellW;
if(!isSolid(Math.ceil(nx2),Math.round(py2)))player.x=nx2;
}
if(keyUp&&(onLadder||belowLadder)){
player.onLadder=true;
var ny=py2-PLAYER_SPEED*dt/cellH;
if(ny>=0&&(getCell(Math.round(px2),Math.round(ny))===3||getCell(Math.round(px2),Math.floor(ny))===3||!isSolid(Math.round(px2),Math.round(ny))))
player.y=ny;
}
if(keyDown){
var ny2=py2+PLAYER_SPEED*dt/cellH;
if(ny2<ROWS-1&&(getCell(Math.round(px2),Math.ceil(ny2))===3||!isSolid(Math.round(px2),Math.ceil(ny2))))
player.y=ny2;
}

// Gravity (if not on ladder)
if(!onLadder&&!belowSolid&&!belowLadder){
player.y+=GRAVITY*dt/cellH;
}
// Snap to grid vertically when on ground
if(belowSolid&&!onLadder){
player.y=Math.round(player.y);
if(isSolid(Math.round(player.x),Math.round(player.y)))player.y--;
}
// Clamp
player.x=Math.max(0,Math.min(COLS-1,player.x));
player.y=Math.max(0,Math.min(ROWS-2,player.y));

// Hammer
if(keySpace){useHammer();keySpace=false;}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
e.timer+=dt;
var eOnLadder=getCell(Math.round(e.x),Math.round(e.y))===3;
var eBelowSolid=isSolid(Math.round(e.x),Math.round(e.y)+1);

// Simple AI: move horizontally, use ladders to chase player
if(e.timer>2){
e.timer=0;
if(Math.abs(player.y-e.y)>1&&eOnLadder){
e.onLadder=true;
}else{
e.onLadder=false;
e.dir=player.x>e.x?1:-1;
}
}

if(e.onLadder&&eOnLadder){
var ladderDir=player.y>e.y?1:-1;
e.y+=ladderDir*ENEMY_SPEED*0.5*dt/cellH;
}else{
e.x+=e.dir*ENEMY_SPEED*dt/cellW;
// Reverse at walls or edges
if(e.x<0||e.x>COLS-1||isSolid(Math.round(e.x)+e.dir,Math.round(e.y))){
e.dir*=-1;
}
// Fall if not on ground
if(!eBelowSolid&&!eOnLadder){
e.y+=GRAVITY*0.7*dt/cellH;
}
if(eBelowSolid&&!eOnLadder){
e.y=Math.round(e.y);
if(isSolid(Math.round(e.x),Math.round(e.y)))e.y--;
}
}
e.x=Math.max(0,Math.min(COLS-1,e.x));
e.y=Math.max(0,Math.min(ROWS-1,e.y));

// Collision with player
var dx=Math.abs(player.x-e.x),dy=Math.abs(player.y-e.y);
if(dx<0.6&&dy<0.6){
// If hammer is active, destroy enemy
if(hammerActive&&Math.abs(player.x+player.facing-e.x)<1.2){
addParticles(ox+e.x*cellW+cellW/2,oy+e.y*cellH+cellH/2,'#ff4444',12);
score+=200;
e.x=Math.floor(Math.random()*COLS);e.y=0;e.timer=0;
}else{
// Player hit
lives--;
addParticles(ox+player.x*cellW+cellW/2,oy+player.y*cellH+cellH/2,'#ffcc00',15);
player.x=1;player.y=ROWS-2;
if(lives<=0)gameState='gameover';
}
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Level complete
if(wallsRemaining<=0){
level++;score+=500;
addParticles(W/2,H/2,'#ffcc00',30);
buildLevel();
player.x=1;player.y=ROWS-2;
}
}

function drawCell(c,r2){
var x=ox+c*cellW,y=oy+r2*cellH;
var v=grid[r2*COLS+c];
if(v===0)return;
if(v===1){
// Brick
var grad=ctx.createLinearGradient(x,y,x,y+cellH);
grad.addColorStop(0,'#cc7744');grad.addColorStop(0.5,'#aa5522');grad.addColorStop(1,'#884411');
ctx.fillStyle=grad;
ctx.fillRect(x+1,y+1,cellW-2,cellH-2);
// Brick lines
ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x+cellW/2,y+1);ctx.lineTo(x+cellW/2,y+cellH/2);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+1,y+cellH/2);ctx.lineTo(x+cellW-1,y+cellH/2);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+cellW/4,y+cellH/2);ctx.lineTo(x+cellW/4,y+cellH-1);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+cellW*3/4,y+cellH/2);ctx.lineTo(x+cellW*3/4,y+cellH-1);ctx.stroke();
}else if(v===2){
// Concrete
var grad2=ctx.createLinearGradient(x,y,x,y+cellH);
grad2.addColorStop(0,'#888');grad2.addColorStop(0.5,'#777');grad2.addColorStop(1,'#666');
ctx.fillStyle=grad2;
ctx.fillRect(x+1,y+1,cellW-2,cellH-2);
ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
ctx.strokeRect(x+2,y+2,cellW-4,cellH-4);
}else if(v===3){
// Ladder
ctx.strokeStyle='#ffcc44';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(x+cellW*0.25,y);ctx.lineTo(x+cellW*0.25,y+cellH);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+cellW*0.75,y);ctx.lineTo(x+cellW*0.75,y+cellH);ctx.stroke();
// Rungs
for(var rr=0;rr<4;rr++){
var ry=y+rr*cellH/4+cellH/8;
ctx.beginPath();ctx.moveTo(x+cellW*0.25,ry);ctx.lineTo(x+cellW*0.75,ry);ctx.stroke();
}
}else if(v===4){
// Bomb (looks like brick with bomb)
ctx.fillStyle='#cc7744';ctx.fillRect(x+1,y+1,cellW-2,cellH-2);
// Bomb symbol
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(x+cellW/2,y+cellH/2,cellW*0.2,0,Math.PI*2);ctx.fill();
// Fuse
ctx.strokeStyle='#ff8800';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+cellW/2,y+cellH/2-cellW*0.2);
ctx.quadraticCurveTo(x+cellW/2+5,y+cellH/2-cellW*0.35,x+cellW/2+8,y+cellH/2-cellW*0.3);
ctx.stroke();
// Spark
var spark=Math.sin(gameTime*8)>0;
if(spark){
ctx.fillStyle='#ff4400';ctx.beginPath();
ctx.arc(x+cellW/2+8,y+cellH/2-cellW*0.3,3,0,Math.PI*2);ctx.fill();
}
}
}

function drawPlayer2(){
var x=ox+player.x*cellW,y=oy+player.y*cellH;
var f=player.facing;
ctx.save();ctx.translate(x+cellW/2,y+cellH/2);
if(f<0)ctx.scale(-1,1);

// Hard hat
ctx.fillStyle='#ffcc00';
ctx.beginPath();ctx.arc(0,-cellH*0.25,cellW*0.25,Math.PI,0);ctx.fill();
ctx.fillRect(-cellW*0.3,-cellH*0.25,cellW*0.6,cellH*0.08);

// Head
ctx.fillStyle='#ffcc99';
ctx.beginPath();ctx.arc(0,-cellH*0.12,cellW*0.18,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#222';
ctx.fillRect(cellW*0.04,-cellH*0.15,cellW*0.06,cellH*0.05);

// Body (overalls)
ctx.fillStyle='#2266cc';
ctx.fillRect(-cellW*0.15,0,cellW*0.3,cellH*0.3);

// Hammer
if(player.hammerSwing>0){
var swing=Math.sin((0.3-player.hammerSwing)/0.3*Math.PI)*0.8;
ctx.save();ctx.rotate(-swing);
ctx.fillStyle='#886644';ctx.fillRect(cellW*0.15,-cellH*0.05,cellW*0.35,cellH*0.06);
ctx.fillStyle='#888';ctx.fillRect(cellW*0.4,-cellH*0.12,cellW*0.15,cellH*0.18);
ctx.restore();
}else{
// Hammer at rest
ctx.fillStyle='#886644';ctx.fillRect(cellW*0.12,0,cellW*0.25,cellH*0.05);
ctx.fillStyle='#888';ctx.fillRect(cellW*0.3,-cellH*0.05,cellW*0.12,cellH*0.14);
}

ctx.restore();
}

function drawEnemy(e){
var x=ox+e.x*cellW,y=oy+e.y*cellH;
var colors=['#ff4466','#66ff44','#ff8800'];
var c=colors[e.type%3];
ctx.save();ctx.translate(x+cellW/2,y+cellH/2);

// Body
ctx.fillStyle=c;
ctx.beginPath();ctx.roundRect(-cellW*0.2,-cellH*0.2,cellW*0.4,cellH*0.35,3);ctx.fill();
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(-cellW*0.08,-cellH*0.1,cellW*0.06,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cellW*0.08,-cellH*0.1,cellW*0.06,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
var eyeOff=Math.sin(gameTime*3+e.timer)*cellW*0.02;
ctx.beginPath();ctx.arc(-cellW*0.08+eyeOff,-cellH*0.1,cellW*0.03,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cellW*0.08+eyeOff,-cellH*0.1,cellW*0.03,0,Math.PI*2);ctx.fill();
// Legs
var legAnim=Math.sin(gameTime*6+e.timer)*cellW*0.03;
ctx.fillStyle=c;
ctx.fillRect(-cellW*0.12,cellH*0.12+legAnim,cellW*0.1,cellH*0.12);
ctx.fillRect(cellW*0.02,cellH*0.12-legAnim,cellW*0.1,cellH*0.12);

ctx.restore();
}

function render(){
// Background - construction site sky with depth
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#1a3388');bg.addColorStop(0.3,'#2244aa');bg.addColorStop(0.6,'#4466cc');bg.addColorStop(1,'#1a3388');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Construction crane silhouette
ctx.fillStyle='rgba(0,0,0,0.1)';
ctx.fillRect(W*0.85,0,4,H*0.5);ctx.fillRect(W*0.7,H*0.05,W*0.2,3);
ctx.fillRect(W*0.87,0,3,H*0.4);
// Sky gradient fade
var skyVig=ctx.createRadialGradient(W/2,H*0.3,W*0.1,W/2,H*0.3,W*0.6);
skyVig.addColorStop(0,'rgba(100,150,255,0.1)');skyVig.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=skyVig;ctx.fillRect(0,0,W,H);

// Grid area background with depth
var gridBg=ctx.createLinearGradient(ox,oy,ox,oy+cellH*ROWS);
gridBg.addColorStop(0,'rgba(0,0,0,0.2)');gridBg.addColorStop(1,'rgba(0,0,0,0.4)');
ctx.fillStyle=gridBg;
ctx.fillRect(ox-2,oy-2,cellW*COLS+4,cellH*ROWS+4);

// Draw grid cells
for(var r2=0;r2<ROWS;r2++){
for(var c=0;c<COLS;c++){
drawCell(c,r2);
}
}

// Draw enemies
for(var i=0;i<enemies.length;i++)drawEnemy(enemies[i]);

// Draw player
drawPlayer2();

// Particles with glow
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);
ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=4;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;

// Progress bar
var progW=W*0.3,progH=8;
var progX=(W-progW)/2,progY=H-20;
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(progX,progY,progW,progH);
var pct=totalWalls>0?(totalWalls-wallsRemaining)/totalWalls:0;
ctx.fillStyle='#44cc44';ctx.fillRect(progX,progY,progW*pct,progH);
ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(progX,progY,progW,progH);
ctx.fillStyle='#fff';ctx.font='9px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(Math.round(pct*100)+'%',progX+progW/2,progY+7);

// Lives
ctx.fillStyle='#ff6666';ctx.font='14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++)ctx.fillText('\u2665',10+i*20,H-8);
// Level
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('LEVEL '+level,W-10,H-8);
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#2244aa');bg.addColorStop(1,'#1a2266');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Brick decoration
for(var i=0;i<10;i++){
var bx=W*0.1+i*W*0.08;
ctx.fillStyle='hsla(20,60%,'+(30+Math.sin(titlePulse+i)*10)+'%,0.5)';
ctx.fillRect(bx,H*0.7,W*0.06,W*0.04);
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('WRECKING CREW',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';ctx.fillStyle='#ff8844';
ctx.fillText('DEMOLITION TIME!',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Up/Down for ladders',W/2,H*0.62);
ctx.fillText('Space to swing hammer and break walls',W/2,H*0.68);
ctx.fillText('Watch out for bombs - they chain explode!',W/2,H*0.74);
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
ctx.fillText('Level: '+level+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';
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

window.initWreckingCrew=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopWreckingCrew=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
