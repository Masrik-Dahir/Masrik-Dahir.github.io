// Solitaire (Klondike) — Full Game
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,titlePulse=0,gameTime=0;
var particles=[];
var moves=0;

// Card dimensions (computed on resize)
var CW,CH,GAP,MARGIN_X,MARGIN_Y,TABLEAU_Y,STACK_OFFSET;

// Card suits and values
var SUITS=['hearts','diamonds','clubs','spades'];
var SUIT_SYMBOLS={hearts:'\u2665',diamonds:'\u2666',clubs:'\u2663',spades:'\u2660'};
var SUIT_COLORS={hearts:'#ee2222',diamonds:'#ee2222',clubs:'#111111',spades:'#111111'};
var VALUES=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// Game piles
var stock=[]; // draw pile (face down)
var waste=[]; // drawn cards (face up)
var foundations=[[],[],[],[]]; // 4 foundation piles (build A→K by suit)
var tableau=[[],[],[],[],[],[],[]]; // 7 columns

// Selection state
var selected=null; // {source:'tableau'|'waste'|'foundation', col:int, idx:int, cards:[]}
var hoverPile=null; // highlight target

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    CW=Math.floor(W/9);
    CH=Math.floor(CW*1.45);
    GAP=Math.floor(CW*0.15);
    MARGIN_X=Math.floor((W-7*CW-6*GAP)/2);
    MARGIN_Y=Math.floor(H*0.03);
    TABLEAU_Y=MARGIN_Y+CH+GAP*3;
    STACK_OFFSET=Math.floor(CH*0.2);
}

function createDeck(){
    var deck=[];
    for(var s=0;s<4;s++){
        for(var v=0;v<13;v++){
            deck.push({suit:SUITS[s],value:VALUES[v],rank:v,faceUp:false});
        }
    }
    return deck;
}

function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var t=arr[i];arr[i]=arr[j];arr[j]=t;
    }
    return arr;
}

function deal(){
    var deck=shuffle(createDeck());
    stock=[];waste=[];
    foundations=[[],[],[],[]];
    tableau=[[],[],[],[],[],[],[]];
    score=0;moves=0;

    // Deal to tableau: col i gets i+1 cards, top card face up
    var idx=0;
    for(var c=0;c<7;c++){
        tableau[c]=[];
        for(var r=0;r<=c;r++){
            var card=deck[idx++];
            card.faceUp=(r===c);
            tableau[c].push(card);
        }
    }
    // Remaining cards go to stock
    stock=[];
    for(;idx<deck.length;idx++){
        deck[idx].faceUp=false;
        stock.push(deck[idx]);
    }
    waste=[];
    selected=null;
}

function isRed(suit){return suit==='hearts'||suit==='diamonds';}

function canPlaceOnTableau(card,col){
    if(tableau[col].length===0){
        return card.value==='K'; // Only kings on empty columns
    }
    var top=tableau[col][tableau[col].length-1];
    if(!top.faceUp)return false;
    return isRed(card.suit)!==isRed(top.suit)&&card.rank===top.rank-1;
}

function canPlaceOnFoundation(card,fIdx){
    if(foundations[fIdx].length===0){
        return card.value==='A';
    }
    var top=foundations[fIdx][foundations[fIdx].length-1];
    return card.suit===top.suit&&card.rank===top.rank+1;
}

function getCardPos(source,col,idx){
    if(source==='stock'){
        return {x:MARGIN_X,y:MARGIN_Y};
    }
    if(source==='waste'){
        return {x:MARGIN_X+CW+GAP,y:MARGIN_Y};
    }
    if(source==='foundation'){
        return {x:MARGIN_X+(3+col)*(CW+GAP),y:MARGIN_Y};
    }
    if(source==='tableau'){
        var offset=0;
        for(var i=0;i<idx;i++){
            offset+=tableau[col][i].faceUp?STACK_OFFSET:Math.floor(STACK_OFFSET*0.4);
        }
        return {x:MARGIN_X+col*(CW+GAP),y:TABLEAU_Y+offset};
    }
    return {x:0,y:0};
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
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;
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

// ─── DRAW CARD ───────────────────────────────────
function drawCard(x,y,card,highlight){
    ctx.save();
    // Card shadow
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();ctx.roundRect(x+2,y+2,CW,CH,5);ctx.fill();

    if(!card||!card.faceUp){
        // Face down - card back
        ctx.fillStyle='#2255aa';
        ctx.beginPath();ctx.roundRect(x,y,CW,CH,5);ctx.fill();
        ctx.strokeStyle='#3366cc';ctx.lineWidth=2;
        ctx.beginPath();ctx.roundRect(x+3,y+3,CW-6,CH-6,3);ctx.stroke();
        // Diamond pattern
        ctx.fillStyle='#1144aa';
        var ps=CW*0.12;
        for(var dy=0;dy<5;dy++){
            for(var dx=0;dx<3;dx++){
                var cx2=x+CW*0.2+dx*CW*0.25;
                var cy2=y+CH*0.15+dy*CH*0.17;
                ctx.beginPath();
                ctx.moveTo(cx2,cy2-ps);ctx.lineTo(cx2+ps,cy2);
                ctx.lineTo(cx2,cy2+ps);ctx.lineTo(cx2-ps,cy2);
                ctx.closePath();ctx.fill();
            }
        }
    }else{
        // Face up
        ctx.fillStyle=highlight?'#ffffcc':'#ffffff';
        ctx.beginPath();ctx.roundRect(x,y,CW,CH,5);ctx.fill();
        ctx.strokeStyle=highlight?'#ffcc00':'#999';ctx.lineWidth=highlight?2:1;
        ctx.beginPath();ctx.roundRect(x,y,CW,CH,5);ctx.stroke();

        var color=SUIT_COLORS[card.suit];
        var sym=SUIT_SYMBOLS[card.suit];

        // Value and suit (top-left)
        var fs=Math.max(10,Math.floor(CW*0.28));
        ctx.font='bold '+fs+'px "Courier New",monospace';
        ctx.fillStyle=color;ctx.textAlign='left';
        ctx.fillText(card.value,x+4,y+fs+2);
        ctx.font=Math.floor(fs*0.9)+'px serif';
        ctx.fillText(sym,x+4,y+fs*1.8);

        // Value and suit (bottom-right, rotated)
        ctx.save();
        ctx.translate(x+CW-4,y+CH-4);
        ctx.rotate(Math.PI);
        ctx.font='bold '+fs+'px "Courier New",monospace';
        ctx.textAlign='left';
        ctx.fillText(card.value,0,fs+2);
        ctx.font=Math.floor(fs*0.9)+'px serif';
        ctx.fillText(sym,0,fs*1.8);
        ctx.restore();

        // Center suit symbol (large)
        var bigFs=Math.floor(CW*0.5);
        ctx.font=bigFs+'px serif';
        ctx.textAlign='center';
        ctx.fillText(sym,x+CW/2,y+CH/2+bigFs*0.3);
    }
    ctx.restore();
}

function drawEmptyPile(x,y,label){
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;
    ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.roundRect(x,y,CW,CH,5);ctx.stroke();
    ctx.setLineDash([]);
    if(label){
        ctx.fillStyle='rgba(255,255,255,0.2)';
        ctx.font='bold '+Math.floor(CW*0.3)+'px "Courier New",monospace';
        ctx.textAlign='center';
        ctx.fillText(label,x+CW/2,y+CH/2+CW*0.1);
    }
}

// ─── RENDER ──────────────────────────────────────
function render(){
    // Green felt background
    var bgGrad=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
    bgGrad.addColorStop(0,'#1a6633');
    bgGrad.addColorStop(1,'#0d3318');
    ctx.fillStyle=bgGrad;
    ctx.fillRect(0,0,W,H);

    // Stock pile
    if(stock.length>0){
        drawCard(MARGIN_X,MARGIN_Y,{faceUp:false});
        // Count indicator
        ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.floor(CW*0.2)+'px "Courier New",monospace';
        ctx.textAlign='center';
        ctx.fillText(stock.length,MARGIN_X+CW/2,MARGIN_Y+CH+15);
    }else{
        drawEmptyPile(MARGIN_X,MARGIN_Y,'↻');
    }

    // Waste pile
    if(waste.length>0){
        var wc=waste[waste.length-1];
        var isSelected=selected&&selected.source==='waste';
        drawCard(MARGIN_X+CW+GAP,MARGIN_Y,wc,isSelected);
    }else{
        drawEmptyPile(MARGIN_X+CW+GAP,MARGIN_Y,'');
    }

    // Foundation piles
    for(var f=0;f<4;f++){
        var fx=MARGIN_X+(3+f)*(CW+GAP);
        if(foundations[f].length>0){
            drawCard(fx,MARGIN_Y,foundations[f][foundations[f].length-1],false);
        }else{
            drawEmptyPile(fx,MARGIN_Y,SUIT_SYMBOLS[SUITS[f]]);
        }
    }

    // Tableau columns
    for(var c=0;c<7;c++){
        var col=tableau[c];
        if(col.length===0){
            var tx=MARGIN_X+c*(CW+GAP);
            drawEmptyPile(tx,TABLEAU_Y,'K');
            continue;
        }
        var yOff=0;
        for(var r=0;r<col.length;r++){
            var pos=getCardPos('tableau',c,r);
            var isSelectedCard=selected&&selected.source==='tableau'&&selected.col===c&&r>=selected.idx;
            drawCard(pos.x,pos.y,col[r],isSelectedCard);
        }
    }

    drawParticles();

    // Move counter
    ctx.fillStyle='#aaa';ctx.font=Math.floor(CW*0.22)+'px "Courier New",monospace';
    ctx.textAlign='right';
    ctx.fillText('MOVES: '+moves,W-10,H-10);
}

// ─── CLICK HANDLING ──────────────────────────────
function handleClick(mx,my){
    if(gameState!=='playing')return;

    // Check stock click
    if(mx>=MARGIN_X&&mx<=MARGIN_X+CW&&my>=MARGIN_Y&&my<=MARGIN_Y+CH){
        if(stock.length>0){
            // Draw from stock
            var card=stock.pop();
            card.faceUp=true;
            waste.push(card);
            selected=null;
            moves++;
            return;
        }else{
            // Recycle waste to stock
            while(waste.length>0){
                var c2=waste.pop();
                c2.faceUp=false;
                stock.push(c2);
            }
            selected=null;
            return;
        }
    }

    // Check waste click
    if(mx>=MARGIN_X+CW+GAP&&mx<=MARGIN_X+2*CW+GAP&&my>=MARGIN_Y&&my<=MARGIN_Y+CH){
        if(waste.length>0){
            if(selected&&selected.source==='waste'){
                // Try auto-move to foundation
                var card=waste[waste.length-1];
                for(var f=0;f<4;f++){
                    if(canPlaceOnFoundation(card,f)){
                        foundations[f].push(waste.pop());
                        score+=10;moves++;
                        addParticles(MARGIN_X+(3+f)*(CW+GAP)+CW/2,MARGIN_Y+CH/2,'#ffcc00',10);
                        selected=null;
                        checkWin();
                        return;
                    }
                }
                selected=null;
            }else{
                selected={source:'waste',col:0,idx:waste.length-1,cards:[waste[waste.length-1]]};
            }
        }
        return;
    }

    // Check foundation clicks
    for(var f=0;f<4;f++){
        var fx=MARGIN_X+(3+f)*(CW+GAP);
        if(mx>=fx&&mx<=fx+CW&&my>=MARGIN_Y&&my<=MARGIN_Y+CH){
            if(selected){
                // Try to place on foundation
                var card=selected.cards[0];
                if(selected.cards.length===1&&canPlaceOnFoundation(card,f)){
                    // Move card
                    if(selected.source==='waste'){
                        waste.pop();
                    }else if(selected.source==='tableau'){
                        tableau[selected.col].splice(selected.idx,1);
                        flipTopCard(selected.col);
                    }
                    foundations[f].push(card);
                    score+=10;moves++;
                    addParticles(fx+CW/2,MARGIN_Y+CH/2,'#ffcc00',10);
                    selected=null;
                    checkWin();
                    return;
                }
            }
            selected=null;
            return;
        }
    }

    // Check tableau clicks
    for(var c=0;c<7;c++){
        var col=tableau[c];
        var tx=MARGIN_X+c*(CW+GAP);

        // Empty column - only accept King
        if(col.length===0){
            if(mx>=tx&&mx<=tx+CW&&my>=TABLEAU_Y&&my<=TABLEAU_Y+CH){
                if(selected&&selected.cards[0].value==='K'){
                    moveSelectedTo(c);
                    return;
                }
                selected=null;
                return;
            }
            continue;
        }

        // Check each card in column (from bottom up for proper click detection)
        for(var r=col.length-1;r>=0;r--){
            var pos=getCardPos('tableau',c,r);
            var cardH=(r===col.length-1)?CH:STACK_OFFSET;
            if(!col[r].faceUp)cardH=Math.floor(STACK_OFFSET*0.4);

            if(mx>=pos.x&&mx<=pos.x+CW&&my>=pos.y&&my<=pos.y+cardH){
                if(!col[r].faceUp){
                    // Flip face-down card if it's the last one
                    if(r===col.length-1){
                        col[r].faceUp=true;
                        moves++;
                    }
                    selected=null;
                    return;
                }

                if(selected){
                    // Try to place selection on this column
                    if(canPlaceOnTableau(selected.cards[0],c)){
                        moveSelectedTo(c);
                        return;
                    }
                    // Clicked same selection - try double-click (auto-foundation)
                    if(selected.source==='tableau'&&selected.col===c&&selected.idx===r){
                        if(selected.cards.length===1){
                            for(var f2=0;f2<4;f2++){
                                if(canPlaceOnFoundation(selected.cards[0],f2)){
                                    tableau[c].splice(r,1);
                                    foundations[f2].push(selected.cards[0]);
                                    flipTopCard(c);
                                    score+=10;moves++;
                                    var fPos=getCardPos('foundation',f2,0);
                                    addParticles(fPos.x+CW/2,fPos.y+CH/2,'#ffcc00',10);
                                    selected=null;
                                    checkWin();
                                    return;
                                }
                            }
                        }
                        selected=null;
                        return;
                    }
                    selected=null;
                }

                // Select this card and all below it
                var cards=col.slice(r);
                // Verify all are face up
                var allUp=true;
                for(var k=0;k<cards.length;k++){if(!cards[k].faceUp){allUp=false;break;}}
                if(allUp){
                    selected={source:'tableau',col:c,idx:r,cards:cards};
                }
                return;
            }
        }
    }

    // Clicked elsewhere - deselect
    selected=null;
}

function moveSelectedTo(targetCol){
    if(!selected)return;
    var cards=selected.cards;

    if(selected.source==='waste'){
        waste.pop();
    }else if(selected.source==='tableau'){
        tableau[selected.col].splice(selected.idx,cards.length);
        flipTopCard(selected.col);
    }else if(selected.source==='foundation'){
        foundations[selected.col].pop();
    }

    for(var i=0;i<cards.length;i++){
        tableau[targetCol].push(cards[i]);
    }
    score+=5;moves++;
    selected=null;
}

function flipTopCard(col){
    if(tableau[col].length>0){
        var top=tableau[col][tableau[col].length-1];
        if(!top.faceUp){top.faceUp=true;score+=5;}
    }
}

function checkWin(){
    var total=0;
    for(var f=0;f<4;f++)total+=foundations[f].length;
    if(total===52){
        gameState='gameover';
        score+=1000; // Win bonus
        // Fireworks
        for(var i=0;i<100;i++){
            addParticles(Math.random()*W,Math.random()*H,
                ['#ff4444','#44ff44','#4444ff','#ffcc00','#ff44ff'][Math.floor(Math.random()*5)],3);
        }
    }
}

function autoComplete(){
    // If all tableau cards are face up, auto-complete to foundations
    var canAuto=true;
    for(var c=0;c<7;c++){
        for(var r=0;r<tableau[c].length;r++){
            if(!tableau[c][r].faceUp){canAuto=false;break;}
        }
        if(!canAuto)break;
    }
    if(!canAuto||waste.length>0||stock.length>0)return false;

    // Try to move one card to foundation
    for(var c=0;c<7;c++){
        if(tableau[c].length===0)continue;
        var card=tableau[c][tableau[c].length-1];
        for(var f=0;f<4;f++){
            if(canPlaceOnFoundation(card,f)){
                foundations[f].push(tableau[c].pop());
                score+=10;
                var pos=getCardPos('foundation',f,0);
                addParticles(pos.x+CW/2,pos.y+CH/2,'#ffcc00',5);
                checkWin();
                return true;
            }
        }
    }
    return false;
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;

    var bgGrad=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.7);
    bgGrad.addColorStop(0,'#1a6633');bgGrad.addColorStop(1,'#0d3318');
    ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#ffcc00';ctx.shadowBlur=30;
    var ts=Math.round(W*0.06);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.22*(1-scale));
    ctx.fillStyle='#ffcc00';ctx.fillText('SOLITAIRE',W/2,H*0.22);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    // Subtitle
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.025)+'px "Courier New",monospace';
    ctx.fillText('KLONDIKE',W/2,H*0.30);

    // Animated cards
    var cardW2=Math.floor(W*0.06);var cardH2=Math.floor(cardW2*1.45);
    var suits2=['\u2665','\u2666','\u2663','\u2660'];
    var colors2=['#ee2222','#ee2222','#111','#111'];
    for(var i=0;i<4;i++){
        var cx2=W*0.25+i*W*0.17;
        var cy2=H*0.50+Math.sin(titlePulse*2+i*0.8)*15;
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.roundRect(cx2-cardW2/2,cy2-cardH2/2,cardW2,cardH2,4);ctx.fill();
        ctx.strokeStyle='#999';ctx.lineWidth=1;
        ctx.beginPath();ctx.roundRect(cx2-cardW2/2,cy2-cardH2/2,cardW2,cardH2,4);ctx.stroke();
        ctx.fillStyle=colors2[i];ctx.font='bold '+Math.floor(cardW2*0.6)+'px serif';
        ctx.fillText(suits2[i],cx2,cy2+cardW2*0.15);
    }

    // Instructions
    var fs=Math.round(W*0.016);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#aaa';
    ctx.fillText('Click cards to select, click targets to place',W/2,H*0.68);
    ctx.fillText('Build foundations A→K by suit',W/2,H*0.73);
    ctx.fillText('Stack tableau cards in alternating colors K→A',W/2,H*0.78);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.90);

    ctx.restore();
}

function drawGameOver(){
    render(); // Draw final board state
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ffcc00';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc00';ctx.fillText('YOU WIN!',W/2,H*0.25);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Moves: '+moves,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='MOV '+moves;
    var fTotal=0;for(var f=0;f<4;f++)fTotal+=foundations[f].length;
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=fTotal+'/52';
}

function resetGame(){
    deal();
    gameState='playing';gameTime=0;titlePulse=0;particles=[];selected=null;
}

// Auto-complete timer
var autoTimer=0;

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;
    gameTime+=dt;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){
        updateParticles(dt);
        // Auto-complete check
        autoTimer+=dt;
        if(autoTimer>0.3){
            autoTimer=0;
            autoComplete();
        }
        render();
        updateHUD();
    }
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

function onClick(e){
    if(gameState!=='playing'){resetGame();return;}
    var pos=getMousePos(e);
    handleClick(pos.x,pos.y);
}

function onTouch(e){
    e.preventDefault();
    if(gameState!=='playing'){resetGame();return;}
    var pos=getMousePos(e);
    handleClick(pos.x,pos.y);
}

function onKey(e,down){
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(e.key==='Tab')e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

// ─── INIT / STOP ─────────────────────────────────
window.initSolitaire=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('touchstart',onTouch);
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopSolitaire=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    canvas.removeEventListener('click',onClick);
    canvas.removeEventListener('touchstart',onTouch);
    window.removeEventListener('resize',resize);
    gameState='title';
};
})();
