import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseGIF, decompressFrames } from "gifuct-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OPAQUE = path.join(ROOT, "assets", "_opaque");

function hashFile(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16);
}

function analyzeGif(p) {
  const buf = fs.readFileSync(p);
  const parsed = parseGIF(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const frames = decompressFrames(parsed, true);
  const tiny = frames.filter((f) => f.dims.width * f.dims.height <= 4).length;
  const clearDispose = frames.filter((f) => f.disposalType === 2).length;
  return { frames: frames.length, tiny, clearDispose, w: parsed.lsd.width, h: parsed.lsd.height };
}

const files = fs.readdirSync(OPAQUE).filter((f) => /\.(gif|png)$/i.test(f));
const byHash = new Map();

for (const f of files) {
  const p = path.join(OPAQUE, f);
  const h = hashFile(p);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(f);
}

console.log("=== DUPLICATE SOURCE FILES (same content) ===");
for (const [h, names] of byHash) {
  if (names.length > 1) console.log(names.join(" == "));
}

console.log("\n=== GIF FLICKER RISK (tiny frames / full clear) ===");
for (const f of files.filter((x) => x.endsWith(".gif")).sort()) {
  try {
    const g = analyzeGif(path.join(OPAQUE, f));
    if (g.tiny > 0 || g.clearDispose > 2) {
      console.log(`${f}: frames=${g.frames} tiny=${g.tiny} clearDispose=${g.clearDispose}`);
    }
  } catch (e) {
    console.log(`${f}: parse error ${e.message}`);
  }
}
