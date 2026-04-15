// Mastermind — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var CODE_LEN=4,NUM_COLORS=6,MAX_GUESSES=10;
var secretCode=[],guesses=[],feedback=[],currentGuess=[],currentRow=0;
var score=0,bestScore=0,selectedColor=0;
var particles=[];
var PEG_COLORS=['#ff3333','#33cc33','#3399ff','#ffcc00','#ff66cc','#ff9933'];
var PEG_NAMES=['RED','GRN','BLU','YLW','PNK','ORG'];
var PEG_GLOW=['#ff6666','#66ff66','#66bbff','#ffee66','#ff99ee','#ffbb66'];
var pegRadius,rowH,boardX,boardY,boardW,diffLevel=1;

function diffMult(){return diffLevel<=2?0.7:(diffLevel<=5?1.0:1.0+(diffLevel-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcLayout();}

function calcLayout(){
    rowH=Math.min((H-80)/(MAX_GUESSES+2),40);
    pegRadius=Math.min(rowH*0.35,W*0.03);
    boardW=W*0.7;
    boardX=(W-boardW)/2;
    boardY=H-rowH*(MAX_GUESSES+1)-20;
}

function resetGame(){
    secretCode=[];for(var i=0;i<CODE_LEN;i++)secretCode.push(Math.floor(Math.random()*NUM_COLORS));
    guesses=[];feedback=[];currentGuess=[];currentRow=0;gameTime=0;
    gameState='playing';
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*100+30;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+2});
    }
}

function checkGuess(guess){
    var exact=0,color=0;
    var secretUsed=Array(CODE_LEN).fill(false);
    var guessUsed=Array(CODE_LEN).fill(false);
    for(var i=0;i<CODE_LEN;i++){
        if(guess[i]===secretCode[i]){exact++;secretUsed[i]=true;guessUsed[i]=true;}
    }
    for(var i=0;i<CODE_LEN;i++){
        if(guessUsed[i])continue;
        for(var j=0;j<CODE_LEN;j++){
            if(secretUsed[j])continue;
            if(guess[i]===secretCode[j]){color++;secretUsed[j]=true;break;}
        }
    }
    return{exact:exact,color:color};
}

function submitGuess(){
    if(currentGuess.length!==CODE_LEN)return;
    var guess=currentGuess.slice();
    guesses.push(guess);
    var fb=checkGuess(guess);
    feedback.push(fb);
    currentGuess=[];
    if(fb.exact===CODE_LEN){
        score=Math.max(1,(MAX_GUESSES-currentRow)*100);
        if(score>bestScore)bestScore=score;
        for(var i=0;i<CODE_LEN;i++){
            var px=boardX+boardW*0.15+i*(pegRadius*3);
            addParticles(px,boardY+currentRow*rowH+rowH/2,'#33ff66',15);
        }
        gameState='gameover';return;
    }
    currentRow++;
    if(currentRow>=MAX_GUESSES){score=0;gameState='gameover';}
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;p.life-=dt*1.5;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawPeg(x,y,colorIdx,r,glow){
    ctx.save();
    // Drop shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.arc(x+1,y+2,r*0.9,0,Math.PI*2);ctx.fill();
    if(glow){ctx.shadowColor=PEG_GLOW[colorIdx];ctx.shadowBlur=12;}
    // Multi-stop radial gradient for 3D sphere
    var g=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.05,x,y,r);
    g.addColorStop(0,'#ffffff');g.addColorStop(0.15,PEG_GLOW[colorIdx]);g.addColorStop(0.5,PEG_COLORS[colorIdx]);
    g.addColorStop(1,darkenHex(PEG_COLORS[colorIdx],60));
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Specular highlight
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.beginPath();ctx.ellipse(x-r*0.2,y-r*0.25,r*0.25,r*0.15,-0.3,0,Math.PI*2);ctx.fill();
    // Rim light
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,r*0.85,Math.PI*0.6,Math.PI*1.1);ctx.stroke();
    // Edge dark border
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
    ctx.restore();
}
function darkenHex(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,r-a);g=Math.max(0,g-a);b=Math.max(0,b-a);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

function drawFeedbackPegs(x,y,fb){
    var sz=pegRadius*0.4;var gap=sz*2.5;
    var startX=x;
    for(var i=0;i<fb.exact;i++){
        ctx.fillStyle='#ff3333';ctx.beginPath();ctx.arc(startX+i*gap,y,sz,0,Math.PI*2);ctx.fill();
    }
    for(var i=0;i<fb.color;i++){
        ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(startX+(fb.exact+i)*gap,y,sz,0,Math.PI*2);ctx.fill();
    }
    var empty=CODE_LEN-fb.exact-fb.color;
    for(var i=0;i<empty;i++){
        ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.beginPath();ctx.arc(startX+(fb.exact+fb.color+i)*gap,y,sz,0,Math.PI*2);ctx.stroke();
    }
}

function render(){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    // title bar
    ctx.fillStyle='#aaa';ctx.font='bold '+Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.textAlign='center';ctx.fillText('GUESS THE CODE — '+MAX_GUESSES+' TRIES',W/2,boardY-10);

    // draw rows
    for(var row=0;row<MAX_GUESSES;row++){
        var y=boardY+row*rowH+rowH/2;
        var isCurrentRow=row===currentRow&&gameState==='playing';
        // row bg
        ctx.fillStyle=isCurrentRow?'rgba(51,153,255,0.1)':'rgba(255,255,255,0.02)';
        ctx.fillRect(boardX,boardY+row*rowH,boardW,rowH-2);
        // row number
        ctx.fillStyle='#555';ctx.font=Math.round(rowH*0.35)+'px "Courier New",monospace';
        ctx.textAlign='right';ctx.fillText((row+1)+'.',boardX-8,y+4);
        // pegs
        if(row<guesses.length){
            for(var i=0;i<CODE_LEN;i++){
                drawPeg(boardX+boardW*0.1+i*(pegRadius*3),y,guesses[row][i],pegRadius,false);
            }
            drawFeedbackPegs(boardX+boardW*0.6,y,feedback[row]);
        }else if(isCurrentRow){
            for(var i=0;i<CODE_LEN;i++){
                if(i<currentGuess.length){
                    drawPeg(boardX+boardW*0.1+i*(pegRadius*3),y,currentGuess[i],pegRadius,true);
                }else{
                    ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.beginPath();
                    ctx.arc(boardX+boardW*0.1+i*(pegRadius*3),y,pegRadius,0,Math.PI*2);ctx.stroke();
                }
            }
        }else{
            for(var i=0;i<CODE_LEN;i++){
                ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();
                ctx.arc(boardX+boardW*0.1+i*(pegRadius*3),y,pegRadius*0.6,0,Math.PI*2);ctx.stroke();
            }
        }
    }

    // color palette at bottom
    var palY=boardY+MAX_GUESSES*rowH+10;
    var palGap=pegRadius*3;
    var palStart=(W-NUM_COLORS*palGap)/2+pegRadius;
    for(var i=0;i<NUM_COLORS;i++){
        drawPeg(palStart+i*palGap,palY+pegRadius,i,pegRadius,i===selectedColor);
        if(i===selectedColor){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(palStart+i*palGap,palY+pegRadius,pegRadius+3,0,Math.PI*2);ctx.stroke();}
    }
    // submit/undo
    ctx.fillStyle='#33ccff';ctx.font='bold '+Math.round(W*0.018)+'px "Courier New",monospace';ctx.textAlign='center';
    ctx.fillText('[ENTER=SUBMIT]  [BACKSPACE=UNDO]  [1-6=COLORS]',W/2,palY+pegRadius*3.5);

    // particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
}

function drawTitle(dt){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    // animated pegs
    for(var i=0;i<NUM_COLORS;i++){
        var x=W*0.2+i*(W*0.6/(NUM_COLORS-1));
        var y=H*0.45+Math.sin(titlePulse+i*1.2)*20;
        drawPeg(x,y,i,Math.min(W,H)*0.04,true);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff66cc';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';ctx.fillStyle='#ff66cc';
    ctx.fillText('MASTERMIND',W/2,H*0.15);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Guess the hidden '+CODE_LEN+'-color code',W/2,H*0.25);
    ctx.fillText('RED = right color + position',W/2,H*0.62);
    ctx.fillText('WHITE = right color, wrong position',W/2,H*0.67);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.75);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    var won=score>0;
    ctx.shadowColor=won?'#33ff66':'#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle=won?'#33ff66':'#ff3333';ctx.fillText(won?'YOU WIN!':'GAME OVER',W/2,H*0.2);ctx.shadowBlur=0;
    // show secret
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('The code was:',W/2,H*0.35);
    for(var i=0;i<CODE_LEN;i++){
        drawPeg(W/2-CODE_LEN*pegRadius*1.5+i*pegRadius*3+pegRadius,H*0.42,secretCode[i],pegRadius*1.2,true);
    }
    if(won){ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';ctx.fillText('SCORE: '+score,W/2,H*0.55);}
    else{ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';ctx.fillText('Better luck next time!',W/2,H*0.55);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='ROW '+(currentRow+1)+'/'+MAX_GUESSES;
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function paletteHitTest(mx,my){
    var palY=boardY+MAX_GUESSES*rowH+10;
    var palGap=pegRadius*3;
    var palStart=(W-NUM_COLORS*palGap)/2+pegRadius;
    for(var i=0;i<NUM_COLORS;i++){
        var px=palStart+i*palGap,py=palY+pegRadius;
        var dx=mx-px,dy=my-py;
        if(dx*dx+dy*dy<=(pegRadius+4)*(pegRadius+4))return i;
    }
    return -1;
}

function boardHitTest(mx,my){
    if(currentRow>=MAX_GUESSES)return -1;
    var y=boardY+currentRow*rowH;
    if(my<y||my>y+rowH)return -1;
    for(var i=0;i<CODE_LEN;i++){
        var px=boardX+boardW*0.1+i*(pegRadius*3);
        if(Math.abs(mx-px)<=pegRadius*1.5)return i;
    }
    return -1;
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    if(e.key>='1'&&e.key<='6'){
        var ci=parseInt(e.key)-1;
        if(currentGuess.length<CODE_LEN)currentGuess.push(ci);
        selectedColor=ci;
    }
    if(e.key==='Backspace'&&currentGuess.length>0)currentGuess.pop();
    if(e.key==='Enter')submitGuess();
    if(e.key==='ArrowLeft')selectedColor=(selectedColor-1+NUM_COLORS)%NUM_COLORS;
    if(e.key==='ArrowRight')selectedColor=(selectedColor+1)%NUM_COLORS;
    if(e.key===' '&&currentGuess.length<CODE_LEN)currentGuess.push(selectedColor);
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab',' ','Backspace'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var ci=paletteHitTest(mx,my);
    if(ci>=0){selectedColor=ci;if(currentGuess.length<CODE_LEN)currentGuess.push(ci);return;}
    // tap on board peg slot
    var slot=boardHitTest(mx,my);
    if(slot>=0&&slot<currentGuess.length){currentGuess.splice(slot,1);}
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    var mx=t.clientX-r.left,my=t.clientY-r.top;
    var ci=paletteHitTest(mx,my);
    if(ci>=0){selectedColor=ci;if(currentGuess.length<CODE_LEN)currentGuess.push(ci);return;}
}

window.initMastermind=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopMastermind=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
