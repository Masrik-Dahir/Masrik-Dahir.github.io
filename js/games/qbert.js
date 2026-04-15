// Q*bert — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,cubes=[],enemies=[],discs=[],particles=[];
var ROWS=7,TOTAL_CUBES=28;
var cubeW=0,cubeH=0,originX=0,originY=0;
var hopTimer=0,HOP_DURATION=0.22;
var deathBubbleTimer=0,DEATH_BUBBLE_TIME=1.2;
var levelClearTimer=0,LEVEL_CLEAR_TIME=2.0;
var inputQueue=[];
var enemySpawnTimer=0;
var twoStepLevel=false;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12); }

// Colors
var COLOR_START='#1144cc',COLOR_MID='#ffaa00',COLOR_TARGET='#ffff00';
var COLOR_BG='#111122';

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
computeLayout();}

function computeLayout(){
// Size cubes to fit the pyramid nicely
cubeW=Math.floor(Math.min(W/(ROWS+2),H/(ROWS+3))*1.1);
cubeH=cubeW;
originX=W/2;
originY=H*0.08+cubeH*0.3;}

// --- Cube grid (isometric pyramid) ---
// Row 0 has 1 cube, row 1 has 2, ... row 6 has 7
// Each cube has (row, col) where col goes 0..row
function buildCubes(){
cubes=[];
for(var r=0;r<ROWS;r++){
for(var c=0;c<=r;c++){
cubes.push({row:r,col:c,colorState:0,targetState:twoStepLevel?2:1});}}
}

function getCube(row,col){
for(var i=0;i<cubes.length;i++){if(cubes[i].row===row&&cubes[i].col===col)return cubes[i];}
return null;}

// Isometric position of a cube's top-center
function cubePos(row,col){
var dx=cubeW*0.55;
var dy=cubeH*0.42;
var x=originX+(col-row/2)*dx*2;
var y=originY+row*dy*2+cubeH*0.5;
return{x:x,y:y};}

// --- Drawing isometric cubes ---
function drawCube(x,y,cw,ch,topColor,leftColor,rightColor,glow){
var hw=cw*0.55,hh=ch*0.42;
// top face
ctx.fillStyle=topColor;
ctx.beginPath();
ctx.moveTo(x,y-hh);
ctx.lineTo(x+hw,y);
ctx.lineTo(x,y+hh);
ctx.lineTo(x-hw,y);
ctx.closePath();
ctx.fill();
if(glow){ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=2;ctx.stroke();}
// left face
ctx.fillStyle=leftColor;
ctx.beginPath();
ctx.moveTo(x-hw,y);
ctx.lineTo(x,y+hh);
ctx.lineTo(x,y+hh+ch*0.35);
ctx.lineTo(x-hw,y+ch*0.35);
ctx.closePath();
ctx.fill();
// right face
ctx.fillStyle=rightColor;
ctx.beginPath();
ctx.moveTo(x+hw,y);
ctx.lineTo(x,y+hh);
ctx.lineTo(x,y+hh+ch*0.35);
ctx.lineTo(x+hw,y+ch*0.35);
ctx.closePath();
ctx.fill();
// outlines
ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x,y-hh);ctx.lineTo(x+hw,y);ctx.lineTo(x,y+hh);ctx.lineTo(x-hw,y);ctx.closePath();ctx.stroke();
ctx.beginPath();ctx.moveTo(x-hw,y);ctx.lineTo(x-hw,y+ch*0.35);ctx.lineTo(x,y+hh+ch*0.35);ctx.lineTo(x+hw,y+ch*0.35);ctx.lineTo(x+hw,y);ctx.stroke();
ctx.beginPath();ctx.moveTo(x,y+hh);ctx.lineTo(x,y+hh+ch*0.35);ctx.stroke();
}

function cubeColor(state){
if(state===0)return{top:COLOR_START,left:'#0c3399',right:'#0a2877'};
if(state===1)return{top:twoStepLevel?COLOR_MID:'#ffff00',left:twoStepLevel?'#cc8800':'#cccc00',right:twoStepLevel?'#aa6600':'#aaaa00'};
return{top:COLOR_TARGET,left:'#cccc00',right:'#aaaa00'};}

// --- Discs (floating platforms on sides) ---
function buildDiscs(){
discs=[];
// 2 discs: one on left side, one on right side
// Left disc: accessible from row 1, col 0 moving up-left
discs.push({row:1,side:'left',used:false,animTimer:0});
// Right disc: accessible from row 1, col 1 moving up-right
discs.push({row:3,side:'right',used:false,animTimer:0});
}

function discPos(d){
var hw=cubeW*0.55;
var dy=cubeH*0.42;
if(d.side==='left'){
var p=cubePos(d.row,0);
return{x:p.x-hw*2.2,y:p.y-dy*0.5};
}else{
var p=cubePos(d.row,d.row);
return{x:p.x+hw*2.2,y:p.y-dy*0.5};
}}

// --- Player ---
function resetPlayer(){
player={row:0,col:0,hopFrom:null,hopTo:null,hopping:false,hopProgress:0,alive:true,px:0,py:0,facingDir:'down-right'};
var p=cubePos(0,0);player.px=p.x;player.py=p.y;}

function playerScreenPos(){
if(player.hopping&&player.hopFrom&&player.hopTo){
var t=player.hopProgress;
var fromP=player.hopFrom;
var toP=player.hopTo;
var x=fromP.x+(toP.x-fromP.x)*t;
var y=fromP.y+(toP.y-fromP.y)*t;
// arc
y-=Math.sin(t*Math.PI)*cubeH*0.6;
return{x:x,y:y};}
var p=cubePos(player.row,player.col);
return{x:p.x,y:p.y};}

function drawPlayer(x,y){
var r=cubeW*0.22;
// body (orange circle)
ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.arc(x,y-r*0.8,r,0,Math.PI*2);ctx.fill();
// legs
ctx.fillStyle='#ff6600';
ctx.beginPath();ctx.arc(x-r*0.5,y+r*0.1,r*0.35,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.5,y+r*0.1,r*0.35,0,Math.PI*2);ctx.fill();
// eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-r*0.35,y-r*1.1,r*0.28,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.35,y-r*1.1,r*0.28,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x-r*0.3,y-r*1.1,r*0.14,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.3,y-r*1.1,r*0.14,0,Math.PI*2);ctx.fill();
// snout (tube nose pointing forward)
ctx.fillStyle='#ff6600';
var snoutDir=0;
var fd=player?player.facingDir:'down-right';
if(fd==='down-left')snoutDir=-1;
else if(fd==='down-right')snoutDir=1;
else if(fd==='up-left')snoutDir=-1;
else snoutDir=1;
ctx.beginPath();
ctx.moveTo(x+snoutDir*r*0.1,y-r*0.7);
ctx.lineTo(x+snoutDir*r*0.8,y-r*0.5);
ctx.lineTo(x+snoutDir*r*0.1,y-r*0.3);
ctx.closePath();ctx.fill();
}

// --- Enemies ---
function spawnEnemy(){
if(enemies.length>=2)return;
var type;
var roll=Math.random();
if(roll<0.4)type='redball';
else if(roll<0.7)type='coily';
else type='ugg';

if(type==='redball'){
// Red ball drops from top
var startCol=Math.random()<0.5?0:1;
enemies.push({type:'redball',row:0,col:startCol<1?0:0,hopProgress:0,hopping:false,hopTimer:0,speed:0.6+level*0.05,
fromPos:null,toPos:null,alive:true,nextDir:startCol<1?'down-left':'down-right'});}
else if(type==='coily'){
// Coily (purple snake) starts as egg from top
var startCol=Math.random()<0.5?0:0;
enemies.push({type:'coily',row:0,col:0,hopProgress:0,hopping:false,hopTimer:0,speed:0.5+level*0.04,
fromPos:null,toPos:null,alive:true,isEgg:true,nextDir:'down-right'});}
else{
// Ugg/Wrongway: moves on the sides
var side=Math.random()<0.5?'left':'right';
var startRow=ROWS-1;
var startCol=side==='left'?0:startRow;
enemies.push({type:'ugg',row:startRow,col:startCol,hopProgress:0,hopping:false,hopTimer:0,speed:0.7+level*0.04,
fromPos:null,toPos:null,alive:true,side:side});}
}

function drawRedBall(x,y){
var r=cubeW*0.16;
ctx.fillStyle='#ff2222';
ctx.beginPath();ctx.arc(x,y-r,r,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff6666';
ctx.beginPath();ctx.arc(x-r*0.3,y-r*1.3,r*0.3,0,Math.PI*2);ctx.fill();}

function drawCoily(x,y,isEgg){
var r=cubeW*0.18;
if(isEgg){
// Purple egg
ctx.fillStyle='#8833cc';
ctx.beginPath();ctx.ellipse(x,y-r*0.5,r*0.7,r,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#aa55ee';
ctx.beginPath();ctx.arc(x,y-r*0.8,r*0.4,0,Math.PI*2);ctx.fill();
return;}
// Snake body (spring shape)
ctx.strokeStyle='#8833cc';ctx.lineWidth=cubeW*0.08;ctx.lineCap='round';
ctx.beginPath();
var segments=4;
for(var i=0;i<=segments;i++){
var t=i/segments;
var sx=x+Math.sin(t*Math.PI*3)*r*0.5;
var sy=y-t*r*2.5+r*0.5;
if(i===0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}
ctx.stroke();
// Head
ctx.fillStyle='#aa44ff';
ctx.beginPath();ctx.arc(x,y-r*2.2,r*0.6,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-r*0.25,y-r*2.4,r*0.2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.25,y-r*2.4,r*0.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x-r*0.2,y-r*2.4,r*0.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.2,y-r*2.4,r*0.1,0,Math.PI*2);ctx.fill();}

function drawUgg(x,y){
var r=cubeW*0.16;
ctx.fillStyle='#44aa44';
ctx.beginPath();ctx.arc(x,y-r,r,0,Math.PI*2);ctx.fill();
// horns
ctx.fillStyle='#338833';
ctx.beginPath();ctx.moveTo(x-r*0.5,y-r*1.5);ctx.lineTo(x-r*0.8,y-r*2.2);ctx.lineTo(x-r*0.1,y-r*1.5);ctx.fill();
ctx.beginPath();ctx.moveTo(x+r*0.5,y-r*1.5);ctx.lineTo(x+r*0.8,y-r*2.2);ctx.lineTo(x+r*0.1,y-r*1.5);ctx.fill();
// eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-r*0.3,y-r*1.1,r*0.22,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.3,y-r*1.1,r*0.22,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x-r*0.25,y-r*1.1,r*0.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+r*0.25,y-r*1.1,r*0.1,0,Math.PI*2);ctx.fill();}

function enemyScreenPos(e){
if(e.hopping&&e.fromPos&&e.toPos){
var t=e.hopProgress;
var x=e.fromPos.x+(e.toPos.x-e.fromPos.x)*t;
var y=e.fromPos.y+(e.toPos.y-e.fromPos.y)*t;
y-=Math.sin(t*Math.PI)*cubeH*0.4;
return{x:x,y:y};}
var p=cubePos(e.row,e.col);
return{x:p.x,y:p.y};}

// --- Particles ---
function addParticles(x,y,c,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.4+Math.random()*0.3,color:c,size:2+Math.random()*3});}

// --- Game logic ---
function movePlayer(dir){
if(gameState!=='playing'||!player.alive||player.hopping||deathBubbleTimer>0||levelClearTimer>0)return;
var nr=player.row,nc=player.col;
if(dir==='up-left'){nr--;nc--;}
else if(dir==='up-right'){nr--;} // row-1, same col
else if(dir==='down-left'){nr++;} // row+1, same col
else if(dir==='down-right'){nr++;nc++;}

player.facingDir=dir;

// Check disc jump
if(nr<0||(nr>=0&&nr<ROWS&&(nc<0||nc>nr))){
// Might be jumping to a disc
for(var i=0;i<discs.length;i++){
var d=discs[i];
if(d.used)continue;
// Left disc: player at row d.row, col 0, moving up-left
if(d.side==='left'&&dir==='up-left'&&player.row===d.row&&player.col===0){
d.used=true;
player.hopping=true;
player.hopProgress=0;
player.hopFrom=cubePos(player.row,player.col);
player.hopTo=discPos(d);
player.row=-1;player.col=-1;// off grid
score+=500;
addParticles(player.hopFrom.x,player.hopFrom.y,'#ffff00',10);
// After hop, transport to top
setTimeout(function(){
player.row=0;player.col=0;player.hopping=false;
// Kill any coily chasing
for(var j=enemies.length-1;j>=0;j--){
if(enemies[j].type==='coily'){
var ep=enemyScreenPos(enemies[j]);
addParticles(ep.x,ep.y,'#aa44ff',15);
enemies.splice(j,1);score+=500;}}
},600);
return;}
// Right disc: player at row d.row, col d.row, moving up-right
if(d.side==='right'&&dir==='up-right'&&player.row===d.row&&player.col===d.row){
d.used=true;
player.hopping=true;
player.hopProgress=0;
player.hopFrom=cubePos(player.row,player.col);
player.hopTo=discPos(d);
player.row=-1;player.col=-1;
score+=500;
addParticles(player.hopFrom.x,player.hopFrom.y,'#ffff00',10);
setTimeout(function(){
player.row=0;player.col=0;player.hopping=false;
for(var j=enemies.length-1;j>=0;j--){
if(enemies[j].type==='coily'){
var ep=enemyScreenPos(enemies[j]);
addParticles(ep.x,ep.y,'#aa44ff',15);
enemies.splice(j,1);score+=500;}}
},600);
return;}}
// Falling off edge - death
killPlayer();
return;}

// Out of bounds
if(nr<0||nr>=ROWS||nc<0||nc>nr){
killPlayer();return;}

// Valid hop
player.hopping=true;
player.hopProgress=0;
player.hopFrom=cubePos(player.row,player.col);
player.hopTo=cubePos(nr,nc);
player.row=nr;player.col=nc;}

function landOnCube(){
var c=getCube(player.row,player.col);
if(!c)return;
if(c.colorState<c.targetState){
c.colorState++;
score+=25;
addParticles(player.hopTo?player.hopTo.x:0,player.hopTo?player.hopTo.y:0,'#ffff00',5);}
// Check level clear
var allDone=true;
for(var i=0;i<cubes.length;i++){if(cubes[i].colorState<cubes[i].targetState){allDone=false;break;}}
if(allDone){
levelClearTimer=LEVEL_CLEAR_TIME;
score+=1000;
addParticles(originX,originY+cubeH*3,'#00ffaa',25);}}

function killPlayer(){
if(!player.alive)return;
player.alive=false;
deathBubbleTimer=DEATH_BUBBLE_TIME;
lives--;
var pp=playerScreenPos();
addParticles(pp.x,pp.y,'#ff8800',20);
if(lives<=0){gameState='gameover';}}

function respawnPlayer(){
player.alive=true;
player.hopping=false;
player.hopProgress=0;
player.row=0;player.col=0;
player.hopFrom=null;player.hopTo=null;
enemies=[];}

function nextLevel(){
level++;
twoStepLevel=level>=3;
buildCubes();
buildDiscs();
enemies=[];
enemySpawnTimer=0;
respawnPlayer();}

function resetGame(){
score=0;lives=3;level=1;gameTime=0;twoStepLevel=false;
deathBubbleTimer=0;levelClearTimer=0;
particles=[];enemies=[];inputQueue=[];
buildCubes();buildDiscs();
resetPlayer();
gameState='playing';}

// --- Enemy AI ---
function updateEnemies(dt){
enemySpawnTimer+=dt;
var spawnInterval=level<=2?Math.max(4,6-level*0.3):Math.max(1.8,5-level*0.3);
if(enemySpawnTimer>=spawnInterval&&enemies.length<(level>=3?2:1)){
spawnEnemy();enemySpawnTimer=0;}

for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
if(!e.alive){enemies.splice(i,1);continue;}

if(e.hopping){
e.hopProgress+=dt/(HOP_DURATION*1.3/e.speed);
if(e.hopProgress>=1){
e.hopProgress=0;e.hopping=false;
// Check if enemy fell off
if(e.row<0||e.row>=ROWS||e.col<0||e.col>e.row){
addParticles(e.toPos?e.toPos.x:originX,e.toPos?e.toPos.y:originY+100,'#ff4444',10);
enemies.splice(i,1);continue;}
// Coily hatches after reaching bottom row
if(e.type==='coily'&&e.isEgg&&e.row>=ROWS-1){e.isEgg=false;}
// Check collision with player
if(e.row===player.row&&e.col===player.col&&player.alive&&!player.hopping){
killPlayer();}
}continue;}

e.hopTimer+=dt;
var hopInterval=1/e.speed;
if(e.hopTimer>=hopInterval){
e.hopTimer=0;

if(e.type==='redball'){
// Bounce down randomly
var goLeft=Math.random()<0.5;
var nr=e.row+1;
var nc=goLeft?e.col:e.col+1;
e.fromPos=cubePos(e.row,e.col);
e.row=nr;e.col=nc;
if(nr<ROWS&&nc>=0&&nc<=nr)e.toPos=cubePos(nr,nc);
else e.toPos={x:e.fromPos.x+(goLeft?-cubeW*0.5:cubeW*0.5),y:e.fromPos.y+cubeH};
e.hopping=true;e.hopProgress=0;}
else if(e.type==='coily'){
if(e.isEgg){
// Bounce down randomly as egg
var goLeft=Math.random()<0.5;
var nr=e.row+1;
var nc=goLeft?e.col:e.col+1;
e.fromPos=cubePos(e.row,e.col);
e.row=nr;e.col=nc;
if(nr<ROWS&&nc>=0&&nc<=nr)e.toPos=cubePos(nr,nc);
else e.toPos={x:e.fromPos.x,y:e.fromPos.y+cubeH};
e.hopping=true;e.hopProgress=0;
}else{
// Chase player - move diagonally towards player
var dr=player.row-e.row;
var dc=player.col-e.col;
var nr=e.row,nc=e.col;
if(dr<0&&dc<=0){nr--;nc--;} // up-left
else if(dr<0){nr--;} // up-right
else if(dr>0&&dc>=0){nr++;nc++;} // down-right
else{nr++;} // down-left

e.fromPos=cubePos(e.row,e.col);
e.row=nr;e.col=nc;
if(nr>=0&&nr<ROWS&&nc>=0&&nc<=nr)e.toPos=cubePos(nr,nc);
else e.toPos={x:e.fromPos.x+(dc>0?cubeW*0.5:-cubeW*0.5),y:e.fromPos.y+(dr>0?cubeH:-cubeH)};
e.hopping=true;e.hopProgress=0;
}}
else if(e.type==='ugg'){
// Move along the side of the pyramid, going up
if(e.side==='left'){
var nr=e.row-1;var nc=e.col;
e.fromPos=cubePos(e.row,e.col);
e.row=nr;e.col=nc;
if(nr>=0&&nr<ROWS&&nc>=0&&nc<=nr)e.toPos=cubePos(nr,nc);
else e.toPos={x:e.fromPos.x-cubeW*0.3,y:e.fromPos.y-cubeH*0.5};
e.hopping=true;e.hopProgress=0;
}else{
var nr=e.row-1;var nc=e.col-1;
e.fromPos=cubePos(e.row,e.col);
e.row=nr;e.col=nc;
if(nr>=0&&nr<ROWS&&nc>=0&&nc<=nr)e.toPos=cubePos(nr,nc);
else e.toPos={x:e.fromPos.x+cubeW*0.3,y:e.fromPos.y-cubeH*0.5};
e.hopping=true;e.hopProgress=0;
}}
}
// Non-hopping collision check
if(!e.hopping&&e.row===player.row&&e.col===player.col&&player.alive&&!player.hopping){
killPlayer();}
}}

// --- Main update ---
function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

// Level clear animation
if(levelClearTimer>0){
levelClearTimer-=dt;
if(levelClearTimer<=0){nextLevel();}
return;}

// Death bubble
if(deathBubbleTimer>0){
deathBubbleTimer-=dt;
if(deathBubbleTimer<=0){
if(lives>0)respawnPlayer();
else gameState='gameover';}
// particles still update
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
return;}

// Process input
if(inputQueue.length>0&&!player.hopping&&player.alive){
var dir=inputQueue.shift();
movePlayer(dir);}

// Player hop animation
if(player.hopping){
player.hopProgress+=dt/HOP_DURATION;
if(player.hopProgress>=1){
player.hopProgress=1;
player.hopping=false;
if(player.row>=0&&player.row<ROWS&&player.col>=0&&player.col<=player.row){
landOnCube();}}}

// Enemies
updateEnemies(dt);

// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

// --- Rendering ---
function render(){
ctx.fillStyle=COLOR_BG;ctx.fillRect(0,0,W,H);

// Draw discs
for(var i=0;i<discs.length;i++){
var d=discs[i];
if(d.used)continue;
var dp=discPos(d);
var pulse=0.5+0.5*Math.sin(gameTime*4+i*2);
ctx.fillStyle='rgba(0,255,200,'+pulse*0.3+')';
ctx.beginPath();ctx.arc(dp.x,dp.y,cubeW*0.35,0,Math.PI*2);ctx.fill();
// disc platform
ctx.fillStyle='#00cc99';
ctx.beginPath();
var dw=cubeW*0.4,dh=cubeH*0.15;
ctx.ellipse(dp.x,dp.y,dw,dh,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle='#00ffcc';ctx.lineWidth=2;ctx.stroke();
// glow
ctx.shadowColor='#00ffcc';ctx.shadowBlur=10+pulse*8;
ctx.beginPath();ctx.ellipse(dp.x,dp.y,dw*0.6,dh*0.6,0,0,Math.PI*2);ctx.strokeStyle='#00ffcc';ctx.stroke();
ctx.shadowBlur=0;}

// Draw cubes (back to front, top to bottom)
for(var r=0;r<ROWS;r++){
for(var c=0;c<=r;c++){
var cube=getCube(r,c);
if(!cube)continue;
var p=cubePos(r,c);
var colors=cubeColor(cube.colorState);
var glow=cube.colorState>=cube.targetState;
drawCube(p.x,p.y,cubeW,cubeH,colors.top,colors.left,colors.right,glow);}}

// Draw enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
var ep=enemyScreenPos(e);
if(e.type==='redball')drawRedBall(ep.x,ep.y);
else if(e.type==='coily')drawCoily(ep.x,ep.y,e.isEgg);
else if(e.type==='ugg')drawUgg(ep.x,ep.y);}

// Draw player
if(player.alive||deathBubbleTimer>0){
var pp=playerScreenPos();
if(player.alive)drawPlayer(pp.x,pp.y);

// Death speech bubble
if(deathBubbleTimer>0&&!player.alive){
var bx=pp.x+cubeW*0.3,by=pp.y-cubeH*0.8;
ctx.fillStyle='#fff';
ctx.beginPath();ctx.roundRect(bx-cubeW*0.6,by-cubeH*0.3,cubeW*1.2,cubeH*0.5,5);ctx.fill();
// tail
ctx.beginPath();ctx.moveTo(bx-cubeW*0.1,by+cubeH*0.2);ctx.lineTo(bx-cubeW*0.3,by+cubeH*0.45);ctx.lineTo(bx+cubeW*0.1,by+cubeH*0.2);ctx.fill();
ctx.fillStyle='#c00';
ctx.font='bold '+Math.round(cubeW*0.22)+'px "Courier New",monospace';
ctx.textAlign='center';
ctx.fillText('@!#?@!',bx,by+cubeW*0.05);
}}

// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;

// Level clear flash
if(levelClearTimer>0){
var flash=Math.sin(levelClearTimer*8)*0.3;
ctx.fillStyle='rgba(255,255,100,'+Math.max(0,flash)+')';
ctx.fillRect(0,0,W,H);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('LEVEL CLEAR!',W/2,H*0.45);
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillText('+1000',W/2,H*0.53);}

// Lives display
for(var i=0;i<lives;i++){
ctx.fillStyle='#ff8800';
ctx.beginPath();ctx.arc(15+i*20,H-14,7,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-8);
}

function drawTitle(dt){
ctx.fillStyle=COLOR_BG;ctx.fillRect(0,0,W,H);titlePulse+=dt*3;

// Draw a small demo pyramid
var demoOX=W/2,demoOY=H*0.55;
var dcw=Math.min(W*0.06,30),dch=dcw;
for(var r=0;r<4;r++){for(var c=0;c<=r;c++){
var dx=dcw*0.55,dy=dch*0.42;
var px=demoOX+(c-r/2)*dx*2;
var py=demoOY+r*dy*2+dch*0.5;
var hue=(r*40+c*60+titlePulse*30)%360;
drawCube(px,py,dcw,dch,'hsl('+hue+',70%,55%)','hsl('+hue+',70%,40%)','hsl('+hue+',70%,30%)',false);}}

// Q*bert character on top
var topP={x:demoOX,y:demoOY+dch*0.5-dch*0.3};
drawPlayer(topP.x,topP.y);

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff8800';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff8800';ctx.fillText('Q*BERT',W/2,H*0.2);
ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('@!#?@!',W/2,H*0.27);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.86);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys: hop diagonally',W/2,H*0.92);
ctx.fillText('Change all cubes to the target color!',W/2,H*0.96);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ff8800';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('@!#?@!',W/2,H*0.35);
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.48);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level reached: '+level,W/2,H*0.58);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

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
if(!down)return;
if(gameState==='playing'){
// Arrow keys map to diagonal directions
// Up = up-left, Right = up-right, Left = down-left, Down = down-right
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')inputQueue.push('up-left');
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')inputQueue.push('up-right');
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')inputQueue.push('down-left');
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')inputQueue.push('down-right');
}
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',function(){fn();});}

window.initQbert=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
// Mobile: Up=up-left, Right=up-right, Left=down-left, Down=down-right
bindMobile('btn-up',function(){if(gameState==='playing')inputQueue.push('up-left');});
bindMobile('btn-right',function(){if(gameState==='playing')inputQueue.push('up-right');});
bindMobile('btn-left',function(){if(gameState==='playing')inputQueue.push('down-left');});
bindMobile('btn-down',function(){if(gameState==='playing')inputQueue.push('down-right');});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopQbert=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
window.removeEventListener('resize',resize);
gameState='title';};
})();
