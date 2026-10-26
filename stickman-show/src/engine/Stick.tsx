import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, lerp, rand } from "./anim";
import { C } from "./theme";

/**
 * Joint angles in degrees, measured from straight down; positive rotates toward screen-right.
 * Each limb is [upper, bend] - the lower segment's angle is upper + bend.
 * `la`/`ll` are the limbs on the left of the screen.
 */
export type Pose = {
  la: [number, number];
  ra: [number, number];
  ll: [number, number];
  rl: [number, number];
  lean: number;
  head: number;
  bob?: number;
};

export const POSES = {
  stand: { la: [-12, 8], ra: [12, -8], ll: [-7, 4], rl: [7, -4], lean: 0, head: 0 },
  relaxed: { la: [-8, 14], ra: [10, -20], ll: [-6, 3], rl: [9, -3], lean: -2, head: 3 },
  cheer: { la: [-150, -15], ra: [150, 15], ll: [-14, 6], rl: [14, -6], lean: 0, head: 0 },
  pointR: { la: [-10, 8], ra: [96, -4], ll: [-7, 4], rl: [9, -4], lean: 4, head: 4 },
  pointL: { la: [-96, 4], ra: [10, -8], ll: [-9, 4], rl: [7, -4], lean: -4, head: -4 },
  pointUpR: { la: [-10, 8], ra: [140, 8], ll: [-7, 4], rl: [9, -4], lean: 2, head: -6 },
  shrug: { la: [-40, -95], ra: [40, 95], ll: [-7, 4], rl: [7, -4], lean: 0, head: 8 },
  sad: { la: [-11, 3], ra: [11, -3], ll: [-5, 2], rl: [5, -2], lean: 6, head: 14, bob: 10 },
  think: { la: [-14, 70], ra: [28, 160], ll: [-7, 4], rl: [7, -4], lean: 0, head: -8 },
  hold: { la: [-38, -72], ra: [38, 72], ll: [-8, 4], rl: [8, -4], lean: 0, head: 0 },
  holdHigh: { la: [-70, -80], ra: [70, 80], ll: [-8, 4], rl: [8, -4], lean: 0, head: -4 },
  present: { la: [-12, 8], ra: [68, 42], ll: [-7, 4], rl: [8, -4], lean: 3, head: 5 },
  presentL: { la: [-68, -42], ra: [12, -8], ll: [-8, 4], rl: [7, -4], lean: -3, head: -5 },
  hips: { la: [-40, 95], ra: [40, -95], ll: [-10, 4], rl: [10, -4], lean: 0, head: 0 },
  shock: { la: [-130, -50], ra: [130, 50], ll: [-14, 5], rl: [14, -5], lean: -4, head: -6 },
  facepalm: { la: [-10, 6], ra: [25, 168], ll: [-7, 4], rl: [7, -4], lean: 5, head: 12, bob: 4 },
  push: { la: [-10, 8], ra: [80, 10], ll: [-25, 10], rl: [22, -8], lean: 14, head: 6 },
  sit: { la: [-20, 40], ra: [20, -40], ll: [-80, 80], rl: [80, -80], lean: 0, head: 0, bob: 62 },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
export type PoseKey = [frame: number, pose: PoseName | Pose, dur?: number];

const asPose = (p: PoseName | Pose): Pose => (typeof p === "string" ? (POSES[p] as Pose) : p);

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  la: [lerp(a.la[0], b.la[0], t), lerp(a.la[1], b.la[1], t)],
  ra: [lerp(a.ra[0], b.ra[0], t), lerp(a.ra[1], b.ra[1], t)],
  ll: [lerp(a.ll[0], b.ll[0], t), lerp(a.ll[1], b.ll[1], t)],
  rl: [lerp(a.rl[0], b.rl[0], t), lerp(a.rl[1], b.rl[1], t)],
  lean: lerp(a.lean, b.lean, t),
  head: lerp(a.head, b.head, t),
  bob: lerp(a.bob ?? 0, b.bob ?? 0, t),
});

/** Interpolate through a list of [frame, pose] keys, easing into each one. */
export const poseAt = (frame: number, keys: PoseKey[]): Pose => {
  let current = asPose(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    const [f, p, dur] = keys[i];
    if (frame < f) break;
    // blend from wherever the previous key had got to, so overlapping keys stay continuous
    current = lerpPose(current, asPose(p), ease(frame, f, dur ?? 9));
  }
  return current;
};

/** Overlay a walking or running cycle onto a pose. */
export const walking = (pose: Pose, phase: number, amount = 1, run = false): Pose => {
  const s = Math.sin(phase);
  const swing = (run ? 38 : 24) * amount;
  return {
    ...pose,
    ll: [-s * swing, Math.max(0, s) * (run ? 50 : 24) * amount],
    rl: [s * swing, -Math.max(0, -s) * (run ? 50 : 24) * amount],
    la: run ? [-25 + s * 40 * amount, -80] : [pose.la[0] + s * 18 * amount, pose.la[1]],
    ra: run ? [25 - s * 40 * amount, 80] : [pose.ra[0] - s * 18 * amount, pose.ra[1]],
    lean: pose.lean + (run ? 10 : 2) * amount,
    bob: (pose.bob ?? 0) + Math.abs(Math.cos(phase)) * (run ? 10 : 5) * amount,
  };
};

export const waving = (pose: Pose, frame: number): Pose => ({
  ...pose,
  ra: [145, 25 + Math.sin(frame * 0.45) * 28],
  head: 5,
});

export type Expr = "smile" | "grin" | "flat" | "frown" | "o" | "worried" | "smug" | "sleep";

type Props = {
  x: number;
  y: number;
  scale?: number;
  pose?: Pose;
  expr?: Expr;
  talking?: boolean;
  color?: string;
  look?: number;
  seed?: number;
  rotate?: number;
  opacity?: number;
  accessory?: "hair" | "cap" | "glasses" | "shades" | "tie" | "none";
  children?: React.ReactNode;
};

const SH = -212;
const HIP = -118;
const HEAD_R = 30;
const ARM = [56, 52];
const LEG = [62, 60];

const limb = (ox: number, oy: number, [a, b]: [number, number], [l1, l2]: number[], jx: number[]) => {
  const r = Math.PI / 180;
  const ex = ox + l1 * Math.sin(a * r) + jx[0];
  const ey = oy + l1 * Math.cos(a * r) + jx[1];
  const hx = ex + l2 * Math.sin((a + b) * r) + jx[2];
  const hy = ey + l2 * Math.cos((a + b) * r) + jx[3];
  return { d: `M ${ox} ${oy} L ${ex} ${ey} L ${hx} ${hy}`, hx, hy };
};

export const Stick: React.FC<Props> = ({
  x,
  y,
  scale = 1,
  pose = POSES.stand as Pose,
  expr = "smile",
  talking = false,
  color = C.ink,
  look = 0,
  seed = 1,
  rotate = 0,
  opacity = 1,
  accessory = "hair",
  children,
}) => {
  const frame = useCurrentFrame();
  // hand-drawn "boil": every joint shifts a hair every 4 frames
  const tick = Math.floor(frame / 4);
  const j = (i: number) => (rand(seed * 97 + tick * 13 + i) - 0.5) * 2.2;

  const bob = pose.bob ?? 0;
  const lr = (pose.lean * Math.PI) / 180;
  const hipX = 0;
  const hipY = HIP + bob;
  const shX = hipX + Math.sin(lr) * (HIP - SH) + j(1);
  const shY = SH + bob + Math.abs(Math.sin(lr)) * 4;
  const neckX = shX + Math.sin(lr) * 22;
  const neckY = shY - 22;
  const hr = ((pose.lean + pose.head) * Math.PI) / 180;
  const headX = neckX + Math.sin(hr) * HEAD_R;
  const headY = neckY - Math.cos(hr) * HEAD_R;

  const la = limb(shX, shY, pose.la, ARM, [j(2), j(3), j(4), j(5)]);
  const ra = limb(shX, shY, pose.ra, ARM, [j(6), j(7), j(8), j(9)]);
  const ll = limb(hipX, hipY, pose.ll, LEG, [j(10), j(11), j(12), j(13)]);
  const rl = limb(hipX, hipY, pose.rl, LEG, [j(14), j(15), j(16), j(17)]);

  const blinking = (frame + seed * 37) % 110 < 4;
  const mouthOpen = talking ? 2 + Math.abs(Math.sin(frame * 0.9 + seed)) * 6 * (0.6 + rand(Math.floor(frame / 3) + seed) * 0.6) : 0;
  const ex = look * 7;

  const stroke = { stroke: color, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

  const mouth = () => {
    if (talking) return <ellipse cx={ex} cy={11} rx={7} ry={mouthOpen} fill={color} />;
    switch (expr) {
      case "grin":
        return <path d={`M ${ex - 12} 6 Q ${ex} 24 ${ex + 12} 6 Z`} fill={color} />;
      case "flat":
        return <path d={`M ${ex - 9} 11 L ${ex + 9} 11`} {...stroke} strokeWidth={4} />;
      case "frown":
      case "worried":
        return <path d={`M ${ex - 10} 15 Q ${ex} 6 ${ex + 10} 15`} {...stroke} strokeWidth={4} />;
      case "o":
        return <ellipse cx={ex} cy={12} rx={6} ry={8} fill={color} />;
      case "smug":
        return <path d={`M ${ex - 9} 11 Q ${ex + 2} 15 ${ex + 11} 7`} {...stroke} strokeWidth={4} />;
      case "sleep":
        return <ellipse cx={ex} cy={12} rx={4} ry={3} fill={color} />;
      default:
        return <path d={`M ${ex - 11} 8 Q ${ex} 18 ${ex + 11} 8`} {...stroke} strokeWidth={4} />;
    }
  };

  const eyes = () => {
    if (expr === "sleep" || blinking) {
      return (
        <>
          <path d={`M ${ex - 15} -4 Q ${ex - 10} 0 ${ex - 5} -4`} {...stroke} strokeWidth={3.5} />
          <path d={`M ${ex + 5} -4 Q ${ex + 10} 0 ${ex + 15} -4`} {...stroke} strokeWidth={3.5} />
        </>
      );
    }
    const big = expr === "o" ? 1.35 : 1;
    return (
      <>
        <ellipse cx={ex - 10} cy={-4} rx={3.6 * big} ry={5.2 * big} fill={color} />
        <ellipse cx={ex + 10} cy={-4} rx={3.6 * big} ry={5.2 * big} fill={color} />
        {expr === "worried" && (
          <>
            <path d={`M ${ex - 17} -14 L ${ex - 5} -18`} {...stroke} strokeWidth={3.5} />
            <path d={`M ${ex + 5} -18 L ${ex + 17} -14`} {...stroke} strokeWidth={3.5} />
          </>
        )}
      </>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={46} ry={8} fill={C.ink} opacity={0.1 * (1 - Math.min(1, bob / 80))} />
      <path d={ll.d} {...stroke} />
      <path d={rl.d} {...stroke} />
      <path d={`M ${hipX} ${hipY} L ${shX} ${shY} L ${neckX} ${neckY}`} {...stroke} />
      <path d={la.d} {...stroke} />
      <path d={ra.d} {...stroke} />
      <g transform={`translate(${headX + j(18) * 0.5} ${headY}) rotate(${pose.head + pose.lean})`}>
        <circle r={HEAD_R} fill={C.white} stroke={color} strokeWidth={8} />
        {accessory === "hair" && (
          <path d="M -6 -29 Q -4 -46 8 -44 M 2 -30 Q 8 -42 18 -36" {...stroke} strokeWidth={5} />
        )}
        {accessory === "cap" && (
          <path d="M -30 -10 Q -28 -40 0 -40 Q 28 -40 30 -10 Z M 20 -12 L 48 -10" fill={color} stroke={color} strokeWidth={5} strokeLinejoin="round" />
        )}
        {eyes()}
        {accessory === "glasses" && (
          <g {...stroke} strokeWidth={3}>
            <circle cx={ex - 10} cy={-4} r={9} />
            <circle cx={ex + 10} cy={-4} r={9} />
            <path d={`M ${ex - 1} -4 L ${ex + 1} -4`} />
          </g>
        )}
        {accessory === "shades" && (
          <>
            <path d={`M ${ex - 22} -10 L ${ex + 22} -10 L ${ex + 18} 2 L ${ex + 3} 2 L ${ex} -5 L ${ex - 3} 2 L ${ex - 18} 2 Z`} fill={color} />
            <path d="M -32 -12 Q 0 -60 32 -12 Z" fill={color} />
            <path d="M -44 -14 L 44 -14" stroke={color} strokeWidth={6} strokeLinecap="round" />
          </>
        )}
        {mouth()}
      </g>
      {accessory === "tie" && (
        <path
          d={`M ${neckX} ${neckY + 6} L ${neckX - 7} ${neckY + 16} L ${(neckX + shX) / 2} ${shY + 40} L ${neckX + 7} ${neckY + 16} Z`}
          fill={C.red}
        />
      )}
      {/* drawn in the figure's own space - use hands(pose) to put a prop in a hand */}
      {children}
    </g>
  );
};

/** Where the hands end up for a pose, in the figure's own (unscaled) space. */
export const hands = (pose: Pose) => {
  const bob = pose.bob ?? 0;
  const lr = (pose.lean * Math.PI) / 180;
  const shX = Math.sin(lr) * (HIP - SH);
  const shY = SH + bob + Math.abs(Math.sin(lr)) * 4;
  const la = limb(shX, shY, pose.la, ARM, [0, 0, 0, 0]);
  const ra = limb(shX, shY, pose.ra, ARM, [0, 0, 0, 0]);
  return { l: [la.hx, la.hy], r: [ra.hx, ra.hy] };
};
