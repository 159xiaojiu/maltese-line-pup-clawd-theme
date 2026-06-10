/**
 * Transparent assets via white-background chroma key (outline-safe).
 *
 * Pipeline per frame:
 *   1. Correctly composite source GIF (fix disposal → no decode ghosting)
 *   2. Flood-fill exterior black → white (prep pass)
 *   3. Flood-fill exterior white → transparent (cutout pass; black outline shields dog body)
 *   4. Re-encode full-frame GIF, disposal=2, exact palette (no re-quantize blur)
 *
 * Ghosting fixes:
 *   - Decode: apply PREVIOUS frame disposal before drawing next frame
 *   - Encode: every frame is full canvas, disposal=2 (clear before next)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parseGIF, decompressFrames } from "gifuct-js";
import { GifWriter } from "omggif/omggif.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OPAQUE = path.join(ROOT, "assets", "_opaque");
const OUT = path.join(ROOT, "assets");
const PREVIEW = path.join(ROOT, "preview-transparent-test.html");

const DARK_THRESHOLD = Number(process.env.DARK_THRESHOLD || 12);
const WHITE_THRESHOLD = Number(process.env.WHITE_THRESHOLD || 245);
const MIN_PATCH_AREA = 16;
// White bg chroma key — dog interior white stays opaque (different palette index).
const TRANSPARENT_KEY = 0xffffff;

const NEIGHBORS_8 = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];
const NEIGHBORS_4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function isDark(r, g, b) {
  return r <= DARK_THRESHOLD && g <= DARK_THRESHOLD && b <= DARK_THRESHOLD;
}

function isWhite(r, g, b) {
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
}

function setPixel(data, idx, r, g, b, a = 255) {
  const i = idx * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

/** Exterior-connected dark pixels → white (step 1). */
function blackExteriorToWhite(rgba, width, height) {
  const data = Buffer.from(rgba);
  const total = width * height;
  const protectedPx = new Uint8Array(total);
  const paint = new Uint8Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (data[i + 3] === 0) continue;
      if (!isDark(data[i], data[i + 1], data[i + 2])) {
        protectedPx[idx] = 1;
        continue;
      }
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = (ny * width + nx) * 4;
        if (data[ni + 3] === 0) continue;
        if (!isDark(data[ni], data[ni + 1], data[ni + 2])) {
          protectedPx[idx] = 1;
          break;
        }
      }
    }
  }

  const queue = [];
  const seen = new Uint8Array(total);
  const trySeed = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (seen[idx] || protectedPx[idx]) return;
    const i = idx * 4;
    if (data[i + 3] === 0 || !isDark(data[i], data[i + 1], data[i + 2])) return;
    seen[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    paint[idx] = 1;
    const x = idx % width;
    const y = (idx - x) / width;
    for (const [dx, dy] of NEIGHBORS_4) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nidx = ny * width + nx;
      if (seen[nidx] || protectedPx[nidx]) continue;
      const ni = nidx * 4;
      if (data[ni + 3] === 0 || !isDark(data[ni], data[ni + 1], data[ni + 2])) continue;
      seen[nidx] = 1;
      queue.push(nidx);
    }
  }

  for (let idx = 0; idx < total; idx++) {
    if (!paint[idx]) continue;
    setPixel(data, idx, 255, 255, 255, 255);
  }
  return data;
}

/** Exterior-connected white pixels → transparent (step 2). */
function whiteExteriorToTransparent(rgba, width, height) {
  const data = Buffer.from(rgba);
  const total = width * height;
  const protectedPx = new Uint8Array(total);
  const remove = new Uint8Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (data[i + 3] === 0) continue;
      if (!isWhite(data[i], data[i + 1], data[i + 2])) {
        protectedPx[idx] = 1;
        continue;
      }
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = (ny * width + nx) * 4;
        if (data[ni + 3] === 0) continue;
        if (!isWhite(data[ni], data[ni + 1], data[ni + 2])) {
          protectedPx[idx] = 1;
          break;
        }
      }
    }
  }

  const queue = [];
  const seen = new Uint8Array(total);
  const trySeed = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (seen[idx] || protectedPx[idx]) return;
    const i = idx * 4;
    if (data[i + 3] === 0 || !isWhite(data[i], data[i + 1], data[i + 2])) return;
    seen[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    remove[idx] = 1;
    const x = idx % width;
    const y = (idx - x) / width;
    for (const [dx, dy] of NEIGHBORS_4) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nidx = ny * width + nx;
      if (seen[nidx] || protectedPx[nidx]) continue;
      const ni = nidx * 4;
      if (data[ni + 3] === 0 || !isWhite(data[ni], data[ni + 1], data[ni + 2])) continue;
      seen[nidx] = 1;
      queue.push(nidx);
    }
  }

  for (let idx = 0; idx < total; idx++) {
    if (!remove[idx]) continue;
    data[idx * 4 + 3] = 0;
  }
  return data;
}

function removeBackgroundWhiteKey(rgba, width, height) {
  const step1 = blackExteriorToWhite(rgba, width, height);
  return whiteExteriorToTransparent(step1, width, height);
}

function parseGifBuffer(buf) {
  return parseGIF(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

function clearRect(canvas, width, left, top, w, h) {
  for (let y = top; y < top + h; y++) {
    for (let x = left; x < left + w; x++) {
      const di = (y * width + x) * 4;
      canvas[di] = 0;
      canvas[di + 1] = 0;
      canvas[di + 2] = 0;
      canvas[di + 3] = 0;
    }
  }
}

function drawPatch(canvas, width, frame) {
  const { dims, pixels, colorTable } = frame;
  const transp = frame.transparentIndex;
  for (let y = 0; y < dims.height; y++) {
    for (let x = 0; x < dims.width; x++) {
      const pi = pixels[y * dims.width + x];
      if (pi === transp) continue;
      const [r, g, b] = colorTable[pi] || [0, 0, 0];
      const di = ((dims.top + y) * width + (dims.left + x)) * 4;
      canvas[di] = r;
      canvas[di + 1] = g;
      canvas[di + 2] = b;
      canvas[di + 3] = 255;
    }
  }
}

/** Apply previous frame disposal BEFORE drawing current frame (fixes decode ghosting). */
function compositeToRgbaFrames(parsed, rawFrames) {
  const width = parsed.lsd.width;
  const height = parsed.lsd.height;
  const canvas = new Uint8ClampedArray(width * height * 4);
  const frames = [];
  let restoreSnapshot = null;

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i];
    if (frame.dims.width * frame.dims.height < MIN_PATCH_AREA) continue;

    if (i > 0) {
      const prev = rawFrames[i - 1];
      const disposal = prev.disposalType ?? 0;
      if (disposal === 2) {
        clearRect(canvas, width, prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
      } else if (disposal === 3 && restoreSnapshot) {
        canvas.set(restoreSnapshot);
      }
    }

    restoreSnapshot = new Uint8ClampedArray(canvas);
    drawPatch(canvas, width, frame);

    const processed = removeBackgroundWhiteKey(Buffer.from(canvas), width, height);
    frames.push({
      rgba: new Uint8ClampedArray(processed),
      delay: Math.max(40, frame.delay || 80),
    });
  }

  if (!frames.length) throw new Error("no usable frames");
  return { frames, width, height };
}

function buildExactPalette(rgbaFrames) {
  const palette = [TRANSPARENT_KEY];
  const colorToIndex = new Map();

  const addColor = (r, g, b) => {
    const rgb = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    if (colorToIndex.has(rgb)) return colorToIndex.get(rgb);
    if (palette.length >= 256) return 0;
    const idx = palette.length;
    palette.push(rgb);
    colorToIndex.set(rgb, idx);
    return idx;
  };

  for (const frame of rgbaFrames) {
    const d = frame.rgba;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      addColor(d[i], d[i + 1], d[i + 2]);
    }
  }

  let size = 2;
  while (size < palette.length) size <<= 1;
  while (palette.length < size) palette.push(TRANSPARENT_KEY);

  return { palette, colorToIndex, transparentIndex: 0 };
}

function rgbaToIndexed(rgba, width, height, colorToIndex, transparentIndex) {
  const out = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    if (rgba[p + 3] === 0) {
      out[i] = transparentIndex;
      continue;
    }
    const rgb = ((rgba[p] & 255) << 16) | ((rgba[p + 1] & 255) << 8) | (rgba[p + 2] & 255);
    out[i] = colorToIndex.get(rgb) ?? transparentIndex;
  }
  return out;
}

function writeGifOmggif(file, { frames, width, height }) {
  const { palette, colorToIndex, transparentIndex } = buildExactPalette(frames);
  const buf = new Uint8Array(Math.max(256 * 1024, width * height * frames.length * 2));
  const writer = new GifWriter(buf, width, height, { palette, loop: 0 });

  for (const frame of frames) {
    const indexed = rgbaToIndexed(frame.rgba, width, height, colorToIndex, transparentIndex);
    writer.addFrame(0, 0, width, height, indexed, {
      palette,
      delay: Math.max(2, Math.round(frame.delay / 10)),
      disposal: 2,
      transparent: transparentIndex,
    });
  }

  fs.writeFileSync(file, buf.slice(0, writer.end()));
}

function readGifFramesGifuct(file) {
  const parsed = parseGifBuffer(fs.readFileSync(file));
  const raw = decompressFrames(parsed, false);
  if (!raw.length || !parsed.lsd.width || !parsed.lsd.height) {
    throw new Error("gifuct cannot parse");
  }
  const result = compositeToRgbaFrames(parsed, raw);
  result.sourceFrames = raw.filter((f) => f.dims.width * f.dims.height >= MIN_PATCH_AREA).length;
  return result;
}

async function readGifFramesSharp(file) {
  const meta = await sharp(file, { animated: true }).metadata();
  const width = meta.width;
  const pages = meta.pages || 1;
  const pageHeight = meta.pageHeight || Math.round(meta.height / pages);
  const delays = Array.isArray(meta.delay) ? meta.delay : [meta.delay || 80];
  const frames = [];

  for (let page = 0; page < pages; page++) {
    const { data, info } = await sharp(file, { animated: true, page, pageHeight })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const slice = Buffer.alloc(width * pageHeight * 4);
    const offset = Math.max(0, info.height - pageHeight);
    for (let y = 0; y < pageHeight; y++) {
      const srcY = offset + y;
      if (srcY >= info.height) break;
      data.copy(slice, y * width * 4, srcY * width * 4, srcY * width * 4 + width * 4);
    }

    frames.push({
      rgba: new Uint8ClampedArray(removeBackgroundWhiteKey(slice, width, pageHeight)),
      delay: Math.max(40, delays[page] ?? delays[0] ?? 80),
    });
  }

  if (!frames.length) throw new Error("no usable frames");
  return { frames, width, height: pageHeight, sourceFrames: pages };
}

async function readGifFrames(file) {
  try {
    return readGifFramesGifuct(file);
  } catch {
    return readGifFramesSharp(file);
  }
}

function countVisibleRgba(data) {
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
  return n;
}

export function usableFrameCount(file) {
  const parsed = parseGifBuffer(fs.readFileSync(file));
  return decompressFrames(parsed, true).filter((f) => f.dims.width * f.dims.height >= MIN_PATCH_AREA).length;
}

export async function validateOutput(file, srcFile, minVisible = 80) {
  if (path.extname(file).toLowerCase() === ".png") {
    const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (countVisibleRgba(data) < minVisible) throw new Error("too few visible pixels");
    return;
  }

  const outN = usableFrameCount(file);
  const srcN = srcFile ? usableFrameCount(srcFile) : outN;
  if (srcN >= 2 && outN < 2) throw new Error(`animation lost (${outN} vs ${srcN})`);
  if (srcN >= 4 && outN < Math.floor(srcN * 0.5)) {
    throw new Error(`too few frames (${outN} vs ${srcN})`);
  }

  const parsed = parseGifBuffer(fs.readFileSync(file));
  const raw = decompressFrames(parsed, false).filter((f) => f.dims.width * f.dims.height >= MIN_PATCH_AREA);
  const { frames } = compositeToRgbaFrames(parsed, raw);
  const maxVisible = Math.max(...frames.map((f) => countVisibleRgba(f.rgba)));
  if (maxVisible < minVisible) throw new Error(`too few visible pixels (${maxVisible})`);
}

export async function processPng(src, dest) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const processed = removeBackgroundWhiteKey(data, info.width, info.height);
  await sharp(processed, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toFile(dest);
}

export async function processGif(src, dest) {
  const gif = await readGifFrames(src);
  writeGifOmggif(dest, gif);
  await validateOutput(dest, src);
}

function writePreviewHtml(samples) {
  const rows = samples
    .map(
      (s) => `
    <div class="card">
      <h3>${s.name}</h3>
      <div class="row">
        <div><div class="label">原图（黑底）</div><div class="box dark"><img src="assets/_opaque/${s.name}" /></div></div>
        <div><div class="label">透明（浅灰底）</div><div class="box light"><img src="assets/${s.name}" /></div></div>
        <div><div class="label">透明（白底）</div><div class="box white"><img src="assets/${s.name}" /></div></div>
      </div>
      <div class="meta">${s.frames} 帧 · ${s.note}</div>
    </div>`
    )
    .join("");

  fs.writeFileSync(
    PREVIEW,
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><title>透明处理预览</title>
<style>
body{font-family:"Microsoft YaHei",sans-serif;background:#0f172a;color:#e2e8f0;padding:20px}
h1{font-size:1.2rem}.card{background:#1e293b;border-radius:12px;padding:14px;margin:14px 0}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.box{height:180px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid #475569}
.box img{max-width:100%;max-height:100%;object-fit:contain}
.box.dark{background:#111}.box.light{background:repeating-conic-gradient(#ccc 0% 25%,#eee 0% 50%) 50%/14px 14px}
.box.white{background:#fff}.label{font-size:.8rem;color:#94a3b8;margin-bottom:6px}
.meta{font-size:.75rem;color:#64748b;margin-top:8px}
</style></head><body>
<h1>白底抠图 + disposal=2 全帧重编码 · 透明预览</h1>
<p>请在三个背景下检查：线条是否清晰、有无重影、白底是否干净。</p>
${rows}
</body></html>`,
    "utf8"
  );
}

async function main() {
  if (!fs.existsSync(OPAQUE)) {
    console.error("Missing assets/_opaque — run build_theme_assets.ps1 first.");
    process.exit(1);
  }

  const files = fs.readdirSync(OPAQUE).filter((f) => /\.(gif|png)$/i.test(f)).sort();
  let ok = 0;
  const samples = [];

  for (const file of files) {
    const src = path.join(OPAQUE, file);
    const dest = path.join(OUT, file);
    try {
      if (file.toLowerCase().endsWith(".png")) {
        await processPng(src, dest);
        await validateOutput(dest, src);
      } else {
        const before = usableFrameCount(src);
        await processGif(src, dest);
        const after = usableFrameCount(dest);
        if (samples.length < 8) {
          samples.push({ name: file, frames: `${after}/${before}`, note: "白底色键 + 全帧 disposal=2" });
        }
      }
      ok++;
      console.log(`OK ${file}`);
    } catch (err) {
      console.error(`FAIL ${file}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  if (samples.length) writePreviewHtml(samples);
  console.log(`done: ${ok}/${files.length} (white-bg chroma key, disposal=2 full frames)`);
  if (samples.length) console.log(`preview: ${PREVIEW}`);
}

import { pathToFileURL } from "node:url";
const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
