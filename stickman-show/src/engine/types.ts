import React from "react";
import { Timing } from "./anim";
import { Script } from "./AutoScene";

export type Anchor = string | number;

/** One Short cut from a long video. Lives in the video's video.json under "shorts". */
export type ShortDef = {
  n: number;
  slug: string;
  /**
   * Where the span sits in the long video. A line anchor - "scene.key", optionally "+1.5" or
   * "-0.5" seconds - so the Short follows the narration if it is ever re-voiced. `from` uses the
   * line's start, `to` the line's end. Plain seconds also work.
   */
  from: Anchor;
  to: Anchor;
  /** A new first line, spoken over a frozen frame, because the long video's line needs context. */
  hook: string;
  /** Big text above the picture. Different words from the spoken hook. */
  onScreen: string;
  /** The moment shown frozen under the hook (a line's start, or seconds). Defaults to `from` + 1s. */
  still?: Anchor;
  /** Horizontal centre of the crop, in long-video pixels (0-1920). Defaults to the middle. */
  cropX?: number;
};

export type VideoInput = {
  /** "v001", "v002"... used as the prefix of every composition id. */
  id: string;
  timing: Timing;
  /** Frames after the last line for the end card. */
  endCard: number;
  /**
   * Hand-animated scene components, keyed by scene id. Any scene in script.json without one here
   * is built automatically from its beats (AutoScene).
   */
  scenes?: Record<string, React.FC>;
  /** The video's script.json - needed for automatic scenes. */
  script?: Script;
  /** Narration per scene (generated in src/voice.ts as VOICE). */
  voices?: Record<string, string>;
  Thumbnail: React.FC;
  shorts: ShortDef[];
  /** Spoken hook for each Short, keyed by slug (generated in src/voice.ts). */
  shortVoices: Record<string, string>;
};

export type VideoEntry = Omit<VideoInput, "scenes"> & {
  scenes: Record<string, React.FC>;
  Full: React.FC;
  shortComponents: Record<number, React.FC>;
  fullDuration: number;
  shortDuration: (s: ShortDef) => number;
};
