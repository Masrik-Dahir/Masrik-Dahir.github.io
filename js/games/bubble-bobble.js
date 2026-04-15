// Bubble Bobble — Full Game
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
var player,bubbles=[],enemies=[],particles=[],foods=[],platforms=[];
var keys={};
var GRAVITY=900,JUMP_VEL=-380,PLAYER_SPEED=180,BUBBLE_SPEED=280;
var TRAP_DURATION=8,BUBBLE_FLOAT_SPEED=-50;
function diffMult(){ return level<=2?0.7:(level<=5?1.0:1.0+(level-5)*0.12); }
var walkFrame=0,walkTimer=0,shootCooldown=0;
var comboCount=0,comboTimer=0;
var levelTransitionTimer=0;

// Enemy types with distinct looks
var ENEMY_TYPES=[
    {name:'blob',color:'#ff4466',eyeColor:'#fff',bodyShape:'round'},
    {name:'skull',color:'#aa44ff',eyeColor:'#ff0',bodyShape:'square'},
    {name:'fish',color:'#44aaff',eyeColor:'#fff',bodyShape:'diamond'},
    {name:'ghost',color:'#ffaa22',eyeColor:'#f00',bodyShape:'triangle'}
];

// Food items with point values
var FOOD_TYPES=[
    {name:'cherry',points:100,color:'#ff2244'},
    {name:'banana',points:200,color:'#ffdd00'},
    {name:'cake',points:400,color:'#ff88cc'},
    {name:'diamond',points:800,color:'#00ffff'}
];

function resize(){var r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width);canvas.height=Math.max(Math.round(r.height),300);W=canvas.width;H=canvas.height;}

function buildLevel(){
    platforms=[];bubbles=[];enemies=[];foods=[];particles=[];
    comboCount=0;comboTimer=0;shootCooldown=0;levelTransitionTimer=0;

    var pw=W*0.92,ox=(W-pw)/2;
    var platH=H*0.018;
    var platColor;

    // Color theme per level
    var colors=['#44cc44','#cc4444','#4488cc','#ccaa44','#cc44cc','#44cccc'];
    platColor=colors[(level-1)%colors.length];

    // Ground platform (bottom)
    platforms.push({x:ox,y:H-platH*2,w:pw,h:platH,color:platColor});

    // Ceiling platform (top) - with gap for wrap-around
    platforms.push({x:ox,y:platH*3,w:pw*0.35,h:platH,color:platColor});
    platforms.push({x:ox+pw*0.65,y:platH*3,w:pw*0.35,h:platH,color:platColor});

    // Middle platforms - 5 platforms at varying heights
    // Platform layout changes slightly per level
    var layoutSeed=((level-1)%4);

    if(layoutSeed===0){
        // Layout 1: Zigzag
        platforms.push({x:ox+pw*0.05,y:H*0.78,w:pw*0.35,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.55,y:H*0.78,w:pw*0.40,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.20,y:H*0.56,w:pw*0.55,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.0,y:H*0.36,w:pw*0.38,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.58,y:H*0.36,w:pw*0.40,h:platH,color:platColor});
    }else if(layoutSeed===1){
        // Layout 2: Pyramid
        platforms.push({x:ox+pw*0.02,y:H*0.78,w:pw*0.28,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.68,y:H*0.78,w:pw*0.30,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.15,y:H*0.58,w:pw*0.65,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.05,y:H*0.38,w:pw*0.35,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.55,y:H*0.38,w:pw*0.40,h:platH,color:platColor});
    }else if(layoutSeed===2){
        // Layout 3: Staircase
        platforms.push({x:ox+pw*0.0,y:H*0.80,w:pw*0.30,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.35,y:H*0.68,w:pw*0.30,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.65,y:H*0.55,w:pw*0.33,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.15,y:H*0.42,w:pw*0.40,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.60,y:H*0.28,w:pw*0.35,h:platH,color:platColor});
    }else{
        // Layout 4: Spread
        platforms.push({x:ox+pw*0.10,y:H*0.80,w:pw*0.30,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.55,y:H*0.72,w:pw*0.40,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.0,y:H*0.52,w:pw*0.42,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.50,y:H*0.45,w:pw*0.45,h:platH,color:platColor});
        platforms.push({x:ox+pw*0.15,y:H*0.25,w:pw*0.50,h:platH,color:platColor});
    }

    // Walls (left and right boundaries)
    platforms.push({x:ox-platH,y:0,w:platH,h:H,color:platColor,isWall:true});
    platforms.push({x:ox+pw,y:0,w:platH,h:H,color:platColor,isWall:true});

    // Spawn enemies - 3-4 per level
    var enemyCount=3+Math.min(1,Math.floor(level/3));
    var spawnPlatforms=[3,4,5,6]; // middle platforms indices (skip ground and ceiling)
    for(var i=0;i<enemyCount;i++){
        var pIdx=spawnPlatforms[i%spawnPlatforms.length];
        if(pIdx>=platforms.length)pIdx=3;
        var p=platforms[pIdx];
        if(p.isWall)continue;
        var ex=p.x+p.w*0.3+Math.random()*p.w*0.4;
        var ey=p.y-H*0.04;
        var type=ENEMY_TYPES[i%ENEMY_TYPES.length];
        var baseSpeed=40+level*5;
        enemies.push({
            x:ex,y:ey,w:W*0.035,h:W*0.035,
            vx:baseSpeed*(Math.random()>0.5?1:-1),vy:0,
            type:type,trapped:false,trapTimer:0,
            angry:false,angrySpeed:baseSpeed*1.5,
            onGround:false,facingRight:true,
            walkFrame:0,walkTimer:0,
            floatBubble:null
        });
    }

    // Player starts at bottom center
    player={
        x:W*0.5-W*0.02,y:platforms[0].y-H*0.05,
        w:W*0.04,h:W*0.045,
        vx:0,vy:0,onGround:false,
        facingRight:true,
        invincible:0,blinkTimer:0
    };
}

function addParticles(x,y,c,n){
    for(var i=0;i<n;i++)particles.push({
        x:x,y:y,
        vx:(Math.random()-0.5)*200,vy:(Math.random()-0.5)*200-50,
        life:0.4+Math.random()*0.4,color:c,size:2+Math.random()*4
    });
}

function addRainbowParticles(x,y,n){
    var rainbow=['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff','#ff00ff'];
    for(var i=0;i<n;i++){
        var c=rainbow[i%rainbow.length];
        particles.push({
            x:x,y:y,
            vx:(Math.random()-0.5)*250,vy:(Math.random()-0.5)*250-80,
            life:0.6+Math.random()*0.5,color:c,size:3+Math.random()*5
        });
    }
}

function spawnFood(x,y,comboIdx){
    var typeIdx=Math.min(comboIdx,FOOD_TYPES.length-1);
    var food=FOOD_TYPES[typeIdx];
    foods.push({
        x:x,y:y,w:W*0.03,h:W*0.03,
        vy:-100,life:5,
        type:food,collected:false,
        bobTimer:Math.random()*Math.PI*2
    });
}

function resetGame(){
    score=0;lives=3;level=1;gameTime=0;
    buildLevel();gameState='playing';
}

function nextLevel(){
    level++;score+=300;
    buildLevel();
}

function killPlayer(){
    lives--;
    addParticles(player.x+player.w/2,player.y+player.h/2,'#44ff44',20);
    if(lives<=0){gameState='gameover';return;}
    // Reset position to ground
    player.x=W*0.5-W*0.02;
    player.y=platforms[0].y-H*0.05;
    player.vx=0;player.vy=0;
    player.onGround=false;
    player.invincible=2;player.blinkTimer=0;
}

// Rect collision
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
    return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
}

// Platform collision for an entity
function applyPlatformCollision(e){
    e.onGround=false;
    for(var i=0;i<platforms.length;i++){
        var p=platforms[i];
        if(p.isWall){
            // Wall collision - push entity out
            if(rectsOverlap(e.x,e.y,e.w,e.h,p.x,p.y,p.w,p.h)){
                if(p.x<W/2){
                    // Left wall
                    e.x=p.x+p.w;
                    if(e.vx<0)e.vx=-e.vx;
                }else{
                    // Right wall
                    e.x=p.x-e.w;
                    if(e.vx>0)e.vx=-e.vx;
                }
            }
            continue;
        }
        // Only check top surface for floor platforms
        var footY=e.y+e.h;
        var prevFootY=footY-e.vy*0.017; // approximate previous foot position
        if(e.vy>=0&&footY>=p.y&&footY<=p.y+p.h+8&&prevFootY<=p.y+4){
            if(e.x+e.w>p.x+2&&e.x<p.x+p.w-2){
                e.y=p.y-e.h;
                e.vy=0;
                e.onGround=true;
            }
        }
    }
}

function processInput(){
    if(gameState!=='playing')return;

    // Horizontal movement
    player.vx=0;
    if(keys.left){player.vx=-PLAYER_SPEED;player.facingRight=false;}
    if(keys.right){player.vx=PLAYER_SPEED;player.facingRight=true;}

    // Jump
    if(keys.jump&&player.onGround){
        player.vy=JUMP_VEL;
        player.onGround=false;
        keys.jump=false;
    }

    // Shoot bubble
    if(keys.shoot&&shootCooldown<=0){
        shootBubble();
        shootCooldown=0.3;
        keys.shoot=false;
    }
}

function shootBubble(){
    var dir=player.facingRight?1:-1;
    var bx=player.x+(dir>0?player.w:-W*0.025);
    var by=player.y+player.h*0.3;
    bubbles.push({
        x:bx,y:by,
        r:W*0.018,
        vx:BUBBLE_SPEED*dir,vy:0,
        age:0,maxAge:3,
        trapped:null,trapTimer:0,
        floating:false,popAnim:0,
        shimmer:Math.random()*Math.PI*2
    });
}

function update(dt){
    if(gameState!=='playing')return;
    if(dt>0.1)dt=0.1;
    gameTime+=dt;

    // Level transition check
    if(levelTransitionTimer>0){
        levelTransitionTimer-=dt;
        if(levelTransitionTimer<=0){
            nextLevel();
        }
        return;
    }

    // Check if all enemies are gone - level clear
    if(enemies.length===0&&levelTransitionTimer<=0){
        // Check no trapped bubbles either
        var anyTrapped=false;
        for(var i=0;i<bubbles.length;i++){
            if(bubbles[i].trapped)anyTrapped=true;
        }
        if(!anyTrapped){
            levelTransitionTimer=1.5;
            addRainbowParticles(W/2,H/2,30);
            return;
        }
    }

    // Combo timer
    if(comboTimer>0){
        comboTimer-=dt;
        if(comboTimer<=0)comboCount=0;
    }

    // Shoot cooldown
    if(shootCooldown>0)shootCooldown-=dt;

    // Invincibility timer
    if(player.invincible>0){
        player.invincible-=dt;
        player.blinkTimer+=dt;
    }

    // Walk animation
    if(Math.abs(player.vx)>10&&player.onGround){
        walkTimer+=dt;
        if(walkTimer>0.12){walkTimer=0;walkFrame=(walkFrame+1)%4;}
    }else{walkFrame=0;}

    // Player physics
    player.vy+=GRAVITY*dt;
    player.x+=player.vx*dt;
    player.y+=player.vy*dt;

    // Wrap-around: fall off bottom, appear at top
    if(player.y>H+player.h){
        player.y=-player.h*2;
        player.vy=50; // gentle downward
    }
    // Wrap-around: go above top
    if(player.y<-player.h*3){
        player.y=-player.h;
    }

    // Wall bounds
    var pw=W*0.92,ox=(W-pw)/2;
    if(player.x<ox)player.x=ox;
    if(player.x+player.w>ox+pw)player.x=ox+pw-player.w;

    applyPlatformCollision(player);

    // Update bubbles
    for(var i=bubbles.length-1;i>=0;i--){
        var b=bubbles[i];
        b.age+=dt;
        b.shimmer+=dt*3;

        if(b.trapped){
            // Floating upward with trapped enemy
            b.vy=BUBBLE_FLOAT_SPEED;
            b.vx*=0.95;
            b.x+=b.vx*dt;
            b.y+=b.vy*dt;
            b.trapTimer+=dt;

            // Move trapped enemy with bubble
            b.trapped.x=b.x-b.trapped.w/2+b.r;
            b.trapped.y=b.y-b.trapped.h/2+b.r;

            // Bounce off walls
            if(b.x-b.r<ox){b.x=ox+b.r;b.vx=Math.abs(b.vx);}
            if(b.x+b.r>ox+pw){b.x=ox+pw-b.r;b.vx=-Math.abs(b.vx);}
            // Bounce off ceiling
            if(b.y-b.r<0){b.y=b.r;b.vy=10;}

            // Enemy breaks free after TRAP_DURATION
            if(b.trapTimer>=TRAP_DURATION){
                var e=b.trapped;
                e.trapped=false;
                e.angry=true;
                e.vx=(e.facingRight?1:-1)*e.angrySpeed;
                addParticles(b.x,b.y,'#ff4444',10);
                bubbles.splice(i,1);
                continue;
            }

            // Player pops the bubble by touching it
            if(player.invincible<=0||true){
                if(rectsOverlap(player.x,player.y,player.w,player.h,
                    b.x-b.r,b.y-b.r,b.r*2,b.r*2)){
                    // Pop! Kill enemy
                    var enemy=b.trapped;
                    var eIdx=-1;
                    for(var ei=0;ei<enemies.length;ei++){
                        if(enemies[ei]===enemy){eIdx=ei;break;}
                    }
                    if(eIdx>=0)enemies.splice(eIdx,1);

                    // Scoring with combo
                    comboCount++;
                    comboTimer=1.0;
                    var pts=100+comboCount*100;
                    if(comboCount>1)pts+=comboCount*50;
                    pts=Math.min(pts,500);
                    score+=pts;

                    // Spawn food
                    spawnFood(b.x,b.y,comboCount-1);

                    // Effects
                    if(comboCount>=3){
                        addRainbowParticles(b.x,b.y,20);
                    }else{
                        addParticles(b.x,b.y,'#88ffff',15);
                    }

                    bubbles.splice(i,1);
                    continue;
                }
            }
        }else{
            // Free bubble - traveling then floating
            if(!b.floating){
                b.x+=b.vx*dt;
                // After traveling a bit, start floating
                if(b.age>0.5){
                    b.floating=true;
                    b.vx*=0.3;
                }
            }else{
                b.vy=BUBBLE_FLOAT_SPEED*0.7;
                b.vx*=0.97;
                b.x+=b.vx*dt;
                b.y+=b.vy*dt;
            }

            // Bounce off walls
            if(b.x-b.r<ox){b.x=ox+b.r;b.vx=Math.abs(b.vx)*0.5;}
            if(b.x+b.r>ox+pw){b.x=ox+pw-b.r;b.vx=-Math.abs(b.vx)*0.5;}
            if(b.y-b.r<0){b.y=b.r;b.vy=10;}

            // Check collision with enemies
            for(var ei=0;ei<enemies.length;ei++){
                var e=enemies[ei];
                if(e.trapped)continue;
                var dist=Math.sqrt((b.x-(e.x+e.w/2))*(b.x-(e.x+e.w/2))+(b.y-(e.y+e.h/2))*(b.y-(e.y+e.h/2)));
                if(dist<b.r+e.w*0.5){
                    // Trap enemy!
                    e.trapped=true;
                    e.vx=0;e.vy=0;
                    b.trapped=e;
                    b.trapTimer=0;
                    b.floating=true;
                    b.vx=(Math.random()-0.5)*30;
                    addParticles(b.x,b.y,'#aaffff',8);
                    break;
                }
            }

            // Player can jump on free bubbles as platforms
            if(!b.trapped&&b.floating){
                var bTop=b.y-b.r;
                var playerFoot=player.y+player.h;
                if(player.vy>=0&&playerFoot>=bTop-4&&playerFoot<=bTop+10&&
                    player.x+player.w>b.x-b.r&&player.x<b.x+b.r){
                    player.y=bTop-player.h;
                    player.vy=JUMP_VEL*0.6; // small bounce
                    // Pop the bubble after bouncing
                    addParticles(b.x,b.y,'#88ddff',6);
                    bubbles.splice(i,1);
                    continue;
                }
            }

            // Remove old bubbles
            if(b.age>b.maxAge){
                addParticles(b.x,b.y,'#88ddff',4);
                bubbles.splice(i,1);
                continue;
            }
        }

        // Remove if off screen top (with buffer)
        if(b.y<-50){
            if(b.trapped){
                var enemy2=b.trapped;
                enemy2.trapped=false;
                enemy2.y=0;enemy2.vy=50;
            }
            bubbles.splice(i,1);
        }
    }

    // Update enemies
    for(var i=0;i<enemies.length;i++){
        var e=enemies[i];
        if(e.trapped)continue;

        // Walk animation
        e.walkTimer+=dt;
        if(e.walkTimer>0.2){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}

        // Gravity
        e.vy+=GRAVITY*dt;

        // Movement
        var speed=e.angry?e.angrySpeed:(40+level*5);
        if(e.vx>0){e.vx=speed;e.facingRight=true;}
        else{e.vx=-speed;e.facingRight=false;}

        e.x+=e.vx*dt;
        e.y+=e.vy*dt;

        // Wall collision for enemies
        if(e.x<ox){e.x=ox;e.vx=Math.abs(e.vx);}
        if(e.x+e.w>ox+pw){e.x=ox+pw-e.w;e.vx=-Math.abs(e.vx);}

        // Wrap-around: enemies fall off bottom, appear at top
        if(e.y>H+e.h){
            e.y=-e.h*2;
            e.vy=50;
        }

        applyPlatformCollision(e);

        // Reverse at platform edges (if on ground)
        if(e.onGround){
            var onPlatform=false;
            for(var pi=0;pi<platforms.length;pi++){
                var p=platforms[pi];
                if(p.isWall)continue;
                // Check if enemy feet are on this platform
                if(Math.abs((e.y+e.h)-p.y)<5&&e.x+e.w>p.x&&e.x<p.x+p.w){
                    onPlatform=true;
                    // Check if about to walk off edge
                    var edgeMargin=e.w*0.3;
                    if(e.vx>0&&e.x+e.w>p.x+p.w-edgeMargin){
                        // Walk off right edge - let them fall
                    }else if(e.vx<0&&e.x<p.x+edgeMargin){
                        // Walk off left edge - let them fall
                    }
                    break;
                }
            }
        }

        // Collision with player
        if(!e.trapped&&player.invincible<=0){
            if(rectsOverlap(player.x+player.w*0.15,player.y+player.h*0.15,
                player.w*0.7,player.h*0.7,
                e.x+e.w*0.1,e.y+e.h*0.1,e.w*0.8,e.h*0.8)){
                killPlayer();
                return;
            }
        }
    }

    // Update foods
    for(var i=foods.length-1;i>=0;i--){
        var f=foods[i];
        f.life-=dt;
        f.bobTimer+=dt*4;
        f.vy+=GRAVITY*0.5*dt;
        f.y+=f.vy*dt;

        // Platform collision for food
        for(var pi=0;pi<platforms.length;pi++){
            var p=platforms[pi];
            if(p.isWall)continue;
            if(f.vy>=0&&f.y+f.h>=p.y&&f.y+f.h<=p.y+p.h+8){
                if(f.x+f.w>p.x&&f.x<p.x+p.w){
                    f.y=p.y-f.h;
                    f.vy=0;
                }
            }
        }

        // Floor collision
        if(f.y+f.h>H-H*0.04){
            f.y=H-H*0.04-f.h;
            f.vy=0;
        }

        // Player collects food
        if(rectsOverlap(player.x,player.y,player.w,player.h,f.x,f.y,f.w,f.h)){
            score+=f.type.points;
            addParticles(f.x+f.w/2,f.y+f.h/2,f.type.color,10);
            foods.splice(i,1);
            continue;
        }

        if(f.life<=0){
            foods.splice(i,1);
        }
    }

    // Update particles
    for(var i=particles.length-1;i>=0;i--){
        var p=particles[i];
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.vy+=200*dt;
        p.life-=dt;p.size*=0.98;
        if(p.life<=0)particles.splice(i,1);
    }
}

// ---- RENDERING ----

function drawPlayer(){
    var px=player.x,py=player.y,pw=player.w,ph=player.h;

    // Blinking when invincible
    if(player.invincible>0&&Math.sin(player.blinkTimer*20)>0)return;

    ctx.save();

    // Body (green dragon - Bub)
    var cx=px+pw/2,cy=py+ph*0.55;
    var bodyR=pw*0.42;

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx,py+ph+2,bodyR*0.8,bodyR*0.2,0,0,Math.PI*2);
    ctx.fill();

    // Body
    ctx.fillStyle='#44dd44';
    ctx.beginPath();
    ctx.ellipse(cx,cy,bodyR,bodyR*1.1,0,0,Math.PI*2);
    ctx.fill();

    // Belly (lighter)
    ctx.fillStyle='#88ff88';
    ctx.beginPath();
    ctx.ellipse(cx,cy+bodyR*0.2,bodyR*0.6,bodyR*0.7,0,0,Math.PI*2);
    ctx.fill();

    // Head (slightly larger circle on top)
    var hx=cx,hy=py+ph*0.22;
    var headR=pw*0.38;
    ctx.fillStyle='#44dd44';
    ctx.beginPath();
    ctx.ellipse(hx,hy,headR,headR*0.9,0,0,Math.PI*2);
    ctx.fill();

    // Eyes (big white circles with black pupils)
    var eyeOff=headR*0.3;
    var eyeR=headR*0.32;
    var dir=player.facingRight?1:-1;

    // Left eye
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.ellipse(hx-eyeOff*0.5,hy-headR*0.1,eyeR,eyeR*1.1,0,0,Math.PI*2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(hx+eyeOff*1.2,hy-headR*0.1,eyeR,eyeR*1.1,0,0,Math.PI*2);
    ctx.fill();

    // Pupils (look in facing direction)
    ctx.fillStyle='#111';
    var pupilOff=eyeR*0.25*dir;
    ctx.beginPath();
    ctx.arc(hx-eyeOff*0.5+pupilOff,hy-headR*0.05,eyeR*0.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx+eyeOff*1.2+pupilOff,hy-headR*0.05,eyeR*0.5,0,Math.PI*2);
    ctx.fill();

    // Tiny highlight in eyes
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.arc(hx-eyeOff*0.5+pupilOff+eyeR*0.15,hy-headR*0.15,eyeR*0.18,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx+eyeOff*1.2+pupilOff+eyeR*0.15,hy-headR*0.15,eyeR*0.18,0,Math.PI*2);
    ctx.fill();

    // Mouth (small smile or open for shooting)
    ctx.strokeStyle='#227722';
    ctx.lineWidth=1.5;
    if(shootCooldown>0.15){
        // Open mouth (shooting)
        ctx.fillStyle='#ff4444';
        ctx.beginPath();
        ctx.ellipse(hx+dir*headR*0.5,hy+headR*0.35,headR*0.2,headR*0.15,0,0,Math.PI*2);
        ctx.fill();
    }else{
        // Smile
        ctx.beginPath();
        ctx.arc(hx,hy+headR*0.25,headR*0.3,0.1*Math.PI,0.9*Math.PI);
        ctx.stroke();
    }

    // Little horns/spikes on top
    ctx.fillStyle='#33bb33';
    var spikeH=headR*0.35;
    ctx.beginPath();
    ctx.moveTo(hx-headR*0.4,hy-headR*0.6);
    ctx.lineTo(hx-headR*0.25,hy-headR*0.6-spikeH);
    ctx.lineTo(hx-headR*0.1,hy-headR*0.55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx+headR*0.1,hy-headR*0.55);
    ctx.lineTo(hx+headR*0.25,hy-headR*0.6-spikeH);
    ctx.lineTo(hx+headR*0.4,hy-headR*0.6);
    ctx.fill();

    // Tiny feet
    var footY2=py+ph-pw*0.08;
    ctx.fillStyle='#33bb33';
    ctx.beginPath();
    ctx.ellipse(cx-bodyR*0.4,footY2,pw*0.12,pw*0.07,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx+bodyR*0.4,footY2,pw*0.12,pw*0.07,0,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
}

function drawEnemy(e){
    if(e.trapped)return; // drawn inside bubble instead
    var ex=e.x,ey=e.y,ew=e.w,eh=e.h;
    var cx=ex+ew/2,cy=ey+eh/2;
    var type=e.type;

    ctx.save();

    // Body shape based on type
    var bodyColor=e.angry?'#ff2200':type.color;

    if(type.bodyShape==='round'){
        // Blob - round body
        ctx.fillStyle=bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx,cy+eh*0.1,ew*0.5,eh*0.45,0,0,Math.PI*2);
        ctx.fill();
        // Wobble feet
        var wobble=Math.sin(e.walkTimer*15)*ew*0.08;
        ctx.beginPath();
        ctx.ellipse(cx-ew*0.25+wobble,ey+eh,ew*0.15,eh*0.08,0,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx+ew*0.25-wobble,ey+eh,ew*0.15,eh*0.08,0,0,Math.PI*2);
        ctx.fill();
    }else if(type.bodyShape==='square'){
        // Skull - boxy body
        ctx.fillStyle=bodyColor;
        ctx.beginPath();
        ctx.roundRect(ex+ew*0.08,ey+eh*0.15,ew*0.84,eh*0.75,ew*0.1);
        ctx.fill();
        // Jagged bottom edge
        ctx.beginPath();
        for(var j=0;j<4;j++){
            var tx=ex+ew*0.15+j*ew*0.22;
            ctx.moveTo(tx,ey+eh*0.8);
            ctx.lineTo(tx+ew*0.11,ey+eh);
            ctx.lineTo(tx+ew*0.22,ey+eh*0.8);
        }
        ctx.fillStyle=bodyColor;ctx.fill();
    }else if(type.bodyShape==='diamond'){
        // Fish - diamond shape
        ctx.fillStyle=bodyColor;
        ctx.beginPath();
        ctx.moveTo(cx,ey+eh*0.1);
        ctx.lineTo(cx+ew*0.5,cy);
        ctx.lineTo(cx,ey+eh*0.9);
        ctx.lineTo(cx-ew*0.5,cy);
        ctx.closePath();ctx.fill();
        // Tail
        var tailDir=e.facingRight?-1:1;
        ctx.beginPath();
        ctx.moveTo(cx+tailDir*ew*0.45,cy-eh*0.15);
        ctx.lineTo(cx+tailDir*ew*0.7,cy-eh*0.3);
        ctx.lineTo(cx+tailDir*ew*0.7,cy+eh*0.3);
        ctx.lineTo(cx+tailDir*ew*0.45,cy+eh*0.15);
        ctx.fill();
    }else{
        // Ghost - triangle body
        ctx.fillStyle=bodyColor;
        ctx.beginPath();
        ctx.moveTo(cx,ey);
        ctx.lineTo(cx+ew*0.5,ey+eh*0.7);
        // Wavy bottom
        ctx.lineTo(cx+ew*0.35,ey+eh*0.55);
        ctx.lineTo(cx+ew*0.15,ey+eh*0.7);
        ctx.lineTo(cx,ey+eh*0.55);
        ctx.lineTo(cx-ew*0.15,ey+eh*0.7);
        ctx.lineTo(cx-ew*0.35,ey+eh*0.55);
        ctx.lineTo(cx-ew*0.5,ey+eh*0.7);
        ctx.closePath();ctx.fill();
    }

    // Eyes (all enemies get cute eyes)
    var eyeY=cy-eh*0.1;
    var eyeSpacing=ew*0.18;
    var eyeR=ew*0.12;
    ctx.fillStyle=type.eyeColor;
    ctx.beginPath();ctx.arc(cx-eyeSpacing,eyeY,eyeR,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+eyeSpacing,eyeY,eyeR,0,Math.PI*2);ctx.fill();
    // Pupils
    ctx.fillStyle='#111';
    var pDir=e.facingRight?1:-1;
    ctx.beginPath();ctx.arc(cx-eyeSpacing+pDir*eyeR*0.3,eyeY,eyeR*0.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+eyeSpacing+pDir*eyeR*0.3,eyeY,eyeR*0.5,0,Math.PI*2);ctx.fill();

    // Angry indicator
    if(e.angry){
        ctx.strokeStyle='#ff0000';ctx.lineWidth=2;
        // Angry eyebrows
        ctx.beginPath();
        ctx.moveTo(cx-eyeSpacing-eyeR,eyeY-eyeR*1.5);
        ctx.lineTo(cx-eyeSpacing+eyeR,eyeY-eyeR*0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx+eyeSpacing+eyeR,eyeY-eyeR*1.5);
        ctx.lineTo(cx+eyeSpacing-eyeR,eyeY-eyeR*0.8);
        ctx.stroke();
    }

    ctx.restore();
}

function drawTrappedEnemy(b){
    if(!b.trapped)return;
    var e=b.trapped;
    var cx=b.x,cy=b.y;
    var sz=b.r*0.8;

    ctx.save();
    ctx.globalAlpha=0.8;

    // Miniature enemy inside bubble
    var type=e.type;
    ctx.fillStyle=type.color;
    if(type.bodyShape==='round'){
        ctx.beginPath();ctx.ellipse(cx,cy,sz*0.6,sz*0.5,0,0,Math.PI*2);ctx.fill();
    }else if(type.bodyShape==='square'){
        ctx.fillRect(cx-sz*0.4,cy-sz*0.4,sz*0.8,sz*0.8);
    }else if(type.bodyShape==='diamond'){
        ctx.beginPath();
        ctx.moveTo(cx,cy-sz*0.5);ctx.lineTo(cx+sz*0.4,cy);
        ctx.lineTo(cx,cy+sz*0.5);ctx.lineTo(cx-sz*0.4,cy);
        ctx.closePath();ctx.fill();
    }else{
        ctx.beginPath();
        ctx.moveTo(cx,cy-sz*0.5);ctx.lineTo(cx+sz*0.4,cy+sz*0.3);
        ctx.lineTo(cx-sz*0.4,cy+sz*0.3);ctx.closePath();ctx.fill();
    }
    // Tiny eyes
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(cx-sz*0.15,cy-sz*0.1,sz*0.1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+sz*0.15,cy-sz*0.1,sz*0.1,0,Math.PI*2);ctx.fill();

    ctx.globalAlpha=1;
    ctx.restore();
}

function drawBubble(b){
    ctx.save();

    var shimmerVal=Math.sin(b.shimmer)*0.15+0.15;

    // Outer glow
    ctx.globalAlpha=0.3;
    ctx.fillStyle='#88ddff';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.2,0,Math.PI*2);ctx.fill();

    // Main bubble - translucent
    ctx.globalAlpha=b.trapped?0.5:0.35;
    ctx.fillStyle=b.trapped?'#aaffaa':'#aaeeff';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();

    // Border
    ctx.globalAlpha=0.6;
    ctx.strokeStyle=b.trapped?'#44ff44':'#66ccff';
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.stroke();

    // Shine highlight (crescent)
    ctx.globalAlpha=0.5+shimmerVal;
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.3,0,Math.PI*2);
    ctx.fill();

    // Small secondary highlight
    ctx.globalAlpha=0.3+shimmerVal*0.5;
    ctx.beginPath();
    ctx.arc(b.x+b.r*0.25,b.y+b.r*0.2,b.r*0.12,0,Math.PI*2);
    ctx.fill();

    ctx.globalAlpha=1;

    // Draw trapped enemy inside
    if(b.trapped){
        drawTrappedEnemy(b);

        // Trap timer warning - bubble flashes when about to pop
        if(b.trapTimer>TRAP_DURATION*0.7){
            var flash=Math.sin(b.trapTimer*15)*0.3;
            ctx.globalAlpha=Math.abs(flash);
            ctx.strokeStyle='#ff4444';
            ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(b.x,b.y,b.r+2,0,Math.PI*2);ctx.stroke();
            ctx.globalAlpha=1;
        }
    }

    ctx.restore();
}

function drawFood(f){
    ctx.save();
    var fx=f.x,fy=f.y,fw=f.w,fh=f.h;
    var cx=fx+fw/2,cy=fy+fh/2;
    var bob=Math.sin(f.bobTimer)*2;
    cy+=bob;

    // Fade out when life is low
    if(f.life<1)ctx.globalAlpha=f.life;

    var type=f.type;
    if(type.name==='cherry'){
        // Red cherry with stem
        ctx.fillStyle='#ff2244';
        ctx.beginPath();ctx.arc(cx-fw*0.15,cy+fh*0.1,fw*0.3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(cx+fw*0.2,cy+fh*0.15,fw*0.28,0,Math.PI*2);ctx.fill();
        // Stem
        ctx.strokeStyle='#22aa22';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(cx-fw*0.1,cy-fh*0.15);
        ctx.quadraticCurveTo(cx,cy-fh*0.45,cx+fw*0.2,cy-fh*0.1);
        ctx.stroke();
        // Highlight
        ctx.fillStyle='rgba(255,255,255,0.5)';
        ctx.beginPath();ctx.arc(cx-fw*0.2,cy-fh*0.02,fw*0.08,0,Math.PI*2);ctx.fill();
    }else if(type.name==='banana'){
        // Yellow banana
        ctx.fillStyle='#ffdd00';
        ctx.beginPath();
        ctx.ellipse(cx,cy,fw*0.4,fh*0.2,0.3,0,Math.PI);
        ctx.fill();
        ctx.fillStyle='#ffee44';
        ctx.beginPath();
        ctx.ellipse(cx,cy-fh*0.05,fw*0.35,fh*0.12,0.3,0,Math.PI);
        ctx.fill();
        // Brown tip
        ctx.fillStyle='#886600';
        ctx.beginPath();ctx.arc(cx+fw*0.35,cy+fh*0.05,fw*0.06,0,Math.PI*2);ctx.fill();
    }else if(type.name==='cake'){
        // Pink cake
        ctx.fillStyle='#ff88cc';
        ctx.fillRect(cx-fw*0.3,cy-fh*0.1,fw*0.6,fh*0.4);
        // Frosting top
        ctx.fillStyle='#ffaadd';
        ctx.beginPath();
        ctx.ellipse(cx,cy-fh*0.1,fw*0.35,fh*0.15,0,Math.PI,Math.PI*2);
        ctx.fill();
        ctx.fillRect(cx-fw*0.35,cy-fh*0.1,fw*0.7,fh*0.1);
        // Cherry on top
        ctx.fillStyle='#ff2244';
        ctx.beginPath();ctx.arc(cx,cy-fh*0.25,fw*0.1,0,Math.PI*2);ctx.fill();
    }else{
        // Diamond
        ctx.fillStyle='#00ffff';
        ctx.beginPath();
        ctx.moveTo(cx,cy-fh*0.4);
        ctx.lineTo(cx+fw*0.35,cy);
        ctx.lineTo(cx,cy+fh*0.4);
        ctx.lineTo(cx-fw*0.35,cy);
        ctx.closePath();ctx.fill();
        // Inner shine
        ctx.fillStyle='rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(cx,cy-fh*0.2);
        ctx.lineTo(cx+fw*0.15,cy);
        ctx.lineTo(cx,cy+fh*0.2);
        ctx.lineTo(cx-fw*0.15,cy);
        ctx.closePath();ctx.fill();
    }

    // Point value label
    ctx.fillStyle='#fff';
    ctx.font='bold '+Math.round(W*0.014)+'px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText(type.points+'',cx,fy-4+bob);

    ctx.globalAlpha=1;
    ctx.restore();
}

function drawPlatforms(){
    for(var i=0;i<platforms.length;i++){
        var p=platforms[i];
        if(p.isWall){
            // Draw wall bricks
            ctx.fillStyle=p.color;
            var brickH=H*0.025;
            var brickW=p.w;
            for(var by=0;by<H;by+=brickH){
                ctx.fillStyle=p.color;
                ctx.fillRect(p.x,by,brickW,brickH-1);
                ctx.fillStyle='rgba(0,0,0,0.3)';
                ctx.fillRect(p.x,by+brickH-1,brickW,1);
            }
            continue;
        }

        // Platform blocks
        var blockW=W*0.025;
        var numBlocks=Math.ceil(p.w/blockW);
        for(var j=0;j<numBlocks;j++){
            var bx=p.x+j*blockW;
            var bw=Math.min(blockW,p.x+p.w-bx);
            // Alternating block colors
            var lightness=((i+j)%2===0)?1:0.85;
            ctx.fillStyle=p.color;
            ctx.globalAlpha=lightness;
            ctx.fillRect(bx,p.y,bw-1,p.h);
            // Block highlight
            ctx.fillStyle='rgba(255,255,255,0.2)';
            ctx.fillRect(bx,p.y,bw-1,p.h*0.4);
            // Block shadow
            ctx.fillStyle='rgba(0,0,0,0.2)';
            ctx.fillRect(bx,p.y+p.h*0.7,bw-1,p.h*0.3);
            ctx.globalAlpha=1;
        }
    }
}

function render(){
    // Dark background with subtle pattern
    ctx.fillStyle='#0a0a1e';
    ctx.fillRect(0,0,W,H);

    // Background stars
    ctx.fillStyle='rgba(255,255,255,0.15)';
    for(var i=0;i<30;i++){
        var sx=((i*137+53)%1000)/1000*W;
        var sy=((i*241+89)%1000)/1000*H;
        var ss=1+((i*71)%3);
        var twinkle=0.3+0.7*Math.abs(Math.sin(gameTime*2+i*0.7));
        ctx.globalAlpha=0.15*twinkle;
        ctx.fillRect(sx,sy,ss,ss);
    }
    ctx.globalAlpha=1;

    // Platforms
    drawPlatforms();

    // Foods
    for(var i=0;i<foods.length;i++)drawFood(foods[i]);

    // Free bubbles (behind enemies)
    for(var i=0;i<bubbles.length;i++){
        if(!bubbles[i].trapped)drawBubble(bubbles[i]);
    }

    // Enemies
    for(var i=0;i<enemies.length;i++)drawEnemy(enemies[i]);

    // Trapped bubbles (in front)
    for(var i=0;i<bubbles.length;i++){
        if(bubbles[i].trapped)drawBubble(bubbles[i]);
    }

    // Player
    drawPlayer();

    // Particles
    for(var i=0;i<particles.length;i++){
        var p=particles[i];
        ctx.globalAlpha=Math.max(0,p.life);
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Lives display
    var lifeSize=W*0.018;
    for(var i=0;i<lives;i++){
        var lx=W*0.02+i*(lifeSize*2.5);
        var ly=H-lifeSize*2;
        ctx.fillStyle='#44dd44';
        ctx.beginPath();ctx.ellipse(lx+lifeSize,ly+lifeSize,lifeSize,lifeSize*0.9,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(lx+lifeSize*0.7,ly+lifeSize*0.7,lifeSize*0.2,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(lx+lifeSize*1.3,ly+lifeSize*0.7,lifeSize*0.2,0,Math.PI*2);ctx.fill();
    }

    // Level indicator
    ctx.fillStyle='#aaaacc';
    ctx.font=Math.round(W*0.018)+'px "Courier New",monospace';
    ctx.textAlign='right';
    ctx.fillText('LEVEL '+level,W*0.98,H-W*0.015);
    ctx.textAlign='left';

    // Level transition overlay
    if(levelTransitionTimer>0){
        ctx.save();
        ctx.textAlign='center';
        var alpha=Math.min(1,levelTransitionTimer);
        ctx.globalAlpha=alpha;
        ctx.fillStyle='rgba(0,0,0,0.4)';
        ctx.fillRect(0,0,W,H);
        ctx.shadowColor='#00ff88';ctx.shadowBlur=20;
        ctx.font='bold '+Math.round(W*0.05)+'px "Courier New",monospace';
        ctx.fillStyle='#00ff88';
        ctx.fillText('LEVEL CLEAR!',W/2,H/2);
        ctx.shadowBlur=0;ctx.globalAlpha=1;
        ctx.restore();
    }

    // Combo display
    if(comboCount>=2&&comboTimer>0){
        ctx.save();ctx.textAlign='center';
        ctx.globalAlpha=Math.min(1,comboTimer*2);
        ctx.font='bold '+Math.round(W*0.035)+'px "Courier New",monospace';
        var rainbow=['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#ff00ff'];
        ctx.fillStyle=rainbow[Math.floor(gameTime*8)%rainbow.length];
        ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;
        ctx.fillText(comboCount+'x COMBO!',W/2,H*0.15);
        ctx.shadowBlur=0;ctx.globalAlpha=1;
        ctx.restore();
    }
}

function drawTitle(dt){
    ctx.fillStyle='#0a0a1e';ctx.fillRect(0,0,W,H);
    titlePulse+=dt*3;
    ctx.save();ctx.textAlign='center';

    // Floating bubbles in background
    for(var i=0;i<12;i++){
        var bx=W*0.1+((i*137+53)%800)/800*W*0.8;
        var by=H*0.9-((gameTime*30+i*67)%Math.floor(H))|0;
        var br=8+i*2;
        ctx.globalAlpha=0.15+0.1*Math.sin(titlePulse+i);
        ctx.strokeStyle='#66ccff';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='rgba(150,220,255,0.1)';ctx.fill();
        // Shine
        ctx.fillStyle='rgba(255,255,255,0.3)';
        ctx.beginPath();ctx.arc(bx-br*0.3,by-br*0.3,br*0.25,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Little dragon mascot
    var dx=W/2,dy=H*0.10;
    var ds=W*0.04;
    // Body
    ctx.fillStyle='#44dd44';
    ctx.beginPath();ctx.ellipse(dx,dy+ds*0.5,ds*0.7,ds*0.8,0,0,Math.PI*2);ctx.fill();
    // Belly
    ctx.fillStyle='#88ff88';
    ctx.beginPath();ctx.ellipse(dx,dy+ds*0.65,ds*0.4,ds*0.5,0,0,Math.PI*2);ctx.fill();
    // Head
    ctx.fillStyle='#44dd44';
    ctx.beginPath();ctx.ellipse(dx,dy-ds*0.2,ds*0.55,ds*0.45,0,0,Math.PI*2);ctx.fill();
    // Eyes
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(dx-ds*0.2,dy-ds*0.25,ds*0.18,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(dx+ds*0.2,dy-ds*0.25,ds*0.18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(dx-ds*0.17,dy-ds*0.22,ds*0.09,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(dx+ds*0.23,dy-ds*0.22,ds*0.09,0,Math.PI*2);ctx.fill();
    // Spikes
    ctx.fillStyle='#33bb33';
    ctx.beginPath();ctx.moveTo(dx-ds*0.3,dy-ds*0.5);ctx.lineTo(dx-ds*0.15,dy-ds*0.8);ctx.lineTo(dx,dy-ds*0.5);ctx.fill();
    ctx.beginPath();ctx.moveTo(dx,dy-ds*0.5);ctx.lineTo(dx+ds*0.15,dy-ds*0.8);ctx.lineTo(dx+ds*0.3,dy-ds*0.5);ctx.fill();

    // Title
    ctx.shadowColor='#00ccff';ctx.shadowBlur=20+Math.sin(titlePulse)*8;
    ctx.font='bold '+Math.round(W*0.065)+'px "Courier New",monospace';
    ctx.fillStyle='#00ccff';ctx.fillText('BUBBLE BOBBLE',W/2,H*0.27);
    ctx.shadowBlur=0;

    // Subtitle
    var fs=Math.max(10,Math.round(W*0.02));
    ctx.font='bold '+fs+'px "Courier New",monospace';
    ctx.fillStyle='#88ff88';ctx.fillText('Pop bubbles, save the day!',W/2,H*0.35);

    // Instructions
    ctx.font=fs+'px "Courier New",monospace';
    ctx.fillStyle='#ff8844';ctx.fillText('Shoot bubbles to trap enemies',W/2,H*0.43);
    ctx.fillStyle='#66aaff';ctx.fillText('Pop trapped enemies by touching them',W/2,H*0.50);
    ctx.fillStyle='#ffcc00';ctx.fillText('Collect food for bonus points',W/2,H*0.57);
    ctx.fillStyle='#ff69b4';ctx.fillText('Jump on bubbles to reach higher!',W/2,H*0.64);

    // Controls
    ctx.fillStyle='#aaa';ctx.font=Math.round(W*0.016)+'px "Courier New",monospace';
    ctx.fillText('Arrow keys / A-D to move, Up/W/Space to jump, Down/S to shoot',W/2,H*0.73);

    // Scoring info
    ctx.fillStyle='#888';ctx.font=Math.round(W*0.014)+'px "Courier New",monospace';
    ctx.fillText('100-500 pts per enemy | Combo bonus for multiple pops!',W/2,H*0.80);

    // Start prompt
    var a=0.5+0.5*Math.sin(titlePulse*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.font=Math.round(W*0.022)+'px "Courier New",monospace';
    ctx.fillText('PRESS ENTER, TAB, OR TAP TO START',W/2,H*0.90);

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
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' '){if(down)keys.jump=true;}
    if(!down&&(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' '))keys.jump=false;
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){if(down)keys.shoot=true;}
    if(!down&&(e.key==='ArrowDown'||e.key==='s'||e.key==='S'))keys.shoot=false;
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

window.initBubbleBobble=function(){
    canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);resize();
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    keys={left:false,right:false,jump:false,shoot:false};
    bindMobile('btn-left',function(d){keys.left=d;});
    bindMobile('btn-right',function(d){keys.right=d;});
    bindMobile('btn-up',function(d){if(d)keys.jump=true;else keys.jump=false;});
    canvas.addEventListener('click',function(){if(gameState!=='playing')resetGame();});
    gameState='title';titlePulse=0;lastTs=performance.now();animId=requestAnimationFrame(gameLoop);
};

window.stopBubbleBobble=function(){
    if(animId){cancelAnimationFrame(animId);animId=null;}
    document.removeEventListener('keydown',kd);
    document.removeEventListener('keyup',ku);
    window.removeEventListener('resize',resize);
    keys={};gameState='title';
};
})();
