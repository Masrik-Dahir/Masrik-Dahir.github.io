// Frogger — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}
var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
function diffMult(){return level<=2?0.8:(level<=5?1.0:1.0+(level-5)*0.1);}
var frog,lanes=[],particles=[],cs,COLS=13,ROWS=13;
var bestRow=0,frogs_home=[];
var HOME_SLOTS=[1,4,7,10,COLS-2];

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;
cs=Math.floor(Math.min(W/COLS,H/ROWS));}

function buildLanes(){
lanes=[];
// row 0: safe (start), rows 1-5: road, row 6: safe median, rows 7-11: river, row 12: home
// Road lanes (rows 1-5) — fewer cars, slower speeds for easy mode
var roadSpeeds=[30,40,25,45,35];
var roadDirs=[1,-1,1,-1,1];
var roadCounts=[2,2,3,2,2];
var roadLens=[2,2,2,2,2];
for(var i=0;i<5;i++){var objs=[];
var spacing=COLS*cs/roadCounts[i];
for(var j=0;j<roadCounts[i];j++){objs.push({x:j*spacing,w:roadLens[i]*cs,type:'car',color:['#ff3355','#ffaa22','#ff6644','#cc44ff','#44aaff'][i]});}
lanes[i+1]={type:'road',speed:(roadSpeeds[i]+level*3)*roadDirs[i]*diffMult(),objs:objs};}
// River lanes (rows 7-11) — more logs, longer logs for easy mode
var riverSpeeds=[20,30,18,35,25];
var riverDirs=[-1,1,-1,1,-1];
var riverCounts=[3,3,4,3,3];
var riverLens=[5,5,4,5,5];
for(var i=0;i<5;i++){var objs=[];
var spacing=COLS*cs/riverCounts[i];
for(var j=0;j<riverCounts[i];j++){objs.push({x:j*spacing,w:riverLens[i]*cs,type:'log'});}
lanes[i+7]={type:'river',speed:(riverSpeeds[i]+level*3)*riverDirs[i]*diffMult(),objs:objs};}
}

function resetGame(){
cs=Math.floor(Math.min(W/COLS,H/ROWS));
frog={x:Math.floor(COLS/2),y:0,px:0,py:0,jumping:false,jumpT:0};
frog.px=frog.x*cs;frog.py=(ROWS-1-frog.y)*cs;
score=0;lives=3;level=1;gameTime=0;bestRow=0;frogs_home=[];particles=[];
buildLanes();gameState='playing';}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.4+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function nearestHomeSlot(x){
var best=-1,bestDist=999;
for(var i=0;i<HOME_SLOTS.length;i++){var d=Math.abs(HOME_SLOTS[i]-x);if(d<bestDist){bestDist=d;best=HOME_SLOTS[i];}}
return bestDist<=1?best:-1;}

function moveFrog(dx,dy){
if(gameState!=='playing'||frog.jumping)return;
var nx=frog.x+dx,ny=frog.y+dy;
if(nx<0||nx>=COLS||ny<0)return;
if(ny>=ROWS-1){// home row — snap to nearest slot within 1 cell
var slot=nearestHomeSlot(nx);
if(slot>=0){
var alreadyHome=false;
for(var i=0;i<frogs_home.length;i++)if(frogs_home[i]===slot)alreadyHome=true;
if(!alreadyHome){
frogs_home.push(slot);score+=500;addParticles(slot*cs+cs/2,(ROWS-1-(ROWS-1))*cs+cs/2,'#00ff66',15);
if(frogs_home.length>=5){level++;frogs_home=[];buildLanes();score+=1000;}
}
frog.x=Math.floor(COLS/2);frog.y=0;frog.px=frog.x*cs;frog.py=(ROWS-1)*cs;bestRow=0;return;
}
// If not near any slot, just stay on row 11 (don't kill!)
return;}
frog.x=nx;frog.y=ny;frog.jumping=true;frog.jumpT=0;
if(ny>bestRow){bestRow=ny;score+=10;}}

function killFrog(){
lives--;addParticles(frog.px+cs/2,frog.py+cs/2,'#ff3355',20);
frog.x=Math.floor(COLS/2);frog.y=0;frog.px=frog.x*cs;frog.py=(ROWS-1)*cs;bestRow=0;
if(lives<=0)gameState='gameover';}

function update(dt){
if(dt>0.1)dt=0.1;gameTime+=dt;
// animate frog jump
if(frog.jumping){frog.jumpT+=dt*8;if(frog.jumpT>=1){frog.jumpT=1;frog.jumping=false;}
frog.px+=(frog.x*cs-frog.px)*frog.jumpT;
frog.py+=((ROWS-1-frog.y)*cs-frog.py)*frog.jumpT;}
else{frog.px+=(frog.x*cs-frog.px)*Math.min(1,dt*15);frog.py+=((ROWS-1-frog.y)*cs-frog.py)*Math.min(1,dt*15);}
// move lane objects (wrap at grid width, not canvas width)
var gw=COLS*cs;
for(var r in lanes){var lane=lanes[r];
for(var i=0;i<lane.objs.length;i++){var o=lane.objs[i];o.x+=lane.speed*dt;
if(lane.speed>0&&o.x>gw+cs)o.x=-o.w;
if(lane.speed<0&&o.x+o.w<-cs)o.x=gw;}}
// river: frog rides log — very forgiving overlap (just 30% of frog on log)
var row=frog.y;
if(row>=7&&row<=11&&lanes[row]&&!frog.jumping){
var lane=lanes[row],onLog=false;
var fc=frog.px+cs*0.5; // frog center
for(var i=0;i<lane.objs.length;i++){var o=lane.objs[i];
if(fc>o.x-cs*0.15&&fc<o.x+o.w+cs*0.15){onLog=true;frog.px+=lane.speed*dt;frog.x=Math.round(frog.px/cs);break;}}
if(!onLog)killFrog();}
// road: check car collision
if(row>=1&&row<=5&&lanes[row]&&!frog.jumping){
var lane=lanes[row];var fy=(ROWS-1-row)*cs;
for(var i=0;i<lane.objs.length;i++){var o=lane.objs[i];
if(frog.px+cs*0.8>o.x&&frog.px+cs*0.2<o.x+o.w){killFrog();break;}}}
// out of bounds (use grid width, not canvas width)
if(frog.px<-cs||frog.px>COLS*cs)killFrog();
// particles
for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function drawCar(x,sy,w,h,color,facingRight){
// car body
ctx.fillStyle=color;
var bx=x+2,by=sy+h*0.25,bw=w-4,bh=h*0.55;
ctx.beginPath();ctx.roundRect(bx,by,bw,bh,4);ctx.fill();
// roof / cabin
ctx.fillStyle=shadeColor(color,-30);
var rx=facingRight?bx+bw*0.3:bx+bw*0.15,rw=bw*0.45,ry=sy+4,rh=h*0.35;
ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,3);ctx.fill();
// windshield
ctx.fillStyle='rgba(150,220,255,0.6)';
var wx=facingRight?rx+rw-rw*0.4:rx,ww=rw*0.35;
ctx.fillRect(wx,ry+2,ww,rh-4);
// wheels
ctx.fillStyle='#222';
ctx.beginPath();ctx.arc(bx+bw*0.2,by+bh,h*0.14,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(bx+bw*0.8,by+bh,h*0.14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#666';
ctx.beginPath();ctx.arc(bx+bw*0.2,by+bh,h*0.06,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(bx+bw*0.8,by+bh,h*0.06,0,Math.PI*2);ctx.fill();
// headlights
ctx.fillStyle='#ffff88';
var fx=facingRight?bx+bw-3:bx+1;
ctx.fillRect(fx,by+3,3,4);ctx.fillRect(fx,by+bh-7,3,4);
// taillights
ctx.fillStyle='#ff3333';
var tx=facingRight?bx+1:bx+bw-3;
ctx.fillRect(tx,by+3,3,4);ctx.fillRect(tx,by+bh-7,3,4);}

function shadeColor(hex,pct){
var num=parseInt(hex.slice(1),16),r=(num>>16)+pct,g=((num>>8)&0xff)+pct,b=(num&0xff)+pct;
r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
return '#'+(r<<16|g<<8|b).toString(16).padStart(6,'0');}

function drawLog(x,sy,w,h){
// main trunk
ctx.fillStyle='#8B4513';
ctx.beginPath();ctx.roundRect(x+1,sy+h*0.15,w-2,h*0.7,h*0.3);ctx.fill();
// lighter wood center
ctx.fillStyle='#A0522D';
ctx.beginPath();ctx.roundRect(x+3,sy+h*0.25,w-6,h*0.5,h*0.2);ctx.fill();
// bark texture lines
ctx.strokeStyle='rgba(60,30,10,0.3)';ctx.lineWidth=1;
for(var k=0;k<Math.floor(w/(cs*0.6));k++){var lx=x+cs*0.3+k*cs*0.6;
ctx.beginPath();ctx.moveTo(lx,sy+h*0.2);ctx.lineTo(lx,sy+h*0.8);ctx.stroke();}
// end rings
ctx.strokeStyle='rgba(60,30,10,0.4)';ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(x+h*0.3,sy+h*0.5,h*0.2,h*0.28,0,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.ellipse(x+w-h*0.3,sy+h*0.5,h*0.2,h*0.28,0,0,Math.PI*2);ctx.stroke();}

function render(){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
var ox=(W-COLS*cs)/2;

// === HOME ROW (row 12) — dark water with lily pads ===
ctx.fillStyle='#001144';ctx.fillRect(ox,0,COLS*cs,cs);
for(var si=0;si<HOME_SLOTS.length;si++){var sx=ox+HOME_SLOTS[si]*cs+cs/2,sy=cs/2;
var filled=false;for(var fi=0;fi<frogs_home.length;fi++)if(frogs_home[fi]===HOME_SLOTS[si])filled=true;
// lily pad
ctx.fillStyle=filled?'#00cc44':'#006622';ctx.beginPath();ctx.ellipse(sx,sy,cs*0.42,cs*0.36,0,0,Math.PI*2);ctx.fill();
// pad veins
ctx.strokeStyle=filled?'#00ff88':'#004411';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-cs*0.3,sy-cs*0.2);ctx.stroke();
ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+cs*0.3,sy-cs*0.2);ctx.stroke();
ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy+cs*0.3);ctx.stroke();
if(filled){ctx.fillStyle='#00ff66';ctx.beginPath();ctx.ellipse(sx,sy,cs*0.2,cs*0.16,0,0,Math.PI*2);ctx.fill();}
if(!filled){var glow=0.3+0.2*Math.sin(gameTime*3+si);ctx.strokeStyle='rgba(0,255,100,'+glow+')';ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(sx,sy,cs*0.42,cs*0.36,0,0,Math.PI*2);ctx.stroke();}}

// === RIVER (rows 7-11) — blue water with animated waves ===
for(var r=7;r<=11;r++){var ry=(ROWS-1-r)*cs;
// water gradient
var wg=ctx.createLinearGradient(ox,ry,ox,ry+cs);wg.addColorStop(0,'#000088');wg.addColorStop(0.5,'#0000aa');wg.addColorStop(1,'#000088');
ctx.fillStyle=wg;ctx.fillRect(ox,ry,COLS*cs,cs);
// animated wave ripples
ctx.strokeStyle='rgba(100,150,255,0.15)';ctx.lineWidth=1;
for(var wx=0;wx<COLS*cs;wx+=cs*0.7){
ctx.beginPath();var wy=ry+cs*0.3+Math.sin(gameTime*2+wx*0.03+r)*3;
ctx.moveTo(ox+wx,wy);ctx.quadraticCurveTo(ox+wx+cs*0.2,wy-3,ox+wx+cs*0.35,wy);ctx.stroke();}}
// river zone label (shows first 8 seconds)
if(gameTime<8){ctx.save();ctx.textAlign='center';ctx.globalAlpha=Math.max(0,1-gameTime/8);
ctx.fillStyle='#88bbff';ctx.font='bold '+Math.max(9,Math.round(cs*0.4))+'px "Courier New",monospace';
var riverMidY=(ROWS-1-9)*cs+cs/2;
ctx.fillText('RIDE THE LOGS!',ox+COLS*cs/2,riverMidY);
ctx.font=Math.max(7,Math.round(cs*0.28))+'px "Courier New",monospace';
ctx.fillText('(water = death)',ox+COLS*cs/2,riverMidY+cs*0.5);
ctx.restore();}

// === SAFE ZONES ===
// start zone (row 0)
ctx.fillStyle='#1a2a1a';ctx.fillRect(ox,(ROWS-1)*cs,COLS*cs,cs);
ctx.fillStyle='#335533';ctx.font=Math.max(7,Math.round(cs*0.3))+'px "Courier New",monospace';ctx.textAlign='center';
ctx.fillText('START',ox+COLS*cs/2,(ROWS-1)*cs+cs*0.65);
// median (row 6)
ctx.fillStyle='#1a2a1a';ctx.fillRect(ox,(ROWS-1-6)*cs,COLS*cs,cs);
ctx.fillStyle='#335533';ctx.font=Math.max(7,Math.round(cs*0.3))+'px "Courier New",monospace';
ctx.fillText('SAFE ZONE',ox+COLS*cs/2,(ROWS-1-6)*cs+cs*0.65);

// === ROAD (rows 1-5) — dark asphalt with lane markings ===
for(var r=1;r<=5;r++){var ry=(ROWS-1-r)*cs;
ctx.fillStyle='#333';ctx.fillRect(ox,ry,COLS*cs,cs);
// dashed lane lines
ctx.strokeStyle='rgba(255,255,200,0.15)';ctx.lineWidth=1;ctx.setLineDash([cs*0.25,cs*0.4]);
ctx.beginPath();ctx.moveTo(ox,ry+cs/2);ctx.lineTo(ox+COLS*cs,ry+cs/2);ctx.stroke();ctx.setLineDash([]);}
// road edge lines
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(ox,(ROWS-1-1)*cs+cs);ctx.lineTo(ox+COLS*cs,(ROWS-1-1)*cs+cs);ctx.stroke();
ctx.beginPath();ctx.moveTo(ox,(ROWS-1-5)*cs);ctx.lineTo(ox+COLS*cs,(ROWS-1-5)*cs);ctx.stroke();

// === LANE OBJECTS (offset by ox to match grid centering) ===
for(var r in lanes){var lane=lanes[r],sy=(ROWS-1-r)*cs;
for(var i=0;i<lane.objs.length;i++){var o=lane.objs[i];
if(lane.type==='road'){
drawCar(ox+o.x,sy,o.w,cs,o.color,lane.speed>0);
}else{
drawLog(ox+o.x,sy,o.w,cs);}}}

// === FROG ===
var fx=ox+frog.px+cs/2,fy=frog.py+cs/2;
var jumpScale=frog.jumping?1+Math.sin(frog.jumpT*Math.PI)*0.2:1;
ctx.save();ctx.translate(fx,fy);ctx.scale(jumpScale,jumpScale);
// body
ctx.fillStyle='#00cc44';ctx.shadowColor='#00ff66';ctx.shadowBlur=8;
ctx.beginPath();ctx.ellipse(0,0,cs*0.38,cs*0.32,0,0,Math.PI*2);ctx.fill();
// belly
ctx.fillStyle='#44ee66';ctx.beginPath();ctx.ellipse(0,cs*0.05,cs*0.2,cs*0.15,0,0,Math.PI*2);ctx.fill();
// eyes (bigger, more frog-like)
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-cs*0.18,-cs*0.22,cs*0.12,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cs*0.18,-cs*0.22,cs*0.12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(-cs*0.18,-cs*0.22,cs*0.05,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cs*0.18,-cs*0.22,cs*0.05,0,Math.PI*2);ctx.fill();
// hind legs
ctx.fillStyle='#00aa33';
ctx.beginPath();ctx.ellipse(-cs*0.35,cs*0.12,cs*0.12,cs*0.08,0.4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(cs*0.35,cs*0.12,cs*0.12,cs*0.08,-0.4,0,Math.PI*2);ctx.fill();
// front legs
ctx.beginPath();ctx.ellipse(-cs*0.28,-cs*0.08,cs*0.07,cs*0.05,0.3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(cs*0.28,-cs*0.08,cs*0.07,cs*0.05,-0.3,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();

// === PARTICLES ===
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
ctx.globalAlpha=1;

// === HUD ===
// lives as mini frogs
for(var i=0;i<lives;i++){ctx.fillStyle='#00cc44';ctx.beginPath();ctx.ellipse(ox+16+i*22,H-13,7,5.5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ox+14+i*22,H-16,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ox+18+i*22,H-16,2,0,Math.PI*2);ctx.fill();}
ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-8);
// frogs home counter
ctx.textAlign='left';ctx.fillStyle='#88ff88';ctx.fillText(frogs_home.length+'/5 HOME',ox+8,16);
}

function drawTitle(dt){
ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
ctx.save();ctx.textAlign='center';
// Title
ctx.shadowColor='#00ff66';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#00ff66';ctx.fillText('FROGGER',W/2,H*0.15);ctx.shadowBlur=0;
// Step-by-step instructions with icons
var fs=Math.max(10,Math.round(W*0.02));
ctx.font='bold '+fs+'px "Courier New",monospace';
// Step 1 — road
ctx.fillStyle='#ffcc00';ctx.fillText('1. HOP across the ROAD (dodge cars!)',W/2,H*0.27);
// mini car icon
ctx.fillStyle='#ff3355';ctx.beginPath();ctx.roundRect(W/2-60,H*0.29,30,12,3);ctx.fill();
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(W/2-52,H*0.29+12,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(W/2-38,H*0.29+12,3,0,Math.PI*2);ctx.fill();
// Step 2 — river
ctx.fillStyle='#66aaff';ctx.fillText('2. RIDE LOGS across the river',W/2,H*0.39);
ctx.font=fs+'px "Courier New",monospace';
ctx.fillStyle='#ff4444';ctx.fillText('(water = instant death! Stay on logs!)',W/2,H*0.44);
// mini log icon
ctx.fillStyle='#8B4513';ctx.beginPath();ctx.roundRect(W/2-25,H*0.46,50,10,5);ctx.fill();
ctx.fillStyle='#A0522D';ctx.beginPath();ctx.roundRect(W/2-22,H*0.462,44,6,3);ctx.fill();
// Step 3 — lily pads
ctx.font='bold '+fs+'px "Courier New",monospace';
ctx.fillStyle='#00ff66';ctx.fillText('3. Land on all 5 LILY PADS at the top!',W/2,H*0.56);
// mini lily pad icons
for(var i=0;i<5;i++){ctx.fillStyle='#006622';ctx.beginPath();ctx.ellipse(W/2-40+i*20,H*0.59,7,5,0,0,Math.PI*2);ctx.fill();}
// Controls
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
ctx.fillText('Arrow keys / WASD to hop',W/2,H*0.68);
// Start prompt
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.78);
// Animated frog hopping
var fx=W/2+Math.sin(titlePulse*1.5)*30,fy=H*0.88;
ctx.fillStyle='#00cc44';ctx.shadowColor='#00ff66';ctx.shadowBlur=8;
ctx.beginPath();ctx.ellipse(fx,fy,14,11,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#44ee66';ctx.beginPath();ctx.ellipse(fx,fy+3,7,5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(fx-5,fy-6,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(fx+5,fy-6,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(fx-5,fy-6,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(fx+5,fy-6,2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;ctx.restore();}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
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
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')moveFrog(-1,0);
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')moveFrog(1,0);
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')moveFrog(0,1);
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')moveFrog(0,-1);
if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',function(){fn();});}

window.initFrogger=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);
bindMobile('btn-left',function(){moveFrog(-1,0);});
bindMobile('btn-right',function(){moveFrog(1,0);});
bindMobile('btn-up',function(){moveFrog(0,1);});
bindMobile('btn-down',function(){moveFrog(0,-1);});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);};

window.stopFrogger=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);gameState='title';};
})();
