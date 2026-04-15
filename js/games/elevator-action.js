// Elevator Action — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,enemies=[],bullets=[],particles=[],elevators=[],floors=[],doors=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false,keyShoot=false,lastShot=0;
var cameraY=0;
var GRAVITY=500,JUMP_VEL=-280,PLAYER_SPEED=140,BULLET_SPEED=400;
var BUILDING_WIDTH=0,FLOOR_HEIGHT=80,NUM_FLOORS=12;
var docsCollected=0,docsNeeded=0;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }

function resize(){
var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;BUILDING_WIDTH=W*0.8;
if(gameState==='title')buildLevel();}

function buildLevel(){
floors=[];doors=[];elevators=[];enemies=[];
var bx=(W-BUILDING_WIDTH)/2;
docsCollected=0;docsNeeded=0;
for(var i=0;i<NUM_FLOORS;i++){
var y=i*FLOOR_HEIGHT;
floors.push({x:bx,y:y,w:BUILDING_WIDTH,h:8});
// Doors on each floor
var numDoors=2+Math.floor(Math.random()*2);
for(var d=0;d<numDoors;d++){
var dx=bx+40+d*(BUILDING_WIDTH-80)/(numDoors);
var isRed=Math.random()>0.5&&i>0&&i<NUM_FLOORS-1;
if(isRed)docsNeeded++;
doors.push({x:dx,y:y-FLOOR_HEIGHT+8,w:20,h:FLOOR_HEIGHT-8,red:isRed,collected:false,floor:i});}}
if(docsNeeded===0){doors[Math.floor(doors.length/2)].red=true;docsNeeded=1;}
// Elevators
var numElev=2+Math.floor(level/2);if(numElev>4)numElev=4;
for(var e=0;e<numElev;e++){
var ex=bx+50+e*(BUILDING_WIDTH-100)/(numElev);
elevators.push({x:ex,y:FLOOR_HEIGHT,w:30,h:12,vy:30+Math.random()*20,dir:-1,
minY:0,maxY:(NUM_FLOORS-1)*FLOOR_HEIGHT});}
// Enemies
for(var i=1;i<NUM_FLOORS-1;i++){
if(Math.random()>0.4){
var ex=bx+50+Math.random()*(BUILDING_WIDTH-100);
var espd=(50+Math.random()*30)*diffMult();
enemies.push({x:ex,y:i*FLOOR_HEIGHT-20,vx:espd*(Math.random()>0.5?1:-1),
dir:1,alive:true,shootTimer:(level<=2?3:2)+Math.random()*(level<=2?4:3),floor:i});}}
}

function resetGame(){
var bx=(W-BUILDING_WIDTH)/2;
buildLevel();
player={x:bx+BUILDING_WIDTH/2,y:-20,vx:0,vy:0,dir:1,onGround:false,onElevator:-1,invince:1,frame:0};
score=0;lives=3;level=1;gameTime=0;cameraY=0;particles=[];bullets=[];
gameState='playing';}

function addParticles(x,y,color,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.3+Math.random()*0.4,color:color,size:2+Math.random()*3});}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
player.frame+=dt*6;
var bx=(W-BUILDING_WIDTH)/2;
// Player movement
if(keyLeft){player.x-=PLAYER_SPEED*dt;player.dir=-1;}
if(keyRight){player.x+=PLAYER_SPEED*dt;player.dir=1;}
// Clamp to building
if(player.x<bx+10)player.x=bx+10;if(player.x>bx+BUILDING_WIDTH-10)player.x=bx+BUILDING_WIDTH-10;
// Elevator interaction
player.onElevator=-1;
for(var i=0;i<elevators.length;i++){var el=elevators[i];
el.y+=el.vy*el.dir*dt;
if(el.y<=el.minY||el.y>=el.maxY)el.dir=-el.dir;
// Check if player is on elevator
if(player.vy>=0&&Math.abs(player.x-el.x-el.w/2)<20&&
player.y>=el.y-20&&player.y<=el.y-8){
player.y=el.y-18;player.vy=0;player.onGround=true;player.onElevator=i;}}
// If on elevator, use up/down to control
if(player.onElevator>=0){
var el=elevators[player.onElevator];
if(keyUp){el.dir=-1;el.vy=60;}
else if(keyDown){el.dir=1;el.vy=60;}
else el.vy=30;
player.y=el.y-18;}
// Floor collision
if(player.onElevator<0){
player.vy+=GRAVITY*dt;if(player.vy>300)player.vy=300;
player.y+=player.vy*dt;
player.onGround=false;
for(var i=0;i<floors.length;i++){var f=floors[i];
if(player.vy>0&&player.y>f.y-20&&player.y<f.y&&player.x>f.x&&player.x<f.x+f.w){
player.y=f.y-18;player.vy=0;player.onGround=true;break;}}}
if(player.invince>0)player.invince-=dt;
// Shoot
if(keyShoot&&gameTime-lastShot>0.3){lastShot=gameTime;
bullets.push({x:player.x+player.dir*10,y:player.y-8,vx:BULLET_SPEED*player.dir,vy:0,
life:1,friendly:true});}
// Door interaction
for(var i=0;i<doors.length;i++){var d=doors[i];
if(d.red&&!d.collected&&Math.abs(player.x-d.x-d.w/2)<18&&Math.abs(player.y-(d.y+d.h-20))<20){
d.collected=true;docsCollected++;score+=500;addParticles(d.x+d.w/2,d.y+d.h/2,'#ff4444',12);
if(docsCollected>=docsNeeded){level++;buildLevel();
player.x=bx+BUILDING_WIDTH/2;player.y=-20;player.vy=0;score+=1000;}}}
// Camera
var targetY=-player.y+H*0.5;
if(targetY>0)targetY=0;
cameraY+=(targetY-cameraY)*3*dt;
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
e.x+=e.vx*dt;e.dir=e.vx>0?1:-1;
if(e.x<bx+20||e.x>bx+BUILDING_WIDTH-20)e.vx=-e.vx;
// Shoot at player
e.shootTimer-=dt;
if(e.shootTimer<=0&&Math.abs(e.y-player.y)<30){
e.shootTimer=3+Math.random()*2;
var bdir=player.x>e.x?1:-1;
bullets.push({x:e.x+bdir*10,y:e.y-8,vx:200*bdir,vy:0,life:1.5,friendly:false});}
// Collision
if(player.invince<=0&&Math.abs(player.x-e.x)<16&&Math.abs(player.y-e.y)<20){
lives--;addParticles(player.x,player.y,'#ff4444',12);
player.x=bx+BUILDING_WIDTH/2;player.y=-20;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}}
// Bullets
for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0||b.x<bx||b.x>bx+BUILDING_WIDTH){bullets.splice(i,1);continue;}
if(b.friendly){for(var j=0;j<enemies.length;j++){var e=enemies[j];
if(e.alive&&Math.abs(b.x-e.x)<14&&Math.abs(b.y-e.y)<16){
e.alive=false;score+=300;addParticles(e.x,e.y,'#ff8800',10);bullets.splice(i,1);break;}}}
else if(player.invince<=0&&Math.abs(b.x-player.x)<12&&Math.abs(b.y-player.y)<16){
lives--;addParticles(player.x,player.y,'#ff4444',12);
player.x=bx+BUILDING_WIDTH/2;player.y=-20;player.vy=0;player.invince=2;
bullets.splice(i,1);if(lives<=0)gameState='gameover';}}
// Bottom death
if(player.y>(NUM_FLOORS)*FLOOR_HEIGHT+50){
lives--;player.x=bx+BUILDING_WIDTH/2;player.y=-20;player.vy=0;player.invince=2;
if(lives<=0)gameState='gameover';}
// Particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
ctx.fillStyle='#0a0a1e';ctx.fillRect(0,0,W,H);
ctx.save();ctx.translate(0,cameraY);
var bx=(W-BUILDING_WIDTH)/2;
// Building background
ctx.fillStyle='#1a1a2a';ctx.fillRect(bx,-(NUM_FLOORS*FLOOR_HEIGHT),BUILDING_WIDTH,NUM_FLOORS*FLOOR_HEIGHT+FLOOR_HEIGHT);
// Building edge
ctx.strokeStyle='#334';ctx.lineWidth=2;ctx.strokeRect(bx,-(NUM_FLOORS*FLOOR_HEIGHT),BUILDING_WIDTH,NUM_FLOORS*FLOOR_HEIGHT+FLOOR_HEIGHT);
// Floors
for(var i=0;i<floors.length;i++){var f=floors[i];
ctx.fillStyle='#445566';ctx.fillRect(f.x,f.y,f.w,f.h);}
// Doors
for(var i=0;i<doors.length;i++){var d=doors[i];
if(d.red&&!d.collected){ctx.fillStyle='#cc2222';ctx.shadowColor='#ff0000';ctx.shadowBlur=8;}
else if(d.red&&d.collected){ctx.fillStyle='#444444';ctx.shadowBlur=0;}
else{ctx.fillStyle='#336699';ctx.shadowBlur=0;}
ctx.fillRect(d.x,d.y,d.w,d.h);ctx.shadowBlur=0;
ctx.fillStyle='#000';ctx.fillRect(d.x+2,d.y+2,d.w-4,d.h-4);
if(d.red&&!d.collected){ctx.fillStyle='#ff4444';ctx.fillRect(d.x+d.w/2-2,d.y+d.h/2-2,4,4);}}
// Elevators
for(var i=0;i<elevators.length;i++){var el=elevators[i];
ctx.fillStyle='#6688aa';ctx.fillRect(el.x,el.y,el.w,el.h);
ctx.fillStyle='#88aacc';ctx.fillRect(el.x,el.y,el.w,3);
// Shaft
ctx.strokeStyle='#334';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(el.x+el.w/2,el.minY);ctx.lineTo(el.x+el.w/2,el.maxY+el.h);ctx.stroke();}
// Enemies
for(var i=0;i<enemies.length;i++){var e=enemies[i];
if(!e.alive)continue;
ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.dir,1);
ctx.fillStyle='#222';ctx.fillRect(-6,-18,12,20);// Body
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-20,6,0,Math.PI*2);ctx.fill();// Head
ctx.fillStyle='#333';ctx.fillRect(-8,-24,16,4);// Hat
ctx.fillStyle='#888';ctx.fillRect(6,-10,6,2);// Gun
ctx.restore();}
// Player
if(player.invince<=0||Math.sin(gameTime*15)>0){
ctx.save();ctx.translate(player.x,player.y);ctx.scale(player.dir,1);
ctx.fillStyle='#cc4444';ctx.fillRect(-6,-18,12,20);
ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(0,-20,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#222';ctx.fillRect(6,-10,8,2);// Gun
ctx.restore();}
// Bullets
for(var i=0;i<bullets.length;i++){var b=bullets[i];
ctx.fillStyle=b.friendly?'#ffcc00':'#ff4444';
ctx.shadowColor=b.friendly?'#ffcc00':'#ff4444';ctx.shadowBlur=6;
ctx.fillRect(b.x-3,b.y-1,6,2);ctx.shadowBlur=0;}
// Particles
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;
ctx.restore();
// HUD overlay
ctx.fillStyle='#cc2222';ctx.font='12px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('DOCS: '+docsCollected+'/'+docsNeeded,15,25);
for(var i=0;i<lives;i++){ctx.fillStyle='#cc4444';ctx.beginPath();ctx.arc(20+i*22,H-18,8,0,Math.PI*2);ctx.fill();}
}

function drawTitle(dt){
ctx.fillStyle='#0a0a1e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
// Building silhouette
var bx=W*0.2;
ctx.fillStyle='#1a1a2a';ctx.fillRect(bx,H*0.1,W*0.6,H*0.8);
for(var i=0;i<8;i++)for(var j=0;j<4;j++){
ctx.fillStyle=Math.random()>0.3?'#ffcc44':'#444';
ctx.fillRect(bx+20+j*(W*0.6-40)/4,H*0.15+i*(H*0.7)/8,12,8);}
ctx.save();ctx.textAlign='center';
ctx.shadowColor='#44aaff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.055)+'px "Courier New",monospace';ctx.fillStyle='#44aaff';ctx.fillText('ELEVATOR ACTION',W/2,H*0.3);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillStyle='#88ccff';ctx.fillText('SECRET AGENT MISSION',W/2,H*0.38);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.55);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Left/Right move, Up/Down ride elevators, Space shoot',W/2,H*0.65);
ctx.fillText('Collect documents from RED doors!',W/2,H*0.71);
ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
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
if(e.key===' ')keyShoot=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});el.addEventListener('touchend',function(e){e.preventDefault();set(false);});el.addEventListener('mousedown',function(){set(true);});el.addEventListener('mouseup',function(){set(false);});}

window.initElevatorAction=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopElevatorAction=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=keyShoot=false;};
})();
