let imgs = [];
let chunks = [];
let gridSize = 2;
let canvasSize = 400;
let chunksPerImg = 16;
let chunkSize;
let blurAmount = 0;
let scaleFactor = 1;
let crtOverlay; // overlay graphics for CRT effect

function setup() {
  canvasSize = Math.min(window.innerWidth, window.innerHeight);
  let cnv = createCanvas(canvasSize, canvasSize, WEBGL);
  cnv.parent("container");
  crtOverlay = createGraphics(canvasSize, canvasSize); // create overlay buffer
  noStroke();
  
  let input = createFileInput(handleFile);
  input.attribute('multiple', '');
  input.style('display', 'none');
  input.changed(handleFile);

  let button = createButton('Add Memories');
  button.parent("buttons");
  button.addClass('file-upload-btn');
  button.mousePressed(() => input.elt.click());
  
  // New download button
  let downloadBtn = createButton('Download Artifact');
  downloadBtn.parent("buttons");
  downloadBtn.mousePressed(downloadGrid);
}

function downloadGrid() {
  // Create an off-screen graphics buffer in WEBGL mode.
  let pg = createGraphics(canvasSize, canvasSize, WEBGL);
  pg.noStroke();
  // Draw the grid from a fixed (initial) state.
  pg.background(0);
  pg.drawingContext.filter = 'none'; // disable blur

  // Render each chunk with no rotation.
  for (let c of chunks) {
    pg.push();
    pg.translate(c.homeX + chunkSize / 2, c.homeY + chunkSize / 2, 0);
    pg.texture(c.img);
    pg.plane(chunkSize, chunkSize);
    pg.pop();
  }
  
  // Draw the CRT overlay (as seen in the main draw loop)
  pg.push();
  pg.resetMatrix();
  pg.ortho();
  crtOverlay.clear();
  crtOverlay.noStroke();
  crtOverlay.fill(0, 50);
  for (let y = 0; y < canvasSize; y += 4) {
    crtOverlay.rect(0, y, canvasSize, 2);
  }
  // Adjust image position for the off-screen buffer
  pg.image(crtOverlay, -canvasSize / 2, -canvasSize / 2, canvasSize, canvasSize);
  pg.pop();
  
  // Save the off-screen buffer as a PNG image.
  saveCanvas(pg, 'grid', 'jpg');
}

function handleFile(file) {
  if (imgs.length > 0)
    imgs = [];
  if (file.type === 'image' && imgs.length < 4) {
    loadImage(file.data, (img) => {
      imgs.push(img);
      if (imgs.length === 4) {
        initGrid();
        document.getElementById('no-files-txt').style.display = 'none';
        document.getElementById('logo-top-left').style.opacity = '0.75';
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
  if (chunks.length > 0) {
    background(0);
    // Scene rotation based on mouse position and frameCount
    let rotY = map(mouseX - width / 2, -width * 15, width * 15, -PI, PI);
    let rotX = map(-(mouseY - height / 2), -height * 15, height * 15, -PI, PI);
    let rotZ = sin(frameCount * 0.01) * 0.05;
    rotateX(rotX);
    rotateY(rotY);
    rotateZ(rotZ);

    // Draw each chunk
    for (let c of chunks) {
      push();
      translate(c.homeX + chunkSize / 2, c.homeY + chunkSize / 2, 0);
      texture(c.img);
      plane(chunkSize, chunkSize);
      pop();
    }

    let shuffleProbability = exp(-frameCount / 500);

    if (random() < shuffleProbability) {
      let a = floor(random(chunks.length));
      let b = floor(random(chunks.length));
      [chunks[a].img, chunks[b].img] = [chunks[b].img, chunks[a].img];
    }
  } else {
    background(30);
  }

  // --- CRT Overlay and Text ---
  push();
  resetMatrix();
  ortho();

  crtOverlay.clear();
  crtOverlay.noStroke();
  crtOverlay.fill(0, 50);
  for (let y = 0; y < canvasSize; y += 4) {
    crtOverlay.rect(0, y, canvasSize, 2);
  }
  image(crtOverlay, -width / 2, -height / 2, width, height);
  pop();
}
