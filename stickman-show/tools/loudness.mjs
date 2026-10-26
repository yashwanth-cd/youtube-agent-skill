// Normalise a rendered video's audio to YouTube's loudness (-14 LUFS, -1 dBTP). Picture is copied
// untouched, so this takes seconds. render.mjs runs it on every MP4 it makes.
//   node tools/loudness.mjs <file.mp4> [more.mp4...]
import { execFileSync } from "node:child_process";
import fs from "node:fs";

export const normalize = (file) => {
  const tmp = file.replace(/\.mp4$/, ".loudnorm.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, file);
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  for (const f of process.argv.slice(2)) {
    normalize(f);
    console.log(`normalised ${f}`);
  }
}
