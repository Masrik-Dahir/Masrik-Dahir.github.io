// Pengo — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],grid=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyPush=false;
var TILE=0,COLS=13,ROWS=11,GRID_OFFSET_X=0,GRID_OFFSET_Y=0;
var PLAYER_SPEED=3,ENEMY_SPEED=1.5,pushCooldown=0;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
TILE=Math.min(Math.floor(W/(COLS+2)),Math.floor(H/(ROWS+2)));
GRID_OFFSET_X=(W-COLS*TILE)/2;GRID_OFFSET_Y=(H-ROWS*TILE)/2;
}

function buildLevel(){
grid=[];
for(var r=0;r<ROWS;r++){grid[r]=[];
for(var c=0;c<COLS;c++){
grid[r][c]=Math.random()>0.35?1:0;}} // 1=ice block, 0=empty
// Clear player start area
grid[ROWS-1][Math.floor(COLS/2)]=0;
grid[ROWS-2][Math.floor(COLS/2)]=0;
// Place diamond blocks (special)
for(var i=0;i<3;i++){
var dr=Math.floor(Math.random()*ROWS);var dc=Math.floor(Math.random()*COLS);
grid[dr][dc]=2;}// 2=diamond block
// Spawn enemies (Sno-Bees)
enemies=[];
var count=level<=2?2+level:3+Math.floor(level*1.2);if(count>7)count=7;
for(var i=0;i<count;i++){
var er,ec;do{er=Math.floor(Math.random()*(ROWS-2));ec=Math.floor(Math.random()*COLS);}while(grid[er][ec]!==0);
enemies.push({gx:ec,gy:er,x:ec,y:er,dir:Math.floor(Math.random()*4),alive:true,
moveTimer:0.5+Math.random()*0.5,stunned:0,frame:0});}
}

function resetGame(){
player={gx:Math.floor(COLS/2),gy:ROWS-1,x:Math.floor(COLS/2),y:ROWS-1,dir:0,moving:false,pushAnim:0};
score=0;lives=3;level=1;gameTime=0;particles=[];pushCooldown=0;
buildLevel();gameState='playing';}

function addParticles(x,y,color,n){
var px=GRID_OFFSET_X+x*TILE+TILE/2,py=GRID_OFFSET_Y+y*TILE+TILE/2;
for(var i=0;i<n;i++)particles.push({x:px,y:py,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*4});}

function pushBlock(gx,gy,dx,dy){
if(gx<0||gx>=COLS||gy<0||gy>=ROWS)return;
if(grid[gy][gx]===0)return;
// Slide the block
var cx=gx,cy=gy;
while(true){
var nx=cx+dx,ny=cy+dy;
if(nx<0||nx>=COLS||ny<0||ny>=ROWS){// Hit wall
grid[cy][cx]=0;addParticles(cx,cy,'#aaddff',8);score+=10;break;}
if(grid[ny][nx]!==0){// Hit another block
grid[cy][cx]=0;addParticles(cx,cy,'#aaddff',8);score+=10;break;}
// Check if crushing enemy
var crushed=false;
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(e.alive&&Math.round(e.x)===nx&&Math.round(e.y)===ny){
e.alive=false;score+=400;addParticles(e.x,e.y,'#ff4444',12);crushed=true;}}
if(crushed){grid[cy][cx]=0;addParticles(cx,cy,'#aaddff',5);break;}
// Move block from original to new position
var blockType=grid[gy][gx];
grid[gy][gx]=0;
cx=nx;cy=ny;
grid[cy][cx]=blockType||1;
}
}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(pushCooldown>0)pushCooldown-=dt;
// Player movement (grid-based, smooth)
var dx=0,dy=0;
if(keyLeft){dx=-1;player.dir=2;}
if(keyRight){dx=1;player.dir=0;}
if(keyUp){dy=-1;player.dir=3;}
if(keyDown){dy=1;player.dir=1;}
// Move player smoothly toward target
var speed=PLAYER_SPEED*dt;
if(dx!==0||dy!==0){
var tx=player.gx+dx,ty=player.gy+dy;
if(tx>=0&&tx<COLS&&ty>=0&&ty<ROWS&&grid[ty][tx]===0){
player.gx=tx;player.gy=ty;}}
player.x+=(player.gx-player.x)*Math.min(1,10*dt);
player.y+=(player.gy-player.y)*Math.min(1,10*dt);
// Push block
if(keyPush&&pushCooldown<=0){
pushCooldown=0.3;player.pushAnim=0.2;
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var d=dirs[player.dir];
var bx=player.gx+d[0],by=player.gy+d[1];
if(bx>=0&&bx<COLS&&by>=0&&by<ROWS&&grid[by][bx]>0){
pushBlock(bx,by,d[0],d[1]);}}
if(player.pushAnim>0)player.pushAnim-=dt;
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
e.frame+=dt*4;
if(e.stunned>0){e.stunned-=dt;continue;}
e.moveTimer-=dt;
if(e.moveTimer<=0){
e.moveTimer=(0.4+Math.random()*0.3)/diffMult();
// AI: difficulty-scaled tracking chance
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var bestDir=0,bestDist=99999;
for(var d=0;d<4;d++){
var nx=Math.round(e.x)+dirs[d][0],ny=Math.round(e.y)+dirs[d][1];
if(nx<0||nx>=COLS||ny<0||ny>=ROWS||grid[ny][nx]!==0)continue;
var dist=Math.abs(nx-player.gx)+Math.abs(ny-player.gy);
if(dist<bestDist||(dist===bestDist&&Math.random()>0.5)){bestDist=dist;bestDir=d;}}
var trackChance=level<=2?0.3:(level<=5?0.4:0.55);
if(Math.random()>trackChance){bestDir=Math.floor(Math.random()*4);}// Random sometimes
var nd=dirs[bestDir];
var nx=Math.round(e.x)+nd[0],ny=Math.round(e.y)+nd[1];
if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&grid[ny][nx]===0){
e.gx=nx;e.gy=ny;e.dir=bestDir;}}
e.x+=(e.gx-e.x)*Math.min(1,6*dt);
e.y+=(e.gy-e.y)*Math.min(1,6*dt);
// Collision with player
if(Math.abs(e.x-player.x)<0.6&&Math.abs(e.y-player.y)<0.6){
lives--;addParticles(player.x,player.y,'#00ccff',12);
player.gx=Math.floor(COLS/2);player.gy=ROWS-1;player.x=player.gx;player.y=player.gy;
if(lives<=0)gameState='gameover';}}
// Check level clear
var aliveCount=0;for(var i=0;i<enemies.length;i++)if(enemies[i].alive)aliveCount++;
if(aliveCount===0){level++;score+=1000;buildLevel();
player.gx=Math.floor(COLS/2);player.gy=ROWS-1;player.x=player.gx;player.y=player.gy;}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// Rich dark blue background with gradient
var bgG=ctx.createLinearGradient(0,0,0,H);
bgG.addColorStop(0,'#0a0a32');bgG.addColorStop(0.5,'#0a0a2a');bgG.addColorStop(1,'#060620');
ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
// Grid border with glow
ctx.save();ctx.shadowColor='#4466cc';ctx.shadowBlur=8;
ctx.strokeStyle='#5577bb';ctx.lineWidth=3;
ctx.strokeRect(GRID_OFFSET_X-2,GRID_OFFSET_Y-2,COLS*TILE+4,ROWS*TILE+4);
ctx.restore();
// Grid cells
for(var r=0;r<ROWS;r++){for(var c=0;c<COLS;c++){
var x=GRID_OFFSET_X+c*TILE,y=GRID_OFFSET_Y+r*TILE;
if(grid[r][c]===1){
// Ice block with 3D gradient and crack details
ctx.save();
var ig=ctx.createLinearGradient(x,y,x+TILE,y+TILE);ig.addColorStop(0,'#7ab8e0');ig.addColorStop(0.4,'#5599cc');ig.addColorStop(1,'#3d6e99');
ctx.fillStyle=ig;ctx.fillRect(x+1,y+1,TILE-2,TILE-2);
// Top/left highlight
ctx.fillStyle='rgba(180,220,255,0.35)';ctx.fillRect(x+1,y+1,TILE-2,2);ctx.fillRect(x+1,y+1,2,TILE-2);
// Bottom/right shadow
ctx.fillStyle='rgba(0,20,60,0.25)';ctx.fillRect(x+1,y+TILE-3,TILE-2,2);ctx.fillRect(x+TILE-3,y+1,2,TILE-2);
// Inner bevel
ctx.strokeStyle='rgba(150,200,240,0.3)';ctx.lineWidth=1;ctx.strokeRect(x+3,y+3,TILE-6,TILE-6);
// Shine spot
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.ellipse(x+TILE*0.3,y+TILE*0.25,TILE*0.18,TILE*0.1,0,0,Math.PI*2);ctx.fill();
// Crack pattern (varies by position)
ctx.strokeStyle='rgba(200,230,255,0.25)';ctx.lineWidth=0.7;
var seed=(r*COLS+c)*7;
ctx.beginPath();ctx.moveTo(x+TILE*0.3,y+TILE*0.5);ctx.lineTo(x+TILE*0.5,y+TILE*0.45+(seed%3)*2);ctx.lineTo(x+TILE*0.7,y+TILE*0.55);ctx.stroke();
ctx.restore();
}else if(grid[r][c]===2){
// Diamond block with sparkle
ctx.save();
var dg=ctx.createLinearGradient(x,y,x+TILE,y+TILE);dg.addColorStop(0,'#ffe866');dg.addColorStop(0.5,'#ffcc44');dg.addColorStop(1,'#cc8800');
ctx.fillStyle=dg;ctx.fillRect(x+1,y+1,TILE-2,TILE-2);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;ctx.strokeStyle='#ffee88';ctx.lineWidth=1.5;ctx.strokeRect(x+2,y+2,TILE-4,TILE-4);
// Diamond facet pattern
ctx.strokeStyle='rgba(255,255,200,0.4)';ctx.lineWidth=0.5;
ctx.beginPath();ctx.moveTo(x+TILE/2,y+2);ctx.lineTo(x+TILE-2,y+TILE/2);ctx.lineTo(x+TILE/2,y+TILE-2);ctx.lineTo(x+2,y+TILE/2);ctx.closePath();ctx.stroke();
// Sparkle
var sp=Math.sin(gameTime*6+r*3+c*5)*0.5+0.5;
ctx.fillStyle='rgba(255,255,255,'+sp*0.6+')';ctx.beginPath();ctx.arc(x+TILE*0.3,y+TILE*0.3,2,0,Math.PI*2);ctx.fill();
ctx.restore();
}else{
// Empty floor tile with subtle pattern
var fg=ctx.createLinearGradient(x,y,x,y+TILE);fg.addColorStop(0,'#0e0e30');fg.addColorStop(1,'#121240');
ctx.fillStyle=fg;ctx.fillRect(x,y,TILE,TILE);
ctx.strokeStyle='rgba(40,40,80,0.3)';ctx.lineWidth=0.5;ctx.strokeRect(x,y,TILE,TILE);}}}
// Enemies (Sno-Bees) with detailed sprites
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
var ex=GRID_OFFSET_X+e.x*TILE+TILE/2,ey=GRID_OFFSET_Y+e.y*TILE+TILE/2;
var r2=TILE*0.35;
ctx.save();
// Shadow under enemy
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(ex,ey+r2*0.8,r2*0.7,r2*0.2,0,0,Math.PI*2);ctx.fill();
// Body with radial gradient
var wobble=Math.sin(e.frame*3)*1.5;
var bodyG=ctx.createRadialGradient(ex-2,ey-2,r2*0.1,ex,ey,r2);
if(e.stunned>0){bodyG.addColorStop(0,'#ffcccc');bodyG.addColorStop(1,'#ff8888');}
else{bodyG.addColorStop(0,'#ff8866');bodyG.addColorStop(1,'#cc3333');}
ctx.shadowColor=e.stunned>0?'#ff6666':'#ff4444';ctx.shadowBlur=8;
ctx.fillStyle=bodyG;ctx.beginPath();ctx.arc(ex,ey+wobble*0.3,r2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Body stripe
ctx.fillStyle='rgba(255,200,150,0.2)';ctx.beginPath();ctx.ellipse(ex,ey+2+wobble*0.3,r2*0.6,r2*0.3,0,0,Math.PI*2);ctx.fill();
// Specular highlight
ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.ellipse(ex-r2*0.2,ey-r2*0.3,r2*0.35,r2*0.2,-0.3,0,Math.PI*2);ctx.fill();
// Eyes (white)
var eyeX1=ex-TILE*0.09,eyeX2=ex+TILE*0.09,eyeY=ey-TILE*0.08;
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(eyeX1,eyeY,3.5,4,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(eyeX2,eyeY,3.5,4,0,0,Math.PI*2);ctx.fill();
// Iris
var lookDx=player.x-e.x,lookDy=player.y-e.y;var ld=Math.sqrt(lookDx*lookDx+lookDy*lookDy)||1;
ctx.fillStyle=e.stunned>0?'#cc0000':'#220000';
ctx.beginPath();ctx.arc(eyeX1+lookDx/ld*1.5,eyeY+lookDy/ld*1,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(eyeX2+lookDx/ld*1.5,eyeY+lookDy/ld*1,2,0,Math.PI*2);ctx.fill();
// Eye shine
ctx.fillStyle='rgba(255,255,255,0.7)';
ctx.beginPath();ctx.arc(eyeX1-1,eyeY-1.5,1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(eyeX2-1,eyeY-1.5,1,0,Math.PI*2);ctx.fill();
// Mouth (angry)
ctx.strokeStyle=e.stunned>0?'#880000':'#440000';ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(ex,ey+TILE*0.12,TILE*0.08,0.1,Math.PI-0.1);ctx.stroke();
// Antennae with balls
ctx.strokeStyle=e.stunned>0?'#ffaaaa':'#ff8888';ctx.lineWidth=1.2;
var antY=-TILE*0.35;
ctx.beginPath();ctx.moveTo(ex-4,ey+antY);ctx.quadraticCurveTo(ex-8,ey+antY-TILE*0.12,ex-6,ey+antY-TILE*0.18+wobble);ctx.stroke();
ctx.beginPath();ctx.moveTo(ex+4,ey+antY);ctx.quadraticCurveTo(ex+8,ey+antY-TILE*0.12,ex+6,ey+antY-TILE*0.18-wobble);ctx.stroke();
ctx.fillStyle=e.stunned>0?'#ffcccc':'#ffaa88';
ctx.beginPath();ctx.arc(ex-6,ey+antY-TILE*0.18+wobble,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+6,ey+antY-TILE*0.18-wobble,2,0,Math.PI*2);ctx.fill();
// Little feet
var footOff=Math.sin(e.frame*5)*2;
ctx.fillStyle=e.stunned>0?'#ffaaaa':'#cc4444';
ctx.beginPath();ctx.ellipse(ex-TILE*0.1,ey+r2-1+footOff,3,2,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(ex+TILE*0.1,ey+r2-1-footOff,3,2,0,0,Math.PI*2);ctx.fill();
ctx.restore();}
// Player (Pengo - detailed penguin)
var px=GRID_OFFSET_X+player.x*TILE+TILE/2,py=GRID_OFFSET_Y+player.y*TILE+TILE/2;
ctx.save();
var pr=TILE*0.38;
// Shadow under penguin
ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(px,py+pr*0.85,pr*0.6,pr*0.15,0,0,Math.PI*2);ctx.fill();
// Body with gradient
var bodyG=ctx.createRadialGradient(px-3,py-3,pr*0.1,px,py,pr);
bodyG.addColorStop(0,'#3366dd');bodyG.addColorStop(0.6,'#2244cc');bodyG.addColorStop(1,'#1a2a88');
ctx.shadowColor='#4466ff';ctx.shadowBlur=8;
ctx.fillStyle=bodyG;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Specular highlight on body
ctx.fillStyle='rgba(100,150,255,0.2)';ctx.beginPath();ctx.ellipse(px-pr*0.2,py-pr*0.35,pr*0.4,pr*0.2,-0.3,0,Math.PI*2);ctx.fill();
// Belly with gradient
var bellyG=ctx.createRadialGradient(px,py+1,pr*0.05,px,py+2,pr*0.6);
bellyG.addColorStop(0,'#ffffff');bellyG.addColorStop(1,'#ddeeff');
ctx.fillStyle=bellyG;ctx.beginPath();ctx.ellipse(px,py+2,pr*0.52,pr*0.6,0,0,Math.PI*2);ctx.fill();
// Flippers (animated slightly)
var flapAng=Math.sin(gameTime*4)*0.15;
ctx.fillStyle='#1a2a88';
ctx.save();ctx.translate(px-pr*0.85,py);ctx.rotate(-0.4+flapAng);
ctx.beginPath();ctx.ellipse(0,0,pr*0.15,pr*0.45,0,0,Math.PI*2);ctx.fill();
ctx.restore();
ctx.save();ctx.translate(px+pr*0.85,py);ctx.rotate(0.4-flapAng);
ctx.beginPath();ctx.ellipse(0,0,pr*0.15,pr*0.45,0,0,Math.PI*2);ctx.fill();
ctx.restore();
// Eyes (white sclera)
var blink=Math.sin(gameTime*2)>0.97?0.15:1;
ctx.fillStyle='#fff';
ctx.beginPath();ctx.ellipse(px-TILE*0.08,py-TILE*0.1,3.5,4*blink,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(px+TILE*0.08,py-TILE*0.1,3.5,4*blink,0,0,Math.PI*2);ctx.fill();
// Pupils (look in facing direction)
var dirLook=[[1,0],[0,1],[-1,0],[0,-1]][player.dir];
if(blink>0.5){
ctx.fillStyle='#111';
ctx.beginPath();ctx.arc(px-TILE*0.08+dirLook[0]*1.5,py-TILE*0.1+dirLook[1]*1,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(px+TILE*0.08+dirLook[0]*1.5,py-TILE*0.1+dirLook[1]*1,2,0,Math.PI*2);ctx.fill();
// Eye shine
ctx.fillStyle='rgba(255,255,255,0.8)';
ctx.beginPath();ctx.arc(px-TILE*0.09,py-TILE*0.12,1.2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(px+TILE*0.07,py-TILE*0.12,1.2,0,Math.PI*2);ctx.fill();}
// Beak with gradient
var beakG=ctx.createLinearGradient(px,py-2,px,py+3);
beakG.addColorStop(0,'#ffaa22');beakG.addColorStop(1,'#dd7700');
ctx.fillStyle=beakG;
ctx.beginPath();ctx.moveTo(px,py-1);ctx.lineTo(px-4,py+3);ctx.lineTo(px+4,py+3);ctx.closePath();ctx.fill();
// Beak highlight
ctx.fillStyle='rgba(255,255,255,0.2)';
ctx.beginPath();ctx.moveTo(px,py-1);ctx.lineTo(px-1,py+1);ctx.lineTo(px+2,py+1);ctx.closePath();ctx.fill();
// Feet
ctx.fillStyle='#dd7700';
ctx.beginPath();ctx.ellipse(px-TILE*0.08,py+pr-1,3,1.5,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(px+TILE*0.08,py+pr-1,3,1.5,0,0,Math.PI*2);ctx.fill();
// Rosy cheeks
ctx.fillStyle='rgba(255,150,150,0.2)';
ctx.beginPath();ctx.arc(px-TILE*0.14,py,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(px+TILE*0.14,py,3,0,Math.PI*2);ctx.fill();
ctx.restore();
// Push animation with ice particle burst
if(player.pushAnim>0){
var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
var d=dirs[player.dir];
ctx.save();ctx.shadowColor='#88ccff';ctx.shadowBlur=6;
ctx.strokeStyle='#aaddff';ctx.lineWidth=3;ctx.lineCap='round';
ctx.beginPath();ctx.moveTo(px+d[0]*TILE*0.3,py+d[1]*TILE*0.3);
ctx.lineTo(px+d[0]*TILE*0.6,py+d[1]*TILE*0.6);ctx.stroke();
// Small push sparkles
for(var sp=0;sp<3;sp++){
var sa=Math.random()*Math.PI*2,sr=TILE*0.3+Math.random()*TILE*0.2;
ctx.fillStyle='rgba(170,220,255,0.5)';
ctx.beginPath();ctx.arc(px+d[0]*TILE*0.5+Math.cos(sa)*sr*0.3,py+d[1]*TILE*0.5+Math.sin(sa)*sr*0.3,1.5,0,Math.PI*2);ctx.fill();}
ctx.restore();}
// Particles with glow trails
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=Math.min(1,p.life*2.5);
ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=4;ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*0.6,0,Math.PI*2);ctx.fill();
// Trail
ctx.globalAlpha*=0.3;ctx.beginPath();ctx.arc(p.x-p.vx*0.01,p.y-p.vy*0.01,p.size*0.4,0,Math.PI*2);ctx.fill();
ctx.restore();}ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){ctx.fillStyle='#2244cc';ctx.beginPath();ctx.arc(20+i*22,H-18,8,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,25);
}

function drawTitle(dt){
ctx.fillStyle='#0a0a2a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Ice blocks in background
for(var i=0;i<12;i++){
var bx=(titlePulse*15+i*90)%(W+50)-25;
var by=H*0.3+Math.sin(i*1.5)*H*0.15;
ctx.fillStyle='#4477aa';ctx.fillRect(bx,by,30,30);
ctx.strokeStyle='#88bbee';ctx.strokeRect(bx+2,by+2,26,26);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#4488ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';ctx.fillStyle='#4488ff';ctx.fillText('PENGO',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#88bbff';ctx.fillText('PUSH ICE, CRUSH ENEMIES',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Space to push blocks',W/2,H*0.65);
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
if(e.key===' ')keyPush=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initPengo=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopPengo=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyPush=false;};
})();
