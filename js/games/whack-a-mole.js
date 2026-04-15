// Whack-a-Mole — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var GRID_COLS=3,GRID_ROWS=3;
var moles=[],holeRects=[];
var score=0,bestScore=0,combo=0,maxCombo=0,misses=0;
var timer=60,timeLeft=60; // 60 second game
var particles=[],whackEffects=[];
var popInterval=0.8,popTimer=0;
var difficulty=1;
var grassBlades=[]; // background decoration

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcHoles();buildGrass();}

function buildGrass(){
    grassBlades=[];
    for(var i=0;i<60;i++){
        grassBlades.push({x:Math.random()*W,y:H*0.15+Math.random()*H*0.85,h:8+Math.random()*15,sway:Math.random()*Math.PI*2,shade:Math.random()*0.3});
    }
}

function calcHoles(){
    holeRects=[];
    var holeW=Math.min(W*0.22,100);
    var holeH=holeW*0.65;
    var gapX=(W-GRID_COLS*holeW)/(GRID_COLS+1);
    var gapY=(H*0.7-GRID_ROWS*holeH)/(GRID_ROWS+1);
    var startY=H*0.18;
    for(var r=0;r<GRID_ROWS;r++){
        for(var c=0;c<GRID_COLS;c++){
            holeRects.push({
                x:gapX+c*(holeW+gapX),
                y:startY+gapY+r*(holeH+gapY),
                w:holeW,h:holeH
            });
        }
    }
}

function resetGame(){
    moles=[];
    for(var i=0;i<GRID_COLS*GRID_ROWS;i++){
        moles.push({up:false,timer:0,duration:0,rising:0,isGold:false,whacked:false});
    }
    score=0;combo=0;maxCombo=0;misses=0;
    timeLeft=timer;gameTime=0;popTimer=0;difficulty=1;
    particles=[];whackEffects=[];
    gameState='playing';
}

// Difficulty progression: easy(0-20s) -> medium(20-40s) -> hard(40s+)
function getDiffMult(){
    if(gameTime<=20)return 0.7;
    if(gameTime<=40)return 1.0;
    return 1.0+(gameTime-40)*0.015;
}

function popMole(){
    var avail=[];
    for(var i=0;i<moles.length;i++){if(!moles[i].up)avail.push(i);}
    if(avail.length===0)return;
    var idx=avail[Math.floor(Math.random()*avail.length)];
    var m=moles[idx];
    var dm=getDiffMult();
    m.up=true;m.whacked=false;
    m.duration=Math.max(0.5,(1.4-dm*0.15)+Math.random()*0.8);
    m.timer=m.duration;m.rising=0;
    m.isGold=Math.random()<0.1; // 10% gold moles worth more
}

function whackMole(idx){
    var m=moles[idx];
    if(!m.up||m.whacked)return false;
    m.whacked=true;m.timer=0.2;
    combo++;
    if(combo>maxCombo)maxCombo=combo;
    var pts=10*(1+Math.floor(combo/3));
    if(m.isGold)pts*=3;
    score+=pts;

    var hr=holeRects[idx];
    addParticles(hr.x+hr.w/2,hr.y+hr.h*0.3,m.isGold?'#ffcc00':'#ff9933',15);
    addParticles(hr.x+hr.w/2,hr.y+hr.h*0.3,'#ffffff',5);
    whackEffects.push({x:hr.x+hr.w/2,y:hr.y,text:'+'+pts,life:1,color:m.isGold?'#ffcc00':'#33ff66'});
    return true;
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*120+40;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,life:1,color:color,size:Math.random()*5+2});
    }
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    timeLeft-=dt;
    if(timeLeft<=0){
        timeLeft=0;
        if(score>bestScore)bestScore=score;
        gameState='gameover';return;
    }

    var dm=getDiffMult();
    difficulty=dm;
    popInterval=Math.max(0.25,0.8/dm);

    popTimer+=dt;
    if(popTimer>=popInterval){popTimer=0;popMole();}
    // occasionally pop two at higher difficulty
    if(dm>1.2&&Math.random()<0.3&&popTimer<0.1)popMole();

    for(var i=0;i<moles.length;i++){
        var m=moles[i];
        if(!m.up)continue;
        m.timer-=dt;
        if(m.rising<1)m.rising=Math.min(1,m.rising+dt*6);
        if(m.timer<=0){
            if(!m.whacked){combo=0;misses++;}
            m.up=false;m.rising=0;
        }
    }

    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
    for(var i=whackEffects.length-1;i>=0;i--){
        whackEffects[i].y-=40*dt;whackEffects[i].life-=dt*1.5;
        if(whackEffects[i].life<=0)whackEffects.splice(i,1);
    }
}

function drawHole(idx){
    var hr=holeRects[idx];var m=moles[idx];
    var x=hr.x,y=hr.y,w=hr.w,h=hr.h;

    // 3D dirt mound with gradient
    ctx.save();
    var dirtGrad=ctx.createRadialGradient(x+w/2,y+h*0.8,w*0.1,x+w/2,y+h,w*0.55);
    dirtGrad.addColorStop(0,'#8B5E34');dirtGrad.addColorStop(0.6,'#6B4423');dirtGrad.addColorStop(1,'#4a2e12');
    ctx.fillStyle=dirtGrad;
    ctx.beginPath();ctx.ellipse(x+w/2,y+h,w/2,h*0.35,0,0,Math.PI*2);ctx.fill();

    // dirt texture lines
    ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;
    for(var t=0;t<3;t++){
        var tx=x+w*0.3+t*(w*0.15);
        ctx.beginPath();ctx.moveTo(tx,y+h*0.75);ctx.lineTo(tx+w*0.05,y+h*1.1);ctx.stroke();
    }

    // hole with depth gradient
    var holeGrad=ctx.createRadialGradient(x+w/2,y+h*0.7,w*0.05,x+w/2,y+h*0.7,w*0.38);
    holeGrad.addColorStop(0,'#0a0500');holeGrad.addColorStop(0.7,'#1a0e05');holeGrad.addColorStop(1,'#2a1a0a');
    ctx.fillStyle=holeGrad;
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.7,w*0.38,h*0.22,0,0,Math.PI*2);ctx.fill();

    // mole
    if(m.up&&m.rising>0){
        var moleH=h*0.8*m.rising;
        var moleY=y+h*0.7-moleH;
        ctx.save();
        // clip to hole area
        ctx.beginPath();ctx.rect(x+w*0.1,y-h*0.5,w*0.8,h*1.2);ctx.clip();

        if(m.whacked){
            // dizzy mole with gradient body
            var dizzyGrad=ctx.createRadialGradient(x+w/2,moleY+moleH*0.3,w*0.05,x+w/2,moleY+moleH*0.4,w*0.3);
            dizzyGrad.addColorStop(0,'#a07820');dizzyGrad.addColorStop(1,'#6B4e10');
            ctx.fillStyle=dizzyGrad;
            ctx.beginPath();ctx.ellipse(x+w/2,moleY+moleH*0.4,w*0.3,moleH*0.35,0,0,Math.PI*2);ctx.fill();
            // X eyes
            ctx.strokeStyle='#000';ctx.lineWidth=2;
            ctx.beginPath();ctx.moveTo(x+w*0.38,moleY+moleH*0.25);ctx.lineTo(x+w*0.45,moleY+moleH*0.35);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.45,moleY+moleH*0.25);ctx.lineTo(x+w*0.38,moleY+moleH*0.35);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.55,moleY+moleH*0.25);ctx.lineTo(x+w*0.62,moleY+moleH*0.35);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.62,moleY+moleH*0.25);ctx.lineTo(x+w*0.55,moleY+moleH*0.35);ctx.stroke();
            // rotating stars
            ctx.fillStyle='#ffcc00';ctx.font=Math.round(w*0.15)+'px "Courier New"';ctx.textAlign='center';
            var starOff=gameTime*3;
            ctx.fillText('\u2605',x+w*0.3+Math.cos(starOff)*5,moleY+moleH*0.1+Math.sin(starOff)*3);
            ctx.fillText('\u2605',x+w*0.7+Math.cos(starOff+2)*5,moleY+moleH*0.1+Math.sin(starOff+2)*3);
        }else{
            // normal mole with gradient body
            var isGold=m.isGold;
            var bodyGrad=ctx.createRadialGradient(x+w/2-w*0.05,moleY+moleH*0.25,w*0.05,x+w/2,moleY+moleH*0.4,w*0.32);
            bodyGrad.addColorStop(0,isGold?'#FFE44D':'#B08020');
            bodyGrad.addColorStop(0.6,isGold?'#FFD700':'#8B6914');
            bodyGrad.addColorStop(1,isGold?'#CC9900':'#5a4510');
            ctx.fillStyle=bodyGrad;
            ctx.beginPath();ctx.ellipse(x+w/2,moleY+moleH*0.4,w*0.3,moleH*0.4,0,0,Math.PI*2);ctx.fill();

            // gold glow
            if(isGold){
                ctx.save();
                ctx.shadowColor='#FFD700';ctx.shadowBlur=15+Math.sin(gameTime*8)*5;
                ctx.beginPath();ctx.ellipse(x+w/2,moleY+moleH*0.4,w*0.28,moleH*0.38,0,0,Math.PI*2);
                ctx.strokeStyle='rgba(255,215,0,0.4)';ctx.lineWidth=2;ctx.stroke();
                ctx.restore();
            }

            // face - lighter belly
            var faceGrad=ctx.createRadialGradient(x+w/2,moleY+moleH*0.3,w*0.03,x+w/2,moleY+moleH*0.35,w*0.2);
            faceGrad.addColorStop(0,'#F0CFA0');faceGrad.addColorStop(1,'#D4A76A');
            ctx.fillStyle=faceGrad;
            ctx.beginPath();ctx.ellipse(x+w/2,moleY+moleH*0.35,w*0.2,moleH*0.25,0,0,Math.PI*2);ctx.fill();

            // eyes with highlights
            ctx.fillStyle='#000';
            ctx.beginPath();ctx.arc(x+w*0.42,moleY+moleH*0.28,w*0.04,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x+w*0.58,moleY+moleH*0.28,w*0.04,0,Math.PI*2);ctx.fill();
            // eye highlights
            ctx.fillStyle='#fff';
            ctx.beginPath();ctx.arc(x+w*0.41,moleY+moleH*0.27,w*0.015,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x+w*0.57,moleY+moleH*0.27,w*0.015,0,Math.PI*2);ctx.fill();
            // nose with gradient
            var noseGrad=ctx.createRadialGradient(x+w/2,moleY+moleH*0.38,0,x+w/2,moleY+moleH*0.38,w*0.04);
            noseGrad.addColorStop(0,'#ff8888');noseGrad.addColorStop(1,'#cc4444');
            ctx.fillStyle=noseGrad;
            ctx.beginPath();ctx.arc(x+w/2,moleY+moleH*0.38,w*0.04,0,Math.PI*2);ctx.fill();
            // whiskers
            ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(x+w*0.35,moleY+moleH*0.37);ctx.lineTo(x+w*0.2,moleY+moleH*0.34);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.35,moleY+moleH*0.4);ctx.lineTo(x+w*0.2,moleY+moleH*0.42);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.65,moleY+moleH*0.37);ctx.lineTo(x+w*0.8,moleY+moleH*0.34);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x+w*0.65,moleY+moleH*0.4);ctx.lineTo(x+w*0.8,moleY+moleH*0.42);ctx.stroke();

            // gold sparkle
            if(isGold){
                ctx.fillStyle='#fff';ctx.globalAlpha=0.5+0.5*Math.sin(gameTime*10);
                ctx.font=Math.round(w*0.12)+'px "Courier New"';ctx.textAlign='center';
                ctx.fillText('\u2726',x+w*0.25,moleY+moleH*0.12);ctx.fillText('\u2726',x+w*0.78,moleY+moleH*0.18);
                ctx.fillText('\u2726',x+w*0.5,moleY-moleH*0.05);
                ctx.globalAlpha=1;
            }
        }
        ctx.restore();
    }

    // front dirt (covers mole base) with gradient
    var frontDirt=ctx.createLinearGradient(x,y+h*0.7,x,y+h);
    frontDirt.addColorStop(0,'#8B6038');frontDirt.addColorStop(1,'#6B4423');
    ctx.fillStyle=frontDirt;
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.85,w*0.42,h*0.18,0,0,Math.PI);ctx.fill();
    ctx.restore();
}

function render(){
    // rich sky-to-field gradient bg
    ctx.save();
    var skyGrad=ctx.createLinearGradient(0,0,0,H*0.3);
    skyGrad.addColorStop(0,'#4FC3F7');skyGrad.addColorStop(0.5,'#81D4FA');skyGrad.addColorStop(1,'#B2EBF2');
    ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H*0.3);

    // clouds
    ctx.fillStyle='rgba(255,255,255,0.6)';
    for(var c=0;c<4;c++){
        var cx=((c*W*0.3+gameTime*8)%(W+100))-50;
        var cy=H*0.05+c*H*0.06;
        ctx.beginPath();ctx.ellipse(cx,cy,40+c*10,12+c*3,0,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(cx+25,cy-5,20+c*5,10,0,0,Math.PI*2);ctx.fill();
    }

    // field gradient
    var fieldGrad=ctx.createLinearGradient(0,H*0.15,0,H);
    fieldGrad.addColorStop(0,'#7ACC7A');fieldGrad.addColorStop(0.3,'#5dbb5d');fieldGrad.addColorStop(0.7,'#4a9a4a');fieldGrad.addColorStop(1,'#3a7a3a');
    ctx.fillStyle=fieldGrad;ctx.fillRect(0,H*0.15,W,H*0.85);

    // grass blades
    for(var i=0;i<grassBlades.length;i++){
        var gb=grassBlades[i];
        var sway=Math.sin(gameTime*2+gb.sway)*3;
        ctx.strokeStyle='rgba(30,100,30,'+(0.3+gb.shade)+')';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(gb.x,gb.y);ctx.quadraticCurveTo(gb.x+sway,gb.y-gb.h*0.5,gb.x+sway*1.5,gb.y-gb.h);ctx.stroke();
    }

    // sun
    ctx.save();
    var sunGrad=ctx.createRadialGradient(W*0.85,H*0.06,5,W*0.85,H*0.06,35);
    sunGrad.addColorStop(0,'#FFEB3B');sunGrad.addColorStop(0.5,'rgba(255,235,59,0.5)');sunGrad.addColorStop(1,'rgba(255,235,59,0)');
    ctx.fillStyle=sunGrad;ctx.beginPath();ctx.arc(W*0.85,H*0.06,35,0,Math.PI*2);ctx.fill();
    ctx.restore();

    // holes & moles
    for(var i=0;i<GRID_COLS*GRID_ROWS;i++)drawHole(i);

    // particles with glow
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;
        ctx.save();
        ctx.shadowColor=p.color;ctx.shadowBlur=6;
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha=1;

    // whack effects with glow
    for(var i=0;i<whackEffects.length;i++){
        var w=whackEffects[i];
        ctx.globalAlpha=w.life;
        ctx.save();
        ctx.shadowColor=w.color;ctx.shadowBlur=10;
        ctx.fillStyle=w.color;
        ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.textAlign='center';
        ctx.fillText(w.text,w.x,w.y);
        ctx.restore();
    }
    ctx.globalAlpha=1;

    // timer bar with gradient
    var barW=W*0.6,barH=14,barX=(W-barW)/2,barY=H*0.92;
    ctx.fillStyle='#222';ctx.beginPath();
    if(ctx.roundRect){ctx.roundRect(barX-1,barY-1,barW+2,barH+2,4);ctx.fill();}
    else{ctx.fillRect(barX-1,barY-1,barW+2,barH+2);}
    var pct=timeLeft/timer;
    var barGrad=ctx.createLinearGradient(barX,barY,barX,barY+barH);
    if(pct>0.3){barGrad.addColorStop(0,'#66ee66');barGrad.addColorStop(1,'#22aa22');}
    else{barGrad.addColorStop(0,'#ff6666');barGrad.addColorStop(1,'#cc2222');}
    ctx.fillStyle=barGrad;ctx.fillRect(barX,barY,barW*pct,barH);
    // bar shine
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(barX,barY,barW*pct,barH/2);
    ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.strokeRect(barX,barY,barW,barH);

    // combo display with glow
    if(combo>2){
        ctx.save();
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=12;
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.028)+'px "Courier New",monospace';ctx.textAlign='center';
        ctx.fillText('COMBO x'+combo+'!',W/2,H*0.88);
        ctx.restore();
    }

    // top info with shadow
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=4;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;
    ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.textAlign='left';ctx.fillText('SCORE: '+score,10,25);
    ctx.textAlign='right';ctx.fillText('TIME: '+Math.ceil(timeLeft)+'s',W-10,25);
    ctx.restore();
    ctx.restore();
}

function drawTitle(dt){
    titlePulse+=dt*3;
    // gradient background
    var bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#2d5a27');bg.addColorStop(0.5,'#3a7a3a');bg.addColorStop(1,'#1a4a1a');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

    // decorative dirt patches
    for(var i=0;i<5;i++){
        var px=W*0.15+i*(W*0.18);var py=H*0.55+Math.sin(i*2)*20;
        ctx.fillStyle='rgba(107,68,35,0.4)';
        ctx.beginPath();ctx.ellipse(px,py,30,15,0,0,Math.PI*2);ctx.fill();
    }

    // bouncing mole preview with enhanced details
    for(var i=0;i<3;i++){
        var x=W*0.3+i*(W*0.2);
        var y=H*0.48+Math.abs(Math.sin(titlePulse+i*1.5))*30;
        ctx.save();
        // body glow
        if(i===1){ctx.shadowColor='#FFD700';ctx.shadowBlur=12;}
        var bColor=i===1?'#FFD700':'#8B6914';
        var bGrad=ctx.createRadialGradient(x-3,y-5,3,x,y,25);
        bGrad.addColorStop(0,i===1?'#FFE44D':'#B08020');bGrad.addColorStop(1,bColor);
        ctx.fillStyle=bGrad;ctx.beginPath();ctx.ellipse(x,y,20,25,0,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        var fGrad=ctx.createRadialGradient(x,y-8,2,x,y-5,16);
        fGrad.addColorStop(0,'#F0CFA0');fGrad.addColorStop(1,'#D4A76A');
        ctx.fillStyle=fGrad;ctx.beginPath();ctx.ellipse(x,y-5,14,16,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x-5,y-10,3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+5,y-10,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-6,y-11,1.2,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+4,y-11,1.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ff6666';ctx.beginPath();ctx.arc(x,y-3,3,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
    ctx.fillText('WHACK-A-MOLE',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#ddd';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Click/tap moles before they hide! 60 seconds!',W/2,H*0.25);
    ctx.fillText('Gold moles = 3x points!',W/2,H*0.3);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.7);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';ctx.fillText('TIME UP!',W/2,H*0.2);ctx.shadowBlur=0;
    ctx.fillStyle='#33ff66';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.38);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('Max combo: x'+maxCombo+'  |  Misses: '+misses,W/2,H*0.5);
    if(bestScore>0)ctx.fillText('Best: '+bestScore,W/2,H*0.56);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='x'+combo;
    document.getElementById('hud-time').textContent=Math.ceil(timeLeft)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function holeHitTest(mx,my){
    for(var i=0;i<holeRects.length;i++){
        var hr=holeRects[i];
        if(mx>=hr.x&&mx<=hr.x+hr.w&&my>=hr.y-hr.h*0.3&&my<=hr.y+hr.h)return i;
    }
    return -1;
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    // numpad whacking: 1-9 maps to grid
    if(e.key>='1'&&e.key<='9'){
        var n=parseInt(e.key)-1;
        // map: 7,8,9=top row; 4,5,6=mid; 1,2,3=bottom
        var map=[6,7,8,3,4,5,0,1,2];
        if(n<9)whackMole(map[n]);
    }
    if(['Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var idx=holeHitTest(mx,my);
    if(idx>=0)whackMole(idx);
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    for(var t=0;t<e.touches.length;t++){
        var r=canvas.getBoundingClientRect();
        var mx=e.touches[t].clientX-r.left,my=e.touches[t].clientY-r.top;
        var idx=holeHitTest(mx,my);
        if(idx>=0)whackMole(idx);
    }
}

window.initWhackAMole=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch,{passive:false});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopWhackAMole=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
