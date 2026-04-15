// Ghosts 'n Goblins — Platformer with armor system
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
var player,lances=[],enemies=[],particles=[],platforms=[];
var keyLeft=false,keyRight=false,keyUp=false,keySpace=false;
var PLAYER_SPEED=200,JUMP_VEL=-420,GRAVITY=700,LANCE_SPEED=350;
var lastShot=0,SHOOT_CD=0.4;
var scrollX=0,worldWidth=3000;
var groundY,stars=[];
var invincTimer=0;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
groundY=H*0.82;
initStars();
}

function initStars(){
stars=[];
for(var i=0;i<50;i++)stars.push({x:Math.random()*W,y:Math.random()*H*0.5,s:0.5+Math.random()*1.5,b:0.3+Math.random()*0.7});
}

function generateLevel(){
platforms=[];enemies=[];
worldWidth=2000+level*1000;

// Ground platforms with gaps
var px=0;
while(px<worldWidth){
var pw=120+Math.random()*200;
platforms.push({x:px,y:groundY,w:pw,h:40,type:'ground'});
px+=pw+40+Math.random()*40;
}

// Elevated platforms
for(var i=0;i<15+level*3;i++){
var ex=200+Math.random()*(worldWidth-400);
var ey=groundY-60-Math.random()*120;
platforms.push({x:ex,y:ey,w:60+Math.random()*80,h:12,type:'floating'});
}

// Enemies
var enemyCount=10+level*5;
for(var i=0;i<enemyCount;i++){
var ex2=200+Math.random()*(worldWidth-300);
var type=Math.random()<0.4?'zombie':Math.random()<0.6?'ghost':'demon';
enemies.push({
x:ex2,y:type==='ghost'?groundY-80-Math.random()*60:groundY-30,
w:24,h:30,type:type,alive:true,hp:type==='demon'?2:1,
speed:type==='zombie'?40+Math.random()*30:type==='ghost'?60+Math.random()*40:50,
vy:0,grounded:type!=='ghost',
frame:0,dir:Math.random()<0.5?-1:1,
patrolStart:ex2-60,patrolEnd:ex2+60,
floatY:type==='ghost'?groundY-80-Math.random()*60:0,floatPhase:Math.random()*Math.PI*2
});
}
}

function resetGame(){
player={x:50,y:groundY-40,w:22,h:32,vy:0,grounded:false,facing:1,
armor:2,frame:0,frameTimer:0,attacking:false,attackTimer:0};
lances=[];particles=[];
score=0;lives=3;level=1;gameTime=0;scrollX=0;invincTimer=0;
generateLevel();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=40+Math.random()*150;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2.5});
}}

function isOnPlatform(ex,ey,ew,eh){
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(ex+ew>p.x&&ex<p.x+p.w&&ey+eh>=p.y&&ey+eh<=p.y+8){
return p.y;
}
}
return null;
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);

// Player movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.facing=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.facing=1;}
player.x=Math.max(0,Math.min(worldWidth-player.w,player.x));

// Jump
if(keyUp&&player.grounded){
player.vy=JUMP_VEL;
player.grounded=false;
}

// Gravity
player.vy+=GRAVITY*dt;
player.y+=player.vy*dt;

// Platform collision
player.grounded=false;
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(player.x+player.w>p.x&&player.x<p.x+p.w){
if(player.vy>=0&&player.y+player.h>=p.y&&player.y+player.h<=p.y+20){
player.y=p.y-player.h;
player.vy=0;
player.grounded=true;
}
}
}

// Fall off screen
if(player.y>H+50){
takeDamage();
player.x=scrollX+50;player.y=groundY-80;player.vy=0;
}

// Scrolling
var targetScroll=player.x-W*0.3;
scrollX+=(targetScroll-scrollX)*0.1;
scrollX=Math.max(0,Math.min(worldWidth-W,scrollX));

// Shooting
lastShot+=dt;
if(keySpace&&lastShot>=SHOOT_CD){
lastShot=0;
player.attacking=true;player.attackTimer=0.15;
lances.push({x:player.x+player.w/2+player.facing*10,y:player.y+player.h*0.3,
vx:player.facing*LANCE_SPEED,w:18,h:4,life:1.5});
}
if(player.attacking){
player.attackTimer-=dt;
if(player.attackTimer<=0)player.attacking=false;
}

// Update lances
for(var i=lances.length-1;i>=0;i--){
lances[i].x+=lances[i].vx*dt;lances[i].life-=dt;
if(lances[i].life<=0)lances.splice(i,1);
}

// Invincibility
if(invincTimer>0)invincTimer-=dt;

// Update enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];if(!e.alive)continue;
e.frame++;

if(e.type==='ghost'){
// Float and drift toward player - difficulty scales aggression
e.floatPhase+=dt*(level<=2?1.5:2*diffMult);
e.y=e.floatY+Math.sin(e.floatPhase)*20;
var dx=player.x-e.x;
var chaseRange=level<=2?200:300*diffMult;
if(Math.abs(dx)<chaseRange)e.x+=Math.sign(dx)*e.speed*(level<=2?0.6:diffMult)*dt;
} else {
// Patrol - difficulty scales speed
e.x+=e.dir*e.speed*(level<=2?0.7:diffMult)*dt;
if(e.x<=e.patrolStart||e.x>=e.patrolEnd)e.dir*=-1;
// Gravity for ground enemies
if(!e.grounded){
e.vy=(e.vy||0)+GRAVITY*dt;
e.y+=(e.vy||0)*dt;
}
var platY=isOnPlatform(e.x,e.y,e.w,e.h);
if(platY!==null){e.y=platY-e.h;e.vy=0;e.grounded=true;}
}

// Lance-enemy collision
for(var j=lances.length-1;j>=0;j--){
var l=lances[j];
if(l.x+l.w>e.x&&l.x<e.x+e.w&&l.y+l.h>e.y&&l.y<e.y+e.h){
e.hp--;lances.splice(j,1);
if(e.hp<=0){
e.alive=false;
var pts=e.type==='zombie'?100:e.type==='ghost'?200:300;
score+=pts;
var cols=e.type==='zombie'?['#88aa66','#668844']:e.type==='ghost'?['#8888ff','#aaaaff']:['#ff4444','#ff8844'];
addParticles(e.x+e.w/2,e.y+e.h/2,cols[0],8);
addParticles(e.x+e.w/2,e.y+e.h/2,cols[1],6);
}
break;
}
}

// Enemy-player collision
if(e.alive&&invincTimer<=0){
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
takeDamage();
}
}
}

// Level completion
if(player.x>worldWidth-100){
level++;score+=2000;
scrollX=0;
generateLevel();
player.x=50;player.y=groundY-80;player.vy=0;
player.armor=2;
}

// Particles
for(var i=particles.length-1;i>=0;i--){
particles[i].x+=particles[i].vx*dt;particles[i].y+=particles[i].vy*dt;
particles[i].vy+=200*dt;
particles[i].life-=dt;if(particles[i].life<=0)particles.splice(i,1);
}
}

function takeDamage(){
if(invincTimer>0)return;
player.armor--;
invincTimer=1.5;
if(player.armor<0){
lives--;
addParticles(player.x+player.w/2,player.y+player.h/2,'#ffccaa',15);
if(lives<=0){gameState='gameover';return;}
player.armor=2;
player.x=scrollX+50;player.y=groundY-80;player.vy=0;
} else if(player.armor===0){
// Lost armor - spawn armor pieces flying off
addParticles(player.x+player.w/2,player.y+player.h/2,'#888',10);
addParticles(player.x+player.w/2,player.y+player.h/2,'#aaa',8);
} else {
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff8800',6);
}
}

function drawKnight(x,y,w,h,facing,armor){
ctx.save();
var sx=x-scrollX;
// Flicker when invincible
if(invincTimer>0&&Math.sin(invincTimer*20)>0){ctx.globalAlpha=0.4;}

if(armor>=2){
// Full armor
ctx.fillStyle='#8888cc';
ctx.fillRect(sx+2,sy2(y)+2,w-4,h*0.6);
ctx.fillStyle='#9999dd';
ctx.fillRect(sx+4,sy2(y)+4,w-8,h*0.4);
// Helmet
ctx.fillStyle='#7777bb';
ctx.beginPath();ctx.arc(sx+w/2,sy2(y)+6,8,Math.PI,0);ctx.fill();
ctx.fillRect(sx+w/2-8,sy2(y)+2,16,8);
// Visor
ctx.fillStyle='#333';
ctx.fillRect(sx+w/2-4+facing*2,sy2(y)+5,6,3);
} else if(armor===1){
// Damaged armor
ctx.fillStyle='#887766';
ctx.fillRect(sx+3,sy2(y)+4,w-6,h*0.5);
ctx.fillStyle='#ffccaa';
ctx.beginPath();ctx.arc(sx+w/2,sy2(y)+6,6,0,Math.PI*2);ctx.fill();
} else {
// No armor - just boxers
ctx.fillStyle='#ffccaa';
ctx.beginPath();ctx.arc(sx+w/2,sy2(y)+6,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffccaa';
ctx.fillRect(sx+4,sy2(y)+10,w-8,h*0.3);
ctx.fillStyle='#dd4444';
ctx.fillRect(sx+4,sy2(y)+h*0.5,w-8,h*0.2);
}
// Legs
ctx.fillStyle=armor>=2?'#6666aa':'#ffccaa';
ctx.fillRect(sx+3,sy2(y)+h*0.65,6,h*0.35);
ctx.fillRect(sx+w-9,sy2(y)+h*0.65,6,h*0.35);

ctx.globalAlpha=1;ctx.restore();
}

function sy2(y){return y;} // placeholder for screen Y

function render(){
// Sky gradient - graveyard theme
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#0a0015');sky.addColorStop(0.5,'#1a0030');sky.addColorStop(1,'#220020');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Moon with detailed craters and glow
ctx.save();
ctx.shadowColor='#ffddaa';ctx.shadowBlur=50;
var moonGrad=ctx.createRadialGradient(W*0.8-5,H*0.15-5,5,W*0.8,H*0.15,32);
moonGrad.addColorStop(0,'#ffffee');moonGrad.addColorStop(0.6,'#ffeecc');moonGrad.addColorStop(1,'#ccaa88');
ctx.fillStyle=moonGrad;
ctx.beginPath();ctx.arc(W*0.8,H*0.15,30,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
// Moon craters
ctx.fillStyle='rgba(180,160,120,0.3)';
ctx.beginPath();ctx.arc(W*0.8-8,H*0.15-5,6,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(W*0.8+10,H*0.15+8,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(W*0.8+3,H*0.15-10,3,0,Math.PI*2);ctx.fill();
// Moon halo
ctx.strokeStyle='rgba(255,220,170,0.1)';ctx.lineWidth=8;
ctx.beginPath();ctx.arc(W*0.8,H*0.15,42,0,Math.PI*2);ctx.stroke();
ctx.restore();

// Stars
for(var i=0;i<stars.length;i++){
var s=stars[i];
var alpha=s.b*(0.5+0.5*Math.sin(gameTime*1.5+i*0.3));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
}

// Gravestones in background
for(var g=0;g<8;g++){
var gx=g*200-scrollX*0.3;
while(gx<-60)gx+=1600;
if(gx>W+60)continue;
ctx.fillStyle='#333344';
ctx.fillRect(gx,groundY-25,20,25);
ctx.beginPath();ctx.arc(gx+10,groundY-25,10,Math.PI,0);ctx.fill();
}

// Platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
var px2=p.x-scrollX;
if(px2<-p.w||px2>W+p.w)continue;
if(p.type==='ground'){
var gGrad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);
gGrad.addColorStop(0,'#444422');gGrad.addColorStop(1,'#222211');
ctx.fillStyle=gGrad;
ctx.fillRect(px2,p.y,p.w,p.h);
ctx.fillStyle='#556633';
ctx.fillRect(px2,p.y,p.w,4);
} else {
ctx.fillStyle='#555566';
ctx.fillRect(px2,p.y,p.w,p.h);
ctx.fillStyle='#666677';
ctx.fillRect(px2,p.y,p.w,3);
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
var ex=e.x-scrollX;
if(ex<-40||ex>W+40)continue;
ctx.save();
if(e.type==='zombie'){
ctx.fillStyle='#668844';
ctx.fillRect(ex+4,e.y+4,e.w-8,e.h-8);
ctx.fillStyle='#88aa66';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+6,7,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.arc(ex+e.w/2-3,e.y+5,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+e.w/2+3,e.y+5,2,0,Math.PI*2);ctx.fill();
// Arms
ctx.strokeStyle='#668844';ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(ex+2,e.y+12);ctx.lineTo(ex-6,e.y+16);ctx.stroke();
ctx.beginPath();ctx.moveTo(ex+e.w-2,e.y+12);ctx.lineTo(ex+e.w+6,e.y+16);ctx.stroke();
} else if(e.type==='ghost'){
ctx.globalAlpha=0.7;
ctx.fillStyle='#aaaaff';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h/3,e.w/2,Math.PI,0);
ctx.lineTo(ex+e.w,e.y+e.h);
for(var s=0;s<3;s++){
ctx.lineTo(ex+e.w-s*(e.w/3)-e.w/6,e.y+e.h-6);
ctx.lineTo(ex+e.w-(s+1)*(e.w/3),e.y+e.h);
}
ctx.closePath();ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(ex+e.w*0.35,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+e.w*0.65,e.y+e.h*0.3,3,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;
} else {
ctx.fillStyle='#cc2222';
ctx.fillRect(ex+2,e.y+2,e.w-4,e.h-4);
ctx.fillStyle='#ff4444';
ctx.fillRect(ex+5,e.y+5,e.w-10,e.h-10);
// Horns
ctx.fillStyle='#cc2222';
ctx.beginPath();ctx.moveTo(ex+4,e.y+2);ctx.lineTo(ex,e.y-8);ctx.lineTo(ex+10,e.y+2);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(ex+e.w-4,e.y+2);ctx.lineTo(ex+e.w,e.y-8);ctx.lineTo(ex+e.w-10,e.y+2);ctx.closePath();ctx.fill();
// Wings
ctx.fillStyle='rgba(200,20,20,0.5)';
ctx.beginPath();ctx.moveTo(ex,e.y+8);ctx.lineTo(ex-10,e.y-2);ctx.lineTo(ex+5,e.y+14);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(ex+e.w,e.y+8);ctx.lineTo(ex+e.w+10,e.y-2);ctx.lineTo(ex+e.w-5,e.y+14);ctx.closePath();ctx.fill();
}
ctx.restore();
}

// Player
var px3=player.x-scrollX;
ctx.save();
if(invincTimer>0&&Math.sin(invincTimer*20)>0)ctx.globalAlpha=0.4;

if(player.armor>=2){
// Full armor
var aGrad=ctx.createLinearGradient(px3,player.y,px3,player.y+player.h);
aGrad.addColorStop(0,'#9999cc');aGrad.addColorStop(1,'#6666aa');
ctx.fillStyle=aGrad;
ctx.fillRect(px3+2,player.y+8,player.w-4,player.h*0.55);
ctx.fillStyle='#8888bb';
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+8,9,Math.PI,0);ctx.fill();
ctx.fillRect(px3+player.w/2-9,player.y+4,18,8);
ctx.fillStyle='#333';
ctx.fillRect(px3+player.w/2-4+player.facing*2,player.y+7,6,3);
} else if(player.armor===1){
ctx.fillStyle='#aa8866';
ctx.fillRect(px3+3,player.y+10,player.w-6,player.h*0.4);
ctx.fillStyle='#ffccaa';
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+8,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#333';ctx.beginPath();
ctx.arc(px3+player.w/2+player.facing*2,player.y+7,1.5,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle='#ffccaa';
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+8,7,0,Math.PI*2);ctx.fill();
ctx.fillRect(px3+4,player.y+14,player.w-8,player.h*0.3);
ctx.fillStyle='#cc4444';
ctx.fillRect(px3+4,player.y+player.h*0.55,player.w-8,player.h*0.2);
}
// Legs
ctx.fillStyle=player.armor>=2?'#6666aa':'#ffccaa';
ctx.fillRect(px3+3,player.y+player.h*0.7,6,player.h*0.3);
ctx.fillRect(px3+player.w-9,player.y+player.h*0.7,6,player.h*0.3);

ctx.globalAlpha=1;ctx.restore();

// Lances
ctx.fillStyle='#cccccc';ctx.shadowColor='#ffffff';ctx.shadowBlur=4;
for(var i=0;i<lances.length;i++){
var l=lances[i];
var lx=l.x-scrollX;
ctx.fillRect(lx,l.y,l.w,l.h);
// Lance tip
ctx.fillStyle='#ffffff';
ctx.beginPath();
var tipDir=l.vx>0?1:-1;
ctx.moveTo(lx+(tipDir>0?l.w:0),l.y-2);
ctx.lineTo(lx+(tipDir>0?l.w+8:0-8),l.y+l.h/2);
ctx.lineTo(lx+(tipDir>0?l.w:0),l.y+l.h+2);
ctx.closePath();ctx.fill();
ctx.fillStyle='#cccccc';
}
ctx.shadowBlur=0;

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life/p.maxLife;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x-scrollX,p.y,p.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Armor indicator
ctx.fillStyle='#fff';ctx.font='12px "Courier New",monospace';
var armorText=player.armor>=2?'FULL ARMOR':player.armor===1?'DAMAGED':'NO ARMOR!';
var armorColor=player.armor>=2?'#8888cc':player.armor===1?'#ffaa44':'#ff4444';
ctx.fillStyle=armorColor;ctx.fillText(armorText,10,20);

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#8888cc';
ctx.fillRect(10+i*20,28,14,14);
ctx.fillStyle='#6666aa';
ctx.beginPath();ctx.arc(10+i*20+7,30,5,Math.PI,0);ctx.fill();
}

// Progress bar
var progress=player.x/worldWidth;
var barW=100,barH=6;
ctx.fillStyle='#333';ctx.fillRect(W-barW-10,10,barW,barH);
ctx.fillStyle='#44ff44';ctx.fillRect(W-barW-10,10,barW*progress,barH);
ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.strokeRect(W-barW-10,10,barW,barH);
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#0a0015');sky.addColorStop(1,'#220020');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Gravestones
for(var g=0;g<6;g++){
var gx2=W*0.1+g*(W*0.15);
ctx.fillStyle='#333344';
ctx.fillRect(gx2,H*0.65,20,30);
ctx.beginPath();ctx.arc(gx2+10,H*0.65,10,Math.PI,0);ctx.fill();
}

// Ground
ctx.fillStyle='#333322';ctx.fillRect(0,H*0.68,W,H*0.32);

for(var i=0;i<stars.length;i++){
var alpha=stars[i].b*(0.5+0.5*Math.sin(titlePulse+i));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(stars[i].x,stars[i].y,stars[i].s,0,Math.PI*2);ctx.fill();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff2200';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillStyle='#ff4433';
ctx.fillText("GHOSTS'N GOBLINS",W/2,H*0.25);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#aa6644';
ctx.fillText('THE GRAVEYARD AWAITS',W/2,H*0.34);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.5);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT: Move | UP: Jump | SPACE: Throw Lance',W/2,H*0.58);
ctx.fillText('2-hit armor: first hit removes armor, second hit kills!',W/2,H*0.63);
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
if(e.key===' ')keySpace=down;
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

window.initGhostsNGoblins=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keySpace=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopGhostsNGoblins=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keySpace=false;
};
})();
