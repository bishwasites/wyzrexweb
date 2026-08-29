// One-off asset generation script: turns the raw Spline canvas capture
// (public/assets/hero/robot-raw.png, opaque white background — the
// WebGPU-backed <spline-viewer> canvas doesn't preserve alpha on readback
// even though its on-screen compositing is transparent) into the optimized
// poster used as the hero's LCP element, plus a tiny base64 blur
// placeholder. Background removal is a border-flood-fill key rather than a
// flat color-distance threshold, specifically so it does NOT punch holes in
// the robot's own near-white specular highlights (head, wrist) — those
// pixels are never connected to the image border, so the fill can't reach
// them. Not part of the runtime app — run manually with
// `node scripts/process-hero-poster.mjs` whenever the source capture changes.
import sharp from "sharp";
import path from "path";

const src = path.join(process.cwd(), "assets-source", "hero", "robot-raw.png");
const outPoster = path.join(process.cwd(), "public", "assets", "hero", "robot-poster.webp");

const img = sharp(src).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

function idx(x, y) {
  return (y * width + x) * channels;
}
function isBg(x, y) {
  const i = idx(x, y);
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  // Distance from pure white — generous threshold since the render is
  // anti-aliased against white at the silhouette edge.
  const dist = 255 - Math.min(r, g, b);
  return dist < 28;
}

const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y]);
}

while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const vi = y * width + x;
  if (visited[vi]) continue;
  if (!isBg(x, y)) continue;
  visited[vi] = 1;
  const i = idx(x, y);
  data[i + 3] = 0; // transparent
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

const keyed = sharp(data, { raw: { width, height, channels } }).png();
const keyedBuf = await keyed.toBuffer();

const trimmed = sharp(keyedBuf).trim({ threshold: 1 });
const meta = await trimmed.clone().metadata();
console.log("keyed+trimmed size:", meta.width, "x", meta.height);

await trimmed.clone().resize({ width: 1200 }).webp({ quality: 78 }).toFile(outPoster);
const posterMeta = await sharp(outPoster).metadata();
console.log("poster written:", posterMeta.width, "x", posterMeta.height, posterMeta.hasAlpha, outPoster);

const blurBuf = await trimmed.clone().resize({ width: 12 }).webp({ quality: 40 }).toBuffer();
const blurDataURL = `data:image/webp;base64,${blurBuf.toString("base64")}`;
console.log("blurDataURL:", blurDataURL);
console.log("blurDataURL length:", blurDataURL.length);
console.log("aspect ratio (w/h):", (posterMeta.width / posterMeta.height).toFixed(4));
