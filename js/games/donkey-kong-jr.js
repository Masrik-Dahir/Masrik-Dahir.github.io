// Donkey Kong Jr. — Full Game (Platformer with vine climbing)
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var keys={left:false,right:false,up:false,down:false,jump:false};
var particles=[];

var GRAVITY=900,JUMP_VEL=-380,PLAYER_SPEED=160,CLIMB_SPEED=130;
var player,platforms=[],vinesArr=[],chains=[],keysArr=[],snapjaws=[];
var dkCage,levelComplete=false,levelTimer=0;

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

// ─── BUILD LEVEL ─────────────────────────────────
function buildLevel(){
    platforms=[];vinesArr=[];chains=[];keysArr=[];snapjaws=[];
    levelComplete=false;levelTimer=0;

    var pw=W*0.9,ox=(W-pw)/2;
    var numPlat=5;
    var pH=H/(numPlat+1);

    // Ground platform
    platforms.push({x:ox,y:H-30,w:pw,h:10,color:'#668844'});

    // Platforms at different heights
    for(var i=1;i<=numPlat;i++){
        var py=H-30-i*pH;
        var pLeft=i%2===0;
        var pW=pw*0.65;
        var pX=pLeft?ox:ox+pw-pW;
        platforms.push({x:pX,y:py,w:pW,h:8,color:'#886644'});
    }

    // Vines connecting platforms (climbable)
    var vinePositions=[0.2,0.4,0.6,0.8];
    for(var i=0;i<numPlat;i++){
        var bottomPlat=platforms[i];
        var topPlat=platforms[i+1];
        // Pick 2 vine positions for this gap
        var picks2=[vinePositions[(i*2)%4],vinePositions[(i*2+1)%4]];
        for(var p=0;p<picks2.length;p++){
            var vx=ox+pw*picks2[p];
            // Ensure vine is reachable from both platforms
            var vTop=topPlat.y;
            var vBot=bottomPlat.y;
            vinesArr.push({
                x:vx,topY:vTop,botY:vBot,
                isChain:Math.random()<0.3
            });
        }
    }

    // Keys near the top (to free DK)
    var topPlat=platforms[platforms.length-1];
    var keyCount=Math.min(2+Math.floor(level*0.5),4);
    for(var k=0;k<keyCount;k++){
        keysArr.push({
            x:topPlat.x+topPlat.w*((k+1)/(keyCount+1)),
            y:topPlat.y-20,
            collected:false,
            bobPhase:k*Math.PI*0.5
        });
    }

    // DK Cage at top
    dkCage={
        x:W/2-25,y:platforms[platforms.length-1].y-65,
        w:50,h:50,
        keysNeeded:keyCount,
        keysCollected:0
    };

    // Snapjaws (enemies on vines)
    var snapCount=2+Math.floor(level*0.5);
    if(snapCount>6)snapCount=6;
    for(var s=0;s<snapCount;s++){
        var vineIdx=s%vinesArr.length;
        var sv=vinesArr[vineIdx];
        snapjaws.push({
            x:sv.x,y:sv.topY+Math.random()*(sv.botY-sv.topY),
            vineIdx:vineIdx,
            speed:40+Math.random()*30,
            dir:Math.random()<0.5?1:-1,
            type:s%2===0?'red':'blue',
            alive:true
        });
    }

    // Player starts at bottom-left
    player={
        x:ox+30,y:platforms[0].y-20,
        w:16,h:20,
        vx:0,vy:0,
        onGround:false,
        climbing:false,
        climbVine:null,
        facingRight:true,
        hitTimer:0
    };
}

// ─── PLATFORM COLLISION ──────────────────────────
function getPlayerPlatform(){
    for(var i=0;i<platforms.length;i++){
        var p2=platforms[i];
        if(player.x+player.w>p2.x&&player.x<p2.x+p2.w){
            if(player.y+player.h>=p2.y&&player.y+player.h<=p2.y+15&&player.vy>=0){
                return i;
            }
        }
    }
    return -1;
}

function getVineAt(px,py){
    var tolerance=25;
    for(var i=0;i<vinesArr.length;i++){
        var v=vinesArr[i];
        if(Math.abs(px-v.x)<tolerance&&py>=v.topY-10&&py<=v.botY+10){
            return i;
        }
    }
    return -1;
}

// ─── UPDATE ──────────────────────────────────────
function update(dt){
    gameTime+=dt;
    if(levelComplete){
        levelTimer+=dt;
        if(levelTimer>2.5){
            level++;
            buildLevel();
        }
        return;
    }

    // Horizontal movement
    if(!player.climbing){
        if(keys.left){player.vx=-PLAYER_SPEED;player.facingRight=false;}
        else if(keys.right){player.vx=PLAYER_SPEED;player.facingRight=true;}
        else player.vx*=0.7;

        // Gravity
        player.vy+=GRAVITY*dt;

        // Jump
        if(keys.jump&&player.onGround){
            keys.jump=false;
            player.vy=JUMP_VEL;
            player.onGround=false;
        }

        player.x+=player.vx*dt;
        player.y+=player.vy*dt;

        // Platform collision
        var platIdx=getPlayerPlatform();
        if(platIdx>=0){
            player.y=platforms[platIdx].y-player.h;
            player.vy=0;
            player.onGround=true;
        }else{
            player.onGround=false;
        }

        // Grab vine (press up near vine)
        if(keys.up){
            var vi=getVineAt(player.x+player.w/2,player.y+player.h/2);
            if(vi>=0){
                player.climbing=true;
                player.climbVine=vi;
                player.x=vinesArr[vi].x-player.w/2;
                player.vx=0;player.vy=0;
            }
        }
    }else{
        // Climbing on vine
        var vine=vinesArr[player.climbVine];
        player.x=vine.x-player.w/2;

        if(keys.up){
            player.y-=CLIMB_SPEED*dt;
            // Two-vine climbing: if grabbing two adjacent vines, climb faster
        }
        if(keys.down){
            player.y+=CLIMB_SPEED*dt;
        }

        // Clamp to vine bounds
        if(player.y<vine.topY-player.h){player.y=vine.topY-player.h;}
        if(player.y+player.h>vine.botY){
            player.y=vine.botY-player.h;
            player.climbing=false;
            player.climbVine=null;
        }

        // Jump off vine
        if(keys.jump){
            keys.jump=false;
            player.climbing=false;
            player.climbVine=null;
            player.vy=JUMP_VEL*0.7;
            player.vx=player.facingRight?150:-150;
        }

        // Reached top of vine = step onto platform
        if(player.y<=vine.topY){
            player.climbing=false;
            player.climbVine=null;
            player.y=vine.topY-player.h-2;
            player.onGround=true;
            player.vy=0;
        }
    }

    // Clamp position
    player.x=Math.max(5,Math.min(W-player.w-5,player.x));
    if(player.y>H+50){killPlayer();return;}

    // Collect keys
    for(var k=0;k<keysArr.length;k++){
        var key=keysArr[k];
        if(key.collected)continue;
        var dx=Math.abs((player.x+player.w/2)-key.x);
        var dy=Math.abs((player.y+player.h/2)-key.y);
        if(dx<20&&dy<25){
            key.collected=true;
            dkCage.keysCollected++;
            score+=200;
            addParticles(key.x,key.y,'#ffcc00',15);

            if(dkCage.keysCollected>=dkCage.keysNeeded){
                // Free DK!
                levelComplete=true;
                score+=500;
                addParticles(dkCage.x+dkCage.w/2,dkCage.y+dkCage.h/2,'#ff8844',30);
            }
        }
    }

    // Update snapjaws
    for(var s=0;s<snapjaws.length;s++){
        var sj=snapjaws[s];
        if(!sj.alive)continue;
        var sv2=vinesArr[sj.vineIdx];
        sj.y+=sj.speed*sj.dir*dt;
        if(sj.y<sv2.topY){sj.y=sv2.topY;sj.dir=1;}
        if(sj.y>sv2.botY-15){sj.y=sv2.botY-15;sj.dir=-1;}

        // Collision with player
        if(player.hitTimer<=0){
            var sdx=Math.abs((player.x+player.w/2)-sj.x);
            var sdy=Math.abs((player.y+player.h/2)-sj.y);
            if(sdx<20&&sdy<20){
                // If player is above snapjaw and falling, stomp it
                if(player.vy>0&&player.y+player.h<sj.y+10){
                    sj.alive=false;
                    score+=300;
                    player.vy=JUMP_VEL*0.5;
                    addParticles(sj.x,sj.y,'#ff4444',12);
                }else{
                    killPlayer();
                    return;
                }
            }
        }
    }

    if(player.hitTimer>0)player.hitTimer-=dt;
}

function killPlayer(){
    lives--;
    addParticles(player.x+player.w/2,player.y+player.h/2,'#ff3355',20);
    if(lives<=0){gameState='gameover';return;}
    player.hitTimer=2.0;
    // Reset position
    player.x=platforms[0].x+30;
    player.y=platforms[0].y-player.h;
    player.vx=0;player.vy=0;
    player.onGround=true;player.climbing=false;player.climbVine=null;
}

// ─── RENDER ──────────────────────────────────────
function render(){
    // Background
    var bgGrad=ctx.createLinearGradient(0,0,0,H);
    bgGrad.addColorStop(0,'#1a0a3a');bgGrad.addColorStop(1,'#2a1a4a');
    ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

    // Draw vines/chains
    for(var i=0;i<vinesArr.length;i++){
        var v=vinesArr[i];
        if(v.isChain){
            // Chain - gray links
            ctx.strokeStyle='#999999';ctx.lineWidth=4;
            ctx.setLineDash([8,6]);
            ctx.beginPath();ctx.moveTo(v.x,v.topY);ctx.lineTo(v.x,v.botY);ctx.stroke();
            ctx.setLineDash([]);
        }else{
            // Vine - green
            ctx.strokeStyle='#44aa44';ctx.lineWidth=4;
            ctx.beginPath();ctx.moveTo(v.x,v.topY);ctx.lineTo(v.x,v.botY);ctx.stroke();
            // Leaves
            for(var ly=v.topY;ly<v.botY;ly+=40){
                ctx.fillStyle='#55bb55';
                ctx.beginPath();
                ctx.ellipse(v.x+8,ly,6,3,0.3,0,Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(v.x-8,ly+20,6,3,-0.3,0,Math.PI*2);
                ctx.fill();
            }
        }
    }

    // Draw platforms
    for(var i=0;i<platforms.length;i++){
        var p2=platforms[i];
        var pGrad=ctx.createLinearGradient(0,p2.y,0,p2.y+p2.h);
        pGrad.addColorStop(0,p2.color);pGrad.addColorStop(1,'#553322');
        ctx.fillStyle=pGrad;
        ctx.fillRect(p2.x,p2.y,p2.w,p2.h);
        // Platform edge
        ctx.fillStyle='#aa8855';
        ctx.fillRect(p2.x,p2.y,p2.w,2);
    }

    // Draw DK Cage
    ctx.fillStyle='#555';
    ctx.fillRect(dkCage.x,dkCage.y,dkCage.w,dkCage.h);
    // Bars
    ctx.strokeStyle='#888';ctx.lineWidth=3;
    for(var bx=dkCage.x+8;bx<dkCage.x+dkCage.w;bx+=10){
        ctx.beginPath();ctx.moveTo(bx,dkCage.y);ctx.lineTo(bx,dkCage.y+dkCage.h);ctx.stroke();
    }
    // DK inside
    ctx.fillStyle='#884422';
    ctx.beginPath();ctx.arc(dkCage.x+dkCage.w/2,dkCage.y+dkCage.h/2,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(dkCage.x+dkCage.w/2,dkCage.y+dkCage.h/2-5,6,0,Math.PI*2);ctx.fill();
    // Key counter
    ctx.fillStyle='#ffcc00';ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='center';
    ctx.fillText(dkCage.keysCollected+'/'+dkCage.keysNeeded,dkCage.x+dkCage.w/2,dkCage.y-5);

    // Draw keys
    for(var k=0;k<keysArr.length;k++){
        var key=keysArr[k];
        if(key.collected)continue;
        var kBob=Math.sin(gameTime*3+key.bobPhase)*5;
        ctx.save();
        ctx.translate(key.x,key.y+kBob);
        // Key shape
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();ctx.arc(0,-5,5,0,Math.PI*2);ctx.fill();
        ctx.fillRect(-2,-5,4,12);
        ctx.fillRect(-4,5,3,3);
        ctx.fillRect(1,3,3,3);
        // Glow
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=10;
        ctx.beginPath();ctx.arc(0,-5,3,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        ctx.restore();
    }

    // Draw snapjaws
    for(var s=0;s<snapjaws.length;s++){
        var sj=snapjaws[s];
        if(!sj.alive)continue;
        ctx.save();
        ctx.translate(sj.x,sj.y);

        // Body
        ctx.fillStyle=sj.type==='red'?'#cc3333':'#3333cc';
        ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();

        // Jaws
        var jawAngle=Math.sin(gameTime*5)*0.3;
        ctx.fillStyle='#ffcc88';
        ctx.beginPath();
        ctx.moveTo(-8,0);ctx.lineTo(-12,-6-jawAngle*5);ctx.lineTo(-4,-2);ctx.closePath();ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-8,0);ctx.lineTo(-12,6+jawAngle*5);ctx.lineTo(-4,2);ctx.closePath();ctx.fill();

        // Eyes
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(3,-4,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#000';
        ctx.beginPath();ctx.arc(4,-4,1.5,0,Math.PI*2);ctx.fill();

        ctx.restore();
    }

    // Draw player (DK Jr.)
    if(player.hitTimer<=0||Math.floor(player.hitTimer*8)%2===0){
        ctx.save();
        ctx.translate(player.x+player.w/2,player.y+player.h/2);
        if(!player.facingRight)ctx.scale(-1,1);

        var s=Math.min(W,H)*0.02;

        // Body (brown fur)
        ctx.fillStyle='#aa6622';
        ctx.fillRect(-s*0.6,-s*1.2,s*1.2,s*1.5);

        // Head
        ctx.fillStyle='#cc8833';
        ctx.beginPath();ctx.arc(0,-s*1.6,s*0.7,0,Math.PI*2);ctx.fill();

        // Face
        ctx.fillStyle='#ffcc88';
        ctx.beginPath();ctx.arc(s*0.1,-s*1.5,s*0.4,0,Math.PI*2);ctx.fill();

        // Eyes
        ctx.fillStyle='#000';
        ctx.beginPath();ctx.arc(s*0.2,-s*1.6,s*0.12,0,Math.PI*2);ctx.fill();

        // White diaper/bib
        ctx.fillStyle='#ffffff';
        ctx.fillRect(-s*0.4,-s*0.2,s*0.8,s*0.5);

        // Legs
        if(player.climbing){
            ctx.fillStyle='#aa6622';
            ctx.fillRect(-s*0.4,s*0.3,s*0.3,s*0.5);
            ctx.fillRect(s*0.1,s*0.3,s*0.3,s*0.5);
        }else{
            var legPhase=Math.sin(gameTime*10)*0.3;
            ctx.fillStyle='#aa6622';
            ctx.fillRect(-s*0.4+legPhase*5,s*0.3,s*0.3,s*0.5);
            ctx.fillRect(s*0.1-legPhase*5,s*0.3,s*0.3,s*0.5);
        }

        ctx.restore();
    }

    // Level complete overlay
    if(levelComplete){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';
        ctx.fillText('DK FREED!',W/2,H*0.4);
        ctx.shadowBlur=0;
        ctx.restore();
    }

    drawParticles();
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    var bgGrad2=ctx.createLinearGradient(0,0,0,H);
    bgGrad2.addColorStop(0,'#1a0a3a');bgGrad2.addColorStop(1,'#2a1a4a');
    ctx.fillStyle=bgGrad2;ctx.fillRect(0,0,W,H);

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#ff8844';ctx.shadowBlur=30;
    var ts=Math.round(W*0.055);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.18*(1-scale));
    ctx.fillStyle='#ff8844';ctx.fillText('DONKEY KONG JR.',W/2,H*0.18);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    var fs=Math.round(W*0.02);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';ctx.fillText('Climb vines to collect keys and free DK!',W/2,H*0.32);
    ctx.fillStyle='#66aaff';ctx.fillText('Avoid Snapjaws on the vines',W/2,H*0.38);
    ctx.fillStyle='#ff6644';ctx.fillText('Jump on enemies to defeat them',W/2,H*0.44);

    // Animated DK Jr.
    var jrX=W/2+Math.sin(titlePulse*2)*30;
    var jrY=H*0.58;
    ctx.fillStyle='#aa6622';
    ctx.beginPath();ctx.arc(jrX,jrY,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(jrX+2,jrY-3,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.fillRect(jrX-5,jrY+5,10,6);

    // Key icon
    ctx.fillStyle='#ffcc00';
    ctx.beginPath();ctx.arc(W/2,H*0.68,8,0,Math.PI*2);ctx.fill();
    ctx.fillRect(W/2-2,H*0.68,4,15);
    var keyGlow=0.5+0.5*Math.sin(titlePulse*3);
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=10*keyGlow;
    ctx.beginPath();ctx.arc(W/2,H*0.68,6,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move, SPACE/UP to jump',W/2,H*0.80);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.92);
    ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Level reached: '+level,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='LVL '+level;
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=lives+' HP';
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;particles=[];
    buildLevel();
    gameState='playing';
}

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){update(dt);updateParticles(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;updateParticles(dt);drawGameOver();}

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

window.initDonkeyKongJr=function(){
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

window.stopDonkeyKongJr=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    keys={};gameState='title';
};
})();
