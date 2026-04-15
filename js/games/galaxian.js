// Galaxian — Full Game
(function(){
// roundRect polyfill
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();
this.moveTo(x+r[0],y);
this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);
this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,bullet=null,enemies=[],eBullets=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keySpace=false;
var PLAYER_SPEED=350,BULLET_SPEED=550,ENEMY_BULLET_SPEED=130;
var formationX=0,formationDir=1,formationTimer=0;
var diveTimer=0,diveInterval=2.5;
var waveTransition=false,waveTransitionTimer=0;
var starLayers=[];

// Difficulty: easy(1-2), medium(3-5), hard(6+)
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }
function diffFireRate(){ return level<=2?0.001:(level<=5?0.002+level*0.0005:0.003+level*0.001); }
function diffDiveSpeed(){ return (140+level*8)*diffMult(); }

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
initStars();
}

function initStars(){
starLayers=[[],[]];
for(var i=0;i<80;i++)starLayers[0].push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*0.5,b:0.2+Math.random()*0.4});
for(var i=0;i<40;i++)starLayers[1].push({x:Math.random()*W,y:Math.random()*H,s:1+Math.random()*1,b:0.5+Math.random()*0.4});
}

function spawnFormation(){
enemies=[];
var cols=10,rows=3;
var ew=24,eh=20,gapX=6,gapY=8;
var totalW=cols*(ew+gapX);
var startX=(W-totalW)/2+gapX/2;
var startY=50;

for(var r=0;r<rows;r++){
for(var c=0;c<cols;c++){
var type='yellow';
var hp=1,pts=10;
if(r===1){type='red';hp=1;pts=20;}
if(r===0){type='blue';hp=2;pts=30;}
enemies.push({
x:startX+c*(ew+gapX),y:startY+r*(eh+gapY),
homeX:startX+c*(ew+gapX),homeY:startY+r*(eh+gapY),
w:ew,h:eh,hp:hp,maxHp:hp,alive:true,type:type,pts:pts,
row:r,col:c,frame:0,frameTimer:0,
diving:false,divePhase:0,diveTime:0,
diveStartX:0,diveStartY:0,
escortOf:null,isEscort:false
});
}}
formationX=0;formationDir=1;formationTimer=0;
diveTimer=0;
diveInterval=level<=2?3.0:Math.max(0.8,2.5-level*0.15);
}

function resetGame(){
player={x:W/2,y:H-50,w:34,h:20};
bullet=null;eBullets=[];particles=[];
score=0;lives=3;level=1;gameTime=0;
waveTransition=false;waveTransitionTimer=0;
spawnFormation();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=40+Math.random()*180;
particles.push({
x:x,y:y,
vx:Math.cos(angle)*speed,
vy:Math.sin(angle)*speed,
life:0.3+Math.random()*0.6,
maxLife:0.3+Math.random()*0.6,
color:color,
size:1+Math.random()*3
});
}}

function addExplosion(x,y,colors,count){
for(var i=0;i<count;i++){
var c=colors[Math.floor(Math.random()*colors.length)];
addParticles(x,y,c,1);
}}

// Curved dive path: Bezier-like swoop toward player then loop back up
function startDive(enemy){
if(!enemy.alive||enemy.diving)return;
enemy.diving=true;
enemy.divePhase=0;
enemy.diveTime=0;
enemy.diveStartX=enemy.x;
enemy.diveStartY=enemy.y;
}

// Flagship (blue) dive triggers with 2 escorts from the red row
function startFlagshipDive(flagship){
if(!flagship.alive||flagship.diving||flagship.type!=='blue')return;
startDive(flagship);
// Find 2 red escorts near this column
var escorts=[];
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(e.alive&&!e.diving&&e.type==='red'&&Math.abs(e.col-flagship.col)<=2){
escorts.push(e);
}
if(escorts.length>=2)break;
}
for(var i=0;i<escorts.length;i++){
startDive(escorts[i]);
escorts[i].escortOf=flagship;
escorts[i].isEscort=true;
}
}

function updateDiving(e,dt){
if(gameState!=='playing')return;
var baseDiveSpeed=diffDiveSpeed();
var diveSpeed=baseDiveSpeed;
e.diveTime+=dt;
var t=e.diveTime;

if(e.divePhase===0){
// Phase 0: Swoop down in a curved path toward player area
var targetX=player.x+(Math.random()-0.5)*60;
var targetY=H*0.7;
var dx=targetX-e.diveStartX;
var dy=targetY-e.diveStartY;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist<1)dist=1;
var progress=Math.min(1,t*diveSpeed/dist);
// Sine wave wobble for the curved path
e.x=e.diveStartX+dx*progress+Math.sin(t*4)*35;
e.y=e.diveStartY+dy*progress;

if(progress>=1){
e.divePhase=1;e.diveTime=0;
e.diveStartX=e.x;e.diveStartY=e.y;
}

// Fire during dive (easy: low fire rate)
if(Math.random()<0.005*dt*60){
eBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ENEMY_BULLET_SPEED+level*3});
}
}else if(e.divePhase===1){
// Phase 1: Continue past bottom of screen
e.y=e.diveStartY+t*diveSpeed*0.6;
e.x=e.diveStartX+Math.sin(t*3)*30;
if(e.y>H+40){
// Loop back: appear from the top
e.divePhase=2;e.diveTime=0;
e.y=-30;
e.x=e.homeX+formationX;
e.diveStartX=e.x;e.diveStartY=e.y;
}
}else if(e.divePhase===2){
// Phase 2: Return to formation position
var homeX=e.homeX+formationX;
var homeY=e.homeY;
var dx2=homeX-e.x;
var dy2=homeY-e.y;
var d2=Math.sqrt(dx2*dx2+dy2*dy2);
if(d2<3){
e.x=homeX;e.y=homeY;
e.diving=false;e.isEscort=false;e.escortOf=null;
}else{
var returnSpeed=diveSpeed*0.7;
e.x+=dx2/d2*returnSpeed*dt;
e.y+=dy2/d2*returnSpeed*dt;
}
}
}

function update(dt){
if(gameState!=='playing')return;
if(dt>0.1)dt=0.1;
gameTime+=dt;

if(waveTransition){
waveTransitionTimer-=dt;
if(waveTransitionTimer<=0){
waveTransition=false;
level++;
diveInterval=level<=2?3.0:Math.max(0.8,2.5-level*0.15);
spawnFormation();
}
return;
}

// Player movement
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));

// Shoot — classic Galaxian: only 1 bullet on screen at a time
if(keySpace&&bullet===null){
bullet={x:player.x,y:player.y-player.h/2};
}

// Update player bullet
if(bullet){
bullet.y-=BULLET_SPEED*dt;
if(bullet.y<-10){bullet=null;}
}

// Formation movement (sway left/right slowly)
formationTimer+=dt;
formationX=Math.sin(formationTimer*0.6)*25;

// Dive scheduling
diveTimer+=dt;
if(diveTimer>=diveInterval){
diveTimer=0;
var candidates=[];
var flagCandidates=[];
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive&&!enemies[i].diving){
candidates.push(i);
if(enemies[i].type==='blue')flagCandidates.push(i);
}
}
if(candidates.length>0){
// 30% chance to trigger a flagship dive (with escorts) if available
if(flagCandidates.length>0&&Math.random()<0.3){
var pick=flagCandidates[Math.floor(Math.random()*flagCandidates.length)];
startFlagshipDive(enemies[pick]);
}else{
var pick=candidates[Math.floor(Math.random()*candidates.length)];
startDive(enemies[pick]);
}
}
}

// Update enemies
var aliveCount=0;
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
aliveCount++;
e.frameTimer+=dt;
if(e.frameTimer>0.35){e.frameTimer=0;e.frame=(e.frame+1)%2;}

if(e.diving){
updateDiving(e,dt);
}else{
// Follow formation
e.x=e.homeX+formationX;
e.y=e.homeY;
}
}

// Non-diving enemies occasionally shoot (easy: very low rate)
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||e.diving)continue;
if(Math.random()<diffFireRate()*dt*60){
eBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:(ENEMY_BULLET_SPEED+level*2)*diffMult()});
}
}

// Update enemy bullets
for(var i=eBullets.length-1;i>=0;i--){
eBullets[i].x+=eBullets[i].vx*dt;
eBullets[i].y+=eBullets[i].vy*dt;
if(eBullets[i].y>H+10||eBullets[i].y<-10)eBullets.splice(i,1);
}

// Bullet-enemy collision
if(bullet){
for(var e=0;e<enemies.length;e++){
if(!enemies[e].alive)continue;
var en=enemies[e];
// Generous hitbox
var hx=en.x-4,hy=en.y-4,hw=en.w+8,hh=en.h+8;
if(bullet.x>hx&&bullet.x<hx+hw&&bullet.y>hy&&bullet.y<hy+hh){
enemies[e].hp--;
if(enemies[e].hp<=0){
enemies[e].alive=false;
var pts=enemies[e].pts;
// Diving bonus: double points during dive
if(enemies[e].diving)pts*=2;
// Escort kill bonus: if killed while escorting a flagship
if(enemies[e].isEscort&&enemies[e].escortOf&&enemies[e].escortOf.alive)pts+=10;
score+=pts;
var eColors;
if(enemies[e].type==='yellow')eColors=['#ffff00','#ffcc00','#ffffff'];
else if(enemies[e].type==='red')eColors=['#ff4444','#ff8888','#ffcc00'];
else eColors=['#4488ff','#88aaff','#ffffff'];
addExplosion(en.x+en.w/2,en.y+en.h/2,eColors,16);
}else{
// Hit but not dead (flagship takes 2 hits)
addExplosion(en.x+en.w/2,en.y+en.h/2,['#ffffff','#aaaaff'],6);
}
bullet=null;break;
}
}
}

// Enemy bullet-player collision (smaller collision box = forgiving)
for(var i=eBullets.length-1;i>=0;i--){
var eb=eBullets[i];
var px=player.x-player.w*0.25,py=player.y-player.h*0.3;
var pw=player.w*0.5,ph=player.h*0.6;
if(eb.x>px&&eb.x<px+pw&&eb.y>py&&eb.y<py+ph){
eBullets.splice(i,1);lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff','#4488ff'],25);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-50;}
}
}

// Diving enemy-player collision
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive||!e.diving)continue;
var dx=e.x+e.w/2-player.x;
var dy=e.y+e.h/2-player.y;
if(Math.abs(dx)<(e.w+player.w)*0.3&&Math.abs(dy)<(e.h+player.h)*0.3){
enemies[i].alive=false;
addExplosion(e.x+e.w/2,e.y+e.h/2,['#ff8800','#ffcc00','#ffffff'],20);
lives--;
addExplosion(player.x,player.y,['#00ccff','#ffffff'],15);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-50;}
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.vx*=0.97;p.vy*=0.97;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Wave clear
if(aliveCount===0){
waveTransition=true;
waveTransitionTimer=1.8;
}

// Stars scrolling
for(var l=0;l<2;l++){
var speed=(l+1)*25;
for(var i=0;i<starLayers[l].length;i++){
starLayers[l][i].y+=speed*dt;
if(starLayers[l][i].y>H){starLayers[l][i].y=0;starLayers[l][i].x=Math.random()*W;}
}
}
}

function drawStars(){
for(var l=0;l<2;l++){
for(var i=0;i<starLayers[l].length;i++){
var s=starLayers[l][i];
var twinkle=0.5+0.5*Math.sin(gameTime*2.5+s.x+s.y);
ctx.globalAlpha=s.b*twinkle;
var starColor=(l===1)?'#aaccff':'#ffffff';
ctx.fillStyle=starColor;
if(s.s>1.2){
// Larger stars get a soft glow
ctx.save();
ctx.shadowColor=starColor;ctx.shadowBlur=s.s*3;
ctx.beginPath();ctx.arc(s.x,s.y,s.s*0.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}else{
ctx.fillRect(s.x,s.y,s.s,s.s);
}
}
}
ctx.globalAlpha=1;
// Subtle nebula/space dust
ctx.save();
ctx.globalAlpha=0.03;
var nebGrad=ctx.createRadialGradient(W*0.3,H*0.4,10,W*0.3,H*0.4,W*0.4);
nebGrad.addColorStop(0,'#4444aa');nebGrad.addColorStop(1,'transparent');
ctx.fillStyle=nebGrad;ctx.fillRect(0,0,W,H);
var nebGrad2=ctx.createRadialGradient(W*0.7,H*0.6,10,W*0.7,H*0.6,W*0.3);
nebGrad2.addColorStop(0,'#664488');nebGrad2.addColorStop(1,'transparent');
ctx.fillStyle=nebGrad2;ctx.fillRect(0,0,W,H);
ctx.restore();
}

// Scan-line overlay effect (subtle horizontal lines)
function drawScanlines(){
ctx.save();
ctx.globalAlpha=0.04;
ctx.fillStyle='#000000';
for(var y=0;y<H;y+=2){
ctx.fillRect(0,y,W,1);
}
ctx.globalAlpha=1;
ctx.restore();
}

function drawPlayerShip(x,y,w,h){
ctx.save();
// Engine glow with gradient
ctx.shadowColor='#4488ff';ctx.shadowBlur=12;
var engGrad=ctx.createLinearGradient(x,y+h*0.5,x,y+h*0.5+8+Math.sin(gameTime*14)*3);
engGrad.addColorStop(0,'#4488ff');engGrad.addColorStop(0.5,'#2244cc');engGrad.addColorStop(1,'rgba(34,68,170,0)');
ctx.fillStyle=engGrad;
ctx.beginPath();
ctx.moveTo(x-w*0.14,y+h*0.5);
ctx.lineTo(x,y+h*0.5+8+Math.sin(gameTime*14)*3);
ctx.lineTo(x+w*0.14,y+h*0.5);
ctx.fill();
// Secondary engine trails
ctx.fillStyle='rgba(100,160,255,0.3)';
ctx.beginPath();ctx.moveTo(x-w*0.25,y+h*0.45);ctx.lineTo(x-w*0.2,y+h*0.45+4+Math.sin(gameTime*12)*2);ctx.lineTo(x-w*0.15,y+h*0.45);ctx.fill();
ctx.beginPath();ctx.moveTo(x+w*0.15,y+h*0.45);ctx.lineTo(x+w*0.2,y+h*0.45+4+Math.sin(gameTime*12+1)*2);ctx.lineTo(x+w*0.25,y+h*0.45);ctx.fill();

ctx.shadowColor='#88bbff';ctx.shadowBlur=6;
// Main body with metallic gradient
var bodyGrad=ctx.createLinearGradient(x-w*0.42,y-h*0.65,x+w*0.42,y+h*0.4);
bodyGrad.addColorStop(0,'#eef4ff');bodyGrad.addColorStop(0.4,'#ddeeff');bodyGrad.addColorStop(0.8,'#bbccee');bodyGrad.addColorStop(1,'#99aacc');
ctx.fillStyle=bodyGrad;
ctx.beginPath();
ctx.moveTo(x,y-h*0.65);
ctx.lineTo(x+w*0.42,y+h*0.4);
ctx.lineTo(x+w*0.18,y+h*0.3);
ctx.lineTo(x-w*0.18,y+h*0.3);
ctx.lineTo(x-w*0.42,y+h*0.4);
ctx.closePath();
ctx.fill();
// Hull highlight
ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x,y-h*0.65);ctx.lineTo(x-w*0.42,y+h*0.4);ctx.stroke();

// Cockpit with glow
var cockGrad=ctx.createLinearGradient(x-w*0.09,y-h*0.35,x+w*0.09,y+h*0.05);
cockGrad.addColorStop(0,'#66aaff');cockGrad.addColorStop(0.5,'#4488ff');cockGrad.addColorStop(1,'#2266dd');
ctx.fillStyle=cockGrad;
ctx.beginPath();ctx.moveTo(x,y-h*0.35);ctx.lineTo(x+w*0.09,y+h*0.05);ctx.lineTo(x-w*0.09,y+h*0.05);ctx.closePath();ctx.fill();
// Cockpit glass reflection
ctx.fillStyle='rgba(255,255,255,0.2)';
ctx.beginPath();ctx.moveTo(x-w*0.03,y-h*0.3);ctx.lineTo(x+w*0.02,y-h*0.15);ctx.lineTo(x-w*0.06,y-h*0.1);ctx.closePath();ctx.fill();

// Wing tips with nav lights
ctx.fillStyle='#7799cc';
ctx.fillRect(x-w*0.48,y+h*0.2,w*0.12,h*0.25);
ctx.fillRect(x+w*0.36,y+h*0.2,w*0.12,h*0.25);
var wingBlink=Math.sin(gameTime*6)>0;
ctx.fillStyle=wingBlink?'#ff4444':'#661111';
ctx.beginPath();ctx.arc(x-w*0.47,y+h*0.35,1.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle=wingBlink?'#44ff44':'#116611';
ctx.beginPath();ctx.arc(x+w*0.47,y+h*0.35,1.5,0,Math.PI*2);ctx.fill();

ctx.shadowBlur=0;
ctx.restore();
}

// Yellow triangle aliens (row 2, bottom row: 10pts)
function drawEnemyYellow(x,y,w,h,frame){
ctx.save();
var cx=x+w/2,cy=y+h/2;
// Glow effect
ctx.shadowColor='#ffcc00';ctx.shadowBlur=5+2*Math.sin(gameTime*4);
// Gradient body
var yGrad=ctx.createLinearGradient(cx,y+1,cx,y+h-1);
yGrad.addColorStop(0,'#ffe844');yGrad.addColorStop(0.5,'#ffcc00');yGrad.addColorStop(1,'#dd9900');
ctx.fillStyle=yGrad;
ctx.beginPath();
ctx.moveTo(cx,y+1);
ctx.lineTo(x+w-1,y+h-1);
ctx.lineTo(x+1,y+h-1);
ctx.closePath();
ctx.fill();
// Inner highlight
ctx.fillStyle='rgba(255,255,150,0.4)';
ctx.beginPath();ctx.moveTo(cx,y+5);ctx.lineTo(cx+w*0.15,cy);ctx.lineTo(cx-w*0.15,cy);ctx.closePath();ctx.fill();
ctx.shadowBlur=0;
// Eyes with pupils
ctx.fillStyle='#ffffff';
ctx.fillRect(cx-5,cy-2,4,4);
ctx.fillRect(cx+1,cy-2,4,4);
ctx.fillStyle='#000000';
ctx.fillRect(cx-4,cy-1,2,2);
ctx.fillRect(cx+2,cy-1,2,2);
// Wing animation with detail
ctx.fillStyle='#ffaa00';
if(frame===0){
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-4,cy-2);ctx.lineTo(x-3,cy+h*0.3);ctx.lineTo(x,cy+h*0.25);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+4,cy-2);ctx.lineTo(x+w+3,cy+h*0.3);ctx.lineTo(x+w,cy+h*0.25);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(x,cy+2);ctx.lineTo(x-3,cy+4);ctx.lineTo(x-2,cy+h*0.2+2);ctx.lineTo(x,cy+h*0.2);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy+2);ctx.lineTo(x+w+3,cy+4);ctx.lineTo(x+w+2,cy+h*0.2+2);ctx.lineTo(x+w,cy+h*0.2);ctx.closePath();ctx.fill();
}
ctx.restore();
}

// Red diamond aliens (row 1, middle row: 20pts)
function drawEnemyRed(x,y,w,h,frame){
ctx.save();
var cx=x+w/2,cy=y+h/2;
ctx.fillStyle='#ff3333';
ctx.shadowColor='#ff4444';ctx.shadowBlur=3;
// Diamond shape
ctx.beginPath();
ctx.moveTo(cx,y);
ctx.lineTo(x+w,cy);
ctx.lineTo(cx,y+h);
ctx.lineTo(x,cy);
ctx.closePath();
ctx.fill();
// Inner diamond
ctx.fillStyle='#ff6666';
ctx.beginPath();
ctx.moveTo(cx,y+4);
ctx.lineTo(x+w-4,cy);
ctx.lineTo(cx,y+h-4);
ctx.lineTo(x+4,cy);
ctx.closePath();
ctx.fill();
ctx.shadowBlur=0;
// Eyes
ctx.fillStyle='#ffffff';
ctx.fillRect(cx-4,cy-3,3,3);
ctx.fillRect(cx+1,cy-3,3,3);
ctx.fillStyle='#000000';
ctx.fillRect(cx-3,cy-2,2,2);
ctx.fillRect(cx+2,cy-2,2,2);
// Wings
ctx.fillStyle='#cc2222';
if(frame===0){
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-5,y+3);ctx.lineTo(x-1,cy+4);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+5,y+3);ctx.lineTo(x+w+1,cy+4);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-4,cy+4);ctx.lineTo(x+1,cy+6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+4,cy+4);ctx.lineTo(x+w-1,cy+6);ctx.closePath();ctx.fill();
}
ctx.restore();
}

// Blue pentagon flagships (row 0, top row: 30pts, 2 hits)
function drawEnemyBlue(x,y,w,h,frame,hp,maxHp){
ctx.save();
var cx=x+w/2,cy=y+h/2;
var pulse=0.5+0.5*Math.sin(gameTime*3.5);
var damaged=(hp<maxHp);

ctx.shadowColor=damaged?'#ff8800':'#4488ff';
ctx.shadowBlur=5+pulse*5;

// Pentagon shape
ctx.fillStyle=damaged?'#ff6600':'#3366cc';
ctx.beginPath();
var sides=5,radius=Math.min(w,h)*0.55;
for(var i=0;i<sides;i++){
var angle=i*2*Math.PI/sides-Math.PI/2;
var px=cx+Math.cos(angle)*radius;
var py=cy+Math.sin(angle)*radius*0.9;
if(i===0)ctx.moveTo(px,py);
else ctx.lineTo(px,py);
}
ctx.closePath();
ctx.fill();

// Inner pentagon
ctx.fillStyle=damaged?'#ffaa44':'#5588ee';
ctx.beginPath();
var innerR=radius*0.6;
for(var i=0;i<sides;i++){
var angle=i*2*Math.PI/sides-Math.PI/2;
var px=cx+Math.cos(angle)*innerR;
var py=cy+Math.sin(angle)*innerR*0.9;
if(i===0)ctx.moveTo(px,py);
else ctx.lineTo(px,py);
}
ctx.closePath();
ctx.fill();

ctx.shadowBlur=0;

// Crown detail (flagship marker)
ctx.fillStyle=damaged?'#ffcc00':'#aaccff';
ctx.fillRect(cx-2,y-3,4,4);
ctx.fillRect(cx-5,y-1,3,3);
ctx.fillRect(cx+3,y-1,3,3);

// Eyes - glowing
ctx.fillStyle='#ffffff';
ctx.fillRect(cx-4,cy-2,4,3);
ctx.fillRect(cx+1,cy-2,4,3);
ctx.fillStyle='#000011';
ctx.fillRect(cx-3,cy-1,2,2);
ctx.fillRect(cx+2,cy-1,2,2);

// Wing animation
ctx.fillStyle=damaged?'#cc5500':'#2255aa';
if(frame===0){
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-5,y+1);ctx.lineTo(x-1,cy+5);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+5,y+1);ctx.lineTo(x+w+1,cy+5);ctx.closePath();ctx.fill();
}else{
ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-4,cy+3);ctx.lineTo(x,cy+7);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w,cy);ctx.lineTo(x+w+4,cy+3);ctx.lineTo(x+w,cy+7);ctx.closePath();ctx.fill();
}
ctx.restore();
}

function drawEnemy(e){
if(e.type==='yellow')drawEnemyYellow(e.x,e.y,e.w,e.h,e.frame);
else if(e.type==='red')drawEnemyRed(e.x,e.y,e.w,e.h,e.frame);
else if(e.type==='blue')drawEnemyBlue(e.x,e.y,e.w,e.h,e.frame,e.hp,e.maxHp);
}

function render(){
if(gameState!=='playing'&&gameState!=='gameover')return;
ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
drawStars();

// Wave transition text
if(waveTransition){
ctx.save();ctx.textAlign='center';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('WAVE '+(level+1),W/2,H*0.4);
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillStyle='#aaaaaa';
ctx.fillText('GET READY!',W/2,H*0.48);
ctx.restore();
drawScanlines();
return;
}

// Enemies
for(var i=0;i<enemies.length;i++){
if(enemies[i].alive)drawEnemy(enemies[i]);
}

// Player
drawPlayerShip(player.x,player.y,player.w,player.h);

// Player bullet - bright dot
if(bullet){
ctx.save();
ctx.shadowColor='#ffffff';ctx.shadowBlur=8;
ctx.fillStyle='#ffffff';
ctx.beginPath();
ctx.arc(bullet.x,bullet.y,2.5,0,Math.PI*2);
ctx.fill();
// Small trail
ctx.shadowBlur=0;
ctx.fillStyle='rgba(200,220,255,0.4)';
ctx.fillRect(bullet.x-1,bullet.y+2,2,6);
ctx.restore();
}

// Enemy bullets
ctx.save();
ctx.shadowColor='#ff4444';ctx.shadowBlur=4;
ctx.fillStyle='#ff6666';
for(var i=0;i<eBullets.length;i++){
ctx.beginPath();
ctx.arc(eBullets[i].x,eBullets[i].y,2,0,Math.PI*2);
ctx.fill();
}
ctx.shadowBlur=0;
ctx.restore();

// Particles (starburst explosions)
for(var i=0;i<particles.length;i++){
var p=particles[i];
ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
ctx.fillStyle=p.color;
// Starburst: draw as small cross/star shapes
var sz=p.size*(p.life/p.maxLife);
ctx.fillRect(p.x-sz,p.y-0.5,sz*2,1);
ctx.fillRect(p.x-0.5,p.y-sz,1,sz*2);
// Also a center dot
ctx.beginPath();
ctx.arc(p.x,p.y,sz*0.6,0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;

// Lives display (ship icons)
for(var i=0;i<lives;i++){
var lx=20+i*20,ly=H-16;
ctx.fillStyle='#ddeeff';
ctx.beginPath();
ctx.moveTo(lx,ly-5);
ctx.lineTo(lx+6,ly+4);
ctx.lineTo(lx-6,ly+4);
ctx.closePath();
ctx.fill();
}

// Wave indicator
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('WAVE '+level,W-15,H-16);

// Scan-line overlay
drawScanlines();
}

function drawTitle(dt){
ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
drawStars();
titlePulse+=dt*3;

ctx.save();ctx.textAlign='center';

// Title glow
var glowPulse=12+Math.sin(titlePulse)*8;
ctx.shadowColor='#4488ff';ctx.shadowBlur=glowPulse;

// GALAXIAN title
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#3366cc';
ctx.fillText('GALAXIAN',W/2,H*0.25);
ctx.shadowColor='#88ccff';ctx.shadowBlur=glowPulse*0.5;
ctx.fillStyle='#4488ee';
ctx.fillText('GALAXIAN',W/2,H*0.25);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillStyle='#ffcc00';
ctx.fillText('SPACE ARCADE CLASSIC',W/2,H*0.32);

// Start prompt
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.48);

// Controls
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / A-D to move, Space to shoot',W/2,H*0.55);

// Draw sample enemies with point values
var sampleY=H*0.68;
var spacing=W*0.15;
var sx=W/2-spacing;

// Blue flagship
drawEnemyBlue(sx-12,sampleY-10,24,20,Math.floor(titlePulse)%2,2,2);
ctx.fillStyle='#4488ff';ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
ctx.fillText('30 pts',sx,sampleY+20);
ctx.fillStyle='#666';ctx.font=Math.round(W*0.011)+'px "Courier New",monospace';
ctx.fillText('(2 hits)',sx,sampleY+32);

// Red
drawEnemyRed(sx+spacing-12,sampleY-10,24,20,Math.floor(titlePulse)%2);
ctx.fillStyle='#ff4444';ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
ctx.fillText('20 pts',sx+spacing,sampleY+20);

// Yellow
drawEnemyYellow(sx+spacing*2-12,sampleY-10,24,20,Math.floor(titlePulse)%2);
ctx.fillStyle='#ffcc00';ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
ctx.fillText('10 pts',sx+spacing*2,sampleY+20);

// Hint
ctx.fillStyle='#ff8844';ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
ctx.fillText('FLAGSHIPS DIVE WITH ESCORTS FOR BONUS POINTS!',W/2,H*0.88);

ctx.restore();

drawScanlines();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.40);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Wave reached: '+level,W/2,H*0.50);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.72);
ctx.restore();

drawScanlines();
}

function updateHUD(){
var el;
el=document.getElementById('hud-score');if(el)el.textContent=score;
el=document.getElementById('hud-speed');if(el)el.textContent='WV '+level;
el=document.getElementById('hud-time');if(el)el.textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){
if(gameState===null)return;
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

// Always update stars for scrolling effect
if(gameState!=='playing'){
for(var l=0;l<2;l++){
var speed=(l+1)*25;
for(var i=0;starLayers[l]&&i<starLayers[l].length;i++){
starLayers[l][i].y+=speed*dt;
if(starLayers[l][i].y>H){starLayers[l][i].y=0;starLayers[l][i].x=Math.random()*W;}
}
}
}

if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt*3;drawGameOver();updateHUD();}

animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(gameState===null)return;
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;}
if(e.key===' '){keySpace=down;}
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1){e.preventDefault();}
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,set){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});
}

window.initGalaxian=function(){
canvas=document.getElementById('game-canvas');
if(!canvas)return;
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopGalaxian=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState=null;keyLeft=keyRight=keySpace=false;
bullet=null;enemies=[];eBullets=[];particles=[];
};
})();
