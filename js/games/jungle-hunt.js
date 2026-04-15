// Jungle Hunt — Full Game (Multi-stage adventure)
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var keys={left:false,right:false,up:false,down:false,jump:false};
var particles=[];
var stage=0; // 0=vines, 1=river, 2=boulders, 3=rescue
var stageTimer=0,stageTransition=false,transitionTimer=0;
var STAGE_NAMES=['VINE SWINGING','CROCODILE RIVER','BOULDER DODGE','RESCUE'];

// Player state
var player;
var GRAVITY=800,JUMP_VEL=-400,PLAYER_SPEED=200;

// Stage-specific objects
var vines=[],currentVine=-1,swingAngle=0,swingDir=1;
var crocs=[],waterLevel=0,oxygenTimer=0,oxygen=100;
var boulders=[],boulderTimer=0;
var captive,rescueComplete=false;

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
}

function addParticles(px,py,color,count){
    for(var i=0;i<count;i++){
        particles.push({x:px,y:py,
            vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,
            life:0.3+Math.random()*0.4,color:color,
            size:2+Math.random()*4});
    }
}

function updateParticles(dt){
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;
        p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawParticles(){
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life/0.7);
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;
}

// ─── JUNGLE BACKGROUND ──────────────────────────
function drawJungleBg(showWater){
    // Sky gradient
    var skyGrad=ctx.createLinearGradient(0,0,0,H*0.4);
    skyGrad.addColorStop(0,'#1a3a1a');skyGrad.addColorStop(1,'#2a5a2a');
    ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);

    // Background trees
    for(var i=0;i<10;i++){
        var tx=i*W/10+(Math.sin(i*7)*W*0.03);
        ctx.fillStyle='#1a4a1a';
        ctx.fillRect(tx,H*0.1,8,H*0.6);
        ctx.beginPath();ctx.arc(tx+4,H*0.1,25+Math.sin(i*3)*10,0,Math.PI*2);ctx.fill();
    }

    // Tree canopy top
    ctx.fillStyle='#0d3a0d';
    for(var i=0;i<20;i++){
        ctx.beginPath();
        ctx.arc(i*W/20+15,30+Math.sin(i*2)*15,30+Math.sin(i*5)*10,0,Math.PI*2);
        ctx.fill();
    }

    if(showWater){
        // River
        var waterY=H*0.65;
        var waterGrad=ctx.createLinearGradient(0,waterY,0,H);
        waterGrad.addColorStop(0,'#224488');waterGrad.addColorStop(1,'#112244');
        ctx.fillStyle=waterGrad;ctx.fillRect(0,waterY,W,H-waterY);

        // Water ripples
        ctx.strokeStyle='rgba(100,180,255,0.3)';ctx.lineWidth=1;
        for(var wy=waterY;wy<H;wy+=15){
            ctx.beginPath();
            for(var wx=0;wx<W;wx+=5){
                var wave=Math.sin((wx+gameTime*40)/30)*3;
                if(wx===0)ctx.moveTo(wx,wy+wave);
                else ctx.lineTo(wx,wy+wave);
            }
            ctx.stroke();
        }
    }else{
        // Ground
        ctx.fillStyle='#3a6622';
        ctx.fillRect(0,H*0.8,W,H*0.2);
        ctx.fillStyle='#4a7722';
        ctx.fillRect(0,H*0.8,W,5);
    }
}

function drawPlayer(x,y,swimming){
    ctx.save();
    ctx.translate(x,y);
    var s=Math.min(W,H)*0.025;

    // Pith helmet
    ctx.fillStyle='#ddcc88';
    ctx.beginPath();ctx.arc(0,-s*2.8,s*0.6,0,Math.PI*2);ctx.fill();
    ctx.fillRect(-s*0.8,-s*2.3,s*1.6,s*0.15);

    // Face
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(0,-s*2.2,s*0.45,0,Math.PI*2);ctx.fill();

    // Body
    ctx.fillStyle='#887744';
    ctx.fillRect(-s*0.35,-s*1.7,s*0.7,s*1.2);

    if(!swimming){
        // Legs
        var legAngle=Math.sin(gameTime*8)*0.4;
        ctx.strokeStyle='#887744';ctx.lineWidth=s*0.25;
        ctx.beginPath();ctx.moveTo(0,-s*0.5);
        ctx.lineTo(-s*0.3*Math.sin(legAngle),s*Math.abs(Math.cos(legAngle))*0.7);
        ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,-s*0.5);
        ctx.lineTo(s*0.3*Math.sin(legAngle),s*Math.abs(Math.cos(-legAngle))*0.7);
        ctx.stroke();
    }else{
        // Swimming arms
        var armAngle=Math.sin(gameTime*6)*0.6;
        ctx.strokeStyle='#ffcc88';ctx.lineWidth=s*0.2;
        ctx.beginPath();ctx.moveTo(0,-s*1.3);
        ctx.lineTo(s*Math.cos(armAngle),-s*1.3+s*0.5*Math.sin(armAngle));
        ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,-s*1.3);
        ctx.lineTo(-s*Math.cos(-armAngle),-s*1.3+s*0.5*Math.sin(-armAngle));
        ctx.stroke();
    }

    ctx.restore();
}

// ─── STAGE 0: VINE SWINGING ─────────────────────
function initVineStage(){
    vines=[];
    var vineCount=8;
    for(var i=0;i<vineCount;i++){
        vines.push({
            x:W*0.1+i*(W*0.8/(vineCount-1)),
            topY:0,
            length:H*0.25+Math.random()*H*0.15,
            angle:Math.random()*0.3-0.15,
            speed:1.5+Math.random()*0.5,
            phase:Math.random()*Math.PI*2
        });
    }
    currentVine=0;
    player={x:vines[0].x,y:vines[0].length,vy:0,onVine:true,jumping:false};
}

function updateVineStage(dt){
    // Swing vines
    for(var i=0;i<vines.length;i++){
        vines[i].angle=Math.sin(gameTime*vines[i].speed+vines[i].phase)*0.6;
    }

    if(player.onVine&&currentVine>=0){
        var v=vines[currentVine];
        swingAngle=v.angle;
        player.x=v.x+Math.sin(swingAngle)*v.length;
        player.y=v.topY+Math.cos(swingAngle)*v.length;
    }else{
        // Falling/jumping
        player.vy+=GRAVITY*dt;
        player.x+=player.vx*dt;
        player.y+=player.vy*dt;

        // Check if near next vine
        for(var i=0;i<vines.length;i++){
            if(i===currentVine)continue;
            var vn=vines[i];
            var tipX=vn.x+Math.sin(vn.angle)*vn.length;
            var tipY=vn.topY+Math.cos(vn.angle)*vn.length;
            var dx=Math.abs(player.x-tipX);
            var dy=Math.abs(player.y-tipY);
            if(dx<40&&dy<40){
                currentVine=i;
                player.onVine=true;
                player.vy=0;
                player.vx=0;
                score+=50;
                addParticles(player.x,player.y,'#88ff88',5);
                break;
            }
        }

        // Fell too far
        if(player.y>H){
            killPlayer();
            if(gameState==='playing')initVineStage();
        }

        // Reached right side - advance stage
        if(player.x>W*0.95){
            advanceStage();
        }
    }

    // Jump/release from vine
    if(keys.jump&&player.onVine){
        keys.jump=false;
        player.onVine=false;
        var v2=vines[currentVine];
        // Launch with swing momentum
        player.vx=Math.cos(swingAngle)*v2.speed*120;
        player.vy=-200;
    }
}

function drawVineStage(){
    drawJungleBg(false);

    // Draw vines
    for(var i=0;i<vines.length;i++){
        var v=vines[i];
        var tipX=v.x+Math.sin(v.angle)*v.length;
        var tipY=v.topY+Math.cos(v.angle)*v.length;

        ctx.strokeStyle='#557733';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(v.x,v.topY);ctx.lineTo(tipX,tipY);ctx.stroke();

        // Leaves at top
        ctx.fillStyle='#44aa44';
        ctx.beginPath();ctx.arc(v.x,v.topY+5,8,0,Math.PI*2);ctx.fill();

        // Highlight current/next vine
        if(i===currentVine||i===currentVine+1){
            ctx.fillStyle='rgba(255,255,0,0.3)';
            ctx.beginPath();ctx.arc(tipX,tipY,20,0,Math.PI*2);ctx.fill();
        }
    }

    drawPlayer(player.x,player.y,false);

    // Stage instruction
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('PRESS SPACE/UP TO JUMP TO NEXT VINE!',W/2,H*0.95);
}

// ─── STAGE 1: CROCODILE RIVER ───────────────────
function initRiverStage(){
    crocs=[];
    oxygen=100;
    var crocCount=6;
    for(var i=0;i<crocCount;i++){
        crocs.push({
            x:-50-i*120,
            y:H*0.68+Math.random()*H*0.2,
            speed:40+Math.random()*40,
            dir:Math.random()<0.5?1:-1,
            length:60+Math.random()*30,
            jawOpen:false,jawTimer:Math.random()*3
        });
    }
    player={x:W*0.05,y:H*0.72,vx:0,vy:0,swimming:true};
}

function updateRiverStage(dt){
    // Player swimming
    var swimSpeed=120;
    if(keys.left)player.x-=swimSpeed*dt;
    if(keys.right)player.x+=swimSpeed*dt;
    if(keys.up)player.y-=swimSpeed*dt;
    if(keys.down)player.y+=swimSpeed*dt;

    // Clamp to water area
    player.x=Math.max(10,Math.min(W-10,player.x));
    player.y=Math.max(H*0.66,Math.min(H-20,player.y));

    // Oxygen
    oxygenTimer+=dt;
    if(oxygenTimer>0.4){oxygenTimer=0;oxygen-=1;}
    if(player.y<H*0.68)oxygen=Math.min(100,oxygen+3); // Surface restores oxygen
    if(oxygen<=0){killPlayer();if(gameState==='playing')initRiverStage();}

    // Update crocs
    for(var i=0;i<crocs.length;i++){
        var c=crocs[i];
        c.x+=c.speed*c.dir*dt;
        if(c.x>W+100){c.x=-100;c.dir=1;}
        if(c.x<-100){c.x=W+100;c.dir=-1;}

        c.jawTimer-=dt;
        if(c.jawTimer<=0){c.jawOpen=!c.jawOpen;c.jawTimer=1+Math.random()*2;}

        // Collision
        if(player.x>c.x-10&&player.x<c.x+c.length+10&&
           Math.abs(player.y-c.y)<20){
            // Player can stab croc when jaw is open (pressing space)
            if(keys.jump&&c.jawOpen){
                keys.jump=false;
                crocs.splice(i,1);i--;
                score+=200;
                addParticles(player.x,player.y,'#ff8844',10);
            }else if(!keys.jump){
                killPlayer();
                if(gameState==='playing')initRiverStage();
                return;
            }
        }
    }

    // Reach right side
    if(player.x>W*0.92){
        advanceStage();
    }
}

function drawRiverStage(){
    drawJungleBg(true);

    // Draw crocs
    for(var i=0;i<crocs.length;i++){
        var c=crocs[i];
        ctx.save();
        ctx.translate(c.x,c.y);
        if(c.dir<0)ctx.scale(-1,1);

        // Body
        ctx.fillStyle='#557722';
        ctx.beginPath();
        ctx.ellipse(c.length/2,0,c.length/2,8,0,0,Math.PI*2);
        ctx.fill();

        // Head
        ctx.fillStyle='#668833';
        ctx.beginPath();
        ctx.ellipse(c.length+10,0,15,6,0,0,Math.PI*2);
        ctx.fill();

        // Jaw
        if(c.jawOpen){
            ctx.fillStyle='#883322';
            ctx.beginPath();
            ctx.moveTo(c.length+5,0);
            ctx.lineTo(c.length+25,8);
            ctx.lineTo(c.length+25,-8);
            ctx.closePath();ctx.fill();
            // Teeth
            ctx.fillStyle='#ffffff';
            for(var t=0;t<4;t++){
                ctx.fillRect(c.length+8+t*4,-6,2,4);
                ctx.fillRect(c.length+8+t*4,2,2,4);
            }
        }

        // Eye
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();ctx.arc(c.length+8,-4,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#000';
        ctx.beginPath();ctx.arc(c.length+8,-4,1.5,0,Math.PI*2);ctx.fill();

        ctx.restore();
    }

    drawPlayer(player.x,player.y,true);

    // Oxygen bar
    var oxyW=W*0.25,oxyH=10;
    var oxyX=W/2-oxyW/2,oxyY=10;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(oxyX-2,oxyY-2,oxyW+4,oxyH+4);
    var oxyGrad=ctx.createLinearGradient(oxyX,0,oxyX+oxyW,0);
    oxyGrad.addColorStop(0,'#ff4444');oxyGrad.addColorStop(0.5,'#ffcc00');oxyGrad.addColorStop(1,'#4488ff');
    ctx.fillStyle=oxyGrad;
    ctx.fillRect(oxyX,oxyY,oxyW*oxygen/100,oxyH);
    ctx.strokeStyle='#667788';ctx.lineWidth=1;ctx.strokeRect(oxyX,oxyY,oxyW,oxyH);
    ctx.fillStyle='#fff';ctx.font='bold 9px "Courier New",monospace';ctx.textAlign='center';
    ctx.fillText('O2: '+Math.round(oxygen)+'%',W/2,oxyY+oxyH-1);

    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('SWIM RIGHT! SPACE TO STAB OPEN-JAWED CROCS!',W/2,H*0.62);
}

// ─── STAGE 2: BOULDER DODGE ─────────────────────
function initBoulderStage(){
    boulders=[];
    boulderTimer=0;
    player={x:W*0.1,y:H*0.75,vx:0,vy:0,onGround:true,jumping:false};
}

function updateBoulderStage(dt){
    // Auto-scroll player right
    player.x+=60*dt;

    if(keys.left)player.x-=PLAYER_SPEED*0.5*dt;
    if(keys.right)player.x+=PLAYER_SPEED*0.5*dt;

    // Jump
    if(keys.jump&&player.onGround){
        keys.jump=false;
        player.vy=JUMP_VEL;
        player.onGround=false;
    }

    // Gravity
    if(!player.onGround){
        player.vy+=GRAVITY*dt;
        player.y+=player.vy*dt;
        if(player.y>=H*0.75){
            player.y=H*0.75;
            player.vy=0;
            player.onGround=true;
        }
    }

    player.x=Math.max(10,Math.min(W-20,player.x));

    // Spawn boulders
    boulderTimer+=dt;
    if(boulderTimer>1.5){
        boulderTimer=0;
        var boulderY=H*0.3+Math.random()*H*0.1;
        boulders.push({
            x:W+30,y:boulderY,
            vx:-120-Math.random()*60,
            vy:0,
            radius:15+Math.random()*10,
            bouncing:true,
            rotation:0
        });
    }

    // Update boulders
    for(var i=boulders.length-1;i>=0;i--){
        var b=boulders[i];
        b.x+=b.vx*dt;
        b.vy+=GRAVITY*0.8*dt;
        b.y+=b.vy*dt;
        b.rotation+=b.vx*dt*0.02;

        // Bounce off ground
        if(b.y+b.radius>H*0.8){
            b.y=H*0.8-b.radius;
            b.vy=-Math.abs(b.vy)*0.6;
            if(Math.abs(b.vy)<30)b.vy=0;
        }

        // Remove offscreen
        if(b.x<-50){boulders.splice(i,1);continue;}

        // Collision with player
        var dx=player.x-b.x;
        var dy=player.y-b.y;
        if(Math.sqrt(dx*dx+dy*dy)<b.radius+15){
            killPlayer();
            if(gameState==='playing')initBoulderStage();
            return;
        }
    }

    // Reached right side
    if(player.x>W*0.9){
        advanceStage();
    }
}

function drawBoulderStage(){
    drawJungleBg(false);

    // Slope/hill
    ctx.fillStyle='#5a7733';
    ctx.beginPath();
    ctx.moveTo(W,H*0.5);
    ctx.lineTo(W,H*0.8);
    ctx.lineTo(0,H*0.8);
    ctx.lineTo(0,H*0.75);
    ctx.closePath();
    ctx.fill();

    // Draw boulders
    for(var i=0;i<boulders.length;i++){
        var b=boulders[i];
        ctx.save();
        ctx.translate(b.x,b.y);
        ctx.rotate(b.rotation);

        // Boulder with gradient
        var bGrad=ctx.createRadialGradient(-3,-3,0,0,0,b.radius);
        bGrad.addColorStop(0,'#999999');bGrad.addColorStop(1,'#555555');
        ctx.fillStyle=bGrad;
        ctx.beginPath();ctx.arc(0,0,b.radius,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#444';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(0,0,b.radius,0,Math.PI*2);ctx.stroke();

        // Cracks
        ctx.strokeStyle='#666';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(5,3);ctx.stroke();
        ctx.beginPath();ctx.moveTo(3,-3);ctx.lineTo(-4,6);ctx.stroke();

        ctx.restore();
    }

    drawPlayer(player.x,player.y,false);

    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('DODGE THE BOULDERS! SPACE/UP TO JUMP!',W/2,H*0.18);
}

// ─── STAGE 3: RESCUE ────────────────────────────
function initRescueStage(){
    rescueComplete=false;
    captive={x:W*0.85,y:H*0.65,rescued:false};
    player={x:W*0.1,y:H*0.75,vx:0,vy:0,onGround:true};
    // A few guards (simple back-and-forth enemies)
}

function updateRescueStage(dt){
    if(keys.left)player.x-=PLAYER_SPEED*dt;
    if(keys.right)player.x+=PLAYER_SPEED*dt;
    if(keys.jump&&player.onGround){
        keys.jump=false;
        player.vy=JUMP_VEL;
        player.onGround=false;
    }
    if(!player.onGround){
        player.vy+=GRAVITY*dt;
        player.y+=player.vy*dt;
        if(player.y>=H*0.75){player.y=H*0.75;player.vy=0;player.onGround=true;}
    }
    player.x=Math.max(10,Math.min(W-20,player.x));

    // Check rescue
    if(!captive.rescued&&Math.abs(player.x-captive.x)<30&&Math.abs(player.y-captive.y)<30){
        captive.rescued=true;
        score+=500;
        addParticles(captive.x,captive.y,'#ff44ff',20);
        rescueComplete=true;
        // Advance after delay
        setTimeout(function(){
            if(gameState==='playing'){
                stage=0;
                level++;
                initStage();
            }
        },2000);
    }
}

function drawRescueStage(){
    drawJungleBg(false);

    // Cage/post for captive
    if(!captive.rescued){
        ctx.strokeStyle='#887744';ctx.lineWidth=3;
        ctx.strokeRect(captive.x-15,captive.y-35,30,40);
        // Captive inside
        ctx.fillStyle='#ff88cc';
        ctx.beginPath();ctx.arc(captive.x,captive.y-25,6,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ff66aa';
        ctx.fillRect(captive.x-4,captive.y-18,8,15);
        // Help text
        ctx.fillStyle='#ff66aa';ctx.font='bold '+Math.round(W*0.015)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.fillText('HELP!',captive.x,captive.y-42);
    }

    drawPlayer(player.x,player.y,false);

    if(rescueComplete){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('RESCUED!',W/2,H*0.4);
        ctx.shadowBlur=0;
        ctx.restore();
    }else{
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.textAlign='center';
        ctx.fillText('REACH THE CAPTIVE TO RESCUE!',W/2,H*0.18);
    }
}

// ─── STAGE MANAGEMENT ────────────────────────────
function initStage(){
    stageTransition=false;
    if(stage===0)initVineStage();
    else if(stage===1)initRiverStage();
    else if(stage===2)initBoulderStage();
    else if(stage===3)initRescueStage();
}

function updateStage(dt){
    if(stageTransition){
        transitionTimer-=dt;
        if(transitionTimer<=0){
            stageTransition=false;
            initStage();
        }
        return;
    }
    if(stage===0)updateVineStage(dt);
    else if(stage===1)updateRiverStage(dt);
    else if(stage===2)updateBoulderStage(dt);
    else if(stage===3)updateRescueStage(dt);
}

function drawStage(){
    if(stageTransition){
        ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,W,H);
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#44ff44';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#44ff44';
        ctx.fillText('STAGE '+(stage+1),W/2,H*0.4);
        ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
        ctx.fillStyle='#88ff88';
        ctx.fillText(STAGE_NAMES[stage],W/2,H*0.5);
        ctx.restore();
        return;
    }
    if(stage===0)drawVineStage();
    else if(stage===1)drawRiverStage();
    else if(stage===2)drawBoulderStage();
    else if(stage===3)drawRescueStage();

    // Stage banner
    ctx.save();ctx.textAlign='left';
    ctx.fillStyle='rgba(0,0,0,0.4)';
    ctx.fillRect(0,0,W*0.35,25);
    ctx.fillStyle='#88ff88';ctx.font='bold 12px "Courier New",monospace';
    ctx.fillText(' STAGE '+(stage+1)+': '+STAGE_NAMES[stage],5,17);
    ctx.restore();

    drawParticles();
}

function advanceStage(){
    score+=300;
    stage++;
    if(stage>3)stage=3; // Stay on rescue until completed
    stageTransition=true;
    transitionTimer=2.0;
}

function killPlayer(){
    lives--;
    addParticles(player.x,player.y,'#ff4444',20);
    if(lives<=0){gameState='gameover';}
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;stage=0;
    particles=[];
    initStage();
    gameState='playing';
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    drawJungleBg(false);
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#44ff44';ctx.shadowBlur=30;
    var ts=Math.round(W*0.06);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.20*(1-scale));
    ctx.fillStyle='#44ff44';ctx.fillText('JUNGLE HUNT',W/2,H*0.20);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    var fs=Math.round(W*0.018);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#88ff88';ctx.fillText('4 STAGES OF JUNGLE ADVENTURE',W/2,H*0.32);

    ctx.fillStyle='#ffcc00';
    ctx.fillText('1. Swing on vines through the jungle',W/2,H*0.42);
    ctx.fillText('2. Swim past deadly crocodiles',W/2,H*0.48);
    ctx.fillText('3. Dodge rolling boulders',W/2,H*0.54);
    ctx.fillText('4. Rescue the captive!',W/2,H*0.60);

    // Animated vine
    var vineX=W/2;var vineLen=40;
    var vAngle=Math.sin(titlePulse*2)*0.4;
    var tipX=vineX+Math.sin(vAngle)*vineLen;
    var tipY=H*0.68+Math.cos(vAngle)*vineLen;
    ctx.strokeStyle='#557733';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(vineX,H*0.68);ctx.lineTo(tipX,tipY);ctx.stroke();
    drawPlayer(tipX,tipY,false);

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move, SPACE/UP to jump/action',W/2,H*0.82);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.92);
    ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Stage reached: '+(stage+1)+' — '+STAGE_NAMES[stage],W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='STG '+(stage+1);
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=lives+' HP';
}

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;
    gameTime+=dt;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){updateStage(dt);updateParticles(dt);drawStage();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;drawGameOver();}

    animId=requestAnimationFrame(gameLoop);
}

// ─── INPUT ───────────────────────────────────────
function onKey(e,down){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=down;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=down;
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keys.up=down;
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keys.down=down;
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){if(down)keys.jump=true;}
    if(!down&&(e.key===' '||e.key==='ArrowUp'))keys.jump=false;
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn(true);});
    el.addEventListener('touchend',function(e){e.preventDefault();fn(false);});
    el.addEventListener('mousedown',function(){fn(true);});
    el.addEventListener('mouseup',function(){fn(false);});
}

window.initJungleHunt=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    keys={left:false,right:false,up:false,down:false,jump:false};
    bindMobile('btn-left',function(d){keys.left=d;});
    bindMobile('btn-right',function(d){keys.right=d;});
    bindMobile('btn-up',function(d){keys.up=d;if(d)keys.jump=true;});
    bindMobile('btn-down',function(d){keys.down=d;});
    canvas.addEventListener('click',function(){if(gameState==='playing')keys.jump=true;else resetGame();});
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopJungleHunt=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    keys={};gameState='title';
};
})();
