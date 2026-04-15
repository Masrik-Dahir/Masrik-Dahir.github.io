// Reversi / Othello — Place pieces to flip opponent's, vs AI
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var SIZE=8,board,turn,score=0,particles=[],flipAnim=[],validMoves=[];
var cursorR=3,cursorC=3,gameOver=false,passCount=0,aiLevel=1;
// 1=black(player), 2=white(AI)

function diffMult(){return aiLevel<=2?0.7:(aiLevel<=5?1.0:1.0+(aiLevel-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W-60)/SIZE,(H-80)/SIZE);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*SIZE)/2,y:(H-cs*SIZE)/2+10};}

function resetGame(){
    score=0;particles=[];flipAnim=[];gameTime=0;passCount=0;gameOver=false;
    board=[];for(var r=0;r<SIZE;r++){board[r]=[];for(var c=0;c<SIZE;c++)board[r][c]=0;}
    // Initial 4 pieces
    board[3][3]=2;board[3][4]=1;board[4][3]=1;board[4][4]=2;
    turn=1;validMoves=getValidMoves(1);
    cursorR=3;cursorC=3;
    gameState='playing';
}

function getValidMoves(player){
    var moves=[];
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        if(board[r][c]!==0)continue;
        if(getFlips(r,c,player).length>0)moves.push({r:r,c:c});
    }
    return moves;
}

function getFlips(r,c,player){
    var opp=player===1?2:1;
    var flips=[];
    var dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(var d=0;d<dirs.length;d++){
        var dr=dirs[d][0],dc=dirs[d][1];
        var line=[];var nr=r+dr,nc=c+dc;
        while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===opp){
            line.push({r:nr,c:nc});nr+=dr;nc+=dc;
        }
        if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player&&line.length>0){
            flips=flips.concat(line);
        }
    }
    return flips;
}

function makeMove(r,c,player){
    var flips=getFlips(r,c,player);
    if(flips.length===0)return false;
    board[r][c]=player;
    var cs=cellSize(),o=boardOrigin();
    for(var i=0;i<flips.length;i++){
        var f=flips[i];board[f.r][f.c]=player;
        flipAnim.push({r:f.r,c:f.c,from:player===1?2:1,to:player,timer:0.3,progress:0});
        addParticles(o.x+f.c*cs+cs/2,o.y+f.r*cs+cs/2,player===1?'#333':'#fff',2);
    }
    addParticles(o.x+c*cs+cs/2,o.y+r*cs+cs/2,player===1?'#333':'#fff',3);
    passCount=0;
    return true;
}

function aiMove(){
    var moves=getValidMoves(2);
    if(moves.length===0){passCount++;checkGameEnd();turn=1;validMoves=getValidMoves(1);return;}
    // Easy AI: prefer corners, then edges, then best immediate score
    var corners=[{r:0,c:0},{r:0,c:7},{r:7,c:0},{r:7,c:7}];
    for(var i=0;i<corners.length;i++){
        for(var m=0;m<moves.length;m++){
            if(moves[m].r===corners[i].r&&moves[m].c===corners[i].c){
                makeMove(moves[m].r,moves[m].c,2);
                turn=1;validMoves=getValidMoves(1);checkGameEnd();return;
            }
        }
    }
    // AI intelligence scales with difficulty
    var dm=diffMult();
    var randomChance=dm<=0.7?0.45:(dm<=1.0?0.25:Math.max(0.05,0.25-(dm-1)*0.5));
    if(Math.random()<randomChance){
        var m=moves[Math.floor(Math.random()*moves.length)];
        makeMove(m.r,m.c,2);
    } else {
        // Pick move with most flips; at high diff, also consider opponent response
        var bestScore=-999,bestMove=moves[0];
        for(var i=0;i<moves.length;i++){
            var f=getFlips(moves[i].r,moves[i].c,2).length;
            var posScore=f;
            // Corner bonus
            if((moves[i].r===0||moves[i].r===7)&&(moves[i].c===0||moves[i].c===7))posScore+=10;
            // Edge bonus
            else if(moves[i].r===0||moves[i].r===7||moves[i].c===0||moves[i].c===7)posScore+=3;
            // Avoid cells next to corners (at higher difficulty)
            if(dm>1.0){
                var ar=moves[i].r,ac=moves[i].c;
                if((ar<=1&&ac<=1)||(ar<=1&&ac>=6)||(ar>=6&&ac<=1)||(ar>=6&&ac>=6)){
                    if(!((ar===0||ar===7)&&(ac===0||ac===7)))posScore-=5;
                }
            }
            if(posScore>bestScore){bestScore=posScore;bestMove=moves[i];}
        }
        makeMove(bestMove.r,bestMove.c,2);
    }
    turn=1;validMoves=getValidMoves(1);checkGameEnd();
}

function checkGameEnd(){
    if(passCount>=2||getValidMoves(1).length===0&&getValidMoves(2).length===0){
        gameOver=true;
        var b=0,w=0;
        for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(board[r][c]===1)b++;if(board[r][c]===2)w++;}
        score=b;
        if(b<=w)gameState='gameover';
        // If player wins, keep showing the board
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*100,vy:(Math.random()-0.5)*100,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*2});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    for(var i=flipAnim.length-1;i>=0;i--){
        flipAnim[i].progress+=dt*4;
        if(flipAnim[i].progress>=1)flipAnim.splice(i,1);
    }
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
    // Check if player needs to pass
    if(turn===1&&validMoves.length===0&&!gameOver){
        passCount++;checkGameEnd();
        if(!gameOver){turn=2;setTimeout(aiMove,300);}
    }
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2e1a');bg.addColorStop(1,'#0a1a0a');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin();
    // Board - wood textured frame
    ctx.save();
    ctx.fillStyle='#5a3a1a';ctx.fillRect(o.x-6,o.y-6,cs*SIZE+12,cs*SIZE+12);
    ctx.fillStyle='#7a5a2a';ctx.fillRect(o.x-4,o.y-4,cs*SIZE+8,cs*SIZE+8);
    // Green felt board with subtle gradient
    var boardG=ctx.createLinearGradient(o.x,o.y,o.x+cs*SIZE,o.y+cs*SIZE);
    boardG.addColorStop(0,'#2a7a2a');boardG.addColorStop(0.5,'#237023');boardG.addColorStop(1,'#1e6e1e');
    ctx.fillStyle=boardG;ctx.fillRect(o.x,o.y,cs*SIZE,cs*SIZE);
    ctx.restore();
    // Grid with subtle shadow
    ctx.strokeStyle='#1a5a1a';ctx.lineWidth=1;
    for(var c=0;c<=SIZE;c++){ctx.beginPath();ctx.moveTo(o.x+c*cs,o.y);ctx.lineTo(o.x+c*cs,o.y+cs*SIZE);ctx.stroke();}
    for(var r=0;r<=SIZE;r++){ctx.beginPath();ctx.moveTo(o.x,o.y+r*cs);ctx.lineTo(o.x+cs*SIZE,o.y+r*cs);ctx.stroke();}
    // Star points with metallic look
    var dots=[{r:2,c:2},{r:2,c:6},{r:6,c:2},{r:6,c:6}];
    for(var i=0;i<dots.length;i++){ctx.fillStyle='#0e3a0e';ctx.beginPath();ctx.arc(o.x+dots[i].c*cs,o.y+dots[i].r*cs,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a5a1a';ctx.beginPath();ctx.arc(o.x+dots[i].c*cs-0.5,o.y+dots[i].r*cs-0.5,2.5,0,Math.PI*2);ctx.fill();}
    // Valid move hints
    if(turn===1){
        for(var i=0;i<validMoves.length;i++){
            var vm=validMoves[i];
            ctx.fillStyle='rgba(255,255,255,'+(.1+.1*Math.sin(gameTime*4))+')';
            ctx.beginPath();ctx.arc(o.x+vm.c*cs+cs/2,o.y+vm.r*cs+cs/2,cs*0.15,0,Math.PI*2);ctx.fill();
        }
    }
    // Pieces
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        if(board[r][c]===0)continue;
        // Check for flip animation
        var flipping=false;
        for(var f=0;f<flipAnim.length;f++){
            if(flipAnim[f].r===r&&flipAnim[f].c===c){flipping=true;
                var prog=flipAnim[f].progress;
                var scaleX=Math.abs(Math.cos(prog*Math.PI));
                var color=prog<0.5?flipAnim[f].from:flipAnim[f].to;
                drawPiece(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.4*scaleX,cs*0.4,color);
                break;
            }
        }
        if(!flipping)drawPiece(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.4,cs*0.4,board[r][c]);
    }
    // Cursor
    if(turn===1&&!gameOver){
        ctx.strokeStyle='rgba(255,255,0,'+(.4+.4*Math.sin(gameTime*6))+')';ctx.lineWidth=2;
        ctx.strokeRect(o.x+cursorC*cs+3,o.y+cursorR*cs+3,cs-6,cs-6);
    }
    // Score display
    var bCount=0,wCount=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(board[r][c]===1)bCount++;if(board[r][c]===2)wCount++;}
    ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillStyle='#333';
    drawPiece(o.x-cs*0.8,o.y+cs*0.5,cs*0.25,cs*0.25,1);
    ctx.fillStyle='#fff';ctx.fillText(bCount,o.x-cs*0.8,o.y+cs*1.2);
    drawPiece(o.x-cs*0.8,o.y+cs*2,cs*0.25,cs*0.25,2);
    ctx.fillStyle='#fff';ctx.fillText(wCount,o.x-cs*0.8,o.y+cs*2.7);
    // Turn indicator
    ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.fillStyle=turn===1?'#aaffaa':'#ffaaaa';
    ctx.fillText(turn===1?'YOUR TURN':'AI THINKING...',W/2,o.y-10);
    if(gameOver&&bCount>wCount){
        ctx.shadowColor='#00ff66';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#00ff66';ctx.fillText('YOU WIN!',W/2,o.y+cs*SIZE+35);
        ctx.shadowBlur=0;
        var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
        ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,o.y+cs*SIZE+55);
    }
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawPiece(x,y,rx,ry,player){
    ctx.save();
    // Drop shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(x+1.5,y+2,rx*0.9,ry*0.5,0,0,Math.PI*2);ctx.fill();
    // 3D edge (thickness)
    ctx.fillStyle=player===1?'#0a0a0a':'#888';
    ctx.beginPath();ctx.ellipse(x,y+2,rx,ry*0.85,0,0,Math.PI*2);ctx.fill();
    // Main face with marble-style gradient
    if(player===1){
        var grd=ctx.createRadialGradient(x-rx*0.3,y-ry*0.3,0,x,y,rx);
        grd.addColorStop(0,'#777');grd.addColorStop(0.3,'#444');grd.addColorStop(0.7,'#222');grd.addColorStop(1,'#0a0a0a');
        ctx.fillStyle=grd;
    } else {
        var grd=ctx.createRadialGradient(x-rx*0.3,y-ry*0.3,0,x,y,rx);
        grd.addColorStop(0,'#ffffff');grd.addColorStop(0.3,'#f0f0f0');grd.addColorStop(0.7,'#cccccc');grd.addColorStop(1,'#999999');
        ctx.fillStyle=grd;
    }
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
    // Specular highlight
    ctx.fillStyle=player===1?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.4)';
    ctx.beginPath();ctx.ellipse(x-rx*0.2,y-ry*0.2,rx*0.3,ry*0.2,-0.4,0,Math.PI*2);ctx.fill();
    // Rim light
    ctx.strokeStyle=player===1?'rgba(100,100,100,0.3)':'rgba(255,255,255,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x,y,rx*0.95,ry*0.95,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
}

function drawTitle(dt){
    ctx.fillStyle='#1a2e1a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Demo board
    var ds=Math.min(W*0.04,25);var ox=W/2-ds*4,oy=H*0.5;
    ctx.fillStyle='#2a6e2a';ctx.fillRect(ox,oy,ds*8,ds*8);
    ctx.strokeStyle='#1a4a1a';ctx.lineWidth=1;
    for(var i=0;i<=8;i++){ctx.beginPath();ctx.moveTo(ox+i*ds,oy);ctx.lineTo(ox+i*ds,oy+ds*8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ox,oy+i*ds);ctx.lineTo(ox+ds*8,oy+i*ds);ctx.stroke();}
    drawPiece(ox+3*ds+ds/2,oy+3*ds+ds/2,ds*0.35,ds*0.35,2);
    drawPiece(ox+4*ds+ds/2,oy+3*ds+ds/2,ds*0.35,ds*0.35,1);
    drawPiece(ox+3*ds+ds/2,oy+4*ds+ds/2,ds*0.35,ds*0.35,1);
    drawPiece(ox+4*ds+ds/2,oy+4*ds+ds/2,ds*0.35,ds*0.35,2);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#00ff66';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#00ff66';ctx.fillText('REVERSI',W/2,H*0.22);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Place pieces to flip opponents! You are BLACK.',W/2,H*0.35);
    ctx.fillText('Click/tap a cell or use arrow keys + Space',W/2,H*0.41);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.85);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    var bCount=0,wCount=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(board[r][c]===1)bCount++;if(board[r][c]===2)wCount++;}
    ctx.shadowColor='#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle=bCount>wCount?'#00ff66':'#ff3333';
    ctx.fillText(bCount>wCount?'YOU WIN!':'GAME OVER',W/2,H*0.3);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
    ctx.fillText('BLACK: '+bCount+'  WHITE: '+wCount,W/2,H*0.45);
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    var bCount=0,wCount=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(board[r][c]===1)bCount++;if(board[r][c]===2)wCount++;}
    document.getElementById('hud-score').textContent='Black: '+bCount;
    document.getElementById('hud-speed').textContent='White: '+wCount;
    document.getElementById('hud-time').textContent=turn===1?'Your Turn':'AI Turn';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function tryPlayerMove(r,c){
    if(turn!==1||gameOver)return;
    var isValid=false;
    for(var i=0;i<validMoves.length;i++){if(validMoves[i].r===r&&validMoves[i].c===c){isValid=true;break;}}
    if(!isValid)return;
    makeMove(r,c,1);
    turn=2;
    setTimeout(aiMove,400);
}

function onKey(e,down){
    if(!down)return;
    if((e.key==='Enter'||e.key==='Tab')&&(gameState!=='playing'||(gameOver))){resetGame();return;}
    if(gameState!=='playing')return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')cursorC=Math.max(0,cursorC-1);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')cursorC=Math.min(SIZE-1,cursorC+1);
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')cursorR=Math.max(0,cursorR-1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')cursorR=Math.min(SIZE-1,cursorR+1);
    if(e.key===' ')tryPlayerMove(cursorR,cursorC);
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function onClick(e){
    if(gameState!=='playing'||gameOver){resetGame();return;}
    var r=canvas.getBoundingClientRect();var cs=cellSize(),o=boardOrigin();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var gc=Math.floor((mx-o.x)/cs),gr=Math.floor((my-o.y)/cs);
    if(gc>=0&&gc<SIZE&&gr>=0&&gr<SIZE){cursorR=gr;cursorC=gc;tryPlayerMove(gr,gc);}
}

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initReversi=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',function(e){e.preventDefault();
        var t=e.touches[0];onClick({clientX:t.clientX,clientY:t.clientY});
    });
    bindMobile('btn-left',function(){cursorC=Math.max(0,cursorC-1);});
    bindMobile('btn-right',function(){cursorC=Math.min(SIZE-1,cursorC+1);});
    bindMobile('btn-up',function(){cursorR=Math.max(0,cursorR-1);});
    bindMobile('btn-down',function(){tryPlayerMove(cursorR,cursorC);});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopReversi=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
