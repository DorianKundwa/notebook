/**
 * Generate high-res PNG and valid Windows ICO icon for NSIS Windows Setup (.exe)
 * matching the user's custom notebook design.
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const rawPngToIco = require('png-to-ico');
const pngToIco = rawPngToIco.default || rawPngToIco;

const width = 256;
const height = 256;
const scale = width / 512;
const png = new PNG({ width, height, colorType: 6 });

function fillRoundRect(x, y, w, h, radius, r, g, b, a = 255) {
  const sx = Math.round(x * scale);
  const sy = Math.round(y * scale);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);
  const srad = Math.max(2, Math.round(radius * scale));

  for (let py = Math.max(0, sy); py < Math.min(height, sy + sh); py++) {
    for (let px = Math.max(0, sx); px < Math.min(width, sx + sw); px++) {
      let inCorner = false;
      let dx = 0;
      let dy = 0;

      if (px < sx + srad && py < sy + srad) {
        dx = px - (sx + srad);
        dy = py - (sy + srad);
        inCorner = true;
      } else if (px > sx + sw - srad && py < sy + srad) {
        dx = px - (sx + sw - srad);
        dy = py - (sy + srad);
        inCorner = true;
      } else if (px < sx + srad && py > sy + sh - srad) {
        dx = px - (sx + srad);
        dy = py - (sy + sh - srad);
        inCorner = true;
      } else if (px > sx + sw - srad && py > sy + sh - srad) {
        dx = px - (sx + sw - srad);
        dy = py - (sy + sh - srad);
        inCorner = true;
      }

      if (!inCorner || (dx * dx + dy * dy <= srad * srad)) {
        const idx = (width * py + px) << 2;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

function fillRect(x, y, w, h, r, g, b, a = 255) {
  const sx = Math.round(x * scale);
  const sy = Math.round(y * scale);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);

  for (let py = Math.max(0, sy); py < Math.min(height, sy + sh); py++) {
    for (let px = Math.max(0, sx); px < Math.min(width, sx + sw); px++) {
      const idx = (width * py + px) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }
}

// 1. Transparent canvas
for (let i = 0; i < width * height * 4; i += 4) {
  png.data[i] = 0;
  png.data[i + 1] = 0;
  png.data[i + 2] = 0;
  png.data[i + 3] = 0;
}

// 2. Main Cover (#1E293B: 30, 41, 59)
fillRoundRect(112, 48, 288, 416, 24, 30, 41, 59);

// 3. Binding Edge (#0F172A: 15, 23, 42)
fillRoundRect(112, 48, 40, 416, 16, 15, 23, 42);

// 4. Bookmark Ribbon (#E11D48: 225, 29, 72)
fillRect(240, 48, 60, 172, 225, 29, 72);

// 5. Code Lines (#475569: 71, 85, 105)
fillRoundRect(180, 140, 170, 12, 6, 71, 85, 105);
fillRoundRect(180, 190, 170, 12, 6, 71, 85, 105);
fillRoundRect(180, 240, 120, 12, 6, 71, 85, 105);

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const pngPath = path.join(assetsDir, 'icon.png');
const icoPath = path.join(assetsDir, 'icon.ico');

const pngBuffer = PNG.sync.write(png);
fs.writeFileSync(pngPath, pngBuffer);
console.log('✅ Generated PNG app icon at:', pngPath);

pngToIco(pngPath)
  .then(icoBuffer => {
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✅ Generated native Windows ICO icon at:', icoPath);
  })
  .catch(err => {
    console.error('Error generating ICO:', err);
    process.exit(1);
  });
