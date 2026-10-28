// Validate a video's script.json and video.json before voicing or rendering, and estimate the
// runtime. Cheap: no bundling, no audio.
//   npm run check -- video-002
import fs from "node:fs";
import path from "node:path";
import { ICON_NAMES, sync } from "./icons.mjs";

// keep in sync with src/engine/AutoScene.tsx and src/engine/Stick.tsx
const BEATS = ["title", "text", "icon", "cards", "chart", "counter", "donut", "grid", "timeline", "tags", "list", "steps", "stamp", "bars", "jars", "compare", "flow", "prop", "props", "cross", "quote", "cast", "clear"];
// hand-drawn props; any Fluent icon name is accepted wherever a prop is
const PROPS = ["jar", "bucket", "car", "moneyTree", "safe", "basket", "hammock", "phone", "card", "monster", "bathtub", "lemonade", "snowball"];
const SETS = ["room", "office", "street", "park", "stage", "board", "kitchen", "bank"];
const EMOTES = ["idea", "sweat", "question", "exclaim", "money", "love", "sparkle", "angry", "zzz", "fire", "think"];
const CAMERAS = ["wide", "stick", "content", "close"];
const BURSTS = ["confetti", "coins", "sparkle"];
const ACTS = ["enter", "exit", "jump", "panic", "fall", "sleep", "shiver", "think", "celebrate"];
const SPEAKERS = ["stick", "larry", "boss", "shady", "friend"];
const ICONS = new Set(ICON_NAMES);
const thing = (n) => PROPS.includes(n) || ICONS.has(n);
const POSES = ["wave", "stand", "relaxed", "cheer", "pointR", "pointL", "pointUpR", "shrug", "sad", "think", "hold", "holdHigh", "present", "presentL", "hips", "shock", "facepalm", "push", "sit"];
const EXPRS = ["smile", "grin", "flat", "frown", "o", "worried", "smug", "sleep"];
const CAST = ["larry", "boss", "shady", "friend"];
const WPM = 150; // measured: Kokoro am_michael at speed 1.0, pauses included (991 words -> 6:37)

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
    if (s.set && !SETS.includes(s.set)) errors.push(`scene ${s.id}: unknown set "${s.set}" - one of ${SETS.join(", ")}`);
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
      if (l.emote && !EMOTES.includes(l.emote)) errors.push(`${where}: unknown emote "${l.emote}"`);
      if (l.camera && !CAMERAS.includes(l.camera)) errors.push(`${where}: unknown camera "${l.camera}"`);
      if (l.burst && !BURSTS.includes(l.burst)) errors.push(`${where}: unknown burst "${l.burst}"`);
      if (l.holding && !ICONS.has(l.holding)) errors.push(`${where}: holding "${l.holding}" is not a Fluent icon`);
      if (l.act && !ACTS.includes(l.act)) errors.push(`${where}: unknown act "${l.act}" - one of ${ACTS.join(", ")}`);
      if (l.speaker && !SPEAKERS.includes(l.speaker)) errors.push(`${where}: unknown speaker "${l.speaker}"`);
      if (l.x !== undefined && (typeof l.x !== "number" || l.x < 100 || l.x > 1820)) errors.push(`${where}: x must be a number between 100 and 1820`);
      if (l.give && (!ICONS.has(l.give.icon) || !["stick", "cast"].includes(l.give.from) || !["stick", "cast"].includes(l.give.to))) errors.push(`${where}: give needs {icon, from: stick|cast, to: stick|cast}`);
      if (l.coins && (l.coins.from === undefined || l.coins.to === undefined)) errors.push(`${where}: coins needs {from, to} (stick, cast or an x position)`);
      const b = l.beat;
      if (b) {
        if (!BEATS.includes(b.type)) errors.push(`${where}: unknown beat type "${b.type}"`);
        if (b.type === "prop" && !thing(b.name)) errors.push(`${where}: "${b.name}" is not a prop or Fluent icon`);
        if (b.type === "props") for (const it of b.items ?? []) if (!thing(it.name)) errors.push(`${where}: "${it.name}" is not a prop or Fluent icon`);
        // every icon named anywhere in the beat must exist
        JSON.stringify(b, (k, v) => {
          if ((k === "icon" && typeof v === "string") || (k === "icons" && Array.isArray(v))) {
            for (const n of [].concat(v)) if (!ICONS.has(n)) errors.push(`${where}: unknown icon "${n}" (npm run icons -- search <word>)`);
          }
          return v;
        });
        for (const k of ["series", "segments", "points"]) if (k in b && (!Array.isArray(b[k]) || !b[k].length)) errors.push(`${where}: "${k}" must be a non-empty list`);
        if (b.type === "chart") for (const s of b.series ?? []) if ((s.values ?? []).length !== (b.x ?? []).length) errors.push(`${where}: series "${s.label}" needs one value per x label`);
        if (b.type === "cast" && !CAST.includes(b.who)) errors.push(`${where}: unknown cast "${b.who}"`);
        for (const k of ["items", "bars", "jars"]) if (k in b && (!Array.isArray(b[k]) || !b[k].length)) errors.push(`${where}: "${k}" must be a non-empty list`);
        if ((b.items?.length ?? 0) > 6) warn.push(`${where}: ${b.items.length} items is a lot for one beat`);
        if (b.type === "cross") for (const n of b.items ?? []) if (!thing(n) && n.length > 14) warn.push(`${where}: cross item "${n}" is long text - use an icon name`);
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
  const iconSync = sync();
  for (const n of iconSync.missing) errors.push(`unknown icon "${n}"`);
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
