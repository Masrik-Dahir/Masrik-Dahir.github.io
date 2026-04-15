// Checkers — Classic board game vs easy AI, jump captures, king pieces
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var SIZE=8,board,turn,selected,validMoves,score=0,particles=[];
var cursorR=5,cursorC=0,mustJump=null,gameOver=false,aiLevel=1;
// 1=red(player), 2=black(AI), 3=red king, 4=black king

function diffMult(){return aiLevel<=2?0.7:(aiLevel<=5?1.0:1.0+(aiLevel-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W-60)/SIZE,(H-80)/SIZE);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*SIZE)/2,y:(H-cs*SIZE)/2+10};}

function resetGame(){
    score=0;particles=[];gameTime=0;gameOver=false;
    board=[];for(var r=0;r<SIZE;r++){board[r]=[];for(var c=0;c<SIZE;c++){
        board[r][c]=0;
        if((r+c)%2===1){
            if(r<3)board[r][c]=2;
            else if(r>4)board[r][c]=1;
        }
    }}
    turn=1;selected=null;validMoves=[];mustJump=null;
    cursorR=5;cursorC=0;
    gameState='playing';
}

function isPlayer(v){return v===1||v===3;}
function isAI(v){return v===2||v===4;}
function isKing(v){return v===3||v===4;}

function getMoves(r,c){
    var piece=board[r][c];if(piece===0)return{moves:[],jumps:[]};
    var dirs=[];
    if(piece===1||piece===3)dirs.push([-1,-1],[-1,1]); // Red moves up
    if(piece===2||piece===4)dirs.push([1,-1],[1,1]); // Black moves down
    if(isKing(piece)){dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];} // Kings move both ways
    var moves=[],jumps=[];
    for(var d=0;d<dirs.length;d++){
        var dr=dirs[d][0],dc=dirs[d][1];
        var nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE){
            if(board[nr][nc]===0)moves.push({r:nr,c:nc});
            else{
                // Check jump
                var jr=nr+dr,jc=nc+dc;
                var mid=board[nr][nc];
                if(jr>=0&&jr<SIZE&&jc>=0&&jc<SIZE&&board[jr][jc]===0){
                    if((isPlayer(piece)&&isAI(mid))||(isAI(piece)&&isPlayer(mid))){
                        jumps.push({r:jr,c:jc,capture:{r:nr,c:nc}});
                    }
                }
            }
        }
    }
    return{moves:moves,jumps:jumps};
}

function getAllMoves(player){
    var allMoves=[],allJumps=[];
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        var piece=board[r][c];
        if((player===1&&isPlayer(piece))||(player===2&&isAI(piece))){
            var m=getMoves(r,c);
            for(var i=0;i<m.moves.length;i++)allMoves.push({from:{r:r,c:c},to:m.moves[i]});
            for(var i=0;i<m.jumps.length;i++)allJumps.push({from:{r:r,c:c},to:m.jumps[i],capture:m.jumps[i].capture});
        }
    }
    // If jumps available, must jump
    return allJumps.length>0?{type:'jump',list:allJumps}:{type:'move',list:allMoves};
}

function executeMove(from,to,capture){
    var piece=board[from.r][from.c];
    board[from.r][from.c]=0;
    board[to.r][to.c]=piece;
    if(capture){
        board[capture.r][capture.c]=0;
        var cs=cellSize(),o=boardOrigin();
        addParticles(o.x+capture.c*cs+cs/2,o.y+capture.r*cs+cs/2,isPlayer(piece)?'#ff3333':'#333',6);
        if(isPlayer(piece))score+=100;
    }
    // King promotion
    if(piece===1&&to.r===0)board[to.r][to.c]=3;
    if(piece===2&&to.r===SIZE-1)board[to.r][to.c]=4;
    // Check for multi-jump
    if(capture){
        var nextMoves=getMoves(to.r,to.c);
        if(nextMoves.jumps.length>0){
            mustJump={r:to.r,c:to.c};
            return true; // more jumps available
        }
    }
    mustJump=null;
    return false;
}

function trySelect(r,c){
    if(turn!==1||gameOver)return;
    var piece=board[r][c];
    if(mustJump){
        // Must continue jumping with same piece
        if(r===mustJump.r&&c===mustJump.c){
            selected={r:r,c:c};
            var m=getMoves(r,c);validMoves=m.jumps;
        }
        return;
    }
    if(!isPlayer(piece))return;
    var all=getAllMoves(1);
    // If must jump, only select jumpable pieces
    if(all.type==='jump'){
        var canJump=false;
        for(var i=0;i<all.list.length;i++){
            if(all.list[i].from.r===r&&all.list[i].from.c===c){canJump=true;break;}
        }
        if(!canJump)return;
        selected={r:r,c:c};
        var m=getMoves(r,c);validMoves=m.jumps;
    } else {
        selected={r:r,c:c};
        var m=getMoves(r,c);validMoves=m.moves;
    }
}

function tryMove(r,c){
    if(!selected||turn!==1||gameOver)return;
    var isValid=false,capture=null;
    for(var i=0;i<validMoves.length;i++){
        if(validMoves[i].r===r&&validMoves[i].c===c){
            isValid=true;
            capture=validMoves[i].capture||null;
            break;
        }
    }
    if(!isValid)return;
    var moreJumps=executeMove(selected,{r:r,c:c},capture);
    if(moreJumps){
        selected={r:r,c:c};
        var m=getMoves(r,c);validMoves=m.jumps;
        return;
    }
    selected=null;validMoves=[];
    checkWin();
    if(!gameOver){turn=2;setTimeout(aiTurn,400);}
}

function aiTurn(){
    if(gameOver)return;
    var all=getAllMoves(2);
    if(all.list.length===0){gameOver=true;return;}
    // AI intelligence scales with difficulty
    var dm=diffMult();
    var randomChance=dm<=0.7?0.7:(dm<=1.0?0.5:Math.max(0.1,0.5-(dm-1)*0.8));
    var move;
    if(Math.random()<randomChance&&all.list.length>1){
        move=all.list[Math.floor(Math.random()*all.list.length)];
    } else {
        // Pick best move - prioritize jumps, advancement, and king safety
        var best=all.list[0],bestScore=-999;
        for(var i=0;i<all.list.length;i++){
            var s=all.list[i].to.r+(all.list[i].capture?8:0);
            // Prefer kingging moves
            if(all.list[i].to.r===SIZE-1)s+=5;
            // At higher difficulty, prefer center control
            if(dm>1.0){
                var cc=all.list[i].to.c;
                if(cc>=2&&cc<=5)s+=2;
            }
            if(s>bestScore){bestScore=s;best=all.list[i];}
        }
        move=best;
    }
    var moreJumps=executeMove(move.from,move.to,move.capture||null);
    while(moreJumps){
        var m=getMoves(move.to.r,move.to.c);
        if(m.jumps.length===0)break;
        var j=m.jumps[Math.floor(Math.random()*m.jumps.length)];
        moreJumps=executeMove(move.to,j,j.capture);
        move.to=j;
    }
    mustJump=null;
    checkWin();
    turn=1;
}

function checkWin(){
    var red=0,black=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        if(isPlayer(board[r][c]))red++;
        if(isAI(board[r][c]))black++;
    }
    if(black===0||getAllMoves(2).list.length===0){gameOver=true;score+=500;}
    if(red===0||getAllMoves(1).list.length===0){gameOver=true;gameState='gameover';}
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*3});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a1a0a');bg.addColorStop(1,'#1a0a0a');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin();
    // Board border (wooden frame)
    ctx.fillStyle='#8B4513';ctx.fillRect(o.x-6,o.y-6,cs*SIZE+12,cs*SIZE+12);
    ctx.fillStyle='#A0522D';ctx.fillRect(o.x-4,o.y-4,cs*SIZE+8,cs*SIZE+8);
    // Board squares
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        if((r+c)%2===0){
            ctx.fillStyle='#f0d0a0';
        } else {
            ctx.fillStyle='#6B4226';
        }
        ctx.fillRect(o.x+c*cs,o.y+r*cs,cs,cs);
    }
    // Valid move highlights
    for(var i=0;i<validMoves.length;i++){
        var vm=validMoves[i];
        ctx.fillStyle='rgba(0,255,100,'+(.15+.1*Math.sin(gameTime*4))+')';
        ctx.fillRect(o.x+vm.c*cs,o.y+vm.r*cs,cs,cs);
    }
    // Selected highlight
    if(selected){
        ctx.strokeStyle='#ffcc00';ctx.lineWidth=3;
        ctx.strokeRect(o.x+selected.c*cs+2,o.y+selected.r*cs+2,cs-4,cs-4);
    }
    // Pieces
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
        if(board[r][c]===0)continue;
        drawChecker(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.38,board[r][c]);
    }
    // Cursor
    if(turn===1&&!gameOver){
        ctx.strokeStyle='rgba(255,255,0,'+(.3+.3*Math.sin(gameTime*6))+')';ctx.lineWidth=2;
        ctx.strokeRect(o.x+cursorC*cs+1,o.y+cursorR*cs+1,cs-2,cs-2);
    }
    // Counts
    var red=0,black=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(isPlayer(board[r][c]))red++;if(isAI(board[r][c]))black++;}
    ctx.textAlign='center';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillStyle='#ff4444';ctx.fillText('RED: '+red,W/2-W*0.12,o.y-12);
    ctx.fillStyle='#aaa';ctx.fillText('BLACK: '+black,W/2+W*0.12,o.y-12);
    ctx.fillStyle=turn===1?'#ffaaaa':'#aaaaaa';
    ctx.fillText(turn===1?'YOUR TURN':'AI THINKING...',W/2,o.y+cs*SIZE+25);
    // Win state
    if(gameOver&&gameState==='playing'){
        ctx.save();ctx.shadowColor='#00ff66';ctx.shadowBlur=15;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#00ff66';ctx.fillText('YOU WIN!',W/2,o.y+cs*SIZE+50);ctx.shadowBlur=0;
        var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
        ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
        ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,o.y+cs*SIZE+70);
        ctx.restore();
    }
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
}

function drawChecker(x,y,r,type){
    ctx.save();
    var isRed=isPlayer(type);
    // Drop shadow
    ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(x+2,y+3,r,r*0.5,0,0,Math.PI*2);ctx.fill();
    // 3D edge (stack thickness)
    var edgeColor=isRed?'#771111':'#0a0a0a';
    ctx.fillStyle=edgeColor;ctx.beginPath();ctx.arc(x,y+3,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=isRed?'#991515':'#1a1a1a';ctx.beginPath();ctx.arc(x,y+1.5,r,0,Math.PI*2);ctx.fill();
    // Main body gradient
    var grd=ctx.createRadialGradient(x-r*0.25,y-r*0.25,r*0.05,x,y,r);
    if(isRed){
        grd.addColorStop(0,'#ff8888');grd.addColorStop(0.3,'#ee4444');grd.addColorStop(0.7,'#cc2222');grd.addColorStop(1,'#881111');
    } else {
        grd.addColorStop(0,'#666');grd.addColorStop(0.3,'#444');grd.addColorStop(0.7,'#2a2a2a');grd.addColorStop(1,'#111');
    }
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    // Inner ring groove
    ctx.strokeStyle=isRed?'rgba(255,150,150,0.4)':'rgba(100,100,100,0.4)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x,y,r*0.72,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=isRed?'rgba(100,0,0,0.3)':'rgba(0,0,0,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,r*0.68,0,Math.PI*2);ctx.stroke();
    // Specular highlight
    ctx.fillStyle=isRed?'rgba(255,200,200,0.3)':'rgba(200,200,200,0.2)';
    ctx.beginPath();ctx.ellipse(x-r*0.15,y-r*0.2,r*0.35,r*0.2,-0.3,0,Math.PI*2);ctx.fill();
    // Small bright dot
    ctx.fillStyle=isRed?'rgba(255,220,220,0.4)':'rgba(220,220,220,0.25)';
    ctx.beginPath();ctx.arc(x-r*0.2,y-r*0.25,r*0.1,0,Math.PI*2);ctx.fill();
    // King crown detail
    if(isKing(type)){
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=8;
        // Draw crown shape
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();
        var cr=r*0.4;
        ctx.moveTo(x-cr,y+cr*0.3);
        ctx.lineTo(x-cr,y-cr*0.3);
        ctx.lineTo(x-cr*0.5,y);
        ctx.lineTo(x,y-cr*0.5);
        ctx.lineTo(x+cr*0.5,y);
        ctx.lineTo(x+cr,y-cr*0.3);
        ctx.lineTo(x+cr,y+cr*0.3);
        ctx.closePath();ctx.fill();
        // Crown gems
        ctx.fillStyle='#ff3333';ctx.beginPath();ctx.arc(x,y-cr*0.2,r*0.06,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#3366ff';ctx.beginPath();ctx.arc(x-cr*0.5,y+cr*0.05,r*0.05,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+cr*0.5,y+cr*0.05,r*0.05,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
    }
    ctx.restore();
}

function drawTitle(dt){
    ctx.fillStyle='#2a1a0a';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Demo board
    var ds=Math.min(W*0.04,22),ox=W/2-ds*4,oy=H*0.5;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
        ctx.fillStyle=(r+c)%2===0?'#f0d0a0':'#6B4226';
        ctx.fillRect(ox+c*ds,oy+r*ds,ds,ds);
    }
    drawChecker(ox+1*ds+ds/2,oy+0*ds+ds/2,ds*0.35,2);
    drawChecker(ox+3*ds+ds/2,oy+0*ds+ds/2,ds*0.35,2);
    drawChecker(ox+4*ds+ds/2,oy+7*ds+ds/2,ds*0.35,1);
    drawChecker(ox+6*ds+ds/2,oy+7*ds+ds/2,ds*0.35,1);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff4444';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff4444';ctx.fillText('CHECKERS',W/2,H*0.2);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Jump to capture! Reach the end to become King.',W/2,H*0.35);
    ctx.fillText('Click a piece, then click where to move',W/2,H*0.41);
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
    var a=0.5+0.5*Math.sin(gameTime*4);ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    var red=0,black=0;
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){if(isPlayer(board[r][c]))red++;if(isAI(board[r][c]))black++;}
    document.getElementById('hud-score').textContent='Score: '+score;
    document.getElementById('hud-speed').textContent='Red: '+red+' Black: '+black;
    document.getElementById('hud-time').textContent=turn===1?'Your Turn':'AI Turn';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onClick(e){
    if(gameState!=='playing'||(gameOver)){resetGame();return;}
    if(turn!==1)return;
    var rect=canvas.getBoundingClientRect();var cs=cellSize(),o=boardOrigin();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var gc=Math.floor((mx-o.x)/cs),gr=Math.floor((my-o.y)/cs);
    if(gc<0||gc>=SIZE||gr<0||gr>=SIZE)return;
    cursorR=gr;cursorC=gc;
    if(selected){
        // Try to move to this cell
        var moved=false;
        for(var i=0;i<validMoves.length;i++){
            if(validMoves[i].r===gr&&validMoves[i].c===gc){tryMove(gr,gc);moved=true;break;}
        }
        if(!moved){
            // Select different piece
            if(isPlayer(board[gr][gc])){trySelect(gr,gc);}
            else{selected=null;validMoves=[];}
        }
    } else {
        trySelect(gr,gc);
    }
}

function onKey(e,down){
    if(!down)return;
    if((e.key==='Enter'||e.key==='Tab')&&(gameState!=='playing'||gameOver)){resetGame();return;}
    if(gameState!=='playing'||turn!==1||gameOver)return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')cursorC=Math.max(0,cursorC-1);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')cursorC=Math.min(SIZE-1,cursorC+1);
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')cursorR=Math.max(0,cursorR-1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')cursorR=Math.min(SIZE-1,cursorR+1);
    if(e.key===' '){
        if(selected){
            var moved=false;
            for(var i=0;i<validMoves.length;i++){
                if(validMoves[i].r===cursorR&&validMoves[i].c===cursorC){tryMove(cursorR,cursorC);moved=true;break;}
            }
            if(!moved&&isPlayer(board[cursorR][cursorC]))trySelect(cursorR,cursorC);
        } else {
            trySelect(cursorR,cursorC);
        }
    }
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initCheckers=function(){
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
    bindMobile('btn-down',function(){
        if(selected){
            for(var i=0;i<validMoves.length;i++){
                if(validMoves[i].r===cursorR&&validMoves[i].c===cursorC){tryMove(cursorR,cursorC);return;}
            }
        }
        trySelect(cursorR,cursorC);
    });
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopCheckers=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
