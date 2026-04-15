// R-Type — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,bullets=[],enemies=[],enemyBullets=[],particles=[],stars=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var lastShot=0,scrollX=0;
var PLAYER_SPEED=180,BULLET_SPEED=450;

// Charge shot
var chargeTimer=0,charging=false,maxCharge=2.0;

// Force pod
var forcePod=null; // {x,y,attached:'front'|'back'|null,vx,vy}
var forceLevel=0; // 0=none, 1=small, 2=medium, 3=large

// Difficulty progression: time-based easy->medium->hard
function getDiffMult(){
    if(gameTime<=30)return 0.7;
    if(gameTime<=90)return 1.0;
    return 1.0+(gameTime-90)*0.005;
}

// Organic terrain
var organicTop=[],organicBot=[];

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*1.5,sp:15+Math.random()*50});
generateOrganicTerrain();
}

function generateOrganicTerrain(){
organicTop=[];organicBot=[];
for(var i=0;i<150;i++){
var x2=i*60;
organicTop.push({x:x2,y:15+Math.sin(i*0.12)*H*0.04+Math.sin(i*0.05)*H*0.02+
(i>80&&i<100?Math.sin((i-80)*0.15)*H*0.08:0)});
organicBot.push({x:x2,y:H-15-Math.sin(i*0.1+2)*H*0.04-Math.sin(i*0.07)*H*0.03-
(i>50&&i<70?Math.sin((i-50)*0.15)*H*0.06:0)});
}
}

function resetGame(){
score=0;lives=3;gameTime=0;scrollX=0;
player={x:W*0.12,y:H/2,invince:2};
bullets=[];enemies=[];enemyBullets=[];particles=[];
chargeTimer=0;charging=false;
forcePod=null;forceLevel=0;
generateOrganicTerrain();
gameState='playing';
}

function spawnEnemy(){
var types=['cell','worm','eye','claw','boss'];
var weights=[0.35,0.25,0.2,0.15,0.05];
var r2=Math.random(),cum=0,type='cell';
for(var i=0;i<types.length;i++){cum+=weights[i];if(r2<cum){type=types[i];break;}}

var ey=H*0.15+Math.random()*H*0.7;
var dm2=getDiffMult();
var e={x:W+30,y:ey,type:type,hp:Math.round(2*dm2),timer:0,vx:-(40+Math.random()*30)*dm2,vy:0,
size:14,phase:Math.random()*Math.PI*2,color:'#cc44aa'};

if(type==='worm'){e.hp=Math.round(3*dm2);e.size=12;e.vy=60*dm2;e.color='#66cc44';}
if(type==='eye'){e.hp=Math.round(4*dm2);e.size=18;e.vx=-25*dm2;e.color='#ff6644';}
if(type==='claw'){e.hp=Math.round(3*dm2);e.size=16;e.vy=40*dm2;e.color='#aa44cc';}
if(type==='boss'){e.hp=Math.round(15*dm2);e.size=35;e.vx=-15*dm2;e.color='#884488';}
enemies.push(e);
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*180,vy:(Math.random()-0.5)*180,
life:0.3+Math.random()*0.4,color:color,size:1.5+Math.random()*3});
}

function fireShot(){
var power=Math.min(chargeTimer,maxCharge);
if(power>0.5){
// Charged shot - big beam
var sz=4+power*6;
var dmg=Math.floor(1+power*4);
bullets.push({x:player.x+20,y:player.y,vx:BULLET_SPEED*1.2,vy:0,life:0.8,damage:dmg,
size:sz,charged:true,color:'#44ccff'});
addParticles(player.x+20,player.y,'#44ccff',6);
}else{
// Normal shot
bullets.push({x:player.x+20,y:player.y,vx:BULLET_SPEED,vy:0,life:1.5,damage:1,
size:3,charged:false,color:'#ffcc00'});
}
// Force pod also shoots if attached
if(forcePod&&forcePod.attached){
var fx=forcePod.x,fy=forcePod.y;
bullets.push({x:fx+(forcePod.attached==='front'?15:-15),y:fy,
vx:(forcePod.attached==='front'?1:-1)*BULLET_SPEED*0.8,vy:0,
life:1.0,damage:forceLevel,size:2+forceLevel,charged:false,color:'#ff8844'});
if(forceLevel>=2){
bullets.push({x:fx,y:fy-10,vx:BULLET_SPEED*0.5,vy:-BULLET_SPEED*0.3,life:0.8,damage:1,size:2,charged:false,color:'#ff8844'});
bullets.push({x:fx,y:fy+10,vx:BULLET_SPEED*0.5,vy:BULLET_SPEED*0.3,life:0.8,damage:1,size:2,charged:false,color:'#ff8844'});
}
}
chargeTimer=0;charging=false;
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
scrollX+=35*dt;
if(player.invince>0)player.invince-=dt;

// Spawn enemies - rate scales with difficulty
var dm=getDiffMult();
if(Math.random()<dt*(0.5+gameTime*0.006)*dm){spawnEnemy();}
// Spawn force pod powerup
if(!forcePod&&Math.random()<dt*0.03){
forcePod={x:W+20,y:H*0.3+Math.random()*H*0.4,attached:null,vx:-40,vy:0};
forceLevel=1;
}

// Charge shot
if(keySpace){
if(!charging){charging=true;chargeTimer=0;}
chargeTimer+=dt;
}else if(charging){
fireShot();
}

// Movement
var spd=PLAYER_SPEED;
if(keyLeft)player.x-=spd*dt;
if(keyRight)player.x+=spd*dt;
if(keyUp)player.y-=spd*dt;
if(keyDown)player.y+=spd*dt;
player.x=Math.max(15,Math.min(W*0.6,player.x));
player.y=Math.max(15,Math.min(H-15,player.y));

// Force pod
if(forcePod){
if(forcePod.attached==='front'){
forcePod.x=player.x+22;forcePod.y=player.y;
}else if(forcePod.attached==='back'){
forcePod.x=player.x-22;forcePod.y=player.y;
}else{
forcePod.x+=forcePod.vx*dt;forcePod.y+=forcePod.vy*dt;
// Attach to player on contact
var dx3=forcePod.x-player.x,dy3=forcePod.y-player.y;
if(dx3*dx3+dy3*dy3<900){
forcePod.attached=dx3>0?'front':'back';
forceLevel=Math.min(forceLevel+1,3);
addParticles(forcePod.x,forcePod.y,'#ff8844',10);
}
// Bounce off walls
if(forcePod.x<10||forcePod.x>W-10)forcePod.vx*=-1;
if(forcePod.y<10||forcePod.y>H-10)forcePod.vy*=-1;
}
}

// Bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.x>W+30||b.x<-30||b.y<-30||b.y>H+30||b.life<=0){bullets.splice(i,1);}
}

// Enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
e.x+=e.vx*dt;e.timer+=dt;
if(e.type==='worm')e.y+=Math.sin(gameTime*3+e.phase)*e.vy*dt;
if(e.type==='claw'){e.y+=Math.sin(gameTime*2+e.phase)*e.vy*dt;}
if(e.type==='eye'){
// Track player slowly
var dy4=player.y-e.y;
e.y+=Math.sign(dy4)*20*dt;
}
// Shooting - scales with difficulty
var shootThresh2=Math.max(1.5,3/getDiffMult());
if(e.timer>shootThresh2&&Math.random()<dt*0.25*getDiffMult()){
e.timer=0;
var dx5=player.x-e.x,dy5=player.y-e.y,d5=Math.sqrt(dx5*dx5+dy5*dy5);
if(d5>0){
enemyBullets.push({x:e.x,y:e.y,vx:dx5/d5*100,vy:dy5/d5*100,life:4});
if(e.type==='boss'){
enemyBullets.push({x:e.x,y:e.y-15,vx:-120,vy:-40,life:3});
enemyBullets.push({x:e.x,y:e.y+15,vx:-120,vy:40,life:3});
}
}
}
if(e.x<-60){enemies.splice(i,1);continue;}

// Bullet collision
for(var j=bullets.length-1;j>=0;j--){
var b2=bullets[j];
var dx6=b2.x-e.x,dy6=b2.y-e.y;
if(dx6*dx6+dy6*dy6<(e.size+b2.size)*(e.size+b2.size)){
e.hp-=b2.damage;
addParticles(e.x,e.y,e.color,4);
if(!b2.charged||b2.damage<=2)bullets.splice(j,1);
if(e.hp<=0){
var pts=e.type==='boss'?500:e.type==='eye'?150:100;
score+=pts;addParticles(e.x,e.y,e.color,15);
enemies.splice(i,1);break;
}
}
}
}

// Force pod damages enemies on contact
if(forcePod&&forcePod.attached){
for(var i=enemies.length-1;i>=0;i--){
var e2=enemies[i];
var dx7=forcePod.x-e2.x,dy7=forcePod.y-e2.y;
if(dx7*dx7+dy7*dy7<(e2.size+12)*(e2.size+12)){
e2.hp-=forceLevel;
addParticles(e2.x,e2.y,'#ff8844',5);
if(e2.hp<=0){
score+=100;addParticles(e2.x,e2.y,e2.color,12);
enemies.splice(i,1);
}
}
}
}

// Enemy bullets
for(var i=enemyBullets.length-1;i>=0;i--){
var eb=enemyBullets[i];
eb.x+=eb.vx*dt;eb.y+=eb.vy*dt;eb.life-=dt;
if(eb.life<=0||eb.x<-20||eb.x>W+20||eb.y<-20||eb.y>H+20){enemyBullets.splice(i,1);continue;}
// Force pod blocks enemy bullets
if(forcePod&&forcePod.attached){
var dx8=eb.x-forcePod.x,dy8=eb.y-forcePod.y;
if(dx8*dx8+dy8*dy8<225){
addParticles(eb.x,eb.y,'#ff8844',3);
enemyBullets.splice(i,1);continue;
}
}
// Hit player
if(player.invince<=0){
var dx9=eb.x-player.x,dy9=eb.y-player.y;
if(dx9*dx9+dy9*dy9<300){
playerHit();enemyBullets.splice(i,1);
}
}
}

// Player-enemy collision
if(player.invince<=0){
for(var i=0;i<enemies.length;i++){
var e3=enemies[i];
var dx10=e3.x-player.x,dy10=e3.y-player.y;
if(dx10*dx10+dy10*dy10<(e3.size+10)*(e3.size+10)){
playerHit();break;
}
}
}

// Stars
for(var i=0;i<stars.length;i++){
stars[i].x-=stars[i].sp*dt;
if(stars[i].x<-5){stars[i].x=W+5;stars[i].y=Math.random()*H;}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function playerHit(){
lives--;player.invince=2.5;
addParticles(player.x,player.y,'#00ccff',25);
if(forcePod&&forcePod.attached){
forcePod.attached=null;forcePod.vx=100;forcePod.vy=(Math.random()-0.5)*80;
}
player.x=W*0.12;player.y=H/2;
if(lives<=0)gameState='gameover';
}

function drawShip(x,y,alpha){
ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
// Shadow
ctx.fillStyle='rgba(0,0,0,0.2)';
ctx.beginPath();ctx.moveTo(16,3);ctx.lineTo(3,-7);ctx.lineTo(-15,-3);ctx.lineTo(-15,9);ctx.lineTo(3,13);ctx.closePath();ctx.fill();
// R-9 ship body with enhanced gradient
var grad=ctx.createLinearGradient(-15,-12,15,12);
grad.addColorStop(0,'#1a3388');grad.addColorStop(0.3,'#3366cc');grad.addColorStop(0.5,'#5588dd');grad.addColorStop(0.7,'#3366cc');grad.addColorStop(1,'#1133aa');
ctx.fillStyle=grad;
ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(5,-10);ctx.lineTo(-15,-6);ctx.lineTo(-15,6);
ctx.lineTo(5,10);ctx.closePath();ctx.fill();
// Upper hull highlight
ctx.fillStyle='rgba(150,200,255,0.15)';
ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(4,-9);ctx.lineTo(-14,-5);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();
// Cockpit with bubble effect
var cockGrad=ctx.createRadialGradient(5,-1,0,6,0,5);
cockGrad.addColorStop(0,'rgba(200,250,255,0.7)');cockGrad.addColorStop(0.5,'rgba(150,220,255,0.4)');cockGrad.addColorStop(1,'rgba(100,180,255,0.2)');
ctx.fillStyle=cockGrad;
ctx.beginPath();ctx.arc(6,0,4,0,Math.PI*2);ctx.fill();
// cockpit highlight dot
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(4,-2,1.5,0,Math.PI*2);ctx.fill();
// Wing details with gradient
ctx.fillStyle='#cc3322';
ctx.fillRect(-10,-11,12,2);ctx.fillRect(-10,9,12,2);
// Wing tips
ctx.fillStyle='#ff5544';ctx.fillRect(0,-11,3,2);ctx.fillRect(0,9,3,2);
// Engine glow with gradient
ctx.save();ctx.shadowColor='#ff4422';ctx.shadowBlur=8;
var engLen=7+Math.random()*5;
var engGrad=ctx.createLinearGradient(-15,0,-15-engLen,0);
engGrad.addColorStop(0,'#ffaa44');engGrad.addColorStop(0.4,'#ff4422');engGrad.addColorStop(1,'rgba(255,30,0,0)');
ctx.fillStyle=engGrad;
ctx.beginPath();ctx.moveTo(-15,-4);ctx.lineTo(-15-engLen,0);ctx.lineTo(-15,4);ctx.fill();
ctx.restore();
// Charge indicator
if(charging&&chargeTimer>0.2){
var chg=Math.min(chargeTimer/maxCharge,1);
ctx.strokeStyle='rgba(68,200,255,'+(0.3+chg*0.5)+')';ctx.lineWidth=1+chg*3;
ctx.beginPath();ctx.arc(20,0,5+chg*12,0,Math.PI*2);ctx.stroke();
ctx.fillStyle='rgba(68,200,255,'+(chg*0.3)+')';
ctx.beginPath();ctx.arc(20,0,3+chg*8,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}

function drawForcePod(x,y){
var sz=8+forceLevel*3;
ctx.save();ctx.translate(x,y);
// Organic sphere
var grad=ctx.createRadialGradient(-2,-2,0,0,0,sz);
grad.addColorStop(0,'#ff8844');grad.addColorStop(0.5,'#cc4400');grad.addColorStop(1,'#882200');
ctx.fillStyle=grad;
ctx.beginPath();ctx.arc(0,0,sz,0,Math.PI*2);ctx.fill();
// Pulsing glow
ctx.strokeStyle='rgba(255,136,68,'+(0.3+0.2*Math.sin(gameTime*5))+')';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,sz+3,0,Math.PI*2);ctx.stroke();
// Shine
ctx.fillStyle='rgba(255,255,200,0.3)';
ctx.beginPath();ctx.arc(-3,-3,sz*0.4,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function render(){
// Background - organic alien with depth
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#080818');bg.addColorStop(0.3,'#100a22');bg.addColorStop(0.5,'#150a28');bg.addColorStop(0.7,'#100a22');bg.addColorStop(1,'#080818');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Organic nebula glow
var orgGrad=ctx.createRadialGradient(W*0.7,H*0.5,0,W*0.7,H*0.5,W*0.35);
orgGrad.addColorStop(0,'rgba(80,30,60,0.12)');orgGrad.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=orgGrad;ctx.fillRect(0,0,W,H);

// Stars with organic purple tint
for(var i=0;i<stars.length;i++){
var s=stars[i];
var bright=0.2+0.2*Math.sin(gameTime*0.7+i*0.9);
ctx.fillStyle='rgba(220,200,255,'+bright+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s*0.5,0,Math.PI*2);ctx.fill();
}

// Organic terrain
ctx.fillStyle='#1a0a2a';
ctx.beginPath();ctx.moveTo(0,0);
for(var i=0;i<organicTop.length;i++){
var tx=organicTop[i].x-scrollX%((organicTop.length-1)*60);
if(tx>-80&&tx<W+80)ctx.lineTo(tx,organicTop[i].y);
}
ctx.lineTo(W,0);ctx.closePath();ctx.fill();
// Add organic tendrils
for(var i=0;i<organicTop.length;i+=3){
var tx2=organicTop[i].x-scrollX%((organicTop.length-1)*60);
if(tx2>0&&tx2<W){
ctx.strokeStyle='rgba(100,50,120,0.3)';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(tx2,organicTop[i].y);
ctx.quadraticCurveTo(tx2+10,organicTop[i].y+20+Math.sin(gameTime+i)*5,tx2+5,organicTop[i].y+30);
ctx.stroke();
}
}

ctx.fillStyle='#1a0a2a';
ctx.beginPath();ctx.moveTo(0,H);
for(var i=0;i<organicBot.length;i++){
var bx=organicBot[i].x-scrollX%((organicBot.length-1)*60);
if(bx>-80&&bx<W+80)ctx.lineTo(bx,organicBot[i].y);
}
ctx.lineTo(W,H);ctx.closePath();ctx.fill();

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
ctx.save();ctx.translate(e.x,e.y);
if(e.type==='cell'){
ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(0,0,e.size,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,200,255,0.3)';ctx.beginPath();ctx.arc(-3,-3,e.size*0.4,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='rgba(200,100,200,0.5)';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(0,0,e.size+3,0,Math.PI*2);ctx.stroke();
}else if(e.type==='worm'){
for(var s=0;s<5;s++){
var sx2=s*8,sy2=Math.sin(gameTime*4+s)*4;
ctx.fillStyle='hsl(120,60%,'+(30+s*5)+'%)';
ctx.beginPath();ctx.arc(-sx2,sy2,e.size-s,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle='#ff0';ctx.beginPath();ctx.arc(2,-2,2,0,Math.PI*2);ctx.fill();
}else if(e.type==='eye'){
ctx.fillStyle=e.color;ctx.beginPath();ctx.ellipse(0,0,e.size,e.size*0.7,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,e.size*0.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f00';ctx.beginPath();ctx.arc(0,0,e.size*0.25,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(0,0,e.size*0.12,0,Math.PI*2);ctx.fill();
}else if(e.type==='claw'){
ctx.fillStyle=e.color;
ctx.beginPath();ctx.moveTo(-e.size,e.size);ctx.lineTo(0,-e.size);ctx.lineTo(e.size,e.size);
ctx.lineTo(e.size*0.5,e.size*0.3);ctx.lineTo(0,e.size*0.8);ctx.lineTo(-e.size*0.5,e.size*0.3);
ctx.closePath();ctx.fill();
}else if(e.type==='boss'){
// Big organic mass
var grad2=ctx.createRadialGradient(0,0,0,0,0,e.size);
grad2.addColorStop(0,'#aa66aa');grad2.addColorStop(0.6,'#664466');grad2.addColorStop(1,'#442244');
ctx.fillStyle=grad2;ctx.beginPath();ctx.arc(0,0,e.size,0,Math.PI*2);ctx.fill();
// Eye
ctx.fillStyle='#ff4400';ctx.beginPath();ctx.arc(e.size*0.3,0,e.size*0.25,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.size*0.35,0,e.size*0.1,0,Math.PI*2);ctx.fill();
// HP bar
ctx.fillStyle='#333';ctx.fillRect(-e.size,-e.size-8,e.size*2,4);
ctx.fillStyle='#ff4444';ctx.fillRect(-e.size,-e.size-8,e.size*2*(e.hp/15),4);
}
ctx.restore();
}

// Bullets
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
if(b.charged){
ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=10;
ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
}
}
ctx.shadowBlur=0;

// Enemy bullets
ctx.fillStyle='#ff3366';
for(var i=0;i<enemyBullets.length;i++){
var eb=enemyBullets[i];
ctx.beginPath();ctx.arc(eb.x,eb.y,3.5,0,Math.PI*2);ctx.fill();
}

// Force pod
if(forcePod)drawForcePod(forcePod.x,forcePod.y);

// Player
var alpha2=player.invince>0?(Math.sin(gameTime*15)>0?0.3:0.9):1;
drawShip(player.x,player.y,alpha2);

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2.5);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

// Lives
ctx.fillStyle='#5588dd';ctx.font='14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++)ctx.fillText('\u25C6',10+i*20,H-10);
// Force level indicator
if(forcePod){
ctx.fillStyle='#ff8844';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('FORCE LV'+forceLevel,W-10,H-10);
}
// Charge bar
if(charging&&chargeTimer>0.2){
var cw2=100,chg2=Math.min(chargeTimer/maxCharge,1);
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(player.x-cw2/2,player.y-25,cw2,6);
ctx.fillStyle='#44ccff';ctx.fillRect(player.x-cw2/2,player.y-25,cw2*chg2,6);
}
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#0a0a20');bg.addColorStop(0.5,'#150a28');bg.addColorStop(1,'#0a0a20');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
for(var i=0;i<50;i++){
ctx.fillStyle='rgba(255,255,255,'+(0.15+0.15*Math.sin(titlePulse+i))+')';
ctx.fillRect((i*97+13)%W,(i*53+7)%H,1.5,1.5);
}
// Organic decoration
for(var i=0;i<8;i++){
var ox2=W*0.1+i*W*0.12;
ctx.fillStyle='rgba(100,50,120,'+(0.15+0.1*Math.sin(titlePulse+i))+')';
ctx.beginPath();ctx.arc(ox2,H*0.75+Math.sin(titlePulse*0.5+i)*10,15+Math.sin(i)*5,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#cc4400';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';ctx.fillStyle='#ff4422';
ctx.fillText('R-TYPE',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ff8866';
ctx.fillText('CHARGE BEAM SHOOTER',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, HOLD Space to charge shot',W/2,H*0.62);
ctx.fillText('Release Space to fire (longer hold = bigger beam)',W/2,H*0.68);
ctx.fillText('Collect Force Pod for extra firepower!',W/2,H*0.74);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.3,W*0.6,H*0.38,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='FORCE '+forceLevel;
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
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initRType=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopRType=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
