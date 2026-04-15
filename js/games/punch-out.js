// Punch-Out — Boxing game with timing-based combat
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,opponent,particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var bestScore=0,round=1,stars=0,maxStars=3;
var playerHP=100,opponentHP=100,knockdowns=0;
var playerState='idle',playerTimer=0,dodgeDir=0;
var oppState='idle',oppTimer=0,oppPattern=[],oppPatternIdx=0;
var hitFlash=0,oppHitFlash=0,comboCount=0,comboTimer=0;
var crowdPhase=0,ringLightPhase=0,impactStars=[];
var PATTERNS=[
['jab','pause','jab','pause','hook_left','pause','pause'],
['uppercut','pause','pause','jab','jab','pause','hook_right','pause'],
['jab','pause','hook_left','pause','hook_right','pause','jab','pause'],
['pause','pause','uppercut','pause','jab','pause','hook_left','pause','jab','pause']
];
function diffMult(){return round<=2?0.7:(round<=5?1.0:1.0+(round-5)*0.15);}

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
}

function resetGame(){
score=0;lives=3;gameTime=0;round=1;stars=0;knockdowns=0;
playerHP=100;opponentHP=100;comboCount=0;comboTimer=0;
playerState='idle';playerTimer=0;
oppState='idle';oppTimer=0;
oppPattern=PATTERNS[0].slice();oppPatternIdx=0;
particles=[];gameState='playing';
}

function nextRound(){
round++;if(round>10)round=10;
playerHP=100;opponentHP=100+round*20;
oppPattern=PATTERNS[(round-1)%PATTERNS.length].slice();oppPatternIdx=0;
oppState='idle';oppTimer=0;playerState='idle';playerTimer=0;stars=0;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200-50,
life:0.3+Math.random()*0.3,color:color,size:2+Math.random()*4});
}

function playerHit(dmg){
if(playerState==='dodge_left'||playerState==='dodge_right'||playerState==='block'){
if(playerState==='block')dmg=Math.floor(dmg*0.2);
else{dmg=0;stars=Math.min(maxStars,stars+1);comboCount=0;}// perfect dodge
return;
}
playerHP-=dmg;hitFlash=0.2;comboCount=0;
addParticles(W/2,H*0.4,'#ff4444',8);
if(playerHP<=0){
knockdowns++;
if(knockdowns>=3||lives<=1){
lives=0;if(score>bestScore)bestScore=score;gameState='gameover';
}else{
lives--;playerHP=80;playerState='stun';playerTimer=1.5;
}
}
}

function opponentHit(dmg){
opponentHP-=dmg;oppHitFlash=0.15;comboCount++;comboTimer=1;
addParticles(W/2,H*0.25,'#ffcc00',6);
var bonus=comboCount>3?comboCount*50:0;
score+=dmg*10+bonus;
if(opponentHP<=0){
score+=round*1000;
addParticles(W/2,H*0.3,'#ffffff',20);
oppState='ko';oppTimer=2;
}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
if(hitFlash>0)hitFlash-=dt;
if(oppHitFlash>0)oppHitFlash-=dt;
if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0)comboCount=0;}
// player state machine
if(playerTimer>0){playerTimer-=dt;if(playerTimer<=0){playerState='idle';}}
// opponent KO -> next round
if(oppState==='ko'){
oppTimer-=dt;
if(oppTimer<=0)nextRound();
return;
}
// opponent AI
if(oppTimer>0)oppTimer-=dt;
if(oppTimer<=0&&oppState!=='stun'){
var action=oppPattern[oppPatternIdx%oppPattern.length];
oppPatternIdx++;
var dm=diffMult();
var speed=(1.2-round*0.1)/dm;if(speed<0.3)speed=0.3;
if(action==='jab'){
oppState='jab';oppTimer=0.4/dm;
setTimeout(function(){
if(oppState==='jab')playerHit(Math.floor((8+round*2)*dm));
},Math.floor(200/dm));
}else if(action==='hook_left'){
oppState='hook_left';oppTimer=0.6/dm;
setTimeout(function(){
if(oppState==='hook_left')playerHit(Math.floor((12+round*3)*dm));
},Math.floor(300/dm));
}else if(action==='hook_right'){
oppState='hook_right';oppTimer=0.6/dm;
setTimeout(function(){
if(oppState==='hook_right')playerHit(Math.floor((12+round*3)*dm));
},Math.floor(300/dm));
}else if(action==='uppercut'){
oppState='uppercut';oppTimer=0.8/dm;
setTimeout(function(){
if(oppState==='uppercut')playerHit(Math.floor((18+round*4)*dm));
},Math.floor(400/dm));
}else{
oppState='idle';oppTimer=speed+Math.random()*0.5;
}
}
// player actions
if(playerState==='idle'){
if(keyLeft){playerState='dodge_left';playerTimer=0.3;dodgeDir=-1;}
else if(keyRight){playerState='dodge_right';playerTimer=0.3;dodgeDir=1;}
else if(keyDown){playerState='block';playerTimer=0.4;}
else if(keyUp){
if(stars>0){
// star punch!
stars--;playerState='star_punch';playerTimer=0.5;
if(oppState!=='block')opponentHit(30);
else{oppState='stun';oppTimer=0.5;}
}else{
// normal punch (alternate left/right)
playerState=Math.random()>0.5?'punch_left':'punch_right';playerTimer=0.25;
if(oppState==='idle'||oppState==='jab'){
opponentHit(6+Math.floor(comboCount*1.5));
}else if(oppState==='hook_left'||oppState==='hook_right'||oppState==='uppercut'){
// counter-punch during wind-up
opponentHit(12);stars=Math.min(maxStars,stars+1);
oppState='stun';oppTimer=0.8;
}
}
}
}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
crowdPhase+=0.02;ringLightPhase+=0.03;
// arena bg with gradient
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a2e');bg.addColorStop(0.4,'#120820');bg.addColorStop(1,'#0a0a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// crowd silhouettes in background
ctx.save();
for(var i=0;i<Math.floor(W/12);i++){
var cx=i*12+6,cy=H*0.08+Math.sin(crowdPhase+i*0.5)*3;
var crowdGrad=ctx.createRadialGradient(cx,cy,1,cx,cy,8);
crowdGrad.addColorStop(0,'rgba(60,40,80,0.6)');crowdGrad.addColorStop(1,'rgba(30,20,40,0.2)');
ctx.fillStyle=crowdGrad;
ctx.beginPath();ctx.arc(cx,cy,6+Math.sin(crowdPhase*2+i)*1,0,Math.PI*2);ctx.fill();
}
ctx.restore();
// ring lights
ctx.save();
for(var i=0;i<3;i++){
var lx=W*0.2+i*W*0.3,ly=5;
var lightA=0.3+0.2*Math.sin(ringLightPhase+i*2);
var lg=ctx.createRadialGradient(lx,ly,2,lx,ly,W*0.15);
lg.addColorStop(0,'rgba(255,240,200,'+lightA+')');lg.addColorStop(1,'rgba(255,240,200,0)');
ctx.fillStyle=lg;ctx.fillRect(lx-W*0.15,0,W*0.3,H*0.6);
}
ctx.restore();
// ring ropes with 3D effect
for(var ri=0;ri<3;ri++){
var ry=H*0.13+ri*H*0.21;
ctx.save();
ctx.strokeStyle='#553311';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,ry);ctx.lineTo(W,ry);ctx.stroke();
ctx.strokeStyle='#aa6633';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,ry-1);ctx.lineTo(W,ry-1);ctx.stroke();
ctx.restore();
}
// ring posts
ctx.save();
var postGrad=ctx.createLinearGradient(0,0,20,0);
postGrad.addColorStop(0,'#aa4444');postGrad.addColorStop(0.5,'#ff6666');postGrad.addColorStop(1,'#aa4444');
ctx.fillStyle=postGrad;
ctx.fillRect(2,H*0.1,14,H*0.48);ctx.fillRect(W-16,H*0.1,14,H*0.48);
// post caps
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(9,H*0.1,8,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(W-9,H*0.1,8,0,Math.PI*2);ctx.fill();
ctx.restore();
// ring floor with texture
var floorGrad=ctx.createLinearGradient(0,H*0.55,0,H);
floorGrad.addColorStop(0,'rgba(120,100,80,0.25)');floorGrad.addColorStop(0.5,'rgba(100,80,60,0.15)');floorGrad.addColorStop(1,'rgba(60,50,40,0.1)');
ctx.fillStyle=floorGrad;ctx.fillRect(0,H*0.55,W,H*0.45);
// ring floor mat lines
ctx.strokeStyle='rgba(150,120,90,0.08)';ctx.lineWidth=1;
for(var fl=0;fl<10;fl++){
ctx.beginPath();ctx.moveTo(W*0.1,H*0.55+fl*(H*0.045));ctx.lineTo(W*0.9,H*0.55+fl*(H*0.045));ctx.stroke();
}
// opponent
var oppX=W/2,oppY=H*0.3;
var oppScale=1;
if(oppState==='ko'){oppScale=0.8;oppY+=30;}
ctx.save();ctx.translate(oppX,oppY);ctx.scale(oppScale,oppScale);
if(oppHitFlash>0){ctx.translate(Math.random()*6-3,Math.random()*6-3);}
// opponent body with gradient
var bodyGrad=ctx.createLinearGradient(-35,-20,-35,40);
bodyGrad.addColorStop(0,oppState==='stun'?'#775555':'#dd5555');
bodyGrad.addColorStop(1,oppState==='stun'?'#553333':'#aa3333');
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.moveTo(-32,-15);ctx.quadraticCurveTo(-38,20,-30,40);ctx.lineTo(30,40);ctx.quadraticCurveTo(38,20,32,-15);ctx.closePath();ctx.fill();
// shoulders
ctx.fillStyle=oppState==='stun'?'#664444':'#cc4444';
ctx.beginPath();ctx.ellipse(0,-15,40,12,0,0,Math.PI*2);ctx.fill();
// head with skin tone gradient
var headGrad=ctx.createRadialGradient(-5,-45,3,0,-40,28);
headGrad.addColorStop(0,oppHitFlash>0?'#ffaaaa':'#ffe0bb');headGrad.addColorStop(1,oppHitFlash>0?'#dd7777':'#ddb080');
ctx.fillStyle=headGrad;ctx.beginPath();ctx.arc(0,-40,25,0,Math.PI*2);ctx.fill();
// face detail
if(oppState==='ko'){
ctx.fillStyle='#000';ctx.font='14px sans-serif';ctx.textAlign='center';
ctx.fillText('X  X',0,-42);ctx.fillText('~',0,-30);
// stars around head
for(var si=0;si<3;si++){
var sa=gameTime*4+si*2.1;ctx.fillStyle='#ffcc00';ctx.font='10px sans-serif';
ctx.fillText('\u2605',Math.cos(sa)*18,Math.sin(sa)*10-45);
}
}else if(oppState==='stun'){
ctx.fillStyle='#000';ctx.font='14px sans-serif';ctx.textAlign='center';
ctx.fillText('@ @',0,-42);
}else{
// detailed eyes
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-8,-44,5,4,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(8,-44,5,4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-7,-44,2.5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(9,-44,2.5,0,Math.PI*2);ctx.fill();
// eyebrows
ctx.strokeStyle='#553300';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-14,-50);ctx.lineTo(-3,-49);ctx.stroke();
ctx.beginPath();ctx.moveTo(3,-49);ctx.lineTo(14,-50);ctx.stroke();
// nose
ctx.fillStyle='#dda880';ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(-3,-34);ctx.lineTo(3,-34);ctx.closePath();ctx.fill();
// mouth
ctx.strokeStyle='#993333';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-33,6,0.1,Math.PI-0.1);ctx.stroke();
}
// gloves with 3D shading
var lx=-45,rx=45,gy=-5;
if(oppState==='jab'){gy+=20;lx-=5;}
if(oppState==='hook_left'){lx=-55;gy+=10;}
if(oppState==='hook_right'){rx=55;gy+=10;}
if(oppState==='uppercut'){gy-=30;}
// Left glove
var gloveGradL=ctx.createRadialGradient(lx-3,gy-3,2,lx,gy,16);
gloveGradL.addColorStop(0,'#ff6644');gloveGradL.addColorStop(0.7,'#dd2222');gloveGradL.addColorStop(1,'#991111');
ctx.fillStyle=gloveGradL;ctx.beginPath();ctx.arc(lx,gy,14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(lx-4,gy-4,6,0,Math.PI*2);ctx.fill();
// Right glove
var gloveGradR=ctx.createRadialGradient(rx-3,gy-3,2,rx,gy,16);
gloveGradR.addColorStop(0,'#ff6644');gloveGradR.addColorStop(0.7,'#dd2222');gloveGradR.addColorStop(1,'#991111');
ctx.fillStyle=gloveGradR;ctx.beginPath();ctx.arc(rx,gy,14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(rx-4,gy-4,6,0,Math.PI*2);ctx.fill();
ctx.restore();
// player
var plX=W/2,plY=H*0.75;
if(playerState==='dodge_left')plX-=40;
if(playerState==='dodge_right')plX+=40;
ctx.save();ctx.translate(plX,plY);
if(hitFlash>0){ctx.translate(Math.random()*4-2,Math.random()*4-2);}
// player body with gradient
var plBodyGrad=ctx.createLinearGradient(-30,-15,-30,35);
plBodyGrad.addColorStop(0,'#44cc44');plBodyGrad.addColorStop(1,'#228822');
ctx.fillStyle=plBodyGrad;
ctx.beginPath();ctx.moveTo(-28,-10);ctx.quadraticCurveTo(-33,15,-25,35);ctx.lineTo(25,35);ctx.quadraticCurveTo(33,15,28,-10);ctx.closePath();ctx.fill();
// player head (back of head) with gradient
var plHeadGrad=ctx.createRadialGradient(-3,-33,3,0,-30,22);
plHeadGrad.addColorStop(0,'#eebb77');plHeadGrad.addColorStop(1,'#cc9955');
ctx.fillStyle=plHeadGrad;ctx.beginPath();ctx.arc(0,-30,20,0,Math.PI*2);ctx.fill();
// hair with detail
ctx.fillStyle='#332200';ctx.beginPath();ctx.arc(0,-35,18,Math.PI+0.3,2*Math.PI-0.3);ctx.fill();
ctx.fillStyle='#221100';ctx.beginPath();ctx.arc(0,-36,16,Math.PI+0.5,2*Math.PI-0.5);ctx.fill();
// player gloves with 3D shading
var plgx_l=-40,plgx_r=40,plgy=-20;
if(playerState==='punch_left'){plgx_l=-20;plgy-=40;}
if(playerState==='punch_right'){plgx_r=20;plgy-=40;}
if(playerState==='star_punch'){plgx_l=0;plgx_r=0;plgy-=60;}
if(playerState==='block'){plgx_l=-15;plgx_r=15;plgy=-5;}
var plGloveGradL=ctx.createRadialGradient(plgx_l-3,plgy-3,2,plgx_l,plgy,14);
plGloveGradL.addColorStop(0,'#5588ff');plGloveGradL.addColorStop(0.7,'#2266ff');plGloveGradL.addColorStop(1,'#1144cc');
ctx.fillStyle=plGloveGradL;ctx.beginPath();ctx.arc(plgx_l,plgy,12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(plgx_l-3,plgy-3,5,0,Math.PI*2);ctx.fill();
var plGloveGradR=ctx.createRadialGradient(plgx_r-3,plgy-3,2,plgx_r,plgy,14);
plGloveGradR.addColorStop(0,'#5588ff');plGloveGradR.addColorStop(0.7,'#2266ff');plGloveGradR.addColorStop(1,'#1144cc');
ctx.fillStyle=plGloveGradR;ctx.beginPath();ctx.arc(plgx_r,plgy,12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(plgx_r-3,plgy-3,5,0,Math.PI*2);ctx.fill();
// star punch glow
if(playerState==='star_punch'){
ctx.save();ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;
ctx.fillStyle='rgba(255,204,0,0.4)';ctx.beginPath();ctx.arc(0,plgy,18,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();
}
ctx.restore();
// Impact stars for hits
for(var si=impactStars.length-1;si>=0;si--){
var is=impactStars[si];is.life-=0.016;
if(is.life<=0){impactStars.splice(si,1);continue;}
ctx.save();ctx.globalAlpha=is.life*2;ctx.translate(is.x,is.y);ctx.rotate(is.rot);
ctx.fillStyle='#ffcc00';ctx.beginPath();
for(var sp=0;sp<5;sp++){
var a=sp*Math.PI*2/5-Math.PI/2;
ctx.lineTo(Math.cos(a)*is.size,Math.sin(a)*is.size);
var a2=a+Math.PI/5;
ctx.lineTo(Math.cos(a2)*is.size*0.4,Math.sin(a2)*is.size*0.4);
}
ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.restore();
}
// HP bars with gradient and bevels
ctx.save();
// opponent HP bar
var hpBg=ctx.createLinearGradient(W*0.2,15,W*0.2,31);
hpBg.addColorStop(0,'#222');hpBg.addColorStop(1,'#444');
ctx.fillStyle=hpBg;ctx.fillRect(W*0.2,15,W*0.6,16);
var oppPct=Math.max(0,opponentHP/(100+round*20));
var hpGrad=ctx.createLinearGradient(W*0.2,17,W*0.2,29);
if(oppPct>0.3){hpGrad.addColorStop(0,'#ff6666');hpGrad.addColorStop(1,'#cc2222');}
else{hpGrad.addColorStop(0,'#ff3333');hpGrad.addColorStop(1,'#990000');}
ctx.fillStyle=hpGrad;ctx.fillRect(W*0.2+2,17,oppPct*(W*0.6-4),12);
ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.strokeRect(W*0.2,15,W*0.6,16);
ctx.fillStyle='#fff';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';
ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText('OPPONENT',W/2,26);ctx.shadowBlur=0;
// player HP bar
var plHpBg=ctx.createLinearGradient(W*0.2,H-30,W*0.2,H-14);
plHpBg.addColorStop(0,'#222');plHpBg.addColorStop(1,'#444');
ctx.fillStyle=plHpBg;ctx.fillRect(W*0.2,H-30,W*0.6,16);
var plPct=Math.max(0,playerHP/100);
var plHpGrad=ctx.createLinearGradient(W*0.2,H-28,W*0.2,H-16);
if(plPct>0.3){plHpGrad.addColorStop(0,'#66ff66');plHpGrad.addColorStop(1,'#22aa22');}
else{plHpGrad.addColorStop(0,'#ffaa00');plHpGrad.addColorStop(1,'#cc6600');}
ctx.fillStyle=plHpGrad;ctx.fillRect(W*0.2+2,H-28,plPct*(W*0.6-4),12);
ctx.strokeStyle='#888';ctx.strokeRect(W*0.2,H-30,W*0.6,16);
ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText('YOU',W/2,H-19);ctx.shadowBlur=0;
ctx.restore();
// stars with glow
ctx.save();
for(var i=0;i<stars;i++){
ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;
ctx.fillStyle='#ffcc00';ctx.font='18px "Courier New"';ctx.textAlign='left';
ctx.fillText('\u2605',10+i*22,H-35);
}
ctx.shadowBlur=0;ctx.restore();
// round display
ctx.fillStyle='#ccc';ctx.font='bold 12px "Courier New"';ctx.textAlign='right';
ctx.fillText('ROUND '+round,W-10,H-35);
// difficulty indicator
ctx.fillStyle='#888';ctx.font='10px "Courier New"';
var diff=round<=2?'EASY':round<=5?'MEDIUM':'HARD';
ctx.fillText(diff,W-10,H-22);
// combo with glow
if(comboCount>1){
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=12;
ctx.fillStyle='#ffcc00';ctx.font='bold 18px "Courier New"';
ctx.fillText(comboCount+'x COMBO!',W/2,H*0.5);
ctx.shadowBlur=0;ctx.restore();
}
// particles with glow
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.save();ctx.globalAlpha=p.life*2;
ctx.shadowColor=p.color;ctx.shadowBlur=6;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();
}
ctx.globalAlpha=1;
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a0a');bg.addColorStop(1,'#0a0a2a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// ring ropes decoration
ctx.strokeStyle='rgba(136,68,34,0.3)';ctx.lineWidth=3;
for(var i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,H*0.2+i*H*0.15);ctx.lineTo(W,H*0.2+i*H*0.15);ctx.stroke();}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff4444';
ctx.fillText('PUNCH-OUT!!',W/2,H*0.28);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('BOXING CHAMPION',W/2,H*0.36);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to dodge, Up to punch, Down to block',W/2,H*0.63);
ctx.fillText('Counter-punch during enemy wind-up for star punches!',W/2,H*0.68);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.76);}
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('KNOCKOUT!',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Rounds survived: '+round,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='RND '+round;
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
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initPunchOut=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPunchOut=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
