// make-icons.js — generate solid-color PNG placeholder icons for the extension.
// Run with: node scripts/make-icons.js
// Produces icons/icon-16.png, icon-48.png, icon-128.png using brand color #7c5cff.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ICON_DIR = path.resolve(__dirname, "..", "icons");
const BRAND = { r: 0x7c, g: 0x5c, b: 0xff };
const SIZES = [16, 48, 128];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;      // bit depth
  ihdr[9] = 2;      // color type: RGB
  ihdr[10] = 0;     // compression
  ihdr[11] = 0;     // filter
  ihdr[12] = 0;     // interlace

  // Each row: filter byte (0) + size*3 RGB bytes
  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLen;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = BRAND.r;
      raw[px + 1] = BRAND.g;
      raw[px + 2] = BRAND.b;
    }
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

if (!fs.existsSync(ICON_DIR)) fs.mkdirSync(ICON_DIR, { recursive: true });

for (const s of SIZES) {
  const out = path.join(ICON_DIR, `icon-${s}.png`);
  fs.writeFileSync(out, makePng(s));
  console.log(`wrote ${out} (${fs.statSync(out).size} bytes)`);
}
