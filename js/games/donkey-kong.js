// Donkey Kong — Full Game
(function(){
// roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
if(typeof r==='number')r=[r,r,r,r];
this.moveTo(x+r[0],y);this.lineTo(x+w-r[1],y);this.arcTo(x+w,y,x+w,y+r[1],r[1]);
this.lineTo(x+w,y+h-r[2]);this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
this.lineTo(x+r[3],y+h);this.arcTo(x,y+h,x,y+h-r[3],r[3]);
this.lineTo(x,y+r[0]);this.arcTo(x,y,x+r[0],y,r[0]);return this;};}

var canvas,ctx,W,H,animId=null,gameState='title',score=0,lives=3,level=1,gameTime=0,titlePulse=0;
var player,barrels=[],flames=[],ladders=[],platforms=[],particles=[];
var dk,pauline,hammer,oilDrum;
var GRAVITY=1200,JUMP_VEL=-420,PLAYER_SPEED=160;
var BARREL_SPEED=120,BARREL_THROW_INTERVAL=2.5;
var barrelTimer=0,hammerTimer=0,hasHammer=false;
var walkFrame=0,walkTimer=0,dkThrowTimer=0,dkArm=0,screenShake=0;
var springs=[],brokenLadders=[];

function diffMult(){return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.15);}

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

// Build level platforms with classic DK-style sloped girders
function buildLevel(){
    platforms=[];ladders=[];barrels=[];flames=[];particles=[];springs=[];brokenLadders=[];
    hasHammer=false;hammerTimer=0;barrelTimer=0;

    var pw=W*0.88; // platform usable width
    var ox=(W-pw)/2; // offset x
    var numPlatforms=6;
    var pH=H/(numPlatforms+1.5); // spacing between platforms
    var baseSlopeAmt=H*0.03; // slope amount (gentle)
    var platThick=8;

    // Steeper slopes at higher levels
    var slopeAmt=baseSlopeAmt*(1+Math.min(level-1,5)*0.15);

    // Platform 0 (bottom/ground) - flat
    platforms.push({x:ox,y:H-pH*0.5,x2:ox+pw,y2:H-pH*0.5,thick:platThick,isGround:true});

    // Platforms 1-5: layout varies significantly by level
    // Level 1: standard alternating slopes
    // Level 2: reversed slope direction + narrower platforms
    // Level 3+: gaps in platforms, shifted positions, steeper slopes
    for(var i=1;i<=5;i++){
        var baseY=H-pH*0.5-i*pH;
        // Alternate slope direction, but shift pattern each level
        var slopeDir=((i+level)%2===0)?1:-1;
        var slope=slopeAmt*slopeDir;

        // Platform width shrinks at higher levels (narrower = harder to walk)
        var shrink=Math.min(level-1,4)*pw*0.02;
        var pOff=ox+shrink+Math.sin(i*2.3+level*1.7)*pw*0.05;
        var pEnd=ox+pw-shrink+Math.cos(i*1.9+level*2.1)*pw*0.05;
        pOff=Math.max(ox-5,pOff);pEnd=Math.min(ox+pw+5,pEnd);

        // Level 4+: some platforms have gaps (split into two segments)
        // We simulate this by making the platform shorter on one side
        if(level>=4&&(i===2||i===4)){
            var cutSide=(level+i)%2;
            if(cutSide===0)pOff+=pw*0.12;
            else pEnd-=pw*0.12;
        }

        platforms.push({x:pOff,y:baseY-slope,x2:pEnd,y2:baseY+slope,thick:platThick,isGround:false});
    }

    // Ladders connecting platforms — layout changes every level
    var ladderW=W*0.035;
    // Different ladder position sets per level to force new routes
    var ladderSets=[
        [[0.2,0.65],[0.45,0.85],[0.2,0.8],[0.4,0.65],[0.25,0.75]],  // level 1
        [[0.3,0.7],[0.15,0.55],[0.4,0.85],[0.25,0.7],[0.35,0.6]],   // level 2
        [[0.15,0.8],[0.35,0.6],[0.5,0.85],[0.2,0.55],[0.4,0.75]],   // level 3
        [[0.25,0.55],[0.7,0.85],[0.15,0.6],[0.5,0.8],[0.3,0.65]],   // level 4
        [[0.4,0.75],[0.2,0.6],[0.55,0.85],[0.35,0.7],[0.15,0.8]]    // level 5+
    ];
    var setIdx=Math.min(level-1,ladderSets.length-1);
    // Rotate through sets for levels beyond 5
    if(level>5)setIdx=(level-1)%ladderSets.length;
    var chosenSet=ladderSets[setIdx];

    for(var i=0;i<platforms.length-1;i++){
        var pBot=platforms[i];
        var pTop=platforms[i+1];
        var picks=chosenSet[Math.min(i,chosenSet.length-1)];

        for(var p=0;p<picks.length;p++){
            var frac=picks[p];
            var lx=ox+pw*frac;
            // Make sure ladder endpoints are on valid platform area
            lx=Math.max(pBot.x+10,Math.min(pBot.x2-10,lx));
            lx=Math.max(pTop.x+10,Math.min(pTop.x2-10,lx));
            var botY=getPlatformY(pBot,lx);
            var topY=getPlatformY(pTop,lx);
            ladders.push({x:lx-ladderW/2,y:topY,w:ladderW,h:botY-topY,
                          botPlatIdx:i,topPlatIdx:i+1});
        }
    }

    // Level 3+: some ladders are broken (shorter, don't reach all the way)
    if(level>=3){
        var numBroken=Math.min(level-2,3);
        for(var b=0;b<numBroken;b++){
            var bIdx=1+Math.floor((b*3+level)%Math.max(1,ladders.length-2));
            if(bIdx<ladders.length){
                brokenLadders.push(bIdx);
                ladders[bIdx].h*=0.55; // only goes halfway
            }
        }
    }

    // Level 5+: add bouncing springs on platforms
    if(level>=5){
        var numSprings=Math.min(level-4,4);
        for(var s=0;s<numSprings;s++){
            var sPlatIdx=1+s%(platforms.length-2);
            var sPlat=platforms[sPlatIdx];
            var sx=sPlat.x+(sPlat.x2-sPlat.x)*(0.3+s*0.15);
            var sy=getPlatformY(sPlat,sx)-12;
            springs.push({x:sx,y:sy,w:12,h:12,vy:0,baseY:sy,
                          bouncePhase:s*1.5,platIdx:sPlatIdx,active:true});
        }
    }

    // Oil drum at bottom-left
    oilDrum={x:ox+pw*0.08,y:platforms[0].y-30,w:30,h:30,fireTimer:0};

    // Level 3+: oil drum spawns initial flames immediately
    if(level>=3){
        var initFlames=Math.min(level-2,3);
        for(var fi=0;fi<initFlames;fi++){
            flames.push({x:oilDrum.x+oilDrum.w/2+fi*30,y:oilDrum.y,
                         targetX:ox+pw*0.5,targetY:platforms[0].y,
                         speed:(50+level*12),platIdx:0,animT:fi*0.5,
                         vx:0,onGround:true});
        }
    }

    // DK position - top-left of topmost platform
    var topPlat=platforms[platforms.length-1];
    dk={x:ox+pw*0.12,y:getPlatformY(topPlat,ox+pw*0.12)-50,w:50,h:50,throwAnim:0};

    // Pauline position - moves to harder-to-reach spots at higher levels
    var paulineX=level<=2?ox+pw*0.5:(level<=4?ox+pw*0.7:ox+pw*0.85);
    pauline={x:paulineX,y:getPlatformY(topPlat,paulineX)-35,w:20,h:30};

    // Hammer power-up — always available but position changes
    var hamPlatIdx=level<=2?2:(level<=4?3:1);
    var hamPlat=platforms[hamPlatIdx];
    var hx=ox+pw*(0.3+((level*0.17)%0.5));
    hammer={x:hx,y:getPlatformY(hamPlat,hx)-20,w:18,h:18,active:true};

    // Set barrel throw interval based on level (much more aggressive at higher levels)
    var dm=diffMult();
    BARREL_THROW_INTERVAL=Math.max(0.5, 2.5 - level*0.3) / dm;

    // Player starts at bottom-left
    player={x:ox+pw*0.2,y:platforms[0].y-20,w:16,h:20,
            vx:0,vy:0,onGround:false,climbing:false,climbLadder:null,
            facingRight:true,platIdx:0,jumpedBarrels:[]};
}

function getPlatformY(plat,px){
    var t=(px-plat.x)/(plat.x2-plat.x);
    t=Math.max(0,Math.min(1,t));
    return plat.y+(plat.y2-plat.y)*t;
}

function addParticles(x,y,c,n){
    for(var i=0;i<n;i++)particles.push({x:x,y:y,
        vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200,
        life:0.4+Math.random()*0.3,color:c,size:2+Math.random()*3});
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;
    buildLevel();gameState='playing';
}

function nextLevel(){
    level++;score+=500+level*100;
    buildLevel();
}

function killPlayer(){
    lives--;screenShake=0.4;
    addParticles(player.x+player.w/2,player.y+player.h/2,'#ff3355',20);
    if(lives<=0){gameState='gameover';return;}
    // Reset player position
    var pw=W*0.88,ox=(W-pw)/2;
    player.x=ox+pw*0.2;
    player.y=platforms[0].y-20;
    player.vx=0;player.vy=0;
    player.onGround=false;player.climbing=false;player.climbLadder=null;
    player.platIdx=0;player.jumpedBarrels=[];
    hasHammer=false;hammerTimer=0;
}

// Check if player is on a ladder
function getLadderAt(px,py,pw,ph){
    var cx=px+pw/2;
    var cy=py+ph/2;
    // Wide hitbox for easy mode
    var tolerance=W*0.04;
    for(var i=0;i<ladders.length;i++){
        var l=ladders[i];
        if(cx>l.x-tolerance&&cx<l.x+l.w+tolerance&&
           cy>l.y-5&&cy<l.y+l.h+5){
            return i;
        }
    }
    return -1;
}

// Check platform collision — find which platform the player is standing on
function getStandingPlatform(px,py,pw,ph,vy){
    var footX=px+pw/2;
    var footY=py+ph;
    for(var i=0;i<platforms.length;i++){
        var plat=platforms[i];
        var platY=getPlatformY(plat,footX);
        // Check if feet are near the platform surface and moving downward
        if(footX>=plat.x-5&&footX<=plat.x2+5){
            if(footY>=platY-4&&footY<=platY+12&&vy>=0){
                return i;
            }
        }
    }
    return -1;
}

function spawnBarrel(){
    var topPlat=platforms[platforms.length-1];
    var bx=dk.x+dk.w/2;
    var by=dk.y+dk.h;
    var platY=getPlatformY(topPlat,bx);
    // Barrel speed scales significantly with level
    var dm=diffMult();
    var speed=(BARREL_SPEED+level*25)*dm;
    // Level 3+: some barrels are "wild" — faster and more erratic
    var isWild=level>=3&&Math.random()<0.3;
    if(isWild)speed*=1.4;
    barrels.push({x:bx,y:platY-12,w:14,h:14,vx:speed*0.7,vy:0,
                  onGround:false,platIdx:platforms.length-1,
                  rotation:0,rollingRight:true,fallen:false,
                  wild:isWild,ladderChance:Math.min(0.15+level*0.08,0.6)});
    // Level 4+: DK sometimes throws two barrels at once
    if(level>=4&&Math.random()<0.25){
        var speed2=(BARREL_SPEED+level*20)*dm;
        barrels.push({x:bx+10,y:platY-12,w:14,h:14,vx:speed2*0.5,vy:-50,
                      onGround:false,platIdx:platforms.length-1,
                      rotation:0,rollingRight:true,fallen:false,
                      wild:false,ladderChance:Math.min(0.15+level*0.08,0.6)});
    }
}

function update(dt){
    if(gameState!=='playing')return;
    if(dt>0.1)dt=0.1;
    gameTime+=dt;

    // Walk animation
    if(Math.abs(player.vx)>10&&player.onGround){
        walkTimer+=dt;
        if(walkTimer>0.15){walkTimer=0;walkFrame=(walkFrame+1)%2;}
    }else{walkFrame=0;}

    // DK throw animation
    barrelTimer+=dt;
    dkThrowTimer+=dt;
    if(barrelTimer>=BARREL_THROW_INTERVAL){
        barrelTimer=0;dkThrowTimer=0;dkArm=1;
        spawnBarrel();
    }
    if(dkArm>0)dkArm=Math.max(0,dkArm-dt*3);

    // Hammer timer
    if(hasHammer){
        hammerTimer-=dt;
        if(hammerTimer<=0){hasHammer=false;hammerTimer=0;}
    }

    // Player movement
    if(!player.climbing){
        // Apply gravity
        player.vy+=GRAVITY*dt;
        player.x+=player.vx*dt;
        player.y+=player.vy*dt;

        // Platform collision
        var platIdx=getStandingPlatform(player.x,player.y,player.w,player.h,player.vy);
        if(platIdx>=0){
            var plat=platforms[platIdx];
            var footX=player.x+player.w/2;
            var platY=getPlatformY(plat,footX);
            player.y=platY-player.h;
            player.vy=0;
            player.onGround=true;
            player.platIdx=platIdx;

            // Slope: apply slight horizontal drift on sloped platforms
            if(!plat.isGround){
                var slopeDy=plat.y2-plat.y;
                var slopeLen=plat.x2-plat.x;
                var slopeAngle=slopeDy/slopeLen;
                // Gentle drift in downhill direction
                if(Math.abs(player.vx)<5){
                    player.x+=slopeAngle*15*dt;
                }
            }
        }else{
            player.onGround=false;
        }

        // Keep in bounds
        var pw2=W*0.88,ox2=(W-pw2)/2;
        if(player.x<ox2-5)player.x=ox2-5;
        if(player.x+player.w>ox2+pw2+5)player.x=ox2+pw2+5-player.w;

        // Fall off screen
        if(player.y>H+50){killPlayer();return;}
    }else{
        // Climbing logic
        if(player.climbLadder!==null){
            var l=ladders[player.climbLadder];
            // Center player on ladder
            player.x=l.x+l.w/2-player.w/2;
            player.y+=player.vy*dt;

            // Reached top of ladder
            if(player.y+player.h<l.y+10){
                player.climbing=false;
                player.climbLadder=null;
                player.y=l.y-player.h;
                player.vy=0;
                player.onGround=true;
            }
            // Reached bottom of ladder
            if(player.y+player.h>l.y+l.h){
                player.climbing=false;
                player.climbLadder=null;
                player.vy=0;
                player.onGround=true;
            }
        }
    }

    // Check ladder entry
    var lidx=getLadderAt(player.x,player.y,player.w,player.h);

    // Hammer pickup
    if(hammer&&hammer.active&&!hasHammer){
        var hcx=player.x+player.w/2,hcy=player.y+player.h/2;
        if(Math.abs(hcx-hammer.x-hammer.w/2)<20&&Math.abs(hcy-hammer.y-hammer.h/2)<20){
            hasHammer=true;hammerTimer=3;hammer.active=false;
            addParticles(hammer.x+hammer.w/2,hammer.y+hammer.h/2,'#ffcc00',10);
        }
    }

    // Pauline collision — level clear!
    var pcx=player.x+player.w/2,pcy=player.y+player.h/2;
    if(Math.abs(pcx-pauline.x-pauline.w/2)<25&&Math.abs(pcy-pauline.y-pauline.h/2)<30){
        addParticles(pauline.x+pauline.w/2,pauline.y+pauline.h/2,'#ff69b4',25);
        nextLevel();return;
    }

    // Update barrels
    for(var i=barrels.length-1;i>=0;i--){
        var b=barrels[i];
        b.rotation+=dt*6*(b.rollingRight?1:-1);

        // Apply gravity to barrel
        b.vy+=GRAVITY*0.6*dt;
        b.x+=b.vx*dt;
        b.y+=b.vy*dt;

        // Check barrel on platform
        var bPlatIdx=getStandingPlatform(b.x,b.y,b.w,b.h,b.vy);
        if(bPlatIdx>=0){
            var bPlat=platforms[bPlatIdx];
            var bFootX=b.x+b.w/2;
            var bPlatY=getPlatformY(bPlat,bFootX);
            b.y=bPlatY-b.h;
            b.vy=0;
            b.onGround=true;
            b.platIdx=bPlatIdx;

            // Roll direction based on platform slope
            var sdy=bPlat.y2-bPlat.y;
            if(Math.abs(sdy)>1){
                b.rollingRight=sdy>0;
                var rollSpeed=(BARREL_SPEED+level*25)*(b.wild?1.4:1);
                b.vx=rollSpeed*(b.rollingRight?1:-1)*0.7;
            }

            // Wild barrels bounce on platform edges
            if(b.wild&&b.vy===0&&Math.random()<0.02){
                b.vy=-120-Math.random()*80;
            }

            // Barrel reaches edge of platform — fall off
            if(b.x<bPlat.x-5||b.x+b.w>bPlat.x2+5){
                b.onGround=false;
                b.vy=20; // start falling
                // Take a ladder down — chance increases with level
                var lChance=b.ladderChance||0.2;
                if(Math.random()<lChance){
                    for(var li=0;li<ladders.length;li++){
                        var lad=ladders[li];
                        if(lad.topPlatIdx===bPlatIdx&&Math.abs(b.x+b.w/2-lad.x-lad.w/2)<30){
                            b.x=lad.x+lad.w/2-b.w/2;
                            b.vy=80+level*10;b.vx=0;
                            break;
                        }
                    }
                }
            }
        }else{
            b.onGround=false;
        }

        // Remove barrels that fall off screen
        if(b.y>H+30){
            // Barrel reached oil drum area — spawn flame
            if(b.x>oilDrum.x-30&&b.x<oilDrum.x+oilDrum.w+30){
                if(flames.length<2+level*2){
                    flames.push({x:oilDrum.x+oilDrum.w/2,y:oilDrum.y,
                                 targetX:player.x,targetY:player.y,
                                 speed:50+level*15,platIdx:0,animT:0,
                                 vx:0,onGround:true});
                }
            }
            barrels.splice(i,1);continue;
        }

        // Barrel-player collision
        var bdx=Math.abs((b.x+b.w/2)-(player.x+player.w/2));
        var bdy=Math.abs((b.y+b.h/2)-(player.y+player.h/2));
        if(bdx<(b.w/2+player.w/2)*0.8&&bdy<(b.h/2+player.h/2)*0.8){
            if(hasHammer){
                // Smash barrel
                score+=300;
                addParticles(b.x+b.w/2,b.y+b.h/2,'#8B4513',12);
                barrels.splice(i,1);continue;
            }else{
                killPlayer();return;
            }
        }

        // Score for jumping over barrels
        if(!player.climbing&&player.vy<0&&player.onGround===false){
            if(bdx<30&&player.y+player.h<b.y+b.h/2){
                var bid=i+'_'+Math.floor(b.x/10);
                if(player.jumpedBarrels.indexOf(bid)===-1){
                    player.jumpedBarrels.push(bid);
                    score+=100;
                    addParticles(player.x+player.w/2,player.y+player.h,'#ffcc00',6);
                }
            }
        }
    }

    // Update flames (fire enemies)
    for(var i=flames.length-1;i>=0;i--){
        var f=flames[i];
        f.animT+=dt;

        // Chase player slowly
        var fdx=player.x-f.x;
        var fdy=player.y-f.y;
        var fdist=Math.sqrt(fdx*fdx+fdy*fdy);
        if(fdist>1){
            f.x+=fdx/fdist*f.speed*dt;
            // Flames mostly stay on platforms, gentle Y tracking
            f.y+=fdy/fdist*f.speed*0.3*dt;
        }

        // Snap to platform if close
        var fPlatIdx=getStandingPlatform(f.x-6,f.y-6,12,12,1);
        if(fPlatIdx>=0){
            var fPlat=platforms[fPlatIdx];
            var fPlatY=getPlatformY(fPlat,f.x);
            f.y=fPlatY-8;
        }

        // Flame-player collision
        var fcdx=Math.abs(f.x-(player.x+player.w/2));
        var fcdy=Math.abs(f.y-(player.y+player.h/2));
        if(fcdx<16&&fcdy<16){
            if(hasHammer){
                score+=300;
                addParticles(f.x,f.y,'#ff6600',10);
                flames.splice(i,1);continue;
            }else{
                killPlayer();return;
            }
        }
    }

    // Limit barrels on screen (more allowed at higher levels)
    var maxBarrels=8+level*2;
    if(barrels.length>maxBarrels)barrels.splice(0,barrels.length-maxBarrels);

    // Update springs (bouncing hazards from level 5+)
    for(var i=0;i<springs.length;i++){
        var sp=springs[i];
        sp.bouncePhase+=dt*4;
        sp.y=sp.baseY+Math.abs(Math.sin(sp.bouncePhase))*-25;
        // Spring-player collision
        var sdx=Math.abs(sp.x-(player.x+player.w/2));
        var sdy=Math.abs(sp.y-(player.y+player.h/2));
        if(sdx<14&&sdy<14){
            if(hasHammer){
                score+=200;
                addParticles(sp.x,sp.y,'#cccccc',8);
                springs.splice(i,1);i--;continue;
            }else{
                // Spring bounces the player — not lethal but disruptive
                player.vy=-350;player.onGround=false;
                screenShake=0.15;
            }
        }
    }

    // Update particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
    }
    if(screenShake>0)screenShake-=dt;
}

// ── Input handling ──
var keys={};
function processInput(){
    if(gameState!=='playing')return;

    // Horizontal movement
    if(!player.climbing){
        if(keys.left){player.vx=-PLAYER_SPEED;player.facingRight=false;}
        else if(keys.right){player.vx=PLAYER_SPEED;player.facingRight=true;}
        else{player.vx*=0.7;if(Math.abs(player.vx)<5)player.vx=0;}
    }

    // Climbing
    var lidx=getLadderAt(player.x,player.y,player.w,player.h);
    if(keys.up&&lidx>=0){
        if(!player.climbing){
            player.climbing=true;
            player.climbLadder=lidx;
            player.vx=0;player.vy=-100;
            player.onGround=false;
        }else{
            player.vy=-100;
        }
    }else if(keys.down&&lidx>=0){
        if(!player.climbing){
            player.climbing=true;
            player.climbLadder=lidx;
            player.vx=0;player.vy=80;
            player.onGround=false;
        }else{
            player.vy=80;
        }
    }else if(player.climbing&&!keys.up&&!keys.down){
        player.vy=0;
    }

    // Jump — generous height for easy mode
    if(keys.jump&&player.onGround&&!player.climbing){
        player.vy=JUMP_VEL;
        player.onGround=false;
        player.jumpedBarrels=[];
    }
}

// ── Rendering ──
function render(){
    ctx.save();
    var shk=screenShake>0?screenShake:0;
    ctx.translate((Math.random()-0.5)*shk*12,(Math.random()-0.5)*shk*12);
    // Dark gradient background
    var bgGrad=ctx.createLinearGradient(0,0,0,H);bgGrad.addColorStop(0,'#0a0a22');bgGrad.addColorStop(0.5,'#0a0a1a');bgGrad.addColorStop(1,'#141420');
    ctx.fillStyle=bgGrad;ctx.fillRect(-5,-5,W+10,H+10);

    var pw=W*0.88,ox=(W-pw)/2;

    // Draw platforms (red/brown girders with rivets)
    for(var i=0;i<platforms.length;i++){
        var plat=platforms[i];
        var grad=ctx.createLinearGradient(plat.x,plat.y,plat.x,plat.y+plat.thick);
        grad.addColorStop(0,'#cc3322');
        grad.addColorStop(0.5,'#aa2211');
        grad.addColorStop(1,'#881100');

        ctx.beginPath();
        ctx.moveTo(plat.x,plat.y);
        ctx.lineTo(plat.x2,plat.y2);
        ctx.lineTo(plat.x2,plat.y2+plat.thick);
        ctx.lineTo(plat.x,plat.y+plat.thick);
        ctx.closePath();
        ctx.fillStyle=grad;ctx.fill();

        // Rivets
        ctx.fillStyle='#ffcc66';
        var rivetCount=Math.floor((plat.x2-plat.x)/30);
        for(var r=0;r<rivetCount;r++){
            var rx=plat.x+(r+0.5)*((plat.x2-plat.x)/rivetCount);
            var ry=getPlatformY(plat,rx)+plat.thick/2;
            ctx.beginPath();ctx.arc(rx,ry,2,0,Math.PI*2);ctx.fill();
        }
    }

    // Draw ladders
    for(var i=0;i<ladders.length;i++){
        var l=ladders[i];
        var isBroken=brokenLadders.indexOf(i)!==-1;
        ctx.strokeStyle=isBroken?'#886633':'#ccaa44';ctx.lineWidth=2;
        // Side rails
        ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x,l.y+l.h);ctx.stroke();
        ctx.beginPath();ctx.moveTo(l.x+l.w,l.y);ctx.lineTo(l.x+l.w,l.y+l.h);ctx.stroke();
        // Rungs
        ctx.strokeStyle=isBroken?'#775522':'#aa8833';ctx.lineWidth=2;
        var rungCount=Math.floor(l.h/12);
        for(var r=0;r<rungCount;r++){
            var ry=l.y+r*(l.h/rungCount)+6;
            ctx.beginPath();ctx.moveTo(l.x,ry);ctx.lineTo(l.x+l.w,ry);ctx.stroke();
        }
        // Broken ladder warning — red X at the gap
        if(isBroken){
            ctx.strokeStyle='rgba(255,60,60,0.6)';ctx.lineWidth=2;
            var brkY=l.y+l.h;
            ctx.beginPath();ctx.moveTo(l.x-2,brkY-6);ctx.lineTo(l.x+l.w+2,brkY+6);ctx.stroke();
            ctx.beginPath();ctx.moveTo(l.x+l.w+2,brkY-6);ctx.lineTo(l.x-2,brkY+6);ctx.stroke();
        }
    }

    // Draw springs (level 5+)
    for(var i=0;i<springs.length;i++){
        var sp=springs[i];
        var compression=Math.abs(Math.sin(sp.bouncePhase));
        // Spring coil
        ctx.strokeStyle='#cccccc';ctx.lineWidth=2;
        var springH=sp.h*(0.5+compression*0.5);
        var coils=4;
        for(var c=0;c<coils;c++){
            var cy=sp.y+springH-c*(springH/coils);
            var cw=sp.w/2*(c%2===0?1:-1);
            ctx.beginPath();ctx.moveTo(sp.x-sp.w/4,cy);ctx.lineTo(sp.x+cw,cy-springH/coils/2);ctx.stroke();
        }
        // Spring top cap
        ctx.fillStyle='#aaaaaa';
        ctx.fillRect(sp.x-sp.w/2,sp.y-2,sp.w,4);
        // Danger glow
        ctx.shadowColor='#ff6600';ctx.shadowBlur=4+compression*4;
        ctx.fillStyle='#ff8833';ctx.beginPath();ctx.arc(sp.x,sp.y,3,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
    }

    // Draw oil drum
    ctx.fillStyle='#334';
    ctx.beginPath();ctx.roundRect(oilDrum.x,oilDrum.y,oilDrum.w,oilDrum.h,3);ctx.fill();
    ctx.fillStyle='#556';
    ctx.beginPath();ctx.roundRect(oilDrum.x+2,oilDrum.y+4,oilDrum.w-4,oilDrum.h-8,2);ctx.fill();
    ctx.fillStyle='#f80';ctx.font='bold '+Math.max(8,Math.round(oilDrum.w*0.4))+'px monospace';
    ctx.textAlign='center';ctx.fillText('OIL',oilDrum.x+oilDrum.w/2,oilDrum.y+oilDrum.h*0.65);

    // Oil drum fire
    var flameHeight=8+Math.sin(gameTime*8)*4;
    ctx.fillStyle='#ff4400';
    ctx.beginPath();
    ctx.moveTo(oilDrum.x+5,oilDrum.y);
    ctx.quadraticCurveTo(oilDrum.x+oilDrum.w/2,oilDrum.y-flameHeight-8,oilDrum.x+oilDrum.w-5,oilDrum.y);
    ctx.fill();
    ctx.fillStyle='#ffaa00';
    ctx.beginPath();
    ctx.moveTo(oilDrum.x+10,oilDrum.y);
    ctx.quadraticCurveTo(oilDrum.x+oilDrum.w/2,oilDrum.y-flameHeight,oilDrum.x+oilDrum.w-10,oilDrum.y);
    ctx.fill();

    // Draw Donkey Kong
    drawDK();

    // Draw Pauline
    drawPauline();

    // Draw hammer pickup
    if(hammer&&hammer.active){
        ctx.fillStyle='#8B4513';
        ctx.fillRect(hammer.x+6,hammer.y,6,hammer.h);
        ctx.fillStyle='#aaa';
        ctx.fillRect(hammer.x,hammer.y-4,hammer.w,10);
        // Glow
        ctx.strokeStyle='rgba(255,204,0,'+(0.4+0.3*Math.sin(gameTime*5))+')';
        ctx.lineWidth=2;ctx.strokeRect(hammer.x-3,hammer.y-7,hammer.w+6,hammer.h+10);
    }

    // Draw barrels
    for(var i=0;i<barrels.length;i++){
        var b=barrels[i];
        ctx.save();
        ctx.translate(b.x+b.w/2,b.y+b.h/2);
        ctx.rotate(b.rotation);
        // Wild barrel glow
        if(b.wild){
            ctx.shadowColor='#ff3300';ctx.shadowBlur=8;
        }
        // Barrel body
        ctx.fillStyle=b.wild?'#aa3310':'#8B4513';
        ctx.beginPath();ctx.arc(0,0,b.w/2,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        // Dark bands
        ctx.strokeStyle=b.wild?'#661100':'#4a2506';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(0,0,b.w/2-1,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle=b.wild?'#882200':'#5a3510';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-b.w/2+2,0);ctx.lineTo(b.w/2-2,0);ctx.stroke();
        ctx.restore();
    }

    // Draw flames
    for(var i=0;i<flames.length;i++){
        var f=flames[i];
        var fs=8+Math.sin(f.animT*10)*3;
        // Outer flame
        ctx.fillStyle='#ff4400';
        ctx.beginPath();
        ctx.moveTo(f.x-fs,f.y+4);
        ctx.quadraticCurveTo(f.x,f.y-fs-6+Math.sin(f.animT*12)*3,f.x+fs,f.y+4);
        ctx.fill();
        // Inner flame
        ctx.fillStyle='#ffaa00';
        ctx.beginPath();
        ctx.moveTo(f.x-fs*0.5,f.y+4);
        ctx.quadraticCurveTo(f.x,f.y-fs*0.6+Math.sin(f.animT*15)*2,f.x+fs*0.5,f.y+4);
        ctx.fill();
        // Core
        ctx.fillStyle='#ffee88';
        ctx.beginPath();ctx.arc(f.x,f.y,3,0,Math.PI*2);ctx.fill();
    }

    // Draw player (Mario)
    drawPlayer();

    // Draw particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life*2);
        ctx.fillStyle=p.color;
        ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
    ctx.globalAlpha=1;

    // Hammer indicator
    if(hasHammer){
        ctx.fillStyle='rgba(255,204,0,'+(0.5+0.3*Math.sin(gameTime*8))+')';
        ctx.font='bold '+Math.max(10,Math.round(W*0.02))+'px "Courier New",monospace';
        ctx.textAlign='left';
        ctx.fillText('HAMMER: '+Math.ceil(hammerTimer)+'s',10,20);
    }

    // Lives display
    for(var i=0;i<lives;i++){
        var lx=10+i*22,ly=H-18;
        // Mini Mario hat
        ctx.fillStyle='#ff0000';
        ctx.fillRect(lx,ly,12,5);
        ctx.fillStyle='#ffaa88';
        ctx.fillRect(lx+2,ly+5,8,6);
    }
    ctx.fillStyle='#aaa';ctx.font='12px "Courier New",monospace';
    ctx.textAlign='right';ctx.fillText('LEVEL '+level,W-15,H-8);
    // vignette
    var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.4)');ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
    ctx.restore();
}

function drawDK(){
    var x=dk.x,y=dk.y,w=dk.w,h=dk.h;
    // Body (large brown gorilla)
    ctx.fillStyle='#8B4513';
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.55,w*0.45,h*0.45,0,0,Math.PI*2);ctx.fill();
    // Head
    ctx.fillStyle='#9B5523';
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.2,w*0.3,h*0.22,0,0,Math.PI*2);ctx.fill();
    // Face
    ctx.fillStyle='#c48844';
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.25,w*0.18,h*0.12,0,0,Math.PI*2);ctx.fill();
    // Eyes
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(x+w*0.38,y+h*0.17,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+w*0.62,y+h*0.17,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(x+w*0.38,y+h*0.17,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+w*0.62,y+h*0.17,1.5,0,Math.PI*2);ctx.fill();
    // Mouth / grin
    ctx.strokeStyle='#4a2506';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x+w/2,y+h*0.25,w*0.1,0.2,Math.PI-0.2);ctx.stroke();
    // Arms — throwing animation
    var armAngle=dkArm*0.8;
    ctx.fillStyle='#8B4513';
    // Left arm
    ctx.save();ctx.translate(x+w*0.15,y+h*0.4);ctx.rotate(-0.5+armAngle);
    ctx.fillRect(-5,-3,w*0.3,8);ctx.restore();
    // Right arm (throwing)
    ctx.save();ctx.translate(x+w*0.85,y+h*0.4);ctx.rotate(0.5-armAngle*1.5);
    ctx.fillRect(-w*0.25,-3,w*0.3,8);ctx.restore();
    // Legs
    ctx.fillStyle='#7a3a10';
    ctx.fillRect(x+w*0.25,y+h*0.8,10,h*0.2);
    ctx.fillRect(x+w*0.55,y+h*0.8,10,h*0.2);
}

function drawPauline(){
    var x=pauline.x,y=pauline.y,w=pauline.w,h=pauline.h;
    // Dress (pink)
    ctx.fillStyle='#ff69b4';
    ctx.fillRect(x+2,y+h*0.35,w-4,h*0.65);
    // Body
    ctx.fillStyle='#ffaa88';
    ctx.beginPath();ctx.ellipse(x+w/2,y+h*0.3,w*0.3,h*0.15,0,0,Math.PI*2);ctx.fill();
    // Head
    ctx.fillStyle='#ffaa88';
    ctx.beginPath();ctx.arc(x+w/2,y+h*0.12,w*0.35,0,Math.PI*2);ctx.fill();
    // Hair
    ctx.fillStyle='#cc8800';
    ctx.beginPath();ctx.arc(x+w/2,y+h*0.05,w*0.38,Math.PI+0.3,Math.PI*2-0.3);ctx.fill();
    // "HELP!" text
    var helpAlpha=0.5+0.5*Math.sin(gameTime*4);
    ctx.fillStyle='rgba(255,255,255,'+helpAlpha+')';
    ctx.font='bold '+Math.max(8,Math.round(W*0.018))+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('HELP!',x+w/2,y-8);
}

function drawPlayer(){
    var x=player.x,y=player.y,w=player.w,h=player.h;
    var dir=player.facingRight?1:-1;

    ctx.save();
    if(!player.facingRight){
        ctx.translate(x+w/2,0);ctx.scale(-1,1);ctx.translate(-(x+w/2),0);
    }

    // Hammer in hand
    if(hasHammer){
        var hammerAngle=Math.sin(gameTime*12)*0.8;
        ctx.save();
        ctx.translate(x+w*0.8,y+h*0.3);
        ctx.rotate(hammerAngle);
        ctx.fillStyle='#aaa';ctx.fillRect(-3,-14,8,10);
        ctx.fillStyle='#8B4513';ctx.fillRect(0,-4,3,14);
        ctx.restore();
    }

    // Hat (red)
    ctx.fillStyle='#ff0000';
    ctx.fillRect(x-1,y,w+2,h*0.2);
    ctx.fillRect(x+2,y-h*0.08,w-4,h*0.12);

    // Head/face
    ctx.fillStyle='#ffaa88';
    ctx.fillRect(x+2,y+h*0.15,w-4,h*0.25);

    // Eyes
    ctx.fillStyle='#000';
    ctx.fillRect(x+w*0.55,y+h*0.2,2,2);

    // Mustache
    ctx.fillStyle='#4a2506';
    ctx.fillRect(x+w*0.3,y+h*0.32,w*0.5,2);

    // Shirt (red/blue)
    ctx.fillStyle='#ff0000';
    ctx.fillRect(x+1,y+h*0.4,w-2,h*0.25);

    // Overalls (blue)
    ctx.fillStyle='#2244cc';
    ctx.fillRect(x+2,y+h*0.6,w-4,h*0.2);

    // Legs - walking animation
    ctx.fillStyle='#2244cc';
    if(player.climbing){
        // Climbing pose
        var climbOff=Math.sin(gameTime*8)*3;
        ctx.fillRect(x+1,y+h*0.8,w/2-2,h*0.2);
        ctx.fillRect(x+w/2+1,y+h*0.8+climbOff,w/2-2,h*0.2);
    }else if(walkFrame===1&&player.onGround){
        ctx.fillRect(x,y+h*0.8,w/2-1,h*0.2);
        ctx.fillRect(x+w/2+2,y+h*0.8,w/2-1,h*0.2);
    }else{
        ctx.fillRect(x+2,y+h*0.8,w-4,h*0.2);
    }

    // Shoes
    ctx.fillStyle='#4a2506';
    ctx.fillRect(x,y+h*0.95,w,h*0.05);

    ctx.restore();
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    ctx.save();ctx.textAlign='center';

    // DK silhouette at top
    var dkY=H*0.08;
    ctx.fillStyle='rgba(139,69,19,0.3)';
    ctx.beginPath();ctx.ellipse(W/2,dkY+30,40,35,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(W/2,dkY+8,25,18,0,0,Math.PI*2);ctx.fill();
    // Arms
    ctx.fillRect(W/2-50,dkY+15,20,10);ctx.fillRect(W/2+30,dkY+15,20,10);

    // Title
    ctx.shadowColor='#ff3322';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.07)+'px "Courier New",monospace';
    ctx.fillStyle='#ff3322';ctx.fillText('DONKEY KONG',W/2,H*0.22);
    ctx.shadowBlur=0;

    // Instructions
    var fs=Math.max(10,Math.round(W*0.02));
    ctx.font='bold '+fs+'px "Courier New",monospace';

    ctx.fillStyle='#ffcc00';ctx.fillText('Climb to the top to rescue Pauline!',W/2,H*0.34);

    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ff8844';ctx.fillText('Dodge or jump over rolling barrels',W/2,H*0.41);
    ctx.fillStyle='#66aaff';ctx.fillText('Climb ladders with UP/DOWN',W/2,H*0.48);
    ctx.fillStyle='#ff69b4';ctx.fillText('Reach Pauline at the top to clear the level',W/2,H*0.55);

    // Mini barrel icon
    ctx.fillStyle='#8B4513';ctx.beginPath();ctx.arc(W/2,H*0.60,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4a2506';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(W/2,H*0.60,7,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#aaa';ctx.font=(fs-2)+'px "Courier New",monospace';
    ctx.fillText('+100 pts per barrel jumped, +300 smashed',W/2,H*0.66);

    // Controls
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / WASD to move, Space/Up to jump',W/2,H*0.74);

    // Start prompt
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.84);

    // Animated Mario walking
    var mx=W/2+Math.sin(titlePulse*1.5)*40,my=H*0.92;
    ctx.fillStyle='#ff0000';ctx.fillRect(mx-6,my-10,12,4);
    ctx.fillStyle='#ffaa88';ctx.fillRect(mx-4,my-6,8,5);
    ctx.fillStyle='#ff0000';ctx.fillRect(mx-5,my-1,10,5);
    ctx.fillStyle='#2244cc';ctx.fillRect(mx-4,my+4,8,6);

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
    document.getElementById('hud-score').textContent=score;
    document.getElementById('hud-speed').textContent='LVL '+level;
    document.getElementById('hud-time').textContent=lives+' HP';
}

var lastTs=0;
function gameLoop(ts){
    var dt=(ts-lastTs)/1000;if(dt>0.5)dt=0.016;lastTs=ts;
    if(gameState==='title'){drawTitle(dt);}
    else if(gameState==='playing'){processInput();update(dt);render();updateHUD();}
    else if(gameState==='gameover'){render();titlePulse+=dt;drawGameOver();}
    animId=requestAnimationFrame(gameLoop);
}

function onKey(e,down){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=down;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=down;
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')keys.up=down;
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')keys.down=down;
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){if(down)keys.jump=true;}
    if(!down&&(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W'))keys.jump=false;
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

window.initDonkeyKong=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    keys={left:false,right:false,up:false,down:false,jump:false};
    bindMobile('btn-left',function(d){keys.left=d;});
    bindMobile('btn-right',function(d){keys.right=d;});
    bindMobile('btn-up',function(d){keys.up=d;if(d)keys.jump=true;});
    bindMobile('btn-down',function(d){keys.down=d;});
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopDonkeyKong=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    keys={};gameState='title';
};
})();
