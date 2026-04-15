// Columns — Falling columns of 3 colored gems, match 3+
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var COLS=6,ROWS=13,COLORS=['#ff3333','#33ff33','#3333ff','#ffff33','#ff33ff','#33ffff'];
var board,piece,nextPiece,score=0,level=1,dropTimer=0,dropInterval=1.0;
var particles=[],sparkles=[],matchAnim=[],comboCount=0;
function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function cellSize(){return Math.min((W-40)/COLS,(H-60)/ROWS);}
function boardOrigin(){var cs=cellSize();return{x:(W-cs*COLS)/2,y:(H-cs*ROWS)/2+10};}

function resetGame(){
    score=0;level=1;dropInterval=1.0;comboCount=0;particles=[];sparkles=[];matchAnim=[];gameTime=0;
    board=[];for(var r=0;r<ROWS;r++){board[r]=[];for(var c=0;c<COLS;c++)board[r][c]=null;}
    piece=newPiece();nextPiece=newPiece();dropTimer=0;
    gameState='playing';
}

function newPiece(){
    var numColors=Math.min(3+level,COLORS.length);
    return{col:Math.floor(COLS/2),row:0,gems:[
        Math.floor(Math.random()*numColors),
        Math.floor(Math.random()*numColors),
        Math.floor(Math.random()*numColors)
    ]};
}

function rotatePiece(){
    if(!piece)return;
    // Rotate gems: bottom goes to top
    var g=piece.gems;
    piece.gems=[g[2],g[0],g[1]];
}

function canMove(col,row){
    for(var i=0;i<3;i++){
        var r=row+i;
        if(r<0)continue;
        if(r>=ROWS||col<0||col>=COLS)return false;
        if(r>=0&&board[r][col]!==null)return false;
    }
    return true;
}

function lockPiece(){
    if(!piece)return;
    for(var i=0;i<3;i++){
        var r=piece.row+i;
        if(r>=0&&r<ROWS)board[r][piece.col]=piece.gems[i];
    }
    if(piece.row<=0){gameState='gameover';return;}
    piece=nextPiece;nextPiece=newPiece();
    comboCount=0;
    checkMatches();
}

function checkMatches(){
    var toRemove=[];
    // Horizontal
    for(var r=0;r<ROWS;r++){
        for(var c=0;c<=COLS-3;c++){
            if(board[r][c]!==null&&board[r][c]===board[r][c+1]&&board[r][c]===board[r][c+2]){
                var len=3;while(c+len<COLS&&board[r][c+len]===board[r][c])len++;
                for(var k=0;k<len;k++)toRemove.push({r:r,c:c+k});
            }
        }
    }
    // Vertical
    for(var c=0;c<COLS;c++){
        for(var r=0;r<=ROWS-3;r++){
            if(board[r][c]!==null&&board[r][c]===board[r+1][c]&&board[r][c]===board[r+2][c]){
                var len=3;while(r+len<ROWS&&board[r+len][c]===board[r][c])len++;
                for(var k=0;k<len;k++)toRemove.push({r:r+k,c:c});
            }
        }
    }
    // Diagonal (down-right)
    for(var r=0;r<=ROWS-3;r++){
        for(var c=0;c<=COLS-3;c++){
            if(board[r][c]!==null&&board[r][c]===board[r+1][c+1]&&board[r][c]===board[r+2][c+2]){
                var len=3;while(r+len<ROWS&&c+len<COLS&&board[r+len][c+len]===board[r][c])len++;
                for(var k=0;k<len;k++)toRemove.push({r:r+k,c:c+k});
            }
        }
    }
    // Diagonal (down-left)
    for(var r=0;r<=ROWS-3;r++){
        for(var c=2;c<COLS;c++){
            if(board[r][c]!==null&&board[r][c]===board[r+1][c-1]&&board[r][c]===board[r+2][c-2]){
                var len=3;while(r+len<ROWS&&c-len>=0&&board[r+len][c-len]===board[r][c])len++;
                for(var k=0;k<len;k++)toRemove.push({r:r+k,c:c-k});
            }
        }
    }
    // Remove duplicates
    var unique={};var final=[];
    for(var i=0;i<toRemove.length;i++){
        var key=toRemove[i].r+','+toRemove[i].c;
        if(!unique[key]){unique[key]=true;final.push(toRemove[i]);}
    }
    if(final.length>0){
        comboCount++;
        var cs=cellSize(),o=boardOrigin();
        for(var i=0;i<final.length;i++){
            var fr=final[i],color=COLORS[board[fr.r][fr.c]];
            addParticles(o.x+fr.c*cs+cs/2,o.y+fr.r*cs+cs/2,color,4);
            matchAnim.push({r:fr.r,c:fr.c,life:0.3,color:color});
            board[fr.r][fr.c]=null;
        }
        score+=final.length*50*comboCount*level;
        // Gravity
        setTimeout(function(){
            applyGravity();
            checkMatches();
        },200);
    }
}

function applyGravity(){
    for(var c=0;c<COLS;c++){
        var write=ROWS-1;
        for(var r=ROWS-1;r>=0;r--){
            if(board[r][c]!==null){
                if(r!==write){board[write][c]=board[r][c];board[r][c]=null;}
                write--;
            }
        }
    }
}

function addParticles(x,y,c,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,life:0.5+Math.random()*0.3,color:c,size:2+Math.random()*2});}

function update(dt){
    if(dt>0.1)dt=0.1;gameTime+=dt;
    if(!piece)return;
    dropTimer+=dt;
    if(dropTimer>=dropInterval){
        dropTimer=0;
        if(canMove(piece.col,piece.row+1)){piece.row++;}
        else{lockPiece();}
    }
    // Sparkles
    if(Math.random()<0.3){
        var cs=cellSize(),o=boardOrigin();
        sparkles.push({x:o.x+Math.random()*cs*COLS,y:o.y+Math.random()*cs*ROWS,life:0.5+Math.random()*0.5,size:1+Math.random()*2});
    }
    for(var i=sparkles.length-1;i>=0;i--){sparkles[i].life-=dt;if(sparkles[i].life<=0)sparkles.splice(i,1);}
    for(var i=matchAnim.length-1;i>=0;i--){matchAnim[i].life-=dt;if(matchAnim[i].life<=0)matchAnim.splice(i,1);}
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
    // Level up with difficulty scaling
    level=1+Math.floor(score/3000);
    var dm=diffMult();
    dropInterval=Math.max(0.15,1.0-level*0.08*dm);
}

function render(){
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a2e');bg.addColorStop(1,'#1a0a3e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var cs=cellSize(),o=boardOrigin();
    // Board background
    ctx.fillStyle='rgba(0,0,30,0.6)';ctx.fillRect(o.x-2,o.y-2,cs*COLS+4,cs*ROWS+4);
    ctx.strokeStyle='rgba(100,100,255,0.3)';ctx.lineWidth=2;ctx.strokeRect(o.x-2,o.y-2,cs*COLS+4,cs*ROWS+4);
    // Grid lines
    ctx.strokeStyle='rgba(100,100,200,0.1)';ctx.lineWidth=0.5;
    for(var c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(o.x+c*cs,o.y);ctx.lineTo(o.x+c*cs,o.y+cs*ROWS);ctx.stroke();}
    for(var r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(o.x,o.y+r*cs);ctx.lineTo(o.x+cs*COLS,o.y+r*cs);ctx.stroke();}
    // Board gems
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        if(board[r][c]!==null)drawGem(o.x+c*cs+cs/2,o.y+r*cs+cs/2,cs*0.4,COLORS[board[r][c]]);
    }
    // Active piece
    if(piece){
        for(var i=0;i<3;i++){
            var pr=piece.row+i;
            if(pr>=0)drawGem(o.x+piece.col*cs+cs/2,o.y+pr*cs+cs/2,cs*0.4,COLORS[piece.gems[i]]);
        }
        // Ghost piece
        var ghostRow=piece.row;
        while(canMove(piece.col,ghostRow+1))ghostRow++;
        if(ghostRow>piece.row){
            ctx.globalAlpha=0.3;
            for(var i=0;i<3;i++){
                var pr=ghostRow+i;
                if(pr>=0&&pr<ROWS)drawGem(o.x+piece.col*cs+cs/2,o.y+pr*cs+cs/2,cs*0.35,COLORS[piece.gems[i]]);
            }
            ctx.globalAlpha=1;
        }
    }
    // Match animations
    for(var i=0;i<matchAnim.length;i++){
        var ma=matchAnim[i];
        ctx.globalAlpha=ma.life*3;
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(o.x+ma.c*cs+cs/2,o.y+ma.r*cs+cs/2,cs*0.5*(1+0.5*(0.3-ma.life)),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // Sparkles
    for(var i=0;i<sparkles.length;i++){
        var s=sparkles[i];ctx.globalAlpha=s.life;
        ctx.fillStyle='#fff';ctx.fillRect(s.x-s.size/2,s.y-s.size/2,s.size,s.size);
    }
    ctx.globalAlpha=1;
    // Next piece
    ctx.textAlign='center';ctx.font=Math.round(W*0.015)+'px "Courier New",monospace';ctx.fillStyle='#888';
    var nx=o.x+cs*COLS+cs*1.5;
    ctx.fillText('NEXT',nx,o.y+cs);
    for(var i=0;i<3;i++)drawGem(nx,o.y+cs*2+i*cs,cs*0.35,COLORS[nextPiece.gems[i]]);
    // Particles
    for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
    ctx.globalAlpha=1;
    // Combo text
    if(comboCount>1){
        ctx.textAlign='center';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=10;
        ctx.fillText(comboCount+'x COMBO!',W/2,o.y-10);ctx.shadowBlur=0;
    }
}

function drawGem(x,y,r,color){
    ctx.save();
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.beginPath();ctx.moveTo(x+2,y-r+3);ctx.lineTo(x+r+2,y+3);ctx.lineTo(x+2,y+r+3);ctx.lineTo(x-r+2,y+3);ctx.closePath();ctx.fill();
    // Gem body with facets
    var grd=ctx.createRadialGradient(x-r*0.25,y-r*0.25,r*0.05,x,y,r*1.1);
    grd.addColorStop(0,'#ffffff');grd.addColorStop(0.15,lighten(color,80));grd.addColorStop(0.4,lighten(color,30));grd.addColorStop(0.7,color);grd.addColorStop(1,darken(color,90));
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill();
    // Facet lines
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.stroke();
    // Top facet highlight
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*0.4,y-r*0.2);ctx.lineTo(x,y);ctx.lineTo(x-r*0.4,y-r*0.2);ctx.closePath();ctx.fill();
    // Inner sparkle
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath();ctx.arc(x-r*0.15,y-r*0.25,r*0.12,0,Math.PI*2);ctx.fill();
    // Outer glow
    ctx.shadowColor=color;ctx.shadowBlur=4;
    ctx.strokeStyle=lighten(color,40);ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
}

function lighten(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,r+a);g=Math.min(255,g+a);b=Math.min(255,b+a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function darken(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawTitle(dt){
    ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);titlePulse+=dt*3;
    // Falling gems
    for(var i=0;i<12;i++){
        var gx=W*0.1+(i%6)*W*0.14;
        var gy=((titlePulse*40+i*80)%(H+40))-20;
        drawGem(gx,gy,W*0.015,COLORS[i%COLORS.length]);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff33ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff33ff';ctx.fillText('COLUMNS',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';
    ctx.fillText('Match 3+ gems in any direction!',W/2,H*0.38);
    ctx.fillText('Left/Right to move, Up to rotate, Down to drop',W/2,H*0.44);
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
    document.getElementById('hud-time').textContent='';
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
    if(gameState!=='playing'||!piece)return;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){if(canMove(piece.col-1,piece.row))piece.col--;}
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){if(canMove(piece.col+1,piece.row))piece.col++;}
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')rotatePiece();
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){
        if(canMove(piece.col,piece.row+1))piece.row++;
        else lockPiece();
    }
    if(e.key===' '){while(canMove(piece.col,piece.row+1))piece.row++;lockPiece();}
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});el.addEventListener('mousedown',fn);}

window.initColumns=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();if(gameState!=='playing')resetGame();});
    bindMobile('btn-left',function(){if(piece&&canMove(piece.col-1,piece.row))piece.col--;});
    bindMobile('btn-right',function(){if(piece&&canMove(piece.col+1,piece.row))piece.col++;});
    bindMobile('btn-up',function(){rotatePiece();});
    bindMobile('btn-down',function(){if(piece){if(canMove(piece.col,piece.row+1))piece.row++;else lockPiece();}});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopColumns=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
