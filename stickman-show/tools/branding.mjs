// Render the channel's branding (profile picture, banner, watermark, wordmark) into channel/branding/.
//   npm run branding
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "channel", "branding");
fs.mkdirSync(out, { recursive: true });
const files = {
  "channel-avatar": "profile-picture-800.png",
  "channel-avatar-gold": "profile-picture-800-alt-gold.png",
  "channel-banner": "banner-2560x1440.png",
  "channel-watermark": "watermark-300.png",
  "channel-wordmark": "wordmark-transparent.png",
};
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
for (const [id, file] of Object.entries(files)) {
  const composition = comps.find((c) => c.id === id);
  const output = path.join(out, file);
  await renderStill({ serveUrl, composition, output, imageFormat: "png", browserExecutable });
  console.log(path.relative(root, output));
}
// YouTube wants the banner under 6 MB and the watermark under 1 MB; also give a 150px watermark
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(out, "watermark-300.png"), "-vf", "scale=150:150:flags=lanczos", path.join(out, "watermark-150.png")]);
for (const f of fs.readdirSync(out)) console.log(`${(fs.statSync(path.join(out, f)).size / 1e6).toFixed(2).padStart(6)} MB  ${f}`);
