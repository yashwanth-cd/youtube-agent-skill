import React from "react";
import { AutoScene } from "./AutoScene";
import { LongVideo } from "./LongVideo";
import { Short, shortDuration } from "./Short";
import { VideoEntry, VideoInput } from "./types";

/** Turns a video's parts into the compositions Root registers: the long video, thumbnail and Shorts. */
export const defineVideo = (input: VideoInput): VideoEntry => {
  const last = input.timing.scenes.length - 1;
  const scenes: Record<string, React.FC> = { ...input.scenes };
  input.timing.scenes.forEach((t, i) => {
    if (scenes[t.id]) return;
    const s = input.script?.scenes.find((x) => x.id === t.id);
    if (!s) throw new Error(`${input.id}: scene "${t.id}" has no component and is not in script.json`);
    const voice = input.voices?.[t.id] ?? "";
    const duration = t.durationInFrames + (i === last ? input.endCard : 0);
    const Auto: React.FC = () => <AutoScene scene={s} index={i} timing={t} voice={voice} duration={duration} endCard={i === last ? input.endCard : 0} />;
    scenes[t.id] = Auto;
  });
  const video = { ...input, scenes };
  const Full: React.FC = () => <LongVideo video={video} />;
  const shortComponents = Object.fromEntries(
    video.shorts.map((s) => {
      const C: React.FC = () => <Short video={video} Full={Full} short={s} />;
      return [s.n, C];
    }),
  );
  return {
    ...video,
    Full,
    shortComponents,
    fullDuration: video.timing.scenes.reduce((a, s) => a + s.durationInFrames, 0) + video.endCard,
    shortDuration: (s) => shortDuration(video, s),
  };
};
