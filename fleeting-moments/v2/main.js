let imgs = [];
let chunks = [];
let gridSize = 2;
let canvasSize = 400;
let chunksPerImg = 16;
let chunkSize;
let blurAmount = 0;
let scaleFactor = 1;

function setup() {
  canvasSize = window.innerHeight;
  createCanvas(canvasSize, canvasSize, WEBGL);
  noStroke();
  
  let input = createFileInput(handleFile);
  input.attribute('multiple', '');
  input.style('display', 'none');
  input.changed(handleFile); // attach file handler

  let button = createButton('Add memories');
  button.addClass('file-upload-btn');
  button.mousePressed(() => input.elt.click()); // simulate input click
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
          homeX: (i % gridSize) * (canvasSize / gridSize) + x * chunkSize - canvasSize / 2,
          homeY: floor(i / gridSize) * (canvasSize / gridSize) + y * chunkSize - canvasSize / 2
        });
      }
    }
  }
}

function draw() {
  background(0);
  if (chunks.length < 1) return;

  let rotY = map(mouseX - width / 2, -width*15, width*15, -PI, PI);
  let rotX = map(-(mouseY - height / 2), -height*15, height*15, -PI, PI);
  let rotZ = sin(frameCount * 0.01) * 0.05;

  rotateX(rotX);
  rotateY(rotY);
  rotateZ(rotZ);
  //scale(scaleFactor);
  drawingContext.filter = `blur(${blurAmount}px)`;

  for (let c of chunks) {
    push();
    translate(c.homeX + chunkSize / 2, c.homeY + chunkSize / 2, 0);
    texture(c.img);
    plane(chunkSize, chunkSize);
    pop();
  }

  blurAmount = min(blurAmount + 0.01, 8);
  //scaleFactor = max(scaleFactor - 0.001, chunkSize / (canvasSize / gridSize));

  if (frameCount % 10 === 0) {
    let a = floor(random(chunks.length));
    let b = floor(random(chunks.length));
    [chunks[a].img, chunks[b].img] = [chunks[b].img, chunks[a].img];
  }
}
