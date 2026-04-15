// Wizard of Wor — Maze shooter with monsters and radar
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],monsters=[],particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyFire=false;
var lastShot=0,level=1,bestScore=0;
var maze=[],CELL,COLS=15,ROWS=11,mazeW,mazeH,mazeOX,mazeOY;
var PLAYER_SPEED=130,MONSTER_SPEED=50,BULLET_SPEED=280;
var MONSTER_TYPES=[
{name:'Burwor',color:'#4488ff',speed:40,points:100,hp:1},
{name:'Garwor',color:'#ffaa00',speed:55,points:200,hp:1},
{name:'Thorwor',color:'#ff4466',speed:70,points:500,hp:2},
{name:'Worluk',color:'#aa44ff',speed:90,points:1000,hp:3}
];

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
CELL=Math.min(Math.floor(W/(COLS+2)),Math.floor((H-50)/(ROWS+2)));
mazeW=COLS*CELL;mazeH=ROWS*CELL;
mazeOX=Math.floor((W-mazeW)/2);mazeOY=Math.floor((H-mazeH-30)/2)+15;
}

function generateMaze(){
maze=[];
for(var r=0;r<ROWS;r++){
maze[r]=[];
for(var c=0;c<COLS;c++){
// walls: top, right, bottom, left
maze[r][c]={t:r===0,r:c===COLS-1,b:r===ROWS-1,l:c===0};
}
}
// add internal walls with maze pattern
for(var r=0;r<ROWS;r++){
for(var c=0;c<COLS;c++){
if(Math.random()<0.35&&c<COLS-1){maze[r][c].r=true;maze[r][c+1].l=true;}
if(Math.random()<0.35&&r<ROWS-1){maze[r][c].b=true;maze[r+1][c].t=true;}
}
}
// ensure connectivity — open paths from player start area
var cx=1,cy=Math.floor(ROWS/2);
for(var i=0;i<20;i++){
var dir=Math.floor(Math.random()*4);
if(dir===0&&cy>1){maze[cy][cx].t=false;maze[cy-1][cx].b=false;cy--;}
if(dir===1&&cx<COLS-2){maze[cy][cx].r=false;maze[cy][cx+1].l=false;cx++;}
if(dir===2&&cy<ROWS-2){maze[cy][cx].b=false;maze[cy+1][cx].t=false;cy++;}
if(dir===3&&cx>1){maze[cy][cx].l=false;maze[cy][cx-1].r=false;cx--;}
}
// teleport tunnels (left-right wrap)
var tunnelRow=Math.floor(ROWS/2);
maze[tunnelRow][0].l=false;maze[tunnelRow][COLS-1].r=false;
}

function cellCenter(c,r){return{x:mazeOX+c*CELL+CELL/2,y:mazeOY+r*CELL+CELL/2};}

function canMove(x,y,dx,dy){
var gc=Math.floor((x-mazeOX)/CELL),gr=Math.floor((y-mazeOY)/CELL);
if(gc<0||gc>=COLS||gr<0||gr>=ROWS)return true;// allow tunnel
var cell=maze[gr][gc];
if(dx>0&&cell.r){var edge=mazeOX+(gc+1)*CELL;if(x+8>edge-4)return false;}
if(dx<0&&cell.l){var edge=mazeOX+gc*CELL;if(x-8<edge+4)return false;}
if(dy>0&&cell.b){var edge=mazeOY+(gr+1)*CELL;if(y+8>edge-4)return false;}
if(dy<0&&cell.t){var edge=mazeOY+gr*CELL;if(y-8<edge+4)return false;}
return true;
}

function resetGame(){
score=0;lives=3;gameTime=0;level=1;bullets=[];particles=[];
generateMaze();spawnLevel();gameState='playing';
}

function spawnLevel(){
monsters=[];bullets=[];
var pc=cellCenter(1,Math.floor(ROWS/2));
player={x:pc.x,y:pc.y,dir:0,w:14,h:14};
var numMonsters=3+level;if(numMonsters>10)numMonsters=10;
for(var i=0;i<numMonsters;i++){
var typeIdx=Math.min(i%4,MONSTER_TYPES.length-1);
if(level<3&&typeIdx>1)typeIdx=1;
var type=MONSTER_TYPES[typeIdx];
var mc,mr;
do{mc=2+Math.floor(Math.random()*(COLS-4));mr=1+Math.floor(Math.random()*(ROWS-2));}
while(Math.abs(mc-1)<3&&Math.abs(mr-Math.floor(ROWS/2))<2);
var pos=cellCenter(mc,mr);
monsters.push({x:pos.x,y:pos.y,type:type,hp:type.hp,dir:Math.floor(Math.random()*4),
moveTimer:0,visible:true,w:14,h:14,shootTimer:2+Math.random()*3});
}
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,
life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function playerDie(){
lives--;addParticles(player.x,player.y,'#00ccff',20);
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{var pc=cellCenter(1,Math.floor(ROWS/2));player.x=pc.x;player.y=pc.y;}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12);
// player movement
var dx=0,dy=0;
if(keyLeft){dx=-1;player.dir=2;}
if(keyRight){dx=1;player.dir=0;}
if(keyUp){dy=-1;player.dir=3;}
if(keyDown){dy=1;player.dir=1;}
if(dx!==0&&dy!==0){dy=0;}// one direction at a time
if(dx||dy){
var nx=player.x+dx*PLAYER_SPEED*dt;
var ny=player.y+dy*PLAYER_SPEED*dt;
if(canMove(player.x,player.y,dx,0))player.x=nx;
if(canMove(player.x,player.y,0,dy))player.y=ny;
}
// tunnel wrap
if(player.x<mazeOX-10)player.x=mazeOX+mazeW+5;
if(player.x>mazeOX+mazeW+10)player.x=mazeOX-5;
// fire
if(keyFire&&gameTime-lastShot>0.25){
lastShot=gameTime;
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var d=dirs[player.dir];
bullets.push({x:player.x,y:player.y,vx:d[0]*BULLET_SPEED,vy:d[1]*BULLET_SPEED,life:1.2,owner:'player'});
}
// monster AI
for(var i=monsters.length-1;i>=0;i--){
var m=monsters[i];
m.moveTimer-=dt;
if(m.moveTimer<=0){
m.moveTimer=0.3+Math.random()*0.5;
// try to move toward player or random
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var best=-1,bestDist=99999;
for(var d=0;d<4;d++){
if(canMove(m.x,m.y,dirs[d][0],dirs[d][1])){
var nx=m.x+dirs[d][0]*CELL/2;
var ny=m.y+dirs[d][1]*CELL/2;
var dist=Math.abs(nx-player.x)+Math.abs(ny-player.y);
if(Math.random()<0.4)dist=Math.random()*1000;// random exploration
if(dist<bestDist){bestDist=dist;best=d;}
}
}
if(best>=0)m.dir=best;
}
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var md=dirs[m.dir];
var spd=(m.type.speed+level*3)*diffMult;if(spd>120)spd=120;
if(canMove(m.x,m.y,md[0],md[1])){
m.x+=md[0]*spd*dt;m.y+=md[1]*spd*dt;
}
// tunnel
if(m.x<mazeOX-10)m.x=mazeOX+mazeW+5;
if(m.x>mazeOX+mazeW+10)m.x=mazeOX-5;
// shoot
m.shootTimer-=dt;
if(m.shootTimer<=0){
m.shootTimer=(2+Math.random()*2)/diffMult;
var angle=Math.atan2(player.y-m.y,player.x-m.x);
angle+=(Math.random()-0.5)*(0.8/diffMult);// less inaccurate at higher difficulty
bullets.push({x:m.x,y:m.y,vx:Math.cos(angle)*160*diffMult,vy:Math.sin(angle)*160*diffMult,life:1.5,owner:'monster'});
}
// hit player
if(Math.abs(m.x-player.x)<14&&Math.abs(m.y-player.y)<14){playerDie();}
}
// bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
// wall check
var gc=Math.floor((b.x-mazeOX)/CELL),gr=Math.floor((b.y-mazeOY)/CELL);
if(gc<0||gc>=COLS||gr<0||gr>=ROWS||b.life<=0){bullets.splice(i,1);continue;}
var cell=maze[gr][gc];
if((b.vx>0&&cell.r&&b.x>mazeOX+(gc+1)*CELL-3)||(b.vx<0&&cell.l&&b.x<mazeOX+gc*CELL+3)||
(b.vy>0&&cell.b&&b.y>mazeOY+(gr+1)*CELL-3)||(b.vy<0&&cell.t&&b.y<mazeOY+gr*CELL+3)){
addParticles(b.x,b.y,'#ffcc00',3);bullets.splice(i,1);continue;
}
if(b.owner==='player'){
for(var m=monsters.length-1;m>=0;m--){
if(Math.abs(b.x-monsters[m].x)<12&&Math.abs(b.y-monsters[m].y)<12){
monsters[m].hp--;
if(monsters[m].hp<=0){
score+=monsters[m].type.points;
addParticles(monsters[m].x,monsters[m].y,monsters[m].type.color,15);
monsters.splice(m,1);
}
bullets.splice(i,1);break;
}
}
}else{
if(Math.abs(b.x-player.x)<10&&Math.abs(b.y-player.y)<10){
bullets.splice(i,1);playerDie();break;
}
}
}
// level clear
if(monsters.length===0){level++;generateMaze();spawnLevel();}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#08081a';ctx.fillRect(0,0,W,H);
// draw maze
for(var r=0;r<ROWS;r++){
for(var c=0;c<COLS;c++){
var x=mazeOX+c*CELL,y=mazeOY+r*CELL;
var cell=maze[r][c];
ctx.strokeStyle='#3344aa';ctx.lineWidth=2;
if(cell.t){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+CELL,y);ctx.stroke();}
if(cell.b){ctx.beginPath();ctx.moveTo(x,y+CELL);ctx.lineTo(x+CELL,y+CELL);ctx.stroke();}
if(cell.l){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+CELL);ctx.stroke();}
if(cell.r){ctx.beginPath();ctx.moveTo(x+CELL,y);ctx.lineTo(x+CELL,y+CELL);ctx.stroke();}
}
}
// floor glow
ctx.fillStyle='rgba(20,20,60,0.3)';ctx.fillRect(mazeOX,mazeOY,mazeW,mazeH);
// monsters
for(var i=0;i<monsters.length;i++){
var m=monsters[i];
ctx.fillStyle=m.type.color;ctx.shadowColor=m.type.color;ctx.shadowBlur=6;
// body
ctx.beginPath();ctx.arc(m.x,m.y,8,0,Math.PI*2);ctx.fill();
// eyes
ctx.fillStyle='#fff';ctx.fillRect(m.x-5,m.y-4,4,3);ctx.fillRect(m.x+1,m.y-4,4,3);
ctx.fillStyle='#000';ctx.fillRect(m.x-4,m.y-3,2,2);ctx.fillRect(m.x+2,m.y-3,2,2);
// legs (wavy)
ctx.fillStyle=m.type.color;
for(var l=-2;l<=2;l++){
ctx.fillRect(m.x+l*4-1,m.y+6+Math.sin(gameTime*8+l)*2,3,4);
}
ctx.shadowBlur=0;
}
// player
ctx.fillStyle='#00ccff';ctx.shadowColor='#00ccff';ctx.shadowBlur=8;
ctx.save();ctx.translate(player.x,player.y);
ctx.fillRect(-7,-7,14,14);
// direction indicator
var dirs=[[8,0],[0,8],[-8,0],[0,-8]];
ctx.fillStyle='#ffffff';
ctx.beginPath();ctx.arc(dirs[player.dir][0],dirs[player.dir][1],3,0,Math.PI*2);ctx.fill();
ctx.restore();ctx.shadowBlur=0;
// bullets
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.fillStyle=b.owner==='player'?'#ffcc00':'#ff4444';
ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// radar (bottom)
var radarH=20,radarY=H-radarH-5;
ctx.fillStyle='rgba(0,0,30,0.8)';ctx.fillRect(mazeOX,radarY,mazeW,radarH);
ctx.strokeStyle='#334';ctx.strokeRect(mazeOX,radarY,mazeW,radarH);
// dots on radar
for(var i=0;i<monsters.length;i++){
var m=monsters[i];
var rx=mazeOX+(m.x-mazeOX)/mazeW*mazeW;
var ry=radarY+(m.y-mazeOY)/mazeH*radarH;
ctx.fillStyle=m.type.color;ctx.fillRect(rx-2,ry-2,4,4);
}
// player on radar
var prx=mazeOX+(player.x-mazeOX)/mazeW*mazeW;
var pry=radarY+(player.y-mazeOY)/mazeH*radarH;
ctx.fillStyle='#00ccff';ctx.fillRect(prx-2,pry-2,4,4);
// lives
for(var i=0;i<lives;i++){ctx.fillStyle='#00ccff';ctx.fillRect(10+i*16,10,10,10);}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-10,20);
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#08081a';ctx.fillRect(0,0,W,H);
// dungeon decoration
ctx.strokeStyle='rgba(50,60,170,0.15)';ctx.lineWidth=2;
for(var i=0;i<12;i++){for(var j=0;j<8;j++){ctx.strokeRect(i*W/12+5,j*H/8+5,W/12-10,H/8-10);}}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#aa44ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#aa44ff';
ctx.fillText('WIZARD OF WOR',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#4488ff';
ctx.fillText('DUNGEON MAZE SHOOTER',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Space to shoot',W/2,H*0.65);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.73);}
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
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
if(e.key===' ')keyFire=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initWizardOfWor=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;keyFire=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopWizardOfWor=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyFire=false;
};
})();
