// Excitebike — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,lap=1,gameTime=0,titlePulse=0;
var player,opponents=[],particles=[],ramps=[],obstacles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyBoost=false;
var cameraX=0,trackLength=5000,LANE_COUNT=4,laneHeight=0;
var PLAYER_SPEED=200,MAX_SPEED=500,HEAT=0,MAX_HEAT=100,OVERHEAT_COOLDOWN=0;
var groundY=0;
function diffMult(){ return lap<=2?0.7:(lap<=5?1.0:1.0+(lap-5)*0.12); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;laneHeight=H*0.12;groundY=H*0.4;
if(gameState==='title')buildTrack();}

function buildTrack(){
ramps=[];obstacles=[];opponents=[];
trackLength=4000+lap*1000;
// Ramps
for(var i=0;i<Math.floor(trackLength/300);i++){
var rx=300+i*300+Math.random()*100;
var rType=Math.random()>0.5?'small':'big';
ramps.push({x:rx,w:rType==='big'?60:40,h:rType==='big'?30:18,type:rType,lane:Math.floor(Math.random()*LANE_COUNT)});}
// Obstacles (mud patches)
for(var i=0;i<Math.floor(trackLength/500);i++){
var ox=500+i*500+Math.random()*200;
obstacles.push({x:ox,w:30,lane:Math.floor(Math.random()*LANE_COUNT)});}
// Opponents
for(var i=0;i<3+lap;i++){
var opp={x:200+Math.random()*1000,lane:Math.floor(Math.random()*LANE_COUNT),
speed:(150+Math.random()*100)*diffMult(),frame:Math.random()*10};
if(opp.speed>PLAYER_SPEED*0.9)opp.speed=PLAYER_SPEED*0.85;
opponents.push(opp);}
}

function resetGame(){
player={x:100,lane:1,speed:PLAYER_SPEED,airTime:0,airVy:0,rotation:0,y:0,frame:0};
score=0;lives=3;lap=1;gameTime=0;HEAT=0;OVERHEAT_COOLDOWN=0;cameraX=0;particles=[];
buildTrack();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100-50,vy:(Math.random()-0.5)*100,life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*3});}

function getLaneY(lane){return groundY+lane*laneHeight;}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*player.speed*0.05;
// Lane switching
if(keyUp&&player.airTime<=0){player.lane--;if(player.lane<0)player.lane=0;}
if(keyDown&&player.airTime<=0){player.lane++;if(player.lane>=LANE_COUNT)player.lane=LANE_COUNT-1;}
keyUp=false;keyDown=false;// Single press lane change
// Speed control
if(keyRight){player.speed+=200*dt;HEAT+=15*dt;}
else if(keyLeft){player.speed-=200*dt;HEAT-=20*dt;}
else{player.speed-=30*dt;HEAT-=10*dt;}
// Boost
if(keyBoost&&OVERHEAT_COOLDOWN<=0){player.speed+=350*dt;HEAT+=40*dt;}
if(HEAT<0)HEAT=0;
if(HEAT>=MAX_HEAT){OVERHEAT_COOLDOWN=2;HEAT=MAX_HEAT;}
if(OVERHEAT_COOLDOWN>0){OVERHEAT_COOLDOWN-=dt;player.speed*=0.95;if(OVERHEAT_COOLDOWN<=0)HEAT=50;}
if(player.speed<50)player.speed=50;if(player.speed>MAX_SPEED)player.speed=MAX_SPEED;
// Move forward
player.x+=player.speed*dt;
cameraX=player.x-W*0.2;
// Air physics
if(player.airTime>0){
player.airTime-=dt;player.y+=player.airVy*dt;player.airVy+=400*dt;
player.rotation+=(player.speed>300?3:-1)*dt;
if(player.airTime<=0){player.y=0;player.rotation=0;
addParticles(player.x,getLaneY(player.lane),'#aa8866',5);}}
// Ramp collision
for(var i=0;i<ramps.length;i++){var r=ramps[i];
if(r.lane===player.lane&&player.airTime<=0&&Math.abs(player.x-r.x)<r.w/2){
player.airTime=r.type==='big'?0.8:0.5;
player.airVy=r.type==='big'?-200:-120;player.y=0;player.rotation=0;
score+=r.type==='big'?200:100;
addParticles(player.x,getLaneY(player.lane),'#ffcc00',8);}}
// Obstacle collision
for(var i=0;i<obstacles.length;i++){var o=obstacles[i];
if(o.lane===player.lane&&player.airTime<=0&&Math.abs(player.x-o.x)<o.w/2){
player.speed*=0.5;addParticles(player.x,getLaneY(player.lane),'#885533',6);
o.x=-1000;// Remove it
}}
// Opponent collision
for(var i=0;i<opponents.length;i++){var opp=opponents[i];
opp.x+=opp.speed*dt;opp.frame+=dt*opp.speed*0.05;
if(opp.x>trackLength)opp.x=0;
if(opp.lane===player.lane&&player.airTime<=0&&Math.abs(player.x-opp.x)<25){
player.speed*=0.7;opp.lane=(opp.lane+1)%LANE_COUNT;}}
// Crash if speed drops too low from obstacles/collisions (easy mode: very forgiving)
if(player.speed<=50&&OVERHEAT_COOLDOWN>0){
lives--;
if(lives<=0){gameState='gameover';}
else{player.speed=PLAYER_SPEED;OVERHEAT_COOLDOWN=0;HEAT=0;}}
// Lap completion
if(player.x>=trackLength){
lap++;score+=2000;player.x=100;cameraX=0;
addParticles(W/2,H/2,'#ffcc00',20);buildTrack();}
// Score ticks
score+=Math.floor(player.speed*dt*0.1);
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawBike(x,y,rot,color,frame){
ctx.save();ctx.translate(x,y);ctx.rotate(rot);
// Wheels
ctx.fillStyle='#333';ctx.beginPath();ctx.arc(-12,4,6,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(12,4,6,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-12,4,6,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(12,4,6,0,Math.PI*2);ctx.stroke();
// Frame
ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,2);ctx.lineTo(0,-6);ctx.lineTo(12,2);ctx.stroke();
// Rider
ctx.fillStyle=color;ctx.fillRect(-4,-14,8,10);
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-16,4,0,Math.PI*2);ctx.fill();
// Helmet
ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,-16,4,Math.PI,0);ctx.fill();
ctx.restore();}

function render(){
// Sky gradient
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2a4a');bg.addColorStop(0.4,'#2a3a5a');bg.addColorStop(1,'#3a2a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Mountains in background
ctx.fillStyle='#2a3a4a';
ctx.beginPath();ctx.moveTo(0,groundY-20);
for(var i=0;i<W;i+=50){ctx.lineTo(i,groundY-40-Math.sin((i+cameraX*0.1)*0.02)*30);}
ctx.lineTo(W,groundY-20);ctx.fill();
// Track
for(var lane=0;lane<LANE_COUNT;lane++){
var ly=getLaneY(lane);
ctx.fillStyle=lane%2===0?'#8B7355':'#9B8365';
ctx.fillRect(0,ly-laneHeight/2,W,laneHeight);
ctx.strokeStyle='#ffffff33';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,ly-laneHeight/2);ctx.lineTo(W,ly-laneHeight/2);ctx.stroke();}
ctx.save();ctx.translate(-cameraX,0);
// Ramps
for(var i=0;i<ramps.length;i++){var r=ramps[i];
var rx=r.x-cameraX;if(rx<-100||rx>W+100)continue;
var ry=getLaneY(r.lane);
ctx.fillStyle=r.type==='big'?'#cc8844':'#aa7744';
ctx.beginPath();ctx.moveTo(r.x-r.w/2,ry);ctx.lineTo(r.x,ry-r.h);ctx.lineTo(r.x+r.w/2,ry);ctx.fill();
ctx.strokeStyle='#ffaa66';ctx.lineWidth=1;ctx.stroke();}
// Obstacles
for(var i=0;i<obstacles.length;i++){var o=obstacles[i];
var ox=o.x-cameraX;if(ox<-50||ox>W+50)continue;
ctx.fillStyle='#554422';ctx.fillRect(o.x-o.w/2,getLaneY(o.lane)-5,o.w,10);}
// Opponents
for(var i=0;i<opponents.length;i++){var opp=opponents[i];
var ox=opp.x-cameraX;if(ox<-50||ox>W+50)continue;
drawBike(opp.x,getLaneY(opp.lane)+opp.frame%1*0,0,['#44aa44','#4444aa','#aa44aa','#aaaa44','#44aaaa'][i%5],opp.frame);}
// Player
var py=getLaneY(player.lane)+player.y;
drawBike(player.x,py,player.rotation,'#ff4444',player.frame);
// Exhaust particles when boosting
if(keyBoost&&OVERHEAT_COOLDOWN<=0){
ctx.fillStyle='rgba(255,100,0,0.5)';
for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(player.x-15-Math.random()*10,py+Math.random()*6-3,2+Math.random()*3,0,Math.PI*2);ctx.fill();}}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
ctx.restore();
// Heat meter
var heatW=120,heatH=12,heatX=W-heatW-20,heatY=20;
ctx.fillStyle='#333';ctx.fillRect(heatX,heatY,heatW,heatH);
var heatPct=HEAT/MAX_HEAT;
ctx.fillStyle=heatPct>0.8?'#ff2222':heatPct>0.5?'#ffaa00':'#44cc44';
ctx.fillRect(heatX,heatY,heatW*heatPct,heatH);
ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.strokeRect(heatX,heatY,heatW,heatH);
ctx.fillStyle='#fff';ctx.font='10px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('HEAT',heatX-5,heatY+10);
if(OVERHEAT_COOLDOWN>0){ctx.fillStyle='#ff2222';ctx.font='bold 14px "Courier New",monospace';ctx.textAlign='center';ctx.fillText('OVERHEAT!',heatX+heatW/2,heatY+28);}
// Speed bar
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('SPD: '+Math.floor(player.speed),15,25);
ctx.fillText('LAP: '+lap,15,40);
// Progress bar
var progW=W*0.5,progH=6,progX=(W-progW)/2,progY=H-15;
ctx.fillStyle='#333';ctx.fillRect(progX,progY,progW,progH);
ctx.fillStyle='#44ccff';ctx.fillRect(progX,progY,progW*(player.x/trackLength),progH);
}

function drawTitle(dt){
ctx.fillStyle='#1a2a4a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Animated track lines
for(var i=0;i<5;i++){var ty=H*0.5+i*20;
ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,ty);ctx.lineTo(W,ty);ctx.stroke();}
// Moving bike silhouette
var bikeX=(titlePulse*80)%W;
ctx.fillStyle='#ff444488';ctx.beginPath();ctx.arc(bikeX,H*0.55,8,0,Math.PI*2);ctx.fill();
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff4444';ctx.fillText('EXCITEBIKE',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ff8866';ctx.fillText('RACE TO THE FINISH!',W/2,H*0.37);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Up/Down switch lanes, Right accelerate, Space boost',W/2,H*0.68);
ctx.fillText('Watch your HEAT meter!',W/2,H*0.74);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('RACE OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Laps completed: '+(lap-1),W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent=Math.floor(player.speed)+' MPH';
document.getElementById('hud-time').textContent='LAP '+lap;}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){gameTime+=dt;drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){gameTime+=dt;render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){if(down)keyUp=true;}
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){if(down)keyDown=true;}
if(e.key===' ')keyBoost=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initExcitebike=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){if(v)keyUp=true;});bindMobile('btn-down',function(v){if(v)keyDown=true;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopExcitebike=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyBoost=false;};
})();
