// Doodle Jump — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,bestScore=0,gameTime=0,titlePulse=0;
var doodler,platforms=[],particles=[],springs=[],monsters=[];
var GRAVITY=450,JUMP_VEL=-480,PLATFORM_COUNT=10;
var keyLeft=false,keyRight=false;
var cameraY=0,maxHeight=0;

function diffMult(){var lvl=Math.floor(score/300)+1;return lvl<=2?0.7:(lvl<=5?1.0:1.0+(lvl-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function generatePlatforms(startY){
for(var i=platforms.length;platforms.length<PLATFORM_COUNT+10;i++){
var y=startY-i*65-Math.random()*40;
var type='normal';var r=Math.random();
if(score>1500&&r<0.06)type='breaking';
else if(score>800&&r<0.12)type='moving';
else if(score>500&&r<0.06)type='spring';
platforms.push({x:15+Math.random()*(W-85),y:y,w:70,h:14,type:type,
vx:type==='moving'?(80+Math.random()*60)*(Math.random()>0.5?1:-1):0,
broken:false,springT:0});}}

function resetGame(){
doodler={x:W/2,y:H-100,vx:0,vy:0,dir:1,jumpT:0};
platforms=[];particles=[];springs=[];monsters=[];
cameraY=0;maxHeight=0;score=0;gameTime=0;
// generate initial platforms
platforms.push({x:W/2-35,y:H-60,w:70,h:14,type:'normal',vx:0,broken:false,springT:0});
for(var i=1;i<PLATFORM_COUNT+5;i++){
platforms.push({x:15+Math.random()*(W-85),y:H-60-i*55-Math.random()*30,w:70,h:14,
type:'normal',vx:0,broken:false,springT:0});}
gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.3+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// horizontal movement
if(keyLeft)doodler.vx=-250;
else if(keyRight)doodler.vx=250;
else doodler.vx*=0.85;
doodler.dir=doodler.vx<-10?-1:doodler.vx>10?1:doodler.dir;
// physics
doodler.vy+=GRAVITY*dt;
doodler.x+=doodler.vx*dt;
doodler.y+=doodler.vy*dt;
doodler.jumpT-=dt;
// screen wrap
if(doodler.x<-20)doodler.x=W+20;
if(doodler.x>W+20)doodler.x=-20;
// camera
var targetCam=doodler.y-H*0.4;
if(targetCam<cameraY)cameraY+=(targetCam-cameraY)*0.2;
// score based on height
var height=Math.max(0,-(doodler.y-H));
if(height>maxHeight){maxHeight=height;score=Math.floor(maxHeight/5);}
// platform collision (only when falling)
if(doodler.vy>0){
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(p.broken)continue;
if(doodler.x+15>p.x&&doodler.x-15<p.x+p.w&&
doodler.y+20>p.y&&doodler.y+20<p.y+p.h+doodler.vy*dt+8){
if(p.type==='breaking'){p.broken=true;addParticles(p.x+p.w/2,p.y,'#8B4513',8);continue;}
if(p.type==='spring'&&p.springT<=0){doodler.vy=JUMP_VEL*1.6;p.springT=0.3;addParticles(p.x+p.w/2,p.y,'#ff3355',8);}
else{doodler.vy=JUMP_VEL;}
doodler.jumpT=0.15;addParticles(doodler.x,doodler.y+20,'#00cc44',4);break;}}}
// moving platforms
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(p.type==='moving'){p.x+=p.vx*dt;if(p.x<0||p.x+p.w>W)p.vx*=-1;}
if(p.springT>0)p.springT-=dt;}
// remove old platforms & generate new ones
for(var i=platforms.length-1;i>=0;i--){
if(platforms[i].y-cameraY>H+50)platforms.splice(i,1);}
if(platforms.length>0){var topY=platforms[0].y;
for(var i=1;i<platforms.length;i++)if(platforms[i].y<topY)topY=platforms[i].y;
var dm=diffMult();
while(platforms.length<PLATFORM_COUNT+8){
topY-=Math.max(30,(45-dm*5)+Math.random()*(35+dm*10));
var type='normal';var r=Math.random();
if(score>1500&&r<0.05+dm*0.02)type='breaking';
else if(score>800&&r<0.10+dm*0.03)type='moving';
else if(score>500&&r<0.06)type='spring';
var mvSpeed=type==='moving'?((80+Math.random()*60)*dm)*(Math.random()>0.5?1:-1):0;
platforms.push({x:15+Math.random()*(W-85),y:topY,w:70,h:14,type:type,
vx:mvSpeed,
broken:false,springT:0});}}
// death check
if(doodler.y-cameraY>H+50){
if(score>bestScore)bestScore=score;
addParticles(doodler.x,H/2,'#ff3355',20);gameState='gameover';}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
// background with depth-based gradient
var heightPct=Math.min(1,score/3000);
var grad=ctx.createLinearGradient(0,0,0,H);
grad.addColorStop(0,heightPct>0.5?'#bbd8ee':'#e8f5e9');
grad.addColorStop(0.5,heightPct>0.5?'#aacce8':'#d4ead5');
grad.addColorStop(1,heightPct>0.5?'#99bbdd':'#c8e6c9');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
// grid lines with fading
ctx.strokeStyle='rgba(0,100,0,'+(0.06-heightPct*0.03)+')';ctx.lineWidth=1;
for(var x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(var y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
ctx.save();
// platforms
for(var i=0;i<platforms.length;i++){var p=platforms[i];
var py=p.y-cameraY;if(py<-20||py>H+20)continue;
if(p.broken){ctx.globalAlpha=0.4;
ctx.fillStyle='#8B4513';ctx.fillRect(p.x,py+5,p.w*0.4,p.h*0.6);ctx.fillRect(p.x+p.w*0.5,py+8,p.w*0.4,p.h*0.6);
ctx.globalAlpha=1;continue;}
if(p.type==='normal'){
var ng=ctx.createLinearGradient(p.x,py,p.x,py+p.h);ng.addColorStop(0,'#55cc55');ng.addColorStop(0.5,'#44aa44');ng.addColorStop(1,'#338833');
ctx.fillStyle=ng;ctx.fillRect(p.x,py,p.w,p.h);
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(p.x+2,py+1,p.w-4,3);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(p.x+2,py+p.h-3,p.w-4,2);
// grass tufts
ctx.fillStyle='#66dd66';for(var g=0;g<5;g++){ctx.fillRect(p.x+g*14+4,py-2,3,3);}
}else if(p.type==='moving'){
var mg=ctx.createLinearGradient(p.x,py,p.x,py+p.h);mg.addColorStop(0,'#66bbff');mg.addColorStop(0.5,'#4488ff');mg.addColorStop(1,'#3366cc');
ctx.fillStyle=mg;ctx.fillRect(p.x,py,p.w,p.h);
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(p.x+2,py+1,p.w-4,3);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(p.x+2,py+p.h-3,p.w-4,2);
// arrows
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px "Courier New"';ctx.textAlign='center';
ctx.fillText(p.vx>0?'>>':'<<',p.x+p.w/2,py+p.h-3);
}else if(p.type==='breaking'){
var bg=ctx.createLinearGradient(p.x,py,p.x,py+p.h);bg.addColorStop(0,'#cc8844');bg.addColorStop(1,'#886633');
ctx.fillStyle=bg;ctx.fillRect(p.x,py,p.w,p.h);
ctx.strokeStyle='#664422';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(p.x+p.w*0.3,py);ctx.lineTo(p.x+p.w*0.4,py+p.h);ctx.stroke();
ctx.beginPath();ctx.moveTo(p.x+p.w*0.7,py);ctx.lineTo(p.x+p.w*0.6,py+p.h);ctx.stroke();
ctx.beginPath();ctx.moveTo(p.x+p.w*0.5,py+2);ctx.lineTo(p.x+p.w*0.45,py+p.h);ctx.stroke();
}else if(p.type==='spring'){
var sg=ctx.createLinearGradient(p.x,py,p.x,py+p.h);sg.addColorStop(0,'#55cc55');sg.addColorStop(1,'#338833');
ctx.fillStyle=sg;ctx.fillRect(p.x,py,p.w,p.h);
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(p.x+2,py+1,p.w-4,3);
var sh=p.springT>0?15:8;
// spring coil
ctx.strokeStyle='#cc2244';ctx.lineWidth=2;
ctx.beginPath();for(var si=0;si<sh;si+=3){ctx.lineTo(p.x+p.w/2+(si%6===0?3:-3),py-si);}ctx.stroke();
ctx.fillStyle='#ff3355';ctx.beginPath();ctx.arc(p.x+p.w/2,py-sh,5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(p.x+p.w/2-1,py-sh-1,2,0,Math.PI*2);ctx.fill();}}
// doodler
var dx=doodler.x,dy=doodler.y-cameraY;
ctx.save();ctx.translate(dx,dy);ctx.scale(doodler.dir,1);
// body shadow
ctx.fillStyle='rgba(0,0,0,0.1)';ctx.beginPath();ctx.ellipse(2,0,14,18,0,0,Math.PI*2);ctx.fill();
// body gradient
var bdG=ctx.createRadialGradient(-3,-8,3,0,-5,18);bdG.addColorStop(0,'#88dd8a');bdG.addColorStop(0.7,'#66bb6a');bdG.addColorStop(1,'#449944');
ctx.fillStyle=bdG;ctx.beginPath();ctx.ellipse(0,-5,14,18,0,0,Math.PI*2);ctx.fill();
// belly highlight
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.ellipse(-2,-8,8,10,0,0,Math.PI*2);ctx.fill();
// face
ctx.fillStyle='#fff';ctx.shadowColor='rgba(0,0,0,0.2)';ctx.shadowBlur=3;
ctx.beginPath();ctx.arc(doodler.dir*2,-10,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(doodler.dir*4,-10,2.5,0,Math.PI*2);ctx.fill();
// eye highlight
ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.arc(doodler.dir*1,-11,1.5,0,Math.PI*2);ctx.fill();
// nose/mouth
ctx.fillStyle='#ff9800';ctx.beginPath();ctx.ellipse(8,-6,4,2.5,0,0,Math.PI*2);ctx.fill();
// cheek blush
ctx.fillStyle='rgba(255,100,100,0.15)';ctx.beginPath();ctx.ellipse(6,-3,4,3,0,0,Math.PI*2);ctx.fill();
// feet with shadow
var legOff=doodler.jumpT>0?-3:3;
ctx.fillStyle='#448b2f';ctx.fillRect(-12,13+legOff,10,6);ctx.fillRect(2,13-legOff,10,6);
ctx.fillStyle='#558b2f';ctx.fillRect(-12,12+legOff,10,6);ctx.fillRect(2,12-legOff,10,6);
// feet highlights
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(-11,12+legOff,8,2);ctx.fillRect(3,12-legOff,8,2);
ctx.restore();
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];var ppy=p.y-cameraY;
ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,ppy-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
ctx.restore();
// score
ctx.fillStyle='#333';ctx.font='bold 16px "Courier New",monospace';ctx.textAlign='left';ctx.fillText('SCORE: '+score,10,24);
if(bestScore>0){ctx.fillStyle='#888';ctx.font='12px "Courier New",monospace';ctx.fillText('BEST: '+bestScore,10,42);}
}

function drawTitle(dt){
var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#e8f5e9');grad.addColorStop(1,'#c8e6c9');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';ctx.fillStyle='#2e7d32';ctx.fillText('DOODLE JUMP',W/2,H*0.3);
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#66bb6a';ctx.fillText('JUMP HIGHER!',W/2,H*0.38);
if(bestScore>0){ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';ctx.fillStyle='#888';ctx.fillText('BEST: '+bestScore,W/2,H*0.44);}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(0,0,0,'+a*0.7+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.58);
ctx.fillStyle='#666';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right or A/D to move',W/2,H*0.68);
// draw sample platforms
ctx.fillStyle='#44aa44';ctx.fillRect(W/2-30,H*0.78,60,12);
ctx.fillStyle='#4488ff';ctx.fillRect(W/2+50,H*0.73,60,12);
ctx.fillStyle='#aa6633';ctx.fillRect(W/2-90,H*0.76,60,12);
// draw doodler
ctx.fillStyle='#66bb6a';ctx.beginPath();ctx.ellipse(W/2,H*0.78-20+Math.sin(titlePulse*2)*5,14,18,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(W/2+2,H*0.78-25+Math.sin(titlePulse*2)*5,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(W/2+4,H*0.78-25+Math.sin(titlePulse*2)*5,2.5,0,Math.PI*2);ctx.fill();
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(255,255,255,0.85)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#d32f2f';ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.fillStyle='#333';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#888';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillText('BEST: '+bestScore,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(0,0,0,'+a*0.6+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='BEST '+bestScore;
document.getElementById('hud-time').textContent='';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

window.initDoodleJump=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.stopDoodleJump=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyLeft=keyRight=false;};
})();
