import fs from "fs";
import path from "path";
import { parseGIF, decompressFrames } from "gifuct-js";

const root = path.resolve("..");

function scanGif(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.slice(0, 4).toString("ascii") === "RIFF") {
    return { type: "webp", size: buf.length };
  }
  if (buf.slice(0, 3).toString("ascii") !== "GIF") {
    return { type: "other", size: buf.length, magic: buf.slice(0, 8).toString("hex") };
  }
  const parsed = parseGIF(buf.buffer);
  const frames = decompressFrames(parsed, true).filter(
    (x) => x.dims.width * x.dims.height >= 16
  ).length;
  return {
    type: frames >= 2 ? "animated" : "static",
    frames,
    w: parsed.lsd.width,
    h: parsed.lsd.height,
    size: buf.length,
  };
}

const stickerRoot = path.join(root, "assets", "line-stickers");
const gifs = [];
for (const dir of fs.readdirSync(stickerRoot, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pack = dir.name;
  walk(path.join(stickerRoot, pack));
}
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.toLowerCase().endsWith(".gif")) {
      const rel = path.relative(stickerRoot, p).replace(/\\/g, "/");
      gifs.push({ rel, ...scanGif(p) });
    }
  }
}

console.log("LINE GIF count:", gifs.length);
console.log("animated:", gifs.filter((g) => g.type === "animated").length);

// Extract tenor URLs from saved page
const html = fs.readFileSync(path.join(root, "assets", "raw", "tenor_page.html"), "utf8");
const cacheMatch = html.match(/<script id="store-cache"[^>]*>(\{[\s\S]*?\})<\/script>/);
if (!cacheMatch) {
  console.log("\nNo store-cache in tenor_page.html");
} else {
  const data = JSON.parse(cacheMatch[1]);
  const results =
    data?.universal?.search?.["maltese white dog-low-all"]?.results ?? [];
  console.log("\nTenor page results:", results.length);
  for (const item of results) {
    const desc = item.title || item.content_description || item.id;
    const mf = item.media_formats || {};
    for (const key of ["gif", "mediumgif", "tinygif", "nanogif"]) {
      const gif = mf[key];
      if (!gif?.url) continue;
      const u = gif.url.replace(/\\u002F/g, "/");
      const info = scanUrl(u);
      console.log("-", desc, "|", key, gif.dims, info.type, info.frames ?? "", "|", u);
      break;
    }
  }
}

async function scanUrl(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.slice(0, 4).toString("ascii") === "RIFF") return { type: "webp", size: buf.length };
    if (buf.slice(0, 3).toString("ascii") !== "GIF") return { type: "other", size: buf.length };
    const parsed = parseGIF(buf.buffer);
    const frames = decompressFrames(parsed, true).filter(
      (x) => x.dims.width * x.dims.height >= 16
    ).length;
    return { type: frames >= 2 ? "animated" : "static", frames, w: parsed.lsd.width, h: parsed.lsd.height, size: buf.length };
  } catch (e) {
    return { type: "error", err: e.message };
  }
}

// Also try direct tenor media patterns for known community IDs
const directIds = ["27411047", "27411069", "27411075"];
console.log("\nDirect tenor.com page scrape:");
for (const id of directIds) {
  try {
    const res = await fetch(`https://tenor.com/view/line-dog-${id}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    const page = await res.text();
    const gifUrls = [...page.matchAll(/https:\/\/media\.tenor\.com\/[^"'\s]+\.gif/g)].map((m) => m[0]);
    const uniq = [...new Set(gifUrls)];
    console.log("id", id, "urls", uniq.length);
    for (const u of uniq.slice(0, 3)) {
      const info = await scanUrl(u);
      console.log(" ", info.type, info.frames ?? "", u.slice(0, 90));
    }
  } catch (e) {
    console.log("id", id, "fail", e.message);
  }
}
