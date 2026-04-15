// Zaxxon — Full Game (Isometric scrolling shooter)
(function(){
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var keys={left:false,right:false,up:false,down:false,fire:false};
var particles=[],bullets=[],enemies=[],obstacles=[];
var player,scrollSpeed,altitude,maxAltitude=8;
var scrollPos=0,sectionTimer=0,inFortress=true;
var fuelTimer=0,fuel=100;
var GROUND_Y,ISO_SCALE;

function resize(){
    var r=canvas.getBoundingClientRect();
    canvas.width=Math.round(r.width);
    canvas.height=Math.max(Math.round(r.height),300);
    W=canvas.width;H=canvas.height;
    GROUND_Y=H*0.85;
    ISO_SCALE=W*0.004;
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

// Isometric projection: convert (worldX, worldY, altitude) to screen coords
function isoProject(wx,wy,alt){
    var sx=W*0.3+wx*0.8-wy*0.4;
    var sy=H*0.3+wx*0.3+wy*0.5-alt*ISO_SCALE*8;
    return {x:sx,y:sy};
}

// ─── GENERATE OBSTACLES ─────────────────────────
function generateSection(){
    // Fortress walls, turrets, fuel tanks, gaps
    var baseZ=scrollPos+W*2;
    var spacing=W*0.3;

    for(var i=0;i<8;i++){
        var z=baseZ+i*spacing;
        var r=Math.random();
        if(r<0.3){
            // Wall with gap at specific altitude
            var gapAlt=2+Math.floor(Math.random()*4);
            obstacles.push({
                type:'wall',z:z,x:-W*0.2,width:W*0.8,
                gapAlt:gapAlt,gapSize:3,height:maxAltitude,
                active:true
            });
        }else if(r<0.5){
            // Fuel tank
            obstacles.push({
                type:'fuel',z:z,x:Math.random()*W*0.5-W*0.1,
                alt:1+Math.floor(Math.random()*3),
                active:true
            });
        }else if(r<0.7){
            // Turret (ground enemy)
            enemies.push({
                type:'turret',z:z,x:Math.random()*W*0.4-W*0.1,alt:0,
                active:true,hp:1,fireTimer:2+Math.random()*3,
                fireRate:3.0
            });
        }else{
            // Flying enemy
            enemies.push({
                type:'flyer',z:z,x:Math.random()*W*0.3,alt:3+Math.random()*4,
                active:true,hp:1,vx:(Math.random()-0.5)*60
            });
        }
    }
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;fuel=100;
    scrollPos=0;scrollSpeed=80;
    altitude=4;
    player={x:0,y:0,alt:4,hitTimer:0};
    particles=[];bullets=[];enemies=[];obstacles=[];
    sectionTimer=0;
    generateSection();
    gameState='playing';
}

function killPlayer(){
    lives--;
    addParticles(W*0.25,H*0.55,'#ff4444',25);
    if(lives<=0){gameState='gameover';return;}
    player.hitTimer=2.0;
    altitude=4;player.alt=4;fuel=Math.min(fuel+30,100);
}

// ─── UPDATE ──────────────────────────────────────
function update(dt){
    gameTime+=dt;

    // Fuel consumption
    fuelTimer+=dt;
    if(fuelTimer>0.5){fuelTimer=0;fuel-=1;
        if(fuel<=0){fuel=0;killPlayer();}
    }

    // Scroll
    scrollSpeed=80+level*5;
    scrollPos+=scrollSpeed*dt;

    // Generate new sections
    sectionTimer+=dt;
    if(sectionTimer>4.0){
        sectionTimer=0;
        generateSection();
        // Level up every 5 sections
        level=Math.min(level+1,20);
    }

    // Player movement
    var moveSpeed=150;
    if(keys.left)player.x-=moveSpeed*dt;
    if(keys.right)player.x+=moveSpeed*dt;
    if(keys.up){altitude=Math.min(altitude+4*dt,maxAltitude);}
    if(keys.down){altitude=Math.max(altitude-4*dt,0);}
    player.alt=altitude;

    // Clamp player
    player.x=Math.max(-W*0.2,Math.min(W*0.3,player.x));

    // Firing
    if(keys.fire){
        keys.fire=false;
        bullets.push({
            x:player.x,z:scrollPos+50,alt:altitude,
            speed:400,active:true
        });
    }

    // Update bullets
    for(var i=bullets.length-1;i>=0;i--){
        var b=bullets[i];
        b.z+=b.speed*dt;
        if(b.z>scrollPos+W*3){bullets.splice(i,1);continue;}

        // Check hits on enemies
        for(var j=enemies.length-1;j>=0;j--){
            var e=enemies[j];
            if(!e.active)continue;
            var dz=Math.abs(b.z-e.z);
            var dx=Math.abs(b.x-e.x);
            var da=Math.abs(b.alt-e.alt);
            if(dz<30&&dx<40&&da<1.5){
                e.active=false;
                bullets.splice(i,1);
                score+=e.type==='turret'?200:300;
                var sp=isoProject(e.x-scrollPos*0.3,e.z-scrollPos,e.alt);
                addParticles(sp.x,sp.y,'#ff8800',15);
                break;
            }
        }
    }

    // Update enemies
    for(var i=enemies.length-1;i>=0;i--){
        var e2=enemies[i];
        if(e2.z<scrollPos-200){enemies.splice(i,1);continue;}
        if(!e2.active)continue;

        if(e2.type==='flyer'){
            e2.x+=e2.vx*dt;
            if(e2.x<-W*0.3||e2.x>W*0.5)e2.vx=-e2.vx;
        }

        if(e2.type==='turret'){
            e2.fireTimer-=dt;
            if(e2.fireTimer<=0){
                e2.fireTimer=e2.fireRate;
                // Shoot at player - slow bullets for easy mode
                enemies.push({
                    type:'bullet',z:e2.z,x:e2.x,alt:e2.alt+1,
                    active:true,hp:1,
                    vx:(player.x-e2.x)*0.3,
                    vz:-60
                });
            }
        }

        if(e2.type==='bullet'){
            e2.x+=e2.vx*dt;
            e2.z+=e2.vz*dt;
            if(e2.z<scrollPos-100){e2.active=false;}
        }

        // Collision with player (if not invincible)
        if(player.hitTimer<=0&&e2.active){
            var dz2=Math.abs(e2.z-scrollPos-50);
            var dx2=Math.abs(e2.x-player.x);
            var da2=Math.abs(e2.alt-player.alt);
            if(dz2<25&&dx2<30&&da2<1.5){
                e2.active=false;
                killPlayer();
            }
        }
    }

    // Check obstacles
    for(var i=obstacles.length-1;i>=0;i--){
        var o=obstacles[i];
        if(o.z<scrollPos-200){obstacles.splice(i,1);continue;}
        if(!o.active)continue;

        var relZ=o.z-scrollPos;
        if(relZ>-30&&relZ<30){
            if(o.type==='wall'&&player.hitTimer<=0){
                // Check if player altitude is in the gap
                if(player.alt<o.gapAlt||player.alt>o.gapAlt+o.gapSize){
                    // Only if player X overlaps wall
                    if(player.x>o.x&&player.x<o.x+o.width){
                        killPlayer();
                    }
                }
            }

            if(o.type==='fuel'){
                var dx3=Math.abs(player.x-o.x);
                var da3=Math.abs(player.alt-o.alt);
                if(dx3<30&&da3<2){
                    fuel=Math.min(100,fuel+25);
                    score+=100;
                    o.active=false;
                    addParticles(W*0.25,H*0.55,'#44ff44',10);
                }
            }
        }
    }

    if(player.hitTimer>0)player.hitTimer-=dt;

    // Clean up inactive
    enemies=enemies.filter(function(e3){return e3.active;});
    obstacles=obstacles.filter(function(o2){return o2.active;});
}

// ─── RENDER ──────────────────────────────────────
function render(){
    // Space background
    var bgGrad=ctx.createLinearGradient(0,0,0,H);
    bgGrad.addColorStop(0,'#0a0020');bgGrad.addColorStop(1,'#1a1a40');
    ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

    // Stars
    var seed=42;
    for(var i=0;i<80;i++){
        seed=(seed*1103515245+12345)&0x7fffffff;
        var sx=(seed%1000)/1000*W;
        seed=(seed*1103515245+12345)&0x7fffffff;
        var sy=(seed%1000)/1000*H*0.5;
        ctx.fillStyle='rgba(255,255,255,'+(0.3+(seed%100)/200)+')';
        ctx.fillRect(sx,sy,1.5,1.5);
    }

    // Isometric fortress ground
    var tileW=W*0.08;
    var tileH=tileW*0.5;
    var scrollOff=(scrollPos*0.3)%(tileW*2);

    // Draw ground tiles
    ctx.save();
    for(var gy=-2;gy<15;gy++){
        for(var gx=-5;gx<12;gx++){
            var wx=(gx*tileW-scrollOff);
            var wy=(gy*tileH);
            var sx2=W*0.1+wx*0.7-wy*0.5;
            var sy2=H*0.35+wx*0.25+wy*0.5;

            if(sx2<-tileW||sx2>W+tileW||sy2<-tileH||sy2>H+tileH)continue;

            var shade=(gx+gy)%2===0?'#2a3a4a':'#253545';
            ctx.fillStyle=shade;
            ctx.beginPath();
            ctx.moveTo(sx2,sy2);
            ctx.lineTo(sx2+tileW*0.35,sy2-tileH*0.25);
            ctx.lineTo(sx2+tileW*0.7,sy2);
            ctx.lineTo(sx2+tileW*0.35,sy2+tileH*0.25);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle='#1a2a3a';ctx.lineWidth=0.5;ctx.stroke();
        }
    }
    ctx.restore();

    // Draw obstacles (walls)
    for(var i=0;i<obstacles.length;i++){
        var o=obstacles[i];
        if(!o.active)continue;
        var relZ=o.z-scrollPos;
        if(relZ<-100||relZ>W*2)continue;

        if(o.type==='wall'){
            // Draw wall with gap
            var wallColor='#556677';
            var wallX=W*0.1+relZ*0.3;
            var wallY=H*0.4+relZ*0.15;
            var wallW2=W*0.4;
            var wallH2=maxAltitude*ISO_SCALE*8;
            var gapTop=o.gapAlt*ISO_SCALE*8;
            var gapH=o.gapSize*ISO_SCALE*8;

            ctx.fillStyle=wallColor;
            // Bottom part (below gap)
            if(gapTop>0){
                ctx.fillRect(wallX,wallY-gapTop,wallW2,gapTop);
            }
            // Top part (above gap)
            var topStart=gapTop+gapH;
            if(topStart<wallH2){
                ctx.fillRect(wallX,wallY-wallH2,wallW2,wallH2-topStart);
            }

            // Wall edge highlight
            ctx.strokeStyle='#778899';ctx.lineWidth=2;
            ctx.strokeRect(wallX,wallY-wallH2,wallW2,wallH2);

            // Gap markers
            ctx.strokeStyle='#ffcc00';ctx.lineWidth=1;
            ctx.setLineDash([4,4]);
            ctx.beginPath();ctx.moveTo(wallX,wallY-gapTop);ctx.lineTo(wallX+wallW2,wallY-gapTop);ctx.stroke();
            ctx.beginPath();ctx.moveTo(wallX,wallY-topStart);ctx.lineTo(wallX+wallW2,wallY-topStart);ctx.stroke();
            ctx.setLineDash([]);
        }

        if(o.type==='fuel'){
            var sp=isoProject(o.x-scrollPos*0.3,relZ,o.alt);
            // Fuel tank
            ctx.fillStyle='#44ff44';
            ctx.beginPath();ctx.arc(sp.x,sp.y,10,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='#22aa22';ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(sp.x,sp.y,10,0,Math.PI*2);ctx.stroke();
            ctx.fillStyle='#fff';ctx.font='bold 8px "Courier New",monospace';
            ctx.textAlign='center';ctx.fillText('F',sp.x,sp.y+3);
        }
    }

    // Draw enemies
    for(var i=0;i<enemies.length;i++){
        var e=enemies[i];
        if(!e.active)continue;
        var relZ2=e.z-scrollPos;
        if(relZ2<-100||relZ2>W*2)continue;

        var sp2=isoProject(e.x-scrollPos*0.3,relZ2,e.alt);

        if(e.type==='turret'){
            // Turret on ground
            ctx.fillStyle='#cc4444';
            ctx.fillRect(sp2.x-8,sp2.y-12,16,12);
            ctx.fillStyle='#aa2222';
            ctx.beginPath();ctx.arc(sp2.x,sp2.y-12,6,0,Math.PI*2);ctx.fill();
            // Cannon
            ctx.strokeStyle='#888';ctx.lineWidth=3;
            ctx.beginPath();ctx.moveTo(sp2.x,sp2.y-12);ctx.lineTo(sp2.x-10,sp2.y-18);ctx.stroke();
        }else if(e.type==='flyer'){
            // Flying enemy ship
            ctx.fillStyle='#ff6644';
            ctx.beginPath();
            ctx.moveTo(sp2.x,sp2.y-10);
            ctx.lineTo(sp2.x+12,sp2.y+5);
            ctx.lineTo(sp2.x-12,sp2.y+5);
            ctx.closePath();ctx.fill();
            ctx.fillStyle='#cc4422';
            ctx.fillRect(sp2.x-8,sp2.y+2,16,4);
        }else if(e.type==='bullet'){
            ctx.fillStyle='#ff4444';
            ctx.beginPath();ctx.arc(sp2.x,sp2.y,3,0,Math.PI*2);ctx.fill();
        }
    }

    // Draw player bullets
    for(var i=0;i<bullets.length;i++){
        var b=bullets[i];
        var relBZ=b.z-scrollPos;
        var bsp=isoProject(b.x-scrollPos*0.3,relBZ,b.alt);
        ctx.fillStyle='#ffff44';
        ctx.beginPath();ctx.arc(bsp.x,bsp.y,3,0,Math.PI*2);ctx.fill();
        ctx.shadowColor='#ffff00';ctx.shadowBlur=5;
        ctx.beginPath();ctx.arc(bsp.x,bsp.y,2,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
    }

    // Draw player ship
    if(player.hitTimer<=0||Math.floor(player.hitTimer*8)%2===0){
        var psp=isoProject(player.x,50,altitude);
        drawPlayerShip(psp.x,psp.y);
    }

    // Shadow on ground
    var shadowSp=isoProject(player.x,50,0);
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(shadowSp.x,shadowSp.y,15,8,0,0,Math.PI*2);
    ctx.fill();

    // ─── HUD OVERLAY ─────────────────────────────
    // Altitude indicator (left side)
    var altBarX=15,altBarY=H*0.2,altBarH=H*0.5,altBarW=20;
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(altBarX-2,altBarY-2,altBarW+4,altBarH+4);
    ctx.strokeStyle='#667788';ctx.lineWidth=1;
    ctx.strokeRect(altBarX,altBarY,altBarW,altBarH);

    // Altitude fill
    var altFrac=altitude/maxAltitude;
    var altGrad=ctx.createLinearGradient(0,altBarY+altBarH,0,altBarY);
    altGrad.addColorStop(0,'#22aa44');altGrad.addColorStop(0.5,'#ffcc00');altGrad.addColorStop(1,'#ff4444');
    ctx.fillStyle=altGrad;
    ctx.fillRect(altBarX+2,altBarY+altBarH*(1-altFrac),altBarW-4,altBarH*altFrac);

    // Altitude label
    ctx.fillStyle='#ffffff';ctx.font='bold 10px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('ALT',altBarX+altBarW/2,altBarY-5);

    // Altitude markers
    for(var a=0;a<=maxAltitude;a+=2){
        var my=altBarY+altBarH*(1-a/maxAltitude);
        ctx.fillStyle='#aaa';ctx.font='8px "Courier New",monospace';
        ctx.textAlign='left';ctx.fillText(a,altBarX+altBarW+3,my+3);
    }

    // Player altitude indicator arrow
    var playerAltY=altBarY+altBarH*(1-altFrac);
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.moveTo(altBarX+altBarW+1,playerAltY);
    ctx.lineTo(altBarX+altBarW+7,playerAltY-4);
    ctx.lineTo(altBarX+altBarW+7,playerAltY+4);
    ctx.closePath();ctx.fill();

    // Fuel bar (top)
    var fuelBarW=W*0.3,fuelBarH=12;
    var fuelX=W/2-fuelBarW/2,fuelY=10;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(fuelX-2,fuelY-2,fuelBarW+4,fuelBarH+4);
    ctx.strokeStyle='#667788';ctx.lineWidth=1;ctx.strokeRect(fuelX,fuelY,fuelBarW,fuelBarH);
    var fuelGrad=ctx.createLinearGradient(fuelX,0,fuelX+fuelBarW,0);
    fuelGrad.addColorStop(0,'#ff4444');fuelGrad.addColorStop(0.3,'#ffcc00');fuelGrad.addColorStop(1,'#44ff44');
    ctx.fillStyle=fuelGrad;
    ctx.fillRect(fuelX+1,fuelY+1,(fuelBarW-2)*fuel/100,fuelBarH-2);
    ctx.fillStyle='#fff';ctx.font='bold 10px "Courier New",monospace';ctx.textAlign='center';
    ctx.fillText('FUEL: '+Math.round(fuel)+'%',W/2,fuelY+fuelBarH-2);

    // Lives
    ctx.fillStyle='#ff4444';ctx.font='bold 12px "Courier New",monospace';ctx.textAlign='right';
    ctx.fillText('LIVES: '+lives,W-10,25);

    drawParticles();
}

function drawPlayerShip(sx,sy){
    ctx.save();
    // Ship body (isometric fighter)
    ctx.fillStyle='#4488ff';
    ctx.beginPath();
    ctx.moveTo(sx,sy-15);      // nose
    ctx.lineTo(sx+18,sy+8);    // right wing
    ctx.lineTo(sx+5,sy+5);     // right body
    ctx.lineTo(sx,sy+12);      // tail
    ctx.lineTo(sx-5,sy+5);     // left body
    ctx.lineTo(sx-18,sy+8);    // left wing
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle='#88ccff';
    ctx.beginPath();ctx.arc(sx,sy-3,4,0,Math.PI*2);ctx.fill();

    // Wing details
    ctx.strokeStyle='#3366cc';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(sx-15,sy+7);ctx.lineTo(sx-3,sy+2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+15,sy+7);ctx.lineTo(sx+3,sy+2);ctx.stroke();

    // Engine glow
    ctx.fillStyle='#ffaa44';
    ctx.beginPath();ctx.arc(sx,sy+12,3+Math.random()*2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff6622';
    ctx.beginPath();ctx.arc(sx,sy+14,2+Math.random(),0,Math.PI*2);ctx.fill();

    ctx.restore();
}

// ─── TITLE SCREEN ────────────────────────────────
function drawTitle(dt){
    titlePulse+=dt;
    var bgGrad2=ctx.createLinearGradient(0,0,0,H);
    bgGrad2.addColorStop(0,'#0a0020');bgGrad2.addColorStop(1,'#1a1a40');
    ctx.fillStyle=bgGrad2;ctx.fillRect(0,0,W,H);

    // Stars
    var seed2=42;
    for(var i=0;i<60;i++){
        seed2=(seed2*1103515245+12345)&0x7fffffff;
        var sx3=(seed2%1000)/1000*W;
        seed2=(seed2*1103515245+12345)&0x7fffffff;
        var sy3=(seed2%1000)/1000*H;
        ctx.fillStyle='rgba(255,255,255,'+(0.3+(seed2%100)/200)+')';
        ctx.fillRect(sx3,sy3,1.5,1.5);
    }

    ctx.save();ctx.textAlign='center';

    ctx.shadowColor='#44aaff';ctx.shadowBlur=30;
    var ts=Math.round(W*0.08);
    ctx.font='bold '+ts+'px "Courier New",monospace';
    var scale=1+Math.sin(titlePulse*2)*0.05;
    ctx.setTransform(scale,0,0,scale,W/2*(1-scale),H*0.22*(1-scale));
    ctx.fillStyle='#44aaff';ctx.fillText('ZAXXON',W/2,H*0.22);
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;

    var fs=Math.round(W*0.02);
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ff8844';ctx.fillText('Fly over the fortress and destroy targets',W/2,H*0.38);
    ctx.fillStyle='#66aaff';ctx.fillText('Manage altitude to fly through wall gaps',W/2,H*0.44);
    ctx.fillStyle='#44ff44';ctx.fillText('Collect fuel tanks to keep flying',W/2,H*0.50);

    // Animated ship
    var shipX=W/2+Math.sin(titlePulse*2)*50;
    var shipY=H*0.64+Math.cos(titlePulse*1.5)*15;
    drawPlayerShip(shipX,shipY);

    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move, SPACE to fire',W/2,H*0.76);

    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.88);
    ctx.restore();
}

function drawGameOver(){
    render();
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
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=down;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=down;
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keys.up=down;
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keys.down=down;
    if(e.key===' '&&down)keys.fire=true;
    if(down&&(e.key==='Enter'||e.key==='Tab')&&gameState!=='playing')resetGame();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)!==-1)e.preventDefault();
}
var kd=function(e){onKey(e,true);};
var ku=function(e){onKey(e,false);};

function bindMobile(id,fn){var el=document.getElementById(id);if(!el)return;
    el.addEventListener('touchstart',function(e){e.preventDefault();fn(true);});
    el.addEventListener('touchend',function(e){e.preventDefault();fn(false);});
    el.addEventListener('mousedown',function(){fn(true);});
    el.addEventListener('mouseup',function(){fn(false);});
}

window.initZaxxon=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    keys={left:false,right:false,up:false,down:false,fire:false};
    bindMobile('btn-left',function(d){keys.left=d;});
    bindMobile('btn-right',function(d){keys.right=d;});
    bindMobile('btn-up',function(d){keys.up=d;});
    bindMobile('btn-down',function(d){keys.down=d;});
    canvas.addEventListener('click',function(){
        if(gameState==='playing')keys.fire=true;
        else resetGame();
    });
    gameState='title';titlePulse=0;lastTs=performance.now();
    animId=requestAnimationFrame(gameLoop);
};

window.stopZaxxon=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    keys={};gameState='title';
};
})();
