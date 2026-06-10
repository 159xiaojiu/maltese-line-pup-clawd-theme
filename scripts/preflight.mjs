/**
 * Basic integrity check only — does NOT judge visual quality.
 * Checks: files exist, GIF frame count preserved, duplicate pools.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseGIF, decompressFrames } from "gifuct-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets");
const OPAQUE = path.join(ROOT, "assets", "_opaque");
const theme = JSON.parse(fs.readFileSync(path.join(ROOT, "theme.json"), "utf8"));

function collectPools() {
  const pools = [];
  for (const [name, files] of Object.entries(theme.states)) {
    if (Array.isArray(files) && files.length > 1) pools.push({ name, files });
  }
  if (theme.reactions?.double?.files?.length > 1) {
    pools.push({ name: "reactions.double", files: theme.reactions.double.files });
  }
  const idleAnims = (theme.idleAnimations || []).map((a) => a.file);
  if (idleAnims.length > 1) pools.push({ name: "idleAnimations", files: idleAnims });
  return pools;
}

function allReferenced() {
  const s = new Set();
  for (const v of Object.values(theme.states)) {
    if (Array.isArray(v)) v.forEach((f) => s.add(f));
  }
  for (const t of theme.workingTiers || []) s.add(t.file);
  for (const t of theme.jugglingTiers || []) s.add(t.file);
  for (const a of theme.idleAnimations || []) s.add(a.file);
  for (const r of theme.reactions?.double?.files || []) s.add(r);
  if (theme.reactions?.clickLeft?.file) s.add(theme.reactions.clickLeft.file);
  if (theme.reactions?.clickRight?.file) s.add(theme.reactions.clickRight.file);
  return [...s];
}

function gifFrames(file) {
  const parsed = parseGIF(fs.readFileSync(file).buffer);
  return decompressFrames(parsed, true).filter((f) => f.dims.width * f.dims.height >= 16).length;
}

const problems = [];
const files = allReferenced();

for (const f of files) {
  const p = path.join(OUT, f);
  const o = path.join(OPAQUE, f);
  if (!fs.existsSync(p)) problems.push(`${f}: missing in assets/`);
  if (!fs.existsSync(o)) problems.push(`${f}: missing in assets/_opaque/`);
  if (f.endsWith(".gif") && fs.existsSync(p) && fs.existsSync(o)) {
    const outN = gifFrames(p);
    const srcN = gifFrames(o);
    if (srcN >= 2 && outN < Math.floor(srcN * 0.8)) {
      problems.push(`${f}: frame count dropped (${outN} vs ${srcN})`);
    }
  }
}

for (const pool of collectPools()) {
  const byHash = new Map();
  for (const f of pool.files) {
    const p = path.join(OUT, f);
    if (!fs.existsSync(p)) continue;
    const h = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(f);
  }
  for (const [, names] of byHash) {
    if (names.length > 1) problems.push(`${pool.name} duplicate: ${names.join(" = ")}`);
  }
}

console.log(`preflight: ${files.length} files (integrity only, NOT visual QA)`);
if (problems.length) {
  problems.forEach((p) => console.error(" -", p));
  process.exit(1);
}
console.log("preflight: integrity ok");
