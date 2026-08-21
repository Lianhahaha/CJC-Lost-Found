const Jimp = require('jimp');

async function removeOuterWhite() {
  const image = await Jimp.read('./public/cjc-logo.png');
  const { width, height } = image.bitmap;
  const visited = new Uint8Array(width * height);

  // Flood-fill from all 4 edges
  const queue = [];

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const r = image.bitmap.data[idx * 4 + 0];
    const g = image.bitmap.data[idx * 4 + 1];
    const b = image.bitmap.data[idx * 4 + 2];
    // Only flood white-ish pixels (outside the circle)
    if (r > 230 && g > 230 && b > 230) {
      visited[idx] = 1;
      queue.push([x, y]);
    }
  }

  // Seed from every pixel on all 4 edges
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  // BFS flood fill
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    // Make pixel transparent
    const pixelIdx = (y * width + x) * 4;
    image.bitmap.data[pixelIdx + 3] = 0;
    // Check neighbors
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  await image.writeAsync('./public/cjc-logo-transparent.png');
  console.log('Done! Outer white removed, inner white preserved.');
}

removeOuterWhite().catch(console.error);
