// OutRun — Pseudo-3D Coastal Driving Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,gameTime=0,titlePulse=0;
var position=0,playerX=0,speed=0,maxSpeed=200,accel=80,braking=120,decel=40;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var steerSpeed=3,centrifugal=0.3;
var segments=[],segmentLength=200,rumbleLength=3,trackLength=0;
var drawDistance=150,cameraHeight=1200,cameraDepth=0,fieldOfView=100;
var roadWidth=2200;
var particles=[],flashTimer=0;
var traffic=[],sceneryItems=[];
var timeLeft=75,lives=3;

function getDiffMult(){
if(gameTime<=25)return 0.7;
if(gameTime<=55)return 1.0;
return 1.0+(gameTime-55)*0.012;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
cameraDepth=1/Math.tan((fieldOfView/2)*Math.PI/180);
}

function buildTrack(){
segments=[];
var n=1600;
for(var i=0;i<50;i++)addSeg(0,0);
for(var i=0;i<80;i++)addSeg(Math.sin(i*0.04)*2,Math.sin(i*0.02)*30);
for(var i=0;i<60;i++)addSeg(-Math.sin(i*0.05)*3,0);
for(var i=0;i<100;i++)addSeg(Math.sin(i*0.03)*1.5,Math.sin(i*0.015)*50);
for(var i=0;i<80;i++)addSeg(-Math.sin(i*0.04)*2.5,-Math.sin(i*0.02)*20);
for(var i=0;i<100;i++)addSeg(Math.sin(i*0.06)*2,Math.sin(i*0.03)*40);
while(segments.length<n){
for(var i=0;i<100&&segments.length<n;i++)addSeg(Math.sin(i*0.04+segments.length*0.001)*2,Math.sin(i*0.02)*30);
}
trackLength=segments.length*segmentLength;
traffic=[];
for(var i=0;i<15;i++){
traffic.push({offset:(Math.random()-0.5)*1.5,z:Math.random()*trackLength,
speed:maxSpeed*0.3+Math.random()*maxSpeed*0.4,
color:['#ff3333','#3333ff','#ffcc00','#33cc33','#ff66cc'][Math.floor(Math.random()*5)]});
}
sceneryItems=[];
for(var i=0;i<segments.length;i+=4+Math.floor(Math.random()*6)){
var side=Math.random()>0.5?1:-1;
sceneryItems.push({segIdx:i,offset:side*(1.2+Math.random()*0.5),type:Math.floor(Math.random()*3)});
}
}

function addSeg(curve,y){
var n2=segments.length;
segments.push({
index:n2,
p:{world:{y:prevY()+y,z:n2*segmentLength},camera:{x:0,y:0,z:0},screen:{x:0,y:0,w:0,scale:0}},
curve:curve,color:Math.floor(n2/rumbleLength)%2
});
}
function prevY(){return segments.length>0?segments[segments.length-1].p.world.y:0;}

function project(p,camX,camY,camZ){
p.camera.x=(p.world.x||0)-camX;
p.camera.y=(p.world.y||0)-camY;
p.camera.z=(p.world.z||0)-camZ;
if(p.camera.z<=0)p.camera.z=0.1;
p.screen.scale=cameraDepth/p.camera.z;
p.screen.x=Math.round((W/2)+(p.screen.scale*p.camera.x*W/2));
p.screen.y=Math.round((H/2)-(p.screen.scale*p.camera.y*H/2));
p.screen.w=Math.round((p.screen.scale*roadWidth*W/2));
}

function resetGame(){
buildTrack();position=0;playerX=0;speed=0;score=0;gameTime=0;
timeLeft=75;lives=3;flashTimer=0;particles=[];
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*100-30,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*2});
}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;timeLeft-=dt;
if(flashTimer>0)flashTimer-=dt;
if(timeLeft<=0){gameState='gameover';return;}

if(keyUp)speed+=accel*dt;
else if(keyDown)speed-=braking*dt;
else speed-=decel*dt;
speed=Math.max(0,Math.min(maxSpeed,speed));

var segIdx=Math.floor(position/segmentLength)%segments.length;
var seg=segments[segIdx];
var curve=seg?seg.curve:0;
var speedPct=speed/maxSpeed;

var steerDir=0;
if(keyLeft)steerDir=-1;
if(keyRight)steerDir=1;
playerX+=steerDir*speedPct*dt*steerSpeed;
playerX+=curve*centrifugal*speedPct*speedPct*dt;
playerX=Math.max(-2.5,Math.min(2.5,playerX));

if(Math.abs(playerX)>1.1){speed*=(1-0.5*dt);if(Math.random()<dt*5)addParticles(W/2,H*0.85,'#886644',2);}

position+=speed*segmentLength*dt;
if(position>=trackLength)position-=trackLength;
score=Math.floor(position/100);

var dm=getDiffMult();
for(var i=0;i<traffic.length;i++){
var t=traffic[i];t.z+=t.speed*dm*dt;
if(t.z>=trackLength)t.z-=trackLength;
var dz=t.z-position;if(dz<0)dz+=trackLength;
if(dz<segmentLength*3&&dz>0){
var dx=playerX-t.offset;
if(Math.abs(dx)<(0.6/dm)&&speed>t.speed*dm){
speed*=0.3;flashTimer=0.3;lives--;
addParticles(W/2,H*0.7,'#ff4444',10);
if(lives<=0)gameState='gameover';
}
}
}

for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
}

function poly(x1,y1,x2,y2,x3,y3,x4,y4,col){
ctx.fillStyle=col;ctx.beginPath();
ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.lineTo(x4,y4);ctx.closePath();ctx.fill();
}

function render(){
var sky=ctx.createLinearGradient(0,0,0,H*0.5);
sky.addColorStop(0,'#2255aa');sky.addColorStop(0.5,'#5588cc');sky.addColorStop(1,'#88bbee');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

ctx.fillStyle='rgba(255,240,200,0.4)';ctx.beginPath();ctx.arc(W*0.7,H*0.1,60,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffffaa';ctx.beginPath();ctx.arc(W*0.7,H*0.1,30,0,Math.PI*2);ctx.fill();

for(var i=0;i<5;i++){
var cx2=(i*200-gameTime*5+W*2)%W;
ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.beginPath();ctx.arc(cx2,H*0.06+i*8,25,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cx2+20,H*0.06+i*8-5,20,0,Math.PI*2);ctx.fill();
}

ctx.fillStyle='#4466aa';ctx.beginPath();ctx.moveTo(0,H*0.4);
for(var i=0;i<=20;i++)ctx.lineTo(i*W/20,H*0.32+Math.sin(i*0.8)*H*0.05+Math.sin(i*0.3)*H*0.03);
ctx.lineTo(W,H*0.5);ctx.lineTo(0,H*0.5);ctx.closePath();ctx.fill();

var baseIdx=Math.floor(position/segmentLength);
var baseZ=baseIdx*segmentLength;
var maxy=H;
var camX=playerX*roadWidth;
var camY=cameraHeight+(segments[baseIdx%segments.length]?segments[baseIdx%segments.length].p.world.y:0);
var visSegs=[],cx=0,cdx=0;

// Pass 1: road (near-to-far with hill clipping + visual curves)
for(var n=1;n<=drawDistance;n++){
var si=(baseIdx+n)%segments.length;
var seg=segments[si];
var oz=seg.p.world.z;seg.p.world.z=baseZ+n*segmentLength;
project(seg.p,camX,camY,position);
seg.p.world.z=oz;
if(seg.p.camera.z<=cameraDepth)continue;
cx+=cdx;cdx+=seg.curve;
var shift=cx*seg.p.screen.scale*W*0.4;
seg.p.screen.x+=shift;
var p1=seg.p.screen;
if(p1.y>=maxy)continue;
var si2=(si>0?si-1:segments.length-1);
var oz2=segments[si2].p.world.z;segments[si2].p.world.z=baseZ+(n-1)*segmentLength;
project(segments[si2].p,camX,camY,position);
segments[si2].p.world.z=oz2;
segments[si2].p.screen.x+=shift;
var p2=segments[si2].p.screen;
var clipY=Math.min(p2.y,maxy);
if(clipY<=p1.y)continue;

poly(0,clipY,W,clipY,W,p1.y,0,p1.y,seg.color?'#44aa44':'#338833');
poly(p1.x-p1.w,p1.y,p1.x+p1.w,p1.y,p2.x+p2.w,clipY,p2.x-p2.w,clipY,seg.color?'#555':'#666');
var rw=p1.w*0.05;
var rc=seg.color?'#ff0000':'#ffffff';
poly(p1.x-p1.w-rw,p1.y,p1.x-p1.w,p1.y,p2.x-p2.w,clipY,p2.x-p2.w-p2.w*0.05,clipY,rc);
poly(p1.x+p1.w,p1.y,p1.x+p1.w+rw,p1.y,p2.x+p2.w+p2.w*0.05,clipY,p2.x+p2.w,clipY,rc);
if(!seg.color){
var lw=p1.w*0.02;
poly(p1.x-lw,p1.y,p1.x+lw,p1.y,p2.x+p2.w*0.02,clipY,p2.x-p2.w*0.02,clipY,'#fff');
}
maxy=p1.y;
visSegs.push({si:si,x:p1.x,y:p1.y,w:p1.w});
}

// Pass 2: sprites (far-to-near for correct depth)
for(var n=visSegs.length-1;n>=0;n--){
var vs=visSegs[n];
for(var t=0;t<sceneryItems.length;t++){
var sc=sceneryItems[t];
if(sc.segIdx===vs.si){
var sx=vs.x+vs.w*sc.offset,ss=vs.w/2000;
if(ss>0.01)drawScenery(sx,vs.y,ss,sc.type);
}}
for(var t=0;t<traffic.length;t++){
var tr=traffic[t];
if(Math.floor(tr.z/segmentLength)%segments.length===vs.si){
var tx=vs.x+vs.w*tr.offset,ts2=vs.w/1400;
if(ts2>0.01)drawTraffic(tx,vs.y,ts2,tr.color);
}}
}

drawPlayerCar();

for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

if(flashTimer>0){ctx.fillStyle='rgba(255,0,0,'+(flashTimer*2)+')';ctx.fillRect(0,0,W,H);}
if(speed>maxSpeed*0.7){
var vig=ctx.createRadialGradient(W/2,H/2,W*0.3,W/2,H/2,W*0.7);
vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,'+(speed/maxSpeed*0.3)+')');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}

ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,W,22);
ctx.fillStyle='#fff';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('TIME: '+Math.ceil(timeLeft),10,16);
ctx.textAlign='center';ctx.fillStyle='#ffcc00';
ctx.fillText(Math.floor(speed*2)+' KM/H',W/2,16);
ctx.textAlign='right';ctx.fillStyle='#ff6666';
for(var i=0;i<lives;i++)ctx.fillText('\u2665',W-10-i*18,16);
}

function drawScenery(x,y,scale,type){
if(type===0){
ctx.fillStyle='#886644';ctx.fillRect(x-3*scale,y-80*scale,6*scale,80*scale);
ctx.fillStyle='#33aa33';
for(var i=0;i<5;i++){
var a=-Math.PI/2+i*Math.PI/2.5-Math.PI/5;
ctx.strokeStyle='#33aa33';ctx.lineWidth=3*scale;
ctx.beginPath();ctx.moveTo(x,y-80*scale);
ctx.quadraticCurveTo(x+Math.cos(a)*40*scale,y-80*scale+Math.sin(a)*25*scale,x+Math.cos(a)*50*scale,y-80*scale+Math.sin(a)*35*scale);
ctx.stroke();
}
}else if(type===1){
ctx.fillStyle='#448844';ctx.beginPath();ctx.arc(x,y-15*scale,15*scale,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle='#888';ctx.fillRect(x-2*scale,y-50*scale,4*scale,50*scale);
ctx.fillStyle='#fff';ctx.fillRect(x-15*scale,y-50*scale,30*scale,20*scale);
ctx.fillStyle='#2255aa';ctx.font='bold '+Math.max(6,Math.round(12*scale))+'px monospace';
ctx.textAlign='center';ctx.fillText('OUT',x,y-38*scale);
}
}

function drawTraffic(x,y,scale,color){
var w=40*scale,h=20*scale;
ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h*0.7,3*scale);ctx.fill();
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.roundRect(x-w*0.3,y-h*1.2,w*0.6,h*0.4,2*scale);ctx.fill();
ctx.fillStyle='rgba(150,200,255,0.5)';ctx.fillRect(x-w*0.25,y-h*1.15,w*0.5,h*0.3);
ctx.fillStyle='#ff0000';ctx.fillRect(x-w/2,y-h*0.5,4*scale,3*scale);ctx.fillRect(x+w/2-4*scale,y-h*0.5,4*scale,3*scale);
}

function drawPlayerCar(){
var cx2=W/2+playerX*W*0.03,cy2=H*0.82,sw=W*0.09;
ctx.save();
// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(cx2,cy2+sw*0.35,sw*1.3,sw*0.15,0,0,Math.PI*2);ctx.fill();
// Rear tires
ctx.fillStyle='#111';
ctx.fillRect(cx2-sw*1.05,cy2-sw*0.15,sw*0.22,sw*0.55);
ctx.fillRect(cx2+sw*0.83,cy2-sw*0.15,sw*0.22,sw*0.55);
// Tire rims
ctx.fillStyle='#666';
ctx.fillRect(cx2-sw*1.01,cy2+sw*0.02,sw*0.14,sw*0.22);
ctx.fillRect(cx2+sw*0.87,cy2+sw*0.02,sw*0.14,sw*0.22);
// Front tires
ctx.fillStyle='#111';
ctx.fillRect(cx2-sw*0.95,cy2-sw*0.85,sw*0.18,sw*0.4);
ctx.fillRect(cx2+sw*0.77,cy2-sw*0.85,sw*0.18,sw*0.4);
// Body — red Ferrari Testarossa shape (rear view)
var grad=ctx.createLinearGradient(cx2-sw,cy2-sw,cx2+sw,cy2);
grad.addColorStop(0,'#cc1100');grad.addColorStop(0.3,'#ff2200');grad.addColorStop(0.5,'#ff4433');grad.addColorStop(0.7,'#ff2200');grad.addColorStop(1,'#cc1100');
ctx.fillStyle=grad;
ctx.beginPath();
ctx.moveTo(cx2-sw*0.8,cy2+sw*0.3);
ctx.lineTo(cx2-sw*0.85,cy2-sw*0.3);
ctx.quadraticCurveTo(cx2-sw*0.8,cy2-sw*0.7,cx2-sw*0.55,cy2-sw*0.85);
ctx.lineTo(cx2+sw*0.55,cy2-sw*0.85);
ctx.quadraticCurveTo(cx2+sw*0.8,cy2-sw*0.7,cx2+sw*0.85,cy2-sw*0.3);
ctx.lineTo(cx2+sw*0.8,cy2+sw*0.3);
ctx.closePath();ctx.fill();
// Body highlight
ctx.fillStyle='rgba(255,255,255,0.1)';
ctx.beginPath();
ctx.moveTo(cx2-sw*0.6,cy2-sw*0.85);
ctx.quadraticCurveTo(cx2,cy2-sw*0.95,cx2+sw*0.6,cy2-sw*0.85);
ctx.lineTo(cx2+sw*0.3,cy2-sw*0.4);ctx.lineTo(cx2-sw*0.3,cy2-sw*0.4);
ctx.closePath();ctx.fill();
// Rear window
ctx.fillStyle='rgba(80,160,220,0.5)';
ctx.beginPath();
ctx.moveTo(cx2-sw*0.45,cy2-sw*0.8);
ctx.quadraticCurveTo(cx2,cy2-sw*0.9,cx2+sw*0.45,cy2-sw*0.8);
ctx.lineTo(cx2+sw*0.35,cy2-sw*0.55);ctx.lineTo(cx2-sw*0.35,cy2-sw*0.55);
ctx.closePath();ctx.fill();
// Window glare
ctx.fillStyle='rgba(255,255,255,0.25)';
ctx.beginPath();ctx.moveTo(cx2-sw*0.3,cy2-sw*0.75);
ctx.lineTo(cx2-sw*0.1,cy2-sw*0.82);ctx.lineTo(cx2+sw*0.1,cy2-sw*0.75);
ctx.lineTo(cx2-sw*0.05,cy2-sw*0.6);ctx.closePath();ctx.fill();
// Tail lights
ctx.shadowColor='#ff0000';ctx.shadowBlur=8;
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.roundRect(cx2-sw*0.78,cy2+sw*0.05,sw*0.2,sw*0.12,2);ctx.fill();
ctx.beginPath();ctx.roundRect(cx2+sw*0.58,cy2+sw*0.05,sw*0.2,sw*0.12,2);ctx.fill();
ctx.shadowBlur=0;
// License plate area
ctx.fillStyle='#eee';ctx.fillRect(cx2-sw*0.15,cy2+sw*0.12,sw*0.3,sw*0.1);
ctx.fillStyle='#333';ctx.font=Math.max(6,Math.round(sw*0.1))+'px monospace';ctx.textAlign='center';
ctx.fillText('OUT',cx2,cy2+sw*0.2);
// Exhaust pipes
ctx.fillStyle='#444';
ctx.beginPath();ctx.arc(cx2-sw*0.3,cy2+sw*0.3,sw*0.05,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cx2+sw*0.3,cy2+sw*0.3,sw*0.05,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#ff6644');sky.addColorStop(0.3,'#ff9966');sky.addColorStop(0.5,'#ffcc88');
sky.addColorStop(0.7,'#44aa44');sky.addColorStop(1,'#226622');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
for(var i=0;i<4;i++){
var px=W*0.15+i*W*0.22;
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(px-2,H*0.35,4,H*0.3);
ctx.beginPath();ctx.arc(px,H*0.33,20,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle='#444';ctx.beginPath();ctx.moveTo(W*0.3,H);ctx.lineTo(W*0.48,H*0.55);
ctx.lineTo(W*0.52,H*0.55);ctx.lineTo(W*0.7,H);ctx.closePath();ctx.fill();

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4422';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';ctx.fillStyle='#ff2200';
ctx.fillText('OUTRUN',W/2,H*0.22);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc88';
ctx.fillText('COASTAL DRIVE',W/2,H*0.3);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.45);
ctx.fillStyle='#fff';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Left/Right to steer, Up to accelerate, Down to brake',W/2,H*0.85);
ctx.fillText('Dodge traffic on the coastal highway!',W/2,H*0.9);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText(lives<=0?'WRECKED!':'TIME UP!',W/2,H*0.2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.3,W*0.6,H*0.38,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('DISTANCE',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString()+' m',W/2,H*0.53);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Time: '+gameTime.toFixed(1)+'s',W/2,H*0.63);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.78);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=Math.floor(speed*2)+' KPH';
document.getElementById('hud-time').textContent=Math.ceil(timeLeft)+'s';
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
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initOutrun=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopOutrun=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
