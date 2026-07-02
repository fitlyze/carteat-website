// Dev placeholder images: writes a solid-color PNG per recipe (Node zlib), to be
// converted to JPEG by sips. Replace with real food photography before launch.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const W = 1280;
const H = 960; // 4:3

const recipes = {
  'thai-green-curry': [0x23, 0x70, 0x43],
  'margherita-pizza': [0xbc, 0x4a, 0x23],
  'chana-masala': [0xe0, 0xa5, 0x2e],
  'chicken-tinga-tacos': [0x9c, 0x3a, 0x1d],
  'salmon-teriyaki-bowl': [0xd8, 0x5f, 0x33],
  'greek-quinoa-salad': [0x2f, 0x8c, 0x52],
};

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function png(width, height, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 3);
    raw[row] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const p = row + 1 + x * 3;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
    }
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('/tmp/recipe-png', { recursive: true });
for (const [slug, rgb] of Object.entries(recipes)) {
  writeFileSync(`/tmp/recipe-png/${slug}.png`, png(W, H, rgb));
  console.log(`wrote /tmp/recipe-png/${slug}.png`);
}
