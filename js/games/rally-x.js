// Rally-X — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],checkpoints=[],walls=[],smokeTrail=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySmoke=false;
var MAZE_COLS=20,MAZE_ROWS=15,TILE=0,mazeOffX=0,mazeOffY=0;
var maze=[];
var PLAYER_SPEED=120,ENEMY_SPEED=80,smokeFuel=100,MAX_SMOKE=100;
var cameraX=0,cameraY=0;
var checksCollected=0,checksNeeded=0;

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
TILE=Math.floor(Math.min(W,H)/12);
}

function buildMaze(){
maze=[];
for(var r=0;r<MAZE_ROWS;r++){maze[r]=[];
for(var c=0;c<MAZE_COLS;c++){
maze[r][c]=(r===0||r===MAZE_ROWS-1||c===0||c===MAZE_COLS-1)?1:0;}}
// Add inner walls
for(var i=0;i<30+level*5;i++){
var wr=2+Math.floor(Math.random()*(MAZE_ROWS-4));
var wc=2+Math.floor(Math.random()*(MAZE_COLS-4));
var horizontal=Math.random()>0.5;
var len=2+Math.floor(Math.random()*3);
for(var j=0;j<len;j++){
var nr=wr+(horizontal?0:j),nc=wc+(horizontal?j:0);
if(nr>0&&nr<MAZE_ROWS-1&&nc>0&&nc<MAZE_COLS-1)maze[nr][nc]=1;}}
// Ensure start area is clear
maze[1][1]=0;maze[1][2]=0;maze[2][1]=0;
// Place checkpoints
checkpoints=[];checksCollected=0;
checksNeeded=5+level*2;if(checksNeeded>15)checksNeeded=15;
var placed=0;
while(placed<checksNeeded){
var cr=1+Math.floor(Math.random()*(MAZE_ROWS-2));
var cc=1+Math.floor(Math.random()*(MAZE_COLS-2));
if(maze[cr][cc]===0&&!(cr<=2&&cc<=2)){
checkpoints.push({r:cr,c:cc,collected:false});placed++;}}}

function spawnEnemies(){
enemies=[];
var count=2+level;if(count>6)count=6;
for(var i=0;i<count;i++){
var er,ec;do{er=1+Math.floor(Math.random()*(MAZE_ROWS-2));ec=1+Math.floor(Math.random()*(MAZE_COLS-2));}
while(maze[er][ec]!==0||(er<=3&&ec<=3));
enemies.push({r:er,c:ec,x:ec*TILE,y:er*TILE,dir:Math.floor(Math.random()*4),
moveTimer:0,stunTimer:0,color:['#ff4444','#ff8800','#ff44ff','#44ff44','#ffff44','#ff8888'][i%6]});}}

function resetGame(){
player={r:1,c:1,x:TILE,y:TILE,dir:0,speed:PLAYER_SPEED};
score=0;lives=3;level=1;gameTime=0;smokeFuel=MAX_SMOKE;smokeTrail=[];particles=[];
buildMaze();spawnEnemies();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});}

function canMove(r,c){return r>=0&&r<MAZE_ROWS&&c>=0&&c<MAZE_COLS&&maze[r][c]===0;}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);
// Player direction
var dirMap=[[1,0],[0,1],[-1,0],[0,-1]];// right,down,left,up
if(keyRight)player.dir=0;
if(keyDown)player.dir=1;
if(keyLeft)player.dir=2;
if(keyUp)player.dir=3;
// Move player
var d=dirMap[player.dir];
var nx=player.x+d[0]*PLAYER_SPEED*dt;
var ny=player.y+d[1]*PLAYER_SPEED*dt;
// Grid collision
var newC=Math.round(nx/TILE),newR=Math.round(ny/TILE);
if(canMove(newR,newC)){player.x=nx;player.y=ny;player.r=newR;player.c=newC;}
else{// Snap to grid
player.x=player.c*TILE;player.y=player.r*TILE;}
// Camera
cameraX=player.x-W/2;cameraY=player.y-H/2;
// Smoke screen
if(keySmoke&&smokeFuel>0){
smokeFuel-=30*dt;
smokeTrail.push({x:player.x,y:player.y,life:3});}
if(smokeFuel<MAX_SMOKE&&!keySmoke)smokeFuel+=5*dt;
if(smokeFuel<0)smokeFuel=0;
// Update smoke
for(var i=smokeTrail.length-1;i>=0;i--){smokeTrail[i].life-=dt;if(smokeTrail[i].life<=0)smokeTrail.splice(i,1);}
// Checkpoints
for(var i=0;i<checkpoints.length;i++){var cp=checkpoints[i];
if(!cp.collected&&Math.abs(player.r-cp.r)<1&&Math.abs(player.c-cp.c)<1){
cp.collected=true;checksCollected++;score+=200;
addParticles(cp.c*TILE,cp.r*TILE,'#ffcc00',8);
if(checksCollected>=checksNeeded){level++;score+=1000;buildMaze();spawnEnemies();
player.r=1;player.c=1;player.x=TILE;player.y=TILE;smokeFuel=MAX_SMOKE;}}}
// Enemies - difficulty scales AI and speed
var enemySpeedMult=ENEMY_SPEED*diffMult;
var randomChance=level<=2?0.5:(level<=5?0.3:0.15);// More random = easier
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(e.stunTimer>0){e.stunTimer-=dt;continue;}
e.moveTimer-=dt;
var moveInterval=level<=2?0.4:(level<=5?0.3:0.2);
if(e.moveTimer<=0){
e.moveTimer=moveInterval;
// AI: try to move toward player
var bestDir=e.dir,bestDist=99999;
for(var d=0;d<4;d++){
var dm=dirMap[d];var nr=e.r+dm[1],nc=e.c+dm[0];
if(!canMove(nr,nc))continue;
var dist=Math.abs(nr-player.r)+Math.abs(nc-player.c);
if(dist<bestDist){bestDist=dist;bestDir=d;}}
if(Math.random()<randomChance)bestDir=Math.floor(Math.random()*4);
var dm=dirMap[bestDir];var nr=e.r+dm[1],nc=e.c+dm[0];
if(canMove(nr,nc)){e.r=nr;e.c=nc;e.dir=bestDir;}}
var lerpSpeed=level<=2?6:8*diffMult;
e.x+=(e.c*TILE-e.x)*Math.min(1,lerpSpeed*dt);
e.y+=(e.r*TILE-e.y)*Math.min(1,lerpSpeed*dt);
// Check smoke stun
var stunDuration=level<=2?3:(level<=5?2:1.5);
for(var j=0;j<smokeTrail.length;j++){
if(Math.abs(e.x-smokeTrail[j].x)<TILE&&Math.abs(e.y-smokeTrail[j].y)<TILE){
e.stunTimer=stunDuration;break;}}
// Collision with player
var hitboxMult=level<=2?0.5:(level<=5?0.6:0.7);
if(Math.abs(e.x-player.x)<TILE*hitboxMult&&Math.abs(e.y-player.y)<TILE*hitboxMult&&e.stunTimer<=0){
lives--;addParticles(player.x,player.y,'#ff4444',12);
player.r=1;player.c=1;player.x=TILE;player.y=TILE;
if(lives<=0)gameState='gameover';}}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// Rich dark background with subtle gradient
var bgGrad=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
bgGrad.addColorStop(0,'#0d0d25');bgGrad.addColorStop(1,'#060610');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
ctx.save();ctx.translate(-cameraX,-cameraY);
// Maze with enhanced wall rendering
for(var r=0;r<MAZE_ROWS;r++){for(var c=0;c<MAZE_COLS;c++){
var x=c*TILE,y=r*TILE;
if(x-cameraX<-TILE||x-cameraX>W+TILE||y-cameraY<-TILE||y-cameraY>H+TILE)continue;
if(maze[r][c]===1){
// Gradient wall with 3D edge effect
var wGrad=ctx.createLinearGradient(x,y,x+TILE,y+TILE);
wGrad.addColorStop(0,'#3355aa');wGrad.addColorStop(0.5,'#224488');wGrad.addColorStop(1,'#1a3366');
ctx.fillStyle=wGrad;ctx.fillRect(x,y,TILE-1,TILE-1);
// Top edge highlight
ctx.fillStyle='#5577cc';ctx.fillRect(x,y,TILE-1,2);
// Left edge highlight
ctx.fillStyle='#4466bb';ctx.fillRect(x,y,2,TILE-1);
// Bottom shadow
ctx.fillStyle='#112244';ctx.fillRect(x,y+TILE-3,TILE-1,2);
}else{
// Road tile with subtle texture
ctx.fillStyle='#111122';ctx.fillRect(x,y,TILE-1,TILE-1);
// Dashed road markings at intersections
if(c>0&&c<MAZE_COLS-1&&r>0&&r<MAZE_ROWS-1){
ctx.fillStyle='#1a1a33';
if((r+c)%3===0){ctx.fillRect(x+TILE/2-1,y,2,TILE-1);}
if((r+c)%4===0){ctx.fillRect(x,y+TILE/2-1,TILE-1,2);}
}}}}
// Smoke trail with gradient cloud effect
for(var i=0;i<smokeTrail.length;i++){var s=smokeTrail[i];
var smokeAlpha=Math.min(0.6,s.life*0.3);
var smGrad=ctx.createRadialGradient(s.x+TILE/2,s.y+TILE/2,0,s.x+TILE/2,s.y+TILE/2,TILE*0.5);
smGrad.addColorStop(0,'rgba(220,220,220,'+smokeAlpha+')');
smGrad.addColorStop(0.5,'rgba(180,180,190,'+smokeAlpha*0.6+')');
smGrad.addColorStop(1,'rgba(150,150,160,0)');
ctx.fillStyle=smGrad;
ctx.beginPath();ctx.arc(s.x+TILE/2,s.y+TILE/2,TILE*0.5,0,Math.PI*2);ctx.fill();}
// Checkpoints with animated glow
for(var i=0;i<checkpoints.length;i++){var cp=checkpoints[i];
if(cp.collected)continue;
var cx=cp.c*TILE+TILE/2,cy=cp.r*TILE+TILE/2;
var flagPulse=0.6+0.4*Math.sin(gameTime*4+i*1.5);
ctx.save();
ctx.shadowColor='#ffdd44';ctx.shadowBlur=10+flagPulse*6;
// Flag pole
ctx.fillStyle='#aaa';ctx.fillRect(cx-5,cy-10,2,20);
// Flag with gradient
var fGrad=ctx.createLinearGradient(cx-4,cy-10,cx+8,cy-4);
fGrad.addColorStop(0,'#ffcc00');fGrad.addColorStop(1,'#ff8800');
ctx.fillStyle=fGrad;
ctx.beginPath();ctx.moveTo(cx-4,cy+8);ctx.lineTo(cx-4,cy-8);ctx.lineTo(cx+8,cy-4);ctx.lineTo(cx-4,cy);ctx.fill();
ctx.shadowBlur=0;ctx.restore();}
// Enemies with detailed cars
for(var i=0;i<enemies.length;i++){var e=enemies[i];
var ex=e.x+TILE/2,ey=e.y+TILE/2;
ctx.save();ctx.translate(ex,ey);
ctx.rotate([0,Math.PI/2,Math.PI,Math.PI*1.5][e.dir]);
var isStunned=e.stunTimer>0;
// Car body with gradient
var carGrad=ctx.createLinearGradient(-8,-5,8,5);
carGrad.addColorStop(0,isStunned?'#888':e.color);
carGrad.addColorStop(1,isStunned?'#666':'#882222');
ctx.fillStyle=carGrad;
if(!isStunned){ctx.shadowColor=e.color;ctx.shadowBlur=6;}
ctx.fillRect(-8,-5,16,10);
// Roof
ctx.fillStyle=isStunned?'#777':'#aa3333';ctx.fillRect(-5,-4,10,7);
// Windshield
ctx.fillStyle='#88ddff';ctx.fillRect(-3,-4,6,3);
// Headlights
ctx.fillStyle='#ffff88';ctx.fillRect(6,-3,2,2);ctx.fillRect(6,1,2,2);
// Taillights
ctx.fillStyle='#ff2222';ctx.fillRect(-9,-3,2,2);ctx.fillRect(-9,1,2,2);
// Wheels with detail
ctx.fillStyle='#222';
ctx.fillRect(-9,-6,4,3);ctx.fillRect(5,-6,4,3);
ctx.fillRect(-9,3,4,3);ctx.fillRect(5,3,4,3);
ctx.fillStyle='#444';
ctx.fillRect(-8,-5,2,1);ctx.fillRect(6,-5,2,1);
ctx.fillRect(-8,4,2,1);ctx.fillRect(6,4,2,1);
ctx.shadowBlur=0;ctx.restore();}
// Player car with enhanced detail
var px=player.x+TILE/2,py=player.y+TILE/2;
ctx.save();ctx.translate(px,py);
ctx.rotate([0,Math.PI/2,Math.PI,Math.PI*1.5][player.dir]);
// Car body gradient
var pGrad=ctx.createLinearGradient(-8,-6,8,6);
pGrad.addColorStop(0,'#66aaff');pGrad.addColorStop(0.5,'#4488ff');pGrad.addColorStop(1,'#2266dd');
ctx.fillStyle=pGrad;ctx.shadowColor='#4488ff';ctx.shadowBlur=10;
ctx.fillRect(-8,-5,16,10);
// Roof
ctx.fillStyle='#3377ee';ctx.fillRect(-5,-4,10,7);
// Windshield with reflection
var wsGrad=ctx.createLinearGradient(-2,-4,4,-1);
wsGrad.addColorStop(0,'#aaddff');wsGrad.addColorStop(1,'#66aadd');
ctx.fillStyle=wsGrad;ctx.fillRect(-2,-4,8,3);
// Headlights with glow
ctx.fillStyle='#ffffaa';ctx.shadowColor='#ffff88';ctx.shadowBlur=4;
ctx.fillRect(7,-3,2,2);ctx.fillRect(7,1,2,2);
ctx.shadowBlur=0;
// Taillights
ctx.fillStyle='#ff4444';ctx.fillRect(-9,-3,2,2);ctx.fillRect(-9,1,2,2);
// Racing stripe
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(-6,0,12,1);
// Wheels
ctx.fillStyle='#222';
ctx.fillRect(-9,-6,4,3);ctx.fillRect(5,-6,4,3);
ctx.fillRect(-9,3,4,3);ctx.fillRect(5,3,4,3);
ctx.fillStyle='#555';
ctx.fillRect(-8,-5,2,1);ctx.fillRect(6,-5,2,1);
ctx.fillRect(-8,4,2,1);ctx.fillRect(6,4,2,1);
ctx.shadowBlur=0;ctx.restore();
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
ctx.restore();
// Enhanced Radar Minimap with scan line effect
var mmW=90,mmH=68,mmX=W-mmW-10,mmY=10;
ctx.save();
// Minimap background with border glow
ctx.fillStyle='rgba(0,10,0,0.8)';ctx.fillRect(mmX-2,mmY-2,mmW+4,mmH+4);
ctx.fillStyle='rgba(0,20,0,0.9)';ctx.fillRect(mmX,mmY,mmW,mmH);
var msx=mmW/MAZE_COLS,msy=mmH/MAZE_ROWS;
for(var r=0;r<MAZE_ROWS;r++){for(var c=0;c<MAZE_COLS;c++){
if(maze[r][c]===1){ctx.fillStyle='#0a3322';ctx.fillRect(mmX+c*msx,mmY+r*msy,msx,msy);}}}
// Radar sweep line
var sweepAngle=(gameTime*1.5)%(Math.PI*2);
var sweepCX=mmX+player.c*msx,sweepCY=mmY+player.r*msy;
ctx.save();ctx.globalAlpha=0.3;
ctx.fillStyle='#00ff44';
ctx.beginPath();ctx.moveTo(sweepCX,sweepCY);
ctx.arc(sweepCX,sweepCY,mmW*0.7,sweepAngle-0.4,sweepAngle,false);
ctx.closePath();ctx.fill();
ctx.globalAlpha=1;ctx.restore();
// Checkpoints on minimap with glow
for(var i=0;i<checkpoints.length;i++){var cp=checkpoints[i];
if(!cp.collected){
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
ctx.fillRect(mmX+cp.c*msx-1,mmY+cp.r*msy-1,3,3);ctx.shadowBlur=0;}}
// Player on minimap (blinking)
var blink=Math.sin(gameTime*8)>0;
if(blink){ctx.fillStyle='#44aaff';ctx.shadowColor='#4488ff';ctx.shadowBlur=4;
ctx.fillRect(mmX+player.c*msx-2,mmY+player.r*msy-2,4,4);ctx.shadowBlur=0;}
// Enemies on minimap
for(var i=0;i<enemies.length;i++){
ctx.fillStyle=enemies[i].stunTimer>0?'#666':'#ff4444';
ctx.fillRect(mmX+enemies[i].c*msx-1,mmY+enemies[i].r*msy-1,3,3);}
ctx.strokeStyle='#00aa44';ctx.lineWidth=2;ctx.strokeRect(mmX,mmY,mmW,mmH);
ctx.restore();
// Enhanced Smoke fuel bar with gradient
var fuelW=90,fuelH=10,fuelX=15,fuelY=H-25;
ctx.fillStyle='#1a1a2a';ctx.fillRect(fuelX-1,fuelY-1,fuelW+2,fuelH+2);
ctx.fillStyle='#222';ctx.fillRect(fuelX,fuelY,fuelW,fuelH);
var fuelGrad=ctx.createLinearGradient(fuelX,fuelY,fuelX+fuelW*(smokeFuel/MAX_SMOKE),fuelY);
fuelGrad.addColorStop(0,'#44dddd');fuelGrad.addColorStop(1,'#88ffff');
ctx.fillStyle=fuelGrad;ctx.fillRect(fuelX,fuelY,fuelW*(smokeFuel/MAX_SMOKE),fuelH);
ctx.strokeStyle='#44aaaa';ctx.lineWidth=1;ctx.strokeRect(fuelX,fuelY,fuelW,fuelH);
ctx.fillStyle='#88dddd';ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='left';ctx.fillText('SMOKE',fuelX,fuelY-4);
// Flags collected with icon
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffaa00';ctx.shadowBlur=6;
ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('FLAGS: '+checksCollected+'/'+checksNeeded,15,20);
ctx.shadowBlur=0;
// Lives as mini cars
for(var i=0;i<lives;i++){
ctx.fillStyle='#4488ff';ctx.fillRect(15+i*22,30,14,8);
ctx.fillStyle='#88bbff';ctx.fillRect(19+i*22,31,5,3);
ctx.fillStyle='#222';ctx.fillRect(14+i*22,29,3,2);ctx.fillRect(26+i*22,29,3,2);
ctx.fillRect(14+i*22,36,3,2);ctx.fillRect(26+i*22,36,3,2);}
}

function drawTitle(dt){
ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Animated car trail
var carX=(titlePulse*60)%W;
ctx.fillStyle='#4488ff';ctx.fillRect(carX-8,H*0.5-5,16,10);
// Smoke behind car
for(var i=0;i<5;i++){ctx.fillStyle='rgba(200,200,200,'+(0.3-i*0.05)+')';
ctx.beginPath();ctx.arc(carX-20-i*15,H*0.5,6,0,Math.PI*2);ctx.fill();}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';ctx.fillStyle='#44ccff';ctx.fillText('RALLY-X',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#88ddff';ctx.fillText('COLLECT ALL FLAGS!',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to drive, Space for smoke screen',W/2,H*0.68);
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
if(gameState==='title'){gameTime+=dt;drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){gameTime+=dt;render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keySmoke=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initRallyX=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopRallyX=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySmoke=false;};
})();
