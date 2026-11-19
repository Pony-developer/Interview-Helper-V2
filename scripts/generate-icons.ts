/**
 * Generates raster icons from src/app/icon.svg:
 *   src/app/favicon.ico (16/32/48), src/app/apple-icon.png (180), public/icon-192.png, public/icon-512.png
 * Run: npx tsx scripts/generate-icons.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("src/app/icon.svg");

async function png(size: number) {
  return sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();
}

/** Minimal ICO writer: PNG-compressed entries (supported by all modern browsers). */
function ico(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

async function main() {
  const sizes = [16, 32, 48];
  const icoImages = await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) })));
  writeFileSync("src/app/favicon.ico", ico(icoImages));
  writeFileSync("src/app/apple-icon.png", await png(180));
  writeFileSync("public/icon-192.png", await png(192));
  writeFileSync("public/icon-512.png", await png(512));
  console.log("Icons generated.");
}

main();
