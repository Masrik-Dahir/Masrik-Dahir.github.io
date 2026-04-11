// Pac-Man — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var pac,ghosts=[],dots=[],powerDots=[],particles=[];
var cs,COLS=21,ROWS=23,nextDir={x:0,y:0};
var GHOST_COLORS=['#ff0000','#ffb8ff','#00ffff','#ffb852'];
var frightenTimer=0,FRIGHTEN_TIME=10;
// Classic-inspired maze (1=wall, 0=path, 2=ghost house)
var MAP=[
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
[1,1,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,1,1],
[1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,1,2,2,2,1,1,0,1,0,1,1,1,1],
[0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,0,0,0],
[1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
[1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
var ACTUAL_ROWS=MAP.length;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
cs=Math.floor(Math.min(W/COLS,(H-30)/ACTUAL_ROWS));}

function isWall(gx,gy){if(gx<0||gx>=COLS||gy<0||gy>=ACTUAL_ROWS)return gx<0||gx>=COLS;return MAP[gy][gx]===1;}

function placeDots(){
dots=[];powerDots=[];
for(var y=0;y<ACTUAL_ROWS;y++)for(var x=0;x<COLS;x++){
if(MAP[y][x]!==0)continue;
if((x===1&&y===3)||(x===COLS-2&&y===3)||(x===1&&y===15)||(x===COLS-2&&y===15))powerDots.push({x:x,y:y,eaten:false});
else dots.push({x:x,y:y,eaten:false});}}

function resetGhosts(){
ghosts=[];
var starts=[{x:10,y:9},{x:9,y:9},{x:11,y:9},{x:10,y:8}];
for(var i=0;i<4;i++){ghosts.push({x:starts[i].x,y:starts[i].y,tx:starts[i].x,ty:starts[i].y,
dir:{x:0,y:-1},color:GHOST_COLORS[i],scared:false,eaten:false,speed:1.4+level*0.1,moveTimer:0});}}

function resetGame(){
cs=Math.floor(Math.min(W/COLS,(H-30)/ACTUAL_ROWS));
pac={x:10,y:15,tx:10,ty:15,dir:{x:0,y:0},mouth:0,mouthDir:1,speed:3.5,moveTimer:0};
nextDir={x:0,y:0};score=0;lives=5;level=1;gameTime=0;frightenTimer=0;particles=[];
placeDots();resetGhosts();gameState='playing';}

function addParticles(x,y,c,n){var ox=(W-COLS*cs)/2;for(var i=0;i<n;i++)particles.push({x:ox+x*cs+cs/2,y:y*cs+cs/2,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,life:0.4+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function tryMove(entity,dir){
var nx=entity.tx+dir.x,ny=entity.ty+dir.y;
// tunnel wrap
if(nx<0)nx=COLS-1;if(nx>=COLS)nx=0;
if(!isWall(nx,ny)){entity.tx=nx;entity.ty=ny;entity.dir=dir;return true;}
return false;}

function inGhostHouse(gx,gy){return gy>=8&&gy<=9&&gx>=8&&gx<=12;}

function ghostAI(g,idx){
var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
var rev={x:-g.dir.x,y:-g.dir.y};
var best=null,bestDist=g.scared?-1:Infinity;
// If inside ghost house, target the exit (col 10, row 7)
var tx,ty;
if(inGhostHouse(g.tx,g.ty)){tx=10;ty=7;}
else{
tx=pac.tx;ty=pac.ty;
if(idx===1){tx=pac.tx+pac.dir.x*4;ty=pac.ty+pac.dir.y*4;}
else if(idx===2&&ghosts[0]){tx=pac.tx+(pac.tx-ghosts[0].tx);ty=pac.ty+(pac.ty-ghosts[0].ty);}
else if(idx===3){var d=Math.abs(pac.tx-g.tx)+Math.abs(pac.ty-g.ty);if(d<8){tx=1;ty=ACTUAL_ROWS-2;}}
}
if(g.scared&&!inGhostHouse(g.tx,g.ty)){tx=Math.floor(Math.random()*COLS);ty=Math.floor(Math.random()*ACTUAL_ROWS);}
for(var i=0;i<dirs.length;i++){var d=dirs[i];
if(d.x===rev.x&&d.y===rev.y)continue;
var nx=g.tx+d.x,ny=g.ty+d.y;
if(nx<0)nx=COLS-1;if(nx>=COLS)nx=0;
if(isWall(nx,ny))continue;
var dist=(nx-tx)*(nx-tx)+(ny-ty)*(ny-ty);
if(g.scared&&!inGhostHouse(g.tx,g.ty)?dist>bestDist:dist<bestDist){bestDist=dist;best=d;}}
// If stuck (no valid non-reverse move), allow reverse
if(!best){var nx=g.tx+rev.x,ny=g.ty+rev.y;
if(nx<0)nx=COLS-1;if(nx>=COLS)nx=0;
if(!isWall(nx,ny))best=rev;}
if(best){g.tx=g.tx+best.x;g.ty=g.ty+best.y;if(g.tx<0)g.tx=COLS-1;if(g.tx>=COLS)g.tx=0;g.dir=best;}}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
pac.mouth+=pac.mouthDir*dt*12;if(pac.mouth>0.4||pac.mouth<0)pac.mouthDir*=-1;
// frighten timer
if(frightenTimer>0){frightenTimer-=dt;if(frightenTimer<=0){for(var i=0;i<ghosts.length;i++)ghosts[i].scared=false;}}
// pac movement
pac.moveTimer+=dt;
var pacInterval=1/pac.speed;
if(pac.moveTimer>=pacInterval){pac.moveTimer=0;
if(nextDir.x!==0||nextDir.y!==0){if(!tryMove(pac,nextDir)){tryMove(pac,pac.dir);}}
else tryMove(pac,pac.dir);}
pac.x+=(pac.tx-pac.x)*Math.min(1,dt*15);pac.y+=(pac.ty-pac.y)*Math.min(1,dt*15);
// eat dots
for(var i=0;i<dots.length;i++){if(!dots[i].eaten&&dots[i].x===pac.tx&&dots[i].y===pac.ty){dots[i].eaten=true;score+=10;}}
for(var i=0;i<powerDots.length;i++){if(!powerDots[i].eaten&&powerDots[i].x===pac.tx&&powerDots[i].y===pac.ty){
powerDots[i].eaten=true;score+=50;frightenTimer=FRIGHTEN_TIME;
for(var g=0;g<ghosts.length;g++){ghosts[g].scared=true;ghosts[g].eaten=false;}}}
// ghost movement
for(var i=0;i<ghosts.length;i++){var g=ghosts[i];
g.moveTimer+=dt;var gInterval=1/(g.eaten?6:g.scared?1.5:g.speed);
if(g.moveTimer>=gInterval){g.moveTimer=0;ghostAI(g,i);}
g.x+=(g.tx-g.x)*Math.min(1,dt*12);g.y+=(g.ty-g.y)*Math.min(1,dt*12);
// collision with pac
if(!g.eaten&&Math.abs(g.tx-pac.tx)+Math.abs(g.ty-pac.ty)<1){
if(g.scared){g.eaten=true;score+=200;addParticles(g.tx,g.ty,'#00ccff',12);}
else{lives--;addParticles(pac.tx,pac.ty,'#ffcc00',20);
pac.tx=10;pac.ty=15;pac.x=10;pac.y=15;pac.dir={x:0,y:0};nextDir={x:0,y:0};
resetGhosts();if(lives<=0)gameState='gameover';return;}}}
// level clear
var remaining=0;for(var i=0;i<dots.length;i++)if(!dots[i].eaten)remaining++;
for(var i=0;i<powerDots.length;i++)if(!powerDots[i].eaten)remaining++;
if(remaining===0){level++;placeDots();resetGhosts();pac.tx=10;pac.ty=15;pac.x=10;pac.y=15;pac.dir={x:0,y:0};nextDir={x:0,y:0};frightenTimer=0;}
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
var ox=(W-COLS*cs)/2,oy=0;
// walls
for(var y=0;y<ACTUAL_ROWS;y++)for(var x=0;x<COLS;x++){
if(MAP[y][x]===1){ctx.fillStyle='#1a1aff';ctx.fillRect(ox+x*cs,oy+y*cs,cs,cs);
ctx.fillStyle='#2222aa';ctx.fillRect(ox+x*cs+1,oy+y*cs+1,cs-2,cs-2);}
if(MAP[y][x]===2){ctx.fillStyle='#1a0a2e';ctx.fillRect(ox+x*cs,oy+y*cs,cs,cs);}}
// dots
for(var i=0;i<dots.length;i++){if(dots[i].eaten)continue;
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(ox+dots[i].x*cs+cs/2,oy+dots[i].y*cs+cs/2,cs*0.12,0,Math.PI*2);ctx.fill();}
// power dots
for(var i=0;i<powerDots.length;i++){if(powerDots[i].eaten)continue;
var pulse=0.6+0.4*Math.sin(gameTime*6);
ctx.fillStyle='rgba(255,204,136,'+pulse+')';ctx.beginPath();ctx.arc(ox+powerDots[i].x*cs+cs/2,oy+powerDots[i].y*cs+cs/2,cs*0.3,0,Math.PI*2);ctx.fill();}
// pac-man
var px=ox+pac.x*cs+cs/2,py=oy+pac.y*cs+cs/2;
var angle=Math.atan2(pac.dir.y,pac.dir.x);
ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;ctx.beginPath();
ctx.arc(px,py,cs*0.42,angle+pac.mouth,angle+Math.PI*2-pac.mouth);ctx.lineTo(px,py);ctx.fill();ctx.shadowBlur=0;
// ghosts
for(var i=0;i<ghosts.length;i++){var g=ghosts[i];
var gx=ox+g.x*cs+cs/2,gy=oy+g.y*cs+cs/2,gr=cs*0.42;
if(g.eaten){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(gx,gy,gr*0.5,0,Math.PI*2);ctx.fill();continue;}
ctx.fillStyle=g.scared?(frightenTimer<2&&Math.sin(gameTime*12)>0?'#fff':'#2222ff'):g.color;
ctx.beginPath();ctx.arc(gx,gy-gr*0.2,gr,Math.PI,0);
ctx.lineTo(gx+gr,gy+gr*0.6);
var waves=3;for(var w=0;w<waves;w++){var wx1=gx+gr-gr*2*(w+0.5)/waves,wx2=gx+gr-gr*2*(w+1)/waves;
ctx.quadraticCurveTo(wx1,gy+gr*0.2,wx2,gy+gr*0.6);}
ctx.closePath();ctx.fill();
// eyes
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx-gr*0.25,gy-gr*0.2,gr*0.25,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(gx+gr*0.25,gy-gr*0.2,gr*0.25,0,Math.PI*2);ctx.fill();
if(!g.scared){ctx.fillStyle='#00f';ctx.beginPath();ctx.arc(gx-gr*0.25+g.dir.x*2,gy-gr*0.2+g.dir.y*2,gr*0.12,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(gx+gr*0.25+g.dir.x*2,gy-gr*0.2+g.dir.y*2,gr*0.12,0,Math.PI*2);ctx.fill();}}
// particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;
// lives
for(var i=0;i<lives;i++){ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(ox+18+i*22,H-14,7,0.3,Math.PI*2-0.3);ctx.lineTo(ox+18+i*22,H-14);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-8);
}

function drawTitle(dt){
ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('PAC-MAN',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#fff';ctx.fillText('WAKA WAKA',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to move',W/2,H*0.65);
// draw pac and ghosts
var bx=W/2-80;ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(bx,H*0.76,12,0.3,Math.PI*2-0.3);ctx.lineTo(bx,H*0.76);ctx.fill();
for(var i=0;i<4;i++){ctx.fillStyle=GHOST_COLORS[i];ctx.beginPath();ctx.arc(bx+30+i*25,H*0.76,10,Math.PI,0);ctx.lineTo(bx+40+i*25,H*0.76+8);ctx.lineTo(bx+20+i*25,H*0.76+8);ctx.fill();}
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(!down)return;
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')nextDir={x:-1,y:0};
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')nextDir={x:1,y:0};
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')nextDir={x:0,y:-1};
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')nextDir={x:0,y:1};
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',function(){fn();});}

window.initPacman=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
bindMobile('btn-left',function(){nextDir={x:-1,y:0};});
bindMobile('btn-right',function(){nextDir={x:1,y:0};});
bindMobile('btn-up',function(){nextDir={x:0,y:-1};});
bindMobile('btn-down',function(){nextDir={x:0,y:1};});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopPacman=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);gameState='title';};
})();
