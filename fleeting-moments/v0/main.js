let imgs = [];
let chunks = [];
let gridSize = 2;
let canvasSize = 400;
let chunksPerImg = 4;
let chunkSize;
let blurAmount = 0;
let scaleFactor = 1;

function setup() {
  canvasSize = window.innerHeight;
  createCanvas(canvasSize, canvasSize);
  let input = createFileInput(handleFile);
  input.attribute('multiple', '');
  input.position(10, 10);
}

function handleFile(file) {
  if (file.type === 'image' && imgs.length < 4) {
    loadImage(file.data, (img) => {
      imgs.push(img);
      if (imgs.length === 4) {
        initGrid();
      }
    });
  }
}

function initGrid() {
  chunks = [];
  chunkSize = canvasSize / (gridSize * chunksPerImg);
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].resize(canvasSize / gridSize, canvasSize / gridSize);
    for (let y = 0; y < chunksPerImg; y++) {
      for (let x = 0; x < chunksPerImg; x++) {
        let chunk = imgs[i].get(
          x * chunkSize,
          y * chunkSize,
          chunkSize,
          chunkSize
        );
        chunks.push({
          img: chunk,
          homeX: (i % gridSize) * (canvasSize / gridSize) + x * chunkSize,
          homeY: floor(i / gridSize) * (canvasSize / gridSize) + y * chunkSize
        });
      }
    }
  }
}

function draw() {
  background(255);
  if (chunks.length < 1) return;

  push();
  translate(width / 2, height / 2);
  scale(scaleFactor);
  translate(-width / 2, -height / 2);
  drawingContext.filter = `blur(${blurAmount}px)`;

  for (let c of chunks) {
    image(c.img, c.homeX + chunkSize / 2, c.homeY + chunkSize / 2);
  }

  pop();

  blurAmount = min(blurAmount + 0.01, 8);
  scaleFactor = max(scaleFactor - 0.001, chunkSize / (canvasSize / gridSize));

  if (frameCount % 10 === 0) {
    let a = floor(random(chunks.length));
    let b = floor(random(chunks.length));
    [chunks[a].img, chunks[b].img] = [chunks[b].img, chunks[a].img];
  }
}
