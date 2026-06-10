import fs from "fs";
import path from "path";
import { parseGIF, decompressFrames } from "gifuct-js";

const root = path.resolve("..");
const SOURCES = {
  flower:
    "https://media.tenor.com/G5hXW6KJyy0AAAAj/%E7%BA%BF%E6%9D%A1%E5%B0%8F%E7%8B%97.gif",
  laying:
    "https://media.tenor.com/ccEk_jRBAmkAAAAj/%E7%BA%BF%E6%9D%A1%E5%B0%8F%E7%8B%97.gif",
};

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf;
}

function verify(buf, label) {
  if (buf.slice(0, 4).toString("ascii") === "RIFF") {
    throw new Error(`${label}: still WebP`);
  }
  if (buf.slice(0, 3).toString("ascii") !== "GIF") {
    throw new Error(`${label}: not GIF`);
  }
  const parsed = parseGIF(buf.buffer);
  const frames = decompressFrames(parsed, true).filter(
    (x) => x.dims.width * x.dims.height >= 16
  ).length;
  if (frames < 2) throw new Error(`${label}: only ${frames} frame(s)`);
  return { frames, w: parsed.lsd.width, h: parsed.lsd.height, size: buf.length };
}

const flowerBuf = await download(
  SOURCES.flower,
  path.join(root, "assets", "raw", "flower.gif")
);
const layingBuf = await download(
  SOURCES.laying,
  path.join(root, "assets", "raw", "laying.gif")
);

const targets = {
  flower: [
    path.join(root, "assets", "raw", "sample_2.gif"),
    path.join(root, "assets", "_opaque", "maltese-happy-flower.gif"),
    path.join(root, "assets", "maltese-happy-flower.gif"),
    path.join(root, "handoff-gifs-only", "tenor-flower.gif"),
    path.join(root, "handoff-gifs-only", "tenor-sample_2.gif"),
    path.join(root, "handoff-gifs-only", "theme-maltese-happy-flower.gif"),
  ],
  laying: [path.join(root, "handoff-gifs-only", "tenor-laying.gif")],
};

for (const dest of targets.flower) fs.writeFileSync(dest, flowerBuf);
for (const dest of targets.laying) fs.writeFileSync(dest, layingBuf);

const flowerInfo = verify(flowerBuf, "flower");
const layingInfo = verify(layingBuf, "laying");

console.log("flower", flowerInfo, "->", targets.flower.length, "files");
console.log("laying", layingInfo, "->", targets.laying.length, "files");
console.log("done");
