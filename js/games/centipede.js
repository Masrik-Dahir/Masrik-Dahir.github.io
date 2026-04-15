// Centipede — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(r>w/2)r=w/2;if(r>h/2)r=h/2;
this.beginPath();this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);
this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var COLS=30,ROWS=30,cellW,cellH;
var player,bullets=[],mushrooms=[],particles=[],centipedes=[],spider=null,flea=null,scorpion=null;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false,lastShot=0;
var PLAYER_SPEED=320,BULLET_SPEED=600,FIRE_RATE=0.12;
var spiderTimer=0,fleaTimer=0,scorpionTimer=0;
var SPIDER_SPEED=120,FLEA_SPEED=180,SCORPION_SPEED=100;
var floatingScores=[],screenShake=0;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
cellW=W/COLS;cellH=H/ROWS;}

function gridX(col){return col*cellW;}
function gridY(row){return row*cellH;}

// --- Mushroom helpers ---
function getMushroom(col,row){for(var i=0;i<mushrooms.length;i++){if(mushrooms[i].col===col&&mushrooms[i].row===row)return mushrooms[i];}return null;}
function addMushroom(col,row){if(col<0||col>=COLS||row<0||row>=ROWS)return;if(getMushroom(col,row))return;mushrooms.push({col:col,row:row,hp:4,poisoned:false});}

function spawnMushrooms(){mushrooms=[];for(var i=0;i<20;i++){var c=Math.floor(Math.random()*COLS),r=2+Math.floor(Math.random()*(ROWS-8));addMushroom(c,r);}}

// --- Centipede ---
function spawnCentipede(){
var segs=[];var startCol=Math.floor(COLS/2);
for(var i=0;i<12;i++){segs.push({col:startCol-i,row:0,dir:1,dropping:false,targetRow:0,isHead:i===0});}
centipedes.push(segs);
}

function moveCentipede(seg,allSegs,segIdx){
if(seg.dropping){
seg.row+=1;
if(seg.row>=seg.targetRow){seg.row=seg.targetRow;seg.dropping=false;seg.dir*=-1;}
return;}
var nextCol=seg.col+seg.dir;
var blocked=false;
if(nextCol<0||nextCol>=COLS)blocked=true;
if(!blocked&&getMushroom(nextCol,seg.row))blocked=true;
if(blocked){
// Check if poisoned mushroom caused this — dive to bottom
var m=getMushroom(seg.col+seg.dir,seg.row);
if(m&&m.poisoned){seg.dropping=true;seg.targetRow=ROWS-7;return;}
seg.dropping=true;
seg.targetRow=seg.row+1;
if(seg.targetRow>=ROWS)seg.targetRow=ROWS-1;
}else{seg.col=nextCol;}}

// --- Spider ---
function spawnSpider(){
var side=Math.random()<0.5?0:COLS-1;
spider={x:gridX(side),y:gridY(ROWS-4),vx:(side===0?1:-1)*SPIDER_SPEED,vy:0,
bounceTimer:0,alive:true,size:cellW*0.8};}

function updateSpider(dt){
if(!spider||!spider.alive)return;
spider.bounceTimer+=dt;
spider.vy=Math.sin(spider.bounceTimer*5)*(SPIDER_SPEED*0.8);
spider.x+=spider.vx*dt;spider.y+=spider.vy*dt;
// Clamp to bottom area
var minY=gridY(ROWS-7),maxY=gridY(ROWS-1);
if(spider.y<minY)spider.y=minY;if(spider.y>maxY)spider.y=maxY;
// Remove mushrooms spider touches
var sc=Math.floor(spider.x/cellW),sr=Math.floor(spider.y/cellH);
for(var i=mushrooms.length-1;i>=0;i--){if(mushrooms[i].col===sc&&mushrooms[i].row===sr)mushrooms.splice(i,1);}
// Off screen
if(spider.x<-cellW*2||spider.x>W+cellW*2)spider=null;}

// --- Flea ---
function spawnFlea(){
var col=Math.floor(Math.random()*COLS);
flea={col:col,x:gridX(col)+cellW/2,y:-cellH,speed:FLEA_SPEED,alive:true};}

function updateFlea(dt){
if(!flea||!flea.alive)return;
flea.y+=flea.speed*dt;
var row=Math.floor(flea.y/cellH);
if(row>=0&&row<ROWS&&Math.random()<0.3*dt*60){addMushroom(flea.col,row);}
if(flea.y>H+cellH)flea=null;}

// --- Scorpion ---
function spawnScorpion(){
var side=Math.random()<0.5?0:COLS-1;
scorpion={x:side===0?-cellW:W+cellW,y:gridY(2+Math.floor(Math.random()*(ROWS-10))),
dir:side===0?1:-1,alive:true};}

function updateScorpion(dt){
if(!scorpion||!scorpion.alive)return;
scorpion.x+=scorpion.dir*SCORPION_SPEED*dt;
var col=Math.floor(scorpion.x/cellW),row=Math.floor(scorpion.y/cellH);
var m=getMushroom(col,row);if(m)m.poisoned=true;
if(scorpion.x<-cellW*3||scorpion.x>W+cellW*3)scorpion=null;}

// --- Particles ---
function addParticles(x,y,color,count){for(var i=0;i<count;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250,life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*3});}

function addFloatingScore(x,y,pts){floatingScores.push({x:x,y:y,pts:pts,life:1.0});}

// --- Reset ---
function resetGame(){
player={x:W/2,y:H-cellH*2,w:cellW*1.2,h:cellH*0.8};
bullets=[];mushrooms=[];particles=[];centipedes=[];floatingScores=[];
spider=null;flea=null;scorpion=null;
score=0;lives=3;level=1;gameTime=0;
spiderTimer=0;fleaTimer=0;scorpionTimer=0;
spawnMushrooms();centipedes=[];spawnCentipede();
gameState='playing';}

// --- Collision helpers ---
function rectOverlap(ax,ay,aw,ah,bx,by,bw,bh){
return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

// --- Update ---
var centMoveTimer=0;
var CENT_MOVE_INTERVAL=0.07;

function update(dt){
if(dt>0.1)dt=0.1;
if(gameState!=='playing')return;
gameTime+=dt;

// Player movement
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
if(keyUp)player.y-=PLAYER_SPEED*dt;
if(keyDown)player.y+=PLAYER_SPEED*dt;
// Clamp player to bottom 6 rows
var minPlayerY=gridY(ROWS-6);
player.x=Math.max(0,Math.min(W-player.w,player.x));
player.y=Math.max(minPlayerY,Math.min(H-player.h,player.y));

// Auto-fire
if(keySpace&&gameTime-lastShot>FIRE_RATE){
lastShot=gameTime;bullets.push({x:player.x+player.w/2,y:player.y,w:3,h:10});}

// Bullets
for(var i=bullets.length-1;i>=0;i--){bullets[i].y-=BULLET_SPEED*dt;if(bullets[i].y<-15)bullets.splice(i,1);}

// Bullet-mushroom collision
for(var b=bullets.length-1;b>=0;b--){
for(var m=mushrooms.length-1;m>=0;m--){
var mu=mushrooms[m],bx=bullets[b].x,by=bullets[b].y;
var mx=gridX(mu.col),my=gridY(mu.row);
if(bx>mx&&bx<mx+cellW&&by>my&&by<my+cellH){
mu.hp--;bullets.splice(b,1);
if(mu.hp<=0){mushrooms.splice(m,1);score+=1;addParticles(mx+cellW/2,my+cellH/2,'#ffcc00',6);}
break;}}}

// Centipede movement
centMoveTimer+=dt;
var dm=diffMult();
var moveInterval=Math.max(0.03,(CENT_MOVE_INTERVAL-level*0.003)/dm);
if(centMoveTimer>=moveInterval){
centMoveTimer=0;
for(var c=0;c<centipedes.length;c++){
var segs=centipedes[c];
for(var s=segs.length-1;s>=0;s--){moveCentipede(segs[s],segs,s);}
// Update head status
if(segs.length>0)segs[0].isHead=true;}}

// Bullet-centipede collision
for(var b=bullets.length-1;b>=0;b--){
if(b>=bullets.length)continue;
var bu=bullets[b];var hit=false;
for(var c=centipedes.length-1;c>=0;c--){
var segs=centipedes[c];
for(var s=segs.length-1;s>=0;s--){
var seg=segs[s];
var sx=gridX(seg.col),sy=gridY(seg.row);
if(bu.x>sx&&bu.x<sx+cellW&&bu.y>sy&&bu.y<sy+cellH){
// Score
var pts=seg.isHead?100:10;
score+=pts;
addParticles(sx+cellW/2,sy+cellH/2,'#00ff66',10);
addFloatingScore(sx+cellW/2,sy,pts);
// Create mushroom at segment position
addMushroom(seg.col,seg.row);
// Split centipede
if(s<segs.length-1){
var newSegs=segs.splice(s+1);
if(newSegs.length>0){newSegs[0].isHead=true;centipedes.push(newSegs);}}
segs.splice(s,1);
if(segs.length>0)segs[0].isHead=true;
if(segs.length===0)centipedes.splice(c,1);
bullets.splice(b,1);hit=true;break;}}
if(hit)break;}}

// Bullet-spider collision
if(spider&&spider.alive){
for(var b=bullets.length-1;b>=0;b--){
var bu=bullets[b];
if(rectOverlap(bu.x-2,bu.y-5,4,10,spider.x-spider.size/2,spider.y-spider.size/2,spider.size,spider.size)){
var pts=[300,600,900][Math.floor(Math.random()*3)];
score+=pts;addParticles(spider.x,spider.y,'#ff44ff',15);
addFloatingScore(spider.x,spider.y,pts);
bullets.splice(b,1);spider=null;break;}}}

// Bullet-flea collision
if(flea&&flea.alive){
for(var b=bullets.length-1;b>=0;b--){
var bu=bullets[b];
if(Math.abs(bu.x-flea.x)<cellW/2&&Math.abs(bu.y-flea.y)<cellH){
score+=200;addParticles(flea.x,flea.y,'#ff8800',10);
addFloatingScore(flea.x,flea.y,200);
bullets.splice(b,1);flea=null;break;}}}

// Bullet-scorpion collision
if(scorpion&&scorpion.alive){
for(var b=bullets.length-1;b>=0;b--){
var bu=bullets[b];
if(Math.abs(bu.x-scorpion.x)<cellW&&Math.abs(bu.y-scorpion.y)<cellH){
score+=1000;addParticles(scorpion.x,scorpion.y,'#ff00ff',15);
addFloatingScore(scorpion.x,scorpion.y,1000);
bullets.splice(b,1);scorpion=null;break;}}}

// Centipede-player collision
for(var c=0;c<centipedes.length;c++){
var segs=centipedes[c];
for(var s=0;s<segs.length;s++){
var seg=segs[s];
var sx=gridX(seg.col),sy=gridY(seg.row);
if(rectOverlap(player.x,player.y,player.w,player.h,sx,sy,cellW,cellH)){
lives--;addParticles(player.x+player.w/2,player.y,'#00ccff',20);screenShake=0.4;
player.x=W/2;player.y=H-cellH*2;
if(lives<=0){gameState='gameover';}
c=centipedes.length;break;}}}

// Spider-player collision (wide hitbox for easy mode)
if(spider&&spider.alive){
if(rectOverlap(player.x-5,player.y-5,player.w+10,player.h+10,
spider.x-spider.size/2,spider.y-spider.size/2,spider.size,spider.size)){
lives--;addParticles(player.x+player.w/2,player.y,'#ff44ff',15);
player.x=W/2;player.y=H-cellH*2;
if(lives<=0)gameState='gameover';}}

// Flea-player collision
if(flea&&flea.alive){
if(Math.abs(player.x+player.w/2-flea.x)<cellW&&Math.abs(player.y-flea.y)<cellH){
lives--;addParticles(player.x+player.w/2,player.y,'#ff8800',15);
player.x=W/2;player.y=H-cellH*2;
if(lives<=0)gameState='gameover';}}

// Spider spawn timer (slow for easy mode)
updateSpider(dt);
spiderTimer+=dt;
if(!spider&&spiderTimer>(6+Math.random()*4)/dm){spiderTimer=0;spawnSpider();}

// Flea: spawn when mushroom density in player area is low
updateFlea(dt);
fleaTimer+=dt;
if(!flea&&fleaTimer>8){
var count=0;
for(var i=0;i<mushrooms.length;i++){if(mushrooms[i].row>=ROWS-6)count++;}
if(count<3){fleaTimer=0;spawnFlea();}else{fleaTimer=6;}}

// Scorpion spawn
updateScorpion(dt);
scorpionTimer+=dt;
if(!scorpion&&scorpionTimer>12+Math.random()*5){scorpionTimer=0;spawnScorpion();}

// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}

// Floating scores
for(var i=floatingScores.length-1;i>=0;i--){floatingScores[i].y-=40*dt;floatingScores[i].life-=dt;if(floatingScores[i].life<=0)floatingScores.splice(i,1);}
if(screenShake>0)screenShake-=dt;

// Level clear — all centipedes destroyed
if(centipedes.length===0){
level++;
CENT_MOVE_INTERVAL=Math.max(0.03,0.07-level*0.003);
spawnCentipede();
// Bonus mushrooms
for(var i=0;i<3+level;i++){addMushroom(Math.floor(Math.random()*COLS),2+Math.floor(Math.random()*(ROWS-8)));}
}}

// --- Drawing ---
function drawMushroom(m){
var x=gridX(m.col),y=gridY(m.row),w=cellW,h=cellH;
var colors;
if(m.poisoned){colors=['#ff00ff','#cc00cc','#9900aa','#660066'];}
else{colors=['#00cc44','#aacc00','#ff6600','#ff2200'];}
var color=colors[4-m.hp]||colors[0];
// Stem
ctx.fillStyle='#ddc';
ctx.fillRect(x+w*0.35,y+h*0.5,w*0.3,h*0.5);
// Cap
ctx.fillStyle=color;
ctx.beginPath();
ctx.ellipse(x+w/2,y+h*0.45,w*0.45,h*0.4,0,Math.PI,0);
ctx.fill();
// Cap highlight
ctx.fillStyle='rgba(255,255,255,0.25)';
ctx.beginPath();
ctx.ellipse(x+w*0.38,y+h*0.3,w*0.12,h*0.12,0,0,Math.PI*2);
ctx.fill();
// Spots based on hp
if(m.hp>=3){
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();ctx.arc(x+w*0.6,y+h*0.35,w*0.08,0,Math.PI*2);ctx.fill();}
if(m.hp>=2){
ctx.fillStyle='rgba(255,255,255,0.2)';
ctx.beginPath();ctx.arc(x+w*0.35,y+h*0.4,w*0.06,0,Math.PI*2);ctx.fill();}}

function drawCentipedeSegment(seg){
var x=gridX(seg.col)+cellW*0.1,y=gridY(seg.row)+cellH*0.1;
var w=cellW*0.8,h=cellH*0.8;
if(seg.isHead){
// Head — slightly larger, different color
ctx.fillStyle='#00ff88';
ctx.shadowColor='#00ff88';ctx.shadowBlur=8;
ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w*0.55,h*0.5,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Eyes
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x+w*0.3,y+h*0.35,w*0.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w*0.7,y+h*0.35,w*0.1,0,Math.PI*2);ctx.fill();
// Pupils
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+w*0.32,y+h*0.33,w*0.04,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w*0.72,y+h*0.33,w*0.04,0,Math.PI*2);ctx.fill();
// Antennae
ctx.strokeStyle='#00ff88';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+w*0.25,y);ctx.lineTo(x+w*0.15,y-h*0.3);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w*0.75,y);ctx.lineTo(x+w*0.85,y-h*0.3);ctx.stroke();
// Mandibles
ctx.fillStyle='#00cc66';
ctx.beginPath();ctx.arc(x+w*0.3,y+h*0.7,w*0.08,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w*0.7,y+h*0.7,w*0.08,0,Math.PI*2);ctx.fill();
}else{
// Body
ctx.fillStyle='#22dd55';
ctx.shadowColor='#22dd55';ctx.shadowBlur=4;
ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w*0.45,h*0.4,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Eyes (smaller)
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x+w*0.35,y+h*0.4,w*0.06,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+w*0.65,y+h*0.4,w*0.06,0,Math.PI*2);ctx.fill();
// Legs
ctx.strokeStyle='#22dd55';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x+w*0.15,y+h*0.5);ctx.lineTo(x-w*0.1,y+h*0.8);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w*0.85,y+h*0.5);ctx.lineTo(x+w*1.1,y+h*0.8);ctx.stroke();
}}

function drawSpider(){
if(!spider||!spider.alive)return;
var x=spider.x,y=spider.y,s=spider.size;
// Body
ctx.fillStyle='#ff44ff';ctx.shadowColor='#ff44ff';ctx.shadowBlur=8;
ctx.beginPath();ctx.ellipse(x,y,s*0.35,s*0.25,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Head
ctx.fillStyle='#ff66ff';
ctx.beginPath();ctx.arc(x,y-s*0.2,s*0.18,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-s*0.08,y-s*0.25,s*0.06,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+s*0.08,y-s*0.25,s*0.06,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x-s*0.07,y-s*0.25,s*0.03,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+s*0.09,y-s*0.25,s*0.03,0,Math.PI*2);ctx.fill();
// 8 legs (4 per side)
ctx.strokeStyle='#cc33cc';ctx.lineWidth=1.5;
var legAngles=[0.3,0.7,1.1,1.5];
for(var i=0;i<4;i++){
var a=legAngles[i],wobble=Math.sin(gameTime*8+i)*0.15;
// Left
ctx.beginPath();ctx.moveTo(x-s*0.3,y-s*0.05+i*s*0.08);
ctx.quadraticCurveTo(x-s*0.55,y-s*0.2+i*s*0.15+wobble*s,x-s*0.5,y+s*0.15+i*s*0.06);ctx.stroke();
// Right
ctx.beginPath();ctx.moveTo(x+s*0.3,y-s*0.05+i*s*0.08);
ctx.quadraticCurveTo(x+s*0.55,y-s*0.2+i*s*0.15-wobble*s,x+s*0.5,y+s*0.15+i*s*0.06);ctx.stroke();}}

function drawFlea(){
if(!flea||!flea.alive)return;
var x=flea.x,y=flea.y,s=cellW*0.6;
ctx.fillStyle='#ff8800';ctx.shadowColor='#ff8800';ctx.shadowBlur=6;
ctx.beginPath();ctx.ellipse(x,y,s*0.4,s*0.6,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x-s*0.15,y-s*0.2,s*0.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+s*0.15,y-s*0.2,s*0.1,0,Math.PI*2);ctx.fill();
// Legs
ctx.strokeStyle='#cc6600';ctx.lineWidth=1.5;
var legY=Math.sin(gameTime*12)*s*0.15;
ctx.beginPath();ctx.moveTo(x-s*0.3,y+s*0.3);ctx.lineTo(x-s*0.6,y+s*0.6+legY);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+s*0.3,y+s*0.3);ctx.lineTo(x+s*0.6,y+s*0.6-legY);ctx.stroke();}

function drawScorpion(){
if(!scorpion||!scorpion.alive)return;
var x=scorpion.x,y=scorpion.y,s=cellW;
ctx.fillStyle='#ff00ff';ctx.shadowColor='#ff00ff';ctx.shadowBlur=8;
// Body segments
for(var i=0;i<4;i++){
ctx.beginPath();ctx.ellipse(x-scorpion.dir*i*s*0.3,y,s*0.2,s*0.15,0,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;
// Tail (curved up)
ctx.strokeStyle='#ff00ff';ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(x-scorpion.dir*s*0.9,y);
ctx.quadraticCurveTo(x-scorpion.dir*s*1.2,y-s*0.6,x-scorpion.dir*s*0.9,y-s*0.8);
ctx.stroke();
// Stinger
ctx.fillStyle='#ff4444';
ctx.beginPath();ctx.arc(x-scorpion.dir*s*0.9,y-s*0.8,s*0.08,0,Math.PI*2);ctx.fill();
// Claws
ctx.fillStyle='#ff33ff';
ctx.beginPath();ctx.arc(x+scorpion.dir*s*0.4,y-s*0.2,s*0.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+scorpion.dir*s*0.4,y+s*0.2,s*0.1,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+scorpion.dir*s*0.15,y-s*0.06,s*0.05,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+scorpion.dir*s*0.15,y+s*0.06,s*0.05,0,Math.PI*2);ctx.fill();}

function drawPlayer(){
var x=player.x,y=player.y,w=player.w,h=player.h;
// Base
ctx.fillStyle='#00ccff';ctx.shadowColor='#00ccff';ctx.shadowBlur=6;
ctx.fillRect(x+w*0.1,y+h*0.3,w*0.8,h*0.7);
ctx.shadowBlur=0;
// Barrel
ctx.fillStyle='#00eeff';
ctx.fillRect(x+w*0.4,y,w*0.2,h*0.4);
// Muzzle flash
if(gameTime-lastShot<0.05){
ctx.fillStyle='rgba(255,255,100,0.8)';
ctx.beginPath();ctx.arc(x+w/2,y-2,w*0.15,0,Math.PI*2);ctx.fill();}
// Detail
ctx.fillStyle='rgba(255,255,255,0.2)';
ctx.fillRect(x+w*0.15,y+h*0.35,w*0.7,h*0.15);}

function render(){
ctx.save();
var shk=screenShake>0?screenShake:0;
ctx.translate((Math.random()-0.5)*shk*12,(Math.random()-0.5)*shk*12);
// Background gradient
var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#081808');grad.addColorStop(0.5,'#0a1a0a');grad.addColorStop(1,'#0d220d');
ctx.fillStyle=grad;ctx.fillRect(-5,-5,W+10,H+10);
// Subtle grid
ctx.strokeStyle='rgba(0,255,50,0.03)';ctx.lineWidth=0.5;
for(var x=0;x<W;x+=cellW){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(var y=0;y<H;y+=cellH){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
// Player zone indicator
ctx.fillStyle='rgba(0,100,50,0.05)';
ctx.fillRect(0,gridY(ROWS-6),W,cellH*6);
// Mushrooms
for(var i=0;i<mushrooms.length;i++)drawMushroom(mushrooms[i]);
// Centipedes
for(var c=0;c<centipedes.length;c++){var segs=centipedes[c];for(var s=0;s<segs.length;s++)drawCentipedeSegment(segs[s]);}
// Spider
drawSpider();
// Flea
drawFlea();
// Scorpion
drawScorpion();
// Player
drawPlayer();
// Bullets
ctx.fillStyle='#00ffcc';ctx.shadowColor='#00ffcc';ctx.shadowBlur=6;
for(var i=0;i<bullets.length;i++){var b=bullets[i];ctx.fillRect(b.x-1.5,b.y,3,10);}
ctx.shadowBlur=0;
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// Floating scores
for(var i=0;i<floatingScores.length;i++){var fs=floatingScores[i];ctx.globalAlpha=fs.life;ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(cellW*0.8)+'px "Courier New",monospace';ctx.textAlign='center';ctx.fillText('+'+fs.pts,fs.x,fs.y);ctx.textAlign='left';}
ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#00ccff';ctx.fillRect(10+i*20,H-15,12,8);ctx.fillRect(10+i*20+4,H-19,4,4);}
// Level
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-10);ctx.textAlign='left';
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,20,0,0.5)');ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
ctx.restore();
}

function drawTitle(dt){
ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,W,H);
titlePulse+=dt*3;
// Animated centipede crawling across title
var segments=16;
for(var i=0;i<segments;i++){
var phase=titlePulse*2-i*0.4;
var cx2=W*0.15+i*(W*0.7/segments)+Math.sin(phase)*8;
var cy=H*0.18+Math.cos(phase)*12;
var sz=Math.min(cellW,W*0.025)*0.9;
if(i===0){
ctx.fillStyle='#00ff88';ctx.shadowColor='#00ff88';ctx.shadowBlur=10;
ctx.beginPath();ctx.arc(cx2,cy,sz*1.2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(cx2-sz*0.3,cy-sz*0.2,sz*0.2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cx2+sz*0.3,cy-sz*0.2,sz*0.2,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle='#22dd55';ctx.shadowColor='#22dd55';ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(cx2,cy,sz,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;}}
// Grid background
ctx.strokeStyle='rgba(0,255,50,0.04)';ctx.lineWidth=0.5;
for(var x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(var y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
// Title text
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ff44';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';
ctx.fillStyle='#00ff44';ctx.fillText('CENTIPEDE',W/2,H*0.38);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';ctx.fillStyle='#44ff88';
ctx.fillText('DEFEND THE GARDEN',W/2,H*0.46);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to move, Space to fire',W/2,H*0.67);
// Draw sample enemies
var ey=H*0.78;var gap=W*0.18;var startX=W/2-gap*1.5;
// Mushroom
var mw=W*0.03;
ctx.fillStyle='#ddc';ctx.fillRect(startX-mw*0.15,ey,mw*0.3,mw*0.4);
ctx.fillStyle='#00cc44';ctx.beginPath();ctx.ellipse(startX,ey-mw*0.05,mw*0.45,mw*0.35,0,Math.PI,0);ctx.fill();
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
ctx.fillText('Mushroom',startX-mw,ey+mw*0.8);
// Spider
ctx.fillStyle='#ff44ff';ctx.beginPath();ctx.ellipse(startX+gap,ey,mw*0.4,mw*0.3,0,0,Math.PI*2);ctx.fill();
ctx.fillText('Spider 300-900',startX+gap-mw*1.2,ey+mw*0.8);
// Flea
ctx.fillStyle='#ff8800';ctx.beginPath();ctx.ellipse(startX+gap*2,ey,mw*0.3,mw*0.4,0,0,Math.PI*2);ctx.fill();
ctx.fillText('Flea 200',startX+gap*2-mw*0.6,ey+mw*0.8);
// Scorpion
ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.ellipse(startX+gap*3,ey,mw*0.4,mw*0.25,0,0,Math.PI*2);ctx.fill();
ctx.fillText('Scorpion 1000',startX+gap*3-mw*1.1,ey+mw*0.8);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){drawTitle(dt);titlePulse+=dt;}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(gameState!=='playing'&&down&&(e.key==='Enter'||e.key==='Tab')){resetGame();}
if(gameState!=='playing'){
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
return;}
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keySpace=down;
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initCentipede=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopCentipede=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;};
})();
