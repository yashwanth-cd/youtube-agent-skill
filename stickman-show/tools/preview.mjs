// One contact-sheet PNG of a video - a frame from each beat - so checking a whole video costs a
// single image. Writes out/preview-<id>.png (gitignored).
//   npm run preview -- video-002            # long video, up to 24 frames
//   npm run preview -- video-002 --short 1  # a Short, 6 frames
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const target = args[0];
const shortN = args.includes("--short") ? args[args.indexOf("--short") + 1] : null;
const folder = fs.readdirSync(path.join(root, "videos")).find((d) => d === target || d.startsWith(target ?? "\0"));
if (!folder) throw new Error(`usage: npm run preview -- <video folder> [--short N]`);
const dir = path.join(root, "videos", folder);
const meta = JSON.parse(fs.readFileSync(path.join(dir, "video.json"), "utf8"));
const timing = JSON.parse(fs.readFileSync(path.join(dir, "src", "timing.json"), "utf8"));

const id = shortN ? `${meta.id}-short-${shortN}` : `${meta.id}-full`;
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });

let frames;
if (shortN) {
  frames = [0.05, 0.2, 0.35, 0.5, 0.7, 0.9].map((p) => Math.floor(p * composition.durationInFrames));
} else {
  // the end of each line, when everything its beat brings in has landed
  let offset = 0;
  frames = [];
  for (const s of timing.scenes) {
    for (const l of s.lines) frames.push(offset + Math.max(l.start + 10, l.end - 3));
    offset += s.durationInFrames;
  }
  frames.push(composition.durationInFrames - 20);
  if (frames.length > 24) frames = Array.from({ length: 24 }, (_, i) => frames[Math.round((i * (frames.length - 1)) / 23)]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "preview-"));
const scale = shortN ? 0.25 : 0.3;
const files = [];
for (const f of frames) {
  const output = path.join(tmp, `${String(f).padStart(6, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: f, output, scale, browserExecutable });
  files.push(output);
}
const cols = shortN ? 6 : 4;
const w = Math.round(composition.width * scale);
const h = Math.round(composition.height * scale);
const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
const outFile = path.join(root, "out", `preview-${id}.png`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `xstack=inputs=${files.length}:layout=${layout}:fill=white`, outFile]);
fs.rmSync(tmp, { recursive: true });
console.log(`${path.relative(process.cwd(), outFile)}  (${files.length} frames: ${frames.join(", ")})`);
