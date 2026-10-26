// Start the next video: makes videos/video-NNN-<slug>/ from the template and registers it.
//   npm run new-video -- <slug> "<Working title>"
//   npm run new-video -- compound-interest "Compound Interest, Explained by a Stick Figure"
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [slug, title = "Untitled"] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('usage: npm run new-video -- <slug-in-kebab-case> "<Working title>"');
  process.exit(1);
}
const videos = path.join(root, "videos");
const numbers = fs.readdirSync(videos).map((d) => /^video-(\d{3})-/.exec(d)?.[1]).filter(Boolean).map(Number);
const n = (numbers.length ? Math.max(...numbers) : 0) + 1;
const nnn = String(n).padStart(3, "0");
const id = `v${nnn}`;
const folder = `video-${nnn}-${slug}`;
const dir = path.join(videos, folder);
const template = path.join(root, "tools", "template");

const fill = (s) => s.replaceAll("__ID__", id).replaceAll("\"number\": 0,", `"number": ${n},`).replaceAll("__SLUG__", slug).replaceAll("__TITLE__", title).replaceAll("__FOLDER__", folder);
const copy = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);
    if (e.isDirectory()) copy(src, dst);
    else fs.writeFileSync(dst, fill(fs.readFileSync(src, "utf8")));
  }
};
copy(template, dir);
for (const d of ["audio/vo", "audio/shorts", "captions", "reports", "output/shorts"]) fs.mkdirSync(path.join(dir, d), { recursive: true });

// register it in src/videos.ts
const reg = path.join(root, "src", "videos.ts");
let src = fs.readFileSync(reg, "utf8");
src = src.replace(/\n\nexport const VIDEOS = \[(.*)\];/s, (_, list) => `\nimport ${id} from "../videos/${folder}/src";\n\nexport const VIDEOS = [${list}, ${id}];`);
fs.writeFileSync(reg, src);

console.log(`created videos/${folder} (${id})`);
console.log(`next: write the script with /yt-script into videos/${folder}/script.json, then`);
console.log(`      npm run voice -- videos/${folder}`);
