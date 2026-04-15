// Simon Says — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,bestScore=0,gameTime=0,titlePulse=0;
var sequence=[],playerIdx=0,showingIdx=0,showTimer=0,showPhase='idle';
var flash=-1,flashTimer=0;
var COLORS=['#ff3333','#33cc33','#3333ff','#ffcc00'];
var LIGHT_COLORS=['#ff8888','#88ff88','#8888ff','#ffee88'];
var DARK_COLORS=['#aa1111','#118811','#1111aa','#aa8800'];
var PAD_NAMES=['RED (1/Q)','GREEN (2/W)','BLUE (3/E)','YELLOW (4/R)'];
var SHOW_SPEED=0.6,PAUSE_SPEED=0.3;

function diffMult(){var lvl=sequence.length;return lvl<=3?0.7:(lvl<=7?1.0:1.0+(lvl-7)*0.1);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function padLayout(){
var cx=W/2,cy=H*0.42,rad=Math.min(W,H)*0.3;
return[
{x:cx-rad*0.55,y:cy-rad*0.55,w:rad*0.9,h:rad*0.9,color:0},// top-left red
{x:cx+rad*0.55-rad*0.9,y:cy-rad*0.55,w:rad*0.9,h:rad*0.9,color:1},// top-right — wait that's wrong
];
// Better: 4 quadrants
}

function getPads(){
var cx=W/2,cy=H*0.44,s=Math.min(W,H*0.7)*0.38,gap=6;
return[
{x:cx-s-gap/2,y:cy-s-gap/2,w:s,h:s,ci:0},// top-left RED
{x:cx+gap/2,y:cy-s-gap/2,w:s,h:s,ci:1},  // top-right GREEN
{x:cx-s-gap/2,y:cy+gap/2,w:s,h:s,ci:2},  // bottom-left BLUE
{x:cx+gap/2,y:cy+gap/2,w:s,h:s,ci:3}     // bottom-right YELLOW
];}

function resetGame(){
sequence=[];playerIdx=0;score=0;gameTime=0;
addToSequence();showPhase='showing';showingIdx=0;showTimer=0;
gameState='playing';}

function addToSequence(){
sequence.push(Math.floor(Math.random()*4));
showPhase='showing';showingIdx=0;showTimer=0;playerIdx=0;}

function playerPress(ci){
if(gameState!=='playing'||showPhase!=='input')return;
flash=ci;flashTimer=0.25;
if(ci===sequence[playerIdx]){
playerIdx++;
if(playerIdx>=sequence.length){
score=sequence.length;if(score>bestScore)bestScore=score;
addToSequence();}
}else{
gameState='gameover';if(score>bestScore)bestScore=score;}}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(flashTimer>0)flashTimer-=dt;else flash=-1;
if(showPhase==='showing'){
showTimer+=dt;
var dm=diffMult();
var curShowSpeed=Math.max(0.25,SHOW_SPEED/dm);
var curPauseSpeed=Math.max(0.12,PAUSE_SPEED/dm);
var total=curShowSpeed+curPauseSpeed;
if(showTimer<curShowSpeed){flash=sequence[showingIdx];}
else if(showTimer<total){flash=-1;}
else{showTimer=0;showingIdx++;
if(showingIdx>=sequence.length){showPhase='input';flash=-1;}}}}

function drawPad(p,lit){
ctx.save();
// pad shadow
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.roundRect(p.x+3,p.y+3,p.w,p.h,16);ctx.fill();
// main pad with gradient
var padG=ctx.createLinearGradient(p.x,p.y,p.x+p.w,p.y+p.h);
if(lit){padG.addColorStop(0,LIGHT_COLORS[p.ci]);padG.addColorStop(1,COLORS[p.ci]);}
else{padG.addColorStop(0,COLORS[p.ci]);padG.addColorStop(1,DARK_COLORS[p.ci]);}
ctx.fillStyle=padG;
ctx.shadowColor=lit?LIGHT_COLORS[p.ci]:'transparent';
ctx.shadowBlur=lit?35:0;
ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,p.h,16);ctx.fill();
ctx.shadowBlur=0;
// top-left highlight for 3D effect
ctx.fillStyle=lit?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.12)';
ctx.beginPath();ctx.roundRect(p.x+4,p.y+4,p.w*0.35,p.h*0.35,12);ctx.fill();
// bottom-right shadow for depth
ctx.fillStyle='rgba(0,0,0,0.15)';
ctx.beginPath();ctx.roundRect(p.x+p.w*0.6,p.y+p.h*0.6,p.w*0.36,p.h*0.36,12);ctx.fill();
// dark border
ctx.strokeStyle=DARK_COLORS[p.ci];ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,p.h,16);ctx.stroke();
// inner glow ring when lit
if(lit){ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(p.x+6,p.y+6,p.w-12,p.h-12,12);ctx.stroke();}
ctx.restore();}

function render(){
var bgG=ctx.createRadialGradient(W/2,H*0.44,50,W/2,H*0.44,H*0.8);bgG.addColorStop(0,'#222244');bgG.addColorStop(1,'#1a1a2e');
ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
var pads=getPads();
for(var i=0;i<4;i++)drawPad(pads[i],flash===i);
// center circle
var cx=W/2,cy=H*0.44;
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*0.08,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#888';ctx.font='bold '+Math.round(Math.min(W,H)*0.05)+'px "Courier New",monospace';
ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(score,cx,cy);
// phase indicator
ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
ctx.fillText(showPhase==='showing'?'WATCH...':'YOUR TURN',W/2,H*0.82);
// key hints
ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';ctx.fillStyle='#555';
ctx.fillText('Keys: 1/Q=Red  2/W=Green  3/E=Blue  4/R=Yellow',W/2,H*0.88);}

function drawTitle(dt){
ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// draw demo pads
var pads=getPads();
var demoFlash=Math.floor(titlePulse*1.5)%4;
for(var i=0;i<4;i++)drawPad(pads[i],i===demoFlash);
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('SIMON',W/2,H*0.12);ctx.shadowBlur=0;
if(bestScore>0){ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';ctx.fillText('BEST: '+bestScore,W/2,H*0.19);}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.93);ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('WRONG!',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Sequence length: '+sequence.length,W/2,H*0.52);
if(bestScore>0){ctx.fillText('Best: '+bestScore,W/2,H*0.58);}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('TAP OR PRESS ENTER TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='BEST '+bestScore;
document.getElementById('hud-time').textContent=showPhase==='showing'?'WATCH':'GO';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function hitTest(mx,my){
var pads=getPads();
for(var i=0;i<4;i++){var p=pads[i];if(mx>=p.x&&mx<=p.x+p.w&&my>=p.y&&my<=p.y+p.h)return i;}
return-1;}

function onKey(e,down){
if(!down)return;
if((e.key==='1'||e.key==='q'||e.key==='Q')&&gameState==='playing')playerPress(0);
if((e.key==='2'||e.key==='w'||e.key==='W')&&gameState==='playing')playerPress(1);
if((e.key==='3'||e.key==='e'||e.key==='E')&&gameState==='playing')playerPress(2);
if((e.key==='4'||e.key==='r'||e.key==='R')&&gameState==='playing')playerPress(3);
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

window.initSimon=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
canvas.addEventListener('click',function(e){
if(gameState!=='playing'){resetGame();return;}
var r=canvas.getBoundingClientRect();var ci=hitTest(e.clientX-r.left,e.clientY-r.top);
if(ci>=0)playerPress(ci);});
canvas.addEventListener('touchstart',function(e){
e.preventDefault();
if(gameState!=='playing'){resetGame();return;}
var r=canvas.getBoundingClientRect();var t=e.touches[0];var ci=hitTest(t.clientX-r.left,t.clientY-r.top);
if(ci>=0)playerPress(ci);});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopSimon=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
window.removeEventListener('resize',resize);
gameState='title';};
})();
