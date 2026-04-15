// Phoenix — Fixed-screen vertical shooter
(function(){
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
var player,bullets=[],enemies=[],eBullets=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var shieldActive=false,shieldEnergy=100,shieldRechargeRate=15,shieldDrainRate=40;
var lastShot=0,SHOOT_COOLDOWN=0.15;
var PLAYER_SPEED=350,BULLET_SPEED=500,ENEMY_BULLET_SPEED=140;
var waveNum=0,waveTimer=0,waveDelay=2.0,spawningWave=false;
var lastTs=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
initStars();
}

function initStars(){
stars=[];
for(var i=0;i<120;i++){
stars.push({x:Math.random()*W,y:Math.random()*H,s:0.3+Math.random()*2,b:0.3+Math.random()*0.7,speed:20+Math.random()*60});
}
}

function spawnWave(){
waveNum++;
var cols=Math.min(6+Math.floor(waveNum/3),10);
var rows=Math.min(2+Math.floor(waveNum/4),5);
var ew=30,eh=24,gapX=12,gapY=10;
var totalW=cols*(ew+gapX);
var startX=(W-totalW)/2+gapX/2;
var startY=-rows*(eh+gapY);

for(var r=0;r<rows;r++){
for(var c=0;c<cols;c++){
var type='small';
if(r===0&&waveNum>=3)type='large';
else if(r<=1)type='medium';
var hp=type==='large'?3:type==='medium'?2:1;
enemies.push({
x:startX+c*(ew+gapX),y:startY+r*(eh+gapY),
targetY:60+r*(eh+gapY),
w:ew,h:eh,hp:hp,maxHp:hp,alive:true,type:type,
frame:0,frameTimer:0,
swoopTimer:3+Math.random()*5,swooping:false,
swoopPhase:0,swoopStartX:0,swoopStartY:0,
homeX:startX+c*(ew+gapX),homeY:60+r*(eh+gapY),
shootTimer:2+Math.random()*6,
wingAngle:0
});
}}
spawningWave=false;
}

function resetGame(){
player={x:W/2,y:H-60,w:32,h:20};
bullets=[];eBullets=[];particles=[];enemies=[];
score=0;lives=3;level=1;gameTime=0;waveNum=0;
shieldActive=false;shieldEnergy=100;
spawnWave();
gameState='playing';
}

function addParticles(x,y,color,count){
for(var i=0;i<count;i++){
var angle=Math.random()*Math.PI*2;
var speed=40+Math.random()*180;
particles.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
life:0.3+Math.random()*0.6,maxLife:0.3+Math.random()*0.6,color:color,size:1+Math.random()*3});
}}

function addExplosion(x,y,colors,count){
for(var i=0;i<count;i++){
var c=colors[Math.floor(Math.random()*colors.length)];
addParticles(x,y,c,1);
}}

function drawBird(x,y,w,h,type,frame,hp,maxHp){
ctx.save();
var wingFlap=Math.sin(frame*0.15)*0.4;

if(type==='large'){
// Large boss bird - phoenix-like with gradient body
var bGrad=ctx.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w/2);
bGrad.addColorStop(0,'#ffaa00');bGrad.addColorStop(0.5,'#ff5500');bGrad.addColorStop(1,'#aa1100');
ctx.fillStyle=bGrad;
ctx.beginPath();
ctx.ellipse(x+w/2,y+h/2,w/2,h/3,0,0,Math.PI*2);
ctx.fill();
// Wings with gradient feathers
var lwGrad=ctx.createLinearGradient(x-w*0.3,y,x+w*0.2,y+h);
lwGrad.addColorStop(0,'#ff8800');lwGrad.addColorStop(0.5,'#ff4400');lwGrad.addColorStop(1,'#881100');
ctx.fillStyle=lwGrad;
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x-w*0.3,y+h*0.2+wingFlap*h*0.3);
ctx.lineTo(x-w*0.15,y+h*0.5+wingFlap*h*0.15);
ctx.lineTo(x,y+h*0.7);
ctx.closePath();ctx.fill();
var rwGrad=ctx.createLinearGradient(x+w*0.8,y,x+w+w*0.3,y+h);
rwGrad.addColorStop(0,'#ff8800');rwGrad.addColorStop(0.5,'#ff4400');rwGrad.addColorStop(1,'#881100');
ctx.fillStyle=rwGrad;
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x+w+w*0.3,y+h*0.2+wingFlap*h*0.3);
ctx.lineTo(x+w+w*0.15,y+h*0.5+wingFlap*h*0.15);
ctx.lineTo(x+w,y+h*0.7);
ctx.closePath();ctx.fill();
// Feather tip highlights
ctx.strokeStyle='#ffcc44';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x-w*0.3,y+h*0.2+wingFlap*h*0.3);ctx.lineTo(x-w*0.15,y+h*0.5+wingFlap*h*0.15);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w+w*0.3,y+h*0.2+wingFlap*h*0.3);ctx.lineTo(x+w+w*0.15,y+h*0.5+wingFlap*h*0.15);ctx.stroke();
// Tail plume
ctx.fillStyle='#ff6600';
ctx.beginPath();ctx.moveTo(x+w*0.35,y+h*0.7);ctx.lineTo(x+w/2,y+h+6);ctx.lineTo(x+w*0.65,y+h*0.7);ctx.closePath();ctx.fill();
// Eye with glow
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.35,3.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.35,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.35,1,0,Math.PI*2);ctx.fill();
// Fire aura glow
ctx.shadowColor='#ff4400';ctx.shadowBlur=14+Math.sin(frame*0.2)*4;
ctx.strokeStyle='#ff8800';ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2+3,h/3+3,0,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
} else if(type==='medium'){
// Medium bird with gradient body
var mGrad=ctx.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w/3);
mGrad.addColorStop(0,'#44ffcc');mGrad.addColorStop(0.6,'#00cc88');mGrad.addColorStop(1,'#006644');
ctx.fillStyle=mGrad;
ctx.beginPath();
ctx.ellipse(x+w/2,y+h/2,w/3,h/3,0,0,Math.PI*2);
ctx.fill();
// Wings with two-tone gradient
ctx.fillStyle='#00ffaa';
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x-w*0.1,y+h*0.3+wingFlap*h*0.25);
ctx.lineTo(x+w*0.2,y+h*0.7);
ctx.closePath();ctx.fill();
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x+w+w*0.1,y+h*0.3+wingFlap*h*0.25);
ctx.lineTo(x+w*0.8,y+h*0.7);
ctx.closePath();ctx.fill();
// Wing edge highlights
ctx.strokeStyle='#88ffdd';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x-w*0.1,y+h*0.3+wingFlap*h*0.25);ctx.lineTo(x+w*0.2,y+h*0.7);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w+w*0.1,y+h*0.3+wingFlap*h*0.25);ctx.lineTo(x+w*0.8,y+h*0.7);ctx.stroke();
// Eye with highlight
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.4,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#005533';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.4,1.2,0,Math.PI*2);ctx.fill();
// Subtle glow
ctx.shadowColor='#00cc88';ctx.shadowBlur=6;
ctx.strokeStyle='rgba(0,255,170,0.4)';ctx.lineWidth=1;
ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/3+2,h/3+2,0,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
} else {
// Small bird with gradient
var sGrad=ctx.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w/4);
sGrad.addColorStop(0,'#aaaaff');sGrad.addColorStop(0.6,'#6666ff');sGrad.addColorStop(1,'#3333aa');
ctx.fillStyle=sGrad;
ctx.beginPath();
ctx.ellipse(x+w/2,y+h/2,w/4,h/4,0,0,Math.PI*2);
ctx.fill();
// Wings with shimmer
ctx.fillStyle='#8888ff';
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x+w*0.1,y+h*0.3+wingFlap*h*0.2);
ctx.lineTo(x+w*0.3,y+h*0.7);
ctx.closePath();ctx.fill();
ctx.beginPath();
ctx.moveTo(x+w/2,y+h/2);
ctx.lineTo(x+w*0.9,y+h*0.3+wingFlap*h*0.2);
ctx.lineTo(x+w*0.7,y+h*0.7);
ctx.closePath();ctx.fill();
// Wing tip highlights
ctx.strokeStyle='#bbbbff';ctx.lineWidth=0.8;
ctx.beginPath();ctx.moveTo(x+w*0.1,y+h*0.3+wingFlap*h*0.2);ctx.lineTo(x+w*0.3,y+h*0.7);ctx.stroke();
// Tiny eye
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+w/2,y+h*0.43,1.5,0,Math.PI*2);ctx.fill();
}

// HP bar for multi-hit enemies (enhanced)
if(maxHp>1){
var barW=w*0.8;
ctx.fillStyle='#222';
ctx.fillRect(x+w/2-barW/2-1,y-6,barW+2,5);
var hpGrad=ctx.createLinearGradient(x+w/2-barW/2,0,x+w/2-barW/2+barW*(hp/maxHp),0);
hpGrad.addColorStop(0,hp>maxHp*0.5?'#00ff44':'#ff4400');hpGrad.addColorStop(1,hp>maxHp*0.5?'#00aa22':'#ff8800');
ctx.fillStyle=hpGrad;
ctx.fillRect(x+w/2-barW/2,y-5,barW*(hp/maxHp),3);
ctx.strokeStyle='#555';ctx.lineWidth=0.5;ctx.strokeRect(x+w/2-barW/2-1,y-6,barW+2,5);
}
ctx.restore();
}

function drawPlayer(x,y,w,h){
ctx.save();
// Ship body metallic gradient
var grad=ctx.createLinearGradient(x,y,x+w,y+h);
grad.addColorStop(0,'#00ddff');grad.addColorStop(0.3,'#00ffff');grad.addColorStop(0.5,'#88ffff');grad.addColorStop(0.7,'#00ffff');grad.addColorStop(1,'#005566');
ctx.fillStyle=grad;
// Main body
ctx.beginPath();
ctx.moveTo(x+w/2,y);
ctx.lineTo(x+w,y+h);
ctx.lineTo(x+w*0.7,y+h*0.7);
ctx.lineTo(x+w*0.3,y+h*0.7);
ctx.lineTo(x,y+h);
ctx.closePath();
ctx.fill();
// Hull panel lines
ctx.strokeStyle='rgba(0,150,200,0.4)';ctx.lineWidth=0.5;
ctx.beginPath();ctx.moveTo(x+w/2,y+4);ctx.lineTo(x+w*0.35,y+h*0.7);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2,y+4);ctx.lineTo(x+w*0.65,y+h*0.7);ctx.stroke();
// Wing tips
ctx.fillStyle='#00aacc';
ctx.beginPath();ctx.moveTo(x-3,y+h);ctx.lineTo(x+w*0.15,y+h*0.8);ctx.lineTo(x+w*0.1,y+h+2);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+w+3,y+h);ctx.lineTo(x+w*0.85,y+h*0.8);ctx.lineTo(x+w*0.9,y+h+2);ctx.closePath();ctx.fill();
// Cockpit dome with glass effect
var cpGrad=ctx.createRadialGradient(x+w/2-1,y+h*0.42,0,x+w/2,y+h*0.45,4);
cpGrad.addColorStop(0,'#ffffff');cpGrad.addColorStop(0.4,'#aaddff');cpGrad.addColorStop(1,'#4488aa');
ctx.fillStyle=cpGrad;
ctx.beginPath();ctx.arc(x+w/2,y+h*0.45,4,0,Math.PI*2);ctx.fill();
// Engine exhaust - multi-layer flame
ctx.shadowColor='#00aaff';ctx.shadowBlur=14;
ctx.fillStyle='rgba(0,100,255,0.5)';
ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.88+Math.random()*2,6,5+Math.random()*3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(0,200,255,0.7)';
ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.86,4,3+Math.random()*2,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(200,255,255,0.9)';
ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.84,2,2,0,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;

// Shield - hexagonal pattern
if(shieldActive&&shieldEnergy>0){
var shieldAlpha=0.3+0.3*Math.sin(gameTime*6);
ctx.strokeStyle='rgba(0,200,255,'+shieldAlpha+')';
ctx.lineWidth=2;
ctx.shadowColor='#00ccff';ctx.shadowBlur=18+Math.sin(gameTime*8)*5;
ctx.beginPath();ctx.arc(x+w/2,y+h/2,w*0.8,0,Math.PI*2);ctx.stroke();
// Inner ring
ctx.strokeStyle='rgba(100,220,255,'+(shieldAlpha*0.5)+')';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(x+w/2,y+h/2,w*0.6,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
}
ctx.restore();
}

function update(dt){
gameTime+=dt;
// Difficulty: waves 1-2 easy, 3-5 medium, 6+ hard
var diffMult=waveNum<=2?0.7:(waveNum<=5?1.0:1.0+(waveNum-5)*0.12);

// Player movement
if(keyLeft)player.x-=PLAYER_SPEED*dt;
if(keyRight)player.x+=PLAYER_SPEED*dt;
if(keyUp)player.y-=PLAYER_SPEED*dt;
if(keyDown)player.y+=PLAYER_SPEED*dt;
if(player.x<0)player.x=0;
if(player.x+player.w>W)player.x=W-player.w;
if(player.y<H*0.5)player.y=H*0.5;
if(player.y+player.h>H-10)player.y=H-player.h-10;

// Shield
shieldActive=keySpace;
if(shieldActive){
shieldEnergy-=shieldDrainRate*dt;
if(shieldEnergy<=0){shieldEnergy=0;shieldActive=false;}
} else {
shieldEnergy=Math.min(100,shieldEnergy+shieldRechargeRate*dt);
}

// Auto-fire
lastShot+=dt;
if(lastShot>=SHOOT_COOLDOWN&&!shieldActive){
lastShot=0;
bullets.push({x:player.x+player.w/2-2,y:player.y,w:4,h:10,vy:-BULLET_SPEED});
}

// Update bullets
for(var i=bullets.length-1;i>=0;i--){
bullets[i].y+=bullets[i].vy*dt;
if(bullets[i].y<-20)bullets.splice(i,1);
}

// Update enemy bullets
for(var i=eBullets.length-1;i>=0;i--){
eBullets[i].y+=eBullets[i].vy*dt;
eBullets[i].x+=eBullets[i].vx*dt;
if(eBullets[i].y>H+20)eBullets.splice(i,1);
}

// Update enemies
var aliveCount=0;
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
aliveCount++;
e.frame++;
e.wingAngle+=dt*6;

// Move down to target position
if(e.y<e.targetY){
e.y+=80*dt;
}

// Swooping - difficulty scales aggression
e.swoopTimer-=dt*diffMult;
if(e.swoopTimer<=0&&!e.swooping){
e.swooping=true;
e.swoopPhase=0;
e.swoopStartX=e.x;
e.swoopStartY=e.y;
}
if(e.swooping){
e.swoopPhase+=dt*diffMult;
var sp=e.swoopPhase;
if(sp<2){
e.x=e.swoopStartX+Math.sin(sp*3)*60;
e.y=e.swoopStartY+sp*(80*diffMult+40);
} else {
e.swooping=false;
e.swoopTimer=waveNum<=2?5+Math.random()*5:3+Math.random()*5;
e.x=e.homeX;
e.y=e.homeY;
}
} else {
// Formation drift
e.x=e.homeX+Math.sin(gameTime*0.5+e.homeX*0.01)*30;
}

// Shooting - difficulty scales fire rate
e.shootTimer-=dt;
var eFireRate=waveNum<=2?5+Math.random()*6:3+Math.random()*5;
if(e.shootTimer<=0&&!e.swooping){
e.shootTimer=eFireRate;
var dx=player.x+player.w/2-e.x-e.w/2;
var dy=player.y-e.y;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist>0){
eBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:dx/dist*ENEMY_BULLET_SPEED,vy:dy/dist*ENEMY_BULLET_SPEED,w:4,h:4});
}
}
}

// Bullet-enemy collision
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
for(var j=0;j<enemies.length;j++){
var e=enemies[j];
if(!e.alive)continue;
if(b.x<e.x+e.w&&b.x+b.w>e.x&&b.y<e.y+e.h&&b.y+b.h>e.y){
e.hp--;
bullets.splice(i,1);
if(e.hp<=0){
e.alive=false;
var pts=e.type==='large'?300:e.type==='medium'?200:100;
score+=pts;
var cols=e.type==='large'?['#ff3300','#ff8800','#ffcc00']:e.type==='medium'?['#00ffaa','#00cc88','#fff']:['#6666ff','#8888ff','#fff'];
addExplosion(e.x+e.w/2,e.y+e.h/2,cols,15);
}
addParticles(b.x,b.y,'#ffff00',3);
break;
}
}
}

// Enemy bullet-player collision
if(!shieldActive||shieldEnergy<=0){
for(var i=eBullets.length-1;i>=0;i--){
var b=eBullets[i];
if(b.x<player.x+player.w&&b.x+b.w>player.x&&b.y<player.y+player.h&&b.y+b.h>player.y){
eBullets.splice(i,1);
lives--;
addExplosion(player.x+player.w/2,player.y+player.h/2,['#ff0000','#ff6600','#ffff00'],20);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-60;}
break;
}
}
} else {
// Shield absorbs bullets
for(var i=eBullets.length-1;i>=0;i--){
var b=eBullets[i];
var dx=b.x-player.x-player.w/2;
var dy=b.y-player.y-player.h/2;
if(Math.sqrt(dx*dx+dy*dy)<player.w*0.8){
eBullets.splice(i,1);
addParticles(b.x,b.y,'#00ccff',5);
}
}
}

// Enemy-player collision
for(var j=0;j<enemies.length;j++){
var e=enemies[j];
if(!e.alive)continue;
if(player.x<e.x+e.w&&player.x+player.w>e.x&&player.y<e.y+e.h&&player.y+player.h>e.y){
if(shieldActive&&shieldEnergy>0){
e.alive=false;
score+=50;
addExplosion(e.x+e.w/2,e.y+e.h/2,['#00ccff','#fff'],10);
} else {
e.alive=false;
lives--;
addExplosion(player.x+player.w/2,player.y+player.h/2,['#ff0000','#ff6600'],20);
if(lives<=0){gameState='gameover';}
else{player.x=W/2;player.y=H-60;}
}
}
}

// Spawn next wave
if(aliveCount===0){
waveTimer+=dt;
if(waveTimer>waveDelay){
waveTimer=0;
level++;
ENEMY_BULLET_SPEED=Math.min(180,140+level*3);
spawnWave();
}
}

// Update stars
for(var i=0;i<stars.length;i++){
stars[i].y+=stars[i].speed*dt;
if(stars[i].y>H){stars[i].y=0;stars[i].x=Math.random()*W;}
}

// Update particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function render(){
// Deep space radial background
var bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.7);
bg.addColorStop(0,'#0a0a22');bg.addColorStop(0.5,'#050518');bg.addColorStop(1,'#000008');
ctx.fillStyle=bg;
ctx.fillRect(0,0,W,H);
// Nebula wisps
ctx.save();
ctx.globalAlpha=0.06;
ctx.fillStyle='#ff2200';
ctx.beginPath();ctx.ellipse(W*0.3,H*0.4,W*0.25,H*0.15,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff6600';
ctx.beginPath();ctx.ellipse(W*0.7,H*0.6,W*0.2,H*0.12,-0.2,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;ctx.restore();

// Stars with twinkle cross-sparkle
for(var i=0;i<stars.length;i++){
var s=stars[i];
var alpha=s.b*(0.5+0.5*Math.sin(gameTime*2+i));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
// Cross sparkle on bright stars
if(s.s>1.2&&alpha>0.6){
ctx.strokeStyle='rgba(255,255,255,'+(alpha*0.3)+')';ctx.lineWidth=0.5;
ctx.beginPath();ctx.moveTo(s.x-3,s.y);ctx.lineTo(s.x+3,s.y);ctx.stroke();
ctx.beginPath();ctx.moveTo(s.x,s.y-3);ctx.lineTo(s.x,s.y+3);ctx.stroke();
}
}

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
if(!e.alive)continue;
drawBird(e.x,e.y,e.w,e.h,e.type,e.frame,e.hp,e.maxHp);
}

// Bullets
ctx.fillStyle='#ffff00';
ctx.shadowColor='#ffff00';ctx.shadowBlur=8;
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
ctx.fillRect(b.x,b.y,b.w,b.h);
}
ctx.shadowBlur=0;

// Enemy bullets
ctx.fillStyle='#ff4444';
ctx.shadowColor='#ff0000';ctx.shadowBlur=6;
for(var i=0;i<eBullets.length;i++){
var b=eBullets[i];
ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();
}
ctx.shadowBlur=0;

// Player
drawPlayer(player.x,player.y,player.w,player.h);

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];
var alpha=p.life/p.maxLife;
ctx.globalAlpha=alpha;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*alpha,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// Shield energy bar
var barW=80,barH=6;
var barX=W/2-barW/2,barY=H-15;
ctx.fillStyle='#333';
ctx.fillRect(barX,barY,barW,barH);
ctx.fillStyle=shieldEnergy>30?'#00ccff':'#ff4444';
ctx.fillRect(barX,barY,barW*(shieldEnergy/100),barH);
ctx.strokeStyle='#666';ctx.lineWidth=1;
ctx.strokeRect(barX,barY,barW,barH);

// Lives
for(var i=0;i<lives;i++){
ctx.fillStyle='#00ffff';
ctx.beginPath();
ctx.moveTo(15+i*22+8,H-20);
ctx.lineTo(15+i*22+16,H-8);
ctx.lineTo(15+i*22,H-8);
ctx.closePath();ctx.fill();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
// Background
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#000011');bg.addColorStop(1,'#110022');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Stars
for(var i=0;i<stars.length;i++){
stars[i].y+=stars[i].speed*dt;
if(stars[i].y>H){stars[i].y=0;stars[i].x=Math.random()*W;}
var alpha=stars[i].b*(0.5+0.5*Math.sin(titlePulse+i));
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.beginPath();ctx.arc(stars[i].x,stars[i].y,stars[i].s,0,Math.PI*2);ctx.fill();
}

ctx.save();ctx.textAlign='center';

// Title
ctx.shadowColor='#ff4400';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillStyle='#ff3300';
ctx.fillText('PHOENIX',W/2,H*0.28);
ctx.shadowBlur=0;

// Subtitle
ctx.font=Math.round(W*0.032)+'px "Courier New",monospace';
ctx.fillStyle='#ffaa00';
ctx.fillText('DEFEND THE GALAXY',W/2,H*0.36);

// Draw demo bird
var birdX=W/2-20,birdY=H*0.42;
drawBird(birdX,birdY,40,30,'large',Math.floor(titlePulse*10),3,3);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.6);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
ctx.fillText('ARROWS/WASD: Move | SPACE: Shield',W/2,H*0.68);
ctx.fillText('Auto-fire when shield is down',W/2,H*0.73);

ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='rgba(0,0,0,0.6)';
ctx.beginPath();ctx.roundRect(W*0.2,H*0.32,W*0.6,H*0.38,15);ctx.fill();

ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);

ctx.fillStyle='#ffffff';
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Wave: '+waveNum+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);

var alpha=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+alpha+')';
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='WAVE '+waveNum;
var st=document.getElementById('hud-time');if(st)st.textContent=lives+' HP';
}

function gameLoop(ts){
var dt=(ts-lastTs)/1000;
if(dt>0.5)dt=0.016;
lastTs=ts;

if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt*3;drawGameOver();}

animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(e.key===' ')keySpace=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
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

window.initPhoenix=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);
resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});
bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});
bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);
};

window.stopPhoenix=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
