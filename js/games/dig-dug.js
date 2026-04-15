// Dig Dug — Full Game
(function(){
// roundRect polyfill
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var COLS=14,ROWS=16,cs; // cell size
var SURFACE_ROWS=2; // top rows are surface (sky + grass)
var grid=[]; // 0=empty/tunnel, 1=dirt layer1, 2=dirt layer2, 3=dirt layer3, 4=dirt layer4
var player,enemies=[],rocks=[],particles=[],harpoon=null;
var keys={};
var pumpRange=4; // generous pump range for easy mode
var ENEMY_COUNT_BASE=3;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15); }
var DIRT_COLORS=['#d2b48c','#cc8844','#993322','#552211']; // tan, orange, red-brown, dark brown
var SURFACE_COLOR='#55bbff'; // sky blue
var GRASS_COLOR='#44aa44';
var FLOWER_POSITIONS=[]; // decorative flowers on surface

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    cs=Math.floor(Math.min(W/COLS,(H-10)/ROWS));
}

function getLayerForRow(row){
    // Surface rows have no dirt
    if(row<SURFACE_ROWS)return 0;
    var dirtRow=row-SURFACE_ROWS;
    var dirtRows=ROWS-SURFACE_ROWS;
    if(dirtRow<dirtRows*0.25)return 1;
    if(dirtRow<dirtRows*0.5)return 2;
    if(dirtRow<dirtRows*0.75)return 3;
    return 4;
}

function getDirtColor(layer){
    if(layer<=0)return null;
    return DIRT_COLORS[layer-1];
}

function getScoreForRow(row){
    var layer=getLayerForRow(row);
    if(layer<=1)return 200;
    if(layer===2)return 300;
    if(layer===3)return 400;
    return 500;
}

function generateLevel(){
    grid=[];
    for(var y=0;y<ROWS;y++){
        grid[y]=[];
        for(var x=0;x<COLS;x++){
            grid[y][x]=getLayerForRow(y);
        }
    }
    // Carve initial tunnel for player at surface level
    var startX=Math.floor(COLS/2);
    grid[SURFACE_ROWS][startX]=0;
    grid[SURFACE_ROWS+1][startX]=0;

    // Place flowers on surface
    FLOWER_POSITIONS=[];
    for(var x=0;x<COLS;x++){
        if(Math.random()<0.35){
            FLOWER_POSITIONS.push({x:x,color:['#ff4466','#ffcc00','#ff66aa','#ffffff','#ff8800'][Math.floor(Math.random()*5)]});
        }
    }

    // Place player
    player={
        gx:startX,gy:SURFACE_ROWS,
        x:startX,y:SURFACE_ROWS,
        dir:{x:0,y:1},
        moveTimer:0,
        speed:4.5, // cells per second
        pumping:false,
        pumpCooldown:0,
        animFrame:0
    };

    // Place enemies
    enemies=[];
    var enemyCount=ENEMY_COUNT_BASE+Math.floor((level-1)*0.5);
    if(enemyCount>8)enemyCount=8;
    for(var i=0;i<enemyCount;i++){
        var ex,ey,valid;
        var attempts=0;
        do{
            ex=1+Math.floor(Math.random()*(COLS-2));
            ey=SURFACE_ROWS+3+Math.floor(Math.random()*(ROWS-SURFACE_ROWS-4));
            valid=true;
            // Not too close to player
            if(Math.abs(ex-player.gx)+Math.abs(ey-player.gy)<5)valid=false;
            // Not overlapping another enemy
            for(var j=0;j<enemies.length;j++){
                if(enemies[j].gx===ex&&enemies[j].gy===ey){valid=false;break;}
            }
            attempts++;
        }while(!valid&&attempts<100);

        var type=i<Math.ceil(enemyCount*0.6)?'pooka':'fygar';
        enemies.push({
            gx:ex,gy:ey,
            x:ex,y:ey,
            dir:{x:[-1,1][Math.floor(Math.random()*2)],y:0},
            moveTimer:0,
            speed:1.2+level*0.08, // slow enemies for easy mode
            type:type,
            alive:true,
            pumpCount:0, // 0-3, 3 = popped
            pumpTimer:0, // deflate timer
            inflateSize:0, // visual inflation 0-1
            ghosting:false,
            ghostTimer:0,
            ghostTarget:null,
            fireTimer:0,
            fireActive:false,
            fireDuration:0,
            stunTimer:0
        });
        // Carve a small pocket around each enemy
        grid[ey][ex]=0;
        if(ex>0)grid[ey][ex-1]=0;
        if(ex<COLS-1)grid[ey][ex+1]=0;
    }

    // Place rocks (2-4 per level)
    rocks=[];
    var rockCount=2+Math.floor(Math.random()*2);
    for(var i=0;i<rockCount;i++){
        var rx,ry,rvalid;
        var rattempts=0;
        do{
            rx=1+Math.floor(Math.random()*(COLS-2));
            ry=SURFACE_ROWS+1+Math.floor(Math.random()*Math.floor((ROWS-SURFACE_ROWS)/2));
            rvalid=grid[ry][rx]>0; // must be in dirt
            if(rx===player.gx&&ry===player.gy)rvalid=false;
            for(var j=0;j<rocks.length;j++){
                if(rocks[j].gx===rx&&rocks[j].gy===ry){rvalid=false;break;}
            }
            rattempts++;
        }while(!rvalid&&rattempts<80);
        if(rvalid){
            rocks.push({
                gx:rx,gy:ry,
                x:rx,y:ry,
                falling:false,
                fallSpeed:0,
                settled:false,
                settleTimer:0,
                wobble:0,
                crushed:false
            });
        }
    }

    harpoon=null;
    particles=[];
}

function addParticles(px,py,color,count){
    var ox=(W-COLS*cs)/2;
    for(var i=0;i<count;i++){
        particles.push({
            x:ox+px*cs+cs/2,
            y:py*cs+cs/2,
            vx:(Math.random()-0.5)*150,
            vy:(Math.random()-0.5)*150,
            life:0.3+Math.random()*0.4,
            color:color,
            size:2+Math.random()*4
        });
    }
}

function isDirt(gx,gy){
    if(gx<0||gx>=COLS||gy<0||gy>=ROWS)return false;
    return grid[gy][gx]>0;
}

function isTunnel(gx,gy){
    if(gx<0||gx>=COLS||gy<0||gy>=ROWS)return false;
    return grid[gy][gx]===0;
}

function isInBounds(gx,gy){
    return gx>=0&&gx<COLS&&gy>=0&&gy<ROWS;
}

function hasRockAt(gx,gy){
    for(var i=0;i<rocks.length;i++){
        if(!rocks[i].crushed&&rocks[i].gx===gx&&rocks[i].gy===gy)return true;
    }
    return false;
}

function canMove(gx,gy){
    if(!isInBounds(gx,gy))return false;
    if(hasRockAt(gx,gy))return false;
    return true; // player can dig through dirt
}

function canEnemyMove(gx,gy){
    if(!isInBounds(gx,gy))return false;
    if(hasRockAt(gx,gy))return false;
    return isTunnel(gx,gy);
}

function checkRockFall(rock){
    if(rock.falling||rock.crushed||rock.settled)return;
    // A rock falls if the 2 cells below it are dug out (tunnel)
    var below1=rock.gy+1;
    var below2=rock.gy+2;
    // Need at least one cell below to be empty
    if(below1<ROWS&&isTunnel(rock.gx,below1)){
        rock.wobble=0.5; // wobble before falling
    }
}

function startRockFall(rock){
    if(rock.falling||rock.crushed||rock.settled)return;
    var below=rock.gy+1;
    if(below<ROWS&&isTunnel(rock.gx,below)){
        rock.falling=true;
        rock.fallSpeed=0;
        // Remove from grid dirt if it was in dirt
        grid[rock.gy][rock.gx]=0;
    }
}

function firePump(){
    if(harpoon)return;
    if(player.pumpCooldown>0)return;
    harpoon={
        x:player.gx,y:player.gy,
        dir:{x:player.dir.x,y:player.dir.y},
        length:0,
        maxLength:pumpRange,
        extending:true,
        retracting:false,
        speed:16, // cells per second
        hitEnemy:null
    };
    // If direction is zero, default to right
    if(harpoon.dir.x===0&&harpoon.dir.y===0){
        harpoon.dir={x:1,y:0};
    }
    player.pumping=true;
}

function updateHarpoon(dt){
    if(!harpoon)return;
    if(harpoon.hitEnemy){
        // Pump the enemy
        var e=harpoon.hitEnemy;
        if(e.alive&&e.pumpCount<3){
            e.pumpCount++;
            e.pumpTimer=1.5; // time before deflation
            e.inflateSize=e.pumpCount/3;
            if(e.pumpCount>=3){
                // Enemy popped!
                e.alive=false;
                score+=getScoreForRow(e.gy);
                addParticles(e.gx,e.gy,e.type==='pooka'?'#ff4444':'#44cc44',15);
            }
        }
        harpoon=null;
        player.pumping=false;
        player.pumpCooldown=0.25;
        return;
    }
    if(harpoon.extending){
        harpoon.length+=harpoon.speed*dt;
        // Check if hit enemy along the path
        var tipX=player.gx+harpoon.dir.x*harpoon.length;
        var tipY=player.gy+harpoon.dir.y*harpoon.length;
        for(var i=0;i<enemies.length;i++){
            var e=enemies[i];
            if(!e.alive)continue;
            // Check each integer cell along harpoon path
            var checkDist=Math.ceil(harpoon.length);
            for(var d=1;d<=checkDist&&d<=harpoon.maxLength;d++){
                var cx=player.gx+harpoon.dir.x*d;
                var cy=player.gy+harpoon.dir.y*d;
                if(cx===e.gx&&cy===e.gy){
                    harpoon.hitEnemy=e;
                    e.stunTimer=0.3;
                    return;
                }
            }
        }
        // Check if hit dirt wall
        var frontX=player.gx+harpoon.dir.x*Math.ceil(harpoon.length);
        var frontY=player.gy+harpoon.dir.y*Math.ceil(harpoon.length);
        if(!isInBounds(frontX,frontY)||isDirt(frontX,frontY)){
            harpoon.extending=false;
            harpoon.retracting=true;
        }
        if(harpoon.length>=harpoon.maxLength){
            harpoon.extending=false;
            harpoon.retracting=true;
        }
    }
    if(harpoon.retracting){
        harpoon.length-=harpoon.speed*1.5*dt;
        if(harpoon.length<=0){
            harpoon=null;
            player.pumping=false;
            player.pumpCooldown=0.25;
        }
    }
}

function updatePlayer(dt){
    if(player.pumpCooldown>0)player.pumpCooldown-=dt;
    player.animFrame+=dt*8;

    if(player.pumping)return; // can't move while pumping

    player.moveTimer+=dt;
    var interval=1/player.speed;
    if(player.moveTimer>=interval){
        player.moveTimer=0;
        var dx=0,dy=0;
        if(keys.left)dx=-1;
        else if(keys.right)dx=1;
        else if(keys.up)dy=-1;
        else if(keys.down)dy=1;
        if(dx!==0||dy!==0){
            var nx=player.gx+dx;
            var ny=player.gy+dy;
            if(canMove(nx,ny)){
                player.dir={x:dx,y:dy};
                player.gx=nx;
                player.gy=ny;
                // Dig the tunnel
                if(grid[ny][nx]>0){
                    grid[ny][nx]=0;
                }
            }else if(isInBounds(nx,ny)){
                player.dir={x:dx,y:dy};
            }
        }
    }
    // Smooth visual interpolation
    player.x+=(player.gx-player.x)*Math.min(1,dt*14);
    player.y+=(player.gy-player.y)*Math.min(1,dt*14);
}

function updateEnemies(dt){
    for(var i=0;i<enemies.length;i++){
        var e=enemies[i];
        if(!e.alive)continue;

        // Pump deflation timer
        if(e.pumpCount>0&&e.pumpTimer>0){
            e.pumpTimer-=dt;
            if(e.pumpTimer<=0){
                e.pumpCount--;
                e.inflateSize=e.pumpCount/3;
                if(e.pumpCount>0)e.pumpTimer=2.0;
            }
        }

        // Stun from harpoon hit
        if(e.stunTimer>0){e.stunTimer-=dt;continue;}

        // If pumped, don't move
        if(e.pumpCount>0)continue;

        // Fygar fire breath
        if(e.type==='fygar'&&!e.ghosting){
            e.fireTimer+=dt;
            if(e.fireActive){
                e.fireDuration-=dt;
                if(e.fireDuration<=0){
                    e.fireActive=false;
                    e.fireTimer=0;
                }
                // Check if fire hits player
                var fireLen=3;
                for(var f=1;f<=fireLen;f++){
                    var fx=e.gx+e.dir.x*f;
                    var fy=e.gy+e.dir.y*f;
                    if(isDirt(fx,fy))break;
                    if(fx===player.gx&&fy===player.gy){
                        killPlayer();
                        return;
                    }
                }
            }else if(e.fireTimer>4+Math.random()*3){
                // Only fire horizontally
                if(e.dir.y===0){
                    e.fireActive=true;
                    e.fireDuration=0.8;
                }
                e.fireTimer=0;
            }
        }

        // Ghosting logic: occasionally phase through dirt
        if(e.ghosting){
            e.ghostTimer-=dt;
            if(e.ghostTarget){
                // Move toward ghost target
                e.moveTimer+=dt;
                var gInterval=1/(e.speed*0.5); // slower when ghosting
                if(e.moveTimer>=gInterval){
                    e.moveTimer=0;
                    var gdx=e.ghostTarget.x>e.gx?1:(e.ghostTarget.x<e.gx?-1:0);
                    var gdy=e.ghostTarget.y>e.gy?1:(e.ghostTarget.y<e.gy?-1:0);
                    // Prefer one axis
                    if(gdx!==0&&gdy!==0){
                        if(Math.random()<0.5)gdy=0;else gdx=0;
                    }
                    var ngx=e.gx+gdx;
                    var ngy=e.gy+gdy;
                    if(isInBounds(ngx,ngy)&&!hasRockAt(ngx,ngy)){
                        e.gx=ngx;e.gy=ngy;
                        if(gdx!==0)e.dir={x:gdx,y:0};
                        else if(gdy!==0)e.dir={x:0,y:gdy};
                        // Dig as ghost passes
                        if(grid[ngy][ngx]>0)grid[ngy][ngx]=0;
                    }
                }
                // Arrived at target or in a tunnel
                if((e.gx===e.ghostTarget.x&&e.gy===e.ghostTarget.y)||isTunnel(e.gx,e.gy)){
                    if(e.ghostTimer<=0||isTunnel(e.gx,e.gy)){
                        e.ghosting=false;
                        e.ghostTarget=null;
                    }
                }
            }
            if(e.ghostTimer<=0){
                e.ghosting=false;
                e.ghostTarget=null;
            }
        }else{
            // Normal tunnel movement
            e.moveTimer+=dt;
            var eInterval=1/e.speed;
            if(e.moveTimer>=eInterval){
                e.moveTimer=0;

                // Try to move toward player through tunnels
                var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
                var bestDir=null,bestDist=Infinity;
                var reverse={x:-e.dir.x,y:-e.dir.y};

                for(var d=0;d<dirs.length;d++){
                    var dd=dirs[d];
                    var nnx=e.gx+dd.x;
                    var nny=e.gy+dd.y;
                    // Avoid reversing unless stuck
                    if(dd.x===reverse.x&&dd.y===reverse.y)continue;
                    if(!canEnemyMove(nnx,nny))continue;
                    var dist=Math.abs(nnx-player.gx)+Math.abs(nny-player.gy);
                    if(dist<bestDist){bestDist=dist;bestDir=dd;}
                }
                // If stuck, allow reverse
                if(!bestDir){
                    var rx=e.gx+reverse.x;
                    var ry=e.gy+reverse.y;
                    if(canEnemyMove(rx,ry))bestDir=reverse;
                }
                if(bestDir){
                    e.gx+=bestDir.x;
                    e.gy+=bestDir.y;
                    e.dir=bestDir;
                }else{
                    // Can't move at all in tunnels, start ghosting toward player
                    e.ghosting=true;
                    e.ghostTimer=3+Math.random()*2;
                    e.ghostTarget={x:player.gx,y:player.gy};
                }

                // Random chance to start ghosting (slow, easy mode)
                if(!e.ghosting&&Math.random()<0.01){
                    e.ghosting=true;
                    e.ghostTimer=2+Math.random()*2;
                    e.ghostTarget={x:player.gx,y:player.gy};
                }
            }
        }

        // Smooth interpolation
        e.x+=(e.gx-e.x)*Math.min(1,dt*12);
        e.y+=(e.gy-e.y)*Math.min(1,dt*12);

        // Collision with player
        if(Math.abs(e.gx-player.gx)+Math.abs(e.gy-player.gy)<1&&e.pumpCount===0){
            killPlayer();
            return;
        }
    }
}

function killPlayer(){
    lives--;
    addParticles(player.gx,player.gy,'#6688ff',20);
    if(lives<=0){
        gameState='gameover';
    }else{
        // Respawn
        player.gx=Math.floor(COLS/2);
        player.gy=SURFACE_ROWS;
        player.x=player.gx;
        player.y=player.gy;
        player.dir={x:0,y:1};
        player.pumping=false;
        player.pumpCooldown=0;
        harpoon=null;
        // Push enemies away from spawn
        for(var i=0;i<enemies.length;i++){
            if(Math.abs(enemies[i].gx-player.gx)+Math.abs(enemies[i].gy-player.gy)<3){
                enemies[i].gx=Math.max(1,Math.min(COLS-2,enemies[i].gx+(enemies[i].gx>player.gx?2:-2)));
                enemies[i].x=enemies[i].gx;
            }
        }
    }
}

function updateRocks(dt){
    for(var i=0;i<rocks.length;i++){
        var r=rocks[i];
        if(r.crushed)continue;

        if(!r.falling&&!r.settled){
            // Check if should wobble/fall
            var below=r.gy+1;
            if(below<ROWS&&isTunnel(r.gx,below)){
                if(r.wobble<=0){
                    r.wobble=0.6; // start wobbling
                }
                r.wobble-=dt;
                if(r.wobble<=0){
                    startRockFall(r);
                }
            }
        }

        if(r.falling){
            r.fallSpeed+=dt*18; // gravity
            r.y+=r.fallSpeed*dt;
            var nextGy=Math.floor(r.y+0.5);

            // Check what's below
            if(nextGy>=ROWS-1||isDirt(r.gx,nextGy+1)||hasRockAt(r.gx,nextGy+1)){
                // Stop falling
                r.falling=false;
                r.settled=true;
                r.gy=nextGy;
                r.y=nextGy;
                r.settleTimer=2;
                addParticles(r.gx,r.gy,'#888888',8);
            }else{
                r.gy=nextGy;
                // Dig through
                if(isInBounds(r.gx,nextGy))grid[nextGy][r.gx]=0;
            }

            // Check if rock hits enemy
            for(var j=0;j<enemies.length;j++){
                var e=enemies[j];
                if(!e.alive)continue;
                if(e.gx===r.gx&&Math.abs(e.gy-r.y)<1.2){
                    e.alive=false;
                    score+=1000; // rock kill bonus
                    addParticles(e.gx,e.gy,e.type==='pooka'?'#ff4444':'#44cc44',20);
                }
            }

            // Check if rock hits player
            if(r.gx===player.gx&&Math.abs(player.gy-r.y)<1){
                killPlayer();
            }
        }

        if(r.settled){
            r.settleTimer-=dt;
            if(r.settleTimer<=0){
                r.crushed=true;
                addParticles(r.gx,r.gy,'#666666',10);
            }
        }

        // Smooth interpolation for x
        r.x+=(r.gx-r.x)*Math.min(1,dt*14);
        if(!r.falling)r.y+=(r.gy-r.y)*Math.min(1,dt*14);
    }
}

function updateParticles(dt){
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.vy+=200*dt; // gravity on particles
        p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
    }
}

function checkLevelClear(){
    var alive=0;
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].alive)alive++;
    }
    if(alive===0){
        level++;
        generateLevel();
    }
}

function update(dt){
    if(dt>0.1)dt=0.1;
    gameTime+=dt;
    updatePlayer(dt);
    updateHarpoon(dt);
    updateEnemies(dt);
    updateRocks(dt);
    updateParticles(dt);
    checkLevelClear();
}

// ─── RENDERING ────────────────────────────────────

function render(){
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    var ox=(W-COLS*cs)/2;
    var oy=0;

    // Draw surface sky
    for(var y=0;y<SURFACE_ROWS;y++){
        ctx.fillStyle=y===0?SURFACE_COLOR:'#44aa44';
        ctx.fillRect(ox,oy+y*cs,COLS*cs,cs);
    }

    // Draw grass detail on row 1 (grass row)
    if(SURFACE_ROWS>=2){
        var grassY=oy+(SURFACE_ROWS-1)*cs;
        ctx.fillStyle='#55bb55';
        for(var x=0;x<COLS;x++){
            for(var g=0;g<3;g++){
                var gx2=ox+x*cs+cs*0.1+g*cs*0.3;
                var gy2=grassY+cs*0.2;
                ctx.fillStyle='#33aa33';
                ctx.beginPath();
                ctx.moveTo(gx2,gy2+cs*0.6);
                ctx.lineTo(gx2+cs*0.05,gy2);
                ctx.lineTo(gx2+cs*0.1,gy2+cs*0.6);
                ctx.fill();
            }
        }
        // Draw flowers
        for(var f=0;f<FLOWER_POSITIONS.length;f++){
            var fl=FLOWER_POSITIONS[f];
            var fx=ox+fl.x*cs+cs*0.5;
            var fy=grassY+cs*0.3;
            // Stem
            ctx.strokeStyle='#228822';
            ctx.lineWidth=Math.max(1,cs*0.04);
            ctx.beginPath();
            ctx.moveTo(fx,fy+cs*0.5);
            ctx.lineTo(fx,fy);
            ctx.stroke();
            // Petals
            ctx.fillStyle=fl.color;
            ctx.beginPath();
            ctx.arc(fx,fy,cs*0.1,0,Math.PI*2);
            ctx.fill();
            // Center
            ctx.fillStyle='#ffff00';
            ctx.beginPath();
            ctx.arc(fx,fy,cs*0.04,0,Math.PI*2);
            ctx.fill();
        }
    }

    // Draw dirt layers
    for(var y=SURFACE_ROWS;y<ROWS;y++){
        for(var x=0;x<COLS;x++){
            if(grid[y][x]>0){
                var dcolor=getDirtColor(grid[y][x]);
                ctx.fillStyle=dcolor;
                ctx.fillRect(ox+x*cs,oy+y*cs,cs,cs);
                // Dirt texture: subtle dots
                ctx.fillStyle='rgba(255,255,255,0.06)';
                var seed=(x*31+y*17)%7;
                for(var dot=0;dot<3;dot++){
                    var dotx=ox+x*cs+((seed+dot*23)%10)*cs*0.1;
                    var doty=oy+y*cs+((seed+dot*37)%10)*cs*0.1;
                    ctx.fillRect(dotx,doty,cs*0.08,cs*0.08);
                }
                // Layer border hint
                ctx.fillStyle='rgba(0,0,0,0.08)';
                ctx.fillRect(ox+x*cs,oy+y*cs,cs,1);
            }else{
                // Tunnel - dark background
                ctx.fillStyle='#1a1008';
                ctx.fillRect(ox+x*cs,oy+y*cs,cs,cs);
            }
        }
    }

    // Draw rocks
    for(var i=0;i<rocks.length;i++){
        var r=rocks[i];
        if(r.crushed)continue;
        var rx=ox+r.x*cs;
        var ry=oy+r.y*cs;
        // Wobble effect
        var wobbleOff=0;
        if(r.wobble>0&&!r.falling){
            wobbleOff=Math.sin(gameTime*30)*cs*0.05;
        }
        ctx.fillStyle='#888888';
        ctx.beginPath();
        ctx.roundRect(rx+cs*0.05+wobbleOff,ry+cs*0.05,cs*0.9,cs*0.9,cs*0.12);
        ctx.fill();
        // Rock shading
        ctx.fillStyle='rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(rx+cs*0.1+wobbleOff,ry+cs*0.1,cs*0.5,cs*0.35,cs*0.08);
        ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.roundRect(rx+cs*0.15+wobbleOff,ry+cs*0.55,cs*0.65,cs*0.3,cs*0.08);
        ctx.fill();
        // Cracks
        ctx.strokeStyle='rgba(0,0,0,0.3)';
        ctx.lineWidth=Math.max(1,cs*0.03);
        ctx.beginPath();
        ctx.moveTo(rx+cs*0.3+wobbleOff,ry+cs*0.3);
        ctx.lineTo(rx+cs*0.5+wobbleOff,ry+cs*0.5);
        ctx.lineTo(rx+cs*0.7+wobbleOff,ry+cs*0.4);
        ctx.stroke();
    }

    // Draw enemies
    for(var i=0;i<enemies.length;i++){
        var e=enemies[i];
        if(!e.alive)continue;
        var ex=ox+e.x*cs+cs/2;
        var ey2=oy+e.y*cs+cs/2;
        var er=cs*0.4*(1+e.inflateSize*0.5);

        if(e.type==='pooka'){
            drawPooka(ex,ey2,er,e);
        }else{
            drawFygar(ex,ey2,er,e);
        }
    }

    // Draw harpoon
    if(harpoon){
        var hx=ox+player.x*cs+cs/2;
        var hy=oy+player.y*cs+cs/2;
        var tipX=hx+harpoon.dir.x*harpoon.length*cs;
        var tipY=hy+harpoon.dir.y*harpoon.length*cs;
        ctx.strokeStyle='#ffffff';
        ctx.lineWidth=Math.max(2,cs*0.08);
        ctx.beginPath();
        ctx.moveTo(hx,hy);
        ctx.lineTo(tipX,tipY);
        ctx.stroke();
        // Harpoon tip
        ctx.fillStyle='#ff6644';
        ctx.beginPath();
        ctx.arc(tipX,tipY,cs*0.1,0,Math.PI*2);
        ctx.fill();
    }

    // Draw Fygar fire
    for(var i=0;i<enemies.length;i++){
        var e=enemies[i];
        if(!e.alive||e.type!=='fygar'||!e.fireActive)continue;
        drawFygarFire(ox,oy,e);
    }

    // Draw player
    drawPlayer(ox,oy);

    // Draw particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life*2.5);
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;

    // Lives indicator
    for(var i=0;i<lives;i++){
        var lx=ox+10+i*Math.max(16,cs*0.7);
        var ly=H-Math.max(14,cs*0.5);
        ctx.fillStyle='#4488ff';
        ctx.beginPath();
        ctx.arc(lx,ly,Math.max(5,cs*0.22),0,Math.PI*2);
        ctx.fill();
        // Helmet
        ctx.fillStyle='#ffffff';
        ctx.beginPath();
        ctx.arc(lx,ly-Math.max(2,cs*0.06),Math.max(4,cs*0.18),Math.PI,0);
        ctx.fill();
    }
    ctx.fillStyle='#aaa';
    ctx.font=Math.max(10,Math.round(cs*0.55))+'px "Courier New",monospace';
    ctx.textAlign='right';
    ctx.fillText('LEVEL '+level,W-15,H-8);
}

function drawPlayer(ox,oy){
    var px=ox+player.x*cs+cs/2;
    var py=oy+player.y*cs+cs/2;
    var pr=cs*0.38;

    // Body (blue suit)
    ctx.fillStyle='#4488ff';
    ctx.beginPath();
    ctx.arc(px,py+pr*0.1,pr,0,Math.PI*2);
    ctx.fill();

    // White helmet
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.arc(px,py-pr*0.2,pr*0.75,Math.PI,0);
    ctx.fill();

    // Visor
    ctx.fillStyle='#2266cc';
    ctx.beginPath();
    ctx.arc(px+player.dir.x*pr*0.15,py-pr*0.1,pr*0.3,0,Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.arc(px+player.dir.x*pr*0.15-pr*0.1,py-pr*0.15,pr*0.12,0,Math.PI*2);
    ctx.fill();
    ctx.arc(px+player.dir.x*pr*0.15+pr*0.1,py-pr*0.15,pr*0.12,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath();
    ctx.arc(px+player.dir.x*pr*0.2-pr*0.1,py-pr*0.15,pr*0.06,0,Math.PI*2);
    ctx.fill();
    ctx.arc(px+player.dir.x*pr*0.2+pr*0.1,py-pr*0.15,pr*0.06,0,Math.PI*2);
    ctx.fill();

    // Pump nozzle (in direction player faces)
    if(player.pumping||harpoon){
        ctx.fillStyle='#cccccc';
        ctx.fillRect(
            px+player.dir.x*pr-cs*0.05,
            py+player.dir.y*pr-cs*0.05,
            cs*0.1+Math.abs(player.dir.x)*cs*0.15,
            cs*0.1+Math.abs(player.dir.y)*cs*0.15
        );
    }
}

function drawPooka(cx2,cy,r,e){
    // Inflation effect
    var inflate=1+e.inflateSize*0.6;
    var ir=r*inflate;

    // Round red body
    ctx.fillStyle=e.ghosting?'rgba(255,100,100,0.5)':'#ff4444';
    ctx.beginPath();
    ctx.arc(cx2,cy,ir,0,Math.PI*2);
    ctx.fill();

    // Darker belly
    ctx.fillStyle=e.ghosting?'rgba(200,50,50,0.4)':'#cc2222';
    ctx.beginPath();
    ctx.arc(cx2,cy+ir*0.15,ir*0.65,0,Math.PI);
    ctx.fill();

    // Goggles strap
    ctx.fillStyle='#ffcc00';
    ctx.fillRect(cx2-ir*0.8,cy-ir*0.3,ir*1.6,ir*0.2);

    // Goggle lenses
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.arc(cx2-ir*0.3,cy-ir*0.2,ir*0.22,0,Math.PI*2);
    ctx.fill();
    ctx.arc(cx2+ir*0.3,cy-ir*0.2,ir*0.22,0,Math.PI*2);
    ctx.fill();

    // Pupils
    ctx.fillStyle='#000';
    ctx.beginPath();
    ctx.arc(cx2-ir*0.3+e.dir.x*ir*0.08,cy-ir*0.2+e.dir.y*ir*0.08,ir*0.1,0,Math.PI*2);
    ctx.fill();
    ctx.arc(cx2+ir*0.3+e.dir.x*ir*0.08,cy-ir*0.2+e.dir.y*ir*0.08,ir*0.1,0,Math.PI*2);
    ctx.fill();

    // Inflation lines when pumped
    if(e.pumpCount>0){
        ctx.strokeStyle='rgba(255,255,200,0.6)';
        ctx.lineWidth=Math.max(1,r*0.06);
        for(var l=0;l<e.pumpCount;l++){
            var angle=Math.PI*0.3+l*Math.PI*0.4;
            ctx.beginPath();
            ctx.arc(cx2,cy,ir*0.85,angle-0.2,angle+0.2);
            ctx.stroke();
        }
    }
}

function drawFygar(cx2,cy,r,e){
    var inflate=1+e.inflateSize*0.6;
    var ir=r*inflate;

    // Green dragon body
    ctx.fillStyle=e.ghosting?'rgba(68,204,68,0.5)':'#44cc44';
    ctx.beginPath();
    ctx.arc(cx2,cy,ir,0,Math.PI*2);
    ctx.fill();

    // Darker scales
    ctx.fillStyle=e.ghosting?'rgba(34,153,34,0.4)':'#229922';
    ctx.beginPath();
    ctx.arc(cx2,cy+ir*0.2,ir*0.6,0,Math.PI);
    ctx.fill();

    // Snout
    var snoutDir=e.dir.x||1;
    ctx.fillStyle=e.ghosting?'rgba(68,204,68,0.5)':'#55dd55';
    ctx.beginPath();
    ctx.ellipse(cx2+snoutDir*ir*0.7,cy-ir*0.1,ir*0.35,ir*0.25,0,0,Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.arc(cx2-ir*0.2,cy-ir*0.3,ir*0.2,0,Math.PI*2);
    ctx.fill();
    ctx.arc(cx2+ir*0.2,cy-ir*0.3,ir*0.2,0,Math.PI*2);
    ctx.fill();

    // Pupils (angry looking)
    ctx.fillStyle='#ff0000';
    ctx.beginPath();
    ctx.arc(cx2-ir*0.2+e.dir.x*ir*0.06,cy-ir*0.3,ir*0.1,0,Math.PI*2);
    ctx.fill();
    ctx.arc(cx2+ir*0.2+e.dir.x*ir*0.06,cy-ir*0.3,ir*0.1,0,Math.PI*2);
    ctx.fill();

    // Spikes on top
    ctx.fillStyle=e.ghosting?'rgba(34,170,34,0.4)':'#22aa22';
    for(var s=0;s<3;s++){
        var sx=cx2-ir*0.3+s*ir*0.3;
        ctx.beginPath();
        ctx.moveTo(sx-ir*0.1,cy-ir*0.7);
        ctx.lineTo(sx,cy-ir*1.0);
        ctx.lineTo(sx+ir*0.1,cy-ir*0.7);
        ctx.fill();
    }

    // Inflation lines
    if(e.pumpCount>0){
        ctx.strokeStyle='rgba(200,255,200,0.6)';
        ctx.lineWidth=Math.max(1,r*0.06);
        for(var l=0;l<e.pumpCount;l++){
            var angle=Math.PI*0.3+l*Math.PI*0.4;
            ctx.beginPath();
            ctx.arc(cx2,cy,ir*0.85,angle-0.2,angle+0.2);
            ctx.stroke();
        }
    }
}

function drawFygarFire(ox,oy,e){
    var fireLen=3;
    var baseX=ox+e.x*cs+cs/2;
    var baseY=oy+e.y*cs+cs/2;
    var fdx=e.dir.x||1;

    for(var f=1;f<=fireLen;f++){
        var fx=e.gx+fdx*f;
        if(!isInBounds(fx,e.gy)||isDirt(fx,e.gy))break;
        var ffx=ox+fx*cs+cs/2;
        var ffy=oy+e.gy*cs+cs/2;
        var flicker=0.7+0.3*Math.sin(gameTime*20+f*2);
        // Outer flame
        ctx.fillStyle='rgba(255,'+Math.floor(100+50*flicker)+',0,'+flicker*0.6+')';
        ctx.beginPath();
        ctx.arc(ffx,ffy,cs*0.4*(1-f*0.15),0,Math.PI*2);
        ctx.fill();
        // Inner flame
        ctx.fillStyle='rgba(255,'+Math.floor(200+55*flicker)+',0,'+flicker*0.8+')';
        ctx.beginPath();
        ctx.arc(ffx,ffy,cs*0.25*(1-f*0.15),0,Math.PI*2);
        ctx.fill();
    }
}

// ─── TITLE SCREEN ─────────────────────────────────

function drawTitle(dt){
    ctx.fillStyle='#1a1008';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;

    // Dirt background layers
    for(var i=0;i<4;i++){
        ctx.fillStyle=DIRT_COLORS[i];
        ctx.globalAlpha=0.3;
        ctx.fillRect(0,H*(0.25+i*0.2),W,H*0.2);
    }
    ctx.globalAlpha=1;

    // Surface at top
    ctx.fillStyle=SURFACE_COLOR;ctx.fillRect(0,0,W,H*0.12);
    ctx.fillStyle=GRASS_COLOR;ctx.fillRect(0,H*0.12,W,H*0.05);

    ctx.save();ctx.textAlign='center';

    // Title
    ctx.shadowColor='#ff6600';ctx.shadowBlur=20+Math.sin(titlePulse)*10;
    ctx.font='bold '+Math.round(W*0.08)+'px "Courier New",monospace';
    ctx.fillStyle='#ffcc44';
    ctx.fillText('DIG DUG',W/2,H*0.3);
    ctx.shadowBlur=0;

    // Subtitle
    ctx.font=Math.round(W*0.03)+'px "Courier New",monospace';
    ctx.fillStyle='#ff8844';
    ctx.fillText('UNDERGROUND ADVENTURE',W/2,H*0.38);

    // Start prompt
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.52);

    // Controls
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move',W/2,H*0.62);
    ctx.fillText('SPACE to pump enemies',W/2,H*0.68);

    // Draw decorative characters
    var charY=H*0.82;
    // Player
    ctx.fillStyle='#4488ff';
    ctx.beginPath();ctx.arc(W*0.3,charY,14,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(W*0.3,charY-5,10,Math.PI,0);ctx.fill();

    // Pooka
    ctx.fillStyle='#ff4444';
    ctx.beginPath();ctx.arc(W*0.5,charY,14,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffcc00';
    ctx.fillRect(W*0.5-12,charY-5,24,4);
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(W*0.5-5,charY-4,4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(W*0.5+5,charY-4,4,0,Math.PI*2);ctx.fill();

    // Fygar
    ctx.fillStyle='#44cc44';
    ctx.beginPath();ctx.arc(W*0.7,charY,14,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(W*0.7-4,charY-5,4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(W*0.7+4,charY-5,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff0000';
    ctx.beginPath();ctx.arc(W*0.7-4,charY-5,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(W*0.7+4,charY-5,2,0,Math.PI*2);ctx.fill();

    ctx.restore();
}

function drawGameOver(){
    render(); // draw the last game state behind
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#ff0000';ctx.shadowBlur=25;
    ctx.font='bold '+Math.round(W*0.06)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3333';
    ctx.fillText('GAME OVER',W/2,H*0.25);
    ctx.shadowBlur=0;

    ctx.fillStyle='#ffcc00';
    ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
    ctx.fillText('SCORE: '+score,W/2,H*0.42);

    ctx.fillStyle='#aaa';
    ctx.font=Math.round(W*0.02)+'px "Courier New",monospace';
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

// ─── GAME LOOP ────────────────────────────────────

var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;
    if(dt>0.5)dt=0.016;
    lastTs=ts;

    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){update(dt);render();updateHUD();}
    else if(gameState==='gameover'){titlePulse+=dt;drawGameOver();}

    animId=requestAnimationFrame(gameLoop);
}

// ─── INPUT ────────────────────────────────────────

function onKey(e,down){
    if(gameState==='playing'){
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){keys.left=down;if(down)keys.right=false;}
        if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){keys.right=down;if(down)keys.left=false;}
        if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){keys.up=down;if(down)keys.down=false;}
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){keys.down=down;if(down)keys.up=false;}
        if(e.key===' '&&down)firePump();
    }
    if((e.key==='Enter'||e.key==='Tab')&&down&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn,releaseFn){
    var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn();});
    el.addEventListener('touchend',function(e){e.preventDefault();if(releaseFn)releaseFn();});
    el.addEventListener('mousedown',function(){fn();});
    el.addEventListener('mouseup',function(){if(releaseFn)releaseFn();});
}

// ─── INIT / STOP ──────────────────────────────────

window.initDigDug=function(){
    canvas=document.getElementById('game-canvas');
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    bindMobile('btn-left',function(){
        keys={left:true};
        player.dir={x:-1,y:0};
    },function(){keys.left=false;});
    bindMobile('btn-right',function(){
        keys={right:true};
        player.dir={x:1,y:0};
    },function(){keys.right=false;});
    bindMobile('btn-up',function(){
        keys={up:true};
        player.dir={x:0,y:-1};
    },function(){keys.up=false;});
    canvas.addEventListener('click',function(){
        if(gameState==='playing'){
            firePump();
        }else{
            resetGame();
        }
    });
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopDigDug=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    gameState='title';
    keys={};
};
})();
