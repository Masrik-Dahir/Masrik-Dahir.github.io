// Arkanoid — Full Game
(function(){
/* ── roundRect polyfill ─────────────────────────────────────────── */
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
var tl=r[0]||0,tr=r[1]||0,br=r[2]||0,bl=r[3]||0;
this.beginPath();this.moveTo(x+tl,y);this.lineTo(x+w-tr,y);
this.quadraticCurveTo(x+w,y,x+w,y+tr);this.lineTo(x+w,y+h-br);
this.quadraticCurveTo(x+w,y+h,x+w-br,y+h);this.lineTo(x+bl,y+h);
this.quadraticCurveTo(x,y+h,x,y+h-bl);this.lineTo(x,y+tl);
this.quadraticCurveTo(x,y,x+tl,y);this.closePath();return this;};}

/* ── state ──────────────────────────────────────────────────────── */
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var paddle,balls=[],bricks=[],particles=[],powerups=[],lasers=[];
var keyLeft=false,keyRight=false,spaceDown=false;
var ballOnPaddle=true;

/* ── constants ──────────────────────────────────────────────────── */
var BASE_PADDLE_W=120,PADDLE_W=120,PADDLE_H=14,PADDLE_SPEED=480;
var BALL_R=5,BASE_BALL_SPEED=240,BALL_SPEED=240;
function diffMult(){ return level<=2?0.8:(level<=5?1.0:1.0+(level-5)*0.1); }
var COLS=11,ROWS=6,BRICK_GAP=3;
var COLORS=['#ff3366','#ff6622','#ffcc00','#22cc44','#00ccdd','#4488ff'];
var BRICK_SCORES=[50,60,70,80,90,100];

/* power-up active timers */
var expandTimer=0,laserTimer=0,slowTimer=0;
var laserCooldown=0;

/* stars background */
var stars=[];
function initStars(){stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random(),y:Math.random(),s:0.5+Math.random()*1.5,b:Math.random()});}

/* ── resize ─────────────────────────────────────────────────────── */
function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;}

/* ── brick patterns ─────────────────────────────────────────────── */
function patternStandard(r,c,rows,cols){return true;}
function patternZigzag(r,c){return(r+c)%2===0;}
function patternDiamond(r,c,rows,cols){
var mr=rows/2,mc=cols/2;return Math.abs(r-mr)+Math.abs(c-mc)<=mr+1;}
function patternBorders(r,c,rows,cols){
return r===0||r===rows-1||c===0||c===cols-1;}
function patternCheckerboard(r,c){return(r+c)%2===0;}
function patternCross(r,c,rows,cols){
var mr=Math.floor(rows/2),mc=Math.floor(cols/2);
return r===mr||c===mc||Math.abs(r-mr)===Math.abs(c-mc);}

var PATTERNS=[patternStandard,patternZigzag,patternDiamond,patternBorders,patternCheckerboard,patternCross];

function buildBricks(){
bricks=[];
var topOffset=55;
var bw=(W-30-(COLS-1)*BRICK_GAP)/COLS;
var bh=Math.max(16,Math.min(22,H*0.028));
var rowCount=ROWS+Math.min(Math.floor((level-1)/2),4);
var pat=PATTERNS[(level-1)%PATTERNS.length];

for(var r=0;r<rowCount;r++){for(var c=0;c<COLS;c++){
if(!pat(r,c,rowCount,COLS))continue;
var type='normal';
var hits=1;var maxHits=1;var scoreVal=BRICK_SCORES[r%BRICK_SCORES.length];
var color=COLORS[r%COLORS.length];

// silver bricks: scattered based on level
if(level>=2&&((r*COLS+c+level)%7===0)){
type='silver';hits=2;maxHits=2;scoreVal=120;color='#c0c0c0';}
// gold bricks: rare, indestructible
if(level>=3&&((r*COLS+c+level)%13===0)&&r>0){
type='gold';hits=9999;maxHits=9999;scoreVal=0;color='#ffd700';}

bricks.push({x:15+c*(bw+BRICK_GAP),y:topOffset+r*(bh+BRICK_GAP),
w:bw,h:bh,alive:true,type:type,color:color,
hits:hits,maxHits:maxHits,score:scoreVal,shimmer:Math.random()*6});
}}}

/* ── ball management ────────────────────────────────────────────── */
function createBall(x,y,vx,vy){
return{x:x,y:y,vx:vx,vy:vy,trail:[]};}

function resetBall(){
balls=[];ballOnPaddle=true;
var b=createBall(paddle.x,paddle.y-PADDLE_H/2-BALL_R-1,0,0);
balls=[b];}

function launchBall(){
if(!ballOnPaddle||balls.length===0)return;
ballOnPaddle=false;
var speed=getEffectiveBallSpeed();
var angle=-Math.PI/2+(Math.random()-0.5)*0.6;
balls[0].vx=Math.cos(angle)*speed;
balls[0].vy=Math.sin(angle)*speed;}

function getEffectiveBallSpeed(){
var spd=BALL_SPEED;
if(slowTimer>0)spd*=0.6;
return spd;}

/* ── reset ──────────────────────────────────────────────────────── */
function resetGame(){
PADDLE_W=BASE_PADDLE_W;BALL_SPEED=BASE_BALL_SPEED;
paddle={x:W/2,y:H-35};
score=0;lives=3;level=1;gameTime=0;
particles=[];powerups=[];lasers=[];
expandTimer=0;laserTimer=0;slowTimer=0;laserCooldown=0;
buildBricks();resetBall();gameState='playing';}

function nextLevel(){
level++;score+=1000;
BALL_SPEED=Math.min(400,BASE_BALL_SPEED+level*12);
PADDLE_W=BASE_PADDLE_W;expandTimer=0;laserTimer=0;slowTimer=0;
powerups=[];lasers=[];
buildBricks();resetBall();}

/* ── particles ──────────────────────────────────────────────────── */
function addParticles(x,y,color,n){
for(var i=0;i<n;i++){
particles.push({x:x,y:y,
vx:(Math.random()-0.5)*300,vy:(Math.random()-0.5)*300,
life:0.3+Math.random()*0.5,color:color,
size:2+Math.random()*4});}}

/* ── power-up spawn ─────────────────────────────────────────────── */
function spawnPowerup(x,y){
if(Math.random()>0.20)return;
var types=['expand','laser','multi','slow','extralife'];
var weights=[0.25,0.20,0.20,0.20,0.15];
var r=Math.random(),cum=0,type='expand';
for(var i=0;i<types.length;i++){cum+=weights[i];if(r<cum){type=types[i];break;}}
var info={expand:{color:'#4488ff',label:'E'},laser:{color:'#ff4444',label:'L'},
multi:{color:'#44cc44',label:'M'},slow:{color:'#ff8800',label:'S'},
extralife:{color:'#ff66cc',label:'+'}};
var pi=info[type];
powerups.push({x:x,y:y,vy:110+Math.random()*30,type:type,
color:pi.color,label:pi.label,pulse:Math.random()*6,rot:0});}

/* ── apply power-up ─────────────────────────────────────────────── */
function applyPowerup(p){
switch(p.type){
case 'expand':
PADDLE_W=Math.min(200,BASE_PADDLE_W*1.6);expandTimer=12;break;
case 'laser':
laserTimer=10;break;
case 'multi':
var newBalls=[];
for(var i=0;i<balls.length&&newBalls.length<6;i++){
var b=balls[i];
var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy)||getEffectiveBallSpeed();
var ang=Math.atan2(b.vy,b.vx);
newBalls.push(createBall(b.x,b.y,Math.cos(ang+0.35)*spd,Math.sin(ang+0.35)*spd));
newBalls.push(createBall(b.x,b.y,Math.cos(ang-0.35)*spd,Math.sin(ang-0.35)*spd));}
for(var i=0;i<newBalls.length;i++)balls.push(newBalls[i]);
if(ballOnPaddle){ballOnPaddle=false;
var s=getEffectiveBallSpeed();
balls[0].vx=s*0.5;balls[0].vy=-s;}
break;
case 'slow':
slowTimer=8;
for(var i=0;i<balls.length;i++){
var b=balls[i];var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
if(spd>0){var f=0.6;b.vx*=f;b.vy*=f;}}
break;
case 'extralife':
lives=Math.min(5,lives+1);break;
}}

/* ── update ─────────────────────────────────────────────────────── */
function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;

/* timers */
if(expandTimer>0){expandTimer-=dt;if(expandTimer<=0){PADDLE_W=BASE_PADDLE_W;expandTimer=0;}}
if(laserTimer>0){laserTimer-=dt;if(laserTimer<=0)laserTimer=0;}
if(slowTimer>0){slowTimer-=dt;if(slowTimer<=0)slowTimer=0;}
if(laserCooldown>0)laserCooldown-=dt;

/* paddle */
if(keyLeft)paddle.x-=PADDLE_SPEED*dt;
if(keyRight)paddle.x+=PADDLE_SPEED*dt;
paddle.x=Math.max(PADDLE_W/2,Math.min(W-PADDLE_W/2,paddle.x));

/* auto-fire laser */
if(laserTimer>0&&laserCooldown<=0){
lasers.push({x:paddle.x-PADDLE_W/4,y:paddle.y-PADDLE_H/2,vy:-500});
lasers.push({x:paddle.x+PADDLE_W/4,y:paddle.y-PADDLE_H/2,vy:-500});
laserCooldown=0.25;}

/* ball on paddle follows paddle */
if(ballOnPaddle&&balls.length>0){
balls[0].x=paddle.x;balls[0].y=paddle.y-PADDLE_H/2-BALL_R-1;
balls[0].vx=0;balls[0].vy=0;}

/* update lasers */
for(var i=lasers.length-1;i>=0;i--){
var l=lasers[i];l.y+=l.vy*dt;
if(l.y<-10){lasers.splice(i,1);continue;}
/* laser-brick collision */
var hit=false;
for(var j=0;j<bricks.length;j++){var b=bricks[j];
if(!b.alive)continue;
if(l.x>b.x&&l.x<b.x+b.w&&l.y>b.y&&l.y<b.y+b.h){
if(b.type!=='gold'){b.hits--;
if(b.hits<=0){b.alive=false;score+=b.score;spawnPowerup(b.x+b.w/2,b.y+b.h/2);
addParticles(b.x+b.w/2,b.y+b.h/2,b.color,8);}}
else{addParticles(l.x,l.y,'#ffd700',4);}
hit=true;break;}}
if(hit){lasers.splice(i,1);}}

/* update each ball */
var ballSpeed=getEffectiveBallSpeed();
for(var bi=balls.length-1;bi>=0;bi--){
var ball=balls[bi];
if(ballOnPaddle&&bi===0)continue;

ball.x+=ball.vx*dt;
ball.y+=ball.vy*dt;

/* trail */
ball.trail.push({x:ball.x,y:ball.y,life:0.15});
if(ball.trail.length>8)ball.trail.shift();

/* wall bounce */
if(ball.x-BALL_R<0){ball.x=BALL_R;ball.vx=Math.abs(ball.vx);}
if(ball.x+BALL_R>W){ball.x=W-BALL_R;ball.vx=-Math.abs(ball.vx);}
if(ball.y-BALL_R<0){ball.y=BALL_R;ball.vy=Math.abs(ball.vy);}

/* paddle bounce */
if(ball.vy>0&&ball.y+BALL_R>=paddle.y-PADDLE_H/2&&ball.y+BALL_R<=paddle.y+PADDLE_H
&&ball.x>paddle.x-PADDLE_W/2-BALL_R&&ball.x<paddle.x+PADDLE_W/2+BALL_R){
var off=(ball.x-paddle.x)/(PADDLE_W/2);
off=Math.max(-0.9,Math.min(0.9,off));
var angle=-Math.PI/2+off*(Math.PI*0.38);
var spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
if(spd<ballSpeed*0.5)spd=ballSpeed;
ball.vx=Math.cos(angle)*spd;
ball.vy=Math.sin(angle)*spd;
ball.y=paddle.y-PADDLE_H/2-BALL_R;
addParticles(ball.x,ball.y,'#00ccff',5);}

/* brick collision */
for(var j=0;j<bricks.length;j++){var b=bricks[j];if(!b.alive)continue;
if(ball.x+BALL_R>b.x&&ball.x-BALL_R<b.x+b.w&&ball.y+BALL_R>b.y&&ball.y-BALL_R<b.y+b.h){
/* resolve bounce direction */
var overlapL=ball.x+BALL_R-b.x;
var overlapR=b.x+b.w-(ball.x-BALL_R);
var overlapT=ball.y+BALL_R-b.y;
var overlapB=b.y+b.h-(ball.y-BALL_R);
var minO=Math.min(overlapL,overlapR,overlapT,overlapB);
if(minO===overlapL||minO===overlapR)ball.vx=-ball.vx;
else ball.vy=-ball.vy;

if(b.type!=='gold'){
b.hits--;
if(b.hits<=0){b.alive=false;score+=b.score;
spawnPowerup(b.x+b.w/2,b.y+b.h/2);
addParticles(b.x+b.w/2,b.y+b.h/2,b.color,12);}
else{addParticles(b.x+b.w/2,b.y+b.h/2,'#ffffff',4);}}
else{addParticles(b.x+b.w/2,b.y+b.h/2,'#ffd700',3);}
break;}}

/* ball lost below screen */
if(ball.y-BALL_R>H+20){
balls.splice(bi,1);
addParticles(ball.x,H,'#ff3355',15);}}

/* all balls lost */
if(balls.length===0){
lives--;
if(lives<=0){gameState='gameover';}
else{resetBall();}}

/* powerups */
for(var i=powerups.length-1;i>=0;i--){
var p=powerups[i];p.y+=p.vy*dt;p.pulse+=dt*5;p.rot+=dt*2;
if(p.y>H+20){powerups.splice(i,1);continue;}
/* paddle catch */
if(p.y+10>paddle.y-PADDLE_H/2&&p.y-10<paddle.y+PADDLE_H/2
&&p.x>paddle.x-PADDLE_W/2-10&&p.x<paddle.x+PADDLE_W/2+10){
applyPowerup(p);addParticles(p.x,p.y,p.color,12);powerups.splice(i,1);}}

/* level clear check: any breakable bricks alive? */
var anyAlive=false;
for(var i=0;i<bricks.length;i++){
if(bricks[i].alive&&bricks[i].type!=='gold'){anyAlive=true;break;}}
if(!anyAlive)nextLevel();

/* particles */
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);}

/* stars twinkle */
for(var i=0;i<stars.length;i++){stars[i].b+=dt*(0.5+Math.random());if(stars[i].b>6.28)stars[i].b-=6.28;}
}

/* ── render helpers ─────────────────────────────────────────────── */
function drawStars(){
for(var i=0;i<stars.length;i++){
var s=stars[i];
var a=0.3+0.4*Math.abs(Math.sin(s.b));
ctx.fillStyle='rgba(200,210,255,'+a+')';
ctx.fillRect(s.x*W,s.y*H,s.s,s.s);}}

function drawBricks(){
for(var i=0;i<bricks.length;i++){
var b=bricks[i];if(!b.alive)continue;b.shimmer+=0.03;

if(b.type==='gold'){
/* gold shimmer */
var g=ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);
var sh=0.5+0.5*Math.sin(b.shimmer*3);
g.addColorStop(0,'#b8860b');g.addColorStop(sh,'#ffd700');g.addColorStop(1,'#b8860b');
ctx.fillStyle=g;
ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,3);ctx.fill();
ctx.strokeStyle='rgba(255,255,200,0.5)';ctx.lineWidth=1;
ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,3);ctx.stroke();
}else if(b.type==='silver'){
/* silver metallic */
var g=ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);
var sh=0.5+0.5*Math.sin(b.shimmer*2);
g.addColorStop(0,'#888');g.addColorStop(sh,'#ddd');g.addColorStop(1,'#888');
ctx.fillStyle=g;
ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,3);ctx.fill();
if(b.hits>1){ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.font='bold '+Math.max(8,b.h*0.55)+'px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText('2',b.x+b.w/2,b.y+b.h/2);}
}else{
/* normal colored brick with gradient */
var g=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
g.addColorStop(0,b.color);g.addColorStop(1,shadeColor(b.color,-30));
ctx.fillStyle=g;
ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,2);ctx.fill();
/* highlight on top */
ctx.fillStyle='rgba(255,255,255,0.25)';
ctx.fillRect(b.x+2,b.y+1,b.w-4,Math.max(2,b.h*0.2));
}}}

function shadeColor(hex,percent){
var num=parseInt(hex.slice(1),16);
var r=Math.max(0,Math.min(255,((num>>16)&0xff)+percent));
var g=Math.max(0,Math.min(255,((num>>8)&0xff)+percent));
var b=Math.max(0,Math.min(255,(num&0xff)+percent));
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawPaddle(){
/* Vaus-style paddle */
var px=paddle.x-PADDLE_W/2,py=paddle.y-PADDLE_H/2;
var pw=PADDLE_W,ph=PADDLE_H;

/* main body gradient */
var pg=ctx.createLinearGradient(px,py,px,py+ph);
pg.addColorStop(0,'#88bbee');pg.addColorStop(0.3,'#ccddff');pg.addColorStop(0.5,'#ffffff');
pg.addColorStop(0.7,'#88aadd');pg.addColorStop(1,'#556688');
ctx.fillStyle=pg;
ctx.shadowColor='#4488cc';ctx.shadowBlur=10;
ctx.beginPath();ctx.roundRect(px,py,pw,ph,[6,6,4,4]);ctx.fill();
ctx.shadowBlur=0;

/* chrome edge highlight */
ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1;
ctx.beginPath();ctx.roundRect(px+1,py+1,pw-2,ph-2,[5,5,3,3]);ctx.stroke();

/* side wings */
var wingW=Math.min(12,pw*0.1);
var wg=ctx.createLinearGradient(px,py,px,py+ph);
wg.addColorStop(0,'#ff4444');wg.addColorStop(0.5,'#ff8866');wg.addColorStop(1,'#cc2222');
ctx.fillStyle=wg;
ctx.beginPath();ctx.roundRect(px-2,py+2,wingW,ph-4,3);ctx.fill();
ctx.beginPath();ctx.roundRect(px+pw-wingW+2,py+2,wingW,ph-4,3);ctx.fill();

/* laser indicator */
if(laserTimer>0){
ctx.fillStyle='rgba(255,60,60,'+(0.5+0.5*Math.sin(gameTime*10))+')';
ctx.fillRect(paddle.x-2,py-3,4,3);}}

function drawBalls(){
for(var bi=0;bi<balls.length;bi++){
var ball=balls[bi];
/* trail */
for(var t=0;t<ball.trail.length;t++){
var tr=ball.trail[t];
var a=(t/ball.trail.length)*0.25;
ctx.fillStyle='rgba(180,220,255,'+a+')';
ctx.beginPath();ctx.arc(tr.x,tr.y,BALL_R*(0.3+0.5*t/ball.trail.length),0,Math.PI*2);ctx.fill();}
/* glow */
ctx.shadowColor='#aaddff';ctx.shadowBlur=14;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,BALL_R,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
/* specular highlight */
ctx.fillStyle='rgba(255,255,255,0.6)';
ctx.beginPath();ctx.arc(ball.x-BALL_R*0.25,ball.y-BALL_R*0.25,BALL_R*0.4,0,Math.PI*2);ctx.fill();}}

function drawLasers(){
for(var i=0;i<lasers.length;i++){
var l=lasers[i];
ctx.fillStyle='#ff2222';ctx.shadowColor='#ff4444';ctx.shadowBlur=6;
ctx.fillRect(l.x-1.5,l.y,3,10);ctx.shadowBlur=0;}}

function drawPowerups(){
for(var i=0;i<powerups.length;i++){
var p=powerups[i];
var sc=0.8+0.2*Math.sin(p.pulse);
ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);

/* capsule body */
ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;
ctx.beginPath();ctx.roundRect(-12,-8,24,16,6);ctx.fill();ctx.shadowBlur=0;

/* divider line */
ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.stroke();

/* label */
ctx.fillStyle='#fff';
ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText(p.label,0,1);
ctx.restore();}}

function drawParticles(){
for(var i=0;i<particles.length;i++){
var p=particles[i];
ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;}

function drawLives(){
var sz=Math.max(8,W*0.012);
for(var i=0;i<lives;i++){
var lx=15+i*(sz*2.5);var ly=H-16;
ctx.fillStyle='#ff66aa';ctx.shadowColor='#ff66aa';ctx.shadowBlur=4;
ctx.beginPath();
ctx.moveTo(lx,ly+sz*0.3);
ctx.bezierCurveTo(lx,ly-sz*0.1,lx-sz,ly-sz*0.1,lx-sz,ly+sz*0.3);
ctx.bezierCurveTo(lx-sz,ly+sz*0.8,lx,ly+sz,lx,ly+sz*1.2);
ctx.bezierCurveTo(lx,ly+sz,lx+sz,ly+sz*0.8,lx+sz,ly+sz*0.3);
ctx.bezierCurveTo(lx+sz,ly-sz*0.1,lx,ly-sz*0.1,lx,ly+sz*0.3);
ctx.fill();ctx.shadowBlur=0;}}

/* ── render main scene ──────────────────────────────────────────── */
function render(){
/* dark space background */
ctx.fillStyle='#060620';ctx.fillRect(0,0,W,H);
drawStars();
drawBricks();
drawPaddle();
drawBalls();
drawLasers();
drawPowerups();
drawParticles();
drawLives();

/* level indicator */
ctx.fillStyle='#8899aa';
ctx.font=Math.max(10,W*0.018)+'px "Courier New",monospace';
ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-12,H-10);

/* active power-up indicators at top */
var indY=14;var indX=W-10;
ctx.textAlign='right';ctx.font='bold '+Math.max(9,W*0.014)+'px "Courier New",monospace';
if(expandTimer>0){ctx.fillStyle='#4488ff';ctx.fillText('EXPAND '+Math.ceil(expandTimer)+'s',indX,indY);indY+=14;}
if(laserTimer>0){ctx.fillStyle='#ff4444';ctx.fillText('LASER '+Math.ceil(laserTimer)+'s',indX,indY);indY+=14;}
if(slowTimer>0){ctx.fillStyle='#ff8800';ctx.fillText('SLOW '+Math.ceil(slowTimer)+'s',indX,indY);indY+=14;}
}

/* ── title screen ───────────────────────────────────────────────── */
function drawTitle(dt){
ctx.fillStyle='#060620';ctx.fillRect(0,0,W,H);
drawStars();
titlePulse+=dt*3;

ctx.save();ctx.textAlign='center';

/* title */
ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
ctx.font='bold '+Math.round(W*0.075)+'px "Courier New",monospace';
ctx.fillStyle='#ff4444';
ctx.fillText('ARKANOID',W/2,H*0.22);
ctx.shadowBlur=0;

/* subtitle */
ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';
ctx.fillStyle='#ffaa00';
ctx.fillText('REVENGE OF DOH',W/2,H*0.30);

/* sample bricks */
var bx=W/2-((COLORS.length*32)/2),by=H*0.38;
for(var i=0;i<COLORS.length;i++){
ctx.fillStyle=COLORS[i];
ctx.beginPath();ctx.roundRect(bx+i*32,by,28,14,3);ctx.fill();}
/* silver/gold samples */
ctx.fillStyle='#c0c0c0';ctx.beginPath();ctx.roundRect(bx+COLORS.length*32+8,by,28,14,3);ctx.fill();
ctx.fillStyle='#ffd700';ctx.beginPath();ctx.roundRect(bx+COLORS.length*32+42,by,28,14,3);ctx.fill();

/* power-ups legend */
var pInfo=[
{c:'#4488ff',l:'E',n:'Expand'},{c:'#ff4444',l:'L',n:'Laser'},
{c:'#44cc44',l:'M',n:'Multi'},{c:'#ff8800',l:'S',n:'Slow'},
{c:'#ff66cc',l:'+',n:'Life'}];
ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
var lx=W/2-120,ly=H*0.50;
for(var i=0;i<pInfo.length;i++){
ctx.fillStyle=pInfo[i].c;
ctx.beginPath();ctx.arc(lx+i*55,ly,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.font='bold 8px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText(pInfo[i].l,lx+i*55,ly+3);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
ctx.fillText(pInfo[i].n,lx+i*55,ly+18);}

/* start prompt */
var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.textAlign='center';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.68);

/* controls */
ctx.fillStyle='#889';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('LEFT/RIGHT or A/D = Move Paddle',W/2,H*0.78);
ctx.fillText('SPACE = Launch Ball',W/2,H*0.83);

/* animated paddle at bottom */
var demoPx=W/2+Math.sin(titlePulse*0.8)*W*0.2;
var demoPy=H*0.92;
var dg=ctx.createLinearGradient(demoPx-50,demoPy,demoPx+50,demoPy);
dg.addColorStop(0,'#556688');dg.addColorStop(0.5,'#ccddff');dg.addColorStop(1,'#556688');
ctx.fillStyle=dg;
ctx.beginPath();ctx.roundRect(demoPx-50,demoPy-6,100,12,[5,5,3,3]);ctx.fill();

ctx.restore();}

/* ── game over screen ───────────────────────────────────────────── */
function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
ctx.save();ctx.textAlign='center';

ctx.shadowColor='#ff0000';ctx.shadowBlur=30;
ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';
ctx.fillStyle='#ff2222';
ctx.fillText('GAME OVER',W/2,H*0.25);
ctx.shadowBlur=0;

ctx.fillStyle='#ffcc00';
ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('SCORE: '+score,W/2,H*0.40);

ctx.fillStyle='#aaa';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('Level Reached: '+level,W/2,H*0.50);

var a=0.5+0.5*Math.sin(titlePulse*2);
ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.68);

ctx.restore();}

/* ── HUD ────────────────────────────────────────────────────────── */
function updateHUD(){
var se=document.getElementById('hud-score');if(se)se.textContent=score;
var sp=document.getElementById('hud-speed');if(sp)sp.textContent='LVL '+level;
var ti=document.getElementById('hud-time');if(ti)ti.textContent=lives+' HP';}

/* ── game loop ──────────────────────────────────────────────────── */
var lastTs=0;
function gameLoop(ts){
var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;

if(gameState==='title'){drawTitle(dt);}
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}

animId=requestAnimationFrame(gameLoop);}

/* ── input ──────────────────────────────────────────────────────── */
function onKey(e,down){
if(gameState==='playing'){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key===' '&&down)launchBall();}

if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();

if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}

var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

/* ── mobile binding ─────────────────────────────────────────────── */
function bindMobile(id,set){
var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

/* ── init / stop ────────────────────────────────────────────────── */
window.initArkanoid=function(){
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
initStars();

document.addEventListener('keydown',kd);
document.addEventListener('keyup',ku);

bindMobile('btn-left',function(v){if(gameState==='playing')keyLeft=v;});
bindMobile('btn-right',function(v){if(gameState==='playing')keyRight=v;});
bindMobile('btn-up',function(v){if(v&&gameState==='playing')launchBall();});

canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
canvas.addEventListener('mousemove',function(e){
if(gameState==='playing'){var r=canvas.getBoundingClientRect();paddle.x=e.clientX-r.left;}});

gameState='title';titlePulse=0;lastTs=performance.now();
animId=requestAnimationFrame(gameLoop);};

window.stopArkanoid=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);
document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=false;};
})();
