// Mr. Do! — Full Game (Dig tunnels, collect cherries, crush monsters)
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var keys={};
var particles=[];

var COLS=14,ROWS=14,cs; // cell size
var SURFACE_ROWS=1;
var grid=[]; // 0=tunnel, 1=dirt, 2=cherry
var player,monsters=[],apples=[],ball=null;
var cherryTotal=0,cherriesCollected=0;
var ballCooldown=0;

var DIRT_COLORS=['#5a8a3a','#4a7a2a','#3a6a1a'];

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    cs=Math.floor(Math.min(W/COLS,(H-10)/ROWS));
}

function addParticles(px,py,color,count){
    for(var i=0;i<count;i++){
        particles.push({x:px,y:py,
            vx:(Math.random()-0.5)*150,vy:(Math.random()-0.5)*150,
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

// ─── GENERATE LEVEL ──────────────────────────────
function generateLevel(){
    grid=[];
    cherryTotal=0;cherriesCollected=0;

    for(var y=0;y<ROWS;y++){
        grid[y]=[];
        for(var x=0;x<COLS;x++){
            if(y<SURFACE_ROWS){
                grid[y][x]=0; // Surface is open
            }else{
                grid[y][x]=1; // Dirt
            }
        }
    }

    // Place cherry clusters (groups of 2-4 cherries)
    var clusterCount=6+Math.floor(level*0.5);
    for(var c=0;c<clusterCount;c++){
        var cx2=2+Math.floor(Math.random()*(COLS-4));
        var cy2=SURFACE_ROWS+2+Math.floor(Math.random()*(ROWS-SURFACE_ROWS-4));
        var size=2+Math.floor(Math.random()*2);
        for(var dy=-1;dy<=1;dy++){
            for(var dx=-1;dx<=1;dx++){
                if(Math.abs(dy)+Math.abs(dx)>1&&Math.random()>0.5)continue;
                var px2=cx2+dx,py2=cy2+dy;
                if(px2>=0&&px2<COLS&&py2>=SURFACE_ROWS&&py2<ROWS&&grid[py2][px2]===1){
                    grid[py2][px2]=2;
                    cherryTotal++;
                }
                if(--size<=0)break;
            }
            if(size<=0)break;
        }
    }

    // Place player at top center
    var startX=Math.floor(COLS/2);
    grid[SURFACE_ROWS][startX]=0; // Dig starting tunnel
    player={
        gx:startX,gy:SURFACE_ROWS,
        x:startX,y:SURFACE_ROWS,
        dir:{x:0,y:1},
        moveTimer:0,
        speed:4.5,
        animFrame:0
    };

    // Place monsters
    monsters=[];
    var monsterCount=3+Math.floor(level*0.5);
    if(monsterCount>8)monsterCount=8;
    for(var m=0;m<monsterCount;m++){
        var mx2,my2,valid;
        var attempts=0;
        do{
            mx2=1+Math.floor(Math.random()*(COLS-2));
            my2=SURFACE_ROWS+3+Math.floor(Math.random()*(ROWS-SURFACE_ROWS-4));
            valid=true;
            if(Math.abs(mx2-player.gx)+Math.abs(my2-player.gy)<5)valid=false;
            for(var j=0;j<monsters.length;j++){
                if(monsters[j].gx===mx2&&monsters[j].gy===my2){valid=false;break;}
            }
            attempts++;
        }while(!valid&&attempts<100);

        // Carve pocket around monster
        grid[my2][mx2]=0;
        if(mx2>0)grid[my2][mx2-1]=0;
        if(mx2<COLS-1)grid[my2][mx2+1]=0;

        monsters.push({
            gx:mx2,gy:my2,
            x:mx2,y:my2,
            dir:{x:[-1,1][Math.floor(Math.random()*2)],y:0},
            moveTimer:0,
            speed:1.5+level*0.08,
            alive:true,
            type:m%3===0?'alpha':m%3===1?'muncher':'digger',
            stunTimer:0,
            digTimer:0
        });
    }

    // Place apples (fall traps)
    apples=[];
    var appleCount=3+Math.floor(Math.random()*2);
    for(var a=0;a<appleCount;a++){
        var ax2,ay2,aValid;
        var aAttempts=0;
        do{
            ax2=1+Math.floor(Math.random()*(COLS-2));
            ay2=SURFACE_ROWS+1+Math.floor(Math.random()*Math.floor(ROWS/3));
            aValid=grid[ay2][ax2]===1;
            if(ax2===player.gx&&ay2===player.gy)aValid=false;
            aAttempts++;
        }while(!aValid&&aAttempts<80);
        if(aValid){
            apples.push({
                gx:ax2,gy:ay2,
                x:ax2,y:ay2,
                falling:false,
                fallSpeed:0,
                wobble:0,
                crushed:false,
                settled:false
            });
        }
    }

    ball=null;
    ballCooldown=0;
    particles=[];
}

// ─── HELPERS ─────────────────────────────────────
function isDirt(gx,gy){return gx>=0&&gx<COLS&&gy>=0&&gy<ROWS&&grid[gy][gx]>=1;}
function isTunnel(gx,gy){return gx>=0&&gx<COLS&&gy>=0&&gy<ROWS&&grid[gy][gx]===0;}
function inBounds(gx,gy){return gx>=0&&gx<COLS&&gy>=0&&gy<ROWS;}

function hasAppleAt(gx,gy){
    for(var i=0;i<apples.length;i++){
        if(!apples[i].crushed&&apples[i].gx===gx&&apples[i].gy===gy)return true;
    }
    return false;
}

// ─── FIRE BALL ───────────────────────────────────
function fireBall(){
    if(ball||ballCooldown>0)return;
    ball={
        x:player.gx,y:player.gy,
        dx:player.dir.x||1,dy:player.dir.y||0,
        speed:8,
        bounces:0,
        maxBounces:3,
        life:4.0
    };
}

// ─── UPDATE ──────────────────────────────────────
function update(dt){
    gameTime+=dt;
    if(ballCooldown>0)ballCooldown-=dt;

    // Player movement
    var dx=0,dy=0;
    if(keys.left){dx=-1;dy=0;}
    else if(keys.right){dx=1;dy=0;}
    else if(keys.up){dx=0;dy=-1;}
    else if(keys.down){dx=0;dy=1;}

    if(dx!==0||dy!==0){
        player.dir={x:dx,y:dy};
        player.moveTimer+=dt;
        if(player.moveTimer>=1/player.speed){
            player.moveTimer=0;
            var nx=player.gx+dx;
            var ny=player.gy+dy;
            if(inBounds(nx,ny)&&!hasAppleAt(nx,ny)){
                // Dig through dirt
                if(grid[ny][nx]===2){
                    // Cherry!
                    cherriesCollected++;
                    score+=50;
                    var ox2=(W-COLS*cs)/2;
                    addParticles(ox2+nx*cs+cs/2,ny*cs+cs/2,'#ff4444',8);
                }
                grid[ny][nx]=0;
                player.gx=nx;
                player.gy=ny;
                player.animFrame++;

                // Check apple stability
                for(var i=0;i<apples.length;i++){
                    checkAppleFall(apples[i]);
                }
            }
        }
        // Smooth interpolation
        player.x+=(player.gx-player.x)*dt*12;
        player.y+=(player.gy-player.y)*dt*12;
    }else{
        player.moveTimer=0;
        player.x+=(player.gx-player.x)*dt*12;
        player.y+=(player.gy-player.y)*dt*12;
    }

    // Update bouncing ball
    if(ball){
        ball.life-=dt;
        ball.x+=ball.dx*ball.speed*dt;
        ball.y+=ball.dy*ball.speed*dt;

        var bGX=Math.round(ball.x);
        var bGY=Math.round(ball.y);

        // Bounce off walls/dirt
        if(!inBounds(bGX,bGY)||isDirt(bGX,bGY)){
            ball.dx=-ball.dx;
            ball.dy=-ball.dy;
            ball.bounces++;
            ball.x+=ball.dx*0.5;
            ball.y+=ball.dy*0.5;
        }

        // Hit monster
        for(var i=0;i<monsters.length;i++){
            var m=monsters[i];
            if(!m.alive)continue;
            if(Math.abs(ball.x-m.x)<0.8&&Math.abs(ball.y-m.y)<0.8){
                m.alive=false;
                score+=500;
                var ox3=(W-COLS*cs)/2;
                addParticles(ox3+m.x*cs+cs/2,m.y*cs+cs/2,'#ff8800',15);
                ball=null;
                ballCooldown=0.5;
                break;
            }
        }

        if(ball&&(ball.bounces>=ball.maxBounces||ball.life<=0)){
            ball=null;
            ballCooldown=0.5;
        }
    }

    // Update monsters
    for(var i=0;i<monsters.length;i++){
        var m2=monsters[i];
        if(!m2.alive)continue;
        if(m2.stunTimer>0){m2.stunTimer-=dt;continue;}

        m2.moveTimer+=dt;
        var mSpeed=m2.speed;
        if(m2.moveTimer>=1/mSpeed){
            m2.moveTimer=0;

            // Simple AI: move toward player through tunnels
            var bestDir=null,bestDist=9999;
            var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
            for(var d=0;d<dirs.length;d++){
                var mnx=m2.gx+dirs[d].x;
                var mny=m2.gy+dirs[d].y;
                if(!inBounds(mnx,mny))continue;

                // Digger type can dig through dirt
                if(m2.type==='digger'){
                    // Can go anywhere
                }else{
                    if(isDirt(mnx,mny))continue;
                }

                if(hasAppleAt(mnx,mny))continue;

                var dist=Math.abs(mnx-player.gx)+Math.abs(mny-player.gy);
                // Add randomness to avoid perfect pursuit
                dist+=Math.random()*4;
                if(dist<bestDist){
                    bestDist=dist;
                    bestDir=dirs[d];
                }
            }

            if(bestDir){
                var mnx2=m2.gx+bestDir.x;
                var mny2=m2.gy+bestDir.y;
                if(m2.type==='digger'&&isDirt(mnx2,mny2)){
                    grid[mny2][mnx2]=0; // Dig through
                }
                m2.gx=mnx2;
                m2.gy=mny2;
                m2.dir=bestDir;
            }
        }

        // Smooth interpolation
        m2.x+=(m2.gx-m2.x)*dt*8;
        m2.y+=(m2.gy-m2.y)*dt*8;

        // Collision with player
        if(Math.abs(m2.x-player.x)<0.7&&Math.abs(m2.y-player.y)<0.7){
            killPlayer();
            return;
        }
    }

    // Update apples
    for(var i=0;i<apples.length;i++){
        var ap=apples[i];
        if(ap.crushed)continue;

        if(ap.wobble>0){
            ap.wobble-=dt;
            if(ap.wobble<=0){
                startAppleFall(ap);
            }
        }

        if(ap.falling){
            ap.fallSpeed+=6*dt;
            ap.y+=ap.fallSpeed*dt;
            ap.gy=Math.floor(ap.y);

            // Check what's below
            var belowY=Math.ceil(ap.y);
            if(belowY>=ROWS){
                ap.crushed=true;continue;
            }

            // Crush monsters
            for(var m3=0;m3<monsters.length;m3++){
                if(!monsters[m3].alive)continue;
                if(Math.abs(ap.x-monsters[m3].x)<0.8&&Math.abs(ap.y-monsters[m3].y)<0.8){
                    monsters[m3].alive=false;
                    score+=1000;
                    var ox4=(W-COLS*cs)/2;
                    addParticles(ox4+monsters[m3].x*cs+cs/2,monsters[m3].y*cs+cs/2,'#ff4444',15);
                }
            }

            // Crush player
            if(Math.abs(ap.x-player.x)<0.7&&Math.abs(ap.y-player.y)<0.7){
                killPlayer();
                return;
            }

            // Hit ground
            if(belowY<ROWS&&isDirt(Math.round(ap.x),belowY)){
                ap.falling=false;
                ap.crushed=true;
                var ox5=(W-COLS*cs)/2;
                addParticles(ox5+ap.x*cs+cs/2,ap.y*cs+cs/2,'#ff8844',10);
            }
        }
    }

    // Check level completion
    var allMonstersGone=true;
    for(var i=0;i<monsters.length;i++){if(monsters[i].alive){allMonstersGone=false;break;}}

    if(allMonstersGone||cherriesCollected>=cherryTotal){
        score+=200;
        level++;
        generateLevel();
    }
}

function checkAppleFall(apple){
    if(apple.falling||apple.crushed)return;
    var belowY=apple.gy+1;
    if(belowY<ROWS&&isTunnel(apple.gx,belowY)){
        apple.wobble=0.4;
    }
}

function startAppleFall(apple){
    if(apple.falling||apple.crushed)return;
    var belowY=apple.gy+1;
    if(belowY<ROWS&&isTunnel(apple.gx,belowY)){
        apple.falling=true;
        apple.fallSpeed=0;
        grid[apple.gy][apple.gx]=0;
    }
}

function killPlayer(){
    lives--;
    var ox6=(W-COLS*cs)/2;
    addParticles(ox6+player.x*cs+cs/2,player.y*cs+cs/2,'#ff3355',20);
    if(lives<=0){gameState='gameover';return;}
    // Reset position
    player.gx=Math.floor(COLS/2);
    player.gy=SURFACE_ROWS;
    player.x=player.gx;player.y=player.gy;
    player.moveTimer=0;
    ball=null;ballCooldown=0.5;
}

// ─── RENDER ──────────────────────────────────────
function render(){
    ctx.fillStyle='#0a0a2a';ctx.fillRect(0,0,W,H);

    var ox=(W-COLS*cs)/2;

    // Draw dirt and tunnels
    for(var y=0;y<ROWS;y++){
        for(var x=0;x<COLS;x++){
            var cx2=ox+x*cs;
            var cy2=y*cs;

            if(y<SURFACE_ROWS){
                // Sky
                ctx.fillStyle='#338855';
                ctx.fillRect(cx2,cy2,cs,cs);
            }else if(grid[y][x]===0){
                // Tunnel (dark)
                ctx.fillStyle='#111122';
                ctx.fillRect(cx2,cy2,cs,cs);
            }else if(grid[y][x]===2){
                // Dirt with cherry
                var dLayer=Math.floor((y-SURFACE_ROWS)/(ROWS/3));
                ctx.fillStyle=DIRT_COLORS[Math.min(dLayer,2)];
                ctx.fillRect(cx2,cy2,cs,cs);
                // Cherry
                ctx.fillStyle='#ff2244';
                ctx.beginPath();ctx.arc(cx2+cs*0.35,cy2+cs*0.55,cs*0.18,0,Math.PI*2);ctx.fill();
                ctx.beginPath();ctx.arc(cx2+cs*0.6,cy2+cs*0.55,cs*0.18,0,Math.PI*2);ctx.fill();
                // Stem
                ctx.strokeStyle='#44aa22';ctx.lineWidth=1;
                ctx.beginPath();ctx.moveTo(cx2+cs*0.35,cy2+cs*0.35);
                ctx.quadraticCurveTo(cx2+cs*0.5,cy2+cs*0.1,cx2+cs*0.6,cy2+cs*0.35);
                ctx.stroke();
            }else{
                // Dirt
                var dLayer2=Math.floor((y-SURFACE_ROWS)/(ROWS/3));
                ctx.fillStyle=DIRT_COLORS[Math.min(dLayer2,2)];
                ctx.fillRect(cx2,cy2,cs,cs);
                // Dirt texture
                ctx.fillStyle='rgba(0,0,0,0.05)';
                for(var dp=0;dp<3;dp++){
                    ctx.fillRect(cx2+Math.sin(x*7+dp*3)*cs*0.3+cs*0.2,
                                 cy2+Math.cos(y*5+dp*2)*cs*0.3+cs*0.2,
                                 cs*0.15,cs*0.15);
                }
            }
        }
    }

    // Grid lines (subtle)
    ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=0.5;
    for(var x=0;x<=COLS;x++){
        ctx.beginPath();ctx.moveTo(ox+x*cs,0);ctx.lineTo(ox+x*cs,ROWS*cs);ctx.stroke();
    }
    for(var y=0;y<=ROWS;y++){
        ctx.beginPath();ctx.moveTo(ox,y*cs);ctx.lineTo(ox+COLS*cs,y*cs);ctx.stroke();
    }

    // Draw apples
    for(var i=0;i<apples.length;i++){
        var ap=apples[i];
        if(ap.crushed)continue;
        var ax2=ox+ap.x*cs+cs/2;
        var ay2=ap.y*cs+cs/2;

        // Wobble effect
        var wobbleOff=0;
        if(ap.wobble>0)wobbleOff=Math.sin(gameTime*20)*3;

        ctx.save();
        ctx.translate(ax2+wobbleOff,ay2);

        // Apple body
        var apGrad=ctx.createRadialGradient(-2,-2,0,0,0,cs*0.35);
        apGrad.addColorStop(0,'#ff6644');apGrad.addColorStop(1,'#cc2211');
        ctx.fillStyle=apGrad;
        ctx.beginPath();ctx.arc(0,0,cs*0.35,0,Math.PI*2);ctx.fill();

        // Leaf
        ctx.fillStyle='#44aa22';
        ctx.beginPath();
        ctx.ellipse(2,-cs*0.35,cs*0.1,cs*0.06,0.3,0,Math.PI*2);
        ctx.fill();

        // Stem
        ctx.strokeStyle='#664422';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(0,-cs*0.25);ctx.lineTo(0,-cs*0.38);ctx.stroke();

        ctx.restore();
    }

    // Draw monsters
    for(var i=0;i<monsters.length;i++){
        var m=monsters[i];
        if(!m.alive)continue;
        var mx2=ox+m.x*cs+cs/2;
        var my2=m.y*cs+cs/2;

        ctx.save();
        ctx.translate(mx2,my2);

        if(m.stunTimer>0){
            ctx.globalAlpha=0.5+Math.sin(gameTime*15)*0.3;
        }

        // Body
        var mColor=m.type==='alpha'?'#ff4466':m.type==='muncher'?'#4466ff':'#ff8844';
        ctx.fillStyle=mColor;
        ctx.beginPath();ctx.arc(0,0,cs*0.35,0,Math.PI*2);ctx.fill();

        // Eyes
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(-cs*0.12,-cs*0.08,cs*0.12,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(cs*0.12,-cs*0.08,cs*0.12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#000';
        ctx.beginPath();ctx.arc(-cs*0.1+m.dir.x*2,-cs*0.08+m.dir.y*2,cs*0.06,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(cs*0.1+m.dir.x*2,-cs*0.08+m.dir.y*2,cs*0.06,0,Math.PI*2);ctx.fill();

        // Mouth
        ctx.strokeStyle='#000';ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.arc(0,cs*0.08,cs*0.12,0.1,Math.PI-0.1);
        ctx.stroke();

        // Type indicator (alpha has crown, digger has pickaxe)
        if(m.type==='alpha'){
            ctx.fillStyle='#ffcc00';
            ctx.beginPath();
            ctx.moveTo(-cs*0.15,-cs*0.35);ctx.lineTo(-cs*0.05,-cs*0.25);
            ctx.lineTo(0,-cs*0.4);ctx.lineTo(cs*0.05,-cs*0.25);
            ctx.lineTo(cs*0.15,-cs*0.35);ctx.lineTo(cs*0.15,-cs*0.25);
            ctx.lineTo(-cs*0.15,-cs*0.25);
            ctx.closePath();ctx.fill();
        }

        ctx.globalAlpha=1;
        ctx.restore();
    }

    // Draw bouncing ball
    if(ball){
        var bx=ox+ball.x*cs+cs/2;
        var by=ball.y*cs+cs/2;
        ctx.save();
        ctx.shadowColor='#ffcc00';ctx.shadowBlur=10;
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();ctx.arc(bx,by,cs*0.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ffffff';
        ctx.beginPath();ctx.arc(bx-2,by-2,cs*0.08,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        ctx.restore();
    }

    // Draw player (Mr. Do!)
    var px=ox+player.x*cs+cs/2;
    var py=player.y*cs+cs/2;

    ctx.save();
    ctx.translate(px,py);

    // Clown suit body
    ctx.fillStyle='#ff4444';
    ctx.beginPath();ctx.arc(0,cs*0.05,cs*0.3,0,Math.PI*2);ctx.fill();

    // Head
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(0,-cs*0.2,cs*0.22,0,Math.PI*2);ctx.fill();

    // Hat (red with pom-pom)
    ctx.fillStyle='#ff2222';
    ctx.beginPath();
    ctx.moveTo(-cs*0.2,-cs*0.3);
    ctx.lineTo(0,-cs*0.5);
    ctx.lineTo(cs*0.2,-cs*0.3);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(0,-cs*0.5,cs*0.06,0,Math.PI*2);ctx.fill();

    // Eyes
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(-cs*0.08,-cs*0.22,cs*0.04,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cs*0.08,-cs*0.22,cs*0.04,0,Math.PI*2);ctx.fill();

    // Smile
    ctx.strokeStyle='#cc4444';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(0,-cs*0.15,cs*0.08,0.2,Math.PI-0.2);ctx.stroke();

    // Ball in hand indicator
    if(!ball&&ballCooldown<=0){
        ctx.fillStyle='#ffcc00';
        ctx.beginPath();ctx.arc(cs*0.3*player.dir.x,0,cs*0.1,0,Math.PI*2);ctx.fill();
    }

    ctx.restore();

    // Cherry counter
    ctx.fillStyle='#ff4444';ctx.font='bold '+Math.max(10,Math.floor(cs*0.5))+'px "Courier New",monospace';
    ctx.textAlign='left';
    ctx.fillText('\u2665 '+cherriesCollected+'/'+cherryTotal,ox+5,ROWS*cs+cs*0.7);

    drawParticles();
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    ctx.fillStyle='#0a0a2a';ctx.fillRect(0,0,W,H);

    // Colorful dirt bg
    for(var y=0;y<8;y++){
        for(var x=0;x<12;x++){
            var bcs=W/12;
            var shade=(x+y)%3;
            ctx.fillStyle=DIRT_COLORS[shade];
            ctx.globalAlpha=0.15;
            ctx.fillRect(x*bcs,H*0.4+y*bcs*0.5,bcs,bcs*0.5);
        }
    }
    ctx.globalAlpha=1;

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#ff4444';ctx.shadowBlur=30;
    var ts=Math.round(W*0.08);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.20*(1-scale));
    ctx.fillStyle='#ff4444';ctx.fillText('MR. DO!',W/2,H*0.20);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    var fs=Math.round(W*0.02);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ff8844';ctx.fillText('Dig tunnels and collect cherries',W/2,H*0.35);
    ctx.fillStyle='#ffcc00';ctx.fillText('Throw your bouncing ball to defeat monsters',W/2,H*0.41);
    ctx.fillStyle='#66ff66';ctx.fillText('Drop apples on enemies to crush them',W/2,H*0.47);

    // Animated Mr. Do
    var doX=W/2+Math.sin(titlePulse*2)*30;
    var doY=H*0.60;
    ctx.fillStyle='#ff4444';
    ctx.beginPath();ctx.arc(doX,doY,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffcc88';
    ctx.beginPath();ctx.arc(doX,doY-10,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff2222';
    ctx.beginPath();ctx.moveTo(doX-8,doY-14);ctx.lineTo(doX,doY-24);ctx.lineTo(doX+8,doY-14);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(doX,doY-24,3,0,Math.PI*2);ctx.fill();

    // Cherry
    ctx.fillStyle='#ff2244';
    ctx.beginPath();ctx.arc(doX+30,doY,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(doX+38,doY,5,0,Math.PI*2);ctx.fill();

    // Ball
    var ballPulse=0.5+0.5*Math.sin(titlePulse*4);
    ctx.fillStyle='rgba(255,204,0,'+ballPulse+')';
    ctx.beginPath();ctx.arc(doX-30,doY,6,0,Math.PI*2);ctx.fill();

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move, SPACE to throw ball',W/2,H*0.74);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.88);
    ctx.restore();
}

function drawGameOver(){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';
    ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';ctx.fillText('GAME OVER',W/2,H*0.25);
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffcc00';ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
    ctx.fillText('Level reached: '+level,W/2,H*0.52);
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO PLAY AGAIN',W/2,H*0.75);
    ctx.restore();
}

function updateHUD(){
    var el=document.getElementById('hud-score');if(el)el.textContent=score;
    var el2=document.getElementById('hud-speed');if(el2)el2.textContent='LVL '+level;
    var el3=document.getElementById('hud-time');if(el3)el3.textContent=lives+' HP';
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;
    keys={};
    generateLevel();
    gameState='playing';
}

// ─── GAME LOOP ───────────────────────────────────
var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){update(dt);updateParticles(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;updateParticles(dt);drawGameOver();}

    animId=requestAnimationFrame(gameLoop);
}

// ─── INPUT ───────────────────────────────────────
function onKey(e,down){
    if(gameState==='playing'){
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keys.left=down;if(down)keys.right=false;}
        if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keys.right=down;if(down)keys.left=false;}
        if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){keys.up=down;if(down)keys.down=false;}
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keys.down=down;if(down)keys.up=false;}
        if(e.key===' '&&down)fireBall();
    }
    if((e.key==='Enter'||e.key==='Tab')&&down&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn){
    var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
    el.addEventListener('mousedown',function(){fn();});
}

window.initMrDo=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    bindMobile('btn-left',function(){keys={left:true};player.dir={x:-1,y:0};});
    bindMobile('btn-right',function(){keys={right:true};player.dir={x:1,y:0};});
    bindMobile('btn-up',function(){keys={up:true};player.dir={x:0,y:-1};});
    bindMobile('btn-down',function(){keys={down:true};player.dir={x:0,y:1};});
    canvas.addEventListener('click',function(){
        if(gameState==='playing'){fireBall();}
        else{resetGame();}
    });
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopMrDo=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';
    keys={};
};
})();
