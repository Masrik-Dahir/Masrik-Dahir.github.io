// Mega Man — Platformer with shooting and charge shot
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
var player,bullets=[],enemies=[],particles=[],platforms=[];
var keyLeft=false,keyRight=false,keyUp=false,keySpace=false;
var PLAYER_SPEED=220,JUMP_VEL=-400,GRAVITY=680,BULLET_SPEED=400;
var chargeTime=0,charging=false,maxCharge=1.5;
var scrollX=0,worldWidth=3000;
var groundY,stars=[];
var invincTimer=0;
var boss=null,bossActive=false;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
groundY=H*0.85;
}

function generateLevel(){
platforms=[];enemies=[];boss=null;bossActive=false;
worldWidth=2500+level*800;

// Ground
platforms.push({x:0,y:groundY,w:worldWidth,h:50,type:'ground'});

// Platforms - industrial theme
for(var i=0;i<20+level*5;i++){
var px2=100+Math.random()*(worldWidth-400);
var py=groundY-50-Math.random()*150;
var pw=50+Math.random()*100;
platforms.push({x:px2,y:py,w:pw,h:10,type:'metal'});
}

// Gaps in ground
for(var i=0;i<5+level;i++){
var gapX=300+i*(worldWidth/8);
var gapW=50+Math.random()*40;
// Replace ground section with gap
platforms.push({x:gapX,y:groundY,w:gapW,h:50,type:'gap'});
}

// Enemies
var enemyCount=8+level*4;
for(var i=0;i<enemyCount;i++){
var ex2=150+Math.random()*(worldWidth-400);
var type=Math.random()<0.4?'met':Math.random()<0.7?'sniper':'flyer';
enemies.push({
x:ex2,y:type==='flyer'?groundY-80-Math.random()*60:groundY-24,
w:20,h:20,type:type,alive:true,hp:type==='sniper'?2:1,
speed:type==='met'?0:type==='sniper'?50:80+Math.random()*40,
dir:Math.random()<0.5?-1:1,
frame:0,shootTimer:2+Math.random()*3,
shielded:type==='met',shieldTimer:2+Math.random()*2,
vy:0,floatPhase:Math.random()*Math.PI*2
});
}

// Boss at end
boss={x:worldWidth-200,y:groundY-80,w:60,h:70,hp:10+level*3,maxHp:10+level*3,
alive:true,phase:0,phaseTimer:0,shootTimer:0,
pattern:0,vy:0,baseY:groundY-80};
}

function resetGame(){
player={x:50,y:groundY-30,w:20,h:28,vy:0,grounded:false,facing:1,
frame:0,frameTimer:0};
bullets=[];particles=[];
score=0;lives=3;level=1;gameTime=0;scrollX=0;
chargeTime=0;charging=false;invincTimer=0;
generateLevel();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2,sp=40+Math.random()*150;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
life:0.3+Math.random()*0.5,maxLife:0.3+Math.random()*0.5,color:color,size:1+Math.random()*2.5});
}}

function shoot(charge){
var size=charge>=maxCharge*0.8?3:charge>=maxCharge*0.4?2:1;
var dmg=size;
var speed=BULLET_SPEED+(size-1)*50;
bullets.push({
x:player.x+player.w/2+player.facing*10,
y:player.y+player.h*0.35,
vx:player.facing*speed,vy:0,
w:size===3?14:size===2?10:6,
h:size===3?10:size===2?7:4,
damage:dmg,size:size,life:1.5,
color:size===3?'#00ffff':size===2?'#44aaff':'#ffff00'
});
if(size===3)addParticles(player.x+player.w/2,player.y+player.h/2,'#00ffff',8);
}

function update(dt){
gameTime+=dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);

// Movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.facing=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.facing=1;}
player.x=Math.max(scrollX,Math.min(worldWidth-player.w,player.x));

// Jump
if(keyUp&&player.grounded){
player.vy=JUMP_VEL;player.grounded=false;
}

// Charging
if(keySpace){
if(!charging){charging=true;chargeTime=0;}
chargeTime+=dt;
} else if(charging){
shoot(chargeTime);
charging=false;chargeTime=0;
}

// Gravity
player.vy+=GRAVITY*dt;
player.y+=player.vy*dt;

// Platform collision
player.grounded=false;
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
if(p.type==='gap')continue;
if(player.x+player.w>p.x&&player.x<p.x+p.w){
if(player.vy>=0&&player.y+player.h>=p.y&&player.y+player.h<=p.y+15){
player.y=p.y-player.h;player.vy=0;player.grounded=true;
}
}
}

// Fall
if(player.y>H+50){
lives--;invincTimer=1.5;
if(lives<=0){gameState='gameover';return;}
player.x=Math.max(scrollX+50,player.x-200);player.y=groundY-80;player.vy=0;
}

// Scroll
var targetScroll=player.x-W*0.35;
scrollX+=(targetScroll-scrollX)*0.08;
scrollX=Math.max(0,Math.min(worldWidth-W,scrollX));

// Bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0||b.x<scrollX-20||b.x>scrollX+W+20)bullets.splice(i,1);
}

if(invincTimer>0)invincTimer-=dt;

// Enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];if(!e.alive)continue;
e.frame++;

if(e.type==='met'){
e.shieldTimer-=dt;
if(e.shieldTimer<=0){e.shielded=!e.shielded;e.shieldTimer=1.5+Math.random()*2;}
} else if(e.type==='flyer'){
e.floatPhase+=dt*3;
e.y=e.y+Math.sin(e.floatPhase)*0.5;
var dx=player.x-e.x;
if(Math.abs(dx)<250)e.x+=Math.sign(dx)*e.speed*dt;
} else {
e.x+=e.dir*e.speed*dt;
if(Math.abs(e.x-player.x)>400)e.dir=Math.sign(player.x-e.x);
}

// Enemy shooting - difficulty scales fire rate and bullet speed
e.shootTimer-=dt;
var eShootInterval=level<=2?3+Math.random()*4:2+Math.random()*3;
if(e.shootTimer<=0&&!e.shielded){
e.shootTimer=eShootInterval;
var dx2=player.x-e.x;
var bvx=Math.sign(dx2)*(level<=2?130:180*diffMult);
particles.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:bvx,vy:0,
life:2,maxLife:2,color:'#ff4444',size:4});
}

// Bullet hit
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.x+b.w>e.x&&b.x<e.x+e.w&&b.y+b.h>e.y&&b.y<e.y+e.h){
if(e.type==='met'&&e.shielded){
addParticles(b.x,b.y,'#888',3);
bullets.splice(j,1);
} else {
e.hp-=b.damage;bullets.splice(j,1);
if(e.hp<=0){
e.alive=false;score+=e.type==='met'?100:e.type==='sniper'?200:150;
addParticles(e.x+e.w/2,e.y+e.h/2,'#ff8800',10);
addParticles(e.x+e.w/2,e.y+e.h/2,'#ffff00',6);
}
}
break;
}
}

// Enemy-player collision
if(e.alive&&invincTimer<=0){
if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
lives--;invincTimer=1.5;
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff0000',12);
if(lives<=0){gameState='gameover';return;}
player.vy=-200;
}
}
}

// Enemy projectile collision (red particles size >=4)
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
if(p.color==='#ff4444'&&p.size>=4&&invincTimer<=0){
if(Math.abs(p.x-player.x-player.w/2)<15&&Math.abs(p.y-player.y-player.h/2)<20){
lives--;invincTimer=1.5;particles.splice(i,1);
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff0000',10);
if(lives<=0){gameState='gameover';return;}
}
}
}

// Boss
if(boss&&boss.alive&&player.x>boss.x-300){
bossActive=true;
boss.phaseTimer+=dt;
boss.shootTimer-=dt;

// Boss movement
boss.phase=Math.floor(boss.phaseTimer/3)%3;
if(boss.phase===0){
boss.y=boss.baseY+Math.sin(boss.phaseTimer*2)*40;
} else if(boss.phase===1){
boss.x+=Math.sin(boss.phaseTimer*3)*60*dt;
} else {
boss.y+=(player.y-boss.y)*0.5*dt;
}

// Boss shooting - difficulty scales boss fire rate
var bossShootRate=level<=2?1.2:0.8/diffMult;
if(boss.shootTimer<=0){
boss.shootTimer=bossShootRate;
var bdx=player.x-boss.x;
var bdy=player.y-boss.y;
var bdist=Math.sqrt(bdx*bdx+bdy*bdy);
var bossBulletSpeed=level<=2?140:200*diffMult;
if(bdist>0){
particles.push({x:boss.x,y:boss.y+boss.h/2,
vx:bdx/bdist*bossBulletSpeed,vy:bdy/bdist*bossBulletSpeed,
life:3,maxLife:3,color:'#ff4444',size:5});
}
}

// Bullet hit boss
for(var j=bullets.length-1;j>=0;j--){
var b=bullets[j];
if(b.x+b.w>boss.x&&b.x<boss.x+boss.w&&b.y+b.h>boss.y&&b.y<boss.y+boss.h){
boss.hp-=b.damage;bullets.splice(j,1);
addParticles(b.x,b.y,'#ffcc00',5);
if(boss.hp<=0){
boss.alive=false;bossActive=false;
score+=5000;
addParticles(boss.x+boss.w/2,boss.y+boss.h/2,'#ff8800',25);
addParticles(boss.x+boss.w/2,boss.y+boss.h/2,'#ffff00',20);
addParticles(boss.x+boss.w/2,boss.y+boss.h/2,'#ffffff',15);
// Next level
level++;scrollX=0;
player.x=50;player.y=groundY-80;player.vy=0;
generateLevel();
}
break;
}
}

// Boss-player collision
if(boss.alive&&invincTimer<=0){
if(player.x+player.w>boss.x&&player.x<boss.x+boss.w&&
player.y+player.h>boss.y&&player.y<boss.y+boss.h){
lives--;invincTimer=1.5;
addParticles(player.x+player.w/2,player.y+player.h/2,'#ff0000',15);
if(lives<=0){gameState='gameover';return;}
player.vy=-250;
}
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p2=particles[i];p2.x+=p2.vx*dt;p2.y+=p2.vy*dt;
if(p2.color!=='#ff4444'||p2.size<4)p2.life-=dt;
else p2.life-=dt*0.5;
if(p2.life<=0)particles.splice(i,1);
}
}

function render(){
// Industrial sky
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#001133');sky.addColorStop(0.6,'#002244');sky.addColorStop(1,'#003355');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Background buildings with enhanced detail
for(var b=0;b<10;b++){
var bx=b*180-scrollX*0.15;
while(bx<-120)bx+=1800;
if(bx>W+120)continue;
var bh=60+b*15;
// Building gradient
var bldGrad=ctx.createLinearGradient(bx,groundY-bh,bx,groundY);
bldGrad.addColorStop(0,'#1a2d44');bldGrad.addColorStop(1,'#0d1a2a');
ctx.fillStyle=bldGrad;
ctx.fillRect(bx,groundY-bh,80,bh);
// Building top edge
ctx.fillStyle='#223355';ctx.fillRect(bx-2,groundY-bh,84,3);
// Windows with warm glow
for(var wy=groundY-bh+8;wy<groundY-10;wy+=16){
for(var wx=bx+8;wx<bx+72;wx+=18){
var lit=(b*3+Math.floor(wy/16)+Math.floor(wx/18))%3!==0;
ctx.fillStyle=lit?'rgba(255,220,120,0.25)':'#1a2233';
ctx.fillRect(wx,wy,8,8);
if(lit){ctx.fillStyle='rgba(255,220,120,0.1)';ctx.fillRect(wx-1,wy-1,10,10);}
}
}
// Building side shadow
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(bx+70,groundY-bh,10,bh);
}

// Platforms
for(var i=0;i<platforms.length;i++){
var p=platforms[i];
var px2=p.x-scrollX;
if(px2>W+10||px2+p.w<-10)continue;
if(p.type==='gap')continue;
if(p.type==='ground'){
var gGrad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);
gGrad.addColorStop(0,'#445566');gGrad.addColorStop(1,'#223344');
ctx.fillStyle=gGrad;ctx.fillRect(px2,p.y,p.w,p.h);
ctx.fillStyle='#556677';ctx.fillRect(px2,p.y,p.w,3);
} else {
ctx.fillStyle='#667788';ctx.fillRect(px2,p.y,p.w,p.h);
ctx.fillStyle='#778899';ctx.fillRect(px2,p.y,p.w,2);
// Rivets
ctx.fillStyle='#556677';
ctx.beginPath();ctx.arc(px2+5,p.y+5,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(px2+p.w-5,p.y+5,2,0,Math.PI*2);ctx.fill();
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];if(!e.alive)continue;
var ex=e.x-scrollX;
if(ex<-40||ex>W+40)continue;
ctx.save();
if(e.type==='met'){
if(e.shielded){
ctx.fillStyle='#ffaa00';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h/2,e.w/2+2,Math.PI,0);ctx.fill();
ctx.fillStyle='#cc8800';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h*0.6,e.w/3,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle='#ffcc44';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h*0.6,e.w/3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(ex+e.w/2-2,e.y+e.h*0.5,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ex+e.w/2+2,e.y+e.h*0.5,2,0,Math.PI*2);ctx.fill();
}
} else if(e.type==='sniper'){
ctx.fillStyle='#cc4444';
ctx.fillRect(ex+2,e.y+2,e.w-4,e.h-4);
ctx.fillStyle='#ff6666';
ctx.fillRect(ex+4,e.y+4,e.w-8,6);
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+7,2,0,Math.PI*2);ctx.fill();
// Gun
ctx.fillStyle='#888';
ctx.fillRect(ex-4,e.y+e.h/2-2,e.w+8,4);
} else {
// Flyer
ctx.fillStyle='#44aaff';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h/2,e.w/2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#66ccff';
ctx.beginPath();ctx.arc(ex+e.w/2,e.y+e.h/2,e.w/3,0,Math.PI*2);ctx.fill();
// Propeller
ctx.strokeStyle='#aaa';ctx.lineWidth=2;
var pa=gameTime*15;
ctx.beginPath();ctx.moveTo(ex+e.w/2-8*Math.cos(pa),e.y-2);
ctx.lineTo(ex+e.w/2+8*Math.cos(pa),e.y-2);ctx.stroke();
}
ctx.restore();
}

// Boss
if(boss&&boss.alive&&bossActive){
var bx2=boss.x-scrollX;
ctx.save();
// Boss body
var bGrad=ctx.createLinearGradient(bx2,boss.y,bx2,boss.y+boss.h);
bGrad.addColorStop(0,'#cc2222');bGrad.addColorStop(1,'#881111');
ctx.fillStyle=bGrad;
ctx.fillRect(bx2,boss.y,boss.w,boss.h);
// Boss face
ctx.fillStyle='#ff4444';
ctx.fillRect(bx2+8,boss.y+8,boss.w-16,boss.h*0.4);
// Eyes
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(bx2+18,boss.y+20,6,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(bx2+boss.w-18,boss.y+20,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.arc(bx2+18,boss.y+20,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(bx2+boss.w-18,boss.y+20,3,0,Math.PI*2);ctx.fill();
// HP bar
var bhpW=boss.w+10;
ctx.fillStyle='#333';ctx.fillRect(bx2-5,boss.y-12,bhpW,6);
ctx.fillStyle='#ff0000';ctx.fillRect(bx2-5,boss.y-12,bhpW*(boss.hp/boss.maxHp),6);
ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.strokeRect(bx2-5,boss.y-12,bhpW,6);
// Glow
ctx.shadowColor='#ff2222';ctx.shadowBlur=15;
ctx.strokeStyle='#ff4444';ctx.lineWidth=2;
ctx.strokeRect(bx2-2,boss.y-2,boss.w+4,boss.h+4);
ctx.shadowBlur=0;
ctx.restore();
}

// Player (Mega Man style - blue)
var px3=player.x-scrollX;
ctx.save();
if(invincTimer>0&&Math.sin(invincTimer*20)>0)ctx.globalAlpha=0.4;
// Body
var pGrad=ctx.createLinearGradient(px3,player.y,px3,player.y+player.h);
pGrad.addColorStop(0,'#4488ff');pGrad.addColorStop(1,'#2255cc');
ctx.fillStyle=pGrad;
ctx.fillRect(px3+2,player.y+8,player.w-4,player.h*0.5);
// Head/helmet
ctx.fillStyle='#4488ff';
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+8,9,0,Math.PI*2);ctx.fill();
// Helmet highlight
ctx.fillStyle='#66aaff';
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+5,6,Math.PI+0.3,Math.PI*2-0.3);ctx.fill();
// Face
ctx.fillStyle='#ffccaa';
ctx.fillRect(px3+player.w/2-5,player.y+5,10,8);
// Eyes
ctx.fillStyle='#333';
ctx.beginPath();ctx.arc(px3+player.w/2+player.facing*2,player.y+8,1.5,0,Math.PI*2);ctx.fill();
// Arm/gun
ctx.fillStyle='#3377dd';
var gunX=px3+player.w/2+player.facing*10;
ctx.fillRect(gunX-4,player.y+player.h*0.35,8,6);
// Legs
ctx.fillStyle='#2255cc';
ctx.fillRect(px3+3,player.y+player.h*0.65,6,player.h*0.35);
ctx.fillRect(px3+player.w-9,player.y+player.h*0.65,6,player.h*0.35);
// Boots
ctx.fillStyle='#4488ff';
ctx.fillRect(px3+1,player.y+player.h-5,8,5);
ctx.fillRect(px3+player.w-9,player.y+player.h-5,8,5);

// Charge glow
if(charging&&chargeTime>0.2){
var chargeAlpha=Math.min(1,chargeTime/maxCharge);
var chargeColor=chargeTime>=maxCharge*0.8?'rgba(0,255,255,':'rgba(100,170,255,';
ctx.shadowColor=chargeTime>=maxCharge*0.8?'#00ffff':'#4488ff';
ctx.shadowBlur=10+chargeAlpha*15;
ctx.strokeStyle=chargeColor+(chargeAlpha*0.6)+')';
ctx.lineWidth=2;
ctx.beginPath();ctx.arc(px3+player.w/2,player.y+player.h/2,12+chargeAlpha*6,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
}
ctx.globalAlpha=1;ctx.restore();

// Bullets
for(var i=0;i<bullets.length;i++){
var bl=bullets[i];
var blx=bl.x-scrollX;
ctx.save();
ctx.shadowColor=bl.color;ctx.shadowBlur=bl.size*4;
ctx.fillStyle=bl.color;
if(bl.size===3){
ctx.beginPath();ctx.arc(blx,bl.y,bl.w/2,0,Math.PI*2);ctx.fill();
} else {
ctx.fillRect(blx-bl.w/2,bl.y-bl.h/2,bl.w,bl.h);
}
ctx.shadowBlur=0;ctx.restore();
}

// Particles
for(var i=0;i<particles.length;i++){
var p2=particles[i];
var p2x=p2.x-scrollX;
ctx.globalAlpha=Math.min(1,p2.life/p2.maxLife);
ctx.fillStyle=p2.color;
ctx.beginPath();ctx.arc(p2x,p2.y,p2.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#4488ff';
ctx.beginPath();ctx.arc(15+i*22,15,8,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#66aaff';
ctx.beginPath();ctx.arc(15+i*22,13,5,Math.PI+0.3,Math.PI*2-0.3);ctx.fill();
}

// Charge indicator
if(charging){
var cw=60,ch=6,cx2=W/2-cw/2,cy=H-25;
ctx.fillStyle='#222';ctx.fillRect(cx2,cy,cw,ch);
ctx.fillStyle=chargeTime>=maxCharge*0.8?'#00ffff':'#4488ff';
ctx.fillRect(cx2,cy,cw*Math.min(1,chargeTime/maxCharge),ch);
ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.strokeRect(cx2,cy,cw,ch);
}
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#001133');sky.addColorStop(1,'#003355');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Grid floor perspective
ctx.strokeStyle='rgba(50,100,150,0.3)';ctx.lineWidth=1;
for(var i=0;i<20;i++){
var gy=H*0.6+i*12;
ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
}

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#4488ff';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#4488ff';
ctx.fillText('MEGA MAN',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
ctx.fillStyle='#66aaff';
ctx.fillText('THE BLUE BOMBER',W/2,H*0.34);

// Draw Mega Man on title
ctx.fillStyle='#4488ff';
ctx.beginPath();ctx.arc(W/2,H*0.44,15,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#66aaff';
ctx.beginPath();ctx.arc(W/2,H*0.43,10,Math.PI+0.3,Math.PI*2-0.3);ctx.fill();
ctx.fillStyle='#ffccaa';
ctx.fillRect(W/2-7,H*0.44,14,10);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);

ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT: Run | UP: Jump | SPACE: Shoot (hold to charge!)',W/2,H*0.67);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#4488ff';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#4488ff';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
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

window.initMegaMan=function(){
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

window.stopMegaMan=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keySpace=false;
};
})();
