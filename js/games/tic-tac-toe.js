// Tic-Tac-Toe — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var board,turn,winner,winLine,hoverCell,moveAnim,wins=0,losses=0,draws=0;
var particles=[];

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function gs(){return Math.min(W*0.8,H*0.65)/3;} // grid cell size
function go(){var s=gs();return{x:(W-s*3)/2,y:(H-s*3)/2+10};} // grid origin

function resetGame(){
board=[0,0,0,0,0,0,0,0,0];turn=1;winner=0;winLine=null;hoverCell=-1;moveAnim=null;particles=[];
gameState='playing';}

function place(idx){
if(gameState!=='playing'||board[idx]!==0||winner||turn!==1)return;
board[idx]=1;moveAnim={idx:idx,t:0,player:1};
checkWin();
if(!winner&&board.indexOf(0)>=0){turn=2;setTimeout(aiMove,300);}
else if(!winner&&board.indexOf(0)<0){winner=3;draws++;}}

function aiMove(){
if(winner||gameState!=='playing')return;
// AI: beatable — tries to win, then block, then picks random (but sometimes misses blocks)
var best=-1;
// Try to win
for(var i=0;i<9;i++){if(board[i]!==0)continue;board[i]=2;if(checkFour(2)){best=i;}board[i]=0;if(best>=0)break;}
// Block (80% chance — easy mode, sometimes misses)
if(best<0&&Math.random()<0.8){for(var i=0;i<9;i++){if(board[i]!==0)continue;board[i]=1;if(checkFour(1)){best=i;}board[i]=0;if(best>=0)break;}}
// Center
if(best<0&&board[4]===0)best=4;
// Random corner or edge
if(best<0){var opts=[];for(var i=0;i<9;i++)if(board[i]===0)opts.push(i);best=opts[Math.floor(Math.random()*opts.length)];}
if(best>=0){board[best]=2;moveAnim={idx:best,t:0,player:2};checkWin();}
if(!winner&&board.indexOf(0)<0){winner=3;draws++;}
turn=1;}

function checkFour(p){
var wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
for(var i=0;i<wins.length;i++){if(board[wins[i][0]]===p&&board[wins[i][1]]===p&&board[wins[i][2]]===p)return true;}
return false;}

function checkWin(){
var lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
for(var p=1;p<=2;p++){for(var i=0;i<lines.length;i++){
if(board[lines[i][0]]===p&&board[lines[i][1]]===p&&board[lines[i][2]]===p){
winner=p;winLine=lines[i];
if(p===1)wins++;else losses++;
var s=gs(),o=go();
for(var j=0;j<3;j++){var idx=lines[i][j];var r=Math.floor(idx/3),c=idx%3;
addParticles(o.x+c*s+s/2,o.y+r*s+s/2,p===1?'#00ccff':'#ff6644',8);}
return;}}}}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250,life:0.8+Math.random()*0.5,color:c,size:2+Math.random()*4});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(moveAnim){moveAnim.t+=dt*5;if(moveAnim.t>=1)moveAnim=null;}
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}}

function drawX(cx,cy,s,alpha){
ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#00ccff';ctx.lineWidth=Math.max(3,s*0.1);ctx.lineCap='round';
ctx.shadowColor='#00ccff';ctx.shadowBlur=8;
var d=s*0.3;ctx.beginPath();ctx.moveTo(cx-d,cy-d);ctx.lineTo(cx+d,cy+d);ctx.stroke();
ctx.beginPath();ctx.moveTo(cx+d,cy-d);ctx.lineTo(cx-d,cy+d);ctx.stroke();
ctx.shadowBlur=0;ctx.restore();}

function drawO(cx,cy,s,alpha){
ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#ff6644';ctx.lineWidth=Math.max(3,s*0.1);
ctx.shadowColor='#ff6644';ctx.shadowBlur=8;
ctx.beginPath();ctx.arc(cx,cy,s*0.3,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;ctx.restore();}

function render(){
ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
var s=gs(),o=go();
// grid lines
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=3;ctx.lineCap='round';
for(var i=1;i<3;i++){ctx.beginPath();ctx.moveTo(o.x+i*s,o.y);ctx.lineTo(o.x+i*s,o.y+3*s);ctx.stroke();
ctx.beginPath();ctx.moveTo(o.x,o.y+i*s);ctx.lineTo(o.x+3*s,o.y+i*s);ctx.stroke();}
// pieces
for(var i=0;i<9;i++){if(board[i]===0)continue;
var r=Math.floor(i/3),c=i%3,cx=o.x+c*s+s/2,cy=o.y+r*s+s/2;
var al=(moveAnim&&moveAnim.idx===i)?Math.min(1,moveAnim.t):1;
if(board[i]===1)drawX(cx,cy,s,al);else drawO(cx,cy,s,al);}
// hover
if(hoverCell>=0&&board[hoverCell]===0&&!winner&&turn===1){
var r=Math.floor(hoverCell/3),c=hoverCell%3;
ctx.fillStyle='rgba(0,200,255,0.1)';ctx.fillRect(o.x+c*s+2,o.y+r*s+2,s-4,s-4);}
// win line
if(winLine){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.shadowColor='#fff';ctx.shadowBlur=15;ctx.lineCap='round';
var r0=Math.floor(winLine[0]/3),c0=winLine[0]%3,r2=Math.floor(winLine[2]/3),c2=winLine[2]%3;
ctx.beginPath();ctx.moveTo(o.x+c0*s+s/2,o.y+r0*s+s/2);ctx.lineTo(o.x+c2*s+s/2,o.y+r2*s+s/2);ctx.stroke();
ctx.shadowBlur=0;}
// status
ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
if(winner===1){ctx.fillStyle='#00ccff';ctx.fillText('YOU WIN!',W/2,o.y-15);}
else if(winner===2){ctx.fillStyle='#ff6644';ctx.fillText('AI WINS!',W/2,o.y-15);}
else if(winner===3){ctx.fillStyle='#aaa';ctx.fillText('DRAW!',W/2,o.y-15);}
else{ctx.fillStyle=turn===1?'#00ccff':'#ff6644';ctx.fillText(turn===1?'YOUR TURN (X)':'AI THINKING...',W/2,o.y-15);}
// score bar
ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';ctx.fillStyle='#666';
ctx.fillText('W:'+wins+' L:'+losses+' D:'+draws,W/2,o.y+3*s+25);
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// restart hint
if(winner){var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.fillText('TAP OR PRESS ENTER TO PLAY AGAIN',W/2,H-15);}}

function drawTitle(dt){
ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#00ccff';ctx.fillText('TIC-TAC',W/2,H*0.25);
ctx.fillStyle='#ff6644';ctx.fillText('TOE',W/2,H*0.36);ctx.shadowBlur=0;
// demo grid
var s=Math.min(W*0.1,35),ox=W/2-s*1.5,oy=H*0.45;
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;
for(var i=1;i<3;i++){ctx.beginPath();ctx.moveTo(ox+i*s,oy);ctx.lineTo(ox+i*s,oy+3*s);ctx.stroke();
ctx.beginPath();ctx.moveTo(ox,oy+i*s);ctx.lineTo(ox+3*s,oy+i*s);ctx.stroke();}
drawX(ox+s/2,oy+s/2,s,1);drawO(ox+s*2.5,oy+s/2,s,1);drawX(ox+s*1.5,oy+s*1.5,s,1);
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';ctx.fillText('You are X, AI is O',W/2,H*0.72);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent='W:'+wins+' L:'+losses;
document.getElementById('hud-speed').textContent=winner?['','YOU WIN','AI WINS','DRAW'][winner]:(turn===1?'YOUR TURN':'AI');
document.getElementById('hud-time').textContent='D:'+draws;}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
animId=requestAnimationFrame(gameLoop);}

function getCellAt(mx,my){var s=gs(),o=go();var c=Math.floor((mx-o.x)/s),r=Math.floor((my-o.y)/s);
if(r>=0&&r<3&&c>=0&&c<3)return r*3+c;return-1;}

function onClick(e){
var r=canvas.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;
if(gameState!=='playing'){resetGame();return;}
if(winner){resetGame();return;}
var idx=getCellAt(mx,my);if(idx>=0)place(idx);}

function onMove(e){var r=canvas.getBoundingClientRect();hoverCell=getCellAt(e.clientX-r.left,e.clientY-r.top);}

function onKey(e,down){if(!down)return;
if((e.key==='Enter'||e.key==='Tab')&&(gameState!=='playing'||winner))resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

window.initTicTacToe=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
canvas.addEventListener('click',onClick);
canvas.addEventListener('mousemove',onMove);
canvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];var r=canvas.getBoundingClientRect();
if(gameState!=='playing'||winner){resetGame();return;}
var idx=getCellAt(t.clientX-r.left,t.clientY-r.top);if(idx>=0)place(idx);});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopTicTacToe=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
canvas.removeEventListener('click',onClick);
canvas.removeEventListener('mousemove',onMove);
gameState='title';};
})();
