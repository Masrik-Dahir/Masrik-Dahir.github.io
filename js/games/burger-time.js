// BurgerTime — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,enemies=[],particles=[],ladders=[],platforms=[],ingredients=[],burgers=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var TILE=0,COLS=0,ROWS=0;
var PLAYER_SPEED=120,ENEMY_SPEED=55,PEPPER_COUNT=3;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;TILE=Math.floor(W/16);COLS=Math.floor(W/TILE);ROWS=Math.floor(H/TILE);
buildLevel();}

function buildLevel(){
platforms=[];ladders=[];ingredients=[];burgers=[];
var platY=[];
var numFloors=5;
for(var f=0;f<numFloors;f++){
var y=Math.floor(H*0.15+f*(H*0.17));platY.push(y);
platforms.push({x:0,y:y,w:W,h:6});}
// Ladders between floors
for(var f=0;f<numFloors-1;f++){
var numLad=3+Math.floor(Math.random()*2);
for(var l=0;l<numLad;l++){
var lx=W*0.1+l*(W*0.8/(numLad-1));
ladders.push({x:lx-8,y:platY[f],w:16,h:platY[f+1]-platY[f]});}}
// Burger ingredients on platforms (not bottom)
var types=['top-bun','lettuce','patty','bottom-bun'];
for(var b=0;b<3;b++){
var bx=W*0.15+b*(W*0.3);
for(var t=0;t<types.length;t++){
if(t<platY.length-1){
ingredients.push({x:bx,y:platY[t]-8,w:TILE*2.5,h:10,type:types[t],dropped:false,
dropTarget:platY[Math.min(t+1,platY.length-1)]-8,walked:0,burgerId:b});}}}
}

function spawnEnemies(){
enemies=[];
var count=level<=2?2+level:3+Math.floor(level*1.2);if(count>6)count=6;
var dm=diffMult();
var types=['hotdog','pickle','egg'];
for(var i=0;i<count;i++){
enemies.push({x:Math.random()*W*0.8+W*0.1,y:platforms[0].y-16,vx:0,vy:0,
type:types[i%3],dir:Math.random()>0.5?1:-1,onLadder:false,alive:true,speedMult:dm});}}

function resetGame(){
player={x:W/2,y:platforms[platforms.length-1].y-16,vx:0,vy:0,dir:1,onLadder:false,frame:0};
score=0;lives=3;level=1;gameTime=0;particles=[];
buildLevel();spawnEnemies();gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*3});}

function onPlatform(obj){
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(obj.y>=p.y-18&&obj.y<=p.y&&obj.x>p.x-10&&obj.x<p.x+p.w+10)return p;}return null;}

function nearLadder(obj){
for(var i=0;i<ladders.length;i++){var l=ladders[i];
if(obj.x>l.x-12&&obj.x<l.x+l.w+12&&obj.y>=l.y-10&&obj.y<=l.y+l.h+10)return l;}return null;}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*6;
// Player movement
var plat=onPlatform(player);var lad=nearLadder(player);
if(lad&&(keyUp||keyDown)){
player.onLadder=true;
if(keyUp)player.y-=PLAYER_SPEED*dt;
if(keyDown)player.y+=PLAYER_SPEED*dt;
}else{
player.onLadder=false;
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.dir=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.dir=1;}
}
// Keep on platform if not on ladder
if(!player.onLadder&&plat)player.y=plat.y-16;
else if(!player.onLadder&&!plat){// Fall to nearest platform below
player.y+=200*dt;
for(var i=0;i<platforms.length;i++){var p=platforms[i];
if(player.y>=p.y-16&&player.y<=p.y&&player.x>p.x&&player.x<p.x+p.w){player.y=p.y-16;break;}}}
// Clamp
if(player.x<10)player.x=10;if(player.x>W-10)player.x=W-10;
if(player.y<20)player.y=20;if(player.y>H-20)player.y=H-20;
// Walk over ingredients
for(var i=0;i<ingredients.length;i++){var ing=ingredients[i];
if(!ing.dropped&&Math.abs(player.y-(ing.y-8))<12&&player.x>ing.x-5&&player.x<ing.x+ing.w+5){
ing.walked+=PLAYER_SPEED*dt;
if(ing.walked>=ing.w){ing.dropped=true;score+=100;addParticles(ing.x+ing.w/2,ing.y,'#ffcc00',8);
// Drop it
ing.y=ing.dropTarget;}}}
// Check burger completions
var completed=true;
for(var i=0;i<ingredients.length;i++)if(!ingredients[i].dropped)completed=false;
if(completed){level++;buildLevel();spawnEnemies();score+=1000;}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
// Simple AI: move toward player
var eLad=nearLadder(e);
if(eLad&&Math.abs(player.y-e.y)>30){
if(player.y<e.y)e.y-=ENEMY_SPEED*dt;
else e.y+=ENEMY_SPEED*dt;
}else{
var eSpd=ENEMY_SPEED*(e.speedMult||diffMult());
if(player.x<e.x)e.x-=eSpd*dt;
else e.x+=eSpd*dt;
e.dir=player.x>e.x?1:-1;
var ePlat=onPlatform(e);if(ePlat)e.y=ePlat.y-16;
}
if(e.x<5)e.x=5;if(e.x>W-5)e.x=W-5;
// Collision with player
var dx=player.x-e.x,dy=player.y-e.y;
if(Math.sqrt(dx*dx+dy*dy)<20){
lives--;addParticles(player.x,player.y,'#ff4444',12);
player.x=W/2;player.y=platforms[platforms.length-1].y-16;
if(lives<=0)gameState='gameover';}}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawChef(x,y,dir,frame){
ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
// Shadow
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(0,18,8,3,0,0,Math.PI*2);ctx.fill();
// Chef hat with puff
ctx.fillStyle='#ffffff';ctx.fillRect(-6,-18,12,8);
ctx.fillRect(-8,-20,16,4);
ctx.beginPath();ctx.arc(0,-20,8,Math.PI,0);ctx.fill();
ctx.fillStyle='rgba(220,220,220,1)';ctx.beginPath();ctx.arc(-3,-22,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(3,-22,4,0,Math.PI*2);ctx.fill();
// Head with face
ctx.fillStyle='#ffcc88';ctx.fillRect(-5,-12,10,8);
ctx.fillStyle='#000';ctx.fillRect(-3,-10,2,2);ctx.fillRect(1,-10,2,2);
ctx.fillStyle='#cc6644';ctx.fillRect(-1,-6,2,1);
// Mustache
ctx.strokeStyle='#553300';ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(-3,-7);ctx.quadraticCurveTo(-5,-5,-4,-4);ctx.stroke();
ctx.beginPath();ctx.moveTo(3,-7);ctx.quadraticCurveTo(5,-5,4,-4);ctx.stroke();
// Body (white chef coat) with buttons
ctx.fillStyle='#ffffff';ctx.fillRect(-6,-4,12,12);
ctx.fillStyle='#dddddd';ctx.fillRect(-6,-4,12,2);
ctx.fillStyle='#aaa';ctx.fillRect(-1,0,2,2);ctx.fillRect(-1,4,2,2);
// Arms
var armSwing=Math.sin(frame)*4;
ctx.fillStyle='#ffffff';
ctx.fillRect(-9,-2+armSwing,4,6);ctx.fillRect(5,-2-armSwing,4,6);
ctx.fillStyle='#ffcc88';ctx.fillRect(-9,3+armSwing,4,3);ctx.fillRect(5,3-armSwing,4,3);
// Legs with walking
var legOff=Math.sin(frame)*3;
ctx.fillStyle='#333388';ctx.fillRect(-5,8,4,8+legOff);ctx.fillRect(1,8,4,8-legOff);
ctx.fillStyle='#222266';ctx.fillRect(-5,15+legOff,5,3);ctx.fillRect(1,15-legOff,5,3);
ctx.restore();}

function drawEnemy(x,y,type,dir){
ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
var colors={hotdog:'#dd6633',pickle:'#44aa44',egg:'#ffffaa'};
var c=colors[type]||'#dd6633';
ctx.fillStyle=c;
if(type==='hotdog'){ctx.beginPath();ctx.ellipse(0,-4,8,14,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#cc4422';ctx.fillRect(-3,-6,6,4);}
else if(type==='pickle'){ctx.beginPath();ctx.ellipse(0,-2,6,14,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#338833';ctx.fillRect(-4,2,8,4);}
else{ctx.beginPath();ctx.ellipse(0,-4,10,10,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.arc(0,-4,5,0,Math.PI*2);ctx.fill();}
// Eyes
ctx.fillStyle='#000';ctx.fillRect(-3,-8,2,2);ctx.fillRect(1,-8,2,2);
ctx.restore();}

function render(){
var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a1a');bg.addColorStop(1,'#1a0a0a');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
// Platforms
for(var i=0;i<platforms.length;i++){var p=platforms[i];
ctx.fillStyle='#553322';ctx.fillRect(p.x,p.y,p.w,p.h);
ctx.fillStyle='#664433';ctx.fillRect(p.x,p.y,p.w,2);}
// Ladders
ctx.strokeStyle='#887766';ctx.lineWidth=2;
for(var i=0;i<ladders.length;i++){var l=ladders[i];
ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x,l.y+l.h);ctx.moveTo(l.x+l.w,l.y);ctx.lineTo(l.x+l.w,l.y+l.h);ctx.stroke();
for(var r=l.y;r<l.y+l.h;r+=12){ctx.beginPath();ctx.moveTo(l.x,r);ctx.lineTo(l.x+l.w,r);ctx.stroke();}}
// Ingredients
for(var i=0;i<ingredients.length;i++){var ing=ingredients[i];
var colors={'top-bun':'#cc8833','lettuce':'#44cc44','patty':'#884422','bottom-bun':'#cc8833'};
ctx.fillStyle=colors[ing.type]||'#cc8833';
ctx.shadowColor=colors[ing.type]||'#cc8833';ctx.shadowBlur=ing.dropped?0:6;
ctx.fillRect(ing.x,ing.y,ing.w,ing.h);
if(ing.type==='top-bun'){ctx.beginPath();ctx.arc(ing.x+ing.w/2,ing.y,ing.w/2,Math.PI,0);ctx.fill();}
if(ing.type==='lettuce'){ctx.fillStyle='#66ee66';for(var j=0;j<5;j++)ctx.fillRect(ing.x+j*ing.w/5,ing.y-2,ing.w/6,4);}
ctx.shadowBlur=0;}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.alive)drawEnemy(e.x,e.y,e.type,e.dir);}
// Player
drawChef(player.x,player.y,player.dir,player.frame);
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
// Lives
for(var i=0;i<lives;i++){ctx.fillStyle='#ffffff';ctx.fillRect(15+i*20,H-25,8,4);ctx.fillRect(13+i*20,H-29,12,4);}
}

function drawTitle(dt){
ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Burger ingredients falling in bg
for(var i=0;i<8;i++){var by=(titlePulse*30+i*80)%H;
ctx.fillStyle=['#cc8833','#44cc44','#884422','#cc8833'][i%4];
ctx.fillRect(W*0.1+i*(W*0.1),by,40,8);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff8800';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff8800';ctx.fillText('BURGERTIME',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc44';ctx.fillText('BUILD THE BURGER!',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move, walk over ingredients to drop them',W/2,H*0.65);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillText('Level reached: '+level,W/2,H*0.52);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.7);ctx.restore();}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='LVL '+level;
document.getElementById('hud-time').textContent=lives+' HP';}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title'){gameTime+=dt;drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){gameTime+=dt;render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initBurgerTime=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopBurgerTime=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;};
})();
