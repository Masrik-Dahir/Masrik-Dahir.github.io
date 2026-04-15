// Battleship — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var GRID=10,CELL;
var playerGrid=[],aiGrid=[],playerShots=[],aiShots=[];
var playerShips=[],aiShips=[];
var SHIPS=[5,4,3,3,2]; // carrier, battleship, cruiser, submarine, destroyer
var SHIP_NAMES=['CARRIER','BATTLESHIP','CRUISER','SUBMARINE','DESTROYER'];
var phase='place'; // 'place','player','ai','done'
var placingIdx=0,placingHoriz=true,hoverR=-1,hoverC=-1;
var score=0,bestScore=0,playerHits=0,aiHits=0,totalPlayerCells=0,totalAiCells=0;
var particles=[],splashEffects=[];
var aiLastHit=null,aiHuntStack=[],aiMode='hunt';
var gridLX,gridLY,gridRX,gridRY;
var turnMessage='',turnMsgTimer=0,diffLevel=1;

function diffMult(){return diffLevel<=2?0.7:(diffLevel<=5?1.0:1.0+(diffLevel-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcLayout();}

function calcLayout(){
    CELL=Math.min((W-30)/22,(H-80)/12);
    CELL=Math.max(CELL,16);
    var totalW=CELL*10*2+CELL*2;
    gridLX=(W-totalW)/2;
    gridLY=H*0.18;
    gridRX=gridLX+CELL*10+CELL*2;
    gridRY=gridLY;
}

function makeGrid(){var g=[];for(var r=0;r<GRID;r++){g[r]=[];for(var c=0;c<GRID;c++)g[r][c]=0;}return g;}

function resetGame(){
    playerGrid=makeGrid();aiGrid=makeGrid();
    playerShots=makeGrid();aiShots=makeGrid();
    playerShips=[];aiShips=[];
    placingIdx=0;placingHoriz=true;hoverR=-1;hoverC=-1;
    playerHits=0;aiHits=0;totalPlayerCells=0;totalAiCells=0;
    particles=[];splashEffects=[];
    aiLastHit=null;aiHuntStack=[];aiMode='hunt';
    turnMessage='';turnMsgTimer=0;
    // Place AI ships randomly
    for(var i=0;i<SHIPS.length;i++){
        placeShipRandom(aiGrid,SHIPS[i]);
    }
    // count cells
    for(var r=0;r<GRID;r++)for(var c=0;c<GRID;c++){if(aiGrid[r][c])totalAiCells++;}
    phase='place';
    gameState='playing';gameTime=0;
}

function placeShipRandom(grid,size){
    for(var att=0;att<500;att++){
        var horiz=Math.random()<0.5;
        var r=Math.floor(Math.random()*GRID);
        var c=Math.floor(Math.random()*GRID);
        if(canPlace(grid,r,c,size,horiz)){
            doPlace(grid,r,c,size,horiz);return true;
        }
    }
    return false;
}

function canPlace(grid,r,c,size,horiz){
    for(var i=0;i<size;i++){
        var nr=horiz?r:r+i;var nc=horiz?c+i:c;
        if(nr<0||nr>=GRID||nc<0||nc>=GRID)return false;
        if(grid[nr][nc])return false;
    }
    return true;
}

function doPlace(grid,r,c,size,horiz){
    for(var i=0;i<size;i++){
        var nr=horiz?r:r+i;var nc=horiz?c+i:c;
        grid[nr][nc]=size;
    }
}

function playerPlaceShip(r,c){
    var size=SHIPS[placingIdx];
    if(canPlace(playerGrid,r,c,size,placingHoriz)){
        doPlace(playerGrid,r,c,size,placingHoriz);
        placingIdx++;
        if(placingIdx>=SHIPS.length){
            totalPlayerCells=0;
            for(var rr=0;rr<GRID;rr++)for(var cc=0;cc<GRID;cc++){if(playerGrid[rr][cc])totalPlayerCells++;}
            phase='player';turnMessage='YOUR TURN — FIRE!';turnMsgTimer=2;
        }
    }
}

function playerFire(r,c){
    if(phase!=='player')return;
    if(playerShots[r][c])return;
    playerShots[r][c]=1;
    if(aiGrid[r][c]){
        playerShots[r][c]=2; // hit
        playerHits++;
        addParticles(gridRX+c*CELL+CELL/2,gridRY+r*CELL+CELL/2,'#ff6633',12);
        addSplash(gridRX+c*CELL+CELL/2,gridRY+r*CELL+CELL/2,'#ff3333');
        if(playerHits>=totalAiCells){
            score=Math.max(1,1000-Math.floor(gameTime));if(score>bestScore)bestScore=score;
            phase='done';turnMessage='YOU WIN!';gameState='gameover';return;
        }
        turnMessage='HIT!';turnMsgTimer=1;
    }else{
        addSplash(gridRX+c*CELL+CELL/2,gridRY+r*CELL+CELL/2,'#3399ff');
        turnMessage='MISS';turnMsgTimer=1;
    }
    phase='ai';
    setTimeout(aiTurn,600);
}

function aiTurn(){
    if(phase!=='ai')return;
    var r,c;
    if(aiMode==='target'&&aiHuntStack.length>0){
        var next=aiHuntStack.pop();r=next.r;c=next.c;
        if(r<0||r>=GRID||c<0||c>=GRID||aiShots[r][c]){aiTurn();return;}
    }else{
        aiMode='hunt';
        // Hunt mode - at higher difficulty, use checkerboard parity
        var dm=diffMult();var tries=0;
        do{r=Math.floor(Math.random()*GRID);c=Math.floor(Math.random()*GRID);
        // At higher difficulty, prefer checkerboard pattern for efficiency
        if(dm>1.0&&(r+c)%2!==0&&tries<100){tries++;continue;}
        tries++;}
        while(aiShots[r][c]&&tries<200);
        if(tries>=200)return;
    }
    aiShots[r][c]=1;
    if(playerGrid[r][c]){
        aiShots[r][c]=2;aiHits++;
        addParticles(gridLX+c*CELL+CELL/2,gridLY+r*CELL+CELL/2,'#ff3333',10);
        addSplash(gridLX+c*CELL+CELL/2,gridLY+r*CELL+CELL/2,'#ff3333');
        aiMode='target';
        aiHuntStack.push({r:r-1,c:c},{r:r+1,c:c},{r:r,c:c-1},{r:r,c:c+1});
        if(aiHits>=totalPlayerCells){
            score=0;phase='done';turnMessage='AI WINS!';gameState='gameover';return;
        }
    }else{
        addSplash(gridLX+c*CELL+CELL/2,gridLY+r*CELL+CELL/2,'#3366aa');
    }
    phase='player';turnMessage='YOUR TURN';turnMsgTimer=1.5;
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*80+20;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+1});
    }
}
function addSplash(x,y,color){splashEffects.push({x:x,y:y,r:0,maxR:CELL*1.5,life:1,color:color});}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    if(turnMsgTimer>0)turnMsgTimer-=dt;
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
    for(var i=splashEffects.length-1;i>=0;i--){
        var s=splashEffects[i];s.r+=dt*100;s.life-=dt*2;
        if(s.life<=0)splashEffects.splice(i,1);
    }
}

function drawGrid(gx,gy,grid,shots,showShips,label){
    // label
    ctx.fillStyle='#aaa';ctx.font='bold '+Math.round(CELL*0.6)+'px "Courier New",monospace';
    ctx.textAlign='center';ctx.fillText(label,gx+GRID*CELL/2,gy-8);
    // ocean water bg with wave texture
    for(var r=0;r<GRID;r++){
        for(var c=0;c<GRID;c++){
            var x=gx+c*CELL,y=gy+r*CELL;
            var wave1=Math.sin(gameTime*2+r*0.5+c*0.3)*0.15;
            var wave2=Math.sin(gameTime*1.3+r*0.8-c*0.5)*0.1;
            var waveB=80+Math.floor((wave1+wave2)*35);
            var waveG=40+Math.floor((wave1+wave2)*15);
            var wg=ctx.createLinearGradient(x,y,x+CELL,y+CELL);
            wg.addColorStop(0,'rgba(15,'+waveG+','+waveB+',1)');wg.addColorStop(1,'rgba(20,'+(waveG+5)+','+(waveB+10)+',1)');
            ctx.fillStyle=wg;ctx.fillRect(x,y,CELL-1,CELL-1);
            // Wave ripple highlight
            ctx.fillStyle='rgba(100,180,255,'+(0.03+wave1*0.05)+')';
            ctx.fillRect(x,y,CELL-1,CELL*0.3);
            // show ships with gradient hull
            if(showShips&&grid[r][c]){
                var sg=ctx.createLinearGradient(x,y,x,y+CELL);
                sg.addColorStop(0,'rgba(120,140,160,0.75)');sg.addColorStop(1,'rgba(80,100,120,0.75)');
                ctx.fillStyle=sg;ctx.fillRect(x+1,y+1,CELL-3,CELL-3);
                ctx.strokeStyle='rgba(150,170,190,0.4)';ctx.lineWidth=0.5;ctx.strokeRect(x+1,y+1,CELL-3,CELL-3);
            }
            // shots
            if(shots[r][c]===2){// hit - explosion effect
                ctx.save();ctx.shadowColor='#ff3300';ctx.shadowBlur=6;
                ctx.fillStyle='rgba(255,50,30,0.5)';ctx.fillRect(x,y,CELL-1,CELL-1);
                // Animated fire
                var fireAlpha=0.5+0.2*Math.sin(gameTime*5+r+c);
                ctx.fillStyle='rgba(255,100,0,'+fireAlpha+')';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL*0.3,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='rgba(255,200,0,'+fireAlpha*0.5+')';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL*0.35,CELL*0.15,0,Math.PI*2);ctx.fill();
                ctx.shadowBlur=0;ctx.restore();
                // X mark
                ctx.strokeStyle='#ff3333';ctx.lineWidth=2;
                ctx.beginPath();ctx.moveTo(x+3,y+3);ctx.lineTo(x+CELL-4,y+CELL-4);ctx.stroke();
                ctx.beginPath();ctx.moveTo(x+CELL-4,y+3);ctx.lineTo(x+3,y+CELL-4);ctx.stroke();
            }else if(shots[r][c]===1){// miss - water splash ring
                ctx.fillStyle='rgba(80,140,200,0.2)';ctx.fillRect(x,y,CELL-1,CELL-1);
                ctx.strokeStyle='rgba(120,180,240,0.4)';ctx.lineWidth=1;
                ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL*0.25,0,Math.PI*2);ctx.stroke();
                ctx.fillStyle='rgba(150,200,240,0.5)';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL*0.1,0,Math.PI*2);ctx.fill();
            }
        }
    }
    // Coordinate labels
    ctx.fillStyle='rgba(150,180,220,0.5)';ctx.font=Math.round(CELL*0.35)+'px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    for(var c=0;c<GRID;c++){ctx.fillText(String.fromCharCode(65+c),gx+c*CELL+CELL/2,gy-CELL*0.3);}
    for(var r=0;r<GRID;r++){ctx.fillText((r+1),gx-CELL*0.4,gy+r*CELL+CELL/2);}
    // grid lines with subtle glow
    ctx.strokeStyle='rgba(50,80,120,0.5)';ctx.lineWidth=1;
    for(var i=0;i<=GRID;i++){
        ctx.beginPath();ctx.moveTo(gx+i*CELL,gy);ctx.lineTo(gx+i*CELL,gy+GRID*CELL);ctx.stroke();
        ctx.beginPath();ctx.moveTo(gx,gy+i*CELL);ctx.lineTo(gx+GRID*CELL,gy+i*CELL);ctx.stroke();
    }
    // hover for placement
    if(phase==='place'&&showShips&&hoverR>=0){
        var size=SHIPS[placingIdx];
        var ok=canPlace(grid,hoverR,hoverC,size,placingHoriz);
        ctx.fillStyle=ok?'rgba(0,255,100,0.3)':'rgba(255,0,0,0.3)';
        for(var i=0;i<size;i++){
            var nr=placingHoriz?hoverR:hoverR+i;var nc=placingHoriz?hoverC+i:hoverC;
            if(nr>=0&&nr<GRID&&nc>=0&&nc<GRID)ctx.fillRect(gx+nc*CELL,gy+nr*CELL,CELL-1,CELL-1);
        }
    }
}

function render(){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    drawGrid(gridLX,gridLY,playerGrid,aiShots,true,'YOUR FLEET');
    drawGrid(gridRX,gridRY,aiGrid,playerShots,false,'ENEMY WATERS');

    // splash effects
    for(var i=0;i<splashEffects.length;i++){
        var s=splashEffects[i];
        ctx.globalAlpha=s.life*0.5;ctx.strokeStyle=s.color;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=1;

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // info
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.textAlign='center';
    if(phase==='place'){
        ctx.fillStyle='#33ccff';
        ctx.fillText('PLACE '+SHIP_NAMES[placingIdx]+' (SIZE '+SHIPS[placingIdx]+')  — R/SPACE TO ROTATE — CLICK TO PLACE',W/2,H-12);
    }else{
        ctx.fillText('YOUR HITS: '+playerHits+'/'+totalAiCells+'  |  AI HITS: '+aiHits+'/'+totalPlayerCells,W/2,H-12);
    }
    // turn message
    if(turnMsgTimer>0){
        ctx.save();ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.03)+'px "Courier New",monospace';
        ctx.fillStyle=turnMessage.indexOf('HIT')>=0?'#ff6633':'#33ccff';
        ctx.globalAlpha=Math.min(1,turnMsgTimer);
        ctx.fillText(turnMessage,W/2,gridLY-25);ctx.restore();ctx.globalAlpha=1;
    }
}

function drawTitle(dt){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // animated waves
    for(var y=0;y<3;y++){
        ctx.strokeStyle='rgba(30,60,120,'+(0.3+y*0.1)+')';ctx.lineWidth=2;ctx.beginPath();
        for(var x=0;x<=W;x+=5){
            var yy=H*0.45+y*15+Math.sin(titlePulse+x*0.02+y)*10;
            if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
        }
        ctx.stroke();
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#3399ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#3399ff';
    ctx.fillText('BATTLESHIP',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Place your ships, then sink the enemy fleet!',W/2,H*0.25);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.65);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    var won=playerHits>=totalAiCells;
    ctx.shadowColor=won?'#33ff66':'#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle=won?'#33ff66':'#ff3333';ctx.fillText(won?'VICTORY!':'DEFEATED',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Time: '+Math.floor(gameTime)+'s',W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent=phase==='place'?'PLACE':phase.toUpperCase();
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){update(dt);titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function gridCellFromPos(mx,my,gx,gy){
    var c=Math.floor((mx-gx)/CELL);var r=Math.floor((my-gy)/CELL);
    if(r>=0&&r<GRID&&c>=0&&c<GRID)return{r:r,c:c};
    return null;
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    if((e.key==='r'||e.key==='R'||e.key===' ')&&phase==='place')placingHoriz=!placingHoriz;
    if(['Tab',' '].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function handleClick(mx,my){
    if(gameState!=='playing'){resetGame();return;}
    if(phase==='place'){
        var cell=gridCellFromPos(mx,my,gridLX,gridLY);
        if(cell)playerPlaceShip(cell.r,cell.c);
    }else if(phase==='player'){
        var cell=gridCellFromPos(mx,my,gridRX,gridRY);
        if(cell)playerFire(cell.r,cell.c);
    }
}

function onMouseMove(e){
    if(gameState!=='playing'||phase!=='place')return;
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var cell=gridCellFromPos(mx,my,gridLX,gridLY);
    if(cell){hoverR=cell.r;hoverC=cell.c;}else{hoverR=-1;hoverC=-1;}
}

function onClick(e){
    var r=canvas.getBoundingClientRect();
    handleClick(e.clientX-r.left,e.clientY-r.top);
}

function onTouch(e){
    e.preventDefault();
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    handleClick(t.clientX-r.left,t.clientY-r.top);
}

window.initBattleship=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    canvas.addEventListener('mousemove',onMouseMove);
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopBattleship=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    canvas.removeEventListener('mousemove',onMouseMove);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
