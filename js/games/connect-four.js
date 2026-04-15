// Connect Four — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=7,ROWS=6,board,turn,winner,winCells,hoverCol,dropAnim,aiThinking;
var particles=[],gamesPlayed=0;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W-40)/COLS,(H-80)/ROWS);}

function boardOrigin(){var cs=cellSize();return{x:(W-cs*COLS)/2,y:(H-cs*ROWS)/2+20};}

function resetGame(){
board=[];for(var r=0;r<ROWS;r++){board[r]=[];for(var c=0;c<COLS;c++)board[r][c]=0;}
turn=1;winner=0;winCells=null;hoverCol=-1;dropAnim=null;aiThinking=false;particles=[];gamesPlayed++;
gameState='playing';}

function getRow(col){for(var r=ROWS-1;r>=0;r--)if(board[r][col]===0)return r;return-1;}

function drop(col){
if(winner||turn!==1)return;
var row=getRow(col);if(row<0)return;
board[row][col]=1;
dropAnim={col:col,row:row,player:1,y:0,targetY:row,done:false};
turn=2;
checkWin(1,row,col);
if(!winner){aiThinking=true;setTimeout(aiMove,400);}}

function aiMove(){
if(winner||gameState!=='playing'){aiThinking=false;return;}
// AI difficulty scales with games played
var aiLevel=Math.min(gamesPlayed,8);
var blockChance=aiLevel<=2?0.6:(aiLevel<=5?0.85:0.95);
var best=-1;
// Try to win (always)
for(var c=0;c<COLS;c++){var r=getRow(c);if(r<0)continue;board[r][c]=2;if(checkFour(2))best=c;board[r][c]=0;if(best>=0)break;}
// Block player win (probability based on difficulty)
if(best<0&&Math.random()<blockChance){for(var c=0;c<COLS;c++){var r=getRow(c);if(r<0)continue;board[r][c]=1;if(checkFour(1))best=c;board[r][c]=0;if(best>=0)break;}}
// Center preference with random — smarter AI narrows pool
if(best<0){var options=[];for(var c=0;c<COLS;c++)if(getRow(c)>=0)options.push(c);
// Prefer center columns
options.sort(function(a,b){return Math.abs(a-3)-Math.abs(b-3);});
// Easier AI picks from wider pool
var poolSize=aiLevel<=2?Math.min(5,options.length):Math.min(3,options.length);
var pool=options.slice(0,poolSize);
best=pool[Math.floor(Math.random()*pool.length)];}
if(best<0){aiThinking=false;return;}
var row=getRow(best);if(row<0){aiThinking=false;return;}
board[row][best]=2;
dropAnim={col:best,row:row,player:2,y:0,targetY:row,done:false};
checkWin(2,row,best);
turn=1;aiThinking=false;
// Check draw
if(!winner){var full=true;for(var c=0;c<COLS;c++)if(getRow(c)>=0)full=false;
if(full){winner=3;}}} // draw

function checkFour(p){
for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
if(c+3<COLS&&board[r][c]===p&&board[r][c+1]===p&&board[r][c+2]===p&&board[r][c+3]===p)return true;
if(r+3<ROWS&&board[r][c]===p&&board[r+1][c]===p&&board[r+2][c]===p&&board[r+3][c]===p)return true;
if(r+3<ROWS&&c+3<COLS&&board[r][c]===p&&board[r+1][c+1]===p&&board[r+2][c+2]===p&&board[r+3][c+3]===p)return true;
if(r+3<ROWS&&c-3>=0&&board[r][c]===p&&board[r+1][c-1]===p&&board[r+2][c-2]===p&&board[r+3][c-3]===p)return true;}
return false;}

function findWinCells(p){
for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
var dirs=[[0,1],[1,0],[1,1],[1,-1]];
for(var d=0;d<dirs.length;d++){var cells=[];var ok=true;
for(var k=0;k<4;k++){var rr=r+dirs[d][0]*k,cc=c+dirs[d][1]*k;
if(rr<0||rr>=ROWS||cc<0||cc>=COLS||board[rr][cc]!==p){ok=false;break;}
cells.push({r:rr,c:cc});}
if(ok)return cells;}}return null;}

function checkWin(p,row,col){
if(checkFour(p)){winner=p;winCells=findWinCells(p);
var cs=cellSize(),o=boardOrigin();
for(var i=0;i<(winCells?winCells.length:0);i++){
var wc=winCells[i];addParticles(o.x+wc.c*cs+cs/2,o.y+wc.r*cs+cs/2,p===1?'#ff3333':'#ffcc00',8);}}}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.8+Math.random()*0.5,color:c,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// drop animation
if(dropAnim&&!dropAnim.done){dropAnim.y+=dt*15;if(dropAnim.y>=dropAnim.targetY){dropAnim.y=dropAnim.targetY;dropAnim.done=true;}}
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}}

function render(){
var bgG=ctx.createLinearGradient(0,0,0,H);bgG.addColorStop(0,'#1a1a3e');bgG.addColorStop(1,'#12122e');
ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
var cs=cellSize(),o=boardOrigin();
// board background with gradient
var boardG=ctx.createLinearGradient(o.x,o.y,o.x,o.y+cs*ROWS);boardG.addColorStop(0,'#0055cc');boardG.addColorStop(0.5,'#0044aa');boardG.addColorStop(1,'#003388');
ctx.fillStyle=boardG;ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=15;
ctx.beginPath();ctx.roundRect(o.x-8,o.y-8,cs*COLS+16,cs*ROWS+16,12);ctx.fill();ctx.shadowBlur=0;
// board border highlight
ctx.strokeStyle='rgba(100,150,255,0.3)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(o.x-8,o.y-8,cs*COLS+16,cs*ROWS+16,12);ctx.stroke();
// cells
for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
var cx=o.x+c*cs+cs/2,cy=o.y+r*cs+cs/2,rad=cs*0.4;
var val=board[r][c];
// Skip cell being animated
if(dropAnim&&!dropAnim.done&&dropAnim.col===c&&dropAnim.row===r)val=0;
// cell hole shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.arc(cx+1,cy+1,rad+1,0,Math.PI*2);ctx.fill();
if(val===0){ctx.fillStyle='#0a0a2e';ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();}
else{
var tg=ctx.createRadialGradient(cx-rad*0.25,cy-rad*0.25,rad*0.1,cx,cy,rad);
if(val===1){tg.addColorStop(0,'#ff6666');tg.addColorStop(0.7,'#ff3333');tg.addColorStop(1,'#cc1111');}
else{tg.addColorStop(0,'#ffee66');tg.addColorStop(0.7,'#ffcc00');tg.addColorStop(1,'#cc9900');}
ctx.fillStyle=tg;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();
// highlight
ctx.fillStyle=val===1?'rgba(255,200,200,0.4)':'rgba(255,255,200,0.4)';
ctx.beginPath();ctx.arc(cx-rad*0.2,cy-rad*0.25,rad*0.3,0,Math.PI*2);ctx.fill();
// bottom rim shadow
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.arc(cx,cy+rad*0.15,rad*0.85,0,Math.PI);ctx.fill();}}
// drop animation piece
if(dropAnim&&!dropAnim.done){
var ax=o.x+dropAnim.col*cs+cs/2,ay=o.y+dropAnim.y*cs+cs/2;
ctx.fillStyle=dropAnim.player===1?'#ff3333':'#ffcc00';
ctx.beginPath();ctx.arc(ax,ay,cs*0.4,0,Math.PI*2);ctx.fill();}
// hover indicator
if(hoverCol>=0&&!winner&&turn===1&&!aiThinking&&gameState==='playing'){
var hx=o.x+hoverCol*cs+cs/2;
ctx.fillStyle='rgba(255,50,50,0.5)';ctx.beginPath();ctx.arc(hx,o.y-cs*0.3,cs*0.3,0,Math.PI*2);ctx.fill();}
// win highlight
if(winCells){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.shadowColor='#fff';ctx.shadowBlur=10;
for(var i=0;i<winCells.length;i++){var wc=winCells[i];
ctx.beginPath();ctx.arc(o.x+wc.c*cs+cs/2,o.y+wc.r*cs+cs/2,cs*0.42,0,Math.PI*2);ctx.stroke();}
ctx.shadowBlur=0;}
// status text
ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
if(winner===1){ctx.fillStyle='#ff3333';ctx.fillText('YOU WIN!',W/2,o.y-20);}
else if(winner===2){ctx.fillStyle='#ffcc00';ctx.fillText('AI WINS!',W/2,o.y-20);}
else if(winner===3){ctx.fillStyle='#aaa';ctx.fillText('DRAW!',W/2,o.y-20);}
else if(aiThinking){ctx.fillStyle='#ffcc00';ctx.fillText('AI thinking...',W/2,o.y-20);}
else{ctx.fillStyle='#ff3333';ctx.fillText('YOUR TURN — Click a column',W/2,o.y-20);}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// restart hint after game ends
if(winner){var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.fillText('TAP OR PRESS ENTER TO PLAY AGAIN',W/2,H-20);}}

function drawTitle(dt){
ctx.fillStyle='#1a1a3e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff3333';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('CONNECT',W/2,H*0.22);
ctx.fillStyle='#ffcc00';ctx.fillText('FOUR',W/2,H*0.32);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';ctx.fillText('Drop discs to connect 4 in a row!',W/2,H*0.42);
ctx.fillText('You are RED, AI is YELLOW',W/2,H*0.48);
// demo board
var cs=Math.min(W*0.06,25),ox=W/2-cs*3.5,oy=H*0.55;
ctx.fillStyle='#0044aa';ctx.beginPath();ctx.roundRect(ox-4,oy-4,cs*7+8,cs*4+8,6);ctx.fill();
for(var r=0;r<4;r++)for(var c=0;c<7;c++){
ctx.fillStyle=(r===3&&c>=2&&c<=4)?((c-2)%2?'#ffcc00':'#ff3333'):'#0a0a2e';
ctx.beginPath();ctx.arc(ox+c*cs+cs/2,oy+r*cs+cs/2,cs*0.38,0,Math.PI*2);ctx.fill();}
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=winner===1?'WIN':winner===2?'LOSE':winner===3?'DRAW':'—';
document.getElementById('hud-speed').textContent=turn===1?'YOUR TURN':'AI TURN';
document.getElementById('hud-time').textContent='';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
animId=requestAnimationFrame(gameLoop);}

function getCol(mx){var cs=cellSize(),o=boardOrigin();var c=Math.floor((mx-o.x)/cs);return(c>=0&&c<COLS)?c:-1;}

function onClick(e){
var r=canvas.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;
if(gameState!=='playing'){resetGame();return;}
if(winner){resetGame();return;}
var col=getCol(mx);if(col>=0)drop(col);}

function onMove(e){
var r=canvas.getBoundingClientRect();hoverCol=getCol(e.clientX-r.left);}

function onKey(e,down){
if(!down)return;
if((e.key==='Enter'||e.key==='Tab')&&(gameState!=='playing'||winner))resetGame();
// Number keys 1-7 for columns
if(gameState==='playing'&&!winner&&turn===1){
var k=parseInt(e.key);if(k>=1&&k<=7)drop(k-1);}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

window.initConnectFour=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
canvas.addEventListener('click',onClick);
canvas.addEventListener('mousemove',onMove);
canvas.addEventListener('touchstart',function(e){e.preventDefault();
var t=e.touches[0];var r=canvas.getBoundingClientRect();
if(gameState!=='playing'||winner){resetGame();return;}
var col=getCol(t.clientX-r.left);if(col>=0)drop(col);});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopConnectFour=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
canvas.removeEventListener('click',onClick);
canvas.removeEventListener('mousemove',onMove);
window.removeEventListener('resize',resize);
gameState='title';};
})();
