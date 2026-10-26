import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, pop, rand } from "./anim";
import { ICONS } from "./icons.generated";

/**
 * A colourful Fluent Emoji illustration, centred on (x, y). `size` is its width in px.
 * Names come from `npm run icons -- search <word>`; `npm run icons -- sync` bundles them.
 */
export const Icon: React.FC<{
  name: string;
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  opacity?: number;
  /** gentle idle bob, so a held icon never looks pasted on */
  float?: boolean;
  shadow?: boolean;
  seed?: number;
}> = ({ name, x, y, size = 160, rotate = 0, opacity = 1, float = false, shadow = true, seed = 0 }) => {
  const frame = useCurrentFrame();
  const icon = ICONS[name];
  if (!icon) throw new Error(`icon "${name}" is not bundled - run: npm run icons -- sync (search: npm run icons -- search <word>)`);
  const bob = float ? Math.sin(frame * 0.07 + seed * 1.7) * size * 0.04 : 0;
  const tilt = float ? Math.sin(frame * 0.05 + seed) * 3 : 0;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rotate + tilt})`} opacity={opacity}>
      {shadow && <ellipse cx={0} cy={size * 0.55 - bob} rx={size * 0.34} ry={size * 0.06} fill="#000" opacity={0.12} />}
      <svg x={-size / 2} y={-size / 2} width={size} height={size} viewBox={icon.box} overflow="visible">
        <g dangerouslySetInnerHTML={{ __html: icon.body }} />
      </svg>
    </g>
  );
};

/** An icon that pops in at `at` (frames) with a springy overshoot. */
export const PopIcon: React.FC<React.ComponentProps<typeof Icon> & { at: number }> = ({ at, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = pop(frame, at);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${Math.max(0, s)}) translate(${-p.x} ${-p.y})`}>
      <Icon {...p} />
    </g>
  );
};

/** A burst of particles from (x, y) starting at `at`: coins, confetti or sparkles. */
export const Burst: React.FC<{ at: number; x: number; y: number; kind?: "coins" | "confetti" | "sparkle"; n?: number; spread?: number }> = ({
  at,
  x,
  y,
  kind = "confetti",
  n = 18,
  spread = 420,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 60) return null;
  const colors = ["#2E9E5B", "#E0503A", "#3B6FD8", "#F2B33D", "#B05AD8"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = rand(i * 7 + at) * Math.PI * 2;
        const v = (0.5 + rand(i * 13 + at)) * spread;
        const k = ease(frame, at, 50, (q) => 1 - Math.pow(1 - q, 3));
        const px = x + Math.cos(a) * v * k;
        const py = y + Math.sin(a) * v * k * 0.7 + t * t * 0.12;
        const o = 1 - ease(frame, at + 35, 25);
        if (kind === "coins") return <Icon key={i} name="coin" x={px} y={py} size={54} rotate={t * 12 + i * 40} opacity={o} shadow={false} />;
        if (kind === "sparkle")
          return <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" transform={`translate(${px} ${py}) scale(${1 - k * 0.5})`} fill="#F2B33D" opacity={o} />;
        return <rect key={i} x={px - 8} y={py - 5} width={16} height={10} rx={2} fill={colors[i % colors.length]} transform={`rotate(${t * 15 + i * 30} ${px} ${py})`} opacity={o} />;
      })}
    </g>
  );
};
