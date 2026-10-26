// Render a few frames of any composition as PNGs, to check a scene without a full render.
//   npm run stills -- <compositionId> <outDir> <frame> [frame...]
//   npm run stills -- v002-scene-hook /tmp/stills 30 120 240
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [id, outDir, ...frames] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames) {
  const output = path.join(outDir, `${id}-${f}.png`);
  await renderStill({ serveUrl, composition, frame: Number(f), output, scale: 0.5, browserExecutable });
  console.log(output);
}
