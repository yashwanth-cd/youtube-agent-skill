import { Timing, makeTiming } from "#engine";
import timing from "./timing.json";
import { VOICE } from "./voice";

export const T = makeTiming(timing as Timing);

/** Frames after the last line for the end card. */
export const END_CARD = 150;

/** What every <Scene> needs: its lines, its voice track and its length. */
export const sceneProps = (id: string, extra = 0) => ({
  lines: T.lines(id),
  voice: VOICE[id],
  duration: T.scene(id).durationInFrames + extra,
});
