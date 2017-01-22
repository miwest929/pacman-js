let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let centerX = (canvas.width / 2);
let centerY = (canvas.height / 2);
let index = 0;
let debug = {
  collision: false
};

// TODO: Make this configurable
debug.collision = false;

let spritesRepo = new SpriteRepository([
  'src/img/sprites.png'
]);

let tiles = spritesRepo.fetch("sprites").asTiles(0, 0, 47, 47);
let keys = {}
let processKeyDownEvent = (e) => {
  e = e || window.event;

  // up arrow
  if (e.keyCode == '38') { keys['up'] = true; }
  // down arrow
  else if (e.keyCode == '40') { keys['down'] = true; }
  // left arrow
  else if (e.keyCode == '37') { keys['left'] = true; }
  // right arrow
  else if (e.keyCode == '39') { keys['right'] = true; }
};
document.onkeydown = processKeyDownEvent;

let processKeyUpEvent = (e) => {
  e = e || window.event;

   // up arrow
  if (e.keyCode == '38') { keys['up'] = false; }
   // down arrow
  else if (e.keyCode == '40') { keys['down'] = false; }
  // left arrow
  else if (e.keyCode == '37') { keys['left'] = false; }
  // right arrow
  else if (e.keyCode == '39') { keys['right'] = false; }
};
document.onkeyup = processKeyUpEvent;

let renderBackground = () => {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

setInterval(() => {
  renderBackground();

  tiles[0].renderAt(ctx, 0, 0);
  tiles[1].renderAt(ctx, 47, 0);

  if (keys['up']) {
  }
  else if (keys['down']) {
  }
  else if (keys['left']) {
  }
  else if (keys['right']) {
  }
}, 100);
