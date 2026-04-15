// Paperboy — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var papersLeft=15,totalDeliveries=0,windowsBroken=0,obstaclesDodged=0;
var player,houses=[],obstacles=[],papers=[],particles=[],targets=[];
var scrollX=0,scrollSpeed=0,baseScrollSpeed=100;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12); }
var STREET_TOP,STREET_BOTTOM,LANE_H,SIDEWALK_H;
var keyUp=false,keyDown=false,keyLeft=false,keyRight=false;
var pedalTimer=0,throwCooldown=0;
var streetLength=0,bonusCourse=false,bonusTargets=[],bonusScore=0;
var housesDelivered=0,subscriberCount=0;
var dodgeTracker={};

// ---- helpers ----
function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v;}
function lerp(a,b,t){return a+(b-a)*t;}
function randRange(lo,hi){return lo+Math.random()*(hi-lo);}
function shadeColor(c,pct){var n=parseInt(c.replace('#',''),16);
var r=clamp((n>>16)+pct,0,255);var g=clamp(((n>>8)&0xFF)+pct,0,255);var b=clamp((n&0xFF)+pct,0,255);
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
SIDEWALK_H=H*0.12;STREET_TOP=H*0.42;STREET_BOTTOM=H*0.88;LANE_H=(STREET_BOTTOM-STREET_TOP)/4;}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.4+Math.random()*0.3,color:color,size:2+Math.random()*3});}

// ---- house generation ----
function generateHouses(){
houses=[];
var houseW=W*0.12;var gap=W*0.04;
var numHouses=12+level*2;subscriberCount=0;
streetLength=(houseW+gap)*numHouses+W*2;
for(var i=0;i<numHouses;i++){
var isSubscriber=Math.random()<0.55;
if(isSubscriber)subscriberCount++;
houses.push({
x:W*0.6+i*(houseW+gap),
y:H*0.05,
w:houseW,
h:H*0.32,
subscriber:isSubscriber,
delivered:false,
windowBroken:false,
doorColor:isSubscriber?'#3366cc':'#cc3333',
roofColor:['#884422','#665544','#aa5533','#556644','#774433'][i%5],
wallColor:['#eeddcc','#ddeeff','#ffe8cc','#e8ffe8','#ffe8e8'][i%5],
mailboxX:0,
hasMailbox:isSubscriber
});}
// set mailbox positions
for(var i=0;i<houses.length;i++){
houses[i].mailboxX=houses[i].x+houses[i].w*0.8;}}

// ---- obstacle generation ----
function generateObstacles(){
obstacles=[];dodgeTracker={};
var numObs=4+level*2;
for(var i=0;i<numObs;i++){
var lane=Math.floor(Math.random()*4);
var type=['car','dog','kid_trike','skater','mower'][Math.floor(Math.random()*5)];
var ox=W+randRange(200,streetLength-W);
var spd=0;
if(type==='car')spd=randRange(40,80);
else if(type==='dog')spd=randRange(20,50);
else if(type==='kid_trike')spd=randRange(15,35);
else if(type==='skater')spd=randRange(30,60);
else spd=randRange(10,25);
var dir=Math.random()<0.5?1:-1;
obstacles.push({
x:ox,y:STREET_TOP+lane*LANE_H+LANE_H*0.2,
w:type==='car'?60:30,h:type==='car'?25:20,
type:type,speed:spd*dir,
lane:lane,baseX:ox,alive:true,
dodged:false,id:i
});
dodgeTracker[i]=false;}}

// ---- bonus course targets ----
function generateBonusTargets(){
bonusTargets=[];bonusScore=0;
for(var i=0;i<8;i++){
bonusTargets.push({
x:streetLength+W*0.5+i*W*0.2,
y:STREET_TOP-H*0.15+Math.sin(i*1.2)*H*0.08,
w:30,h:30,hit:false
});}}

// ---- reset ----
function resetGame(){
score=0;lives=3;level=1;gameTime=0;papersLeft=15;totalDeliveries=0;windowsBroken=0;obstaclesDodged=0;
scrollX=0;scrollSpeed=baseScrollSpeed;bonusCourse=false;housesDelivered=0;
player={x:W*0.12,y:(STREET_TOP+STREET_BOTTOM)/2,vy:0,vx:0,crashed:false,crashTimer:0};
pedalTimer=0;throwCooldown=0;
papers=[];particles=[];
resize();generateHouses();generateObstacles();generateBonusTargets();
gameState='playing';}

function nextLevel(){
level++;papersLeft=15;scrollX=0;scrollSpeed=baseScrollSpeed+level*8;bonusCourse=false;housesDelivered=0;
player.x=W*0.12;player.crashed=false;player.crashTimer=0;
papers=[];particles=[];
generateHouses();generateObstacles();generateBonusTargets();}

// ---- throw paper ----
function throwPaper(){
if(gameState!=='playing')return;
if(papersLeft<=0||throwCooldown>0||player.crashed)return;
papersLeft--;throwCooldown=0.25;
// paper arcs upward toward houses
papers.push({
x:player.x+15,y:player.y-10,
vx:120+scrollSpeed*0.5,vy:-180,
gravity:350,active:true,age:0
});}

// ---- update ----
function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;pedalTimer+=dt*8;throwCooldown=Math.max(0,throwCooldown-dt);

// crash recovery
if(player.crashed){player.crashTimer-=dt;
if(player.crashTimer<=0){player.crashed=false;}
return;}

// player movement
var moveSpeed=200;
if(keyUp)player.vy=-moveSpeed;
else if(keyDown)player.vy=moveSpeed;
else player.vy*=0.85;
if(keyRight){scrollSpeed=Math.min(baseScrollSpeed*2+level*10,scrollSpeed+150*dt);}
else if(keyLeft){scrollSpeed=Math.max(40,scrollSpeed-200*dt);}
else{scrollSpeed+=(baseScrollSpeed+level*8-scrollSpeed)*2*dt;}

player.y+=player.vy*dt;
player.y=clamp(player.y,STREET_TOP+10,STREET_BOTTOM-10);

// scroll street
scrollX+=scrollSpeed*dt;

// check if street ended
var endX=bonusCourse?streetLength+W*2.5:streetLength;
if(scrollX>=endX){
if(!bonusCourse){bonusCourse=true;}
else{// level complete
score+=bonusScore;nextLevel();return;}}

// papers physics
for(var i=papers.length-1;i>=0;i--){
var p=papers[i];if(!p.active){continue;}
p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;
// check paper vs houses
for(var j=0;j<houses.length;j++){
var h=houses[j];
var hScreenX=h.x-scrollX;
// mailbox hit (subscriber delivery)
if(h.subscriber&&!h.delivered){
var mbx=h.mailboxX-scrollX;
var mby=STREET_TOP-15;
if(p.x>mbx-20&&p.x<mbx+20&&p.y>mby-20&&p.y<mby+20){
h.delivered=true;p.active=false;score+=250;housesDelivered++;totalDeliveries++;
addParticles(p.x,p.y,'#ffcc00',12);break;}}
// window hit (non-subscriber bonus)
if(!h.subscriber&&!h.windowBroken){
var winX=hScreenX+h.w*0.5;
var winY=h.y+h.h*0.35;
if(p.x>winX-15&&p.x<winX+15&&p.y>winY-15&&p.y<winY+15){
h.windowBroken=true;p.active=false;score+=100;windowsBroken++;
addParticles(p.x,p.y,'#aaccff',15);break;}}}
// bonus targets
if(bonusCourse){
for(var j=0;j<bonusTargets.length;j++){
var t=bonusTargets[j];if(t.hit)continue;
var tx=t.x-scrollX,ty=t.y;
if(p.x>tx-t.w/2&&p.x<tx+t.w/2&&p.y>ty-t.h/2&&p.y<ty+t.h/2){
t.hit=true;p.active=false;bonusScore+=500;score+=500;
addParticles(p.x,p.y,'#ff66ff',15);break;}}}
// off screen
if(p.y>H+20||p.x>W+100||p.age>3)p.active=false;}
papers=papers.filter(function(p){return p.active;});

// obstacles movement and collision
for(var i=0;i<obstacles.length;i++){
var o=obstacles[i];if(!o.alive)continue;
o.x+=o.speed*dt;
// wrap obstacles within a range
if(o.speed>0&&o.x>o.baseX+300)o.x=o.baseX-200;
if(o.speed<0&&o.x<o.baseX-300)o.x=o.baseX+200;
// screen coords
var ox=o.x-scrollX;
var oy=o.y;
// collision with player
if(ox>player.x-20&&ox<player.x+20&&Math.abs(oy-player.y)<LANE_H*0.6){
// crash!
lives--;player.crashed=true;player.crashTimer=1.0;
addParticles(player.x,player.y,'#ff3355',20);
if(lives<=0){gameState='gameover';}
break;}
// dodge scoring: if obstacle passed player x
if(!dodgeTracker[o.id]&&ox<player.x-40){
dodgeTracker[o.id]=true;score+=50;obstaclesDodged++;}}

// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

// ---- draw helpers ----
function drawSky(){
var grad=ctx.createLinearGradient(0,0,0,STREET_TOP);
grad.addColorStop(0,'#66bbff');grad.addColorStop(1,'#aaddff');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,STREET_TOP);}

function drawStreet(){
// grass above sidewalk
ctx.fillStyle='#44aa44';ctx.fillRect(0,STREET_TOP-SIDEWALK_H,W,SIDEWALK_H);
// sidewalk
ctx.fillStyle='#bbbbaa';ctx.fillRect(0,STREET_TOP-SIDEWALK_H*0.3,W,SIDEWALK_H*0.3);
// street surface
var sg=ctx.createLinearGradient(0,STREET_TOP,0,STREET_BOTTOM);
sg.addColorStop(0,'#555');sg.addColorStop(0.5,'#666');sg.addColorStop(1,'#555');
ctx.fillStyle=sg;ctx.fillRect(0,STREET_TOP,W,STREET_BOTTOM-STREET_TOP);
// lane markings (dashed center lines)
ctx.strokeStyle='rgba(255,255,200,0.3)';ctx.lineWidth=2;ctx.setLineDash([20,15]);
for(var i=1;i<4;i++){var ly=STREET_TOP+i*LANE_H;
ctx.beginPath();ctx.moveTo(0,ly);ctx.lineTo(W,ly);ctx.stroke();}
ctx.setLineDash([]);
// curb
ctx.fillStyle='#888';ctx.fillRect(0,STREET_TOP-2,W,4);
// bottom grass
ctx.fillStyle='#44aa44';ctx.fillRect(0,STREET_BOTTOM,W,H-STREET_BOTTOM);}

function drawHouse(h){
var sx=h.x-scrollX;if(sx<-h.w-20||sx>W+20)return;
var hx=sx,hy=h.y,hw=h.w,hh=h.h;
// wall
ctx.fillStyle=h.wallColor;ctx.fillRect(hx,hy+hh*0.3,hw,hh*0.7);
// roof (triangle)
ctx.fillStyle=h.roofColor;ctx.beginPath();
ctx.moveTo(hx-5,hy+hh*0.3);ctx.lineTo(hx+hw/2,hy);ctx.lineTo(hx+hw+5,hy+hh*0.3);ctx.closePath();ctx.fill();
// door
ctx.fillStyle=h.doorColor;ctx.fillRect(hx+hw*0.4,hy+hh*0.6,hw*0.18,hh*0.4);
// doorknob
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(hx+hw*0.55,hy+hh*0.8,2,0,Math.PI*2);ctx.fill();
// windows
if(!h.windowBroken){
ctx.fillStyle='#aaddff';ctx.fillRect(hx+hw*0.12,hy+hh*0.38,hw*0.2,hw*0.18);
ctx.fillRect(hx+hw*0.65,hy+hh*0.38,hw*0.2,hw*0.18);
// window frames
ctx.strokeStyle='#665544';ctx.lineWidth=1;
ctx.strokeRect(hx+hw*0.12,hy+hh*0.38,hw*0.2,hw*0.18);
ctx.strokeRect(hx+hw*0.65,hy+hh*0.38,hw*0.2,hw*0.18);
// cross bars
ctx.beginPath();ctx.moveTo(hx+hw*0.22,hy+hh*0.38);ctx.lineTo(hx+hw*0.22,hy+hh*0.38+hw*0.18);ctx.stroke();
ctx.beginPath();ctx.moveTo(hx+hw*0.75,hy+hh*0.38);ctx.lineTo(hx+hw*0.75,hy+hh*0.38+hw*0.18);ctx.stroke();
}else{
// broken window
ctx.fillStyle='#334455';ctx.fillRect(hx+hw*0.12,hy+hh*0.38,hw*0.2,hw*0.18);
ctx.fillRect(hx+hw*0.65,hy+hh*0.38,hw*0.2,hw*0.18);
ctx.strokeStyle='#aaccff';ctx.lineWidth=1;
// cracks
ctx.beginPath();ctx.moveTo(hx+hw*0.18,hy+hh*0.38);ctx.lineTo(hx+hw*0.25,hy+hh*0.38+hw*0.12);
ctx.lineTo(hx+hw*0.15,hy+hh*0.38+hw*0.18);ctx.stroke();}
// mailbox (subscribers)
if(h.hasMailbox){
var mbx=h.mailboxX-scrollX;
var mby=STREET_TOP-SIDEWALK_H*0.4;
ctx.fillStyle=h.delivered?'#44cc44':'#4466cc';
ctx.fillRect(mbx-6,mby,12,20);
ctx.fillRect(mbx-8,mby-3,16,5);
// flag
ctx.fillStyle=h.delivered?'#22aa22':'#ff4444';
ctx.fillRect(mbx+6,mby,3,12);
ctx.fillRect(mbx+6,mby,10,5);}
// subscriber/non-subscriber indicator
if(h.delivered){
ctx.fillStyle='#44ff44';ctx.font='bold '+Math.max(10,Math.round(W*0.015))+'px "Courier New",monospace';
ctx.textAlign='center';ctx.fillText('✓',sx+hw/2,hy+hh+15);}}

function drawPlayer(){
if(player.crashed&&Math.floor(gameTime*10)%2===0)return;// blink when crashed
var px=player.x,py=player.y;
// bicycle wheels
ctx.strokeStyle='#333';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(px-12,py+8,8,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(px+12,py+8,8,0,Math.PI*2);ctx.stroke();
// wheel spokes (animated)
ctx.strokeStyle='#666';ctx.lineWidth=1;
for(var s=0;s<3;s++){var ang=pedalTimer+s*Math.PI*2/3;
ctx.beginPath();ctx.moveTo(px-12,py+8);ctx.lineTo(px-12+Math.cos(ang)*7,py+8+Math.sin(ang)*7);ctx.stroke();
ctx.beginPath();ctx.moveTo(px+12,py+8);ctx.lineTo(px+12+Math.cos(ang)*7,py+8+Math.sin(ang)*7);ctx.stroke();}
// bike frame
ctx.strokeStyle='#cc2222';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(px-12,py+8);ctx.lineTo(px-2,py-5);ctx.lineTo(px+12,py+8);ctx.stroke();
ctx.beginPath();ctx.moveTo(px-12,py+8);ctx.lineTo(px+5,py+3);ctx.lineTo(px+12,py+8);ctx.stroke();
// handlebars
ctx.strokeStyle='#444';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(px+8,py-8);ctx.lineTo(px+16,py-6);ctx.stroke();
// seat
ctx.fillStyle='#333';ctx.fillRect(px-6,py-8,8,3);
// rider body
ctx.fillStyle='#2266cc';// shirt
ctx.beginPath();ctx.ellipse(px,py-14,7,9,0,0,Math.PI*2);ctx.fill();
// head
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(px+2,py-26,6,0,Math.PI*2);ctx.fill();
// helmet
ctx.fillStyle='#cc2222';ctx.beginPath();ctx.arc(px+2,py-28,5,Math.PI,0);ctx.fill();
// arm throwing pose
ctx.strokeStyle='#ffcc88';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(px+5,py-16);ctx.lineTo(px+14,py-20);ctx.stroke();
// legs (pedaling animation)
var legAng=Math.sin(pedalTimer)*0.5;
ctx.strokeStyle='#335588';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(px-2,py-5);ctx.lineTo(px-4+Math.cos(legAng)*8,py+6+Math.sin(legAng)*4);ctx.stroke();
ctx.beginPath();ctx.moveTo(px-2,py-5);ctx.lineTo(px-4+Math.cos(legAng+Math.PI)*8,py+6+Math.sin(legAng+Math.PI)*4);ctx.stroke();
// newspaper bag
ctx.fillStyle='#886644';ctx.fillRect(px-15,py-18,10,12);
ctx.fillStyle='#fff';ctx.font='bold 7px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(papersLeft+'',px-10,py-10);}

function drawObstacle(o){
var ox=o.x-scrollX,oy=o.y;
if(ox<-80||ox>W+80)return;
if(o.type==='car'){
ctx.fillStyle='#cc3344';ctx.beginPath();ctx.roundRect(ox-25,oy-10,50,20,4);ctx.fill();
ctx.fillStyle=shadeColor('#cc3344',-30);ctx.beginPath();ctx.roundRect(ox-15,oy-16,25,10,3);ctx.fill();
// windows
ctx.fillStyle='#aaddff';ctx.fillRect(ox-12,oy-14,8,7);ctx.fillRect(ox+2,oy-14,8,7);
// wheels
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(ox-15,oy+10,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ox+15,oy+10,4,0,Math.PI*2);ctx.fill();
}else if(o.type==='dog'){
// body
ctx.fillStyle='#aa7744';ctx.beginPath();ctx.ellipse(ox,oy,12,7,0,0,Math.PI*2);ctx.fill();
// head
ctx.fillStyle='#aa7744';ctx.beginPath();ctx.arc(ox+10,oy-4,5,0,Math.PI*2);ctx.fill();
// ears
ctx.fillStyle='#885533';ctx.beginPath();ctx.ellipse(ox+13,oy-7,3,4,0.3,0,Math.PI*2);ctx.fill();
// tail
ctx.strokeStyle='#aa7744';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(ox-12,oy-2);ctx.quadraticCurveTo(ox-18,oy-10,ox-14,oy-12);ctx.stroke();
// legs
ctx.strokeStyle='#885533';ctx.lineWidth=2;
var legOff=Math.sin(gameTime*8)*3;
ctx.beginPath();ctx.moveTo(ox-6,oy+7);ctx.lineTo(ox-6+legOff,oy+14);ctx.stroke();
ctx.beginPath();ctx.moveTo(ox+6,oy+7);ctx.lineTo(ox+6-legOff,oy+14);ctx.stroke();
// eye
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ox+12,oy-5,1.5,0,Math.PI*2);ctx.fill();
}else if(o.type==='kid_trike'){
// tricycle wheels
ctx.strokeStyle='#cc44cc';ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(ox-8,oy+8,5,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(ox+8,oy+8,5,0,Math.PI*2);ctx.stroke();
// body
ctx.fillStyle='#ff88aa';ctx.beginPath();ctx.roundRect(ox-6,oy-2,12,10,2);ctx.fill();
// kid
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(ox,oy-8,5,0,Math.PI*2);ctx.fill();
// hair
ctx.fillStyle='#664422';ctx.beginPath();ctx.arc(ox,oy-10,4,Math.PI,0);ctx.fill();
}else if(o.type==='skater'){
// skateboard
ctx.fillStyle='#886622';ctx.beginPath();ctx.roundRect(ox-10,oy+8,20,4,2);ctx.fill();
ctx.fillStyle='#333';ctx.beginPath();ctx.arc(ox-7,oy+14,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ox+7,oy+14,2,0,Math.PI*2);ctx.fill();
// body
ctx.fillStyle='#44cc88';ctx.beginPath();ctx.ellipse(ox,oy,6,10,0,0,Math.PI*2);ctx.fill();
// head
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(ox,oy-12,5,0,Math.PI*2);ctx.fill();
// cap
ctx.fillStyle='#cc4444';ctx.beginPath();ctx.arc(ox,oy-14,4,Math.PI,0);ctx.fill();
ctx.fillRect(ox,oy-15,7,2);
}else if(o.type==='mower'){
// mower body
ctx.fillStyle='#44aa44';ctx.beginPath();ctx.roundRect(ox-14,oy-5,28,16,3);ctx.fill();
// handle
ctx.strokeStyle='#666';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(ox-14,oy);ctx.lineTo(ox-22,oy-12);ctx.stroke();
// wheels
ctx.fillStyle='#333';ctx.beginPath();ctx.arc(ox-10,oy+12,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(ox+10,oy+12,3,0,Math.PI*2);ctx.fill();
// grass spray
ctx.fillStyle='rgba(68,170,68,0.5)';
for(var g=0;g<3;g++){var gx=ox+randRange(-15,15),gy=oy+randRange(10,18);
ctx.fillRect(gx,gy,2,2);}}}

function drawPaper(p){
ctx.save();ctx.translate(p.x,p.y);
var rot=p.age*8;
ctx.rotate(rot);
// white rectangle with fold
ctx.fillStyle='#fff';ctx.fillRect(-5,-3,10,6);
ctx.fillStyle='#ddd';ctx.fillRect(-5,-3,3,6);
// text lines
ctx.fillStyle='#aaa';ctx.fillRect(-2,-1,6,1);ctx.fillRect(-2,1,5,1);
ctx.restore();}

function drawBonusTarget(t){
var tx=t.x-scrollX,ty=t.y;
if(tx<-40||tx>W+40)return;
if(t.hit){
ctx.fillStyle='rgba(255,100,255,0.3)';ctx.beginPath();ctx.arc(tx,ty,15,0,Math.PI*2);ctx.fill();
return;}
// target rings
ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(tx,ty,15,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(tx,ty,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(tx,ty,5,0,Math.PI*2);ctx.fill();}

function drawClouds(){
ctx.fillStyle='rgba(255,255,255,0.7)';
for(var i=0;i<5;i++){
var cx=((i*W*0.3-scrollX*0.05)%( W+100)+ W+100)%(W+100)-50;
var cy=H*0.05+i*H*0.04+Math.sin(gameTime*0.3+i)*5;
ctx.beginPath();ctx.ellipse(cx,cy,30+i*5,12+i*2,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(cx+20,cy-3,20+i*3,10+i,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(cx-15,cy+2,18+i*2,8+i,0,0,Math.PI*2);ctx.fill();}}

function drawTrees(){
for(var i=0;i<8;i++){
var tx=((i*W*0.2+80-scrollX*0.3)%(W+200)+W+200)%(W+200)-100;
var ty=STREET_TOP-SIDEWALK_H*0.8;
// trunk
ctx.fillStyle='#775533';ctx.fillRect(tx-3,ty,6,SIDEWALK_H*0.6);
// foliage
ctx.fillStyle='#338833';ctx.beginPath();ctx.arc(tx,ty-5,14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#44aa44';ctx.beginPath();ctx.arc(tx-5,ty,10,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(tx+5,ty,10,0,Math.PI*2);ctx.fill();}}

// ---- main render ----
function render(){
ctx.fillStyle='#88ccff';ctx.fillRect(0,0,W,H);
drawSky();drawClouds();
// houses
for(var i=0;i<houses.length;i++)drawHouse(houses[i]);
drawTrees();drawStreet();
// bonus targets
if(bonusCourse){for(var i=0;i<bonusTargets.length;i++)drawBonusTarget(bonusTargets[i]);
// bonus label
ctx.fillStyle='#ff66ff';ctx.font='bold '+Math.max(14,Math.round(W*0.025))+'px "Courier New",monospace';
ctx.textAlign='center';ctx.fillText('BONUS TRAINING COURSE!',W/2,STREET_TOP-SIDEWALK_H-10);}
// obstacles
for(var i=0;i<obstacles.length;i++)drawObstacle(obstacles[i]);
// papers
for(var i=0;i<papers.length;i++)drawPaper(papers[i]);
// player
drawPlayer();
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// HUD overlay
var fs=Math.max(10,Math.round(W*0.016));
ctx.font='bold '+fs+'px "Courier New",monospace';ctx.textAlign='left';
// papers left
ctx.fillStyle='#fff';ctx.fillText('PAPERS: '+papersLeft,10,H-8);
// lives
ctx.fillStyle='#ff6688';
for(var i=0;i<lives;i++){ctx.beginPath();ctx.arc(W*0.35+i*18,H-12,6,0,Math.PI*2);ctx.fill();}
// level
ctx.fillStyle='#aaa';ctx.font=fs+'px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('DAY '+level,W-10,H-8);
// progress bar
var progress=clamp(scrollX/(bonusCourse?streetLength+W*2.5:streetLength),0,1);
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(W*0.3,6,W*0.4,8);
ctx.fillStyle='#44ff88';ctx.fillRect(W*0.3,6,W*0.4*progress,8);
ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(W*0.3,6,W*0.4,8);
}

// ---- title screen ----
function drawTitle(dt){
ctx.fillStyle='#88ccff';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// ground
ctx.fillStyle='#44aa44';ctx.fillRect(0,H*0.65,W,H*0.35);
ctx.fillStyle='#666';ctx.fillRect(0,H*0.6,W,H*0.08);
// dashed line
ctx.strokeStyle='#ffff88';ctx.lineWidth=2;ctx.setLineDash([15,10]);
ctx.beginPath();ctx.moveTo(0,H*0.64);ctx.lineTo(W,H*0.64);ctx.stroke();ctx.setLineDash([]);
// houses silhouette
for(var i=0;i<6;i++){
var hx=i*W*0.17+W*0.03,hy=H*0.3,hw=W*0.13,hh=H*0.3;
ctx.fillStyle=['#eeddcc','#ddeeff','#ffe8cc','#e8ffe8','#ffe8e8','#ddd'][i];
ctx.fillRect(hx,hy+hh*0.3,hw,hh*0.7);
ctx.fillStyle=['#884422','#665544','#aa5533','#556644','#774433','#885566'][i];
ctx.beginPath();ctx.moveTo(hx-3,hy+hh*0.3);ctx.lineTo(hx+hw/2,hy);ctx.lineTo(hx+hw+3,hy+hh*0.3);ctx.closePath();ctx.fill();
ctx.fillStyle=i%2===0?'#3366cc':'#cc3333';ctx.fillRect(hx+hw*0.4,hy+hh*0.65,hw*0.18,hh*0.35);}
// animated bicycle
var bikeX=W*0.3+Math.sin(titlePulse*0.7)*W*0.1;
var bikeY=H*0.58;
ctx.strokeStyle='#cc2222';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(bikeX-10,bikeY+5,6,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(bikeX+10,bikeY+5,6,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.moveTo(bikeX-10,bikeY+5);ctx.lineTo(bikeX,bikeY-4);ctx.lineTo(bikeX+10,bikeY+5);ctx.stroke();
ctx.fillStyle='#2266cc';ctx.beginPath();ctx.ellipse(bikeX,bikeY-9,5,7,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(bikeX+1,bikeY-18,4,0,Math.PI*2);ctx.fill();
// flying paper
var paperX=bikeX+30+Math.sin(titlePulse*2)*15;
var paperY=bikeY-25+Math.cos(titlePulse*2)*10;
ctx.fillStyle='#fff';ctx.save();ctx.translate(paperX,paperY);ctx.rotate(titlePulse*4);
ctx.fillRect(-4,-3,8,6);ctx.restore();

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#cc2222';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';ctx.fillStyle='#cc2222';
ctx.fillText('PAPERBOY',W/2,H*0.14);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#335588';
ctx.fillText('NEWSPAPER DELIVERY',W/2,H*0.2);

var fs=Math.max(10,Math.round(W*0.018));
ctx.font=fs+'px "Courier New",monospace';ctx.fillStyle='#333';
ctx.fillText('UP/DOWN or W/S — Move on street',W/2,H*0.76);
ctx.fillText('LEFT/RIGHT or A/D — Speed up/slow down',W/2,H*0.76+fs*1.6);
ctx.fillText('SPACE — Throw newspaper',W/2,H*0.76+fs*3.2);
ctx.fillText('Deliver to BLUE mailboxes — Break RED house windows!',W/2,H*0.76+fs*4.8);

var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(0,0,0,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.95);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff3355';ctx.shadowBlur=15;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3355';
ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;

var fs=Math.max(11,Math.round(W*0.02));
ctx.font=fs+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('SCORE: '+score,W/2,H*0.38);
ctx.fillStyle='#88ff88';
ctx.fillText('Deliveries: '+totalDeliveries,W/2,H*0.45);
ctx.fillText('Windows broken: '+windowsBroken,W/2,H*0.51);
ctx.fillText('Obstacles dodged: '+obstaclesDodged,W/2,H*0.57);
ctx.fillStyle='#aaddff';
ctx.fillText('Days survived: '+level,W/2,H*0.63);

var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='DAY '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(gameState==='playing'){
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){keyUp=down;if(down)keyDown=false;}
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keyDown=down;if(down)keyUp=false;}
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;if(down)keyRight=false;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;if(down)keyLeft=false;}
if(e.key===' '&&down)throwPaper();}
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'&&down)resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
el.addEventListener('mousedown',function(){fn();});}

window.initPaperboy=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);
bindMobile('btn-left',function(){if(gameState==='playing')throwPaper();});
bindMobile('btn-right',function(){if(gameState==='playing'){keyRight=true;setTimeout(function(){keyRight=false;},200);}});
bindMobile('btn-up',function(){if(gameState==='playing'){keyUp=true;setTimeout(function(){keyUp=false;},150);}});
bindMobile('btn-down',function(){if(gameState==='playing'){keyDown=true;setTimeout(function(){keyDown=false;},150);}});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopPaperboy=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
keyUp=keyDown=keyLeft=keyRight=false;
gameState='title';};
})();
