// Tetris — Full Game (Enhanced Graphics + Difficulty Progression)
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,linesCleared=0,level=1,gameTime=0,titlePulse=0;
var COLS=10,ROWS=20,cs,grid=[],piece,nextPiece,dropTimer=0,dropInterval=0.6;
var keyLeft=false,keyRight=false,keyDown=false,moveTimer=0;
var SHAPES=[
[[1,1,1,1]],
[[1,1],[1,1]],
[[0,1,0],[1,1,1]],
[[1,0,0],[1,1,1]],
[[0,0,1],[1,1,1]],
[[0,1,1],[1,1,0]],
[[1,1,0],[0,1,1]]
];
var COLORS=['#00d4ff','#ffcc00','#aa44ff','#ff6600','#2266ff','#00cc44','#ff2244'];
var GLOW_COLORS=['#00eeff','#ffdd33','#cc66ff','#ff8833','#4488ff','#22ee66','#ff4466'];
var particles=[];
var lineClearFlash=0,levelFlash=0;

function diffMult(){return level<=2?0.8:(level<=5?1.0:1.0+(level-5)*0.08);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
cs=Math.floor(Math.min((W-60)/COLS,(H-20)/ROWS));}

function initGrid(){grid=[];for(var y=0;y<ROWS;y++){grid[y]=[];for(var x=0;x<COLS;x++)grid[y][x]=0;}}
function randomPiece(){var i=Math.floor(Math.random()*SHAPES.length);return{shape:SHAPES[i].map(function(r){return r.slice();}),color:COLORS[i],x:Math.floor(COLS/2)-1,y:0};}
function rotate(shape){var rows=shape.length,cols=shape[0].length,n=[];for(var c=0;c<cols;c++){n[c]=[];for(var r=rows-1;r>=0;r--)n[c].push(shape[r][c]);}return n;}
function valid(shape,px,py){for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++){if(!shape[r][c])continue;var nx=px+c,ny=py+r;if(nx<0||nx>=COLS||ny>=ROWS)return false;if(ny>=0&&grid[ny][nx])return false;}return true;}
function lock(){for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;var ny=piece.y+r;if(ny<0){gameState='gameover';return;}grid[ny][piece.x+c]=piece.color;}}
function clearLines(){var cleared=0;for(var y=ROWS-1;y>=0;y--){var full=true;for(var x=0;x<COLS;x++)if(!grid[y][x]){full=false;break;}
if(full){cleared++;var ox=(W-COLS*cs)/2;for(var x=0;x<COLS;x++){for(var i=0;i<4;i++)particles.push({x:ox+x*cs+cs/2,y:y*cs+cs/2,vx:(Math.random()-0.5)*200,vy:-100-Math.random()*150,life:0.5+Math.random()*0.3,color:grid[y][x],size:3+Math.random()*4});}
grid.splice(y,1);grid.unshift([]);for(var x=0;x<COLS;x++)grid[0][x]=0;y++;}}
if(cleared>0){var pts=[0,100,300,500,800];score+=pts[Math.min(cleared,4)]*level;linesCleared+=cleared;var oldLevel=level;level=Math.floor(linesCleared/10)+1;dropInterval=Math.max(0.1,0.6-level*0.05);lineClearFlash=0.5;if(level>oldLevel)levelFlash=1;}}


function resetGame(){initGrid();score=0;linesCleared=0;level=1;gameTime=0;dropTimer=0;dropInterval=0.6;particles=[];
piece=randomPiece();nextPiece=randomPiece();gameState='playing';}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
if(lineClearFlash>0)lineClearFlash-=dt*3;
if(levelFlash>0)levelFlash-=dt;
var dm=diffMult();
var di=dropInterval/dm;
// soft drop
dropTimer+=keyDown?dt*10:dt;
if(dropTimer>=di){dropTimer=0;
if(valid(piece.shape,piece.x,piece.y+1))piece.y++;
else{lock();clearLines();piece=nextPiece;nextPiece=randomPiece();if(!valid(piece.shape,piece.x,piece.y))gameState='gameover';}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawBlock(bx,by,color,glowColor){
ctx.save();
// 3D effect block
ctx.fillStyle=color;
ctx.shadowColor=glowColor||color;ctx.shadowBlur=3;
ctx.fillRect(bx+1,by+1,cs-2,cs-2);ctx.shadowBlur=0;
// top highlight
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(bx+1,by+1,cs-2,3);
// left highlight
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(bx+1,by+1,2,cs-2);
// bottom shadow
ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(bx+1,by+cs-4,cs-2,3);
// right shadow
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(bx+cs-3,by+1,2,cs-2);
// inner shine
ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(bx+4,by+5,cs-8,cs-10);
ctx.restore();}

function render(){
// Background gradient
var bgG=ctx.createLinearGradient(0,0,0,H);
bgG.addColorStop(0,'#060618');bgG.addColorStop(0.5,'#0a0a28');bgG.addColorStop(1,'#080820');
ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
var ox=(W-COLS*cs)/2,oy=0;
// Background grid glow
ctx.strokeStyle='rgba(50,50,100,0.15)';ctx.lineWidth=1;
for(var x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(ox+x*cs,oy);ctx.lineTo(ox+x*cs,oy+ROWS*cs);ctx.stroke();}
for(var y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(ox,oy+y*cs);ctx.lineTo(ox+COLS*cs,oy+y*cs);ctx.stroke();}
// grid border with glow
ctx.strokeStyle='rgba(100,100,200,0.3)';ctx.lineWidth=2;ctx.shadowColor='rgba(100,100,255,0.3)';ctx.shadowBlur=8;
ctx.strokeRect(ox-2,oy-2,COLS*cs+4,ROWS*cs+4);ctx.shadowBlur=0;
// placed blocks with 3D effect
for(var y=0;y<ROWS;y++)for(var x=0;x<COLS;x++){if(!grid[y][x])continue;
drawBlock(ox+x*cs,oy+y*cs,grid[y][x]);}
// ghost piece with dashed outline
var gy=piece.y;while(valid(piece.shape,piece.x,gy+1))gy++;
if(gy!==piece.y){
ctx.globalAlpha=0.15;
for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;
ctx.fillStyle=piece.color;ctx.fillRect(ox+(piece.x+c)*cs+1,oy+(gy+r)*cs+1,cs-2,cs-2);}
ctx.globalAlpha=0.4;ctx.strokeStyle=piece.color;ctx.lineWidth=1;ctx.setLineDash([3,3]);
for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;
ctx.strokeRect(ox+(piece.x+c)*cs+1,oy+(gy+r)*cs+1,cs-2,cs-2);}
ctx.setLineDash([]);ctx.globalAlpha=1;}
// current piece with glow
var ci=COLORS.indexOf(piece.color);
var gc=ci>=0?GLOW_COLORS[ci]:piece.color;
for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;
drawBlock(ox+(piece.x+c)*cs,oy+(piece.y+r)*cs,piece.color,gc);}
// next piece preview - styled box
var npx=ox+COLS*cs+12,npy=8;
ctx.fillStyle='rgba(255,255,255,0.05)';ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
ctx.fillRect(npx-4,npy-4,80,70);ctx.strokeRect(npx-4,npy-4,80,70);
ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 11px "Courier New",monospace';ctx.textAlign='left';ctx.fillText('NEXT',npx+2,npy+10);
for(var r=0;r<nextPiece.shape.length;r++)for(var c=0;c<nextPiece.shape[r].length;c++){if(!nextPiece.shape[r][c])continue;
ctx.fillStyle=nextPiece.color;ctx.shadowColor=nextPiece.color;ctx.shadowBlur=3;
ctx.fillRect(npx+c*14+5,npy+18+r*14,12,12);ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(npx+c*14+5,npy+18+r*14,12,2);}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
// line clear flash
if(lineClearFlash>0){ctx.fillStyle='rgba(255,255,255,'+lineClearFlash*0.5+')';ctx.fillRect(ox,0,COLS*cs,ROWS*cs);}
// vignette
var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,0.3)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#00d4ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#00d4ff';ctx.fillText('TETRIS',W/2,H*0.3);ctx.shadowBlur=0;
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.5);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right to move, Up to rotate, Down for soft drop',W/2,H*0.6);
// sample blocks
var bx=W/2-70,by=H*0.7;
for(var i=0;i<7;i++){ctx.fillStyle=COLORS[i];ctx.fillRect(bx+i*22,by,18,18);}
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Lines: '+linesCleared+'  Level: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=linesCleared+' lines';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(down&&gameState==='playing'){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){if(valid(piece.shape,piece.x-1,piece.y))piece.x--;}
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){if(valid(piece.shape,piece.x+1,piece.y))piece.x++;}
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){var rot=rotate(piece.shape);if(valid(rot,piece.x,piece.y))piece.shape=rot;}
}
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',function(){fn();});}

window.initTetris=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(){if(gameState==='playing'&&valid(piece.shape,piece.x-1,piece.y))piece.x--;});
bindMobile('btn-right',function(){if(gameState==='playing'&&valid(piece.shape,piece.x+1,piece.y))piece.x++;});
bindMobile('btn-up',function(){if(gameState==='playing'){var rot=rotate(piece.shape);if(valid(rot,piece.x,piece.y))piece.shape=rot;}});
bindMobile('btn-down',function(){if(gameState==='playing')keyDown=true;setTimeout(function(){keyDown=false;},200);});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopTetris=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
gameState='title';keyDown=false;};
})();
