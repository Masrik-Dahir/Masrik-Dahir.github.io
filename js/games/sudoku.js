// Sudoku — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var board=[],solution=[],given=[],selected={r:-1,c:-1},pencil=[];
var conflicts=[],score=0,bestTime=Infinity,mistakes=0;
var particles=[],cellSize,gridX,gridY;
var pencilMode=false,diffLevel=1;

function diffMult(){return diffLevel<=2?0.7:(diffLevel<=5?1.0:1.0+(diffLevel-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcGrid();}

function calcGrid(){
    cellSize=Math.min((W-40)/9,(H-80)/9);
    cellSize=Math.max(cellSize,24);
    gridX=(W-9*cellSize)/2;
    gridY=(H-9*cellSize)/2+10;
}

// Simple Sudoku generator
function generatePuzzle(){
    // Start with a valid solved board via backtracking
    var s=Array(81).fill(0);
    fillBoard(s,0);
    solution=s.slice();
    board=s.slice();
    given=Array(81).fill(false);
    pencil=[];
    for(var i=0;i<81;i++)pencil[i]=[false,false,false,false,false,false,false,false,false];

    // Remove cells — easy: leave ~38-42 given
    var indices=[];for(var i=0;i<81;i++)indices.push(i);
    shuffle(indices);
    var dm=diffMult();var toRemove=Math.round((81-40)*dm); // more empty at higher difficulty
    var removed=0;
    for(var i=0;i<indices.length&&removed<toRemove;i++){
        board[indices[i]]=0;
        removed++;
    }
    for(var i=0;i<81;i++)given[i]=board[i]!==0;
}

function fillBoard(b,pos){
    if(pos>=81)return true;
    var nums=[1,2,3,4,5,6,7,8,9];shuffle(nums);
    for(var k=0;k<9;k++){
        var n=nums[k];
        if(isValid(b,pos,n)){b[pos]=n;if(fillBoard(b,pos+1))return true;b[pos]=0;}
    }
    return false;
}

function isValid(b,pos,n){
    var r=Math.floor(pos/9),c=pos%9;
    for(var i=0;i<9;i++){if(b[r*9+i]===n||b[i*9+c]===n)return false;}
    var br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){if(b[(br+dr)*9+(bc+dc)]===n)return false;}
    return true;
}

function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}}

function findConflicts(){
    conflicts=Array(81).fill(false);
    for(var i=0;i<81;i++){
        if(board[i]===0)continue;
        var r=Math.floor(i/9),c=i%9,n=board[i];
        // check row
        for(var j=0;j<9;j++){if(j!==c&&board[r*9+j]===n){conflicts[i]=true;conflicts[r*9+j]=true;}}
        // check col
        for(var j=0;j<9;j++){if(j!==r&&board[j*9+c]===n){conflicts[i]=true;conflicts[j*9+c]=true;}}
        // check box
        var br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
        for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){
            var idx=(br+dr)*9+(bc+dc);
            if(idx!==i&&board[idx]===n){conflicts[i]=true;conflicts[idx]=true;}
        }
    }
}

function checkWin(){
    for(var i=0;i<81;i++)if(board[i]===0)return false;
    for(var i=0;i<81;i++)if(board[i]!==solution[i])return false;
    return true;
}

function placeNumber(n){
    if(selected.r<0||selected.c<0)return;
    var idx=selected.r*9+selected.c;
    if(given[idx])return;
    if(pencilMode){
        pencil[idx][n-1]=!pencil[idx][n-1];
        return;
    }
    board[idx]=n;
    pencil[idx]=[false,false,false,false,false,false,false,false,false];
    if(n!==0&&n!==solution[idx]){mistakes++;addParticles(gridX+(selected.c+0.5)*cellSize,gridY+(selected.r+0.5)*cellSize,'#ff3333',8);}
    else if(n===solution[idx]){addParticles(gridX+(selected.c+0.5)*cellSize,gridY+(selected.r+0.5)*cellSize,'#33ff66',10);}
    findConflicts();
    if(checkWin()){
        score=Math.max(1,1000-mistakes*50-Math.floor(gameTime));
        if(gameTime<bestTime)bestTime=gameTime;
        gameState='gameover';
    }
}

function clearCell(){
    if(selected.r<0||selected.c<0)return;
    var idx=selected.r*9+selected.c;
    if(given[idx])return;
    board[idx]=0;
    pencil[idx]=[false,false,false,false,false,false,false,false,false];
    findConflicts();
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*80+30;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+1});
    }
}

function resetGame(){
    generatePuzzle();findConflicts();
    selected={r:4,c:4};mistakes=0;gameTime=0;pencilMode=false;
    gameState='playing';
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt*2;
        if(p.life<=0)particles.splice(i,1);
    }
}

function render(){
    var bgG=ctx.createLinearGradient(0,0,0,H);bgG.addColorStop(0,'#14142a');bgG.addColorStop(1,'#1a1a34');
    ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
    var cs=cellSize;
    // Outer frame with shadow
    ctx.save();ctx.shadowColor='rgba(50,80,180,0.3)';ctx.shadowBlur=12;
    ctx.fillStyle='#2a2a4e';ctx.fillRect(gridX-4,gridY-4,9*cs+8,9*cs+8);ctx.shadowBlur=0;ctx.restore();
    // draw grid bg
    for(var r=0;r<9;r++){
        for(var c=0;c<9;c++){
            var x=gridX+c*cs,y=gridY+r*cs,idx=r*9+c;
            var boxShade=(Math.floor(r/3)+Math.floor(c/3))%2===0?'#1c1c36':'#20204a';
            ctx.fillStyle=boxShade;
            if(selected.r===r&&selected.c===c){
                var selG=ctx.createRadialGradient(x+cs/2,y+cs/2,0,x+cs/2,y+cs/2,cs*0.7);
                selG.addColorStop(0,'#3a5580');selG.addColorStop(1,'#2a3a5a');ctx.fillStyle=selG;
            }
            else if(selected.r===r||selected.c===c)ctx.fillStyle='#262850';
            else if(selected.r>=0&&Math.floor(selected.r/3)===Math.floor(r/3)&&Math.floor(selected.c/3)===Math.floor(c/3))ctx.fillStyle='#232545';
            ctx.fillRect(x,y,cs,cs);
            // highlight same number
            if(board[idx]!==0&&selected.r>=0&&board[selected.r*9+selected.c]===board[idx]){
                ctx.fillStyle='rgba(51,153,255,0.15)';ctx.fillRect(x,y,cs,cs);
            }
        }
    }
    // grid lines
    ctx.strokeStyle='#444466';ctx.lineWidth=1;
    for(var i=0;i<=9;i++){
        ctx.beginPath();ctx.moveTo(gridX+i*cs,gridY);ctx.lineTo(gridX+i*cs,gridY+9*cs);ctx.stroke();
        ctx.beginPath();ctx.moveTo(gridX,gridY+i*cs);ctx.lineTo(gridX+9*cs,gridY+i*cs);ctx.stroke();
    }
    // thick box lines
    ctx.strokeStyle='#8888aa';ctx.lineWidth=2;
    for(var i=0;i<=3;i++){
        ctx.beginPath();ctx.moveTo(gridX+i*3*cs,gridY);ctx.lineTo(gridX+i*3*cs,gridY+9*cs);ctx.stroke();
        ctx.beginPath();ctx.moveTo(gridX,gridY+i*3*cs);ctx.lineTo(gridX+9*cs,gridY+i*3*cs);ctx.stroke();
    }
    // numbers
    for(var r=0;r<9;r++){
        for(var c=0;c<9;c++){
            var x=gridX+c*cs,y=gridY+r*cs,idx=r*9+c;
            if(board[idx]!==0){
                ctx.font='bold '+Math.round(cs*0.55)+'px "Courier New",monospace';
                ctx.textAlign='center';ctx.textBaseline='middle';
                if(conflicts[idx])ctx.fillStyle='#ff4444';
                else if(given[idx])ctx.fillStyle='#ccccee';
                else ctx.fillStyle='#33bbff';
                ctx.fillText(board[idx],x+cs/2,y+cs/2+2);
            }else{
                // pencil marks
                var pm=pencil[idx],sz=cs/3;
                ctx.font=Math.round(sz*0.65)+'px "Courier New",monospace';
                ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillStyle='#667788';
                for(var n=0;n<9;n++){
                    if(pm[n]){
                        var pr=Math.floor(n/3),pc=n%3;
                        ctx.fillText(n+1,x+pc*sz+sz/2,y+pr*sz+sz/2+1);
                    }
                }
            }
        }
    }
    // selection outline
    if(selected.r>=0&&selected.c>=0){
        ctx.strokeStyle='#33ccff';ctx.lineWidth=2;
        ctx.strokeRect(gridX+selected.c*cs,gridY+selected.r*cs,cs,cs);
    }
    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // bottom info
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';ctx.textAlign='center';
    var modeStr=pencilMode?'[PENCIL ON]':'[PENCIL OFF (P)]';
    ctx.fillText(modeStr+'  |  MISTAKES: '+mistakes+'  |  KEYS: 1-9, DEL/0, ARROWS',W/2,gridY+9*cs+18);
    // number buttons at bottom
    var btnY=gridY+9*cs+28;
    var btnSz=Math.min(cs*0.9,W/11);
    var btnStart=(W-9*btnSz*1.2)/2;
    for(var n=1;n<=9;n++){
        var bx=btnStart+(n-1)*btnSz*1.2;
        ctx.fillStyle='#2a2a4a';ctx.fillRect(bx,btnY,btnSz,btnSz);
        ctx.strokeStyle='#4466aa';ctx.lineWidth=1;ctx.strokeRect(bx,btnY,btnSz,btnSz);
        ctx.fillStyle='#33bbff';ctx.font='bold '+Math.round(btnSz*0.5)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(n,bx+btnSz/2,btnY+btnSz/2+1);
    }
}

function drawTitle(dt){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // animated grid preview
    for(var r=0;r<9;r++){
        for(var c=0;c<9;c++){
            var x=W*0.3+c*18,y=H*0.3+r*18;
            ctx.fillStyle=(Math.floor(r/3)+Math.floor(c/3))%2===0?'#222240':'#282850';
            ctx.fillRect(x,y,16,16);
            if(Math.sin(titlePulse+r+c*0.5)>0.3){
                ctx.fillStyle='#33bbff';ctx.font='10px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillText(((r*3+c)%9)+1,x+8,y+9);
            }
        }
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#3399ff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#3399ff';
    ctx.fillText('SUDOKU',W/2,H*0.12);ctx.shadowBlur=0;
    if(bestTime<Infinity){ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';ctx.fillText('BEST: '+Math.floor(bestTime)+'s',W/2,H*0.2);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.92);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#33ff66';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#33ff66';ctx.fillText('SOLVED!',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('Time: '+Math.floor(gameTime)+'s  Mistakes: '+mistakes,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='ERR '+mistakes;
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function cellFromPos(mx,my){
    var c=Math.floor((mx-gridX)/cellSize);
    var r=Math.floor((my-gridY)/cellSize);
    if(r>=0&&r<9&&c>=0&&c<9)return{r:r,c:c};
    return null;
}

function numBtnFromPos(mx,my){
    var btnY=gridY+9*cellSize+28;
    var btnSz=Math.min(cellSize*0.9,W/11);
    var btnStart=(W-9*btnSz*1.2)/2;
    for(var n=1;n<=9;n++){
        var bx=btnStart+(n-1)*btnSz*1.2;
        if(mx>=bx&&mx<=bx+btnSz&&my>=btnY&&my<=btnY+btnSz)return n;
    }
    return 0;
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    if(e.key==='ArrowUp'&&selected.r>0)selected.r--;
    if(e.key==='ArrowDown'&&selected.r<8)selected.r++;
    if(e.key==='ArrowLeft'&&selected.c>0)selected.c--;
    if(e.key==='ArrowRight'&&selected.c<8)selected.c++;
    if(e.key>='1'&&e.key<='9')placeNumber(parseInt(e.key));
    if(e.key==='Delete'||e.key==='Backspace'||e.key==='0')clearCell();
    if(e.key==='p'||e.key==='P')pencilMode=!pencilMode;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab',' ','Backspace'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var cell=cellFromPos(mx,my);
    if(cell){selected=cell;return;}
    var n=numBtnFromPos(mx,my);
    if(n>0)placeNumber(n);
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    var mx=t.clientX-r.left,my=t.clientY-r.top;
    var cell=cellFromPos(mx,my);
    if(cell){selected=cell;return;}
    var n=numBtnFromPos(mx,my);
    if(n>0)placeNumber(n);
}

window.initSudoku=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopSudoku=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
