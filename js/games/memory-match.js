// Memory Match — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var cards=[],flipped=[],matched=[],firstCard=-1,secondCard=-1;
var lockBoard=false,moves=0,matchCount=0,level=1,score=0,bestScore=0;
var flipAnim=[],particles=[];
var ICONS=['★','♠','♥','♦','♣','☀','☾','♪','✿','⚡','☂','✈','⚔','☯','♛','⊕','◆','▲'];
var COLORS=['#ff3333','#33cc33','#3399ff','#ffcc00','#ff66cc','#33ffcc','#ff9933','#cc66ff',
            '#66ff66','#ff6666','#6699ff','#ffff33','#ff33ff','#33ffff','#ff6600','#9966ff','#00cc99','#ff3399'];
var gridCols,gridRows,totalPairs,cellW,cellH,gridX,gridY;
var flipSpeed=3.5;

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcGrid();}

function calcGrid(){
    var pairs=totalPairs||6;
    var total=pairs*2;
    if(total<=12){gridCols=4;gridRows=3;}
    else if(total<=16){gridCols=4;gridRows=4;}
    else if(total<=20){gridCols=5;gridRows=4;}
    else if(total<=24){gridCols=6;gridRows=4;}
    else{gridCols=6;gridRows=5;}
    var maxW=(W-40)/gridCols;
    var maxH=(H-60)/gridRows;
    cellW=Math.min(maxW,maxH)*0.9;
    cellH=cellW;
    gridX=(W-gridCols*(cellW+8))/2+4;
    gridY=(H-gridRows*(cellH+8))/2+14;
}

function shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}}

function resetGame(){
    totalPairs=4+level*2;if(totalPairs>18)totalPairs=18;
    var total=totalPairs*2;
    cards=[];flipped=[];matched=[];flipAnim=[];
    var pool=[];
    for(var i=0;i<totalPairs;i++){pool.push(i);pool.push(i);}
    shuffle(pool);
    for(var i=0;i<total;i++){cards[i]=pool[i];flipped[i]=false;matched[i]=false;flipAnim[i]=0;}
    firstCard=-1;secondCard=-1;lockBoard=false;moves=0;matchCount=0;gameTime=0;
    calcGrid();
    gameState='playing';
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*120+40;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*4+2});
    }
}

function tryFlip(idx){
    if(lockBoard||flipped[idx]||matched[idx])return;
    flipped[idx]=true;flipAnim[idx]=0.01;
    if(firstCard<0){firstCard=idx;return;}
    secondCard=idx;moves++;lockBoard=true;
    var peekTime=Math.max(350,700/diffMult());
    setTimeout(function(){
        if(cards[firstCard]===cards[secondCard]){
            matched[firstCard]=true;matched[secondCard]=true;matchCount++;
            score+=100+Math.max(0,500-moves*10);
            var i1=firstCard,i2=secondCard;
            var r1=Math.floor(i1/gridCols),c1=i1%gridCols;
            var r2=Math.floor(i2/gridCols),c2=i2%gridCols;
            addParticles(gridX+c1*(cellW+8)+cellW/2,gridY+r1*(cellH+8)+cellH/2,COLORS[cards[i1]],12);
            addParticles(gridX+c2*(cellW+8)+cellW/2,gridY+r2*(cellH+8)+cellH/2,COLORS[cards[i2]],12);
            if(matchCount>=totalPairs){
                level++;
                if(score>bestScore)bestScore=score;
                setTimeout(function(){resetGame();},800);
            }
        }else{
            flipped[firstCard]=false;flipped[secondCard]=false;
        }
        firstCard=-1;secondCard=-1;lockBoard=false;
    },peekTime);
}

function hitTest(mx,my){
    for(var r=0;r<gridRows;r++){
        for(var c=0;c<gridCols;c++){
            var idx=r*gridCols+c;if(idx>=cards.length)continue;
            var cx=gridX+c*(cellW+8),cy=gridY+r*(cellH+8);
            if(mx>=cx&&mx<=cx+cellW&&my>=cy&&my<=cy+cellH)return idx;
        }
    }
    return -1;
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    for(var i=0;i<cards.length;i++){
        if(flipped[i]||matched[i]){if(flipAnim[i]<1)flipAnim[i]=Math.min(1,flipAnim[i]+dt*flipSpeed);}
        else{if(flipAnim[i]>0)flipAnim[i]=Math.max(0,flipAnim[i]-dt*flipSpeed);}
    }
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt*1.5;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawCard(idx){
    var r=Math.floor(idx/gridCols),c=idx%gridCols;
    var cx=gridX+c*(cellW+8),cy=gridY+r*(cellH+8);
    var flip=flipAnim[idx];
    var scaleX=Math.abs(Math.cos(flip*Math.PI));
    if(scaleX<0.02)scaleX=0.02;
    ctx.save();
    ctx.translate(cx+cellW/2,cy+cellH/2);
    ctx.scale(scaleX,1);
    if(flip>0.5){
        // face up
        var ci=cards[idx];
        var g=ctx.createLinearGradient(-cellW/2,-cellH/2,-cellW/2,cellH/2);
        g.addColorStop(0,'#2a2a4a');g.addColorStop(1,'#1a1a3a');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(-cellW/2+6,-cellH/2);ctx.lineTo(cellW/2-6,-cellH/2);
        ctx.arcTo(cellW/2,-cellH/2,cellW/2,-cellH/2+6,6);ctx.lineTo(cellW/2,cellH/2-6);
        ctx.arcTo(cellW/2,cellH/2,cellW/2-6,cellH/2,6);ctx.lineTo(-cellW/2+6,cellH/2);
        ctx.arcTo(-cellW/2,cellH/2,-cellW/2,cellH/2-6,6);ctx.lineTo(-cellW/2,-cellH/2+6);
        ctx.arcTo(-cellW/2,-cellH/2,-cellW/2+6,-cellH/2,6);
        ctx.fill();
        ctx.strokeStyle=COLORS[ci];ctx.lineWidth=2;ctx.stroke();
        if(matched[idx]){ctx.shadowColor=COLORS[ci];ctx.shadowBlur=15;}
        ctx.fillStyle=COLORS[ci];
        ctx.font='bold '+Math.round(cellH*0.45)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(ICONS[ci],0,2);
        ctx.shadowBlur=0;
    }else{
        // face down - ornate card back
        var g=ctx.createLinearGradient(-cellW/2,-cellH/2,-cellW/2,cellH/2);
        g.addColorStop(0,'#3a4466');g.addColorStop(0.5,'#2a3355');g.addColorStop(1,'#1a2244');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(-cellW/2+6,-cellH/2);ctx.lineTo(cellW/2-6,-cellH/2);
        ctx.arcTo(cellW/2,-cellH/2,cellW/2,-cellH/2+6,6);ctx.lineTo(cellW/2,cellH/2-6);
        ctx.arcTo(cellW/2,cellH/2,cellW/2-6,cellH/2,6);ctx.lineTo(-cellW/2+6,cellH/2);
        ctx.arcTo(-cellW/2,cellH/2,-cellW/2,cellH/2-6,6);ctx.lineTo(-cellW/2,-cellH/2+6);
        ctx.arcTo(-cellW/2,-cellH/2,-cellW/2+6,-cellH/2,6);
        ctx.fill();
        // Inner border
        ctx.strokeStyle='rgba(100,130,200,0.3)';ctx.lineWidth=1;
        ctx.strokeRect(-cellW/2+5,-cellH/2+5,cellW-10,cellH-10);
        // Diamond pattern
        ctx.strokeStyle='rgba(80,110,180,0.2)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(0,-cellH*0.35);ctx.lineTo(cellW*0.3,0);ctx.lineTo(0,cellH*0.35);ctx.lineTo(-cellW*0.3,0);ctx.closePath();ctx.stroke();
        // Center ornament
        var cg=ctx.createRadialGradient(0,0,0,0,0,cellH*0.15);
        cg.addColorStop(0,'rgba(100,140,220,0.4)');cg.addColorStop(1,'rgba(60,80,140,0)');
        ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,cellH*0.15,0,Math.PI*2);ctx.fill();
        // Question mark
        ctx.fillStyle='rgba(120,150,220,0.5)';ctx.font='bold '+Math.round(cellH*0.3)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('?',0,2);
        // Outer border glow
        ctx.strokeStyle='rgba(80,120,200,0.25)';ctx.lineWidth=2;ctx.stroke();
    }
    ctx.restore();
}

function render(){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    // draw all cards
    for(var i=0;i<cards.length;i++)drawCard(i);
    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // info bar
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.textAlign='center';
    ctx.fillText('LEVEL '+level+'  |  MOVES: '+moves+'  |  PAIRS: '+matchCount+'/'+totalPairs,W/2,H-10);
}

function drawTitle(dt){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // floating card icons
    for(var i=0;i<8;i++){
        var x=W*0.1+i*(W*0.8/7);
        var y=H*0.4+Math.sin(titlePulse+i*0.8)*30;
        ctx.save();ctx.translate(x,y);
        ctx.fillStyle=COLORS[i%COLORS.length];ctx.globalAlpha=0.5+0.3*Math.sin(titlePulse+i);
        ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(ICONS[i],0,0);ctx.globalAlpha=1;ctx.restore();
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#33ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#33ccff';
    ctx.fillText('MEMORY MATCH',W/2,H*0.15);ctx.shadowBlur=0;
    if(bestScore>0){ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';ctx.fillStyle='#aaa';ctx.fillText('BEST: '+bestScore,W/2,H*0.23);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#33ccff';ctx.shadowBlur=25;ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';ctx.fillStyle='#33ccff';ctx.fillText('COMPLETE!',W/2,H*0.25);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('Level '+level+' — '+moves+' moves',W/2,H*0.52);
    if(bestScore>0)ctx.fillText('Best: '+bestScore,W/2,H*0.58);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='LV '+level;
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){level=1;score=0;resetGame();}
    if(['Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){level=1;score=0;resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var idx=hitTest(mx,my);
    if(idx>=0)tryFlip(idx);
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){level=1;score=0;resetGame();return;}
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    var mx=t.clientX-r.left,my=t.clientY-r.top;
    var idx=hitTest(mx,my);
    if(idx>=0)tryFlip(idx);
}

window.initMemoryMatch=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    gameState='title';titlePulse=0;level=1;score=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopMemoryMatch=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
