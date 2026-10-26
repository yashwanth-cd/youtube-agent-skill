import { Audio } from "@remotion/media";
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line, ease, lerp } from "./anim";
import { C, GROUND, H, W } from "./theme";
import { Coin } from "./props";
import { Captions, Ground, Stage, Txt } from "./ui";

export type SfxName = "pop" | "whoosh" | "ding" | "thud" | "tick";
export type Cue = [at: number, name: SfxName, volume?: number];

/**
 * What the scenes play. A Short re-uses the long video's scenes but brings its own captions and
 * music, and freezes a frame (silently) under its new hook line.
 */
export const Media = createContext({ voice: true, sfx: true, music: true, captions: true });

/**
 * Every scene sits in this: its own voiceover track, the paper stage, the ground line, captions,
 * its sound effects, and a soft dip to paper at either end so scene changes are not hard cuts.
 */
export const Scene: React.FC<{
  lines: Record<string, Line>;
  voice: string;
  duration: number;
  sfx?: Cue[];
  ground?: boolean;
  children: React.ReactNode;
  captions?: boolean;
}> = ({
  lines: L,
  voice,
  duration: durationInFrames,
  sfx = [],
  ground = true,
  children,
  captions = true,
}) => {
  const frame = useCurrentFrame();
  const media = useContext(Media);
  const dip = Math.max(
    interpolate(frame, [0, 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [durationInFrames - 7, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <AbsoluteFill>
      {media.voice && voice && <Audio src={voice} />}
      {media.sfx &&
        sfx.map(([at, name, volume = 0.45], i) => (
          <Sequence key={i} from={Math.round(at)} durationInFrames={45} layout="none">
            <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
          </Sequence>
        ))}
      <Stage>
        {ground && <Ground />}
        {children}
        {captions && media.captions && <Captions lines={Object.values(L)} />}
        <rect width={W} height={H} fill={C.paper} opacity={dip} />
      </Stage>
    </AbsoluteFill>
  );
};

/** A coin that arcs from one point to another between `at` and `at + dur`, then disappears. */
export const FlyCoin: React.FC<{ at: number; from: [number, number]; to: [number, number]; dur?: number; arc?: number; scale?: number; keep?: boolean }> = ({
  at,
  from,
  to,
  dur = 18,
  arc = 160,
  scale = 1.3,
  keep = false,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || (!keep && frame > at + dur)) return null;
  const t = ease(frame, at, dur, (x) => x);
  const x = lerp(from[0], to[0], t);
  const y = lerp(from[1], to[1], t) - Math.sin(Math.PI * t) * arc;
  return <Coin x={x} y={y} scale={scale} rotate={t * 540} />;
};

/** Several coins in a row along the same flight path. */
export const CoinStream: React.FC<{ at: number; from: [number, number]; to: [number, number]; n?: number; every?: number; dur?: number; arc?: number; scale?: number }> = ({
  at,
  from,
  to,
  n = 3,
  every = 6,
  dur = 18,
  arc = 160,
  scale,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <FlyCoin key={i} at={at + i * every} from={from} to={to} dur={dur} arc={arc} scale={scale} />
    ))}
  </>
);

/** Cue list for a coin stream, so the sound lines up with each coin landing. */
export const streamCues = (at: number, n = 3, every = 6, dur = 18, name: SfxName = "pop", volume = 0.3): Cue[] =>
  Array.from({ length: n }, (_, i) => [at + i * every + dur, name, volume] as Cue);

export const Thought: React.FC<{ x: number; y: number; w?: number; h?: number; children: React.ReactNode; from?: [number, number] }> = ({
  x,
  y,
  w = 520,
  h = 220,
  children,
  from,
}) => (
  <g>
    {from && (
      <>
        <circle cx={lerp(from[0], x, 0.25)} cy={lerp(from[1], y + h / 2, 0.25)} r={10} fill={C.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={lerp(from[0], x, 0.5)} cy={lerp(from[1], y + h / 2, 0.5)} r={16} fill={C.white} stroke={C.ink} strokeWidth={4} />
      </>
    )}
    <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={C.white} stroke={C.ink} strokeWidth={6} />
    {children}
  </g>
);

/** Floating Zs for a sleeping figure. */
export const Zzz: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const k = ((frame + i * 20) % 60) / 60;
        return (
          <Txt key={i} x={x + k * 50 + i * 6} y={y - k * 120} size={30 + k * 30} font="display" opacity={Math.sin(Math.PI * k)}>
            Z
          </Txt>
        );
      })}
    </g>
  );
};

export { GROUND };
