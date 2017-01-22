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
      this.tileWidth,
      this.tileHeight
    );
  }
}

class Sprite {
  constructor() {
    this.loaded = false;
    this.image = this.createImageObject();
  }

  asTiles(startX, startY, tileWidth, tileHeight) {
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
    for(; curY < (startY + this.image.height); curY += tileHeight) {
      for(; curX < (startX + this.image.width); curX += tileWidth) {
        tiles.push( new Tile(this.image, curX, curY, tileWidth, tileHeight) );
      }
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
