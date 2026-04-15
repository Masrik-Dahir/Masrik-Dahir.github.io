// Tower Defense — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=15,wave=1,gameTime=0,titlePulse=0;
var money=200,towerType=0;
var GRID_COLS=20,GRID_ROWS=12,cellW=0,cellH=0,ox=0,oy=0;
var grid=[],path=[],towers=[],enemies=[],bullets=[],particles=[];
var waveTimer=0,waveDelay=3,enemiesSpawned=0,enemiesPerWave=8,spawnTimer=0;
var waveActive=false;
var selectedCell=null;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var cursorX=10,cursorY=6;

var TOWER_TYPES=[
{name:'ARROW',color:'#44cc44',cost:50,range:120,damage:15,rate:1.0,bullet:'#aaff44'},
{name:'CANNON',color:'#cc8844',cost:100,range:90,damage:40,rate:2.0,bullet:'#ff8844'},
{name:'ICE',color:'#44ccff',cost:75,range:100,damage:10,rate:1.5,bullet:'#88eeff',slow:0.5},
{name:'LASER',color:'#ff44ff',cost:150,range:150,damage:25,rate:0.8,bullet:'#ff88ff'}
];

// Difficulty progression: wave 1-2 easy, 3-5 medium, 6+ hard
function getDiffMult(){
    return wave<=2?0.7:(wave<=5?1.0:1.0+(wave-5)*0.15);
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
cellW=Math.floor(W/GRID_COLS);cellH=Math.floor(H/GRID_ROWS);
ox=(W-cellW*GRID_COLS)/2;oy=(H-cellH*GRID_ROWS)/2;
}

function buildPath(){
path=[];
var py=Math.floor(GRID_ROWS/2);
var px=0;
path.push({x:px,y:py});
var dirs=[[1,0],[1,0],[0,-1],[1,0],[1,0],[0,1],[0,1],[1,0],[1,0],[0,-1],[0,-1],[1,0],
[1,0],[0,1],[1,0],[1,0],[0,1],[0,1],[1,0],[1,0],[0,-1],[1,0],[1,0]];
for(var i=0;i<dirs.length;i++){
px+=dirs[i][0];py+=dirs[i][1];
if(px>=GRID_COLS)break;
if(py<0)py=0;if(py>=GRID_ROWS)py=GRID_ROWS-1;
path.push({x:px,y:py});
}
while(px<GRID_COLS-1){px++;path.push({x:px,y:py});}
grid=[];
for(var i=0;i<GRID_COLS*GRID_ROWS;i++)grid[i]=0;
for(var i=0;i<path.length;i++)grid[path[i].y*GRID_COLS+path[i].x]=1;
}

function resetGame(){
score=0;lives=15;wave=1;money=200;gameTime=0;
towers=[];enemies=[];bullets=[];particles=[];
waveTimer=0;enemiesSpawned=0;spawnTimer=0;waveActive=false;
enemiesPerWave=8;towerType=0;cursorX=10;cursorY=6;
buildPath();
gameState='playing';
}

function spawnEnemy(){
var dm=getDiffMult();
var hp=Math.round((40+wave*15)*dm);
var speed=(30+wave*2+Math.random()*10)*dm;
speed=Math.min(speed,90);
var type=Math.floor(Math.random()*3);
var colors=['#ff4444','#44ff44','#ffaa00'];
var sz=[0.7,0.5,0.9];
enemies.push({
pathIdx:0,progress:0,hp:hp,maxHp:hp,speed:speed,
color:colors[type],size:sz[type],slowTimer:0,slowAmount:1,
reward:10+wave*2,type:type
});
}

function startWave(){
waveActive=true;enemiesSpawned=0;spawnTimer=0;
enemiesPerWave=Math.round((8+wave*2)*getDiffMult());
}

function placeTower(){
if(gameState!=='playing')return;
var idx=cursorY*GRID_COLS+cursorX;
if(grid[idx]!==0)return;
var tt=TOWER_TYPES[towerType];
if(money<tt.cost)return;
money-=tt.cost;
grid[idx]=2;
towers.push({
x:cursorX,y:cursorY,type:towerType,level:1,
timer:0,target:null,angle:0
});
score+=10;
addParticles(ox+cursorX*cellW+cellW/2,oy+cursorY*cellH+cellH/2,tt.color,10);
}

function findTarget(tower){
var tt=TOWER_TYPES[tower.type];
var tx=ox+tower.x*cellW+cellW/2;
var ty=oy+tower.y*cellH+cellH/2;
var best=null,bestDist=tt.range*((cellW+cellH)/2/30);
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
var ex=getEnemyX(e),ey=getEnemyY(e);
var dx=ex-tx,dy=ey-ty,d=Math.sqrt(dx*dx+dy*dy);
if(d<bestDist){bestDist=d;best=e;}
}
return best;
}

function getEnemyX(e){
if(e.pathIdx>=path.length-1)return ox+path[path.length-1].x*cellW+cellW/2;
var p0=path[e.pathIdx],p1=path[Math.min(e.pathIdx+1,path.length-1)];
return ox+(p0.x+(p1.x-p0.x)*e.progress)*cellW+cellW/2;
}
function getEnemyY(e){
if(e.pathIdx>=path.length-1)return oy+path[path.length-1].y*cellH+cellH/2;
var p0=path[e.pathIdx],p1=path[Math.min(e.pathIdx+1,path.length-1)];
return oy+(p0.y+(p1.y-p0.y)*e.progress)*cellH+cellH/2;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*3});
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

if(keyLeft){cursorX=Math.max(0,cursorX-1);keyLeft=false;}
if(keyRight){cursorX=Math.min(GRID_COLS-1,cursorX+1);keyRight=false;}
if(keyUp){cursorY=Math.max(0,cursorY-1);keyUp=false;}
if(keyDown){cursorY=Math.min(GRID_ROWS-1,cursorY+1);keyDown=false;}
if(keySpace){placeTower();keySpace=false;}

if(!waveActive){
waveTimer+=dt;
if(waveTimer>=waveDelay){waveTimer=0;startWave();}
}else{
spawnTimer+=dt;
var spawnRate=Math.max(0.3,1.2-wave*0.05);
if(spawnTimer>=spawnRate&&enemiesSpawned<enemiesPerWave){
spawnTimer=0;enemiesSpawned++;spawnEnemy();
}
if(enemiesSpawned>=enemiesPerWave&&enemies.length===0){
waveActive=false;wave++;waveTimer=0;waveDelay=3;
money+=50+wave*10;
score+=100*wave;
}
}

for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
var spd=e.speed*(e.slowTimer>0?e.slowAmount:1);
e.progress+=spd*dt/(cellW>0?cellW:30);
if(e.slowTimer>0)e.slowTimer-=dt;
if(e.progress>=1){
e.progress=0;e.pathIdx++;
if(e.pathIdx>=path.length-1){
enemies.splice(i,1);lives--;
if(lives<=0){gameState='gameover';}
continue;
}
}
}

for(var i=0;i<towers.length;i++){
var tw=towers[i];
var tt=TOWER_TYPES[tw.type];
tw.timer+=dt;
if(tw.timer>=tt.rate){
var tgt=findTarget(tw);
if(tgt){
tw.timer=0;tw.target=tgt;
var tx2=ox+tw.x*cellW+cellW/2;
var ty2=oy+tw.y*cellH+cellH/2;
var ex=getEnemyX(tgt),ey=getEnemyY(tgt);
tw.angle=Math.atan2(ey-ty2,ex-tx2);
bullets.push({x:tx2,y:ty2,tx:ex,ty:ey,speed:300,
damage:tt.damage*tw.level,color:tt.bullet,
slow:tt.slow||0,size:3+tw.level});
}
}
}

for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
var dx2=b.tx-b.x,dy2=b.ty-b.y;
var d=Math.sqrt(dx2*dx2+dy2*dy2);
if(d<8){
var hitEnemy=null,hitDist=30;
for(var j=0;j<enemies.length;j++){
var ex2=getEnemyX(enemies[j]),ey2=getEnemyY(enemies[j]);
var dd=Math.sqrt((ex2-b.x)*(ex2-b.x)+(ey2-b.y)*(ey2-b.y));
if(dd<hitDist){hitDist=dd;hitEnemy=enemies[j];}
}
if(hitEnemy){
hitEnemy.hp-=b.damage;
if(b.slow>0){hitEnemy.slowTimer=2;hitEnemy.slowAmount=b.slow;}
addParticles(b.x,b.y,b.color,5);
if(hitEnemy.hp<=0){
score+=hitEnemy.reward;money+=hitEnemy.reward;
addParticles(getEnemyX(hitEnemy),getEnemyY(hitEnemy),'#ff8800',12);
var idx2=enemies.indexOf(hitEnemy);
if(idx2>=0)enemies.splice(idx2,1);
}
}
bullets.splice(i,1);continue;
}
var s=b.speed*dt;
b.x+=dx2/d*s;b.y+=dy2/d*s;
}

for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function render(){
// Background with richer gradient
ctx.save();
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#1a2a1a');bg.addColorStop(0.5,'#0d1a0d');bg.addColorStop(1,'#0a150a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Grid with terrain
for(var r=0;r<GRID_ROWS;r++){
for(var c=0;c<GRID_COLS;c++){
var gx=ox+c*cellW,gy=oy+r*cellH;
var idx=r*GRID_COLS+c;
if(grid[idx]===1){
// Path with sandy gradient
var pathGrad=ctx.createLinearGradient(gx,gy,gx,gy+cellH);
pathGrad.addColorStop(0,(r+c)%2===0?'#6a5a3a':'#5a4a2a');
pathGrad.addColorStop(1,(r+c)%2===0?'#5a4a2a':'#4a3a1a');
ctx.fillStyle=pathGrad;
ctx.fillRect(gx,gy,cellW,cellH);
// path edge darkening
ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(gx,gy,1,cellH);ctx.fillRect(gx+cellW-1,gy,1,cellH);
}else{
// Grass with subtle variation
var grassGrad=ctx.createLinearGradient(gx,gy,gx,gy+cellH);
var g1=(r+c)%2===0?'#2a4a2a':'#1e3e1e';
var g2=(r+c)%2===0?'#224222':'#1a361a';
grassGrad.addColorStop(0,g1);grassGrad.addColorStop(1,g2);
ctx.fillStyle=grassGrad;
ctx.fillRect(gx,gy,cellW,cellH);
// occasional grass tuft
if((r*7+c*13)%11===0){
ctx.strokeStyle='rgba(50,120,50,0.3)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(gx+cellW/2,gy+cellH);ctx.lineTo(gx+cellW/2-2,gy+cellH-5);ctx.stroke();
ctx.beginPath();ctx.moveTo(gx+cellW/2+3,gy+cellH);ctx.lineTo(gx+cellW/2+4,gy+cellH-4);ctx.stroke();
}
}
}
}

// Path direction dots with glow
ctx.save();
ctx.shadowColor='rgba(200,180,100,0.3)';ctx.shadowBlur=3;
ctx.fillStyle='rgba(200,180,100,0.2)';
for(var i=0;i<path.length-1;i++){
var p0=path[i];
var px3=ox+p0.x*cellW+cellW/2,py3=oy+p0.y*cellH+cellH/2;
ctx.beginPath();ctx.arc(px3,py3,2.5,0,Math.PI*2);ctx.fill();
}
ctx.restore();

// Towers with enhanced graphics
for(var i=0;i<towers.length;i++){
var tw=towers[i];
var tt=TOWER_TYPES[tw.type];
var tx3=ox+tw.x*cellW+cellW/2,ty3=oy+tw.y*cellH+cellH/2;
var ts=Math.min(cellW,cellH)*0.4;

// Tower shadow
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.beginPath();ctx.ellipse(tx3+2,ty3+ts*0.6,ts*0.9,ts*0.3,0,0,Math.PI*2);ctx.fill();

// Base with gradient
var baseGrad=ctx.createLinearGradient(tx3-ts,ty3-ts,tx3+ts,ty3+ts);
baseGrad.addColorStop(0,'#666');baseGrad.addColorStop(0.5,'#888');baseGrad.addColorStop(1,'#555');
ctx.fillStyle=baseGrad;
ctx.beginPath();ctx.roundRect(tx3-ts,ty3-ts,ts*2,ts*2,3);ctx.fill();

// Tower body with gradient
var towerGrad=ctx.createRadialGradient(tx3-ts*0.2,ty3-ts*0.2,ts*0.1,tx3,ty3,ts*0.9);
towerGrad.addColorStop(0,tt.color);
// Parse hex to make brighter version
var tr=parseInt(tt.color.slice(1,3),16);var tg=parseInt(tt.color.slice(3,5),16);var tb=parseInt(tt.color.slice(5,7),16);
towerGrad.addColorStop(1,'rgb('+Math.max(0,tr-40)+','+Math.max(0,tg-40)+','+Math.max(0,tb-40)+')');
ctx.fillStyle=towerGrad;
ctx.beginPath();ctx.roundRect(tx3-ts*0.7,ty3-ts*0.7,ts*1.4,ts*1.4,2);ctx.fill();

// Tower turret/barrel pointing at target
ctx.save();ctx.translate(tx3,ty3);ctx.rotate(tw.angle||0);
ctx.fillStyle='#444';ctx.fillRect(0,-ts*0.15,ts*0.8,ts*0.3);
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,-ts*0.15,ts*0.8,ts*0.1);
ctx.restore();

// Tower icon
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold '+Math.round(ts*0.6)+'px monospace';ctx.textAlign='center';
ctx.textBaseline='middle';
var icons=['A','C','I','L'];
ctx.fillText(icons[tw.type],tx3,ty3);
ctx.textBaseline='alphabetic';

// Level indicator
if(tw.level>1){
ctx.save();ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
ctx.fillStyle='#ffcc00';ctx.font='bold '+(ts*0.5)+'px monospace';ctx.textAlign='center';
ctx.fillText(tw.level+'',tx3+ts*0.6,ty3-ts*0.5);
ctx.restore();
}
// Range circle when cursor is on it
if(cursorX===tw.x&&cursorY===tw.y){
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(tx3,ty3,tt.range*((cellW+cellH)/2/30),0,Math.PI*2);ctx.stroke();
// fill range
ctx.fillStyle='rgba(255,255,255,0.03)';
ctx.beginPath();ctx.arc(tx3,ty3,tt.range*((cellW+cellH)/2/30),0,Math.PI*2);ctx.fill();
}
}

// Enemies with enhanced graphics
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
var ex3=getEnemyX(e),ey3=getEnemyY(e);
var es=Math.min(cellW,cellH)*0.35*e.size;
// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.beginPath();ctx.ellipse(ex3+2,ey3+es*0.5+2,es,es*0.3,0,0,Math.PI*2);ctx.fill();
// Body with gradient
var eR=parseInt(e.color.slice(1,3),16);var eG=parseInt(e.color.slice(3,5),16);var eB=parseInt(e.color.slice(5,7),16);
var enemyGrad=ctx.createRadialGradient(ex3-es*0.2,ey3-es*0.2,es*0.1,ex3,ey3,es);
enemyGrad.addColorStop(0,'rgb('+Math.min(255,eR+60)+','+Math.min(255,eG+60)+','+Math.min(255,eB+60)+')');
enemyGrad.addColorStop(1,e.color);
ctx.fillStyle=enemyGrad;
ctx.beginPath();ctx.arc(ex3,ey3,es,0,Math.PI*2);ctx.fill();
// Outline
ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ex3,ey3,es,0,Math.PI*2);ctx.stroke();
// Eyes
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex3-es*0.3,ey3-es*0.2,es*0.25,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex3+es*0.3,ey3-es*0.2,es*0.25,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex3-es*0.2,ey3-es*0.2,es*0.12,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex3+es*0.4,ey3-es*0.2,es*0.12,0,Math.PI*2);ctx.fill();
// Angry eyebrows for hard enemies
if(e.type===0){
ctx.strokeStyle='#800';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(ex3-es*0.5,ey3-es*0.4);ctx.lineTo(ex3-es*0.1,ey3-es*0.3);ctx.stroke();
ctx.beginPath();ctx.moveTo(ex3+es*0.5,ey3-es*0.4);ctx.lineTo(ex3+es*0.1,ey3-es*0.3);ctx.stroke();
}
// HP bar with gradient
var hpW=es*2,hpH=4;
ctx.fillStyle='#222';
if(ctx.roundRect){ctx.beginPath();ctx.roundRect(ex3-hpW/2-1,ey3-es-7,hpW+2,hpH+2,2);ctx.fill();}
else{ctx.fillRect(ex3-hpW/2-1,ey3-es-7,hpW+2,hpH+2);}
var hpPct=e.hp/e.maxHp;
var hpGrad=ctx.createLinearGradient(ex3-hpW/2,ey3-es-6,ex3-hpW/2,ey3-es-6+hpH);
if(hpPct>0.5){hpGrad.addColorStop(0,'#66ff66');hpGrad.addColorStop(1,'#22aa22');}
else if(hpPct>0.25){hpGrad.addColorStop(0,'#ffaa44');hpGrad.addColorStop(1,'#cc6600');}
else{hpGrad.addColorStop(0,'#ff6666');hpGrad.addColorStop(1,'#cc2222');}
ctx.fillStyle=hpGrad;
ctx.fillRect(ex3-hpW/2,ey3-es-6,hpW*hpPct,hpH);
// Slow indicator with glow
if(e.slowTimer>0){
ctx.save();ctx.shadowColor='rgba(100,200,255,0.5)';ctx.shadowBlur=6;
ctx.strokeStyle='rgba(100,200,255,0.6)';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(ex3,ey3,es+3,0,Math.PI*2);ctx.stroke();
ctx.restore();
}
}

// Bullets with glow
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.save();
ctx.shadowColor=b.color;ctx.shadowBlur=8;
var bulletGrad=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.size);
bulletGrad.addColorStop(0,'#fff');bulletGrad.addColorStop(0.5,b.color);bulletGrad.addColorStop(1,b.color);
ctx.fillStyle=bulletGrad;
ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
ctx.restore();
}

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);
ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=3;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;

// Cursor with pulsing glow
var cx2=ox+cursorX*cellW,cy2=oy+cursorY*cellH;
ctx.save();
ctx.shadowColor='rgba(255,255,255,0.4)';ctx.shadowBlur=6+Math.sin(gameTime*4)*3;
ctx.strokeStyle='rgba(255,255,255,'+(0.5+0.3*Math.sin(gameTime*4))+')';ctx.lineWidth=2;
ctx.strokeRect(cx2+1,cy2+1,cellW-2,cellH-2);
ctx.restore();
// Tower preview ghost
var previewIdx=cursorY*GRID_COLS+cursorX;
if(grid[previewIdx]===0){
var previewTT=TOWER_TYPES[towerType];
ctx.globalAlpha=0.3;
ctx.fillStyle=previewTT.color;
ctx.beginPath();ctx.roundRect(cx2+cellW*0.15,cy2+cellH*0.15,cellW*0.7,cellH*0.7,2);ctx.fill();
ctx.globalAlpha=1;
}

// Tower type selector UI (top) with gradient
var uiGrad=ctx.createLinearGradient(0,0,0,22);
uiGrad.addColorStop(0,'rgba(0,0,0,0.8)');uiGrad.addColorStop(1,'rgba(0,0,0,0.5)');
ctx.fillStyle=uiGrad;ctx.fillRect(0,0,W,22);
for(var i=0;i<TOWER_TYPES.length;i++){
var tt2=TOWER_TYPES[i];
if(i===towerType){
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(5+i*100,2,95,18);
ctx.strokeStyle=tt2.color;ctx.lineWidth=1;ctx.strokeRect(5+i*100,2,95,18);
}
ctx.fillStyle=tt2.color;ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText(tt2.name+' $'+tt2.cost,10+i*100,15);
}
// Money with glow
ctx.save();ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
ctx.fillStyle='#ffcc00';ctx.font='bold 12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('$'+money,W-10,15);
ctx.restore();

// Lives with glow
ctx.save();ctx.shadowColor='#ff4444';ctx.shadowBlur=3;
ctx.fillStyle='#ff6666';ctx.font='14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<Math.min(lives,10);i++)ctx.fillText('\u2665',10+i*18,H-8);
if(lives>10){ctx.fillStyle='#aaa';ctx.fillText('x'+lives,10+10*18,H-8);}
ctx.restore();

// Wave info with glow
if(!waveActive){
var timeLeft=Math.ceil(waveDelay-waveTimer);
ctx.save();ctx.shadowColor='rgba(255,255,255,0.3)';ctx.shadowBlur=8;
ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold '+Math.round(W*0.028)+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('WAVE '+wave+' in '+timeLeft+'s',W/2,H/2);
ctx.restore();
}
ctx.restore();
}

function drawTitle(dt){
titlePulse+=dt*3;
// gradient bg
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#0d1a0d');bg.addColorStop(0.5,'#0a150a');bg.addColorStop(1,'#051005');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Grid background with glow
ctx.strokeStyle='rgba(50,100,50,0.2)';ctx.lineWidth=1;
for(var i=0;i<W;i+=30){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
for(var i=0;i<H;i+=30){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}

// Decorative towers with enhanced look
for(var i=0;i<5;i++){
var tx4=W*0.15+i*W*0.17;
var tColor=TOWER_TYPES[i%4].color;
ctx.save();
ctx.shadowColor=tColor;ctx.shadowBlur=8;
var decGrad=ctx.createRadialGradient(tx4,H*0.7,2,tx4,H*0.7,12);
decGrad.addColorStop(0,tColor);
decGrad.addColorStop(1,'rgba(0,0,0,0.5)');
ctx.fillStyle=decGrad;
ctx.beginPath();ctx.roundRect(tx4-10,H*0.7-10,20,20,3);ctx.fill();
ctx.restore();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44ff44';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';ctx.fillStyle='#44ff44';
ctx.fillText('TOWER DEFENSE',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';ctx.fillStyle='#88cc88';
ctx.fillText('PROTECT YOUR BASE!',W/2,H*0.36);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.5);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move cursor, Space to place tower',W/2,H*0.58);
ctx.fillText('Up/Down also cycles tower type when at edge',W/2,H*0.63);
ctx.fillText('1-4 keys to select tower type',W/2,H*0.68);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('BASE DESTROYED',W/2,H*0.2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.3,W*0.6,H*0.4,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.4);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.51);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Waves survived: '+(wave-1)+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.62);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='WAVE '+wave;
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
if(down&&e.key==='1')towerType=0;
if(down&&e.key==='2')towerType=1;
if(down&&e.key==='3')towerType=2;
if(down&&e.key==='4')towerType=3;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initTowerDefense=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(e2){
if(gameState!=='playing'){resetGame();return;}
var rect=canvas.getBoundingClientRect();
var mx2=e2.clientX-rect.left,my2=e2.clientY-rect.top;
cursorX=Math.floor((mx2-ox)/cellW);cursorY=Math.floor((my2-oy)/cellH);
cursorX=Math.max(0,Math.min(GRID_COLS-1,cursorX));
cursorY=Math.max(0,Math.min(GRID_ROWS-1,cursorY));
placeTower();
});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopTowerDefense=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
