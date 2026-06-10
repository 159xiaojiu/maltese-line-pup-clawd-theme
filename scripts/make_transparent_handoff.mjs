/**
 * Process remaining handoff GIFs (line-*, tenor-*) with white-bg chroma key.
 * theme-* copies from already-processed assets/ (theme-maltese-x → maltese-x).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processGif, validateOutput, usableFrameCount } from "./make_transparent.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "handoff-gifs-only");
const OUT = path.join(ROOT, "handoff-gifs-transparent");
const ASSETS = path.join(ROOT, "assets");
const PREVIEW = path.join(ROOT, "preview-handoff-transparent.html");

function themeToAssetName(themeFile) {
  return themeFile.replace(/^theme-/, "");
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing handoff-gifs-only/");
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".gif")).sort();

  let ok = 0;
  let copied = 0;
  const samples = [];

  for (const file of files) {
    const dest = path.join(OUT, file);
    try {
      if (file.startsWith("theme-")) {
        const assetName = themeToAssetName(file);
        const assetPath = path.join(ASSETS, assetName);
        if (!fs.existsSync(assetPath)) throw new Error(`missing assets/${assetName}`);
        fs.copyFileSync(assetPath, dest);
        copied++;
        console.log(`COPY ${file} <- assets/${assetName}`);
        if (samples.length < 6) samples.push({ file, mode: "copy", frames: usableFrameCount(dest) });
        ok++;
        continue;
      }

      if (!file.startsWith("line-") && !file.startsWith("tenor-")) {
        console.log(`SKIP ${file}`);
        continue;
      }

      const src = path.join(SRC, file);
      const before = usableFrameCount(src);
      await processGif(src, dest);
      await validateOutput(dest, src);
      const after = usableFrameCount(dest);
      ok++;
      console.log(`OK ${file} (${after}/${before} frames)`);
      if (samples.length < 12) samples.push({ file, mode: "process", frames: `${after}/${before}` });
    } catch (err) {
      console.error(`FAIL ${file}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  writePreview(samples);
  console.log(`done: ${ok}/${files.length} (${copied} theme copies + ${ok - copied} line/tenor processed)`);
  console.log(`output: ${OUT}`);
  console.log(`preview: ${PREVIEW}`);
}

function writePreview(samples) {
  const cards = samples
    .map(
      (s) => `<div class="card"><h3>${s.file}</h3>
<div class="row">
<div><div class="label">原图</div><div class="box dark"><img src="handoff-gifs-only/${s.file}"/></div></div>
<div><div class="label">透明</div><div class="box light"><img src="handoff-gifs-transparent/${s.file}"/></div></div>
</div><div class="meta">${s.mode} · ${s.frames} 帧</div></div>`
    )
    .join("");

  fs.writeFileSync(
    PREVIEW,
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><title>交接包透明预览</title>
<style>body{font-family:"Microsoft YaHei",sans-serif;background:#0f172a;color:#e2e8f0;padding:20px}
.card{background:#1e293b;border-radius:12px;padding:12px;margin:10px 0}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.box{height:160px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid #475569}
.box img{max-width:100%;max-height:100%;object-fit:contain}.box.dark{background:#111}
.box.light{background:repeating-conic-gradient(#ccc 0% 25%,#eee 0% 50%) 50%/14px 14px}
.label{font-size:.78rem;color:#94a3b8;margin-bottom:4px}.meta{font-size:.72rem;color:#64748b;margin-top:6px}</style></head>
<body><h1>交接包动图透明处理（line / tenor / theme）</h1>${cards}</body></html>`,
    "utf8"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
