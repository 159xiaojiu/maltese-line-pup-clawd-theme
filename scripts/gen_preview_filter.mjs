import fs from "fs";
import path from "path";
import { parseGIF, decompressFrames } from "gifuct-js";

const dir = path.resolve("handoff-gifs-only");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith(".gif"))
  .sort();

const rows = [];
for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  let cat = "animated";
  let frames = 0;
  let note = "";
  let w = 0;
  let h = 0;

  if (
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    cat = "fake";
    note = `实际是 WebP，不是 GIF 动图 · ${(buf.length / 1024).toFixed(1)} KB`;
  } else if (buf.slice(0, 3).toString("ascii") === "GIF") {
    try {
      const parsed = parseGIF(buf.buffer);
      const all = decompressFrames(parsed, true);
      frames = all.filter((x) => x.dims.width * x.dims.height >= 16).length;
      w = parsed.lsd.width;
      h = parsed.lsd.height;
      if (frames >= 2) {
        cat = "animated";
        note = `${frames} 帧 · ${w}×${h}`;
      } else {
        cat = "static";
        note = `${frames === 1 ? "仅 1 帧" : "解析异常"} · ${w}×${h}`;
      }
    } catch (e) {
      cat = "static";
      note = `损坏: ${e.message}`;
    }
  } else {
    cat = "static";
    note = "非 GIF 魔数";
  }

  rows.push({ f, cat, frames, note, size: buf.length });
}

const animated = rows.filter((r) => r.cat === "animated").length;
const fake = rows.filter((r) => r.cat === "fake").length;
const stat = rows.filter((r) => r.cat === "static").length;

const itemsJson = rows.map((r) => JSON.stringify(r)).join(",\n      ");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>线条小狗 · 动图筛选预览</title>
  <style>
    :root { --ok:#16a34a; --warn:#d97706; --bad:#dc2626; --bg:#0f172a; --card:#1e293b; --text:#e2e8f0; --muted:#94a3b8; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:"Segoe UI","Microsoft YaHei",sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    header { position:sticky; top:0; z-index:10; background:rgba(15,23,42,.95); backdrop-filter:blur(8px); border-bottom:1px solid #334155; padding:16px 20px; }
    h1 { margin:0 0 8px; font-size:1.25rem; }
    .path { font-family:Consolas,monospace; background:#0b1220; border:2px solid #3b82f6; border-radius:8px; padding:10px 12px; color:#93c5fd; word-break:break-all; margin:8px 0 12px; }
    .stats { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
    .pill { padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:600; }
    .pill.ok { background:rgba(22,163,74,.2); color:#86efac; border:1px solid var(--ok); }
    .pill.warn { background:rgba(217,119,6,.2); color:#fcd34d; border:1px solid var(--warn); }
    .pill.bad { background:rgba(220,38,38,.2); color:#fca5a5; border:1px solid var(--bad); }
    .filters { display:flex; flex-wrap:wrap; gap:8px; }
    button { cursor:pointer; border:1px solid #475569; background:var(--card); color:var(--text); padding:6px 12px; border-radius:8px; }
    button.active { border-color:#3b82f6; background:#1d4ed8; }
    main { padding:16px 20px 40px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
    .card { background:var(--card); border-radius:12px; overflow:hidden; border:2px solid transparent; transition:transform .15s; }
    .card:hover { transform:translateY(-2px); }
    .card.ok { border-color:var(--ok); box-shadow:0 0 0 1px rgba(22,163,74,.3); }
    .card.warn { border-color:var(--warn); box-shadow:0 0 0 1px rgba(217,119,6,.3); }
    .card.bad { border-color:var(--bad); box-shadow:0 0 0 1px rgba(220,38,38,.3); }
    .thumb { height:180px; display:flex; align-items:center; justify-content:center; background:repeating-conic-gradient(#334155 0% 25%,#1e293b 0% 50%) 50%/16px 16px; position:relative; }
    .thumb img { max-width:100%; max-height:100%; object-fit:contain; }
    .badge { position:absolute; top:8px; left:8px; font-size:.72rem; font-weight:700; padding:3px 8px; border-radius:6px; color:#fff; }
    .badge.ok { background:var(--ok); } .badge.warn { background:var(--warn); color:#111; } .badge.bad { background:var(--bad); }
    .meta { padding:10px 12px 12px; }
    .name { font-size:.78rem; word-break:break-all; color:#f8fafc; margin-bottom:6px; }
    .note { font-size:.75rem; color:var(--muted); }
    .legend { margin-top:10px; font-size:.85rem; color:var(--muted); }
    .hidden { display:none !important; }
  </style>
</head>
<body>
  <header>
    <h1>线条小狗 · 交接包动图筛选</h1>
    <div class="path">${dir.replace(/\\/g, "\\\\")}</div>
    <div class="stats" id="stats"></div>
    <div class="filters" id="filters">
      <button class="active" data-filter="all">全部 (${rows.length})</button>
      <button data-filter="animated">✅ 真动图 GIF (${animated})</button>
      <button data-filter="fake">⚠️ WebP 伪装 (${fake})</button>
      <button data-filter="static">❌ 静态/损坏 (${stat})</button>
      <button data-filter="theme">theme-* 主题用</button>
      <button data-filter="line">line-* LINE 包</button>
      <button data-filter="tenor">tenor-*</button>
    </div>
    <p class="legend">绿框 = 多帧真动图 · 橙框 = 扩展名 .gif 但实际 WebP · 红框 = 静态或损坏。请肉眼确认缩略图是否在动。</p>
  </header>
  <main><div class="grid" id="grid"></div></main>
  <script>
    const ITEMS = [
      ${itemsJson}
    ];
    const BADGE = { animated:{cls:'ok',text:'✅ 动图'}, fake:{cls:'warn',text:'⚠️ WebP伪装'}, static:{cls:'bad',text:'❌ 静态'} };
    const stats = document.getElementById('stats');
    const grid = document.getElementById('grid');
    const animated = ITEMS.filter(i => i.cat === 'animated').length;
    const fake = ITEMS.filter(i => i.cat === 'fake').length;
    const stat = ITEMS.filter(i => i.cat === 'static').length;
    stats.innerHTML = '<span class="pill ok">真动图 GIF：'+animated+' 个</span><span class="pill warn">WebP 伪装：'+fake+' 个</span><span class="pill bad">静态/损坏：'+stat+' 个</span><span class="pill">合计：'+ITEMS.length+' 个</span>';
    function prefix(f){ if(f.startsWith('theme-')) return 'theme'; if(f.startsWith('line-')) return 'line'; if(f.startsWith('tenor-')) return 'tenor'; return 'other'; }
    ITEMS.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card ' + (item.cat === 'animated' ? 'ok' : item.cat === 'fake' ? 'warn' : 'bad');
      card.dataset.cat = item.cat; card.dataset.prefix = prefix(item.f);
      const b = BADGE[item.cat];
      card.innerHTML = '<div class="thumb"><span class="badge '+b.cls+'">'+b.text+'</span><img src="'+item.f+'" alt="'+item.f+'" loading="lazy" /></div><div class="meta"><div class="name">'+item.f+'</div><div class="note">'+item.note+'</div></div>';
      grid.appendChild(card);
    });
    document.getElementById('filters').addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]'); if (!btn) return;
      document.querySelectorAll('#filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.card').forEach(card => {
        let show = f === 'all';
        if (f === 'animated') show = card.dataset.cat === 'animated';
        if (f === 'fake') show = card.dataset.cat === 'fake';
        if (f === 'static') show = card.dataset.cat === 'static';
        if (['theme','line','tenor'].includes(f)) show = card.dataset.prefix === f;
        card.classList.toggle('hidden', !show);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(dir, "preview-filter.html"), html, "utf8");
console.log(`preview: ${rows.length} files | animated=${animated} fake=${fake} static=${stat}`);
rows.filter((r) => r.cat !== "animated").forEach((r) => console.log(`  [${r.cat}] ${r.f} — ${r.note}`));
