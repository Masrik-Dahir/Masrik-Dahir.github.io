// Hangman — Full Game
(function(){
var canvas,ctx,W,H,animId=null,gameState='title',titlePulse=0,gameTime=0;
var word='',category='',guessedLetters={},wrongCount=0,MAX_WRONG=7;
var score=0,bestScore=0,streak=0;
var particles=[],revealAnim=0,diffLevel=1;

function diffMult(){return diffLevel<=2?0.7:(diffLevel<=5?1.0:1.0+(diffLevel-5)*0.15);}
var CATEGORIES={
    ANIMALS:['ELEPHANT','GIRAFFE','DOLPHIN','PENGUIN','TIGER','BUTTERFLY','KANGAROO','OCTOPUS','CHEETAH','FLAMINGO','GORILLA','HAMSTER','IGUANA','JAGUAR','KOALA','LOBSTER','MACAW','NARWHAL'],
    FRUITS:['BANANA','STRAWBERRY','PINEAPPLE','WATERMELON','BLUEBERRY','MANGO','COCONUT','AVOCADO','RASPBERRY','POMEGRANATE','GRAPEFRUIT','TANGERINE','BLACKBERRY','CANTALOUPE','NECTARINE'],
    COUNTRIES:['BRAZIL','AUSTRALIA','GERMANY','JAPAN','CANADA','FRANCE','MEXICO','ICELAND','NORWAY','PORTUGAL','THAILAND','ARGENTINA','COLOMBIA','INDONESIA','MALAYSIA'],
    SPACE:['ASTEROID','GALAXY','NEBULA','SATELLITE','TELESCOPE','UNIVERSE','CONSTELLATION','ASTRONAUT','SPACESHIP','BLACKHOLE','SUPERNOVA','MERCURY','JUPITER','NEPTUNE'],
    SPORTS:['BASKETBALL','VOLLEYBALL','SWIMMING','BASEBALL','FOOTBALL','CRICKET','BADMINTON','GYMNASTICS','WRESTLING','MARATHON','ARCHERY','CYCLING','FENCING','SURFING']
};
var catKeys=Object.keys(CATEGORIES);
var keyRows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
var keyRects=[];
var hangmanX,hangmanY,hangmanScale;
var bodyParts=0;

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;calcKeyboard();}

function calcKeyboard(){
    keyRects=[];
    var kw=Math.min(W*0.08,35);var kh=kw*1.1;var gap=3;
    var startY=H*0.72;
    for(var row=0;row<keyRows.length;row++){
        var letters=keyRows[row];
        var totalW=letters.length*(kw+gap)-gap;
        var sx=(W-totalW)/2;
        for(var i=0;i<letters.length;i++){
            keyRects.push({x:sx+i*(kw+gap),y:startY+row*(kh+gap),w:kw,h:kh,letter:letters[i]});
        }
    }
    hangmanX=W*0.25;hangmanY=H*0.15;hangmanScale=Math.min(W*0.003,H*0.004);
}

function pickWord(){
    var ci=Math.floor(Math.random()*catKeys.length);
    category=catKeys[ci];
    var words=CATEGORIES[category];
    word=words[Math.floor(Math.random()*words.length)];
}

function resetGame(){
    pickWord();
    guessedLetters={};wrongCount=0;bodyParts=0;revealAnim=0;gameTime=0;
    gameState='playing';
}

function guessLetter(l){
    if(guessedLetters[l])return;
    guessedLetters[l]=true;
    if(word.indexOf(l)===-1){
        wrongCount++;bodyParts=wrongCount;
        addParticles(hangmanX,hangmanY+60*hangmanScale,'#ff3333',8);
        if(wrongCount>=MAX_WRONG){
            revealAnim=0;gameState='gameover';score=0;streak=0;
        }
    }else{
        addParticles(W/2,H*0.55,'#33ff66',10);
        score+=10*streak+10;
        // check win
        var won=true;
        for(var i=0;i<word.length;i++){
            if(!guessedLetters[word[i]]){won=false;break;}
        }
        if(won){
            streak++;score+=50+streak*20;
            if(score>bestScore)bestScore=score;
            addParticles(W/2,H*0.3,'#ffcc00',20);
            setTimeout(function(){if(gameState==='playing')resetGame();},1200);
        }
    }
}

function addParticles(x,y,color,count){
    for(var i=0;i<count;i++){
        var a=Math.random()*Math.PI*2;var s=Math.random()*100+30;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,size:Math.random()*3+2});
    }
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    if(revealAnim<1)revealAnim=Math.min(1,revealAnim+dt*2);
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt*1.5;
        if(p.life<=0)particles.splice(i,1);
    }
}

function drawHangman(){
    var x=hangmanX,y=hangmanY,s=hangmanScale;
    ctx.save();
    // Detailed gallows with wood grain
    // Base platform
    ctx.fillStyle='#5a4a3a';ctx.fillRect(x-35*s,y+78*s,70*s,6*s);
    ctx.fillStyle='#7a6a5a';ctx.fillRect(x-33*s,y+78*s,66*s,3*s);
    // Vertical pole with grain
    var poleG=ctx.createLinearGradient(x-14*s,0,x-6*s,0);
    poleG.addColorStop(0,'#5a4a3a');poleG.addColorStop(0.5,'#7a6a55');poleG.addColorStop(1,'#5a4a3a');
    ctx.fillStyle=poleG;ctx.fillRect(x-14*s,y-42*s,8*s,120*s);
    // Horizontal beam
    ctx.fillStyle=poleG;ctx.fillRect(x-14*s,y-44*s,48*s,6*s);
    // Support brace
    ctx.strokeStyle='#6a5a4a';ctx.lineWidth=2*s;
    ctx.beginPath();ctx.moveTo(x-10*s,y-30*s);ctx.lineTo(x+5*s,y-42*s);ctx.stroke();
    // Rope
    ctx.strokeStyle='#aa9966';ctx.lineWidth=2*s;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x+30*s,y-42*s);ctx.lineTo(x+30*s,y-25*s);ctx.stroke();
    // Rope knot
    ctx.fillStyle='#aa9966';ctx.beginPath();ctx.arc(x+30*s,y-25*s,2*s,0,Math.PI*2);ctx.fill();

    // Body parts with gradient coloring
    var bodyColor='#ffcc44';var skinColor='#ffddaa';
    if(bodyParts>=1){// head with face
        ctx.save();ctx.shadowColor='rgba(255,200,0,0.3)';ctx.shadowBlur=8;
        var hg=ctx.createRadialGradient(x+28*s,y-18*s,2*s,x+30*s,y-15*s,10*s);
        hg.addColorStop(0,skinColor);hg.addColorStop(1,'#ddbb88');
        ctx.fillStyle=hg;ctx.beginPath();ctx.arc(x+30*s,y-15*s,10*s,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#cc9966';ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;ctx.restore();
        // Hair
        ctx.fillStyle='#553311';
        ctx.beginPath();ctx.arc(x+30*s,y-19*s,8*s,Math.PI*1.1,Math.PI*1.9);ctx.fill();
        if(bodyParts<7){// alive face
            // eyes
            ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+27*s,y-16*s,2.5*s,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x+33*s,y-16*s,2.5*s,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#333';ctx.beginPath();ctx.arc(x+27*s,y-16*s,1.2*s,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x+33*s,y-16*s,1.2*s,0,Math.PI*2);ctx.fill();
            // mouth (worried)
            ctx.strokeStyle='#aa6644';ctx.lineWidth=1;
            ctx.beginPath();ctx.arc(x+30*s,y-9*s,3*s,0.2,Math.PI-0.2);ctx.stroke();
        }
    }
    if(bodyParts>=2){// body (torso)
        ctx.strokeStyle=bodyColor;ctx.lineWidth=3*s;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x+30*s,y-5*s);ctx.lineTo(x+30*s,y+25*s);ctx.stroke();
        // Shirt collar
        ctx.strokeStyle='#ffaa22';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x+25*s,y-3*s);ctx.lineTo(x+30*s,y+2*s);ctx.lineTo(x+35*s,y-3*s);ctx.stroke();
    }
    if(bodyParts>=3){// left arm
        ctx.strokeStyle=bodyColor;ctx.lineWidth=2.5*s;
        ctx.beginPath();ctx.moveTo(x+30*s,y+5*s);ctx.lineTo(x+15*s,y+20*s);ctx.stroke();
        // hand
        ctx.fillStyle=skinColor;ctx.beginPath();ctx.arc(x+15*s,y+20*s,2*s,0,Math.PI*2);ctx.fill();
    }
    if(bodyParts>=4){// right arm
        ctx.strokeStyle=bodyColor;ctx.lineWidth=2.5*s;
        ctx.beginPath();ctx.moveTo(x+30*s,y+5*s);ctx.lineTo(x+45*s,y+20*s);ctx.stroke();
        ctx.fillStyle=skinColor;ctx.beginPath();ctx.arc(x+45*s,y+20*s,2*s,0,Math.PI*2);ctx.fill();
    }
    if(bodyParts>=5){// left leg
        ctx.strokeStyle='#4466aa';ctx.lineWidth=2.5*s;
        ctx.beginPath();ctx.moveTo(x+30*s,y+25*s);ctx.lineTo(x+17*s,y+45*s);ctx.stroke();
        // shoe
        ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(x+15*s,y+46*s,4*s,2*s,0.2,0,Math.PI*2);ctx.fill();
    }
    if(bodyParts>=6){// right leg
        ctx.strokeStyle='#4466aa';ctx.lineWidth=2.5*s;
        ctx.beginPath();ctx.moveTo(x+30*s,y+25*s);ctx.lineTo(x+43*s,y+45*s);ctx.stroke();
        ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(x+45*s,y+46*s,4*s,2*s,-0.2,0,Math.PI*2);ctx.fill();
    }
    if(bodyParts>=7){// dead face X_X
        ctx.fillStyle=skinColor;ctx.beginPath();ctx.arc(x+30*s,y-15*s,10*s,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#ff3333';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+25*s,y-18*s);ctx.lineTo(x+29*s,y-14*s);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+29*s,y-18*s);ctx.lineTo(x+25*s,y-14*s);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+31*s,y-18*s);ctx.lineTo(x+35*s,y-14*s);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+35*s,y-18*s);ctx.lineTo(x+31*s,y-14*s);ctx.stroke();
        // dead tongue
        ctx.fillStyle='#ff6666';ctx.beginPath();ctx.ellipse(x+30*s,y-7*s,2*s,3*s,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
}

function drawWord(){
    var fs=Math.min(W*0.05,36);
    ctx.font='bold '+Math.round(fs)+'px "Courier New",monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var totalW=word.length*(fs*0.9);
    var sx=W/2-totalW/2+fs*0.45;
    var wy=H*0.55;
    for(var i=0;i<word.length;i++){
        var x=sx+i*(fs*0.9);
        if(guessedLetters[word[i]]||gameState==='gameover'){
            ctx.fillStyle=guessedLetters[word[i]]?'#33ccff':'#ff6666';
            ctx.fillText(word[i],x,wy);
        }else{
            ctx.fillStyle='#555';ctx.fillText('_',x,wy+4);
        }
    }
    // category
    ctx.fillStyle='#666';ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.fillText('Category: '+category,W/2,wy-fs*0.8);
}

function drawKeyboard(){
    for(var i=0;i<keyRects.length;i++){
        var k=keyRects[i];
        var guessed=guessedLetters[k.letter];
        var inWord=word.indexOf(k.letter)!==-1;
        if(guessed&&inWord){ctx.fillStyle='#225533';ctx.strokeStyle='#33ff66';}
        else if(guessed&&!inWord){ctx.fillStyle='#332222';ctx.strokeStyle='#553333';}
        else{ctx.fillStyle='#2a2a4a';ctx.strokeStyle='#445566';}
        ctx.lineWidth=1;ctx.fillRect(k.x,k.y,k.w,k.h);ctx.strokeRect(k.x,k.y,k.w,k.h);
        ctx.fillStyle=guessed?(inWord?'#33ff66':'#663333'):'#ccccee';
        ctx.font='bold '+Math.round(k.h*0.5)+'px "Courier New",monospace';
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(k.letter,k.x+k.w/2,k.y+k.h/2+1);
    }
}

function render(){
    ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
    drawHangman();drawWord();drawKeyboard();
    // wrong count
    ctx.fillStyle='#ff6666';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.textAlign='left';ctx.fillText('WRONG: '+wrongCount+'/'+MAX_WRONG,10,20);
    ctx.fillStyle='#aaa';ctx.textAlign='right';ctx.fillText('STREAK: '+streak,W-10,20);
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
    // animated letters
    var demo='HANGMAN';
    for(var i=0;i<demo.length;i++){
        var x=W*0.2+i*(W*0.6/(demo.length-1));
        var y=H*0.42+Math.sin(titlePulse+i*0.7)*15;
        ctx.fillStyle='hsl('+(titlePulse*30+i*40)+',70%,65%)';
        ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(demo[i],x,y);
    }
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';ctx.fillStyle='#ffcc00';
    ctx.fillText('HANGMAN',W/2,H*0.12);ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText(catKeys.length+' categories, '+Object.values(CATEGORIES).reduce(function(s,a){return s+a.length;},0)+' words',W/2,H*0.22);
    if(bestScore>0){ctx.fillText('BEST: '+bestScore,W/2,H*0.28);}
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.9);ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.save();ctx.textAlign='center';
    var won=wrongCount<MAX_WRONG;
    ctx.shadowColor=won?'#33ff66':'#ff3333';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle=won?'#33ff66':'#ff3333';ctx.fillText(won?'YOU WIN!':'HANGED!',W/2,H*0.2);ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.04)+'px "Courier New",monospace';
    ctx.fillText('The word was: '+word,W/2,H*0.38);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score+'  |  STREAK: '+streak,W/2,H*0.5);
    var a=0.5+0.5*Math.sin(titlePulse*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);ctx.restore();
}

function updateHUD(){
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='STREAK '+streak;
    document.getElementById('hud-time').textContent=Math.floor(gameTime)+'s';
}

var lastTs=0;
function gameLoop(ts){var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title')drawTitle(dt);
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){update(dt);titlePulse+=dt;render();drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function keyHitTest(mx,my){
    for(var i=0;i<keyRects.length;i++){
        var k=keyRects[i];
        if(mx>=k.x&&mx<=k.x+k.w&&my>=k.y&&my<=k.y+k.h)return k.letter;
    }
    return null;
}

function onKey(e){
    if((e.key==='Enter'||e.key==='Tab')&&gameState!=='playing'){score=0;streak=0;resetGame();e.preventDefault();return;}
    if(gameState!=='playing')return;
    var k=e.key.toUpperCase();
    if(k.length===1&&k>='A'&&k<='Z')guessLetter(k);
    if(['Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e);};

function onClick(e){
    if(gameState!=='playing'){score=0;streak=0;resetGame();return;}
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var l=keyHitTest(mx,my);
    if(l)guessLetter(l);
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){score=0;streak=0;resetGame();return;}
    var r=canvas.getBoundingClientRect();var t=e.touches[0];
    var mx=t.clientX-r.left,my=t.clientY-r.top;
    var l=keyHitTest(mx,my);
    if(l)guessLetter(l);
}

window.initHangman=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopHangman=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
