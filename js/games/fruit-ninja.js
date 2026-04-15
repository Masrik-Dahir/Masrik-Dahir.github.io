// Fruit Ninja — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var fruits=[],sliceTrail=[],splats=[],particles=[];
var score=0,bestScore=0,combo=0,lives=3,maxLives=3;
var spawnTimer=0,spawnInterval=1.2;
var mouseDown=false,mouseX=0,mouseY=0,lastMX=0,lastMY=0;
var FRUIT_TYPES=[
    {name:'apple',color:'#ff3333',inner:'#ffcccc',r:22,highlight:'#ff7777'},
    {name:'orange',color:'#ff9933',inner:'#ffdd99',r:20,highlight:'#ffbb66'},
    {name:'watermelon',color:'#33aa33',inner:'#ff6666',r:26,highlight:'#55cc55'},
    {name:'banana',color:'#ffcc00',inner:'#fff5cc',r:18,highlight:'#ffdd44'},
    {name:'grape',color:'#9933cc',inner:'#cc99ff',r:16,highlight:'#bb66ee'},
    {name:'kiwi',color:'#6b8e23',inner:'#a0d040',r:17,highlight:'#8bae43'},
    {name:'peach',color:'#ffaa88',inner:'#ffeedd',r:19,highlight:'#ffccaa'},
    {name:'pineapple',color:'#ccaa00',inner:'#ffee66',r:24,highlight:'#ddcc33'}
];
var BOMB_COLOR='#333';
var difficulty=1;
var bgStars=[]; // background decorative dots

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;buildBgStars();}

function buildBgStars(){
    bgStars=[];
    for(var i=0;i<30;i++){bgStars.push({x:Math.random()*W,y:Math.random()*H,r:0.5+Math.random()*1.5,twinkle:Math.random()*Math.PI*2});}
}

function resetGame(){
    fruits=[];sliceTrail=[];splats=[];particles=[];
    score=0;combo=0;lives=maxLives;gameTime=0;spawnTimer=0;difficulty=1;
    mouseDown=false;
    gameState='playing';
}

// Difficulty progression: score-based easy->medium->hard
function getDiffMult(){
    if(score<=15)return 0.7;
    if(score<=50)return 1.0;
    return 1.0+(score-50)*0.008;
}

function spawnFruit(){
    var dm=getDiffMult();
    var isBomb=Math.random()<(0.08+dm*0.03)&&score>3; // bomb chance scales with difficulty
    var x=W*0.15+Math.random()*W*0.7;
    var vy=(-H*0.6-Math.random()*H*0.3)*dm; // faster throws at higher difficulty
    var vx=(Math.random()-0.5)*200;
    var type=isBomb?null:FRUIT_TYPES[Math.floor(Math.random()*FRUIT_TYPES.length)];
    var r=isBomb?20:type.r;
    r=r*Math.min(W,H)/500; // scale with canvas
    fruits.push({
        x:x,y:H+r,vx:vx,vy:vy,r:r,
        type:type,isBomb:isBomb,
        sliced:false,rotation:Math.random()*Math.PI*2,
        rotSpeed:(Math.random()-0.5)*8,
        halfL:null,halfR:null
    });
}

function sliceFruit(idx){
    var f=fruits[idx];
    if(f.sliced)return;
    f.sliced=true;
    if(f.isBomb){
        lives--;
        addParticles(f.x,f.y,'#ff0000',25);
        addParticles(f.x,f.y,'#ff9900',18);
        addParticles(f.x,f.y,'#ffff00',10);
        if(lives<=0){
            if(score>bestScore)bestScore=score;
            gameState='gameover';
        }
        combo=0;
        return;
    }
    combo++;
    var pts=combo>=3?combo*2:1;
    score+=pts;
    // create halves
    f.halfL={x:f.x,y:f.y,vx:f.vx-60,vy:f.vy,r:f.r,rot:f.rotation};
    f.halfR={x:f.x,y:f.y,vx:f.vx+60,vy:f.vy,r:f.r,rot:f.rotation};

    // juice splat
    var color=f.type.inner;
    splats.push({x:f.x,y:f.y,r:0,maxR:f.r*3,life:1,color:color});
    addParticles(f.x,f.y,f.type.color,12);
    addParticles(f.x,f.y,f.type.inner,10);
    // juice drops
    for(var j=0;j<6;j++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*60+20;
        particles.push({x:f.x,y:f.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:1.5,color:f.type.color,size:Math.random()*3+1,isJuice:true});
    }
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*120+30;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,life:1,color:color,size:Math.random()*4+2});
    }
}

function checkSlice(f){
    if(f.sliced||!mouseDown)return false;
    // check if mouse trail crosses this fruit
    var dx=mouseX-f.x,dy=mouseY-f.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<f.r*1.3){
        // also check mouse moved enough (is swiping)
        var swipeDx=mouseX-lastMX,swipeDy=mouseY-lastMY;
        if(Math.sqrt(swipeDx*swipeDx+swipeDy*swipeDy)>3)return true;
    }
    return false;
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    var dm=getDiffMult();
    difficulty=dm;

    // spawn - frequency scales with difficulty
    spawnTimer+=dt;
    spawnInterval=Math.max(0.35,1.2/(dm*0.8+0.2));
    if(spawnTimer>=spawnInterval){
        spawnTimer=0;
        var count=1;
        if(dm>1.3)count=Math.random()<0.4?2:1;
        if(dm>1.8)count=Math.random()<0.3?3:count;
        for(var i=0;i<count;i++)spawnFruit();
    }

    // update fruits
    for(var i=fruits.length-1;i>=0;i--){
        var f=fruits[i];
        f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=600*dt; // gravity
        f.rotation+=f.rotSpeed*dt;

        // slice check
        if(!f.sliced&&checkSlice(f)){
            sliceFruit(i);
        }

        // update halves
        if(f.halfL){
            f.halfL.x+=f.halfL.vx*dt;f.halfL.y+=f.halfL.vy*dt;f.halfL.vy+=600*dt;f.halfL.rot+=3*dt;
            f.halfR.x+=f.halfR.vx*dt;f.halfR.y+=f.halfR.vy*dt;f.halfR.vy+=600*dt;f.halfR.rot-=3*dt;
        }

        // remove if below screen
        if(f.y>H+100||(f.halfL&&f.halfL.y>H+100)){
            if(!f.sliced&&!f.isBomb){
                // missed fruit
                lives--;combo=0;
                if(lives<=0){if(score>bestScore)bestScore=score;gameState='gameover';}
            }
            fruits.splice(i,1);
        }
    }

    // slice trail
    if(mouseDown){sliceTrail.push({x:mouseX,y:mouseY,life:0.4});}
    for(var i=sliceTrail.length-1;i>=0;i--){
        sliceTrail[i].life-=dt*3;
        if(sliceTrail[i].life<=0)sliceTrail.splice(i,1);
    }

    // splats
    for(var i=splats.length-1;i>=0;i--){
        splats[i].r+=dt*200;splats[i].life-=dt*2;
        if(splats[i].life<=0)splats.splice(i,1);
    }

    // particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt*(p.isJuice?1.2:2);
        if(p.life<=0)particles.splice(i,1);
    }

    // reset combo if no slice in 1s
    lastMX=mouseX;lastMY=mouseY;
}

function drawFruit(f){
    if(f.sliced&&f.halfL){
        // draw halves
        drawHalf(f.halfL,f.type,1);
        drawHalf(f.halfR,f.type,-1);
        return;
    }
    if(f.sliced)return;
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rotation);
    if(f.isBomb){
        // bomb with metallic gradient
        var bombGrad=ctx.createRadialGradient(-f.r*0.3,-f.r*0.3,f.r*0.05,0,0,f.r);
        bombGrad.addColorStop(0,'#555');bombGrad.addColorStop(0.4,'#333');bombGrad.addColorStop(1,'#111');
        ctx.fillStyle=bombGrad;
        ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fill();
        // metallic ring
        ctx.strokeStyle='#666';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.stroke();
        // fuse with glow
        ctx.save();
        ctx.shadowColor='#ff6600';ctx.shadowBlur=8;
        ctx.strokeStyle='#ff6600';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(0,-f.r);ctx.quadraticCurveTo(f.r*0.5,-f.r*1.5,f.r*0.3,-f.r*1.7);ctx.stroke();
        ctx.restore();
        // spark with glow
        ctx.save();
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=12;
        ctx.fillStyle='#ffcc00';ctx.globalAlpha=0.5+0.5*Math.sin(gameTime*15);
        ctx.beginPath();ctx.arc(f.r*0.3,-f.r*1.7,4,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;ctx.restore();
        // skull marking
        ctx.fillStyle='#888';ctx.font='bold '+Math.round(f.r*0.8)+'px "Courier New"';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('X',0,2);
    }else{
        // fruit with enhanced gradient
        var g=ctx.createRadialGradient(-f.r*0.25,-f.r*0.25,f.r*0.05,0,0,f.r);
        g.addColorStop(0,f.type.highlight||f.type.inner);g.addColorStop(0.3,f.type.color);g.addColorStop(1,f.type.color);
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fill();
        // outline
        ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.stroke();
        // primary shine
        ctx.fillStyle='rgba(255,255,255,0.35)';
        ctx.beginPath();ctx.ellipse(-f.r*0.2,-f.r*0.25,f.r*0.35,f.r*0.2,-0.3,0,Math.PI*2);ctx.fill();
        // secondary smaller shine
        ctx.fillStyle='rgba(255,255,255,0.5)';
        ctx.beginPath();ctx.arc(-f.r*0.15,-f.r*0.3,f.r*0.12,0,Math.PI*2);ctx.fill();
        // leaf for apple/orange
        if(f.type.name==='apple'||f.type.name==='orange'){
            var leafGrad=ctx.createLinearGradient(0,-f.r-8,8,-f.r+4);
            leafGrad.addColorStop(0,'#44cc44');leafGrad.addColorStop(1,'#228822');
            ctx.fillStyle=leafGrad;
            ctx.beginPath();ctx.ellipse(2,-f.r-2,f.r*0.2,f.r*0.3,0.3,0,Math.PI*2);ctx.fill();
            // stem
            ctx.strokeStyle='#553300';ctx.lineWidth=1.5;
            ctx.beginPath();ctx.moveTo(0,-f.r);ctx.lineTo(-1,-f.r-5);ctx.stroke();
        }
        // pineapple crown
        if(f.type.name==='pineapple'){
            ctx.fillStyle='#33aa33';
            for(var l=0;l<3;l++){
                ctx.beginPath();ctx.ellipse(-4+l*4,-f.r-4,2,6,(-1+l)*0.3,0,Math.PI*2);ctx.fill();
            }
        }
        // watermelon stripes
        if(f.type.name==='watermelon'){
            ctx.strokeStyle='rgba(0,80,0,0.3)';ctx.lineWidth=2;
            for(var s=0;s<4;s++){
                ctx.beginPath();ctx.arc(0,0,f.r*0.5+s*f.r*0.12,0,Math.PI*2);ctx.stroke();
            }
        }
    }
    ctx.restore();
}

function drawHalf(half,type,side){
    if(!type)return;
    ctx.save();ctx.translate(half.x,half.y);ctx.rotate(half.rot);
    ctx.beginPath();
    ctx.arc(0,0,half.r,side>0?-Math.PI/2:Math.PI/2,side>0?Math.PI/2:Math.PI*1.5);
    ctx.closePath();
    // outer skin gradient
    var skinGrad=ctx.createLinearGradient(-half.r,0,half.r,0);
    skinGrad.addColorStop(0,type.color);skinGrad.addColorStop(1,type.highlight||type.color);
    ctx.fillStyle=skinGrad;ctx.fill();
    // inner flesh gradient
    ctx.beginPath();
    ctx.arc(0,0,half.r*0.8,side>0?-Math.PI/2:Math.PI/2,side>0?Math.PI/2:Math.PI*1.5);
    ctx.closePath();
    var fleshGrad=ctx.createRadialGradient(0,0,0,0,0,half.r*0.8);
    fleshGrad.addColorStop(0,'#ffffff');fleshGrad.addColorStop(0.3,type.inner);fleshGrad.addColorStop(1,type.inner);
    ctx.fillStyle=fleshGrad;ctx.fill();
    // seeds for some fruits
    if(type.name==='watermelon'||type.name==='apple'){
        ctx.fillStyle='rgba(0,0,0,0.5)';
        for(var s=0;s<3;s++){
            var sx=(side>0?-1:1)*(3+s*3);var sy=-4+s*4;
            ctx.beginPath();ctx.ellipse(sx,sy,1.5,2.5,0.3,0,Math.PI*2);ctx.fill();
        }
    }
    ctx.restore();
}

function render(){
    // dark gradient bg with subtle pattern
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0d0818');g.addColorStop(0.5,'#1a1028');g.addColorStop(1,'#251838');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    // background stars/dots
    for(var i=0;i<bgStars.length;i++){
        var s=bgStars[i];
        ctx.globalAlpha=0.2+0.15*Math.sin(gameTime*2+s.twinkle);
        ctx.fillStyle='#aabbcc';
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // wooden board texture at bottom
    var boardGrad=ctx.createLinearGradient(0,H*0.88,0,H);
    boardGrad.addColorStop(0,'#3a2515');boardGrad.addColorStop(0.5,'#4a3020');boardGrad.addColorStop(1,'#2a1a0a');
    ctx.fillStyle=boardGrad;ctx.fillRect(0,H*0.92,W,H*0.08);
    // board grain
    ctx.strokeStyle='rgba(80,50,20,0.3)';ctx.lineWidth=1;
    for(var b=0;b<8;b++){
        var by=H*0.93+b*H*0.008;
        ctx.beginPath();ctx.moveTo(0,by);ctx.lineTo(W,by);ctx.stroke();
    }

    // splats with radial gradient
    for(var i=0;i<splats.length;i++){
        var s=splats[i];
        ctx.globalAlpha=s.life*0.5;
        var splatGrad=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);
        splatGrad.addColorStop(0,s.color);splatGrad.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=splatGrad;
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // fruits
    for(var i=0;i<fruits.length;i++)drawFruit(fruits[i]);

    // slice trail with glow
    if(sliceTrail.length>1){
        ctx.lineCap='round';ctx.lineJoin='round';
        for(var i=1;i<sliceTrail.length;i++){
            var t=sliceTrail[i];var prev=sliceTrail[i-1];
            ctx.globalAlpha=t.life*2;
            // outer glow
            ctx.save();
            ctx.shadowColor='#aaddff';ctx.shadowBlur=10;
            ctx.strokeStyle='#ffffff';ctx.lineWidth=5;
            ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(t.x,t.y);ctx.stroke();
            ctx.restore();
            // inner bright line
            ctx.strokeStyle='#cceeFF';ctx.lineWidth=2;
            ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(t.x,t.y);ctx.stroke();
        }
        ctx.globalAlpha=1;
    }

    // particles with glow
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;
        ctx.save();
        if(!p.isJuice){ctx.shadowColor=p.color;ctx.shadowBlur=4;}
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha=1;

    // HUD: lives as fruit icons with glow
    for(var i=0;i<maxLives;i++){
        var lx=15+i*28,ly=25;
        if(i<lives){
            ctx.save();
            ctx.shadowColor='#ff3333';ctx.shadowBlur=6;
            var lifeGrad=ctx.createRadialGradient(lx-2,ly-2,1,lx,ly,10);
            lifeGrad.addColorStop(0,'#ff6666');lifeGrad.addColorStop(1,'#cc2222');
            ctx.fillStyle=lifeGrad;ctx.beginPath();ctx.arc(lx,ly,10,0,Math.PI*2);ctx.fill();
            ctx.restore();
            ctx.fillStyle='rgba(255,255,255,0.4)';ctx.beginPath();ctx.arc(lx-2,ly-3,4,0,Math.PI*2);ctx.fill();
        }else{
            ctx.strokeStyle='#553333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(lx,ly,10,0,Math.PI*2);ctx.stroke();
        }
    }
    // score with glow
    ctx.save();
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.textAlign='right';ctx.fillText(score,W-15,32);
    ctx.restore();

    // combo with pulsing glow
    if(combo>=3){
        ctx.save();
        ctx.shadowColor='#ff6633';ctx.shadowBlur=12+Math.sin(gameTime*6)*5;
        ctx.fillStyle='#ff6633';ctx.font='bold '+Math.round(W*0.028)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.fillText('COMBO x'+combo+'!',W/2,H*0.08);
        ctx.restore();
    }
}

function drawTitle(dt){
    titlePulse+=dt*3;
    // rich gradient bg
    var bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0d0818');bg.addColorStop(0.4,'#1a1028');bg.addColorStop(1,'#251838');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

    // floating fruits with enhanced visuals
    for(var i=0;i<6;i++){
        var ft=FRUIT_TYPES[i];
        var x=W*0.1+i*(W*0.8/5);
        var y=H*0.45+Math.sin(titlePulse+i*1.2)*25;
        var r=Math.min(W,H)*0.04;
        ctx.save();ctx.translate(x,y);ctx.rotate(titlePulse*0.5+i);
        var g=ctx.createRadialGradient(-r*0.2,-r*0.2,r*0.05,0,0,r);
        g.addColorStop(0,ft.highlight||ft.inner);g.addColorStop(0.4,ft.color);g.addColorStop(1,ft.color);
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
        // shine
        ctx.fillStyle='rgba(255,255,255,0.35)';
        ctx.beginPath();ctx.arc(-r*0.2,-r*0.25,r*0.3,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';
    ctx.fillText('FRUIT NINJA',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Swipe/drag to slice fruits! Avoid bombs!',W/2,H*0.25);
    ctx.fillText('3 lives \u2014 miss a fruit or hit a bomb = -1 life',W/2,H*0.3);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.7);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    if(bestScore>0)ctx.fillText('Best: '+bestScore,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='x'+combo;
    document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(['Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onMouseDown(e){
    if(gameState!=='playing'){resetGame();return;}
    mouseDown=true;
    var r=canvas.getBoundingClientRect();
    mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;
    lastMX=mouseX;lastMY=mouseY;
}
function onMouseMove(e){
    if(!mouseDown)return;
    var r=canvas.getBoundingClientRect();
    lastMX=mouseX;lastMY=mouseY;
    mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;
}
function onMouseUp(){mouseDown=false;combo=0;}

function onTouchStart(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    mouseDown=true;
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    mouseX=t.clientX-r.left;mouseY=t.clientY-r.top;
    lastMX=mouseX;lastMY=mouseY;
}
function onTouchMove(e){
    e.preventDefault();
    if(!mouseDown)return;
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    lastMX=mouseX;lastMY=mouseY;
    mouseX=t.clientX-r.left;mouseY=t.clientY-r.top;
}
function onTouchEnd(e){e.preventDefault();mouseDown=false;combo=0;}

window.initFruitNinja=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('mousedown',onMouseDown);
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mouseup',onMouseUp);
    canvas.addEventListener('mouseleave',onMouseUp);
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove',onTouchMove,{passive:false});
    canvas.addEventListener('touchend',onTouchEnd,{passive:false});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopFruitNinja=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('mousedown',onMouseDown);
    canvas.removeEventListener('mousemove',onMouseMove);
    canvas.removeEventListener('mouseup',onMouseUp);
    canvas.removeEventListener('mouseleave',onMouseUp);
    window.removeEventListener('resize',resize);
    mouseDown=false;gameState='title';
};
})();
