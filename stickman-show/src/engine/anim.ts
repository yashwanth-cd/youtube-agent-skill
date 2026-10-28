import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;

export type Line = { key: string; text: string; start: number; end: number };
export type SceneTiming = { id: string; chapter: string; durationInFrames: number; lines: Line[]; mouth?: string };
/** What tools/tts.py writes to a video's src/timing.json. */
export type Timing = {
  fps: number;
  scenes: SceneTiming[];
  shorts?: Record<string, { text: string; durationInFrames: number; mouth?: string }>;
};

/** Timing helpers bound to one video's timing.json. */
export const makeTiming = (timing: Timing) => {
  const scene = (id: string) => {
    const s = timing.scenes.find((x) => x.id === id);
    if (!s) throw new Error(`no timing for scene ${id}`);
    return s;
  };
  return {
    timing,
    scene,
    /** Line timings for a scene, keyed by the line's key in script.json. */
    lines: (id: string): Record<string, Line> => Object.fromEntries(scene(id).lines.map((l) => [l.key, l])),
    /** Total length of the long video, end card included. */
    total: (endCard: number) => timing.scenes.reduce((a, s) => a + s.durationInFrames, 0) + endCard,
  };
};

/** Every line with its frame on the whole video's timeline. */
export const absoluteLines = (timing: Timing): Line[] => {
  let offset = 0;
  const out: Line[] = [];
  for (const s of timing.scenes) {
    for (const l of s.lines) out.push({ ...l, start: l.start + offset, end: l.end + offset });
    offset += s.durationInFrames;
  }
  return out;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 over `dur` frames from `start`, eased out. */
export const ease = (frame: number, start: number, dur = 15, easing = Easing.bezier(0.16, 1, 0.3, 1)) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing });

export const easeInOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

/** Springy 0 -> 1 with a little overshoot, for things popping into frame. */
export const pop = (frame: number, start: number, fps = FPS) =>
  spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });

export const fadeOut = (frame: number, end: number, dur = 10) =>
  interpolate(frame, [end - dur, end], [1, 0], clamp);

/** Visible from `start` (fading in) until `end` (fading out). */
export const window = (frame: number, start: number, end: number, dur = 10) =>
  Math.min(ease(frame, start, dur), fadeOut(frame, end, dur));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mix = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, { ...clamp, easing: Easing.inOut(Easing.cubic) });

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Is the narrator speaking at this frame? Drives the mouth. */
export const speaking = (frame: number, ls: Record<string, Line>) =>
  Object.values(ls).some((l) => frame >= l.start && frame < l.end - 2);
