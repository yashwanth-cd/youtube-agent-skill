// Render a video's finished files into videos/<folder>/output/.
//
//   npm run render -- video-001-5-ways-to-get-rich            # long video, thumbnail, every Short
//   npm run render -- video-001-5-ways-to-get-rich --only thumbnail
//   npm run render -- video-001 --only shorts                  # a folder prefix is enough
//   npm run render -- video-001 --only short-2
//
// Set REMOTION_BROWSER to a local chrome-headless-shell if Remotion cannot download its own.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const target = args.find((a) => !a.startsWith("--") && a !== only);
if (!target) {
  console.error("usage: npm run render -- <video folder> [--only full|thumbnail|shorts|short-N]");
  process.exit(1);
}
const folder = fs.readdirSync(path.join(root, "videos")).find((d) => d === target || d.startsWith(target));
if (!folder) throw new Error(`no folder in videos/ matches "${target}"`);
const dir = path.join(root, "videos", folder);
const meta = JSON.parse(fs.readFileSync(path.join(dir, "video.json"), "utf8"));
const out = path.join(dir, "output");
fs.mkdirSync(path.join(out, "shorts"), { recursive: true });

const jobs = [];
const want = (k) => !only || only === k || (only === "shorts" && k.startsWith("short-"));
if (want("full")) jobs.push({ id: `${meta.id}-full`, file: path.join(out, `${meta.slug}.mp4`) });
if (want("thumbnail")) jobs.push({ id: `${meta.id}-thumbnail`, file: path.join(out, "thumbnail.png"), still: true });
for (const s of meta.shorts ?? []) {
  if (want(`short-${s.n}`)) jobs.push({ id: `${meta.id}-short-${s.n}`, file: path.join(out, "shorts", `short-${s.n}-${s.slug}.mp4`) });
}

const browserExecutable = process.env.REMOTION_BROWSER ?? null;
console.log(`bundling for ${folder}...`);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
for (const job of jobs) {
  const composition = await selectComposition({ serveUrl, id: job.id, browserExecutable });
  console.log(`${job.id} -> ${path.relative(root, job.file)}`);
  if (job.still) {
    await renderStill({ serveUrl, composition, output: job.file, browserExecutable });
    continue;
  }
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 20,
    outputLocation: job.file,
    browserExecutable,
    concurrency: Math.max(1, os.cpus().length),
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0 && pct !== last) console.log(`  ${pct}%`), (last = pct);
    },
  });
}
console.log("done. Update video.json status, then: npm run index");
