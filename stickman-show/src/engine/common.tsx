import { Audio } from "@remotion/media";
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line, ease, lerp } from "./anim";
import { CamKey, camAt, camCss, camTransform, shakeAt } from "./camera";
import { SetBg, SetName } from "./sets";
import { BOLD, C, GROUND, H, NIGHT, W } from "./theme";
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
 * Every scene sits in this: its own voiceover track, the background (an illustrated set, or plain
 * paper), the camera, captions, its sound effects, and the transition in and out.
 *
 * With a `set`, the scene gets the full look: a parallax camera (`camera` keys plus a slow
 * push-in), swipe transitions and karaoke captions. Without one it is the original paper style.
 */
export const Scene: React.FC<{
  lines: Record<string, Line>;
  voice: string;
  duration: number;
  sfx?: Cue[];
  ground?: boolean;
  children: React.ReactNode;
  captions?: boolean;
  set?: SetName;
  camera?: CamKey[];
  shake?: number[];
  /** Drawn on top of the camera (not moved by it): titles, overlays. */
  overlay?: React.ReactNode;
  /** A painted background image (e.g. made with WanGP) used instead of the drawn set. */
  background?: string;
}> = ({ lines: L, voice, duration: durationInFrames, sfx = [], ground = true, children, captions = true, set, camera = [], shake = [], overlay, background }) => {
  const frame = useCurrentFrame();
  const media = useContext(Media);
  const audio = (
    <>
      {media.voice && voice && <Audio src={voice} />}
      {media.sfx &&
        sfx.map(([at, name, volume = 0.45], i) => (
          <Sequence key={i} from={Math.round(at)} durationInFrames={45} layout="none">
            <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
          </Sequence>
        ))}
    </>
  );

  if (!set) {
    const dip = Math.max(
      interpolate(frame, [0, 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      interpolate(frame, [durationInFrames - 7, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    );
    return (
      <AbsoluteFill>
        {audio}
        <Stage>
          {ground && <Ground />}
          {children}
          {captions && media.captions && <Captions lines={Object.values(L)} />}
          <rect width={W} height={H} fill={C.paper} opacity={dip} />
        </Stage>
      </AbsoluteFill>
    );
  }

  const cam = camAt(frame, camera, durationInFrames);
  const sh = shakeAt(frame, shake);
  // swipe: a night-blue panel with a green edge leaves to the left at the start, and comes in
  // from the right at the end, so consecutive scenes read as one continuous push
  const inT = ease(frame, 0, 14, Easing.inOut(Easing.cubic));
  const outT = ease(frame, durationInFrames - 12, 12, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      {audio}
      {background && (
        <AbsoluteFill style={{ background: NIGHT, overflow: "hidden" }}>
          <Img src={background} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transformOrigin: "0 0", transform: camCss(cam, 0.55, [sh[0] * 0.5, sh[1] * 0.5]) }} />
          {/* a light haze pushes the painting back so characters and beats stay in front */}
          <AbsoluteFill style={{ background: "rgba(255, 250, 240, 0.16)" }} />
        </AbsoluteFill>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, background: background ? "transparent" : NIGHT }}>
        {!background && (
          <g transform={camTransform(cam, 0.55, [sh[0] * 0.5, sh[1] * 0.5])}>
            <SetBg name={set} />
          </g>
        )}
        <g transform={camTransform(cam, 1, sh)}>{children}</g>
        {overlay}
        {captions && media.captions && <KaraokeCaptions lines={Object.values(L)} />}
        {inT < 1 && (
          <g transform={`translate(${-inT * (W + 200)} 0)`}>
            <rect x={-100} width={W + 100} height={H} fill={NIGHT} />
            <rect x={W} width={60} height={H} fill={C.green} />
          </g>
        )}
        {outT > 0 && (
          <g transform={`translate(${(1 - outT) * (W + 200)} 0)`}>
            <rect x={-60} width={60} height={H} fill={C.green} />
            <rect width={W + 100} height={H} fill={NIGHT} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Big bold captions with the word being spoken highlighted, two lines at most. Word timing is
 * estimated from character length within the line (the voice engine gives line timings only).
 */
export const KaraokeCaptions: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const line = lines.find((l) => frame >= l.start && frame < l.end + 6);
  if (!line) return null;
  const words = line.text.split(/\s+/).filter(Boolean);
  // chunks of up to 8 words, preferring to break after punctuation
  const chunks: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (cur.length >= 8 || (cur.length >= 4 && /[.,?!:;]$/.test(w))) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 3) chunks[chunks.length - 2].push(...chunks.pop()!);
  const weight = words.map((w) => w.length + 2);
  const total = weight.reduce((a, b) => a + b, 0);
  const p = (frame - line.start) / Math.max(1, line.end - line.start);
  let acc = 0;
  let wi = words.length - 1;
  for (let i = 0; i < words.length; i++) {
    acc += weight[i] / total;
    if (p < acc) {
      wi = i;
      break;
    }
  }
  const chunk = chunks.find((c) => c.includes(wi)) ?? chunks[chunks.length - 1];
  const size = 58;
  return (
    <text
      x={W / 2}
      y={1010}
      textAnchor="middle"
      fontFamily={BOLD}
      fontWeight={800}
      fontSize={size}
      stroke={NIGHT}
      strokeWidth={12}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ letterSpacing: 0.5 }}
    >
      {chunk.map((i, k) => (
        <tspan key={i} fill={i === wi ? C.gold : i < wi ? C.white : "#E8E6F2"} dx={k === 0 ? 0 : 14}>
          {words[i]}
        </tspan>
      ))}
    </text>
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
