// Tetris — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,linesCleared=0,level=1,gameTime=0,titlePulse=0;
var COLS=10,ROWS=20,cs,grid=[],piece,nextPiece,dropTimer=0,dropInterval=0.8;
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
var particles=[];

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
if(cleared>0){var pts=[0,100,300,500,800];score+=pts[Math.min(cleared,4)]*level;linesCleared+=cleared;level=Math.floor(linesCleared/10)+1;dropInterval=Math.max(0.1,0.8-level*0.04);}}

function resetGame(){initGrid();score=0;linesCleared=0;level=1;gameTime=0;dropTimer=0;dropInterval=0.8;particles=[];
piece=randomPiece();nextPiece=randomPiece();gameState='playing';}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// soft drop
dropTimer+=keyDown?dt*10:dt;
if(dropTimer>=dropInterval){dropTimer=0;
if(valid(piece.shape,piece.x,piece.y+1))piece.y++;
else{lock();clearLines();piece=nextPiece;nextPiece=randomPiece();if(!valid(piece.shape,piece.x,piece.y))gameState='gameover';}}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
var ox=(W-COLS*cs)/2,oy=0;
// grid border
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.strokeRect(ox-1,oy-1,COLS*cs+2,ROWS*cs+2);
// grid lines
ctx.strokeStyle='rgba(255,255,255,0.04)';for(var x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(ox+x*cs,oy);ctx.lineTo(ox+x*cs,oy+ROWS*cs);ctx.stroke();}
for(var y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(ox,oy+y*cs);ctx.lineTo(ox+COLS*cs,oy+y*cs);ctx.stroke();}
// placed blocks
for(var y=0;y<ROWS;y++)for(var x=0;x<COLS;x++){if(!grid[y][x])continue;
ctx.fillStyle=grid[y][x];ctx.fillRect(ox+x*cs+1,oy+y*cs+1,cs-2,cs-2);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(ox+x*cs+1,oy+y*cs+1,cs-2,3);}
// ghost piece
var gy=piece.y;while(valid(piece.shape,piece.x,gy+1))gy++;
if(gy!==piece.y){ctx.globalAlpha=0.2;for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;ctx.fillStyle=piece.color;ctx.fillRect(ox+(piece.x+c)*cs+1,oy+(gy+r)*cs+1,cs-2,cs-2);}ctx.globalAlpha=1;}
// current piece
for(var r=0;r<piece.shape.length;r++)for(var c=0;c<piece.shape[r].length;c++){if(!piece.shape[r][c])continue;
ctx.fillStyle=piece.color;ctx.shadowColor=piece.color;ctx.shadowBlur=4;ctx.fillRect(ox+(piece.x+c)*cs+1,oy+(piece.y+r)*cs+1,cs-2,cs-2);ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(ox+(piece.x+c)*cs+1,oy+(piece.y+r)*cs+1,cs-2,3);}
// next piece preview
ctx.fillStyle='rgba(255,255,255,0.08)';ctx.font='11px "Courier New",monospace';ctx.textAlign='left';ctx.fillText('NEXT',ox+COLS*cs+15,20);
for(var r=0;r<nextPiece.shape.length;r++)for(var c=0;c<nextPiece.shape[r].length;c++){if(!nextPiece.shape[r][c])continue;
ctx.fillStyle=nextPiece.color;ctx.fillRect(ox+COLS*cs+15+c*14,28+r*14,12,12);}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
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
