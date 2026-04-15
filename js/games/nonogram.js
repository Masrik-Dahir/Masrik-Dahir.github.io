// Nonogram / Picross — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,titlePulse=0,gameTime=0;
var particles=[];
var puzzleLevel=0;
var GRID_SIZE=5; // Start small (5x5), increases
var solution=[];  // 2D array of true/false
var playerGrid=[]; // 2D: 0=empty, 1=filled, 2=marked(X)
var rowClues=[];
var colClues=[];
var cellSize=0,gridOffX=0,gridOffY=0;
var clueAreaW=0,clueAreaH=0;
var hoverR=-1,hoverC=-1;
var mistakes=0,maxMistakes=5;
var puzzleName='';
var completed=false;

// Predefined pixel art puzzles (5x5, 7x7, 10x10)
var PUZZLES=[
    // 5x5 Heart
    {name:'HEART',size:5,data:[
        [0,1,0,1,0],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [0,0,1,0,0]
    ]},
    // 5x5 Star
    {name:'STAR',size:5,data:[
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,1,1,1,1],
        [0,1,0,1,0],
        [1,0,0,0,1]
    ]},
    // 5x5 Arrow
    {name:'ARROW',size:5,data:[
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,0,1,0,1],
        [0,0,1,0,0],
        [0,0,1,0,0]
    ]},
    // 5x5 House
    {name:'HOUSE',size:5,data:[
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,1,1,1,1],
        [1,1,0,1,1],
        [1,1,0,1,1]
    ]},
    // 7x7 Smiley
    {name:'SMILEY',size:7,data:[
        [0,0,1,1,1,0,0],
        [0,1,0,0,0,1,0],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0],
        [0,0,1,1,1,0,0]
    ]},
    // 7x7 Boat
    {name:'BOAT',size:7,data:[
        [0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0],
        [0,0,0,1,1,0,0],
        [0,1,1,1,1,1,0],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0]
    ]},
    // 7x7 Dog
    {name:'DOG',size:7,data:[
        [1,1,0,0,0,1,0],
        [1,1,0,0,1,1,0],
        [0,1,1,1,1,1,0],
        [0,1,1,1,1,1,1],
        [0,0,1,1,1,0,0],
        [0,0,1,0,1,0,0],
        [0,1,1,0,1,1,0]
    ]},
    // 10x10 Mushroom
    {name:'MUSHROOM',size:10,data:[
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,0,1,1,0],
        [1,1,0,0,1,1,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,1,1,0,0],
        [0,1,1,1,0,0,1,1,1,0]
    ]},
    // 10x10 Cat
    {name:'CAT',size:10,data:[
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,1,0,0,1],
        [0,1,0,0,1,1,0,0,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,0,0,1,0,0,0],
        [0,0,1,1,0,0,1,1,0,0]
    ]},
    // 10x10 Rocket
    {name:'ROCKET',size:10,data:[
        [0,0,0,0,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [1,1,0,1,1,1,1,0,1,1],
        [1,0,0,0,1,1,0,0,0,1],
        [0,0,0,1,0,0,1,0,0,0]
    ]}
];

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    computeLayout();
}

function computeLayout(){
    if(!solution||solution.length===0)return;
    var n=GRID_SIZE;
    // Clue area is proportional
    clueAreaW=W*0.15;
    clueAreaH=H*0.12;
    var availW=W-clueAreaW-20;
    var availH=H-clueAreaH-40;
    cellSize=Math.floor(Math.min(availW/n,availH/n));
    cellSize=Math.max(cellSize,20);
    gridOffX=clueAreaW+10;
    gridOffY=clueAreaH+20;
}

function generateClues(grid,n){
    var rows=[];
    for(var r=0;r<n;r++){
        var clue=[];var run=0;
        for(var c=0;c<n;c++){
            if(grid[r][c]){run++;}
            else{if(run>0){clue.push(run);run=0;}}
        }
        if(run>0)clue.push(run);
        if(clue.length===0)clue=[0];
        rows.push(clue);
    }
    var cols=[];
    for(var c=0;c<n;c++){
        var clue2=[];var run2=0;
        for(var r2=0;r2<n;r2++){
            if(grid[r2][c]){run2++;}
            else{if(run2>0){clue2.push(run2);run2=0;}}
        }
        if(run2>0)clue2.push(run2);
        if(clue2.length===0)clue2=[0];
        cols.push(clue2);
    }
    return {rows:rows,cols:cols};
}

function loadPuzzle(idx){
    if(idx>=PUZZLES.length)idx=idx%PUZZLES.length;
    var puz=PUZZLES[idx];
    GRID_SIZE=puz.size;
    puzzleName=puz.name;
    solution=[];
    playerGrid=[];
    for(var r=0;r<GRID_SIZE;r++){
        solution[r]=[];
        playerGrid[r]=[];
        for(var c=0;c<GRID_SIZE;c++){
            solution[r][c]=!!puz.data[r][c];
            playerGrid[r][c]=0;
        }
    }
    var clues=generateClues(puz.data,GRID_SIZE);
    rowClues=clues.rows;
    colClues=clues.cols;
    mistakes=0;
    completed=false;
    computeLayout();
}

function addParticles(px,py,color,count){
    for(var i=0;i<count;i++){
        particles.push({x:px,y:py,
            vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,
            life:0.3+Math.random()*0.4,color:color,
            size:2+Math.random()*4});
    }
}

function updateParticles(dt){
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawParticles(){
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life/0.7);
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;
}

function checkRowComplete(r){
    for(var c=0;c<GRID_SIZE;c++){
        if(solution[r][c]&&playerGrid[r][c]!==1)return false;
        if(!solution[r][c]&&playerGrid[r][c]===1)return false;
    }
    return true;
}

function checkColComplete(c2){
    for(var r=0;r<GRID_SIZE;r++){
        if(solution[r][c2]&&playerGrid[r][c2]!==1)return false;
        if(!solution[r][c2]&&playerGrid[r][c2]===1)return false;
    }
    return true;
}

function checkPuzzleComplete(){
    for(var r=0;r<GRID_SIZE;r++){
        for(var c=0;c<GRID_SIZE;c++){
            if(solution[r][c]&&playerGrid[r][c]!==1)return false;
        }
    }
    return true;
}

function handleCellClick(r,c,rightClick){
    if(completed)return;
    if(r<0||r>=GRID_SIZE||c<0||c>=GRID_SIZE)return;

    if(rightClick||playerGrid[r][c]===2){
        // Toggle X mark
        playerGrid[r][c]=playerGrid[r][c]===2?0:2;
    }else{
        if(playerGrid[r][c]===1){
            playerGrid[r][c]=0; // Unfill
        }else{
            // Fill
            if(solution[r][c]){
                playerGrid[r][c]=1;
                score+=10;
                addParticles(gridOffX+c*cellSize+cellSize/2,gridOffY+r*cellSize+cellSize/2,'#44ff44',5);
            }else{
                // Mistake!
                playerGrid[r][c]=2; // Auto mark as X
                mistakes++;
                addParticles(gridOffX+c*cellSize+cellSize/2,gridOffY+r*cellSize+cellSize/2,'#ff4444',8);
                if(mistakes>=maxMistakes){
                    gameState='gameover';
                    return;
                }
            }
        }
    }

    // Check completion
    if(checkPuzzleComplete()){
        completed=true;
        score+=GRID_SIZE*GRID_SIZE*5; // Completion bonus
        addParticles(W/2,H/2,'#ffcc00',40);
        // Auto advance after delay
        setTimeout(function(){
            if(gameState==='playing'){
                puzzleLevel++;
                loadPuzzle(puzzleLevel);
            }
        },2000);
    }
}

// ─── RENDER ──────────────────────────────────────
function render(){
    // Dark blue background
    ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);

    var n=GRID_SIZE;

    // Draw column clues
    var clueFontSize=Math.max(10,Math.floor(cellSize*0.35));
    ctx.font='bold '+clueFontSize+'px "Courier New",monospace';
    ctx.textAlign='center';
    for(var c=0;c<n;c++){
        var cx2=gridOffX+c*cellSize+cellSize/2;
        var colDone=checkColComplete(c);
        for(var k=0;k<colClues[c].length;k++){
            var cy2=gridOffY-(colClues[c].length-k)*clueFontSize*1.3;
            ctx.fillStyle=colDone?'#44ff44':'#cccccc';
            ctx.fillText(colClues[c][k],cx2,cy2);
        }
    }

    // Draw row clues
    ctx.textAlign='right';
    for(var r=0;r<n;r++){
        var ry=gridOffY+r*cellSize+cellSize/2+clueFontSize*0.3;
        var rowDone=checkRowComplete(r);
        for(var k=0;k<rowClues[r].length;k++){
            var rx=gridOffX-(rowClues[r].length-k)*clueFontSize*1.5-5;
            ctx.fillStyle=rowDone?'#44ff44':'#cccccc';
            ctx.fillText(rowClues[r][k],rx,ry);
        }
    }

    // Draw grid cells
    for(var r=0;r<n;r++){
        for(var c=0;c<n;c++){
            var x=gridOffX+c*cellSize;
            var y=gridOffY+r*cellSize;

            // Cell background
            var isHover=(r===hoverR&&c===hoverC);
            if(playerGrid[r][c]===1){
                // Filled
                var fillGrad=ctx.createLinearGradient(x,y,x+cellSize,y+cellSize);
                fillGrad.addColorStop(0,'#4488ff');fillGrad.addColorStop(1,'#2255cc');
                ctx.fillStyle=fillGrad;
                ctx.fillRect(x+1,y+1,cellSize-2,cellSize-2);
            }else if(playerGrid[r][c]===2){
                // X mark
                ctx.fillStyle=isHover?'#333344':'#1a1a3a';
                ctx.fillRect(x+1,y+1,cellSize-2,cellSize-2);
                ctx.strokeStyle='#ff4444';ctx.lineWidth=2;
                ctx.beginPath();
                ctx.moveTo(x+cellSize*0.2,y+cellSize*0.2);
                ctx.lineTo(x+cellSize*0.8,y+cellSize*0.8);
                ctx.moveTo(x+cellSize*0.8,y+cellSize*0.2);
                ctx.lineTo(x+cellSize*0.2,y+cellSize*0.8);
                ctx.stroke();
            }else{
                ctx.fillStyle=isHover?'#333355':'#1a1a3a';
                ctx.fillRect(x+1,y+1,cellSize-2,cellSize-2);
            }

            // Cell border
            ctx.strokeStyle='#334466';ctx.lineWidth=1;
            ctx.strokeRect(x,y,cellSize,cellSize);
        }
    }

    // Grid thick borders (every 5 cells)
    ctx.strokeStyle='#5577aa';ctx.lineWidth=2;
    var step=5;
    for(var i=0;i<=n;i+=step){
        // Vertical
        ctx.beginPath();
        ctx.moveTo(gridOffX+i*cellSize,gridOffY);
        ctx.lineTo(gridOffX+i*cellSize,gridOffY+n*cellSize);
        ctx.stroke();
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(gridOffX,gridOffY+i*cellSize);
        ctx.lineTo(gridOffX+n*cellSize,gridOffY+i*cellSize);
        ctx.stroke();
    }
    // Outer border
    ctx.strokeStyle='#7799cc';ctx.lineWidth=3;
    ctx.strokeRect(gridOffX,gridOffY,n*cellSize,n*cellSize);

    // Puzzle name
    ctx.fillStyle='#aaaacc';ctx.font='bold '+Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.textAlign='left';
    ctx.fillText('PUZZLE '+(puzzleLevel+1)+': '+puzzleName,10,H-40);

    // Mistakes
    ctx.fillStyle='#ff6666';
    ctx.fillText('MISTAKES: '+mistakes+'/'+maxMistakes,10,H-15);

    // Score
    ctx.textAlign='right';ctx.fillStyle='#ffcc00';
    ctx.fillText('SCORE: '+score,W-10,H-15);

    // Completed overlay
    if(completed){
        ctx.save();ctx.textAlign='center';
        ctx.shadowColor='#44ff44';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
        ctx.fillStyle='#44ff44';
        ctx.fillText('COMPLETE!',W/2,gridOffY-30);
        ctx.shadowBlur=0;
        ctx.restore();
    }

    // Instructions
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.font=Math.round(W*0.013)+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('LEFT CLICK: Fill  |  RIGHT CLICK: Mark X  |  Arrow keys + Space to navigate',W/2,H-3);

    drawParticles();
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    ctx.fillStyle='#0a0a2e';ctx.fillRect(0,0,W,H);

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#4488ff';ctx.shadowBlur=30;
    var ts=Math.round(W*0.06);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.22*(1-scale));
    ctx.fillStyle='#4488ff';ctx.fillText('NONOGRAM',W/2,H*0.22);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('PICROSS PUZZLE',W/2,H*0.30);

    // Animated mini grid
    var miniCS=Math.floor(W*0.025);
    var miniN=5;
    var miniX=W/2-miniN*miniCS/2;
    var miniY=H*0.38;
    var heartData=PUZZLES[0].data;
    for(var r=0;r<miniN;r++){
        for(var c=0;c<miniN;c++){
            var filled=heartData[r][c];
            var showTime=titlePulse*3-r*0.3-c*0.2;
            if(showTime>0&&filled){
                ctx.fillStyle='#4488ff';
                ctx.fillRect(miniX+c*miniCS+1,miniY+r*miniCS+1,miniCS-2,miniCS-2);
            }
            ctx.strokeStyle='#334466';ctx.lineWidth=1;
            ctx.strokeRect(miniX+c*miniCS,miniY+r*miniCS,miniCS,miniCS);
        }
    }

    var fs=Math.round(W*0.016);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#aaa';
    ctx.fillText('Use number clues to reveal hidden pictures',W/2,H*0.62);
    ctx.fillText('Click cells to fill them in',W/2,H*0.67);
    ctx.fillText('Right-click or use X to mark empty cells',W/2,H*0.72);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.87);
    ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff4444';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Puzzles completed: '+puzzleLevel,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='PUZ '+(puzzleLevel+1);
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=(maxMistakes-mistakes)+' HP';
}

function resetGame(){
    score=0;puzzleLevel=0;gameTime=0;particles=[];
    loadPuzzle(0);
    gameState='playing';
}

// Keyboard cursor
var cursorR=0,cursorC=0,useKeyboard=false;

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;
    gameTime+=dt;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){updateParticles(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;updateParticles(dt);drawGameOver();}

    animId=requestAnimationFrame(gameLoop);
}

// ─── INPUT ───────────────────────────────────────
function getMousePos(e){
    var rect=canvas.getBoundingClientRect();
    var scaleX=canvas.width/rect.width;
    var scaleY=canvas.height/rect.height;
    if(e.touches){
        return {x:(e.touches[0].clientX-rect.left)*scaleX,y:(e.touches[0].clientY-rect.top)*scaleY};
    }
    return {x:(e.clientX-rect.left)*scaleX,y:(e.clientY-rect.top)*scaleY};
}

function getCellFromPos(mx,my){
    var c=Math.floor((mx-gridOffX)/cellSize);
    var r=Math.floor((my-gridOffY)/cellSize);
    if(r>=0&&r<GRID_SIZE&&c>=0&&c<GRID_SIZE)return {r:r,c:c};
    return null;
}

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var pos=getMousePos(e);
    var cell=getCellFromPos(pos.x,pos.y);
    if(cell){
        handleCellClick(cell.r,cell.c,false);
    }
}

function onRightClick(e){
    e.preventDefault();
    if(gameState!=='playing')return;
    var pos=getMousePos(e);
    var cell=getCellFromPos(pos.x,pos.y);
    if(cell){
        handleCellClick(cell.r,cell.c,true);
    }
}

function onMouseMove(e){
    if(gameState!=='playing')return;
    var pos=getMousePos(e);
    var cell=getCellFromPos(pos.x,pos.y);
    if(cell){hoverR=cell.r;hoverC=cell.c;}
    else{hoverR=-1;hoverC=-1;}
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    var pos=getMousePos(e);
    var cell=getCellFromPos(pos.x,pos.y);
    if(cell){handleCellClick(cell.r,cell.c,false);}
}

function onKey(e,down){
    if(!down)return;
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;

    useKeyboard=true;
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){cursorC=Math.max(0,cursorC-1);hoverR=cursorR;hoverC=cursorC;}
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){cursorC=Math.min(GRID_SIZE-1,cursorC+1);hoverR=cursorR;hoverC=cursorC;}
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){cursorR=Math.max(0,cursorR-1);hoverR=cursorR;hoverC=cursorC;}
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){cursorR=Math.min(GRID_SIZE-1,cursorR+1);hoverR=cursorR;hoverC=cursorC;}
    if(e.key===' '){handleCellClick(cursorR,cursorC,false);}
    if(e.key==='x'||e.key==='X'){handleCellClick(cursorR,cursorC,true);}

    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}

var kd=function(e){onKey(e,true);};
var ku=function(e){};

function bindMobile(id,fn){
    var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
    el.addEventListener('mousedown',function(){fn();});
}

// ─── INIT / STOP ─────────────────────────────────
window.initNonogram=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('contextmenu',onRightClick);
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('touchstart',onTouch);
    bindMobile('btn-left',function(){cursorC=Math.max(0,cursorC-1);hoverR=cursorR;hoverC=cursorC;});
    bindMobile('btn-right',function(){cursorC=Math.min(GRID_SIZE-1,cursorC+1);hoverR=cursorR;hoverC=cursorC;});
    bindMobile('btn-up',function(){cursorR=Math.max(0,cursorR-1);hoverR=cursorR;hoverC=cursorC;});
    bindMobile('btn-down',function(){handleCellClick(cursorR,cursorC,false);});
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopNonogram=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('contextmenu',onRightClick);
    canvas.removeEventListener('mousemove',onMouseMove);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
