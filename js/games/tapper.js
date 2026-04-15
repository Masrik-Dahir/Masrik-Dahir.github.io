// Tapper — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var bars=[],mugs=[],emptyMugs=[],customers=[],particles=[];
var playerBar=0,playerX=0;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keySpace=false;
var lastServe=0;
var BAR_COUNT=4,CUSTOMER_SPEED=40,MUG_SPEED=250,EMPTY_MUG_SPEED=200;
var SPAWN_TIMER=0,SPAWN_INTERVAL=2.5;
var barY=[],barLeft=0,barRight=0,barWidth=0;
var taps=[]; // decorative tap positions

// Difficulty progression: level 1-2 easy, 3-5 medium, 6+ hard
function getDiffMult(){
    return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
barWidth=W*0.75;
barLeft=W*0.12;
barRight=barLeft+barWidth;
for(var i=0;i<BAR_COUNT;i++){
barY[i]=H*0.18+i*(H*0.72/BAR_COUNT);
}
playerX=barRight-20;
}

function resetGame(){
score=0;lives=3;level=1;gameTime=0;
playerBar=0;playerX=barRight-20;
mugs=[];emptyMugs=[];customers=[];particles=[];
SPAWN_TIMER=0;SPAWN_INTERVAL=2.5;
// Start with a few customers
for(var b=0;b<BAR_COUNT;b++){
spawnCustomer(b);
}
gameState='playing';
}

function spawnCustomer(bar){
var dm=getDiffMult();
var speed=(CUSTOMER_SPEED+level*3+Math.random()*10)*dm;
customers.push({bar:bar,x:barLeft-30,targetX:barLeft+Math.random()*barWidth*0.6+20,speed:speed,
waiting:false,drinking:false,drinkTime:0,hasEmptyMug:false,leaving:false,
color:'hsl('+(Math.random()*360)+',60%,50%)',hat:Math.random()>0.5,
bodyH:20+Math.random()*6,headR:7+Math.random()*2});
}

function serveMug(){
if(gameTime-lastServe<0.2)return;
lastServe=gameTime;
mugs.push({bar:playerBar,x:playerX-10,speed:MUG_SPEED});
addParticles(playerX,barY[playerBar]-10,'#ffcc00',6);
addParticles(playerX,barY[playerBar]-10,'#ffffff',3);
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,
life:0.4+Math.random()*0.3,color:color,size:2+Math.random()*3});
}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
var dm=getDiffMult();

// Spawn customers - faster at higher difficulty
SPAWN_TIMER+=dt;
var si=Math.max(0.5,SPAWN_INTERVAL/(dm*0.8+0.2));
if(SPAWN_TIMER>=si){
SPAWN_TIMER=0;
var b=Math.floor(Math.random()*BAR_COUNT);
var countOnBar=0;
for(var i=0;i<customers.length;i++)if(customers[i].bar===b&&!customers[i].leaving)countOnBar++;
var maxOnBar=dm>1.2?5:4;
if(countOnBar<maxOnBar)spawnCustomer(b);
}

// Player movement
if(keyUp&&playerBar>0){playerBar--;keyUp=false;}
if(keyDown&&playerBar<BAR_COUNT-1){playerBar++;keyDown=false;}
if(keySpace||keyRight){serveMug();keySpace=false;keyRight=false;}

playerX=barRight-20;

// Update mugs sliding left
for(var i=mugs.length-1;i>=0;i--){
var m=mugs[i];
m.x-=m.speed*dt;
// Check if mug reaches a waiting customer
var hit=false;
for(var c=0;c<customers.length;c++){
var cu=customers[c];
if(cu.bar===m.bar&&cu.waiting&&!cu.drinking&&Math.abs(cu.x-m.x)<25){
cu.drinking=true;cu.waiting=false;
cu.drinkTime=Math.max(0.8,(1.5+Math.random()*1)/dm); // drink faster at higher difficulty
score+=50;addParticles(cu.x,barY[cu.bar]-15,'#00ff88',10);hit=true;break;
}
}
if(hit){mugs.splice(i,1);continue;}
// Mug falls off left end
if(m.x<barLeft-10){
mugs.splice(i,1);lives--;addParticles(barLeft,barY[m.bar],'#ff3333',12);
if(lives<=0)gameState='gameover';
}
}

// Update customers
for(var i=customers.length-1;i>=0;i--){
var c=customers[i];
if(c.leaving){
c.x-=c.speed*1.5*dt;
if(c.x<barLeft-40){customers.splice(i,1);continue;}
}else if(c.drinking){
c.drinkTime-=dt;
if(c.drinkTime<=0){
c.drinking=false;c.hasEmptyMug=true;
// Send empty mug back
emptyMugs.push({bar:c.bar,x:c.x,speed:EMPTY_MUG_SPEED*dm});
c.leaving=true;
score+=25;
}
}else if(!c.waiting){
c.x+=c.speed*dt;
if(c.x>=c.targetX){c.x=c.targetX;c.waiting=true;}
// Customer reaches the bar end - lose a life
if(c.x>=barRight-30&&c.waiting===false){
c.x=barRight-30;c.waiting=true;
}
if(c.waiting&&c.x>=barRight-30){
lives--;addParticles(barRight,barY[c.bar],'#ff3333',12);
customers.splice(i,1);
if(lives<=0)gameState='gameover';
continue;
}
}
}

// Update empty mugs sliding right toward player
for(var i=emptyMugs.length-1;i>=0;i--){
var em=emptyMugs[i];
em.x+=em.speed*dt;
// Player catches empty mug
if(em.bar===playerBar&&em.x>=playerX-20){
emptyMugs.splice(i,1);score+=100;
addParticles(playerX,barY[playerBar]-10,'#00ccff',10);continue;
}
// Empty mug falls off right end
if(em.x>barRight+10){
emptyMugs.splice(i,1);lives--;addParticles(barRight,barY[em.bar],'#ff3333',10);
if(lives<=0)gameState='gameover';
}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}

// Level up
if(customers.length===0&&gameTime>2){
level++;SPAWN_INTERVAL=Math.max(0.6,2.5-level*0.15);
for(var b=0;b<BAR_COUNT;b++)spawnCustomer(b);
}
}

function drawBar(idx){
var y=barY[idx];
var barH=14;
// Bar counter surface - rich wood gradient
ctx.save();
var grad=ctx.createLinearGradient(barLeft,y-barH/2,barLeft,y+barH/2);
grad.addColorStop(0,'#d8a850');grad.addColorStop(0.3,'#c8944a');grad.addColorStop(0.5,'#a06828');grad.addColorStop(0.8,'#7a4a18');grad.addColorStop(1,'#5a3210');
ctx.fillStyle=grad;
ctx.beginPath();ctx.roundRect(barLeft-5,y-barH/2,barWidth+10,barH,4);ctx.fill();
// Bar edge highlight
ctx.strokeStyle='rgba(220,180,100,0.5)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(barLeft,y-barH/2);ctx.lineTo(barRight,y-barH/2);ctx.stroke();
// wood grain texture
ctx.strokeStyle='rgba(60,30,10,0.15)';ctx.lineWidth=0.5;
for(var g=0;g<6;g++){
var gy=y-barH/2+2+g*(barH/6);
ctx.beginPath();ctx.moveTo(barLeft,gy);ctx.lineTo(barRight,gy);ctx.stroke();
}
// Bar supports (3D pillars)
for(var s=0;s<5;s++){
var sx=barLeft+s*(barWidth/4);
var pillarGrad=ctx.createLinearGradient(sx-2,y+barH/2,sx+4,y+barH/2);
pillarGrad.addColorStop(0,'#5a3210');pillarGrad.addColorStop(0.5,'#7a4a18');pillarGrad.addColorStop(1,'#4a2208');
ctx.fillStyle=pillarGrad;
ctx.fillRect(sx-2,y+barH/2,6,22);
}
// Brass tap at player end with glow
ctx.save();
ctx.shadowColor='#ffcc00';ctx.shadowBlur=4;
var tapGrad=ctx.createLinearGradient(barRight-7,y-32,barRight+3,y-32);
tapGrad.addColorStop(0,'#ddaa44');tapGrad.addColorStop(0.5,'#ffdd66');tapGrad.addColorStop(1,'#aa7722');
ctx.fillStyle=tapGrad;
ctx.fillRect(barRight-5,y-30,8,25);
ctx.fillStyle='#ffdd44';
ctx.beginPath();ctx.arc(barRight-1,y-32,7,0,Math.PI*2);ctx.fill();
// tap highlight
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();ctx.arc(barRight-2,y-34,3,0,Math.PI*2);ctx.fill();
ctx.restore();
ctx.restore();
}

function drawMug(x,y,full){
ctx.save();
// Beer mug with gradient
var mugGrad=ctx.createLinearGradient(x-8,y-18,x+8,y-18);
mugGrad.addColorStop(0,full?'#ffdd44':'#bbb');mugGrad.addColorStop(0.5,full?'#ffcc00':'#999');mugGrad.addColorStop(1,full?'#cc9900':'#777');
ctx.fillStyle=mugGrad;
ctx.beginPath();ctx.roundRect(x-8,y-18,16,16,2);ctx.fill();
// Handle with gradient
ctx.strokeStyle=full?'#cc9900':'#888';ctx.lineWidth=2.5;
ctx.beginPath();ctx.arc(x+10,y-10,5,-(Math.PI/2),Math.PI/2);ctx.stroke();
// Foam with bubbly texture
if(full){
var foamGrad=ctx.createLinearGradient(x-8,y-22,x-8,y-17);
foamGrad.addColorStop(0,'#ffffff');foamGrad.addColorStop(1,'#eeeedd');
ctx.fillStyle=foamGrad;
ctx.beginPath();ctx.roundRect(x-8,y-21,16,6,3);ctx.fill();
// foam bubbles
ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.beginPath();ctx.arc(x-3,y-19,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+3,y-19,1.5,0,Math.PI*2);ctx.fill();
// beer bubbles rising
ctx.fillStyle='rgba(255,255,200,0.3)';
for(var b=0;b<3;b++){
var bx=x-4+b*4;var by=y-8-Math.abs(Math.sin(gameTime*5+b*2))*5;
ctx.beginPath();ctx.arc(bx,by,1,0,Math.PI*2);ctx.fill();
}
}
// Glass shine
ctx.fillStyle='rgba(255,255,255,0.25)';
ctx.fillRect(x-6,y-16,2.5,10);
ctx.restore();
}

function drawCustomer(c){
var y=barY[c.bar];
var x=c.x;
ctx.save();
// Body with gradient
var bodyGrad=ctx.createLinearGradient(x-10,y-35,x+10,y-35);
bodyGrad.addColorStop(0,c.color);
var hsl=c.color.match(/hsl\((\d+),/);
var darkColor=hsl?'hsl('+hsl[1]+',60%,35%)':c.color;
bodyGrad.addColorStop(1,darkColor);
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.roundRect(x-10,y-35,20,c.bodyH||25,4);ctx.fill();
// shirt detail
ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(x,y-35);ctx.lineTo(x,y-12);ctx.stroke();
// Head with skin gradient
var headGrad=ctx.createRadialGradient(x-1,y-44,1,x,y-42,c.headR||8);
headGrad.addColorStop(0,'#ffe0b2');headGrad.addColorStop(1,'#e8b878');
ctx.fillStyle=headGrad;
ctx.beginPath();ctx.arc(x,y-42,c.headR||8,0,Math.PI*2);ctx.fill();
// Eyes
ctx.fillStyle='#222';
ctx.fillRect(x-4,y-44,2,2);ctx.fillRect(x+2,y-44,2,2);
// Mouth
ctx.strokeStyle='#aa6633';ctx.lineWidth=1;
if(c.drinking){
ctx.beginPath();ctx.arc(x,y-39,2,0,Math.PI);ctx.stroke();
}else{
ctx.beginPath();ctx.moveTo(x-2,y-39);ctx.lineTo(x+2,y-39);ctx.stroke();
}
// Hat with gradient
if(c.hat){
var hatGrad=ctx.createLinearGradient(x-7,y-56,x-7,y-48);
hatGrad.addColorStop(0,c.color);hatGrad.addColorStop(1,darkColor);
ctx.fillStyle=hatGrad;
ctx.fillRect(x-7,y-52,14,4);ctx.fillRect(x-4,y-56,8,5);
}
// Waiting indicator with glow
if(c.waiting&&!c.drinking){
var blink=Math.sin(gameTime*6)>0?1:0.4;
ctx.save();
ctx.shadowColor='#ff3333';ctx.shadowBlur=6*blink;
ctx.fillStyle='rgba(255,80,80,'+blink+')';ctx.font='bold 14px monospace';ctx.textAlign='center';
ctx.fillText('!',x,y-58);
ctx.restore();
}
// Drinking animation
if(c.drinking){
ctx.fillStyle='rgba(255,200,0,0.6)';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('*gulp*',x,y-58);
}
ctx.restore();
}

function drawPlayer(){
var y=barY[playerBar];
var x=playerX;
ctx.save();
// Bartender body - white apron with gradient
var apronGrad=ctx.createLinearGradient(x-12,y-38,x-12,y-10);
apronGrad.addColorStop(0,'#ffffff');apronGrad.addColorStop(1,'#dddddd');
ctx.fillStyle=apronGrad;
ctx.beginPath();ctx.roundRect(x-12,y-38,24,28,4);ctx.fill();
// Vest with gradient
var vestGrad=ctx.createLinearGradient(x-10,y-36,x-10,y-14);
vestGrad.addColorStop(0,'#ee3333');vestGrad.addColorStop(1,'#aa1111');
ctx.fillStyle=vestGrad;
ctx.beginPath();ctx.roundRect(x-10,y-36,8,22,2);ctx.fill();
ctx.beginPath();ctx.roundRect(x+2,y-36,8,22,2);ctx.fill();
// Buttons
ctx.fillStyle='#ffcc00';
ctx.beginPath();ctx.arc(x,y-30,1.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x,y-24,1.5,0,Math.PI*2);ctx.fill();
// Head with skin gradient
var headGrad=ctx.createRadialGradient(x-1,y-47,1,x,y-45,9);
headGrad.addColorStop(0,'#ffe0b2');headGrad.addColorStop(1,'#e8b878');
ctx.fillStyle=headGrad;
ctx.beginPath();ctx.arc(x,y-45,9,0,Math.PI*2);ctx.fill();
// Mustache
ctx.strokeStyle='#553300';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(x-3,y-42,3,0,Math.PI,true);ctx.stroke();
ctx.beginPath();ctx.arc(x+3,y-42,3,0,Math.PI,true);ctx.stroke();
// Eyes
ctx.fillStyle='#222';
ctx.fillRect(x-4,y-47,2,2);ctx.fillRect(x+2,y-47,2,2);
// Eye highlights
ctx.fillStyle='#fff';
ctx.fillRect(x-4,y-48,1,1);ctx.fillRect(x+2,y-48,1,1);
// Indicator arrow with glow
ctx.save();
ctx.shadowColor='#ffcc00';ctx.shadowBlur=6;
ctx.fillStyle='#ffcc00';ctx.font='bold 14px monospace';ctx.textAlign='center';
var bounce=Math.sin(gameTime*4)*3;
ctx.fillText('\u25C4',x+20,y-25+bounce);
ctx.restore();
ctx.restore();
}

function render(){
// Background - bar room with depth gradient
ctx.save();
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#1a0800');bg.addColorStop(0.2,'#2a1508');bg.addColorStop(0.6,'#1a0e05');bg.addColorStop(1,'#0a0500');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Back wall with brick pattern
ctx.fillStyle='rgba(60,30,10,0.2)';
for(var by=0;by<H*0.15;by+=12){
for(var bx=0;bx<W;bx+=25){
var offset=(Math.floor(by/12)%2)*12;
ctx.fillRect(bx+offset,by,23,10);
ctx.strokeStyle='rgba(40,20,5,0.3)';ctx.lineWidth=0.5;
ctx.strokeRect(bx+offset,by,23,10);
}
}

// Shelves with improved 3D look
for(var i=0;i<3;i++){
var sy=H*0.03+i*H*0.05;
var shelfGrad=ctx.createLinearGradient(W*0.15,sy,W*0.15,sy+6);
shelfGrad.addColorStop(0,'rgba(160,100,40,0.5)');shelfGrad.addColorStop(1,'rgba(80,50,20,0.5)');
ctx.fillStyle=shelfGrad;ctx.fillRect(W*0.15,sy,W*0.7,5);
// Bottles on shelves with glass effect
for(var b=0;b<8;b++){
var bx=W*0.18+b*(W*0.08);
var hue=(b*45+i*120)%360;
var bottleGrad=ctx.createLinearGradient(bx,sy-18,bx+10,sy-18);
bottleGrad.addColorStop(0,'hsla('+hue+',50%,45%,0.6)');
bottleGrad.addColorStop(0.5,'hsla('+hue+',60%,55%,0.6)');
bottleGrad.addColorStop(1,'hsla('+hue+',50%,35%,0.6)');
ctx.fillStyle=bottleGrad;
ctx.fillRect(bx,sy-18,10,18);
// bottle neck
ctx.fillRect(bx+3,sy-22,4,5);
// glass shine
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(bx+2,sy-15,2,10);
// label
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(bx+1,sy-10,8,5);
}
}

// Ambient light from above
var ambGrad=ctx.createRadialGradient(W/2,0,0,W/2,0,W*0.6);
ambGrad.addColorStop(0,'rgba(255,200,100,0.08)');ambGrad.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=ambGrad;ctx.fillRect(0,0,W,H);

// Draw bars
for(var i=0;i<BAR_COUNT;i++)drawBar(i);

// Draw mugs
for(var i=0;i<mugs.length;i++){
var m=mugs[i];drawMug(m.x,barY[m.bar],true);
}
for(var i=0;i<emptyMugs.length;i++){
var em=emptyMugs[i];drawMug(em.x,barY[em.bar],false);
}

// Draw customers
for(var i=0;i<customers.length;i++)drawCustomer(customers[i]);

// Draw player
drawPlayer();

// Particles with glow
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);
ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=4;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;

// Lives display with glow
ctx.save();
ctx.shadowColor='#ff4444';ctx.shadowBlur=4;
ctx.fillStyle='#ff6666';ctx.font='16px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++){
ctx.fillText('\u2665',10+i*22,H-10);
}
ctx.restore();
// Level display
ctx.fillStyle='#ccaa66';ctx.font='bold 13px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('LEVEL '+level,W-15,H-10);
// Score
ctx.save();
ctx.shadowColor='#ffcc00';ctx.shadowBlur=6;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
ctx.textAlign='center';ctx.fillText('SCORE: '+score,W/2,H*0.04+12);
ctx.restore();
ctx.restore();
}

function drawTitle(dt){
ctx.fillStyle='#1a0a00';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// gradient bg
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#2a1508');bg.addColorStop(0.5,'#1a0a00');bg.addColorStop(1,'#0a0500');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Decorative bottles with glow
for(var i=0;i<12;i++){
var bx=W*0.1+i*(W*0.07);var by=H*0.15;
var hue=(i*30+titlePulse*20)%360;
ctx.save();
var bottleGrad=ctx.createLinearGradient(bx,by-5,bx+12,by-5);
bottleGrad.addColorStop(0,'hsla('+hue+',60%,45%,0.7)');
bottleGrad.addColorStop(0.5,'hsla('+hue+',70%,55%,0.7)');
bottleGrad.addColorStop(1,'hsla('+hue+',60%,35%,0.7)');
ctx.fillStyle=bottleGrad;
ctx.fillRect(bx,by,12,28);
ctx.fillRect(bx+3,by-5,6,6);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(bx+3,by+4,2,14);
ctx.restore();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('TAPPER',W/2,H*0.35);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#cc9944';
ctx.fillText('SERVE \'EM UP!',W/2,H*0.43);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Up/Down to switch bars, Right/Space to serve',W/2,H*0.65);
ctx.fillText('Catch empty mugs returning to you!',W/2,H*0.72);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';
ctx.beginPath();ctx.roundRect(W*0.2,H*0.32,W*0.6,H*0.35,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Level: '+level+'  Time: '+gameTime.toFixed(1)+'s',W/2,H*0.62);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
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

window.initTapper=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;keySpace=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopTapper=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keySpace=false;
};
})();
