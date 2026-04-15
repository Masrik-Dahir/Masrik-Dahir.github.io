// Qix — Claim territory by drawing lines, avoid Qix and Sparx
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=80,ROWS=60,grid,player,qix,sparx,claimed,target,drawing,trail;
var score=0,level=1,lives=3,particles=[];
var keyLeft=false,keyRight=false,keyUp=false,keyDown=false;
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellW(){return W/COLS;}
function cellH(){return H/ROWS;}

function resetGame(){
    score=0;level=1;lives=3;particles=[];gameTime=0;
    initLevel();
    gameState='playing';
}

function initLevel(){
    grid=[];
    for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++){
        grid[r][c]=(r===0||r===ROWS-1||c===0||c===COLS-1)?1:0;
    }}
    player={x:Math.floor(COLS/2),y:ROWS-1,onBorder:true};
    drawing=false;trail=[];
    claimed=0;target=75;
    // Qix - abstract bouncing shape scaled by difficulty
    var dm=diffMult();
    qix={x:COLS/2,y:ROWS/3,vx:(1.2+level*0.15)*dm,vy:(0.8+level*0.1)*dm,points:[],phase:0};
    for(var i=0;i<6+Math.floor(level/3);i++)qix.points.push({ox:Math.random()*6-3,oy:Math.random()*6-3,speed:(1+Math.random()*2)*dm,phase:Math.random()*Math.PI*2});
    // Sparx - travel along borders
    sparx=[{x:0,y:0,dir:0,speed:(0.8+level*0.08)*dm}];
    if(level>2)sparx.push({x:COLS-1,y:ROWS-1,dir:2,speed:(0.7+level*0.07)*dm});
    if(level>5)sparx.push({x:COLS-1,y:0,dir:1,speed:(0.9+level*0.06)*dm});
    updateClaimed();
}

function updateClaimed(){
    var total=(COLS-2)*(ROWS-2);
    var filled=0;
    for(var r=1;r<ROWS-1;r++)for(var c=1;c<COLS-1;c++)if(grid[r][c]===1)filled++;
    claimed=Math.round(filled/total*100);
}

function isOnBorder(x,y){
    if(x<0||x>=COLS||y<0||y>=ROWS)return false;
    return grid[Math.round(y)][Math.round(x)]===1;
}

function floodFill(startR,startC,val,tempGrid){
    var stack=[{r:startR,c:startC}];
    var count=0;
    while(stack.length>0){
        var p=stack.pop();
        var r=p.r,c=p.c;
        if(r<1||r>=ROWS-1||c<1||c>=COLS-1)continue;
        if(tempGrid[r][c]!==0)continue;
        tempGrid[r][c]=val;count++;
        stack.push({r:r-1,c:c},{r:r+1,c:c},{r:r,c:c-1},{r:r,c:c+1});
    }
    return count;
}

function claimTerritory(){
    // Mark trail as border
    for(var i=0;i<trail.length;i++)grid[trail[i].y][trail[i].x]=1;
    // Flood fill from Qix position - that area stays empty, fill the rest
    var tempGrid=[];
    for(var r=0;r<ROWS;r++){tempGrid[r]=[];for(var c=0;c<COLS;c++)tempGrid[r][c]=grid[r][c];}
    // Find Qix cell
    var qr=Math.round(qix.y),qc=Math.round(qix.x);
    qr=Math.max(1,Math.min(ROWS-2,qr));qc=Math.max(1,Math.min(COLS-2,qc));
    // Fill from qix position
    floodFill(qr,qc,2,tempGrid);
    // Everything still 0 becomes claimed
    var gained=0;
    for(var r=1;r<ROWS-1;r++)for(var c=1;c<COLS-1;c++){
        if(tempGrid[r][c]===0){grid[r][c]=1;gained++;}
    }
    score+=gained*10*level;
    // Particles for claimed area
    for(var i=0;i<trail.length;i+=2){
        addParticles(trail[i].x*cellW()+cellW()/2,trail[i].y*cellH()+cellH()/2,
            ['#ff44ff','#44ffff','#ffff44','#44ff44'][Math.floor(Math.random()*4)],3);
    }
    trail=[];drawing=false;
    updateClaimed();
    if(claimed>=target){level++;score+=5000;initLevel();}
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.6+Math.random()*0.4,color:c,size:2+Math.random()*2});}

function loseLife(){
    lives--;trail=[];drawing=false;
    player={x:Math.floor(COLS/2),y:ROWS-1,onBorder:true};
    addParticles(W/2,H-10,'#ff3333',20);
    if(lives<=0)gameState='gameover';
}

function moveQix(dt){
    qix.phase+=dt*2;
    qix.x+=qix.vx*dt*30;qix.y+=qix.vy*dt*30;
    // Bounce off borders/claimed
    if(qix.x<=2||qix.x>=COLS-2||grid[Math.round(qix.y)][Math.round(Math.min(COLS-1,Math.max(0,qix.x)))]===1){qix.vx*=-1;qix.x+=qix.vx*dt*30;}
    if(qix.y<=2||qix.y>=ROWS-2||grid[Math.round(Math.min(ROWS-1,Math.max(0,qix.y)))][Math.round(qix.x)]===1){qix.vy*=-1;qix.y+=qix.vy*dt*30;}
    qix.x=Math.max(2,Math.min(COLS-3,qix.x));
    qix.y=Math.max(2,Math.min(ROWS-3,qix.y));
    // Animate points
    for(var i=0;i<qix.points.length;i++){
        var p=qix.points[i];p.phase+=dt*p.speed*3;
    }
    // Check if Qix hits trail
    if(drawing){
        var qr=Math.round(qix.y),qc=Math.round(qix.x);
        for(var i=0;i<trail.length;i++){
            if(trail[i].x===qc&&trail[i].y===qr){loseLife();return;}
        }
    }
}

function moveSparx(dt){
    for(var s=0;s<sparx.length;s++){
        var sp=sparx[s];
        // Move along border
        var speed=sp.speed*dt*30;
        var moved=0;
        while(moved<speed){
            var nx=sp.x,ny=sp.y;
            // Try directions: 0=right,1=down,2=left,3=up
            var dirs=[[1,0],[0,1],[-1,0],[0,-1]];
            var d=dirs[sp.dir];
            nx=Math.round(sp.x+d[0]);ny=Math.round(sp.y+d[1]);
            if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&grid[ny][nx]===1){
                sp.x=nx;sp.y=ny;moved+=1;
            } else {
                // Try turning
                sp.dir=(sp.dir+1)%4;
                var tried=0;
                while(tried<4){
                    d=dirs[sp.dir];
                    nx=Math.round(sp.x+d[0]);ny=Math.round(sp.y+d[1]);
                    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&grid[ny][nx]===1)break;
                    sp.dir=(sp.dir+1)%4;tried++;
                }
                if(tried>=4)break;
            }
        }
        // Check collision with player
        if(Math.round(sp.x)===Math.round(player.x)&&Math.round(sp.y)===Math.round(player.y)){loseLife();}
    }
}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    // Player movement
    var speed=0.3;
    var nx=player.x,ny=player.y;
    if(keyLeft)nx=player.x-1;
    if(keyRight)nx=player.x+1;
    if(keyUp)ny=player.y-1;
    if(keyDown)ny=player.y+1;
    nx=Math.max(0,Math.min(COLS-1,Math.round(nx)));
    ny=Math.max(0,Math.min(ROWS-1,Math.round(ny)));
    if(nx!==player.x||ny!==player.y){
        var onBorder=grid[ny][nx]===1;
        if(drawing){
            // Check if returning to border
            if(onBorder){
                player.x=nx;player.y=ny;
                claimTerritory();
            } else {
                // Check if cell is already in trail (self-intersection = death)
                var selfHit=false;
                for(var i=0;i<trail.length;i++){if(trail[i].x===nx&&trail[i].y===ny){selfHit=true;break;}}
                if(selfHit){loseLife();}
                else{
                    trail.push({x:nx,y:ny});
                    grid[ny][nx]=2; // trail marker
                    player.x=nx;player.y=ny;
                }
            }
        } else {
            if(onBorder){
                player.x=nx;player.y=ny;
            } else {
                // Start drawing
                drawing=true;trail=[{x:nx,y:ny}];
                grid[ny][nx]=2;
                player.x=nx;player.y=ny;
            }
        }
    }
    moveQix(dt);
    moveSparx(dt);
    // Particles
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    // Rich dark background with subtle pattern
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#080828');bg.addColorStop(1,'#0a0a2e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cw=cellW(),ch=cellH();
    // Draw grid with enhanced colors
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        var v=grid[r][c];
        if(v===1){
            var hue=(c*3+r*5+level*40)%360;
            var grd=ctx.createLinearGradient(c*cw,r*ch,c*cw+cw,r*ch+ch);
            grd.addColorStop(0,'hsla('+hue+',70%,40%,0.85)');
            grd.addColorStop(1,'hsla('+((hue+30)%360)+',60%,30%,0.85)');
            ctx.fillStyle=grd;
            ctx.fillRect(c*cw,r*ch,cw+0.5,ch+0.5);
        } else if(v===2){
            // Glowing trail
            ctx.save();ctx.shadowColor='#ffffff';ctx.shadowBlur=4;
            ctx.fillStyle='rgba(255,255,255,0.85)';
            ctx.fillRect(c*cw,r*ch,cw+0.5,ch+0.5);
            ctx.shadowBlur=0;ctx.restore();
        }
    }
    // Border decoration
    ctx.save();ctx.strokeStyle='rgba(100,100,255,0.3)';ctx.lineWidth=2;
    ctx.strokeRect(0,0,W,H);ctx.restore();
    // Draw Qix
    ctx.save();
    ctx.strokeStyle='#ff44ff';ctx.lineWidth=2;ctx.shadowColor='#ff44ff';ctx.shadowBlur=15;
    ctx.beginPath();
    for(var i=0;i<qix.points.length;i++){
        var p=qix.points[i];
        var px=qix.x*cw+Math.sin(qix.phase+p.phase)*p.ox*cw;
        var py=qix.y*ch+Math.cos(qix.phase+p.phase)*p.oy*ch;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.stroke();
    // Fill qix with gradient
    var grd=ctx.createRadialGradient(qix.x*cw,qix.y*ch,0,qix.x*cw,qix.y*ch,cw*4);
    grd.addColorStop(0,'rgba(255,68,255,0.4)');grd.addColorStop(1,'rgba(68,255,255,0.1)');
    ctx.fillStyle=grd;ctx.fill();
    ctx.shadowBlur=0;ctx.restore();
    // Second Qix outline
    ctx.strokeStyle='#44ffff';ctx.lineWidth=1;ctx.beginPath();
    for(var i=0;i<qix.points.length;i++){
        var p=qix.points[i];
        var px=qix.x*cw+Math.cos(qix.phase*1.3+p.phase)*p.ox*cw*0.7;
        var py=qix.y*ch+Math.sin(qix.phase*1.3+p.phase)*p.oy*ch*0.7;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.stroke();
    // Draw Sparx
    for(var s=0;s<sparx.length;s++){
        var sp=sparx[s];
        ctx.save();ctx.shadowColor='#ff8800';ctx.shadowBlur=10;
        ctx.fillStyle='#ff8800';
        ctx.beginPath();ctx.arc(sp.x*cw+cw/2,sp.y*ch+ch/2,cw*0.6,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();ctx.arc(sp.x*cw+cw/2,sp.y*ch+ch/2,cw*0.3,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;ctx.restore();
    }
    // Draw player
    ctx.save();ctx.shadowColor='#00ff88';ctx.shadowBlur=12;
    ctx.fillStyle='#00ff88';
    ctx.beginPath();ctx.arc(player.x*cw+cw/2,player.y*ch+ch/2,cw*0.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#aaffcc';
    ctx.beginPath();ctx.arc(player.x*cw+cw/2-cw*0.2,player.y*ch+ch/2-ch*0.2,cw*0.3,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.restore();
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
    // HUD overlay
    ctx.textAlign='left';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillStyle='#fff';ctx.fillText('CLAIMED: '+claimed+'% / '+target+'%',10,20);
    ctx.fillText('LIVES: '+lives,10,40);
    ctx.fillText('LEVEL: '+level,10,60);
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Animated background lines
    for(var i=0;i<20;i++){
        var x1=Math.sin(titlePulse+i*0.5)*W*0.3+W/2;
        var y1=Math.cos(titlePulse*0.7+i*0.3)*H*0.3+H/2;
        var x2=Math.sin(titlePulse*1.2+i*0.8)*W*0.4+W/2;
        var y2=Math.cos(titlePulse*0.5+i*0.6)*H*0.4+H/2;
        ctx.strokeStyle='hsla('+(i*18+titlePulse*20)+',80%,60%,0.2)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff44ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ff44ff';ctx.fillText('QIX',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Draw lines to claim 75% of the territory',W/2,H*0.38);
    ctx.fillText('Avoid the QIX (abstract shape) and SPARX (border enemies)',W/2,H*0.44);
    ctx.fillText('Arrow keys / WASD to move',W/2,H*0.52);
    // Demo
    ctx.strokeStyle='rgba(255,68,255,0.4)';ctx.lineWidth=2;
    ctx.beginPath();
    for(var i=0;i<6;i++){
        var px=W/2+Math.sin(titlePulse*2+i)*W*0.08;
        var py=H*0.65+Math.cos(titlePulse*1.5+i*1.2)*H*0.06;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.stroke();
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
    ctx.fillText('CLAIMED: '+claimed+'%',W/2,H*0.59);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent='Claimed: '+claimed+'%';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

var moveTimer=0;
function onKey(e,down){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keyLeft=down;keyRight=false;keyUp=false;keyDown=false;}
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keyRight=down;keyLeft=false;keyUp=false;keyDown=false;}
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){keyUp=down;keyDown=false;keyLeft=false;keyRight=false;}
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keyDown=down;keyUp=false;keyLeft=false;keyRight=false;}
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};var ku=function(e){onKey(e,false);};

function bindMobile(id,setKey){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();setKey(true);});
    el.addEventListener('touchend',function(e){e.preventDefault();setKey(false);});
    el.addEventListener('mousedown',function(){setKey(true);});el.addEventListener('mouseup',function(){setKey(false);});}

window.initQix=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')resetGame();});
    bindMobile('btn-left',function(v){keyLeft=v;if(v){keyRight=false;keyUp=false;keyDown=false;}});
    bindMobile('btn-right',function(v){keyRight=v;if(v){keyLeft=false;keyUp=false;keyDown=false;}});
    bindMobile('btn-up',function(v){keyUp=v;if(v){keyDown=false;keyLeft=false;keyRight=false;}});
    bindMobile('btn-down',function(v){keyDown=v;if(v){keyUp=false;keyLeft=false;keyRight=false;}});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopQix=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
