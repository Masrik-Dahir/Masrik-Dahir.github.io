// Adventure (Atari-style) — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.beginPath();this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);this.closePath();return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,gameTime=0,titlePulse=0;
var player,rooms,currentRoom,keys=[],castles=[],chalice=null,dragons=[],bat=null;
var inventory=null; // item player is carrying
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
var PLAYER_SPEED=180,DRAGON_SPEED=50,BAT_SPEED=80;
var particles=[],flashTimer=0;
var ROOM_COLS=5,ROOM_ROWS=3;
var winState=false;
var roomsVisited=0; // track exploration for difficulty

// Room definitions - 15 rooms in a 5x3 grid
var ROOM_DEFS=[];
var CELL_SIZE=0;

// Difficulty: dragons get faster and more aggressive over time
function getDiffMult(){
    var explored=Math.min(roomsVisited,14);
    if(explored<=4)return 0.7;
    if(explored<=9)return 1.0;
    return 1.0+(explored-9)*0.12;
}

function resize(){
var r=canvas.getBoundingClientRect();
canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);
W=canvas.width;H=canvas.height;
CELL_SIZE=Math.min(W,H)*0.03;
}

function buildRooms(){
ROOM_DEFS=[];
var colors=['#1a1a4e','#0a3a0a','#3a0a0a','#2a2a0a','#0a2a3a',
'#2a0a2a','#1a3a1a','#3a1a0a','#0a0a3a','#2a1a2a',
'#1a2a1a','#3a2a1a','#1a0a3a','#2a3a0a','#0a3a2a'];
for(var i=0;i<ROOM_COLS*ROOM_ROWS;i++){
var walls=[];
var numWalls=2+Math.floor(Math.random()*3);
for(var w=0;w<numWalls;w++){
var wx=0.15+Math.random()*0.6;
var wy=0.15+Math.random()*0.6;
var ww=0.05+Math.random()*0.2;
var wh=0.03+Math.random()*0.1;
if(Math.random()>0.5){var tmp=ww;ww=wh;wh=tmp;}
walls.push({x:wx,y:wy,w:ww,h:wh});
}
ROOM_DEFS.push({walls:walls,color:colors[i%colors.length]});
}
}

function resetGame(){
buildRooms();
currentRoom=7; // center room
player={x:W/2,y:H/2,w:14,h:20,invince:0,facing:1};
score=0;lives=3;gameTime=0;inventory=null;winState=false;flashTimer=0;
particles=[];roomsVisited=1;

keys=[
{room:1,x:0.5,y:0.4,color:'#ffcc00',id:'gold',collected:false},
{room:6,x:0.3,y:0.6,color:'#333333',id:'black',collected:false},
{room:13,x:0.7,y:0.3,color:'#ffffff',id:'white',collected:false}
];
castles=[
{room:3,x:0.5,y:0.5,color:'#ffcc00',id:'gold',open:false},
{room:10,x:0.5,y:0.5,color:'#333333',id:'black',open:false},
{room:14,x:0.5,y:0.5,color:'#ffffff',id:'white',open:false}
];
chalice={room:14,x:0.5,y:0.3,collected:false};

dragons=[
{room:4,x:0.5,y:0.5,color:'#ff3333',speed:DRAGON_SPEED,alive:true,
 vx:DRAGON_SPEED*(Math.random()>0.5?1:-1),vy:DRAGON_SPEED*(Math.random()>0.5?1:-1)},
{room:9,x:0.3,y:0.7,color:'#00cc66',speed:DRAGON_SPEED*0.8,alive:true,
 vx:DRAGON_SPEED*0.8,vy:-DRAGON_SPEED*0.8},
{room:12,x:0.6,y:0.4,color:'#cc66ff',speed:DRAGON_SPEED*0.7,alive:true,
 vx:-DRAGON_SPEED*0.7,vy:DRAGON_SPEED*0.7}
];

bat={room:5,x:0.5,y:0.5,vx:BAT_SPEED,vy:BAT_SPEED*0.5,carrying:null,timer:0};

gameState='playing';
}

function getRoomCoords(roomIdx){return{col:roomIdx%ROOM_COLS,row:Math.floor(roomIdx/ROOM_COLS)};}

function update(dt){
if(dt>0.1)dt=0.1;
gameTime+=dt;
if(player.invince>0)player.invince-=dt;
var dm=getDiffMult();

// Movement
var dx=0,dy=0;
if(keyLeft){dx=-PLAYER_SPEED*dt;player.facing=-1;}
if(keyRight){dx=PLAYER_SPEED*dt;player.facing=1;}
if(keyUp)dy=-PLAYER_SPEED*dt;
if(keyDown)dy=PLAYER_SPEED*dt;

var nx=player.x+dx,ny=player.y+dy;

// Room walls collision
var blocked=false;
var rd=ROOM_DEFS[currentRoom];
if(rd){
for(var i=0;i<rd.walls.length;i++){
var wl=rd.walls[i];
var wx=wl.x*W,wy=wl.y*H,ww=wl.w*W,wh=wl.h*H;
if(nx+player.w>wx&&nx<wx+ww&&ny+player.h>wy&&ny<wy+wh){blocked=true;break;}
}}
if(!blocked){player.x=nx;player.y=ny;}

// Room transitions
var rc=getRoomCoords(currentRoom);
var prevRoom=currentRoom;
if(player.x<-5&&rc.col>0){currentRoom--;player.x=W-20;}
if(player.x>W-5&&rc.col<ROOM_COLS-1){currentRoom++;player.x=15;}
if(player.y<-5&&rc.row>0){currentRoom-=ROOM_COLS;player.y=H-20;}
if(player.y>H-5&&rc.row<ROOM_ROWS-1){currentRoom+=ROOM_COLS;player.y=15;}
if(currentRoom!==prevRoom)roomsVisited++;
player.x=Math.max(0,Math.min(W-player.w,player.x));
player.y=Math.max(0,Math.min(H-player.h,player.y));

// Pickup items
for(var i=0;i<keys.length;i++){
var k=keys[i];
if(!k.collected&&k.room===currentRoom&&!inventory){
var kx=k.x*W,ky=k.y*H;
if(Math.abs(player.x-kx)<30&&Math.abs(player.y-ky)<30){
inventory={type:'key',id:k.id,color:k.color};k.collected=true;
score+=100;addParticles(kx,ky,k.color,12);
}}}

// Pickup chalice
if(chalice&&!chalice.collected&&chalice.room===currentRoom&&!inventory){
var cx2=chalice.x*W,cy2=chalice.y*H;
if(Math.abs(player.x-cx2)<30&&Math.abs(player.y-cy2)<30){
inventory={type:'chalice'};chalice.collected=true;
score+=500;addParticles(cx2,cy2,'#ffcc00',25);
}}

// Use key on castle
for(var i=0;i<castles.length;i++){
var c=castles[i];
if(!c.open&&c.room===currentRoom&&inventory&&inventory.type==='key'&&inventory.id===c.id){
var ccx=c.x*W,ccy=c.y*H;
if(Math.abs(player.x-ccx)<40&&Math.abs(player.y-ccy)<40){
c.open=true;inventory=null;score+=200;
addParticles(ccx,ccy,c.color,18);
}}}

// Win condition
if(inventory&&inventory.type==='chalice'&&currentRoom===7){
winState=true;score+=1000;gameState='gameover';
}

// Dragon AI - difficulty affects chase speed
for(var i=0;i<dragons.length;i++){
var d=dragons[i];
if(!d.alive)continue;
d.x+=d.vx*dt/W;d.y+=d.vy*dt/H;
if(d.x<0.05||d.x>0.9){d.vx*=-1;d.x=Math.max(0.05,Math.min(0.9,d.x));}
if(d.y<0.05||d.y>0.9){d.vy*=-1;d.y=Math.max(0.05,Math.min(0.9,d.y));}
if(d.room===currentRoom){
var ddx=(player.x-d.x*W),ddy=(player.y-d.y*H);
var dist=Math.sqrt(ddx*ddx+ddy*ddy);
if(dist>5){
var chaseSpeed=d.speed*0.3*dm; // difficulty scales chase speed
d.x+=ddx/dist*chaseSpeed*dt/W;
d.y+=ddy/dist*chaseSpeed*dt/H;
}
if(dist<25&&player.invince<=0){
lives--;player.invince=2;
addParticles(player.x,player.y,'#ff0000',18);
flashTimer=0.3;
player.x=W/2;player.y=H/2;
if(lives<=0)gameState='gameover';
}}}

// Bat AI
if(bat){
bat.timer+=dt;
bat.x+=bat.vx*dt/W;bat.y+=bat.vy*dt/H;
if(bat.x<0.05||bat.x>0.95){bat.vx*=-1;}
if(bat.y<0.05||bat.y>0.95){bat.vy*=-1;}
if(Math.random()<dt*0.5){bat.vx=BAT_SPEED*(Math.random()-0.5)*2/W*W;bat.vy=BAT_SPEED*(Math.random()-0.5)*2/H*H;}
if(Math.random()<dt*0.1){bat.room=Math.floor(Math.random()*ROOM_COLS*ROOM_ROWS);}
}

// Particles
for(var i=particles.length-1;i>=0;i--){
var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(p.life<=0)particles.splice(i,1);
}
if(flashTimer>0)flashTimer-=dt;
}

function addParticles(x,y,color,n){
for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,
life:0.4+Math.random()*0.4,color:color,size:2+Math.random()*3});
}

function drawRoom(){
var rd=ROOM_DEFS[currentRoom];
if(!rd)return;
// Room background with gradient
ctx.save();
var roomGrad=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
var baseColor=rd.color;
roomGrad.addColorStop(0,baseColor);
// Darken edges
var r2=parseInt(baseColor.slice(1,3),16);var g2=parseInt(baseColor.slice(3,5),16);var b2=parseInt(baseColor.slice(5,7),16);
var darker='rgb('+Math.max(0,r2-20)+','+Math.max(0,g2-20)+','+Math.max(0,b2-20)+')';
roomGrad.addColorStop(1,darker);
ctx.fillStyle=roomGrad;ctx.fillRect(0,0,W,H);

// Stone floor pattern
ctx.fillStyle='rgba(255,255,255,0.03)';
for(var fy=0;fy<H;fy+=30){
for(var fx=0;fx<W;fx+=40){
var offset=(Math.floor(fy/30)%2)*20;
ctx.fillRect(fx+offset,fy,38,28);
}}

// Room border with glow
ctx.save();
ctx.shadowColor='rgba(100,100,200,0.3)';ctx.shadowBlur=10;
ctx.strokeStyle='#666';ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);
ctx.restore();

// Walls with 3D gradient
for(var i=0;i<rd.walls.length;i++){
var wl=rd.walls[i];
var wx=wl.x*W,wy=wl.y*H,ww=wl.w*W,wh=wl.h*H;
var wallGrad=ctx.createLinearGradient(wx,wy,wx+ww,wy+wh);
wallGrad.addColorStop(0,'#777');wallGrad.addColorStop(0.3,'#999');wallGrad.addColorStop(0.7,'#888');wallGrad.addColorStop(1,'#555');
ctx.fillStyle=wallGrad;
ctx.fillRect(wx,wy,ww,wh);
// top edge highlight
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(wx,wy,ww,2);
// bottom shadow
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(wx,wy+wh-2,ww,2);
// brick pattern
ctx.strokeStyle='rgba(60,60,60,0.3)';ctx.lineWidth=0.5;
var brickH=Math.max(8,wh/3);
for(var by=wy;by<wy+wh;by+=brickH){
ctx.beginPath();ctx.moveTo(wx,by);ctx.lineTo(wx+ww,by);ctx.stroke();
var brickW=20;var brickOff=(Math.floor((by-wy)/brickH)%2)*brickW/2;
for(var bx=wx+brickOff;bx<wx+ww;bx+=brickW){
ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+brickH);ctx.stroke();
}}
}

// Door indicators with glow
var rc=getRoomCoords(currentRoom);
ctx.save();
ctx.shadowColor='rgba(255,255,200,0.4)';ctx.shadowBlur=8;
var doorGrad;
if(rc.col>0){doorGrad=ctx.createLinearGradient(0,H*0.35,8,H*0.35);doorGrad.addColorStop(0,'rgba(255,255,200,0.3)');doorGrad.addColorStop(1,'rgba(255,255,200,0.05)');ctx.fillStyle=doorGrad;ctx.fillRect(0,H*0.35,8,H*0.3);}
if(rc.col<ROOM_COLS-1){doorGrad=ctx.createLinearGradient(W-8,H*0.35,W,H*0.35);doorGrad.addColorStop(0,'rgba(255,255,200,0.05)');doorGrad.addColorStop(1,'rgba(255,255,200,0.3)');ctx.fillStyle=doorGrad;ctx.fillRect(W-8,H*0.35,8,H*0.3);}
if(rc.row>0){doorGrad=ctx.createLinearGradient(W*0.35,0,W*0.35,8);doorGrad.addColorStop(0,'rgba(255,255,200,0.3)');doorGrad.addColorStop(1,'rgba(255,255,200,0.05)');ctx.fillStyle=doorGrad;ctx.fillRect(W*0.35,0,W*0.3,8);}
if(rc.row<ROOM_ROWS-1){doorGrad=ctx.createLinearGradient(W*0.35,H-8,W*0.35,H);doorGrad.addColorStop(0,'rgba(255,255,200,0.05)');doorGrad.addColorStop(1,'rgba(255,255,200,0.3)');ctx.fillStyle=doorGrad;ctx.fillRect(W*0.35,H-8,W*0.3,8);}
ctx.restore();

// Room label
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px "Courier New",monospace';ctx.textAlign='left';
ctx.fillText('ROOM '+(currentRoom+1),8,15);
ctx.restore();
}

function drawKey(k){
if(k.collected||k.room!==currentRoom)return;
var x=k.x*W,y=k.y*H;
var bob=Math.sin(gameTime*3)*4;
ctx.save();ctx.translate(x,y+bob);
ctx.shadowColor=k.color;ctx.shadowBlur=10+Math.sin(gameTime*4)*3;
// Key with gradient
var keyGrad=ctx.createLinearGradient(-2,-14,6,-14);
keyGrad.addColorStop(0,k.color);
keyGrad.addColorStop(1,k.id==='black'?'#666':'#ffffff');
ctx.fillStyle=keyGrad;ctx.strokeStyle=k.color;ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,-5,8,0,Math.PI*2);ctx.stroke();
// inner circle
ctx.beginPath();ctx.arc(0,-5,5,0,Math.PI*2);ctx.stroke();
ctx.fillRect(-2,3,4,18);
ctx.fillRect(2,15,6,3);ctx.fillRect(2,10,5,3);
ctx.shadowBlur=0;ctx.restore();
}

function drawCastle(c){
if(c.room!==currentRoom)return;
var x=c.x*W,y=c.y*H,s=30;
ctx.save();ctx.translate(x,y);
// Castle with gradient and shadow
ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
var castleGrad=ctx.createLinearGradient(-s,-s-20,-s,s);
castleGrad.addColorStop(0,c.open?'#888':'#aaa');castleGrad.addColorStop(1,c.open?'#444':'#666');
ctx.fillStyle=castleGrad;
ctx.fillRect(-s,-s,s*2,s*2);
ctx.shadowBlur=0;ctx.shadowOffsetY=0;
// Colored trim
ctx.strokeStyle=c.color;ctx.lineWidth=2;ctx.strokeRect(-s,-s,s*2,s*2);
// Towers with gradient
var towerGrad=ctx.createLinearGradient(-s-5,-s-15,-s-5,0);
towerGrad.addColorStop(0,'#bbb');towerGrad.addColorStop(1,'#666');
ctx.fillStyle=towerGrad;
ctx.fillRect(-s-5,-s-15,12,15);ctx.fillRect(s-7,-s-15,12,15);
// Battlements
ctx.fillStyle='#999';
for(var i=0;i<4;i++){ctx.fillRect(-s-5+i*4,-s-20,3,5);}
for(var i=0;i<4;i++){ctx.fillRect(s-7+i*4,-s-20,3,5);}
// Tower tops with color
ctx.fillStyle=c.color;
ctx.beginPath();ctx.moveTo(-s-5,-s-20);ctx.lineTo(-s+1,-s-28);ctx.lineTo(-s+7,-s-20);ctx.fill();
ctx.beginPath();ctx.moveTo(s-7,-s-20);ctx.lineTo(s-1,-s-28);ctx.lineTo(s+5,-s-20);ctx.fill();
// Gate
if(c.open){
ctx.fillStyle='#000';ctx.fillRect(-8,0,16,s);
var gateGlow=ctx.createRadialGradient(0,s/2,0,0,s/2,15);
gateGlow.addColorStop(0,'rgba(255,200,0,0.4)');gateGlow.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=gateGlow;ctx.fillRect(-10,-2,20,s+4);
}else{
// Portcullis
ctx.fillStyle='#555';ctx.fillRect(-8,0,16,s);
for(var i=0;i<4;i++){ctx.fillStyle='#333';ctx.fillRect(-7+i*5,0,2,s);}
for(var i=0;i<3;i++){ctx.fillRect(-8,i*10,16,2);}
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(0,10,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#aa8800';ctx.beginPath();ctx.arc(0,10,2,0,Math.PI*2);ctx.fill();
}
// Windows
ctx.fillStyle='rgba(100,150,255,0.3)';
ctx.fillRect(-s+5,-s+5,8,8);ctx.fillRect(s-13,-s+5,8,8);
ctx.restore();
}

function drawChalice(){
if(!chalice||chalice.collected||chalice.room!==currentRoom)return;
var x=chalice.x*W,y=chalice.y*H;
var bob=Math.sin(gameTime*2)*4;
ctx.save();ctx.translate(x,y+bob);
ctx.shadowColor='#ffcc00';ctx.shadowBlur=18+Math.sin(gameTime*4)*8;
// Chalice with gradient
var chalGrad=ctx.createLinearGradient(-10,-18,10,-18);
chalGrad.addColorStop(0,'#ffdd44');chalGrad.addColorStop(0.5,'#ffcc00');chalGrad.addColorStop(1,'#cc9900');
ctx.fillStyle=chalGrad;ctx.strokeStyle='#ff9900';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-8,-18);ctx.lineTo(8,-18);ctx.lineTo(10,0);ctx.closePath();
ctx.fill();ctx.stroke();
// Gem
ctx.fillStyle='#ff3333';ctx.beginPath();ctx.arc(0,-9,3,0,Math.PI*2);ctx.fill();
// Stem
var stemGrad=ctx.createLinearGradient(-2,0,2,0);
stemGrad.addColorStop(0,'#cc9900');stemGrad.addColorStop(1,'#ffdd44');
ctx.fillStyle=stemGrad;ctx.fillRect(-2,0,4,8);
// Base
ctx.fillStyle='#ffcc00';ctx.fillRect(-8,8,16,3);
// Sparkle ring
ctx.strokeStyle='rgba(255,200,0,0.3)';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,-8,22+Math.sin(gameTime*3)*3,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;ctx.restore();
}

function drawDragon(d){
if(!d.alive||d.room!==currentRoom)return;
var x=d.x*W,y=d.y*H;
ctx.save();ctx.translate(x,y);
// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(0,15,20,5,0,0,Math.PI*2);ctx.fill();
// Dragon body with gradient
var r2=parseInt(d.color.slice(1,3),16);var g2=parseInt(d.color.slice(3,5),16);var b2=parseInt(d.color.slice(5,7),16);
var bodyGrad=ctx.createRadialGradient(-3,-3,2,0,0,18);
bodyGrad.addColorStop(0,'rgb('+Math.min(255,r2+50)+','+Math.min(255,g2+50)+','+Math.min(255,b2+50)+')');
bodyGrad.addColorStop(1,d.color);
ctx.fillStyle=bodyGrad;
ctx.beginPath();ctx.ellipse(0,0,18,12,0,0,Math.PI*2);ctx.fill();
// Scales pattern
ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=0.5;
for(var sc=-12;sc<12;sc+=6){ctx.beginPath();ctx.arc(sc,0,4,0,Math.PI);ctx.stroke();}
// Head with gradient
var headGrad=ctx.createRadialGradient(13,-7,1,15,-5,8);
headGrad.addColorStop(0,'rgb('+Math.min(255,r2+60)+','+Math.min(255,g2+60)+','+Math.min(255,b2+60)+')');
headGrad.addColorStop(1,d.color);
ctx.fillStyle=headGrad;
ctx.beginPath();ctx.arc(15,-5,8,0,Math.PI*2);ctx.fill();
// Horns
ctx.fillStyle='#ddd';
ctx.beginPath();ctx.moveTo(12,-12);ctx.lineTo(10,-20);ctx.lineTo(14,-14);ctx.fill();
ctx.beginPath();ctx.moveTo(18,-12);ctx.lineTo(20,-19);ctx.lineTo(16,-14);ctx.fill();
// Eye with glow
ctx.save();ctx.shadowColor='#fff';ctx.shadowBlur=3;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(18,-6,3.5,0,Math.PI*2);ctx.fill();
ctx.restore();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(19,-6,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff0';ctx.beginPath();ctx.arc(18.5,-6.5,0.8,0,Math.PI*2);ctx.fill();
// Mouth with fire
ctx.strokeStyle='#800';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(22,-3);ctx.lineTo(26,-1);ctx.stroke();
// Fire breath when chasing
if(d.room===currentRoom){
var fireLen=Math.sin(gameTime*8)*3+5;
ctx.fillStyle='rgba(255,100,0,0.5)';
ctx.beginPath();ctx.moveTo(25,-2);ctx.lineTo(30+fireLen,-4);ctx.lineTo(30+fireLen,2);ctx.closePath();ctx.fill();
ctx.fillStyle='rgba(255,200,0,0.3)';
ctx.beginPath();ctx.moveTo(25,-1);ctx.lineTo(28+fireLen*0.7,-3);ctx.lineTo(28+fireLen*0.7,1);ctx.closePath();ctx.fill();
}
// Tail with curve
ctx.strokeStyle=d.color;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(-18,0);ctx.bezierCurveTo(-25,-5,-30,-10+Math.sin(gameTime*5)*5,-24,-18);ctx.stroke();
// Tail tip
ctx.fillStyle=d.color;ctx.beginPath();ctx.moveTo(-24,-18);ctx.lineTo(-28,-22);ctx.lineTo(-20,-18);ctx.fill();
// Wings
ctx.fillStyle='rgba('+r2+','+g2+','+b2+',0.5)';
var wingY=-8+Math.sin(gameTime*6)*5;
ctx.beginPath();ctx.moveTo(-5,-10);ctx.quadraticCurveTo(-2,-28+wingY,8,-22+wingY);ctx.lineTo(10,-10);ctx.closePath();ctx.fill();
// Wing membrane lines
ctx.strokeStyle='rgba('+r2+','+g2+','+b2+',0.3)';ctx.lineWidth=0.5;
ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(2,-24+wingY);ctx.stroke();
ctx.beginPath();ctx.moveTo(4,-10);ctx.lineTo(6,-22+wingY);ctx.stroke();
ctx.restore();
}

function drawBat(){
if(!bat||bat.room!==currentRoom)return;
var x=bat.x*W,y=bat.y*H;
var wingFlap=Math.sin(gameTime*10)*8;
ctx.save();ctx.translate(x,y);
// Body with gradient
var batGrad=ctx.createRadialGradient(0,0,1,0,0,8);
batGrad.addColorStop(0,'#666');batGrad.addColorStop(1,'#333');
ctx.fillStyle=batGrad;
ctx.beginPath();ctx.ellipse(0,0,6,8,0,0,Math.PI*2);ctx.fill();
// Wings with membrane
ctx.fillStyle='#444';
ctx.beginPath();ctx.moveTo(-5,-2);ctx.quadraticCurveTo(-15,-8+wingFlap,-18,-5+wingFlap);
ctx.lineTo(-14,3);ctx.lineTo(-8,5);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(5,-2);ctx.quadraticCurveTo(15,-8-wingFlap,18,-5-wingFlap);
ctx.lineTo(14,3);ctx.lineTo(8,5);ctx.closePath();ctx.fill();
// Wing bones
ctx.strokeStyle='#555';ctx.lineWidth=0.5;
ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(-16,-6+wingFlap);ctx.stroke();
ctx.beginPath();ctx.moveTo(5,-2);ctx.lineTo(16,-6-wingFlap);ctx.stroke();
// Ears
ctx.fillStyle='#555';
ctx.beginPath();ctx.moveTo(-3,-7);ctx.lineTo(-5,-12);ctx.lineTo(-1,-8);ctx.fill();
ctx.beginPath();ctx.moveTo(3,-7);ctx.lineTo(5,-12);ctx.lineTo(1,-8);ctx.fill();
// Eyes with glow
ctx.save();ctx.shadowColor='#ff0000';ctx.shadowBlur=4;
ctx.fillStyle='#ff0000';ctx.fillRect(-3,-3,2,2);ctx.fillRect(1,-3,2,2);
ctx.restore();
ctx.restore();
}

function drawPlayer2(){
var x=player.x,y=player.y;
if(player.invince>0&&Math.sin(gameTime*15)>0)return;
ctx.save();ctx.translate(x,y);
var f=player.facing||1;
// Shadow
ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(0,12,10,4,0,0,Math.PI*2);ctx.fill();
// Body with gradient (tunic)
var tunicGrad=ctx.createLinearGradient(-7,-10,7,-10);
tunicGrad.addColorStop(0,'#ddaa00');tunicGrad.addColorStop(0.5,'#ffcc00');tunicGrad.addColorStop(1,'#ddaa00');
ctx.fillStyle=tunicGrad;
ctx.fillRect(-7,-10,14,20);
// Belt
ctx.fillStyle='#8B4513';ctx.fillRect(-7,-2,14,3);
ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(0,-0.5,1.5,0,Math.PI*2);ctx.fill();
// Head with gradient
var headGrad=ctx.createRadialGradient(-1*f,-17,1,0,-14,7);
headGrad.addColorStop(0,'#ffe8c0');headGrad.addColorStop(1,'#e8b878');
ctx.fillStyle=headGrad;
ctx.fillRect(-5,-15,10,8);
// Hair
ctx.fillStyle='#8B4513';ctx.fillRect(-5,-17,10,3);
// Eyes
ctx.fillStyle='#000';
ctx.fillRect(-3,-13,2,2);ctx.fillRect(1,-13,2,2);
// Eye whites
ctx.fillStyle='#fff';ctx.fillRect(-3,-13,1,1);ctx.fillRect(1,-13,1,1);
// Sword with metallic gradient
var swordGrad=ctx.createLinearGradient(8,-8,10,-8);
swordGrad.addColorStop(0,'#ddd');swordGrad.addColorStop(0.5,'#fff');swordGrad.addColorStop(1,'#bbb');
ctx.fillStyle=swordGrad;ctx.fillRect(8*f,-8,2,12);
ctx.fillStyle='#8B4513';ctx.fillRect(7*f,-10,4,3);
// Shield on other side
ctx.fillStyle='#4477cc';ctx.fillRect(-9*f,-8,3,10);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(-9*f,-8,1,5);
// Carrying item indicator
if(inventory){
ctx.save();
ctx.shadowColor=inventory.type==='chalice'?'#ffcc00':inventory.color;
ctx.shadowBlur=8;
ctx.fillStyle=inventory.type==='chalice'?'#ffcc00':inventory.color;
ctx.font='bold 12px monospace';ctx.textAlign='center';
ctx.fillText(inventory.type==='chalice'?'\u2606':'\u26B7',0,-24);
ctx.restore();
}
ctx.restore();
}

function drawMinimap(){
var mw=80,mh=48,mx=W-mw-10,my=10;
ctx.save();
ctx.fillStyle='rgba(0,0,0,0.7)';
if(ctx.roundRect){ctx.beginPath();ctx.roundRect(mx-3,my-3,mw+6,mh+6,4);ctx.fill();}
else{ctx.fillRect(mx-3,my-3,mw+6,mh+6);}
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(mx-3,my-3,mw+6,mh+6);
var cw=mw/ROOM_COLS,ch=mh/ROOM_ROWS;
for(var i=0;i<ROOM_COLS*ROOM_ROWS;i++){
var rc=getRoomCoords(i);
if(i===currentRoom){
ctx.fillStyle='rgba(255,200,0,0.7)';
}else{
ctx.fillStyle='rgba(100,100,100,0.4)';
}
ctx.fillRect(mx+rc.col*cw+1,my+rc.row*ch+1,cw-2,ch-2);
}
// Dragon indicators
for(var i=0;i<dragons.length;i++){
if(!dragons[i].alive)continue;
var drc=getRoomCoords(dragons[i].room);
ctx.fillStyle='#ff3333';
ctx.beginPath();ctx.arc(mx+drc.col*cw+cw/2,my+drc.row*ch+ch/2,2,0,Math.PI*2);ctx.fill();
}
// Player dot
var prc=getRoomCoords(currentRoom);
ctx.fillStyle='#ff0';
ctx.beginPath();ctx.arc(mx+prc.col*cw+cw/2,my+prc.row*ch+ch/2,2.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function render(){
drawRoom();
for(var i=0;i<castles.length;i++)drawCastle(castles[i]);
for(var i=0;i<keys.length;i++)drawKey(keys[i]);
drawChalice();
for(var i=0;i<dragons.length;i++)drawDragon(dragons[i]);
drawBat();
drawPlayer2();
drawMinimap();

// Particles with glow
for(var i=0;i<particles.length;i++){
var p=particles[i];ctx.globalAlpha=Math.max(0,p.life*2);
ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=4;
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
ctx.restore();
}
ctx.globalAlpha=1;

// Flash effect
if(flashTimer>0){ctx.fillStyle='rgba(255,0,0,'+(flashTimer*2)+')';ctx.fillRect(0,0,W,H);}

// Lives with glow
ctx.save();ctx.shadowColor='#ff4444';ctx.shadowBlur=4;
ctx.fillStyle='#ff6666';ctx.font='14px "Courier New",monospace';ctx.textAlign='left';
for(var i=0;i<lives;i++)ctx.fillText('\u2665',10+i*20,H-10);
ctx.restore();
// Inventory display
if(inventory){
ctx.save();
ctx.shadowColor=inventory.type==='chalice'?'#ffcc00':inventory.color;ctx.shadowBlur=6;
ctx.fillStyle=inventory.type==='chalice'?'#ffcc00':inventory.color;
ctx.font='12px "Courier New",monospace';ctx.textAlign='right';
ctx.fillText('CARRYING: '+(inventory.type==='chalice'?'CHALICE':inventory.id.toUpperCase()+' KEY'),W-95,H-10);
ctx.restore();
}
}

function drawTitle(dt){
titlePulse+=dt*3;
// Night sky gradient
var skyGrad=ctx.createLinearGradient(0,0,0,H);
skyGrad.addColorStop(0,'#050520');skyGrad.addColorStop(0.5,'#0a0a3e');skyGrad.addColorStop(1,'#101040');
ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);
// Stars with twinkling
for(var i=0;i<50;i++){
var twinkle=0.3+0.4*Math.sin(titlePulse*0.7+i*1.3);
ctx.fillStyle='rgba(255,255,255,'+twinkle+')';
var sx=(i*97+13)%W,sy=(i*53+7)%(H*0.5);
ctx.beginPath();ctx.arc(sx,sy,0.5+Math.random()*0.8,0,Math.PI*2);ctx.fill();
}
// Moon
ctx.save();
var moonGrad=ctx.createRadialGradient(W*0.8,H*0.1,5,W*0.8,H*0.1,25);
moonGrad.addColorStop(0,'#ffffee');moonGrad.addColorStop(0.5,'rgba(255,255,200,0.5)');moonGrad.addColorStop(1,'rgba(255,255,200,0)');
ctx.fillStyle=moonGrad;ctx.beginPath();ctx.arc(W*0.8,H*0.1,25,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffffdd';ctx.beginPath();ctx.arc(W*0.8,H*0.1,12,0,Math.PI*2);ctx.fill();
ctx.restore();
// Castle silhouette with gradient
var castleSil=ctx.createLinearGradient(W*0.3,H*0.4,W*0.3,H*0.8);
castleSil.addColorStop(0,'#1a1a4e');castleSil.addColorStop(1,'#0a0a2e');
ctx.fillStyle=castleSil;
ctx.fillRect(W*0.3,H*0.5,W*0.4,H*0.3);
ctx.fillRect(W*0.28,H*0.35,W*0.08,H*0.45);ctx.fillRect(W*0.64,H*0.35,W*0.08,H*0.45);
// Battlements
for(var i=0;i<8;i++){ctx.fillRect(W*0.3+i*W*0.05,H*0.47,W*0.03,H*0.05);}
// Castle windows glow
ctx.fillStyle='rgba(255,200,100,0.3)';
ctx.fillRect(W*0.4,H*0.55,W*0.04,H*0.04);ctx.fillRect(W*0.56,H*0.55,W*0.04,H*0.04);

ctx.save();ctx.textAlign='center';
ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('ADVENTURE',W/2,H*0.22);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.028)+'px "Courier New",monospace';ctx.fillStyle='#cc9944';
ctx.fillText('FIND THE ENCHANTED CHALICE',W/2,H*0.3);
var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.88);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
ctx.fillText('Arrow keys to move. Find keys to unlock castles.',W/2,H*0.93);
ctx.fillText('Retrieve the chalice and return to the start!',W/2,H*0.97);
ctx.restore();
}

function drawGameOver(){
ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
if(winState){
ctx.shadowColor='#ffcc00';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
ctx.fillText('VICTORY!',W/2,H*0.2);ctx.shadowBlur=0;
ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
ctx.fillText('You returned the Enchanted Chalice!',W/2,H*0.3);
}else{
ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
ctx.fillText('GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;
}
ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W*0.2,H*0.35,W*0.6,H*0.35,15);ctx.fill();
ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
ctx.fillText('FINAL SCORE',W/2,H*0.45);
ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
ctx.fillText(score.toLocaleString(),W/2,H*0.56);
ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
ctx.fillText('Time: '+gameTime.toFixed(1)+'s  Rooms explored: '+roomsVisited,W/2,H*0.66);
var a2=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a2+')';
ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.82);
ctx.restore();
}

function updateHUD(){
document.getElementById('hud-score').textContent=score;
document.getElementById('hud-speed').textContent='ROOM '+(currentRoom+1);
document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
if(gameState==='title')drawTitle(dt);
else if(gameState==='playing'){update(dt);render();updateHUD();}
else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
animId=requestAnimationFrame(gameLoop);}

function onKey(e,down){
if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keyUp=down;
if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keyDown=down;
if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);},ku=function(e){onKey(e,false);};

function bindMobile(id,set){var el=document.getElementById(id);if(!el)return;
el.addEventListener('touchstart',function(e){e.preventDefault();set(true);});
el.addEventListener('touchend',function(e){e.preventDefault();set(false);});
el.addEventListener('mousedown',function(){set(true);});
el.addEventListener('mouseup',function(){set(false);});}

window.initAdventure=function(){
canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
window.addEventListener('resize',resize);resize();
document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
bindMobile('btn-left',function(v){keyLeft=v;});bindMobile('btn-right',function(v){keyRight=v;});
bindMobile('btn-up',function(v){keyUp=v;});bindMobile('btn-down',function(v){keyDown=v;});
canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopAdventure=function(){
if(animId){cancelAnimationFrame(animId);animId=null;}
document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
window.removeEventListener('resize',resize);
gameState='title';keyLeft=keyRight=keyUp=keyDown=false;
};
})();
