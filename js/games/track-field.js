// Track & Field — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,titlePulse=0,gameTime=0;
var keys={},lastMash=0,mashCount=0,mashDecay=0;
var particles=[];

// Events: 100m dash, long jump, javelin throw
var EVENT_NAMES=['100M DASH','LONG JUMP','JAVELIN THROW'];
var currentEvent=0;
var eventState='ready'; // ready, running, result
var eventTimer=0,eventResultTimer=0;

// 100m dash state
var dashPos=0,dashSpeed=0,dashDistance=100,dashFinishTime=0;
var dashOpponentPos=0,dashOpponentSpeed=0;
var dashLanes=[];

// Long jump state
var ljRunPos=0,ljSpeed=0,ljJumping=false,ljAngle=0,ljHeight=0;
var ljDistance=0,ljBestDistance=0,ljAttempt=0,ljMaxAttempts=3;
var ljAngleDir=1,ljAngleSpeed=2.0,ljShowAngle=false,ljFoul=false;
var ljAirTime=0;

// Javelin state
var javRunPos=0,javSpeed=0,javThrowing=false,javAngle=45;
var javDistance=0,javBestDistance=0,javAttempt=0,javMaxAttempts=3;
var javAngleDir=1,javAngleSpeed=60,javShowAngle=false;
var javFlightTime=0,javFlightX=0,javFlightY=0,javFlightVX=0,javFlightVY=0;
var javInFlight=false;

// Stadium colors
var TRACK_COLOR='#cc5533';
var GRASS_COLOR='#44aa44';
var LINE_COLOR='#ffffff';
var SKY_TOP='#1a0a3a';
var SKY_BOT='#334488';

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
}

function addParticles(px,py,color,count){
    for(var i=0;i<count;i++){
        particles.push({
            x:px,y:py,
            vx:(Math.random()-0.5)*200,
            vy:(Math.random()-0.5)*200,
            life:0.3+Math.random()*0.4,
            color:color,
            size:2+Math.random()*4
        });
    }
}

function updateParticles(dt){
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawParticles(){
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        var a=Math.max(0,p.life/0.7);
        ctx.globalAlpha=a;
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;
}

// ─── STADIUM BACKGROUND ──────────────────────────
function drawStadium(){
    // Sky gradient
    var grad=ctx.createLinearGradient(0,0,0,H*0.4);
    grad.addColorStop(0,SKY_TOP);
    grad.addColorStop(1,SKY_BOT);
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,W,H*0.4);

    // Stars
    var seed=42;
    for(var i=0;i<60;i++){
        seed=(seed*1103515245+12345)&0x7fffffff;
        var sx=(seed%1000)/1000*W;
        seed=(seed*1103515245+12345)&0x7fffffff;
        var sy=(seed%1000)/1000*H*0.35;
        var brightness=0.3+((seed%100)/100)*0.7;
        ctx.fillStyle='rgba(255,255,255,'+brightness+')';
        ctx.fillRect(sx,sy,1.5,1.5);
    }

    // Stands/crowd
    var standGrad=ctx.createLinearGradient(0,H*0.2,0,H*0.45);
    standGrad.addColorStop(0,'#443366');
    standGrad.addColorStop(1,'#665588');
    ctx.fillStyle=standGrad;
    ctx.fillRect(0,H*0.2,W,H*0.25);

    // Crowd dots
    for(var i=0;i<120;i++){
        seed=(seed*1103515245+12345)&0x7fffffff;
        var cx2=(seed%1000)/1000*W;
        seed=(seed*1103515245+12345)&0x7fffffff;
        var cy2=H*0.22+(seed%1000)/1000*H*0.2;
        var colors=['#ff6666','#66aaff','#ffcc44','#66ff66','#ff88cc','#ffffff'];
        ctx.fillStyle=colors[i%colors.length];
        ctx.fillRect(cx2,cy2,3,4);
    }

    // Track surface
    ctx.fillStyle=TRACK_COLOR;
    ctx.fillRect(0,H*0.45,W,H*0.55);

    // Grass infield
    ctx.fillStyle=GRASS_COLOR;
    ctx.fillRect(W*0.05,H*0.48,W*0.9,H*0.08);
}

// ─── DRAW ATHLETE ────────────────────────────────
function drawAthlete(x,y,color,frame,scale){
    scale=scale||1;
    var s=Math.min(W,H)*0.03*scale;
    ctx.save();
    ctx.translate(x,y);

    // Head
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(0,-s*2.5,s*0.5,0,Math.PI*2);ctx.fill();

    // Body
    ctx.fillStyle=color;
    ctx.fillRect(-s*0.3,-s*2,s*0.6,s*1.2);

    // Legs (animated)
    var legAngle=Math.sin(frame*10)*0.5;
    ctx.strokeStyle='#ffcc88';ctx.lineWidth=s*0.25;
    ctx.beginPath();
    ctx.moveTo(0,-s*0.8);
    ctx.lineTo(-s*0.4*Math.sin(legAngle),-s*0.8+s*Math.abs(Math.cos(legAngle)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-s*0.8);
    ctx.lineTo(s*0.4*Math.sin(legAngle),-s*0.8+s*Math.abs(Math.cos(-legAngle)));
    ctx.stroke();

    // Arms
    ctx.strokeStyle=color;ctx.lineWidth=s*0.2;
    ctx.beginPath();
    ctx.moveTo(0,-s*1.8);
    ctx.lineTo(s*0.5*Math.sin(-legAngle),-s*1.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-s*1.8);
    ctx.lineTo(-s*0.5*Math.sin(-legAngle),-s*1.3);
    ctx.stroke();

    ctx.restore();
}

// ─── 100M DASH ───────────────────────────────────
function initDashEvent(){
    eventState='ready';eventTimer=0;
    dashPos=0;dashSpeed=0;dashFinishTime=0;
    dashOpponentPos=0;dashOpponentSpeed=0;
    mashCount=0;mashDecay=0;
    dashLanes=[];
    // Create 4 lanes (player + 3 opponents)
    for(var i=0;i<4;i++){
        dashLanes.push({pos:0,speed:0,color:i===0?'#ff4444':['#4488ff','#44ff44','#ffaa44'][i-1],finished:false,time:0});
    }
}

function updateDash(dt){
    if(eventState==='ready'){
        eventTimer+=dt;
        if(eventTimer>2.0)eventState='running';
        return;
    }
    if(eventState==='result'){
        eventResultTimer+=dt;
        return;
    }

    // Decay mash energy
    mashDecay+=dt;
    if(mashDecay>0.15){mashDecay=0;mashCount=Math.max(0,mashCount-1);}

    // Player speed based on mash rate
    dashLanes[0].speed=Math.min(mashCount*1.8,18);
    dashLanes[0].pos+=dashLanes[0].speed*dt;

    // AI opponents (easy - slower than player potential)
    for(var i=1;i<dashLanes.length;i++){
        var targetSpeed=8+i*1.2+Math.sin(gameTime*3+i)*1.5;
        dashLanes[i].speed+=(targetSpeed-dashLanes[i].speed)*dt*2;
        dashLanes[i].pos+=dashLanes[i].speed*dt;
    }

    // Check finish
    var allDone=true;
    for(var i=0;i<dashLanes.length;i++){
        if(dashLanes[i].pos>=dashDistance&&!dashLanes[i].finished){
            dashLanes[i].finished=true;
            dashLanes[i].time=eventTimer;
            if(i===0){
                addParticles(W*0.85,H*0.6+i*H*0.08,'#ffcc00',20);
            }
        }
        if(!dashLanes[i].finished)allDone=false;
    }

    if(dashLanes[0].finished||eventTimer>15){
        // Calculate placement
        var placement=1;
        for(var i=1;i<dashLanes.length;i++){
            if(dashLanes[i].finished&&dashLanes[i].time<dashLanes[0].time)placement++;
        }
        if(!dashLanes[0].finished)placement=4;

        var pts=[300,200,100,50][placement-1];
        score+=pts;
        eventState='result';eventResultTimer=0;
        dashFinishTime=dashLanes[0].time||eventTimer;
    }

    eventTimer+=dt;
}

function drawDash(){
    drawStadium();

    // Draw lanes
    var laneY=H*0.55;
    var laneH=H*0.08;
    var startX=W*0.1;
    var trackLen=W*0.8;

    for(var i=0;i<dashLanes.length;i++){
        var y=laneY+i*laneH;

        // Lane background
        ctx.fillStyle=i%2===0?'#bb4422':'#cc5533';
        ctx.fillRect(startX,y,trackLen,laneH-2);

        // Lane lines
        ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(startX,y);ctx.lineTo(startX+trackLen,y);ctx.stroke();

        // Lane number
        ctx.fillStyle='#fff';ctx.font='bold '+Math.round(laneH*0.4)+'px "Courier New",monospace';
        ctx.textAlign='left';
        ctx.fillText(''+(i+1),startX-W*0.04,y+laneH*0.65);

        // Athlete position
        var frac=Math.min(dashLanes[i].pos/dashDistance,1);
        var ax=startX+frac*trackLen;

        drawAthlete(ax,y+laneH*0.9,dashLanes[i].color,
            dashLanes[i].speed>0?gameTime:0,0.7);

        // Dust particles when running
        if(dashLanes[i].speed>3&&!dashLanes[i].finished&&Math.random()<0.3){
            addParticles(ax-10,y+laneH*0.9,'#cc9966',1);
        }
    }

    // Finish line
    var finishX=startX+trackLen;
    ctx.strokeStyle='#ffffff';ctx.lineWidth=3;
    ctx.setLineDash([6,6]);
    ctx.beginPath();ctx.moveTo(finishX,laneY-10);ctx.lineTo(finishX,laneY+4*laneH+10);ctx.stroke();
    ctx.setLineDash([]);

    // Ready/Set/Go
    if(eventState==='ready'){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        if(eventTimer<1.0)ctx.fillText('READY',W/2,H*0.35);
        else if(eventTimer<1.5)ctx.fillText('SET',W/2,H*0.35);
        else ctx.fillText('GO!',W/2,H*0.35);
        ctx.restore();
    }

    // Mash indicator
    if(eventState==='running'){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
        ctx.fillText('MASH LEFT/RIGHT OR TAP FAST!',W/2,H*0.42);
        // Speed meter
        var meterW=W*0.2,meterH=10;
        var meterX=W/2-meterW/2,meterY=H*0.43;
        ctx.fillStyle='#333';ctx.fillRect(meterX,meterY,meterW,meterH);
        var fillFrac=Math.min(mashCount/10,1);
        var mGrad=ctx.createLinearGradient(meterX,0,meterX+meterW,0);
        mGrad.addColorStop(0,'#44ff44');mGrad.addColorStop(1,'#ff4444');
        ctx.fillStyle=mGrad;
        ctx.fillRect(meterX,meterY,meterW*fillFrac,meterH);
        ctx.restore();
    }

    // Result
    if(eventState==='result'){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(W*0.2,H*0.15,W*0.6,H*0.25);
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('TIME: '+dashFinishTime.toFixed(2)+'s',W/2,H*0.26);

        var placement=1;
        for(var i=1;i<dashLanes.length;i++){
            if(dashLanes[i].finished&&dashLanes[i].time<(dashLanes[0].time||999))placement++;
        }
        var placeStr=['1ST','2ND','3RD','4TH'][placement-1];
        ctx.fillStyle=placement===1?'#ffcc00':'#ffffff';
        ctx.fillText('PLACE: '+placeStr,W/2,H*0.34);
        ctx.restore();
    }
}

// ─── LONG JUMP ───────────────────────────────────
function initLongJumpEvent(){
    eventState='running';eventTimer=0;
    ljRunPos=0;ljSpeed=0;ljJumping=false;ljAngle=0;
    ljHeight=0;ljDistance=0;ljBestDistance=0;ljAttempt=0;
    ljFoul=false;ljAirTime=0;ljShowAngle=false;
    mashCount=0;mashDecay=0;
}

function resetLongJumpAttempt(){
    ljRunPos=0;ljSpeed=0;ljJumping=false;ljAngle=0;
    ljHeight=0;ljFoul=false;ljAirTime=0;ljShowAngle=false;
    mashCount=0;mashDecay=0;
}

function updateLongJump(dt){
    if(eventState==='result'){eventResultTimer+=dt;return;}

    eventTimer+=dt;

    // Decay mash energy
    mashDecay+=dt;
    if(mashDecay>0.15){mashDecay=0;mashCount=Math.max(0,mashCount-1);}

    if(!ljJumping&&!ljShowAngle){
        // Run-up phase
        ljSpeed=Math.min(mashCount*1.5,15);
        ljRunPos+=ljSpeed*dt;

        // Auto-show angle meter when close to line
        if(ljRunPos>=8){
            ljShowAngle=true;
            ljAngle=20;
        }
    }else if(ljShowAngle&&!ljJumping){
        // Angle selection phase
        ljAngle+=ljAngleDir*ljAngleSpeed*60*dt;
        if(ljAngle>=70){ljAngle=70;ljAngleDir=-1;}
        if(ljAngle<=10){ljAngle=10;ljAngleDir=1;}
    }else if(ljJumping){
        // Flight phase
        ljAirTime+=dt;
        var rad=ljAngle*Math.PI/180;
        var v=ljSpeed*3;
        ljDistance=v*Math.cos(rad)*ljAirTime;
        ljHeight=v*Math.sin(rad)*ljAirTime-0.5*20*ljAirTime*ljAirTime;

        if(ljHeight<=0&&ljAirTime>0.1){
            // Landed
            ljJumping=false;
            if(ljRunPos>10)ljFoul=true;
            if(!ljFoul&&ljDistance>ljBestDistance)ljBestDistance=ljDistance;

            addParticles(W*0.5,H*0.75,'#ccaa66',15);

            ljAttempt++;
            if(ljAttempt>=ljMaxAttempts){
                score+=Math.round(ljBestDistance*10);
                eventState='result';eventResultTimer=0;
            }else{
                // Reset for next attempt after brief pause
                setTimeout(function(){resetLongJumpAttempt();},1500);
            }
        }
    }
}

function drawLongJump(){
    drawStadium();

    var runwayY=H*0.78;
    var runwayStartX=W*0.05;
    var runwayLen=W*0.9;

    // Runway
    ctx.fillStyle='#aa4422';
    ctx.fillRect(runwayStartX,runwayY-5,runwayLen,10);

    // Foul line
    var foulLineX=runwayStartX+runwayLen*0.35;
    ctx.strokeStyle='#ffffff';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(foulLineX,runwayY-15);ctx.lineTo(foulLineX,runwayY+15);ctx.stroke();

    // Sand pit
    var sandX=foulLineX+20;
    ctx.fillStyle='#ddbb66';
    ctx.fillRect(sandX,runwayY-20,runwayLen*0.5,40);
    ctx.strokeStyle='#aa8844';ctx.lineWidth=1;
    ctx.strokeRect(sandX,runwayY-20,runwayLen*0.5,40);

    // Athlete
    var frac=Math.min(ljRunPos/10,1);
    var athleteX=runwayStartX+frac*(foulLineX-runwayStartX);
    var athleteY=runwayY;
    if(ljJumping){
        athleteX=foulLineX+ljDistance*2;
        athleteY=runwayY-ljHeight*4;
    }
    drawAthlete(athleteX,athleteY,'#ff4444',ljSpeed>0?gameTime:0);

    // Distance markers
    if(ljJumping||ljDistance>0){
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
        ctx.textAlign='center';
        ctx.fillText(ljDistance.toFixed(1)+'m',W/2,H*0.5);
    }

    // Angle indicator
    if(ljShowAngle&&!ljJumping){
        ctx.save();
        ctx.translate(foulLineX,runwayY);
        ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
        var angLen=50;
        var rad=ljAngle*Math.PI/180;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(-rad)*angLen,-Math.sin(rad)*angLen);
        ctx.stroke();
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
        ctx.textAlign='left';
        ctx.fillText(Math.round(ljAngle)+'°',angLen*0.7,-20);
        ctx.restore();
    }

    // HUD
    ctx.save();ctx.textAlign='left';
    ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('ATTEMPT: '+(ljAttempt+1)+'/'+ljMaxAttempts,W*0.05,H*0.15);
    ctx.fillText('BEST: '+ljBestDistance.toFixed(1)+'m',W*0.05,H*0.20);
    ctx.restore();

    // Instructions
    if(!ljJumping&&!ljShowAngle){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('MASH LEFT/RIGHT TO BUILD SPEED!',W/2,H*0.42);
        ctx.restore();
    }else if(ljShowAngle&&!ljJumping){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('PRESS SPACE/UP OR TAP TO JUMP!',W/2,H*0.42);
        ctx.restore();
    }

    if(ljFoul&&!ljJumping){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ff3333';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillText('FOUL!',W/2,H*0.55);
        ctx.restore();
    }

    // Result
    if(eventState==='result'){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(W*0.2,H*0.2,W*0.6,H*0.2);
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('BEST JUMP: '+ljBestDistance.toFixed(1)+'m',W/2,H*0.32);
        ctx.restore();
    }
}

// ─── JAVELIN THROW ───────────────────────────────
function initJavelinEvent(){
    eventState='running';eventTimer=0;
    javRunPos=0;javSpeed=0;javThrowing=false;javAngle=45;
    javDistance=0;javBestDistance=0;javAttempt=0;
    javShowAngle=false;javInFlight=false;
    javFlightTime=0;javFlightX=0;javFlightY=0;
    mashCount=0;mashDecay=0;
}

function resetJavelinAttempt(){
    javRunPos=0;javSpeed=0;javThrowing=false;javAngle=45;
    javDistance=0;javShowAngle=false;javInFlight=false;
    javFlightTime=0;javFlightX=0;javFlightY=0;
    mashCount=0;mashDecay=0;
}

function updateJavelin(dt){
    if(eventState==='result'){eventResultTimer+=dt;return;}

    eventTimer+=dt;
    mashDecay+=dt;
    if(mashDecay>0.15){mashDecay=0;mashCount=Math.max(0,mashCount-1);}

    if(!javShowAngle&&!javInFlight){
        // Run-up phase
        javSpeed=Math.min(mashCount*1.5,15);
        javRunPos+=javSpeed*dt;
        if(javRunPos>=8){
            javShowAngle=true;
            javAngle=20;
            javAngleDir=1;
        }
    }else if(javShowAngle&&!javInFlight){
        // Angle selection
        javAngle+=javAngleDir*javAngleSpeed*dt;
        if(javAngle>=75){javAngle=75;javAngleDir=-1;}
        if(javAngle<=10){javAngle=10;javAngleDir=1;}
    }else if(javInFlight){
        // Flight
        javFlightTime+=dt;
        var rad=javAngle*Math.PI/180;
        var v=javSpeed*5;
        javFlightX=v*Math.cos(rad)*javFlightTime;
        javFlightY=v*Math.sin(rad)*javFlightTime-0.5*15*javFlightTime*javFlightTime;
        javDistance=javFlightX*0.5;

        if(javFlightY<=0&&javFlightTime>0.2){
            // Landed
            javInFlight=false;
            if(javDistance>javBestDistance)javBestDistance=javDistance;
            addParticles(W*0.5,H*0.7,'#ccaa66',15);

            javAttempt++;
            if(javAttempt>=javMaxAttempts){
                score+=Math.round(javBestDistance*8);
                eventState='result';eventResultTimer=0;
            }else{
                setTimeout(function(){resetJavelinAttempt();},1500);
            }
        }
    }
}

function drawJavelin(){
    drawStadium();

    var groundY=H*0.78;
    var runwayStartX=W*0.05;
    var runwayLen=W*0.9;

    // Runway
    ctx.fillStyle='#aa4422';
    ctx.fillRect(runwayStartX,groundY-3,runwayLen*0.4,6);

    // Field
    ctx.fillStyle='#338833';
    ctx.fillRect(runwayStartX+runwayLen*0.4,groundY-30,runwayLen*0.6,60);

    // Distance markers
    for(var d=10;d<=100;d+=10){
        var mx=runwayStartX+runwayLen*0.4+d*runwayLen*0.005;
        if(mx<W){
            ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(mx,groundY-25);ctx.lineTo(mx,groundY+25);ctx.stroke();
            ctx.fillStyle='#aaa';ctx.font='10px "Courier New",monospace';ctx.textAlign='center';
            ctx.fillText(d+'m',mx,groundY+35);
        }
    }

    // Athlete
    var frac=Math.min(javRunPos/8,1);
    var throwLineX=runwayStartX+runwayLen*0.35;
    var athleteX=runwayStartX+frac*(throwLineX-runwayStartX);
    drawAthlete(athleteX,groundY,'#44aaff',javSpeed>0?gameTime:0);

    // Javelin in flight
    if(javInFlight){
        var jx=throwLineX+javFlightX*2;
        var jy=groundY-javFlightY*4;
        var flightRad=Math.atan2(-javFlightY+15*javFlightTime,javFlightX>0?1:0.1);
        ctx.save();
        ctx.translate(jx,jy);
        ctx.rotate(-flightRad*0.3);
        ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.stroke();
        // Tip
        ctx.fillStyle='#cccccc';
        ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(12,-3);ctx.lineTo(12,3);ctx.closePath();ctx.fill();
        ctx.restore();
    }

    // Angle indicator
    if(javShowAngle&&!javInFlight){
        ctx.save();
        ctx.translate(throwLineX,groundY);
        ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
        var angLen=60;
        var rad=javAngle*Math.PI/180;
        ctx.beginPath();ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(-rad)*angLen,-Math.sin(rad)*angLen);
        ctx.stroke();
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
        ctx.textAlign='left';
        ctx.fillText(Math.round(javAngle)+'°',angLen*0.5,-30);
        ctx.restore();
    }

    // HUD
    ctx.save();ctx.textAlign='left';
    ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('ATTEMPT: '+(javAttempt+1)+'/'+javMaxAttempts,W*0.05,H*0.15);
    ctx.fillText('BEST: '+javBestDistance.toFixed(1)+'m',W*0.05,H*0.20);
    if(javInFlight||javDistance>0){
        ctx.fillStyle='#ffcc00';
        ctx.fillText('DISTANCE: '+javDistance.toFixed(1)+'m',W*0.05,H*0.25);
    }
    ctx.restore();

    // Instructions
    if(!javShowAngle&&!javInFlight){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('MASH LEFT/RIGHT TO BUILD SPEED!',W/2,H*0.42);
        ctx.restore();
    }else if(javShowAngle&&!javInFlight){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('PRESS SPACE/UP OR TAP TO THROW!',W/2,H*0.42);
        ctx.restore();
    }

    // Result
    if(eventState==='result'){
        ctx.save();ctx.textAlign='center';
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(W*0.2,H*0.2,W*0.6,H*0.2);
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('BEST THROW: '+javBestDistance.toFixed(1)+'m',W/2,H*0.32);
        ctx.restore();
    }
}

// ─── EVENT MANAGEMENT ────────────────────────────
function initCurrentEvent(){
    if(currentEvent===0)initDashEvent();
    else if(currentEvent===1)initLongJumpEvent();
    else if(currentEvent===2)initJavelinEvent();
}

function updateCurrentEvent(dt){
    if(currentEvent===0)updateDash(dt);
    else if(currentEvent===1)updateLongJump(dt);
    else if(currentEvent===2)updateJavelin(dt);

    // Advance to next event after result shown
    if(eventState==='result'&&eventResultTimer>3.0){
        currentEvent++;
        if(currentEvent>=EVENT_NAMES.length){
            gameState='gameover';
        }else{
            initCurrentEvent();
        }
    }
}

function drawCurrentEvent(){
    if(currentEvent===0)drawDash();
    else if(currentEvent===1)drawLongJump();
    else if(currentEvent===2)drawJavelin();

    // Event name banner
    ctx.save();ctx.textAlign='center';
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,W,H*0.08);
    ctx.shadowColor='#00ccff';ctx.shadowBlur=10;
    ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
    ctx.fillStyle='#00ccff';
    ctx.fillText('EVENT '+(currentEvent+1)+': '+EVENT_NAMES[currentEvent],W/2,H*0.055);
    ctx.restore();

    drawParticles();
}

function handleMash(){
    mashCount=Math.min(mashCount+1,15);
    mashDecay=0;
}

function handleAction(){
    if(currentEvent===1){
        // Long jump - initiate jump
        if(ljShowAngle&&!ljJumping){
            ljJumping=true;ljAirTime=0;ljDistance=0;ljHeight=0;
        }
    }else if(currentEvent===2){
        // Javelin - initiate throw
        if(javShowAngle&&!javInFlight){
            javInFlight=true;javFlightTime=0;javFlightX=0;javFlightY=0;
        }
    }
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    ctx.fillStyle='#0a0a2a';ctx.fillRect(0,0,W,H);

    // Stadium bg
    drawStadium();
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);

    ctx.save();ctx.textAlign='center';

    // Title
    ctx.shadowColor='#ff4444';ctx.shadowBlur=30;
    var ts=Math.round(W*0.06);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.25*(1-scale));
    ctx.fillStyle='#ff4444';ctx.fillText('TRACK & FIELD',W/2,H*0.25);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    // Events list
    var fs=Math.round(W*0.02);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';ctx.fillText('3 EVENTS:',W/2,H*0.40);
    ctx.fillStyle='#ff8844';ctx.fillText('100M DASH  |  LONG JUMP  |  JAVELIN THROW',W/2,H*0.46);

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Mash LEFT/RIGHT to run, SPACE/UP to jump/throw',W/2,H*0.56);

    // Animated runner
    var rx=W/2+Math.sin(titlePulse*3)*60;
    drawAthlete(rx,H*0.70,'#ff4444',titlePulse*4);

    // Start prompt
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);

    ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';ctx.fillText('FINAL RESULTS',W/2,H*0.20);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
    ctx.fillText('TOTAL SCORE: '+score,W/2,H*0.38);

    // Trophy
    ctx.fillStyle='#ffcc00';
    ctx.beginPath();
    ctx.moveTo(W/2-20,H*0.50);ctx.lineTo(W/2+20,H*0.50);
    ctx.lineTo(W/2+15,H*0.56);ctx.lineTo(W/2-15,H*0.56);
    ctx.closePath();ctx.fill();
    ctx.fillRect(W/2-5,H*0.56,10,15);
    ctx.fillRect(W/2-15,H*0.56+15,30,5);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.80);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='EVT '+(currentEvent+1)+'/3';
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=EVENT_NAMES[currentEvent]||'DONE';
}

function resetGame(){
    score=0;currentEvent=0;gameTime=0;particles=[];
    initCurrentEvent();
    gameState='playing';
}

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;
    gameTime+=dt;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){updateCurrentEvent(dt);updateParticles(dt);drawCurrentEvent();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;drawGameOver();}

    animId=requestAnimationFrame(gameLoop);
}

// ─── INPUT ───────────────────────────────────────
function onKey(e,down){
    if(gameState==='playing'&&down){
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'||
           e.key==='ArrowRight'||e.key==='d'||e.key==='D'){
            handleMash();
        }
        if(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){
            handleAction();
        }
    }
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=down;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=down;
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keys.up=down;
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keys.down=down;
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn){
    var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
    el.addEventListener('mousedown',function(){fn();});
}

// ─── INIT / STOP ─────────────────────────────────
window.initTrackField=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    bindMobile('btn-left',function(){handleMash();});
    bindMobile('btn-right',function(){handleMash();});
    bindMobile('btn-up',function(){handleAction();});
    bindMobile('btn-down',function(){});
    canvas.addEventListener('click',function(){
        if(gameState==='playing'){
            handleMash();
            if(ljShowAngle||javShowAngle)handleAction();
        }else{resetGame();}
    });
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopTrackField=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';keys={};
};
})();
