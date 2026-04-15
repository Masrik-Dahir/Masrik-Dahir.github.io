// Pole Position — Pseudo-3D Racing with Qualifying and Laps
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,gameTime=0,titlePulse=0;
var position=0,playerX=0,speed=0,maxSpeed=220,accel=90,braking=130,decel=50;
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var steerSpeed=3.2,centrifugal=0.35;
var segments=[],segmentLength=200,rumbleLength=3,trackLength=0;
var drawDistance=140,cameraHeight=1200,cameraDepth=0,fieldOfView=100;
var roadWidth=2400;
var particles=[],flashTimer=0;
var opponents=[],billboards=[];
var laps=0,totalLaps=3,lapStart=0,bestLap=999,currentLapTime=0;
var lives=3;
var phase='qualify'; // 'qualify' or 'race'
var qualifyTime=30,qualifyTimer=0;
var racePosition=8;

function getDiffMult(){
if(phase==='qualify')return 0.7;
if(laps<=1)return 1.0;
return 1.0+(laps-1)*0.2;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
cameraDepth=1/Math.tan((fieldOfView/2)*Math.PI/180);
}

function buildTrack(){
segments=[];
// Fuji Speedway inspired layout
for(var i=0;i<40;i++)addSeg(0,0); // start straight
for(var i=0;i<60;i++)addSeg(Math.sin(i*0.05)*3,Math.sin(i*0.02)*20); // S-curves
for(var i=0;i<30;i++)addSeg(0,0); // back straight
for(var i=0;i<80;i++)addSeg(-Math.sin(i*0.04)*2.5,Math.sin(i*0.015)*30); // hairpin area
for(var i=0;i<50;i++)addSeg(Math.sin(i*0.06)*2,0); // chicane
for(var i=0;i<40;i++)addSeg(0,-Math.sin(i*0.03)*25); // uphill
for(var i=0;i<60;i++)addSeg(-Math.sin(i*0.03)*1.5,Math.sin(i*0.025)*35); // final turn
for(var i=0;i<40;i++)addSeg(0,0); // finish straight
trackLength=segments.length*segmentLength;

// Opponents
opponents=[];
for(var i=0;i<7;i++){
opponents.push({
offset:(Math.random()-0.5)*1.6,
z:trackLength*0.1+i*trackLength*0.12,
speed:maxSpeed*0.55+Math.random()*maxSpeed*0.25, // slower than player (easy)
color:['#ff3333','#ffcc00','#33cc33','#3366ff','#ff66cc','#cc66ff','#ff9933'][i],
number:i+2
});
}

// Billboards and scenery
billboards=[];
for(var i=0;i<segments.length;i+=8+Math.floor(Math.random()*8)){
var side=Math.random()>0.5?1:-1;
billboards.push({segIdx:i,offset:side*(1.3+Math.random()*0.4),type:Math.floor(Math.random()*4)});
}
}

function addSeg(curve,y){
var n=segments.length;
segments.push({
index:n,
p:{world:{y:lastSY()+y,z:n*segmentLength},camera:{x:0,y:0,z:0},screen:{x:0,y:0,w:0,scale:0}},
curve:curve,color:Math.floor(n/rumbleLength)%2
});
}
function lastSY(){return segments.length>0?segments[segments.length-1].p.world.y:0;}

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
laps=0;lapStart=0;bestLap=999;currentLapTime=0;
lives=3;flashTimer=0;particles=[];
phase='qualify';qualifyTimer=qualifyTime;racePosition=8;
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*80-20,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*2});
}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(flashTimer>0)flashTimer-=dt;

if(phase==='qualify'){
qualifyTimer-=dt;
if(qualifyTimer<=0){
// Qualify over - start race based on best lap
if(bestLap<15)racePosition=1;
else if(bestLap<20)racePosition=3;
else if(bestLap<25)racePosition=5;
else racePosition=7;
phase='race';laps=0;lapStart=position;currentLapTime=0;
}
}

// Acceleration
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

if(Math.abs(playerX)>1.1){speed*=(1-0.6*dt);if(Math.random()<dt*5)addParticles(W/2,H*0.85,'#886644',2);}

var prevPos=position;
position+=speed*segmentLength*dt;

// Lap detection
var prevLapSeg=Math.floor(prevPos/trackLength);
var curLapSeg=Math.floor(position/trackLength);
if(curLapSeg>prevLapSeg){
currentLapTime=gameTime-lapStart;
if(currentLapTime<bestLap)bestLap=currentLapTime;
lapStart=gameTime;
if(phase==='race'){
laps++;
// Each lap, potentially improve position
if(racePosition>1)racePosition--;
if(laps>=totalLaps){
score=Math.max(0,(8-racePosition)*1000)+Math.floor(100/Math.max(1,bestLap))*100;
gameState='gameover';return;
}
}
}
if(position>=trackLength*100)position-=trackLength;

currentLapTime=gameTime-lapStart;

// Opponent collision (only in race phase)
if(phase==='race'){
for(var i=0;i<opponents.length;i++){
var o=opponents[i];
o.z+=o.speed*dt;
if(o.z>=trackLength)o.z-=trackLength;
var dz=o.z-position%trackLength;
if(dz<0)dz+=trackLength;
if(dz>trackLength/2)dz-=trackLength;
if(Math.abs(dz)<segmentLength*2){
var dx=playerX-o.offset;
if(Math.abs(dx)<0.5&&Math.abs(dz)<segmentLength){
speed*=0.3;flashTimer=0.3;lives--;
addParticles(W/2,H*0.7,'#ff4444',10);
if(lives<=0){score=Math.max(0,(8-racePosition)*500);gameState='gameover';}
}
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
// Sky gradient - daytime race
var sky=ctx.createLinearGradient(0,0,0,H*0.45);
sky.addColorStop(0,'#1144aa');sky.addColorStop(0.5,'#3366cc');sky.addColorStop(1,'#6699dd');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Distant mountains
ctx.fillStyle='#556688';ctx.beginPath();ctx.moveTo(0,H*0.38);
for(var i=0;i<=25;i++)ctx.lineTo(i*W/25,H*0.3+Math.sin(i*0.6)*H*0.04+Math.cos(i*0.3)*H*0.03);
ctx.lineTo(W,H*0.45);ctx.lineTo(0,H*0.45);ctx.closePath();ctx.fill();

// Grandstand area
ctx.fillStyle='#888';ctx.fillRect(0,H*0.38,W,H*0.05);
for(var i=0;i<15;i++){
ctx.fillStyle='hsl('+(i*25)+',60%,50%)';
ctx.fillRect(i*W/15+2,H*0.36,W/15-4,H*0.03);
}

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

// Grass
poly(0,clipY,W,clipY,W,p1.y,0,p1.y,seg.color?'#44aa44':'#338833');
// Road
poly(p1.x-p1.w,p1.y,p1.x+p1.w,p1.y,p2.x+p2.w,clipY,p2.x-p2.w,clipY,seg.color?'#555':'#666');
// Rumble strips
var rw=p1.w*0.06;
var rc=seg.color?'#ff0000':'#ffffff';
poly(p1.x-p1.w-rw,p1.y,p1.x-p1.w,p1.y,p2.x-p2.w,clipY,p2.x-p2.w-p2.w*0.06,clipY,rc);
poly(p1.x+p1.w,p1.y,p1.x+p1.w+rw,p1.y,p2.x+p2.w+p2.w*0.06,clipY,p2.x+p2.w,clipY,rc);
// Lane markers
if(!seg.color){
var lw2=p1.w*0.015;
poly(p1.x-p1.w*0.33-lw2,p1.y,p1.x-p1.w*0.33+lw2,p1.y,
p2.x-p2.w*0.33+lw2,clipY,p2.x-p2.w*0.33-lw2,clipY,'#fff');
poly(p1.x+p1.w*0.33-lw2,p1.y,p1.x+p1.w*0.33+lw2,p1.y,
p2.x+p2.w*0.33+lw2,clipY,p2.x+p2.w*0.33-lw2,clipY,'#fff');
}
// Start/finish line
if(si===0||si===1){
poly(p1.x-p1.w,p1.y,p1.x+p1.w,p1.y,p2.x+p2.w,clipY,p2.x-p2.w,clipY,'rgba(255,255,255,0.5)');
}
maxy=p1.y;
visSegs.push({si:si,x:p1.x,y:p1.y,w:p1.w});
}

// Pass 2: sprites (far-to-near for correct depth)
for(var n=visSegs.length-1;n>=0;n--){
var vs=visSegs[n];
for(var b=0;b<billboards.length;b++){
var bb=billboards[b];
if(bb.segIdx===vs.si){
var bx=vs.x+vs.w*bb.offset,bs=vs.w/1800;
if(bs>0.01)drawBillboard(bx,vs.y,bs,bb.type);
}}
if(phase==='race'){
for(var o=0;o<opponents.length;o++){
var op=opponents[o];
var opSeg=Math.floor(op.z/segmentLength)%segments.length;
if(opSeg===vs.si){
var ox2=vs.x+vs.w*op.offset,os=vs.w/1500;
if(os>0.01)drawOpponent(ox2,vs.y,os,op.color,op.number);
}}}
}

drawPlayerCar();

for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;

if(flashTimer>0){ctx.fillStyle='rgba(255,0,0,'+(flashTimer*2)+')';ctx.fillRect(0,0,W,H);}

// HUD
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,30);
ctx.font='bold 13px "Courier New",monospace';
if(phase==='qualify'){
ctx.fillStyle='#ffcc00';ctx.textAlign='left';ctx.fillText('QUALIFYING',10,14);
ctx.fillStyle='#fff';ctx.fillText('TIME: '+Math.ceil(qualifyTimer),10,26);
ctx.textAlign='center';ctx.fillStyle='#ffcc00';
ctx.fillText(Math.floor(speed*2)+' KM/H',W/2,14);
ctx.fillStyle='#aaa';ctx.fillText('BEST: '+(bestLap<999?bestLap.toFixed(2)+'s':'--'),W/2,26);
}else{
ctx.fillStyle='#44ff44';ctx.textAlign='left';ctx.fillText('RACE - LAP '+(laps+1)+'/'+totalLaps,10,14);
ctx.fillStyle='#fff';ctx.fillText('POS: '+racePosition+'/8',10,26);
ctx.textAlign='center';ctx.fillStyle='#ffcc00';
ctx.fillText(Math.floor(speed*2)+' KM/H',W/2,14);
ctx.fillStyle='#aaa';ctx.fillText('LAP: '+currentLapTime.toFixed(1)+'s',W/2,26);
}
ctx.textAlign='right';ctx.fillStyle='#ff6666';
for(var i=0;i<lives;i++)ctx.fillText('\u2665',W-10-i*18,14);
ctx.fillStyle='#aaa';ctx.fillText('BEST: '+(bestLap<999?bestLap.toFixed(2)+'s':'--'),W-10,26);
}

function drawBillboard(x,y,scale,type){
var bw=50*scale,bh=30*scale;
// Post
ctx.fillStyle='#888';ctx.fillRect(x-2*scale,y-bh-20*scale,4*scale,20*scale+bh);
ctx.fillRect(x-bw/2,y-bh-20*scale,bw,bh);
// Billboard face
var colors=['#ff3322','#2255ff','#ffcc00','#22cc44'];
ctx.fillStyle=colors[type];
ctx.fillRect(x-bw/2+2*scale,y-bh-18*scale,bw-4*scale,bh-4*scale);
// Text
ctx.fillStyle='#fff';ctx.font='bold '+Math.max(5,Math.round(10*scale))+'px monospace';ctx.textAlign='center';
var texts=['POLE','RACE','FAST','WIN!'];
ctx.fillText(texts[type],x,y-bh-6*scale);
}

function drawOpponent(x,y,scale,color,num){
var w=45*scale,h=22*scale;
ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h*0.7,3*scale);ctx.fill();
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.roundRect(x-w*0.3,y-h*1.2,w*0.6,h*0.4,2*scale);ctx.fill();
ctx.fillStyle='rgba(150,200,255,0.5)';ctx.fillRect(x-w*0.25,y-h*1.15,w*0.5,h*0.3);
// Number
ctx.fillStyle='#fff';ctx.font='bold '+Math.max(6,Math.round(14*scale))+'px monospace';ctx.textAlign='center';
ctx.fillText(num+'',x,y-h*0.3);
// Wheels
ctx.fillStyle='#222';ctx.fillRect(x-w/2-2*scale,y-h*0.5,4*scale,h*0.3);
ctx.fillRect(x+w/2-2*scale,y-h*0.5,4*scale,h*0.3);
}

function drawPlayerCar(){
var cx2=W/2+playerX*W*0.03,cy2=H*0.82,sw=W*0.09;
ctx.save();
// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(cx2,cy2+sw*0.4,sw*1.4,sw*0.15,0,0,Math.PI*2);ctx.fill();
// Rear wheels (large)
ctx.fillStyle='#111';
ctx.fillRect(cx2-sw*1.25,cy2-sw*0.2,sw*0.25,sw*0.6);
ctx.fillRect(cx2+sw,cy2-sw*0.2,sw*0.25,sw*0.6);
// Front wheels
ctx.fillRect(cx2-sw*1.15,cy2-sw*0.95,sw*0.2,sw*0.4);
ctx.fillRect(cx2+sw*0.95,cy2-sw*0.95,sw*0.2,sw*0.4);
// Wheel rims
ctx.fillStyle='#999';
ctx.fillRect(cx2-sw*1.2,cy2-sw*0.02,sw*0.15,sw*0.24);
ctx.fillRect(cx2+sw*1.05,cy2-sw*0.02,sw*0.15,sw*0.24);
// Body — white F1 car (rear view)
var grad=ctx.createLinearGradient(cx2-sw,cy2-sw,cx2+sw,cy2);
grad.addColorStop(0,'#bbbbdd');grad.addColorStop(0.3,'#eeeeff');grad.addColorStop(0.5,'#ffffff');grad.addColorStop(0.7,'#eeeeff');grad.addColorStop(1,'#bbbbdd');
ctx.fillStyle=grad;
ctx.beginPath();
ctx.moveTo(cx2-sw*0.75,cy2+sw*0.3);
ctx.lineTo(cx2-sw*0.8,cy2-sw*0.15);
ctx.lineTo(cx2-sw*0.55,cy2-sw*0.6);
ctx.lineTo(cx2-sw*0.2,cy2-sw*0.9);
ctx.lineTo(cx2+sw*0.2,cy2-sw*0.9);
ctx.lineTo(cx2+sw*0.55,cy2-sw*0.6);
ctx.lineTo(cx2+sw*0.8,cy2-sw*0.15);
ctx.lineTo(cx2+sw*0.75,cy2+sw*0.3);
ctx.closePath();ctx.fill();
// Engine air intake (top)
ctx.fillStyle='#222';
ctx.beginPath();ctx.roundRect(cx2-sw*0.1,cy2-sw*1.0,sw*0.2,sw*0.2,2);ctx.fill();
// Cockpit opening
ctx.fillStyle='rgba(0,0,0,0.6)';
ctx.beginPath();
ctx.ellipse(cx2,cy2-sw*0.5,sw*0.22,sw*0.28,0,0,Math.PI*2);ctx.fill();
// Driver helmet
ctx.fillStyle='#ff0000';
ctx.beginPath();ctx.arc(cx2,cy2-sw*0.65,sw*0.14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#222';
ctx.beginPath();ctx.arc(cx2,cy2-sw*0.62,sw*0.1,0.3,Math.PI-0.3);ctx.fill();
// Rear wing
ctx.fillStyle='#cc0000';
ctx.fillRect(cx2-sw*0.9,cy2+sw*0.22,sw*1.8,sw*0.06);
// Wing endplates
ctx.fillRect(cx2-sw*0.95,cy2+sw*0.12,sw*0.08,sw*0.2);
ctx.fillRect(cx2+sw*0.87,cy2+sw*0.12,sw*0.08,sw*0.2);
// Number 1 on nose
ctx.fillStyle='#ff0000';ctx.font='bold '+Math.round(sw*0.3)+'px monospace';ctx.textAlign='center';
ctx.fillText('1',cx2,cy2+sw*0.12);
// Exhaust glow
ctx.shadowColor='#ff6600';ctx.shadowBlur=6;
ctx.fillStyle='#ff8844';
ctx.beginPath();ctx.arc(cx2-sw*0.2,cy2+sw*0.32,sw*0.04,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cx2+sw*0.2,cy2+sw*0.32,sw*0.04,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.restore();
}

function drawTitle(dt){
titlePulse+=dt*3;
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#1144aa');sky.addColorStop(0.4,'#3366cc');
sky.addColorStop(0.5,'#44aa44');sky.addColorStop(1,'#226622');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
// Checkered flag pattern
for(var r2=0;r2<4;r2++){for(var c=0;c<8;c++){
ctx.fillStyle=(r2+c)%2===0?'#fff':'#000';
ctx.fillRect(W*0.35+c*W*0.04,H*0.72+r2*H*0.03,W*0.04,H*0.03);
}}
// Road
ctx.fillStyle='#444';ctx.beginPath();ctx.moveTo(W*0.3,H);ctx.lineTo(W*0.47,H*0.5);
ctx.lineTo(W*0.53,H*0.5);ctx.lineTo(W*0.7,H);ctx.closePath();ctx.fill();

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4422';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';ctx.fillStyle='#ff2200';
ctx.fillText('POLE POSITION',W/2,H*0.2);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('QUALIFY & RACE',W/2,H*0.28);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.42);
ctx.fillStyle='#fff';ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
ctx.fillText('1. QUALIFY: Set the fastest lap in 30 seconds',W/2,H*0.52);
ctx.fillText('2. RACE: Complete 3 laps against 7 opponents',W/2,H*0.57);
ctx.fillText('Left/Right to steer, Up to accelerate, Down to brake',W/2,H*0.64);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
var won=racePosition<=3;
ctx.shadowColor=won?'#ffcc00':'#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.055)+'px "Courier New",monospace';
ctx.fillStyle=won?'#ffcc00':'#ff3333';
ctx.fillText(won?'PODIUM FINISH!':lives<=0?'WRECKED!':'RACE COMPLETE',W/2,H*0.18);ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.15,H*0.25,W*0.7,H*0.48,15);ctx.fill();
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
ctx.fillText('POSITION: '+racePosition+'/8',W/2,H*0.38);
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.48);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Best lap: '+(bestLap<999?bestLap.toFixed(2)+'s':'--'),W/2,H*0.56);
ctx.fillText('Laps: '+laps+'/'+totalLaps,W/2,H*0.62);
ctx.fillText('Time: '+gameTime.toFixed(1)+'s',W/2,H*0.68);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=Math.floor(speed*2)+' KPH';
document.getElementById('hud-time').textContent=(phase==='qualify'?'Q:'+Math.ceil(qualifyTimer)+'s':'LAP '+(laps+1));
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

window.initPolePosition=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPolePosition=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
