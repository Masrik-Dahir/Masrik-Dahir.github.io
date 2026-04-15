// Klax — Colored tiles slide down a ramp, catch and drop into bins to make rows
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLORS=['#ff3333','#33ff33','#3333ff','#ffff33','#ff33ff'];
var BIN_COLS=5,BIN_ROWS=5,bins,rampTiles=[],catcher,score=0,level=1,lives=3;
var particles=[],dropAnim=null,tileSpeed,spawnTimer=0,spawnInterval;
var combo=0,catcherTile=null;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function resetGame(){
    score=0;level=1;lives=3;combo=0;particles=[];gameTime=0;
    initLevel();gameState='playing';
}

function initLevel(){
    bins=[];for(var r=0;r<BIN_ROWS;r++){bins[r]=[];for(var c=0;c<BIN_COLS;c++)bins[r][c]=null;}
    rampTiles=[];catcher={col:Math.floor(BIN_COLS/2)};catcherTile=null;
    var dm=diffMult();tileSpeed=(60+level*8)*dm;spawnInterval=Math.max(0.5,(2.0-level*0.1)/dm);spawnTimer=spawnInterval;dropAnim=null;
}

function rampX(pos){return W*0.2+(W*0.6)*(pos/5);}
function rampY(pos){return H*0.05+pos*(H*0.35)/5;}
function binOrigin(){var tileW=(W*0.6)/BIN_COLS;return{x:W*0.2,y:H*0.55,tw:tileW,th:tileW*0.7};}

function spawnTile(){
    var numColors=Math.min(3+Math.floor(level/2),COLORS.length);
    rampTiles.push({pos:0,color:Math.floor(Math.random()*numColors)});
}

function catchTile(){
    if(catcherTile!==null)return; // already holding
    // Check if any ramp tile is at the bottom
    for(var i=rampTiles.length-1;i>=0;i--){
        if(rampTiles[i].pos>=4.5){
            catcherTile=rampTiles[i].color;
            rampTiles.splice(i,1);
            addParticles(W/2,H*0.45,COLORS[catcherTile],5);
            return;
        }
    }
}

function dropTile(){
    if(catcherTile===null)return;
    var col=catcher.col;
    // Find lowest empty row in bin
    var row=-1;
    for(var r=BIN_ROWS-1;r>=0;r--){
        if(bins[r][col]===null){row=r;break;}
    }
    if(row<0){lives--;catcherTile=null;if(lives<=0)gameState='gameover';return;}
    bins[row][col]=catcherTile;
    catcherTile=null;
    var bo=binOrigin();
    addParticles(bo.x+col*bo.tw+bo.tw/2,bo.y+row*bo.th+bo.th/2,COLORS[bins[row][col]],3);
    checkBinMatches();
}

function checkBinMatches(){
    var toRemove=[];
    // Horizontal
    for(var r=0;r<BIN_ROWS;r++){
        for(var c=0;c<=BIN_COLS-3;c++){
            if(bins[r][c]!==null&&bins[r][c]===bins[r][c+1]&&bins[r][c]===bins[r][c+2]){
                toRemove.push({r:r,c:c},{r:r,c:c+1},{r:r,c:c+2});
            }
        }
    }
    // Vertical
    for(var c=0;c<BIN_COLS;c++){
        for(var r=0;r<=BIN_ROWS-3;r++){
            if(bins[r][c]!==null&&bins[r][c]===bins[r+1][c]&&bins[r][c]===bins[r+2][c]){
                toRemove.push({r:r,c:c},{r:r+1,c:c},{r:r+2,c:c});
            }
        }
    }
    // Diagonal
    for(var r=0;r<=BIN_ROWS-3;r++){
        for(var c=0;c<=BIN_COLS-3;c++){
            if(bins[r][c]!==null&&bins[r][c]===bins[r+1][c+1]&&bins[r][c]===bins[r+2][c+2]){
                toRemove.push({r:r,c:c},{r:r+1,c:c+1},{r:r+2,c:c+2});
            }
        }
        for(var c=2;c<BIN_COLS;c++){
            if(bins[r][c]!==null&&bins[r][c]===bins[r+1][c-1]&&bins[r][c]===bins[r+2][c-2]){
                toRemove.push({r:r,c:c},{r:r+1,c:c-1},{r:r+2,c:c-2});
            }
        }
    }
    var unique={};var final=[];
    for(var i=0;i<toRemove.length;i++){
        var key=toRemove[i].r+','+toRemove[i].c;
        if(!unique[key]){unique[key]=true;final.push(toRemove[i]);}
    }
    if(final.length>0){
        combo++;
        var bo=binOrigin();
        for(var i=0;i<final.length;i++){
            var f=final[i];
            addParticles(bo.x+f.c*bo.tw+bo.tw/2,bo.y+f.r*bo.th+bo.th/2,COLORS[bins[f.r][f.c]],5);
            bins[f.r][f.c]=null;
        }
        score+=final.length*100*combo*level;
        // Gravity
        for(var c=0;c<BIN_COLS;c++){
            var write=BIN_ROWS-1;
            for(var r=BIN_ROWS-1;r>=0;r--){
                if(bins[r][c]!==null){
                    if(r!==write){bins[write][c]=bins[r][c];bins[r][c]=null;}
                    write--;
                }
            }
        }
        // Check again for chains
        setTimeout(function(){checkBinMatches();},150);
    } else {
        combo=0;
        // Check level completion - score threshold
        if(score>=level*2000){level++;score+=1000;initLevel();}
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    // Spawn tiles
    spawnTimer-=dt;
    if(spawnTimer<=0){spawnTile();spawnTimer=spawnInterval;}
    // Move ramp tiles
    for(var i=rampTiles.length-1;i>=0;i--){
        rampTiles[i].pos+=dt*(tileSpeed/60);
        if(rampTiles[i].pos>5.5){
            // Missed tile
            rampTiles.splice(i,1);
            lives--;
            if(lives<=0)gameState='gameover';
        }
    }
    // Auto-catch when tile reaches bottom of ramp
    if(catcherTile===null){
        for(var i=rampTiles.length-1;i>=0;i--){
            if(rampTiles[i].pos>=4.8){
                catcherTile=rampTiles[i].color;
                rampTiles.splice(i,1);
                break;
            }
        }
    }
    // Particles
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a2e');bg.addColorStop(1,'#0a0a1e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Ramp (3D perspective)
    var rampLeft=W*0.35,rampRight=W*0.65,rampTop=H*0.05,rampBot=H*0.42;
    ctx.fillStyle='#2a2a4e';
    ctx.beginPath();
    ctx.moveTo(rampLeft+W*0.1,rampTop);ctx.lineTo(rampRight-W*0.1,rampTop);
    ctx.lineTo(rampRight,rampBot);ctx.lineTo(rampLeft,rampBot);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(150,150,255,0.3)';ctx.lineWidth=2;ctx.stroke();
    // Ramp lines
    for(var i=0;i<=5;i++){
        var t=i/5;
        var lx=rampLeft+W*0.1*(1-t);var rx=rampRight-W*0.1*(1-t);
        var y=rampTop+t*(rampBot-rampTop);
        ctx.strokeStyle='rgba(100,100,200,0.15)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(lx,y);ctx.lineTo(rx,y);ctx.stroke();
    }
    // Ramp tiles
    var tileSize=W*0.05;
    for(var i=0;i<rampTiles.length;i++){
        var rt=rampTiles[i];
        var t=rt.pos/5;
        var tx=W/2;
        var ty=rampTop+t*(rampBot-rampTop);
        var scale=0.6+t*0.4;
        drawTile3D(tx,ty,tileSize*scale,COLORS[rt.color]);
    }
    // Catcher area
    var bo=binOrigin();
    var catchY=H*0.45;
    ctx.fillStyle='rgba(100,100,150,0.3)';
    ctx.fillRect(bo.x+catcher.col*bo.tw+2,catchY,bo.tw-4,bo.th*0.6);
    ctx.strokeStyle='#ffcc00';ctx.lineWidth=2;
    ctx.strokeRect(bo.x+catcher.col*bo.tw+2,catchY,bo.tw-4,bo.th*0.6);
    // Held tile
    if(catcherTile!==null){
        drawTile3D(bo.x+catcher.col*bo.tw+bo.tw/2,catchY+bo.th*0.3,tileSize*0.8,COLORS[catcherTile]);
    }
    // Arrow indicator
    ctx.fillStyle='rgba(255,255,255,'+(.3+.3*Math.sin(gameTime*4))+')';
    ctx.beginPath();
    var ax=bo.x+catcher.col*bo.tw+bo.tw/2;
    ctx.moveTo(ax-8,catchY-12);ctx.lineTo(ax+8,catchY-12);ctx.lineTo(ax,catchY-4);ctx.closePath();ctx.fill();
    // Bins
    ctx.fillStyle='rgba(20,20,50,0.8)';
    ctx.fillRect(bo.x-2,bo.y-2,bo.tw*BIN_COLS+4,bo.th*BIN_ROWS+4);
    ctx.strokeStyle='rgba(100,100,200,0.4)';ctx.lineWidth=2;
    ctx.strokeRect(bo.x-2,bo.y-2,bo.tw*BIN_COLS+4,bo.th*BIN_ROWS+4);
    // Grid lines
    for(var c=0;c<=BIN_COLS;c++){ctx.strokeStyle='rgba(80,80,150,0.2)';ctx.beginPath();ctx.moveTo(bo.x+c*bo.tw,bo.y);ctx.lineTo(bo.x+c*bo.tw,bo.y+bo.th*BIN_ROWS);ctx.stroke();}
    for(var r=0;r<=BIN_ROWS;r++){ctx.beginPath();ctx.moveTo(bo.x,bo.y+r*bo.th);ctx.lineTo(bo.x+bo.tw*BIN_COLS,bo.y+r*bo.th);ctx.stroke();}
    // Bin tiles
    for(var r=0;r<BIN_ROWS;r++)for(var c=0;c<BIN_COLS;c++){
        if(bins[r][c]!==null){
            drawTile3D(bo.x+c*bo.tw+bo.tw/2,bo.y+r*bo.th+bo.th/2,Math.min(bo.tw,bo.th)*0.4,COLORS[bins[r][c]]);
        }
    }
    // HUD
    ctx.textAlign='left';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.fillStyle='#fff';ctx.fillText('LIVES: '+lives,10,25);
    ctx.fillText('LEVEL: '+level,10,45);
    if(combo>1){ctx.fillStyle='#ffcc00';ctx.fillText(combo+'x COMBO!',10,65);}
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawTile3D(x,y,s,color){
    ctx.save();
    var hs=s/2;
    // Drop shadow
    ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x-hs+3,y-hs+4,s,s);
    // 3D beveled sides
    // Bottom side
    ctx.fillStyle=darken(color,80);
    ctx.beginPath();ctx.moveTo(x-hs,y+hs);ctx.lineTo(x+hs,y+hs);ctx.lineTo(x+hs+3,y+hs+3);ctx.lineTo(x-hs+3,y+hs+3);ctx.closePath();ctx.fill();
    // Right side
    ctx.fillStyle=darken(color,50);
    ctx.beginPath();ctx.moveTo(x+hs,y-hs);ctx.lineTo(x+hs,y+hs);ctx.lineTo(x+hs+3,y+hs+3);ctx.lineTo(x+hs+3,y-hs+3);ctx.closePath();ctx.fill();
    // Main face with radial gradient
    var grd=ctx.createRadialGradient(x-hs*0.3,y-hs*0.3,s*0.05,x,y,s*0.8);
    grd.addColorStop(0,lighten(color,70));grd.addColorStop(0.3,lighten(color,30));grd.addColorStop(0.7,color);grd.addColorStop(1,darken(color,30));
    ctx.fillStyle=grd;ctx.fillRect(x-hs,y-hs,s,s);
    // Top bevel highlight
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.beginPath();ctx.moveTo(x-hs,y-hs);ctx.lineTo(x+hs,y-hs);ctx.lineTo(x+hs-3,y-hs+s*0.2);ctx.lineTo(x-hs+3,y-hs+s*0.2);ctx.closePath();ctx.fill();
    // Left bevel highlight
    ctx.fillStyle='rgba(255,255,255,0.1)';
    ctx.beginPath();ctx.moveTo(x-hs,y-hs);ctx.lineTo(x-hs,y+hs);ctx.lineTo(x-hs+s*0.15,y+hs-3);ctx.lineTo(x-hs+s*0.15,y-hs+3);ctx.closePath();ctx.fill();
    // Specular highlight
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(x-hs*0.25,y-hs*0.25,s*0.12,0,Math.PI*2);ctx.fill();
    // Border
    ctx.strokeStyle=darken(color,60);ctx.lineWidth=1;ctx.strokeRect(x-hs,y-hs,s,s);
    ctx.restore();
}

function lighten(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,r+a);g=Math.min(255,g+a);b=Math.min(255,b+a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function darken(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawTitle(dt){
    ctx.fillStyle='#1a0a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Demo tiles
    for(var i=0;i<5;i++){
        var tx=W*0.25+i*W*0.1;
        var ty=H*0.55+Math.sin(titlePulse+i)*H*0.03;
        drawTile3D(tx,ty,W*0.04,COLORS[i]);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff33ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ff33ff';ctx.fillText('KLAX',W/2,H*0.22);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Catch falling tiles and make rows of 3!',W/2,H*0.38);
    ctx.fillText('Left/Right to move, Down to drop tile',W/2,H*0.44);
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
    ctx.fillText('SCORE: '+score,W/2,H*0.45);ctx.fillText('LEVEL: '+level,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Level: '+level;
    document.getElementById('hud-time').textContent='Lives: '+lives;
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
    if(!down)return;
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();return;}
    if(gameState!=='playing')return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')catcher.col=Math.max(0,catcher.col-1);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')catcher.col=Math.min(BIN_COLS-1,catcher.col+1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'||e.key===' ')dropTile();
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')catchTile();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initKlax=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')resetGame();});
    bindMobile('btn-left',function(){catcher.col=Math.max(0,catcher.col-1);});
    bindMobile('btn-right',function(){catcher.col=Math.min(BIN_COLS-1,catcher.col+1);});
    bindMobile('btn-up',function(){catchTile();});
    bindMobile('btn-down',function(){dropTile();});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopKlax=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
