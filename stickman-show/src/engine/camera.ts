import { ease, lerp } from "./anim";
import { W, H } from "./theme";

/** Where the camera looks: zoom, and the point (in 1920x1080 space) that sits at screen centre. */
export type Cam = { zoom: number; x: number; y: number };
export type CamKey = [frame: number, cam: Partial<Cam>, dur?: number];

export const WIDE: Cam = { zoom: 1, x: W / 2, y: H / 2 };

/** Ease through camera keys, then add a slow push-in across the scene so no shot is ever static. */
export const camAt = (f: number, keys: CamKey[], duration: number, drift = 0.04): Cam => {
  let cur: Cam = { ...WIDE, ...(keys[0]?.[1] ?? {}) };
  for (let i = 1; i < keys.length; i++) {
    const [at, c, dur] = keys[i];
    if (f < at) break;
    const next = { ...cur, ...c };
    const t = ease(f, at, dur ?? 24);
    cur = { zoom: lerp(cur.zoom, next.zoom, t), x: lerp(cur.x, next.x, t), y: lerp(cur.y, next.y, t) };
  }
  const zoom = cur.zoom * (1 + (drift * Math.min(f, duration)) / Math.max(1, duration));
  // keep the frame edges inside the picture
  const hw = W / 2 / zoom;
  const hh = H / 2 / zoom;
  return { zoom, x: Math.min(W - hw, Math.max(hw, cur.x)), y: Math.min(H - hh, Math.max(hh, cur.y)) };
};

/** SVG transform for a layer. `depth` < 1 moves less (background parallax). */
export const camTransform = (c: Cam, depth = 1, shake: [number, number] = [0, 0]) => {
  const z = 1 + (c.zoom - 1) * depth;
  const x = W / 2 + (c.x - W / 2) * depth;
  const y = H / 2 + (c.y - H / 2) * depth;
  return `translate(${W / 2 + shake[0]} ${H / 2 + shake[1]}) scale(${z}) translate(${-x} ${-y})`;
};

/** A short decaying shake starting at each frame in `at`. */
export const shakeAt = (f: number, at: number[]): [number, number] => {
  let x = 0;
  let y = 0;
  for (const a of at) {
    const t = f - a;
    if (t < 0 || t > 14) continue;
    const k = (1 - t / 14) * 14;
    x += Math.sin(t * 2.7) * k;
    y += Math.cos(t * 3.3) * k * 0.6;
  }
  return [x, y];
};

/** The same transform as camTransform, as CSS (for HTML layers such as a painted background). */
export const camCss = (c: Cam, depth = 1, shake: [number, number] = [0, 0]) => {
  const z = 1 + (c.zoom - 1) * depth;
  const x = W / 2 + (c.x - W / 2) * depth;
  const y = H / 2 + (c.y - H / 2) * depth;
  return `translate(${W / 2 + shake[0]}px, ${H / 2 + shake[1]}px) scale(${z}) translate(${-x}px, ${-y}px)`;
};
