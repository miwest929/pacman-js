// =========================== BEGIN SpriteRepository ======================
class Tile {
  constructor(sprite, startX, startY, tileWidth, tileHeight) {
    this.sprite = sprite;
    this.startX = startX;
    this.startY = startY;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  renderAt(context, x, y) {
    context.drawImage(
      this.sprite,
      this.startX,
      this.startY,
      this.tileWidth,
      this.tileHeight,
      x,
      y,
      32,//this.tileWidth,
      32//this.tileHeight
    );
  }
}

class Sprite {
  constructor() {
    this.loaded = false;
    this.image = this.createImageObject();
  }

  asTiles(startX, startY, tileWidth, tileHeight, paddingPx) {
    let tiles = [];
    let curX = startX;
    let curY = startY;

    /*
    img  Specifies the image, canvas, or video element to use
    sx  Optional. The x coordinate where to start clipping
    sy  Optional. The y coordinate where to start clipping
    swidth  Optional. The width of the clipped image
    sheight Optional. The height of the clipped image
    */
    let yIncrement = tileHeight + paddingPx;
    let xIncrement = tileWidth + paddingPx;
    for(; curY < (startY + this.image.height); curY += yIncrement) {
      for(; curX < (startX + this.image.width); curX += xIncrement) {
        tiles.push( new Tile(this.image, curX, curY, tileWidth, tileHeight) );
      }

      curX = startX;
    }

    return tiles;
  }

  createImageObject() {
    let img = new Image();
    img.onload = () => {
      console.log(`Successfully loaded '${img.src}'`);
      this.loaded = true;
    };
    img.onerror = () => {
      console.log(`Failed to load '${img.src}'`);
      this.loaded = true;
    };

    return img;
  }
}

class SpriteRepository {
  constructor(spritePaths) {
    this.sprites = [];

    spritePaths.forEach((path) => {
      let spriteKey = this.extractName(path);
      this.sprites[spriteKey] = new Sprite();
      this.sprites[spriteKey].image.src = path;
    });
  }

  fetch(key) {
    return this.sprites[key];
  }

  extractName(path) {
    if (path[0] === '.' )
      path = path.slice(1);

    return ( path.split('.')[0].split('/').pop() );
  }
}
// =============================== END SpriteRepository ====================

// ============================== BEGIN Grid =============================
class Grid {
  constructor(gridTiles) {
    this.tiles = {
      "ULC": gridTiles[6],    // upper left corner
      "HTA": gridTiles[7],   // horizontal top aligned
      "URC": gridTiles[21],  // upper right corner
      "VLA": gridTiles[36],  // vertical left aligned
      "VRA": gridTiles[51],  // vertical right aligned
      "BNK": gridTiles[5],   // blank
      "SLR": gridTiles[68],  // small lower right corner
      "SLL": gridTiles[69],  // small lower left corner
      "MHL": gridTiles[73],  // middle horizontal line
      "RVL": gridTiles[98],  // right vertical line
      "LVL": gridTiles[99],  // left vertical line
      "SUR": gridTiles[101],  // small upper right corner
      "UHL": gridTiles[102], // upper horizontal line
      "SUL": gridTiles[106],   // small upper left corner
      "LLC": gridTiles[930],   // lower left corner
      "LRC": gridTiles[957],   // lower right corner
      "HBA": gridTiles[931],   // horizontal bottom aligned
    }

    this.grid = [
      ["BNK", "ULC", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "HTA", "URC", "BNK"],
      ["BNK", "VLA", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "VRA", "BNK"],
      ["BNK", "VLA", "BNK", "SLR", "SLL", "BNK", "SLR", "MHL", "MHL", "MHL", "MHL", "MHL", "SLL", "BNK", "SLR", "SLL", "BNK", "VRA", "BNK"],
      ["BNK", "VLA", "BNK", "LVL", "RVL", "BNK", "LVL", "BNK", "BNK", "BNK", "BNK", "BNK", "RVL", "BNK", "LVL", "RVL", "BNK", "VRA", "BNK"],
      ["BNK", "VLA", "BNK", "LVL", "RVL", "BNK", "LVL", "BNK", "BNK", "BNK", "BNK", "BNK", "RVL", "BNK", "LVL", "RVL", "BNK", "VRA", "BNK"],
      ["BNK", "VLA", "BNK", "SUR", "SUL", "BNK", "SUR", "UHL", "UHL", "UHL", "UHL", "UHL", "SUL", "BNK", "SUR", "SUL", "BNK", "VRA", "BNK"],
      ["BNK", "VLA", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "BNK", "VRA", "BNK"],
      ["BNK", "LLC", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "HBA", "LRC", "BNK"],
    ];
  }

  render(context) {
    let startX = 0, startY = 0;
    let currX = startX, currY = startY;
    let tileWidth = 32, tileHeight = 32;

    this.grid.forEach((row) => {
      row.forEach((tile) => {
        this.tiles[tile].renderAt(ctx, currX, currY);

        currX += tileWidth;
      });

      currX = startX;
      currY += tileHeight;
    });
  }
}
// ============================== END Grid ===============================

// ============================== BEGIN Player ===========================
const DirectionState = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT"
};

class Frame {
  constructor(tiles, renderFn) {
    this.tiles = tiles;
    this.renderFn = renderFn;
  }

  render(context, x, y) {
    this.renderFn(this.tiles, context, x, y);
  }
}

class Animation {
  constructor(frames) {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.ANIMATION_COMPLETED = -1;
    this.currentTimer = null;
  }

  playOnce(speed) {
    this.currentTimer = setInterval(() => {
      this.currentFrameIndex += 1;

      if (this.currentFrameIndex === this.frames.length) {
        this.currentFrameIndex = this.ANIMATION_COMPLETED;
      }
    }, speed);
  }

  playLoop(speed) {
    this.currentTimer = setInterval(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }, speed);
  }

  stop() {
    if (this.currentTimer) {
      window.clearInterval(this.currentTimer);
      this.currentTimer = null;
      this.currentFrameIndex = this.ANIMATION_COMPLETED;
    }
  }

  render(context, x, y) {
    if (this.currentFrameIndex !== this.ANIMATION_COMPLETED) {
      this.frames[this.currentFrameIndex].render(context, x, y);
    }
  }
}

class Player {
  constructor(tiles, x, y) {
    let renderFn = (tiles, context, x, y) => {
      tiles[0].renderAt(context, x, y);
      tiles[1].renderAt(context, x + 32, y);
      tiles[2].renderAt(context, x, y + 32);
      tiles[3].renderAt(context, x + 32, y + 32);
    };

    let leftOpen = new Frame([tiles[192], tiles[193], tiles[224], tiles[225]], renderFn);
    let leftClose = new Frame([tiles[196], tiles[197], tiles[228], tiles[229]], renderFn);
    this.leftAnim = new Animation([leftOpen, leftClose]);

    let rightOpen = new Frame([tiles[200], tiles[201], tiles[232], tiles[233]], renderFn);
    let rightClose = new Frame([tiles[204], tiles[205], tiles[236], tiles[237]], renderFn);
    this.rightAnim = new Animation([rightOpen, rightClose]);

    let upOpen = new Frame([tiles[194], tiles[195], tiles[226], tiles[227]], renderFn);
    let upClose = new Frame([tiles[198], tiles[199], tiles[230], tiles[231]], renderFn);
    this.upAnim = new Animation([upOpen, upClose]);

    let downOpen = new Frame([tiles[202], tiles[203], tiles[234], tiles[235]], renderFn);
    let downClose = new Frame([tiles[206], tiles[207], tiles[238], tiles[239]], renderFn);
    this.downAnim = new Animation([downOpen, downClose]);

    this.x = x;
    this.y = y;
    this.moveX = 0;
    this.moveY = 0;

    this.right();
  }

  left() {
    if (this.animation) {
      this.animation.stop();
    }

    this.directionState = DirectionState.LEFT;
    this.animation = this.leftAnim;
    this.animation.playLoop(125);

    this.moveX = -10;
    this.moveY = 0;
  }

  right() {
    if (this.animation) {
      this.animation.stop();
    }

    this.directionState = DirectionState.RIGHT;
    this.animation = this.rightAnim;
    this.animation.playLoop(125);

    this.moveX = 10;
    this.moveY = 0;
  }

  up() {
    if (this.animation) {
      this.animation.stop();
    }

    this.directionState = DirectionState.UP;
    this.animation = this.upAnim;
    this.animation.playLoop(125);

    this.moveX = 0;
    this.moveY = -10;
  }

  down() {
    if (this.animation) {
      this.animation.stop();
    }

    this.directionState = DirectionState.DOWN;
    this.animation = this.downAnim;
    this.animation.playLoop(125);

    this.moveX = 0;
    this.moveY = 10;
  }

  update() {
   this.x += this.moveX;
   this.y += this.moveY;
  }

  render(context) {
    this.animation.render(context, this.x, this.y);
  }
}
// ============================== END Player ===========================

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.scale(0.5, 0.5);

let centerX = (canvas.width / 2);
let centerY = (canvas.height / 2);
let index = 0;
let debug = {
  collision: false
};

// TODO: Make this configurable
debug.collision = false;

let spritesRepo = new SpriteRepository([
  'src/img/grid.png',
  'src/img/sprites.png'
]);

// 216 = 47 + 6x
// 23 + 6(32 + 4)
let gridTiles = spritesRepo.fetch("grid").asTiles(24, 24, 32, 32, 4);
let grid = new Grid(gridTiles);

let generalSprites = spritesRepo.fetch("sprites").asTiles(1, 1, 47, 47, 1);
let player = new Player(generalSprites, 700, 100);

let keys = {}
let processKeyDownEvent = (e) => {
  e = e || window.event;
  e.preventDefault();

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
  if (e.keyCode == '38') { e.preventDefault(); keys['up'] = false; }
   // down arrow
  else if (e.keyCode == '40') { e.preventDefault(); keys['down'] = false; }
  // left arrow
  else if (e.keyCode == '37') { e.preventDefault(); keys['left'] = false; }
  // right arrow
  else if (e.keyCode == '39') { e.preventDefault(); keys['right'] = false; }
};
document.onkeyup = processKeyUpEvent;

let renderBackground = () => {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};


let update = () => {
  player.update();

  if (keys['up']) {
    player.up();
  }
  else if (keys['down']) {
    player.down();
  }
  else if (keys['left']) {
    player.left();
  }
  else if (keys['right']) {
    player.right();
  }
}

let render = () => {
  renderBackground();
  grid.render(ctx);
  player.render(ctx);
}

let prevTime = performance.now();
let main = () => {
  let currentTime = performance.now();
  let fps = 1000 / (currentTime - prevTime);
  prevTime = currentTime;

  console.log(fps);

  update();
  render();

  window.requestAnimationFrame(main);
}

main();
