// Puzzle Bobble / Bust-a-Move — Shoot colored bubbles to match 3+
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var score=0,level=1,particles=[];
var BUBBLE_COLORS=['#ff3333','#33ff33','#3333ff','#ffff33','#ff33ff','#33ffff'];
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}
var GRID_COLS=8,GRID_ROWS=12,grid,launcher,nextColor,bubbleRadius;
var activeBubble,ceiling,popAnim=[];

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;bubbleRadius=Math.min(W/(GRID_COLS*2+2),H/(GRID_ROWS*2+6))*0.9;}

function resetGame(){
    score=0;level=1;particles=[];popAnim=[];gameTime=0;
    initLevel();
    gameState='playing';
}

function initLevel(){
    grid=[];
    var dm=diffMult();
    var rows=3+Math.min(Math.floor(level*dm),8);
    for(var r=0;r<GRID_ROWS;r++){grid[r]=[];
        var cols=(r%2===0)?GRID_COLS:GRID_COLS-1;
        for(var c=0;c<cols;c++){
            grid[r][c]=r<rows?Math.floor(Math.random()*Math.min(3+level,BUBBLE_COLORS.length)):null;
        }
    }
    launcher={angle:-Math.PI/2,x:W/2,y:H-bubbleRadius*3};
    nextColor=Math.floor(Math.random()*Math.min(3+level,BUBBLE_COLORS.length));
    activeBubble=null;ceiling=0;
}

function gridToPixel(r,c){
    var br=bubbleRadius;
    var offX=(r%2===0)?0:br;
    var x=br+c*br*2+offX+W*0.02;
    var y=br+r*br*1.73+ceiling;
    return{x:x,y:y};
}

function pixelToGrid(px,py){
    var br=bubbleRadius;
    py-=ceiling;
    var r=Math.round((py-br)/(br*1.73));
    r=Math.max(0,Math.min(GRID_ROWS-1,r));
    var offX=(r%2===0)?0:br;
    var c=Math.round((px-br-offX-W*0.02)/(br*2));
    var maxC=(r%2===0)?GRID_COLS-1:GRID_COLS-2;
    c=Math.max(0,Math.min(maxC,c));
    return{r:r,c:c};
}

function shoot(){
    if(activeBubble)return;
    var speed=500;
    activeBubble={
        x:launcher.x,y:launcher.y,
        vx:Math.cos(launcher.angle)*speed,
        vy:Math.sin(launcher.angle)*speed,
        color:nextColor
    };
    nextColor=Math.floor(Math.random()*Math.min(3+level,BUBBLE_COLORS.length));
}

function findMatches(r,c,color){
    var visited={};var matches=[];
    var stack=[{r:r,c:c}];
    while(stack.length>0){
        var p=stack.pop();
        var key=p.r+','+p.c;
        if(visited[key])continue;
        visited[key]=true;
        if(p.r<0||p.r>=GRID_ROWS)continue;
        var maxC=(p.r%2===0)?GRID_COLS-1:GRID_COLS-2;
        if(p.c<0||p.c>maxC)continue;
        if(grid[p.r][p.c]!==color)continue;
        matches.push(p);
        // Neighbors
        var neighbors=getNeighbors(p.r,p.c);
        for(var i=0;i<neighbors.length;i++)stack.push(neighbors[i]);
    }
    return matches;
}

function getNeighbors(r,c){
    var n=[];
    n.push({r:r,c:c-1},{r:r,c:c+1});
    if(r%2===0){
        n.push({r:r-1,c:c-1},{r:r-1,c:c},{r:r+1,c:c-1},{r:r+1,c:c});
    } else {
        n.push({r:r-1,c:c},{r:r-1,c:c+1},{r:r+1,c:c},{r:r+1,c:c+1});
    }
    return n;
}

function removeFloating(){
    // BFS from top row
    var connected={};
    var stack=[];
    for(var c=0;c<GRID_COLS;c++){
        if(grid[0][c]!==null&&grid[0][c]!==undefined){
            stack.push({r:0,c:c});
        }
    }
    while(stack.length>0){
        var p=stack.pop();
        var key=p.r+','+p.c;
        if(connected[key])continue;
        connected[key]=true;
        var neighbors=getNeighbors(p.r,p.c);
        for(var i=0;i<neighbors.length;i++){
            var nr=neighbors[i].r,nc=neighbors[i].c;
            if(nr<0||nr>=GRID_ROWS)continue;
            var maxC=(nr%2===0)?GRID_COLS-1:GRID_COLS-2;
            if(nc<0||nc>maxC)continue;
            if(grid[nr][nc]!==null&&grid[nr][nc]!==undefined){
                stack.push({r:nr,c:nc});
            }
        }
    }
    var removed=0;
    for(var r=0;r<GRID_ROWS;r++){
        var maxC=(r%2===0)?GRID_COLS:GRID_COLS-1;
        for(var c=0;c<maxC;c++){
            var key=r+','+c;
            if(grid[r][c]!==null&&grid[r][c]!==undefined&&!connected[key]){
                var pos=gridToPixel(r,c);
                popAnim.push({x:pos.x,y:pos.y,color:BUBBLE_COLORS[grid[r][c]],life:0.5,vy:100+Math.random()*200,vx:(Math.random()-0.5)*100});
                grid[r][c]=null;removed++;
            }
        }
    }
    return removed;
}

function checkEmpty(){
    for(var r=0;r<GRID_ROWS;r++){
        var maxC=(r%2===0)?GRID_COLS:GRID_COLS-1;
        for(var c=0;c<maxC;c++){
            if(grid[r][c]!==null&&grid[r][c]!==undefined)return false;
        }
    }
    return true;
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,life:0.6+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    // Move active bubble
    if(activeBubble){
        activeBubble.x+=activeBubble.vx*dt;
        activeBubble.y+=activeBubble.vy*dt;
        // Wall bounce
        if(activeBubble.x<bubbleRadius){activeBubble.x=bubbleRadius;activeBubble.vx*=-1;}
        if(activeBubble.x>W-bubbleRadius){activeBubble.x=W-bubbleRadius;activeBubble.vx*=-1;}
        // Ceiling
        if(activeBubble.y<bubbleRadius+ceiling){
            var gc=pixelToGrid(activeBubble.x,activeBubble.y);
            snapBubble(gc.r,gc.c);
            return;
        }
        // Collision with grid bubbles
        for(var r=0;r<GRID_ROWS;r++){
            var maxC=(r%2===0)?GRID_COLS:GRID_COLS-1;
            for(var c=0;c<maxC;c++){
                if(grid[r][c]===null||grid[r][c]===undefined)continue;
                var pos=gridToPixel(r,c);
                var dx=activeBubble.x-pos.x,dy=activeBubble.y-pos.y;
                if(Math.sqrt(dx*dx+dy*dy)<bubbleRadius*1.8){
                    var gc=pixelToGrid(activeBubble.x,activeBubble.y);
                    snapBubble(gc.r,gc.c);
                    return;
                }
            }
        }
    }
    // Pop animations
    for(var i=popAnim.length-1;i>=0;i--){
        var p=popAnim[i];p.y+=p.vy*dt;p.x+=p.vx*dt;p.life-=dt;
        if(p.life<=0)popAnim.splice(i,1);
    }
    // Particles
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function snapBubble(r,c){
    if(!activeBubble)return;
    r=Math.max(0,Math.min(GRID_ROWS-1,r));
    var maxC=(r%2===0)?GRID_COLS-1:GRID_COLS-2;
    c=Math.max(0,Math.min(maxC,c));
    if(grid[r][c]!==null&&grid[r][c]!==undefined){
        // Find nearest empty neighbor
        var neighbors=getNeighbors(r,c);
        var bestDist=Infinity,bestN=null;
        for(var i=0;i<neighbors.length;i++){
            var nr=neighbors[i].r,nc=neighbors[i].c;
            if(nr<0||nr>=GRID_ROWS)continue;
            var mC=(nr%2===0)?GRID_COLS-1:GRID_COLS-2;
            if(nc<0||nc>mC)continue;
            if(grid[nr][nc]!==null&&grid[nr][nc]!==undefined)continue;
            var pos=gridToPixel(nr,nc);
            var dx=activeBubble.x-pos.x,dy=activeBubble.y-pos.y;
            var dist=dx*dx+dy*dy;
            if(dist<bestDist){bestDist=dist;bestN={r:nr,c:nc};}
        }
        if(bestN){r=bestN.r;c=bestN.c;}
        else{activeBubble=null;return;}
    }
    grid[r][c]=activeBubble.color;
    // Check matches
    var matches=findMatches(r,c,activeBubble.color);
    if(matches.length>=3){
        for(var i=0;i<matches.length;i++){
            var pos=gridToPixel(matches[i].r,matches[i].c);
            addParticles(pos.x,pos.y,BUBBLE_COLORS[activeBubble.color],5);
            popAnim.push({x:pos.x,y:pos.y,color:BUBBLE_COLORS[activeBubble.color],life:0.4,vy:-50,vx:(Math.random()-0.5)*80});
            grid[matches[i].r][matches[i].c]=null;
        }
        score+=matches.length*100;
        var floaters=removeFloating();
        score+=floaters*150;
    }
    activeBubble=null;
    // Check win
    if(checkEmpty()){level++;score+=2000;initLevel();}
    // Check lose - bubbles too low
    for(var rc=GRID_ROWS-2;rc<GRID_ROWS;rc++){
        var mC=(rc%2===0)?GRID_COLS:GRID_COLS-1;
        for(var cc=0;cc<mC;cc++){
            if(grid[rc][cc]!==null&&grid[rc][cc]!==undefined){
                var pos=gridToPixel(rc,cc);
                if(pos.y+bubbleRadius>H-bubbleRadius*4){gameState='gameover';return;}
            }
        }
    }
}

function render(){
    // Background gradient
    var bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a0a3e');bg.addColorStop(1,'#1a0a2e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Grid border
    ctx.strokeStyle='rgba(100,100,255,0.3)';ctx.lineWidth=2;
    ctx.strokeRect(0,0,W,H-bubbleRadius*4);
    // Draw grid bubbles
    for(var r=0;r<GRID_ROWS;r++){
        var maxC=(r%2===0)?GRID_COLS:GRID_COLS-1;
        for(var c=0;c<maxC;c++){
            if(grid[r][c]===null||grid[r][c]===undefined)continue;
            var pos=gridToPixel(r,c);
            drawBubble(pos.x,pos.y,bubbleRadius*0.9,BUBBLE_COLORS[grid[r][c]]);
        }
    }
    // Active bubble
    if(activeBubble){
        drawBubble(activeBubble.x,activeBubble.y,bubbleRadius*0.9,BUBBLE_COLORS[activeBubble.color]);
    }
    // Pop animations
    for(var i=0;i<popAnim.length;i++){
        var p=popAnim[i];
        ctx.globalAlpha=p.life*2;
        ctx.beginPath();ctx.arc(p.x,p.y,bubbleRadius*(1+0.5*(0.5-p.life)),0,Math.PI*2);
        ctx.fillStyle=p.color;ctx.fill();
    }
    ctx.globalAlpha=1;
    // Launcher
    ctx.save();
    ctx.translate(launcher.x,launcher.y);ctx.rotate(launcher.angle);
    ctx.fillStyle='#888';ctx.fillRect(0,-4,bubbleRadius*2.5,8);
    ctx.fillStyle='#aaa';ctx.beginPath();ctx.arc(0,0,bubbleRadius*0.7,0,Math.PI*2);ctx.fill();
    ctx.restore();
    // Next bubble indicator
    drawBubble(launcher.x+bubbleRadius*3,launcher.y,bubbleRadius*0.6,BUBBLE_COLORS[nextColor]);
    ctx.textAlign='center';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';
    ctx.fillStyle='#888';ctx.fillText('NEXT',launcher.x+bubbleRadius*3,launcher.y+bubbleRadius*1.5);
    // Aim line
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(launcher.x,launcher.y);
    ctx.lineTo(launcher.x+Math.cos(launcher.angle)*H*0.6,launcher.y+Math.sin(launcher.angle)*H*0.6);
    ctx.stroke();ctx.setLineDash([]);
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawBubble(x,y,r,color){
    ctx.save();
    // Outer glow
    ctx.shadowColor=color;ctx.shadowBlur=6;
    var grd=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.05,x,y,r);
    grd.addColorStop(0,'#ffffff');grd.addColorStop(0.15,'rgba(255,255,255,0.8)');grd.addColorStop(0.35,color);grd.addColorStop(0.8,darken(color,40));grd.addColorStop(1,darken(color,80));
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Primary specular highlight
    ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.beginPath();ctx.arc(x-r*0.25,y-r*0.3,r*0.25,0,Math.PI*2);ctx.fill();
    // Secondary highlight
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.beginPath();ctx.arc(x+r*0.2,y+r*0.15,r*0.12,0,Math.PI*2);ctx.fill();
    // Rim light
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,r*0.92,3.5,5.5);ctx.stroke();
    ctx.restore();
}

function darken(hex,amt){
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    r=Math.max(0,r-amt);g=Math.max(0,g-amt);b=Math.max(0,b-amt);
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a3e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Floating bubbles
    for(var i=0;i<15;i++){
        var bx=W*0.1+((i*W*0.07+titlePulse*30)%(W*0.8));
        var by=H*0.2+Math.sin(titlePulse+i*0.8)*H*0.1+(i%3)*H*0.15;
        drawBubble(bx,by,W*0.02,BUBBLE_COLORS[i%BUBBLE_COLORS.length]);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#33ff33';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
    ctx.fillStyle='#33ff33';ctx.fillText('PUZZLE',W/2,H*0.2);
    ctx.fillStyle='#ffff33';ctx.fillText('BOBBLE',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Shoot bubbles to match 3+ of same color!',W/2,H*0.42);
    ctx.fillText('Left/Right to aim, Up/Space to shoot',W/2,H*0.48);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
    ctx.fillText('SCORE: '+score,W/2,H*0.45);
    ctx.fillText('LEVEL: '+level,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent='';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

var keyLeft=false,keyRight=false,keyUp=false;
function onKey(e,down){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keyLeft=down;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keyRight=down;
    if((e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')&&down&&gameState==='playing')shoot();
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};var ku=function(e){onKey(e,false);};

// Aim with keys
function aimUpdate(){
    if(gameState!=='playing')return;
    if(keyLeft)launcher.angle=Math.max(-Math.PI*0.9,launcher.angle-0.03);
    if(keyRight)launcher.angle=Math.min(-Math.PI*0.1,launcher.angle+0.03);
}
var aimInterval;

function bindMobile(id,setKey){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();setKey(true);});
    el.addEventListener('touchend',function(e){e.preventDefault();setKey(false);});
    el.addEventListener('mousedown',function(){setKey(true);});el.addEventListener('mouseup',function(){setKey(false);});}

window.initPuzzleBobble=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
    canvas.addEventListener('click',function(e){
        if(gameState!=='playing'){resetGame();return;}
        var r=canvas.getBoundingClientRect();
        var mx=e.clientX-r.left,my=e.clientY-r.top;
        launcher.angle=Math.atan2(my-launcher.y,mx-launcher.x);
        if(launcher.angle>-0.1)launcher.angle=-0.1;
        if(launcher.angle<-Math.PI+0.1)launcher.angle=-Math.PI+0.1;
        shoot();
    });
    canvas.addEventListener('touchstart',function(e){e.preventDefault();
        if(gameState!=='playing'){resetGame();return;}
        var t=e.touches[0];var r=canvas.getBoundingClientRect();
        var mx=t.clientX-r.left,my=t.clientY-r.top;
        launcher.angle=Math.atan2(my-launcher.y,mx-launcher.x);
        if(launcher.angle>-0.1)launcher.angle=-0.1;
        if(launcher.angle<-Math.PI+0.1)launcher.angle=-Math.PI+0.1;
        shoot();
    });
    bindMobile('btn-left',function(v){keyLeft=v;});
    bindMobile('btn-right',function(v){keyRight=v;});
    bindMobile('btn-up',function(v){if(v)shoot();});
    aimInterval=setInterval(aimUpdate,16);
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopPuzzleBobble=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    if(aimInterval)clearInterval(aimInterval);
    document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
