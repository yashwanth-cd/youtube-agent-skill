import { Audio } from "@remotion/media";
import React, { useContext } from "react";
import { AbsoluteFill, Series, interpolate, staticFile, useVideoConfig } from "remotion";
import { Media } from "./common";
import { VideoInput } from "./types";

export const MUSIC = "music/lofi-loop.wav";

/** The music bed: fades in, sits low under the voice, fades out. */
export const MusicBed: React.FC<{ volume?: number }> = ({ volume = 0.11 }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile(MUSIC)}
      loop
      loopVolumeCurveBehavior="extend"
      volume={(f) =>
        interpolate(f, [0, 30, durationInFrames - 90, durationInFrames], [0, volume, volume, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

/** A long video: every scene in script order, the last one stretched by the end card. */
export const LongVideo: React.FC<{ video: VideoInput & { scenes: Record<string, React.FC> } }> = ({ video }) => {
  const media = useContext(Media);
  const scenes = video.timing.scenes;
  return (
    <AbsoluteFill>
      {media.music && <MusicBed />}
      <Series>
        {scenes.map((s, i) => {
          const Comp = video.scenes[s.id];
          if (!Comp) throw new Error(`${video.id}: no component for scene "${s.id}"`);
          return (
            <Series.Sequence key={s.id} name={s.chapter} durationInFrames={s.durationInFrames + (i === scenes.length - 1 ? video.endCard : 0)}>
              <Comp />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
