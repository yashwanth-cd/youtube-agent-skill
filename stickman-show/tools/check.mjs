// Validate a video's script.json and video.json before voicing or rendering, and estimate the
// runtime. Cheap: no bundling, no audio.
//   npm run check -- video-002
import fs from "node:fs";
import path from "node:path";

// keep in sync with src/engine/AutoScene.tsx and src/engine/Stick.tsx
const BEATS = ["title", "text", "tags", "list", "steps", "stamp", "bars", "jars", "compare", "flow", "prop", "props", "cross", "quote", "cast", "clear"];
const PROPS = ["jar", "bucket", "car", "fancyCar", "moneyTree", "safe", "tv", "shop", "lemonade", "couch", "bathtub", "basket", "hammock", "sign", "cash", "coin", "bill", "envelope", "calendar", "phone", "card", "clock", "gear", "book", "certificate", "ticket", "rocket", "snowball", "monster", "hammer", "pizza", "tea", "tumbleweed"];
const POSES = ["wave", "stand", "relaxed", "cheer", "pointR", "pointL", "pointUpR", "shrug", "sad", "think", "hold", "holdHigh", "present", "presentL", "hips", "shock", "facepalm", "push", "sit"];
const EXPRS = ["smile", "grin", "flat", "frown", "o", "worried", "smug", "sleep"];
const CAST = ["larry", "boss", "shady", "friend"];
const WPM = 160; // measured: the channel voice at lengthScale 0.95, gaps included

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const findVideo = (target) => {
  const folder = fs.readdirSync(path.join(root, "videos")).find((d) => d === target || d.startsWith(target ?? "\0"));
  if (!folder) throw new Error(`no folder in videos/ matches "${target}"`);
  return path.join(root, "videos", folder);
};

export const check = (dir) => {
  const errors = [];
  const warn = [];
  const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "video.json"), "utf8"));
  const lineKeys = new Map();
  const ids = new Set();
  let words = 0;
  for (const s of script.scenes ?? []) {
    if (!/^\w+$/.test(s.id ?? "")) errors.push(`scene id "${s.id}" must be letters, digits, underscore`);
    if (ids.has(s.id)) errors.push(`duplicate scene id "${s.id}"`);
    ids.add(s.id);
    if (!s.chapter) errors.push(`scene ${s.id}: missing "chapter"`);
    const keys = new Set();
    for (const l of s.lines ?? []) {
      const where = `${s.id}.${l.key}`;
      if (!/^\w+$/.test(l.key ?? "")) errors.push(`${where}: key must be letters, digits, underscore`);
      if (keys.has(l.key)) errors.push(`${where}: duplicate key in scene`);
      keys.add(l.key);
      if (!l.text?.trim()) errors.push(`${where}: empty text`);
      words += (l.text ?? "").split(/\s+/).filter(Boolean).length;
      if (/\d/.test(l.text ?? "")) warn.push(`${where}: digits in spoken text - write numbers as words so the voice reads them right`);
      if (l.pose && !POSES.includes(l.pose)) errors.push(`${where}: unknown pose "${l.pose}"`);
      if (l.expr && !EXPRS.includes(l.expr)) errors.push(`${where}: unknown expr "${l.expr}"`);
      const b = l.beat;
      if (b) {
        if (!BEATS.includes(b.type)) errors.push(`${where}: unknown beat type "${b.type}"`);
        if (b.type === "prop" && !PROPS.includes(b.name)) errors.push(`${where}: unknown prop "${b.name}"`);
        if (b.type === "props") for (const it of b.items ?? []) if (!PROPS.includes(it.name)) errors.push(`${where}: unknown prop "${it.name}"`);
        if (b.type === "cast" && !CAST.includes(b.who)) errors.push(`${where}: unknown cast "${b.who}"`);
        for (const k of ["items", "bars", "jars"]) if (k in b && (!Array.isArray(b[k]) || !b[k].length)) errors.push(`${where}: "${k}" must be a non-empty list`);
        if ((b.items?.length ?? 0) > 6) warn.push(`${where}: ${b.items.length} items is a lot for one beat`);
      }
    }
    lineKeys.set(s.id, keys);
  }
  for (const sh of meta.shorts ?? []) {
    for (const k of ["from", "to", "still"]) {
      const a = sh[k];
      if (typeof a !== "string") continue;
      const m = /^(\w+)\.(\w+)([+-][\d.]+)?$/.exec(a);
      if (!m || !lineKeys.get(m[1])?.has(m[2])) errors.push(`short ${sh.n}: ${k} "${a}" is not a scene.key in script.json`);
    }
    if (!sh.hook || !sh.onScreen || !sh.slug) errors.push(`short ${sh.n}: needs slug, hook and onScreen`);
  }
  const secs = (words / WPM) * 60;
  return { errors, warn, words, estimate: `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, "0")}` };
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const dir = findVideo(process.argv[2]);
  const r = check(dir);
  for (const w of r.warn) console.log(`warn   ${w}`);
  for (const e of r.errors) console.log(`ERROR  ${e}`);
  console.log(`${path.basename(dir)}: ${r.words} words, about ${r.estimate} once voiced. ${r.errors.length ? `${r.errors.length} error(s)` : "ok"}`);
  process.exit(r.errors.length ? 1 : 0);
}
