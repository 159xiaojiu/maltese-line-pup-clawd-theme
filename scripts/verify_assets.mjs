import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parseGIF, decompressFrames } from "gifuct-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OPAQUE = path.join(ROOT, "assets", "_opaque");
const OUT = path.join(ROOT, "assets");

function parseBuf(buf) {
  return parseGIF(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

function compositeVisible(parsed, raw) {
  const w = parsed.lsd.width;
  const h = parsed.lsd.height;
  const canvas = new Uint8ClampedArray(w * h * 4);
  let max = 0;
  for (const frame of raw) {
    if (frame.disposalType === 2) canvas.fill(0);
    const { dims, patch } = frame;
    for (let y = 0; y < dims.height; y++) {
      for (let x = 0; x < dims.width; x++) {
        const si = (y * dims.width + x) * 4;
        if (!patch[si + 3]) continue;
        const di = ((dims.top + y) * w + (dims.left + x)) * 4;
        canvas[di] = patch[si];
        canvas[di + 1] = patch[si + 1];
        canvas[di + 2] = patch[si + 2];
        canvas[di + 3] = patch[si + 3];
      }
    }
    let n = 0;
    for (let i = 3; i < canvas.length; i += 4) if (canvas[i] > 0) n++;
    max = Math.max(max, n);
  }
  return { frames: raw.length, maxVisible: max, w, h };
}

async function analyze(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") {
    const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
    return { frames: 1, maxVisible: n };
  }
  const parsed = parseBuf(fs.readFileSync(file));
  const raw = decompressFrames(parsed, true);
  return compositeVisible(parsed, raw);
}

const theme = JSON.parse(fs.readFileSync(path.join(ROOT, "theme.json"), "utf8"));
const referenced = new Set();
for (const v of Object.values(theme.states)) {
  if (Array.isArray(v)) v.forEach((f) => referenced.add(f));
}
for (const t of theme.workingTiers || []) referenced.add(t.file);
for (const t of theme.jugglingTiers || []) referenced.add(t.file);
for (const a of theme.idleAnimations || []) referenced.add(a.file);
for (const r of theme.reactions?.doubleTap || []) referenced.add(r.file);
for (const r of theme.reactions?.pokeLeft || []) referenced.add(r.file);
for (const r of theme.reactions?.pokeRight || []) referenced.add(r.file);

const problems = [];
for (const f of [...referenced].sort()) {
  const p = path.join(OUT, f);
  const o = path.join(OPAQUE, f);
  if (!fs.existsSync(p)) {
    problems.push(`${f}: MISSING output`);
    continue;
  }
  const proc = await analyze(p);
  const orig = await analyze(o);
  const ok = proc.maxVisible >= 80 && proc.frames >= 1;
  const frameMatch = proc.frames === orig.frames ? "ok" : `frames ${proc.frames} vs ${orig.frames}`;
  console.log(`${f}: visible=${proc.maxVisible} frames=${proc.frames} (${frameMatch})`);
  if (!ok) problems.push(`${f}: EMPTY or broken (visible=${proc.maxVisible})`);
  if (proc.frames !== orig.frames) problems.push(`${f}: frame count mismatch ${proc.frames} vs ${orig.frames}`);
}

console.log("\n--- problems ---");
console.log(problems.length ? problems.join("\n") : "none");
