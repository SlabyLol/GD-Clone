
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let mode = "play";

const player = {
  x:100,
  y:300,
  w:30,
  h:30,
  vy:0,
  grounded:false
};

let cameraX = 0;
let gravity = 0.8;
let speed = 4;

let level = {
  blocks:[
    {x:0,y:360,w:2000,h:40},
    {x:400,y:300,w:60,h:60},
    {x:650,y:250,w:60,h:110}
  ]
};

document.getElementById("playBtn").onclick=()=>mode="play";
document.getElementById("editBtn").onclick=()=>mode="edit";

document.getElementById("saveBtn").onclick=()=>{
  const blob = new Blob([JSON.stringify(level,null,2)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "level.lmgd";
  a.click();
};

document.getElementById("loadInput").addEventListener("change",(e)=>{
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = ()=>{
    level = JSON.parse(reader.result);
  };

  reader.readAsText(file);
});

canvas.addEventListener("click",(e)=>{
  if(mode !== "edit") return;

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left + cameraX;
  const y = e.clientY - rect.top;

  level.blocks.push({
    x:Math.floor(x/40)*40,
    y:Math.floor(y/40)*40,
    w:40,
    h:40
  });
});

window.addEventListener("keydown",(e)=>{
  if(e.code==="Space" && player.grounded && mode==="play"){
    player.vy = -12;
    player.grounded=false;
  }
});

function resetPlayer(){
  player.x=100;
  player.y=300;
  player.vy=0;
  cameraX=0;
}

function collide(a,b){
  return a.x < b.x+b.w &&
         a.x+a.w > b.x &&
         a.y < b.y+b.h &&
         a.y+a.h > b.y;
}

function update(){
  if(mode==="play"){
    player.vy += gravity;
    player.y += player.vy;
    player.x += speed;

    player.grounded=false;

    for(const block of level.blocks){
      if(collide(player,block)){
        if(player.vy > 0){
          player.y = block.y - player.h;
          player.vy = 0;
          player.grounded = true;
        } else {
          resetPlayer();
        }
      }
    }

    cameraX = player.x - 150;

    if(player.y > canvas.height){
      resetPlayer();
    }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.translate(-cameraX,0);

  for(const block of level.blocks){
    ctx.fillStyle="#00ffff";
    ctx.fillRect(block.x,block.y,block.w,block.h);
  }

  ctx.fillStyle="#00ff00";
  ctx.fillRect(player.x,player.y,player.w,player.h);

  ctx.restore();

  ctx.fillStyle="white";
  ctx.fillText("Mode: " + mode,10,20);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
