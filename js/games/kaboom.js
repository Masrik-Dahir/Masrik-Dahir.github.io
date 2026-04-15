// Kaboom — Catch bombs with bucket paddles
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var buckets,bomber,bombs=[],particles=[],explosions=[];
var mouseX,bestScore=0,level=1,bombsCaught=0,missStreak=0;
var BUCKET_WIDTHS=[80,70,60];
var BUCKET_COLORS=['#ff4444','#44aaff','#44ff66'];

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
if(buckets)buckets.x=W/2;
mouseX=W/2;
}

function resetGame(){
score=0;lives=3;gameTime=0;level=1;bombsCaught=0;missStreak=0;
bombs=[];particles=[];explosions=[];
bomber={x:W/2,y:50,vx:80,w:50,h:30,dir:1,dropTimer:0,dropRate:1.8};
buckets={x:W/2,layers:3};
mouseX=W/2;
gameState='playing';
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200-50,life:0.4+Math.random()*0.5,color:color,size:2+Math.random()*4});
}

function addExplosion(x,y){
for(var i=0;i<20;i++){
var a=Math.random()*Math.PI*2;
explosions.push({x:x,y:y,vx:Math.cos(a)*80*Math.random(),vy:Math.sin(a)*80*Math.random()-30,life:0.6+Math.random()*0.4,size:3+Math.random()*5});
}
}

function update(dt){
if(dt>0.05)dt=0.05;gameTime+=dt;
// Difficulty multiplier: levels 1-2 easy, 3-5 medium, 6+ hard
var diffMult=level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12);
// bomber movement - difficulty scales speed
var bomberSpeed=(80+level*15)*diffMult;if(bomberSpeed>250)bomberSpeed=250;
bomber.x+=bomberSpeed*bomber.dir*dt;
if(bomber.x>W-bomber.w/2){bomber.dir=-1;}
if(bomber.x<bomber.w/2){bomber.dir=1;}
// drop bombs - difficulty scales drop rate
bomber.dropTimer+=dt;
var dropInterval=level<=2?Math.max(0.6,bomber.dropRate-level*0.04):Math.max(0.3,bomber.dropRate-level*0.08);
if(bomber.dropTimer>dropInterval){
bomber.dropTimer=0;
var spread=level<=2?10:20*diffMult;
bombs.push({x:bomber.x+(Math.random()-0.5)*spread,y:bomber.y+bomber.h/2,vy:0,active:true});
}
// speed ramp per level
bomber.vx=bomberSpeed;
// bucket follows mouse/touch
buckets.x+=(mouseX-buckets.x)*12*dt;
if(buckets.x<60)buckets.x=60;
if(buckets.x>W-60)buckets.x=W-60;
// bombs fall
var bucketBaseY=H-60;
for(var i=bombs.length-1;i>=0;i--){
var b=bombs[i];
b.vy+=400*dt;// gravity
b.y+=b.vy*dt;
// check catch by buckets
var caught=false;
for(var layer=0;layer<buckets.layers;layer++){
var bw=BUCKET_WIDTHS[layer];
var by=bucketBaseY-layer*35;
if(b.y>by-10&&b.y<by+15&&Math.abs(b.x-buckets.x)<bw/2){
caught=true;
score+=level*10;bombsCaught++;missStreak=0;
addParticles(b.x,by,'#ffcc00',6);
bombs.splice(i,1);
// level up every 20 catches
if(bombsCaught%20===0&&level<15)level++;
break;
}
}
if(!caught&&b.y>H+10){
// missed!
bombs.splice(i,1);
missStreak++;
addExplosion(b.x,H-20);
if(buckets.layers>1)buckets.layers--;
else{
lives--;
if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
else{buckets.layers=3;}
}
}
}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
// explosions
for(var i=explosions.length-1;i>=0;i--){var e=explosions[i];e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;if(e.life<=0)explosions.splice(i,1);}
}

function render(){
// bg gradient
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a2e');bg.addColorStop(1,'#0a0a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// building bg
ctx.fillStyle='#1a1a2a';
for(var i=0;i<6;i++){
var bx=i*W/6+10;var bh=80+Math.sin(i*2)*40;
ctx.fillRect(bx,H-bh-40,W/7,bh);
// windows
ctx.fillStyle='rgba(255,200,80,0.2)';
for(var wy=0;wy<bh-15;wy+=18){for(var wx=0;wx<W/7-12;wx+=14){
ctx.fillRect(bx+6+wx,H-bh-34+wy,8,10);
}}
ctx.fillStyle='#1a1a2a';
}
// Enhanced mad bomber character
ctx.save();ctx.translate(bomber.x,bomber.y);
// Body with gradient
var bodyGrad=ctx.createLinearGradient(0,-bomber.h/2,0,bomber.h/2);
bodyGrad.addColorStop(0,'#2a2a2a');bodyGrad.addColorStop(1,'#1a1a1a');
ctx.fillStyle=bodyGrad;ctx.fillRect(-bomber.w/2,-bomber.h/2,bomber.w,bomber.h);
// Collar/shirt detail
ctx.fillStyle='#444';ctx.fillRect(-bomber.w/2+4,bomber.h/2-10,bomber.w-8,8);
// Face with skin gradient
var faceGrad=ctx.createRadialGradient(-2,-7,3,0,-5,14);
faceGrad.addColorStop(0,'#ffe0b2');faceGrad.addColorStop(1,'#e8b87a');
ctx.fillStyle=faceGrad;ctx.beginPath();ctx.arc(0,-5,14,0,Math.PI*2);ctx.fill();
// Cheeks (red blush - he's mad)
ctx.fillStyle='rgba(255,100,80,0.3)';
ctx.beginPath();ctx.arc(-10,-2,5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(10,-2,5,0,Math.PI*2);ctx.fill();
// Eyes (mad! with animation)
var eyeShift=Math.sin(gameTime*3)*1;
ctx.fillStyle='#fff';ctx.fillRect(-8,-9,7,6);ctx.fillRect(1,-9,7,6);
ctx.fillStyle='#222';ctx.fillRect(-6+eyeShift,-8,3,4);ctx.fillRect(3+eyeShift,-8,3,4);
// Angry eyebrows (animated)
ctx.strokeStyle='#4a3020';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(-9,-11);ctx.lineTo(-2,-14);ctx.stroke();
ctx.beginPath();ctx.moveTo(9,-11);ctx.lineTo(2,-14);ctx.stroke();
// Nose
ctx.fillStyle='#d4a06a';ctx.beginPath();ctx.arc(0,-3,2.5,0,Math.PI*2);ctx.fill();
// Evil grin
ctx.strokeStyle='#cc3333';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,7,0.2,Math.PI-0.2);ctx.stroke();
// Teeth
ctx.fillStyle='#fff';ctx.fillRect(-4,0,2,3);ctx.fillRect(-1,0,2,3);ctx.fillRect(2,0,2,3);
// Hat with gradient
var hatGrad=ctx.createLinearGradient(0,-26,0,-19);
hatGrad.addColorStop(0,'#444');hatGrad.addColorStop(1,'#222');
ctx.fillStyle=hatGrad;ctx.fillRect(-16,-19,32,7);ctx.fillRect(-10,-27,20,9);
// Hat band
ctx.fillStyle='#884444';ctx.fillRect(-16,-19,32,3);
// Hat top highlight
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(-8,-26,16,3);
ctx.restore();
// Enhanced bombs with gradient and glow
for(var i=0;i<bombs.length;i++){
var b=bombs[i];
ctx.save();
// Bomb body with 3D gradient
var bGrad=ctx.createRadialGradient(b.x-2,b.y-3,1,b.x,b.y,8);
bGrad.addColorStop(0,'#444');bGrad.addColorStop(0.5,'#222');bGrad.addColorStop(1,'#000');
ctx.fillStyle=bGrad;ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();
// Bomb highlight
ctx.fillStyle='rgba(255,255,255,0.15)';
ctx.beginPath();ctx.arc(b.x-3,b.y-3,3,0,Math.PI*2);ctx.fill();
// Fuse with curve
ctx.strokeStyle='#cc9944';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(b.x,b.y-8);
ctx.quadraticCurveTo(b.x+2,b.y-11,b.x+5,b.y-14);ctx.stroke();
// Animated spark with glow
ctx.shadowColor='#ffaa00';ctx.shadowBlur=8;
ctx.fillStyle='#ffdd44';
var sparkSize=2+Math.random()*3;
ctx.beginPath();ctx.arc(b.x+5,b.y-14,sparkSize,0,Math.PI*2);ctx.fill();
// Spark particles
ctx.fillStyle='#ff8800';
for(var sp=0;sp<3;sp++){
ctx.beginPath();ctx.arc(b.x+5+Math.random()*6-3,b.y-14+Math.random()*4-2,1,0,Math.PI*2);ctx.fill();}
ctx.shadowBlur=0;ctx.restore();
}
// buckets
var bucketBaseY=H-60;
for(var layer=0;layer<buckets.layers;layer++){
var bw=BUCKET_WIDTHS[layer];
var by=bucketBaseY-layer*35;
var grad=ctx.createLinearGradient(buckets.x-bw/2,by,buckets.x+bw/2,by);
grad.addColorStop(0,BUCKET_COLORS[layer]);grad.addColorStop(1,'#222');
ctx.fillStyle=grad;
// bucket shape (trapezoid)
ctx.beginPath();
ctx.moveTo(buckets.x-bw/2,by);ctx.lineTo(buckets.x-bw/2+8,by+22);
ctx.lineTo(buckets.x+bw/2-8,by+22);ctx.lineTo(buckets.x+bw/2,by);
ctx.closePath();ctx.fill();
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
}
// explosions
for(var i=0;i<explosions.length;i++){
var e=explosions[i];ctx.globalAlpha=e.life;
ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
// particles
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
// HUD
ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.textAlign='left';
ctx.fillText('LEVEL '+level,10,20);
ctx.fillStyle='#ff4444';ctx.textAlign='right';
for(var i=0;i<lives;i++)ctx.fillText('\u2665',W-10-i*18,20);
}

function drawTitle(dt){
titlePulse+=dt*3;
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a0a0a');bg.addColorStop(1,'#0a0a1a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// falling bombs decoration
for(var i=0;i<8;i++){
var bx=W*0.15+i*W*0.1;var by=(titlePulse*60+i*80)%H;
ctx.fillStyle='#333';ctx.beginPath();ctx.arc(bx,by,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(bx+3,by-10,2,0,Math.PI*2);ctx.fill();
}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff3333';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.09)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('KABOOM!',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('CATCH THE BOMBS',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Move mouse/touch to position buckets',W/2,H*0.65);
if(bestScore>0){ctx.fillStyle='#ffcc00';ctx.fillText('BEST: '+bestScore,W/2,H*0.73);}
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Bombs caught: '+bombsCaught,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);
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
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){if(down)mouseX=Math.max(60,mouseX-30);}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){if(down)mouseX=Math.min(W-60,mouseX+30);}
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowLeft','ArrowRight','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};
var onMove=function(e){
var r=canvas.getBoundingClientRect();
if(e.touches)mouseX=e.touches[0].clientX-r.left;
else mouseX=e.clientX-r.left;
};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initKaboom=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
canvas.addEventListener('mousemove',onMove);canvas.addEventListener('touchmove',function(e){e.preventDefault();onMove(e);});
bindMobile('btn-left',function(v){if(v)mouseX=Math.max(60,mouseX-30);});
bindMobile('btn-right',function(v){if(v)mouseX=Math.min(W-60,mouseX+30);});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopKaboom=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
canvas.removeEventListener('mousemove',onMove);
gameState='title';
};
})();
