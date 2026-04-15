// Gradius — Full Game
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
var powerups=[],terrain=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var lastShot=0,scrollX=0,scrollSpeed=40;
var PLAYER_SPEED=200,BULLET_SPEED=500;

// Power-up bar system: SPEED, MISSILE, DOUBLE, LASER, OPTION, SHIELD
var POWERUP_NAMES=['SPEED','MISSILE','DOUBLE','LASER','OPTION','SHIELD'];
var capsules=0,powerBar=0; // powerBar = currently highlighted slot (0-5)
var speedLevel=0,hasMissile=false,hasDouble=false,hasLaser=false;
var options=[],hasShield=false,shieldHp=0;
var OPTION_MAX=2;

// Difficulty progression: time-based easy->medium->hard
function getDiffMult(){
    if(gameTime<=30)return 0.7;
    if(gameTime<=90)return 1.0;
    return 1.0+(gameTime-90)*0.005;
}

// Terrain generation
var terrainTop=[],terrainBot=[];
var TERRAIN_SEG=200,terrainGenX=0;

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:0.5+Math.random()*1.5,sp:20+Math.random()*60});
generateTerrain();
}

function generateTerrain(){
terrainTop=[];terrainBot=[];terrainGenX=0;
for(var i=0;i<TERRAIN_SEG;i++){
var x2=i*80;
terrainTop.push({x:x2,y:20+Math.sin(i*0.2)*H*0.05+Math.sin(i*0.07)*H*0.03});
terrainBot.push({x:x2,y:H-20-Math.sin(i*0.15+1)*H*0.05-Math.sin(i*0.09)*H*0.03});
terrainGenX=x2;
}
}

function resetGame(){
score=0;lives=3;gameTime=0;scrollX=0;scrollSpeed=40;
player={x:W*0.15,y:H/2,invince:2};
bullets=[];enemies=[];enemyBullets=[];particles=[];powerups=[];
capsules=0;powerBar=0;speedLevel=0;
hasMissile=false;hasDouble=false;hasLaser=false;
options=[];hasShield=false;shieldHp=0;
generateTerrain();
gameState='playing';
}

function activatePower(){
if(capsules<=0)return;
capsules--;
switch(powerBar){
case 0:speedLevel=Math.min(speedLevel+1,3);break;
case 1:hasMissile=true;break;
case 2:hasDouble=true;break;
case 3:hasLaser=true;break;
case 4:if(options.length<OPTION_MAX)options.push({x:player.x-30*(options.length+1),y:player.y,trail:[]});break;
case 5:hasShield=true;shieldHp=3;break;
}
addParticles(player.x,player.y,'#ff8800',12);
}

function spawnEnemy(){
var types=['grunt','moai','volcano','wave'];
var type=types[Math.floor(Math.random()*types.length)];
var ey=H*0.15+Math.random()*H*0.7;
var dm2=getDiffMult();
var e={x:W+30,y:ey,type:type,hp:Math.round(2*dm2),timer:0,speed:(60+Math.random()*40)*dm2,
vx:-(60+Math.random()*40)*dm2,vy:0,size:15};
if(type==='moai'){e.hp=Math.round(5*dm2);e.size=25;e.speed=20*dm2;e.vx=-20*dm2;}
if(type==='volcano'){e.hp=Math.round(4*dm2);e.size=20;e.y=H*0.7+Math.random()*H*0.15;e.vx=-30*dm2;}
if(type==='wave'){e.vy=80*dm2;e.phase=Math.random()*Math.PI*2;}
enemies.push(e);
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,
life:0.3+Math.random()*0.4,color:color,size:1.5+Math.random()*3});
}

function shoot(){
if(gameTime-lastShot<0.1)return;
lastShot=gameTime;
var spd=BULLET_SPEED+speedLevel*50;
if(hasLaser){
bullets.push({x:player.x+20,y:player.y,vx:spd*1.5,vy:0,laser:true,life:0.4,damage:3});
}else{
bullets.push({x:player.x+20,y:player.y,vx:spd,vy:0,laser:false,life:1.5,damage:1});
if(hasDouble){
bullets.push({x:player.x+15,y:player.y-10,vx:spd,vy:-spd*0.15,laser:false,life:1.2,damage:1});
}
}
if(hasMissile){
bullets.push({x:player.x+10,y:player.y+8,vx:spd*0.6,vy:spd*0.3,laser:false,life:1.0,damage:2,missile:true});
}
// Options also shoot
for(var i=0;i<options.length;i++){
bullets.push({x:options[i].x+15,y:options[i].y,vx:spd,vy:0,laser:false,life:1.2,damage:1});
}
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
scrollX+=scrollSpeed*dt;
if(player.invince>0)player.invince-=dt;

// Spawn enemies periodically - rate scales with difficulty
var dm=getDiffMult();
if(Math.random()<dt*(0.6+gameTime*0.008)*dm){spawnEnemy();}
// Spawn power capsules
if(Math.random()<dt*0.15){
powerups.push({x:W+10,y:H*0.2+Math.random()*H*0.6,vx:-50,type:'capsule'});
}

// Player movement
var spd2=PLAYER_SPEED+speedLevel*40;
if(keyLeft)player.x-=spd2*dt;
if(keyRight)player.x+=spd2*dt;
if(keyUp)player.y-=spd2*dt;
if(keyDown)player.y+=spd2*dt;
player.x=Math.max(15,Math.min(W-15,player.x));
player.y=Math.max(15,Math.min(H-15,player.y));

// Shooting
if(keySpace)shoot();

// Options follow player with delay
for(var i=0;i<options.length;i++){
var o=options[i];
o.trail.push({x:player.x,y:player.y});
if(o.trail.length>15*(i+1)){
var t2=o.trail.shift();
o.x+=(t2.x-30*(i+1)-o.x)*0.3;
o.y+=(t2.y-o.y)*0.3;
}
}

// Bullets
for(var i=bullets.length-1;i>=0;i--){
var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.missile){b.vy+=200*dt;} // missiles arc downward
if(b.x>W+20||b.x<-20||b.y<-20||b.y>H+20||b.life<=0){bullets.splice(i,1);}
}

// Enemies
for(var i=enemies.length-1;i>=0;i--){
var e=enemies[i];
e.x+=e.vx*dt;
if(e.type==='wave'){e.y+=Math.sin(gameTime*3+e.phase)*e.vy*dt;}
e.timer+=dt;
// Enemy shooting - rate scales with difficulty
var shootThresh=Math.max(1.2,2.5/getDiffMult());
if(e.timer>shootThresh&&Math.random()<dt*0.3*getDiffMult()){
e.timer=0;
var dx3=player.x-e.x,dy3=player.y-e.y,d3=Math.sqrt(dx3*dx3+dy3*dy3);
if(d3>0)enemyBullets.push({x:e.x,y:e.y,vx:dx3/d3*120,vy:dy3/d3*120,life:3});
}
// Remove if off screen left
if(e.x<-50){enemies.splice(i,1);continue;}

// Bullet-enemy collision
for(var j=bullets.length-1;j>=0;j--){
var b2=bullets[j];
var dx4=b2.x-e.x,dy4=b2.y-e.y;
if(dx4*dx4+dy4*dy4<(e.size+5)*(e.size+5)){
e.hp-=b2.damage;
addParticles(e.x,e.y,'#ffaa00',4);
if(!b2.laser)bullets.splice(j,1);
if(e.hp<=0){
score+=[0,0,100,200,150,50][['','grunt','moai','volcano','wave'].indexOf(e.type)]||100;
addParticles(e.x,e.y,'#ff4400',12);
enemies.splice(i,1);break;
}
}
}
}

// Enemy bullets
for(var i=enemyBullets.length-1;i>=0;i--){
var eb=enemyBullets[i];
eb.x+=eb.vx*dt;eb.y+=eb.vy*dt;eb.life-=dt;
if(eb.life<=0||eb.x<-20||eb.x>W+20){enemyBullets.splice(i,1);continue;}
// Hit player
if(player.invince<=0){
var dx5=eb.x-player.x,dy5=eb.y-player.y;
if(dx5*dx5+dy5*dy5<400){
if(hasShield&&shieldHp>0){shieldHp--;enemyBullets.splice(i,1);
if(shieldHp<=0)hasShield=false;continue;}
playerHit();enemyBullets.splice(i,1);
}
}
}

// Player-enemy collision
if(player.invince<=0){
for(var i=0;i<enemies.length;i++){
var e2=enemies[i];
var dx6=e2.x-player.x,dy6=e2.y-player.y;
if(dx6*dx6+dy6*dy6<(e2.size+12)*(e2.size+12)){
if(hasShield&&shieldHp>0){shieldHp--;if(shieldHp<=0)hasShield=false;continue;}
playerHit();break;
}
}
}

// Powerup collection
for(var i=powerups.length-1;i>=0;i--){
var pu=powerups[i];
pu.x+=pu.vx*dt;
if(pu.x<-20){powerups.splice(i,1);continue;}
var dx7=pu.x-player.x,dy7=pu.y-player.y;
if(dx7*dx7+dy7*dy7<600){
capsules=Math.min(capsules+1,6);
powerBar=(powerBar+1)%6;
addParticles(pu.x,pu.y,'#ff8800',8);
powerups.splice(i,1);
}
}

// Stars parallax
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
lives--;player.invince=2;
addParticles(player.x,player.y,'#00ccff',20);
// Lose powerups
speedLevel=Math.max(0,speedLevel-1);
options=[];hasMissile=false;hasDouble=false;hasLaser=false;hasShield=false;
player.x=W*0.15;player.y=H/2;
if(lives<=0)gameState='gameover';
}

function drawShip(x,y,alpha){
ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
// Ship shadow
ctx.fillStyle='rgba(0,0,0,0.2)';
ctx.beginPath();ctx.moveTo(16,3);ctx.lineTo(-12,-7);ctx.lineTo(-15,0);ctx.lineTo(-12,13);ctx.closePath();ctx.fill();
// Ship body with enhanced gradient
var grad=ctx.createLinearGradient(-15,-10,15,10);
grad.addColorStop(0,'#3366cc');grad.addColorStop(0.3,'#6699ee');grad.addColorStop(0.5,'#88bbff');grad.addColorStop(0.7,'#4477dd');grad.addColorStop(1,'#2244aa');
ctx.fillStyle=grad;
ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-12,-10);ctx.lineTo(-15,-4);ctx.lineTo(-10,0);
ctx.lineTo(-15,4);ctx.lineTo(-12,10);ctx.closePath();ctx.fill();
// Wing highlights
ctx.fillStyle='rgba(255,255,255,0.15)';
ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-10,-9);ctx.lineTo(-13,-4);ctx.lineTo(5,-1);ctx.closePath();ctx.fill();
// Wing stripe
ctx.fillStyle='#ff4422';ctx.fillRect(-8,-10,8,2);ctx.fillRect(-8,8,8,2);
// Cockpit with gradient
var cockGrad=ctx.createRadialGradient(4,-2,0,5,-1,4);
cockGrad.addColorStop(0,'rgba(200,250,255,0.7)');cockGrad.addColorStop(1,'rgba(100,180,255,0.3)');
ctx.fillStyle=cockGrad;
ctx.beginPath();ctx.arc(5,-1,4,0,Math.PI*2);ctx.fill();
// Engine glow with gradient
ctx.save();
ctx.shadowColor='#ff6622';ctx.shadowBlur=8;
var engLen=6+Math.random()*6;
var engGrad=ctx.createLinearGradient(-14,0,-14-engLen,0);
engGrad.addColorStop(0,'#ffaa44');engGrad.addColorStop(0.5,'#ff6622');engGrad.addColorStop(1,'rgba(255,50,0,0)');
ctx.fillStyle=engGrad;
ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(-14-engLen,0);ctx.lineTo(-14,3);ctx.fill();
ctx.restore();
// Shield with double ring
if(hasShield){
ctx.save();
ctx.shadowColor='rgba(100,200,255,0.5)';ctx.shadowBlur=10;
ctx.strokeStyle='rgba(100,200,255,'+(0.3+0.2*Math.sin(gameTime*6))+')';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle='rgba(100,200,255,'+(0.15+0.1*Math.sin(gameTime*8))+')';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(0,0,23,0,Math.PI*2);ctx.stroke();
ctx.restore();
}
ctx.restore();
}

function drawOption(x,y){
ctx.save();ctx.translate(x,y);
var glow=0.5+0.3*Math.sin(gameTime*5);
ctx.fillStyle='rgba(255,100,0,'+glow+')';
ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffcc00';
ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function render(){
// Background with nebula gradient
var bgGrad=ctx.createLinearGradient(0,0,0,H);
bgGrad.addColorStop(0,'#050520');bgGrad.addColorStop(0.3,'#0a0a2e');bgGrad.addColorStop(0.7,'#0a0830');bgGrad.addColorStop(1,'#050520');
ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
// Nebula glow
var nebGrad=ctx.createRadialGradient(W*0.6,H*0.3,0,W*0.6,H*0.3,W*0.4);
nebGrad.addColorStop(0,'rgba(40,20,80,0.15)');nebGrad.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=nebGrad;ctx.fillRect(0,0,W,H);

// Stars with varied brightness
for(var i=0;i<stars.length;i++){
var s=stars[i];
var bright=0.3+0.3*Math.sin(gameTime*0.8+i*1.3);
ctx.fillStyle='rgba(200,210,255,'+bright+')';
ctx.beginPath();ctx.arc(s.x,s.y,s.s*0.6,0,Math.PI*2);ctx.fill();
}

// Terrain (top and bottom) with gradient
var terrGrad=ctx.createLinearGradient(0,0,0,H*0.15);
terrGrad.addColorStop(0,'#3a2a4a');terrGrad.addColorStop(1,'#1a0a2a');
ctx.fillStyle=terrGrad;
ctx.beginPath();ctx.moveTo(0,0);
for(var i=0;i<terrainTop.length;i++){
var tx2=terrainTop[i].x-scrollX%((TERRAIN_SEG-1)*80);
if(tx2>-100&&tx2<W+100)ctx.lineTo(tx2,terrainTop[i].y);
}
ctx.lineTo(W,0);ctx.closePath();ctx.fill();

ctx.beginPath();ctx.moveTo(0,H);
for(var i=0;i<terrainBot.length;i++){
var tx3=terrainBot[i].x-scrollX%((TERRAIN_SEG-1)*80);
if(tx3>-100&&tx3<W+100)ctx.lineTo(tx3,terrainBot[i].y);
}
ctx.lineTo(W,H);ctx.closePath();ctx.fill();

// Moai heads in terrain
var moaiX=(300-scrollX%600+W)%(W+200)-100;
ctx.fillStyle='#5a4a3a';
ctx.beginPath();ctx.roundRect(moaiX,H*0.65,30,H*0.2,4);ctx.fill();
ctx.fillStyle='#6a5a4a';
ctx.beginPath();ctx.arc(moaiX+15,H*0.63,18,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#333';
ctx.fillRect(moaiX+6,H*0.6,5,4);ctx.fillRect(moaiX+18,H*0.6,5,4);

// Enemies
for(var i=0;i<enemies.length;i++){
var e=enemies[i];
ctx.save();ctx.translate(e.x,e.y);
if(e.type==='grunt'){
ctx.fillStyle='#ff4466';
ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(0,-10);ctx.lineTo(12,0);ctx.lineTo(0,10);ctx.closePath();ctx.fill();
ctx.fillStyle='#ff88aa';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
}else if(e.type==='moai'){
ctx.fillStyle='#aa8866';
ctx.beginPath();ctx.roundRect(-15,-20,30,40,5);ctx.fill();
ctx.fillStyle='#333';ctx.fillRect(-8,-10,5,5);ctx.fillRect(3,-10,5,5);
ctx.fillRect(-5,5,10,3);
}else if(e.type==='volcano'){
ctx.fillStyle='#884422';
ctx.beginPath();ctx.moveTo(-15,10);ctx.lineTo(-5,-15);ctx.lineTo(5,-15);ctx.lineTo(15,10);ctx.closePath();ctx.fill();
ctx.fillStyle='#ff4400';ctx.beginPath();ctx.arc(0,-15,5+Math.sin(gameTime*4)*2,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle='#44ccff';
ctx.beginPath();ctx.arc(0,0,e.size*0.6,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#88eeff';ctx.lineWidth=1.5;ctx.stroke();
}
ctx.restore();
}

// Powerups
for(var i=0;i<powerups.length;i++){
var pu=powerups[i];
ctx.save();ctx.translate(pu.x,pu.y);
ctx.fillStyle='rgba(255,100,0,0.3)';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff6600';ctx.font='bold 10px monospace';ctx.textAlign='center';
ctx.fillText('P',0,4);ctx.restore();
}

// Player bullets
for(var i=0;i<bullets.length;i++){
var b=bullets[i];
if(b.laser){
ctx.strokeStyle='#00ccff';ctx.shadowColor='#00ccff';ctx.shadowBlur=8;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+40,b.y);ctx.stroke();
}else if(b.missile){
ctx.fillStyle='#ff4400';ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();
}
}
ctx.shadowBlur=0;

// Enemy bullets
ctx.fillStyle='#ff3366';
for(var i=0;i<enemyBullets.length;i++){
var eb=enemyBullets[i];
ctx.beginPath();ctx.arc(eb.x,eb.y,3,0,Math.PI*2);ctx.fill();
}

// Options
for(var i=0;i<options.length;i++)drawOption(options[i].x,options[i].y);

// Player
var alpha2=player.invince>0?(Math.sin(gameTime*15)>0?0.3:0.9):1;
drawShip(player.x,player.y,alpha2);

// Particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

// Power bar UI
var barW2=W*0.5,barH2=16,barX2=W*0.25,barY2=H-25;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(barX2-2,barY2-2,barW2+4,barH2+4);
var sw=barW2/6;
for(var i=0;i<6;i++){
ctx.fillStyle=i<capsules?'rgba(255,120,0,0.6)':'rgba(50,50,50,0.6)';
ctx.fillRect(barX2+i*sw+1,barY2,sw-2,barH2);
ctx.fillStyle=i===powerBar?'#fff':'#888';
ctx.font='bold 9px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(POWERUP_NAMES[i],barX2+i*sw+sw/2,barY2+11);
}
// Highlight current selection
ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
ctx.strokeRect(barX2+powerBar*sw,barY2-1,sw,barH2+2);

// Lives
ctx.fillStyle='#4488ff';ctx.font='14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++)ctx.fillText('\u25C6',10+i*20,H-10);
}

function drawTitle(dt){
titlePulse+=dt*3;
ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);
// Scrolling stars
for(var i=0;i<60;i++){
var sx2=(i*97+titlePulse*20)%W;var sy2=(i*53+7)%(H);
ctx.fillStyle='rgba(255,255,255,'+(0.2+0.2*Math.sin(titlePulse+i))+')';
ctx.fillRect(sx2,sy2,1.5,1.5);
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#4488ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#4488ff';
ctx.fillText('GRADIUS',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#88bbff';
ctx.fillText('HORIZONTAL SHOOTER',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, Space to shoot',W/2,H*0.62);
ctx.fillText('Collect capsules (P) then press Enter to activate power',W/2,H*0.68);
ctx.fillText('SPEED > MISSILE > DOUBLE > LASER > OPTION > SHIELD',W/2,H*0.74);
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
document.getElementById('hud-speed').textContent='SPD '+speedLevel;
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
if(down&&(e.key==='Enter'||e.key==='Tab')){
if(gameState!=='playing'){resetGame();}
else if(capsules>0){activatePower();}
}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initGradius=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopGradius=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
