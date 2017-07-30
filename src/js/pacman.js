// =========================== BEGIN SpriteRepository ======================
class GameManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.objects = {};
  }

  register(gameObject, key) {
    this.objects[key] = gameObject;
  }

  renderWorld(ctx) {
    for (let key in this.objects) {
      let object = this.objects[key];
      object.render(ctx);
    }
  }

  // 'velocity' argument is for gameObjectOne.
  checkForCollision(gameObjectOneKey, gameObjectTwoKey, velocity) {
    let gameObjectOne = this.objects[gameObjectOneKey];
    let gameObjectTwo = this.objects[gameObjectTwoKey];

    if (!(gameObjectOne && gameObjectTwo)) {
      console.log(`[checkForCollision] Warning: Game object with key of either '${gameObjectOneKey}' or '${gameObjectTwoKey} does not exist.'`);
      return;
    }

    let bbOne = gameObjectOne.boundingBox(); // must be a scalar

    if (bbOne.constructor !== BoundingBox) {
      console.log("[checkForCollision] Warning: bbOne must be an instance of BoundingBox.");
      return;
    }

    // Take current velocity into account when checking for collisions.
    bbOne.offsetBy(velocity);

    let bbTwo = gameObjectTwo.boundingBox(); // can be an array of BoundingBox

    let bbTwoArr;
    if (bbTwo.constructor === Array) {
      bbTwoArr = bbTwo;
    } else {
      bbTwoArr = [bbTwo];
    }

    for (let bbTwoIndex = 0; bbTwoIndex < bbTwoArr.length; bbTwoIndex++) {
      let bbTwo = bbTwoArr[bbTwoIndex];

      // Check if BoundingBox is invalid so we don't get a false positive.
      if (isNaN(bbTwo.x) || isNaN(bbTwo.y) || isNaN(bbTwo.width) || isNaN(bbTwo.height)) {
        continue;
      }

      if (this.checkBoundingBoxCollision(bbOne, bbTwo)) {
        //ctx.fillStyle = 'green';
        //ctx.fillRect(bbTwo.x, bbTwo.y, bbTwo.width, bbTwo.height);

        //ctx.fillStyle = 'purple';
        //ctx.fillRect(bbOne.x, bbOne.y, bbOne.width, bbOne.height);

        return true;
      }
    }

    return false;
  }

  checkBoundingBoxCollision(bbOne, bbTwo) {
    let xLeftOne = bbOne.x;
    let xLeftTwo = bbTwo.x;
    let xRightOne = bbOne.x + bbOne.width;
    let xRightTwo = bbTwo.x + bbTwo.width;

    let yTopOne = bbOne.y;
    let yTopTwo = bbTwo.y;
    let yBottomOne = bbOne.y + bbOne.height;
    let yBottomTwo = bbTwo.y + bbTwo.height;

    // a is left of b
    if (xRightOne < xLeftTwo) {
      return false;
    }

    // a is right of b
    if (xLeftOne > xRightTwo) {
      return false;
    }

    // a is above b
    if (yBottomOne < yTopTwo) {
      return false;
    }

    // a is below b
    if (yTopOne > yBottomTwo) {
      return false;
    }

    return true; // boxes overlap
  }
}

class BoundingBox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  offsetBy(velocity) {
    this.x += velocity.x;
    this.y += velocity.y;

    return this;
  }
}

// Represents a subsquare within a spritesheet
// Arg 'sprite' is the spritesheet
class Tile {
  constructor(sprite, startX, startY, tileWidth, tileHeight) {
    this.sprite = sprite;
    this.startX = startX;
    this.startY = startY;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  renderAt(context, x, y, renderedWidth = 32, renderedHeight = 32) {
    context.drawImage(
      this.sprite,
      this.startX,
      this.startY,
      this.tileWidth,
      this.tileHeight,
      x,
      y,
      renderedWidth,//this.tileWidth,
      renderedHeight//this.tileHeight
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
  constructor(spritePaths, loadedCallback) {
    this.sprites = [];
    this.loadedCallback = loadedCallback;

    spritePaths.forEach((path) => {
      let spriteKey = this.extractName(path);
      this.sprites[spriteKey] = new Sprite();
      this.sprites[spriteKey].image.src = path;
    });
  }

  isLoaded() {
    for (let spriteKey in this.sprites) {
      if (!this.sprites[spriteKey].loaded) {
        return false;
      }
    };

    return true;
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
  constructor(gridTiles, baseX, baseY) {
    this.tileWidth = 32;
    this.tileHeight = 32;

    this.baseX = baseX;
    this.baseY = baseY;

    this.tiles = {
      "1": gridTiles[6],    // upper left corner
      "2": gridTiles[7],   // horizontal top aligned
      "3": gridTiles[21],  // upper right corner
      "4": gridTiles[36],  // vertical left aligned
      "5": gridTiles[51],  // vertical right aligned
      "0": gridTiles[5],   // blank
      "6": gridTiles[68],  // small lower right corner
      "7": gridTiles[69],  // small lower left corner
      "8": gridTiles[73],  // middle horizontal line
      "9": gridTiles[98],  // right vertical line
      "10": gridTiles[99],  // left vertical line
      "11": gridTiles[101],  // small upper right corner
      "12": gridTiles[102], // upper horizontal line
      "13": gridTiles[106],   // small upper left corner
      "14": gridTiles[930],   // lower left corner
      "15": gridTiles[957],   // lower right corner
      "16": gridTiles[931],   // horizontal bottom aligned
    }

    this.grid = [
      ["0", "1", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "3", "0"],
      ["0", "4", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "5", "0"],
      ["0", "4", "0", "6", "7", "0", "6", "8", "8", "8", "8", "8", "7", "0", "6", "8", "7", "0", "5", "0"],
      ["0", "4", "0", "10", "9", "0", "10", "0", "0", "0", "0", "0", "9", "0", "10", "0", "9", "0", "5", "0"],
      ["0", "4", "0", "10", "9", "0", "10", "0", "0", "0", "0", "0", "9", "0", "10", "0", "9", "0", "5", "0"],
      ["0", "4", "0", "11", "13", "0", "11", "12", "12", "12", "12", "12", "13", "0", "11", "12", "13", "0", "5", "0"],
      ["0", "4", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "5", "0"],
      ["0", "14", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "16", "15", "0"],
    ];

    this.tileWidth = 32;
    this.tileHeight = 32;
  }

  iterateOverTiles(eachFn) {
    let currX = this.baseX, currY = this.baseY;

    this.grid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        eachFn(tile, currX, currY);

        currX += this.tileWidth;
      });

      currX = this.baseX;
      currY += this.tileHeight;
    });
  }

  // Returns an array of bounding boxes
  boundingBox() {
    let boxes = [];

    this.iterateOverTiles((tile, currX, currY) => {
     // empty tiles should not be included
      if (tile !== "0") {
        let bb;

        if (tile === "1") {
          bb = new BoundingBox(
            currX,
            currY,
            0.6875 * this.tileWidth,
            0.6875 * this.tileHeight
          );
        } else if (tile === "2") {
          bb = new BoundingBox(currX, currY, this.tileWidth, 0.5 * this.tileHeight);
        } else if (tile === "3") {
          bb = new BoundingBox(
            currX + 0.3125 * this.tileWidth,
            currY,
            0.6875 * this.tileWidth,
            0.6875 * this.tileHeight
          );
        } else if (tile === "4") {
          bb = new BoundingBox(currX, currY, 0.5 * this.tileWidth, this.tileHeight);
        } else if (tile === "5") {
          bb = new BoundingBox(
            currX + 0.5 * this.tileWidth,
            currY,
            0.5 * this.tileWidth,
            this.tileHeight
          );
        } else if (tile === "6") {
          bb = new BoundingBox(
            currX + 0.5 * this.tileWidth,
            currY + 0.5 * this.tileHeight,
            0.5 * this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "7") {
          bb = new BoundingBox(
            currX,
            currY + 0.5 * this.tileHeight,
            0.5 * this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "8") {
          bb = new BoundingBox(
            currX,
            currY + 0.5 * this.tileHeight,
            this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "9") {
          bb = new BoundingBox(
            currX,
            currY,
            0.5 * this.tileWidth,
            this.tileHeight
          );
        } else if (tile === "10") {
          bb = new BoundingBox(
            currX + 0.5 * this.tileWidth,
            currY,
            0.5 * this.tileWidth,
            this.tileHeight
          );
        } else if (tile === "11") {
          bb = new BoundingBox(
            currX + 0.5 * this.tileWidth,
            currY,
            0.5 * this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "12") {
          bb = new BoundingBox(
            currX,
            currY,
            this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "13") {
          bb = new BoundingBox(
            currX,
            currY,
            0.5 * this.tileWidth,
            0.5 * this.tileHeight
          );
        } else if (tile === "14") {
          bb = new BoundingBox(
            currX,
            currY + 0.3125 * this.tileHeight,
            0.6875 * this.tileWidth,
            0.6875 * this.tileHeight
          );
        } else if (tile === "15") {
          bb = new BoundingBox(
            currX + 0.3125 * this.tileHeight,
            currY + 0.3125 * this.tileHeight,
            0.6875 * this.tileWidth,
            0.6875 * this.tileHeight
          );
        } else if (tile === "16") {
          bb = new BoundingBox(
            currX,
            currY + 0.5 * this.tileHeight,
            this.tileWidth,
            0.5 * this.tileHeight
          );
        } else {
          bb = new BoundingBox(currX, currY, this.tileWidth, this.tileHeight);
        }

        boxes.push(bb);
      }
    });

    return boxes;
  }

  render(context) {
    let currX = this.baseX, currY = this.baseY;

    this.grid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        this.tiles[tile].renderAt(ctx, currX, currY);

        currX += this.tileWidth;
      });

      currX = this.baseX;
      currY += this.tileHeight;
    });
  }
}
// ============================== END Grid ===============================

// ============================== BEGIN Player ===========================
const DirectionState = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  STILL: "STILL"
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
  constructor(frames, shouldLoop) {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.ANIMATION_COMPLETED = -1;
    this.currentTimer = null;
    this.shouldLoop = shouldLoop;
  }

  play(speed) {
    this.currentTimer = setInterval(() => {
      if (this.shouldLoop) {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      } else {
        this.currentFrameIndex += 1;
        if (this.currentFrameIndex === this.frames.length) {
          this.currentFrameIndex = this.ANIMATION_COMPLETED;
        }
      }
    }, speed);
  }

  stop() {
    if (this.currentTimer) {
      window.clearInterval(this.currentTimer);
    }
  }

  render(context, x, y) {
    if (this.currentFrameIndex !== this.ANIMATION_COMPLETED) {
      this.frames[this.currentFrameIndex].render(context, x, y);
    }
  }
}

class Ghost {
  constructor(tiles, x, y) {
    this.renderedTileWidth = 25;
    this.renderedTileHeight = 25;

    let renderFn = (tiles, context, x, y) => {
      tiles[0].renderAt(context, x, y, this.renderedTileWidth, this.renderedTileHeight);
      tiles[1].renderAt(context, x + this.renderedTileWidth, y, this.renderedTileWidth, this.renderedTileHeight);
      tiles[2].renderAt(context, x, y + this.renderedTileHeight, this.renderedTileWidth, this.renderedTileHeight);
      tiles[3].renderAt(context, x + this.renderedTileWidth, y + this.renderedTileHeight, this.renderedTileWidth, this.renderedTileHeight);
    };

    this.x = x;
    this.y = y;
    this.speed = 3;
    this.velocity = {x: 0, y: 0};
    let walkingOne = new Frame([tiles[384], tiles[385], tiles[416], tiles[417]], renderFn);
    let walkingTwo = new Frame([tiles[386], tiles[387], tiles[418], tiles[419]], renderFn);
    this.walkingAnim = new Animation([walkingOne, walkingTwo], true);
    this.animation = this.walkingAnim;
    this.animation.play(125);

    this.directionState = DirectionState.STILL;
    this.right();
  }

  up() {
    if (this.directionState == DirectionState.UP) {
      return;
    }

    this.directionState = DirectionState.UP;
    this.velocity.x = 0;
    this.velocity.y = -this.speed;
  }

  down() {
    if (this.directionState == DirectionState.DOWN) {
      return;
    }

    this.directionState = DirectionState.DOWN;
    this.velocity.x = 0;
    this.velocity.y = this.speed;
  }

  left() {
    if (this.directionState == DirectionState.LEFT) {
      return;
    }

    this.directionState = DirectionState.LEFT;
    this.velocity.x = -this.speed;
    this.velocity.y = 0;
  }

  right() {
    if (this.directionState == DirectionState.RIGHT) {
      return;
    }

    this.directionState = DirectionState.RIGHT;
    this.velocity.x = this.speed;
    this.velocity.y = 0;
  }

  update(gameManager) {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    let randomChoice = 1 + Math.floor(Math.random() * 6);

    if (randomChoice == 2) {
      let randomDirection = Math.floor(Math.random() * 4);

      if (randomDirection == 0) { this.up(); }
      else if (randomDirection == 1) { this.down(); }
      else if (randomDirection == 2) { this.left(); }
      else if (randomDirection == 3) { this.right(); }
    }
  }

  render(context) {
    this.animation.render(context, this.x, this.y);
  }
}

class Player {
  constructor(tiles, x, y) {
    this.playerTileWidth = 25;
    this.playerTileHeight = 25;

    let renderFn = (tiles, context, x, y) => {
      tiles[0].renderAt(context, x, y, this.playerTileWidth, this.playerTileHeight);
      tiles[1].renderAt(context, x + this.playerTileWidth, y, this.playerTileWidth, this.playerTileHeight);
      tiles[2].renderAt(context, x, y + this.playerTileHeight, this.playerTileWidth, this.playerTileHeight);
      tiles[3].renderAt(context, x + this.playerTileWidth, y + this.playerTileHeight, this.playerTileWidth, this.playerTileHeight);
    };

    let leftOpen = new Frame([tiles[192], tiles[193], tiles[224], tiles[225]], renderFn);
    let leftClose = new Frame([tiles[196], tiles[197], tiles[228], tiles[229]], renderFn);
    this.leftAnim = new Animation([leftOpen, leftClose], true);

    let rightOpen = new Frame([tiles[200], tiles[201], tiles[232], tiles[233]], renderFn);
    let rightClose = new Frame([tiles[204], tiles[205], tiles[236], tiles[237]], renderFn);
    this.rightAnim = new Animation([rightOpen, rightClose], true);

    let upOpen = new Frame([tiles[194], tiles[195], tiles[226], tiles[227]], renderFn);
    let upClose = new Frame([tiles[198], tiles[199], tiles[230], tiles[231]], renderFn);
    this.upAnim = new Animation([upOpen, upClose], true);

    let downOpen = new Frame([tiles[202], tiles[203], tiles[234], tiles[235]], renderFn);
    let downClose = new Frame([tiles[206], tiles[207], tiles[238], tiles[239]], renderFn);
    this.downAnim = new Animation([downOpen, downClose], true);

    this.x = x;
    this.y = y;

    this.speed = 3;
    this.velocity = {x: 0, y: 0};

    this.directionState = DirectionState.STILL;
    this.animation = this.rightAnim;
  }

  boundingBox() {
    let width = this.playerTileWidth * 2;
    let height = this.playerTileHeight * 2;

    return new BoundingBox(this.x, this.y, width, height);
  }

  handleKeyInput(keys) {
    if (keys['up'] && this.directionState !== DirectionState.UP) {
      this.up();
    }
    else if (keys['down'] && this.directionState !== DirectionState.DOWN) {
      this.down();
    }
    else if (keys['left'] && this.directionState !== DirectionState.LEFT) {
      this.left();
    }
    else if (keys['right'] && this.directionState !== DirectionState.RIGHT) {
      this.right();
    }
  }

  changePlayerAnimation(newAnimation) {
    if (this.animation) {
      this.animation.stop();
    }

    this.animation = newAnimation;
    this.animation.play(125);
  }

  left() {
    this.changePlayerAnimation(this.leftAnim);

    this.directionState = DirectionState.LEFT;
    this.velocity.x = -this.speed;
    this.velocity.y = 0;
  }

  right() {
    this.changePlayerAnimation(this.rightAnim);

    this.directionState = DirectionState.RIGHT;
    this.velocity.x = this.speed;
    this.velocity.y = 0;
  }

  up() {
    this.changePlayerAnimation(this.upAnim);

    this.directionState = DirectionState.UP;
    this.velocity.x = 0;
    this.velocity.y = -this.speed;
  }

  down() {
    this.changePlayerAnimation(this.downAnim);

    this.directionState = DirectionState.DOWN;
    this.velocity.x= 0;
    this.velocity.y = this.speed;
  }

  update(gameManager) {
    if (gameManager.checkForCollision("player", "grid", this.velocity)) {
      console.log("COLLISION DETECTED BETWEEN PLAYR AND GRID");
    } else {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
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
  'src/img/sprites-alpha.png'
]);

let gridTiles = spritesRepo.fetch("grid").asTiles(24, 24, 32, 32, 4);
let grid = new Grid(gridTiles, 0, 0);

let generalSprites = spritesRepo.fetch("sprites-alpha").asTiles(1, 1, 47, 47, 1);

let player = new Player(generalSprites, 50, 23);
let redGhost = new Ghost(generalSprites, 100, 100);

let gameManager = new GameManager(ctx);
gameManager.register(grid, "grid");
gameManager.register(player, "player");
gameManager.register(redGhost, "redghost");

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
  player.update(gameManager);
  player.handleKeyInput(keys);

  redGhost.update(gameManager);
}

let render = () => {
  if (spritesRepo.isLoaded()) {
    renderBackground();

    gameManager.renderWorld(ctx);
  }
}

let computeFps = (currentTime) => {
  let fpsAsFloat = 1000 / (currentTime - prevTime);

  return Math.trunc(fpsAsFloat + 0.5);
}

let reportFps = (fps) => {
  let fpsElement = document.getElementById("fps");
  fpsElement.innerHTML = `Frames Per Second = ${fps}`;
}

let prevTime = performance.now();
let main = () => {
  let currentTime = performance.now();
  let fps = computeFps(currentTime);
  prevTime = currentTime;
  reportFps(fps);

  render();
  update();

  window.requestAnimationFrame(main);
}

main();
