// The whole pipeline for one video: check -> voice -> typecheck -> render -> index.
//   npm run make -- video-002                    # everything
//   npm run make -- video-002 --skip-voice       # script unchanged, re-render only
//   npm run make -- video-002 --only shorts      # passes --only through to render
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { check, findVideo } from "./check.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const dir = findVideo(args[0]);
const run = (cmd, a) => execFileSync(cmd, a, { cwd: root, stdio: "inherit" });

const r = check(dir);
for (const e of r.errors) console.log(`ERROR  ${e}`);
if (r.errors.length) process.exit(1);
console.log(`check ok: ${r.words} words, about ${r.estimate}`);

if (!args.includes("--skip-voice")) {
  const py = fs.existsSync(path.join(root, "tools/.venv/bin/python")) ? path.join(root, "tools/.venv/bin/python") : "python3";
  run(py, ["tools/tts.py", dir]);
}
run("npx", ["tsc", "--noEmit"]);
const only = args.includes("--only") ? ["--only", args[args.indexOf("--only") + 1]] : [];
run("node", ["tools/render.mjs", path.basename(dir), ...only]);
run("node", ["tools/index.mjs"]);

const out = path.join(dir, "output");
const list = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? list(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of list(out)) {
  const mb = fs.statSync(f).size / 1e6;
  console.log(`${mb.toFixed(1).padStart(6)} MB  ${path.relative(root, f)}${mb > 95 ? "  <- over GitHub's 100 MB limit risk: re-render with a higher CRF" : ""}`);
}
