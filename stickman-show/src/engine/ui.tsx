import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, pop, rand } from "./anim";
import { C, DISPLAY, GROUND, H, HAND, W } from "./theme";

/** The whole frame is one SVG in 1920x1080 space. */
export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.paper }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, background: bg }}>
    <defs>
      <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
        <stop offset="60%" stopColor={C.paperDark} stopOpacity={0} />
        <stop offset="100%" stopColor={C.paperDark} stopOpacity={0.85} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#vignette)" />
    {children}
  </svg>
);

/** A slightly wobbly hand-drawn ground line. */
export const Ground: React.FC<{ y?: number; opacity?: number }> = ({ y = GROUND, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const t = Math.floor(frame / 4);
  const pts = Array.from({ length: 13 }, (_, i) => `${i * 160} ${y + (rand(i * 3 + t) - 0.5) * 3}`);
  return <path d={`M -20 ${y} L ${pts.join(" L ")} L ${W + 20} ${y}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={opacity} />;
};

/** Pops a group into place around its own (cx, cy). */
export const Pop: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; out?: number; rotate?: number }> = ({
  at,
  x,
  y,
  children,
  out,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  const o = out === undefined ? 1 : 1 - ease(frame, out, 8);
  if (frame < at) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0, s) * o + (1 - o) * 0.6}) rotate(${rotate})`} opacity={Math.min(1, s * 2) * o}>
      {children}
    </g>
  );
};

/** Slides a group in from an offset. */
export const Slide: React.FC<{ at: number; from: [number, number]; x?: number; y?: number; dur?: number; out?: number; children: React.ReactNode }> = ({
  at,
  from,
  x = 0,
  y = 0,
  dur = 18,
  out,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, dur);
  const o = out === undefined ? 1 : 1 - ease(frame, out, 10);
  if (frame < at) return null;
  return (
    <g transform={`translate(${x + from[0] * (1 - t)} ${y + from[1] * (1 - t)})`} opacity={t * o}>
      {children}
    </g>
  );
};

type TextProps = {
  x: number;
  y: number;
  size?: number;
  color?: string;
  font?: "hand" | "display";
  anchor?: "start" | "middle" | "end";
  children: React.ReactNode;
  opacity?: number;
  rotate?: number;
  weight?: number;
};

export const Txt: React.FC<TextProps> = ({ x, y, size = 56, color = C.ink, font = "hand", anchor = "middle", children, opacity = 1, rotate = 0, weight }) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fill={color}
    fontFamily={font === "display" ? DISPLAY : HAND}
    textAnchor={anchor}
    dominantBaseline="middle"
    opacity={opacity}
    fontWeight={weight}
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    style={{ letterSpacing: font === "display" ? 2 : 0 }}
  >
    {children}
  </text>
);

/** Text on a rounded paper tag. Width is estimated from the character count. */
export const Tag: React.FC<{ x: number; y: number; text: string; size?: number; fill?: string; color?: string; rotate?: number; font?: "hand" | "display" }> = ({
  x,
  y,
  text,
  size = 44,
  fill = C.white,
  color = C.ink,
  rotate = 0,
  font = "hand",
}) => {
  const w = text.length * size * (font === "display" ? 0.62 : 0.48) + size * 1.1;
  const h = size * 1.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-w / 2 + 6} y={-h / 2 + 7} width={w} height={h} rx={16} fill={C.ink} opacity={0.15} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={fill} stroke={C.ink} strokeWidth={5} />
      <Txt x={0} y={size * 0.06} size={size} color={color} font={font}>
        {text}
      </Txt>
    </g>
  );
};

/** A red rubber stamp that slams in. */
export const Stamp: React.FC<{ at: number; x: number; y: number; text: string; size?: number; color?: string; rotate?: number; out?: number }> = ({
  at,
  x,
  y,
  text,
  size = 80,
  color = C.red,
  rotate = -8,
  out,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = ease(frame, at, 7);
  const s = 2.2 - 1.2 * t;
  const o = out === undefined ? 1 : 1 - ease(frame, out, 8);
  const w = text.length * size * 0.62 + size;
  const h = size * 1.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`} opacity={t * o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={C.paper} fillOpacity={0.85} stroke={color} strokeWidth={10} />
      <Txt x={0} y={size * 0.08} size={size} color={color} font="display">
        {text}
      </Txt>
    </g>
  );
};

/** A path that draws itself on from `at`. */
export const Draw: React.FC<{ at: number; dur?: number; d: string; color?: string; width?: number; fill?: string; out?: number; dash?: boolean }> = ({
  at,
  dur = 18,
  d,
  color = C.ink,
  width = 7,
  fill = "none",
  out,
}) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, dur);
  const o = out === undefined ? 1 : 1 - ease(frame, out, 8);
  if (frame < at) return null;
  return (
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} stroke={color} strokeWidth={width} fill={fill} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
  );
};

/** A hand-drawn arrow from (x1,y1) to (x2,y2) with a little bend. */
export const Arrow: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number; bend?: number; color?: string; width?: number; out?: number }> = ({
  at,
  x1,
  y1,
  x2,
  y2,
  bend = 40,
  color = C.ink,
  width = 7,
  out,
}) => {
  const frame = useCurrentFrame();
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const head = 26;
  const headT = ease(frame, at + 14, 6);
  const o = out === undefined ? 1 : 1 - ease(frame, out, 8);
  if (frame < at) return null;
  return (
    <g opacity={o}>
      <Draw at={at} dur={16} d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} color={color} width={width} />
      <path
        d={`M ${x2 - head * Math.cos(ang - 0.5)} ${y2 - head * Math.sin(ang - 0.5)} L ${x2} ${y2} L ${x2 - head * Math.cos(ang + 0.5)} ${y2 - head * Math.sin(ang + 0.5)}`}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={headT}
      />
    </g>
  );
};

/** A big red X drawn over something. */
export const CrossOut: React.FC<{ at: number; x: number; y: number; size?: number }> = ({ at, x, y, size = 90 }) => (
  <g>
    <Draw at={at} dur={7} d={`M ${x - size} ${y - size} L ${x + size} ${y + size}`} color={C.red} width={14} />
    <Draw at={at + 5} dur={7} d={`M ${x + size} ${y - size} L ${x - size} ${y + size}`} color={C.red} width={14} />
  </g>
);

/** Section title card: a big numbered badge with the move's name. */
export const TitleCard: React.FC<{ n?: number; title: string; sub?: string; start: number; end: number; color?: string }> = ({
  n,
  title,
  sub,
  start,
  end,
  color = C.green,
}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end + 12) return null;
  const s = pop(frame, start);
  const t = ease(frame, start + 6, 16);
  const o = 1 - ease(frame, end, 12);
  return (
    <g opacity={o}>
      <rect width={W} height={H} fill={C.paper} opacity={0.9} />
      {n !== undefined && n > 0 && (
      <g transform={`translate(${W / 2} 400) scale(${s}) rotate(${(1 - Math.min(1, s)) * -30})`}>
        <circle r={150} fill={C.ink} opacity={0.15} cx={10} cy={12} />
        <circle r={150} fill={color} stroke={C.ink} strokeWidth={10} />
        <Txt x={0} y={14} size={190} color={C.white} font="display">
          {n}
        </Txt>
      </g>
      )}
      <g transform={`translate(0 ${(1 - t) * 60 + (n ? 0 : -160)})`} opacity={t}>
        <Txt x={W / 2} y={680} size={110} font="display">
          {title}
        </Txt>
        {sub && (
          <Txt x={W / 2} y={790} size={54} color={C.inkSoft}>
            {sub}
          </Txt>
        )}
      </g>
    </g>
  );
};

/** Burned-in subtitles at the bottom, showing whichever line is being spoken. */
export const Captions: React.FC<{ lines: { text: string; start: number; end: number }[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const line = lines.find((l) => frame >= l.start && frame < l.end + 6);
  if (!line) return null;
  // break long lines into chunks of ~7 words and show the chunk being spoken
  const words = line.text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 7) chunks.push(words.slice(i, i + 7).join(" "));
  if (chunks.length > 1 && chunks[chunks.length - 1].split(" ").length < 3) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1] += " " + last;
  }
  const weights = chunks.map((c) => c.length);
  const total = weights.reduce((a, b) => a + b, 0);
  const p = (frame - line.start) / Math.max(1, line.end - line.start);
  let acc = 0;
  let idx = chunks.length - 1;
  for (let i = 0; i < chunks.length; i++) {
    acc += weights[i] / total;
    if (p < acc) {
      idx = i;
      break;
    }
  }
  const text = chunks[idx];
  const size = 46;
  const w = text.length * size * 0.45 + 60;
  return (
    <g>
      <rect x={W / 2 - w / 2} y={968} width={w} height={70} rx={18} fill={C.ink} opacity={0.82} />
      <Txt x={W / 2} y={1005} size={size} color={C.white}>
        {text}
      </Txt>
    </g>
  );
};
