// Crossy Road — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var player={x:0,y:0,targetX:0,targetY:0,row:0,dead:false};
var TILE,rows=[],cameraY=0,targetCamY=0;
var score=0,bestScore=0,furthestRow=0;
var particles=[];
var ROW_TYPES=['grass','road','road','road','grass','road','road','river','river','grass','road','road','road','grass','rail','grass'];
var VEHICLE_COLORS=['#ff3333','#3399ff','#ffcc00','#33cc33','#ff9933','#cc66ff','#ff6699'];

function diffMult(){var s=score;return s<10?0.7:(s<30?1.0:1.0+(s-30)*0.02);}
function darkenColor(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;TILE=Math.min(W/13,H/10);TILE=Math.max(TILE,24);}

function makeRow(idx){
    var type=ROW_TYPES[((idx%ROW_TYPES.length)+ROW_TYPES.length)%ROW_TYPES.length];
    if(idx<=0)type='grass'; // starting area
    var row={type:type,idx:idx,items:[]};
    if(type==='road'){
        var dir=Math.random()<0.5?1:-1;
        var dm=diffMult();var speed=(40+Math.random()*50)*dm;
        var gap=Math.max(TILE*2,TILE*3+Math.random()*TILE*3/dm);
        var count=Math.ceil(W/gap)+2;
        var color=VEHICLE_COLORS[Math.floor(Math.random()*VEHICLE_COLORS.length)];
        for(var i=0;i<count;i++){
            row.items.push({x:i*gap+(Math.random()-0.5)*TILE,w:TILE*1.5+Math.random()*TILE,dir:dir,speed:speed,color:color});
        }
    }else if(type==='river'){
        var dir=Math.random()<0.5?1:-1;
        var speed=30+Math.random()*35;
        var gap=TILE*2.5+Math.random()*TILE*2;
        var count=Math.ceil(W/gap)+3;
        for(var i=0;i<count;i++){
            row.items.push({x:i*gap,w:TILE*2+Math.random()*TILE,dir:dir,speed:speed,isLog:true});
        }
    }else if(type==='rail'){
        row.trainTimer=4+Math.random()*6;
        row.trainX=-W;row.trainActive=false;row.trainWarning=false;row.trainSpeed=600;
        row.trainDir=Math.random()<0.5?1:-1;
    }
    return row;
}

function ensureRows(){
    var minRow=player.row-5;var maxRow=player.row+15;
    while(rows.length===0||rows[0].idx>minRow){
        var idx=rows.length===0?minRow:rows[0].idx-1;
        rows.unshift(makeRow(idx));
    }
    while(rows[rows.length-1].idx<maxRow){
        rows.push(makeRow(rows[rows.length-1].idx+1));
    }
    // prune far rows
    while(rows.length>0&&rows[0].idx<minRow-3)rows.shift();
    while(rows.length>0&&rows[rows.length-1].idx>maxRow+3)rows.pop();
}

function resetGame(){
    player={x:Math.floor(6.5)*TILE,y:0,targetX:Math.floor(6.5)*TILE,targetY:0,row:0,dead:false};
    rows=[];score=0;furthestRow=0;gameTime=0;particles=[];
    cameraY=0;targetCamY=0;
    ensureRows();
    gameState='playing';
}

function movePlayer(dr,dc){
    if(player.dead)return;
    var newRow=player.row+dr;
    var newX=player.targetX+dc*TILE;
    if(newX<0||newX>W-TILE)return;
    player.targetX=newX;
    player.row=newRow;
    player.targetY=newRow*TILE;
    if(newRow>furthestRow){furthestRow=newRow;score=furthestRow;if(score>bestScore)bestScore=score;}
    ensureRows();
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*80+20;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+1});
    }
}

function getRow(idx){
    for(var i=0;i<rows.length;i++)if(rows[i].idx===idx)return rows[i];
    return null;
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;

    // smooth movement
    var lerpSpeed=12;
    player.x+=(player.targetX-player.x)*Math.min(1,lerpSpeed*dt);
    player.y+=(player.targetY-player.y)*Math.min(1,lerpSpeed*dt);

    // camera
    targetCamY=player.row*TILE-H*0.6;
    cameraY+=(targetCamY-cameraY)*Math.min(1,5*dt);

    // update row items
    for(var i=0;i<rows.length;i++){
        var row=rows[i];
        if(row.type==='road'||row.type==='river'){
            for(var j=0;j<row.items.length;j++){
                var item=row.items[j];
                item.x+=item.dir*item.speed*dt;
                if(item.dir>0&&item.x>W+TILE*2)item.x=-item.w-TILE;
                if(item.dir<0&&item.x+item.w<-TILE*2)item.x=W+TILE;
            }
        }
        if(row.type==='rail'){
            if(!row.trainActive){
                row.trainTimer-=dt;
                if(row.trainTimer<1.5)row.trainWarning=true;
                if(row.trainTimer<=0){
                    row.trainActive=true;
                    row.trainX=row.trainDir>0?-W*1.5:W*1.5;
                }
            }else{
                row.trainX+=row.trainDir*row.trainSpeed*dt;
                if((row.trainDir>0&&row.trainX>W*2)||(row.trainDir<0&&row.trainX<-W*2)){
                    row.trainActive=false;row.trainWarning=false;row.trainTimer=5+Math.random()*6;
                }
            }
        }
    }

    // collision check
    if(!player.dead){
        var currentRow=getRow(player.row);
        if(currentRow){
            if(currentRow.type==='road'){
                for(var j=0;j<currentRow.items.length;j++){
                    var v=currentRow.items[j];
                    if(player.x+TILE*0.7>v.x&&player.x+TILE*0.3<v.x+v.w){
                        player.dead=true;
                        addParticles(player.x+TILE/2,player.y-cameraY+TILE/2,'#ff3333',15);
                        setTimeout(function(){gameState='gameover';},500);
                        return;
                    }
                }
            }
            if(currentRow.type==='river'){
                var onLog=false;
                for(var j=0;j<currentRow.items.length;j++){
                    var log=currentRow.items[j];
                    if(player.x+TILE*0.6>log.x&&player.x+TILE*0.4<log.x+log.w){
                        onLog=true;
                        player.targetX+=log.dir*log.speed*dt;
                        player.x+=log.dir*log.speed*dt;
                        break;
                    }
                }
                if(!onLog){
                    player.dead=true;
                    addParticles(player.x+TILE/2,player.y-cameraY+TILE/2,'#3366ff',15);
                    setTimeout(function(){gameState='gameover';},500);
                    return;
                }
            }
            if(currentRow.type==='rail'&&currentRow.trainActive){
                var tx=currentRow.trainX;
                if(player.x+TILE*0.6>tx&&player.x+TILE*0.4<tx+W*1.2){
                    player.dead=true;
                    addParticles(player.x+TILE/2,player.y-cameraY+TILE/2,'#ff3333',20);
                    setTimeout(function(){gameState='gameover';},500);
                    return;
                }
            }
        }
    }

    // particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawRowBg(row,screenY){
    var y=screenY;
    if(row.type==='grass'){
        var shade=row.idx%2===0?'#2d5a1e':'#347a22';
        ctx.fillStyle=shade;ctx.fillRect(0,y,W,TILE);
        // grass tufts
        ctx.fillStyle='#4a8a33';
        for(var x=0;x<W;x+=TILE*0.7){
            ctx.fillRect(x+(row.idx*7)%15,y+TILE*0.6,3,TILE*0.3);
        }
    }else if(row.type==='road'){
        ctx.fillStyle='#444';ctx.fillRect(0,y,W,TILE);
        // lane markings
        ctx.fillStyle='#666';
        for(var x=0;x<W;x+=TILE*2){ctx.fillRect(x,y+TILE*0.45,TILE*0.8,TILE*0.1);}
    }else if(row.type==='river'){
        var wave=Math.sin(gameTime*2+row.idx)*0.1;
        ctx.fillStyle='rgb(30,80,'+(160+Math.floor(wave*40))+')';ctx.fillRect(0,y,W,TILE);
        // ripples
        ctx.strokeStyle='rgba(100,180,255,0.3)';ctx.lineWidth=1;
        for(var x=0;x<W;x+=20){
            ctx.beginPath();ctx.arc(x+Math.sin(gameTime+row.idx+x*0.1)*5,y+TILE/2,3,0,Math.PI);ctx.stroke();
        }
    }else if(row.type==='rail'){
        ctx.fillStyle='#5a5040';ctx.fillRect(0,y,W,TILE);
        // rails
        ctx.fillStyle='#888';ctx.fillRect(0,y+TILE*0.3,W,3);ctx.fillRect(0,y+TILE*0.6,W,3);
        // ties
        ctx.fillStyle='#6a5a48';
        for(var x=0;x<W;x+=TILE*0.5){ctx.fillRect(x,y+TILE*0.2,6,TILE*0.7);}
        // warning
        if(row.trainWarning&&!row.trainActive){
            ctx.fillStyle=Math.sin(gameTime*10)>0?'#ff0000':'transparent';
            ctx.font='bold '+Math.round(TILE*0.5)+'px "Courier New",monospace';ctx.textAlign='center';
            ctx.fillText('!!! TRAIN !!!',W/2,y+TILE*0.55);
        }
    }
}

function render(){
    ctx.fillStyle='#1a3a1a';ctx.fillRect(0,0,W,H);

    // draw rows
    for(var i=0;i<rows.length;i++){
        var row=rows[i];
        var y=row.idx*TILE-cameraY;
        if(y+TILE<0||y>H)continue;
        drawRowBg(row,y);

        // items
        if(row.type==='road'){
            for(var j=0;j<row.items.length;j++){
                var v=row.items[j];
                ctx.save();
                // Vehicle shadow
                ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(v.x+2,y+4,v.w,TILE-4);
                // Vehicle body with gradient
                var vg=ctx.createLinearGradient(v.x,y+2,v.x,y+TILE-2);
                vg.addColorStop(0,v.color);vg.addColorStop(1,darkenColor(v.color,40));
                ctx.fillStyle=vg;ctx.fillRect(v.x,y+2,v.w,TILE-4);
                // Top highlight
                ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(v.x+2,y+2,v.w-4,TILE*0.2);
                // Windshield
                var wg=ctx.createLinearGradient(0,y+4,0,y+TILE-6);
                wg.addColorStop(0,'rgba(120,180,240,0.6)');wg.addColorStop(1,'rgba(80,130,200,0.4)');
                ctx.fillStyle=wg;
                var wx=v.dir>0?v.x+v.w-TILE*0.35:v.x+3;
                ctx.fillRect(wx,y+4,TILE*0.28,TILE-8);
                // Windshield glare
                ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(wx+1,y+4,TILE*0.08,TILE*0.3);
                // Headlights (glowing)
                ctx.shadowColor='#ffee88';ctx.shadowBlur=4;
                ctx.fillStyle='#ffee88';
                var hx=v.dir>0?v.x+v.w-3:v.x;
                ctx.fillRect(hx,y+4,3,3);ctx.fillRect(hx,y+TILE-7,3,3);
                ctx.shadowBlur=0;
                // Taillights (red)
                ctx.fillStyle='#ff3333';
                var tlx=v.dir>0?v.x:v.x+v.w-3;
                ctx.fillRect(tlx,y+4,3,3);ctx.fillRect(tlx,y+TILE-7,3,3);
                // Wheels
                ctx.fillStyle='#222';
                ctx.beginPath();ctx.arc(v.x+TILE*0.3,y+TILE-2,TILE*0.1,0,Math.PI*2);ctx.fill();
                ctx.beginPath();ctx.arc(v.x+v.w-TILE*0.3,y+TILE-2,TILE*0.1,0,Math.PI*2);ctx.fill();
                // Wheel hubcaps
                ctx.fillStyle='#666';
                ctx.beginPath();ctx.arc(v.x+TILE*0.3,y+TILE-2,TILE*0.04,0,Math.PI*2);ctx.fill();
                ctx.beginPath();ctx.arc(v.x+v.w-TILE*0.3,y+TILE-2,TILE*0.04,0,Math.PI*2);ctx.fill();
                ctx.restore();
            }
        }
        if(row.type==='river'){
            for(var j=0;j<row.items.length;j++){
                var log=row.items[j];
                ctx.fillStyle='#8B6914';ctx.fillRect(log.x,y+3,log.w,TILE-6);
                ctx.strokeStyle='#6B4914';ctx.lineWidth=1;ctx.strokeRect(log.x,y+3,log.w,TILE-6);
                // wood grain
                ctx.strokeStyle='rgba(107,73,20,0.4)';
                for(var lx=log.x+8;lx<log.x+log.w-4;lx+=12){
                    ctx.beginPath();ctx.arc(lx,y+TILE/2,4,0,Math.PI*2);ctx.stroke();
                }
            }
        }
        if(row.type==='rail'&&row.trainActive){
            ctx.fillStyle='#cc3333';
            ctx.fillRect(row.trainX,y+1,W*1.2,TILE-2);
            // train windows
            ctx.fillStyle='#ffee88';
            for(var wx=row.trainX+20;wx<row.trainX+W*1.2-20;wx+=30){
                ctx.fillRect(wx,y+5,10,TILE*0.4);
            }
        }
    }

    // draw player
    if(!player.dead){
        var px=player.x,py=player.y-cameraY;
        // shadow
        ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(px+TILE/2,py+TILE*0.88,TILE*0.35,TILE*0.1,0,0,Math.PI*2);ctx.fill();
        ctx.save();
        // Chicken body with gradient
        var bodyG=ctx.createLinearGradient(px+TILE*0.2,py+TILE*0.15,px+TILE*0.2,py+TILE*0.75);
        bodyG.addColorStop(0,'#ffdd55');bodyG.addColorStop(1,'#eebb22');
        ctx.fillStyle=bodyG;ctx.fillRect(px+TILE*0.2,py+TILE*0.15,TILE*0.6,TILE*0.6);
        // Wing detail
        ctx.fillStyle='rgba(255,200,50,0.6)';
        ctx.fillRect(px+TILE*0.15,py+TILE*0.3,TILE*0.12,TILE*0.3);
        ctx.fillRect(px+TILE*0.73,py+TILE*0.3,TILE*0.12,TILE*0.3);
        // Belly highlight
        ctx.fillStyle='rgba(255,255,200,0.2)';ctx.fillRect(px+TILE*0.35,py+TILE*0.4,TILE*0.3,TILE*0.25);
        // Head with gradient
        var headG=ctx.createRadialGradient(px+TILE*0.5,py+TILE*0.08,TILE*0.02,px+TILE*0.5,py+TILE*0.12,TILE*0.2);
        headG.addColorStop(0,'#ffee66');headG.addColorStop(1,'#ffcc33');
        ctx.fillStyle=headG;ctx.fillRect(px+TILE*0.3,py,TILE*0.4,TILE*0.25);
        // Comb (red)
        ctx.fillStyle='#ee3333';
        ctx.beginPath();ctx.arc(px+TILE*0.42,py-TILE*0.02,TILE*0.05,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px+TILE*0.5,py-TILE*0.04,TILE*0.05,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px+TILE*0.58,py-TILE*0.02,TILE*0.05,0,Math.PI*2);ctx.fill();
        // Eyes with pupils
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(px+TILE*0.38,py+TILE*0.07,TILE*0.05,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px+TILE*0.62,py+TILE*0.07,TILE*0.05,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#111';
        ctx.beginPath();ctx.arc(px+TILE*0.39,py+TILE*0.07,TILE*0.025,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px+TILE*0.63,py+TILE*0.07,TILE*0.025,0,Math.PI*2);ctx.fill();
        // Beak
        ctx.fillStyle='#ff6633';
        ctx.beginPath();ctx.moveTo(px+TILE*0.45,py+TILE*0.14);ctx.lineTo(px+TILE*0.5,py+TILE*0.2);ctx.lineTo(px+TILE*0.55,py+TILE*0.14);ctx.closePath();ctx.fill();
        // Feet
        ctx.fillStyle='#ff8844';
        ctx.fillRect(px+TILE*0.3,py+TILE*0.75,TILE*0.08,TILE*0.08);
        ctx.fillRect(px+TILE*0.62,py+TILE*0.75,TILE*0.08,TILE*0.08);
        ctx.restore();
    }

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
}

function drawTitle(dt){
    ctx.fillStyle='#1a3a1a';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // road stripes animation
    for(var y=0;y<H;y+=60){
        ctx.fillStyle=y%120<60?'#2d5a1e':'#444';ctx.fillRect(0,y,W,60);
        if(y%120>=60){ctx.fillStyle='#666';for(var x=0;x<W;x+=50)ctx.fillRect(x+(titlePulse*20)%50,y+27,25,5);}
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc33';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ffcc33';
    ctx.fillText('CROSSY ROAD',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Hop forward: avoid cars, ride logs, dodge trains!',W/2,H*0.25);
    ctx.fillText('Arrow keys or WASD to move',W/2,H*0.3);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.73);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#ff3333';ctx.fillText('SPLAT!',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
    if(bestScore>0){ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillText('Best: '+bestScore,W/2,H*0.52);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='BEST '+bestScore;
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){update(dt);titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

var moveThrottle=false;
function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing'||player.dead)return;
    if(moveThrottle)return;moveThrottle=true;setTimeout(function(){moveThrottle=false;},100);
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')movePlayer(1,0);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')movePlayer(-1,0);
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')movePlayer(0,-1);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')movePlayer(0,1);
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    // tap direction based on where user taps relative to player
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var px=player.x+TILE/2,py=player.y-cameraY+TILE/2;
    var dx=mx-px,dy=my-py;
    if(Math.abs(dx)>Math.abs(dy)){
        movePlayer(0,dx>0?1:-1);
    }else{
        movePlayer(dy<0?1:-1,0);
    }
}

function onTouch(e){e.preventDefault();onClick({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY});}

// D-pad buttons
function setupButtons(){
    var map={up:[1,0],down:[-1,0],left:[0,-1],right:[0,1]};
    ['up','down','left','right'].forEach(function(dir){
        var btn=document.getElementById('btn-'+dir);
        if(btn){
            btn.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing'){resetGame();return;}movePlayer(map[dir][0],map[dir][1]);});
            btn.addEventListener('mousedown',function(){if(gameState!=='playing'){resetGame();return;}movePlayer(map[dir][0],map[dir][1]);});
        }
    });
}

window.initCrossyRoad=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch,{passive:false});
    setupButtons();
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopCrossyRoad=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
